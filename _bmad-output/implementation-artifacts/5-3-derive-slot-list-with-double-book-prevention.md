---
story_key: 5-3-derive-slot-list-with-double-book-prevention
epic: 5
story: 3
frs: [SCHED-FR2]
nfr: [SCHED-NFR1]
---

# Story 5.3: Derive slot list with double-book prevention

Status: ready-for-dev

## Story

As a **system**,  
I want **slot generation to exclude booked consultant time**,  
so that **two people cannot reserve the same consultant instant**.

## Acceptance Criteria

1. **Given** availability + bookings — **When** slots computed — **Then** booked windows **not** offered (**SCHED-FR2**).
2. **Concurrent** commits cannot double-book same slot (**SCHED-NFR1**) — align with architecture **atomic write / unique index**.

## Tasks / Subtasks

- [ ] Slot derivation service; query bookings overlapping window.
- [ ] Prepare for Epic 6.2 atomic reservation (compound unique or lock doc).

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Booking concurrency]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
