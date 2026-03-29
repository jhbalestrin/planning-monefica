---
story_key: 4-3-protect-eligibility-admin-endpoints
epic: 4
story: 3
frs: [ELIG-FR9, ELIG-FR12]
---

# Story 4.3: Protect eligibility admin endpoints

Status: ready-for-dev

## Story

As a **platform**,  
I want **only HR admins to change eligibility**,  
so that **employees cannot self-sponsor**.

## Acceptance Criteria

1. **Non–hr_admin** denied on eligibility **mutation** APIs (**ELIG-FR9**).
2. **No cross-tenant** mutations (**ELIG-FR12**).

## Tasks / Subtasks

- [ ] Apply `hr_admin` + tenant guard to all ELIG mutating routes from Epic 3.
- [ ] Tests: collaborator 403 on POST/PATCH eligibility admin.

### References

- [Source: _bmad-output/planning-artifacts/prd-eligibility.md — FR9, FR12]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
