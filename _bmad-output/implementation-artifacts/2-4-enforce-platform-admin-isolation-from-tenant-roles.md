---
story_key: 2-4-enforce-platform-admin-isolation-from-tenant-roles
epic: 2
story: 4
frs: [AUTH-FR15, AUTH-FR16]
---

# Story 2.4: Enforce platform admin isolation from tenant roles

Status: done

## Story

As a **platform admin**,  
I want **platform APIs without implicit tenant HR/IC powers**,  
so that **internal ops cannot accidentally act as a customer HR user**.

## Acceptance Criteria

1. **Given** `platform_admin` token — **When** they call **platform** endpoints — **Then** success per policy (**AUTH-FR15**).
2. **They cannot** use tenant **HR/IC-only** endpoints as if `hr_admin`/`collaborator` (**AUTH-FR15**, **AUTH-FR16**).

## Tasks / Subtasks

- [x] Separate route groups: `PlatformGuard` vs `TenantHrGuard` vs `CollaboratorGuard`.
- [x] Deny `platform_admin` on tenant-scoped HR/IC mutations unless explicit future impersonation (out of scope).
- [x] Tests: platform token 403 on representative tenant HR route.

### References

- [Source: _bmad-output/planning-artifacts/prd-login-authorization-access.md — FR15, FR16]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- Tenant routes use `RequireTenantPrincipalGuard` → `403 WRONG_PRINCIPAL_TYPE` for `platform_user`.
- Platform routes use `RequirePlatformPrincipalGuard`.
- `rbac.guards.spec.ts` covers platform user rejected on tenant-style handler context.

### File List

- packages/server/src/auth/guards/require-platform-principal.guard.ts
- packages/server/src/auth/guards/require-tenant-principal.guard.ts
- packages/server/src/auth/guards/rbac.guards.spec.ts
