// ui.jsx, shared primitives & micro-interactions for ROYALE
// Exports: playChime, Confetti, Toast, GeoButton, Avatar, Stars, Money, Btn, PhotoSlot, SegBar

const { useState, useEffect, useRef, useCallback } = React;

// ── Availability helpers (shared by calendar + customer booking) ──
// A barber's working day = [start,end] minus breaks; appointments also block time.
const _toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const _toHHMM = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const _dow = dateStr => { try { return new Date(dateStr + 'T00:00').getDay(); } catch (e) { return 0; } }; // 0=Sun
// resolve a barber's working schedule for a specific date from their weekly plan (falls back to legacy single shift)
// Layer 3, a point exception for an exact date overrides the weekly plan (closed day or special hours)
function dayException(barber, dateStr) {
  return (barber && barber.exceptions && dateStr && barber.exceptions[dateStr]) || null;
}
function daySched(barber, dateStr) {
  const ex = dayException(barber, dateStr);
  if (ex) {
    if (ex.closed) return { active: false, start: ex.start || '09:00', end: ex.end || '18:00', breaks: [], exception: 'closed' };
    return { active: barber && barber.active !== false, start: ex.start || '09:00', end: ex.end || '18:00', breaks: ex.breaks || [], exception: 'hours' };
  }
  if (barber && barber.week && barber.week[_dow(dateStr)]) {
    const d = barber.week[_dow(dateStr)];
    return { active: barber.active !== false && d.active !== false, start: d.start || '09:00', end: d.end || '18:00', breaks: d.breaks || [] };
  }
  return { active: barber && barber.active !== false, start: (barber && barber.start) || '09:00', end: (barber && barber.end) || '18:00', breaks: (barber && barber.breaks) || [] };
}
// returns array of {from,to} minute-ranges that are OFF (outside shift) within [dayStart,dayEnd]
function offRanges(barber, dayStartMin, dayEndMin, dateStr) {
  const sched = dateStr ? daySched(barber, dateStr) : { active: barber.active !== false, start: barber.start || '09:00', end: barber.end || '18:00', breaks: barber.breaks || [] };
  const s = _toMin(sched.start), e = _toMin(sched.end);
  const out = [];
  if (!sched.active) { out.push({ from: dayStartMin, to: dayEndMin }); return out; }
  if (s > dayStartMin) out.push({ from: dayStartMin, to: s });
  if (e < dayEndMin) out.push({ from: e, to: dayEndMin });
  (sched.breaks || []).forEach(b => out.push({ from: _toMin(b.from), to: _toMin(b.to) }));
  return out;
}
// is [start,start+dur] free for this barber on `date`, given existing appts?
function slotFree(barber, date, startMin, durMin, appts, ignoreId) {
  const endMin = startMin + durMin;
  const sched = daySched(barber, date);
  if (!sched.active) return false;
  const s = _toMin(sched.start), e = _toMin(sched.end);
  if (startMin < s || endMin > e) return false;
  // not in a break?
  for (const b of (sched.breaks || [])) { if (startMin < _toMin(b.to) && endMin > _toMin(b.from)) return false; }
  // not overlapping another appointment?
  for (const a of appts) {
    if (a.barberId !== barber.id || a.date !== date || a.id === ignoreId) continue;
    if (a.status === 'rejected' || a.status === 'cancelled') continue; // freed slots don't block (no-show DOES stay in its slot, the time already passed)
    const as = _toMin(a.start), svc = (window.DATA.services.find(x => x.id === a.svc) || {}); const ad = svc.min || 45;
    if (startMin < as + ad && endMin > as) return false;
  }
  // Round F: a recurring series RESERVES its slot pattern indefinitely (beyond the
  // materialized window), so a regular client can never grab it - even with an unlimited
  // booking window. The recurring always "leads"; regulars fill in around it.
  if (slotReserved(barber.id, date, startMin, appts)) return false;
  return true;
}

// ── Round F · recurring reservations ──────────────────────────────────────
// Derive each ACTIVE recurring series' pattern (barber + time + cadence + anchor).
// A series is dead once auto-cancelled (Round C) or all occurrences are cancelled.
function recurringPatterns(appts) {
  const byRid = {};
  for (const a of (appts || [])) { if (a.recurringId) (byRid[a.recurringId] = byRid[a.recurringId] || []).push(a); }
  const pats = [];
  Object.keys(byRid).forEach(rid => {
    const series = byRid[rid];
    if (series.some(a => a._recurAutoCancel)) return;
    const live = series.filter(a => a.status !== 'cancelled' && a.status !== 'rejected');
    if (!live.length) return;
    const anchor = live.reduce((m, a) => (a.date < m.date ? a : m), live[0]);
    pats.push({ rid, barberId: anchor.barberId, startMin: _toMin(anchor.start), freq: anchor.recurringFreq || 'weekly', anchor: anchor.date });
  });
  return pats;
}
// does (barber,date,time) fall on an active recurring pattern? (ignoreRid skips one series)
function slotReserved(barberId, date, startMin, appts, ignoreRid) {
  const pats = recurringPatterns(appts);
  for (const p of pats) {
    if (p.rid === ignoreRid) continue;
    if (p.barberId !== barberId || p.startMin !== startMin) continue;
    if (date < p.anchor) continue;
    const d1 = new Date(p.anchor + 'T00:00'), d2 = new Date(date + 'T00:00');
    const diffDays = Math.round((d2 - d1) / 86400000);
    if (p.freq === 'weekly') { if (diffDays % 7 === 0) return true; }
    else if (p.freq === 'biweekly') { if (diffDays % 14 === 0) return true; }
    else if (p.freq === 'monthly') { if (d1.getDate() === d2.getDate()) return true; }
  }
  return false;
}
window.availHelpers = { offRanges, slotFree, daySched, dayException, toMin: _toMin, toHHMM: _toHHMM, slotReserved, recurringPatterns };

// ── Barber identity color (Round 13): Rafi picks a preferred color per barber in
//    staff settings (stored on the barber profile as `color`). Every calendar /
//    analytics view resolves through here; no pick → stable palette default by index.
function barberColor(barberId, staff) {
  const list = staff || window.DATA.barbers;
  const b = list.find(b => b.id === barberId) || null;
  if (b && b.color) return b.color;
  // Hash the barberId string → stable palette index regardless of array position.
  // Deleting a barber never shifts colours for the remaining ones.
  const hash = (barberId || '').split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0);
  return window.DATA.calColors[Math.abs(hash) % window.DATA.calColors.length];
}
window.barberColor = barberColor;

// Layer 2, how far ahead a client may book (manager-set, in weeks). Single source.
// 'unlimited' caps at 26 weeks (~6 months) - practically unbounded for a barbershop.
function bookWindowWeeks() {
  try { const b = JSON.parse(localStorage.getItem('royale_bizsettings_v1')); const w = b && b.bookWindowWeeks; if (w === 'unlimited') return 26; return (w && w > 0) ? w : 4; } catch (e) { return 4; }
}
window.bookWindowWeeks = bookWindowWeeks;
window.bookWindowDays = () => bookWindowWeeks() * 7;
window.bookWindowUnlimited = () => { try { const b = JSON.parse(localStorage.getItem('royale_bizsettings_v1')); return (b && b.bookWindowWeeks) === 'unlimited'; } catch (e) { return false; } };

// Round F · message-channel hierarchy. The in-app banner is the always-on base layer.
// On top of it sits ONE delivery channel: the client's own pick wins; if they never
// chose, the shop's default applies. Returns { banner:true, channel, source }.
function effectiveChannel(prefChannel) {
  let managerDefault = 'whatsapp';
  try { const b = JSON.parse(localStorage.getItem('royale_bizsettings_v1')); if (b && b.channel) managerDefault = b.channel; } catch (e) {}
  if (managerDefault === 'banner') managerDefault = 'whatsapp'; // banner is the base, not the 'extra' channel
  const picked = prefChannel && prefChannel !== 'banner' ? prefChannel : null;
  return { banner: true, channel: picked || managerDefault, source: picked ? 'client' : 'shop-default' };
}
window.effectiveChannel = effectiveChannel;

// Appointment approval is a SINGLE global switch (diagnostic fix #6): when ON every new
// booking is auto-confirmed; when OFF all bookings wait for manual approval. One source.
function autoConfirmOn() {
  try { const b = JSON.parse(localStorage.getItem('royale_bizsettings_v1')); return !b || b.autoConfirm !== false; } catch (e) { return true; }
}
window.autoConfirmOn = autoConfirmOn;

// ── Client identity resolver: the logged-in customer ('me') is read LIVE from the
//    shared profile, so a name change in their profile shows everywhere at once. ──
function clientLabel(appt, lang) {
  if (appt && appt.clientId === 'me' && window.__meName) return window.__meName;
  return appt ? (lang === 'he' ? appt.clientHe : appt.clientEn) || appt.clientHe || appt.clientEn || '' : '';
}
window.clientLabel = clientLabel;

// ── Round B · a customer's PRIMARY BARBER (CRM association) ───────────────
//   "Client OF a barber" = CRM link used for group messaging & identity. This is
//   a SEPARATE concept from "appointment WITH a barber" (a calendar event, see the
//   absence-coverage flow). Resolution priority:
//     1. manual override - set by the client in their profile, or by Rafi on the card
//     2. computed - the barber this client has visited the most (from the shared calendar)
//     3. seed fallback - the directory's original `fav`
//   Returns { id, source: 'manual' | 'computed' | 'seed', count } or null.
function primaryBarber(cust, appts) {
  if (!cust) return null;
  const id = cust.id;
  const ov = (id && window.custStore && window.custStore.primaryOverride) ? window.custStore.primaryOverride(id) : null;
  if (ov) return { id: ov, source: 'manual' };
  const hist = (appts || []).filter(a => a.barberId && a.status !== 'rejected' && a.status !== 'cancelled' &&
    ((a.clientId && a.clientId === id) || (cust.isMe && a.clientId === 'me') || a.clientHe === cust.he || a.clientEn === cust.en));
  if (hist.length) {
    const counts = {};
    hist.forEach(a => { counts[a.barberId] = (counts[a.barberId] || 0) + 1; });
    let bestId = null, bestN = -1;
    Object.keys(counts).forEach(bid => { if (counts[bid] > bestN) { bestN = counts[bid]; bestId = bid; } });
    if (bestId) return { id: bestId, source: 'computed', count: bestN };
  }
  if (cust.fav) return { id: cust.fav, source: 'seed' };
  return null;
}
window.primaryBarber = primaryBarber;


// ── Sound: subtle two-note chime, muted until a real user gesture ──
let _actx = null, _armed = false;
function armAudio() { if (_armed) return; try { _actx = new (window.AudioContext || window.webkitAudioContext)(); _armed = true; } catch (e) {} }
window.addEventListener('pointerdown', armAudio, { once: true });
window.addEventListener('keydown', armAudio, { once: true });
function playChime(enabled) {
  if (!enabled || !_actx) return;
  const t0 = _actx.currentTime;
  [ [880, 0], [1318.5, 0.12] ].forEach(([f, dt]) => {
    const o = _actx.createOscillator(), g = _actx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    o.connect(g); g.connect(_actx.destination);
    const t = t0 + dt;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.start(t); o.stop(t + 0.55);
  });
}

// ── Confetti: gold / navy / champagne burst on a canvas ──
function Confetti({ fire, colors, z = 60 }) {
  const ref = useRef(null), raf = useRef(0);
  useEffect(() => {
    if (!fire) return;
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width = cv.offsetWidth, H = cv.height = cv.offsetHeight;
    const palette = colors || ['#C8A24A', '#E4C97B', '#0B1E3D', '#FBF9F5', '#9C7B2E'];
    const N = 130;
    const parts = Array.from({ length: N }, () => {
      const ang = (Math.random() * Math.PI) - Math.PI / 2;     // upward-ish spread
      const sp = 6 + Math.random() * 11;
      return {
        x: W / 2 + (Math.random() - 0.5) * 60, y: H * 0.42,
        vx: Math.cos(ang) * sp * (Math.random() < .5 ? 1 : -1) * 0.7,
        vy: -Math.abs(Math.sin(ang) * sp) - 4 - Math.random() * 5,
        g: 0.28 + Math.random() * 0.12,
        w: 6 + Math.random() * 7, h: 9 + Math.random() * 9,
        rot: Math.random() * Math.PI, vr: (Math.random() - .5) * 0.4,
        c: palette[(Math.random() * palette.length) | 0],
        life: 0, max: 90 + Math.random() * 50,
      };
    });
    let frame = 0;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      parts.forEach(p => {
        if (p.life > p.max) return;
        alive = true;
        p.life++; p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vx *= 0.99;
        const a = Math.max(0, 1 - p.life / p.max);
        ctx.save(); ctx.globalAlpha = a; ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frame++;
      if (alive && frame < 240) raf.current = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [fire]);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: z }} />;
}

// ── Slide-in notification from the top ──
function Toast({ data, onClose, dir }) {
  useEffect(() => {
    if (!data) return;
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [data]);
  return (
    <div style={{
      position: 'absolute', top: 0, left: 12, right: 12, zIndex: 80,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      transform: data ? 'translateY(64px)' : 'translateY(-140%)',
      transition: 'transform .55s cubic-bezier(.16,1,.3,1)',
    }}>
      {data && (
        <div style={{
          pointerEvents: 'auto', width: '100%', maxWidth: 360,
          background: 'rgba(11,30,61,0.92)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          borderRadius: 20, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 18px 50px rgba(11,30,61,0.4)', border: '0.5px solid rgba(228,201,123,0.4)',
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="bell" size={20} color="#0B1E3D" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#FBF9F5', fontSize: 14, fontWeight: 600, lineHeight: 1.25 }}>{data.title}</div>
            <div style={{ color: 'rgba(251,249,245,0.72)', fontSize: 12.5, lineHeight: 1.3, marginTop: 2 }}>{data.body}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'rgba(251,249,245,0.6)' }}><Icon name="x" size={16} /></button>
        </div>
      )}
    </div>
  );
}

// ── Pulsing geolocation button ──
function GeoButton({ state, onClick, t, accent }) {
  // state: idle | locating | located
  const label = state === 'locating' ? t.locating : state === 'located' ? t.located : t.useLocation;
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
      background: state === 'located' ? 'rgba(200,162,74,0.12)' : 'rgba(11,30,61,0.04)',
      border: state === 'located' ? '1px solid rgba(200,162,74,0.5)' : '1px solid rgba(11,30,61,0.1)',
      borderRadius: 16, padding: '12px 14px', cursor: 'pointer', font: 'inherit',
      transition: 'all .3s ease', textAlign: 'start',
    }}>
      <span style={{ position: 'relative', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {state === 'locating' && <>
          <span className="geo-ping" style={{ borderColor: accent }} />
          <span className="geo-ping geo-ping-2" style={{ borderColor: accent }} />
        </>}
        <Icon name="pin" size={22} color={state === 'idle' ? '#0B1E3D' : accent} fill={state === 'located' ? 'solid' : 'none'} />
      </span>
      <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: '#0B1E3D' }}>{label}</span>
      {state !== 'locating' && <Icon name="chevron" size={16} color="rgba(11,30,61,0.35)" style={{ transform: 'var(--chev)' }} />}
    </button>
  );
}

// ── Avatar with initials (gold ring) ──
const TONES = [
  ['#13325c', '#1d4a86'], ['#244a2e', '#386b46'], ['#5a3a1e', '#86592f'], ['#3a2a4a', '#5b4274'],
];
function Avatar({ b, size = 52, ring = true, lang }) {
  const [a, c] = TONES[b.tone] || TONES[0];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(140deg, ${a}, ${c})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#FBF9F5', fontWeight: 600, fontSize: size * 0.36, letterSpacing: 0.5,
      boxShadow: ring ? '0 0 0 2px #fff, 0 0 0 3.5px rgba(200,162,74,0.85)' : 'none',
      fontFamily: 'Assistant, sans-serif',
    }}>{b.initials}</div>
  );
}

function Stars({ rating, size = 13, count }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Icon name="star" size={size} color="#C8A24A" />
      <span style={{ fontWeight: 700, fontSize: size, color: '#0B1E3D' }}>{rating}</span>
      {count != null && <span style={{ fontSize: size - 1, color: 'rgba(11,30,61,0.45)' }}>({count})</span>}
    </span>
  );
}

function Money({ v, size = 15, color = '#0B1E3D', weight = 700 }) {
  return <span style={{ fontWeight: weight, fontSize: size, color, fontFamily: 'Assistant, sans-serif', direction: 'ltr', unicodeBidi: 'isolate' }}>₪{v}</span>;
}

// ── Primary / secondary button ──
function Btn({ children, onClick, kind = 'primary', disabled, icon, style }) {
  const base = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', padding: '15px 20px', borderRadius: 16, cursor: disabled ? 'not-allowed' : 'pointer',
    font: 'inherit', fontSize: 16, fontWeight: 600, border: 'none', transition: 'transform .12s, opacity .2s, box-shadow .2s',
    opacity: disabled ? 0.4 : 1, letterSpacing: 0.2,
  };
  const kinds = {
    primary: { background: 'linear-gradient(135deg, #14305A, #0B1E3D)', color: '#FBF9F5', boxShadow: '0 10px 24px rgba(11,30,61,0.28)' },
    gold: { background: 'linear-gradient(135deg, #E4C97B, #C8A24A)', color: '#0B1E3D', boxShadow: '0 10px 24px rgba(200,162,74,0.34)' },
    ghost: { background: 'transparent', color: '#0B1E3D', boxShadow: 'inset 0 0 0 1.5px rgba(11,30,61,0.16)' },
  };
  return (
    <button disabled={disabled} onClick={onClick}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(0.975)')}
      onMouseUp={e => (e.currentTarget.style.transform = '')}
      onMouseLeave={e => (e.currentTarget.style.transform = '')}
      style={{ ...base, ...kinds[kind], ...style }}>
      {icon && <Icon name={icon} size={19} />}{children}
    </button>
  );
}

// ── Striped photo placeholder ──
function PhotoSlot({ label, h = 150, r = 22, style }) {
  return (
    <div style={{
      height: h, borderRadius: r, position: 'relative', overflow: 'hidden',
      background: 'repeating-linear-gradient(135deg, #ECE7DC, #ECE7DC 11px, #E4DDCE 11px, #E4DDCE 22px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', ...style,
    }}>
      <span style={{ margin: 10, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 10.5, letterSpacing: 0.4, color: 'rgba(11,30,61,0.5)', background: 'rgba(251,249,245,0.7)', padding: '3px 7px', borderRadius: 6 }}>{label}</span>
    </div>
  );
}

// ── Brand mark (typographic ROYALE logo, replace with real logo art) ──
function BrandMark({ lang, onDark = false, size = 40, stack = false }) {
  const gold = '#C8A24A', goldL = '#E4C97B';
  const txt = onDark ? '#FBF9F5' : '#0B1E3D';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: stack ? 'column' : 'row' }}>
      <div style={{
        width: size, height: size, borderRadius: '50%', position: 'relative', flexShrink: 0,
        background: onDark ? 'rgba(228,201,123,0.10)' : 'linear-gradient(140deg,#14305A,#0B1E3D)',
        border: `1.5px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: onDark ? 'none' : '0 6px 16px rgba(11,30,61,0.22)',
      }}>
        <span style={{ fontFamily: "'Frank Ruhl Libre', 'Fraunces', serif", fontWeight: 700, fontSize: size * 0.46, color: goldL, lineHeight: 1 }}>{lang === 'he' ? 'מ' : 'B'}</span>
        <span style={{ position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)', width: size * 0.34, height: 2.5, borderRadius: 2, background: `linear-gradient(90deg,${goldL},${gold})` }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: stack ? 'center' : 'flex-start', lineHeight: 1 }}>
        <span style={{ fontFamily: lang === 'he' ? "'Frank Ruhl Libre', serif" : "'Fraunces', serif", fontWeight: 700, fontSize: size * (lang === 'he' ? 0.46 : 0.5), letterSpacing: lang === 'he' ? 1 : 4, color: txt }}>{lang === 'he' ? 'מספרפי' : 'BARBER SHOP'}</span>
        <span style={{ fontSize: Math.max(8.5, size * 0.2), letterSpacing: 1.6, color: gold, marginTop: 5, fontWeight: 600 }}>
          {lang === 'he' ? 'אומני התספורת · 2001' : 'MASTER BARBERS · 2001'}
        </span>
      </div>
    </div>
  );
}

// ── Asset path resolver: in the regular project this is identity; the standalone
//    single-file export defines window.__res to map paths → inlined blob URLs. ──
const _asset = (p) => (window.__res ? window.__res(p) : p);
window._asset = _asset;

// ── User-fillable image slot wrapper ──
function ImgSlot({ id, w, h, shape = 'rounded', radius = 18, placeholder, fit = 'cover', readonly, tapEdit, replaceLabel, removeLabel, src, style }) {
  const props = {
    id, shape, fit, radius: String(radius), placeholder,
    style: { display: 'block', width: w || '100%', height: h || '100%', ...style },
  };
  if (readonly) props.readonly = '';
  if (tapEdit) props.tapcontrols = '';
  if (replaceLabel) props.replacelabel = replaceLabel;
  if (removeLabel) props.removelabel = removeLabel;
  if (src) props.src = _asset(src);
  return React.createElement('image-slot', props);
}

// ── resolve a barber's (possibly manager-edited) tagline ──
function tagOf(b, taglines, lang) {
  const o = taglines && taglines[b.id];
  return (o && o[lang]) || (lang === 'he' ? b.tagHe : b.tagEn);
}

// ── Real brand assets (line art on white → multiply drops the white on light bg) ──
function LogoWide({ height = 44, style }) {
  return <img src={_asset('assets/logo-wide.jpg')} alt="מספרפי Barber Shop" style={{ height, width: 'auto', maxWidth: '72%', objectFit: 'contain', display: 'block', mixBlendMode: 'multiply', ...style }} />;
}
function Emblem({ size = 120, blend = true, style }) {
  return <img src={_asset('assets/emblem.jpg')} alt="" style={{ width: size, height: size, objectFit: 'contain', display: 'block', mixBlendMode: blend ? 'multiply' : 'normal', ...style }} />;
}

// ── Brand tokens mirrored as JS (design tokens; CSS vars in <style> are the twin) ──
const BRAND = {
  navy: '#0B1E3D', navy700: '#14305A',
  gold: '#C8A24A', goldLight: '#E4C97B', goldDeep: '#9C7B2E',
  paper: '#FBF9F5', creamBg: '#F6EEDF', creamCard: '#FBF5EA', creamLine: '#E7DABE',
};
// heading face: Suez One (heavy, echoes the מספרפי logo letters) for Hebrew;
// the chosen EN serif otherwise. One helper → consistent headings everywhere.
function displayFont(lang, serif) {
  return lang === 'he' ? "'Suez One', 'Frank Ruhl Libre', serif" : (serif || "'Fraunces', serif");
}

// ── Medallion: the ONE reusable gold-framed round badge.
//    Same component frames the logo on the splash AND every barber portrait,
//    so the "classic tag" language stays identical across touchpoints. ──
function Medallion({ size = 120, frame, halo = false, bg = '#fff', children, style }) {
  const fr = frame != null ? frame : Math.max(3, size * 0.055);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      {halo && <span className="medallion-halo" style={{ width: size * 1.85, height: size * 1.85 }} />}
      <div style={{
        position: 'relative', width: size, height: size, borderRadius: '50%', padding: fr,
        background: 'linear-gradient(145deg, #EFDCA0 0%, #C8A24A 50%, #9C7B2E 100%)',
        boxShadow: '0 10px 26px rgba(11,30,61,0.26), inset 0 1px 1px rgba(255,255,255,0.65)',
      }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.55)',
        }}>{children}</div>
      </div>
    </div>
  );
}

// barber badge, initials on a tone disc by default; pass photo to drop a real
// portrait (medallion-framed, like a classic shop tag)
function BarberMedallion({ b, size = 52, lang, photo = false }) {
  const [a, c] = TONES[b.tone] || TONES[0];
  return (
    <Medallion size={size} bg={BRAND.navy}>
      {photo
        ? <ImgSlot id={'barber-' + b.id} shape="circle" radius={size} placeholder={b.initials} style={{ width: '100%', height: '100%' }} />
        : <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: `linear-gradient(140deg, ${a}, ${c})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FBF9F5', fontWeight: 600, fontSize: size * 0.34, letterSpacing: 0.5, fontFamily: 'Assistant, sans-serif' }}>{b.initials}</div>}
    </Medallion>
  );
}

// ── Section header with measured vintage: gold ✦ + heavy display title + thin
//    gold rule. Brand touchpoints only, keep it OUT of operational screens. ──
function SectionHeading({ children, lang, serif, accent, action, onAction, style }) {
  const gold = accent || BRAND.gold;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14, ...style }}>
      <span style={{ color: gold, fontSize: 13, lineHeight: 1, flexShrink: 0, transform: 'translateY(-1px)' }}>✦</span>
      <span style={{ fontFamily: displayFont(lang, serif), fontWeight: lang === 'he' ? 400 : 700, fontSize: 18, color: BRAND.navy, lineHeight: 1.1, flexShrink: 0, letterSpacing: lang === 'he' ? 0 : 0.2 }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${gold}66, ${gold}14 70%, transparent)` }} />
      {action && <span onClick={onAction} style={{ fontSize: 13, fontWeight: 600, color: gold, cursor: 'pointer', flexShrink: 0 }}>{action}</span>}
    </div>
  );
}

Object.assign(window, { playChime, Confetti, Toast, GeoButton, Avatar, Stars, Money, Btn, PhotoSlot, BrandMark, ImgSlot, tagOf, LogoWide, Emblem, BRAND, displayFont, Medallion, BarberMedallion, SectionHeading });
