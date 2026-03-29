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
  - 9
  - 10
  - 11
  - 12
  - 13
  - 14
inputDocuments:
  - product-brief-planning-monefica.md
  - product-brief-planning-monefica-distillate.md
  - prd-login-authorization-access.md
  - prd-eligibility.md
  - prd-scheduling.md
  - architecture.md
  - ../project-context.md
  - ../../docs/monorepo-hr-ic/GUIDE.md
workflowType: ux-design
project_name: planning-monefica
user_name: Jhbalestrin
date: "2026-03-29"
status: complete
languageNote: "Specification narrative in English (BMM document_output_language). All employee-facing (ic-app) copy specified in pt-BR."
workflowNote: "Steps 1–14 consolidated in one pass for deliverable UX spec; stakeholder context from prior discovery (Brazil, education-forward employee app, HR eligibility, in-house consultants)."
---

# UX Design Specification — planning-monefica

**Author:** Jhbalestrin  
**Date:** 2026-03-29

---

## 1. Purpose and scope

This document specifies **user experience** for the **planning-monefica** product: **three clients** (employee mobile **ic-app**, customer **hr-admin**, internal **control-pane**) aligned with PRDs and `architecture.md`.

**In scope:** Information architecture, key flows, interaction patterns, **pt-BR** copy guidance for **employee** surfaces, accessibility baseline, and alignment with **MUI** (web) and **Expo / React Native** (mobile).

**Out of scope:** High-fidelity visual mockups (Figma), marketing site, deep brand identity system (logo, illustration library)—unless added later.

---

## 2. Design goals

| Goal | Implication for UX |
|------|---------------------|
| **Trust** (money / wellbeing) | Calm hierarchy, no dark patterns, clear data use; avoid “gamified” finance tropes. |
| **Clarity** (eligibility & scheduling) | Obvious states: eligible vs not, booked vs pending; never blame the user for employer policy. |
| **Brazil-first** | **Employee UI: Portuguese (Brazil)**; dates/times in **local** presentation (`America/Sao_Paulo` default per architecture). |
| **Education-forward** (employee) | Planning is the hero; education is **supporting**—short modules, links, or cards—not a wall of jargon. |
| **HR control** | hr-admin communicates **who is sponsored**; employees see **outcome**, not internal HR mechanics. |
| **Consultant operations** | control-pane prioritizes **queue**, **calendar**, and **fast assignment** over visual flair. |

---

## 3. Personas and primary contexts

| Persona | Client | Primary jobs-to-be-done |
|---------|--------|-------------------------|
| **Employee** | ic-app | Know if I have access; book / manage planning session; feel oriented (education snippets). |
| **HR admin** | hr-admin | Maintain eligible roster; confirm changes; avoid mistakes. |
| **Planning consultant** | control-pane | Publish availability; see unassigned bookings; assign and complete sessions. |
| **Platform admin** | control-pane (subset) | Support overrides if product enables SCHED-FR12. |

**Contexts:** Mobile-first **Android** priority for ic-app; web **desktop** primary for hr-admin and control-pane (tablet acceptable).

---

## 4. Core experience

**Employee (ic-app):**  
One sentence: *“I can see if my employer included me, then schedule (or understand why I cannot) without confusion.”*

**HR admin:**  
*“I can manage who is eligible and trust the list matches what we sponsor.”*

**Consultant:**  
*“I can offer time, see demand, and own sessions without spreadsheet chaos.”*

---

## 5. Emotional response

- **Employees:** **Relief** and **control**—financial stress is common; tone is **supportive**, not judgmental. Avoid alarmist reds for neutral states.
- **HR:** **Confidence**—confirmations on remove/revoke; undo where feasible (spec aligns with eligibility PRD journey).
- **Consultants:** **Focus**—dense tables and filters are acceptable; reduce notification noise.

---

## 6. Design system alignment (brownfield)

### hr-admin & control-pane

- **MUI v7** per `project-context.md`. Use **MUI Data Grid** or **Table + filters** for rosters and queues when lists grow.
- **Theme:** Single `ThemeProvider` per app; prefer **CSS variables** or MUI theme tokens for **spacing, radius, type scale**—document tokens in each app’s theme file when introduced.
- **Density:** **comfortable** default for HR; **compact** optional for consultant queue (user setting later).

### ic-app (Expo)

- **Current stack:** RN + Redux Toolkit; **no** component library in `package.json` yet.
- **Recommendation:** Introduce **React Native Paper** (Material alignment, accessibility props) **or** keep **RN core** primitives until a library is chosen—**either way**, define **one** spacing scale (e.g. 4/8/16) and **two** text roles (title / body) in code as constants to avoid drift.
- **Touch targets:** Minimum **44×44 pt** for primary actions.

### Cross-platform content

- **Numbers:** Locale **pt-BR** for currency only when shown; session times show **clear timezone** (“Horário de Brasília”) on first scheduling exposure.

---

## 7. Visual foundation

| Token | Direction |
|-------|-----------|
| **Color** | Restrained palette: **primary** for main CTA; **neutral** surfaces; **warning** for irreversible HR actions; **error** only for true failures (not “not eligible”). |
| **Typography** | Web: MUI **Typography** variants. Mobile: one **semibold** title, **regular** body—system font acceptable for MVP. |
| **Elevation** | Cards for **session summary** and **eligibility status** on mobile; avoid heavy shadows. |
| **Iconography** | MUI Icons (web); **Material Community Icons** or **SF symbols** pattern on mobile if using Paper. |

**Accessibility:** Meet **WCAG 2.1 AA** intent for contrast on primary text and controls (validate with automated checks in CI when available).

---

## 8. Design directions (chosen)

**Direction: “Calm professional”** — trustworthy benefit, not a consumer trading app.

- Rounded **md** corners, generous whitespace on employee flows.
- **hr-admin** leans **utility** (tables, clear filters).
- **control-pane** leans **operational** (split view: queue + detail optional in growth).

---

## 9. Information architecture (high level)

### ic-app (employee)

```
Home / Início
├── Status do benefício (eligibility summary)
├── Agendar (slot picker — when eligible)
├── Minhas sessões (bookings list + detail)
└── Aprender (education hub — secondary; cards/links)
```

### hr-admin

```
People / Beneficiários (or Eligibility)
├── Eligible list (filters: eligible / not)
├── Employee detail → toggle eligibility (with confirm)
└── (Future) Import / bulk — out of MVP UX scope per PRD
```

### control-pane

```
Scheduling
├── My availability (consultant)
├── Queue (unassigned bookings)
├── My schedule (assigned)
└── (Optional) Admin overrides
```

---

## 10. User journeys (UX detail)

### Journey E1 — Employee: check access

1. After sign-in, **first screen** shows **benefit status** card.
2. States:
   - **Eligible:** Primary CTA **Agendar orientação** (or product term for planning session).
   - **Not eligible:** Explain in **plain pt-BR** (see copy table); **no** link that implies they can self-unlock unless product adds that epic.
   - **Error / loading:** Retry; offline message for mobile.

### Journey E2 — Employee: book session

1. **Date** selector → **available slots** list (chips or list rows).
2. Tap slot → **confirm** sheet with date/time + policy hint (“Você pode cancelar até…” when policy exists).
3. Submit → **success** with booking state (**confirmed** / **awaiting consultor** per backend).
4. **Conflict (slot taken):** Non-blaming message + refresh slots.

### Journey E3 — Employee: manage booking

1. **Minhas sessões** — list with status badge.
2. Detail: **Cancelar** / **Reagendar** per policy (disabled with explanation if past cutoff).

### Journey H1 — HR: eligibility

1. List with search by name/email.
2. **Add:** picker of tenant employees **without** duplicating full HRIS—simple modal.
3. **Remove:** **two-step confirm** with consequence text (ELIG-NFR5).

### Journey C1 — Consultant: availability + assignment

1. **Calendar or week grid** to add blocks (MVP can be **form**: start/end datetime).
2. **Queue** table: sort by requested time; row actions **Assumir**.
3. **My schedule** list; mark **Concluída** / **Não compareceu** with reason selector.

---

## 11. Component strategy

| Pattern | Web (MUI) | Mobile |
|---------|-----------|--------|
| Primary action | `Button` variant=contained | `Button` / `FAB` only if single global action |
| Lists | `List` + `ListItem`; DataGrid for large sets | `FlatList` |
| Feedback | `Snackbar` / `Alert` | `Snackbar` (Paper) or simple banner |
| Forms | `TextField`, `Select`, `Dialog` | `TextInput`, modal sheets |
| Empty states | `Typography` + illustration placeholder optional | Icon + short pt-BR line |
| Loading | `Skeleton` / `CircularProgress` | `ActivityIndicator` + skeleton rows where easy |

**Shared concept:** **Status chip** component mapping: `eligible` | `not_eligible` | `pending` | `confirmed` | `cancelled` (exact set = `shared-types` enums).

---

## 12. UX patterns (consistency rules)

1. **Never** show raw API error strings to employees—map to **codes** (architecture) + **pt-BR** messages.
2. **Eligibility** and **scheduling** errors: short title + one sentence + optional “O que fazer” (e.g. falar com RH).
3. **Destructive** actions: always **name the consequence** (“Você perderá o acesso ao benefício de planejamento”).
4. **Dates:** Relative **“Amanhã”** ok when unambiguous; always show **full date** on confirmation.
5. **Education** entries: max **one** tap to return to planning path; no infinite content rabbit holes in MVP.

---

## 13. Responsive design and accessibility

- **hr-admin / control-pane:** Support **1280px** width minimum for comfortable tables; horizontal scroll on narrow widths with **sticky** first column for names.
- **Keyboard:** Full **tab** order for web forms and dialogs; **Esc** closes modal.
- **Screen readers:** Meaningful **labels** on icon-only buttons (`aria-label`); announce **status changes** after booking (live region optional).
- **Motion:** Respect **`prefers-reduced-motion`** for web animations.

---

## 14. Copy reference — employee (pt-BR)

| Context | Suggested copy (adjust with legal/comms) |
|---------|------------------------------------------|
| Eligible header | “Seu benefício de planejamento financeiro está ativo.” |
| Primary CTA | “Agendar sessão” |
| Not eligible | “Seu empregador ainda não incluiu você neste benefício. Se achar que é um erro, fale com o RH.” |
| Loading slots | “Buscando horários disponíveis…” |
| Slot taken | “Este horário acabou de ser escolhido. Escolha outro.” |
| Booking success | “Sessão agendada. Você receberá uma confirmação com os detalhes.” |
| Cancel confirm | “Cancelar esta sessão?” |
| Education section title | “Conteúdos para ajudar no seu planejamento” |

**hr-admin / control-pane** copy can stay **pt-BR** or **EN** per internal team policy; product brief left this open—**recommend pt-BR** for HR if customers are Brazilian-only.

---

## 15. Traceability to PRDs

| PRD | UX surfaces |
|-----|-------------|
| Auth | Sign-in, wrong-app message, password flows (existing patterns per client). |
| Eligibility | ic-app status; hr-admin roster + confirm modals. |
| Scheduling | ic-app slot picker + bookings; control-pane availability + queue + assignment. |

---

## 16. Open UX items (for backlog)

- Push **notifications** copy and timing (PRD open).
- **Video / link** display on booking detail when medium is chosen.
- **HR read-only** scheduling dashboard (growth).
- **Illustrations** for empty states (brand).

---

## 17. Completion

This specification is **ready** for **epic/story breakdown** and **UI implementation** in **hr-admin**, **control-pane**, and **ic-app**. Update this file when **legal** or **marketing** approves final **pt-BR** strings or when **design system** libraries change on mobile.
