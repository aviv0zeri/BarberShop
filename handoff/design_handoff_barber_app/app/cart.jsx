// cart.jsx - Round D: the appointment CART.
// One mechanism to book several treatments in a single flow, with automatic scheduling.
//   • build a list of treatments (each with its own duration)
//   • choose PARALLEL (everyone at once, each treatment with a different barber) or
//     SEQUENTIAL (back-to-back with the same barber)
//   • the system solves the schedule and shows ONE unified proposal to confirm in a tap
//   • per-item punch-card use (section 15); manager's "multi-booking allowed" flag (section 14)
// Exports: CartFlow, cartSolve
const { useState: useCart, useMemo: useCartMemo } = React;

// ── service eligibility ──────────────────────────────────────────────────
const cartMultiOk = (s) => s && s.multiOk !== false;          // default: allowed
const cartOffers = (b, svcId) => (b.services || DATA.services.map(s => s.id)).includes(svcId);

// ── the solver ────────────────────────────────────────────────────────────
// Search window across the day, 15-min grid. slotFree() already validates the
// barber's working hours, breaks and existing bookings, so we iterate a generous
// envelope and let it filter.
const CART_DAY_MIN = 7 * 60, CART_DAY_MAX = 21 * 60;
// Round 33 → Round 34: smart parallel fallback with a PREFERENCE ANCHOR.
// When no single shared start works, the family may still all be seen back-to-back.
// The gate is the real-world WAIT, not the raw start-spread: wait = (start of the last
// appointment) − (finish of the first appointment). Overlap counts as zero wait.
// Anything over CART_MAX_WAIT is never offered.
const CART_MAX_WAIT = 30;            // minutes — hard cap on the family's wait
const CART_STAGGER_LOOKAHEAD = 120;  // how far past the anchor a later start may be probed (filtered by wait)

// Parts of the day for the "part of day" hour preference (hard windows).
const CART_PARTS = {
  morning: { lo: CART_DAY_MIN, hi: 12 * 60, he: 'בוקר', en: 'Morning' },
  noon: { lo: 12 * 60, hi: 17 * 60, he: 'צהריים', en: 'Midday' },
  evening: { lo: 17 * 60, hi: CART_DAY_MAX, he: 'ערב', en: 'Evening' },
};
function cartPartBounds(part) { const p = CART_PARTS[part]; return p ? [p.lo, p.hi] : [CART_DAY_MIN, CART_DAY_MAX]; }
// Window of allowed START times for an anchor (hard for "part of day", whole day otherwise).
function cartPrefWindow(pref) { return (pref && pref.mode === 'part') ? cartPartBounds(pref.part) : [CART_DAY_MIN, CART_DAY_MAX]; }
// Is packing A better than packing B, under the hour preference?
//   hour  → start closest to the requested hour
//   part / any → earliest start
//   tie-break (all): shorter wait, then denser window, then earlier.
function cartBetter(a, b, pref) {
  if (pref && pref.mode === 'hour') {
    const da = Math.abs(a.firstStart - pref.hour), db = Math.abs(b.firstStart - pref.hour);
    if (da !== db) return da < db;
  } else if (a.firstStart !== b.firstStart) {
    return a.firstStart < b.firstStart;
  }
  if (a.wait !== b.wait) return a.wait < b.wait;
  if (a.windowLen !== b.windowLen) return a.windowLen < b.windowLen;
  return a.firstStart < b.firstStart;
}

// PARALLEL (perfect) - assign each treatment to a DISTINCT free barber at ONE shared
// start time. All items start together; each may run a different length (its own barber
// stays for its own duration). Exact bipartite matching via backtracking (counts are tiny).
// Layer 1: this is the original, untouched behaviour - tried FIRST and preferred whenever
// it exists. When SEVERAL shared starts work, the hour preference picks among them
// (closest to the requested hour, or the earliest if no hour was given / "part of day").
function solveParallelPerfect(items, pool, appts, ds, minStart, pref) {
  const elig = items.map(it => pool.filter(b => cartOffers(b, it.svc.id)));
  if (elig.some(e => e.length === 0)) return null;
  const [winLo, winHi] = cartPrefWindow(pref);
  const matches = [];
  for (let m = CART_DAY_MIN; m + 15 <= CART_DAY_MAX; m += 15) {
    if (m <= minStart) continue;
    if (m < winLo || m >= winHi) continue;                 // honour a "part of day" window
    const freeBy = items.map((it, i) => elig[i].filter(b => window.availHelpers.slotFree(b, ds, m, it.svc.min, appts)));
    if (freeBy.some(f => f.length === 0)) continue;
    const order = items.map((_, i) => i).sort((a, b) => freeBy[a].length - freeBy[b].length);
    const used = {}, res = new Array(items.length).fill(null);
    const bt = (k) => {
      if (k === order.length) return true;
      const i = order[k];
      for (const b of freeBy[i]) {
        if (used[b.id]) continue;
        used[b.id] = 1; res[i] = b;
        if (bt(k + 1)) return true;
        used[b.id] = 0; res[i] = null;
      }
      return false;
    };
    if (bt(0)) matches.push({ m, assign: items.map((it, i) => ({ itemKey: it.key, svc: it.svc, barber: res[i], start: m, punch: !!it.punch })) });
  }
  if (!matches.length) return null;
  let pick;
  if (pref && pref.mode === 'hour') {
    pick = matches.slice().sort((a, b) => (Math.abs(a.m - pref.hour) - Math.abs(b.m - pref.hour)) || (a.m - b.m))[0];
  } else {
    pick = matches.sort((a, b) => a.m - b.m)[0];           // earliest
  }
  const windowLen = Math.max.apply(null, pick.assign.map(a => a.start + a.svc.min)) - pick.m;
  return { start: pick.m, perfect: true, spread: 0, wait: 0, window: windowLen, assign: pick.assign };
}

// PARALLEL (staggered fallback) - no shared start exists, so let each treatment take its
// OWN start (still a DISTINCT barber each), as long as the family's WAIT stays inside
// CART_MAX_WAIT. Layer 2 of the spec. Wait = (last start) − (finish of the first appt);
// overlap is zero wait. Among every legal packing we keep the BEST under the hour
// preference (see cartBetter): closest to the requested hour, or the earliest; ties break
// to the shorter wait, then the denser window. Returns null if nothing fits the cap.
function solveParallelStaggered(items, pool, appts, ds, minStart, pref) {
  const elig = items.map(it => pool.filter(b => cartOffers(b, it.svc.id)));
  if (elig.some(e => e.length === 0)) return null;
  const [winLo, winHi] = cartPrefWindow(pref);
  const grid = [];
  for (let m = CART_DAY_MIN; m + 15 <= CART_DAY_MAX; m += 15) { if (m > minStart) grid.push(m); }
  let best = null;  // { firstStart, wait, windowLen, picks }
  for (const t0 of grid) {
    if (t0 < winLo || t0 >= winHi) continue;     // the family's earliest start anchors the "part of day" window
    const hi = t0 + CART_STAGGER_LOOKAHEAD;
    // For each item, the single best option per barber = the EARLIEST feasible start in
    // [t0, t0+lookahead]. Earlier start is strictly better (earlier finish AND tighter).
    const cand = items.map((it, i) => {
      const list = [];
      for (const b of elig[i]) {
        for (let s = t0; s <= hi; s += 15) {
          if (s + it.svc.min > CART_DAY_MAX) break;
          if (window.availHelpers.slotFree(b, ds, s, it.svc.min, appts)) { list.push({ barber: b, start: s, finish: s + it.svc.min }); break; }
        }
      }
      return list;
    });
    if (cand.some(c => c.length === 0)) continue;
    const order = items.map((_, i) => i).sort((a, b) => cand[a].length - cand[b].length);
    const used = {}, pick = new Array(items.length).fill(null);
    const consider = () => {
      const starts = pick.map(p => p.start);
      const mn = Math.min.apply(null, starts);
      if (mn !== t0) return;                       // count each packing only under its true earliest start
      const lastStart = Math.max.apply(null, starts);
      // finish of the FIRST appointment (earliest start; on ties take the earliest finish → conservative wait)
      const firstFinish = Math.min.apply(null, pick.filter(p => p.start === mn).map(p => p.finish));
      const wait = Math.max(0, lastStart - firstFinish);
      if (wait > CART_MAX_WAIT) return;            // spec: a spread over 30 min is disqualified
      const windowLen = Math.max.apply(null, pick.map(p => p.finish)) - mn;
      const cur = { firstStart: mn, wait, windowLen, picks: pick.map(p => ({ barber: p.barber, start: p.start })) };
      if (!best || cartBetter(cur, best, pref)) best = cur;
    };
    const bt = (k) => {
      if (k === order.length) { consider(); return; }
      const i = order[k];
      for (const c of cand[i]) {
        if (used[c.barber.id]) continue;
        used[c.barber.id] = 1; pick[i] = c;
        bt(k + 1);
        used[c.barber.id] = 0; pick[i] = null;
      }
    };
    bt(0);
  }
  if (!best) return null;
  const maxStart = best.picks.reduce((mx, p) => Math.max(mx, p.start), 0);
  return {
    start: best.firstStart, perfect: false,
    spread: maxStart - best.firstStart,
    wait: best.wait, window: best.windowLen,
    assign: items.map((it, i) => ({ itemKey: it.key, svc: it.svc, barber: best.picks[i].barber, start: best.picks[i].start, punch: !!it.punch })),
  };
}

// PARALLEL entry point: perfect first (unchanged), else the closest-together fallback.
function solveParallelDay(items, pool, appts, ds, minStart, pref) {
  return solveParallelPerfect(items, pool, appts, ds, minStart, pref)
    || solveParallelStaggered(items, pool, appts, ds, minStart, pref);
}

// SEQUENTIAL - one barber who offers ALL treatments does them back-to-back.
// Block length = sum of durations; each item gets a staggered start.
function solveSequentialDay(items, pool, appts, ds, minStart) {
  const total = items.reduce((n, it) => n + it.svc.min, 0);
  const cands = pool.filter(b => items.every(it => cartOffers(b, it.svc.id)));
  if (!cands.length) return null;
  let best = null;
  for (const b of cands) {
    for (let m = CART_DAY_MIN; m + total <= CART_DAY_MAX; m += 15) {
      if (m <= minStart) continue;
      if (window.availHelpers.slotFree(b, ds, m, total, appts)) {
        if (!best || m < best.start) best = { start: m, barber: b };
        break;
      }
    }
  }
  if (!best) return null;
  let cur = best.start;
  const assign = items.map(it => { const a = { itemKey: it.key, svc: it.svc, barber: best.barber, start: cur, punch: !!it.punch }; cur += it.svc.min; return a; });
  return { start: best.start, barber: best.barber, total, assign };
}

// Search forward across days; return the earliest day that yields a window.
// `pref` carries the hour preference (see solveParallel*); sequential ignores it.
function cartSolve(items, mode, pool, appts, days, pref) {
  const active = pool.filter(b => b.active !== false);
  const pad = n => String(n).padStart(2, '0'); const now = new Date();
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (let di = 0; di < days.length; di++) {
    const ds = days[di].ds;
    if (window.shabbat && window.shabbat.closedDate(ds)) continue;
    const minStart = ds === todayStr ? nowMin : -1;
    const sol = mode === 'parallel' ? solveParallelDay(items, active, appts, ds, minStart, pref) : solveSequentialDay(items, active, appts, ds, minStart);
    if (sol) return { dayIdx: di, ...sol };
  }
  return null;
}
window.cartSolve = cartSolve;

// Solve a SPECIFIC day (for the day-strip on the proposal screen).
function cartSolveDay(items, mode, pool, appts, ds, pref) {
  const active = pool.filter(b => b.active !== false);
  if (window.shabbat && window.shabbat.closedDate(ds)) return null;
  const pad = n => String(n).padStart(2, '0'); const now = new Date();
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const minStart = ds === todayStr ? now.getHours() * 60 + now.getMinutes() : -1;
  return mode === 'parallel' ? solveParallelDay(items, active, appts, ds, minStart, pref) : solveSequentialDay(items, active, appts, ds, minStart);
}

// ── service picker sheet (only multi-booking-allowed services) ─────────────
function CartServicePicker({ lang, accent, serif, onPick, onClose }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const list = DATA.services.filter(s => !s.punchOnly && cartMultiOk(s));
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 99, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '82%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        <div style={{ padding: '10px 20px 6px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 12px' }} />
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D' }}>{he ? 'הוספת טיפול לעגלה' : 'Add a treatment'}</div>
          <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.5)', marginTop: 3 }}>{he ? 'רק טיפולים שניתן לשלב בהזמנה מרובה' : 'Only treatments allowed in multi-booking'}</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px calc(18px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {list.length === 0 && <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(11,30,61,0.45)', fontSize: 13.5 }}>{he ? 'אין טיפולים זמינים לשילוב' : 'No combinable treatments'}</div>}
          {list.map(s => (
            <button key={s.id} onClick={() => onPick(s)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: '#fff', border: '1px solid rgba(11,30,61,0.08)', borderRadius: 15, padding: '11px 13px', cursor: 'pointer', font: 'inherit', textAlign: 'start', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}><ImgSlot id={'svc-book-' + s.id} radius={12} readonly src={s.img} placeholder={he ? s.photoHe : s.photoEn} style={{ width: 44, height: 44 }} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 600, fontSize: 15, color: '#0B1E3D' }}>{nm(s)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(11,30,61,0.55)', marginTop: 2 }}><Icon name="clock" size={12} color="rgba(11,30,61,0.4)" />{s.min} {he ? 'דק׳' : 'min'}</span>
              </span>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="plus" size={17} color={accent} /></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── the cart flow ──────────────────────────────────────────────────────────
function CartFlow({ lang, t, accent, serif, taglines, staff, appts, startService, punch, mustPrepay, clientName, clientPhone, onClose, onConfirmCart }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const pool = staff || DATA.barbers;
  // Round 10 fixes #1+#2: a prepay-required client must pay the cart before it's booked, and
  // a laser treatment in the cart must clear the health-declaration gate first.
  const [healthGate, setHealthGate] = useCart(null);  // null | 'gate' | 'form'
  const [paySheet, setPaySheet] = useCart(false);
  const _seed = startService ? [{ key: 'it0', svc: startService, punch: false }] : [];
  const [items, setItems] = useCart(_seed);
  const [phase, setPhase] = useCart('build');       // build | mode | prefs | proposal | done
  const [mode, setMode] = useCart(null);             // parallel | sequential
  const [picker, setPicker] = useCart(!startService);   // empty cart (multi route) → open picker straight away
  const [pickedDay, setPickedDay] = useCart(null);   // explicit day override on proposal
  // Round 34 · parallel preference anchor (two axes). dayPref: 'flex' (closest possible) | ds.
  // hourPref: {mode:'any'} | {mode:'part', part:'morning'|'noon'|'evening'} | {mode:'hour', hour:<minutes>}
  const [dayPref, setDayPref] = useCart('flex');
  const [hourPref, setHourPref] = useCart({ mode: 'any' });
  const [confirmed, setConfirmed] = useCart(null);   // the booked result, for the done screen
  const [punchCardSel, setPunchCardSel] = useCart(null); // Round E2: the one card the cart punches from
  const [cardPick, setCardPick] = useCart(false);

  // real upcoming days, bounded by the booking window
  const days = useCartMemo(() => {
    const base = new Date(); base.setHours(0, 0, 0, 0);
    const n = window.bookWindowDays ? window.bookWindowDays() : 28;
    return Array.from({ length: n }, (_, k) => {
      const d = new Date(base); d.setDate(base.getDate() + k);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const label = k === 0 ? (t.today || (he ? 'היום' : 'Today')) : k === 1 ? (t.tomorrow || (he ? 'מחר' : 'Tomorrow')) : d.toLocaleDateString(he ? 'he-IL' : 'en-US', { weekday: 'short', day: 'numeric' });
      const full = d.toLocaleDateString(he ? 'he-IL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'numeric' });
      return { ds, label, full };
    });
  }, []);

  // Round E2: the cart punches from a SINGLE wallet card (the wallet drops as one unit).
  // A barber-bound card forces SEQUENTIAL (same barber); a team card allows either mode.
  const itemCovered = (it, card) => !!(card && (card.services || []).includes(it.svc.id));
  const punchBal = (punchCardSel && window.punchStore) ? window.punchStore.balanceForCard(punchCardSel, appts) : 0;
  const punchUsed = items.filter(it => it.punch).length;
  const forceSeq = !!(punchCardSel && punchCardSel.scope === 'barber' && punchUsed > 0);

  const addService = (s) => { setItems(prev => [...prev, { key: 'it' + Date.now(), svc: s, punch: false }]); setPicker(false); };
  const removeItem = (key) => setItems(prev => prev.filter(it => it.key !== key));
  // selecting a card auto-marks covered items for punching, up to the card's balance (§4)
  const applyCartCard = (c) => {
    setPunchCardSel(c); setCardPick(false);
    const bal = window.punchStore.balanceForCard(c, appts); let n = 0;
    setItems(prev => prev.map(it => { const cov = (c.services || []).includes(it.svc.id); if (cov && n < bal) { n++; return { ...it, punch: true }; } return { ...it, punch: false }; }));
  };
  const clearCartCard = () => { setPunchCardSel(null); setItems(prev => prev.map(it => ({ ...it, punch: false }))); };
  const togglePunch = (key) => setItems(prev => prev.map(it => {
    if (it.key !== key) return it;
    if (!itemCovered(it, punchCardSel)) return it;
    if (!it.punch && punchUsed >= punchBal) return it; // capped at balance
    return { ...it, punch: !it.punch };
  }));

  const total = items.reduce((n, it) => n + it.svc.min, 0);
  const canProceed = items.length >= 1;

  // solve for the proposal - either the earliest day, or the user-picked day
  const solvePool = forceSeq ? pool.filter(b => b.id === punchCardSel.barberId) : pool;
  // hour preference only applies to parallel; sequential ignores it inside the solver.
  const earliest = useCartMemo(() => (phase === 'proposal' && mode) ? cartSolve(items, mode, solvePool, appts, days, hourPref) : null, [phase, mode, items, pickedDay, punchCardSel, hourPref]);
  const activeDs = pickedDay || (earliest ? days[earliest.dayIdx].ds : null);
  const daySolution = useCartMemo(() => {
    if (phase !== 'proposal' || !mode || !activeDs) return null;
    if (!pickedDay && earliest) return earliest;       // already solved
    const s = cartSolveDay(items, mode, solvePool, appts, activeDs, hourPref);
    if (!s) return null;
    const di = days.findIndex(d => d.ds === activeDs);
    return { dayIdx: di, ...s };
  }, [phase, mode, items, activeDs, earliest, hourPref]);

  // parallel routes through the preference step first; sequential goes straight to the proposal.
  const chooseMode = (m) => { setMode(m); if (m === 'parallel') { setPhase('prefs'); } else { setPickedDay(null); setPhase('proposal'); } };
  const findSchedule = () => { setPickedDay(dayPref === 'flex' ? null : dayPref); setPhase('proposal'); };
  const proceedFromBuild = () => { if (forceSeq) { setMode('sequential'); setPickedDay(null); setPhase('proposal'); } else if (items.length >= 2) setPhase('mode'); else { setMode('sequential'); setPickedDay(null); setPhase('proposal'); } };

  // #1 prepay - only the treatments NOT covered by a punch card are payable.
  const payAmount = items.filter(it => !it.punch).reduce((n, it) => n + (it.svc.price || 0), 0);
  const needPrepay = !!mustPrepay && payAmount > 0;
  // #2 health - first laser in the cart while the client has no declaration on file.
  const laserItem = items.find(it => window.requiresHealthDecl && window.requiresHealthDecl(it.svc));
  const needHealth = () => !!laserItem && window.healthStore && !window.healthStore.signed('me');

  const finalizeCart = (prepaid) => {
    if (!daySolution) return;
    const cartId = 'cart' + Date.now();
    const dayObj = days[daySolution.dayIdx];
    const result = {
      cartId, mode, date: dayObj.ds, dayLabel: dayObj.full, prepaid: !!prepaid,
      items: daySolution.assign.map(a => ({ svc: a.svc, barber: a.barber, start: window.availHelpers.toHHMM(a.start), punch: a.punch, punchCardId: a.punch && punchCardSel ? punchCardSel.id : undefined })),
    };
    if (onConfirmCart) onConfirmCart(result);
    setConfirmed(result);
    setPhase('done');
  };
  // after the health gate clears, fall through to the prepay gate (if any), else book.
  const afterHealth = () => { setHealthGate(null); if (needPrepay) { setPaySheet(true); return; } finalizeCart(false); };
  const signHealth = (form, manual) => {
    if (window.healthStore) {
      const li = laserItem; const b0 = daySolution && daySolution.assign[0] && daySolution.assign[0].barber;
      window.healthStore.sign('me', {
        svcId: li ? li.svc.id : undefined, svcHe: li ? li.svc.he : '', svcEn: li ? li.svc.en : '',
        barberId: b0 ? b0.id : undefined, clientName: clientName || '', clientPhone: clientPhone || '', manual: !!manual,
        ...(manual
          ? { date: new Date().toLocaleDateString(he ? 'he-IL' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }), confirmedText: he ? 'הלקוח הצהיר שמילא הצהרת בריאות במספרה בעבר' : 'Client stated a declaration was completed in-shop previously' }
          : (form || {})),
      });
    }
    afterHealth();
  };

  const confirm = () => {
    if (!daySolution) return;
    if (needHealth()) { setHealthGate('gate'); return; }   // gate 1 - health declaration
    if (needPrepay) { setPaySheet(true); return; }          // gate 2 - prepay required
    finalizeCart(false);
  };

  // ── header ──
  const Header = ({ title, sub, onBack }) => (
    <div style={{ flexShrink: 0 }}>
      <div style={{ paddingTop: 58, padding: '58px 18px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Icon name={he ? 'arrowR' : 'arrowL'} size={20} color="#0B1E3D" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: accent, textTransform: 'uppercase', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="bag" size={13} color={accent} />{he ? 'עגלת תורים' : 'Appointment cart'}</div>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 21, color: '#0B1E3D' }}>{title}</div>
          {sub && <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.5)', marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );

  // ── BUILD ──
  const buildView = (
    <React.Fragment>
      <Header title={he ? 'בניית העגלה' : 'Build your cart'} sub={he ? 'הוסיפו את כל הטיפולים, נשבץ אותם אוטומטית' : "Add every treatment, we'll schedule them"} onBack={onClose} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* §4 - pay the whole cart with one wallet card */}
        {punch && punch.cards && punch.cards.length > 0 && (
          punchCardSel ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(200,162,74,0.12)', border: `1px solid ${accent}55`, borderRadius: 14, padding: '11px 13px' }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(140deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="card" size={17} color="#E4C97B" /></span>
              <span style={{ flex: 1, minWidth: 0 }} dir="auto">
                <span style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#0B1E3D' }}>{punchCardSel.label || (he ? punchCardSel.he : punchCardSel.en)}</span>
                <span style={{ display: 'block', fontSize: 11, color: '#9C7B2E', fontWeight: 700, marginTop: 1 }}>{he ? `יתרה ${punchBal} · ${window.cardScopeLabel ? window.cardScopeLabel(punchCardSel, lang, staff) : ''}` : `${punchBal} left`}{punchCardSel.scope === 'barber' ? (he ? ' · ניקוב מרובה ברצף בלבד' : ' · sequential only') : ''}</span>
              </span>
              {punch.cards.length > 1 && <button onClick={() => setCardPick(true)} style={{ background: 'none', border: 'none', padding: '2px 6px', cursor: 'pointer', color: '#9C7B2E', font: 'inherit', fontSize: 12, fontWeight: 800 }}>{he ? 'החלפה' : 'Switch'}</button>}
              <button onClick={clearCartCard} style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: 'rgba(11,30,61,0.45)', display: 'flex' }} title={he ? 'בלי כרטיסייה' : 'Without card'}><Icon name="x" size={15} /></button>
            </div>
          ) : (
            <button onClick={() => setCardPick(true)} className="tapsq" style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: 'linear-gradient(140deg,#F6E7BC,#E4C97B)', border: '1px solid rgba(156,123,46,0.5)', borderRadius: 14, padding: '11px 13px', boxShadow: '0 6px 16px rgba(200,162,74,0.25)' }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(11,30,61,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="card" size={17} color="#0B1E3D" /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#0B1E3D' }}>{he ? 'תשלום עם כרטיסייה' : 'Pay with a punch card'}</span>
                <span style={{ display: 'block', fontSize: 11, color: 'rgba(11,30,61,0.6)', fontWeight: 600, marginTop: 1 }}>{he ? 'הניקובים יירדו מאותה כרטיסייה' : 'Punches come off one card'}</span>
              </span>
              <Icon name={he ? 'arrowL' : 'arrowR'} size={17} color="#0B1E3D" />
            </button>
          )
        )}
        {items.map((it, k) => (
          <div key={it.key} style={{ background: '#fff', borderRadius: 16, padding: '12px 13px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)', border: '1px solid rgba(11,30,61,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: accent + '1a', color: '#9C7B2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{k + 1}</span>
              <span style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}><ImgSlot id={'svc-book-' + it.svc.id} radius={12} readonly src={it.svc.img} placeholder={he ? it.svc.photoHe : it.svc.photoEn} style={{ width: 44, height: 44 }} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 600, fontSize: 15, color: '#0B1E3D' }}>{nm(it.svc)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(11,30,61,0.55)', marginTop: 2 }}><Icon name="clock" size={12} color="rgba(11,30,61,0.4)" />{it.svc.min} {he ? 'דק׳' : 'min'}</span>
              </span>
              {items.length > 1 && (
                <button onClick={() => removeItem(it.key)} style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid rgba(176,65,58,0.25)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }} title={he ? 'הסרה' : 'Remove'}><Icon name="x" size={15} color="#B0413A" /></button>
              )}
            </div>
            {/* §4 - covered items punch from the chosen card; the rest are paid */}
            {punchCardSel && (
              itemCovered(it, punchCardSel) ? (
                <button onClick={() => togglePunch(it.key)} disabled={!it.punch && punchUsed >= punchBal} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(11,30,61,0.06)', background: 'none', border: 'none', font: 'inherit', cursor: (!it.punch && punchUsed >= punchBal) ? 'default' : 'pointer', textAlign: 'start', opacity: (!it.punch && punchUsed >= punchBal) ? 0.45 : 1 }}>
                <span style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, border: `1.5px solid ${it.punch ? '#9C7B2E' : 'rgba(11,30,61,0.25)'}`, background: it.punch ? 'linear-gradient(135deg,#E4C97B,#C8A24A)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.punch && <Icon name="check" size={13} color="#0B1E3D" stroke={2.6} />}</span>
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: it.punch ? '#7A5F1E' : 'rgba(11,30,61,0.6)' }}>{it.punch ? (he ? 'ניקוב מהכרטיסייה' : 'Punch from card') : (he ? 'ניקוב מהכרטיסייה' : 'Punch from card')}</span>
                <Icon name="card" size={15} color={it.punch ? '#9C7B2E' : 'rgba(11,30,61,0.3)'} />
              </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(11,30,61,0.06)' }}>
                  <Icon name="coin" size={15} color="rgba(11,30,61,0.35)" />
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'rgba(11,30,61,0.5)' }}>{he ? 'לא מכוסה בכרטיסייה · בתשלום' : 'Not on this card · paid'}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.6)', direction: 'ltr' }}>₪{it.svc.price}</span>
                </div>
              )
            )}
          </div>
        ))}
        <button onClick={() => setPicker(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', padding: '14px', borderRadius: 15, border: `1.5px dashed ${accent}`, background: `${accent}10`, color: '#0B1E3D', font: 'inherit', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' }}>
          <Icon name="plus" size={18} color={accent} />{he ? 'הוסף עוד טיפול' : 'Add another treatment'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 6px 0' }}>
          <span style={{ fontSize: 13, color: 'rgba(11,30,61,0.55)', fontWeight: 600 }}>{items.length} {he ? 'טיפולים' : 'treatments'} · {total} {he ? 'דק׳ סה״כ' : 'min total'}</span>
          {punchUsed > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: '#7A5F1E' }}>{he ? `${punchUsed} ניקובים` : `${punchUsed} punches`}</span>}
        </div>
      </div>
      <div style={{ padding: '12px 18px calc(18px + env(safe-area-inset-bottom))', flexShrink: 0, background: 'linear-gradient(to top, var(--cream-bg) 70%, transparent)' }}>
        <Btn kind="gold" icon={he ? 'arrowL' : 'arrowR'} disabled={!canProceed} onClick={proceedFromBuild}>{items.length >= 2 ? (he ? 'המשך לשיבוץ' : 'Continue to scheduling') : (he ? 'המשך' : 'Continue')}</Btn>
      </div>
    </React.Fragment>
  );

  // ── MODE ──
  const ModeCard = ({ id, icon, title, desc, example }) => (
    <button onClick={() => chooseMode(id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0, width: '100%', textAlign: 'start', background: '#fff', border: '1.5px solid rgba(11,30,61,0.08)', borderRadius: 20, padding: '18px 18px', cursor: 'pointer', font: 'inherit', boxShadow: '0 4px 16px rgba(11,30,61,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%' }}>
        <span style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={icon} size={25} color="#E4C97B" /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D' }}>{title}</span>
          <span style={{ display: 'block', fontSize: 12.5, color: 'rgba(11,30,61,0.6)', marginTop: 3, lineHeight: 1.4 }}>{desc}</span>
        </span>
        <Icon name={he ? 'arrowL' : 'arrowR'} size={20} color={accent} />
      </div>

    </button>
  );
  const modeView = (
    <React.Fragment>
      <Header title={he ? 'מקביל או רצף?' : 'Parallel or sequential?'} sub={he ? `${items.length} טיפולים · בחירה אחת` : `${items.length} treatments · one choice`} onBack={() => setPhase('build')} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 18px 18px', display: 'flex', flexDirection: 'column', gap: 13 }}>
        <ModeCard id="parallel" icon="users" title={he ? 'במקביל' : 'In parallel'} desc={he ? 'כולם באותה שעה, כל אחד אצל ספר אחר.' : 'Everyone at the same time, each with a different barber.'} />
        <ModeCard id="sequential" icon="clock" title={he ? 'ברצף' : 'In sequence'} desc={he ? 'אצל אותו ספר, אחד אחרי השני.' : 'With the same barber, one after another.'} />
      </div>
    </React.Fragment>
  );

  // ── PREFERENCE ANCHOR (parallel only) · day axis + hour axis ──
  const pillStyle = (on) => ({ flexShrink: 0, padding: '11px 15px', borderRadius: 13, cursor: 'pointer', font: 'inherit', fontSize: 13.5, fontWeight: 700, border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.12)'}`, background: on ? accent : '#fff', color: on ? '#0B1E3D' : 'rgba(11,30,61,0.65)', transition: 'all .15s', whiteSpace: 'nowrap' });
  const SectLabel = ({ icon, text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 2px 2px' }}>
      <Icon name={icon} size={15} color={accent} />
      <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 17, color: '#0B1E3D' }}>{text}</span>
    </div>
  );
  const hourChips = []; for (let m = 8 * 60; m <= 20 * 60; m += 30) hourChips.push(m);
  const daySpecific = dayPref !== 'flex';
  const prefsView = (
    <React.Fragment>
      <Header title={he ? 'מתי יתאים למשפחה?' : 'When works for the family?'} sub={he ? 'נשבץ את כולם קרוב ככל האפשר, כל אחד אצל ספר אחר' : "We'll seat everyone as close together as we can, each with a different barber"} onBack={() => setPhase(items.length >= 2 ? 'mode' : 'build')} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* DAY axis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SectLabel icon="calendar" text={he ? 'יום' : 'Day'} />
          <div style={{ display: 'flex', gap: 9 }}>
            <button onClick={() => setDayPref('flex')} style={{ ...pillStyle(!daySpecific), flex: 1 }}>{he ? 'הכי קרוב שאפשר' : 'As soon as possible'}</button>
            <button onClick={() => setDayPref(days[0].ds)} style={{ ...pillStyle(daySpecific), flex: 1 }}>{he ? 'יום מסוים' : 'A specific day'}</button>
          </div>
          {daySpecific && (
            <div className="cal-fade" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {days.slice(0, 14).map(d => (
                <button key={d.ds} onClick={() => setDayPref(d.ds)} style={pillStyle(dayPref === d.ds)}>{d.label}</button>
              ))}
            </div>
          )}
        </div>
        {/* HOUR axis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SectLabel icon="clock" text={he ? 'שעה' : 'Time'} />
          <div style={{ display: 'flex', gap: 9 }}>
            <button onClick={() => setHourPref({ mode: 'any' })} style={{ ...pillStyle(hourPref.mode === 'any'), flex: 1 }}>{he ? 'מתי שיש' : 'Anytime'}</button>
            <button onClick={() => setHourPref({ mode: 'part', part: 'morning' })} style={{ ...pillStyle(hourPref.mode === 'part'), flex: 1 }}>{he ? 'חלק מהיום' : 'Part of day'}</button>
            <button onClick={() => setHourPref({ mode: 'hour', hour: 10 * 60 })} style={{ ...pillStyle(hourPref.mode === 'hour'), flex: 1 }}>{he ? 'שעה מועדפת' : 'A set hour'}</button>
          </div>
          {hourPref.mode === 'part' && (
            <div className="cal-fade" style={{ display: 'flex', gap: 9 }}>
              {Object.keys(CART_PARTS).map(p => (
                <button key={p} onClick={() => setHourPref({ mode: 'part', part: p })} style={{ ...pillStyle(hourPref.part === p), flex: 1 }}>{he ? CART_PARTS[p].he : CART_PARTS[p].en}</button>
              ))}
            </div>
          )}
          {hourPref.mode === 'hour' && (
            <div className="cal-fade" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {hourChips.map(m => (
                <button key={m} onClick={() => setHourPref({ mode: 'hour', hour: m })} style={{ ...pillStyle(hourPref.hour === m), direction: 'ltr' }}>{window.availHelpers.toHHMM(m)}</button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ padding: '12px 18px calc(18px + env(safe-area-inset-bottom))', flexShrink: 0, background: 'linear-gradient(to top, var(--cream-bg) 70%, transparent)' }}>
        <Btn kind="gold" icon="spark" onClick={findSchedule}>{he ? 'מצאו לנו שיבוץ' : 'Find us a fit'}</Btn>
      </div>
    </React.Fragment>
  );

  // ── PROPOSAL ──
  const proposalView = (() => {
    const sol = daySolution;
    const fmtRange = (startMin, dur) => `${window.availHelpers.toHHMM(startMin)}-${window.availHelpers.toHHMM(startMin + dur)}`;
    const staggered = mode === 'parallel' && !!sol && !sol.perfect;            // smart fallback in play
    const maxStart = sol ? Math.max.apply(null, sol.assign.map(a => a.start)) : 0;
    // human-readable summary of the chosen preference (parallel only)
    const dayTxt = dayPref === 'flex' ? (he ? 'הכי קרוב שאפשר' : 'ASAP') : (() => { const d = days.find(x => x.ds === dayPref); return d ? d.label : (he ? 'יום מסוים' : 'a day'); })();
    const hourTxt = hourPref.mode === 'any' ? (he ? 'מתי שיש' : 'anytime')
      : hourPref.mode === 'part' ? (he ? CART_PARTS[hourPref.part].he : CART_PARTS[hourPref.part].en)
      : window.availHelpers.toHHMM(hourPref.hour);
    const prefSummary = `${dayTxt} · ${hourTxt}`;
    // no-solution copy follows the DAY anchor: a specific day vs the whole booking window
    const noSolMsg = mode !== 'parallel'
      ? (he ? 'אין חלון רצוף פנוי אצל ספר אחד' : 'No continuous window with one barber')
      : (!earliest
          ? (he ? 'לא נמצא שיבוץ צמוד לכל המשפחה בימים הקרובים.' : 'No close-together fit for the whole family in the coming days.')
          : (he ? 'לא נמצא שיבוץ צמוד לכל המשפחה ביום זה.' : 'No close-together fit for the whole family on this day.'));
    return (
      <React.Fragment>
        <Header title={he ? 'ההצעה שלנו' : 'Our proposal'} sub={mode === 'parallel' ? (he ? 'במקביל · כל טיפול אצל ספר אחר' : 'Parallel · each with a different barber') : (he ? 'ברצף · אותו ספר' : 'Sequential · same barber')} onBack={() => setPhase(mode === 'parallel' ? 'prefs' : (items.length >= 2 ? 'mode' : 'build'))} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: 13 }}>
          {/* parallel preference summary + edit */}
          {mode === 'parallel' && (
            <button onClick={() => setPhase('prefs')} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: '#fff', border: '1px solid rgba(11,30,61,0.08)', borderRadius: 13, padding: '9px 12px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
              <Icon name="spark" size={15} color={accent} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: 'rgba(11,30,61,0.7)' }}>{prefSummary}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#9C7B2E' }}>{he ? 'שינוי' : 'Edit'}</span>
            </button>
          )}
          {/* day strip */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {days.slice(0, 14).map((d) => {
              const on = activeDs === d.ds;
              return (
                <button key={d.ds} onClick={() => setPickedDay(d.ds)} style={{ flexShrink: 0, padding: '10px 15px', borderRadius: 13, cursor: 'pointer', font: 'inherit', fontSize: 13, fontWeight: 600, border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.1)'}`, background: on ? accent : '#fff', color: on ? '#0B1E3D' : 'rgba(11,30,61,0.6)' }}>{d.label}</button>
              );
            })}
          </div>

          {!sol && (
            <div style={{ background: '#fff', borderRadius: 18, padding: '26px 20px', textAlign: 'center', boxShadow: '0 4px 16px rgba(11,30,61,0.05)' }}>
              <Icon name="clock" size={34} color="rgba(11,30,61,0.25)" />
              <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0B1E3D', marginTop: 10 }}>{he ? 'אין חלון מתאים ביום זה' : 'No window fits this day'}</div>
              <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.5)', marginTop: 4, lineHeight: 1.5 }}>{noSolMsg}</div>
              {earliest && (
                <button onClick={() => setPickedDay(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 16, padding: '11px 17px', borderRadius: 13, border: 'none', background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', color: '#0B1E3D', font: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 16px rgba(200,162,74,0.32)' }}>
                  <Icon name="spark" size={15} color="#0B1E3D" />{he ? `החלון הקרוב ביותר · ${days[earliest.dayIdx].label} ${window.availHelpers.toHHMM(earliest.start)}` : `Nearest window · ${days[earliest.dayIdx].label} ${window.availHelpers.toHHMM(earliest.start)}`}
                </button>
              )}
              {!earliest && <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.4)', marginTop: 12 }}>{he ? 'נסו פחות טיפולים או מצב אחר' : 'Try fewer treatments or the other mode'}</div>}
            </div>
          )}

          {sol && (
            <div style={{ background: 'linear-gradient(155deg,#FCFAF4,#F4EEDF)', borderRadius: 22, overflow: 'hidden', boxShadow: '0 12px 30px rgba(11,30,61,0.12)', border: '1px solid rgba(200,162,74,0.35)' }}>
              <div style={{ background: 'linear-gradient(135deg,#14305A,#0B1E3D)', padding: '16px 18px' }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, color: '#E4C97B', textTransform: 'uppercase' }}>{days[sol.dayIdx].full}</div>
                <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 26, color: '#FBF9F5', marginTop: 4, direction: 'ltr', textAlign: he ? 'right' : 'left' }}>
                  {mode !== 'parallel' ? fmtRange(sol.start, sol.total)
                    : staggered ? `${window.availHelpers.toHHMM(sol.start)}\u2013${window.availHelpers.toHHMM(maxStart)}`
                    : window.availHelpers.toHHMM(sol.start)}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(251,249,245,0.75)', marginTop: 5 }}>
                  {mode !== 'parallel'
                    ? (he ? `אצל ${nm(sol.barber)} · ${sol.total} דק׳ ברצף` : `with ${nm(sol.barber)} · ${sol.total} min back-to-back`)
                    : staggered
                      ? (sol.wait > 0 ? (he ? `שיבוץ צמוד · המתנה עד ${sol.wait} דק׳` : `Closest fit · up to ${sol.wait} min wait`) : (he ? 'שיבוץ צמוד · כמעט חופף' : 'Closest fit · barely any wait'))
                      : (he ? `${items.length === 2 ? 'שניכם' : items.length === 3 ? 'שלושתכם' : `${items.length} הטיפולים`} באותה שעה` : `All ${items.length} at the same time`)}
                </div>
              </div>
              <div style={{ padding: '6px 16px 14px' }}>
                {sol.assign.map((a, k) => (
                  <div key={a.itemKey} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: k < sol.assign.length - 1 ? '1px solid rgba(11,30,61,0.08)' : 'none' }}>
                    <BarberMedallion b={a.barber} size={44} lang={lang} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#0B1E3D' }}>{nm(a.svc)}</div>
                      <div style={{ fontSize: 12.5, color: '#9C7B2E', marginTop: 2, fontWeight: 600 }}>{he ? 'אצל ' : 'with '}{nm(a.barber)}</div>
                    </div>
                    <div style={{ textAlign: 'end', flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0B1E3D', direction: 'ltr' }}>{window.availHelpers.toHHMM(a.start)}</div>
                      <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.45)', marginTop: 1 }}>{a.svc.min} {he ? 'דק׳' : 'min'}{a.punch ? (he ? ' · ניקוב' : ' · punch') : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {sol && staggered && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: 'rgba(200,162,74,0.12)', border: `1px solid ${accent}55`, borderRadius: 13, padding: '11px 13px' }}>
              <Icon name="spark" size={16} color="#9C7B2E" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.72)', lineHeight: 1.5 }}>
                <b>{he ? 'לא נמצאה שעה זהה לכולם.' : 'No single shared time was open.'}</b>{' '}
                {sol.wait > 0
                  ? (he ? `ההמתנה ביניכם עד ${sol.wait} דקות. בדקו שהשעות מתאימות ואשרו.` : `The wait between you is up to ${sol.wait} minutes. Check the times and approve.`)
                  : (he ? 'הטיפולים כמעט חופפים, כמעט בלי המתנה. בדקו שהשעות מתאימות ואשרו.' : 'Your treatments overlap with almost no wait. Check the times and approve.')}
              </div>
            </div>
          )}
          {sol && punchUsed > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(200,162,74,0.12)', border: `1px solid ${accent}55`, borderRadius: 13, padding: '10px 13px' }}>
              <Icon name="card" size={16} color="#9C7B2E" />
              <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: '#0B1E3D' }}>{he ? `${punchUsed} מהטיפולים ינוקבו מהכרטיסייה שלך` : `${punchUsed} treatment(s) will use your punch card`}</span>
            </div>
          )}
          {sol && needPrepay && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: 'rgba(200,162,74,0.12)', border: `1px solid ${accent}55`, borderRadius: 13, padding: '11px 13px' }}>
              <Icon name="coin" size={17} color="#9C7B2E" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.7)', lineHeight: 1.5 }}><b>{he ? 'נדרש תשלום מראש.' : 'Prepayment required.'}</b> {he ? `התורים ייקבעו מיד לאחר תשלום של ₪${payAmount.toLocaleString()} (ביט / פייבוקס).` : `Your bookings complete right after paying ₪${payAmount.toLocaleString()} (Bit / PayBox).`}</div>
            </div>
          )}
        </div>
        <div style={{ padding: '12px 18px calc(18px + env(safe-area-inset-bottom))', flexShrink: 0, background: 'linear-gradient(to top, var(--cream-bg) 70%, transparent)' }}>
          <Btn kind="gold" icon={needPrepay ? 'coin' : 'check'} disabled={!sol} onClick={confirm}>{needPrepay ? (he ? `לתשלום ₪${payAmount.toLocaleString()} · קביעת הכל` : `Pay ₪${payAmount.toLocaleString()} · book all`) : (he ? 'אישור · קביעת כל התורים' : 'Confirm · book everything')}</Btn>
        </div>
      </React.Fragment>
    );
  })();

  // ── DONE ──
  const doneView = confirmed && (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#0B1E3D,#0E2A52)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 26px', textAlign: 'center' }}>
      <div className="succ-pop" style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 18px 50px rgba(200,162,74,0.5)', marginBottom: 24 }}>
        <Icon name="check" size={46} color="#0B1E3D" stroke={2.6} />
      </div>
      <div className="succ-rise" style={{ fontFamily: serif, fontWeight: 700, fontSize: 28, color: '#FBF9F5', marginBottom: 8 }}>{he ? 'כל התורים נקבעו!' : 'All booked!'}</div>
      <div className="succ-rise succ-d1" style={{ fontSize: 14.5, color: 'rgba(251,249,245,0.7)', lineHeight: 1.45, maxWidth: 290, marginBottom: 22 }}>
        {he ? `${confirmed.items.length} טיפולים · ${confirmed.dayLabel}` : `${confirmed.items.length} treatments · ${confirmed.dayLabel}`}
      </div>
      <div className="succ-rise succ-d2" style={{ width: '100%', maxWidth: 320, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(228,201,123,0.25)', borderRadius: 18, padding: '8px 16px', marginBottom: 26 }}>
        {confirmed.items.map((it, k) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 0', borderBottom: k < confirmed.items.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
            <BarberMedallion b={it.barber} size={38} lang={lang} />
            <div style={{ flex: 1, textAlign: 'start', minWidth: 0 }}>
              <div style={{ color: '#FBF9F5', fontWeight: 600, fontSize: 14 }}>{nm(it.svc)}</div>
              <div style={{ color: 'rgba(251,249,245,0.6)', fontSize: 12, marginTop: 1 }}>{nm(it.barber).split(' ')[0]}</div>
            </div>
            <div style={{ color: '#E4C97B', fontWeight: 700, fontSize: 14, direction: 'ltr' }}>{it.start}</div>
          </div>
        ))}
      </div>
      <div className="succ-rise succ-d2" style={{ width: '100%', maxWidth: 320 }}>
        <Btn kind="gold" icon="check" onClick={onClose}>{he ? 'מצוין' : 'Great'}</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--cream-bg)', zIndex: 72, display: 'flex', flexDirection: 'column' }}>
      {phase === 'build' && buildView}
      {phase === 'mode' && modeView}
      {phase === 'prefs' && prefsView}
      {phase === 'proposal' && proposalView}
      {phase === 'done' && doneView}
      {healthGate === 'gate' && window.HealthDeclGate && <HealthDeclGate lang={lang} accent={accent} serif={serif}
        clientName={clientName} service={laserItem ? laserItem.svc : null}
        onClose={() => setHealthGate(null)}
        onFill={() => setHealthGate('form')}
        onAlreadyFilled={() => signHealth(null, true)} />}
      {healthGate === 'form' && window.HealthDeclarationSheet && <HealthDeclarationSheet lang={lang} t={t} accent={accent} serif={serif}
        clientName={clientName} service={laserItem ? laserItem.svc : null}
        onClose={() => setHealthGate('gate')} onSubmit={(form) => signHealth(form, false)} />}
      {paySheet && window.PayMockSheet && <PayMockSheet lang={lang} accent={accent} serif={serif} amount={payAmount}
        title={he ? 'תשלום מראש לעגלה' : 'Prepay your cart'}
        sub={he ? 'לבקשת המספרה, יש לשלם מראש את הטיפולים שאינם מנוקבים מכרטיסייה.' : 'The shop requires prepayment for the treatments not covered by a punch card.'}
        onClose={() => setPaySheet(false)}
        onPaid={() => { setPaySheet(false); finalizeCart(true); }} />}
      {picker && <CartServicePicker lang={lang} accent={accent} serif={serif} onPick={addService} onClose={() => setPicker(false)} />}
      {cardPick && punch && punch.cards && window.PunchCardPicker && (
        <PunchCardPicker lang={lang} accent={accent} serif={serif} cards={punch.cards} appts={appts} staff={staff}
          onPick={applyCartCard} onClose={() => setCardPick(false)}
          title={he ? 'תשלום עם כרטיסייה' : 'Pay with a card'}
          sub={he ? 'כל הניקובים יירדו מאותה כרטיסייה' : 'All punches come off one card'} />
      )}
    </div>
  );
}

Object.assign(window, { CartFlow, cartSolve, cartMultiOk });
