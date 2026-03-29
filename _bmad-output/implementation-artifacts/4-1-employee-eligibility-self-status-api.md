---
story_key: 4-1-employee-eligibility-self-status-api
epic: 4
story: 1
frs: [ELIG-FR6]
ux: [UX-DR1]
---

# Story 4.1: Employee eligibility self-status API

Status: ready-for-dev

## Story

As a **collaborator**,  
I want **to read my eligibility status**,  
so that **the app can show whether I have the benefit**.

## Acceptance Criteria

1. **Given** authenticated collaborator — **When** `GET` self eligibility — **Then** eligible / not eligible / pending per product — **Cannot** read others’ data (**ELIG-FR6**).

## Tasks / Subtasks

- [ ] `GET /api/.../eligibility/me` (or equivalent); guard collaborator + tenant.
- [ ] Map persistence to DTO in **shared-types**.

### References

- [Source: _bmad-output/planning-artifacts/prd-eligibility.md — FR6]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
