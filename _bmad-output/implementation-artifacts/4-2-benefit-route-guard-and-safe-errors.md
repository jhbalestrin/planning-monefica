---
story_key: 4-2-benefit-route-guard-and-safe-errors
epic: 4
story: 2
frs: [ELIG-FR7, ELIG-FR8, ELIG-FR10, ELIG-FR11]
ux: [UX-DR2]
nfr: [ELIG-NFR3, ELIG-NFR6]
---

# Story 4.2: Benefit route guard and safe errors

Status: done

## Story

As a **collaborator**,  
I want **clear feedback when I am not eligible**,  
so that **I do not think the app is broken**.

## Acceptance Criteria

1. Benefit-scoped routes: **ineligible** or **inactive** → documented **error `code`** (**ELIG-FR7, FR8**).
2. Order: **auth + tenant** then eligibility (**ELIG-FR10**).
3. **Inactive** never passes as eligible (**ELIG-FR11**).
4. **Server SoT** — no client-trusted eligibility flags (**ELIG-NFR3**).
5. Denials countable by reason class (**ELIG-NFR6**).

## Tasks / Subtasks

- [x] Nest guard or middleware on benefit prefix calling eligibility service.
- [x] Register codes in **shared-types** for ic-app mapping (**UX-DR2**).

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — AD-AUTH-001 ELIG-NFR4]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- `BenefitEligibilityGuard` after IC stack; `assertBenefitAccessAllowed` re-checks DB (active, onboarding, eligibility row).
- `BenefitErrorCodes` in shared-types; example route `GET .../benefit/ping`.
- Tests: `benefit-eligibility.guard.spec.ts`, eligibility service assert tests.

### File List

- packages/shared-types/src/eligibility.ts
- packages/server/src/eligibility/benefit-eligibility.guard.ts
- packages/server/src/eligibility/benefit-eligibility.guard.spec.ts
- packages/server/src/eligibility/eligibility.service.ts
- packages/server/src/eligibility/eligibility.module.ts
- packages/server/src/ic/ic.controller.ts
- packages/server/docs/eligibility.md
