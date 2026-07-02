// customercard.jsx, one unified customer card, opened from anywhere a client name is tapped.
// Pulls live identity from the profile (window.__meName) + the shared calendar (appts), no copies.
// Role privacy: a barber sees only visits with him; the manager sees the full picture.
// Exports: CustomerCard, resolveClient, custStore
const { useState: useCC } = React;

// ── single source for cancellations + internal flags (manager) ──
const custStore = {
  _load(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } },
  _save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  cancels() {
    let c = this._load('royale_cancels_v1', null);
    if (!c) { c = { c4: { count: 2, last: 'לפני חודש' }, c3: { count: 1, last: 'אתמול' } }; this._save('royale_cancels_v1', c); }
    return c;
  },
  bumpCancel(id) { const c = this.cancels(); const cur = c[id] || { count: 0 }; c[id] = { count: cur.count + 1, last: 'עכשיו' }; this._save('royale_cancels_v1', c); },
  flags() { return this._load('royale_flags_v1', {}); },
  setFlag(id, v) { const f = this.flags(); if (v) f[id] = true; else delete f[id]; this._save('royale_flags_v1', f); return f; },
  // Round B · manual PRIMARY-BARBER overrides (client's pick or Rafi's), keyed by customer id.
  primaries() { return this._load('royale_primary_v1', {}); },
  primaryOverride(id) { return id ? (this.primaries()[id] || null) : null; },
  setPrimary(id, barberId) { const p = this.primaries(); if (barberId) p[id] = barberId; else delete p[id]; this._save('royale_primary_v1', p); return p; },
};

// resolve an appt OR a customer record into one canonical client (dedup by id / name)
function resolveClient(ref, lang) {
  if (!ref) return null;
  const dirByName = (he, en) => DATA.customers.find(c => c.he === he || c.en === en);
  const synthEmail = (rec) => rec && rec.en ? rec.en.toLowerCase().replace(/[^a-z]+/g, '.') + '@email.com' : undefined;
  if (ref.svc || ref.barberId || ref.clientHe || ref.clientId) {
    // it's an appointment
    const rec = (ref.clientId && ref.clientId !== 'me' && DATA.customers.find(c => c.id === ref.clientId)) || dirByName(ref.clientHe, ref.clientEn);
    const isMe = ref.clientId === 'me';
    const he = isMe && window.__meName ? window.__meName : (ref.clientHe || (rec && rec.he));
    const en = isMe && window.__meName ? window.__meName : (ref.clientEn || (rec && rec.en));
    return { id: isMe ? 'me' : (rec ? rec.id : (ref.clientHe || 'x')), he, en, phone: (rec && rec.phone) || (ref.phone || '').replace('+972', '0'), email: isMe ? (window.__meEmail || synthEmail(rec)) : (rec && (rec.email || synthEmail(rec))), regionHe: rec && rec.regionHe, regionEn: rec && rec.regionEn, visits: rec && rec.visits, firstSeen: rec && rec.firstSeen, fav: rec && rec.fav, isMe };
  }
  // it's a directory customer record
  const isMe = ref.id === 'c1';
  return { ...ref, isMe, he: (isMe && window.__meName) ? window.__meName : ref.he, en: (isMe && window.__meName) ? window.__meName : ref.en, email: (isMe && window.__meEmail) ? window.__meEmail : (ref.email || synthEmail(ref)) };
}

function CustomerCard({ lang, t, accent, serif, client, mode, meId, staff, appts, onClose, onReschedule, toast }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const list = staff || DATA.barbers;
  const name = he ? client.he : client.en;
  const phoneDigits = (client.phone || '0500000000').replace(/[^0-9]/g, '');
  const phoneDisp = phoneDigits.replace(/^0?/, '0').replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
  const pad = n => String(n).padStart(2, '0');
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })();

  // visit history from the shared calendar, privacy-filtered by role
  const mine = (appts || []).filter(a => (a.clientId && a.clientId === client.id) || (client.isMe && a.clientId === 'me') || a.clientHe === client.he || a.clientEn === client.en);
  const visible = mine.filter(a => (mode === 'barber' && meId) ? a.barberId === meId : true);
  const sorted = [...visible].sort((x, y) => (y.date + y.start).localeCompare(x.date + x.start));
  const upcoming = sorted.filter(a => a.date >= today && a.status !== 'rejected' && a.status !== 'cancelled' && a.status !== 'no').sort((x, y) => (x.date + x.start).localeCompare(y.date + y.start));
  const lastBarberId = (sorted.find(a => a.date < today) || sorted[0] || {}).barberId;
  const lastBarber = list.find(b => b.id === lastBarberId);

  const storeKey = client.isMe ? 'me' : client.id;
  // cancellations = the store counter (client-side cancels, which leave no appointment
  // behind) + appointments cancelled from the calendar (which stay as a 'cancelled' record)
  const _cstore = custStore.cancels()[storeKey] || { count: 0 };
  const _calCancels = visible.filter(a => a.status === 'cancelled').length;
  const cancels = { count: _cstore.count + _calCancels, last: _calCancels > 0 ? (he ? 'מהיומן' : 'calendar') : _cstore.last };
  const noShows = visible.filter(a => a.status === 'no').length;

  const [flagged, setFlagged] = useCC(() => !!custStore.flags()[storeKey]);
  const [healthOpen, setHealthOpen] = useCC(false);
  const healthDoc = window.healthStore ? window.healthStore.get(storeKey) : null;
  const toggleFlag = () => { const v = !flagged; setFlagged(v); custStore.setFlag(storeKey, v); };
  // ── documents (manager only), send a saved/new doc, keep a sent trail ──
  const [sendDoc, setSendDoc] = useCC(false);
  const [docVer, setDocVer] = useCC(0);
  // ── Round 10 (manager only): prepay-required flag + punch-card balance ──
  const [prepayReq, setPrepayReq] = useCC(() => window.punchStore ? window.punchStore.prepayRequired(storeKey) : false);
  const togglePrepay = () => { const v = !prepayReq; setPrepayReq(v); if (window.punchStore) window.punchStore.setPrepay(storeKey, v); if (toast) toast(v ? (he ? 'סומן: חייב תשלום מראש' : 'Prepay required set') : (he ? 'הסימון הוסר' : 'Prepay flag removed'), v ? (he ? 'יחויב בביט/פייבוקס בסוף כל קביעת תור' : 'Pays at booking time') : (he ? 'יוכל לקבוע כרגיל' : 'Books normally')); };
  // ── Round B (manager only): primary-barber CRM assignment ──
  const [primEdit, setPrimEdit] = useCC(false);
  const [primVer, setPrimVer] = useCC(0);
  const punchCard = window.punchStore ? window.punchStore.cardFor(storeKey) : null;

  const reschedule = () => { if (upcoming[0] && onReschedule) onReschedule(upcoming[0]); else if (toast) toast(he ? 'אין תור עתידי לשינוי' : 'No upcoming visit', he ? 'קבעו תור חדש מהיומן' : 'Book from the calendar'); };

  const whenLbl = (a) => a.date === today ? (he ? 'היום' : 'today') : new Date(a.date + 'T00:00').toLocaleDateString(he ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short' });

  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 97, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '92%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        {/* header */}
        <div style={{ padding: '10px 20px 4px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <span style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px rgba(200,162,74,0.85)' }}>
              <ImgSlot id={client.isMe ? 'customer-avatar' : 'cust-' + client.id} shape="circle" placeholder={(name || '?').trim()[0]} style={{ width: 56, height: 56 }} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D' }}>{name}</span>
                {flagged && <span style={{ fontSize: 10.5, fontWeight: 700, color: '#B0413A', background: 'rgba(176,65,58,0.1)', padding: '2px 8px', borderRadius: 20 }}>{he ? 'מסומן' : 'Flagged'}</span>}
              </div>
              <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.55)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {client.regionHe && <><Icon name="pin" size={13} color={accent} />{he ? client.regionHe : client.regionEn}<span style={{ color: 'rgba(11,30,61,0.2)' }}>·</span></>}
                {visible.length} {t.custVisits}
              </div>
            </div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={17} color="#0B1E3D" /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 8px' }}>
          {/* contact details, live from profile */}
          <div style={{ background: '#fff', border: '1px solid rgba(11,30,61,0.1)', borderRadius: 14, padding: '6px 14px', marginBottom: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 0', borderBottom: client.email ? '1px solid rgba(11,30,61,0.06)' : 'none' }}>
              <Icon name="phone" size={16} color={accent} /><span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: '#0B1E3D', direction: 'ltr', textAlign: 'start' }}>{phoneDisp}</span>
            </div>
            {client.email && <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 0' }}><Icon name="mail" size={16} color={accent} /><span style={{ flex: 1, fontSize: 13.5, color: '#0B1E3D', direction: 'ltr', textAlign: 'start' }}>{client.email}</span></div>}
          </div>
          {/* quick stats: last barber · cancellations · no-shows */}
          <div style={{ display: 'flex', gap: 9, marginBottom: 14 }}>
            <div style={{ flex: 1, background: '#fff', borderRadius: 13, padding: '11px 13px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
              <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.45)', fontWeight: 600 }}>{he ? 'ספר אחרון' : 'Last barber'}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0B1E3D', marginTop: 3 }}>{lastBarber ? nm(lastBarber).split(' ')[0] : '-'}</div>
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: 13, padding: '11px 13px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)', border: cancels.count > 0 ? '1px solid rgba(176,65,58,0.25)' : 'none' }}>
              <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.45)', fontWeight: 600 }}>{he ? 'ביטולים' : 'Cancellations'}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: cancels.count > 0 ? '#B0413A' : '#0B1E3D', marginTop: 3 }}>{cancels.count}{cancels.count > 0 && cancels.last ? <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(11,30,61,0.45)' }}> · {cancels.last}</span> : ''}</div>
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: 13, padding: '11px 13px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)', border: noShows > 0 ? '1px solid rgba(176,65,58,0.25)' : 'none' }}>
              <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.45)', fontWeight: 600 }}>{t.noShowsLbl}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: noShows > 0 ? '#B0413A' : '#0B1E3D', marginTop: 3 }}>{noShows}</div>
            </div>
          </div>
          {/* actions */}
          <div style={{ display: 'flex', gap: 9, marginBottom: 12 }}>
            <button onClick={() => window.open('https://wa.me/972' + phoneDigits.replace(/^0/, ''), '_blank')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', borderRadius: 13, border: 'none', cursor: 'pointer', font: 'inherit', background: 'linear-gradient(135deg,#1ebe5d,#12a350)', color: '#fff', fontWeight: 700, fontSize: 13.5, boxShadow: '0 6px 16px rgba(30,190,93,0.3)' }}><Icon name="whatsapp" size={18} color="#fff" />WhatsApp</button>
            <button onClick={() => { window.location.href = 'tel:0' + phoneDigits.replace(/^0/, ''); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', borderRadius: 13, border: '1px solid rgba(11,30,61,0.12)', cursor: 'pointer', font: 'inherit', background: '#fff', color: '#0B1E3D', fontWeight: 700, fontSize: 13.5 }}><Icon name="phone" size={17} color={accent} />{t.contactCall}</button>
          </div>
          <div style={{ display: 'flex', gap: 9, marginBottom: 16 }}>
            <button onClick={reschedule} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', borderRadius: 13, border: '1px solid rgba(11,30,61,0.12)', cursor: 'pointer', font: 'inherit', background: '#fff', color: '#0B1E3D', fontWeight: 700, fontSize: 13.5 }}><Icon name="calendar" size={17} color={accent} />{t.reschedule}</button>
            {mode === 'admin' && <button onClick={toggleFlag} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', borderRadius: 13, border: `1px solid ${flagged ? '#B0413A' : 'rgba(11,30,61,0.12)'}`, cursor: 'pointer', font: 'inherit', background: flagged ? 'rgba(176,65,58,0.06)' : '#fff', color: flagged ? '#B0413A' : '#0B1E3D', fontWeight: 700, fontSize: 13.5 }}><Icon name={flagged ? 'check' : 'bell'} size={16} color={flagged ? '#B0413A' : accent} />{flagged ? (he ? 'מסומן' : 'Flagged') : (he ? 'סימון פנימי' : 'Flag')}</button>}
          </div>
          {/* send a document, manager only (rides the existing messaging rails) */}
          {mode === 'admin' && (
            <button onClick={() => setSendDoc(true)} className="tapsq" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', padding: '13px', borderRadius: 13, border: 'none', cursor: 'pointer', font: 'inherit', background: 'linear-gradient(135deg,#14305A,#0B1E3D)', color: '#FBF9F5', fontWeight: 700, fontSize: 14, marginBottom: 16, boxShadow: '0 8px 20px rgba(11,30,61,0.26)' }}><Icon name="send" size={18} color="#E4C97B" />{he ? 'שלח מסמך' : 'Send a document'}</button>
          )}
          {/* Round 10, manager-only billing controls: punch card + prepay flag */}
          {mode === 'admin' && punchCard && (() => {
            const used = window.punchStore.usedFor(storeKey, appts);
            const cb = list.find(b => b.id === punchCard.barberId);
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'linear-gradient(140deg,#14305A,#0B1E3D)', borderRadius: 13, padding: '11px 13px', marginBottom: 9, border: '1px solid rgba(228,201,123,0.35)' }}>
                <Icon name="card" size={18} color="#E4C97B" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#FBF9F5' }}>{he ? 'כרטיסיית תספורות' : 'Punch card'}{cb ? (he ? ` · אצל ${nm(cb).split(' ')[0]}` : ` · ${nm(cb).split(' ')[0]}`) : ''}</div>
                  <div style={{ marginTop: 5 }}>{window.PunchDots && <PunchDots used={used} total={punchCard.total} size={10} gap={4} light />}</div>
                </div>
                <span style={{ fontFamily: serif, fontWeight: 800, fontSize: 16, color: '#E4C97B', direction: 'ltr', flexShrink: 0 }}>{punchCard.total - used}/{punchCard.total}</span>
              </div>
            );
          })()}
          {mode === 'admin' && (
            <button onClick={togglePrepay} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: prepayReq ? 'rgba(176,65,58,0.05)' : '#fff', border: `1px solid ${prepayReq ? 'rgba(176,65,58,0.35)' : 'rgba(11,30,61,0.12)'}`, borderRadius: 13, padding: '11px 13px', marginBottom: 16 }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: prepayReq ? 'rgba(176,65,58,0.1)' : 'rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="coin" size={17} color={prepayReq ? '#B0413A' : 'rgba(11,30,61,0.5)'} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: prepayReq ? '#B0413A' : '#0B1E3D' }}>{he ? 'חייב תשלום מראש' : 'Prepay required'}</span>
                <span style={{ display: 'block', fontSize: 11, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{prepayReq ? (he ? 'ישלם בביט/פייבוקס בסוף כל קביעת תור · פטור כשמשלם בכרטיסייה' : 'Pays at booking · exempt with punch card') : (he ? 'מנהל בלבד · ללקוחות שמרבים לבטל' : 'Manager only · for chronic cancellers')}</span>
              </span>
              <span style={{ width: 42, height: 25, borderRadius: 14, padding: 3, boxSizing: 'border-box', flexShrink: 0, background: prepayReq ? '#B0413A' : 'rgba(11,30,61,0.18)', display: 'flex', justifyContent: prepayReq ? 'flex-end' : 'flex-start', transition: 'all .2s' }}><span style={{ width: 19, height: 19, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} /></span>
            </button>
          )}
          {/* Round B · primary barber (CRM association for group messaging), manager full picture */}
          {mode === 'admin' && (() => {
            void primVer; // re-resolve after an override change
            const pb = window.primaryBarber ? window.primaryBarber(client, appts) : (client.fav ? { id: client.fav, source: 'seed' } : null);
            const pbBarber = pb && list.find(b => b.id === pb.id);
            const srcLbl = !pb ? '' : pb.source === 'manual' ? (he ? 'נקבע ידנית' : 'Set manually')
              : pb.source === 'computed' ? (he ? `אוטומטי · ${pb.count} ביקורים` : `Auto · ${pb.count} visits`)
              : (he ? 'ברירת מחדל' : 'Default');
            const setP = (bid) => { custStore.setPrimary(client.id, bid); setPrimVer(v => v + 1); setPrimEdit(false); toast && toast(bid ? (he ? 'הספר הראשי עודכן' : 'Primary barber set') : (he ? 'חזרה לחישוב אוטומטי' : 'Back to automatic'), he ? 'לצורך הודעות קבוצתיות' : 'For group messaging'); };
            return (
              <div style={{ background: 'rgba(200,162,74,0.1)', border: `1px solid ${accent}33`, borderRadius: 13, padding: '11px 13px', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name="heart" size={17} color={accent} fill="solid" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.5)', fontWeight: 600 }}>{he ? 'הספר הראשי' : 'Primary barber'}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#0B1E3D' }}>{pbBarber ? nm(pbBarber) : (he ? 'לא נקבע' : 'None')}</span>
                      {pb && <span style={{ fontSize: 10.5, color: 'rgba(11,30,61,0.45)' }}>· {srcLbl}</span>}
                    </div>
                  </div>
                  <button onClick={() => setPrimEdit(e => !e)} style={{ font: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '6px 12px', borderRadius: 18, border: `1.5px solid ${accent}`, background: primEdit ? accent : '#fff', color: '#0B1E3D', flexShrink: 0 }}>{he ? 'שייך' : 'Assign'}</button>
                </div>
                {primEdit && (
                  <div className="confirm-grow" style={{ marginTop: 11 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 8 }}>{he ? 'שייך ידנית לספר ראשי' : 'Assign a primary barber'}</div>
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                      {list.filter(b => b.active !== false).map(b => {
                        const on = pb && pb.source === 'manual' && pb.id === b.id;
                        return <button key={b.id} onClick={() => setP(b.id)} style={{ font: 'inherit', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: '7px 12px', borderRadius: 18, border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.14)'}`, background: on ? accent : '#fff', color: '#0B1E3D' }}>{nm(b)}</button>;
                      })}
                      <button onClick={() => setP(null)} style={{ font: 'inherit', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: '7px 12px', borderRadius: 18, border: '1.5px dashed rgba(11,30,61,0.3)', background: 'transparent', color: 'rgba(11,30,61,0.6)' }}>{he ? 'אוטומטי' : 'Automatic'}</button>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.5)', marginTop: 9, lineHeight: 1.5 }}>{he ? 'בחירה ידנית גוברת על החישוב האוטומטי. משמשת לשיוך CRM להודעות קבוצתיות - נפרד מהתורים שלו ביומן.' : 'A manual pick overrides the automatic count. Used for CRM group messaging, separate from his calendar appointments.'}</div>
                  </div>
                )}
              </div>
            );
          })()}
          {/* Round H0 · marketing-consent status (manager only). Read-only view of the
              client's opt-in; the client controls it from their own profile. */}
          {mode === 'admin' && (() => {
            const consented = window.consentStore ? window.consentStore.hasFor(client.id) : false;
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', border: `1px solid ${consented ? 'rgba(46,125,82,0.3)' : 'rgba(11,30,61,0.12)'}`, borderRadius: 13, padding: '11px 13px', marginBottom: 14 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: consented ? 'rgba(46,125,82,0.1)' : 'rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={consented ? 'check' : 'spark'} size={17} color={consented ? '#2E7D52' : 'rgba(11,30,61,0.45)'} stroke={consented ? 2.4 : 2} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#0B1E3D' }}>{he ? 'תוכן שיווקי' : 'Marketing content'}</span>
                  <span style={{ display: 'block', fontSize: 11, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{consented ? (he ? 'הלקוח אישר לקבל מבצעים ועדכונים' : 'Opted in to offers & updates') : (he ? 'לא אישר - יקבל הודעות תפעוליות בלבד' : 'Not opted in - operational messages only')}</span>
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: consented ? '#2E7D52' : 'rgba(11,30,61,0.5)', background: consented ? 'rgba(46,125,82,0.1)' : 'rgba(11,30,61,0.06)', padding: '4px 11px', borderRadius: 20, flexShrink: 0 }}>{consented ? (he ? 'מאשר' : 'Opted in') : (he ? 'לא מאשר' : 'Opted out')}</span>
              </div>
            );
          })()}
          {/* documents sent to this client (manager full picture) */}
          {mode === 'admin' && <SentDocsHistory lang={lang} accent={accent} serif={serif} storeKey={storeKey} version={docVer} />}
          {/* Round 12/9: health declaration on the card. DIGITAL (full signed form) vs MANUAL
              (client stated they filled one in-shop before) are shown distinctly. */}
          {healthDoc && (() => {
            const manual = !!healthDoc.manual;
            const signed = new Date(healthDoc.signedAt);
            const dateStr = signed.toLocaleDateString(he ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            const timeStr = signed.toLocaleTimeString(he ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' });
            const rawPhone = (healthDoc.clientPhone || '').replace(/[^0-9]/g, '').replace(/^972/, '0');
            const phoneDisp = rawPhone ? rawPhone.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3') : '';
            return (
            <div style={{ background: '#fff', border: `1px solid ${manual ? 'rgba(156,123,46,0.4)' : accent + '44'}`, borderRadius: 14, marginBottom: 14, overflow: 'hidden' }}>
              <button onClick={() => setHealthOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: 'transparent', border: 'none', padding: '12px 14px' }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="file" size={19} color="#E4C97B" /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0B1E3D' }}>{he ? 'הצהרת בריאות' : 'Health declaration'}</span>
                    {manual
                      ? <span style={{ fontSize: 10, fontWeight: 800, color: '#9C7B2E', background: 'rgba(200,162,74,0.16)', padding: '2px 7px', borderRadius: 20 }}>{he ? 'סומן ידנית' : 'Manual'}</span>
                      : <span style={{ fontSize: 10, fontWeight: 800, color: '#2E7D52', background: 'rgba(46,125,82,0.12)', padding: '2px 7px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="check" size={10} color="#2E7D52" stroke={3} />{he ? 'מולא דיגיטלית' : 'Digital'}</span>}
                  </span>
                  <span style={{ display: 'block', fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 2 }}>{manual ? (he ? 'סומן' : 'Marked') : (he ? 'נחתמה' : 'Signed')} {dateStr}{healthDoc.svcHe ? ' · ' + (he ? healthDoc.svcHe : healthDoc.svcEn) : ''}</span>
                </span>
                <Icon name={healthOpen ? 'chevron' : (he ? 'chevron' : 'chevronR')} size={16} color="rgba(11,30,61,0.35)" style={{ transform: healthOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
              </button>
              {healthOpen && (
                <div style={{ padding: '0 14px 14px', borderTop: '1px solid rgba(11,30,61,0.06)' }}>
                  {manual ? (
                    <div style={{ marginTop: 11, display: 'flex', alignItems: 'flex-start', gap: 8, padding: '11px 13px', background: 'rgba(200,162,74,0.08)', borderRadius: 11 }}>
                      <Icon name="bell" size={15} color="#9C7B2E" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.72)', lineHeight: 1.55 }}>{he ? 'הלקוח הצהיר שמילא הצהרת בריאות במספרה בעבר. לא קיים טופס דיגיטלי מלא במערכת - סומן ידנית כדי שלא יישאל שוב.' : 'Client stated they filled a declaration in-shop previously. No full digital form is on record - marked manually so they aren’t asked again.'}</span>
                    </div>
                  ) : (
                    <React.Fragment>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(11,30,61,0.5)', margin: '11px 0 7px' }}>{he ? 'סעיפים שסומנו' : 'Items flagged'}</div>
                      {(healthDoc.flagged && healthDoc.flagged.length) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {healthDoc.flagged.map((f, k) => (
                            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#0B1E3D' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#B0413A', flexShrink: 0 }} />{f}</div>
                          ))}
                        </div>
                      ) : <div style={{ fontSize: 12.5, color: '#2E7D52', display: 'flex', alignItems: 'center', gap: 7 }}><Icon name="check" size={14} color="#2E7D52" />{he ? 'לא סומנו סעיפים מיוחדים' : 'No items flagged'}</div>}
                      {healthDoc.notes ? <div style={{ marginTop: 10, fontSize: 12.5, color: 'rgba(11,30,61,0.7)', lineHeight: 1.5, background: 'rgba(11,30,61,0.03)', borderRadius: 10, padding: '9px 11px' }}><b style={{ color: '#0B1E3D' }}>{he ? 'הערות: ' : 'Notes: '}</b>{healthDoc.notes}</div> : null}
                      <div style={{ marginTop: 11, display: 'flex', alignItems: 'flex-start', gap: 7, padding: '9px 11px', background: 'rgba(200,162,74,0.1)', borderRadius: 10 }}>
                        <Icon name="check" size={14} color="#9C7B2E" style={{ flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontSize: 12, color: 'rgba(11,30,61,0.7)', lineHeight: 1.45 }}>{healthDoc.confirmedText || (he ? 'הלקוח אישר שכל הפרטים נכונים ומלאים' : 'Client confirmed all details are true and complete')}</span>
                      </div>
                    </React.Fragment>
                  )}
                  {/* legal stamp - name · phone · date+time of the simple electronic signature */}
                  <div style={{ marginTop: 11, paddingTop: 11, borderTop: '1px dashed rgba(11,30,61,0.12)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {healthDoc.clientName ? <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.6)' }}><b style={{ color: '#0B1E3D' }}>{he ? 'שם: ' : 'Name: '}</b>{healthDoc.clientName}</div> : null}
                    {phoneDisp ? <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.6)' }}><b style={{ color: '#0B1E3D' }}>{he ? 'טלפון: ' : 'Phone: '}</b><span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{phoneDisp}</span></div> : null}
                    <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.6)' }}><b style={{ color: '#0B1E3D' }}>{he ? 'חתימה אלקטרונית: ' : 'E-signature: '}</b><span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{dateStr} · {timeStr}</span></div>
                  </div>
                </div>
              )}
            </div>
            );
          })()}
          {/* visit history */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 15.5, color: '#0B1E3D' }}>{t.custHistory}</span>
            {mode === 'barber' && <span style={{ fontSize: 11, color: 'rgba(11,30,61,0.4)' }}>{he ? 'התורים אצלך' : 'with you'}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {sorted.length === 0 && <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.4)', textAlign: 'center', padding: '14px' }}>{he ? 'אין היסטוריה' : 'No history'}</div>}
            {sorted.slice(0, 8).map(a => {
              const svc = DATA.services.find(s => s.id === a.svc); const b = list.find(x => x.id === a.barberId);
              const up = a.date >= today; const no = a.status === 'no'; const rej = a.status === 'rejected' || a.status === 'cancelled'; const dim = no || rej;
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', borderRadius: 13, padding: '10px 13px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)', opacity: dim ? 0.6 : 1, borderInlineStart: no ? '3px solid #B0413A' : 'none' }}>
                  <span style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={no ? 'x' : 'scissors'} size={15} color={no ? '#B0413A' : accent} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0B1E3D' }}>{svc ? nm(svc) : ''}{no ? (he ? ' · לא הגיע' : ' · no-show') : rej ? (he ? ' · בוטל' : ' · cancelled') : ''}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{b ? nm(b).split(' ')[0] : ''}{up && !dim ? (he ? ' · מתוכנן' : ' · upcoming') : ''}</div>
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(11,30,61,0.45)', direction: 'ltr', unicodeBidi: 'isolate' }}>{whenLbl(a)} {a.start}</span>
                </div>
              );
            })}
          </div>
          {client.firstSeen && <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.4)', textAlign: 'center', padding: '4px 0 calc(14px + env(safe-area-inset-bottom))' }}>{t.custSince} {client.firstSeen}</div>}
        </div>
      </div>
      {mode === 'admin' && sendDoc && window.SendDocumentSheet && (
        <SendDocumentSheet lang={lang} t={t} accent={accent} serif={serif} client={client} toast={toast}
          onClose={() => setSendDoc(false)} onSent={() => { setDocVer(v => v + 1); setSendDoc(false); }} />
      )}
    </div>
  );
}

window.custStore = custStore;
Object.assign(window, { CustomerCard, resolveClient, custStore });

// ── Round H0 · marketing-consent store (Israeli anti-spam compliance) ──────
// Single source of truth for "is this customer opted-in to MARKETING content".
// Default for a NEW customer is OFF (no consent). The seed flag (DATA.customers
// .marketing) is the starting state; an explicit opt-in/opt-out override in
// localStorage always wins. The logged-in demo customer is c1, so 'me' === c1.
const consentStore = {
  KEY: 'royale_consent_v1',
  _norm(id) { return id === 'me' ? 'c1' : id; },
  _load() { try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; } catch (e) { return {}; } },
  _save(m) { try { localStorage.setItem(this.KEY, JSON.stringify(m)); } catch (e) {} },
  seedOf(id) { const c = DATA.customers.find(x => x.id === this._norm(id)); return !!(c && c.marketing); },
  // explicit override wins, else the seed, else false (new customers default OFF)
  hasFor(id) { const k = this._norm(id); const m = this._load(); if (k in m) return !!m[k]; return this.seedOf(k); },
  set(id, v) { const m = this._load(); m[this._norm(id)] = !!v; this._save(m); return m; },
};
window.consentStore = consentStore;
