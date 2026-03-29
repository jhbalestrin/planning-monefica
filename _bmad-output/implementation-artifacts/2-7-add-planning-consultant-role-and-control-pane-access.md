---
story_key: 2-7-add-planning-consultant-role-and-control-pane-access
epic: 2
story: 7
frs: []
---

# Story 2.7: Add planning_consultant role and control-pane access

Status: done

## Story

As a **planning consultant**,  
I want **to sign in to control-pane for scheduling work**,  
so that **I never use customer HR or employee apps for my job**.

## Acceptance Criteria

1. **Given** `planning_consultant` on **`PlatformUser`** — **When** they authenticate to **control-pane** — **Then** allowed per app matrix.
2. **Denied** ic-app and hr-admin for that role.
3. **Collaborator / hr_admin** tokens **cannot** call **consultant-only** scheduling admin endpoints.

## Tasks / Subtasks

- [x] Add role literal to **shared-types** + JWT claims.
- [x] Extend client matrix checks (login + guards) for scheduling routes prefix.
- [x] Seed or document creating first `planning_consultant` user.

### References

- [Source: _bmad-output/planning-artifacts/prd-scheduling.md — Auth matrix]
- [Source: _bmad-output/planning-artifacts/architecture.md — AD-SCHED-001, AD-AUTH-002]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- `planning_consultant` already in shared-types + login matrix (Epic 1).
- `SchedulingModule`: `GET /api/v1/scheduling/consultant/ping` — `RequireRoles('planning_consultant')` only (excludes `platform_admin`).
- docs: first consultant via `POST /api/v1/platform/users`.

### File List

- packages/server/src/scheduling/scheduling.module.ts
- packages/server/src/scheduling/scheduling-consultant.controller.ts
- packages/server/docs/auth.md
