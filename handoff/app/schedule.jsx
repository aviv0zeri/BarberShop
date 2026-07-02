// schedule.jsx, Weekly availability editor (per-day on/off, hours, multiple breaks)
// Used by the barber ("My availability") and by Rafi editing any barber.
// Exports: WeeklyScheduleEditor, defaultWeek
const { useState: useWS } = React;

const DAY_NAMES = {
  he: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

function defaultWeek(barber) {
  if (barber && barber.week && barber.week.length === 7) {
    return barber.week.map(d => ({ active: d.active !== false, start: d.start || '09:00', end: d.end || '18:00', breaks: (d.breaks || []).map(b => ({ ...b })) }));
  }
  const start = (barber && barber.start) || '09:00', end = (barber && barber.end) || '18:00';
  const breaks = ((barber && barber.breaks) || []).map(b => ({ ...b }));
  return [0, 1, 2, 3, 4, 5, 6].map(i => ({ active: i !== 6, start, end, breaks: breaks.map(b => ({ ...b })) })); // Sat off by default
}

const _wsTime = { font: 'inherit', fontSize: 14.5, fontWeight: 700, color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.14)', borderRadius: 10, padding: '8px 10px', outline: 'none', direction: 'ltr', colorScheme: 'light' };

function DayRow({ day, name, accent, serif, he, onChange }) {
  const on = day.active;
  const setBreak = (i, k, v) => onChange({ ...day, breaks: day.breaks.map((b, j) => j === i ? { ...b, [k]: v } : b) });
  const addBreak = () => onChange({ ...day, breaks: [...day.breaks, { from: '14:00', to: '14:30' }] });
  const rmBreak = (i) => onChange({ ...day, breaks: day.breaks.filter((_, j) => j !== i) });
  return (
    <div style={{ background: '#fff', borderRadius: 18, padding: '13px 15px', boxShadow: '0 3px 12px rgba(11,30,61,0.05)', border: on ? `1px solid ${accent}33` : '1px solid rgba(11,30,61,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 16, color: on ? '#0B1E3D' : 'rgba(11,30,61,0.4)' }}>{name}</div>
          <div style={{ fontSize: 11.5, color: on ? '#2E7D52' : 'rgba(11,30,61,0.4)', fontWeight: 600, marginTop: 1 }}>{on ? (he ? 'עובד' : 'Working') : (he ? 'לא עובד' : 'Off')}</div>
        </div>
        <button onClick={() => onChange({ ...day, active: !on })} title={on ? (he ? 'כבה יום' : 'Turn off') : (he ? 'הפעל יום' : 'Turn on')} style={{ width: 50, height: 30, borderRadius: 16, border: 'none', cursor: 'pointer', padding: 3, background: on ? '#2E7D52' : 'rgba(11,30,61,0.18)', display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start', transition: 'all .2s', flexShrink: 0 }}>
          <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} />
        </button>
      </div>
      {on && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(11,30,61,0.5)', minWidth: 42 }}>{he ? 'משעה' : 'From'}</span>
            <input type="time" value={day.start} onChange={e => onChange({ ...day, start: e.target.value })} style={{ ..._wsTime, flex: 1 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(11,30,61,0.5)' }}>{he ? 'עד' : 'to'}</span>
            <input type="time" value={day.end} onChange={e => onChange({ ...day, end: e.target.value })} style={{ ..._wsTime, flex: 1 }} />
          </div>
          {day.breaks.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(200,162,74,0.08)', border: `1px solid ${accent}33`, borderRadius: 11, padding: '7px 9px' }}>
              <Icon name="clock" size={15} color={accent} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#9C7B2E', minWidth: 40 }}>{he ? 'הפסקה' : 'Break'}</span>
              <input type="time" value={b.from} onChange={e => setBreak(i, 'from', e.target.value)} style={{ ..._wsTime, flex: 1, padding: '7px 6px' }} />
              <span style={{ color: 'rgba(11,30,61,0.35)' }}>-</span>
              <input type="time" value={b.to} onChange={e => setBreak(i, 'to', e.target.value)} style={{ ..._wsTime, flex: 1, padding: '7px 6px' }} />
              <button onClick={() => rmBreak(i)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'rgba(176,58,58,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={14} color="#B03A3A" /></button>
            </div>
          ))}
          <button onClick={addBreak} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 11, border: `1.5px dashed ${accent}`, background: `${accent}10`, color: '#0B1E3D', font: 'inherit', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}><Icon name="plus" size={15} color={accent} />{he ? 'הוסף הפסקה' : 'Add break'}</button>
        </div>
      )}
    </div>
  );
}

function WeeklyScheduleEditor({ lang, t, accent, serif, barber, onClose, onSave, adminName }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const [week, setWeek] = useWS(() => defaultWeek(barber));
  const setDay = (i, d) => setWeek(w => w.map((x, j) => j === i ? d : x));
  const workingDays = week.filter(d => d.active).length;
  const order = he ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 2, 3, 4, 5, 6];
  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={adminName ? (he ? 'לו״ז של ' + adminName : adminName + "'s schedule") : (he ? 'הספר' : 'Barber')} title={he ? 'הלו״ז השבועי שלי' : 'My weekly schedule'} onBack={onClose}
        right={<span style={{ fontSize: 12.5, fontWeight: 700, color: accent, background: 'rgba(200,162,74,0.12)', padding: '5px 11px', borderRadius: 20 }}>{workingDays}/7</span>} />
      <Body>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: 'rgba(200,162,74,0.1)', border: `1px solid ${accent}33`, borderRadius: 14, padding: '11px 13px' }}>
          <Icon name="calendar" size={17} color={accent} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.7)', lineHeight: 1.5 }}>{he ? 'הגדר אילו ימים אתה עובד ובאילו שעות. לקוחות יוכלו לקבוע רק בשעות העבודה, מחוץ להפסקות.' : 'Set which days you work and your hours. Clients can only book within working hours, outside breaks.'}</div>
        </div>
        {order.map(i => <DayRow key={i} day={week[i]} name={DAY_NAMES[lang][i]} accent={accent} serif={serif} he={he} onChange={d => setDay(i, d)} />)}
      </Body>
      <Footer>
        <Btn kind="gold" icon="check" onClick={() => onSave(week)}>{he ? 'שמירת הלו״ז' : 'Save schedule'}</Btn>
      </Footer>
    </Shell>
  );
}

// ── Conflict detection (schedule change / duration change) + shared warning sheet ──
const _cm = s => { const [h, m] = (s || '0:0').split(':').map(Number); return h * 60 + m; };
function _futureOf(appts, barberId) {
  const pad = n => String(n).padStart(2, '0'); const d = new Date(); const today = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return (appts || []).filter(a => a.barberId === barberId && a.date >= today && a.status !== 'done' && a.status !== 'no' && a.status !== 'rejected' && a.status !== 'cancelled');
}
function weekConflicts(barber, week, appts) {
  const dow = ds => { try { return new Date(ds + 'T00:00').getDay(); } catch (e) { return 0; } };
  return _futureOf(appts, barber.id).filter(a => {
    const d = week[dow(a.date)];
    const svc = DATA.services.find(s => s.id === a.svc); const ad = svc ? svc.min : 45;
    const as = _cm(a.start), ae = as + ad;
    if (!d || d.active === false) return true;
    if (as < _cm(d.start) || ae > _cm(d.end)) return true;
    for (const b of (d.breaks || [])) if (as < _cm(b.to) && ae > _cm(b.from)) return true;
    return false;
  });
}
function serviceConflicts(svcId, newMin, appts, staff) {
  const list = staff || DATA.barbers;
  const pad = n => String(n).padStart(2, '0'); const d0 = new Date(); const today = `${d0.getFullYear()}-${pad(d0.getMonth() + 1)}-${pad(d0.getDate())}`;
  return (appts || []).filter(a => a.svc === svcId && a.date >= today && a.status !== 'done' && a.status !== 'no' && a.status !== 'rejected' && a.status !== 'cancelled').filter(a => {
    const barber = list.find(b => b.id === a.barberId); if (!barber) return false;
    const sched = window.availHelpers.daySched(barber, a.date);
    const as = _cm(a.start), ae = as + newMin;
    if (!sched.active || as < _cm(sched.start) || ae > _cm(sched.end)) return true;
    for (const b of (sched.breaks || [])) if (as < _cm(b.to) && ae > _cm(b.from)) return true;
    // overlap with another appt of the same barber/day given the new length
    for (const o of appts) { if (o.id === a.id || o.barberId !== a.barberId || o.date !== a.date) continue; if (o.status === 'rejected' || o.status === 'no' || o.status === 'cancelled') continue; const os = _cm(o.start); if (as < os + (DATA.services.find(s => s.id === o.svc)?.min || 45) && ae > os) return true; }
    return false;
  });
}
function ConflictSheet({ lang, accent, serif, conflicts, staff, title, sub, onClose, onNotify, onOpenCalendar }) {
  const he = lang === 'he'; const nm = o => o[lang]; const list = staff || DATA.barbers;
  const pad = n => String(n).padStart(2, '0'); const today = `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}-${pad(new Date().getDate())}`;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 98, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '90%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        <div style={{ padding: '10px 20px 4px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(176,65,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="bell" size={22} color="#B0413A" /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 18.5, color: '#0B1E3D', lineHeight: 1.1 }}>{title || (he ? 'יש תורים שמתנגשים' : 'Conflicting bookings')}</div>
              <div style={{ fontSize: 12.5, color: '#B0413A', fontWeight: 600, marginTop: 2 }}>{conflicts.length} {he ? 'תורים מושפעים' : 'affected'}</div>
            </div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={17} color="#0B1E3D" /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 6px', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {sub && <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.6)', lineHeight: 1.5, marginInlineStart: 2 }}>{sub}</div>}
          {conflicts.map(a => {
            const svc = DATA.services.find(s => s.id === a.svc); const b = list.find(x => x.id === a.barberId);
            const cn = window.clientLabel ? window.clientLabel(a, lang) : nm({ he: a.clientHe, en: a.clientEn });
            const when = a.date === today ? (he ? 'היום' : 'today') : new Date(a.date + 'T00:00').toLocaleDateString(he ? 'he-IL' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });
            return (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 14, padding: '11px 13px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)', borderInlineStart: '3px solid #B0413A' }}>
                <span style={{ direction: 'ltr', unicodeBidi: 'isolate', fontWeight: 800, fontSize: 15, color: '#B0413A', minWidth: 46 }}>{a.start}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0B1E3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cn}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)' }}>{when} · {svc ? nm(svc) : ''}{b ? ' · ' + nm(b).split(' ')[0] : ''}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ flexShrink: 0, padding: '10px 20px calc(16px + env(safe-area-inset-bottom))', borderTop: '1px solid rgba(11,30,61,0.06)', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {onOpenCalendar && <Btn kind="gold" icon="calendar" onClick={onOpenCalendar}>{he ? 'פתח ביומן להזזה' : 'Open calendar to move'}</Btn>}
          <button onClick={onNotify} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', borderRadius: 14, border: '1px solid rgba(11,30,61,0.12)', background: '#fff', color: '#0B1E3D', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}><Icon name="whatsapp" size={17} color="#12a350" />{he ? 'הודע ללקוחות המושפעים' : 'Notify affected clients'}</button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(11,30,61,0.55)', font: 'inherit', fontSize: 14, fontWeight: 600, padding: 4, cursor: 'pointer' }}>{he ? 'הבנתי' : 'Got it'}</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WeeklyScheduleEditor, defaultWeek, weekConflicts, serviceConflicts, ConflictSheet });
