# planning-monefica — contributor quick reference

npm workspace monorepo: **shared-types**, **server** (NestJS), **hr-admin** (Vite/React), **ic-app** (Expo). Scope: `@planning-monefica/*`. Default API port: **5555**.

## Commands

| Goal | Command |
|------|---------|
| Install | `npm install` (from repo root) |
| Build all (types → server → web) | `npm run build` |
| Server dev (watch) | `cp packages/server/.env.example packages/server/.env` then `npm run dev -w @planning-monefica/server` |
| Web dev | `npm run start -w @planning-monefica/hr-admin` (port 3000, proxies `/api` → 5555) |
| Mobile dev | `npm start -w @planning-monefica/ic-app` |
| Tests | `npm run test` |

## Environment

- **Server:** `packages/server/.env` — see `.env.example` (`PORT`, `ENV`, `MONGODB_URL`, optional `CORS_ORIGINS`).
- **HR Admin:** optional `packages/hr-admin/.env` — see `.env.example` (`VITE_API_BASE_URL` empty in dev to use Vite proxy).

## Optional local hosts

For cookie/CORS parity with production-style hostnames, add to `/etc/hosts` (example):

```text
127.0.0.1 local.hradmin.example.com
```

Run Vite with `--host local.hradmin.example.com` if needed.

## Architecture notes

- API route prefix: global `api` + URI versioning → e.g. `GET /api/v1/health`.
- Shared DTOs live in `@planning-monefica/shared-types`; build that package before consumers.
- **Workspace link:** this repo uses `file:../shared-types` in package manifests because `workspace:*` failed to resolve with the current npm install path in some environments; npm workspaces still hoist packages normally.

Longer patterns and parity checklist: [docs/monorepo-hr-ic/GUIDE.md](docs/monorepo-hr-ic/GUIDE.md).
