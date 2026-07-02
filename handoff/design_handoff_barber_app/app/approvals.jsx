// approvals.jsx, Flagship: real-time appointment approval (request → approve / reject)
// Shared by the barber desk and the manager dashboard.
// Exports: PendingList, RejectSheet, pendingFor
const { useState: useAP } = React;

// pending requests relevant to a viewer
// scope: 'barber' → only meId · 'admin' → all, optionally filtered by notifyBarbers map
function pendingFor(appts, { meId, notifyBarbers } = {}) {
  let rows = (appts || []).filter(a => a.status === 'pending');
  if (meId) rows = rows.filter(a => a.barberId === meId);
  if (notifyBarbers) rows = rows.filter(a => notifyBarbers[a.barberId] !== false);
  return rows.sort((x, y) => (x.date + x.start).localeCompare(y.date + y.start));
}

function _whenLbl(date, start, he) {
  const pad = n => String(n).padStart(2, '0'); const today = (() => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })();
  const tom = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })();
  if (date === today) return (he ? 'היום' : 'Today');
  if (date === tom) return (he ? 'מחר' : 'Tomorrow');
  return new Date(date + 'T00:00').toLocaleDateString(he ? 'he-IL' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ── Reject sheet: editable apology message ──
function RejectSheet({ lang, accent, serif, appt, onClose, onSend }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const name = window.clientLabel ? window.clientLabel(appt, lang) : nm({ he: appt.clientHe, en: appt.clientEn });
  const def = he
    ? `שלום ${name.split(' ')[0]}, לצערנו לא נוכל לקבוע תור בשעה זו, עמך הסליחה. נשמח להציע לך מועד חלופי 🙏 מספרפי.`
    : `Hi ${name.split(' ')[0]}, unfortunately we can't take this time slot, our apologies. We'd be glad to offer you another time 🙏 Barbershop.`;
  const [text, setText] = useAP(def);
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 98, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)', padding: '10px 20px calc(20px + env(safe-area-inset-bottom))' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 14px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(176,65,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="x" size={22} color="#B0413A" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 19, color: '#0B1E3D', lineHeight: 1.1 }}>{he ? `לדחות את הבקשה?` : 'Decline request?'}</div>
            <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.55)', marginTop: 2 }}>{name} · <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{appt.start}</span></div>
          </div>
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 7, marginInlineStart: 2 }}>{he ? 'הודעה ללקוח (ניתנת לעריכה)' : 'Message to client (editable)'}</div>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={4} style={{ width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 14.5, lineHeight: 1.55, color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.12)', borderRadius: 14, padding: '12px 13px', outline: 'none', resize: 'none', direction: he ? 'rtl' : 'ltr', textAlign: 'start' }} />
        <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.5)', margin: '9px 2px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="refresh" size={14} color={accent} />{he ? 'הלקוח יקבל הצעה לבחור מועד חלופי.' : 'The client will be offered an alternative time.'}
        </div>
        <button onClick={() => onSend(appt.id, text)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', padding: '15px', borderRadius: 16, border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 16, fontWeight: 700, background: '#B0413A', color: '#fff', boxShadow: '0 8px 22px rgba(176,65,58,0.28)' }}>
          <Icon name="x" size={19} color="#fff" stroke={2.4} />{he ? 'דחה ושלח הודעה' : 'Decline & notify'}
        </button>
        <button onClick={onClose} style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(11,30,61,0.55)', font: 'inherit', fontSize: 14, fontWeight: 600, padding: 12, marginTop: 4, cursor: 'pointer' }}>{he ? 'חזרה' : 'Back'}</button>
      </div>
    </div>
  );
}

// ── Pending request list (the alert + approve/reject controls) ──
function PendingList({ lang, accent, serif, requests, staff, onApprove, onReject, showBarber }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const [rejecting, setRejecting] = useAP(null);
  const list = staff || DATA.barbers;
  if (!requests || requests.length === 0) return null;
  return (
    <div style={{ background: 'linear-gradient(140deg,#14305A,#0B1E3D)', borderRadius: 22, padding: 15, boxShadow: '0 12px 30px rgba(11,30,61,0.22)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
        <span className="ttl-bell" style={{ position: 'relative', width: 38, height: 38, borderRadius: 11, background: 'rgba(228,201,123,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="bell" size={20} color="#E4C97B" />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 17, color: '#FBF9F5', lineHeight: 1.1 }}>{he ? 'בקשות תור חדשות' : 'New booking requests'}</div>
          <div style={{ fontSize: 12, color: 'rgba(251,249,245,0.6)', marginTop: 2 }}>{he ? 'ממתינות לאישור שלך' : 'Awaiting your approval'}</div>
        </div>
        <span style={{ minWidth: 26, height: 26, padding: '0 8px', borderRadius: 13, background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', color: '#0B1E3D', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{requests.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {requests.map((a, k) => {
          const svc = DATA.services.find(s => s.id === a.svc);
          const barber = list.find(b => b.id === a.barberId);
          return (
            <div key={a.id} className="s2-pop" style={{ animationDelay: (k * 60) + 'ms', background: '#FBF9F5', borderRadius: 16, padding: '13px 14px', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(140deg,#13325c,#1d4a86)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FBF9F5', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{(window.clientLabel ? window.clientLabel(a, lang) : nm({ he: a.clientHe, en: a.clientEn })).trim()[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: '#0B1E3D' }}>{window.clientLabel ? window.clientLabel(a, lang) : nm({ he: a.clientHe, en: a.clientEn })}</div>
                  <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.55)', marginTop: 2 }}>
                    {_whenLbl(a.date, a.start, he)} · <span style={{ direction: 'ltr', unicodeBidi: 'isolate', fontWeight: 700, color: '#0B1E3D' }}>{a.start}</span> · {svc ? nm(svc) : ''}
                    {showBarber && barber ? ' · ' + nm(barber).split(' ')[0] : ''}
                  </div>
                </div>
                {a.paid && window.PaidChip ? <PaidChip paid={a.paid} lang={lang} /> : (svc && <Money v={svc.price} size={14} />)}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => onApprove(a.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#2E9D63,#1F8A5B)', color: '#fff', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 16px rgba(31,138,91,0.28)' }}><Icon name="check" size={17} color="#fff" stroke={2.4} />{he ? 'אשר' : 'Approve'}</button>
                <button onClick={() => setRejecting(a)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', borderRadius: 12, border: '1px solid rgba(176,65,58,0.3)', background: '#fff', color: '#B0413A', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}><Icon name="x" size={16} color="#B0413A" stroke={2.4} />{he ? 'דחה' : 'Decline'}</button>
              </div>
            </div>
          );
        })}
      </div>
      {rejecting && <RejectSheet lang={lang} accent={accent} serif={serif} appt={rejecting} onClose={() => setRejecting(null)} onSend={(id, msg) => { onReject(id, msg); setRejecting(null); }} />}
    </div>
  );
}

// ── Part 6 · Manager: choose which barbers' requests Rafi is alerted about ──
function NotifyControlsScreen({ lang, t, accent, serif, onBack, staff, notifyBarbers, toggleNotifyBarber }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const list = (staff || DATA.barbers);
  const onCount = list.filter(b => (notifyBarbers || {})[b.id] !== false).length;
  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל' : 'Admin'} title={he ? 'התראות בקשות תור' : 'Request alerts'} onBack={onBack}
        right={<span style={{ fontSize: 12.5, fontWeight: 700, color: accent, background: 'rgba(200,162,74,0.12)', padding: '5px 11px', borderRadius: 20 }}>{onCount}/{list.length}</span>} />
      <Body>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: 'rgba(200,162,74,0.1)', border: `1px solid ${accent}33`, borderRadius: 14, padding: '11px 13px' }}>
          <Icon name="bell" size={17} color={accent} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.7)', lineHeight: 1.5 }}>{he ? 'בחר על בקשות של אילו ספרים לקבל התראה מיידית, כך לא תוצף בכל בקשה של כל ספר. בקשות עדיין מחכות לספר עצמו לאישור.' : "Choose which barbers' requests alert you instantly, so you're not flooded. Requests still await each barber's own approval."}</div>
        </div>
        {list.map((b, k) => {
          const on = (notifyBarbers || {})[b.id] !== false;
          return (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 13, background: '#fff', borderRadius: 16, padding: '13px 14px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
              <span style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px rgba(200,162,74,0.85)' }}>
                <ImgSlot id={'staff-' + b.id} shape="circle" placeholder={nm(b).trim()[0]} style={{ width: 44, height: 44 }} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 15, color: '#0B1E3D', fontFamily: serif }}>{nm(b)}</span>
                  {b.owner && <span style={{ fontSize: 10.5, fontWeight: 700, color: accent }}>{he ? '· בעלים' : '· owner'}</span>}
                </div>
                <div style={{ fontSize: 11.5, color: on ? '#2E7D52' : 'rgba(11,30,61,0.45)', marginTop: 2, fontWeight: 600 }}>{on ? (he ? 'מקבל התראות' : 'Alerts on') : (he ? 'מושתק' : 'Muted')}</div>
              </div>
              <button onClick={() => toggleNotifyBarber(b.id)} title={on ? (he ? 'השתק' : 'Mute') : (he ? 'הפעל' : 'Enable')} style={{ width: 46, height: 28, borderRadius: 15, border: 'none', cursor: 'pointer', padding: 3, background: on ? accent : 'rgba(11,30,61,0.18)', display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start', flexShrink: 0, transition: 'all .2s' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} />
              </button>
            </div>
          );
        })}
      </Body>
    </Shell>
  );
}

// ── Part 3 · Real-time incoming-request banner (pops on any barber/manager screen) ──
function IncomingBanner({ lang, accent, serif, appt, isPending, readOnly, staff, onApprove, onReject, onDismiss }) {
  const he = lang === 'he';
  const svc = DATA.services.find(s => s.id === appt.svc);
  const name = (window.clientLabel ? window.clientLabel(appt, lang) : (he ? appt.clientHe : appt.clientEn));
  const barber = (staff || DATA.barbers).find(b => b.id === appt.barberId);
  return (
    <div style={{ position: 'absolute', top: 0, left: 10, right: 10, zIndex: 99, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto', width: '100%', maxWidth: 370, marginTop: 58, background: 'linear-gradient(140deg,#14305A,#0B1E3D)', borderRadius: 20, padding: '13px 15px', boxShadow: '0 18px 50px rgba(11,30,61,0.45)', border: '0.5px solid rgba(228,201,123,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="ttl-bell" style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="bell" size={21} color="#0B1E3D" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#E4C97B', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{isPending ? (he ? 'בקשת תור חדשה' : 'New request') : (he ? 'תור חדש נקבע' : 'New booking')}{appt.paid === 'prepaid' ? (he ? ' · שולם מראש!' : ' · Prepaid!') : appt.paid === 'punch' ? (he ? ' · כרטיסייה' : ' · Punch card') : ''}</div>
            <div style={{ color: '#FBF9F5', fontSize: 14, fontWeight: 600, marginTop: 1 }}>{name} · <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{appt.start}</span> · {svc ? svc[lang] : ''}</div>
          </div>
          {(!isPending || readOnly) && <button onClick={onDismiss} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'rgba(251,249,245,0.6)' }}><Icon name="x" size={17} /></button>}
        </div>
        {isPending && readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, padding: '8px 11px', borderRadius: 11, background: 'rgba(228,201,123,0.1)', border: '1px solid rgba(228,201,123,0.25)' }}>
            <Icon name="clock" size={14} color="#E4C97B" />
            <span style={{ fontSize: 12, color: 'rgba(251,249,245,0.8)', fontWeight: 600 }}>{he ? `לידיעה · האישור אצל ${barber ? barber.he.split(' ')[0] : 'הספר'}` : `FYI · approval is with ${barber ? barber.en.split(' ')[0] : 'the barber'}`}</span>
          </div>
        )}
        {isPending && !readOnly && (
          <div style={{ display: 'flex', gap: 8, marginTop: 11 }}>
            <button onClick={onApprove} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 11, border: 'none', background: 'linear-gradient(135deg,#2E9D63,#1F8A5B)', color: '#fff', font: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}><Icon name="check" size={16} color="#fff" stroke={2.4} />{he ? 'אשר' : 'Approve'}</button>
            <button onClick={onReject} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 11, border: '1px solid rgba(251,249,245,0.25)', background: 'rgba(251,249,245,0.08)', color: '#FBF9F5', font: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}><Icon name="x" size={15} color="#FBF9F5" stroke={2.4} />{he ? 'דחה' : 'Decline'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Client-side notification: barber approved / declined the request ──
function ClientAlertBanner({ lang, accent, serif, alert, staff, onClose }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  // marketing broadcast banner (no appointment attached)
  if (alert.type === 'marketing') {
    const optOut = () => { if (window.consentStore) window.consentStore.set('me', false); onClose && onClose(); };
    return (
      <div style={{ position: 'absolute', top: 0, left: 10, right: 10, zIndex: 99, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto', width: '100%', maxWidth: 370, marginTop: 58, background: 'linear-gradient(140deg,#14305A,#0B1E3D)', borderRadius: 20, padding: '14px 15px', boxShadow: '0 18px 50px rgba(11,30,61,0.45)', border: '0.5px solid rgba(228,201,123,0.45)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(228,201,123,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="spark" size={21} color="#E4C97B" /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 16, color: '#FBF9F5', lineHeight: 1.2 }}>{alert.title}</div>
              <div style={{ fontSize: 12.5, color: 'rgba(251,249,245,0.78)', marginTop: 3, lineHeight: 1.45 }}>{alert.body}</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'rgba(251,249,245,0.6)', flexShrink: 0 }}><Icon name="x" size={17} /></button>
          </div>
          {/* Round H0 · every marketing message carries a clear way to opt out */}
          <div style={{ marginTop: 10, paddingTop: 9, borderTop: '1px solid rgba(251,249,245,0.12)', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={optOut} style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 11.5, fontWeight: 600, color: 'rgba(228,201,123,0.9)', textDecoration: 'underline', textUnderlineOffset: 2, padding: '2px 0' }}>{he ? 'הסר אותי מרשימת התפוצה' : 'Unsubscribe from offers'}</button>
          </div>
        </div>
      </div>
    );
  }
  const ap = alert.appt;
  const approved = alert.type === 'approved';
  const barber = (staff || DATA.barbers).find(b => b.id === ap.barberId) || DATA.barbers[0];
  const svc = DATA.services.find(s => s.id === ap.svc);
  const pad = n => String(n).padStart(2, '0');
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })();
  const tom = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })();
  const dayLbl = ap.date === today ? (he ? 'היום' : 'today') : ap.date === tom ? (he ? 'מחר' : 'tomorrow') : new Date(ap.date + 'T00:00').toLocaleDateString(he ? 'he-IL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' });
  const c1 = approved ? '#E4C97B' : '#0B1E3D', c2 = approved ? '#C8A24A' : '#14305A';
  return (
    <div style={{ position: 'absolute', top: 0, left: 10, right: 10, zIndex: 99, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto', width: '100%', maxWidth: 370, marginTop: 58, background: `linear-gradient(140deg,${c1},${c2})`, borderRadius: 20, padding: '14px 15px', boxShadow: '0 18px 50px rgba(11,30,61,0.45)', border: approved ? '0.5px solid rgba(255,255,255,0.4)' : '0.5px solid rgba(228,201,123,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={approved ? 'succ-pop' : ''} style={{ width: 42, height: 42, borderRadius: 12, background: approved ? 'rgba(11,30,61,0.14)' : 'rgba(228,201,123,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={approved ? 'check' : 'bell'} size={22} color={approved ? '#0B1E3D' : '#E4C97B'} stroke={2.4} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 16, color: approved ? '#0B1E3D' : '#FBF9F5', lineHeight: 1.15 }}>{approved ? (he ? 'התור שלך אושר! ✓' : 'Your booking is confirmed! ✓') : (he ? 'הבקשה לא אושרה' : 'Request not approved')}</div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: approved ? 'rgba(11,30,61,0.7)' : 'rgba(251,249,245,0.75)', marginTop: 2, direction: he ? 'rtl' : 'ltr', textAlign: 'start' }}>
              {approved ? <span>{nm(barber)} · {dayLbl} · <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{ap.start}</span></span> : (alert.msg || (he ? 'לצערנו לא נוכל לקבוע תור בשעה זו, עמך הסליחה.' : "Sorry, we can't take this slot, our apologies."))}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: approved ? 'rgba(11,30,61,0.5)' : 'rgba(251,249,245,0.6)', flexShrink: 0 }}><Icon name="x" size={17} /></button>
        </div>
        {!approved && <div style={{ fontSize: 12, color: 'rgba(251,249,245,0.7)', marginTop: 9, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="refresh" size={14} color="#E4C97B" />{he ? 'בחרו מועד חלופי ב״התורים שלי״.' : 'Pick another time in “My visits”.'}</div>}
      </div>
    </div>
  );
}

// ── Team-side broadcast banner (manager → all barbers) ──
function StaffBanner({ lang, accent, serif, alert, onClose }) {
  const he = lang === 'he';
  return (
    <div style={{ position: 'absolute', top: 0, left: 10, right: 10, zIndex: 99, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto', width: '100%', maxWidth: 370, marginTop: 58, background: 'linear-gradient(140deg,#14305A,#0B1E3D)', borderRadius: 20, padding: '14px 15px', boxShadow: '0 18px 50px rgba(11,30,61,0.45)', border: '0.5px solid rgba(228,201,123,0.45)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(228,201,123,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="megaphone" size={21} color="#E4C97B" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#E4C97B', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{he ? 'הודעת צוות' : 'Team message'}</div>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 15.5, color: '#FBF9F5', lineHeight: 1.2, marginTop: 1 }}>{alert.title}</div>
            <div style={{ fontSize: 12.5, color: 'rgba(251,249,245,0.78)', marginTop: 3, lineHeight: 1.45 }}>{alert.body}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'rgba(251,249,245,0.6)', flexShrink: 0 }}><Icon name="x" size={17} /></button>
        </div>
      </div>
    </div>
  );
}

// ── Auto-distribute helper (Round B): the earliest fair replacement for ONE appointment.
// Picks an active barber (≠ the absent one) who offers the service and is free at the exact
// same slot; ties broken by who's least loaded that day. Returns a barberId or null.
function _autoAssignTarget(appt, absentId, staff, appts) {
  const svc = (window.DATA.services || []).find(s => s.id === appt.svc) || {};
  const dur = svc.min || 45;
  const startMin = window.availHelpers.toMin(appt.start);
  const cands = (staff || []).filter(b => b.id !== absentId && b.active !== false)
    .filter(b => !b.services || !svc.id || b.services.indexOf(svc.id) > -1)
    .filter(b => window.availHelpers.slotFree(b, appt.date, startMin, dur, appts, appt.id));
  if (!cands.length) return null;
  const load = b => (appts || []).filter(a => a.barberId === b.id && a.date === appt.date && a.status !== 'cancelled' && a.status !== 'rejected').length;
  cands.sort((x, y) => load(x) - load(y));
  return cands[0].id;
}

// ── A barber is away for a period: resolve EACH calendar appointment on its own ──
// This sheet lists every booking in the absent barber's CALENDAR (not "his clients" - that's
// the separate CRM link). For each one Rafi decides: auto-distribute by availability, move to a
// specific barber, or cancel & notify. The decision is per single appointment.
function DisableBarberSheet({ lang, accent, serif, barber, appts, staff, onClose, onResolve }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const pad = n => String(n).padStart(2, '0');
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })();
  const future = (appts || []).filter(a => a.barberId === barber.id && a.date >= today && a.status !== 'done' && a.status !== 'no' && a.status !== 'rejected' && a.status !== 'cancelled').sort((x, y) => (x.date + x.start).localeCompare(y.date + y.start));
  const others = (staff || DATA.barbers).filter(b => b.id !== barber.id && b.active !== false);
  const lbl = a => { const svc = DATA.services.find(s => s.id === a.svc); const cn = window.clientLabel ? window.clientLabel(a, lang) : nm({ he: a.clientHe, en: a.clientEn }); return { cn, svc }; };
  // suggested auto target per appointment (memoised on the appointment set)
  const autoMap = React.useMemo(() => {
    const m = {};
    future.forEach(a => { m[a.id] = _autoAssignTarget(a, barber.id, staff || DATA.barbers, appts); });
    return m;
  }, [future.map(a => a.id).join(','), (appts || []).length]);
  // decision per appointment: { mode: 'auto'|'move'|'cancel', to: barberId }
  const [dec, setDec] = useAP(() => { const d = {}; future.forEach(a => { d[a.id] = { mode: 'auto', to: autoMap[a.id] || null }; }); return d; });
  const setMode = (id, mode) => setDec(p => ({ ...p, [id]: { mode, to: mode === 'auto' ? (autoMap[id] || null) : mode === 'move' ? ((p[id] && p[id].to) || (others[0] && others[0].id) || null) : null } }));
  const setMoveTo = (id, to) => setDec(p => ({ ...p, [id]: { mode: 'move', to } }));
  const bulk = (mode) => setDec(() => { const d = {}; future.forEach(a => { d[a.id] = { mode, to: mode === 'auto' ? (autoMap[a.id] || null) : mode === 'move' ? (others[0] && others[0].id) : null }; }); return d; });
  // an auto row with no free barber is unresolved → must move or cancel before applying
  const unresolved = future.filter(a => dec[a.id] && dec[a.id].mode === 'auto' && !autoMap[a.id]);
  const moveN = future.filter(a => { const d = dec[a.id]; return d && ((d.mode === 'auto' && autoMap[a.id]) || (d.mode === 'move' && d.to)); }).length;
  const cancelN = future.filter(a => dec[a.id] && dec[a.id].mode === 'cancel').length;
  const canApply = future.length > 0 && unresolved.length === 0;
  const apply = () => {
    const resolutions = future.map(a => {
      const d = dec[a.id] || { mode: 'cancel' };
      if (d.mode === 'cancel') return { id: a.id, mode: 'cancel' };
      const to = d.mode === 'auto' ? autoMap[a.id] : d.to;
      return to ? { id: a.id, mode: 'move', to } : { id: a.id, mode: 'cancel' };
    });
    onResolve(resolutions);
  };
  const segBtn = (active, onClick, icon, label, color) => (
    <button onClick={onClick} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 4px', borderRadius: 9, border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 11.5, fontWeight: 700, background: active ? (color || accent) : 'transparent', color: active ? (color === '#B0413A' ? '#fff' : '#0B1E3D') : 'rgba(11,30,61,0.55)', transition: 'all .15s' }}>
      <Icon name={icon} size={13} color={active ? (color === '#B0413A' ? '#fff' : '#0B1E3D') : 'rgba(11,30,61,0.45)'} />{label}
    </button>
  );
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 98, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '94%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        <div style={{ padding: '10px 20px 4px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(176,65,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="bell" size={22} color="#B0413A" /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 19, color: '#0B1E3D', lineHeight: 1.1 }}>{he ? `${nm(barber)} נעדר` : `${nm(barber)} is away`}</div>
              <div style={{ fontSize: 12.5, color: '#B0413A', fontWeight: 600, marginTop: 2 }}>{he ? `${future.length} תורים ביומן · החליטו לכל אחד` : `${future.length} bookings in the calendar · decide each`}</div>
            </div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={17} color="#0B1E3D" /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 6px', display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.6)', lineHeight: 1.5, marginInlineStart: 2 }}>{he ? 'אלה התורים שביומן של הספר - לא "הלקוחות שלו". לכל תור בנפרד: פזרו אוטומטית לפי זמינות, העבירו לספר מסוים, או בטלו והודיעו ללקוח.' : "These are the bookings in the barber's calendar, not 'his clients'. For each one: auto-distribute by availability, move to a specific barber, or cancel & notify." }</div>
          {future.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', background: 'rgba(11,30,61,0.04)', borderRadius: 12, padding: '8px 10px' }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(11,30,61,0.5)' }}>{he ? 'החל על הכל:' : 'Apply to all:'}</span>
              <button onClick={() => bulk('auto')} style={{ font: 'inherit', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', padding: '5px 11px', borderRadius: 16, border: `1px solid ${accent}55`, background: '#fff', color: '#0B1E3D' }}>{he ? 'פיזור אוטומטי' : 'Auto'}</button>
              <button onClick={() => bulk('cancel')} style={{ font: 'inherit', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', padding: '5px 11px', borderRadius: 16, border: '1px solid rgba(176,65,58,0.35)', background: '#fff', color: '#B0413A' }}>{he ? 'ביטול הכל' : 'Cancel all'}</button>
            </div>
          )}
          {future.length === 0 && <div style={{ textAlign: 'center', padding: '22px', fontSize: 13.5, color: 'rgba(11,30,61,0.5)' }}>{he ? 'אין תורים עתידיים - אפשר להשבית בלי לפגוע באף לקוח.' : 'No upcoming bookings - safe to disable.'}</div>}
          {future.map(a => {
            const { cn, svc } = lbl(a);
            const d = dec[a.id] || { mode: 'auto' };
            const when = a.date === today ? (he ? 'היום' : 'today') : new Date(a.date + 'T00:00').toLocaleDateString(he ? 'he-IL' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });
            const autoTo = autoMap[a.id];
            const autoBarber = autoTo && others.find(b => b.id === autoTo);
            return (
              <div key={a.id} style={{ background: '#fff', borderRadius: 14, padding: '11px 13px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)', border: d.mode === 'cancel' ? '1px solid rgba(176,65,58,0.25)' : '1px solid rgba(11,30,61,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
                  <span style={{ flex: 1, fontSize: 13.5, color: '#0B1E3D', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cn}</span>
                  <span style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)' }}>{when} · <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{a.start}</span>{svc ? ' · ' + nm(svc) : ''}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, background: 'rgba(11,30,61,0.05)', padding: 3, borderRadius: 11 }}>
                  {segBtn(d.mode === 'auto', () => setMode(a.id, 'auto'), 'refresh', he ? 'פיזור' : 'Auto')}
                  {segBtn(d.mode === 'move', () => setMode(a.id, 'move'), 'arrowL', he ? 'העבר' : 'Move')}
                  {segBtn(d.mode === 'cancel', () => setMode(a.id, 'cancel'), 'x', he ? 'בטל' : 'Cancel', '#B0413A')}
                </div>
                {d.mode === 'auto' && (
                  <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, color: autoBarber ? '#2E7D52' : '#B0413A' }}>
                    {autoBarber ? <><Icon name="check" size={13} color="#2E7D52" />{he ? `יועבר אוטומטית ל${nm(autoBarber)} · אותה שעה` : `Auto → ${nm(autoBarber)} · same time`}</> : <><Icon name="bell" size={13} color="#B0413A" />{he ? 'אין ספר פנוי בשעה זו - בחרו «העבר» או «בטל»' : 'No barber free at this time - pick Move or Cancel'}</>}
                  </div>
                )}
                {d.mode === 'move' && (
                  <div style={{ marginTop: 9, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {others.map(b => {
                      const on = d.to === b.id;
                      const svcId = a.svc; const dur = (DATA.services.find(s => s.id === svcId) || {}).min || 45;
                      const freeNow = window.availHelpers.slotFree(b, a.date, window.availHelpers.toMin(a.start), dur, appts, a.id);
                      return <button key={b.id} onClick={() => setMoveTo(a.id, b.id)} style={{ font: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '6px 11px', borderRadius: 16, border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.14)'}`, background: on ? accent : '#fff', color: '#0B1E3D', display: 'inline-flex', alignItems: 'center', gap: 5 }}>{nm(b)}{!freeNow && <span title={he ? 'תפוס בשעה זו' : 'busy then'} style={{ width: 6, height: 6, borderRadius: 3, background: '#D9774C' }} />}</button>;
                    })}
                  </div>
                )}
                {d.mode === 'cancel' && <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: '#B0413A', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="bell" size={13} color="#B0413A" />{he ? 'התור יבוטל והלקוח יקבל הודעה' : 'Booking cancelled, client notified'}</div>}
              </div>
            );
          })}
        </div>
        <div style={{ flexShrink: 0, padding: '10px 20px calc(16px + env(safe-area-inset-bottom))', borderTop: '1px solid rgba(11,30,61,0.06)', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {unresolved.length > 0 && <div style={{ fontSize: 11.5, fontWeight: 700, color: '#B0413A', textAlign: 'center' }}>{he ? `${unresolved.length} תורים ללא ספר פנוי - בחרו «העבר» או «בטל»` : `${unresolved.length} need a Move/Cancel choice`}</div>}
          <Btn kind="gold" icon="check" disabled={!canApply} onClick={apply}>{future.length === 0 ? (he ? 'השבת ספר' : 'Disable barber') : (he ? `החל · ${moveN} הועברו${cancelN ? ` · ${cancelN} בוטלו` : ''}` : `Apply · ${moveN} moved${cancelN ? ` · ${cancelN} cancelled` : ''}`)}</Btn>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(11,30,61,0.55)', font: 'inherit', fontSize: 14, fontWeight: 600, padding: 6, cursor: 'pointer' }}>{he ? 'חזרה' : 'Back'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Round 13 · Manager awareness panel: ALL open requests in the system, read-only ──
// תמונת מצב לרפי, ללא אשר/דחה: האישור שייך לספר של התור בלבד.
// Shows pending / awaiting-declaration requests from every barber, plus auto-confirmed
// bookings for today-tomorrow (a barber on auto-confirm has nothing to approve, the
// booking simply appears here as confirmed).
function SystemRequestsPanel({ lang, accent, serif, appts, staff }) {
  const he = lang === 'he';
  // Round 14: collapsed by default, this is Rafi's awareness-only area, so the dashboard
  // stays reachable even when many requests pile up. The count badge is always visible.
  const [open, setOpen] = React.useState(false);
  const nm = o => o[lang];
  const list = staff || DATA.barbers;
  const pad = n => String(n).padStart(2, '0');
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })();
  const tom = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })();
  const rows = (appts || []).filter(a =>
    (a.status === 'pending' && a.date >= today) ||
    (a.status === 'awaiting-declaration' && a.date >= today) ||
    (a.status === 'confirmed' && (a.date === today || a.date === tom))
  ).sort((x, y) => {
    const w = s => s === 'pending' ? 0 : s === 'awaiting-declaration' ? 1 : 2;
    return w(x.status) - w(y.status) || (x.date + x.start).localeCompare(y.date + y.start);
  });
  if (rows.length === 0) return null;
  const chip = (a) => a.status === 'pending'
    ? { c: '#9C7B2E', bg: 'rgba(200,162,74,0.16)', l: he ? 'ממתין לאישור' : 'Awaiting approval' }
    : a.status === 'awaiting-declaration'
    ? { c: '#9C7B2E', bg: 'rgba(200,162,74,0.12)', l: he ? 'ממתין להצהרה' : 'Awaiting declaration' }
    : { c: '#2E7D52', bg: 'rgba(46,125,82,0.1)', l: he ? 'מאושר' : 'Confirmed' };
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: open ? '14px 15px 6px' : '14px 15px', boxShadow: '0 6px 20px rgba(11,30,61,0.07)' }}>
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: 0, marginBottom: open ? 4 : 0, border: 'none', background: 'none', font: 'inherit', textAlign: 'start', cursor: 'pointer' }}>
        <span style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(11,30,61,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="users" size={18} color="#0B1E3D" /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: serif, fontWeight: 700, fontSize: 16, color: '#0B1E3D' }}>{he ? 'בקשות תור במערכת' : 'Requests in the system'}</span>
          <span style={{ display: 'block', fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{he ? 'לידיעה בלבד · כל ספר מאשר את התורים שלו' : 'Awareness only · each barber approves his own'}</span>
        </span>
        <span style={{ minWidth: 24, height: 24, padding: '0 7px', borderRadius: 12, background: 'rgba(11,30,61,0.07)', color: '#0B1E3D', fontWeight: 800, fontSize: 12.5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{rows.length}</span>
        <span style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .2s' }}><Icon name={he ? 'chevron' : 'chevronR'} size={15} color="rgba(11,30,61,0.55)" /></span>
      </button>
      {open && rows.map((a, k) => {
        const svc = DATA.services.find(s => s.id === a.svc);
        const barber = list.find(b => b.id === a.barberId);
        const name = window.clientLabel ? window.clientLabel(a, lang) : nm({ he: a.clientHe, en: a.clientEn });
        const ch = chip(a);
        return (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid rgba(11,30,61,0.06)' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(140deg,#13325c,#1d4a86)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FBF9F5', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{name.trim()[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0B1E3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
              <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.55)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {barber ? nm(barber).split(' ')[0] : ''} · {_whenLbl(a.date, a.start, he)} · <span style={{ direction: 'ltr', unicodeBidi: 'isolate', fontWeight: 700, color: '#0B1E3D' }}>{a.start}</span>{svc ? ' · ' + nm(svc) : ''}
              </div>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: ch.c, background: ch.bg, padding: '4px 9px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0 }}>{ch.l}</span>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { PendingList, RejectSheet, pendingFor, SystemRequestsPanel, NotifyControlsScreen, IncomingBanner, ClientAlertBanner, StaffBanner, DisableBarberSheet });
