/*
 * Christian Culture — moduł ekosystemu dla Centrum Aplikacji (pasek informacyjny + „Polecamy” Master).
 * Zasady: prawdziwe wpisy z /data/ccn-news-ticker.json + zweryfikowane aplikacje Christian Culture.
 * Zero nieprawdziwych oznaczeń emisji, zero prywatnego zaplecza, zero nieaktywnych linków 404.
 */
(function (root) {
  'use strict';

  var PLAY_APP_URL_PL = 'https://play.google.com/store/apps/details?id=pl.cclite.app&hl=pl';
  var PLAY_APP_URL_EN = 'https://play.google.com/store/apps/details?id=pl.cclite.app&hl=en';

  var PROMOS = [
    {
      id: 'wizytowka',
      href: '/wizyt%C3%B3wka',
      img: '/assets/promo/promo-wizytowka-16x9.jpg?v=20261118_4',
      imgLang: 'pl',
      k: 'Wizytówki CC',
      kEn: 'Business Cards',
      h: 'Wizytówki Christian Culture',
      hEn: 'Christian Culture Cards',
      p: 'Bezpłatna promocja chrześcijańskich twórców, autorów i inicjatyw — zgłoś się na WhatsApp.',
      pEn: 'Free promotion for Christian creators, authors and initiatives.',
      u: 'polskieradio.cc/wizytowka'
    },
    {
      id: 'lumina',
      href: '/lumina',
      img: '/assets/promo/promo-lumina-16x9.webp',
      k: 'Społeczność',
      kEn: 'Community',
      h: 'LUMINA — Portal Chrześcijański',
      hEn: 'LUMINA — Christian Portal',
      p: 'Rozmowy, modlitwa, relacje, wiadomości i spotkania online w gronie wierzących.',
      pEn: 'Conversations, prayer, community fellowship and messenger rooms online.',
      u: 'polskieradio.cc/lumina'
    },
    {
      id: 'biblia-audio',
      href: '/biblia-audio/',
      img: '/assets/promo/promo-biblia-audio-16x9.webp',
      k: 'Pismo Święte',
      kEn: 'Holy Scripture',
      h: 'Biblia Audio CC',
      hEn: 'Biblia Audio CC',
      p: 'Profesjonalne nagrania rozdziałów Pisma Świętego UBG — słuchaj codziennie bez reklam.',
      pEn: 'Daily Scripture chapters in clear audio — listen freely without ads.',
      u: 'polskieradio.cc/biblia-audio'
    },
    {
      id: 'kurscodzienny',
      href: '/akademia/kurscodzienny',
      img: '/assets/promo/promo-kurscodzienny-16x9.webp',
      k: 'Akademia Biblijna',
      kEn: 'Bible Academy',
      h: 'Z Biblią za Pan Brat',
      hEn: 'Daily Bible Course',
      p: '10 minut z Biblią każdego ranka — lekcje tekstowe, audio i rozważania na dziś.',
      pEn: 'Ten mindful minutes with Scripture every morning — text, audio and daily study.',
      u: 'polskieradio.cc/akademia'
    },
    {
      id: '40dm',
      href: '/40DM/',
      hrefEn: '/40DM/en/',
      img: '/images/social/40dm/40dm-promo-16x9-pl.jpg',
      imgEn: '/images/social/40dm/40dm-promo-16x9-en.jpg',
      k: 'Modlitwa',
      kEn: 'Prayer',
      h: '40 Dni Modlitwy',
      hEn: '40 Days of Prayer',
      p: 'Chrześcijański plan 40 dni z czytaniem Słowa, pokojem modlitwy i zachętą wspólnoty.',
      pEn: 'Guided 40-day Christian prayer journey with daily Scripture and fellowship room.',
      u: 'polskieradio.cc/40DM'
    },
    {
      id: 'vod',
      href: '/vod',
      img: '/assets/promo/promo-vod-16x9.webp',
      k: 'Kino VOD',
      kEn: 'Christian Cinema',
      h: 'Kino Chrześcijańskie VOD',
      hEn: 'Christian Cinema VOD',
      p: 'Wartościowe filmy fabularne, świadectwa, dokumenty i wykłady bez reklam.',
      pEn: 'Inspiring Christian feature films, testimonies and biblical documentaries.',
      u: 'polskieradio.cc/vod'
    },
    {
      id: 'spiritual-sounds',
      href: '/SpiritualSounds/',
      hrefEn: '/SpiritualSounds/en/',
      img: '/assets/promo/promo-spiritual-sounds-16x9.webp',
      k: 'Kanał 24/7',
      kEn: '24/7 Channel',
      h: 'Spiritual Sounds — Psalmy 24/7',
      hEn: 'Spiritual Sounds — Psalms 24/7',
      p: 'Psalmy i Słowo Boże w muzyce do modlitwy, wyciszenia i uwielbienia.',
      pEn: 'Psalms and Scripture in peaceful worship music, streaming non-stop.',
      u: 'polskieradio.cc/SpiritualSounds'
    },
    {
      id: 'ccwomen',
      href: '/ccwomen',
      img: '/assets/promo/promo-ccwomen-16x9.webp',
      k: 'Projekt CC Women',
      kEn: 'CC Women Project',
      h: 'Christian Culture Women',
      hEn: 'Christian Culture Women',
      p: 'Kobieca przestrzeń wiary, modlitwy, piękna i wzajemnego wsparcia w Chrystusie.',
      pEn: 'A dedicated space of faith, prayer, beauty and encouragement.',
      u: 'polskieradio.cc/ccwomen'
    },
    {
      id: 'wspieraj',
      href: '/wspieraj',
      img: '/assets/promo/promo-wspieraj-klasyczny.webp',
      k: 'Wsparcie misji',
      kEn: 'Support Mission',
      h: 'Wspieram to — Christian Culture',
      hEn: 'I support this — Christian Culture',
      p: 'Wszystkie aplikacje i stacje działają bezpłatnie 24/7 dzięki wsparciu ludzi dobrej woli.',
      pEn: 'Every app and broadcast remains free 24/7 thanks to community generosity.',
      u: 'polskieradio.cc/wspieraj'
    }
  ];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function ga(ev, label, placement) {
    try {
      if (typeof gtag === 'function') {
        gtag('event', ev, { event_label: label, placement: placement || 'aplikacje_hub' });
      }
    } catch (e) {}
  }

  function baseTicker(lang) {
    var en = lang === 'en';
    var playUrl = en ? PLAY_APP_URL_EN : PLAY_APP_URL_PL;
    return [
      { id: 'play', b: 'GOOGLE PLAY', t: en ? 'Christian Culture Android App — free 24/7' : 'Aplikacja Christian Culture na Androida — pobierz 0 zł', href: playUrl, ext: true, cc: true },
      { id: 'cclite', b: 'PWA · 0 ZŁ', t: en ? 'CC Lite — fast web & mobile companion (cclite.pl)' : 'CC Lite — lekka aplikacja webowa i PWA na każdy telefon', href: 'https://cclite.pl/', ext: true },
      { id: 'dzj', b: en ? 'DAILY STUDY' : 'ROZWAŻANIE', t: en ? 'Dobrze, że jesteś — morning inspiration & Scripture' : 'Dobrze, że jesteś — poranne rozważania i cytaty dnia', href: 'https://christian-culture.web.app/', ext: true },
      { id: 'lumina', b: 'LUMI MESS', t: en ? 'LUMINA portal & community prayer rooms' : 'Portal LUMINA i pokoje rozmów LUMI Messenger', href: '/mess' },
      { id: 'bible', b: 'MOJABIBLIA', t: en ? 'Interlinear Bible UBG with Hebrew/Greek codes' : 'MojaBiblia Interlinearna UBG — kody Stronga i porównanie przekładów', href: '/mojabiblia' },
      { id: 'wspieraj', b: en ? 'SUPPORT' : 'WSPIERAM TO', t: en ? 'Every Christian Culture app stays free without ads' : 'Każda aplikacja Christian Culture działa za darmo, bez reklam', href: '/wspieraj', cc: true }
    ];
  }

  function mountTicker(el, lang, placement) {
    if (!el) return;
    var items = baseTicker(lang);

    function render(list) {
      var one = list.map(function (it) {
        var cls = 'tick__item' + (it.cc ? ' is-cc' : '');
        var ext = it.ext ? ' target="_blank" rel="noopener"' : '';
        return '<a class="' + cls + '" href="' + esc(it.href) + '"' + ext + ' data-promo="tick-' + esc(it.id) + '">' +
          '<b>' + esc(it.b) + '</b><strong>' + esc(it.t) + '</strong></a>';
      }).join('');
      el.innerHTML = one + one;
      el.style.setProperty('--run', Math.max(58, list.length * 12) + 's');
    }

    render(items);
    el.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-promo]');
      if (a) ga('promo_click', a.getAttribute('data-promo'), placement);
    });

    if (typeof fetch === 'function') {
      fetch('/data/ccn-news-ticker.json', { credentials: 'omit' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (!data || !Array.isArray(data.items) || !data.items.length) return;
          var liveItems = data.items.slice(0, 3).map(function (it, idx) {
            return {
              id: 'ccn-' + idx,
              b: it.topic || (lang === 'en' ? 'CHRISTIAN CULTURE' : 'AKTUALNOŚĆ'),
              t: it.text || '',
              href: '/news',
              cc: idx === 0
            };
          }).filter(function (x) { return x.t; });
          if (liveItems.length) render(liveItems.concat(items));
        })
        .catch(function () {});
    }
  }

  function mountPromo(stage, dots, bar, lang, placement, dur) {
    if (!stage || !dots) return null;
    var en = lang === 'en';
    var i = -1;
    var cur = null;
    var timer = null;
    var seen = {};
    dur = dur || 9000;

    dots.innerHTML = PROMOS.map(function (p) {
      return '<button type="button" aria-label="' + esc(en ? (p.hEn || p.h) : p.h) + '"></button>';
    }).join('');

    function card(p) {
      var a = document.createElement('a');
      a.href = en && p.hrefEn ? p.hrefEn : p.href;
      a.setAttribute('data-promo', p.id);
      var imgSrc = en && p.imgEn ? p.imgEn : p.img;
      var useImg = imgSrc && (!p.imgLang || p.imgLang === lang);
      a.innerHTML = useImg
        ? '<img src="' + esc(imgSrc) + '" alt="' + esc((en ? p.hEn : p.h) + ' — ' + p.u) + '" loading="lazy" decoding="async">'
        : '<div class="pcard"><div><small>' + esc(en ? p.kEn : p.k) + '</small><strong>' + esc(en ? p.hEn : p.h) + '</strong><p>' + esc(en ? p.pEn : p.p) + '</p></div><em>' + esc(p.u) + '</em></div>';
      a.addEventListener('click', function () { ga('promo_click', p.id, placement); });
      return a;
    }

    function show(k) {
      i = (k + PROMOS.length) % PROMOS.length;
      var n = card(PROMOS[i]);
      n.className = 'in';
      stage.appendChild(n);
      void n.offsetWidth;
      n.className = '';
      if (cur) {
        var c = cur;
        c.className = 'out';
        setTimeout(function () { c.remove(); }, 920);
      }
      cur = n;
      [].forEach.call(dots.children, function (d, j) {
        d.classList.toggle('on', j === i);
        d.setAttribute('aria-current', j === i ? 'true' : 'false');
      });
      if (bar) {
        bar.style.transition = 'none';
        bar.style.width = '0';
        void bar.offsetWidth;
        bar.style.transition = 'width ' + dur + 'ms linear';
        bar.style.width = '100%';
      }
      if (!seen[PROMOS[i].id]) {
        seen[PROMOS[i].id] = 1;
        ga('promo_impression', PROMOS[i].id, placement);
      }
      clearTimeout(timer);
      timer = setTimeout(function () { show(i + 1); }, dur);
    }

    [].forEach.call(dots.children, function (d, j) {
      d.addEventListener('click', function () { show(j); });
    });
    show(0);
    return { next: function () { show(i + 1); } };
  }

  var api = {
    PROMOS: PROMOS,
    baseTicker: baseTicker,
    mountTicker: mountTicker,
    mountPromo: mountPromo,
    esc: esc,
    ga: ga
  };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.ApEco = api;
})(typeof window !== 'undefined' ? window : globalThis);
