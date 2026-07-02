// automations.jsx - Round H1: CRM automation engine.
// Two strata, deliberately separated:
//   automationGuard  - the COMPLIANCE layer. Always-on, NOT manager-controllable:
//       consent filter (H0), quiet-hours (night / Shabbat / holiday) with deferral,
//       and the opt-out path that every marketing message already carries. This is
//       the legal floor; Rafi cannot switch it off or route around it.
//   automationStore - the four automations Rafi DOES control: on/off, message
//       content, and parameters. Plus a sent-log per automation for transparency.
// Exposes window.automationGuard, window.automationStore, window.runAutomation,
// window.automationCandidates, and the React <AutomationsScreen>.

const { useState: useAuto } = React;

function _ymd(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function _atMorning(d, addDays) { const n = new Date(d); n.setDate(n.getDate() + (addDays || 0)); n.setHours(8, 0, 0, 0); return n; }

// ───────────────────────── Compliance layer (fixed) ─────────────────────────
const automationGuard = {
  ALLOWED_START: 8 * 60,    // 08:00 - earliest a marketing message may leave
  ALLOWED_END: 21 * 60,     // 21:00 - latest
  // Prototype holiday closures (production would read a zmanim/Hebcal API).
  HOLIDAYS: ['2026-09-12', '2026-09-13', '2026-09-21', '2026-09-22', '2026-10-03', '2026-10-04'],

  isHoliday(d) { return this.HOLIDAYS.indexOf(_ymd(d)) !== -1; },
  // Shabbat is always quiet for MARKETING, independent of the Shabbat-mode toggle.
  isShabbat(d) {
    const day = d.getDay(), m = d.getHours() * 60 + d.getMinutes();
    if (day === 6) return m < (19 * 60 + 45);   // Saturday until ~exit
    if (day === 5) return m >= (18 * 60 + 30);  // Friday from ~entry
    return false;
  },
  isNight(d) { const m = d.getHours() * 60 + d.getMinutes(); return m < this.ALLOWED_START || m >= this.ALLOWED_END; },
  // why is now quiet? null === allowed
  reason(d) {
    d = d || new Date();
    if (this.isShabbat(d)) return 'shabbat';
    if (this.isHoliday(d)) return 'holiday';
    if (this.isNight(d)) return 'night';
    return null;
  },
  isQuiet(d) { return !!this.reason(d || new Date()); },
  // the next moment a marketing message is permitted to leave
  nextAllowed(from) {
    let t = new Date(from || Date.now());
    for (let guard = 0; guard < 60; guard++) {
      if (this.isShabbat(t) || this.isHoliday(t)) { t = _atMorning(t, 1); continue; }
      const m = t.getHours() * 60 + t.getMinutes();
      if (m >= this.ALLOWED_END) { t = _atMorning(t, 1); continue; }
      if (m < this.ALLOWED_START) { t.setHours(8, 0, 0, 0); }
      if (!this.isQuiet(t)) return t;
    }
    return t;
  },
  hasConsent(id) { return !window.consentStore || window.consentStore.hasFor(id); },
};

// ───────────────────────── Automation definitions ─────────────────────────
const AUTO_DEFS = [
  {
    id: 'reminder', kind: 'operational', icon: 'clock', color: '#1F8A5B',
    he: { name: 'תזכורת תור', desc: 'נשלחת אוטומטית לפני כל תור - לכל הלקוחות, ללא צורך בהסכמה.' },
    en: { name: 'Appointment reminder', desc: 'Sent automatically before every appointment - to all clients, no consent needed.' },
    params: [{
      key: 'hoursBefore', kind: 'choice',
      he: 'מתי לשלוח', en: 'When to send',
      options: [{ v: 24, he: '24 שעות לפני', en: '24h before' }, { v: 48, he: '48 שעות לפני', en: '48h before' }, { v: 3, he: '3 שעות לפני', en: '3h before' }],
    }],
    defaultEnabled: true,
    content: {
      he: 'שלום {name}, תזכורת לתור שלך {time}. אם משהו השתנה עדכנו אותנו. נתראה! מספרפי.',
      en: 'Hi {name}, a reminder of your appointment {time}. If anything changed, let us know. See you! Barbershop.',
    },
  },
  {
    id: 'dormant', kind: 'marketing', icon: 'refresh', color: '#C8A24A',
    he: { name: 'לקוח רדום', desc: 'פנייה רכה ללקוח שלא ביקר זמן מה.' },
    en: { name: 'Dormant client', desc: 'A soft nudge to a client who hasn’t visited in a while.' },
    params: [{ key: 'days', kind: 'number', he: 'ימים ללא ביקור', en: 'Days inactive', min: 14, max: 365, step: 1, default: 60, unitHe: 'ימים', unitEn: 'days' }],
    defaultEnabled: true,
    content: {
      he: 'שלום {name}, מתגעגעים! עבר זמן מאז הביקור האחרון. נשמח לראותך שוב - אפשר לקבוע תור באפליקציה. מספרפי.',
      en: 'Hi {name}, we miss you! It’s been a while since your last visit. We’d love to see you - book in the app. Barbershop.',
    },
  },
  {
    id: 'birthday', kind: 'marketing', icon: 'spark', color: '#B0413A',
    he: { name: 'יום הולדת', desc: 'ברכה ללקוח ביום הולדתו.', optional: 'דורש תאריך לידה בכרטיס הלקוח (אופציונלי)' },
    en: { name: 'Birthday', desc: 'Wish a client a happy birthday.', optional: 'Requires a birth date on the client card (optional)' },
    params: [],
    defaultEnabled: false,
    content: {
      he: 'מזל טוב {name}! כל צוות מספרפי מאחל לך יום הולדת שמח 🎉 נשמח לארח אותך לתספורת חגיגית.',
      en: 'Happy birthday {name}! The whole Barbershop team wishes you a wonderful day 🎉 Come in for a fresh cut.',
    },
  },
  {
    id: 'review', kind: 'marketing', icon: 'star', color: '#8E5BD0',
    he: { name: 'בקשת ביקורת', desc: 'אחרי תור שהושלם - בקשה לשתף חוויה. ללא תמרוץ, רק הזמנה לשתף.' },
    en: { name: 'Review request', desc: 'After a completed visit - ask to share. No incentive, just an invitation.' },
    params: [],
    defaultEnabled: true,
    content: {
      he: 'שלום {name}, תודה שביקרת אצלנו! נשמח אם תשתף את החוויה שלך - זה עוזר ללקוחות אחרים. מספרפי.',
      en: 'Hi {name}, thanks for visiting! We’d love it if you shared your experience - it helps others. Barbershop.',
    },
  },
];
const autoDef = id => AUTO_DEFS.find(a => a.id === id);

// ───────────────────────── Manager-controlled store ─────────────────────────
const automationStore = {
  KEY: 'royale_automations_v1',
  _load() { try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; } catch (e) { return {}; } },
  _save(m) { try { localStorage.setItem(this.KEY, JSON.stringify(m)); } catch (e) {} },
  _entry(id) { return this._load()[id] || {}; },
  _set(id, patch) { const m = this._load(); m[id] = { ...(m[id] || {}), ...patch }; this._save(m); },

  isEnabled(id) { const e = this._entry(id); if ('enabled' in e) return !!e.enabled; return !!autoDef(id).defaultEnabled; },
  setEnabled(id, v) { this._set(id, { enabled: !!v }); },

  param(id, key) {
    const e = this._entry(id);
    if (e.params && key in e.params) return e.params[key];
    const p = (autoDef(id).params || []).find(x => x.key === key);
    if (!p) return null;
    return p.default != null ? p.default : (p.options ? p.options[0].v : null);
  },
  setParam(id, key, val) { const e = this._entry(id); this._set(id, { params: { ...(e.params || {}), [key]: val } }); },

  content(id, lang) { const e = this._entry(id); if (e.content && e.content[lang] != null) return e.content[lang]; return autoDef(id).content[lang]; },
  setContent(id, lang, text) { const e = this._entry(id); this._set(id, { content: { ...(e.content || {}), [lang]: text } }); },
  isContentEdited(id, lang) { const e = this._entry(id); return !!(e.content && e.content[lang] != null && e.content[lang] !== autoDef(id).content[lang]); },
  resetContent(id, lang) { const m = this._load(); if (m[id] && m[id].content) { delete m[id].content[lang]; this._save(m); } },

  log(id) { return this._entry(id).log || []; },
  pushLog(id, entry) { const e = this._entry(id); this._set(id, { log: [entry, ...(e.log || [])].slice(0, 6) }); },
};

// ───────────────────────── Eligibility + run ─────────────────────────
// Resolve an appointment to a consent-bearing customer by name (prototype matching).
function _custByName(name) { return DATA.customers.find(c => c.he === name || c.en === name) || null; }
function _today() { return _ymd(new Date()); }
function _tomorrow() { const d = new Date(); d.setDate(d.getDate() + 1); return _ymd(d); }

// Candidates BEFORE any compliance filtering. Returns [{ key, name, cid, consent }].
function automationCandidates(id, appts) {
  const A = appts || [];
  const wrap = (name, cid) => ({ key: cid || name, name, cid: cid || null, consent: cid ? automationGuard.hasConsent(cid) : false });

  if (id === 'reminder') {
    const tm = _tomorrow(), seen = {}, out = [];
    A.filter(a => a.date === tm && ['confirmed', 'upcoming', 'next', 'booked'].indexOf(a.status) !== -1)
      .forEach(a => { const nm = a.clientHe || a.clientEn; const c = a.clientId ? DATA.customers.find(x => x.id === a.clientId) : _custByName(nm); const k = (c && c.id) || nm; if (!seen[k]) { seen[k] = 1; out.push(wrap(nm, c && c.id)); } });
    return out;
  }
  if (id === 'dormant') {
    const days = automationStore.param('dormant', 'days');
    return (window.dormantClients ? window.dormantClients(days) : []).map(c => wrap(c.he, c.id));
  }
  if (id === 'birthday') {
    const md = _today().slice(5);
    return DATA.customers.filter(c => c.birthday && c.birthday.slice(5) === md).map(c => wrap(c.he, c.id));
  }
  if (id === 'review') {
    const td = _today(), seen = {}, out = [];
    A.filter(a => a.date === td && a.status === 'done')
      .forEach(a => { const nm = a.clientHe || a.clientEn; const c = a.clientId ? DATA.customers.find(x => x.id === a.clientId) : _custByName(nm); const k = (c && c.id) || nm; if (!seen[k]) { seen[k] = 1; out.push(wrap(nm, c && c.id)); } });
    return out;
  }
  return [];
}

// Pure run: what WOULD happen now. Applies the compliance layer for marketing.
// Returns { enabled, kind, candidates, recipients, skippedConsent, deferred, nextAt, reason }.
function runAutomation(id, appts, now) {
  const def = autoDef(id);
  const enabled = automationStore.isEnabled(id);
  const cands = automationCandidates(id, appts);
  if (!enabled) return { enabled: false, kind: def.kind, candidates: cands.length, recipients: 0, skippedConsent: 0, deferred: false };

  if (def.kind === 'operational') {
    // operational bypasses BOTH consent and quiet-hours - it is part of the service
    return { enabled: true, kind: 'operational', candidates: cands.length, recipients: cands.length, skippedConsent: 0, deferred: false };
  }
  // marketing: consent filter (always), then quiet-hours deferral (always)
  const consented = cands.filter(c => c.consent);
  const skippedConsent = cands.length - consented.length;
  const reason = automationGuard.reason(now || new Date());
  if (reason) {
    return { enabled: true, kind: 'marketing', candidates: cands.length, recipients: consented.length, skippedConsent, deferred: true, nextAt: automationGuard.nextAllowed(now || new Date()), reason };
  }
  return { enabled: true, kind: 'marketing', candidates: cands.length, recipients: consented.length, skippedConsent, deferred: false };
}

// ───────────────────────── UI ─────────────────────────
function _fmtNext(d, he) {
  if (!d) return '';
  const now = new Date(); const sameDay = _ymd(d) === _ymd(now);
  const tm = d.toLocaleTimeString(he ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  if (sameDay) return (he ? 'היום ' : 'today ') + tm;
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  if (_ymd(d) === _ymd(tomorrow)) return (he ? 'מחר ' : 'tomorrow ') + tm;
  return d.toLocaleDateString(he ? 'he-IL' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' }) + ' ' + tm;
}
const QUIET_REASON = {
  night: { he: 'שעות לילה', en: 'night hours' },
  shabbat: { he: 'שבת', en: 'Shabbat' },
  holiday: { he: 'חג', en: 'holiday' },
};

// One automation card - toggle, live status, params, editable content, sent-log.
function AutoCard({ def, lang, accent, serif, appts, toast, onChange }) {
  const he = lang === 'he';
  const [open, setOpen] = useAuto(false);
  const enabled = automationStore.isEnabled(def.id);
  const run = runAutomation(def.id, appts);
  const content = automationStore.content(def.id, lang);
  const marketing = def.kind === 'marketing';
  const log = automationStore.log(def.id);

  const toggle = () => { automationStore.setEnabled(def.id, !enabled); onChange(); };
  const editContent = (v) => { automationStore.setContent(def.id, lang, v); onChange(); };
  const resetContent = () => { automationStore.resetContent(def.id, lang); onChange(); };
  const setParam = (k, v) => { automationStore.setParam(def.id, k, v); onChange(); };

  // status line
  let statusEl;
  if (!enabled) {
    statusEl = <span style={{ color: 'rgba(11,30,61,0.4)' }}>{he ? 'כבויה - לא נשלח דבר' : 'Off - nothing is sent'}</span>;
  } else if (run.deferred) {
    statusEl = <span style={{ color: '#9C7B2E' }}>{he ? `ממתינה (${QUIET_REASON[run.reason].he}) · תישלח ${_fmtNext(run.nextAt, he)}` : `Waiting (${QUIET_REASON[run.reason].en}) · sends ${_fmtNext(run.nextAt, he)}`}</span>;
  } else {
    statusEl = <span style={{ color: '#1F8A5B' }}>{he ? `${run.recipients} נמענים כעת` : `${run.recipients} recipients now`}{marketing && run.skippedConsent > 0 ? (he ? ` · ${run.skippedConsent} ללא הסכמה` : ` · ${run.skippedConsent} no consent`) : ''}</span>;
  }

  return (
    <div style={{ background: '#fff', border: `1px solid ${enabled ? def.color + '40' : 'rgba(11,30,61,0.09)'}`, borderRadius: 18, overflow: 'hidden', boxShadow: enabled ? `0 6px 18px ${def.color}14` : 'none', transition: 'all .18s', opacity: enabled ? 1 : 0.82, flexShrink: 0 }}>
      {/* header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '15px 15px 12px' }}>
        <span style={{ width: 42, height: 42, borderRadius: 12, background: enabled ? def.color + '1c' : 'rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={def.icon} size={21} color={enabled ? def.color : 'rgba(11,30,61,0.4)'} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 16.5, color: '#0B1E3D' }}>{def[lang].name}</span>
            <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.3, padding: '2px 8px', borderRadius: 20, background: marketing ? 'rgba(200,162,74,0.14)' : 'rgba(46,125,82,0.12)', color: marketing ? '#9C7B2E' : '#2E7D52' }}>{marketing ? (he ? 'שיווקי' : 'Marketing') : (he ? 'תפעולי' : 'Operational')}</span>
          </div>
          <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.55)', marginTop: 3, lineHeight: 1.45 }}>{def[lang].desc}</div>
        </div>
        {/* on/off switch */}
        <button onClick={toggle} aria-label="toggle" style={{ flexShrink: 0, width: 46, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', background: enabled ? def.color : 'rgba(11,30,61,0.18)', position: 'relative', transition: 'background .18s', padding: 0 }}>
          <span style={{ position: 'absolute', top: 3, insetInlineStart: enabled ? 21 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'inset-inline-start .18s' }}></span>
        </button>
      </div>

      {/* live status strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 15px', background: 'rgba(11,30,61,0.025)', borderTop: '1px solid rgba(11,30,61,0.05)', fontSize: 12.5, fontWeight: 600 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: !enabled ? 'rgba(11,30,61,0.3)' : run.deferred ? '#C8A24A' : '#2E7D52', flexShrink: 0 }}></span>
        {statusEl}
        <button onClick={() => setOpen(o => !o)} style={{ marginInlineStart: 'auto', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 12.5, fontWeight: 700, color: accent, display: 'flex', alignItems: 'center', gap: 3 }}>
          {he ? (open ? 'סגור' : 'התאמה') : (open ? 'Close' : 'Customize')}<Icon name="chevron" size={14} color={accent} style={{ transform: open ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
        </button>
      </div>

      {/* expandable controls */}
      {open && (
        <div style={{ padding: '14px 15px 16px', display: 'flex', flexDirection: 'column', gap: 16, borderTop: '1px solid rgba(11,30,61,0.06)' }}>
          {/* params */}
          {def.params.map(p => (
            <div key={p.key}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0B1E3D', marginBottom: 8 }}>{p[lang]}</div>
              {p.kind === 'choice' && (
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {p.options.map(o => {
                    const on = automationStore.param(def.id, p.key) === o.v;
                    return <button key={o.v} onClick={() => setParam(p.key, o.v)} style={{ flex: '1 1 30%', padding: '10px 6px', borderRadius: 11, cursor: 'pointer', font: 'inherit', fontSize: 13, fontWeight: 700, border: `1.5px solid ${on ? def.color : 'rgba(11,30,61,0.12)'}`, background: on ? def.color + '14' : '#fff', color: '#0B1E3D' }}>{o[lang]}</button>;
                  })}
                </div>
              )}
              {p.kind === 'number' && (() => {
                const val = automationStore.param(def.id, p.key);
                const step = p.step || 1;
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => setParam(p.key, Math.max(p.min, val - step))} style={{ width: 40, height: 40, borderRadius: 11, border: '1.5px solid rgba(11,30,61,0.12)', background: '#fff', cursor: 'pointer', fontSize: 20, fontWeight: 700, color: '#0B1E3D', lineHeight: 1 }}>−</button>
                    <div style={{ flex: 1, textAlign: 'center', background: def.color + '10', borderRadius: 11, padding: '9px 0' }}>
                      <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: '#0B1E3D' }}>{val}</span>
                      <span style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.5)', marginInlineStart: 5 }}>{he ? p.unitHe : p.unitEn}</span>
                    </div>
                    <button onClick={() => setParam(p.key, Math.min(p.max, val + step))} style={{ width: 40, height: 40, borderRadius: 11, border: '1.5px solid rgba(11,30,61,0.12)', background: '#fff', cursor: 'pointer', fontSize: 20, fontWeight: 700, color: '#0B1E3D', lineHeight: 1 }}>+</button>
                  </div>
                );
              })()}
            </div>
          ))}

          {/* optional-data note (birthday) */}
          {def[lang].optional && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(11,30,61,0.04)', borderRadius: 11, padding: '9px 11px', fontSize: 11.5, color: 'rgba(11,30,61,0.6)', lineHeight: 1.45 }}>
              <Icon name="user" size={14} color="rgba(11,30,61,0.45)" style={{ flexShrink: 0, marginTop: 1 }} />{def[lang].optional}
            </div>
          )}

          {/* content editor */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0B1E3D' }}>{he ? 'תוכן ההודעה' : 'Message content'}</span>
              {automationStore.isContentEdited(def.id, lang) && <button onClick={resetContent} style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 11.5, fontWeight: 600, color: accent }}>{he ? 'שחזר ברירת מחדל' : 'Reset'}</button>}
            </div>
            <textarea value={content} onChange={e => editContent(e.target.value)} rows={3} style={{ width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 13.5, lineHeight: 1.55, color: '#0B1E3D', background: '#FBF9F5', border: '1px solid rgba(11,30,61,0.12)', borderRadius: 12, padding: '11px 12px', resize: 'vertical', direction: he ? 'rtl' : 'ltr', textAlign: 'start', outline: 'none' }} />
            <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.45)', marginTop: 6 }}>{he ? 'שדות דינמיים: ' : 'Dynamic fields: '}<code style={{ background: 'rgba(11,30,61,0.06)', padding: '1px 5px', borderRadius: 5, fontSize: 11 }}>{'{name}'}</code>{def.id === 'reminder' && <> <code style={{ background: 'rgba(11,30,61,0.06)', padding: '1px 5px', borderRadius: 5, fontSize: 11 }}>{'{time}'}</code></>}</div>
          </div>

          {/* locked compliance footer for marketing */}
          {marketing && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(46,125,82,0.07)', border: '1px solid rgba(46,125,82,0.2)', borderRadius: 11, padding: '9px 11px', fontSize: 11.5, color: 'rgba(11,30,61,0.65)', lineHeight: 1.5 }}>
              <Icon name="check" size={14} color="#2E7D52" stroke={2.6} style={{ flexShrink: 0, marginTop: 1 }} />{he ? 'מוגן אוטומטית: נשלח רק למאשרים, רק בשעות מותרות, עם דרך הסרה. לא ניתן לכיבוי.' : 'Auto-protected: opted-in only, allowed hours only, with an opt-out. Cannot be disabled.'}
            </div>
          )}

          {/* sent-log */}
          {log.length > 0 && (
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0B1E3D', marginBottom: 7 }}>{he ? 'נשלח לאחרונה' : 'Recent sends'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {log.map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'rgba(11,30,61,0.6)', background: 'rgba(11,30,61,0.03)', borderRadius: 9, padding: '7px 10px' }}>
                    <span>{l.when}</span>
                    <span style={{ fontWeight: 700, color: l.deferred ? '#9C7B2E' : '#1F8A5B' }}>{l.deferred ? (he ? `נדחה ל${l.when2}` : `deferred to ${l.when2}`) : (he ? `${l.sent} נשלחו` : `${l.sent} sent`)}{!l.deferred && l.skipped ? (he ? ` · ${l.skipped} דולגו` : ` · ${l.skipped} skipped`) : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* run-now (simulate) */}
          <button onClick={() => {
            const r = runAutomation(def.id, appts);
            const stamp = new Date().toLocaleString(he ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
            if (r.deferred) {
              automationStore.pushLog(def.id, { when: stamp, deferred: true, when2: _fmtNext(r.nextAt, he) });
              toast && toast(he ? 'נדחה לשעה מותרת ⏳' : 'Deferred to allowed time ⏳', he ? `${QUIET_REASON[r.reason].he} · יישלח ${_fmtNext(r.nextAt, he)}` : `${QUIET_REASON[r.reason].en} · sends ${_fmtNext(r.nextAt, he)}`);
            } else {
              automationStore.pushLog(def.id, { when: stamp, sent: r.recipients, skipped: r.skippedConsent });
              toast && toast(he ? `נשלח ל-${r.recipients} ✓` : `Sent to ${r.recipients} ✓`, marketing && r.skippedConsent ? (he ? `דולגו ${r.skippedConsent} ללא הסכמה` : `${r.skippedConsent} skipped (no consent)`) : (marketing ? (he ? 'שיווקי · רק למאשרים' : 'Marketing · opted-in') : (he ? 'תפעולי · לכולם' : 'Operational · everyone')));
            }
            onChange();
          }} disabled={!enabled} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px', borderRadius: 12, border: 'none', cursor: enabled ? 'pointer' : 'not-allowed', font: 'inherit', fontSize: 13.5, fontWeight: 700, background: enabled ? def.color : 'rgba(11,30,61,0.1)', color: enabled ? '#fff' : 'rgba(11,30,61,0.4)' }}>
            <Icon name="spark" size={15} color={enabled ? '#fff' : 'rgba(11,30,61,0.4)'} />{he ? 'הפעל עכשיו (הדמיה)' : 'Run now (simulate)'}
          </button>
        </div>
      )}
    </div>
  );
}

function AutomationsScreen({ lang, t, accent, serif, onBack, appts, toast }) {
  const he = lang === 'he';
  const [, force] = useAuto(0);
  const onChange = () => force(n => n + 1);
  const activeCount = AUTO_DEFS.filter(d => automationStore.isEnabled(d.id)).length;
  const quietNow = automationGuard.reason();

  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל' : 'Admin'} title={he ? 'אוטומציות' : 'Automations'} onBack={onBack} />
      <Body style={{ gap: 16 }}>
        {/* compliance banner - the fixed legal floor */}
        <div style={{ background: 'linear-gradient(140deg,#14305A,#0B1E3D)', borderRadius: 18, padding: '16px 16px 14px', color: '#FBF9F5', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(228,201,123,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={18} color="#E4C97B" stroke={2.6} /></span>
            <div>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 16 }}>{he ? 'שכבת הציות - תמיד פעילה' : 'Compliance layer - always on'}</div>
              <div style={{ fontSize: 11.5, color: 'rgba(251,249,245,0.65)' }}>{he ? 'אכיפה אוטומטית · לא ניתנת לכיבוי' : 'Auto-enforced · cannot be disabled'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              he ? 'מסנן הסכמה - תוכן שיווקי נשלח רק למי שאישר' : 'Consent filter - marketing only to opted-in clients',
              he ? 'שעות שקט - לא בלילה, בשבת ובחג; ממתין לשעה מותרת' : 'Quiet hours - never at night, Shabbat or holidays; waits for an allowed time',
              he ? 'דרך הסרה - בכל הודעה שיווקית' : 'Opt-out - on every marketing message',
            ].map((txt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: 'rgba(251,249,245,0.9)', lineHeight: 1.45 }}>
                <Icon name="check" size={14} color="#9Fd6b4" stroke={2.6} style={{ flexShrink: 0, marginTop: 2 }} />{txt}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, paddingTop: 11, borderTop: '1px solid rgba(251,249,245,0.12)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: quietNow ? '#E4C97B' : '#9Fd6b4' }}></span>
            <span style={{ color: 'rgba(251,249,245,0.85)' }}>{quietNow ? (he ? `כעת שעת שקט (${QUIET_REASON[quietNow].he}) - שיווקי ממתין` : `Quiet now (${QUIET_REASON[quietNow].en}) - marketing waits`) : (he ? 'כעת שעת שליחה מותרת' : 'Sending allowed right now')}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2px 2px -2px' }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: 0.4, color: 'rgba(11,30,61,0.45)', textTransform: 'uppercase' }}>{he ? 'האוטומציות שלך' : 'Your automations'}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>{he ? `${activeCount} מתוך ${AUTO_DEFS.length} פעילות` : `${activeCount} of ${AUTO_DEFS.length} active`}</span>
        </div>

        {AUTO_DEFS.map(def => (
          <AutoCard key={def.id} def={def} lang={lang} accent={accent} serif={serif} appts={appts} toast={toast} onChange={onChange} />
        ))}
      </Body>
    </Shell>
  );
}

Object.assign(window, { automationGuard, automationStore, automationCandidates, runAutomation, AUTO_DEFS, AutomationsScreen });
