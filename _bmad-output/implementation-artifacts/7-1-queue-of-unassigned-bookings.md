---
story_key: 7-1-queue-of-unassigned-bookings
epic: 7
story: 1
frs: [SCHED-FR9]
ux: [UX-DR8, UX-DR12]
---

# Story 7.1: Queue of unassigned bookings

Status: ready-for-dev

## Story

As a **planning consultant**,  
I want **to see bookings waiting for assignment**,  
so that **no employee is stuck**.

## Acceptance Criteria

1. **Awaiting-assignment** bookings visible in queue; sort policy (e.g. requested time) (**SCHED-FR9**).
2. **Tenant filter** per **`PlatformUser`** — **AD-SCHED-001** (`serveAllTenants` / `tenantIds`).
3. **UX-DR8** primary action **Assumir**; **UX-DR12** table patterns.

## Tasks / Subtasks

- [ ] `GET` queue API + control-pane queue view.
- [ ] Filter bookings by consultant’s allowed tenants.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — AD-SCHED-001]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
