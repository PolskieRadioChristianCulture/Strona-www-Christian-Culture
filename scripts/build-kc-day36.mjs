import fs from 'node:fs';
import path from 'node:path';

const REPO = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const MIRROR = 'C:/Users/czark/Desktop/@ICC/LUMINA';

// Read base template (dzien-35.html)
let html = fs.readFileSync(path.join(REPO, 'akademia/kurscodzienny/dzien-35.html'), 'utf8');

// Read UBG Bible text for Exodus 5
const bibleData = JSON.parse(fs.readFileSync(path.join(REPO, 'data/bible/EXO_05.json'), 'utf8'));
const versesHtml = bibleData.verses.map(v => {
  return `<p><span class="verse-num">${v.verse}</span> ${v.text.UBG}</p>`;
}).join('\n        ');

// 20 pytań quizu dla Dnia 36 (Wj 5:1–23)
const quizData = [
  {
    q: "Z jakimi słowami Mojżesz i Aaron zwrócili się do faraona podczas pierwszej audiencji (Wj 5:1)?",
    a: [
      "„Prosimy o zmniejszenie podatków dla narodu izraelskiego”",
      "„Tak mówi PAN, Bóg Izraela: Wypuść mój lud, aby mi obchodził święto na pustyni”",
      "„Oddaj nam ziemię Goszen na własność”"
    ],
    c: 1
  },
  {
    q: "Jak brzmiała zuchwała odpowiedź faraona na wezwanie Mojżesza i Aarona w Wj 5:2?",
    a: [
      "„Muszę naradzić się z kapłanami Egiptu”",
      "„Któż to jest PAN, żebym miał słuchać jego głosu i wypuścić Izraela? Nie znam PANA i Izraela nie wypuszczę”",
      "„Wypuszczę tylko starców i dzieci”"
    ],
    c: 1
  },
  {
    q: "O jak długą drogę na pustynię prosili Mojżesz i Aaron w Wj 5:3, aby złożyć ofiarę PANU?",
    a: [
      "O drogę siedmiu dni",
      "O drogę trzech dni",
      "O drogę czterdziestu dni"
    ],
    c: 1
  },
  {
    q: "Przed jakimi karami Bożymi ostrzegali Mojżesz i Aaron w Wj 5:3, gdyby lud nie złożył ofiary?",
    a: [
      "Przed potopem lub trzęsieniem ziemi",
      "Przed zarazą lub mieczem",
      "Przed zaćmieniem słońca"
    ],
    c: 1
  },
  {
    q: "O co król Egiptu oskarżył Mojżesza i Aarona w Wj 5:4?",
    a: [
      "O kradzież skarbów królewskich",
      "O to, że odciągają lud od jego robót („Idźcie do swoich ciężarów!”)",
      "O spisek z wrogami z Kanaanu"
    ],
    c: 1
  },
  {
    q: "Komu faraon wydał rozkaz zaostrzenia warunków pracy jeszcze tego samego dnia (Wj 5:6)?",
    a: [
      "Dowódcom wojsk rydwanowych",
      "Nadzorcom ludu i jego urzędnikom",
      "Kapłanom świątyni słońca"
    ],
    c: 1
  },
  {
    q: "Jakiego surowca niezbędnego do wyrobu cegieł zakazał dostarczać faraon w Wj 5:7?",
    a: [
      "Gliny z brzegów Nilu",
      "Słomy",
      "Drewna opałowego"
    ],
    c: 1
  },
  {
    q: "Co zmieniło się w dziennej normie (liczbie) cegieł po odebraniu słomy (Wj 5:8)?",
    a: [
      "Norma została zmniejszona o połowę",
      "Wyznaczono im taką samą liczbę cegieł, jaką robili przedtem, nic z niej nie ujmując",
      "Norma została zawieszona na tydzień"
    ],
    c: 1
  },
  {
    q: "Jak faraon nazwał pragnienie Izraelitów, by pójść i złożyć ofiarę Bogu (Wj 5:8)?",
    a: [
      "Pobożną tradycją przodków",
      "Próżniactwem („Są bowiem próżniakami i dlatego wołają: Pójdziemy i złożymy ofiarę naszemu Bogu”)",
      "Zagrożeniem militarnym"
    ],
    c: 1
  },
  {
    q: "Jak według słów faraona w Wj 5:9 należało potraktować słowa Bożych posłańców?",
    a: [
      "Jako proroctwo godne zbadania",
      "Jako „kłamliwe słowa”, na które robotnicy nie mają się oglądać, obarczeni ciężką pracą",
      "Jako propozycję traktatu pokojowego"
    ],
    c: 1
  },
  {
    q: "Co robili Izraelici po ogłoszeniu nowego dekretu faraona (Wj 5:12)?",
    a: [
      "Zamknęli się w swoich namiotach",
      "Rozproszyli się po całej ziemi egipskiej, aby zbierać ściernisko zamiast słomy",
      "Zaczęli kupować słomę od kupców"
    ],
    c: 1
  },
  {
    q: "Kto został pobity przez nadzorców faraona, gdy lud nie zdołał wyrobić dawnej normy cegieł (Wj 5:14)?",
    a: [
      "Mojżesz i Aaron",
      "Urzędnicy spośród synów Izraela, których nadzorcy faraona ustanowili nad ludem",
      "Kupcy egipscy"
    ],
    c: 1
  },
  {
    q: "Do kogo udali się ze skargą pobici urzędnicy synów Izraela (Wj 5:15)?",
    a: [
      "Bezpośrednio do faraona",
      "Do teścia Mojżesza w Madianie",
      "Do arcykapłana w Memfis"
    ],
    c: 0
  },
  {
    q: "Jak urzędnicy izraelscy podsumowali niesprawiedliwość nowego systemu pracy przed faraonem (Wj 5:16)?",
    a: [
      "„Nie dają nam chleba ani wody”",
      "„Słomy nie dają twoim sługom, a mówią nam: Róbcie cegły. I oto twoi słudzy są bici, a wina jest w twoim ludzie”",
      "„Nasze narzędzia uległy zniszczeniu”"
    ],
    c: 1
  },
  {
    q: "Jak faraon odpowiedział na skargę izraelskich urzędników w Wj 5:17–18?",
    a: [
      "Obiecał ukarać nadzorców",
      "Powtórzył: „Próżniakami jesteście, próżniakami... Idźcie więc teraz, pracujcie! Słoma nie będzie wam dawana, a wyznaczoną liczbę cegieł oddacie”",
      "Zgodził się na trzydniowy odpoczynek"
    ],
    c: 1
  },
  {
    q: "Kogo spotkali urzędnicy synów Izraela, gdy w trudnym położeniu wychodzili od faraona (Wj 5:20)?",
    a: [
      "Żołnierzy królewskich",
      "Mojżesza i Aarona, którzy czekali na nich",
      "Starszych z ziemi Goszen"
    ],
    c: 1
  },
  {
    q: "Jakimi słowami urzędnicy izraelscy zwrócili się do Mojżesza i Aarona w Wj 5:21?",
    a: [
      "„Błogosławiony niech będzie PAN za waszą odwagę”",
      "„Niech PAN wejrzy na was i osądzi za to, że uczyniliście naszą woń obrzydliwą w oczach faraona... dając im miecz w ręce, aby nas zabili”",
      "„Prosimy, idźcie ponownie do pałacu”"
    ],
    c: 1
  },
  {
    q: "Co uczynił Mojżesz po wysłuchaniu gorzkich oskarżeń ze strony własnych braci (Wj 5:22)?",
    a: [
      "Uciekł z powrotem na pustynię Madian",
      "Wrócił do PANA i wylał przed Nim swój ból w modlitwie",
      "Wdał się w gwałtowną kłótnię z urzędnikami"
    ],
    c: 1
  },
  {
    q: "Jakie dwa pytania zadał Mojżesz Bogu w modlitwie w Wj 5:22?",
    a: [
      "„Kiedy ześlesz ogień z nieba?” i „Gdzie jest Twoja armia?”",
      "„Panie, czemu sprowadziłeś zło na ten lud? Po co mnie posłałeś?”",
      "„Dlaczego Aaron mówił za cicho?” i „Czemu lud mi nie wierzy?”"
    ],
    c: 1
  },
  {
    q: "Jak Mojżesz podsumował dotychczasowy rezultat swojej misji w końcowym wersecie rozdziału (Wj 5:23)?",
    a: [
      "„Faraon zaczął się wahać”",
      "„Od czasu bowiem, gdy przyszedłem do faraona, aby mówić w twoim imieniu, gorzej się obchodzi z tym ludem, a ty wcale nie wybawiłeś swego ludu”",
      "„Lud jest gotowy do wymarszu”"
    ],
    c: 1
  }
];

// 1. Meta / Head
html = html.replace(
  /<title>Dzień 35:[^<]+<\/title>/,
  '<title>Dzień 36: PIERWSZA KONFRONTACJA Z FARAONEM: CIĘŻARY NIEWOLI I PRÓBA WIARY (Wj 5:1–23) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>'
);

html = html.replace(
  /<meta name="description" content="[^"]+" \/>/,
  '<meta name="description" content="Księga Wyjścia — Miesiąc 2, Dzień 36 (5 Listopada 2026). Pierwsza konfrontacja Mojżesza i Aarona z faraonem, cegły bez słomy, ból ucisku i modlitwa w ciemności próby — Wj 5:1–23. Kurs codzienny Pisma Świętego." />'
);

html = html.replace(
  /<link rel="canonical" href="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-35" \/>/,
  '<link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-36" />'
);

html = html.replace(
  /<meta property="og:url" content="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-35" \/>/,
  '<meta property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-36" />'
);

html = html.replace(
  /<meta property="og:title" content="[^"]+" \/>/,
  '<meta property="og:title" content="Dzień 36: PIERWSZA KONFRONTACJA Z FARAONEM: CIĘŻARY NIEWOLI I PRÓBA WIARY — Z Biblią za Pan Brat" />'
);

html = html.replace(
  /<meta property="og:description" content="[^"]+" \/>/,
  '<meta property="og:description" content="Księga Wyjścia — Miesiąc 2, Dzień 36. Pierwsza konfrontacja z faraonem, cegły bez słomy i próba wiary — Wj 5:1–23." />'
);

html = html.replace(
  /<meta property="og:image" content="[^"]+" \/>/,
  '<meta property="og:image" content="https://polskieradio.cc/images/academy/daily/kc_day_36_mojzesz_faraon_cegly.jpg?v=20261105" />'
);

// 2. Navigation Header & Breadcrumb
html = html.replace(
  /<a href="\/akademia\/kurscodzienny\/dzien-34"[^>]*>[\s\S]*?← Dzień 34[\s\S]*?<\/a>/,
  '<a href="/akademia/kurscodzienny/dzien-35" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">\n          <i class="fa-solid fa-chevron-left text-[10px]"></i>\n          <span>← Dzień 35</span>\n        </a>'
);

html = html.replace(
  /<span class="px-3 py-1\.5 rounded-lg bg-white\/5 text-xs text-zinc-500 flex items-center gap-1\.5 opacity-50 cursor-not-allowed min-h-\[44px\]">[\s\S]*?<span>Dzień 36 \(Jutro\) →<\/span>[\s\S]*?<\/span>/,
  '<span class="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-zinc-500 flex items-center gap-1.5 opacity-50 cursor-not-allowed min-h-[44px]">\n          <span>Dzień 37 (Jutro) →</span>\n          <i class="fa-solid fa-chevron-right text-[10px]"></i>\n        </span>'
);

html = html.replace(
  /<span class="text-amber-400 font-semibold">Dzień 35<\/span>/,
  '<span class="text-amber-400 font-semibold">Dzień 36</span>'
);

// 3. Hero Section
html = html.replace(
  /Księga Wyjścia • Miesiąc 2 • Dzień 35 z 2009/,
  'Księga Wyjścia • Miesiąc 2 • Dzień 36 z 2009'
);

html = html.replace(
  /4 LISTOPADA 2026 • ŚRODA/,
  '5 LISTOPADA 2026 • CZWARTEK'
);

html = html.replace(
  /<h1[^>]*>[\s\S]*?ZNAKI WIARY, POWOŁANIE I POWRÓT DO EGIPTU — BOŻA MOC W LUDZKIEJ SŁABOŚCI[\s\S]*?<\/h1>/,
  '<h1 class="text-2xl sm:text-4xl md:text-5xl font-black text-white font-display tracking-tight leading-tight">\n            PIERWSZA KONFRONTACJA Z FARAONEM: CIĘŻARY NIEWOLI I PRÓBA WIARY\n          </h1>'
);

html = html.replace(
  /<p class="text-base sm:text-lg text-amber-300\/90 font-serif italic">[\s\S]*?<\/p>/,
  '<p class="text-base sm:text-lg text-amber-300/90 font-serif italic">\n        Żądanie „Wypuść mój lud!”, pycha tyrana, cegły bez słomy i szczera modlitwa w ciemności próby (Wj 5:1–23)\n      </p>'
);

html = html.replace(
  /src="\/images\/academy\/daily\/kc_day_35_powolanie_znaki_aaron\.jpg\?v=20261104"/,
  'src="/images/academy/daily/kc_day_36_mojzesz_faraon_cegly.jpg?v=20261105"'
);

html = html.replace(
  /alt="Dzień 35:[^"]+"/,
  'alt="Dzień 36: PIERWSZA KONFRONTACJA Z FARAONEM: CIĘŻARY NIEWOLI I PRÓBA WIARY (Wj 5:1–23)"'
);

html = html.replace(
  /<span>Ilustracja biblijna: Pasterz Mojżesz i Aaron u stóp góry Horeb<\/span>/,
  '<span>Ilustracja biblijna: Mojżesz i Aaron przed tronem faraona (Wj 5:1)</span>'
);

html = html.replace(
  /<span class="font-mono text-brand-gold">Czytanie: Wj 4:1–31<\/span>/g,
  '<span class="font-mono text-brand-gold">Czytanie: Wj 5:1–23</span>'
);

// Memory Verse
const memText = 'Potem Mojżesz i Aaron przyszli i powiedzieli do faraona: Tak mówi PAN, Bóg Izraela: Wypuść mój lud, aby mi obchodził święto na pustyni.';
const memRef = 'Księga Wyjścia 5:1 (UBG)';
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
  `<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>\n        Piąty rozdział Księgi Wyjścia odsłania duchową anatomię buntu przeciwko Bogu oraz tajemnicę próby wiary: zanim Boża obietnica wyzwolenia stanie się widzialnym triumfem, imperium ciemności często zaciska pętlę ucisku, aby obnażyć ludzką bezsilność i nauczyć wierzących ucieczki w ramiona Wszechmogącego.\n      </div>`
);

// 4. Card 1: Podróż przez 66 Ksiąg
html = html.replace(
  /Dziś jest <strong class="text-white">Dzień 35<\/strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 4:1–31<\/strong>\./,
  'Dziś jest <strong class="text-white">Dzień 36</strong>: Księga Wyjścia, <strong class="text-brand-gold">Wj 5:1–23</strong>.'
);

html = html.replace(
  /href="\/mojabiblia\?book=EXO&amp;chapter=4"/g,
  'href="/mojabiblia?book=EXO&amp;chapter=5"'
);

html = html.replace(
  /<span>Czytaj Wj 4:1–31<\/span>/,
  '<span>Czytaj Wj 5:1–23</span>'
);

// 5. Card 2: Scripture Text
html = html.replace(
  /<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 4:1–31<\/p>/,
  '<p class="text-xs text-zinc-400">Uwspółcześniona Biblia Gdańska (UBG) • Wj 5:1–23</p>'
);

html = html.replace(
  /<!-- SCRIPTURE SECTION \(Wj 4:1–31\) -->/,
  '<!-- SCRIPTURE SECTION (Wj 5:1–23) -->'
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
          <p class="text-xs text-zinc-400">Zderzenie Królestwa Bożego z tyranią świata i ciemna noc przed świtem</p>
        </div>
      </div>
      <p>
        Piąty rozdział Księgi Wyjścia przenosi nas z cichej społeczności starszych Izraela wprost do sali tronowej najpotężniejszego władcy starożytnego świata. Pod koniec czwartego rozdziału (Wj 4:29–31) widzieliśmy radosny zryw wiary: lud Izraela usłyszał słowa PANA, zobaczył znaki i oddał Bogu pokłon. Wydawało się, że wyzwolenie nastąpi błyskawicznie i bezboleśnie. Rzeczywistość duchowej walki okazuje się jednak zupełnie inna. Gdy Mojżesz i Aaron po raz pierwszy stają przed faraonem z królewskim wezwaniem: „Tak mówi PAN, Bóg Izraela: Wypuść mój lud, aby mi obchodził święto na pustyni” (Wj 5:1), spotykają się z lodowatą arogancją i pogardą.
      </p>
      <p>
        Pytanie faraona: „Któż to jest PAN, żebym miał słuchać jego głosu?” (Wj 5:2) stanowi punkt zwrotny całej Księgi Wyjścia. Faraon, uważany w Egipcie za wcielonego boga Horusa i syna boga słońca Re, rzuca bezpośrednie wyzwanie Stwórcy nieba i ziemi. Zamiast ustąpić, tyran stosuje klasyczną strategię zniewolenia: oskarża pragnienie modlitwy i uwielbienia Boga o „próżniactwo” (lenistwo) i nakazuje podwojenie ucisku. Robotnicy zostają pozbawieni słomy niezbędnej do wyrobu cegieł z mułu nilowego, ale dzienna norma produkcyjna pozostaje niezmieniona.
      </p>
      <p>
        Skutkiem tego okrutnego dekretu jest załamanie psychiczne i duchowe Izraelitów. Pobici urzędnicy izraelscy zwracają się przeciwko Mojżeszowi i Aaronowi, oskarżając ich o sprowadzenie śmiertelnego niebezpieczeństwa (Wj 5:21). Rozdział kończy się przejmującą, bolesną modlitwą Mojżesza, który wraca do Boga z pytaniem: „Panie, czemu sprowadziłeś zło na ten lud? Po co mnie posłałeś?” (Wj 5:22). Wj 5 uczy nas fundamentalnej prawdy życia duchowego: Boże obietnice często przechodzą przez dolinę pozornej klęski, zanim objawi się pełnia Bożej chwały.
      </p>
    </section>`;

html = html.replace(
  /<section class="kc-card space-y-4 font-serif text-sm sm:text-base text-zinc-300 leading-relaxed">[\s\S]*?<\/section>/,
  card3Intro
);

// 7. Hebrew Strong chips (Wj 5)
const strongChipsCard = `<!-- HEBREW STRONG CODES & EXEGESIS CHIPS -->
    <section class="kc-card">
      <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">
        <i class="fa-solid fa-spell-check text-amber-400"></i>
        <span>Klucze Językowe & Kody Stronga (Wj 5)</span>
      </div>
      <p class="text-xs text-zinc-300 mb-4 leading-relaxed font-serif">
        Poniższe terminy hebrajskie stanowią osnowę teologiczną 5. rozdziału Księgi Wyjścia:
      </p>
      <div class="flex flex-wrap gap-2">
        <span class="strong-chip"><span class="strong-id">H7971</span> <span class="strong-orig">שָׁלַח (szalach)</span> — wypuścić / posłać: „Wypuść mój lud!” (Wj 5:1)</span>
        <span class="strong-chip"><span class="strong-id">H2287</span> <span class="strong-orig">חָגַג (chagag)</span> — obchodzić święto dla PANA na pustyni (Wj 5:1)</span>
        <span class="strong-chip"><span class="strong-id">H3045</span> <span class="strong-orig">יָדַע (jada)</span> — znać / uznać autorytet: „Nie znam PANA” (Wj 5:2)</span>
        <span class="strong-chip"><span class="strong-id">H8401</span> <span class="strong-orig">תֶּבֶן (tewen)</span> — słoma — spoiwo cegieł odebrane niewolnikom (Wj 5:7)</span>
        <span class="strong-chip"><span class="strong-id">H7503</span> <span class="strong-orig">רָפָה (raphah)</span> — próżniacy / ospali — oszczerstwo tyrana wobec kultu (Wj 5:8, 17)</span>
        <span class="strong-chip"><span class="strong-id">H5337</span> <span class="strong-orig">נָצַל (nacal)</span> — wybawić / wyrwać z niewoli (Wj 5:23)</span>
      </div>
    </section>`;

html = html.replace(
  /<!-- HEBREW STRONG CODES & EXEGESIS CHIPS -->[\s\S]*?<\/section>/,
  strongChipsCard
);

// 8. Exegesis sections (Punkty 1–32)
const exegesisContent = `<!-- THEOLOGICAL EXEGESIS (4 CZĘŚCI) -->
    <section class="kc-card space-y-6">
      <div class="flex items-center gap-2 border-b border-brand-line pb-4">
        <span class="w-8 h-8 rounded-lg bg-brand-gold/15 flex items-center justify-center text-brand-gold">
          <i class="fa-solid fa-feather-pointed"></i>
        </span>
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-white font-display">EGZEGEZA & FORMACJA TEOLOGICZNA</h2>
          <p class="text-xs text-zinc-400">Cztery części studium Wj 5:1–23 (32 punkty analityczne)</p>
        </div>
      </div>

      <div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">
        <!-- CZĘŚĆ I -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
            KRÓLEWSKIE WEZWANIE BOGA I ZUCHWAŁY BUNT FARAONA (WJ 5:1–5)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>1. Wejście proroków do pałacu (5:1a):</strong> Mojżesz (80 lat) i Aaron (83 lata) stają przed obliczem faraona bez armii, lecz z autorytetem Króla królów. Prorocka formuła „Tak mówi PAN” (koh amar JHWH) brzmi po raz pierwszy w Biblii jako dekret wyższego Władcy.</p>
            <p><strong>2. Tytuł przymierza: „PAN, Bóg Izraela” (5:1b):</strong> Faraon słyszy, że wzgardzeni niewolnicy hebrajscy należą do Boga, który związuje z nimi swoje Imię i nazywa ich „moim ludem” (ammi).</p>
            <p><strong>3. Cel wyzwolenia: święto na pustyni (5:1c):</strong> Żądanie „Wypuść mój lud, aby mi obchodził święto” (hebr. chagag) pokazuje, że wolność w Biblii nie jest samowolą, lecz przejściem z niewoli faraona do radosnego uwielbienia prawdziwego Boga.</p>
            <p><strong>4. Duchowa ślepota i pycha tyrana: „Któż to jest PAN?” (5:2a):</strong> Pytanie faraona nie jest prośbą o informację, lecz wyrazem pogardy. Dla władcy Egiptu bóstwo pozbawione świątyń z granitu i rydwanów jest nikim.</p>
            <p><strong>5. Deklaracja buntu: „Nie znam PANA i Izraela nie wypuszczę” (5:2b):</strong> Słowa „Nie znam PANA” (lo jada'ti et-JHWH) staną się osią całej Księgi Wyjścia — wszystkie dziesięć plag będzie Bożą odpowiedzią, aby Egipt poznał, że JHWH jest Panem (por. Wj 7:5; 14:4).</p>
            <p><strong>6. Wyjaśnienie poselstwa: „Bóg Hebrajczyków spotkał się z nami” (5:3a):</strong> Bracia dostosowują język do pojęć faraona, świadcząc o realnej teofanii na Horebie i prosząc o trzydniową drogę na pustynię w celu złożenia krwawej ofiary.</p>
            <p><strong>7. Święta bojaźń Boża: „aby nie dotknął nas zarazą lub mieczem” (5:3b):</strong> Mojżesz i Aaron przypominają, że zaniedbanie czci należnej Świętemu Bogu niesie poważniejsze konsekwencje niż gniew ziemskiego króla.</p>
            <p><strong>8. Oskarżenie o sabotaż: „Idźcie do swoich ciężarów!” (5:4–5):</strong> Faraon redukuje człowieka wyłącznie do siły roboczej. Liczebny wzrost Izraela budzi w nim strach polityczny, dlatego każde wezwanie do duchowej wolności traktuje jako zagrożenie dla gospodarki imperium.</p>
          </div>
        </div>

        <!-- CZĘŚĆ II -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
            CEGŁY BEZ SŁOMY — ANATOMIA SYSTEMOWEGO UCISKU (WJ 5:6–14)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>9. Natychmiastowy odwet: „Tego samego dnia” (5:6):</strong> Zło reaguje błyskawicznie na Boże Słowo. Faraon uruchamia aparat przymusu: egipskich nadzorców (nogesim) i podległych im izraelskich urzędników-brygadzistów (szoterim).</p>
            <p><strong>10. Technologia wyrobu cegieł i rola słomy (5:7):</strong> W starożytnym Egipcie cegły z mułu nilowego suszone na słońcu wymagały posiekanej słomy (hebr. tewen), która wiązała glinę i zapobiegała jej pękaniu. Odebranie słomy przy zachowaniu normy było wyrokiem fizycznego wyniszczenia.</p>
            <p><strong>11. Niezmienna norma: „nic z niej nie ujmujcie” (5:8a):</strong> System zniewolenia żąda od człowieka tego samego wyniku przy odebraniu zasobów — to klasyczny obraz duchowej niewoli grzechu i legalizmu, który wymaga doskonałości, nie dając siły do jej spełnienia.</p>
            <p><strong>12. Ideologiczne kłamstwo tyrana: „Są bowiem próżniakami” (5:8b):</strong> Faraon nazywa pragnienie modlitwy i składania ofiar Bogu „próżniactwem” (hebr. nirpim — ospałością, lenistwem). Świat wrogi Bogu zawsze przedstawia czas poświęcony na modlitwę, Słowo Boże i święty odpoczynek jako stratę czasu.</p>
            <p><strong>13. Strategia zagłuszania Słowa Bożego (5:9):</strong> „Niech ciężka praca obarczy tych ludzi, aby się nią zajęli i nie oglądali się na kłamliwe słowa”. Szatan używa nadmiaru pracy, pośpiechu i wyczerpania, by człowiek nie miał sił ani czasu słuchać Bożych obietnic — które tyran bezczelnie nazywa „kłamliwymi słowami” (diwrej szakher).</p>
            <p><strong>14. Bezwzględne wykonanie rozkazu przez aparat władzy (5:10–11):</strong> Nadzorcy wychodzą do ludu i ogłaszają dekret bez litości, każąc im samemu szukać słomy tam, gdzie zdołają ją znaleźć.</p>
            <p><strong>15. Rozproszenie ludu i zbieranie ścierniska (5:12):</strong> Zamiast wspólnego marszu ku wolności, Izraelici rozpraszają się po całym Egipcie, by wyrywać suche ściernisko (hebr. kasz) z pól. Cierpienie zdaje się oddalać spełnienie obietnicy.</p>
            <p><strong>16. Przemoc wobec izraelskich urzędników (5:13–14):</strong> Nadzorcy przynaglają lud codziennym krzykiem, a gdy norma jest niewykonalna, biją izraelskich urzędników. System totalitarny uderza najpierw w pośredników, próbując złamać solidarność narodu.</p>
          </div>
        </div>

        <!-- CZĘŚĆ III -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
            ZŁUDNA APELACJA DO TYRANA I KRYZYS ZAUFANIA WŚRÓD LUDU (WJ 5:15–21)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>17. Skarga urzędników u tronu faraona (5:15):</strong> Pobici urzędnicy izraelscy idą bezpośrednio do faraona, sądząc naiwnie, że władca nie wie o nadużyciach swoich nadzorców. Szukają ratunku u tego samego tyrana, który jest źródłem ich niedoli.</p>
            <p><strong>18. Paradoks winy: „wina jest w twoim ludzie” (5:16):</strong> Urzędnicy wykazują absurd sytuacji: „Słomy nie dają twoim sługom, a mówią nam: Róbcie cegły. I oto twoi słudzy są bici, a wina jest w twoim ludzie”. Pokornie nazywają siebie „sługami faraona”, zapominając, że są pierworodnym synem Boga.</p>
            <p><strong>19. Zdemaskowanie oblicza faraona (5:17–18):</strong> Faraon zdziera maskę i powtarza oskarżenie: „Próżniakami jesteście, próżniakami! Dlatego mówicie: Pójdziemy, złożymy ofiarę PANU”. Potwierdza, że okrucieństwo pochodzi bezpośrednio z jego rozkazu.</p>
            <p><strong>20. Poczucie całkowitej beznadziei (5:19):</strong> Urzędnicy widzą, że „są w trudnym położeniu” (hebr. be-ra — w złym stanie, w nieszczęściu). Wszelkie ludzkie negocjacje z imperium zła zakończyły się fiaskiem.</p>
            <p><strong>21. Spotkanie z czekającymi prorokami (5:20):</strong> Mojżesz i Aaron nie uciekli — stoją przed bramą pałacu, czekając na swoich braci. Prawdziwy pasterz nie opuszcza owiec w godzinie próby.</p>
            <p><strong>22. Gorzki wybuch oskarżeń przeciwko Bożym sługom (5:21a):</strong> Zrozpaczeni urzędnicy wzywają sąd Boży na Mojżesza i Aarona: „Niech PAN wejrzy na was i osądzi”. Ci sami ludzie, którzy w Wj 4:31 kłaniali się Bogu, pod ciężarem cierpienia zwracają się przeciwko zwiastunom prawdy.</p>
            <p><strong>23. Metafora „obrzydliwej woni” i „miecza w ręku wroga” (5:21b):</strong> Urzędnicy twierdzą, że interwencja proroków zniszczyła ich kruchą stabilizację w niewoli i dała faraonowi pretekst do mordu. Strach przed cierpieniem często każe ludziom woleć bezpieczną niewolę niż bolesną drogę ku wolności.</p>
            <p><strong>24. Bolesna samotność przywódcy (5:20–21):</strong> Mojżesz doświadcza odrzucenia zarówno przez wroga (faraona), jak i przez własnych braci — to nieodłączny koszt wiernej służby Bogu.</p>
          </div>
        </div>

        <!-- CZĘŚĆ IV -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
            POWRÓT MOJŻESZA DO PANA — SZCZERA MODLITWA W CIEMNOŚCI PRÓBY (WJ 5:22–23)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>25. Kluczowy zwrot duchowy: „Mojżesz wrócił do PANA” (5:22a):</strong> Zamiast odpowiadać gniewem na gniew urzędników lub porzucać misję, Mojżesz wraca do Tego, który go posłał (hebr. wa-jaszow Mosze el-JHWH). To fundament zwycięstwa w kryzysie.</p>
            <p><strong>26. Święta odwaga lamentacji: „Czemu sprowadziłeś zło na ten lud?” (5:22b):</strong> Mojżesz nie ukrywa swojego bólu za fasadą sztucznej pobożności. Podobnie jak później Jeremiasz czy Habakuk, wylewa przed Bogiem swoje niezrozumienie Jego dróg.</p>
            <p><strong>27. Pytanie o sens powołania: „Po co mnie posłałeś?” (5:22c):</strong> W obliczu pozornej porażki Mojżesz pyta o cel swojej misji. Bóg przyjmuje szczere pytanie złamanego sługi, bo rodzi się ono z miłości do cierpiącego ludu.</p>
            <p><strong>28. Zderzenie posłuszeństwa z pogorszeniem sytuacji (5:23a):</strong> „Od czasu bowiem, gdy przyszedłem do faraona, aby mówić w twoim imieniu, gorzej się obchodzi z tym ludem”. Posłuszeństwo Słowu Bożemu nie zawsze przynosi natychmiastową ulgę — często najpierw wywołuje wściekłość sił ciemności.</p>
            <p><strong>29. Bolesny zarzut opóźnienia: „a ty wcale nie wybawiłeś swego ludu” (5:23b):</strong> Mojżesz używa czasownika nacal (wyrwać, ocalić), którego Bóg użył w obietnicy przy krzewie (Wj 3:8). Oczekiwanie człowieka na natychmiastowy cud zderza się z Bożym harmonogramem zbawienia.</p>
            <p><strong>30. Boża pedagogika „punktu zerowego” (5:22–23):</strong> Bóg dopuszcza sytuację, w której zawodzą możliwości dyplomatyczne Mojżesza i nadzieje Izraelitów na łagodność faraona, aby wyzwolenie było w 100% dziełem samej ręki Bożej (por. Wj 6:1).</p>
            <p><strong>31. Różnica między szemraniem niewiary a lamentacją wiary (5:21 a 5:22):</strong> Urzędnicy mówią o Bogu w trzeciej osobie z goryczą, podczas gdy Mojżesz idzie bezpośrednio do Boga w pierwszej osobie — ból zaniesiony do tronu łaski staje się modlitwą.</p>
            <p><strong>32. Zawieszenie narracji przed Bożym przełomem (5:23):</strong> Rozdział piąty kończy się w najciemniejszym punkcie nocy, przygotowując serce czytelnika na potężne objawienie Bożej wierności w pierwszym wersecie rozdziału szóstego.</p>
          </div>
        </div>
      </div>
    </section>`;

html = html.replace(
  /<!-- THEOLOGICAL EXEGESIS \(4 CZĘŚCI\) -->[\s\S]*?<\/section>/,
  exegesisContent
);

// 9. Card 5: JEZUS W CENTRUM (Punkty 33–39)
const card5Christ = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-cross"></i>
        <span>Jezus w centrum</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Książę tego świata, słodkie jarzmo Chrystusa i triumf po pozornej klęsce — Chrystus w centrum Wj 5</h3>
      <p class="text-sm sm:text-base text-zinc-300 leading-relaxed mb-4">
        Piąty rozdział Księgi Wyjścia ukazuje duchową walkę o duszę człowieka i wskazuje na odkupieńcze dzieło Jezusa Chrystusa w siedmiu wymiarach chrystologicznych:
      </p>
      <div class="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed pl-2 border-l-2 border-brand-gold/40">
        <p><strong>33. Faraon jako typ „władcy tego świata” (Wj 5:2 a J 12:31; 2 Kor 4:4):</strong> Pycha faraona („Któż to jest PAN?... Izraela nie wypuszczę”) obrazuje szatana, który trzyma grzeszników w niewoli i zaślepia ich umysły. Dopiero Jezus Chrystus związał „mocarza” i wyrwał jego łup (Mk 3:27).</p>
        <p><strong>34. Cegły bez słomy a słodkie jarzmo Chrystusa (Wj 5:7–18 a Mt 11:28–30):</strong> Faraon nakłada na spracowanych ludzi nieznośne ciężary i nazywa ich próżniakami. Jezus Chrystus woła do wszystkich utrudzonych pod brzemieniem grzechu i legalizmu: „Przyjdźcie do mnie wszyscy, którzy jesteście spracowani i obciążeni, a ja wam dam odpoczynek... Gdyż moje jarzmo jest słodkie, a moje brzemię lekkie”.</p>
        <p><strong>35. Wyzwolenie do prawdziwego uwielbienia (Wj 5:1, 3 a J 4:23–24; Rz 12:1):</strong> Mojżesz żądał wypuszczenia ludu, aby „obchodził święto dla PANA”. Chrystus uwalnia nas z niewoli grzechu nie po to, byśmy żyli dla siebie, lecz byśmy oddawali Ojcu cześć w Duchu i w prawdzie.</p>
        <p><strong>36. Odrzucenie Wybawiciela przez własnych braci (Wj 5:20–21 a J 1:11; Iz 53:3):</strong> Mojżesz spotyka się z gorzkim oskarżeniem ze strony tych, których przyszedł ratować. Zapowiada to los Jezusa Chrystusa, który „przyszedł do swego, a swoi go nie przyjęli”.</p>
        <p><strong>37. Wstawiennictwo Pośrednika w godzinie bólu (Wj 5:22–23 a Hbr 5:7; Łk 23:34):</strong> Zraniony przez lud Mojżesz nie przeklina swoich braci, lecz idzie z ich cierpieniem przed oblicze Boga. Jezus, nasz Najwyższy Arcykapłan, zanosi nasze łzy i słabości przed tron Ojca.</p>
        <p><strong>38. Pozorna klęska krzyża przed porankiem Zmartwychwstania (Wj 5:23 a Łk 24:21):</strong> Słowa Mojżesza: „a ty wcale nie wybawiłeś swego ludu” przypominają ból uczniów w drodze do Emaus: „A myśmy się spodziewali, że to on miał odkupić Izraela”. Pozorna klęska Wielkiego Piątku była koniecznym prologiem do chwalebnego zwycięstwa Wielkanocy.</p>
        <p><strong>39. Prawdziwy Odpoczynek Sabatu w Chrystusie (Wj 5:4–5 a Hbr 4:9–10):</strong> Faraon nienawidził odpoczynku ludu Bożego („powstrzymujecie ich od ciężarów”). W Chrystusie odnajdujemy prawdziwy Boży odpoczynek (szabbaton), którego żaden tyran nie może nam odebrać.</p>
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
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Porównaj wersety w swojej Biblii — studium porównawcze Wj 5:1–23</h3>
      <ul class="space-y-2.5 text-sm sm:text-base text-zinc-300 leading-relaxed list-disc list-inside">
        <li><strong>Wj 5:1 a Wj 4:22–23</strong> — Królewskie poselstwo Boga domagające się uwolnienia Jego pierworodnego syna do służby i świętowania.</li>
        <li><strong>Wj 5:2 a Wj 7:5; 14:4</strong> — Jak Bóg odpowiada na zuchwałe wyznanie faraona: „Nie znam PANA”?</li>
        <li><strong>Wj 5:2 a Prz 16:18; 29:23</strong> — Biblijna zasada duchowa: pycha kroczy przed upadkiem, a wyniosłość ducha prowadzi do poniżenia.</li>
        <li><strong>Wj 5:3 a Wj 3:18</strong> — Wierność Mojżesza i Aarona w dokładnym powtórzeniu słów zleconych przez Boga przy płonącym krzewie.</li>
        <li><strong>Wj 5:6–9 a Mt 23:4</strong> — Podobieństwo między bezdusznym systemem faraona a religijnym legalizmem nakładającym ciężary nie do uniesienia.</li>
        <li><strong>Wj 5:8–9 a 2 Kor 4:4</strong> — Jak przeciwnik Boży zaślepia i przeciąża ludzi, aby nie oglądali się na Słowo Boże?</li>
        <li><strong>Wj 5:14–16 a Iz 58:6</strong> — Boże spojrzenie na niesprawiedliwy ucisk i zerwanie jarzma niewoli.</li>
        <li><strong>Wj 5:17–18 a Mt 11:28–30</strong> — Kontrast między okrutnym panowaniem faraona a łagodnym i dającym odpoczynek panowaniem Chrystusa.</li>
        <li><strong>Wj 5:20–21 a Dz 7:25, 35</strong> — Mowa Szczepana o tym, jak Izraelici nie rozumieli Bożego zbawienia i odrzucali Mojżesza.</li>
        <li><strong>Wj 5:22–23 a Jr 20:7–9</strong> — Szczere zmaganie proroka w modlitwie, gdy wierne głoszenie Słowa Bożego przynosi prześladowanie i ból.</li>
        <li><strong>Wj 5:23 a Hab 1:2–3</strong> — Wołanie wierzącego serca: „Jak długo, Panie?” w obliczu pozornego triumfu przemocy.</li>
        <li><strong>Wj 5:23 a 1 P 4:12–13</strong> — Dlaczego „ogień próby” nie jest czymś dziwnym na drodze wierności Chrystusowi?</li>
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
        <p>• <strong>Posłuszeństwo Bogu może początkowo zaostrzyć walkę duchową:</strong> Gdy podejmujesz decyzję o życiu dla Boga, wróg dusz nie oddaje pola bez walki — wzmożony opór nie oznacza, że pomyliłeś drogę, lecz że dotknąłeś terytorium wroga.</p>
        <p>• <strong>Świat nazywa czas dla Boga „próżniactwem”:</strong> Kultura wyścigu szczurów wmawia Ci, że Twoja wartość zależy wyłącznie od „liczby wyrobionych cegieł”. Bóg przypomina, że jesteś stworzony do relacji z Nim i do świętowania Jego łaski.</p>
        <p>• <strong>Kłamstwem wroga jest nazywanie obietnic Bożych „kłamliwymi słowami”:</strong> Gdy okoliczności przeczą Słowu Bożemu, nie oceniaj prawdy Boga przez pryzmat przejściowego cierpienia, ale patrz na cierpienie przez pryzmat niezmiennego Słowa.</p>
        <p>• <strong>Nie szukaj ulgi u faraona:</strong> Izraelscy urzędnicy poszli żalić się do tyrana i odeszli upokorzeni; prawdziwy ratunek nigdy nie pochodzi z kompromisu ze światem, lecz z ucieczki do Pana.</p>
        <p>• <strong>Wierny sługa musi być gotowy na niezrozumienie przez braci:</strong> Ludzie, którym służysz z miłością, mogą w chwili próby obwinić Cię o swoje trudności — nie pozwól, by ludzka niewdzięczność zgasiła Twoje powołanie.</p>
        <p>• <strong>Szczera lamentacja przed Bogiem jest wyrazem wiary, nie niewiary:</strong> Mojżesz ze swoim „Czemu, Panie?” wrócił bezpośrednio do Boga; Pan pragnie Twojej autentycznej modlitwy w chwilach bólu i bezradności.</p>
        <p>• <strong>Bóg dopuszcza „punkt zerowy”, aby cała chwała należała do Niego:</strong> Dopiero gdy zawodzą wszystkie ludzkie kalkulacje, serce jest gotowe zobaczyć wszechmocną rękę Zbawiciela.</p>
        <p>• <strong>Chrystus zdejmuje z nas jarzmo „cegieł bez słomy”:</strong> W Jezusie nie musisz zasługiwać na miłość Boga niewolniczym wysiłkiem — Jego łaska daje moc i prawdziwy odpoczynek.</p>
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
        <li>Czy doświadczyłeś w swoim życiu sytuacji, w której po podjęciu dobrej, pobożnej decyzji Twoje trudności zamiast zniknąć — nagle się nasiliły? Jak wtedy zareagowałeś?</li>
        <li>W jakich sferach codzienności czujesz się dziś jak robotnik zmuszany do „wyrabiania cegieł bez słomy” — przeciążony wymaganiami ponad siły?</li>
        <li>Czy pozwalasz, aby nadmiar pracy i obowiązków zagłuszał w Twoim sercu głos Słowa Bożego i odbierał Ci czas na modlitwę oraz święty odpoczynek?</li>
        <li>W jakich sytuacjach w Twoim życiu brzmi dziś ukryte pytanie faraona: „Któż to jest PAN, żebym miał słuchać Jego głosu?” — gdzie opierasz się Bożemu autorytetowi?</li>
        <li>Do kogo udajesz się w pierwszej kolejności, gdy spada na Ciebie niesprawiedliwy cios: czy szukasz ludzkich układów u „faraona”, czy wracasz na kolanach do Pana jak Mojżesz?</li>
        <li>Jak reagujesz, gdy ludzie, którym chciałeś pomóc w imię Boże, odpowiadają Ci pretensjami, niezrozumieniem lub krytyką?</li>
        <li>Czy potrafisz w modlitwie być przed Bogiem całkowicie szczery i przynieść Mu swoje „dlaczego?”, zamiast dusić ból i rozczarowanie w sobie?</li>
        <li>Co oznacza dla Ciebie osobiście przyjęcie zaproszenia Jezusa: „Weźcie moje jarzmo na siebie... a znajdziecie odpoczynek dla waszych dusz” w ten czwartkowy dzień?</li>
      </ol>
    </section>`;

html = html.replace(
  /<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-heart"><\/i>\s*<span>Pomyśl<\/span>[\s\S]*?<\/section>/,
  card8Questions
);

// 13. Quiz Section Title
html = html.replace(
  /<span>Sprawdź swoją wiedzę — 20 Pytań z Wj 4<\/span>/,
  '<span>Sprawdź swoją wiedzę — 20 Pytań z Wj 5</span>'
);

// Quiz Data in script
html = html.replace(
  /const QUIZ_DATA = \[[\s\S]*?\];/,
  `const QUIZ_DATA = ${JSON.stringify(quizData, null, 2)};`
);

// Replace any Day 35 references in localStorage and scripts
html = html.replaceAll('kc_day35', 'kc_day36');
html = html.replaceAll('Dzień 35', 'Dzień 36');
html = html.replaceAll('dzien-35', 'dzien-36');
html = html.replaceAll('completeDay35', 'completeDay36');
html = html.replaceAll('day: 35', 'day: 36');

// Restore Day 35 back link in top navigation after global replace
html = html.replace(
  /\/kurscodzienny\/dzien-36" class="px-3 py-1\.5 rounded-lg bg-white\/5 hover:bg-white\/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1\.5 min-h-\[44px\]">\n          <i class="fa-solid fa-chevron-left text-\[10px\]"><\/i>\n          <span>← Dzień 36<\/span>/,
  '/kurscodzienny/dzien-35" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">\n          <i class="fa-solid fa-chevron-left text-[10px]"></i>\n          <span>← Dzień 35</span>'
);

// 14. TWOJA DECYZJA
const cardDecision = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-flag-checkered"></i>
        <span>Twoja decyzja</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-3">Twoja decyzja wiary</h3>
      <p class="text-sm sm:text-base text-zinc-300 leading-relaxed mb-4">
        Piąty rozdział Księgi Wyjścia stawia nas w obliczu próby ogniowej, przez którą przechodzi każda żywa wiara. Łatwo jest oddać Bogu pokłon, gdy słyszymy obietnice i widzimy pierwsze znaki (Wj 4:31). Prawdziwy sprawdzian przychodzi jednak wtedy, gdy po zrobieniu kroku posłuszeństwa napotykamy wściekły opór świata, gdy „odbierają nam słomę”, a okoliczności zdają się krzyczeć, że obietnice Boże nie działają. Dziś Bóg wzywa Cię, abyś nie oceniał Jego miłości po chwilowym mroku próby i nie wracał do niewoli ze strachu przed cierpieniem, lecz jak Mojżesz — zaniósł cały swój ciężar bezpośrednio przed tron Łaski.
      </p>
      <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm font-serif italic">
        <strong>MOJA DECYZJA:</strong> Panie Jezu Chryste, mój Zbawicielu i Królu, odrzucam dziś kłamstwa świata, który nazywa służbę dla Ciebie próżniactwem, a Twoje obietnice — próżnymi słowami. Nawet gdy wokół mnie gęstnieje ucisk i nie rozumiem od razu Twoich dróg, wybieram wierność Twojemu Słowu. Zrzucam z moich ramion niewolnicze jarzmo „cegieł bez słomy” i przyjmuję Twoje słodkie jarzmo łaski. W każdej trudności nie będę uciekał od Ciebie w gorycz, lecz będę wracał do Ciebie w szczerej modlitwie, ufając, że Twoje wybawienie nadejdzie w doskonałym czasie.
      </div>
    </section>`;

html = html.replace(
  /<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-flag-checkered"><\/i>\s*<span>Twoja decyzja<\/span>[\s\S]*?<\/section>/,
  cardDecision
);

// 15. MODLITWA
const cardPrayer = `<section class="kc-card">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-hands-praying"></i>
        <span>Modlitwa</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-3">Modlitwa na 5 listopada</h3>
      <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm sm:text-base text-zinc-300 font-serif leading-relaxed italic space-y-2">
        <p>Wszechmogący, Wieczny Boże, Panie nieba i ziemi, Boże Abrahama, Izaaka i Jakuba, Ojcze naszego Pana Jezusa Chrystusa!</p>
        <p>Przychodzę przed Twoje święte oblicze w ten czwartkowy dzień, poruszony lekcją piątego rozdziału Księgi Wyjścia. Ty widzisz każde miejsce w moim życiu, gdzie zmagam się z przeciążeniem, niezrozumieniem i oporem sił ciemności. Ty znasz chwile, w których moje ręce opadają, a serce pyta wraz z Mojżeszem: „Panie, czemu to dopuściłeś?”.</p>
        <p>Przebacz mi, Ojcze, moją małoduszność i niecierpliwość. Wybacz mi chwile, w których oceniałem Twoją wierność na podstawie chwilowych trudności, szemrałem przeciwko Twoim narzędziom lub pozwalałem, by pośpiech i gonitwa tego świata zagłuszały w mojej duszy głos Twojego Słowa. Złam w moim sercu wszelki ślad pychy faraona, która pyta: „Któż to jest PAN?”.</p>
        <p>Dziękuję Ci za Pana Jezusa Chrystusa, który sam przeszedł przez najciemniejszą dolinę odrzucenia i krzyża, aby skruszyć jarzmo szatana i otworzyć nam drogę do wolności dzieci Bożych. Dziękuję Ci, że w Nim nie jestem już niewolnikiem wyrabiającym cegły bez słomy, lecz Twoim umiłowanym dzieckiem powołanym do świętowania Twojej łaski.</p>
        <p>Udziel mi dziś Ducha wytrwałości, pokoju i niezłomnej nadziei. Spraw, abym w każdej próbie natychmiast wracał do Ciebie w modlitwie i wytrwał aż do chwili, gdy ukażesz swoją potężną rękę. Przez Jezusa Chrystusa, mojego Pana i Wybawiciela. Amen.</p>
      </div>
    </section>`;

html = html.replace(
  /<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-hands-praying"><\/i>\s*<span>Modlitwa<\/span>[\s\S]*?<\/section>/,
  cardPrayer
);

// 16. ZASTOSOWANIE I TWÓJ ZAPIS
html = html.replace(
  /Księgi Wyjścia 4:1–31<\/a>/,
  'Księgi Wyjścia 5:1–23</a>'
);

html = html.replaceAll('href="/mojabiblia?book=EXO&chapter=4"', 'href="/mojabiblia?book=EXO&chapter=5"');
html = html.replaceAll('href="/mojabiblia?book=EXO&amp;chapter=4"', 'href="/mojabiblia?book=EXO&amp;chapter=5"');

html = html.replace(
  /1\. „Po przeczytaniu Wj 4 dowiedziałem się o Bogu, że…”/,
  '1. „Po przeczytaniu Wj 5 dowiedziałem się o Bogu, że…”'
);

// Share links & encoded day references cleanup
html = html.replaceAll('Dzie%C5%84%2035', 'Dzie%C5%84%2036');
html = html.replace(
  /Znaki%20wiary%2C%20powo%C5%82anie%20i%20przymierze%20krwi/g,
  encodeURIComponent('Pierwsza konfrontacja z faraonem i próba wiary')
);
html = html.replace(
  /Znaki wiary, powołanie i przymierze krwi/g,
  'Pierwsza konfrontacja z faraonem i próba wiary'
);

// 17. JUTRO (Zapowiedź Dnia 37)
const tomorrowSection = `<!-- ── ZAPOWIEDŹ: JUTRO (wzór Dnia 1) ── -->
    <section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
      <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
        JUTRO — 6 LISTOPADA
      </div>
      <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
        DZIEŃ 37 — Boża odpowiedź na ból ludu: „Ja jestem PAN” i siedem obietnic odkupienia (Wj 6:1–30)
      </h3>
      <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
        Jutro czytamy szósty rozdział Księgi Wyjścia: w odpowiedzi na rozpaczliwe pytanie Mojżesza z końca Wj 5 Bóg wypowiada potężne słowa: „Teraz zobaczysz, co uczynię faraonowi!”. Poznamy głębię Imienia JHWH, siedem filarów Bożego odkupienia („wyprowadzę, wybawię, odkupię, wezmę was za swój lud...”) oraz rodowód Mojżesza i Aarona. Wróć jutro, aby kontynuować podróż!
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

// 18. Zapisujemy 4 ścieżki Dnia 36 w repozytorium oraz 4 w mirrorze LUMINA
const paths36 = [
  path.join(REPO, 'akademia/kurscodzienny/dzien-36.html'),
  path.join(REPO, 'akademia/kurscodzienny/dzien-36/index.html'),
  path.join(REPO, 'kursy/kurscodzienny/dzien-36.html'),
  path.join(REPO, 'kursy/kurscodzienny/dzien-36/index.html'),
  path.join(MIRROR, 'akademia/kurscodzienny/dzien-36.html'),
  path.join(MIRROR, 'akademia/kurscodzienny/dzien-36/index.html'),
  path.join(MIRROR, 'kursy/kurscodzienny/dzien-36.html'),
  path.join(MIRROR, 'kursy/kurscodzienny/dzien-36/index.html'),
];

for (const p of paths36) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, html, 'utf8');
  console.log(`✅ Zapisano Dzień 36: ${p}`);
}

// 19. Aktualizujemy Dzień 35, aby jego nawigacja górna ("Dzień 36 →") i sekcja #jutro prowadziły do /akademia/kurscodzienny/dzien-36
let html35 = fs.readFileSync(path.join(REPO, 'akademia/kurscodzienny/dzien-35.html'), 'utf8');
html35 = html35.replace(
  /<span class="px-3 py-1\.5 rounded-lg bg-white\/5 text-xs text-zinc-500 flex items-center gap-1\.5 opacity-50 cursor-not-allowed min-h-\[44px\]">\s*<span>Dzień 36 \(Jutro\) →<\/span>\s*<i class="fa-solid fa-chevron-right text-\[10px\]"><\/i>\s*<\/span>/,
  '<a href="/akademia/kurscodzienny/dzien-36" class="px-3 py-1.5 rounded-lg bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 text-xs text-brand-gold font-semibold transition flex items-center gap-1.5 min-h-[44px]">\n          <span>Dzień 36 →</span>\n          <i class="fa-solid fa-chevron-right text-[10px]"></i>\n        </a>'
);

html35 = html35.replace(
  /(id="jutro"[\s\S]*?<div class="flex items-center gap-3 flex-wrap">)\s*<a href="\/akademia\/kurscodzienny"/,
  '$1\n        <a href="/akademia/kurscodzienny/dzien-36" class="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-extrabold transition min-h-[44px] flex items-center gap-2">\n          Przejdź do Dnia 36 →\n        </a>\n        <a href="/akademia/kurscodzienny"'
);

const paths35 = [
  path.join(REPO, 'akademia/kurscodzienny/dzien-35.html'),
  path.join(REPO, 'akademia/kurscodzienny/dzien-35/index.html'),
  path.join(REPO, 'kursy/kurscodzienny/dzien-35.html'),
  path.join(REPO, 'kursy/kurscodzienny/dzien-35/index.html'),
  path.join(MIRROR, 'akademia/kurscodzienny/dzien-35.html'),
  path.join(MIRROR, 'akademia/kurscodzienny/dzien-35/index.html'),
  path.join(MIRROR, 'kursy/kurscodzienny/dzien-35.html'),
  path.join(MIRROR, 'kursy/kurscodzienny/dzien-35/index.html'),
];

for (const p of paths35) {
  fs.writeFileSync(p, html35, 'utf8');
  console.log(`🔗 Zaktualizowano linki do Dnia 36 w: ${p}`);
}

console.log('🎉 Sukces! Wygenerowano Dzień 36 we wszystkich 4 ścieżkach Clean URLs + mirrorze LUMINA oraz podpięto linki w Dniu 35!');
