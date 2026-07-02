// customer.jsx, customer app shell: home, appointments (cancel→fade→undo), profile
// Exports: CustomerApp

const { useState: useStateC, useRef: useRefC, useEffect: useEffectC } = React;

function TabBar({ tab, setTab, t, accent }) {
  const tabs = [
    { id: 'home', icon: 'home', label: t.home },
    { id: 'shop', icon: 'bag', label: t.shop },
    { id: 'appts', icon: 'calendar', label: t.appts },
    { id: 'profile', icon: 'user', label: t.profile },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40,
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '10px 24px calc(20px + env(safe-area-inset-bottom))',
      background: 'rgba(251,249,245,0.86)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
      borderTop: '0.5px solid rgba(11,30,61,0.08)',
    }}>
      {tabs.map(x => {
        const on = tab === x.id;
        return (
          <button key={x.id} onClick={() => setTab(x.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 10px', font: 'inherit' }}>
            <Icon name={x.icon} size={23} color={on ? accent : 'rgba(11,30,61,0.4)'} stroke={on ? 2 : 1.7} />
            <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 500, color: on ? '#0B1E3D' : 'rgba(11,30,61,0.45)' }}>{x.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function HomeScreen({ lang, t, accent, serif, products, onBook, onNav, onVisits, onContact, onShop, onBell, promo, consentInvite }) {
  const nm = o => o[lang];
  const branch = DATA.branch;
  const tiles = [
    { id: 'nav', icon: 'navigate', label: t.hubNav, onClick: onNav },
    { id: 'visits', icon: 'calendar', label: t.hubVisits, onClick: onVisits },
    { id: 'contact', icon: 'whatsapp', label: t.hubContact, onClick: onContact },
    { id: 'shop', icon: 'bag', label: t.hubShop, onClick: onShop },
  ];
  return (
    <div style={{ padding: '52px 18px 120px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* big business cover */}
      <div style={{ position: 'relative', background: '#fff', borderRadius: 24, border: '1px solid rgba(200,162,74,0.4)', boxShadow: '0 8px 26px rgba(11,30,61,0.08)', padding: '20px 18px 15px', overflow: 'hidden' }}>
        <button onClick={onBell} style={{ position: 'absolute', top: 12, insetInlineEnd: 12, width: 38, height: 38, borderRadius: 11, border: '1px solid rgba(11,30,61,0.08)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
          <Icon name="bell" size={19} color="#0B1E3D" />
          <span style={{ position: 'absolute', top: 8, insetInlineEnd: 8, width: 7, height: 7, borderRadius: 4, background: accent, border: '1.5px solid #fff' }} />
        </button>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 2px' }}>
          <img src={(window._asset || (p => p))('assets/logo-wide.jpg')} alt="מספרפי" style={{ width: '100%', maxWidth: 300, objectFit: 'contain', mixBlendMode: 'multiply' }} />
        </div>
        <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(200,162,74,0.55),transparent)', margin: '10px 0 11px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, flexWrap: 'wrap' }}>
          <Icon name="pin" size={15} color={accent} />
          <span style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.7)', fontWeight: 600 }}>{lang === 'he' ? branch.addrHe : branch.addrEn}</span>
          <span style={{ color: 'rgba(11,30,61,0.25)' }}>·</span>
          <span style={{ fontSize: 12.5, color: '#2E7D52', fontWeight: 700 }}>{lang === 'he' ? branch.openHe : branch.openEn}</span>
        </div>
      </div>

      {/* primary CTA, gentle gold glint every 3s, inviting a tap */}
      <div className="cta-glintwrap">
        <Btn kind="gold" icon="scissors" onClick={onBook}>{t.hubBook}</Btn>
        <span className="cta-glint" />
      </div>

      {/* Round H0: one-time soft invitation to opt-in to marketing, after the first visit */}
      {consentInvite}

      {/* Round 10: punch-card promo / live balance */}
      {promo}

      {/* action tiles */}
      <div>
        <SectionHeading lang={lang} serif={serif} accent={accent}>{t.what}</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
          {tiles.map(x => (
            <button key={x.id} onClick={x.onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, background: '#fff', border: '1px solid rgba(11,30,61,0.06)', borderRadius: 18, padding: '16px 15px', cursor: 'pointer', font: 'inherit', boxShadow: '0 2px 8px rgba(11,30,61,0.04)', textAlign: 'start' }}>
              <span style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,rgba(228,201,123,0.22),rgba(200,162,74,0.16))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={x.icon} size={22} color={accent} /></span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#0B1E3D' }}>{x.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionH({ children, action, accent, serif, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 18, color: '#0B1E3D' }}>{children}</span>
      {action && <span onClick={onAction} style={{ fontSize: 13, fontWeight: 600, color: accent, cursor: 'pointer' }}>{action}</span>}
    </div>
  );
}

// ── Appointments with cancel → fade → undo ──
function ApptCard({ ap, lang, t, accent, serif, onRequestCancel, onConfirmCancel, onAbortCancel, confirming, onReschedule, onLeaveAlert, onFillDeclaration, status, rejectMsg, inCart }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const svc = DATA.services.find(s => s.id === ap.svc) || ap.service;
  const barber = ap.barber || DATA.barbers[0];
  const pending = status === 'pending', rejected = status === 'rejected', awaiting = status === 'awaiting-declaration';
  const pill = awaiting
    ? { c: '#9C7B2E', bg: 'rgba(200,162,74,0.16)', icon: 'file', label: he ? 'ממתין למילוי הצהרת בריאות' : 'Health declaration needed' }
    : pending
    ? { c: '#9C7B2E', bg: 'rgba(200,162,74,0.16)', icon: 'clock', label: he ? 'ממתין לאישור הספר' : 'Awaiting barber approval' }
    : rejected
    ? { c: '#B0413A', bg: 'rgba(176,65,58,0.1)', icon: 'x', label: he ? 'הבקשה נדחתה' : 'Request declined' }
    : { c: '#2E7D52', bg: 'rgba(46,125,82,0.1)', icon: 'check', label: he ? 'מאושר' : 'Confirmed' };
  return (
    <div className={ap.fading ? 'card-fade' : ''} style={{ background: '#fff', borderRadius: 22, padding: 16, boxShadow: '0 4px 18px rgba(11,30,61,0.06)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', insetInlineStart: 0, top: 0, bottom: 0, width: 4, background: (pending || awaiting) ? 'linear-gradient(#E4C97B,#9C7B2E)' : rejected ? 'linear-gradient(#C96F66,#B0413A)' : `linear-gradient(${accent},#9C7B2E)` }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: pill.bg, padding: '4px 10px', borderRadius: 20 }}>
          <Icon name={pill.icon} size={13} color={pill.c} stroke={2.2} /><span style={{ fontSize: 11.5, fontWeight: 700, color: pill.c }}>{pill.label}</span>
        </div>
        {inCart && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(11,30,61,0.06)', padding: '4px 10px', borderRadius: 20 }}>
            <Icon name="users" size={12} color="rgba(11,30,61,0.55)" /><span style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(11,30,61,0.6)' }}>{he ? 'חלק מהזמנה מרובה' : 'Part of a group booking'}</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div style={{ textAlign: 'center', minWidth: 52 }}>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: '#0B1E3D', direction: 'ltr' }}>{ap.slot ? ap.slot.slice(1) : ap.time}</div>
          <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.45)', fontWeight: 600 }}>{ap.day || t.tomorrow}</div>
        </div>
        <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(11,30,61,0.08)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15.5, color: '#0B1E3D' }}>{nm(svc)}</div>
          <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.55)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar b={barber} size={20} ring={false} lang={lang} />{nm(barber)}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
          {ap.paid === 'punch' && window.PaidChip ? <PaidChip paid="punch" lang={lang} /> : <Money v={svc.price} size={15} />}
          {ap.paid === 'prepaid' && window.PaidChip && <PaidChip paid="prepaid" lang={lang} />}
        </div>
      </div>
      {onLeaveAlert && !pending && !rejected && !awaiting && (
        <button onClick={onLeaveAlert} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', marginTop: 13, padding: '11px 13px', borderRadius: 13, border: `1px solid ${accent}55`, background: `linear-gradient(135deg, ${accent}1f, ${accent}10)`, cursor: 'pointer', font: 'inherit', textAlign: 'start' }}>
          <span className="ttl-bell" style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="clock" size={17} color="#0B1E3D" /></span>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#0B1E3D' }}>{lang === 'he' ? 'זמן לצאת, בדקו מתי לצאת' : 'Time to leave, check your route'}</span>
          <Icon name={lang === 'he' ? 'chevron' : 'chevronR'} size={16} color={accent} />
        </button>
      )}
      {confirming ? (
        <div style={{ marginTop: 13, padding: '13px 14px', borderRadius: 14, background: 'rgba(176,58,58,0.05)', border: '1px solid rgba(176,58,58,0.22)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 11 }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(176,58,58,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="bell" size={17} color="#B03A3A" /></span>
            <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: '#0B1E3D', lineHeight: 1.4 }}>{(pending || awaiting) ? (he ? 'לבטל את בקשת התור?' : 'Cancel this request?') : (he ? 'האם אתה בטוח שברצונך לבטל את התור?' : 'Are you sure you want to cancel this appointment?')}</span>
          </div>
          {inCart && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(11,30,61,0.04)', border: '1px solid rgba(11,30,61,0.1)', borderRadius: 11, padding: '9px 11px', marginBottom: 11 }}>
              <Icon name="users" size={15} color="rgba(11,30,61,0.55)" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.7)', lineHeight: 1.5 }}>{he ? 'תור זה מבוטל, שאר התורים בהזמנה נשמרים.' : 'Only this appointment is cancelled, the rest of the booking stays.'}</span>
            </div>
          )}
          {ap.paid === 'prepaid' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(46,125,82,0.08)', border: '1px solid rgba(46,125,82,0.28)', borderRadius: 11, padding: '10px 12px', marginBottom: 11 }}>
              <Icon name="coin" size={15} color="#2E7D52" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.72)', lineHeight: 1.5 }}>{he ? 'ביטול לא מחזיר את התשלום אוטומטית. החזר מלא יטופל ידנית ע\"י המספרה (ביט / פייבוקס) - בדימוי זה: "החזר יטופל בפיתוח".' : 'Cancelling doesn\'t auto-refund. The shop will process your full refund manually (Bit / PayBox) - prototype note: \"refund handled in development\".'}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onConfirmCancel(ap.id)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: '#B03A3A', color: '#fff', font: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>{he ? 'כן, בטל' : 'Yes, cancel'}</button>
            <button onClick={onAbortCancel} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid rgba(11,30,61,0.14)', background: '#fff', color: '#0B1E3D', font: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>{he ? 'חזרה' : 'Back'}</button>
          </div>
        </div>
      ) : awaiting ? (
        <div style={{ marginTop: 13 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(200,162,74,0.08)', border: `1px solid ${accent}44`, borderRadius: 12, padding: '10px 12px', marginBottom: 11 }}>
            <Icon name="file" size={15} color="#9C7B2E" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.7)', lineHeight: 1.5 }}>{he ? 'התור יישמר רק לאחר מילוי הצהרת הבריאות. מילוי חד-פעמי, לפני טיפול הלייזר הראשון.' : 'The booking holds only until you complete the health declaration, a one-time form before your first laser treatment.'}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onFillDeclaration && onFillDeclaration(ap)} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', color: '#0B1E3D', font: 'inherit', fontSize: 13.5, fontWeight: 800, cursor: 'pointer' }}><Icon name="file" size={16} color="#0B1E3D" />{he ? 'מילוי הצהרת בריאות' : 'Fill the declaration'}</button>
            <button onClick={() => onRequestCancel(ap.id)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid rgba(11,30,61,0.12)', background: '#fff', font: 'inherit', fontSize: 13.5, fontWeight: 600, color: 'rgba(11,30,61,0.6)', cursor: 'pointer' }}>{he ? 'ביטול' : 'Cancel'}</button>
          </div>
        </div>
      ) : rejected ? (
        <div style={{ marginTop: 13 }}>
          {rejectMsg ? <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.7)', lineHeight: 1.5, background: 'rgba(176,65,58,0.05)', border: '1px solid rgba(176,65,58,0.18)', borderRadius: 12, padding: '11px 13px', marginBottom: 11 }}>{rejectMsg}</div> : null}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onReschedule(ap)} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', color: '#0B1E3D', font: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}><Icon name="calendar" size={16} color="#0B1E3D" />{he ? 'בחירת מועד אחר' : 'Pick another time'}</button>
            <button onClick={() => onRequestCancel(ap.id)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid rgba(11,30,61,0.12)', background: '#fff', font: 'inherit', fontSize: 13.5, fontWeight: 600, color: 'rgba(11,30,61,0.6)', cursor: 'pointer' }}>{he ? 'הסר' : 'Dismiss'}</button>
          </div>
        </div>
      ) : pending ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={() => onRequestCancel(ap.id)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid rgba(176,58,58,0.2)', background: 'rgba(176,58,58,0.04)', font: 'inherit', fontSize: 13.5, fontWeight: 600, color: '#B03A3A', cursor: 'pointer' }}>{he ? 'ביטול הבקשה' : 'Cancel request'}</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={() => onReschedule(ap)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid rgba(11,30,61,0.12)', background: '#fff', font: 'inherit', fontSize: 13.5, fontWeight: 600, color: '#0B1E3D', cursor: 'pointer' }}>{t.reschedule}</button>
          <button onClick={() => onRequestCancel(ap.id)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid rgba(176,58,58,0.2)', background: 'rgba(176,58,58,0.04)', font: 'inherit', fontSize: 13.5, fontWeight: 600, color: '#B03A3A', cursor: 'pointer' }}>{t.cancel}</button>
        </div>
      )}
    </div>
  );
}

function ApptsScreen({ lang, t, accent, serif, appts, onRequestCancel, onConfirmCancel, onAbortCancel, confirmCancel, onReschedule, onLeaveAlert, onFillDeclaration }) {
  const firstConfirmed = appts.find(a => a.status === 'confirmed' || a.status === 'now' || !a.status);
  // Round D2: how many live appointments share each cartId (a multi-booking). >1 means
  // cancelling one still leaves siblings standing - surfaced as reassurance at cancel time.
  const cartCounts = {};
  appts.forEach(a => { if (a.cartId) cartCounts[a.cartId] = (cartCounts[a.cartId] || 0) + 1; });
  return (
    <div style={{ padding: '54px 18px 120px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontFamily: displayFont(lang, serif), fontSize: lang === 'he' ? 30 : 27, fontWeight: 700, color: '#0B1E3D', marginBottom: 4 }}>{t.appts}</div>
      <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: 0.8, color: 'rgba(11,30,61,0.4)', textTransform: 'uppercase' }}>{t.upcoming}</div>
      {appts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'rgba(11,30,61,0.4)' }}>
          <Icon name="calendar" size={40} color="rgba(11,30,61,0.2)" /><div style={{ marginTop: 12, fontSize: 14.5 }}>{t.noAppts}</div>
        </div>
      )}
      {appts.map((ap) => (
        <ApptCard key={ap.id} ap={ap} lang={lang} t={t} accent={accent} serif={serif}
          status={ap.status} rejectMsg={ap.rejectMsg}
          inCart={!!(ap.cartId && cartCounts[ap.cartId] > 1)}
          onRequestCancel={onRequestCancel} onConfirmCancel={onConfirmCancel} onAbortCancel={onAbortCancel}
          confirming={confirmCancel === ap.id} onReschedule={onReschedule}
          onLeaveAlert={firstConfirmed && ap.id === firstConfirmed.id ? onLeaveAlert : null} onFillDeclaration={onFillDeclaration} />
      ))}
    </div>
  );
}

// ── Round H0 · one-time soft invitation to opt-in to marketing, after the first visit.
// Gentle, non-blocking. If ignored (dismissed) it never returns. Consent itself lives in
// consentStore; this just nudges. Shown only when: has visited, not opted-in, not dismissed.
const CONSENT_INVITE_KEY = 'royale_consent_invited_v1';
function ConsentInvite({ lang, accent, serif, hasVisited, updateSession }) {
  const he = lang === 'he';
  const [gone, setGone] = useStateC(() => { try { return !!localStorage.getItem(CONSENT_INVITE_KEY); } catch (e) { return false; } });
  const consented = window.consentStore ? window.consentStore.hasFor('me') : false;
  if (gone || consented || !hasVisited) return null;
  const close = () => { try { localStorage.setItem(CONSENT_INVITE_KEY, '1'); } catch (e) {} setGone(true); };
  const accept = () => { if (window.consentStore) window.consentStore.set('me', true); updateSession && updateSession({ marketingOptIn: true }); close(); };
  return (
    <div style={{ position: 'relative', background: 'linear-gradient(140deg,#14305A,#0B1E3D)', borderRadius: 20, padding: '15px 16px', boxShadow: '0 10px 28px rgba(11,30,61,0.18)', border: '0.5px solid rgba(228,201,123,0.4)' }}>
      <button onClick={close} aria-label={he ? 'סגור' : 'Dismiss'} style={{ position: 'absolute', top: 10, insetInlineEnd: 10, background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'rgba(251,249,245,0.55)' }}><Icon name="x" size={16} /></button>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(228,201,123,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="spark" size={21} color="#E4C97B" /></span>
        <div style={{ flex: 1, minWidth: 0, paddingInlineEnd: 14 }}>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 16, color: '#FBF9F5', lineHeight: 1.25 }}>{he ? 'רוצה לקבל עדכונים על מבצעים?' : 'Want updates on offers?'}</div>
          <div style={{ fontSize: 12.5, color: 'rgba(251,249,245,0.78)', marginTop: 4, lineHeight: 1.5 }}>{he ? 'נשלח לך מדי פעם מבצעים והטבות. אפשר לאשר כאן - ולבטל בכל רגע.' : 'We’ll occasionally share offers and perks. Opt in here - and stop anytime.'}</div>
          <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
            <button onClick={accept} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 13.5, fontWeight: 700, background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', color: '#0B1E3D', boxShadow: '0 6px 16px rgba(200,162,74,0.3)' }}>{he ? 'אני מאשר' : 'Yes, opt me in'}</button>
            <button onClick={close} style={{ padding: '11px 16px', borderRadius: 12, border: '1px solid rgba(251,249,245,0.25)', cursor: 'pointer', font: 'inherit', fontSize: 13.5, fontWeight: 700, background: 'transparent', color: 'rgba(251,249,245,0.85)' }}>{he ? 'לא תודה' : 'No thanks'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── shared bottom-sheet for profile sub-screens ──
function ProfSheet({ title, accent, serif, onClose, children, footer }) {
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 84, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '90%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        <div style={{ padding: '10px 20px 4px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D' }}>{title}</div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="x" size={17} color="#0B1E3D" /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 16px', display: 'flex', flexDirection: 'column', gap: 13 }}>{children}</div>
        {footer && <div style={{ flexShrink: 0, padding: '12px 20px calc(18px + env(safe-area-inset-bottom))', borderTop: '1px solid rgba(11,30,61,0.06)' }}>{footer}</div>}
      </div>
    </div>
  );
}

function PersonalDetailsSheet({ lang, accent, serif, session, updateSession, onClose }) {
  const he = lang === 'he';
  const [name, setName] = useStateC((session && session.name) || (he ? 'דניאל אבני' : 'Daniel Avni'));
  const [email, setEmail] = useStateC((session && session.email) || '');
  const emailOk = !email.trim() || /^\S+@\S+\.\S+$/.test(email.trim());
  const dispPhone = session && session.phone ? session.phone.replace(/^0/, '').replace(/(\d{2})(\d{3})(\d+)/, '0$1-$2-$3') : '050-000-0000';
  const inp = { width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 15, color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.12)', borderRadius: 12, padding: '12px 13px', outline: 'none', direction: he ? 'rtl' : 'ltr', textAlign: 'start' };
  const lbl = { fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 7, marginInlineStart: 2 };
  return (
    <ProfSheet title={he ? 'פרטים אישיים' : 'Personal details'} accent={accent} serif={serif} onClose={onClose}
      footer={<Btn kind="gold" icon="check" disabled={!name.trim() || !emailOk} onClick={() => { updateSession({ name: name.trim(), email: email.trim() }); onClose(); }}>{he ? 'שמירה' : 'Save'}</Btn>}>
      <div><div style={lbl}>{he ? 'שם מלא' : 'Full name'}</div><input value={name} onChange={e => setName(e.target.value)} style={inp} /></div>
      <div><div style={lbl}>{he ? 'אימייל' : 'Email'}</div><input value={email} onChange={e => setEmail(e.target.value)} inputMode="email" placeholder="name@email.com" style={{ ...inp, direction: 'ltr', textAlign: 'left' }} />{!emailOk && <div style={{ fontSize: 11.5, color: '#B03A3A', marginTop: 5, fontWeight: 600 }}>{he ? 'כתובת מייל לא תקינה' : 'Invalid email'}</div>}</div>
      <div><div style={lbl}>{he ? 'מספר טלפון' : 'Phone number'}</div>
        <div style={{ ...inp, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(11,30,61,0.04)', color: 'rgba(11,30,61,0.55)' }}>
          <Icon name="phone" size={16} color={accent} /><span style={{ direction: 'ltr', fontWeight: 600 }}>{dispPhone}</span>
          <span style={{ marginInlineStart: 'auto', fontSize: 11.5, color: 'rgba(11,30,61,0.4)' }}>{he ? 'מאומת ✓' : 'Verified ✓'}</span>
        </div>
      </div>
    </ProfSheet>
  );
}

function AddressSheet({ lang, accent, serif, session, updateSession, onClose, required }) {
  const he = lang === 'he';
  const [addr, setAddr] = useStateC((session && session.address) || '');
  const inp = { width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 15, color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.12)', borderRadius: 12, padding: '12px 13px', outline: 'none', direction: he ? 'rtl' : 'ltr', textAlign: 'start' };
  const lbl = { fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 7, marginInlineStart: 2 };
  const canSave = addr.trim().length > 2;
  return (
    <ProfSheet title={he ? 'הכתובת שלי' : 'My address'} accent={accent} serif={serif} onClose={required ? undefined : onClose}
      footer={<Btn kind="gold" icon="check" disabled={!canSave} onClick={() => { updateSession({ address: addr.trim() }); onClose(); }}>{he ? 'שמירת כתובת' : 'Save address'}</Btn>}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: 'rgba(200,162,74,0.1)', border: `1px solid ${accent}33`, borderRadius: 12, padding: '11px 13px' }}>
        <Icon name="navigate" size={17} color={accent} style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.7)', lineHeight: 1.5 }}>{he ? 'נשתמש בכתובת כדי לחשב זמן נסיעה ולהזכיר לך מתי לצאת לתור 🚗' : 'We use your address to estimate travel time and remind you when to leave 🚗'}</div>
      </div>
      <div><div style={lbl}>{he ? 'רחוב, מספר ועיר' : 'Street, number & city'}</div><input value={addr} onChange={e => setAddr(e.target.value)} autoFocus placeholder={he ? 'לדוגמה: הפלמ״ח 12, ירושלים' : 'e.g. 12 Hapalmach St, Jerusalem'} style={inp} /></div>
      <AddressBlock lang={lang} accent={accent} addr={addr} />
    </ProfSheet>
  );
}

function VisitHistorySheet({ lang, t, accent, serif, onClose }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const rows = [
    { svc: 's2', b: 0, when: he ? 'לפני שבועיים' : '2 weeks ago' },
    { svc: 's3', b: 2, when: he ? 'לפני חודש' : 'a month ago' },
    { svc: 's4', b: 3, when: he ? 'לפני חודשיים' : '2 months ago' },
    { svc: 's1', b: 0, when: he ? 'לפני 3 חודשים' : '3 months ago' },
  ];
  return (
    <ProfSheet title={he ? 'היסטוריית תורים' : 'Visit history'} accent={accent} serif={serif} onClose={onClose}>
      <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.55)', marginInlineStart: 2 }}>{he ? 'התורים שכבר עברו אצלך.' : 'Your past appointments.'}</div>
      {rows.map((r, k) => {
        const svc = DATA.services.find(s => s.id === r.svc) || DATA.services[0];
        const barber = DATA.barbers[r.b];
        return (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 13, background: '#fff', borderRadius: 16, padding: '13px 14px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
            <Avatar b={barber} size={40} ring={false} lang={lang} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14.5, color: '#0B1E3D' }}>{nm(svc)}</div>
              <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.5)', marginTop: 2 }}>{nm(barber)} · {r.when}</div>
            </div>
            <div style={{ textAlign: 'end' }}>
              <Money v={svc.price} size={14} />
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#2E7D52', background: 'rgba(46,125,82,0.1)', padding: '2px 8px', borderRadius: 10, marginTop: 4 }}>{he ? 'הושלם' : 'Done'}</div>
            </div>
          </div>
        );
      })}
    </ProfSheet>
  );
}

function NotificationsSheet({ lang, t, accent, serif, session, updateSession, onClose }) {
  const he = lang === 'he';
  // Round H0 · marketing consent defaults OFF (anti-spam). consentStore is the source of
  // truth; session.marketingOptIn mirrors it for this device.
  const marketingOn = window.consentStore ? window.consentStore.hasFor('me') : !!(session && session.marketingOptIn === true);
  // Round F · channel hierarchy. Banner = always-on base. On top sits one delivery channel:
  // the client's pick overrides the shop default; the default shows only until they choose.
  const bizDefault = (() => { try { const b = JSON.parse(localStorage.getItem('royale_bizsettings_v1')); return (b && b.channel && b.channel !== 'banner') ? b.channel : 'whatsapp'; } catch (e) { return 'whatsapp'; } })();
  const picked = session && session.prefChannel && session.prefChannel !== 'banner' ? session.prefChannel : null;
  const effectiveExtra = picked || bizDefault;
  const extraChans = [['whatsapp', 'WhatsApp'], ['sms', 'SMS'], ['email', he ? 'מייל' : 'Email']];
  const chanLabel = { whatsapp: 'WhatsApp', sms: 'SMS', email: he ? 'מייל' : 'Email' };
  const rows = he ? [
    { icon: 'clock', title: 'תזכורת לתור', body: 'התספורת שלך מחר ב-10:15 אצל סאסי', when: 'לפני שעה', unread: true },
    { icon: 'spark', title: 'מבצע החודש', body: 'תספורת + עיצוב זקן ב-20% הנחה', when: 'אתמול', unread: true },
    { icon: 'check', title: 'התור אושר', body: 'התור שלך נקבע בהצלחה', when: 'לפני 3 ימים' },
    { icon: 'bag', title: 'ההזמנה מוכנה לאיסוף', body: 'פומייד מאט ממתין לך במספרה', when: 'לפני שבוע' },
  ] : [
    { icon: 'clock', title: 'Appointment reminder', body: 'Your cut is tomorrow at 10:15 with Sasi', when: '1h ago', unread: true },
    { icon: 'spark', title: 'This month', body: 'Cut + Beard at 20% off', when: 'Yesterday', unread: true },
    { icon: 'check', title: 'Booking confirmed', body: 'Your appointment is set', when: '3d ago' },
    { icon: 'bag', title: 'Order ready for pickup', body: 'Your Matte Pomade is waiting', when: '1w ago' },
  ];
  return (
    <ProfSheet title={he ? 'התראות' : 'Notifications'} accent={accent} serif={serif} onClose={onClose}>
      {/* preferences, operational always on; marketing by choice; preferred channel */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '6px 14px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 0', borderBottom: '1px solid rgba(11,30,61,0.06)' }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(46,125,82,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="check" size={17} color="#2E7D52" stroke={2.2} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0B1E3D' }}>{he ? 'אישורי תור ותזכורות' : 'Bookings & reminders'}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 1 }}>{he ? 'תפעולי, תמיד פעיל' : 'Operational, always on'}</div>
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#2E7D52', background: 'rgba(46,125,82,0.1)', padding: '4px 10px', borderRadius: 20 }}>{he ? 'פעיל' : 'On'}</span>
        </div>
        <button onClick={() => { const v = !marketingOn; if (window.consentStore) window.consentStore.set('me', v); updateSession && updateSession({ marketingOptIn: v }); }} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '12px 0', border: 'none', background: 'none', font: 'inherit', cursor: 'pointer', textAlign: 'start', borderBottom: '1px solid rgba(11,30,61,0.06)' }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(200,162,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="spark" size={17} color={accent} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0B1E3D' }}>{he ? 'מבצעים והטבות' : 'Offers & promotions'}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 1 }}>{he ? 'שיווקי, לבחירתך' : 'Marketing, your choice'}</div>
          </div>
          <span style={{ width: 46, height: 28, borderRadius: 15, padding: 3, flexShrink: 0, background: marketingOn ? accent : 'rgba(11,30,61,0.18)', display: 'flex', justifyContent: marketingOn ? 'flex-end' : 'flex-start', transition: 'all .2s' }}><span style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} /></span>
        </button>
        {/* Round F · banner = always-on base layer (locked) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 0', borderBottom: '1px solid rgba(11,30,61,0.06)' }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(142,91,208,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="bell" size={17} color="#8E5BD0" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0B1E3D' }}>{he ? 'באנר באפליקציה' : 'In-app banner'}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 1 }}>{he ? 'שכבת בסיס · תמיד פעיל' : 'Base layer · always on'}</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, color: '#8E5BD0', background: 'rgba(142,91,208,0.1)', padding: '4px 10px', borderRadius: 20 }}><Icon name="check" size={12} color="#8E5BD0" stroke={2.6} />{he ? 'תמיד' : 'Always'}</span>
        </div>
        <div style={{ padding: '12px 0 13px' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 2 }}>{he ? 'ערוץ נוסף מועדף' : 'Preferred extra channel'}</div>
          <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.45)', marginBottom: 9, lineHeight: 1.45 }}>{he ? 'הבחירה שלך גוברת על ברירת המחדל של המספרה.' : 'Your choice overrides the shop default.'}</div>
          <div style={{ display: 'flex', gap: 5, background: 'rgba(11,30,61,0.05)', padding: 4, borderRadius: 12 }}>
            {extraChans.map(([id, lbl]) => {
              const on = effectiveExtra === id;
              return <button key={id} onClick={() => updateSession && updateSession({ prefChannel: id })} style={{ flex: 1, padding: '8px 4px', borderRadius: 9, border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 12, fontWeight: 700, background: on ? accent : 'transparent', color: on ? '#0B1E3D' : 'rgba(11,30,61,0.55)', transition: 'all .15s' }}>{lbl}</button>;
            })}
          </div>
          <div style={{ fontSize: 11, color: picked ? '#2E7D52' : 'rgba(11,30,61,0.5)', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name={picked ? 'check' : 'spark'} size={13} color={picked ? '#2E7D52' : accent} />
            {picked ? (he ? `מקבל ב${chanLabel[effectiveExtra]} - הבחירה שלך` : `Delivered via ${chanLabel[effectiveExtra]} - your choice`) : (he ? `ברירת מחדל של המספרה: ${chanLabel[bizDefault]} · בחר כדי לשנות` : `Shop default: ${chanLabel[bizDefault]} · pick to override`)}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: 0.6, color: 'rgba(11,30,61,0.4)', textTransform: 'uppercase', marginInlineStart: 2 }}>{he ? 'התראות אחרונות' : 'Recent'}</div>
      {rows.map((r, k) => (
        <div key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: r.unread ? 'rgba(200,162,74,0.07)' : '#fff', borderRadius: 16, padding: '13px 14px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)', border: r.unread ? `1px solid ${accent}33` : '1px solid rgba(11,30,61,0.05)' }}>
          <span style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,rgba(228,201,123,0.22),rgba(200,162,74,0.16))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={r.icon} size={19} color={accent} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#0B1E3D' }}>{r.title}</span>
              {r.unread && <span style={{ width: 7, height: 7, borderRadius: 4, background: accent }} />}
            </div>
            <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.6)', marginTop: 2, lineHeight: 1.4 }}>{r.body}</div>
            <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.4)', marginTop: 4 }}>{r.when}</div>
          </div>
        </div>
      ))}
    </ProfSheet>
  );
}

function HelpSheet({ lang, t, accent, serif, onClose }) {
  const he = lang === 'he';
  const [open, setOpen] = useStateC(null);
  const c = DATA.contact;
  const faqs = he ? [
    ['איך קובעים תור?', 'במסך הבית לוחצים על "קביעת תור", בוחרים ספר, שירות ומועד, והתור נשמר אוטומטית.'],
    ['איך מבטלים או משנים תור?', 'בכרטיסיית "התורים שלי" בוחרים "שינוי מועד" כדי לבחור זמן חדש, או "ביטול תור" ומאשרים.'],
    ['איפה אתם נמצאים?', 'אוסישקין 41, ירושלים. אפשר לנווט ישירות מהאפליקציה דרך Waze.'],
    ['אילו אמצעי תשלום מקבלים?', 'התשלום מתבצע במספרה במזומן, אשראי או אפליקציות תשלום.'],
  ] : [
    ['How do I book?', 'On the home screen tap "Book a visit", pick a barber, service and time, it saves automatically.'],
    ['How do I cancel or reschedule?', 'In "My visits" tap "Reschedule" to pick a new time, or "Cancel" and confirm.'],
    ['Where are you located?', '41 Ussishkin St, Jerusalem. You can navigate straight from the app via Waze.'],
    ['Which payment methods?', 'Payment is made at the shop, cash, card or payment apps.'],
  ];
  return (
    <ProfSheet title={he ? 'עזרה ותמיכה' : 'Help & support'} accent={accent} serif={serif} onClose={onClose}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.5)', textTransform: 'uppercase', letterSpacing: 0.6, marginInlineStart: 2 }}>{he ? 'שאלות נפוצות' : 'FAQ'}</div>
      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
        {faqs.map((f, k) => {
          const on = open === k;
          return (
            <div key={k} style={{ borderBottom: k < faqs.length - 1 ? '1px solid rgba(11,30,61,0.06)' : 'none' }}>
              <button onClick={() => setOpen(on ? null : k)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'start', border: 'none', background: 'none', font: 'inherit', cursor: 'pointer', padding: '14px 15px' }}>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#0B1E3D' }}>{f[0]}</span>
                <Icon name="chevron" size={16} color={accent} style={{ transform: on ? 'rotate(-90deg)' : (he ? 'scaleX(-1)' : 'none'), transition: 'transform .2s' }} />
              </button>
              {on && <div className="fade-in" style={{ padding: '0 15px 14px', fontSize: 13, color: 'rgba(11,30,61,0.62)', lineHeight: 1.55 }}>{f[1]}</div>}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.5)', textTransform: 'uppercase', letterSpacing: 0.6, marginInlineStart: 2, marginTop: 4 }}>{he ? 'דברו איתנו' : 'Contact us'}</div>
      <button onClick={() => window.open('https://wa.me/' + c.phone.replace(/[^0-9]/g, ''), '_blank')} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '14px 16px', borderRadius: 16, border: 'none', cursor: 'pointer', font: 'inherit', background: 'linear-gradient(135deg,#1ebe5d,#12a350)', color: '#fff', boxShadow: '0 8px 22px rgba(30,190,93,0.3)' }}>
        <span style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="whatsapp" size={20} color="#fff" /></span>
        <span style={{ flex: 1, textAlign: 'start', fontSize: 15, fontWeight: 700 }}>{he ? 'שלחו וואטסאפ' : 'Message on WhatsApp'}</span>
      </button>
      <button onClick={() => { window.location.href = 'tel:' + c.phone; }} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '14px 16px', borderRadius: 16, border: '1px solid rgba(11,30,61,0.1)', cursor: 'pointer', font: 'inherit', background: '#fff', color: '#0B1E3D' }}>
        <span style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(11,30,61,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="phone" size={19} color={accent} /></span>
        <span style={{ flex: 1, textAlign: 'start', fontSize: 15, fontWeight: 700 }}>{he ? 'חייגו אלינו' : 'Call us'}</span>
        <span style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.45)', direction: 'ltr', fontWeight: 600 }}>{c.phoneDisp}</span>
      </button>
    </ProfSheet>
  );
}

// Round B · the client picks their own PRIMARY BARBER (overrides the auto-count).
// This is a CRM association used for group messaging & identity - it does NOT book or
// move any appointment. A manual pick beats the most-visited calculation.
function PrimaryBarberSheet({ lang, t, accent, serif, appts, staff, custId, custRef, updateSession, onClose }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const list = (staff || DATA.barbers).filter(b => b.active !== false);
  const [ver, setVer] = useStateC(0);
  void ver;
  const pb = window.primaryBarber ? window.primaryBarber(custRef, appts) : null;
  const manualId = window.custStore ? window.custStore.primaryOverride(custId) : null;
  // the auto pick (ignoring any manual override), computed from visit history directly
  const autoEff = (() => {
    const ref = { ...custRef };
    // temporarily compute without override by reading history directly
    const hist = (appts || []).filter(a => a.barberId && a.status !== 'rejected' && a.status !== 'cancelled' && ((a.clientId && a.clientId === custId) || (ref.isMe && a.clientId === 'me') || a.clientHe === ref.he || a.clientEn === ref.en));
    if (hist.length) { const c = {}; hist.forEach(a => c[a.barberId] = (c[a.barberId] || 0) + 1); let id = null, n = -1; Object.keys(c).forEach(k => { if (c[k] > n) { n = c[k]; id = k; } }); return id ? { id, count: n } : null; }
    return ref.fav ? { id: ref.fav } : null;
  })();
  const autoBarber = autoEff && list.find(b => b.id === autoEff.id);
  const pick = (bid) => {
    if (window.custStore) window.custStore.setPrimary(custId, bid);
    updateSession && updateSession({ primaryBarber: bid || null });
    setVer(v => v + 1);
  };
  return (
    <ProfSheet title={he ? 'הספר הראשי שלי' : 'My primary barber'} accent={accent} serif={serif} onClose={onClose}>
      <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.6)', lineHeight: 1.55, marginInlineStart: 2 }}>{he ? 'הספר שאליו אתה משויך לצורך הודעות והטבות. כברירת מחדל נבחר אוטומטית הספר שאצלו הסתפרת הכי הרבה - אפשר לבחור ספר אחר וזה יגבר.' : 'The barber you’re linked to for messages & perks. By default this is whoever you’ve visited most - pick another and it takes over.'}</div>
      {/* automatic option */}
      <button onClick={() => pick(null)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: '#fff', border: `1.5px solid ${!manualId ? accent : 'rgba(11,30,61,0.1)'}`, borderRadius: 16, padding: '13px 14px', cursor: 'pointer', font: 'inherit', textAlign: 'start', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
        <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${!manualId ? accent : 'rgba(11,30,61,0.25)'}`, background: !manualId ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{!manualId && <Icon name="check" size={14} color="#fff" stroke={2.6} />}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontWeight: 700, fontSize: 14.5, color: '#0B1E3D' }}>{he ? 'אוטומטי' : 'Automatic'}</span>
          <span style={{ display: 'block', fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{autoBarber ? (he ? `כרגע: ${nm(autoBarber)}${autoEff.count ? ` · ${autoEff.count} ביקורים` : ''}` : `Now: ${nm(autoBarber)}${autoEff.count ? ` · ${autoEff.count} visits` : ''}`) : (he ? 'עדיין אין מספיק היסטוריה' : 'Not enough history yet')}</span>
        </span>
        <Icon name="spark" size={17} color={accent} />
      </button>
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, color: 'rgba(11,30,61,0.4)', textTransform: 'uppercase', marginInlineStart: 2, marginTop: 4 }}>{he ? 'או בחר ספר' : 'Or choose a barber'}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {list.map(b => {
          const on = manualId === b.id;
          return (
            <button key={b.id} onClick={() => pick(b.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: '#fff', border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.1)'}`, borderRadius: 16, padding: '11px 13px', cursor: 'pointer', font: 'inherit', textAlign: 'start', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.25)'}`, background: on ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <Icon name="check" size={14} color="#fff" stroke={2.6} />}</span>
              <span style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: `0 0 0 1.5px ${accent}66` }}><ImgSlot id={'staff-' + b.id} shape="circle" placeholder={(he ? b.he : b.en).split(' ').map(w => w[0]).slice(0, 2).join('')} style={{ width: 40, height: 40 }} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 700, fontSize: 14.5, color: '#0B1E3D' }}>{nm(b)}</span>
                <span style={{ display: 'block', fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{he ? b.tagHe : b.tagEn}</span>
              </span>
            </button>
          );
        })}
      </div>
    </ProfSheet>
  );
}

function ProfileScreen({ lang, t, accent, serif, session, updateSession, onLogout, appts, staff, onBookCard, onBuyCard, onChangeLang }) {
  const he = lang === 'he';
  const [sheet, setSheet] = useStateC(null);
  const punchCards = window.punchStore ? window.punchStore.walletFor('me') : [];
  const punchLeft = window.punchStore ? window.punchStore.usableCards('me', appts).reduce((n, c) => n + window.punchStore.balanceForCard(c, appts), 0) : 0;
  // Round B · resolve my own customer record so the primary-barber link is shared with CRM
  const _digits = s => (s || '').replace(/[^0-9]/g, '').replace(/^972/, '0');
  const meRec = (session && DATA.customers.find(c => c.phone && _digits(c.phone) === _digits(session.phone)))
    || (session && DATA.customers.find(c => c.he === session.name || c.en === session.name))
    || DATA.customers.find(c => c.id === 'c1');
  const myCustId = meRec ? meRec.id : 'me';
  const myCustRef = meRec ? { ...meRec, isMe: true } : { id: 'me', isMe: true, he: session && session.name, en: session && session.name };
  const myPB = window.primaryBarber ? window.primaryBarber(myCustRef, appts) : null;
  const myPBBarber = myPB && (staff || DATA.barbers).find(b => b.id === myPB.id);
  const dispName = (session && session.name) || (he ? 'דניאל אבני' : 'Daniel Avni');
  const initials = dispName.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('') || 'D';
  const dispPhone = session && session.phone ? session.phone.replace(/^0/, '').replace(/(\d{2})(\d{3})(\d+)/, '0$1-$2-$3') : '050-000-0000';
  const addr = (session && (session.address || session.region)) || '';
  const items = [
    { id: 'details', icon: 'user', label: he ? 'פרטים אישיים' : 'Personal details', val: dispPhone, ltr: true },
    ...(punchCards.length ? [{ id: 'punch', icon: 'card', label: punchCards.length > 1 ? (he ? 'הכרטיסיות שלי' : 'My punch cards') : (he ? 'הכרטיסייה שלי' : 'My punch card'), val: `${punchLeft}`, ltr: true }] : []),
    { id: 'address', icon: 'pin', label: he ? 'הכתובת שלי' : 'My address', val: addr || (he ? 'הוסיפו כתובת' : 'Add address'), muted: !addr },
    { id: 'primary', icon: 'heart', label: he ? 'הספר הראשי שלי' : 'My primary barber', val: myPBBarber ? (he ? myPBBarber.he : myPBBarber.en).split(' ')[0] : (he ? 'בחירה' : 'Choose'), muted: !myPBBarber },
    { id: 'history', icon: 'calendar', label: he ? 'היסטוריית תורים' : 'Visit history' },
    { id: 'notif', icon: 'bell', label: he ? 'התראות' : 'Notifications', badge: 2 },
    { id: 'lang', icon: 'message', label: lang === 'he' ? 'שפה / Language' : 'Language / שפה', val: lang === 'he' ? 'עברית' : 'English' },
    { id: 'help', icon: 'message', label: he ? 'עזרה ותמיכה' : 'Help & support' },
  ];
  return (
    <div style={{ padding: '54px 18px 120px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ fontFamily: displayFont(lang, serif), fontSize: lang === 'he' ? 30 : 27, fontWeight: 700, color: '#0B1E3D' }}>{t.profile}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15, background: 'linear-gradient(135deg,#14305A,#0B1E3D)', borderRadius: 22, padding: 18 }}>
        {/* editable profile photo, drop an image to replace */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <span style={{ display: 'block', width: 58, height: 58, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 0 2px rgba(255,255,255,0.15), 0 0 0 3.5px rgba(200,162,74,0.85)' }}>
            <ImgSlot id="customer-avatar" shape="circle" tapEdit replaceLabel={he ? 'החלפה' : 'Replace'} removeLabel={he ? 'הסרה' : 'Remove'} placeholder={initials} style={{ width: 58, height: 58 }} />
          </span>
          <span style={{ position: 'absolute', bottom: -2, insetInlineEnd: -2, width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.3)', pointerEvents: 'none' }}><Icon name="pencil" size={12} color="#0B1E3D" /></span>
        </div>
        <div>
          <div style={{ color: '#FBF9F5', fontWeight: 600, fontSize: 18, fontFamily: serif }}>{dispName}</div>
          <div style={{ color: 'rgba(228,201,123,0.9)', fontSize: 13, marginTop: 3, fontWeight: 600 }}>{he ? 'חבר מועדון זהב' : 'Gold member'}</div>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 16px rgba(11,30,61,0.05)' }}>
        {items.map((it, k) => (
          <button key={it.id} onClick={() => setSheet(it.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'start', border: 'none', background: 'none', font: 'inherit', cursor: 'pointer', padding: '15px 16px', borderBottom: k < items.length - 1 ? '1px solid rgba(11,30,61,0.06)' : 'none' }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(200,162,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={it.icon} size={17} color={accent} /></span>
            <span style={{ flex: 1, fontSize: 15, color: '#0B1E3D', fontWeight: 500 }}>{it.label}</span>
            {it.badge && <span style={{ minWidth: 19, height: 19, padding: '0 5px', borderRadius: 10, background: accent, color: '#0B1E3D', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.badge}</span>}
            {it.val && <span style={{ fontSize: 13, color: it.muted ? accent : 'rgba(11,30,61,0.45)', fontWeight: 600, direction: it.ltr ? 'ltr' : 'inherit', maxWidth: 130, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.val}</span>}
            <Icon name={lang === 'he' ? 'chevronR' : 'chevron'} size={17} color="rgba(11,30,61,0.3)" />
          </button>
        ))}
      </div>
      <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px', borderRadius: 14, border: '1px solid rgba(11,30,61,0.12)', background: '#fff', font: 'inherit', fontSize: 14.5, fontWeight: 600, color: '#0B1E3D', cursor: 'pointer' }}>
        <Icon name="phone" size={17} color={accent} />{he ? 'התנתקות' : 'Log out'}
      </button>

      {sheet === 'details' && <PersonalDetailsSheet lang={lang} accent={accent} serif={serif} session={session} updateSession={updateSession} onClose={() => setSheet(null)} />}
      {sheet === 'punch' && window.PunchWalletSheet && <PunchWalletSheet lang={lang} accent={accent} serif={serif} appts={appts} staff={staff} onClose={() => setSheet(null)} onBook={(card) => { setSheet(null); onBookCard && onBookCard(card); }} onBuy={() => { setSheet(null); onBuyCard && onBuyCard(); }} />}
      {sheet === 'address' && <AddressSheet lang={lang} accent={accent} serif={serif} session={session} updateSession={updateSession} onClose={() => setSheet(null)} />}
      {sheet === 'primary' && <PrimaryBarberSheet lang={lang} t={t} accent={accent} serif={serif} appts={appts} staff={staff} custId={myCustId} custRef={myCustRef} updateSession={updateSession} onClose={() => setSheet(null)} />}
      {sheet === 'history' && <VisitHistorySheet lang={lang} t={t} accent={accent} serif={serif} onClose={() => setSheet(null)} />}
      {sheet === 'notif' && <NotificationsSheet lang={lang} t={t} accent={accent} serif={serif} session={session} updateSession={updateSession} onClose={() => setSheet(null)} />}
      {sheet === 'lang' && (
        <div onClick={() => setSheet(null)} style={{ position: 'absolute', inset: 0, zIndex: 84, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
          <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)', padding: '10px 20px calc(24px + env(safe-area-inset-bottom))' }}>
            <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 18px' }} />
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D', marginBottom: 16 }}>{he ? 'שפת האפליקציה' : 'App language'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[['he', 'עברית', 'שפת המשק'], ['en', 'English', 'Interface language']].map(([id, label, sub]) => (
                <button key={id} onClick={() => { onChangeLang && onChangeLang(id); setSheet(null); }} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '14px 15px', borderRadius: 16, border: `1.5px solid ${lang === id ? accent : 'rgba(11,30,61,0.1)'}`, background: lang === id ? accent + '12' : '#fff', cursor: 'pointer', font: 'inherit', textAlign: 'start' }}>
                  <span style={{ width: 38, height: 38, borderRadius: 11, background: lang === id ? accent + '22' : 'rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: 14, color: lang === id ? '#7A5F1E' : 'rgba(11,30,61,0.5)' }}>{id === 'he' ? 'עב' : 'EN'}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: 15.5, color: '#0B1E3D' }}>{label}</span>
                    <span style={{ display: 'block', fontSize: 12, color: 'rgba(11,30,61,0.5)', marginTop: 2 }}>{sub}</span>
                  </span>
                  {lang === id && <Icon name="check" size={20} color={accent} stroke={2.4} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {sheet === 'help' && <HelpSheet lang={lang} t={t} accent={accent} serif={serif} onClose={() => setSheet(null)} />}
    </div>
  );
}

function UpsellBanner({ lang, t, accent, serif, product, onShop, onSkip }) {
  const nm = o => o[lang];
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 79, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" style={{ width: '100%', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)', padding: '10px 20px calc(22px + env(safe-area-inset-bottom))' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 16px' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(200,162,74,0.14)', padding: '4px 11px', borderRadius: 20, marginBottom: 12 }}>
          <Icon name="spark" size={13} color={accent} /><span style={{ fontSize: 12, fontWeight: 700, color: '#0B1E3D' }}>{t.upsellSub}</span>
        </div>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 23, color: '#0B1E3D', marginBottom: 16 }}>{t.upsellTitle}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(135deg,#14305A,#0B1E3D)', borderRadius: 18, padding: 14, marginBottom: 16 }}>
          <span style={{ width: 66, height: 66, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}><ImgSlot id={'prod-' + product.id} radius={14} readonly placeholder={lang === 'he' ? 'אין תמונה' : 'No image'} style={{ width: 66, height: 66 }} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#FBF9F5', fontWeight: 600, fontSize: 16, fontFamily: serif }}>{nm(product)}</div>
            <div style={{ color: 'rgba(251,249,245,0.6)', fontSize: 12.5, marginTop: 2, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{lang === 'he' ? product.descHe : product.descEn}</div>
          </div>
          <span style={{ color: '#E4C97B', fontWeight: 700, fontSize: 17, fontFamily: 'Assistant, sans-serif', flexShrink: 0 }}>₪{product.price}</span>
        </div>
        <Btn kind="gold" icon="bag" onClick={onShop}>{t.upsellCta}</Btn>
        <button onClick={onSkip} style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(11,30,61,0.5)', font: 'inherit', fontSize: 14, fontWeight: 600, padding: 12, marginTop: 4, cursor: 'pointer' }}>{t.maybeLater}</button>
      </div>
    </div>
  );
}

// "Where are you coming from?", two origins instead of a neighborhood list.
// The pick feeds the "time to leave" travel-time calc.
function RegionPrompt({ lang, t, accent, serif, session, onSkip, onSave }) {
  const he = lang === 'he';
  const homeAddr = (session && (session.address || session.region)) || '';
  const [origin, setOrigin] = useStateC(homeAddr ? 'home' : 'current');
  const [locating, setLocating] = useStateC(false);
  const pickCurrent = () => { setLocating(true); setTimeout(() => { setLocating(false); setOrigin('current'); }, 1100); };
  const opts = [
    { id: 'home', icon: 'pin', label: t.originHome, sub: homeAddr || t.originNoHome },
    { id: 'current', icon: 'navigate', label: t.originCurrent, sub: t.originCurrentSub },
  ];
  const save = () => onSave({ mode: origin, label: origin === 'home' ? homeAddr : (he ? 'המיקום הנוכחי' : 'Current location') });
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 78, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" style={{ width: '100%', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)', padding: '10px 20px calc(24px + env(safe-area-inset-bottom))' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 16px' }} />
        <div style={{ width: 54, height: 54, borderRadius: 15, background: 'rgba(200,162,74,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}><Icon name="pin" size={26} color={accent} /></div>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 23, color: '#0B1E3D' }}>{t.originTitle}</div>
        <div style={{ fontSize: 14, color: 'rgba(11,30,61,0.6)', marginTop: 7, marginBottom: 18, lineHeight: 1.5 }}>{t.originSub} 🚗</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }}>
          {opts.map(o => {
            const on = origin === o.id;
            const busy = o.id === 'current' && locating;
            return (
              <button key={o.id} onClick={() => o.id === 'current' ? pickCurrent() : setOrigin('home')} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: on ? accent + '14' : '#fff', border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.1)'}`, borderRadius: 16, padding: '13px 14px', cursor: 'pointer', font: 'inherit', textAlign: 'start', transition: 'all .18s' }}>
                <span style={{ position: 'relative', width: 40, height: 40, borderRadius: 12, background: on ? accent + '22' : 'rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {busy && <><span className="geo-ping" style={{ borderColor: accent }} /><span className="geo-ping geo-ping-2" style={{ borderColor: accent }} /></>}
                  <Icon name={o.icon} size={20} color={on ? accent : 'rgba(11,30,61,0.5)'} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0B1E3D' }}>{o.label}</div>
                  <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.5)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{busy ? t.originLocating : o.sub}</div>
                </div>
                <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <span style={{ width: 11, height: 11, borderRadius: '50%', background: accent }} />}</span>
              </button>
            );
          })}
        </div>
        <Btn kind="gold" icon={he ? 'arrowL' : 'arrowR'} onClick={save}>{t.originContinue}</Btn>
        <button onClick={onSkip} style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(11,30,61,0.5)', font: 'inherit', fontSize: 14, fontWeight: 600, padding: 12, marginTop: 4, cursor: 'pointer' }}>{t.regionSkip}</button>
      </div>
    </div>
  );
}

// ── Round #4 · Waitlist race with a REAL atomic lock. The freed slot is a single
//    shared resource: all waiters are paged at once, the first to confirm wins the
//    lock (waitlist.claimSlot), and any rival who taps a beat later reads the lock as
//    taken and loses. A simulated rival races the very same lock, so "someone else
//    confirmed first" is a genuine lost claim, not a timer. The loser gets an explicit
//    stay-in-line / remove-me choice; the winner sees the full booking details. ──
function WaitlistOffer({ lang, accent, serif, offer, onWin, onAlternative, onReturn, onRemove, onRelease }) {
  const he = lang === 'he';
  const RACE_MS = 7000;
  const RIVAL_MS = offer.rivalDelay || 4200;             // when the simulated rival tries to grab it
  const [phase, setPhase] = useStateC('race'); // race | lock | won | lost
  const [prog, setProg] = useStateC(0);
  const acted = useRefC(false);
  const meId = offer.meId || 'me';
  // the rival attempts the SAME lock partway through; if it wins, the lock is taken.
  useEffectC(() => {
    if (phase !== 'race') return;
    const t0 = Date.now();
    const rivalT = setTimeout(() => {
      if (acted.current) return;
      const r = window.waitlist.claimSlot(offer.barber.id, offer.date, offer.start, offer.rivalId || 'rival');
      if (r.won) { acted.current = true; clearInterval(id); setPhase('lost'); }
    }, RIVAL_MS);
    const id = setInterval(() => {
      const p = Math.min(100, (Date.now() - t0) / RACE_MS * 100);
      setProg(p);
      if (p >= 100) { clearInterval(id); clearTimeout(rivalT); if (!acted.current) { acted.current = true; setPhase('lost'); } }
    }, 70);
    return () => { clearInterval(id); clearTimeout(rivalT); };
  }, [phase]);
  const pad = n => String(n).padStart(2, '0');
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })();
  const tom = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })();
  const fullDate = offer.date ? new Date(offer.date + 'T00:00').toLocaleDateString(he ? 'he-IL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
  const dayLbl = offer.date === today ? (he ? 'היום' : 'today') : offer.date === tom ? (he ? 'מחר' : 'tomorrow') : offer.date ? new Date(offer.date + 'T00:00').toLocaleDateString(he ? 'he-IL' : 'en-US', { weekday: 'short', day: 'numeric' }) : '';
  const barberName = offer.barber ? (he ? offer.barber.he : offer.barber.en).split(' ')[0] : '';
  const svcObj = offer.svc ? DATA.services.find(s => s.id === offer.svc) : null;
  const svcName = svcObj ? (he ? svcObj.he : svcObj.en) : '';
  const slotLine = [barberName && (he ? 'אצל ' + barberName : 'with ' + barberName), dayLbl, offer.start].filter(Boolean).join(' · ');
  // the real claim: synchronous, atomic. Win → show details & book. Lose → loser screen.
  const confirm = (hhmm) => {
    if (acted.current || (phase !== 'race' && phase !== 'lost')) return;
    const r = window.waitlist.claimSlot(offer.barber.id, offer.date, hhmm, meId);
    if (!r.won) { acted.current = true; setPhase('lost'); return; }
    acted.current = true; setWonSlot(hhmm); setPhase('lock');
    setTimeout(() => setPhase('won'), 850);
  };
  const [wonSlot, setWonSlot] = useStateC(offer.start);
  const wrap = (children) => (
    <div style={{ position: 'absolute', top: 0, left: 10, right: 10, zIndex: 88, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div className="undo-in" style={{ pointerEvents: 'auto', width: '100%', maxWidth: 376, marginTop: 58, background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', borderRadius: 20, padding: '14px 15px', boxShadow: '0 18px 50px rgba(200,162,74,0.45)' }}>{children}</div>
    </div>
  );
  if (phase === 'lock') return wrap(
    <div style={{ textAlign: 'center', padding: '8px 0 6px' }}>
      <div className="succ-pop" style={{ width: 50, height: 50, borderRadius: '50%', background: '#0B1E3D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 11px' }}><Icon name="check" size={27} color="#E4C97B" stroke={2.6} /></div>
      <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 16.5, color: '#0B1E3D' }}>{he ? 'תפסת! נועל את התור עליך…' : 'You got it! Locking it in…'}</div>
    </div>
  );
  // ── WINNER · full booking details, then it lands in the calendar as a regular appt ──
  if (phase === 'won') return wrap(
    <div>
      <div style={{ textAlign: 'center', padding: '2px 0 4px' }}>
        <div className="succ-pop" style={{ width: 46, height: 46, borderRadius: '50%', background: '#0B1E3D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 9px' }}><Icon name="check" size={25} color="#E4C97B" stroke={2.6} /></div>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 17, color: '#0B1E3D' }}>{he ? 'התור שלך! 🎉' : 'The slot is yours! 🎉'}</div>
        <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.7)', marginTop: 2 }}>{he ? 'שריינו אותו עבורך, מתווסף ליומן' : 'Locked in and added to your calendar'}</div>
      </div>
      <div style={{ background: 'rgba(11,30,61,0.07)', borderRadius: 14, padding: '12px 13px', marginTop: 11, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {[['scissors', svcName], ['user', barberName && (he ? 'אצל ' + barberName : 'with ' + barberName)], ['calendar', fullDate], ['clock', wonSlot]].filter(r => r[1]).map(([ic, txt], k) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name={ic} size={16} color="#9C7B2E" />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0B1E3D', direction: ic === 'clock' ? 'ltr' : 'inherit' }}>{txt}</span>
          </div>
        ))}
      </div>
      {offer.wasPunch && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 10, background: 'rgba(11,30,61,0.07)', borderRadius: 12, padding: '9px 11px' }}>
          <Icon name="coin" size={15} color="#0B1E3D" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.72)', lineHeight: 1.45 }}>{he ? 'התור שהתפנה נוקב במקור מכרטיסייה של לקוח אחר - אצלך הוא תור רגיל בתשלום.' : 'The freed slot was punched from another client’s card - for you it’s a regular paid visit.'}</span>
        </div>
      )}
      <button onClick={() => { const s = wonSlot; (s === offer.start ? onWin : onAlternative)(s); }} style={{ width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', borderRadius: 12, border: 'none', background: '#0B1E3D', color: '#fff', font: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}><Icon name="calendar" size={16} color="#E4C97B" />{he ? 'מצוין, ליומן שלי' : 'Great, view in calendar'}</button>
    </div>
  );
  // ── LOSER · explicit choice: stay in line, or remove me ──
  if (phase === 'lost') return wrap(
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(11,30,61,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="x" size={20} color="#0B1E3D" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 15.5, color: '#0B1E3D' }}>{he ? 'התור נתפס 😕' : 'The slot was taken 😕'}</div>
          <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.72)', marginTop: 1 }}>{he ? 'לקוח אחר אישר רגע לפניך.' : 'Another client confirmed a moment first.'}</div>
        </div>
        <button onClick={onRelease} style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: 'rgba(11,30,61,0.5)', flexShrink: 0 }}><Icon name="x" size={16} /></button>
      </div>
      {offer.alt && window.waitlist.lockedBy(offer.barber.id, offer.date, offer.alt) === null && (
        <div style={{ background: 'rgba(11,30,61,0.08)', borderRadius: 13, padding: '10px 12px', marginTop: 11, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="clock" size={17} color="#0B1E3D" />
          <div style={{ flex: 1 }}><div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.6)', fontWeight: 600 }}>{he ? 'יש שעה חלופית פנויה באותו יום' : 'Another slot is free that day'}</div><div style={{ fontSize: 16, fontWeight: 800, color: '#0B1E3D', direction: 'ltr', textAlign: 'start' }}>{offer.alt}</div></div>
          <button onClick={() => confirm(offer.alt)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 13px', borderRadius: 11, border: 'none', background: '#0B1E3D', color: '#fff', font: 'inherit', fontSize: 12.5, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}><Icon name="check" size={15} color="#fff" stroke={2.4} />{he ? 'תפוס' : 'Grab'}</button>
        </div>
      )}
      <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.7)', marginTop: 11, fontWeight: 600 }}>{he ? 'מה לעשות עם רשימת ההמתנה?' : 'What about the waitlist?'}</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={onReturn} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', borderRadius: 12, border: 'none', background: '#0B1E3D', color: '#fff', font: 'inherit', fontSize: 13.5, fontWeight: 800, cursor: 'pointer' }}><Icon name="bell" size={16} color="#E4C97B" />{he ? 'השאר אותי ברשימה' : 'Stay in line'}</button>
        <button onClick={onRemove} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', borderRadius: 12, border: '1px solid rgba(11,30,61,0.3)', background: 'transparent', color: '#0B1E3D', font: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}><Icon name="x" size={16} color="#0B1E3D" />{he ? 'הסר אותי' : 'Remove me'}</button>
      </div>
    </div>
  );
  // ── RACE · all waiters paged at once; first to confirm claims the lock ──
  return wrap(
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="ttl-bell" style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(11,30,61,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="bell" size={21} color="#0B1E3D" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 15.5, color: '#0B1E3D' }}>{he ? 'התפנה תור! 🎉' : 'A slot opened! 🎉'}</div>
          <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.72)', marginTop: 1, direction: he ? 'rtl' : 'ltr' }}>{slotLine || (he ? 'מרשימת ההמתנה' : 'From your waitlist')}</div>
        </div>
        <button onClick={onRelease} style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: 'rgba(11,30,61,0.5)', flexShrink: 0 }}><Icon name="x" size={16} /></button>
      </div>
      <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.7)', fontWeight: 600, marginTop: 9, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="users" size={13} color="#0B1E3D" />{he ? `נשלח לכל ${offer.waiters || 3} הממתינים לפי סדר ההצטרפות · וואטסאפ + באנר` : `Sent to all ${offer.waiters || 3} waiters by join-order · WhatsApp + banner`}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#0B1E3D', marginTop: 9, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span>{he ? 'מי שמאשר ראשון, תופס' : 'First to confirm wins'}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(11,30,61,0.6)' }}>{he ? 'מישהו אחר מתלבט…' : 'someone else is deciding…'}</span>
      </div>
      <div style={{ height: 7, borderRadius: 5, background: 'rgba(11,30,61,0.14)', overflow: 'hidden' }}><div style={{ width: prog + '%', height: '100%', borderRadius: 5, background: '#0B1E3D', transition: 'width .1s linear' }} /></div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={() => confirm(offer.start)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', borderRadius: 12, border: 'none', background: '#0B1E3D', color: '#fff', font: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}><Icon name="check" size={17} color="#fff" stroke={2.4} />{he ? 'אשר ושריין מיד' : 'Confirm & claim'}</button>
        <button onClick={onRelease} style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(11,30,61,0.3)', background: 'transparent', color: '#0B1E3D', font: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>{he ? 'ויתור' : 'Pass'}</button>
      </div>
    </div>
  );
}

// ── Round D2 · split entry: single appointment vs. several appointments ──
// Shown the instant the client taps "קביעת תור", BEFORE the flow, but only when the
// manager has flagged at least one service as multi-booking-allowed. One clear fork:
// a single treatment for me → the normal flow; several → straight into the cart.
function BookEntryChoice({ lang, accent, serif, onSingle, onMulti, onClose }) {
  const he = lang === 'he';
  const Opt = ({ icon, title, sub, onClick, gold }) => (
    <button onClick={onClick} className="tapsq" style={{ display: 'flex', alignItems: 'center', gap: 15, width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', borderRadius: 22, padding: '20px 18px',
      background: gold ? 'linear-gradient(140deg,#14305A,#0B1E3D)' : '#fff',
      border: gold ? '1px solid rgba(228,201,123,0.45)' : '1.5px solid rgba(11,30,61,0.08)',
      boxShadow: gold ? '0 14px 32px rgba(11,30,61,0.28)' : '0 4px 16px rgba(11,30,61,0.06)' }}>
      <span style={{ width: 58, height: 58, borderRadius: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: gold ? 'linear-gradient(135deg,#E4C97B,#C8A24A)' : `${accent}18`,
        boxShadow: gold ? '0 8px 18px rgba(200,162,74,0.4)' : 'none' }}>
        <Icon name={icon} size={28} color={gold ? '#0B1E3D' : accent} stroke={2.1} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: serif, fontWeight: 700, fontSize: 21, color: gold ? '#FBF9F5' : '#0B1E3D' }}>{title}</span>
        <span style={{ display: 'block', fontSize: 13, color: gold ? 'rgba(251,249,245,0.72)' : 'rgba(11,30,61,0.55)', marginTop: 4, lineHeight: 1.4 }}>{sub}</span>
      </span>
      <Icon name={he ? 'arrowL' : 'arrowR'} size={22} color={gold ? '#E4C97B' : accent} />
    </button>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--cream-bg)', zIndex: 71 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 58, padding: '58px 18px 14px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 2 }}>
        <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Icon name={he ? 'arrowR' : 'arrowL'} size={20} color="#0B1E3D" />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: accent, textTransform: 'uppercase', marginBottom: 3 }}>{he ? 'קביעת תור' : 'Book'}</div>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 21, color: '#0B1E3D' }}>{he ? 'למי קובעים?' : 'Who is this for?'}</div>
        </div>
      </div>
      {/* cards centered in the full screen, not below the header */}
      <div style={{ position: 'absolute', inset: 0, padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
        <Opt icon="user" title={he ? 'תור בודד' : 'Single appointment'} sub={he ? 'טיפול אחד' : 'One treatment'} onClick={onSingle} />
        <Opt icon="users" gold title={he ? 'כמה תורים' : 'Several appointments'} sub={he ? 'לי ולמשפחה או לחברים · שיבוץ אוטומטי יחד' : 'Me + family or friends · scheduled together'} onClick={onMulti} />
      </div>
    </div>
  );
}

function CustomerApp({ lang, t, accent, serif, cfg, taglines, products, notify, toast, staff, globalAppts, addAppt, removeAppt, updateApptTime, onNewRequest, staffNotify, session, setRegion, updateSession, onLogout, onChangeLang }) {
  const [tab, setTab] = useStateC('home');
  const [booking, setBooking] = useStateC(false);
  const [bookChoice, setBookChoice] = useStateC(false); // Round D2: single-vs-multiple split screen
  const [cart, setCart] = useStateC(null); // Round D: active appointment cart (seeded with first service)
  const [punchBuy, setPunchBuy] = useStateC(false);   // Round 10: purchase sheet
  const [punchStart, setPunchStart] = useStateC(false); // booking opened via "use my card"
  const [walletOpen, setWalletOpen] = useStateC(false); // Round E2: the card wallet sheet
  const [presetCard, setPresetCard] = useStateC(null);  // Round E2: book straight from one card
  const [reschedule, setReschedule] = useStateC(null); // appt being rescheduled
  const [confirmCancel, setConfirmCancel] = useStateC(null); // appt id awaiting cancel confirmation
  const [regionPrompt, setRegionPrompt] = useStateC(false);
  const [contact, setContact] = useStateC(false);
  const [leaveAlert, setLeaveAlert] = useStateC(false);
  const [success, setSuccess] = useStateC(null);
  const [healthDecl, setHealthDecl] = useStateC(null); // Round 12: pending laser health declaration
  const [upsell, setUpsell] = useStateC(null);
  const [confetti, setConfetti] = useStateC(0);
  const [waitFreed, setWaitFreed] = useStateC(null);
  const [claimReq, setClaimReq] = useStateC(null); // waitlist slot the client chose to claim
  const [fading, setFading] = useStateC({});
  const [undo, setUndo] = useStateC(null);
  const timers = useRefC({});

  // make the seeded upcoming appointment real on the shared calendar, so cancelling it
  // visibly frees the slot for the barber & manager too
  useEffectC(() => {
    if (!addAppt || (globalAppts || []).some(a => a.id === 'seed1')) return;
    // Demo seed: only the recognised demo customer (Daniel, 050-333-3333) starts with an
    // example upcoming appointment. A brand-new customer begins with a clean, empty slate.
    if (!(session && (session.phone || '').replace(/[^0-9]/g, '') === '0503333333')) return;
    const d = new Date(); d.setDate(d.getDate() + 1);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    addAppt({ id: 'seed1', barberId: 'p1', date: ds, start: '10:15', svc: 's2', clientId: 'me', clientPhone: '0503333333', clientHe: 'דניאל אבני', clientEn: 'Daniel Avni', phone: '+972503333333', status: 'confirmed' });
  }, []);

  // Round 12: first laser treatment requires a signed health declaration BEFORE approval.
  // "First time" is derived from the client's treatment history + whether a declaration was ever signed.
  const hasLaserHistory = () => (globalAppts || []).some(a => a.clientId === 'me' && window.isLaserService && window.isLaserService(a.svc) && !['rejected', 'cancelled', 'pending', 'awaiting-declaration'].includes(a.status));
  const needsHealthDecl = (svc) => !!(window.isLaserService && window.isLaserService(svc) && window.healthStore && !window.healthStore.signed('me') && !hasLaserHistory());
  const meApptBase = (data, id) => { const ph = ((session && session.phone) || '').replace(/[^0-9]/g, ''); return ({ id, barberId: data.barber.id, date: data.date, start: data.slot.replace('x', ''), svc: data.service.id, clientId: 'me', clientPhone: ph,
    clientHe: (session && session.name) || 'דניאל אבני', clientEn: (session && session.name) || 'Daniel Avni', phone: ph ? ('+972' + ph.replace(/^0/, '')) : '+972500000000', paid: data.paid, punchCardId: data.punchCardId }); };

  const onConfirm = (data) => {
    setBooking(false);
    setPunchStart(false);
    const manual = !(window.autoConfirmOn ? window.autoConfirmOn() : true);
    const id = 'bk' + Date.now();
    // first laser → park the booking as "awaiting-declaration" (holds the slot only provisionally),
    // open the health form. The normal approval flow resumes after the declaration is submitted.
    if (needsHealthDecl(data.service)) {
      if (addAppt && data.date) addAppt({ ...meApptBase(data, id), status: 'awaiting-declaration', needsDeclaration: true });
      setHealthDecl({ apptId: id, data, manual, stage: 'gate' });
      return;
    }
    setSuccess({ ...data, pending: manual });
    if (!manual) setConfetti(c => c + 1);
    notify();
    // place it on the shared calendar (pending if the barber requires manual approval), single source of truth
    if (addAppt && data.date) {
      // Round C: if the client chose a recurring cadence, generate the full series in one go.
      // The first appt may be pending (manual approval); the future slots are pre-confirmed and
      // marked "קבוע" in the calendar. All share a recurringId so the series can be managed as a unit.
      if (data.recurFreq) {
        const rid = 'recur' + Date.now();
        const freqDays = { weekly: 7, biweekly: 14, monthly: 30 };
        const seriesLen = { weekly: 8, biweekly: 6, monthly: 3 };
        const days = freqDays[data.recurFreq];
        const count = seriesLen[data.recurFreq];
        const pad2 = n => String(n).padStart(2, '0');
        const first = { ...meApptBase(data, id), status: manual ? 'pending' : 'confirmed', recurringId: rid, recurringFreq: data.recurFreq, recurringSerial: 0 };
        addAppt(first);
        if (onNewRequest) onNewRequest(first);
        for (let k = 1; k <= count; k++) {
          const d = new Date(data.date + 'T00:00:00');
          d.setDate(d.getDate() + k * days);
          const ds = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
          addAppt({ ...meApptBase({ ...data, date: ds }, 'bk' + (Date.now() + k * 997)), status: 'confirmed', recurringId: rid, recurringFreq: data.recurFreq, recurringSerial: k });
        }
      } else {
        const appt = { ...meApptBase(data, id), status: manual ? 'pending' : 'confirmed' };
        addAppt(appt);
        if (onNewRequest) onNewRequest(appt);
      }
    }
  };

  // Round D - book the whole CART at once. Each item becomes its own appointment sharing a
  // cartId; for sequential they share the barber with staggered starts, for parallel each item
  // already carries its assigned barber. Punch-marked items are paid via the card.
  const onConfirmCart = (result) => {
    const manual = !(window.autoConfirmOn ? window.autoConfirmOn() : true);
    (result.items || []).forEach((it, k) => {
      const id = 'bk' + (Date.now() + k * 131);
      const data = { barber: it.barber, service: it.svc, date: result.date, slot: 'x' + it.start, paid: it.punch ? 'punch' : (result.prepaid ? 'prepaid' : undefined), punchCardId: it.punchCardId };
      const appt = { ...meApptBase(data, id), status: manual ? 'pending' : 'confirmed', cartId: result.cartId };
      addAppt(appt);
      if (k === 0 && onNewRequest) onNewRequest(appt);
    });
    notify();
    setConfetti(c => c + 1);
    toast && toast(
      lang === 'he' ? `${result.items.length} תורים נקבעו ✓` : `${result.items.length} appointments booked ✓`,
      manual ? (lang === 'he' ? 'ממתינים לאישור הספר' : 'Awaiting approval') : (lang === 'he' ? 'נשלח אישור' : 'Confirmation sent')
    );
  };

  // declaration submitted DIGITALLY → store the signed document (with answers) on the customer card
  const submitHealthDecl = (form) => {
    const d = healthDecl; if (!d) return;
    if (window.healthStore) window.healthStore.sign('me', { apptId: d.apptId, svcId: d.data.service.id, svcHe: d.data.service.he, svcEn: d.data.service.en, barberId: d.data.barber.id, clientName: (session && session.name) || window.__meName || '', clientPhone: (session && session.phone) || '', manual: false, ...form });
    const manual = d.manual;
    const status = manual ? 'pending' : 'confirmed';
    if (updateApptTime) updateApptTime(d.apptId, { status, needsDeclaration: undefined });
    const appt = { ...meApptBase(d.data, d.apptId), status };
    if (onNewRequest) onNewRequest(appt);
    setHealthDecl(null);
    setSuccess({ ...d.data, pending: manual });
    if (!manual) setConfetti(c => c + 1);
    notify();
    toast && toast(lang === 'he' ? 'ההצהרה נשלחה ✓' : 'Declaration submitted ✓', lang === 'he' ? 'נשמרה בכרטיס הלקוח כמסמך' : 'Saved to your customer card');
  };

  // escape path: client states they ALREADY filled a declaration in-shop → mark MANUALLY
  // (no form, no answers), flag as having a declaration, and let the booking proceed.
  const confirmManualDecl = () => {
    const d = healthDecl; if (!d) return;
    const he = lang === 'he';
    if (window.healthStore) window.healthStore.sign('me', { apptId: d.apptId, svcId: d.data.service.id, svcHe: d.data.service.he, svcEn: d.data.service.en, barberId: d.data.barber.id, clientName: (session && session.name) || window.__meName || '', clientPhone: (session && session.phone) || '', manual: true, date: new Date().toLocaleDateString(he ? 'he-IL' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }), confirmedText: he ? 'הלקוח הצהיר שמילא הצהרת בריאות במספרה בעבר' : 'Client stated a declaration was completed in-shop previously' });
    const manual = d.manual;
    const status = manual ? 'pending' : 'confirmed';
    if (updateApptTime) updateApptTime(d.apptId, { status, needsDeclaration: undefined });
    const appt = { ...meApptBase(d.data, d.apptId), status };
    if (onNewRequest) onNewRequest(appt);
    setHealthDecl(null);
    setSuccess({ ...d.data, pending: manual });
    if (!manual) setConfetti(c => c + 1);
    notify();
    toast && toast(he ? 'אושר ✓' : 'Confirmed ✓', he ? 'סומן שיש הצהרת בריאות בתיק · לא תתבקש שוב' : 'Marked as having a declaration on file');
  };

  // resume an unfinished declaration from the appointments list
  const resumeHealthDecl = (ap) => {
    const service = ap.service || DATA.services.find(s => s.id === ap.svc);
    const barber = ap.barber || (staff || DATA.barbers).find(b => b.id === ap.barberId) || DATA.barbers[0];
    const manual = !(window.autoConfirmOn ? window.autoConfirmOn() : true);
    setHealthDecl({ apptId: ap.id, data: { barber, service, day: ap.day || dayLabel(ap.date), date: ap.date, slot: ap.slot }, manual, stage: 'gate' });
  };

  // ── Waitlist race wiring ──
  // claim a freed slot by booking it straight away (single source: onConfirm).
  // Round #4: a waitlist win is ALWAYS a regular paid visit - never a punch, even if the
  // slot that freed up was originally punched from someone else's card. We force paid off.
  const claimWaitlist = (barberObj, svcId, date, hhmm) => {
    const service = DATA.services.find(s => s.id === svcId) || DATA.services[0];
    onConfirm({ barber: barberObj, service, date, day: dayLabel(date), slot: 'x' + hhmm, paid: undefined, punchCardId: undefined, fromWaitlist: true });
  };
  // simulate a freed slot (a competing client cancelled) + an alternative, then
  // offer it to the waiters as a live race over a REAL atomic lock.
  const fireWaitlistOffer = (barberObj, date, svcId, opts = {}) => {
    if (!barberObj) return;
    const occ = (globalAppts || []).filter(a => a.barberId === barberObj.id && a.date === date && a.status !== 'no' && a.status !== 'rejected' && a.status !== 'cancelled').map(a => a.start).sort();
    const uniq = [...new Set(occ)];
    const start = opts.start || uniq[0] || '12:00';
    const alt = opts.alt !== undefined ? opts.alt : (uniq.length > 1 ? uniq[Math.min(2, uniq.length - 1)] : null);
    // fresh race: clear any stale lock on this slot so the claim is decided live
    if (window.waitlist) { window.waitlist.purgeLocks(); window.waitlist.clearLock(barberObj.id, date, start); if (alt) window.waitlist.clearLock(barberObj.id, date, alt); }
    const queue = window.waitlist ? window.waitlist.queueFor(barberObj.id, date) : [];
    setWaitFreed({ barber: barberObj, date, svc: svcId || 's1', start, alt, meId: 'me', rivalId: 'rival', wasPunch: !!opts.wasPunch, waiters: Math.max(2, queue.length || (2 + Math.floor(Math.random() * 3))) });
    try { window.playChime && window.playChime(true); } catch (e) {}
  };
  const onWaitlistJoin = ({ barberId, date, svc }) => {
    const b = (staff || DATA.barbers).find(x => x.id === barberId);
    // a beat later, a slot frees up and all waiters are paged at once
    setTimeout(() => { setBooking(false); fireWaitlistOffer(b, date, svc); }, 1800);
  };

  // Round D2: multi-booking is only offered when the manager has flagged at least one
  // bookable service as "allowed in multi-booking". Zero flagged → no split screen,
  // "קביעת תור" goes straight into the single-appointment flow.
  const multiSvcCount = (DATA.services || []).filter(s => !s.punchOnly && (window.cartMultiOk ? window.cartMultiOk(s) : s.multiOk !== false)).length;
  const multiEnabled = multiSvcCount >= 1;
  // open the booking entry: the split screen when multi is enabled, else single flow
  const openBookEntry = () => { if (multiEnabled) setBookChoice(true); else setBooking(true); };

  const startBooking = (opts = {}) => {
    if (window.shabbat && window.shabbat.isNow()) { notify && notify(); return; }
    if (session && !session.region && !session.address) { setRegionPrompt(true); return; }
    // skipChoice: jump straight into the single-appointment flow
    if (opts.skipChoice) { setBooking(true); return; }
    openBookEntry();
  };
  // Round E2: book straight from one specific wallet card (single flow, punch mode)
  const bookFromCard = (card) => {
    setWalletOpen(false);
    if (window.shabbat && window.shabbat.isNow()) { notify && notify(); return; }
    setPresetCard(card); setPunchStart(true);
    if (session && !session.region && !session.address) { setRegionPrompt(true); return; }
    setBooking(true);
  };

  // reschedule: reopen the calendar/time picker for an existing appointment
  const startReschedule = (ap) => {
    setConfirmCancel(null);
    setReschedule(ap);
  };
  const rescheduleService = (ap) => ap.service || DATA.services.find(s => s.id === ap.svc) || DATA.services[0];
  const rescheduleBarber = (ap) => ap.barber || DATA.barbers[0];
  const onRescheduleConfirm = (ap, data) => {
    setReschedule(null);
    const manual = !(window.autoConfirmOn ? window.autoConfirmOn() : true);
    if (updateApptTime && data.date) updateApptTime(ap.id, { date: data.date, start: data.slot.replace('x', ''), status: manual ? 'pending' : 'confirmed', rejectMsg: undefined });
    setSuccess({ ...data, rescheduled: true, pending: manual });
    if (!manual) setConfetti(c => c + 1);
    notify();
  };

  // cancel with explicit confirmation, then fade → free the shared slot → undo
  const requestCancel = (id) => setConfirmCancel(id);
  const cancel = (id) => {
    setConfirmCancel(null);
    const g = (globalAppts || []).find(a => a.id === id);
    if (g) timers.current['g' + id] = g;
    // §5 punch refund window: cancelling a punch booking inside the final hour BURNS the
    // punch (the booking stays as a burned-cancelled record so the balance does NOT return);
    // earlier than that the punch returns by itself (the booking is simply removed).
    const _mins = (() => { if (!g) return Infinity; try { const [h, m] = (g.start || '0:0').split(':').map(Number); const dt = new Date(g.date + 'T00:00:00'); dt.setHours(h, m, 0, 0); return (dt.getTime() - Date.now()) / 60000; } catch (e) { return Infinity; } })();
    const isPunch = !!(g && g.paid === 'punch' && g.punchCardId);
    const burned = isPunch && _mins < 60;
    setFading(f => ({ ...f, [id]: true }));
    timers.current[id] = setTimeout(() => {
      if (burned) { if (updateApptTime) updateApptTime(id, { status: 'cancelled', punchBurned: true }); timers.current['burn' + id] = true; }
      else { if (removeAppt) removeAppt(id); timers.current['rm' + id] = true; }
      if (window.custStore) window.custStore.bumpCancel('me');
      // Round #4 waitlist ripple: a slot just freed. This runs per-appointment, so cancelling
      // ONE item of a multi-booking cart frees only that slot and offers just it. If the freed
      // slot was punched from this client's card, flag it - the winner pays regular, never punch.
      if (g && window.waitlist) {
        const queue = window.waitlist.queueFor(g.barberId, g.date);
        if (queue.length) {
          const b = (staff || DATA.barbers).find(x => x.id === g.barberId);
          fireWaitlistOffer(b, g.date, g.svc, { start: g.start, wasPunch: g.paid === 'punch' });
        }
      }
      // alert the relevant barber (and Rafi, per his settings) that the client cancelled
      if (staffNotify && g) { const svc = DATA.services.find(s => s.id === g.svc); const cn = window.clientLabel ? window.clientLabel(g, lang) : (lang === 'he' ? g.clientHe : g.clientEn); staffNotify({ barberId: g.barberId, title: lang === 'he' ? 'תור בוטל' : 'Booking cancelled', body: `${cn} · ${g.start}${svc ? ' · ' + svc[lang] : ''}` }); }
      setFading(f => { const n = { ...f }; delete n[id]; return n; });
    }, 420);
    setUndo(id);
    timers.current['undo' + id] = setTimeout(() => setUndo(u => u === id ? null : u), 5200);
  };
  const doUndo = (id) => {
    clearTimeout(timers.current[id]); clearTimeout(timers.current['undo' + id]);
    setFading(f => { const n = { ...f }; delete n[id]; return n; });
    if (timers.current['rm' + id] && timers.current['g' + id] && addAppt) addAppt(timers.current['g' + id]);
    if (timers.current['burn' + id] && updateApptTime) updateApptTime(id, { status: (timers.current['g' + id] || {}).status || 'confirmed', punchBurned: undefined });
    delete timers.current['rm' + id]; delete timers.current['g' + id]; delete timers.current['burn' + id];
    setUndo(null);
  };

  // derive the customer's upcoming list from the shared calendar (survives role switches)
  const _pad = n => String(n).padStart(2, '0');
  const _today = (() => { const d = new Date(); return `${d.getFullYear()}-${_pad(d.getMonth() + 1)}-${_pad(d.getDate())}`; })();
  const _tom = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${_pad(d.getMonth() + 1)}-${_pad(d.getDate())}`; })();
  const dayLabel = (date) => date === _today ? t.today : date === _tom ? t.tomorrow : new Date(date + 'T00:00').toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { weekday: 'short', day: 'numeric' });
  const _mePhone = ((session && session.phone) || '').replace(/[^0-9]/g, '');
  const myAppts = (globalAppts || [])
    .filter(a => a.clientId === 'me' && (a.id === 'seed1' ? _mePhone === '0503333333' : (!a.clientPhone || !_mePhone || a.clientPhone === _mePhone)) && a.status !== 'no' && a.status !== 'done' && a.status !== 'cancelled')
    .map(a => ({ id: a.id, cartId: a.cartId, svc: a.svc, service: DATA.services.find(s => s.id === a.svc), barber: (staff || DATA.barbers).find(b => b.id === a.barberId) || DATA.barbers[0], date: a.date, slot: 'x' + a.start, day: dayLabel(a.date), status: a.status || 'confirmed', rejectMsg: a.rejectMsg, paid: a.paid, fading: !!fading[a.id] }))
    .sort((x, y) => (x.date + x.slot).localeCompare(y.date + y.slot));

  // Round A: "navigate" opens the OS app chooser (all installed nav apps), not Waze directly
  const [navChooser, setNavChooser] = React.useState(false);
  const openWaze = () => setNavChooser(true);

  // rebook cadence, derived from this client's CRM visit frequency (not a fixed guess)
  const meCust = (session && DATA.customers.find(c => c.phone && (c.phone === session.phone || c.phone.replace(/^0/, '972') === (session.phone || '').replace(/^0/, '972'))))
    || (session && DATA.customers.find(c => c.he === session.name || c.en === session.name))
    || { visits: 5 };
  const rebookDays = (window.rebookInterval ? window.rebookInterval(meCust) : 28);

  // ── Round E2: punch-card WALLET for the logged-in client ──
  const myPunchCards = window.punchStore ? window.punchStore.usableCards('me', globalAppts) : [];
  const punchProp = myPunchCards.length ? { cards: myPunchCards } : null;
  const mustPrepay = window.punchStore ? window.punchStore.prepayRequired('me') : false;

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--cream-bg)', overflow: 'hidden' }}>
      {waitFreed && (
        <WaitlistOffer lang={lang} accent={accent} serif={serif} offer={waitFreed}
          onWin={() => { const wf = waitFreed; setWaitFreed(null); if (window.waitlist) window.waitlist.remove(x => x.clientId === 'me' && x.barberId === wf.barber.id && x.date === wf.date); claimWaitlist(wf.barber, wf.svc, wf.date, wf.start); }}
          onAlternative={(alt) => { const wf = waitFreed; setWaitFreed(null); if (window.waitlist) window.waitlist.remove(x => x.clientId === 'me' && x.barberId === wf.barber.id && x.date === wf.date); claimWaitlist(wf.barber, wf.svc, wf.date, alt); }}
          onReturn={() => { const wf = waitFreed; if (window.waitlist && wf.barber) window.waitlist.join({ barberId: wf.barber.id, date: wf.date, clientId: 'me', svc: wf.svc }); setWaitFreed(null); toast && toast(lang === 'he' ? 'נשארת ברשימת ההמתנה' : 'Still on the waitlist', lang === 'he' ? 'נעדכן בפעם הבאה שמתפנה תור' : "We'll ping you next time a slot frees"); }}
          onRemove={() => { const wf = waitFreed; if (window.waitlist && wf.barber) window.waitlist.remove(x => x.clientId === 'me' && x.barberId === wf.barber.id && x.date === wf.date); setWaitFreed(null); toast && toast(lang === 'he' ? 'הוסרת מרשימת ההמתנה' : 'Removed from the waitlist', lang === 'he' ? 'לא נעדכן יותר על חלון זה' : "We won't ping you about this window"); }}
          onRelease={() => setWaitFreed(null)} />
      )}
      {window.shabbat && window.shabbat.isNow() && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 45, background: 'linear-gradient(140deg,#14305A,#0B1E3D)', padding: '46px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 6px 18px rgba(11,30,61,0.25)' }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(228,201,123,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="spark" size={18} color="#E4C97B" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 15, color: '#FBF9F5' }}>{lang === 'he' ? 'שבת שלום 🕯️' : 'Shabbat Shalom 🕯️'}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(251,249,245,0.7)', marginTop: 1 }}>{lang === 'he' ? 'המספרה סגורה · קביעת תורים תיפתח בצאת השבת' : 'Closed · booking reopens after Shabbat'}</div>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
        {tab === 'home' && <HomeScreen lang={lang} t={t} accent={accent} serif={serif} products={products}
          onBook={startBooking} onNav={openWaze} onVisits={() => setTab('appts')}
          onContact={() => setContact(true)} onShop={() => setTab('shop')} onBell={notify}
          consentInvite={<ConsentInvite lang={lang} accent={accent} serif={serif} updateSession={updateSession}
            hasVisited={(myAppts || []).some(a => a.status === 'done' || a.status === 'confirmed' || a.status === 'now' || a.date < (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })())} />}
          promo={window.PunchPromoBanner ? <PunchPromoBanner lang={lang} accent={accent} serif={serif} appts={globalAppts} staff={staff}
            onBuy={() => setPunchBuy(true)} onUseCard={() => { setPresetCard(null); setPunchStart(true); startBooking(); }}
            onOpenWallet={() => setWalletOpen(true)} /> : null} />}
        {tab === 'shop' && <ShopScreen lang={lang} t={t} accent={accent} serif={serif} products={products} />}
        {tab === 'appts' && <ApptsScreen lang={lang} t={t} accent={accent} serif={serif} appts={myAppts}
          onRequestCancel={requestCancel} onConfirmCancel={cancel} onAbortCancel={() => setConfirmCancel(null)} confirmCancel={confirmCancel}
          onReschedule={startReschedule} onLeaveAlert={() => setLeaveAlert(true)} onFillDeclaration={resumeHealthDecl} />}
        {tab === 'profile' && <ProfileScreen lang={lang} t={t} accent={accent} serif={serif} session={session} updateSession={updateSession} onLogout={onLogout} appts={globalAppts} staff={staff} onBookCard={bookFromCard} onBuyCard={() => setPunchBuy(true)} onChangeLang={onChangeLang} />}
      </div>

      {!booking && !bookChoice && !reschedule && !success && !claimReq && <TabBar tab={tab} setTab={setTab} t={t} accent={accent} />}

      {contact && <ContactSheet lang={lang} t={t} accent={accent} onClose={() => setContact(false)} />}
      {navChooser && window.NavChooserSheet && <NavChooserSheet lang={lang} accent={accent} serif={serif} onClose={() => setNavChooser(false)} />}

      {/* undo bar */}
      {undo && (
        <div className="undo-in" style={{ position: 'absolute', left: 16, right: 16, bottom: 96, zIndex: 55, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(11,30,61,0.94)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: '13px 16px', boxShadow: '0 14px 36px rgba(11,30,61,0.35)' }}>
          <Icon name="check" size={18} color="rgba(251,249,245,0.7)" />
          <span style={{ flex: 1, color: '#FBF9F5', fontSize: 14, fontWeight: 500 }}>{(timers.current['g' + undo] || {}).paid === 'prepaid' ? (lang === 'he' ? 'בוטל · החזר יטופל ידנית' : 'Cancelled · refund coming') : t.cancelled}</span>
          <button onClick={() => doUndo(undo)} style={{ background: 'none', border: 'none', color: '#E4C97B', fontWeight: 700, fontSize: 14, font: 'inherit', cursor: 'pointer' }}>{t.undo}</button>
        </div>
      )}

      {bookChoice && <BookEntryChoice lang={lang} accent={accent} serif={serif}
        onClose={() => setBookChoice(false)}
        onSingle={() => { setBookChoice(false); setBooking(true); }}
        onMulti={() => { setBookChoice(false); setPunchStart(false); setCart({ service: null }); }} />}
      {booking && <BookingFlow lang={lang} t={t} accent={accent} order={cfg.bookingOrder} serif={serif} taglines={taglines} staff={staff} appts={globalAppts} onClose={() => { setBooking(false); setPunchStart(false); setPresetCard(null); }} onConfirm={onConfirm} onWaitlistJoin={onWaitlistJoin}
        punch={punchProp} punchStart={punchStart} presetCard={presetCard} mustPrepay={mustPrepay} />}
      {cart && window.CartFlow && <CartFlow lang={lang} t={t} accent={accent} serif={serif} taglines={taglines} staff={staff} appts={globalAppts}
        startService={cart.service} punch={punchProp} mustPrepay={mustPrepay} clientName={(session && session.name) || window.__meName || ''} clientPhone={(session && session.phone) || ''}
        onClose={() => setCart(null)} onConfirmCart={onConfirmCart} />}
      {reschedule && <BookingFlow lang={lang} t={t} accent={accent} order={cfg.bookingOrder} serif={serif} taglines={taglines} staff={staff} appts={globalAppts}
        presetBarber={rescheduleBarber(reschedule)} presetService={rescheduleService(reschedule)} startKey="time" rescheduleMode
        onClose={() => setReschedule(null)} onConfirm={(data) => onRescheduleConfirm(reschedule, data)} />}
      {claimReq && <BookingFlow lang={lang} t={t} accent={accent} order={cfg.bookingOrder} serif={serif} taglines={taglines} staff={staff} appts={globalAppts}
        presetBarber={claimReq.barber} presetService={claimReq.service} startKey={claimReq.service ? 'time' : 'service'}
        onClose={() => setClaimReq(null)} onConfirm={(data) => { setClaimReq(null); onConfirm(data); }} />}
      {regionPrompt && <RegionPrompt lang={lang} t={t} accent={accent} serif={serif} session={session}
        onSkip={() => { setRegionPrompt(false); presetCard ? setBooking(true) : openBookEntry(); }}
        onSave={(origin) => { updateSession && updateSession({ origin: origin.mode }); setRegionPrompt(false); presetCard ? setBooking(true) : openBookEntry(); }} />}
      {healthDecl && healthDecl.stage === 'gate' && window.HealthDeclGate && <HealthDeclGate lang={lang} accent={accent} serif={serif}
        clientName={(session && session.name) || window.__meName} service={healthDecl.data.service}
        onClose={() => setHealthDecl(null)}
        onFill={() => setHealthDecl(h => ({ ...h, stage: 'form' }))}
        onAlreadyFilled={confirmManualDecl} />}
      {healthDecl && healthDecl.stage === 'form' && window.HealthDeclarationSheet && <HealthDeclarationSheet lang={lang} t={t} accent={accent} serif={serif}
        clientName={(session && session.name) || window.__meName} service={healthDecl.data.service}
        onClose={() => setHealthDecl(h => ({ ...h, stage: 'gate' }))} onSubmit={submitHealthDecl} />}
      {success && <SuccessScreen lang={lang} t={t} accent={accent} serif={serif} booking={success} rebookDays={rebookDays} onRebook={() => { setSuccess(null); setBooking(true); }} onDone={() => {
        if (success.rescheduled || success.pending) { setSuccess(null); setTab('appts'); return; }
        const up = pickUpsell(products, success.service);
        setSuccess(null);
        if (up) setUpsell(up); else setTab('appts');
      }} />}
      {upsell && <UpsellBanner lang={lang} t={t} accent={accent} serif={serif} product={upsell}
        onShop={() => { setUpsell(null); setTab('shop'); }}
        onSkip={() => { setUpsell(null); setTab('appts'); }} />}
      {walletOpen && window.PunchWalletSheet && <PunchWalletSheet lang={lang} accent={accent} serif={serif} appts={globalAppts} staff={staff}
        onClose={() => setWalletOpen(false)} onBook={bookFromCard} onBuy={() => { setWalletOpen(false); setPunchBuy(true); }} />}
      {punchBuy && window.PunchPurchaseSheet && <PunchPurchaseSheet lang={lang} accent={accent} serif={serif} staff={staff}
        onClose={() => setPunchBuy(false)}
        onPurchased={(pkg, card) => { setPunchBuy(false); setConfetti(c => c + 1); toast && toast(lang === 'he' ? 'הכרטיסייה פעילה! ✂️' : 'Card active! ✂️', lang === 'he' ? `${(pkg && pkg.punches) || 10} ניקובים · ${pkg ? pkg.he : ''} · בארנק שלך` : `${(pkg && pkg.punches) || 10} punches · in your wallet`); }} />}
      {leaveAlert && <div className="screen-swap"><TimeToLeave lang={lang} t={t} accent={accent} serif={serif} address={session && session.address} session={session} initialOrigin={session && session.origin} onBack={() => setLeaveAlert(false)} /></div>}
      <Confetti fire={confetti} z={90} />
    </div>
  );
}

Object.assign(window, { CustomerApp });
