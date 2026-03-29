---
story_key: 6-5-reschedule-without-double-reservation
epic: 6
story: 5
frs: [SCHED-FR8]
---

# Story 6.5: Reschedule without double reservation

Status: done

## Story

As a **collaborator**,  
I want **to move my session to another slot**,  
so that **my plan fits my calendar**.

## Acceptance Criteria

1. **Reschedule-eligible** booking — pick new slot — **old released**, **new reserved** atomically or fails safe (**SCHED-FR8**).
2. **No** double reservation at end state.

## Tasks / Subtasks

- [x] Single transactional flow or two-phase with rollback.
- [x] Reuse idempotency pattern if applicable.

### References

- [Source: _bmad-output/planning-artifacts/prd-scheduling.md — FR8]

## Dev Agent Record

### Agent Model Used

Composer / GPT-5.1

### Debug Log References

### Completion Notes List

- `POST .../bookings/:bookingId/reschedule`: `assertIntervalBookable(..., { ignoreBookingId })` then cancel old `confirmed` → `create` new; on E11000 restore old to `confirmed` and `SLOT_TAKEN`.
- Optional `Idempotency-Key` + `scheduling_idempotency` for `reschedule_booking` op.
- ic-app: `useRescheduleBookingMutation` exported (UI hook for future picker).

### File List

- `packages/server/src/scheduling/scheduling.service.ts`
- `packages/server/src/scheduling/dto/reschedule-collaborator-booking.dto.ts`
- `packages/server/src/ic/ic.controller.ts`
- `packages/ic-app/src/api/schedulingApi.ts`
