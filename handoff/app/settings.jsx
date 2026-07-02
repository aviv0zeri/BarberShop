// settings.jsx, Round 6 part 5: admin settings, regrouped by topic
// Clear section headers; every setting says plainly what it does.
// Exports: SettingsScreen
const { useState: useSet } = React;

const _load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } };
const _save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

function SetGroup({ icon, title, sub, accent, serif, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '2px 2px 10px' }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(200,162,74,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={icon} size={16} color={accent} /></span>
        <div>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 16, color: '#0B1E3D', lineHeight: 1.1 }}>{title}</div>
          {sub && <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 1 }}>{sub}</div>}
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 3px 12px rgba(11,30,61,0.05)' }}>{children}</div>
    </div>
  );
}

function SetField({ label, hint, value, onChange, he, ltr, placeholder, last }) {
  return (
    <div style={{ padding: '12px 15px', borderBottom: last ? 'none' : '1px solid rgba(11,30,61,0.06)' }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0B1E3D' }}>{label}</div>
      {hint && <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.45)', marginTop: 1, marginBottom: 7 }}>{hint}</div>}
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 14.5, color: '#0B1E3D', background: 'rgba(11,30,61,0.03)', border: '1px solid rgba(11,30,61,0.1)', borderRadius: 11, padding: '10px 12px', outline: 'none', marginTop: hint ? 0 : 7, direction: ltr ? 'ltr' : (he ? 'rtl' : 'ltr'), textAlign: 'start' }} />
    </div>
  );
}

function SetToggle({ label, hint, on, onToggle, accent, last }) {
  return (
    <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'start', border: 'none', borderBottom: last ? 'none' : '1px solid rgba(11,30,61,0.06)', background: 'none', font: 'inherit', cursor: 'pointer', padding: '13px 15px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0B1E3D' }}>{label}</div>
        {hint && <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 2, lineHeight: 1.4 }}>{hint}</div>}
      </div>
      <span style={{ width: 46, height: 28, borderRadius: 15, padding: 3, flexShrink: 0, background: on ? accent : 'rgba(11,30,61,0.18)', display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start', transition: 'all .2s' }}>
        <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} />
      </span>
    </button>
  );
}

function SetLink({ icon, label, hint, accent, onClick, danger, last }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'start', border: 'none', borderBottom: last ? 'none' : '1px solid rgba(11,30,61,0.06)', background: 'none', font: 'inherit', cursor: 'pointer', padding: '13px 15px' }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, background: danger ? 'rgba(176,58,58,0.1)' : 'rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={icon} size={17} color={danger ? '#B03A3A' : accent} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: danger ? '#B03A3A' : '#0B1E3D' }}>{label}</div>
        {hint && <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 1 }}>{hint}</div>}
      </div>
      {!danger && <Icon name="chevron" size={16} color="rgba(11,30,61,0.3)" style={{ transform: 'var(--chev)' }} />}
    </button>
  );
}

function SettingsScreen({ lang, t, accent, serif, onBack, go, onLogout }) {
  const he = lang === 'he';
  const [shop, setShop] = useSet(() => _load('royale_shopinfo_v1', {
    name: he ? 'מספרפי · אוסישקין' : 'Barbershop · Ussishkin',
    addr: he ? 'אוסישקין 41, ירושלים' : '41 Ussishkin St, Jerusalem',
    phone: DATA.contact.phoneDisp, hours: he ? 'א׳-ה׳ 09:00-21:00 · ו׳ 09:00-14:00' : 'Sun-Thu 09-21 · Fri 09-14',
  }));
  const [biz, setBiz] = useSet(() => _load('royale_bizsettings_v1', { autoConfirm: true, remindDayBefore: true, allowCancel: true, slot15: true, shabbatMode: false, channel: 'whatsapp', confirmChannels: { whatsapp: true, banner: true, sms: false, email: false }, bookWindowWeeks: 4 }));
  const setShopK = (k, v) => setShop(p => { const n = { ...p, [k]: v }; _save('royale_shopinfo_v1', n); return n; });
  const cc = biz.confirmChannels || { whatsapp: true, banner: true };
  const toggleConfirmCh = (k) => setBiz(p => { const n = { ...p, confirmChannels: { ...(p.confirmChannels || { whatsapp: true, banner: true }), [k]: !((p.confirmChannels || {})[k]) } }; _save('royale_bizsettings_v1', n); return n; });
  const toggleBiz = (k) => setBiz(p => { const n = { ...p, [k]: !p[k] }; _save('royale_bizsettings_v1', n); return n; });
  const setChannel = (v) => setBiz(p => { const n = { ...p, channel: v }; _save('royale_bizsettings_v1', n); return n; });
  const setWindow = (w) => setBiz(p => { const n = { ...p, bookWindowWeeks: w }; _save('royale_bizsettings_v1', n); return n; });
  const unlimited = biz.bookWindowWeeks === 'unlimited';
  const winWeeks = unlimited ? null : (biz.bookWindowWeeks || 4);
  // Round H2 · social-marketing nudge switches (live from marketingStore)
  const [, _mktV] = useSet(0);
  const mktOn = (id) => window.marketingStore ? marketingStore.isNudgeOn(id) : true;
  const toggleMkt = (id) => { if (window.marketingStore) { marketingStore.setNudgeOn(id, !marketingStore.isNudgeOn(id)); _mktV(n => n + 1); } };

  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל' : 'Admin'} title={he ? 'הגדרות' : 'Settings'} onBack={onBack} />
      <Body style={{ gap: 22 }}>
        {/* 1 · the shop */}
        <SetGroup icon="pin" title={he ? 'המספרה' : 'The shop'} sub={he ? 'הפרטים שמופיעים ללקוחות' : 'Details customers see'} accent={accent} serif={serif}>
          <SetField label={he ? 'שם המספרה' : 'Shop name'} value={shop.name} onChange={v => setShopK('name', v)} he={he} />
          <SetField label={he ? 'כתובת' : 'Address'} hint={he ? 'משמש גם לניווט בוויז' : 'Used for Waze navigation'} value={shop.addr} onChange={v => setShopK('addr', v)} he={he} />
          <SetField label={he ? 'טלפון' : 'Phone'} value={shop.phone} onChange={v => setShopK('phone', v)} he={he} ltr />
          <SetField label={he ? 'שעות פעילות' : 'Opening hours'} value={shop.hours} onChange={v => setShopK('hours', v)} he={he} last />
        </SetGroup>

        {/* 2 · bookings */}
        <SetGroup icon="calendar" title={he ? 'הזמנות ותורים' : 'Bookings'} sub={he ? 'איך תורים נקבעים ומתנהלים' : 'How appointments are made'} accent={accent} serif={serif}>
          <SetToggle label={he ? 'אישור אוטומטי של תורים' : 'Auto-confirm bookings'} hint={he ? 'תור חדש מתאשר מיד, בלי אישור ידני' : 'New bookings confirm instantly, no manual approval'} on={biz.autoConfirm} onToggle={() => toggleBiz('autoConfirm')} accent={accent} />
          <SetToggle label={he ? 'תזכורת יום לפני' : 'Reminder day before'} hint={he ? 'נשלחת ללקוח אוטומטית 24 שעות לפני התור' : 'Sent to the client automatically 24h before'} on={biz.remindDayBefore} onToggle={() => toggleBiz('remindDayBefore')} accent={accent} />
          <SetToggle label={he ? 'ביטול תור עצמאי' : 'Self-service cancellation'} hint={he ? 'הלקוח יכול לבטל תור דרך האפליקציה' : 'Clients can cancel from the app themselves'} on={biz.allowCancel} onToggle={() => toggleBiz('allowCancel')} accent={accent} />
          <SetToggle label={he ? 'יומן ברזולוציית 15 דקות' : '15-minute calendar grid'} hint={he ? 'כל שעה מחולקת לארבעה רבעים' : 'Each hour split into four quarters'} on={biz.slot15} onToggle={() => toggleBiz('slot15')} accent={accent} />
          <div style={{ padding: '13px 15px' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0B1E3D' }}>{he ? 'חלון הזמנה קדימה' : 'Booking window'}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 1, marginBottom: 9 }}>{he ? 'כמה זמן קדימה לקוח יכול לקבוע תור. מעבר לכך, לא ניתן.' : 'How far ahead clients may book. Beyond this, not allowed.'}</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {[2, 4, 6, 8].map(w => (
                <button key={w} onClick={() => setWindow(w)} style={{ flex: '1 1 18%', padding: '10px 0', borderRadius: 11, cursor: 'pointer', font: 'inherit', fontSize: 13.5, fontWeight: 700, border: `1.5px solid ${(!unlimited && winWeeks === w) ? accent : 'rgba(11,30,61,0.12)'}`, background: (!unlimited && winWeeks === w) ? accent + '14' : '#fff', color: '#0B1E3D' }}>{w} {he ? 'שב׳' : 'wk'}</button>
              ))}
              <button onClick={() => setWindow('unlimited')} style={{ flex: '1 1 38%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', borderRadius: 11, cursor: 'pointer', font: 'inherit', fontSize: 13.5, fontWeight: 700, border: `1.5px solid ${unlimited ? accent : 'rgba(11,30,61,0.12)'}`, background: unlimited ? accent + '14' : '#fff', color: '#0B1E3D' }}><Icon name="refresh" size={14} color={unlimited ? accent : 'rgba(11,30,61,0.4)'} />{he ? 'ללא הגבלה' : 'Unlimited'}</button>
            </div>
            {unlimited && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 10, background: 'rgba(200,162,74,0.1)', border: `1px solid ${accent}33`, borderRadius: 11, padding: '9px 11px' }}>
                <Icon name="refresh" size={15} color="#9C7B2E" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.7)', lineHeight: 1.5 }}>{he ? 'תורים חוזרים נשארים שמורים אוטומטית - לקוח רגיל לא יוכל לקבוע על חריץ של תור קבוע, גם בלי הגבלת חלון.' : 'Recurring bookings stay auto-reserved - a regular client can never take a recurring slot, even with no window limit.'}</div>
              </div>
            )}
          </div>
        </SetGroup>

        {/* 2b · Shabbat mode */}
        <SetGroup icon="clock" title={he ? 'מצב שבת' : 'Shabbat mode'} sub={he ? 'סגירה אוטומטית בכניסת השבת' : 'Auto-close for Shabbat'} accent={accent} serif={serif}>
          <SetToggle label={he ? 'מצב שבת אוטומטי' : 'Automatic Shabbat mode'} hint={he ? 'האפליקציה נכנסת למצב שבת בכניסת השבת וחוזרת בצאתה (כ-18:30 עד כ-19:45)' : 'Closes from Shabbat entry to exit (~18:30 to ~19:45)'} on={!!biz.shabbatMode} onToggle={() => toggleBiz('shabbatMode')} accent={accent} last />
        </SetGroup>

        {/* 3 · communication */}
        <SetGroup icon="message" title={he ? 'תקשורת עם לקוחות' : 'Client communication'} sub={he ? 'ערוץ ברירת מחדל ותבניות' : 'Default channel & templates'} accent={accent} serif={serif}>
          <div style={{ padding: '13px 15px', borderBottom: '1px solid rgba(11,30,61,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0B1E3D' }}>{he ? 'ערוץ ברירת מחדל' : 'Default channel'}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 1, marginBottom: 9 }}>{he ? 'חל רק על לקוחות שלא בחרו ערוץ בעצמם · בחירת הלקוח גוברת' : 'Applies only to clients who didn’t pick a channel · their choice overrides'}</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {[['whatsapp', 'WhatsApp', '#12a350', 'whatsapp'], ['sms', 'SMS', '#2A6FDB', 'message'], ['email', he ? 'אימייל' : 'Email', '#C8A24A', 'mail']].map(([id, lbl, c, ic]) => (
                <button key={id} onClick={() => setChannel(id)} style={{ flex: '1 1 30%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px', borderRadius: 11, cursor: 'pointer', font: 'inherit', fontSize: 13.5, fontWeight: 700, border: `1.5px solid ${biz.channel === id ? c : 'rgba(11,30,61,0.12)'}`, background: biz.channel === id ? c + '14' : '#fff', color: '#0B1E3D' }}>
                  <Icon name={ic} size={16} color={c} />{lbl}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 9, fontSize: 11, color: 'rgba(11,30,61,0.5)', fontWeight: 600 }}>
              <Icon name="bell" size={13} color="#8E5BD0" />{he ? 'באנר באפליקציה הוא שכבת בסיס - תמיד פעיל לכל הלקוחות.' : 'The in-app banner is the base layer - always on for every client.'}
            </div>
          </div>
          <div style={{ padding: '13px 15px', borderBottom: '1px solid rgba(11,30,61,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0B1E3D' }}>{he ? 'ערוצי אישור תור ללקוח' : 'Booking-confirmation channels'}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 1, marginBottom: 9 }}>{he ? 'באלו ערוצים הלקוח יקבל אוטומטית אישור/דחייה' : 'How clients automatically get approve/decline'}</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {[['whatsapp', 'WhatsApp', '#12a350', 'whatsapp'], ['sms', 'SMS', '#2A6FDB', 'message'], ['email', he ? 'אימייל' : 'Email', '#C8A24A', 'mail'], ['banner', he ? 'באנר' : 'Banner', '#8E5BD0', 'bell']].map(([id, lbl, c, ic]) => {
                const isBanner = id === 'banner';
                const on = isBanner ? true : cc[id] === true;
                return (
                  <button key={id} onClick={isBanner ? undefined : () => toggleConfirmCh(id)} style={{ flex: '1 1 40%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px', borderRadius: 11, cursor: isBanner ? 'default' : 'pointer', font: 'inherit', fontSize: 13.5, fontWeight: 700, border: `1.5px solid ${on ? c : 'rgba(11,30,61,0.12)'}`, background: on ? c + '14' : '#fff', color: '#0B1E3D' }}>
                    <span style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: `1.5px solid ${on ? c : 'rgba(11,30,61,0.2)'}`, background: on ? c : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && (isBanner ? <Icon name="check" size={11} color="#fff" stroke={2.6} /> : <Icon name="check" size={12} color="#fff" stroke={2.6} />)}</span>
                    <Icon name={ic} size={16} color={c} />{lbl}{isBanner && <span style={{ fontSize: 9.5, fontWeight: 800, color: c }}>{he ? '· תמיד' : '· always'}</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <SetLink icon="megaphone" label={he ? 'תבניות הודעה ושליחה' : 'Message templates & broadcast'} hint={he ? 'חירום, מזג אוויר, מבצע, תזכורת' : 'Emergency, weather, promo, reminder'} accent={accent} onClick={() => go('broadcast')} />
          <SetLink icon="refresh" label={he ? 'אוטומציות' : 'Automations'} hint={he ? 'תזכורות, לקוח רדום, יום הולדת, ביקורת' : 'Reminders, dormant, birthday, reviews'} accent={accent} onClick={() => go('automations')} />
          <SetLink icon="share" label={he ? 'שיווק לרשתות' : 'Social marketing'} hint={he ? 'מחולל פוסטים לפייסבוק ואינסטגרם' : 'Post generator for Facebook & Instagram'} accent={accent} onClick={() => go('socialmkt')} last />
        </SetGroup>

        {/* 4 · management shortcuts */}
        <SetGroup icon="gear" title={he ? 'ניהול ותוכן' : 'Management & content'} accent={accent} serif={serif}>
          <SetLink icon="scissors" label={he ? 'ניהול צוות' : 'Staff'} hint={he ? 'הוספה, השבתה ועריכת ספרים' : 'Add, disable & edit barbers'} accent={accent} onClick={() => go('staff')} />
          <SetLink icon="bag" label={he ? 'מוצרים ומלאי' : 'Products & stock'} accent={accent} onClick={() => go('products')} />
          <SetLink icon="coin" label={he ? 'הוצאות' : 'Expenses'} hint={he ? 'הוצאות קבועות וחד-פעמיות · הכנסה לאחר הוצאות' : 'Fixed & one-time costs'} accent={accent} onClick={() => go('expenses')} />
          <SetLink icon="chart" label={he ? 'שירותים ותוכן' : 'Services & content'} hint={he ? 'מחירון ומשפטי תדמית' : 'Price list & taglines'} accent={accent} onClick={() => go('services')} last />
        </SetGroup>

        {/* 4b · social-marketing nudges (Round H2) - can be switched off, some or all */}
        <SetGroup icon="share" title={he ? 'תזכורות שיווק' : 'Marketing nudges'} sub={he ? 'הצעות לפרסום בדשבורד · לא מפרסם לבד' : 'Post suggestions on the dashboard · never auto-posts'} accent={accent} serif={serif}>
          <SetToggle label={he ? 'היום החלש בשבוע' : 'Slowest day of week'} hint={he ? 'הצעה לפרסם מבצע ביום עם הכי מעט תורים' : 'Suggest an offer on your lowest-booking day'} on={mktOn('weakDay')} onToggle={() => toggleMkt('weakDay')} accent={accent} />
          <SetToggle label={he ? 'מבצע שמסתיים' : 'Promo ending soon'} hint={he ? 'תזכורת לפרסם לפני שכרטיסייה מסתיימת' : 'Remind followers before a card promo expires'} on={mktOn('promoEnding')} onToggle={() => toggleMkt('promoEnding')} accent={accent} />
          <SetToggle label={he ? 'מזמן לא פרסמת' : 'Content gone quiet'} hint={he ? 'רעיון לפוסט כשעבר זמן מאז הפרסום האחרון' : 'A post idea when it’s been a while'} on={mktOn('staleContent')} onToggle={() => toggleMkt('staleContent')} accent={accent} last />
        </SetGroup>

        {/* 5 · account */}
        <SetGroup icon="user" title={he ? 'חשבון' : 'Account'} accent={accent} serif={serif}>
          <SetLink icon="arrowL" label={he ? 'התנתקות' : 'Sign out'} hint={he ? 'יציאה מחשבון המנהל' : 'Leave the admin account'} accent={accent} danger onClick={() => onLogout && onLogout()} last />
        </SetGroup>
      </Body>
    </Shell>
  );
}

Object.assign(window, { SettingsScreen });
