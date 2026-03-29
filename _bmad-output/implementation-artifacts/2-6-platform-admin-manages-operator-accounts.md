---
story_key: 2-6-platform-admin-manages-operator-accounts
epic: 2
story: 6
frs: [AUTH-FR20]
---

# Story 2.6: Platform admin manages operator accounts

Status: done

## Story

As a **platform admin**,  
I want **to create and disable control-pane operator accounts**,  
so that **internal access is provisioned safely**.

## Acceptance Criteria

1. **Given** `platform_admin` — **When** they **create** or **disable** a **`PlatformUser`** — **Then** control-pane sign-in reflects state (**AUTH-FR20**, **AD-AUTH-002**).

## Tasks / Subtasks

- [x] CRUD (create/disable) APIs on **`PlatformUser`** collection only; guard with `platform_admin`.
- [x] Hash passwords; assign roles (`platform_admin`, `planning_consultant`, …).
- [x] Optional: minimal control-pane admin UI or API-only + seed docs.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — AD-AUTH-002]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- `PlatformOperatorsModule`: `POST /api/v1/platform/users`, `PATCH .../:userId/active`; bcrypt; `serveAllTenants` / `tenantIds` on create; refresh revoked on disable.

### File List

- packages/server/src/platform-operators/platform-operators.module.ts
- packages/server/src/platform-operators/platform-operators.controller.ts
- packages/server/src/platform-operators/platform-operators.service.ts
- packages/server/src/platform-operators/platform-operators.service.spec.ts
- packages/server/src/platform-operators/dto/create-platform-user.dto.ts
- packages/server/src/platform-operators/dto/patch-platform-user-active.dto.ts
