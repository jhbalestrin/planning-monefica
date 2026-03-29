---
story_key: 8-1-mui-theme-tokens-for-new-surfaces
epic: 8
story: 1
ux: [UX-DR4]
---

# Story 8.1: MUI theme tokens for new surfaces

Status: done

## Story

As a **developer**,  
I want **shared spacing, radius, and typography in both web apps**,  
so that **new pages look consistent**.

## Acceptance Criteria

1. **hr-admin** + **control-pane** theme exposes **spacing, radius, typography** tokens (**UX-DR4**).
2. New eligibility/scheduling screens consume tokens — avoid one-off magic numbers.

## Tasks / Subtasks

- [x] Audit `theme.ts` (or equivalent) in both packages; extend tokens.
- [x] Refactor one pilot screen to use tokens as reference.

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — DR4]

## Dev Agent Record

### Agent Model Used

Cursor agent (Amelia / Epic 8 execution).

### Debug Log References

### Completion Notes List

- `PLANNING_WEB_UX` in `shared-types` centralizes layout/table numeric tokens; MUI `spacing` + `shape.borderRadius` + typography roles in `createHrAdminTheme` / `createControlPaneTheme`.
- Pilots: `EligibilityListView`, `HomeView` (hr-admin); `SchedulingView`, `QueueView` (control-pane) import `PLANNING_WEB_UX` for maxWidth/minWidth.

### File List

- `packages/shared-types/src/planningUxTokens.ts`
- `packages/shared-types/src/index.ts`
- `packages/hr-admin/src/theme/appTheme.ts`
- `packages/hr-admin/src/main.tsx`
- `packages/hr-admin/src/pages/eligibility/components/EligibilityListView.tsx`
- `packages/hr-admin/src/pages/home/components/HomeView.tsx`
- `packages/control-pane/src/theme/appTheme.ts`
- `packages/control-pane/src/main.tsx`
- `packages/control-pane/src/pages/scheduling/components/SchedulingView.tsx`
- `packages/control-pane/src/pages/scheduling-queue/components/QueueView.tsx`
