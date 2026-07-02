// staffedit.jsx, interactive barber editor (details · photo · hours · services)
// Exports: BarberSheet
const { useState: useSE, useRef: useRE } = React;

function SheetField({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 7, marginInlineStart: 2 }}>{label}</div>
      {children}
    </div>
  );
}
const sheetInput = (he) => ({ width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 15, color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.12)', borderRadius: 12, padding: '12px 13px', outline: 'none', direction: he ? 'rtl' : 'ltr', textAlign: 'start' });
const timeInput = { font: 'inherit', fontSize: 15, fontWeight: 700, color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.12)', borderRadius: 12, padding: '10px 12px', outline: 'none', direction: 'ltr', colorScheme: 'light' };

function BarberSheet({ lang, t, accent, serif, barber, staff, initialTab, isNew, selfMode, onClose, onSave, onDelete }) {
  const he = lang === 'he';
  const [tab, setTab] = useSE(initialTab || 'details');
  const [d, setD] = useSE(() => ({
    he: barber.he || '', en: barber.en || '', tagHe: barber.tagHe || '', tagEn: barber.tagEn || '',
    phone: barber.phone || '',
    active: barber.active !== false, start: barber.start || '09:00', end: barber.end || '18:00',
    autoConfirm: barber.autoConfirm !== false,
    breaks: (barber.breaks || []).map(b => ({ ...b })), services: [...(barber.services || [])],
    tone: barber.tone || 0, rating: barber.rating || 5.0,
    color: barber.color || '', // Round 13: preferred calendar color ('' = palette default)
    deal: barber.deal ? { ...barber.deal } : { type: barber.owner ? 'owner' : 'percent', managerPct: barber.owner ? 100 : 50 }, // Round G1: manager↔barber agreement
  }));
  const set = (patch) => setD(p => ({ ...p, ...patch }));
  const phoneDigits = (d.phone || '').replace(/[^0-9]/g, '');
  const phoneOk = phoneDigits.length >= 9;

  const tabs = [
    { id: 'details', icon: 'pencil', label: he ? 'פרטים' : 'Details' },
    { id: 'photo', icon: 'home', label: he ? 'תמונה' : 'Photo' },
    { id: 'services', icon: 'scissors', label: he ? 'שירותים' : 'Services' },
  ];
  const [delStep, setDelStep] = useSE(0); // 0 idle · 1 first warning · 2 final confirm
  const [pickImg, setPickImg] = useSE(false); // Round 11: gallery/phone image picker (admin)
  const initials = (he ? d.he : d.en).trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  const save = () => onSave({ ...barber, ...d, initials });
  const disableInstead = () => onSave({ ...barber, ...d, active: false, initials });
  const addBreak = () => set({ breaks: [...d.breaks, { from: '13:00', to: '13:30' }] });
  const setBreak = (i, k, v) => set({ breaks: d.breaks.map((b, j) => j === i ? { ...b, [k]: v } : b) });
  const rmBreak = (i) => set({ breaks: d.breaks.filter((_, j) => j !== i) });
  const toggleSvc = (id) => set({ services: d.services.includes(id) ? d.services.filter(s => s !== id) : [...d.services, id] });

  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 95, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', height: '92%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        {/* header */}
        <div style={{ padding: '10px 18px 8px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar b={{ initials, tone: d.tone }} size={44} lang={lang} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 19, color: '#0B1E3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(he ? d.he : d.en) || (isNew ? (he ? 'ספר חדש' : 'New barber') : '')}</div>
              <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.5)' }}>{isNew ? (he ? 'הוספת ספר לצוות' : 'Add to team') : (he ? 'עריכת פרטי ספר' : 'Edit barber')}</div>
            </div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={17} color="#0B1E3D" /></button>
          </div>
          {/* tab bar */}
          <div style={{ display: 'flex', gap: 5, marginTop: 14, background: 'rgba(11,30,61,0.05)', padding: 4, borderRadius: 13 }}>
            {tabs.map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 2px', borderRadius: 10, border: 'none', cursor: 'pointer', font: 'inherit', background: tab === tb.id ? '#fff' : 'transparent', boxShadow: tab === tb.id ? '0 2px 8px rgba(11,30,61,0.08)' : 'none', transition: 'all .15s' }}>
                <Icon name={tb.icon} size={17} color={tab === tb.id ? accent : 'rgba(11,30,61,0.45)'} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: tab === tb.id ? '#0B1E3D' : 'rgba(11,30,61,0.45)' }}>{tb.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tab === 'details' && <>
            <SheetField label={he ? 'שם (עברית)' : 'Name (Hebrew)'}><input value={d.he} onChange={e => set({ he: e.target.value })} placeholder="סאסי" style={sheetInput(true)} /></SheetField>
            <SheetField label={he ? 'שם (אנגלית)' : 'Name (English)'}><input value={d.en} onChange={e => set({ en: e.target.value })} placeholder="Sasi" style={sheetInput(false)} /></SheetField>
            <SheetField label={he ? 'מספר טלפון' : 'Phone number'}>
              <input value={d.phone} onChange={e => set({ phone: e.target.value })} inputMode="tel" placeholder="050-000-0000" style={{ ...sheetInput(false), direction: 'ltr', textAlign: 'left', borderColor: (d.phone && !phoneOk) ? 'rgba(176,58,58,0.55)' : 'rgba(11,30,61,0.12)' }} />
              <div style={{ fontSize: 11.5, color: (d.phone && !phoneOk) ? '#B03A3A' : 'rgba(11,30,61,0.5)', marginTop: 6, marginInlineStart: 2, lineHeight: 1.45 }}>{(d.phone && !phoneOk) ? (he ? 'מספר טלפון לא תקין' : 'Enter a valid phone number') : (he ? 'חובה. זהו המספר שאיתו הספר נכנס למערכת.' : 'Required. The barber signs in with this number.')}</div>
            </SheetField>
            <SheetField label={he ? 'משפט השבוע (עברית)' : 'Line of the week (Hebrew)'}><input value={d.tagHe} onChange={e => set({ tagHe: e.target.value })} maxLength={42} placeholder={he ? 'משפט השבוע…' : 'This week’s line…'} style={{ ...sheetInput(true), fontStyle: 'italic' }} /></SheetField>
            <SheetField label={he ? 'משפט השבוע (אנגלית)' : 'Line of the week (English)'}><input value={d.tagEn} onChange={e => set({ tagEn: e.target.value })} maxLength={42} placeholder="This week’s line…" style={{ ...sheetInput(false), fontStyle: 'italic' }} /></SheetField>
            {/* Round 13: preferred calendar color, Rafi (admin) only; identifies this barber in every calendar view */}
            {!selfMode ? (
              <SheetField label={he ? 'צבע הספר ביומן' : 'Calendar color'}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {(() => { const auto = window.barberColor ? window.barberColor(barber.id, (staff || []).map(b => b.id === barber.id ? { ...b, color: undefined } : b)) : DATA.calColors[0]; const on = !d.color; return (
                    <button key="auto" onClick={() => set({ color: '' })} title={he ? 'ברירת מחדל' : 'Default'} style={{ width: 40, height: 40, borderRadius: 12, cursor: 'pointer', font: 'inherit', fontSize: 9.5, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', background: auto, border: on ? `2.5px solid #0B1E3D` : '1px solid rgba(11,30,61,0.15)', boxShadow: on ? '0 0 0 2px #fff inset' : 'none' }}>{he ? 'אוטו' : 'auto'}</button>
                  ); })()}
                  {DATA.calColors.map(c => { const on = d.color === c; return (
                    <button key={c} onClick={() => set({ color: c })} style={{ width: 40, height: 40, borderRadius: 12, cursor: 'pointer', background: c, border: on ? '2.5px solid #0B1E3D' : '1px solid rgba(11,30,61,0.15)', boxShadow: on ? '0 0 0 2px #fff inset' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>{on && <Icon name="check" size={17} color="#fff" stroke={2.6} />}</button>
                  ); })}
                </div>
                <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 7, lineHeight: 1.45 }}>{he ? 'הצבע מזהה את הספר ביומן ובכל מקום שמבחין בין ספרים. ללא בחירה, צבע ברירת מחדל מהפלטה.' : 'Identifies this barber in the calendar and anywhere barbers are distinguished. No pick, a default from the palette.'}</div>
              </SheetField>
            ) : (
              <SheetField label={he ? 'צבע הספר ביומן' : 'Calendar color'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid rgba(11,30,61,0.1)', borderRadius: 12, padding: '10px 13px' }}>
                  <span style={{ width: 22, height: 22, borderRadius: 7, background: (window.barberColor ? window.barberColor(barber.id, staff) : DATA.calColors[0]), flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.55)' }}>{he ? 'נקבע על ידי רפי (מנהל) בלבד' : 'Set by Rafi (admin) only'}</span>
                </div>
              </SheetField>
            )}
            {/* Round G1 · אופי הדיל - visible to Rafi (manager) only; never in selfMode */}
            {!selfMode && (() => {
              const refPrice = (DATA.services.find(s => s.id === 's1') || {}).price || 80;
              const setDeal = (patch) => set({ deal: { ...d.deal, ...patch } });
              const isOwner = !!barber.owner;
              const pct = d.deal.managerPct != null ? d.deal.managerPct : 50;
              const adj = (delta) => setDeal({ managerPct: Math.max(0, Math.min(100, pct + delta)) });
              return (
                <SheetField label={he ? 'אופי ההסכם' : 'Agreement'}>
                  {isOwner ? (
                    <div style={{ background: 'linear-gradient(135deg,rgba(228,201,123,0.16),rgba(200,162,74,0.08))', border: '1px solid rgba(200,162,74,0.4)', borderRadius: 14, padding: '14px 15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(200,162,74,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="coin" size={20} color="#9C7B2E" /></span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 15, color: '#0B1E3D' }}>{he ? 'הבעלים · 100% למנהל' : 'Owner · 100% to manager'}</div>
                          <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.6)', marginTop: 2, lineHeight: 1.45 }}>{he ? 'המחזור שרפי מייצר כספר שייך לו במלואו, ללא חלוקה.' : 'The turnover Rafi makes as a barber is fully his, no split.'}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {/* deal type catalog - only 'percent' is live, the rest are scaffolded */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {DEAL_TYPES.map(dt => {
                          const on = (d.deal.type || 'percent') === dt.id;
                          const disabled = !dt.active;
                          return (
                            <button key={dt.id} onClick={() => dt.active && setDeal({ type: dt.id })} disabled={disabled}
                              style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'start', font: 'inherit', cursor: disabled ? 'default' : 'pointer', background: '#fff', border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.1)'}`, borderRadius: 13, padding: '11px 13px', opacity: disabled ? 0.6 : 1 }}>
                              <span style={{ width: 32, height: 32, borderRadius: 9, background: on ? accent + '1f' : 'rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={dt.icon} size={17} color={on ? accent : 'rgba(11,30,61,0.4)'} /></span>
                              <span style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ display: 'block', fontWeight: 700, fontSize: 14, color: '#0B1E3D' }}>{he ? dt.he : dt.en}</span>
                                <span style={{ display: 'block', fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{he ? dt.subHe : dt.subEn}</span>
                              </span>
                              {disabled
                                ? <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 800, color: '#9C7B2E', background: 'rgba(200,162,74,0.14)', padding: '3px 9px', borderRadius: 20 }}>{he ? 'בקרוב' : 'Soon'}</span>
                                : <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.2)'}`, background: on ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <Icon name="check" size={14} color="#fff" stroke={2.6} />}</span>}
                            </button>
                          );
                        })}
                      </div>

                      {/* percent split control + live preview */}
                      {(d.deal.type || 'percent') === 'percent' && (
                        <div style={{ background: '#fff', border: '1px solid rgba(11,30,61,0.1)', borderRadius: 14, padding: '14px 15px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)' }}>{he ? 'אחוז למנהל' : 'Manager share'}</div>
                              <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 1 }}>{he ? `העובד מקבל ${100 - pct}%` : `Barber keeps ${100 - pct}%`}</div>
                            </div>
                            <button onClick={() => adj(-1)} style={{ width: 36, height: 36, borderRadius: 11, border: '1px solid rgba(11,30,61,0.12)', background: '#FBF9F5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, font: 'inherit', fontSize: 22, fontWeight: 700, color: '#0B1E3D', lineHeight: 1, paddingBottom: 3 }}>−</button>
                            <span style={{ fontFamily: serif, fontWeight: 800, fontSize: 26, color: '#0B1E3D', minWidth: 58, textAlign: 'center' }}>{pct}%</span>
                            <button onClick={() => adj(1)} style={{ width: 36, height: 36, borderRadius: 11, border: '1px solid rgba(11,30,61,0.12)', background: '#FBF9F5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="plus" size={17} color="#0B1E3D" stroke={2.4} /></button>
                          </div>
                          {/* split bar */}
                          <div style={{ display: 'flex', height: 12, borderRadius: 7, overflow: 'hidden', marginTop: 13, background: 'rgba(11,30,61,0.06)' }}>
                            <div style={{ width: pct + '%', background: `linear-gradient(90deg,#E4C97B,${accent})` }} />
                            <div style={{ width: (100 - pct) + '%', background: '#14305A' }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 11.5, fontWeight: 700 }}>
                            <span style={{ color: '#9C7B2E' }}>{he ? 'מנהל' : 'Manager'} {pct}%</span>
                            <span style={{ color: '#14305A' }}>{he ? 'עובד' : 'Barber'} {100 - pct}%</span>
                          </div>
                          {/* live example on a real service price */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(11,30,61,0.07)', fontSize: 12.5, color: 'rgba(11,30,61,0.65)', flexWrap: 'wrap' }}>
                            <span>{he ? `על תספורת ₪${refPrice}:` : `On a ₪${refPrice} cut:`}</span>
                            <span style={{ fontWeight: 800, color: '#9C7B2E', direction: 'ltr' }}>₪{Math.round(refPrice * pct / 100)} {he ? 'למנהל' : 'manager'}</span>
                            <span style={{ color: 'rgba(11,30,61,0.3)' }}>·</span>
                            <span style={{ fontWeight: 800, color: '#14305A', direction: 'ltr' }}>₪{refPrice - Math.round(refPrice * pct / 100)} {he ? 'לעובד' : 'barber'}</span>
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11.5, color: 'rgba(11,30,61,0.5)', lineHeight: 1.45, padding: '0 2px' }}>
                        <Icon name="user" size={14} color="rgba(11,30,61,0.4)" style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>{he ? 'גלוי לרפי (מנהל) בלבד. הספר אינו רואה את אופי ההסכם, לא שלו ולא של אחרים.' : 'Visible to Rafi (manager) only. Barbers never see deals, their own or others’.'}</span>
                      </div>
                    </div>
                  )}
                </SheetField>
              );
            })()}
            <div style={{ display: 'none' }}>
              {[].map((idea, i) => (
                <button key={i} onClick={() => set(he ? { tagHe: idea } : { tagEn: idea })} style={{ font: 'inherit', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', border: `1px solid ${accent}55`, background: `${accent}14`, color: '#0B1E3D', borderRadius: 20, padding: '5px 10px' }}>{idea}</button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid rgba(11,30,61,0.1)', borderRadius: 14, padding: '13px 15px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5, color: '#0B1E3D' }}>{he ? 'במשמרת היום' : 'On shift today'}</div>
                <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{he ? 'מוצג ללקוחות כפעיל' : 'Shown active to customers'}</div>
              </div>
              <button onClick={() => set({ active: !d.active })} style={{ width: 50, height: 30, borderRadius: 16, border: 'none', cursor: 'pointer', padding: 3, background: d.active ? accent : 'rgba(11,30,61,0.18)', transition: 'background .2s', display: 'flex', justifyContent: d.active ? 'flex-end' : 'flex-start' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', transition: 'all .2s' }} />
              </button>
            </div>
            <div style={{ background: '#fff', border: '1px solid rgba(11,30,61,0.1)', borderRadius: 14, padding: '13px 15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name={(window.autoConfirmOn && window.autoConfirmOn()) ? 'check' : 'bell'} size={16} color={accent} />
                <div style={{ fontWeight: 600, fontSize: 14.5, color: '#0B1E3D' }}>{he ? 'אישור תורים' : 'Appointment approval'}</div>
              </div>
              <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.55)', marginTop: 7, lineHeight: 1.45 }}>
                {(window.autoConfirmOn && window.autoConfirmOn())
                  ? (he ? 'אישור אוטומטי פעיל לכל המספרה. תורים חדשים נכנסים מיד ליומן.' : 'Auto-confirm is on shop-wide. New bookings enter the calendar instantly.')
                  : (he ? 'אישור ידני פעיל לכל המספרה. כל תור חדש ממתין לאישור לפני שייכנס.' : 'Manual approval is on shop-wide. Every new booking waits before it enters.')}
                {' '}
                <span style={{ color: 'rgba(11,30,61,0.45)' }}>{he ? 'נשלט מההגדרות, הזמנות ותורים.' : 'Managed in Settings → Bookings.'}</span>
              </div>
            </div>
            {!isNew && !selfMode && barber.owner && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(200,162,74,0.1)', border: '1px solid rgba(200,162,74,0.35)', borderRadius: 13, padding: '11px 13px' }}>
                <Icon name="spark" size={16} color="#9C7B2E" />
                <span style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.7)', lineHeight: 1.45 }}>{he ? 'רפי הוא הבעלים והספר הראשי, תמיד ראשון ברשימה, ניתן לעריכה אך לא למחיקה.' : 'Rafi is the owner & master barber, always listed first; editable but never deletable.'}</span>
              </div>
            )}
            {!isNew && !selfMode && !barber.owner && delStep === 0 && <button onClick={() => setDelStep(1)} style={{ display: 'block', width: '100%', marginTop: 6, padding: '8px', borderRadius: 10, border: 'none', background: 'none', color: 'rgba(11,30,61,0.4)', font: 'inherit', fontSize: 12.5, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>{he ? 'מחיקת ספר לצמיתות' : 'Delete barber permanently'}</button>}
            {!isNew && !selfMode && !barber.owner && delStep > 0 && (
              <div style={{ marginTop: 6, background: 'rgba(176,58,58,0.05)', border: '1px solid rgba(176,58,58,0.25)', borderRadius: 16, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(176,58,58,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="trash" size={17} color="#B03A3A" /></span>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#B03A3A' }}>{delStep === 1 ? (he ? 'רגע, זה מוחק הכל' : 'Hold on, this erases everything') : (he ? 'אזהרה אחרונה' : 'Final warning')}</div>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.7)', lineHeight: 1.55, marginBottom: 14 }}>
                  {delStep === 1
                    ? (he ? 'מחיקה תמחק לצמיתות את כל ההיסטוריה, התורים והנתונים של הספר. ברוב המקרים עדיף להשבית, הנתונים יישמרו ותמיד תוכל להפעיל מחדש.' : 'Deleting permanently erases all of this barber’s history, appointments and data. In most cases disabling is better, data is kept and you can re-enable anytime.')
                    : (he ? 'לא ניתן לשחזר. כל הנתונים יימחקו לצמיתות.' : 'This cannot be undone. All data will be permanently erased.')}
                </div>
                {delStep === 1 ? <>
                  <button onClick={() => disableInstead()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', borderRadius: 13, border: 'none', background: '#2E7D52', color: '#fff', font: 'inherit', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}><Icon name="refresh" size={16} color="#fff" />{he ? 'השבת במקום (מומלץ)' : 'Disable instead (recommended)'}</button>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setDelStep(0)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid rgba(11,30,61,0.12)', background: '#fff', color: '#0B1E3D', font: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>{he ? 'ביטול' : 'Cancel'}</button>
                    <button onClick={() => setDelStep(2)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid rgba(176,58,58,0.3)', background: 'rgba(176,58,58,0.06)', color: '#B03A3A', font: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>{he ? 'המשך למחיקה' : 'Continue to delete'}</button>
                  </div>
                </> : <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setDelStep(0)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(11,30,61,0.12)', background: '#fff', color: '#0B1E3D', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{he ? 'ביטול' : 'Cancel'}</button>
                  <button onClick={onDelete} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', borderRadius: 12, border: 'none', background: '#B03A3A', color: '#fff', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}><Icon name="trash" size={15} color="#fff" />{he ? 'מחק לצמיתות' : 'Delete forever'}</button>
                </div>}
              </div>
            )}
          </>}

          {tab === 'photo' && <>
            <SheetField label={he ? 'תמונת פרופיל' : 'Profile photo'}>
              <div style={{ width: 150, height: 150, borderRadius: '50%', overflow: 'hidden', margin: '4px auto', boxShadow: '0 0 0 3px #fff, 0 0 0 5px rgba(200,162,74,0.85)' }}>
                <ImgSlot id={'staff-' + barber.id} shape="circle" readonly placeholder={he ? 'אין תמונה' : 'no photo'} style={{ width: 150, height: 150 }} />
              </div>
            </SheetField>
            {selfMode ? (
              <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.55)', textAlign: 'center', lineHeight: 1.55, background: 'rgba(200,162,74,0.1)', border: '1px solid rgba(200,162,74,0.3)', borderRadius: 12, padding: '11px 13px' }}>{he ? 'החלפת תמונה, דרך רפי (מנהל) בלבד.' : 'Photo changes go through Rafi (admin) only.'}</div>
            ) : <>
              <button onClick={() => setPickImg(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px', borderRadius: 13, border: `1.5px solid ${accent}`, background: `${accent}12`, color: '#0B1E3D', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}><Icon name="image" size={17} color={accent} />{he ? 'החלפת תמונה' : 'Replace photo'}</button>
              <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.5)', textAlign: 'center', lineHeight: 1.5 }}>{he ? 'העלאה מהטלפון או בחירה מגלריית האפליקציה · מוצגת ללקוחות בבחירת הספר.' : 'Upload from phone or pick from the app gallery · shown to clients when choosing a barber.'}</div>
            </>}
            <SheetField label={he ? 'גוון רקע (כשאין תמונה)' : 'Fallback tint'}>
              <div style={{ display: 'flex', gap: 9 }}>
                {[0, 1, 2, 3].map(tn => (
                  <button key={tn} onClick={() => set({ tone: tn })} style={{ flex: 1, height: 44, borderRadius: 12, cursor: 'pointer', border: d.tone === tn ? `2px solid ${accent}` : '1px solid rgba(11,30,61,0.1)', background: ['linear-gradient(140deg,#13325c,#1d4a86)', 'linear-gradient(140deg,#244a2e,#386b46)', 'linear-gradient(140deg,#5a3a1e,#86592f)', 'linear-gradient(140deg,#3a2a4a,#5b4274)'][tn] }} />
                ))}
              </div>
            </SheetField>
          </>}

          {tab === 'hours' && <>
            <div style={{ display: 'flex', gap: 12 }}>
              <SheetField label={he ? 'תחילת משמרת' : 'Shift start'}><input type="time" value={d.start} onChange={e => set({ start: e.target.value })} style={{ ...timeInput, width: '100%' }} /></SheetField>
              <SheetField label={he ? 'סיום משמרת' : 'Shift end'}><input type="time" value={d.end} onChange={e => set({ end: e.target.value })} style={{ ...timeInput, width: '100%' }} /></SheetField>
            </div>
            <SheetField label={he ? 'הפסקות' : 'Breaks'}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {d.breaks.length === 0 && <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.4)', padding: '6px 2px' }}>{he ? 'אין הפסקות מוגדרות' : 'No breaks set'}</div>}
                {d.breaks.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid rgba(11,30,61,0.1)', borderRadius: 12, padding: '8px 10px' }}>
                    <Icon name="clock" size={16} color={accent} />
                    <input type="time" value={b.from} onChange={e => setBreak(i, 'from', e.target.value)} style={{ ...timeInput, flex: 1, padding: '8px 6px', border: 'none' }} />
                    <span style={{ color: 'rgba(11,30,61,0.35)' }}>-</span>
                    <input type="time" value={b.to} onChange={e => setBreak(i, 'to', e.target.value)} style={{ ...timeInput, flex: 1, padding: '8px 6px', border: 'none' }} />
                    <button onClick={() => rmBreak(i)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(176,58,58,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={15} color="#B03A3A" /></button>
                  </div>
                ))}
                <button onClick={addBreak} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', borderRadius: 12, border: `1.5px dashed ${accent}`, background: `${accent}10`, color: '#0B1E3D', font: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}><Icon name="plus" size={16} color={accent} />{he ? 'הוסף הפסקה' : 'Add break'}</button>
              </div>
            </SheetField>
            <div style={{ background: 'rgba(200,162,74,0.1)', border: `1px solid ${accent}33`, borderRadius: 12, padding: '11px 13px', fontSize: 12.5, color: 'rgba(11,30,61,0.7)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <Icon name="clock" size={16} color={accent} /><span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{d.start}-{d.end}</span> · {he ? `${d.breaks.length} הפסקות` : `${d.breaks.length} breaks`}
            </div>
          </>}

          {tab === 'services' && (() => {
            // Round 15: role-gated, only Rafi (owner/admin) assigns services. A regular
            // barber sees his own list read-only; Rafi edits everyone's, including his own.
            const svcEditable = !selfMode || !!barber.owner;
            if (!svcEditable) {
              const mine = DATA.services.filter(s => !s.punchOnly && d.services.includes(s.id));
              return <>
                <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.5)', marginBottom: 2 }}>{he ? 'השירותים שאתה מעניק, תצוגה בלבד' : 'The services you offer, view only'}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {mine.length === 0 && <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.4)', padding: '8px 2px' }}>{he ? 'טרם הוגדרו לך שירותים' : 'No services assigned yet'}</div>}
                  {mine.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', boxSizing: 'border-box', background: '#fff', border: '1px solid rgba(11,30,61,0.08)', borderRadius: 14, padding: '12px 14px' }}>
                      <span style={{ width: 36, height: 36, borderRadius: 10, background: accent + '1f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="scissors" size={18} color={accent} /></span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14.5, color: '#0B1E3D' }}>{s[lang]}</div>
                        <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.45)', marginTop: 1 }}>{s.min} {he ? 'דק׳' : 'min'} · ₪{s.price}</div>
                      </div>
                      <Icon name="check" size={17} color="#2E7D52" stroke={2.4} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: 'rgba(200,162,74,0.1)', border: '1px solid rgba(200,162,74,0.35)', borderRadius: 13, padding: '11px 13px' }}>
                  <Icon name="spark" size={16} color="#9C7B2E" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.7)', lineHeight: 1.5 }}>{he ? 'עריכת השירותים, דרך רפי (המנהל) בלבד. רק המנהל קובע מי מעניק אילו שירותים.' : 'Service changes go through Rafi (admin) only, the manager decides who offers which services.'}</span>
                </div>
              </>;
            }
            return <>
            <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.5)', marginBottom: 2 }}>{he ? 'סמנו את השירותים שספר זה מעניק' : 'Select the services this barber offers'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {DATA.services.filter(s => !s.punchOnly).map(s => {
                const on = d.services.includes(s.id);
                return (
                  <button key={s.id} onClick={() => toggleSvc(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: '#fff', border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.08)'}`, borderRadius: 14, padding: '12px 14px', cursor: 'pointer', font: 'inherit', textAlign: 'start', transition: 'all .15s' }}>
                    <span style={{ width: 36, height: 36, borderRadius: 10, background: on ? accent + '1f' : 'rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="scissors" size={18} color={on ? accent : 'rgba(11,30,61,0.4)'} /></span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14.5, color: '#0B1E3D' }}>{s[lang]}</div>
                      <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.45)', marginTop: 1 }}>{s.min} {he ? 'דק׳' : 'min'} · ₪{s.price}</div>
                    </div>
                    <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.2)'}`, background: on ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <Icon name="check" size={15} color="#fff" stroke={2.6} />}</span>
                  </button>
                );
              })}
            </div>
          </>;
          })()}
        </div>

        {/* footer */}
        <div style={{ padding: '12px 18px calc(18px + env(safe-area-inset-bottom))', flexShrink: 0, borderTop: '1px solid rgba(11,30,61,0.06)', background: '#FBF9F5' }}>
          <Btn kind="gold" icon="check" disabled={!(he ? d.he : d.en).trim() || !phoneOk} onClick={save}>{isNew ? (he ? 'הוסף לצוות' : 'Add to team') : (he ? 'שמירת שינויים' : 'Save changes')}</Btn>
        </div>
      </div>
      {pickImg && window.ImagePickSheet && <ImagePickSheet lang={lang} accent={accent} serif={serif} slotId={'staff-' + barber.id} title={he ? `תמונה, ${d.he || barber.he}` : `Photo, ${d.en || barber.en}`} onClose={() => setPickImg(false)} />}
    </div>
  );
}

Object.assign(window, { BarberSheet });
