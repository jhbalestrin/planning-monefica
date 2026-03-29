---
workflowType: implementation-readiness
project_name: planning-monefica
assessmentDate: "2026-03-29"
stepsCompleted:
  - step-01-document-discovery
  - step-02-prd-analysis
  - step-03-epic-coverage-validation
  - step-04-ux-alignment
  - step-05-epic-quality-review
  - step-06-final-assessment
documentsInScope:
  prds:
    - prd-login-authorization-access.md
    - prd-eligibility.md
    - prd-scheduling.md
  supporting:
    - product-brief-planning-monefica.md
    - product-brief-planning-monefica-distillate.md
  architecture: []
  epics: []
  ux: []
assessorNote: "Consolidated run (steps 2–6 executed in one pass after discovery). Step 1 menu bypassed for actionable delivery."
---

# Implementation Readiness Assessment Report

**Date:** 2026-03-29  
**Project:** planning-monefica  
**Assessor:** BMAD implementation-readiness workflow (automated)

---

## Document Discovery

### PRD files found (`_bmad-output/planning-artifacts/`)

**Whole documents:**

| File | Size | Modified (local) |
|------|------|------------------|
| `prd-login-authorization-access.md` | ~13.4 KB | 2026-03-29 |
| `prd-eligibility.md` | ~14.4 KB | 2026-03-29 |
| `prd-scheduling.md` | ~14.8 KB | 2026-03-29 |

**Sharded PRD folders:** none.

**Duplicates (whole vs sharded):** none.

### Architecture documents

**Whole / sharded:** none under `_bmad-output/**`.

**Impact:** Architecture decisions (token model, collections, module boundaries for eligibility/scheduling, concurrency for slots) are **not** captured in a planning-artifact architecture doc. Brownfield guidance exists in `_bmad-output/project-context.md` (implementation-oriented, not a solution architecture).

### Epics & stories documents

**Whole / sharded:** none matching `*epic*.md` under `_bmad-output/planning-artifacts/`.

**Impact:** **No traceability map** from epics/stories to FRs. Phase-4-style implementation planning per this workflow is **blocked** until epics exist (or team explicitly waives traceability).

### UX design documents

**Whole / sharded:** none matching `*ux*.md` under planning artifacts.

**Impact:** Multi-surface UX (hr-admin, ic-app pt-BR, control-pane scheduling) is **implied** by PRDs but not specified in a UX artifact.

### Supporting context (not PRDs)

- `product-brief-planning-monefica.md`
- `product-brief-planning-monefica-distillate.md`

---

## PRD Analysis

### Scope note

Three **separate** PRDs exist (not one monolith). **FR numbers are reused per document** (e.g. each has **FR1**). For implementation tracking, use **qualified IDs**: `AUTH-FR1`, `ELIG-FR1`, `SCHED-FR1`, etc.

### Functional requirements extracted

#### `prd-login-authorization-access.md` — 20 FRs

- **FR1:** Sign-in with valid credentials + allowed role for client → authenticated session.
- **FR2:** Valid credentials but wrong client → clear non-leaky error.
- **FR3:** Server identifies initiating client for access decisions.
- **FR4:** Disabled/archived user cannot sign in or refresh session.
- **FR5:** New tenant HR or collaborator account can set/receive initial password per policy.
- **FR6:** Authenticated user can change password while signed in.
- **FR7:** Forgot password → reset via verified channel (≥1 path MVP).
- **FR8:** Reset/invite links expire (configurable) and single-use where applicable.
- **FR9:** Password change invalidates existing sessions (or documented policy).
- **FR10:** Logout invalidates session/token per strategy.
- **FR11:** Expired sessions cannot access protected resources without re-auth/refresh.
- **FR12:** Server exposes role(s) + tenant context tamper-evidently.
- **FR13:** Collaborators only tenant-scoped IC resources for their tenant.
- **FR14:** HR admins only tenant-scoped HR resources for their tenant.
- **FR15:** Platform admins platform resources; no default tenant HR/IC privileges.
- **FR16:** Protected routes deny wrong role/client access.
- **FR17:** Failed sign-in rate-limited/throttled.
- **FR18:** Security events logged (PII-minimal) with timestamp + correlation id.
- **FR19:** HR admin (or job) can mark tenant user active/inactive.
- **FR20:** Platform admin can create/disable platform operator accounts.

**Total:** 20 FRs.

#### `prd-eligibility.md` — 12 MVP FRs (+ 2 growth)

- **FR1:** HR admin view list of eligible employees (tenant).
- **FR2:** HR admin mark employee eligible (subject to collaborator user existing/onboarding).
- **FR3:** HR admin remove eligibility (revoke benefit; identity optional).
- **FR4:** HR admin correct mistakes / re-instate eligibility.
- **FR5:** System records eligibility changes (actor, timestamp, target) for audit.
- **FR6:** Collaborator retrieves own eligibility status.
- **FR7:** Ineligible collaborator cannot invoke benefit-scoped capabilities (safe errors).
- **FR8:** Server rejects ineligible collaborators on benefit APIs (documented errors).
- **FR9:** Server rejects eligibility management from non–hr_admin.
- **FR10:** Eligibility checks after auth + tenant binding.
- **FR11:** Inactive user cannot gain benefit access via eligibility alone.
- **FR12:** No cross-tenant eligibility mutation.
- **FR13 (growth):** Bulk import eligibility + validation report.
- **FR14 (growth):** Filter directory by eligibility state.

**Total:** 12 MVP + 2 growth FRs.

#### `prd-scheduling.md` — 15 FRs (1 optional)

- **FR1:** planning_consultant CRUD availability blocks → bookable slots.
- **FR2:** System derives tenant slot list; no double-book same consultant-time.
- **FR3:** Consultant views own calendar of assignments + remaining availability.
- **FR4:** Eligible collaborator lists bookable slots for tenant (date range capped).
- **FR5:** Eligible collaborator creates booking; atomic reserve or reject.
- **FR6:** Collaborator lists own bookings + status.
- **FR7:** Collaborator cancels own booking per policy.
- **FR8:** Collaborator reschedules per policy (no double reservation).
- **FR9:** Consultant views unassigned bookings (tenant scope TBD).
- **FR10:** Consultant assigns unassigned booking to self.
- **FR11:** Consultant marks completed / cancelled / no-show with reason.
- **FR12 (optional MVP):** platform_admin reassign/cancel any booking with audit.
- **FR13:** Server denies booking/slots for ineligible or inactive collaborators.
- **FR14:** Bookings include tenantId + employee user id; no cross-tenant for tenant actors.
- **FR15:** hr_admin cannot assign as planning consultant via scheduling APIs (MVP).

**Total:** 14 MVP + 1 optional FR.

**Grand total (MVP functional):** 20 + 12 + 14 = **46** qualified FR statements (plus optional SCHED-FR12 and growth eligibility FRs).

### Non-functional requirements extracted

| PRD | NFRs |
|-----|------|
| Login / auth | NFR1–NFR7 (hashing, tokens, secrets, CORS, PII in logs, degradability, metrics) |
| Eligibility | NFR1–NFR6 (tenant isolation, audit PII, server source of truth, revocation latency TBD, HR confirm destructive, eligibility denial metrics) |
| Scheduling | NFR1–NFR5 (concurrency/atomic booking, performance SLO TBD, audit, UTC/timezone, idempotency) |

**Grand total:** **18** NFR statements (numbered independently per PRD — same qualification recommendation).

### Additional constraints (cross-cutting)

- **`planning_consultant`** role + control-pane surfaces extend auth matrix (`prd-scheduling.md`, `prd-login-authorization-access.md` Dependencies).
- **Brazil / pt-BR** employee UI (product brief / distillate).
- **Open questions** remain in each PRD (identifiers, token model, onboarding, scheduling policy, consultant↔tenant coverage, etc.) — **architecture + backlog** should assign owners.

### PRD completeness assessment

- **Strengths:** Clear **FR/NFR** lists, explicit **dependencies** between PRDs, **out-of-scope** boundaries (scheduling vs eligibility vs auth).
- **Gaps:** **Overlapping FR numbering** across files (traceability risk). Several **TBD** NFRs (SLOs, revocation latency, cancellation policy). **No single architecture document** tying auth extension, data model, and concurrency design together.

---

## Epic Coverage Validation

### Epics document status

**No `*epic*.md` (whole or sharded)** found in `_bmad-output/planning-artifacts/`.

### Coverage matrix

| Area | PRD FRs (MVP) | Epic/story coverage |
|------|----------------|---------------------|
| Auth | AUTH-FR1–FR20 | **NOT FOUND** — no epics file |
| Eligibility | ELIG-FR1–FR12 | **NOT FOUND** |
| Scheduling | SCHED-FR1–FR11, FR13–FR15 | **NOT FOUND** |

### Missing FR coverage

**All 46 MVP FRs** lack explicit epic/story mapping in tracked planning artifacts.

**Recommendation:** Run **`bmad-create-epics-and-stories`** (or equivalent) and add a **traceability table** (FR → epic → story) in `planning-artifacts/` before treating implementation as “planned.”

### Coverage statistics

- **Total MVP FRs (qualified):** 46  
- **FRs covered in epics document:** 0  
- **Coverage percentage:** **0%** (artifact missing)

---

## UX Alignment Assessment

### UX document status

**Not found** (`*ux*.md` / `*ux*/index.md` in planning artifacts).

### Alignment issues

- PRDs imply **substantial UI**: hr-admin (eligibility), ic-app (eligibility + booking, **pt-BR**), control-pane (consultant availability, queue, assignment).
- Without UX specs: **copy**, **flows**, and **error states** risk diverging from PRD intent; **accessibility** and **mobile patterns** undefined at planning layer.

### Warnings

- **HIGH:** User-facing product with **no UX artifact** — acceptable only if team defers UX doc and accepts **iteration cost** during build.
- Architecture doc also **missing** — cannot validate UX ↔ architecture (performance, real-time needs, offline) formally.

---

## Epic Quality Review

### Document status

**No epics/stories document** — review **not applicable** at artifact level.

### Standards preview (apply when epics are written)

When you add epics, enforce:

- **User-value epics** (not “setup Mongo” only) — auth may still be framed as enabling “secure sign-in across apps.”
- **Epic independence** — eligibility epic should not depend on a future scheduling epic for its **own** demo (e.g. eligibility APIs + HR UI + employee “am I eligible?” without booking).
- **No forward story dependencies** inside an epic; **vertical slices** preferred.
- **Traceability** — each story references **qualified FR ids**.

**Red flags to avoid:** “Epic: API development” with no user outcome; stories that **require** unbuilt epics to pass acceptance tests.

---

## Summary and Recommendations

### Overall readiness status

**NOT READY** for Phase-4-style implementation **as defined by this workflow** (PRD + architecture + epics + UX alignment).  

**READY to begin structured planning** (epics/architecture/UX) and **READY for spike-level engineering** on brownfield codebase **if** the team accepts **informal** traceability until artifacts exist.

### Critical issues requiring immediate action

1. **No epics/stories** — **0% FR coverage** in planning artifacts; no sprint-ready breakdown.
2. **No architecture document** — Open decisions (JWT vs session, eligibility + booking data model, slot concurrency, `planning_consultant` auth extension) lack a single **decision record**.
3. **No UX specification** — Three clients and **pt-BR** requirement without UX deliverable increases **rework risk**.

### Recommended next steps

1. **Create epics + stories** from the three PRDs with a **FR → story matrix** (use qualified FR IDs).
2. **Produce a thin architecture note** (even 2–4 pages): auth token claims extension, core collections/entities for eligibility and booking, Nest module ownership, booking concurrency approach.
3. **Add minimal UX**: flow diagrams or key screens for **eligibility** (HR + employee) and **scheduling** (book slot, consultant queue) with **pt-BR** copy guidelines.
4. **Resolve cross-PRD open questions** in backlog grooming (assign owner + target milestone per question).

### Final note

This assessment found **blocking gaps** in **epics**, **architecture**, and **UX** artifacts, despite **strong PRD coverage** (46 MVP FRs + 18 NFRs across three documents). Address **critical** items before scaling implementation; alternatively, document an explicit **team waiver** of formal traceability if you intentionally ship with PRD-only guidance.

---

**Report path:** `_bmad-output/planning-artifacts/implementation-readiness-report-2026-03-29.md`
