// customers.jsx, admin Customers management (list, search, metrics, profile, contact)
// Exports: CustomersScreen
const { useState: useCu } = React;

function MetricCard({ value, label, sub, accent, serif, i }) {
  return (
    <div className="s2-rise" style={{ animationDelay: (i * 60) + 'ms', flex: 1, minWidth: 0, background: '#fff', borderRadius: 16, padding: 13, boxShadow: '0 3px 12px rgba(11,30,61,0.05)' }}>
      <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: '#0B1E3D', lineHeight: 1, direction: 'ltr', textAlign: 'start' }}>{value}</div>
      <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 5, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 10.5, color: accent, marginTop: 3, fontWeight: 700 }}>{sub}</div>}
    </div>
  );
}

function CustomerProfile({ lang, t, accent, serif, c, staff, appts, onClose }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const disp = c.phone.replace(/^0/, '').replace(/(\d{2})(\d{3})(\d+)/, '0$1-$2-$3');
  const fav = (staff || DATA.barbers).find(b => b.id === c.fav);
  // build visit history from global appts matching this client name + a couple of synthetic past ones
  const hist = (appts || []).filter(a => (a.clientHe === c.he || a.clientEn === c.en)).slice(0, 4);
  const pastHe = [['תספורת וזקן', 'לפני שבוע', 'סאסי'], ['תספורת + שעווה', 'לפני חודש', 'רפאל'], ['תספורת גבר', 'לפני חודשיים', 'סאסי']];
  const pastEn = [['Haircut & Beard', '1 week ago', 'Sasi'], ['Haircut + Wax', '1 month ago', 'Rafael'], ["Men's Haircut", '2 months ago', 'Sasi']];
  const past = he ? pastHe : pastEn;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 96, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '90%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        <div style={{ padding: '10px 20px 4px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(140deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FBF9F5', fontWeight: 700, fontSize: 21, flexShrink: 0 }}>{nm(c).trim()[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D' }}>{nm(c)}</div>
              <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.55)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="pin" size={13} color={accent} />{he ? c.regionHe : c.regionEn}
                <span style={{ color: 'rgba(11,30,61,0.2)' }}>·</span>{c.visits} {t.custVisits}
              </div>
            </div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={17} color="#0B1E3D" /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 8px' }}>
          {/* contact row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: '1px solid rgba(11,30,61,0.1)', borderRadius: 14, padding: '11px 14px', marginBottom: 14 }}>
            <Icon name="phone" size={17} color={accent} />
            <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: '#0B1E3D', direction: 'ltr', textAlign: 'start' }}>{disp}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button onClick={() => window.open('https://wa.me/972' + c.phone.replace(/^0/, ''), '_blank')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 14, border: 'none', cursor: 'pointer', font: 'inherit', background: 'linear-gradient(135deg,#1ebe5d,#12a350)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 6px 16px rgba(30,190,93,0.3)' }}><Icon name="whatsapp" size={19} color="#fff" />WhatsApp</button>
            <button onClick={() => { window.location.href = 'tel:0' + c.phone.replace(/^0/, ''); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 14, border: '1px solid rgba(11,30,61,0.12)', cursor: 'pointer', font: 'inherit', background: '#fff', color: '#0B1E3D', fontWeight: 700, fontSize: 14 }}><Icon name="phone" size={18} color={accent} />{t.contactCall}</button>
          </div>
          {/* favorite barber */}
          {fav && <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'rgba(200,162,74,0.1)', border: `1px solid ${accent}33`, borderRadius: 14, padding: '11px 14px', marginBottom: 16 }}>
            <Icon name="heart" size={18} color={accent} fill="solid" />
            <span style={{ fontSize: 13.5, color: 'rgba(11,30,61,0.7)' }}>{t.custFav}:</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#0B1E3D' }}>{nm(fav)}</span>
          </div>}
          {/* history */}
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 15.5, color: '#0B1E3D', marginBottom: 10 }}>{t.custHistory}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {past.map((p, k) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', borderRadius: 13, padding: '11px 13px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="scissors" size={16} color={accent} /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0B1E3D' }}>{p[0]}</div>
                  <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{p[2]}</div>
                </div>
                <span style={{ fontSize: 12, color: 'rgba(11,30,61,0.45)' }}>{p[1]}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.4)', textAlign: 'center', padding: '4px 0 calc(14px + env(safe-area-inset-bottom))' }}>{t.custSince} {c.firstSeen}</div>
        </div>
      </div>
    </div>
  );
}

function CustomersScreen({ lang, t, accent, serif, onBack, staff, appts, toast }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const [q, setQ] = useCu('');
  const [f, setF] = useCu('all'); // all | returning | onetime | cancels | dormant | <barberId>
  const [sel, setSel] = useCu(null);
  const all = DATA.customers;
  const cancelMap = (window.custStore ? window.custStore.cancels() : {});
  const isDormant = c => c.visits <= 2 && (c.firstSeen || '9999') <= '2025-09';
  const passF = c => f === 'all' ? true : f === 'returning' ? c.visits > 1 : f === 'onetime' ? c.visits === 1 : f === 'cancels' ? ((cancelMap[c.id] || {}).count > 0) : f === 'dormant' ? isDormant(c) : c.fav === f;
  const filtered = all.filter(c => passF(c) && (() => { const s = q.trim(); if (!s) return true; return nm(c).includes(s) || c.phone.includes(s.replace(/[^0-9]/g, '')); })());
  const list = staff || DATA.barbers;
  const fchips = [['all', he ? 'הכל' : 'All'], ['returning', he ? 'חוזרים' : 'Returning'], ['onetime', he ? 'חד-פעמיים' : 'One-time'], ['cancels', he ? 'עם ביטולים' : 'Cancellations'], ['dormant', he ? 'רדומים' : 'Dormant']];

  // metrics
  const thisMonth = all.filter(c => c.firstSeen === '2026-06').length;
  const returning = all.filter(c => c.visits > 1).length;
  const oneTime = all.filter(c => c.visits === 1).length;
  // top region
  const regionCount = {};
  all.forEach(c => { regionCount[he ? c.regionHe : c.regionEn] = (regionCount[he ? c.regionHe : c.regionEn] || 0) + 1; });
  const topRegion = Object.entries(regionCount).sort((a, b) => b[1] - a[1])[0];

  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל' : 'Admin'} title={t.custMgr} onBack={onBack}
        right={<span style={{ fontSize: 12.5, fontWeight: 700, color: accent, background: 'rgba(200,162,74,0.12)', padding: '5px 11px', borderRadius: 20 }}>{all.length}</span>} />
      <Body>
        {/* metrics */}
        <div style={{ display: 'flex', gap: 9 }}>
          <MetricCard i={0} value={thisMonth} label={t.custNew} sub="+15%" accent={accent} serif={serif} />
          <MetricCard i={1} value={`${returning}/${oneTime}`} label={`${t.custReturning} / ${t.custOneTime}`} accent={accent} serif={serif} />
          <MetricCard i={2} value={topRegion[0]} label={t.custByRegion} sub={`${topRegion[1]} ${t.custVisits}`} accent={accent} serif={serif} />
        </div>

        {/* search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: '1px solid rgba(11,30,61,0.1)', borderRadius: 14, padding: '11px 14px' }}>
          <Icon name="search" size={18} color="rgba(11,30,61,0.4)" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t.custSearch} style={{ flex: 1, border: 'none', outline: 'none', font: 'inherit', fontSize: 14.5, background: 'transparent', color: '#0B1E3D', direction: he ? 'rtl' : 'ltr', textAlign: 'start' }} />
        </div>

        {/* smart filters, by variable, not only name */}
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2 }}>
          {fchips.map(([id, lbl]) => (
            <button key={id} onClick={() => setF(id)} style={{ flexShrink: 0, padding: '7px 13px', borderRadius: 20, cursor: 'pointer', font: 'inherit', fontSize: 12.5, fontWeight: 700, border: `1.5px solid ${f === id ? accent : 'rgba(11,30,61,0.12)'}`, background: f === id ? accent : '#fff', color: f === id ? '#0B1E3D' : 'rgba(11,30,61,0.6)' }}>{lbl}</button>
          ))}
          {list.map(b => (
            <button key={b.id} onClick={() => setF(b.id)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 20, cursor: 'pointer', font: 'inherit', fontSize: 12.5, fontWeight: 700, border: `1.5px solid ${f === b.id ? accent : 'rgba(11,30,61,0.12)'}`, background: f === b.id ? accent : '#fff', color: '#0B1E3D' }}>
              <Icon name="scissors" size={12} color={accent} />{nm(b).split(' ')[0]}
            </button>
          ))}
        </div>

        {/* list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {filtered.map(c => (
            <button key={c.id} onClick={() => setSel(c)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid rgba(11,30,61,0.06)', borderRadius: 16, padding: '12px 14px', cursor: 'pointer', font: 'inherit', textAlign: 'start', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(140deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FBF9F5', fontWeight: 700, fontSize: 17, flexShrink: 0 }}>{nm(c).trim()[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#0B1E3D' }}>{nm(c)}</div>
                <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.5)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon name="pin" size={12} color="rgba(11,30,61,0.4)" />{he ? c.regionHe : c.regionEn}
                  <span style={{ color: 'rgba(11,30,61,0.2)' }}>·</span>{c.visits} {t.custVisits}
                  {c.visits === 1 && <span style={{ fontSize: 10, fontWeight: 700, color: '#2E7D52', background: 'rgba(46,125,82,0.1)', padding: '1px 6px', borderRadius: 10 }}>{he ? 'חדש' : 'new'}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                <a href={'https://wa.me/972' + c.phone.replace(/^0/, '')} target="_blank" rel="noreferrer" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(30,190,93,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}><Icon name="whatsapp" size={17} color="#12a350" /></a>
                <a href={'tel:0' + c.phone.replace(/^0/, '')} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(200,162,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}><Icon name="phone" size={17} color={accent} /></a>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(11,30,61,0.4)', fontSize: 14 }}>{he ? 'לא נמצאו לקוחות' : 'No customers found'}</div>}
        </div>
      </Body>
      {sel && <CustomerCard lang={lang} t={t} accent={accent} serif={serif} client={resolveClient(sel, lang)} mode="admin" staff={staff} appts={appts} onClose={() => setSel(null)} toast={toast} />}
    </Shell>
  );
}

Object.assign(window, { CustomersScreen });
