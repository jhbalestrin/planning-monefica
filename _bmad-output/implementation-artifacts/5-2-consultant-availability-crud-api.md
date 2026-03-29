---
story_key: 5-2-consultant-availability-crud-api
epic: 5
story: 2
frs: [SCHED-FR1]
ux: [UX-DR4]
---

# Story 5.2: Consultant availability CRUD API

Status: done

## Story

As a **planning consultant**,  
I want **to create, update, and delete my availability blocks**,  
so that **employees only see times I offer**.

## Acceptance Criteria

1. **Given** `planning_consultant` — **When** CRUD via API — **Then** blocks persist; validation prevents invalid overlaps per product rules (**SCHED-FR1**).
2. Only **own** blocks mutable unless admin override (later).

## Tasks / Subtasks

- [x] REST endpoints + `ConsultantGuard` + **AD-SCHED-001** tenant visibility (consultant identity from `PlatformUser`).
- [x] DTOs in **shared-types**.

### References

- [Source: _bmad-output/planning-artifacts/prd-scheduling.md — FR1]

## Dev Agent Record

### Agent Model Used

Composer / GPT-5.1

### Debug Log References

### Completion Notes List

- `PlatformUserLookupService` (auth) loads `serveAllTenants` / `tenantIds` / `roles` / `active` from DB; `SchedulingService` enforces tenant on CRUD (AD-SCHED-001).
- Consultant-only routes under `/api/v1/scheduling/consultant/me/availability` (POST, GET, PATCH `:id`, DELETE `:id`); overlap rejected with `SCHED_AVAILABILITY_OVERLAP`.
- shared-types: `packages/shared-types/src/scheduling.ts` (+ barrel export).

### File List

- `packages/server/src/auth/platform-user-lookup.service.ts`
- `packages/server/src/auth/platform-user-lookup.service.spec.ts`
- `packages/server/src/auth/auth.module.ts`
- `packages/server/src/scheduling/scheduling.service.ts`
- `packages/server/src/scheduling/scheduling.service.spec.ts`
- `packages/server/src/scheduling/scheduling-consultant.controller.ts`
- `packages/server/src/scheduling/dto/create-availability-block.dto.ts`
- `packages/server/src/scheduling/dto/update-availability-block.dto.ts`
- `packages/server/src/scheduling/dto/date-range-query.dto.ts`
- `packages/shared-types/src/scheduling.ts`
- `packages/shared-types/src/index.ts`
