---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - prd-login-authorization-access.md
  - prd-eligibility.md
  - prd-scheduling.md
  - architecture.md
  - ux-design-specification.md
  - product-brief-planning-monefica.md
  - ../project-context.md
workflowNote: "Consolidated run: requirements extraction, epic design, story generation, and validation in one deliverable (user invoked /bmad-create-epics-and-stories)."
---

# planning-monefica - Epic Breakdown

## Overview

This document decomposes **planning-monefica** into epics and stories. **Functional requirements** use **qualified IDs** (`AUTH-`, `ELIG-`, `SCHED-`) because multiple PRDs each number FR1, FR2, …

**Inputs:** `prd-login-authorization-access.md`, `prd-eligibility.md`, `prd-scheduling.md`, `architecture.md`, `ux-design-specification.md`, `project-context.md`.

## Requirements Inventory

### Functional Requirements

**Authentication & access (`prd-login-authorization-access.md`)**

- **AUTH-FR1:** Valid credentials + allowed role for client → authenticated session.
- **AUTH-FR2:** Valid credentials, wrong client → clear non-leaky error.
- **AUTH-FR3:** Server identifies initiating client for access decisions.
- **AUTH-FR4:** Disabled/archived user cannot sign in or refresh session.
- **AUTH-FR5:** New tenant HR/collaborator can set/receive initial password per policy.
- **AUTH-FR6:** Authenticated user can change password while signed in.
- **AUTH-FR7:** Forgot password → reset via verified channel (≥1 MVP path).
- **AUTH-FR8:** Reset/invite links expire (configurable) and single-use where applicable.
- **AUTH-FR9:** Password change invalidates existing sessions (or documented policy).
- **AUTH-FR10:** Logout invalidates session/token per strategy.
- **AUTH-FR11:** Expired session cannot access protected resources without re-auth/refresh.
- **AUTH-FR12:** Server exposes role(s) + tenant context tamper-evidently.
- **AUTH-FR13:** Collaborators only tenant-scoped IC resources for their tenant.
- **AUTH-FR14:** HR admins only tenant-scoped HR resources for their tenant.
- **AUTH-FR15:** Platform admins access platform resources; no default tenant HR/IC privileges.
- **AUTH-FR16:** Protected routes deny wrong role or client access.
- **AUTH-FR17:** Failed sign-in rate-limited/throttled.
- **AUTH-FR18:** Security events logged (PII-minimal) with timestamp + correlation id.
- **AUTH-FR19:** HR admin (or job) can mark tenant user active/inactive.
- **AUTH-FR20:** Platform admin can create/disable platform operator accounts.

**Eligibility (`prd-eligibility.md`)** — MVP

- **ELIG-FR1:** HR admin views list of employees marked eligible for the benefit (tenant).
- **ELIG-FR2:** HR admin marks employee eligible (collaborator exists or onboarding path).
- **ELIG-FR3:** HR admin removes eligibility without necessarily deleting user.
- **ELIG-FR4:** HR admin re-instates eligibility / corrects mistakes.
- **ELIG-FR5:** System records eligibility changes (actor, timestamp, target) for audit.
- **ELIG-FR6:** Collaborator retrieves own eligibility status.
- **ELIG-FR7:** Ineligible collaborator cannot invoke benefit-scoped capabilities (safe errors).
- **ELIG-FR8:** Server rejects ineligible collaborators on benefit APIs (documented errors).
- **ELIG-FR9:** Server rejects eligibility management from non–hr_admin.
- **ELIG-FR10:** Eligibility evaluated after authentication and tenant binding.
- **ELIG-FR11:** Inactive user cannot gain benefit access via eligibility alone.
- **ELIG-FR12:** No cross-tenant eligibility mutation.

**Scheduling (`prd-scheduling.md`)** — MVP (optional **SCHED-FR12** noted per story)

- **SCHED-FR1:** planning_consultant creates/updates/removes availability blocks → bookable slots.
- **SCHED-FR2:** System derives tenant slot list; no double-book same consultant-time.
- **SCHED-FR3:** Consultant views own calendar of assignments + remaining availability.
- **SCHED-FR4:** Eligible collaborator lists bookable slots (date range capped).
- **SCHED-FR5:** Eligible collaborator creates booking; atomic reserve or reject.
- **SCHED-FR6:** Collaborator lists own bookings + status.
- **SCHED-FR7:** Collaborator cancels own booking per policy.
- **SCHED-FR8:** Collaborator reschedules per policy (no double reservation).
- **SCHED-FR9:** Consultant views bookings awaiting assignment (tenant scope per product rule).
- **SCHED-FR10:** Consultant assigns unassigned booking to self.
- **SCHED-FR11:** Consultant marks completed / cancelled / no-show with reason.
- **SCHED-FR12 (optional):** platform_admin reassigns/cancels any booking with audit.
- **SCHED-FR13:** Server denies booking/slot ops for ineligible or inactive collaborators.
- **SCHED-FR14:** Bookings include tenantId + employee user id; no cross-tenant for tenant actors.
- **SCHED-FR15:** hr_admin cannot act as planning consultant via scheduling APIs (MVP).

### NonFunctional Requirements

**Auth:** AUTH-NFR1–NFR7 (password hashing, token/cookie security, no secrets in clients, CORS, PII in logs, degradability, auth metrics).

**Eligibility:** ELIG-NFR1–NFR6 (tenant isolation, audit PII minimization, server source of truth, revocation latency strategy TBD, HR confirm destructive actions, eligibility denial metrics).

**Scheduling:** SCHED-NFR1–NFR5 (booking concurrency, slot search performance TBD, audit logs, UTC + locale, idempotency).

**Cross-cutting:** LGPD-aligned handling of PII; Nest module boundaries; `shared-types` as contract surface (`architecture.md`, `project-context.md`).

### Additional Requirements

- **Brownfield:** Extend existing Nest monorepo; **no** new repo starter (`architecture.md`).
- **New Nest modules:** `eligibility`, `scheduling` (or equivalent names) with owned Mongoose schemas; cross-module calls via **public services** only.
- **Auth extension:** `planning_consultant` platform role; **control-pane** scheduling surfaces; amend JWT/session claims per chosen token model.
- **Booking concurrency:** Atomic reservation or transaction per `architecture.md` (SCHED-NFR1).
- **API errors:** Stable machine-readable `code` + localized messages; **pt-BR** on ic-app (`architecture.md`, UX spec).
- **Dates:** UTC storage; **date-fns** in apps (`project-context.md`).
- **Web clients:** RTK Query in `api/`; presentational components without RTK in `components/` (`project-context.md`).

### UX Design Requirements

- **UX-DR1:** Employee **benefit status** card on ic-app home: **eligible / not eligible / loading / error** with pt-BR copy from UX spec §14.
- **UX-DR2:** ic-app maps API **error codes** to user-facing pt-BR strings (**no** raw server messages) for auth, eligibility, and scheduling flows.
- **UX-DR3:** hr-admin **two-step confirmation** for eligibility removal (destructive) per UX spec.
- **UX-DR4:** Establish **MUI theme** tokens (spacing, radius, typography) for hr-admin and control-pane for new screens.
- **UX-DR5:** ic-app **spacing scale** + **title/body** text roles as constants (or adopt RN Paper consistently).
- **UX-DR6:** **Status chip** (or badge) component aligned to **shared-types** enums for eligibility + booking states (web + mobile).
- **UX-DR7:** Booking **confirmation** step before submit; show date/time and cancellation policy placeholder when available.
- **UX-DR8:** control-pane **queue** view: sortable list, primary action **Assumir** (assign to self).
- **UX-DR9:** Web: verify **WCAG 2.1 AA** contrast for primary text and controls on new screens.
- **UX-DR10:** Web modals: **keyboard** focus trap, **Esc** closes, primary action visible.
- **UX-DR11:** Web: respect **`prefers-reduced-motion`** for transitions.
- **UX-DR12:** Wide tables: **min width ~1280px** layout target; **sticky** first column for name/identifier columns.

### FR Coverage Map

| FR | Epic |
|----|------|
| AUTH-FR1–FR11, FR17–FR18 | Epic 1 |
| AUTH-FR12–FR16, FR19–FR20 + `planning_consultant` matrix | Epic 2 |
| ELIG-FR1–FR5 | Epic 3 |
| ELIG-FR6–FR12 | Epic 4 |
| SCHED-FR1–FR3 (+ FR2 server) | Epic 5 |
| SCHED-FR4–FR8, FR13–FR15 (employee/consultant enforcement on booking) | Epic 6 |
| SCHED-FR9–FR11, optional FR12 | Epic 7 |
| UX-DR1–DR7, DR9–DR12 (embedded in epics 3–7 + Epic 8) | Epics 3–8 |
| UX-DR4–DR6, DR8–DR12 cross-app | Epic 8 (consolidation) |

## Epic List

### Epic 1: Users sign in, manage passwords, and use sessions safely

People can authenticate to the **correct** app, recover access, and sign out with predictable session behavior. Covers core auth session and password lifecycle plus brute-force and audit logging.

**FRs covered:** AUTH-FR1–FR11, AUTH-FR17, AUTH-FR18  
**NFRs addressed:** AUTH-NFR1–NFR7 (as applicable per story)

### Epic 2: Every API call respects role, tenant, and client boundaries

The server enforces **who** can call **what**, with tamper-evident context in tokens/sessions. HR can deactivate tenant users; platform admins manage operators. Introduces **`planning_consultant`** for control-pane scheduling prep.

**FRs covered:** AUTH-FR12–FR16, AUTH-FR19, AUTH-FR20 + auth matrix extension for `planning_consultant`  
**NFRs addressed:** AUTH-NFR1–NFR4, ELIG-NFR3 pattern (server truth)

### Epic 3: HR sponsors the right employees for the benefit

HR admins maintain the **eligibility roster** with auditability and safe confirmations.

**FRs covered:** ELIG-FR1–FR5  
**UX:** UX-DR3, parts of UX-DR4 (hr-admin)

### Epic 4: Employees see whether they have access; the backend enforces it

Eligible collaborators see status; ineligible users get safe errors; all benefit routes check eligibility after auth and tenant binding.

**FRs covered:** ELIG-FR6–FR12  
**UX:** UX-DR1, UX-DR2 (eligibility paths), UX-DR6

### Epic 5: Consultants publish time; employees see real availability

In-house consultants manage availability; the system produces **accurate** slot lists without double-booking consultant time.

**FRs covered:** SCHED-FR1–FR3 (and SCHED-FR2 interaction with empty bookings)  
**UX:** UX-DR4 (control-pane), UX-DR8 (partial — list infra)

### Epic 6: Employees book, view, and adjust their planning sessions

Eligible employees browse slots, book with concurrency safety, list bookings, cancel/reschedule per policy, with idempotency on create.

**FRs covered:** SCHED-FR4–FR8, SCHED-FR13–FR15  
**UX:** UX-DR2 (scheduling errors), UX-DR6, UX-DR7, UX-DR9–UX-DR12 (ic-app + web as needed)

### Epic 7: Consultants own the queue and close the loop

Consultants see unassigned work, assign sessions to themselves, and mark outcomes (completed / cancelled / no-show). Optional platform overrides if enabled.

**FRs covered:** SCHED-FR9–FR11, optional SCHED-FR12  
**UX:** UX-DR8, UX-DR4

### Epic 8: Shared UX and accessibility polish across apps

Consolidates theme tokens, status components, motion/accessibility baselines, and table patterns so all three clients stay consistent.

**FRs covered:** — (supports UX-DR4–DR6, DR9–DR12 explicitly)

---

## Epic 1: Users sign in, manage passwords, and use sessions safely

HR admins, collaborators, and platform operators can sign in to the **intended** client, recover passwords, change passwords, and log out. Failed sign-in is throttled; security events are logged.

### Story 1.1: Sign-in and wrong-app rejection

As a **user**,  
I want **to sign in only on apps I am allowed to use**,  
So that **I am not confused and credentials are not leaked via error messages**.

**FRs:** AUTH-FR1, AUTH-FR2, AUTH-FR3  

**Acceptance Criteria:**

**Given** valid credentials and a role allowed for the requesting client  
**When** the user signs in  
**Then** they receive an authenticated session (token or cookie per architecture)  
**And** AUTH-FR3 identifies the client in the auth decision.

**Given** valid credentials but the role is not allowed for that client  
**When** the user attempts sign-in  
**Then** the response uses a clear, non-leaky error (AUTH-FR2)  
**And** the message does not confirm password correctness beyond standard practice.

### Story 1.2: Block disabled and archived users

As a **security stakeholder**,  
I want **disabled users to be unable to authenticate**,  
So that **revoked access takes effect immediately**.

**FRs:** AUTH-FR4  

**Acceptance Criteria:**

**Given** a user marked disabled or archived  
**When** they attempt sign-in or token refresh  
**Then** access is denied per AUTH-FR4.

### Story 1.3: Initial password for new tenant accounts

As a **new HR or collaborator user**,  
I want **to set or receive my first password according to policy**,  
So that **I can access the app securely**.

**FRs:** AUTH-FR5  

**Acceptance Criteria:**

**Given** a newly provisioned tenant user (per chosen onboarding: invite, temp password, or first-login set)  
**When** they complete the onboarding flow  
**Then** they have a credential that meets server password policy  
**And** the exact flow matches the single chosen MVP path documented in the story notes.

### Story 1.4: Change password while signed in

As a **signed-in user**,  
I want **to change my password**,  
So that **I can rotate credentials**.

**FRs:** AUTH-FR6, AUTH-FR9  

**Acceptance Criteria:**

**Given** an authenticated user  
**When** they submit a valid password change  
**Then** the new password is stored with strong hashing (AUTH-NFR1)  
**And** existing sessions are invalidated or policy is explicitly documented (AUTH-FR9).

### Story 1.5: Forgot-password and reset flow

As a **user who forgot their password**,  
I want **to request a reset through a verified channel**,  
So that **I can regain access**.

**FRs:** AUTH-FR7, AUTH-FR8  

**Acceptance Criteria:**

**Given** a registered user  
**When** they request password reset  
**Then** at least one MVP channel works (e.g. email link)  
**And** reset tokens expire per config and are single-use where applicable (AUTH-FR8)  
**And** tokens are unpredictable and stored hashed if persisted (AUTH-NFR5).

### Story 1.6: Logout and session expiry

As a **signed-in user**,  
I want **to log out and have expired sessions blocked**,  
So that **stolen sessions are limited in time**.

**FRs:** AUTH-FR10, AUTH-FR11  

**Acceptance Criteria:**

**Given** an authenticated user  
**When** they log out  
**Then** the server-side session/token is invalidated per strategy (AUTH-FR10).

**Given** an expired session  
**When** the user calls a protected resource  
**Then** access is denied until re-authentication or valid refresh (AUTH-FR11).

### Story 1.7: Rate limit failed sign-in

As a **platform operator**,  
I want **failed sign-in attempts throttled**,  
So that **brute-force attacks are harder**.

**FRs:** AUTH-FR17  

**Acceptance Criteria:**

**Given** repeated failed sign-ins for an identity  
**When** the threshold is exceeded  
**Then** further attempts are throttled or blocked per configured policy  
**And** behavior is metric-friendly (AUTH-NFR7).

### Story 1.8: Log security-relevant auth events

As a **platform operator**,  
I want **auth security events logged with correlation**,  
So that **we can investigate incidents**.

**FRs:** AUTH-FR18  

**Acceptance Criteria:**

**Given** successful login, failed login, password change, or reset requested/completed  
**When** the event occurs  
**Then** a structured log entry exists with timestamp and correlation id  
**And** PII in logs is minimized (AUTH-NFR5).

---

## Epic 2: Every API call respects role, tenant, and client boundaries

Authenticated context exposes **role(s)** and **tenant** tamper-evidently; guards enforce collaborator, hr_admin, and platform_admin rules on APIs and route entries. HR can deactivate users; platform admins manage operators. **`planning_consultant`** can use control-pane for scheduling features.

### Story 2.1: Tamper-evident auth context for clients

As a **client app**,  
I want **to receive signed/session-bound role and tenant data**,  
So that **the UI can render but the server remains authoritative**.

**FRs:** AUTH-FR12  

**Acceptance Criteria:**

**Given** a successful authentication  
**When** the session/token is issued  
**Then** role(s) and tenant context (when applicable) are included in a tamper-evident form (JWT signature or server session)  
**And** claims align with `shared-types` literals.

### Story 2.2: Enforce collaborator data scope

As a **collaborator**,  
I want **my API access limited to my tenant’s IC-scoped resources**,  
So that **I never see another company’s data**.

**FRs:** AUTH-FR13, AUTH-FR16  

**Acceptance Criteria:**

**Given** a collaborator token for tenant A  
**When** they call a tenant IC endpoint  
**Then** only tenant A data is returned  
**And** attempts to access tenant B fail (AUTH-FR13)  
**And** wrong-role or wrong-client access is denied (AUTH-FR16).

### Story 2.3: Enforce HR admin scope

As an **HR admin**,  
I want **API access limited to my tenant’s HR resources**,  
So that **I cannot manage another customer’s org**.

**FRs:** AUTH-FR14, AUTH-FR16  

**Acceptance Criteria:**

**Given** an hr_admin for tenant A  
**When** they use HR-scoped endpoints  
**Then** only tenant A is affected  
**And** cross-tenant or wrong-app access is denied.

### Story 2.4: Enforce platform admin isolation from tenant roles

As a **platform admin**,  
I want **platform APIs without implicit tenant HR/IC powers**,  
So that **internal ops cannot accidentally act as a customer HR user**.

**FRs:** AUTH-FR15, AUTH-FR16  

**Acceptance Criteria:**

**Given** a platform_admin token  
**When** they call platform endpoints  
**Then** they succeed per policy  
**And** they cannot access tenant HR/IC-only endpoints as if they were hr_admin/collaborator (AUTH-FR15).

### Story 2.5: HR admin activates and deactivates tenant users

As an **HR admin**,  
I want **to mark employees active or inactive**,  
So that **leavers lose access**.

**FRs:** AUTH-FR19  

**Acceptance Criteria:**

**Given** an hr_admin for a tenant  
**When** they deactivate a tenant user  
**Then** that user cannot sign in or refresh (ties to AUTH-FR4)  
**And** the action is available via API with hr-admin UI in same epic or follow-up story in Epic 3 if split.

### Story 2.6: Platform admin manages operator accounts

As a **platform admin**,  
I want **to create and disable control-pane operator accounts**,  
So that **internal access is provisioned safely**.

**FRs:** AUTH-FR20  

**Acceptance Criteria:**

**Given** a platform_admin  
**When** they create or disable a platform operator account  
**Then** the account state affects control-pane sign-in per policy.

### Story 2.7: Add planning_consultant role and control-pane access

As a **planning consultant**,  
I want **to sign in to control-pane for scheduling work**,  
So that **I never use customer HR or employee apps for my job**.

**FRs:** Extends AUTH matrix per `prd-scheduling.md` / `architecture.md`  

**Acceptance Criteria:**

**Given** a user with role `planning_consultant`  
**When** they authenticate to control-pane  
**Then** they are allowed per app matrix  
**And** they are denied ic-app and hr-admin  
**And** collaborator/hr_admin tokens cannot call consultant-only scheduling admin endpoints.

---

## Epic 3: HR sponsors the right employees for the benefit

HR admins view and maintain **who is eligible** for the financial planning benefit, with audit trail and safe destructive confirmation.

### Story 3.1: Persist eligibility per tenant employee

As a **system**,  
I want **eligibility records scoped by tenant and user**,  
So that **HR can manage sponsorship lists**.

**FRs:** ELIG-FR1–FR5 (data foundation), ELIG-NFR1  

**Acceptance Criteria:**

**Given** Nest `eligibility` (or equivalent) module  
**When** schemas are created  
**Then** documents include `tenantId` and `userId` (or equivalent foreign keys)  
**And** no cross-module schema imports violate `project-context.md`.

### Story 3.2: HR views eligible employee list

As an **HR admin**,  
I want **to see who is currently eligible**,  
So that **I can audit our sponsorship**.

**FRs:** ELIG-FR1  
**UX:** UX-DR4 (hr-admin layout), UX-DR12  

**Acceptance Criteria:**

**Given** an hr_admin for tenant A  
**When** they open the eligibility list  
**Then** they see employees marked eligible for tenant A only  
**And** the list is usable at desktop width per UX-DR12.

### Story 3.3: HR marks an employee eligible

As an **HR admin**,  
I want **to add eligibility for an employee**,  
So that **they can use the benefit**.

**FRs:** ELIG-FR2, ELIG-FR4  
**UX:** UX-DR4  

**Acceptance Criteria:**

**Given** an existing collaborator user in tenant A  
**When** HR marks them eligible  
**Then** they appear as eligible in the list  
**And** ELIG-FR4 allows subsequent corrections.

### Story 3.4: HR removes eligibility with confirmation

As an **HR admin**,  
I want **to remove eligibility with a clear confirmation**,  
So that **I do not revoke access by mistake**.

**FRs:** ELIG-FR3, ELIG-FR5  
**UX:** UX-DR3  
**NFR:** ELIG-NFR5  

**Acceptance Criteria:**

**Given** an eligible employee  
**When** HR chooses remove  
**Then** a two-step confirmation is shown (UX-DR3)  
**And** after confirm, the employee is not eligible  
**And** an audit record captures actor, timestamp, target (ELIG-FR5, ELIG-NFR2).

---

## Epic 4: Employees see whether they have access; the backend enforces it

Collaborators read **their** eligibility; benefit APIs reject ineligible or inactive users; eligibility checks run in the correct guard order without cross-tenant leakage.

### Story 4.1: Employee eligibility self-status API

As a **collaborator**,  
I want **to read my eligibility status**,  
So that **the app can show whether I have the benefit**.

**FRs:** ELIG-FR6  
**UX:** UX-DR1  

**Acceptance Criteria:**

**Given** an authenticated collaborator  
**When** they request `GET` (or equivalent) self eligibility  
**Then** they receive eligible / not eligible / pending if defined  
**And** they cannot read other users’ eligibility.

### Story 4.2: Benefit route guard and safe errors

As a **collaborator**,  
I want **clear feedback when I am not eligible**,  
So that **I do not think the app is broken**.

**FRs:** ELIG-FR7, ELIG-FR8, ELIG-FR10, ELIG-FR11  
**UX:** UX-DR2  
**NFR:** ELIG-NFR3, ELIG-NFR6  

**Acceptance Criteria:**

**Given** benefit-scoped API routes  
**When** an ineligible or inactive collaborator calls them  
**Then** the server rejects with a documented error code  
**And** messages are safe and mapped to pt-BR in ic-app (UX-DR2)  
**And** eligibility is evaluated after auth + tenant binding (ELIG-FR10)  
**And** inactive users never pass as eligible (ELIG-FR11).

### Story 4.3: Protect eligibility admin endpoints

As a **platform**,  
I want **only HR admins to change eligibility**,  
So that **employees cannot self-sponsor**.

**FRs:** ELIG-FR9, ELIG-FR12  

**Acceptance Criteria:**

**Given** a non–hr_admin token  
**When** they call eligibility mutation APIs  
**Then** the request is denied  
**And** HR mutations cannot target another tenant (ELIG-FR12).

### Story 4.4: ic-app benefit status screen

As a **collaborator**,  
I want **a home status card in Portuguese**,  
So that **I immediately know if I can plan**.

**FRs:** ELIG-FR6 (UI consumption)  
**UX:** UX-DR1, UX-DR5, UX-DR6  

**Acceptance Criteria:**

**Given** the self-status API  
**When** the home screen loads  
**Then** eligible vs not eligible states show pt-BR copy per UX spec  
**And** loading and error states are handled  
**And** status chip or badge reflects enum (UX-DR6).

---

## Epic 5: Consultants publish time; employees see real availability

Consultants maintain **availability blocks**; the API returns **bookable slots** for a tenant, excluding already reserved consultant time (no double-book).

### Story 5.1: Scheduling domain models and module

As a **system**,  
I want **availability and booking collections owned by the scheduling module**,  
So that **consultants and employees can share one source of truth**.

**FRs:** SCHED-FR1 (foundation), SCHED-FR14  
**NFR:** SCHED-NFR4  

**Acceptance Criteria:**

**Given** a `scheduling` Nest module  
**When** models are defined  
**Then** booking documents include `tenantId` and employee user id (SCHED-FR14)  
**And** instants are stored in UTC (SCHED-NFR4).

### Story 5.2: Consultant availability CRUD API

As a **planning consultant**,  
I want **to create, update, and delete my availability blocks**,  
So that **employees only see times I offer**.

**FRs:** SCHED-FR1  
**UX:** UX-DR4  

**Acceptance Criteria:**

**Given** a planning_consultant  
**When** they manage availability via API  
**Then** blocks persist and validate (no overlapping invalid data per product rules)  
**And** only their own blocks are mutable unless admin override exists.

### Story 5.3: Derive slot list with double-book prevention

As a **system**,  
I want **slot generation to exclude booked consultant time**,  
So that **two people cannot reserve the same consultant instant**.

**FRs:** SCHED-FR2  
**NFR:** SCHED-NFR1  

**Acceptance Criteria:**

**Given** availability and existing bookings  
**When** slots are computed for a consultant  
**Then** booked windows are not offered  
**And** concurrent booking attempts cannot commit the same slot (SCHED-NFR1).

### Story 5.4: Consultant calendar view in control-pane

As a **planning consultant**,  
I want **to see my availability and bookings on a calendar or list**,  
So that **I can manage my week**.

**FRs:** SCHED-FR3  
**UX:** UX-DR4, UX-DR8 (layout patterns)  

**Acceptance Criteria:**

**Given** a signed-in planning_consultant  
**When** they open the scheduling section  
**Then** they see assigned bookings and remaining availability summary  
**And** control-pane uses shared theme tokens where introduced (UX-DR4).

---

## Epic 6: Employees book, view, and adjust their planning sessions

Eligible employees **list slots**, **book** with atomic reservation, **list** bookings, **cancel** and **reschedule** per policy; idempotency prevents duplicate bookings on retry.

### Story 6.1: List bookable slots for eligible employees

As a **collaborator**,  
I want **to see available times for my company**,  
So that **I can choose a session**.

**FRs:** SCHED-FR4, SCHED-FR13  
**UX:** UX-DR2, UX-DR7  

**Acceptance Criteria:**

**Given** an eligible active collaborator  
**When** they request slots for a date range within server max  
**Then** they receive bookable slots for their tenant only  
**And** ineligible or inactive users are denied (SCHED-FR13).

### Story 6.2: Create booking with atomic reservation

As a **collaborator**,  
I want **to confirm a slot and know immediately if it was taken**,  
So that **I do not double-book the consultant**.

**FRs:** SCHED-FR5, SCHED-NFR1, SCHED-NFR5  
**UX:** UX-DR7  

**Acceptance Criteria:**

**Given** a free slot  
**When** the employee submits booking  
**Then** the slot is reserved atomically or request fails with `SLOT_TAKEN` (or equivalent code)  
**And** idempotency key prevents duplicate booking on retry (SCHED-NFR5)  
**And** confirmation UI shows date/time (UX-DR7).

### Story 6.3: List and detail own bookings

As a **collaborator**,  
I want **to see my upcoming and past sessions**,  
So that **I can track my plan**.

**FRs:** SCHED-FR6  
**UX:** UX-DR6  

**Acceptance Criteria:**

**Given** an eligible collaborator  
**When** they open “Minhas sessões”  
**Then** they see bookings with status badges  
**And** statuses align with shared-types enums (UX-DR6).

### Story 6.4: Cancel booking per policy

As a **collaborator**,  
I want **to cancel when policy allows**,  
So that **I can free the slot**.

**FRs:** SCHED-FR7  
**UX:** UX-DR2  

**Acceptance Criteria:**

**Given** a booking in a cancellable state  
**When** the user confirms cancel  
**Then** the booking moves to cancelled per rules  
**And** past-cutoff cancels show clear pt-BR message (UX-DR2).

### Story 6.5: Reschedule without double reservation

As a **collaborator**,  
I want **to move my session to another slot**,  
So that **my plan fits my calendar**.

**FRs:** SCHED-FR8  

**Acceptance Criteria:**

**Given** a booking eligible for reschedule  
**When** the user picks a new slot  
**Then** old slot is released and new one reserved atomically or operation fails safely  
**And** no double reservation exists at end state.

### Story 6.6: Enforce hr_admin out of consultant scheduling APIs

As a **platform**,  
I want **hr_admin blocked from consultant assignment APIs**,  
So that **roles stay separated**.

**FRs:** SCHED-FR15  

**Acceptance Criteria:**

**Given** an hr_admin token  
**When** they call consultant-only scheduling mutation endpoints  
**Then** the server denies access.

---

## Epic 7: Consultants own the queue and close the loop

Consultants see **unassigned** bookings, **assign** to themselves, and **complete** or **terminate** sessions with reasons. Optional **platform_admin** overrides if product enables SCHED-FR12.

### Story 7.1: Queue of unassigned bookings

As a **planning consultant**,  
I want **to see bookings waiting for assignment**,  
So that **no employee is stuck**.

**FRs:** SCHED-FR9  
**UX:** UX-DR8, UX-DR12  

**Acceptance Criteria:**

**Given** bookings in awaiting-assignment state  
**When** a consultant opens the queue  
**Then** they see relevant rows sorted by policy (e.g. requested time)  
**And** primary action to assign is obvious (UX-DR8).

### Story 7.2: Assign booking to self

As a **planning consultant**,  
I want **to claim a booking**,  
So that **I own delivery**.

**FRs:** SCHED-FR10  
**NFR:** SCHED-NFR3  

**Acceptance Criteria:**

**Given** an unassigned booking  
**When** a consultant assigns to self  
**Then** booking shows consultant ownership  
**And** audit event is recorded (SCHED-NFR3).

### Story 7.3: Complete, cancel, or no-show with reason

As a **planning consultant**,  
I want **to close bookings with the right outcome**,  
So that **reporting stays accurate**.

**FRs:** SCHED-FR11  
**NFR:** SCHED-NFR3  

**Acceptance Criteria:**

**Given** an assigned booking  
**When** the consultant marks completed, cancelled, or no-show  
**Then** terminal state is stored with required reason enums  
**And** audit log entry is written.

### Story 7.4 (optional): Platform admin override

As a **platform admin**,  
I want **to reassign or cancel bookings for support**,  
So that **ops can fix edge cases**.

**FRs:** SCHED-FR12 (optional)  

**Acceptance Criteria:**

**Given** SCHED-FR12 is in scope for the release  
**When** platform_admin performs override  
**Then** action is audited (SCHED-NFR3)  
**Otherwise** story is skipped and feature flag remains off.

---

## Epic 8: Shared UX and accessibility polish across apps

Unify **theme tokens**, **status chips**, **motion/accessibility** rules, and **data table** patterns so hr-admin, control-pane, and ic-app stay coherent.

### Story 8.1: MUI theme tokens for new surfaces

As a **developer**,  
I want **shared spacing, radius, and typography in both web apps**,  
So that **new pages look consistent**.

**UX:** UX-DR4  

**Acceptance Criteria:**

**Given** hr-admin and control-pane theme configuration  
**When** new eligibility/scheduling screens are built  
**Then** they consume centralized theme tokens (spacing, radius, typography)  
**And** no one-off magic numbers dominate new components.

### Story 8.2: Cross-platform status chip / badge

As a **developer**,  
I want **one enum-driven status presentation pattern**,  
So that **eligibility and booking states match across apps**.

**UX:** UX-DR6  

**Acceptance Criteria:**

**Given** enums in `shared-types`  
**When** UI renders status  
**Then** web uses MUI Chip (or equivalent) and mobile uses consistent mapping  
**And** colors meet contrast rules for text on chip backgrounds (UX-DR9).

### Story 8.3: Accessibility baselines for web modals and motion

As a **user with assistive tech or motion sensitivity**,  
I want **keyboard support and reduced motion respected**,  
So that **I can use admin and consultant UIs comfortably**.

**UX:** UX-DR9, UX-DR10, UX-DR11  

**Acceptance Criteria:**

**Given** new modals in hr-admin/control-pane  
**When** opened  
**Then** focus is trapped, Esc closes, primary action reachable (UX-DR10)  
**And** contrast checked on primary controls (UX-DR9)  
**And** CSS transitions honor `prefers-reduced-motion` (UX-DR11).

### Story 8.4: ic-app spacing and typography constants

As a **developer**,  
I want **documented spacing and type roles on mobile**,  
So that **screens stay consistent before a full design system lands**.

**UX:** UX-DR5  

**Acceptance Criteria:**

**Given** ic-app source  
**When** new screens are added  
**Then** they import shared spacing and text style constants (or RN Paper theme)  
**And** touch targets meet minimum size per UX spec.

---

## Final validation summary

**FR coverage:** All listed AUTH-, ELIG-, and SCHED- MVP FRs map to at least one story. Optional **SCHED-FR12** isolated in Story 7.4. Growth **ELIG-FR13–FR14** not in MVP inventory above (per PRD); add future epic if prioritized.

**NFR coverage:** Security, audit, concurrency, idempotency, and UX accessibility are referenced in acceptance criteria or epic descriptions. **Token model** and **revocation latency** remain architecture follow-ups (ELIG-NFR4, AUTH open questions)—track as **Spike / ADR** story under Epic 1 or 2 if not already decided.

**Epic independence:** Epic 1 stands alone (auth). Epic 2 extends guards and roles. Epic 3 delivers HR value without scheduling. Epic 4 needs Epic 3 data. Epic 5 can be demoed with consultant tools before employees book **if** slot API exists; Epic 6 requires Epics 4–5. Epic 7 requires Epic 6’s booking lifecycle. Epic 8 can proceed in parallel once base screens exist.

**Story dependencies:** Within each epic, stories are ordered so **Story N.M** only relies on **N.1…N.(M-1)** and prior epics—no forward references.

**Brownfield:** No “clone starter” story; first stories assume existing monorepo per `architecture.md`.

---

_Epics and stories workflow complete. Use `bmad-sprint-planning` or dev skills to pull stories into sprints._
