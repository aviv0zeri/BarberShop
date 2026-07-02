// exceptions.jsx, Layer 3: point exceptions (vacation / special hours) for a single date.
// A barber manages his own; the manager can edit any barber's. The exception
// overrides the fixed weekly schedule, but only for that exact date.
// Exports: ExceptionsEditor, exceptionConflicts
const { useState: useEx } = React;

const _exCm = s => { const [h, m] = (s || '0:0').split(':').map(Number); return h * 60 + m; };

// future bookings that would clash with the new exception set (closed day, or outside special hours)
function exceptionConflicts(barber, exceptions, appts) {
  const pad = n => String(n).padStart(2, '0'); const d = new Date();
  const today = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return (appts || []).filter(a => a.barberId === barber.id && a.date >= today && a.status !== 'done' && a.status !== 'no' && a.status !== 'rejected' && a.status !== 'cancelled').filter(a => {
    const ex = exceptions[a.date]; if (!ex) return false;
    if (ex.closed) return true;
    const svc = DATA.services.find(s => s.id === a.svc); const ad = svc ? svc.min : 45;
    const as = _exCm(a.start), ae = as + ad;
    return as < _exCm(ex.start || '09:00') || ae > _exCm(ex.end || '18:00');
  });
}

const _exTime = { font: 'inherit', fontSize: 14.5, fontWeight: 700, color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.14)', borderRadius: 10, padding: '9px 10px', outline: 'none', direction: 'ltr', colorScheme: 'light' };
const _exAddDays = (ds, n) => { const d = new Date(ds + 'T00:00'); d.setDate(d.getDate() + n); const p = x => String(x).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
function _exRange(a, b) { const out = []; let d = a, g = 0; while (d <= b && g < 400) { out.push(d); d = _exAddDays(d, 1); g++; } return out; }
// merge consecutive same-type dates into display ranges (a week off shows as ONE row)
function _exGroups(ex, today) {
  const sig = e => e.closed ? 'closed' : `${e.start}-${e.end}`;
  const keys = Object.keys(ex).filter(k => k >= today).sort();
  const groups = [];
  for (const k of keys) {
    const last = groups[groups.length - 1];
    if (last && sig(ex[k]) === last.sig && _exAddDays(last.to, 1) === k) last.to = k;
    else groups.push({ from: k, to: k, sig: sig(ex[k]), e: ex[k] });
  }
  return groups;
}

function ExceptionsEditor({ lang, t, accent, serif, barber, adminName, appts, onClose, onSave }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const pad = n => String(n).padStart(2, '0');
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })();
  const [ex, setEx] = useEx(() => ({ ...((barber && barber.exceptions) || {}) }));
  const [from, setFrom] = useEx('');
  const [to, setTo] = useEx('');
  const [type, setType] = useEx('closed'); // 'closed' | 'hours'
  const [start, setStart] = useEx('10:00');
  const [end, setEnd] = useEx('14:00');

  const dateLbl = ds => { try { return new Date(ds + 'T00:00').toLocaleDateString(he ? 'he-IL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }); } catch (e) { return ds; } };
  const shortLbl = ds => { try { return new Date(ds + 'T00:00').toLocaleDateString(he ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short' }); } catch (e) { return ds; } };
  const rangeValid = !to || to >= from;
  const canAdd = !!from && from >= today && rangeValid && (type === 'closed' || (start && end && start < end));
  const add = () => {
    if (!canAdd) return;
    const payload = type === 'closed' ? { closed: true } : { start, end };
    const dates = _exRange(from, to || from);
    setEx(p => { const n = { ...p }; dates.forEach(d => { n[d] = { ...payload }; }); return n; });
    setFrom(''); setTo(''); setType('closed');
  };
  const removeGroup = (g) => setEx(p => { const n = { ...p }; _exRange(g.from, g.to).forEach(d => delete n[d]); return n; });

  const groups = _exGroups(ex, today);
  const dayCount = Object.keys(ex).filter(d => d >= today).length;

  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif}
        eyebrow={adminName ? (he ? 'חריגים · ' + adminName : adminName + ' · exceptions') : (he ? 'הספר' : 'Barber')}
        title={he ? 'ימים חריגים' : 'Exception days'} onBack={onClose}
        right={dayCount ? <span style={{ fontSize: 12.5, fontWeight: 700, color: accent, background: 'rgba(200,162,74,0.12)', padding: '5px 11px', borderRadius: 20 }}>{dayCount}</span> : null} />
      <Body>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: 'rgba(200,162,74,0.1)', border: `1px solid ${accent}33`, borderRadius: 14, padding: '11px 13px' }}>
          <Icon name="calendar" size={17} color={accent} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.7)', lineHeight: 1.5 }}>{he ? 'חופשה או שעות מיוחדות, לתאריך בודד או לטווח. החריג גובר על הלו״ז הקבוע לכל יום בטווח.' : 'A day off or special hours, a single date or a range. The exception overrides the weekly schedule for every day in it.'}</div>
        </div>

        {/* add new exception */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 15, boxShadow: '0 3px 12px rgba(11,30,61,0.05)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 15.5, color: '#0B1E3D' }}>{he ? 'הוספת חריג' : 'Add an exception'}</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(11,30,61,0.5)', marginBottom: 6 }}>{he ? 'מתאריך' : 'From date'}</div>
            <input type="date" min={today} value={from} onChange={e => setFrom(e.target.value)} style={{ ..._exTime, width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(11,30,61,0.5)' }}>{he ? 'עד תאריך' : 'To date'}</span>
              <span style={{ fontSize: 11, color: 'rgba(11,30,61,0.4)' }}>{he ? '(ריק = יום בודד)' : '(empty = single day)'}</span>
            </div>
            <input type="date" min={from || today} value={to} onChange={e => setTo(e.target.value)} style={{ ..._exTime, width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['closed', he ? 'חופשה (סגור)' : 'Day off', 'pin'], ['hours', he ? 'שעות מיוחדות' : 'Special hours', 'clock']].map(([id, lbl, ic]) => {
              const on = type === id;
              return (
                <button key={id} onClick={() => setType(id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', borderRadius: 12, cursor: 'pointer', font: 'inherit', fontSize: 13, fontWeight: 700, border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.12)'}`, background: on ? accent + '14' : '#fff', color: '#0B1E3D' }}>
                  <Icon name={ic} size={16} color={on ? accent : 'rgba(11,30,61,0.45)'} />{lbl}
                </button>
              );
            })}
          </div>
          {type === 'hours' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(11,30,61,0.5)', minWidth: 42 }}>{he ? 'משעה' : 'From'}</span>
              <input type="time" value={start} onChange={e => setStart(e.target.value)} style={{ ..._exTime, flex: 1 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(11,30,61,0.5)' }}>{he ? 'עד' : 'to'}</span>
              <input type="time" value={end} onChange={e => setEnd(e.target.value)} style={{ ..._exTime, flex: 1 }} />
            </div>
          )}
          <button onClick={add} disabled={!canAdd} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', padding: '12px', borderRadius: 12, border: 'none', cursor: canAdd ? 'pointer' : 'not-allowed', font: 'inherit', fontSize: 14, fontWeight: 700, background: canAdd ? 'linear-gradient(135deg,#14305A,#0B1E3D)' : 'rgba(11,30,61,0.12)', color: canAdd ? '#FBF9F5' : 'rgba(11,30,61,0.4)' }}>
            <Icon name="plus" size={17} color={canAdd ? '#E4C97B' : 'rgba(11,30,61,0.4)'} />{he ? 'הוסף חריג' : 'Add exception'}
          </button>
        </div>

        {/* list */}
        <div>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 15, color: '#0B1E3D', marginBottom: 10, marginInlineStart: 2 }}>{he ? 'חריגים קרובים' : 'Upcoming exceptions'}</div>
          {groups.length === 0 && <div style={{ textAlign: 'center', padding: '22px', color: 'rgba(11,30,61,0.4)', fontSize: 13.5, background: '#fff', borderRadius: 16 }}>{he ? 'אין חריגים, הלו״ז הקבוע חל על כל הימים' : 'No exceptions, the weekly schedule applies'}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {groups.map(g => {
              const closed = !!g.e.closed; const isRange = g.from !== g.to;
              const days = _exRange(g.from, g.to).length;
              return (
                <div key={g.from} style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', borderRadius: 14, padding: '12px 13px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)', borderInlineStart: `3px solid ${closed ? '#B0413A' : accent}` }}>
                  <span style={{ width: 38, height: 38, borderRadius: 11, background: closed ? 'rgba(176,65,58,0.1)' : accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={closed ? 'pin' : 'clock'} size={18} color={closed ? '#B0413A' : accent} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0B1E3D' }}>{isRange ? <span>{shortLbl(g.from)} - {shortLbl(g.to)} <span style={{ fontSize: 11.5, fontWeight: 600, color: accent }}>· {days} {he ? 'ימים' : 'days'}</span></span> : dateLbl(g.from)}</div>
                    <div style={{ fontSize: 12, color: closed ? '#B0413A' : 'rgba(11,30,61,0.55)', fontWeight: 600, marginTop: 1, direction: closed ? 'inherit' : 'ltr', textAlign: 'start' }}>{closed ? (he ? 'חופשה · המספרה סגורה' : 'Day off · closed') : `${g.e.start}-${g.e.end}`}</div>
                  </div>
                  <button onClick={() => removeGroup(g)} style={{ width: 32, height: 32, borderRadius: 9, border: 'none', background: 'rgba(176,58,58,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="trash" size={15} color="#B03A3A" /></button>
                </div>
              );
            })}
          </div>
        </div>
      </Body>
      <Footer>
        <Btn kind="gold" icon="check" onClick={() => onSave(ex)}>{he ? 'שמירת החריגים' : 'Save exceptions'}</Btn>
      </Footer>
    </Shell>
  );
}

Object.assign(window, { ExceptionsEditor, exceptionConflicts });
