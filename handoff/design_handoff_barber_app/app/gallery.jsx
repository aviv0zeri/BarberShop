// gallery.jsx, Round 11: Rafi's app gallery (image source of truth) + ImagePickSheet.
// galleryStore: built-in seed artwork + Rafi's uploads (localStorage, downscaled dataURLs).
// ImagePickSheet: the ONE flow for replacing any image (barber / product / service):
//   • upload from the phone gallery, or • pick from the app gallery Rafi curated.
// Picks write into the target <image-slot> via window.imageSlots (admin-only surfaces).
const { useState: useGal } = React;

const galleryStore = {
  _load() { try { return JSON.parse(localStorage.getItem('royale_gallery_v1')) || []; } catch (e) { return []; } },
  _save(v) { try { localStorage.setItem('royale_gallery_v1', JSON.stringify(v)); } catch (e) {} },
  seeds() {
    const svcName = (id) => { const s = (window.DATA && DATA.services.find(x => x.id === id)); return s ? s.he : id; };
    return ['s1', 's2', 's3', 's4', 's5', 's6', 's7'].map(id => ({ id: 'seed-' + id, name: svcName(id), u: 'assets/services/' + id + '.png', seed: true }));
  },
  uploads() { return this._load(); },
  list() { return this.uploads(); },
  add(name, u) { const v = this._load(); v.unshift({ id: 'g' + Date.now(), name: name || '', u }); this._save(v); },
  remove(id) { this._save(this._load().filter(x => x.id !== id)); },
};
window.galleryStore = galleryStore;

// file → downscaled dataURL (longest side ≤900px)
function galToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const rd = new FileReader();
    rd.onload = () => {
      const im = new Image();
      im.onload = () => {
        const sc = Math.min(1, 900 / Math.max(im.width, im.height));
        const cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.round(im.width * sc)); cv.height = Math.max(1, Math.round(im.height * sc));
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        resolve(cv.toDataURL('image/webp', 0.85));
      };
      im.onerror = reject; im.src = rd.result;
    };
    rd.onerror = reject; rd.readAsDataURL(file);
  });
}
// any URL (seed asset path) → dataURL, so image-slot persists it
function galUrlToDataUrl(u) {
  if (/^data:/.test(u)) return Promise.resolve(u);
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => { const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; cv.getContext('2d').drawImage(im, 0, 0); resolve(cv.toDataURL('image/webp', 0.85)); };
    im.onerror = reject; im.src = u;
  });
}
window.galHelpers = { galToDataUrl, galUrlToDataUrl };

// ── ImagePickSheet: two ways in, phone upload / app gallery ──
function ImagePickSheet({ lang, accent, serif, slotId, title, onClose, onPicked }) {
  const he = lang === 'he';
  const [mode, setMode] = useGal('options'); // options | gallery
  const [busy, setBusy] = useGal(false);
  const fileRef = React.useRef(null);
  const apply = (dataUrl) => { if (window.imageSlots) window.imageSlots.set(slotId, dataUrl); onPicked && onPicked(dataUrl); onClose(); };
  const onFile = async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    setBusy(true); try { apply(await galToDataUrl(f)); } catch (err) { setBusy(false); }
  };
  const pickGal = async (item) => { setBusy(true); try { apply(await galUrlToDataUrl((window._asset || (p => p))(item.u))); } catch (err) { setBusy(false); } };
  const opt = (icon, label, sub, onClick) => (
    <button onClick={onClick} disabled={busy} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '14px 16px', borderRadius: 16, border: '1px solid rgba(11,30,61,0.1)', cursor: 'pointer', font: 'inherit', background: '#fff', textAlign: 'start', opacity: busy ? 0.5 : 1 }}>
      <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(200,162,74,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={icon} size={20} color={accent} /></span>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#0B1E3D' }}>{label}</span>
        <span style={{ display: 'block', fontSize: 11.5, color: 'rgba(11,30,61,0.5)', marginTop: 1 }}>{sub}</span>
      </span>
      <Icon name={he ? 'chevron' : 'chevronR'} size={17} color="rgba(11,30,61,0.3)" />
    </button>
  );
  const items = galleryStore.list();
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 99, background: 'rgba(7,16,31,0.6)', display: 'flex', alignItems: 'flex-end' }}>
      <div className="sheet-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '86%', display: 'flex', flexDirection: 'column', background: '#FBF9F5', borderRadius: '26px 26px 0 0', boxShadow: '0 -10px 40px rgba(7,16,31,0.3)', padding: '10px 20px calc(22px + env(safe-area-inset-bottom))' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(11,30,61,0.15)', margin: '4px auto 14px', flexShrink: 0 }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13, flexShrink: 0 }}>
          <div style={{ flex: 1, fontFamily: serif, fontWeight: 700, fontSize: 19, color: '#0B1E3D' }}>{title || (he ? 'החלפת תמונה' : 'Replace image')}</div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(11,30,61,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="x" size={17} color="#0B1E3D" /></button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
        {mode === 'options' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {opt('image', he ? 'העלאה מגלריית הטלפון' : 'Upload from phone', he ? 'בחירת תמונה מהמכשיר' : 'Pick a photo from this device', () => fileRef.current && fileRef.current.click())}
            {opt('spark', he ? 'בחירה מגלריית האפליקציה' : 'Choose from app gallery', he ? `${items.length} תמונות שרפי הכין מראש` : `${items.length} images Rafi curated`, () => setMode('gallery'))}
            <div style={{ fontSize: 11.5, color: 'rgba(11,30,61,0.45)', textAlign: 'center', marginTop: 4 }}>{he ? 'עריכת תמונות, רפי (מנהל) בלבד' : 'Image editing, Rafi (admin) only'}</div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
              {items.map(it => (
                <button key={it.id} onClick={() => pickGal(it)} disabled={busy} style={{ position: 'relative', padding: 0, border: '1px solid rgba(11,30,61,0.1)', borderRadius: 13, overflow: 'hidden', cursor: 'pointer', background: '#fff', aspectRatio: '4/3', opacity: busy ? 0.5 : 1 }}>
                  <img src={(window._asset || (p => p))(it.u)} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
            <button onClick={() => setMode('options')} style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(11,30,61,0.5)', font: 'inherit', fontSize: 13.5, fontWeight: 600, padding: 12, marginTop: 6, cursor: 'pointer' }}>{he ? 'חזרה' : 'Back'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Admin gallery screen, Rafi uploads here; every picker draws from this pool ──
function AdminGalleryScreen({ lang, t, accent, serif, onBack, toast }) {
  const he = lang === 'he';
  const [, setVer] = useGal(0);
  const [busy, setBusy] = useGal(false);
  const fileRef = React.useRef(null);
  const onFile = async (e) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    setBusy(true);
    for (const f of files) { try { galleryStore.add(f.name.replace(/\.\w+$/, ''), await galToDataUrl(f)); } catch (err) {} }
    setBusy(false); setVer(v => v + 1);
    toast && toast(he ? 'נוסף לגלריה ✓' : 'Added ✓', he ? 'התמונה זמינה בכל מסכי העריכה' : 'Available in every edit screen');
    e.target.value = '';
  };
  const del = (id) => { galleryStore.remove(id); setVer(v => v + 1); };
  const uploads = galleryStore.uploads(), seeds = galleryStore.seeds();
  const grid = (items, deletable) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
      {items.map(it => (
        <div key={it.id} style={{ position: 'relative', borderRadius: 13, overflow: 'hidden', border: '1px solid rgba(11,30,61,0.1)', background: '#fff', aspectRatio: '4/3' }}>
          <img src={(window._asset || (p => p))(it.u)} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          {deletable && <button onClick={() => del(it.id)} style={{ position: 'absolute', top: 5, insetInlineEnd: 5, width: 26, height: 26, borderRadius: 8, border: 'none', background: 'rgba(7,16,31,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="trash" size={14} color="#fff" /></button>}
        </div>
      ))}
    </div>
  );
  return (
    <Shell>
      <ScreenHead lang={lang} t={t} accent={accent} serif={serif} eyebrow={he ? 'מנהל · רפי בלבד' : 'Admin · Rafi only'} title={he ? 'גלריה' : 'Gallery'} onBack={onBack}
        right={<span style={{ fontSize: 12.5, fontWeight: 700, color: accent, background: 'rgba(200,162,74,0.12)', padding: '5px 11px', borderRadius: 20 }}>{uploads.length + seeds.length}</span>} />
      <Body>
        <div style={{ fontSize: 13, color: 'rgba(11,30,61,0.55)', marginInlineStart: 2, lineHeight: 1.5 }}>{he ? 'מקור התמונות של האפליקציה. כל תמונה שתעלו כאן תופיע לבחירה בעריכת ספר, מוצר או שירות.' : 'The app\u2019s image source. Anything uploaded here is offered when editing a barber, product or service.'}</div>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFile} style={{ display: 'none' }} />
        <button onClick={() => fileRef.current && fileRef.current.click()} disabled={busy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', borderRadius: 14, border: `1.5px dashed ${accent}`, background: `${accent}12`, color: '#0B1E3D', font: 'inherit', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', opacity: busy ? 0.5 : 1 }}>
          <Icon name="plus" size={18} color={accent} />{busy ? (he ? 'מעלה…' : 'Uploading…') : (he ? 'העלאת תמונות לגלריה' : 'Upload images')}
        </button>
        {uploads.length > 0 && <>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 15.5, color: '#0B1E3D' }}>{he ? 'ההעלאות של רפי' : 'Rafi\u2019s uploads'}</div>
          {grid(uploads, true)}
        </>}
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 15.5, color: '#0B1E3D' }}>{he ? 'אוסף מובנה' : 'Built-in set'}</div>
        {grid(seeds, false)}
      </Body>
    </Shell>
  );
}

Object.assign(window, { galleryStore, ImagePickSheet, AdminGalleryScreen });
