---
story_key: 8-3-accessibility-baselines-for-web-modals-and-motion
epic: 8
story: 3
ux: [UX-DR9, UX-DR10, UX-DR11]
---

# Story 8.3: Accessibility baselines for web modals and motion

Status: done

## Story

As a **user with assistive tech or motion sensitivity**,  
I want **keyboard support and reduced motion respected**,  
so that **I can use admin and consultant UIs comfortably**.

## Acceptance Criteria

1. New modals: **focus trap**, **Esc** closes, primary action reachable (**UX-DR10**).
2. **Contrast** on primary controls (**UX-DR9**).
3. **`prefers-reduced-motion`** honored (**UX-DR11**).

## Tasks / Subtasks

- [x] Shared modal wrapper or document pattern using MUI `Dialog` props.
- [x] Audit destructive flows (Epic 3.4) and booking confirmations.

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — DR9–DR11]

## Dev Agent Record

### Agent Model Used

Cursor agent (Amelia / Epic 8 execution).

### Debug Log References

### Completion Notes List

- `PlanningDialog` (hr-admin + control-pane): default `scroll="paper"`, `disableEscapeKeyDown={false}`; JSDoc references UX-DR10. Eligibility remove/add dialogs + queue close dialog use wrapper + `aria-labelledby` / title ids.
- Theme: `MuiCssBaseline` override short-circuits animations/transitions under `prefers-reduced-motion` (UX-DR11).
- Primary `palette.primary.main` set to `#1565c0` (hr-admin) / existing consultant greens (control-pane) for button contrast baseline (UX-DR9).
- Tests: `PlanningDialog.test.tsx` in both web packages.

### File List

- `packages/hr-admin/src/components/PlanningDialog.tsx`
- `packages/hr-admin/src/components/PlanningDialog.test.tsx`
- `packages/hr-admin/src/theme/appTheme.ts`
- `packages/hr-admin/src/pages/eligibility/components/EligibilityListView.tsx`
- `packages/control-pane/src/components/PlanningDialog.tsx`
- `packages/control-pane/src/components/PlanningDialog.test.tsx`
- `packages/control-pane/src/theme/appTheme.ts`
- `packages/control-pane/src/pages/scheduling-queue/components/QueueView.tsx`
