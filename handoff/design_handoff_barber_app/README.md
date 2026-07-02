# Handoff: Barber Shop App ("ROYALE" / מספרפי)

A bilingual (Hebrew‑RTL / English‑LTR) mobile booking + shop‑management app for a single‑branch
men's barbershop. Two roles share one codebase: **customer** (book, manage, pay) and **barber/owner**
(calendar, staff, CRM, finances, marketing). The headline feature in this handoff is the
**appointment CART with smart parallel scheduling** for families.

---

## About the design files

The files in `app/` plus `Barber Booking.html` are a **working HTML/React prototype** — a design
reference that shows the intended look, copy, and behavior. **They are not production code to ship
as‑is.** The task is to **re‑implement these designs and behaviors in your target codebase**
(React Native, Flutter, a server‑backed React/Next web app, etc.) using its own patterns, data
layer, and component library. Where this prototype fakes a backend with `localStorage`, you build
a real one.

This is **high‑fidelity**: colors, type, spacing, copy (both languages), and interaction details are
final and should be matched. The *logic* (especially the scheduler) is also final and specified
below — port it faithfully.

---

## Architecture of the prototype

- **Entry point:** `Barber Booking.html`. Loads React 18 + Babel‑standalone in the browser, then
  ~30 `*.jsx` files as `<script type="text/babel">`. Each file attaches its exports to `window`
  (no module system). There is **no build step** — Babel transpiles in the browser.
- **State lives in the root component** in `Barber Booking.html` (lang, role, session, appointments,
  staff, services, customers, products…) and is threaded down as props.
- **Persistence = `localStorage`** under `royale_*` keys (full list below). `app/data.jsx` holds the
  seed data (`DATA`), i18n strings (`STR`), and an inline icon set (`Icon`). On first run the seeds
  populate state; thereafter the stored values win.
- **Bilingual:** every label has `he`/`en`; `dir` flips `rtl`/`ltr`. The `lang` state drives both.
- **Phone shell:** wrapped in `ios-frame.jsx` for the demo. Drop this in your real app.

### File map (what each module is)
| File | Responsibility |
|---|---|
| `data.jsx` | Seed data `DATA`, i18n `STR`, `Icon` set. Source of truth for prototype content. |
| `ui.jsx` | Shared primitives + **`window.availHelpers`** (`slotFree`, `daySched`, shifts, breaks, recurring reservations, time math). **The scheduler's availability oracle.** |
| `booking.jsx` | Single‑appointment booking flow. |
| **`cart.jsx`** | **The appointment cart + the parallel/sequential scheduler (this handoff's focus).** |
| `customer.jsx` | Customer home / profile / notifications. |
| `staff.jsx`, `staffedit.jsx` | Barber app shell; barber edit sheet (hours, breaks, services, **manager %**). |
| `calendar.jsx`, `schedule.jsx`, `exceptions.jsx` | Calendar view; weekly hours editor; day exceptions. |
| `customers.jsx`, `customercard.jsx`, `crm.jsx` | Client list, client card, dormant‑client CRM + waitlist. |
| `servicetypes.jsx`, `packages.jsx`, `punchcard.jsx`, `wallet.jsx` | Price list; punch‑card packages + wallet. |
| `shop.jsx`, `gallery.jsx`, `marketing.jsx`, `automations.jsx` | Retail products, gallery, social posts, automations. |
| `health.jsx`, `documents.jsx`, `approvals.jsx`, `proactive.jsx` | Health declaration, documents, pending‑approval queue, proactive notify. |
| `settings.jsx`, `expenses.jsx`, `shabbat.jsx`, `onboarding.jsx`, `address.jsx`, `screens2.jsx` | Settings, expenses, Shabbat mode, onboarding, address block, misc admin screens. |

---

## ★ Feature: appointment cart + smart parallel scheduling

Lives entirely in **`app/cart.jsx`** (`CartFlow`, `cartSolve`). A family builds a list of treatments
(each its own duration), picks **PARALLEL** (everyone seen at once, each with a *different* barber) or
**SEQUENTIAL** (back‑to‑back, same barber). The solver returns **one** unified proposal to confirm.

### Candidate pool rule
A barber is eligible for a treatment only if they are **on shift that day/time, free in the live
calendar, and offer that treatment**. Availability is read live via `window.availHelpers.slotFree`,
which already accounts for working hours, breaks, recurring reservations, and every existing
appointment (single, sequential, perfect‑parallel) as occupied — **cancelled/rejected are ignored**.
Each family member gets a **distinct** barber; one barber never serves two members at the same instant.

### Two preference axes (the "anchor"), each exact or flexible
- **Day:** a specific day, **or** "as soon as possible" (`הכי קרוב שאפשר`).
- **Hour:** a specific preferred hour, **or** a part of day (morning / midday / evening — hard
  windows in `CART_PARTS`), **or** "whenever" (`מתי שיש`).

### Two‑layer logic
**Layer 1 — perfect parallel** (`solveParallelPerfect`, the original behavior, never broken): if one
shared start time exists where every member gets a distinct free barber, return it flagged
`perfect: true`. If several shared starts work, pick by hour preference (closest to requested hour,
else earliest). Tried first and preferred whenever it exists.

**Layer 2 — staggered fallback** (`solveParallelStaggered`): if no shared start exists, give each
member their own start (still a distinct barber each) under one hard gate:
- **wait = (start of the last appointment) − (finish of the first appointment).**
- Overlap counts as **zero** wait. Anything over **`CART_MAX_WAIT` = 30 min** is rejected — never offered.

**Choosing the best legal packing** (`cartBetter`):
- Preferred hour given → packing whose start is closest to it.
- Part of day given → earliest legal packing inside that window.
- No hour preference → earliest legal packing that day.
- Tie‑break → shorter wait, then denser window (`windowLen`), then earlier.

**Flexible day:** scan forward day by day, within the app's existing booking window, and return the
first day that has a legal packing; apply the hour rules inside that day.

### Hard constraint
Never overwrite existing appointments. The solver only *reads* the live calendar + shifts and places
into free slots. Existing single / sequential / perfect‑parallel bookings stay intact.

### Output & no‑solution
- Exactly **one** result is shown — the best. Never offer a bad packing.
- No legal packing, specific day → **"לא נמצא שיבוץ צמוד לכל המשפחה ביום זה."**
- No legal packing, flexible day → **"לא נמצא שיבוץ צמוד לכל המשפחה בימים הקרובים."**

### Confirmation screen (compute‑only until confirmed)
Show each line: treatment, barber, and personal time. When the result is **not** perfect‑parallel,
show the note **"לא נמצאה שעה זהה לכולם. ההמתנה ביניכם עד X דקות."** where X is the actual wait.
The family confirms, and **only then** are the appointments written. Until confirmation it is
calculation + display only — no slots are reserved. The output shape is identical to what the cart
already consumes (one appointment record per member), so the sequential / single‑appointment /
punch‑card / health‑declaration / prepay steps are untouched.

> **Note for this build:** the cart is treatment‑based, not person‑named — the confirmation lists
> each treatment's barber + time, with no per‑family‑member name field. This was reviewed and is
> intentional for now.

### Key constants (in `cart.jsx`)
- `CART_DAY_MIN = 7*60`, `CART_DAY_MAX = 21*60` — search envelope (minutes). `slotFree` filters within it.
- `CART_MAX_WAIT = 30` — hard cap on family wait.
- `CART_STAGGER_LOOKAHEAD = 120` — how far past the anchor a later start may be probed (then filtered by wait).
- 15‑minute grid throughout.
- `CART_PARTS` — morning `[7:00, 12:00)`, midday `[12:00, 17:00)`, evening `[17:00, 21:00)`.

---

## Other notable behaviors
- **Manager‑share stepper** (`staffedit.jsx`): `deal.managerPct` is the shop's cut; the rest is the
  barber's. Adjusts by **1%** per tap (`adj(±1)`). Owner (Rafi) is special‑cased to 100% / no deal.
- **Roles & session:** `royale_session_v1` holds `{ role, ... }`; barbers can temporarily act as a
  customer ("custMode").
- **Waitlist:** taken slot → join; on cancellation the first in line is notified (`crm.jsx`).
- **Shabbat mode:** `shabbat.jsx` gates booking around Sat 18:30→19:45 when enabled in business settings.
- **Auto‑cancel** a recurring series after 2 consecutive no‑shows.
- **Seeded demos** on first load: one pending request, sample cancellations, a week of cross‑barber
  appointments (`DATA.buildAppointments`).

## Design tokens (from `Barber Booking.html` `:root`)
| Token | Value | Use |
|---|---|---|
| `--navy` | `#0B1E3D` | primary text / brand dark |
| `--navy-700` | `#14305A` | |
| `--gold` | `#C8A24A` | brand accent / CTAs |
| `--gold-light` | `#E4C97B` | gradient top |
| `--gold-deep` | `#9C7B2E` | |
| `--paper` | `#FBF9F5` | neutral off‑white (operational surfaces) |
| `--cream-bg` | `#F6EEDF` | warm paper (customer touchpoints) |
| `--cream-card` | `#FBF5EA` | warm card fill |
| `--cream-line` | `#E7DABE` | hairline on cream |
| barber calendar colors | `#C8A24A #2A6FDB #1F8A5B #8E5BD0 #D9774C #0FA3A3 #C0497B` | one per barber |

**Type:** headings `Suez One` / `Frank Ruhl Libre` (Hebrew display) and `Fraunces` (brand mark);
body `Assistant` (Hebrew/Latin) with `Inter` fallback. RTL is the default direction.

**Icons:** inline set in `data.jsx` (`Icon` component, stroke‑based). No external icon font.

## Assets
`assets/services/s1–s7.png` — demo service artwork (stand‑ins for real photos). `assets/` also holds
other demo imagery. `.image-slots.state.json` records user‑dropped images (prototype only).

---

## localStorage keys (the prototype's fake DB → replace with real backend tables/endpoints)
| Key | Holds |
|---|---|
| `royale_lang_v1` | UI language `he`/`en` |
| `royale_session_v1` | logged‑in session `{ role, prefChannel, … }` |
| `royale_me_v1` | logged‑in customer profile |
| `royale_appts_v4` | **all appointments** (the live calendar the scheduler reads) |
| `royale_staff_v3` | barbers (hours, breaks, services, `deal.managerPct`, color) |
| `royale_services_v2` | price list / service types |
| `royale_products_v1` | retail products |
| `royale_customers_v1` | client records |
| `royale_taglines_v1` | per‑barber taglines |
| `royale_punch_v1` | punch cards |
| `royale_paydecisions_v1` | payout decisions |
| `royale_waitlist_v1` | waitlist entries |
| `royale_recurring_v1` | recurring series |
| `royale_notifybarbers_v1` | per‑barber notify toggles |
| `royale_bizsettings_v1` | business settings (delivery channel, Shabbat mode) |
| `royale_pendingseed_v4`, `royale_cancelseed_v1` | one‑time demo seed flags |

---

## Production TODOs (read before building)
1. **Real build pipeline** — replace browser Babel + `window.*` globals with a bundled app and a
   module system.
2. **Real data layer** — every `royale_*` key becomes a backend table/endpoint. `data.jsx` is seed
   content only, not the source of truth.
3. **Move the scheduler server‑side** — port `solveParallelPerfect` / `solveParallelStaggered` /
   `cartBetter` and `slotFree` to run against the real calendar + shifts on the server.
4. **Concurrency / race safety (critical)** — the prototype intentionally does NOT lock slots until
   confirmation. In production two families can be shown the same slot concurrently, so on confirm you
   must **re‑validate availability and reserve transactionally** (atomic check‑and‑write), not just
   at display time. Show the no‑solution copy if re‑validation fails at confirm.
5. **i18n + RTL** — preserve the he/en pairs and direction flipping in your framework's i18n system.
6. **Auth & roles** — replace the prototype's role toggle with real authentication and authorization.

## Files included in this bundle
- `Barber Booking.html` — entry point + root state.
- `app/` — all component modules listed above.
- `assets/` — demo imagery (service artwork etc.).
- `ios-frame.jsx`, `image-slot.js`, `tweaks-panel.jsx` — prototype shell helpers (not part of the product).
