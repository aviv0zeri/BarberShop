# Docker docs — BarberShop

## v2.0.0 (now)

No backend containers yet. Product work is **Expo-only** under `beta/apps/BarberShop/front/`.

- **Design simulation:** open `handoff/Barber Booking.html` in a browser (read-only reference).
- **Dev stack:** `./prompter` → Metro + Simulator, or `scripts/local-dev.sh beta-all`.

## v2.1+ (planned)

1. Add `beta/api/mobile-api/` (FastAPI or similar).
2. Add `docker/mobile-api/compose.yml` pointing at `../../beta/api/...` (same pattern as GateOpen).
3. Wire `BETA_API_BASE_URL` in the Expo app.
4. Extend `scripts/local-dev.sh` with `beta-api`, `beta-stop`, `beta-all`.

Copy the GateOpen `docker/mobile-api/` layout when the first API endpoint is defined (e.g. `GET /health`, appointments CRUD).
