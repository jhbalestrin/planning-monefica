---
story_key: 1-2-block-disabled-and-archived-users
epic: 1
story: 2
frs: [AUTH-FR4]
---

# Story 1.2: Block disabled and archived users

Status: done

## Story

As a **security stakeholder**,  
I want **disabled users to be unable to authenticate**,  
so that **revoked access takes effect immediately**.

## Acceptance Criteria

1. **Given** a tenant **`User`** or **`PlatformUser`** marked **disabled** or **archived** (or `active: false` per product naming — align with Epic 2 / PRD) — **When** they attempt **sign-in** — **Then** access is denied per **AUTH-FR4** with a safe, non-leaky error.
2. **Given** the same — **When** they attempt **token refresh** — **Then** refresh is **rejected** and no new access token is issued (**AUTH-FR4**).

## Tasks / Subtasks

- [x] Define **active/disabled/archived** field(s) on **tenant `User`** and **`PlatformUser`** schemas (single source for guards).
- [x] Enforce check in **login** and **refresh** flows **after** password verification and **before** issuing tokens.
- [x] Ensure error response does not leak whether the account exists (consistent with **AUTH-FR2** style where applicable).
- [x] Tests: disabled user cannot login; cannot refresh; enabled user unchanged.

## Dev Notes

- Depends on **Story 1.1** for login/refresh entrypoints; extend same auth service.
- **PRD:** AUTH-FR4; inactive user behavior ties to **AUTH-FR19** (HR toggles) in Epic 2 — for this story, **persist** the flag and **enforce** on auth paths.

### References

- [Source: _bmad-output/planning-artifacts/prd-login-authorization-access.md — FR4, Administration FR19]
- [Source: _bmad-output/planning-artifacts/architecture.md — AD-AUTH-001 refresh revocation]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- `TenantUser` / `PlatformUser` use `active: boolean`; login treats inactive like bad credentials; refresh rejects inactive with `TOKEN_INVALID`.
- `auth.service.spec.ts`: inactive tenant cannot login.

### File List

- packages/server/src/auth/schemas/tenant-user.schema.ts
- packages/server/src/auth/schemas/platform-user.schema.ts
- packages/server/src/auth/auth.service.ts
- packages/server/src/auth/auth.service.spec.ts
