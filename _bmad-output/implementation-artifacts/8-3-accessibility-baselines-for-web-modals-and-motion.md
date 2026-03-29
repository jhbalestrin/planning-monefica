---
story_key: 8-3-accessibility-baselines-for-web-modals-and-motion
epic: 8
story: 3
ux: [UX-DR9, UX-DR10, UX-DR11]
---

# Story 8.3: Accessibility baselines for web modals and motion

Status: ready-for-dev

## Story

As a **user with assistive tech or motion sensitivity**,  
I want **keyboard support and reduced motion respected**,  
so that **I can use admin and consultant UIs comfortably**.

## Acceptance Criteria

1. New modals: **focus trap**, **Esc** closes, primary action reachable (**UX-DR10**).
2. **Contrast** on primary controls (**UX-DR9**).
3. **`prefers-reduced-motion`** honored (**UX-DR11**).

## Tasks / Subtasks

- [ ] Shared modal wrapper or document pattern using MUI `Dialog` props.
- [ ] Audit destructive flows (Epic 3.4) and booking confirmations.

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — DR9–DR11]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
