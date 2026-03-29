---
workflowType: prd
prdScope: eligibility-employee-access
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation-skipped
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments:
  - product-brief-planning-monefica.md
  - product-brief-planning-monefica-distillate.md
  - prd-login-authorization-access.md
  - ../project-context.md
  - ../../docs/monorepo-hr-ic/GUIDE.md
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 2
classification:
  projectType: Multi-client B2B SaaS (NestJS API + Expo mobile + Vite web SPAs)
  domain: B2B workforce benefits / financial wellbeing (Brazil); education-forward positioning
  complexity: medium
  projectContext: brownfield
relatedPrd:
  - prd-login-authorization-access.md
followUpPrd:
  - prd-scheduling.md
---

# Product Requirements Document: Eligibility & Employee Access

**Project:** planning-monefica  
**Author:** Jhbalestrin  
**Date:** 2026-03-28  
**Scope:** **Who may use the employee benefit** under a customer tenant—HR-maintained eligibility, employee visibility of access, and server-side enforcement—**without** defining scheduling, sessions, or consultant assignment (separate PRD).

---

## Executive Summary

Employers offer **financial planning** to selected **employees** in **Brazil**; **HR administrators** decide **which employees are eligible** for the **employee mobile app** and related tenant-scoped APIs. This PRD defines **eligibility as a first-class capability**: roster management in **hr-admin**, **tenant-scoped** data, clear **active/inactive** lifecycle, and **server enforcement** so ineligible users cannot access benefit features even if they hold credentials. It **builds on** the **Login, Authorization & Access** PRD (`prd-login-authorization-access.md`) and does **not** replace it.

**What makes this slice special:** Eligibility is the **contract between employer intent (“who we sponsor”)** and **product access**—it must be **auditable**, **HR-controlled**, and **aligned with multi-tenant isolation** already required for auth.

## Project Classification

| Dimension | Value |
|-----------|--------|
| **Project type** | API-backed **multi-client** product (Expo **employee** app + **hr-admin** + **control-pane**) |
| **Domain** | B2B **workforce / benefits**; **financial wellbeing** with **education-supporting** positioning (Brazil) |
| **Complexity** | **Medium** — multi-tenancy, PII, LGPD-relevant handling; **regulatory nuance** for financial content (legal input) |
| **Context** | **Brownfield** — NestJS 11, Mongoose, packages per `project-context.md` |

### What Makes This Special (scope-specific)

- **HR-owned eligibility** as the **gate** to benefit experiences, not ad hoc IT lists.
- **Single tenant per employee user** for MVP (matches auth PRD); eligibility is **within** that tenant.
- **Explicit deferral** of **scheduling, calendar, and consultant assignment** to a **follow-up PRD** so this document stays implementable and testable on its own.

---

## Success Criteria

### User success

- **HR admin** can **add, view, and remove eligibility** for employees in their organization **without** support tickets for routine changes.
- **Eligible employee** understands **whether they have access** to the benefit (clear in-app or post-login state).
- **Ineligible** or **revoked** employee **cannot** invoke benefit capabilities on the server, regardless of client UI.

### Business success

- Employers trust **eligibility reflects their policy** (who is sponsored); **renewals** and **disputes** are easier because eligibility is **traceable**.
- **Sales** can describe **“HR controls the roster”** as a concrete control.

### Technical success

- **100%** of benefit-scoped API routes validate **tenant + role + eligibility** (in addition to authentication per auth PRD).
- Eligibility changes **take effect** within **defined consistency bounds** (see NFRs); no “ghost access” after revocation.

### Measurable outcomes (targets to refine)

- Time for HR to **onboard a batch** of eligible employees (baseline after launch).
- **Rate** of access errors attributed to **wrong eligibility state** (support tickets / logs).
- **Fraction** of benefit API calls rejected for **ineligible** users (sanity metric, not a product goal).

## Product Scope

### MVP — Eligibility & employee access (this PRD)

- **HR** maintains **eligibility roster** for their **single tenant** (add/remove or activate/deactivate eligibility per employee identity).
- **System** links eligibility to **collaborator** (employee) identities already defined in the auth model.
- **Employee app** exposes **eligibility-aware** entry (e.g. benefit available vs not) at least at **capability boundary** level.
- **Server** enforces eligibility on **all benefit-scoped endpoints** introduced for the employee experience.
- **Audit trail** (minimal): who changed eligibility and when (subject to NFR).

### Growth (post-MVP, not this PRD)

- **Bulk import** (CSV) with validation and dry-run.
- **Eligibility rules** by attribute (department, level, location) if product strategy requires.
- **Self-service requests** (“ask HR for access”) with approval workflow.
- **Employer co-pay / percentage subsidy** surfaced in UX (depends on **commercial / billing PRD**).

### Vision

- Eligibility integrates with **HRIS / payroll** for automatic sync; **dynamic segments** for large enterprises.

### Explicitly out of scope (follow-up PRDs)

- **Shared scheduling**, **session booking**, **consultant assignment**, **calendar** ownership.
- **Full billing / invoicing** for employer subsidy models (may reference **entitlement** flags only).
- **Education content** catalog and delivery (separate PRD when prioritized).

---

## User Journeys

### Journey A — HR admin: sponsor selected employees

1. **Opening:** HR logs into **hr-admin** (auth per existing PRD).
2. **Rising action:** HR opens **Eligibility** (or **People / Beneficiaries**) for their company; sees current list of **eligible** employees (or empty state).
3. **Climax:** HR **adds** employees to eligibility (by selecting existing tenant users and/or triggering invite + eligibility—see open questions) or **removes** eligibility; changes **persist** and are **visible** in list view.
4. **Resolution:** Only **eligible** employees see **benefit-ready** state in the app; removed employees **lose** benefit access on next **authorization check** (within NFR bounds).

**Failure / edge:** HR accidentally removes someone—**undo** or **reactivate** path; clear **confirmation** on destructive actions.

### Journey B — Employee: discover access

1. **Opening:** Employee opens **employee mobile app** (pt-BR UI per product brief), signs in as **collaborator**.
2. **Rising action:** App calls server for **eligibility / entitlement** summary (exact shape TBD).
3. **Climax:** If **eligible**, employee sees **entry to benefit** (placeholder or stub **until** scheduling PRD); if **not eligible**, employee sees **clear, non-leaky** explanation (e.g. “Seu empregador não incluiu você neste benefício” — copy via UX).
4. **Resolution:** Employee is not blocked from **non-benefit** areas of the app if such areas exist in future; **benefit APIs** remain **denied** when ineligible.

### Journey C — Platform operator (minimal)

- **control-pane** may need **read-only** tenant diagnostics (counts of eligible users) for support—**optional MVP**; if not in MVP, defer to operations PRD.

---

## Domain & Compliance Notes (Brazil)

- **Data:** Employee eligibility lists are **PII**; handle under **LGPD** principles (purpose limitation, access control, retention—detail in security architecture).
- **Positioning:** Product is **education-forward** with **planning** as service; **eligibility** PRD does not define **investment advice** content—**legal review** for any user-facing claims tied to eligibility.
- **Tenant isolation:** No cross-tenant visibility of eligibility data (extends auth PRD **FR13**).

---

## Innovation

No novel technology claim for this slice; value is **operational** and **trust**-driven. **Skipped** as a dedicated innovation section.

---

## Project-Type Requirements (multi-tenant B2B + mobile)

- **Multi-tenant:** All eligibility records **scoped by `tenantId`**; align with **single active tenant** for collaborator MVP.
- **RBAC:** Only **`hr_admin`** (and processes acting on their behalf) mutate eligibility for a tenant; **`collaborator`** reads own eligibility state only; **`platform_admin`** behavior **out of scope** unless explicit read-only support is added.
- **API + mobile:** Eligibility checks live **server-side**; mobile displays **derived** state only.
- **Contracts:** Eligibility-related DTOs and enums belong in **`@planning-monefica/shared-types`** when cross-cutting.

---

## Functional Requirements

*Format: [Actor] can [capability] [context]. Numbered for traceability. Scheduling/consulting out of scope.*

### Eligibility management (HR admin)

- **FR1:** An **HR admin** for a tenant can **view a list of employees** who are **marked eligible** for the benefit within that tenant.
- **FR2:** An **HR admin** can **mark an employee as eligible** for the benefit within their tenant, subject to that employee **existing as a tenant user** with **`collaborator`** access (or can be created through an **onboarding flow** defined with auth—see open questions).
- **FR3:** An **HR admin** can **remove eligibility** for an employee (revoke benefit access) without necessarily deleting the user account (revocation is **eligibility**, not **identity**, unless product explicitly ties them).
- **FR4:** An **HR admin** can **correct mistakes** (e.g. re-instate eligibility) through the same management UI/API patterns as FR2–FR3.
- **FR5:** The system **records** eligibility changes with **actor**, **timestamp**, and **target employee** for audit (implementation may use existing logging patterns; see NFR).

### Employee experience (collaborator)

- **FR6:** An **authenticated collaborator** can **retrieve their own eligibility status** for the benefit for their tenant (eligible / not eligible / pending if such state exists).
- **FR7:** A **collaborator** who is **not eligible** **cannot** invoke **benefit-scoped** capabilities (server returns **consistent, safe** errors; no sensitive details about other users).

### Server enforcement

- **FR8:** The server **rejects** benefit-scoped requests from **ineligible** collaborators with a **documented** error contract (aligned with auth PRD non-leaky error style where applicable).
- **FR9:** The server **rejects** eligibility management requests from non-**hr_admin** roles for that tenant (extends auth **FR14** / app matrix).
- **FR10:** Eligibility checks **apply after** authentication and **tenant binding** (order of guards implementation detail; behavior is **mandatory**).

### Consistency with authentication PRD

- **FR11:** **Disabled / inactive user** (per auth PRD **FR4**) **cannot** gain benefit access solely through eligibility flags; eligibility is evaluated **only for active accounts** (exact rule: inactive ⇒ treat as no access).
- **FR12:** Eligibility management **respects** tenant boundaries (**no** cross-tenant eligibility mutation).

### Future hooks (document only — not MVP commitments)

- **FR13 (growth):** **HR admin** can **import eligibility in bulk** with validation report.
- **FR14 (growth):** **HR admin** can **filter** employee directory by eligibility state.

---

## Non-Functional Requirements

### Security & privacy

- **NFR1:** Eligibility data is **persisted** with **tenant isolation**; access from application code follows **Nest module boundary** rules in `project-context.md`.
- **NFR2:** Audit events for eligibility changes **minimize PII** in logs where possible; full detail available via **authorized admin views** only.
- **NFR3:** No **client-trusted** eligibility flags for authorization; **server is source of truth**.

### Consistency & propagation

- **NFR4:** After eligibility **revocation**, benefit access must **cease** no later than **[TBD: e.g. session TTL or next API call]**—document chosen strategy in architecture (align with auth token model open question).

### Usability (HR admin)

- **NFR5:** Destructive eligibility actions require **explicit confirmation** in **hr-admin** UI.

### Observability

- **NFR6:** Metrics or structured logs allow counting **eligibility denials** by **reason class** (ineligible vs inactive vs wrong role) for support.

---

## Dependencies & Contracts

- **prd-login-authorization-access.md** — roles, app matrix, tenant user model, **FR4** inactive users, **FR13–FR16** authorization.
- **shared-types** — eligibility enums, DTOs for HR list/update and employee self-status.
- **hr-admin** — page module patterns per `project-context.md`.
- **Employee app (`ic-app`)** — consume **read-only** eligibility summary for UX; **pt-BR** strings for employee-facing outcomes.

---

## Open Questions

1. **Employee onboarding:** Are eligible employees **always** pre-provisioned users, or does **HR invite** create **user + eligibility** in one flow? (Touches auth PRD Q2.)
2. **Identifier:** Match employees by **email**, **internal employee ID**, or **both**? Uniqueness **per tenant** vs global?
3. **Pending state:** Is **“invited but not yet activated”** shown as **pending eligibility** to HR and/or employee?
4. **Removal semantics:** Does **remove eligibility** **block sign-in** entirely, or only **benefit** surfaces while allowing generic employee app use?
5. **platform_admin:** Any **read-only** eligibility visibility for **support** in MVP?
6. **Entitlement vs commercial:** Do **employer payment models** (100% vs %) require **separate entitlement** flags in MVP, or **single eligible** flag until billing PRD exists?

---

## Traceability Note

Implementation epics should map stories to **FR1–FR12** (and growth FR13–FR14 when scheduled). **Scheduling / consultant assignment** PRD should reference this document for **eligibility preconditions** on booking APIs.
