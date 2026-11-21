/* Adventist World — Ecosystem Ticker & ★ Polecamy Ribbon (Christian Culture) */
(function () {
  'use strict';

  const PROMO_ITEMS = {
    pl: [
      {
        tag: 'CENTRUM APLIKACJI',
        title: 'Aplikacje Christian Culture',
        desc: '14 narzędzi wiary na Androida, Google Play i WWW — Radio 24/7, MojaBiblia, LUMINA i Dobrze, że jesteś.',
        href: '/aplikacje/',
        img: '/assets/promo/promo-wizytowka-16x9.jpg'
      },
      {
        tag: 'WSPÓLNOTA',
        title: 'LUMINA & LUMI MESS',
        desc: 'Modlitwa, inspiracje, pokoje tematyczne i czat wspólnoty Christian Culture na żywo.',
        href: '/lumina',
        img: '/assets/promo/promo-lumina-16x9.webp'
      },
      {
        tag: 'SŁOWO BOŻE',
        title: 'Biblia Audio CC',
        desc: 'Słuchowiska i lektury Pisma Świętego w najwyższej jakości dźwięku bez reklam.',
        href: '/biblia-audio',
        img: '/assets/promo/promo-biblia-audio-16x9.webp'
      },
      {
        tag: 'STUDIUM BIBLIJNE',
        title: 'Kurs Codzienny',
        desc: 'Codzienne, 5-minutowe rozważania biblijne w cyklu miesięcznym — otwarte dla każdego.',
        href: '/akademia#kurscodzienny',
        img: '/assets/promo/promo-kurscodzienny-16x9.webp'
      },
      {
        tag: 'KINO MISYJNE',
        title: 'VOD Christian Culture',
        desc: 'Wyselekcjonowane filmy fabularne, dokumenty i wykłady biblijne za darmo online.',
        href: '/vod',
        img: '/assets/promo/promo-vod-16x9.webp'
      },
      {
        tag: 'MODLITWA',
        title: '40 Dni Modlitwy',
        desc: 'Wspólny 40-dniowy program modlitewny z rozważaniami i otwartym pokojem wsparcia.',
        href: '/40-dni-modlitwy',
        img: '/images/social/40dm/40dm-promo-16x9-pl.jpg'
      },
      {
        tag: 'MUZYKA SAKRALNA',
        title: 'Spiritual Sounds × CC',
        desc: 'Muzyka instrumentalna i worship tworzona dla wyciszenia, modlitwy i odpoczynku.',
        href: '/SpiritualSounds/',
        img: '/assets/promo/promo-spiritual-sounds-16x9.webp'
      },
      {
        tag: 'KOBIETY WIARY',
        title: 'CC Women',
        desc: 'Rozmowy, świadectwa i inspiracje budujące kobiety w wierze i codzienności.',
        href: '/ccwomen',
        img: '/assets/promo/promo-ccwomen-16x9.webp'
      },
      {
        tag: 'PATRONITE · 0 ZŁ REKLAM',
        title: 'Wesprzyj Misję CC',
        desc: 'Ekosystem pozostaje w 100% darmowy dzięki dobrowolnemu wsparciu darczyńców.',
        href: 'https://patronite.pl/ChristianCulture',
        img: '/assets/promo/promo-wspieraj-klasyczny.webp',
        external: true
      }
    ],
    en: [
      {
        tag: 'APP HUB',
        title: 'Christian Culture Apps',
        desc: '14 faith tools for Android, Google Play & Web — Radio 24/7, MojaBiblia, LUMINA, and daily devotionals.',
        href: '/aplikacje/en/',
        img: '/assets/promo/promo-wizytowka-16x9.jpg'
      },
      {
        tag: 'COMMUNITY',
        title: 'LUMINA & LUMI MESS',
        desc: 'Prayer rooms, daily fellowship, and mission conversations in one unified community space.',
        href: '/lumina',
        img: '/assets/promo/promo-lumina-16x9.webp'
      },
      {
        tag: 'SCRIPTURE AUDIO',
        title: 'Biblia Audio CC',
        desc: 'Dramatized Bible audio productions and scripture readings streamed free without ads.',
        href: '/biblia-audio',
        img: '/assets/promo/promo-biblia-audio-16x9.webp'
      },
      {
        tag: 'DAILY STUDY',
        title: 'Daily Bible Course',
        desc: 'Structured daily devotional studies connecting Scripture with practical Christian life.',
        href: '/akademia#kurscodzienny',
        img: '/assets/promo/promo-kurscodzienny-16x9.webp'
      },
      {
        tag: 'CHRISTIAN CINEMA',
        title: 'VOD Christian Culture',
        desc: 'Curated faith films, documentaries, and biblical lectures streaming freely.',
        href: '/vod',
        img: '/assets/promo/promo-vod-16x9.webp'
      },
      {
        tag: 'PRAYER PLAN',
        title: '40 Days of Prayer',
        desc: 'Forty-day guided scripture and prayer journey hosted across the Christian Culture ecosystem.',
        href: '/40-dni-modlitwy',
        img: '/images/social/40dm/40dm-promo-16x9-en.jpg'
      },
      {
        tag: 'WORSHIP & AMBIENT',
        title: 'Spiritual Sounds × CC',
        desc: 'Calm instrumental worship music crafted for prayer, rest, and Sabbath reflection.',
        href: '/SpiritualSounds/en/',
        img: '/assets/promo/promo-spiritual-sounds-16x9.webp'
      },
      {
        tag: 'WOMEN MINISTRY',
        title: 'CC Women',
        desc: 'Stories, fellowship, and Christian encouragement for women across generations.',
        href: '/ccwomen',
        img: '/assets/promo/promo-ccwomen-16x9.webp'
      },
      {
        tag: 'SUPPORT MISSION',
        title: 'Support Christian Culture',
        desc: 'Keep every directory, Bible tool, and broadcast 100% free and ad-free on Patronite.',
        href: 'https://patronite.pl/ChristianCulture',
        img: '/assets/promo/promo-wspieraj-klasyczny.webp',
        external: true
      }
    ]
  };

  async function mountTicker(lang) {
    const track = document.getElementById('tickRun');
    if (!track) return;

    const fallbackItems = lang === 'en'
      ? [
          { label: 'RADIO 24/7', title: 'PolskieRadio.cc — Live Broadcasts & Scripture Audio', url: '/player' },
          { label: 'OPEN DIRECTORY', title: 'Adventist World P0 — 49 Verified Public-Source Records across 4 Countries', url: '#katalog' },
          { label: 'MOJABIBLIA', title: 'Interlinear Scripture with Strong Codes & 4 Translations', url: '/mojabiblia' },
          { label: 'PRAYER', title: '40 Days of Prayer — Join the Daily Fellowship Plan', url: '/40-dni-modlitwy' }
        ]
      : [
          { label: 'RADIO 24/7', title: 'PolskieRadio.cc — Słuchowiska Biblijne i Muzyka Chrześcijańska bez reklam', url: '/player' },
          { label: 'OTWARTY KATALOG', title: 'Adventist World P0 — 49 zweryfikowanych publicznych rekordów w 4 krajach', url: '#katalog' },
          { label: 'MOJABIBLIA', title: 'Pismo Święte z kodami Stronga i 4 przekładami online za darmo', url: '/mojabiblia' },
          { label: 'MODLITWA', title: '40 Dni Modlitwy — dołącz do wspólnego czytania i pokoju rozmów', url: '/40-dni-modlitwy' }
        ];

    let items = fallbackItems;
    try {
      const res = await fetch('/data/ccn-news-ticker.json?t=' + Date.now(), { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
        const mapped = rawList
          .filter((x) => x && (x.title || x.headline))
          .slice(0, 6)
          .map((x) => ({
            label: (x.category || 'CCN NEWS').toString().toUpperCase(),
            title: String(x.title || x.headline),
            url: (typeof x.url === 'string' && x.url.startsWith('/')) ? x.url : '/news'
          }));
        if (mapped.length) items = mapped.concat(fallbackItems.slice(0, 2));
      }
    } catch (_) {
      // Fallback ticker stays active silently when offline
    }

    const html = items.concat(items).map((it) => (
      `<a class="ticker-item" href="${escapeAttr(it.url)}">` +
      `<span class="ticker-tag">${escapeHtml(it.label)}</span>` +
      `<span>${escapeHtml(it.title)}</span>` +
      `</a>`
    )).join('');

    track.innerHTML = html;
  }

  function mountPromo(lang) {
    const grid = document.getElementById('awPromoGrid');
    if (!grid) return;
    const list = PROMO_ITEMS[lang === 'en' ? 'en' : 'pl'];
    grid.innerHTML = list.map((item) => {
      const extAttrs = item.external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return (
        `<a class="promo-card" href="${escapeAttr(item.href)}"${extAttrs}>` +
        `<img src="${escapeAttr(item.img)}" alt="${escapeAttr(item.title)}" width="640" height="360" loading="lazy">` +
        `<div class="promo-body">` +
        `<span class="promo-tag">${escapeHtml(item.tag)}</span>` +
        `<h3 class="promo-title">${escapeHtml(item.title)}</h3>` +
        `<p class="promo-desc">${escapeHtml(item.desc)}</p>` +
        `</div>` +
        `</a>`
      );
    }).join('');
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, '&#39;');
  }

  window.AW_ECO = {
    mount: function (lang) {
      mountTicker(lang || 'pl');
      mountPromo(lang || 'pl');
    }
  };
})();
