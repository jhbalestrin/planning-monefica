import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import type { AccessTokenPayload, AuthRole } from '@planning-monefica/shared-types';
import { SchedulingErrorCodes } from '@planning-monefica/shared-types';
import { Types } from 'mongoose';
import { PlatformUserLookupService } from '../auth/platform-user-lookup.service';
import { Booking } from './schemas/booking.schema';
import { ConsultantAvailabilityBlock } from './schemas/consultant-availability-block.schema';
import { SchedulingBookingAudit } from './schemas/scheduling-booking-audit.schema';
import { SchedulingIdempotency } from './schemas/scheduling-idempotency.schema';
import { SchedulingService } from './scheduling.service';

const user = (sub: string): AccessTokenPayload => ({
  sub,
  roles: ['planning_consultant'] as AuthRole[],
  aud: 'control-pane',
  principalType: 'platform_user',
});

const collaborator = (sub: string, tenantId: string): AccessTokenPayload => ({
  sub,
  roles: ['collaborator'] as AuthRole[],
  aud: 'ic-app',
  principalType: 'tenant_user',
  tenantId,
});

describe('SchedulingService', () => {
  let service: SchedulingService;
  const findOneAvail = jest.fn();
  const findAvail = jest.fn();
  const createAvail = jest.fn();
  const findOneAndUpdateAvail = jest.fn();
  const deleteOneAvail = jest.fn();
  const findBooking = jest.fn();
  const findOneBooking = jest.fn();
  const createBooking = jest.fn();
  const findByIdBooking = jest.fn();
  const findOneAndUpdateBooking = jest.fn();
  const updateOneBooking = jest.fn();
  const deleteOneBooking = jest.fn();
  const findOneIdempotency = jest.fn();
  const createIdempotency = jest.fn();
  const createBookingAudit = jest.fn();
  const configGet = jest.fn();
  const getConsultantSchedulingScope = jest.fn();
  const assertTenantAllowedForConsultant = jest.fn(
    (
      scope: {
        serveAllTenants: boolean;
        tenantIds: Types.ObjectId[];
        active: boolean;
      },
      tenantId: Types.ObjectId,
    ) => {
      if (!scope.active) {
        return false;
      }
      if (scope.serveAllTenants) {
        return true;
      }
      return scope.tenantIds.some((id) => id.equals(tenantId));
    },
  );

  const defaultScope = {
    serveAllTenants: true,
    tenantIds: [] as Types.ObjectId[],
    roles: ['planning_consultant'] as AuthRole[],
    active: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    findOneAvail.mockReturnValue({ lean: () => ({ exec: () => Promise.resolve(null) }) });
    findAvail.mockReturnValue({
      sort: () => ({ lean: () => ({ exec: () => Promise.resolve([]) }) }),
    });
    findBooking.mockReturnValue({
      sort: () => ({ lean: () => ({ exec: () => Promise.resolve([]) }) }),
    });
    findOneBooking.mockReturnValue({ lean: () => ({ exec: () => Promise.resolve(null) }) });
    findByIdBooking.mockReturnValue({ lean: () => ({ exec: () => Promise.resolve(null) }) });
    findOneAndUpdateBooking.mockReturnValue({
      lean: () => ({ exec: () => Promise.resolve(null) }),
    });
    updateOneBooking.mockResolvedValue({ modifiedCount: 1 });
    deleteOneBooking.mockResolvedValue({});
    findOneIdempotency.mockReturnValue({ lean: () => ({ exec: () => Promise.resolve(null) }) });
    createIdempotency.mockResolvedValue({});
    createBookingAudit.mockResolvedValue({});
    configGet.mockImplementation((_k: string, def?: unknown) => def);
    findOneAndUpdateAvail.mockReturnValue({
      lean: () => ({ exec: () => Promise.resolve(null) }),
    });
    deleteOneAvail.mockResolvedValue({ deletedCount: 1 });
    getConsultantSchedulingScope.mockResolvedValue(defaultScope);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulingService,
        {
          provide: getModelToken(ConsultantAvailabilityBlock.name),
          useValue: {
            findOne: findOneAvail,
            find: findAvail,
            create: createAvail,
            findOneAndUpdate: findOneAndUpdateAvail,
            deleteOne: deleteOneAvail,
          },
        },
        {
          provide: getModelToken(Booking.name),
          useValue: {
            find: findBooking,
            findOne: findOneBooking,
            create: createBooking,
            findById: findByIdBooking,
            findOneAndUpdate: findOneAndUpdateBooking,
            updateOne: updateOneBooking,
            deleteOne: deleteOneBooking,
          },
        },
        {
          provide: getModelToken(SchedulingIdempotency.name),
          useValue: {
            findOne: findOneIdempotency,
            create: createIdempotency,
          },
        },
        {
          provide: getModelToken(SchedulingBookingAudit.name),
          useValue: { create: createBookingAudit },
        },
        {
          provide: ConfigService,
          useValue: { get: configGet },
        },
        {
          provide: PlatformUserLookupService,
          useValue: {
            getConsultantSchedulingScope,
            assertTenantAllowedForConsultant,
          },
        },
      ],
    }).compile();
    service = module.get(SchedulingService);
  });

  it('createAvailabilityBlock forbids tenant outside DB scope (AD-SCHED-001)', async () => {
    const tid = new Types.ObjectId();
    getConsultantSchedulingScope.mockResolvedValue({
      serveAllTenants: false,
      tenantIds: [],
      roles: ['planning_consultant'] as AuthRole[],
      active: true,
    });
    const cid = new Types.ObjectId();
    await expect(
      service.createAvailabilityBlock(
        user(cid.toHexString()),
        tid.toHexString(),
        '2026-01-15T10:00:00.000Z',
        '2026-01-15T11:00:00.000Z',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('createAvailabilityBlock conflicts on overlap (SCHED-FR1)', async () => {
    const tid = new Types.ObjectId();
    findOneAvail.mockReturnValue({
      lean: () => ({ exec: () => Promise.resolve({ _id: 'x' }) }),
    });
    const cid = new Types.ObjectId();
    await expect(
      service.createAvailabilityBlock(
        user(cid.toHexString()),
        tid.toHexString(),
        '2026-01-15T10:00:00.000Z',
        '2026-01-15T11:00:00.000Z',
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: SchedulingErrorCodes.AVAILABILITY_OVERLAP,
      }),
    });
    expect(createAvail).not.toHaveBeenCalled();
  });

  it('createAvailabilityBlock persists when valid', async () => {
    const tid = new Types.ObjectId();
    const cid = new Types.ObjectId();
    const doc = {
      _id: new Types.ObjectId(),
      consultantId: cid,
      tenantId: tid,
      startUtc: new Date('2026-01-15T10:00:00.000Z'),
      endUtc: new Date('2026-01-15T11:00:00.000Z'),
    };
    createAvail.mockResolvedValue(doc);
    const out = await service.createAvailabilityBlock(
      user(cid.toHexString()),
      tid.toHexString(),
      '2026-01-15T10:00:00.000Z',
      '2026-01-15T11:00:00.000Z',
    );
    expect(out.id).toBe(String(doc._id));
    expect(createAvail).toHaveBeenCalled();
  });

  it('listFreeSlots excludes confirmed booking windows (SCHED-FR2)', async () => {
    const tid = new Types.ObjectId();
    const cid = new Types.ObjectId();
    const block = {
      _id: new Types.ObjectId(),
      consultantId: cid,
      tenantId: tid,
      startUtc: new Date('2026-01-15T10:00:00.000Z'),
      endUtc: new Date('2026-01-15T12:00:00.000Z'),
    };
    findAvail.mockReturnValue({
      sort: () => ({ lean: () => ({ exec: () => Promise.resolve([block]) }) }),
    });
    findBooking.mockReturnValue({
      sort: () => ({
        lean: () => ({
          exec: () =>
            Promise.resolve([
              {
                tenantId: tid,
                slotStartUtc: new Date('2026-01-15T10:30:00.000Z'),
                slotEndUtc: new Date('2026-01-15T11:00:00.000Z'),
              },
            ]),
        }),
      }),
    });
    const slots = await service.listFreeSlotsForTenant(
      user(cid.toHexString()),
      tid.toHexString(),
      '2026-01-15T09:00:00.000Z',
      '2026-01-15T13:00:00.000Z',
    );
    expect(slots).toHaveLength(2);
    expect(slots[0].startUtc).toBe('2026-01-15T10:00:00.000Z');
    expect(slots[0].endUtc).toBe('2026-01-15T10:30:00.000Z');
    expect(slots[1].startUtc).toBe('2026-01-15T11:00:00.000Z');
    expect(slots[1].endUtc).toBe('2026-01-15T12:00:00.000Z');
  });

  it('updateAvailabilityBlock rejects empty patch', async () => {
    const cid = new Types.ObjectId();
    await expect(
      service.updateAvailabilityBlock(user(cid.toHexString()), new Types.ObjectId().toHexString(), {}),
    ).rejects.toThrow(BadRequestException);
  });

  it('deleteAvailabilityBlock not found when no row', async () => {
    deleteOneAvail.mockResolvedValue({ deletedCount: 0 });
    const cid = new Types.ObjectId();
    await expect(
      service.deleteAvailabilityBlock(user(cid.toHexString()), new Types.ObjectId().toHexString()),
    ).rejects.toThrow(NotFoundException);
  });

  it('createAvailabilityBlock rejects invalid range', async () => {
    const tid = new Types.ObjectId();
    const cid = new Types.ObjectId();
    await expect(
      service.createAvailabilityBlock(
        user(cid.toHexString()),
        tid.toHexString(),
        '2026-01-15T12:00:00.000Z',
        '2026-01-15T10:00:00.000Z',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('listMyAvailabilityBlocks rejects mismatched range query params', async () => {
    const cid = new Types.ObjectId();
    await expect(
      service.listMyAvailabilityBlocks(user(cid.toHexString()), '2026-01-01T00:00:00.000Z', undefined),
    ).rejects.toThrow(BadRequestException);
  });

  describe('collaborator (Epic 6)', () => {
    it('listBookableSlotsForCollaborator rejects range above max days (SCHED-FR4)', async () => {
      configGet.mockImplementation((k: string) => (k === 'SCHED_SLOT_QUERY_MAX_DAYS' ? 1 : undefined));
      const tid = new Types.ObjectId();
      await expect(
        service.listBookableSlotsForCollaborator(
          tid,
          '2026-01-01T00:00:00.000Z',
          '2026-01-05T00:00:00.000Z',
        ),
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: SchedulingErrorCodes.RANGE_EXCEEDS_MAX }),
      });
    });

    it('createCollaboratorBooking returns prior booking when idempotency key hits (SCHED-NFR5)', async () => {
      const tid = new Types.ObjectId();
      const eid = new Types.ObjectId();
      const cid = new Types.ObjectId();
      const bid = new Types.ObjectId();
      const prior = {
        _id: bid,
        tenantId: tid,
        employeeUserId: eid,
        consultantId: cid,
        slotStartUtc: new Date('2026-02-01T10:00:00.000Z'),
        slotEndUtc: new Date('2026-02-01T11:00:00.000Z'),
        state: 'confirmed' as const,
        awaitingAssignment: true,
        assignedConsultantId: null,
      };
      findOneIdempotency.mockReturnValue({
        lean: () => ({ exec: () => Promise.resolve({ bookingId: bid }) }),
      });
      findByIdBooking.mockReturnValue({
        lean: () => ({ exec: () => Promise.resolve(prior) }),
      });
      const out = await service.createCollaboratorBooking(
        collaborator(eid.toHexString(), tid.toHexString()),
        tid,
        cid.toHexString(),
        '2026-02-01T10:00:00.000Z',
        '2026-02-01T11:00:00.000Z',
        'idem-key-1',
      );
      expect(out.id).toBe(String(bid));
      expect(createBooking).not.toHaveBeenCalled();
    });

    it('createCollaboratorBooking maps duplicate key to SLOT_TAKEN (SCHED-FR5)', async () => {
      const tid = new Types.ObjectId();
      const eid = new Types.ObjectId();
      const cid = new Types.ObjectId();
      findOneAvail.mockReturnValueOnce({
        lean: () => ({ exec: () => Promise.resolve({ _id: 'block' }) }),
      });
      findOneBooking.mockReturnValueOnce({
        lean: () => ({ exec: () => Promise.resolve(null) }),
      });
      createBooking.mockRejectedValue(Object.assign(new Error('dup'), { code: 11000 }));
      await expect(
        service.createCollaboratorBooking(
          collaborator(eid.toHexString(), tid.toHexString()),
          tid,
          cid.toHexString(),
          '2026-03-01T10:00:00.000Z',
          '2026-03-01T11:00:00.000Z',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('cancelCollaboratorBooking rejects inside policy window (SCHED-FR7)', async () => {
      const tid = new Types.ObjectId();
      const eid = new Types.ObjectId();
      const bid = new Types.ObjectId();
      const cid = new Types.ObjectId();
      const slotStart = new Date('2099-06-15T14:00:00.000Z');
      const nowSpy = jest
        .spyOn(Date, 'now')
        .mockReturnValue(new Date('2099-06-15T13:00:00.000Z').getTime());
      findOneBooking.mockReturnValue({
        lean: () => ({
          exec: () =>
            Promise.resolve({
              _id: bid,
              tenantId: tid,
              employeeUserId: eid,
              consultantId: cid,
              slotStartUtc: slotStart,
              slotEndUtc: new Date('2099-06-15T15:00:00.000Z'),
              state: 'confirmed',
            }),
        }),
      });
      try {
        await expect(
          service.cancelCollaboratorBooking(
            collaborator(eid.toHexString(), tid.toHexString()),
            tid,
            bid.toHexString(),
          ),
        ).rejects.toMatchObject({
          response: expect.objectContaining({ code: SchedulingErrorCodes.BOOKING_NOT_CANCELLABLE }),
        });
      } finally {
        nowSpy.mockRestore();
      }
    });

    it('rescheduleCollaboratorBooking restores confirmed when insert duplicate (SCHED-FR8)', async () => {
      const tid = new Types.ObjectId();
      const eid = new Types.ObjectId();
      const bid = new Types.ObjectId();
      const c1 = new Types.ObjectId();
      const c2 = new Types.ObjectId();
      const existing = {
        _id: bid,
        tenantId: tid,
        employeeUserId: eid,
        consultantId: c1,
        slotStartUtc: new Date('2099-07-01T10:00:00.000Z'),
        slotEndUtc: new Date('2099-07-01T11:00:00.000Z'),
        state: 'confirmed' as const,
      };
      const nowSpy = jest
        .spyOn(Date, 'now')
        .mockReturnValue(new Date('2099-06-29T00:00:00.000Z').getTime());
      findOneBooking
        .mockReturnValueOnce({
          lean: () => ({ exec: () => Promise.resolve(existing) }),
        })
        .mockReturnValueOnce({
          lean: () => ({ exec: () => Promise.resolve(null) }),
        });
      findOneAvail.mockReturnValueOnce({
        lean: () => ({ exec: () => Promise.resolve({ _id: 'blk' }) }),
      });
      updateOneBooking.mockResolvedValueOnce({ modifiedCount: 1 });
      createBooking.mockRejectedValue(Object.assign(new Error('dup'), { code: 11000 }));
      try {
        await expect(
          service.rescheduleCollaboratorBooking(
            collaborator(eid.toHexString(), tid.toHexString()),
            tid,
            bid.toHexString(),
            c2.toHexString(),
            '2099-08-01T12:00:00.000Z',
            '2099-08-01T13:00:00.000Z',
          ),
        ).rejects.toThrow(ConflictException);
        expect(updateOneBooking).toHaveBeenCalledTimes(2);
      } finally {
        nowSpy.mockRestore();
      }
    });

    describe('consultant queue (Epic 7)', () => {
      it('assignUnassignedBookingToSelf rejects when slot owner mismatch', async () => {
        const tid = new Types.ObjectId();
        const me = new Types.ObjectId();
        const other = new Types.ObjectId();
        const bid = new Types.ObjectId();
        findOneBooking.mockReturnValueOnce({
          lean: () => ({
            exec: () =>
              Promise.resolve({
                _id: bid,
                tenantId: tid,
                employeeUserId: new Types.ObjectId(),
                consultantId: other,
                slotStartUtc: new Date('2099-08-01T10:00:00.000Z'),
                slotEndUtc: new Date('2099-08-01T11:00:00.000Z'),
                state: 'confirmed',
                awaitingAssignment: true,
                assignedConsultantId: null,
              }),
          }),
        });
        await expect(
          service.assignUnassignedBookingToSelf(user(me.toHexString()), bid.toHexString()),
        ).rejects.toThrow(ForbiddenException);
        expect(createBookingAudit).not.toHaveBeenCalled();
      });

      it('assignUnassignedBookingToSelf conflicts when claim races (SCHED-FR10)', async () => {
        const tid = new Types.ObjectId();
        const me = new Types.ObjectId();
        const bid = new Types.ObjectId();
        findOneBooking.mockReturnValueOnce({
          lean: () => ({
            exec: () =>
              Promise.resolve({
                _id: bid,
                tenantId: tid,
                employeeUserId: new Types.ObjectId(),
                consultantId: me,
                slotStartUtc: new Date('2099-08-01T10:00:00.000Z'),
                slotEndUtc: new Date('2099-08-01T11:00:00.000Z'),
                state: 'confirmed',
                awaitingAssignment: true,
                assignedConsultantId: null,
              }),
          }),
        });
        findOneAndUpdateBooking.mockReturnValueOnce({
          lean: () => ({ exec: () => Promise.resolve(null) }),
        });
        await expect(
          service.assignUnassignedBookingToSelf(user(me.toHexString()), bid.toHexString()),
        ).rejects.toThrow(ConflictException);
      });

      it('closeAssignedBookingAsConsultant rejects invalid reason for outcome (SCHED-FR11)', async () => {
        const me = new Types.ObjectId();
        await expect(
          service.closeAssignedBookingAsConsultant(
            user(me.toHexString()),
            new Types.ObjectId().toHexString(),
            'completed',
            'client_cancelled',
          ),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });
});
