# BarberShop

<!-- versiontime:begin -->
**Version 2.0.0** · Released 2026-07-02 · [Release notes](versiontime/VERSION.md)
<!-- versiontime:end -->

Bilingual barber booking and shop-management app — customers book appointments and shop; barbers manage calendar, staff, CRM, and retail.

**V2** starts from the manager’s [Claude Code prototype](handoff/README.md) in `handoff/` (HTML/React reference). The product ships as **React Native (Expo)** under `beta/apps/BarberShop/front/`.

## Documentation

| Doc | Description |
|-----|-------------|
| [handoff/README.md](handoff/README.md) | Design handoff — screens, cart scheduler, i18n |
| [docs/layout.md](docs/layout.md) | Repo layout |
| [docs/handoff-workflow.md](docs/handoff-workflow.md) | **Handoff workflow** (`setupp handoff …`) |
| [docs/handoff-study.md](docs/handoff-study.md) | **Handoff study** — port order (read-only `handoff/`) |
| [docs/todo.md](docs/todo.md) | Backlog |
| [docs/sandboxer.md](docs/sandboxer.md) | Dev stack runner |

## Repo layout

| Path | Role |
|------|------|
| [handoff/](handoff/) | **Manager prototype** (Claude Code) — design reference, not production code |
| [alpha/](alpha/README.md) | Experiments / spikes |
| [beta/](beta/README.md) | Product stack — apps, api, shared libs |
| [beta/apps/BarberShop/](beta/apps/BarberShop/) | Expo RN app (`front/`) + backend pointer (`back/`) |
| [docker/](docker/) | Container images (when API lands) |
| [scripts/](scripts/) | Dev helpers — `local-dev.sh`, sandboxer, prompter |
| [versiontime/](versiontime/) | Semantic versioning |

## Dev workflow (GateOpen-style)

```bash
cd ~/work/personal/BarberShop
prompter              # interactive menu
.engine/sandboxer --full   # Metro + Simulator
iphonetest            # physical iPhone (after native install)
versiontime status
developer-help        # all zsh tools
```

## Next

1. Run `./prompter` → **Metro + Simulator** — four customer tabs (Hebrew default)
2. Port screens from `handoff/app/*.jsx` into `beta/apps/BarberShop/front/src/`
3. Add `beta/api/` + `docker/mobile-api` when backend is defined
4. `versiontime update` for each milestone
