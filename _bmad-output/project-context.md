---
project_name: planning-monefica
user_name: Jhbalestrin
date: '2026-03-28'
sections_completed:
  - technology_stack
  - language_rules
  - framework_rules
  - testing_rules
  - quality_rules
  - workflow_rules
  - anti_patterns
status: complete
rule_count: 32
optimized_for_llm: true
discovery_patterns_found: 7
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Area | Versions / notes |
|------|-------------------|
| **Runtime** | Node **≥ 22**; root **npm 10.9.2** workspaces |
| **shared-types** | TypeScript **^5.7.3** → `dist/`; `package.json` **exports** are the public API surface |
| **server** | NestJS **^11**, Mongoose **^8**, class-validator / class-transformer, **date-fns ^4**, Jest, **env-cmd** + `packages/server/.env` |
| **hr-admin, control-pane** | Vite **^8**, React **^19**, MUI **^7**, Redux Toolkit, React Router **^7**, Axios, **date-fns ^4**, Vitest **^4** |
| **ic-app** | Expo **55** (canary pins in package), React **19.2**, RN **0.83.4**, TypeScript **~5.9.2** — **not** in root `tsconfig.json` references |
| **Contracts** | `@planning-monefica/shared-types` — source of truth for cross-package API shapes; bump when breaking |

**Compatibility:** Build **shared-types** before any package that imports it. Web apps proxy **`/api`** to the Nest server (HR Admin default dev port **3000**, Control Pane **3001**, API **5555** — confirm `vite.config.ts` and env).

---

## Critical Implementation Rules

### Language-Specific Rules

- **Server TypeScript:** `strictNullChecks`, `noImplicitAny`, `strictBindApply` on; CommonJS + decorators + `emitDecoratorMetadata`; target **ES2022**. Do not weaken without an explicit team decision.
- **Root solution graph:** Root `tsconfig.json` references `shared-types`, `server`, `hr-admin`, `control-pane` only — do not assume **ic-app** shares the same composite project; use its local TS config.
- **Dates:** Use **date-fns** (`formatISO`, `addDays`, etc.) in server, both Vite apps, and ic-app. Avoid **moment** and fragile `new Date(...)` string formatting in business logic.
- **Imports:** Vite apps are **`"type": "module"`**; server is CJS — respect each package’s module system when adding files or tooling.

### Framework-Specific Rules

- **Nest server — boundaries:** Do not import another module’s Mongoose schemas, models, or repos from outside that module. Cross-module calls go through the **owning module’s public service** (or types in **shared-types**, not ad-hoc schema sharing).
- **Nest — module API types:** Put shared interfaces and DTO-shaped types in **`*.interface.ts`** next to the module. Avoid large inline `interface` / `type` blocks in `*.service.ts` / `*.controller.ts` for public contract; re-export from **shared-types** when cross-cutting.
- **HR Admin & Control Pane — page modules:** New screens live under `src/pages/<kebab-feature>/` with **`containers/`** (data/router/RTK), **`components/`** (presentational only — no RTK Query/axios), **`api/`** (RTK Query `createApi`), optional **`state/`** / **`services/`**. Router uses a thin page entry; register new APIs in **`src/state/store.ts`**. Follow each package’s `docs/page-module-patterns.md` and existing `home` example.
- **Button navigation:** Follow `.cursor/rules/hr-admin-button-navigation.mdc` and `control-pane-button-navigation.mdc` for stack/back patterns — do not invent divergent navigation behavior between the two SPAs without updating those rules.
- **ic-app:** Android-first; align with `packages/ic-app` docs (`ENV_SETUP.md`, `PROJECT_OVERVIEW.md`) for env and runtime expectations.

### Testing Rules

- **server:** **Jest** (`npm run test -w @planning-monefica/server`); spec files excluded from main `tsconfig` compile — colocate `*.spec.ts` with source as existing tests do.
- **hr-admin / control-pane:** **Vitest** + Testing Library (`npm run test -w …`); **jsdom** environment.
- **ic-app:** `typecheck` via `tsc --noEmit` is the current CI gate; test script is a stub until real tests exist — add tests in the package’s chosen runner when implementing features, do not silently lower the typecheck bar.
- Before push, mirror **CONTRIBUTING.md**: server tests, both Vite test runs, ic-app typecheck.

### Code Quality & Style Rules

- **No root ESLint/Prettier** in repo today — follow existing file style and **`.cursor/rules/`**; prefer matching neighboring files over introducing conflicting patterns.
- **Naming:** Page folders **kebab-case** under `pages/`; Nest files follow Nest conventions; keep **shared-types** names stable when they are part of the public API.
- **Documentation:** Prefer updating **README**, **CONTRIBUTING**, **`docs/monorepo-hr-ic/GUIDE.md`**, or package `docs/` when behavior or ports change — not one-off comments only.

### Development Workflow Rules

- **Setup:** `npm install`; copy `packages/server/.env.example` → `.env`; build **shared-types** first when working locally (`npm run build -w @planning-monefica/shared-types` or root `build` order).
- **CI order:** install → shared-types → server → hr-admin → control-pane → tests → ic-app typecheck — do not reorder without updating CI and docs.
- **Optional install:** Root `install:deps` uses `PUPPETEER_SKIP_DOWNLOAD=1` when applicable — preserve if adding Puppeteer-dependent tooling.

### Critical Don't-Miss Rules

- **Do not** bypass **shared-types** with duplicate DTOs in clients or inline server types for published endpoints — single source of truth.
- **Do not** reach across Nest module persistence boundaries — use services.
- **Do not** put RTK Query or axios in presentational **components/** in Vite apps — keep them in **containers/** and **api/**.
- **Do not** add **ic-app** to root TypeScript project references without an intentional Expo + composite TS migration — breaks are easy to miss.
- **Security / ops:** Server uses **helmet**, CORS, env-based origins — extend using existing `main.ts` patterns; keep secrets in **`.env`**, not committed files.

---

## Usage Guidelines

**For AI Agents:**

- Read this file (and **`.cursor/rules/`** for file-type specifics) before implementing.
- Prefer the **more restrictive** option when a rule conflicts with a shortcut.
- After introducing a new cross-cutting pattern, update this file or the relevant **`.mdc`** rule.

**For Humans:**

- Keep this file **short and agent-specific**; move tutorials to **docs/**.
- Update when **package.json** majors or workspace layout changes.
- Remove rules that become universal defaults over time.

Last Updated: 2026-03-28
