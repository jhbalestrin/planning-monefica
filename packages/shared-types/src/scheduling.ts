/** Booking lifecycle (scheduling module). Epic 7 adds `completed`. */
export type BookingState = 'confirmed' | 'cancelled' | 'no_show' | 'completed';

/** SCHED-FR11 — terminal reason codes (validated server-side per outcome). */
export type BookingClosureReasonCode =
  | 'delivered_completed'
  | 'client_cancelled'
  | 'consultant_cancelled'
  | 'no_show_employee'
  | 'no_show_other';

export interface ConsultantAvailabilityBlockDto {
  id: string;
  tenantId: string;
  consultantId: string;
  startUtc: string;
  endUtc: string;
}

export interface CreateAvailabilityBlockRequestDto {
  tenantId: string;
  startUtc: string;
  endUtc: string;
}

export interface UpdateAvailabilityBlockRequestDto {
  startUtc?: string;
  endUtc?: string;
  tenantId?: string;
}

/** Free time within availability after subtracting confirmed bookings (SCHED-FR2). */
export interface FreeSlotIntervalDto {
  startUtc: string;
  endUtc: string;
}

/** SCHED-FR4 — bookable window for a consultant within the tenant. */
export interface EmployeeBookableSlotDto {
  consultantId: string;
  tenantId: string;
  startUtc: string;
  endUtc: string;
}

export interface CreateCollaboratorBookingRequestDto {
  consultantId: string;
  slotStartUtc: string;
  slotEndUtc: string;
}

export interface RescheduleCollaboratorBookingRequestDto {
  consultantId: string;
  slotStartUtc: string;
  slotEndUtc: string;
}

export interface BookingSummaryDto {
  id: string;
  tenantId: string;
  employeeUserId: string;
  consultantId: string;
  slotStartUtc: string;
  slotEndUtc: string;
  state: BookingState;
  /** Epic 7 — false after consultant claims (SCHED-FR10). */
  awaitingAssignment: boolean;
  assignedConsultantId: string | null;
  closureReasonCode?: BookingClosureReasonCode | null;
}

/** SCHED-FR9 — queue row (same shape as summary; explicit alias for API docs). */
export type BookingQueueItemDto = BookingSummaryDto;

export interface CloseBookingRequestDto {
  outcome: 'completed' | 'cancelled' | 'no_show';
  reasonCode: BookingClosureReasonCode;
}

export interface ConsultantCalendarSummaryDto {
  fromUtc: string;
  toUtc: string;
  availability: ConsultantAvailabilityBlockDto[];
  bookings: BookingSummaryDto[];
}

export const SchedulingErrorCodes = {
  AVAILABILITY_OVERLAP: 'SCHED_AVAILABILITY_OVERLAP',
  TENANT_NOT_IN_CONSULTANT_SCOPE: 'SCHED_TENANT_NOT_IN_SCOPE',
  BLOCK_NOT_FOUND: 'SCHED_BLOCK_NOT_FOUND',
  INVALID_RANGE: 'SCHED_INVALID_RANGE',
  /** SCHED-FR5 / architecture — atomic reservation conflict. */
  SLOT_TAKEN: 'SLOT_TAKEN',
  BOOKING_NOT_FOUND: 'SCHED_BOOKING_NOT_FOUND',
  BOOKING_SLOT_INVALID: 'SCHED_BOOKING_SLOT_INVALID',
  /** SCHED-FR7 — policy window (maps to pt-BR client copy, UX-DR2). */
  BOOKING_NOT_CANCELLABLE: 'SCHED_BOOKING_NOT_CANCELLABLE',
  BOOKING_NOT_RESCHEDULABLE: 'SCHED_BOOKING_NOT_RESCHEDULABLE',
  RANGE_EXCEEDS_MAX: 'SCHED_RANGE_EXCEEDS_MAX',
  /** SCHED-NFR5 — same Idempotency-Key returns prior outcome. */
  IDEMPOTENCY_REPLAY: 'SCHED_IDEMPOTENCY_REPLAY',
  /** SCHED-FR15 — hr_admin must not use consultant scheduling mutations. */
  HR_ADMIN_CONSULTANT_SCHEDULING_FORBIDDEN: 'SCHED_HR_ADMIN_CONSULTANT_SCHEDULING_FORBIDDEN',
  ASSIGNMENT_ALREADY_CLAIMED: 'SCHED_ASSIGNMENT_ALREADY_CLAIMED',
  BOOKING_NOT_ASSIGNABLE: 'SCHED_BOOKING_NOT_ASSIGNABLE',
  BOOKING_NOT_CLOSABLE: 'SCHED_BOOKING_NOT_CLOSABLE',
  INVALID_CLOSURE_REASON: 'SCHED_INVALID_CLOSURE_REASON',
} as const;

export type SchedulingErrorCode =
  (typeof SchedulingErrorCodes)[keyof typeof SchedulingErrorCodes];
