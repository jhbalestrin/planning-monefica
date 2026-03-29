---
story_key: 6-6-enforce-hr-admin-out-of-consultant-scheduling-apis
epic: 6
story: 6
frs: [SCHED-FR15]
---

# Story 6.6: Enforce hr_admin out of consultant scheduling APIs

Status: done

## Story

As a **platform**,  
I want **hr_admin blocked from consultant assignment APIs**,  
so that **roles stay separated**.

## Acceptance Criteria

1. **`hr_admin` token** — consultant-only scheduling **mutation** endpoints → **403** (**SCHED-FR15**).

## Tasks / Subtasks

- [x] Audit scheduling routes; apply `planning_consultant` or `platform_admin` where appropriate.
- [x] Tests: hr_admin denied.

### References

- [Source: _bmad-output/planning-artifacts/prd-scheduling.md — FR15]

## Dev Agent Record

### Agent Model Used

Composer / GPT-5.1

### Debug Log References

### Completion Notes List

- `DenyHrAdminConsultantSchedulingGuard` on consultant **mutations** only: `POST/PATCH/DELETE .../consultant/me/availability` (SCHED-FR15); `SCHED_HR_ADMIN_CONSULTANT_SCHEDULING_FORBIDDEN`.
- Jest: `deny-hr-admin-consultant-scheduling.guard.spec.ts`.

### File List

- `packages/server/src/scheduling/guards/deny-hr-admin-consultant-scheduling.guard.ts`
- `packages/server/src/scheduling/guards/deny-hr-admin-consultant-scheduling.guard.spec.ts`
- `packages/server/src/scheduling/scheduling-consultant.controller.ts`
- `packages/server/src/scheduling/scheduling.module.ts`
- `packages/shared-types/src/scheduling.ts`
