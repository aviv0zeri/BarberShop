// shabbat.jsx, Shabbat mode: auto-closes the app from Shabbat entry to exit (per Shabbat times).
// Prototype uses approximate Jerusalem times (Fri 18:30 → Sat 19:45); real build would use a zmanim API.
// Exposes window.shabbat. When the toggle is OFF the app is fully active on Saturdays too.
(function () {
  const ENTER_MIN = 18 * 60 + 30; // Fri 18:30
  const EXIT_MIN = 19 * 60 + 45;  // Sat 19:45
  window.shabbat = {
    enabled() { try { const b = JSON.parse(localStorage.getItem('royale_bizsettings_v1')); return !!(b && b.shabbatMode); } catch (e) { return false; } },
    times() { return { enter: '18:30', exit: '19:45' }; },
    // is it Shabbat right now (only when the mode is on)?
    isNow(d) {
      if (!this.enabled()) return false;
      d = d || new Date();
      const dow = d.getDay(), m = d.getHours() * 60 + d.getMinutes();
      if (dow === 5 && m >= ENTER_MIN) return true; // Friday evening
      if (dow === 6 && m < EXIT_MIN) return true;    // Saturday until nightfall
      return false;
    },
    // is a given date (YYYY-MM-DD) a closed Shabbat day?
    closedDate(ds) { if (!this.enabled()) return false; try { return new Date(ds + 'T00:00').getDay() === 6; } catch (e) { return false; } },
  };
})();
