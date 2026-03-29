---
story_key: 1-3-initial-password-for-new-tenant-accounts
epic: 1
story: 3
frs: [AUTH-FR5]
---

# Story 1.3: Initial password for new tenant accounts

Status: done

## Story

As a **new HR or collaborator user**,  
I want **to set or receive my first password according to policy**,  
so that **I can access the app securely**.

## Acceptance Criteria

1. **Given** a newly provisioned **tenant** user (`collaborator` or `hr_admin`) — **When** they complete the **single MVP onboarding path** chosen below — **Then** they have a credential meeting **server password policy** (**AUTH-FR5**, **AUTH-NFR1**).
2. **MVP path (lock for this story):** **Invite link** — admin/system creates user with `passwordSetRequired: true` (or equivalent); user opens link with one-time token, sets password; token invalidated after use. (If product prefers temp password instead, replace in this section before dev.)

## Tasks / Subtasks

- [x] Document chosen MVP path in server `README` or `docs/auth.md` (one paragraph).
- [x] Implement **invite / set-initial-password** endpoints (tenant users only; not platform operators unless explicitly added).
- [x] Store **invite tokens** hashed at rest; expiry + single-use (**AUTH-NFR5**).
- [x] Wire minimal **hr-admin** or seed path to issue invite (could be deferred to Epic 2 if story split — then stub API + Postman/e2e only; align with PM).
- [x] Tests: valid invite sets password; expired/used invite rejected.

## Dev Notes

- **Out of scope for MVP unless needed:** bulk import, multiple parallel onboarding modes.
- **PRD open questions** (identifier, who creates IC) — use existing epic assumptions; don’t block password-set API.

### References

- [Source: _bmad-output/planning-artifacts/prd-login-authorization-access.md — FR5, NFR1, NFR5]
- [Source: _bmad-output/project-context.md — shared-types for DTOs]

## Dev Agent Record

### Agent Model Used

Composer (Claude)

### Debug Log References

(none)

### Completion Notes List

- `packages/server/docs/auth.md` documents invite MVP; `POST .../invite/accept`; `auth_invite_tokens` hashed; `issueInviteForTenantUser` behind `AUTH_ENABLE_DEV_INVITES=true`.
- Login blocked when `passwordSetRequired` (`SIGN_IN_FAILED`).
- Tests: `acceptInvite` success + expired invite in `auth.service.spec.ts`; `issueInvite` rejects when dev flag off.

### File List

- packages/server/docs/auth.md
- packages/server/src/auth/auth.service.ts
- packages/server/src/auth/auth.service.spec.ts
- packages/server/src/auth/schemas/invite-token.schema.ts
- packages/server/src/auth/dto/accept-invite.dto.ts
- packages/server/src/auth/auth.controller.ts
- packages/server/.env.example
