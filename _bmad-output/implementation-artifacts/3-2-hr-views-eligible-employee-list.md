---
story_key: 3-2-hr-views-eligible-employee-list
epic: 3
story: 2
frs: [ELIG-FR1]
ux: [UX-DR4, UX-DR12]
---

# Story 3.2: HR views eligible employee list

Status: ready-for-dev

## Story

As an **HR admin**,  
I want **to see who is currently eligible**,  
so that **I can audit our sponsorship**.

## Acceptance Criteria

1. **Given** `hr_admin` for tenant A — **When** they open eligibility list — **Then** they see **tenant A only** (**ELIG-FR1**).
2. **Desktop** layout usable per **UX-DR12** (sticky column / min width target).
3. **Theme tokens** for new surfaces **UX-DR4** where applicable.

## Tasks / Subtasks

- [ ] `GET` HR eligibility list API + hr-admin page module (`pages/eligibility/` pattern).
- [ ] RTK Query slice in `api/`; container + presentational components.

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — DR4, DR12]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
