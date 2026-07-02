// health.jsx, Round 12: laser-treatment health declaration (hybrid digital form).
// • isLaserService(id), true for any laser service (data flag `laser`).
// • healthStore, the signed declaration kept as a document on the customer card (round 3/5).
// • HealthDeclarationSheet, the in-app form: standard health questions + a mandatory
//   final confirmation checkbox that gates submission.
// The exact medical/legal wording is a placeholder for the demo, Rafi or a professional
// supplies the binding text later. Structure only here.
const { useState: useHealth } = React;

// ── does this service require a health declaration before the client's first treatment? ──
// Round 13 fix: driven by a per-service FLAG (Rafi toggles it in service edit), not by
// name/keyword/specific service. The seed laser services carry `laser: true` as the
// default-on; an explicit `healthDecl` (set by the toggle) always wins.
function isLaserService(svc) {
  if (!svc) return false;
  const s = typeof svc === 'string' ? (window.DATA && DATA.services.find(x => x.id === svc)) : svc;
  if (!s) return false;
  return s.healthDecl !== undefined ? !!s.healthDecl : !!s.laser;
}
window.requiresHealthDecl = isLaserService; // clearer alias, same flag check
window.isLaserService = isLaserService;

const healthStore = {
  _k: 'royale_health_v1',
  all() { try { return JSON.parse(localStorage.getItem(this._k)) || {}; } catch (e) { return {}; } },
  _save(v) { try { localStorage.setItem(this._k, JSON.stringify(v)); } catch (e) {} },
  get(clientId) { return this.all()[clientId] || null; },
  signed(clientId) { return !!this.get(clientId); },
  sign(clientId, doc) { const a = this.all(); a[clientId] = { ...doc, signedAt: Date.now() }; this._save(a); return a[clientId]; },
  clear(clientId) { const a = this.all(); delete a[clientId]; this._save(a); },
};
window.healthStore = healthStore;

// ── the demo question structure (sections → yes/no checkboxes). Non-binding placeholder. ──
function healthSections(he) {
  return [
    { id: 'general', icon: 'heart', title: he ? 'מצב בריאותי כללי' : 'General health', q: [
      { id: 'chronic', he: 'מחלה כרונית או בעיה רפואית ידועה', en: 'Chronic illness or known medical condition' },
      { id: 'skin', he: 'מצב עורי פעיל באזור הטיפול (פצע, דלקת, פריחה)', en: 'Active skin condition in the treated area' },
      { id: 'scars', he: 'צלקות, כתמים או שומות באזור הטיפול', en: 'Scars, marks or moles in the treated area' },
    ] },
    { id: 'allergy', icon: 'spark', title: he ? 'רגישויות ואלרגיות' : 'Sensitivities & allergies', q: [
      { id: 'photo', he: 'רגישות יתר לאור או לשמש', en: 'Light or sun hypersensitivity' },
      { id: 'allergy', he: 'אלרגיה ידועה (תרופות / חומרים)', en: 'Known allergy (medication / substances)' },
    ] },
    { id: 'meds', icon: 'coin', title: he ? 'תרופות וטיפולים' : 'Medication & treatments', q: [
      { id: 'regular', he: 'נטילת תרופות באופן קבוע', en: 'Taking medication regularly' },
      { id: 'antibio', he: 'אנטיביוטיקה או תרופה פוטו-רגישה בחודש האחרון', en: 'Antibiotics / photosensitising meds in the past month' },
      { id: 'aesthetic', he: 'טיפול אסתטי באזור לאחרונה (בוטוקס / מילוי)', en: 'Recent aesthetic treatment in the area' },
    ] },
    { id: 'preg', icon: 'user', title: he ? 'הריון' : 'Pregnancy', q: [
      { id: 'pregnant', he: 'הריון או הנקה', en: 'Pregnancy or breastfeeding' },
    ] },
    { id: 'sun', icon: 'spark', title: he ? 'חשיפה לשמש' : 'Sun exposure', q: [
      { id: 'recent', he: 'חשיפה לשמש או שיזוף בשבועיים האחרונים', en: 'Sun exposure or tanning in the last two weeks' },
      { id: 'solarium', he: 'שיזוף מלאכותי / סולריום לאחרונה', en: 'Recent artificial tanning / solarium' },
    ] },
  ];
}

function HealthDeclarationSheet({ lang, t, accent, serif, clientName, service, onClose, onSubmit }) {
  const he = lang === 'he';
  const sections = healthSections(he);
  const [ans, setAns] = useHealth({});       // questionId → true (applies)
  const [notes, setNotes] = useHealth('');
  const [confirmed, setConfirmed] = useHealth(false);
  const toggle = (qid) => setAns(a => ({ ...a, [qid]: !a[qid] }));
  const today = new Date().toLocaleDateString(he ? 'he-IL' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  const submit = () => {
    if (!confirmed) return;
    const flagged = [];
    sections.forEach(s => s.q.forEach(q => { if (ans[q.id]) flagged.push(he ? q.he : q.en); }));
    onSubmit({ answers: { ...ans }, flagged, notes: notes.trim(), confirmedText: he ? 'אני מצהיר/ה שכל הפרטים נכונים ומלאים' : 'I declare all details are true and complete', date: today });
  };

  const checkRow = (q) => {
    const on = !!ans[q.id];
    return (
      <button key={q.id} onClick={() => toggle(q.id)} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: on ? 'rgba(200,162,74,0.1)' : '#fff', border: `1px solid ${on ? accent : 'rgba(11,30,61,0.1)'}`, borderRadius: 12, padding: '11px 13px' }}>
        <span style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.22)'}`, background: on ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <Icon name="check" size={13} color="#0B1E3D" stroke={2.6} />}</span>
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: '#0B1E3D', lineHeight: 1.35 }}>{he ? q.he : q.en}</span>
      </button>
    );
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 98, background: 'rgba(7,16,31,0.6)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '94%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        {/* header */}
        <div style={{ flexShrink: 0, padding: '10px 20px 14px', borderBottom: '1px solid rgba(11,30,61,0.06)' }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="file" size={22} color="#E4C97B" /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 19, color: '#0B1E3D' }}>{he ? 'הצהרת בריאות' : 'Health declaration'}</div>
              <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.55)', marginTop: 1 }}>{he ? 'נדרשת לפני טיפול הלייזר הראשון' : 'Required before your first laser treatment'}</div>
            </div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={17} color="#0B1E3D" /></button>
          </div>
        </div>
        {/* body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* identity + demo disclaimer */}
          <div style={{ background: '#fff', border: '1px solid rgba(11,30,61,0.08)', borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(200,162,74,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="spark" size={18} color={accent} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0B1E3D' }}>{clientName || (he ? 'הלקוח/ה' : 'Client')}{service ? <span style={{ fontWeight: 600, color: 'rgba(11,30,61,0.55)' }}>{' · ' + (he ? service.he : service.en)}</span> : null}</div>
              <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1, direction: 'ltr', textAlign: 'start' }}>{today}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(11,30,61,0.04)', borderRadius: 12, padding: '10px 12px' }}>
            <Icon name="bell" size={14} color="rgba(11,30,61,0.4)" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.55)', lineHeight: 1.5 }}>{he ? 'טופס לדמו. הנוסח הרפואי-המשפטי המחייב יוזן בהמשך על-ידי רפי או איש מקצוע.' : 'Demo form. The binding medical/legal wording will be supplied later by Rafi or a professional.'}</span>
          </div>
          <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.6)', marginInlineStart: 2 }}>{he ? 'סמנו כל סעיף שרלוונטי עבורכם:' : 'Tick any item that applies to you:'}</div>
          {/* question sections */}
          {sections.map(sec => (
            <div key={sec.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9, marginInlineStart: 2 }}>
                <Icon name={sec.icon} size={16} color={accent} />
                <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 15, color: '#0B1E3D' }}>{sec.title}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{sec.q.map(checkRow)}</div>
            </div>
          ))}
          {/* notes */}
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 7, marginInlineStart: 2 }}>{he ? 'הערות נוספות (לא חובה)' : 'Additional notes (optional)'}</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder={he ? 'כל דבר נוסף שחשוב שנדע' : 'Anything else we should know'} style={{ width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 14, color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.12)', borderRadius: 12, padding: '11px 13px', outline: 'none', resize: 'none', direction: he ? 'rtl' : 'ltr', textAlign: 'start' }} />
          </div>
          {/* mandatory confirmation, gates the submit */}
          <button onClick={() => setConfirmed(c => !c)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: confirmed ? 'rgba(200,162,74,0.14)' : '#fff', border: `1.5px solid ${confirmed ? accent : 'rgba(11,30,61,0.18)'}`, borderRadius: 14, padding: '13px 14px' }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, border: `1.5px solid ${confirmed ? accent : 'rgba(11,30,61,0.25)'}`, background: confirmed ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{confirmed && <Icon name="check" size={16} color="#0B1E3D" stroke={2.6} />}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#0B1E3D', lineHeight: 1.4 }}>{he ? 'אני מצהיר/ה שכל הפרטים נכונים ומלאים' : 'I declare all details are true and complete'}</span>
          </button>
        </div>
        {/* footer */}
        <div style={{ flexShrink: 0, padding: '12px 20px calc(18px + env(safe-area-inset-bottom))', borderTop: '1px solid rgba(11,30,61,0.06)' }}>
          <Btn kind="gold" icon="check" disabled={!confirmed} onClick={submit}>{he ? 'שליחת ההצהרה' : 'Submit declaration'}</Btn>
          {!confirmed && <div style={{ textAlign: 'center', fontSize: 11.5, color: 'rgba(11,30,61,0.45)', marginTop: 8 }}>{he ? 'יש לסמן את תיבת האישור כדי לשלוח' : 'Tick the confirmation box to submit'}</div>}
        </div>
      </div>
    </div>
  );
}

// ── Round 9 banner/gate: the first-time prompt shown before the form. Two paths ──
//   • “למילוי הטופס” → opens the digital HealthDeclarationSheet (onFill).
//   • “כבר מילאת אצלנו בעבר?” → marks the client as declared MANUALLY, no form (onAlreadyFilled).
// Either way the customer is flagged as “has declaration” and is never asked again.
function HealthDeclGate({ lang, accent, serif, clientName, service, onFill, onAlreadyFilled, onClose }) {
  const he = lang === 'he';
  const svcName = service ? (he ? service.he : service.en) : null;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 98, background: 'rgba(7,16,31,0.6)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)', padding: '10px 20px calc(20px + env(safe-area-inset-bottom))' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
          <span style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="file" size={24} color="#E4C97B" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, color: accent, textTransform: 'uppercase' }}>{he ? 'הצהרת בריאות חד-פעמית' : 'One-time health declaration'}</div>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 19, color: '#0B1E3D', lineHeight: 1.15, marginTop: 2 }}>{he ? 'עוד צעד אחד לפני התור' : 'One last step before booking'}</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={17} color="#0B1E3D" /></button>
        </div>
        <div style={{ background: 'rgba(200,162,74,0.1)', border: `1px solid ${accent}44`, borderRadius: 14, padding: '13px 15px', marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(11,30,61,0.78)', lineHeight: 1.6 }}>
            {he
              ? `זיהינו שזו הפעם הראשונה שאתה קובע ${svcName ? '«' + svcName + '»' : 'טיפול זה'}. נדרשת הצהרת בריאות חד-פעמית לפני הטיפול הראשון. מלא אותה פעם אחת - ולא תתבקש שוב לעולם.`
              : `This looks like your first time booking ${svcName ? '“' + svcName + '”' : 'this treatment'}. A one-time health declaration is required before your first treatment. Fill it once - you'll never be asked again.`}
          </p>
        </div>
        <Btn kind="gold" icon="file" onClick={onFill}>{he ? 'למילוי הטופס' : 'Fill the form'}</Btn>
        <button onClick={onAlreadyFilled} style={{ width: '100%', marginTop: 13, background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: '6px', lineHeight: 1.5 }}>
          <span style={{ fontSize: 13, color: 'rgba(11,30,61,0.6)' }}>{he ? 'כבר מילאת הצהרה אצלנו בעבר? ' : 'Already filled a declaration with us before? '}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: accent, textDecoration: 'underline' }}>{he ? 'לחץ כאן להמשך' : 'Click here to continue'}</span>
        </button>
      </div>
    </div>
  );
}
window.HealthDeclGate = HealthDeclGate;

Object.assign(window, { healthStore, isLaserService, HealthDeclarationSheet, healthSections, HealthDeclGate });
