// onboarding.jsx, app entry: splash → welcome → phone → OTP → (name) → role detect
// Exports: Onboarding
const { useState: useOb, useEffect: useObE, useRef: useObR } = React;

const digitsOnly = s => (s || '').replace(/[^0-9]/g, '');

function Onboarding({ lang, t, accent, serif, staff, onDone }) {
  const he = lang === 'he';
  const [step, setStep] = useOb('splash');   // splash | welcome | phone | otp | name
  const [phone, setPhone] = useOb('');
  const [account, setAccount] = useOb(null);  // matched returning CUSTOMER (or null = new)
  const [staffMatch, setStaffMatch] = useOb(null);  // matched barber/owner profile by phone
  const [code, setCode] = useOb(['', '', '', '', '', '']);
  const [secs, setSecs] = useOb(180);
  const [name, setName] = useOb('');
  const [email, setEmail] = useOb('');
  const [address, setAddress] = useOb('');
  const [region, setRegion] = useOb('');
  const refs = useObR([]);

  // splash auto-advance
  useObE(() => { if (step !== 'splash') return; const id = setTimeout(() => setStep('welcome'), 1900); return () => clearTimeout(id); }, [step]);
  // otp timer
  useObE(() => { if (step !== 'otp' || secs <= 0) return; const id = setInterval(() => setSecs(s => s - 1), 1000); return () => clearInterval(id); }, [step, secs > 0]);

  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const mm = String(Math.floor(secs / 60)).padStart(2, '0'), ss = String(secs % 60).padStart(2, '0');
  const phoneValid = digitsOnly(phone).length >= 9;
  const codeFull = code.join('').length === 6;

  const submitPhone = () => {
    const d = digitsOnly(phone);
    // identity routing key: a barber profile whose number matches this login.
    // owner (Rafi) → manager dashboard · any other barber → their own barber dashboard.
    const sm = (staff || []).find(b => digitsOnly(b.phone) && digitsOnly(b.phone) === d) || null;
    // fallback only when it isn't a staff number: a recognized returning customer keeps their profile.
    const acc = !sm ? (DATA.accounts.find(a => a.phone === d && a.role === 'customer') || null) : null;
    setStaffMatch(sm);
    setAccount(acc);
    setStep('otp'); setSecs(180); setCode(['', '', '', '', '', '']);
    setTimeout(() => refs.current[0] && refs.current[0].focus(), 250);
  };
  const setDigit = (i, v) => {
    v = digitsOnly(v);
    if (!v) { const n = [...code]; n[i] = ''; setCode(n); return; }
    const n = [...code]; n[i] = v.slice(-1); setCode(n);
    if (i < 5) refs.current[i + 1] && refs.current[i + 1].focus();
  };
  const onKey = (i, e) => { if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1] && refs.current[i - 1].focus(); };
  const submitCode = () => {
    if (!codeFull) return;
    // 1 + 2 · the number belongs to a barber profile → straight to the matching dashboard
    if (staffMatch) {
      onDone({ role: staffMatch.owner ? 'admin' : 'barber', barberId: staffMatch.id, name: staffMatch[he ? 'he' : 'en'], phone: digitsOnly(phone), isNew: false });
      return;
    }
    // recognized returning customer → straight in, same profile
    if (account) {
      onDone({ role: 'customer', barberId: null, name: account[he ? 'nameHe' : 'nameEn'], phone: digitsOnly(phone), region: account[he ? 'regionHe' : 'regionEn'] || null, isNew: false });
      return;
    }
    // 3 · unknown number → brand-new customer profile
    setStep('name');
  };
  const finish = () => { if (!address.trim()) return; onDone({ role: 'customer', barberId: null, name: name.trim(), phone: digitsOnly(phone), email: email.trim() || undefined, region: region || null, address: address.trim(), isNew: true }); };
  const fillDemo = (d) => setPhone(d);

  const field = { width: '100%', boxSizing: 'border-box', font: 'inherit', color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.14)', borderRadius: 14, padding: '14px 15px', outline: 'none', direction: he ? 'rtl' : 'ltr', textAlign: 'start', fontSize: 16 };

  // ── SPLASH ──
  if (step === 'splash') {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'radial-gradient(130% 100% at 50% 26%, #1b3c69 0%, #0B1E3D 52%, #060f1d 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div className="ob-shimmer-wrap" style={{ position: 'relative', overflow: 'visible' }}>
          <Medallion size={188} halo bg="#fff">
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <Emblem size={150} />
              <div className="ob-shimmer" />
            </div>
          </Medallion>
        </div>
        <div className="ob-splash-tag" style={{ marginTop: 30, textAlign: 'center' }}>
          {he
            ? <img src={(window._asset||((p)=>p))('assets/maspari-cream.png')} alt="מספרפי" style={{ width: '62%', maxWidth: 320, height: 'auto', display: 'block', margin: '0 auto' }} />
            : <div style={{ fontFamily: displayFont(lang, serif), fontWeight: 700, fontSize: 30, letterSpacing: 6, color: '#FBF9F5' }}>BARBER SHOP</div>}
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, color: 'rgba(228,201,123,0.85)' }}>
            <span style={{ width: 18, height: 1, background: 'rgba(228,201,123,0.5)' }} />
            <span style={{ fontSize: 11, letterSpacing: 2, fontWeight: 700 }}>EST · 2001</span>
            <span style={{ width: 18, height: 1, background: 'rgba(228,201,123,0.5)' }} />
          </div>
        </div>
      </div>
    );
  }

  // ── WELCOME ──
  if (step === 'welcome') {
    return (
      <div className="s2-in" style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'radial-gradient(120% 85% at 50% 22%, #1b3c69 0%, #0B1E3D 55%, #060f1d 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '40px 26px calc(30px + env(safe-area-inset-bottom))', textAlign: 'center' }}>
        <div className="s2-rise ob-shimmer-wrap" style={{ position: 'relative', overflow: 'visible' }}>
          <Medallion size={150} halo bg="#fff">
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <Emblem size={120} />
              <div className="ob-shimmer" />
            </div>
          </Medallion>
        </div>
        {he
          ? <img className="s2-rise" src={(window._asset||((p)=>p))('assets/maspari-cream.png')} alt="מספרפי" style={{ animationDelay: '.06s', width: '62%', maxWidth: 320, height: 'auto', marginTop: 30, display: 'block' }} />
          : <div className="s2-rise" style={{ animationDelay: '.06s', fontFamily: displayFont(lang, serif), fontWeight: 700, fontSize: 36, color: '#FBF9F5', lineHeight: 1.1, marginTop: 30, letterSpacing: '.04em' }}>{DATA.brand[lang]}</div>}
        <div className="s2-rise" style={{ animationDelay: '.14s', fontSize: 16, color: 'rgba(212,175,108,0.92)', marginTop: 12, lineHeight: 1.4, letterSpacing: '.01em' }}>{t.welcomeTitle}</div>
        <div className="s2-rise" style={{ animationDelay: '.22s', marginTop: 34, width: '100%', maxWidth: 340 }}><Btn kind="gold" icon={he ? 'arrowL' : 'arrowR'} onClick={() => setStep('phone')}>{t.welcomeCta}</Btn></div>
      </div>
    );
  }

  // ── PHONE ──
  if (step === 'phone') {
    return (
      <div className="s2-in" style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'var(--cream-bg)', display: 'flex', flexDirection: 'column' }}>
        <ObHeader lang={lang} onBack={() => setStep('welcome')} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 22px 18px' }}>
          <div style={{ width: 60, height: 60, borderRadius: 17, background: 'linear-gradient(135deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, boxShadow: '0 10px 24px rgba(11,30,61,0.2)' }}><Icon name="phone" size={28} color="#E4C97B" /></div>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 25, color: '#0B1E3D' }}>{t.phoneTitle}</div>
          <div style={{ fontSize: 14.5, color: 'rgba(11,30,61,0.55)', marginTop: 6, marginBottom: 22, lineHeight: 1.5 }}>{t.phoneSub}</div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 8, marginInlineStart: 2 }}>{t.phoneLabel}</div>
          <div style={{ display: 'flex', gap: 9, direction: 'ltr' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', background: '#fff', border: '1px solid rgba(11,30,61,0.14)', borderRadius: 14, fontSize: 16, fontWeight: 700, color: '#0B1E3D', flexShrink: 0 }}>🇮🇱 +972</div>
            <input value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel" placeholder="050-000-0000" style={{ ...field, direction: 'ltr', textAlign: 'left' }} />
          </div>
          <div style={{ marginTop: 14, background: 'rgba(200,162,74,0.09)', border: '1px solid rgba(200,162,74,0.3)', borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: accent, marginBottom: 8 }}>{t.demoHint}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[['0500000000', t.demoAdmin], ['0501111111', t.demoBarber], ['0509998888', t.demoCust]].map(([num, label]) => (
                <button key={num} onClick={() => fillDemo(num)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid rgba(11,30,61,0.08)', borderRadius: 10, padding: '8px 11px', cursor: 'pointer', font: 'inherit' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0B1E3D' }}>{label}</span>
                  <span style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.5)', direction: 'ltr', fontWeight: 600 }}>{num.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ flexShrink: 0, padding: '12px 22px calc(16px + env(safe-area-inset-bottom))' }}>
          <Btn kind="primary" disabled={!phoneValid} onClick={submitPhone}>{t.phoneCta}</Btn>
        </div>
      </div>
    );
  }

  // ── OTP ──
  if (step === 'otp') {
    const dispPhone = '+972 ' + digitsOnly(phone).replace(/^0/, '');
    return (
      <div className="s2-in" style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'var(--cream-bg)', display: 'flex', flexDirection: 'column' }}>
        <ObHeader lang={lang} onBack={() => setStep('phone')} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 22px 18px' }}>
          <div style={{ width: 60, height: 60, borderRadius: 17, background: 'linear-gradient(135deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, boxShadow: '0 10px 24px rgba(11,30,61,0.2)' }}><Icon name="message" size={28} color="#E4C97B" /></div>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 25, color: '#0B1E3D' }}>{t.otpTitle}</div>
          <div style={{ fontSize: 14.5, color: 'rgba(11,30,61,0.55)', marginTop: 6, marginBottom: 22, lineHeight: 1.5 }}>{t.otpSub} <span style={{ fontWeight: 700, color: '#0B1E3D', direction: 'ltr', unicodeBidi: 'isolate' }}>{dispPhone}</span></div>
          <div dir="ltr" style={{ display: 'flex', gap: 9, justifyContent: 'center' }}>
            {code.map((d, i) => (
              <input key={i} ref={el => refs.current[i] = el} value={d} inputMode="numeric" maxLength={1}
                onChange={e => setDigit(i, e.target.value)} onKeyDown={e => onKey(i, e)}
                style={{ width: 46, height: 56, textAlign: 'center', fontSize: 24, fontWeight: 700, fontFamily: serif, color: '#0B1E3D', border: `1.5px solid ${d ? accent : 'rgba(11,30,61,0.15)'}`, borderRadius: 14, outline: 'none', background: '#fff', boxShadow: d ? `0 4px 12px ${accent}33` : 'none', transition: 'all .15s' }} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 18 }}>
            <Icon name="clock" size={15} color={secs > 0 ? accent : '#B03A3A'} />
            <span style={{ fontSize: 13.5, color: secs > 0 ? 'rgba(11,30,61,0.6)' : '#B03A3A', fontWeight: 600 }}>{secs > 0 ? `${mm}:${ss}` : (he ? 'הקוד פג תוקף' : 'Code expired')}</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: 6 }}>
            <button onClick={() => { setSecs(180); setCode(['', '', '', '', '', '']); refs.current[0] && refs.current[0].focus(); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: accent, fontWeight: 700, fontSize: 14, padding: 8 }}><Icon name="refresh" size={15} color={accent} />{he ? 'שלח שוב' : 'Resend'}</button>
          </div>
        </div>
        <div style={{ flexShrink: 0, padding: '12px 22px calc(16px + env(safe-area-inset-bottom))' }}>
          <Btn kind="primary" icon="check" disabled={!codeFull} onClick={submitCode}>{he ? 'אמת וכנס' : 'Verify & continue'}</Btn>
        </div>
      </div>
    );
  }

  // ── NAME (new only) ──
  if (step === 'name') {
    return (
      <div className="s2-in" style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'var(--cream-bg)', display: 'flex', flexDirection: 'column' }}>
        <ObHeader lang={lang} onBack={() => setStep('otp')} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 22px 18px' }}>
          <div style={{ width: 60, height: 60, borderRadius: 17, background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, boxShadow: '0 10px 24px rgba(200,162,74,0.3)' }}><Icon name="user" size={28} color="#0B1E3D" /></div>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 25, color: '#0B1E3D' }}>{t.nameTitle}</div>
          <div style={{ fontSize: 14.5, color: 'rgba(11,30,61,0.55)', marginTop: 6, marginBottom: 22 }}>{t.nameSub}</div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 8, marginInlineStart: 2 }}>{t.nameLabel}</div>
          <input value={name} onChange={e => setName(e.target.value)} autoFocus placeholder={he ? 'איך נקרא לך?' : 'Your name'} style={field} />
        </div>
        <div style={{ flexShrink: 0, padding: '12px 22px calc(16px + env(safe-area-inset-bottom))' }}>
          <Btn kind="primary" icon={he ? 'arrowL' : 'arrowR'} disabled={!name.trim()} onClick={() => name.trim() && setStep('email')}>{t.continue}</Btn>
        </div>
      </div>
    );
  }

  // ── EMAIL (new only, OPTIONAL - phone is the sole identifier; email is a secondary channel) ──
  if (step === 'email') {
    return (
      <div className="s2-in" style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'var(--cream-bg)', display: 'flex', flexDirection: 'column' }}>
        <ObHeader lang={lang} onBack={() => setStep('name')} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 22px 18px' }}>
          <div style={{ width: 60, height: 60, borderRadius: 17, background: 'linear-gradient(135deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, boxShadow: '0 10px 24px rgba(11,30,61,0.2)' }}><Icon name="mail" size={28} color="#E4C97B" /></div>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 25, color: '#0B1E3D' }}>{he ? 'כתובת המייל שלך' : 'Your email'}</div>
          <div style={{ fontSize: 14.5, color: 'rgba(11,30,61,0.55)', marginTop: 6, marginBottom: 22, lineHeight: 1.5 }}>{he ? 'לא חובה - הטלפון הוא המזהה שלך. מייל משמש רק כערוץ הודעות משני, אם תרצו.' : 'Optional - your phone is your identifier. Email is only a secondary message channel.'}</div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 8, marginInlineStart: 2 }}>{he ? 'אימייל (לא חובה)' : 'Email address (optional)'}</div>
          <input value={email} onChange={e => setEmail(e.target.value)} autoFocus inputMode="email" placeholder="name@email.com" style={{ ...field, direction: 'ltr', textAlign: 'left' }} />
          {email.trim() && !emailValid && <div style={{ fontSize: 12, color: '#B03A3A', marginTop: 8, marginInlineStart: 2, fontWeight: 600 }}>{he ? 'נא להזין כתובת מייל תקינה' : 'Please enter a valid email'}</div>}
        </div>
        <div style={{ flexShrink: 0, padding: '12px 22px calc(16px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn kind="primary" icon={he ? 'arrowL' : 'arrowR'} disabled={!!email.trim() && !emailValid} onClick={() => { if (!email.trim() || emailValid) setStep('address'); }}>{he ? 'המשך' : 'Continue'}</Btn>
          <button onClick={() => { setEmail(''); setStep('address'); }} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 14.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', padding: '6px' }}>{he ? 'דלג בינתיים' : 'Skip for now'}</button>
        </div>
      </div>
    );
  }

  // ── ADDRESS (new only, required for the “time to leave” alert) ──
  return (
    <div className="s2-in" style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'var(--cream-bg)', display: 'flex', flexDirection: 'column' }}>
      <ObHeader lang={lang} onBack={() => setStep('email')} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 22px 18px' }}>
        <div style={{ width: 60, height: 60, borderRadius: 17, background: 'linear-gradient(135deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, boxShadow: '0 10px 24px rgba(11,30,61,0.2)' }}><Icon name="pin" size={28} color="#E4C97B" /></div>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 25, color: '#0B1E3D' }}>{he ? 'הכתובת שלך' : 'Your address'}</div>
        <div style={{ fontSize: 14.5, color: 'rgba(11,30,61,0.55)', marginTop: 6, marginBottom: 18, lineHeight: 1.5 }}>{he ? 'נשתמש בה כדי לחשב זמן נסיעה ולהזכיר לך מתי לצאת לתור 🚗' : 'We use it to estimate travel time and remind you when to leave 🚗'}</div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 8, marginInlineStart: 2 }}>{he ? 'רחוב, מספר ועיר' : 'Street, number & city'}</div>
        <input value={address} onChange={e => setAddress(e.target.value)} autoFocus placeholder={he ? 'לדוגמה: הפלמ״ח 12, ירושלים' : 'e.g. 12 Hapalmach St, Jerusalem'} style={field} />
        <div style={{ marginTop: 16 }}><AddressBlock lang={lang} accent={accent} addr={address} /></div>
      </div>
      <div style={{ flexShrink: 0, padding: '12px 22px calc(16px + env(safe-area-inset-bottom))' }}>
        <Btn kind="gold" icon={he ? 'arrowL' : 'arrowR'} disabled={!address.trim()} onClick={finish}>{t.nameCta}</Btn>
      </div>
    </div>
  );
}

function ObHeader({ lang, onBack }) {
  const he = lang === 'he';
  return (
    <div style={{ padding: '54px 18px 8px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
      <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name={he ? 'arrowR' : 'arrowL'} size={20} color="#0B1E3D" /></button>
    </div>
  );
}

Object.assign(window, { Onboarding });
