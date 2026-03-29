import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type {
  AccessTokenPayload,
  EligibilitySelfStatusDto,
} from '@planning-monefica/shared-types';
import { Types } from 'mongoose';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  RequireClient,
  RequireRoles,
  TenantIdFromParam,
} from '../auth/decorators/rbac.decorator';
import { RequireClientGuard } from '../auth/guards/require-client.guard';
import { RequireRolesGuard } from '../auth/guards/require-roles.guard';
import { RequireTenantPrincipalGuard } from '../auth/guards/require-tenant-principal.guard';
import { TenantIdParamGuard } from '../auth/guards/tenant-id-param.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BenefitEligibilityGuard } from '../eligibility/benefit-eligibility.guard';
import { EligibilityService } from '../eligibility/eligibility.service';
import { CollaboratorBookingsQueryDto } from '../scheduling/dto/collaborator-bookings-query.dto';
import { CollaboratorSlotsQueryDto } from '../scheduling/dto/collaborator-slots-query.dto';
import { CreateCollaboratorBookingDto } from '../scheduling/dto/create-collaborator-booking.dto';
import { RescheduleCollaboratorBookingDto } from '../scheduling/dto/reschedule-collaborator-booking.dto';
import { SchedulingService } from '../scheduling/scheduling.service';

/**
 * IC-app–scoped routes (Epic 2.2, 4.x). Benefit routes add `BenefitEligibilityGuard` after auth/tenant.
 */
@Controller({ path: 'ic/tenants', version: '1' })
@UseGuards(
  JwtAuthGuard,
  RequireTenantPrincipalGuard,
  RequireClientGuard,
  RequireRolesGuard,
  TenantIdParamGuard,
)
@RequireClient('ic-app')
@RequireRoles('collaborator')
@TenantIdFromParam('tenantId')
export class IcController {
  constructor(
    private readonly eligibility: EligibilityService,
    private readonly scheduling: SchedulingService,
  ) {}

  @Get(':tenantId/ping')
  ping(@Param('tenantId') tenantId: string): { scope: string; tenantId: string } {
    return { scope: 'ic', tenantId };
  }

  /** ELIG-FR6 — JWT `sub` + `tenantId` only; path tenant must match JWT. */
  @Get(':tenantId/me/eligibility')
  selfEligibility(
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<EligibilitySelfStatusDto> {
    return this.eligibility.getSelfEligibilityStatus(user);
  }

  /** Example benefit-scoped handler (ELIG-FR7/10/11). */
  @Get(':tenantId/benefit/ping')
  @UseGuards(BenefitEligibilityGuard)
  benefitPing(): { ok: true; scope: string } {
    return { ok: true, scope: 'benefit' };
  }

  /** SCHED-FR4 + SCHED-FR13 (via BenefitEligibilityGuard). */
  @Get(':tenantId/scheduling/slots')
  @UseGuards(BenefitEligibilityGuard)
  listBookableSlots(
    @Param('tenantId') tenantId: string,
    @Query() q: CollaboratorSlotsQueryDto,
  ) {
    return this.scheduling.listBookableSlotsForCollaborator(
      new Types.ObjectId(tenantId),
      q.fromUtc,
      q.toUtc,
    );
  }

  /** SCHED-FR5 + SCHED-NFR1 + SCHED-NFR5 */
  @Post(':tenantId/scheduling/bookings')
  @UseGuards(BenefitEligibilityGuard)
  createBooking(
    @Param('tenantId') tenantId: string,
    @Body() body: CreateCollaboratorBookingDto,
    @CurrentUser() user: AccessTokenPayload,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.scheduling.createCollaboratorBooking(
      user,
      new Types.ObjectId(tenantId),
      body.consultantId,
      body.slotStartUtc,
      body.slotEndUtc,
      idempotencyKey,
    );
  }

  /** SCHED-FR6 */
  @Get(':tenantId/scheduling/bookings')
  @UseGuards(BenefitEligibilityGuard)
  listMyBookings(
    @Param('tenantId') tenantId: string,
    @Query() q: CollaboratorBookingsQueryDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.scheduling.listCollaboratorBookings(
      user,
      new Types.ObjectId(tenantId),
      q.fromUtc,
      q.toUtc,
    );
  }

  @Get(':tenantId/scheduling/bookings/:bookingId')
  @UseGuards(BenefitEligibilityGuard)
  getBooking(
    @Param('tenantId') tenantId: string,
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.scheduling.getCollaboratorBooking(
      user,
      new Types.ObjectId(tenantId),
      bookingId,
    );
  }

  /** SCHED-FR7 */
  @Post(':tenantId/scheduling/bookings/:bookingId/cancel')
  @UseGuards(BenefitEligibilityGuard)
  cancelBooking(
    @Param('tenantId') tenantId: string,
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.scheduling.cancelCollaboratorBooking(
      user,
      new Types.ObjectId(tenantId),
      bookingId,
    );
  }

  /** SCHED-FR8 */
  @Post(':tenantId/scheduling/bookings/:bookingId/reschedule')
  @UseGuards(BenefitEligibilityGuard)
  rescheduleBooking(
    @Param('tenantId') tenantId: string,
    @Param('bookingId') bookingId: string,
    @Body() body: RescheduleCollaboratorBookingDto,
    @CurrentUser() user: AccessTokenPayload,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.scheduling.rescheduleCollaboratorBooking(
      user,
      new Types.ObjectId(tenantId),
      bookingId,
      body.consultantId,
      body.slotStartUtc,
      body.slotEndUtc,
      idempotencyKey,
    );
  }
}
