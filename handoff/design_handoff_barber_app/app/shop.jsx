// shop.jsx, clean customer shop (grid → detail → cart → checkout), contact sheet, admin product manager
// Exports: ShopScreen, ContactSheet, ShopManager, pickUpsell
const { useState: useStateS, useRef: useRefS } = React;

const visibleProducts = (products) => (products || []).filter(p => p.inStock !== false);

// pick a service-matched upsell product (returns one in-stock product or null)
function pickUpsell(products, service) {
  const inStock = visibleProducts(products);
  if (!inStock.length) return null;
  const svcId = service && service.id;
  // map service → preferred product tag
  const wantTag = svcId === 's2' || svcId === 's3' || svcId === 's6' ? 'beard' : svcId === 's4' || svcId === 's5' ? 'hair' : 'wax';
  return inStock.find(p => p.tag === wantTag) || inStock[0];
}

// ── product detail sheet ──
function ProductSheet({ lang, t, accent, serif, p, qtyInCart, onClose, onAdd }) {
  const nm = o => o[lang];
  const desc = lang === 'he' ? p.descHe : p.descEn;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)', overflow: 'hidden' }}>
        <div style={{ position: 'relative', height: 200 }}>
          <ImgSlot id={'prod-' + p.id} radius={0} readonly placeholder={t.noImage} style={{ width: '100%', height: 200 }} />
          <button onClick={onClose} style={{ position: 'absolute', top: 14, insetInlineEnd: 14, width: 34, height: 34, borderRadius: 10, border: 'none', background: 'rgba(251,249,245,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="x" size={17} color="#0B1E3D" /></button>
        </div>
        <div style={{ padding: '18px 20px calc(20px + env(safe-area-inset-bottom))' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: '#0B1E3D', flex: 1 }}>{nm(p)}</div>
            <Money v={p.price} size={22} />
          </div>
          {desc && <div style={{ fontSize: 14.5, color: 'rgba(11,30,61,0.6)', marginTop: 10, lineHeight: 1.55 }}>{desc}</div>}
          <div style={{ marginTop: 20 }}>
            <Btn kind="gold" icon="bag" onClick={(e) => onAdd(p, e.currentTarget)}>{qtyInCart > 0 ? `${t.inCart} (${qtyInCart}) · ${t.addToCart}` : t.addToCart}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── cart + checkout sheet ──
function CartSheet({ lang, t, accent, serif, cart, products, onClose, onQty, onCheckout }) {
  const nm = o => o[lang];
  const [paid, setPaid] = useStateS(false);
  const items = Object.entries(cart).map(([id, qty]) => ({ p: products.find(x => x.id === id), qty })).filter(x => x.p && x.qty > 0);
  const total = items.reduce((s, x) => s + x.p.price * x.qty, 0);
  if (paid) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 82, background: 'linear-gradient(180deg,#0B1E3D,#0E2A52)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', textAlign: 'center' }}>
        <div className="succ-pop" style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg,#E4C97B,#C8A24A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 18px 50px rgba(200,162,74,0.5)', marginBottom: 24 }}><Icon name="check" size={46} color="#0B1E3D" stroke={2.6} /></div>
        <div className="succ-rise" style={{ fontFamily: displayFont(lang, serif), fontWeight: 700, fontSize: lang === 'he' ? 29 : 27, color: '#FBF9F5' }}>{t.orderDone}</div>
        <div className="succ-rise succ-d1" style={{ fontSize: 14.5, color: 'rgba(251,249,245,0.7)', marginTop: 8, lineHeight: 1.5 }}>{t.orderDoneSub}</div>
        <div className="succ-rise succ-d2" style={{ width: '100%', maxWidth: 300, marginTop: 26 }}><Btn kind="gold" onClick={onClose}>{t.backToShop}</Btn></div>
      </div>
    );
  }
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '88%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        <div style={{ padding: '10px 20px 6px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 12px' }} />
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 21, color: '#0B1E3D' }}>{t.cart}</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px' }}>
          {items.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(11,30,61,0.4)' }}><Icon name="bag" size={38} color="rgba(11,30,61,0.2)" /><div style={{ marginTop: 10, fontSize: 14.5 }}>{t.cartEmpty}</div></div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(({ p, qty }) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 16, padding: 10, boxShadow: '0 2px 8px rgba(11,30,61,0.04)' }}>
                <span style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}><ImgSlot id={'prod-' + p.id} radius={12} readonly placeholder="" style={{ width: 52, height: 52 }} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5, color: '#0B1E3D' }}>{nm(p)}</div>
                  <Money v={p.price} size={13.5} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(11,30,61,0.04)', borderRadius: 11, padding: '5px 9px' }}>
                  <button onClick={() => onQty(p.id, qty - 1)} style={{ width: 26, height: 26, borderRadius: 8, border: 'none', background: '#fff', cursor: 'pointer', fontSize: 17, fontWeight: 700, color: '#0B1E3D', lineHeight: 1 }}>−</button>
                  <span style={{ minWidth: 16, textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#0B1E3D' }}>{qty}</span>
                  <button onClick={() => onQty(p.id, qty + 1)} style={{ width: 26, height: 26, borderRadius: 8, border: 'none', background: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#0B1E3D', lineHeight: 1 }}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {items.length > 0 && (
          <div style={{ flexShrink: 0, padding: '12px 20px calc(18px + env(safe-area-inset-bottom))', borderTop: '1px solid rgba(11,30,61,0.06)', background: '#FBF9F5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 15, color: 'rgba(11,30,61,0.6)', fontWeight: 600 }}>{t.cartTotal}</span>
              <Money v={total} size={24} />
            </div>
            <Btn kind="gold" icon="bag" onClick={() => setPaid(true)}>{t.pay} · ₪{total}</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ── product grid card ──
function ProductCard({ p, lang, t, accent, serif, onOpen, onAdd }) {
  const nm = o => o[lang];
  return (
    <button onClick={() => onOpen(p)} style={{ textAlign: 'start', font: 'inherit', cursor: 'pointer', background: '#fff', border: '1px solid rgba(11,30,61,0.06)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 8px rgba(11,30,61,0.04)', display: 'flex', flexDirection: 'column', padding: 0 }}>
      <ImgSlot id={'prod-' + p.id} radius={0} readonly placeholder={t.noImage} style={{ height: 118 }} />
      <div style={{ padding: '11px 13px 13px', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#0B1E3D', lineHeight: 1.25, flex: 1 }}>{nm(p)}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Money v={p.price} size={15} />
          <span onClick={e => { e.stopPropagation(); onAdd(p, e.currentTarget); }} style={{ width: 34, height: 34, borderRadius: 11, background: 'linear-gradient(135deg,#14305A,#0B1E3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="plus" size={18} color="#E4C97B" /></span>
        </div>
      </div>
    </button>
  );
}

function ShopScreen({ lang, t, accent, serif, products }) {
  const inStock = visibleProducts(products);
  const [detail, setDetail] = useStateS(null);
  const [cartOpen, setCartOpen] = useStateS(false);
  const [cart, setCart] = useStateS({});
  const cartBtnRef = useRefS(null);
  const badgeRef = useRefS(null);
  const count = Object.values(cart).reduce((s, q) => s + q, 0);
  const bounceBadge = () => requestAnimationFrame(() => { const b = badgeRef.current; if (!b) return; b.classList.remove('cart-bounce'); void b.offsetWidth; b.classList.add('cart-bounce'); });
  const flyToCart = (srcEl) => {
    if (!srcEl || !cartBtnRef.current) { bounceBadge(); return; }
    const sR = srcEl.getBoundingClientRect(), cR = cartBtnRef.current.getBoundingClientRect(), size = 30;
    const sx = sR.left + sR.width / 2 - size / 2, sy = sR.top + sR.height / 2 - size / 2;
    const ex = cR.left + cR.width / 2 - size / 2, ey = cR.top + cR.height / 2 - size / 2;
    const fly = document.createElement('div');
    fly.style.cssText = `position:fixed;left:${sx}px;top:${sy}px;width:${size}px;height:${size}px;border-radius:50%;z-index:9999;pointer-events:none;background:linear-gradient(135deg,#E4C97B,#C8A24A);box-shadow:0 6px 16px rgba(200,162,74,0.55);display:flex;align-items:center;justify-content:center;`;
    fly.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B1E3D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 8h11l-1 12.5h-9L6.5 8z"/><path d="M9 8a3 3 0 016 0"/></svg>';
    document.body.appendChild(fly);
    const dx = ex - sx, dy = ey - sy;
    const anim = fly.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 46}px) scale(1.05)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.25)`, opacity: 0.3 },
    ], { duration: 620, easing: 'cubic-bezier(.45,0,.55,1)' });
    anim.onfinish = () => { fly.remove(); bounceBadge(); };
  };
  const addToCart = (p, srcEl) => {
    setCart(c => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }));
    try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) {}
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && srcEl) flyToCart(srcEl); else bounceBadge();
  };
  const setQty = (id, q) => setCart(c => { const n = { ...c }; if (q <= 0) delete n[id]; else n[id] = q; return n; });

  // empty shop → friendly empty state (no demo products standing alone)
  if (inStock.length === 0) {
    return (
      <div style={{ padding: '52px 18px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70%', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(200,162,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><Icon name="bag" size={34} color={accent} /></div>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: '#0B1E3D' }}>{t.shopEmpty}</div>
        <div style={{ fontSize: 14, color: 'rgba(11,30,61,0.5)', marginTop: 8 }}>{t.shopEmptySub}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '52px 18px 120px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ fontFamily: displayFont(lang, serif), fontSize: lang === 'he' ? 30 : 27, fontWeight: 700, color: '#0B1E3D' }}>{t.shopTitle}</div>
          <div style={{ fontSize: 13.5, color: 'rgba(11,30,61,0.5)', marginTop: 2 }}>{t.shopSub}</div>
        </div>
        <button ref={cartBtnRef} onClick={() => setCartOpen(true)} style={{ position: 'relative', width: 44, height: 44, borderRadius: 13, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Icon name="bag" size={21} color="#0B1E3D" />
          {count > 0 && <span ref={badgeRef} style={{ position: 'absolute', top: -5, insetInlineEnd: -5, minWidth: 19, height: 19, padding: '0 5px', borderRadius: 10, background: accent, color: '#0B1E3D', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #FBF9F5' }}>{count}</span>}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginTop: 6 }}>
        {inStock.map(p => <ProductCard key={p.id} p={p} lang={lang} t={t} accent={accent} serif={serif} onOpen={setDetail} onAdd={addToCart} />)}
      </div>
      {detail && <ProductSheet lang={lang} t={t} accent={accent} serif={serif} p={detail} qtyInCart={cart[detail.id] || 0} onClose={() => setDetail(null)} onAdd={(p, src) => { addToCart(p, src); setDetail(null); }} />}
      {cartOpen && <CartSheet lang={lang} t={t} accent={accent} serif={serif} cart={cart} products={products} onClose={() => setCartOpen(false)} onQty={setQty} />}
    </div>
  );
}

// ── Contact action sheet (WhatsApp + phone) ──
function ContactSheet({ lang, t, accent, onClose }) {
  const c = DATA.contact;
  const act = (kind) => {
    if (kind === 'whats') window.open('https://wa.me/' + c.phone.replace(/[^0-9]/g, ''), '_blank');
    else window.location.href = 'tel:' + c.phone;
  };
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 75, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#FBF9F5', borderRadius: '26px 26px 0 0', padding: '10px 18px calc(28px + env(safe-area-inset-bottom))', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 16px' }} />
        <div style={{ fontFamily: "'Frank Ruhl Libre', 'Fraunces', serif", fontWeight: 700, fontSize: 21, color: '#0B1E3D', textAlign: 'center' }}>{t.contactTitle}</div>
        <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.5)', textAlign: 'center', marginTop: 4, marginBottom: 18 }}>{t.contactSub} · {c.phoneDisp}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <button onClick={() => act('whats')} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '15px 18px', borderRadius: 16, border: 'none', cursor: 'pointer', font: 'inherit', background: 'linear-gradient(135deg,#1ebe5d,#12a350)', color: '#fff', boxShadow: '0 8px 22px rgba(30,190,93,0.32)' }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="whatsapp" size={22} color="#fff" /></span>
            <span style={{ flex: 1, textAlign: 'start', fontSize: 16, fontWeight: 700 }}>{t.contactWhats}</span>
            <Icon name={lang === 'he' ? 'chevron' : 'chevronR'} size={18} color="rgba(255,255,255,0.7)" />
          </button>
          <button onClick={() => act('call')} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '15px 18px', borderRadius: 16, border: '1px solid rgba(11,30,61,0.1)', cursor: 'pointer', font: 'inherit', background: '#fff', color: '#0B1E3D' }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(11,30,61,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="phone" size={20} color={accent} /></span>
            <span style={{ flex: 1, textAlign: 'start', fontSize: 16, fontWeight: 700 }}>{t.contactCall}</span>
            <Icon name={lang === 'he' ? 'chevron' : 'chevronR'} size={18} color="rgba(11,30,61,0.3)" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Admin product manager (stock toggle, description, drag reorder, edit/remove) ──
function ShopManager({ lang, t, accent, serif, products, setProduct, addProduct, delProduct, reorderProducts }) {
  const nm = o => o[lang];
  const [editing, setEditing] = useStateS(null); // product being edited in sheet
  const dragId = useStateS(null);
  const [drag, setDrag] = dragId;

  const onDrop = (overId) => {
    if (!drag || drag === overId) return;
    const ids = products.map(p => p.id);
    const from = ids.indexOf(drag), to = ids.indexOf(overId);
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    reorderProducts(ids);
    setDrag(null);
  };

  return (
    <div>
      <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 17, color: '#0B1E3D', marginBottom: 3 }}>{t.prodMgr}</div>
      <div style={{ fontSize: 12.5, color: 'rgba(11,30,61,0.5)', marginBottom: 12 }}>{t.prodMgrSub}</div>
      {products.length === 0 && <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(11,30,61,0.4)', fontSize: 14, background: '#fff', borderRadius: 16, marginBottom: 12 }}>{t.prodEmpty}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {products.map(p => {
          const out = p.inStock === false;
          return (
            <div key={p.id} draggable onDragStart={() => setDrag(p.id)} onDragOver={e => e.preventDefault()} onDrop={() => onDrop(p.id)}
              style={{ background: '#fff', borderRadius: 18, padding: 12, boxShadow: '0 3px 12px rgba(11,30,61,0.05)', display: 'flex', alignItems: 'center', gap: 11, opacity: out ? 0.62 : 1, border: drag === p.id ? `1.5px dashed ${accent}` : '1.5px solid transparent' }}>
              <span style={{ cursor: 'grab', color: 'rgba(11,30,61,0.3)', fontSize: 18, fontWeight: 700, lineHeight: 1, padding: '0 2px' }} title={t.prodReorder}>⠿</span>
              <span style={{ width: 50, height: 50, borderRadius: 12, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                <ImgSlot id={'prod-' + p.id} radius={12} placeholder="+" style={{ width: 50, height: 50 }} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5, color: '#0B1E3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nm(p) || t.prodName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                  <Money v={p.price} size={13} />
                  {out && <span style={{ fontSize: 10.5, fontWeight: 700, color: '#B03A3A', background: 'rgba(176,58,58,0.1)', padding: '2px 7px', borderRadius: 10 }}>{t.prodOut}</span>}
                </div>
              </div>
              {/* stock toggle */}
              <button onClick={() => setProduct(p.id, { inStock: out })} title={out ? t.prodOut : t.prodInStock} style={{ width: 46, height: 28, borderRadius: 15, border: 'none', cursor: 'pointer', padding: 3, background: out ? 'rgba(11,30,61,0.18)' : '#2E7D52', display: 'flex', justifyContent: out ? 'flex-start' : 'flex-end', flexShrink: 0 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} />
              </button>
              <button onClick={() => setEditing(p)} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="pencil" size={16} color="#0B1E3D" /></button>
            </div>
          );
        })}
      </div>
      <button onClick={addProduct} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 12, padding: '13px', borderRadius: 14, border: `1.5px dashed ${accent}`, background: `${accent}12`, color: '#0B1E3D', font: 'inherit', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' }}>
        <Icon name="plus" size={18} color={accent} />{t.prodAdd}
      </button>
      {editing && <ProductEditSheet lang={lang} t={t} accent={accent} serif={serif} p={editing} onClose={() => setEditing(null)}
        onSave={(patch) => { setProduct(editing.id, patch); setEditing(null); }}
        onDelete={() => { delProduct(editing.id); setEditing(null); }} />}
    </div>
  );
}

function ProductEditSheet({ lang, t, accent, serif, p, onClose, onSave, onDelete }) {
  const he = lang === 'he';
  const [d, setD] = useStateS({ he: p.he || '', en: p.en || '', price: p.price || 0, descHe: p.descHe || '', descEn: p.descEn || '', inStock: p.inStock !== false });
  const [pickImg, setPickImg] = useStateS(false); // Round 11: phone / app-gallery picker (Rafi only)
  const set = patch => setD(s => ({ ...s, ...patch }));
  const inp = { width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 15, color: '#0B1E3D', background: '#fff', border: '1px solid rgba(11,30,61,0.12)', borderRadius: 12, padding: '11px 13px', outline: 'none', direction: he ? 'rtl' : 'ltr', textAlign: 'start' };
  const lbl = { fontSize: 12.5, fontWeight: 700, color: 'rgba(11,30,61,0.55)', marginBottom: 7, marginInlineStart: 2 };
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 96, background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '90%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)' }}>
        <div style={{ padding: '10px 20px 4px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 12px' }} />
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: '#0B1E3D' }}>{t.prodName}</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ width: 110, borderRadius: 16, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ width: 110, height: 110, borderRadius: 16, overflow: 'hidden' }}><ImgSlot id={'prod-' + p.id} radius={16} readonly placeholder={he ? 'תמונה' : 'photo'} style={{ width: 110, height: 110 }} /></div>
            <button onClick={() => setPickImg(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 9, padding: '7px 13px', borderRadius: 11, border: `1.5px solid ${accent}`, background: `${accent}12`, color: '#0B1E3D', font: 'inherit', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}><Icon name="image" size={15} color={accent} />{t.photoReplace}</button>
          </div>
          <div><div style={lbl}>{t.prodName} (עב)</div><input value={d.he} onChange={e => set({ he: e.target.value })} style={inp} /></div>
          <div><div style={lbl}>{t.prodName} (EN)</div><input value={d.en} onChange={e => set({ en: e.target.value })} style={{ ...inp, direction: 'ltr' }} /></div>
          <div><div style={lbl}>{t.prodDesc}</div><textarea value={he ? d.descHe : d.descEn} onChange={e => set(he ? { descHe: e.target.value } : { descEn: e.target.value })} rows={2} style={{ ...inp, resize: 'none', lineHeight: 1.5 }} /></div>
          <div><div style={lbl}>{t.prodPrice}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...inp, padding: '0 13px' }}>
              <span style={{ fontWeight: 700, color: 'rgba(11,30,61,0.5)' }}>₪</span>
              <input type="number" value={d.price} onChange={e => set({ price: +e.target.value || 0 })} style={{ flex: 1, border: 'none', outline: 'none', font: 'inherit', fontSize: 15, fontWeight: 700, padding: '11px 0', background: 'transparent', direction: 'ltr', color: '#0B1E3D' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid rgba(11,30,61,0.1)', borderRadius: 12, padding: '12px 14px' }}>
            <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: '#0B1E3D' }}>{t.prodInStock}</span>
            <button onClick={() => set({ inStock: !d.inStock })} style={{ width: 50, height: 30, borderRadius: 16, border: 'none', cursor: 'pointer', padding: 3, background: d.inStock ? '#2E7D52' : 'rgba(11,30,61,0.18)', display: 'flex', justifyContent: d.inStock ? 'flex-end' : 'flex-start' }}><span style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} /></button>
          </div>
          <button onClick={onDelete} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px', borderRadius: 13, border: '1px solid rgba(176,58,58,0.25)', background: 'rgba(176,58,58,0.05)', color: '#B03A3A', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}><Icon name="trash" size={16} color="#B03A3A" />{t.remove}</button>
        </div>
        <div style={{ flexShrink: 0, padding: '12px 20px calc(18px + env(safe-area-inset-bottom))', borderTop: '1px solid rgba(11,30,61,0.06)' }}>
          <Btn kind="gold" icon="check" onClick={() => onSave(d)}>{t.saveChanges}</Btn>
        </div>
      </div>
      {pickImg && window.ImagePickSheet && <ImagePickSheet lang={lang} accent={accent} serif={serif} slotId={'prod-' + p.id} title={he ? `תמונה, ${d.he || p.he}` : `Image, ${d.en || p.en}`} onClose={() => setPickImg(false)} />}
    </div>
  );
}

Object.assign(window, { ShopScreen, ContactSheet, ShopManager, pickUpsell });
