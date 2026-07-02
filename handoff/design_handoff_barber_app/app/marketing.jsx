// marketing.jsx - Round H2: social-media marketing (acquisition, not retention).
// The value here is PROACTIVE, real-data nudges - not a generic post maker.
// marketingSignals derives opportunities from real data (weakest weekday from the
// booking history, a punch-promo about to expire, content gone quiet). The screen
// surfaces them and hands Rafi a ready caption to paste wherever he posts manually.
// Scheduled auto-publish via the Meta API is flagged as a later (L3) phase.
// Exposes window.marketingStore, window.marketingSignals, window.SocialPostScreen,
// window.MarketingNudgeCard.

const { useState: useMkt } = React;

// ───────────────────────── store (manager-controlled) ─────────────────────────
const marketingStore = {
  KEY: 'royale_socialmkt_v1',
  _load() { try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; } catch (e) { return {}; } },
  _save(m) { try { localStorage.setItem(this.KEY, JSON.stringify(m)); } catch (e) {} },
  // each nudge type can be switched off independently; default on
  isNudgeOn(id) { const m = this._load(); return !(m.off && m.off[id]); },
  setNudgeOn(id, v) { const m = this._load(); m.off = m.off || {}; if (v) delete m.off[id]; else m.off[id] = true; this._save(m); },
  anyNudgeOn() { return ['weakDay', 'promoEnding', 'staleContent'].some(id => this.isNudgeOn(id)); },
  // soft-dismiss a nudge for ~5 days so it doesn't nag
  dismiss(id) { const m = this._load(); m.dismissed = m.dismissed || {}; m.dismissed[id] = Date.now(); this._save(m); },
  isDismissed(id) { const m = this._load(); const t = m.dismissed && m.dismissed[id]; return !!t && (Date.now() - t < 5 * 86400000); },
};
window.marketingStore = marketingStore;

const DOW = { he: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] };

// ───────────────────────── proactive signals (real data) ─────────────────────────
// Returns active nudges: [{ id, icon, color, title, sub, idea }] where `idea` is a
// ready-to-paste caption for a manual social post.
function marketingSignals(appts, staff) {
  const he = (document.documentElement.lang || 'he') === 'he';
  const out = [];
  const live = a => a.status !== 'no' && a.status !== 'cancelled' && a.status !== 'rejected';
  const priceOf = id => (DATA.services.find(s => s.id === id)?.price || 0);

  // (a) weakest weekday - historically lowest-revenue day that actually has data
  if (marketingStore.isNudgeOn('weakDay') && !marketingStore.isDismissed('weakDay')) {
    const sums = Array(7).fill(0), cnts = Array(7).fill(0);
    (appts || []).filter(live).forEach(a => { try { const d = new Date(a.date + 'T00:00').getDay(); sums[d] += priceOf(a.svc); cnts[d]++; } catch (e) {} });
    let weak = -1, weakVal = Infinity;
    for (let i = 0; i < 7; i++) { if (cnts[i] > 0 && sums[i] < weakVal) { weakVal = sums[i]; weak = i; } }
    if (weak >= 0) {
      const dname = DOW[he ? 'he' : 'en'][weak];
      out.push({
        id: 'weakDay', icon: 'chart', color: '#2A6FDB',
        title: he ? `${dname} הוא היום החלש שלך` : `${dname} is your slowest day`,
        sub: he ? 'הכי מעט תורים בשבוע. שווה לפרסם מבצע שימשוך אנשים.' : 'Fewest bookings in the week. Worth an offer to pull people in.',
        idea: he ? `מבצע ל${dname}! בואו לתספורת ביום הרגוע של השבוע. קבעו תור אונליין במספרפי.` : `${dname} special! Come in on the calm day of the week. Book online at Mesparfi.`,
      });
    }
  }

  // (b) a promo (punch package) about to expire - within 7 days
  if (marketingStore.isNudgeOn('promoEnding') && !marketingStore.isDismissed('promoEnding') && window.punchStore) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let best = null;
    (punchStore.packages() || []).forEach(p => {
      if (p.active === false || !p.expiry) return;
      const end = new Date(p.expiry + 'T00:00'); if (isNaN(end)) return;
      const days = Math.ceil((end - today) / 86400000);
      if (days >= 0 && days <= 7 && (!best || days < best.days)) best = { p, days };
    });
    if (best) {
      const nm = he ? best.p.he : best.p.en;
      const dtxt = best.days === 0 ? (he ? 'היום' : 'today') : best.days === 1 ? (he ? 'מחר' : 'tomorrow') : (he ? `בעוד ${best.days} ימים` : `in ${best.days} days`);
      out.push({
        id: 'promoEnding', icon: 'card', color: '#C8A24A',
        title: he ? `${nm} מסתיים ${dtxt}` : `${nm} ends ${dtxt}`,
        sub: he ? 'מבצע כרטיסייה פעיל שמתקרב לסיום. תזכיר לעוקבים.' : 'An active card promo nearing its end. Remind your followers.',
        idea: he ? `${nm} לפני שנגמר! המבצע מסתיים ${dtxt}. אל תפספסו, הצטרפו עכשיו במספרפי.` : `${nm}, last chance! Offer ends ${dtxt}. Don’t miss it, join now at Mesparfi.`,
      });
    }
  }

  // (c) content gone stale - no marketing nudge acted on in a while
  if (marketingStore.isNudgeOn('staleContent') && !marketingStore.isDismissed('staleContent')) {
    out.push({
      id: 'staleContent', icon: 'spark', color: '#8E5BD0',
      title: he ? 'מזמן לא פרסמת תוכן' : 'It’s been quiet lately',
      sub: he ? 'נוכחות קבועה ברשתות מביאה לקוחות חדשים. הנה רעיון.' : 'A steady presence brings new clients. Here’s an idea.',
      idea: he ? 'תספורת חדשה? קבעו תור אונליין בכמה נקישות. נשמח לארח אתכם במספרפי. ✂️' : 'Fresh cut? Book online in a few taps. We’d love to see you at Mesparfi. ✂️',
    });
  }

  return out;
}
window.marketingSignals = marketingSignals;

// ───────────────────────── opportunities screen ─────────────────────────
function SocialPostScreen({ lang, t, accent, serif, onBack, appts, toast }) {
  const he = lang === 'he';
  const [, force] = useMkt(0);
  const refresh = () => force(n => n + 1);
  const liveAppts = appts || (() => { try { return JSON.parse(localStorage.getItem('royale_appts_v4')) || []; } catch (e) { return []; } })();
  const signals = marketingSignals(liveAppts, null);

  const copyIdea = async (txt) => { try { await navigator.clipboard.writeText(txt); toast && toast(he ? 'הרעיון הועתק ✓' : 'Idea copied ✓', he ? 'הדביקו בפוסט בפייסבוק או אינסטגרם' : 'Paste into your Facebook or Instagram post'); } catch (e) { toast && toast(he ? 'לא ניתן להעתיק' : 'Copy failed', ''); } };
  const dismiss = (id) => { marketingStore.dismiss(id); refresh(); };
  const NUDGES = [
    { id: 'weakDay', he: 'היום החלש בשבוע', en: 'Slowest day of week' },
    { id: 'promoEnding', he: 'מבצע שמסתיים', en: 'Promo ending soon' },
    { id: 'staleContent', he: 'מזמן לא פרסמת', en: 'Content gone quiet' },
  ];

  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל · שיווק' : 'Admin · marketing'} title={he ? 'שיווק לרשתות' : 'Social marketing'} onBack={onBack} />
      <Body style={{ gap: 16 }}>
        <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.6)', lineHeight: 1.55, margin: '2px 2px 0' }}>
          {he ? 'הזדמנויות שיווק שהמערכת מזהה מהנתונים שלך. כל הצעה מגיעה עם רעיון מוכן להעתקה ולפרסום בפייסבוק או אינסטגרם.' : 'Marketing opportunities the system spots in your data. Each comes with a ready-to-paste idea for Facebook or Instagram.'}
        </div>

        {/* active opportunities */}
        {signals.length > 0 ? signals.map(s => (
          <div key={s.id} style={{ position: 'relative', background: '#fff', border: `1px solid ${s.color}33`, borderRadius: 18, padding: '15px 16px', boxShadow: '0 4px 14px rgba(11,30,61,0.05)' }}>
            <button onClick={() => dismiss(s.id)} aria-label={he ? 'הסתר' : 'Dismiss'} style={{ position: 'absolute', top: 11, insetInlineEnd: 11, background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'rgba(11,30,61,0.3)' }}><Icon name="x" size={15} /></button>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingInlineEnd: 18 }}>
              <span style={{ width: 40, height: 40, borderRadius: 11, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={s.icon} size={20} color={s.color} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 16.5, color: '#0B1E3D', lineHeight: 1.25 }}>{s.title}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.55)', marginTop: 3, lineHeight: 1.45 }}>{s.sub}</div>
              </div>
            </div>
            {/* the ready caption */}
            <div style={{ marginTop: 12, background: '#FBF9F5', border: '1px solid rgba(11,30,61,0.08)', borderRadius: 12, padding: '11px 13px' }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.4, color: 'rgba(11,30,61,0.4)', textTransform: 'uppercase', marginBottom: 5 }}>{he ? 'רעיון לפוסט' : 'Post idea'}</div>
              <div style={{ fontSize: 13.5, color: '#0B1E3D', lineHeight: 1.55 }}>{s.idea}</div>
            </div>
            <button onClick={() => copyIdea(s.idea)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 10, padding: '11px', borderRadius: 12, border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 13.5, fontWeight: 700, background: s.color, color: '#fff' }}>
              <Icon name="file" size={15} color="#fff" />{he ? 'העתק את הרעיון' : 'Copy this idea'}
            </button>
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '44px 26px', background: '#fff', borderRadius: 20, border: '1px dashed rgba(11,30,61,0.16)' }}>
            <span style={{ display: 'inline-flex', width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg,rgba(228,201,123,0.22),rgba(200,162,74,0.16))', alignItems: 'center', justifyContent: 'center', marginBottom: 15 }}><Icon name="spark" size={28} color={accent} /></span>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 18, color: '#0B1E3D' }}>{he ? 'אין הזדמנויות כרגע' : 'No opportunities right now'}</div>
            <div style={{ fontSize: 13.5, color: 'rgba(11,30,61,0.55)', marginTop: 7, lineHeight: 1.55, maxWidth: 270, marginInline: 'auto' }}>{marketingStore.anyNudgeOn() ? (he ? 'כשהמערכת תזהה הזדמנות (יום חלש, מבצע שמסתיים) היא תופיע כאן.' : 'When the system spots an opportunity it’ll show here.') : (he ? 'כל התזכורות כבויות. אפשר להפעיל אותן למטה.' : 'All nudges are off. Turn them on below.')}</div>
          </div>
        )}

        {/* which nudges are active */}
        <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(11,30,61,0.07)' }}>
          <div style={{ padding: '13px 15px 4px', fontSize: 12.5, fontWeight: 700, color: '#0B1E3D' }}>{he ? 'אילו תזכורות להציג' : 'Which nudges to show'}</div>
          {NUDGES.map((n, i) => {
            const on = marketingStore.isNudgeOn(n.id);
            return (
              <button key={n.id} onClick={() => { marketingStore.setNudgeOn(n.id, !on); refresh(); }} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'start', border: 'none', borderTop: i === 0 ? 'none' : '1px solid rgba(11,30,61,0.06)', background: 'none', font: 'inherit', cursor: 'pointer', padding: '13px 15px' }}>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#0B1E3D' }}>{he ? n.he : n.en}</span>
                <span style={{ width: 44, height: 26, borderRadius: 999, background: on ? accent : 'rgba(11,30,61,0.18)', position: 'relative', flexShrink: 0, transition: 'background .18s' }}>
                  <span style={{ position: 'absolute', top: 3, insetInlineStart: on ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'inset-inline-start .18s' }}></span>
                </span>
              </button>
            );
          })}
        </div>

        {/* L3 future-phase note */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: 'rgba(11,30,61,0.04)', border: '1px dashed rgba(11,30,61,0.16)', borderRadius: 14, padding: '12px 13px' }}>
          <Icon name="clock" size={16} color="rgba(11,30,61,0.4)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.6)', lineHeight: 1.5 }}>
            <b style={{ color: '#0B1E3D' }}>{he ? 'בקרוב, פרסום אוטומטי מתוזמן' : 'Coming soon, scheduled auto-publish'}</b><br />
            {he ? 'חיבור ישיר לפייסבוק ואינסטגרם (Meta API) יאפשר תזמון ופרסום אוטומטי. כרגע, זיהוי הזדמנות ושיתוף ידני.' : 'A direct Facebook/Instagram (Meta API) connection will allow scheduling and auto-posting. For now, opportunity spotting and manual sharing.'}
          </div>
        </div>
      </Body>
    </Shell>
  );
}

// ───────────────────────── dashboard nudge card ─────────────────────────
function MarketingNudgeCard({ lang, accent, serif, appts, staff, go }) {
  const he = lang === 'he';
  const [, force] = useMkt(0);
  if (!marketingStore.anyNudgeOn()) return null;
  const signals = marketingSignals(appts, staff);
  if (!signals.length) return null;
  const s = signals[0]; // surface the top opportunity
  const dismiss = (e) => { e.stopPropagation(); marketingStore.dismiss(s.id); force(n => n + 1); };
  return (
    <div onClick={() => go && go('socialmkt')} style={{ position: 'relative', cursor: 'pointer', background: 'linear-gradient(140deg,#14305A,#0B1E3D)', borderRadius: 18, padding: '15px 16px', boxShadow: '0 10px 28px rgba(11,30,61,0.2)', border: '0.5px solid rgba(228,201,123,0.4)' }}>
      <button onClick={dismiss} aria-label="dismiss" style={{ position: 'absolute', top: 11, insetInlineEnd: 11, background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'rgba(251,249,245,0.5)' }}><Icon name="x" size={15} /></button>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingInlineEnd: 16 }}>
        <span style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(228,201,123,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={s.icon} size={20} color="#E4C97B" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, color: '#E4C97B', textTransform: 'uppercase', marginBottom: 2 }}>{he ? 'הזדמנות שיווק' : 'Marketing opportunity'}</div>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 16, color: '#FBF9F5', lineHeight: 1.25 }}>{s.title}</div>
          <div style={{ fontSize: 12.5, color: 'rgba(251,249,245,0.72)', marginTop: 3, lineHeight: 1.4 }}>{s.sub}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 11, background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', color: '#0B1E3D', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700 }}>
            <Icon name="spark" size={14} color="#0B1E3D" />{he ? 'לכל ההזדמנויות' : 'See opportunities'}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { marketingStore, marketingSignals, SocialPostScreen, MarketingNudgeCard });
