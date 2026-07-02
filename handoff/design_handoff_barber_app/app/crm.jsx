// crm.jsx, Round 6 CRM automations: waitlist store, dormant detection, "we miss you", rebook helper.
// All derived from the shared calendar + CRM metrics, no separate counts.
const { useState: useCRM } = React;

// ── Waitlist (taken slot → join; on cancel → notify first in line) ──
const waitlist = {
  all() { try { return JSON.parse(localStorage.getItem('royale_waitlist_v1')) || []; } catch (e) { return []; } },
  save(a) { try { localStorage.setItem('royale_waitlist_v1', JSON.stringify(a)); } catch (e) {} },
  join(e) { const a = this.all(); if (!a.some(x => x.barberId === e.barberId && x.date === e.date && x.clientId === e.clientId)) { a.push({ ...e, ts: Date.now() }); this.save(a); } },
  firstFor(barberId, date) { return this.all().filter(x => x.barberId === barberId && x.date === date).sort((a, b) => a.ts - b.ts)[0] || null; },
  has(barberId, date, clientId) { return this.all().some(x => x.barberId === barberId && x.date === date && x.clientId === clientId); },
  remove(pred) { this.save(this.all().filter(x => !pred(x))); },
  // ── Round #4 · the queue for one freed slot, in fair join-order (longest wait first) ──
  queueFor(barberId, date) { return this.all().filter(x => x.barberId === barberId && x.date === date).sort((a, b) => a.ts - b.ts); },

  // ── Round #4 · atomic lock on a freed slot ──────────────────────────────
  // A freed slot is a single shared resource. The FIRST claim wins and writes the
  // lock; every later claim reads that the lock is already held and loses. The whole
  // read-check-write happens synchronously against localStorage, so two near-simultaneous
  // taps can never both win - exactly one returns true.
  _lockKey: 'royale_slotlocks_v1',
  _locks() { try { return JSON.parse(localStorage.getItem(this._lockKey)) || {}; } catch (e) { return {}; } },
  _saveLocks(o) { try { localStorage.setItem(this._lockKey, JSON.stringify(o)); } catch (e) {} },
  slotId(barberId, date, hhmm) { return `${barberId}|${date}|${hhmm}`; },
  // attempt to claim. returns {won:true} for the first caller, {won:false, by} for the rest.
  claimSlot(barberId, date, hhmm, clientId) {
    const locks = this._locks();
    const key = this.slotId(barberId, date, hhmm);
    const cur = locks[key];
    if (cur && cur.clientId && cur.clientId !== clientId && (Date.now() - cur.ts) < 120000) {
      return { won: false, by: cur.clientId };           // already locked by someone else (within TTL)
    }
    locks[key] = { clientId, ts: Date.now() };
    this._saveLocks(locks);
    return { won: true };
  },
  lockedBy(barberId, date, hhmm) {
    const l = this._locks()[this.slotId(barberId, date, hhmm)];
    return (l && (Date.now() - l.ts) < 120000) ? l.clientId : null;
  },
  clearLock(barberId, date, hhmm) { const l = this._locks(); delete l[this.slotId(barberId, date, hhmm)]; this._saveLocks(l); },
  // drop locks older than 2 min so a freed-then-released slot can be offered again
  purgeLocks() { const l = this._locks(); let ch = false; Object.keys(l).forEach(k => { if (Date.now() - l[k].ts > 120000) { delete l[k]; ch = true; } }); if (ch) this._saveLocks(l); },
};
window.waitlist = waitlist;

// deterministic "days since last visit" per client → dormant list (derived from CRM churn)
function dormantClients(days) {
  const thr = days || 60;
  return DATA.customers.map(c => { let h = 0; const s = c.id + c.he; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return { ...c, sinceDays: 18 + (h % 130) }; })
    .filter(c => (c.visits == null || c.visits > 0) && c.sinceDays >= thr).sort((a, b) => b.sinceDays - a.sinceDays);
}
window.dormantClients = dormantClients;

// suggested days until next visit, from the client's average frequency
function rebookInterval(client) {
  const v = (client && client.visits) || 4;
  return v >= 8 ? 21 : v >= 4 ? 28 : 35; // frequent → sooner
}
window.rebookInterval = rebookInterval;

// ── Dormant-clients screen (manager) ──
function DormantScreen({ lang, t, accent, serif, onBack, staff, toast }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const rows = dormantClients(60);
  // Round H0 · "we miss you" is MARKETING - only opted-in clients may receive it.
  const canMkt = c => !window.consentStore || window.consentStore.hasFor(c.id);
  const sendable = rows.filter(canMkt);
  const blocked = rows.length - sendable.length;
  const def = he ? 'שלום {שם}, מתגעגעים אליך במספרפי! מזמן לא התראינו, בוא להסתפר, נשמח לראות אותך ✂️ מספרפי.' : 'Hi {name}, we miss you at Barbershop! It’s been a while, come in for a fresh cut ✂️ Barbershop.';
  const [msg, setMsg] = useCRM(def);
  const [done, setDone] = useCRM({});
  const send = (c) => { if (!canMkt(c)) { toast && toast(he ? 'הלקוח לא אישר תוכן שיווקי' : 'Client not opted in', he ? 'לא ניתן לשלוח הודעה שיווקית' : 'Cannot send marketing'); return; } const num = (c.phone || '').replace(/^0/, '972'); window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(msg.replace(/\{שם\}|\{name\}/g, nm(c).split(' ')[0])), '_blank'); setDone(d => ({ ...d, [c.id]: true })); };
  const sendAll = () => { setDone(Object.fromEntries(sendable.map(c => [c.id, true]))); toast && toast(he ? `נשלחה הודעה ל-${sendable.length} לקוחות ✓${blocked ? ` · דולגו ${blocked} ללא הסכמה` : ''}` : `Sent to ${sendable.length} ✓${blocked ? ` · ${blocked} skipped` : ''}`, he ? 'הודעת "מתגעגעים" · שיווקי' : 'We-miss-you · marketing'); };
  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל · CRM' : 'Admin · CRM'} title={he ? 'לקוחות רדומים' : 'Dormant clients'} onBack={onBack}
        right={<span style={{ fontSize: 12.5, fontWeight: 700, color: '#B0413A', background: 'rgba(176,65,58,0.1)', padding: '5px 11px', borderRadius: 20 }}>{rows.length}</span>} />
      <Body>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: 'rgba(200,162,74,0.1)', border: `1px solid ${accent}33`, borderRadius: 14, padding: '11px 13px' }}>
          <Icon name="spark" size={17} color={accent} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.7)', lineHeight: 1.5 }}>{he ? 'לקוחות שלא הגיעו מעל 60 יום, נגזר משיעור הנטישה. שלח להם הודעת "מתגעגעים" כדי להחזיר אותם.' : 'Clients away over 60 days, from your churn rate. Send a "we miss you" nudge.'}</div>
        </div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 7, marginInlineStart: 2 }}>{he ? 'נוסח ההודעה (ניתן לעריכה)' : 'Message (editable)'}</div>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3} style={{ width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 14, lineHeight: 1.55, color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.12)', borderRadius: 14, padding: '12px 13px', outline: 'none', resize: 'none', direction: he ? 'rtl' : 'ltr', textAlign: 'start' }} />
        </div>
        <Btn kind="gold" icon="megaphone" onClick={sendAll}>{he ? `שלח לכל ה-${sendable.length} המאשרים ` : `Send to all ${sendable.length} opted-in`}</Btn>
        {blocked > 0 && <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', textAlign: 'center', marginTop: -4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Icon name="spark" size={13} color="#9C7B2E" />{he ? `${blocked} לקוחות לא אישרו תוכן שיווקי - ידולגו` : `${blocked} clients haven’t opted in - skipped`}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {rows.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 16, padding: '12px 14px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)', borderInlineStart: '3px solid rgba(176,65,58,0.5)' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(140deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FBF9F5', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{nm(c).trim()[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5, color: '#0B1E3D' }}>{nm(c)}</div>
                <div style={{ fontSize: 12, color: '#B0413A', marginTop: 1, fontWeight: 600 }}>{he ? `לא הגיע ${c.sinceDays} ימים` : `${c.sinceDays} days away`}</div>
              </div>
              <button onClick={() => send(c)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 13px', borderRadius: 12, border: 'none', background: done[c.id] ? 'rgba(18,163,80,0.14)' : 'linear-gradient(135deg,#1ebe5d,#12a350)', color: done[c.id] ? '#0B6B34' : '#fff', font: 'inherit', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}><Icon name="whatsapp" size={16} color={done[c.id] ? '#12a350' : '#fff'} />{done[c.id] ? (he ? 'נשלח' : 'Sent') : (he ? 'שלח' : 'Send')}</button>
            </div>
          ))}
        </div>
      </Body>
    </Shell>
  );
}

// regular clients (derived from CRM visit counts), frequent visitors Rafi can
// put on an automatic recurring booking, at their own usual cadence.
function regulars(min) {
  const thr = min || 5;
  return DATA.customers.filter(c => (c.visits || 0) >= thr).sort((a, b) => b.visits - a.visits);
}
window.regulars = regulars;

// ── Regulars → recurring-booking screen (manager) ──
function RegularsScreen({ lang, t, accent, serif, onBack, staff, toast }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const list = staff || DATA.barbers;
  const rows = regulars(5);
  const [rec, setRec] = useCRM(() => { try { return JSON.parse(localStorage.getItem('royale_recurring_v1')) || {}; } catch (e) { return {}; } });
  const persist = (next) => { try { localStorage.setItem('royale_recurring_v1', JSON.stringify(next)); } catch (e) {} return next; };
  const weeks = c => Math.round(rebookInterval(c) / 7);
  const nextDate = c => { const d = new Date(); d.setDate(d.getDate() + rebookInterval(c)); return d.toLocaleDateString(he ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short' }); };
  const toggle = (c) => setRec(prev => {
    const next = persist({ ...prev, [c.id]: !prev[c.id] });
    if (next[c.id]) { const fav = list.find(b => b.id === c.fav); toast && toast(he ? `תור חוזר נוצר ל${nm(c).split(' ')[0]} ✓` : `Recurring set for ${nm(c).split(' ')[0]} ✓`, he ? `כל ~${weeks(c)} שבועות${fav ? ' · ' + nm(fav).split(' ')[0] : ''}` : `every ~${weeks(c)} wks`); }
    return next;
  });
  const onCount = rows.filter(c => rec[c.id]).length;
  const setAll = () => { const next = persist(Object.fromEntries(rows.map(c => [c.id, true]))); setRec(next); toast && toast(he ? `${rows.length} תורים חוזרים הופעלו ✓` : `${rows.length} recurring set ✓`, he ? 'כל לקוח לפי הקצב שלו' : 'each at their own pace'); };
  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל · CRM' : 'Admin · CRM'} title={he ? 'תורים חוזרים' : 'Recurring bookings'} onBack={onBack}
        right={<span style={{ fontSize: 12.5, fontWeight: 700, color: accent, background: 'rgba(200,162,74,0.12)', padding: '5px 11px', borderRadius: 20 }}>{onCount}/{rows.length}</span>} />
      <Body>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: 'rgba(200,162,74,0.1)', border: `1px solid ${accent}33`, borderRadius: 14, padding: '11px 13px' }}>
          <Icon name="refresh" size={17} color={accent} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.7)', lineHeight: 1.5 }}>{he ? 'לקוחות קבועים, נגזר מתדירות הביקור ב-CRM. הפעילו תור חוזר אוטומטי, וכל לקוח יקבל הצעה למועד הבא לפי הקצב שלו, אצל הספר המועדף עליו.' : 'Regulars, derived from CRM visit frequency. Turn on auto-recurring and each client gets a next-slot offer at their own pace, with their preferred barber.'}</div>
        </div>
        {onCount < rows.length && (
          <button onClick={setAll} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px', borderRadius: 13, border: `1.5px solid ${accent}`, background: `${accent}10`, color: '#0B1E3D', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            <Icon name="refresh" size={17} color={accent} />{he ? `הפעל לכל ה-${rows.length} הקבועים` : `Enable for all ${rows.length} regulars`}
          </button>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {rows.map(c => {
            const on = !!rec[c.id];
            const fav = list.find(b => b.id === c.fav);
            return (
              <div key={c.id} style={{ background: '#fff', borderRadius: 16, padding: '13px 14px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)', borderInlineStart: `3px solid ${on ? '#2E7D52' : accent}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(140deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FBF9F5', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{nm(c).trim()[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14.5, color: '#0B1E3D' }}>{nm(c)}</div>
                    <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.55)', marginTop: 1 }}>{he ? `${c.visits} ביקורים` : `${c.visits} visits`}{fav ? ' · ' + nm(fav).split(' ')[0] : ''}</div>
                  </div>
                  <button onClick={() => toggle(c)} title={on ? (he ? 'בטל' : 'Off') : (he ? 'הפעל' : 'On')} style={{ width: 46, height: 28, borderRadius: 15, border: 'none', cursor: 'pointer', padding: 3, background: on ? '#2E7D52' : 'rgba(11,30,61,0.18)', display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start', flexShrink: 0, transition: 'all .2s' }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} />
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 11, paddingTop: 11, borderTop: '1px solid rgba(11,30,61,0.06)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: accent, background: 'rgba(200,162,74,0.12)', padding: '4px 10px', borderRadius: 20 }}>
                    <Icon name="clock" size={13} color={accent} />{he ? `כל ~${weeks(c)} שבועות` : `every ~${weeks(c)} wks`}
                  </span>
                  <span style={{ flex: 1 }} />
                  {on && <span style={{ fontSize: 11.5, fontWeight: 600, color: '#2E7D52', display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="check" size={13} color="#2E7D52" stroke={2.4} />{he ? `הצעה הבאה ${nextDate(c)}` : `next offer ${nextDate(c)}`}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Body>
    </Shell>
  );
}

Object.assign(window, { DormantScreen, RegularsScreen, regulars, waitlist, dormantClients, rebookInterval });
