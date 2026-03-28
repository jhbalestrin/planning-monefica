# Contributing

## Prerequisites

- Node.js **22+**
- MongoDB reachable from your machine (for API runtime; default URI in `packages/server/.env.example`)

## Setup

```bash
npm install
cp packages/server/.env.example packages/server/.env
npm run build -w @planning-monefica/shared-types
```

## Development workflow

1. Start API: `npm run dev -w @planning-monefica/server`
2. Start HR Admin: `npm run start -w @planning-monefica/hr-admin`
3. Start IC App when needed: `npm start -w @planning-monefica/ic-app`

Run tests before pushing:

```bash
npm run test -w @planning-monefica/server
npm run test -w @planning-monefica/hr-admin
npm run typecheck -w @planning-monefica/ic-app
```

CI mirrors: install → build shared-types → server → hr-admin → tests → ic-app typecheck.

## Conventions

See [.cursor/rules/](.cursor/rules/) and [docs/monorepo-hr-ic/GUIDE.md](docs/monorepo-hr-ic/GUIDE.md) for server module boundaries, `.interface.ts` typing, date-fns, and HR Admin navigation patterns.
