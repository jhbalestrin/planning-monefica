---
story_key: 3-1-persist-eligibility-per-tenant-employee
epic: 3
story: 1
frs: [ELIG-FR1, ELIG-FR2, ELIG-FR3, ELIG-FR4, ELIG-FR5, ELIG-NFR1]
---

# Story 3.1: Persist eligibility per tenant employee

Status: ready-for-dev

## Story

As a **system**,  
I want **eligibility records scoped by tenant and user**,  
so that **HR can manage sponsorship lists**.

## Acceptance Criteria

1. **Given** Nest **`eligibility`** (or equivalent) module — **When** schemas exist — **Then** documents include **`tenantId`** + **`userId`** (or equivalent FKs) (**ELIG-NFR1**).
2. **No** cross-module Mongoose schema imports (**project-context.md**).
3. Data model supports list/view, mark eligible, remove, reinstate, audit (**ELIG-FR1–FR5** foundation).

## Tasks / Subtasks

- [ ] Create `eligibility` module with owned schema(s) — e.g. `BenefitEligibility` or embedded pattern per architecture “Important” item (pick one and document).
- [ ] Indexes: compound `(tenantId, userId)` unique if one row per user benefit.
- [ ] Audit fields: `updatedBy`, `updatedAt` for ELIG-FR5.

### References

- [Source: _bmad-output/planning-artifacts/prd-eligibility.md]
- [Source: _bmad-output/planning-artifacts/architecture.md — Data architecture]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
