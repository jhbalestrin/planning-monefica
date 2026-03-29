---
story_key: 3-4-hr-removes-eligibility-with-confirmation
epic: 3
story: 4
frs: [ELIG-FR3, ELIG-FR5]
ux: [UX-DR3]
nfr: [ELIG-NFR5, ELIG-NFR2]
---

# Story 3.4: HR removes eligibility with confirmation

Status: done

## Story

As an **HR admin**,  
I want **to remove eligibility with a clear confirmation**,  
so that **I do not revoke access by mistake**.

## Acceptance Criteria

1. **Given** eligible employee — **When** HR removes — **Then** **two-step confirmation** (**UX-DR3**, **ELIG-NFR5**).
2. After confirm, employee **not eligible** (**ELIG-FR3**).
3. **Audit** actor, timestamp, target (**ELIG-FR5**, **ELIG-NFR2**).

## Tasks / Subtasks

- [x] Destructive flow in hr-admin modal; primary/secondary actions per UX-DR10 when modal used.
- [x] API records audit trail.

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — DR3]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- Two-step MUI dialogs: warn → final confirm (UX-DR3); `DELETE .../eligibility/:userId` + `removed_eligible` audit row (ELIG-FR5, ELIG-NFR2).

### File List

- packages/server/src/eligibility/eligibility.service.ts
- packages/hr-admin/src/pages/eligibility/components/EligibilityListView.tsx
- packages/hr-admin/src/pages/eligibility/containers/EligibilityContainer.tsx
- packages/hr-admin/src/pages/eligibility/api/eligibilityApi.ts
- packages/hr-admin/src/pages/eligibility/components/EligibilityListView.test.tsx
