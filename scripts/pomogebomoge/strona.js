(function () {
  'use strict';
  var T = window.PBM || {};
  document.documentElement.classList.add('js');
  var ga = function (nazwa, metoda) { try { if (typeof gtag === 'function') gtag('event', nazwa, { method: metoda || '' }); } catch (e) {} };
  var schowek = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  // Licznik dni kursu (dzień 1 = 1 października 2026), liczony z daty w Polsce.
  try {
    var p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).map(function (x) { return [x.type, x.value]; }));
    var dzien = Math.round((Date.UTC(+p.year, +p.month - 1, +p.day) - Date.UTC(2026, 9, 1)) / 864e5) + 1;
    var ld = document.getElementById('licznikDni');
    if (dzien > 0 && ld) ld.textContent = dzien;
  } catch (e) {}

  var bezRuchu = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Języki: świadomy wybór zapamiętany (cc.support.locale); język przeglądarki tylko jako podpowiedź.
  document.querySelectorAll('[data-jezyk]').forEach(function (a) {
    a.addEventListener('click', function () { schowek.set('cc.support.locale', a.getAttribute('data-jezyk')); ga('support_locale_change', a.getAttribute('data-jezyk')); });
  });
  (function () {
    var wybrany = schowek.get('cc.support.locale');
    if (wybrany && wybrany !== T.lang && T.sciezki && T.sciezki[wybrany]) return; // nie przekierowujemy na siłę
    if (wybrany) return;
    var przegladarka = ((navigator.languages && navigator.languages[0]) || navigator.language || '').slice(0, 2).toLowerCase();
    if (!przegladarka || przegladarka === T.lang || !T.sciezki || !T.sciezki[przegladarka]) return;
    var pasek = document.getElementById('sugestia');
    if (!pasek) return;
    document.getElementById('sugestiaTekst').textContent = T.sugestie[przegladarka][0];
    var link = document.getElementById('sugestiaLink');
    link.textContent = przegladarka.toUpperCase() + ' →';
    link.href = T.sciezki[przegladarka];
    link.setAttribute('hreflang', przegladarka);
    link.addEventListener('click', function () { schowek.set('cc.support.locale', przegladarka); ga('support_locale_change', przegladarka); });
    var zostan = document.getElementById('sugestiaZostan');
    zostan.textContent = T.sugestie[T.lang][1];
    zostan.addEventListener('click', function () { schowek.set('cc.support.locale', T.lang); pasek.hidden = true; });
    pasek.hidden = false;
  })();

  // Zakładki panelu (klawiatura: strzałki, Home, End).
  var zakladki = [].slice.call(document.querySelectorAll('[role="tab"]'));
  function wybierz(t, fokus) {
    zakladki.forEach(function (z) {
      var tak = z === t;
      z.setAttribute('aria-selected', tak);
      z.tabIndex = tak ? 0 : -1;
      document.getElementById(z.getAttribute('aria-controls')).hidden = !tak;
    });
    if (fokus) t.focus();
    ga('support_method_select', t.id.replace('t-', ''));
  }
  zakladki.forEach(function (z, i) {
    z.addEventListener('click', function () { wybierz(z); });
    z.addEventListener('keydown', function (e) {
      var k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: zakladki.length - 1 }[e.key];
      if (k === undefined) return;
      e.preventDefault();
      wybierz(zakladki[(k + zakladki.length) % zakladki.length], true);
    });
  });

  // Kopiowanie (bez wysyłania numerów do analityki).
  var status = document.getElementById('status');
  document.querySelectorAll('[data-kopiuj]').forEach(function (b) {
    b.addEventListener('click', function () {
      var tekst = b.getAttribute('data-kopiuj');
      var gotowe = function () { b.textContent = T.skopiowano; b.classList.add('ok'); status.textContent = T.statusOk; setTimeout(function () { b.textContent = T.kopiuj; b.classList.remove('ok'); }, 2200); };
      var reczne = function () { status.textContent = T.statusBlad + tekst; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(tekst).then(gotowe, reczne); else reczne();
      ga('support_copy_account', b.getAttribute('data-ga-metoda'));
    });
  });

  // Pozostałe zdarzenia GA4 (bez danych osobowych).
  document.querySelectorAll('[data-ga]').forEach(function (a) { a.addEventListener('click', function () { ga(a.getAttribute('data-ga'), a.getAttribute('data-ga-metoda')); }); });
  ga('support_view', 'pomogebomoge_' + T.lang);

  // Udostępnij: po polsku dzisiejszą lekcję, w innych językach tę stronę.
  var u = document.getElementById('udostepnij');
  if (u) u.addEventListener('click', function () {
    var url = location.origin + (T.sciezki ? T.sciezki[T.lang] : location.pathname);
    if (T.udostepnijCo === 'lekcja') {
      var d = (document.getElementById('licznikDni') || {}).textContent || '';
      url = 'https://polskieradio.cc/akademia/kurscodzienny/dzien-' + String(d).padStart(2, '0');
    }
    if (navigator.share) navigator.share({ title: T.udostepnijTytul, url: url }).catch(function () {});
    else { location.href = 'https://wa.me/?text=' + encodeURIComponent(T.udostepnijTekst + url); }
  });

  // Słowa nagłówków: każde słowo w osobnej masce, wjeżdża kolejno (czytniki ekranu dostają cały tekst).
  [].slice.call(document.querySelectorAll('.slowa')).forEach(function (h) {
    var tekst = h.textContent.trim();
    h.setAttribute('aria-label', h.getAttribute('aria-label') || tekst);
    h.innerHTML = tekst.split(/\s+/).map(function (w, i) { return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + w.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span></span>'; }).join(' ');
  });

  // Licznik usług: odliczanie od zera.
  var nr = document.getElementById('licznikUslug');
  function odliczaj() {
    if (!nr || bezRuchu) return;
    var cel = +nr.textContent, t0 = null;
    function krok(t) { if (!t0) t0 = t; var q = Math.min(1, (t - t0) / 1400); nr.textContent = Math.round(cel * (1 - Math.pow(1 - q, 3))); if (q < 1) requestAnimationFrame(krok); }
    nr.textContent = '0'; requestAnimationFrame(krok);
  }

  // Pasek postępu i lekka paralaksa liczby.
  var pasek = document.querySelector('.postep'), liczba = document.querySelector('.plansza__liczba'), klatka = 0;
  function przewijanie() {
    klatka = 0;
    var max = document.documentElement.scrollHeight - innerHeight;
    if (pasek) pasek.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0).toFixed(4) + ')';
    if (liczba && !bezRuchu) liczba.style.transform = 'translateY(' + Math.min(36, scrollY * 0.08).toFixed(1) + 'px)';
  }
  addEventListener('scroll', function () { if (!klatka) klatka = requestAnimationFrame(przewijanie); }, { passive: true });
  przewijanie();

  // Wejścia sekcji.
  var cele = [].slice.call(document.querySelectorAll('[data-wejscie], .slowa, .bez__uklad figure'));
  cele.forEach(function (c, i) { c.style.setProperty('--d', (i % 4) * 80 + 'ms'); });
  odliczaj();
  if (typeof IntersectionObserver !== 'function') { cele.forEach(function (c) { c.classList.add('jest'); }); return; }
  var io = new IntersectionObserver(function (w) { w.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('jest'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
  cele.forEach(function (c) { io.observe(c); });
})();
