---
story_key: 1-1-sign-in-and-wrong-app-rejection
epic: 1
story: 1
frs: [AUTH-FR1, AUTH-FR2, AUTH-FR3]
---

# Story 1.1: Sign-in and wrong-app rejection

Status: done

## Story

As a **user**,  
I want **to sign in only on apps I am allowed to use**,  
so that **I am not confused and credentials are not leaked via error messages**.

## Acceptance Criteria

1. **Given** valid credentials and a role allowed for the requesting client — **When** the user signs in — **Then** they receive an authenticated session per **AD-AUTH-001** (short-lived **access JWT** + **server-stored refresh**) — **And** the server records which **client** initiated auth (`aud` / `client_id` / origin policy) per **AUTH-FR3**.
2. **Given** valid credentials but the role is **not** allowed for that client — **When** the user attempts sign-in — **Then** the response uses a clear, **non-leaky** error per **AUTH-FR2** — **And** the message does not confirm password correctness beyond normal practice.

## Tasks / Subtasks

- [x] Add Nest **auth module** skeleton in `packages/server` (module, service, controller) if not present.
- [x] Define **client identification** on login request (header or body `clientId` / `audience`, aligned with **ic-app** / **hr-admin** / **control-pane**).
- [x] Implement **credential verification** against the correct principal store: **tenant `User`** for ic-app + hr-admin; **`PlatformUser`** for control-pane per **AD-AUTH-002**.
- [x] Implement **role ↔ client matrix** from `prd-login-authorization-access.md` § App Access Matrix; reject wrong client with stable error `code` (see architecture error contract).
- [x] Issue **access JWT** + create **refresh** row (hashed token, `principalType`, `clientId`) per **AD-AUTH-001**.
- [x] Add DTOs / enums to **`@planning-monefica/shared-types`** for login request/response and error codes (no duplicate client DTOs).
- [x] Unit/integration tests for happy path + wrong client + wrong principal collection.

## Dev Notes

- **Brownfield:** Server currently has **HealthModule** only — this story establishes the auth vertical slice.
- **Architecture:** [_bmad-output/planning-artifacts/architecture.md](../planning-artifacts/architecture.md) — **AD-AUTH-001**, **AD-AUTH-002**, JWT claims (`sub`, `roles`, `tenantId` when applicable, `aud`, `principalType`).
- **PRD:** [_bmad-output/planning-artifacts/prd-login-authorization-access.md](../planning-artifacts/prd-login-authorization-access.md) — FR1–FR3, app matrix.
- **Project:** [_bmad-output/project-context.md](../project-context.md) — Nest boundaries, shared-types first, CORS/proxy ports.

### Project Structure Notes

- `packages/server/src/auth/` — new module (or name aligned with repo conventions).
- Mongoose schemas live **inside** the owning module; no cross-import of other modules’ schemas.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#authentication-tokens-jwt-ad-auth-001]
- [Source: _bmad-output/planning-artifacts/architecture.md#platform-user-persistence-ad-auth-002]
- [Source: _bmad-output/planning-artifacts/prd-login-authorization-access.md#functional-requirements]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- `AuthModule` + `POST /api/v1/auth/login` with body `clientId`; tenant vs `control-pane` platform lookup; `rolesAllowedForTenantClient` / `rolesAllowedForPlatformClient`; wrong-app → `NOT_AUTHORIZED_FOR_CLIENT`.
- Access JWT via `@nestjs/jwt`; refresh row in `refresh_tokens` with hashed opaque token.
- Unit coverage: `auth.service.spec.ts` (happy path ic-app, wrong password, wrong client, inactive), `auth-role.util.spec.ts`.

### File List

- packages/shared-types/src/auth.ts
- packages/shared-types/src/index.ts
- packages/server/src/auth/auth.module.ts
- packages/server/src/auth/auth.controller.ts
- packages/server/src/auth/auth.service.ts
- packages/server/src/auth/auth.service.spec.ts
- packages/server/src/auth/auth-role.util.ts
- packages/server/src/auth/auth-role.util.spec.ts
- packages/server/src/auth/jwt-auth.guard.ts
- packages/server/src/auth/token.util.ts
- packages/server/src/auth/dto/login.dto.ts
- packages/server/src/auth/schemas/tenant-user.schema.ts
- packages/server/src/auth/schemas/platform-user.schema.ts
- packages/server/src/auth/schemas/refresh-token.schema.ts
- packages/server/src/app.module.ts
- packages/server/.env.example
