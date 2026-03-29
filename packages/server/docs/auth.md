# Authentication (Epic 1)

**MVP onboarding (AUTH-FR5):** New **tenant** users (`collaborator` / `hr_admin`) are provisioned with `passwordSetRequired: true`. They **cannot sign in** until they call `POST /api/v1/auth/invite/accept` with the **one-time invite token** and a new password that meets policy (≥10 chars, letter + number). Invite tokens are issued via `POST /api/v1/auth/dev/invite/:tenantUserId` when `AUTH_ENABLE_DEV_INVITES=true` (local/dev only), or by a future hr-admin flow.

**Tokens (AD-AUTH-001):** Short-lived **access JWT** + opaque **refresh token** stored hashed in `refresh_tokens`. **Platform** operators use `platform_users`; **tenant** users use `tenant_users` (AD-AUTH-002).

**Audit logs (AUTH-FR18):** `AuthAuditService` emits one JSON object per line via Nest `Logger`: fields `event`, `correlationId` (incoming `x-request-id` or `x-correlation-id`, else generated UUID; echoed as response `X-Request-Id`), `ts` (ISO-8601), plus event-specific keys (`clientId`, `sub`, `reason`, …). Passwords, full JWTs, and raw refresh/reset/invite tokens are never logged; dev-only reset token logging uses `AUTH_LOG_RESET_TOKEN_IN_DEV=true`.

---

## Access JWT claims (Epic 2.1 / AUTH-FR12, AD-AUTH-001)

Typed contract: `AccessTokenPayload` / `AuthMeResponseDto` in `@planning-monefica/shared-types`.

| Field | Tenant users (`principalType: tenant_user`) | Platform users (`platform_user`) |
|-------|---------------------------------------------|----------------------------------|
| `sub` | `tenant_users._id` | `platform_users._id` |
| `roles` | `collaborator` and/or `hr_admin` | `platform_admin`, `planning_consultant`, … |
| `tenantId` | Required (tenant scope) | Omitted |
| `aud` | `ic-app` or `hr-admin` (must match login client) | `control-pane` |
| `serveAllTenants` | — | Optional; **AD-SCHED-001** mirror for consultants |
| `tenantScope` | — | Optional string[] of tenant ObjectIds when restricted |

Verify with server `JWT_SECRET` (same as issuance). **`GET /api/v1/auth/me`** returns the decoded session for UI hints; **authorization** always re-checks on the server (guards + DB where required).

---

## Role / route boundaries (Epic 2.2–2.7)

All routes below require `Authorization: Bearer <access JWT>` unless noted.

| Method & path | Required session |
|---------------|------------------|
| `GET /api/v1/ic/tenants/:tenantId/ping` | Tenant user, `aud: ic-app`, role `collaborator`, `:tenantId` **must equal** JWT `tenantId` |
| `PATCH /api/v1/hr/tenants/:tenantId/users/:userId/active` | Tenant user, `aud: hr-admin`, role `hr_admin`, same tenant id rule; body `{ "active": boolean }` |
| `POST /api/v1/platform/users` | Platform user, `aud: control-pane`, role `platform_admin`; body email + password + `roles` (`platform_admin` \| `planning_consultant`) + optional `serveAllTenants` / `tenantIds` |
| `PATCH /api/v1/platform/users/:userId/active` | Same as row above; body `{ "active": boolean }` |
| `GET /api/v1/scheduling/consultant/ping` | Platform user, `aud: control-pane`, role **`planning_consultant` only** (stub for Epic 5+) |

**403** responses use `AuthErrorCodes`: `TENANT_MISMATCH`, `WRONG_CLIENT_FOR_ROUTE`, `WRONG_PRINCIPAL_TYPE`, `FORBIDDEN` (role mismatch).

**First `planning_consultant` user:** sign in as `platform_admin` on **control-pane**, then `POST /api/v1/platform/users` with `"roles": ["planning_consultant"]` and a strong password.
