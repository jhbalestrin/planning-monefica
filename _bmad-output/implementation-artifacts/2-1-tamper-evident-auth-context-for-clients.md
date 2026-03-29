---
story_key: 2-1-tamper-evident-auth-context-for-clients
epic: 2
story: 1
frs: [AUTH-FR12]
---

# Story 2.1: Tamper-evident auth context for clients

Status: ready-for-dev

## Story

As a **client app**,  
I want **to receive signed/session-bound role and tenant data**,  
so that **the UI can render but the server remains authoritative**.

## Acceptance Criteria

1. **Given** successful authentication — **When** session/token is issued — **Then** role(s) and tenant context (when applicable) are **tamper-evident** (signed JWT per **AD-AUTH-001**) — **And** claim names/values align with **`@planning-monefica/shared-types`**.

## Tasks / Subtasks

- [ ] Audit access JWT payload vs shared-types (roles, `tenantId`, `aud`/`client_id`, `principalType`, optional `serveAllTenants`/`tenantScope` for consultants per **AD-SCHED-001**).
- [ ] Expose a typed **session/user DTO** for clients (from token decode or `/me` if added).
- [ ] Document claim contract in server README or OpenAPI.
- [ ] Tests: issued token verifies with server secret; payload matches expected shape.

## Dev Notes

- Builds on Epic 1 token issuance; may be mostly **verification + documentation** if 1.1 already embeds claims.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — AD-AUTH-001, AD-AUTH-002]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 2.1]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
