---
story_key: 6-2-create-booking-with-atomic-reservation
epic: 6
story: 2
frs: [SCHED-FR5]
nfr: [SCHED-NFR1, SCHED-NFR5]
ux: [UX-DR7]
---

# Story 6.2: Create booking with atomic reservation

Status: ready-for-dev

## Story

As a **collaborator**,  
I want **to confirm a slot and know immediately if it was taken**,  
so that **I do not double-book the consultant**.

## Acceptance Criteria

1. **Free slot** — submit — **atomic reserve** or **`SLOT_TAKEN`** (**SCHED-FR5**, **SCHED-NFR1**).
2. **`Idempotency-Key`** prevents duplicate on retry (**SCHED-NFR5**).
3. Confirmation UI shows date/time (**UX-DR7**).

## Tasks / Subtasks

- [ ] `POST` booking with `findOneAndUpdate` / transaction per architecture.
- [ ] Store idempotency key + outcome TTL.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Idempotency, Booking concurrency]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
