---
story_key: 5-1-scheduling-domain-models-and-module
epic: 5
story: 1
frs: [SCHED-FR1, SCHED-FR14]
nfr: [SCHED-NFR4]
---

# Story 5.1: Scheduling domain models and module

Status: done

## Story

As a **system**,  
I want **availability and booking collections owned by the scheduling module**,  
so that **consultants and employees share one source of truth**.

## Acceptance Criteria

1. Nest **`scheduling`** module with owned Mongoose schemas.
2. Booking docs include **`tenantId`** + employee user id (**SCHED-FR14**).
3. Instants stored **UTC** (**SCHED-NFR4**).

## Tasks / Subtasks

- [x] Module skeleton + `AvailabilityBlock` + `Booking` (names per team).
- [x] No cross-import of other modules’ schemas.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Booking concurrency, AD-SCHED-001]

## Dev Agent Record

### Agent Model Used

Composer / GPT-5.1

### Debug Log References

### Completion Notes List

- Mongoose models: `ConsultantAvailabilityBlock` (collection `consultant_availability_blocks`), `Booking` (collection `bookings`); UTC `Date` fields; booking includes `tenantId`, `employeeUserId`; partial unique index on `(consultantId, slotStartUtc)` for `state: confirmed` (SCHED-NFR1).
- Scheduling module registers schemas via `MongooseModule.forFeature`; no imports of other modules’ schema classes.

### File List

- `packages/server/src/scheduling/schemas/consultant-availability-block.schema.ts`
- `packages/server/src/scheduling/schemas/booking.schema.ts`
- `packages/server/src/scheduling/scheduling.module.ts`
