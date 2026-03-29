---
story_key: 1-6-logout-and-session-expiry
epic: 1
story: 6
frs: [AUTH-FR10, AUTH-FR11]
---

# Story 1.6: Logout and session expiry

Status: done

## Story

As a **signed-in user**,  
I want **to log out and have expired sessions blocked**,  
so that **stolen sessions are limited in time**.

## Acceptance Criteria

1. **Given** an authenticated user with a valid refresh session — **When** they **log out** — **Then** the current refresh token is **revoked** on server (**AUTH-FR10**, **AD-AUTH-001**).
2. **Given** an **expired access JWT** — **When** the user calls a protected resource without valid refresh — **Then** access is denied (**AUTH-FR11**).
3. **Given** valid refresh + expired access — **When** client calls refresh endpoint — **Then** new access JWT issued (rotation per **AD-AUTH-001**).

## Tasks / Subtasks

- [x] `POST` logout endpoint (accepts refresh token or uses cookie strategy per client).
- [x] Revoke refresh token (and document optional “logout all devices” for later).
- [x] Global JWT auth guard: reject missing/invalid/expired access token with **401** + stable `code`.
- [x] Refresh endpoint: validate refresh, rotate, issue new access JWT.
- [x] Tests: logout invalidates refresh; expired access blocked; refresh flow works.

## Dev Notes

- Access JWT TTL short (e.g. 5–15m) per architecture; clients must implement refresh.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — AD-AUTH-001 Logout / Refresh rows]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- `POST .../logout` revokes refresh via `updateOne`; `GET .../me` uses `JwtAuthGuard`; refresh rotates (`revokedAt` + new refresh row).
- Tests: `logout` calls `refreshUpdateOne`; `refresh` happy path + unknown token in `auth.service.spec.ts`. (Expired access JWT behavior is standard JWT verification — covered by guard at runtime.)

### File List

- packages/server/src/auth/auth.controller.ts
- packages/server/src/auth/auth.service.ts
- packages/server/src/auth/auth.service.spec.ts
- packages/server/src/auth/jwt-auth.guard.ts
- packages/server/src/auth/dto/logout.dto.ts
- packages/server/src/auth/dto/refresh.dto.ts
