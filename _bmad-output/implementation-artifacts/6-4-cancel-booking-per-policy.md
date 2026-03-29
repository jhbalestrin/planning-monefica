---
story_key: 6-4-cancel-booking-per-policy
epic: 6
story: 4
frs: [SCHED-FR7]
ux: [UX-DR2]
---

# Story 6.4: Cancel booking per policy

Status: ready-for-dev

## Story

As a **collaborator**,  
I want **to cancel when policy allows**,  
so that **I can free the slot**.

## Acceptance Criteria

1. Cancellable state — confirm — **cancelled** per rules (**SCHED-FR7**).
2. Past cutoff → **pt-BR** message via error code mapping (**UX-DR2**).

## Tasks / Subtasks

- [ ] Policy flags (env or constants); `POST` cancel endpoint.
- [ ] Release slot for slot derivation (Epic 5.3).

### References

- [Source: _bmad-output/planning-artifacts/prd-scheduling.md — FR7]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
