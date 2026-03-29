---
story_key: 6-2-create-booking-with-atomic-reservation
epic: 6
story: 2
frs: [SCHED-FR5]
nfr: [SCHED-NFR1, SCHED-NFR5]
ux: [UX-DR7]
---

# Story 6.2: Create booking with atomic reservation

Status: done

## Story

As a **collaborator**,  
I want **to confirm a slot and know immediately if it was taken**,  
so that **I do not double-book the consultant**.

## Acceptance Criteria

1. **Free slot** — submit — **atomic reserve** or **`SLOT_TAKEN`** (**SCHED-FR5**, **SCHED-NFR1**).
2. **`Idempotency-Key`** prevents duplicate on retry (**SCHED-NFR5**).
3. Confirmation UI shows date/time (**UX-DR7**).

## Tasks / Subtasks

- [x] `POST` booking with `findOneAndUpdate` / transaction per architecture.
- [x] Store idempotency key + outcome TTL.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Idempotency, Booking concurrency]

## Dev Agent Record

### Agent Model Used

Composer / GPT-5.1

### Debug Log References

### Completion Notes List

- `POST /api/v1/ic/tenants/:tenantId/scheduling/bookings` + optional `Idempotency-Key` header; pre-check `assertIntervalBookable` + `insert` with partial unique index → `SLOT_TAKEN` on E11000 (SCHED-FR5 / SCHED-NFR1).
- `scheduling_idempotency` collection: compound key per tenant/employee/op + TTL index 24h (SCHED-NFR5); replay returns stored `bookingId`.
- ic-app: `useCreateBookingMutation` sends header; `Alert` confirmation (UX-DR7).

### File List

- `packages/server/src/scheduling/schemas/scheduling-idempotency.schema.ts`
- `packages/server/src/scheduling/scheduling.service.ts`
- `packages/server/src/scheduling/scheduling.module.ts`
- `packages/server/src/scheduling/mongo-duplicate.util.ts`
- `packages/server/src/scheduling/dto/create-collaborator-booking.dto.ts`
- `packages/server/src/ic/ic.controller.ts`
- `packages/shared-types/src/scheduling.ts`
- `packages/ic-app/src/api/schedulingApi.ts`
- `packages/ic-app/src/components/PlanningSessionsCard.tsx`
