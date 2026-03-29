---
story_key: 7-1-queue-of-unassigned-bookings
epic: 7
story: 1
frs: [SCHED-FR9]
ux: [UX-DR8, UX-DR12]
---

# Story 7.1: Queue of unassigned bookings

Status: done

## Story

As a **planning consultant**,  
I want **to see bookings waiting for assignment**,  
so that **no employee is stuck**.

## Acceptance Criteria

1. **Awaiting-assignment** bookings visible in queue; sort policy (e.g. requested time) (**SCHED-FR9**).
2. **Tenant filter** per **`PlatformUser`** — **AD-SCHED-001** (`serveAllTenants` / `tenantIds`).
3. **UX-DR8** primary action **Assumir**; **UX-DR12** table patterns.

## Tasks / Subtasks

- [x] `GET` queue API + control-pane queue view.
- [x] Filter bookings by consultant’s allowed tenants.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — AD-SCHED-001]

## Dev Agent Record

### Agent Model Used

Cursor agent (Amelia / dev-story execution).

### Debug Log References

### Completion Notes List

- `GET consultant/me/assignment-queue` returns rows with `awaitingAssignment: true`, scoped by `serveAllTenants` / `tenantIds` via `PlatformUser`.
- Control-pane `/scheduling/queue`: MUI table + **Assumir** (UX-DR8/DR12); `schedulingQueueApi` + store wiring; nav from Home.

### File List

- `packages/shared-types/src/scheduling.ts`
- `packages/server/src/scheduling/schemas/booking.schema.ts`
- `packages/server/src/scheduling/scheduling-legacy-migration.service.ts`
- `packages/server/src/scheduling/scheduling.service.ts`
- `packages/server/src/scheduling/scheduling-consultant.controller.ts`
- `packages/server/src/scheduling/scheduling.module.ts`
- `packages/server/src/scheduling/scheduling.service.spec.ts`
- `packages/control-pane/src/pages/scheduling-queue/api/schedulingQueueApi.ts`
- `packages/control-pane/src/pages/scheduling-queue/components/QueueView.tsx`
- `packages/control-pane/src/pages/scheduling-queue/containers/QueueContainer.tsx`
- `packages/control-pane/src/pages/scheduling-queue/SchedulingQueuePage.tsx`
- `packages/control-pane/src/pages/scheduling-queue/SchedulingQueuePage.test.tsx`
- `packages/control-pane/src/state/store.ts`
- `packages/control-pane/src/router.tsx`
- `packages/control-pane/src/pages/home/components/HomeView.tsx`
