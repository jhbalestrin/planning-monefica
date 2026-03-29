---
story_key: 2-5-hr-admin-activates-and-deactivates-tenant-users
epic: 2
story: 5
frs: [AUTH-FR19]
---

# Story 2.5: HR admin activates and deactivates tenant users

Status: done

## Story

As an **HR admin**,  
I want **to mark employees active or inactive**,  
so that **leavers lose access**.

## Acceptance Criteria

1. **Given** `hr_admin` for a tenant — **When** they **deactivate** a tenant user — **Then** that user **cannot sign in or refresh** (**AUTH-FR4**, **AUTH-FR19**).
2. **Activate** path restores sign-in subject to other policies.

## Tasks / Subtasks

- [x] API: `PATCH` user active flag on **tenant User** (same tenant as JWT only).
- [x] Wire to existing auth checks from Story 1.2.
- [x] Optional: minimal hr-admin UI in this story or note defer to Epic 3 if split.

### References

- [Source: _bmad-output/planning-artifacts/prd-login-authorization-access.md — FR19]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- `HrService.setTenantUserActive` — query by `_id` + `tenantId`; `revokeAllRefreshForUser` when `active: false`.
- UI deferred to Epic 3; API-only.

### File List

- packages/server/src/hr/hr.service.ts
- packages/server/src/hr/hr.service.spec.ts
- packages/server/src/hr/hr.controller.ts
