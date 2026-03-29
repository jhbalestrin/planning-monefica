---
story_key: 3-1-persist-eligibility-per-tenant-employee
epic: 3
story: 1
frs: [ELIG-FR1, ELIG-FR2, ELIG-FR3, ELIG-FR4, ELIG-FR5, ELIG-NFR1]
---

# Story 3.1: Persist eligibility per tenant employee

Status: done

## Story

As a **system**,  
I want **eligibility records scoped by tenant and user**,  
so that **HR can manage sponsorship lists**.

## Acceptance Criteria

1. **Given** Nest **`eligibility`** (or equivalent) module — **When** schemas exist — **Then** documents include **`tenantId`** + **`userId`** (or equivalent FKs) (**ELIG-NFR1**).
2. **No** cross-module Mongoose schema imports (**project-context.md**).
3. Data model supports list/view, mark eligible, remove, reinstate, audit (**ELIG-FR1–FR5** foundation).

## Tasks / Subtasks

- [x] Create `eligibility` module with owned schema(s) — e.g. `BenefitEligibility` or embedded pattern per architecture “Important” item (pick one and document).
- [x] Indexes: compound `(tenantId, userId)` unique if one row per user benefit.
- [x] Audit fields: `updatedBy`, `updatedAt` for ELIG-FR5.

### References

- [Source: _bmad-output/planning-artifacts/prd-eligibility.md]
- [Source: _bmad-output/planning-artifacts/architecture.md — Data architecture]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- `EmployeeEligibility` (`employee_eligibility`): `tenantId`, `userId`, `createdBySub`, `updatedBySub`, Mongoose timestamps; unique `(tenantId,userId)`.
- `EligibilityAuditEvent` (`eligibility_audit_events`): `targetUserId`, `actorSub`, `action` (`marked_eligible` | `removed_eligible`).
- `TenantUserLookupService` in `auth` — eligibility uses service only (no cross-import of tenant schema).

### File List

- packages/server/src/eligibility/eligibility.module.ts
- packages/server/src/eligibility/eligibility.service.ts
- packages/server/src/eligibility/eligibility.service.spec.ts
- packages/server/src/eligibility/schemas/employee-eligibility.schema.ts
- packages/server/src/eligibility/schemas/eligibility-audit-event.schema.ts
- packages/server/src/auth/tenant-user-lookup.service.ts
- packages/server/src/auth/tenant-user-lookup.service.spec.ts
- packages/server/src/auth/auth.module.ts
- packages/server/docs/eligibility.md
- packages/shared-types/src/eligibility.ts
- packages/shared-types/src/index.ts
- packages/server/src/app.module.ts
