---
story_key: 6-5-reschedule-without-double-reservation
epic: 6
story: 5
frs: [SCHED-FR8]
---

# Story 6.5: Reschedule without double reservation

Status: ready-for-dev

## Story

As a **collaborator**,  
I want **to move my session to another slot**,  
so that **my plan fits my calendar**.

## Acceptance Criteria

1. **Reschedule-eligible** booking — pick new slot — **old released**, **new reserved** atomically or fails safe (**SCHED-FR8**).
2. **No** double reservation at end state.

## Tasks / Subtasks

- [ ] Single transactional flow or two-phase with rollback.
- [ ] Reuse idempotency pattern if applicable.

### References

- [Source: _bmad-output/planning-artifacts/prd-scheduling.md — FR8]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
