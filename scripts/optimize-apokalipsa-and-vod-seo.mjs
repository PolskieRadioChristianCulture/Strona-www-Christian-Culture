import fs from 'node:fs';
import path from 'node:path';

const REPO = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const APOK_DIR = path.join(REPO, 'akademia/apokalipsa');
const KURSY_APOK_DIR = path.join(REPO, 'kursy/apokalipsa');

// Kompletne, nieucięte opisy SEO (140-158 znaków) + optymalne tytuły pod Google Search Console dla wszystkich 31 lekcji Apokalipsy
const SEO_MAP = {
  1: {
    title: 'Objawienie Jezusa Chrystusa (Apokalipsa 1) — Co oznacza słowo Apokalipsa? | Lekcja 1 | LUMINA Bible Academy',
    desc: 'Co naprawdę oznacza słowo Apokalipsa? Odkryj 1. rozdział Księgi Objawienia: dlaczego Apokalipsa odsłania Jezusa Chrystusa i daje nadzieję, a nie strach.'
  },
  2: {
    title: 'Jezus pośród Siedmiu Świeczników (Apokalipsa 1:9–20) — Chrystus i Jego Kościół | Lekcja 2 | LUMINA Bible Academy',
    desc: 'Kim jest Syna Człowieczy pośród siedmiu złotych świeczników w Apokalipsie 1? Zobacz uwielbionego Jezusa Chrystusa, który ma klucze śmierci i grobu.'
  },
  3: {
    title: 'Listy do Efezu i Smyrny (Apokalipsa 2:1–11) — Pierwsza miłość i wierność w próbie | Lekcja 3 | LUMINA Bible Academy',
    desc: 'Co Jezus mówi Kościołowi w Efezie i Smyrnie (Obj 2:1–11)? Poznaj biblijne znaczenie porzucenia pierwszej miłości oraz obietnicę korony żywota dla wiernych.'
  },
  4: {
    title: 'Listy do Pergamonu i Tiatyry (Apokalipsa 2:12–29) — Kompromis czy wierność Prawdzie? | Lekcja 4 | LUMINA Bible Academy',
    desc: 'Czym był tron szatana w Pergamonie i fałszywa prorokini Izebel w Tiatyrze (Obj 2:12–29)? Biblijne ostrzeżenie przed kompromisem doktrynalnym w Kościele.'
  },
  5: {
    title: 'Listy do Sardes i Filadelfii (Apokalipsa 3:1–13) — Przebudzenie i otwarte drzwi | Lekcja 5 | LUMINA Bible Academy',
    desc: 'Masz imię, że żyjesz, a jesteś umarły — jak obudzić wiarę według listu do Sardes i przejść przez otwarte drzwi Chrystusa dla Filadelfii (Obj 3:1–13)?'
  },
  6: {
    title: 'List do Laodycei (Apokalipsa 3:14–22) — Oto stoję u drzwi i kołaczę | Lekcja 6 | LUMINA Bible Academy',
    desc: 'Dlaczego Kościół w Laodycei był letni i czego naprawdę potrzebował od Chrystusa (Obj 3:14–22)? Poznaj złoto wypróbowane w ogniu i białe szaty sprawiedliwości.'
  },
  7: {
    title: 'Tron Boga w Niebie (Apokalipsa 4) — Cztery istoty żyjące i 24 starców | Lekcja 7 | LUMINA Bible Academy',
    desc: 'Kto zasiada na tronie wszechświata w 4. rozdziale Apokalipsy? Odkryj biblijną symbolikę tęczy przymierza, 24 starców, morza szklanego i czci dla Stwórcy.'
  },
  8: {
    title: 'Baranek Godzien Otworzyć Księgę z Siedmioma Pieczęciami (Apokalipsa 5) | Lekcja 8 | LUMINA Bible Academy',
    desc: 'Dlaczego tylko Lew z pokolenia Judy — zabity Baranek — był godzien otworzyć księgę z siedmioma pieczęciami (Obj 5)? Triumf Chrystusa przez ofiarę krzyża.'
  },
  9: {
    title: '4 Jeźdźcy Apokalipsy: Kolory Koni i Znaczenie Pieczęci (Obj 6:1–8) | Lekcja 9 | LUMINA Bible Academy',
    desc: 'Kim są czterej jeźdźcy Apokalipsy i co oznaczają kolory koni: biały, rydzy (czerwony), kary (czarny) i płowy (Obj 6:1–8)? Biblijne wyjaśnienie czterech pieczęci.'
  },
  10: {
    title: 'Piąta Pieczęć Apokalipsy: Dusze pod Ołtarzem i Stan Umarłych (Obj 6:9–11) | Lekcja 10 | LUMINA Bible Academy',
    desc: 'Co oznacza wołanie dusz męczenników spod ołtarza w piątej pieczęci (Obj 6:9–11)? Biblijna prawda o stanie umarłych, białych szatach i Bożej sprawiedliwości.'
  },
  11: {
    title: 'Szósta Pieczęć Apokalipsy: Znaki na Niebie i Powtórne Przyjście Jezusa (Obj 6:12–17) | Lekcja 11 | LUMINA Bible Academy',
    desc: 'Trzęsienie ziemi, zaćmienie słońca, krwawy księżyc i spadające gwiazdy w szóstej pieczęci (Obj 6:12–17). Kto może się ostać w dzień przyjścia Chrystusa?'
  },
  12: {
    title: '144 000 Zapieczętowanych i Wielki Tłum w Białych Szatach (Apokalipsa 7) | Lekcja 12 | LUMINA Bible Academy',
    desc: 'Kim jest 144 000 zapieczętowanych sług Bożych oraz wielki tłum przed tronem Baranka w Apokalipsie 7? Czym jest pieczęć Boga żywego na czołach wiernych?'
  },
  13: {
    title: 'Siedem Trąb Apokalipsy (Cz. 1): Ogień, Krew i Gwiazda Piołun (Obj 8) | Lekcja 13 | LUMINA Bible Academy',
    desc: 'Co oznaczają pierwsze cztery trąby Apokalipsy i gwiazda Piołun (Obj 8)? Zobacz, jak modlitwy świętych przy złotym ołtarzu poprzedzają Boże sądy w historii.'
  },
  14: {
    title: 'Siedem Trąb Apokalipsy (Cz. 2): Piąta, Szósta i Siódma Trąba (Obj 9 i 11:15–19) | Lekcja 14 | LUMINA Bible Academy',
    desc: 'Studnia przepaści, trzy „biada” oraz siódma trąba zwiastująca Królestwo Chrystusa i ukazanie Arki Przymierza w świątyni niebieskiej (Obj 9; 11:15–19).'
  },
  15: {
    title: 'Dwaj Świadkowie Apokalipsy: 1260 Dni Prorokowania w Worach (Obj 11:3–14) | Lekcja 15 | LUMINA Bible Academy',
    desc: 'Kim są dwaj świadkowie z 11. rozdziału Apokalipsy prorokujący przez 1260 dni? Odkryj, jak Stary i Nowy Testament przetrwały próby zniszczenia Słowa Bożego.'
  },
  16: {
    title: 'Anioł z Otwartą Książeczką: Słodka w Ustach, Gorzka w Żołądku (Apokalipsa 10) | Lekcja 16 | LUMINA Bible Academy',
    desc: 'Kim jest Potężny Anioł z otwartą książeczką w Apokalipsie 10? Dlaczego odpieczętowana Księga Daniela była słodka jak miód w ustach, a gorzka w wnętrznościach?'
  },
  17: {
    title: 'Zmierz Świątynię Bożą i Ołtarz (Apokalipsa 11:1–2) — Sąd i Niebiańska Świątynia | Lekcja 17 | LUMINA Bible Academy',
    desc: 'Co oznacza polecenie „Wstań i zmierz świątynię Bożą oraz ołtarz” w Apokalipsie 11:1–2? Odkryj biblijne znaczenie sądu przedpowrotowego i Arki Przymierza.'
  },
  18: {
    title: 'Niewiasta Obleczona w Słońce, Smok i Dziecię (Apokalipsa 12:1–10) | Lekcja 18 | LUMINA Bible Academy',
    desc: 'Kogo symbolizuje Niewiasta obleczona w słońce z wieńcem z 12 gwiazd oraz wielki Smok rudy w Apokalipsie 12? Wielki bój między Chrystusem a szatanem.'
  },
  19: {
    title: 'Zwyciężyli Smoka przez Krew Baranka i Resztka Niewiasty (Apokalipsa 12:11–17) | Lekcja 19 | LUMINA Bible Academy',
    desc: 'Jak wierzący zwyciężają oskarżyciela przez krew Baranka i słowo świadectwa (Obj 12:11)? Poznaj biblijne cechy Kościoła ostateku zachowującego przykazania Boga.'
  },
  20: {
    title: 'Bestia z Morza w Apokalipsie 13: 7 Głów, 10 Rogów i Tożsamość Biblijna | Lekcja 20 | LUMINA Bible Academy',
    desc: 'Kim jest pierwsza bestia wychodząca z morza w Apokalipsie 13:1–10? Analiza 10 biblijnych znaków rozpoznawczych i związku z wizją czterech zwierząt z Daniela 7.'
  },
  21: {
    title: 'Bestia z Morza i 1260 Lat Proroctwa (42 Miesiące w Apokalipsie 13:5) | Lekcja 21 | LUMINA Bible Academy',
    desc: 'Jak wypełniło się proroctwo o 42 miesiącach (1260 latach) działania bestii z morza i uleczeniu jej śmiertelnej rany (Obj 13:3–8)? Proroctwo spotyka historię.'
  },
  22: {
    title: 'Bestia z Ziemi (Fałszywy Prorok) w Apokalipsie 13:11–17 — Dwa Rogi jak u Baranka | Lekcja 22 | LUMINA Bible Academy',
    desc: 'Kim jest druga bestia wychodząca z ziemi w Apokalipsie 13:11–17, mająca dwa rogi jak u baranka, a mówiąca jak smok? Biblijna identyfikacja i znaki zwiedzenia.'
  },
  23: {
    title: 'Obraz Bestii i Przymus Pokłonu: Księga Daniela 3 Kluczem do Apokalipsy 13 | Lekcja 23 | LUMINA Bible Academy',
    desc: 'Dlaczego historia złotego posągu na równinie Dura (Daniel 3) i wierność trzech młodzieńców są biblijnym kluczem do zrozumienia obrazu bestii w Apokalipsie 13?'
  },
  24: {
    title: 'Znamię Bestii na Czole lub Ręce (Apokalipsa 13:16–17) — Co oznacza w Biblii? | Lekcja 24 | LUMINA Bible Academy',
    desc: 'Czym naprawdę jest znamię bestii na czole lub na prawej ręce (Obj 13:16–17) w świetle Pwt 6:8? Dlaczego w sporze ostatecznym chodzi o przykazania Boże, nie o czipy?'
  },
  25: {
    title: '666 — Liczba Bestii i Liczba Człowieka (Apokalipsa 13:18) — Biblijne Wyjaśnienie | Lekcja 25 | LUMINA Bible Academy',
    desc: 'Co oznacza liczba 666 w Apokalipsie 13:18 („jest to bowiem liczba człowieka”)? Poznaj biblijną symbolikę potrójnej szóstki przeciwstawionej Bożej siódemce.'
  },
  26: {
    title: 'Trójanielskie Poselstwo (Cz. 1): Wieczna Ewangelia i Pierwszy Anioł (Obj 14:6–7) | Lekcja 26 | LUMINA Bible Academy',
    desc: 'Na czym polega wieczna Ewangelia głoszona przez pierwszego anioła z Apokalipsy 14:6–7 wszystkim narodom, plemionom i językom przed powrotem Chrystusa?'
  },
  27: {
    title: 'Nastała Godzina Sądu Jego (Apokalipsa 14:7) — Tajemnica Jom Kippur i Pojednania | Lekcja 27 | LUMINA Bible Academy',
    desc: 'Dlaczego pierwszy anioł z Apokalipsy 14:7 ogłasza: „nastała godzina sądu jego”? Odkryj biblijny Dzień Pojednania (Jom Kippur) i obronę wierzących przez Chrystusa.'
  },
  28: {
    title: 'Oddajcie Pokłon Stwórcy Nieba i Ziemi (Apokalipsa 14:7) — Pieczęć Boga a Szabat | Lekcja 28 | LUMINA Bible Academy',
    desc: 'Dlaczego Apokalipsa 14:7 cytuje czwarte przykazanie Dekalogu (Wj 20:11)? Poznaj biblijny Szabat jako wieczny znak Stwórcy i pieczęć Boga żywego.'
  },
  29: {
    title: 'Upadł Babilon i Ostrzeżenie Trzeciego Anioła (Apokalipsa 14:8–12) | Lekcja 29 | LUMINA Bible Academy',
    desc: 'Co głosi drugi i trzeci anioł w Apokalipsie 14:8–12? Upadek duchowego Babilonu, ostrzeżenie przed znamieniem bestii oraz święci zachowujący przykazania Boga i wiarę Jezusa.'
  },
  30: {
    title: 'Wielki Babilon i Szkarłatna Niewiasta na Bestii (Apokalipsa 17:1–6) | Lekcja 30 | LUMINA Bible Academy',
    desc: 'Kim jest niewiasta odziana w purpurę i szkarłat siedząca na szkarłatnej bestii w Apokalipsie 17? Biblijne wyjaśnienie symbolu duchowego Babilonu i wina jej nauk.'
  },
  31: {
    title: 'Siedem Głów, Ósmy Król i Zwycięstwo Baranka — Króla Królów (Apokalipsa 17:7–18) | Lekcja 31 | LUMINA Bible Academy',
    desc: 'Kim jest siedmiu królów i ósmy król z Apokalipsy 17:7–18? Zobacz, jak wszystkie ludzkie imperia ustępują przed Barankiem, który jest Panem panów i Królem królów!'
  }
};

function updateDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  const files = fs.readdirSync(dirPath).filter(f => /^lekcja-\d+\.html$/.test(f));
  let count = 0;

  for (const file of files) {
    const numMatch = file.match(/lekcja-0*(\d+)\.html/);
    if (!numMatch) continue;
    const lessonNum = parseInt(numMatch[1], 10);
    const seo = SEO_MAP[lessonNum];
    if (!seo) continue;

    const fullPath = path.join(dirPath, file);
    let html = fs.readFileSync(fullPath, 'utf8');

    // 1. Update <title>, <meta name="description">, og:title, og:description
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${seo.title}</title>`);
    html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${seo.desc}" />`);
    html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${seo.title}" />`);
    html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${seo.desc}" />`);

    // 2. Add Schema.org LearningResource / Course JSON-LD if not present
    const padded = String(lessonNum).padStart(2, '0');
    const canonicalUrl = `https://polskieradio.cc/akademia/apokalipsa/lekcja-${padded}`;
    if (!html.includes('"@type": "LearningResource"')) {
      const ldJson = `
  <!-- Schema.org LearningResource + FAQ -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "name": ${JSON.stringify(seo.title)},
    "description": ${JSON.stringify(seo.desc)},
    "url": ${JSON.stringify(canonicalUrl)},
    "inLanguage": "pl",
    "isAccessibleForFree": true,
    "learningResourceType": "Bible Study Lesson",
    "provider": {
      "@type": "Organization",
      "name": "LUMINA Bible Academy — Christian Culture",
      "url": "https://polskieradio.cc/akademia"
    }
  }
  </script>`;
      html = html.replace('</head>', `${ldJson}\n</head>`);
    }

    // 3. Add data-lesson-complete to #btn-complete-lesson and call CCAnalyticsMC.trackLessonComplete
    html = html.replace(
      /id="btn-complete-lesson"/g,
      'id="btn-complete-lesson" data-lesson-complete="true"'
    );
    if (!html.includes('trackLessonComplete') && html.includes("showToast('🎉 Gratulacje! Lekcja została oznaczona jako ukończona.');")) {
      html = html.replace(
        "showToast('🎉 Gratulacje! Lekcja została oznaczona jako ukończona.');",
        "showToast('🎉 Gratulacje! Lekcja została oznaczona jako ukończona.');\n        if (window.CCAnalyticsMC && typeof window.CCAnalyticsMC.trackLessonComplete === 'function') { window.CCAnalyticsMC.trackLessonComplete('apokalipsa', 'lekcja-' + lid, true, Math.round((done.length / 31) * 100)); }"
      );
    }

    // 4. Add WspieramTO 2.0 + Apokalipsa TV Live + Biblia Audio banner before Dolna Nawigacja
    if (!html.includes('id="apokWspieramBox"')) {
      const wspieramBox = `
    <!-- ── WSPIERAMTO 2.0 & KANAŁ APOKALIPSA LIVE 24/7 ── -->
    <section id="apokWspieramBox" class="reader-section" style="border-color:rgba(255,122,0,0.45);background:linear-gradient(135deg,rgba(14,18,26,0.96),rgba(25,20,16,0.96));text-align:center;">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
        <span>📺 NA ŻYWO 24/7 &amp; MISJA ZERO COST</span>
      </div>
      <h3 class="text-white font-serif font-bold text-lg sm:text-xl mb-2">Oglądaj wykłady wideo Apokalipsa 24/7 i wspieraj budowę Nowego Studia CC</h3>
      <p class="text-zinc-300 text-xs sm:text-sm max-w-2xl mx-auto mb-5 leading-relaxed">
        Wszystkie 31 lekcji kursu „Apokalipsa – Księga Nadziei”, całodobowy kanał wideo <strong>Apokalipsa Live</strong> oraz Biblia Audio są dostępne w 100% bezpłatnie. Pomóż nam utrzymać misję i wybudować Dom + Nowe Studio Radiowo-Telewizyjne Christian Culture.
      </p>
      <div class="flex items-center justify-center gap-3 flex-wrap">
        <a href="/apokalipsa-ksiega-nadziei-live" class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-bold text-xs uppercase tracking-wider min-h-[44px] transition">
          <i class="fa-solid fa-tv"></i>
          <span>Oglądaj Kanał Apokalipsa 24/7 →</span>
        </a>
        <a href="/wspieramto" class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FF7A00] hover:bg-[#FF8C33] active:bg-[#E66A00] text-white font-extrabold text-xs uppercase tracking-wider min-h-[44px] shadow-lg transition">
          <i class="fa-solid fa-heart"></i>
          <span>WspieramTO — Dom + Studio CC →</span>
        </a>
        <a href="/biblia-audio" class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-200 font-bold text-xs uppercase tracking-wider min-h-[44px] transition">
          <i class="fa-solid fa-headphones"></i>
          <span>Biblia Audio →</span>
        </a>
      </div>
    </section>
`;
      html = html.replace('<!-- ── DOLNA NAWIGACJA ── -->', `${wspieramBox}\n    <!-- ── DOLNA NAWIGACJA ── -->`);
    }

    fs.writeFileSync(fullPath, html, 'utf8');

    // Update directory index clean URL if exists (e.g. akademia/apokalipsa/lekcja-09/index.html)
    const cleanSubDir = path.join(dirPath, file.replace(/\.html$/, ''));
    if (fs.existsSync(cleanSubDir) && fs.statSync(cleanSubDir).isDirectory()) {
      const idxPath = path.join(cleanSubDir, 'index.html');
      if (fs.existsSync(idxPath)) {
        fs.writeFileSync(idxPath, html, 'utf8');
      }
    }

    count++;
  }
  return count;
}

const c1 = updateDirectory(APOK_DIR);
const c2 = updateDirectory(KURSY_APOK_DIR);
console.log(`✅ Zaktualizowano SEO, Schema.org LearningResource, GA4 lesson_complete i boksy WspieramTO/Apokalipsa Live w ${c1} plikach akademia/apokalipsa oraz ${c2} plikach kursy/apokalipsa!`);
