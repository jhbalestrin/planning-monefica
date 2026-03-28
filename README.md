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
