---
story_key: 6-1-list-bookable-slots-for-eligible-employees
epic: 6
story: 1
frs: [SCHED-FR4, SCHED-FR13]
ux: [UX-DR2, UX-DR7]
---

# Story 6.1: List bookable slots for eligible employees

Status: done

## Story

As a **collaborator**,  
I want **to see available times for my company**,  
so that **I can choose a session**.

## Acceptance Criteria

1. **Eligible active** collaborator — slots for **date range** (server max enforced) — **tenant only** (**SCHED-FR4**).
2. **Ineligible/inactive** denied (**SCHED-FR13**).

## Tasks / Subtasks

- [x] ic-app + API `GET` slots; reuse Epic 4 eligibility checks.
- [x] Confirmation copy path toward **UX-DR7**.

### References

- [Source: _bmad-output/planning-artifacts/prd-scheduling.md — FR4, FR13]

## Dev Agent Record

### Agent Model Used

Composer / GPT-5.1

### Debug Log References

### Completion Notes List

- `GET /api/v1/ic/tenants/:tenantId/scheduling/slots` behind `BenefitEligibilityGuard` (SCHED-FR13); `listBookableSlotsForCollaborator` merges availability across consultants for tenant (SCHED-FR4).
- `SCHED_SLOT_QUERY_MAX_DAYS` (default 31) caps range → `SCHED_RANGE_EXCEEDS_MAX`.
- ic-app: `PlanningSessionsCard` + `schedulingApi` + `weekRangeUtc`; confirmation line helper in `schedulingPtBr` (UX-DR7 path).

### File List

- `packages/server/src/ic/ic.controller.ts`
- `packages/server/src/ic/ic.module.ts`
- `packages/server/src/scheduling/scheduling.service.ts`
- `packages/server/src/scheduling/dto/collaborator-slots-query.dto.ts`
- `packages/shared-types/src/scheduling.ts`
- `packages/ic-app/src/api/schedulingApi.ts`
- `packages/ic-app/src/components/PlanningSessionsCard.tsx`
- `packages/ic-app/src/i18n/schedulingPtBr.ts`
- `packages/ic-app/src/state/store.ts`
- `packages/ic-app/App.tsx`
