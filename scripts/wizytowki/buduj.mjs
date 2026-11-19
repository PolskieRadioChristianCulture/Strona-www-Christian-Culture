// Wizytówki Christian Culture — generator wersji premium v2 (PRODUKCJA po ✅ L0 18.11.2026), @007.
// Źródło: data/wizytowki-katalog.json  →  wizytowki/index.html + wizytowki.html (katalog), wizytowka/index.html + wizytowka.html (nabór).
// Zasada L0 18.11.2026: prywatnych profili LUMINA nie promujemy; martwe linki usuwamy.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'wizytowki-katalog.json'), 'utf8'));
const V = '20261118_1';
const ORIGIN = 'https://polskieradio.cc';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Kadr zdjęcia (L0 18.11): punkt kadru na twarz/oczy, logotypy w całości.
const imgStyle = (k) => { const st = []; if (k.pos) st.push(`object-position:${k.pos}`); if (k.fit) st.push(`object-fit:${k.fit}`); return st.length ? ` style="${st.join(';')}"` : ''; };
const imgCls = (k) => (k.fit === 'contain' ? ' class="is-logo"' : '');
const cards = DATA.karty;
const cats = DATA.kategorie;
const primaryCount = (id) => cards.filter((k) => k.cats[0] === id).length;
const anyCount = (id) => cards.filter((k) => k.cats.includes(id)).length;
const total = cards.length;
const artists = cards.filter((k) => k.cats.includes('artysci'));

// Repertuar radia — identyczny jak na /wizytówka (test wizytowka-radio-repertoire pilnuje źródła).
const STATIONS = [
  { name: 'Polskie Radio CC', short: 'Radio CC', nativeId: 'poland', live: true },
  { name: 'Biblia Audio po polsku', short: 'Biblia PL', nativeId: 'biblia_audio', live: true },
  { name: 'Wykłady — Studio Dobrego Słowa', short: 'Wykłady', yt: 'PLDA6geI28g8T0x5fNBe-WkTdZDgz5IYlR' },
  { name: 'Radio Muzyka', short: 'Muzyka', yt: 'PL2hyFNkHB21aWs336brvfXgHizPc6y0Z0' },
  { name: 'Radio Słowo', short: 'Słowo', yt: 'PL2hyFNkHB21b9DNCiEfWXc47fKEUxjgi7' },
  { name: 'Clash of Minds — Total Onslaught', short: 'Clash', yt: 'PLdbXyyVfVp-4HzN5_phwe1cU_WkfGakIm' },
  { name: 'Biblijny Czas Modlitwy', short: 'Modlitwa BCM', yt: 'PLQBdxcl9HBc98HweGapf1brLPQBTf-6eN' },
  { name: 'Radio Global — muzyka po angielsku', short: 'Global EN', nativeId: 'global', live: true },
  { name: 'Instrumental Worship', short: 'Instrumental', nativeId: 'instrumental_worship' },
  { name: 'Biblia Śpiewana', short: 'Śpiewana', nativeId: 'biblia_spiewana' },
  { name: 'Biblia po angielsku — World English Bible', short: 'Biblia EN', nativeId: 'global_biblia' },
];

const TICKER = [
  { id: 'katalog', b: 'Katalog', t: `<strong>${total} wizytówek</strong> twórców, artystów, kanałów i służb`, href: '/wizytówki' },
  { id: 'artysci', b: 'Nowość', t: `Artyści i zespoły: <strong>${artists.map((a) => esc(a.title)).join(' · ')}</strong>`, href: '/wizytówki#artysci' },
  { id: 'zglos', cc: true, b: 'Bezpłatnie', t: 'Zgłoś swoją wizytówkę — <strong>0 zł</strong>, grupa WhatsApp', href: '/wizytówka#zglos' },
  { id: 'wspieraj', cc: true, b: 'Wspieram to', t: 'Pomóż nieść Ewangelię dalej — <strong>polskieradio.cc/wspieraj</strong>', href: '/wspieraj' },
  { id: 'ss', b: 'Kanał 24/7', t: 'Spiritual Sounds — Psalmy non-stop', href: '/SpiritualSounds/tv/' },
  { id: 'radio', b: 'Radio', t: 'Polskie Radio CC, Biblia Audio i Radio Global 24/7', href: '/player' },
  { id: 'lumina', b: 'LUMINA', t: 'Społeczność ludzi wiary', href: '/lumina' },
];

const GA = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y4EFTVBPE3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config','G-Y4EFTVBPE3',(function(){try{var s=location.search,k='cc_team';if(/[?&]cc_team=1/.test(s))localStorage.setItem(k,'1');if(/[?&]cc_team=0/.test(s))localStorage.removeItem(k);if(localStorage.getItem(k)==='1'||/[?&]in_mcr=1/.test(s)||window.obsstudio)return{traffic_type:'internal'}}catch(e){}return{}})());
</script><script src="/js/cc-analytics.js?v=20261026_1" defer></script>`;

const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z"/></svg>';
const WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.2.5.1.6-.1l.9-1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>';

function head({ title, desc, canonical, og }) {
  return `<!doctype html>
<html lang="pl" class="no-js">
<head>
${GA}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<!-- WYGENEROWANE: scripts/wizytowki/buduj.mjs z data/wizytowki-katalog.json — nie edytuj ręcznie. PRODUKCJA (✅ L0 18.11.2026). -->
<meta name="robots" content="index,follow">
<meta name="theme-color" content="#050507">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${ORIGIN}${canonical}">
<meta property="og:type" content="website">
<meta property="og:locale" content="pl_PL">
<meta property="og:site_name" content="Christian Culture">
<meta property="og:title" content="${esc(title.split(' | ')[0])}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${ORIGIN}${canonical}">
<meta property="og:image" content="${ORIGIN}${og}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/app-christian-culture.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Manrope:wght@400;600;700;800&display=swap">
<link rel="stylesheet" href="/css/cc-mobile-edge.css?v=20261113_edge13">
<link rel="stylesheet" href="/wizytowki/wz.css?v=${V}">
<script src="/js/cc-global-auth.js?v=20261116_a007_auth" defer></script>
<script src="/js/cc-favorites.js?v=20261114_favz1" defer></script>
<script src="/js/cc-mobile-edge.js?v=20261110_edge12" defer></script>
<script src="/js/cc-edge-plus.js?v=20261110_edgep2" defer></script>
<script src="/components/cc-omni-search.js?v=20261030_feat11" defer></script>
<script src="/components/cc-global-chat-button.js?v=20261119_gold1" defer></script>
<script src="/js/cc-back-to-top.js?v=20261116_btt5" defer></script>
<script src="/components/cc-support-footer.js?v=20261119_gold1" defer></script>
<script src="/js/cc-eco-bars.js?v=${V}" defer></script>
<script src="/wizytowki/wz.js?v=${V}" defer></script>`;
}

function topbar(active) {
  const links = active === 'katalog'
    ? [['#artysci', 'Artyści', true], ['#kanaly', 'Kanały 24/7'], ['#ksiazki', 'Książki'], ['#kaciki', 'Kąciki'], ['#sluzby', 'Służby'], ['/wizytówka#zglos', 'Zgłoś wizytówkę']]
    : [['#zglos', 'Zgłoś się', true], ['#artysci', 'Artyści'], ['#radio', 'Radio'], ['#lumina', 'LUMINA'], ['/wizytówki', `Katalog (${total})`]];
  return `<a class="skip" href="#tresc">Przejdź do treści</a>
<div class="tick" role="region" aria-label="Pasek informacyjny">
  <span class="tick__badge"><i aria-hidden="true"></i>Wizytówki CC</span>
  <div class="tick__track"><div class="tick__run" id="tickRun"></div></div>
</div>
<header class="nav" id="nav">
  <div class="wrap nav__in">
    <a class="brand" href="/" aria-label="Christian Culture — strona główna">
      <img src="/app-christian-culture.png" width="38" height="38" alt="">
      <span><b>Christian Culture</b><small>Wizytówki</small></span>
    </a>
    <nav aria-label="Nawigacja strony"><ul class="menu" id="menu">
${links.map(([h, t, hot]) => `      <li><a${hot ? ' class="is-hot"' : ''} href="${h}">${t}</a></li>`).join('\n')}
    </ul></nav>
    <!-- .header-right = miejsce na gwiazdkę „Ulubione” z js/cc-favorites.js -->
    <div class="header-right nav__actions">
      <a class="support-btn" href="/wspieraj" data-track="nav-wspieram">${HEART}<span class="support-txt">Wspieram to</span></a>
    </div>
    <button class="burger" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
  </div>
</header>`;
}

function ring(list) {
  const items = list.slice(0, 12);
  const n = items.length;
  return `<div class="ring" aria-hidden="true" style="--spin:${n * 5}s">
        <span class="ring__glow"></span>
        <div class="ring__spin">
${items.map((k, i) => `          <a class="ring__card" tabindex="-1" href="${esc(k.href)}" style="--a:${(360 / n * i).toFixed(1)}deg;--r:clamp(180px,24vw,320px);--w:clamp(110px,12vw,170px);--h:clamp(150px,16vw,230px)"><img src="${esc(k.img)}"${imgCls(k)}${imgStyle(k)} alt="" loading="lazy" decoding="async"><span>${esc(k.title)}</span></a>`).join('\n')}
        </div>
        <img class="ring__logo" src="/app-christian-culture.png" width="150" height="150" alt="">
      </div>`;
}

function card(k, catId) {
  const primary = k.cats[0] === catId ? '1' : '0';
  return `        <a class="card" href="${esc(k.href)}" data-card data-primary="${primary}" data-cats="${esc(k.cats.join(' '))}" data-kw="${esc(`${k.title} ${k.eyebrow} ${k.desc} ${k.kw}`)}" data-track="karta-${esc(k.id)}" data-tilt>
          <div class="card__img"><img src="${esc(k.img)}"${imgCls(k)}${imgStyle(k)} alt="" loading="lazy" decoding="async"><span class="card__url">${esc(decodeURI(k.href).replace(/\/$/, ''))}</span></div>
          <div class="card__body"><small>${esc(k.eyebrow)}</small><h3>${esc(k.title)}</h3><p>${esc(k.desc)}</p><span class="card__go">Otwórz wizytówkę</span></div>
        </a>`;
}

function artistCards() {
  return artists.map((k) => `      <a class="acard" href="${esc(k.href)}" data-track="artysta-${esc(k.id)}" data-tilt>
        <img src="${esc(k.img)}"${imgCls(k)}${imgStyle(k)} alt="" loading="lazy" decoding="async">
        ${k.lang ? `<span class="lang-badge">${esc(k.lang)}</span>` : ''}
        <small>${esc(k.eyebrow)}</small><h3>${esc(k.title)}</h3><p>${esc(k.desc)}</p>
      </a>`).join('\n');
}

function promoAndPatron() {
  return `  <section class="section" id="polecamy" aria-labelledby="h-promo">
    <div class="wrap">
      <div class="reveal"><p class="eyebrow">Christian Culture</p><h2 class="h2" id="h-promo">Polecamy <em>w ekosystemie</em></h2></div>
      <div class="promo reveal">
        <div class="promo__stage" id="promoStage"></div>
        <div class="promo__side">
          <div class="promo__head">★ POLECAMY<div class="dots" id="promoDots"></div></div>
          <div class="promo__bar"><i id="promoBar"></i></div>
          <nav class="qlinks" aria-label="Szybkie linki">
            <a href="/player" data-track="q-player">Radio CC 24/7<span>Słuchaj →</span></a>
            <a href="/master" data-track="q-master">Telewizja CC<span>Oglądaj →</span></a>
            <a href="/lumina" data-track="q-lumina">LUMINA<span>Społeczność →</span></a>
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
            <p class="eyebrow">Patronat</p>
            <h2 class="h2" id="h-pat">Wizytówki są <em>za darmo</em> dzięki ludziom</h2>
            <p class="lead">Przygotowanie i utrzymanie każdej wizytówki kosztuje 0 zł — bo misję wspierają ludzie dobrej woli. Dołącz do nich.</p>
            <div class="cta">
              <a class="btn btn--cc" href="/wspieraj" data-track="patron-wspieram">${HEART}Wspieram to</a>
              <a class="btn btn--ghost" href="https://patronite.pl/osobowoscplus" target="_blank" rel="noopener" data-track="patron-patronite">Zostań patronem</a>
              <button class="btn btn--ghost" type="button" data-share>Udostępnij</button>
            </div>
          </div>
          <img class="qr" src="/wizytowka/img/qr-zloty.webp" width="720" height="720" loading="lazy" alt="Złoty kod QR prowadzący do strony polskieradio.cc/wizytówka">
        </div>
      </div>
    </div>
  </section>`;
}

function footer() {
  return `<footer class="footer">
  <div class="wrap footer__grid">
    <div><h2>Wizytówki</h2><ul><li><a href="/wizytówki">Katalog wizytówek</a></li><li><a href="/wizytówka#zglos">Zgłoś wizytówkę</a></li><li><a href="${esc(DATA.whatsapp)}" target="_blank" rel="noopener">Grupa WhatsApp</a></li></ul></div>
    <div><h2>Christian Culture</h2><ul><li><a href="/">Strona główna</a></li><li><a href="/master">Telewizja CC</a></li><li><a href="/Global/">Christian Culture Global</a></li><li><a href="/wspieraj">Wspieram to</a></li></ul></div>
    <p style="max-width:40ch;margin:0">Każda wizytówka powstaje na zgłoszenie i za zgodą jej właściciela. Razem możemy więcej — ku chwale Boga i dla dobra ludzi.</p>
  </div>
</footer>
<div class="toast" id="toast" role="status"></div>`;
}

function dataScript(extra) {
  return `<script type="application/json" id="wzData">${JSON.stringify({ ticker: TICKER, whatsapp: DATA.whatsapp, ...extra }).replace(/</g, '\\u003c')}</script>`;
}

// ---------- KATALOG ----------
function katalog() {
  const filters = [`<button class="fbtn" type="button" data-f="all" aria-pressed="true">Wszystkie <b>${total}</b></button>`]
    .concat(cats.map((c) => `<button class="fbtn${c.id === 'artysci' || c.id === 'kanaly' || c.id === 'ksiazki' ? ' is-new' : ''}" type="button" data-f="${c.id}" aria-pressed="false">${esc(c.nazwa)} <b>${anyCount(c.id)}</b></button>`));
  const sections = cats.map((c) => {
    const list = cards.filter((k) => k.cats.includes(c.id));
    return `      <div class="cat reveal" id="${c.id}" data-cat="${c.id}">
        <div class="cat__head"><h2>${esc(c.nazwa)}</h2><p>${esc(c.opis)}</p></div>
        <div class="grid">
${list.map((k) => card(k, c.id)).join('\n')}
        </div>
      </div>`;
  }).join('\n');
  const html = `${head({ title: 'Wizytówki Christian Culture — artyści, twórcy, kanały i służby | Katalog', desc: `Katalog ${total} wizytówek Christian Culture: artyści i zespoły z Polski i ze świata, kanały 24/7, książki, kąciki ewangelizacyjne i służby.`, canonical: '/wizytowki', og: '/wizytowka/img/og-wizytowka.jpg' })}
</head>
<body data-page="katalog">
${topbar('katalog')}
<main id="tresc">
  <section class="hero" aria-labelledby="h1">
    <div class="hero__bg" aria-hidden="true"></div>
    <canvas class="hero__fx" id="heroFx" aria-hidden="true"></canvas>
    <div class="wrap hero__grid">
      <div>
        <ul class="chips" aria-label="Oznaczenia"><li class="chip"><span class="dot" aria-hidden="true"></span>${total} wizytówek</li><li class="chip">Nowość: artyści i zespoły</li></ul>
        <h1 id="h1"><span class="l"><span>Wizytówki</span></span><span class="l"><span>Christian Culture</span></span></h1>
        <p class="lead">Ludzie, muzyka, książki i kanały, które niosą Ewangelię — w Polsce i na świecie. Znajdź artystę, kącik, służbę albo kanał 24/7.</p>
        <label class="search"><span class="vh">Szukaj wizytówki</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
          <input id="wizytowkiSearch" type="search" placeholder="Szukaj: rock, Psalmy, modlitwa, książka…" autocomplete="off" aria-describedby="qInfo">
        </label>
        <p id="qInfo" class="vh">Wyniki: <span id="qCount">${total}</span></p>
      </div>
${ring(cards.filter((k) => k.cats[0] !== 'kanaly' || k.id === 'ss-tv'))}
    </div>
  </section>

  <div class="stats" role="list">
    <div role="listitem" class="stat reveal"><strong><span class="reel" data-reel="${total}">${total}</span></strong><small>wizytówek w katalogu</small></div>
    <div role="listitem" class="stat reveal"><strong><span class="reel" data-reel="${artists.length}">${artists.length}</span></strong><small>artystów i zespołów</small></div>
    <div role="listitem" class="stat reveal"><strong><span class="reel" data-reel="${anyCount('kanaly')}">${anyCount('kanaly')}</span></strong><small>kanałów i społeczności</small></div>
    <div role="listitem" class="stat reveal"><strong><span class="reel" data-reel="0">0</span><span> zł</span></strong><small>koszt wizytówki</small></div>
  </div>

  <section class="section spot" aria-labelledby="h-art">
    <div class="wrap">
      <div class="head reveal"><div><p class="eyebrow">Nowość w katalogu</p><h2 class="h2" id="h-art">Artyści <em>i zespoły</em></h2><p class="p">Muzyka chrześcijańska z Polski i ze świata — wizytówki publikowane za zgodą artystów.</p></div></div>
      <div class="artists reveal">
${artistCards()}
      </div>
    </div>
  </section>

  <div class="filters" role="toolbar" aria-label="Filtr kategorii"><div class="wrap filters__in">${filters.join('')}</div></div>

  <section class="section" id="katalog" aria-label="Wszystkie wizytówki" style="padding-top:48px">
    <div class="wrap">
${sections}
      <p class="empty" id="empty" hidden>Nic nie znaleźliśmy. Spróbuj innego słowa albo <a href="/wizytówka#zglos">zgłoś własną wizytówkę</a>.</p>
      <div class="cta reveal" style="margin-top:48px;justify-content:center">
        <a class="btn btn--cc" href="/wizytówka#zglos" data-track="katalog-zglos">Zgłoś swoją wizytówkę — 0 zł</a>
        <a class="btn btn--wa" href="${esc(DATA.whatsapp)}" target="_blank" rel="noopener" data-track="katalog-whatsapp">${WA}Grupa WhatsApp</a>
      </div>
    </div>
  </section>

${promoAndPatron()}
</main>
${footer()}
${dataScript({})}
</body>
</html>
`;
  return html;
}

// ---------- NABÓR (/wizytówka) ----------
function nabor() {
  const featured = cards.filter((k) => !k.cats.includes('artysci') && ['zaneta', 'ewa', 'coaching', 'herbatka', 'heatfix', 'wioletta'].includes(k.id));
  const fields = ['Twórczość & Muzyka', 'Książki & Publicystyka', 'Filmy, Podcasty & Media', 'Służba & Ewangelizacja', 'Działalność & Rzemiosło z Wartościami'];
  const html = `${head({ title: 'Wizytówki Christian Culture — Twoja misja ma znaczenie! | polskieradio.cc/wizytówka', desc: 'Bezpłatna wizytówka w ekosystemie Christian Culture dla chrześcijańskich twórców, artystów, autorów, służb i firm z wartościami. Zgłoś się na WhatsAppie.', canonical: '/wizytowka', og: '/wizytowka/img/og-wizytowka.jpg' })}
<script src="/js/cc-radio-catalog.js?v=20261025_repertoire" defer></script>
<script src="/js/cc-chat-radio.js?v=20261026_spectrum1" defer></script>
<script src="/js/cc-radio-milion.js?v=20261024_playing" defer></script>
</head>
<body data-page="nabor">
${topbar('nabor')}
<main id="tresc">
  <section class="hero" aria-labelledby="h1">
    <div class="hero__bg" aria-hidden="true"></div>
    <canvas class="hero__fx" id="heroFx" aria-hidden="true"></canvas>
    <div class="wrap hero__grid">
      <div>
        <ul class="chips" aria-label="Oznaczenia"><li class="chip"><span class="dot" aria-hidden="true"></span>Bezpłatna promocja</li><li class="chip">${total} aktywnych wizytówek</li></ul>
        <h1 id="h1"><span class="l"><span>Twoja misja</span></span><span class="l"><span>ma znaczenie.</span></span></h1>
        <p class="lead">Masz coś wartościowego do przekazania światu? Tworzysz muzykę, piszesz, nagrywasz, prowadzisz służbę albo firmę z wartościami? Przygotujemy dla Ciebie bezpłatną wizytówkę w ekosystemie Christian Culture.</p>
        <div class="cta">
          <a class="btn btn--wa" href="${esc(DATA.whatsapp)}" target="_blank" rel="noopener" data-track="hero-whatsapp">${WA}Dołącz do grupy WhatsApp</a>
          <a class="btn btn--cc" href="#zglos" data-track="hero-kreator">Przygotuj zgłoszenie</a>
          <a class="btn btn--ghost" href="/wizytówki" data-track="hero-katalog">Katalog ${total} wizytówek</a>
        </div>
      </div>
${ring(cards)}
    </div>
  </section>

  <section class="section" aria-labelledby="h-ben" style="padding-bottom:40px">
    <div class="wrap">
      <div class="benefits reveal">
        <div class="benefit"><strong><span class="reel" data-reel="0">0</span> zł</strong><span>Całkowicie bezpłatne przygotowanie i utrzymanie wizytówki.</span></div>
        <div class="benefit"><strong><span class="reel" data-reel="${total}">${total}</span></strong><span>Aktywnych wizytówek artystów, twórców, kanałów, książek i służb.</span></div>
        <div class="benefit"><strong>/TwojaMisja</strong><span>Własny krótki adres i złoty kod QR gotowy do druku.</span></div>
        <div class="benefit"><strong>24/7</strong><span>Obecność w katalogu, wyszukiwarce, LUMINA i audycjach radia CC.</span></div>
      </div>
      <h2 class="vh" id="h-ben">Co otrzymujesz</h2>
    </div>
  </section>

  <section class="section" aria-labelledby="h-steps" style="padding-top:40px">
    <div class="wrap">
      <div class="reveal"><p class="eyebrow">Jak to działa</p><h2 class="h2" id="h-steps">Trzy kroki <em>do premiery</em></h2><p class="p">Nie musisz być znany, aby robić rzeczy wielkie w oczach Boga.</p></div>
      <div class="steps reveal">
        <div class="step"><small>Krok 1 · Dołącz</small><h3>Wejdź na grupę WhatsApp</h3><p>Dołącz do oficjalnej grupy zgłoszeniowej Wizytówki Christian Culture.</p></div>
        <div class="step"><small>Krok 2 · Przedstaw się</small><h3>Napisz o swojej misji</h3><p>Kim jesteś, czym się zajmujesz (muzyka, książki, film, podcast, służba, rzemiosło) i co chcesz pokazać.</p></div>
        <div class="step"><small>Krok 3 · Premiera</small><h3>Odbierz wizytówkę</h3><p>Przygotujemy bezpłatną stronę pod adresem polskieradio.cc/TwojaNazwa i dodamy ją do katalogu.</p></div>
      </div>
    </div>
  </section>

  <section class="section" id="zglos" aria-labelledby="h-zglos">
    <div class="wrap">
      <div class="reveal"><p class="eyebrow">Kreator na żywo</p><h2 class="h2" id="h-zglos">Przygotuj zgłoszenie <em>w minutę</em></h2><p class="p">Wpisz kilka słów — od razu zobaczysz podgląd swojej karty w katalogu. Jednym kliknięciem skopiujesz gotową wiadomość i otworzysz grupę WhatsApp.</p></div>
      <div class="creator reveal">
        <div class="form">
          <label>Twoje imię, zespół lub nazwa inicjatywy<input id="cName" maxlength="60" placeholder="np. Zespół Arka Nadziei" autocomplete="off"></label>
          <label>Dziedzina<select id="cField">${fields.map((x) => `<option>${esc(x)}</option>`).join('')}</select></label>
          <label>Czym się zajmujesz i co chcesz pokazać?<textarea id="cDesc" maxlength="400" placeholder="Kilka zdań o Twojej twórczości, służbie lub działalności…"></textarea></label>
          <div class="cta">
            <button class="btn btn--wa" type="button" id="cWa">${WA}Skopiuj i otwórz WhatsApp</button>
            <button class="btn btn--ghost" type="button" id="cCopy">Skopiuj sam tekst</button>
          </div>
        </div>
        <div class="preview" aria-live="polite">
          <div class="card">
            <div class="card__img"><img src="/wizytowka/img/kacik-wide.webp" alt="" loading="lazy"><span class="card__url" id="pUrl">polskieradio.cc/TwojaMisja</span></div>
            <div class="card__body"><small id="pField">Twórczość &amp; Muzyka</small><h3 id="pName">Twoja Misja w Christian Culture</h3><p id="pDesc"></p><span class="card__go">Otwórz wizytówkę</span></div>
          </div>
          <p class="preview__note">Tak będzie wyglądać Twoja karta w katalogu. Stronę przygotujemy razem z Tobą — dopiero po Twojej akceptacji.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section spot" id="artysci" aria-labelledby="h-art">
    <div class="wrap">
      <div class="head reveal"><div><p class="eyebrow">Zobacz przykłady</p><h2 class="h2" id="h-art">Artyści <em>i zespoły</em></h2><p class="p">Wizytówki artystów z Polski i ze świata — publikowane za ich zgodą.</p></div><a class="btn btn--ghost" href="/wizytówki#artysci">Wszyscy artyści</a></div>
      <div class="artists reveal">
${artistCards()}
      </div>
      <div class="head reveal" style="margin-top:56px"><div><h2 class="h2" style="font-size:clamp(28px,3.2vw,40px)">Twórcy, kąciki <em>i służby</em></h2></div><a class="btn btn--ghost" href="/wizytówki">Cały katalog (${total})</a></div>
      <div class="grid reveal">
${featured.map((k) => card(k, k.cats[0])).join('\n')}
      </div>
    </div>
  </section>

  <section class="section" id="radio" aria-labelledby="h-radio">
    <div class="wrap radio">
      <div class="reveal">
        <p class="eyebrow">Radio i nagrania CC</p><h2 class="h2" id="h-radio">Posłuchaj <em>tutaj</em></h2>
        <p class="p">Polskie Radio CC, Biblia Audio i Radio Global na żywo, a do tego instrumental, Biblia śpiewana, Biblia po angielsku, modlitwy i wykłady.</p>
        <div class="stations" role="group" aria-label="Wybór stacji">
${STATIONS.map((s, i) => `          <button class="station" type="button" aria-pressed="${i === 0 ? 'true' : 'false'}">${esc(s.short)}${s.live ? '<span class="live">24/7</span>' : ''}</button>`).join('\n')}
        </div>
      </div>
      <div class="deck reveal" id="deck">
        <small class="eyebrow" style="margin:0">Teraz wybrane</small>
        <p class="deck__now" id="deckNow"></p>
        <div class="eqbars" aria-hidden="true">${'<i></i>'.repeat(18)}</div>
        <div class="cta"><button class="btn btn--cc" type="button" id="deckPlay">Słuchaj tutaj</button><a class="btn btn--ghost" href="/player" data-track="radio-pelny">Pełny odtwarzacz</a></div>
        <p class="deck__status" id="deckStatus" aria-live="polite">Wybierz stację i naciśnij „Słuchaj tutaj”.</p>
        <div class="yt-wrap" id="ytWrap" hidden><div id="ytBox"></div></div>
      </div>
    </div>
  </section>

  <section class="section" id="lumina" aria-labelledby="h-lum">
    <div class="wrap radio">
      <div class="reveal">
        <p class="eyebrow">Społeczność</p><h2 class="h2" id="h-lum">LUMINA — <em>ludzie wiary</em></h2>
        <p class="lead">Chrześcijański portal relacji, twórców i wartości: tablica świadectw, komunikator LUMI Messenger i Biblijny Czas Modlitwy 24/7.</p>
        <div class="cta"><a class="btn btn--cc" href="/lumina" data-track="lumina">Zobacz LUMINA</a></div>
      </div>
      <div class="reveal">
        <button class="vfacade" type="button" id="vFacade" data-id="Qx-WxB4h6zM" aria-label="Odtwórz piosenkę Dobrze, że jesteś (YouTube)">
          <img src="https://i.ytimg.com/vi/Qx-WxB4h6zM/hqdefault.jpg" width="480" height="360" alt="" loading="lazy">
          <span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>
        </button>
        <p class="p" style="margin-top:12px">„Dobrze, że jesteś” — piosenka o wartości człowieka, Bożej miłości i wspólnocie Christian Culture.</p>
      </div>
    </div>
  </section>

  <section class="section" id="milion" aria-labelledby="h-mil" style="padding-top:20px">
    <div class="wrap">
      <div class="reveal"><p class="eyebrow">Razem możemy więcej</p><h2 class="h2" id="h-mil">Misja <em>w liczbach</em></h2></div>
      <div class="benefits reveal">
        <div class="benefit"><strong data-count>—</strong><span>osób w liczniku „Celujemy w Pierwszy Milion”, stan na żywo · <a href="/milion" data-track="milion" style="color:var(--cc2)">Pierwszy Milion</a></span></div>
        <div class="benefit"><strong>24/7</strong><span>radio, telewizja i wsparcie bez przerwy i bez opłat</span></div>
        <div class="benefit"><strong>0 zł</strong><span>za przygotowanie i publikację Twojej wizytówki</span></div>
        <div class="benefit"><strong>${total}</strong><span>wizytówek w katalogu — <a href="/wizytówki" style="color:var(--cc2)">zobacz wszystkie</a></span></div>
      </div>
    </div>
  </section>

${promoAndPatron()}
</main>
${footer()}
${dataScript({ stations: STATIONS })}
</body>
</html>
`;
  return html;
}

const K = katalog(), N = nabor();
for (const [rel, html] of [['wizytowki/index.html', K], ['wizytowki.html', K], ['wizytowka/index.html', N], ['wizytowka.html', N]]) {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log('zapisano', rel);
}
