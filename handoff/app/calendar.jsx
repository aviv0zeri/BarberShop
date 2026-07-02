// calendar.jsx, single role-aware calendar (day/week/month) + drag-reschedule + edit
// Exports: Calendar, ClientSheet
const { useState: useCal, useRef: useCalRef } = React;

const HOURS = Array.from({ length: 12 }, (_, i) => 9 + i); // 09:00 → 20:00
const HOUR_H = 76; // px per hour, four readable 15-min quarters (19px each)
const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const toHHMM = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const colorFor = (barberId, staff) => window.barberColor(barberId, staff); // preferred color from the barber profile → palette fallback
const STATUS_META = (t) => ({ confirmed: { label: t.stConfirmed }, done: { label: t.stDone }, now: { label: t.stNow }, no: { label: t.stNo } });

// ── Appointment edit sheet ──
function ApptEditSheet({ lang, t, accent, serif, appt, staff, onClose, onSave, onDelete }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const svc = DATA.services.find(s => s.id === appt.svc);
  const barber = (staff || DATA.barbers).find(b => b.id === appt.barberId) || DATA.barbers[0];
  const [start, setStart] = useCal(appt.start);
  const [status, setStatus] = useCal(appt.status);
  const statuses = ['confirmed', 'now', 'done', 'no'];
  const sm = STATUS_META(t);
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 96, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)', padding: '10px 18px calc(20px + env(safe-area-inset-bottom))' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 14px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ width: 4, height: 40, borderRadius: 3, background: colorFor(appt.barberId, staff) }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 19, color: '#0B1E3D' }}>{nm({ he: appt.clientHe, en: appt.clientEn })}</div>
            <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.55)' }}>{nm(svc)} · {svc.min} {he ? 'דק׳' : 'min'} · {nm(barber)}</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="x" size={17} color="#0B1E3D" /></button>
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 7 }}>{t.apptTime}</div>
        <input type="time" value={start} onChange={e => setStart(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 16, fontWeight: 700, color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.12)', borderRadius: 12, padding: '12px 13px', outline: 'none', direction: 'ltr', colorScheme: 'light', marginBottom: 16 }} />
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 7 }}>{t.apptStatus}</div>
        <div style={{ display: 'flex', gap: 7, marginBottom: 18 }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setStatus(s)} style={{ flex: 1, padding: '9px 4px', borderRadius: 11, cursor: 'pointer', font: 'inherit', fontSize: 12.5, fontWeight: 700, border: `1.5px solid ${status === s ? accent : 'rgba(11,30,61,0.1)'}`, background: status === s ? accent : '#fff', color: status === s ? '#0B1E3D' : 'rgba(11,30,61,0.6)' }}>{sm[s].label}</button>
          ))}
        </div>
        <Btn kind="gold" icon="check" onClick={() => onSave({ ...appt, start, status })}>{t.saveChanges}</Btn>
        <button onClick={onDelete} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 10, padding: '12px', borderRadius: 13, border: '1px solid rgba(176,58,58,0.25)', background: 'rgba(176,58,58,0.05)', color: '#B03A3A', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}><Icon name="trash" size={16} color="#B03A3A" />{t.deleteAppt}</button>
      </div>
    </div>
  );
}

// ── Client contact sheet (call / whatsapp) ──
function ClientSheet({ lang, t, accent, serif, appt, onClose }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const svc = DATA.services.find(s => s.id === appt.svc);
  const disp = appt.phone.replace('+972', '0').replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 96, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)', padding: '10px 18px calc(24px + env(safe-area-inset-bottom))' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(140deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FBF9F5', fontWeight: 700, fontSize: 19, flexShrink: 0 }}>{(window.clientLabel ? window.clientLabel(appt, lang) : nm({ he: appt.clientHe, en: appt.clientEn })).trim()[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D' }}>{window.clientLabel ? window.clientLabel(appt, lang) : nm({ he: appt.clientHe, en: appt.clientEn })}</div>
            <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.55)', marginTop: 2 }}>{nm(svc)} · <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{appt.start}</span></div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: '1px solid rgba(11,30,61,0.1)', borderRadius: 14, padding: '12px 14px', marginBottom: 14 }}>
          <Icon name="phone" size={18} color={accent} />
          <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#0B1E3D', direction: 'ltr', textAlign: 'start' }}>{disp}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => window.open('https://wa.me/' + appt.phone.replace(/[^0-9]/g, ''), '_blank')} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '15px 18px', borderRadius: 16, border: 'none', cursor: 'pointer', font: 'inherit', background: 'linear-gradient(135deg,#1ebe5d,#12a350)', color: '#fff', boxShadow: '0 8px 22px rgba(30,190,93,0.32)' }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="whatsapp" size={22} color="#fff" /></span>
            <span style={{ flex: 1, textAlign: 'start', fontSize: 16, fontWeight: 700 }}>{t.contactWhats}</span>
          </button>
          <button onClick={() => { window.location.href = 'tel:' + appt.phone; }} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '15px 18px', borderRadius: 16, border: '1px solid rgba(11,30,61,0.1)', cursor: 'pointer', font: 'inherit', background: '#fff', color: '#0B1E3D' }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(11,30,61,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="phone" size={20} color={accent} /></span>
            <span style={{ flex: 1, textAlign: 'start', fontSize: 16, fontWeight: 700 }}>{t.contactCall}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Appointment block (pointer long-press drag) ──
// Three visual states (Round 13): active → the barber's color · no-show → red,
// struck through, still occupying its slot (the time passed, it's a visible fact)
// · cancelled → never rendered here at all: the slot is freed in the calendar.
function ApptBlock({ a, staff, lang, compact, dragging, onPress, hh = HOUR_H }) {
  const nm = o => o[lang];
  const svc = DATA.services.find(s => s.id === a.svc);
  const dur = svc ? svc.min : 45;
  const top = (toMin(a.start) - HOURS[0] * 60) / 60 * hh;
  const h = Math.max(compact ? 16 : 30, dur / 60 * hh - 3);
  const c = colorFor(a.barberId, staff);
  const faded = a.status === 'done';
  const noShow = a.status === 'no';
  const RED = '#B0413A';
  const bg = noShow ? 'rgba(176,65,58,0.12)' : faded ? c + '22' : c + 'e6';
  const nameColor = noShow ? RED : faded ? '#0B1E3D' : '#fff';
  return (
    <div onPointerDown={e => onPress(a, e)}
      style={{ position: 'absolute', top, height: h, insetInlineStart: '4%', insetInlineEnd: '4%', background: bg, borderRadius: 8, padding: compact ? '2px 5px' : '5px 8px', cursor: 'grab', overflow: 'hidden', boxShadow: dragging || noShow ? 'none' : '0 2px 6px rgba(11,30,61,0.18)', borderInlineStart: `3px solid ${noShow ? RED : c}`, border: noShow ? `1px solid rgba(176,65,58,0.4)` : undefined, borderInlineStartWidth: 3, borderInlineStartColor: noShow ? RED : c, borderInlineStartStyle: 'solid', zIndex: 3, opacity: dragging ? 0.35 : 1, touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', transition: dragging ? 'none' : 'top .26s cubic-bezier(.2,1,.3,1), height .26s cubic-bezier(.2,1,.3,1)' }}>
      {!compact && <div style={{ fontSize: 11, fontWeight: 700, color: noShow ? RED : faded ? c : '#fff', direction: 'ltr', textAlign: 'start', textDecoration: noShow ? 'line-through' : 'none' }}>{a.start}</div>}
      <div style={{ fontSize: compact ? 9.5 : 12, fontWeight: 600, color: nameColor, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: noShow ? 'line-through' : 'none' }}>{window.clientLabel ? window.clientLabel(a, lang) : nm({ he: a.clientHe, en: a.clientEn })}</div>
      {!compact && h > 42 && (noShow
        ? <div style={{ fontSize: 10.5, fontWeight: 700, color: RED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lang === 'he' ? 'לא הגיע' : 'No-show'}</div>
        : <div style={{ fontSize: 10.5, color: faded ? 'rgba(11,30,61,0.6)' : 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nm(svc)}</div>)}
    </div>
  );
}

// ── Blocked-time layer (off-shift + breaks for a single barber) ──
function BlockedLayer({ barber, lang, compact, hh = HOUR_H, date }) {
  const he = lang === 'he';
  const dayStart = HOURS[0] * 60, dayEnd = (HOURS[HOURS.length - 1] + 1) * 60;
  const offs = window.availHelpers.offRanges(barber, dayStart, dayEnd, date);
  const sched = date ? window.availHelpers.daySched(barber, date) : null;
  return offs.map((r, i) => {
    const top = (r.from - dayStart) / 60 * hh, height = (r.to - r.from) / 60 * hh;
    const breaks = sched ? sched.breaks : (barber.breaks || []);
    const isBreak = (date ? (sched && sched.active) : barber.active !== false) && (breaks || []).some(b => toMin(b.from) === r.from && toMin(b.to) === r.to);
    return (
      <div key={i} style={{ position: 'absolute', top, height, insetInlineStart: 0, insetInlineEnd: 0, borderRadius: 5, zIndex: 1, pointerEvents: 'none', overflow: 'hidden',
        background: 'repeating-linear-gradient(45deg, rgba(11,30,61,0.05), rgba(11,30,61,0.05) 6px, rgba(11,30,61,0.09) 6px, rgba(11,30,61,0.09) 12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!compact && height > 22 && <span style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(11,30,61,0.42)', background: 'rgba(251,249,245,0.7)', padding: '2px 8px', borderRadius: 6 }}>{isBreak ? (he ? 'הפסקה' : 'Break') : (he ? 'מחוץ למשמרת' : 'Off shift')}</span>}
      </div>
    );
  });
}

function Calendar({ lang, t, accent, serif, mode, meId, staff, appts, setAppts, onClose, initialView, initialOffset, toast }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const [view, setView] = useCal(initialView || 'day');
  const [filter, setFilter] = useCal('all'); // owner barber filter
  const [offset, setOffset] = useCal(initialOffset || 0); // day/week offset; month: month offset
  const [edit, setEdit] = useCal(null);
  const [drag, setDrag] = useCal(null);   // { id, x, y, ok, label, tgtDate, tgtMin }
  const [notifyClient, setNotifyClient] = useCal(null); // { appt, change }, proactive update
  const [closeDay, setCloseDay] = useCal(null);         // date string being closed
  const pressRef = useCalRef(null);
  const [hourH, setHourH] = useCal(76);                  // px per hour (zoom)
  const pinch = useCalRef({ pts: {}, baseDist: 0, baseH: 76 });
  const zoom = (d) => setHourH(h => Math.max(46, Math.min(150, h + d)));
  const pinchDown = (e) => { const p = pinch.current; p.pts[e.pointerId] = { x: e.clientX, y: e.clientY }; const ids = Object.keys(p.pts); if (ids.length === 2) { const a = p.pts[ids[0]], b = p.pts[ids[1]]; p.baseDist = Math.hypot(a.x - b.x, a.y - b.y) || 1; p.baseH = hourH; } };
  const pinchMove = (e) => { const p = pinch.current; if (!p.pts[e.pointerId]) return; p.pts[e.pointerId] = { x: e.clientX, y: e.clientY }; const ids = Object.keys(p.pts); if (ids.length === 2 && p.baseDist) { e.preventDefault(); const a = p.pts[ids[0]], b = p.pts[ids[1]]; const d = Math.hypot(a.x - b.x, a.y - b.y); setHourH(Math.max(46, Math.min(150, Math.round(p.baseH * d / p.baseDist)))); } };
  const pinchUp = (e) => { const p = pinch.current; delete p.pts[e.pointerId]; p.baseDist = 0; };

  const list = staff || DATA.barbers;
  const visibleBarbers = mode === 'barber' ? list.filter(b => b.id === meId) : (filter === 'all' ? list : list.filter(b => b.id === filter));
  const visIds = visibleBarbers.map(b => b.id);
  // cancelled (and declined) bookings leave the calendar entirely, their slot is
  // free again; if someone rebooks the time, only the new appointment renders.
  const shown = appts.filter(a => visIds.includes(a.barberId) && a.status !== 'cancelled' && a.status !== 'rejected');
  const soloBarber = visibleBarbers.length === 1 ? visibleBarbers[0] : null;
  const dragAppt = drag ? appts.find(a => a.id === drag.id) : null;
  const dragDur = dragAppt ? (DATA.services.find(s => s.id === dragAppt.svc)?.min || 45) : 45;

  const base = new Date(); base.setHours(0, 0, 0, 0);
  const dateOf = i => { const d = new Date(base); d.setDate(base.getDate() + i); return d; };
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const dows = he ? ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const moveTo = (id, patch) => setAppts(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));

  // pointer-based long-press drag (works for mouse + touch)
  const targetAt = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const cell = el && el.closest && el.closest('[data-min]');
    if (!cell) return null;
    return { date: cell.getAttribute('data-date'), min: +cell.getAttribute('data-min') };
  };
  const validDrop = (a, tgt) => {
    if (!tgt) return false;
    const barber = list.find(b => b.id === a.barberId);
    const svc = DATA.services.find(s => s.id === a.svc); const dur = svc ? svc.min : 45;
    return window.availHelpers.slotFree(barber, tgt.date, tgt.min, dur, appts, a.id);
  };
  const onPress = (a, e) => {
    if (e.button === 2) return;
    const info = { a, sx: e.clientX, sy: e.clientY, active: false };
    pressRef.current = info;
    info.timer = setTimeout(() => {
      info.active = true;
      if (navigator.vibrate) try { navigator.vibrate(15); } catch (er) {}
      setDrag({ id: a.id, x: info.sx, y: info.sy, ok: true, label: a.start, tgtDate: a.date, tgtMin: toMin(a.start) });
    }, 200);
  };
  React.useEffect(() => {
    const move = (e) => {
      const info = pressRef.current; if (!info) return;
      if (!info.active) {
        if (Math.abs(e.clientX - info.sx) > 9 || Math.abs(e.clientY - info.sy) > 9) { clearTimeout(info.timer); pressRef.current = null; }
        return;
      }
      e.preventDefault();
      const tgt = targetAt(e.clientX, e.clientY);
      const ok = validDrop(info.a, tgt);
      setDrag({ id: info.a.id, x: e.clientX, y: e.clientY, ok, label: tgt ? toHHMM(tgt.min) : '', tgtDate: tgt ? tgt.date : null, tgtMin: tgt ? tgt.min : null });
    };
    const up = (e) => {
      const info = pressRef.current;
      if (info) {
        clearTimeout(info.timer);
        if (info.active) {
          const tgt = targetAt(e.clientX, e.clientY);
          if (validDrop(info.a, tgt)) {
            const newStart = toHHMM(tgt.min);
            if (tgt.date !== info.a.date || newStart !== info.a.start) {
              moveTo(info.a.id, { date: tgt.date, start: newStart });
              setNotifyClient({ appt: { ...info.a, date: tgt.date, start: newStart }, change: 'moved' });
            }
          }
        } else {
          setEdit(info.a); // tap → edit
        }
      }
      pressRef.current = null; setDrag(null);
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  }, [appts, view, offset, filter, list]);

  // ── DAY ──
  const dayDate = fmt(dateOf(offset));
  const dayAppts = shown.filter(a => a.date === dayDate);

  // ── WEEK ── (week starting Sunday containing base+offset*7)
  const weekStart = (() => { const d = dateOf(offset * 7); d.setDate(d.getDate() - d.getDay()); return d; })();
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });

  // ── MONTH ──
  const monthAnchor = (() => { const d = new Date(base); d.setMonth(d.getMonth() + offset, 1); return d; })();
  const monthName = monthAnchor.toLocaleDateString(he ? 'he-IL' : 'en-US', { month: 'long', year: 'numeric' });
  const firstDow = monthAnchor.getDay();
  const daysInMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0).getDate();

  const headerLabel = view === 'day'
    ? dateOf(offset).toLocaleDateString(he ? 'he-IL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' })
    : view === 'week'
      ? `${weekDays[0].getDate()}-${weekDays[6].getDate()} ${weekDays[6].toLocaleDateString(he ? 'he-IL' : 'en-US', { month: 'short' })}`
      : monthName;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FBF9F5', zIndex: 92, display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{ padding: '54px 16px 10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          {onClose && <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name={he ? 'arrowR' : 'arrowL'} size={20} color="#0B1E3D" /></button>}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: accent, textTransform: 'uppercase' }}>{mode === 'owner' ? (he ? 'בעלים' : 'Owner') : (he ? 'הלוז שלי' : 'My schedule')}</div>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 21, color: '#0B1E3D' }}>{t.calTitle}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setOffset(o => o - 1)} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name={he ? 'chevronR' : 'chevron'} size={16} color="#0B1E3D" /></button>
            <button onClick={() => setOffset(0)} style={{ padding: '8px 11px', borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', font: 'inherit', fontSize: 12.5, fontWeight: 700, color: '#0B1E3D', cursor: 'pointer' }}>{t.calToday}</button>
            <button onClick={() => setOffset(o => o + 1)} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name={he ? 'chevron' : 'chevronR'} size={16} color="#0B1E3D" /></button>
          </div>
        </div>

        {/* view switch + zoom */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
          <div style={{ flex: 1, display: 'flex', gap: 5, background: 'rgba(11,30,61,0.05)', padding: 4, borderRadius: 12 }}>
            {[['day', t.calDay], ['week', t.calWeek], ['month', t.calMonth]].map(([v, lbl]) => (
              <button key={v} onClick={() => { setView(v); setOffset(0); }} style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 13.5, fontWeight: 700, background: view === v ? '#fff' : 'transparent', color: view === v ? '#0B1E3D' : 'rgba(11,30,61,0.5)', boxShadow: view === v ? '0 2px 8px rgba(11,30,61,0.08)' : 'none', transition: 'all .15s' }}>{lbl}</button>
            ))}
          </div>
          {view !== 'month' && (
            <div style={{ display: 'flex', gap: 3, background: 'rgba(11,30,61,0.05)', padding: 4, borderRadius: 12, alignItems: 'center' }} title={he ? 'הגדל / הקטן' : 'Zoom'}>
              <button onClick={() => zoom(-18)} disabled={hourH <= 46} style={{ width: 32, height: 32, borderRadius: 9, border: 'none', background: hourH <= 46 ? 'transparent' : '#fff', color: '#0B1E3D', cursor: hourH <= 46 ? 'default' : 'pointer', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: hourH <= 46 ? 'none' : '0 2px 6px rgba(11,30,61,0.08)', opacity: hourH <= 46 ? 0.4 : 1 }}>−</button>
              <button onClick={() => zoom(18)} disabled={hourH >= 150} style={{ width: 32, height: 32, borderRadius: 9, border: 'none', background: hourH >= 150 ? 'transparent' : '#fff', color: '#0B1E3D', cursor: hourH >= 150 ? 'default' : 'pointer', fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: hourH >= 150 ? 'none' : '0 2px 6px rgba(11,30,61,0.08)', opacity: hourH >= 150 ? 0.4 : 1 }}>+</button>
            </div>
          )}
        </div>

        {/* owner barber filter */}
        {mode === 'owner' && (
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', marginTop: 11, paddingBottom: 2 }}>
            <button onClick={() => setFilter('all')} style={{ flexShrink: 0, padding: '7px 13px', borderRadius: 20, cursor: 'pointer', font: 'inherit', fontSize: 12.5, fontWeight: 700, border: `1.5px solid ${filter === 'all' ? accent : 'rgba(11,30,61,0.12)'}`, background: filter === 'all' ? accent : '#fff', color: filter === 'all' ? '#0B1E3D' : 'rgba(11,30,61,0.6)' }}>{t.calAll}</button>
            {list.map(b => { const off = b.active === false; return (
              <button key={b.id} onClick={() => setFilter(b.id)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 20, cursor: 'pointer', font: 'inherit', fontSize: 12.5, fontWeight: 700, border: `1.5px solid ${filter === b.id ? colorFor(b.id, list) : 'rgba(11,30,61,0.12)'}`, background: filter === b.id ? colorFor(b.id, list) + '1f' : '#fff', color: '#0B1E3D', opacity: off ? 0.45 : 1 }}>
                <span style={{ width: 9, height: 9, borderRadius: 5, background: colorFor(b.id, list) }} />{nm(b).split(' ')[0]}{off ? (he ? ' · מושבת' : ' · off') : ''}
              </button>
            ); })}
          </div>
        )}
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.5)', marginTop: 10, textAlign: 'center' }}>{headerLabel}</div>
        {view !== 'month' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 13, marginTop: 7 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600, color: 'rgba(11,30,61,0.5)' }}><span style={{ width: 8, height: 8, borderRadius: 4, background: soloBarber ? colorFor(soloBarber.id, list) : accent }} />{he ? 'תור פעיל, בצבע הספר' : 'Active, barber color'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600, color: '#B0413A' }}><span style={{ width: 8, height: 8, borderRadius: 4, background: 'rgba(176,65,58,0.18)', border: '1px solid #B0413A', boxSizing: 'border-box' }} /><span style={{ textDecoration: 'line-through' }}>{he ? 'לא הגיע' : 'No-show'}</span></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600, color: 'rgba(11,30,61,0.5)' }}><span style={{ width: 8, height: 8, borderRadius: 4, border: '1px dashed rgba(11,30,61,0.4)', boxSizing: 'border-box' }} />{he ? 'בוטל, החלון פנוי' : 'Cancelled, slot freed'}</span>
          </div>
        )}
        {mode === 'owner' && view === 'day' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 9 }}>
            <button onClick={() => setCloseDay(fmt(dateOf(offset)))} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 15px', borderRadius: 20, border: `1.5px solid ${accent}55`, background: `${accent}12`, color: '#0B1E3D', font: 'inherit', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
              <Icon name="bell" size={15} color={accent} />{he ? 'סגירת יום והודעה ללקוחות' : 'Close day & notify clients'}
            </button>
          </div>
        )}
      </div>

      {/* body */}
      <div onPointerDown={pinchDown} onPointerMove={pinchMove} onPointerUp={pinchUp} onPointerCancel={pinchUp} style={{ flex: 1, overflowY: 'auto', padding: '0 12px 24px', touchAction: 'pan-y' }}>
        <div key={view} className="cal-fade">
        {view === 'day' && window.shabbat && window.shabbat.closedDate(dayDate) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(140deg,#14305A,#0B1E3D)', borderRadius: 14, padding: '12px 15px', margin: '4px 0 12px', boxShadow: '0 6px 18px rgba(11,30,61,0.2)' }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(228,201,123,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="spark" size={18} color="#E4C97B" /></span>
            <div><div style={{ fontFamily: serif, fontWeight: 700, fontSize: 15, color: '#FBF9F5' }}>{he ? 'שבת, המספרה סגורה 🕯️' : 'Shabbat, closed 🕯️'}</div><div style={{ fontSize: 11.5, color: 'rgba(251,249,245,0.65)', marginTop: 1 }}>{he ? 'אין תורים · נחזור בצאת השבת' : 'No bookings · back after Shabbat'}</div></div>
          </div>
        )}
        {view === 'day' && (
          <div style={{ position: 'relative', display: 'flex' }}>
            <div style={{ width: 46, flexShrink: 0 }}>
              {HOURS.map(h => (
                <div key={h} style={{ height: hourH, position: 'relative' }}>
                  <span style={{ position: 'absolute', top: -7, insetInlineEnd: 6, fontSize: 11, color: 'rgba(11,30,61,0.5)', fontWeight: 700, direction: 'ltr' }}>{String(h).padStart(2, '0')}:00</span>
                  <span style={{ position: 'absolute', top: hourH / 2 - 6, insetInlineEnd: 6, fontSize: 9, color: 'rgba(11,30,61,0.26)', fontWeight: 600, direction: 'ltr' }}>{String(h).padStart(2, '0')}:30</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              {HOURS.map((h) => (
                <React.Fragment key={h}>
                  {[0, 1, 2, 3].map(q => (
                    <div key={q} data-date={dayDate} data-min={h * 60 + q * 15} style={{ height: hourH / 4, borderTop: q === 0 ? '1px solid rgba(11,30,61,0.1)' : q === 2 ? '1px dashed rgba(11,30,61,0.08)' : '1px dotted rgba(11,30,61,0.05)' }} />
                  ))}
                </React.Fragment>
              ))}
              {soloBarber && <BlockedLayer barber={soloBarber} lang={lang} hh={hourH} date={dayDate} />}
              {drag && drag.tgtDate === dayDate && drag.tgtMin != null && (() => { const ty = (drag.tgtMin - HOURS[0] * 60) / 60 * hourH; const col = drag.ok ? accent : '#B03A3A'; return (
                <React.Fragment>
                  <div style={{ position: 'absolute', insetInlineStart: 0, insetInlineEnd: 0, top: ty, borderTop: `2px ${drag.ok ? 'solid' : 'dashed'} ${col}`, zIndex: 3, pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', insetInlineStart: '4%', insetInlineEnd: '4%', top: ty, height: Math.max(18, dragDur / 60 * hourH - 3), borderRadius: 8, border: `2px dashed ${col}`, background: drag.ok ? accent + '1f' : 'rgba(176,58,58,0.1)', zIndex: 2, pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', top: ty, insetInlineStart: '6%', transform: 'translateY(-50%)', zIndex: 5, pointerEvents: 'none', background: drag.ok ? '#0B1E3D' : '#B03A3A', color: '#fff', fontWeight: 800, fontSize: 17, padding: '5px 13px', borderRadius: 11, boxShadow: '0 8px 20px rgba(11,30,61,0.4)', direction: 'ltr', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name={drag.ok ? 'clock' : 'x'} size={16} color="#fff" />{drag.ok ? (drag.label || toHHMM(drag.tgtMin)) : (he ? 'חסום' : 'Blocked')}</div>
                </React.Fragment>
              ); })()}
              {dayAppts.map(a => <ApptBlock key={a.id} a={a} staff={list} lang={lang} dragging={drag && drag.id === a.id} onPress={onPress} hh={hourH} />)}
              {dayAppts.length === 0 && <div style={{ position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', color: 'rgba(11,30,61,0.35)', fontSize: 13.5, pointerEvents: 'none' }}>{t.noVisits}</div>}
            </div>
          </div>
        )}

        {view === 'week' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '30px repeat(7,1fr)', gap: 2, position: 'sticky', top: 0, background: '#FBF9F5', zIndex: 3, paddingBottom: 4 }}>
              <div />
              {weekDays.map((d, i) => {
                const isToday = fmt(d) === todayStr();
                return <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10.5, color: 'rgba(11,30,61,0.45)', fontWeight: 600 }}>{dows[d.getDay()]}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isToday ? '#fff' : '#0B1E3D', background: isToday ? accent : 'transparent', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '2px auto 0' }}>{d.getDate()}</div>
                </div>;
              })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '30px repeat(7,1fr)', gap: 2, position: 'relative' }}>
              <div>
                {HOURS.map(h => <div key={h} style={{ height: hourH, fontSize: 9.5, color: 'rgba(11,30,61,0.4)', fontWeight: 600, direction: 'ltr', textAlign: 'center' }}>{String(h).padStart(2, '0')}</div>)}
              </div>
              {weekDays.map((d, di) => {
                const ds = fmt(d);
                const da = shown.filter(a => a.date === ds);
                return (
                  <div key={di} style={{ position: 'relative', background: 'rgba(11,30,61,0.015)', borderRadius: 6 }}>
                    {HOURS.map((h) => (
                      <React.Fragment key={h}>
                        {[0, 1, 2, 3].map(q => (
                          <div key={q} data-date={ds} data-min={h * 60 + q * 15} style={{ height: hourH / 4, borderTop: q === 0 ? '1px solid rgba(11,30,61,0.06)' : 'none' }} />
                        ))}
                      </React.Fragment>
                    ))}
                    {soloBarber && <BlockedLayer barber={soloBarber} lang={lang} compact hh={hourH} date={ds} />}
                    {drag && drag.tgtDate === ds && drag.tgtMin != null && (
                      <div style={{ position: 'absolute', insetInlineStart: 0, insetInlineEnd: 0, top: (drag.tgtMin - HOURS[0] * 60) / 60 * hourH, height: Math.max(10, dragDur / 60 * hourH - 2), borderRadius: 5, border: `1.5px dashed ${drag.ok ? accent : '#B03A3A'}`, background: drag.ok ? accent + '1f' : 'rgba(176,58,58,0.1)', zIndex: 2, pointerEvents: 'none' }} />
                    )}
                    {da.map(a => <ApptBlock key={a.id} a={a} staff={list} lang={lang} compact dragging={drag && drag.id === a.id} onPress={onPress} hh={hourH} />)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'month' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
              {dows.map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'rgba(11,30,61,0.45)', padding: '4px 0' }}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
              {Array.from({ length: firstDow }).map((_, i) => <div key={'e' + i} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const ds = fmt(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), day));
                const da = shown.filter(a => a.date === ds);
                const isToday = ds === todayStr();
                const dots = [...new Set(da.map(a => a.barberId))].slice(0, 4);
                return (
                  <button key={day} onClick={() => { setView('day'); const target = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), day); const diff = Math.round((target - base) / 86400000); setOffset(diff); }}
                    style={{ aspectRatio: '1', borderRadius: 11, border: isToday ? `1.5px solid ${accent}` : '1px solid rgba(11,30,61,0.07)', background: '#fff', cursor: 'pointer', font: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '6px 2px 2px', gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: isToday ? 800 : 600, color: isToday ? accent : '#0B1E3D' }}>{day}</span>
                    <span style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {dots.map((bid, k) => <span key={k} style={{ width: 5, height: 5, borderRadius: 3, background: colorFor(bid, list) }} />)}
                    </span>
                    {da.length > 0 && <span style={{ fontSize: 9.5, color: 'rgba(11,30,61,0.45)', fontWeight: 700 }}>{da.length}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* drag hint */}
      <div style={{ flexShrink: 0, textAlign: 'center', padding: '6px 0 calc(8px + env(safe-area-inset-bottom))', fontSize: 11.5, color: 'rgba(11,30,61,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Icon name="clock" size={13} color="rgba(11,30,61,0.35)" />{he ? 'לחיצה ארוכה לגרירה · נקישה לעריכה · צביטה/זום להגדלה' : 'Long-press to drag · tap to edit · pinch/zoom to scale'}
      </div>

      {/* floating drag ghost */}
      {drag && (
        <div style={{ position: 'fixed', left: drag.x, top: drag.y, transform: 'translate(-50%, -140%)', zIndex: 200, pointerEvents: 'none', padding: '7px 13px', borderRadius: 10, background: drag.ok ? '#0B1E3D' : '#B03A3A', color: '#fff', fontSize: 13, fontWeight: 700, boxShadow: '0 10px 26px rgba(0,0,0,0.32)', display: 'flex', alignItems: 'center', gap: 6, direction: 'ltr' }}>
          {drag.ok ? <Icon name="clock" size={15} color="#fff" /> : <Icon name="x" size={15} color="#fff" />}{drag.ok ? drag.label : (he ? 'חסום' : 'Blocked')}
        </div>
      )}

      {edit && <ApptEditSheet lang={lang} t={t} accent={accent} serif={serif} appt={edit} staff={list}
        onClose={() => setEdit(null)}
        onSave={(a) => { const changed = a.start !== edit.start || a.date !== edit.date; moveTo(a.id, a); setEdit(null); if (changed) setNotifyClient({ appt: a, change: 'rescheduled' }); }}
        onDelete={() => { const gone = edit; setAppts(prev => prev.map(x => x.id === edit.id ? { ...x, status: 'cancelled' } : x)); setEdit(null); setNotifyClient({ appt: gone, change: 'cancelled' }); toast && toast(he ? 'התור בוטל, החלון התפנה ✓' : 'Cancelled, slot freed ✓', he ? 'הזמן זמין שוב להזמנה' : 'The time is bookable again'); }} />}

      {notifyClient && <NotifyClientSheet lang={lang} t={t} accent={accent} serif={serif} appt={notifyClient.appt} change={notifyClient.change}
        onClose={() => setNotifyClient(null)}
        onSent={(name) => { setNotifyClient(null); toast && toast(he ? 'נשלח ללקוח ✓' : 'Sent ✓', name); }} />}

      {closeDay && <CloseDaySheet lang={lang} t={t} accent={accent} serif={serif} date={closeDay} appts={appts} staff={list}
        onClose={() => setCloseDay(null)}
        onCancelDay={(date) => setAppts(prev => prev.map(a => (a.date === date && a.status !== 'done' && a.status !== 'no') ? { ...a, status: 'cancelled' } : a))}
        onSent={(n) => { setCloseDay(null); toast && toast(he ? `הודעה נשלחה ל-${n} לקוחות ✓` : `Sent to ${n} clients ✓`, he ? 'היום נסגר' : 'Day closed'); }} />}
    </div>
  );
}

Object.assign(window, { Calendar, ClientSheet, todayStr });
