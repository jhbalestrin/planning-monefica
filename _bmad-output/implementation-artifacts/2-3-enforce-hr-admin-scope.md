---
story_key: 2-3-enforce-hr-admin-scope
epic: 2
story: 3
frs: [AUTH-FR14, AUTH-FR16]
---

# Story 2.3: Enforce HR admin scope

Status: ready-for-dev

## Story

As an **HR admin**,  
I want **API access limited to my tenant’s HR resources**,  
so that **I cannot manage another customer’s org**.

## Acceptance Criteria

1. **Given** `hr_admin` for **tenant A** — **When** they use HR-scoped endpoints — **Then** only **tenant A** is affected (**AUTH-FR14**).
2. **Cross-tenant** or **wrong-app** access denied (**AUTH-FR16**).

## Tasks / Subtasks

- [ ] Guard: `hr_admin` + JWT `tenantId` bound to all mutations/queries.
- [ ] Apply to HR admin API surface (eligibility admin, user list, etc.).
- [ ] Tests: hr_admin A cannot hit tenant B ids.

### References

- [Source: _bmad-output/planning-artifacts/prd-login-authorization-access.md — FR14, FR16]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
