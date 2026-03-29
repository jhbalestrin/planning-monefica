---
story_key: 7-2-assign-booking-to-self
epic: 7
story: 2
frs: [SCHED-FR10]
nfr: [SCHED-NFR3]
---

# Story 7.2: Assign booking to self

Status: ready-for-dev

## Story

As a **planning consultant**,  
I want **to claim a booking**,  
so that **I own delivery**.

## Acceptance Criteria

1. **Unassigned** booking — consultant assigns to self — **ownership** set (**SCHED-FR10**).
2. **Audit** event (**SCHED-NFR3**).

## Tasks / Subtasks

- [ ] `POST` assign endpoint; concurrency if two consultants claim (reject second).
- [ ] Structured audit log.

### References

- [Source: _bmad-output/planning-artifacts/prd-scheduling.md — FR10]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
