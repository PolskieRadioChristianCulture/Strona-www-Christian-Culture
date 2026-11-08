#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

const day25Content = `<!DOCTYPE html>
<html lang="pl" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Dzień 25: JÓZEF W DOMU POTIFARA I W WIĘZIENIU — A PAN BYŁ Z NIM (Rdz 38:1–39:23) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>
  <meta name="description" content="Księga Rodzaju — Miesiąc 1, Dzień 25 (25 Października 2026). Wierność w obliczu pokusy, niesłuszne oskarżenie i Boża łaska w więziennych murach — Rdz 38:1–39:23. Kurs codzienny Pisma Świętego." />
  <link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-25" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-25" />
  <meta property="og:title" content="Dzień 25: JÓZEF W DOMU POTIFARA I W WIĘZIENIU — A PAN BYŁ Z NIM — Z Biblią za Pan Brat" />
  <meta property="og:description" content="Księga Rodzaju — Miesiąc 1, Dzień 25. Wierność Bogu w cieniu niesprawiedliwości — Rdz 38:1–39:23." />
  <meta property="og:image" content="https://polskieradio.cc/images/academy/daily/kc_day_25_jozef_potifar_wiezienie_pan_byl_z_nim.jpg?v=20261025" />

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
    :root {
      --kc-font-size: 1.05rem;
      --kc-line-height: 1.8;
    }
    html[data-kc-font="sans"] body,
    html[data-kc-font="sans"] .kc-article-content {
      font-family: 'Inter', 'Plus Jakarta Sans', system-ui, sans-serif !important;
    }
    .kc-article-content {
      font-size: var(--kc-font-size);
      line-height: var(--kc-line-height);
    }
    .kc-card {
      background: linear-gradient(180deg, rgba(15,26,42,0.85) 0%, rgba(10,18,30,0.92) 100%);
      border: 1px solid rgba(196,163,90,0.18);
      border-radius: 1rem;
      padding: 1.5rem;
      backdrop-filter: blur(8px);
      box-shadow: 0 10px 30px -5px rgba(0,0,0,0.5);
    }
    .kc-card:hover {
      border-color: rgba(196,163,90,0.35);
    }
    .kc-verse-badge {
      background: linear-gradient(135deg, rgba(196,163,90,0.18) 0%, rgba(142,110,50,0.08) 100%);
      border-left: 3px solid #C4A35A;
      padding: 1rem 1.25rem;
      border-radius: 0 0.75rem 0.75rem 0;
      margin: 1.25rem 0;
    }
    .kc-quiz-btn {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .kc-quiz-btn.correct {
      background: rgba(16,185,129,0.2) !important;
      border-color: #10B981 !important;
      color: #D1FAE5 !important;
    }
    .kc-quiz-btn.wrong {
      background: rgba(239,68,68,0.2) !important;
      border-color: #EF4444 !important;
      color: #FEE2E2 !important;
    }
    .back-to-top {
      position: fixed;
      right: 1.5rem;
      bottom: 2rem;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(15, 15, 15, 0.85);
      border: 1.5px solid #D4A94A;
      color: #D4A94A;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      cursor: pointer;
      z-index: 998;
      opacity: 0;
      visibility: hidden;
      transform: translateY(15px);
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }
    .back-to-top.visible { opacity: 1; visibility: visible; transform: translateY(0); }
  </style>
</head>
<body class="bg-brand-dark text-zinc-100 font-sans antialiased min-h-screen flex flex-col">

  <!-- TOP BAR / ECOSYSTEM NAV -->
  <header class="border-b border-brand-border bg-brand-navy/90 backdrop-blur sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <a href="/akademia" class="text-xs uppercase tracking-widest text-brand-gold font-bold flex items-center gap-2 hover:text-brand-gold-light transition">
          <i class="fa-solid fa-graduation-cap"></i>
          <span>Akademia Biblijna</span>
        </a>
        <span class="text-zinc-600">/</span>
        <a href="/akademia#kurscodzienny" class="text-xs text-zinc-300 hover:text-white transition">Kurs Codzienny</a>
        <span class="text-zinc-600">/</span>
        <span class="text-xs text-amber-400 font-semibold">Dzień 25</span>
      </div>

      <div class="flex items-center gap-2">
        <button id="kcFontToggle" type="button" class="px-2.5 py-1 text-xs rounded border border-brand-border text-zinc-300 hover:text-white hover:border-brand-gold transition" title="Zmień krój czcionki (Serif / Sans)">
          <i class="fa-solid fa-font"></i>
        </button>
        <button id="kcFontSizeDown" type="button" class="px-2 py-1 text-xs rounded border border-brand-border text-zinc-300 hover:text-white transition" title="Zmniejsz tekst">A-</button>
        <button id="kcFontSizeUp" type="button" class="px-2 py-1 text-xs rounded border border-brand-border text-zinc-300 hover:text-white transition" title="Zwiększ tekst">A+</button>
        <a href="/akademia#kurscodzienny" class="ml-2 px-3 py-1 text-xs rounded-full bg-brand-gold text-brand-dark font-bold hover:bg-brand-gold-light transition">
          Wszystkie Dni
        </a>
      </div>
    </div>
  </header>

  <!-- MAIN WRAPPER -->
  <main class="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">

    <!-- HERO HEADER -->
    <header class="space-y-4 text-center sm:text-left border-b border-brand-line pb-6">
      <div class="flex flex-wrap items-center justify-center sm:justify-between gap-2">
        <span class="px-3 py-1 rounded-full bg-brand-gold/15 text-brand-gold text-xs font-bold uppercase tracking-widest border border-brand-gold/30">
          Księga Rodzaju • Miesiąc 1 • Dzień 25 z 31
        </span>
        <span class="text-xs text-zinc-400 font-mono">25 PAŹDZIERNIKA 2026 • NIEDZIELA</span>
      </div>

      <!-- Jump Share Button (Standard JOMA-D005 / @Akademia) -->
      <div class="pt-2">
        <a href="#ccDailyShare" id="kcJumpShareBtn" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold hover:text-brand-gold-light border border-brand-gold/30 transition text-xs font-bold uppercase tracking-wider">
          <i class="fa-solid fa-share-nodes text-xs"></i>
          <i class="fa-solid fa-arrow-down text-xs"></i>
          <span>Podziel się tą lekcją ↓</span>
        </a>
      </div>

      <h1 class="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
        JÓZEF W DOMU POTIFARA I W WIĘZIENIU — A PAN BYŁ Z NIM
      </h1>
      <p class="text-base sm:text-lg text-amber-300/90 font-serif italic">
        Wierność w obliczu pokusy, niesłuszne oskarżenie i Boża łaska w więziennych murach (Rdz 38:1–39:23)
      </p>

      <!-- HERO IMAGE 16:9 -->
      <div class="relative rounded-2xl overflow-hidden border border-brand-border/40 shadow-2xl mt-4 aspect-video bg-zinc-900">
        <img
          src="/images/academy/daily/kc_day_25_jozef_potifar_wiezienie_pan_byl_z_nim.jpg"
          alt="Dzień 25: Józef w domu Potifara i w więzieniu — A Pan był z nim (Rdz 38–39)"
          class="w-full h-full object-cover"
          loading="eager"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-60"></div>
        <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-zinc-300 backdrop-blur-sm bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
          <span>Ilustracja biblijna: Józef w Egipcie — Boża obecność w próbie</span>
          <span class="font-mono text-brand-gold">Czytanie: Rdz 38:1–39:23</span>
        </div>
      </div>

      <!-- MEMORY VERSE CARD -->
      <div class="kc-verse-badge text-left">
        <div class="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
          <i class="fa-solid fa-bookmark"></i>
          <span>Werset Pamięciowy Dnia:</span>
        </div>
        <blockquote class="font-serif italic text-base sm:text-lg text-white">
          „Ale PAN był z Józefem i okazał mu miłosierdzie, i zjednał mu życzliwość w oczach przełożonego więzienia.”
        </blockquote>
        <div class="text-right text-xs text-brand-gold font-bold mt-1 font-mono">
          — Księga Rodzaju 39:21 (UBG)
        </div>
      </div>

      <!-- CORE THESIS -->
      <div class="p-4 rounded-xl bg-brand-panel/60 border border-brand-border/30 text-xs sm:text-sm text-zinc-300">
        <strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>
        Wierność Bogu w ukryciu i w cieniu niesprawiedliwości rodzi autentyczną Bożą obecność. Choć Józef został zdradzony przez braci, bezprawnie oskarżony i wtrącony do lochu, Pan był z nim. Prawdziwa wielkość rodzi się z prawości charakteru, która nie szuka ludzkiego poklasku, lecz żyje przed obliczem Najwyższego.
      </div>
    </header>

    <!-- LESSON BODY CONTENT -->
    <section class="space-y-6">

      <!-- INTRO -->
      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-line pb-2">
          <i class="fa-solid fa-compass"></i>
          <span>Zanim otworzysz Biblię</span>
        </div>
        <p class="text-zinc-200">
          Dwudziesty piąty dzień naszej wędrówki przez Księgę Rodzaju zestawia ze sobą dwa kontrastujące obrazy: moralne zagubienie Judy w Kanaanie (rozdział 38) oraz niezłomną czystość i wierność Józefa na dworze Potifara w pogańskim Egipcie (rozdział 39). Dlaczego autor natchniony wplata historię Judy i Tamar w sam środek dramatu Józefa? Ponieważ z linii Judy przyjdzie zapowiedziany Mesjasz — a Bóg potrafi wyprowadzić sprawiedliwość i ocalenie nawet z ludzkiej grzeszności. Z kolei w Józefie widzimy wzór sługi Pańskiego: człowieka, który w obliczu ogromnej pokusy nie pyta „czy ktoś mnie zobaczy?”, lecz mówi: „Jakże mógłbym popełnić tak wielką niegodziwość i zgrzeszyć przeciwko Bogu?”.
        </p>
      </article>

      <!-- CZĘŚĆ I: JUDA I TAMAR (Rdz 38:1–30) -->
      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-brand-line pb-2">
          <span class="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs font-bold">I</span>
          <span>Część I — Juda i Tamar: Odstępstwo, Przełom i Sprawiedliwość (Rdz 38:1–30)</span>
        </div>
        <div class="space-y-3 text-zinc-200">
          <p><strong>1. Oddalenie się od braci (38:1–5):</strong> Juda odchodzi od rodziny i wiąże się z Kananejczykiem Hirą oraz córką Szuy. To ostrzeżenie przed asymilacją i utratą tożsamości przymierza. Narodzeni synowie: Er, Onan i Szela.</p>
          <p><strong>2. Grzech synów i egoizm Onana (38:6–11):</strong> Er okazuje się zły w oczach Pana. Onan odmawia wypełnienia prawa lewiratu, myśląc wyłącznie o własnym interesie i dziedzictwie. Bóg uśmierca obu, a Tamar zostaje odesłana jako wdowa do domu ojca.</p>
          <p><strong>3. Tamar bierze sprawiedliwość w swoje ręce (38:12–23):</strong> Widząc niedotrzymanie obietnicy co do Szeli, Tamar przywdziewa strój nierządnicy przy drodze do Timny. Juda ulega zmysłom, zostawiając jako zastaw sygnet, laskę i sznur.</p>
          <p><strong>4. „Ona jest sprawiedliwsza ode mnie” (38:24–26):</strong> Gdy Juda chce spalić Tamar za rzekomy nierząd, ona okazuje jego własny sygnet. Juda przechodzi głęboki moralny wstrząs i publicznie wyznaje swoją winę. To początek duchowej przemiany Judy, który później w Egipcie zaoferuje własne życie za Beniamina.</p>
          <p><strong>5. Narodziny Peresa i Zeracha (38:27–30):</strong> Bliźnięta przychodzą na świat. Peres staje się bezpośrednim przodkiem Dawida i Jezusa Chrystusa (Mt 1:3). Boża łaska potrafi wpisać złamane ludzkie historie w genealogie Zbawiciela.</p>
        </div>
      </article>

      <!-- CZĘŚĆ II: JÓZEF W DOMU POTIFARA (Rdz 39:1–18) -->
      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-brand-line pb-2">
          <span class="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs font-bold">II</span>
          <span>Część II — Józef w domu Potifara: Wierność i Zwycięstwo nad Pokusą (Rdz 39:1–18)</span>
        </div>
        <div class="space-y-3 text-zinc-200">
          <p><strong>1. „PAN był z Józefem i szczęściło mu się” (39:1–6):</strong> Pogański dowódca straży Potifar zauważa, że cokolwiek Józef czyni, Pan sprawia, że mu się udaje. Józef zostaje zarządcą całego majątku. Prawdziwe świadectwo wiary widać w jakości codziennej pracy.</p>
          <p><strong>2. Próba charakteru (39:7–10):</strong> Żona Potifara codziennie namawia młodego Józefa do zdrady. Józef odrzuca pokusę argumentem podwójnej wierności: szacunku dla zaufania swego pana oraz świętej bojaźni Bożej.</p>
          <p><strong>3. Ucieczka w obliczu zagrożenia (39:11–13):</strong> Gdy kobieta chwyta go za szatę w pustym domu, Józef nie negocjuje — zostawia szatę w jej ręku i ucieka. Prawdziwa mądrość wie, kiedy stanąć do walki, a kiedy uciekać przed złem.</p>
          <p><strong>4. Fałszywe oskarżenie (39:14–18):</strong> Odrzucona pycha rodzi nienawiść. Żona Potifara oskarża Józefa przed domownikami i mężem, wykorzystując porzuconą szatę jako rzekomy dowód napaści.</p>
        </div>
      </article>

      <!-- CZĘŚĆ III: JÓZEF W WIĘZIENIU (Rdz 39:19–23) -->
      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-brand-line pb-2">
          <span class="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs font-bold">III</span>
          <span>Część III — Józef w więzieniu: „Ale PAN był z Józefem” (Rdz 39:19–23)</span>
        </div>
        <div class="space-y-3 text-zinc-200">
          <p><strong>1. Niesprawiedliwy wyrok (39:19–20):</strong> Rozgniewany Potifar wtrąca Józefa do więzienia królewskiego. Józef płaci najwyższą doczesną cenę za swoją moralną czystość — traci pozycję, dobre imię i ląduje w lochu.</p>
          <p><strong>2. Boża obecność nie zależy od murów (39:21):</strong> Kluczowy werset rozdziału: „Ale PAN był z Józefem i okazał mu miłosierdzie”. Bóg nie uchronił Józefa przed lochami, ale wszedł tam razem z nim!</p>
          <p><strong>3. Autorytet w cieniu cierpienia (39:22–23):</strong> Przełożony więzienia powierza Józefowi pieczę nad wszystkimi więźniami. Człowiek prowadzony przez Ducha Bożego promieniuje spokojem i rzetelnością w każdych okolicznościach.</p>
        </div>
      </article>

      <!-- REFLEKSJA I ZASTOSOWANIE -->
      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-line pb-2">
          <i class="fa-solid fa-lightbulb"></i>
          <span>Most do Ewangelii i Zastosowanie Praktyczne</span>
        </div>
        <p class="text-zinc-200 leading-relaxed">
          Historia Józefa to doskonała zapowiedź Chrystusa — wiernego Sługi, który został fałszywie oskarżony przez tych, którym służył, i skazany niewinnie, aby przez Niego Bóg dokonał ocalenia narodów. W Twoim życiu mogą pojawić się chwile, gdy za uczciwość i wierność Ewangelii spotka Cię odrzucenie, kpina lub niesłuszna krytyka. Pamiętaj: loch więzienny Potifara nie był końcem historii Józefa, lecz Bożą szkołą charakteru przed pałacem faraona. Jeśli Pan jest z Tobą, żadna ludzka intryga nie jest w stanie udaremnić Bożego planu dla Twojego życia.
        </p>
      </article>

    </section>

    <!-- 20-QUESTION QUIZ SECTION -->
    <section class="kc-card space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-brand-line pb-4">
        <div>
          <h2 class="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-circle-question text-brand-gold"></i>
            <span>Sprawdź swoją wiedzę — 20 Pytań z Rdz 38–39</span>
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
        <a href="https://api.whatsapp.com/send?text=Dzie%C5%84%2025%20Kursu%20Codziennego%20Pisma%20%C5%9Awi%C4%99tego%3A%20J%C3%B3zef%20w%20domu%20Potifara%20i%20w%20wi%C4%99zieniu%20%E2%80%94%20A%20Pan%20by%C5%82%20z%20nim%20https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-25" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-500 transition flex items-center gap-2 shadow-lg min-h-[44px]">
          <i class="fa-brands fa-whatsapp"></i>
          <span>WhatsApp</span>
        </a>

        <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-25" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-500 transition flex items-center gap-2 shadow-lg min-h-[44px]">
          <i class="fa-brands fa-facebook"></i>
          <span>Facebook</span>
        </a>

        <a href="https://x.com/intent/tweet?text=Dzie%C5%84%2025%20Kursu%20Codziennego%20Pisma%20%C5%9Awi%C4%99tego%3A%20J%C3%B3zef%20w%20domu%20Potifara%20%E2%80%94%20A%20Pan%20by%C5%82%20z%20nim&url=https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-25" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl bg-black text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 border border-zinc-700 transition flex items-center gap-2 shadow-lg min-h-[44px]">
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
        ✓ Gratulacje! Lekcja Dnia 25 została pomyślnie zapisana w Twoim profilu formacyjnym.
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
    const QUIZ_DATA = [
      { q: "1. Od kogo odłączył się Juda na początku 38. rozdziału?", a: ["Od faraona", "Od swoich braci, zamieszkując u Hiry Adullamity", "Od Mojżesza"], c: 1 },
      { q: "2. Jak miała na imię żona Judy, córka Kananejczyka?", a: ["Córka Szuy", "Debora", "Miriam"], c: 0 },
      { q: "3. Jak mieli na imię trzej synowie Judy ze Szuy?", a: ["Dan, Neftali i Gad", "Er, Onan i Szela", "Ruben, Symeon i Lewi"], c: 1 },
      { q: "4. Kto był żoną pierworodnego syna Judy, Era?", a: ["Rachela", "Tamar", "Asenat"], c: 1 },
      { q: "5. Dlaczego umarł pierworodny syn Judy, Er?", a: ["Zginął na wojnie", "Był zły w oczach PANA i PAN go uśmiercił", "Z powodu głodu"], c: 1 },
      { q: "6. Jaki grzech popełnił Onan wobec Tamar i prawa lewiratu?", a: ["Ukradł jej posag", "Marnował nasienie na ziemię, by nie dać potomstwa bratu", "Wygnał ją do Egiptu"], c: 1 },
      { q: "7. Gdzie Tamar usiadła przebrana za nierządnicę?", a: ["Przy wejściu do bramy Enajim przy drodze do Timny", "W pałacu w Memfis", "W świątyni w Betel"], c: 0 },
      { q: "8. Co dał Juda Tamar jako zastaw za koźlę ze stada?", a: ["Worek złota", "Swój sygnet, sznur i laskę", "Miedziany miecz"], c: 1 },
      { q: "9. Co wykrzyknął Juda, gdy Tamar okazała jego własny sygnet?", a: ["Ona jest sprawiedliwsza ode mnie", "To fałszerstwo!", "Spalcie ją natychmiast"], c: 0 },
      { q: "10. Jak mieli na imię synowie bliźniacy narodzeni z Tamar?", a: ["Kain i Abel", "Peres i Zerach", "Efraim i Manasses"], c: 1 },
      { q: "11. Komu kupcy iszmaelscy sprzedali Józefa w Egipcie?", a: ["Potifarowi, urzędnikowi faraona, dowódcy straży", "Kapłanowi z On", "Kupcom fenickim"], c: 0 },
      { q: "12. Co zauważył pan Józefa, Potifar?", a: ["Że Józef nie potrafi liczyć", "Że PAN był z nim i wszystko, co czynił, szczęściło się w jego ręku", "Że Józef planuje ucieczkę"], c: 1 },
      { q: "13. Jaką pozycję powierzył Potifar Józefowi?", a: ["Uczynił go niewolnikiem polowym", "Ustanowił go zarządcą swego domu i całego majątku", "Zrobił go kucharzem"], c: 1 },
      { q: "14. Czego Potifar NIE powierzył w ręce Józefa?", a: ["Chleba, który sam spożywał", "Swoich stad", "Złota i srebra"], c: 0 },
      { q: "15. Jaka pokusa stanęła przed Józefem w domu Potifara?", a: ["Żona Potifara codziennie namawiała go do cudzołóstwa", "Chęć kradzieży skarbca", "Bunt niewolników"], c: 0 },
      { q: "16. Jaką odpowiedź dał Józef żonie swego pana?", a: ["„Zrobię to, gdy nikt nie patrzy”", "„Jakże mógłbym popełnić tak wielką niegodziwość i zgrzeszyć przeciwko Bogu?”", "„Zapłać mi najpierw”"], c: 1 },
      { q: "17. Co zrobił Józef, gdy żona Potifara chwyciła go za szatę?", a: ["Zostawił szatę w jej ręku i wybiegł na dwór", "Uderzył ją", "Zgodził się na jej prośbę"], c: 0 },
      { q: "18. Co zrobiła żona Potifara z porzuconą szatą Józefa?", a: ["Spaliła ją", "Oskarżyła Józefa przed domownikami i mężem o próbę gwałtu", "Oddała ją żebrakowi"], c: 1 },
      { q: "19. Gdzie rozgniewany Potifar wtrącił Józefa?", a: ["Do dołu z lwami", "Do więzienia, w którym trzymano więźniów króla", "Na galery"], c: 1 },
      { q: "20. Co działo się z Józefem w więzieniu według Rdz 39:21?", a: ["Załamał się i stracił wiarę", "PAN był z nim, okazał mu miłosierdzie i zjednał mu życzliwość przełożonego więzienia", "Został zapomniany przez wszystkich na zawsze"], c: 1 }
    ];

    let userAnswers = {};

    function renderQuiz() {
      const container = document.getElementById('quizContainer');
      container.innerHTML = '';

      QUIZ_DATA.forEach((item, idx) => {
        const qCard = document.createElement('div');
        qCard.className = 'p-3.5 rounded-xl bg-brand-panel/40 border border-brand-border/20 space-y-2';

        const qTitle = document.createElement('div');
        qTitle.className = 'text-xs sm:text-sm font-semibold text-zinc-200';
        qTitle.textContent = item.q;
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

          btn.onclick = () => selectAnswer(idx, optIdx);
          optGrid.appendChild(btn);
        });

        qCard.appendChild(optGrid);
        container.appendChild(qCard);
      });

      updateScore();
    }

    function selectAnswer(qIdx, optIdx) {
      userAnswers[qIdx] = optIdx;
      localStorage.setItem('kc_day25_quiz', JSON.stringify(userAnswers));
      renderQuiz();
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
      localStorage.removeItem('kc_day25_quiz');
      renderQuiz();
    };

    // Font Controls
    document.getElementById('kcFontToggle').onclick = () => {
      const isSans = document.documentElement.getAttribute('data-kc-font') === 'sans';
      document.documentElement.setAttribute('data-kc-font', isSans ? 'serif' : 'sans');
      localStorage.setItem('kc_font_pref', isSans ? 'serif' : 'sans');
    };

    let curFontSize = 1.05;
    document.getElementById('kcFontSizeUp').onclick = () => {
      curFontSize = Math.min(1.4, curFontSize + 0.05);
      document.documentElement.style.setProperty('--kc-font-size', curFontSize + 'rem');
    };
    document.getElementById('kcFontSizeDown').onclick = () => {
      curFontSize = Math.max(0.85, curFontSize - 0.05);
      document.documentElement.style.setProperty('--kc-font-size', curFontSize + 'rem');
    };

    // Copy link
    document.getElementById('btnCopyLessonLink').onclick = () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        document.getElementById('copyLinkText').textContent = 'Skopiowano!';
        setTimeout(() => document.getElementById('copyLinkText').textContent = 'Kopiuj Link', 2500);
      });
    };

    // Completion button
    document.getElementById('btnCompleteLesson').onclick = () => {
      localStorage.setItem('kc_day25_completed', 'true');
      document.getElementById('completeMsg').classList.remove('hidden');
    };

    // Restore state
    window.addEventListener('DOMContentLoaded', () => {
      try {
        const saved = localStorage.getItem('kc_day25_quiz');
        if (saved) userAnswers = JSON.parse(saved);
      } catch (e) {}
      renderQuiz();

      if (localStorage.getItem('kc_day25_completed') === 'true') {
        document.getElementById('completeMsg').classList.remove('hidden');
      }

      const fontPref = localStorage.getItem('kc_font_pref');
      if (fontPref) document.documentElement.setAttribute('data-kc-font', fontPref);

      // Back to top
      const backBtn = document.getElementById('backToTopBtn');
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) backBtn.classList.add('visible');
        else backBtn.classList.remove('visible');
      });
      backBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  </script>

  <!-- Floating Back to Top Button -->
  <button class="back-to-top" id="backToTopBtn" type="button" aria-label="Przewiń do góry" title="Przewiń do góry">
    <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
  </button>
  <script src="/js/cc-daily-course-share.js?v=20261108_wa1" defer></script>
</body>
</html>
`;

// Ścieżki docelowe w projekcie
const targets = [
  path.join(ROOT, 'akademia/kurscodzienny/dzien-25.html'),
  path.join(ROOT, 'akademia/kurscodzienny/dzien-25/index.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-25.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-25/index.html'),
  path.join(LUMINA_ROOT, 'akademia/kurscodzienny/dzien-25.html'),
  path.join(LUMINA_ROOT, 'akademia/kurscodzienny/dzien-25/index.html'),
  path.join(LUMINA_ROOT, 'kursy/kurscodzienny/dzien-25.html'),
  path.join(LUMINA_ROOT, 'kursy/kurscodzienny/dzien-25/index.html')
];

for (const t of targets) {
  const dir = path.dirname(t);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(t, day25Content, 'utf8');
  console.log('✅ Zapisano lekcję Dnia 25:', t);
}
console.log('🎉 Pomyślnie wygenerowano lekcję Dnia 25 w 4 ścieżkach Clean URLs!');
