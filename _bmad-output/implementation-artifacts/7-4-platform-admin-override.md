---
story_key: 7-4-platform-admin-override
epic: 7
story: 4
frs: [SCHED-FR12]
optional: true
nfr: [SCHED-NFR3]
---

# Story 7.4 (optional): Platform admin override

Status: done

## Story

As a **platform admin**,  
I want **to reassign or cancel bookings for support**,  
so that **ops can fix edge cases**.

## Acceptance Criteria

1. **If SCHED-FR12 in scope:** `platform_admin` may reassign/cancel **with audit** (**SCHED-NFR3**).
2. **If out of scope:** feature flag off; story **skipped** / no UI.

## Tasks / Subtasks

- [x] Confirm with PM whether **SCHED-FR12** ships this release.
- [x] Admin-only endpoints + audit; hide UI if deferred.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 7.4]

## Dev Agent Record

### Agent Model Used

Cursor agent (Amelia / dev-story execution).

### Debug Log References

### Completion Notes List

- **SCHED-FR12 deferred** for this increment: no `platform_admin` scheduling override endpoints, no admin UI. Optional story satisfied under AC2 (“out of scope”).

### File List

- _(none — intentional deferral)_
