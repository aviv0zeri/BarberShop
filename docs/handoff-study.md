# Handoff study — BarberShop v2

Summary of `handoff/README.md` + code review for RN porting. **Source of truth for UX/copy/logic is the handoff, not this doc.**

## Product in one line

Bilingual (he/en, RTL/LTR) barbershop app for **customers** (book, shop, wallet) and **barbers/owner** (calendar, staff, CRM, marketing). Brand: **מספרפי / BARBER SHOP**, Jerusalem (Ussishkin 41).

## Headline feature

**Appointment cart** (`handoff/app/cart.jsx`) — family books multiple treatments:

- **PARALLEL** — different barbers, same time window (or staggered ≤30 min wait)
- **SEQUENTIAL** — one barber, back-to-back
- Solver uses `window.availHelpers` from `ui.jsx` (`slotFree`, shifts, breaks, recurring reservations)

Production must **re-validate slots on confirm** (transactional) — prototype only calculates at display time.

## Port order (recommended)

| Phase | What | Handoff files | RN target |
|-------|------|---------------|-----------|
| **0** | Theme + i18n seed | `data.jsx` STR/DATA tokens | `src/theme/`, `src/i18n/` |
| **1** | Primitives | `ui.jsx` Btn, Toast, Avatar… | `src/components/` |
| **2** | Availability engine | `ui.jsx` availHelpers | `src/lib/scheduling/` (pure TS/JS) |
| **3** | Customer entry | `customer.jsx`, `onboarding.jsx` | `src/screens/customer/` |
| **4** | Single booking | `booking.jsx` | `src/screens/booking/` |
| **5** | Cart + solver ★ | `cart.jsx` | `src/screens/cart/` |
| **6** | Barber shell | `staff.jsx`, `calendar.jsx` | `src/screens/barber/` |
| **7** | Shop / CRM / rest | remaining `app/*.jsx` | as needed |

## Design tokens (match exactly)

| Token | Value |
|-------|-------|
| navy | `#0B1E3D` |
| gold | `#C8A24A` |
| cream-bg | `#F6EEDF` |
| cream-card | `#FBF5EA` |
| paper | `#FBF9F5` |

Fonts in web prototype: Suez One / Assistant / Fraunces — pick RN equivalents (e.g. loaded via `expo-font`).

## Data model (localStorage → API later)

| Key | Entity |
|-----|--------|
| `royale_appts_v4` | Appointments (calendar) |
| `royale_staff_v3` | Barbers + hours + manager % |
| `royale_services_v2` | Price list |
| `royale_customers_v1` | Clients |
| `royale_session_v1` | Auth session / role |

Full list in `handoff/README.md`.

## Roles

- **customer** — book, profile, shop, notifications
- **barber** — calendar, clients, settings (owner Rafi = special case, 100% deal)
- `custMode` — barber temporarily acts as customer

## Business rules to preserve

- Shabbat mode gates booking (Sat ~18:30–19:45)
- Waitlist on taken slots (`crm.jsx`)
- Recurring appointments reserve slots (`slotReserved` in `ui.jsx`)
- Manager % stepper in `staffedit.jsx` (1% steps)
- 15-minute scheduling grid

## Prototype-only (do not ship)

- `Barber Booking.html` + Babel in browser
- `ios-frame.jsx`, `tweaks-panel.jsx`, `localStorage` persistence
- `handoff/screenshots/` — QA reference only

## Simulator / dev

- **Expo Go** for prototype (`npm start` = `--go`)
- Open HTML reference: `open handoff/Barber\ Booking.html` in browser alongside Simulator
- After native modules needed: `npm run start:dev` + `expo run:ios`

## Open questions for you

1. First screen to port after shell — **welcome/onboarding** or **customer home**?
2. API timing — mock with AsyncStorage first, or design `beta/api` now?
3. Hebrew fonts — system default OK for v2.0.1, or load custom fonts early?
