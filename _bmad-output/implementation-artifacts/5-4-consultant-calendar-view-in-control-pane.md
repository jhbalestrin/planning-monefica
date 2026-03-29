---
story_key: 5-4-consultant-calendar-view-in-control-pane
epic: 5
story: 4
frs: [SCHED-FR3]
ux: [UX-DR4, UX-DR8]
---

# Story 5.4: Consultant calendar view in control-pane

Status: done

## Story

As a **planning consultant**,  
I want **to see my availability and bookings on a calendar or list**,  
so that **I can manage my week**.

## Acceptance Criteria

1. **Signed-in** `planning_consultant` — scheduling section shows **assignments + availability** summary (**SCHED-FR3**).
2. **Theme tokens** (**UX-DR4**); queue layout patterns (**UX-DR8**).

## Tasks / Subtasks

- [x] control-pane page module + RTK Query to scheduling APIs.
- [x] List or calendar component (MVP: list acceptable if UX agrees).

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 5.4]

## Dev Agent Record

### Agent Model Used

Composer / GPT-5.1

### Debug Log References

### Completion Notes List

- Route `/scheduling`: `GET /api/v1/scheduling/consultant/me/calendar` via RTK Query (`schedulingApi`); rolling 7-day UTC window.
- MVP list UI: stacked sections for availability vs bookings (queue-style vertical lists, UX-DR8); MUI theme palette/shape tokens (UX-DR4).
- `healthApi` uses shared `planningControlPaneBaseQuery` (Bearer token from `localStorage`).

### File List

- `packages/control-pane/src/lib/apiBaseQuery.ts`
- `packages/control-pane/src/pages/home/api/healthApi.ts`
- `packages/control-pane/src/pages/scheduling/api/schedulingApi.ts`
- `packages/control-pane/src/pages/scheduling/calendarRange.ts`
- `packages/control-pane/src/pages/scheduling/calendarRange.test.ts`
- `packages/control-pane/src/pages/scheduling/components/SchedulingView.tsx`
- `packages/control-pane/src/pages/scheduling/containers/SchedulingContainer.tsx`
- `packages/control-pane/src/pages/scheduling/SchedulingPage.tsx`
- `packages/control-pane/src/pages/scheduling/SchedulingPage.test.tsx`
- `packages/control-pane/src/pages/home/components/HomeView.tsx`
- `packages/control-pane/src/router.tsx`
- `packages/control-pane/src/state/store.ts`
- `packages/control-pane/src/main.tsx`
- `packages/server/src/scheduling/scheduling.service.ts` (calendar summary)
- `packages/server/src/scheduling/scheduling-consultant.controller.ts`
- `packages/server/src/scheduling/dto/calendar-query.dto.ts`
