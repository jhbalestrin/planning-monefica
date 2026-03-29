---
story_key: 4-4-ic-app-benefit-status-screen
epic: 4
story: 4
frs: [ELIG-FR6]
ux: [UX-DR1, UX-DR5, UX-DR6]
---

# Story 4.4: ic-app benefit status screen

Status: done

## Story

As a **collaborator**,  
I want **a home status card in Portuguese**,  
so that **I immediately know if I can plan**.

## Acceptance Criteria

1. Home (or agreed shell) shows **eligible / not eligible / loading / error** with **pt-BR** copy (**UX-DR1**).
2. **Status chip/badge** aligns with **shared-types** enum (**UX-DR6**).
3. Spacing/type roles per **UX-DR5**.

## Tasks / Subtasks

- [x] ic-app screen consuming Story 4.1 API.
- [x] Map error codes to pt-BR strings (**UX-DR2** alignment).

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — § employee benefit status]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- Home `BenefitStatusCard`: RTK `eligibilitySelfApi`, status chip + pt-BR body copy (UX-DR1/DR5/DR6); `benefitPtBr.ts` maps `BenefitErrorCodes`.
- Env: `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_TENANT_ID`, `EXPO_PUBLIC_DEV_ACCESS_TOKEN` (see `ENV_SETUP.md`).

### File List

- packages/ic-app/App.tsx
- packages/ic-app/package.json
- packages/ic-app/src/api/eligibilitySelfApi.ts
- packages/ic-app/src/components/BenefitStatusCard.tsx
- packages/ic-app/src/i18n/benefitPtBr.ts
- packages/ic-app/src/state/store.ts
- packages/ic-app/ENV_SETUP.md
