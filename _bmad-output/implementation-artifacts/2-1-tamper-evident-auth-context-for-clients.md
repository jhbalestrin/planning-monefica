---
story_key: 2-1-tamper-evident-auth-context-for-clients
epic: 2
story: 1
frs: [AUTH-FR12]
---

# Story 2.1: Tamper-evident auth context for clients

Status: done

## Story

As a **client app**,  
I want **to receive signed/session-bound role and tenant data**,  
so that **the UI can render but the server remains authoritative**.

## Acceptance Criteria

1. **Given** successful authentication — **When** session/token is issued — **Then** role(s) and tenant context (when applicable) are **tamper-evident** (signed JWT per **AD-AUTH-001**) — **And** claim names/values align with **`@planning-monefica/shared-types`**.

## Tasks / Subtasks

- [x] Audit access JWT payload vs shared-types (roles, `tenantId`, `aud`/`client_id`, `principalType`, optional `serveAllTenants`/`tenantScope` for consultants per **AD-SCHED-001**).
- [x] Expose a typed **session/user DTO** for clients (from token decode or `/me` if added).
- [x] Document claim contract in server README or OpenAPI.
- [x] Tests: issued token verifies with server secret; payload matches expected shape.

## Dev Notes

- Builds on Epic 1 token issuance; may be mostly **verification + documentation** if 1.1 already embeds claims.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — AD-AUTH-001, AD-AUTH-002]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 2.1]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- Confirmed `AccessTokenPayload` / `AuthMeResponseDto` alignment; `GET /api/v1/auth/me` unchanged shape.
- `packages/server/docs/auth.md` — JWT claim table + AD-SCHED-001 fields.
- `jwt-claims.spec.ts` — sign/verify round-trip for tenant + consultant payloads.

### File List

- packages/server/docs/auth.md
- packages/server/src/auth/jwt-claims.spec.ts
- packages/shared-types/src/auth.ts (403 codes added in Epic 2 for guards; claims unchanged)
