---
story_key: 3-2-hr-views-eligible-employee-list
epic: 3
story: 2
frs: [ELIG-FR1]
ux: [UX-DR4, UX-DR12]
---

# Story 3.2: HR views eligible employee list

Status: done

## Story

As an **HR admin**,  
I want **to see who is currently eligible**,  
so that **I can audit our sponsorship**.

## Acceptance Criteria

1. **Given** `hr_admin` for tenant A — **When** they open eligibility list — **Then** they see **tenant A only** (**ELIG-FR1**).
2. **Desktop** layout usable per **UX-DR12** (sticky column / min width target).
3. **Theme tokens** for new surfaces **UX-DR4** where applicable.

## Tasks / Subtasks

- [x] `GET` HR eligibility list API + hr-admin page module (`pages/eligibility/` pattern).
- [x] RTK Query slice in `api/`; container + presentational components.

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — DR4, DR12]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- `GET /api/v1/hr/tenants/:tenantId/eligibility` + `EligibilityService.listForTenant`.
- hr-admin: `pages/eligibility/` — MUI table sticky header + sticky email column (UX-DR12); theme via existing MUI (UX-DR4).
- `EligibilityListView.test.tsx` smoke test.

### File List

- packages/server/src/eligibility/eligibility.controller.ts
- packages/server/src/eligibility/eligibility.service.ts
- packages/hr-admin/src/pages/eligibility/EligibilityPage.tsx
- packages/hr-admin/src/pages/eligibility/containers/EligibilityContainer.tsx
- packages/hr-admin/src/pages/eligibility/components/EligibilityListView.tsx
- packages/hr-admin/src/pages/eligibility/api/eligibilityApi.ts
- packages/hr-admin/src/lib/apiBaseQuery.ts
- packages/hr-admin/src/lib/hrTenantId.ts
- packages/hr-admin/src/state/store.ts
- packages/hr-admin/src/router.tsx
- packages/hr-admin/src/pages/home/components/HomeView.tsx
- packages/hr-admin/src/vite-env.d.ts
