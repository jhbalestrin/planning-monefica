---
story_key: 3-3-hr-marks-an-employee-eligible
epic: 3
story: 3
frs: [ELIG-FR2, ELIG-FR4]
ux: [UX-DR4]
---

# Story 3.3: HR marks an employee eligible

Status: done

## Story

As an **HR admin**,  
I want **to add eligibility for an employee**,  
so that **they can use the benefit**.

## Acceptance Criteria

1. **Given** existing **collaborator** in tenant A — **When** HR marks eligible — **Then** they appear eligible in list (**ELIG-FR2**).
2. **Corrections / reinstate** supported via same patterns (**ELIG-FR4**).

## Tasks / Subtasks

- [x] `POST`/`PATCH` mutation API; validate user is collaborator in tenant.
- [x] hr-admin UI: select employee + confirm add.

### References

- [Source: _bmad-output/planning-artifacts/prd-eligibility.md — FR2, FR4]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- `POST /api/v1/hr/tenants/:tenantId/eligibility` + `TenantUserLookupService.assertCollaboratorInTenant`; idempotent upsert + audit `marked_eligible`.
- `GET .../eligibility/collaborators?excludeEligible=true` for picker; UI Autocomplete + confirm dialog.

### File List

- packages/server/src/eligibility/eligibility.service.ts
- packages/server/src/eligibility/dto/mark-eligibility.dto.ts
- packages/hr-admin/src/pages/eligibility/components/EligibilityListView.tsx
- packages/hr-admin/src/pages/eligibility/containers/EligibilityContainer.tsx
- packages/hr-admin/src/pages/eligibility/api/eligibilityApi.ts
