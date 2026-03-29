---
story_key: 5-1-scheduling-domain-models-and-module
epic: 5
story: 1
frs: [SCHED-FR1, SCHED-FR14]
nfr: [SCHED-NFR4]
---

# Story 5.1: Scheduling domain models and module

Status: ready-for-dev

## Story

As a **system**,  
I want **availability and booking collections owned by the scheduling module**,  
so that **consultants and employees share one source of truth**.

## Acceptance Criteria

1. Nest **`scheduling`** module with owned Mongoose schemas.
2. Booking docs include **`tenantId`** + employee user id (**SCHED-FR14**).
3. Instants stored **UTC** (**SCHED-NFR4**).

## Tasks / Subtasks

- [ ] Module skeleton + `AvailabilityBlock` + `Booking` (names per team).
- [ ] No cross-import of other modules’ schemas.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Booking concurrency, AD-SCHED-001]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
