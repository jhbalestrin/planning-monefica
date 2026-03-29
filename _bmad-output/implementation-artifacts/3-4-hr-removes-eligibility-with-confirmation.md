---
story_key: 3-4-hr-removes-eligibility-with-confirmation
epic: 3
story: 4
frs: [ELIG-FR3, ELIG-FR5]
ux: [UX-DR3]
nfr: [ELIG-NFR5, ELIG-NFR2]
---

# Story 3.4: HR removes eligibility with confirmation

Status: ready-for-dev

## Story

As an **HR admin**,  
I want **to remove eligibility with a clear confirmation**,  
so that **I do not revoke access by mistake**.

## Acceptance Criteria

1. **Given** eligible employee — **When** HR removes — **Then** **two-step confirmation** (**UX-DR3**, **ELIG-NFR5**).
2. After confirm, employee **not eligible** (**ELIG-FR3**).
3. **Audit** actor, timestamp, target (**ELIG-FR5**, **ELIG-NFR2**).

## Tasks / Subtasks

- [ ] Destructive flow in hr-admin modal; primary/secondary actions per UX-DR10 when modal used.
- [ ] API records audit trail.

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — DR3]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
