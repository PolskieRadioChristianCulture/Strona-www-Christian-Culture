#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const WEKTOR_ROOT = 'C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

console.log('🌟 Rozpoczynam generowanie strony HTML lekcji Dnia 32 oraz aktualizację ekosystemu...');

// 1. Definicja QUIZ_DATA
const quizData = [
  {"q":"Ilu synów Jakuba przybyło z nim do Egiptu według Wj 1:1–4?","a":["Jedenastu wymienionych z imienia, gdyż Józef był już w Egipcie","Tylko dwunastu bez rodzin","Siedemdziesięciu dwóch synów"],"c":0},
  {"q":"Ile dusz liczyło całe potomstwo z bioder Jakuba w Egipcie?","a":["Sto dwadzieścia dusz","Siedemdziesiąt dusz","Pięćset dusz"],"c":1},
  {"q":"Co stało się z Józefem i jego braćmi według Wj 1:6?","a":["Wrócili do Kanaanu po ustaniu głodu","Józef został królem całego Egiptu","Józef, wszyscy jego bracia i całe owo pokolenie pomarli"],"c":2},
  {"q":"Jakimi określeniami tekst opisuje demograficzny rozwój synów Izraela w Egipcie?","a":["Byli płodni, rozmnożyli się bardzo, stali się niezwykle potężni i ziemia napełniła się nimi","Ich liczba stale malała z powodu chorób","Pozostali małym plemieniem w krainie Goszen"],"c":0},
  {"q":"Kto wstąpił na tron w Egipcie według Wj 1:8?","a":["Syn Józefa, Efraim","Nowy król, który nie znał Józefa","Król babiloński"],"c":1},
  {"q":"Jakie słowa nowy król skierował do swego ludu w Wj 1:9?","a":["„Szanujmy Izraelitów za ich zasługi dla kraju”","„Wypuśćmy ich wolno do ziemi Kanaan”","„Oto lud synów Izraela jest liczniejszy i silniejszy od nas”"],"c":2},
  {"q":"Do jakiego podstępu faraon wezwał Egipcjan w Wj 1:10?","a":["Do przebiegłego postąpienia z nimi, aby w razie wojny nie sprzymierzyli się z wrogami","Do zawarcia z nimi traktatu pokojowego","Do przyjęcia ich religii"],"c":0},
  {"q":"Kogo ustanowiono nad synami Izraela, aby ich uciszać?","a":["Egipskich kapłanów","Nadzorców robót przymusowych","Sędziów plemiennych"],"c":1},
  {"q":"Jakie miasta-spichlerze dla faraona zbudowali hebrajscy niewolnicy?","a":["Teby i Memfis","Babilon i Niniwę","Pitom i Ramses"],"c":2},
  {"q":"Jaki był skutek uciskania Izraela według Wj 1:12?","a":["Im bardziej ich uciskali, tym bardziej się pomnażali i rozrastali","Izraelici poddali się całkowitej asymilacji","Wszyscy uciekli na pustynię"],"c":0},
  {"q":"Jakie uczucie wzbudził w Egipcjanach dynamiczny rozrost Izraela?","a":["Podziw i chęć naśladowania","Obawiali się synów Izraela i czuli przed nimi trwożliwy wstręt","Radość z taniej siły roboczej"],"c":1},
  {"q":"Przy jakich pracach Egipcjanie czynili życie Hebrajczyków gorzkim?","a":["Przy budowie floty wojennej na Morzu Czerwonym","Przy wypasie wielbłądów na pustyni Synaj","Przy zaprawie, cegłach i wszelkich pracach na polu – wszystko bez litości"],"c":2},
  {"q":"Jak miały na imię hebrajskie położne wezwane przez króla Egiptu?","a":["Szifra i Pua","Debora i Jael","Miriam i Jokebed"],"c":0},
  {"q":"Jaki rozkaz wydał faraon położnym odnośnie narodzin hebrajskich dzieci?","a":["Miały zabierać dzieci do egipskich świątyń","Jeśli urodzi się syn – miały go zabić, a jeśli córka – zostawić przy życiu","Miały zakazać kobietom rodzenia dzieci"],"c":1},
  {"q":"Dlaczego położne odmówiły wykonania zbrodniczego rozkazu faraona?","a":["Z obawy przed karą ze strony mężów","Z braku czasu i sił","Ponieważ bały się Boga"],"c":2},
  {"q":"Co odpowiedziały położne, gdy faraon zażądał wyjaśnień?","a":["Że kobiety hebrajskie są żywotne i rodzą, zanim położna do nich przyjdzie","Że pomyliły chłopców z dziewczynkami","Że zgubiły drogę do domów porodowych"],"c":0},
  {"q":"Jak Bóg zareagował na heroiczną postawę położnych?","a":["Pozbawił je urzędu położnych","Bóg dobrze czynił położnym, a lud pomnażał się i bardzo rósł w siłę","Nakazał im uciekać z Egiptu"],"c":1},
  {"q":"W jaki sposób Bóg osobiście wynagrodził położne w Wj 1:21?","a":["Uczynił je królowymi Egiptu","Dał im wielkie bogactwa ze złota","Założył im domy – obdarzył je własnymi rodzinami i potomstwem"],"c":2},
  {"q":"Jaki jawny rozkaz faraon wydał całemu swojemu narodowi w Wj 1:22?","a":["Aby każdego nowo narodzonego syna wrzucali do rzeki Nil","Aby wypędzili wszystkich starców za granicę","Aby spalili krainę Goszen"],"c":0},
  {"q":"Kogo według nakazu faraona z Wj 1:22 należało oszczędzić?","a":["Pierworodnych synów wodzów","Każdą córkę","Tylko dzieci z plemienia Lewiego"],"c":1}
];

// 2. Szablon HTML lekcji Dnia 32
const dzien32Html = `<!DOCTYPE html>
<html lang="pl" class="dark scroll-smooth">
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
  <title>Dzień 32: W NIESKRĘPOWANYM ROZROŚCIE — NOWY KRÓL, UCIEMIĘŻENIE I BOŻE OCALENIE (Wj 1:1–22) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>
  <meta name="description" content="Księga Wyjścia — Miesiąc 2, Dzień 32 (1 Listopada 2026). Nowy król w Egipcie, uciskanie Izraela, heroiczna wiara położnych Szifry i Pui oraz Boże ocalenie życia — Wj 1:1–22. Kurs codzienny Pisma Świętego." />
  <link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-32" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-32" />
  <meta property="og:title" content="Dzień 32: W NIESKRĘPOWANYM ROZROŚCIE — NOWY KRÓL, UCIEMIĘŻENIE I BOŻE OCALENIE — Z Biblią za Pan Brat" />
  <meta property="og:description" content="Księga Wyjścia — Miesiąc 2, Dzień 32. Nowy król w Egipcie, uciskanie Izraela, heroiczna wiara położnych Szifry i Pui oraz Boże ocalenie życia — Wj 1:1–22." />
  <meta property="og:image" content="https://polskieradio.cc/images/academy/daily/kc_day_32_ucisk_w_egipcie_odwaga_poloznych.jpg?v=20261102" />

  <!-- Fonts: Cinzel, Playfair Display, Plus Jakarta Sans, Lora, Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

  <!-- Shared Lumina Courses CSS -->
  <link rel="stylesheet" href="/css/lumina-courses.css?v=20261008_desktop_icons_v3" />

  <!-- Tailwind CDN fallback -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            'brand-gold': '#C4A35A',
            'brand-gold-light': '#E2CC9A',
            'brand-gold-dark': '#8E6E32',
            'brand-dark': '#060A10',
            'brand-navy': '#0A121E',
            'brand-panel': '#0F1A2A',
            'brand-border': 'rgba(196,163,90,0.22)',
            'brand-line': 'rgba(255,255,255,0.08)'
          },
          fontFamily: {
            serif: ['Lora', 'Georgia', 'serif'],
            display: ['Cinzel', 'Playfair Display', 'serif'],
            sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif']
          }
        }
      }
    }
  </script>

  <style>
    body { background: #07090E; color: #f1f5f9; }
    .ak-header { background: rgba(7,9,14,0.95); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(196,163,90,0.18); position: sticky; top: 0; z-index: 50; }

    .ak-header #reader-font-label,
    .ak-header #tts-btn-text,
    .ak-header .theme-toggle-label,
    .ak-header #ccTopSubLink span,
    .ak-header a[href*="patronite"] span:not(:first-child) {
      display: none !important;
    }
    .ak-header .kc-reader-pill,
    .ak-header #btn-audio-tts,
    .ak-header #btn-theme-toggle,
    .ak-header #ccTopSubLink,
    .ak-header a[href*="patronite"] {
      width: 38px !important;
      height: 38px !important;
      min-width: 38px !important;
      min-height: 38px !important;
      padding: 0 !important;
      justify-content: center !important;
      align-items: center !important;
      display: inline-flex !important;
      border-radius: 9999px !important;
      box-sizing: border-box !important;
      flex-shrink: 0 !important;
    }
    .ak-header .rounded-full.border-zinc-800 {
      height: 38px !important;
      padding: 2px 4px !important;
      box-sizing: border-box !important;
      display: inline-flex !important;
      align-items: center !important;
    }
    .ak-header .ak-header-course-title {
      max-width: none !important;
      white-space: nowrap !important;
      text-overflow: clip !important;
      display: inline-block !important;
    }
    @media (max-width: 768px) {
      .ak-header .ak-header-slash, .ak-header .ak-header-course-title, .ak-header .ak-header-brand-sub { display: none !important; }
      .ak-header .max-w-6xl, .ak-header .max-w-7xl { padding-left: 12px !important; padding-right: 12px !important; }
    }
    .kc-card { background: #0E121A; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 24px; margin-bottom: 24px; }
    @media (min-width: 640px) { .kc-card { padding: 32px; } }
    .kc-card h2, .kc-card h3 { font-family: 'Cinzel', serif; letter-spacing: 0.06em; color: #E2CC9A; }

    :root {
      --kc-font-body: 'Lora', Georgia, 'Times New Roman', serif;
      --kc-font-size: 1.05rem;
      --kc-line-height: 1.82;
      --kc-letter-spacing: 0.012em;
      --kc-text-color: #f1f5f9;
    }

    html[data-kc-font="sans"] {
      --kc-font-body: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --kc-font-size: 1.00rem;
      --kc-line-height: 1.78;
      --kc-letter-spacing: 0.015em;
    }

    .kc-card p,
    .kc-card li {
      font-family: var(--kc-font-body) !important;
      font-size: var(--kc-font-size) !important;
      line-height: var(--kc-line-height) !important;
      letter-spacing: var(--kc-letter-spacing) !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .kc-card p:not([class*="text-amber-"]):not([class*="text-brand-"]):not([class*="text-rose-"]):not([class*="text-emerald-"]):not([class*="text-white"]),
    .kc-card li:not([class*="text-amber-"]):not([class*="text-brand-"]):not([class*="text-rose-"]):not([class*="text-emerald-"]):not([class*="text-white"]) {
      color: var(--kc-text-color) !important;
    }

    .kc-card p {
      margin-bottom: 1.15rem;
    }
    .kc-card p:last-child {
      margin-bottom: 0;
    }

    .kc-card strong, .kc-card b {
      color: #ffffff;
      font-weight: 700;
    }

    .kc-card em, .kc-card i {
      color: #E2CC9A;
      font-style: italic;
    }

    .kc-verse-box, blockquote {
      background: rgba(196,163,90,0.08);
      border-left: 4px solid #C4A35A;
      border-radius: 0 16px 16px 0;
      padding: 20px 24px;
      font-family: 'Lora', Georgia, serif !important;
      font-size: 1.08rem !important;
      line-height: 1.82 !important;
      letter-spacing: 0.012em !important;
      color: #f1e7d0 !important;
      margin: 1.3rem 0;
    }

    .kc-reader-pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 14px;
      border-radius: 9999px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(22, 27, 38, 0.85);
      color: #e2e8f0;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      min-height: 44px;
    }
    .kc-reader-pill:hover {
      border-color: rgba(196,163,90,0.6);
      color: #fef08a;
      background: rgba(30, 37, 51, 0.95);
    }
    .quiz-option { background: #0E121A; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px 18px; cursor: pointer; transition: all .2s; font-size: 14px; color: #d4d4d8; }
    .quiz-option:hover { border-color: rgba(196,163,90,0.4); background: #161B26; }
    .quiz-option.correct { border-color: #4ade80 !important; background: rgba(34,197,94,0.12) !important; color: #4ade80 !important; }
    .quiz-option.wrong { border-color: #f87171 !important; background: rgba(248,113,113,0.12) !important; color: #f87171 !important; }
    .custom-check { width: 22px; height: 22px; border-radius: 6px; border: 2px solid #C4A35A; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all .2s; }
    .custom-check.checked { background: #C4A35A; color: #07090E; }
  </style>
  <script src="/js/cc-global-auth.js?v=20261007_auth_v2" defer></script>
  <script src="/js/cc-course-theme.js?v=20261008_desktop_icons_v3" defer></script>
</head>
<body class="bg-brand-dark text-zinc-100 font-sans antialiased min-h-screen flex flex-col">

  <!-- TOP BAR / ECOSYSTEM NAV -->
  <header class="ak-header">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 sm:gap-4">
        <a href="/akademia/kurscodzienny" class="flex items-center gap-2.5 min-h-[44px]" title="Powrót do Kursu Codziennego">
          <span class="text-amber-400 text-lg">←</span>
          <div class="flex items-center gap-2">
            <span class="font-display text-sm font-bold text-brand-gold tracking-widest">LUMINA</span>
            <span class="text-xs font-semibold text-zinc-400 hidden md:inline ak-header-brand-sub">BIBLE ACADEMY</span>
          </div>
        </a>
        <span class="text-zinc-700 hidden md:inline ak-header-slash">/</span>
        <a href="/akademia/kurscodzienny" class="text-xs font-semibold text-amber-200/90 hover:text-amber-300 whitespace-nowrap hidden md:inline ak-header-course-title">
          Z Biblią za Pan Brat
        </a>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <button type="button" id="btn-reader-font" onclick="toggleReaderFont()" class="kc-reader-pill" title="Zmień krój pisma: Lora (Książkowa szeryfowa) / Inter (Ekranowa bezszeryfowa)">
          <i class="fa-solid fa-font text-amber-400 text-xs"></i>
          <span id="reader-font-label" class="sr-only font-semibold">Krój: Lora</span>
        </button>

        <button type="button" id="btn-theme-toggle" onclick="toggleCourseTheme()" class="kc-reader-pill cin-btn-theme" title="Przełącz motyw (Jasny / Ciemny)" aria-label="Przełącz motyw">
          <i class="fa-solid fa-sun text-amber-400 text-xs theme-toggle-icon"></i>
        </button>

        <div class="hidden md:flex items-center rounded-full border border-zinc-800 bg-zinc-900/80 p-0.5 text-xs text-zinc-400">
          <button type="button" onclick="adjustFontSize(-1)" class="w-8 h-8 flex items-center justify-center rounded-full hover:text-white hover:bg-zinc-800 transition" title="Mniejszy tekst">A-</button>
          <button type="button" onclick="adjustFontSize(1)" class="w-8 h-8 flex items-center justify-center rounded-full hover:text-white hover:bg-zinc-800 font-bold transition" title="Większy tekst">A+</button>
        </div>

        <button type="button" id="btn-audio-tts" onclick="toggleAudioLesson()" class="w-[38px] h-[38px] min-w-[38px] min-h-[38px] p-0 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition flex items-center justify-center" title="Słuchaj lekcji z lektorem">
          <i class="fa-solid fa-volume-high text-xs" id="tts-icon"></i>
          <span id="tts-btn-text" class="sr-only">Słuchaj Audio</span>
        </button>

        <a href="https://patronite.pl/osobowoscplus" target="_blank" rel="noopener" class="w-[38px] h-[38px] min-w-[38px] min-h-[38px] p-0 rounded-full border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/10 inline-flex items-center justify-center" title="Wspieraj Misję Christian Culture" aria-label="Wspieraj Misję">
          <span>❤️</span>
        </a>
      </div>
    </div>
  </header>

  <!-- BREADCRUMBS & TOP NAV -->
  <nav class="border-b border-brand-line bg-brand-navy/60 text-xs">
    <div class="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between text-zinc-400">
      <div class="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap py-1">
        <a href="/akademia" class="hover:text-amber-400">Akademia</a>
        <span>›</span>
        <a href="/akademia/kurscodzienny" class="hover:text-amber-400">Kurs Codzienny</a>
        <span>›</span>
        <span class="text-zinc-500">Księga Wyjścia</span>
        <span>›</span>
        <span class="text-amber-400 font-semibold">Dzień 32</span>
      </div>
      <div class="flex items-center gap-2">
        <a href="/akademia/kurscodzienny" class="text-zinc-400 hover:text-white px-2 py-1 min-h-[32px] flex items-center">Spis Dni</a>
        <span class="text-zinc-700">|</span>
        <a href="/akademia/kurscodzienny/dzien-31" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 min-h-[32px] flex items-center">← Dzień 31</a>
      </div>
    </div>
  </nav>

  <!-- MAIN WRAPPER -->
  <main class="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">

    <!-- HERO HEADER -->
    <header class="space-y-4 text-center sm:text-left border-b border-brand-line pb-6">
      <div class="flex flex-wrap items-center justify-center sm:justify-between gap-2">
        <span class="px-3 py-1 rounded-full bg-brand-gold/15 text-brand-gold text-xs font-bold uppercase tracking-widest border border-brand-gold/30">
          Księga Wyjścia • Miesiąc 2 • Dzień 32 z 2009
        </span>
        <span class="text-xs text-zinc-400 font-mono">1 LISTOPADA 2026 • NIEDZIELA</span>
      </div>

      <div class="pt-2">
        <a href="#ccDailyShare" id="kcJumpShareBtn" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold hover:text-brand-gold-light border border-brand-gold/30 transition text-xs font-bold uppercase tracking-wider min-h-[44px]">
          <i class="fa-solid fa-share-nodes text-xs"></i>
          <i class="fa-solid fa-arrow-down text-xs"></i>
          <span>Podziel się tą lekcją ↓</span>
        </a>
      </div>

      <h1 class="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
        W NIESKRĘPOWANYM ROZROŚCIE: NOWY KRÓL, UCIEMIĘŻENIE I BOŻE OCALENIE
      </h1>
      <p class="text-base sm:text-lg text-amber-300/90 font-serif italic">
        Śmierć pokolenia Józefa, dekret faraona, niewolniczy trud i odwaga bogobojnych położnych (Wj 1:1–22)
      </p>

      <!-- HERO IMAGE 16:9 -->
      <div class="relative rounded-2xl overflow-hidden border border-brand-border/40 shadow-2xl mt-4 aspect-video bg-zinc-900">
        <img
          src="/images/academy/daily/kc_day_32_ucisk_w_egipcie_odwaga_poloznych.jpg?v=20261102"
          alt="Dzień 32: W NIESKRĘPOWANYM ROZROŚCIE: NOWY KRÓL, UCIEMIĘŻENIE I BOŻE OCALENIE (Wj 1:1–22)"
          class="w-full h-full object-cover"
          loading="eager"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-60"></div>
        <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-zinc-300 backdrop-blur-sm bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
          <span>Ilustracja biblijna: Niewola w Egipcie i wierność bogobojnych położnych</span>
          <span class="font-mono text-brand-gold">Czytanie: Wj 1:1–22</span>
        </div>
      </div>

      <!-- MEMORY VERSE CARD -->
      <div class="kc-verse-badge text-left">
        <div class="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
          <i class="fa-solid fa-bookmark"></i>
          <span>Werset Pamięciowy Dnia:</span>
        </div>
        <blockquote class="font-serif italic text-base sm:text-lg text-white">
          „Lecz im bardziej go uciskali, tym bardziej się pomnażał i rozrastał, tak że obawiali się synów Izraela”
        </blockquote>
        <div class="text-right text-xs text-brand-gold font-bold mt-1 font-mono">
          — Księga Wyjścia 1:12 (UBG)
        </div>
      </div>

      <!-- CORE THESIS -->
      <div class="p-4 rounded-xl bg-brand-panel/60 border border-brand-border/30 text-xs sm:text-sm text-zinc-300">
        <strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>
        Księga Wyjścia rozpoczyna się konfrontacją pogańskiego imperium z Bożą obietnicą przymierza. Żadne ludzkie dekrety, uciski ani wrogość świata nie są w stanie zatrzymać rozrostu ludu Bożego, a cicha wierność i bojaźń Boża zwykłych ludzi okazują się potężniejsze niż despotyczna władza faraona.
      </div>
    </header>

    <!-- LESSON BODY CONTENT -->
    <section class="space-y-6">

      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-line pb-2">
          <i class="fa-solid fa-book-open"></i>
          <span>Zanim otworzysz Biblię</span>
        </div>
        <p>Pierwszego listopada rozpoczynamy drugi miesiąc naszej 66-miesięcznej podróży przez całe Pismo Święte. Wkraczamy w <strong>Księgę Wyjścia</strong> (hebr. <em>We’elleh Szemot</em> – „A oto imiona”), drugą monumentalną księgę Tory i całego kanonu biblijnego. Wczoraj zamknęliśmy Księgę Rodzaju widokiem trumny Józefa w Egipcie. Choć Józef umarł z proroczym wyznaniem wiary na ustach, rodzina przymierza pozostała w obcej ziemi. Pomiędzy finałem Genesis a początkiem Exodus upływają dziesięciolecia, a nawet stulecia. Mała pasterska rodzina licząca siedemdziesiąt dusz przekształca się w potężny naród, co staje się bezpośrednią przyczyną gwałtownego konfliktu politycznego i duchowego.</p>
        <p>Pierwszy rozdział Księgi Wyjścia wprowadza nas w bolesną rzeczywistość radykalnej zmiany układu sił. Na tron Egiptu wstępuje nowy król, który „nie znał Józefa” – władca reprezentujący nową dynastię, kierujący się strachem, ksenofobią i zimną kalkulacją geopolityczną. Zamiast wdzięczności za ocalenie kraju z czasów głodu, faraon widzi w Hebrajczykach śmiertelne zagrożenie dla bezpieczeństwa państwa. Rozpoczyna się zaplanowana, stopniowa eskalacja represji: od przymusowej pracy niewolniczej, przez próbę potajemnego dzieciobójstwa rękami położnych, aż po jawny dekret ludobójczy nakazujący topienie noworodków w Nilu.</p>
        <p>W samym sercu tej imperialnej machiny terroru Bóg objawia swój transcendentny paradoks: <em>„Im bardziej go uciskali, tym bardziej się pomnażał i rozrastał”</em>. Władza faraona okazuje się bezsilna wobec Bożego błogosławieństwa życia. Co więcej, pierwszymi bohaterami wiary w tej księdze nie są potężni wodzowie ani kapłani, lecz dwie proste, bogobojne kobiety – położne Szifra i Pua, które zaryzykowały własne życie, wybierając posłuszeństwo Bogu ponad zbrodniczy rozkaz ziemskiego władcy.</p>
      </article>

      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-line pb-2">
          <i class="fa-solid fa-scroll"></i>
          <span>Część I — Korzenie przymierza i Boże błogosławieństwo (Wj 1:1–7)</span>
        </div>
        <p><strong>1. Hebrajski spójnik przymierza: We’elleh Szemot (1:1)</strong><br />Księga Wyjścia w tekście hebrajskim rozpoczyna się od słów <em>We’elleh Szemot</em> („A oto imiona”). Początkowy spójnik „i/a” (waw consecutivum) podkreśla nierozerwalną jedność historyczną i teologiczną z Księgą Rodzaju. Wyjście nie jest nowym początkiem z próżni, lecz bezpośrednią kontynuacją przymierza zawartego z Abrahamem, Izaakiem i Jakubem.</p>
        <p><strong>2. Imienne przybycie synów Izraela (1:1)</strong><br />Narrator wymienia synów Jakuba, zaznaczając, że każdy przyszedł ze swoim domem. Bóg nie traktuje swojego ludu jako anonimowej masy; każde plemię i każda rodzina mają swoje imię i swoje unikalne miejsce w planie zbawienia.</p>
        <p><strong>3. Struktura genealogiczna dwunastu plemion (1:2–4)</strong><br />Kolejność wyliczenia synów odzwierciedla porządek matek: najpierw synowie Lei (Ruben, Symeon, Lewi, Juda, Issachar, Zabulon), następnie Beniamin (syn Racheli, jako że Józef był już w Egipcie), a wreszcie synowie nałożnic Bilhy i Zilpy (Dan, Neftali, Gad, Aszer). To potwierdzenie prawowitego dziedzictwa całego Izraela.</p>
        <p><strong>4. Siedemdziesiąt dusz potomstwa Jakuba (1:5)</strong><br />Liczba siedemdziesiąt (por. Rdz 46:27) ma głębokie znaczenie symboliczne: oznacza pełnię i doskonałość zaczątku Bożego narodu. Mała grupa emigrantów staje się zarzewiem wielkiego narodu przymierza.</p>
        <p><strong>5. Obecność Józefa w Egipcie jako kotwica Opatrzności (1:5)</strong><br />Zdanie „A Józef był już w Egipcie” przypomina o uprzedzającej Bożej łasce. Zanim rodzina dotknęła głodu i obcej ziemi, Bóg posłał Józefa, aby przygotował dla nich schronienie i ocalenie.</p>
        <p><strong>6. Śmierć pokolenia patriarchów (1:6)</strong><br />Werset szósty notuje nieuchronny kres pewnej epoki: umiera Józef, umierają wszyscy jego bracia i całe owo pokolenie. Ludzkie autorytety i obrońcy odchodzą, lecz przymierze Boga z Jego ludem pozostaje niewzruszone.</p>
        <p><strong>7. Czterokrotny rozrost Izraela (1:7)</strong><br />Tekst używa niezwykłego nagromadzenia hebrajskich czasowników: synowie Izraela byli płodni (paru), rozmnożyli się obficie (jaszrecu), stali się liczni (jirbu) i potężni ponad miarę (jaacmu meod meod). To bezpośrednie echo pierwotnego błogosławieństwa stworzenia z Rdz 1:28 oraz obietnicy danej Abrahamowi (Rdz 12:2; 17:6).</p>
        <p><strong>8. Napełnienie ziemi Goszen (1:7)</strong><br />Sformułowanie „i ziemia napełniła się nimi” świadczy o widocznym, dynamicznym sukcesie demograficznym ludu Bożego w Egipcie. Błogosławieństwo Stwórcy okazuje się potężniejsze niż obca gleba i status cudzoziemców.</p>
      </article>

      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-line pb-2">
          <i class="fa-solid fa-handcuffs"></i>
          <span>Część II — Polityka strachu i uciemiężenie przez nowego faraona (Wj 1:8–14)</span>
        </div>
        <p><strong>9. Powstanie króla, który „nie znał Józefa” (1:8)</strong><br />Wstąpienie na tron nowego faraona oznaczało prawdopodobnie przewrót polityczny i wyparcie dynastii Hyksosów przez rodzimą, tebańską XVIII dynastię. „Nie znać Józefa” to nie tylko brak wiedzy historycznej, lecz świadoma odmowa uznania dawnych zasług i paktów przymierza.</p>
        <p><strong>10. Propaganda lęku i ksenofobia władcy (1:9)</strong><br />Faraon zwraca się do swego ludu językiem manipulacji: „Oto lud synów Izraela jest liczniejszy i silniejszy od nas”. Tyran buduje swoją władzę na kreowaniu wroga wewnętrznego i wzbudzaniu paranoi w społeczeństwie.</p>
        <p><strong>11. Przebiegłość zamiast mądrości (1:10)</strong><br />Słowa „Chodźcie, postąpmy z nim mądrze” (hebr. <em>nitchakmah lo</em>) oznaczają w rzeczywistości podstępną, cyniczną kalkulację. Gdy człowiek odrzuca Bożą mądrość, jego „roztropność” staje się okrutną machinacją polityczną.</p>
        <p><strong>12. Strach przed utratą taniej siły roboczej i sojuszem z wrogami (1:10)</strong><br />Faraon boi się dwóch rzeczy: że w razie wojny Izrael sprzymierzy się z najeźdźcami przeciwko Egiptowi, oraz że opuści ten kraj. To klasyczny dylemat despoty, który nienawidzi swoich poddanych, ale nie chce wypuścić ich z rąk ze względu na korzyści ekonomiczne.</p>
        <p><strong>13. Ustanowienie nadzorców niewolniczych prac (1:11)</strong><br />Egipcjanie ustanawiają nad Izraelem „przełożonych nad podatkami/robotami” (<em>sare missim</em>), aby łamać ich ducha i ciało katorżniczą pracą. Niewolnictwo staje się instytucjonalnym narzędziem kontroli społecznej.</p>
        <p><strong>14. Budowa miast-twierdz: Pitom i Ramses (1:11)</strong><br />Izraelici zostają zmuszeni do wznoszenia miast spichrzowych i magazynów zaopatrzeniowych dla armii faraona. Praca rąk ludu Bożego ma służyć chwale i potędze pogańskiego imperium.</p>
        <p><strong>15. Złota zasada Bożego rozrostu (1:12)</strong><br />Werset dwunasty przynosi centralne orędzie teologiczne rozdziału: „Lecz im bardziej go uciskali, tym bardziej się pomnażał i rozrastał”. Żadna ludzka presja nie jest w stanie powstrzymać Bożego planu; prześladowanie staje się katalizatorem wzrostu.</p>
        <p><strong>16. Wstręt i lęk Egipcjan (1:12)</strong><br />Wobec nieskuteczności represji Egipcjanie zaczynają czuć wstręt i trwożliwy lęk przed synami Izraela (hebr. <em>jakucu</em>). Niewolnicy, zamiast budzić pogardę, stają się źródłem paniki dla swoich panów.</p>
        <p><strong>17. Bezlitosna katorga (1:13)</strong><br />Egipcjanie nakładają prace na Izraelitów „bez litości” (hebr. <em>befarech</em> – z bezwzględnym okrucieństwem i surowością). Przemoc staje się normą państwową.</p>
        <p><strong>18. Gorzkie życie przy zaprawie i cegle (1:14)</strong><br />Tekst podkreśla, że Egipcjanie czynili życie Hebrajczyków „gorzkim” przez ciężką pracę przy glinie, zaprawie, cegłach i wszelkich pracach polowych. To doświadczenie goryczy stanie się później tłem dla pamiątki paschalnej (gorzkie zioła Paschy).</p>
        <p><strong>19. Niewola totalna bez przestrzeni na wytchnienie (1:14)</strong><br />Wszystkie prace narzucane były z bezwzględną surowością. Izrael został pozbawiony jakichkolwiek praw obywatelskich, stając się własnością państwa faraona.</p>
      </article>

      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-line pb-2">
          <i class="fa-solid fa-shield-heart"></i>
          <span>Część III — Bogobojność i święty opór położnych (Wj 1:15–21)</span>
        </div>
        <p><strong>20. Rozkaz faraona do hebrajskich położnych (1:15)</strong><br />Widząc fiasko represji ekonomicznych, faraon przechodzi do drugiego etapu: biologicznego wyniszczenia narodu. Wzywa osobiście dwie przełożone położnych.</p>
        <p><strong>21. Uwiecznione imiona: Szifra i Pua (1:15)</strong><br />Pismo Święte z rozmysłem pomija imię potężnego faraona (który w oczach świata był bogiem na ziemi), natomiast z czcią utrwala imiona dwóch prostych kobiet: Szifra („Piękna”) i Pua („Promienna/Jasna”). W Królestwie Bożym to wierność i bojaźń Boża decydują o wiecznej pamięci.</p>
        <p><strong>22. Tajny nakaz dzieciobójstwa (1:16)</strong><br />Faraon nakazuje mordowanie nowo narodzonych chłopców podczas porodu na stołkach porodowych (hebr. <em>obnajim</em>), podczas gdy dziewczynki mają pozostać przy życiu.</p>
        <p><strong>23. Cel eksterminacji męskich potomków (1:16)</strong><br />Wybicie synów miało natychmiast zniszczyć potencjał militarny Izraela, a pozostawione przy życiu córki miały zostać wchłonięte przez egipskie domy, co doprowadziłoby do całkowitej asymilacji i likwidacji tożsamości przymierza.</p>
        <p><strong>24. Bojaźń Boża silniejsza niż rozkaz króla (1:17)</strong><br />Położne „bały się Boga i nie czyniły tak, jak im rozkazał król Egiptu”. Bojaźń Boża (<em>jir’at Elohim</em>) nie jest paraliżującym strachem, lecz głębokim uznaniem suwerenności i świętości Boga, które rodzi moralną odwagę do przeciwstawienia się złu.</p>
        <p><strong>25. Pierwsze biblijne obywatelskie nieposłuszeństwo (1:17)</strong><br />Postawa Szifry i Pui stanowi najwcześniejszy w Piśmie Świętym przykład świętego nieposłuszeństwa wobec nieludzkiego prawa państwowego. Gdy nakaz władcy stoi w sprzeczności z prawem Bożym, człowiek wierzący musi wybrać posłuszeństwo Bogu (por. Dz 5:29).</p>
        <p><strong>26. Faraon żąda wyjaśnień (1:18)</strong><br />Król Egiptu wzywa położne na przesłuchanie: „Dlaczego to uczyniłyście i zostawiłyście chłopców przy życiu?”. Tyran odkrywa, że jego wola napotyka niewidzialną, nieugiętą barierę.</p>
        <p><strong>27. Odpowiedź położnych: hebrajskie kobiety są żywotne (1:19)</strong><br />Położne odpowiadają, że hebrajskie kobiety są silne i pełne życia (hebr. <em>chajot</em>) i rodzą same, zanim nadejdzie pomoc. Kobiety używają roztropności i sprytu w obronie bezbronnego życia przed mordercą.</p>
        <p><strong>28. Boże upodobanie i dobroć dla położnych (1:20)</strong><br />„Dlatego Bóg dobrze czynił położnym”. Bóg staje po stronie tych, którzy z narażeniem życia chronią niewinnych. Żaden czyn miłosierdzia i odwagi wiary nie pozostaje bez Bożej nagrody.</p>
        <p><strong>29. Niezłomny wzrost ludu Bożego (1:20)</strong><br />Końcówka wersetu dwudziestego ponownie akcentuje: „a lud pomnażał się i bardzo rósł w siłę”. Plany eksterminacji ponoszą całkowitą klęskę w zderzeniu z Bożą obietnicą.</p>
        <p><strong>30. Bóg zakłada domy bogobojnym położnym (1:21)</strong><br />Ponieważ położne bały się Boga, On „założył im domy” (hebr. <em>wajjaas lahem battim</em>) – obdarzył je własnymi rodzinami, potomstwem i trwałym błogosławieństwem. Te, które chroniły dzieci innych, same otrzymały dar trwałych domów od Pana.</p>
      </article>

      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-line pb-2">
          <i class="fa-solid fa-water"></i>
          <span>Część IV — Dekret zagłady i perspektywa ocalenia (Wj 1:22)</span>
        </div>
        <p><strong>31. Przejście od tajnego spisku do otwartego terroru (1:22)</strong><br />Gdy tajny plan z położnymi spalił na panewce, faraon zrzuca wszelkie maski. Przemoc państwowa staje się jawna i bezwzględna.</p>
        <p><strong>32. Powszechny nakaz dla całego narodu egipskiego (1:22)</strong><br />Faraon wydaje rozkaz nie tylko urzędnikom, lecz „całemu swemu ludowi”. Każdy Egipcjanin staje się potencjalnym donosicielem i katem hebrajskich niemowląt.</p>
        <p><strong>33. Rzeka Nil jako narzędzie mordu (1:22)</strong><br />„Każdego syna, który się urodzi, wrzućcie do rzeki”. Nil, który był dla Egiptu źródłem życia i bóstwem (Hapi), zostaje przez faraona zamieniony w cmentarz dla niewinnych hebrajskich dzieci.</p>
        <p><strong>34. Piekielna ironia tyranii (1:22)</strong><br />Faraon myśli, że woda Nilu pochłonie przyszłość Izraela. Nie wie, że właśnie z wód tej rzeki Bóg wkrótce wyłowi w małym koszyku tego, który złamie potęgę imperium i poprowadzi lud ku wolności.</p>
        <p><strong>35. Fałszywa łaskawość wobec córek (1:22)</strong><br />Rozkaz pozostawienia dziewczynek przy życiu nie wynika z litości, lecz z dążenia do całkowitej likwidacji narodu wybranego przez wymuszoną asymilację z Egipcjanami.</p>
        <p><strong>36. Narastająca ciemność przed świtem (1:22)</strong><br />Rozdział pierwszy kończy się sceną skrajnego zagrożenia i udręki. Wydaje się, że zło odnosi całkowity triumf, a naród przymierza stoi na krawędzi zagłady.</p>
        <p><strong>37. Przygotowanie sceny pod narodziny Wybawiciela (1:22)</strong><br />Najciemniejsza godzina nocy poprzedza wschód słońca. To w tę atmosferę terroru i dekretu śmierci wkracza w rozdziale drugim matka Mojżesza, kładąc podwaliny pod największe wyzwolenie Starego Testamentu.</p>
        <p><strong>38. Finał pierwszej perykopy Księgi Wyjścia (1:1–22)</strong><br />Rozdział pierwszy dowodzi, że walka o naród wybrany jest w istocie walką duchową pomiędzy królestwem ciemności a Bogiem Przymierza. Żadne imperium świata nie jest w stanie pokonać tych, których strzeże Wszechmogący.</p>
      </article>

      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-line pb-2">
          <i class="fa-solid fa-cross"></i>
          <span>Jezus w centrum — Typologia wybawienia i Królestwo Życia</span>
        </div>
        <p><strong>39. Faraon i Herod: zbrodnia tyrana a rzeź niewiniątek (Wj 1:16, 22 a Mt 2:16–18)</strong><br />Dekret faraona nakazujący mordowanie hebrajskich chłopców znajduje swój bezpośredni nowotestamentowy odpowiednik w rzezi niewiniątek w Betlejem nakazanej przez króla Heroda. W obu przypadkach szatan próbuje zniszczyć nasienie niewiasty (Rdz 3:15) i powstrzymać nadejście Wybawiciela, lecz Boża Opatrzność cudownie ratuje Wybrańca.</p>
        <p><strong>40. Nil śmierci a wody ocalenia i chrzest (Wj 1:22 a Wj 2:3; Rz 6:3–4)</strong><br />Woda, która w zamiarze faraona miała być grobem, staje się dla Mojżesza miejscem ocalenia. W Nowym Testamencie wody chrztu symbolizują zanurzenie w śmierć Chrystusa, z której dzięki zmartwychwstaniu wychodzimy do nowego, niezniszczalnego życia.</p>
        <p><strong>41. Kościół rosnący pod pręgierzem ucisku (Wj 1:12 a Dz 8:1–4; 2 Kor 4:8–10)</strong><br />Zasada „im bardziej ich uciskali, tym bardziej się pomnażali” stała się prawem rozwoju nowotestamentowego Kościoła. Krew męczenników okazała się nasieniem chrześcijan. Prześladowania w Jerozolimie rozproszyły uczniów, powodując gwałtowne rozprzestrzenienie się Ewangelii po całym ówczesnym świecie.</p>
        <p><strong>42. Chrystus jako Wybawiciel z duchowego Egiptu (Wj 1:13–14 a J 8:34–36; Hbr 2:14–15)</strong><br />Niewolnicza praca przy glinie i zaprawie pod bezlitosnym biczem nadzorców jest porażającym obrazem niewoli grzechu i strachu przed śmiercią. Jezus Chrystus przyszedł jako prawdziwy i większy Wybawiciel, aby przez swoją śmierć na krzyżu zniszczyć diabła i wyzwolić tych, którzy przez całe życie podlegali niewoli.</p>
        <p><strong>43. Odwaga bogobojnych kobiet a służba w Królestwie Bożym (Wj 1:17–21 a Łk 1:38, 46–55; 8:1–3)</strong><br />Szifra i Pua, które zaryzykowały wszystko dla ratowania życia, zapowiadają wierne kobiety Nowego Testamentu – od Marii przyjmującej Boże powołanie, po niewiasty trwające pod krzyżem i zwiastujące zmartwychwstanie Apostołom. Bóg wybiera to, co słabe w oczach świata, aby zawstydzić to, co potężne.</p>
        <p><strong>44. Zwycięstwo Życia nad dekretem śmierci (Wj 1:12, 22 a 1 Kor 15:54–57)</strong><br />Ostateczną odpowiedzią Boga na dekrety śmierci faraonów i cezarów jest pusty grób Jezusa Chrystusa. Śmierć została pochłonięta w zwycięstwie, a lud odkupiony krwią Baranka ma zagwarantowany wieczny rozrost w chwale Ojca.</p>
      </article>

      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-line pb-2">
          <i class="fa-solid fa-code-compare"></i>
          <span>Sprawdź w Biblii — Studium porównawcze</span>
        </div>
        <ul class="space-y-2.5 list-disc pl-5">
          <li><strong>Wj 1:7 → Rdz 1:28:</strong> Jak niezwykły rozrost Izraela w Egipcie nawiązuje do pierwotnego Bożego nakazu danego ludzkości przy stworzeniu?</li>
          <li><strong>Wj 1:8 → Dz 7:17–18:</strong> Jak diakon Szczepan w swojej mowie obronnej interpretuje moment pojawienia się nowego króla w kontekście historii zbawienia?</li>
          <li><strong>Wj 1:11 → Rdz 15:13–14:</strong> W jaki sposób uciemiężenie w Egipcie stanowiło dosłowne wypełnienie proroctwa przekazanego Abrahamowi w przymierzu nocy?</li>
          <li><strong>Wj 1:12 → Rz 8:31, 37:</strong> Dlaczego żaden ziemski ucisk, cierpienie ani prześladowanie nie mogą odłączyć wierzących od miłości Chrystusa?</li>
          <li><strong>Wj 1:13–14 → J 8:34–36:</strong> W czym bezlitosny trud przy zaprawie i cegłach przypomina niewolę grzechu, z której wyzwala jedynie Syn Boży?</li>
          <li><strong>Wj 1:15–17 → Dz 5:29:</strong> Na jakiej fundamentalnej zasadzie moralnej Apostołowie oparli swój sprzeciw wobec nakazu Sanhedrynu, nawiązując do postawy położnych?</li>
          <li><strong>Wj 1:17 → Prz 1:7; 16:6:</strong> Dlaczego bojaźń Pańska jest początkiem prawdziwej mądrości i skuteczną tarczą chroniącą przed uleganiem presji zła?</li>
          <li><strong>Wj 1:20–21 → Hbr 6:10:</strong> Jak autor Listu do Hebrajczyków zapewnia, że Bóg nie zapomina o trudzie miłości i wierności swoich sług?</li>
          <li><strong>Wj 1:22 → Mt 2:16–18:</strong> Jakie uderzające paralelizmy łączą rozkaz faraona z mordem niemowląt dokonanym przez Heroda w Betlejem?</li>
          <li><strong>Wj 1:12 → 2 Kor 4:8–10:</strong> Co oznacza paradoks apostoła Pawła: „Zewsząd ucisk doznajemy, ale nie jesteśmy pognębieni; jesteśmy w rozterce, ale nie w rozpaczy”?</li>
          <li><strong>Wj 1:21 → 1 Sm 2:30:</strong> W jaki sposób Boże zaopatrzenie dla domów położnych ilustruje obietnicę: „Tych, którzy mnie czczą, uczczę”?</li>
          <li><strong>Wj 1:5 → Dz 7:14:</strong> Jak tradycja biblijna i mowa Szczepana podsumowują korzenie wyjścia i Bożą wierność w zachowaniu siedemdziesięciu pięciu dusz Jakuba?</li>
        </ul>
      </article>

      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-line pb-2">
          <i class="fa-solid fa-compass"></i>
          <span>Prawda na dziś</span>
        </div>
        <ul class="space-y-2 list-disc pl-5">
          <li><strong>Boże błogosławieństwo jest silniejsze niż wrogość świata:</strong> żaden ludzki dekret, kryzys ani ucisk nie zniweczą Bożego powołania w Twoim życiu.</li>
          <li><strong>Presja i tyrania rodzą się z lęku:</strong> ludzie odrzucający Boga próbują kontrolować innych przez wzbudzanie strachu i ksenofobiczne podziały.</li>
          <li><strong>Ucisk staje się katalizatorem duchowego wzrostu:</strong> im większe trudności napotyka człowiek wierzący, tym potężniej objawia się w nim moc łaski.</li>
          <li><strong>Bojaźń Boża wyzwala z paraliżującego lęku przed ludźmi:</strong> kto czci Boga nade wszystko, zyskuje odwagę do odmowy udziału w niesprawiedliwości.</li>
          <li><strong>Bóg pamięta imiona pokornych:</strong> historia zapomina o bezbożnych władcach, lecz uwiecznia ciche bohaterstwo tych, którzy ratują życie.</li>
          <li><strong>Ochrona bezbronnych jest bezwzględnym obowiązkiem wiary:</strong> Bóg zawsze staje po stronie słabych i błogosławi tym, którzy stają w ich obronie.</li>
          <li><strong>Wierność Bogu zawsze przynosi nagrodę:</strong> Ten, który założył domy bogobojnym położnym, buduje trwałą przyszłość dla każdego, kto Mu bezgranicznie ufa.</li>
        </ul>
      </article>

      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-line pb-2">
          <i class="fa-solid fa-lightbulb"></i>
          <span>Pomyśl — Pytania do refleksji</span>
        </div>
        <ol class="space-y-2 list-decimal pl-5">
          <li>Czy w swoim życiu doświadczyłeś sytuacji, w której trudności, sprzeciw lub kryzys paradoksalnie przyczyniły się do Twojego duchowego dojrzenia?</li>
          <li>W jakich obszarach współczesnego świata dostrzegasz działanie propagandy lęku i podstępu przypominające manipulację faraona z Wj 1:9–10?</li>
          <li>Czy Twoje codzienne wybory kształtuje bojaźń Boża, czy raczej lęk przed opinią otoczenia, odrzuceniem lub stratą materialną?</li>
          <li>Jak w praktyce możesz dziś naśladować odwagę Szifry i Pui w przeciwstawianiu się nieetycznym naciskom w pracy lub środowisku?</li>
          <li>Dlaczego Pismo Święte zatarło imię potężnego faraona, a uwieczniło imiona dwóch hebrajskich położnych? Co to mówi o Bożej hierarchii wartości?</li>
          <li>W jaki sposób świadomość, że Jezus wyzwolił Cię z niewoli grzechu, wpływa na Twoją codzienną wdzięczność i poczucie wolności?</li>
          <li>W jaki konkretny sposób możesz stanąć w obronie osób słabych, nienarodzonych, chorych lub zepchniętych na margines w Twoim społeczeństwie?</li>
          <li>Jaką masz pewność, że pomimo nacisku zsekularyzowanego świata Kościół Jezusa Chrystusa wciąż wzrasta i odniesie ostateczne zwycięstwo?</li>
        </ol>
      </article>

      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-line pb-2">
          <i class="fa-solid fa-signature"></i>
          <span>Twoja decyzja</span>
        </div>
        <p>Pierwszy rozdział Księgi Wyjścia stawia nas w obliczu starcia dwóch diametralnie różnych porządków: despotycznego imperium budowanego na strachu i przemocy oraz Królestwa Boga, które pomnaża życie mimo ucisku. Faraon dysponował armią, rydwanami, nadzorcami i potęgą państwową, lecz jego zamysły runęły w zderzeniu z wiarą dwóch prostych położnych. Szifra i Pua nie posiadały tytułów politycznych ani siły militarnej; posiadały coś nieskończenie cenniejszego – bojaźń Bożą, która wyzwoliła je z paraliżującego strachu przed człowiekiem.</p>
        <p>Dziś stoisz przed tym samym wyborem. Świat wokół Ciebie może wywierać presję, wymagać moralnych kompromisów, grozić odrzuceniem lub narzucać standardy sprzeczne z Bożym Słowem. Możesz ulec konformizmowi i lękowi, albo stanąć w autorytecie wiary, wiedząc, że żaden ludzki ucisk nie powstrzyma Bożego rozrostu w Twoim sercu. W Jezusie Chrystusie Bóg pokonał tyranię grzechu i potęgę śmierci. Możesz dziś podjąć decyzję o bezkompromisowej wierności Bogu w każdym obszarze swojego życia.</p>
        <div class="p-4 rounded-xl bg-brand-gold/10 border border-brand-gold/30 text-amber-200 text-sm font-semibold">
          <strong>MOJA DECYZJA:</strong> Panie Boże, wybieram świętą bojaźń przed Twoim Majestatem ponad lęk przed ludźmi i nacisk tego świata. Wierzę, że Twoje błogosławieństwo pomnaża życie nawet w najtrudniejszych okolicznościach. Odrzucam kompromis z grzechem i deklaruję odwagę Szifry i Pui: będę chronić prawdę, stać po stronie słabych i iść za Jezusem Chrystusem, moim jedynym Zbawicielem i Królem!
        </div>
      </article>

      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-line pb-2">
          <i class="fa-solid fa-hands-praying"></i>
          <span>Modlitwa na 1 listopada</span>
        </div>
        <p>Wszechmogący Boże, Panie historii i Stwórco życia, dziękuję Ci za ten niedzielny poranek, pierwszy dzień listopada i za wejście w monumentalne karty Księgi Wyjścia. Dziękuję Ci, że jesteś Bogiem, który pamięta o swoim przymierzu i nigdy nie zapomina o swoim ludzie, nawet gdy ten znajduje się w głębokiej ciemności obcej ziemi.</p>
        <p>Uwielbiam Cię za to, że żadna tyrania, zbrodniczy dekret ani ludzka nienawiść nie są w stanie powstrzymać Twojego błogosławieństwa. Dziękuję Ci za świadectwo Szifry i Pui – za ich prostą, niezłomną wiarę i bojaźń Bożą, która okazała się potężniejsza niż potęga tronu faraona. Wybacz mi, Panie, każdą chwilę słabości, w której z lęku przed ludzką opinią, presją grupy lub doczesną stratą godziłem się na kompromisy sprzeczne z Twoją świętą wolą.</p>
        <p>Napełnij moje serce duchem odwagi, prawości i miłości. Spraw, abym na moim codziennym posterunku potrafił chronić życie, wspierać potrzebujących i nieugięcie zwiastować prawdę o Jezusie Chrystusie, który wyrwał nas z niewoli grzechu i śmierci. Prowadź naszą społeczność w tym nowym miesiącu formacji przez Księgę Wyjścia. Tobie niech będzie chwała, cześć i uwielbienie na wieki wieków. W imieniu Jezusa Chrystusa. Amen.</p>
      </article>

      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-line pb-2">
          <i class="fa-solid fa-list-check"></i>
          <span>Zadanie na dziś & Dziennik</span>
        </div>
        <ul class="space-y-2 text-xs sm:text-sm">
          <li class="flex items-start gap-2"><span class="text-brand-gold font-bold">☐</span> Przeczytaj uważnie cały pierwszy rozdział Księgi Wyjścia (Wj 1:1–22) w przekładzie UBG, zwracając szczególną uwagę na wersety 12 i 17.</li>
          <li class="flex items-start gap-2"><span class="text-brand-gold font-bold">☐</span> Przeprowadź rachunek sumienia: zidentyfikuj obszar, w którym odczuwasz ludzką presję lub lęk, i powierz go w modlitwie Bogu.</li>
          <li class="flex items-start gap-2"><span class="text-brand-gold font-bold">☐</span> Naucz się na pamięć wersetu pamięciowego: Wj 1:12 – „Lecz im bardziej go uciskali, tym bardziej się pomnażał i rozrastał”.</li>
          <li class="flex items-start gap-2"><span class="text-brand-gold font-bold">☐</span> Wybierz dziś odwagę wiary: podejmij jedną konkretną decyzję odmowy pójścia na łatwy kompromis moralny w swoim środowisku.</li>
          <li class="flex items-start gap-2"><span class="text-brand-gold font-bold">☐</span> Zadzwoń lub napisz do osoby przeżywającej udrękę, kryzys lub samotność, przypominając jej, że Bóg wyprowadza wzrost z najtrudniejszych prób.</li>
          <li class="flex items-start gap-2"><span class="text-brand-gold font-bold">☐</span> Podziękuj Bogu za rozpoczęcie drugiego miesiąca formacji biblijnej w programie „Z Biblią za Pan Brat”.</li>
          <li class="flex items-start gap-2"><span class="text-brand-gold font-bold">☐</span> Podziel się lekcją lub myślą przewodnią na Tablicy LUMINA lub w grupie formacyjnej WhatsApp.</li>
        </ul>
        <p class="text-xs text-brand-gold font-bold tracking-wider pt-2">✓ PRZECZYTAŁEM • ✓ ZROZUMIAŁEM • ✓ ZASTOSUJĘ</p>
      </article>

      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-line pb-2">
          <i class="fa-solid fa-calendar-day"></i>
          <span>Jutro — 2 listopada 2026</span>
        </div>
        <p class="text-white font-semibold">MIESIĄC 2 • KSIĘGA WYJŚCIA • DZIEŃ 33 — „KOSZYK NA NILU: NARODZINY WYBAWICIELA, UCIECZKA I WOŁANIE W NIESZCZĘŚCIU”</p>
        <p class="text-zinc-200">Czytanie: Wj 2:1–25. Narodziny Mojżesza w cieniu dekretu śmierci, wiara Jokebed, arka z sitowia na rzece Nil, adopcja przez córkę faraona, zabójstwo Egipcjanina, ucieczka do Madianu, małżeństwo z Seforą oraz Boże wejrzenie na jęk cierpiącego Izraela.</p>
      </article>

    </section>

    <!-- 20-QUESTION QUIZ SECTION -->
    <section class="kc-card space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-brand-line pb-4">
        <div>
          <h2 class="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-circle-question text-brand-gold"></i>
            <span>Sprawdź swoją wiedzę — 20 Pytań z Wj 1</span>
          </h2>
          <p class="text-xs text-zinc-400 mt-1">Odpowiedz na wszystkie pytania, aby sprawdzić znajomość tekstu biblijnego.</p>
        </div>
        <div class="flex items-center gap-3">
          <span id="quizScoreBadge" class="px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold font-mono font-bold text-sm border border-brand-gold/40">
            0/20
          </span>
          <button id="btnResetQuiz" type="button" class="px-3 py-1 text-xs rounded border border-brand-border text-zinc-400 hover:text-white transition">
            Zresetuj
          </button>
        </div>
      </div>

      <div id="quizContainer" class="space-y-4"></div>
      <div id="quizFeedback" class="text-center text-xs font-bold text-amber-300"></div>
    </section>

    <!-- SECTION SHARE & ACTIONS -->
    <section id="ccDailyShare" class="kc-card space-y-4 text-center">
      <h3 class="font-display text-base sm:text-lg font-bold text-white">
        Podziel się Słowem Bożym z innymi
      </h3>
      <p class="text-xs text-zinc-300 max-w-lg mx-auto">
        Przekaż tę lekcję rodzinie, przyjaciołom lub grupie biblijnej. Niech Boża mądrość buduje serca!
      </p>

      <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
        <a href="https://api.whatsapp.com/send?text=Dzie%C5%84%2032%20Kursu%20Codziennego%20Pisma%20%C5%9Awi%C4%99tego%3A%20W%20nieskr%C4%99powanym%20rozro%C5%9Bcie%20%E2%80%94%20Nowy%20kr%C3%B3l%2C%20uciemi%C4%99%C5%BCenie%20i%20Bo%C5%BCe%20ocalenie%20https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-32" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-500 transition flex items-center gap-2 shadow-lg min-h-[44px]">
          <i class="fa-brands fa-whatsapp"></i>
          <span>WhatsApp</span>
        </a>

        <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-32" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-500 transition flex items-center gap-2 shadow-lg min-h-[44px]">
          <i class="fa-brands fa-facebook"></i>
          <span>Facebook</span>
        </a>

        <a href="https://x.com/intent/tweet?text=Dzie%C5%84%2032%20Kursu%20Codziennego%20Pisma%20%C5%9Awi%C4%99tego%3A%20W%20nieskr%C4%99powanym%20rozro%C5%9Bcie%20%E2%80%94%20Nowy%20kr%C3%B3l%2C%20uciemi%C4%99%C5%BCenie%20i%20Bo%C5%BCe%20ocalenie&url=https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-32" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl bg-black text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 border border-zinc-700 transition flex items-center gap-2 shadow-lg min-h-[44px]">
          <i class="fa-brands fa-x-twitter"></i>
          <span>X / Twitter</span>
        </a>

        <button id="btnCopyLessonLink" type="button" class="px-5 py-2.5 rounded-xl bg-brand-panel text-zinc-200 border border-brand-border hover:border-brand-gold font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 min-h-[44px]">
          <i class="fa-solid fa-link"></i>
          <span id="copyLinkText">Kopiuj Link</span>
        </button>
      </div>
    </section>

    <!-- COMPLETION BUTTON -->
    <div class="text-center py-6">
      <button id="btnCompleteLesson" type="button" class="px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm uppercase tracking-wider transition shadow-xl hover:shadow-emerald-500/20 flex items-center gap-2 mx-auto min-h-[48px]">
        <i class="fa-solid fa-check-circle"></i>
        <span>Oznacz lekcję jako ukończoną</span>
      </button>
      <div id="completeMsg" class="hidden text-xs text-emerald-400 font-bold mt-2">
        ✓ Gratulacje! Lekcja Dnia 32 została pomyślnie zapisana w Twoim profilu formacyjnym.
      </div>
    </div>

  </main>

  <!-- FOOTER -->
  <footer class="border-t border-brand-border bg-brand-dark py-6 text-center text-xs text-zinc-500">
    <div class="max-w-4xl mx-auto px-4 space-y-2">
      <p>Christian Culture • Projekt „Z Biblią za Pan Brat” • 66 Ksiąg • 66 Miesięcy • 2009 Lekcji</p>
      <p>Wszystkie materiały i kursy są zawsze bezpłatne.</p>
    </div>
  </footer>

  <!-- SCRIPT: QUIZ, FONT CONTROLS, STORAGE -->
  <script>
    const QUIZ_DATA = ${JSON.stringify(quizData, null, 2)};

    let userAnswers = {};

    function renderQuiz() {
      const container = document.getElementById('quizContainer');
      container.innerHTML = '';

      QUIZ_DATA.forEach((item, idx) => {
        const qCard = document.createElement('div');
        qCard.className = 'p-3.5 rounded-xl bg-brand-panel/40 border border-brand-border/20 space-y-2';

        const qTitle = document.createElement('div');
        qTitle.className = 'text-xs sm:text-sm font-semibold text-zinc-200';
        qTitle.textContent = (idx + 1) + '. ' + item.q;
        qCard.appendChild(qTitle);

        const optGrid = document.createElement('div');
        optGrid.className = 'grid grid-cols-1 sm:grid-cols-3 gap-2';

        item.a.forEach((opt, optIdx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'kc-quiz-btn px-3 py-2 rounded-lg text-xs text-left border border-brand-border/30 bg-brand-navy/60 hover:bg-brand-panel hover:border-brand-gold text-zinc-300 transition';
          btn.textContent = opt;

          if (userAnswers[idx] !== undefined) {
            btn.disabled = true;
            if (optIdx === item.c) {
              btn.classList.add('correct');
            } else if (userAnswers[idx] === optIdx) {
              btn.classList.add('wrong');
            }
          }

          btn.onclick = () => {
            userAnswers[idx] = optIdx;
            localStorage.setItem('kc_day32_quiz', JSON.stringify(userAnswers));
            renderQuiz();
            updateScore();
          };

          optGrid.appendChild(btn);
        });

        qCard.appendChild(optGrid);
        container.appendChild(qCard);
      });
      updateScore();
    }

    function updateScore() {
      let score = 0;
      Object.keys(userAnswers).forEach(qIdx => {
        if (userAnswers[qIdx] === QUIZ_DATA[qIdx].c) score++;
      });
      document.getElementById('quizScoreBadge').textContent = score + '/20';
      const feedback = document.getElementById('quizFeedback');
      if (Object.keys(userAnswers).length === 20) {
        feedback.textContent = score >= 16 ? 'Świetny wynik! Gratulacje!' : 'Ukończono! Możesz zresetować quiz i spróbować ponownie.';
      }
    }

    document.getElementById('btnResetQuiz').onclick = () => {
      userAnswers = {};
      localStorage.removeItem('kc_day32_quiz');
      renderQuiz();
    };

    document.getElementById('btnCopyLessonLink').onclick = () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        document.getElementById('copyLinkText').textContent = 'Skopiowano!';
        setTimeout(() => document.getElementById('copyLinkText').textContent = 'Kopiuj Link', 2500);
      });
    };

    document.getElementById('btnCompleteLesson').onclick = () => {
      localStorage.setItem('kc_day32_completed', 'true');
      document.getElementById('completeMsg').classList.remove('hidden');
    };

    window.addEventListener('DOMContentLoaded', () => {
      try {
        const saved = localStorage.getItem('kc_day32_quiz');
        if (saved) userAnswers = JSON.parse(saved);
      } catch (e) {}
      renderQuiz();

      if (localStorage.getItem('kc_day32_completed') === 'true') {
        document.getElementById('completeMsg').classList.remove('hidden');
      }

      const fontPref = localStorage.getItem('kc_font_pref');
      if (fontPref) document.documentElement.setAttribute('data-kc-font', fontPref);

      const backBtn = document.getElementById('backToTopBtn');
      if (backBtn) {
        window.addEventListener('scroll', () => {
          if (window.scrollY > 300) backBtn.classList.add('visible');
          else backBtn.classList.remove('visible');
        });
        backBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  </script>

  <!-- Floating Back to Top Button -->
  <button class="back-to-top" id="backToTopBtn" type="button" aria-label="Przewiń do góry" title="Przewiń do góry">
    <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
  </button>
  <script src="/js/cc-daily-course-share.js?v=20261114_share2" defer></script>
  <script>
    let ttsUtterance = null;
    let isTtsPlaying = false;

    function toggleAudioLesson() {
      if (!('speechSynthesis' in window)) {
        alert('Twoja przeglądarka nie wspiera odtwarzania mowy (Web Speech API).');
        return;
      }

      if (isTtsPlaying) {
        window.speechSynthesis.cancel();
        isTtsPlaying = false;
        updateTtsUi(false);
        return;
      }

      const title = document.querySelector('h1')?.textContent?.trim() || '';
      const thought = document.querySelector('.p-5 p, .p-6 p, .kc-card p')?.textContent?.trim() || '';
      const body = document.querySelector('main')?.innerText || '';
      const fullSpeech = title + '. ' + thought + '. ' + body.slice(0, 4500);

      window.speechSynthesis.cancel();
      ttsUtterance = new SpeechSynthesisUtterance(fullSpeech);
      ttsUtterance.lang = 'pl-PL';
      ttsUtterance.rate = 0.96;

      ttsUtterance.onend = () => {
        isTtsPlaying = false;
        updateTtsUi(false);
      };

      ttsUtterance.onerror = () => {
        isTtsPlaying = false;
        updateTtsUi(false);
      };

      window.speechSynthesis.speak(ttsUtterance);
      isTtsPlaying = true;
      updateTtsUi(true);
    }

    function updateTtsUi(playing) {
      const icon = document.getElementById('tts-icon');
      const text = document.getElementById('tts-btn-text');
      const btn = document.getElementById('btn-audio-tts');
      if (playing) {
        if (icon) icon.className = 'fa-solid fa-pause text-xs text-amber-300';
        if (text) text.textContent = 'Pauza Audio';
        if (btn) btn.classList.add('ring-2', 'ring-amber-400');
      } else {
        if (icon) icon.className = 'fa-solid fa-volume-high text-xs text-amber-300';
        if (text) text.textContent = 'Słuchaj Audio';
        if (btn) btn.classList.remove('ring-2', 'ring-amber-400');
      }
    }

    let currentReaderZoom = 0;

    function initReaderSettings() {
      const savedFont = localStorage.getItem('kc_reader_font') || 'serif';
      const savedZoom = parseInt(localStorage.getItem('kc_reader_zoom') || '0', 10);
      applyReaderFont(savedFont, false);
      applyReaderZoom(savedZoom);
    }

    function toggleReaderFont() {
      const current = document.documentElement.getAttribute('data-kc-font') === 'sans' ? 'sans' : 'serif';
      const next = current === 'serif' ? 'sans' : 'serif';
      localStorage.setItem('kc_reader_font', next);
      applyReaderFont(next, true);
    }

    function applyReaderFont(font, updateZoom = true) {
      if (font === 'sans') {
        document.documentElement.setAttribute('data-kc-font', 'sans');
      } else {
        document.documentElement.removeAttribute('data-kc-font');
      }

      const desktopLabel = document.getElementById('reader-font-label');
      if (desktopLabel) {
        desktopLabel.textContent = font === 'sans' ? 'Krój: Inter' : 'Krój: Lora';
      }

      const mobileLabels = document.querySelectorAll('.kc-font-mobile-label');
      mobileLabels.forEach(el => {
        el.textContent = font === 'sans' ? 'Inter' : 'Lora';
      });

      const btn = document.getElementById('btn-reader-font');
      if (btn) {
        btn.title = font === 'sans' 
          ? 'Aktywna: Inter (Ekranowa bezszeryfowa). Kliknij, aby zmienić na Lora (Książkowa szeryfowa)' 
          : 'Aktywna: Lora (Książkowa szeryfowa). Kliknij, aby zmienić na Inter (Ekranowa bezszeryfowa)';
      }

      if (updateZoom) {
        applyReaderZoom(currentReaderZoom);
      }
    }

    function adjustFontSize(delta) {
      currentReaderZoom = Math.max(-2, Math.min(3, currentReaderZoom + delta));
      localStorage.setItem('kc_reader_zoom', currentReaderZoom);
      applyReaderZoom(currentReaderZoom);
    }

    function applyReaderZoom(zoom) {
      currentReaderZoom = zoom;
      const isSans = document.documentElement.getAttribute('data-kc-font') === 'sans';
      const baseRem = isSans ? (1.00 + (zoom * 0.07)) : (1.05 + (zoom * 0.07));
      document.documentElement.style.setProperty('--kc-font-size', baseRem.toFixed(3) + 'rem');
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initReaderSettings);
    } else {
      initReaderSettings();
    }
  </script>
</body>
</html>
`;

// 3. Zapisujemy plik lekcji do 4 ścieżek Clean URLs
const pathsToSave = [
  path.join(ROOT, 'akademia/kurscodzienny/dzien-32.html'),
  path.join(ROOT, 'akademia/kurscodzienny/dzien-32/index.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-32.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-32/index.html'),
  path.join(LUMINA_ROOT, 'akademia/kurscodzienny/dzien-32.html'),
  path.join(LUMINA_ROOT, 'akademia/kurscodzienny/dzien-32/index.html'),
  path.join(LUMINA_ROOT, 'kursy/kurscodzienny/dzien-32.html'),
  path.join(LUMINA_ROOT, 'kursy/kurscodzienny/dzien-32/index.html')
];

for (const p of pathsToSave) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, dzien32Html, 'utf8');
}
console.log('✅ Zapisano lekcję Dnia 32 we wszystkich 4 ścieżkach Clean URLs oraz mirrorze LUMINA!');

// 4. Aktualizacja Dnia 31 (nawigacja wsteczna/w przód)
const d31Files = [
  path.join(ROOT, 'akademia/kurscodzienny/dzien-31.html'),
  path.join(ROOT, 'akademia/kurscodzienny/dzien-31/index.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-31.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-31/index.html'),
  path.join(LUMINA_ROOT, 'akademia/kurscodzienny/dzien-31.html'),
  path.join(LUMINA_ROOT, 'akademia/kurscodzienny/dzien-31/index.html'),
  path.join(LUMINA_ROOT, 'kursy/kurscodzienny/dzien-31.html'),
  path.join(LUMINA_ROOT, 'kursy/kurscodzienny/dzien-31/index.html')
];

for (const fp of d31Files) {
  if (fs.existsSync(fp)) {
    let content = fs.readFileSync(fp, 'utf8');
    // Dodaj link do Dnia 32 w belce nawigacyjnej
    if (!content.includes('href="/akademia/kurscodzienny/dzien-32"')) {
      content = content.replace(
        '<a href="/akademia/kurscodzienny/dzien-30" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 min-h-[32px] flex items-center">Dzień 30</a>',
        '<a href="/akademia/kurscodzienny/dzien-30" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 min-h-[32px] flex items-center">← Dzień 30</a>\n        <a href="/akademia/kurscodzienny/dzien-32" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-amber-300 min-h-[32px] flex items-center font-bold">Dzień 32 →</a>'
      );
    }
    // Zmień zapowiedź jutra na aktywny przycisk
    if (!content.includes('Przejdź do Lekcji Dnia 32 (Wj 1)')) {
      content = content.replace(
        '<p class="text-zinc-200">Czytanie: Wj 1:1–22. Wkraczamy w drugą monumentalną księgę Biblii! Po śmierci Józefa w Egipcie powstaje nowy faraon, który nie znał Józefa. Zaczyna się czas ucisku i niewoli narodu wybranego, lecz Boża obietnica rozrasta się mimo ludzkich dekretów śmierci, otwierając drogę do narodzin wybawiciela.</p>',
        '<p class="text-zinc-200">Czytanie: Wj 1:1–22. Wkraczamy w drugą monumentalną księgę Biblii! Po śmierci Józefa w Egipcie powstaje nowy faraon, który nie znał Józefa. Zaczyna się czas ucisku i niewoli narodu wybranego, lecz Boża obietnica rozrasta się mimo ludzkich dekretów śmierci, otwierając drogę do narodzin wybawiciela.</p>\n        <div class="pt-2"><a href="/akademia/kurscodzienny/dzien-32" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs uppercase tracking-wider transition min-h-[44px]"><span>Przejdź do Lekcji Dnia 32 (Wj 1)</span><span>→</span></a></div>'
      );
    }
    fs.writeFileSync(fp, content, 'utf8');
  }
}
console.log('✅ Zaktualizowano nawigację w Dniu 31 o link i przycisk przejścia do Dnia 32!');

// 5. Aktualizacja rozwazania_baza.json
const refDay32 = {
  "id": "ref_day32_2026-11-01",
  "day": 32,
  "date": "2026-11-01",
  "dayOfWeek": "Niedziela",
  "title": "☀️ Z Biblią za Pan Brat — Dzień 32: W nieskrępowanym rozroście — Nowy król, uciskanie i Boże ocalenie",
  "teaser": "Dzień 32 — W nieskrępowanym rozroście: Nowy faraon, ucisk Izraela, heroiczna wiara położnych Szifry i Pui oraz Boże ocalenie życia wbrew dekretom śmierci (Wj 1:1–22)",
  "contentWeb": `☀️ Z Biblią za Pan Brat — Dzień 32: W nieskrępowanym rozroście — Nowy król, uciskanie i Boże ocalenie\n\nTrzydziesty drugi dzień naszej 66-miesięcznej podróży przez Pismo Święte otwiera monumentalną Księgę Wyjścia (Wj 1:1–22).\n\nPo śmierci pokolenia Józefa na tron Egiptu wstępuje nowy faraon, który nie znał Józefa. Kierowany ksenofobią i lękiem przed utratą dominacji, władca nakłada na Izraelitów nieludzkie jarzmo niewolnictwa, zmuszając ich do katorżniczej pracy przy budowie miast-twierdz Pitom i Ramses. Pismo Święte objawia jednak transcendentny paradoks Bożej Opatrzności: „Im bardziej go uciskali, tym bardziej się pomnażał i rozrastał” (Wj 1:12). Gdy represje ekonomiczne zawodzą, tyran wydaje zbrodniczy rozkaz wymordowania hebrajskich noworodków płci męskiej. W tym momencie na scenę wkraczają prawdziwe bohaterki wiary: hebrajskie położne Szifra i Pua, które zaryzykowały życie, wybierając bojaźń Bożą ponad zbrodniczy edykt władcy (Wj 1:17). Bóg wynagradza ich wierność, dając im własne domy i chroniąc lud przymierza. Wydarzenia te zapowiadają krzyż i zmartwychwstanie Jezusa Chrystusa: żadna wściekłość wroga ani dekret śmierci nie zniszczą Bożego ludu, a próby stają się zarzewiem duchowego triumfu (Mt 2:16–18; Rz 8:31, 37)! Wybieraj dzisiaj świadomie: odrzuć lęk przed ludźmi, zaufaj potędze Boga i broń życia w prawdzie Królestwa!\n\nJezus mówi dziś do Ciebie:\n„Lecz im bardziej go uciskali, tym bardziej się pomnażał i rozrastał, tak że obawiali się synów Izraela.” (Wj 1:12) oraz „Trzeba bardziej słuchać Boga niż ludzi.” (Dz 5:29)\n\nZadanie Taktyczne (Czytaj | Wierz | Działaj):\n* CZYTAJ: Przeczytaj uważnie cały 1. rozdział Księgi Wyjścia oraz apostolską deklarację odwagi z Dz 5:27–32.\n* WIERZ: Przyjmij prawdę, że w rękach Chrystusa każdy ucisk i każda trudność stają się narzędziem Twojego duchowego wzrostu.\n* DZIAŁAJ: Sprzeciw się dziś odważnie nieetycznemu kompromisowi lub niesprawiedliwości i wesprzyj osobę słabą lub zepchniętą na margines.\n\nW Christian Culture aplikacje i portale są zawsze BEZPŁATNE.\n\nDołącz do bazy i całej społeczności formacyjnej: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!\n\nPODAJ DALEJ 🔴 TRZYDZIESTY DRUGI DZIEŃ SERII!\nwww.polskieradio.cc | www.polskieradio.cc/lumina | www.cclite.pl\nWspomóż misję: patronite.pl/osobowoscplus`,
  "fullText": `☀️ Z Biblią za Pan Brat — Dzień Trzydziesty Drugi\n\nCzy zdajesz sobie sprawę, że w Bożym Królestwie żadna ludzka presja, żaden dekret wroga ani żadna próba ucisku nie są w stanie zatrzymać wzrostu Twojej wiary, a im bardziej świat usiłuje Cię złamać, tym potężniej objawia się w Tobie siła życia Chrystusa?\n\nZatrzymaj się na progu trzydziestego drugiego dnia naszej formacyjnej wędrówki przez całe Pismo Święte i zbadaj z całą surowością swoje serce w ten niedzielny poranek, pierwszego listopada dwa tysiące dwudziestego szóstego roku. Wypowiedz przed Ojcem to bezkompromisowe pytanie: Tato, dlaczego w obliczu rosnącej presji środowiska, lęku o przyszłość i nacisków tego świata tak łatwo ulegam paraliżującemu strachowi lub pokusie kompromisu, zamiast z niewzruszoną wiarą wyznać, że Twoje błogosławieństwo jest nieskończenie potężniejsze niż jakiekolwiek dekrety ziemskich tyranów? Wkraczając dzisiaj w Księgę Wyjścia, stajemy świadkami narodzin narodu przymierza w piecu ucisku. W Egipcie powstaje nowy król, który nie znał Józefa. Tyran kierowany strachem nakłada niewolnicze jarzmo i wydaje zbrodnicze rozkazy. Jednak Słowo Boże objawia paradoks Opatrzności: im bardziej go uciskali, tym bardziej się pomnażał i rozrastał! W psychologii odporności psychicznej i konformizmu społecznego zjawisko ulegania autorytetom pokazuje, jak łatwo człowiek rezygnuje z własnego sumienia pod wpływem strachu. Lecz w samym sercu pogańskiego imperium dwie proste kobiety, położne Szifra i Pua, dokonały czynu heroicznego: bały się Boga bardziej niż faraona i ocaliły niewinne życie! Prawda Królestwa uderza z wyzwalającą mocą: na krzyżu Golgoty szatan i władcy tego świata wydali ostateczny wyrok śmierci na Syna Bożego, lecz z grobu wytrysnęło wieczne zmartwychwstanie! Jezus Chrystus żyje, panuje i daje nam moc do przeciwstawienia się każdemu kłamstwu ciemności!\n\nJezus mówi dziś do Ciebie:\nLecz im bardziej go uciskali, tym bardziej się pomnażał i rozrastał, tak że obawiali się synów Izraela. (Księga Wyjścia, rozdział pierwszy, werset dwunasty, UBG)\n\nZadanie Taktyczne:\nZmiażdż dzisiaj wszelki lęk przed opinią ludzi, presją otoczenia oraz pokusą konformizmu na swoim niedzielnym posterunku. Twoim dzisiejszym rozkazem jest całkowite poddanie sumienia pod autorytet Bożej bojaźni: Bóg jest Twoim jedynym Królem! Zakazuję Ci ulegania manipulacji strachem i rezygnowania z prawdy Ewangelii dla świętego spokoju. Zastąp to żywym wyznaniem wiary: „Panie Jezu, Ty jesteś moim Panem — wybieram posłuszeństwo Bogu ponad ludzkie nakazy i wierzę, że w Twoich rękach każda próba pomnaża moją wiarę!”, czyniąc to z nienaganną, królewską klasą i całkowitym oddaniem dziecka Bożego.\n\nW Christian Culture aplikacje i portale są dla Ciebie zawsze bezpłatne.\n\nModlitwa Bojowa:\n„Ojcze w niebie, dziękuję Ci za ten niedzielny poranek i za moc Twojego Słowa, które rozprasza ciemność. Dziękuję Ci, że Twoje przymierze trwa na wieki i żadna ziemska potęga nie jest w stanie stłumić życia, które nam dałeś. Wybacz mi każdą chwilę tchórzostwa i kompromisu ze złem. Panie Jezu, napełnij mnie odwagą Szifry i Pui — daj mi serce, które nade wszystko boi się Ciebie, potrafi chronić słabych i odrzuca kłamstwa wroga. Tobie chwała na wieki.”\n\nRozkaz Dnia (Zadbaj o wzrost):\nNie idź w tę podróż sam. Wejdź do naszej bazy ludzi z pasją, zintegruj swoje siły z innymi i ruszaj ramię w ramię przez sześćdziesiąt sześć miesięcy formacji w unikalnym projekcie „Z Biblią za Pan Brat”.\n\nBłogosławieństwo:\nNiech Pan zastępów napełni Twoje serce pokojem i nieugiętą odwagą Jego prawdy, ustrzeże Cię od sideł wroga i błogosławi Twojemu domowi przez cały dzisiejszy dzień.\n\nDobrego dnia! Podaj dalej.`,
  "imageUrl": "https://polskieradio.cc/images/academy/daily/kc_day_32_ucisk_w_egipcie_odwaga_poloznych.jpg",
  "authorName": "Cezary Rogowski",
  "authorUid": "admin",
  "authorSlug": "cezaryrgowski"
};

const bazaJsonPaths = [
  path.join(ROOT, 'rozwazania_baza.json'),
  path.join(WEKTOR_ROOT, 'rozwazania_baza.json'),
  path.join(LUMINA_ROOT, 'rozwazania_baza.json')
];

for (const jp of bazaJsonPaths) {
  if (fs.existsSync(jp)) {
    try {
      const data = JSON.parse(fs.readFileSync(jp, 'utf8'));
      if (!data.some(item => item.id === refDay32.id)) {
        data.unshift(refDay32);
        fs.writeFileSync(jp, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Zaktualizowano ${jp} o wpis ref_day32_2026-11-01`);
      }
    } catch (e) {
      console.error(`Błąd aktualizacji ${jp}:`, e.message);
    }
  }
}

// 6. Aktualizacja rozwazania_baza.md
const mdPath = path.join(WEKTOR_ROOT, 'rozwazania_baza.md');
if (fs.existsSync(mdPath)) {
  const currentMd = fs.readFileSync(mdPath, 'utf8');
  if (!currentMd.includes('Dzień 32 (1 listopada 2026)')) {
    const appendMd = `\n\n# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI\n## Dzień 32 (1 listopada 2026): W nieskrępowanym rozroście — Nowy król, uciskanie i Boże ocalenie (Wj 1:1–22)\n\n${fs.readFileSync(path.join(ROOT, 'scripts/content/pakiet-day32-5wersji.md'), 'utf8')}`;
    fs.appendFileSync(mdPath, appendMd, 'utf8');
    console.log(`✅ Dopisano Dzień 32 do ${mdPath}`);
  }
}

// 7. Aktualizacja portals/ccn-news/src/data/articles.ts
const articlesTsPath = path.join(ROOT, 'portals/ccn-news/src/data/articles.ts');
if (fs.existsSync(articlesTsPath)) {
  let articlesTs = fs.readFileSync(articlesTsPath, 'utf8');
  if (!articlesTs.includes('art-z-biblia-za-pan-brat-dzien-32')) {
    const articleEntry = `  {
    "id": "art-z-biblia-za-pan-brat-dzien-32",
    "title": "Z Biblią za Pan Brat: Dzień 32 — W nieskrępowanym rozroście: nowy król, ucisk i święty opór położnych w Wj 1",
    "slug": "z-biblia-za-pan-brat-dzien-32-nowy-krol-ucisk-ocalenie",
    "excerpt": "Księga Wyjścia 1: Nowy faraon, ucisk Izraela, heroiczna wiara położnych Szifry i Pui oraz Boże ocalenie życia wbrew dekretom śmierci.",
    "content": [
      "W ramach ogólnopolskiego programu badań biblijnych \\"Z Biblią za Pan Brat\\", redakcja leksykonu teologicznego portalu informacyjnego CCN publikuje analityczne studium otwierającego rozdziału Księgi Wyjścia (Wj 1:1–22). Stanowi on przejście od narracji rodzinno-patriarchalnej Księgi Rodzaju do dramatu narodzin ludu Bożego w warunkach totalitarnej presji państwowej Nowego Państwa w Egipcie.",
      "1. ZMIANA PARADYGMATU POLITYCZNEGO I INSTYTUCJONALIZACJA UCISKU (WJ 1:1-14)",
      "Rozdział otwiera imienne zestawienie jedenastu synów Jakuba oraz wzmianka o siedemdziesięciu duszach potomstwa, które w ziemi Goszen doświadczyło bezprecedensowego rozrostu demograficznego (Wj 1:7; nawiązanie do Rdz 1:28 i 15:5). Sukces ten staje się pretekstem do represji po wstąpieniu na tron nowego monarchy, który \\"nie znał Józefa\\" (Wj 1:8). Narrator precyzyjnie demaskuje psychologiczny mechanizm tyranii: faraon projektuje własny lęk przed utratą dominacji na mniejszość hebrajską, kreując ją na zagrożenie militarne (Wj 1:9–10). Instytucjonalizacja niewolnictwa poprzez nałożenie robót przymusowych i budowę miast-twierdz Pitom i Ramses (Wj 1:11) rodzi jednak teologiczny paradoks: \\"Lecz im bardziej go uciskali, tym bardziej się pomnażał i rozrastał, tak że obawiali się synów Izraela\\" (Wj 1:12).",
      "2. BOJAŹŃ BOŻA A ETYKA NIEPOSŁUSZEŃSTWA OBYWATELSKIEGO: SZIFRA I PUA (WJ 1:15-21)",
      "Wobec fiaska represji ekonomicznych faraon sięga po biologiczne ludobójstwo, wydając tajny rozkaz hebrajskim położnym Szifrze i Pui, nakazujący mordowanie nowo narodzonych chłopców na stołkach porodowych (Wj 1:15–16). Autorskie uwiecznienie imion położnych przy jednoczesnym pominięciu imienia faraona stanowi wyraźny zabieg teologiczny: w oczach Boga to wierność moralna determinuje trwałą wartość człowieka. Położne odmawiają wykonania zbrodniczego rozkazu, kierując się \\"bojaźnią Bożą\\" (Wj 1:17) – postawą uznania transcendentnego prawa Stwórcy ponad dekret doczesnego władcy (por. Dz 5:29). Odpowiedź położnych chroniąca życie zostaje pobłogosławiona przez Boga, który obdarza je własnymi rodzinami (\\"założył im domy\\", Wj 1:21).",
      "3. TOTALITARNY DEKRET EKSTERMINACJI I IRONIA NILU (WJ 1:22)",
      "Finałowy werset rozdziału dokumentuje eskalację od tajnej intrygi do powszechnego dekretu skierowanego do całego narodu egipskiego: nakazu topienia nowo narodzonych synów w Nilu (Wj 1:22). Rzeka uchodząca w egipskim panteonie za bóstwo życia (Hapi) zostaje przekształcona w narzędzie masowej kaźni. Narracja osiąga tu punkt kulminacyjny napięcia, przygotowując czytelnika na pojawienie się Mojżesza, który z wód tej samej rzeki zostanie wyłowiony ku ocaleniu narodu.",
      "4. CHRYSTUS W CENTRUM: WYZWOLENIE Z NIEWOLI I TRIUMF ŻYCIA",
      "Perykopa Wj 1 znajduje pełne dopełnienie chrystocentryczne w Nowym Testamencie. Zbrodniczy edykt faraona zapowiada rzeź niewiniątek w Betlejem z rozkazu króla Heroda (Mt 2:16–18), z której Opatrzność ratuje Dziecię Jezus. Niewolniczy trud przy zaprawie i cegłach obrazuje duchową niewolę grzechu, z której wykupić może jedynie krew Chrystusa (J 8:34–36; Hbr 2:14–15). Wreszcie, wzrost Kościoła pośród prześladowań (Dz 8:1–4) oraz zmartwychwstanie Jezusa pieczętują ostateczny triumf Bożego Królestwa nad wszelkimi dekretami śmierci."
    ],
    "category": "Apologetyka",
    "portal": "apologetyka",
    "author": "Redakcja CCN News",
    "publishedAt": "2026-11-01T06:00:00.000Z",
    "dateFormatted": "1 listopada 2026",
    "imageUrl": "/images/news/art-z-biblia-za-pan-brat-dzien-32-nowy-krol-ucisk-ocalenie.jpg",
    "imageCaption": "W nieskrępowanym rozroście — uciskanie Izraela i wierność bogobojnych położnych (Wj 1:1–22). Z Biblią za Pan Brat Dzień 32",
    "readTimeMinutes": 7,
    "isHero": false,
    "isPopular": true,
    "popularRank": 1,
    "tags": [
      "Z Biblią za Pan Brat",
      "Księga Wyjścia",
      "Wj 1",
      "Szifra i Pua",
      "Mojżesz",
      "ucisk",
      "faraon",
      "bojaźń Boża",
      "przymierze"
    ],
    "relatedCourse": {
      "title": "Kurs Codzienny Pisma Świętego — Dzień 32",
      "lesson": "Dzień 32",
      "url": "/akademia/kurscodzienny/dzien-32"
    },
    "resourceLinks": [
      {
        "label": "Otwórz Lekcję Dnia 32 w Akademii Biblijnej",
        "url": "/akademia/kurscodzienny/dzien-32"
      },
      {
        "label": "Interlinearna MojaBiblia CC (Wj 1)",
        "url": "/mojabiblia"
      },
      {
        "label": "Akademia Biblijna LUMINA",
        "url": "/akademia"
      }
    ]
  },
`;
    // Wstaw przed pierwszym artykułem
    articlesTs = articlesTs.replace('export const articles: Article[] = [', 'export const articles: Article[] = [\n' + articleEntry);
    fs.writeFileSync(articlesTsPath, articlesTs, 'utf8');
    console.log('✅ Dodano artykuł Dnia 32 do portals/ccn-news/src/data/articles.ts');
  }
}

console.log('✨ Krok 1 zakończony pomyślnie!');
