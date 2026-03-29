# planning-monefica

Five-package **npm workspace** monorepo for HR Admin and Control Pane (web), IC App (Expo/Android), and a NestJS API.

| Package | Path | Role |
|---------|------|------|
| `@planning-monefica/shared-types` | [packages/shared-types](packages/shared-types) | Shared TypeScript DTOs / contracts |
| `@planning-monefica/server` | [packages/server](packages/server) | NestJS 11 + Mongoose |
| `@planning-monefica/hr-admin` | [packages/hr-admin](packages/hr-admin) | Vite + React + MUI |
| `@planning-monefica/control-pane` | [packages/control-pane](packages/control-pane) | Vite + React + MUI |
| `@planning-monefica/ic-app` | [packages/ic-app](packages/ic-app) | Expo + React Native |

## Quick start

```bash
npm install
cp packages/server/.env.example packages/server/.env
npm run build
npm run dev -w @planning-monefica/server    # API :5555
npm run start -w @planning-monefica/hr-admin     # UI :3000, /api proxied to API
npm run start -w @planning-monefica/control-pane # UI :3001, /api proxied to API
```

- Full checklist and Monefica parity notes: [docs/monorepo-hr-ic/GUIDE.md](docs/monorepo-hr-ic/GUIDE.md)
- Day-to-day commands: [CLAUDE.md](CLAUDE.md)
- Contributor setup: [CONTRIBUTING.md](CONTRIBUTING.md)

**Stack:** Node 22+, Nest 11, Mongoose 8, Vite 8, React 19, MUI 7, Expo (SDK in `packages/ic-app`).

## Docker (Mongo + API + all web UIs)

Requires [Docker Compose](https://docs.docker.com/compose/) v2.

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| MongoDB | `mongodb://localhost:27017` (DB `planning-monefica`) |
| API | http://localhost:5555 (e.g. `/api/v1/health`) |
| HR Admin | http://localhost:3000 |
| Control pane | http://localhost:3001 |
| IC app (static web export) | http://localhost:3002 |

Each web container serves the SPA and **proxies `/api` to the API** (same idea as Vite dev server). Set `JWT_SECRET` (and optional auth-related vars) via environment when starting Compose, e.g. `JWT_SECRET=mysecret docker compose up --build`.

For **ic-app** data in the container build, pass tenant and dev token at **build** time (Expo bakes `EXPO_PUBLIC_*` into the bundle):

```bash
EXPO_PUBLIC_TENANT_ID='<24-hex-mongo-id>' \
EXPO_PUBLIC_DEV_ACCESS_TOKEN='<jwt>' \
docker compose build ic-app && docker compose up
```

Optional env file: [docker/env.example](docker/env.example).
