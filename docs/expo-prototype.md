# Expo prototype vs dev-client

New apps from `mobilize` / `setupp` should default to **Expo Go** until `expo run:ios` is done once.

| Phase | `npm start` | When |
|-------|-------------|------|
| Prototype | `expo start --go` | Porting handoff, no native modules |
| Product | `expo start --dev-client` | After `expo run:ios` / custom native code |

Set `BARBER_EXPO_MODE=dev-client` in `local-dev.sh` to switch.
