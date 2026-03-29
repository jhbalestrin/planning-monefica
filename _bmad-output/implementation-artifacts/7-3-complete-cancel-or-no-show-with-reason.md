---
story_key: 7-3-complete-cancel-or-no-show-with-reason
epic: 7
story: 3
frs: [SCHED-FR11]
nfr: [SCHED-NFR3]
---

# Story 7.3: Complete, cancel, or no-show with reason

Status: done

## Story

As a **planning consultant**,  
I want **to close bookings with the right outcome**,  
so that **reporting stays accurate**.

## Acceptance Criteria

1. **Assigned** booking — **completed / cancelled / no-show** with **reason enum** (**SCHED-FR11**).
2. **Audit** log (**SCHED-NFR3**).

## Tasks / Subtasks

- [x] Terminal state transitions + validation (only owner consultant).
- [x] Reason codes in **shared-types**.

### References

- [Source: _bmad-output/planning-artifacts/prd-scheduling.md — FR11]

## Dev Agent Record

### Agent Model Used

Cursor agent (Amelia / dev-story execution).

### Debug Log References

### Completion Notes List

- `BookingState` extended with `completed`; `CloseBookingRequestDto` + `BookingClosureReasonCode`; server validates outcome/reason pairs; invalid → `SCHED_INVALID_CLOSURE_REASON`.
- `POST consultant/me/bookings/:bookingId/close`; `GET consultant/me/open-assigned-bookings` for “Minhas sessões abertas”.
- Close + assign audited via `SchedulingBookingAudit`.
- Control-pane close dialog (outcome + reason); `ic-app`: **Concluída** chip + “aguardando consultor” when `awaitingAssignment`.

### File List

- `packages/shared-types/src/scheduling.ts`
- `packages/server/src/scheduling/schemas/booking.schema.ts`
- `packages/server/src/scheduling/schemas/scheduling-booking-audit.schema.ts`
- `packages/server/src/scheduling/dto/close-booking.dto.ts`
- `packages/server/src/scheduling/scheduling.service.ts`
- `packages/server/src/scheduling/scheduling-consultant.controller.ts`
- `packages/server/src/scheduling/scheduling.module.ts`
- `packages/server/src/scheduling/scheduling.service.spec.ts`
- `packages/control-pane/src/pages/scheduling-queue/api/schedulingQueueApi.ts`
- `packages/control-pane/src/pages/scheduling-queue/components/QueueView.tsx`
- `packages/control-pane/src/pages/scheduling-queue/containers/QueueContainer.tsx`
- `packages/ic-app/src/i18n/schedulingPtBr.ts`
- `packages/ic-app/src/components/PlanningSessionsCard.tsx`
