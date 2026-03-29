---
story_key: 2-2-enforce-collaborator-data-scope
epic: 2
story: 2
frs: [AUTH-FR13, AUTH-FR16]
---

# Story 2.2: Enforce collaborator data scope

Status: ready-for-dev

## Story

As a **collaborator**,  
I want **my API access limited to my tenant’s IC-scoped resources**,  
so that **I never see another company’s data**.

## Acceptance Criteria

1. **Given** a collaborator token for **tenant A** — **When** they call tenant IC endpoints — **Then** only **tenant A** data is returned (**AUTH-FR13**).
2. **Attempts** to access tenant **B** (e.g. `tenantId` in path/body) **fail**.
3. **Wrong role or wrong client** denied (**AUTH-FR16**).

## Tasks / Subtasks

- [ ] Nest **guard** or interceptor: `role === collaborator` + `request.tenantId === jwt.tenantId`.
- [ ] Apply to IC-scoped route prefix (define constant e.g. `/api/ic/...` or per-module).
- [ ] Integration tests: tenant A user cannot read tenant B resource id.

## Dev Notes

- Use **param validation** — never trust client-supplied `tenantId` over JWT.

### References

- [Source: _bmad-output/planning-artifacts/prd-login-authorization-access.md — FR13, FR16]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
