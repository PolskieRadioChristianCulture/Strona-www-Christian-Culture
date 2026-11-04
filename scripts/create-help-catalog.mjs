/**
 * CC HELP — Skrypt tworzący katalog /help i aktualizujący cc-omni-search.js
 * Zadanie: polskieradio.cc/help + ikona CC HELP w wyszukiwarce
 * Agent: Antigravity | Data: 2026-11-04
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// ── 1. KATALOG STRON CC HELP ─────────────────────────────────────────────────
const HELP_PAGES = [
  // Zdrowie i styl życia
  { slug: 'aktywnosc-fizyczna', title: 'Aktywność fizyczna',   desc: 'Ruch, rehabilitacja i zdrowy tryb życia', category: 'Zdrowie', emoji: '🏃' },
  { slug: 'cukrzyca',           title: 'Cukrzyca',             desc: 'Życie z cukrzycą – wsparcie i informacje', category: 'Zdrowie', emoji: '💉' },
  { slug: 'depresja',           title: 'Depresja',             desc: 'Szukanie pomocy w depresji', category: 'Zdrowie', emoji: '🌧️' },
  { slug: 'dietetyk',           title: 'Dietetyk',             desc: 'Żywienie i zdrowa dieta', category: 'Zdrowie', emoji: '🥗' },
  { slug: 'lek',                title: 'Lęk i niepokój',       desc: 'Zaburzenia lękowe – pomoc i wsparcie', category: 'Zdrowie', emoji: '🫁' },
  { slug: 'nadcisnienie',       title: 'Nadciśnienie',         desc: 'Nadciśnienie – informacje i wsparcie', category: 'Zdrowie', emoji: '❤️' },
  { slug: 'rehabilitacja',      title: 'Rehabilitacja',        desc: 'Rehabilitacja i powrót do zdrowia', category: 'Zdrowie', emoji: '🦽' },
  { slug: 'sanatoria',          title: 'Sanatoria',            desc: 'Leczenie uzdrowiskowe i sanatoryjne', category: 'Zdrowie', emoji: '🏥' },
  { slug: 'wypalenie',          title: 'Wypalenie zawodowe',   desc: 'Wypalenie – jak odzyskać siły', category: 'Zdrowie', emoji: '🔥' },
  { slug: 'zdrowe-serce',       title: 'Zdrowe serce',         desc: 'Choroby serca – profilaktyka i wsparcie', category: 'Zdrowie', emoji: '💓' },
  { slug: 'zdrowy-sen',         title: 'Zdrowy sen',           desc: 'Bezsenność i zaburzenia snu', category: 'Zdrowie', emoji: '🌙' },
  { slug: 'zdrowy-styl-zycia',  title: 'Zdrowy styl życia',   desc: 'Kompleksowe wsparcie zdrowia', category: 'Zdrowie', emoji: '🌿' },
  { slug: 'wsparcie-zdrowia',   title: 'Wsparcie zdrowia',    desc: 'Ogólne wsparcie zdrowotne', category: 'Zdrowie', emoji: '🩺' },

  // Uzależnienia
  { slug: 'alkoholizm',                   title: 'Alkoholizm',                  desc: 'Leczenie i wsparcie w problemach z alkoholem', category: 'Uzależnienia', emoji: '🍷' },
  { slug: 'hazard',                        title: 'Hazard',                      desc: 'Uzależnienie od hazardu – pomoc', category: 'Uzależnienia', emoji: '🎰' },
  { slug: 'narkomania',                    title: 'Narkomania',                  desc: 'Uzależnienie od narkotyków – wsparcie', category: 'Uzależnienia', emoji: '💊' },
  { slug: 'rzucanie-palenia',             title: 'Rzucanie palenia',            desc: 'Jak rzucić palenie – praktyczne kroki', category: 'Uzależnienia', emoji: '🚭' },
  { slug: 'terapia-uzaleznien',           title: 'Terapia uzależnień',          desc: 'Gdzie szukać terapii uzależnień', category: 'Uzależnienia', emoji: '🛋️' },
  { slug: 'uzaleznienia',                 title: 'Uzależnienia',                desc: 'Kompleksowe wsparcie w uzależnieniach', category: 'Uzależnienia', emoji: '🔗' },
  { slug: 'uzaleznienie-od-pornografii',  title: 'Uzal. od pornografii',        desc: 'Pomoc w uzależnieniu od pornografii', category: 'Uzależnienia', emoji: '🛡️' },
  { slug: 'uzaleznienie-od-telefonu',     title: 'Uzal. od telefonu',           desc: 'Uzależnienie od smartfona – jak odzyskać kontrolę', category: 'Uzależnienia', emoji: '📵' },
  { slug: 'wspoluzaleznienie',            title: 'Współuzależnienie',           desc: 'Pomoc dla bliskich osób uzależnionych', category: 'Uzależnienia', emoji: '🤝' },

  // Rodzina i relacje
  { slug: 'dziecko-a-rozwod',       title: 'Dziecko a rozwód',         desc: 'Jak chronić dziecko podczas rozwodu', category: 'Rodzina', emoji: '👨‍👩‍👧' },
  { slug: 'komunikacja-w-malzenstwie', title: 'Komunikacja w małż.',  desc: 'Jak rozmawiać w małżeństwie', category: 'Rodzina', emoji: '💬' },
  { slug: 'konflikty-rodzinne',     title: 'Konflikty rodzinne',       desc: 'Mediacja i rozwiązywanie konfliktów', category: 'Rodzina', emoji: '⚖️' },
  { slug: 'kryzys-malzenski',       title: 'Kryzys małżeński',         desc: 'Pomoc w kryzysie małżeńskim', category: 'Rodzina', emoji: '💍' },
  { slug: 'narzeczenstwo',          title: 'Narzeczeństwo',             desc: 'Przygotowanie do małżeństwa', category: 'Rodzina', emoji: '💑' },
  { slug: 'nastolatki',             title: 'Nastolatki',               desc: 'Wyzwania w relacji z nastolatkami', category: 'Rodzina', emoji: '🧑‍🎓' },
  { slug: 'problemy-w-szkole',      title: 'Problemy w szkole',        desc: 'Trudności szkolne – jak pomóc dziecku', category: 'Rodzina', emoji: '🏫' },
  { slug: 'przemoc-domowa',         title: 'Przemoc domowa',           desc: 'Pomoc w sytuacji przemocy domowej', category: 'Rodzina', emoji: '🆘' },
  { slug: 'rodzicielstwo',          title: 'Rodzicielstwo',            desc: 'Wyzwania i wsparcie w byciu rodzicem', category: 'Rodzina', emoji: '👪' },
  { slug: 'rozwod',                 title: 'Rozwód',                   desc: 'Jak przejść przez rozwód – wsparcie', category: 'Rodzina', emoji: '📋' },
  { slug: 'samotny-rodzic',         title: 'Samotny rodzic',           desc: 'Wsparcie dla samotnych rodziców', category: 'Rodzina', emoji: '👩‍👦' },
  { slug: 'trudne-zachowania',      title: 'Trudne zachowania',        desc: 'Jak radzić sobie z trudnymi zachowaniami', category: 'Rodzina', emoji: '🧩' },
  { slug: 'wiara-dzieci',           title: 'Wiara dzieci',             desc: 'Jak wychowywać dzieci w wierze', category: 'Rodzina', emoji: '✝️' },
  { slug: 'wsparcie-malzenstwa',    title: 'Wsparcie małżeństwa',      desc: 'Wzmacnianie więzi małżeńskiej', category: 'Rodzina', emoji: '💞' },
  { slug: 'wsparcie-rodzicow',      title: 'Wsparcie rodziców',        desc: 'Pomoc dla rodziców w trudnych sytuacjach', category: 'Rodzina', emoji: '🫂' },
  { slug: 'wsparcie-rodziny',       title: 'Wsparcie rodziny',         desc: 'Kompleksowe wsparcie dla rodziny', category: 'Rodzina', emoji: '🏡' },
  { slug: 'zdrada',                 title: 'Zdrada',                   desc: 'Jak radzić sobie ze zdradą', category: 'Rodzina', emoji: '💔' },

  // Zdrowie psychiczne
  { slug: 'cyberprzemoc',       title: 'Cyberprzemoc',         desc: 'Przemoc w internecie – jak reagować', category: 'Psyche', emoji: '💻' },
  { slug: 'holistyczny-coaching', title: 'Coaching holistyczny', desc: 'Rozwój osobisty i coaching', category: 'Psyche', emoji: '🌟' },
  { slug: 'kryzys',             title: 'Kryzys',               desc: 'Pomoc w kryzysie emocjonalnym', category: 'Psyche', emoji: '🆘' },
  { slug: 'poczucie-wartosci',  title: 'Poczucie wartości',    desc: 'Budowanie pewności siebie', category: 'Psyche', emoji: '🌱' },
  { slug: 'psycholog',          title: 'Psycholog',             desc: 'Gdzie znaleźć psychologa', category: 'Psyche', emoji: '🧠' },
  { slug: 'psycholog-dzieciecy', title: 'Psycholog dziecięcy', desc: 'Pomoc psychologiczna dla dzieci', category: 'Psyche', emoji: '🧒' },
  { slug: 'samotnosc',          title: 'Samotność',            desc: 'Radzenie sobie z samotnością', category: 'Psyche', emoji: '🕯️' },
  { slug: 'senior',             title: 'Senior',               desc: 'Wsparcie dla seniorów', category: 'Psyche', emoji: '👴' },
  { slug: 'stres',              title: 'Stres',                desc: 'Stres i przeciążenie – jak sobie radzić', category: 'Psyche', emoji: '😮‍💨' },
  { slug: 'trauma',             title: 'Trauma',               desc: 'Pomoc po traumatycznych przeżyciach', category: 'Psyche', emoji: '🌊' },
  { slug: 'zaloba',             title: 'Żałoba',               desc: 'Przeżywanie straty i żałoby', category: 'Psyche', emoji: '🕊️' },

  // Finanse i prawo
  { slug: 'budzet-domowy',         title: 'Budżet domowy',         desc: 'Jak zaplanować i kontrolować budżet', category: 'Finanse', emoji: '📊' },
  { slug: 'dlugi',                  title: 'Długi',                 desc: 'Wyjście z długów – praktyczne kroki', category: 'Finanse', emoji: '📉' },
  { slug: 'komornik',               title: 'Komornik',              desc: 'Egzekucja komornicza – prawa i ochrona', category: 'Finanse', emoji: '📜' },
  { slug: 'kredyty',                title: 'Kredyty',               desc: 'Problemy z kredytami – pomoc', category: 'Finanse', emoji: '🏦' },
  { slug: 'oddluzanie',             title: 'Oddłużanie',            desc: 'Jak wyjść z pętli zadłużenia', category: 'Finanse', emoji: '🔓' },
  { slug: 'pomoc-prawna',           title: 'Pomoc prawna',          desc: 'Bezpłatna pomoc prawna w Polsce', category: 'Finanse', emoji: '⚖️' },
  { slug: 'prawa-konsumenta',       title: 'Prawa konsumenta',      desc: 'Ochrona praw konsumenta', category: 'Finanse', emoji: '🛒' },
  { slug: 'prawnik',                title: 'Prawnik',               desc: 'Jak znaleźć prawnika', category: 'Finanse', emoji: '👨‍⚖️' },
  { slug: 'upadlosc-konsumencka',   title: 'Upadłość konsumencka',  desc: 'Oddłużenie przez upadłość', category: 'Finanse', emoji: '📋' },
  { slug: 'windykacja',             title: 'Windykacja',            desc: 'Windykacja wierzytelności – informacje', category: 'Finanse', emoji: '📩' },
  { slug: 'pastor',                 title: 'Pastor / duchowy',      desc: 'Wsparcie duchowe i pastoralne', category: 'Finanse', emoji: '✝️' },
  { slug: 'specjalisci',            title: 'Specjaliści CC',        desc: 'Katalog specjalistów CC Pomoc', category: 'Finanse', emoji: '📋' },
];

const CATEGORIES = ['Zdrowie', 'Uzależnienia', 'Rodzina', 'Psyche', 'Finanse'];
const CAT_LABELS = {
  'Zdrowie':     '🏥 Zdrowie i styl życia',
  'Uzależnienia':'💊 Uzależnienia',
  'Rodzina':     '👨‍👩‍👧 Rodzina i relacje',
  'Psyche':      '🧠 Zdrowie psychiczne',
  'Finanse':     '⚖️ Finanse i prawo',
};

// ── 2. GENERUJ help.html ──────────────────────────────────────────────────────
const cardsByCategory = {};
for (const cat of CATEGORIES) {
  cardsByCategory[cat] = HELP_PAGES.filter(p => p.category === cat);
}

let sectionsHTML = '';
for (const cat of CATEGORIES) {
  const pages = cardsByCategory[cat];
  const cards = pages.map(p => `
      <a class="help-card" href="/${p.slug}" aria-label="${p.title}">
        <span class="help-card-emoji" aria-hidden="true">${p.emoji}</span>
        <strong class="help-card-title">${p.title}</strong>
        <span class="help-card-desc">${p.desc}</span>
      </a>`).join('');
  sectionsHTML += `
    <section class="help-category" aria-labelledby="cat-${cat.toLowerCase()}">
      <h2 id="cat-${cat.toLowerCase()}" class="help-cat-title">${CAT_LABELS[cat]}</h2>
      <div class="help-cards-grid">
        ${cards}
      </div>
    </section>`;
}

const helpHTML = `<!doctype html>
<html lang="pl">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y4EFTVBPE3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config','G-Y4EFTVBPE3',(function(){try{var s=location.search,k='cc_team';if(/[?&]cc_team=1/.test(s))localStorage.setItem(k,'1');if(/[?&]cc_team=0/.test(s))localStorage.removeItem(k);if(localStorage.getItem(k)==='1'||/[?&]in_mcr=1/.test(s)||window.obsstudio)return{traffic_type:'internal'}}catch(e){}return{}})());
</script>
<script src="/js/cc-analytics.js?v=20261026_1" defer></script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="robots" content="index,follow">
<title>CC Pomoc — Katalog wsparcia tematycznego | Christian Culture</title>
<meta name="description" content="Katalog bezpłatnych stron wsparcia tematycznego Christian Culture. Zdrowie, uzależnienia, rodzina, zdrowie psychiczne, finanse i prawo. Specjaliści chętni do pomocy.">
<meta property="og:type" content="website">
<meta property="og:title" content="CC Pomoc — Katalog wsparcia tematycznego">
<meta property="og:description" content="Ponad 60 tematycznych stron wsparcia. Znajdź pomoc w swojej sprawie — bezpłatnie, bez oceniania.">
<meta property="og:url" content="https://polskieradio.cc/help">
<meta property="og:image" content="https://polskieradio.cc/icon.png">
<link rel="canonical" href="https://polskieradio.cc/help">
<link rel="icon" href="/dlugi/assets/cc-logo.webp" type="image/webp">
<link rel="stylesheet" href="/dlugi/styles.css?v=20261027b">
<link rel="stylesheet" href="/cc-pomoc/catalog.css?v=20261027">
<style>
  /* ── CC HELP CATALOG — dedykowane style ── */
  :root {
    --help-gold: #C4A35A;
    --help-gold-hover: #D4B578;
    --help-bg: #0a0a0a;
    --help-card-bg: #131313;
    --help-card-border: rgba(196,163,90,.18);
    --help-card-hover-border: rgba(196,163,90,.55);
    --help-radius: 14px;
    --help-gap: 1rem;
  }
  @media(prefers-color-scheme:light) {
    :root { --help-bg:#f4f4f0; --help-card-bg:#fff; --help-card-border:rgba(0,0,0,.09); }
  }

  .help-hero {
    background: linear-gradient(135deg,#0d1a2a 0%,#0a2a1a 100%);
    padding: 3.5rem 1.25rem 2.5rem;
    text-align: center;
  }
  .help-hero-badge {
    display: inline-block;
    font-size:.75rem; letter-spacing:.12em; text-transform:uppercase;
    color: var(--help-gold); font-weight:700; margin-bottom:.75rem;
  }
  .help-hero h1 {
    font-size: clamp(1.75rem,5vw,2.75rem);
    color: #fff; font-weight:800; margin:0 0 .75rem; line-height:1.15;
  }
  .help-hero p {
    color: rgba(255,255,255,.75); max-width: 540px; margin: 0 auto 1.5rem; font-size:1.05rem;
  }
  .help-hero-stats {
    display:flex; gap:2rem; justify-content:center; flex-wrap:wrap;
  }
  .help-hero-stat { text-align:center; }
  .help-hero-stat strong { display:block; font-size:2rem; color:var(--help-gold); font-weight:800; }
  .help-hero-stat span { font-size:.8rem; color:rgba(255,255,255,.6); text-transform:uppercase; letter-spacing:.08em; }

  .help-search-bar {
    max-width: 540px; margin: 1.75rem auto 0;
    position: relative;
  }
  .help-search-bar input {
    width:100%; padding:.85rem 1.25rem .85rem 3rem;
    border-radius: 999px; border: 1.5px solid var(--help-gold);
    background: rgba(255,255,255,.07); color:#fff; font-size:1rem;
    outline:none; box-sizing:border-box;
  }
  .help-search-bar input::placeholder { color:rgba(255,255,255,.45); }
  .help-search-bar svg { position:absolute; left:1rem; top:50%; transform:translateY(-50%); opacity:.6; }

  .help-main { max-width:1120px; margin:0 auto; padding:2rem 1.25rem 4rem; }

  .help-category { margin-bottom: 2.5rem; }
  .help-cat-title {
    font-size:1.05rem; font-weight:700; color:var(--help-gold);
    margin:0 0 1rem; padding-bottom:.5rem;
    border-bottom: 1px solid var(--help-card-border);
  }
  .help-cards-grid {
    display:grid;
    grid-template-columns: repeat(auto-fill, minmax(200px,1fr));
    gap: var(--help-gap);
  }
  .help-card {
    display:flex; flex-direction:column; gap:.35rem;
    background: var(--help-card-bg);
    border: 1.5px solid var(--help-card-border);
    border-radius: var(--help-radius);
    padding: 1.1rem 1rem;
    text-decoration: none;
    transition: border-color .2s, transform .15s, box-shadow .2s;
    min-height: 100px;
  }
  .help-card:hover, .help-card:focus-visible {
    border-color: var(--help-card-hover-border);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(196,163,90,.12);
    outline: none;
  }
  .help-card:focus-visible { outline: 2px solid var(--help-gold); }
  .help-card-emoji { font-size:1.6rem; line-height:1; }
  .help-card-title { font-size:.9rem; font-weight:700; color: #e8e0cc; }
  @media(prefers-color-scheme:light) { .help-card-title { color:#1a1a1a; } }
  .help-card-desc { font-size:.78rem; color:rgba(255,255,255,.5); line-height:1.4; }
  @media(prefers-color-scheme:light) { .help-card-desc { color:rgba(0,0,0,.55); } }

  .help-volunteer-cta {
    background: linear-gradient(135deg,rgba(196,163,90,.12),rgba(196,163,90,.04));
    border: 1.5px solid var(--help-card-border);
    border-radius: var(--help-radius);
    padding: 2rem 1.5rem; text-align:center; margin-top:3rem;
  }
  .help-volunteer-cta h2 { font-size:1.3rem; color:#e8e0cc; margin:0 0 .5rem; }
  .help-volunteer-cta p { color:rgba(255,255,255,.65); margin:0 0 1.25rem; }
  .help-volunteer-btn {
    display:inline-block; padding:.8rem 2rem; border-radius:999px;
    background: var(--help-gold); color:#0a0a0a; font-weight:700; font-size:.9rem;
    text-decoration:none; transition: background .2s;
    min-height:44px; min-width:44px;
  }
  .help-volunteer-btn:hover { background: var(--help-gold-hover); }

  .help-back-link {
    display:inline-flex; align-items:center; gap:.4rem;
    color:var(--help-gold); font-size:.85rem; text-decoration:none;
    padding:.75rem 0; margin-bottom:1rem;
    min-height:44px;
  }
  .help-back-link:hover { text-decoration:underline; }

  @media(max-width:480px) {
    .help-cards-grid { grid-template-columns:repeat(2,1fr); }
    .help-hero-stats { gap:1.25rem; }
  }
</style>
</head>
<body>
<a class="skip" href="#main">Przejdź do treści</a>

<header class="header">
  <div class="header-inner wrap">
    <a class="brand" href="https://polskieradio.cc/" aria-label="Christian Culture">
      <img src="/dlugi/assets/cc-logo.webp" width="66" height="68" alt="Christian Culture">
      <span>CHRISTIAN CULTURE<small>WIARA · WSPARCIE · NADZIEJA</small></span>
    </a>
    <nav class="desktop-nav" aria-label="Nawigacja">
      <a href="https://polskieradio.cc/player">Radio</a>
      <a href="https://polskieradio.cc/lumina">LUMINA</a>
      <a href="https://polskieradio.cc/akademia">Akademia</a>
      <a href="#wolontariat">Zostań specjalistą</a>
    </nav>
    <div class="header-actions">
      <a class="support" href="https://polskieradio.cc/wspieraj">Wspieram to</a>
      <button class="menu-toggle" id="open-menu" type="button" aria-expanded="false" aria-controls="cc-mobile-edge-dialog" aria-label="Otwórz panel">+</button>
    </div>
  </div>
</header>

<div class="help-hero">
  <span class="help-hero-badge">CHRISTIAN CULTURE · CC POMOC</span>
  <h1>Katalog wsparcia tematycznego</h1>
  <p>Bezpłatne strony z praktycznym wsparciem. Bez oceniania. Bez obietnic szybkich rozwiązań. Z szacunkiem do Twojej sytuacji.</p>
  <div class="help-hero-stats">
    <div class="help-hero-stat"><strong>${HELP_PAGES.length}</strong><span>tematów</span></div>
    <div class="help-hero-stat"><strong>5</strong><span>kategorii</span></div>
    <div class="help-hero-stat"><strong>0 zł</strong><span>zawsze bezpłatne</span></div>
  </div>
  <div class="help-search-bar" role="search">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <input type="search" id="helpSearch" placeholder="Szukaj tematu…" aria-label="Szukaj tematu wsparcia" autocomplete="off">
  </div>
</div>

<main id="main" class="help-main">
  <a class="help-back-link" href="https://polskieradio.cc/">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
    Polskie Radio Christian Culture
  </a>

${sectionsHTML}

  <div class="help-volunteer-cta" id="wolontariat">
    <h2>🙋 Jesteś specjalistą? Chcesz pomóc bezpłatnie?</h2>
    <p>Szukamy wolontariuszy — psychologów, prawników, doradców finansowych, lekarzy i coachów, którzy chcą dzielić się wiedzą w duchu chrześcijańskich wartości.</p>
    <a class="help-volunteer-btn" href="https://polskieradio.cc/wspolpraca">Zgłoś się jako specjalista →</a>
  </div>
</main>

<script src="/js/cc-mobile-edge.js?v=20261030_edge10" defer></script>
<script>
  // Filtrowanie kart po wyszukiwaniu
  const searchInput = document.getElementById('helpSearch');
  const cards = document.querySelectorAll('.help-card');
  const sections = document.querySelectorAll('.help-category');

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      cards.forEach(c => c.hidden = false);
      sections.forEach(s => s.hidden = false);
      return;
    }
    cards.forEach(c => {
      const text = c.textContent.toLowerCase();
      c.hidden = !text.includes(q);
    });
    sections.forEach(s => {
      const visible = [...s.querySelectorAll('.help-card')].some(c => !c.hidden);
      s.hidden = !visible;
    });
  });
</script>
</body>
</html>`;

fs.writeFileSync(path.join(ROOT, 'help.html'), helpHTML, 'utf8');
console.log(`✅ help.html wygenerowany (${HELP_PAGES.length} stron)`);

// ── 3. Alias help/index.html ─────────────────────────────────────────────────
const helpDir = path.join(ROOT, 'help');
if (!fs.existsSync(helpDir)) fs.mkdirSync(helpDir, { recursive: true });
fs.writeFileSync(path.join(helpDir, 'index.html'), helpHTML, 'utf8');
console.log('✅ help/index.html wygenerowany (clean URL)');

// ── 4. AKTUALIZUJ cc-omni-search.js: ikona + wpis w APPS_MENU + synonimy ──────
const omniPath = path.join(ROOT, 'components', 'cc-omni-search.js');
let omni = fs.readFileSync(omniPath, 'utf8');

// 4a. Ikona SVG 'help' w APP_ICONS (after 'journal' icon)
const journalIconLine = `'journal': '<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M3 7h4M3 12h4M3 17h4M10 8h6M10 12h6M10 16h4"/>'`;
const helpIconLine = `'help': '<path d="M9 9a3 3 0 1 1 6 0c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5" fill="currentColor"/><circle cx="12" cy="12" r="10"/>'`;

if (!omni.includes("'help':")) {
  omni = omni.replace(
    journalIconLine,
    journalIconLine + ',\n    ' + helpIconLine
  );
  console.log('✅ Ikona help dodana do APP_ICONS');
} else {
  console.log('ℹ️  Ikona help już istnieje w APP_ICONS');
}

// 4b. Wpis w APPS_MENU — sekcja 'Współpraca, usługi i wsparcie'
const wspierjEntry = `['Wspieraj', '/wspieraj', 'heart']`;
const helpEntry = `['CC Pomoc', '/help', 'help']`;
if (!omni.includes("'CC Pomoc'")) {
  omni = omni.replace(
    wspierjEntry,
    wspierjEntry + ', ' + helpEntry
  );
  console.log('✅ Wpis CC Pomoc dodany do APPS_MENU');
} else {
  console.log('ℹ️  CC Pomoc już istnieje w APPS_MENU');
}

// 4c. Synonimy w SYNONYM_MAP
const journalSynLine = `'journal': ['the journal',`;
const helpSynLine = `    'help': ['pomoc', 'cc pomoc', 'wsparcie', 'specjalista', 'wolontariat', 'zdrowie', 'depresja', 'uzaleznienie', 'rodzina', 'finanse', 'prawo'],
    'pomoc': ['help', 'cc pomoc', 'wsparcie tematyczne', 'specjalista', 'centrum pomocy'],
    'ccpomoc': ['cc pomoc', 'help', 'wsparcie', 'specjalista'],`;
if (!omni.includes("'help': ['pomoc'")) {
  omni = omni.replace(
    journalSynLine,
    helpSynLine + '\n    ' + journalSynLine
  );
  console.log('✅ Synonimy help dodane do SYNONYM_MAP');
} else {
  console.log('ℹ️  Synonimy help już istnieją');
}

// 4d. Cache-busting version bump
omni = omni.replace(
  /cc-omni-search\.js\?v=20261104_journal1/g,
  'cc-omni-search.js?v=20261104_help1'
);

fs.writeFileSync(omniPath, omni, 'utf8');
console.log('✅ cc-omni-search.js zaktualizowany');

// ── 5. Zaktualizuj wyszukiwarka.html i wyszukiwarka/index.html ───────────────
for (const f of ['wyszukiwarka.html', 'wyszukiwarka/index.html']) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  let html = fs.readFileSync(p, 'utf8');
  html = html.replace(
    /cc-omni-search\.js\?v=[^"']*/g,
    'cc-omni-search.js?v=20261104_help1'
  );
  fs.writeFileSync(p, html, 'utf8');
  console.log(`✅ ${f} — cache-busting zaktualizowany`);
}

// ── 6. ecosystem-map.json ─────────────────────────────────────────────────────
const mapPath = path.join(ROOT, 'data', 'ecosystem-map.json');
let ecoMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const helpNode = {
  id: 'help',
  label: 'CC Pomoc',
  url: '/help',
  description: 'Katalog wsparcia tematycznego CC – ponad 60 stron dla specjalistów i potrzebujących',
  category: 'wsparcie',
  status: 'active',
  addedBy: 'A',
  addedDate: '2026-11-04'
};
if (!ecoMap.nodes) ecoMap.nodes = [];
if (!ecoMap.nodes.find(n => n.id === 'help')) {
  ecoMap.nodes.push(helpNode);
}
if (!ecoMap.updatesLog) ecoMap.updatesLog = [];
ecoMap.updatesLog.unshift({
  date: '2026-11-04',
  agent: 'A',
  topic: 'CC Pomoc /help — katalog 60+ stron wsparcia + ikona w wyszukiwarce'
});
fs.writeFileSync(mapPath, JSON.stringify(ecoMap, null, 2), 'utf8');
console.log('✅ ecosystem-map.json zaktualizowany');

console.log('\n🎉 WSZYSTKO GOTOWE. Następny krok: testy Zero-QA + build pages-release + push.');
