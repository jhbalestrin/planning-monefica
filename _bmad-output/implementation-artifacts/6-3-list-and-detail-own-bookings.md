---
story_key: 6-3-list-and-detail-own-bookings
epic: 6
story: 3
frs: [SCHED-FR6]
ux: [UX-DR6]
---

# Story 6.3: List and detail own bookings

Status: done

## Story

As a **collaborator**,  
I want **to see my upcoming and past sessions**,  
so that **I can track my plan**.

## Acceptance Criteria

1. **“Minhas sessões”** (or agreed route) lists **own** bookings with **status badges** (**SCHED-FR6**).
2. Statuses = **shared-types** enums (**UX-DR6**).

## Tasks / Subtasks

- [x] `GET` bookings for `jwt.sub` + tenant; ic-app list + optional detail.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 6.3]

## Dev Agent Record

### Agent Model Used

Composer / GPT-5.1

### Debug Log References

### Completion Notes List

- `GET .../scheduling/bookings` (+ optional `fromUtc`/`toUtc` pair) and `GET .../bookings/:bookingId`; scoped to `employeeUserId` = JWT `sub` + path `tenantId`.
- ic-app **Minhas sessões** `FlatList` + `bookingStateChipPtBr` (UX-DR6).

### File List

- `packages/server/src/scheduling/scheduling.service.ts`
- `packages/server/src/scheduling/dto/collaborator-bookings-query.dto.ts`
- `packages/server/src/ic/ic.controller.ts`
- `packages/ic-app/src/api/schedulingApi.ts`
- `packages/ic-app/src/components/PlanningSessionsCard.tsx`
- `packages/ic-app/src/i18n/schedulingPtBr.ts`
