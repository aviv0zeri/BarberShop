// booking.jsx, multi-step booking flow + confirmation success
// Exports: BookingFlow, SuccessScreen

const { useState: useStateB } = React;

function StepDots({ i, n, accent }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: n }).map((_, k) => (
        <span key={k} style={{
          height: 4, borderRadius: 4, transition: 'all .35s ease',
          width: k === i ? 22 : 8,
          background: k <= i ? accent : 'rgba(11,30,61,0.14)',
        }} />
      ))}
    </div>
  );
}

function Choice({ selected, onClick, children, accent }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer',
      background: '#fff', border: `1.5px solid ${selected ? accent : 'rgba(11,30,61,0.08)'}`,
      borderRadius: 18, padding: 14, display: 'flex', alignItems: 'center', gap: 13,
      boxShadow: selected ? `0 8px 22px ${accent}33` : '0 2px 8px rgba(11,30,61,0.04)',
      transition: 'all .2s ease', position: 'relative',
    }}>
      {children}
      <span style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginInlineStart: 'auto',
        border: `1.5px solid ${selected ? accent : 'rgba(11,30,61,0.18)'}`,
        background: selected ? accent : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{selected && <Icon name="check" size={13} color="#fff" stroke={2.4} />}</span>
    </button>
  );
}

function ReviewCover({ lang, serif, accent, barber, taglines }) {
  const nm = o => o[lang];
  return (
    <div style={{ position: 'relative', height: 176, borderRadius: 22, overflow: 'hidden', background: 'linear-gradient(150deg,#FCFAF4 0%,#F4EEDF 100%)', boxShadow: '0 12px 30px rgba(11,30,61,0.12)', border: '1px solid rgba(200,162,74,0.35)' }}>
      {/* faint emblem watermark */}
      <Emblem size={210} style={{ position: 'absolute', top: -28, insetInlineEnd: -34, opacity: 0.08 }} />
      <div style={{ position: 'absolute', inset: 9, borderRadius: 15, border: '1px solid rgba(200,162,74,0.3)', pointerEvents: 'none' }} />
      {/* brand emblem mark */}
      <div style={{ position: 'absolute', top: 12, insetInlineStart: 16, display: 'flex', alignItems: 'center', gap: 9 }}>
        <Emblem size={42} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 16, color: '#1a1a1a' }}>{DATA.brand[lang]}</span>
          <span style={{ fontSize: 9.5, letterSpacing: 1, color: accent, fontWeight: 700, marginTop: 3 }}>EST · 2001</span>
        </div>
      </div>
      {/* barber portrait + identity */}
      <div style={{ position: 'absolute', bottom: 15, insetInlineStart: 16, insetInlineEnd: 16, display: 'flex', alignItems: 'center', gap: 13 }}>
        <BarberMedallion b={barber} size={66} lang={lang} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 19, color: '#1a1a1a', lineHeight: 1.1 }}>{nm(barber)}</div>
          <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 13, color: '#9C7B2E', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>“{tagOf(barber, taglines, lang)}”</div>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(200,162,74,0.16)', padding: '4px 9px', borderRadius: 20, flexShrink: 0 }}>
          <Icon name="scissors" size={12} color="#C8A24A" /><span style={{ color: '#9C7B2E', fontWeight: 700, fontSize: 12.5 }}>{lang === 'he' ? 'הצוות שלנו' : 'Our team'}</span>
        </div>
      </div>
    </div>
  );
}

function BookingFlow({ lang, t, accent, order, serif, taglines, staff, appts, onClose, onConfirm, onWaitlistJoin, onStartCart, presetBarber, presetService, startKey, rescheduleMode, punch, punchStart, presetCard, mustPrepay }) {
  const nm = o => o[lang];
  const he = lang === 'he';
  // Round E2: punch mode binds to a chosen WALLET card (punch.cards = usable cards).
  const _cardBarber = (c) => c && c.scope === 'barber' ? (staff || DATA.barbers).find(b => b.id === c.barberId) : null;
  const _initCard = presetCard || (punchStart && punch && punch.cards && punch.cards.length === 1 ? punch.cards[0] : null);
  const [usePunch, setUsePunch] = useStateB(() => !!_initCard);
  const [punchCard, setPunchCard] = useStateB(_initCard);
  const [cardPick, setCardPick] = useStateB(() => !!(punchStart && !presetCard && punch && punch.cards && punch.cards.length > 1));
  // Round C: optional recurring cadence chosen at review
  const [recurFreq, setRecurFreq] = useStateB(null); // null | 'weekly' | 'biweekly' | 'monthly'
  const punchTeam = usePunch && punchCard && punchCard.scope === 'all';
  const stepKeys = usePunch
    ? (punchTeam ? ['service', 'barber', 'time', 'review'] : ['service', 'time', 'review'])
    : order === 'serviceFirst'
      ? ['service', 'barber', 'time', 'review']
      : ['barber', 'service', 'time', 'review'];
  const titles = { barber: t.chooseBarber, service: t.chooseService, time: t.chooseTime, review: t.review };

  const startIndex = startKey ? Math.max(0, stepKeys.indexOf(startKey)) : 0;
  const [i, setI] = useStateB(startIndex);
  const [barber, setBarber] = useStateB(presetBarber || _cardBarber(_initCard) || null);
  const [service, setService] = useStateB(presetService || null);
  const [day, setDay] = useStateB(0);
  const [slot, setSlot] = useStateB(null); // minutes-from-midnight, or null
  const [joined, setJoined] = useStateB(false);
  const [paySheet, setPaySheet] = useStateB(false); // prepay-required gate (Round 10)
  // pick / switch / drop the punch card. Choosing a card resets the picked service
  // (covered treatments differ per card) and the barber (bound for a barber-scoped card).
  const applyCard = (c) => { setUsePunch(true); setPunchCard(c); setCardPick(false); setBarber(_cardBarber(c) || null); setService(null); setSlot(null); setI(0); };
  const enablePunch = () => { if (punch.cards.length === 1) applyCard(punch.cards[0]); else setCardPick(true); };
  const disablePunch = () => { setUsePunch(false); setPunchCard(null); setBarber(presetBarber || null); setService(null); setSlot(null); setI(0); };

  const key = stepKeys[i];
  const pool = staff || DATA.barbers;

  // real upcoming dates, bounded by the manager's booking window (Layer 2)
  const _base = new Date(); _base.setHours(0, 0, 0, 0);
  const _winDays = (window.bookWindowDays ? window.bookWindowDays() : 28);
  const realDays = Array.from({ length: _winDays }, (_, k) => {
    const d = new Date(_base); d.setDate(_base.getDate() + k);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const label = k === 0 ? t.today : k === 1 ? t.tomorrow : d.toLocaleDateString(he ? 'he-IL' : 'en-US', { weekday: 'short', day: 'numeric' });
    return { ds, label };
  });

  // barbers offering the chosen service (and on shift), services offered by chosen barber.
  // Punch-card mode: ONLY the two card services (men's cut / cut + beard, 15 min each).
  const barberOffers = (b, svcId) => (b.services || DATA.services.map(s => s.id)).includes(svcId);
  const barberPool = pool.filter(b => b.active !== false && (!service || service.punchOnly || barberOffers(b, service.id)));
  const servicePool = usePunch
    ? DATA.services.filter(s => !s.punchOnly && punchCard && (punchCard.services || []).includes(s.id))
    : DATA.services.filter(s => !s.punchOnly && (!barber || barberOffers(barber, s.id)));

  // compute free slots for selected barber+service on selected date
  const computeSlots = () => {
    if (!barber || !service) return { groups: [], total: 0 };
    const A = appts || [];
    const dur = service.min;
    const ds = realDays[day].ds;
    if (window.shabbat && window.shabbat.closedDate(ds)) return { groups: [], total: 0, shabbat: true };
    const sched = window.availHelpers.daySched(barber, ds);
    if (!sched.active) return { groups: [], total: 0, off: true, vacation: sched.exception === 'closed' };
    const sMin = window.availHelpers.toMin(sched.start), eMin = window.availHelpers.toMin(sched.end);
    // for today, never offer a slot whose start is already in the past
    const pad = n => String(n).padStart(2, '0'); const now = new Date();
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const minStart = ds === todayStr ? now.getHours() * 60 + now.getMinutes() : -1;
    const free = [];
    const reserved = [];
    for (let m = sMin; m + dur <= eMin; m += 15) {
      if (m <= minStart) continue;
      if (window.availHelpers.slotFree(barber, ds, m, dur, A)) { free.push(m); continue; }
      // Round F: tell apart a slot HELD by a recurring booking from an ordinary taken one
      if (window.availHelpers.slotReserved && window.availHelpers.slotReserved(barber.id, ds, m, A)) reserved.push(m);
    }
    const band = (lo, hi) => ({ free: free.filter(m => m >= lo && m < hi), reserved: reserved.filter(m => m >= lo && m < hi) });
    const groups = [
      { label: t.morning, ...band(0, 720) },
      { label: t.noon, ...band(720, 960) },
      { label: t.evening, ...band(960, 3000) },
    ].filter(g => g.free.length || g.reserved.length);
    return { groups, total: free.length, reservedCount: reserved.length };
  };

  // Round 12 (amended Round A): "first available" - the earliest open slot across all on-shift
  // barbers who offer the chosen service. When several barbers tie at that earliest time the pick
  // is FULLY RANDOM - no owner priority, Rafi is weighted like everyone else.
  // The client always sees the name before confirming.
  const firstAvail = React.useMemo(() => {
    if (!service) return null;
    const A = appts || [];
    const dur = service.min;
    const pad = n => String(n).padStart(2, '0'); const now = new Date();
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    for (let di = 0; di < realDays.length; di++) {
      const ds = realDays[di].ds;
      if (window.shabbat && window.shabbat.closedDate(ds)) continue;
      let best = Infinity; const perBarber = [];
      for (const b of barberPool) {
        const sched = window.availHelpers.daySched(b, ds);
        if (!sched.active) continue;
        const sMin = window.availHelpers.toMin(sched.start), eMin = window.availHelpers.toMin(sched.end);
        const minStart = ds === todayStr ? nowMin : -1;
        let firstM = null;
        for (let m = sMin; m + dur <= eMin; m += 15) {
          if (m <= minStart) continue;
          if (window.availHelpers.slotFree(b, ds, m, dur, A)) { firstM = m; break; }
        }
        if (firstM != null) { perBarber.push({ b, m: firstM }); if (firstM < best) best = firstM; }
      }
      if (perBarber.length) {
        const tied = perBarber.filter(x => x.m === best);
        const pick = tied[Math.floor(Math.random() * tied.length)];
        return { barber: pick.b, dayIdx: di, min: best };
      }
    }
    return null;
  }, [service && service.id, key, (appts || []).length, barberPool.length]);

  const reviewIdx = stepKeys.indexOf('review');
  const pickFirstAvailable = () => {
    if (!firstAvail) return;
    setBarber(firstAvail.barber); setDay(firstAvail.dayIdx); setSlot(firstAvail.min);
    setI(reviewIdx);
  };

  const canNext = (key === 'barber' && barber) || (key === 'service' && service) || (key === 'time' && slot != null) || key === 'review';
  const finalData = () => ({ barber, service, day: realDays[day].label, date: realDays[day].ds, slot: 'x' + window.availHelpers.toHHMM(slot), paid: usePunch ? 'punch' : undefined, punchCardId: usePunch && punchCard ? punchCard.id : undefined, recurFreq: recurFreq || undefined });
  const next = () => {
    if (i < stepKeys.length - 1) { setI(i + 1); return; }
    // Round 10: a prepay-required client must pay NOW, unless the punch card IS the payment
    if (mustPrepay && !usePunch) { setPaySheet(true); return; }
    onConfirm(finalData());
  };
  const back = () => { if (i <= startIndex) onClose(); else setI(i - 1); };

  const head = { fontFamily: serif, fontWeight: 700, color: '#0B1E3D' };

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--cream-bg)', zIndex: 70, display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{ paddingTop: 58, padding: '58px 18px 14px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={back} style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Icon name={lang === 'he' ? 'arrowR' : 'arrowL'} size={20} color="#0B1E3D" />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: accent, textTransform: 'uppercase', marginBottom: 3 }}>{rescheduleMode ? (he ? 'שינוי מועד' : 'Reschedule') : `${t.step} ${i + 1} ${t.of} ${stepKeys.length}`}</div>
          <div style={{ ...head, fontSize: 21 }}>{titles[key]}</div>
        </div>
      </div>
      <div style={{ padding: '0 18px 14px' }}><StepDots i={i} n={stepKeys.length} accent={accent} /></div>

      {/* body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        {/* Round 10: punch-card entry, appears whenever the client owns an active card */}
        {punch && !usePunch && !rescheduleMode && i === startIndex && (
          <button onClick={enablePunch} className="tapsq" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: 'linear-gradient(140deg,#F6E7BC,#E4C97B)', border: '1px solid rgba(156,123,46,0.5)', borderRadius: 16, padding: '12px 14px', boxShadow: '0 8px 20px rgba(200,162,74,0.28)' }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(11,30,61,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="card" size={20} color="#0B1E3D" /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontWeight: 800, fontSize: 14.5, color: '#0B1E3D' }}>{he ? 'שימוש בכרטיסייה' : 'Use my punch card'}</span>
              <span style={{ display: 'block', fontSize: 11.5, color: 'rgba(11,30,61,0.62)', marginTop: 2, fontWeight: 600 }} dir="auto">{punch.cards.length === 1 ? (he ? `${punch.cards[0].he} · יתרה ${window.punchStore.balanceForCard(punch.cards[0], appts)} · בלי תשלום` : `${punch.cards[0].en} · ${window.punchStore.balanceForCard(punch.cards[0], appts)} left · no charge`) : (he ? `${punch.cards.length} כרטיסיות בארנק · בלי תשלום` : `${punch.cards.length} cards in your wallet · no charge`)}</span>
            </span>
            <Icon name={he ? 'arrowL' : 'arrowR'} size={18} color="#0B1E3D" />
          </button>
        )}
        {usePunch && punchCard && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(200,162,74,0.12)', border: `1px solid ${accent}55`, borderRadius: 13, padding: '9px 12px' }}>
            <Icon name="card" size={16} color="#9C7B2E" />
            <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: '#0B1E3D' }} dir="auto">{he ? `${punchCard.label || punchCard.he} · ${window.cardScopeLabel ? window.cardScopeLabel(punchCard, lang, staff) : ''} · יתרה ${window.punchStore.balanceForCard(punchCard, appts)}` : `${punchCard.label || punchCard.en} · ${window.punchStore.balanceForCard(punchCard, appts)} left`}</span>
            {punch && punch.cards.length > 1 && <button onClick={() => setCardPick(true)} style={{ background: 'none', border: 'none', padding: '2px 6px', cursor: 'pointer', color: '#9C7B2E', font: 'inherit', fontSize: 12, fontWeight: 800, display: 'flex' }}>{he ? 'החלפה' : 'Switch'}</button>}
            {!punchStart && !presetCard && <button onClick={disablePunch} style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: 'rgba(11,30,61,0.45)', display: 'flex' }} title={he ? 'בלי הכרטיסייה' : 'Without the card'}><Icon name="x" size={15} /></button>}
          </div>
        )}
        {key === 'barber' && firstAvail && (
          <React.Fragment>
            <button onClick={pickFirstAvailable} className="tapsq" style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: 'linear-gradient(140deg,#14305A,#0B1E3D)', border: '1px solid rgba(228,201,123,0.45)', borderRadius: 18, padding: '15px 15px', boxShadow: '0 12px 28px rgba(11,30,61,0.28)' }}>
              <span style={{ width: 46, height: 46, borderRadius: 13, background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 16px rgba(200,162,74,0.4)' }}><Icon name="clock" size={24} color="#0B1E3D" stroke={2.2} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: 0.3, color: '#E4C97B' }}>{he ? 'התור הראשון הפנוי' : 'First available'}</span>
                <span style={{ display: 'block', fontFamily: serif, fontWeight: 700, fontSize: 19, color: '#FBF9F5', marginTop: 3 }}>{realDays[firstAvail.dayIdx].label} · <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{window.availHelpers.toHHMM(firstAvail.min)}</span></span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'rgba(251,249,245,0.72)', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>({he ? 'אצל ' : 'with '}{nm(firstAvail.barber)})</span>
              </span>
              <Icon name={he ? 'arrowL' : 'arrowR'} size={20} color="#E4C97B" />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 2px 4px' }}>
              <span style={{ flex: 1, height: 1, background: 'rgba(11,30,61,0.12)' }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.4, color: 'rgba(11,30,61,0.4)' }}>{he ? 'או בחרו ספר' : 'or pick a barber'}</span>
              <span style={{ flex: 1, height: 1, background: 'rgba(11,30,61,0.12)' }} />
            </div>
          </React.Fragment>
        )}
        {key === 'barber' && barberPool.map(b => (
          <Choice key={b.id} selected={barber?.id === b.id} onClick={() => { setBarber(b); setSlot(null); }} accent={accent}>
            <BarberMedallion b={b} size={50} lang={lang} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15.5, color: '#0B1E3D' }}>{nm(b)}</div>
              <div style={{ fontSize: 12.5, color: accent, marginTop: 2, fontStyle: 'italic', fontFamily: serif, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>“{tagOf(b, taglines, lang)}”</div>
            </div>
          </Choice>
        ))}

        {key === 'service' && servicePool.map(s => (
          <Choice key={s.id} selected={service?.id === s.id} onClick={() => { setService(s); setSlot(null); }} accent={accent}>
            <span style={{ width: 46, height: 46, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
              <ImgSlot id={'svc-book-' + s.id} radius={12} readonly src={s.img} placeholder={lang === 'he' ? s.photoHe : s.photoEn} style={{ width: 46, height: 46 }} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15.5, color: '#0B1E3D' }}>{nm(s)}</div>
              <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.55)', marginTop: 1, display: 'flex', gap: 6, alignItems: 'center' }}>
                <Icon name="clock" size={12} color="rgba(11,30,61,0.4)" />{s.min} {t.min}
              </div>
            </div>
            {usePunch
              ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 800, color: '#7A5F1E', background: 'linear-gradient(135deg,rgba(228,201,123,0.4),rgba(200,162,74,0.3))', padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0 }}><Icon name="card" size={12} color="#7A5F1E" />{he ? 'ניקוב 1' : '1 punch'}</span>
              : <Money v={s.priceText || s.price} size={15} />}
          </Choice>
        ))}
        {/* Round D2 - the multi-treatment cart is now reached from the entry split-screen
            ("כמה תורים"), not from inside the single flow. No "+ add treatment" here. */}

        {key === 'time' && (() => { const { groups, total, shabbat, vacation, off, reservedCount } = computeSlots(); return <>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {realDays.map((d, k) => (
              <button key={k} onClick={() => { setDay(k); setSlot(null); }} style={{
                flexShrink: 0, padding: '10px 16px', borderRadius: 13, cursor: 'pointer', font: 'inherit', fontSize: 13.5, fontWeight: 600,
                border: `1.5px solid ${day === k ? accent : 'rgba(11,30,61,0.1)'}`,
                background: day === k ? accent : '#fff', color: day === k ? '#0B1E3D' : 'rgba(11,30,61,0.6)',
              }}>{d.label}</button>
            ))}
          </div>
          {total === 0 && <div style={{ textAlign: 'center', padding: '34px 16px', color: 'rgba(11,30,61,0.45)' }}>
            <Icon name={shabbat ? 'spark' : vacation ? 'pin' : 'clock'} size={34} color={shabbat || vacation ? accent : 'rgba(11,30,61,0.2)'} />
            <div style={{ marginTop: 10, fontSize: 14 }}>{shabbat ? (he ? 'סגור בשבת 🕯️' : 'Closed on Shabbat 🕯️') : vacation ? (he ? 'הספר בחופשה ביום זה 🌴' : 'Barber on leave this day 🌴') : (he ? 'אין שעות פנויות ביום זה' : 'No open slots this day')}</div>
            <div style={{ fontSize: 12.5, marginTop: 3 }}>{shabbat ? (he ? 'בחרו יום אחר בשבוע' : 'Pick another weekday') : (he ? 'נסו יום אחר' : 'Try another day')}</div>
          </div>}
          {total === 0 && !shabbat && !vacation && barber && service && (
            <button onClick={() => { if (window.waitlist) window.waitlist.join({ barberId: barber.id, date: realDays[day].ds, clientId: 'me', svc: service.id }); setJoined(true); if (onWaitlistJoin) onWaitlistJoin({ barberId: barber.id, date: realDays[day].ds, svc: service.id }); }} disabled={joined} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 8, padding: '13px', borderRadius: 14, border: `1.5px solid ${accent}`, background: joined ? `${accent}22` : `${accent}10`, color: '#0B1E3D', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: joined ? 'default' : 'pointer' }}><Icon name={joined ? 'check' : 'bell'} size={17} color={accent} />{joined ? (he ? 'נוספת לרשימת ההמתנה ✓, נעדכן כשמתפנה' : 'On the waitlist ✓') : (he ? 'הצטרפו לרשימת המתנה ליום זה' : 'Join the waitlist for this day')}</button>
          )}
          {reservedCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, background: 'rgba(200,162,74,0.1)', border: `1px solid ${accent}33`, borderRadius: 11, padding: '9px 11px' }}>
              <Icon name="refresh" size={15} color="#9C7B2E" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.7)', lineHeight: 1.45 }}>{he ? 'חריצים המסומנים „שמור” מוחזקים לתור קבוע - לא ניתן לקבוע עליהם.' : 'Slots marked “held” belong to a recurring booking and can’t be taken.'}</span>
            </div>
          )}
          {groups.map(({ label, free: fr, reserved: rs }) => (
            <div key={label} style={{ marginTop: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(11,30,61,0.45)', textTransform: 'uppercase', letterSpacing: 0.6, margin: '6px 2px 10px' }}>{label}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {fr.map(m => {
                  const on = slot === m, hhmm = window.availHelpers.toHHMM(m);
                  return <button key={m} onClick={() => setSlot(m)} style={{
                    padding: '11px 0', borderRadius: 12, cursor: 'pointer', font: 'inherit', fontSize: 13.5, fontWeight: 600, direction: 'ltr',
                    border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.1)'}`,
                    background: on ? accent : '#fff', color: '#0B1E3D',
                    boxShadow: on ? `0 6px 16px ${accent}40` : 'none', transition: 'all .15s',
                  }}>{hhmm}</button>;
                })}
                {rs.map(m => {
                  const hhmm = window.availHelpers.toHHMM(m);
                  return <span key={'r' + m} title={he ? 'שמור · תור קבוע' : 'Reserved · recurring'} style={{
                    padding: '7px 0', borderRadius: 12, font: 'inherit', direction: 'ltr',
                    border: '1.5px dashed rgba(11,30,61,0.2)', background: 'rgba(11,30,61,0.04)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.05, cursor: 'not-allowed',
                  }}><span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(11,30,61,0.4)', textDecoration: 'line-through' }}>{hhmm}</span><span style={{ fontSize: 8.5, fontWeight: 800, color: '#9C7B2E', marginTop: 1, letterSpacing: 0.2 }}>{he ? 'שמור' : 'held'}</span></span>;
                })}
              </div>
            </div>
          ))}
          {total > 0 && barber && service && (
            <button onClick={() => { if (window.waitlist) window.waitlist.join({ barberId: barber.id, date: realDays[day].ds, clientId: 'me', svc: service.id }); setJoined(true); if (onWaitlistJoin) onWaitlistJoin({ barberId: barber.id, date: realDays[day].ds, svc: service.id }); }} disabled={joined} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 14, padding: '12px', borderRadius: 13, border: `1px solid ${accent}44`, background: joined ? `${accent}1a` : 'transparent', color: 'rgba(11,30,61,0.7)', font: 'inherit', fontSize: 13, fontWeight: 700, cursor: joined ? 'default' : 'pointer' }}>
              <Icon name="bell" size={16} color={accent} />{joined ? (he ? 'נוספת לרשימת ההמתנה ✓, נעדכן כשמתפנה' : 'On the waitlist ✓') : (he ? 'השעה שרצית תפוסה? הצטרפו לרשימת המתנה ליום זה' : 'Wanted a taken time? Join the waitlist for this day')}
            </button>
          )}
        </>; })()}

        {key === 'review' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ReviewCover lang={lang} serif={serif} accent={accent} barber={barber} taglines={taglines} />
            <div style={{ background: '#fff', borderRadius: 20, padding: 4, boxShadow: '0 4px 16px rgba(11,30,61,0.05)' }}>
              <Row label={t.with} >
                <Avatar b={barber} size={30} ring={false} lang={lang} />
                <span style={{ fontWeight: 600, color: '#0B1E3D' }}>{nm(barber)}</span>
              </Row>
              <Row label={t.chooseService}><span style={{ fontWeight: 600, color: '#0B1E3D' }}>{nm(service)}</span></Row>
              <Row label={t.when}><span style={{ fontWeight: 600, color: '#0B1E3D', direction: 'ltr', unicodeBidi: 'isolate' }}>{realDays[day].label} · {window.availHelpers.toHHMM(slot)}</span></Row>
              <Row label={t.duration} last><span style={{ fontWeight: 600, color: '#0B1E3D' }}>{service.min} {t.min}</span></Row>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px' }}>
              <span style={{ fontSize: 15, color: 'rgba(11,30,61,0.6)', fontWeight: 600 }}>{t.total}</span>
              {usePunch ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13.5, color: 'rgba(11,30,61,0.4)', textDecoration: 'line-through', fontFamily: 'Assistant, sans-serif', direction: 'ltr', unicodeBidi: 'isolate' }}>₪{service.price}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 800, color: '#7A5F1E', background: 'linear-gradient(135deg,rgba(228,201,123,0.45),rgba(200,162,74,0.3))', padding: '5px 12px', borderRadius: 20 }}><Icon name="card" size={14} color="#7A5F1E" />{he ? `ניקוב 1 · יישארו ${(punchCard ? window.punchStore.balanceForCard(punchCard, appts) : 0) - 1}` : `1 punch · ${(punchCard ? window.punchStore.balanceForCard(punchCard, appts) : 0) - 1} left`}</span>
                </span>
              ) : <Money v={service.priceText || service.price} size={24} />}
            </div>
            {usePunch && (
              <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.55)', lineHeight: 1.5, background: '#fff', borderRadius: 13, padding: '11px 13px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>{he ? 'הניקוב יירשם אוטומטית בסיום התספורת. לא הגעתם? הוא חוזר ליתרה.' : 'The punch registers automatically when the cut completes. No-show? It returns to your balance.'}</div>
            )}
            {mustPrepay && !usePunch && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: 'rgba(200,162,74,0.12)', border: `1px solid ${accent}55`, borderRadius: 13, padding: '11px 13px' }}>
                <Icon name="coin" size={17} color="#9C7B2E" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.7)', lineHeight: 1.5 }}><b>{he ? 'נדרש תשלום מראש.' : 'Prepayment required.'}</b> {he ? 'התור ייקבע מיד לאחר התשלום (ביט / פייבוקס).' : 'Your booking completes right after payment (Bit / PayBox).'}</div>
              </div>
            )}
            {/* Round C: recurring booking toggle - only on fresh bookings, not reschedule */}
            {!rescheduleMode && (
              <div style={{ background: '#fff', borderRadius: 16, padding: '13px 14px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)', border: recurFreq ? `1.5px solid ${accent}` : '1px solid rgba(11,30,61,0.07)' }}>
                <button onClick={() => setRecurFreq(recurFreq ? null : 'weekly')} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', font: 'inherit', padding: 0 }}>
                  <span style={{ width: 42, height: 26, borderRadius: 13, background: recurFreq ? accent : 'rgba(11,30,61,0.15)', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
                    <span style={{ position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'transform .2s', transform: recurFreq ? (he ? 'translateX(-19px)' : 'translateX(19px)') : (he ? 'translateX(-3px)' : 'translateX(3px)') }} />
                  </span>
                  <span style={{ flex: 1, textAlign: 'start' }}>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: 14.5, color: '#0B1E3D' }}>{he ? 'הפוך לתור קבוע' : 'Make it a recurring booking'}</span>
                    <span style={{ display: 'block', fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{he ? 'המערכת תתפוס את החריץ הזה קדימה ביומן' : "The system holds this slot in the barber's calendar"}</span>
                  </span>
                  <Icon name="refresh" size={18} color={recurFreq ? accent : 'rgba(11,30,61,0.3)'} />
                </button>
                {recurFreq && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(11,30,61,0.07)' }}>
                    {[['weekly', he ? 'כל שבוע' : 'Weekly'], ['biweekly', he ? 'כל שבועיים' : 'Biweekly'], ['monthly', he ? 'כל חודש' : 'Monthly']].map(([id, lbl]) => (
                      <button key={id} onClick={() => setRecurFreq(id)} style={{ flex: 1, padding: '9px 4px', borderRadius: 10, border: `1.5px solid ${recurFreq === id ? accent : 'rgba(11,30,61,0.12)'}`, background: recurFreq === id ? accent + '1a' : '#fff', font: 'inherit', fontSize: 12.5, fontWeight: 700, color: '#0B1E3D', cursor: 'pointer' }}>{lbl}</button>
                    ))}
                  </div>
                )}
                {recurFreq && (
                  <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.45)', marginTop: 9, lineHeight: 1.5, paddingTop: 6 }}>
                    {he ? `החריץ ייחסם אוטומטית ב${recurFreq === 'weekly' ? '8 שבועות' : recurFreq === 'biweekly' ? '12 שבועות' : '3 חודשים'} הקרובים · ניתן לבטל בכל עת` : `Slot locked for ${recurFreq === 'weekly' ? '8 weeks' : recurFreq === 'biweekly' ? '12 weeks' : '3 months'} ahead · cancel any time`}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* footer */}
      <div style={{ padding: '12px 18px calc(18px + env(safe-area-inset-bottom))', flexShrink: 0, background: 'linear-gradient(to top, var(--cream-bg) 70%, transparent)' }}>
        {key === 'review'
          ? <Btn kind="gold" icon={mustPrepay && !usePunch ? 'coin' : 'check'} onClick={next}>{mustPrepay && !usePunch ? (he ? 'לתשלום ואישור התור' : 'Pay & confirm') : t.confirm}</Btn>
          : <Btn kind="primary" disabled={!canNext} onClick={next} icon={lang === 'he' ? 'arrowL' : 'arrowR'}>{t.continue}</Btn>}
      </div>
      {paySheet && window.PayMockSheet && (
        <PayMockSheet lang={lang} accent={accent} serif={serif} amount={service ? service.price : 0}
          title={he ? 'תשלום מראש לתור' : 'Prepay for this visit'}
          sub={he ? 'לבקשת המספרה, תור זה מחייב תשלום מראש.' : 'The shop requires prepayment for this booking.'}
          onClose={() => setPaySheet(false)}
          onPaid={() => onConfirm({ ...finalData(), paid: 'prepaid' })} />
      )}
      {cardPick && punch && window.PunchCardPicker && (
        <PunchCardPicker lang={lang} accent={accent} serif={serif} cards={punch.cards} appts={appts} staff={staff}
          onPick={applyCard} onClose={() => setCardPick(false)}
          title={he ? 'באיזו כרטיסייה להשתמש?' : 'Use which card?'}
          sub={he ? 'כל כרטיסייה מכסה טיפולים אחרים' : 'Each card covers different treatments'} />
      )}
    </div>
  );
}

function Row({ label, children, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '13px 14px', borderBottom: last ? 'none' : '1px solid rgba(11,30,61,0.06)' }}>
      <span style={{ fontSize: 13.5, color: 'rgba(11,30,61,0.5)', minWidth: 64 }}>{label}</span>
      <span style={{ marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14.5 }}>{children}</span>
    </div>
  );
}

// ── Add-to-calendar (prototype: real Google link + .ics download) ──
function _calPad(n) { return String(n).padStart(2, '0'); }
function _icsFmt(d) { return `${d.getFullYear()}${_calPad(d.getMonth() + 1)}${_calPad(d.getDate())}T${_calPad(d.getHours())}${_calPad(d.getMinutes())}00`; }
function buildCalEvent(lang, booking) {
  const nm = o => o[lang]; const he = lang === 'he';
  const svc = booking.service, barber = booking.barber;
  const hhmm = (booking.slot || 'x09:00').replace('x', ''); const [h, m] = hhmm.split(':').map(Number);
  const base = booking.date || new Date().toISOString().slice(0, 10);
  const start = new Date(base + 'T00:00:00'); start.setHours(h || 9, m || 0, 0, 0);
  const end = new Date(start.getTime() + ((svc && svc.min) || 45) * 60000);
  const title = he ? `מספרפי · ${nm(svc)} אצל ${nm(barber)}` : `Barbershop · ${nm(svc)} with ${nm(barber)}`;
  const loc = he ? DATA.branch.addrHe : DATA.branch.addrEn;
  const details = he
    ? `תור ב${DATA.brand.he}.\nשירות: ${nm(svc)}\nספר: ${nm(barber)}\nטלפון: ${DATA.contact.phoneDisp}`
    : `Appointment at Barbershop.\nService: ${nm(svc)}\nBarber: ${nm(barber)}\nPhone: ${DATA.contact.phoneDisp}`;
  return { start, end, title, loc, details };
}
function googleCalUrl(ev) {
  const p = new URLSearchParams({ action: 'TEMPLATE', text: ev.title, dates: `${_icsFmt(ev.start)}/${_icsFmt(ev.end)}`, details: ev.details, location: ev.loc, ctz: 'Asia/Jerusalem' });
  return 'https://calendar.google.com/calendar/render?' + p.toString();
}
function downloadICS(ev) {
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Barbershop//Booking//EN', 'BEGIN:VEVENT', 'UID:' + Date.now() + '@barbershop', 'DTSTAMP:' + _icsFmt(new Date()), 'DTSTART:' + _icsFmt(ev.start), 'DTEND:' + _icsFmt(ev.end), 'SUMMARY:' + ev.title, 'LOCATION:' + ev.loc, 'DESCRIPTION:' + ev.details.replace(/\n/g, '\\n'), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  try {
    const blob = new Blob([ics], { type: 'text/calendar' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'barbershop-appointment.ics'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch (e) {}
}

function AddToCalendarSheet({ lang, accent, serif, booking, onClose }) {
  const he = lang === 'he';
  const nm = o => o[lang];
  const ev = buildCalEvent(lang, booking);
  const [added, setAdded] = useStateB(false);
  const opt = (icon, label, sub, color, onClick) => (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '14px 16px', borderRadius: 16, border: '1px solid rgba(11,30,61,0.1)', cursor: 'pointer', font: 'inherit', background: '#fff', color: '#0B1E3D' }}>
      <span style={{ width: 38, height: 38, borderRadius: 11, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={icon} size={20} color={color} /></span>
      <span style={{ flex: 1, textAlign: 'start' }}><span style={{ display: 'block', fontSize: 15, fontWeight: 700 }}>{label}</span>{sub && <span style={{ display: 'block', fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{sub}</span>}</span>
      <Icon name={he ? 'chevron' : 'chevronR'} size={17} color="rgba(11,30,61,0.3)" />
    </button>
  );
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 96, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)', padding: '10px 20px calc(22px + env(safe-area-inset-bottom))' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 14px' }} />
        {added ? (
          <div style={{ textAlign: 'center', padding: '6px 0 4px' }}>
            <div style={{ width: 66, height: 66, borderRadius: '50%', background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 12px 30px rgba(200,162,74,0.4)' }}><Icon name="check" size={34} color="#0B1E3D" stroke={2.6} /></div>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: '#0B1E3D' }}>{he ? 'נוסף ליומן ✓' : 'Added to calendar ✓'}</div>
            <div style={{ fontSize: 13.5, color: 'rgba(11,30,61,0.55)', marginTop: 7, lineHeight: 1.5 }}>{he ? 'התור עם כל הפרטים נשמר ביומן שלך.' : 'The appointment with all details is saved to your calendar.'}</div>
            <div style={{ marginTop: 20 }}><Btn kind="gold" icon="check" onClick={onClose}>{he ? 'מצוין' : 'Great'}</Btn></div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 21, color: '#0B1E3D' }}>{he ? 'הוספה ליומן' : 'Add to calendar'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', border: '1px solid rgba(11,30,61,0.07)', borderRadius: 14, padding: '12px 14px', margin: '13px 0 16px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
              <span style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,rgba(228,201,123,0.22),rgba(200,162,74,0.16))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="calendar" size={20} color={accent} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: '#0B1E3D' }}>{nm(booking.service)} · {nm(booking.barber)}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.55)', marginTop: 2, direction: 'ltr', unicodeBidi: 'isolate', textAlign: 'start' }}>{booking.day} · {(booking.slot || '').slice(1)} · {he ? DATA.branch.addrHe : DATA.branch.addrEn}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {opt('calendar', 'Google Calendar', he ? 'נפתח בלשונית חדשה' : 'Opens in a new tab', '#2A6FDB', () => { window.open(googleCalUrl(ev), '_blank'); setAdded(true); })}
              {opt('mail', 'Apple / Outlook', he ? 'הורדת קובץ ‎.ics' : 'Download an .ics file', accent, () => { downloadICS(ev); setAdded(true); })}
            </div>
            <button onClick={onClose} style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(11,30,61,0.5)', font: 'inherit', fontSize: 14, fontWeight: 600, padding: 12, marginTop: 6, cursor: 'pointer' }}>{he ? 'אולי אחר כך' : 'Maybe later'}</button>
          </>
        )}
      </div>
    </div>
  );
}

function SuccessScreen({ lang, t, accent, serif, booking, onDone, onRebook, rebookDays }) {
  const nm = o => o[lang];
  const he = lang === 'he';
  const [cal, setCal] = useStateB(false);
  const resched = booking.rescheduled;
  const pending = booking.pending;
  const rbWeeks = Math.max(1, Math.round((rebookDays || 28) / 7));
  const rbDate = (() => { const d = new Date(); d.setDate(d.getDate() + (rebookDays || 28)); return d.toLocaleDateString(he ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short' }); })();
  const title = pending ? (he ? 'בקשתך נשלחה' : 'Request sent') : resched ? (he ? 'המועד עודכן!' : 'Time updated!') : t.confirmedTitle;
  const sub = pending ? (he ? 'ממתינה לאישור הספר, נעדכן אותך מיד כשתאושר.' : 'Awaiting the barber\u2019s approval, we\u2019ll update you as soon as it\u2019s confirmed.') : resched ? (he ? 'שלחנו אישור מעודכן. נתראה בקרוב.' : 'Updated confirmation sent. See you soon.') : t.confirmedSub;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#0B1E3D, #0E2A52)', zIndex: 65, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 26px', textAlign: 'center', overflow: 'hidden' }}>
      <div className="succ-pop" style={{ width: 92, height: 92, borderRadius: '50%', background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 18px 50px rgba(200,162,74,0.5)', marginBottom: 26 }}>
        <Icon name={pending ? 'clock' : 'check'} size={48} color="#0B1E3D" stroke={2.6} />
      </div>
      <div className="succ-rise" style={{ fontFamily: displayFont(lang, serif), fontWeight: 700, fontSize: lang === 'he' ? 32 : 30, color: '#FBF9F5', marginBottom: 8 }}>{title}</div>
      <div className="succ-rise succ-d1" style={{ fontSize: 15, color: 'rgba(251,249,245,0.7)', lineHeight: 1.45, maxWidth: 280, marginBottom: 26 }}>{sub}</div>
      <div className="succ-rise succ-d2" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(228,201,123,0.25)', borderRadius: 18, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
        <BarberMedallion b={booking.barber} size={44} lang={lang} />
        <div style={{ textAlign: 'start' }}>
          <div style={{ color: '#FBF9F5', fontWeight: 600, fontSize: 15 }}>{nm(booking.service)}</div>
          <div style={{ color: 'rgba(251,249,245,0.65)', fontSize: 13, marginTop: 2, direction: 'ltr', unicodeBidi: 'isolate' }}>{nm(booking.barber)} · {booking.day} {booking.slot.slice(1)}</div>
          {booking.paid && window.PaidChip && <div style={{ marginTop: 7 }}><PaidChip paid={booking.paid} lang={lang} /></div>}
        </div>
      </div>
      <div className="succ-rise succ-d2" style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pending
          ? <Btn kind="gold" icon="check" onClick={onDone}>{he ? 'הבנתי' : 'Got it'}</Btn>
          : <>
              <Btn kind="gold" icon="calendar" onClick={() => setCal(true)}>{t.addCal}</Btn>
              {onRebook && !resched && <button onClick={onRebook} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', borderRadius: 14, border: '1px solid rgba(228,201,123,0.4)', background: 'rgba(228,201,123,0.1)', color: '#FBF9F5', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}><Icon name="refresh" size={17} color="#E4C97B" />{he ? `לקבוע כבר את הבא? (בעוד ~${rbWeeks} שבועות · הקצב שלך)` : `Book your next? (~${rbWeeks} wks · your rhythm)`}</button>}
              <button onClick={onDone} style={{ background: 'none', border: 'none', color: 'rgba(251,249,245,0.7)', font: 'inherit', fontSize: 15, fontWeight: 600, padding: 10, cursor: 'pointer' }}>{t.done}</button>
            </>}
      </div>
      {cal && <AddToCalendarSheet lang={lang} accent={accent} serif={serif} booking={booking} onClose={() => setCal(false)} />}
    </div>
  );
}

Object.assign(window, { BookingFlow, SuccessScreen });
