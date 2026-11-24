/* CC Nowy Dzień (@007, L0 24.11.2026): wspólny „zegar północy” dla całego ekosystemu.
 * O północy czasu polskiego (Europe/Warsaw) wysyła zdarzenie window 'cc:new-day' { date: 'RRRR-MM-DD', attempt }.
 * Moduły z rozważaniem dnia nasłuchują go i pobierają nowe treści.
 * - Losowe opóźnienie 5–60 s rozkłada ruch (wszystkie otwarte strony nie uderzają naraz w bazę).
 * - Ponowienia po 5, 15, 30 i 60 min — gdy nowe rozważanie publikowane jest chwilę po północy.
 * - Telefon uśpiony przez północ: po powrocie do karty zdarzenie leci od razu, jeśli zmienił się dzień.
 * API: window.ccWarsawDate(d?) → 'RRRR-MM-DD'; window.ccOnNewDay(fn) → funkcja odpinająca.
 */
(function () {
  'use strict';
  if (window.ccOnNewDay) return;

  var fmt = null;
  try {
    fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch (e) {}

  function warsawDate(d) {
    d = d || new Date();
    if (fmt) return fmt.format(d);
    var p = function (n) { return n < 10 ? '0' + n : String(n); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  // Milisekundy do najbliższej północy w Warszawie (odporne na zmianę czasu letni/zimowy).
  function msToWarsawMidnight(nowMs) {
    var today = warsawDate(new Date(nowMs));
    var lo = nowMs, hi = nowMs + 26 * 3600 * 1000;
    if (warsawDate(new Date(hi)) === today) return 3600 * 1000; // awaryjnie: sprawdź za godzinę
    for (var i = 0; i < 40 && hi - lo > 500; i++) {
      var mid = lo + Math.floor((hi - lo) / 2);
      if (warsawDate(new Date(mid)) === today) lo = mid; else hi = mid;
    }
    return Math.max(1000, hi - nowMs);
  }

  var lastDate = warsawDate();
  var timers = [];
  var RETRIES_MIN = [5, 15, 30, 60];

  function emit(date, attempt) {
    try {
      window.dispatchEvent(new CustomEvent('cc:new-day', { detail: { date: date, attempt: attempt } }));
    } catch (e) {}
  }

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
  }

  function onNewDay(date) {
    lastDate = date;
    clearTimers();
    emit(date, 0);
    RETRIES_MIN.forEach(function (min, idx) {
      timers.push(setTimeout(function () {
        if (warsawDate() === date && document.visibilityState !== 'hidden') emit(date, idx + 1);
      }, min * 60000 + Math.floor(Math.random() * 30000)));
    });
    schedule();
  }

  var midnightTimer = null;
  function schedule() {
    if (midnightTimer) clearTimeout(midnightTimer);
    var jitter = 5000 + Math.floor(Math.random() * 55000);
    midnightTimer = setTimeout(check, msToWarsawMidnight(Date.now()) + jitter);
  }

  function check() {
    var now = warsawDate();
    if (now !== lastDate) onNewDay(now);
    else schedule();
  }

  // Uśpiony telefon / karta w tle: timery mogą się spóźnić — sprawdzamy przy powrocie.
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') check(); });
  window.addEventListener('pageshow', check);
  window.addEventListener('focus', check);

  window.ccWarsawDate = warsawDate;
  window.ccOnNewDay = function (fn) {
    var handler = function (e) { try { fn(e.detail || {}); } catch (err) {} };
    window.addEventListener('cc:new-day', handler);
    return function () { window.removeEventListener('cc:new-day', handler); };
  };
  window.__ccNewDayInternals = { msToWarsawMidnight: msToWarsawMidnight };

  schedule();
})();
