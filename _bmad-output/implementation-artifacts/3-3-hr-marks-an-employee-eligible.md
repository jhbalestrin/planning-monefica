---
story_key: 3-3-hr-marks-an-employee-eligible
epic: 3
story: 3
frs: [ELIG-FR2, ELIG-FR4]
ux: [UX-DR4]
---

# Story 3.3: HR marks an employee eligible

Status: ready-for-dev

## Story

As an **HR admin**,  
I want **to add eligibility for an employee**,  
so that **they can use the benefit**.

## Acceptance Criteria

1. **Given** existing **collaborator** in tenant A — **When** HR marks eligible — **Then** they appear eligible in list (**ELIG-FR2**).
2. **Corrections / reinstate** supported via same patterns (**ELIG-FR4**).

## Tasks / Subtasks

- [ ] `POST`/`PATCH` mutation API; validate user is collaborator in tenant.
- [ ] hr-admin UI: select employee + confirm add.

### References

- [Source: _bmad-output/planning-artifacts/prd-eligibility.md — FR2, FR4]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
