---
story_key: 1-8-log-security-relevant-auth-events
epic: 1
story: 8
frs: [AUTH-FR18]
---

# Story 1.8: Log security-relevant auth events

Status: done

## Story

As a **platform operator**,  
I want **auth security events logged with correlation**,  
so that **we can investigate incidents**.

## Acceptance Criteria

1. **Given** **successful login**, **failed login**, **password change**, **reset requested**, **reset completed** — **When** the event occurs — **Then** a **structured log** entry exists with **timestamp**, **event type**, **correlation id** (request id), and **minimal PII** (**AUTH-FR18**, **AUTH-NFR5**).
2. Logs avoid raw passwords, reset secrets, or full tokens.

## Tasks / Subtasks

- [x] Add Nest **logging interceptor** or dedicated **AuthAuditService** emitting JSON lines (or Nest Logger with structured context).
- [x] Propagate **correlation id** from header (e.g. `X-Request-Id`) or generate per request.
- [x] Hook events from stories 1.1, 1.4, 1.5, 1.6, 1.7 (failed login).
- [x] Document log field schema in `packages/server/docs/` or README.
- [x] Tests: assert log calls or snapshot structured fields in integration tests (optional if brittle).

## Dev Notes

- **LGPD:** No unnecessary personal data in log message strings; use opaque user id where needed.

### References

- [Source: _bmad-output/planning-artifacts/prd-login-authorization-access.md — FR18, NFR5]
- [Source: _bmad-output/planning-artifacts/architecture.md — Observability]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- `AuthAuditService.log` → JSON line with `event`, `correlationId`, `ts`, payload; wired on login success/failure, refresh, logout, password change, reset request/complete, invite accept path.
- `CorrelationIdMiddleware` sets `X-Request-Id` / `x-request-id` when absent.
- Schema documented in `packages/server/docs/auth.md`; unit test `auth-audit.service.spec.ts`.

### File List

- packages/server/src/auth/auth-audit.service.ts
- packages/server/src/auth/auth-audit.service.spec.ts
- packages/server/src/common/correlation-id.middleware.ts
- packages/server/src/app.module.ts
- packages/server/docs/auth.md
