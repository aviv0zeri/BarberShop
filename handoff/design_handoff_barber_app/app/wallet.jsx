// wallet.jsx - Round E2: the CLIENT-side punch-card wallet.
// A client can hold several cards at once (each minted from a package). This file
// renders the wallet, the per-booking card picker, the optional name label (§6) and
// the live promo countdown (§7). The store lives in punchcard.jsx (window.punchStore).
// Exports: CountdownPill, PunchWalletSheet, PunchCardPicker, WalletCardMini
const { useState: useWal, useEffect: useWalEffect } = React;

// ── §7 · live countdown for a time-limited card ───────────────────────────
function CountdownPill({ card, lang, big }) {
  const he = lang === 'he';
  const [, tick] = useWal(0);
  useWalEffect(() => { const t = setInterval(() => tick(v => v + 1), 30000); return () => clearInterval(t); }, []);
  const info = punchStore.expiryInfo(card);
  if (!info) return null;
  const danger = info.ended || info.ms <= 2 * 86400000;
  const warm = info.soon;
  const col = info.ended ? '#B0413A' : danger ? '#B0413A' : warm ? '#9C7B2E' : 'rgba(11,30,61,0.55)';
  const bg = info.ended ? 'rgba(176,65,58,0.1)' : danger ? 'rgba(176,65,58,0.1)' : warm ? 'rgba(200,162,74,0.14)' : 'rgba(11,30,61,0.05)';
  const label = info.ended
    ? (he ? 'פג תוקף' : 'Expired')
    : info.days >= 1
      ? (he ? `נותרו ${info.days} ${info.days === 1 ? 'יום' : 'ימים'} ${info.hours} ${info.hours === 1 ? 'שעה' : 'שעות'}` : `${info.days}d ${info.hours}h left`)
      : (he ? `נותרו ${info.hours} שעות ${info.mins} דק׳` : `${info.hours}h ${info.mins}m left`);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: big ? 12.5 : 11, fontWeight: 800, color: col, background: bg, padding: big ? '5px 11px' : '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>
      <Icon name={info.ended ? 'x' : 'clock'} size={big ? 14 : 12} color={col} />{label}
    </span>
  );
}

// scope / covered-treatment summary line
function cardScopeLabel(card, lang, staff) {
  const he = lang === 'he';
  if (card.scope === 'all') return he ? 'כל הצוות' : 'Whole team';
  const b = (staff || DATA.barbers).find(x => x.id === card.barberId);
  return b ? (he ? `אצל ${(he ? b.he : b.en).split(' ')[0]}` : `with ${(he ? b.he : b.en).split(' ')[0]}`) : (he ? 'ספר אחד' : 'One barber');
}
function coveredNames(card, lang) {
  return (card.services || []).map(id => { const s = DATA.services.find(x => x.id === id); return s ? s[lang] : null; }).filter(Boolean);
}

// ── one rich card in the wallet ───────────────────────────────────────────
function WalletCard({ card, lang, accent, serif, appts, staff, onBook, onLabel }) {
  const he = lang === 'he';
  const used = punchStore.usedForCard(card, appts);
  const left = punchStore.balanceForCard(card, appts);
  const planned = punchStore.plannedForCard(card, appts);
  const expired = punchStore.cardExpired(card);
  const dead = expired || left <= 0;
  const covered = coveredNames(card, lang);
  return (
    <div style={{ position: 'relative', background: dead ? 'linear-gradient(140deg,#2B3a52,#1c2942)' : 'linear-gradient(140deg,#14305A,#0B1E3D)', borderRadius: 20, padding: '15px 16px', overflow: 'hidden', border: '1px solid rgba(228,201,123,0.32)', opacity: dead ? 0.72 : 1 }}>
      <Emblem size={130} style={{ position: 'absolute', top: -26, insetInlineEnd: -34, opacity: 0.1 }} />
      {/* header: name + label + balance */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, marginBottom: 12 }}>
        <span style={{ width: 40, height: 40, borderRadius: 12, background: dead ? 'rgba(228,201,123,0.18)' : 'linear-gradient(135deg,#E4C97B,#C8A24A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="card" size={20} color={dead ? '#E4C97B' : '#0B1E3D'} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 16.5, color: '#FBF9F5', lineHeight: 1.1 }}>{he ? card.he : card.en}</span>
            {card.label && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 800, color: '#0B1E3D', background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', padding: '2px 8px', borderRadius: 20 }} dir="auto"><Icon name="user" size={11} color="#0B1E3D" />{card.label}</span>}
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(228,201,123,0.85)', marginTop: 3, fontWeight: 600 }}>{cardScopeLabel(card, lang, staff)}</div>
        </div>
        <div style={{ textAlign: 'center', background: 'rgba(228,201,123,0.14)', borderRadius: 12, padding: '6px 12px', flexShrink: 0 }}>
          <div style={{ fontFamily: serif, fontWeight: 800, fontSize: 19, color: '#E4C97B', lineHeight: 1, direction: 'ltr' }}>{left}</div>
          <div style={{ fontSize: 9, color: 'rgba(251,249,245,0.6)', fontWeight: 700, marginTop: 2 }}>{he ? 'נשארו' : 'left'}</div>
        </div>
      </div>
      <PunchDots used={used} total={card.total} light />
      {/* covered treatments */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 12 }}>
        {covered.map((n, k) => <span key={k} style={{ fontSize: 10.5, fontWeight: 700, color: '#E4C97B', background: 'rgba(228,201,123,0.14)', padding: '3px 9px', borderRadius: 20 }}>{n}</span>)}
      </div>
      {/* meta row: planned visits only - a purchased card stays valid until its punches run out */}
      {planned > 0 && (
        <div style={{ marginTop: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(251,249,245,0.7)' }}>{he ? `${planned} מתוכננים` : `${planned} planned`}</span>
        </div>
      )}
      {/* actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 13 }}>
        {!dead && onBook && (
          <button onClick={() => onBook(card)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', borderRadius: 12, border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 13.5, fontWeight: 800, background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', color: '#0B1E3D' }}><Icon name="scissors" size={16} color="#0B1E3D" />{he ? 'קביעת תור' : 'Book'}</button>
        )}
        <button onClick={() => onLabel(card)} style={{ flex: dead ? 1 : '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 14px', borderRadius: 12, border: '1px solid rgba(228,201,123,0.4)', cursor: 'pointer', font: 'inherit', fontSize: 13, fontWeight: 700, background: 'rgba(228,201,123,0.1)', color: '#E4C97B' }}><Icon name="pencil" size={15} color="#E4C97B" />{card.label ? (he ? 'תווית' : 'Label') : (he ? 'הוסף תווית' : 'Add label')}</button>
      </div>
    </div>
  );
}

// ── name-label editor (§6) ────────────────────────────────────────────────
function LabelEditSheet({ lang, accent, serif, card, onClose, onSaved }) {
  const he = lang === 'he';
  const [txt, setTxt] = useWal(card.label || '');
  const save = () => { punchStore.setCardLabel(card.id, txt.trim()); onSaved && onSaved(); onClose(); };
  const inp = { width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 15, color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.12)', borderRadius: 12, padding: '12px 13px', outline: 'none', direction: he ? 'rtl' : 'ltr', textAlign: 'start' };
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(7,16,31,0.6)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)', padding: '10px 20px calc(22px + env(safe-area-inset-bottom))' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 14px' }} />
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 19, color: '#0B1E3D' }}>{he ? 'תווית שם לכרטיסייה' : 'Name this card'}</div>
        <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.55)', marginTop: 4, lineHeight: 1.5, marginBottom: 14 }}>{he ? 'תווית אישית שעוזרת לעקוב - למשל "הכרטיסייה של יותם". ויזואלית בלבד, לא פרופיל נפרד.' : 'A personal tag to keep track - e.g. “Yotam’s card”. Visual only, not a separate profile.'}</div>
        <input value={txt} onChange={e => setTxt(e.target.value)} autoFocus maxLength={20} placeholder={he ? 'למשל: יותם · החבר דני' : 'e.g. Yotam · Danny'} style={inp} />
        <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
          {card.label && <button onClick={() => { punchStore.setCardLabel(card.id, ''); onSaved && onSaved(); onClose(); }} style={{ flex: '0 0 auto', padding: '13px 16px', borderRadius: 13, border: '1px solid rgba(176,65,58,0.3)', background: '#fff', color: '#B0413A', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{he ? 'הסרה' : 'Remove'}</button>}
          <div style={{ flex: 1 }}><Btn kind="gold" icon="check" onClick={save}>{he ? 'שמירה' : 'Save'}</Btn></div>
        </div>
      </div>
    </div>
  );
}

// ── the wallet sheet (§2) ─────────────────────────────────────────────────
function PunchWalletSheet({ lang, accent, serif, appts, staff, onClose, onBook, onBuy }) {
  const he = lang === 'he';
  const [, setVer] = useWal(0);
  const [labelCard, setLabelCard] = useWal(null);
  const cards = punchStore.walletFor('me');
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 86, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '92%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        <div style={{ padding: '10px 20px 4px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D' }}>{cards.length > 1 ? (he ? 'הכרטיסיות שלי' : 'My punch cards') : (he ? 'הכרטיסייה שלי' : 'My punch card')}</div>
              <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.5)', marginTop: 2 }}>{he ? `${cards.length} כרטיסיות בארנק` : `${cards.length} card${cards.length === 1 ? '' : 's'} in your wallet`}</div>
            </div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={17} color="#0B1E3D" /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cards.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'rgba(11,30,61,0.45)' }}>
              <Icon name="card" size={36} color="rgba(11,30,61,0.2)" />
              <div style={{ marginTop: 12, fontSize: 14 }}>{he ? 'אין כרטיסיות עדיין' : 'No cards yet'}</div>
            </div>
          )}
          {cards.map(c => <WalletCard key={c.id} card={c} lang={lang} accent={accent} serif={serif} appts={appts} staff={staff} onBook={onBook} onLabel={setLabelCard} />)}
        </div>
        <div style={{ flexShrink: 0, padding: '10px 20px calc(16px + env(safe-area-inset-bottom))', borderTop: '1px solid rgba(11,30,61,0.06)' }}>
          <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', lineHeight: 1.5, marginBottom: 10, textAlign: 'center' }}>{he ? 'ביטול עד שעה לפני התור - הניקוב חוזר. בתוך שעה - הניקוב נשרף.' : 'Cancel up to 1h before - the punch returns. Within the hour - it’s burned.'}</div>
          {onBuy && <button onClick={onBuy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', borderRadius: 14, border: `1.5px solid ${accent}`, background: `${accent}12`, color: '#0B1E3D', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}><Icon name="plus" size={17} color={accent} />{he ? 'רכישת כרטיסייה נוספת' : 'Buy another card'}</button>}
        </div>
      </div>
      {labelCard && <LabelEditSheet lang={lang} accent={accent} serif={serif} card={labelCard} onClose={() => setLabelCard(null)} onSaved={() => setVer(v => v + 1)} />}
    </div>
  );
}

// ── per-booking card picker: which card to punch from (§2) ─────────────────
function PunchCardPicker({ lang, accent, serif, cards, appts, staff, onPick, onClose, title, sub }) {
  const he = lang === 'he';
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 99, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '88%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        <div style={{ padding: '10px 20px 6px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 12px' }} />
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 19, color: '#0B1E3D' }}>{title || (he ? 'מאיזו כרטיסייה לנקב?' : 'Punch from which card?')}</div>
          {sub && <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.55)', marginTop: 3 }}>{sub}</div>}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px calc(18px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cards.map(c => {
            const left = punchStore.balanceForCard(c, appts);
            return (
              <button key={c.id} onClick={() => onPick(c)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: '#fff', border: '1.5px solid rgba(11,30,61,0.1)', borderRadius: 16, padding: '13px 14px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(140deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="card" size={21} color="#E4C97B" /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 14.5, color: '#0B1E3D' }}>{he ? c.he : c.en}</span>
                    {c.label && <span style={{ fontSize: 10, fontWeight: 800, color: '#7A5F1E', background: 'rgba(200,162,74,0.16)', padding: '2px 7px', borderRadius: 20 }} dir="auto">{c.label}</span>}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3 }}>
                    <span style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)' }}>{cardScopeLabel(c, lang, staff)}</span>
                  </span>
                </span>
                <span style={{ textAlign: 'center', flexShrink: 0 }}>
                  <span style={{ display: 'block', fontFamily: serif, fontWeight: 800, fontSize: 18, color: '#9C7B2E', direction: 'ltr' }}>{left}</span>
                  <span style={{ display: 'block', fontSize: 9.5, color: 'rgba(11,30,61,0.45)', fontWeight: 700 }}>{he ? 'נשארו' : 'left'}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CountdownPill, PunchWalletSheet, PunchCardPicker, WalletCard, cardScopeLabel });
