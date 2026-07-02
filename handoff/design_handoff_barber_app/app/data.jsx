// data.jsx, content, i18n strings, and a small icon set for ROYALE
// Exported to window: DATA, STR, Icon

// ── Brand content ────────────────────────────────────────────
const DATA = {
  brand: { he: 'מספרפי', en: 'BARBER SHOP', taglineHe: 'מספרה לגברים וילדים · 2001', taglineEn: 'Barbershop · Est. 2001' },

  // single flagship branch
  branch: { id: 'b1', he: 'מספרפי · אוסישקין', en: 'Barbershop · Ussishkin', addrHe: 'אוסישקין 41, ירושלים', addrEn: '41 Ussishkin St, Jerusalem', openHe: 'פתוח עד 21:00', openEn: 'Open until 21:00' },

  // manager-editable taglines live in app state; these are the defaults.
  // Round 11 seed: רפי שרבטוב is ALWAYS first, owner & master barber, edit-only (never deletable).
  barbers: [
    { id: 'rafi', owner: true, phone: '0500000000', he: 'רפי שרבטוב', en: 'Rafi Sharbatov', tagHe: 'הבעלים והספר הראשי, מאז 2001', tagEn: 'Owner & master barber, since 2001', initials: 'RS', tone: 0 },
    { id: 'p1', phone: '0501111111', he: 'סאסי', en: 'Sasi', tagHe: 'פיידים חדים, יד רכה', tagEn: 'Sharp fades, easy hand', initials: 'SA', tone: 1 },
    { id: 'p2', phone: '0502222222', he: 'רפאל', en: 'Rafael', tagHe: 'דיוק של אמן, סבלנות של חבר', tagEn: 'Craftsman precision, a friend\u2019s patience', initials: 'RA', tone: 2 },
  ],

  // Round 11 seed, the fixed default price list (editable; these are the base values).
  // img = unified demo artwork (stand-ins until Rafi swaps in real photos from the gallery)
  services: [
    { id: 's1', he: 'תספורת גבר', en: "Men's Haircut", price: 80, min: 15, img: 'assets/services/s1.png', photoHe: 'תספורת גבר', photoEn: "men's haircut" },
    { id: 's2', he: 'תספורת וזקן', en: 'Haircut & Beard', price: 100, min: 15, img: 'assets/services/s2.png', photoHe: 'תספורת וזקן', photoEn: 'haircut & beard' },
    { id: 's3', he: 'תספורת + שעווה', en: 'Haircut + Wax', price: 120, min: 15, img: 'assets/services/s3.png', photoHe: 'תספורת + שעווה', photoEn: 'haircut + wax' },
    { id: 's4', he: 'תספורת ילד', en: "Kids' Haircut", price: 65, min: 15, img: 'assets/services/s4.png', photoHe: 'תספורת ילד', photoEn: "kids' haircut" },
    { id: 's5', he: 'הסרת שיער בלייזר, טיפול קטן', en: 'Laser Hair Removal - Small', price: 150, min: 30, laser: true, img: 'assets/services/s5.png', photoHe: 'לייזר · טיפול קטן', photoEn: 'laser · small' },
    { id: 's6', he: 'הסרת שיער בלייזר, טיפול גדול', en: 'Laser Hair Removal - Large', price: 250, min: 60, laser: true, img: 'assets/services/s6.png', photoHe: 'לייזר · טיפול גדול', photoEn: 'laser · large' },
    { id: 's7', he: 'הסרת שיער בלייזר', en: 'Laser Hair Removal', price: 200, min: 60, laser: true, img: 'assets/services/s7.png', photoHe: 'הסרת שיער בלייזר', photoEn: 'laser hair removal' },
  ],

  // playful tagline suggestions the manager can tap-to-apply
  tagIdeas: {
    he: ['חולה על בית"ר!', 'אספרסו כפול, בבקשה', 'הסַפָּר של השכונה', 'זקן = אמנות', 'תמיד עם סיפור טוב'],
    en: ['Beitar till I die!', 'Double espresso, please', 'The neighborhood barber', 'Beard = art', 'Always a good story'],
  },

  // per-barber working schedule defaults (manager edits live in app state)
  // Round G1: `deal` = the manager↔barber agreement. Only `percent` is active now;
  // managerPct is the slice the SHOP keeps, the rest goes to the barber. Rafi (owner)
  // has no deal - his turnover is 100% his (special-cased in barberDeal/managerShare).
  staffDefaults: [
    { id: 'rafi', active: true, autoConfirm: false, start: '08:00', end: '20:00', breaks: [{ from: '13:00', to: '13:30' }], services: ['s1', 's2', 's3', 's4', 's5', 's6', 's7'], deal: { type: 'owner', managerPct: 100 } },
    { id: 'p1', active: true, autoConfirm: false, start: '09:00', end: '19:00', breaks: [{ from: '14:00', to: '14:30' }], services: ['s1', 's2', 's3', 's4', 's5', 's6', 's7'], deal: { type: 'percent', managerPct: 50 } },
    { id: 'p2', active: true, start: '10:00', end: '20:00', breaks: [], services: ['s1', 's2', 's3', 's4', 's5', 's6', 's7'], deal: { type: 'percent', managerPct: 40 } },
  ],

  // sample appointments for barber/admin views
  schedule: [
    { id: 'a1', time: '09:00', clientHe: 'איתי ברק', clientEn: 'Itai Barak', svc: 's2', status: 'done' },
    { id: 'a2', time: '10:15', clientHe: 'נועם פלד', clientEn: 'Noam Peled', svc: 's1', status: 'now' },
    { id: 'a3', time: '11:30', clientHe: 'גיא אדרי', clientEn: 'Guy Edri', svc: 's4', status: 'next' },
    { id: 'a4', time: '13:00', clientHe: 'עומר לביא', clientEn: 'Omer Lavi', svc: 's6', status: 'upcoming' },
    { id: 'a5', time: '15:30', clientHe: 'דור שמש', clientEn: 'Dor Shemesh', svc: 's3', status: 'upcoming' },
    { id: 'a6', time: '17:00', clientHe: 'אלון רז', clientEn: 'Alon Raz', svc: 's2', status: 'upcoming' },
  ],

  // contact + navigation
  contact: { phone: '+972500000000', phoneDisp: '050-000-0000', waze: 'אוסישקין 41 ירושלים' },

  // distinct calendar colors per barber, the palette Rafi picks from in staff
  // settings (barber.color); unpicked barbers fall back to this list by index.
  calColors: ['#C8A24A', '#2A6FDB', '#1F8A5B', '#8E5BD0', '#D9774C', '#0FA3A3', '#C0497B'],

  // build a week of cross-barber appointments anchored to today
  buildAppointments() {
    const pad = n => String(n).padStart(2, '0');
    const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const base = new Date(); base.setHours(0, 0, 0, 0);
    const dayStr = i => { const d = new Date(base); d.setDate(base.getDate() + i); return fmt(d); };
    const clientsHe = ['איתי ברק', 'נועם פלד', 'גיא אדרי', 'עומר לביא', 'דור שמש', 'אלון רז', 'דין רוס', 'ליאור גל', 'טל אבן', 'רועי כץ', 'שי לוין', 'בר אדם', 'יואב נחום', 'עידן מור'];
    const clientsEn = ['Itai Barak', 'Noam Peled', 'Guy Edri', 'Omer Lavi', 'Dor Shemesh', 'Alon Raz', 'Din Ross', 'Lior Gal', 'Tal Even', 'Roi Katz', 'Shai Levin', 'Bar Adam', 'Yoav Nahum', 'Idan Mor'];
    const starts = ['09:00', '10:30', '12:00', '13:30', '16:00', '17:30'];
    const A = []; let id = 1, ci = 0;
    this.barbers.forEach((b, bi) => {
      for (let di = -1; di < 7; di++) {   // -1 = yesterday, so the barber's day-paging has history
        const n = (di + 1 + bi) % 3; // 0..2 appts
        for (let k = 0; k <= n; k++) {
          const start = starts[(k * 2 + bi + di + 1) % starts.length];
          const svc = this.services[(bi + k + di + 1) % this.services.length].id;
          const status = di < 0 ? 'done' : (di === 0 && k === 0) ? 'done' : (di === 0 && k === 1) ? 'now' : 'confirmed';
          A.push({ id: 'ap' + (id++), barberId: b.id, date: dayStr(di), start, svc,
            clientHe: clientsHe[ci % clientsHe.length], clientEn: clientsEn[ci % clientsEn.length],
            phone: '+97250' + (1000000 + ci * 137311 % 9000000).toString().slice(0, 7), status });
          ci++;
        }
      }
    });
    // seed a couple of no-shows on today's board (demo), gives the dashboard a real list to act on
    const todays = A.filter(a => a.date === dayStr(0));
    [2, 5].forEach(i => { if (todays[i]) todays[i].status = 'no'; });
    // seed a cancelled-then-rebooked slot (demo): ליאור cancelled 18:00 with Rafi, the slot
    // freed and רועי booked it. The calendar shows only the new appointment; the
    // cancellation lives on in the client card + analytics.
    A.push({ id: 'cx1', barberId: 'rafi', date: dayStr(0), start: '18:00', svc: 's2', clientHe: 'ליאור גל', clientEn: 'Lior Gal', clientId: 'c8', phone: '+972533334444', status: 'cancelled' });
    A.push({ id: 'cx2', barberId: 'rafi', date: dayStr(0), start: '18:00', svc: 's1', clientHe: 'רועי כץ', clientEn: 'Roi Katz', phone: '+972521230099', status: 'confirmed' });
    return A;
  },

  // shop products (defaults, manager edits live in app state)
  products: [
    { id: 'pr1', he: 'פומייד מאט', en: 'Matte Pomade', price: 65, photoHe: 'מיכל פומייד', photoEn: 'pomade tin', descHe: 'אחיזה חזקה, גימור מאט. לעיצוב יומיומי שנשאר במקום.', descEn: 'Strong hold, matte finish for all-day style.', inStock: true, tag: 'wax' },
    { id: 'pr2', he: 'שמן זקן פרימיום', en: 'Premium Beard Oil', price: 55, photoHe: 'בקבוק שמן זקן', photoEn: 'beard oil bottle', descHe: 'מרכך ומבריק את הזקן, ריח עץ עדין.', descEn: 'Softens and conditions the beard with a subtle woody scent.', inStock: true, tag: 'beard' },
    { id: 'pr3', he: 'שעוות עיצוב', en: 'Styling Wax', price: 60, photoHe: 'מיכל שעווה', photoEn: 'styling wax tin', descHe: 'גמישות ואחיזה לעיצוב מושלם.', descEn: 'Flexible hold for a perfect finish.', inStock: true, tag: 'wax' },
    { id: 'pr4', he: 'שמפו לגבר', en: "Men's Shampoo", price: 45, photoHe: 'בקבוק שמפו', photoEn: 'shampoo bottle', descHe: 'ניקוי עדין לשיער ולקרקפת.', descEn: 'Gentle daily cleanse for hair and scalp.', inStock: true, tag: 'hair' },
    { id: 'pr5', he: 'מסרק עץ קלאסי', en: 'Wooden Comb', price: 35, photoHe: 'מסרק עץ', photoEn: 'wooden comb', descHe: 'מסרק עץ אגוז בעבודת יד.', descEn: 'Handcrafted walnut comb.', inStock: true, tag: 'beard' },
    { id: 'pr6', he: 'ערכת טיפוח מתנה', en: 'Grooming Gift Kit', price: 180, photoHe: 'ערכת מתנה', photoEn: 'gift kit', descHe: 'שמן זקן, שעווה ומסרק באריזת מתנה.', descEn: 'Beard oil, wax and comb in a gift box.', inStock: true, tag: 'beard' },
  ],

  // Jerusalem neighborhoods for the region picker
  regions: {
    he: ['רחביה', 'קטמון', 'בקעה', 'נחלאות', 'תלפיות', 'גילה', 'פסגת זאב', 'רמות', 'העיר העתיקה', 'מרכז העיר'],
    en: ['Rehavia', 'Katamon', "Baka", 'Nachlaot', 'Talpiot', 'Gilo', 'Pisgat Zeev', 'Ramot', 'Old City', 'City Center'],
  },

  // demo accounts → role detection by phone (digits only). Anyone else = new customer.
  accounts: [
    { phone: '0500000000', role: 'admin', barberId: 'rafi', nameHe: 'רפי שרבטוב', nameEn: 'Rafi Sharbatov' },
    { phone: '0501111111', role: 'barber', barberId: 'p1', nameHe: 'סאסי', nameEn: 'Sasi' },
    { phone: '0502222222', role: 'barber', barberId: 'p2', nameHe: 'רפאל', nameEn: 'Rafael' },
    { phone: '0503333333', role: 'customer', nameHe: 'דניאל אבני', nameEn: 'Daniel Avni', regionHe: 'רחביה', regionEn: 'Rehavia', visits: 7, firstSeen: '2024-08' },
  ],

  // customer directory for the admin "customers" screen
  customers: [
    { id: 'c1', he: 'דניאל אבני', en: 'Daniel Avni', phone: '0503333333', regionHe: 'רחביה', regionEn: 'Rehavia', visits: 7, last: 'לפני שבוע', firstSeen: '2024-08', fav: 'p1', birthday: '1990-06-15' },
    { id: 'c2', he: 'איתי ברק', en: 'Itai Barak', phone: '0521234567', regionHe: 'קטמון', regionEn: 'Katamon', visits: 4, last: 'לפני 3 ימים', firstSeen: '2025-01', fav: 'p1', marketing: true, birthday: '1988-06-15' },
    { id: 'c3', he: 'נועם פלד', en: 'Noam Peled', phone: '0539876543', regionHe: 'בקעה', regionEn: 'Baka', visits: 1, last: 'אתמול', firstSeen: '2026-06', fav: 'p2' },
    { id: 'c4', he: 'גיא אדרי', en: 'Guy Edri', phone: '0547778888', regionHe: 'נחלאות', regionEn: 'Nachlaot', visits: 9, last: 'לפני יומיים', firstSeen: '2024-03', fav: 'p2', marketing: true, birthday: '1995-11-02' },
    { id: 'c5', he: 'עומר לביא', en: 'Omer Lavi', phone: '0556665555', regionHe: 'תלפיות', regionEn: 'Talpiot', visits: 2, last: 'לפני שבועיים', firstSeen: '2026-05', fav: 'p1' },
    { id: 'c6', he: 'דור שמש', en: 'Dor Shemesh', phone: '0581112222', regionHe: 'רחביה', regionEn: 'Rehavia', visits: 1, last: 'היום', firstSeen: '2026-06', fav: 'p2' },
    { id: 'c7', he: 'אלון רז', en: 'Alon Raz', phone: '0524443333', regionHe: 'מרכז העיר', regionEn: 'City Center', visits: 5, last: 'לפני 5 ימים', firstSeen: '2025-09', fav: 'rafi', marketing: true },
    { id: 'c8', he: 'ליאור גל', en: 'Lior Gal', phone: '0533334444', regionHe: 'קטמון', regionEn: 'Katamon', visits: 1, last: 'לפני שבוע', firstSeen: '2026-06', fav: 'p1' },
  ],
};


// ── i18n strings ─────────────────────────────────────────────
const STR = {
  he: {
    greeting: 'ערב טוב, דניאל', near: 'הסניף הקרוב אליך', useLocation: 'אתר את הסניף הקרוב', locating: 'מאתר מיקום…', located: 'נמצא הסניף הקרוב',
    yourBarber: 'הספר שלך', book: 'קביעת תור', bookNow: 'קבעו תור', services: 'השירותים שלנו', viewAll: 'הצג הכל', min: 'דק׳',
    home: 'בית', appts: 'התורים שלי', profile: 'פרופיל',
    chooseBarber: 'בחירת ספר', chooseService: 'בחירת שירות', chooseTime: 'מועד התור', review: 'אישור הזמנה',
    step: 'שלב', of: 'מתוך', continue: 'המשך', back: 'חזרה', confirm: 'אישור וקביעת תור',
    when: 'מתי', today: 'היום', tomorrow: 'מחר', morning: 'בוקר', noon: 'צהריים', evening: 'ערב',
    with: 'אצל', duration: 'משך', total: 'סה״כ', summary: 'סיכום',
    confirmedTitle: 'התור נקבע!', confirmedSub: 'נשלח אליך אישור. נתראה בקרוב.', addCal: 'הוסף ליומן', done: 'סיום',
    upcoming: 'תורים קרובים', past: 'היסטוריה', noAppts: 'אין תורים קרובים', cancel: 'ביטול תור', reschedule: 'שינוי מועד',
    cancelled: 'התור בוטל', undo: 'ביטול הפעולה', notifTitle: 'תזכורת לתור', notifBody: 'התספורת שלך מחר ב-10:15 אצל סאסי',
    // barber
    bDashboard: 'לוח הספר', bToday: 'התורים של היום', bNext: 'הלקוח הבא', bRevenue: 'הכנסה היום', bClients: 'לקוחות', bStart: 'התחל', bComplete: 'סיים טיפול', bStatusDone: 'הושלם', bStatusNow: 'מתבצע', bStatusNext: 'הבא בתור', bStatusUp: 'ממתין',
    // admin
    aOverview: 'סקירת מנהל', aBookings: 'הזמנות היום', aRevenue: 'הכנסות', aUtil: 'תפוסה', aStaff: 'צוות', aPopular: 'שירותים מובילים', aActivity: 'פעילות אחרונה', aActive: 'פעיל', aBreak: 'בהפסקה', aOff: 'לא במשמרת',
    role: 'תצוגה', rCustomer: 'לקוח', rBarber: 'ספר', rAdmin: 'מנהל', lang: 'שפה',
    // hub + shop + contact
    hubBook: 'קביעת תור', hubNav: 'נווט למספרה', hubVisits: 'התורים שלי', hubContact: 'צור קשר', hubShop: 'חנות',
    welcome: 'ברוכים הבאים', what: 'מה תרצו לעשות?',
    contactTitle: 'צרו קשר', contactSub: 'נשמח לעמוד לרשותכם', contactWhats: 'שלחו וואטסאפ', contactCall: 'חייגו אלינו',
    shop: 'חנות', shopTitle: 'החנות שלנו', shopSub: 'מוצרי הטיפוח שאנחנו אוהבים', addCart: 'הוספה לסל', addedCart: 'נוסף לסל ✓', fromShop: 'מהחנות שלנו',
    mShop: 'ניהול חנות', mShopSub: 'הוסיפו, ערכו ועדכנו מוצרים', addProduct: 'הוספת מוצר', nameL: 'שם המוצר', newProduct: 'מוצר חדש',
    calDay: 'יום', calWeek: 'שבוע', calMonth: 'חודש', calAll: 'כל הספרים', calTitle: 'יומן', calToday: 'היום', noVisits: 'אין תורים',
    apptEdit: 'עריכת תור', apptClient: 'לקוח', apptTime: 'שעה', apptStatus: 'סטטוס', apptMove: 'דרג תור להעברה', saveChanges: 'שמירת שינויים', deleteAppt: 'ביטול התור, החלון מתפנה',
    stConfirmed: 'מאושר', stDone: 'הושלם', stNow: 'מתבצע', stNo: 'לא הגיע',
    bGreeting: 'בוקר טוב', bToday2: 'התורים שלי היום', bSchedule: 'הלוז שלי', bScheduleSub: 'יום · שבוע · חודש', bAvail: 'ניהול הזמינות שלי', bAvailSub: 'שעות, הפסקות ושירותים', bProfileArea: 'הפרופיל שלי', bProfileSub: 'תמונה, משפט ומשמרת', bContactClient: 'יצירת קשר עם הלקוח', viewAll2: 'לכל היומן',
    welcomeTitle: 'תספורת ברמה אחרת', welcomeSub: 'קביעת תור אצל אומני התספורת של מספרפי, בכמה נקישות.', welcomeCta: 'בוא נתחיל',
    phoneTitle: 'כניסה במספר טלפון', phoneSub: 'נשלח קוד אימות חד-פעמי ב-SMS', phoneLabel: 'מספר טלפון', phoneCta: 'שלחו לי קוד', staffLink: 'כניסת צוות',
    otpTitle: 'הזנת קוד', otpSub: 'שלחנו קוד בן 6 ספרות אל', nameTitle: 'נעים להכיר', nameSub: 'איך לקרוא לך?', nameLabel: 'שם מלא', nameCta: 'כניסה לאפליקציה', finishCta: 'סיום',
    demoHint: 'מספרי דמו', demoAdmin: 'מנהל', demoBarber: 'ספר', demoCust: 'לקוח חדש',
    regionTitle: 'מאיפה אתה מגיע?', regionSub: 'כדי שנחשב לך זמן נסיעה ונזכיר מתי לצאת', regionLabel: 'שכונה / אזור', regionSkip: 'דלג לבינתיים', regionCta: 'המשך',
    custMgr: 'לקוחות', custMgrSub: 'כל הלקוחות שלך במקום אחד', custSearch: 'חיפוש לפי שם או טלפון', custNew: 'חדשים החודש', custReturning: 'חוזרים', custOneTime: 'חד-פעמיים', custByRegion: 'לפי אזור', custVisits: 'תורים', custFav: 'ספר מועדף', custProfile: 'פרופיל לקוח', custHistory: 'היסטוריית תורים', custSince: 'לקוח מאז',
    prodMgr: 'ניהול מוצרים', prodMgrSub: 'הוסיפו, סדרו ועדכנו מלאי', prodName: 'שם המוצר', prodDesc: 'תיאור קצר', prodPrice: 'מחיר', prodInStock: 'במלאי', prodOut: 'אזל', prodReorder: 'גררו לסידור', prodEmpty: 'אין מוצרים עדיין', prodAdd: 'הוספת מוצר',
    shopEmpty: 'החנות תיפתח בקרוב', shopEmptySub: 'עדיין לא נוספו מוצרים', cart: 'הסל שלי', cartEmpty: 'הסל ריק', addToCart: 'הוספה לסל', inCart: 'בסל', checkout: 'מעבר לתשלום', cartTotal: 'סה״כ לתשלום', pay: 'תשלום', orderDone: 'ההזמנה התקבלה!', orderDoneSub: 'נכין את ההזמנה לאיסוף במספרה', backToShop: 'חזרה לחנות', remove: 'הסרה', qty: 'כמות', soldOut: 'אזל מהמלאי',
    upsellTitle: 'בא לך להשתדרג בפינוקים?', upsellSub: 'מוצר שנבחר במיוחד בשבילך', upsellCta: 'למוצרים המפנקים שלנו', maybeLater: 'אולי בפעם הבאה',
    noImage: 'אין תמונה זמינה', photoReplace: 'החלפת תמונה', photoRemove: 'הסרה',
    originTitle: 'מאיפה אתה מגיע?', originSub: 'נחשב לך זמן נסיעה ונזכיר מתי לצאת',
    originCurrent: 'לפי המיקום הנוכחי', originCurrentSub: 'אם אינך בבית כרגע', originLocating: 'מאתר את מיקומך…', originCurrentFound: 'המיקום הנוכחי שלך',
    originHome: 'הכתובת שלי', originHomeSub: 'ברירת מחדל מהפרופיל', originNoHome: 'לא הוגדרה כתובת בפרופיל', originContinue: 'המשך',
    dashDaily: 'מבט מהיר', dashWeekly: 'ניהול שוטף', dashOccasional: 'הגדרות וכלים', dashServices: 'סוגי שירותים',
    bExceptions: 'ימים חריגים', bExceptionsSub: 'חופשות ושעות מיוחדות',
    apptActions: 'פעולות לתור', markDone: 'סמן כבוצע', markUndone: 'החזר לממתין', markNoShow: 'לקוח לא הגיע', undoNoShow: 'בטל סימון «לא הגיע»', openClientCard: 'כרטיס לקוח', noShowsLbl: 'אי-הגעות', stWaiting: 'ממתין',
  },
  en: {
    greeting: 'Good evening, Daniel', near: 'Nearest location', useLocation: 'Find nearest branch', locating: 'Locating…', located: 'Nearest branch found',
    yourBarber: 'Your barber', book: 'Book', bookNow: 'Book now', services: 'Our services', viewAll: 'View all', min: 'min',
    home: 'Home', appts: 'My visits', profile: 'Profile',
    chooseBarber: 'Choose barber', chooseService: 'Choose service', chooseTime: 'Pick a time', review: 'Review',
    step: 'Step', of: 'of', continue: 'Continue', back: 'Back', confirm: 'Confirm booking',
    when: 'When', today: 'Today', tomorrow: 'Tomorrow', morning: 'Morning', noon: 'Midday', evening: 'Evening',
    with: 'with', duration: 'Duration', total: 'Total', summary: 'Summary',
    confirmedTitle: 'Booking confirmed!', confirmedSub: 'A confirmation is on its way. See you soon.', addCal: 'Add to calendar', done: 'Done',
    upcoming: 'Upcoming', past: 'History', noAppts: 'No upcoming visits', cancel: 'Cancel', reschedule: 'Reschedule',
    cancelled: 'Booking cancelled', undo: 'Undo', notifTitle: 'Appointment reminder', notifBody: 'Your cut is tomorrow at 10:15 with Sasi',
    bDashboard: 'Barber desk', bToday: "Today's schedule", bNext: 'Next client', bRevenue: 'Revenue today', bClients: 'clients', bStart: 'Start', bComplete: 'Complete', bStatusDone: 'Done', bStatusNow: 'In chair', bStatusNext: 'Up next', bStatusUp: 'Waiting',
    aOverview: 'Admin overview', aBookings: 'Bookings today', aRevenue: 'Revenue', aUtil: 'Utilization', aStaff: 'Staff', aPopular: 'Top services', aActivity: 'Recent activity', aActive: 'Active', aBreak: 'On break', aOff: 'Off shift',
    role: 'View', rCustomer: 'Customer', rBarber: 'Barber', rAdmin: 'Admin', lang: 'Lang',
    hubBook: 'Book a visit', hubNav: 'Navigate', hubVisits: 'My visits', hubContact: 'Contact', hubShop: 'Shop',
    welcome: 'Welcome', what: 'What would you like to do?',
    contactTitle: 'Get in touch', contactSub: "We'd love to help", contactWhats: 'Message on WhatsApp', contactCall: 'Call us',
    shop: 'Shop', shopTitle: 'Our shop', shopSub: 'Grooming products we love', addCart: 'Add to bag', addedCart: 'Added to bag ✓', fromShop: 'From our shop',
    mShop: 'Shop manager', mShopSub: 'Add, edit and update products', addProduct: 'Add product', nameL: 'Product name', newProduct: 'New product',
    calDay: 'Day', calWeek: 'Week', calMonth: 'Month', calAll: 'All barbers', calTitle: 'Calendar', calToday: 'Today', noVisits: 'No appointments',
    apptEdit: 'Edit appointment', apptClient: 'Client', apptTime: 'Time', apptStatus: 'Status', apptMove: 'Drag to reschedule', saveChanges: 'Save changes', deleteAppt: 'Cancel appointment, frees the slot',
    stConfirmed: 'Confirmed', stDone: 'Done', stNow: 'In chair', stNo: 'No-show',
    bGreeting: 'Good morning', bToday2: "My appointments today", bSchedule: 'My schedule', bScheduleSub: 'Day · week · month', bAvail: 'My availability', bAvailSub: 'Hours, breaks & services', bProfileArea: 'My profile', bProfileSub: 'Photo, tagline & shift', bContactClient: 'Contact client', viewAll2: 'Full calendar',
    welcomeTitle: 'A finer kind of cut', welcomeSub: 'Book the master barbers at Barbershop, in a few taps.', welcomeCta: "Let's start",
    phoneTitle: 'Sign in with your phone', phoneSub: "We'll text you a one-time code", phoneLabel: 'Phone number', phoneCta: 'Send me a code', staffLink: 'Staff sign-in',
    otpTitle: 'Enter the code', otpSub: 'We sent a 6-digit code to', nameTitle: 'Nice to meet you', nameSub: 'What should we call you?', nameLabel: 'Full name', nameCta: 'Enter the app', finishCta: 'Done',
    demoHint: 'Demo numbers', demoAdmin: 'Admin', demoBarber: 'Barber', demoCust: 'New customer',
    regionTitle: 'Where are you coming from?', regionSub: "So we can calc your travel time and remind you when to leave", regionLabel: 'Neighborhood / area', regionSkip: 'Skip for now', regionCta: 'Continue',
    custMgr: 'Customers', custMgrSub: 'All your clients in one place', custSearch: 'Search by name or phone', custNew: 'New this month', custReturning: 'Returning', custOneTime: 'One-time', custByRegion: 'By area', custVisits: 'visits', custFav: 'Favorite barber', custProfile: 'Customer profile', custHistory: 'Visit history', custSince: 'Customer since',
    prodMgr: 'Products', prodMgrSub: 'Add, reorder and manage stock', prodName: 'Product name', prodDesc: 'Short description', prodPrice: 'Price', prodInStock: 'In stock', prodOut: 'Out', prodReorder: 'Drag to reorder', prodEmpty: 'No products yet', prodAdd: 'Add product',
    shopEmpty: 'Shop opening soon', shopEmptySub: 'No products added yet', cart: 'My cart', cartEmpty: 'Your cart is empty', addToCart: 'Add to cart', inCart: 'In cart', checkout: 'Checkout', cartTotal: 'Total', pay: 'Pay', orderDone: 'Order placed!', orderDoneSub: "We'll have it ready for pickup", backToShop: 'Back to shop', remove: 'Remove', qty: 'Qty', soldOut: 'Sold out',
    upsellTitle: 'Treat yourself a little more?', upsellSub: 'Picked just for you', upsellCta: 'See our grooming picks', maybeLater: 'Maybe next time',
    noImage: 'No image available', photoReplace: 'Replace', photoRemove: 'Remove',
    originTitle: 'Where are you coming from?', originSub: "We'll estimate travel time and remind you when to leave",
    originCurrent: 'Use my current location', originCurrentSub: "If you're not home right now", originLocating: 'Finding your location…', originCurrentFound: 'Your current location',
    originHome: 'My address', originHomeSub: 'Default from your profile', originNoHome: 'No address saved in your profile', originContinue: 'Continue',
    dashDaily: 'Quick glance', dashWeekly: 'Daily management', dashOccasional: 'Settings & tools', dashServices: 'Service types',
    bExceptions: 'Exception days', bExceptionsSub: 'Days off & special hours',
    apptActions: 'Appointment actions', markDone: 'Mark as done', markUndone: 'Reopen', markNoShow: 'Client no-show', undoNoShow: 'Undo no-show', openClientCard: 'Client card', noShowsLbl: 'No-shows', stWaiting: 'Waiting',
  },
};

// ── Icon set (simple, consistent stroke glyphs) ──────────────
function Icon({ name, size = 22, color = 'currentColor', stroke = 1.7, fill = 'none', style }) {
  const p = { fill: fill === 'solid' ? color : 'none', stroke: fill === 'solid' ? 'none' : color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  // RTL fix (Round 16): every nav arrow/chevron mirrors horizontally in RTL, in a
  // Hebrew UI "next" points left and "previous" points right. Purely visual: the
  // shell defines --chev (scaleX(-1) under [dir="rtl"], none under [dir="ltr"]);
  // button behavior is untouched.
  const mirrored = name === 'chevron' || name === 'chevronR' || name === 'arrowL' || name === 'arrowR';
  const paths = {
    scissors: <g {...p}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.5 8L20 19M8.5 16L20 5"/></g>,
    pin: <g {...p}><path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></g>,
    calendar: <g {...p}><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></g>,
    clock: <g {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></g>,
    star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L4.5 9.7l5.9-.8z" fill={color} stroke="none"/>,
    bell: <g {...p}><path d="M18 8.5a6 6 0 10-12 0c0 6-2 7-2 7h16s-2-1-2-7z"/><path d="M10.5 20a2 2 0 003 0"/></g>,
    user: <g {...p}><circle cx="12" cy="8" r="4"/><path d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6"/></g>,
    check: <g {...p}><path d="M5 12.5l4.5 4.5L19 7"/></g>,
    chevron: <g {...p}><path d="M9 5l7 7-7 7"/></g>,
    chevronR: <g {...p}><path d="M15 5l-7 7 7 7"/></g>,
    plus: <g {...p}><path d="M12 5v14M5 12h14"/></g>,
    home: <g {...p}><path d="M4 11l8-6.5L20 11"/><path d="M6 9.5V20h12V9.5"/></g>,
    bag: <g {...p}><path d="M6.5 8h11l-1 12.5h-9L6.5 8z"/><path d="M9 8a3 3 0 016 0"/></g>,
    navigate: <g {...p}><path d="M3.5 11L21 3.5 13.5 21l-2.3-7.2L3.5 11z"/></g>,
    whatsapp: <g {...p}><path d="M4 20l1.4-4.1A8 8 0 1112 20a8 8 0 01-6.6-1L4 20z"/><path d="M9 10.5c.5 1.8 2.2 3.5 4 4"/></g>,
    trash: <g {...p}><path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/></g>,
    pencil: <g {...p}><path d="M14 5l5 5M4 20l1.2-4.2L16 5l3 3L8.2 18.8 4 20z"/></g>,
    gear: <g {...p}><circle cx="12" cy="12" r="3.2"/><path d="M12 3.5v2.3M12 18.2v2.3M20.5 12h-2.3M5.8 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6"/></g>,
    megaphone: <g {...p}><path d="M4 10v4a1.5 1.5 0 001.5 1.5H7l2 4h2.5l-1-4 7 3.5V6.5L10.5 10H5.5A1.5 1.5 0 004 11.5z"/></g>,
    users: <g {...p}><circle cx="9" cy="8" r="3.3"/><path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><path d="M16 5.2a3.3 3.3 0 010 6.1M20.5 19.5c0-2.4-1.4-4.2-3.5-4.8"/></g>,
    mail: <g {...p}><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M4 7l8 5.5L20 7"/></g>,
    message: <g {...p}><path d="M4 5.5h16a1 1 0 011 1v9a1 1 0 01-1 1H9l-4 3.5V16.5H4a1 1 0 01-1-1v-9a1 1 0 011-1z"/></g>,
    refresh: <g {...p}><path d="M20 11a8 8 0 10-1.5 5M20 5v4h-4"/></g>,
    map: <g {...p}><path d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4z"/><path d="M9 4v14M15 6v14"/></g>,
    search: <g {...p}><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></g>,
    heart: <g {...p}><path d="M12 20s-7-4.5-7-9.5A3.8 3.8 0 0112 8a3.8 3.8 0 017 2.5c0 5-7 9.5-7 9.5z"/></g>,
    edit: <g {...p}><path d="M4 20h16M5 16l9.5-9.5a2 2 0 013 3L8 19l-4 1 1-4z"/></g>,
    arrowL: <g {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></g>,
    arrowR: <g {...p}><path d="M5 12h14M13 6l6 6-6 6"/></g>,
    x: <g {...p}><path d="M6 6l12 12M18 6L6 18"/></g>,
    razor: <g {...p}><path d="M14 3l7 7-9 9-4 1 1-4z"/><path d="M5 19l-2 2"/></g>,
    chart: <g {...p}><path d="M4 20V4M4 20h16"/><rect x="7" y="12" width="3" height="5"/><rect x="12" y="8" width="3" height="9"/><rect x="17" y="5" width="3" height="12"/></g>,
    coin: <g {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7v10M14.5 9.2c-.6-.7-1.5-1-2.5-1-1.4 0-2.5.8-2.5 1.9 0 2.6 5 1.4 5 4 0 1.1-1.1 1.9-2.5 1.9-1 0-1.9-.3-2.5-1"/></g>,
    spark: <path d="M12 3l1.6 6.4L20 11l-6.4 1.6L12 19l-1.6-6.4L4 11l6.4-1.6z" fill={color} stroke="none"/>,
    phone: <g {...p}><path d="M5 4h4l1.5 4-2 1.5a12 12 0 006 6l1.5-2 4 1.5v4a1.5 1.5 0 01-1.6 1.5A16 16 0 013.5 5.6 1.5 1.5 0 015 4z"/></g>,
    file: <g {...p}><path d="M6.5 3h7l4.5 4.5V21H6.5z"/><path d="M13 3v5h5"/><path d="M9 13h6M9 16.5h6"/></g>,
    image: <g {...p}><rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="8.5" cy="10" r="1.7"/><path d="M5 18l4.5-4 3 2.5L16 13l3.5 3.5"/></g>,
    paperclip: <g {...p}><path d="M19 11l-7.6 7.6a4 4 0 01-5.7-5.7L13 5.6a2.7 2.7 0 013.8 3.8l-7.6 7.6a1.4 1.4 0 01-2-2L12 8.2"/></g>,
    send: <g {...p}><path d="M21 3L3 10.5l7 2.6 2.6 7L21 3z"/><path d="M10 13.1L21 3"/></g>,
    share: <g {...p}><circle cx="6" cy="12" r="2.5"/><circle cx="17.5" cy="6" r="2.5"/><circle cx="17.5" cy="18" r="2.5"/><path d="M8.2 10.8l7.1-3.6M8.2 13.2l7.1 3.6"/></g>,
    download: <g {...p}><path d="M12 4v11M8 11l4 4 4-4M5 19.5h14"/></g>,
    card: <g {...p}><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><path d="M6.5 14.5h4"/></g>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={mirrored ? { transform: 'var(--chev, none)', ...style } : style} aria-hidden="true">{paths[name]}</svg>;
}

// ── Round G1 · deal type + net profit ────────────────────────
// The agreement Rafi sets per barber. Built as a catalog so future deal types
// (salary, chair rental) slot in; only `percent` is wired up today, the rest
// surface as "coming soon" in the editor.
const DEAL_TYPES = [
  { id: 'percent', he: 'אחוזים', en: 'Percentage', subHe: 'חלוקת אחוזים מכל תספורת', subEn: 'Split each cut by %', icon: 'coin', active: true },
  { id: 'monthly', he: 'שכר חודשי', en: 'Monthly salary', subHe: 'סכום קבוע לחודש', subEn: 'Fixed monthly pay', icon: 'calendar', active: false },
  { id: 'daily', he: 'שכר יומי', en: 'Daily wage', subHe: 'תשלום לכל יום עבודה', subEn: 'Paid per working day', icon: 'calendar', active: false },
  { id: 'hourly', he: 'שכר שעתי', en: 'Hourly wage', subHe: 'תשלום לפי שעות', subEn: 'Paid by the hour', icon: 'clock', active: false },
  { id: 'station', he: 'תשלום על עמדה', en: 'Chair rental', subHe: 'הספר שוכר עמדה', subEn: 'Barber rents the chair', icon: 'scissors', active: false },
];

// Normalized deal for a barber. Owner is special: turnover is 100% his.
function barberDeal(b) {
  if (!b) return { type: 'percent', managerPct: 50 };
  if (b.owner) return { type: 'owner', managerPct: 100 };
  const d = b.deal || {};
  if (!d.type || d.type === 'percent') return { type: 'percent', managerPct: (d.managerPct != null ? d.managerPct : 50) };
  return { managerPct: 100, ...d };
}
// Fraction (0..1) of a barber's turnover the SHOP keeps. Owner = 1. Non-percent
// deals aren't modeled yet, so they fall back to treating turnover as profit.
function managerShare(b) {
  const d = barberDeal(b);
  if (d.type === 'owner') return 1;
  if (d.type === 'percent') return Math.max(0, Math.min(100, d.managerPct)) / 100;
  return 1;
}
// Net profit to the shop from a barber's turnover.
function netProfit(turnover, b) { return Math.round((turnover || 0) * managerShare(b)); }

Object.assign(window, { DATA, STR, Icon, DEAL_TYPES, barberDeal, managerShare, netProfit });
