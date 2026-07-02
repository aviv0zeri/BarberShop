// documents.jsx, Round 9: forms & documents
// ── Manager-only feature. Two surfaces, one shared store: ──
//   1. DocumentsManager, Rafi's library. He uploads forms/docs (file or gallery);
//      everything saved here becomes sendable from a client card.
//   2. SendDocumentSheet, opened from the customer card. Pick a saved doc OR attach
//      a fresh one now, write a note, send by Email or WhatsApp only (SMS/banner are
//      not document-grade channels, so they're absent here on purpose).
//   3. SentDocsHistory, the trail of what was already sent, and to whom, on the card.
// Rides the EXISTING messaging rails (wa.me / mailto), just with a file attached.
// Exports: docStore, DocumentsManager, SendDocumentSheet, SentDocsHistory
const { useState: useDoc, useRef: useDocRef } = React;

// ── Seed library so the "choose from saved" path is alive out of the box ──
const _DAY = 86400000;
const SEED_DOCS = [
  { id: 'docseed1', name: 'טופס רישום לקוח חדש.pdf', kind: 'pdf', size: 142000, addedAt: Date.now() - 9 * _DAY, thumb: null, builtin: true },
  { id: 'docseed2', name: 'מחירון מספרפי 2026.pdf', kind: 'pdf', size: 88000, addedAt: Date.now() - 4 * _DAY, thumb: null, builtin: true },
  { id: 'docseed3', name: 'אישור והצהרת בריאות.pdf', kind: 'pdf', size: 64000, addedAt: Date.now() - 1 * _DAY, thumb: null, builtin: true },
];

const docStore = {
  _load(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
  _save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  lib() {
    let l = this._load('royale_docs_v1', null);
    if (!l) { l = SEED_DOCS.slice(); this._save('royale_docs_v1', l); }
    return l;
  },
  add(doc) { const l = [doc, ...this.lib()]; this._save('royale_docs_v1', l); return l; },
  remove(id) { const l = this.lib().filter(d => d.id !== id); this._save('royale_docs_v1', l); return l; },
  rename(id, name) { const l = this.lib().map(d => d.id === id ? { ...d, name } : d); this._save('royale_docs_v1', l); return l; },
  byId(id) { return this.lib().find(d => d.id === id); },
  // ── sent history, keyed by client (mirrors custStore's storeKey) ──
  sent() { return this._load('royale_docsent_v1', {}); },
  sentFor(key) { return this.sent()[key] || []; },
  logSent(key, entry) { const s = this.sent(); s[key] = [entry, ...(s[key] || [])]; this._save('royale_docsent_v1', s); return s[key]; },
  sentCount(docId) { const s = this.sent(); let n = 0; Object.values(s).forEach(arr => arr.forEach(e => { if (e.docId === docId) n++; })); return n; },
};
window.docStore = docStore;

// ── shared visual atoms ─────────────────────────────────────────────────
const KIND_META = {
  pdf: { icon: 'file', color: '#B0413A', he: 'PDF', en: 'PDF' },
  image: { icon: 'image', color: '#2A6FDB', he: 'תמונה', en: 'Image' },
  doc: { icon: 'file', color: '#0E7C66', he: 'מסמך', en: 'Document' },
};
function kindOf(file) {
  if (/^image\//.test(file.type)) return 'image';
  if (/pdf/i.test(file.type) || /\.pdf$/i.test(file.name)) return 'pdf';
  return 'doc';
}
function prettySize(b) { if (!b) return ''; return b > 1e6 ? (b / 1e6).toFixed(1) + 'MB' : Math.max(1, Math.round(b / 1e3)) + 'KB'; }
function docDateLabel(ts, he) {
  const d = new Date(ts), now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return he ? 'היום' : 'today';
  const y = new Date(now - _DAY);
  if (d.toDateString() === y.toDateString()) return he ? 'אתמול' : 'yesterday';
  return d.toLocaleDateString(he ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short' });
}

// read a chosen file into a library record (downscaled thumb for images, glyph for the rest)
function readDocFile(file) {
  return new Promise((resolve) => {
    const kind = kindOf(file);
    const base = { id: 'doc' + Date.now() + Math.floor(Math.random() * 9999), name: file.name, kind, size: file.size, addedAt: Date.now(), thumb: null };
    if (kind !== 'image') return resolve(base);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const max = 220, scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * scale)); c.height = Math.max(1, Math.round(img.height * scale));
        try { c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); base.thumb = c.toDataURL('image/jpeg', 0.7); } catch (_) {}
        resolve(base);
      };
      img.onerror = () => resolve(base);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(base);
    reader.readAsDataURL(file);
  });
}

// the little square that fronts every document (thumb for images, tinted glyph otherwise)
function DocThumb({ doc, size = 46 }) {
  const m = KIND_META[doc.kind] || KIND_META.doc;
  if (doc.thumb) return <span style={{ width: size, height: size, borderRadius: 12, overflow: 'hidden', flexShrink: 0, display: 'block', boxShadow: '0 1px 4px rgba(11,30,61,0.12)' }}><img src={doc.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></span>;
  return <span style={{ width: size, height: size, borderRadius: 12, flexShrink: 0, background: m.color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={m.icon} size={size * 0.46} color={m.color} /></span>;
}

// ════════════════════════════════════════════════════════════════════════
// PART 1 · DocumentsManager, Rafi's library (admin dashboard area)
// ════════════════════════════════════════════════════════════════════════
function DocumentsManager({ lang, t, accent, serif, onBack, toast }) {
  const he = lang === 'he';
  const [lib, setLib] = useDoc(() => docStore.lib());
  const [busy, setBusy] = useDoc(false);
  const [editId, setEditId] = useDoc(null);
  const [editVal, setEditVal] = useDoc('');
  const fileRef = useDocRef(null), galRef = useDocRef(null);

  const onPick = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    let next = docStore.lib();
    for (const f of files) { const rec = await readDocFile(f); next = docStore.add(rec); }
    setLib(next); setBusy(false);
    toast && toast(he ? (files.length > 1 ? `${files.length} מסמכים נוספו ✓` : 'המסמך נוסף ✓') : `${files.length} added ✓`, he ? 'זמין לשליחה מכל כרטיס לקוח' : 'Sendable from any client card');
  };
  const del = (id) => { const next = docStore.remove(id); setLib(next); toast && toast(he ? 'המסמך הוסר' : 'Removed', he ? 'לא יוצג עוד ברשימת השליחה' : 'No longer sendable'); };
  const startRename = (d) => { setEditId(d.id); setEditVal(d.name); };
  const saveRename = () => { if (editId && editVal.trim()) { const next = docStore.rename(editId, editVal.trim()); setLib(next); } setEditId(null); };

  const UpBtn = ({ icon, label, sub, onClick }) => (
    <button onClick={onClick} disabled={busy} className="tapsq" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 9, background: '#fff', border: `1.5px dashed ${accent}66`, borderRadius: 18, padding: '15px 15px', cursor: busy ? 'wait' : 'pointer', font: 'inherit', textAlign: 'start', opacity: busy ? 0.6 : 1, boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
      <span style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,rgba(228,201,123,0.24),rgba(200,162,74,0.16))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={21} color={accent} /></span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14.5, color: '#0B1E3D' }}>{label}</div>
        <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{sub}</div>
      </div>
    </button>
  );

  return (
    <Shell>
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,image/*" multiple onChange={onPick} style={{ display: 'none' }} />
      <input ref={galRef} type="file" accept="image/*" multiple onChange={onPick} style={{ display: 'none' }} />
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל · רפי בלבד' : 'Admin · Rafi only'} title={he ? 'טפסים ומסמכים' : 'Forms & documents'} onBack={onBack}
        right={lib.length ? <span style={{ fontSize: 12.5, fontWeight: 700, color: accent, background: 'rgba(200,162,74,0.12)', padding: '5px 11px', borderRadius: 20 }}>{lib.length}</span> : null} />
      <Body>
        <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.55)', marginInlineStart: 2, lineHeight: 1.5 }}>{he ? 'העלו טפסים ומסמכים פעם אחת, וכל מסמך כאן הופך זמין לשליחה ישירות מכרטיס הלקוח.' : 'Upload forms & documents once, each becomes sendable straight from any client card.'}</div>

        {/* upload */}
        <div style={{ display: 'flex', gap: 10 }}>
          <UpBtn icon="paperclip" label={he ? 'העלאת קובץ' : 'Upload file'} sub={he ? 'PDF · מסמך' : 'PDF · doc'} onClick={() => fileRef.current && fileRef.current.click()} />
          <UpBtn icon="image" label={he ? 'מהגלריה' : 'From gallery'} sub={he ? 'תמונה · צילום' : 'Photo · image'} onClick={() => galRef.current && galRef.current.click()} />
        </div>

        {/* library */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 16, color: '#0B1E3D' }}>{he ? 'המסמכים השמורים' : 'Saved documents'}</span>
          {lib.length > 0 && <span style={{ fontSize: 12, color: 'rgba(11,30,61,0.45)' }}>{lib.length} {he ? 'פריטים' : 'items'}</span>}
        </div>

        {lib.length === 0 && (
          <div style={{ textAlign: 'center', padding: '46px 24px', background: '#fff', borderRadius: 20, border: '1px dashed rgba(11,30,61,0.16)' }}>
            <span style={{ display: 'inline-flex', width: 58, height: 58, borderRadius: 16, background: 'rgba(200,162,74,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}><Icon name="file" size={28} color={accent} /></span>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 17, color: '#0B1E3D' }}>{he ? 'עוד אין מסמכים' : 'No documents yet'}</div>
            <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.5)', marginTop: 5 }}>{he ? 'העלו טופס או מסמך כדי להתחיל' : 'Upload a form or document to start'}</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {lib.map(d => {
            const m = KIND_META[d.kind] || KIND_META.doc;
            const sent = docStore.sentCount(d.id);
            const editing = editId === d.id;
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 16, padding: '11px 13px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
                <DocThumb doc={d} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editing ? (
                    <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={saveRename} onKeyDown={e => e.key === 'Enter' && saveRename()}
                      style={{ width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 14, fontWeight: 600, color: '#0B1E3D', background: 'rgba(11,30,61,0.04)', border: `1px solid ${accent}`, borderRadius: 9, padding: '7px 9px', outline: 'none', direction: he ? 'rtl' : 'ltr', textAlign: 'start' }} />
                  ) : (
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0B1E3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} dir="auto">{d.name}</div>
                  )}
                  <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: m.color }}>{m[lang]}</span>
                    <span style={{ color: 'rgba(11,30,61,0.2)' }}>·</span>{docDateLabel(d.addedAt, he)}
                    {d.size ? <><span style={{ color: 'rgba(11,30,61,0.2)' }}>·</span>{prettySize(d.size)}</> : null}
                    {sent > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700, color: accent }}><span style={{ color: 'rgba(11,30,61,0.2)' }}>·</span><Icon name="send" size={11} color={accent} />{he ? `נשלח ${sent}` : `sent ${sent}`}</span>}
                  </div>
                </div>
                {!editing && <button onClick={() => startRename(d)} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }} title={he ? 'שינוי שם' : 'Rename'}><Icon name="pencil" size={15} color="rgba(11,30,61,0.55)" /></button>}
                <button onClick={() => del(d.id)} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(176,65,58,0.2)', background: 'rgba(176,65,58,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }} title={he ? 'מחיקה' : 'Delete'}><Icon name="trash" size={15} color="#B0413A" /></button>
              </div>
            );
          })}
        </div>
      </Body>
    </Shell>
  );
}

// ════════════════════════════════════════════════════════════════════════
// PART 2 · SendDocumentSheet, opened from the customer card (admin only)
// ════════════════════════════════════════════════════════════════════════
function SendDocumentSheet({ lang, t, accent, serif, client, onClose, onSent, toast }) {
  const he = lang === 'he';
  const name = (he ? client.he : client.en) || (client.he || client.en || '');
  const first = (name || '').trim().split(' ')[0];
  const storeKey = client.isMe ? 'me' : client.id;
  const phoneDigits = (client.phone || '').replace(/[^0-9]/g, '');
  const email = client.email || '';

  const [lib, setLib] = useDoc(() => docStore.lib());
  const [pickId, setPickId] = useDoc(lib[0] ? lib[0].id : null);
  const [busy, setBusy] = useDoc(false);
  const [channel, setChannel] = useDoc(phoneDigits ? 'whatsapp' : 'email');
  const [msg, setMsg] = useDoc(he ? `שלום ${first}, מצורף עבורך מסמך מהמספרה. נשמח אם תעיין/י ותחזור/י אלינו בכל שאלה. תודה, מספרפי.` : `Hi ${first}, please find the attached document from the shop. Let us know if you have any questions. Thanks, Barbershop.`);
  const galRef = useDocRef(null);

  const doc = lib.find(d => d.id === pickId) || null;
  const attachNew = async (e) => {
    const f = (e.target.files || [])[0]; e.target.value = '';
    if (!f) return;
    setBusy(true);
    const rec = await readDocFile(f);
    const next = docStore.add(rec);       // uploading anywhere makes it reusable
    setLib(next); setPickId(rec.id); setBusy(false);
    toast && toast(he ? 'צורף ונשמר בספרייה ✓' : 'Attached & saved ✓', he ? 'נבחר לשליחה' : 'Selected to send');
  };

  // channels: Email + WhatsApp ONLY, SMS / banner deliberately excluded for documents
  const channels = [
    { id: 'whatsapp', icon: 'whatsapp', label: 'WhatsApp', color: '#12a350', avail: !!phoneDigits, missing: he ? 'אין מספר טלפון' : 'No phone' },
    { id: 'email', icon: 'mail', label: he ? 'אימייל' : 'Email', color: accent, avail: !!email, missing: he ? 'אין אימייל' : 'No email' },
  ];
  const canSend = !!doc && !!msg.trim() && (channels.find(c => c.id === channel)?.avail);

  const send = () => {
    if (!canSend) return;
    docStore.logSent(storeKey, { id: 's' + Date.now(), docId: doc.id, docName: doc.name, kind: doc.kind, channel, at: Date.now(), message: msg.trim() });
    const note = (he ? '\n\n📎 מצורף: ' : '\n\n📎 Attachment: ') + doc.name;
    if (channel === 'whatsapp' && phoneDigits) {
      window.open('https://wa.me/' + phoneDigits.replace(/^0/, '972') + '?text=' + encodeURIComponent(msg.trim() + note), '_blank');
    } else if (channel === 'email' && email) {
      const subj = he ? 'מסמך ממספרפי' : 'A document from Barbershop';
      window.open('mailto:' + email + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(msg.trim() + note), '_blank');
    }
    toast && toast(he ? 'המסמך נשלח ✓' : 'Document sent ✓', he ? `${doc.name} · ל${first}` : `${doc.name} · to ${first}`);
    onSent && onSent();
  };

  const inp = { width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 14.5, lineHeight: 1.55, color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.12)', borderRadius: 14, padding: '12px 13px', outline: 'none', resize: 'none', direction: he ? 'rtl' : 'ltr', textAlign: 'start' };

  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 99, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <input ref={galRef} type="file" accept=".pdf,.doc,.docx,image/*" onChange={attachNew} style={{ display: 'none' }} />
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '94%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '10px auto 4px', flexShrink: 0 }} />
        {/* header */}
        <div style={{ padding: '6px 18px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="send" size={23} color="#0B1E3D" /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, color: accent, textTransform: 'uppercase' }}>{he ? 'שליחת מסמך' : 'Send a document'}</div>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D', lineHeight: 1.1 }} dir="auto">{he ? `אל ${name}` : `To ${name}`}</div>
            </div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={17} color="#0B1E3D" /></button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px 6px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* choose document */}
          <div>
            <Label serif={serif}>{he ? 'בחרו מסמך' : 'Choose a document'}</Label>
            <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.5)', margin: '-4px 2px 9px' }}>{he ? 'מהמסמכים השמורים, או צרפו חדש כעת.' : 'From your saved files, or attach a new one now.'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* attach new */}
              <button onClick={() => galRef.current && galRef.current.click()} disabled={busy} className="tapsq" style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: `1.5px dashed ${accent}66`, borderRadius: 14, padding: '11px 13px', cursor: busy ? 'wait' : 'pointer', font: 'inherit', textAlign: 'start', opacity: busy ? 0.6 : 1 }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(200,162,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="paperclip" size={19} color={accent} /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0B1E3D' }}>{he ? 'צירוף מסמך חדש' : 'Attach a new document'}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{he ? 'קובץ או מהגלריה · יישמר גם בספרייה' : 'File or gallery · saved to library too'}</div>
                </div>
                <Icon name="plus" size={18} color={accent} />
              </button>
              {/* saved docs (radio) */}
              {lib.map(d => {
                const on = pickId === d.id;
                return (
                  <button key={d.id} onClick={() => setPickId(d.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: on ? accent + '12' : '#fff', border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.08)'}`, borderRadius: 14, padding: '10px 13px', cursor: 'pointer', font: 'inherit', textAlign: 'start' }}>
                    <DocThumb doc={d} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: '#0B1E3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} dir="auto">{d.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.5)', marginTop: 2 }}>{(KIND_META[d.kind] || KIND_META.doc)[lang]}{d.size ? ' · ' + prettySize(d.size) : ''}</div>
                    </div>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.2)'}`, background: on ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <Icon name="check" size={13} color="#fff" stroke={2.6} />}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* message */}
          <div>
            <Label serif={serif}>{he ? 'הודעה ללקוח' : 'Message to client'}</Label>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4} style={inp} />
          </div>

          {/* channel, Email + WhatsApp only */}
          <div>
            <Label serif={serif}>{he ? 'ערוץ שליחה' : 'Send via'}</Label>
            <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.5)', margin: '-4px 2px 9px' }}>{he ? 'מסמכים נשלחים במייל או בוואטסאפ בלבד.' : 'Documents go by email or WhatsApp only.'}</div>
            <div style={{ display: 'flex', gap: 9 }}>
              {channels.map(c => {
                const on = channel === c.id;
                return (
                  <button key={c.id} onClick={() => c.avail && setChannel(c.id)} disabled={!c.avail} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, background: on ? c.color + '14' : '#fff', border: `1.5px solid ${on ? c.color : 'rgba(11,30,61,0.1)'}`, borderRadius: 14, padding: '12px 13px', cursor: c.avail ? 'pointer' : 'not-allowed', font: 'inherit', textAlign: 'start', opacity: c.avail ? 1 : 0.5 }}>
                    <span style={{ width: 34, height: 34, borderRadius: 10, background: on ? c.color + '22' : 'rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={c.icon} size={18} color={on ? c.color : 'rgba(11,30,61,0.45)'} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0B1E3D' }}>{c.label}</div>
                      <div style={{ fontSize: 10.5, color: 'rgba(11,30,61,0.5)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', direction: 'ltr', textAlign: 'start' }}>{c.avail ? (c.id === 'whatsapp' ? (client.phone || '') : email) : c.missing}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* send */}
        <div style={{ padding: '10px 18px calc(16px + env(safe-area-inset-bottom))', flexShrink: 0, borderTop: '1px solid rgba(11,30,61,0.06)' }}>
          <button onClick={send} disabled={!canSend} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '15px', borderRadius: 16, border: 'none', cursor: canSend ? 'pointer' : 'not-allowed', opacity: canSend ? 1 : 0.45, font: 'inherit', fontSize: 16, fontWeight: 700, background: channel === 'whatsapp' ? 'linear-gradient(135deg,#1ebe5d,#12a350)' : 'linear-gradient(135deg,#E4C97B,#C8A24A)', color: channel === 'whatsapp' ? '#fff' : '#0B1E3D', boxShadow: channel === 'whatsapp' ? '0 8px 22px rgba(30,190,93,0.3)' : '0 8px 22px rgba(200,162,74,0.32)' }}>
            <Icon name={channel === 'whatsapp' ? 'whatsapp' : 'mail'} size={20} color={channel === 'whatsapp' ? '#fff' : '#0B1E3D'} />{he ? 'שלח מסמך' : 'Send document'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// PART 3 · SentDocsHistory, the trail on the client card (admin only)
// ════════════════════════════════════════════════════════════════════════
function SentDocsHistory({ lang, accent, serif, storeKey, version }) {
  const he = lang === 'he';
  const rows = docStore.sentFor(storeKey);
  const chMeta = { whatsapp: { icon: 'whatsapp', color: '#12a350', he: 'וואטסאפ', en: 'WhatsApp' }, email: { icon: 'mail', color: accent, he: 'מייל', en: 'Email' } };
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 15.5, color: '#0B1E3D' }}>{he ? 'מסמכים שנשלחו' : 'Documents sent'}</span>
        {rows.length > 0 && <span style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.4)' }}>{rows.length}</span>}
      </div>
      {rows.length === 0 ? (
        <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.42)', background: '#fff', borderRadius: 13, padding: '13px', textAlign: 'center', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>{he ? 'טרם נשלחו מסמכים ללקוח זה' : 'No documents sent to this client yet'}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map(r => {
            const cm = chMeta[r.channel] || chMeta.email;
            const m = KIND_META[r.kind] || KIND_META.doc;
            const d = new Date(r.at);
            const when = d.toLocaleDateString(he ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short' }) + ' · ' + d.toLocaleTimeString(he ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', borderRadius: 13, padding: '10px 13px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: m.color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={m.icon} size={16} color={m.color} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0B1E3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} dir="auto">{r.docName}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name={cm.icon} size={12} color={cm.color} />{cm[lang]}<span style={{ color: 'rgba(11,30,61,0.2)' }}>·</span>{when}</div>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: '#2E7D52', background: 'rgba(46,125,82,0.1)', padding: '3px 9px', borderRadius: 20, flexShrink: 0 }}>{he ? 'נשלח' : 'sent'}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { docStore, DocumentsManager, SendDocumentSheet, SentDocsHistory, readDocFile });
