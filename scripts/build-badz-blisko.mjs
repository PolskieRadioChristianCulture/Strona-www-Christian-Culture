import fs from 'fs';
import path from 'path';

function getHtml(canonicalUrl) {
  return `<!doctype html>
<html lang="pl">
<head>
<!-- Google tag (gtag.js) GA4 Standard EkoCC -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y4EFTVBPE3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config','G-Y4EFTVBPE3',(function(){try{var s=location.search,k='cc_team';if(/[?&]cc_team=1/.test(s))localStorage.setItem(k,'1');if(/[?&]cc_team=0/.test(s))localStorage.removeItem(k);if(localStorage.getItem(k)==='1'||/[?&]in_mcr=1/.test(s)||window.obsstudio)return{traffic_type:'internal'}}catch(e){}return{}})());
</script><script src="/js/cc-analytics.js?v=20261026_1" defer></script>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#101b18">
<meta name="description" content="Po prostu bądź blisko. Siedem krótkich spotkań ze Słowem, które pomagają odnaleźć spokój i zrobić dobry krok. Prosty plan biblijny Christian Culture.">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="author" content="Christian Culture">
<link rel="canonical" href="${canonicalUrl}">
<link rel="icon" type="image/png" href="/favicon.png">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:locale" content="pl_PL">
<meta property="og:site_name" content="Christian Culture">
<meta property="og:title" content="Po prostu bądź blisko — 7 dni ze Słowem | Christian Culture">
<meta property="og:description" content="Świat nie musi na chwilę zwolnić. Ty możesz. Siedem krótkich spotkań ze Słowem, które pomagają odnaleźć spokój i zrobić dobry krok.">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:image" content="https://polskieradio.cc/badz-blisko/swiatlo.png">
<meta property="og:image:alt" content="Światło wschodzącego słońca nad lasem i jeziorem — Bądź Blisko Christian Culture">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Po prostu bądź blisko — 7 dni ze Słowem">
<meta name="twitter:description" content="Siedem krótkich spotkań ze Słowem, które pomagają odnaleźć spokój i zrobić dobry krok.">
<meta name="twitter:image" content="https://polskieradio.cc/badz-blisko/swiatlo.png">

<title>Po prostu bądź blisko — 7 dni ze Słowem | Christian Culture</title>

<!-- Schema.org JSON-LD -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://polskieradio.cc/#organization",
      "name": "Christian Culture",
      "url": "https://polskieradio.cc/"
    },
    {
      "@type": "WebPage",
      "@id": "${canonicalUrl}#webpage",
      "url": "${canonicalUrl}",
      "name": "Po prostu bądź blisko — Siedem dni ze Słowem",
      "description": "Siedem krótkich spotkań ze Słowem, które pomagają odnaleźć spokój i zrobić dobry krok. Prosty plan biblijny w rytmie Twojego dnia.",
      "inLanguage": "pl-PL",
      "publisher": { "@id": "https://polskieradio.cc/#organization" },
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": "https://polskieradio.cc/badz-blisko/swiatlo.png"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "${canonicalUrl}#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Christian Culture", "item": "https://polskieradio.cc/" },
        { "@type": "ListItem", "position": 2, "name": "Bądź Blisko", "item": "${canonicalUrl}" }
      ]
    }
  ]
}
</script>

<style>
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;color:#f5f0e5;background:#101b18;font-family:Arial,sans-serif;-webkit-font-smoothing:antialiased}
button,a{font:inherit;cursor:pointer}
button:focus-visible,a:focus-visible{outline:3px solid #e2cc9a;outline-offset:4px}
.hero{min-height:100svh;position:relative;display:flex;flex-direction:column;background:linear-gradient(90deg,rgba(5,13,12,.88),rgba(5,13,12,.34) 70%),linear-gradient(0deg,#101b18 0%,transparent 35%),url('swiatlo.png') center/cover}
header{display:flex;align-items:center;justify-content:space-between;padding:30px 6%;border-bottom:1px solid rgba(255,255,255,.17);font-size:11px;letter-spacing:.2em}
.brand{font-size:13px;font-weight:bold;text-decoration:none;color:#f5f0e5;transition:color .2s ease;display:inline-flex;align-items:center;gap:4px;min-height:44px}
.brand:hover{color:#fff}
.brand span{color:#d7b974}
.header-right{color:#ded8c7;text-transform:uppercase;font-weight:500}
.hero-content{width:min(1400px,88%);margin:auto;display:grid;grid-template-columns:1fr 260px;align-items:end;gap:40px;padding:80px 0 64px}
.tag,.kicker{color:#e2cc9a;font-size:11px;letter-spacing:.23em;text-transform:uppercase;font-weight:600}
.tag:before{content:'';display:inline-block;width:32px;height:1px;background:#d1ad6b;vertical-align:middle;margin-right:12px}
.hero h1{font:400 clamp(64px,10vw,155px)/.88 Georgia,serif;letter-spacing:-.065em;margin:32px 0}
.hero h1 em{font-weight:400;color:#e2cc9a;font-style:italic}
.hero p{font:18px/1.6 Arial,sans-serif;color:#dfdfd4;max-width:460px;margin:0 0 24px}
.primary{background:#d3b57c;border:0;color:#172019;padding:17px 28px;min-height:54px;font-weight:bold;font-size:15px;display:inline-flex;gap:36px;align-items:center;text-decoration:none;transition:background .2s,transform .15s}
.primary:hover{background:#e2cc9a;transform:translateY(-1px)}
.primary:active{transform:translateY(0)}
.aside{border-left:1px solid rgba(255,255,255,.31);padding-left:25px;color:#e1ded1;font-size:13px;line-height:1.8}
.aside strong{display:block;font:36px Georgia,serif;color:#f9f5e8;margin:12px 0}
.body{max-width:1240px;margin:auto;padding:110px 6%}
.intro{display:flex;justify-content:space-between;gap:20px;align-items:end;border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:28px}
.intro h2{font:400 clamp(40px,6vw,76px)/1 Georgia,serif;letter-spacing:-.04em;margin:18px 0 0}
.intro p{color:#b3bdb3;line-height:1.7;max-width:300px;font-size:14px}
.days{display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin:30px 0 45px;-webkit-overflow-scrolling:touch}
.days button{min-width:76px;min-height:56px;background:none;border:0;border-bottom:2px solid #3c493f;color:#aeb6ac;font-size:12px;font-weight:600;letter-spacing:.1em;transition:all .2s;padding:0 8px}
.days button:hover{color:#f5f0e5;border-bottom-color:#aeb6ac}
.days button.active{color:#e2cc9a;border-bottom-color:#e2cc9a}
.reading{display:grid;grid-template-columns:.75fr 1.3fr;gap:9%;padding:35px 0 80px}
.number{font:140px/.8 Georgia,serif;color:#d8bd83;user-select:none}
.chapter{color:#bcbcae;font-size:12px;letter-spacing:.18em;margin-top:25px;text-transform:uppercase}
.reading h3{font:400 clamp(40px,5vw,68px)/1.05 Georgia,serif;margin:0 0 24px;letter-spacing:-.035em}
.verse{font:italic 25px/1.5 Georgia,serif;color:#e6d5af}
.ref{font-size:11px;color:#d5b879;letter-spacing:.16em;margin:18px 0 35px;text-transform:uppercase;font-weight:600}
.thought{font:16px/1.8 Arial,sans-serif;color:#ced3c8}
.action{background:#d7e0d2;color:#1a3024;padding:28px 32px;margin-top:35px;border-radius:2px}
.action .kicker{color:#6a785c}
.action p{font:22px/1.4 Georgia,serif;margin:12px 0}
.controls{display:flex;gap:12px;flex-wrap:wrap;margin-top:32px}
.controls button{min-height:50px;padding:0 24px;border:1px solid #c5a76f;background:transparent;color:#eadab9;font-weight:600;font-size:14px;transition:all .2s;display:inline-flex;align-items:center;justify-content:center}
.controls button:hover{background:rgba(226,204,154,.1)}
.controls button:first-child{background:#d3b57c;color:#172019;border-color:#d3b57c}
.controls button:first-child:hover{background:#e2cc9a}
.message{color:#b3bdb3;font-size:13px;min-height:24px;margin-top:14px;font-style:italic}
.close{border-top:1px solid rgba(255,255,255,.16);padding:42px 0 60px;color:#9cab9e;font-size:13px;line-height:1.9}
.close strong{color:#e2cc9a}
.back-link{color:#d3b57c;text-decoration:none;display:inline-flex;align-items:center;gap:6px;margin-top:16px;min-height:44px;font-weight:500;transition:color .2s}
.back-link:hover{color:#fff;text-decoration:underline}

@media(max-width:840px){
  header{padding:20px 6%}
  .header-right{font-size:10px}
  .hero-content{grid-template-columns:1fr;padding:60px 0 40px}
  .hero h1{font-size:clamp(56px,13vw,88px)}
  .aside{display:none}
  .body{padding:70px 6%}
  .intro{display:block}
  .intro p{margin-top:16px}
  .reading{grid-template-columns:1fr;gap:28px;padding:24px 0 50px}
  .number{font-size:80px}
  .chapter{margin-top:8px}
  .reading h3{font-size:38px}
  .verse{font-size:22px}
  .days button{min-width:64px;min-height:50px}
}
@media(prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .primary,.controls button{transition:none}
}
</style>
</head>
<body>

<section class="hero">
  <header>
    <a href="/" class="brand" aria-label="Christian Culture — Strona główna">CHRISTIAN <span>CULTURE</span></a>
    <div class="header-right">7 DNI ZE SŁOWEM</div>
  </header>
  <div class="hero-content">
    <div>
      <div class="tag">Twoja chwila. Jego Słowo.</div>
      <h1>Po prostu<br><em>bądź blisko.</em></h1>
      <p>Świat nie musi na chwilę zwolnić. Ty możesz. Siedem krótkich spotkań ze Słowem, które pomagają odnaleźć spokój i zrobić dobry krok.</p>
      <button class="primary" onclick="document.getElementById('plan').scrollIntoView({behavior:'smooth'})" aria-label="Rozpocznij swoją drogę — przejście do planu">Rozpocznij swoją drogę <span aria-hidden="true">↗</span></button>
    </div>
    <aside class="aside" aria-label="Rytm spotkań">
      TWÓJ RYTM
      <strong>7 dni</strong>
      Bez pośpiechu.<br>Bez oceniania.<br>Możesz zacząć w każdej chwili.
    </aside>
  </div>
</section>

<main class="body" id="plan">
  <div class="intro">
    <div>
      <div class="kicker">Plan biblijny · 7 spotkań</div>
      <h2>Miejsce na oddech.</h2>
    </div>
    <p>Wybierz dzień. Przeczytaj, pomyśl, zrób mały krok. Wystarczy kilka minut.</p>
  </div>

  <nav class="days" id="days" aria-label="Wybierz dzień spotkania"></nav>

  <noscript>
    <div style="padding:20px;background:#17221d;border:1px solid #c5a76f;margin:20px 0;border-radius:4px;">
      <h3 style="color:#e2cc9a;margin:0 0 10px;">Dzień 1: Zatrzymaj się</h3>
      <p style="font-size:18px;font-style:italic;color:#e6d5af;">„Przyjdźcie do Mnie wszyscy, którzy jesteście utrudzeni, a Ja dam wam odpocząć.” — MT 11,28 (UBG)</p>
      <p style="color:#ced3c8;">Nie musisz dziś wszystkiego naprawić. Możesz zacząć od chwili obecności. Bóg słyszy także wtedy, gdy nie umiesz znaleźć wielu słów.</p>
    </div>
  </noscript>

  <section class="reading" aria-live="polite">
    <div>
      <div class="number" id="number">01</div>
      <div class="chapter">SIEDEM DNI ZE SŁOWEM</div>
    </div>
    <div>
      <div class="kicker">CHWILA ZE SŁOWEM</div>
      <h3 id="title">Zatrzymaj się.</h3>
      <div class="verse" id="verse"></div>
      <div class="ref" id="ref"></div>
      <p class="thought" id="thought"></p>
      
      <div class="action">
        <div class="kicker">TWÓJ MAŁY KROK</div>
        <p id="step"></p>
      </div>

      <div class="controls">
        <button id="next" type="button">Następny dzień →</button>
        <button id="quiet" type="button">Chwila ciszy ◌</button>
      </div>
      
      <p class="message" id="message">Bez presji. Wróć, kiedy zechcesz.</p>
    </div>
  </section>

  <footer class="close">
    <strong>CHRISTIAN CULTURE</strong> · Siedem dni ze Słowem<br>
    Fragmenty biblijne przedstawiono jako parafrazy w oparciu o Pismo Święte (UBG). Ilustracja wygenerowana cyfrowo.<br>
    <a href="/" class="back-link">← Wróć do portalu głównego Christian Culture</a>
  </footer>
</main>

<script>
const d = [
  [
    'Zatrzymaj się.',
    'Przyjdźcie do Mnie wszyscy, którzy jesteście utrudzeni, a Ja dam wam odpocząć.',
    'MT 11,28',
    'Nie musisz dziś wszystkiego naprawić. Możesz zacząć od chwili obecności. Bóg słyszy także wtedy, gdy nie umiesz znaleźć wielu słów.',
    'Odłóż telefon na minutę. Nazwij przed Bogiem to, co dziś niesiesz.'
  ],
  [
    'Nie jesteś sam.',
    'Nie bój się, bo Ja jestem z tobą.',
    'IZ 41,10',
    'Nawet gdy nie widzisz rozwiązania, nie musisz przechodzić przez trudny dzień samotnie.',
    'Odezwij się do jednej zaufanej osoby. Zapytaj, jak się naprawdę ma.'
  ],
  [
    'Światło na drogę.',
    'Twoje słowo jest światłem na mojej drodze.',
    'PS 119,105',
    'Nie zawsze widzimy całą drogę. Czasem wystarczy światło na najbliższy krok.',
    'Nazwij jedną decyzję, w której potrzebujesz mądrości.'
  ],
  [
    'Nowy poranek.',
    'Jego miłosierdzie odnawia się każdego poranka.',
    'LM 3,22–23',
    'Nowy dzień nie wymaga udawania, że wczoraj wszystko było łatwe.',
    'Zatrzymaj się i wypowiedz jedno zdanie wdzięczności.'
  ],
  [
    'Zrób miejsce na dobro.',
    'Bądźcie dla siebie życzliwi i przebaczajcie sobie.',
    'EF 4,32',
    'Życzliwość może zacząć się od bardzo małego gestu.',
    'Zrób dziś coś dobrego, nie oczekując niczego w zamian.'
  ],
  [
    'Oddaj troskę.',
    'Powierzcie Mu swoje troski, bo On troszczy się o was.',
    '1 P 5,7',
    'Modlitwa nie musi być długa ani doskonała. Może być szczera.',
    'Powiedz prostymi słowami, co dziś najbardziej cię niepokoi.'
  ],
  [
    'Idź w miłości.',
    'Trwajcie w mojej miłości.',
    'J 15,9',
    'Siedem dni to początek, nie egzamin. Wybierz jedną myśl, którą chcesz zabrać ze sobą.',
    'Podziel się z bliską osobą tym, co było dla ciebie ważne.'
  ]
];

let n = 0;

// Sprawdź hash w URL (np. #dzien-3)
if (window.location.hash) {
  const m = window.location.hash.match(/dzien-(\\d+)/);
  if (m && m[1]) {
    const parsed = parseInt(m[1], 10) - 1;
    if (parsed >= 0 && parsed < d.length) n = parsed;
  }
}

const $ = id => document.getElementById(id);

function draw() {
  const a = d[n];
  $('number').textContent = String(n + 1).padStart(2, '0');
  $('title').textContent = a[0];
  $('verse').textContent = '„' + a[1] + '”';
  $('ref').textContent = a[2] + ' · PARAFRAZA (UBG)';
  $('thought').textContent = a[3];
  $('step').textContent = a[4];
  $('message').textContent = 'Bez presji. Wróć, kiedy zechcesz.';
  $('next').textContent = (n === 6) ? 'Wróć do początku ↺' : 'Następny dzień →';
  
  $('days').innerHTML = d.map((x, i) => 
    \`<button type="button" data-i="\${i}" class="\${i === n ? 'active' : ''}" \${i === n ? 'aria-current="step"' : ''}>DZIEŃ \${i + 1}</button>\`
  ).join('');

  document.querySelectorAll('[data-i]').forEach(b => {
    b.onclick = () => {
      n = +b.dataset.i;
      if (history.replaceState) history.replaceState(null, '', '#dzien-' + (n + 1));
      draw();
    };
  });
}

$('next').onclick = () => {
  n = (n + 1) % 7;
  if (history.replaceState) history.replaceState(null, '', '#dzien-' + (n + 1));
  draw();
};

$('quiet').onclick = () => {
  $('message').textContent = 'Weź spokojny oddech. Możesz pozostać tutaj tak długo, jak potrzebujesz.';
};

draw();
</script>
</body>
</html>`;
}

// Zapisz BądźBlisko/index.html (ścieżka dokładna wskazana przez Dowódcę)
fs.writeFileSync('BądźBlisko/index.html', getHtml('https://polskieradio.cc/badz-blisko'), 'utf8');

// Zapisz badz-blisko/index.html (Clean URL)
fs.writeFileSync('badz-blisko/index.html', getHtml('https://polskieradio.cc/badz-blisko'), 'utf8');

console.log('Successfully generated BądźBlisko/index.html and badz-blisko/index.html');
