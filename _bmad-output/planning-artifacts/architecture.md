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

**Epics / UX:** No epics or UX specs in `planning-artifacts/` yet—architecture maps **FR categories** to **Nest modules** and **packages** so epics can attach later.

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

1. **Session/token model** (auth PRD open question): Pick one strategy and apply consistently to **eligibility revocation latency** (ELIG-NFR4) and logout (AUTH-FR9–FR11).
2. **`planning_consultant` identity model**: Platform user representation and JWT claims (extends auth matrix).
3. **Booking concurrency**: How the server guarantees SCHED-FR2 / SCHED-FR5 / SCHED-NFR1.

**Important:**

4. **Eligibility persistence shape** (embedded on `User` vs `BenefitEligibility` collection vs join table pattern in Mongo).
5. **Consultant ↔ tenant visibility** (SCHED open question): all tenants vs explicit assignment list per consultant.
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
  | Platform user | **Decision:** prefer **separate** `PlatformUser` (or equivalent) from tenant `User` for blast radius and clearer guards—**confirm** with auth epic if PRD chose single collection |
  | Eligibility | `benefits` / `eligibility` module | Links `tenantId` + `userId` + flags + audit fields |
  | Availability blocks | `scheduling` | `consultantId`, UTC range, recurrence TBD |
  | Booking | `scheduling` | `tenantId`, `employeeUserId`, `consultantId?`, state enum, slot window UTC, `idempotencyKey?` |

- **Validation:** **class-validator** DTOs on ingress; Mongoose schema validation where helpful.
- **Migrations:** Mongoose **change scripts** or manual migration playbook per team practice (document in server `docs/` when first migration ships).
- **Caching (optional):** None required for MVP; slot lists may use short TTL cache later—**must not** bypass auth/eligibility checks.

### Authentication and security

- **Pattern:** Extend existing **Nest guards** + **role + tenant + client audience** (AUTH-FR12–FR16).
- **New role:** `planning_consultant` — **platform-scoped**; **control-pane** only; **denied** hr-admin and collaborator apps (SCHED PRD matrix).
- **Claims (minimum):** `sub`, `role`(s), `clientId` / audience, and for tenant users `tenantId`; for consultants, optional `tenantScope[]` or `serveAllTenants: boolean` once product decides SCHED open question.
- **Token model (recommended default to unblock ELIG-NFR4):** **Short-lived access JWT** + **refresh** with server-side revocation list or **rotating refresh** stored hashed—**alternatively** document **stateless JWT** with **very short access TTL** if team rejects server session store. **Architecture owner** must align with AUTH PRD Q5 and document in `shared-types` + auth module README.
- **Passwords / hashing:** Per AUTH-NFR1 (e.g. bcrypt/argon2).
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

### Frontend architecture (by package)

- **hr-admin / control-pane:** RTK Query in **`api/`**; side effects in **`containers/`**; presentational **`components/`** only—per `project-context.md`.
- **ic-app:** Align with existing state/data patterns in package; **pt-BR** strings for user-visible scheduling/eligibility copy.
- **Routing:** Register new pages under `src/pages/<kebab-feature>/` (web) per established pattern.

### Infrastructure and deployment

- **Hosting:** Not changed by this document—follow existing deployment outline in GUIDE / ops docs when added.
- **Observability:** Structured logs for auth (AUTH-FR18), eligibility denials (ELIG-NFR6), booking lifecycle (SCHED-NFR3); metrics **by reason class** where PRDs require.
- **Secrets:** **.env** only; never client bundles (AUTH-NFR3).

### Decision impact / implementation sequence

1. **Auth epic:** Resolve token model + platform user storage; add `planning_consultant` to matrix and seed path.
2. **Eligibility module:** Persistence + HR APIs + employee self-status + guards on **benefit** route prefix.
3. **Scheduling module:** Availability + slots + bookings + assignment + concurrency + idempotency.
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
- **NFRs:** Security, audit, and concurrency addressed; **performance SLOs** still **TBD** (explicit gap).

### Gaps and risks (explicit)

| Gap | Risk | Mitigation |
|-----|------|------------|
| Token model not finalized (AUTH PRD Q5) | ELIG-NFR4 revocation semantics unclear | Time-box decision; document in auth module + architecture addendum |
| Consultant ↔ tenant ACL unset | Wrong data exposure or blocked ops | Product rule in SCHED PRD open questions → **defaults** in config (`serveAllTenants: true/false`) |
| No UX spec | Rework on flows | Minimum **flow outline** in wiki or lightweight UX doc before polish |
| No epics | Traceability | Create FR → story matrix (readiness report recommendation) |

### Readiness statement

Architecture is **sufficient to start implementation** of eligibility and scheduling **provided** the **token model** and **consultant tenant scope** decisions are **closed in the first auth/scheduling epics**. Remaining items are **tracked gaps**, not blockers for **spike** or **vertical slice** work.

---

## Completion and Handoff

### What was produced

- Single **architecture decision document** aligned with **three PRDs**, **project-context.md**, and **implementation readiness** findings.
- **Module** and **boundary** plan for **eligibility** and **scheduling**.
- **Critical** technical decisions called out (concurrency, role extension, token strategy).

### Recommended next steps

1. **Close** AUTH token model + platform user storage (small ADR or section append to this file).
2. **Create epics/stories** with **qualified FR** references (`AUTH-FR7`, `ELIG-FR3`, `SCHED-FR5`, …).
3. **Implement** vertical slice: eligibility APIs + HR list + employee status before full scheduling UI.
4. Optional: **`bmad-help`** to pick the next BMAD workflow (e.g. epics, UX).

### Questions

If you want this document adjusted (e.g. **mandate** separate `PlatformUser` collection, or **pick** stateless JWT explicitly), say which decisions to lock and we can patch `architecture.md` accordingly.
