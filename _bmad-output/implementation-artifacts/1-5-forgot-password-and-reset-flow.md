---
story_key: 1-5-forgot-password-and-reset-flow
epic: 1
story: 5
frs: [AUTH-FR7, AUTH-FR8]
---

# Story 1.5: Forgot-password and reset flow

Status: done

## Story

As a **user who forgot their password**,  
I want **to request a reset through a verified channel**,  
so that **I can regain access**.

## Acceptance Criteria

1. **Given** a registered user (email/identifier per product) — **When** they request password reset — **Then** at least one MVP channel works (**AUTH-FR7**); recommend **email link** with opaque token (actual email delivery can be **logged stub** in dev if no SMTP yet — document).
2. **Given** a valid reset token — **When** user submits new password — **Then** password updates and token is **consumed** (**AUTH-FR8** single-use).
3. **Tokens** expire per config; stored **hashed** if persisted (**AUTH-NFR5**, **AUTH-FR8**).

## Tasks / Subtasks

- [x] `POST` request-reset (rate-limit friendly; avoid user enumeration — generic success message).
- [x] `POST` confirm-reset with token + new password.
- [x] Persist reset tokens (hashed), expiry, one-time use; scope by `principalType` + identity.
- [x] Tests: full reset flow; expired token; reused token rejected.

## Dev Notes

- **Non-leaky:** Same response shape for unknown email as known (per PRD **FR2** spirit).
- If SMTP not configured, log reset link in dev mode only — never in production without env guard.

### References

- [Source: _bmad-output/planning-artifacts/prd-login-authorization-access.md — FR7, FR8, NFR5]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- `POST .../password/request-reset` + `POST .../password/reset`; `auth_password_reset_tokens`; generic success when email unknown; dev-only raw token log via `AUTH_LOG_RESET_TOKEN_IN_DEV`.
- Tests: `confirmPasswordReset` success path, unknown/expired/consumed token rejections in `auth.service.spec.ts`.

### File List

- packages/server/src/auth/auth.service.ts
- packages/server/src/auth/auth.service.spec.ts
- packages/server/src/auth/schemas/password-reset-token.schema.ts
- packages/server/src/auth/dto/request-reset.dto.ts
- packages/server/src/auth/dto/confirm-reset.dto.ts
- packages/server/src/auth/auth.controller.ts
- packages/server/docs/auth.md
- packages/server/.env.example
