import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc';
const LESSON_29_PATH = path.join(REPO_ROOT, 'akademia', 'apokalipsa', 'lekcja-29.html');

// Template loader
const templateHtml = fs.readFileSync(LESSON_29_PATH, 'utf8');

// Data for Lesson 30
const lesson30Data = {
  num: 30,
  numStr: '30',
  title: 'UPADŁ WIELKI BABILON — TAJEMNICA SZKARŁATNEJ KOBIETY',
  subtitle: 'Apokalipsa 17:1–6 — Sąd nad wielką wszetecznicą i demaskacja duchowego zwiedzenia',
  scriptureRange: 'Apokalipsa 17:1–6; Księga Jeremiasza 51:7; Księga Rodzaju 11:1–9; Księga Izajasza 47:1–15; Apokalipsa 14:8; 18:1–5.',
  videoDuration: '1:02:15',
  videoId: 'd5T1RFHm99s',
  videoTitle: 'LEKCJA 30: UPADŁ WIELKI BABILON — TAJEMNICA SZKARŁATNEJ KOBIETY (APO 17 CZ. 1)',
  mainScripture: '„I przyszedł jeden z siedmiu aniołów, którzy mieli siedem czasz, i odezwał się do mnie, mówiąc mi: Chodź, pokażę ci sąd nad wielką nierządnicą, która siedzi nad wieloma wodami; Z którą uprawiali nierząd królowie ziemi, a mieszkańcy ziemi upili się winem jej nierządu... I widziałem kobietę pijaną krwią świętych i krwią męczenników Jezusowych”. (Apokalipsa 17:1-2.6, UBG)',
  memoryVerse: '„A na jej czole było wypisane imię: Tajemnica, wielki Babilon, matka nierządnic i obrzydliwości ziemi”. (Apokalipsa 17:5, UBG)',
  aim: 'Zdemaskować naturę duchowego Babilonu w świetle 17. rozdziału Apokalipsy, zrozumieć symbolikę szkarłatnej kobiety siedzącej na bestii oraz odkryć Boże wezwanie do zachowania czystości wiary i odrzucenia kompromisu z odstępczym systemem religijno-politycznym.',
  intro: 'Po uroczystym zwiastowaniu poselstwa Trzech Aniołów z 14. rozdziału, Apokalipsa w 17. rozdziale otwiera przed nami jeden z najbardziej przenikliwych obrazów całego Nowego Testamentu. Jan zostaje zaproszony przez jednego z aniołów, by zobaczyć „sąd nad wielką nierządnicą”. Na pustyni widzi kobietę ubraną w purpurę i szkarłat, siedzącą na szkarłatnej bestii i trzymającą złoty kielich pełen obrzydliwości. Pastor Wincenty Sieja ze Studia Dobrego Słowa (SDS) prowadzi nas przez ten rozdział ze szczególną dbałością o metodę biblijno-historyczną, ukazując, że w przeciwieństwie do czystej Niewiasty z rozdziału 12 (wiernego ludu Bożego), szkarłatna kobieta reprezentuje odstępczy Kościół, który zdradził Chrystusa dla mariażu z władzą doczesną.',
  sections: [
    {
      title: '1. Zaproszenie na pustynię — kontrast dwóch kobiet',
      text: 'Anioł prowadzi Jana w duchu na pustynię. Tam prorok widzi kobietę. W symbolice biblijnej kobieta reprezentuje Kościół — czysta niewiasta z 12. rozdziału, obleczona w słońce, to wierny lud Boży w blasku Ewangelii. W rozdziale 17 pojawia się jej całkowite przeciwieństwo: bogata, pyszna nierządnica. Nierząd w proroctwach oznacza niewierność przymierzu z Bogiem — szukanie oparcia w cesarzach, królach i systemach politycznych zamiast w Jezusie Chrystusie.'
    },
    {
      title: '2. Kobieta na bestii — sojusz religii z państwem',
      text: 'Szkarłatna kobieta nie kroczy pieszo — ona siedzi na bestii mającej siedem głów i dziesięć rogów. Bestia w proroctwach Daniela i Apokalipsy oznacza władzę świecką i państwową. Fakt, że kobieta dosiada bestii i nią kieruje, oznacza nadrzędność władzy religijnej nad państwową, manipulowanie aparatem państwowym i wykorzystywanie siły miecza do narzucania dogmatów i tępienia wolności sumienia.'
    },
    {
      title: '3. Purpura, szkarłat i złoto — zewnętrzny przepych a wewnętrzne zepsucie',
      text: 'Kobieta jest przyodziana w purpurę i szkarłat, ozdobiona złotem, drogimi kamieniami i perłami. Kolory te w starożytności i w średniowieczu były symbolami władzy królewskiej, hierarchicznej i arcykapłańskiej. Pod osłoną olśniewającej formy liturgicznej, bogactwa i splendoru kryje się jednak „złoty kielich pełen obrzydliwości i nieczystości jej nierządu” — zniekształcenie Prawa Bożego i tradycje zastępujące Słowo.'
    },
    {
      title: '4. Matka nierządnic — globalny charakter odstępstwa',
      text: 'Napis na jej czole głosi: „Tajemnica, wielki Babilon, matka nierządnic i obrzydliwości ziemi”. Określenie „matka” wskazuje, że system ten wydał córki — inne społeczności i ruchy, które choć formalnie opuściły Babilon, przyjęły jego fałszywe założenia, kompromisy ze światem i autorytet ludzki ponad nakaz Boga.'
    },
    {
      title: '5. Pijana krwią świętych — historia prześladowań',
      text: 'Jan widzi kobietę „pijaną krwią świętych i krwią męczenników Jezusowych”. To jeden z najbardziej wstrząsających rysów proroctwa. System ten przez stulecia prześladował tych, którzy woleli ponieść śmierć na stosie lub w lochach inkwizycji, niż wyrzec się czystości Pisma Świętego. Apostoł Jan patrzy na nią z „wielkim zdziwieniem”, widząc, że to nie pogański Rzym, lecz system mieniący się chrześcijańskim przelewa krew sług Chrystusa.'
    },
    {
      title: '6. Boże wezwanie do wyjścia: Ratunek z Babilonu',
      text: 'Demaskacja Babilonu w 17. rozdziale nie służy potępianiu ludzi, lecz otwarciu oczu. W Babilonie przebywa wielu szczerych, bogobojnych ludzi, którzy nie znają całej prawdy. Dlatego Bóg w 18. rozdziale kieruje do nich najgorętszy apel miłości: „Wyjdźcie z niego, ludu mój, abyście nie byli uczestnikami jego grzechów i aby was nie dotknęły jego plagi”.'
    }
  ],
  danielApok: 'W Księdze Daniela 7 mały róg ma „oczy jak człowiek i usta mówiące zuchwałe rzeczy” oraz „zamierza zmienić czasy i prawo” (Dn 7:25). W Apokalipsie 17 mały róg i pierwsza bestia z rozdziału 13 pojawiają się pod postacią kobiety jadącej na bestii. To ta sama uzurpatorska siła religijno-polityczna, która odwraca uwagę ludzi od jedynego Orędownika w niebie, Jezusa Chrystusa.',
  history: 'Historycznie Babilon nad Eufratem upadł w 539 r. p.n.e. przez odwrócenie wód rzeki przez Cyrusa. Duchowy Babilon Apokalipsy siedzi „nad wieloma wodami”, które anioł wyjaśnia jako „ludy, tłumy, narody i języki” (Ap 17:15). Proroctwo to wypełniło się precyzyjnie w rozwoju średniowiecznego papiestwa i jego dominacji nad monarchiami Europy, a w czasach ostatecznych wskazuje na ekumeniczny sojusz religijny odrzucający dekalog Boga.',
  jesusInCenter: 'W obliczu przerażającej potęgi szkarłatnej kobiety i jej zwiedzenia, Jan widzi, że jej los jest już przesądzony — to „sąd nad wielką nierządnicą”. Chrystus nie zostawia nas bezbronnych. On jest jedynym prawdziwym Oblubieńcem Kościoła, który oddał swoje życie na krzyżu za swój lud. Jezus demaskuje fałsz nie po to, by nas przerazić, ale aby nas wyrwać z niewoli ludzkich tradycji i doprowadzić do bezpiecznej przystani Bożej łaski i prawdy.',
  crossRefs: [
    { ref: 'Ap 17:1–2', desc: 'Anioł zaprasza Jana na oglądanie sądu nad wielką nierządnicą' },
    { ref: 'Ap 17:3–6', desc: 'Kobieta na szkarłatnej bestii, ubrana w purpurę i piana krwią świętych' },
    { ref: 'Ap 17:15', desc: 'Wody, nad którymi siedzi nierządnica, to ludy, tłumy, narody i języki' },
    { ref: 'Jer 51:7', desc: 'Babilon był złotym kielichem w ręku Pana, upajającym całą ziemię' },
    { ref: 'Iz 47:1–11', desc: 'Upadek pysznej królowej Babilonu, która mówiła: \'Ja jestem i nie ma żadnej innej\'' },
    { ref: 'Ap 18:1–4', desc: 'Zstąpienie anioła chwały i ostateczne wezwanie: \'Wyjdźcie z niego, mój ludu\'' }
  ],
  personalApp: 'Czy w twoim życiu Jezus Chrystus jest jedynym Pasterzem i jedynym Autorytetem sumienia? Szkarłatna kobieta mami bogactwem, splendorem i łatwą religią kompromisu. Prawdziwe chrześcijaństwo wymaga jednak stanięcia po stronie wzgardzonej prawdy Pisma Świętego. Dziś Jezus wzywa Cię do osobistej wierności Jego Słowu.',
  questions: [
    'Jaki jest zasadniczy kontrast między Niewiastą z Apokalipsy 12 a kobietą z rozdziału 17?',
    'Co w proroctwach biblijnych oznacza kobieta dosiadająca bestii?',
    'Czym jest \'złoty kielich pełen obrzydliwości\' i jakie nauki reprezentuje wino Babilonu?',
    'Dlaczego Jan tak bardzo zdziwił się na widok kobiety pijanej krwią męczenników?',
    'Do kogo skierowane jest wezwanie z Apokalipsy 18:4 i jaki jest jego cel?'
  ],
  quiz: [
    {
      q: 'Kogo w symbolice biblijnej reprezentuje czysta kobieta, a kogo kobieta uprawiająca nierząd?',
      opts: [
        'Czysta kobieta to Maryja, a nierządnica to pogański Rzym.',
        'Czysta kobieta reprezentuje wierny Kościół Boży, a nierządnica odstępczy Kościół w sojuszu z władzą świecką.',
        'Obie kobiety oznaczają literalne miasta na Bliskim Wschodzie.',
        'Kobiety te nie mają żadnego znaczenia symbolicznego.'
      ],
      correct: 1,
      explain: 'W symbolice biblijnej czysta niewiasta (Ap 12) reprezentuje wierny lud Boży związany przymierzem z Bogiem, natomiast nierządnica (Ap 17) to odstępcza społeczność religijna zdradzająca Boga dla sojuszu ze światem.'
    },
    {
      q: 'Co oznacza, że szkarłatna kobieta siedzi na bestii?',
      opts: [
        'Oznacza to, że zwierzęta będą czczone w czasach ostatecznych.',
        'Oznacza dominację władzy religijnej nad aparatem państwowym i świeckim.',
        'Wskazuje na podróż apostołów do Rzymu.',
        'Oznacza upadek wszystkich religii na rzecz ateizmu.'
      ],
      correct: 1,
      explain: 'Bestia w proroctwach to władza polityczno-państwowa. Ujeżdżanie bestii przez kobietę symbolizuje kontrolę i sterowanie aparatem władzy państwowej przez instytucję religijną.'
    },
    {
      q: 'Dlaczego Jan był głęboko zdumiony widokiem szkarłatnej kobiety?',
      opts: [
        'Ponieważ była niezwykle piękna.',
        'Gdyż widział, że system podający się za chrześcijański przelewa krew prawdziwych naśladowców Jezusa.',
        'Ponieważ bestia mówiła ludzkim głosem.',
        'Dlatego, że pustynia zamieniła się w ogród.'
      ],
      correct: 1,
      explain: 'Jana nie dziwiło prześladowanie ze strony pogańskiego cesarstwa rzymskiego, ale widok zorganizowanego systemu mieniącego się Kościołem, który pije krew męczenników Jezusowych, wprawił go w osłupienie.'
    }
  ],
  prevLesson: 29,
  nextLesson: 31
};

// Data for Lesson 31
const lesson31Data = {
  num: 31,
  numStr: '31',
  title: 'ÓSMY KRÓL — PRZEPOWIEDNIA DLA NASZYCH CZASÓW',
  subtitle: 'Apokalipsa 17:7–18 — Tajemnica zwierzęcia, które było, nie ma go i znowu będzie',
  scriptureRange: 'Apokalipsa 17:7–18; Księga Daniela 7:7–25; Apokalipsa 13:1–3; Apokalipsa 19:11–21.',
  videoDuration: '1:08:40',
  videoId: 'lVMH5oal_04',
  videoTitle: 'LEKCJA 31: ÓSMY KRÓL — PRZEPOWIEDNIA DLA NASZYCH CZASÓW (APO 17 CZ. 2)',
  mainScripture: '„I powiedział mi anioł: Dlaczego się zdziwiłeś? Ja ci wyjaśnię tajemnicę kobiety i bestii, która ją nosi, a ma siedem głów i dziesięć rogów. Bestia, którą widziałeś, była i nie ma jej, i ma wyjść z otchłani, i pójść na zatracenie... A bestia, która była, a nie ma jej, jest sama ósmym, i jest z tych siedmiu, i idzie na zatracenie. Będą oni walczyć z Barankiem, a Baranek ich zwycięży, bo jest Panem panów i Królem królów”. (Apokalipsa 17:7-8.11.14, UBG)',
  memoryVerse: '„Będą oni walczyć z Barankiem, a Baranek ich zwycięży, bo jest Panem panów i Królem królów, a ci, którzy są z nim, są powołani, wybrani i wierni”. (Apokalipsa 17:14, UBG)',
  aim: 'Rozszyfrować tajemnicę Siedmiu Głów i Ósmego Króla z 17. rozdziału Apokalipsy, zrozumieć etapy walki bestii przeciwko prawdzie Bożej oraz umocnić wiarę w ostateczny, chwalebny triumf Jezusa Chrystusa — Króla królów i Pana panów.',
  intro: 'W 31. odcinku z serii „Apokalipsa – Księga Nadziei” pastor Wincenty Sieja i Studio Dobrego Słowa (SDS) mierzą się z jednym z najbardziej fascynujących i dyskutowanych proroctw Pisma Świętego. Kim jest tajemniczy „Ósmy Król”, o którym mówi anioł Janowi? Dlaczego natchniony tekst aż trzykrotnie powtarza zagadkową formułę: „Bestia BYŁA i NIE MA JEJ, i ZNOWU BĘDZIE”? Zamiast sensacyjnych teorii oderwanych od realiów, otrzymujemy spójną, logiczną i w 100% biblijną analizę, która ukazuje bieg imperiów, śmiertelną ranę i jej zagojenie oraz nieuchronny finał: Baranek zwycięży wszystkich wrogów prawdy, a Jego lud wejdzie do wiecznego Królestwa.',
  sections: [
    {
      title: '1. Wyjaśnienie anioła — klucz do tajemnicy',
      text: 'Gdy Jan spogląda z przerażeniem na kobietę i bestię, anioł zadaje pytanie: „Dlaczego się zdziwiłeś? Ja ci wyjaśnię tajemnicę kobiety i bestii”. Bóg nie zostawia proroctw w sferze domysłów. Biblia sama interpretuje własne symbole: „Siedem głów to siedem gór, na których siedzi kobieta. I jest siedmiu królów: pięciu upadło, jeden jest, inny jeszcze nie przyszedł, a gdy przyjdzie, ma pozostać na krótki czas” (Ap 17:9–10).'
    },
    {
      title: '2. Bestia, która była, nie ma jej i znowu będzie — trzy fazy',
      text: 'Trzykrotne powtórzenie formuły „była, nie ma jej i znowu będzie” (Ap 17:8.11) to proroctwo trzech epok w historii odstępczej potęgi: 1) Faza potęgi („była” — dominacja w wiekach średnich przez 1260 lat); 2) Faza uśpienia („nie ma jej” — ugodzenie śmiertelną raną w 1798 roku i utrata władzy doczesnej); 3) Faza odrodzenia („znowu będzie / wyjdzie z otchłani” — uleczenie rany, odzyskanie globalnego wpływu i wejście w sojusz czasów końca).'
    },
    {
      title: '3. Siedem królestw a bieg historii zbawienia',
      text: 'Siedem głów to wielkie mocarstwa prześladujące lud Boży na przestrzeni dziejów. Z perspektywy Jana: pięć upadło przed jego epoką (Egipt, Asyria, Babilon, Medo-Persja, Grecja), jeden jest współcześnie z Janem (Pogański Rzym), kolejny przyjdzie na krótki czas i ulegnie transformacji w fazę papieską.'
    },
    {
      title: '4. Kim jest Ósmy Król?',
      text: '„A bestia, która była, a nie ma jej, jest sama ósmym, i jest z tych siedmiu, i idzie na zatracenie” (Ap 17:11). Ósmy król nie jest nową postacią z kosmosu ani kolejnym świeckim imperium. To ta sama bestia w swojej zmartwychwstałej, ostatecznej fazie globalnego panowania. Działa pod pozorem pokoju i uniwersalnej moralności, ale w istocie jednoczy świat w buncie przeciwko Barankowi i Jego Prawu.'
    },
    {
      title: '5. Dziesięć rogów i jedna godzina władzy',
      text: 'Dziesięć rogów to przywódcy polityczni ziemi czasów ostatecznych, którzy „mają jeden zamysł i oddadzą swoją moc i władzę bestii” (Ap 17:13). Na symboliczną „jedną godzinę” dojdzie do bezprecedensowego zjednoczenia sił politycznych i religijnych w walce przeciwko Słowu Bożemu.'
    },
    {
      title: '6. Triumf Baranka i Jego wybranych (Apokalipsa 17:14)',
      text: 'Punktem kulminacyjnym całego 17. rozdziału jest werset 14: „Będą oni walczyć z Barankiem, a Baranek ich zwycięży, bo jest Panem panów i Królem królów, a ci, którzy są z nim, są powołani, wybrani i wierni”. Zwycięstwo nie należy do bestii, technologii ani ziemskich koalicji. Zwycięstwo należy do Chrystusa, a Jego lud uczestniczy w Jego chwale.'
    }
  ],
  danielApok: 'W Księdze Daniela 2 wielki posąg kończy się uderzeniem kamienia w stopy z żelaza i gliny — to moment powrotu Chrystusa niszczący wszelkie ziemskie potęgi. W Apokalipsie 17 Ósmy Król i sprzymierzone z nim rogi idą bezpośrednio „na zatracenie” w zderzeniu z Barankiem. Proroctwo uczy, że żaden ludzki reżim nie przetrwa Bożego sądu.',
  history: 'Ugodzenie bestii śmiertelną raną nastąpiło w 1798 r. podczas rewolucji francuskiej (uwięzienie papieża Piusa VI przez gen. Berthiera). Od tego momentu świat sądził, że rządy te nigdy nie powrócą. Proroctwo zapowiedziało jednak: \'rana została uleczona, a cała ziemia szła w podziwie za bestią\' (Ap 13:3). Odnowienie wpływów na arenie międzynarodowej w XX i XXI wieku jest naocznym dowodem prawdziwości natchnionych słów Biblii.',
  jesusInCenter: 'Apokalipsa 17:14 to serce Ewangelii czasów ostatecznych: „Baranek ich zwycięży, bo jest Panem panów i Królem królów”. Jezus nie zwycięża brutalną siłą nienawiści, lecz mocą swojej Ofiary, prawdy i sprawiedliwości. Zbawiciel zapewnia każdego wierzącego: jeśli trwasz przy Nim, jesteś bezpieczny. Jesteś po stronie zwycięzcy.',
  crossRefs: [
    { ref: 'Ap 17:7–8', desc: 'Anioł wyjaśnia Janowi tajemnicę bestii, która była, nie ma jej i znowu przyjdzie' },
    { ref: 'Ap 17:9–11', desc: 'Siedem głów, siedmiu królów i ósmy król, który idzie na zatracenie' },
    { ref: 'Ap 17:12–14', desc: 'Dziesięć rogów, jedna godzina przymierza i zwycięstwo Baranka' },
    { ref: 'Ap 17:15–18', desc: 'Wody jako narody i nagły zwrot rogów przeciwko nierządnicy' },
    { ref: 'Dn 7:23–27', desc: 'Ostatnie królestwo ziemi, sąd Boży i przekazanie wiecznego królestwa świętym Najwyższego' },
    { ref: 'Ap 19:11–16', desc: 'Chrystus na białym koniu jako Król królów i Pan panów' }
  ],
  personalApp: 'Czy w twoim sercu panuje spokój w obliczu niepokojących wydarzeń na świecie? Proroctwo 17. rozdziału Apokalipsy zostało dane, abyś wiedział, jak zakończy się historia. Nie musisz się bać globalnych kryzysów ani zwiedzenia, jeśli stoisz przy Jezusie. Twoim powołaniem jest być „powołanym, wybranym i wiernym”.',
  questions: [
    'Co oznacza biblijne sformułowanie: \'Bestia była, nie ma jej i znowu będzie\'?',
    'W jaki sposób Pismo Święte definiuje siedem głów z Apokalipsy 17?',
    'Kim według analizy biblijno-historycznej jest tajemniczy Ósmy Król?',
    'Jakie mocarstwa reprezentują dziesięć rogów i czym zakończy się ich sojusz z bestią?',
    'Co to w praktyce oznacza dla wierzącego być \'powołanym, wybranym i wiernym\' w myśl Apokalipsy 17:14?'
  ],
  quiz: [
    {
      q: 'Co oznacza, że bestia \'była, nie ma jej i znowu będzie\'?',
      opts: [
        'To mitologiczna zagadka bez odniesienia do historii.',
        'Wskazuje na trzy fazy: dominację w średniowieczu, utratę władzy po 1798 r. (rana) oraz odrodzenie w czasach końca.',
        'Dotyczy trzech różnych planet.',
        'Oznacza rządy trzech rzymskich cesarzy z I wieku.'
      ],
      correct: 1,
      explain: 'Trzy fazy bestii precyzyjnie opisują jej 1260-letnią potęgę (była), ugodzenie śmiertelną raną w 1798 r. (nie ma jej) oraz uleczenie rany i globalne odrodzenie w czasach końca (znowu będzie).'
    },
    {
      q: 'Jaki jest ostateczny rezultat walki królów ziemi z Barankiem wg Apokalipsy 17:14?',
      opts: [
        'Ziemia zostanie całkowicie zniszczona i nikt nie ocaleje.',
        'Baranek ich zwycięży, bo jest Panem panów i Królem królów, a Jego lud jest wierny.',
        'Bestia zapanuje na zawsze nad wszechświatem.',
        'Królowie ziemi zawrą wieczny pokój bez udziału Boga.'
      ],
      correct: 1,
      explain: 'Apokalipsa 17:14 jednoznacznie ogłasza: \'Baranek ich zwycięży, bo jest Panem panów i Królem królów, a ci, którzy są z nim, są powołani, wybrani i wierni\'.'
    },
    {
      q: 'Jakie trzy cechy charakteryzują lud stojący przy Baranku w finale historii?',
      opts: [
        'Bogaci, wpływowi i wykształceni.',
        'Powołani, wybrani i wierni.',
        'Agresywni, walczący mieczem i bezkompromisowi.',
        'Obojętni na doktrynę i tolerancyjni wobec każdego grzechu.'
      ],
      correct: 1,
      explain: 'Słowo Boże wskazuje: \'ci, którzy są z nim, są powołani, wybrani i wierni\' — to ludzie, którzy odpowiedzieli na Boże powołanie, trwają w Jego łasce i zachowują bezwzględną wierność prawdzie.'
    }
  ],
  prevLesson: 30,
  nextLesson: null
};

function renderLessonHtml(data) {
  let html = templateHtml;

  // Replacements in header / meta
  html = html.replace(/<title>.*?<\/title>/, `<title>Lekcja ${data.num}: ${data.title} | Apokalipsa – Księga Nadziei | LUMINA Bible Academy</title>`);
  html = html.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="https://polskieradio.cc/akademia/apokalipsa/lekcja-${data.numStr}" />`);
  html = html.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="https://polskieradio.cc/akademia/apokalipsa/lekcja-${data.numStr}" />`);
  html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="Lekcja ${data.num}: ${data.title} | Apokalipsa – Księga Nadziei" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${data.aim}" />`);
  html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${data.aim}" />`);

  // Badge & step
  html = html.replace(/<span>Lekcja \d+ \/ \d+<\/span>/g, `<span>Lekcja ${data.num} / 31</span>`);
  html = html.replace(/<span class="text-amber-400 font-bold">Lekcja \d+ z \d+<\/span>/, `<span class="text-amber-400 font-bold">Lekcja ${data.num} z 31</span>`);
  html = html.replace(/<span class="text-zinc-400 text-xs font-semibold">Lekcja \d+ z \d+ • Studio Dobrego Słowa<\/span>/, `<span class="text-zinc-400 text-xs font-semibold">Lekcja ${data.num} z 31 • Studio Dobrego Słowa</span>`);
  html = html.replace(/<span>Apokalipsa – Księga Nadziei • Lekcja \d+ z \d+<\/span>/, `<span>Apokalipsa – Księga Nadziei • Lekcja ${data.num} z 31</span>`);

  // Breadcrumb prev/next
  const breadcrumbNav = `
        <a href="/akademia/apokalipsa/lekcja-${data.prevLesson}" class="cin-nav-prev text-xs py-1.5 px-3 min-h-[34px]">← Lekcja ${data.prevLesson}</a>
        ${data.nextLesson ? `<a href="/akademia/apokalipsa/lekcja-${data.nextLesson}" class="cin-nav-next text-xs py-1.5 px-3 min-h-[34px]">Lekcja ${data.nextLesson} →</a>` : ''}
  `;
  html = html.replace(/<div class="flex items-center gap-2">\s*<a href="\/akademia\/apokalipsa\/lekcja-\d+" class="cin-nav-prev.*?<\/div>/s, `<div class="flex items-center gap-2">${breadcrumbNav}</div>`);

  // Title & Subtitle
  html = html.replace(/<h1 class="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-3 leading-tight">\s*[\s\S]*?<\/h1>/, `<h1 class="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-3 leading-tight">\n      ${data.title}\n    </h1>`);
  html = html.replace(/<p class="text-amber-200\/90 font-serif italic text-base sm:text-lg mb-6 leading-relaxed">.*?<\/p>/, `<p class="text-amber-200/90 font-serif italic text-base sm:text-lg mb-6 leading-relaxed">${data.subtitle}</p>`);

  // Meta bar
  html = html.replace(/<div><span class="text-zinc-500">Zakres biblijny:<\/span> <strong class="text-amber-300 font-mono">.*?<\/strong><\/div>/, `<div><span class="text-zinc-500">Zakres biblijny:<\/span> <strong class="text-amber-300 font-mono">${data.scriptureRange}</strong></div>`);
  html = html.replace(/<div><span class="text-zinc-500">Wideo:<\/span> <strong class="text-white">.*?<\/strong><\/div>/, `<div><span class="text-zinc-500">Wideo:<\/span> <strong class="text-white">${data.videoDuration}</strong></div>`);

  // Video embed
  html = html.replace(/src="https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+\?rel=0&modestbranding=1"/, `src="https://www.youtube.com/embed/${data.videoId}?rel=0&modestbranding=1"`);
  html = html.replace(/title="LEKCJA \d+:.*?"/, `title="${data.videoTitle}"`);

  // Section 1: Title & range
  const s1Html = `
      <h2 class="reader-section-title">
        <span class="reader-step-num">1</span>
        <span>Tytuł i zakres biblijny</span>
      </h2>
      <div class="reader-prose">
        <p class="font-serif text-lg sm:text-xl text-white font-bold leading-relaxed mb-2">${data.title}</p>
        <p class="text-amber-300 text-sm font-mono flex items-center gap-2">
          <span>📖 Zakres biblijny:</span>
          <strong>${data.scriptureRange}</strong>
        </p>
      </div>`;
  html = html.replace(/<!-- 1\. Tytuł i zakres biblijny -->\s*<section class="reader-section">[\s\S]*?<\/section>/, `<!-- 1. Tytuł i zakres biblijny -->\n    <section class="reader-section">${s1Html}\n    </section>`);

  // Section 2: Main Scripture
  const s2Html = `
      <h2 class="reader-section-title">
        <span class="reader-step-num">2</span>
        <span>Tekst główny</span>
      </h2>
      <div class="p-6 sm:p-8 rounded-2xl bg-[#0b0e15] border-l-4 border-amber-400 border-y border-r border-amber-500/20 shadow-xl my-2">
        <div class="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
          <i class="fa-solid fa-book-bible"></i>
          <span>Słowo Boże (Pismo Święte)</span>
        </div>
        <blockquote class="font-bible text-lg sm:text-xl text-amber-100/95 leading-relaxed italic">
          ${data.mainScripture}
        </blockquote>
      </div>`;
  html = html.replace(/<!-- 2\. Tekst główny -->\s*<section class="reader-section">[\s\S]*?<\/section>/, `<!-- 2. Tekst główny -->\n    <section class="reader-section">${s2Html}\n    </section>`);

  // Section 3: Memory Verse
  const s3Html = `
      <h2 class="reader-section-title">
        <span class="reader-step-num">3</span>
        <span>Tekst pamięciowy</span>
      </h2>
      <div class="p-6 rounded-2xl bg-gradient-to-r from-amber-500/12 via-amber-500/5 to-transparent border border-amber-500/35 relative overflow-hidden shadow-lg">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-xs font-bold uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
            <i class="fa-solid fa-bookmark text-amber-400"></i> Werset do zapamiętania
          </span>
        </div>
        <blockquote class="font-bible text-base sm:text-lg text-amber-200 font-medium italic leading-relaxed">
          ${data.memoryVerse}
        </blockquote>
      </div>`;
  html = html.replace(/<!-- 3\. Tekst pamięciowy -->\s*<section class="reader-section">[\s\S]*?<\/section>/, `<!-- 3. Tekst pamięciowy -->\n    <section class="reader-section">${s3Html}\n    </section>`);

  // Section 4: Aim
  const s4Html = `
      <h2 class="reader-section-title">
        <span class="reader-step-num">4</span>
        <span>Cel lekcji</span>
      </h2>
      <div class="p-5 rounded-xl bg-[#0b0f19] border border-white/5 text-zinc-200 text-sm sm:text-base leading-relaxed">
        <div class="flex items-start gap-3">
          <span class="text-amber-400 text-lg mt-0.5">🎯</span>
          <div>${data.aim}</div>
        </div>
      </div>`;
  html = html.replace(/<!-- 4\. Cel lekcji -->\s*<section class="reader-section">[\s\S]*?<\/section>/, `<!-- 4. Cel lekcji -->\n    <section class="reader-section">${s4Html}\n    </section>`);

  // Section 5: Intro
  const s5Html = `
      <h2 class="reader-section-title">
        <span class="reader-step-num">5</span>
        <span>Wprowadzenie</span>
      </h2>
      <div class="reader-prose text-zinc-300 text-base sm:text-lg leading-relaxed space-y-4">
        ${data.intro}
      </div>`;
  html = html.replace(/<!-- 5\. Wprowadzenie -->\s*<section class="reader-section">[\s\S]*?<\/section>/, `<!-- 5. Wprowadzenie -->\n    <section class="reader-section">${s5Html}\n    </section>`);

  // Section 6: Steps
  let s6StepsHtml = '';
  data.sections.forEach((s, idx) => {
    s6StepsHtml += `
        <div class="mb-8 p-6 sm:p-7 rounded-2xl bg-[#0c1018] border border-white/10 hover:border-amber-500/30 transition-all shadow-md">
          <h3 class="font-serif font-bold text-white text-lg sm:text-xl mb-3 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono flex items-center justify-center shrink-0">${idx + 1}</span>
            <span>${s.title}</span>
          </h3>
          <div class="text-zinc-200 text-sm sm:text-base leading-relaxed pl-1 sm:pl-9">${s.text}</div>
        </div>`;
  });
  const s6Html = `
      <h2 class="reader-section-title">
        <span class="reader-step-num">6</span>
        <span>Studium biblijne krok po kroku</span>
      </h2>
      <div class="space-y-4">${s6StepsHtml}
      </div>`;
  html = html.replace(/<!-- 6\. Studium biblijne krok po kroku -->\s*<section class="reader-section">[\s\S]*?<\/section>/, `<!-- 6. Studium biblijne krok po kroku -->\n    <section class="reader-section">${s6Html}\n    </section>`);

  // Section 7: Daniel & Apocalypse
  const s7Html = `
      <h2 class="reader-section-title">
        <span class="reader-step-num">7</span>
        <span>Daniel i Apokalipsa</span>
      </h2>
      <div class="p-6 sm:p-7 rounded-2xl bg-[#090d16] border border-blue-500/25 relative overflow-hidden shadow-lg">
        <div class="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">
          <i class="fa-solid fa-scroll"></i>
          <span>Klucz proroczy: Daniel & Apokalipsa</span>
        </div>
        <div class="text-zinc-200 text-sm sm:text-base leading-relaxed space-y-3">
          <p>${data.danielApok}</p>
        </div>
      </div>`;
  html = html.replace(/<!-- 7\. Daniel i Apokalipsa -->\s*<section class="reader-section">[\s\S]*?<\/section>/, `<!-- 7. Daniel i Apokalipsa -->\n    <section class="reader-section">${s7Html}\n    </section>`);

  // Section 8: History
  const s8Html = `
      <h2 class="reader-section-title">
        <span class="reader-step-num">8</span>
        <span>Perspektywa historyczna</span>
      </h2>
      <div class="p-6 rounded-2xl bg-[#0f121a] border-l-4 border-zinc-500 border-y border-r border-zinc-800 shadow-md">
        <div class="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
          <i class="fa-solid fa-landmark"></i>
          <span>Tło historyczne i kontekst epoki</span>
        </div>
        <div class="text-zinc-300 text-sm sm:text-base leading-relaxed italic space-y-3">
          <p>${data.history}</p>
        </div>
      </div>`;
  html = html.replace(/<!-- 8\. Perspektywa historyczna -->\s*<section class="reader-section">[\s\S]*?<\/section>/, `<!-- 8. Perspektywa historyczna -->\n    <section class="reader-section">${s8Html}\n    </section>`);

  // Section 9: Jesus in Center
  const s9Html = `
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1c160c] via-[#120f09] to-[#07090e] border-2 border-amber-500/50 shadow-2xl relative overflow-hidden">
        <div class="absolute -right-6 -bottom-6 text-9xl text-amber-500/5 select-none pointer-events-none font-serif">✝</div>
        <div class="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-amber-300 mb-3">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/80 animate-pulse"></span>
          <span class="font-display">✝ SERCE CAŁEGO PROROCTWA</span>
        </div>
        <h2 class="font-serif text-2xl sm:text-3xl font-bold text-white mb-4">JEZUS W CENTRUM</h2>
        <div class="font-bible text-base sm:text-lg text-amber-100/95 leading-relaxed space-y-3">
          <p>${data.jesusInCenter}</p>
        </div>
      </div>`;
  html = html.replace(/<!-- 9\. JEZUS W CENTRUM \(KORONA LEKCJI\) -->\s*<section class="reader-section">[\s\S]*?<\/section>/, `<!-- 9. JEZUS W CENTRUM (KORONA LEKCJI) -->\n    <section class="reader-section">${s9Html}\n    </section>`);

  // Section 10: Cross references
  let s10RefsHtml = '';
  data.crossRefs.forEach(r => {
    s10RefsHtml += `
        <li class="p-3.5 rounded-xl bg-[#0b0e15] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-amber-500/30 transition-colors">
          <div class="flex items-center gap-2.5">
            <span class="text-amber-400 text-sm">📖</span>
            <span class="font-bold text-amber-200 font-mono text-sm">${r.ref}</span>
            <span class="text-zinc-400 text-xs sm:text-sm">— ${r.desc}</span>
          </div>
          <a href="/mojabiblia" target="_blank" rel="noopener" class="text-xs text-brand-gold hover:underline font-semibold shrink-0 flex items-center gap-1 self-end sm:self-auto">
            <span>Otwórz w MojaBiblia</span>
            <span>↗</span>
          </a>
        </li>`;
  });
  const s10Html = `
      <h2 class="reader-section-title">
        <span class="reader-step-num">10</span>
        <span>Sprawdź w Biblii</span>
      </h2>
      <ul class="space-y-2.5">${s10RefsHtml}
      </ul>`;
  html = html.replace(/<!-- 10\. SPRAWDŹ W BIBLII -->\s*<section class="reader-section">[\s\S]*?<\/section>/, `<!-- 10. SPRAWDŹ W BIBLII -->\n    <section class="reader-section">${s10Html}\n    </section>`);

  // Section 11: Personal App
  const s11Html = `
      <h2 class="reader-section-title">
        <span class="reader-step-num">11</span>
        <span>Zastosowanie osobiste</span>
      </h2>
      <div class="reader-application-card">
        <div class="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
          <i class="fa-solid fa-heart"></i>
          <span>Dla mojego serca i życia</span>
        </div>
        <div class="font-serif italic text-zinc-200 text-base sm:text-lg leading-relaxed space-y-3">
          ${data.personalApp}
        </div>
      </div>`;
  html = html.replace(/<!-- 11\. Zastosowanie osobiste -->\s*<section class="reader-section">[\s\S]*?<\/section>/, `<!-- 11. Zastosowanie osobiste -->\n    <section class="reader-section">${s11Html}\n    </section>`);

  // Section 12: Questions
  let s12QuestionsHtml = '';
  data.questions.forEach((q, idx) => {
    s12QuestionsHtml += `
        <li class="p-4 rounded-xl bg-[#0b0f19] border border-white/5 flex items-start gap-3.5">
          <span class="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">${idx + 1}</span>
          <span class="text-zinc-200 text-sm sm:text-base leading-relaxed">${q}</span>
        </li>`;
  });
  const s12Html = `
      <h2 class="reader-section-title">
        <span class="reader-step-num">12</span>
        <span>Pytania do studium</span>
      </h2>
      <ol class="space-y-3">${s12QuestionsHtml}
      </ol>`;
  html = html.replace(/<!-- 12\. Pytania do studium -->\s*<section class="reader-section">[\s\S]*?<\/section>/, `<!-- 12. Pytania do studium -->\n    <section class="reader-section">${s12Html}\n    </section>`);

  // Section 13: Quiz
  let s13QuizHtml = '';
  data.quiz.forEach((qz, idx) => {
    const qid = idx + 1;
    let optsHtml = '';
    qz.opts.forEach((opt, optIdx) => {
      optsHtml += `
            <button type="button" class="quiz-option-btn" onclick="handleQuizAnswer(${qid}, ${optIdx}, ${qz.correct})">
              <span class="quiz-opt-icon">○</span>
              <span>${opt}</span>
            </button>`;
    });
    s13QuizHtml += `
          <div class="quiz-card" id="quiz-card-${qid}">
            <div class="quiz-card-header">
              <span class="quiz-badge">Pytanie ${qid} z ${data.quiz.length}</span>
              <button type="button" class="quiz-reset-btn" onclick="resetQuizQuestion(${qid})" title="Zresetuj to pytanie">
                <i class="fa-solid fa-rotate-right"></i>
              </button>
            </div>
            <p class="quiz-question">${qz.q}</p>
            <div class="quiz-options-list">${optsHtml}
            </div>
            <div class="quiz-feedback-box" id="quiz-feedback-${qid}">
              <div class="quiz-feedback-title" id="quiz-feedback-title-${qid}"></div>
              <p class="quiz-feedback-text">${qz.explain}</p>
            </div>
          </div>`;
  });
  const s13Html = `
      <h2 class="reader-section-title">
        <span class="reader-step-num">13</span>
        <span>Quiz z odpowiedziami</span>
      </h2>
      <div class="quiz-container">${s13QuizHtml}
      </div>`;
  html = html.replace(/<!-- 13\. Quiz z odpowiedziami -->\s*<section class="reader-section">[\s\S]*?<\/section>/, `<!-- 13. Quiz z odpowiedziami -->\n    <section class="reader-section">${s13Html}\n    </section>`);

  // Navigation finish box
  const finishBox = `
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <span>✦</span>
          <span>Apokalipsa – Księga Nadziei • Lekcja ${data.num} z 31</span>
        </div>
        <h3 class="text-white font-serif font-bold text-xl sm:text-2xl mb-2">Gotowy na kolejny krok?</h3>
        <p class="text-zinc-400 text-xs sm:text-sm max-w-lg mx-auto mb-6 leading-relaxed">
          Oznacz lekcję jako ukończoną, aby zapisać swój postęp w przeglądarce i przejdź do następnego rozdziału.
        </p>
        <div class="flex items-center justify-center gap-4 flex-wrap">
          <button type="button" id="btn-complete-lesson" onclick="toggleLessonDone(${data.num})" class="btn-gold-complete min-h-[48px]">
            <span>✦</span>
            <span id="btn-complete-txt">Ukończ Tę Lekcję</span>
          </button>
          ${data.nextLesson ? `<a href="/akademia/apokalipsa/lekcja-${data.nextLesson}" class="cin-btn-primary min-h-[48px]"><span>Przejdź do Lekcji ${data.nextLesson}</span><span>→</span></a>` : `<a href="/akademia#apokalipsa" class="cin-btn-primary min-h-[48px]"><span>🎉 Zakończ Kurs</span><span>→</span></a>`}
        </div>`;
  html = html.replace(/<div class="reader-finish-box text-center py-8 px-4 sm:px-8">[\s\S]*?<\/div>\s*<\/section>/, `<div class="reader-finish-box text-center py-8 px-4 sm:px-8">${finishBox}\n      </div>\n    </section>`);

  // Bottom Navigation
  const bottomNav = `
      <a href="/akademia/apokalipsa/lekcja-${data.prevLesson}" class="cin-nav-prev" title="Lekcja ${data.prevLesson}">
        <span>←</span>
        <span>Lekcja ${data.prevLesson}</span>
      </a>

      <a href="/akademia#apokalipsa" class="cin-btn-secondary text-xs px-4 py-2 min-h-[44px]">
        <span>Wszystkie 31 Lekcji</span>
      </a>

      ${data.nextLesson 
        ? `<a href="/akademia/apokalipsa/lekcja-${data.nextLesson}" class="cin-nav-next" title="Lekcja ${data.nextLesson}"><span>Lekcja ${data.nextLesson}</span><span>→</span></a>`
        : `<a href="/akademia#apokalipsa" class="cin-nav-next text-emerald-400 font-bold"><span>🎉 Kurs Ukończony!</span></a>`
      }`;
  html = html.replace(/<nav class="cin-lesson-nav-bar" aria-label="Nawigacja pomiędzy lekcjami">[\s\S]*?<\/nav>/, `<nav class="cin-lesson-nav-bar" aria-label="Nawigacja pomiędzy lekcjami">${bottomNav}\n    </nav>`);

  // JS LESSON_ID
  html = html.replace(/const LESSON_ID = \d+;/, `const LESSON_ID = ${data.num};`);

  return html;
}

// Generate Lekcja 30
const html30 = renderLessonHtml(lesson30Data);
fs.writeFileSync(path.join(REPO_ROOT, 'akademia', 'apokalipsa', 'lekcja-30.html'), html30, 'utf8');
fs.mkdirSync(path.join(REPO_ROOT, 'akademia', 'apokalipsa', 'lekcja-30'), { recursive: true });
fs.writeFileSync(path.join(REPO_ROOT, 'akademia', 'apokalipsa', 'lekcja-30', 'index.html'), html30, 'utf8');
console.log('✅ Created lekcja-30.html and lekcja-30/index.html');

// Generate Lekcja 31
const html31 = renderLessonHtml(lesson31Data);
fs.writeFileSync(path.join(REPO_ROOT, 'akademia', 'apokalipsa', 'lekcja-31.html'), html31, 'utf8');
fs.mkdirSync(path.join(REPO_ROOT, 'akademia', 'apokalipsa', 'lekcja-31'), { recursive: true });
fs.writeFileSync(path.join(REPO_ROOT, 'akademia', 'apokalipsa', 'lekcja-31', 'index.html'), html31, 'utf8');
console.log('✅ Created lekcja-31.html and lekcja-31/index.html');

// Update Lekcja 29 next link
let html29 = fs.readFileSync(LESSON_29_PATH, 'utf8');
html29 = html29.replace(/<span>Lekcja 29 \/ 29<\/span>/g, '<span>Lekcja 29 / 31</span>');
html29 = html29.replace(/Lekcja 29 z 29/g, 'Lekcja 29 z 31');
html29 = html29.replace(/<a href="\/akademia\/apokalipsa\/lekcja-28" class="cin-nav-prev text-xs py-1.5 px-3 min-h-\[34px\]">← Lekcja 28<\/a>\s*<\/div>/, '<a href="/akademia/apokalipsa/lekcja-28" class="cin-nav-prev text-xs py-1.5 px-3 min-h-[34px]">← Lekcja 28</a>\n        <a href="/akademia/apokalipsa/lekcja-30" class="cin-nav-next text-xs py-1.5 px-3 min-h-[34px]">Lekcja 30 →</a>\n      </div>');
html29 = html29.replace(/<span>Wszystkie 29 Lekcji<\/span>/g, '<span>Wszystkie 31 Lekcji</span>');
html29 = html29.replace(/<a href="\/akademia#apokalipsa" class="cin-nav-next text-emerald-400 font-bold">\s*<span>🎉 Kurs Ukończony!<\/span>\s*<\/a>/, '<a href="/akademia/apokalipsa/lekcja-30" class="cin-nav-next" title="Lekcja 30"><span>Lekcja 30</span><span>→</span></a>');
html29 = html29.replace(/<button type="button" id="btn-complete-lesson" onclick="toggleLessonDone\(29\)" class="btn-gold-complete min-h-\[48px\]">\s*<span>✦<\/span>\s*<span id="btn-complete-txt">Ukończ Tę Lekcję<\/span>\s*<\/button>\s*<\/div>/, '<button type="button" id="btn-complete-lesson" onclick="toggleLessonDone(29)" class="btn-gold-complete min-h-[48px]">\n            <span>✦</span>\n            <span id="btn-complete-txt">Ukończ Tę Lekcję</span>\n          </button>\n          <a href="/akademia/apokalipsa/lekcja-30" class="cin-btn-primary min-h-[48px]"><span>Przejdź do Lekcji 30</span><span>→</span></a>\n        </div>');

fs.writeFileSync(LESSON_29_PATH, html29, 'utf8');
fs.writeFileSync(path.join(REPO_ROOT, 'akademia', 'apokalipsa', 'lekcja-29', 'index.html'), html29, 'utf8');
console.log('✅ Updated lekcja-29.html and lekcja-29/index.html with link to lekcja-30');
