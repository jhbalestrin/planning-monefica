---
story_key: 2-4-enforce-platform-admin-isolation-from-tenant-roles
epic: 2
story: 4
frs: [AUTH-FR15, AUTH-FR16]
---

# Story 2.4: Enforce platform admin isolation from tenant roles

Status: ready-for-dev

## Story

As a **platform admin**,  
I want **platform APIs without implicit tenant HR/IC powers**,  
so that **internal ops cannot accidentally act as a customer HR user**.

## Acceptance Criteria

1. **Given** `platform_admin` token — **When** they call **platform** endpoints — **Then** success per policy (**AUTH-FR15**).
2. **They cannot** use tenant **HR/IC-only** endpoints as if `hr_admin`/`collaborator` (**AUTH-FR15**, **AUTH-FR16**).

## Tasks / Subtasks

- [ ] Separate route groups: `PlatformGuard` vs `TenantHrGuard` vs `CollaboratorGuard`.
- [ ] Deny `platform_admin` on tenant-scoped HR/IC mutations unless explicit future impersonation (out of scope).
- [ ] Tests: platform token 403 on representative tenant HR route.

### References

- [Source: _bmad-output/planning-artifacts/prd-login-authorization-access.md — FR15, FR16]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
