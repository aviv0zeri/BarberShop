# BarberShop backlog (v2)

## Now

- [ ] `npm install` in `beta/apps/BarberShop/front/`
- [x] Port `handoff/app/ui.jsx` primitives + theme tokens
- [ ] Port `handoff/app/data.jsx` → RN i18n + seed data module
- [ ] Navigation shell (customer vs barber role)

## Core product (from handoff)

- [ ] Booking flow (`handoff/app/booking.jsx`)
- [ ] Appointment cart + parallel scheduler (`handoff/app/cart.jsx`) ★
- [ ] Customer home (`handoff/app/customer.jsx`)
- [ ] Calendar + schedule (`handoff/app/calendar.jsx`, `schedule.jsx`)
- [ ] Staff management (`handoff/app/staff.jsx`)

## Backend (later)

- [ ] `beta/api/gateway` + mobile-api
- [ ] Replace localStorage patterns with real API



## Tooling

- [ ] Extend `scripts/local-dev.sh` when API stack lands
- [ ] `versiontime update` after first shippable milestone