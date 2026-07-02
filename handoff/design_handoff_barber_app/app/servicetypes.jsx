// servicetypes.jsx, Trust round: real "Service types" manager (price list)
// Replaces the mis-routed "Manage & content" screen for the Service-types entry.
// Edit name (he/en), price, duration; add and remove service types.
// Exports: ServiceTypesScreen
const { useState: useST } = React;

function ServiceTypeEditSheet({ lang, t, accent, serif, s, isNew, onClose, onSave, onDelete }) {
  const he = lang === 'he';
  const [d, setD] = useST({ he: s.he || '', en: s.en || '', priceTxt: String(s.priceText || s.price || ''), min: s.min || 15, decl: s.healthDecl !== undefined ? !!s.healthDecl : !!s.laser, multiOk: s.multiOk !== false });
  const [confirmDel, setConfirmDel] = useST(false);
  const [pickImg, setPickImg] = useST(false);
  const set = patch => setD(v => ({ ...v, ...patch }));
  const inp = { width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 15, color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.12)', borderRadius: 12, padding: '11px 13px', outline: 'none', direction: he ? 'rtl' : 'ltr', textAlign: 'start' };
  const lbl = { fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 7, marginInlineStart: 2 };
  // Round 11: fixed duration options only
  const durations = [15, 30, 45, 60];
  // flexible price, a single number ("80") or a range ("60-70"); ₪ is added automatically
  const priceClean = d.priceTxt.replace(/[₪\s]/g, '');
  const priceNums = (priceClean.match(/\d+/g) || []).map(Number);
  const canSave = d.he.trim() && d.en.trim() && priceNums.length > 0;
  const buildPatch = () => ({
    he: d.he, en: d.en, min: d.min,
    price: Math.min(...priceNums),
    priceText: /^\d+$/.test(priceClean) ? null : priceClean,
    healthDecl: d.decl, // Round 13: declaration requirement is a property of the service
    multiOk: d.multiOk, // Round D (section 14): may this service be combined in a multi-booking cart?
  });
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 96, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '92%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        <div style={{ padding: '10px 20px 4px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 12px' }} />
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D' }}>{isNew ? (he ? 'שירות חדש' : 'New service') : (he ? 'עריכת שירות' : 'Edit service')}</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Round 11: service image, Rafi only; phone upload or app gallery */}
          {!isNew && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <span style={{ width: 76, height: 76, borderRadius: 14, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(11,30,61,0.1)' }}>
                <ImgSlot id={'svc-book-' + s.id} radius={14} readonly src={s.img} placeholder={he ? s.photoHe : s.photoEn} style={{ width: 76, height: 76 }} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0B1E3D' }}>{he ? 'תמונת השירות' : 'Service image'}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 2, lineHeight: 1.4 }}>{he ? 'מוצגת ללקוחות בקביעת תור · עריכה, רפי בלבד' : 'Shown to clients when booking · Rafi edits only'}</div>
                <button onClick={() => setPickImg(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '7px 13px', borderRadius: 11, border: `1.5px solid ${accent}`, background: `${accent}12`, color: '#0B1E3D', font: 'inherit', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}><Icon name="image" size={15} color={accent} />{he ? 'החלפת תמונה' : 'Replace image'}</button>
              </div>
            </div>
          )}
          <div><div style={lbl}>{he ? 'שם השירות (עברית)' : 'Service name (Hebrew)'}</div><input value={d.he} onChange={e => set({ he: e.target.value })} placeholder={he ? 'תספורת קלאסית' : ''} style={inp} /></div>
          <div><div style={lbl}>{he ? 'שם השירות (אנגלית)' : 'Service name (English)'}</div><input value={d.en} onChange={e => set({ en: e.target.value })} placeholder="Classic Cut" style={{ ...inp, direction: 'ltr' }} /></div>
          <div><div style={lbl}>{he ? 'מחיר' : 'Price'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...inp, padding: '0 13px' }}>
              <span style={{ fontWeight: 700, color: 'rgba(11,30,61,0.5)' }}>₪</span>
              <input value={d.priceTxt} onChange={e => set({ priceTxt: e.target.value.replace(/₪/g, '') })} placeholder={he ? '80 או טווח כמו 70-60' : '80, or a range like 60-70'} inputMode="text" style={{ flex: 1, border: 'none', outline: 'none', font: 'inherit', fontSize: 15, fontWeight: 700, padding: '11px 0', background: 'transparent', direction: 'ltr', color: '#0B1E3D' }} />
            </div>
            <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.45)', marginTop: 5, marginInlineStart: 2 }}>{he ? 'אפשר מספר בודד או טווח · סימן ה־₪ מתווסף לבד' : 'Single number or a range · ₪ is added automatically'}</div>
          </div>
          <div><div style={lbl}>{he ? 'משך (דקות)' : 'Duration (minutes)'}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {durations.map(m => (
                <button key={m} onClick={() => set({ min: m })} style={{ font: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', padding: '8px 13px', borderRadius: 11, border: `1.5px solid ${d.min === m ? accent : 'rgba(11,30,61,0.12)'}`, background: d.min === m ? accent : '#fff', color: '#0B1E3D', direction: 'ltr' }}>{m}</button>
              ))}
            </div>
          </div>
          {!isNew && (
            confirmDel ? (
              <div style={{ background: 'rgba(176,58,58,0.06)', border: '1px solid rgba(176,58,58,0.25)', borderRadius: 14, padding: '13px 15px' }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#B03A3A', marginBottom: 3 }}>{he ? 'למחוק את השירות?' : 'Delete this service?'}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.6)', lineHeight: 1.45, marginBottom: 11 }}>{he ? 'השירות לא יוצע יותר ללקוחות חדשים. פעולה זו בלתי-הפיכה.' : 'It will no longer be offered to new clients. This cannot be undone.'}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={onDelete} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: '#B03A3A', color: '#fff', font: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>{he ? 'כן, מחק' : 'Yes, delete'}</button>
                  <button onClick={() => setConfirmDel(false)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid rgba(11,30,61,0.14)', background: '#fff', color: '#0B1E3D', font: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>{he ? 'חזרה' : 'Back'}</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDel(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px', borderRadius: 13, border: '1px solid rgba(176,58,58,0.25)', background: 'rgba(176,58,58,0.05)', color: '#B03A3A', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}><Icon name="trash" size={16} color="#B03A3A" />{he ? 'מחיקת שירות' : 'Delete service'}</button>
            )
          )}
          {/* Round 13: health-declaration switch, a service property, Rafi decides per service */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', border: `1px solid ${d.decl ? 'rgba(200,162,74,0.45)' : 'rgba(11,30,61,0.1)'}`, borderRadius: 14, padding: '12px 13px' }}>
            <span style={{ width: 36, height: 36, borderRadius: 11, background: d.decl ? 'linear-gradient(135deg,#14305A,#0B1E3D)' : 'rgba(11,30,61,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="file" size={17} color={d.decl ? '#E4C97B' : 'rgba(11,30,61,0.4)'} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#0B1E3D' }}>{he ? 'דורש הצהרת בריאות לפני טיפול ראשון' : 'Requires health declaration before first treatment'}</span>
              <span style={{ display: 'block', fontSize: 11, color: 'rgba(11,30,61,0.5)', marginTop: 2, lineHeight: 1.4 }}>{he ? 'לקוח שקובע את השירות בפעם הראשונה יתבקש למלא הצהרה דיגיטלית' : 'First-time clients fill the digital declaration'}</span>
            </span>
            <button onClick={() => set({ decl: !d.decl })} aria-label={he ? 'דורש הצהרת בריאות' : 'Toggle declaration'} style={{ width: 44, height: 26, borderRadius: 14, padding: 3, boxSizing: 'border-box', flexShrink: 0, border: 'none', cursor: 'pointer', background: d.decl ? '#2E7D52' : 'rgba(11,30,61,0.18)', display: 'flex', justifyContent: d.decl ? 'flex-end' : 'flex-start', transition: 'background .2s' }}><span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }}></span></button>
          </div>
          {/* Round D · section 14: allow this service in a multi-booking cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', border: `1px solid ${d.multiOk ? 'rgba(200,162,74,0.45)' : 'rgba(11,30,61,0.1)'}`, borderRadius: 14, padding: '12px 13px' }}>
            <span style={{ width: 36, height: 36, borderRadius: 11, background: d.multiOk ? 'linear-gradient(135deg,#14305A,#0B1E3D)' : 'rgba(11,30,61,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="bag" size={17} color={d.multiOk ? '#E4C97B' : 'rgba(11,30,61,0.4)'} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#0B1E3D' }}>{he ? 'מותר בהזמנה מרובה' : 'Allowed in multi-booking'}</span>
              <span style={{ display: 'block', fontSize: 11, color: 'rgba(11,30,61,0.5)', marginTop: 2, lineHeight: 1.4 }}>{he ? 'יופיע ככפתור “+ הוסף טיפול” בעגלת התורים' : 'Shows as a “+ add treatment” option in the cart'}</span>
            </span>
            <button onClick={() => set({ multiOk: !d.multiOk })} aria-label={he ? 'מותר בהזמנה מרובה' : 'Toggle multi-booking'} style={{ width: 44, height: 26, borderRadius: 14, padding: 3, boxSizing: 'border-box', flexShrink: 0, border: 'none', cursor: 'pointer', background: d.multiOk ? '#2E7D52' : 'rgba(11,30,61,0.18)', display: 'flex', justifyContent: d.multiOk ? 'flex-end' : 'flex-start', transition: 'background .2s' }}><span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }}></span></button>
          </div>
        </div>
        <div style={{ flexShrink: 0, padding: '12px 20px calc(18px + env(safe-area-inset-bottom))', borderTop: '1px solid rgba(11,30,61,0.06)' }}>
          <Btn kind="gold" icon="check" disabled={!canSave} onClick={() => onSave(buildPatch())}>{he ? 'שמירה' : 'Save'}</Btn>
        </div>
      </div>
      {pickImg && window.ImagePickSheet && <ImagePickSheet lang={lang} accent={accent} serif={serif} slotId={'svc-book-' + s.id} title={he ? `תמונה, ${d.he || s.he}` : `Image, ${d.en || s.en}`} onClose={() => setPickImg(false)} />}
    </div>
  );
}

function ServiceTypesScreen({ lang, t, accent, serif, onBack, services, setService, addService, delService, appts, staff, toast }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const [svcConflict, setSvcConflict] = useST(null);
  const [editing, setEditing] = useST(null); // { s, isNew }
  const list = (services || DATA.services).filter(s => !s.punchOnly);
  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל' : 'Admin'} title={he ? 'סוגי שירותים' : 'Service types'} onBack={onBack}
        right={<span style={{ fontSize: 12.5, fontWeight: 700, color: accent, background: 'rgba(200,162,74,0.12)', padding: '5px 11px', borderRadius: 20 }}>{list.length}</span>} />
      <Body>
        <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.55)', marginInlineStart: 2 }}>{he ? 'המחירון שהלקוחות רואים בקביעת תור. ערכו שם, מחיר ומשך, או הוסיפו שירות.' : 'The price list clients see when booking. Edit name, price and duration, or add a service.'}</div>
        {list.length === 0 && <div style={{ textAlign: 'center', padding: '28px', color: 'rgba(11,30,61,0.4)', fontSize: 14, background: '#fff', borderRadius: 16 }}>{he ? 'אין שירותים עדיין' : 'No services yet'}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((s, k) => (
            <button key={s.id} onClick={() => setEditing({ s, isNew: false })} className="s2-rise" style={{ animationDelay: (k * 50) + 'ms', width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: '#fff', borderRadius: 18, padding: '13px 15px', boxShadow: '0 3px 12px rgba(11,30,61,0.05)', border: '1px solid rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', gap: 13 }}>
              <span style={{ width: 42, height: 42, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(11,30,61,0.08)' }}><ImgSlot id={'svc-book-' + s.id} radius={12} readonly src={s.img} placeholder={he ? s.photoHe : s.photoEn} style={{ width: 42, height: 42 }} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#0B1E3D' }}>{nm(s)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3, fontSize: 12.5, color: 'rgba(11,30,61,0.55)' }}>
                  <Icon name="clock" size={13} color={accent} /><span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{s.min} {t.min}</span>
                </div>
              </div>
              <Money v={s.priceText || s.price} size={16} />
              <Icon name="pencil" size={16} color="rgba(11,30,61,0.3)" />
            </button>
          ))}
        </div>
        <button onClick={() => setEditing({ s: { id: 'sv' + Date.now(), he: '', en: '', price: 0, min: 15, photoHe: 'תמונת שירות', photoEn: 'service photo' }, isNew: true })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', borderRadius: 14, border: `1.5px dashed ${accent}`, background: `${accent}12`, color: '#0B1E3D', font: 'inherit', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' }}>
          <Icon name="plus" size={18} color={accent} />{he ? 'הוספת שירות' : 'Add service'}
        </button>
      </Body>
      {editing && <ServiceTypeEditSheet lang={lang} t={t} accent={accent} serif={serif} s={editing.s} isNew={editing.isNew} onClose={() => setEditing(null)}
        onSave={(patch) => { if (editing.isNew) { addService({ ...editing.s, ...patch }); } else { const durChanged = patch.min != null && patch.min !== editing.s.min; const cf = durChanged && window.serviceConflicts ? window.serviceConflicts(editing.s.id, patch.min, appts, staff) : []; setService(editing.s.id, patch); if (cf.length) setSvcConflict(cf); } setEditing(null); }}
        onDelete={() => { delService(editing.s.id); setEditing(null); }} />}
      {svcConflict && <ConflictSheet lang={lang} accent={accent} serif={serif} conflicts={svcConflict} staff={staff}
        title={he ? 'משך השירות החדש יוצר התנגשות' : 'New duration conflicts'} sub={he ? 'תורים קיימים שבמשך החדש חורגים מהשעות או מתנגשים עם התור הבא.' : 'Existing bookings exceed hours or overlap the next slot under the new length.'}
        onClose={() => setSvcConflict(null)}
        onNotify={() => { const n = svcConflict.length; setSvcConflict(null); toast && toast(he ? `נשלחה הודעה ל-${n} לקוחות ✓` : `Notified ${n} ✓`, he ? 'הוצע מועד חלופי' : 'Rebook offered'); }} />}
    </Shell>
  );
}

Object.assign(window, { ServiceTypesScreen });
