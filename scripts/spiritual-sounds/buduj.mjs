// Spiritual Sounds × CC — generator wizytówki PL/EN (WERSJA TESTOWA), @007 2026-11-18.
// Uruchom: node scripts/spiritual-sounds/buduj.mjs  → test/spiritual-sounds/index.html i en/index.html
// Treść PL/EN = dyrektywa §7/§8 (bez dopisków o Arturze, bez statystyk wymyślonych).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const BASE = '/test/spiritual-sounds/';
const ORIGIN = 'https://polskieradio.cc';
const PLAYLIST = 'PLD0gxYiiSZMA';
const YT_CHANNEL = 'https://www.youtube.com/@SpiritualSoundsPsalmy';
const YT_PLAYLIST = `https://www.youtube.com/playlist?list=${PLAYLIST}`;
const V = '20261118_3';

// Serie potwierdzone na kanale (18.11.2026) — okładka = pierwsze nagranie z RSS playlisty.
const SERIES = [
  { list: PLAYLIST, thumb: 'dFsyIS_vAVY', main: true, pl: ['Psalmy i Słowo Boże w Muzyce', 'Główna playlista · źródło kanału 24/7'], en: ['Psalmy i Słowo Boże w Muzyce', 'Main playlist · source of the 24/7 channel'] },
  { list: 'PLBpfEVvRZNuo', thumb: 'jpoqkzZo8Og', pl: ['Nadzieja', 'Nadzieja w Bogu'], en: ['Nadzieja', 'Hope in God'] },
  { list: 'PLDpP3o66gJ4U', thumb: 'vtOgTxy1EEE', pl: ['Ufność', 'Ufność w Panu'], en: ['Ufność', 'Trust in the Lord'] },
  { list: 'PLYbBAoBR7wig', thumb: 'guhp_uxZtf4', pl: ['Pieśni z Księgi Izajasza', 'Pieśni metryczne'], en: ['Pieśni z Księgi Izajasza', 'Songs from the Book of Isaiah'] },
  { list: 'PLcaRxlJcJEjs', thumb: 'Y0d9XCwS3jE', pl: ['Biblijny western: Głos z Synaju', 'Seria'], en: ['Biblijny western: Głos z Synaju', 'Bible western · series'] },
  { list: 'PLdbrl4UN_wepjPhy4LRJduhznKdE5nBoq', thumb: 'Hjz563fFy7I', pl: ['Spokój Duszy: Modlitwa bez Słów', 'Muzyka do modlitwy i wyciszenia'], en: ['Spokój Duszy: Modlitwa bez Słów', 'Music for prayer and stillness'] },
];

const T = {
  pl: {
    lang: 'pl', locale: 'pl_PL', altLocale: 'en_US', path: BASE, tv: `${BASE}tv/`,
    title: 'Spiritual Sounds – Psalmy po polsku | Christian Culture',
    desc: 'Psalmy i Słowo Boże w muzyce. Spiritual Sounds tworzy muzykę inspirowaną Pismem Świętym — do modlitwy, wyciszenia i uwielbienia. Kanał biblijny 24/7 w Christian Culture.',
    ogDesc: 'Psalmy i Słowo Boże w muzyce. Kanał biblijny 24/7 — Spiritual Sounds × Christian Culture.',
    ogAlt: 'Emblemat Spiritual Sounds: świetlista fala dźwięku w kształcie krzyża na granatowym tle',
    skip: 'Przejdź do treści', testbar: 'Wersja testowa — strona nie jest jeszcze opublikowana ani indeksowana.',
    tickerBadge: '24/7 · Non-stop', tickerAria: 'Pasek informacyjny',
    navAria: 'Główna nawigacja', langAria: 'Język', brandAria: 'Spiritual Sounds — początek strony',
    nav: ['Start', '24/7', 'Najnowsze', 'Misja', 'Psalmy', 'O projekcie'], support: 'Wspieram to', menu: 'Menu',
    chips: ['Kanał 24/7 · non-stop', '× Christian Culture'],
    h1a: 'Spiritual', h1b: 'Sounds', sub: 'Psalmy po polsku', claim: 'Psalmy i Słowo Boże w muzyce',
    lead: 'Muzyka inspirowana Pismem Świętym, tworzona z myślą o modlitwie, wyciszeniu, uwielbieniu i codziennym spotkaniu ze Słowem Bożym.',
    ctaWatch: 'Oglądaj 24/7', ctaPlaylist: 'Otwórz playlistę',
    onairLabel: 'Teraz na kanale 24/7', onairWait: 'Łączenie z kanałem…', onairSound: 'Posłuchaj tutaj', onairFull: 'Pełny kanał', onairMute: 'Wycisz',
    stats: [['300', '+', 'nagrań w playliście'], ['24', '/7', 'non-stop, bez wybierania'], ['0', ' zł', 'dla każdego, za darmo']],
    latestEyebrow: 'Najnowsze', latestH: 'Świeżo dodane do <em>playlisty</em>', latestLead: 'Prosto z kanału autora — lista odświeża się sama, gdy pojawia się nowe nagranie.',
    prev: 'Poprzednie', next: 'Następne', newBadge: 'NOWE', latestErr: 'Nie udało się teraz pobrać listy. Otwórz playlistę na YouTube.',
    chEyebrow: '24/7 · non-stop', chH: 'Spiritual Sounds – <em>Kanał Biblijny 24/7</em>',
    chLead: 'Psalmy i Słowo Boże dostępne przez całą dobę.',
    chP: 'Oglądaj i słuchaj muzycznych opracowań Biblii bez konieczności wybierania kolejnych nagrań. Kanał odtwarza oficjalną playlistę autora — nowe utwory pojawiają się w nim same.',
    chCta: 'Uruchom kanał', chAria: 'Uruchom kanał Spiritual Sounds 24/7', chNow: 'Teraz na kanale',
    misEyebrow: 'Misja', misH: 'Muzyka, która <em>prowadzi do Boga</em>',
    misQuote: 'Spiritual Sounds to przestrzeń, w której <em>wiara spotyka się z muzyką.</em>',
    misP1: 'Kanał prezentuje Psalmy w nowych aranżacjach, pieśni chrześcijańskie, modlitewne refleksje oraz muzyczne opracowania fragmentów Pisma Świętego.',
    misP2: 'Celem projektu jest tworzenie muzyki pełnej pokoju, nadziei i biblijnego przesłania – dostępnej dla osób szukających modlitwy, wyciszenia, uwielbienia i duchowego umocnienia.',
    psEyebrow: 'Psalmy i Słowo Boże', psH: 'Księga Psalmów i Pismo Święte <em>w muzyce</em>',
    psLead: 'Główna kolekcja Spiritual Sounds obejmuje setki muzycznych opracowań Księgi Psalmów oraz innych fragmentów Biblii w różnorodnych stylach – od spokojnych i refleksyjnych aranżacji po bardziej dynamiczne kompozycje wokalne i instrumentalne.',
    psP: 'Playlista jest stale rozwijana przez autora.', seriesAria: 'Serie Spiritual Sounds',
    abEyebrow: 'O projekcie', abH: 'Twórca <em>i technologia</em>',
    abLead: 'Artur jest twórcą projektu Spiritual Sounds.',
    abP: 'Zgodnie z informacją przekazaną przez autora nagrania powstają z wykorzystaniem narzędzia Suno w płatnym planie Pro.',
    facts: [['Człowiek prowadzi', 'Autor odpowiada za kierunek twórczy, dobór fragmentów Pisma Świętego i publikację.'], ['Narzędzia wspierają', 'Narzędzia generatywne uczestniczą w procesie produkcji muzycznej.'], ['Przejrzyście', 'Mówimy wprost, jak powstają nagrania — tak jak przekazał nam autor.']],
    promoEyebrow: 'Christian Culture', promoH: 'Polecamy <em>w ekosystemie</em>', promoHead: '★ POLECAMY', promoAria: 'Polecamy w Christian Culture',
    qlinks: [['/biblia-audio', 'Biblia Audio', 'Całe Pismo do słuchania'], ['/akademia/kurscodzienny', 'Kurs Codzienny', '10 minut ze Słowem'], ['/master', 'Telewizja CC 24/7', 'Christian Culture Master']],
    patEyebrow: 'Patronat', patH: 'Ta misja żyje <em>dzięki ludziom</em>',
    patLead: 'Kanał 24/7 i ta strona są bezpłatne dla każdego. Jeśli chcesz, by Psalmy i Słowo Boże docierały dalej — dołącz.',
    patWays: ['Wspieraj misję Christian Culture — darowizna, BLIK, przelew', 'Zostań patronem na Patronite', 'Wspieraj twórcę: subskrybuj, polub i udostępnij nagrania Spiritual Sounds'],
    patCta: 'Wspieram to', patPatronite: 'Zostań patronem', patShare: 'Udostępnij', shared: 'Link skopiowany',
    coopEyebrow: 'Współpraca', coopH: 'Spiritual Sounds × Christian Culture',
    coopP: 'Dedykowany kanał 24/7 i wizytówka powstały w ramach misyjnej współpracy Spiritual Sounds i Christian Culture, aby Psalmy i treści biblijne mogły docierać do jeszcze większej liczby odbiorców.',
    coopSub: 'Subskrybuj na YouTube',
    bannerAlt: 'Baner Spiritual Sounds — Psalmy i uwielbienie po polsku: krzyż na tle zachodu słońca',
    ftLinks: ['Kanał YouTube @SpiritualSoundsPsalmy', 'Playlista: Psalmy i Słowo Boże w Muzyce', 'Kanał 24/7'],
    ftNote: 'Nagrania należą do autora kanału Spiritual Sounds i są odtwarzane z oficjalnego YouTube za jego zgodą.',
    tileAria: 'Otwórz na YouTube: ',
  },
  en: {
    lang: 'en', locale: 'en_US', altLocale: 'pl_PL', path: `${BASE}en/`, tv: `${BASE}tv/?lang=en`,
    title: 'Spiritual Sounds – Polish Psalms | Christian Culture',
    desc: 'Psalms and the Word of God in music. Spiritual Sounds creates Bible-inspired music for prayer, reflection and worship. A 24/7 Bible channel on Christian Culture.',
    ogDesc: 'Psalms and the Word of God in music. Bible channel 24/7 — Spiritual Sounds × Christian Culture.',
    ogAlt: 'Spiritual Sounds emblem: a luminous sound wave forming a cross on deep navy',
    skip: 'Skip to content', testbar: 'Test version — this page is not yet published or indexed.',
    tickerBadge: '24/7 · Non-stop', tickerAria: 'Information bar',
    navAria: 'Main navigation', langAria: 'Language', brandAria: 'Spiritual Sounds — top of page',
    nav: ['Home', '24/7', 'Latest', 'Mission', 'Psalms', 'About'], support: 'I support this', menu: 'Menu',
    chips: ['24/7 channel · non-stop', '× Christian Culture'],
    h1a: 'Spiritual', h1b: 'Sounds', sub: 'Polish Psalms', claim: 'Psalms and the Word of God in Music',
    lead: 'Bible-inspired music created for prayer, reflection, worship and a daily encounter with the Word of God.',
    ctaWatch: 'Watch 24/7', ctaPlaylist: 'Open Playlist',
    onairLabel: 'Now on the 24/7 channel', onairWait: 'Connecting to the channel…', onairSound: 'Listen here', onairFull: 'Full channel', onairMute: 'Mute',
    stats: [['300', '+', 'recordings in the playlist'], ['24', '/7', 'non-stop, no picking'], ['0', ' PLN', 'free for everyone']],
    latestEyebrow: 'Latest', latestH: 'Freshly added to the <em>playlist</em>', latestLead: 'Straight from the creator’s channel — the list refreshes itself whenever a new recording appears.',
    prev: 'Previous', next: 'Next', newBadge: 'NEW', latestErr: 'The list could not be loaded right now. Open the playlist on YouTube.',
    chEyebrow: '24/7 · non-stop', chH: 'Spiritual Sounds – <em>Bible Channel 24/7</em>',
    chLead: 'Psalms and the Word of God available around the clock.',
    chP: 'Watch and listen without having to manually select the next recording. The channel plays the creator’s official playlist — new recordings appear in it automatically.',
    chCta: 'Start Channel', chAria: 'Start the Spiritual Sounds 24/7 channel', chNow: 'Now on the channel',
    misEyebrow: 'Mission', misH: 'Music that leads you <em>closer to God</em>',
    misQuote: 'Spiritual Sounds is a space where <em>faith meets music.</em>',
    misP1: 'The channel features Psalms in new musical arrangements, Christian songs, prayerful reflections and musical interpretations of Scripture.',
    misP2: 'Its purpose is to create music filled with peace, hope and a biblical message for people seeking prayer, reflection, worship and spiritual encouragement.',
    psEyebrow: 'Psalms &amp; Scripture', psH: 'The Book of Psalms and Scripture <em>in music</em>',
    psLead: 'The main Spiritual Sounds collection contains hundreds of musical interpretations of the Book of Psalms and other passages of Scripture in many different styles – from peaceful, reflective arrangements to powerful vocal and instrumental compositions.',
    psP: 'The playlist continues to grow as new recordings are added by its creator.', seriesAria: 'Spiritual Sounds series',
    abEyebrow: 'About', abH: 'Creator <em>&amp; technology</em>',
    abLead: 'Artur is the creator of Spiritual Sounds.',
    abP: 'According to the information provided by the creator, the recordings are produced with the assistance of Suno under a paid Pro plan.',
    facts: [['A human leads', 'The creator is responsible for the creative direction, Scripture selection and publication.'], ['Tools assist', 'Generative tools assist in the music production process.'], ['Transparently', 'We say plainly how the recordings are made — as the creator told us.']],
    promoEyebrow: 'Christian Culture', promoH: 'Recommended <em>in the ecosystem</em>', promoHead: '★ RECOMMENDED', promoAria: 'Recommended on Christian Culture',
    qlinks: [['/biblia-audio', 'Audio Bible', 'All Scripture to listen to'], ['/akademia/kurscodzienny', 'Daily Bible Course', '10 minutes in the Word'], ['/master', 'CC Television 24/7', 'Christian Culture Master']],
    patEyebrow: 'Patronage', patH: 'This mission lives <em>thanks to people</em>',
    patLead: 'The 24/7 channel and this page are free for everyone. If you want the Psalms and the Word of God to reach further — join in.',
    patWays: ['Support the Christian Culture mission — donation, BLIK, bank transfer', 'Become a patron on Patronite', 'Support the creator: subscribe, like and share Spiritual Sounds recordings'],
    patCta: 'I support this', patPatronite: 'Become a patron', patShare: 'Share', shared: 'Link copied',
    coopEyebrow: 'Cooperation', coopH: 'Spiritual Sounds × Christian Culture',
    coopP: 'The dedicated 24/7 channel and artist showcase were created as part of a missionary collaboration between Spiritual Sounds and Christian Culture, helping Psalms and Bible-based music reach more people.',
    coopSub: 'Subscribe on YouTube',
    bannerAlt: 'Spiritual Sounds banner — Psalms and worship in Polish: a cross against a sunset sky',
    ftLinks: ['YouTube channel @SpiritualSoundsPsalmy', 'Playlist: <span lang="pl">Psalmy i Słowo Boże w Muzyce</span>', '24/7 channel'],
    ftNote: 'All recordings belong to the creator of Spiritual Sounds and are played from the official YouTube channel with his permission.',
    tileAria: 'Open on YouTube: ',
  },
};

const GA = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y4EFTVBPE3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config','G-Y4EFTVBPE3',(function(){try{var s=location.search,k='cc_team';if(/[?&]cc_team=1/.test(s))localStorage.setItem(k,'1');if(/[?&]cc_team=0/.test(s))localStorage.removeItem(k);if(localStorage.getItem(k)==='1'||/[?&]in_mcr=1/.test(s)||window.obsstudio)return{traffic_type:'internal'}}catch(e){}return{}})());
</script><script src="/js/cc-analytics.js?v=20261026_1" defer></script>`;

const ICON = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13l11-6.5z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>',
  left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
};
const FACT_ICONS = [
  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h2l2-5 3 10 3-7 2 4h4"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h9l3 3v13H6z"/><path d="M9 11h6M9 15h6"/></svg>',
];
const WAY_ICONS = [
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.3-9-8.6C1.6 8.2 3.6 5 7 5c2 0 3.4 1 5 2.8C13.6 6 15 5 17 5c3.4 0 5.4 3.2 4 6.4-2 4.3-9 8.6-9 8.6z"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="3"/><path d="m10 9.5 5 2.5-5 2.5z"/></svg>',
];

function page(t) {
  const other = t.lang === 'pl' ? T.en : T.pl;
  const abs = (p) => ORIGIN + p;
  const yt = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const tiles = SERIES.map((s) => {
    const [h, sub] = s[t.lang];
    const langAttr = t.lang === 'en' ? ' lang="pl"' : '';
    return `        <a class="tile${s.main ? ' tile--main' : ''}" href="https://www.youtube.com/playlist?list=${s.list}" target="_blank" rel="noopener" aria-label="${t.tileAria}${h}" data-tilt>
          <img src="${yt(s.thumb)}" width="480" height="360" loading="lazy" decoding="async" alt="">
          <span class="go" aria-hidden="true">${ICON.arrow}</span>
          <small><span class="dot" aria-hidden="true"></span>${sub}</small>
          <h3${langAttr}>${h}</h3>
        </a>`;
  }).join('\n');
  const stats = t.stats.map(([n, suf, label]) => `    <div class="stat reveal"><strong><span class="reel" data-reel="${n}">${n}</span><span>${suf}</span></strong><small>${label}</small></div>`).join('\n');
  const facts = t.facts.map(([b, s], i) => `        <li>${FACT_ICONS[i]}<div><b>${b}</b><span>${s}</span></div></li>`).join('\n');
  const ways = t.patWays.map((w, i) => `          <li>${WAY_ICONS[i]}<span>${w}</span></li>`).join('\n');
  const qlinks = t.qlinks.map(([href, a, b]) => `          <a href="${href}" data-promo="q-${href.replace(/\W+/g, '')}">${a}<span>${b} →</span></a>`).join('\n');
  const navIds = ['start', 'kanal-247', 'najnowsze', 'misja', 'psalmy', 'o-projekcie'];
  const nav = t.nav.map((n, i) => `        <li><a${i === 1 ? ' class="is-247"' : ''} href="#${navIds[i]}">${n}</a></li>`).join('\n');

  return `<!doctype html>
<html lang="${t.lang}" class="no-js">
<head>
${GA}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<!-- WYGENEROWANE: scripts/spiritual-sounds/buduj.mjs — nie edytuj ręcznie. WERSJA TESTOWA: noindex do akceptacji L0. -->
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#04070f">
<title>${t.title}</title>
<meta name="description" content="${t.desc}">
<link rel="canonical" href="${abs(t.path)}">
<link rel="alternate" hreflang="pl" href="${abs(T.pl.path)}">
<link rel="alternate" hreflang="en" href="${abs(T.en.path)}">
<link rel="alternate" hreflang="x-default" href="${abs(T.pl.path)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="${t.locale}">
<meta property="og:locale:alternate" content="${t.altLocale}">
<meta property="og:site_name" content="Christian Culture">
<meta property="og:title" content="${t.title.split(' | ')[0]}">
<meta property="og:description" content="${t.ogDesc}">
<meta property="og:url" content="${abs(t.path)}">
<meta property="og:image" content="${abs(BASE)}img/ss-og-1200x630.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${t.ogAlt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t.title.split(' | ')[0]}">
<meta name="twitter:description" content="${t.ogDesc}">
<meta name="twitter:image" content="${abs(BASE)}img/ss-og-1200x630.jpg">
<link rel="icon" type="image/png" href="${BASE}img/ss-icon-192.png">
<link rel="preload" as="image" href="${BASE}img/ss-emblem-720.webp" fetchpriority="high">
<link rel="preconnect" href="https://www.youtube-nocookie.com">
<link rel="preconnect" href="https://i.ytimg.com">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Manrope:wght@400;600;700;800&display=swap">
<link rel="stylesheet" href="/css/cc-mobile-edge.css?v=20261113_edge13">
<link rel="stylesheet" href="${BASE}ss.css?v=${V}">
<script src="/js/cc-global-auth.js?v=20261116_a007_auth" defer></script>
<script src="/js/cc-favorites.js?v=20261114_favz1" defer></script>
<script src="/js/cc-mobile-edge.js?v=20261110_edge12" defer></script>
<script src="/js/cc-edge-plus.js?v=20261110_edgep2" defer></script>
<script src="/components/cc-omni-search.js?v=20261030_feat11" defer></script>
<script src="/components/cc-global-chat-button.js?v=20261116_a007_col2" defer></script>
<script src="/js/cc-back-to-top.js?v=20261116_btt5" defer></script>
<script src="/components/cc-support-footer.js?v=20261116_a007_column" defer></script>
<script src="${BASE}ss-eco.js?v=${V}" defer></script>
<script src="${BASE}ss.js?v=${V}" defer></script>
<script type="application/ld+json">
${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': `${abs(t.path)}#page`, url: abs(t.path), name: t.title, inLanguage: t.lang,
        isPartOf: { '@type': 'WebSite', name: 'Christian Culture', url: `${ORIGIN}/` }, about: { '@id': `${abs(BASE)}#playlista` } },
      { '@type': 'MusicPlaylist', '@id': `${abs(BASE)}#playlista`, name: 'Psalmy i Słowo Boże w Muzyce – Spiritual Sounds', url: YT_PLAYLIST, inLanguage: 'pl',
        creator: { '@type': 'Organization', name: 'Spiritual Sounds – Psalmy po polsku', url: YT_CHANNEL, sameAs: ['https://www.youtube.com/channel/UCaSBnRGUiiE-ySLlHacGpeQ'] } },
    ],
  }, null, 2)}
</script>
</head>
<body data-lang="${t.lang}" data-tv="${t.tv}">
<a class="skip" href="#tresc">${t.skip}</a>
<div class="tick" role="region" aria-label="${t.tickerAria}">
  <span class="tick__badge"><i aria-hidden="true"></i>${t.tickerBadge}</span>
  <div class="tick__track"><div class="tick__run" id="tickRun"></div></div>
</div>

<header class="nav" id="nav">
  <div class="wrap nav__in">
    <a class="brand" href="#start" aria-label="${t.brandAria}">
      <img src="${BASE}img/ss-emblem-360.webp" width="36" height="36" alt="">
      <b>Spiritual Sounds</b>
    </a>
    <nav aria-label="${t.navAria}">
      <ul class="menu" id="menu">
${nav}
        <li><a href="${YT_CHANNEL}" target="_blank" rel="noopener">YouTube</a></li>
      </ul>
    </nav>
    <!-- .header-right = miejsce na gwiazdkę „Ulubione” z js/cc-favorites.js (wstawiana jako pierwsza) -->
    <div class="header-right nav__actions">
      <a class="support-btn" href="/wspieraj" data-promo="nav-wspieram">${ICON.heart}<span class="support-txt">${t.support}</span></a>
      <div class="lang" role="group" aria-label="${t.langAria}">
        <a href="${T.pl.path}" hreflang="pl" lang="pl"${t.lang === 'pl' ? ' aria-current="true"' : ''}>PL</a>
        <a href="${T.en.path}" hreflang="en" lang="en"${t.lang === 'en' ? ' aria-current="true"' : ''}>EN</a>
      </div>
    </div>
    <button class="burger" type="button" aria-expanded="false" aria-controls="menu">${t.menu}</button>
  </div>
</header>

<main id="tresc">
  <section class="hero" id="start" aria-labelledby="h1">
    <div class="hero__media" aria-hidden="true"><div class="hero__yt" id="heroYt"><div id="heroPlayer"></div></div></div>
    <div class="hero__shade" aria-hidden="true"></div>
    <canvas class="hero__fx" id="heroFx" aria-hidden="true"></canvas>
    <div class="wrap hero__grid">
      <div>
        <ul class="chips" aria-label="${t.tickerAria}">
          <li class="chip"><span class="dot" aria-hidden="true"></span>${t.chips[0]}</li>
          <li class="chip chip--cc">${t.chips[1]}</li>
        </ul>
        <h1 id="h1"><span class="l"><span>${t.h1a}</span></span><span class="l"><span>${t.h1b}</span></span><span class="sub">${t.sub}</span></h1>
        <p class="claim">${t.claim}</p>
        <p class="lead">${t.lead}</p>
        <div class="cta">
          <a class="btn btn--gold" href="${t.tv}" data-promo="hero-tv">${ICON.play}${t.ctaWatch}</a>
          <a class="btn btn--ghost" href="${YT_PLAYLIST}" target="_blank" rel="noopener">${t.ctaPlaylist}</a>
          <a class="btn btn--ghost" href="${YT_CHANNEL}" target="_blank" rel="noopener">YouTube</a>
        </div>
      </div>
      <aside class="onair" aria-live="polite" aria-label="${t.onairLabel}">
        <div class="onair__top"><b><span class="dot" aria-hidden="true"></span>${t.onairLabel}</b><small id="onairTime"></small></div>
        <a class="onair__media" id="onairLink" href="${t.tv}">
          <img id="onairImg" src="${BASE}img/ss-emblem-720.webp" width="480" height="270" alt="">
          <span class="onair__eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        </a>
        <p class="onair__title" id="onairTitle">${t.onairWait}</p>
        <div class="onair__bar" aria-hidden="true"><i id="onairBar"></i></div>
        <div class="onair__row">
          <button class="btn btn--gold" type="button" id="onairSound" data-on="${t.onairSound}" data-off="${t.onairMute}">${t.onairSound}</button>
          <a class="btn btn--ghost" href="${t.tv}">${t.onairFull}</a>
        </div>
      </aside>
    </div>
  </section>

  <div class="stats" role="list">
${stats.replace(/<div class="stat/g, '<div role="listitem" class="stat')}
  </div>

  <section class="section" id="najnowsze" aria-labelledby="h-latest">
    <div class="wrap">
      <div class="rail-head reveal">
        <div>
          <p class="eyebrow">${t.latestEyebrow}</p>
          <h2 class="h2" id="h-latest">${t.latestH}</h2>
          <p class="p">${t.latestLead}</p>
        </div>
        <div class="rail-ctrl"><button type="button" id="railPrev" aria-label="${t.prev}">${ICON.left}</button><button type="button" id="railNext" aria-label="${t.next}">${ICON.right}</button></div>
      </div>
      <ul class="rail" id="rail" data-new="${t.newBadge}" data-err="${t.latestErr}" aria-live="polite">
        <li><div class="vcard"><div class="vcard__img skel"></div><div class="vcard__body"><small>&nbsp;</small><strong>&nbsp;</strong></div></div></li>
        <li><div class="vcard"><div class="vcard__img skel"></div><div class="vcard__body"><small>&nbsp;</small><strong>&nbsp;</strong></div></div></li>
        <li><div class="vcard"><div class="vcard__img skel"></div><div class="vcard__body"><small>&nbsp;</small><strong>&nbsp;</strong></div></div></li>
        <li><div class="vcard"><div class="vcard__img skel"></div><div class="vcard__body"><small>&nbsp;</small><strong>&nbsp;</strong></div></div></li>
      </ul>
    </div>
  </section>

  <section class="section" id="kanal-247" aria-labelledby="h-247">
    <div class="wrap split">
      <div class="reveal">
        <p class="eyebrow">${t.chEyebrow}</p>
        <h2 class="h2" id="h-247">${t.chH}</h2>
        <p class="lead">${t.chLead}</p>
        <p class="p">${t.chP}</p>
        <div class="cta" style="margin-top:28px"><a class="btn btn--gold" href="${t.tv}" data-promo="section-tv">${ICON.play}${t.chCta}</a></div>
      </div>
      <a class="screen reveal" href="${t.tv}" aria-label="${t.chAria}" data-tilt>
        <img id="screenImg" src="https://i.ytimg.com/vi/dFsyIS_vAVY/hqdefault.jpg" width="480" height="360" loading="lazy" decoding="async" alt="">
        <span class="screen__veil" aria-hidden="true"></span>
        <span class="chip screen__badge"><span class="dot" aria-hidden="true"></span>24/7 · non-stop</span>
        <span class="screen__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>
        <span class="screen__meta"><strong id="screenTitle">${t.chNow}</strong></span>
      </a>
    </div>
  </section>

  <section class="section mission" id="misja" aria-labelledby="h-mis">
    <span class="orb" aria-hidden="true"></span>
    <div class="wrap">
      <p class="eyebrow reveal">${t.misEyebrow}</p>
      <h2 class="h2 reveal" id="h-mis">${t.misH}</h2>
      <div class="mission__line reveal" aria-hidden="true"></div>
      <div class="split">
        <p class="mission__quote reveal">${t.misQuote}</p>
        <div class="reveal"><p class="lead">${t.misP1}</p><p class="p">${t.misP2}</p></div>
      </div>
    </div>
  </section>

  <section class="section" id="psalmy" aria-labelledby="h-ps">
    <div class="wrap">
      <div class="reveal">
        <p class="eyebrow">${t.psEyebrow}</p>
        <h2 class="h2" id="h-ps">${t.psH}</h2>
        <p class="lead">${t.psLead}</p>
        <p class="p">${t.psP}</p>
      </div>
      <div class="series reveal" aria-label="${t.seriesAria}">
${tiles}
      </div>
    </div>
  </section>

  <section class="section" id="o-projekcie" aria-labelledby="h-ab">
    <div class="wrap split">
      <div class="reveal">
        <p class="eyebrow">${t.abEyebrow}</p>
        <h2 class="h2" id="h-ab">${t.abH}</h2>
        <p class="lead">${t.abLead}</p>
        <p class="p">${t.abP}</p>
      </div>
      <ul class="facts reveal">
${facts}
      </ul>
    </div>
  </section>

  <section class="section" id="polecamy" aria-labelledby="h-promo">
    <div class="wrap">
      <div class="reveal"><p class="eyebrow">${t.promoEyebrow}</p><h2 class="h2" id="h-promo">${t.promoH}</h2></div>
      <div class="promo reveal" aria-label="${t.promoAria}">
        <div class="promo__stage" id="promoStage"></div>
        <div class="promo__side">
          <div class="promo__head">${t.promoHead}<div class="dots" id="promoDots"></div></div>
          <div class="promo__bar"><i id="promoBar"></i></div>
          <nav class="qlinks" aria-label="${t.promoAria}">
${qlinks}
          </nav>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="wspieram" aria-labelledby="h-pat">
    <div class="wrap">
      <div class="patron reveal">
        <div class="patron__grid">
          <div>
            <p class="eyebrow">${t.patEyebrow}</p>
            <h2 class="h2" id="h-pat">${t.patH}</h2>
            <p class="lead">${t.patLead}</p>
            <div class="cta">
              <a class="btn btn--cc" href="/wspieraj" data-promo="patron-wspieram">${ICON.heart}${t.patCta}</a>
              <a class="btn btn--ghost" href="https://patronite.pl/osobowoscplus" target="_blank" rel="noopener" data-promo="patron-patronite">${t.patPatronite}</a>
              <button class="btn btn--ghost" type="button" id="shareBtn" data-done="${t.shared}">${t.patShare}</button>
            </div>
          </div>
          <ul class="patron__ways">
${ways}
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="wspolpraca" aria-labelledby="h-coop">
    <div class="wrap">
      <div class="coop reveal">
        <picture>
          <source media="(max-width:900px)" srcset="${BASE}img/ss-banner-900.webp">
          <img src="${BASE}img/ss-banner-1707.webp" width="1707" height="282" loading="lazy" decoding="async" alt="${t.bannerAlt}">
        </picture>
        <div class="coop__body">
          <div>
            <p class="eyebrow">${t.coopEyebrow}</p>
            <h2 class="h2" id="h-coop">${t.coopH}</h2>
            <p class="p">${t.coopP}</p>
          </div>
          <div class="cta">
            <a class="btn btn--gold" href="${t.tv}">${ICON.play}${t.ctaWatch}</a>
            <a class="btn btn--ghost" href="${YT_CHANNEL}" target="_blank" rel="noopener">${t.coopSub}</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>

<footer class="footer">
  <div class="wrap footer__grid">
    <div>
      <h2>Spiritual Sounds</h2>
      <ul>
        <li><a href="${YT_CHANNEL}" target="_blank" rel="noopener">${t.ftLinks[0]}</a></li>
        <li><a href="${YT_PLAYLIST}" target="_blank" rel="noopener">${t.ftLinks[1]}</a></li>
        <li><a href="${t.tv}">${t.ftLinks[2]}</a></li>
      </ul>
    </div>
    <div>
      <h2>Christian Culture</h2>
      <ul>
        <li><a href="/">Christian Culture</a></li>
        <li><a href="/Global/">Christian Culture Global</a></li>
        <li><a href="/master">Christian Culture Master</a></li>
        <li><a href="/wspieraj">${t.support}</a></li>
      </ul>
    </div>
    <p style="max-width:36ch;margin:0">${t.ftNote}</p>
  </div>
</footer>
<div class="toast" id="toast" role="status"></div>
</body>
</html>
`;
}

for (const t of [T.pl, T.en]) {
  const out = path.join(ROOT, t.path.replace(/^\//, ''), 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, page(t));
  console.log('zapisano', path.relative(ROOT, out));
}
