---
story_key: 1-4-change-password-while-signed-in
epic: 1
story: 4
frs: [AUTH-FR6, AUTH-FR9]
---

# Story 1.4: Change password while signed in

Status: done

## Story

As a **signed-in user**,  
I want **to change my password**,  
so that **I can rotate credentials**.

## Acceptance Criteria

1. **Given** an authenticated user (tenant or platform per **principalType**) — **When** they submit **current password** + **new password** meeting policy — **Then** the new password is stored with strong hashing (**AUTH-NFR1**, **AUTH-FR6**).
2. **Given** successful password change — **Then** **all refresh tokens** for that principal are **revoked** (**AUTH-FR9**, **AD-AUTH-001**); access JWT may live until **exp** (short TTL).

## Tasks / Subtasks

- [x] `POST` (or `PATCH`) change-password endpoint; guard with JWT auth.
- [x] Verify current password; reject weak new password per policy.
- [x] Revoke refresh token family for user + `principalType` in DB.
- [x] Tests: change password success; wrong current password fails; refresh after change fails until re-login.

## Dev Notes

- Reuse same hashing lib as login (e.g. bcrypt/argon2) per **AUTH-NFR1**.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — AD-AUTH-001 password change row]
- [Source: _bmad-output/planning-artifacts/prd-login-authorization-access.md — FR6, FR9]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- `POST /api/v1/auth/password` (JWT); `assertPasswordPolicy` on new password; `revokeAllRefreshForUser` after success.
- Tests: `changePassword` wrong current + success + `refreshUpdateMany` in `auth.service.spec.ts`; `password-policy.spec.ts`.

### File List

- packages/server/src/auth/auth.service.ts
- packages/server/src/auth/auth.service.spec.ts
- packages/server/src/auth/password-policy.ts
- packages/server/src/auth/password-policy.spec.ts
- packages/server/src/auth/dto/change-password.dto.ts
- packages/server/src/auth/auth.controller.ts
