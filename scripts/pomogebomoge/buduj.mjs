// @007 2026-11-15 — Strona „Pomogę, bo mogę” w 5 językach z jednego szablonu.
// Teksty: locales/pomogebomoge/{pl,en,de,es,fr}.json (identyczne klucze). Wygląd: scripts/pomogebomoge/strona.css.
// Wynik: pomogebomoge.html (pl) oraz pomogebomoge/{en,de,es,fr}.html.  Uruchom: node scripts/pomogebomoge/buduj.mjs
import fs from 'node:fs';
import path from 'node:path';

export const JEZYKI = ['pl', 'en', 'de', 'es', 'fr'];
const ROOT = process.cwd();
const BAZA = 'https://polskieradio.cc';
const CSS = fs.readFileSync(path.join(ROOT, 'scripts/pomogebomoge/strona.css'), 'utf8');
export const wczytaj = (j) => JSON.parse(fs.readFileSync(path.join(ROOT, `locales/pomogebomoge/${j}.json`), 'utf8'));
export const plikWyniku = (j) => (j === 'pl' ? 'pomogebomoge.html' : `pomogebomoge/${j}.html`);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MAIL = 'radiochristianculture@gmail.com';

const USLUGI = [
  ['radio', '/player', '/images/brand/cezary-wioletta-radiocc.jpg'],
  ['global', '/Global/', '/Global/assets/hero.webp'],
  ['tv', '/cctv24', '/logo_cctv.png'],
  ['bcm', '/BCM24/', '/BCM24/assets/og-bcm24.jpg'],
  ['audio', '/biblia-audio/', '/biblia-audio/assets/hero-biblia-audio.jpg'],
  ['akademia', '/akademia', '/images/academy/akademia_biblijna_logo_gold.jpg'],
  ['mojabiblia', '/mojabiblia', '/images/academy/daily/kc_day_37_obietnice_odkupienia_ramie_pana.jpg'],
  ['pobierz', '/biblia-do-pobrania', '/tlo-biblia.png'],
  ['audioteka', '/audioteka/', '/images/audioteka/audioteka-og-1200x630.jpg'],
  ['vod', '/vod', '/logo_vod_cc.jpg'],
  ['news', '/news/', '/ccn-logo-square.png'],
  ['lumina', '/lumina', '/lumina_icon.jpg'],
  ['swiadectwa', '/swiadectwa/', '/images/swiadectwa/hero-swiadectwa.jpg'],
  ['modlitwa', '/modlitwa', '/dom_modlitwy.jpg'],
  ['topten', '/topten/', '/topTEN/assets/topten-logo.png'],
  ['ogloszenia', '/ogloszenia/', '/images/ogloszenia-hero.webp'],
];

function karta(id, L, tresc, ukryta) {
  return `<div class="karta" role="tabpanel" id="p-${id}" aria-labelledby="t-${id}"${ukryta ? ' hidden' : ''}>\n${tresc}\n      </div>`;
}
const kopiuj = (L, wartosc, metoda) => `<button class="kopiuj" data-kopiuj="${esc(wartosc)}" data-ga-metoda="${metoda}">${esc(L.panel.kopiuj)}</button>`;

export function strona(j, wszystkie) {
  const L = wszystkie[j];
  const P = L.panel;
  const domyslna = P.kolejnosc[0];
  const KARTY = {
    blik: `        <h3>${esc(P.blik.h3)}</h3>
        <p>${esc(P.blik.p)}</p>
        <dl class="dane">
          <div><dt>${esc(P.blik.telefon)}</dt><dd class="duze">537 137 043</dd>${kopiuj(L, '537137043', 'blik')}</div>
          <div><dt>${esc(P.odbiorca)}</dt><dd>Cezary Rogowski</dd><span></span></div>
          <div><dt>${esc(P.tytul)}</dt><dd>Wsparcie Christian Culture</dd>${kopiuj(L, 'Wsparcie Christian Culture', 'blik_tytul')}</div>
        </dl>
        <p class="uwaga">${esc(P.blik.uwaga)}</p>`,
    przelew: `        <h3>${esc(P.przelew.h3)}</h3>
        <p>${esc(P.przelew.p)}</p>
        <dl class="dane">
          <div><dt>Rozwój Christian Culture<br />${esc(P.przelew.rozwoj)}</dt><dd class="duze">74 2910 0006 2469 8002 1062 8039</dd>${kopiuj(L, '74291000062469800210628039', 'przelew_rozwoj')}</div>
          <div><dt>Dar misyjny<br />${esc(P.przelew.dar)}</dt><dd class="duze">48 2910 0006 0000 0000 0527 2629</dd>${kopiuj(L, '48291000060000000005272629', 'przelew_dar')}</div>
          <div><dt>${esc(P.odbiorca)}</dt><dd>Cezary Rogowski</dd><span></span></div>
          <div><dt>${esc(P.tytul)}</dt><dd>${esc(P.przelew.tytulWartosc)}</dd><span></span></div>
        </dl>
        <p class="uwaga">${esc(P.przelew.uwaga)}</p>`,
    intl: `        <h3>${esc(P.intl.h3)}</h3>
        <p>${esc(P.intl.p)}</p>
        <dl class="dane">
          <div><dt>${esc(P.intl.ibanEtykieta)}</dt><dd class="duze">LT23 3250 0920 7156 6231</dd>${kopiuj(L, 'LT233250092071566231', 'iban_intl')}</div>
          <div><dt>${esc(P.intl.bicEtykieta)}</dt><dd class="duze">REVOLT21</dd>${kopiuj(L, 'REVOLT21', 'bic_revolut')}</div>
          <div><dt>${esc(P.odbiorca)}</dt><dd>Cezary Rogowski</dd><span></span></div>
          <div><dt>${esc(P.intl.bankEtykieta)}</dt><dd>${esc(P.intl.bankWartosc)}</dd><span></span></div>
          <div><dt>${esc(P.intl.korBankEur)}</dt><dd>CHASDEFX (JPMorgan Chase Frankfurt)</dd>${kopiuj(L, 'CHASDEFX', 'bic_eur')}</div>
          <div><dt>${esc(P.intl.korBankGbpUsd)}</dt><dd>CHASGB2L (JPMorgan Chase London)</dd>${kopiuj(L, 'CHASGB2L', 'bic_gbp_usd')}</div>
          <div><dt>${esc(P.tytul)}</dt><dd>${esc(P.intl.tytulWartosc)}</dd>${kopiuj(L, 'Christian Culture Mission Support', 'tytul_intl')}</div>
        </dl>
        <p class="uwaga">${esc(P.intl.uwaga)}</p>
        <a class="przycisk" href="https://revolut.me/christianculture" target="_blank" rel="noopener noreferrer" data-ga="support_external_click" data-ga-metoda="revolut_intl">${esc(P.intl.cta)}</a>`,
    patronite: `        <h3>${esc(P.patronite.h3)}</h3>
        <p>${esc(P.patronite.p)}</p>
        <a class="przycisk" href="https://patronite.pl/osobowoscplus" target="_blank" rel="noopener noreferrer" data-ga="support_external_click" data-ga-metoda="patronite">${esc(P.patronite.cta)}</a>`,
    revolut: `        <h3>${esc(P.revolut.h3)}</h3>
        <p>${esc(P.revolut.p)}</p>
        <a class="przycisk" href="https://revolut.me/christianculture" target="_blank" rel="noopener noreferrer" data-ga="support_external_click" data-ga-metoda="revolut">${esc(P.revolut.cta)}</a>`,
    zrzutka: `        <h3>${esc(P.zrzutka.h3)}</h3>
        <p>${esc(P.zrzutka.p)}</p>
        <a class="przycisk" href="https://zrzutka.pl/z/ChristianCulture" target="_blank" rel="noopener noreferrer" data-ga="support_external_click" data-ga-metoda="zrzutka_1">${esc(P.zrzutka.cta)} Christian Culture</a>
        <a class="przycisk przycisk--cichy" href="/wspieramto" data-ga="support_external_click" data-ga-metoda="wspieramto_hub">WspieramTO (/wspieramto)</a>
        <a class="przycisk przycisk--cichy" href="https://zrzutka.pl/3bbxzn" target="_blank" rel="noopener noreferrer" data-ga="support_external_click" data-ga-metoda="zrzutka_2">${esc(P.zrzutka.cta)} 3bbxzn</a>`,
  };
  const url = BAZA + L.sciezka;
  const jezyki = (cls) => `<nav class="jezyki ${cls}" aria-label="${esc(L.jezykiAria)}">${JEZYKI.map((x) => `<a href="${wszystkie[x].sciezka}" hreflang="${x}" lang="${x}" data-jezyk="${x}"${x === j ? ' aria-current="page"' : ''} title="${esc(wszystkie[x].nazwaJezyka)}">${x.toUpperCase()}</a>`).join('')}</nav>`;
  const tor = USLUGI.map(([k]) => `<span>${esc(L.uslugi[k][0])}</span><i>·</i>`).join('');
  const mailto = (temat) => `mailto:${MAIL}?subject=${encodeURIComponent(temat)}`;
  const T = { kopiuj: P.kopiuj, skopiowano: P.skopiowano, statusOk: P.statusOk, statusBlad: P.statusBlad, udostepnijCo: L.bez.udostepnijCo, udostepnijTytul: L.bez.udostepnijTytul, udostepnijTekst: L.bez.udostepnijTekst, lang: j, sciezki: Object.fromEntries(JEZYKI.map((x) => [x, wszystkie[x].sciezka])), sugestie: Object.fromEntries(JEZYKI.map((x) => [x, [wszystkie[x].sugestia.tekst, wszystkie[x].sugestia.przycisk]])) };

  return `<!DOCTYPE html>
<html lang="${j}">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y4EFTVBPE3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config','G-Y4EFTVBPE3',(function(){try{var s=location.search,k='cc_team';if(/[?&]cc_team=1/.test(s))localStorage.setItem(k,'1');if(/[?&]cc_team=0/.test(s))localStorage.removeItem(k);if(localStorage.getItem(k)==='1'||/[?&]in_mcr=1/.test(s)||window.obsstudio)return{traffic_type:'internal'}}catch(e){}return{}})());
</script><script src="/js/cc-analytics.js?v=20261026_1" defer></script>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>${esc(L.meta.title)}</title>
<meta name="description" content="${esc(L.meta.description)}" />
<link rel="canonical" href="${url}" />
${JEZYKI.map((x) => `<link rel="alternate" hreflang="${x}" href="${BAZA}${wszystkie[x].sciezka}" />`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${BAZA}${wszystkie.pl.sciezka}" />
<meta property="og:url" content="${url}" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="${{ pl: 'pl_PL', en: 'en_GB', de: 'de_DE', es: 'es_ES', fr: 'fr_FR' }[j]}" />
<meta property="og:title" content="${esc(L.meta.title)}" />
<meta property="og:description" content="${esc(L.meta.ogDescription)}" />
<meta property="og:image" content="${BAZA}/biblia-audio/assets/hero-biblia-audio.jpg" />
<meta name="theme-color" content="#07121D" />
<link rel="icon" href="/app-christian-culture.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:ital,wght@0,500;0,600;1,500&display=swap" rel="stylesheet" />
<style>
${CSS}
</style>
</head>
<body>
<div class="postep" aria-hidden="true"></div>
<a class="pomin" href="#panel">${esc(L.pomin)}</a>
<div class="sugestia" id="sugestia" hidden><span id="sugestiaTekst"></span><a id="sugestiaLink" href="#"></a><button type="button" id="sugestiaZostan"></button></div>

<header class="ramka bar">
  <a class="znak" href="/" aria-label="${esc(L.logoAria)}"><img src="/app-christian-culture.png" alt="" width="40" height="40" /><span>Christian Culture</span></a>
  <nav aria-label="${esc(L.navAria)}">
    <a href="/player">${esc(L.nav.radio)}</a><a href="/cctv24">${esc(L.nav.tv)}</a><a href="/biblia-audio">${esc(L.nav.audio)}</a><a href="/akademia">${esc(L.nav.akademia)}</a>
  </nav>
  ${jezyki('jezyki--bar')}
  <a class="przycisk" href="#panel">${esc(L.akcja)}</a>
</header>

<main>
  <section class="plansza ramka" aria-labelledby="tytul">
    <div class="plansza__tekst">
      <h1 id="tytul" class="slowa">${esc(L.hero.h1)}</h1>
      <p>${esc(L.hero.lead)}</p>
      <div class="akcje">
        <a class="przycisk" href="#panel" data-ga="support_method_select" data-ga-metoda="hero">${esc(L.akcja)}</a>
        <a class="przycisk przycisk--cichy" href="#bez-wplaty" data-ga="support_nonfinancial_select" data-ga-metoda="hero">${esc(L.hero.cta2)}</a>
      </div>
    </div>
    <a class="plansza__liczba" href="#ekosystem-tytul"><span class="plansza__nr" id="licznikUslug">${USLUGI.length}</span><span>${L.hero.liczba}</span></a>
  </section>

  <div class="pas" aria-hidden="true"><div class="pas__okno"><div class="pas__tor">${tor}${tor}</div></div></div>

  <section class="ekosystem ramka" aria-labelledby="ekosystem-tytul">
    <div class="ekosystem__gora">
      <h2 id="ekosystem-tytul" class="slowa">${esc(L.eko.h2)}</h2>
      <p data-wejscie>${L.eko.lead.replace('{dzien}', '<span id="licznikDni">46</span>')}</p>
    </div>
    <ul class="spis">
      ${USLUGI.map(([k, href, img]) => `<li data-wejscie><a href="${href}"><img src="${img}" alt="" width="96" height="96" loading="lazy" /><span><b>${esc(L.uslugi[k][0])}</b><span>${esc(L.uslugi[k][1])}</span></span><i aria-hidden="true">→</i></a></li>`).join('\n      ')}
    </ul>
  </section>

  <div class="ramka" style="margin-bottom: 24px;">
    <a href="https://polskieradio.cc/wspieraj#przelewy-zagraniczne" target="_blank" rel="noopener" style="display:block;border-radius:16px;overflow:hidden;border:1px solid rgba(212,169,74,0.35);box-shadow:0 10px 28px rgba(0,0,0,0.6);" title="Supporting from Abroad?">
      <img src="/images/banners/banner-global-support.jpg" alt="Supporting from Abroad? Send direct SEPA/SWIFT donations in GBP, EUR or USD without conversion fees." style="width:100%;height:auto;display:block;" loading="lazy" />
    </a>
  </div>

  <section class="panel ramka" id="panel" aria-labelledby="panel-tytul">
    <div class="panel__bok" data-wejscie>
      <h2 id="panel-tytul" class="slowa">${esc(P.h2)}</h2>
      <p>${esc(P.lead)}</p>
      <p class="cichy">${esc(P.uwaga)}</p>
    </div>
    <div data-wejscie>
      <div class="zakladki" role="tablist" aria-label="${esc(P.tabsAria)}">
        ${P.kolejnosc.map((id) => `<button role="tab" id="t-${id}" aria-controls="p-${id}" aria-selected="${id === domyslna}"${id === domyslna ? '' : ' tabindex="-1"'}>${esc(P.tabs[id])}</button>`).join('\n        ')}
      </div>

      ${P.kolejnosc.map((id) => karta(id, L, KARTY[id], id !== domyslna)).join('\n\n      ')}
      <p class="status" id="status" role="status" aria-live="polite"></p>
    </div>
  </section>

  <section class="bez ramka" id="bez-wplaty" aria-labelledby="bez-tytul">
    <h2 id="bez-tytul" data-wejscie>${esc(L.bez.h2a)}<span>${esc(L.bez.h2b)}</span></h2>
    <div class="bez__uklad">
      <figure data-wejscie><img src="/biblia-audio/assets/hero-biblia-audio.jpg" alt="${esc(L.bez.figAlt)}" width="1600" height="900" loading="lazy" /></figure>
      <p class="bez__nazwa">${esc(L.bez.nazwa)}</p>
      <ul class="wiersze">
        <li data-wejscie><a href="/modlitwa" data-ga="support_nonfinancial_select" data-ga-metoda="modlitwa"><b>${esc(L.bez.modlitwa[0])}</b><span class="cichy">${esc(L.bez.modlitwa[1])}</span><i aria-hidden="true">→</i></a></li>
        <li data-wejscie><button type="button" id="udostepnij" data-ga="support_nonfinancial_select" data-ga-metoda="udostepnij"><b>${esc(L.bez.udostepnij[0])}</b><span class="cichy">${esc(L.bez.udostepnij[1])}</span><i aria-hidden="true">→</i></button></li>
        ${['wolontariat', 'partnerstwo', 'sprzet'].map((k) => `<li data-wejscie><a href="${mailto(L.bez[k][2])}" data-ga="support_nonfinancial_select" data-ga-metoda="${k}"><b>${esc(L.bez[k][0])}</b><span class="cichy">${esc(L.bez[k][1])}</span><i aria-hidden="true">→</i></a></li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="ktory ramka" aria-label="${esc(L.ktory.aria)}">
    <div class="ktory__fakty">
      <b>${esc(L.ktory.odbiorca)}</b>Cezary Rogowski
      <b>${esc(L.ktory.forma)}</b>${esc(L.ktory.formaWartosc)}
      <b>${esc(L.ktory.kontakt)}</b><a class="link" href="mailto:${MAIL}">${esc(L.ktory.kontaktLink)}</a>
    </div>
    <div class="ktory__tekst" data-wejscie>
      <p><img src="/images/team/cezary-rogowski.webp" alt="Cezary Rogowski" width="400" height="400" loading="lazy" />${L.ktory.p1}</p>
      <p>${esc(L.ktory.p2)}</p>
    </div>
  </section>

  <section class="pytania ramka" aria-labelledby="pytania-tytul">
    <h2 id="pytania-tytul" class="slowa">${esc(L.faq.h2)}</h2>
    <div class="pytania__lista">
      ${L.faq.items.map(([q, a]) => `<details data-wejscie><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n      ')}
    </div>
  </section>

  <section class="koniec" aria-labelledby="koniec-tytul">
    <div class="ramka">
      <h2 id="koniec-tytul" class="slowa">${esc(L.koniec.h2)}</h2>
      <div class="koniec__dol">
        <blockquote><p>${esc(L.koniec.cytat)}</p><footer>${esc(L.koniec.zrodlo)}</footer></blockquote>
        <a class="przycisk" href="#panel">${esc(L.akcja)}</a>
      </div>
    </div>
  </section>
</main>

<footer class="stopka">
  <div class="ramka">
    <div class="stopka__gora"><span>${esc(L.stopka.opis)}</span><a class="link" href="#tytul">${esc(L.stopka.doGory)}</a></div>
    ${jezyki('jezyki--stopka')}
    <a class="stopka__mail" href="mailto:${MAIL}">radiochristianculture<wbr>@gmail.com</a>
    <p class="stopka__meta"><a class="link" href="/privacy.html">${esc(L.stopka.prywatnosc)}</a><span>${esc(L.stopka.grafiki)}</span><span>polskieradio.cc · 2026</span></p>
  </div>
</footer>

<script>window.PBM = ${JSON.stringify(T).replace(/</g, '\\u003c')};</script>
<script>
${fs.readFileSync(path.join(ROOT, 'scripts/pomogebomoge/strona.js'), 'utf8')}
</script>
</body>
</html>
`;
}

if (process.argv[1].endsWith('buduj.mjs')) {
  const wszystkie = Object.fromEntries(JEZYKI.map((j) => [j, wczytaj(j)]));
  fs.mkdirSync(path.join(ROOT, 'pomogebomoge'), { recursive: true });
  for (const j of JEZYKI) {
    fs.writeFileSync(path.join(ROOT, plikWyniku(j)), strona(j, wszystkie));
    console.log('zapisano', plikWyniku(j));
  }
}
