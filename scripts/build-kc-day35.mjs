import fs from 'node:fs';
import path from 'node:path';

const REPO = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const MIRROR = 'C:/Users/czark/Desktop/@ICC/LUMINA';

// Read base template (dzien-34.html)
let html = fs.readFileSync(path.join(REPO, 'akademia/kurscodzienny/dzien-34.html'), 'utf8');

// Read UBG Bible text for Exodus 4
const bibleData = JSON.parse(fs.readFileSync(path.join(REPO, 'data/bible/EXO_04.json'), 'utf8'));
const versesHtml = bibleData.verses.map(v => {
  return `<p><span class="verse-num">${v.verse}</span> ${v.text.UBG}</p>`;
}).join('\n        ');

// 20 pytań quizu dla Dnia 35
const quizData = [
  {
    q: "Jaką pierwszą wątpliwość wyraził Mojżesz w Wj 4:1 odnośnie Izraelitów w Egipcie?",
    a: [
      "„Nie mam pieniędzy na drogę”",
      "„A jeśli mi nie uwierzą i nie usłuchają mego głosu, lecz powiedzą: PAN ci się nie ukazał?”",
      "„Faraon natychmiast mnie uwięzi”"
    ],
    c: 1
  },
  {
    q: "O co zapytał PAN Mojżesza w Wj 4:2, zanim dał mu pierwszy znak?",
    a: [
      "„Co masz w ręku?”",
      "„Ile masz lat?”",
      "„Gdzie jest twoje stado?”"
    ],
    c: 0
  },
  {
    q: "W co zamieniła się laska Mojżesza, gdy rzucił ją na ziemię (Wj 4:3)?",
    a: [
      "W strumień wody",
      "W węża, przed którym Mojżesz zaczął uciekać",
      "W płonący krzak"
    ],
    c: 1
  },
  {
    q: "Za co PAN nakazał Mojżeszowi chwycić węża, aby ten z powrotem stał się laską (Wj 4:4)?",
    a: [
      "Za głowę",
      "Za ogon",
      "Miał nakryć go płaszczem"
    ],
    c: 1
  },
  {
    q: "Jaki był cel pierwszego cudownego znaku z laską i wężem według Wj 4:5?",
    a: [
      "Przestraszenie magów egipskich",
      "Aby uwierzyli, że ukazał mu się PAN, Bóg ich ojców: Abrahama, Izaaka i Jakuba",
      "Pokazanie wyższości nad pasterzami Madianu"
    ],
    c: 1
  },
  {
    q: "Jaki był drugi cudowny znak dany Mojżeszowi w Wj 4:6–7?",
    a: [
      "Ręka włożona w zanadrze stała się trędowata, biała jak śnieg, a po ponownym włożeniu została uleczona",
      "Z nieba spadł ogień na ołtarz",
      "Kamień na pustyni pękł i wytrysnęła woda"
    ],
    c: 0
  },
  {
    q: "Jaki trzeci znak zapowiedział Bóg na wypadek, gdyby lud nie uwierzył dwóm pierwszym znakom (Wj 4:9)?",
    a: [
      "Ciemność ogarnie cały Kanaan",
      "Woda wzięta z Nilu po wylaniu na suchą ziemię zamieni się w krew",
      "Trzęsienie ziemi zburzy mury Madianu"
    ],
    c: 1
  },
  {
    q: "Jaką wymówkę podał Mojżesz w Wj 4:10, próbując uchylić się od misji?",
    a: [
      "Że jest zbyt młody i niedoświadczony",
      "Że nie jest człowiekiem wymownym, lecz ma ociężałe usta i ociężały język",
      "Że musi najpierw pochować swego teścia"
    ],
    c: 1
  },
  {
    q: "Co PAN odpowiedział Mojżeszowi na zarzut o brak wymowy w Wj 4:11?",
    a: [
      "„Kto dał człowiekowi usta? Albo kto czyni go niemym albo głuchym, widzącym albo ślepym? Czyż nie Ja, PAN?”",
      "„Nauczę cię sztuki retoryki w Egipcie”",
      "„Twoja wymowa nie ma żadnego znaczenia”"
    ],
    c: 0
  },
  {
    q: "Jaką obietnicę złożył PAN Mojżeszowi w Wj 4:12?",
    a: [
      "Że da mu złoto i srebro",
      "„Idź więc teraz, a Ja będę z twoimi ustami i nauczę cię, co masz mówić”",
      "Że aniołowie będą mówić za niego"
    ],
    c: 1
  },
  {
    q: "Jak zareagował Mojżesz w Wj 4:13 po Bożej obietnicy?",
    a: [
      "Z radością padł na twarz",
      "Powiedział: „O, mój Panie, poślij, proszę, kogoś innego”",
      "Poprosił o pisemny dekret"
    ],
    c: 1
  },
  {
    q: "Jak zareagował PAN na ostateczny opór Mojżesza w Wj 4:14?",
    a: [
      "Odrzucił Mojżesza na zawsze",
      "Zapłonął gniew PANA na Mojżesza i wyznaczył Aarona jako jego rzecznika",
      "Zrezygnował z wyprowadzenia Izraela"
    ],
    c: 1
  },
  {
    q: "Z jakiego pokolenia pochodził Aaron i jak Bóg scharakteryzował jego zdolności (Wj 4:14)?",
    a: [
      "Z pokolenia Judy, potrafi walczyć mieczem",
      "Z pokolenia Lewiego („Aaron, Lewita”); Bóg powiedział: „Wiem, że on potrafi dobrze mówić”",
      "Z pokolenia Józefa, zna zwyczaje dworskie"
    ],
    c: 1
  },
  {
    q: "Jaką rolę Bóg wyznaczył Aaronowi względem Mojżesza w Wj 4:16?",
    a: [
      "Aaron miał być królem, a Mojżesz kapłanem",
      "Aaron miał być ustami (rzecznikiem) dla Mojżesza, a Mojżesz miał być dla niego „zamiast Boga”",
      "Mieli rządzić na przemian co miesiąc"
    ],
    c: 1
  },
  {
    q: "Co powiedział Jetro, teść Mojżesza, gdy ten poprosił o pozwolenie na powrót do braci w Egipcie (Wj 4:18)?",
    a: [
      "„Zabraniam ci odchodzić”",
      "„Idź w pokoju”",
      "„Zostaw mi swoją żonę i synów”"
    ],
    c: 1
  },
  {
    q: "Jaką uspokajającą wiadomość przekazał PAN Mojżeszowi jeszcze w Madianie (Wj 4:19)?",
    a: [
      "Że Egipt nawiedziła zaraza",
      "Że pomarli wszyscy ludzie w Egipcie, którzy czyhali na jego życie",
      "Że faraon zrzekł się tronu"
    ],
    c: 1
  },
  {
    q: "Jak PAN nakazał nazwać naród Izraela w poselstwie skierowanym do faraona (Wj 4:22)?",
    a: [
      "„Izrael jest moim niewolnikiem”",
      "„Izrael jest moim synem, moim pierworodnym”",
      "„Izrael jest najpotężniejszym ludem ziemi”"
    ],
    c: 1
  },
  {
    q: "Jakie dramatyczne wydarzenie rozegrało się w gospodzie w drodze do Egiptu (Wj 4:24–26)?",
    a: [
      "Napadli na nich rozbójnicy pustynni",
      "PAN spotkał Mojżesza i chciał go zabić za brak obrzezania syna; Sefora dokonała obrzezania krzemieniem, ratując męża",
      "Gospodarz odmówił im noclegu"
    ],
    c: 1
  },
  {
    q: "Gdzie doszło do radosnego spotkania Mojżesza z Aaronem wysłanym przez Boga (Wj 4:27)?",
    a: [
      "W Memfis przy piramidach",
      "Na pustyni, na świętej górze Bożej (Horeb), gdzie powitali się pocałunkiem",
      "Na granicy ziemi Goszen"
    ],
    c: 1
  },
  {
    q: "Jak zareagowali starsi i lud Izraela, gdy Aaron opowiedział słowa Pana, a Mojżesz uczynił znaki (Wj 4:31)?",
    a: [
      "Wyśmiali ich i wygnali z obozu",
      "Lud uwierzył, a usłyszawszy, że PAN nawiedził swój lud i wejrzał na ich ucisk, skłonili głowy i oddali pokłon",
      "Zażądali natychmiastowego rozpoczęcia powstania zbrojnego"
    ],
    c: 1
  }
];

// 1. Meta / Head
html = html.replace(
  /<title>Dzień 34:[^<]+<\/title>/,
  '<title>Dzień 35: ZNAKI WIARY, POWOŁANIE I POWRÓT DO EGIPTU — BOŻA MOC W LUDZKIEJ SŁABOŚCI (Wj 4:1–31) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>'
);

html = html.replace(
  /<meta name="description" content="[^"]+" \/>/,
  '<meta name="description" content="Księga Wyjścia — Miesiąc 2, Dzień 35 (4 Listopada 2026). Trzy znaki wiary, zmaganie z powołaniem, Aaron rzecznikiem, przymierze krwi i powrót Mojżesza do uciemiężonego ludu — Wj 4:1–31. Kurs codzienny Pisma Świętego." />'
);

html = html.replace(
  /<link rel="canonical" href="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-34" \/>/,
  '<link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-35" />'
);

html = html.replace(
  /<meta property="og:url" content="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-34" \/>/,
  '<meta property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-35" />'
);

html = html.replace(
  /<meta property="og:title" content="[^"]+" \/>/,
  '<meta property="og:title" content="Dzień 35: ZNAKI WIARY, POWOŁANIE I POWRÓT DO EGIPTU — Z Biblią za Pan Brat" />'
);

html = html.replace(
  /<meta property="og:description" content="[^"]+" \/>/,
  '<meta property="og:description" content="Księga Wyjścia — Miesiąc 2, Dzień 35. Trzy znaki wiary, powołanie Aarona, ocalające obrzezanie i wiara ludu w Egipcie — Wj 4:1–31." />'
);

html = html.replace(
  /<meta property="og:image" content="[^"]+" \/>/,
  '<meta property="og:image" content="https://polskieradio.cc/images/academy/daily/kc_day_35_powolanie_znaki_aaron.jpg?v=20261104" />'
);

// 2. Navigation Header & Breadcrumb
html = html.replace(
  /<a href="\/akademia\/kurscodzienny\/dzien-33"[^>]*>[\s\S]*?← Dzień 33[\s\S]*?<\/a>/,
  '<a href="/akademia/kurscodzienny/dzien-34" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">\n          <i class="fa-solid fa-chevron-left text-[10px]"></i>\n          <span>← Dzień 34</span>\n        </a>'
);

html = html.replace(
  /<a href="\/akademia\/kurscodzienny\/dzien-35"[^>]*>[\s\S]*?Dzień 35 →[\s\S]*?<\/a>/,
  '<span class="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-zinc-500 flex items-center gap-1.5 opacity-50 cursor-not-allowed min-h-[44px]">\n          <span>Dzień 36 (Jutro) →</span>\n          <i class="fa-solid fa-chevron-right text-[10px]"></i>\n        </span>'
);

html = html.replace(
  /<span class="px-3 py-1\.5 rounded-lg bg-white\/5 text-xs text-zinc-500 flex items-center gap-1\.5 opacity-50 cursor-not-allowed min-h-\[44px\]">[\s\S]*?<span>Dzień 35 \(Jutro\) →<\/span>[\s\S]*?<\/span>/,
  '<span class="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-zinc-500 flex items-center gap-1.5 opacity-50 cursor-not-allowed min-h-[44px]">\n          <span>Dzień 36 (Jutro) →</span>\n          <i class="fa-solid fa-chevron-right text-[10px]"></i>\n        </span>'
);

html = html.replace(
  /<span class="text-amber-400 font-semibold">Dzień 34<\/span>/,
  '<span class="text-amber-400 font-semibold">Dzień 35</span>'
);

// 3. Hero Section
html = html.replace(
  /Księga Wyjścia • Miesiąc 2 • Dzień 34 z 2009/,
  'Księga Wyjścia • Miesiąc 2 • Dzień 35 z 2009'
);

html = html.replace(
  /3 LISTOPADA 2026 • WTOREK/,
  '4 LISTOPADA 2026 • ŚRODA'
);

html = html.replace(
  /<h1[^>]*>[\s\S]*?PŁONĄCY KRZAK: ŚWIĘTE IMIĘ BOGA I BOŻE ZSTĄPIENIE NA RATUNEK[\s\S]*?<\/h1>/,
  '<h1 class="text-2xl sm:text-4xl md:text-5xl font-black text-white font-display tracking-tight leading-tight">\n            ZNAKI WIARY, POWOŁANIE I POWRÓT DO EGIPTU — BOŻA MOC W LUDZKIEJ SŁABOŚCI\n          </h1>'
);

html = html.replace(
  /<p class="text-base sm:text-lg text-amber-300\/90 font-serif italic">[\s\S]*?<\/p>/,
  '<p class="text-base sm:text-lg text-amber-300/90 font-serif italic">\n        Wątpliwości Mojżesza, trzy cudowne znaki, Aaron rzecznikiem, przymierze krwi i powrót do uciemiężonego ludu (Wj 4:1–31)\n      </p>'
);

html = html.replace(
  /src="\/images\/academy\/daily\/kc_day_34_plonacy_krzak_horeb\.jpg\?v=20261103"/,
  'src="/images/academy/daily/kc_day_35_powolanie_znaki_aaron.jpg?v=20261104"'
);

html = html.replace(
  /alt="Dzień 34:[^"]+"/,
  'alt="Dzień 35: ZNAKI WIARY, POWOŁANIE I POWRÓT DO EGIPTU — BOŻA MOC W LUDZKIEJ SŁABOŚCI (Wj 4:1–31)"'
);

html = html.replace(
  /<span>Ilustracja biblijna: Mojżesz przed płonącym krzewem na górze Horeb<\/span>/,
  '<span>Ilustracja biblijna: Pasterz Mojżesz i Aaron u stóp góry Horeb</span>'
);

html = html.replace(
  /<span class="font-mono text-brand-gold">Czytanie: Wj 3:1–22<\/span>/g,
  '<span class="font-mono text-brand-gold">Czytanie: Wj 4:1–31</span>'
);

// Memory Verse
const memText = 'I PAN powiedział do niego: Kto dał człowiekowi usta? Albo kto czyni go niemym albo głuchym, widzącym albo ślepym? Czyż nie Ja, PAN? Idź więc teraz, a Ja będę z twoimi ustami i nauczę cię, co masz mówić.';
const memRef = 'Księga Wyjścia 4:11–12 (UBG)';
const copyContent = `${memText} (${memRef})`;

html = html.replace(
  /navigator\.clipboard\.writeText\('[^']+'\);\s*alert\('[^']+'\);/,
  `navigator.clipboard.writeText('${copyContent.replace(/'/g, "\\'")}'); alert('Skopiowano werset!');`
);

html = html.replace(
  /<blockquote class="font-serif italic text-base sm:text-lg text-white">[\s\S]*?<\/blockquote>/,
  `<blockquote class="font-serif italic text-base sm:text-lg text-white">\n          „${memText}”\n        </blockquote>`
);

html = html.replace(
  /<div class="text-right text-xs text-brand-gold font-bold mt-1 font-mono">[\s\S]*?<\/div>/,
  `<div class="text-right text-xs text-brand-gold font-bold mt-1 font-mono">\n          — ${memRef}\n        </div>`
);

// Core Thesis
html = html.replace(
  /<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>[\s\S]*?<\/div>/,
  `<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>\n        Czwarty rozdział Księgi Wyjścia ukazuje zmaganie człowieka z powołaniem oraz suwerenność Boga, który odpowiada na ludzkie lęki znakami łaski, posyła pomocnika i wzywa do bezkompromisowej wierności przymierzu. Bóg nie szuka ludzkiej elokwencji, lecz posłusznego serca.\n      </div>`
);

// 4. Card 1: Podróż przez 66 Ksiąg
html = html.replace(
  /Dziś jest <strong class="text-white">Dzień 34<\/strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 3:1–22<\/strong>\./,
  'Dziś jest <strong class="text-white">Dzień 35</strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 4:1–31</strong>.'
);

html = html.replace(
  /href="\/mojabiblia\?book=EXO&amp;chapter=2"/g,
  'href="/mojabiblia?book=EXO&amp;chapter=4"'
);

html = html.replace(
  /href="\/mojabiblia\?book=EXO&amp;chapter=3"/g,
  'href="/mojabiblia?book=EXO&amp;chapter=4"'
);

html = html.replace(
  /<span>Czytaj Wj 3:1–22<\/span>/,
  '<span>Czytaj Wj 4:1–31</span>'
);

// 5. Card 2: Scripture Text
html = html.replace(
  /<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 3:1–22<\/p>/,
  '<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska (UBG) • Wj 4:1–31</p>'
);

html = html.replace(
  /<!-- SCRIPTURE SECTION \(Wj 3:1–22\) -->/,
  '<!-- SCRIPTURE SECTION (Wj 4:1–31) -->'
);

html = html.replace(
  /<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>/,
  `<div class="kc-prose-reading">\n        ${versesHtml}\n      </div>\n    </section>`
);

// 6. Card 3: ZANIM OTWORZYSZ BIBLIĘ
const card3Intro = `<section class="kc-card space-y-4 font-serif text-sm sm:text-base text-zinc-300 leading-relaxed">
      <div class="flex items-center gap-2 border-b border-brand-line pb-4">
        <span class="w-8 h-8 rounded-lg bg-brand-gold/15 flex items-center justify-center text-brand-gold">
          <i class="fa-solid fa-compass"></i>
        </span>
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-white font-display">ZANIM OTWORZYSZ BIBLIĘ</h2>
          <p class="text-xs text-zinc-400">Ludzkie zmaganie z powołaniem i pedagogika Bożej łaski</p>
        </div>
      </div>
      <p>
        Czwarty rozdział Księgi Wyjścia stanowi bezpośrednią kontynuację teofanii przy płonącym krzewie na Bożej górze Horeb. W rozdziale trzecim Bóg objawił swoje święte Imię: JESTEM, KTÓRY JESTEM (JHWH), ogłosił historyczne zstąpienie na ratunek uciskanemu ludowi w Egipcie i powołał osiemdziesięcioletniego pasterza Mojżesza na swojego wysłannika. W rozdziale czwartym jesteśmy świadkami niezwykle dramatycznego dialogu między Stwórcą a powołanym człowiekiem. Mojżesz, świadom klęski sprzed czterdziestu lat, gdy próbował wyzwolić braci własną siłą (Wj 2:11–15), zmaga się z głębokim kompleksem nieadekwatności, sceptycyzmem i paraliżującym lękiem przed odrzuceniem.
      </p>
      <p>
        W odpowiedzi na jego obawy Bóg nie odrzuca Mojżesza, lecz w cierpliwej pedagogice wyposaża go w trzy spektakularne znaki: laskę zamienioną w węża, rękę dotkniętą i uleczoną z trądu oraz wodę Nilu obracającą się w krew na ziemi. Każdy z tych znaków uderza w fundamenty egipskiej religii i magii, demonstrując całkowitą supremację Boga Abrahama nad siłami chaosu, chorobą i bóstwami imperium.
      </p>
      <p>
        Gdy Mojżesz nadal wymawia się ociężałością ust i prosi o posłanie kogoś innego, Bóg w sprawiedliwym gniewie powołuje jego brata Aarona na rzecznika, objawiając zasadę braterskiej współpracy w dziele Królestwa. Rozdział zawiera również tajemniczy i wstrząsający epizod w gospodzie (Wj 4:24–26), gdzie zaniedbane przymierze obrzezania staje się kwestią życia i śmierci, a krew przymierza przynosi ocalenie. Zwieńczeniem rozdziału jest powrót do Egiptu, spotkanie z Aaronem i starszymi narodu oraz triumf wiary uciemiężonego ludu, który skłania głowy w pokłonie uwielbienia.
      </p>
    </section>`;

html = html.replace(
  /<section class="kc-card space-y-4 font-serif text-sm sm:text-base text-zinc-300 leading-relaxed">[\s\S]*?<\/section>/,
  card3Intro
);

// 7. Hebrew Strong chips (Wj 4)
const strongChipsCard = `<!-- HEBREW STRONG CODES & EXEGESIS CHIPS -->
    <section class="kc-card">
      <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">
        <i class="fa-solid fa-spell-check text-amber-400"></i>
        <span>Klucze Językowe & Kody Stronga (Wj 4)</span>
      </div>
      <p class="text-xs text-zinc-300 mb-4 leading-relaxed font-serif">
        Poniższe terminy hebrajskie stanowią osnowę teologiczną 4. rozdziału Księgi Wyjścia:
      </p>
      <div class="flex flex-wrap gap-2">
        <span class="strong-chip"><span class="strong-id">H4294</span> <span class="strong-orig">מַטֶּה (matteh)</span> — laska pasterska / berło Boga (Wj 4:2, 20)</span>
        <span class="strong-chip"><span class="strong-id">H5175</span> <span class="strong-orig">נָחָשׁ (nahash)</span> — wąż — symbol buntu i potęgi faraona (Wj 4:3)</span>
        <span class="strong-chip"><span class="strong-id">H6883</span> <span class="strong-orig">צָרַעַת (tsara'at)</span> — trąd — skażenie grzechem i Boże uleczenie (Wj 4:6)</span>
        <span class="strong-chip"><span class="strong-id">H1818</span> <span class="strong-orig">דָּם (dam)</span> — krew — znak sądu i przymierza (Wj 4:9, 25)</span>
        <span class="strong-chip"><span class="strong-id">H2860</span> <span class="strong-orig">חָתָן (chatan)</span> — oblubieniec — „oblubieniec krwi” (Wj 4:25)</span>
        <span class="strong-chip"><span class="strong-id">H6485</span> <span class="strong-orig">פָּקַד (paqad)</span> — nawiedzić — „PAN nawiedził synów Izraela” (Wj 4:31)</span>
      </div>
    </section>`;

html = html.replace(
  /<!-- HEBREW STRONG CODES & EXEGESIS CHIPS -->[\s\S]*?<\/section>/,
  strongChipsCard
);

// 8. Exegesis sections (Punkty 1–38)
const exegesisContent = `<!-- THEOLOGICAL EXEGESIS (4 CZĘŚCI) -->
    <section class="kc-card space-y-6">
      <div class="flex items-center gap-2 border-b border-brand-line pb-4">
        <span class="w-8 h-8 rounded-lg bg-brand-gold/15 flex items-center justify-center text-brand-gold">
          <i class="fa-solid fa-feather-pointed"></i>
        </span>
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-white font-display">EGZEGEZA & FORMACJA TEOLOGICZNA</h2>
          <p class="text-xs text-zinc-400">Cztery części studium Wj 4:1–31 (38 punktów analitycznych)</p>
        </div>
      </div>

      <div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">
        <!-- CZĘŚĆ I -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
            WĄTPLIWOŚCI MOJŻESZA I TRZY CUDOWNE ZNAKI (WJ 4:1–9)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>1. Realizm sceptycyzmu Mojżesza (4:1):</strong> Mojżesz pyta: „A jeśli mi nie uwierzą i nie usłuchają mego głosu?”. Po 40 latach na wygnaniu pamięta bolesne słowa rodaka: „Któż cię ustanowił przełożonym i sędzią nad nami?” (Wj 2:14). Lęk przed odrzuceniem ujawnia skupienie na sobie zamiast na powadze Tego, który posyła.</p>
            <p><strong>2. Boska pedagogika: „Co masz w ręku?” (4:2):</strong> Bóg rozpoczyna od tego, co Mojżesz już posiada — zwykłej pasterskiej laski. Bóg uświęca to, co codzienne i proste, by objawić swoją chwałę.</p>
            <p><strong>3. Rzucenie laski i metamorfoza w węża (4:3):</strong> Laska zamienia się w węża (hebr. nahasz), a Mojżesz ucieka. Wąż w Egipcie (kobra Ureusz) symbolizował boską władzę faraona. Ucieczka pasterza odzwierciedla ludzki lęk przed demoniczną potęgą tyrana.</p>
            <p><strong>4. Chwyt za ogon: sprawdzian zaufania (4:4):</strong> Każdy pasterz wie, że węża chwyta się za głowę, nigdy za ogon. Nakaz Boga wymagał zaufania Słowu wbrew ludzkiej logice. W posłuszeństwie wąż znów staje się laską — zło zostaje ujarzmione przez wiarę.</p>
            <p><strong>5. Cel znaku: tożsamość Boga Przymierza (4:5):</strong> Znak ma potwierdzić, że Bóg Abrahama, Izaaka i Jakuba żyje, pamięta i wkracza w historię.</p>
            <p><strong>6. Drugi znak: ręka w zanadrzu i trąd (4:6):</strong> Ręka Mojżesza wyjęta z zanadrza jest pokryta trądem (hebr. caraat), biała jak śnieg — symbol śmiertelnego skażenia grzechem i ludzkiej bezradności.</p>
            <p><strong>7. Uzdrowienie ręki: suwerenność nad życiem (4:7):</strong> Ponowne włożenie ręki i jej natychmiastowe uzdrowienie dowodzi, że Bóg ma absolutną władzę nad chorobą, życiem i śmiercią.</p>
            <p><strong>8. Głos pierwszego i drugiego znaku (4:8):</strong> Znaki biblijne „mówią” — niosą poselstwo, że Bóg panuje zarówno nad zewnętrznym wrogiem politycznym, jak i nad wewnętrznym skażeniem serca.</p>
            <p><strong>9. Trzeci znak ostateczny: woda Nilu w krew (4:9):</strong> Nil był bóstwem Egiptu (Hapi). Wylanie wody i jej zamiana w krew (hebr. dam) to zapowiedź pierwszej plagi i sądu nad panteonem imperium.</p>
            <p><strong>10. Triada znaków a pełnia wiary (4:1–9):</strong> Trzy znaki harmonijnie ukazują władzę nad szatanem, grzechem i bałwochwalstwem.</p>
          </div>
        </div>

        <!-- CZĘŚĆ II -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
            OCIĘŻAŁOŚĆ MOWY, GNIEW PANA I POWOŁANIE AARONA (WJ 4:10–17)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>11. Wymówka retoryczna Mojżesza (4:10):</strong> Mojżesz twierdzi: „nie jestem człowiekiem wymownym... mam ociężałe usta i ociężały język” (hebr. kewad peh u-kewad laszon). Kompleks niższości paraliżuje jego gotowość.</p>
            <p><strong>12. Suwerenność Stwórcy nad zmysłami (4:11):</strong> Bóg odpowiada: „Kto dał człowiekowi usta? Albo kto czyni go niemym albo głuchym, widzącym albo ślepym? Czyż nie Ja, PAN?”. Ludzkie braki nie są przeszkodą dla Wszechmogącego.</p>
            <p><strong>13. Obietnica Bożej obecności przy ustach (4:12):</strong> „Ja będę z twoimi ustami i nauczę cię, co masz mówić”. Bóg nie daje elokwencji retora, lecz obiecuje Siebie Samego.</p>
            <p><strong>14. Upór człowieka: „Poślij kogo innego” (4:13):</strong> Odsłania się prawdziwa przyczyna: nie wada wymowy, lecz brak gotowości poddania własnej woli i lęk przed ryzykiem.</p>
            <p><strong>15. Sprawiedliwy gniew PANA (4:14):</strong> Trwanie w niewierze po otrzymaniu obietnic rani Bożą miłość i wywołuje święty gniew Pana.</p>
            <p><strong>16. Wyznaczenie Aarona Lewity (4:14):</strong> Bóg wskazuje brata: „Aaron potrafi dobrze mówić; oto wychodzi naprzeciw ciebie i uraduje się w sercu”.</p>
            <p><strong>17. Zasada braterskiej wspólnoty (4:15):</strong> Bóg nie odrzuca Mojżesza, lecz dołącza do niego pomocnika. W Królestwie nikt nie służy w pojedynkę.</p>
            <p><strong>18. Aaron ustami, Mojżesz zamiast Boga (4:16):</strong> Precyzyjna hierarchia: Mojżesz odbiera Boże objawienie, a Aaron jest jego rzecznikiem wobec ludu.</p>
            <p><strong>19. Laska pasterza staje się laską Boga (4:17):</strong> Pospolity kij pasterski zostaje przekształcony w berło Króla królów.</p>
            <p><strong>20. Lekcja pokory lidera (4:10–17):</strong> Biblijne przywództwo opiera się na złamaniu ludzkiej samowystarczalności i całkowitym zaufaniu łasce.</p>
          </div>
        </div>

        <!-- CZĘŚĆ III -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
            POŻEGNANIE Z JETREM, SĄD NAD PIERWORODNYMI I OCALAJĄCE OBRZEZANIE (WJ 4:18–26)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>21. Etyka pożegnania z Jetrem (4:18):</strong> Mojżesz z szacunkiem prosi teścia o zgodę na odejście. Odpowiedź Jetra: „Idź w pokoju” (lech le-szalom) potwierdza Boży porządek w rodzinie.</p>
            <p><strong>22. Uwolnienie od dawnego wyroku (4:19):</strong> Bóg zapewnia, że pomarli wszyscy wrogowie czyhający na jego życie w Egipcie.</p>
            <p><strong>23. Karawana pokory na ośle (4:20):</strong> Mojżesz sadza rodzinę na osła i bierze laskę Boga w dłoń — obraz pokornego przywódcy zapowiadający Chrystusa.</p>
            <p><strong>24. Zapowiedź zatwardzenia serca faraona (4:21):</strong> Bóg uprzedza o oporze władcy, by na oczach narodów objawić potęgę sprawiedliwości i zbawienia.</p>
            <p><strong>25. Proklamacja synostwa Izraela (4:22):</strong> „Izrael jest moim synem, moim pierworodnym” (hebr. beni bechori Jisrael). Niewolnicy są w oczach Boga królewskimi synami.</p>
            <p><strong>26. Zapowiedź dziesiątej plagi: śmierć pierworodnych (4:23):</strong> Odrzucenie Bożego pierworodnego sprowadzi śmierć na pierworodnych Egiptu.</p>
            <p><strong>27. Tajemnica w gospodzie: śmiertelna konfrontacja (4:24):</strong> Bóg spotyka Mojżesza w miejscu noclegu i „chce go zabić”. Posłannik nie może lekceważyć Bożego Prawa.</p>
            <p><strong>28. Zaniedbane obrzezanie syna (4:24–25):</strong> Zaniechanie obrzezania młodszego syna Gerszoma (Rdz 17:14) dyskwalifikowało przywódcę — wierność musi zacząć się we własnym domu.</p>
            <p><strong>29. Czyn Sefory i nóż krzemienny (4:25):</strong> Sefora obrzeza syna krzemieniem, dotyka stóp Mojżesza i woła: „Zaprawdę, jesteś dla mnie oblubieńcem krwi” (chatan damim).</p>
            <p><strong>30. Przebłaganie przez krew (4:26):</strong> Krew przymierza odwraca Boży gniew i ratuje życie — zapowiedź nocy paschalnej.</p>
          </div>
        </div>

        <!-- CZĘŚĆ IV -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
            BRATERSKIE SPOTKANIE Z AARONEM I WIARA LUDU W EGIPCIE (WJ 4:27–31)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>31. Prowadzenie Aarona na Bożą górę (4:27):</strong> Bóg posyła Aarona na pustynię, doprowadzając do doskonałej synchronizacji spotkania na Horebie.</p>
            <p><strong>32. Pocałunek braterski i jedność posługi (4:27):</strong> Po 40 latach rozłąki bracia witają się z miłością i czystą radością bez cienia zazdrości.</p>
            <p><strong>33. Pełny raport Mojżesza (4:28):</strong> Przejrzystość i wierność w przekazaniu wszystkich słów i znaków powierzonych przez Pana.</p>
            <p><strong>34. Zgromadzenie starszych Izraela (4:29):</strong> Szacunek dla starszeństwa i tradycyjnego porządku społecznego w narodzie przymierza.</p>
            <p><strong>35. Zwiastowanie Słowa przez Aarona (4:30a):</strong> Precyzyjne ogłoszenie Bożych słów ma pierwszeństwo przed znakami.</p>
            <p><strong>36. Czynienie znaków przed oczyma ludu (4:30b):</strong> Znaki uwierzytelniają boski autorytet zwiastowania.</p>
            <p><strong>37. Triumf wiary: „I lud uwierzył” (4:31a):</strong> Pierwszy lęk Mojżesza zostaje rozproszony — uciemiężeni ludzie przyjmują Bożą obietnicę z wiarą.</p>
            <p><strong>38. Nawiedzenie Boga i liturgiczny pokłon (4:31b):</strong> Słysząc, że Bóg nawiedził swój lud (pakad JHWH) i wejrzał na ich ucisk, Izraelici skłaniają głowy w dziękczynnym uwielbieniu.</p>
          </div>
        </div>
      </div>
    </section>`;

html = html.replace(
  /<!-- THEOLOGICAL EXEGESIS \(4 FILARY\) -->[\s\S]*?<\/section>/,
  exegesisContent
);

// 9. Card 5: JEZUS W CENTRUM (Punkty 39–45)
const card5Christ = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-cross"></i>
        <span>Jezus w centrum</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Większy niż Mojżesz, Zwycięzca Węża i Oblubieniec Krwi — Chrystus w centrum Wj 4</h3>
      <p class="text-sm sm:text-base text-zinc-300 leading-relaxed mb-4">
        Czwarty rozdział Księgi Wyjścia wskazuje na osobę i zbawcze dzieło Jezusa Chrystusa w siedmiu kluczowych wymiarach teologicznych:
      </p>
      <div class="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed pl-2 border-l-2 border-brand-gold/40">
        <p><strong>39. Chrystus — Prorok większy niż Mojżesz (Wj 4:10–12 a J 1:17; Hbr 3:1–6):</strong> Mojżesz zmagał się ze słabością wymowy; Jezus Chrystus jest samym Przedwiecznym Słowem (Logos), w którym zamieszkała cała pełnia Bóstwa. Mojżesz był sługą w domu Bożym, lecz Chrystus panuje jako Syn nad całym domem.</p>
        <p><strong>40. Zwycięstwo nad pradawnym wężem (Wj 4:3–4 a Rdz 3:15; Łk 10:19; Ap 12:9–11):</strong> Pochwycenie węża za ogon zapowiada triumf Jezusa nad szatanem. Na krzyżu Golgoty Chrystus starł głowę węża i dał swoim uczniom moc deptania po wężach i skorpionach.</p>
        <p><strong>41. Uzdrowienie z duchowego trądu (Wj 4:6–7 a Mt 8:1–3; Iz 53:4–5):</strong> Ręka Mojżesza oczyszczona z trądu wskazuje na Tego, który dotykał trędowatych i mówił: „Chcę, bądź oczyszczony”. Przez swoje rany Jezus uleczył śmiertelny trąd ludzkiego grzechu.</p>
        <p><strong>42. Krew Nowego Przymierza gładząca winę (Wj 4:24–26 a Mt 26:28; Hbr 9:22; 12:24):</strong> Incydent w gospodzie uczy, że bez przelania krwi nie ma ocalenia. Sefora nazwała Mojżesza „oblubieńcem krwi”. Jezus jest prawdziwym Oblubieńcem Kościoła, który nabył swoją Oblubienicę własną nieskalaną krwią na krzyżu.</p>
        <p><strong>43. Posłuszeństwo Syna bez wymówek (Wj 4:13–14 a Mt 26:39; Hbr 10:7):</strong> Gdy Mojżesz prosił: „poślij kogo innego”, wywołując Boży gniew, Jezus w Getsemane modlił się: „Nie moja, lecz Twoja wola niech się stanie”, wypełniając posłuszeństwo aż do śmierci krzyżowej.</p>
        <p><strong>44. Syn Pierworodny wydany za niewolników (Wj 4:22–23 a Rz 8:29, 32; Kol 1:15–18):</strong> Izrael został nazwany „synem pierworodnym”, lecz Jezus jest Jednorodzonym i Pierworodnym wszelkiego stworzenia. Bóg Ojciec wydał swego własnego Pierworodnego na śmierć, byśmy stali się dziećmi Bożymi.</p>
        <p><strong>45. Nawiedzenie i wieczne uwolnienie (Wj 4:31 a Łk 1:68; 7:16):</strong> Słowa: „PAN nawiedził synów Izraela” wypełniają się w pieśni Zachariasza o narodzeniu Zbawiciela: „Błogosławiony Pan, Bóg Izraela, że nawiedził i odkupił swój lud!”.</p>
      </div>
    </section>`;

html = html.replace(
  /<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-cross"><\/i>\s*<span>Jezus w centrum<\/span>[\s\S]*?<\/section>/,
  card5Christ
);

// 10. Card 6: SPRAWDŹ W BIBLII (Porównaj wersety)
const card6Compare = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-book-bible"></i>
        <span>Sprawdź w Biblii</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Porównaj wersety w swojej Biblii — studium porównawcze Wj 4:1–31</h3>
      <ul class="space-y-2.5 text-sm sm:text-base text-zinc-300 leading-relaxed list-disc list-inside">
        <li><strong>Wj 4:2–4 a Łk 10:19</strong> — Władza nad wężem dana Mojżeszowi zapowiada władzę uczniów Chrystusa nad potęgami ciemności.</li>
        <li><strong>Wj 4:6–7 a Mt 8:2–3</strong> — Oczyszczenie trądu u Mojżesza koresponduje z mesjańskim uleczeniem trędowatego przez Jezusa.</li>
        <li><strong>Wj 4:9 a J 2:1–11</strong> — Pierwszy znak Mojżesza przynosi krew i sąd nad Nilem, podczas gdy pierwszy cud Jezusa zamienia wodę w wino łaski i wesela.</li>
        <li><strong>Wj 4:10–12 a Jer 1:6–9</strong> — Bóg odpowiada na lęki Mojżesza i Jeremiasza dotyczące braku wymowy i młodego wieku.</li>
        <li><strong>Wj 4:11 a Ps 94:9</strong> — Kto stworzył ucho i oko oraz co z tego wynika dla naszej ufności w Bożą suwerenność?</li>
        <li><strong>Wj 4:14–16 a 1 Kor 12:14–22</strong> — Współpraca Mojżesza i Aarona ilustruje zasadę funkcjonowania Ciała Chrystusa i wzajemnego uzupełniania się darów.</li>
        <li><strong>Wj 4:17 a 1 Kor 1:27–29</strong> — Bóg posługuje się zwykłą laską pasterską, by zawstydzić mędrców i potęgę imperium Egiptu.</li>
        <li><strong>Wj 4:22 a Jr 31:9</strong> — Tytuł „syn pierworodny” wyraża szczególną miłość i ojcowską troskę Boga o Jego lud.</li>
        <li><strong>Wj 4:24–26 a Rdz 17:9–14</strong> — Znaczenie obrzezania jako nieodwołalnego znaku przymierza i konieczność posłuszeństwa we własnym domu.</li>
        <li><strong>Wj 4:25 a Kol 2:11–12</strong> — Fizyczne obrzezanie przymierza znajduje swoje duchowe wypełnienie w chrzcie i odrodzeniu w Chrystusie.</li>
        <li><strong>Wj 4:27 a Ps 133:1–3</strong> — Braterskie spotkanie Mojżesza i Aarona na Horebie objawia piękno i błogosławieństwo jedności braci w Panu.</li>
        <li><strong>Wj 4:31 a Łk 1:68</strong> — Słowa: „PAN nawiedził synów Izraela” wypełniają się w nawiedzeniu i odkupieniu ludu przez Chrystusa.</li>
      </ul>
    </section>`;

html = html.replace(
  /<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-book-bible"><\/i>\s*<span>Sprawdź w Biblii<\/span>[\s\S]*?<\/section>/,
  card6Compare
);

// 11. Card 7: PRAWDA NA DZIŚ
const card7Truth = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-lightbulb"></i>
        <span>Prawda na dziś</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Prawda na dziś — co zmienia się w moim patrzeniu</h3>
      <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <p>• <strong>Bóg zaczyna od tego, co masz w ręku:</strong> Nie musisz czekać na niezwykłe środki — oddaj Bogu swoją codzienność, pracę i proste talenty.</p>
        <p>• <strong>Twoja słabość nie ogranicza wszechmocy Stwórcy:</strong> Ten, który ukształtował ludzkie usta, uzdalnia powołanych i daje słowo we właściwym czasie.</p>
        <p>• <strong>Wymówki maskują brak zaufania:</strong> Odrzucenie Bożej misji rani serce Boga; prawdziwa pokora mówi: „Oto jestem, poślij mnie”.</p>
        <p>• <strong>Boże dzieło rozwija się we wspólnocie:</strong> Nikt nie jest powołany do samotnej walki; Aaron i Mojżesz przypominają o sile braterskiej współpracy.</p>
        <p>• <strong>Posłuszeństwo Bogu zaczyna się we własnym domu:</strong> Nie można przewodzić innym, zaniedbując Boże przykazania w życiu prywatnym i rodzinnym.</p>
        <p>• <strong>Krew Przymierza jest jedyną tarczą:</strong> Zdarzenie w gospodzie wskazuje na krzyż Golgoty — bez przelania krwi nie ma odpuszczenia grzechów.</p>
        <p>• <strong>Przeszkody ustępują przed wiarą:</strong> Ludzie, przed którymi drżysz, mogą otworzyć serca na Boże Słowo — zaufaj Bogu i głoś Jego obietnice z odwagą.</p>
        <p>• <strong>Zrozumienie Bożej troski rodzi pokłon:</strong> Gdy uświadomisz sobie, że Bóg wejrzał na Twój ucisk i przyszedł z pomocą, Twoje serce zegnie się w dziękczynnym uwielbieniu.</p>
      </div>
    </section>`;

html = html.replace(
  /<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-lightbulb"><\/i>\s*<span>Prawda na dziś<\/span>[\s\S]*?<\/section>/,
  card7Truth
);

// 12. Card 8: PYTANIA DO SERCA (POMYŚL)
const card8Questions = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-heart"></i>
        <span>Pomyśl</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Pytania do serca</h3>
      <ol class="space-y-3 text-sm sm:text-base text-zinc-300 leading-relaxed list-decimal list-inside">
        <li>Co jest ową „laską w Twoim ręku” — jakimi prostymi talentami lub narzędziami dysponujesz, które Bóg chce uświęcić i użyć?</li>
        <li>Jakie wymówki najczęściej podsuwasz Bogu, gdy czujesz wezwanie do zaangażowania się w Jego dzieło lub rozmowy o wierze?</li>
        <li>Czy wierzysz, że Stwórca Twoich ust i myśli potrafi poprowadzić Cię w trudnych, decydujących rozmowach w pracy lub w rodzinie?</li>
        <li>Jak w praktyce możesz dziś wesprzeć swojego „Aarona” lub „Mojżesza” — osobę, z którą służysz lub pracujesz w jednym zespole?</li>
        <li>Czy w Twoim życiu osobistym i rodzinnym nie ma sfery nieposłuszeństwa jakiemuś wyraźnemu nakazowi Bożego Słowa?</li>
        <li>W jaki sposób świadomość, że jesteś dzieckiem Boga i częścią Jego „pierworodnego ludu”, zmienia Twoje poczucie godności i odwagi w świecie?</li>
        <li>Dlaczego uciekasz przed „wężami” swoich problemów, zamiast w autorytecie Słowa Bożego chwycić je wiarą i oddać Panu?</li>
        <li>Kiedy ostatnio uklęknąłeś przed Bogiem nie po to, by prosić o pomoc, lecz by oddać Mu pokłon za to, że wejrzał na Twój los i nawiedził Twoje serce?</li>
      </ol>
    </section>`;

html = html.replace(
  /<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-heart"><\/i>\s*<span>Pomyśl<\/span>[\s\S]*?<\/section>/,
  card8Questions
);

// 13. Quiz Section Title
html = html.replace(
  /<span>Sprawdź swoją wiedzę — 20 Pytań z Wj 3<\/span>/,
  '<span>Sprawdź swoją wiedzę — 20 Pytań z Wj 4</span>'
);

// Quiz Data in script
html = html.replace(
  /const QUIZ_DATA = \[[\s\S]*?\];/,
  `const QUIZ_DATA = ${JSON.stringify(quizData, null, 2)};`
);

// Replace any Day 34 references in localStorage
html = html.replaceAll('kc_day34', 'kc_day35');
html = html.replaceAll('Dzień 34', 'Dzień 35');
html = html.replaceAll('dzien-34', 'dzien-35');

// Fix Day 35 navigation and back link in html after global replace
html = html.replace(
  /\/kurscodzienny\/dzien-35" class="px-3 py-1\.5 rounded-lg bg-white\/5 hover:bg-white\/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1\.5 min-h-\[44px\]">\n          <i class="fa-solid fa-chevron-left text-\[10px\]"><\/i>\n          <span>← Dzień 35<\/span>/,
  '/kurscodzienny/dzien-34" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">\n          <i class="fa-solid fa-chevron-left text-[10px]"></i>\n          <span>← Dzień 34</span>'
);

// 14. TWOJA DECYZJA
const cardDecision = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-flag-checkered"></i>
        <span>Twoja decyzja</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-3">Twoja decyzja wiary</h3>
      <p class="text-sm sm:text-base text-zinc-300 leading-relaxed mb-4">
        Czwarty rozdział Księgi Wyjścia stawia nas w prawdzie przed naszymi własnymi oporami i lękami. Jakże często zachowujemy się jak Mojżesz: patrzymy na własne braki, wymawiamy się nieśmiałością, brakiem talentów lub skomplikowaną przeszłością i mówimy w sercu: „Panie, poślij kogoś innego!”. Zapominamy, że Ten, który nas powołuje, jest Stwórcą naszych ust, serc i umysłów. On nie potrzebuje ludzkich potęg; On zamienia zwykłą pasterską laskę w narzędzie wyzwolenia, a naszą słabość napełnia mocą Ducha Świętego.
      </p>
      <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm font-serif italic">
        <strong>MOJA DECYZJA:</strong> Panie Boże Wszechmogący, porzucam dziś wszelkie wymówki, lęk przed ludźmi i poczucie własnej nieudolności. Wyznaję, że Ty jesteś moim Stwórcą i Zbawicielem. Oddaję w Twoje ręce moje życie, moje talenty, moją pracę i moją rodzinę. Oczyszczony krwią Jezusa Chrystusa mówię: „Oto jestem, poślij mnie!”. Wybieram wierność Twojemu Słowu i posłuszeństwo Twojej woli każdego dnia.
      </div>
    </section>`;

html = html.replace(
  /<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-flag-checkered"><\/i>\s*<span>Twoja decyzja<\/span>[\s\S]*?<\/section>/,
  cardDecision
);

// If there was any duplicate Twoja decyzja card, remove it
html = html.replace(
  /<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-gavel"><\/i>\s*<span>Twoja decyzja<\/span>[\s\S]*?<\/section>/,
  ''
);

// 15. MODLITWA
const cardPrayer = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-hands-praying"></i>
        <span>Modlitwa</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-3">Modlitwa na 4 listopada</h3>
      <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm sm:text-base text-zinc-300 font-serif leading-relaxed italic space-y-2">
        <p>Wszechmogący i Święty Boże, Ojcze Abrahama, Izaaka i Jakuba, Boże Przymierza i Zbawicielu uciśnionych!</p>
        <p>Staję przed Tobą w tę środę z sercem pełnym czci i wdzięczności. Dziękuję Ci za świadectwo czwartego rozdziału Księgi Wyjścia, który odsłania Twoją niewyczerpaną cierpliwość wobec ludzkiej słabości i Twoją suwerenną moc panującą nad wszelkim stworzeniem.</p>
        <p>Wybacz mi, Panie, każdą chwilę niewiary, gdy wymawiałem się własną nieudolnością, ociągałem się z posłuszeństwem Twojemu wezwaniu i uciekałem przed odpowiedzialnością za powierzone mi zadania. Przebacz mi chwile, gdy bardziej bałem się opinii ludzi i potęgi świata niż Twojego świętego Imienia. Oczyść moje usta, uświęć moje myśli i usuń z mego serca wszelki lęk.</p>
        <p>Dziękuję Ci za Pana Jezusa Chrystusa — Proroka większego niż Mojżesz, który bez wahania i bez wymówek przyszedł na ten świat, by stać się naszym Oblubieńcem i odkupić nas własną krwią na krzyżu. Dziękuję Ci, że w Jego imieniu mamy zwycięstwo nad pradawnym wężem i uleczenie ze śmiertelnego trądu grzechu.</p>
        <p>Napełnij mnie Twoim Duchem Świętym. Daj mi odwagę zwiastowania Twojej prawdy, dar braterskiej jedności i serce gotowe do oddania Ci czci w każdym doświadczeniu. Spraw, bym widząc Twoje nawiedzenie i opiekę nad moim życiem, zawsze skłaniał głowę w dziękczynnym uwielbieniu. Przez Jezusa Chrystusa, naszego Pana i Zbawiciela. Amen.</p>
      </div>
    </section>`;

html = html.replace(
  /<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-hands-praying"><\/i>\s*<span>Modlitwa<\/span>[\s\S]*?<\/section>/,
  cardPrayer
);

// 16. ZASTOSOWANIE I TWÓJ ZAPIS
html = html.replace(
  /Księgi Wyjścia 3:1–22<\/a>/,
  'Księgi Wyjścia 4:1–31</a>'
);

html = html.replaceAll('href="/mojabiblia?book=EXO&chapter=2"', 'href="/mojabiblia?book=EXO&chapter=4"');
html = html.replaceAll('href="/mojabiblia?book=EXO&chapter=3"', 'href="/mojabiblia?book=EXO&chapter=4"');
html = html.replaceAll('href="/mojabiblia?book=EXO&amp;chapter=3"', 'href="/mojabiblia?book=EXO&amp;chapter=4"');

html = html.replace(
  /1\. „Po przeczytaniu Wj 3 dowiedziałem się o Bogu, że…”/,
  '1. „Po przeczytaniu Wj 4 dowiedziałem się o Bogu, że…”'
);

// Share links & encoded day references cleanup
html = html.replaceAll('Dzie%C5%84%2034', 'Dzie%C5%84%2035');
html = html.replace(
  /P%C5%82on%C4%85cy%20krzak%20%E2%80%94%20%C5%9Awi%C4%99te%20Imi%C4%99%20Boga%20i%20Bo%C5%BCe%20zst%C4%85pienie%20na%20ratunek/g,
  encodeURIComponent('Znaki wiary, powołanie i przymierze krwi')
);
html = html.replace(
  /Płonący krzak — Święte Imię Boga i Boże zstąpienie na ratunek/g,
  'Znaki wiary, powołanie i przymierze krwi'
);

// 17. JUTRO (Zapowiedź Dnia 36)
const tomorrowSection = `<!-- ── ZAPOWIEDŹ: JUTRO (wzór Dnia 1) ── -->
    <section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
      <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
        JUTRO — 5 LISTOPADA
      </div>
      <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
        DZIEŃ 36 — Konfrontacja z faraonem, ciężary niewoli i próba wiary (Wj 5:1–23)
      </h3>
      <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
        Jutro czytamy piąty rozdział Księgi Wyjścia: Mojżesz i Aaron stają po raz pierwszy przed władcą potężnego imperium z Bożym żądaniem: „Wypuść mój lud!”. Faraon odpowiada buntem, odrzuca Boga i nakazuje podwojenie ciężarów niewoli. Zamiast natychmiastowego triumfu przychodzi bolesne rozczarowanie i próba wiary. Wróć jutro, aby kontynuować podróż!
      </p>
      <div class="flex items-center gap-3 flex-wrap">
        <a href="/akademia/kurscodzienny" class="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-300 hover:text-white text-xs font-bold transition min-h-[44px] flex items-center">
          ← Wróć do spisu kursu
        </a>
      </div>
    </section>`;

html = html.replace(
  /<!-- ── ZAPOWIEDŹ: JUTRO \(wzór Dnia 1\) ── -->[\s\S]*?<\/section>/,
  tomorrowSection
);

// 18. Zapisujemy 4 ścieżki w repozytorium
const paths = [
  path.join(REPO, 'akademia/kurscodzienny/dzien-35.html'),
  path.join(REPO, 'akademia/kurscodzienny/dzien-35/index.html'),
  path.join(REPO, 'kursy/kurscodzienny/dzien-35.html'),
  path.join(REPO, 'kursy/kurscodzienny/dzien-35/index.html'),
  path.join(MIRROR, 'akademia/kurscodzienny/dzien-35.html'),
  path.join(MIRROR, 'akademia/kurscodzienny/dzien-35/index.html'),
  path.join(MIRROR, 'kursy/kurscodzienny/dzien-35.html'),
  path.join(MIRROR, 'kursy/kurscodzienny/dzien-35/index.html'),
];

for (const p of paths) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, html, 'utf8');
  console.log(`✅ Zapisano: ${p}`);
}

console.log('🎉 Sukces! Wygenerowano Dzień 35 we wszystkich 4 ścieżkach Clean URLs oraz w mirrorze LUMINA!');
