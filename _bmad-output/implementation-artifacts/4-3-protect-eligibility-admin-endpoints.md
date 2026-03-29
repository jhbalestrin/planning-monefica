---
story_key: 4-3-protect-eligibility-admin-endpoints
epic: 4
story: 3
frs: [ELIG-FR9, ELIG-FR12]
---

# Story 4.3: Protect eligibility admin endpoints

Status: done

## Story

As a **platform**,  
I want **only HR admins to change eligibility**,  
so that **employees cannot self-sponsor**.

## Acceptance Criteria

1. **Non–hr_admin** denied on eligibility **mutation** APIs (**ELIG-FR9**).
2. **No cross-tenant** mutations (**ELIG-FR12**).

## Tasks / Subtasks

- [x] Apply `hr_admin` + tenant guard to all ELIG mutating routes from Epic 3.
- [x] Tests: collaborator 403 on POST/PATCH eligibility admin.

### References

- [Source: _bmad-output/planning-artifacts/prd-eligibility.md — FR9, FR12]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- Epic 3 `EligibilityController` already `hr-admin` + `hr_admin` + `TenantIdParamGuard` (ELIG-FR12).
- `eligibility-admin-access.spec.ts`: ic-app collaborator fails `RequireClientGuard`; collaborator + `hr-admin` fails `RequireRolesGuard`.

### File List

- packages/server/src/eligibility/eligibility.controller.ts
- packages/server/src/eligibility/eligibility-admin-access.spec.ts
