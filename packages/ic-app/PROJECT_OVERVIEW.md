# IC App — project overview

- **Stack:** Expo + React Native (Android-first), Redux Toolkit, `react-redux`, `date-fns`.
- **Monorepo:** `@planning-monefica/ic-app` under `packages/ic-app`.
- **Shared contracts:** optional compile-time types from `@planning-monefica/shared-types` (dev dependency).
- **Entry:** `App.tsx` wraps the tree with the Redux `Provider` and a placeholder home screen.

## Commands

| Command        | Purpose                    |
| -------------- | -------------------------- |
| `npm start`    | Expo dev server (Metro)    |
| `npm run android` | Open on Android device/emulator |

See [ENV_SETUP.md](./ENV_SETUP.md) for API configuration.
