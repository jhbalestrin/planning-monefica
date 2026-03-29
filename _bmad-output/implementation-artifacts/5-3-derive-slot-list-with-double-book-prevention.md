---
story_key: 5-3-derive-slot-list-with-double-book-prevention
epic: 5
story: 3
frs: [SCHED-FR2]
nfr: [SCHED-NFR1]
---

# Story 5.3: Derive slot list with double-book prevention

Status: done

## Story

As a **system**,  
I want **slot generation to exclude booked consultant time**,  
so that **two people cannot reserve the same consultant instant**.

## Acceptance Criteria

1. **Given** availability + bookings — **When** slots computed — **Then** booked windows **not** offered (**SCHED-FR2**).
2. **Concurrent** commits cannot double-book same slot (**SCHED-NFR1**) — align with architecture **atomic write / unique index**.

## Tasks / Subtasks

- [x] Slot derivation service; query bookings overlapping window.
- [x] Prepare for Epic 6.2 atomic reservation (compound unique or lock doc).

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Booking concurrency]

## Dev Agent Record

### Agent Model Used

Composer / GPT-5.1

### Debug Log References

### Completion Notes List

- `listFreeSlotsForTenant`: availability segments ∩ query window minus **confirmed** bookings per tenant (`subtractIntervals` in `interval.util.ts`).
- `GET /api/v1/scheduling/consultant/me/slots` with `tenantId`, `fromUtc`, `toUtc`.
- Booking schema: partial unique `{ consultantId, slotStartUtc }` when `state: 'confirmed'`; optional `idempotencyKey` for Epic 6.

### File List

- `packages/server/src/scheduling/interval.util.ts`
- `packages/server/src/scheduling/interval.util.spec.ts`
- `packages/server/src/scheduling/schemas/booking.schema.ts`
- `packages/server/src/scheduling/scheduling.service.ts`
- `packages/server/src/scheduling/scheduling.service.spec.ts`
- `packages/server/src/scheduling/scheduling-consultant.controller.ts`
- `packages/server/src/scheduling/dto/list-slots-query.dto.ts`
- `packages/shared-types/src/scheduling.ts`
