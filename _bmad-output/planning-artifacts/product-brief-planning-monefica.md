---
title: "Product Brief: planning-monefica"
status: complete
created: "2026-03-28T15:33:33Z"
updated: "2026-03-28T15:38:46Z"
inputs:
  - conversation (product discovery)
  - prd-login-authorization-access.md
  - project-context.md
  - docs/monorepo-hr-ic/GUIDE.md
---

# Product Brief: Employer-Sponsored Financial Planning (Brazil)

## Executive Summary

We are building a **B2B platform for Brazilian companies** to offer **personal financial planning** as a workforce benefit. **HR defines which employees are eligible**; **employees** use a **mobile app** (Portuguese UI) to **book and receive planning**, supported by **education-first content** that reinforces outcomes without replacing the core service. **Our consultants are in-house**—not a freelance marketplace—so quality, methodology, and brand stay consistent.

The employer problem is **wellbeing**: financial stress is a major source of worry for Brazilian workers, and that stress shows up in engagement, health, and performance. The employee problem is practical—**how to manage money, pay down debt, save, and invest**—often addressed today only through **independent planners** or ad hoc help, with uneven access and cost.

We charge companies through **flexible commercial models** (e.g. **fully employer-paid** or **employer subsidy as a percentage**), aligning procurement with how different clients fund benefits. Operationally, employees **schedule against shared availability**; **consultants assign or carry** each case so delivery is controlled and measurable.

**Why now:** employer interest in **financial wellbeing** and **education** is rising in Brazil, while many organizations still under-invest relative to employee demand—opening space for a **structured, employer-sponsored** planning offer with a clear HR narrative.

---

## The Problem

**For HR and people leaders (buyer)**  
They need benefits that **meaningfully support wellbeing** and are **defensible in budget conversations**. Financial stress is a large, often silent driver of distraction and dissatisfaction; generic perks may not address **money anxiety** at scale.

**For employees (user)**  
Many struggle with **day-to-day money decisions**: prioritizing **debts**, building **savings**, and understanding **how to invest** safely and consistently. Without structured help, they rely on **fragmented sources**—including **independent planners**—which can be **hard to find, compare, trust, or afford**, especially for segments employers care about most.

**Status quo cost**  
Employees under-support their own financial health; employers see the symptom (stress, turnover risk, presenteeism) but lack a **standardized, auditable benefit** that ties **access, eligibility, and outcomes** to a single program.

---

## The Solution

A **multi-tenant platform** (aligned with the existing **NestJS + mobile + HR web + internal admin** architecture) where:

1. **Companies** contract the benefit and choose **how they pay** (full company-paid vs **shared / percentage-based** employer contribution—exact commercial rules to be specified in pricing and contracts).
2. **HR administrators** **maintain the list of employees eligible** for the app and the benefit.
3. **Employees** sign in to a **Portuguese-language mobile experience** that is **education-oriented** in tone and content, while the **anchor value** is **financial planning** delivered through **scheduled sessions** with **in-house consultants**.
4. **Consultants** work from **shared scheduling** and **assignment** workflows so each eligible employee is **processed through** the planning service in an orderly, trackable way.

The product narrative externally should favor **“employee”** language; eligibility is **not limited to “individual contributors” only**—HR decides who is included.

---

## What Makes This Different

| Dimension | Differentiator |
|-----------|----------------|
| **Channel** | **Employer-sponsored** access—meets employees where their benefits already live, with **eligibility and subsidy** controlled by HR. |
| **Delivery** | **Planning is the product**; **education** is **supporting content** (onboarding, reinforcement, literacy)—not a thin content library with optional chat. |
| **Supply** | **In-house consultants** vs relying on a **dispersed independent planner** market for core delivery—**repeatable methodology**, quality bar, and operational control. |
| **Commercial** | **Flexible employer payment models** so the same platform fits **fully funded** and **co-pay** strategies. |
| **Market** | **Brazil-first**: **pt-BR UI**, local money realities (debt, inflation, savings behavior), and HR buying context. |

**Honest moat:** execution—**trust**, **consultant throughput**, **scheduling and assignment at scale**, and **employer reporting**—more than a single technical barrier.

---

## Who This Serves

**Primary buyer:** HR / People / Benefits leaders at **Brazilian companies** who own **wellbeing and benefits** budgets.

**Primary user:** **Employees** (any role HR marks eligible) who want **structured financial planning** and practical help with **debt, savings, and investing**, in **Portuguese**.

**Secondary users:** **In-house consultants** and **internal platform operators** (configuration, tenants, operations)—must be supported with efficient tools (control-pane / back-office direction already in the technical stack).

**Success looks like:** employees **complete planning journeys** and report **clarity and reduced money anxiety**; HR sees **utilization, satisfaction, and a credible wellbeing story**; the business sees **retention and expansion** of employer contracts.

---

## Success Criteria

- **Employee:** meaningful **completion** of planning touchpoints; **satisfaction** with clarity and next steps; **safe engagement** with educational content.
- **HR:** simple **eligibility management**; visibility into **uptake** (and, over time, outcomes proxies appropriate for an education/planning positioning).
- **Operations:** **consultant utilization**, **schedule coverage**, **assignment SLAs**, low **operational firefighting**.
- **Business:** **contract value** and **mix** of subsidy models; **renewal**; **cost to serve** per active employee.

*(Specific targets to be set once baseline and instrumentation exist.)*

---

## Scope

**In (product direction, not yet fully specified in PRDs):** employer contracts and charging models; HR eligibility; employee mobile app in **Portuguese**; **planning sessions** with **shared scheduling** and **consultant assignment**; **education as supporting** content; **in-house** delivery model.

**Already in planning artifacts:** **login, authorization, and access** across **employee mobile**, **HR web**, and **internal** apps—foundational for everything above.

**Explicit boundaries to clarify next:** regulatory framing in Brazil (**educational orientation** vs regulated advice—legal review); exact **session formats** (length, cadence, channels); **what “percentage company payment”** means for employee UX and billing; naming alignment (**employee** in product vs **`ic-app` / collaborator** in code).

**Out (until explicitly added):** marketplace of external planners as core supply; self-serve signup without employer relationship; features outside Brazil unless strategy changes.

---

## Vision (2–3 Years)

If successful, the platform becomes the **default employer-sponsored financial planning layer in Brazil** for mid-sized and large companies—combining **trusted in-house planners**, **scalable scheduling**, and **education** that keeps employees engaged between sessions. Expansion might include **richer HR analytics**, **deeper integrations** (payroll, benefits), and **additional languages** only if the core Brazil offer is proven.

---

## Compliance & positioning (flag)

The **education-first** employee experience supports a **clear positioning** with regulators and partners, but **copy, flows, and consultant scripts** should be **reviewed by qualified Brazilian counsel** to stay aligned with rules governing **financial education vs investment advice** and related disclosures.
