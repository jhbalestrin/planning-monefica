---
story_key: 2-5-hr-admin-activates-and-deactivates-tenant-users
epic: 2
story: 5
frs: [AUTH-FR19]
---

# Story 2.5: HR admin activates and deactivates tenant users

Status: ready-for-dev

## Story

As an **HR admin**,  
I want **to mark employees active or inactive**,  
so that **leavers lose access**.

## Acceptance Criteria

1. **Given** `hr_admin` for a tenant — **When** they **deactivate** a tenant user — **Then** that user **cannot sign in or refresh** (**AUTH-FR4**, **AUTH-FR19**).
2. **Activate** path restores sign-in subject to other policies.

## Tasks / Subtasks

- [ ] API: `PATCH` user active flag on **tenant User** (same tenant as JWT only).
- [ ] Wire to existing auth checks from Story 1.2.
- [ ] Optional: minimal hr-admin UI in this story or note defer to Epic 3 if split.

### References

- [Source: _bmad-output/planning-artifacts/prd-login-authorization-access.md — FR19]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
