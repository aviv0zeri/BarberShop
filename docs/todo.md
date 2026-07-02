# BarberShop backlog (v2)

## Done @ 2.0.0

- [x] GateOpen-style scaffold (versiontime, sandboxer, prompter, mobilize)
- [x] Handoff imported → `handoff/` (read-only)
- [x] Expo shell with theme tokens + i18n seed
- [x] Customer tab navigation (Home · Shop · Appointments · Profile)
- [x] Docker layout documented (stacks planned for v2.1+)

## Now (2.0.1)

- [ ] Port `handoff/app/ui.jsx` primitives (Btn, Toast, Avatar…)
- [ ] Wire **Book** CTA → booking flow stub
- [ ] Home screen — full port from `handoff/app/customer.jsx`

## Core product (from handoff)

- [ ] Booking flow (`handoff/app/booking.jsx`)
- [ ] Appointment cart + parallel scheduler (`handoff/app/cart.jsx`) ★
- [ ] Appointments tab (cancel → undo, reschedule)
- [ ] Shop tab + products from `data.jsx`
- [ ] Barber role shell (`handoff/app/staff.jsx`, `calendar.jsx`)

## Backend (v2.1+)

- [ ] `beta/api/mobile-api` + `docker/mobile-api`
- [ ] Replace localStorage patterns with real API
- [ ] `scripts/local-dev.sh beta-api` / `beta-all`

## Tooling

- [x] Prompter menu + `--ext` Terminal handoff
- [ ] `versiontime update` after first shippable milestone
