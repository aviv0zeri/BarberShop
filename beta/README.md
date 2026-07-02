# beta — product stack

| Path | Role |
|------|------|
| `apps/BarberShop/front/` | **Expo React Native** — customer app (v2.0.0: tab shell) |
| `apps/BarberShop/back/` | Backend pointer (`app-backend.json`) — API TBD |
| `api/` | Shared API services (empty until v2.1+) |
| `gateopen/` | Shared Python libs for sandboxer / devstack |

## App entry

```
beta/apps/BarberShop/front/
  App.js                    → LocaleProvider + CustomerTabs
  src/theme/                → design tokens (from handoff)
  src/i18n/                 → he/en strings (seed from data.jsx)
  src/navigation/           → bottom tabs
  src/screens/customer/     → Home, Shop, Appointments, Profile
```

Port order: see [docs/handoff-study.md](../docs/handoff-study.md).
