---
story_key: 1-7-rate-limit-failed-sign-in
epic: 1
story: 7
frs: [AUTH-FR17]
---

# Story 1.7: Rate limit failed sign-in

Status: done

## Story

As a **platform operator**,  
I want **failed sign-in attempts throttled**,  
so that **brute-force attacks are harder**.

## Acceptance Criteria

1. **Given** repeated **failed** sign-ins for the same **identity key** (e.g. normalized email + client id) — **When** threshold exceeded — **Then** further attempts are **throttled** or **blocked** per config (**AUTH-FR17**).
2. **Counters / outcomes** are observable for metrics (**AUTH-NFR7**) — e.g. structured log fields or increment hooks for future Prometheus.

## Tasks / Subtasks

- [x] Choose mechanism: **@nestjs/throttler** on login route and/or **Mongo** sliding window per identity.
- [x] Configurable thresholds via env (`AUTH_LOGIN_MAX_ATTEMPTS`, window seconds).
- [x] Do not throttle successful logins path excessively; only failed attempts (or use separate limiter key).
- [x] Tests: after N failures, 429 or equivalent; success resets or decays per policy.

## Dev Notes

- Align error `code` with shared-types for client mapping (**UX-DR2** future).

### References

- [Source: _bmad-output/planning-artifacts/prd-login-authorization-access.md — FR17, NFR7]
- [Source: _bmad-output/planning-artifacts/architecture.md — Rate limiting bullet under auth]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- **Mechanism:** Mongo `auth_login_failure_buckets` per `email:clientId` — rolling window, lockout with `TOO_MANY_ATTEMPTS` (401 + code, not HTTP 429). Successful login clears bucket via `deleteOne`.
- Env: `AUTH_LOGIN_MAX_ATTEMPTS`, `AUTH_LOGIN_WINDOW_SEC`, `AUTH_LOCKOUT_SEC`. Unused `@nestjs/throttler` dependency removed.
- Test: active lockout rejects login in `auth.service.spec.ts`.

### File List

- packages/server/src/auth/schemas/login-failure-bucket.schema.ts
- packages/server/src/auth/auth.service.ts
- packages/server/src/auth/auth.service.spec.ts
- packages/server/.env.example
- packages/server/package.json
