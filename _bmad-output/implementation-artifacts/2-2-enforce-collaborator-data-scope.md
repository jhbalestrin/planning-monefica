---
story_key: 2-2-enforce-collaborator-data-scope
epic: 2
story: 2
frs: [AUTH-FR13, AUTH-FR16]
---

# Story 2.2: Enforce collaborator data scope

Status: done

## Story

As a **collaborator**,  
I want **my API access limited to my tenant’s IC-scoped resources**,  
so that **I never see another company’s data**.

## Acceptance Criteria

1. **Given** a collaborator token for **tenant A** — **When** they call tenant IC endpoints — **Then** only **tenant A** data is returned (**AUTH-FR13**).
2. **Attempts** to access tenant **B** (e.g. `tenantId` in path/body) **fail**.
3. **Wrong role or wrong client** denied (**AUTH-FR16**).

## Tasks / Subtasks

- [x] Nest **guard** or interceptor: `role === collaborator` + `request.tenantId === jwt.tenantId`.
- [x] Apply to IC-scoped route prefix (define constant e.g. `/api/ic/...` or per-module).
- [x] Integration tests: tenant A user cannot read tenant B resource id.

## Dev Notes

- Use **param validation** — never trust client-supplied `tenantId` over JWT.

### References

- [Source: _bmad-output/planning-artifacts/prd-login-authorization-access.md — FR13, FR16]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- `IcModule`: `GET /api/v1/ic/tenants/:tenantId/ping` with `JwtAuthGuard`, `RequireTenantPrincipalGuard`, `RequireClientGuard` (`ic-app`), `RequireRolesGuard` (`collaborator`), `TenantIdParamGuard`.
- `rbac.guards.spec.ts` — wrong `aud`, wrong role, tenant path ≠ JWT.

### File List

- packages/shared-types/src/auth.ts (`FORBIDDEN`, `TENANT_MISMATCH`, `WRONG_CLIENT_FOR_ROUTE`, `WRONG_PRINCIPAL_TYPE`)
- packages/server/src/ic/ic.module.ts
- packages/server/src/ic/ic.controller.ts
- packages/server/src/auth/auth.module.ts
- packages/server/src/auth/rbac.constants.ts
- packages/server/src/auth/guards/require-client.guard.ts
- packages/server/src/auth/guards/require-roles.guard.ts
- packages/server/src/auth/guards/require-tenant-principal.guard.ts
- packages/server/src/auth/guards/tenant-id-param.guard.ts
- packages/server/src/auth/decorators/rbac.decorator.ts
- packages/server/src/auth/decorators/current-user.decorator.ts
- packages/server/src/app.module.ts
