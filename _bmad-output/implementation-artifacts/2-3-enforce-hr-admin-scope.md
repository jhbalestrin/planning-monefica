---
story_key: 2-3-enforce-hr-admin-scope
epic: 2
story: 3
frs: [AUTH-FR14, AUTH-FR16]
---

# Story 2.3: Enforce HR admin scope

Status: done

## Story

As an **HR admin**,  
I want **API access limited to my tenant’s HR resources**,  
so that **I cannot manage another customer’s org**.

## Acceptance Criteria

1. **Given** `hr_admin` for **tenant A** — **When** they use HR-scoped endpoints — **Then** only **tenant A** is affected (**AUTH-FR14**).
2. **Cross-tenant** or **wrong-app** access denied (**AUTH-FR16**).

## Tasks / Subtasks

- [x] Guard: `hr_admin` + JWT `tenantId` bound to all mutations/queries.
- [x] Apply to HR admin API surface (eligibility admin, user list, etc.).
- [x] Tests: hr_admin A cannot hit tenant B ids.

### References

- [Source: _bmad-output/planning-artifacts/prd-login-authorization-access.md — FR14, FR16]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- `HrModule`: `PATCH .../hr/tenants/:tenantId/users/:userId/active` — same guard stack as IC with `aud: hr-admin`, `hr_admin`, `TenantIdParamGuard`.

### File List

- packages/server/src/hr/hr.module.ts
- packages/server/src/hr/hr.controller.ts
- packages/server/src/hr/hr.service.ts
- packages/server/src/hr/hr.service.spec.ts
- packages/server/src/hr/dto/patch-tenant-user-active.dto.ts
