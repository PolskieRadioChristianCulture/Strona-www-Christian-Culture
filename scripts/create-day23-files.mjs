import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

export function getDay23Html() {
  return `<!DOCTYPE html>
<html lang="pl" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Dzień 23: POJEDNANIE I POWRÓT DO BETEL (Rdz 33:1–35:29) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>
  <meta name="description" content="Księga Rodzaju — Miesiąc 1, Dzień 23 (23 Października 2026). Pojednanie braci, dramat Sychem i odnowa w Betel — Rdz 33:1–35:29. Kurs codzienny Pisma Świętego." />
  <link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-23" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-23" />
  <meta property="og:title" content="Dzień 23: POJEDNANIE I POWRÓT DO BETEL — Z Biblią za Pan Brat" />
  <meta property="og:description" content="Księga Rodzaju — Miesiąc 1, Dzień 23. Bóg prowadzi ku pokojowi, oczyszczeniu domu z obcych bogów i odnowieniu przymierza — Rdz 33:1–35:29." />
  <meta property="og:image" content="https://polskieradio.cc/images/academy/daily/kc_day_23_pojednanie_i_powrot_do_betel.jpg?v=20261023" />

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
  </style>
</head>
<body class="bg-brand-dark text-zinc-100 min-h-screen flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">

  <!-- ── GÓRNA BELKA NAWIGACYJNA ── -->
  <header class="sticky top-0 z-40 bg-brand-dark/95 backdrop-blur-md border-b border-brand-line">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <a href="/akademia/kurscodzienny" class="text-zinc-400 hover:text-amber-300 transition flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider min-h-[44px]">
          <i class="fa-solid fa-arrow-left text-xs"></i>
          <span>Wróć do kursu</span>
        </a>
        <span class="text-zinc-600">|</span>
        <span class="text-xs font-bold text-amber-400 uppercase tracking-widest hidden sm:inline">Miesiąc 1: Księga Rodzaju</span>
      </div>

      <!-- Narzędzia lektury (Krój pisma, Rozmiar, Audio TTS) -->
      <div class="flex items-center gap-2">
        <button type="button" onclick="toggleReaderFont()" class="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-amber-300 hover:border-amber-400/40 transition flex items-center gap-1.5 min-h-[44px]" title="Przełącz krój pisma (Szeryfowy / Bezszeryfowy)">
          <i class="fa-solid fa-font text-amber-400 text-xs"></i>
          <span class="hidden md:inline" id="reader-font-label">Krój: Lora</span>
        </button>
        <div class="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden min-h-[44px]">
          <button type="button" onclick="adjustFontSize(-1)" class="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition min-h-[44px] min-w-[36px] flex items-center justify-center font-bold" title="Zmniejsz tekst">A-</button>
          <span class="text-zinc-700">|</span>
          <button type="button" onclick="adjustFontSize(1)" class="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition min-h-[44px] min-w-[36px] flex items-center justify-center font-bold" title="Powiększ tekst">A+</button>
        </div>
        <button type="button" onclick="toggleTTS()" id="tts-btn" class="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 hover:border-amber-400 transition text-xs font-bold flex items-center gap-2 min-h-[44px]">
          <i class="fa-solid fa-volume-high text-xs" id="tts-icon"></i>
          <span class="hidden sm:inline" id="tts-btn-text">Słuchaj Audio</span>
        </button>
      </div>
    </div>
  </header>

  <!-- ── PODPINAJĄCY PASEK BREADCRUMB & POSTĘPU ── -->
  <nav class="bg-brand-navy/60 border-b border-brand-line text-xs py-2 px-4" aria-label="Nawigacja okruszkowa">
    <div class="max-w-6xl mx-auto flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 text-zinc-400 text-[11px] truncate">
        <a href="/akademia" class="hover:text-amber-300">Akademia</a>
        <span>›</span>
        <a href="/akademia/kurscodzienny" class="hover:text-amber-300">Z Biblią za Pan Brat</a>
        <span>›</span>
        <span class="text-zinc-400">Miesiąc 1: Księga Rodzaju</span>
        <span>›</span>
        <span class="text-amber-400 font-bold">DZIEŃ 23</span>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" onclick="toggleReaderFont()" class="text-zinc-300 hover:text-amber-300 px-2 py-1 min-h-[32px] flex items-center gap-1 sm:hidden text-[11px] rounded bg-zinc-900 border border-zinc-800" title="Przełącz krój pisma">
          <i class="fa-solid fa-font text-amber-400 text-[10px]"></i>
          <span class="kc-font-mobile-label">Lora</span>
        </button>
        <a href="/akademia/kurscodzienny/dzien-22" class="text-zinc-400 hover:text-white px-2 py-1 min-h-[32px] flex items-center">← Dzień 22</a>
        <span class="text-zinc-700">|</span>
        <a href="/akademia/kurscodzienny" class="text-zinc-400 hover:text-white px-2 py-1 min-h-[32px] flex items-center">Spis Dni</a>
        <span class="text-zinc-700">|</span>
        <a href="#jutro" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-amber-300 min-h-[32px] flex items-center font-bold">Dzień 24 →</a>
      </div>
    </div>
  </nav>

  <!-- ── HERO LEKCJI ── -->
  <section class="relative overflow-hidden py-10 px-4 border-b border-brand-line" style="background: radial-gradient(ellipse at top, rgba(196,163,90,0.12) 0%, rgba(7,9,14,0) 70%);">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
        <span>KSIĘGA RODZAJU — MIESIĄC 1</span>
        <span>•</span>
        <span>DZIEŃ 23 — 23 PAŹDZIERNIKA 2026</span>
      </div>

      <!-- PRZYCISK SKOKU DO SEKCJI PODZIEL SIĘ TĄ LEKCJĄ -->
      <div class="kc-jump-to-share-wrap mb-3">
        <a href="#ccDailyShare" id="kcJumpShareBtn" class="kc-jump-to-share inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 hover:border-amber-300 hover:text-white transition-all text-xs font-semibold shadow-md min-h-[44px]" title="Przejdź do sekcji: Podziel się tą lekcją" aria-label="Przejdź do sekcji Podziel się tą lekcją">
          <i class="fa-solid fa-share-nodes text-amber-400 text-xs" aria-hidden="true"></i>
          <span>Podziel się tą lekcją ↓</span>
        </a>
      </div>

      <h1 class="font-display text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
        POJEDNANIE I POWRÓT DO BETEL
      </h1>

      <p class="font-serif text-lg sm:text-xl text-amber-200/90 leading-relaxed max-w-3xl mb-6">
        Bóg prowadzi ku pokojowi, oczyszczeniu i odnowieniu przymierza. Czytanie: Rdz 33:1–35:29.
      </p>

      <!-- Panel Metadanych Lekcji -->
      <div class="flex flex-wrap gap-4 text-xs text-zinc-400 border-t border-brand-line pt-4">
        <div class="flex items-center gap-1.5">
          <i class="fa-solid fa-book-open text-amber-400"></i>
          <span>Fragment: <strong>Księga Rodzaju 33:1–35:29</strong></span>
        </div>
        <div class="flex items-center gap-1.5">
          <i class="fa-solid fa-clock text-amber-400"></i>
          <span>Czas studium: <strong>ok. 18 minut</strong></span>
        </div>
        <div class="flex items-center gap-1.5">
          <i class="fa-solid fa-bullseye text-amber-400"></i>
          <span>Formacja: <strong>Pojednanie, Etyka, Oczyszczenie serca</strong></span>
        </div>
      </div>
    </div>
  </section>

  <!-- ── GŁÓWNA TREŚĆ LEKCJI ── -->
  <main class="max-w-4xl mx-auto px-4 py-10 flex-grow space-y-10">

    <!-- GRAFIKA TYTUŁOWA DNIA 23 -->
    <div class="rounded-2xl overflow-hidden border border-amber-500/25 shadow-2xl relative">
      <img src="/images/academy/daily/kc_day_23_pojednanie_i_powrot_do_betel.jpg" alt="Pojednanie Jakuba i Ezawa oraz powrót do Betel — Rdz 33:1–35:29" class="w-full h-auto aspect-video object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 sm:p-6">
        <div class="text-xs sm:text-sm text-zinc-200 font-serif italic">
          „Wtedy Ezaw wybiegł mu na spotkanie, objął go, rzucił mu się na szyję i ucałował go; i obaj płakali.” — Księga Rodzaju 33:4 (UBG)
        </div>
      </div>
    </div>

    <!-- TEKST PAMIĘCIOWY & MYŚL PRZEWODNIA -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="kc-card border-amber-500/30">
        <div class="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 flex items-center gap-1.5">
          <i class="fa-solid fa-bookmark"></i>
          <span>Werset Pamięciowy</span>
        </div>
        <blockquote class="font-serif italic text-base text-zinc-100 leading-relaxed mb-3">
          „Wstań, idź do Betel i tam zamieszkaj; zbuduj tam ołtarz Bogu, który ci się ukazał, gdy uciekałeś przed twoim bratem Ezawem.”
        </blockquote>
        <div class="flex justify-between items-center text-xs text-amber-300 font-mono">
          <span>Księga Rodzaju 35:1 (UBG)</span>
          <button type="button" onclick="copyVerse()" class="hover:text-white transition" title="Kopiuj werset">
            <i class="fa-regular fa-copy"></i>
          </button>
        </div>
      </div>

      <div class="kc-card">
        <div class="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-1.5">
          <i class="fa-solid fa-compass"></i>
          <span>Myśl Przewodnia</span>
        </div>
        <p class="font-serif text-sm text-zinc-200 leading-relaxed">
          Bóg prowadzi Jakuba od lęku przed Ezawem do spotkania z bratem, a następnie do odnowienia wiary w Betel. Pojednanie nie usuwa automatycznie wszystkich trudności, a duchowa odnowa nie oznacza życia bez cierpienia — ale Boża łaska i obietnica pozostają niezachwiane.
        </p>
      </div>
    </section>

    <!-- WSTĘP: NA POCZĄTEK -->
    <article class="kc-card space-y-4 kc-article-content">
      <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-brand-line pb-2">
        <i class="fa-solid fa-flag"></i>
        <span>Na początek</span>
      </div>
      <p class="text-zinc-200">
        Wczoraj Jakub zmagał się w nocy nad Jabbokiem i otrzymał imię Izrael. Dziś przychodzi poranek, którego tak bardzo się obawiał: Ezaw zbliża się z czterystoma ludźmi. Kolejne rozdziały są pełne kontrastów: braterski uścisk, dramat Diny i przemoc jej braci, Boże wezwanie do oczyszczenia domu oraz śmierć bliskich. Biblia uczy, że Bóg pozostaje wierny, a ludzie muszą odpowiadać za swoje decyzje.
      </p>
    </article>

    <!-- CZĘŚĆ I: SPOTKANIE Z EZAWEM (Rdz 33:1–20) -->
    <article class="kc-card space-y-4 kc-article-content">
      <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-brand-line pb-2">
        <span class="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs font-bold">I</span>
        <span>Część I — Spotkanie z Ezawem (Rdz 33:1–20)</span>
      </div>
      <div class="space-y-3 text-zinc-200">
        <p><strong>1. Ezaw nadchodzi (33:1–2):</strong> Jakub widzi Ezawa i czterystu ludzi; ustawia rodzinę w określonej kolejności, chroniąc najukochańszych na końcu.</p>
        <p><strong>2. Jakub wychodzi pierwszy (33:3):</strong> Utykający Jakub idzie na czele. Siedmiokrotny pokłon jest wyrazem głębokiego uniżenia i pragnienia pokoju, a nie pychy.</p>
        <p><strong>3. Ezaw biegnie i obejmuje brata (33:4):</strong> Niezwykła scena wzruszenia: Ezaw biegnie naprzeciw bratu, rzuca mu się na szyję, całuje go i obaj płaczą. Lęk zostaje zastąpiony łzami ulgi.</p>
        <p><strong>4–5. Rodzina Jakuba i odmowa darów (33:5–9):</strong> Jakub z wdzięcznością przedstawia żony i dzieci jako dar Bożej łaski. Ezaw początkowo odmawia przyjęcia stad: „Mam dość, bracie mój; zachowaj to, co twoje”.</p>
        <p><strong>6–7. „Jak oglądanie oblicza Boga” i przyjęcie daru (33:10–11):</strong> Jakub nalega na przyjęcie błogosławieństwa. Ujrzenie życzliwej twarzy brata staje się echem nocnego spotkania w Peniel („widziałem twoje oblicze, jak widzi się oblicze Boga”).</p>
        <p><strong>8–9. Ostrożność wobec tempa podróży i rozstanie (33:12–17):</strong> Jakub wykazuje pasterską roztropność wobec tempa dzieci i stad. Ezaw wraca do Seiru, a Jakub udaje się do Sukkot. Pojednanie nie musi oznaczać zamieszkania pod jednym dachem.</p>
        <p><strong>10–11. Przybycie do Sychem i ołtarz (33:18–20):</strong> Jakub dociera bezpiecznie w okolice Sychem w Kanaanie, kupuje pole i wznosi ołtarz, nazywając go <em>El-Elohe-Israel</em> („Bóg, Bóg Izraela”).</p>
      </div>
    </article>

    <!-- CZĘŚĆ II: KRZYWDA DINY I PRZEMOC W SYCHEM (Rdz 34:1–31) -->
    <article class="kc-card space-y-4 kc-article-content">
      <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-brand-line pb-2">
        <span class="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs font-bold">II</span>
        <span>Część II — Krzywda Diny i przemoc w Sychem (Rdz 34:1–31)</span>
      </div>
      <div class="space-y-3 text-zinc-200">
        <p><strong>12–14. Dina i przemoc Sychema (34:1–4):</strong> Córka Jakuba i Lei, Dina, wychodzi zobaczyć kobiety kraju i pada ofiarą przemocy seksualnej ze strony Sychema, syna władcy Chamora. Pismo Święte nie obwinia ofiary — odpowiedzialność ponosi wyłącznie sprawca przemocy, którego deklaracje uczuć nie unieważniają popełnionego bezprawia.</p>
        <p><strong>15–17. Milczenie Jakuba, gniew braci i negocjacje (34:5–12):</strong> Jakub milczy, czekając na synów. Bracia reagują świętym oburzeniem na bezczeszczenie ich siostry („ponieważ uczynił bezeczeństwo w Izraelu”). Chamor i Sychem składają ofertę małżeństwa i przymierza handlowego.</p>
        <p><strong>18–19. Podstępne użycie znaku przymierza (34:13–24):</strong> Synowie Jakuba stawiają podstępny warunek obrzezania wszystkich mężczyzn miasta. Wykorzystują święty znak Bożej obietnicy jako taktyczną pułapkę.</p>
        <p><strong>20–24. Masakra, rabunek i ocena moralna (34:25–31):</strong> Trzeciego dnia Symeon i Lewi dokonują krwawego mordu na mężczyznach w mieście, a pozostali synowie plądrują miasto. Jakub ostro potępia ich czyn, a w błogosławieństwie przed śmiercią jednoznacznie odrzuca ich okrucieństwo (Rdz 49:5–7). Słowo Boże uczy: zło nie usprawiedliwia odwetu, a znaki Boże nie mogą służyć przemocy (Pwt 24:16; Rz 12:19).</p>
      </div>
    </article>

    <!-- CZĘŚĆ III: POWRÓT DO BETEL I ODNOWIENIE WIARY (Rdz 35:1–15) -->
    <article class="kc-card space-y-4 kc-article-content">
      <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-brand-line pb-2">
        <span class="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs font-bold">III</span>
        <span>Część III — Powrót do Betel i odnowienie wiary (Rdz 35:1–15)</span>
      </div>
      <div class="space-y-3 text-zinc-200">
        <p><strong>25–28. Wezwanie do Betel i usunięcie obcych bogów (35:1–3):</strong> W kryzysie Bóg wzywa: „Wstań, idź do Betel i tam zamieszkaj; zbuduj tam ołtarz Bogu”. Jakub nakazuje domownikom radykalne oczyszczenie: usunąć obcych bogów, oczyścić się i zmienić szaty.</p>
        <p><strong>29–30. Zakopane bożki i Boża ochrona (35:4–5):</strong> Domownicy oddają Jakubowi posążki bożków i kolczyki. Jakub zakopuje je pod terebintem koło Sychem. Boży strach pada na okoliczne miasta, chroniąc wędrującą rodzinę.</p>
        <p><strong>31–32. Ołtarz w Betel i śmierć Debory (35:6–8):</strong> Jakub buduje ołtarz w Betel, nazywając miejsce <em>El-Betel</em>. Umiera Debora, piastunka Rebeki, i zostaje pochowana pod dębem nazwanym Allon-Bakut („Dąb Płaczu”).</p>
        <p><strong>33–35. Potwierdzenie imienia Izrael i obietnicy (35:9–15):</strong> Bóg Wszechmogący (<em>El-Szaddaj</em>) ponownie ukazuje się Jakubowi, potwierdza jego imię Izrael oraz odnawia obietnicę ziemi i narodów wychodzących z jego bioder.</p>
      </div>
    </article>

    <!-- CZĘŚĆ IV: STRATA I DALSZA DROGA RODZINY (Rdz 35:16–29) -->
    <article class="kc-card space-y-4 kc-article-content">
      <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-brand-line pb-2">
        <span class="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs font-bold">IV</span>
        <span>Część IV — Strata i dalsza droga rodziny (Rdz 35:16–29)</span>
      </div>
      <div class="space-y-3 text-zinc-200">
        <p><strong>36–38. Śmierć Racheli i narodziny Beniamina (35:16–20):</strong> W drodze do Efrata (Betlejem) Rachela rodzi syna w ciężkim porodzie. Umierając, nazywa go <em>Beni-Oni</em> („syn mojej boleści”), lecz ojciec nadaje mu imię <em>Beniamin</em> („syn prawicy”). Jakub stawia pomnik na jej grobie.</p>
        <p><strong>39–40. Grzech Rubena i dwunastu synów Jakuba (35:21–26):</strong> Pierworodny Ruben dopuszcza się występku przeciw ojcu, współżyjąc z Bilhą. Pismo sporządza oficjalny rejestr dwunastu synów Jakuba — filarów dwunastu plemion Izraela.</p>
        <p><strong>41–42. Powrót do Mamre i śmierć Izaaka (35:27–29):</strong> Jakub dociera do ojca Izaaka w Mamre (Kiriat-Arba / Hebron). Izaak umiera w sędziwym wieku 180 lat. Obaj bracia — Ezaw i Jakub — wspólnie składają ojca do grobu w pokoju.</p>
      </div>
    </article>

    <!-- JEZUS W CENTRUM -->
    <article class="kc-card border-amber-500/35 space-y-4 kc-article-content bg-gradient-to-br from-amber-500/10 via-brand-panel to-brand-panel">
      <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-amber-500/30 pb-2">
        <i class="fa-solid fa-cross"></i>
        <span>Jezus w centrum — Pojednanie, Prawda i Nowe Życie</span>
      </div>
      <div class="space-y-3 text-zinc-200">
        <p><strong>43. Chrystus jest źródłem prawdziwego pojednania:</strong> „Bóg w Chrystusie pojednał świat ze sobą, nie poczytując ludziom ich grzechów, i powierzył nam słowo pojednania” (2 Kor 5:18–19). Uścisk braci jest zaledwie cieniem pokoju, jaki Bóg przynosi nam przez krew krzyża.</p>
        <p><strong>44. Przebaczenie nie jest zaprzeczeniem krzywdy:</strong> Jezus wzywa do odrzucenia zemsty: „Nie mścijcie się sami, umiłowani, lecz ustąpcie gniewowi Bożemu” (Rz 12:19; Mt 6:14–15). Sprawiedliwość należy do Boga, a nie do ludzkiego odwetu.</p>
        <p><strong>45. Jezus broni godności skrzywdzonych:</strong> W relacjach z kobietami poniżonymi czy zranionymi Chrystus przywraca honor, broniąc ich godności przed potępieniem i obłudą otoczenia (Łk 7:36–50; J 4:7–26).</p>
        <p><strong>46. Oczyszczenie serca jest czymś więcej niż zewnętrznym rytuałem:</strong> Tak jak Jakub zakopał bożki pod drzewem, tak Jezus żąda radykalnego oczyszczenia wnętrza człowieka, bo z serca pochodzą złe myśli i nieczystość (Mk 7:20–23).</p>
        <p><strong>47. Bóg jest wierny pośród ludzkiej żałoby:</strong> Łzy Jakuba przy grobie Racheli i Izaaka znajdują odpowiedź w Panu, który płakał przy grobie Łazarza i ogłosił: „Ja jestem zmartwychwstaniem i życiem; kto we mnie wierzy, choćby i umarł, będzie żył” (J 11:25–35).</p>
        <p><strong>48. Obietnica przymierza prowadzi prosto do Jezusa:</strong> Potomstwo obiecane Abrahamowi, Izaakowi i Jakubowi znajduje swój ostateczny punkt odniesienia w Chrystusie, przez którego stajemy się dziećmi Bożymi (Ga 3:16, 26–29).</p>
      </div>
    </article>

    <!-- SPRAWDŹ W BIBLII & PRAWDA NA DZIŚ -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="kc-card">
        <div class="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-1.5">
          <i class="fa-solid fa-link"></i>
          <span>Sprawdź w Biblii (Kluczowe Odsyłacze)</span>
        </div>
        <ul class="text-xs text-zinc-300 space-y-2 font-mono">
          <li>• Rdz 32:24–30 → 33:1–4 (Od zmagania do pojednania)</li>
          <li>• Rdz 33:10 → 32:30 (Twarz brata jak oblicze Boga)</li>
          <li>• Rdz 34:2–4 → Rz 12:19 (Krzywda a zakaz zemsty)</li>
          <li>• Rdz 34:25–31 → Rdz 49:5–7 (Potępienie okrucieństwa)</li>
          <li>• Rdz 35:1–4 → Joz 24:14–15 (Zakopanie obcych bogów)</li>
          <li>• Rdz 35:9–12 → Rdz 17:1–8 (El-Szaddaj i przymierze)</li>
          <li>• Rdz 35:16–20 → J 11:25–35 (Żałoba i zmartwychwstanie)</li>
          <li>• Rdz 35:27–29 → Rdz 25:7–10 (Wspólny pogrzeb ojca)</li>
          <li>• Rdz 33:4 → 2 Kor 5:18–20 (Służba pojednania)</li>
          <li>• Rdz 35:2 → Mk 7:20–23 (Oczyszczenie serca z bożków)</li>
        </ul>
      </div>

      <div class="kc-card">
        <div class="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-1.5">
          <i class="fa-solid fa-check-double"></i>
          <span>Prawda na dziś</span>
        </div>
        <ul class="text-xs text-zinc-200 space-y-2">
          <li>✓ <strong>Pojednanie</strong> zaczyna się od pokory i gotowości do wyjścia naprzeciw.</li>
          <li>✓ <strong>Przebaczenie</strong> nie musi oznaczać rezygnacji z bezpiecznych granic w relacjach.</li>
          <li>✓ <strong>Osoba skrzywdzona</strong> nigdy nie ponosi winy za przemoc sprawcy.</li>
          <li>✓ <strong>Zemsta i zbiorowa kara</strong> nie mają nic wspólnego z Bożą sprawiedliwością.</li>
          <li>✓ <strong>Święte znaki religijne</strong> nie mogą służyć do manipulacji ani przemocy.</li>
          <li>✓ <strong>Duchowa odnowa</strong> wymaga zakopania „obcych bożków” i zmiany postępowania.</li>
          <li>✓ <strong>Obecność Boga</strong> nie chroni przed żałobą, ale daje żywą nadzieję w cierpieniu.</li>
        </ul>
      </div>
    </section>

    <!-- POMYŚL — PYTANIA DO REFLEKSJI -->
    <section class="kc-card space-y-4">
      <div class="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 flex items-center gap-1.5 border-b border-brand-line pb-2">
        <i class="fa-solid fa-lightbulb"></i>
        <span>Pomyśl — Pytania do osobistej refleksji</span>
      </div>
      <div class="space-y-3 text-sm text-zinc-300">
        <p>1. Czy jest ktoś, z kim powinienem szukać pokoju, jeśli będzie to bezpieczne i zgodne z mądrością?</p>
        <p>2. Czy potrafię uznać własną winę i uniżyć się przed Bogiem bez szukania tanich usprawiedliwień?</p>
        <p>3. Jakie zdrowe granice są potrzebne w moich relacjach, by pojednanie nie stało się naiwnością?</p>
        <p>4. Czy potępiam zło i przemoc również wtedy, gdy dopuszcza się jej ktoś z mojego środowiska lub rodziny?</p>
        <p>5. Czy w moich ocenach nie obwiniam osób skrzywdzonych za cudze występki?</p>
        <p>6. Jakie „obce bóstwa” — fałszywe oparcia, nałogi czy ambicje — muszę zakopać pod terebintem?</p>
        <p>7. Jak mogę okazać chrześcijańskie współczucie komuś w moim otoczeniu, kto przeżywa żałobę lub stratę?</p>
      </div>
    </section>

    <!-- INTERAKTYWNY QUIZ — 5 PYTAŃ KONTROLNYCH -->
    <section class="kc-card space-y-6">
      <div class="border-b border-brand-line pb-3 flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
          <i class="fa-solid fa-circle-question"></i>
          <span>Sprawdź swoją wiedzę (Quiz 5 pytań)</span>
        </div>
        <span class="text-xs text-zinc-500 font-mono">Dzień 23</span>
      </div>

      <!-- Pytanie 1 -->
      <div class="space-y-3">
        <p class="text-sm font-semibold text-white">1. Jak Ezaw powitał zbliżającego się brata Jakuba (Rdz 33:4)?</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button type="button" onclick="checkAnswer(this, false, 1)" class="kc-quiz-btn p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-left hover:border-amber-400/50 min-h-[44px]">Zażądał natychmiastowego zwrotu błogosławieństwa</button>
          <button type="button" onclick="checkAnswer(this, true, 1)" class="kc-quiz-btn p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-left hover:border-amber-400/50 min-h-[44px]">Wybiegł naprzeciw, objął go, ucałował i obaj płakali</button>
          <button type="button" onclick="checkAnswer(this, false, 1)" class="kc-quiz-btn p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-left hover:border-amber-400/50 min-h-[44px]">Zignorował go i odjechał do Seiru</button>
        </div>
        <div id="qf-1" class="hidden"></div>
      </div>

      <!-- Pytanie 2 -->
      <div class="space-y-3">
        <p class="text-sm font-semibold text-white">2. Kto dopuścił się masakry mężczyzn w Sychem pod pozorem przymierza (Rdz 34:25)?</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button type="button" onclick="checkAnswer(this, false, 2)" class="kc-quiz-btn p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-left hover:border-amber-400/50 min-h-[44px]">Ruben i Juda</button>
          <button type="button" onclick="checkAnswer(this, true, 2)" class="kc-quiz-btn p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-left hover:border-amber-400/50 min-h-[44px]">Symeon i Lewi</button>
          <button type="button" onclick="checkAnswer(this, false, 2)" class="kc-quiz-btn p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-left hover:border-amber-400/50 min-h-[44px]">Józef i Beniamin</button>
        </div>
        <div id="qf-2" class="hidden"></div>
      </div>

      <!-- Pytanie 3 -->
      <div class="space-y-3">
        <p class="text-sm font-semibold text-white">3. Co Jakub nakazał zrobić swoim domownikom przed wyruszeniem do Betel (Rdz 35:2)?</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button type="button" onclick="checkAnswer(this, true, 3)" class="kc-quiz-btn p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-left hover:border-amber-400/50 min-h-[44px]">Usunąć obcych bogów, oczyścić się i zmienić szaty</button>
          <button type="button" onclick="checkAnswer(this, false, 3)" class="kc-quiz-btn p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-left hover:border-amber-400/50 min-h-[44px]">Wybudować warowną twierdzę przeciw Kananejczykom</button>
          <button type="button" onclick="checkAnswer(this, false, 3)" class="kc-quiz-btn p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-left hover:border-amber-400/50 min-h-[44px]">Wrócić z powrotem do Haranu do Labana</button>
        </div>
        <div id="qf-3" class="hidden"></div>
      </div>

      <!-- Pytanie 4 -->
      <div class="space-y-3">
        <p class="text-sm font-semibold text-white">4. Gdzie Jakub zakopał oddane przez domowników bóstwa i kolczyki (Rdz 35:4)?</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button type="button" onclick="checkAnswer(this, false, 4)" class="kc-quiz-btn p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-left hover:border-amber-400/50 min-h-[44px]">W rzece Jordan</button>
          <button type="button" onclick="checkAnswer(this, true, 4)" class="kc-quiz-btn p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-left hover:border-amber-400/50 min-h-[44px]">Pod terebintem (drzewem) koło Sychem</button>
          <button type="button" onclick="checkAnswer(this, false, 4)" class="kc-quiz-btn p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-left hover:border-amber-400/50 min-h-[44px]">Na szczycie góry Synaj</button>
        </div>
        <div id="qf-4" class="hidden"></div>
      </div>

      <!-- Pytanie 5 -->
      <div class="space-y-3">
        <p class="text-sm font-semibold text-white">5. Kto wspólnie pochował zmarłego Izaaka w Mamre (Rdz 35:29)?</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button type="button" onclick="checkAnswer(this, false, 5)" class="kc-quiz-btn p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-left hover:border-amber-400/50 min-h-[44px]">Tylko Jakub wraz z synami</button>
          <button type="button" onclick="checkAnswer(this, true, 5)" class="kc-quiz-btn p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-left hover:border-amber-400/50 min-h-[44px]">Ezaw i Jakub — pojednani synowie Izaaka</button>
          <button type="button" onclick="checkAnswer(this, false, 5)" class="kc-quiz-btn p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-left hover:border-amber-400/50 min-h-[44px]">Królowie ziemi Kanaan</button>
        </div>
        <div id="qf-5" class="hidden"></div>
      </div>

      <!-- Wynik Quizu -->
      <div id="quiz-result" class="hidden p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
        <div class="text-2xl font-bold text-amber-400" id="quiz-score">5/5</div>
        <p class="text-xs text-zinc-300" id="quiz-msg"></p>
      </div>
    </section>

    <!-- MOJA DECYZJA & MODLITWA -->
    <article class="kc-card space-y-6">
      <div class="border-b border-brand-line pb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
        <i class="fa-solid fa-heart"></i>
        <span>Twoja Decyzja i Modlitwa</span>
      </div>

      <div class="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 to-transparent border border-amber-500/30">
        <h3 class="font-display text-sm font-bold text-amber-300 mb-1 uppercase tracking-wider">Moja Decyzja Wiary:</h3>
        <p class="text-xs sm:text-sm text-zinc-200 italic mb-3 font-serif">
          „Panie Jezu, chcę iść drogą prawdy i pokoju. Pomóż mi naprawiać to, co mogę naprawić, chronić skrzywdzonych, odrzucić fałszywe bożki i ufać Tobie także w cierpieniu.”
        </p>
        <button type="button" onclick="declareFaith()" class="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider transition min-h-[44px]">
          Potwierdzam tę decyzję w sercu
        </button>
      </div>

      <div class="space-y-2">
        <h3 class="text-xs font-bold uppercase tracking-widest text-zinc-400">Modlitwa na 23 Października:</h3>
        <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed font-serif italic bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
          „Ojcze w niebie, dziękuję Ci, że nie rezygnujesz z ludzi, którzy potrzebują przemiany. Ty prowadziłeś Jakuba przez lęk i trudne spotkania. Przebacz mi chwile, gdy pielęgnowałem urazę, szukałem odwetu albo uważałem własną rację za ważniejszą niż godność drugiego człowieka. Naucz mnie szukać pokoju bez przemilczania krzywdy i bez lekceważenia bezpieczeństwa. Panie, pamiętam dziś o ludziach, którzy doświadczyli przemocy, wykorzystania lub upokorzenia. Spraw, abym nigdy nie obarczał skrzywdzonych winą za cudze czyny. Prowadź mnie do mojego Betel — do odnowienia wiary. Pociesz tych, którzy przeżywają żałobę. Dziękuję za Jezusa Chrystusa, przez którego mamy pojednanie z Tobą i nadzieję zmartwychwstania. Amen.”
        </p>
      </div>
    </article>

    <!-- ZADANIE NA DZIŚ -->
    <article class="kc-card space-y-4">
      <div class="border-b border-brand-line pb-2 flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
          <i class="fa-solid fa-list-check"></i>
          <span>Zadanie Taktyczne na dziś</span>
        </span>
        <span class="text-[11px] text-zinc-500">Zaznacz wykonane</span>
      </div>
      <div class="space-y-2.5 text-xs text-zinc-300">
        <label class="flex items-start gap-3 p-2 rounded-lg hover:bg-zinc-900/50 cursor-pointer min-h-[44px]">
          <input type="checkbox" id="check-1" onchange="updateChecklist()" class="mt-1 rounded accent-amber-500 w-4 h-4" />
          <span>Przeczytaj uważnie Rdz 33–35. Zwróć uwagę na różnicę między opisem czynów a ich moralną oceną w świetle całej Biblii.</span>
        </label>
        <label class="flex items-start gap-3 p-2 rounded-lg hover:bg-zinc-900/50 cursor-pointer min-h-[44px]">
          <input type="checkbox" id="check-2" onchange="updateChecklist()" class="mt-1 rounded accent-amber-500 w-4 h-4" />
          <span>Porównaj Rdz 33:4 z 2 Kor 5:18–20. Zapisz w notatniku, czym jest pojednanie z perspektywy krzyża Chrystusa.</span>
        </label>
        <label class="flex items-start gap-3 p-2 rounded-lg hover:bg-zinc-900/50 cursor-pointer min-h-[44px]">
          <input type="checkbox" id="check-3" onchange="updateChecklist()" class="mt-1 rounded accent-amber-500 w-4 h-4" />
          <span>Nazwij jedną rzecz, która konkuruje z Bogiem o pierwsze miejsce w Twoim sercu, i symbolicznie zakop ją pod terebintem.</span>
        </label>
      </div>

      <div class="pt-4 border-t border-brand-line flex items-center justify-between flex-wrap gap-3">
        <button type="button" onclick="markComplete()" id="btn-complete" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider transition min-h-[44px] shadow-lg shadow-amber-900/30 flex items-center gap-2">
          <i class="fa-solid fa-check"></i>
          <span>Oznacz lekcję jako ukończoną</span>
        </button>
        <div id="complete-msg" class="hidden text-xs text-emerald-400 font-bold flex items-center gap-1.5">
          <i class="fa-solid fa-circle-check"></i>
          <span>Lekcja ukończona! Gratulacje.</span>
        </div>
      </div>
    </article>

    <!-- ── TRZY FILARY DZIAŁANIA: PODZIEL SIĘ TĄ LEKCJĄ ── -->
    <section class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-zinc-900/90 to-brand-panel border border-amber-500/30 text-center shadow-xl" id="ccDailyShare">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3">
        <i class="fa-solid fa-crown text-amber-400" aria-hidden="true"></i>
        <span>PATRONAT NAD SŁOWEM • WEZWANIE DO DZIAŁANIA</span>
      </div>
      <h2 class="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
        Podziel się tą lekcją i zostań patronem
      </h2>
      <p class="text-sm text-zinc-300 max-w-2xl mx-auto mb-8">
        Cały kurs i wszystkie lekcje w Christian Culture są w 100% bezpłatne. Trzy proste filary działania:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
        <!-- Filar 1: Udostępnij na Tablicy LUMINA -->
        <div class="p-4 rounded-2xl bg-zinc-900/80 border border-amber-500/20 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2.5 mb-2">
              <span class="w-6 h-6 rounded-full bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center shrink-0">1</span>
              <h3 class="font-bold text-white text-sm">Udostępnij na Tablicy</h3>
            </div>
            <p class="text-xs text-zinc-400 mb-4">Podziel się tą lekcją z całą społecznością portalu LUMINA.</p>
          </div>
          <a href="/tablica?share=dzien-23&v=Rdz35:1" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition min-h-[44px]">
            <span class="text-base font-display font-bold">L</span> Udostępnij na Tablicy
          </a>
        </div>

        <!-- Filar 2: Wyślij na WhatsApp -->
        <div class="p-4 rounded-2xl bg-zinc-900/80 border border-amber-500/20 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2.5 mb-2">
              <span class="w-6 h-6 rounded-full bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center shrink-0">2</span>
              <h3 class="font-bold text-white text-sm">Wyślij na WhatsApp</h3>
            </div>
            <p class="text-xs text-zinc-400 mb-4">Przekaż link bliskim, którzy potrzebują przypomnienia o Bożym pokoju.</p>
          </div>
          <a href="https://wa.me/?text=Z%20Bibli%C4%85%20za%20Pan%20Brat%20%E2%80%94%20Dzie%C5%84%2023%3A%20https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-23" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs hover:bg-emerald-500/30 transition min-h-[44px]">
            <i class="fa-brands fa-whatsapp text-sm" aria-hidden="true"></i> Wyślij na WhatsApp
          </a>
        </div>

        <!-- Filar 3: Zostań Patronem -->
        <div class="p-4 rounded-2xl bg-zinc-900/80 border border-amber-500/20 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2.5 mb-2">
              <span class="w-6 h-6 rounded-full bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center shrink-0">3</span>
              <h3 class="font-bold text-white text-sm">Zostań Patronem</h3>
            </div>
            <p class="text-xs text-zinc-400 mb-4">Wesprzyj nagrania lektora TTS, studio radiowe i technologię misji.</p>
          </div>
          <a href="https://patronite.pl/osobowoscplus" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs hover:bg-rose-500/30 transition min-h-[44px]">
            <span>❤️</span> Zostań Patronem
          </a>
        </div>
      </div>
    </section>

    <!-- ── ZAPOWIEDŹ JUTRA ── -->
    <section class="kc-card border-zinc-700/40" id="jutro">
      <div class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
        <i class="fa-solid fa-moon"></i>
        <span>Zapowiedź — Dzień 24</span>
      </div>
      <h3 class="font-serif text-lg font-bold text-white mb-2">Jutro: POTOMKOWIE EZAWA I HISTORIA JÓZEFA (Rdz 36–37)</h3>
      <p class="text-zinc-400 text-sm leading-relaxed">
        Rozpoczynamy monumentalną historię Józefa. Zazdrość braci, płaszcz z długimi rękawami, sny o snopkach i gwiazdach oraz studnia w Dotan. Bóg, który potrafi obrócić ludzkie zło w ocalenie.
      </p>
      <div class="mt-4 flex gap-3 flex-wrap items-center">
        <span class="text-xs font-mono text-zinc-600 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">Rdz 36–37</span>
        <span class="text-xs font-mono text-zinc-600 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">24 Października 2026</span>
      </div>
    </section>

  </main>

  <!-- ── FOOTER ── -->
  <footer class="border-t border-brand-line py-8 px-4 text-center text-xs text-zinc-600 mt-auto">
    <div class="max-w-4xl mx-auto space-y-2">
      <div class="flex justify-center gap-4 text-xs">
        <a href="/akademia/kurscodzienny" class="hover:text-amber-300 transition min-h-[44px] flex items-center">Kurs Codzienny</a>
        <a href="/lumina" class="hover:text-amber-300 transition min-h-[44px] flex items-center">LUMINA</a>
        <a href="/news" class="hover:text-amber-300 transition min-h-[44px] flex items-center">CCN News</a>
        <a href="https://cclite.pl" class="hover:text-amber-300 transition min-h-[44px] flex items-center">cclite.pl</a>
      </div>
      <p>© 2026 Christian Culture • polskieradio.cc • Wszelkie materiały bezpłatne dla użytkowników.</p>
      <p>Wsparcie misji: <a href="https://patronite.pl/osobowoscplus" class="text-amber-500 hover:text-amber-300 transition">patronite.pl/osobowoscplus</a></p>
    </div>
  </footer>

  <script>
    // ── READER FONT TOGGLE ──
    function toggleReaderFont() {
      const html = document.documentElement;
      const isSans = html.getAttribute('data-kc-font') === 'sans';
      html.setAttribute('data-kc-font', isSans ? 'serif' : 'sans');
      const label = isSans ? 'Krój: Lora' : 'Krój: Inter';
      document.getElementById('reader-font-label').textContent = label;
      document.querySelectorAll('.kc-font-mobile-label').forEach(el => el.textContent = isSans ? 'Lora' : 'Inter');
      localStorage.setItem('kc_font_pref', isSans ? 'serif' : 'sans');
    }

    // ── FONT SIZE ──
    let kcFontStepPx = 0;
    function adjustFontSize(dir) {
      kcFontStepPx = Math.max(-3, Math.min(6, kcFontStepPx + dir));
      const base = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--kc-font-size')) || 1.05;
      document.documentElement.style.setProperty('--kc-font-size', (base + dir * 0.05) + 'rem');
    }

    // ── COPY VERSE ──
    function copyVerse() {
      navigator.clipboard.writeText('„Wstań, idź do Betel i tam zamieszkaj; zbuduj tam ołtarz Bogu” — Rdz 35:1 (UBG)');
      alert('Werset skopiowany do schowka! Możesz podzielić się nim z innymi.');
    }

    // ── AUDIO TTS ──
    let ttsPlaying = false;
    let ttsUtterance = null;
    function toggleTTS() {
      if (!('speechSynthesis' in window)) {
        alert('Twoja przeglądarka nie obsługuje syntezy mowy TTS.');
        return;
      }
      if (ttsPlaying) {
        window.speechSynthesis.cancel();
        ttsPlaying = false;
        document.getElementById('tts-icon').className = 'fa-solid fa-volume-high text-xs';
        document.getElementById('tts-btn-text').textContent = 'Słuchaj Audio';
        return;
      }
      const textToRead = 'Z Biblią za Pan Brat. Dzień dwudziesty trzeci. Pojednanie i powrót do Betel. Czytanie z Księgi Rodzaju, rozdziały od trzydziestego trzeciego do trzydziestego piątego. Werset pamięciowy: Wstań, idź do Betel i tam zamieszkaj; zbuduj tam ołtarz Bogu.';
      ttsUtterance = new SpeechSynthesisUtterance(textToRead);
      ttsUtterance.lang = 'pl-PL';
      ttsUtterance.rate = 0.95;
      ttsUtterance.onend = () => { ttsPlaying = false; document.getElementById('tts-icon').className = 'fa-solid fa-volume-high text-xs'; document.getElementById('tts-btn-text').textContent = 'Słuchaj Audio'; };
      ttsUtterance.onerror = () => { ttsPlaying = false; document.getElementById('tts-icon').className = 'fa-solid fa-volume-high text-xs'; document.getElementById('tts-btn-text').textContent = 'Słuchaj Audio'; };
      window.speechSynthesis.speak(ttsUtterance);
      ttsPlaying = true;
      document.getElementById('tts-icon').className = 'fa-solid fa-stop text-xs';
      document.getElementById('tts-btn-text').textContent = 'Zatrzymaj';
    }

    // ── QUIZ (5 pytań) ──
    let quizAnswers = {};
    function checkAnswer(el, isCorrect, qNum) {
      if (quizAnswers[qNum] !== undefined) return;
      quizAnswers[qNum] = isCorrect;
      const parent = el.parentElement;
      parent.querySelectorAll('.kc-quiz-btn').forEach(opt => opt.style.pointerEvents = 'none');
      el.classList.add(isCorrect ? 'correct' : 'wrong');
      if (!isCorrect) {
        parent.querySelectorAll('.kc-quiz-btn').forEach(opt => {
          if (opt.onclick.toString().includes('true')) opt.classList.add('correct');
        });
      }
      const fb = document.getElementById('qf-' + qNum);
      fb.textContent = isCorrect ? '✅ Poprawnie!' : '❌ Spróbuj zapamiętać poprawną odpowiedź.';
      fb.className = 'quiz-feedback text-xs mt-2 font-bold ' + (isCorrect ? 'text-emerald-400' : 'text-rose-400');
      fb.classList.remove('hidden');
      if (Object.keys(quizAnswers).length === 5) showQuizResult();
    }

    function showQuizResult() {
      const correct = Object.values(quizAnswers).filter(Boolean).length;
      const res = document.getElementById('quiz-result');
      res.classList.remove('hidden');
      document.getElementById('quiz-score').textContent = correct + '/5';
      const msgs = ['Wróć do lektury — znajdziesz odpowiedzi!', 'Dobry początek! Przeczytaj jeszcze raz kluczowe wersety.', 'Nieźle! Jeszcze jeden krok do pełnego zrozumienia.', 'Świetnie! Masz solidne podstawy.', 'Doskonale! Jesteś gotowy na Dzień 24!'];
      document.getElementById('quiz-msg').textContent = msgs[correct] || msgs[4];
    }

    // ── CHECKLIST ──
    function updateChecklist() {
      localStorage.setItem('kc_dzien_23_checklist', JSON.stringify({
        c1: document.getElementById('check-1').checked,
        c2: document.getElementById('check-2').checked,
        c3: document.getElementById('check-3').checked
      }));
    }

    // ── MARK COMPLETE ──
    function markComplete() {
      localStorage.setItem('kc_dzien_23_complete', 'true');
      document.getElementById('complete-msg').classList.remove('hidden');
      document.getElementById('btn-complete').textContent = '✅ Ukończono!';
      document.getElementById('btn-complete').disabled = true;
      document.getElementById('btn-complete').classList.replace('bg-gradient-to-r', 'bg-zinc-800');
    }

    // ── FAITH DECLARATION ──
    function declareFaith() {
      localStorage.setItem('kc_dzien_23_faith', 'true');
      alert('Chwała Bogu! Twoja decyzja została zapisana. Jezus Chrystus pojednał nas z Bogiem i prowadzi do prawdziwego pokoju! 🙏');
    }

    // ── INIT — restore state ──
    window.addEventListener('DOMContentLoaded', () => {
      const fontPref = localStorage.getItem('kc_font_pref');
      if (fontPref === 'sans') {
        document.documentElement.setAttribute('data-kc-font', 'sans');
        document.getElementById('reader-font-label').textContent = 'Krój: Inter';
        document.querySelectorAll('.kc-font-mobile-label').forEach(el => el.textContent = 'Inter');
      }
      const cl = localStorage.getItem('kc_dzien_23_checklist');
      if (cl) {
        try {
          const d = JSON.parse(cl);
          if (d.c1) document.getElementById('check-1').checked = true;
          if (d.c2) document.getElementById('check-2').checked = true;
          if (d.c3) document.getElementById('check-3').checked = true;
        } catch(e) {}
      }
      if (localStorage.getItem('kc_dzien_23_complete') === 'true') {
        document.getElementById('complete-msg').classList.remove('hidden');
        document.getElementById('btn-complete').textContent = '✅ Ukończono!';
        document.getElementById('btn-complete').disabled = true;
      }
    });
  </script>
  <!-- Floating Back to Top Button -->
  <button class="back-to-top" id="backToTopBtn" type="button" aria-label="Przewiń do góry" title="Przewiń do góry">
    <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
  </button>
  <script src="/js/cc-daily-course-share.js?v=20261114_share2" defer></script>
</body>
</html>`;
}

// Write the 4 paths
const paths = [
  path.join(ROOT, 'akademia/kurscodzienny/dzien-23.html'),
  path.join(ROOT, 'akademia/kurscodzienny/dzien-23/index.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-23.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-23/index.html'),
  path.join(LUMINA_ROOT, 'akademia/kurscodzienny/dzien-23.html'),
  path.join(LUMINA_ROOT, 'akademia/kurscodzienny/dzien-23/index.html'),
  path.join(LUMINA_ROOT, 'kursy/kurscodzienny/dzien-23.html'),
  path.join(LUMINA_ROOT, 'kursy/kurscodzienny/dzien-23/index.html')
];

const htmlContent = getDay23Html();

paths.forEach(p => {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, htmlContent, 'utf8');
  console.log('Saved:', p);
});
