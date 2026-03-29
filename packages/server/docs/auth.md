# Authentication (Epic 1)

**MVP onboarding (AUTH-FR5):** New **tenant** users (`collaborator` / `hr_admin`) are provisioned with `passwordSetRequired: true`. They **cannot sign in** until they call `POST /api/v1/auth/invite/accept` with the **one-time invite token** and a new password that meets policy (≥10 chars, letter + number). Invite tokens are issued via `POST /api/v1/auth/dev/invite/:tenantUserId` when `AUTH_ENABLE_DEV_INVITES=true` (local/dev only), or by a future hr-admin flow.

**Tokens (AD-AUTH-001):** Short-lived **access JWT** + opaque **refresh token** stored hashed in `refresh_tokens`. **Platform** operators use `platform_users`; **tenant** users use `tenant_users` (AD-AUTH-002).

**Audit logs (AUTH-FR18):** `AuthAuditService` emits one JSON object per line via Nest `Logger`: fields `event`, `correlationId` (incoming `x-request-id` or `x-correlation-id`, else generated UUID; echoed as response `X-Request-Id`), `ts` (ISO-8601), plus event-specific keys (`clientId`, `sub`, `reason`, …). Passwords, full JWTs, and raw refresh/reset/invite tokens are never logged; dev-only reset token logging uses `AUTH_LOG_RESET_TOKEN_IN_DEV=true`.
