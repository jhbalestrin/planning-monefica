---
workflowType: prd
prdScope: login-authorization-access
stepsCompleted: []
inputDocuments:
  - ../../project-context.md
  - ../../../docs/monorepo-hr-ic/GUIDE.md
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 2
classification:
  projectType: Multi-client ecosystem (NestJS API + 2 web SPAs + Expo mobile)
  domain: B2B workforce / HR operations (tenant-scoped)
  complexity: medium
  projectContext: brownfield
---

# Product Requirements Document: Login, Authorization & Access

**Project:** planning-monefica (Monefica-aligned monorepo)  
**Author:** Jhbalestrin  
**Date:** 2026-03-28  
**Scope:** Shared server authentication, passwords, roles, and per-app access for **ic-app**, **hr-admin**, and **control-pane**.

---

## Executive Summary

The ecosystem shares one **NestJS server** consumed by three clients: **ic-app** (Expo, individual collaborators), **hr-admin** (Vite/React, customer HR), and **control-pane** (Vite/React, internal platform team). This PRD defines **who may sign in where**, **which roles exist**, and the **minimum login and password capabilities** required before feature work can assume a stable identity layer.

Success means: each app only accepts users with the correct **persona and role**; credentials and sessions are enforced **centrally on the server**; **tenant isolation** applies to customer-facing users; and **platform operators** can manage the solution without inheriting tenant-scoped HR/IC permissions.

### What Makes This Special

- **One identity backend, three entry surfaces** — rules differ by client (`ic-app` vs `hr-admin` vs `control-pane`), not by duplicated auth logic per app.  
- **Clear separation** between **tenant users** (companies’ HR and collaborators) and **platform users** (our team on control-pane).  
- **Explicit role-to-app matrix** so implementation can gate routes, APIs, and future tokens consistently (including `shared-types` contracts).

## Project Classification

| Dimension | Value |
|-----------|--------|
| **Project type** | API-backed multi-client product (mobile + two web SPAs) |
| **Domain** | B2B workforce / HR tooling; per-company (tenant) data |
| **Complexity** | Medium — multi-tenancy, role separation, audit expectations |
| **Context** | **Brownfield** — NestJS 11, Mongoose, existing packages per `project-context.md` |

---

## Personas

| Persona | Description | Primary client |
|---------|-------------|----------------|
| **Individual Collaborator (IC)** | Employee or contractor of a **customer company**; uses day-to-day IC features on mobile. | **ic-app** |
| **HR Administrator** | HR staff of a **customer company**; manages people and HR workflows for their organization. | **hr-admin** |
| **Platform Operator** | Member of **our team**; operates tenants, configuration, and solution management — not acting as a customer HR user. | **control-pane** |

*Note:* One natural person could theoretically hold more than one persona in the future (e.g. internal tester). The **MVP rule** is: each account has a **primary persona** and **allowed apps** derived from role(s); see Open Questions if multi-persona accounts are required on day one.

---

## Roles (Logical Model)

Roles are **strings (or enums in `shared-types`)** assigned by the server and embedded in the authenticated context (e.g. token claims). They must not be spoofable by clients.

### Tenant-scoped roles (customer organizations)

| Role ID (suggested) | Persona | Typical capabilities |
|---------------------|---------|----------------------|
| `collaborator` | Individual Collaborator | IC mobile features for **one** linked company/tenant only. |
| `hr_admin` | HR Administrator | HR admin web features for **their** company/tenant; may include inviting/disabling IC users per product policy. |

### Platform-scoped roles (our team)

| Role ID (suggested) | Persona | Typical capabilities |
|---------------------|---------|----------------------|
| `platform_admin` | Platform Operator | Full control-pane capabilities: tenants, global settings, support actions as defined by future epics. |
| `platform_support` (optional, post-MVP) | Platform Operator | Read-heavy or limited-write control-pane for support staff. |

*MVP recommendation:* Start with **`platform_admin`** only; add `platform_support` when operational needs justify finer splits.

---

## App Access Matrix (Hard Rules)

| Role / persona | **ic-app** | **hr-admin** | **control-pane** |
|----------------|------------|--------------|------------------|
| **Collaborator** (`collaborator`) | **Allowed** | **Denied** | **Denied** |
| **HR Admin** (`hr_admin`) | **Denied** (MVP) | **Allowed** | **Denied** |
| **Platform Admin** (`platform_admin`) | **Denied** | **Denied** | **Allowed** |
| **Platform Support** (`platform_support`, if introduced) | **Denied** | **Denied** | **Allowed** (subset of features) |

**Server enforcement:** Every authenticated route must validate **role + tenant context + client audience** (or equivalent) so a stolen hr-admin token cannot call IC-only or platform-only endpoints, and vice versa.

**Client enforcement:** Each app may hide navigation, but **must not** be the only layer of security.

---

## Tenant and Platform Boundaries

- **Tenant users** (`collaborator`, `hr_admin`): Must be bound to exactly **one active tenant** for MVP unless product explicitly defines multi-company users later. All data access must be **scoped by `tenantId`**.
- **Platform users** (`platform_admin`, …): **No tenant membership** for authorization purposes in MVP, or a dedicated **platform tenant** that is not mixed with customer data — pick one model in architecture and keep it consistent in tokens.
- **control-pane** must never expose customer HR actions as if the operator were `hr_admin` for a tenant unless a deliberate **impersonation** feature is specified later (out of scope for this PRD).

---

## Success Criteria

### User success

- Collaborators can **sign in to ic-app** and stay signed in across reasonable app restarts (per platform norms) until logout or session expiry.
- HR admins can **sign in to hr-admin** and access only their organization’s data.
- Platform operators can **sign in to control-pane** and manage global/tenant configuration without seeing tenant UIs as unauthenticated users.

### Business success

- Support load from “wrong app / wrong account” is reducible via **clear error messages** and **documented personas**.
- New features can depend on a **single role and tenant model** in `shared-types` and server guards.

### Technical success

- **100% of protected API routes** enforce authentication and authorization on the server.
- Passwords meet stated policy; secrets stay server-side; CORS/origin patterns remain aligned with `project-context.md`.

### MVP vs later

| Area | MVP (this PRD) | Growth / vision |
|------|----------------|-----------------|
| Auth factors | Email/username + password | SSO (SAML/OIDC), MFA |
| HR on mobile | No | Revisit only with explicit requirement |
| Impersonation | No | Support “act as tenant” with audit trail |
| Fine-grained permissions | Role + tenant + app gate | Per-resource RBAC, custom roles |

---

## Functional Requirements

*Format: [Actor] can [capability] [context]. Numbered for traceability.*

### Authentication (sign-in)

- **FR1:** A user with valid credentials and an **allowed role for the requesting client** can **sign in** and receive an authenticated session (token or session cookie per architecture).
- **FR2:** A user with valid credentials but **no access to that client** receives a **clear, non-leaky error** (e.g. “This account is not authorized for this application”) without confirming whether the password was correct beyond standard practice.
- **FR3:** The server can **identify which client** initiated authentication (e.g. `client_id` / `audience` / origin policy) and use it in **access decisions**.
- **FR4:** A **disabled** or **archived** user cannot sign in or refresh a session.

### Password lifecycle

- **FR5:** A new tenant HR or IC account (per onboarding flow) can **set or receive** an initial password according to policy (invite link, temporary password, or first-login set — **exact flow** in implementation epic).
- **FR6:** An authenticated user can **change their password** while signed in.
- **FR7:** A user who forgot their password can **request a reset** via verified channel (email link or admin-assisted reset — **channel** to be fixed in implementation; at least one path in MVP).
- **FR8:** Password reset and invite links **expire** after a configurable time and are **single-use** where applicable.
- **FR9:** On successful password change, **existing sessions** for that user are **invalidated** (or policy is explicitly documented if not).

### Session and logout

- **FR10:** An authenticated user can **log out** from the current client; logout **invalidates** the server-recognized session/token according to chosen strategy.
- **FR11:** Expired sessions cannot access protected resources without **re-authentication** (or valid refresh flow if introduced).

### Authorization (access control)

- **FR12:** The server exposes **role(s) and tenant context** (if applicable) in a **tamper-evident** way to clients (signed JWT or server session).
- **FR13:** **Collaborators** may only access **tenant-scoped IC** resources for **their** tenant.
- **FR14:** **HR admins** may only access **tenant-scoped HR** resources for **their** tenant.
- **FR15:** **Platform admins** may access **platform** resources and must **not** gain tenant HR/IC privileges by default.
- **FR16:** Each app’s **protected routes** (API and, where applicable, UI entry) **deny** users who lack the required role or client access.

### Auditing and safety (MVP minimum)

- **FR17:** Failed sign-in attempts for a given identity are **rate-limited** or **throttled** to mitigate brute force.
- **FR18:** Security-relevant events (successful/failed login, password change, reset requested/completed) are **logged** with timestamp and correlation id (PII-minimal).

### Administration (baseline)

- **FR19:** An **HR admin** (or server-side onboarding job) can **mark a tenant user as active/inactive** so inactive users cannot sign in (exact UI in hr-admin epic).
- **FR20:** A **platform admin** can **create/disable platform operator accounts** for control-pane (exact UI in control-pane epic).

---

## Non-Functional Requirements

### Security

- **NFR1:** Passwords are stored with a **strong one-way hash** and salting (e.g. bcrypt/argon2); plaintext passwords never logged.
- **NFR2:** Tokens/cookies use **HttpOnly / Secure / SameSite** (web) and **secure storage** guidance (mobile) per platform best practices.
- **NFR3:** **No secrets** in client bundles; only public config (e.g. API base URL) in apps.
- **NFR4:** CORS and allowed origins remain **environment-driven** and consistent with existing `main.ts` patterns.

### Privacy & compliance (baseline)

- **NFR5:** Logs and errors avoid **unnecessary PII**; password reset tokens are **unpredictable** and **hashed at rest** if stored.

### Reliability

- **NFR6:** Auth endpoints degrade **predictably** under load (no unbounded session storage without plan).

### Observability

- **NFR7:** Auth failures and lockouts are **metric-friendly** (counts by reason class) for future monitoring.

---

## Dependencies and Contracts

- **shared-types:** Role literals, auth DTOs, and token/session claims should live in or be re-exported via **`@planning-monefica/shared-types`** per `project-context.md`.
- **Clients:** hr-admin and control-pane (Vite) proxy **`/api`** to the Nest server; ic-app uses configured API base URL — auth must work across these without duplicating business rules.
- **Related product PRDs:** `prd-eligibility.md` (benefit eligibility gates tenant users); `prd-scheduling.md` (adds platform role **`planning_consultant`** and control-pane scheduling—**extend** the role / app matrix and token claims when implementing that scope).

---

## Out of Scope (Explicit)

- Social login, enterprise SSO, MFA (unless added in a later PRD).
- **Impersonation** of tenant users by platform staff.
- Per-resource permission matrices beyond **role + tenant + app**.
- Public self-registration without tenant relationship (unless product later requires it).

---

## Open Questions (for architecture / stakeholder confirmation)

1. **Identifier:** Sign-in with **email only**, **username only**, or **either**? Must be unique **globally** or **per tenant**?
2. **IC onboarding:** Who creates collaborator accounts — **HR admin**, **bulk import**, **invite email**?
3. **Password policy:** Minimum length, complexity, rotation, and lockout thresholds (legal/HR may dictate).
4. **Platform user storage — RESOLVED (architecture):** **Option B — separate `PlatformUser` collection** (not tenant `User` + flag). **control-pane** auth resolves **`PlatformUser`** only; tenant apps resolve **tenant `User`** only. JWT `sub` + **`principalType`** (or equivalent) must disambiguate collection on load. See `_bmad-output/planning-artifacts/architecture.md` — **AD-AUTH-002**.
5. **Token model — RESOLVED (architecture):** **Bearer access JWT** (short TTL) + **server-stored refresh** (opaque, hashed, rotatable). Logout/password change revoke refresh; access expires naturally (optional denylist). See `_bmad-output/planning-artifacts/architecture.md` — **AD-AUTH-001**. Impacts FR9–FR11 as documented there.
6. **hr_admin on ic-app:** Confirm **never** for MVP vs future “HR mobile” scenario.

---

## Traceability Note

Implementation should map epics/stories to **FR1–FR20** and adjust numbering only with conscious versioning in `shared-types` if contracts change.
