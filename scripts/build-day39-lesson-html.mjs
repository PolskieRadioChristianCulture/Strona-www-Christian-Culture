import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

// Wczytujemy szablon Dnia 38
const d38Path = path.join(ROOT, 'akademia/kurscodzienny/dzien-38.html');
const d38Content = fs.readFileSync(d38Path, 'utf8');

console.log('🔄 Buduję plik lekcji HTML dla Dnia 39 (Wj 8:1–32)...');

const DAY = 39;
const PREV_DAY = 38;
const NEXT_DAY = 40;
const TITLE = 'PLAGI ŻAB, WSZY I MUCH — BOŻY PALEC I ROZRÓŻNIENIE ZIEMI GOSZEN';
const SUBTITLE = 'Sąd nad bóstwami Heket, Geb i Uatczit, bezsilność czarowników i suwerenna ochrona ludu przymierza';
const READING = 'Wj 8:1–32';
const DATE_LABEL = '8 LISTOPADA 2026 • NIEDZIELA';
const MEMORY_VERSE_TEXT = '„Wtedy czarownicy powiedzieli do faraona: To jest palec Boży. Lecz serce faraona było zatwardziałe i nie usłuchał ich, tak jak PAN powiedział.”';
const MEMORY_VERSE_REF = 'Księga Wyjścia 8:19 (UBG)';
const MEMORY_VERSE_CLIP = 'Wtedy czarownicy powiedzieli do faraona: To jest palec Boży. Lecz serce faraona było zatwardziałe i nie usłuchał ich, tak jak PAN powiedział. (Wj 8:19, UBG)';
const THEME = 'Ósmy rozdział Księgi Wyjścia ukazuje eskalację Bożej konfrontacji z pychą faraona i fałszywym kultem Egiptu poprzez plagi żab, wszy i much. W bezsilności czarowników egipskich, którzy zmuszeni są wyznać: „To jest palec Boży”, oraz w wyraźnym oddzieleniu ziemi Goszen od reszty Egiptu, Bóg objawia swoją absolutną suwerenność, nienaruszalną ochronę swoich wybranych i daremność kompromisów ze światem, zapowiadając w Chrystusie pełne wyzwolenie z niewoli grzechu i ciemności.';
const IMAGE_URL = '/images/academy/daily/kc_day_39_plagi_zaby_muchy_nil.jpg?v=20261108';
const IMAGE_ALT = 'Dzień 39: PLAGI ŻAB, WSZY I MUCH — BOŻY PALEC I ROZRÓŻNIENIE ZIEMI GOSZEN (Wj 8:1–32)';
const CAPTION = 'Ilustracja biblijna: Egipscy czarownicy upuszczają laski i wyznają przed faraonem: „To jest palec Boży”, a ziemia Goszen jaśnieje w Bożym pokoju (Wj 8:19–23)';

// QUIZ_DATA dla Dnia 39 (20 pytań)
const QUIZ_DATA = [
  {
    "q": "Jaka była druga plaga sprowadzona na Egipt według Wj 8:2?",
    "a": ["Plaga żab", "Plaga szarańczy", "Plaga gradu"],
    "c": 0
  },
  {
    "q": "Do jakich miejsc w domach Egipcjan miały wejść żaby według zapowiedzi z Wj 8:3?",
    "a": ["Tylko do piwnic i ogrodów", "Do sypialni, łóżek, domów sług, pieców i dzież na ciasto", "Wyłącznie do stajni i zagród"],
    "c": 1
  },
  {
    "q": "Co uczynił Aaron, aby żaby wyszły na ziemię egipską (Wj 8:6)?",
    "a": ["Wykopał rów wzdłuż Nilu", "Wyciągnął rękę nad wody Egiptu z laską", "Zadął w srebrną trąbę"],
    "c": 1
  },
  {
    "q": "Co zrobili czarownicy egipscy w obliczu plagi żab (Wj 8:7)?",
    "a": ["Uciekli z pałacu do świątyń", "Uczynili to samo swymi czarami i również sprowadzili żaby", "Natychmiast usunęli wszystkie żaby"],
    "c": 1
  },
  {
    "q": "O co faraon poprosił Mojżesza i Aarona po raz pierwszy w Wj 8:8?",
    "a": ["O modlitwę do PANA, aby oddalił żaby, obiecując wypuszczenie ludu", "O zapłatę za wyrządzone szkody", "O ucieczkę z Egiptu tej samej nocy"],
    "c": 0
  },
  {
    "q": "Na kiedy faraon wyznaczył termin usunięcia żab według Wj 8:10?",
    "a": ["Na za godzinę", "Na jutro", "Na koniec miesiąca"],
    "c": 1
  },
  {
    "q": "W jakim celu Mojżesz pozwolił faraonowi wybrać czas ustąpienia plagi (Wj 8:10)?",
    "a": ["Aby udowodnić swoją wiedzę astrologiczną", "Aby poznał, że nie ma nikogo takiego, jak PAN, nasz Bóg", "Aby zyskać czas na przygotowanie podróży"],
    "c": 1
  },
  {
    "q": "Co zrobili Egipcjanie z martwymi żabami i jaki był tego skutek (Wj 8:14)?",
    "a": ["Spalili je w piecach świątynnych", "Zgarnęli je w wielkie stosy, a cała ziemia zasmrodziła się", "Wrzucili je z powrotem do Morza Czerwonego"],
    "c": 1
  },
  {
    "q": "Jak zachował się faraon, gdy zobaczył, że nastąpiła ulga (Wj 8:15)?",
    "a": ["Zatwardził swoje serce i nie usłuchał ich", "Padł na kolana i wyznał swoje grzechy", "Wypuścił Izraelitów na pustynię"],
    "c": 0
  },
  {
    "q": "W co uderzył Aaron swoją laską przy trzeciej pladze (Wj 8:16–17)?",
    "a": ["W wody Morza Czerwonego", "W proch ziemi", "W mury pałacu faraona"],
    "c": 1
  },
  {
    "q": "W co zamienił się proch ziemi w całym Egipcie (Wj 8:17)?",
    "a": ["We wszy (lub komary), które obsiadły ludzi i bydło", "W jadowite skorpiony", "W gorący piasek pustyni"],
    "c": 0
  },
  {
    "q": "Czy czarownicy zdołali powtórzyć plagę wszy swymi zaklęciami (Wj 8:18)?",
    "a": ["Tak, zrobili jeszcze więcej wszy", "Nie, nie zdołali tego uczynić", "Zrobili inne owady zamiast wszy"],
    "c": 1
  },
  {
    "q": "Co powiedzieli czarownicy do faraona, gdy nie mogli wywołać wszy (Wj 8:19)?",
    "a": ["To przypadek natury", "To jest palec Boży", "Mojżesz użył trucizny"],
    "c": 1
  },
  {
    "q": "Gdzie Mojżesz miał spotkać faraona przed zapowiedzią czwartej plagi (Wj 8:20)?",
    "a": ["Wcześnie rano nad wodą rzeki", "W południe w świątyni boga Ra", "O północy na wieży pałacowej"],
    "c": 0
  },
  {
    "q": "Jaka była czwarta plaga zapowiedziana w Wj 8:21?",
    "a": ["Rojowiska kąsających much i gzów niszczących ziemię", "Gęsta ciemność nad całym krajem", "Pioruny niszczące uprawy"],
    "c": 0
  },
  {
    "q": "Jaką krainę Bóg w cudowny sposób wyodrębnił i uchronił przed plagą much (Wj 8:22)?",
    "a": ["Ziemię Kanaan", "Ziemię Goszen, w której mieszkał lud Boży", "Miasto Memfis"],
    "c": 1
  },
  {
    "q": "Jaki pierwszy kompromis zaproponował faraon Mojżeszowi w Wj 8:25?",
    "a": ["Zaproponował, aby złożyli ofiarę Bogu w tej ziemi (w granicach Egiptu)", "Zaproponował, by oddali połowę bydła", "Zaproponował wyjazd tylko kobiet i dzieci"],
    "c": 0
  },
  {
    "q": "Dlaczego Mojżesz odmówił składania ofiar w ziemi egipskiej (Wj 8:26)?",
    "a": ["Bo ołtarze były za małe", "Gdyż ofiarowaliby obrzydliwość Egipcjan (święte bydło) i zostaliby ukamienowani", "Bo brakowało drewna na opał"],
    "c": 1
  },
  {
    "q": "Jaki drugi kompromis zaproponował faraon w Wj 8:28?",
    "a": ["Pozwolił odejść na pustynię, ale zastrzegł: „tylko nie odchodźcie za daleko”", "Pozwolił odejść tylko kapłanom", "Pozwolił odejść na jeden dzień"],
    "c": 0
  },
  {
    "q": "Co uczynił faraon po tym, jak Bóg na modlitwę Mojżesza usunął wszystkie muchy (Wj 8:32)?",
    "a": ["Ponownie zatwardził swoje serce i nie wypuścił ludu", "Uznał przymierze z Abrahamem", "Wyprawił ucztę na cześć Mojżesza"],
    "c": 0
  }
];

let d39Html = d38Content;

// 1. Podmiana meta tagów i tytułów
d39Html = d39Html.replace(
  /<title>Dzień 38:.*?<\/title>/,
  `<title>Dzień 39: ${TITLE} (${READING}) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`
);

d39Html = d39Html.replace(
  /<meta name="description" content="[^"]*" \/>/,
  `<meta name="description" content="Dzień 39: Księga Wyjścia 8:1–32. Plagi żab, wszy i much. Bezsilność czarowników wyznających 'To jest palec Boży' oraz ochrona ziemi Goszen. Studium biblijne i quiz wiedzy." />`
);

d39Html = d39Html.replace(
  /<link rel="canonical" href="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-\d+" \/>/,
  `<link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-39" />`
);

d39Html = d39Html.replace(
  /<meta property="og:url" content="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-\d+" \/>/,
  `<meta property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-39" />`
);

d39Html = d39Html.replace(
  /<meta property="og:title" content="[^"]*" \/>/,
  `<meta property="og:title" content="Dzień 39: ${TITLE} (${READING}) — Z Biblią za Pan Brat" />`
);

d39Html = d39Html.replace(
  /<meta property="og:description" content="[^"]*" \/>/,
  `<meta property="og:description" content="Księga Wyjścia — Miesiąc 2, Dzień 39. Plagi żab, wszy i much — Boży palec i rozróżnienie ziemi Goszen — Wj 8:1–32." />`
);

d39Html = d39Html.replace(
  /<meta property="og:image" content="[^"]*" \/>/,
  `<meta property="og:image" content="https://polskieradio.cc${IMAGE_URL}" />`
);

// 2. Podmiana nagłówków i breadcrumbs
d39Html = d39Html.replace(
  /<a href="\/akademia\/kurscodzienny\/dzien-37" class="px-3 py-1.5 rounded-lg bg-zinc-900\/80 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white transition flex items-center gap-1.5 min-h-\[44px\]">[\s\S]*?<\/a>/,
  `<a href="/akademia/kurscodzienny/dzien-38" class="px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 38</span>
        </a>`
);

// Dzień 39 nie ma jeszcze linku w prawo do Dnia 40 (jest najnowszą lekcją)
d39Html = d39Html.replace(
  /<a href="\/akademia\/kurscodzienny\/dzien-39"[\s\S]*?<\/a>/,
  `<span class="px-3 py-1.5 rounded-lg bg-zinc-900/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 40 (Jutro) →</span>
        </span>`
);

// Metryka w Hero
d39Html = d39Html.replace(
  /DZIEŃ 38 • 7 LISTOPADA 2026 • SOBOTA/g,
  `DZIEŃ 39 • ${DATE_LABEL}`
);

d39Html = d39Html.replace(
  /Wj 7:1–25/g,
  READING
);

d39Html = d39Html.replace(
  /LASKA, KTÓRA POŁKNĘŁA WĘŻE, I WODA ZAMIENIONA W KREW/g,
  TITLE
);

d39Html = d39Html.replace(
  /Mojżesz ustanowiony bogiem dla faraona, pojedynek lasek czarowników i uderzenie w święty Nil/g,
  SUBTITLE
);

// Pamięciowy w Hero
d39Html = d39Html.replace(
  /„Tak mówi PAN: Po tym poznasz, że ja jestem PANEM: oto uderzę laską, którą mam w ręku, wodę w rzece, a zamieni się w krew.”/g,
  MEMORY_VERSE_TEXT
);

d39Html = d39Html.replace(
  /Księga Wyjścia 7:17 \(UBG\)/g,
  MEMORY_VERSE_REF
);

d39Html = d39Html.replace(
  /data-verse-clip="[^"]*"/g,
  `data-verse-clip="${MEMORY_VERSE_CLIP}"`
);

// Myśl przewodnia
d39Html = d39Html.replace(
  /Siódmy rozdział Księgi Wyjścia rozpoczyna bezpośrednie starcie Boga JAHWE z panteonem bóstw egipskich[\s\S]*?w Chrystusie\./,
  THEME
);

// Obrazek
d39Html = d39Html.replace(
  /src="\/images\/academy\/daily\/kc_day_38_laska_woda_w_krew_nil\.jpg\?v=20261107"/g,
  `src="${IMAGE_URL}"`
);

d39Html = d39Html.replace(
  /alt="Dzień 38:[^"]*"/g,
  `alt="${IMAGE_ALT}"`
);

d39Html = d39Html.replace(
  /Ilustracja biblijna: Aaron uderzający laską w wody Nilu przed faraonem \(Wj 7:20\)/g,
  CAPTION
);

// Zanim otworzysz Biblię
const ZANIM_HTML = `
      <div class="space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed font-serif">
        <p>
          Ósmy rozdział Księgi Wyjścia wprowadza nas w samo centrum wielkiej batalii o duszę narodu wybranego i o objawienie chwały jedynego prawdziwego Boga wobec najpotężniejszego mocarstwa starożytnego świata. W poprzednim rozdziale byliśmy świadkami sądu nad świętym Nilem — woda zamieniona w krew obnażyła bezradność bóstw Hapi i Ozyrysa, a siedem dni skażenia rzeki było czasem Bożej cierpliwości wzywającej do opamiętania. Faraon jednak zignorował ten znak, uciekając do swojego pałacu i utwardzając swoje serce.
        </p>
        <p>
          W rozdziale ósmym rozpoczyna się dynamiczna seria trzech kolejnych plag: żab (druga plaga), wszy lub komarów (trzecia plaga) oraz gzów i jadowitych much (czwarta plaga). Każda z nich uderza precyzyjnie w inny element pogańskiego kultu Egiptu. Żaby były ucieleśnieniem bogini Heket, opiekunki płodności i narodzin. Proch ziemi zamieniony we wszy demaskował nicość boga ziemi Geba oraz uniemożliwiał kapłanom egipskim rytualną czystość w świątyniach. Natomiast chmary much i gzów ośmieszały bóstwo Uatczit oraz skarabeusza Khepri.
        </p>
        <p>
          Jednak w tym rozdziale dochodzi do dwóch epokowych przełomów teologicznych. Po pierwsze, przy trzeciej pladze kapitulują egipscy magowie i czarownicy — po raz pierwszy nie są w stanie powtórzyć znaku swymi czarami i wypowiadają historyczne wyznanie: <strong class="text-amber-300">„To jest palec Boży” (Wj 8:19)</strong>. Po drugie, przy czwartej pladze Bóg wprowadza widzialne, nienaruszalne rozróżnienie (hebr. <em class="text-amber-200">pedut</em> — wykupienie, rozdzielenie) pomiędzy ziemią Egiptu a krainą Goszen: podczas gdy cały Egipt tonie w ruinie i zniszczeniu, domy synów Izraela cieszą się absolutnym pokojem i ochroną. Rozdział ten demaskuje również taktykę kompromisów, jakimi szatan i duch tego świata usiłują zatrzymać wierzących w połowie drogi do pełnego posłuszeństwa Bogu.
        </p>
      </div>`;

d39Html = d39Html.replace(
  /<div class="space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed font-serif">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── ROZDZIAŁ W PIGUŁCE/,
  `${ZANIM_HTML}\n    </section>\n\n    <!-- ── ROZDZIAŁ W PIGUŁCE`
);

// Rozdział w pigułce (4 części)
const PIGULKA_HTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 rounded-xl bg-zinc-900/60 border border-brand-line">
          <div class="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">Część I • Wj 8:1–15</div>
          <h4 class="font-serif font-bold text-white text-sm mb-1">Druga plaga: Inwazja żab i modlitwa wstawiennicza</h4>
          <p class="text-xs text-zinc-400 leading-relaxed">
            Sąd nad kultem bogini Heket. Żaby w sypialniach i piecach. Faraon prosi o modlitwę, lecz na termin wybiera „jutro”. Na modlitwę Mojżesza żaby giną, lecz po uldze serce tyrana ponownie twardnieje.
          </p>
        </div>
        <div class="p-4 rounded-xl bg-zinc-900/60 border border-brand-line">
          <div class="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">Część II • Wj 8:16–19</div>
          <h4 class="font-serif font-bold text-white text-sm mb-1">Trzecia plaga: Proch we wszy i wyznanie czarowników</h4>
          <p class="text-xs text-zinc-400 leading-relaxed">
            Sąd bez ostrzeżenia. Uderzenie w bóstwo Geba. Czarownicy ponoszą bezwzględną klęskę i wyznają: „To jest palec Boży!”. Paraliż kultu świątynnego Egiptu.
          </p>
        </div>
        <div class="p-4 rounded-xl bg-zinc-900/60 border border-brand-line">
          <div class="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">Część III • Wj 8:20–24</div>
          <h4 class="font-serif font-bold text-white text-sm mb-1">Czwarta plaga: Rojowiska much i rozróżnienie Goszen</h4>
          <p class="text-xs text-zinc-400 leading-relaxed">
            Spotkanie nad rzeką o świcie. Jadowite owady niszczą Egipt, lecz kraina Goszen pozostaje nietykalna. Teologia przymierza i wykupienia (pedut).
          </p>
        </div>
        <div class="p-4 rounded-xl bg-zinc-900/60 border border-brand-line">
          <div class="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">Część IV • Wj 8:25–32</div>
          <h4 class="font-serif font-bold text-white text-sm mb-1">Pułapki kompromisu i ponowny bunt tyrana</h4>
          <p class="text-xs text-zinc-400 leading-relaxed">
            Faraon proponuje kompromisy: „złóżcie ofiarę w tej ziemi” i „nie idźcie za daleko”. Mojżesz wymaga pełnego oddzielenia 3 dni drogi. Cudowne usunięcie much i ponowne zatwardzenie faraona.
          </p>
        </div>
      </div>`;

d39Html = d39Html.replace(
  /<div class="grid grid-cols-1 md:grid-cols-2 gap-4">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── TEKST BIBLIJNY/,
  `${PIGULKA_HTML}\n    </section>\n\n    <!-- ── TEKST BIBLIJNY`
);

// Linki do MojejBiblii w tekście biblijnym
d39Html = d39Html.replace(/ref=Wj7:1-25/g, 'ref=Wj8:1-32');
d39Html = d39Html.replace(/Wj 7:1–25/g, 'Wj 8:1–32');

// Jezus w centrum
const JEZUS_HTML = `
      <div class="space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed font-serif">
        <p>
          Ósmy rozdział Księgi Wyjścia jaśnieje wspaniałym światłem Nowego Przymierza w Jezusie Chrystusie:
        </p>
        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div class="text-xs font-bold uppercase tracking-wider text-amber-300 font-sans">
            1. Palec Boży wypędzający ciemność (Łk 11:20)
          </div>
          <p class="text-xs sm:text-sm text-zinc-300">
            Gdy faryzeusze zarzucali Jezusowi, że mocą Belzebuba wyrzuca złe duchy, Zbawiciel odwołał się bezpośrednio do Wj 8:19: <em>„A jeśli Ja palcem Bożym wyganiam demony, to z pewnością przyszło do was królestwo Boże”</em>. Palec Boży, który w Egipcie obnażył bezsilność czarowników, w Chrystusie jest uwalniającą mocą Ducha Świętego niszczącą królestwo szatana i przynoszącą ratunek zniewolonym!
          </p>
        </div>
        <div class="p-4 rounded-xl bg-zinc-900/60 border border-brand-line space-y-2">
          <div class="text-xs font-bold uppercase tracking-wider text-amber-300 font-sans">
            2. Chrystus naszą wieczną Ziemią Goszen (Rz 8:1; J 10:28)
          </div>
          <p class="text-xs sm:text-sm text-zinc-300">
            Cudowne oddzielenie ziemi Goszen od niszczycielskich plag Egiptu to proroczy obraz bezpieczeństwa tych, którzy są ukryci „w Chrystusie Jezusie”. W Nim nie ma żadnego potępienia. Choć świat wokół nas tonie w niepokoju i duchowym zamęcie, wierzący cieszą się nienaruszalnym pokojem, chronieni mocą Jego odkupieńczej krwi.
          </p>
        </div>
        <div class="p-4 rounded-xl bg-zinc-900/60 border border-brand-line space-y-2">
          <div class="text-xs font-bold uppercase tracking-wider text-amber-300 font-sans">
            3. Krew Chrystusa jako nasz prawdziwy Pedut — Wykupienie (Ap 5:9)
          </div>
          <p class="text-xs sm:text-sm text-zinc-300">
            Słowo Boże w Wj 8:23 mówi: <em>„Postawię wykupienie (pedut) między moim ludem a twoim”</em>. Jezus Chrystus jest naszym wiecznym Odkupicielem, który nabył nas Bogu swoją własną krwią, wyrywając nas z władzy ciemności i przenosząc do Królestwa swego umiłowanego Syna (Kol 1:13).
          </p>
        </div>
        <div class="p-4 rounded-xl bg-zinc-900/60 border border-brand-line space-y-2">
          <div class="text-xs font-bold uppercase tracking-wider text-amber-300 font-sans">
            4. Odrzucenie kompromisów świata (2 Kor 6:14–18)
          </div>
          <p class="text-xs sm:text-sm text-zinc-300">
            Odpowiedź Mojżesza na propozycje faraona: „złóżcie ofiarę w tej ziemi” i „nie odchodźcie za daleko” znajduje swoje echo w wezwaniu Ewangelii: <em>„Wyjdźcie spośród nich i odłączcie się, mówi Pan, a Ja was przyjmę”</em>. Zbawiciel nie przyjmuje połowicznego serca — wzywa do radykalnego pójścia za Nim!
          </p>
        </div>
      </div>`;

d39Html = d39Html.replace(
  /<!-- ── JEZUS W CENTRUM \(wzór Dnia 1\) ── -->[\s\S]*?<\/section>\s*<!-- ── SPRAWDŹ W BIBLII/,
  `<!-- ── JEZUS W CENTRUM (wzór Dnia 1) ── -->\n    <section class="kc-card border-brand-gold/40" id="jezus-w-centrum">\n      <div class="kc-section-badge">\n        <i class="fa-solid fa-cross"></i>\n        <span>CHRYSTUS W CENTRUM</span>\n      </div>\n      <h2 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">\n        Palec Boży uwalniający z ciemności i Krzyż jako nasza Ziemia Goszen\n      </h2>\n${JEZUS_HTML}\n    </section>\n\n    <!-- ── SPRAWDŹ W BIBLII`
);

// Twoja decyzja
const DECYZJA_HTML = `
      <div class="space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed font-serif">
        <p>
          Ósmy rozdział Księgi Wyjścia obnaża odwieczną walkę pomiędzy suwerennym wezwaniem Boga do radykalnego posłuszeństwa a subtelnymi propozycjami kompromisu płynącymi ze strony tego świata. Faraon reprezentuje postawę człowieka, który w obliczu kryzysu szuka ulgi i prosi o modlitwę, lecz gdy tylko mija ból, powraca do swego uporu. Co więcej, próbuje negocjować z Bogiem: „służcie Mu, ale w Egipcie”, „idźcie, ale nie za daleko”.
        </p>
        <p>
          Bóg nie przyjmuje jednak połowicznego oddania. On żąda całego serca i wyprowadza swój lud na odległość trzech dni drogi — poza granice kompromisu, w przestrzeń przymierza i wolności. Cudowna ochrona ziemi Goszen przypomina nam, że ci, którzy należą do Boga, nie muszą lękać się plag i zamętu tego świata. W Jezusie Chrystusie otrzymaliśmy wieczne schronienie, a Jego Duch Święty — Palec Boży — kruszy wszelkie demoniczne więzy w naszym życiu.
        </p>
        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div class="text-xs font-bold uppercase tracking-wider text-amber-300 font-sans mb-1">
            MOJA OSOBISTA DECYZJA NA DZIŚ
          </div>
          <p class="text-xs sm:text-sm text-zinc-200 italic font-serif">
            „Panie Boże Wszechmogący, wyznaję, że Ty jesteś moim jedynym Panem i Zbawicielem. Odrzucam dziś wszelkie kompromisy ze światem — nie chcę zatrzymywać się w połowie drogi ani służyć Ci na warunkach dyktowanych przez kulturę tego świata. Dziękuję Ci za Jezusa Chrystusa, który swoim Duchem — Palcem Bożym — wyzwolił mnie z niewoli ciemności i uczynił mnie mieszkańcem bezpiecznej Ziemi Goszen. Wybieram bezkompromisowe posłuszeństwo Twojemu Słowu każdego dnia.”
          </p>
        </div>
      </div>`;

d39Html = d39Html.replace(
  /<!-- ── TWOJA DECYZJA \(wzór Dnia 1\) ── -->[\s\S]*?<\/section>\s*<!-- ── MODLITWA/,
  `<!-- ── TWOJA DECYZJA (wzór Dnia 1) ── -->\n    <section class="kc-card border-brand-gold/40" id="decyzja">\n      <div class="kc-section-badge">\n        <i class="fa-solid fa-heart-circle-check"></i>\n        <span>TWOJA DECYZJA</span>\n      </div>\n      <h2 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">\n        Wybór bezkompromisowego posłuszeństwa i schronienia w Bożej łasce\n      </h2>\n${DECYZJA_HTML}\n    </section>\n\n    <!-- ── MODLITWA`
);

// Modlitwa na 8 listopada
const MODLITWA_HTML = `
      <div class="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-zinc-900/60 to-zinc-950 border border-amber-500/30">
        <p class="text-xs sm:text-sm text-amber-200/90 font-serif leading-relaxed italic">
          „Wszechmogący, Święty i Sprawiedliwy Boże, Panie niebios i ziemi! W ten niedzielny poranek stajemy przed Twoim majestatem z sercami pełnymi czci i uwielbienia za Twoją absolutną suwerenność objawioną w ósmym rozdziale Księgi Wyjścia. Ty jesteś Bogiem, przed którego potęgą uginają się dumni władcy, a najpotężniejsi magowie tego świata zmuszeni są wyznać: «To jest palec Boży!». Dziękujemy Ci, Ojcze, za Twoją ojcowską opiekę nad Twoim ludem. Dziękujemy, że tak jak w starożytności oddzieliłeś krainę Goszen od niszczycielskich plag Egiptu, tak dzisiaj w Jezusie Chrystusie dajesz nam nienaruszalne schronienie, pokój i zbawienie. Choć wokół nas świat pogrąża się w niepokoju i grzechu, my jesteśmy bezpieczni w Twoim wyciągniętym ramieniu. Przebacz nam, Panie, każdą pokusę kompromisu z duchem tego świata. Wybacz chwile, w których próbowaliśmy łączyć świętość z ziemskimi nawykami, i zachowaj nas przed obłudą faraona, który wołał o ulgę, a po jej otrzymaniu zatwardzał swoje serce. Daj nam serca miękkie, prawe i posłuszne Twojemu Słowu. Panie Jezu Chryste, dziękujemy Ci, że Ty palcem Bożym wypędzasz wszelką ciemność z naszego życia. Dziękujemy za Twoją krew przelaną na krzyżu, która jest naszą wieczną tarczą. Prowadź nas w ten niedzielny dzień w mocy Twojego Ducha i spraw, aby nasze życie przynosiło Ci chwałę. W Imieniu Jezusa Chrystusa. Amen.”
        </p>
      </div>`;

d39Html = d39Html.replace(
  /<!-- ── MODLITWA \(wzór Dnia 1\) ── -->[\s\S]*?<\/section>\s*<!-- ── ZADANIE NA DZIŚ/,
  `<!-- ── MODLITWA (wzór Dnia 1) ── -->\n    <section class="kc-card border-brand-gold/40" id="modlitwa">\n      <div class="kc-section-badge">\n        <i class="fa-solid fa-hands-praying"></i>\n        <span>MODLITWA NA 8 LISTOPADA</span>\n      </div>\n      <h2 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">\n        Modlitwa o serce wolne od kompromisów i wdzięczność za bezpieczeństwo w Goszen\n      </h2>\n${MODLITWA_HTML}\n    </section>\n\n    <!-- ── ZADANIE NA DZIŚ`
);

// 7 zadań
const TASK_HTML = `
      <div class="space-y-3">
        <label class="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-brand-line hover:border-amber-500/30 cursor-pointer transition">
          <input type="checkbox" id="kc_day39_chk_1" class="mt-1 accent-amber-500 w-4 h-4 rounded" />
          <span class="text-xs sm:text-sm text-zinc-300">1. Przeczytaj osobiście cały ósmy rozdział Księgi Wyjścia (Wj 8:1–32) w przekładzie UBG.</span>
        </label>
        <label class="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-brand-line hover:border-amber-500/30 cursor-pointer transition">
          <input type="checkbox" id="kc_day39_chk_2" class="mt-1 accent-amber-500 w-4 h-4 rounded" />
          <span class="text-xs sm:text-sm text-zinc-300">2. Zbadaj swoje serce: czy w Twoim życiu nie ma obszaru, w którym mówisz Bogu „jutro” zamiast poddać się Jego woli dzisiaj?</span>
        </label>
        <label class="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-brand-line hover:border-amber-500/30 cursor-pointer transition">
          <input type="checkbox" id="kc_day39_chk_3" class="mt-1 accent-amber-500 w-4 h-4 rounded" />
          <span class="text-xs sm:text-sm text-zinc-300">3. Zidentyfikuj ewentualne „kompromisy faraona” — sfery, w których duch tego świata namawia Cię, byś „nie odchodził za daleko” w wierze.</span>
        </label>
        <label class="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-brand-line hover:border-amber-500/30 cursor-pointer transition">
          <input type="checkbox" id="kc_day39_chk_4" class="mt-1 accent-amber-500 w-4 h-4 rounded" />
          <span class="text-xs sm:text-sm text-zinc-300">4. Podziękuj Bogu w modlitwie za duchową „Ziemię Goszen” — za nienaruszalne bezpieczeństwo i pokój, jakie masz w Jezusie Chrystusie.</span>
        </label>
        <label class="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-brand-line hover:border-amber-500/30 cursor-pointer transition">
          <input type="checkbox" id="kc_day39_chk_5" class="mt-1 accent-amber-500 w-4 h-4 rounded" />
          <span class="text-xs sm:text-sm text-zinc-300">5. Przeczytaj słowa Pana Jezusa z Ewangelii Łukasza 11:14–23 o Palcu Bożym wypędzającym demony.</span>
        </label>
        <label class="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-brand-line hover:border-amber-500/30 cursor-pointer transition">
          <input type="checkbox" id="kc_day39_chk_6" class="mt-1 accent-amber-500 w-4 h-4 rounded" />
          <span class="text-xs sm:text-sm text-zinc-300">6. Porozmawiaj z kimś z rodziny lub wspólnoty o niebezpieczeństwie nieszczerej religijności, która szuka Boga tylko w czasie kryzysu.</span>
        </label>
        <label class="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-brand-line hover:border-amber-500/30 cursor-pointer transition">
          <input type="checkbox" id="kc_day39_chk_7" class="mt-1 accent-amber-500 w-4 h-4 rounded" />
          <span class="text-xs sm:text-sm text-zinc-300">7. Udostępnij dzisiejszą lekcję lub werset pamięciowy osobie potrzebującej Bożego pokoju i pocieszenia.</span>
        </label>
      </div>`;

d39Html = d39Html.replace(
  /<!-- ── ZADANIE NA DZIŚ & DZIENNIK \(wzór Dnia 1\) ── -->[\s\S]*?<\/section>\s*<!-- ── POROZMAWIAJ Z DUCHOWNYM/,
  `<!-- ── ZADANIE NA DZIŚ & DZIENNIK (wzór Dnia 1) ── -->\n    <section class="kc-card border-brand-gold/40" id="zadanie">\n      <div class="kc-section-badge">\n        <i class="fa-solid fa-list-check"></i>\n        <span>ZADANIE NA DZIŚ (7 KROKÓW)</span>\n      </div>\n      <h2 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">\n        Wprowadź Słowo w czyn: 7 kroków na niedzielę\n      </h2>\n${TASK_HTML}\n    </section>\n\n    <!-- ── POROZMAWIAJ Z DUCHOWNYM`
);

// Podziel się
d39Html = d39Html.replace(
  /Dzie%C5%84%2038[^"]*/g,
  `Dzie%C5%84%2039%20Kursu%20Codziennego%20Pisma%20%C5%9Awi%C4%99tego%3A%20Plagi%20%C5%BCab%2C%20wszy%20i%20much%20%E2%80%94%20Bo%C5%BCy%20palec%20i%20rozr%C3%B3%C5%BCnienie%20Goszen%20https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-39`
);

d39Html = d39Html.replace(
  /dzien-38/g,
  'dzien-39'
);

// Przywróć link wstecz do Dnia 38 w breadcrumbs
d39Html = d39Html.replace(
  /href="\/akademia\/kurscodzienny\/dzien-39" class="px-3 py-1\.5 rounded-lg bg-zinc-900\/80/,
  `href="/akademia/kurscodzienny/dzien-38" class="px-3 py-1.5 rounded-lg bg-zinc-900/80`
);

// Zapowiedź: Jutro (Dzień 40)
const TOMORROW_HTML = `
      <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
        JUTRO — 9 LISTOPADA
      </div>
      <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
        DZIEŃ 40 — POMÓR BYDŁA, WRZODY I GRAD (Wj 9:1–35)
      </h3>
      <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
        Dzień 40: Księga Wyjścia 9:1–35. Kolejne trzy plagi uderzają w gospodarkę i zdrowie Egiptu. Bóg oznajmia faraonowi: „Właśnie po to cię zachowałem, aby okazać na tobie moją moc”. Ognisty grad niszczący pola i Boże panowanie nad naturą.
      </p>
      <div class="flex items-center gap-3 flex-wrap">
        <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-[44px]">
          <span>Dostępne od północy (9 listopada)</span>
        </span>
        <a href="/akademia/kurscodzienny" class="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-300 hover:text-white text-xs font-bold transition min-h-[44px] flex items-center">
          ← Spis kursu
        </a>
      </div>`;

d39Html = d39Html.replace(
  /<section class="p-6 rounded-2xl bg-\[#0E121A\] border border-brand-line text-zinc-300" id="jutro">[\s\S]*?<\/section>/,
  `<section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">\n${TOMORROW_HTML}\n    </section>`
);

// QUIZ_DATA i klucze
d39Html = d39Html.replace(
  /const QUIZ_DATA = \[[\s\S]*?\];\s*let userAnswers = \{\};/,
  `const QUIZ_DATA = ${JSON.stringify(QUIZ_DATA)};\n    let userAnswers = {};`
);

d39Html = d39Html.replace(/kc_day\d+_quiz/g, 'kc_day39_quiz');
d39Html = d39Html.replace(/kc_day\d+_completed/g, 'kc_day39_completed');
d39Html = d39Html.replace(/kc_day\d+_learned/g, 'kc_day39_learned');
d39Html = d39Html.replace(/kc_day\d+_decision/g, 'kc_day39_decision');
d39Html = d39Html.replace(/kc_day\d+_chk_/g, 'kc_day39_chk_');
d39Html = d39Html.replace(/completeDay\d+\(\)/g, 'completeDay39()');
d39Html = d39Html.replace(/function completeDay\d+\(\)/g, 'function completeDay39()');
d39Html = d39Html.replace(/const DAY_KEY = 'kc_day\d+';/g, "const DAY_KEY = 'kc_day39';");
d39Html = d39Html.replace(/Dzień \d+ ukończony/g, 'Dzień 39 ukończony');
d39Html = d39Html.replace(/Oznacz Dzień \d+ jako ukończony/g, 'Oznacz Dzień 39 jako ukończony');

// Zapisujemy plik lekcji do akademia/kurscodzienny/dzien-39.html
const d39Dest = path.join(ROOT, 'akademia/kurscodzienny/dzien-39.html');
fs.writeFileSync(d39Dest, d39Html, 'utf8');
console.log(`✅ Zapisano ${d39Dest}`);

// 4 ścieżki Clean URLs
const paths = [
  'akademia/kurscodzienny/dzien-39.html',
  'akademia/kurscodzienny/dzien-39/index.html',
  'kursy/kurscodzienny/dzien-39.html',
  'kursy/kurscodzienny/dzien-39/index.html'
];

for (const p of paths) {
  const fullP = path.join(ROOT, p);
  fs.mkdirSync(path.dirname(fullP), { recursive: true });
  fs.writeFileSync(fullP, d39Html, 'utf8');
  console.log(`✅ Zapisano ścieżkę Clean URL: ${p}`);
}

// 5. Aktualizujemy Dzień 38, aby linkował do Dnia 39
console.log('🔄 Aktualizuję Dzień 38...');
let d38Updated = fs.readFileSync(d38Path, 'utf8');

// Dodaj link do Dnia 39 w nagłówku Dnia 38
if (!d38Updated.includes('dzien-39')) {
  d38Updated = d38Updated.replace(
    /(<a href="\/akademia\/kurscodzienny\/dzien-37"[\s\S]*?<\/a>)/,
    `$1
        <a href="/akademia/kurscodzienny/dzien-39" class="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs text-amber-300 hover:text-amber-200 transition flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 39 →</span>
          <i class="fa-solid fa-chevron-right text-[10px]"></i>
        </a>`
  );
}

// Zaktualizuj sekcję #jutro w Dniu 38
const jutro38 = `
    <!-- ── ZAPOWIEDŹ: JUTRO (wzór Dnia 1) ── -->
    <section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
      <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
        JUTRO — 8 LISTOPADA
      </div>
      <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
        DZIEŃ 39 — ${TITLE} (${READING})
      </h3>
      <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
        Dzień 39: Księga Wyjścia 8:1–32. Plagi żab, wszy i much. Bezsilność czarowników wyznających 'To jest palec Boży' oraz ochrona ziemi Goszen. Studium biblijne i quiz wiedzy.
      </p>
      <div class="flex items-center gap-3 flex-wrap">
        <a href="/akademia/kurscodzienny/dzien-39" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
          <span>Przejdź do Dnia 39</span>
          <span>→</span>
        </a>
        <a href="/akademia/kurscodzienny" class="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-300 hover:text-white text-xs font-bold transition min-h-[44px] flex items-center">
          ← Spis kursu
        </a>
      </div>
    </section>`;

d38Updated = d38Updated.replace(
  /<section class="p-6 rounded-2xl bg-\[#0E121A\] border border-brand-line text-zinc-300" id="jutro">[\s\S]*?<\/section>/,
  jutro38
);

const paths38 = [
  'akademia/kurscodzienny/dzien-38.html',
  'akademia/kurscodzienny/dzien-38/index.html',
  'kursy/kurscodzienny/dzien-38.html',
  'kursy/kurscodzienny/dzien-38/index.html'
];

for (const p of paths38) {
  const fullP = path.join(ROOT, p);
  fs.writeFileSync(fullP, d38Updated, 'utf8');
}
console.log('✅ Zaktualizowano wszystkie 4 ścieżki Dnia 38.');

console.log('🎉 Sukces! Lekcja Dnia 39 oraz aktualizacja Dnia 38 zakończone.');
