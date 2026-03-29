import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AccessTokenPayload } from '@planning-monefica/shared-types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireClient, RequireRoles } from '../auth/decorators/rbac.decorator';
import { RequireClientGuard } from '../auth/guards/require-client.guard';
import { RequirePlatformPrincipalGuard } from '../auth/guards/require-platform-principal.guard';
import { RequireRolesGuard } from '../auth/guards/require-roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DenyHrAdminConsultantSchedulingGuard } from './guards/deny-hr-admin-consultant-scheduling.guard';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import { CreateAvailabilityBlockDto } from './dto/create-availability-block.dto';
import { DateRangeQueryDto } from './dto/date-range-query.dto';
import { ListSlotsQueryDto } from './dto/list-slots-query.dto';
import { CloseBookingDto } from './dto/close-booking.dto';
import { UpdateAvailabilityBlockDto } from './dto/update-availability-block.dto';
import { SchedulingService } from './scheduling.service';

/**
 * Consultant scheduling (Epic 5). AD-SCHED-001 tenant scope from PlatformUser DB.
 */
@Controller({ path: 'scheduling', version: '1' })
@UseGuards(
  JwtAuthGuard,
  RequirePlatformPrincipalGuard,
  RequireClientGuard,
  RequireRolesGuard,
)
@RequireClient('control-pane')
@RequireRoles('planning_consultant')
export class SchedulingConsultantController {
  constructor(private readonly scheduling: SchedulingService) {}

  @Get('consultant/ping')
  consultantPing(): { scope: string; role: string } {
    return { scope: 'scheduling', role: 'planning_consultant' };
  }

  @Post('consultant/me/availability')
  @UseGuards(DenyHrAdminConsultantSchedulingGuard)
  createAvailability(
    @Body() body: CreateAvailabilityBlockDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.scheduling.createAvailabilityBlock(
      user,
      body.tenantId,
      body.startUtc,
      body.endUtc,
    );
  }

  @Get('consultant/me/availability')
  listAvailability(
    @Query() q: DateRangeQueryDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.scheduling.listMyAvailabilityBlocks(user, q.fromUtc, q.toUtc);
  }

  @Patch('consultant/me/availability/:id')
  @UseGuards(DenyHrAdminConsultantSchedulingGuard)
  updateAvailability(
    @Param('id') id: string,
    @Body() body: UpdateAvailabilityBlockDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.scheduling.updateAvailabilityBlock(user, id, {
      tenantId: body.tenantId,
      startUtc: body.startUtc,
      endUtc: body.endUtc,
    });
  }

  @Delete('consultant/me/availability/:id')
  @UseGuards(DenyHrAdminConsultantSchedulingGuard)
  deleteAvailability(
    @Param('id') id: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.scheduling.deleteAvailabilityBlock(user, id);
  }

  @Get('consultant/me/slots')
  listSlots(@Query() q: ListSlotsQueryDto, @CurrentUser() user: AccessTokenPayload) {
    return this.scheduling.listFreeSlotsForTenant(
      user,
      q.tenantId,
      q.fromUtc,
      q.toUtc,
    );
  }

  @Get('consultant/me/calendar')
  calendar(@Query() q: CalendarQueryDto, @CurrentUser() user: AccessTokenPayload) {
    return this.scheduling.getMyCalendarSummary(user, q.fromUtc, q.toUtc);
  }

  /** SCHED-FR9 */
  @Get('consultant/me/assignment-queue')
  assignmentQueue(@CurrentUser() user: AccessTokenPayload) {
    return this.scheduling.listAssignmentQueue(user);
  }

  /** SCHED-FR10 */
  @Post('consultant/me/assignment-queue/:bookingId/assign')
  @UseGuards(DenyHrAdminConsultantSchedulingGuard)
  assignBooking(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.scheduling.assignUnassignedBookingToSelf(user, bookingId);
  }

  /** SCHED-FR11 */
  @Get('consultant/me/open-assigned-bookings')
  openAssignedBookings(@CurrentUser() user: AccessTokenPayload) {
    return this.scheduling.listOpenAssignedBookingsForConsultant(user);
  }

  @Post('consultant/me/bookings/:bookingId/close')
  @UseGuards(DenyHrAdminConsultantSchedulingGuard)
  closeBooking(
    @Param('bookingId') bookingId: string,
    @Body() body: CloseBookingDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.scheduling.closeAssignedBookingAsConsultant(
      user,
      bookingId,
      body.outcome,
      body.reasonCode,
    );
  }
}
