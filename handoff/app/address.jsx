// address.jsx, Trust round 3: shared address UI (street+city, mini map, travel time from shop)
// Prototype: the map + drive time are illustrative; real build would call a maps API.
// Exports: estTravelMin, MiniMap, AddressBlock

// deterministic pseudo travel time (7-23 min) derived from the address text
function estTravelMin(addr) {
  const s = (addr || '').trim();
  if (s.length < 3) return 0;
  let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return 7 + (h % 17);
}

// small illustrative map card with the address pinned + route to the shop
function MiniMap({ lang, accent, addr }) {
  const he = lang === 'he';
  return (
    <div style={{ position: 'relative', height: 132, borderRadius: 16, overflow: 'hidden', background: '#e7edf2', border: '1px solid rgba(11,30,61,0.08)' }}>
      <svg viewBox="0 0 320 132" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <rect width="320" height="132" fill="#e7edf2" />
        {/* blocks */}
        <g fill="#dde5ec">
          <rect x="14" y="14" width="64" height="40" rx="4" /><rect x="92" y="10" width="78" height="34" rx="4" />
          <rect x="186" y="16" width="58" height="46" rx="4" /><rect x="258" y="12" width="52" height="40" rx="4" />
          <rect x="20" y="74" width="72" height="44" rx="4" /><rect x="108" y="80" width="66" height="40" rx="4" />
          <rect x="190" y="78" width="60" height="42" rx="4" /><rect x="262" y="76" width="48" height="44" rx="4" />
        </g>
        {/* roads */}
        <path d="M-10 64 H330 M0 122 H320" stroke="#cdd8e1" strokeWidth="10" fill="none" />
        <path d="M86 -10 V142 M252 -10 V142" stroke="#cdd8e1" strokeWidth="9" fill="none" />
        {/* route */}
        <path d="M52 100 Q90 64 150 64 T268 36" fill="none" stroke={accent} strokeWidth="4" strokeDasharray="2 7" strokeLinecap="round" />
      </svg>
      {/* home pin (customer) */}
      <span style={{ position: 'absolute', insetInlineStart: 42, bottom: 22, transform: 'translate(-50%,50%)' }}>
        <span style={{ display: 'block', width: 15, height: 15, borderRadius: '50%', background: '#2A6FDB', boxShadow: '0 0 0 4px rgba(42,111,219,0.25)' }} />
      </span>
      {/* shop pin */}
      <span style={{ position: 'absolute', insetInlineEnd: 40, top: 16 }}><Icon name="pin" size={28} color="#0B1E3D" fill="solid" /></span>
      {/* address chip */}
      <span style={{ position: 'absolute', insetInlineStart: 10, top: 10, maxWidth: '70%', fontSize: 11, fontWeight: 700, color: 'rgba(11,30,61,0.7)', background: 'rgba(255,255,255,0.85)', padding: '4px 9px', borderRadius: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{addr || (he ? 'הכתובת שלך' : 'Your address')}</span>
      <span style={{ position: 'absolute', insetInlineEnd: 10, bottom: 10, fontSize: 10, fontWeight: 700, color: 'rgba(11,30,61,0.5)', background: 'rgba(255,255,255,0.85)', padding: '3px 8px', borderRadius: 7 }}>{he ? 'מספרפי · אוסישקין 41' : 'Shop · Ussishkin 41'}</span>
    </div>
  );
}

// full block: map + drive-time card, shown once a real address is typed
function AddressBlock({ lang, accent, addr }) {
  const he = lang === 'he';
  if (!addr || addr.trim().length < 3) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, height: 132, borderRadius: 16, border: '1px dashed rgba(11,30,61,0.18)', background: 'rgba(11,30,61,0.02)', color: 'rgba(11,30,61,0.4)', fontSize: 13 }}>
        <Icon name="map" size={20} color="rgba(11,30,61,0.3)" />{he ? 'הזינו כתובת כדי לראות מפה וזמן נסיעה' : 'Enter an address to see the map & drive time'}
      </div>
    );
  }
  const mins = estTravelMin(addr);
  const km = (mins * 0.45).toFixed(1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <MiniMap lang={lang} accent={accent} addr={addr} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(140deg,#14305A,#0B1E3D)', borderRadius: 16, padding: '13px 15px' }}>
        <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(228,201,123,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="navigate" size={21} color="#E4C97B" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: 'rgba(251,249,245,0.6)', fontWeight: 600 }}>{he ? 'זמן נסיעה מהמספרה' : 'Drive time from the shop'}</div>
          <div style={{ fontFamily: "'Frank Ruhl Libre','Fraunces',serif", fontWeight: 700, fontSize: 19, color: '#FBF9F5', marginTop: 2 }}>
            {he ? `כ-${mins} דקות` : `~${mins} min`} <span style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(228,201,123,0.9)', fontFamily: 'Assistant, sans-serif' }}>· {he ? `${km} ק״מ` : `${km} km`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { estTravelMin, MiniMap, AddressBlock });
