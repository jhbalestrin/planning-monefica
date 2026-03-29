import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import type {
  AccessTokenPayload,
  BookingClosureReasonCode,
  BookingQueueItemDto,
  BookingState,
  BookingSummaryDto,
  ConsultantAvailabilityBlockDto,
  ConsultantCalendarSummaryDto,
  EmployeeBookableSlotDto,
  FreeSlotIntervalDto,
} from '@planning-monefica/shared-types';
import { AuthErrorCodes, SchedulingErrorCodes } from '@planning-monefica/shared-types';
import { Model, Types } from 'mongoose';
import {
  PlatformUserLookupService,
  type ConsultantSchedulingScope,
} from '../auth/platform-user-lookup.service';
import { subtractIntervals } from './interval.util';
import { isMongoDuplicateKeyError } from './mongo-duplicate.util';
import { Booking } from './schemas/booking.schema';
import { ConsultantAvailabilityBlock } from './schemas/consultant-availability-block.schema';
import { SchedulingBookingAudit } from './schemas/scheduling-booking-audit.schema';
import { SchedulingIdempotency } from './schemas/scheduling-idempotency.schema';

type BookingLeanDoc = {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  employeeUserId: Types.ObjectId;
  consultantId: Types.ObjectId;
  slotStartUtc: Date;
  slotEndUtc: Date;
  state: BookingState;
  awaitingAssignment?: boolean;
  assignedConsultantId?: Types.ObjectId | null;
  closureReasonCode?: BookingClosureReasonCode | null;
};

@Injectable()
export class SchedulingService {
  constructor(
    @InjectModel(ConsultantAvailabilityBlock.name)
    private readonly availabilityModel: Model<ConsultantAvailabilityBlock>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<Booking>,
    @InjectModel(SchedulingIdempotency.name)
    private readonly idempotencyModel: Model<SchedulingIdempotency>,
    @InjectModel(SchedulingBookingAudit.name)
    private readonly bookingAuditModel: Model<SchedulingBookingAudit>,
    private readonly platformUserLookup: PlatformUserLookupService,
    private readonly config: ConfigService,
  ) {}

  private consultantIdFromPayload(user: AccessTokenPayload): Types.ObjectId {
    return new Types.ObjectId(user.sub);
  }

  private employeeIdFromPayload(user: AccessTokenPayload): Types.ObjectId {
    if (user.principalType !== 'tenant_user') {
      throw new ForbiddenException({
        message: 'Tenant user required.',
        code: AuthErrorCodes.WRONG_PRINCIPAL_TYPE,
      });
    }
    return new Types.ObjectId(user.sub);
  }

  private maxSlotQueryRangeDays(): number {
    return Number(this.config.get('SCHED_SLOT_QUERY_MAX_DAYS') ?? 31);
  }

  private modifyMinHoursBeforeSlot(): number {
    return Number(this.config.get('SCHED_BOOKING_MODIFY_MIN_HOURS_BEFORE') ?? 24);
  }

  private assertRangeWithinMaxDays(from: Date, to: Date): void {
    const maxMs = this.maxSlotQueryRangeDays() * 24 * 60 * 60 * 1000;
    if (to.getTime() - from.getTime() > maxMs) {
      throw new BadRequestException({
        message: `Date range must be at most ${this.maxSlotQueryRangeDays()} days.`,
        code: SchedulingErrorCodes.RANGE_EXCEEDS_MAX,
      });
    }
  }

  private assertMayModifyConfirmedBooking(slotStart: Date, nowMs: number = Date.now()): void {
    if (nowMs >= slotStart.getTime()) {
      throw new ForbiddenException({
        message: 'This session is no longer modifiable.',
        code: SchedulingErrorCodes.BOOKING_NOT_CANCELLABLE,
      });
    }
    const msBefore = this.modifyMinHoursBeforeSlot() * 60 * 60 * 1000;
    if (nowMs >= slotStart.getTime() - msBefore) {
      throw new ForbiddenException({
        message: 'Change deadline has passed for this session.',
        code: SchedulingErrorCodes.BOOKING_NOT_CANCELLABLE,
      });
    }
  }

  private bookingToSummaryDto(row: BookingLeanDoc): BookingSummaryDto {
    const awaitingAssignment = row.awaitingAssignment === true;
    const assigned =
      row.assignedConsultantId != null ? String(row.assignedConsultantId) : null;
    return {
      id: String(row._id),
      tenantId: String(row.tenantId),
      employeeUserId: String(row.employeeUserId),
      consultantId: String(row.consultantId),
      slotStartUtc: (row.slotStartUtc as Date).toISOString(),
      slotEndUtc: (row.slotEndUtc as Date).toISOString(),
      state: row.state,
      awaitingAssignment,
      assignedConsultantId: assigned,
      closureReasonCode: row.closureReasonCode ?? null,
    };
  }

  private assertClosureReasonMatchesOutcome(
    outcome: 'completed' | 'cancelled' | 'no_show',
    reasonCode: BookingClosureReasonCode,
  ): void {
    const allowed: Record<
      'completed' | 'cancelled' | 'no_show',
      readonly BookingClosureReasonCode[]
    > = {
      completed: ['delivered_completed'],
      cancelled: ['client_cancelled', 'consultant_cancelled'],
      no_show: ['no_show_employee', 'no_show_other'],
    };
    if (!allowed[outcome].includes(reasonCode)) {
      throw new BadRequestException({
        message: 'Reason does not match outcome.',
        code: SchedulingErrorCodes.INVALID_CLOSURE_REASON,
      });
    }
  }

  private async writeBookingAudit(params: {
    bookingId: Types.ObjectId;
    tenantId: Types.ObjectId;
    actorSub: string;
    action: 'booking_assigned' | 'booking_closed';
    outcome?: string;
    reasonCode?: string;
  }): Promise<void> {
    await this.bookingAuditModel.create({
      bookingId: params.bookingId,
      tenantId: params.tenantId,
      actorSub: params.actorSub,
      action: params.action,
      outcome: params.outcome,
      reasonCode: params.reasonCode,
    });
  }

  private async assertIntervalBookable(
    consultantId: Types.ObjectId,
    tenantId: Types.ObjectId,
    slotStart: Date,
    slotEnd: Date,
    options?: { ignoreBookingId?: Types.ObjectId },
  ): Promise<void> {
    if (slotStart.getTime() >= slotEnd.getTime()) {
      throw new BadRequestException({
        message: 'Slot end must be after start.',
        code: SchedulingErrorCodes.BOOKING_SLOT_INVALID,
      });
    }
    const block = await this.availabilityModel
      .findOne({
        consultantId,
        tenantId,
        startUtc: { $lte: slotStart },
        endUtc: { $gte: slotEnd },
      })
      .lean()
      .exec();
    if (!block) {
      throw new BadRequestException({
        message: 'Slot is not within published availability.',
        code: SchedulingErrorCodes.BOOKING_SLOT_INVALID,
      });
    }
    const clashFilter: Record<string, unknown> = {
      consultantId,
      tenantId,
      state: 'confirmed',
      slotStartUtc: { $lt: slotEnd },
      slotEndUtc: { $gt: slotStart },
    };
    if (options?.ignoreBookingId) {
      clashFilter._id = { $ne: options.ignoreBookingId };
    }
    const clash = await this.bookingModel.findOne(clashFilter).lean().exec();
    if (clash) {
      throw new ConflictException({
        message: 'That time was just reserved.',
        code: SchedulingErrorCodes.SLOT_TAKEN,
      });
    }
  }

  private createIdempotencyCompoundKey(
    operation: string,
    tenantId: Types.ObjectId,
    employeeId: Types.ObjectId,
    clientKey: string,
    bookingId?: Types.ObjectId,
  ): string {
    const bk = bookingId ? `:${bookingId.toHexString()}` : '';
    return `scheduling:${operation}:${tenantId.toHexString()}:${employeeId.toHexString()}${bk}:${clientKey}`;
  }

  private parseOrderedRange(
    startIso: string,
    endIso: string,
    code = SchedulingErrorCodes.INVALID_RANGE,
  ): { start: Date; end: Date } {
    const start = new Date(startIso);
    const end = new Date(endIso);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException({
        message: 'Invalid ISO-8601 instant.',
        code,
      });
    }
    if (start.getTime() >= end.getTime()) {
      throw new BadRequestException({
        message: 'Range end must be after start.',
        code,
      });
    }
    return { start, end };
  }

  private assertRangeQueryPair(
    fromUtc?: string,
    toUtc?: string,
  ): { from: Date; to: Date } | null {
    const hasFrom = fromUtc != null && fromUtc !== '';
    const hasTo = toUtc != null && toUtc !== '';
    if (hasFrom !== hasTo) {
      throw new BadRequestException({
        message: 'fromUtc and toUtc must both be set or both omitted.',
        code: SchedulingErrorCodes.INVALID_RANGE,
      });
    }
    if (!hasFrom || !hasTo) {
      return null;
    }
    const { start, end } = this.parseOrderedRange(fromUtc, toUtc);
    return { from: start, to: end };
  }

  private async loadActiveConsultantScope(
    consultantId: Types.ObjectId,
  ): Promise<ConsultantSchedulingScope> {
    const scope = await this.platformUserLookup.getConsultantSchedulingScope(
      consultantId,
    );
    if (!scope || !scope.active) {
      throw new ForbiddenException({
        message: 'Consultant account not found or inactive.',
        code: SchedulingErrorCodes.TENANT_NOT_IN_CONSULTANT_SCOPE,
      });
    }
    if (!scope.roles.includes('planning_consultant')) {
      throw new ForbiddenException({
        message: 'Not a planning consultant.',
        code: SchedulingErrorCodes.TENANT_NOT_IN_CONSULTANT_SCOPE,
      });
    }
    return scope;
  }

  private assertTenantInScope(
    scope: ConsultantSchedulingScope,
    tenantId: Types.ObjectId,
  ): void {
    if (
      !this.platformUserLookup.assertTenantAllowedForConsultant(scope, tenantId)
    ) {
      throw new ForbiddenException({
        message: 'Consultant is not assigned to this tenant.',
        code: SchedulingErrorCodes.TENANT_NOT_IN_CONSULTANT_SCOPE,
      });
    }
  }

  private overlapFilter(consultantId: Types.ObjectId, start: Date, end: Date) {
    return {
      consultantId,
      startUtc: { $lt: end },
      endUtc: { $gt: start },
    };
  }

  async createAvailabilityBlock(
    user: AccessTokenPayload,
    tenantIdStr: string,
    startIso: string,
    endIso: string,
  ): Promise<ConsultantAvailabilityBlockDto> {
    const consultantId = this.consultantIdFromPayload(user);
    const scope = await this.loadActiveConsultantScope(consultantId);
    const tenantId = new Types.ObjectId(tenantIdStr);
    this.assertTenantInScope(scope, tenantId);
    const { start, end } = this.parseOrderedRange(startIso, endIso);

    const clash = await this.availabilityModel
      .findOne(this.overlapFilter(consultantId, start, end))
      .lean()
      .exec();
    if (clash) {
      throw new ConflictException({
        message: 'Availability window overlaps an existing block.',
        code: SchedulingErrorCodes.AVAILABILITY_OVERLAP,
      });
    }

    const created = await this.availabilityModel.create({
      consultantId,
      tenantId,
      startUtc: start,
      endUtc: end,
    });
    return this.toAvailabilityDto(created);
  }

  async listMyAvailabilityBlocks(
    user: AccessTokenPayload,
    fromUtc?: string,
    toUtc?: string,
  ): Promise<ConsultantAvailabilityBlockDto[]> {
    const consultantId = this.consultantIdFromPayload(user);
    await this.loadActiveConsultantScope(consultantId);
    const range = this.assertRangeQueryPair(fromUtc, toUtc);
    const q: Record<string, unknown> = { consultantId };
    if (range) {
      q.startUtc = { $lt: range.to };
      q.endUtc = { $gt: range.from };
    }
    const rows = await this.availabilityModel
      .find(q)
      .sort({ startUtc: 1 })
      .lean()
      .exec();
    return rows.map((r) => this.toAvailabilityDto(r));
  }

  async updateAvailabilityBlock(
    user: AccessTokenPayload,
    blockIdStr: string,
    patch: { tenantId?: string; startUtc?: string; endUtc?: string },
  ): Promise<ConsultantAvailabilityBlockDto> {
    if (
      patch.tenantId === undefined &&
      patch.startUtc === undefined &&
      patch.endUtc === undefined
    ) {
      throw new BadRequestException({
        message: 'Provide at least one of tenantId, startUtc, endUtc.',
        code: SchedulingErrorCodes.INVALID_RANGE,
      });
    }
    const consultantId = this.consultantIdFromPayload(user);
    const scope = await this.loadActiveConsultantScope(consultantId);
    const blockId = new Types.ObjectId(blockIdStr);
    const existing = await this.availabilityModel
      .findOne({ _id: blockId, consultantId })
      .lean()
      .exec();
    if (!existing) {
      throw new NotFoundException({
        message: 'Availability block not found.',
        code: SchedulingErrorCodes.BLOCK_NOT_FOUND,
      });
    }

    const nextTenantId = patch.tenantId
      ? new Types.ObjectId(patch.tenantId)
      : (existing.tenantId as Types.ObjectId);
    this.assertTenantInScope(scope, nextTenantId);

    const start = patch.startUtc
      ? new Date(patch.startUtc)
      : (existing.startUtc as Date);
    const end = patch.endUtc ? new Date(patch.endUtc) : (existing.endUtc as Date);
    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start.getTime() >= end.getTime()
    ) {
      throw new BadRequestException({
        message: 'Invalid availability window.',
        code: SchedulingErrorCodes.INVALID_RANGE,
      });
    }

    const clash = await this.availabilityModel
      .findOne({
        ...this.overlapFilter(consultantId, start, end),
        _id: { $ne: blockId },
      })
      .lean()
      .exec();
    if (clash) {
      throw new ConflictException({
        message: 'Availability window overlaps an existing block.',
        code: SchedulingErrorCodes.AVAILABILITY_OVERLAP,
      });
    }

    const updated = await this.availabilityModel
      .findOneAndUpdate(
        { _id: blockId, consultantId },
        {
          $set: {
            tenantId: nextTenantId,
            startUtc: start,
            endUtc: end,
          },
        },
        { new: true },
      )
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException({
        message: 'Availability block not found.',
        code: SchedulingErrorCodes.BLOCK_NOT_FOUND,
      });
    }
    return this.toAvailabilityDto(updated);
  }

  async deleteAvailabilityBlock(
    user: AccessTokenPayload,
    blockIdStr: string,
  ): Promise<void> {
    const consultantId = this.consultantIdFromPayload(user);
    await this.loadActiveConsultantScope(consultantId);
    const blockId = new Types.ObjectId(blockIdStr);
    const res = await this.availabilityModel.deleteOne({
      _id: blockId,
      consultantId,
    });
    if (res.deletedCount === 0) {
      throw new NotFoundException({
        message: 'Availability block not found.',
        code: SchedulingErrorCodes.BLOCK_NOT_FOUND,
      });
    }
  }

  async listFreeSlotsForTenant(
    user: AccessTokenPayload,
    tenantIdStr: string,
    fromIso: string,
    toIso: string,
  ): Promise<FreeSlotIntervalDto[]> {
    const consultantId = this.consultantIdFromPayload(user);
    const scope = await this.loadActiveConsultantScope(consultantId);
    const tenantId = new Types.ObjectId(tenantIdStr);
    this.assertTenantInScope(scope, tenantId);
    const { start: winStart, end: winEnd } = this.parseOrderedRange(fromIso, toIso);

    const blocks = await this.availabilityModel
      .find({
        consultantId,
        tenantId,
        startUtc: { $lt: winEnd },
        endUtc: { $gt: winStart },
      })
      .sort({ startUtc: 1 })
      .lean()
      .exec();

    const bookings = await this.bookingModel
      .find({
        consultantId,
        tenantId,
        state: 'confirmed',
        slotStartUtc: { $lt: winEnd },
        slotEndUtc: { $gt: winStart },
      })
      .sort({ slotStartUtc: 1 })
      .lean()
      .exec();

    const out: FreeSlotIntervalDto[] = [];
    for (const b of blocks) {
      const bs = b.startUtc as Date;
      const be = b.endUtc as Date;
      const segStart = Math.max(bs.getTime(), winStart.getTime());
      const segEnd = Math.min(be.getTime(), winEnd.getTime());
      if (segStart >= segEnd) {
        continue;
      }
      const cuts = bookings
        .filter((bk) => (bk.tenantId as Types.ObjectId).equals(tenantId))
        .map((bk) => ({
          startMs: (bk.slotStartUtc as Date).getTime(),
          endMs: (bk.slotEndUtc as Date).getTime(),
        }));
      const free = subtractIntervals(segStart, segEnd, cuts);
      for (const f of free) {
        out.push({
          startUtc: new Date(f.startMs).toISOString(),
          endUtc: new Date(f.endMs).toISOString(),
        });
      }
    }
    out.sort((a, b) => a.startUtc.localeCompare(b.startUtc));
    return out;
  }

  async getMyCalendarSummary(
    user: AccessTokenPayload,
    fromIso: string,
    toIso: string,
  ): Promise<ConsultantCalendarSummaryDto> {
    const consultantId = this.consultantIdFromPayload(user);
    const scope = await this.loadActiveConsultantScope(consultantId);
    const { start: winStart, end: winEnd } = this.parseOrderedRange(fromIso, toIso);

    const blockDocs = await this.availabilityModel
      .find({
        consultantId,
        startUtc: { $lt: winEnd },
        endUtc: { $gt: winStart },
      })
      .sort({ startUtc: 1 })
      .lean()
      .exec();

    const allowedTenant = (tid: Types.ObjectId) =>
      this.platformUserLookup.assertTenantAllowedForConsultant(scope, tid);

    const availability = blockDocs
      .filter((b) => allowedTenant(b.tenantId as Types.ObjectId))
      .map((b) => this.toAvailabilityDto(b));

    const bookingDocs = await this.bookingModel
      .find({
        consultantId,
        slotStartUtc: { $lt: winEnd },
        slotEndUtc: { $gt: winStart },
        state: 'confirmed',
      })
      .sort({ slotStartUtc: 1 })
      .lean()
      .exec();

    const bookings: BookingSummaryDto[] = bookingDocs
      .filter((bk) => allowedTenant(bk.tenantId as Types.ObjectId))
      .map((bk) => this.bookingToSummaryDto(bk as BookingLeanDoc));

    return {
      fromUtc: winStart.toISOString(),
      toUtc: winEnd.toISOString(),
      availability,
      bookings,
    };
  }

  /** SCHED-FR4 — all consultants with availability for tenant in range. */
  async listBookableSlotsForCollaborator(
    tenantId: Types.ObjectId,
    fromIso: string,
    toIso: string,
  ): Promise<EmployeeBookableSlotDto[]> {
    const { start: winStart, end: winEnd } = this.parseOrderedRange(
      fromIso,
      toIso,
      SchedulingErrorCodes.INVALID_RANGE,
    );
    this.assertRangeWithinMaxDays(winStart, winEnd);

    const blocks = await this.availabilityModel
      .find({
        tenantId,
        startUtc: { $lt: winEnd },
        endUtc: { $gt: winStart },
      })
      .sort({ consultantId: 1, startUtc: 1 })
      .lean()
      .exec();

    const bookings = await this.bookingModel
      .find({
        tenantId,
        state: 'confirmed',
        slotStartUtc: { $lt: winEnd },
        slotEndUtc: { $gt: winStart },
      })
      .sort({ consultantId: 1, slotStartUtc: 1 })
      .lean()
      .exec();

    const byConsultant = new Map<string, typeof bookings>();
    for (const bk of bookings) {
      const k = String(bk.consultantId);
      if (!byConsultant.has(k)) {
        byConsultant.set(k, []);
      }
      byConsultant.get(k)!.push(bk);
    }

    const out: EmployeeBookableSlotDto[] = [];
    for (const b of blocks) {
      const cid = b.consultantId as Types.ObjectId;
      const cBookings = byConsultant.get(String(cid)) ?? [];
      const bs = b.startUtc as Date;
      const be = b.endUtc as Date;
      const segStart = Math.max(bs.getTime(), winStart.getTime());
      const segEnd = Math.min(be.getTime(), winEnd.getTime());
      if (segStart >= segEnd) {
        continue;
      }
      const cuts = cBookings.map((bk) => ({
        startMs: (bk.slotStartUtc as Date).getTime(),
        endMs: (bk.slotEndUtc as Date).getTime(),
      }));
      const free = subtractIntervals(segStart, segEnd, cuts);
      for (const f of free) {
        out.push({
          consultantId: String(cid),
          tenantId: String(tenantId),
          startUtc: new Date(f.startMs).toISOString(),
          endUtc: new Date(f.endMs).toISOString(),
        });
      }
    }
    out.sort(
      (a, b) =>
        a.startUtc.localeCompare(b.startUtc) || a.consultantId.localeCompare(b.consultantId),
    );
    return out;
  }

  /** SCHED-FR5 + SCHED-NFR1 + SCHED-NFR5 */
  async createCollaboratorBooking(
    user: AccessTokenPayload,
    tenantId: Types.ObjectId,
    consultantIdStr: string,
    slotStartIso: string,
    slotEndIso: string,
    idempotencyKeyHeader?: string,
  ): Promise<BookingSummaryDto> {
    const employeeId = this.employeeIdFromPayload(user);
    const consultantId = new Types.ObjectId(consultantIdStr);
    const slotStart = new Date(slotStartIso);
    const slotEnd = new Date(slotEndIso);
    const trimmedKey = idempotencyKeyHeader?.trim();
    const compoundKey =
      trimmedKey && trimmedKey.length > 0
        ? this.createIdempotencyCompoundKey(
            'create_booking',
            tenantId,
            employeeId,
            trimmedKey,
          )
        : null;

    if (compoundKey) {
      const rec = await this.idempotencyModel.findOne({ key: compoundKey }).lean().exec();
      if (rec?.bookingId) {
        const prior = await this.bookingModel.findById(rec.bookingId).lean().exec();
        if (prior) {
          return this.bookingToSummaryDto(prior as BookingLeanDoc);
        }
      }
    }

    await this.assertIntervalBookable(consultantId, tenantId, slotStart, slotEnd);

    try {
      const created = await this.bookingModel.create({
        tenantId,
        employeeUserId: employeeId,
        consultantId,
        slotStartUtc: slotStart,
        slotEndUtc: slotEnd,
        state: 'confirmed',
        awaitingAssignment: true,
        assignedConsultantId: null,
      });
      if (compoundKey) {
        try {
          await this.idempotencyModel.create({
            key: compoundKey,
            tenantId,
            employeeUserId: employeeId,
            operation: 'create_booking',
            bookingId: created._id as Types.ObjectId,
          });
        } catch (e) {
          if (isMongoDuplicateKeyError(e)) {
            const rec = await this.idempotencyModel.findOne({ key: compoundKey }).lean().exec();
            if (rec?.bookingId) {
              const prior = await this.bookingModel.findById(rec.bookingId).lean().exec();
              if (prior) {
                await this.bookingModel.deleteOne({ _id: created._id });
                return this.bookingToSummaryDto(prior as BookingLeanDoc);
              }
            }
          }
          throw e;
        }
      }
      return this.bookingToSummaryDto(created as BookingLeanDoc);
    } catch (e) {
      if (isMongoDuplicateKeyError(e) && compoundKey) {
        const rec = await this.idempotencyModel.findOne({ key: compoundKey }).lean().exec();
        if (rec?.bookingId) {
          const prior = await this.bookingModel.findById(rec.bookingId).lean().exec();
          if (prior) {
            return this.bookingToSummaryDto(prior as BookingLeanDoc);
          }
        }
      }
      if (isMongoDuplicateKeyError(e)) {
        throw new ConflictException({
          message: 'That slot is no longer available.',
          code: SchedulingErrorCodes.SLOT_TAKEN,
        });
      }
      throw e;
    }
  }

  /** SCHED-FR6 */
  async listCollaboratorBookings(
    user: AccessTokenPayload,
    tenantId: Types.ObjectId,
    fromUtc?: string,
    toUtc?: string,
  ): Promise<BookingSummaryDto[]> {
    const employeeId = this.employeeIdFromPayload(user);
    const range = this.assertRangeQueryPair(fromUtc, toUtc);
    const q: Record<string, unknown> = {
      tenantId,
      employeeUserId: employeeId,
    };
    if (range) {
      q.slotStartUtc = { $lt: range.to };
      q.slotEndUtc = { $gt: range.from };
    }
    const rows = await this.bookingModel
      .find(q)
      .sort({ slotStartUtc: -1 })
      .lean()
      .exec();
    return rows.map((r) => this.bookingToSummaryDto(r as BookingLeanDoc));
  }

  async getCollaboratorBooking(
    user: AccessTokenPayload,
    tenantId: Types.ObjectId,
    bookingIdStr: string,
  ): Promise<BookingSummaryDto> {
    const employeeId = this.employeeIdFromPayload(user);
    const row = await this.bookingModel
      .findOne({
        _id: new Types.ObjectId(bookingIdStr),
        tenantId,
        employeeUserId: employeeId,
      })
      .lean()
      .exec();
    if (!row) {
      throw new NotFoundException({
        message: 'Booking not found.',
        code: SchedulingErrorCodes.BOOKING_NOT_FOUND,
      });
    }
    return this.bookingToSummaryDto(row as BookingLeanDoc);
  }

  /** SCHED-FR7 */
  async cancelCollaboratorBooking(
    user: AccessTokenPayload,
    tenantId: Types.ObjectId,
    bookingIdStr: string,
  ): Promise<BookingSummaryDto> {
    const employeeId = this.employeeIdFromPayload(user);
    const bookingId = new Types.ObjectId(bookingIdStr);
    const row = await this.bookingModel
      .findOne({
        _id: bookingId,
        tenantId,
        employeeUserId: employeeId,
        state: 'confirmed',
      })
      .lean()
      .exec();
    if (!row) {
      throw new NotFoundException({
        message: 'Booking not found or not cancellable.',
        code: SchedulingErrorCodes.BOOKING_NOT_FOUND,
      });
    }
    const slotStart = row.slotStartUtc as Date;
    this.assertMayModifyConfirmedBooking(slotStart);
    const updated = await this.bookingModel
      .findOneAndUpdate(
        { _id: bookingId, tenantId, employeeUserId: employeeId, state: 'confirmed' },
        { $set: { state: 'cancelled' } },
        { new: true },
      )
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException({
        message: 'Booking not found.',
        code: SchedulingErrorCodes.BOOKING_NOT_FOUND,
      });
    }
    return this.bookingToSummaryDto(updated as BookingLeanDoc);
  }

  /** SCHED-FR8 — cancel-then-create with restore on duplicate key. */
  async rescheduleCollaboratorBooking(
    user: AccessTokenPayload,
    tenantId: Types.ObjectId,
    bookingIdStr: string,
    consultantIdStr: string,
    slotStartIso: string,
    slotEndIso: string,
    idempotencyKeyHeader?: string,
  ): Promise<BookingSummaryDto> {
    const employeeId = this.employeeIdFromPayload(user);
    const bookingId = new Types.ObjectId(bookingIdStr);
    const newConsultantId = new Types.ObjectId(consultantIdStr);
    const newStart = new Date(slotStartIso);
    const newEnd = new Date(slotEndIso);
    const trimmedKey = idempotencyKeyHeader?.trim();
    const compoundKey =
      trimmedKey && trimmedKey.length > 0
        ? this.createIdempotencyCompoundKey(
            'reschedule_booking',
            tenantId,
            employeeId,
            trimmedKey,
            bookingId,
          )
        : null;

    if (compoundKey) {
      const rec = await this.idempotencyModel.findOne({ key: compoundKey }).lean().exec();
      if (rec?.bookingId) {
        const prior = await this.bookingModel.findById(rec.bookingId).lean().exec();
        if (prior) {
          return this.bookingToSummaryDto(prior as BookingLeanDoc);
        }
      }
    }

    const existing = await this.bookingModel
      .findOne({
        _id: bookingId,
        tenantId,
        employeeUserId: employeeId,
        state: 'confirmed',
      })
      .lean()
      .exec();
    if (!existing) {
      throw new NotFoundException({
        message: 'Booking not found or not reschedulable.',
        code: SchedulingErrorCodes.BOOKING_NOT_FOUND,
      });
    }
    const oldStart = existing.slotStartUtc as Date;
    this.assertMayModifyConfirmedBooking(oldStart);

    const assignmentSnapshot = {
      awaitingAssignment: (existing as BookingLeanDoc).awaitingAssignment === true,
      assignedConsultantId: (existing as BookingLeanDoc).assignedConsultantId ?? null,
    };

    await this.assertIntervalBookable(newConsultantId, tenantId, newStart, newEnd, {
      ignoreBookingId: bookingId,
    });

    const cancelRes = await this.bookingModel.updateOne(
      { _id: bookingId, tenantId, employeeUserId: employeeId, state: 'confirmed' },
      { $set: { state: 'cancelled' } },
    );
    if (cancelRes.modifiedCount === 0) {
      throw new ConflictException({
        message: 'Booking changed; retry rescheduling.',
        code: SchedulingErrorCodes.SLOT_TAKEN,
      });
    }

    try {
      const created = await this.bookingModel.create({
        tenantId,
        employeeUserId: employeeId,
        consultantId: newConsultantId,
        slotStartUtc: newStart,
        slotEndUtc: newEnd,
        state: 'confirmed',
        awaitingAssignment: true,
        assignedConsultantId: null,
      });
      if (compoundKey) {
        try {
          await this.idempotencyModel.create({
            key: compoundKey,
            tenantId,
            employeeUserId: employeeId,
            operation: 'reschedule_booking',
            bookingId: created._id as Types.ObjectId,
          });
        } catch (e) {
          if (!isMongoDuplicateKeyError(e)) {
            throw e;
          }
        }
      }
      return this.bookingToSummaryDto(created as BookingLeanDoc);
    } catch (e) {
      await this.bookingModel.updateOne(
        { _id: bookingId, tenantId, employeeUserId: employeeId, state: 'cancelled' },
        {
          $set: {
            state: 'confirmed',
            awaitingAssignment: assignmentSnapshot.awaitingAssignment,
            assignedConsultantId: assignmentSnapshot.assignedConsultantId,
          },
        },
      );
      if (isMongoDuplicateKeyError(e)) {
        throw new ConflictException({
          message: 'New slot was taken; your original session is restored.',
          code: SchedulingErrorCodes.SLOT_TAKEN,
        });
      }
      throw e;
    }
  }

  /** SCHED-FR9 — unclaimed bookings, tenant-filtered (AD-SCHED-001). */
  async listAssignmentQueue(user: AccessTokenPayload): Promise<BookingQueueItemDto[]> {
    const me = this.consultantIdFromPayload(user);
    const scope = await this.loadActiveConsultantScope(me);
    const q: Record<string, unknown> = {
      state: 'confirmed',
      awaitingAssignment: true,
    };
    if (!scope.serveAllTenants) {
      q.tenantId = { $in: scope.tenantIds };
    }
    const rows = await this.bookingModel
      .find(q)
      .sort({ slotStartUtc: 1 })
      .lean()
      .exec();
    return rows
      .filter((r) =>
        this.platformUserLookup.assertTenantAllowedForConsultant(
          scope,
          r.tenantId as Types.ObjectId,
        ),
      )
      .map((r) => this.bookingToSummaryDto(r as BookingLeanDoc));
  }

  /** SCHED-FR10 + SCHED-NFR3 */
  async assignUnassignedBookingToSelf(
    user: AccessTokenPayload,
    bookingIdStr: string,
  ): Promise<BookingSummaryDto> {
    const me = this.consultantIdFromPayload(user);
    const scope = await this.loadActiveConsultantScope(me);
    const bookingId = new Types.ObjectId(bookingIdStr);
    const row = await this.bookingModel
      .findOne({
        _id: bookingId,
        state: 'confirmed',
        awaitingAssignment: true,
      })
      .lean()
      .exec();
    if (!row) {
      throw new NotFoundException({
        message: 'Booking not found or already assigned.',
        code: SchedulingErrorCodes.BOOKING_NOT_ASSIGNABLE,
      });
    }
    const tenantId = row.tenantId as Types.ObjectId;
    this.assertTenantInScope(scope, tenantId);
    const slotOwner = row.consultantId as Types.ObjectId;
    if (!slotOwner.equals(me)) {
      throw new ForbiddenException({
        message: 'Only the slot-owning consultant can claim this booking.',
        code: SchedulingErrorCodes.BOOKING_NOT_ASSIGNABLE,
      });
    }
    const updated = await this.bookingModel
      .findOneAndUpdate(
        {
          _id: bookingId,
          state: 'confirmed',
          awaitingAssignment: true,
          consultantId: me,
        },
        { $set: { awaitingAssignment: false, assignedConsultantId: me } },
        { new: true },
      )
      .lean()
      .exec();
    if (!updated) {
      throw new ConflictException({
        message: 'Another consultant claimed this booking.',
        code: SchedulingErrorCodes.ASSIGNMENT_ALREADY_CLAIMED,
      });
    }
    await this.writeBookingAudit({
      bookingId,
      tenantId,
      actorSub: user.sub,
      action: 'booking_assigned',
    });
    return this.bookingToSummaryDto(updated as BookingLeanDoc);
  }

  /** SCHED-FR11 + SCHED-NFR3 */
  async closeAssignedBookingAsConsultant(
    user: AccessTokenPayload,
    bookingIdStr: string,
    outcome: 'completed' | 'cancelled' | 'no_show',
    reasonCode: BookingClosureReasonCode,
  ): Promise<BookingSummaryDto> {
    this.assertClosureReasonMatchesOutcome(outcome, reasonCode);
    const me = this.consultantIdFromPayload(user);
    await this.loadActiveConsultantScope(me);
    const bookingId = new Types.ObjectId(bookingIdStr);
    const nextState: BookingState =
      outcome === 'completed' ? 'completed' : outcome === 'cancelled' ? 'cancelled' : 'no_show';
    const updated = await this.bookingModel
      .findOneAndUpdate(
        {
          _id: bookingId,
          state: 'confirmed',
          awaitingAssignment: false,
          assignedConsultantId: me,
        },
        {
          $set: {
            state: nextState,
            closureReasonCode: reasonCode,
          },
        },
        { new: true },
      )
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException({
        message: 'Booking not found or not closable by you.',
        code: SchedulingErrorCodes.BOOKING_NOT_CLOSABLE,
      });
    }
    await this.writeBookingAudit({
      bookingId,
      tenantId: updated.tenantId as Types.ObjectId,
      actorSub: user.sub,
      action: 'booking_closed',
      outcome,
      reasonCode,
    });
    return this.bookingToSummaryDto(updated as BookingLeanDoc);
  }

  /** Open assigned sessions this consultant can close (SCHED-FR11 UI helper). */
  async listOpenAssignedBookingsForConsultant(
    user: AccessTokenPayload,
  ): Promise<BookingSummaryDto[]> {
    const me = this.consultantIdFromPayload(user);
    const scope = await this.loadActiveConsultantScope(me);
    const q: Record<string, unknown> = {
      state: 'confirmed',
      awaitingAssignment: false,
      assignedConsultantId: me,
    };
    if (!scope.serveAllTenants) {
      q.tenantId = { $in: scope.tenantIds };
    }
    const rows = await this.bookingModel
      .find(q)
      .sort({ slotStartUtc: 1 })
      .lean()
      .exec();
    return rows
      .filter((r) =>
        this.platformUserLookup.assertTenantAllowedForConsultant(
          scope,
          r.tenantId as Types.ObjectId,
        ),
      )
      .map((r) => this.bookingToSummaryDto(r as BookingLeanDoc));
  }

  private toAvailabilityDto(row: {
    _id: Types.ObjectId;
    tenantId: Types.ObjectId;
    consultantId: Types.ObjectId;
    startUtc: Date;
    endUtc: Date;
  }): ConsultantAvailabilityBlockDto {
    return {
      id: String(row._id),
      tenantId: String(row.tenantId),
      consultantId: String(row.consultantId),
      startUtc: (row.startUtc as Date).toISOString(),
      endUtc: (row.endUtc as Date).toISOString(),
    };
  }
}
