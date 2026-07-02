// staff.jsx, barber dashboard + admin overview
// Exports: BarberApp, AdminApp

function Stat({ icon, label, value, accent, serif, sub }) {
  return (
    <div style={{ flex: 1, background: '#fff', borderRadius: 18, padding: 14, boxShadow: '0 3px 12px rgba(11,30,61,0.05)' }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(200,162,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Icon name={icon} size={18} color={accent} />
      </span>
      <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 23, color: '#0B1E3D', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 4, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#2E7D52', marginTop: 3, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

const STATUS = {
  done: { he: 'הושלם', en: 'Done', c: '#2E7D52', bg: 'rgba(46,125,82,0.1)' },
  now: { he: 'מתבצע', en: 'In chair', c: '#C8A24A', bg: 'rgba(200,162,74,0.14)' },
  next: { he: 'הבא בתור', en: 'Up next', c: '#14305A', bg: 'rgba(20,48,90,0.1)' },
  upcoming: { he: 'ממתין', en: 'Waiting', c: 'rgba(11,30,61,0.45)', bg: 'rgba(11,30,61,0.05)' },
};

// ── Appointment action sheet: status (done / no-show) + open client card ──
function ApptActionSheet({ lang, t, accent, serif, appt, status, onClose, onCard, onReschedule, onSetStatus }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const svc = DATA.services.find(s => s.id === appt.svc);
  const cn = window.clientLabel ? window.clientLabel(appt, lang) : nm({ he: appt.clientHe, en: appt.clientEn });
  const done = status === 'done', no = status === 'no';
  const item = (icon, label, onClick, opt = {}) => (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 15px', borderRadius: 14, border: `1px solid ${opt.danger ? 'rgba(176,65,58,0.25)' : 'rgba(11,30,61,0.1)'}`, cursor: 'pointer', font: 'inherit', background: opt.danger ? 'rgba(176,65,58,0.05)' : '#fff', color: opt.danger ? '#B0413A' : '#0B1E3D' }}>
      <span style={{ width: 36, height: 36, borderRadius: 11, background: opt.danger ? 'rgba(176,65,58,0.1)' : (opt.tint || 'rgba(11,30,61,0.05)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={icon} size={18} color={opt.danger ? '#B0413A' : (opt.color || accent)} /></span>
      <span style={{ flex: 1, textAlign: 'start', fontSize: 15, fontWeight: 700 }}>{label}</span>
      <Icon name={he ? 'chevron' : 'chevronR'} size={17} color="rgba(11,30,61,0.25)" />
    </button>
  );
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 96, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)', padding: '10px 18px calc(24px + env(safe-area-inset-bottom))' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 14px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16 }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: no ? 'rgba(176,65,58,0.1)' : done ? 'rgba(46,125,82,0.1)' : 'rgba(200,162,74,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={no ? 'x' : done ? 'check' : 'clock'} size={22} color={no ? '#B0413A' : done ? '#2E7D52' : accent} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 18.5, color: '#0B1E3D', lineHeight: 1.1 }}>{cn}</div>
            <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.55)', marginTop: 2, direction: 'ltr', textAlign: 'start' }}>{appt.start} · {svc ? nm(svc) : ''}{no ? (he ? ' · לא הגיע' : ' · no-show') : done ? (he ? ' · בוצע' : ' · done') : ''}</div>
            {appt.paid && window.PaidChip && <div style={{ marginTop: 5 }}><PaidChip paid={appt.paid} lang={lang} /></div>}
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={17} color="#0B1E3D" /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {item('user', t.openClientCard, onCard)}
          {item('calendar', t.reschedule, onReschedule)}
          {done
            ? item('refresh', t.markUndone, () => onSetStatus('confirmed'))
            : !no && item('check', t.markDone, () => onSetStatus('done'), { color: '#2E7D52', tint: 'rgba(46,125,82,0.1)' })}
          {no
            ? item('refresh', t.undoNoShow, () => onSetStatus('confirmed'))
            : item('bell', t.markNoShow, () => onSetStatus('no'), { danger: true })}
        </div>
      </div>
    </div>
  );
}

function BarberApp({ lang, t, accent, serif, taglines, meId, staff, appts, setAppts, updateBarber, approveAppt, rejectAppt, notify, modeSwitch, toast, onLogout }) {
  const nm = o => o[lang];
  const list = staff || DATA.barbers;
  const me = list.find(b => b.id === (meId || 'p1')) || list[0];
  const pending = (window.pendingFor ? window.pendingFor(appts, { meId: me.id }) : []);
  const doApprove = (id) => { approveAppt && approveAppt(id); toast && toast(lang === 'he' ? 'התור אושר ✓' : 'Approved ✓', lang === 'he' ? 'נשלח אישור ללקוח' : 'Client notified'); };
  const doReject = (id, msg) => { rejectAppt && rejectAppt(id, msg); toast && toast(lang === 'he' ? 'הבקשה נדחתה' : 'Declined', lang === 'he' ? 'נשלחה הודעה ללקוח עם הצעה למועד חלופי' : 'Client notified with a rebook offer'); };
  const [page, setPage] = React.useState('home');     // home | calendar | avail | exceptions | profile
  const [client, setClient] = React.useState(null);   // appt for contact sheet
  const [actionAppt, setActionAppt] = React.useState(null); // appt action sheet (status / card)
  const [boss, setBoss] = React.useState(false);       // "talk to the boss" sheet
  const [conflict, setConflict] = React.useState(null); // schedule-change conflicts
  const today = todayStr();
  // Round 11: the day list can page אתמול / היום / מחר (same spot, arrows)
  const [dayOff, setDayOff] = React.useState(0); // -1 · 0 · +1
  const dateOf = (off) => { const d = new Date(); d.setDate(d.getDate() + off); const pad = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const viewDate = dateOf(dayOff);
  const myDay = (appts || []).filter(a => a.barberId === me.id && a.date === viewDate && a.status !== 'cancelled' && a.status !== 'rejected').sort((x, y) => x.start.localeCompare(y.start));
  const myToday = (appts || []).filter(a => a.barberId === me.id && a.date === today && a.status !== 'cancelled' && a.status !== 'rejected').sort((x, y) => x.start.localeCompare(y.start));
  const revenue = myToday.filter(a => a.status !== 'no').reduce((n, a) => n + (DATA.services.find(s => s.id === a.svc)?.price || 0), 0);
  const _sMin = s => { const [h, m] = (s || '0:0').split(':').map(Number); return h * 60 + m; };
  const _now = new Date(); const nowMin = _now.getHours() * 60 + _now.getMinutes();
  // effective status: explicit no-show/done win; otherwise derive from the current time
  // (an appointment whose end time has passed is auto-marked "done").
  const _dur = a => { const s = DATA.services.find(x => x.id === a.svc); return s ? s.min : 45; };
  const effStatus = (a) => a.status === 'no' ? 'no' : a.status === 'done' ? 'done'
    : (a.date && a.date < today) ? 'done' : (a.date && a.date > today) ? 'upcoming'
    : (nowMin >= _sMin(a.start) + _dur(a)) ? 'done' : (nowMin >= _sMin(a.start)) ? 'now' : 'upcoming';
  const remainingToday = myToday.filter(a => { const e = effStatus(a); return e === 'upcoming' || e === 'now'; });
  const nextAppt = remainingToday.find(a => _sMin(a.start) >= nowMin) || remainingToday[0] || null;
  const setApptStatus = (id, status) => { if (setAppts) setAppts(prev => prev.map(a => a.id === id ? { ...a, status } : a)); };

  if (page === 'calendar') return <Calendar lang={lang} t={t} accent={accent} serif={serif} mode="barber" meId={me.id} staff={list} appts={appts} setAppts={setAppts} onClose={() => setPage('home')} toast={toast} />;
  if (page === 'avail') return <WeeklyScheduleEditor lang={lang} t={t} accent={accent} serif={serif} barber={me} onClose={() => setPage('home')} onSave={(week) => { const cf = window.weekConflicts ? window.weekConflicts(me, week, appts) : []; updateBarber(me.id, { week }); setPage('home'); if (cf.length) setConflict(cf); }} />;
  if (page === 'exceptions') return <ExceptionsEditor lang={lang} t={t} accent={accent} serif={serif} barber={me} appts={appts} onClose={() => setPage('home')} onSave={(exceptions) => { const cf = window.exceptionConflicts ? window.exceptionConflicts(me, exceptions, appts) : []; updateBarber(me.id, { exceptions }); setPage('home'); const refunds = window.punchStore ? window.punchStore.openRefundsForAbsence(cf) : 0; if (refunds) toast && toast(lang === 'he' ? `${refunds} תורים ששולמו מראש · נפתחה התראת החזר` : `${refunds} prepaid · refund alert opened`, lang === 'he' ? 'יש לטפל בהחזר ידנית (ביט/פייבוקס)' : 'Handle refund manually (Bit/PayBox)'); if (cf.length) setConflict(cf); }} />;
  if (page === 'profile') return <BarberSheet lang={lang} t={t} accent={accent} serif={serif} barber={me} staff={list} initialTab="details" selfMode onClose={() => setPage('home')} onSave={(b) => { updateBarber(me.id, b); setPage('home'); }} />;

  const areas = [
    { id: 'calendar', icon: 'calendar', label: t.bSchedule, sub: t.bScheduleSub },
    { id: 'avail', icon: 'calendar', label: lang === 'he' ? 'הלו״ז השבועי שלי' : 'My weekly schedule', sub: lang === 'he' ? 'ימים, שעות והפסקות' : 'Days, hours & breaks' },
    { id: 'exceptions', icon: 'pin', label: t.bExceptions, sub: t.bExceptionsSub },
    { id: 'profile', icon: 'user', label: t.bProfileArea, sub: t.bProfileSub },
  ];
  const dateLabel = new Date().toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FBF9F5', overflowY: 'auto' }}>
      <div style={{ padding: '54px 18px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <span style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px rgba(200,162,74,0.85)' }}>
            <ImgSlot id={'staff-' + me.id} shape="circle" readonly placeholder={nm(me).trim()[0]} style={{ width: 52, height: 52 }} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.5)' }}>{t.bGreeting},</div>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: '#0B1E3D' }}>{nm(me)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.5)', fontWeight: 600 }}>{dateLabel}</div>
            <div style={{ fontSize: 11, color: me.active === false ? '#B03A3A' : '#2E7D52', fontWeight: 700, marginTop: 2 }}>{me.active === false ? (lang === 'he' ? 'לא במשמרת' : 'Off shift') : (lang === 'he' ? 'במשמרת' : 'On shift')}</div>
          </div>
        </div>

        {/* quick stats, live & tappable */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setPage('calendar')} className="tapsq" style={{ flex: 1, minWidth: 0, textAlign: 'start', font: 'inherit', cursor: 'pointer', background: '#fff', borderRadius: 18, padding: 14, boxShadow: '0 3px 12px rgba(11,30,61,0.05)', border: '1px solid rgba(11,30,61,0.05)' }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(200,162,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}><Icon name="calendar" size={18} color={accent} /></span>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 23, color: '#0B1E3D', lineHeight: 1 }}>{myToday.length}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 4, fontWeight: 500 }}>{t.bToday}</div>
            <div style={{ fontSize: 11, color: remainingToday.length ? accent : '#2E7D52', marginTop: 3, fontWeight: 700 }}>{remainingToday.length ? (lang === 'he' ? `נשארו ${remainingToday.length}` : `${remainingToday.length} left`) : (lang === 'he' ? 'הכל הושלם' : 'all done')}</div>
          </button>
          {/* Personal revenue, only the MAIN barber (owner) sees turnover; a regular
              barber never sees his own till, regardless of which view he's in. */}
          {me.owner && (
          <button onClick={() => setPage('calendar')} className="tapsq" style={{ flex: 1, minWidth: 0, textAlign: 'start', font: 'inherit', cursor: 'pointer', background: '#fff', borderRadius: 18, padding: 14, boxShadow: '0 3px 12px rgba(11,30,61,0.05)', border: '1px solid rgba(11,30,61,0.05)' }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(200,162,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}><Icon name="coin" size={18} color={accent} /></span>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 23, color: '#0B1E3D', lineHeight: 1, direction: 'ltr', textAlign: 'start' }}>{'₪' + revenue}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 4, fontWeight: 500 }}>{t.bRevenue}</div>
            <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.4)', marginTop: 3, fontWeight: 700 }}>{lang === 'he' ? 'לחצו לפירוט' : 'tap to view'}</div>
          </button>
          )}
          <button onClick={() => { if (nextAppt) setClient(nextAppt); else setPage('calendar'); }} className="tapsq" style={{ flex: 1, minWidth: 0, textAlign: 'start', font: 'inherit', cursor: 'pointer', background: nextAppt ? 'linear-gradient(140deg,#14305A,#0B1E3D)' : '#fff', borderRadius: 18, padding: 14, boxShadow: '0 6px 18px rgba(11,30,61,0.18)', border: 'none' }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: nextAppt ? 'rgba(228,201,123,0.18)' : 'rgba(200,162,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}><Icon name="clock" size={18} color={nextAppt ? '#E4C97B' : accent} /></span>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 23, color: nextAppt ? '#FBF9F5' : '#0B1E3D', lineHeight: 1, direction: 'ltr', textAlign: 'start' }}>{nextAppt ? nextAppt.start : '-'}</div>
            <div style={{ fontSize: 11.5, color: nextAppt ? 'rgba(251,249,245,0.6)' : 'rgba(11,30,61,0.5)', marginTop: 4, fontWeight: 500 }}>{lang === 'he' ? 'התור הבא' : 'Next visit'}</div>
            <div style={{ fontSize: 11, color: nextAppt ? '#E4C97B' : 'rgba(11,30,61,0.4)', marginTop: 3, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nextAppt ? (window.clientLabel ? window.clientLabel(nextAppt, lang) : nm({ he: nextAppt.clientHe, en: nextAppt.clientEn })) : (lang === 'he' ? 'אין תורים' : 'none left')}</div>
          </button>
        </div>

        {/* NEW booking requests awaiting approval */}
        <PendingList lang={lang} accent={accent} serif={serif} requests={pending} staff={list} onApprove={doApprove} onReject={doReject} />

        {/* Round 10: prepaid visits the client cancelled, refund or rebook, the barber decides */}
        {window.PayDecisionList && <PayDecisionList lang={lang} accent={accent} serif={serif} meId={me.id} toast={toast} />}

        {/* AREA 1, appointments with day paging (yesterday / today / tomorrow) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 9 }}>
            <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 18, color: '#0B1E3D' }}>{t.bToday2}</span>
            <span onClick={() => setPage('calendar')} style={{ fontSize: 13, fontWeight: 600, color: accent, cursor: 'pointer' }}>{t.viewAll2}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 11 }}>
            <button onClick={() => setDayOff(o => Math.max(-1, o - 1))} disabled={dayOff <= -1} aria-label={lang === 'he' ? 'יום קודם' : 'Previous day'} style={{ width: 34, height: 34, borderRadius: 11, border: '1px solid rgba(11,30,61,0.12)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: dayOff <= -1 ? 'default' : 'pointer', opacity: dayOff <= -1 ? 0.35 : 1 }}><Icon name={lang === 'he' ? 'chevronR' : 'chevron'} size={17} color="#0B1E3D" /></button>
            <span style={{ minWidth: 96, textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: 14.5, fontWeight: 800, color: dayOff === 0 ? '#0B1E3D' : '#9C7B2E' }}>{dayOff === -1 ? (lang === 'he' ? 'אתמול' : 'Yesterday') : dayOff === 1 ? (lang === 'he' ? 'מחר' : 'Tomorrow') : (lang === 'he' ? 'היום' : 'Today')}</span>
              <span style={{ display: 'block', fontSize: 10.5, color: 'rgba(11,30,61,0.45)', fontWeight: 600, direction: 'ltr' }}>{new Date(viewDate + 'T00:00').toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </span>
            <button onClick={() => setDayOff(o => Math.min(1, o + 1))} disabled={dayOff >= 1} aria-label={lang === 'he' ? 'יום הבא' : 'Next day'} style={{ width: 34, height: 34, borderRadius: 11, border: '1px solid rgba(11,30,61,0.12)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: dayOff >= 1 ? 'default' : 'pointer', opacity: dayOff >= 1 ? 0.35 : 1 }}><Icon name={lang === 'he' ? 'chevron' : 'chevronR'} size={17} color="#0B1E3D" /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {myDay.length === 0 && <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(11,30,61,0.4)', fontSize: 13.5, background: '#fff', borderRadius: 16 }}>{t.noVisits}</div>}
            {myDay.map(a => {
              const svc = DATA.services.find(s => s.id === a.svc);
              const es = effStatus(a);
              const done = es === 'done', no = es === 'no', now = es === 'now';
              const badge = no ? { txt: t.stNo, c: '#B0413A', bg: 'rgba(176,65,58,0.1)' }
                : done ? { txt: lang === 'he' ? 'בוצע' : 'Done', c: '#2E7D52', bg: 'rgba(46,125,82,0.1)' }
                : now ? { txt: t.stNow, c: '#9C7B2E', bg: 'rgba(200,162,74,0.16)' } : null;
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 16, padding: '12px 14px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)', opacity: done ? 0.6 : no ? 0.82 : 1, borderInlineStart: `3px solid ${no ? '#B0413A' : now ? '#C8A24A' : 'transparent'}` }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: no ? '#B0413A' : '#0B1E3D', minWidth: 44, direction: 'ltr', textDecoration: no ? 'line-through' : 'none' }}>{a.start}</div>
                  <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(11,30,61,0.08)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontWeight: 600, fontSize: 14.5, color: '#0B1E3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{window.clientLabel ? window.clientLabel(a, lang) : nm({ he: a.clientHe, en: a.clientEn })}</span>
                      {badge && <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10.5, fontWeight: 700, color: badge.c, background: badge.bg, padding: '2px 8px', borderRadius: 20 }}>{done && <Icon name="check" size={11} color={badge.c} stroke={2.6} />}{badge.txt}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.5)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span>{nm(svc)} · {svc.min} {t.min}</span>
                      {a.paid && window.PaidChip && <PaidChip paid={a.paid} lang={lang} left={a.paid === 'punch' && window.punchStore ? window.punchStore.balanceFor(a.clientId === 'me' ? 'me' : a.clientId, appts) : null} />}
                    </div>
                  </div>
                  <button onClick={() => setActionAppt(a)} style={{ width: 38, height: 38, borderRadius: 11, border: '1px solid rgba(200,162,74,0.4)', background: 'rgba(200,162,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }} title={t.apptActions}>
                    <Icon name="gear" size={18} color={accent} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* AREAS 2-4, schedule / availability / profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {areas.map(x => (
            <button key={x.id} onClick={() => setPage(x.id)} style={{ display: 'flex', alignItems: 'center', gap: 13, background: '#fff', border: '1px solid rgba(11,30,61,0.06)', borderRadius: 16, padding: '15px', cursor: 'pointer', font: 'inherit', boxShadow: '0 2px 8px rgba(11,30,61,0.04)', textAlign: 'start' }}>
              <span style={{ width: 46, height: 46, borderRadius: 13, background: 'linear-gradient(135deg,rgba(228,201,123,0.22),rgba(200,162,74,0.16))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={x.icon} size={23} color={accent} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15.5, color: '#0B1E3D' }}>{x.label}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{x.sub}</div>
              </div>
              <Icon name={lang === 'he' ? 'chevron' : 'chevronR'} size={18} color="rgba(11,30,61,0.3)" />
            </button>
          ))}
        </div>

        {/* "הסורים על הגדר?", call the boss */}
        {!me.owner && (
          <div style={{ marginTop: 4 }}>
            <div style={{ textAlign: 'center', fontFamily: serif, fontWeight: 700, fontSize: 18, color: '#0B1E3D' }}>{lang === 'he' ? 'הסורים על הגדר? 🐎' : 'Things heating up?'}</div>
            <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(11,30,61,0.5)', marginTop: 3, marginBottom: 11 }}>{lang === 'he' ? 'לחץ או עומס? רפי כאן בשבילך.' : 'Pressure or a rush? Rafi’s here.'}</div>
            <button onClick={() => setBoss(true)} className="tapsq" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '9px 16px 9px 9px', borderRadius: 44, border: '1.5px solid rgba(228,201,123,0.45)', cursor: 'pointer', font: 'inherit', background: 'linear-gradient(135deg,#14305A,#0B1E3D)', boxShadow: '0 12px 28px rgba(11,30,61,0.32)' }}>
              <img src={(window._asset || (p => p))('assets/rafi-face.png')} alt="רפי" style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff', objectFit: 'cover', flexShrink: 0, boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px rgba(228,201,123,0.85)' }} />
              <span style={{ flex: 1, textAlign: 'center', fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#FBF9F5', letterSpacing: 0.3 }}>{lang === 'he' ? 'דבר עם הבוס!' : 'Talk to the boss!'}</span>
              <span style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(228,201,123,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="message" size={21} color="#E4C97B" /></span>
            </button>
          </div>
        )}

        {/* "אני עכשיו לקוח" - rare action, lives at the bottom near sign-out */}
        {modeSwitch && (
          <div style={{ marginTop: 4 }}>{modeSwitch}</div>
        )}

        {/* sign out of this barber's account (mirrors the customer profile) */}
        {onLogout && (
          <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 4, padding: '14px', borderRadius: 14, border: '1px solid rgba(11,30,61,0.12)', background: '#fff', font: 'inherit', fontSize: 14.5, fontWeight: 600, color: '#0B1E3D', cursor: 'pointer', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
            <Icon name="phone" size={17} color={accent} />{lang === 'he' ? 'התנתקות' : 'Log out'}
          </button>
        )}
      </div>
      {client && <CustomerCard lang={lang} t={t} accent={accent} serif={serif} client={resolveClient(client, lang)} mode="barber" meId={me.id} staff={list} appts={appts} onClose={() => setClient(null)} onReschedule={() => { setClient(null); setPage('calendar'); }} toast={toast} />}
      {actionAppt && <ApptActionSheet lang={lang} t={t} accent={accent} serif={serif} appt={actionAppt} status={effStatus(actionAppt)}
        onClose={() => setActionAppt(null)}
        onCard={() => { const a = actionAppt; setActionAppt(null); setClient(a); }}
        onReschedule={() => { setActionAppt(null); setPage('calendar'); }}
        onSetStatus={(s) => {
          setApptStatus(actionAppt.id, s);
          const cn = window.clientLabel ? window.clientLabel(actionAppt, lang) : nm({ he: actionAppt.clientHe, en: actionAppt.clientEn });
          if (s === 'no') toast && toast(lang === 'he' ? 'סומן: לא הגיע' : 'Marked no-show', cn + (actionAppt.paid === 'punch' ? (lang === 'he' ? ' · הניקוב נשרף' : ' · punch burned') : (lang === 'he' ? ' · עודכן בכרטיס הלקוח' : ' · added to client card')));
          else if (s === 'done') toast && toast(lang === 'he' ? 'סומן כבוצע ✓' : 'Marked done ✓', cn + (actionAppt.paid === 'punch' ? (lang === 'he' ? ' · ניקוב נרשם בכרטיסייה' : ' · punch registered') : ''));
          setActionAppt(null);
        }} />}
      {boss && <BossSheet lang={lang} t={t} accent={accent} serif={serif} onClose={() => setBoss(false)} />}
      {conflict && <ConflictSheet lang={lang} accent={accent} serif={serif} conflicts={conflict} staff={list}
        title={lang === 'he' ? 'שינוי הלו״ז יצר התנגשות' : 'Schedule change conflicts'} sub={lang === 'he' ? 'יש לך תורים שנופלים מחוץ לשעות החדשות או בתוך הפסקה. הזיזו אותם או הודיעו ללקוחות.' : 'Some bookings now fall outside your hours or inside a break.'}
        onClose={() => setConflict(null)} onOpenCalendar={() => { setConflict(null); setPage('calendar'); }}
        onNotify={() => { const n = conflict.length; setConflict(null); toast && toast(lang === 'he' ? `נשלחה הודעה ל-${n} לקוחות ✓` : `Notified ${n} ✓`, lang === 'he' ? 'הוצע מועד חלופי' : 'Rebook offered'); }} />}
    </div>
  );
}

function AdminManage({ lang, t, accent, serif, taglines, setTagline, products, setProduct, addProduct, delProduct, onBack }) {
  const nm = o => o[lang];
  const staff = DATA.barbers.map((b, i) => ({ b, status: i === 2 ? 'break' : 'active', today: [6, 5, 4][i] || 0 }));
  const sStatus = { active: { he: 'פעיל', en: 'Active', c: '#2E7D52', bg: 'rgba(46,125,82,0.1)' }, break: { he: 'בהפסקה', en: 'On break', c: '#C8A24A', bg: 'rgba(200,162,74,0.14)' }, off: { he: 'לא במשמרת', en: 'Off', c: 'rgba(11,30,61,0.4)', bg: 'rgba(11,30,61,0.05)' } };
  const popular = [
    { s: DATA.services[1], pct: 38 }, { s: DATA.services[0], pct: 27 }, { s: DATA.services[3], pct: 18 }, { s: DATA.services[2], pct: 11 },
  ].filter(p => p.s);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FBF9F5', overflowY: 'auto' }}>
      <div style={{ padding: '54px 18px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <Icon name={lang === 'he' ? 'arrowR' : 'arrowL'} size={20} color="#0B1E3D" />
          </button>
          <div>
            <div style={{ fontSize: 12, color: accent, fontWeight: 600 }}>{DATA.brand[lang]}</div>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: '#0B1E3D' }}>{lang === 'he' ? 'ניהול ותוכן' : 'Manage & content'}</div>
          </div>
        </div>

        {/* utilization bar */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 18, boxShadow: '0 3px 12px rgba(11,30,61,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 14.5, color: '#0B1E3D' }}>{t.aUtil}</span>
            <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: accent }}>82%</span>
          </div>
          <div style={{ height: 10, borderRadius: 6, background: 'rgba(11,30,61,0.07)', overflow: 'hidden' }}>
            <div style={{ width: '82%', height: '100%', borderRadius: 6, background: `linear-gradient(90deg,#E4C97B,${accent})` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'rgba(11,30,61,0.4)' }}>
            <span>{lang === 'he' ? '0 כיסאות פנויים' : '0 chairs idle'}</span><span>{lang === 'he' ? '4 ספרים פעילים' : '4 barbers on'}</span>
          </div>
        </div>

        {/* staff + manager-editable taglines */}
        <div>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 17, color: '#0B1E3D', marginBottom: 3 }}>{t.aStaff}</div>
          <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.5)', marginBottom: 12 }}>{lang === 'he' ? 'ערכו את המשפט שמופיע ללקוחות, או בחרו רעיון' : 'Edit the line customers see, or pick an idea'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {staff.map((x, k) => {
              const st = sStatus[x.status];
              const ideas = DATA.tagIdeas[lang];
              const chips = [0, 1, 2].map(i => ideas[(k + i) % ideas.length]);
              return (
                <div key={k} style={{ background: '#fff', borderRadius: 18, padding: 14, boxShadow: '0 3px 12px rgba(11,30,61,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <Avatar b={x.b} size={38} ring={false} lang={lang} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14.5, color: '#0B1E3D' }}>{nm(x.b)}</div>
                      <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 1 }}>{x.today} {lang === 'he' ? 'תורים היום' : 'today'}</div>
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: st.c, background: st.bg, padding: '4px 10px', borderRadius: 20 }}>{st[lang]}</span>
                  </div>
                  <input value={tagOf(x.b, taglines, lang)} onChange={e => setTagline(x.b.id, lang, e.target.value)} maxLength={42}
                    placeholder={lang === 'he' ? 'משפט אישי…' : 'Personal tagline…'}
                    style={{ width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 13.5, fontStyle: 'italic', marginTop: 11,
                      color: '#0B1E3D', background: 'rgba(11,30,61,0.04)', border: '1px solid rgba(11,30,61,0.1)',
                      borderRadius: 11, padding: '10px 12px', textAlign: 'start', direction: lang === 'he' ? 'rtl' : 'ltr', outline: 'none' }} />
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 9 }}>
                    {chips.map((idea, i) => (
                      <button key={i} onClick={() => setTagline(x.b.id, lang, idea)} style={{
                        font: 'inherit', fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                        border: `1px solid ${accent}55`, background: `${accent}14`, color: '#0B1E3D',
                        borderRadius: 20, padding: '5px 10px' }}>{idea}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* popular services */}
        <div>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 17, color: '#0B1E3D', marginBottom: 12 }}>{t.aPopular}</div>
          <div style={{ background: '#fff', borderRadius: 20, padding: '6px 16px', boxShadow: '0 3px 12px rgba(11,30,61,0.05)' }}>
            {popular.map((p, k) => (
              <div key={k} style={{ padding: '12px 0', borderBottom: k < popular.length - 1 ? '1px solid rgba(11,30,61,0.06)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#0B1E3D' }}>{nm(p.s)}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(11,30,61,0.5)' }}>{p.pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 4, background: 'rgba(11,30,61,0.06)', overflow: 'hidden' }}>
                  <div style={{ width: p.pct + '%', height: '100%', borderRadius: 4, background: accent }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminApp(props) {
  const { lang, t, accent, serif, notify, taglines, staff, updateBarber, addBarber, removeBarber, appts, setAppts, products, setProduct, addProduct, delProduct, reorderProducts, services, setService, addService, delService, approveAppt, rejectAppt, notifyBarbers, toggleNotifyBarber, pushNotify, firstMonth, toast, onLogout } = props;
  const [page, setPage] = React.useState('dashboard');
  const [navStack, setNavStack] = React.useState([]); // pages visited before the current one
  const [calInit, setCalInit] = React.useState(null);
  const [ownerMode, setOwnerMode] = React.useState('manage');
  const rafiId = (staff || DATA.barbers).find(b => b.owner)?.id || 'rafi';
  // back returns to the ACTUAL previous screen (e.g. settings → sub-screen → back = settings),
  // not always the dashboard. Falls back to dashboard when the stack is empty.
  const back = () => {
    setCalInit(null);
    if (navStack.length === 0) { setPage('dashboard'); return; }
    const prev = navStack[navStack.length - 1];
    setNavStack(navStack.slice(0, -1));
    setPage(prev);
  };
  const go = (id) => {
    if (id === 'tomorrow') { setCalInit({ view: 'day', offset: 1 }); setNavStack([...navStack, page]); setPage('calendar'); return; }
    // Round 15: the "תורים היום" tile opens the full calendar on the day it's showing
    if (typeof id === 'string' && id.indexOf('calday:') === 0) { setCalInit({ view: 'day', offset: parseInt(id.slice(7), 10) || 0 }); setNavStack([...navStack, page]); setPage('calendar'); return; }
    setCalInit(null); setNavStack([...navStack, page]); setPage(id);
  };
  const modeSwitch = <OwnerModeToggle mode={ownerMode} setMode={setOwnerMode} lang={lang} />;

  if (page === 'calendar') return <Calendar lang={lang} t={t} accent={accent} serif={serif} mode="owner" staff={staff} appts={appts} setAppts={setAppts} onClose={back} initialView={calInit ? calInit.view : undefined} initialOffset={calInit ? calInit.offset : undefined} toast={toast} />;
  if (page === 'customers') return <CustomersScreen lang={lang} t={t} accent={accent} serif={serif} onBack={back} staff={staff} appts={appts} toast={toast} />;
  if (page === 'broadcast') return <BroadcastScreen lang={lang} t={t} accent={accent} serif={serif} onBack={back} notify={notify} toast={toast} staff={staff} appts={appts} pushNotify={pushNotify} />;
  if (page === 'staff') return <StaffManagement lang={lang} t={t} accent={accent} serif={serif} onBack={back} staff={staff} updateBarber={updateBarber} addBarber={addBarber} removeBarber={removeBarber} appts={appts} setAppts={setAppts} toast={toast} />;
  if (page === 'noshows') return <NoShowsScreen lang={lang} t={t} accent={accent} serif={serif} onBack={back} appts={appts} staff={staff} toast={toast} />;
  if (page === 'insights') return <InsightsScreen lang={lang} t={t} accent={accent} serif={serif} onBack={back} go={go} appts={appts} staff={staff} firstMonth={firstMonth} />;
  if (page === 'trends') return <TrendsScreen lang={lang} t={t} accent={accent} serif={serif} onBack={back} appts={appts} staff={staff} firstMonth={firstMonth} />;
  if (page === 'products') return (
    <Shell><ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={lang === 'he' ? 'מנהל' : 'Admin'} title={t.prodMgr} onBack={back} /><Body><ShopManager lang={lang} t={t} accent={accent} serif={serif} products={products} setProduct={setProduct} addProduct={addProduct} delProduct={delProduct} reorderProducts={reorderProducts} /></Body></Shell>
  );
  if (page === 'services') return <ServiceTypesScreen lang={lang} t={t} accent={accent} serif={serif} onBack={back} services={services} setService={setService} addService={addService} delService={delService} appts={appts} staff={staff} toast={toast} />;
  if (page === 'notifsettings') return <NotifyControlsScreen lang={lang} t={t} accent={accent} serif={serif} onBack={back} staff={staff} notifyBarbers={notifyBarbers} toggleNotifyBarber={toggleNotifyBarber} />;
  if (page === 'dormant') return <DormantScreen lang={lang} t={t} accent={accent} serif={serif} onBack={back} staff={staff} toast={toast} />;
  if (page === 'regulars') return <RegularsScreen lang={lang} t={t} accent={accent} serif={serif} onBack={back} staff={staff} toast={toast} />;
  if (page === 'documents') return <DocumentsManager lang={lang} t={t} accent={accent} serif={serif} onBack={back} toast={toast} />;
  if (page === 'punchcards') return <AdminPunchScreen lang={lang} t={t} accent={accent} serif={serif} onBack={back} appts={appts} staff={staff} toast={toast} />;
  if (page === 'gallery') return <AdminGalleryScreen lang={lang} t={t} accent={accent} serif={serif} onBack={back} toast={toast} />;
  if (page === 'settings') return <SettingsScreen lang={lang} t={t} accent={accent} serif={serif} onBack={back} go={go} onLogout={onLogout} />;
  if (page === 'expenses') return <ExpensesScreen lang={lang} t={t} accent={accent} serif={serif} onBack={back} toast={toast} />;
  if (page === 'automations') return <AutomationsScreen lang={lang} t={t} accent={accent} serif={serif} onBack={back} appts={appts} toast={toast} />;
  if (page === 'socialmkt') return <SocialPostScreen lang={lang} t={t} accent={accent} serif={serif} onBack={back} appts={appts} toast={toast} />;

  // dashboard root, Rafi can flip to "my calendar" and work as a barber like anyone else
  if (ownerMode === 'myday') {
    return <BarberApp lang={lang} t={t} accent={accent} serif={serif} taglines={taglines} meId={rafiId} staff={staff} appts={appts} setAppts={setAppts} updateBarber={updateBarber} approveAppt={approveAppt} rejectAppt={rejectAppt} notify={notify} modeSwitch={modeSwitch} toast={toast} />;
  }
  return <AdminDashboard lang={lang} t={t} accent={accent} serif={serif} go={go} staff={staff} appts={appts} firstMonth={firstMonth} modeSwitch={modeSwitch} approveAppt={approveAppt} rejectAppt={rejectAppt} notifyBarbers={notifyBarbers} toast={toast} />;
}

Object.assign(window, { BarberApp, AdminManage, AdminApp });
