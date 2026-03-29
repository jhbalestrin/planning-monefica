---
story_key: 7-4-platform-admin-override
epic: 7
story: 4
frs: [SCHED-FR12]
optional: true
nfr: [SCHED-NFR3]
---

# Story 7.4 (optional): Platform admin override

Status: ready-for-dev

## Story

As a **platform admin**,  
I want **to reassign or cancel bookings for support**,  
so that **ops can fix edge cases**.

## Acceptance Criteria

1. **If SCHED-FR12 in scope:** `platform_admin` may reassign/cancel **with audit** (**SCHED-NFR3**).
2. **If out of scope:** feature flag off; story **skipped** / no UI.

## Tasks / Subtasks

- [ ] Confirm with PM whether **SCHED-FR12** ships this release.
- [ ] Admin-only endpoints + audit; hide UI if deferred.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 7.4]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
