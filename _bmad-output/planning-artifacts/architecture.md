---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
inputDocuments:
  - product-brief-planning-monefica.md
  - product-brief-planning-monefica-distillate.md
  - prd-login-authorization-access.md
  - prd-eligibility.md
  - prd-scheduling.md
  - implementation-readiness-report-2026-03-29.md
  - ../project-context.md
  - ../../docs/monorepo-hr-ic/GUIDE.md
workflowType: architecture
project_name: planning-monefica
user_name: Jhbalestrin
date: "2026-03-29"
lastStep: 8
status: complete
completedAt: "2026-03-29T15:35:26Z"
architectureDecisions:
  - id: AD-AUTH-001
    title: JWT access tokens + server-backed refresh
    status: accepted
    date: "2026-03-29"
  - id: AD-AUTH-002
    title: Separate PlatformUser persistence (PRD Q4 option B)
    status: accepted
    date: "2026-03-29"
  - id: AD-SCHED-001
    title: planning_consultant tenant visibility + JWT scope (MVP default + restricted mode)
    status: accepted
    date: "2026-03-29"
workflowNote: "Steps 1–8 produced in one consolidated pass (brownfield repo; user invoked /bmad-create-architecture for a deliverable AD-style document)."
---

# Architecture Decision Document — planning-monefica

_This document records solution architecture for the employer-sponsored financial planning platform (Brazil), aligned with existing PRDs and the brownfield monorepo. It is the technical counterpart to product requirements—not a duplicate of PRD FR text._

---

## Project Context Analysis

### Requirements overview

**Product intent (brief + distillate):** B2B Brazil; HR sets eligible employees; employee mobile app (**pt-BR**); in-house consultants; planning as core with education as support; shared scheduling and assignment.

**Functional surface (three PRDs, qualified FR IDs):**

| PRD | Scope | Approx. MVP FR count |
|-----|--------|----------------------|
| `prd-login-authorization-access.md` | AuthN/Z, roles, app matrix, passwords, sessions, audit | AUTH-FR1–FR20 |
| `prd-eligibility.md` | HR eligibility roster, employee self-status, server gates | ELIG-FR1–FR12 |
| `prd-scheduling.md` | Availability, slots, booking, consultant assignment, `planning_consultant` | SCHED-FR1–FR11, FR13–FR15 (+ optional SCHED-FR12) |

**Non-functional themes:** Multi-tenant isolation, LGPD-aligned PII handling, no client-trusted authorization, brute-force limits, structured security logs, booking **atomicity** (no double-book), UTC time storage, idempotent booking retries, observability by **reason class**.

**Epics / UX:** See `epics.md` and `ux-design-specification.md` in `planning-artifacts/`; architecture maps **FR categories** to **Nest modules** and **packages** for story attachment.

### Scale and complexity

- **Primary domain:** Full-stack API + mobile + two internal/customer web SPAs.
- **Complexity:** **Medium–high** — multi-tenancy, financial-wellbeing positioning (legal copy boundary), concurrent booking writes, new platform role.
- **Cross-cutting concerns:** Tenant scoping on every tenant-scoped read/write; role + client audience on every protected route; eligibility evaluated before benefit and scheduling; shared-types as **single contract surface**.

### Technical constraints (brownfield)

Locked by repository and `_bmad-output/project-context.md`:

- Node **≥ 22**, npm workspaces.
- **NestJS 11** + **Mongoose 8** + MongoDB.
- **shared-types** published from `packages/shared-types` — **no** duplicate DTOs on clients for public APIs.
- **hr-admin** / **control-pane**: Vite 8, React 19, MUI 7, RTK Query; page module layout (`pages/<feature>/containers|components|api`).
- **ic-app**: Expo / RN; not in root TS project references.
- Nest **module boundary rule**: no cross-import of other modules’ schemas; use owning **service** or **shared-types**.

---

## Starter Template Evaluation

### Decision: no new starter — brownfield continuation

The monorepo already exists per `docs/monorepo-hr-ic/GUIDE.md`. **Do not** re-run Nest/Expo/Vite CLIs to “greenfield” the product.

**Foundation locked:**

| Layer | Package | Notes |
|-------|---------|--------|
| API | `packages/server` | NestJS 11, Mongoose, Jest |
| Contracts | `packages/shared-types` | Build before dependents |
| HR UI | `packages/hr-admin` | Eligibility management |
| Ops / consultants | `packages/control-pane` | Scheduling + assignment MVP target |
| Employee | `packages/ic-app` | Booking + eligibility UX (**pt-BR**) |

**First implementation stories** for new product scope are **feature epics** inside this repo (new Nest modules + client pages), not repository bootstrap.

---

## Core Architectural Decisions

### Decision priority

**Critical (block coherent implementation if unset):**

1. ~~**Session/token model**~~ **CLOSED (AD-AUTH-001):** **JWT access tokens** + **server-stored refresh** — see [Authentication tokens (JWT)](#authentication-tokens-jwt-ad-auth-001) below. Drives **logout** (AUTH-FR9–FR11) and pairs with **server-side eligibility checks** for ELIG-NFR4.
2. ~~**Platform user storage (PRD Q4)**~~ **CLOSED (AD-AUTH-002):** **Separate `PlatformUser` collection** — see [Platform user persistence](#platform-user-persistence-ad-auth-002) below. `planning_consultant` and other platform roles are **not** stored as tenant `User` rows.
3. ~~**Booking concurrency**~~ **CLOSED:** Use the **MongoDB atomic pattern** in [Booking concurrency (critical design)](#booking-concurrency-critical-design) (`findOneAndUpdate` / unique compound index on slot identity **or** multi-doc transaction); reject with **`SLOT_TAKEN`** per **shared-types** — satisfies SCHED-FR2 / SCHED-FR5 / SCHED-NFR1.
4. ~~**Consultant ↔ tenant visibility / JWT scope**~~ **CLOSED (AD-SCHED-001):** See [Consultant tenant visibility and JWT scope](#consultant-tenant-visibility-and-jwt-scope-ad-sched-001) below.

**Important:**

5. **Eligibility persistence shape** (embedded on `User` vs `BenefitEligibility` collection vs join table pattern in Mongo).
6. **Error contract** for APIs: stable `code` + message map for mobile/web (align AUTH/ELIG “non-leaky” errors).

**Deferred (post-MVP acceptable with explicit “not built”):**

- Video/telephony provider attachment on bookings.
- Bulk eligibility import (ELIG-FR13–FR14).
- HR read-only scheduling dashboards.

### Data architecture

- **Database:** **MongoDB** (existing). Tenant-scoped documents carry **`tenantId`** (string/ObjectId per existing convention).
- **Modeling:** Mongoose schemas **owned by Nest module**; cross-module access via services only.
- **Recommended collections (conceptual)** — exact names are implementation details:

  | Concept | Owner module | Notes |
  |---------|--------------|--------|
  | Tenant / org | existing or `tenants` | Per current codebase |
  | User (tenant) | `users` / auth domain | `collaborator`, `hr_admin`; **active** flag |
  | Platform user | **CLOSED (AD-AUTH-002):** **`PlatformUser`** collection (Mongoose schema + owning module), **not** tenant `User` + flag. Roles: `platform_admin`, `planning_consultant`, etc. **AD-SCHED-001:** for `planning_consultant`, add **`serveAllTenants`** (default `true` MVP) and optional **`tenantIds[]`** when restricted. |
  | Eligibility | `benefits` / `eligibility` module | Links `tenantId` + `userId` + flags + audit fields |
  | Availability blocks | `scheduling` | `consultantId`, UTC range, recurrence TBD |
  | Booking | `scheduling` | `tenantId`, `employeeUserId`, `consultantId?`, state enum, slot window UTC, `idempotencyKey?` |

- **Validation:** **class-validator** DTOs on ingress; Mongoose schema validation where helpful.
- **Migrations:** Mongoose **change scripts** or manual migration playbook per team practice (document in server `docs/` when first migration ships).
- **Caching (optional):** None required for MVP; slot lists may use short TTL cache later—**must not** bypass auth/eligibility checks.

### Authentication and security

- **Pattern:** Extend existing **Nest guards** + **role + tenant + client audience** (AUTH-FR12–FR16).
- **New role:** `planning_consultant` — **platform-scoped**; **control-pane** only; **denied** hr-admin and collaborator apps (SCHED PRD matrix).
- **Claims (minimum):** `sub`, `role`(s), `clientId` / audience, and for tenant users `tenantId`; for **`planning_consultant`**, mirror **AD-SCHED-001** in JWT (`serveAllTenants`, optional `tenantScope`) for client hints — **authorization uses `PlatformUser` DB fields** as source of truth (see AD-SCHED-001).
- **Passwords / hashing:** Per AUTH-NFR1 (e.g. bcrypt/argon2).

### Platform user persistence — AD-AUTH-002

**Decision (PRD Q4 — option B):** **Platform operators** (`platform_admin`, `planning_consultant`, …) persist in a **separate MongoDB collection** modeled as **`PlatformUser`** (name may match existing Nest style, e.g. `platformusers`). **Tenant** `User` documents remain **only** for `collaborator` / `hr_admin` (and related customer personas).

| Aspect | Rule |
|--------|------|
| **Rationale** | Clearer **audit** trail, smaller **blast radius** (queries and guards cannot accidentally treat a platform account as tenant-scoped), aligns with PRD **tenant vs platform** boundary. |
| **Sign-in** | **control-pane** auth resolves credentials against **`PlatformUser`** only; **hr-admin** / **ic-app** resolve against **tenant `User`** only (same rule as app matrix). |
| **JWT `sub`** | Value is the **`_id` of the document** in the collection that issued the token. Implementations MUST **not** load by `sub` without knowing **which principal kind** — use **`aud` / `client_id` + role shape**, and/or an explicit claim **`principalType`: `tenant_user` \| `platform_user`** in **`shared-types`**, so the wrong collection is never queried. |
| **Refresh records** | Store **`principalType`** (or equivalent) with refresh token rows so rotation/revocation targets the correct user document. |
| **Brownfield** | If the codebase today uses a single `User` for everyone, add a **migration** path: new platform accounts on `PlatformUser`; legacy rows documented in auth epic. |

### Authentication tokens (JWT) — AD-AUTH-001

**Decision:** APIs authenticate requests with a **Bearer access JWT**. **Refresh** uses a **server-backed** token (recommended: **opaque** random token stored **hashed** in Mongo with `userId`, `expiresAt`, `clientId`/audience, `revokedAt`, optional **rotation chain**). This is still “JWT auth” in the sense that **authorization for protected routes uses signed JWT access tokens**, while refresh prioritizes **immediate revocation** and **rotation** over a second long-lived JWT.

| Aspect | Rule |
|--------|------|
| **Access token** | Signed **JWT** (HS256 or RS256 per environment policy). **Short TTL** (e.g. 5–15 minutes, configurable). Claims at minimum: `sub`, `roles` (or `role`), `tenantId` when tenant-scoped user, `aud` or `client_id` matching **ic-app / hr-admin / control-pane**, `iat`, `exp`. Optional `jti` for future denylist if TTL is ever raised. |
| **Refresh token** | **Opaque** high-entropy token, **hashed at rest** (AUTH-NFR5 pattern). Issued on login/refresh; **rotated** on each refresh exchange (invalidate prior refresh for that family). **Web:** HttpOnly + Secure + SameSite cookie acceptable; **mobile:** secure storage + same contract via header or body per API design. |
| **Logout (AUTH-FR10)** | Server **revokes** the current refresh token (and optionally **all** refresh tokens for that user/session policy). Access JWT continues to work until **exp** unless an optional small denylist is added—mitigated by **short access TTL**. |
| **Password change (AUTH-FR9)** | **Revoke all** refresh tokens for that user; new login required on other devices. |
| **Eligibility revocation (ELIG-NFR4)** | **Do not** embed eligibility in the access JWT as the only source of truth for benefit APIs. **Benefit and scheduling** routes re-check **eligibility (and active user)** on the server each request (or use a **short-lived cache** with TTL ≤ acceptable product SLA). Thus revocation takes effect on **next API call** after access TTL at worst, or immediately if no stale cache. |
| **Signing keys** | JWT secret or key pair in **`.env`** only (AUTH-NFR3); algorithms and key rotation documented in server README. |
| **Contracts** | Access/refresh shapes and claim names published via **`@planning-monefica/shared-types`** and/or OpenAPI as implementation stabilizes. |

**Explicitly out of scope for this decision:** opaque **server sessions** replacing JWT for access (not chosen). **Alternative** (if team later requires refresh as JWT): refresh JWT with `jti` stored and revocable in DB—same revocation and rotation rules apply.

- **Transport:** HTTPS; cookies **HttpOnly / Secure / SameSite** for web per AUTH-NFR2; secure storage guidance for mobile.
- **Rate limiting:** AUTH-FR17 on auth endpoints; consider **rate limits** on `POST` booking and slot query by IP/user.

### API and communication

- **Style:** **REST** JSON over HTTPS; **versioning** optional (`/api/v1/...`) if introduced, document once.
- **Errors:** JSON body with **machine-readable `code`** (e.g. `ELIGIBILITY_REQUIRED`, `SLOT_TAKEN`, `NOT_AUTHORIZED_FOR_CLIENT`) + localized **message** for clients (pt-BR supplied by client bundles or API `Accept-Language` later).
- **Dates:** **UTC** instants in JSON (ISO-8601); include `timeZone` or offset where SCHED-NFR4 requires client display logic.
- **Idempotency:** SCHED-NFR5 — support **`Idempotency-Key`** header (or body field) on **booking create**; server stores key + outcome TTL.

### Booking concurrency (critical design)

**Goal:** SCHED-FR5 + SCHED-NFR1 — **at most one** confirmed booking per consultant for overlapping instant.

**Recommended approach (MongoDB):**

1. **Atomic write:** `findOneAndUpdate` / transaction on a **slot lock** document **or** on the **booking** row with unique compound index on `(consultantId, slotStartUtc)` (or discrete slot id).
2. **Alternative:** **Transactional** batch (MongoDB 4+ multi-doc transactions) reserving slot + inserting booking in one transaction.
3. **Reject** concurrent second commit with **`SLOT_TAKEN`** (or equivalent) mapped in **shared-types**.

**Anti-pattern:** Read slot list then insert booking **without** atomic guard.

### Consultant tenant visibility and JWT scope — AD-SCHED-001

**Decision (SCHED PRD open question — consultant ↔ tenant access):** Tenant visibility for **`planning_consultant`** is **data-driven on `PlatformUser`**, not implied by role alone. **JWT** may **mirror** these fields for UI; **scheduling guards MUST enforce using the loaded `PlatformUser` record** (by `sub` + `principalType`) so ACL changes are not blocked by long-lived client assumptions.

| Mode | `PlatformUser` fields | Queue / booking visibility (SCHED-FR9, FR10, FR3) |
|------|------------------------|---------------------------------------------------|
| **MVP default** | `serveAllTenants: true` (default for new consultants) | Consultant may list and act on unassigned bookings for **any** tenant; slot/calendar views include all tenants the product serves. Fits **in-house** team with **shared coverage**. |
| **Restricted** | `serveAllTenants: false` **and** `tenantIds: ObjectId[]` **non-empty** | Consultant sees **only** bookings and tenant-scoped scheduling data for tenants in **`tenantIds`**. Use when ops assigns **explicit coverage** per consultant. |

**JWT claims (access token, `planning_consultant`):**

- **`serveAllTenants`:** `boolean` — must match persisted `PlatformUser.serveAllTenants` at **token issue** time.
- **`tenantScope`:** `string[]` of tenant ids — present when `serveAllTenants === false`; omit or empty when `true`.

**Rules:**

- **`platform_admin`** is **not** bounded by this table for **override** flows (optional SCHED-FR12); product may still scope UI by choice.
- **Changing** `serveAllTenants` / `tenantIds` takes effect for API authorization **immediately** when guards read **DB**; access JWT may lag until refresh — mitigated by **short access TTL** (AD-AUTH-001).
- **Epic 5–7:** Implement scheduling queries with a **tenant filter** derived from `PlatformUser` (skip filter when `serveAllTenants`).

### Frontend architecture (by package)

- **hr-admin / control-pane:** RTK Query in **`api/`**; side effects in **`containers/`**; presentational **`components/`** only—per `project-context.md`.
- **ic-app:** Align with existing state/data patterns in package; **pt-BR** strings for user-visible scheduling/eligibility copy.
- **Routing:** Register new pages under `src/pages/<kebab-feature>/` (web) per established pattern.

### Infrastructure and deployment

- **Hosting:** Not changed by this document—follow existing deployment outline in GUIDE / ops docs when added.
- **Observability:** Structured logs for auth (AUTH-FR18), eligibility denials (ELIG-NFR6), booking lifecycle (SCHED-NFR3); metrics **by reason class** where PRDs require.
- **Secrets:** **.env** only; never client bundles (AUTH-NFR3).

### Decision impact / implementation sequence

1. **Auth epic:** **AD-AUTH-001** + **AD-AUTH-002** implemented in server auth module; add `planning_consultant` to matrix and **PlatformUser** seed/admin path.
2. **Eligibility module:** Persistence + HR APIs + employee self-status + guards on **benefit** route prefix.
3. **Scheduling module:** Availability + slots + bookings + assignment + **AD-SCHED-001** tenant filter + concurrency + idempotency.
4. **control-pane** screens for consultants; **hr-admin** for eligibility; **ic-app** for employee flows.

---

## Implementation Patterns and Consistency Rules

_Align with `project-context.md`; items below are architecture-level reminders for agents._

### Naming and API

- REST paths: **kebab-case** or **plural nouns** consistent with existing server modules—**do not** mix snake_case in URLs if existing API uses camelCase JSON.
- JSON fields: **camelCase** in API payloads unless existing API already uses another convention (match existing).
- Mongo: collection names **plural lower snake** or existing convention—**match** existing `User`/`Tenant` patterns in codebase.

### Dates

- **date-fns** in all packages for business logic; store **UTC**; never rely on ambiguous local strings in persistence.

### Contracts

- Any DTO consumed by **two packages** → **`@planning-monefica/shared-types`** (export from `package.json` **exports**).
- Enums: `BookingState`, `EligibilityState`, `SchedulingErrorCode` (examples)—centralize in **shared-types**.

### NestJS

- New features → **new feature modules** (`EligibilityModule`, `SchedulingModule`) with **public services** for cross-module calls.
- **Guards order:** `AuthGuard` → `TenantGuard` (if applicable) → `EligibilityGuard` (benefit routes) → role check.

### Vite apps

- New RTK `createApi` slices registered in **`store.ts`**.
- Navigation: follow **hr-admin** / **control-pane** **button-navigation** `.mdc` rules.

### Testing

- Server: Jest unit tests for **guard + service** booking concurrency paths.
- Web: Vitest for critical containers.
- ic-app: preserve **typecheck** gate; add tests when runner adopted.

---

## Project Structure and Boundaries

### Repository map (high level)

```
packages/
  shared-types/src/     # DTOs, enums, auth role literals, error codes
  server/src/
    app.module.ts
    auth/                 # existing — extend for planning_consultant
    users/ or tenants/    # per existing layout
    eligibility/          # NEW — benefit eligibility
    scheduling/           # NEW — availability, bookings, assignment
  hr-admin/src/pages/     # e.g. eligibility feature page module
  control-pane/src/pages/ # e.g. scheduling / queue / calendar
  ic-app/                 # employee booking + status (pt-BR)
```

### FR → component mapping (initial)

| FR category | Primary home |
|-------------|----------------|
| AUTH-* | `packages/server` auth module + clients’ auth entry |
| ELIG-FR1–FR5 | `server/eligibility` + `hr-admin` pages |
| ELIG-FR6–FR12 | `server/eligibility` + guards + `ic-app` |
| SCHED-FR1–FR3, FR9–FR11 | `server/scheduling` + `control-pane` |
| SCHED-FR4–FR8, FR13–FR15 | `server/scheduling` + `ic-app` + guards |

### Integration boundaries

- **Clients → server:** Only via configured **API base URL** / Vite proxy; **no** direct Mongo access.
- **hr-admin** does **not** call scheduling **mutations** for consultant assignment in MVP (SCHED-FR15).
- **Consultant** never accesses **tenant HR** APIs as `hr_admin` (auth matrix).

---

## Architecture Validation

### Coherence

- Stack choices are **consistent** with brownfield (Nest + Mongo + shared-types + three clients).
- Booking concurrency approach is **compatible** with MongoDB.
- `planning_consultant` is **separated** from tenant roles in the **documented** matrix; implementation must match.

### Requirements coverage

- **AUTH / ELIG / SCHED** FRs have a **home module** and **client surface** except where explicitly **optional** (SCHED-FR12).
- **NFRs:** Security, audit, and concurrency addressed; **performance SLOs** still **TBD** (tracked in gaps table).

### Gaps and risks (explicit)

| Gap | Risk | Mitigation |
|-----|------|------------|
| ~~Token model (AUTH PRD Q5)~~ **Resolved:** AD-AUTH-001 | — | See [Authentication tokens (JWT)](#authentication-tokens-jwt-ad-auth-001); ELIG-NFR4 = server re-check + short access TTL |
| ~~Platform user storage (PRD Q4)~~ **Resolved:** AD-AUTH-002 | — | Separate **`PlatformUser`** collection; see [Platform user persistence](#platform-user-persistence-ad-auth-002) |
| ~~Consultant ↔ tenant ACL~~ **Resolved:** AD-SCHED-001 | — | [Consultant tenant visibility and JWT scope](#consultant-tenant-visibility-and-jwt-scope-ad-sched-001); MVP default **serve all tenants**; optional **restricted** via `tenantIds` |
| Performance SLOs TBD | Capacity surprises | Define p95 targets for auth, slot list, booking after first load test |

### Readiness statement

Architecture is **sufficient to start implementation** of eligibility and scheduling. **AD-AUTH-001**, **AD-AUTH-002**, **AD-SCHED-001**, and **booking concurrency pattern** are **closed**. Remaining items are **tracked gaps** (e.g. performance SLOs, eligibility persistence shape), not blockers for **spike** or **vertical slice** work.

---

## Completion and Handoff

### What was produced

- Single **architecture decision document** aligned with **three PRDs**, **project-context.md**, and **implementation readiness** findings.
- **Module** and **boundary** plan for **eligibility** and **scheduling**.
- **Critical** technical decisions called out (booking concurrency pattern, role extension, **AD-AUTH-001**, **AD-AUTH-002**, **AD-SCHED-001**).

### Recommended next steps

1. **Implement** auth module per **AD-AUTH-001** / **AD-AUTH-002** (JWT + `PlatformUser` + refresh store with `principalType`).
2. **Track stories** with **qualified FR** references (`AUTH-FR7`, `ELIG-FR3`, `SCHED-FR5`, …) in `epics.md` / sprint artifacts.
3. **Implement** vertical slice: eligibility APIs + HR list + employee status before full scheduling UI.
4. Optional: **`bmad-help`** to pick the next BMAD workflow (e.g. epics, UX).

### Questions

If you want this document adjusted (e.g. merge platform + tenant into one collection, or switch refresh to **JWT + `jti` revocation**), say which decisions to change and we can patch `architecture.md` accordingly.
