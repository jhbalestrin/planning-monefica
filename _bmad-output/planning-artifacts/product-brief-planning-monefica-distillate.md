---
title: "Product Brief Distillate: planning-monefica"
type: llm-distillate
source: "product-brief-planning-monefica.md"
created: "2026-03-28T15:38:46Z"
purpose: "Token-efficient context for downstream PRD creation"
---

# Product Brief Distillate — planning-monefica

Dense context for PRD/epic work. Prefer the executive brief for stakeholder narrative.

## Product intent

- B2B **Brazil** platform: companies offer **personal financial planning** as a benefit; **HR sets eligible employees**; employees use **mobile app**; **in-house consultants** deliver planning via **shared scheduling** + **assignment** workflows.
- **Planning = core product**; **education = supporting** content (tone, modules, reinforcement)—not “content-only” as primary value.
- **Commercial:** employer options include **100% company-paid** and **employer pays a percentage** (employee or other party covers remainder—**define in pricing/PRD**: split rules, caps, invoicing).
- **Competitive reference:** users might otherwise use **independent planners**; differentiation = **employer channel**, **eligibility/subsidy**, **in-house quality/methodology**, **platform operations**.
- **Wellbeing narrative for HR:** financial stress drives employee worry (stakeholder cited **~50% money-related stress in Brazil**—**verify source** before external claims).

## Naming and personas

- **User-facing:** prefer **“employee”** / Portuguese equivalents; app is **not** “IC-only.” **IC** meant **individual contributor** internally; **eligibility is HR-defined** (any employee type HR adds).
- **Codebase today:** package **`ic-app`**, role **`collaborator`**, PRD “Individual Collaborator”—PRDs should state **display naming vs technical IDs** to avoid drift.

## Localization

- **All employee-facing UI: Portuguese (Brazil).**
- Brief/docs for stakeholders may stay English per team config; **legal/marketing/consultant collateral language policy** still open.

## Technical context (brownfield)

- **Stack:** NestJS 11 API + MongoDB; **shared-types** for contracts; clients: **ic-app** (Expo/RN), **hr-admin** (Vite/React/MUI), **control-pane** (Vite/React/MUI); **tenant isolation** for customer users; **platform roles** separate from tenant HR/employee.
- **Filed PRDs** (same folder as this distillate): `prd-login-authorization-access.md` (auth); `prd-eligibility.md` (HR eligibility + benefit gate); `prd-scheduling.md` (availability, employee booking, consultant assignment; introduces **`planning_consultant`** for control-pane—auth matrix extension).
- **Auth PRD** covers **authn/z, roles, app access matrix, passwords, sessions**—**FR1–FR20**; it does **not** define scheduling, billing, or eligibility UX—see linked PRDs above.
- **Open questions from auth PRD** (carry forward): sign-in identifier (email/username/scope); **who creates employee accounts** (HR, bulk, invite); password policy; platform user storage model; JWT vs server session; hr_admin on mobile (MVP denied).

## Requirements hints (for future PRDs)

- HR: **CRUD or equivalent for eligible employee list**; tie access to **tenant** + **active flag** (auth PRD already has inactive user deny).
- Employee app: **book from shared calendar**; **consultant assignment** to case; **education** surfaces (format TBD: articles, tracks, in-app modules).
- Consultants: **schedule**, **assignments**, **case pipeline**—likely **new surfaces** (hr-admin extension vs separate tool vs control-pane—**architecture decision**).
- Internal ops: **control-pane** for tenants, config, operator accounts (per existing direction).
- **Security:** server-side enforcement for every protected route; client-only gating insufficient (already in auth PRD).

## Explicitly out / rejected (current direction)

- **External planner marketplace** as **core** delivery supply (in-house only for planning).
- **Public self-registration** without employer/tenant relationship (auth PRD already out unless product changes).
- **Geographic expansion** outside Brazil until strategy says otherwise.

## Market / research snippets (lightweight)

- Brazil: **employee demand** for employer-backed **financial wellbeing/education** often **outpaces employer investment** (e.g. WTW-style industry reporting—**cite properly** if used in sales).

## Regulatory / risk

- Position as **education-forward** UI/content; **planning conversations** may still touch regulated topics—**Brazilian legal review** for boundaries between **education vs investment advice**, disclosures, and consultant scripts **before** public launch claims.

## PRD sequencing suggestions

1. **Auth** — `prd-login-authorization-access.md` (baseline).
2. **Eligibility & employee lifecycle** — `prd-eligibility.md` (HR admin + server rules).
3. **Scheduling & consultant assignment** — `prd-scheduling.md` (availability, booking, **`planning_consultant`**; extends auth).
4. **Employee planning journey** (mobile flows post-booking; optional dedicated PRD).
5. **Education layer** (CMS/strategy, placement in app).
6. **Commercial / billing** (company-paid vs % subsidy, entitlements).
7. **Reporting** (HR utilization, ops metrics).

## Open questions (unresolved in discovery)

- Exact **session** shape: duration, remote vs in-person, frequency, handoff between consultants.
- **Capacity model:** consultants per active employees; SLA for first session.
- **Percentage payment** UX: how employee sees co-pay, invoicing, and eligibility expiration.
- Whether **consultant tooling** ships as **new app**, **control-pane module**, or **hr-adjacent** internal UI.
