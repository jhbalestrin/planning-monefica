---
story_key: 5-2-consultant-availability-crud-api
epic: 5
story: 2
frs: [SCHED-FR1]
ux: [UX-DR4]
---

# Story 5.2: Consultant availability CRUD API

Status: ready-for-dev

## Story

As a **planning consultant**,  
I want **to create, update, and delete my availability blocks**,  
so that **employees only see times I offer**.

## Acceptance Criteria

1. **Given** `planning_consultant` — **When** CRUD via API — **Then** blocks persist; validation prevents invalid overlaps per product rules (**SCHED-FR1**).
2. Only **own** blocks mutable unless admin override (later).

## Tasks / Subtasks

- [ ] REST endpoints + `ConsultantGuard` + **AD-SCHED-001** tenant visibility (consultant identity from `PlatformUser`).
- [ ] DTOs in **shared-types**.

### References

- [Source: _bmad-output/planning-artifacts/prd-scheduling.md — FR1]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
