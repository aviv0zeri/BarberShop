# BarberShop — Docker images

Each subfolder is **one deployable image or stack**. Names describe **what it does**.

| Folder | What it is | Status | Port (planned) |
|--------|------------|--------|----------------|
| **[`mobile-api/`](mobile-api/)** | REST API for the Expo app (appointments, staff, shop) | **Planned** — add when `beta/api/` lands | **8090** |
| **[`postgres/`](postgres/)** | PostgreSQL — appointments, customers, inventory | **Planned** | **5433** |
| **[`handoff-preview/`](handoff-preview/)** | Static nginx serving `handoff/` for compare-apps tester | **Active** | **5108** |

## How it will connect (v2.1+)

```
Expo app  ──REST──►  mobile-api (:8090)
                           └──► postgres (:5433)

You (browser) ──► handoff-preview (:5108) ──► handoff/Barber Booking.html
Compare flow:   testersendbox/launch-compare.sh  (left handoff + right Simulator)
```

**Today (v2.0.0):** mobile-only. Run the app with `prompter` or `scripts/local-dev.sh beta-all`.  
**When API ships:** extend `scripts/local-dev.sh` with `beta-api` / `beta-all` (GateOpen pattern).

See [`docs/README.md`](docs/README.md) and [`../docs/layout.md`](../docs/layout.md).
