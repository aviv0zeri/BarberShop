# BarberShop tester sandbox

Side-by-side **compare apps** flow for QA and porting work:

| Window | What |
|--------|------|
| **Left** | Client handoff — `handoff/Barber Booking.html` (interactive JSX prototype) |
| **Right** | iOS Simulator — Expo app from `beta/apps/BarberShopCustomer/front` |

## Run

```bash
./testersendbox/launch-compare.sh
# or
scripts/local-dev.sh beta-compare
# or
./prompter → Compare apps — handoff + Simulator
```

Handoff is served by **Docker** (`docker/handoff-preview/compose.yml`, port **5108**) or Python fallback if Docker is unavailable.

Runtime logs/PIDs: `.engine/barbershop-dev/`
