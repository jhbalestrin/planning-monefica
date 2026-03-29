---
story_key: 8-4-ic-app-spacing-and-typography-constants
epic: 8
story: 4
ux: [UX-DR5]
---

# Story 8.4: ic-app spacing and typography constants

Status: done

## Story

As a **developer**,  
I want **documented spacing and type roles on mobile**,  
so that **screens stay consistent before a full design system lands**.

## Acceptance Criteria

1. ic-app imports **shared spacing + text style constants** (or RN Paper theme) (**UX-DR5**).
2. **Touch targets** meet minimum size per UX spec.

## Tasks / Subtasks

- [x] Add `constants/theme.ts` (or extend existing) with scale + type roles.
- [x] Apply to home status (Epic 4.4) and booking list pilot.

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — DR5]

## Dev Agent Record

### Agent Model Used

Cursor agent (Amelia / Epic 8 execution).

### Debug Log References

### Completion Notes List

- `packages/ic-app/src/constants/theme.ts`: `PLANNING_MOBILE_SPACING`, `PLANNING_MOBILE_RADIUS`, `PLANNING_MOBILE_TYPE`, `PLANNING_MIN_TOUCH_TARGET` (44).
- `BenefitStatusCard` + `PlanningSessionsCard` consume constants; slot rows and cancel control use `minHeight: PLANNING_MIN_TOUCH_TARGET`.

### File List

- `packages/ic-app/src/constants/theme.ts`
- `packages/ic-app/src/components/BenefitStatusCard.tsx`
- `packages/ic-app/src/components/PlanningSessionsCard.tsx`
