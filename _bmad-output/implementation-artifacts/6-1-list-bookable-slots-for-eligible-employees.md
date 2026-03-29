---
story_key: 6-1-list-bookable-slots-for-eligible-employees
epic: 6
story: 1
frs: [SCHED-FR4, SCHED-FR13]
ux: [UX-DR2, UX-DR7]
---

# Story 6.1: List bookable slots for eligible employees

Status: ready-for-dev

## Story

As a **collaborator**,  
I want **to see available times for my company**,  
so that **I can choose a session**.

## Acceptance Criteria

1. **Eligible active** collaborator — slots for **date range** (server max enforced) — **tenant only** (**SCHED-FR4**).
2. **Ineligible/inactive** denied (**SCHED-FR13**).

## Tasks / Subtasks

- [ ] ic-app + API `GET` slots; reuse Epic 4 eligibility checks.
- [ ] Confirmation copy path toward **UX-DR7**.

### References

- [Source: _bmad-output/planning-artifacts/prd-scheduling.md — FR4, FR13]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
