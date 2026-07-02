# BarberShop — Docker images

Each subfolder is **one deployable image or stack**. Names describe **what it does**.

| Folder | What it is | Status | Port (planned) |
|--------|------------|--------|----------------|
| **[`mobile-api/`](mobile-api/)** | REST API for the Expo app (appointments, staff, shop) | **Planned** — add when `beta/api/` lands | **8090** |
| **[`postgres/`](postgres/)** | PostgreSQL — appointments, customers, inventory | **Planned** | **5433** |
| **[`docs/`](docs/)** | Per-image docs (ports, env, smoke tests) | Stub | — |

## How it will connect (v2.1+)

```
Expo app  ──REST──►  mobile-api (:8090)
                           └──► postgres (:5433)

You (browser) ──► handoff/Barber Booking.html   (design sim — not Docker)
```

**Today (v2.0.0):** mobile-only. Run the app with `prompter` or `scripts/local-dev.sh beta-all`.  
**When API ships:** extend `scripts/local-dev.sh` with `beta-api` / `beta-all` (GateOpen pattern).

See [`docs/README.md`](docs/README.md) and [`../docs/layout.md`](../docs/layout.md).
