---
story_key: 4-1-employee-eligibility-self-status-api
epic: 4
story: 1
frs: [ELIG-FR6]
ux: [UX-DR1]
---

# Story 4.1: Employee eligibility self-status API

Status: done

## Story

As a **collaborator**,  
I want **to read my eligibility status**,  
so that **the app can show whether I have the benefit**.

## Acceptance Criteria

1. **Given** authenticated collaborator — **When** `GET` self eligibility — **Then** eligible / not eligible / pending per product — **Cannot** read others’ data (**ELIG-FR6**).

## Tasks / Subtasks

- [x] `GET /api/.../eligibility/me` (or equivalent); guard collaborator + tenant.
- [x] Map persistence to DTO in **shared-types**.

### References

- [Source: _bmad-output/planning-artifacts/prd-eligibility.md — FR6]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- `GET /api/v1/ic/tenants/:tenantId/me/eligibility` — JWT `sub` + `tenantId` only; `TenantIdParamGuard` binds path tenant to JWT.
- `EligibilitySelfStatusDto` + `BenefitEligibilityStatus` in shared-types; `getTenantUserBenefitSnapshot` + eligibility row.

### File List

- packages/shared-types/src/eligibility.ts
- packages/server/src/auth/tenant-user-lookup.service.ts
- packages/server/src/eligibility/eligibility.service.ts
- packages/server/src/eligibility/eligibility.service.spec.ts
- packages/server/src/ic/ic.controller.ts
- packages/server/src/ic/ic.module.ts
