# Repo layout

| Path | Role |
|------|------|
| `handoff/` | Manager’s Claude Code prototype (design reference) |
| `alpha/` | Spikes and experiments |
| `beta/apps/BarberShop/` | Product mobile app |
| `beta/api/` | API components (not yet created) |
| `beta/gateopen/` | Shared devstack libs (`engine_paths`) |
| `versiontime/` | Version 2.0.0+ |
| `scripts/` | `local-dev.sh`, sandboxer helpers, prompter |
| `.engine/` | Gitignored dev state (sandboxer, metro logs) |

## Mobile app

```
beta/apps/BarberShop/
  front/     Expo React Native
  back/      app-backend.json → future gateway
```

## Design → product

1. Read `handoff/README.md`
2. Implement in `beta/apps/BarberShop/front/src/`
3. Keep Hebrew/RTL + English/LTR from handoff `STR` strings
