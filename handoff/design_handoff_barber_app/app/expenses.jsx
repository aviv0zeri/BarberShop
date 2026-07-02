// expenses.jsx · Round G2 - expense management + the "income after expenses" layer.
//   expenseStore        , localStorage-backed list of expense items (manager only).
//   periodExpenses(...)  , pure helper: cost attributable to a selected range.
//   ExpensesScreen       , Rafi adds / edits / deletes expense items.
//   ExpenseEditSheet     , add / edit one item.
// Exports: expenseStore, periodExpenses, ExpensesScreen
const { useState: useEx } = React;

// Default seed - realistic fixed costs + one recent one-off, anchored to this month.
function _defaultExpenses() {
  const pad = n => String(n).padStart(2, '0');
  const d = new Date();
  const today = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const m = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  return [
    { id: 'ex_rent', name: 'שכירות', amount: 6000, type: 'monthly', date: m + '-01' },
    { id: 'ex_elec', name: 'חשמל', amount: 800, type: 'monthly', date: m + '-01' },
    { id: 'ex_arnona', name: 'ארנונה', amount: 1200, type: 'monthly', date: m + '-01' },
    { id: 'ex_ins', name: 'ביטוח עסק', amount: 450, type: 'monthly', date: m + '-01' },
    { id: 'ex_equip', name: 'מכונת תספורת חדשה', amount: 1500, type: 'once', date: today },
  ];
}

const expenseStore = {
  _load() { try { const v = JSON.parse(localStorage.getItem('royale_expenses_v1')); return Array.isArray(v) ? v : null; } catch (e) { return null; } },
  _save(arr) { try { localStorage.setItem('royale_expenses_v1', JSON.stringify(arr)); } catch (e) {} return arr; },
  list() { let arr = this._load(); if (!arr) { arr = _defaultExpenses(); this._save(arr); } return arr; },
  add(item) { const arr = this.list(); arr.unshift({ id: 'ex' + Date.now(), ...item }); return this._save(arr); },
  update(id, patch) { return this._save(this.list().map(x => x.id === id ? { ...x, ...patch } : x)); },
  remove(id) { return this._save(this.list().filter(x => x.id !== id)); },
  // sum of fixed monthly costs (one month)
  monthlyTotal() { return this.list().filter(x => x.type === 'monthly').reduce((n, x) => n + (x.amount || 0), 0); },
};

// Cost attributable to the selected range. By design, FIXED monthly costs are a
// monthly concept - they count in full in the MONTH view and do NOT appear in the
// week/day view (a small note points the user to the monthly view). ONE-TIME items
// count only in the period whose window contains their date (same inRange the
// insights screen feeds in).
function periodExpenses(list, range, inRangeFn) {
  const includeFixed = range === 'month';
  let monthly = 0, once = 0;
  (list || []).forEach(x => {
    if (x.type === 'monthly') { if (includeFixed) monthly += (x.amount || 0); }
    else if (!inRangeFn || inRangeFn(x.date)) once += (x.amount || 0);
  });
  return { monthly: Math.round(monthly), once: Math.round(once), total: Math.round(monthly + once), includeFixed };
}

// ── add / edit one expense ──────────────────────────────────────────────
function ExpenseEditSheet({ lang, accent, serif, item, onClose, onSave, onDelete }) {
  const he = lang === 'he';
  const isNew = !item || !item.id;
  const today = (() => { const d = new Date(); const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; })();
  const [d, setD] = useEx(() => ({ name: (item && item.name) || '', amount: (item && item.amount) || '', type: (item && item.type) || 'monthly', date: (item && item.date) || today }));
  const set = (patch) => setD(p => ({ ...p, ...patch }));
  const [delStep, setDelStep] = useEx(0);
  const valid = d.name.trim() && Number(d.amount) > 0;
  const inp = { width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 15, color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.12)', borderRadius: 12, padding: '12px 13px', outline: 'none', direction: he ? 'rtl' : 'ltr', textAlign: 'start' };
  const lbl = { fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 7, marginInlineStart: 2 };
  const types = [
    { id: 'monthly', icon: 'refresh', he: 'חודשי קבוע', en: 'Monthly', subHe: 'חוזר כל חודש', subEn: 'Recurs monthly' },
    { id: 'once', icon: 'coin', he: 'חד-פעמי', en: 'One-time', subHe: 'בחודש שלו בלבד', subEn: 'Its month only' },
  ];
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 97, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '92%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        <div style={{ padding: '10px 18px 6px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(200,162,74,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="coin" size={21} color={accent} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 19, color: '#0B1E3D' }}>{isNew ? (he ? 'הוצאה חדשה' : 'New expense') : (he ? 'עריכת הוצאה' : 'Edit expense')}</div>
              <div style={{ fontSize: 12, color: 'rgba(11,30,61,0.5)' }}>{he ? 'נראה לרפי בלבד' : 'Rafi only'}</div>
            </div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="x" size={17} color="#0B1E3D" /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px 18px', display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div><div style={lbl}>{he ? 'שם הסעיף' : 'Item name'}</div><input value={d.name} onChange={e => set({ name: e.target.value })} placeholder={he ? 'שכירות, חשמל, ביטוח…' : 'Rent, electricity…'} style={inp} /></div>
          <div><div style={lbl}>{he ? 'סכום' : 'Amount'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...inp, padding: '0 13px' }}>
              <span style={{ fontWeight: 700, color: 'rgba(11,30,61,0.5)' }}>₪</span>
              <input type="number" inputMode="numeric" value={d.amount} onChange={e => set({ amount: e.target.value })} placeholder="0" style={{ flex: 1, border: 'none', outline: 'none', font: 'inherit', fontSize: 15, fontWeight: 700, color: '#0B1E3D', background: 'transparent', direction: 'ltr', textAlign: 'start' }} />
            </div>
          </div>
          <div>
            <div style={lbl}>{he ? 'סוג ההוצאה' : 'Expense type'}</div>
            <div style={{ display: 'flex', gap: 9 }}>
              {types.map(tp => { const on = d.type === tp.id; return (
                <button key={tp.id} onClick={() => set({ type: tp.id })} style={{ flex: 1, textAlign: 'start', font: 'inherit', cursor: 'pointer', background: '#fff', border: `1.5px solid ${on ? accent : 'rgba(11,30,61,0.1)'}`, borderRadius: 13, padding: '11px 12px' }}>
                  <Icon name={tp.icon} size={18} color={on ? accent : 'rgba(11,30,61,0.4)'} />
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0B1E3D', marginTop: 6 }}>{he ? tp.he : tp.en}</div>
                  <div style={{ fontSize: 11, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{he ? tp.subHe : tp.subEn}</div>
                </button>
              ); })}
            </div>
          </div>
          <div><div style={lbl}>{d.type === 'monthly' ? (he ? 'חודש התחלה' : 'Start month') : (he ? 'תאריך' : 'Date')}</div><input type="date" value={d.date} onChange={e => set({ date: e.target.value })} style={{ ...inp, direction: 'ltr', colorScheme: 'light', fontWeight: 600 }} /></div>
          {d.type === 'monthly' && <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(200,162,74,0.1)', border: `1px solid ${accent}33`, borderRadius: 12, padding: '10px 12px' }}><Icon name="refresh" size={15} color="#9C7B2E" style={{ flexShrink: 0, marginTop: 1 }} /><span style={{ fontSize: 12, color: 'rgba(11,30,61,0.7)', lineHeight: 1.45 }}>{he ? 'הוצאה קבועה נספרת אוטומטית בכל חודש בחישוב «הכנסה לאחר הוצאות».' : 'A fixed cost is counted automatically every month in “income after expenses”.'}</span></div>}

          {!isNew && (delStep === 0
            ? <button onClick={() => setDelStep(1)} style={{ display: 'block', width: '100%', marginTop: 2, padding: '8px', borderRadius: 10, border: 'none', background: 'none', color: 'rgba(11,30,61,0.4)', font: 'inherit', fontSize: 12.5, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>{he ? 'מחיקת הסעיף' : 'Delete item'}</button>
            : <div style={{ background: 'rgba(176,58,58,0.05)', border: '1px solid rgba(176,58,58,0.25)', borderRadius: 14, padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#B03A3A', marginBottom: 10 }}>{he ? 'למחוק את הסעיף לצמיתות?' : 'Delete this item permanently?'}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setDelStep(0)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid rgba(11,30,61,0.12)', background: '#fff', color: '#0B1E3D', font: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>{he ? 'ביטול' : 'Cancel'}</button>
                  <button onClick={onDelete} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', borderRadius: 12, border: 'none', background: '#B03A3A', color: '#fff', font: 'inherit', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}><Icon name="trash" size={15} color="#fff" />{he ? 'מחק' : 'Delete'}</button>
                </div>
              </div>)}
        </div>
        <div style={{ padding: '12px 18px calc(18px + env(safe-area-inset-bottom))', flexShrink: 0, borderTop: '1px solid rgba(11,30,61,0.06)', background: '#FBF9F5' }}>
          <Btn kind="gold" icon="check" disabled={!valid} onClick={() => onSave({ ...item, name: d.name.trim(), amount: Math.round(Number(d.amount)) || 0, type: d.type, date: d.date })}>{isNew ? (he ? 'הוספת הוצאה' : 'Add expense') : (he ? 'שמירת שינויים' : 'Save changes')}</Btn>
        </div>
      </div>
    </div>
  );
}

// ── management screen ────────────────────────────────────────────────────
function ExpensesScreen({ lang, t, accent, serif, onBack, toast }) {
  const he = lang === 'he';
  const [items, setItems] = useEx(() => expenseStore.list());
  const [edit, setEdit] = useEx(null); // { } for new, item for edit
  const refresh = () => setItems(expenseStore.list().slice());
  const fmtDate = (ds) => { try { return new Date(ds + 'T00:00').toLocaleDateString(he ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ds; } };
  const fmtMonth = (ds) => { try { return new Date(ds + 'T00:00').toLocaleDateString(he ? 'he-IL' : 'en-US', { month: 'short', year: 'numeric' }); } catch (e) { return ds; } };

  const monthly = items.filter(x => x.type === 'monthly');
  const once = items.filter(x => x.type === 'once');
  const monthlyTotal = monthly.reduce((n, x) => n + (x.amount || 0), 0);

  const row = (x) => (
    <button key={x.id} onClick={() => setEdit(x)} className="tapsq" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'start', font: 'inherit', cursor: 'pointer', background: '#fff', border: '1px solid rgba(11,30,61,0.06)', borderRadius: 14, padding: '13px 14px', boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
      <span style={{ width: 38, height: 38, borderRadius: 11, background: x.type === 'monthly' ? 'rgba(200,162,74,0.14)' : 'rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={x.type === 'monthly' ? 'refresh' : 'coin'} size={18} color={x.type === 'monthly' ? accent : 'rgba(11,30,61,0.55)'} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14.5, color: '#0B1E3D' }} dir="auto">{x.name}</div>
        <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{x.type === 'monthly' ? (he ? `מ-${fmtMonth(x.date)}` : `since ${fmtMonth(x.date)}`) : fmtDate(x.date)}</div>
      </div>
      <span style={{ fontFamily: serif, fontWeight: 800, fontSize: 17, color: '#0B1E3D', direction: 'ltr', flexShrink: 0 }}>₪{(x.amount || 0).toLocaleString()}{x.type === 'monthly' && <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(11,30,61,0.4)' }}> /{he ? 'ח׳' : 'mo'}</span>}</span>
      <Icon name={he ? 'chevron' : 'chevronR'} size={16} color="rgba(11,30,61,0.3)" />
    </button>
  );

  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל · רפי בלבד' : 'Admin · Rafi only'} title={he ? 'הוצאות' : 'Expenses'} onBack={onBack} />
      <Body>
        {/* fixed-cost summary */}
        <div style={{ background: 'linear-gradient(140deg,#14305A,#0B1E3D)', borderRadius: 18, padding: 17, boxShadow: '0 10px 24px rgba(11,30,61,0.18)' }}>
          <div style={{ fontSize: 12, color: 'rgba(251,249,245,0.6)', fontWeight: 600 }}>{he ? 'הוצאות קבועות לחודש' : 'Fixed costs per month'}</div>
          <div style={{ fontFamily: serif, fontWeight: 800, fontSize: 32, color: '#E4C97B', marginTop: 4, direction: 'ltr', textAlign: 'start' }}>{'₪' + monthlyTotal.toLocaleString()}</div>
          <div style={{ fontSize: 11.5, color: 'rgba(251,249,245,0.55)', marginTop: 4 }}>{he ? `${monthly.length} סעיפים קבועים · ${once.length} חד-פעמיים` : `${monthly.length} fixed · ${once.length} one-time`}</div>
        </div>

        <Btn kind="gold" icon="plus" onClick={() => setEdit({})}>{he ? 'הוספת הוצאה' : 'Add expense'}</Btn>

        {/* monthly fixed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4, marginInlineStart: 2 }}>
          <Icon name="refresh" size={15} color={accent} />
          <span style={{ fontSize: 13, fontWeight: 800, color: 'rgba(11,30,61,0.6)' }}>{he ? 'הוצאות חודשיות קבועות' : 'Fixed monthly costs'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {monthly.length === 0 && <div style={{ textAlign: 'center', padding: '18px', color: 'rgba(11,30,61,0.4)', fontSize: 13, background: '#fff', borderRadius: 14 }}>{he ? 'אין הוצאות קבועות' : 'No fixed costs'}</div>}
          {monthly.map(row)}
        </div>

        {/* one-time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6, marginInlineStart: 2 }}>
          <Icon name="coin" size={15} color="rgba(11,30,61,0.55)" />
          <span style={{ fontSize: 13, fontWeight: 800, color: 'rgba(11,30,61,0.6)' }}>{he ? 'הוצאות חד-פעמיות' : 'One-time costs'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {once.length === 0 && <div style={{ textAlign: 'center', padding: '18px', color: 'rgba(11,30,61,0.4)', fontSize: 13, background: '#fff', borderRadius: 14 }}>{he ? 'אין הוצאות חד-פעמיות' : 'No one-time costs'}</div>}
          {once.map(row)}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 6, padding: '0 2px', fontSize: 11.5, color: 'rgba(11,30,61,0.5)', lineHeight: 1.45 }}>
          <Icon name="chart" size={14} color="rgba(11,30,61,0.4)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{he ? 'ההוצאות נכנסות לשכבת «הכנסה לאחר הוצאות» בניתוח המעמיק. נראה לרפי בלבד.' : 'These feed the “income after expenses” layer in Deep insights. Rafi only.'}</span>
        </div>
      </Body>
      {edit && <ExpenseEditSheet lang={lang} accent={accent} serif={serif} item={edit}
        onClose={() => setEdit(null)}
        onSave={(it) => { if (it.id) expenseStore.update(it.id, it); else expenseStore.add(it); refresh(); setEdit(null); toast && toast(he ? (it.id ? 'הסעיף עודכן ✓' : 'הוצאה נוספה ✓') : 'נשמר ✓', he ? `${it.name} · ₪${(it.amount || 0).toLocaleString()}` : it.name); }}
        onDelete={() => { expenseStore.remove(edit.id); refresh(); setEdit(null); toast && toast(he ? 'הסעיף נמחק' : 'Deleted', edit.name); }} />}
    </Shell>
  );
}

Object.assign(window, { expenseStore, periodExpenses, ExpensesScreen });
