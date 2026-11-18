/*
 * CC Eco Bars — wspólny pasek informacyjny (ticker) i „★ Polecamy” dla stron ekosystemu Christian Culture.
 * @007, 2026-11-18. Wzorzec: master-live.html (CCN ticker, #mlPromo, #mlL3) i Spiritual Sounds v2.
 * Użycie:
 *   CCEco.mountTicker(el, items, placement)   items: [{id, b, t, href?, cc?, live?}]  (t może zawierać <strong>)
 *   CCEco.setTicker(el, liveKey, text)
 *   CCEco.mountPromo(stage, dots, bar, lang, placement, ms)
 * Uczciwie: żadnego fałszywego „LIVE”; GA4: promo_impression / promo_click.
 */
(function (root) {
  'use strict';

  var PROMOS = [
    { id: 'wspieraj', href: '/wspieraj', img: '/assets/promo/promo-wspieraj-klasyczny.webp', imgLang: 'pl',
      k: 'Wspieram to', kEn: 'I support this', h: 'Pomóż nieść Słowo dalej', hEn: 'Help carry the Word further',
      p: 'Modlitwa, darowizna, BLIK, przelew albo patronat — każda forma pomaga.', pEn: 'Prayer, donation, BLIK, transfer or patronage — every way helps.', u: 'polskieradio.cc/wspieraj' },
    { id: 'spiritualsounds', href: '/SpiritualSounds/tv/', k: 'Kanał 24/7', kEn: '24/7 channel', h: 'Spiritual Sounds — Psalmy 24/7', hEn: 'Spiritual Sounds — Psalms 24/7',
      p: 'Psalmy i Słowo Boże w muzyce, non-stop.', pEn: 'Psalms and the Word of God in music, non-stop.', u: 'polskieradio.cc/SpiritualSounds' },
    { id: 'biblia-audio', href: '/biblia-audio', k: 'Słuchaj', kEn: 'Listen', h: 'Biblia Audio', hEn: 'Audio Bible',
      p: 'Całe Pismo do słuchania w drodze, w domu i w pracy.', pEn: 'All Scripture to listen to on the road, at home, at work.', u: 'polskieradio.cc/biblia-audio' },
    { id: 'akademia', href: '/akademia/kurscodzienny', k: 'Akademia', kEn: 'Academy', h: 'Kurs Codzienny', hEn: 'Daily Bible Course',
      p: '10 minut ze Słowem każdego dnia.', pEn: '10 minutes in the Word every day.', u: 'polskieradio.cc/akademia' },
    { id: 'ccwomen', href: '/ccwomen', img: '/assets/promo/promo-ccwomen-16x9.webp?v=20261118_3', imgLang: 'pl',
      k: 'TVW', kEn: 'TVW', h: 'Telewizja Kobiet 24/7', hEn: 'Women’s TV 24/7',
      p: 'CC Women — Słowo, rozmowy, rodzina, modlitwa i muzyka.', pEn: 'CC Women — the Word, conversations, family, prayer and music.', u: 'polskieradio.cc/ccwomen' },
    { id: 'topten', href: '/topten', k: 'Głosuj', kEn: 'Vote', h: 'topTEN tygodnia', hEn: 'topTEN of the Week',
      p: 'Wybierz pieśni, które usłyszy Polska i świat.', pEn: 'Vote for the songs Poland and the world will hear.', u: 'polskieradio.cc/topten' },
    { id: 'mojabiblia', href: '/mojabiblia', k: 'Czytaj', kEn: 'Read', h: 'Moja Biblia', hEn: 'My Bible',
      p: 'Tekst, przekłady i słowo po słowie.', pEn: 'Scripture, translations and word by word.', u: 'polskieradio.cc/mojabiblia' },
    { id: 'master', href: '/master', k: 'Oglądaj', kEn: 'Watch', h: 'Telewizja Christian Culture', hEn: 'Christian Culture TV',
      p: 'Kanał główny CC — Słowo Boże i uwielbienie przez całą dobę.', pEn: 'The main CC channel — the Word of God and worship around the clock.', u: 'polskieradio.cc/master' },
  ];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ga(name, id, placement) { try { if (root.gtag) root.gtag('event', name, { promo_id: id, placement: placement }); } catch (e) {} }

  function mountTicker(el, items, placement) {
    if (!el) return;
    var html = items.map(function (it) {
      var inner = '<b>' + esc(it.b) + '</b><span' + (it.live ? ' data-live="' + it.live + '"' : '') + '>' + it.t + '</span>';
      var cls = 'tick__item' + (it.cc ? ' is-cc' : '');
      if (!it.href) return '<span class="' + cls + '">' + inner + '</span>';
      var ext = /^https?:/.test(it.href) ? ' target="_blank" rel="noopener"' : '';
      return '<a class="' + cls + '" href="' + it.href + '"' + ext + ' data-promo="tick-' + it.id + '">' + inner + '</a>';
    }).join('');
    el.innerHTML = html + html.replace(/<a /g, '<a tabindex="-1" aria-hidden="true" ').replace(/<span class="tick__item/g, '<span aria-hidden="true" class="tick__item');
    el.style.setProperty('--run', Math.max(60, items.length * 11) + 's');
    el.addEventListener('click', function (e) { var a = e.target.closest('a[data-promo]'); if (a) ga('promo_click', a.getAttribute('data-promo'), placement); });
  }
  function setTicker(el, key, text) {
    if (!el) return;
    el.querySelectorAll('[data-live="' + key + '"]').forEach(function (s) { s.textContent = text; });
  }

  function mountPromo(stage, dots, bar, lang, placement, dur) {
    if (!stage || !dots) return null;
    var en = lang === 'en', i = -1, cur = null, timer = null, seen = {};
    dur = dur || 9000;
    dots.innerHTML = PROMOS.map(function (p) { return '<button type="button" aria-label="' + esc(en ? (p.hEn || p.h) : p.h) + '"></button>'; }).join('');
    function card(p) {
      var a = document.createElement('a');
      a.href = p.href; a.setAttribute('data-promo', p.id);
      var useImg = p.img && (!p.imgLang || p.imgLang === lang);
      a.innerHTML = useImg
        ? '<img src="' + p.img + '" alt="' + esc(p.h + ' — ' + p.u) + '" loading="lazy" decoding="async">'
        : '<div class="pcard"><div><small>' + esc(en ? p.kEn : p.k) + '</small><strong>' + esc(en ? p.hEn : p.h) + '</strong><p>' + esc(en ? p.pEn : p.p) + '</p></div><em>' + esc(p.u) + '</em></div>';
      a.addEventListener('click', function () { ga('promo_click', p.id, placement); });
      return a;
    }
    function show(k) {
      i = (k + PROMOS.length) % PROMOS.length;
      var n = card(PROMOS[i]); n.className = 'in'; stage.appendChild(n); void n.offsetWidth; n.className = '';
      if (cur) { var c = cur; c.className = 'out'; setTimeout(function () { c.remove(); }, 950); }
      cur = n;
      [].forEach.call(dots.children, function (d, j) { d.classList.toggle('on', j === i); d.setAttribute('aria-current', j === i ? 'true' : 'false'); });
      if (bar) { bar.style.transition = 'none'; bar.style.width = '0'; void bar.offsetWidth; bar.style.transition = 'width ' + dur + 'ms linear'; bar.style.width = '100%'; }
      if (!seen[PROMOS[i].id]) { seen[PROMOS[i].id] = 1; ga('promo_impression', PROMOS[i].id, placement); }
      clearTimeout(timer); timer = setTimeout(function () { show(i + 1); }, dur);
    }
    [].forEach.call(dots.children, function (d, j) { d.addEventListener('click', function () { show(j); }); });
    show(0);
    return { next: function () { show(i + 1); } };
  }

  var api = { PROMOS: PROMOS, esc: esc, ga: ga, mountTicker: mountTicker, setTicker: setTicker, mountPromo: mountPromo };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CCEco = api;
})(typeof window !== 'undefined' ? window : globalThis);
