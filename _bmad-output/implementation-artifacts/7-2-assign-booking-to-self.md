---
story_key: 7-2-assign-booking-to-self
epic: 7
story: 2
frs: [SCHED-FR10]
nfr: [SCHED-NFR3]
---

# Story 7.2: Assign booking to self

Status: done

## Story

As a **planning consultant**,  
I want **to claim a booking**,  
so that **I own delivery**.

## Acceptance Criteria

1. **Unassigned** booking — consultant assigns to self — **ownership** set (**SCHED-FR10**).
2. **Audit** event (**SCHED-NFR3**).

## Tasks / Subtasks

- [x] `POST` assign endpoint; concurrency if two consultants claim (reject second).
- [x] Structured audit log.

### References

- [Source: _bmad-output/planning-artifacts/prd-scheduling.md — FR10]

## Dev Agent Record

### Agent Model Used

Cursor agent (Amelia / dev-story execution).

### Debug Log References

### Completion Notes List

- `POST consultant/me/assignment-queue/:bookingId/assign`: slot-owning consultant only; `findOneAndUpdate` with `awaitingAssignment: true` for atomic claim; second writer → `SCHED_ASSIGNMENT_ALREADY_CLAIMED` (`ConflictException`).
- `SchedulingBookingAudit` records assign action (NFR3).

### File List

- `packages/server/src/scheduling/schemas/scheduling-booking-audit.schema.ts`
- `packages/server/src/scheduling/scheduling.service.ts`
- `packages/server/src/scheduling/scheduling-consultant.controller.ts`
- `packages/server/src/scheduling/scheduling.module.ts`
- `packages/server/src/scheduling/scheduling.service.spec.ts`
- `packages/control-pane/src/pages/scheduling-queue/api/schedulingQueueApi.ts`
- `packages/control-pane/src/pages/scheduling-queue/components/QueueView.tsx`
- `packages/control-pane/src/pages/scheduling-queue/containers/QueueContainer.tsx`
