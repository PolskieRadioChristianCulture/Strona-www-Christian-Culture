import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

export function getDay24Html() {
  return `<!DOCTYPE html>
<html lang="pl" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Dzień 24: JÓZEF — MARZENIE, ZDRADA I BOŻA OPATRZNOŚĆ (Rdz 36:1–37:36) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>
  <meta name="description" content="Księga Rodzaju — Miesiąc 1, Dzień 24 (24 Października 2026). Józef sprzedany przez braci — marzenie, zdrada i Boża opatrzność — Rdz 36:1–37:36. Kurs codzienny Pisma Świętego." />
  <link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-24" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-24" />
  <meta property="og:title" content="Dzień 24: JÓZEF — MARZENIE, ZDRADA I BOŻA OPATRZNOŚĆ — Z Biblią za Pan Brat" />
  <meta property="og:description" content="Księga Rodzaju — Miesiąc 1, Dzień 24. Gdy ludzkie zło nie ma ostatniego słowa — Rdz 36:1–37:36." />
  <meta property="og:image" content="https://polskieradio.cc/images/academy/daily/kc_day_24_jozef_marzenie_zdrada_boza_opatrznosc.jpg?v=20261024" />

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
        <span class="text-xs text-amber-400 font-semibold">Dzień 24</span>
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
          Księga Rodzaju • Miesiąc 1 • Dzień 24 z 31
        </span>
        <span class="text-xs text-zinc-400 font-mono">24 PAŹDZIERNIKA 2026 • SOBOTA</span>
      </div>

      <!-- Jump Share Button (Standard JOMA-D005 / @Akademia) -->
      <div class="pt-2">
        <a href="#ccDailyShare" id="kcJumpShareBtn" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold hover:text-brand-gold-light border border-brand-gold/30 transition text-xs font-bold uppercase tracking-wider">
          <i class="fa-solid fa-share-nodes text-xs"></i>
          <span>Podziel się tą lekcją ↓</span>
        </a>
      </div>

      <h1 class="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
        JÓZEF — MARZENIE, ZDRADA I BOŻA OPATRZNOŚĆ
      </h1>
      <p class="text-base sm:text-lg text-amber-300/90 font-serif italic">
        Gdy ludzkie zło nie ma ostatniego słowa (Rdz 36:1–37:36)
      </p>

      <!-- HERO IMAGE 16:9 -->
      <div class="relative rounded-2xl overflow-hidden border border-brand-border/40 shadow-2xl mt-4 aspect-video bg-zinc-900">
        <img
          src="/images/academy/daily/kc_day_24_jozef_marzenie_zdrada_boza_opatrznosc.jpg"
          alt="Dzień 24: Józef — marzenie, zdrada i Boża opatrzność (Rdz 36–37)"
          class="w-full h-full object-cover"
          loading="eager"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-60"></div>
        <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-zinc-300 backdrop-blur-sm bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
          <span>Ilustracja biblijna: Józef w Dotanie (Rdz 37)</span>
          <span class="font-mono text-brand-gold">Czytanie: Rdz 36:1–37:36</span>
        </div>
      </div>

      <!-- MEMORY VERSE CARD -->
      <div class="kc-verse-badge text-left">
        <div class="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
          <i class="fa-solid fa-bookmark"></i>
          <span>Werset Pamięciowy Dnia:</span>
        </div>
        <blockquote class="font-serif italic text-base sm:text-lg text-white">
          „A jego bracia zazdrościli mu, lecz ojciec jego zachował tę sprawę w pamięci.”
        </blockquote>
        <div class="text-right text-xs text-brand-gold font-bold mt-1 font-mono">
          — Księga Rodzaju 37:11 (UBG)
        </div>
      </div>

      <!-- CORE THESIS -->
      <div class="p-4 rounded-xl bg-brand-panel/60 border border-brand-border/30 text-xs sm:text-sm text-zinc-300">
        <strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>
        Bóg działa w historii rodzin naznaczonych zazdrością, faworyzowaniem i przemocą. Nie jest sprawcą zła popełnianego przez ludzi, lecz potrafi prowadzić swoją historię nawet przez wydarzenia, które wydają się przekreślać przyszłość.
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
          Józef ma siedemnaście lat. Jest kochany przez ojca, ale znienawidzony przez braci. Otrzymuje szczególną szatę, opowiada sny, a potem w ciągu jednego dnia traci dom, bezpieczeństwo i wolność. Czy Boża obietnica może trwać, gdy wszystko wokół wygląda na jej zaprzeczenie? Dzisiejszy fragment zaczyna się jednak od genealogii Ezawa. To nie przypadkowa przeszkoda przed „ciekawszą” historią Józefa. Księga Rodzaju pokazuje, że Bóg widzi więcej niż jedną rodzinę i że wielkie dzieje wyrastają z konkretnych pokoleń. Przeczytaj obydwa rozdziały, zanim przejdziesz do pytań.
        </p>
      </article>

      <!-- CZĘŚĆ I: POTOMKOWIE EZAWA (Rdz 36:1–43) -->
      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-brand-line pb-2">
          <span class="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs font-bold">I</span>
          <span>Część I — Potomkowie Ezawa (Rdz 36:1–43)</span>
        </div>
        <div class="space-y-3 text-zinc-200">
          <p><strong>1. Dlaczego Biblia podaje genealogie? (36:1):</strong> Rozdział otwierają słowa: „To są dzieje rodu Ezawa, czyli Edomu”. Genealogia ukazuje ciągłość pokoleń i wyjaśnia pochodzenie Edomitów. W Biblii nawet pozornie suche listy imion służą opowieści o realnych ludziach i narodach.</p>
          <p><strong>2. Ezaw nie znika z historii (36:2–5):</strong> Wymienione zostają żony i dzieci Ezawa. Po konflikcie z Jakubem jego linia rodzinna nadal rozwija się. Wybranie Jakuba do określonej roli w historii przymierza nie oznacza, że Ezaw przestał być ważnym człowiekiem.</p>
          <p><strong>3. Oddzielne ziemie braci (36:6–8):</strong> Ezaw przenosi się do Seiru. Narrator łączy rozdzielenie braci z rozrostem ich majątków i stad. Podobny motyw pojawił się wcześniej przy Abrahamie i Locie (Rdz 13:5–12). Czasem pokojowe życie wymaga rozsądnego dystansu.</p>
          <p><strong>4. Ezaw to Edom (36:8–9):</strong> Powtórzenie związku Ezawa z Edomem przygotowuje czytelnika na późniejsze dzieje relacji Izraela i Edomu. Nie należy jednak utożsamiać każdego późniejszego Edomity z charakterem Ezawa ani oceniać całego narodu przez pryzmat jednego przodka.</p>
          <p><strong>5–8. Struktury społeczne i królowie Edomu (36:10–43):</strong> Genealogia obejmuje synów, wnuków, mieszkańców Seiru oraz królów Edomu „zanim król panował nad synami Izraela”. Biblia umieszcza patriarchów w szerszym świecie, a nie w pustej przestrzeni.</p>
          <p><strong>9. Boża obietnica nie jest pozwoleniem na pogardę:</strong> Rdz 36 pokazuje rozwój linii Ezawa obok linii Jakuba. Później Prawo nakaże Izraelitom nie gardzić Edomitą, „bo jest twoim bratem” (Pwt 23:7). Historia przymierza nie upoważnia do uprzedzeń etnicznych.</p>
        </div>
      </article>

      <!-- CZĘŚĆ II: DOM JAKUBA I POCZĄTEK HISTORII JÓZEFA (Rdz 37:1–11) -->
      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-brand-line pb-2">
          <span class="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs font-bold">II</span>
          <span>Część II — Dom Jakuba i początek historii Józefa (Rdz 37:1–11)</span>
        </div>
        <div class="space-y-3 text-zinc-200">
          <p><strong>10–12. Jakub w Kanaanie i siedemnastoletni Józef (37:1–2):</strong> Jakub osiada w ziemi obietnicy. Siedemnastoletni Józef dogląda stad z braćmi i przynosi ojcu niekorzystną wiadomość o niektórych z nich.</p>
          <p><strong>13–15. Faworyzowanie i ozdobna szata (37:3–4):</strong> Izrael kocha Józefa bardziej niż pozostałych synów, bo urodził mu się na starość. Daje mu szczególną, ozdobną szatę wyróżniającą go na tle braci. Bracia widzą to faworyzowanie i zaczynają go nienawidzić, nie mogąc z nim rozmawiać pokojowo.</p>
          <p><strong>16–17. Dwa sny: snopy oraz gwiazdy (37:5–9):</strong> Józef opowiada dwa sny: najpierw snopy braci kłaniają się jego snopowi, a potem słońce, księżyc i jedenaście gwiazd oddają mu pokłon. Bracia interpretują sny jako zapowiedź panowania Józefa nad nimi i nienawidzą go jeszcze bardziej.</p>
          <p><strong>18–19. Ojciec gani, bracia zazdroszczą (37:10–11):</strong> Jakub gani Józefa za drugi sen, lecz zachowuje sprawę w pamięci. Sen nie jest jeszcze jego spełnieniem; w Biblii rozpoznanie Bożego prowadzenia bywa możliwe dopiero po dłuższym czasie.</p>
          <p><strong>20. Czy każdy sen pochodzi od Boga?:</strong> Nie. Biblia opisuje sny, przez które Bóg przemawiał, ale przestrzega także przed fałszywymi snami i prorokami (Jr 23:25–32). Pismo pozostaje normą oceny duchowych twierdzeń.</p>
        </div>
      </article>

      <!-- CZĘŚĆ III: BRACIA PLANUJĄ ZŁO (Rdz 37:12–24) -->
      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-brand-line pb-2">
          <span class="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs font-bold">III</span>
          <span>Część III — Bracia planują zło (Rdz 37:12–24)</span>
        </div>
        <div class="space-y-3 text-zinc-200">
          <p><strong>21–22. Wysłany do Sychem i Dotanu (37:12–17):</strong> Jakub posyła Józefa z Hebronu, by sprawdził, jak mają się bracia i trzody. Nieznajomy człowiek na polu wskazuje drogę do Dotanu.</p>
          <p><strong>23–25. Spisek i szyderstwo (37:18–20):</strong> Bracia dostrzegają Józefa z daleka i postanawiają go zabić: „Oto idzie ten, który ma sny!”. Pogarda i odczłowieczanie poprzedzają fizyczną krzywdę. Planują wrzucić go do cysterny i skłamać, że pożarło go dzikie zwierzę.</p>
          <p><strong>26–28. Interwencja Rubena i pusta cysterna (37:21–24):</strong> Ruben sprzeciwia się zabójstwu, proponując wrzucenie do cysterny z zamiarem późniejszego ocalenia. Bracia zdzierają z Józefa ozdobną szatę i wrzucają go do pustej, bezwodnej cysterny.</p>
        </div>
      </article>

      <!-- CZĘŚĆ IV: SPRZEDANY I UZNANY ZA ZMARŁEGO (Rdz 37:25–36) -->
      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-brand-line pb-2">
          <span class="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs font-bold">IV</span>
          <span>Część IV — Sprzedany i uznany za zmarłego (Rdz 37:25–36)</span>
        </div>
        <div class="space-y-3 text-zinc-200">
          <p><strong>29–32. Posiłek bezlitosnych i sprzedaż za 20 srebrników (37:25–28):</strong> Bracia siadają do jedzenia, ignorując błagania uwięzionego brata. Na wniosek Judy sprzedają Józefa kupcom zmierzającym do Egiptu za dwadzieścia sztuk srebra. Handel ludźmi pozostaje ciężkim grzechem, nawet jeśli Bóg później wyprowadzi z tego dobro.</p>
          <p><strong>33–35. Rozpacz Rubena i krwawa szata kłamstwa (37:29–35):</strong> Ruben wraca do pustej cysterny i rozdziera szaty. Bracia zabijają kozła, plamią szatę krwią i przesyłają ojcu. Jakub rozpoznaje szatę, uznaje Józefa za rozszarpanego przez dzikiego zwierza i pogrąża się w niepocieszonej żałobie.</p>
          <p><strong>36–37. Józef u Potyfara — milczenie a Boża Opatrzność (37:36):</strong> Józef zostaje sprzedany Potyfarowi, urzędnikowi faraona. Rozdział nie kończy się cudem ani aniołem. Pismo nie mówi, że Bóg nakazał sprzedać Józefa; dopóki historia się nie dopełni, Boża opatrzność działa cicho i suwerennie mimo ludzkich złych zamiarów (Rdz 45:5–8; 50:20).</p>
        </div>
      </article>

      <!-- JEZUS W CENTRUM -->
      <article class="kc-card space-y-4 kc-article-content border-brand-gold/40">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-line pb-2">
          <i class="fa-solid fa-cross"></i>
          <span>Jezus w centrum — Odrzucony, a jednak źródło ratunku</span>
        </div>
        <div class="space-y-3 text-zinc-200">
          <p><strong>38. Józef i Jezus — odrzucenie dla ratunku wielu:</strong> Józef zostaje odrzucony przez braci i sprzedany za srebrniki, a później ocali ich przed głodem. Jezus również zostaje wzgardzony i wydany za trzydzieści srebrników, lecz Jego ofiara przynosi zbawienie wieczne całemu światu (J 1:11; Dz 2:22–24).</p>
          <p><strong>39. Nienawiść a droga ucznia:</strong> Jezus uczy, że gniew i pogarda wobec brata są grzechem zasługującym na sąd (Mt 5:21–24). Zazdrość pozostawiona w sercu staje się korzeniem zbrodni.</p>
          <p><strong>40–42. Boży plan a odpowiedzialność sprawców:</strong> Krzyż Chrystusa dokonał się przez grzeszne ręce ludzi, a zarazem był realizacją Bożego planu zbawienia (Dz 2:23). Opatrzność Boża nie zdejmuje winy ze sprawców; Bóg potrafi obrócić zło w dobro, nie stając się autorem grzechu.</p>
          <p><strong>43. Jezus jest wierny w cierpieniu:</strong> Józef cierpi niewinnie w obcym kraju. Jezus cierpiał za nas, nie popełniwszy żadnego grzechu (1 P 2:21–24). Dlatego w cierpieniu chrześcijanin nie jest sam — ma Zbawiciela, który zna ból zdrady i zwyciężył śmierć.</p>
        </div>
      </article>

      <!-- SPRAWDŹ W BIBLII & PRAWDA NA DZIŚ -->
      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-brand-line pb-2">
          <i class="fa-solid fa-book-open"></i>
          <span>Prawda na dziś & Sprawdź w Biblii</span>
        </div>
        <ul class="list-disc list-inside space-y-1.5 text-zinc-200 text-sm">
          <li>Bóg pamięta również o ludziach spoza głównej linii przymierza (Pwt 23:7).</li>
          <li>Faworyzowanie w rodzinie pogłębia zazdrość i rodzi destrukcyjny konflikt (Rdz 25:28; 37:3–4).</li>
          <li>Nie każdy sen jest Bożym objawieniem — normą pozostaje Słowo Boże (Jr 23:25–32).</li>
          <li>Zazdrość i odczłowieczanie drugiego człowieka prowadzą do przemocy (Mt 5:21–24).</li>
          <li>Handel ludźmi i manipulacja są złem w oczach Bożych (Am 2:6).</li>
          <li>Milczenie i preparowanie fałszywych dowodów są tak samo kłamstwem (Ef 4:25).</li>
          <li>Bóg potrafi wyprowadzić dobro nawet z ludzkiej zdrady, nie aprobując grzechu (Rdz 50:20).</li>
          <li>Jezus Chrystus jest naszą żywą nadzieją, gdy okoliczności zdają się mówić o porzuceniu (1 P 1:3–5).</li>
        </ul>
      </article>

      <!-- REFLECTION QUESTIONS -->
      <article class="kc-card space-y-4 kc-article-content">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-brand-line pb-2">
          <i class="fa-solid fa-lightbulb"></i>
          <span>Pomyśl — Pytania do osobistej refleksji</span>
        </div>
        <ol class="list-decimal list-inside space-y-2 text-zinc-200 text-sm">
          <li>Czy w moich relacjach rodzinnych lub zawodowych pojawia się faworyzowanie bądź zazdrość?</li>
          <li>Czy zdarza mi się pomniejszać wartość innych z powodu ich sukcesów lub obdarowania?</li>
          <li>Jak reaguję, gdy ktoś dzieli się ze mną swoimi marzeniami lub planami od Boga?</li>
          <li>Czy potrafię zatrzymać plotkę i szyderstwo, zanim przerodzą się w krzywdę drugiego człowieka?</li>
          <li>Czy kiedykolwiek wprowadziłem kogoś w błąd przez przemilczenie istotnej prawdy?</li>
          <li>Jak mogę dziś konkretnie stanąć w obronie osoby pomijanej lub krzywdzonej?</li>
          <li>Czy nie mylę Bożej opatrzności z próbą usprawiedliwiania czyjegoś złego postępowania?</li>
          <li>W jaki sposób zmartwychwstanie Jezusa daje mi nadzieję, gdy przyszłość wydaje się ciemna?</li>
        </ol>
      </article>

      <!-- INTERACTIVE QUIZ (20 Questions) -->
      <article class="kc-card space-y-6">
        <div class="border-b border-brand-line pb-2 flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold">
            <i class="fa-solid fa-circle-question"></i>
            <span>Mały Quiz — 20 Pytań Sprawdzających</span>
          </div>
          <span id="quizScoreBadge" class="text-xs font-mono text-zinc-400">0/20</span>
        </div>

        <div id="quizContainer" class="space-y-4">
          <!-- Quiz items populated dynamically via script -->
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-brand-line">
          <button id="btnResetQuiz" type="button" class="px-4 py-2 text-xs rounded-lg border border-brand-border text-zinc-300 hover:text-white hover:border-brand-gold transition">
            Zresetuj Quiz
          </button>
          <span id="quizFeedback" class="text-xs text-brand-gold font-bold"></span>
        </div>
      </article>

      <!-- MOJA DECYZJA & MODLITWA -->
      <article class="kc-card space-y-6">
        <div class="border-b border-brand-line pb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
          <i class="fa-solid fa-heart"></i>
          <span>Twoja Decyzja i Modlitwa</span>
        </div>

        <div class="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 to-transparent border border-amber-500/30">
          <h3 class="font-display text-sm font-bold text-amber-300 mb-1 uppercase tracking-wider">Moja Decyzja Wiary:</h3>
          <p class="text-xs sm:text-sm text-zinc-200 italic mb-3 font-serif">
            „Panie Jezu, nie chcę pozwalać zazdrości i pogardzie rządzić moim sercem. Ucz mnie prawdy, sprawiedliwości i współczucia. Pomóż mi ufać Tobie, nawet gdy nie znam zakończenia własnej historii.”
          </p>
          <button id="btnDeclareFaith" type="button" class="px-4 py-2 rounded-lg bg-amber-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition shadow-lg">
            Wyznaję to dzisiaj przed Bogiem ✓
          </button>
        </div>

        <div class="space-y-3">
          <h3 class="font-display text-sm font-bold text-brand-gold uppercase tracking-wider">Modlitwa na 24 Października:</h3>
          <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed font-serif italic">
            Ojcze w niebie, dziękuję Ci za Twoją wierność przez pokolenia. Widzisz każdego człowieka, również tego, którego inni pomijają. Dziękuję, że Twoje Słowo nie ukrywa ludzkich błędów i pokazuje prawdę o naszych sercach. Panie, przebacz mi zazdrość, pychę i chwile, gdy cieszyłem się z niepowodzenia innych. Nie pozwól mi pielęgnować pogardy ani usprawiedliwiać krzywdy. Daj mi odwagę bronić słabszych i mówić prawdę. Modlę się za ludzi, którzy doświadczają przemocy, zdrady, wykorzystywania i rozłąki z rodziną. Otocz ich ochroną i mądrą pomocą. Ucz mnie okazywać im szacunek bez obwiniania ich za cudze czyny. Panie Jezu, Ty zostałeś odrzucony, cierpiałeś niewinnie i zwyciężyłeś przez zmartwychwstanie. Gdy nie rozumiem własnej drogi, przypominaj mi, że moje życie nie jest poza zasięgiem Twojej troski. Prowadź mnie wiernością, prawdą i nadzieją. Amen.
          </p>
        </div>

        <!-- ZADANIE NA DZIŚ CHECKLIST -->
        <div class="space-y-2 pt-2 border-t border-brand-line">
          <h4 class="text-xs font-bold uppercase tracking-wider text-brand-gold">Zadanie na dziś:</h4>
          <div class="space-y-2 text-xs text-zinc-300">
            <label class="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" id="check-1" class="mt-0.5 rounded border-brand-border bg-brand-dark text-brand-gold focus:ring-0" />
              <span>Przeczytaj Rdz 36–37, nie pomijając genealogii Ezawa.</span>
            </label>
            <label class="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" id="check-2" class="mt-0.5 rounded border-brand-border bg-brand-dark text-brand-gold focus:ring-0" />
              <span>Zastanów się, czy w jakiejś relacji potrzebujesz przerwać spiralę zazdrości lub szyderstwa.</span>
            </label>
            <label class="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" id="check-3" class="mt-0.5 rounded border-brand-border bg-brand-dark text-brand-gold focus:ring-0" />
              <span>Zrób dziś jeden konkretny dobry uczynek wobec osoby, która bywa pomijana.</span>
            </label>
          </div>
        </div>
      </article>

      <!-- NAVIGATION BETWEEN DAYS -->
      <nav class="flex items-center justify-between pt-4 border-t border-brand-line text-xs font-bold uppercase tracking-wider">
        <a href="/akademia/kurscodzienny/dzien-23" class="flex items-center gap-2 text-zinc-400 hover:text-brand-gold transition">
          <i class="fa-solid fa-arrow-left"></i>
          <span>← Dzień 23: Pojednanie i powrót do Betel</span>
        </a>
        <a href="/akademia#kurscodzienny" class="text-brand-gold hover:text-brand-gold-light transition">
          Spis Lekcji
        </a>
        <span class="text-zinc-600 flex items-center gap-2">
          <span>Dzień 25: Wierność w świecie pokus →</span>
        </span>
      </nav>

    </section>

    <!-- LUMINA COURSE SHARE SECTION (#ccDailyShare) -->
    <section id="ccDailyShare" class="mt-12 p-6 rounded-2xl bg-gradient-to-br from-brand-panel via-brand-navy to-brand-dark border border-brand-gold/30 shadow-2xl text-center space-y-4">
      <div class="w-12 h-12 rounded-full bg-brand-gold/15 text-brand-gold mx-auto flex items-center justify-center text-xl border border-brand-gold/30">
        <i class="fa-solid fa-share-nodes"></i>
      </div>
      <h2 class="font-display text-xl sm:text-2xl font-bold text-white tracking-wide">
        Podziel się tą lekcją ze swoimi bliskimi
      </h2>
      <p class="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto">
        Pomóż innym odkryć głębię Słowa Bożego. Udostępnij dzisiejszą lekcję o Józefie i Bożej Opatrzności w mediach społecznościowych, na WhatsApp lub na Tablicy LUMINA.
      </p>

      <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
        <a href="https://polskieradio.cc/tablica?share_url=https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-24&share_title=Dzie%C5%84+24%3A+J%C3%93ZEF+%E2%80%94+MARZENIE%2C+ZDRADA+I+BO%C5%BBA+OPATRZNO%C5%9A%C4%86" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl bg-brand-gold text-brand-dark font-bold text-xs uppercase tracking-wider hover:bg-brand-gold-light transition flex items-center gap-2 shadow-lg min-h-[44px]">
          <i class="fa-solid fa-bullhorn"></i>
          <span>Udostępnij na Tablicy LUMINA</span>
        </a>

        <a href="https://api.whatsapp.com/send?text=Dzie%C5%84%2024%20Kursu%20Codziennego%20Pisma%20%C5%9Awi%C4%99tego%3A%20J%C3%B3zef%20%E2%80%94%20marzenie%2C%20zdrada%20i%20Bo%C5%BCa%20opatrzno%C5%9B%C4%87%20https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-24" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-500 transition flex items-center gap-2 shadow-lg min-h-[44px]">
          <i class="fa-brands fa-whatsapp"></i>
          <span>WhatsApp</span>
        </a>

        <a href="https://x.com/intent/tweet?text=Dzie%C5%84%2024%20Kursu%20Codziennego%20Pisma%20%C5%9Awi%C4%99tego%3A%20J%C3%B3zef%20%E2%80%94%20marzenie%2C%20zdrada%20i%20Bo%C5%BCa%20opatrzno%C5%9B%C4%87&url=https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-24" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl bg-black text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 border border-zinc-700 transition flex items-center gap-2 shadow-lg min-h-[44px]">
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
        ✓ Gratulacje! Lekcja Dnia 24 została zapisana w Twoim profilu formacyjnym.
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
      { q: "1. Kim był Edom?", a: ["Ezawem i jego potomkami", "Synem Jakuba", "Władcą Egiptu"], c: 0 },
      { q: "2. Dokąd przeniósł się Ezaw?", a: ["Do Charanu", "Do Seiru", "Do Egiptu"], c: 1 },
      { q: "3. Co wymienia 36. rozdział Księgi Rodzaju?", a: ["Przepisy ofiarnicze", "Potomków, naczelników i królów Edomu", "Historię potopu"], c: 1 },
      { q: "4. Gdzie mieszkał Jakub na początku Rdz 37?", a: ["W ziemi Kanaan", "W Ur chaldejskim", "W Damaszku"], c: 0 },
      { q: "5. Ile lat miał Józef na początku tej historii?", a: ["Dwanaście", "Siedemnaście", "Dwadzieścia pięć"], c: 1 },
      { q: "6. Kogo Jakub szczególnie kochał spośród synów?", a: ["Rubena", "Józefa", "Judę"], c: 1 },
      { q: "7. Co ojciec podarował Józefowi?", a: ["Złoty pierścień", "Szczególną, ozdobną szatę", "Srebrny puchar"], c: 1 },
      { q: "8. Dlaczego bracia nienawidzili Józefa?", a: ["Widzieli faworyzowanie i słyszeli jego sny", "Bo odebrał im stada", "Bo pobił ich w zapasach"], c: 0 },
      { q: "9. Co kłaniało się w pierwszym śnie Józefa?", a: ["Gwiazdy", "Snopy zboża", "Drzewa oliwne"], c: 1 },
      { q: "10. Co kłaniało się w drugim śnie Józefa?", a: ["Słońce, księżyc i 11 gwiazd", "Wielbłądy i lwy", "Dwanaście rzek"], c: 0 },
      { q: "11. Jak zareagował Jakub na drugi sen Józefa?", a: ["Wyparł się syna", "Zganił go, ale zachował sprawę w pamięci", "Natychmiast złożył ofiarę"], c: 1 },
      { q: "12. Dokąd Józef udał się szukać braci na polecenie ojca?", a: ["Do Egiptu", "Najpierw do Sychem, potem do Dotanu", "Do Beer-Szeby"], c: 1 },
      { q: "13. Co bracia początkowo zamierzali zrobić z Józefem?", a: ["Zabić go", "Wysłać do szkoły", "Uczynić sędzią"], c: 0 },
      { q: "14. Który brat próbował ocalić Józefa?", a: ["Symeon", "Ruben", "Dan"], c: 1 },
      { q: "15. Gdzie bracia wrzucili Józefa?", a: ["Do rzeki Jordan", "Do pustej cysterny bez wody", "Do jaskini zbójców"], c: 1 },
      { q: "16. Kto zaproponował sprzedaż Józefa kupcom?", a: ["Juda", "Lewi", "Zabulon"], c: 0 },
      { q: "17. Za ile srebra sprzedano Józefa?", a: ["Za dziesięć sztuk", "Za dwadzieścia sztuk srebra", "Za trzydzieści talentów"], c: 1 },
      { q: "18. Czym bracia splamili szatę Józefa, by okłamać ojca?", a: ["Czerwonym winem", "Krwią zabitego kozła", "Barwnikiem indygo"], c: 1 },
      { q: "19. Jak zareagował Jakub na widok zakrwawionej szaty?", a: ["Uznał Józefa za zmarłego i pogrążył się w żałobie", "Zwołał wojsko", "Ożenił się ponownie"], c: 0 },
      { q: "20. Komu w Egipcie został sprzedany Józef?", a: ["Faraonowi osobiście", "Potyfarowi, dowódcy straży", "Piekielnemu słudze"], c: 1 }
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
      localStorage.setItem('kc_day24_quiz', JSON.stringify(userAnswers));
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
      localStorage.removeItem('kc_day24_quiz');
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
      localStorage.setItem('kc_day24_completed', 'true');
      document.getElementById('completeMsg').classList.remove('hidden');
    };

    // Declare Faith
    document.getElementById('btnDeclareFaith').onclick = () => {
      alert('Twoja decyzja wiary została zapisana przed Bogiem. Niech Pan błogosławi Twój dzień!');
    };

    // Restore state
    window.addEventListener('DOMContentLoaded', () => {
      try {
        const saved = localStorage.getItem('kc_day24_quiz');
        if (saved) userAnswers = JSON.parse(saved);
      } catch (e) {}
      renderQuiz();

      if (localStorage.getItem('kc_day24_completed') === 'true') {
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
  <script src="/js/cc-daily-course-share.js?v=20261114_share2" defer></script>
</body>
</html>`;
}

// Write the 4 paths
const paths = [
  path.join(ROOT, 'akademia/kurscodzienny/dzien-24.html'),
  path.join(ROOT, 'akademia/kurscodzienny/dzien-24/index.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-24.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-24/index.html'),
  path.join(LUMINA_ROOT, 'akademia/kurscodzienny/dzien-24.html'),
  path.join(LUMINA_ROOT, 'akademia/kurscodzienny/dzien-24/index.html'),
  path.join(LUMINA_ROOT, 'kursy/kurscodzienny/dzien-24.html'),
  path.join(LUMINA_ROOT, 'kursy/kurscodzienny/dzien-24/index.html')
];

const htmlContent = getDay24Html();

paths.forEach(p => {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, htmlContent, 'utf8');
  console.log('Saved:', p);
});
