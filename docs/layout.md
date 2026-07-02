# Repo layout

Canonical structure (matches GateOpen + `setupp application`).

| Path | Role |
|------|------|
| `handoff/` | **Read-only** manager design reference — see [handoff-study.md](handoff-study.md) |
| `alpha/` | Experiments / spikes |
| `beta/apps/BarberShop/` | Product mobile app (`front/` + `back/`) |
| `beta/api/` | Shared API components (when backend lands) |
| `beta/gateopen/` | Shared Python libs (`devstack/engine_paths` for tooling) |
| `docker/` | Container images at **repo root** (not under `beta/`) |
| `versiontime/` | Version 2.0.0+ |
| `scripts/` | Dev helpers (gitignored) |
| `.engine/` | Local dev state (gitignored) |

There is **no** `api/` or `apps/` at repo root — product code lives only under `beta/`.

## Handoff → product

1. Read [handoff-study.md](handoff-study.md) and `handoff/README.md`
2. Implement in `beta/apps/BarberShop/front/src/`
3. Do **not** modify `handoff/`

## Mobile app

```
beta/apps/BarberShop/
  front/     Expo React Native
  back/      app-backend.json → future gateway
```
