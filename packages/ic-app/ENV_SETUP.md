# IC App — environment and API base URL

## Development

- Use **Expo** (`npm start` in `packages/ic-app`) and point the app at your machine’s API.
- **Android emulator:** `http://10.0.2.2:5555` reaches the host loopback (API default port **5555**).
- **Physical device:** use your computer’s LAN IP, e.g. `http://192.168.1.10:5555`, and ensure the device and PC share a network.

## Suggested pattern

- Add `app.config.ts` (or `.env` with `expo-constants` / `expo-env`) to expose `extra.apiBaseUrl` per profile.
- Keep secrets out of the repo; document required keys in this file only as placeholders.

## Production / staging

- Set API base URL per build profile (EAS `eas.json` env, or CI-injected config).
- Use HTTPS endpoints only.
