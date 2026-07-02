// punchcard.jsx, Round 10: punch card ("10 cuts for 9") + prepay-required clients.
// ── One shared store, several surfaces: ──
//   punchStore    , card per client (bound to ONE barber), prepay flags, open pay-decisions.
//   Punching is DERIVED from the shared calendar (Round 7 statuses): an appointment paid
//   by card counts as punched once it's effectively done (15 min after start, or marked
//   done); marking "no-show" later un-derives it, the balance returns by itself.
//   PunchPromoBanner  , gold promo / live balance on the client home.
//   PunchPurchaseSheet, pick a barber → mock Bit/Paybox payment → card active (10).
//   PayMockSheet      , reusable prepayment simulator (also used at end of booking).
//   RejectPaidSheet   , barber MUST choose refund / new time when declining a prepaid request.
//   PayDecisionList   , open decisions on the barber's desk (client cancelled a prepaid visit).
//   AdminPunchScreen  , Rafi: active cards, balances, card revenue + open decisions.
// Exports: punchStore, PunchPromoBanner, PunchPurchaseSheet, PayMockSheet, RejectPaidSheet,
//          PayDecisionList, PunchProfileSheet, AdminPunchScreen, PaidChip
const { useState: usePC, useEffect: usePCEffect } = React;

// ── promo settings: Rafi edits price + punch count, toggles the promo on/off, and
//    (Round 14) limits the purchase window, by date range, by quantity, or unlimited.
//    Limits gate NEW PURCHASES ONLY, a sold card is valid forever, promo or not.
const PUNCH_DEFAULTS = { price: 90, total: 10, promoOn: true, limitMode: 'none', dateFrom: '', dateTo: '', qtyMax: 50, sold: 2 };
// ── Demo seed: set to true to give 'me' two pre-loaded wallet cards on first visit.
//    false = new customer starts with an empty wallet + the gold buy-promo banner.
const DEMO_WALLET_SEED = false;
function punchPrice() { const c = punchStore.settings(); return c.price * (c.total - 1); }      // pay for 9
function punchFullPrice() { const c = punchStore.settings(); return c.price * c.total; }        // worth 10

// the ONLY services bookable through the card, both 15 minutes.
// Live in DATA.services (appended by the app shell) so id-lookups work everywhere,
// but flagged punchOnly so they never appear in the regular flow / admin price list.
const PUNCH_SERVICES = [
  { id: 'ps1', he: 'תספורת גבר', en: "Men's haircut", min: 15, punchOnly: true, photoHe: 'תספורת גבר · קלאסי', photoEn: "men's cut, classic", get price() { return punchStore.settings().price; } },
  { id: 'ps2', he: 'תספורת גבר + זקן', en: "Men's haircut + beard", min: 15, punchOnly: true, photoHe: 'תספורת וזקן · מהיר', photoEn: 'cut + beard, quick', get price() { return punchStore.settings().price; } },
];

const punchStore = {
  _load(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
  _save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  // ── cards, keyed by client ('me' or directory id). Seeded so the admin view lives. ──
  cards() {
    let c = this._load('royale_punch_v1', null);
    if (!c) {
      c = {
        c3: { barberId: 'p1', total: 10, usedSeed: 6, price: punchPrice(), purchasedAt: Date.now() - 40 * 86400000 },
        c5: { barberId: 'p2', total: 10, usedSeed: 2, price: punchPrice(), purchasedAt: Date.now() - 12 * 86400000 },
      };
      this._save('royale_punch_v1', c);
    }
    return c;
  },
  // ── Round E2: legacy single-card readers (manager card, staff chip, profile) now
  //    resolve against the WALLET - they get the owner's "best" usable card. ──
  _bestCard(owner, appts) {
    const today = this._today();
    const cards = this.walletFor(owner).filter(c => !c.expiry || c.expiry >= today);
    if (!cards.length) return null;
    if (appts) { let best = null, bb = -1; cards.forEach(c => { const b = this.balanceForCard(c, appts); if (b > bb) { bb = b; best = c; } }); return best; }
    return cards[cards.length - 1];
  },
  cardFor(key) { return this._bestCard(key, null); },
  // a purchase mints a card into the wallet; kept for any legacy caller.
  buy(key, barberId) { const st = this.settings(); this.setSettings({ sold: (st.sold || 0) + 1 }); return this.buyFromPackage(key, { id: 'pkg_legacy', he: 'כרטיסיית מבוגר', en: 'Adult card', services: ['s1', 's2'], punches: st.total, price: punchPrice(), scope: 'barber', barberId }, barberId); },
  // ── promo settings (Rafi, admin punch screen) ──
  settings() { const s = this._load('royale_punchcfg_v1', null) || {}; return { ...PUNCH_DEFAULTS, ...s }; },
  setSettings(patch) { this._save('royale_punchcfg_v1', { ...this.settings(), ...patch }); },
  _today() { const p = n => String(n).padStart(2, '0'); const d = new Date(); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; },
  // why the purchase window is closed: null = open · 'manual' · 'dates' · 'qty'.
  // Auto-closing (date passed / quantity sold out) behaves exactly like the manual switch.
  promoClosedReason() {
    const s = this.settings();
    if (!s.promoOn) return 'manual';
    if (s.limitMode === 'dates') { const t = this._today(); if ((s.dateFrom && t < s.dateFrom) || (s.dateTo && t > s.dateTo)) return 'dates'; }
    if (s.limitMode === 'qty' && (s.sold || 0) >= (s.qtyMax || 0)) return 'qty';
    return null;
  },
  promoOn() { return !this.promoClosedReason(); },
  // derived punches: card-paid appointments that are effectively done (Round 7 semantics)
  _effDone(a) {
    if (a.status === 'done') return true;
    if (a.status === 'no' || a.status === 'rejected' || a.status === 'cancelled' || a.status === 'pending') return false;
    const pad = n => String(n).padStart(2, '0'); const now = new Date();
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    if (a.date < today) return true;
    if (a.date > today) return false;
    const [h, m] = (a.start || '0:0').split(':').map(Number);
    return (now.getHours() * 60 + now.getMinutes()) >= (h * 60 + m + 15);
  },
  usedFor(key, appts) { const c = this._bestCard(key, appts); return c ? this.usedForCard(c, appts) : 0; },
  balanceFor(key, appts) { const c = this._bestCard(key, appts); return c ? this.balanceForCard(c, appts) : 0; },
  plannedFor(key, appts) { const c = this._bestCard(key, appts); return c ? this.plannedForCard(c, appts) : 0; },
  // ── per-card derivation (the wallet's source of truth) ──
  // A punch is SPENT when its appointment is effectively done, OR was a no-show, OR was
  // cancelled inside the 1-hour window (a.punchBurned, set at cancel-time, E2 §5).
  usedForCard(card, appts) {
    if (!card) return 0;
    const derived = (appts || []).filter(a => a.punchCardId === card.id && (this._effDone(a) || a.status === 'no' || a.punchBurned)).length;
    return Math.min(card.total, (card.usedSeed || 0) + derived);
  },
  balanceForCard(card, appts) { if (!card) return 0; return Math.max(0, card.total - this.usedForCard(card, appts)); },
  plannedForCard(card, appts) { return (appts || []).filter(a => a.punchCardId === card.id && a.status !== 'no' && !a.punchBurned && a.status !== 'rejected' && a.status !== 'cancelled' && !this._effDone(a)).length; },
  // ── prepay-required flags (Rafi sets per client, in the client card) ──
  prepayFlags() { return this._load('royale_prepayflags_v1', {}); },
  prepayRequired(key) { return !!this.prepayFlags()[key]; },
  setPrepay(key, v) { const f = this.prepayFlags(); if (v) f[key] = true; else delete f[key]; this._save('royale_prepayflags_v1', f); },
  // ── open decisions: a prepaid visit was cancelled/declined → barber must refund or rebook ──
  decisions() { return this._load('royale_paydecisions_v1', []); },
  openDecision(appt, kind) {
    const d = this.decisions();
    if (d.some(x => x.apptId === appt.id && x.status === 'open')) return;
    const svc = DATA.services.find(s => s.id === appt.svc);
    d.unshift({ id: 'pd' + Date.now(), apptId: appt.id, barberId: appt.barberId, kind, clientHe: appt.clientHe, clientEn: appt.clientEn, clientId: appt.clientId, date: appt.date, start: appt.start, svc: appt.svc, amount: svc ? svc.price : 0, status: 'open', at: Date.now() });
    this._save('royale_paydecisions_v1', d);
  },
  closeByAppt(apptId) { this._save('royale_paydecisions_v1', this.decisions().filter(x => !(x.apptId === apptId && x.status === 'open'))); },
  resolve(id, how) { this._save('royale_paydecisions_v1', this.decisions().map(x => x.id === id ? { ...x, status: how, resolvedAt: Date.now() } : x)); },
  openFor(barberId) { return this.decisions().filter(x => x.status === 'open' && (!barberId || x.barberId === barberId)); },
  // Round 10 fix #3: an absent-barber period was set (vacation / closed week). For every
  // PREPAID booking that now clashes, open a manual-refund decision so Rafi is alerted and
  // never forgets - the refund itself is handled by hand (Bit / PayBox) in development.
  openRefundsForAbsence(conflicts) {
    let n = 0;
    (conflicts || []).forEach(a => { if (a && a.paid === 'prepaid') { this.openDecision(a, 'absent'); n++; } });
    return n;
  },
  // ════════════════════════════════════════════════════════════════════
  // Round E1 · PUNCH PACKAGES (Rafi's flexible builder, manager side only).
  // The legacy single "locked" promo migrates into package #1 so nothing is
  // lost and it becomes editable. Purchased cards (royale_punch_v1) and the
  // whole customer experience stay untouched - E2 wires packages → client.
  // ════════════════════════════════════════════════════════════════════
  packages() {
    let arr = this._load('royale_punchpkgs_v1', null);
    if (!arr) {
      // migration: the existing locked promo (₪810 / 10 punches / adult + beard)
      // becomes the first, fully-editable package. Numbers come from live settings.
      const s = this.settings();
      const p = n => String(n).padStart(2, '0');
      arr = [{
        id: 'pkg_legacy', migrated: true,
        he: 'כרטיסיית מבוגר', en: 'Adult card',
        services: ['s1', 's2'],          // men's cut + cut & beard, the original two
        punches: s.total || 10,
        price: punchPrice(),             // ₪810 = 90 × 9
        scope: 'all', barberId: null,    // today any barber is selectable at purchase
        expiry: '', active: true,
        createdAt: Date.now(),
      }, {
        // Round E2 demo: a second, barber-bound, TIME-LIMITED package so the wallet,
        // covered-treatment punching and the live countdown all have something to show.
        id: 'pkg_beard', he: 'חבילת הזקן', en: 'Beard club',
        services: ['s2', 's3'],          // cut & beard + cut & wax
        punches: 6, price: 540,
        scope: 'barber', barberId: 'p1',
        expiry: '', active: true,
        createdAt: Date.now(),
      }, {
        // kids + premium - give the "by package type" breakdown real categories
        id: 'pkg_kids', he: 'כרטיסיית ילדים', en: 'Kids card',
        services: ['s4'], punches: 8, price: 520,
        scope: 'all', barberId: null, expiry: '', active: true, createdAt: Date.now(),
      }, {
        id: 'pkg_premium', he: 'חבילת פרימיום', en: 'Premium club',
        services: ['s1', 's2', 's3'], punches: 10, price: 1200,
        scope: 'barber', barberId: 'rafi', expiry: '', active: true, createdAt: Date.now(),
      }];
      this._save('royale_punchpkgs_v1', arr);
    }
    // backfill the E2 demo package if an older saved list predates it
    if (arr && !arr.some(p => p.id === 'pkg_beard')) {
      arr.push({ id: 'pkg_beard', he: 'חבילת הזקן', en: 'Beard club', services: ['s2', 's3'], punches: 6, price: 540, scope: 'barber', barberId: 'p1', expiry: '', active: true, createdAt: Date.now() });
      this._save('royale_punchpkgs_v1', arr);
    }
    // backfill demo expiry on pkg_beard so the "promo ending" nudge always demonstrates
    const _beard = arr.find(p => p.id === 'pkg_beard');
    if (_beard && !_beard.expiry) {
      const _exp = new Date(); _exp.setDate(_exp.getDate() + 6);
      _beard.expiry = `${_exp.getFullYear()}-${String(_exp.getMonth()+1).padStart(2,'0')}-${String(_exp.getDate()).padStart(2,'0')}`;
      this._save('royale_punchpkgs_v1', arr);
    }
    // backfill the G3 demo categories (kids / premium)
    if (arr && !arr.some(p => p.id === 'pkg_kids')) {
      arr.push({ id: 'pkg_kids', he: 'כרטיסיית ילדים', en: 'Kids card', services: ['s4'], punches: 8, price: 520, scope: 'all', barberId: null, expiry: '', active: true, createdAt: Date.now() });
      arr.push({ id: 'pkg_premium', he: 'חבילת פרימיום', en: 'Premium club', services: ['s1', 's2', 's3'], punches: 10, price: 1200, scope: 'barber', barberId: 'rafi', expiry: '', active: true, createdAt: Date.now() });
      this._save('royale_punchpkgs_v1', arr);
    }
    return arr;
  },
  // status: 'active' (sellable) | 'ended' (expired or switched off - no new purchases,
  // already-bought cards keep working until used up).
  packageStatus(pkg) {
    if (!pkg) return 'ended';
    if (pkg.active === false) return 'ended';
    if (pkg.expiry && pkg.expiry < this._today()) return 'ended';
    return 'active';
  },
  savePackage(pkg) {
    const arr = this.packages();
    const i = arr.findIndex(p => p.id === pkg.id);
    if (i >= 0) arr[i] = { ...arr[i], ...pkg };
    else arr.push({ scope: 'barber', active: true, createdAt: Date.now(), ...pkg, id: pkg.id || ('pkg' + Date.now()) });
    this._save('royale_punchpkgs_v1', arr);
    return arr;
  },
  deletePackage(id) {
    this._save('royale_punchpkgs_v1', this.packages().filter(p => p.id !== id));
  },
  // ════════════════════════════════════════════════════════════════════
  // Round E2 · CLIENT WALLET - a client may hold SEVERAL punch cards at once.
  // Each purchase of a package (E1) mints one card here; punches are derived
  // from calendar appts carrying the card's id (a.punchCardId).
  // ════════════════════════════════════════════════════════════════════
  wallet() {
    let arr = this._load('royale_wallet_v2', null);
    if (!arr) {
      arr = [];
      // migrate legacy single cards (royale_punch_v1: c3, c5 …) into the wallet
      const legacy = this._load('royale_punch_v1', {}) || {};
      Object.keys(legacy).forEach(owner => {
        const c = legacy[owner];
        arr.push({ id: 'w_' + owner, owner, pkgId: 'pkg_legacy', he: 'כרטיסיית מבוגר', en: 'Adult card', services: ['s1', 's2'], total: c.total || 10, usedSeed: c.usedSeed || 0, scope: 'barber', barberId: c.barberId || null, expiry: '', label: '', price: c.price || punchPrice(), purchasedAt: c.purchasedAt || Date.now() });
      });
      // Demo cards - only when DEMO_WALLET_SEED is on (default: off).
      if (DEMO_WALLET_SEED) {
        const adult = pkgs.find(p => p.id === 'pkg_legacy') || pkgs[0];
        if (adult) arr.push({ id: 'w_me_adult', owner: 'me', pkgId: adult.id, he: adult.he, en: adult.en, services: [...(adult.services || ['s1', 's2'])], total: adult.punches || 10, usedSeed: 3, scope: 'all', barberId: null, expiry: '', label: '', price: adult.price, purchasedAt: Date.now() - 20 * 86400000 });
        const beard = pkgs.find(p => p.id === 'pkg_beard') || { id: 'pkg_beard', he: 'חבילת הזקן', en: 'Beard club', services: ['s2', 's3'], punches: 6, price: 540, barberId: 'p1' };
        {
          const dt = new Date(); dt.setDate(dt.getDate() + 5); const p = n => String(n).padStart(2, '0');
          arr.push({ id: 'w_me_beard', owner: 'me', pkgId: beard.id, he: beard.he, en: beard.en, services: [...(beard.services || ['s2', 's3'])], total: beard.punches || 6, usedSeed: 1, scope: 'barber', barberId: beard.barberId || 'p1', expiry: '', label: 'יותם', price: beard.price, purchasedAt: Date.now() - 3 * 86400000 });
        }
      }
      this._save('royale_wallet_v2', arr);
    }
    // Round G3 · one-time seed of a realistic spread of SOLD cards so the manager's
    // punch-card insights have data. Runs once on an empty wallet (flag-guarded), and
    // never clobbers real cards. Each card is bound to the barber it belongs to, which
    // drives the by-barber split AND the G1 revenue split.
    if (!arr.length && !this._load('royale_g3seed_v1', null)) {
      const D = 86400000;
      const NM = { pkg_premium: ['חבילת פרימיום', 'Premium club'], pkg_beard: ['חבילת הזקן', 'Beard club'], pkg_kids: ['כרטיסיית ילדים', 'Kids card'], pkg_legacy: ['כרטיסיית מבוגר', 'Adult card'] };
      const SV = { pkg_premium: ['s1', 's2', 's3'], pkg_beard: ['s2', 's3'], pkg_kids: ['s4'], pkg_legacy: ['s1', 's2'] };
      // [id, owner, pkgId, barberId, total, price, usedSeed, daysAgo]
      [['g3_1', 'c1', 'pkg_premium', 'rafi', 10, 1200, 3, 2],
       ['g3_2', 'c2', 'pkg_beard', 'p1', 6, 540, 1, 4],
       ['g3_3', 'c3', 'pkg_legacy', null, 10, 810, 2, 5],
       ['g3_4', 'c4', 'pkg_kids', null, 8, 520, 4, 6],
       ['g3_10', 'c5', 'pkg_beard', 'p1', 6, 540, 2, 9],
       ['g3_5', 'c6', 'pkg_premium', 'rafi', 10, 1200, 6, 12],
       ['g3_6', 'c7', 'pkg_beard', 'p1', 6, 540, 5, 15],
       ['g3_7', 'c8', 'pkg_legacy', 'p2', 10, 810, 7, 18],
       ['g3_8', 'c2', 'pkg_kids', 'p2', 8, 520, 3, 22],
       ['g3_9', 'c1', 'pkg_premium', 'rafi', 10, 1200, 8, 25],
       ['g3_11', 'c4', 'pkg_legacy', null, 10, 810, 1, 28],
      ].forEach(([id, owner, pkgId, barberId, total, price, usedSeed, daysAgo]) => {
        arr.push({ id, owner, pkgId, he: NM[pkgId][0], en: NM[pkgId][1], services: [...SV[pkgId]], total, usedSeed, scope: (barberId && (pkgId === 'pkg_premium' || pkgId === 'pkg_beard')) ? 'barber' : 'all', barberId, expiry: '', label: '', price, purchasedAt: Date.now() - daysAgo * D });
      });
      this._save('royale_g3seed_v1', 1);
      this._saveWallet(arr);
    }
    return arr;
  },
  _saveWallet(arr) { this._save('royale_wallet_v2', arr); },
  walletFor(owner) { return this.wallet().filter(c => c.owner === owner).sort((a, b) => (a.purchasedAt || 0) - (b.purchasedAt || 0)); },
  cardById(id) { return this.wallet().find(c => c.id === id) || null; },
  // A purchased card stays valid until its punches run out - it never expires by date.
  // (Expiry is a PROMO window that gates new purchases only, handled at the package level.)
  cardExpired(card) { return false; },
  // cards an owner may spend on a given service (+ optional barber). Usable = not expired,
  // balance left, covers the service, and (barber-bound) matches the barber.
  cardsForService(owner, svcId, barberId, appts) {
    return this.walletFor(owner).filter(c =>
      (c.services || []).includes(svcId) && !this.cardExpired(c) && this.balanceForCard(c, appts) > 0 &&
      (c.scope === 'all' || !barberId || c.barberId === barberId));
  },
  // any usable card (balance + not expired), regardless of service
  usableCards(owner, appts) { return this.walletFor(owner).filter(c => !this.cardExpired(c) && this.balanceForCard(c, appts) > 0); },
  buyFromPackage(owner, pkg, barberId) {
    const arr = this.wallet();
    const card = { id: 'w' + Date.now(), owner, pkgId: pkg.id, he: pkg.he, en: pkg.en, services: [...(pkg.services || [])], total: pkg.punches || 10, usedSeed: 0, scope: pkg.scope || 'all', barberId: pkg.scope === 'barber' ? (pkg.barberId || barberId) : null, expiry: '', label: '', price: pkg.price || 0, purchasedAt: Date.now() };
    arr.push(card); this._saveWallet(arr);
    return card;
  },
  setCardLabel(id, label) { const arr = this.wallet(); const c = arr.find(x => x.id === id); if (c) { c.label = label; this._saveWallet(arr); } },
  // live countdown info for a time-limited card (E2 §7). null = no expiry.
  expiryInfo(card) {
    if (!card || !card.expiry) return null;
    const end = new Date(card.expiry + 'T23:59:59').getTime();
    const ms = end - Date.now();
    const day = 86400000;
    return { ms, ended: ms <= 0, days: Math.floor(ms / day), hours: Math.floor((ms % day) / 3600000), mins: Math.floor((ms % 3600000) / 60000), soon: ms > 0 && ms <= 7 * day };
  },
};
window.punchStore = punchStore;

// ── Round 10 demo seed ────────────────────────────────────────────────────
// Pre-flag the demo customer ('me' = Daniel Avni, phone 0503333333) as
// "prepay required" so the payment-at-booking flow is immediately visible
// without needing to go through Admin → Customers → toggle first.
// One-time: if the admin later clears the flag, the seed never re-fires.
(function () {
  try {
    if (!punchStore._load('royale_prepayseed10_v1', null)) {
      punchStore.setPrepay('me', true);
      punchStore._save('royale_prepayseed10_v1', 1);
    }
  } catch (e) {}
})();

// ── tiny shared atoms ───────────────────────────────────────────────────
function PunchDots({ used, total, size = 13, gap = 5, light }) {
  return (
    <span style={{ display: 'flex', flexWrap: 'wrap', gap }}>
      {Array.from({ length: total }).map((_, k) => {
        const filled = k < used;
        return <span key={k} style={{ width: size, height: size, borderRadius: '50%', boxSizing: 'border-box', background: filled ? (light ? '#E4C97B' : 'linear-gradient(135deg,#E4C97B,#C8A24A)') : 'transparent', border: filled ? 'none' : `1.5px ${light ? 'solid rgba(251,249,245,0.35)' : 'solid rgba(11,30,61,0.22)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{filled && <Icon name="scissors" size={size * 0.62} color="#0B1E3D" stroke={2.6} />}</span>;
      })}
    </span>
  );
}

// chip used across barber/admin/customer rows to mark how a visit is paid
function PaidChip({ paid, lang, left }) {
  if (!paid) return null;
  const he = lang === 'he';
  if (paid === 'punch') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 800, color: '#7A5F1E', background: 'linear-gradient(135deg,rgba(228,201,123,0.4),rgba(200,162,74,0.3))', padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}><Icon name="card" size={12} color="#7A5F1E" />{he ? 'כרטיסייה' : 'Punch card'}{left != null ? ` · ${he ? 'יתרה' : 'left'} ${left}` : ''}</span>;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 800, color: '#0B6B34', background: 'rgba(46,125,82,0.13)', padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}><Icon name="check" size={12} color="#0B6B34" stroke={2.6} />{he ? 'שולם מראש!' : 'Prepaid!'}</span>;
}

// ── reusable mock payment (Bit / Paybox), the real rails come at dev time ──
function PayMockSheet({ lang, accent, serif, title, sub, amount, onClose, onPaid, zIndex = 99 }) {
  const he = lang === 'he';
  const [paying, setPaying] = usePC(null); // provider id while "processing"
  const [done, setDone] = usePC(false);
  const pay = (prov) => { if (paying || done) return; setPaying(prov); setTimeout(() => { setDone(true); setTimeout(() => onPaid && onPaid(prov), 800); }, 1300); };
  const provs = [
    { id: 'bit', label: he ? 'ביט' : 'Bit', sub: he ? 'תשלום מהיר מהנייד' : 'Quick mobile pay', color: '#00B8A9' },
    { id: 'paybox', label: he ? 'פייבוקס' : 'PayBox', sub: he ? 'תשלום מאובטח' : 'Secure payment', color: '#2A6FDB' },
  ];
  return (
    <div onClick={paying || done ? undefined : onClose} style={{ position: 'absolute', inset: 0, zIndex, background: 'rgba(7,16,31,0.6)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)', padding: '10px 20px calc(24px + env(safe-area-inset-bottom))' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 16px' }} />
        {done ? (
          <div style={{ textAlign: 'center', padding: '14px 0 10px' }}>
            <div className="succ-pop" style={{ width: 66, height: 66, borderRadius: '50%', background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 12px 30px rgba(200,162,74,0.4)' }}><Icon name="check" size={34} color="#0B1E3D" stroke={2.6} /></div>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 21, color: '#0B1E3D' }}>{he ? 'התשלום בוצע ✓' : 'Payment complete ✓'}</div>
            <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.55)', marginTop: 5 }}>{he ? 'קבלה נשלחה אליך' : 'A receipt is on its way'}</div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 21, color: '#0B1E3D' }}>{title || (he ? 'תשלום' : 'Payment')}</div>
            {sub && <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.55)', marginTop: 4, lineHeight: 1.5 }}>{sub}</div>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg,#14305A,#0B1E3D)', borderRadius: 16, padding: '14px 16px', margin: '14px 0 16px' }}>
              <span style={{ fontSize: 13.5, color: 'rgba(251,249,245,0.7)', fontWeight: 600 }}>{he ? 'סכום לתשלום' : 'Amount due'}</span>
              <span style={{ fontFamily: 'Assistant, sans-serif', fontWeight: 800, fontSize: 22, color: '#E4C97B', direction: 'ltr' }}>₪{amount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {provs.map(p => {
                const busy = paying === p.id;
                return (
                  <button key={p.id} onClick={() => pay(p.id)} disabled={!!paying} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '14px 16px', borderRadius: 16, border: `1.5px solid ${busy ? p.color : 'rgba(11,30,61,0.1)'}`, cursor: paying ? 'wait' : 'pointer', font: 'inherit', background: busy ? p.color + '0E' : '#fff', opacity: paying && !busy ? 0.5 : 1 }}>
                    <span style={{ width: 40, height: 40, borderRadius: 12, background: p.color + '1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {busy ? <span className="pc-spin" style={{ width: 19, height: 19, borderRadius: '50%', border: `2.5px solid ${p.color}33`, borderTopColor: p.color }} /> : <Icon name="coin" size={20} color={p.color} />}
                    </span>
                    <span style={{ flex: 1, textAlign: 'start' }}>
                      <span style={{ display: 'block', fontSize: 15.5, fontWeight: 800, color: '#0B1E3D' }}>{p.label}</span>
                      <span style={{ display: 'block', fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{busy ? (he ? 'מעבד תשלום…' : 'Processing…') : p.sub}</span>
                    </span>
                    <Icon name={he ? 'chevron' : 'chevronR'} size={17} color="rgba(11,30,61,0.3)" />
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.42)', textAlign: 'center', marginTop: 13 }}>{he ? 'דמו, חיבור אמיתי לביט/פייבוקס בשלב הפיתוח' : 'Demo, live Bit/PayBox wiring comes in development'}</div>
          </>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// PART 1+5 · Home banner: gold promo (no card) / live balance (card active)
// ════════════════════════════════════════════════════════════════════════
function PunchPromoBanner({ lang, accent, serif, appts, staff, onBuy, onUseCard, onOpenWallet }) {
  const he = lang === 'he';
  const list = staff || DATA.barbers;
  // Round E2: wallet-aware. One card → balance banner; several → wallet summary.
  const cards = punchStore.walletFor('me');
  const usable = punchStore.usableCards('me', appts);
  if (cards.length) {
    const totalLeft = usable.reduce((n, c) => n + punchStore.balanceForCard(c, appts), 0);
    const multi = cards.length > 1;
    const primary = usable[usable.length - 1] || cards[cards.length - 1];
    const used = punchStore.usedForCard(primary, appts);
    return (
      <div style={{ position: 'relative', background: 'linear-gradient(140deg,#14305A,#0B1E3D)', borderRadius: 22, padding: '16px 17px', overflow: 'hidden', boxShadow: '0 12px 30px rgba(11,30,61,0.25)', border: '1px solid rgba(228,201,123,0.35)' }}>
        <Emblem size={150} style={{ position: 'absolute', top: -30, insetInlineEnd: -38, opacity: 0.1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="card" size={20} color="#0B1E3D" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 16.5, color: '#FBF9F5', lineHeight: 1.1 }}>{multi ? (he ? 'הכרטיסיות שלי' : 'My punch cards') : (he ? 'הכרטיסייה שלי' : 'My punch card')}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(228,201,123,0.85)', marginTop: 2, fontWeight: 600 }} dir="auto">{multi ? (he ? `${cards.length} כרטיסיות בארנק` : `${cards.length} cards in your wallet`) : (primary.label ? primary.label + ' · ' : '') + cardScopeLabel(primary, lang, staff)}</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(228,201,123,0.14)', borderRadius: 13, padding: '7px 13px' }}>
            <div style={{ fontFamily: serif, fontWeight: 800, fontSize: 20, color: '#E4C97B', lineHeight: 1, direction: 'ltr' }}>{totalLeft}</div>
            <div style={{ fontSize: 9.5, color: 'rgba(251,249,245,0.65)', fontWeight: 700, marginTop: 2 }}>{he ? 'נשארו' : 'left'}</div>
          </div>
        </div>
        {multi ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {cards.map(c => (
              <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#E4C97B', background: 'rgba(228,201,123,0.12)', padding: '5px 10px', borderRadius: 20 }} dir="auto">{c.label || (he ? c.he : c.en)} · <span style={{ direction: 'ltr', color: '#FBF9F5' }}>{punchStore.balanceForCard(c, appts)}</span></span>
            ))}
          </div>
        ) : <PunchDots used={used} total={primary.total} light />}
        <div style={{ display: 'flex', gap: 8, marginTop: 13 }}>
          {totalLeft > 0 && (
            <button onClick={onUseCard} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 13, border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 13.5, fontWeight: 800, background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', color: '#0B1E3D', boxShadow: '0 8px 20px rgba(200,162,74,0.3)' }}><Icon name="scissors" size={16} color="#0B1E3D" />{he ? 'קביעת תור עם הכרטיסייה' : 'Book with a card'}</button>
          )}
          <button onClick={onOpenWallet} style={{ flex: totalLeft > 0 ? '0 0 auto' : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px 15px', borderRadius: 13, border: '1px solid rgba(228,201,123,0.45)', cursor: 'pointer', font: 'inherit', fontSize: 13.5, fontWeight: 700, background: 'rgba(228,201,123,0.12)', color: '#E4C97B' }}><Icon name="card" size={16} color="#E4C97B" />{he ? 'הארנק' : 'Wallet'}</button>
        </div>
        {totalLeft <= 0 && punchStore.promoOn() && (
          <button onClick={onBuy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 8, padding: '11px', borderRadius: 13, border: '1px solid rgba(228,201,123,0.45)', cursor: 'pointer', font: 'inherit', fontSize: 13, fontWeight: 800, background: 'transparent', color: '#E4C97B' }}><Icon name="refresh" size={16} color="#E4C97B" />{he ? 'הכרטיסיות נוצלו, לרכישה נוספת' : 'All used up, buy another'}</button>
        )}
      </div>
    );
  }
  const cfg = punchStore.settings();
  // effective state: manual switch AND auto-limits (date window / quantity), Round 14
  const promoOn = punchStore.promoOn();
  const promoInner = (
    <>
      <Emblem size={160} style={{ position: 'absolute', top: -34, insetInlineEnd: -40, opacity: 0.14 }} />
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#0B1E3D', padding: '4px 11px', borderRadius: 20, marginBottom: 10 }}>
        <Icon name="spark" size={12} color="#E4C97B" /><span style={{ fontSize: 11, fontWeight: 800, color: '#E4C97B', letterSpacing: 0.4 }}>{he ? 'מבצע' : 'Deal'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <span style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(11,30,61,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Emblem size={44} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: serif, fontWeight: 800, fontSize: 19, color: '#0B1E3D', lineHeight: 1.15 }}>{he ? 'כרטיסיית מספרפי' : 'The Barbershop card'}</div>
          <div style={{ fontSize: 13.5, color: 'rgba(11,30,61,0.78)', marginTop: 3, fontWeight: 700 }}>{he ? `${cfg.total} תספורות במחיר ${cfg.total - 1}` : `${cfg.total} cuts for the price of ${cfg.total - 1}`}</div>
          <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.55)', marginTop: 3, fontWeight: 600 }}>
            <span style={{ textDecoration: 'line-through', opacity: 0.7, direction: 'ltr', unicodeBidi: 'isolate' }}>₪{punchFullPrice().toLocaleString()}</span>
            {' '}<span style={{ fontWeight: 800, color: '#0B1E3D', direction: 'ltr', unicodeBidi: 'isolate' }}>₪{punchPrice().toLocaleString()}</span>
            {' · '}{he ? `חיסכון ₪${cfg.price}` : `save ₪${cfg.price}`}
          </div>
        </div>
        <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#0B1E3D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={he ? 'arrowL' : 'arrowR'} size={17} color="#E4C97B" /></span>
      </div>
    </>
  );
  // promo closed (manually, by date, or sold out) + no card yet → visible but shaded, stamped "ended"
  if (!promoOn) {
    return (
      <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', border: '1px solid rgba(11,30,61,0.14)' }}>
        <div aria-disabled="true" style={{ position: 'relative', background: 'linear-gradient(140deg,#F6E7BC 0%,#E4C97B 45%,#C8A24A 100%)', borderRadius: 22, padding: '15px 17px', overflow: 'hidden', filter: 'grayscale(0.85)', opacity: 0.45 }}>{promoInner}</div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <span style={{ transform: 'rotate(-7deg)', border: '2.5px solid #B0413A', color: '#B0413A', fontWeight: 900, fontSize: 15.5, letterSpacing: 0.4, padding: '7px 18px', borderRadius: 9, background: 'rgba(251,249,245,0.88)', boxShadow: '0 6px 18px rgba(176,65,58,0.28)', whiteSpace: 'nowrap' }}>{he ? 'המבצע הסתיים' : 'Promo ended'}</span>
        </div>
      </div>
    );
  }
  return (
    <button onClick={onBuy} className="tapsq" style={{ position: 'relative', display: 'block', width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: 'linear-gradient(140deg,#F6E7BC 0%,#E4C97B 45%,#C8A24A 100%)', border: '1px solid rgba(156,123,46,0.5)', borderRadius: 22, padding: '15px 17px', overflow: 'hidden', boxShadow: '0 12px 30px rgba(200,162,74,0.35)' }}>
      {promoInner}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════
// PART 2 (E2) · Purchase: pick a PACKAGE (E1) → pay → card lands in the wallet
// ════════════════════════════════════════════════════════════════════════
function PunchPurchaseSheet({ lang, accent, serif, staff, onClose, onPurchased }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const list = (staff || DATA.barbers).filter(b => b.active !== false);
  const sellable = punchStore.packages().filter(p => punchStore.packageStatus(p) === 'active');
  const [pkg, setPkg] = usePC(sellable[0] || null);
  const [pay, setPay] = usePC(false);
  const barberOf = (p) => p && p.scope === 'barber' ? list.find(b => b.id === p.barberId) : null;
  const covered = (p) => (p.services || []).map(id => { const s = DATA.services.find(x => x.id === id); return s ? nm(s) : null; }).filter(Boolean);
  if (pay && pkg) {
    const b = barberOf(pkg);
    return <PayMockSheet lang={lang} accent={accent} serif={serif} amount={pkg.price}
      title={he ? 'תשלום מראש, כרטיסייה' : 'Prepay, punch card'}
      sub={he ? `${nm(pkg)} · ${pkg.punches} ניקובים${b ? ' · אצל ' + nm(b).split(' ')[0] : ''}` : `${nm(pkg)} · ${pkg.punches} punches`}
      onClose={() => setPay(false)}
      onPaid={() => { const card = punchStore.buyFromPackage('me', pkg, b ? b.id : null); onPurchased && onPurchased(pkg, card); }} />;
  }
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 98, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '92%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '10px auto 4px', flexShrink: 0 }} />
        <div style={{ padding: '6px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="card" size={23} color="#0B1E3D" /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, color: accent, textTransform: 'uppercase' }}>{he ? 'מבצע מועדון' : 'Club deal'}</div>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D', lineHeight: 1.1 }}>{he ? 'רכישת כרטיסייה' : 'Buy a punch card'}</div>
            </div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={17} color="#0B1E3D" /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 6px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sellable.length === 0 && <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(11,30,61,0.45)', fontSize: 13.5 }}>{he ? 'אין כרטיסיות זמינות לרכישה כרגע' : 'No cards available to buy right now'}</div>}
          {sellable.map(p => {
            const on = pkg && pkg.id === p.id;
            const b = barberOf(p);
            const exp = punchStore.expiryInfo(p);
            return (
              <button key={p.id} onClick={() => setPkg(p)} style={{ display: 'flex', flexDirection: 'column', gap: 0, width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: on ? accent + '0E' : '#fff', border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.1)'}`, borderRadius: 16, padding: '13px 14px', transition: 'all .15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.22)'}`, background: on ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <Icon name="check" size={13} color="#fff" stroke={2.6} />}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: 15.5, color: '#0B1E3D' }}>{nm(p)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'rgba(11,30,61,0.55)', marginTop: 2, flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="scissors" size={12} color={accent} />{p.punches} {he ? 'ניקובים' : 'punches'}</span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name={p.scope === 'all' ? 'users' : 'user'} size={12} color={accent} />{p.scope === 'all' ? (he ? 'כל הצוות' : 'Whole team') : (b ? nm(b).split(' ')[0] : (he ? 'ספר אחד' : 'One barber'))}</span>
                    </span>
                  </span>
                  <span style={{ fontFamily: 'Assistant, sans-serif', fontWeight: 800, fontSize: 18, color: '#0B1E3D', direction: 'ltr', flexShrink: 0 }}>₪{(p.price || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(11,30,61,0.06)', width: '100%' }}>
                  {covered(p).map((n, k) => <span key={k} style={{ fontSize: 10.5, fontWeight: 700, color: '#7A5F1E', background: 'rgba(200,162,74,0.14)', padding: '3px 9px', borderRadius: 20 }}>{n}</span>)}
                  {p.expiry && exp && !exp.ended && <span style={{ marginInlineStart: 'auto', fontSize: 10.5, fontWeight: 800, color: exp.soon ? '#B0413A' : 'rgba(11,30,61,0.5)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="clock" size={11} color={exp.soon ? '#B0413A' : 'rgba(11,30,61,0.4)'} />{he ? `נותרו ${exp.days} ימים` : `${exp.days}d left`}</span>}
                </div>
              </button>
            );
          })}
          {/* §5 transparency - the cancellation rule, shown before paying */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: 'rgba(200,162,74,0.1)', border: `1px solid ${accent}33`, borderRadius: 13, padding: '11px 13px', marginTop: 2 }}>
            <Icon name="clock" size={16} color="#9C7B2E" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.7)', lineHeight: 1.5 }}>{he ? 'ביטול עד שעה לפני התור - הניקוב חוזר לכרטיסייה. בתוך שעה מהתור - הניקוב נשרף.' : 'Cancel up to 1h before - the punch returns to your card. Within the hour - the punch is burned.'}</div>
          </div>
        </div>
        <div style={{ padding: '10px 20px calc(16px + env(safe-area-inset-bottom))', flexShrink: 0, borderTop: '1px solid rgba(11,30,61,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 2px' }}>
            <span style={{ fontSize: 13.5, color: 'rgba(11,30,61,0.6)', fontWeight: 600 }}>{he ? 'תשלום מראש' : 'Prepaid total'}</span>
            <span style={{ fontFamily: 'Assistant, sans-serif', fontWeight: 800, fontSize: 21, color: '#0B1E3D', direction: 'ltr', unicodeBidi: 'isolate' }}>₪{(pkg ? pkg.price : 0).toLocaleString()}</span>
          </div>
          <Btn kind="gold" icon="coin" disabled={!pkg} onClick={() => setPay(true)}>{he ? 'לתשלום (ביט / פייבוקס)' : 'Pay (Bit / PayBox)'}</Btn>
        </div>
      </div>
    </div>
  );
}

// ── client profile: balance sheet ──
function PunchProfileSheet({ lang, accent, serif, appts, staff, onClose }) {
  const he = lang === 'he';
  const card = punchStore.cardFor('me');
  if (!card) return null;
  const used = punchStore.usedFor('me', appts);
  const planned = punchStore.plannedFor('me', appts);
  const b = (staff || DATA.barbers).find(x => x.id === card.barberId);
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 84, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)', padding: '10px 20px calc(24px + env(safe-area-inset-bottom))' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 14px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D' }}>{he ? 'הכרטיסייה שלי' : 'My punch card'}</div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="x" size={17} color="#0B1E3D" /></button>
        </div>
        <div style={{ background: 'linear-gradient(140deg,#14305A,#0B1E3D)', borderRadius: 20, padding: 17, border: '1px solid rgba(228,201,123,0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
            <span style={{ fontSize: 13, color: 'rgba(251,249,245,0.75)', fontWeight: 600 }}>{b ? (he ? `אצל ${b.he}` : `With ${b.en}`) : ''}</span>
            <span style={{ fontFamily: serif, fontWeight: 800, fontSize: 19, color: '#E4C97B', direction: 'ltr' }}>{card.total - used}/{card.total}</span>
          </div>
          <PunchDots used={used} total={card.total} size={17} gap={7} light />
          <div style={{ display: 'flex', gap: 14, marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(251,249,245,0.12)', fontSize: 11.5, color: 'rgba(251,249,245,0.65)', fontWeight: 600 }}>
            <span>{he ? `נוצלו ${used}` : `${used} used`}</span>
            {planned > 0 && <span style={{ color: '#E4C97B' }}>{he ? `${planned} מתוכננים` : `${planned} planned`}</span>}
            <span style={{ marginInlineStart: 'auto' }}>{he ? 'נרכשה ' : 'Bought '}{new Date(card.purchasedAt).toLocaleDateString(he ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.5)', lineHeight: 1.55, marginTop: 12, padding: '0 2px' }}>{he ? 'הניקוב נרשם אוטומטית בסיום כל תספורת. תור שלא הגעתם אליו, הניקוב חוזר ליתרה.' : 'A punch registers automatically when each cut completes. Miss a visit, the punch returns to your balance.'}</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// PART 7 · Declining a PREPAID request: refund or rebook, no third way out
// ════════════════════════════════════════════════════════════════════════
function RejectPaidSheet({ lang, accent, serif, appt, onClose, onResolve }) {
  const he = lang === 'he';
  const svc = DATA.services.find(s => s.id === appt.svc);
  const name = window.clientLabel ? window.clientLabel(appt, lang) : (he ? appt.clientHe : appt.clientEn);
  const amount = svc ? svc.price : 0;
  const opt = (how, icon, label, sub, color) => (
    <button onClick={() => onResolve(how)} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '14px 15px', borderRadius: 16, border: `1.5px solid ${color}44`, cursor: 'pointer', font: 'inherit', background: color + '0C', textAlign: 'start' }}>
      <span style={{ width: 40, height: 40, borderRadius: 12, background: color + '1C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={icon} size={20} color={color} /></span>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 15, fontWeight: 800, color: '#0B1E3D' }}>{label}</span>
        <span style={{ display: 'block', fontSize: 12, color: 'rgba(11,30,61,0.55)', marginTop: 2, lineHeight: 1.4 }}>{sub}</span>
      </span>
      <Icon name={he ? 'chevron' : 'chevronR'} size={17} color={color} />
    </button>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 99, background: 'rgba(7,16,31,0.6)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" style={{ width: '100%', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)', padding: '10px 20px calc(24px + env(safe-area-inset-bottom))' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 14px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 6 }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(46,125,82,0.13)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="coin" size={21} color="#0B6B34" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 18, color: '#0B1E3D', lineHeight: 1.2 }}>{he ? 'התור הזה שולם מראש' : 'This visit was prepaid'}</div>
            <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.55)', marginTop: 2 }} dir="auto">{name} · <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{appt.start}</span> · ₪{amount}</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.62)', lineHeight: 1.55, background: 'rgba(200,162,74,0.1)', border: `1px solid ${accent}33`, borderRadius: 13, padding: '11px 13px', margin: '10px 0 14px' }}>{he ? 'אי אפשר לדחות בלי לטפל בכסף של הלקוח, בחרו החזר כספי, או הציעו לו מועד חדש.' : "You can't decline without handling the client's money, refund it, or offer a new time."}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {opt('refunded', 'coin', he ? 'החזר תשלום מלא' : 'Full refund', he ? `₪${amount} יוחזרו ללקוח באותו אמצעי תשלום` : `₪${amount} back via the same method`, '#B0413A')}
          {opt('rescheduled', 'calendar', he ? 'הצעת מועד חדש' : 'Offer a new time', he ? 'התשלום נשמר, הלקוח יקבל הזמנה לבחור זמן אחר' : 'Payment kept, client picks another slot', '#2E7D52')}
        </div>
        <button onClick={onClose} style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(11,30,61,0.5)', font: 'inherit', fontSize: 13.5, fontWeight: 600, padding: 12, marginTop: 6, cursor: 'pointer' }}>{he ? 'חזרה (בלי לדחות)' : 'Back (don’t decline)'}</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// PART 8 · Client cancelled a prepaid visit → open decision on the barber's desk
// ════════════════════════════════════════════════════════════════════════
function PayDecisionList({ lang, accent, serif, meId, toast }) {
  const he = lang === 'he';
  const [ver, setVer] = usePC(0);
  const rows = punchStore.openFor(meId);
  if (!rows.length) return null;
  const act = (r, how) => {
    punchStore.resolve(r.id, how);
    setVer(v => v + 1);
    toast && toast(
      how === 'refunded' ? (he ? 'התשלום הוחזר ללקוח ✓' : 'Refunded ✓') : (he ? 'נשלחה הצעה למועד חדש ✓' : 'Rebook offer sent ✓'),
      (he ? r.clientHe : r.clientEn) + ' · ₪' + r.amount
    );
  };
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 15, boxShadow: '0 6px 20px rgba(11,30,61,0.07)', border: '1.5px solid rgba(46,125,82,0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(46,125,82,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="coin" size={19} color="#0B6B34" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 15.5, color: '#0B1E3D' }}>{he ? 'ביטולים ששולמו מראש' : 'Prepaid cancellations'}</div>
          <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{he ? 'הלקוח ביטל, ההחלטה אצלך' : 'Client cancelled, your call'}</div>
        </div>
        <span style={{ minWidth: 24, height: 24, padding: '0 7px', borderRadius: 12, background: 'rgba(46,125,82,0.13)', color: '#0B6B34', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{rows.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map(r => {
          const svc = DATA.services.find(s => s.id === r.svc);
          return (
            <div key={r.id} style={{ background: 'rgba(11,30,61,0.025)', borderRadius: 14, padding: '11px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0B1E3D' }} dir="auto">{he ? r.clientHe : r.clientEn}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.55)', marginTop: 2 }}>{svc ? svc[lang] : ''} · <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{r.start}</span> · <span style={{ fontWeight: 800, color: '#0B6B34' }}>₪{r.amount} {he ? 'שולם' : 'paid'}</span></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={() => act(r, 'refunded')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 11, border: '1px solid rgba(176,65,58,0.3)', background: '#fff', color: '#B0413A', font: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}><Icon name="coin" size={15} color="#B0413A" />{he ? 'החזר תשלום' : 'Refund'}</button>
                <button onClick={() => act(r, 'rescheduled')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 11, border: 'none', background: 'linear-gradient(135deg,#2E9D63,#1F8A5B)', color: '#fff', font: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}><Icon name="calendar" size={15} color="#fff" />{he ? 'מועד חדש' : 'New time'}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// PART 5 · Admin: active cards, balances, card revenue (+ open decisions)
// ════════════════════════════════════════════════════════════════════════
function AdminPunchScreen({ lang, t, accent, serif, onBack, appts, staff, toast }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const list = staff || DATA.barbers;
  const cards = punchStore.wallet();
  const revenue = cards.reduce((n, c) => n + (c.price || 0), 0);
  // Round G1: a card's income splits by the deal of the barber it's assigned to.
  // Team cards (no barberId) and owner cards = 100% to the manager.
  const cardProfit = cards.reduce((n, c) => { const b = c.barberId ? list.find(x => x.id === c.barberId) : null; return n + (b && window.netProfit ? window.netProfit(c.price || 0, b) : (c.price || 0)); }, 0);
  const clientOf = (owner) => {
    if (owner === 'me') return window.__meName || (he ? 'דניאל אבני' : 'Daniel Avni');
    const c = DATA.customers.find(x => x.id === owner); return c ? nm(c) : owner;
  };
  const totalLeft = cards.reduce((n, c) => n + punchStore.balanceForCard(c, appts), 0);
  const stat = (label, value, sub) => (
    <div style={{ flex: 1, background: '#fff', borderRadius: 16, padding: '13px 14px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
      <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.45)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: serif, fontWeight: 800, fontSize: 21, color: '#0B1E3D', marginTop: 4, direction: 'ltr', textAlign: 'start' }}>{value}</div>
      {sub && <div style={{ fontSize: 10.5, color: accent, marginTop: 2, fontWeight: 700 }}>{sub}</div>}
    </div>
  );
  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל · רפי בלבד' : 'Admin · Rafi only'} title={he ? 'כרטיסיות' : 'Punch cards'} onBack={onBack}
        right={<span style={{ fontSize: 12.5, fontWeight: 700, color: accent, background: 'rgba(200,162,74,0.12)', padding: '5px 11px', borderRadius: 20 }}>{cards.length}</span>} />
      <Body>
        <div style={{ display: 'flex', gap: 10 }}>
          {stat(he ? 'הכנסה מכרטיסיות' : 'Card revenue', '₪' + revenue.toLocaleString(), he ? `רווח נטו ₪${cardProfit.toLocaleString()}` : `net ₪${cardProfit.toLocaleString()}`)}
          {stat(he ? 'כרטיסיות פעילות' : 'Active cards', String(cards.length))}
          {stat(he ? 'ניקובים ביתרה' : 'Punches left', String(totalLeft), he ? 'התחייבות פתוחה' : 'open liability')}
        </div>

        {/* ── Round E1: flexible package builder (replaces the single locked promo) ── */}
        <PunchPackagesSection lang={lang} accent={accent} serif={serif} staff={staff} toast={toast} />
        <PayDecisionList lang={lang} accent={accent} serif={serif} meId={null} toast={toast} />
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 16, color: '#0B1E3D', marginTop: 4 }}>{he ? 'כרטיסיות פעילות' : 'Active cards'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {cards.map(c => {
            const used = punchStore.usedForCard(c, appts);
            const b = c.scope === 'barber' ? list.find(x => x.id === c.barberId) : null;
            const dead = used >= c.total;
            return (
              <div key={c.id} style={{ background: '#fff', borderRadius: 16, padding: '13px 14px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)', borderInlineStart: `3px solid ${dead ? 'rgba(11,30,61,0.2)' : '#C8A24A'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(140deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FBF9F5', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{clientOf(c.owner).trim()[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 14.5, color: '#0B1E3D' }} dir="auto">{clientOf(c.owner)}</span>
                      {c.label && <span style={{ fontSize: 10, fontWeight: 800, color: '#7A5F1E', background: 'rgba(200,162,74,0.16)', padding: '2px 7px', borderRadius: 20 }} dir="auto">{c.label}</span>}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1 }} dir="auto">{he ? c.he : c.en} · {b ? (he ? `אצל ${nm(b).split(' ')[0]}` : `with ${nm(b).split(' ')[0]}`) : (he ? 'כל הצוות' : 'team')} · ₪{(c.price || 0).toLocaleString()}</div>
                  </div>
                  <span style={{ fontFamily: serif, fontWeight: 800, fontSize: 17, color: dead ? 'rgba(11,30,61,0.35)' : '#9C7B2E', direction: 'ltr' }}>{c.total - used}/{c.total}</span>
                </div>
                <PunchDots used={used} total={c.total} size={14} gap={5} />
              </div>
            );
          })}
        </div>
      </Body>
    </Shell>
  );
}

// ═════════════════════════════════════════════════════════════════
// Round G3 · MANAGER INSIGHTS - punch-card data panel for Deep insights.
//   Period-scoped (cards SOLD in the selected range, by purchase date) for the
//   sold/revenue/by-barber/by-package figures; a live snapshot across ALL active
//   cards for redeemed-vs-open punches and the future-liability value.
// ═════════════════════════════════════════════════════════════════
function PunchInsightsSection({ lang, accent, serif, range, staff, appts }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const list = staff || DATA.barbers;
  const all = appts || [];
  const cards = punchStore.wallet();
  const pkgs = punchStore.packages();
  const pkgName = id => { const p = pkgs.find(x => x.id === id); return p ? (he ? p.he : p.en) : id; };
  const barberOf = id => list.find(b => b.id === id);

  // period = cards sold within the last N days (by purchase date), same range toggle
  const days = range === 'day' ? 1 : range === 'week' ? 7 : 30;
  const since = Date.now() - days * 86400000;
  const periodCards = cards.filter(c => (c.purchasedAt || 0) >= since);
  const soldCount = periodCards.length;
  const gross = periodCards.reduce((n, c) => n + (c.price || 0), 0);
  // net follows the G1 rule: a card splits by the deal of the barber it's bound to;
  // team cards (no barber) and owner cards are 100% manager.
  const net = periodCards.reduce((n, c) => { const b = c.barberId ? barberOf(c.barberId) : null; return n + (b && window.netProfit ? window.netProfit(c.price || 0, b) : (c.price || 0)); }, 0);

  // by barber (+ team bucket for unassigned)
  const byBarber = [...list.map(b => ({ key: b.id, name: nm(b).split(' ')[0] })), { key: 'team', name: he ? 'כל הצוות' : 'Team' }]
    .map(x => { const cs = periodCards.filter(c => x.key === 'team' ? !c.barberId : c.barberId === x.key); return { ...x, count: cs.length, rev: cs.reduce((n, c) => n + (c.price || 0), 0) }; })
    .filter(x => x.count > 0).sort((a, b) => b.rev - a.rev);
  const maxBR = Math.max(1, ...byBarber.map(x => x.rev));

  // by package category
  const byPkgMap = {};
  periodCards.forEach(c => { const k = c.pkgId || '?'; (byPkgMap[k] = byPkgMap[k] || { count: 0, rev: 0 }); byPkgMap[k].count++; byPkgMap[k].rev += (c.price || 0); });
  const byPkg = Object.keys(byPkgMap).map(k => ({ key: k, name: pkgName(k), ...byPkgMap[k] })).sort((a, b) => b.rev - a.rev);
  const maxPR = Math.max(1, ...byPkg.map(x => x.rev));

  // live snapshot across ALL active cards: redeemed vs open + money value of open punches
  let usedAll = 0, remainAll = 0, openVal = 0;
  cards.forEach(c => { const used = punchStore.usedForCard(c, all); const bal = punchStore.balanceForCard(c, all); usedAll += used; remainAll += bal; openVal += bal * ((c.price || 0) / (c.total || 1)); });
  openVal = Math.round(openVal);
  const totalPunch = usedAll + remainAll;
  const redeemedPct = totalPunch ? Math.round(usedAll / totalPunch * 100) : 0;

  const periodLbl = range === 'day' ? (he ? 'היום' : 'today') : range === 'week' ? (he ? 'השבוע' : 'this week') : (he ? 'החודש' : 'this month');

  const Bars = ({ rows, max, accentBar }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map(r => (
        <div key={r.key}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5, gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0B1E3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</span>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexShrink: 0, direction: 'ltr' }}>
              <span style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', fontWeight: 600 }}>{r.count} {he ? 'כ׳' : 'cards'}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#9C7B2E' }}>{'₪' + r.rev.toLocaleString()}</span>
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 5, background: 'rgba(11,30,61,0.06)', overflow: 'hidden' }}><div style={{ width: (r.rev / max * 100) + '%', height: '100%', borderRadius: 5, background: accentBar }} /></div>
        </div>
      ))}
    </div>
  );

  const cardStyle = { background: '#fff', borderRadius: 20, padding: 18, boxShadow: '0 3px 12px rgba(11,30,61,0.05)' };
  const head = (icon, title, hint) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(200,162,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={18} color={accent} /></span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 16, color: '#0B1E3D' }}>{title}</div>
        {hint && <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 1 }}>{hint}</div>}
      </div>
    </div>
  );
  const subLbl = (txt) => <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(11,30,61,0.5)', margin: '17px 0 11px' }}>{txt}</div>;

  return (
    <>
      <div style={cardStyle}>
        {head('card', he ? 'כרטיסיות' : 'Punch cards', he ? `נמכרו ${periodLbl} · לפי תאריך רכישה` : `sold ${periodLbl} · by purchase date`)}
        <div style={{ display: 'flex', gap: 9 }}>
          <div style={{ flex: 1, background: 'rgba(11,30,61,0.04)', borderRadius: 13, padding: '12px 13px' }}>
            <div style={{ fontFamily: serif, fontWeight: 800, fontSize: 24, color: '#0B1E3D', lineHeight: 1 }}>{soldCount}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.55)', marginTop: 4, fontWeight: 600 }}>{he ? 'כרטיסיות נמכרו' : 'cards sold'}</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(200,162,74,0.1)', borderRadius: 13, padding: '12px 13px' }}>
            <div style={{ fontFamily: serif, fontWeight: 800, fontSize: 24, color: '#9C7B2E', lineHeight: 1, direction: 'ltr', textAlign: 'start' }}>{'₪' + gross.toLocaleString()}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.55)', marginTop: 4, fontWeight: 600 }}>{he ? `הכנסה · נטו ₪${net.toLocaleString()}` : `revenue · net ₪${net.toLocaleString()}`}</div>
          </div>
        </div>
        {soldCount === 0 ? (
          <div style={{ textAlign: 'center', padding: '22px 8px 6px', color: 'rgba(11,30,61,0.4)', fontSize: 13 }}>{he ? 'לא נמכרו כרטיסיות בתקופה זו' : 'No cards sold in this period'}</div>
        ) : <>
          {subLbl(he ? 'לפי ספר · מי מכר הכי הרבה' : 'By barber · who sold most')}
          <Bars rows={byBarber} max={maxBR} accentBar={accent} />
          {subLbl(he ? 'לפי סוג חבילה · מה הכי מצליח' : 'By package · top sellers')}
          <Bars rows={byPkg} max={maxPR} accentBar="#14305A" />
        </>}
      </div>

      {/* future liability - live, across ALL active cards */}
      <div style={{ ...cardStyle, background: 'linear-gradient(140deg,#14305A,#0B1E3D)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(228,201,123,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="card" size={18} color="#E4C97B" /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 16, color: '#FBF9F5' }}>{he ? 'ניקובים' : 'Punches'}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(251,249,245,0.55)', marginTop: 1 }}>{he ? 'מצב נוכחי · כל הכרטיסיות הפעילות' : 'current · all active cards'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', height: 12, borderRadius: 7, overflow: 'hidden', background: 'rgba(255,255,255,0.12)' }}>
          <div style={{ width: redeemedPct + '%', background: 'rgba(251,249,245,0.5)' }} />
          <div style={{ flex: 1, background: 'linear-gradient(90deg,#E4C97B,#C8A24A)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, fontWeight: 700 }}>
          <span style={{ color: 'rgba(251,249,245,0.7)' }}>{he ? `מומשו ${usedAll}` : `redeemed ${usedAll}`}</span>
          <span style={{ color: '#E4C97B' }}>{he ? `נותרו פתוחים ${remainAll}` : `${remainAll} open`}</span>
        </div>
        <div style={{ marginTop: 16, paddingTop: 15, borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#FBF9F5' }}>{he ? 'ניקובים שטרם מומשו' : 'Unredeemed punches'}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(251,249,245,0.55)', marginTop: 3, lineHeight: 1.45 }}>{he ? 'שירות ששולם וטרם ניתן - התחייבות עתידית של המספרה' : 'paid for but not yet delivered - the shop’s future liability'}</div>
          </div>
          <div style={{ textAlign: 'end', flexShrink: 0 }}>
            <div style={{ fontFamily: serif, fontWeight: 800, fontSize: 28, color: '#E4C97B', lineHeight: 1, direction: 'ltr' }}>{'₪' + openVal.toLocaleString()}</div>
            <div style={{ fontSize: 10.5, color: 'rgba(251,249,245,0.5)', marginTop: 3, fontWeight: 700 }}>{remainAll} {he ? 'ניקובים' : 'punches'}</div>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { punchStore, PunchDots, PaidChip, PayMockSheet, PunchPromoBanner, PunchPurchaseSheet, PunchProfileSheet, RejectPaidSheet, PayDecisionList, AdminPunchScreen, PunchInsightsSection, punchPrice, PUNCH_SERVICES });
