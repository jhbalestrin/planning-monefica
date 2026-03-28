# HR Admin — page module pattern

Each **screen** (or small group of closely related routes) lives in its own folder under `src/pages/<name>/`, following the same ideas as Monefica consultor `genericPages/*` (example: `packages/consultor/src/genericPages/login`).

## Folder layout

```
src/pages/<pageName>/
├── HomePage.tsx          # optional: thin re-export for the router (e.g. export container as HomePage)
├── containers/           # smart components: hooks, Redux, RTK Query, routing
├── components/           # presentational UI (props in, JSX out)
├── api/                  # RTK Query slices (createApi, endpoints, generated hooks)
│   └── handlers/         # optional: onQueryStarted / side effects (see consultor login)
├── state/                # optional: slice, actions, selectors when not covered by RTK Query alone
└── services/             # optional: thin HTTP helpers if you avoid RTK Query for a call
```

## Responsibilities

| Area | Use for |
|------|---------|
| **containers** | `useGetXQuery`, `useAppDispatch`, `useNavigate`, map results/errors to **components** via props. |
| **components** | No data fetching; receive data and callbacks as props (easier to test). |
| **api** | Server communication via **RTK Query**; colocate request/response types or import from `@planning-monefica/shared-types`. |
| **state** | Form fields, wizard steps, UI flags that multiple containers share within the page. |
| **services** | Legacy or one-off HTTP; prefer `api/` + RTK Query for new work. |

## Store registration

Each `createApi` slice must be registered in [`src/state/store.ts`](../src/state/store.ts): add `[api.reducerPath]: api.reducer` and `api.middleware` to the store. When you add a new page API, extend the store in the same way.

## Reference implementation in this repo

- **Home:** [`src/pages/home/`](../src/pages/home/) — `healthApi`, `HomeContainer`, `HomeView`.

## Typed Redux hooks

Use [`src/hooks/redux.ts`](../src/hooks/redux.ts) (`useAppDispatch`, `useAppSelector`) in containers for correct typing.

## Navigation

Use React Router `Link` with MUI `component={Link}` for in-app navigation where appropriate (see `.cursor/rules/hr-admin-button-navigation.mdc`).
