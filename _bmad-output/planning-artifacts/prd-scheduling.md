---
workflowType: prd
prdScope: scheduling-consultant-assignment
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
  - prd-eligibility.md
  - ../project-context.md
  - ../../docs/monorepo-hr-ic/GUIDE.md
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 2
classification:
  projectType: Multi-client B2B SaaS (NestJS API + Expo mobile + Vite web SPAs)
  domain: B2B workforce benefits / financial planning operations (Brazil)
  complexity: medium
  projectContext: brownfield
relatedPrd:
  - prd-login-authorization-access.md
  - prd-eligibility.md
followUpPrd:
  - employee-planning-journey-ux (optional deeper PRD)
  - education-layer (planned)
  - commercial-billing (planned)
authExtensionNote: Adds platform role planning_consultant and control-pane scheduling surfaces; amend app matrix with architecture + auth epic.
---

# Product Requirements Document: Scheduling & Consultant Assignment

**Project:** planning-monefica  
**Author:** Jhbalestrin  
**Date:** 2026-03-28  
**Scope:** **Shared availability**, **employee booking** of financial-planning sessions, and **in-house consultant assignment**—building on **authentication** (`prd-login-authorization-access.md`) and **eligibility** (`prd-eligibility.md`). Does **not** define session **content**, **video/conference vendor**, or **commercial billing**.

---

## Executive Summary

Eligible **employees** (see **eligibility PRD**) need to **schedule** personal financial planning with **in-house consultants**. Consultants maintain **shared, bookable availability**; employees **choose slots** in the **employee mobile app** (**pt-BR** UI); consultants **assign themselves** (or otherwise take ownership) to each booking so every case moves through a **controlled pipeline**. This PRD is the **operational core** between “has access” and “had a planning interaction.”

**Auth extension:** Today’s app matrix covers **`collaborator`**, **`hr_admin`**, **`platform_admin`**. This PRD introduces a **`planning_consultant`** **platform-scoped** role (in-house planner) with access to **control-pane** **scheduling features** only—**not** tenant HR powers. **`platform_admin`** may retain full ops; consultants get a **least-privilege** slice. Exact token claims and matrix rows are an **implementation** deliverable tracked with the **auth epic** (amendment to login PRD / `shared-types`).

**What makes this special:** One **pool of consultant time** feeds **many customer tenants** while **tenant data stays isolated**—bookings are always tied to a **`tenantId`** and an **eligible employee**.

---

## Project Classification

| Dimension | Value |
|-----------|--------|
| **Project type** | API-backed **multi-client** (Expo + **control-pane** + server); **hr-admin** optional read-only later |
| **Domain** | Workforce **benefit delivery**; **time-based** operations; Brazil market |
| **Complexity** | **Medium** — concurrency (double-booking), time zones, PII on appointments |
| **Context** | **Brownfield** — NestJS, Mongoose, patterns in `project-context.md` |

---

## Preconditions (must hold before scheduling features ship)

- **Authentication** and **app access** per `prd-login-authorization-access.md`.
- **Benefit eligibility** enforced per `prd-eligibility.md` (**FR6–FR12**): only **eligible**, **active** **collaborators** may book or view bookable scheduling for the benefit.
- **Tenant binding** for every booking and availability rule affecting a customer org.

---

## Success Criteria

### User success

- **Employee:** Can **see real availability** and **book** a session without back-channel email loops; understands **status** (requested / confirmed / cancelled) in **pt-BR**.
- **Consultant:** Can **publish availability**, **see work queue**, and **assign** sessions to themselves (or per assignment rules) with **no double-booking** for the same consultant at the same instant.
- **Operations:** Can **explain** who is waiting and **SLA** to first session (metrics TBD).

### Business success

- **Throughput:** Consultant utilization improves vs manual scheduling; **employer** sees **predictable** access to the benefit.

### Technical success

- **Server** is authoritative for **slot inventory**, **booking state**, and **assignment**; clients are **optimistic UI** only.
- **Conflicting** concurrent bookings for the same **consultant-time** are **rejected** with a **safe** error contract.

---

## Product Scope

### MVP — Scheduling & assignment (this PRD)

- **Consultants** manage **personal availability** (calendar blocks) exposed as **bookable slots** according to **product rules** (length, buffer—see open questions).
- **Eligible employees** **list** available slots for **their tenant** and **create** a **booking** (appointment).
- **Bookings** start in an **assignable** state; **consultants** **claim / assign** the booking to themselves (**in-house** staff only—no marketplace).
- **Cancel** and **reschedule** flows with **policy** (who can initiate, cutoffs—TBD).
- **control-pane** UI for consultant workflows; **employee app** for browse + book + status (**pt-BR**).
- **Timezone:** Store **UTC**; default display timezone **Brazil** (`America/Sao_Paulo`) unless user preference is introduced later.

### Growth (post-MVP)

- **HR admin** **read-only** dashboard: counts of bookings / completion by tenant (no session content).
- **Waitlist** when no slots.
- **Assignment manager** role: dispatch bookings to consultants (vs self-claim only).
- **Recurring** availability templates; **holiday** calendars.
- **Video / telephony** link attachment per session (vendor TBD).

### Vision

- **Capacity planning** across tenants; **forecasting** demand; **HRIS**-driven “preferred slots.”

### Out of scope

- **Education** content delivery, **in-session** materials (separate PRD).
- **Billing**, **co-pay**, **employer %** settlement (commercial PRD).
- **Clinical / regulated investment advice** process definition (legal/counsel).
- **External** freelance planners as suppliers.

---

## User Journeys

### Journey A — Employee: book a session

1. Employee confirms **eligible** (eligibility PRD); opens **Agendar / Minhas sessões** (copy via UX).
2. System shows **available slots** for their **tenant** (derived from consultant pool + rules).
3. Employee **selects** slot → **booking** created (**pending assignment** or **pending confirmation** per state model below).
4. After **consultant assignment** (+ optional confirmation rules), employee sees **confirmed** time; **notifications** (push/email) TBD in architecture.
5. Employee may **cancel** or **reschedule** if policy allows.

**Edge:** Slot taken between UI load and submit → **friendly error**, refresh availability.

### Journey B — Consultant: publish time and own cases

1. Consultant signs in to **control-pane** with **`planning_consultant`** role.
2. Defines **availability** for upcoming weeks (blocks).
3. Sees **queue** of **unassigned** or **new** bookings for tenants they are allowed to serve.
4. **Assigns** booking to self → booking **owned**; appears on **my schedule**.
5. Completes session (state **completed**); optional **notes** field policy TBD (PII).

**Edge:** Consultant marks **no-show** or **cancel** with reason codes for ops.

### Journey C — Platform admin (optional MVP)

- **platform_admin** may **override** or **reassign** bookings for support—**audited**; if not MVP, defer.

---

## Domain & Compliance

- **PII:** Bookings link **employee identity** + **time** + **consultant** → **LGPD**-aligned retention and access logging.
- **Financial planning** positioning: scheduling PRD does not change **education vs advice** stance; **disclaimers** on confirmations may be required—**legal** input.

---

## Auth & Client Surfaces

| Role | Employee app | hr-admin | control-pane |
|------|--------------|----------|--------------|
| **collaborator** | **Book / manage own bookings** | Denied | Denied |
| **hr_admin** | Denied (MVP) | **Optional later:** read-only metrics | Denied |
| **planning_consultant** | Denied | Denied | **Scheduling + assignment** |
| **platform_admin** | Denied | Denied | **Full** (includes scheduling ops + overrides if product enables) |

**Server:** Every scheduling endpoint validates **role + tenant (where applicable) + eligibility** for employee paths; **platform** paths validate **platform role** and **scope** (consultant vs admin).

---

## Functional Requirements

*Numbered for traceability. “Booking” = a single planned planning session unless otherwise stated.*

### Availability (consultant)

- **FR1:** A **planning_consultant** can **create, update, and remove** their **availability blocks** that generate **bookable slots** per **scheduling rules** (duration, buffers—parameters in config or open questions).
- **FR2:** The system **derives** a **tenant-visible slot list** from **consultant availability** and **existing bookings** such that **already-booked** consultant time **does not appear** as available (no double-book for same consultant at same time).
- **FR3:** A **planning_consultant** can **view** their own **calendar** of **assigned bookings** and **remaining availability**.

### Booking (employee)

- **FR4:** An **eligible collaborator** can **retrieve available bookable slots** for **their tenant** for a defined **date range** (server-enforced max range to protect performance).
- **FR5:** An **eligible collaborator** can **create a booking** on a **still-available** slot; server **atomically** reserves the slot or **rejects** if taken.
- **FR6:** An **eligible collaborator** can **list** their **own bookings** and **current status** (lifecycle states below).
- **FR7:** An **eligible collaborator** can **cancel** their own booking **per cancellation policy** (policy flags TBD; server enforces cutoffs).
- **FR8:** An **eligible collaborator** can **reschedule** by **releasing** a slot and **creating** a new booking **per policy** (or single “reschedule” operation—implementation choice; behavior: no double reservation).

### Assignment (consultant)

- **FR9:** A **planning_consultant** can **view** bookings that are **awaiting assignment** for tenants **they are authorized** to serve (**authorization model** TBD: all consultants see all tenants vs partition—see open questions).
- **FR10:** A **planning_consultant** can **assign an unassigned booking** to **themselves**, transitioning it to **assigned** state.
- **FR11:** A **planning_consultant** can **mark** a booking **completed** or **cancelled** / **no-show** with **reason** where required (enum TBD).

### Platform administration

- **FR12 (optional MVP):** A **platform_admin** can **reassign** or **cancel** any booking **with audit** (if not MVP, explicitly defer and hide UI).

### Enforcement & consistency

- **FR13:** The server **denies** all booking and slot-list operations for **ineligible** or **inactive** collaborators (per eligibility **FR7–FR8**, **FR11**).
- **FR14:** Booking records **always** include **`tenantId`** and **employee user id**; **no cross-tenant** reads or writes for **tenant-scoped** actors.
- **FR15:** **hr_admin** **cannot** assign themselves as **planning consultant** for bookings through scheduling APIs unless given a **future role** (out of MVP).

### Suggested booking lifecycle (states)

- **`requested`** — created; may or may not hold slot lock depending on implementation.
- **`confirmed`** — slot reserved; **assignment** may still be pending or completed per chosen UX.
- **`assigned`** — consultant ownership set (may collapse with **confirmed** if single step).
- **`completed`** / **`cancelled`** / **`no_show`** — terminal states.

*Architecture may merge states; behaviors in **FR5–FR11** must remain testable.*

---

## Non-Functional Requirements

- **NFR1:** **Concurrency:** Slot reservation uses **atomic** persistence or equivalent so **two employees** cannot book the **same consultant-minute**.
- **NFR2:** **Performance:** Slot search for typical ranges completes within **interactive** thresholds (exact SLO TBD; document in architecture).
- **NFR3:** **Audit:** Assignment, cancellation, and admin override events logged with **actor**, **timestamp**, **booking id** (PII-minimal in raw logs).
- **NFR4:** **Time:** All instants stored **UTC**; API returns **offset** or **IANA** zone for client rendering; default UX **pt-BR** locale strings.
- **NFR5:** **Idempotency:** Employee **retry** after network failure must not create **duplicate** bookings (client key or idempotent POST—architecture).

---

## Dependencies & Contracts

- **prd-eligibility.md** — eligibility **precondition** for **FR4–FR8**, **FR13**.
- **prd-login-authorization-access.md** — extended with **`planning_consultant`** and **control-pane** routes; **FR12–FR16** patterns for server guards.
- **shared-types** — booking DTOs, state enums, slot DTOs, error codes for **slot_taken**, **ineligible**, **policy_violation**.
- **control-pane** — new **page modules** for consultant scheduling (`project-context.md` patterns).
- **ic-app** — booking flows, **pt-BR** copy.

---

## Open Questions

1. **Slot length & buffers:** Fixed **60m** vs configurable; padding between sessions.
2. **Consultant ↔ tenant access — RESOLVED (architecture):** **Both** modes supported. **MVP default:** `PlatformUser.serveAllTenants: true` → consultant sees **all** tenants. **Restricted:** `serveAllTenants: false` + non-empty **`tenantIds`** → **assigned coverage** only. JWT mirrors for UI; **server enforces `PlatformUser`** (see `_bmad-output/planning-artifacts/architecture.md` **AD-SCHED-001**).
3. **Assignment UX:** Is **self-claim** sufficient for MVP, or is **manager dispatch** required day one?
4. **Confirmation:** Is employee booking **instantly confirmed**, or **pending consultant approval**?
5. **Notifications:** Push only, email only, or both; provider choice.
6. **Session medium:** In-person vs video vs phone—does MVP require **meeting link** field?
7. **HR visibility:** Any **hr-admin** read-only in MVP?
8. **Auth epic:** Add **`planning_consultant`** to **seed/admin** tooling and **platform user** provisioning flow.

---

## Traceability Note

Map implementation stories to **FR1–FR15** (and **FR12** if enabled). **Eligibility** stories remain under **prd-eligibility.md**. **Post-booking employee experience** (pre-session prep, education nudges) may get a separate **journey PRD**; this PRD stops at **scheduling and assignment state machine**.
