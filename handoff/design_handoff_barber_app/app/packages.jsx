// packages.jsx - Round E1: Rafi's flexible PUNCH-PACKAGE builder (manager side only).
// Replaces the single "locked" promo with a list of packages he defines: name, covered
// treatments, punch count, price, barber scope (one barber / whole team), optional expiry.
// The customer experience (wallet, punching, refunds) is wired separately in E2.
// Exports: PunchPackagesSection, PackageEditSheet
const { useState: usePkg } = React;

// covered-treatment names for a package, resolved live from the price list
function pkgServiceList() { return (DATA.services || []).filter(s => !s.punchOnly); }
function pkgCoveredNames(pkg, lang) {
  const all = pkgServiceList();
  return (pkg.services || []).map(id => { const s = all.find(x => x.id === id); return s ? s[lang] : null; }).filter(Boolean);
}

// ── one package card in the list ──────────────────────────────────────────
function PackageCard({ pkg, lang, accent, serif, staff, onEdit }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const status = punchStore.packageStatus(pkg);
  const ended = status === 'ended';
  const covered = pkgCoveredNames(pkg, lang);
  const barber = pkg.scope === 'barber' ? (staff || DATA.barbers).find(b => b.id === pkg.barberId) : null;
  const scopeLabel = pkg.scope === 'all' ? (he ? 'כל הצוות' : 'Whole team') : (barber ? nm(barber) : (he ? 'ספר אחד' : 'One barber'));
  return (
    <button onClick={onEdit} className="s2-rise" style={{ width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: '#fff', borderRadius: 18, padding: '14px 15px', boxShadow: '0 3px 12px rgba(11,30,61,0.05)', border: '1px solid rgba(11,30,61,0.05)', borderInlineStart: `3px solid ${ended ? 'rgba(11,30,61,0.2)' : accent}`, opacity: ended ? 0.78 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: ended ? 'rgba(11,30,61,0.06)' : 'linear-gradient(140deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="card" size={21} color={ended ? 'rgba(11,30,61,0.4)' : '#E4C97B'} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 16, color: '#0B1E3D' }}>{nm(pkg)}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, color: ended ? '#B0413A' : '#0B6B34', background: ended ? 'rgba(176,65,58,0.1)' : 'rgba(46,125,82,0.12)' }}>{ended ? (he ? 'הסתיימה' : 'Ended') : (he ? 'פעילה' : 'Active')}</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.55)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="scissors" size={12} color={accent} />{pkg.punches} {he ? 'ניקובים' : 'punches'}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name={pkg.scope === 'all' ? 'users' : 'user'} size={12} color={accent} />{scopeLabel}</span>
          </div>
        </div>
        <div style={{ textAlign: 'end', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Assistant, sans-serif', fontWeight: 800, fontSize: 18, color: '#0B1E3D', direction: 'ltr' }}>₪{(pkg.price || 0).toLocaleString()}</div>
          <Icon name="pencil" size={14} color="rgba(11,30,61,0.3)" />
        </div>
      </div>
      {/* covered treatments */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 11, paddingTop: 11, borderTop: '1px solid rgba(11,30,61,0.06)' }}>
        {covered.length === 0 && <span style={{ fontSize: 11.5, color: '#B0413A', fontWeight: 600 }}>{he ? 'לא נבחרו טיפולים' : 'No treatments selected'}</span>}
        {covered.map((n, k) => (
          <span key={k} style={{ fontSize: 11, fontWeight: 700, color: '#7A5F1E', background: 'rgba(200,162,74,0.14)', padding: '3px 9px', borderRadius: 20 }}>{n}</span>
        ))}
        {pkg.expiry && (
          <span style={{ marginInlineStart: covered.length ? 'auto' : 0, fontSize: 10.5, fontWeight: 700, color: 'rgba(11,30,61,0.5)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="calendar" size={11} color="rgba(11,30,61,0.4)" />{he ? 'עד' : 'until'} <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{pkg.expiry}</span>
          </span>
        )}
      </div>
    </button>
  );
}

// ── the section that sits inside the admin punch screen ────────────────────
function PunchPackagesSection({ lang, accent, serif, staff, toast }) {
  const he = lang === 'he';
  const [, setVer] = usePkg(0);
  const [editing, setEditing] = usePkg(null); // { pkg, isNew }
  const refresh = () => setVer(v => v + 1);
  const list = punchStore.packages();
  const blank = () => ({ id: 'pkg' + Date.now(), he: '', en: '', services: [], punches: 10, price: 0, scope: 'barber', barberId: (staff || DATA.barbers).filter(b => b.active !== false)[0]?.id || null, expiry: '', active: true });
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 11 }}>
        <span style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="card" size={17} color="#0B1E3D" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 16, color: '#0B1E3D' }}>{he ? 'חבילות כרטיסייה' : 'Punch packages'}</div>
          <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{he ? 'מה כל כרטיסייה כוללת, ולמי' : 'What each card covers, and for whom'}</div>
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: accent, background: 'rgba(200,162,74,0.12)', padding: '5px 11px', borderRadius: 20 }}>{list.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map(pkg => <PackageCard key={pkg.id} pkg={pkg} lang={lang} accent={accent} serif={serif} staff={staff} onEdit={() => setEditing({ pkg, isNew: false })} />)}
      </div>
      <button onClick={() => setEditing({ pkg: blank(), isNew: true })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 11, padding: '13px', borderRadius: 14, border: `1.5px dashed ${accent}`, background: `${accent}12`, color: '#0B1E3D', font: 'inherit', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' }}>
        <Icon name="plus" size={18} color={accent} />{he ? 'חבילה חדשה' : 'New package'}
      </button>
      {editing && <PackageEditSheet lang={lang} accent={accent} serif={serif} staff={staff} pkg={editing.pkg} isNew={editing.isNew}
        onClose={() => setEditing(null)}
        onSave={(p) => { punchStore.savePackage(p); refresh(); setEditing(null); toast && toast(editing.isNew ? (he ? 'חבילה נוצרה ✓' : 'Package created ✓') : (he ? 'החבילה נשמרה ✓' : 'Package saved ✓'), he ? 'כרטיסיות שכבר נמכרו לא מושפעות' : 'Already-sold cards are unaffected'); }}
        onDelete={() => { punchStore.deletePackage(editing.pkg.id); refresh(); setEditing(null); toast && toast(he ? 'החבילה נמחקה' : 'Package deleted', he ? 'לא ניתנת לרכישה חדשה · כרטיסיות קיימות נשמרות' : 'No new purchases · existing cards kept'); }} />}
    </div>
  );
}

// ── create / edit a package ────────────────────────────────────────────────
function PackageEditSheet({ lang, accent, serif, staff, pkg, isNew, onClose, onSave, onDelete }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const [d, setD] = usePkg({ he: pkg.he || '', en: pkg.en || '', services: [...(pkg.services || [])], punches: pkg.punches || 10, priceTxt: String(pkg.price || ''), scope: pkg.scope || 'barber', barberId: pkg.barberId || null, expiry: pkg.expiry || '', active: pkg.active !== false });
  const [confirmDel, setConfirmDel] = usePkg(false);
  const set = patch => setD(v => ({ ...v, ...patch }));
  const svcList = pkgServiceList();
  const barbers = (staff || DATA.barbers).filter(b => b.active !== false);

  const toggleSvc = (id) => set({ services: d.services.includes(id) ? d.services.filter(x => x !== id) : [...d.services, id] });
  const priceNum = parseInt((d.priceTxt || '').replace(/[^0-9]/g, ''), 10) || 0;
  const canSave = d.he.trim() && d.en.trim() && d.services.length > 0 && d.punches >= 1 && priceNum > 0 && (d.scope === 'all' || d.barberId);

  const inp = { width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 15, color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.12)', borderRadius: 12, padding: '11px 13px', outline: 'none', direction: he ? 'rtl' : 'ltr', textAlign: 'start' };
  const lbl = { fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 7, marginInlineStart: 2 };
  const stepBtn = { width: 38, height: 38, border: 'none', background: 'transparent', cursor: 'pointer', font: 'inherit', fontSize: 20, fontWeight: 700, color: '#0B1E3D', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  const buildPatch = () => ({ id: pkg.id, he: d.he.trim(), en: d.en.trim(), services: d.services, punches: d.punches, price: priceNum, scope: d.scope, barberId: d.scope === 'barber' ? d.barberId : null, expiry: d.expiry || '', active: d.active });

  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 97, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '94%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        <div style={{ padding: '10px 20px 4px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 12px' }} />
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D' }}>{isNew ? (he ? 'חבילה חדשה' : 'New package') : (he ? 'עריכת חבילה' : 'Edit package')}</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* 1 · names */}
          <div><div style={lbl}>{he ? 'שם החבילה (עברית)' : 'Package name (Hebrew)'}</div><input value={d.he} onChange={e => set({ he: e.target.value })} placeholder={he ? 'כרטיסיית מבוגר' : ''} style={inp} /></div>
          <div><div style={lbl}>{he ? 'שם החבילה (אנגלית)' : 'Package name (English)'}</div><input value={d.en} onChange={e => set({ en: e.target.value })} placeholder="Adult card" style={{ ...inp, direction: 'ltr' }} /></div>

          {/* 2 · covered treatments (multi-select) */}
          <div>
            <div style={lbl}>{he ? 'טיפולים מכוסים' : 'Covered treatments'}</div>
            <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.45)', marginTop: -3, marginBottom: 8, marginInlineStart: 2 }}>{he ? 'אלה ורק אלה יהיו זמינים לניקוב · בחירה מרובה' : 'These and only these can be punched · multi-select'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {svcList.map(s => {
                const on = d.services.includes(s.id);
                return (
                  <button key={s.id} onClick={() => toggleSvc(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: on ? accent + '12' : '#fff', border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.1)'}`, borderRadius: 13, padding: '10px 12px' }}>
                    <span style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.22)'}`, background: on ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <Icon name="check" size={13} color="#fff" stroke={2.6} />}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontWeight: 600, fontSize: 14.5, color: '#0B1E3D' }}>{nm(s)}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}><Icon name="clock" size={11} color="rgba(11,30,61,0.4)" />{s.min} {he ? 'דק׳' : 'min'}</span>
                    </span>
                    <Money v={s.priceText || s.price} size={13} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 · punches + 4 · price */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={lbl}>{he ? 'כמות ניקובים' : 'Punches'}</div>
              <span style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(11,30,61,0.13)', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
                <button onClick={() => set({ punches: Math.max(1, d.punches - 1) })} style={stepBtn}>−</button>
                <span style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 16, color: '#0B1E3D', direction: 'ltr' }}>{d.punches}</span>
                <button onClick={() => set({ punches: Math.min(50, d.punches + 1) })} style={stepBtn}>+</button>
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={lbl}>{he ? 'מחיר החבילה' : 'Package price'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...inp, padding: '0 13px' }}>
                <span style={{ fontWeight: 700, color: 'rgba(11,30,61,0.5)' }}>₪</span>
                <input value={d.priceTxt} onChange={e => set({ priceTxt: e.target.value.replace(/[^0-9]/g, '') })} inputMode="numeric" placeholder="810" style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', font: 'inherit', fontSize: 15, fontWeight: 700, padding: '11px 0', background: 'transparent', direction: 'ltr', color: '#0B1E3D' }} />
              </div>
            </div>
          </div>

          {/* 5 · barber scope */}
          <div>
            <div style={lbl}>{he ? 'שיוך ספר' : 'Barber scope'}</div>
            <div style={{ display: 'flex', gap: 4, background: 'rgba(11,30,61,0.05)', padding: 4, borderRadius: 12, marginBottom: d.scope === 'barber' ? 10 : 0 }}>
              {[['barber', he ? 'ספר אחד' : 'One barber'], ['all', he ? 'כל הצוות' : 'Whole team']].map(([id, lab]) => {
                const on = d.scope === id;
                return <button key={id} onClick={() => set({ scope: id })} style={{ flex: 1, padding: '10px 4px', borderRadius: 9, border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 13, fontWeight: 700, background: on ? '#fff' : 'transparent', color: on ? '#0B1E3D' : 'rgba(11,30,61,0.5)', boxShadow: on ? '0 2px 8px rgba(11,30,61,0.08)' : 'none', transition: 'all .15s' }}>{lab}</button>;
              })}
            </div>
            {d.scope === 'barber' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {barbers.map(b => {
                  const on = d.barberId === b.id;
                  return (
                    <button key={b.id} onClick={() => set({ barberId: b.id })} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: on ? accent + '12' : '#fff', border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.1)'}`, borderRadius: 13, padding: '9px 11px' }}>
                      <BarberMedallion b={b} size={38} lang={lang} />
                      <span style={{ flex: 1, fontWeight: 700, fontSize: 14.5, color: '#0B1E3D' }}>{nm(b)}</span>
                      <span style={{ width: 21, height: 21, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.2)'}`, background: on ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <Icon name="check" size={12} color="#fff" stroke={2.6} />}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 6 · optional expiry */}
          <div style={{ background: '#fff', border: `1px solid ${d.expiry ? 'rgba(200,162,74,0.45)' : 'rgba(11,30,61,0.1)'}`, borderRadius: 14, padding: '12px 13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <span style={{ width: 36, height: 36, borderRadius: 11, background: d.expiry ? 'linear-gradient(135deg,#14305A,#0B1E3D)' : 'rgba(11,30,61,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="calendar" size={17} color={d.expiry ? '#E4C97B' : 'rgba(11,30,61,0.4)'} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#0B1E3D' }}>{he ? 'תאריך תפוגה למבצע' : 'Promo expiry date'}</span>
                <span style={{ display: 'block', fontSize: 11, color: 'rgba(11,30,61,0.5)', marginTop: 2, lineHeight: 1.4 }}>{he ? 'אופציונלי · אחרי התאריך לא ניתן לרכוש חדשה' : 'Optional · no new purchases after this date'}</span>
              </span>
              <button onClick={() => { if (d.expiry) set({ expiry: '' }); else { const dt = new Date(); dt.setDate(dt.getDate() + 30); const p = n => String(n).padStart(2, '0'); set({ expiry: `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}` }); } }} aria-label={he ? 'תפוגה' : 'Toggle expiry'} style={{ width: 44, height: 26, borderRadius: 14, padding: 3, boxSizing: 'border-box', flexShrink: 0, border: 'none', cursor: 'pointer', background: d.expiry ? '#2E7D52' : 'rgba(11,30,61,0.18)', display: 'flex', justifyContent: d.expiry ? 'flex-end' : 'flex-start', transition: 'background .2s' }}><span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }}></span></button>
            </div>
            {d.expiry && (
              <input type="date" value={d.expiry} onChange={e => set({ expiry: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 13.5, fontWeight: 700, color: '#0B1E3D', background: '#FBF9F5', border: '1px solid rgba(11,30,61,0.13)', borderRadius: 11, padding: '10px 12px', outline: 'none', direction: 'ltr', colorScheme: 'light', marginTop: 11 }} />
            )}
          </div>

          {/* manual active toggle (kill switch independent of expiry) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', border: '1px solid rgba(11,30,61,0.1)', borderRadius: 14, padding: '12px 13px' }}>
            <span style={{ width: 36, height: 36, borderRadius: 11, background: d.active ? 'rgba(46,125,82,0.12)' : 'rgba(11,30,61,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="spark" size={17} color={d.active ? '#2E7D52' : 'rgba(11,30,61,0.4)'} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#0B1E3D' }}>{he ? 'חבילה פעילה' : 'Package active'}</span>
              <span style={{ display: 'block', fontSize: 11, color: 'rgba(11,30,61,0.5)', marginTop: 2, lineHeight: 1.4 }}>{he ? 'כיבוי עוצר רכישות חדשות · כרטיסיות קיימות נשמרות' : 'Off stops new purchases · existing cards kept'}</span>
            </span>
            <button onClick={() => set({ active: !d.active })} aria-label={he ? 'פעילה' : 'Toggle active'} style={{ width: 44, height: 26, borderRadius: 14, padding: 3, boxSizing: 'border-box', flexShrink: 0, border: 'none', cursor: 'pointer', background: d.active ? '#2E7D52' : 'rgba(11,30,61,0.18)', display: 'flex', justifyContent: d.active ? 'flex-end' : 'flex-start', transition: 'background .2s' }}><span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }}></span></button>
          </div>

          {/* delete */}
          {!isNew && (
            confirmDel ? (
              <div style={{ background: 'rgba(176,58,58,0.06)', border: '1px solid rgba(176,58,58,0.25)', borderRadius: 14, padding: '13px 15px' }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#B03A3A', marginBottom: 3 }}>{he ? 'למחוק את החבילה?' : 'Delete this package?'}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.6)', lineHeight: 1.45, marginBottom: 11 }}>{he ? 'לא תהיה זמינה לרכישה חדשה. כרטיסיות שכבר נרכשו נשמרות עד שמוצו.' : 'No longer sellable. Already-purchased cards stay valid until used up.'}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={onDelete} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: '#B03A3A', color: '#fff', font: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>{he ? 'כן, מחק' : 'Yes, delete'}</button>
                  <button onClick={() => setConfirmDel(false)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid rgba(11,30,61,0.14)', background: '#fff', color: '#0B1E3D', font: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>{he ? 'חזרה' : 'Back'}</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDel(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px', borderRadius: 13, border: '1px solid rgba(176,58,58,0.25)', background: 'rgba(176,58,58,0.05)', color: '#B03A3A', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}><Icon name="trash" size={16} color="#B03A3A" />{he ? 'מחיקת חבילה' : 'Delete package'}</button>
            )
          )}
        </div>
        <div style={{ flexShrink: 0, padding: '12px 20px calc(18px + env(safe-area-inset-bottom))', borderTop: '1px solid rgba(11,30,61,0.06)' }}>
          <Btn kind="gold" icon="check" disabled={!canSave} onClick={() => onSave(buildPatch())}>{he ? 'שמירה' : 'Save'}</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PunchPackagesSection, PackageEditSheet });
