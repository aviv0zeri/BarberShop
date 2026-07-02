// screens2.jsx, Round 2 NEW screens (existing screens untouched)
// AdminDashboard · Broadcast · SMSVerification · StaffManagement · TimeToLeave
// Exports: NewScreen (router) + the launcher metadata NEW_SCREENS

const { useState: useS2, useEffect: useE2, useRef: useR2 } = React;

// shared header for the new screens (back chevron + eyebrow + title)
function ScreenHead({ lang, t, accent, serif, eyebrow, title, onBack, right }) {
  return (
    <div style={{ padding: '54px 18px 14px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
      {onBack && <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
        <Icon name={lang === 'he' ? 'arrowR' : 'arrowL'} size={20} color="#0B1E3D" />
      </button>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {eyebrow && <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: accent, textTransform: 'uppercase', marginBottom: 3 }}>{eyebrow}</div>}
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: '#0B1E3D', lineHeight: 1.1 }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

const Shell = ({ children }) => (
  <div style={{ position: 'absolute', inset: 0, background: '#FBF9F5', zIndex: 90, display: 'flex', flexDirection: 'column' }}>{children}</div>
);
const Body = ({ children, style }) => (
  <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 28px', display: 'flex', flexDirection: 'column', gap: 14, ...style }}>{children}</div>
);

// ─────────────────────────────────────────────────────────────
// 1 · ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────

// Owner toggle: Rafi is both the manager AND a working barber.
function OwnerModeToggle({ mode, setMode, lang }) {
  const he = lang === 'he';
  const opts = [
    { id: 'manage', icon: 'chart', label: he ? 'ניהול' : 'Manage' },
    { id: 'myday', icon: 'scissors', label: he ? 'היומן שלי' : 'My calendar' },
  ];
  return (
    <div style={{ display: 'flex', gap: 4, background: 'linear-gradient(140deg,#14305A,#0B1E3D)', padding: 4, borderRadius: 14, boxShadow: '0 6px 18px rgba(11,30,61,0.2)' }}>
      {opts.map(o => {
        const on = mode === o.id;
        return (
          <button key={o.id} onClick={() => setMode(o.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 8px', borderRadius: 10, border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 13.5, fontWeight: 700, transition: 'all .28s cubic-bezier(.2,1,.3,1)', background: on ? 'linear-gradient(135deg,#E4C97B,#C8A24A)' : 'transparent', color: on ? '#0B1E3D' : 'rgba(251,249,245,0.7)', boxShadow: on ? '0 4px 12px rgba(200,162,74,0.32)' : 'none' }}>
            <Icon name={o.icon} size={16} color={on ? '#0B1E3D' : 'rgba(251,249,245,0.7)'} stroke={2} />{o.label}
          </button>
        );
      })}
    </div>
  );
}

// One core metric, a decision tool, not a dry number. Built as a swappable unit
// (see METRICS config in AdminDashboard) so the owner can trade one out after feedback.
function CoreMetric({ tone, icon, label, value, sub, onClick, accent, serif, wide, he, i }) {
  const tones = {
    gold: { bg: 'linear-gradient(140deg,#E4C97B,#C8A24A)', fg: '#0B1E3D', ic: 'rgba(11,30,61,0.16)', icc: '#0B1E3D', subc: 'rgba(11,30,61,0.62)', arrowBg: 'rgba(11,30,61,0.1)' },
    navy: { bg: 'linear-gradient(140deg,#14305A,#0B1E3D)', fg: '#FBF9F5', ic: 'rgba(228,201,123,0.16)', icc: '#E4C97B', subc: 'rgba(251,249,245,0.62)', arrowBg: 'rgba(255,255,255,0.1)' },
    plain: { bg: '#fff', fg: '#0B1E3D', ic: 'rgba(200,162,74,0.12)', icc: accent, subc: 'rgba(11,30,61,0.5)', arrowBg: 'rgba(11,30,61,0.05)' },
    alert: { bg: '#fff', fg: '#B0413A', ic: 'rgba(176,65,58,0.12)', icc: '#B0413A', subc: '#B0413A', arrowBg: 'rgba(176,65,58,0.1)', border: '1.5px solid rgba(176,65,58,0.32)' },
  }[tone];
  const flat = tone === 'plain' || tone === 'alert';
  return (
    <button onClick={onClick} className="s2-rise tapsq" style={{ animationDelay: (i * 70) + 'ms', flex: wide ? 'none' : 1, width: wide ? '100%' : 'auto', minWidth: 0, textAlign: 'start', font: 'inherit', cursor: 'pointer', background: tones.bg, border: tones.border || (tone === 'plain' ? '1px solid rgba(11,30,61,0.05)' : 'none'), borderRadius: 20, padding: 16, boxShadow: flat ? '0 3px 12px rgba(11,30,61,0.05)' : '0 10px 24px rgba(11,30,61,0.18)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: wide ? 13 : 11 }}>
        <span style={{ width: 36, height: 36, borderRadius: 11, background: tones.ic, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={19} color={tones.icc} /></span>
        <span style={{ width: 26, height: 26, borderRadius: 9, background: tones.arrowBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={he ? 'arrowL' : 'arrowR'} size={15} color={tones.fg} /></span>
      </div>
      <div style={{ display: wide ? 'flex' : 'block', alignItems: 'baseline', gap: 12 }}>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: wide ? 36 : 27, color: tones.fg, lineHeight: 1, direction: 'ltr', textAlign: 'start' }}>{value}</div>
        <div style={{ fontSize: wide ? 14 : 12.5, color: tones.fg, opacity: flat ? 0.82 : 0.9, marginTop: wide ? 0 : 6, fontWeight: 600 }}>{label}</div>
      </div>
      {sub && <div style={{ fontSize: 11.5, marginTop: 6, fontWeight: 700, color: tones.subc, display: 'flex', alignItems: 'center', gap: 5 }}>{sub}</div>}
    </button>
  );
}

// Round 15: "תורים היום" tile, one concentrated number with the same yesterday/today/
// tomorrow arrow-paging the barber dashboard uses (Round 11). Arrows flip the day in
// place; tapping the tile itself opens the full calendar on that day.
function TodayApptsMetric({ appts, serif, he, go, i }) {
  const [off, setOff] = React.useState(0); // -1 · 0 · +1
  const pad = n => String(n).padStart(2, '0');
  const dateK = (() => { const d = new Date(); d.setDate(d.getDate() + off); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })();
  const count = (appts || []).filter(a => a.date === dateK && a.status !== 'cancelled' && a.status !== 'rejected').length;
  const label = off === 0 ? (he ? 'תורים היום' : 'Bookings today') : off === 1 ? (he ? 'תורים מחר' : 'Bookings tomorrow') : (he ? 'תורים אתמול' : 'Bookings yesterday');
  const arrow = (delta, icon) => {
    const off2 = off + delta; const ok = off2 >= -1 && off2 <= 1;
    return (
      <span role="button" aria-disabled={!ok} onClick={e => { e.stopPropagation(); if (ok) setOff(off2); }}
        style={{ width: 28, height: 28, borderRadius: 9, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: ok ? 'pointer' : 'default', opacity: ok ? 1 : 0.3 }}>
        <Icon name={icon} size={15} color="#FBF9F5" />
      </span>
    );
  };
  return (
    <button onClick={() => go('calday:' + off)} className="s2-rise tapsq" style={{ animationDelay: (i * 70) + 'ms', flex: 1, minWidth: 0, textAlign: 'start', font: 'inherit', cursor: 'pointer', background: 'linear-gradient(140deg,#14305A,#0B1E3D)', border: 'none', borderRadius: 20, padding: 16, boxShadow: '0 10px 24px rgba(11,30,61,0.18)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
        <span style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(228,201,123,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="calendar" size={19} color="#E4C97B" /></span>
        <span style={{ display: 'flex', gap: 5 }}>
          {arrow(-1, he ? 'chevronR' : 'chevron')}
          {arrow(1, he ? 'chevron' : 'chevronR')}
        </span>
      </div>
      <div key={off} className="cal-fade" style={{ fontFamily: serif, fontWeight: 700, fontSize: 27, color: '#FBF9F5', lineHeight: 1, direction: 'ltr', textAlign: 'start' }}>{count}</div>
      <div style={{ fontSize: 12.5, color: '#FBF9F5', opacity: 0.9, marginTop: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 11.5, marginTop: 6, fontWeight: 700, color: 'rgba(251,249,245,0.62)', display: 'flex', alignItems: 'center', gap: 5 }}><Icon name={he ? 'arrowL' : 'arrowR'} size={13} color="rgba(251,249,245,0.62)" />{he ? 'לחיצה ליומן המלא' : 'tap for the full calendar'}</div>
    </button>
  );
}

// Team-adoption signal: tells Rafi whether the dashboard reflects the whole shop.
function AdoptionCard({ staff, accent, serif, he, onClick }) {
  const list = staff || DATA.barbers;
  const total = list.length;
  const active = list.filter(b => b.active !== false).length;
  return (
    <button onClick={onClick} className="tapsq" style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: '#fff', border: '1px solid rgba(11,30,61,0.06)', borderRadius: 16, padding: '13px 15px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
      <span style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,rgba(228,201,123,0.22),rgba(200,162,74,0.16))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="users" size={21} color={accent} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0B1E3D' }}>
          <span style={{ fontFamily: serif }}>{active}</span> <span style={{ color: 'rgba(11,30,61,0.45)', fontWeight: 600, fontSize: 13 }}>{he ? 'מתוך' : 'of'}</span> <span style={{ fontFamily: serif }}>{total}</span> {he ? 'ספרים פעילים' : 'barbers active'}
        </div>
        <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 2 }}>{he ? 'כך תדע שהתמונה שאתה רואה מלאה' : 'so you know the picture is complete'}</div>
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        {list.map(b => <span key={b.id} style={{ width: 8, height: 8, borderRadius: 4, background: b.active !== false ? '#2E7D52' : 'rgba(11,30,61,0.18)' }} />)}
      </div>
    </button>
  );
}

// Trend layer, the depth that lives BELOW the surface. In the first month
// (no history yet) we don't fake an empty chart; we say so gently and surface
// what's already available.
function TrendTeaser({ firstMonth, he, accent, serif, onMore, moneyToday }) {
  if (firstMonth) {
    return (
      <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: '0 3px 12px rgba(11,30,61,0.05)', border: '1px dashed rgba(11,30,61,0.16)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
          <span style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(200,162,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="spark" size={19} color={accent} /></span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: '#0B1E3D' }}>{he ? 'אוספים נתונים' : 'Collecting data'}</div>
            <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{he ? 'המגמות יופיעו כאן בקרוב' : 'Trends will appear here soon'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 44, opacity: 0.5, marginBottom: 12 }}>
          {[40, 55, 35, 60, 48, 70, 52].map((h, i) => <div key={i} style={{ flex: 1, height: h + '%', borderRadius: '5px 5px 0 0', background: 'repeating-linear-gradient(45deg,rgba(11,30,61,0.09),rgba(11,30,61,0.09) 4px,rgba(11,30,61,0.04) 4px,rgba(11,30,61,0.04) 8px)' }} />)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(200,162,74,0.09)', borderRadius: 12, padding: '11px 13px' }}>
          <span style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.6)', fontWeight: 600 }}>{he ? 'מה שכבר זמין · הכנסת היום' : "Available now · today's revenue"}</span>
          <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 18, color: accent, direction: 'ltr' }}>{'₪' + moneyToday.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  const bars = [62, 48, 70, 55, 80, 72, 90];
  return (
    <button onClick={onMore} className="tapsq" style={{ width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: '#fff', borderRadius: 18, padding: 16, boxShadow: '0 3px 12px rgba(11,30,61,0.05)', border: '1px solid rgba(11,30,61,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
        <span style={{ fontWeight: 700, fontSize: 14.5, color: '#0B1E3D' }}>{he ? 'מגמת השבוע' : 'This week'}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 700, color: accent }}>{he ? 'עוד נתונים' : 'More data'}<Icon name={he ? 'arrowL' : 'arrowR'} size={15} color={accent} /></span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 50 }}>
        {bars.map((h, i) => <div key={i} style={{ flex: 1, height: h + '%', borderRadius: '5px 5px 0 0', background: i === bars.length - 1 ? `linear-gradient(180deg,#E4C97B,${accent})` : 'rgba(11,30,61,0.1)' }} />)}
      </div>
    </button>
  );
}

// Round G1 · two-layer money tile: TURNOVER (gross, what barbers brought in) on top,
// NET PROFIT (after each barber's deal) below. Both always visible to the manager.
function MoneyTile({ turnover, profit, bookings, he, serif, onClick, i }) {
  return (
    <button onClick={onClick} className="s2-rise tapsq" style={{ animationDelay: (i * 70) + 'ms', width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: 'linear-gradient(140deg,#E4C97B,#C8A24A)', border: 'none', borderRadius: 20, padding: 16, boxShadow: '0 10px 24px rgba(11,30,61,0.18)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
        <span style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(11,30,61,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="coin" size={19} color="#0B1E3D" /></span>
        <span style={{ width: 26, height: 26, borderRadius: 9, background: 'rgba(11,30,61,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={he ? 'arrowL' : 'arrowR'} size={15} color="#0B1E3D" /></span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 36, color: '#0B1E3D', lineHeight: 1, direction: 'ltr' }}>{'₪' + turnover.toLocaleString()}</div>
        <div style={{ fontSize: 14, color: '#0B1E3D', opacity: 0.82, fontWeight: 600 }}>{he ? 'מחזור היום' : 'Turnover today'}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 13, paddingTop: 12, borderTop: '1px solid rgba(11,30,61,0.16)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#14305A,#0B1E3D)', borderRadius: 11, padding: '7px 11px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(251,249,245,0.7)' }}>{he ? 'רווח נטו' : 'Net profit'}</span>
          <span style={{ fontFamily: serif, fontWeight: 800, fontSize: 18, color: '#E4C97B', direction: 'ltr' }}>{'₪' + profit.toLocaleString()}</span>
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(11,30,61,0.6)', display: 'flex', alignItems: 'center', gap: 5 }}>{he ? `${bookings} תורים · לפירוט` : `${bookings} bookings · tap`}<Icon name={he ? 'arrowL' : 'arrowR'} size={13} color="rgba(11,30,61,0.6)" /></span>
      </div>
    </button>
  );
}

function AdminDashboard({ lang, t, accent, serif, onBack, go, staff, appts, firstMonth, modeSwitch, approveAppt, rejectAppt, notifyBarbers, toast }) {
  const he = lang === 'he';
  const list = staff || DATA.barbers;
  // Round 13: approval belongs to the appointment's barber. Rafi-as-barber gets
  // approve/decline ONLY for his own chair; everyone else's requests appear below
  // in the read-only system panel. (notifyBarbers still gates the live banner.)
  const pendingReqs = (window.pendingFor ? window.pendingFor(appts, { meId: 'rafi' }) : []);
  const apAprove = (id) => { approveAppt && approveAppt(id); toast && toast(he ? 'התור אושר ✓' : 'Approved ✓', he ? 'נשלח אישור ללקוח' : 'Client notified'); };
  const apReject = (id, msg) => { rejectAppt && rejectAppt(id, msg); toast && toast(he ? 'הבקשה נדחתה' : 'Declined', he ? 'נשלחה הודעה ללקוח' : 'Client notified'); };

  // ── derive the three core numbers from live appointment data ──
  const pad = n => String(n).padStart(2, '0');
  const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const base = new Date(); base.setHours(0, 0, 0, 0);
  const todayK = fmt(base);
  const tomK = (() => { const d = new Date(base); d.setDate(base.getDate() + 1); return fmt(d); })();
  const priceOf = id => (DATA.services.find(s => s.id === id)?.price || 0);
  const all = appts || [];
  const todays = all.filter(a => a.date === todayK);
  const _live = a => a.status !== 'no' && a.status !== 'cancelled' && a.status !== 'rejected';
  const moneyToday = todays.filter(_live).reduce((n, a) => n + priceOf(a.svc), 0);
  // Round G1: net profit = turnover after each barber's deal. Owner (Rafi) = 100%.
  const barberById = id => list.find(b => b.id === id);
  const profitToday = todays.filter(_live).reduce((n, a) => n + (window.netProfit ? window.netProfit(priceOf(a.svc), barberById(a.barberId)) : priceOf(a.svc)), 0);
  const tomCount = all.filter(a => a.date === tomK).length;
  const noShows = todays.filter(a => a.status === 'no');
  // Round C: recurring no-shows get a separate, more urgent alert - "לקוח קבוע לא הגיע"
  const recurNoShowsToday = noShows.filter(a => a.recurringId);
  // also compute series-level consecutive no-show count (across all history, not just today)
  const _consecNoShows = (rid) => {
    const hist = (appts || []).filter(a => a.recurringId === rid && (a.status === 'no' || a.status === 'done')).sort((a, b) => b.date.localeCompare(a.date));
    let n = 0; for (const a of hist) { if (a.status === 'no') n++; else break; } return n;
  };

  // ── METRICS: each is a self-contained, swappable unit. Reorder/replace freely.
  //    (the "תורים היום" tile is its own unit, TodayApptsMetric, with day-paging arrows) ──
  const METRICS = [
    { id: 'noshow', tone: noShows.length && !recurNoShowsToday.length ? 'alert' : noShows.length ? 'navy' : 'plain', icon: 'bell',
      label: he ? 'אי-הגעות' : 'No-shows',
      value: String(noShows.length),
      sub: noShows.length
        ? <span><Icon name="phone" size={13} color="#B0413A" />{he ? 'מי לא הגיע · צרו קשר' : 'who missed · follow up'}</span>
        : (he ? 'כל הלקוחות הגיעו' : 'everyone showed up'),
      onClick: () => go('noshows') },
  ];
  const rest = METRICS.filter(m => m.id !== 'money');

  const weekly = [
    { id: 'calendar', icon: 'calendar', label: he ? 'יומן מתקדם' : 'Calendar', sub: he ? 'יום · שבוע · חודש' : 'Day · week · month' },
    { id: 'staff', icon: 'scissors', label: he ? 'ניהול צוות' : 'Manage staff', sub: list.length + (he ? ' ספרים' : ' barbers') },
    { id: 'customers', icon: 'users', label: he ? 'לקוחות' : 'Customers', sub: he ? 'רשימה, חיפוש וקשר' : 'List, search & contact' },
  ];
  const occasional = [
    { id: 'products', icon: 'bag', label: he ? 'ניהול מוצרים' : 'Products', sub: he ? 'חנות ומלאי' : 'Shop & stock' },
    { id: 'broadcast', icon: 'megaphone', label: he ? 'שליחת הודעה' : 'Broadcast', sub: he ? 'פרסום ללקוחות' : 'Marketing' },
    { id: 'services', icon: 'scissors', label: he ? 'סוגי שירותים' : 'Service types', sub: he ? 'מחירון' : 'Price list' },
    { id: 'notifsettings', icon: 'bell', label: he ? 'התראות בקשות' : 'Request alerts', sub: he ? 'לכל ספר' : 'Per barber' },
    { id: 'dormant', icon: 'users', label: he ? 'לקוחות רדומים' : 'Dormant clients', sub: he ? 'מתגעגעים' : 'We-miss-you' },
    { id: 'regulars', icon: 'refresh', label: he ? 'תורים חוזרים' : 'Recurring', sub: he ? 'לקוחות קבועים' : 'Regulars' },
    { id: 'punchcards', icon: 'card', label: he ? 'כרטיסיות' : 'Punch cards', sub: he ? 'יתרות והכנסות' : 'Balances & revenue' },
    { id: 'expenses', icon: 'coin', label: he ? 'הוצאות' : 'Expenses', sub: he ? 'קבועות וחד-פעמיות' : 'Fixed & one-time' },
    { id: 'gallery', icon: 'image', label: he ? 'גלריה' : 'Gallery', sub: he ? 'מקור התמונות של האפליקציה' : 'The app’s image source' },
    { id: 'documents', icon: 'file', label: he ? 'טפסים ומסמכים' : 'Forms & documents', sub: he ? 'לשליחה מכרטיס לקוח' : 'Send from client cards' },
    { id: 'settings', icon: 'gear', label: he ? 'הגדרות' : 'Settings', sub: he ? 'מערכת' : 'System' },
  ];
  const activity = he
    ? [['נועם פלד קבע תספורת וזקן', 'לפני 4 דק׳'], ['ביטול: גיא אדרי', 'לפני 22 דק׳'], ['דור שמש קבע גילוח חם', 'לפני 41 דק׳']]
    : [['Noam booked Cut & Beard', '4m ago'], ['Cancelled: Guy Edri', '22m ago'], ['Dor booked Hot Shave', '41m ago']];
  const Tier = ({ label }) => <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6, color: 'rgba(11,30,61,0.4)', textTransform: 'uppercase', margin: '4px 2px 0' }}>{label}</div>;
  const Row = ({ a, k, big }) => (
    <button key={a.id} onClick={() => go(a.id)} className="s2-rise tapsq" style={{ animationDelay: (200 + k * 50) + 'ms', display: 'flex', alignItems: 'center', gap: 13, background: '#fff', border: '1px solid rgba(11,30,61,0.06)', borderRadius: 16, padding: big ? '15px 15px' : '12px 14px', cursor: 'pointer', font: 'inherit', boxShadow: '0 2px 8px rgba(11,30,61,0.04)', textAlign: 'start', width: '100%' }}>
      <span style={{ width: big ? 44 : 38, height: big ? 44 : 38, borderRadius: 12, background: 'linear-gradient(135deg,rgba(228,201,123,0.22),rgba(200,162,74,0.16))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={a.icon} size={big ? 22 : 19} color={accent} /></span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: big ? 15.5 : 14.5, color: '#0B1E3D' }}>{a.label}</div>
        <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{a.sub}</div>
      </div>
      <Icon name={lang === 'he' ? 'chevron' : 'chevronR'} size={17} color="rgba(11,30,61,0.3)" />
    </button>
  );
  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מספרפי · מנהל' : 'Barbershop · Admin'} title={he ? 'לוח בקרה' : 'Dashboard'} onBack={onBack}
        right={<div style={{ textAlign: 'center', minWidth: 46 }}><div style={{ fontFamily: serif, fontWeight: 700, fontSize: 17, color: '#0B1E3D', direction: 'ltr' }}>{base.getDate()} {base.toLocaleDateString('en-US', { month: 'short' })}</div><div style={{ fontSize: 10.5, color: accent, fontWeight: 600 }}>{base.toLocaleDateString(he ? 'he-IL' : 'en-US', { weekday: 'short' })}</div></div>} />
      <Body>
        {/* owner ↔ barber switch */}
        {modeSwitch}

        {/* Rafi-as-barber: requests for HIS chair only, he approves these */}
        <PendingList lang={lang} accent={accent} serif={serif} requests={pendingReqs} staff={list} onApprove={apAprove} onReject={apReject} />

        {/* Rafi-as-manager: every open request in the system, awareness only, no actions */}
        {window.SystemRequestsPanel && <SystemRequestsPanel lang={lang} accent={accent} serif={serif} appts={appts} staff={list} />}

        {/* TIER 1, three core decision metrics */}
        <Tier label={he ? 'מבט מהיר · כל יום' : 'Quick glance · every day'} />
        <MoneyTile turnover={moneyToday} profit={profitToday} bookings={todays.length} he={he} serif={serif} onClick={() => go('insights')} i={0} />
        <div style={{ display: 'flex', gap: 10 }}>
          <TodayApptsMetric appts={appts} serif={serif} he={he} go={go} i={1} />
          {rest.map((m, k) => <CoreMetric key={m.id} {...m} accent={accent} serif={serif} he={he} i={k + 2} />)}
        </div>

        {/* team adoption signal */}
        <AdoptionCard staff={list} accent={accent} serif={serif} he={he} onClick={() => go('staff')} />

        {/* depth, below the surface */}
        <TrendTeaser firstMonth={firstMonth} he={he} accent={accent} serif={serif} moneyToday={moneyToday} onMore={() => go('trends')} />

        {/* Round H2: proactive social-marketing opportunity (real-data driven, dismissible) */}
        {window.MarketingNudgeCard && <MarketingNudgeCard lang={lang} accent={accent} serif={serif} appts={appts} staff={list} go={go} />}

        {/* Round C: recurring no-show alert - amber card, visually distinct from red no-show metric */}
        {recurNoShowsToday.length > 0 && (
          <div style={{ background: 'linear-gradient(135deg,#7A3B0E,#5C2B08)', borderRadius: 18, padding: '14px 16px', boxShadow: '0 10px 28px rgba(122,59,14,0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="refresh" size={19} color="#FFC97B" /></span>
              <div>
                <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 17, color: '#FFC97B', lineHeight: 1.1 }}>{he ? 'לקוח קבוע לא הגיע' : 'Regular client missed'}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,201,123,0.7)', marginTop: 2 }}>{he ? 'תור קבוע · שונה מאי-הגעה רגילה' : 'Recurring slot · different from a regular no-show'}</div>
              </div>
            </div>
            {recurNoShowsToday.map(a => {
              const cn = window.clientLabel ? window.clientLabel(a, lang) : nm({ he: a.clientHe, en: a.clientEn });
              const consec = _consecNoShows(a.recurringId);
              const freqLbl = { weekly: he ? 'שבועי' : 'weekly', biweekly: he ? 'כל שבועיים' : 'biweekly', monthly: he ? 'חודשי' : 'monthly' }[a.recurringFreq] || (he ? 'קבוע' : 'recurring');
              return (
                <div key={a.id} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 12px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#FFF8F0' }}>{cn}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,248,240,0.65)', marginTop: 2 }}>{freqLbl} · <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{a.start}</span></div>
                  </div>
                  {consec >= 2
                    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#B0413A', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}><Icon name="bell" size={12} color="#fff" />{he ? `${consec} ברצף - יבוטל` : `${consec} in a row - auto-cancel`}</span>
                    : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,201,123,0.2)', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#FFC97B', flexShrink: 0 }}>{he ? 'פעם ראשונה' : '1st miss'}</span>}
                </div>
              );
            })}
            <button onClick={() => go('noshows')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: '10px', cursor: 'pointer', font: 'inherit', fontSize: 12.5, fontWeight: 700, color: '#FFC97B', marginTop: 2 }}>
              <Icon name="phone" size={14} color="#FFC97B" />{he ? 'יצירת קשר עם הלקוחות' : 'Reach out to clients'}
            </button>
          </div>
        )}

        {/* TIER 2, weekly management */}
        <Tier label={t.dashWeekly} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {weekly.map((a, k) => <Row key={a.id} a={a} k={k} big />)}
        </div>

        {/* recent activity */}
        <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 3px 12px rgba(11,30,61,0.05)' }}>
          {activity.map((a, k) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 15px', borderBottom: k < activity.length - 1 ? '1px solid rgba(11,30,61,0.06)' : 'none' }}>
              <span style={{ width: 8, height: 8, borderRadius: 5, background: accent, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13.5, color: '#0B1E3D' }}>{a[0]}</span>
              <span style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.4)' }}>{a[1]}</span>
            </div>
          ))}
        </div>

        {/* TIER 3, occasional: settings & tools */}
        <Tier label={t.dashOccasional} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          {occasional.map((a, k) => (
            <button key={a.id} onClick={() => go(a.id)} className="s2-rise tapsq" style={{ animationDelay: (380 + k * 50) + 'ms', display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid rgba(11,30,61,0.06)', borderRadius: 14, padding: '12px 13px', cursor: 'pointer', font: 'inherit', textAlign: 'start', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={a.icon} size={17} color="rgba(11,30,61,0.65)" /></span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0B1E3D', lineHeight: 1.2 }}>{a.label}</span>
            </button>
          ))}
        </div>
      </Body>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// 1b · NO-SHOWS  (reached from the "no-shows" metric)
// ─────────────────────────────────────────────────────────────
function NoShowsScreen({ lang, t, accent, serif, onBack, appts, staff, toast }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const [client, setClient] = useS2(null);
  const pad = n => String(n).padStart(2, '0');
  const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayK = fmt(new Date());
  const rows = (appts || []).filter(a => a.status === 'no').sort((x, y) => (x.date + x.start).localeCompare(y.date + y.start));
  const list = staff || DATA.barbers;
  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל' : 'Admin'} title={he ? 'אי-הגעות' : 'No-shows'} onBack={onBack}
        right={rows.length ? <span style={{ fontSize: 12.5, fontWeight: 700, color: '#B0413A', background: 'rgba(176,65,58,0.1)', padding: '5px 11px', borderRadius: 20 }}>{rows.length}</span> : null} />
      <Body>
        {rows.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'rgba(11,30,61,0.45)' }}>
            <span style={{ display: 'inline-flex', width: 64, height: 64, borderRadius: '50%', background: 'rgba(46,125,82,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon name="check" size={32} color="#2E7D52" stroke={2.4} /></span>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 18, color: '#0B1E3D' }}>{he ? 'אין אי-הגעות' : 'No no-shows'}</div>
            <div style={{ fontSize: 13.5, marginTop: 5 }}>{he ? 'כל הלקוחות הגיעו לתורים שלהם.' : 'Everyone made their appointment.'}</div>
          </div>
        )}
        {rows.length > 0 && <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.55)', marginInlineStart: 2 }}>{he ? 'לקוחות שלא הגיעו, לחצו ליצירת קשר ומעקב.' : 'Clients who missed, tap to reach out.'}</div>}
        {rows.map((a, k) => {
          const svc = DATA.services.find(s => s.id === a.svc);
          const barber = list.find(b => b.id === a.barberId);
          const when = a.date === todayK ? (he ? 'היום' : 'Today') : new Date(a.date).toLocaleDateString(he ? 'he-IL' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });
          const isRecurring = !!a.recurringId;
          const consec = isRecurring ? (() => {
            const hist = (appts || []).filter(x => x.recurringId === a.recurringId && (x.status === 'no' || x.status === 'done')).sort((x, y) => y.date.localeCompare(x.date));
            let n = 0; for (const x of hist) { if (x.status === 'no') n++; else break; } return n;
          })() : 0;
          return (
            <div key={a.id} className="s2-rise" style={{ animationDelay: (k * 60) + 'ms', display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 16, padding: '13px 14px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)', borderInlineStart: `3px solid ${isRecurring ? '#C8750A' : '#B0413A'}` }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: isRecurring ? 'rgba(200,117,10,0.1)' : 'rgba(176,65,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isRecurring ? '#C8750A' : '#B0413A', fontWeight: 700, fontSize: 17, flexShrink: 0 }}>{(window.clientLabel ? window.clientLabel(a, lang) : nm({ he: a.clientHe, en: a.clientEn })).trim()[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 14.5, color: '#0B1E3D' }}>{window.clientLabel ? window.clientLabel(a, lang) : nm({ he: a.clientHe, en: a.clientEn })}</span>
                  {isRecurring && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: consec >= 2 ? 'rgba(176,65,58,0.12)' : 'rgba(200,117,10,0.12)', borderRadius: 20, padding: '2px 8px', fontSize: 10.5, fontWeight: 800, color: consec >= 2 ? '#B0413A' : '#C8750A' }}><Icon name="refresh" size={11} color={consec >= 2 ? '#B0413A' : '#C8750A'} />{he ? `קבוע${consec >= 2 ? ` · ${consec} ברצף` : ''}` : `recurring${consec >= 2 ? ` · ${consec} in a row` : ''}`}</span>}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{when} · <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{a.start}</span> · {nm(svc)}{barber ? ' · ' + nm(barber).split(' ')[0] : ''}</div>
              </div>
              <button onClick={() => setClient(a)} style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#1ebe5d,#12a350)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 12px rgba(30,190,93,0.28)' }} title={he ? 'יצירת קשר' : 'Contact'}>
                <Icon name="whatsapp" size={20} color="#fff" />
              </button>
            </div>
          );
        })}
      </Body>
      {client && <CustomerCard lang={lang} t={t} accent={accent} serif={serif} client={resolveClient(client, lang)} mode="admin" staff={staff} appts={appts} onClose={() => setClient(null)} toast={toast} />}
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// 1c · DEEP INSIGHTS  (the advanced metrics, one layer down)
// ─────────────────────────────────────────────────────────────
function InsightsScreen({ lang, t, accent, serif, onBack, go, appts, staff, firstMonth }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const list = staff || DATA.barbers;
  const all = appts || [];
  const priceOf = id => (DATA.services.find(s => s.id === id)?.price || 0);
  const minOf = id => (DATA.services.find(s => s.id === id)?.min || 45);
  const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };

  // 1 · revenue by barber over a selectable period (day/week/month), from the shared calendar
  const [range, setRange] = useS2('week');
  const _p = n => String(n).padStart(2, '0');
  const _t0 = new Date(); _t0.setHours(0, 0, 0, 0);
  const _end = (() => { const d = new Date(_t0); d.setDate(d.getDate() + (range === 'day' ? 0 : range === 'week' ? 6 : 30)); return d; })();
  const _k = d => `${d.getFullYear()}-${_p(d.getMonth() + 1)}-${_p(d.getDate())}`;
  const inRange = ds => ds >= _k(_t0) && ds <= _k(_end);
  // appointment turnover by barber - EXCLUDES punch-card redemptions (a.punchCardId):
  // the card was already counted at its SALE, so a redeemed visit must never re-count (G4 §2).
  const byBarber = list.map(b => { const rev = all.filter(a => a.barberId === b.id && !a.punchCardId && a.status !== 'no' && a.status !== 'rejected' && a.status !== 'cancelled' && inRange(a.date)).reduce((n, a) => n + priceOf(a.svc), 0); const profit = window.netProfit ? window.netProfit(rev, b) : rev; return { b, rev, profit }; });
  const maxRev = Math.max(1, ...byBarber.map(x => x.rev));
  const apptRev = byBarber.reduce((n, x) => n + x.rev, 0);
  const apptProfit = byBarber.reduce((n, x) => n + x.profit, 0);
  // Round G4 · merge punch-card SALES into the pyramid - counted ONCE, at sale (by purchase
  // date, the same window G3 uses). Each card splits by the deal of the barber it's bound to;
  // team/owner cards are 100% manager. The redemption (the punch) is NOT income - excluded above.
  const _cards = window.punchStore ? window.punchStore.wallet() : [];
  const _cardSince = Date.now() - (range === 'day' ? 1 : range === 'week' ? 7 : 30) * 86400000;
  const _periodCards = _cards.filter(c => (c.purchasedAt || 0) >= _cardSince);
  const cardRev = _periodCards.reduce((n, c) => n + (c.price || 0), 0);
  const cardProfit = _periodCards.reduce((n, c) => { const b = c.barberId ? list.find(x => x.id === c.barberId) : null; return n + (b && window.netProfit ? window.netProfit(c.price || 0, b) : (c.price || 0)); }, 0);
  const rangeRev = apptRev + cardRev;       // merged turnover
  const rangeProfit = apptProfit + cardProfit; // merged net profit
  // Round G2 · expenses for the SAME window, then income after them.
  const expItems = window.expenseStore ? window.expenseStore.list() : [];
  const exp = window.periodExpenses ? window.periodExpenses(expItems, range, inRange) : { total: 0, monthly: 0, once: 0 };
  const incomeAfter = rangeProfit - exp.total;
  const periodLabel = range === 'day' ? (he ? 'היום' : 'today') : range === 'week' ? (he ? 'השבוע' : 'this week') : (he ? 'החודש' : 'this month');
  // approve vs decline analytics (per barber, in range), from the approval system
  const approvals = list.map(b => { const rows = all.filter(a => a.barberId === b.id && inRange(a.date)); const ok = rows.filter(a => a.status === 'confirmed' || a.status === 'done' || a.status === 'now').length; const rej = rows.filter(a => a.status === 'rejected').length; return { b, ok, rej }; });
  const totOk = approvals.reduce((n, x) => n + x.ok, 0), totRej = approvals.reduce((n, x) => n + x.rej, 0);
  const approveRate = (totOk + totRej) ? Math.round(totOk / (totOk + totRej) * 100) : 100;
  // cancellations (client- or shop-initiated), the freed slots are counted here, not in the calendar
  const totCanc = all.filter(a => a.status === 'cancelled' && inRange(a.date)).length;
  const totNoShow = all.filter(a => a.status === 'no' && inRange(a.date)).length;

  // 2 · occupancy today (booked minutes vs available minutes for on-shift barbers)
  const pad = n => String(n).padStart(2, '0');
  const todayK = `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}-${pad(new Date().getDate())}`;
  const onShift = list.filter(b => b.active !== false);
  const availMin = onShift.reduce((n, b) => {
    const span = toMin(b.end || '18:00') - toMin(b.start || '09:00');
    const brk = (b.breaks || []).reduce((m, x) => m + (toMin(x.to) - toMin(x.from)), 0);
    return n + Math.max(0, span - brk);
  }, 0);
  const bookedMin = all.filter(a => a.date === todayK && a.status !== 'no' && a.status !== 'cancelled' && a.status !== 'rejected' && onShift.some(b => b.id === a.barberId)).reduce((n, a) => n + minOf(a.svc), 0);
  const occ = availMin ? Math.min(100, Math.round(bookedMin / availMin * 100)) : 0;

  // 3 · peak hours (start-hour histogram across dataset)
  const hours = Array.from({ length: 12 }, (_, i) => 9 + i);
  const hist = hours.map(h => all.filter(a => a.status !== 'no' && a.status !== 'cancelled' && a.status !== 'rejected' && toMin(a.start) >= h * 60 && toMin(a.start) < (h + 1) * 60).length);
  const maxH = Math.max(1, ...hist);

  // 4 · customer-return CRM metrics (from the customer directory + shared calendar)
  const cust = DATA.customers;
  const returning = cust.filter(c => c.visits > 1).length;
  const oneTime = cust.filter(c => c.visits === 1).length;
  const retRate = cust.length ? Math.round(returning / cust.length * 100) : 0;
  const avgFreq = cust.length ? (cust.reduce((n, c) => n + c.visits, 0) / cust.length) : 0;
  const churned = cust.filter(c => c.visits <= 1 && (c.firstSeen || '9999') <= '2025-12').length;
  const churnRate = cust.length ? Math.round(churned / cust.length * 100) : 0;
  const growth = [3, 4, 6, 5, 8, 7]; // new clients / month (recent), illustrative trend

  const Section = ({ icon, title, hint, children }) => (
    <div style={{ background: '#fff', borderRadius: 20, padding: 18, boxShadow: '0 3px 12px rgba(11,30,61,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(200,162,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={18} color={accent} /></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 16, color: '#0B1E3D' }}>{title}</div>
          {hint && <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 1 }}>{hint}</div>}
        </div>
      </div>
      {children}
    </div>
  );

  // Round G2 · one row of the turnover → net profit → after-expenses ledger.
  const Layer = ({ label, sub, amount, color, strong, sign }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: strong ? '13px 2px 2px' : '11px 2px' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: strong ? 15.5 : 13.5, fontWeight: strong ? 800 : 600, color: '#0B1E3D' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.45)', marginTop: 1 }}>{sub}</div>}
      </div>
      <div style={{ fontFamily: serif, fontWeight: strong ? 800 : 700, fontSize: strong ? 27 : 18, color, direction: 'ltr', flexShrink: 0 }}>{(sign || '') + '₪' + Math.abs(amount).toLocaleString()}</div>
    </div>
  );

  if (firstMonth) {
    return (
      <Shell>
        <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל' : 'Admin'} title={he ? 'ניתוח מעמיק' : 'Deep insights'} onBack={onBack} />
        <Body>
          <div style={{ textAlign: 'center', padding: '50px 26px', background: '#fff', borderRadius: 22, boxShadow: '0 3px 12px rgba(11,30,61,0.05)', border: '1px dashed rgba(11,30,61,0.16)' }}>
            <span style={{ display: 'inline-flex', width: 66, height: 66, borderRadius: 18, background: 'linear-gradient(135deg,rgba(228,201,123,0.22),rgba(200,162,74,0.16))', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><Icon name="spark" size={32} color={accent} /></span>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D' }}>{he ? 'אוספים נתונים' : 'Collecting data'}</div>
            <div style={{ fontSize: 14, color: 'rgba(11,30,61,0.55)', marginTop: 8, lineHeight: 1.55, maxWidth: 280, marginInline: 'auto' }}>{he ? 'רווחיות לפי ספר, תפוסה, שעות שיא וחזרת לקוחות יופיעו כאן ברגע שייצברו מספיק נתונים, בדרך כלל אחרי חודש פעילות.' : 'Profit by barber, occupancy, peak hours and customer return will appear here once enough data builds up, usually after a month.'}</div>
          </div>
          <Section icon="coin" title={he ? 'מה שכבר זמין' : 'Available now'} hint={he ? 'הכנסת היום' : "Today's revenue"}>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 32, color: accent, direction: 'ltr', textAlign: 'start' }}>{'₪' + all.filter(a => a.date === todayK && a.status !== 'no' && a.status !== 'cancelled' && a.status !== 'rejected').reduce((n, a) => n + priceOf(a.svc), 0).toLocaleString()}</div>
          </Section>
        </Body>
      </Shell>
    );
  }

  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל · עוד נתונים' : 'Admin · more data'} title={he ? 'ניתוח מעמיק' : 'Deep insights'} onBack={onBack} />
      <Body>
        {/* Round G2 · the three layers together - turnover → net profit → after expenses */}
        <Section icon="coin" title={he ? 'הכנסה לאחר הוצאות' : 'Income after expenses'} hint={he ? 'שלוש שכבות · ' + periodLabel : 'Three layers · ' + periodLabel}>
          <div style={{ display: 'flex', gap: 5, background: 'rgba(11,30,61,0.05)', padding: 4, borderRadius: 11, marginBottom: 6 }}>
            {[['day', he ? 'יום' : 'Day'], ['week', he ? 'שבוע' : 'Week'], ['month', he ? 'חודש' : 'Month']].map(([id, lbl]) => (
              <button key={id} onClick={() => setRange(id)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 12.5, fontWeight: 700, background: range === id ? '#fff' : 'transparent', color: range === id ? '#0B1E3D' : 'rgba(11,30,61,0.5)', boxShadow: range === id ? '0 2px 6px rgba(11,30,61,0.08)' : 'none' }}>{lbl}</button>
            ))}
          </div>
          <Layer label={he ? 'מחזור' : 'Turnover'} sub={he ? `מתוכו: תורים ₪${apptRev.toLocaleString()} · כרטיסיות ₪${cardRev.toLocaleString()}` : `appts ₪${apptRev.toLocaleString()} · cards ₪${cardRev.toLocaleString()}`} amount={rangeRev} color="rgba(11,30,61,0.55)" />
          <div style={{ height: 1, background: 'rgba(11,30,61,0.07)' }} />
          <Layer label={he ? 'רווח נטו' : 'Net profit'} sub={he ? 'תורים + כרטיסיות, אחרי דיל הספר' : 'appts + cards, after barber %'} amount={rangeProfit} color="#9C7B2E" />
          <div style={{ height: 1, background: 'rgba(11,30,61,0.07)' }} />
          <Layer label={he ? 'הוצאות התקופה' : 'Expenses this period'} sub={exp.includeFixed ? (he ? `קבועות ₪${exp.monthly.toLocaleString()} · חד-פעמי ₪${exp.once.toLocaleString()}` : `fixed ₪${exp.monthly.toLocaleString()} · one-time ₪${exp.once.toLocaleString()}`) : (he ? `חד-פעמי ₪${exp.once.toLocaleString()} · קבועות בתצוגה חודשית` : `one-time ₪${exp.once.toLocaleString()} · fixed shown monthly`)} amount={exp.total} sign="−" color="#B0413A" />
          <div style={{ height: 2, background: 'rgba(11,30,61,0.12)', margin: '5px 0 0', borderRadius: 2 }} />
          <Layer label={he ? 'הכנסה לאחר הוצאות' : 'Income after expenses'} amount={incomeAfter} sign={incomeAfter < 0 ? '−' : ''} color={incomeAfter < 0 ? '#B0413A' : '#1F8A5B'} strong />
          {!exp.includeFixed && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginTop: 11, background: 'rgba(11,30,61,0.04)', borderRadius: 11, padding: '9px 11px', fontSize: 11.5, color: 'rgba(11,30,61,0.6)', lineHeight: 1.45 }}>
              <Icon name="refresh" size={14} color="rgba(11,30,61,0.45)" style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{he ? 'הוצאות קבועות (שכירות, חשמל וכו׳) מוצגות בתצוגה חודשית. כאן מופיעות רק הוצאות חד-פעמיות שתאריכן בתוך התקופה.' : 'Fixed costs (rent, utilities…) appear in the monthly view. Here, only one-time costs dated within the period are counted.'}</span>
            </div>
          )}
          <button onClick={() => go && go('expenses')} className="tapsq" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 12, padding: '11px', borderRadius: 12, border: '1px solid rgba(11,30,61,0.12)', background: '#FBF9F5', font: 'inherit', fontSize: 13.5, fontWeight: 700, color: '#0B1E3D', cursor: 'pointer' }}>
            <Icon name="coin" size={16} color={accent} />{he ? 'ניהול ההוצאות' : 'Manage expenses'}
          </button>
        </Section>

        <Section icon="users" title={he ? 'מחזור ורווח לפי ספר' : 'Turnover & profit by barber'} hint={he ? 'תורים בלבד · מכירת כרטיסיות בפאנל נפרד למטה' : 'Appointments only · card sales in the panel below'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {byBarber.map(({ b, rev, profit }) => {
              const c = window.barberColor ? window.barberColor(b.id, list) : DATA.calColors[list.findIndex(x => x.id === b.id) % DATA.calColors.length];
              const share = window.managerShare ? Math.round(window.managerShare(b) * 100) : 50;
              return (
                <div key={b.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0B1E3D', display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}><span style={{ width: 9, height: 9, borderRadius: 5, background: c, flexShrink: 0 }} /><span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nm(b)}</span><span style={{ flexShrink: 0, fontSize: 10, fontWeight: 800, color: b.owner ? '#9C7B2E' : 'rgba(11,30,61,0.5)', background: b.owner ? 'rgba(200,162,74,0.14)' : 'rgba(11,30,61,0.06)', padding: '2px 7px', borderRadius: 20 }}>{b.owner ? (he ? 'בעלים · 100%' : 'owner · 100%') : (he ? `מנהל ${share}%` : `mgr ${share}%`)}</span></span>
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexShrink: 0, direction: 'ltr' }}>
                      <span style={{ fontSize: 12, color: 'rgba(11,30,61,0.4)', fontWeight: 600 }}>{'₪' + rev.toLocaleString()}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: accent }}>{'₪' + profit.toLocaleString()}</span>
                    </span>
                  </div>
                  <div style={{ height: 9, borderRadius: 5, background: 'rgba(11,30,61,0.06)', overflow: 'hidden' }}>
                    <div style={{ width: (rev / maxRev * 100) + '%', height: '100%', borderRadius: 5, background: accent + '40' }}>
                      <div style={{ width: (rev ? profit / rev * 100 : 0) + '%', height: '100%', borderRadius: 5, background: accent }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 13, fontSize: 11, color: 'rgba(11,30,61,0.5)', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 8, borderRadius: 3, background: accent }} />{he ? 'רווח נטו' : 'Net profit'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 8, borderRadius: 3, background: accent + '40' }} />{he ? 'יתרת המחזור (לעובד)' : 'Rest of turnover (barber)'}</span>
          </div>
        </Section>

        <Section icon="check" title={he ? 'אישור מול דחייה' : 'Approved vs declined'} hint={he ? `${approveRate}% מהבקשות אושרו · ${range === 'day' ? 'היום' : range === 'week' ? 'השבוע' : 'החודש'}` : `${approveRate}% approved`}>
          <div style={{ display: 'flex', gap: 9, marginBottom: 13 }}>
            <div style={{ flex: 1, background: 'rgba(46,125,82,0.08)', borderRadius: 13, padding: '11px 12px' }}>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: '#2E7D52', lineHeight: 1 }}>{totOk}</div>
              <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.55)', marginTop: 4, fontWeight: 600 }}>{he ? 'אושרו' : 'Approved'}</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(176,65,58,0.08)', borderRadius: 13, padding: '11px 12px' }}>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: '#B0413A', lineHeight: 1 }}>{totRej}</div>
              <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.55)', marginTop: 4, fontWeight: 600 }}>{he ? 'נדחו' : 'Declined'}</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(11,30,61,0.05)', borderRadius: 13, padding: '11px 12px' }}>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: '#0B1E3D', lineHeight: 1 }}>{totCanc}</div>
              <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.55)', marginTop: 4, fontWeight: 600 }}>{he ? 'בוטלו' : 'Cancelled'}</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(176,65,58,0.08)', borderRadius: 13, padding: '11px 12px' }}>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: '#B0413A', lineHeight: 1 }}>{totNoShow}</div>
              <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.55)', marginTop: 4, fontWeight: 600 }}>{he ? 'לא הגיעו' : 'No-shows'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {approvals.filter(x => x.ok + x.rej > 0).map(({ b, ok, rej }) => (
              <div key={b.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12.5 }}>
                  <span style={{ fontWeight: 600, color: '#0B1E3D' }}>{nm(b).split(' ')[0]}</span>
                  <span style={{ color: 'rgba(11,30,61,0.5)' }}><span style={{ color: '#2E7D52', fontWeight: 700 }}>{ok}</span> / <span style={{ color: '#B0413A', fontWeight: 700 }}>{rej}</span></span>
                </div>
                <div style={{ display: 'flex', height: 7, borderRadius: 4, overflow: 'hidden', background: 'rgba(11,30,61,0.06)' }}>
                  <div style={{ width: (ok / Math.max(1, ok + rej) * 100) + '%', background: '#2E7D52' }} />
                  <div style={{ width: (rej / Math.max(1, ok + rej) * 100) + '%', background: '#B0413A' }} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section icon="spark" title={he ? 'תפוסה היום' : 'Occupancy today'} hint={he ? 'דקות מוזמנות מתוך זמינות' : 'Booked vs available minutes'}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.5)' }}>{onShift.length} {he ? 'ספרים במשמרת' : 'on shift'}</span>
            <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 24, color: accent }}>{occ}%</span>
          </div>
          <div style={{ height: 10, borderRadius: 6, background: 'rgba(11,30,61,0.07)', overflow: 'hidden' }}><div style={{ width: occ + '%', height: '100%', borderRadius: 6, background: `linear-gradient(90deg,#E4C97B,${accent})` }} /></div>
        </Section>

        {/* Round G3 · punch-card insights (period-scoped sales + live liability) */}
        {window.PunchInsightsSection && <PunchInsightsSection lang={lang} accent={accent} serif={serif} range={range} staff={staff} appts={appts} />}
      </Body>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// 1d · WEEKLY TRENDS  (reached from the "מגמת השבוע" teaser - distinct
//      from the revenue Insights reached from the "מחזור היום" tile)
// ─────────────────────────────────────────────────────────────
function TrendsScreen({ lang, t, accent, serif, onBack, appts, staff, firstMonth }) {
  const he = lang === 'he';
  const all = appts || [];
  const pad = n => String(n).padStart(2, '0');
  const priceOf = id => (DATA.services.find(s => s.id === id)?.price || 0);
  const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const live = a => a.status !== 'no' && a.status !== 'cancelled' && a.status !== 'rejected';

  // current calendar week (Sun-Sat)
  const base = new Date(); base.setHours(0, 0, 0, 0);
  const sunday = new Date(base); sunday.setDate(base.getDate() - base.getDay());
  const _k = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayK = _k(base);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(sunday); d.setDate(sunday.getDate() + i); return d; });
  const dayRev = days.map(d => all.filter(a => a.date === _k(d) && live(a)).reduce((n, a) => n + priceOf(a.svc), 0));
  const maxDay = Math.max(1, ...dayRev);
  const weekTotal = dayRev.reduce((n, v) => n + v, 0);
  const bestIdx = dayRev.indexOf(Math.max(...dayRev));
  const wdShort = d => d.toLocaleDateString(he ? 'he-IL' : 'en-US', { weekday: 'short' });

  // peak hours histogram
  const hours = Array.from({ length: 12 }, (_, i) => 9 + i);
  const hist = hours.map(h => all.filter(a => live(a) && toMin(a.start) >= h * 60 && toMin(a.start) < (h + 1) * 60).length);
  const maxH = Math.max(1, ...hist);
  const peakHour = hours[hist.indexOf(Math.max(...hist))];

  // customer return + growth
  const cust = DATA.customers;
  const returning = cust.filter(c => c.visits > 1).length;
  const oneTime = cust.filter(c => c.visits === 1).length;
  const retRate = cust.length ? Math.round(returning / cust.length * 100) : 0;
  const avgFreq = cust.length ? (cust.reduce((n, c) => n + c.visits, 0) / cust.length) : 0;
  const churned = cust.filter(c => c.visits <= 1 && (c.firstSeen || '9999') <= '2025-12').length;
  const churnRate = cust.length ? Math.round(churned / cust.length * 100) : 0;
  const growth = [3, 4, 6, 5, 8, 7];
  const growthMonths = (() => { const arr = []; for (let i = 5; i >= 0; i--) { const m = new Date(base.getFullYear(), base.getMonth() - i, 1); arr.push(m.toLocaleDateString(he ? 'he-IL' : 'en-US', { month: 'short' })); } return arr; })();

  const Section = ({ icon, title, hint, children }) => (
    <div style={{ background: '#fff', borderRadius: 20, padding: 18, boxShadow: '0 3px 12px rgba(11,30,61,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(200,162,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={18} color={accent} /></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 16, color: '#0B1E3D' }}>{title}</div>
          {hint && <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 1 }}>{hint}</div>}
        </div>
      </div>
      {children}
    </div>
  );

  if (firstMonth) {
    return (
      <Shell>
        <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל · מגמות' : 'Admin · trends'} title={he ? 'מגמת השבוע' : 'Weekly trend'} onBack={onBack} />
        <Body>
          <div style={{ textAlign: 'center', padding: '50px 26px', background: '#fff', borderRadius: 22, boxShadow: '0 3px 12px rgba(11,30,61,0.05)', border: '1px dashed rgba(11,30,61,0.16)' }}>
            <span style={{ display: 'inline-flex', width: 66, height: 66, borderRadius: 18, background: 'linear-gradient(135deg,rgba(228,201,123,0.22),rgba(200,162,74,0.16))', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><Icon name="chart" size={32} color={accent} /></span>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D' }}>{he ? 'אוספים נתונים' : 'Collecting data'}</div>
            <div style={{ fontSize: 14, color: 'rgba(11,30,61,0.55)', marginTop: 8, lineHeight: 1.55, maxWidth: 280, marginInline: 'auto' }}>{he ? 'מגמות שבועיות, שעות שיא וחזרת לקוחות יופיעו כאן ברגע שייצברו מספיק נתונים.' : 'Weekly trends, peak hours and customer return will appear once enough data builds up.'}</div>
          </div>
        </Body>
      </Shell>
    );
  }

  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל · מגמות' : 'Admin · trends'} title={he ? 'מגמת השבוע' : 'Weekly trend'} onBack={onBack} />
      <Body>
        <Section icon="chart" title={he ? 'מחזור השבוע' : 'This week’s turnover'} hint={he ? `סך ₪${weekTotal.toLocaleString()} · השבוע` : `₪${weekTotal.toLocaleString()} this week`}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, height: 120 }}>
            {dayRev.map((v, i) => { const isToday = _k(days[i]) === todayK; const isBest = i === bestIdx && v > 0; return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: v ? 'rgba(11,30,61,0.55)' : 'rgba(11,30,61,0.25)', direction: 'ltr' }}>{v ? ('₪' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v)) : ''}</span>
                <div style={{ width: '100%', height: Math.max(4, v / maxDay * 78), borderRadius: '5px 5px 0 0', background: isBest ? `linear-gradient(180deg,#E4C97B,${accent})` : v ? 'rgba(200,162,74,0.35)' : 'rgba(11,30,61,0.07)' }} />
                <span style={{ fontSize: 10, fontWeight: isToday ? 800 : 600, color: isToday ? accent : 'rgba(11,30,61,0.5)' }}>{wdShort(days[i])}</span>
              </div>
            ); })}
          </div>
          {weekTotal > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 14, background: 'rgba(200,162,74,0.1)', borderRadius: 11, padding: '9px 12px', fontSize: 12, color: 'rgba(11,30,61,0.7)', fontWeight: 600 }}><Icon name="spark" size={14} color={accent} />{he ? `היום החזק בשבוע: ${wdShort(days[bestIdx])} · ₪${dayRev[bestIdx].toLocaleString()}` : `Best day: ${wdShort(days[bestIdx])} · ₪${dayRev[bestIdx].toLocaleString()}`}</div>}
        </Section>

        <Section icon="clock" title={he ? 'שעות שיא' : 'Peak hours'} hint={he ? `העומס מתרכז סביב ${peakHour}:00` : `Busiest around ${peakHour}:00`}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
            {hist.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', height: Math.max(4, v / maxH * 60), borderRadius: '4px 4px 0 0', background: v === maxH && v ? `linear-gradient(180deg,#E4C97B,${accent})` : 'rgba(11,30,61,0.12)' }} />
                {hours[i] % 3 === 0 && <span style={{ fontSize: 8.5, color: 'rgba(11,30,61,0.4)', fontWeight: 600 }}>{hours[i]}</span>}
              </div>
            ))}
          </div>
        </Section>

        <Section icon="users" title={he ? 'חזרת לקוחות (CRM)' : 'Customer return (CRM)'} hint={he ? 'בריאות בסיס הלקוחות' : 'Client-base health'}>
          <div style={{ display: 'flex', gap: 9, marginBottom: 13 }}>
            <div style={{ flex: 1, background: 'rgba(46,125,82,0.08)', borderRadius: 13, padding: '11px 12px' }}>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: '#2E7D52', lineHeight: 1 }}>{retRate}%</div>
              <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.55)', marginTop: 4, fontWeight: 600 }}>{he ? 'חוזרים' : 'Return rate'}</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(200,162,74,0.1)', borderRadius: 13, padding: '11px 12px' }}>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: accent, lineHeight: 1, direction: 'ltr', textAlign: 'start' }}>{avgFreq.toFixed(1)}</div>
              <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.55)', marginTop: 4, fontWeight: 600 }}>{he ? 'ביקורים ללקוח' : 'Visits / client'}</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(176,65,58,0.08)', borderRadius: 13, padding: '11px 12px' }}>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: '#B0413A', lineHeight: 1 }}>{churnRate}%</div>
              <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.55)', marginTop: 4, fontWeight: 600 }}>{he ? 'נטישה' : 'Churn'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.6)', fontWeight: 600 }}>{he ? `חוזרים ${returning} · חד-פעמיים ${oneTime}` : `Returning ${returning} · one-time ${oneTime}`}</span>
          </div>
          <div style={{ display: 'flex', height: 10, borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ width: (returning / Math.max(1, cust.length) * 100) + '%', background: '#2E7D52' }} />
            <div style={{ flex: 1, background: 'rgba(11,30,61,0.12)' }} />
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 9 }}>{he ? 'מגמת צמיחה · לקוחות חדשים לחודש' : 'Growth · new clients / month'}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 52 }}>
            {growth.map((v, i) => { const mx = Math.max(...growth); return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', height: Math.max(5, v / mx * 40), borderRadius: '5px 5px 0 0', background: i === growth.length - 1 ? `linear-gradient(180deg,#E4C97B,${accent})` : 'rgba(11,30,61,0.12)' }} />
                <span style={{ fontSize: 8.5, color: 'rgba(11,30,61,0.4)', fontWeight: 700 }}>{growthMonths[i]}</span>
              </div>
            ); })}
          </div>
        </Section>
      </Body>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// 2 · BROADCAST MESSAGING
// ─────────────────────────────────────────────────────────────
function CheckRow({ on, onToggle, icon, label, sub, accent, color }) {
  return (
    <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: '#fff', border: `1.5px solid ${on ? (color || accent) : 'rgba(11,30,61,0.08)'}`, borderRadius: 14, padding: '12px 14px', cursor: 'pointer', font: 'inherit', textAlign: 'start', transition: 'all .18s' }}>
      <span style={{ width: 36, height: 36, borderRadius: 10, background: on ? (color || accent) + '22' : 'rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={icon} size={19} color={on ? (color || accent) : 'rgba(11,30,61,0.4)'} /></span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14.5, color: '#0B1E3D' }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 1 }}>{sub}</div>}
      </div>
      <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, border: `1.5px solid ${on ? (color || accent) : 'rgba(11,30,61,0.2)'}`, background: on ? (color || accent) : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s' }}>{on && <Icon name="check" size={15} color="#fff" stroke={2.6} />}</span>
    </button>
  );
}

function BroadcastScreen({ lang, t, accent, serif, onBack, notify, toast, staff, appts, pushNotify }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const _load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } };
  const defCh = (_load('royale_bizsettings_v1', {}).channel) || 'whatsapp';
  const [title, setTitle] = useS2('');
  const [msg, setMsg] = useS2('');
  const [ch, setCh] = useS2({ whatsapp: defCh === 'whatsapp', sms: defCh === 'sms', email: defCh === 'email', banner: true });
  const [aud, setAud] = useS2('all');
  const [barberId, setBarberId] = useS2(null);     // for "by barber"
  const [picked, setPicked] = useS2({});            // for manual selection {custId:true}
  const [sent, setSent] = useS2(false);
  const [tpl, setTpl] = useS2('');
  const [kind, setKind] = useS2('marketing');   // Round H0 · operational | marketing
  const [attachId, setAttachId] = useS2(null);   // Round 9: optional document from the library
  // Round A: editable template library (tplStore) + manager sheet + recipient search
  const [tplList, setTplList] = useS2(window.tplStore ? window.tplStore.list() : MSG_TEMPLATES.filter(m => !m.welcome));
  const [manageTpl, setManageTpl] = useS2(false);
  const [custQ, setCustQ] = useS2('');
  const [links, setLinks] = useS2({ booking: 'https://book.mesparfi.co.il', app: 'https://mesparfi.app/get' });
  const list = staff || DATA.barbers;
  const customers = DATA.customers;
  const docs = window.docStore ? window.docStore.lib() : [];   // library files attachable to a broadcast
  const channels = [
    { id: 'whatsapp', icon: 'whatsapp', label: 'WhatsApp', color: '#12a350' },
    { id: 'sms', icon: 'message', label: 'SMS', color: '#2A6FDB' },
    { id: 'email', icon: 'mail', label: he ? 'אימייל' : 'Email', color: '#C8A24A' },
    { id: 'banner', icon: 'bell', label: he ? 'התראת באנר' : 'In-app banner', color: '#8E5BD0' },
  ];
  const audiences = [
    { id: 'all', icon: 'users', label: he ? 'כל הלקוחות' : 'All customers', sub: he ? `${customers.length} נמענים` : `${customers.length} recipients` },
    { id: 'barber', icon: 'scissors', label: he ? 'לפי ספר' : 'By barber', sub: he ? 'לקוחות של ספר מסוים' : "A barber's clients" },
    { id: 'manual', icon: 'pencil', label: he ? 'בחירה ידנית' : 'Manual pick', sub: he ? 'סמנו לקוחות מהרשימה' : 'Tick clients from the list' },
    { id: 'staff', icon: 'megaphone', label: he ? 'כל הצוות' : 'All staff', sub: he ? `${list.filter(b => b.active !== false).length} ספרים פעילים` : `${list.filter(b => b.active !== false).length} active barbers` },
  ];
  const activeStaff = list.filter(b => b.active !== false);
  // Round B · "clients of a barber" = customers whose PRIMARY barber is this one (CRM
  // association), not whoever happens to have a calendar appointment with him.
  const primOf = c => (window.primaryBarber ? (window.primaryBarber(c, appts) || {}).id : c.fav);
  const barberClients = barberId ? customers.filter(c => primOf(c) === barberId) : [];
  const pickedCount = Object.values(picked).filter(Boolean).length;
  // Round H0 · the customer set this broadcast targets, before any consent filtering
  const audienceCustomers = aud === 'all' ? customers : aud === 'barber' ? barberClients : aud === 'manual' ? customers.filter(c => picked[c.id]) : [];
  const isMarketing = kind === 'marketing';
  // marketing content goes ONLY to opted-in recipients (anti-spam); operational reaches everyone
  const consented = audienceCustomers.filter(c => !window.consentStore || window.consentStore.hasFor(c.id));
  const skipped = isMarketing ? (audienceCustomers.length - consented.length) : 0;
  const recipients = aud === 'staff' ? activeStaff.length : (isMarketing ? consented.length : audienceCustomers.length);
  const chosenCh = Object.values(ch).filter(Boolean).length;
  const audienceReady = aud === 'all' || aud === 'staff' || (aud === 'barber' && barberId) || (aud === 'manual' && pickedCount > 0);
  const canSend = title.trim() && msg.trim() && chosenCh > 0 && audienceReady;
  const send = () => {
    if (!canSend) return;
    setSent(true);
    const attached = attachId && docs.find(d => d.id === attachId);
    const body = msg.trim() + (attached ? (he ? `\n\n📎 מצורף: ${attached.name}` : `\n\n📎 Attachment: ${attached.name}`) : '');
    pushNotify && pushNotify({ audience: aud === 'staff' ? 'staff' : aud, channels: ch, kind, title: title.trim(), body, attachment: attached ? { id: attached.id, name: attached.name, kind: attached.kind } : null });
    const okPart = he ? `נשלח ל-${recipients} נמענים ✓` : `Sent to ${recipients} ✓`;
    const skipPart = skipped > 0 ? (he ? ` · דולגו ${skipped} ללא הסכמה` : ` · ${skipped} skipped (no consent)`) : '';
    toast && toast(okPart + skipPart, attached ? (he ? `עם המסמך · ${attached.name}` : `With · ${attached.name}`) : (isMarketing ? (he ? 'שיווקי · רק למאשרים' : 'Marketing · opted-in only') : (he ? 'תפעולי · לכל הנמענים' : 'Operational · all recipients')));
    setTimeout(() => setSent(false), 2600);
  };
  const welcomeBody = (lk) => { const m = MSG_TEMPLATES.find(x => x.id === 'welcome'); return m ? fillTemplate(m[lang].body, { bookingLink: lk.booking, appLink: lk.app }) : ''; };
  const pickTpl = (m) => { setTpl(m.id); setTitle(m[lang].title); setMsg(m.welcome ? welcomeBody(links) : m[lang].body.replace(/\{name\}/g, he ? 'שלום' : 'Hi').replace(/\{time\}/g, '')); if (m.kind) setKind(m.kind); };
  const setLink = (patch) => { const nl = { ...links, ...patch }; setLinks(nl); if (tpl === 'welcome') setMsg(welcomeBody(nl)); };
  const fieldWrap = { background: '#fff', border: '1px solid rgba(11,30,61,0.1)', borderRadius: 14, padding: '4px 6px' };
  const inp = { width: '100%', boxSizing: 'border-box', font: 'inherit', color: '#0B1E3D', background: 'transparent', border: 'none', outline: 'none', padding: '11px 10px', direction: he ? 'rtl' : 'ltr', textAlign: 'start' };
  const togglePick = (id) => setPicked(p => ({ ...p, [id]: !p[id] }));
  const _cq = custQ.trim().toLowerCase(); const _cqd = _cq.replace(/[^0-9\-]/g, '').replace(/-/g, '');
  const custFiltered = customers.filter(c => !_cq || (c.he || '').includes(custQ.trim()) || (c.en || '').toLowerCase().includes(_cq) || (_cqd && (c.phone || '').replace(/[^0-9]/g, '').includes(_cqd)));
  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל' : 'Admin'} title={he ? 'שליחת הודעה' : 'Broadcast'} onBack={onBack} />
      <Body>
        <div>
          <Label serif={serif}>{he ? 'תבניות מוכנות' : 'Ready templates'}</Label>
          <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.5)', margin: '-4px 2px 9px' }}>{he ? 'בחרו תבנית למילוי מהיר, אפשר לערוך כל מילה.' : 'Pick one to pre-fill, edit freely.'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            {[...tplList, ...MSG_TEMPLATES.filter(m => m.welcome)].map(m => {
              const on = tpl === m.id;
              return (
                <button key={m.id} onClick={() => pickTpl(m)} style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: `1.5px solid ${on ? m.color : 'rgba(11,30,61,0.08)'}`, borderRadius: 14, padding: '11px 12px', cursor: 'pointer', font: 'inherit', textAlign: 'start', boxShadow: on ? `0 4px 12px ${m.color}22` : '0 2px 8px rgba(11,30,61,0.04)' }}>
                  <span style={{ width: 32, height: 32, borderRadius: 9, background: m.color + '1c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={m.icon} size={17} color={m.color} /></span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0B1E3D', lineHeight: 1.2 }}>{m[lang].cat}</span>
                </button>
              );
            })}
            <button onClick={() => setManageTpl(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'transparent', border: '1.5px dashed rgba(11,30,61,0.25)', borderRadius: 14, padding: '11px 12px', cursor: 'pointer', font: 'inherit', color: 'rgba(11,30,61,0.6)', fontSize: 12.5, fontWeight: 700 }}>
              <Icon name="pencil" size={15} color="rgba(11,30,61,0.5)" />{he ? 'ניהול תבניות' : 'Manage templates'}
            </button>
          </div>
        </div>
        <div>
          <Label serif={serif}>{he ? 'כותרת ההודעה' : 'Message title'}</Label>
          <div style={fieldWrap}><input value={title} onChange={e => setTitle(e.target.value)} placeholder={he ? 'מבצע סוף שבוע ✂️' : 'Weekend offer ✂️'} style={{ ...inp, fontSize: 16, fontWeight: 600 }} /></div>
        </div>
        <div>
          <Label serif={serif}>{he ? 'תוכן ההודעה' : 'Message'}</Label>
          <div style={fieldWrap}><textarea value={msg} onChange={e => setMsg(e.target.value)} rows={tpl === 'welcome' ? 7 : 4} maxLength={tpl === 'welcome' ? 600 : 300} placeholder={he ? 'כתבו כאן את ההודעה…' : 'Write your message…'} style={{ ...inp, fontSize: 14.5, resize: 'none', lineHeight: 1.5 }} /></div>
          <div style={{ textAlign: 'end', fontSize: 11, color: 'rgba(11,30,61,0.4)', marginTop: 4 }}>{msg.length}/{tpl === 'welcome' ? 600 : 300}</div>
        </div>
        {/* Round 9: optional document from the library, sent alongside the message */}
        {docs.length > 0 && (
          <div>
            <Label serif={serif}>{he ? 'צירוף מסמך (לא חובה)' : 'Attach a document (optional)'}</Label>
            <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.5)', margin: '-4px 2px 9px' }}>{he ? 'מהספרייה - יישלח יחד עם ההודעה.' : 'From your library - sent with the message.'}</div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              <button onClick={() => setAttachId(null)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, padding: '9px 13px', borderRadius: 12, cursor: 'pointer', font: 'inherit', fontSize: 12.5, fontWeight: 700, border: `1.5px solid ${!attachId ? accent : 'rgba(11,30,61,0.12)'}`, background: !attachId ? accent + '14' : '#fff', color: '#0B1E3D' }}>{he ? 'ללא צירוף' : 'None'}</button>
              {docs.map(d => { const on = attachId === d.id; return (
                <button key={d.id} onClick={() => setAttachId(d.id)} title={d.name} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', borderRadius: 12, cursor: 'pointer', font: 'inherit', fontSize: 12.5, fontWeight: 700, border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.12)'}`, background: on ? accent + '14' : '#fff', color: '#0B1E3D', maxWidth: 210 }}>
                  <Icon name={d.kind === 'image' ? 'image' : 'file'} size={15} color={on ? accent : 'rgba(11,30,61,0.5)'} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} dir="auto">{d.name}</span>
                  {on && <Icon name="check" size={13} color={accent} stroke={2.6} />}
                </button>
              ); })}
            </div>
          </div>
        )}
        {tpl === 'welcome' && (
          <div>
            <Label serif={serif}>{he ? 'קישורים בהודעה' : 'Links in the message'}</Label>
            <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.5)', margin: '-4px 2px 9px' }}>{he ? 'שני קישורים שמשובצים אוטומטית בנוסח, להורדת האפליקציה ולקביעת תור באתר.' : 'Two links auto-inserted into the text, app download and web booking.'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ background: '#fff', border: '1px solid rgba(11,30,61,0.1)', borderRadius: 14, padding: '4px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(200,162,74,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginInlineStart: 4 }}><Icon name="calendar" size={16} color={accent} /></span>
                <input value={links.booking} onChange={e => setLink({ booking: e.target.value })} placeholder="https://book.…" style={{ ...inp, direction: 'ltr', textAlign: 'left', fontSize: 13.5 }} />
              </div>
              <div style={{ background: '#fff', border: '1px solid rgba(11,30,61,0.1)', borderRadius: 14, padding: '4px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(200,162,74,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginInlineStart: 4 }}><Icon name="bag" size={16} color={accent} /></span>
                <input value={links.app} onChange={e => setLink({ app: e.target.value })} placeholder="https://…app" style={{ ...inp, direction: 'ltr', textAlign: 'left', fontSize: 13.5 }} />
              </div>
            </div>
          </div>
        )}
        <div>
          <Label serif={serif}>{he ? 'ערוצי שליחה' : 'Channels'}</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {channels.map(c => <CheckRow key={c.id} on={ch[c.id]} onToggle={() => setCh(p => ({ ...p, [c.id]: !p[c.id] }))} icon={c.icon} label={c.label} sub={c.id === 'banner' ? (he ? (aud === 'staff' ? 'באנר לכל הספרים' : 'באנר במסך ובאפליקציה') : (aud === 'staff' ? 'Banner to all barbers' : 'On-screen + in-app')) : (defCh === c.id ? (he ? 'ברירת מחדל' : 'Default') : '')} color={c.color} accent={accent} />)}
          </div>
        </div>
        <div>
          <Label serif={serif}>{he ? 'סוג ההודעה' : 'Message type'}</Label>
          <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.5)', margin: '-4px 2px 9px' }}>{he ? 'שיווקי נשלח רק למי שאישר לקבל. תפעולי מגיע לכולם.' : 'Marketing reaches opted-in clients only. Operational reaches everyone.'}</div>
          <div style={{ display: 'flex', gap: 9 }}>
            {[
              { id: 'operational', icon: 'bell', label: he ? 'תפעולי' : 'Operational', sub: he ? 'תזכורת · אישור · סגירה' : 'Reminder · confirm · closure', color: '#2E7D52' },
              { id: 'marketing', icon: 'spark', label: he ? 'שיווקי' : 'Marketing', sub: he ? 'מבצע · קמפיין · עדכון' : 'Offer · campaign · update', color: accent },
            ].map(k => {
              const on = kind === k.id;
              return (
                <button key={k.id} onClick={() => setKind(k.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, background: '#fff', border: `1.5px solid ${on ? k.color : 'rgba(11,30,61,0.1)'}`, borderRadius: 14, padding: '12px 13px', cursor: 'pointer', font: 'inherit', textAlign: 'start', boxShadow: on ? `0 4px 12px ${k.color}22` : 'none', transition: 'all .15s' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: on ? k.color + '1c' : 'rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={k.icon} size={15} color={on ? k.color : 'rgba(11,30,61,0.45)'} /></span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0B1E3D' }}>{k.label}</span>
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(11,30,61,0.5)', lineHeight: 1.35 }}>{k.sub}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <Label serif={serif}>{he ? 'קהל יעד' : 'Audience'}</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {audiences.map(a => (
              <button key={a.id} onClick={() => { setAud(a.id); if (a.id !== 'barber') setBarberId(null); }} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: '#fff', border: `1.5px solid ${aud === a.id ? accent : 'rgba(11,30,61,0.08)'}`, borderRadius: 14, padding: '12px 14px', cursor: 'pointer', font: 'inherit', textAlign: 'start', transition: 'all .18s' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${aud === a.id ? accent : 'rgba(11,30,61,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{aud === a.id && <span style={{ width: 11, height: 11, borderRadius: '50%', background: accent }} />}</span>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: aud === a.id ? accent + '18' : 'rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={a.icon} size={16} color={aud === a.id ? accent : 'rgba(11,30,61,0.5)'} /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5, color: '#0B1E3D' }}>{a.label}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 1 }}>{a.sub}</div>
                </div>
              </button>
            ))}
          </div>
          {/* by-barber: choose barber, then show his clients */}
          {aud === 'barber' && (
            <div style={{ marginTop: 10, background: '#fff', border: '1px solid rgba(11,30,61,0.08)', borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 9 }}>{he ? 'בחרו ספר' : 'Choose a barber'}</div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {list.map(b => (
                  <button key={b.id} onClick={() => setBarberId(b.id)} style={{ font: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 13px', borderRadius: 20, border: `1.5px solid ${barberId === b.id ? accent : 'rgba(11,30,61,0.12)'}`, background: barberId === b.id ? accent : '#fff', color: '#0B1E3D' }}>{nm(b)}</button>
                ))}
              </div>
              {barberId && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.5)', marginBottom: 7 }}>{he ? `${barberClients.length} לקוחות שהספר הראשי שלהם הוא ${nm(list.find(b => b.id === barberId))}` : `${barberClients.length} clients whose primary barber is ${nm(list.find(b => b.id === barberId))}`}</div>
                  {barberClients.length === 0 && <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.4)' }}>{he ? 'אין לקוחות קבועים לספר זה' : 'No regular clients for this barber'}</div>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {barberClients.map(c => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: '#0B1E3D' }}>
                        <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(11,30,61,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{nm(c).trim()[0]}</span>
                        {nm(c)}<span style={{ color: 'rgba(11,30,61,0.4)', fontSize: 11.5 }}>· {c.visits} {he ? 'ביקורים' : 'visits'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* manual: tick clients */}
          {aud === 'manual' && (
            <div style={{ marginTop: 10, background: '#fff', border: '1px solid rgba(11,30,61,0.08)', borderRadius: 14, padding: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(11,30,61,0.05)', borderRadius: 10, padding: '9px 11px', margin: '2px 2px 8px' }}>
                <Icon name="search" size={15} color="rgba(11,30,61,0.45)" />
                <input value={custQ} onChange={e => setCustQ(e.target.value)} placeholder={he ? 'חיפוש לפי שם או טלפון…' : 'Search name or phone…'} style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', font: 'inherit', fontSize: 13.5, color: '#0B1E3D' }} />
                {custQ && <button onClick={() => setCustQ('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}><Icon name="x" size={14} color="rgba(11,30,61,0.4)" /></button>}
              </div>
              {custFiltered.length === 0 && <div style={{ textAlign: 'center', padding: '16px 8px', fontSize: 12.5, color: 'rgba(11,30,61,0.45)' }}>{he ? 'לא נמצאו לקוחות תואמים' : 'No matching clients'}</div>}
              {custFiltered.map(c => {
                const on = !!picked[c.id];
                return (
                  <button key={c.id} onClick={() => togglePick(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', background: 'none', border: 'none', font: 'inherit', cursor: 'pointer', padding: '9px 8px', borderRadius: 10, textAlign: 'start' }}>
                    <span style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.2)'}`, background: on ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <Icon name="check" size={14} color="#fff" stroke={2.6} />}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 14, color: '#0B1E3D', fontWeight: 500 }}>{nm(c)}</span>
                      {c.phone && <span style={{ display: 'block', fontSize: 11, color: 'rgba(11,30,61,0.4)', direction: 'ltr', textAlign: he ? 'right' : 'left' }}>{c.phone}</span>}
                    </span>
                    <span style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.4)' }}>{(() => { const f = list.find(b => b.id === primOf(c)); return f ? nm(f) : ''; })()}</span>
                  </button>
                );
              })}
            </div>
          )}
          {/* Round H0 · live consent summary when this is a marketing send to customers */}
          {isMarketing && aud !== 'staff' && audienceCustomers.length > 0 && (
            <div style={{ marginTop: 11, display: 'flex', alignItems: 'flex-start', gap: 9, background: skipped > 0 ? 'rgba(200,162,74,0.1)' : 'rgba(46,125,82,0.08)', border: `1px solid ${skipped > 0 ? accent + '44' : 'rgba(46,125,82,0.25)'}`, borderRadius: 13, padding: '11px 13px' }}>
              <Icon name={skipped > 0 ? 'spark' : 'check'} size={16} color={skipped > 0 ? '#9C7B2E' : '#2E7D52'} style={{ flexShrink: 0, marginTop: 1 }} stroke={2.2} />
              <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.72)', lineHeight: 1.5 }}>
                {he
                  ? <span><b style={{ color: '#0B1E3D' }}>{consented.length}</b> מתוך {audienceCustomers.length} אישרו תוכן שיווקי{skipped > 0 ? <> · <b style={{ color: '#9C7B2E' }}>{skipped}</b> יידולגו ללא הסכמה</> : ' · כולם מאושרים'}</span>
                  : <span><b style={{ color: '#0B1E3D' }}>{consented.length}</b> of {audienceCustomers.length} opted in{skipped > 0 ? <> · <b style={{ color: '#9C7B2E' }}>{skipped}</b> will be skipped (no consent)</> : ' · all opted in'}</span>}
              </div>
            </div>
          )}
        </div>
      </Body>
      <Footer>
        <Btn kind="gold" icon="megaphone" disabled={!canSend} onClick={send}>{sent ? (he ? 'נשלח ✓' : 'Sent ✓') : (he ? `שלח${recipients ? ' · ' + recipients : ''}` : `Send${recipients ? ' · ' + recipients : ''}`)}</Btn>
      </Footer>
      {manageTpl && window.TemplateManagerSheet && <TemplateManagerSheet lang={lang} accent={accent} serif={serif} onClose={() => setManageTpl(false)} onChange={setTplList} />}
    </Shell>
  );
}

const Label = ({ children, serif }) => <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 14.5, color: '#0B1E3D', marginBottom: 9, marginInlineStart: 2 }}>{children}</div>;
const Footer = ({ children }) => <div style={{ padding: '12px 18px calc(18px + env(safe-area-inset-bottom))', flexShrink: 0, background: 'linear-gradient(to top, #FBF9F5 72%, transparent)' }}>{children}</div>;

// ─────────────────────────────────────────────────────────────
// 3 · SMS VERIFICATION
// ─────────────────────────────────────────────────────────────
function SMSVerification({ lang, t, accent, serif, onBack, onSuccess, gate }) {
  const he = lang === 'he';
  const [code, setCode] = useS2(['', '', '', '', '', '']);
  const [secs, setSecs] = useS2(300);
  const [done, setDone] = useS2(false);
  const [err, setErr] = useS2(false);
  const refs = useR2([]);
  useE2(() => { if (secs <= 0) return; const id = setInterval(() => setSecs(s => s - 1), 1000); return () => clearInterval(id); }, [secs > 0]);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0'), ss = String(secs % 60).padStart(2, '0');
  const full = code.join('');
  const setDigit = (i, v) => {
    v = v.replace(/[^0-9]/g, '');
    setErr(false);
    if (!v) { const n = [...code]; n[i] = ''; setCode(n); return; }
    const n = [...code]; n[i] = v.slice(-1); setCode(n);
    if (i < 5) refs.current[i + 1]?.focus();
  };
  const onKey = (i, e) => { if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus(); };
  const verify = () => {
    if (full.length < 6) return;
    if (full === '123456' || full.endsWith('00')) { /* demo accepts these */ }
    setDone(true);
    setTimeout(() => { onSuccess && onSuccess(); }, 1400);
  };
  const resend = () => { setSecs(300); setCode(['', '', '', '', '', '']); setErr(false); refs.current[0]?.focus(); };

  if (done) {
    return (
      <Shell>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', textAlign: 'center', background: 'linear-gradient(180deg,#0B1E3D,#0E2A52)' }}>
          <div className="succ-pop" style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 18px 50px rgba(200,162,74,0.5)', marginBottom: 24 }}><Icon name="check" size={46} color="#0B1E3D" stroke={2.6} /></div>
          <div className="succ-rise" style={{ fontFamily: serif, fontWeight: 700, fontSize: 27, color: '#FBF9F5' }}>{he ? 'אומת בהצלחה!' : 'Verified!'}</div>
          <div className="succ-rise succ-d1" style={{ fontSize: 14.5, color: 'rgba(251,249,245,0.7)', marginTop: 8 }}>{he ? 'מעבירים אותך לאפליקציה…' : 'Taking you in…'}</div>
        </div>
      </Shell>
    );
  }
  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'הרשמה' : 'Sign up'} title={he ? 'אישור מספר טלפון' : 'Verify your phone'} onBack={onBack} />
      <Body style={{ gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8, marginTop: 8 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6, boxShadow: '0 10px 24px rgba(11,30,61,0.2)' }}><Icon name="message" size={30} color="#E4C97B" /></div>
          <div style={{ fontSize: 14.5, color: 'rgba(11,30,61,0.6)', lineHeight: 1.5, maxWidth: 260 }}>{he ? 'שלחנו SMS עם קוד בן 6 ספרות אל' : 'We sent a 6-digit code to'} <span style={{ fontWeight: 700, color: '#0B1E3D', direction: 'ltr', unicodeBidi: 'isolate' }}>050-000-0000</span></div>
        </div>

        <div dir="ltr" style={{ display: 'flex', gap: 9, justifyContent: 'center', margin: '6px 0' }}>
          {code.map((d, i) => (
            <input key={i} ref={el => refs.current[i] = el} value={d} inputMode="numeric" maxLength={1}
              onChange={e => setDigit(i, e.target.value)} onKeyDown={e => onKey(i, e)}
              style={{ width: 46, height: 56, textAlign: 'center', fontSize: 24, fontWeight: 700, fontFamily: serif, color: '#0B1E3D',
                border: `1.5px solid ${err ? '#B03A3A' : d ? accent : 'rgba(11,30,61,0.15)'}`, borderRadius: 14, outline: 'none', background: '#fff',
                boxShadow: d ? `0 4px 12px ${accent}33` : 'none', transition: 'all .15s' }} />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <Icon name="clock" size={15} color={secs > 0 ? accent : '#B03A3A'} />
          <span style={{ fontSize: 13.5, color: secs > 0 ? 'rgba(11,30,61,0.6)' : '#B03A3A', fontWeight: 600 }}>
            {secs > 0 ? (he ? `הקוד בתוקף ל-${mm}:${ss}` : `Code expires in ${mm}:${ss}`) : (he ? 'הקוד פג תוקף' : 'Code expired')}
          </span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={resend} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: accent, fontWeight: 700, fontSize: 14, padding: 8 }}>
            <Icon name="refresh" size={15} color={accent} />{he ? 'שלח שוב' : 'Resend code'}
          </button>
        </div>
      </Body>
      <Footer>
        <Btn kind="primary" icon="check" disabled={full.length < 6} onClick={verify}>{he ? 'אמת וכנס' : 'Verify & continue'}</Btn>
      </Footer>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// 4 · STAFF MANAGEMENT
// ─────────────────────────────────────────────────────────────
function StaffManagement({ lang, t, accent, serif, onBack, staff, updateBarber, addBarber, removeBarber, appts, setAppts, toast }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const [disableTarget, setDisableTarget] = useS2(null);
  const [schedConflict, setSchedConflict] = useS2(null);
  const _pad = n => String(n).padStart(2, '0');
  const _today = (() => { const d = new Date(); return `${d.getFullYear()}-${_pad(d.getMonth() + 1)}-${_pad(d.getDate())}`; })();
  const requestToggle = (r) => {
    if (r.active === false) { updateBarber(r.id, { active: true }); return; } // re-enabling is safe
    const fut = (appts || []).filter(a => a.barberId === r.id && a.date >= _today && a.status !== 'done' && a.status !== 'no' && a.status !== 'rejected' && a.status !== 'cancelled');
    if (fut.length) setDisableTarget(r); else updateBarber(r.id, { active: false });
  };
  const [sheet, setSheet] = useS2(null); // { barber, tab, isNew }
  const [weekFor, setWeekFor] = useS2(null); // barber whose weekly schedule is open
  const [exFor, setExFor] = useS2(null);     // barber whose exception days are open
  const [exConflict, setExConflict] = useS2(null);
  const list = staff || [];
  const chips = [
    { id: 'details', icon: 'pencil', label: he ? 'עריכה' : 'Edit' },
    { id: 'photo', icon: 'home', label: he ? 'תמונה' : 'Photo' },
    { id: 'hours', icon: 'calendar', label: he ? 'לו״ז' : 'Schedule' },
    { id: 'services', icon: 'scissors', label: he ? 'שירותים' : 'Services' },
  ];
  const openNew = () => setSheet({ barber: { id: 'b' + Date.now(), he: '', en: '', phone: '', tagHe: '', tagEn: '', tone: list.length % 4, rating: 5.0, reviews: 0, active: true, start: '09:00', end: '18:00', breaks: [], services: DATA.services.map(s => s.id) }, tab: 'details', isNew: true });
  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל' : 'Admin'} title={he ? 'ניהול צוות' : 'Staff management'} onBack={onBack}
        right={<span style={{ fontSize: 12.5, fontWeight: 700, color: accent, background: 'rgba(200,162,74,0.12)', padding: '5px 11px', borderRadius: 20 }}>{list.length} {he ? 'ספרים' : 'staff'}</span>} />
      <Body>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: 'rgba(200,162,74,0.1)', border: `1px solid ${accent}33`, borderRadius: 14, padding: '11px 13px' }}>
          <Icon name="refresh" size={17} color={accent} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.7)', lineHeight: 1.5 }}>{he ? 'השבת ספר כדי לעצור כניסה ותורים חדשים, ההיסטוריה והנתונים נשמרים. עדיף תמיד על מחיקה.' : 'Disable a barber to stop sign-in and new bookings, all history is kept. Always better than deleting.'}</div>
        </div>
        {list.map((r, k) => {
          const off = r.active === false;
          return (
          <div key={r.id} className="s2-rise" style={{ animationDelay: (k * 70) + 'ms', background: '#fff', borderRadius: 20, padding: 15, boxShadow: '0 3px 12px rgba(11,30,61,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <button onClick={() => setSheet({ barber: r, tab: 'photo' })} style={{ position: 'relative', flexShrink: 0, padding: 0, border: 'none', background: 'none', cursor: 'pointer', opacity: off ? 0.7 : 1 }}>
                <span style={{ display: 'block', width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px rgba(200,162,74,0.85)' }}>
                  <ImgSlot id={'staff-' + r.id} shape="circle" placeholder={he ? 'תמונה' : 'photo'} style={{ width: 52, height: 52 }} />
                </span>
              </button>
              <button onClick={() => setSheet({ barber: r, tab: 'details' })} style={{ flex: 1, minWidth: 0, textAlign: 'start', border: 'none', background: 'none', font: 'inherit', cursor: 'pointer', opacity: off ? 0.7 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: window.barberColor ? window.barberColor(r.id, list) : accent, flexShrink: 0 }} title={he ? 'הצבע של הספר ביומן' : 'Calendar color'} />
                  <span style={{ fontWeight: 600, fontSize: 16, color: '#0B1E3D', fontFamily: serif }}>{nm(r)}</span>
                  {off && <span style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(11,30,61,0.45)', background: 'rgba(11,30,61,0.06)', padding: '2px 7px', borderRadius: 20 }}>{he ? 'לא במשמרת' : 'Off'}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, fontSize: 12.5, color: 'rgba(11,30,61,0.55)' }}>
                  <Icon name="clock" size={13} color={accent} /><span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{r.start}-{r.end}</span>
                  <span style={{ color: 'rgba(11,30,61,0.2)' }}>·</span>
                  <Icon name="scissors" size={13} color={accent} /><span>{(r.services || []).length} {he ? 'שירותים' : 'services'}</span>
                </div>
              </button>
              <button onClick={() => requestToggle(r)} title={off ? (he ? 'הפעל ספר' : 'Enable') : (he ? 'השבת ספר' : 'Disable')} style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: 'none', cursor: 'pointer', font: 'inherit', flexShrink: 0, padding: 0 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: off ? 'rgba(11,30,61,0.4)' : '#2E7D52' }}>{off ? (he ? 'מושבת' : 'Off') : (he ? 'פעיל' : 'On')}</span>
                <span style={{ width: 44, height: 26, borderRadius: 14, padding: 3, background: off ? 'rgba(11,30,61,0.18)' : '#2E7D52', display: 'flex', justifyContent: off ? 'flex-start' : 'flex-end', transition: 'all .2s' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', transition: 'all .2s' }} />
                </span>
              </button>
            </div>
            <div style={{ marginTop: 13, display: 'flex', gap: 8 }}>
              <button onClick={() => setWeekFor(r)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', borderRadius: 12, border: `1px solid ${accent}33`, background: `${accent}10`, cursor: 'pointer', font: 'inherit', fontSize: 13, fontWeight: 700, color: '#0B1E3D' }}>
                <Icon name="calendar" size={16} color={accent} />{he ? 'לו״ז שבועי' : 'Weekly'}
              </button>
              <button onClick={() => setExFor(r)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', borderRadius: 12, border: `1px solid ${accent}33`, background: `${accent}10`, cursor: 'pointer', font: 'inherit', fontSize: 13, fontWeight: 700, color: '#0B1E3D' }}>
                <Icon name="pin" size={16} color={accent} />{he ? 'ימים חריגים' : 'Exceptions'}{(r.exceptions && Object.keys(r.exceptions).filter(d => d >= _today).length) ? <span style={{ fontSize: 10.5, fontWeight: 800, color: accent, background: accent + '22', borderRadius: 9, padding: '1px 6px' }}>{Object.keys(r.exceptions).filter(d => d >= _today).length}</span> : null}
              </button>
            </div>
          </div>
          );
        })}
      </Body>
      <Footer>
        <Btn kind="primary" icon="plus" onClick={openNew}>{he ? 'הוסף ספר חדש' : 'Add new barber'}</Btn>
      </Footer>
      {sheet && <BarberSheet lang={lang} t={t} accent={accent} serif={serif} barber={sheet.barber} staff={list} initialTab={sheet.tab} isNew={sheet.isNew}
        onClose={() => setSheet(null)}
        onSave={(b) => { sheet.isNew ? addBarber(b) : updateBarber(b.id, b); setSheet(null); }}
        onDelete={() => { removeBarber(sheet.barber.id); setSheet(null); }} />}
      {weekFor && <WeeklyScheduleEditor lang={lang} t={t} accent={accent} serif={serif} barber={weekFor} adminName={nm(weekFor)} onClose={() => setWeekFor(null)} onSave={(week) => { const cf = window.weekConflicts ? window.weekConflicts(weekFor, week, appts) : []; updateBarber(weekFor.id, { week }); setWeekFor(null); if (cf.length) setSchedConflict(cf); }} />}
      {exFor && <ExceptionsEditor lang={lang} t={t} accent={accent} serif={serif} barber={exFor} adminName={nm(exFor)} appts={appts} onClose={() => setExFor(null)} onSave={(exceptions) => { const cf = window.exceptionConflicts ? window.exceptionConflicts(exFor, exceptions, appts) : []; updateBarber(exFor.id, { exceptions }); setExFor(null); const refunds = window.punchStore ? window.punchStore.openRefundsForAbsence(cf) : 0; if (refunds) toast && toast(he ? `${refunds} תורים ששולמו מראש · נפתחה התראת החזר` : `${refunds} prepaid · refund alert opened`, he ? 'יש לטפל בהחזר ידנית (ביט/פייבוקס)' : 'Handle refund manually (Bit/PayBox)'); if (cf.length) setExConflict(cf); }} />}
      {exConflict && <ConflictSheet lang={lang} accent={accent} serif={serif} conflicts={exConflict} staff={list}
        title={he ? 'החריג יצר התנגשות' : 'Exception conflicts'} sub={he ? 'תורים שנופלים ביום סגור או מחוץ לשעות המיוחדות. הזיזו אותם או הודיעו ללקוחות.' : 'Bookings on a closed day or outside special hours.'}
        onClose={() => setExConflict(null)}
        onNotify={() => { const n = exConflict.length; setExConflict(null); toast && toast(he ? `נשלחה הודעה ל-${n} לקוחות ✓` : `Notified ${n} ✓`, he ? 'הוצע מועד חלופי' : 'Rebook offered'); }} />}
      {schedConflict && <ConflictSheet lang={lang} accent={accent} serif={serif} conflicts={schedConflict} staff={list}
        title={he ? 'שינוי הלו״ז יצר התנגשות' : 'Schedule change conflicts'} sub={he ? 'תורים שנופלים מחוץ לשעות החדשות או בתוך הפסקה. הזיזו אותם או הודיעו ללקוחות.' : 'Bookings now outside hours or inside a break.'}
        onClose={() => setSchedConflict(null)}
        onNotify={() => { const n = schedConflict.length; setSchedConflict(null); toast && toast(he ? `נשלחה הודעה ל-${n} לקוחות ✓` : `Notified ${n} ✓`, he ? 'הוצע מועד חלופי' : 'Rebook offered'); }} />}
      {disableTarget && <DisableBarberSheet lang={lang} accent={accent} serif={serif} barber={disableTarget} appts={appts} staff={list} onClose={() => setDisableTarget(null)}
        onResolve={(resolutions) => {
          // Round B · per-appointment resolution: move (keep slot, new barber) or cancel+notify
          const moveMap = {}; const cancelIds = new Set();
          (resolutions || []).forEach(r => { if (r.mode === 'move' && r.to) moveMap[r.id] = r.to; else if (r.mode === 'cancel') cancelIds.add(r.id); });
          setAppts(prev => prev.map(a => {
            if (moveMap[a.id]) return { ...a, barberId: moveMap[a.id] };
            if (cancelIds.has(a.id)) return { ...a, status: 'cancelled' };
            return a;
          }));
          const movedN = Object.keys(moveMap).length, cancelledN = cancelIds.size;
          const parts = [];
          if (movedN) parts.push(he ? `${movedN} הועברו` : `${movedN} moved`);
          if (cancelledN) parts.push(he ? `${cancelledN} בוטלו` : `${cancelledN} cancelled`);
          toast && toast(he ? `${nm(disableTarget)} הושבת · ${parts.join(' · ') || 'אין תורים'}` : `${nm(disableTarget)} disabled · ${parts.join(' · ') || 'no bookings'}`, he ? 'הלקוחות המושפעים עודכנו ✓' : 'Affected clients notified ✓');
          updateBarber(disableTarget.id, { active: false });
          setDisableTarget(null);
        }} />}
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────
// 5 · TIME TO LEAVE ALERT
// ─────────────────────────────────────────────────────────────
function TimeToLeave({ lang, t, accent, serif, onBack, address, session, initialOrigin }) {
  const he = lang === 'he';
  const [navOpen, setNavOpen] = useS2(false); // Round A: OS nav-app chooser
  const pad = n => String(n).padStart(2, '0');
  const homeAddr = address || (session && (session.address || session.region)) || (he ? 'אוסישקין 41, ירושלים' : '41 Ussishkin, Jerusalem');
  const hasHome = !!(address || (session && (session.address || session.region)));
  const curAddr = he ? 'המיקום הנוכחי שלך' : 'Your current location';
  // origin: 'home' = profile address (default) | 'current' = live GPS location
  const [origin, setOrigin] = useS2(initialOrigin || 'home');
  const [locating, setLocating] = useS2(false);
  const pickCurrent = () => { setLocating(true); setTimeout(() => { setLocating(false); setOrigin('current'); }, 1100); };
  const activeAddr = origin === 'home' ? homeAddr : curAddr;
  // drive time is derived from the SELECTED origin, switching recomputes “time to leave”
  const drive = origin === 'home'
    ? ((window.estTravelMin && hasHome ? window.estTravelMin(homeAddr) : 0) || 15)
    : ((window.estTravelMin ? window.estTravelMin('gps-' + homeAddr) : 0) || 11);
  const now = new Date();
  const leaveAt = new Date(now.getTime() + Math.max(0, 20 - drive) * 60000);
  const leaveLbl = `${pad(leaveAt.getHours())}:${pad(leaveAt.getMinutes())}`;
  const addrLbl = activeAddr;
  const opts = [
    { id: 'home', icon: 'pin', label: t.originHome, sub: hasHome ? homeAddr : t.originNoHome },
    { id: 'current', icon: 'navigate', label: t.originCurrent, sub: t.originCurrentSub },
  ];
  return (
    <Shell>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#0B1E3D,#0E2A52)', zIndex: -1 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '54px 22px 28px' }}>
        <div className="s2-pop" style={{ background: '#FBF9F5', borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.5)' }}>
          {/* alert banner */}
          <div style={{ background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="ttl-bell" style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(11,30,61,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="clock" size={26} color="#0B1E3D" /></span>
            <div>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: '#0B1E3D', lineHeight: 1 }}>{he ? 'זמן לצאת! ⏰' : "Time to leave! ⏰"}</div>
              <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.7)', fontWeight: 600, marginTop: 4 }}>{he ? 'תורך מתקרב' : 'Your visit is coming up'}</div>
            </div>
          </div>

          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* ORIGIN PICKER, two options; the choice feeds the leave-time calc */}
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 8, marginInlineStart: 2 }}>{t.originTitle}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {opts.map(o => {
                  const on = origin === o.id;
                  const busy = o.id === 'current' && locating;
                  return (
                    <button key={o.id} onClick={() => o.id === 'current' ? pickCurrent() : setOrigin('home')} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', background: on ? accent + '14' : '#fff', border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.1)'}`, borderRadius: 14, padding: '11px 13px', cursor: 'pointer', font: 'inherit', textAlign: 'start', transition: 'all .18s' }}>
                      <span style={{ position: 'relative', width: 34, height: 34, borderRadius: 10, background: on ? accent + '22' : 'rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {busy && <><span className="geo-ping" style={{ borderColor: accent }} /><span className="geo-ping geo-ping-2" style={{ borderColor: accent }} /></>}
                        <Icon name={o.icon} size={18} color={on ? accent : 'rgba(11,30,61,0.5)'} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0B1E3D' }}>{o.label}</div>
                        <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{busy ? t.originLocating : o.sub}</div>
                      </div>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <span style={{ width: 10, height: 10, borderRadius: '50%', background: accent }} />}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <InfoPill icon="clock" big="20" unit={he ? 'דק׳ לתור' : 'min to visit'} accent={accent} serif={serif} />
              <InfoPill icon="navigate" big={String(drive)} unit={he ? 'דק׳ נסיעה' : 'min drive'} accent={accent} serif={serif} />
            </div>

            <div style={{ background: 'rgba(200,162,74,0.1)', border: `1px solid ${accent}44`, borderRadius: 16, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 11 }}>
              <Icon name="navigate" size={20} color={accent} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.6)' }}>{he ? 'מומלץ לצאת עכשיו, בשעה' : 'Leave now, at'}</div>
                <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D', direction: 'ltr', textAlign: 'start' }}>{leaveLbl}</div>
              </div>
              <Avatar b={DATA.barbers[0]} size={40} lang={lang} />
            </div>

            {/* mini map preview */}
            <div style={{ position: 'relative', height: 120, borderRadius: 16, overflow: 'hidden', background: '#dfe6ec' }}>
              <svg viewBox="0 0 300 120" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <rect width="300" height="120" fill="#e7edf2" />
                <path d="M-10 70 Q80 60 130 80 T320 60" fill="none" stroke="#c9d4dd" strokeWidth="14" />
                <path d="M40 130 L120 40 L150 55 L210 -10" fill="none" stroke="#cfd9e1" strokeWidth="10" />
                <path d="M30 105 Q110 70 165 78 T255 35" fill="none" stroke={accent} strokeWidth="4" strokeDasharray="2 6" strokeLinecap="round" />
              </svg>
              <span style={{ position: 'absolute', insetInlineStart: 26, bottom: 16, transform: 'translate(-50%,50%)' }}><span style={{ display: 'block', width: 14, height: 14, borderRadius: '50%', background: '#2A6FDB', boxShadow: '0 0 0 4px rgba(42,111,219,0.25)' }} /></span>
              <span style={{ position: 'absolute', insetInlineEnd: 30, top: 26 }}><Icon name="pin" size={28} color="#0B1E3D" fill="solid" /></span>
              <span style={{ position: 'absolute', insetInlineStart: 10, top: 10, fontSize: 10.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', background: 'rgba(255,255,255,0.8)', padding: '3px 8px', borderRadius: 7, maxWidth: '80%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{addrLbl}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <Btn kind="gold" icon="navigate" onClick={() => setNavOpen(true)}>{he ? 'נווט למספרה' : 'Navigate to the shop'}</Btn>
              <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(11,30,61,0.55)', font: 'inherit', fontSize: 14.5, fontWeight: 600, padding: 10, cursor: 'pointer' }}>{he ? 'הזכר לי בעוד 5 דקות' : 'Snooze 5 min'}</button>
            </div>
          </div>
        </div>
      </div>
      {navOpen && window.NavChooserSheet && <NavChooserSheet lang={lang} accent={accent} serif={serif} onClose={() => setNavOpen(false)} />}
    </Shell>
  );
}
function InfoPill({ icon, big, unit, accent, serif }) {
  return (
    <div style={{ flex: 1, background: 'linear-gradient(140deg,#14305A,#0B1E3D)', borderRadius: 16, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon name={icon} size={22} color="#E4C97B" />
      <div><div style={{ fontFamily: serif, fontWeight: 700, fontSize: 24, color: '#FBF9F5', lineHeight: 1, direction: 'ltr', textAlign: 'start' }}>{big}</div><div style={{ fontSize: 10.5, color: 'rgba(251,249,245,0.65)', marginTop: 3 }}>{unit}</div></div>
    </div>
  );
}

// ── Router + launcher metadata ──
const NEW_SCREENS = [
  { id: 'dashboard', he: 'לוח בקרה', en: 'Dashboard', icon: 'chart' },
  { id: 'broadcast', he: 'שליחת הודעה', en: 'Broadcast', icon: 'megaphone' },
  { id: 'sms', he: 'אימות SMS', en: 'SMS verify', icon: 'message' },
  { id: 'staff', he: 'ניהול צוות', en: 'Staff', icon: 'users' },
  { id: 'leave', he: 'זמן לצאת', en: 'Leave alert', icon: 'clock' },
];

function NewScreen({ which, lang, t, accent, serif, onBack, setWhich, notify }) {
  const go = (id) => { if (id === 'broadcast') setWhich('broadcast'); else if (id === 'staff') setWhich('staff'); else if (id === 'settings') setWhich('dashboard'); };
  switch (which) {
    case 'dashboard': return <AdminDashboard lang={lang} t={t} accent={accent} serif={serif} onBack={onBack} go={go} />;
    case 'broadcast': return <BroadcastScreen lang={lang} t={t} accent={accent} serif={serif} onBack={onBack} notify={notify} />;
    case 'sms': return <SMSVerification lang={lang} t={t} accent={accent} serif={serif} onBack={onBack} onSuccess={onBack} />;
    case 'staff': return <StaffManagement lang={lang} t={t} accent={accent} serif={serif} onBack={onBack} />;
    case 'leave': return <TimeToLeave lang={lang} t={t} accent={accent} serif={serif} onBack={onBack} />;
    default: return null;
  }
}

Object.assign(window, { NewScreen, NEW_SCREENS, AdminDashboard, OwnerModeToggle, CoreMetric, NoShowsScreen, InsightsScreen, TrendsScreen, BroadcastScreen, SMSVerification, StaffManagement, TimeToLeave, Shell, Body, ScreenHead, Footer, Label });
