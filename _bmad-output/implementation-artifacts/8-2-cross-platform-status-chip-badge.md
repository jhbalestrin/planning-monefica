---
story_key: 8-2-cross-platform-status-chip-badge
epic: 8
story: 2
ux: [UX-DR6, UX-DR9]
---

# Story 8.2: Cross-platform status chip / badge

Status: done

## Story

As a **developer**,  
I want **one enum-driven status presentation pattern**,  
so that **eligibility and booking states match across apps**.

## Acceptance Criteria

1. **shared-types** enums drive **MUI Chip** (web) + **RN** mapping (mobile) (**UX-DR6**).
2. **Contrast** on chip backgrounds (**UX-DR9**).

## Tasks / Subtasks

- [x] Shared mapping util or small components in each app (no duplicate enum strings).
- [x] Document color pairs for WCAG check.

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — DR6, DR9]

## Dev Agent Record

### Agent Model Used

Cursor agent (Amelia / Epic 8 execution).

### Debug Log References

### Completion Notes List

- `statusPresentation.ts`: `STATUS_CHIP_COLOR_PAIRS` + `wcagNote` per semantic; `benefitEligibilityStatusPresentation`, `bookingStatePresentation`, `statusSemanticToChipColors`.
- Web: `BenefitEligibilityStatusChip`, `BookingStateChip`; eligibility table Status column; scheduling calendar booking rows use `BookingStateChip`.
- Mobile: `BenefitStatusCard`, `PlanningSessionsCard` use shared color functions; labels remain pt-BR in `i18n/*`.
- Tests: `packages/control-pane/src/lib/statusPresentation.test.ts`.

### File List

- `packages/shared-types/src/statusPresentation.ts`
- `packages/shared-types/src/index.ts`
- `packages/hr-admin/src/components/BenefitEligibilityStatusChip.tsx`
- `packages/hr-admin/src/pages/eligibility/components/EligibilityListView.tsx`
- `packages/hr-admin/src/pages/eligibility/components/EligibilityListView.test.tsx`
- `packages/control-pane/src/components/BookingStateChip.tsx`
- `packages/control-pane/src/pages/scheduling/components/SchedulingView.tsx`
- `packages/control-pane/src/lib/statusPresentation.test.ts`
- `packages/ic-app/src/components/BenefitStatusCard.tsx`
- `packages/ic-app/src/components/PlanningSessionsCard.tsx`
