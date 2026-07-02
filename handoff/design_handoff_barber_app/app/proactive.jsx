// proactive.jsx, Round 6: proactive communication layer
// The system knows who's affected by a change and offers a ready-to-edit message.
// Rafi or the barber always approves the wording before anything is sent.
// Exports: MSG_TEMPLATES, fillTemplate, NotifyClientSheet, CloseDaySheet, BossSheet
const { useState: usePC } = React;

// ── Ready-made template library (all categories editable) ──────────────
// {name} and {time} are filled in per-recipient; the barber can rewrite freely.
const MSG_TEMPLATES = [
  { id: 'emergency', icon: 'bell', color: '#B0413A', kind: 'operational',
    he: { cat: 'סגירת חירום / פיקוד העורף', title: 'סגירת חירום',
      body: 'שלום {name}, עקב הנחיות פיקוד העורף המספרה סגורה כעת. התור שלך ב{time} מבוטל, ניצור קשר לתיאום מועד חדש בהקדם. שמרו על עצמכם 🤍 מספרפי.' },
    en: { cat: 'Emergency / Home Front', title: 'Emergency closure',
      body: 'Hi {name}, due to Home Front Command guidance the shop is closed now. Your {time} appointment is cancelled, we\u2019ll reach out to rebook. Stay safe, Barbershop.' } },
  { id: 'weather', icon: 'navigate', color: '#2A6FDB', kind: 'operational',
    he: { cat: 'מזג אוויר / חסימת כבישים', title: 'שינוי עקב מזג אוויר',
      body: 'שלום {name}, עקב מזג האוויר וחסימות בכבישים אנחנו סוגרים מוקדם היום. התור שלך ב{time} יידחה, נתאם מולך מועד חדש. סליחה על אי הנוחות, מספרפי.' },
    en: { cat: 'Weather / road closure', title: 'Weather change',
      body: 'Hi {name}, due to the weather and road closures we\u2019re closing early today. Your {time} slot will be moved, we\u2019ll set a new time. Sorry for the trouble, Barbershop.' } },
  { id: 'promo', icon: 'spark', color: '#C8A24A', kind: 'marketing',
    he: { cat: 'מבצע', title: 'מבצע מיוחד',
      body: 'שלום {name}! מבצע החודש: תספורת + עיצוב זקן ב-20% הנחה. מוזמן לקבוע תור, נשמח לראותך. מספרפי.' },
    en: { cat: 'Promotion', title: 'Special offer',
      body: 'Hi {name}! This month: Cut + Beard at 20% off. Book a slot, we\u2019d love to see you. Barbershop.' } },
  { id: 'reminder', icon: 'clock', color: '#1F8A5B', kind: 'operational',
    he: { cat: 'תזכורת כללית', title: 'תזכורת לתור',
      body: 'שלום {name}, רק תזכורת לתור שלך {time}. אם משהו השתנה, עדכנו אותנו. נתראה! מספרפי.' },
    en: { cat: 'General reminder', title: 'Appointment reminder',
      body: 'Hi {name}, a quick reminder of your appointment {time}. If anything changed, let us know. See you! Barbershop.' } },
  // Broadcast-only welcome message, carries two links (app download + web booking)
  { id: 'welcome', icon: 'spark', color: '#0E7C66', welcome: true, kind: 'operational',
    he: { cat: 'ברוכים הבאים', title: 'ברוכים הבאים למספרפי',
      body: "שלום, הגעת למספרפי. לקביעת תור, היכנסו לאתר קביעת התורים: {bookingLink} , או דרך האפליקציה (אייפון/אנדרואיד): {appLink} , או חפשו 'מספרפי' בחנות האפליקציות. בכל נושא אחר, צרו קשר בשעות הפעילות. ברוכים הבאים, צוות מספרפי." },
    en: { cat: 'Welcome', title: 'Welcome to Mesparfi',
      body: "Hello, you've reached Mesparfi. To book, visit our booking site: {bookingLink} , or use the app (iPhone/Android): {appLink} , or search 'Mesparfi' in the app store. For anything else, contact us during business hours. Welcome, the Mesparfi team." } },
];

// per-change default wording for the proactive banner
const APPT_MSG = {
  moved: { he: 'שלום {name}, התור שלך הוזז ל{time}. מתאים לך? אם לא, נשמח לתאם מחדש. מספרפי.',
           en: 'Hi {name}, your appointment was moved to {time}. Does that work? If not, we\u2019ll gladly rebook. Barbershop.' },
  rescheduled: { he: 'שלום {name}, התור שלך עודכן ל{time}. מתאים לך? אם לא, נשמח לתאם מחדש. מספרפי.',
                 en: 'Hi {name}, your appointment is now {time}. Does that work? If not, we\u2019ll gladly rebook. Barbershop.' },
  cancelled: { he: 'שלום {name}, התור שלך ב{time} בוטל. ניצור קשר לתיאום מועד חדש. סליחה על אי הנוחות, מספרפי.',
               en: 'Hi {name}, your {time} appointment was cancelled. We\u2019ll reach out to reschedule. Sorry for the trouble, Barbershop.' },
};

const CHANGE_META = {
  moved:       { he: 'התור הוזז', en: 'Appointment moved' },
  rescheduled: { he: 'מועד התור שונה', en: 'Time changed' },
  cancelled:   { he: 'התור בוטל', en: 'Appointment cancelled' },
};

function fillTemplate(body, vars) {
  return (body || '').replace(/\{name\}/g, vars.name || '').replace(/\{time\}/g, vars.time || '').replace(/\{bookingLink\}/g, vars.bookingLink || '').replace(/\{appLink\}/g, vars.appLink || '');
}

function _whenLabel(date, start, he) {
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
  if (date === today) return (he ? 'היום ב' : 'today at ') + start;
  const d = new Date(date + 'T00:00');
  return d.toLocaleDateString(he ? 'he-IL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' }) + (he ? ' ב' : ' at ') + start;
}

// shared bottom-sheet chrome
function SheetWrap({ onClose, children, tall }) {
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 97, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: tall ? '94%' : '88%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '10px auto 4px', flexShrink: 0 }} />
        {children}
      </div>
    </div>
  );
}

const taTextarea = (he) => ({ width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 14.5, lineHeight: 1.55, color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.12)', borderRadius: 14, padding: '12px 13px', outline: 'none', resize: 'none', direction: he ? 'rtl' : 'ltr', textAlign: 'start' });

// horizontal scroll of template chips (suggested + the 4 library categories)
function TemplateChips({ lang, accent, suggested, value, onPick }) {
  const he = lang === 'he';
  const chips = [];
  if (suggested) chips.push({ id: '__sug', label: he ? 'מומלץ' : 'Suggested', icon: 'spark', color: accent, body: suggested });
  // Round A: read the admin-managed template list so edits/additions show up here too
  (window.tplStore ? window.tplStore.list() : MSG_TEMPLATES.filter(tpl => !tpl.welcome)).forEach(tpl => chips.push({ id: tpl.id, label: tpl[lang].cat, icon: tpl.icon, color: tpl.color, body: tpl[lang].body }));
  return (
    <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4, margin: '0 -2px' }}>
      {chips.map(c => {
        const on = value === c.id;
        return (
          <button key={c.id} onClick={() => onPick(c.id, c.body)} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 20, cursor: 'pointer', font: 'inherit', fontSize: 12.5, fontWeight: 700, border: `1.5px solid ${on ? c.color : 'rgba(11,30,61,0.12)'}`, background: on ? c.color + '1f' : '#fff', color: '#0B1E3D', whiteSpace: 'nowrap' }}>
            <Icon name={c.icon} size={14} color={c.color} />{c.label}
          </button>
        );
      })}
    </div>
  );
}

// ── B · Proactive banner, fires on every calendar change ──────────────
function NotifyClientSheet({ lang, t, accent, serif, appt, change, onClose, onSent }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const name = nm({ he: appt.clientHe, en: appt.clientEn });
  const when = _whenLabel(appt.date, appt.start, he);
  const suggested = fillTemplate(APPT_MSG[change] ? APPT_MSG[change][lang] : APPT_MSG.rescheduled[lang], { name: name.split(' ')[0], time: when });
  const [pick, setPick] = usePC('__sug');
  const [text, setText] = usePC(suggested);
  const cm = (CHANGE_META[change] || CHANGE_META.rescheduled)[lang];
  const choose = (id, body) => { setPick(id); setText(fillTemplate(body, { name: name.split(' ')[0], time: when })); };
  const send = () => {
    const num = (appt.phone || '').replace(/[^0-9]/g, '');
    if (num) window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(text), '_blank');
    onSent && onSent(name);
  };
  return (
    <SheetWrap onClose={onClose}>
      <div style={{ padding: '6px 18px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <span style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="message" size={24} color="#0B1E3D" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, color: accent, textTransform: 'uppercase' }}>{cm}</div>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D', lineHeight: 1.1 }}>{he ? `לעדכן את ${name}?` : `Update ${name}?`}</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={17} color="#0B1E3D" /></button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px 6px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.55)', marginInlineStart: 2 }}>{he ? 'בחרו תבנית, ערכו את הנוסח, ושלחו רק כשמתאים לכם.' : 'Pick a template, edit the wording, send only when you\u2019re ready.'}</div>
        <TemplateChips lang={lang} accent={accent} suggested={suggested} value={pick} onPick={choose} />
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 7, marginInlineStart: 2 }}>{he ? 'נוסח ההודעה' : 'Message'}</div>
          <textarea value={text} onChange={e => { setText(e.target.value); setPick(''); }} rows={5} style={taTextarea(he)} />
        </div>
      </div>
      <div style={{ padding: '10px 18px calc(16px + env(safe-area-inset-bottom))', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 9, borderTop: '1px solid rgba(11,30,61,0.06)' }}>
        <button onClick={send} disabled={!text.trim()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '15px', borderRadius: 16, border: 'none', cursor: text.trim() ? 'pointer' : 'not-allowed', opacity: text.trim() ? 1 : 0.45, font: 'inherit', fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg,#1ebe5d,#12a350)', color: '#fff', boxShadow: '0 8px 22px rgba(30,190,93,0.3)' }}>
          <Icon name="whatsapp" size={21} color="#fff" />{he ? 'שלח עדכון ללקוח' : 'Send update'}
        </button>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(11,30,61,0.55)', font: 'inherit', fontSize: 14.5, fontWeight: 600, padding: 6, cursor: 'pointer' }}>{he ? 'דלג, אל תשלח' : 'Skip, don\u2019t send'}</button>
      </div>
    </SheetWrap>
  );
}

// ── C · Close a whole day, auto-detects only that day's clients ───────
function CloseDaySheet({ lang, t, accent, serif, date, appts, staff, onClose, onSent, onCancelDay }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const list = staff || DATA.barbers;
  const affected = (appts || []).filter(a => a.date === date && a.status !== 'done' && a.status !== 'no' && a.status !== 'cancelled' && a.status !== 'rejected')
    .sort((x, y) => x.start.localeCompare(y.start));
  const dayLbl = _whenLabel(date, '', he).replace(he ? ' ב' : ' at ', '').trim();
  const def = MSG_TEMPLATES[0]; // emergency by default
  const [pick, setPick] = usePC('emergency');
  const [text, setText] = usePC(fillTemplate(def[lang].body, { name: he ? 'שלום' : 'there', time: dayLbl }));
  const [alsoCancel, setAlsoCancel] = usePC(true);
  const [confirm, setConfirm] = usePC(false);
  const choose = (id, body) => { setPick(id); setText(fillTemplate(body, { name: he ? 'שלום' : 'there', time: dayLbl })); };
  const send = () => { if (alsoCancel) onCancelDay && onCancelDay(date); onSent && onSent(affected.length); };
  return (
    <SheetWrap onClose={onClose} tall>
      <div style={{ padding: '6px 18px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="bell" size={23} color="#E4C97B" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, color: accent, textTransform: 'uppercase' }}>{he ? 'סגירת יום' : 'Close the day'}</div>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 19, color: '#0B1E3D', lineHeight: 1.1 }}>{dayLbl}</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={17} color="#0B1E3D" /></button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px 6px', display: 'flex', flexDirection: 'column', gap: 13 }}>
        {/* who's affected, auto-detected */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '13px 15px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: affected.length ? 11 : 0 }}>
            <Icon name="users" size={18} color={accent} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0B1E3D' }}>
              {affected.length
                ? (he ? `${affected.length} לקוחות עם תור ביום הזה` : `${affected.length} clients booked this day`)
                : (he ? 'אין תורים פעילים ביום זה' : 'No active bookings this day')}
            </span>
          </div>
          {affected.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {affected.map(a => {
                const c = window.barberColor ? window.barberColor(a.barberId, list) : DATA.calColors[list.findIndex(b => b.id === a.barberId) % DATA.calColors.length];
                const barber = list.find(b => b.id === a.barberId);
                return (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: c, flexShrink: 0 }} />
                    <span style={{ direction: 'ltr', unicodeBidi: 'isolate', fontWeight: 700, color: '#0B1E3D', minWidth: 42 }}>{a.start}</span>
                    <span style={{ color: '#0B1E3D', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{window.clientLabel ? window.clientLabel(a, lang) : nm({ he: a.clientHe, en: a.clientEn })}</span>
                    {barber && <span style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)' }}>{nm(barber).split(' ')[0]}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {affected.length > 0 && <>
          <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.55)', marginInlineStart: 2 }}>{he ? 'נשלח רק ללקוחות של היום הזה, לא לכל הרשימה.' : 'Sent only to this day\u2019s clients, not the whole list.'}</div>
          <TemplateChips lang={lang} accent={accent} value={pick} onPick={choose} />
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 7, marginInlineStart: 2 }}>{he ? 'נוסח ההודעה' : 'Message'}</div>
            <textarea value={text} onChange={e => { setText(e.target.value); setPick(''); }} rows={4} style={taTextarea(he)} />
          </div>
          <button onClick={() => setAlsoCancel(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', background: '#fff', border: `1.5px solid ${alsoCancel ? accent : 'rgba(11,30,61,0.1)'}`, borderRadius: 14, padding: '12px 14px', cursor: 'pointer', font: 'inherit', textAlign: 'start' }}>
            <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, border: `1.5px solid ${alsoCancel ? accent : 'rgba(11,30,61,0.2)'}`, background: alsoCancel ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{alsoCancel && <Icon name="check" size={15} color="#fff" stroke={2.6} />}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#0B1E3D' }}>{he ? 'בטל גם את התורים של היום' : 'Also cancel this day\u2019s bookings'}</div>
              <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 1 }}>{he ? 'מפנה את היומן ליום הזה' : 'Clears the calendar for this day'}</div>
            </div>
          </button>
        </>}
      </div>
      <div style={{ padding: '10px 18px calc(16px + env(safe-area-inset-bottom))', flexShrink: 0, borderTop: '1px solid rgba(11,30,61,0.06)' }}>
        {confirm ? (
          <div style={{ background: 'rgba(176,65,58,0.06)', border: '1px solid rgba(176,65,58,0.28)', borderRadius: 16, padding: '14px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(176,65,58,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="bell" size={17} color="#B0413A" /></span>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: '#B0413A' }}>{he ? 'לסגור סופית את היום?' : 'Close the day for good?'}</span>
            </div>
            <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.65)', lineHeight: 1.5, marginBottom: 12 }}>
              {alsoCancel
                ? (he ? `${affected.length} תורים יבוטלו והודעה תישלח ל${affected.length} הלקוחות. לא ניתן לבטל פעולה זו.` : `${affected.length} bookings will be cancelled and a message sent to ${affected.length} clients. This cannot be undone.`)
                : (he ? `הודעה תישלח ל${affected.length} הלקוחות של היום.` : `A message will be sent to this day's ${affected.length} clients.`)}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={send} style={{ flex: 1, padding: '13px', borderRadius: 13, border: 'none', background: '#B0413A', color: '#fff', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{he ? 'כן, סגור ושלח' : 'Yes, close & send'}</button>
              <button onClick={() => setConfirm(false)} style={{ flex: 1, padding: '13px', borderRadius: 13, border: '1px solid rgba(11,30,61,0.14)', background: '#fff', color: '#0B1E3D', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{he ? 'חזרה' : 'Back'}</button>
            </div>
          </div>
        ) : (
          <Btn kind="gold" icon="megaphone" disabled={!affected.length || !text.trim()} onClick={() => setConfirm(true)}>{he ? `שלח ל-${affected.length} הלקוחות של היום` : `Notify ${affected.length} clients`}</Btn>
        )}
      </div>
    </SheetWrap>
  );
}

// ── D · "Talk to the boss", barber → Rafi ─────────────────────────────
function BossSheet({ lang, t, accent, serif, onClose }) {
  const he = lang === 'he';
  const phone = DATA.contact.phone;
  const num = phone.replace(/[^0-9]/g, '');
  const msg = he ? 'היי רפי, אפשר לדבר רגע?' : 'Hi Rafi, got a minute?';
  return (
    <SheetWrap onClose={onClose}>
      <div style={{ padding: '8px 18px calc(24px + env(safe-area-inset-bottom))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px rgba(200,162,74,0.85)' }}>
            <img src={(window._asset || (p => p))('assets/rafi-face.png')} alt="רפי" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', background: '#fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D' }}>{he ? 'דבר עם הבוס' : 'Talk to the boss'}</div>
            <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.55)', marginTop: 2 }}>{he ? 'רפי, הבעלים. כאן בשבילך.' : 'Rafi, the owner. Here for you.'}</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="x" size={17} color="#0B1E3D" /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(msg), '_blank')} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '15px 18px', borderRadius: 16, border: 'none', cursor: 'pointer', font: 'inherit', background: 'linear-gradient(135deg,#1ebe5d,#12a350)', color: '#fff', boxShadow: '0 8px 22px rgba(30,190,93,0.32)' }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="whatsapp" size={22} color="#fff" /></span>
            <span style={{ flex: 1, textAlign: 'start', fontSize: 16, fontWeight: 700 }}>{he ? 'שלח הודעה בוואטסאפ' : 'Message on WhatsApp'}</span>
          </button>
          <button onClick={() => { window.location.href = 'tel:' + phone; }} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '15px 18px', borderRadius: 16, border: '1px solid rgba(11,30,61,0.1)', cursor: 'pointer', font: 'inherit', background: '#fff', color: '#0B1E3D' }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(11,30,61,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="phone" size={20} color={accent} /></span>
            <span style={{ flex: 1, textAlign: 'start', fontSize: 16, fontWeight: 700 }}>{he ? 'התקשר לרפי' : 'Call Rafi'}</span>
          </button>
        </div>
      </div>
    </SheetWrap>
  );
}

// ── Round A · OS navigation chooser, simulates the system app picker ──────
// "Navigate" buttons open this instead of jumping straight to Waze; every
// installed navigation app is offered and the user picks.
function NavChooserSheet({ lang, accent, serif, onClose }) {
  const he = lang === 'he';
  const dest = encodeURIComponent(DATA.contact.waze);
  const go = (url) => { window.open(url, '_blank'); onClose && onClose(); };
  const apps = [
    { id: 'waze', label: 'Waze', sub: he ? 'ניווט חי עם דיווחי דרך' : 'Live community routing', bg: '#05C3F2', glyph: 'W', url: 'https://waze.com/ul?q=' + dest + '&navigate=yes' },
    { id: 'gmaps', label: 'Google Maps', sub: he ? 'נסיעה, תחבורה והליכה' : 'Drive, transit & walking', bg: '#1A73E8', glyph: 'G', url: 'https://www.google.com/maps/dir/?api=1&destination=' + dest },
    { id: 'apple', label: he ? 'מפות (Apple)' : 'Apple Maps', sub: he ? 'אפליקציית המפות של המכשיר' : 'The built-in maps app', bg: '#6B7785', glyph: 'M', url: 'https://maps.apple.com/?daddr=' + dest },
  ];
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 98, background: 'rgba(7,16,31,0.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 10px calc(12px + env(safe-area-inset-bottom))' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ background: 'rgba(248,248,250,0.97)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 18px 50px rgba(7,16,31,0.35)' }}>
          <div style={{ padding: '13px 16px 11px', textAlign: 'center', borderBottom: '1px solid rgba(11,30,61,0.08)' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)' }}>{he ? 'ניווט אל המספרה' : 'Navigate to the shop'}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.4)', marginTop: 2 }}>{DATA.contact.waze} · {he ? 'בחרו אפליקציה' : 'choose an app'}</div>
          </div>
          {apps.map((a, i) => (
            <button key={a.id} onClick={() => go(a.url)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: 'transparent', border: 'none', borderTop: i ? '1px solid rgba(11,30,61,0.07)' : 'none', padding: '12px 16px', cursor: 'pointer', font: 'inherit', textAlign: 'start' }}>
              <span style={{ width: 42, height: 42, borderRadius: 11, background: a.bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 19, flexShrink: 0, fontFamily: "'Inter', sans-serif" }}>{a.glyph}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 15.5, fontWeight: 600, color: '#0B1E3D' }}>{a.label}</span>
                <span style={{ display: 'block', fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 1 }}>{a.sub}</span>
              </span>
              <Icon name={he ? 'chevron' : 'chevronR'} size={16} color="rgba(11,30,61,0.3)" />
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ background: '#fff', border: 'none', borderRadius: 16, padding: '15px', font: 'inherit', fontSize: 16, fontWeight: 700, color: '#0B1E3D', cursor: 'pointer', boxShadow: '0 10px 30px rgba(7,16,31,0.25)' }}>{he ? 'ביטול' : 'Cancel'}</button>
      </div>
    </div>
  );
}

// ── Round A · message-template store, admin-editable & persisted ──────────
// Seeded once from the built-in library (welcome stays special); after that
// the admin's list in localStorage is the source of truth for the broadcast UI.
const TPL_KEY = 'royale_msgtpl_v1';
function _tplSeed() { return MSG_TEMPLATES.filter(m => !m.welcome).map(m => ({ id: m.id, icon: m.icon, color: m.color, builtin: true, kind: m.kind || 'marketing', he: { cat: m.he.cat, title: m.he.title, body: m.he.body }, en: { cat: m.en.cat, title: m.en.title, body: m.en.body } })); }
const tplStore = {
  list() { try { const v = JSON.parse(localStorage.getItem(TPL_KEY)); if (Array.isArray(v) && v.length) return v; } catch (e) {} return _tplSeed(); },
  saveAll(l) { try { localStorage.setItem(TPL_KEY, JSON.stringify(l)); } catch (e) {} return l; },
  upsert(t) { const l = tplStore.list(); const i = l.findIndex(x => x.id === t.id); if (i >= 0) l[i] = t; else l.push(t); return tplStore.saveAll(l); },
  remove(id) { return tplStore.saveAll(tplStore.list().filter(x => x.id !== id)); },
};

// dynamic fields the admin can embed; filled per-recipient at send time
const TPL_VARS = [
  { token: '{name}', he: 'שם הלקוח', en: 'Client name' },
  { token: '{time}', he: 'מועד התור', en: 'Visit time' },
];

// ── Round A · template manager: create / edit / delete (with confirm) ─────
function TemplateManagerSheet({ lang, accent, serif, onClose, onChange }) {
  const he = lang === 'he';
  const [list, setList] = usePC(tplStore.list());
  const [edit, setEdit] = usePC(null);          // { id|null, name, body, isNew }
  const [confirmDel, setConfirmDel] = usePC(null); // template pending deletion
  const sync = (l) => { setList(l); onChange && onChange(l); };
  const startNew = () => { setConfirmDel(null); setEdit({ id: null, name: '', body: '', isNew: true }); };
  const startEdit = (m) => { setConfirmDel(null); setEdit({ id: m.id, name: m[lang].cat, body: m[lang].body, isNew: false }); };
  const insertVar = (token) => setEdit(ed => ({ ...ed, body: (ed.body || '') + ((ed.body && !/\s$/.test(ed.body)) ? ' ' : '') + token }));
  const canSave = edit && edit.name.trim() && edit.body.trim();
  const save = () => {
    if (!canSave) return;
    let t;
    if (edit.isNew) t = { id: 'tp' + Date.now(), icon: 'message', color: '#5E7A9B', custom: true, kind: 'marketing', he: { cat: edit.name.trim(), title: edit.name.trim(), body: edit.body }, en: { cat: edit.name.trim(), title: edit.name.trim(), body: edit.body } };
    else { const old = list.find(x => x.id === edit.id); t = { ...old, [lang]: { ...old[lang], cat: edit.name.trim(), title: edit.name.trim(), body: edit.body } }; }
    sync(tplStore.upsert(t)); setEdit(null);
  };
  const doDelete = () => { sync(tplStore.remove(confirmDel.id)); setConfirmDel(null); };
  const inpStyle = { width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 15, color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.12)', borderRadius: 13, padding: '12px 13px', outline: 'none', direction: he ? 'rtl' : 'ltr', textAlign: 'start' };
  return (
    <SheetWrap onClose={onClose} tall>
      <div style={{ padding: '6px 18px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="pencil" size={22} color="#E4C97B" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, color: accent, textTransform: 'uppercase' }}>{he ? 'הודעות' : 'Messaging'}</div>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D', lineHeight: 1.1 }}>{edit ? (edit.isNew ? (he ? 'תבנית חדשה' : 'New template') : (he ? 'עריכת תבנית' : 'Edit template')) : (he ? 'ניהול תבניות' : 'Manage templates')}</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={17} color="#0B1E3D" /></button>
        </div>
      </div>
      {!edit && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px calc(20px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {list.map(m => (
            <div key={m.id} style={{ background: '#fff', border: '1px solid rgba(11,30,61,0.08)', borderRadius: 14, padding: '11px 13px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: m.color + '1c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={m.icon} size={16} color={m.color} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0B1E3D' }}>{m[lang].cat}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m[lang].body}</div>
                </div>
                <button onClick={() => startEdit(m)} title={he ? 'עריכה' : 'Edit'} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="pencil" size={15} color={accent} /></button>
                <button onClick={() => { setEdit(null); setConfirmDel(confirmDel && confirmDel.id === m.id ? null : m); }} title={he ? 'מחיקה' : 'Delete'} style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${confirmDel && confirmDel.id === m.id ? '#B0413A' : 'rgba(176,65,58,0.3)'}`, background: confirmDel && confirmDel.id === m.id ? 'rgba(176,65,58,0.08)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="trash" size={15} color="#B0413A" /></button>
              </div>
              {confirmDel && confirmDel.id === m.id && (
                <div className="confirm-grow" style={{ marginTop: 10, background: 'rgba(176,65,58,0.06)', border: '1px solid rgba(176,65,58,0.28)', borderRadius: 12, padding: '11px 12px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#B0413A' }}>{he ? `למחוק את התבנית "${m[lang].cat}"?` : `Delete "${m[lang].cat}"?`}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.55)', marginTop: 3, lineHeight: 1.45 }}>{he ? 'התבנית תוסר לצמיתות. הודעות שכבר נשלחו לא יושפעו.' : 'The template is removed for good. Messages already sent are unaffected.'}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button onClick={doDelete} style={{ flex: 1, padding: '10px', borderRadius: 11, border: 'none', background: '#B0413A', color: '#fff', font: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{he ? 'כן, מחק' : 'Yes, delete'}</button>
                    <button onClick={() => setConfirmDel(null)} style={{ flex: 1, padding: '10px', borderRadius: 11, border: '1px solid rgba(11,30,61,0.14)', background: '#fff', color: '#0B1E3D', font: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{he ? 'ביטול' : 'Cancel'}</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <button onClick={startNew} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'transparent', border: '1.5px dashed rgba(200,162,74,0.6)', borderRadius: 14, padding: '13px', cursor: 'pointer', font: 'inherit', color: '#9C7B2E', fontSize: 14, fontWeight: 700 }}>
            <Icon name="plus" size={16} color="#9C7B2E" />{he ? 'תבנית חדשה' : 'New template'}
          </button>
        </div>
      )}
      {edit && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px 6px', display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 7, marginInlineStart: 2 }}>{he ? 'שם התבנית' : 'Template name'}</div>
            <input value={edit.name} onChange={e => setEdit(ed => ({ ...ed, name: e.target.value }))} autoFocus={edit.isNew} placeholder={he ? 'למשל: תזכורת ערב חג' : 'e.g. Holiday-eve reminder'} style={inpStyle} />
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 7, marginInlineStart: 2 }}>{he ? 'גוף ההודעה' : 'Message body'}</div>
            <textarea value={edit.body} onChange={e => setEdit(ed => ({ ...ed, body: e.target.value }))} rows={6} placeholder={he ? 'כתבו כאן את נוסח ההודעה…' : 'Write the message wording…'} style={taTextarea(he)} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginTop: 9 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(11,30,61,0.45)' }}>{he ? 'שדות דינמיים:' : 'Dynamic fields:'}</span>
              {TPL_VARS.map(v => (
                <button key={v.token} onClick={() => insertVar(v.token)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 18, border: `1px solid ${accent}55`, background: 'rgba(200,162,74,0.1)', cursor: 'pointer', font: 'inherit', fontSize: 12, fontWeight: 700, color: '#9C7B2E' }}>
                  <span style={{ direction: 'ltr', unicodeBidi: 'isolate', fontFamily: 'monospace', fontSize: 11.5 }}>{v.token}</span>{v[lang]}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 7, lineHeight: 1.45, marginInlineStart: 2 }}>{he ? 'השדות מוחלפים אוטומטית בשם הלקוח ובמועד התור של כל נמען בעת השליחה.' : 'Fields are filled per recipient with their name and visit time at send.'}</div>
          </div>
        </div>
      )}
      {edit && (
        <div style={{ padding: '10px 18px calc(16px + env(safe-area-inset-bottom))', flexShrink: 0, display: 'flex', gap: 9, borderTop: '1px solid rgba(11,30,61,0.06)' }}>
          <button onClick={() => setEdit(null)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1px solid rgba(11,30,61,0.14)', background: '#fff', color: '#0B1E3D', font: 'inherit', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' }}>{he ? 'ביטול' : 'Cancel'}</button>
          <button onClick={save} disabled={!canSave} style={{ flex: 2, padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', color: '#0B1E3D', font: 'inherit', fontSize: 14.5, fontWeight: 700, cursor: canSave ? 'pointer' : 'not-allowed', opacity: canSave ? 1 : 0.45, boxShadow: '0 6px 18px rgba(200,162,74,0.3)' }}>{he ? 'שמירת תבנית' : 'Save template'}</button>
        </div>
      )}
    </SheetWrap>
  );
}

Object.assign(window, { MSG_TEMPLATES, fillTemplate, NotifyClientSheet, CloseDaySheet, BossSheet, NavChooserSheet, tplStore, TPL_VARS, TemplateManagerSheet });
