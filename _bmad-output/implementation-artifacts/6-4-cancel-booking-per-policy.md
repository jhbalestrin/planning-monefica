---
story_key: 6-4-cancel-booking-per-policy
epic: 6
story: 4
frs: [SCHED-FR7]
ux: [UX-DR2]
---

# Story 6.4: Cancel booking per policy

Status: done

## Story

As a **collaborator**,  
I want **to cancel when policy allows**,  
so that **I can free the slot**.

## Acceptance Criteria

1. Cancellable state — confirm — **cancelled** per rules (**SCHED-FR7**).
2. Past cutoff → **pt-BR** message via error code mapping (**UX-DR2**).

## Tasks / Subtasks

- [x] Policy flags (env or constants); `POST` cancel endpoint.
- [x] Release slot for slot derivation (Epic 5.3).

### References

- [Source: _bmad-output/planning-artifacts/prd-scheduling.md — FR7]

## Dev Agent Record

### Agent Model Used

Composer / GPT-5.1

### Debug Log References

### Completion Notes List

- `SCHED_BOOKING_MODIFY_MIN_HOURS_BEFORE` (default 24) + must be before `slotStartUtc`; `state` → `cancelled` (partial unique no longer applies → slot free in derivation).
- `POST .../bookings/:bookingId/cancel`; `SCHED_BOOKING_NOT_CANCELLABLE` mapped in `schedulingPtBr` (UX-DR2).

### File List

- `packages/server/src/scheduling/scheduling.service.ts`
- `packages/server/src/ic/ic.controller.ts`
- `packages/ic-app/src/api/schedulingApi.ts`
- `packages/ic-app/src/components/PlanningSessionsCard.tsx`
- `packages/ic-app/src/i18n/schedulingPtBr.ts`
