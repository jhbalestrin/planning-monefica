---
story_key: 6-6-enforce-hr-admin-out-of-consultant-scheduling-apis
epic: 6
story: 6
frs: [SCHED-FR15]
---

# Story 6.6: Enforce hr_admin out of consultant scheduling APIs

Status: ready-for-dev

## Story

As a **platform**,  
I want **hr_admin blocked from consultant assignment APIs**,  
so that **roles stay separated**.

## Acceptance Criteria

1. **`hr_admin` token** — consultant-only scheduling **mutation** endpoints → **403** (**SCHED-FR15**).

## Tasks / Subtasks

- [ ] Audit scheduling routes; apply `planning_consultant` or `platform_admin` where appropriate.
- [ ] Tests: hr_admin denied.

### References

- [Source: _bmad-output/planning-artifacts/prd-scheduling.md — FR15]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
