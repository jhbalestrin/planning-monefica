---
story_key: 4-2-benefit-route-guard-and-safe-errors
epic: 4
story: 2
frs: [ELIG-FR7, ELIG-FR8, ELIG-FR10, ELIG-FR11]
ux: [UX-DR2]
nfr: [ELIG-NFR3, ELIG-NFR6]
---

# Story 4.2: Benefit route guard and safe errors

Status: ready-for-dev

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

- [ ] Nest guard or middleware on benefit prefix calling eligibility service.
- [ ] Register codes in **shared-types** for ic-app mapping (**UX-DR2**).

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — AD-AUTH-001 ELIG-NFR4]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
