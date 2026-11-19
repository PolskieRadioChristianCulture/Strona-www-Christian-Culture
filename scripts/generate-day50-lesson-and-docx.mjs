import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
} from 'docx';

const REPO = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const DAY_NUM = 50;
const DATE_STR = '2026-11-19';
const DATE_FORMATTED = '19 LISTOPADA 2026 R. (CZWARTEK)';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 20:1–26';
const TITLE =
  'DZIESIĘĆ PRZYKAZAŃ — PRAWO WOLNOŚCI PRZYMIERZA I OŁTARZ BOGA ŻYWEGO';
const SUBTITLE =
  'Ogłoszenie Dekalogu z wysokości Synaju: wyzwolenie jako fundament posłuszeństwa, dziesięć słów miłości Boga i bliźniego, trwoga ludu przed Bożym majestatem, rola Pośrednika oraz prosty ołtarz z ziemi i nieciosanego kamienia (Wj 20:1–26)';

const EXO20_PATH = path.join(REPO, 'data/bible/ubg-2025/EXO-020.json');
const exo20Data = JSON.parse(fs.readFileSync(EXO20_PATH, 'utf8'));
const verses = exo20Data.verses;

const v2 = verses.find((v) => v.number === 2)?.text || '';
const v3 = verses.find((v) => v.number === 3)?.text || '';
const MEMORY_VERSE_QUOTE = `${v2} ${v3}`.trim();
const MEMORY_VERSE = `„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 20:2–3 (UBG)`;

const THEME =
  'Dwudziesty rozdział Księgi Wyjścia jest moralną i duchową konstytucją Przymierza. Zanim Bóg wypowie pierwsze wymaganie, ogłasza fakt łaski: „Ja jestem PAN, twój Bóg, który cię wyprowadził z ziemi Egiptu, z domu niewoli” (Wj 20:2). Dekalog nie jest drabiną, po której niewolnik wspina się ku wolności — jest mapą życia dla narodu, który już został wyzwolony! Pierwsze cztery przykazania strzegą wyłącznej czci Boga, czystości Jego obrazu, świętości Jego imienia oraz błogosławionego rytmu pracy i szabatu. Kolejne sześć przykazań chroni rodzinę, ludzkie życie, wierność małżeńską, własność, prawdę słowa oraz czystość wewnętrznych pragnień serca. Gdy przerażony gromami lud cofa się z prośbą o pośrednika, Mojżesz wchodzi w gęsty mrok, a PAN dopowiada prawo prostego ołtarza z ziemi i nieciosanego kamienia — zapowiadając Chrystusa, który sam wypełnił Prawo, złożył za nas doskonałą ofiarę i wpisał Boże przykazania w nasze serca Duchem Świętym (Hbr 8:10; Rz 8:3–4)!';

const IMG_FILENAME = 'kc_day_50_dekalog_dziesiec_przykazan.jpg';
const IMG_REL_PATH = `images/academy/daily/${IMG_FILENAME}`;
const QUEUE_DIR = path.join(REPO, `kolejka-publikacji/kurs-codzienny/${DATE_STR}`);

// Sprawdzenie obecnosci obrazu w kolejce
const queuedImgPath = path.join(QUEUE_DIR, 'obrazy', IMG_FILENAME);
if (!fs.existsSync(queuedImgPath)) {
  throw new Error(`Brak przygotowanego obrazu Dnia 50: ${queuedImgPath}`);
}

// Budowa sekcji Pisma Swietego UBG z EXO-020.json
function buildVersesParagraphsHtml() {
  const sections = [
    {
      heading:
        'KSIĘGA WYJŚCIA 20:1–11 — Proklamacja wyzwolenia i pierwsze cztery przykazania miłości wobec Boga',
      from: 1,
      to: 11,
      extraClass: 'mb-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 20:12–17 — Sześć przykazań miłości, czci, życia, wierności i prawdy wobec bliźniego',
      from: 12,
      to: 17,
      extraClass: 'my-6 pt-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 20:18–26 — Trwoga ludu przed chwałą Bożą, próba bojaźni i prawo prostego ołtarza',
      from: 18,
      to: 26,
      extraClass: 'my-6 pt-4 pb-2 border-b border-brand-border/40',
    },
  ];

  return sections
    .map((sec) => {
      const header = `<div class="${sec.extraClass}"><h3 class="font-bold text-amber-300 text-sm">${sec.heading}</h3></div>`;
      const ps = verses
        .filter((v) => v.number >= sec.from && v.number <= sec.to)
        .map(
          (v) =>
            `<p><span class="verse-num">20:${v.number}</span> ${v.text}</p>`
        )
        .join('\n        ');
      return `${header}\n        ${ps}`;
    })
    .join('\n        ');
}

function buildVersesDocxText() {
  return verses.map((v) => `${v.number}. ${v.text}`).join('\n');
}

// ── 2. PAKIET 5 WERSJI ROZWAŻAŃ ──
const v1TtsText = `Pięćdziesiąty dzień podróży z Biblią za pan brat prowadzi nas dzisiaj prosto na szczyt góry Synaj, do dwudziestego rozdziału Księgi Wyjścia. Po dniach oczekiwania i uświęcenia w obozie rozlega się głos samego Stwórcy. Zanim jednak padnie choćby jedno słowo nakazu albo zakazu, Bóg wypowiada niezwykle poruszający wstęp: Ja jestem Pan, twój Bóg, który cię wyprowadził z ziemi Egiptu, z domu niewoli. Zatrzymajmy się nad tym zdaniem z największą uwagą. Dziesięć przykazań nie zostało ogłoszonych po to, aby zastraszeni niewolnicy próbowali zasłużyć sobie na litość Pana albo zapracować na swoją wolność. Bóg najpierw wykupił swój lud, przeniósł go przez morze i przyprowadził pod swoją górę, a dopiero później wręczył mu mapę bezpiecznego życia. Łaska jest zawsze fundamentem posłuszeństwa, a wyzwolenie zawsze poprzedza przykazanie. Kiedy słuchamy pierwszych czterech słów Dekalogu, widzimy serce Boga, który pragnie chronić naszą więź z Nim przed wszystkim, co mogłoby zniewolić duszę. Zakaz posiadania innych bogów, tworzenia rzeźbionych posągów, nadużywania świętego imienia i lekceważenia dnia szabatu nie jest ograniczeniem naszej radości, lecz tarczą przed powrotem do duchowej niewoli bożków. Bóg nazywa siebie Bogiem zazdrosnym nie z powodu ludzkiej małostkowości, ale dlatego, że miłość przymierza nie dzieli serca pomiędzy Stwórcę a martwe idole. Tysiącom tych, którzy Go miłują, okazuje niewyczerpane miłosierdzie. Następnie Pan zwraca nasz wzrok ku ludziom wokół nas: rodzicom, współmałżonkowi, sąsiadom i gościom w obrębie naszych bram. Czcij ojca i matkę, nie zabijaj, nie cudzołóż, nie kradnij, nie składaj fałszywego świadectwa i strzeż nawet ukrytych pragnień swojego serca przed chciwością. Jakże przenikliwe jest dziesiąte przykazanie! Bóg nie zatrzymuje się na zewnętrznych czynach, lecz zagląda aż do wnętrza duszy, wiedząc, że każdy grzech zaczyna się od nieuporządkowanego pragnienia. A kiedy przerażony gromami lud prosi Mojżesza o pośrednictwo, Bóg wlewa pokój przez słowa: nie bójcie się, bo Bóg przyszedł wystawić was na próbę, aby Jego bojaźń była przed wami, byście nie grzeszyli. Na koniec Pan nakazuje wznieść prosty ołtarz z ziemi albo z nieciosanych kamieni, bez dłuta i ludzkiej dumy. W Jezusie Chrystusie cała ta księga ożywa w pełni. To On wypełnił doskonale każde z dziesięciu przykazań, poniósł na krzyżu karę za nasze przekroczenia i stał się naszym jedynym Pośrednikiem przed Bogiem. Dzięki Duchowi Świętemu prawo wolności nie jest już wyryte wyłącznie na chłodnych kamiennych tablicach, lecz wpisane w żywe, wdzięczne serca wierzących. Panie Jezu, dziękujemy Ci za wolność Ewangelii i za Twoje mądre przykazania. Wpisz dzisiaj swoją prawdę w nasze myśli i czyny, strzeż nas przed wszelkimi bożkami tego świata i naucz kochać Ciebie oraz naszych bliźnich czystym sumieniem. Amen.`;

if (/[0-9]/.test(v1TtsText)) {
  throw new Error('BŁĄD STANDARD_PRODUKCYJNY: Wersja 1 TTS zawiera cyfry arabskie!');
}

const v2WebText = `📖 Z Biblią za Pan Brat — Dzień 50: DZIESIĘĆ PRZYKAZAŃ — PRAWO WOLNOŚCI PRZYMIERZA I OŁTARZ BOGA ŻYWEGO (Wj 20:1–26)

„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 20:2–3 (UBG)

Dlaczego Bóg zaczyna Dziesięć Przykazań nie od zakazów, lecz od przypomnienia o wyzwoleniu z domu niewoli? Ponieważ w Biblii łaska zawsze poprzedza prawo! Izrael nie otrzymuje Dekalogu, aby dopiero wypracować swoje ocalenie, lecz by jako odkupiony lud nauczył się żyć w prawdziwej wolności dzieci Bożych.

• Pierwsze 4 przykazania chronią wyłączną cześć Stwórcy, czystość uwielbienia, świętość Bożego imienia oraz dar odpocznienia w dniu szabatu (Wj 20:3–11).
• Kolejne 6 przykazań stawia ochronny mur wokół godności rodziny, ludzkiego życia, małżeństwa, własności, prawdy słowa oraz czystych pragnień serca (Wj 20:12–17).
• Gdy lud drży pod ciężarem Bożego majestatu, Mojżesz wskazuje na sens świętej bojaźni, a prosty ołtarz z nieciosanego kamienia bez żelaznego dłuta zapowiada dzieło Chrystusa — jedynego Pośrednika i Ołtarza Nowego Przymierza (Wj 20:18–26; Hbr 13:10).

Studiuj pełny tekst UBG, 8 kodów Stronga, 45-punktową egzegezę i quiz z 20 pytaniami:
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-50

Dołącz do wspólnoty wzrostu:
💬 https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0
Wspieraj misję Słowa: https://patronite.pl/osobowoscplus`;

const v3SmsText = `Dzień 50 (Wj 20:2-3): „Ja jestem PAN, twój Bóg, który cię wyprowadził... z domu niewoli”. Łaska daje wolność, a Dekalog strzeże naszego pokoju i miłości w Chrystusie! Dobrej nocy. polskieradio.cc`;

const v4VideoText = `[OPRAWA GRAFICZNA & MUZYCZNA]
Nowoczesne, eleganckie studio Christian Culture TV w głębokiej czerni (#000000) oraz szlachetnym złocie Champagne Gold (#C4A35A). W tle wielkoformatowa fotografia 35mm przedstawiająca dwie surowe, czyste tablice kamienne oparte o bazaltowy głaz u podnóża góry Synaj w złotym świetle brzasku. Tytuł na ekranie: „Z BIBLIĄ ZA PAN BRAT — DZIEŃ 50: DZIESIĘĆ PRZYKAZAŃ I OŁTARZ BOGA ŻYWEGO (WJ 20:1–26)”.

[INTRO: JUBILEUSZOWY 50. DZIEŃ I PROLOG ŁASKI]
Noemi: Dzień dobry! Witamy serdecznie w jubileuszowym, pięćdziesiątym dniu naszej podróży przez sześćdziesiąt sześć ksiąg Pisma Świętego! Dziś w naszym studiu zatrzymujemy się przy dwudziestym rozdziale Księgi Wyjścia — przy jednym z najważniejszych tekstów w dziejach świata.
Sara: Witaj Noemi, witamy całą wspólnotę Akademii Christian Culture! Gdy słyszymy słowa „Dziesięć Przykazań”, wielu ludzi automatycznie czuje chłód sądu, listę zakazów i ciężar moralny nie do udźwignięcia. Ale Bóg otwiera dwudziesty rozdział zupełnie inaczej — od proklamacji wyzwolenia!
Noemi: Posłuchajmy uważnie drugiego wersetu: „Ja jestem PAN, twój Bóg, który cię wyprowadził z ziemi Egiptu, z domu niewoli”. Najpierw zbawienie, najpierw wyprowadzenie z domu niewoli, najpierw opieka na orlich skrzydłach — a dopiero potem przykazania! Dekalog nie jest warunkiem wyjścia z Egiptu. Jest instrukcją wolności dla tych, którzy już zostali ocaleni!

[ANALIZA PROBLEMOWA: DWIE TABLICE MIŁOŚCI I PRZESTROGĄ SERCA]
Sara: Zobaczmy tę genialną równowagę dwóch tablic! Pierwsze cztery przykazania kierują nasz wzrok pionowo ku Bogu: brak innych bogów przed Nim, zakaz rzeźbionych posągów, szacunek dla Imienia PANA oraz pamięć o świętym dniu szabatu, w którym odpoczywa nawet sługa, gość i bydło.
Noemi: A potem sześć kolejnych przykazań buduje bezpieczną wspólnotę poziomo między ludźmi: czcij ojca i matkę, nie zabijaj, nie cudzołóż, nie kradnij, nie świadcz fałszywie i wreszcie dziesiąte — „nie będziesz pożądał”. Zauważ, Sara, że dziesiąte przykazanie sięga tam, gdzie nie sięga żaden ziemski sąd ani kamera — prosto do tajemnych pragnień ludzkiego serca!

[SŁOWO ROZKAZU: OD SYNAJU DO CHRYSTUSA]
Sara: Kiedy grzmoty i trąba rozbrzmiały nad Synajem, ludzie cofnęli się w strachu i poprosili Mojżesza o pośrednika. A na końcu rozdziału Bóg powiedział: zbudujcie mi ołtarz z ziemi albo z nieciosanego kamienia, bez użycia żelaznego narzędzia! Dlaczego bez żelaznego dłuta? Bo człowiek nie może własną rzeźbą i wysiłkiem ulepszać Bożego daru pojednania!
Noemi: I dokładnie dlatego Nowy Testament prowadzi nas pod krzyż Jezusa Chrystusa! Jezus jako jedyny bezgrzeszny Syn Boży wypełnił w stu procentach całe Prawo, wziął na siebie przekleństwo naszego nieposłuszeństwa i stał się naszym Doskonałym Pośrednikiem oraz naszym Ołtarzem. Dziś Duch Święty nie wyrywa przykazań w zimnym kamieniu, lecz wypisuje miłość Boga i bliźniego prosto na żywych tablicach naszych serc!

[ZADANIE TAKTYCZNE: CZYTAJ, WIERZ, DZIAŁAJ]
Sara: Jak więc żyć dzisiejszym Słowem?
• Czytaj: dwudziesty rozdział Księgi Wyjścia oraz piąty rozdział Ewangelii Mateusza.
• Wierz: Chrystus wypełnił za Ciebie wymagania Prawa i uwalnia Cię do posłuszeństwa z miłości.
• Działaj: spójrz dziś na Dekalog nie jak na więzienie, lecz jak na ochronę Twojego małżeństwa, pracy, prawdy i czasu dla Boga!

[MODLITWA I BŁOGOSŁAWIEŃSTWO]
Noemi: Panie Boże, nasz Wybawicielu z domu niewoli! Dziękujemy Ci za mądrość i sprawiedliwość Dziesięciu Przykazań. Przepraszamy za każde złamanie Twojej świętej woli w czynach, słowach i ukrytych pragnieniach. Dziękujemy Ci, Jezu, za Twój krzyż, na którym wziąłeś nasz dług i otworzyłeś drogę do Ojca. Wpisz dzisiaj Twoje Prawo wolności w nasze serca! Amen.
Sara: Czytaj, wierz, działaj — dla Jezusa! Do zobaczenia jutro w dwudziestym pierwszym rozdziale Księgi Wyjścia!`;

const v5ArticleText = `🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: DEKALOG Z GÓRY SYNAJ — DLACZEGO PRAWO WOLNOŚCI ZACZYNA SIĘ OD ŁASKI WYZWOLENIA? (WJ 20:1–26)
Autor: Cezary Rogowski, red. nacz. CCN News | Data publikacji: 19 listopada 2026 r.

Dwudziesty rozdział Księgi Wyjścia (Wj 20:1–26) zawiera jeden z najbardziej wpływowych tekstów etycznych i duchowych w historii ludzkości — Dziesięć Przykazań (hebr. Asaret ha-Dewarim, czyli „Dziesięć Słów”). W biblijnej teologii Przymierza Dekalog nie jest jednak zbiorem abstrakcyjnych nakazów moralnych rzuconych człowiekowi na własne siły, lecz bezpośrednią odpowiedzią ocalonego narodu na suwerenną łaskę Boga Wybawiciela.

1. Prolog Ewangelii w samym sercu Prawa (Wj 20:1–2)
Kluczem do właściwego zrozumienia całego rozdziału jest werset drugi: „Ja jestem PAN, twój Bóg, który cię wyprowadził z ziemi Egiptu, z domu niewoli” (Wj 20:2, UBG). W strukturze starożytnych traktatów przymierza suwerenny król najpierw przypominał o łaskawych czynach wybawienia dokonanych na rzecz poddanego, a dopiero potem określał zasady wiernej relacji. Bóg nie powiedział Izraelowi w Egipcie: „Zachowujcie dziesięć przykazań, a wtedy was wyzwolę”. Najpierw złamał potęgę faraona i ocalił lud przez krew baranka, a dopiero nad Synajem ukazał kształt życia w wolności.

2. Pierwsza tablica: Czystość relacji ze Stwórcą (Wj 20:3–11)
Pierwsze cztery przykazania bronią fundamentu tożsamości ludzkiej przed duchowym zniewoleniem:
• Wyłączność Boga (Wj 20:3): odrzucenie wszelkich bożków i rywali w ludzkim sercu.
• Zakaz wizerunków kultowych (Wj 20:4–6): Stwórca jest nieskończenie ponad materią stworzoną, a Jego „zazdrość” (hebr. El Kanna) wypływa z miłości przymierza okazującej miłosierdzie tysiącom pokoleń.
• Świętość Imienia (Wj 20:7): sprzeciw wobec instrumentalizacji Boga dla manipulacji, krzywoprzysięstwa czy pustego rytuału.
• Dzień szabatu (Wj 20:8–11): ukoronowanie tygodnia darem odpoczynku na wzór Stwórcy, obejmujące równym prawem pana, sługę, cudzoziemca i zwierzę.

3. Druga tablica: Ochrona człowieka i tajników serca (Wj 20:12–17)
Kolejnych sześć przykazań chroni podstawowe filary ludzkiej wspólnoty: szacunek dla rodziców i ciągłości pokoleń, nietykalność życia ludzkiego, czystość i wierność małżeńską, sprawiedliwość własności, prawdziwość świadectwa w relacjach społecznych oraz wewnętrzną integralność serca (zakaz pożądliwości w Wj 20:17, demaskujący grzech zanim przerodzi się w czyn zewnętrzny).

4. Trwoga ludu, próba bojaźni Bożej i ołtarz bez żelaznego dłuta (Wj 20:18–26)
Po ogłoszeniu Dekalogu lud, przerażony teofanią ognia i trąby, prosi Mojżesza o rolę pośrednika. Wyjaśnienie Mojżesza (Wj 20:20) odróżnia paraliżujący strach od zdrowej, wyzwalającej od grzechu bojaźni Bożej. Z kolei nakaz wznoszenia prostych ołtarzy z ziemi lub kamieni nieciosanych żelaznym narzędziem (Wj 20:24–26) przypomina, że ludzka sztuka i wysiłek nie dodają niczego do Bożej drogi pojednania.

5. Perspektywa Chrystocentryczna
W Nowym Testamencie Jezus Chrystus potwierdza trwałą wartość moralną Dekalogu (Mt 5:17–48) i streszcza obie tablice w przykazaniu miłości Boga oraz bliźniego (Mt 22:37–40). Ponieważ żaden człowiek o własnych siłach nie potrafił zachować doskonałości Prawa (Rz 3:20), sam Syn Boży wypełnił je w pełni, poniósł na krzyżu przekleństwo za nasze winy (Ga 3:13) i przez Ducha Świętego wypisuje Boże przykazania na żywych tablicach naszych serc (2 Kor 3:3; Hbr 8:10).

📌 PODSUMOWANIE REDAKCYJNE CCN:
Dziesięć Przykazań w Wj 20:1–26 pozostaje ponadczasowym zwierciadłem świętości Boga i mądrym prawem wolności człowieka. Odczytane przez pryzmat Chrystusa prowadzą nie do udręki legalizmu, lecz do głębokiej wdzięczności i życia przepełnionego miłością.

🌐 Źródła i serwisy pokrewne: polskieradio.cc | polskieradio.cc/akademia | mojabiblia.cc`;

const pakiet5wersji = `====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

${v1TtsText}

====================================================================
WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)
====================================================================

${v2WebText}

====================================================================
WERSJA 3: WERSJA WIECZORNA (SMS)
====================================================================

${v3SmsText}

====================================================================
WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)
====================================================================

${v4VideoText}

====================================================================
WERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)
====================================================================

${v5ArticleText}`;

// ── 3. TEKST LEKCJI DLA DOCX (12 SEKCJI) ──
const exegesisPlainBlocks = `CZĘŚĆ I: PROLOG ŁASKI I PIERWSZA TABLICA — CZEŚĆ BOGA JEDYNEGO (WJ 20:1–11)
1. Bóg sam przemawia do zgromadzenia (20:1): Wszystkie dziesięć słów wypowiada bezpośrednio Stwórca (Elohim), nadając im absolutny, ponadczasowy autorytet moralny.
2. Prolog ewangeliczny przed pierwszym nakazem (20:2): „Ja jestem PAN, twój Bóg, który cię wyprowadził z ziemi Egiptu, z domu niewoli” — wyzwolenie dokonane z łaski stanowi podstawę całego posłuszeństwa.
3. Zakaz rywali wobec Boga Przymierza (20:3): „Nie będziesz miał innych bogów przede mną” (hebr. al-panaj — przed moim obliczem) odrzuca zarówno politeizm, jak i podział ludzkiego serca między Stwórcę a bożki kariery, pieniądza czy władzy.
4. Ochrona transcendencji i prawdy o Bogu (20:4): Zakaz rzeźbionych posągów i podobizn stworzeń nie zabrania sztuki jako takiej, lecz strzeże przed redukowaniem niewidzialnego Stwórcy do kontrolowanej przez człowieka formy materialnej.
5. Bóg zazdrosny miłością przymierza (20:5): Hebrajskie El Kanna oznacza żarliwą, wierną zazdrość oblubieńczą, która nie godzi się na duchową zdradę niszczącą człowieka.
6. Pokoleniowe skutki nienawiści a ocean miłosierdzia (20:5–6): Zło ojców ciąży do 3. i 4. pokolenia tych, którzy Boga nienawidzą, natomiast Jego miłosierdzie (chesed) spływa na tysiące pokoleń kochających Go i strzegących Jego słów.
7. Świętość Imienia PANA (20:7): Branie imienia Boga „nadaremnie” (szaw — w pustce, kłamstwie, manipulacji lub magii) niszczy zaufanie do prawdy i spotyka się ze sprawiedliwym osądem.
8. Pamięć o szabacie jako znak Stworzenia i Wyzwolenia (20:8–9): Nakaz łączy sześć dni rzetelnej, godnej pracy z siódmym dniem wyłączonego czasu świętego dla Boga i odnowy człowieka.
9. Uniwersalna równość odpoczynku w szabacie (20:10): Odpoczynek obowiązuje gospodarza, dzieci, sługi, przybyszów i zwierzęta — w dniu Boga znika wyzysk i pogoń za zyskiem.
10. Stwórczy rytm czasu (20:11): PAN błogosławi i uświęca dzień szabatu, zakorzeniając moralność ludzką w samym porządku stworzenia nieba i ziemi.

CZĘŚĆ II: DRUGA TABLICA — MIŁOŚĆ BLIŹNIEGO I ŚWIĘTOŚĆ WSPÓLNOTY (WJ 20:12–17)
11. Piąte przykazanie pomostem między Bogiem a światem (20:12): Nakaz „Czcij swego ojca i swoją matkę” (kawed — nadać wagę, szanować w młodości i wspierać na starość) jest jedynym przykazaniem z bezpośrednią obietnicą długiego trwania wspólnoty (Ef 6:2–3).
12. Nienaruszalność ludzkiego życia (20:13): Czasownik racach dotyczy bezprawnego zabójstwa i morderstwa (nie mylić z obroną przed złem); Jezus rozszerza je w Mt 5:21–22 na nienawiść i pogardliwe słowa w sercu.
13. Świętość przymierza małżeńskiego (20:14): „Nie będziesz cudzołożył” chroni wyłączną wierność małżonków przed rozpadem rodziny i zdradą; Chrystus sięga korzeni pożądliwości wzroku w Mt 5:27–28.
14. Ochrona własności i sprawiedliwości pracy (20:15): „Nie będziesz kradł” broni owoców uczciwego trudu i zabrania zarówno kradzieży jawnej, jak i oszustw gospodarczych czy uprowadzenia ludzi.
15. Prawdomówność fundamentem sprawiedliwości (20:16): Zakaz fałszywego świadectwa przeciw bliźniemu w sądzie i codziennej mowie zakazuje oszczerstw, manipulacji faktami i niszczenia cudzego imienia.
16. Dziesiąte przykazanie — rentgen ludzkiego serca (20:17): Zakaz pożądania domu, żony, sług, zwierząt czy jakiejkolwiek rzeczy bliźniego demaskuje niewidzialne korzenie grzechu w zawiści (chamad), zanim dojdzie do czynów.
17. Jedność wszystkich dziesięciu słów (20:1–17; Jk 2:10): Wszystkie przykazania tworzą nierozerwalną całość wypływającą z charakteru samego Boga — sprawiedliwego, wiernego, prawdomównego i dającego życie.
18. Od zewnętrznego przymusu do wewnętrznej wolności (20:17): Kto nauczy się powierzać pragnienia Bogu, przestaje zabiegać o cudze dobra kosztem bliźniego.

CZĘŚĆ III: REAKCJA LUDU POD SYNAJEM I ROZUMIENIE BOJAŹNI BOŻEJ (WJ 20:18–21)
19. Strach wobec gromów, błyskawic i dźwięku trąby (20:18): Cały naród cofa się i staje z daleka, odczuwając przytłaczającą dysproporcję między grzesznym człowiekiem a świętym Bogiem.
20. Błagalna prośba o pośrednika (20:19): „Ty mów do nas, a będziemy słuchać, ale niech Bóg do nas nie mówi, byśmy nie pomarli” — spontaniczne uznanie konieczności ustanowionego pośrednika między Bogiem a ludem.
21. Paradoks Mojżesza: „Nie bójcie się” oraz „bojaźń przed obliczem” (20:20): Mojżesz wyraźnie rozróżnia paniczny lęk paraliżujący zaufanie od oczyszczającej, pełnej czci bojaźni Bożej chroniącej przed grzechem.
22. Próba serca przy górze (20:20): Teofania była Bożą próbą (nissah), czy podniosłe deklaracje ludu przetrwają w codziennej wierności przykazaniom.
23. Zbliżenie Mojżesza do gęstego mroku (20:21): Podczas gdy lud stoi w bezpiecznej odległości, pośrednik wchodzi w ciemny obłok (arafel), w którym zamieszkuje Boża chwała, przygotowując drogę dla kapituły Prawa Przymierza.
24. Głos z nieba świadectwem przeciw idolom (20:22): Bóg mówi bezpośrednio „z nieba”, udowadniając, że prawdziwy PAN nie potrzebuje materialnego posągu, by przemawiać do swojego stworzenia.
25. Zakaz bogów ze srebra i złota (20:23): Nawet najbardziej kosztowne kruszce stają się obrazą Stwórcy, jeśli stoją „przy Nim” jako próba kupienia sobie przychylności lub dzielenia oddawanej Mu czci.

CZĘŚĆ IV: PRAWO PROSTEGO OŁTARZA I OBECNOŚĆ BOŻA (WJ 20:24–26)
26. Ołtarz z ziemi znakiem pokory (20:24): Skromny ołtarz ze zwykłej ziemi przypomina, że miejsce spotkania z Bogiem nie polega na ludzkim przepychu, lecz na Bożym słowie i ofierze przebłagania.
27. Całopalenia i ofiary pojednawcze (20:24): Pierwsza wyraźna wzmianka w prawodawstwie synajskim o ofierze całkowitego oddania (olah) oraz ofierze pokoju i wspólnoty z Bogiem (szelamim).
28. Obietnica przyjścia i błogosławieństwa (20:24): „Na każdym miejscu, gdzie upamiętnię swoje imię, przyjdę do ciebie i będę ci błogosławił” — nie człowiek narzuca miejsce kultu, lecz Bóg suwerennie wyznacza miejsce spotkania (ostatecznie w Chrystusie, J 2:19–21; 4:21–24).
29. Kamień nieciosany żelaznym narzędziem (20:25): Zakaz użycia żelaznego dłuta przy ołtarzu uczy, że ludzka umiejętność i broń/żelazo nie „udoskonalają” Bożego ołtarza — pojednanie jest całkowicie dziełem Stwórcy.
30. Niezbezczeszczona prostota Bożego dzieła (20:25): Zbezczeszczenie następuje wtedy, gdy człowiek chce poprawiać Boży sposób zbawienia własnymi pomysłami religijnymi.
31. Zakaz stopni przy ołtarzu (20:26): Skromność i szacunek w kulcie chronią zarówno godność człowieka („aby twoja nagość nie była odkryta”), jak i odróżniają służbę Izraela od wyuzdanych obrzędów pogańskich.
32. Duchowe przejście z Synaju do ołtarza krzyża (20:24–26): Golgota stała się miejscem, na którym Bóg raz na zawsze upamiętnił Swoje Imię i błogosławi każdemu, kto przystępuje z wiarą.

CZĘŚĆ V: SYNTEZA TEOLOGICZNA I KLUCZE JĘZYKOWE (WJ 20:1–26)
33. Prawo jako zwierciadło świętości Boga (Rz 7:12): Przykazanie jest „święte, sprawiedliwe i dobre”, bo ukazuje, jaki jest sam Dawca Prawa.
34. Pedagogia prowadząca do Chrystusa (Ga 3:24): Dekalog obnaża bezradność człowieka o własnych siłach, prowadząc nas do krzyża po usprawiedliwienie z wiary.
35. Duchowe wypełnienie w Nowym Przymierzu (Rz 8:3–4): To, czego Prawo nie mogło dokonać z powodu słabości naszego ciała, Bóg sprawił posyłając Syna, aby sprawiedliwość Prawa wypełniała się w żyjących według Ducha.
36. Asaret ha-Dewarim: Dziesięć Słów przymierza (Wj 34:28; Pwt 4:13) jako zwarty fundament etyki biblijnej.
37. Bejt awadiim (בֵּית עֲבָדִים): Dom niewoli — rzeczywistość, z której Bóg najpierw wykupuje człowieka, zanim nada mu prawo wolności.
38. El Kanna (אֵל קַנָּא): Bóg żarliwie wierny, zazdrosny o czystą miłość swojego ludu.
39. Chesed (חֶסֶד): Niezachwiana łaska i miłosierdzie przymierza płynące ku tysiącom pokoleń.
40. Szaw (שָׁוְא): Próżność, fałsz i pusta manipulacja, przed którymi chroni trzecie przykazanie.
41. Szabat (שַׁבָּת): Błogosławiony czas ustania pracy dla uwielbienia Stwórcy i odnowienia całego stworzenia.
42. Kawed (כַּבֵּד): Czcić rodziców znaczy szanować ich powagę, okazywać wdzięczność i otaczać troską.
43. Chamad (חָמַד): Chciwe pożądanie w myślach, z którego rodzą się zewnętrzne krzywdy.
44. Nissah (נִסָּה): Próba i ćwiczenie wierności, aby bojaźń Boża strzegła sumienia w codzienności.
45. Mizbeach (מִזְבֵּחַ): Ołtarz nieciosany ludzką ręką — symbol czystego zbawienia z łaski Boga samego.`;

const lessonDocxText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
${BOOK} • MIESIĄC 2 • DZIEŃ ${DAY_NUM}

ZANIM OTWORZYSZ BIBLIĘ
Kurs „Z Biblią za Pan Brat” prowadzi przez wszystkie 66 ksiąg Pisma Świętego — księga po księdze, każdego dnia jeden rozdział. Dziś zatrzymujemy się przy Dniu 50: Księga Wyjścia 20:1–26. Zanim przeczytasz komentarz, otwórz UBG i przeczytaj uważnie cały 20. rozdział. Zwróć uwagę na to, od jakich słów Bóg zaczyna Dziesięć Przykazań oraz dlaczego po głośnej teofanii na Synaju uczy o skromnym ołtarzu z ziemi i nieciosanego kamienia.

TEKST PISMA ŚWIĘTEGO (UBG • ${READING})
${buildVersesDocxText()}

KLUCZE JĘZYKOWE & KODY STRONGA (${READING})
• H5650 / H1004 — Bejt awadiim (בֵּית עֲבָדִים): dom niewoli, z którego Bóg najpierw wyprowadza swój lud przed ogłoszeniem jakiegokolwiek nakazu (Wj 20:2).
• H7067 — El Kanna (אֵל קַנָּא): Bóg zazdrosny żarliwą miłością oblubieńczą o wyłączną wierność swojego ludu (Wj 20:5).
• H2617 — Chesed (חֶסֶד): niewyczerpane miłosierdzie i wierność przymierza dla tysięcy pokoleń miłujących Boga (Wj 20:6).
• H7723 — Szaw (שָׁוְא): próżność, pustka, kłamstwo i nadużycie świętego Imienia PANA (Wj 20:7).
• H7676 — Szabat (שַׁבָּת): uświęcone siódmodniowe odpocznienie od pracy jako znak stworzenia i wyzwolenia (Wj 20:8–11).
• H3513 — Kawed (כַּבֵּד): czcij, szanuj, nadawaj należytą wagę ojcu i matce z obietnicą długich dni (Wj 20:12).
• H2530 — Chamad (חָמַד): pożądać, pragnąć tego, co należy do bliźniego — grzech wewnętrzny serca (Wj 20:17).
• H4196 — Mizbeach (מִזְבֵּחַ): ołtarz z ziemi i nieciosanego kamienia, którego nie wolno „poprawiać” żelaznym narzędziem człowieka (Wj 20:24–26).

ANALIZA EGZEGETYCZNA I FORMACJA TEOLOGICZNA (45 PUNKTÓW)

${exegesisPlainBlocks}

JEZUS W CENTRUM — DEKALOG I OŁTARZ WYPEŁNIONY W CHRYSTUSIE
1. Chrystus nie przyszedł znieść Prawa, lecz je wypełnić (Mt 5:17): Jezus w Kazaniu na Górze ukazuje najgłębsze znaczenie Dekalogu, sięgając od zewnętrznego czynu aż do myśli serca — gniewu, pożądliwego spojrzenia i prawdomówności.
2. Nieskazitelne posłuszeństwo w imieniu grzeszników (Rz 5:19; 1 P 2:22): Tam, gdzie każdy człowiek potknął się o wymagania dziesięciu słów, Syn Boży zachował całe Prawo doskonale ze względu na nas.
3. Wykupienie od przekleństwa Prawa na krzyżu (Ga 3:13; Kol 2:14): Chrystus wziął na Siebie sprawiedliwy sąd za nasze przekroczenia Dziesięciu Przykazań i przybił spis dłużny naszych win do krzyża.
4. Prawo wpisane w żywe serca Duchem Świętym (Jr 31:33; 2 Kor 3:3; Hbr 8:10): W Nowym Przymierzu miłość do Boga i bliźniego nie jest zimnym literowym przymusem na kamieniu, lecz naturalnym owocem nowego narodzenia i działania Ducha Świętego.
5. Chrystus naszym Pośrednikiem i Prawdziwym Ołtarzem (1 Tm 2:5; Hbr 13:10): To On zaspokoił tęsknotę drżącego ludu spod Synaju o Pośrednika oraz wypełnił obraz ołtarza bez ludzkiego żelaza — zbawienie nie zależy od ciosania naszych zasług, lecz od daru łaski.
6. Dwa wielkie przykazania miłości kluczem całego Dekalogu (Mt 22:37–40): Cała pierwsza tablica streszcza się w miłości do Pana Boga z całego serca, a cała druga w miłości do bliźniego jak siebie samego.

SPRAWDŹ W BIBLII — 12 WERSÓW PORÓWNAWCZYCH
• Wj 20:2 → Rz 6:17–18: Wyzwolenie z niewoli poprzedza nowe życie w posłuszeństwie.
• Wj 20:3 → Mt 4:10: Odpowiedź Jezusa na pokusę władzy w słowach o wyłącznym kulcie Boga.
• Wj 20:4–6 → Kol 1:15; J 4:24: Chrystus prawdziwym obrazem niewidzialnego Boga i uwielbienie w Duchu i prawdzie.
• Wj 20:8–11 → Mk 2:27–28; Hbr 4:9–10: Jezus Panem szabatu i obietnicą odpocznienia dla ludu Bożego.
• Wj 20:12 → Ef 6:1–3: Pierwsze przykazanie z obietnicą przeniesione wprost do nauki apostolskiej.
• Wj 20:13–14 → Mt 5:21–28: Pogłębienie przykazań o zabójstwie i cudzołóstwie aż do intencji serca.
• Wj 20:15 → Ef 4:28: Kto kradł, niech już nie kradnie, lecz uczciwie pracuje, by mieć z czego udzielać potrzebującemu.
• Wj 20:16 → Ef 4:25: Odrzucenie kłamstwa i mówienie prawdy bliźniemu, gdyż jesteśmy członkami jednego ciała.
• Wj 20:17 → Rz 7:7; Kol 3:5: Jak przykazanie „nie będziesz pożądał” odsłania bałwochwalstwo chciwości.
• Wj 20:18–21 → Hbr 12:18–24: Przejście spod przerażającej góry Synaj pod krzyż Pośrednika na Górze Syjon.
• Wj 20:24–25 → Ef 2:8–9; Hbr 13:10: Zbawienie nie z ludzkich uczynków (bez żelaznego narzędzia dumy), lecz przez ołtarz Chrystusa.
• Wj 20:1–17 → Mt 22:37–40; Rz 13:8–10: Miłość wypełnieniem całego Prawa Bożego.

PRAWDA NA DZIŚ — 8 ZASAD DEKALOGU DLA CODZIENNOŚCI
• 1. Twoja tożsamość opiera się na wyprowadzeniu z niewoli: Najpierw jesteś wyzwolonym dzieckiem Bożym, dopiero potem posłusznym sługą.
• 2. Każde przykazanie jest aktem ojcowskiej ochrony: Bóg stawia granice jak kochający Ojciec chroniący rodzinę przed nieszczęściem.
• 3. Święty czas z Bogiem leczy gonitwę świata: Zatrzymanie się w rytmie odpoczynku przypomina, że światem nie rządzi nasza gorączka, lecz Stwórca.
• 4. Szacunek w rodzinie buduje przyszłość: Cześć okazywana rodzicom w słowie i opiece utrwala błogosławieństwo na ziemi.
• 5. Prawda i własność potrzebują czystego sumienia: Chrześcijanin dba o dobre imię bliźniego i rzetelność w najmniejszych sprawach finansowych.
• 6. Czystość zaczyna się w myślach przed czynem: Walka o wierność i wolność od zazdrości wygrywa się na poziomie serca i spojrzenia.
• 7. Zbawienia nie można „wyrzeźbić” własną siłą: Tak jak na ołtarzu nie było miejsca na żelazne dłuto, tak do Ewangelii nic nie dodajemy swoją pychą.
• 8. Bojaźń Boża daje odwagę i wolność od strachu przed ludźmi: Kto zna świętość Stwórcy, ten nie musi ulegać pokusom grzechu.

POMYŚL — 8 PYTAŃ DO SERCA
1. Czy myśląc o przykazaniach Bożych czujesz najpierw wdzięczność za wyprowadzenie z niewoli grzechu, czy ciężar przymusu?
2. Jakie „inne bogi” (kariera, opinia ludzi, telefon, wygoda) próbują dziś stanąć przed Bożym obliczem na pierwszym miejscu w Twoim tygodniu?
3. Czy używasz Imienia Bożego zawsze z czcią, czy zdarza Ci się wypowiadać je lekkomyślnie lub bezmyślnie?
4. Czy w swoim tygodniu umiesz wyznaczyć czas prawdziwego odpoczynku przed Bogiem i pozwolić odpocząć domownikom i współpracownikom?
5. W jaki praktyczny sposób możesz w tym tygodniu okazać szczególną cześć i wdzięczność swoim rodzicom?
6. Które ze słów o sercu — o gniewie, nieczystości albo zazdrości — najbardziej dotyka dziś Twojego sumienia w świetle Chrystusa?
7. Czy w Twoich słowach i komentarzach o innych ludziach zawsze strzeżesz prawdy i dobrego imienia bliźniego?
8. Czy przystępujesz do Boga z prostotą pokory, odrzucając próby „ciosania” własnych zasług zamiast zaufania jedynej ofierze Chrystusa?

MAŁY QUIZ — 20 PYTAŃ Z WJ 20:1–26

Pytanie 1: Od jakich słów Bóg rozpoczął ogłoszenie Dziesięciu Przykazań w Wj 20:2?
A. Będziecie przestrzegać wszystkich moich ustaw i wyroków
B. Ja jestem PAN, twój Bóg, który cię wyprowadził z ziemi Egiptu, z domu niewoli
C. Zbudujcie mi wspaniałą świątynię z cedrów i złota
D. Oto zawieram przymierze na pustyni Paran
Poprawna odpowiedź: B. Wyjaśnienie: Wj 20:2 rozpoczyna Dekalog przypomnieniem o łasce wyzwolenia z domu niewoli.

Pytanie 2: Jak brzmi pierwsze przykazanie zapisane w Wj 20:3?
A. Nie będziesz miał innych bogów przede mną
B. Będziesz składał ofiary na każdym wzgórzu
C. Pamiętaj o świętach nowiu
D. Nie oddawaj czci aniołom na niebie
Poprawna odpowiedź: A. Wyjaśnienie: Wj 20:3 brzmi dosłownie: „Nie będziesz miał innych bogów przede mną”.

Pytanie 3: Czego zabrania drugie przykazanie w Wj 20:4–5?
A. Pisania ksiąg historycznych i kronik
B. Czynienia sobie jakiegokolwiek rzeźbionego posągu ani podobizny czegokolwiek na niebie, na ziemi czy w wodach pod ziemią oraz oddawania im pokłonu i służenia im
C. Malowania domów na biało
D. Stawiania znaków drogowych na pustyni
Poprawna odpowiedź: B. Wyjaśnienie: Wj 20:4–5 zakazuje sporządzania podobizn kultowych oraz kłaniania się im i służenia.

Pytanie 4: Jakim określeniem Bóg opisuje Siebie w Wj 20:5, mówiąc o wyłączności przymierza?
A. Bóg daleki i nieznany
B. Bóg zazdrosny
C. Bóg obojętny na grzech
D. Bóg jednej tylko góry
Poprawna odpowiedź: B. Wyjaśnienie: Wj 20:5: „bo ja jestem PAN, twój Bóg, Bóg zazdrosny”.

Pytanie 5: Komu PAN okazuje miłosierdzie aż do tysięcznych pokoleń w Wj 20:6?
A. Tysiącom tych, którzy Go miłują i strzegą Jego przykazań
B. Wyłącznie najbogatszym rodom w obozie
C. Tym, którzy zbudują najwyższe ołtarze
D. Każdemu, kto kłania się złotym cielcom
Poprawna odpowiedź: A. Wyjaśnienie: Wj 20:6 zapowiada miłosierdzie „tysiącom tych, którzy mnie miłują i strzegą moich przykazań”.

Pytanie 6: Dlaczego w trzecim przykazaniu (Wj 20:7) nie wolno brać imienia PANA nadaremnie?
A. Ponieważ ludzie mogli zapomnieć jego wymowy
B. Gdyż PAN nie zostawi bez kary tego, który bierze Jego imię nadaremnie
C. Ponieważ wolno je wymawiać tylko w Egipcie
D. Ponieważ w ten sposób skraca się podróż przez pustynię
Poprawna odpowiedź: B. Wyjaśnienie: Wj 20:7 wyraźnie ostrzega: „gdyż PAN nie zostawi bez kary tego, który bierze jego imię nadaremnie”.

Pytanie 7: Ile dni według Wj 20:9 należy pracować i wykonywać wszystkie swoje prace?
A. Pięć dni
B. Sześć dni
C. Siedem dni bez przerwy
D. Cztery dni w tygodniu
Poprawna odpowiedź: B. Wyjaśnienie: Wj 20:9 nakazuje: „Sześć dni będziesz pracować i wykonywać wszystkie swoje prace”.

Pytanie 8: Kogo według Wj 20:10 obejmuje zakaz wykonywania pracy w siódmym dniu szabatu?
A. Jedynie starszych ludu i kapłanów
B. Nikogo prócz kobiet i dzieci
C. Ciebie, twego syna, twoją córkę, sługę, służącą, twoje bydło oraz twego gościa w obrębie twoich bram
D. Wyłącznie cudzoziemców z sąsiednich miast
Poprawna odpowiedź: C. Wyjaśnienie: Wj 20:10 chroni przed pracą w dzień szabatu całą rodzinę, sługi, zwierzęta i gościa.

Pytanie 9: Jakie stwórcze uzasadnienie dnia szabatu podaje Wj 20:11?
A. PAN wyprowadził lud przez Jordan siódmego dnia
B. PAN bowiem przez sześć dni stworzył niebo i ziemię, morze i wszystko, co jest w nich, a siódmego dnia odpoczął — dlatego błogosławił dzień szabatu i uświęcił go
C. Na pustyni co siódmy dzień padał deszcz złota
D. Tak nakazali doradcy z Midianu
Poprawna odpowiedź: B. Wyjaśnienie: Wj 20:11 bezpośrednio odwołuje się do sześciu dni stworzenia i odpoczynku siódmego dnia.

Pytanie 10: Jaka obietnica została dołączona do piątego przykazania o czci dla ojca i matki w Wj 20:12?
A. Natychmiastowe bogactwo w srebrze
B. Aby twoje dni były długie na ziemi, którą PAN, twój Bóg, da tobie
C. Zwolnienie z wszelkich ofiar w przybytku
D. Wyłączne panowanie nad Egiptem
Poprawna odpowiedź: B. Wyjaśnienie: Wj 20:12 obiecuje długie dni na ziemi danej przez PANA.

Pytanie 11: Jakie cztery krótkie zakazy moralne następują bezpośrednio po sobie w wersetach Wj 20:13–16?
A. Nie jedz mięsa, nie pij wina, nie wychodź z namiotu, nie spóźniaj się
B. Nie będziesz zabijał, nie będziesz cudzołożył, nie będziesz kradł, nie będziesz fałszywie świadczył przeciw twemu bliźniemu
C. Nie buduj domów z cegły, nie siej pszenicy, nie kupuj wołów, nie handluj z sąsiadami
D. Nie czytaj zwojów, nie mów głośno, nie śpiewaj pieśni, nie rozpalaj ognia
Poprawna odpowiedź: B. Wyjaśnienie: Wersety 13–16 UBG brzmią kolejno: Nie będziesz zabijał; Nie będziesz cudzołożył; Nie będziesz kradł; Nie będziesz fałszywie świadczył przeciw twemu bliźniemu.

Pytanie 12: Co konkretnie wymienia dziesiąte przykazanie przeciw pożądliwości w Wj 20:17?
A. Złotych mieczy i rydwanów faraona
B. Domu twego bliźniego, żony twego bliźniego, jego sługi, służącej, wołu, osła ani żadnej rzeczy należącej do twego bliźniego
C. Wielkich miast nad Eufratem
D. Szat arcykapłańskich Aarona
Poprawna odpowiedź: B. Wyjaśnienie: Wj 20:17 wylicza szczegółowo dom, żonę, sługę, służącą, wołu, osła i każdą rzecz bliźniego.

Pytanie 13: Jak zareagował cały lud, widząc gromy, błyskawice, dymiącą górę i słysząc głos trąby w Wj 20:18?
A. Wszedł odważnie na szczyt góry bez pozwolenia
B. Cofnął się i stanął z daleka
C. Zatańczył wokół ogniska
D. Odwrócił się z powrotem do Egiptu
Poprawna odpowiedź: B. Wyjaśnienie: Wj 20:18 mówi wyraźnie: „Gdy lud to widział, cofnął się i stanął z daleka”.

Pytanie 14: Z jaką prośbą lud zwrócił się do Mojżesza w Wj 20:19?
A. Aby poprosił o wodę i manny z nieba
B. Ty mów do nas, a będziemy słuchać, ale niech Bóg do nas nie mówi, byśmy nie pomarli
C. Aby Mojżesz wrócił na pustynię do Jetry
D. Aby zburzyć górę Synaj
Poprawna odpowiedź: B. Wyjaśnienie: Lud w trwodze przed śmiercią poprosił Mojżesza o rolę pośrednika słowa Bożego.

Pytanie 15: W jakim celu według wyjaśnień Mojżesza w Wj 20:20 Bóg przyszedł i wystawił lud na próbę?
A. Aby zniszczyć cały obóz na pustyni
B. Żeby Jego bojaźń była przed waszym obliczem, byście nie grzeszyli
C. Aby pokazać swoją przewagę nad górami Midianu
D. Aby odebrać im dobytek
Poprawna odpowiedź: B. Wyjaśnienie: Wj 20:20 uczy: „aby was wystawić na próbę i żeby jego bojaźń była przed waszym obliczem, byście nie grzeszyli”.

Pytanie 16: Dokąd zbliżył się Mojżesz w Wj 20:21, podczas gdy lud stał z daleka?
A. Do brzegu Morza Czerwonego
B. Do gęstego mroku, w którym był Bóg
C. Do miasta Ramzesa
D. Do namiotów pokolenia Judy
Poprawna odpowiedź: B. Wyjaśnienie: Wj 20:21 stwierdza: „a Mojżesz zbliżył się do gęstego mroku, w którym był Bóg”.

Pytanie 17: Jakiego zakazu ponownie udzielił PAN bezpośrednio po stwierdzeniu, że przemawiał z nieba (Wj 20:22–23)?
A. Zakazu opuszczania pustyni przez rok
B. Zakazu czynienia przy Nim bogów ze srebra ani bogów ze złota
C. Zakazu rozmów między plemionami
D. Zakazu noszenia pierścieni
Poprawna odpowiedź: B. Wyjaśnienie: Wj 20:23 ostrzega: „Nie będziecie czynić przy mnie bogów ze srebra ani bogów ze złota nie będziecie sobie czynić”.

Pytanie 18: Z czego według Wj 20:24 Izraelici mieli czynić ołtarz i jakich ofiar jest tam mowa?
A. Z czystego złota z kadzidłem i mirrą
B. Z ziemi, by składać całopalenia i ofiary pojednawcze z owiec i bydła
C. Z drewna akacjowego i marmuru
D. Z cegieł wypalanych w Egipcie
Poprawna odpowiedź: B. Wyjaśnienie: Wj 20:24: „Uczynisz mi ołtarz z ziemi i będziesz składać na nim twoje całopalenia i twoje ofiary pojednawcze, twoje owce i twoje bydło”.

Pytanie 19: Czego nie wolno było używać przy budowie ołtarza kamiennego według Wj 20:25 i dlaczego?
A. Kamieni z rzeki, bo były zbyt gładkie
B. Ciosanego kamienia ani żelaznego narzędzia, gdyż przyłożenie żelaznego narzędzia zbezcześciłoby ołtarz
C. Bieli wapna z powodu upału
D. Więcej niż dwóch kamieni naraz
Poprawna odpowiedź: B. Wyjaśnienie: Wj 20:25: „nie buduj go z ciosanego kamienia. Jeśli bowiem przyłożysz do niego żelazne narzędzie, zbezcześcisz go”.

Pytanie 20: Dlaczego według Wj 20:26 nie należało wstępować po stopniach do ołtarza PANA?
A. Aby się nie poślizgnąć na pustynnym piasku
B. Aby nagość nie była przy nim odkryta
C. Ponieważ kamienie były zbyt kruche
D. Aby oszczędzać obuwie w drodze do Kanaanu
Poprawna odpowiedź: B. Wyjaśnienie: Wj 20:26 nakazuje: „Nie będziesz wstępował po stopniach do mojego ołtarza, aby twoja nagość nie była przy nim odkryta”.

TWOJA DECYZJA
Dziesięć Przykazań nie stoi w sprzeczności z Ewangelią Jezusa Chrystusa — jest światłem pokazującym świętość Boga i wartość ludzkiego życia w prawdzie oraz miłości. Zamiast próbować rzeźbić własną sprawiedliwość dłutem ludzkiej dumy przy ołtarzu dobrych uczynków, przyjdź pod krzyż Jezusa i przyjmij wolność z niewoli grzechu, by następnie żyć Dziesięcioma Słowami z wdzięcznego serca odnowionego przez Ducha Świętego.

MOJA DECYZJA:
Dziękuję Ci, Panie Jezu, że wypełniłeś za mnie wymagania całego Dekalogu i wykupiłeś mnie z domu niewoli grzechu. Świadomie wybieram dziś posłuszeństwo z miłości: pragnę odrzucać ukryte bożki w moim sercu, szanować święty czas z Bogiem, okazywać cześć moim bliskim i strzec czystości myśli, słów i czynów mocą Ducha Świętego.

MODLITWA NA 19 LISTOPADA 2026 R.
Wszechmogący, Święty Boże i Miłosierny Wybawicielu z domu niewoli! Staję dziś przed Tobą w ten czwartkowy dzień ze czcią i głęboką wdzięcznością za Dziesięć Słów Twojego Przymierza. Dziękuję Ci, że zanim dałeś jakiekolwiek przykazanie, pierwszy przyszedłeś nas ocalić i wyprowadzić do wolności dzieci Bożych.

Wyznaję przed Tobą wszystkie moje wykroczenia przeciw Twojemu świętemu Prawu — zarówno czyny i słowa, jak i ukryte pragnienia zawiści, złości, bożków mojego serca oraz pośpiechu zabierającego czas dla Ciebie. Przepraszam Cię za każdą próbę usprawiedliwiania siebie własnymi wysiłkami zamiast zaufania Chrystusowi.

Panie Jezu Chryste, jedyny Pośredniku między Bogiem a ludźmi i nasz prawdziwy Ołtarzu! Dziękuję Ci, że przez swoją krew zmyłeś mój dług i wypisujesz dziś Twoje przykazania wolności na żywych tablicach mojego serca. Napełnij mnie Duchem Świętym, abym w bojaźni Bożej kochał Ciebie ze wszystkich sił, a bliźniego szczerze i w prawdzie. Amen!

ZADANIE NA DZIŚ (7 ZADAŃ TAKTYCZNYCH)
1. Przeczytaj na spokojnie cały 20. rozdział Księgi Wyjścia (Wj 20:1–26 UBG) oraz Kazanie na Górze w Mt 5:17–28.
2. Wyróżnij i zapisz z drugiego wersetu słowa przypomnienia o wyzwoleniu — przeczytaj je rano przed podjęciem decyzji dnia.
3. Sprawdź swoje serce pod kątem pierwszego przykazania: czy coś w Twoim kalendarzu lub myślach nie zajęło dziś miejsca należnego Bogu?
4. Zadzwoń, napisz lub spotkaj się dziś z rodzicami (albo wspomnij ich z wdzięcznością w modlitwie), wprowadzając w czyn piąte przykazanie.
5. Zaplanuj świadomie odpoczynek i czas poświęcony Stwórcy oraz zadbaj, aby nie obciążać niepotrzebną pracą osób wokół siebie.
6. W rozmowach z ludźmi pilnuj dziś bezwzględnej prawdomówności i ochrony dobrego imienia nieobecnych osób (dziewiąte i ósme przykazanie).
7. Oznacz Dzień 50 jako ukończony w Akademii i podziel się lekcją z kimś, kto postrzega wiarę wyłącznie jako zbiór zimnych zakazów!

JUTRO — 20 LISTOPADA 2026 R.
DZIEŃ 51: PRAWO PRZYMIERZA — GODNOŚĆ SŁUGI, OCHRONA ŻYCIA I SPRAWIEDLIWOŚĆ SPOŁECZNA (WJ 21:1–36)
Jutro ze szczytu Synaju zejdziemy prosto w codzienność prawa cywilnego i sądownictwa Izraela! Zobaczymy, jak Bóg praktycznie przekłada Dziesięć Przykazań na ochronę słabszych, godność niewolników hebrajskich, bezpieczeństwo kobiet ciężarnych oraz uczciwą odpowiedzialność za własne czyny i majątek.`;

// ── 4. GENEROWANIE DOKUMENTU WORD (.DOCX) ──
console.log('📄 Generuję profesjonalny plik Microsoft Word (.docx)...');

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Calibri',
          size: 22,
          color: '1A202C',
        },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: 'BIBLIJNA AKADEMIA | Z BIBLIĄ ZA PAN BRAT',
                  font: 'Calibri',
                  size: 18,
                  color: '718096',
                  bold: true,
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: `${BOOK} • DZIEŃ ${DAY_NUM} • ${DATE_STR}   |   Strona `,
                  font: 'Calibri',
                  size: 18,
                  color: '718096',
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: 'Calibri',
                  size: 18,
                  color: '718096',
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: '66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE',
              font: 'Calibri',
              size: 20,
              color: 'C4A35A',
              bold: true,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: `${BOOK} • MIESIĄC 2 • DZIEŃ ${DAY_NUM}`,
              font: 'Calibri',
              size: 22,
              color: '2B6CB0',
              bold: true,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: TITLE,
              font: 'Calibri',
              size: 34,
              bold: true,
              color: '0F2942',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: SUBTITLE,
              font: 'Calibri',
              size: 22,
              italics: true,
              color: '4A5568',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [
            new TextRun({
              text: `${DATE_FORMATTED}   |   Czytanie: ${READING}`,
              font: 'Calibri',
              size: 22,
              bold: true,
              color: '1A202C',
            }),
          ],
        }),
        new Paragraph({
          spacing: { before: 100, after: 120 },
          children: [
            new TextRun({
              text: 'TEKST PAMIĘCIOWY: ',
              font: 'Calibri',
              bold: true,
              color: 'C4A35A',
              size: 22,
            }),
            new TextRun({
              text: MEMORY_VERSE,
              font: 'Calibri',
              italics: true,
              bold: true,
              size: 22,
              color: '0F2942',
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 300 },
          children: [
            new TextRun({
              text: 'MYŚL PRZEWODNIA: ',
              font: 'Calibri',
              bold: true,
              color: '2B6CB0',
              size: 22,
            }),
            new TextRun({
              text: THEME,
              font: 'Calibri',
              size: 22,
              color: '2D3748',
            }),
          ],
        }),
        ...lessonDocxText
          .split('\n\n')
          .slice(1)
          .flatMap((block) => {
            const trimmed = block.trim();
            if (!trimmed) return [];

            if (
              trimmed.startsWith('ZANIM OTWORZYSZ BIBLIĘ') ||
              trimmed.startsWith('TEKST PISMA ŚWIĘTEGO') ||
              trimmed.startsWith('ANALIZA EGZEGETYCZNA') ||
              trimmed.startsWith('CZĘŚĆ ') ||
              trimmed.startsWith('KLUCZE JĘZYKOWE') ||
              trimmed.startsWith('JEZUS W CENTRUM') ||
              trimmed.startsWith('SPRAWDŹ W BIBLII') ||
              trimmed.startsWith('PRAWDA NA DZIŚ') ||
              trimmed.startsWith('POMYŚL —') ||
              trimmed.startsWith('MAŁY QUIZ') ||
              trimmed.startsWith('TWOJA DECYZJA') ||
              trimmed.startsWith('MOJA DECYZJA') ||
              trimmed.startsWith('MODLITWA NA') ||
              trimmed.startsWith('ZADANIE NA DZIŚ') ||
              trimmed.startsWith('JUTRO —')
            ) {
              const lines = trimmed.split('\n');
              const headingLine = lines[0];
              const bodyLines = lines.slice(1);
              return [
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 260, after: 120 },
                  border: {
                    bottom: {
                      color: 'C4A35A',
                      space: 4,
                      style: BorderStyle.SINGLE,
                      size: 6,
                    },
                  },
                  children: [
                    new TextRun({
                      text: headingLine,
                      font: 'Calibri',
                      bold: true,
                      size: 26,
                      color: '0F2942',
                    }),
                  ],
                }),
                ...bodyLines
                  .filter((l) => l.trim())
                  .map(
                    (l) =>
                      new Paragraph({
                        spacing: { before: 80, after: 80 },
                        children: [
                          new TextRun({
                            text: l.trim(),
                            font: 'Calibri',
                            size: 22,
                            color: '2D3748',
                          }),
                        ],
                      })
                  ),
              ];
            }

            if (trimmed.startsWith('Pytanie ')) {
              const lines = trimmed.split('\n');
              return lines.map((line) => {
                const l = line.trim();
                if (l.startsWith('Pytanie ')) {
                  return new Paragraph({
                    spacing: { before: 140, after: 60 },
                    children: [
                      new TextRun({
                        text: l,
                        font: 'Calibri',
                        bold: true,
                        size: 22,
                        color: '0F2942',
                      }),
                    ],
                  });
                }
                if (/^[A-D]\.\s/.test(l)) {
                  return new Paragraph({
                    spacing: { before: 30, after: 30 },
                    indent: { left: 360 },
                    children: [
                      new TextRun({
                        text: l,
                        font: 'Calibri',
                        size: 22,
                        color: '2D3748',
                      }),
                    ],
                  });
                }
                if (l.startsWith('Poprawna odpowiedź:')) {
                  return new Paragraph({
                    spacing: { before: 50, after: 120 },
                    indent: { left: 360 },
                    children: [
                      new TextRun({
                        text: l,
                        font: 'Calibri',
                        bold: true,
                        color: '2B6CB0',
                        size: 22,
                      }),
                    ],
                  });
                }
                return new Paragraph({
                  spacing: { before: 60, after: 60 },
                  children: [
                    new TextRun({
                      text: l,
                      font: 'Calibri',
                      size: 22,
                      color: '2D3748',
                    }),
                  ],
                });
              });
            }

            return trimmed
              .split('\n')
              .filter((l) => l.trim())
              .map((line) => {
                const l = line.trim();
                const isTask = /^\d+\.\s/.test(l) || /^•\s/.test(l);
                return new Paragraph({
                  spacing: {
                    before: isTask ? 70 : 100,
                    after: isTask ? 70 : 100,
                  },
                  children: [
                    new TextRun({
                      text: l,
                      font: 'Calibri',
                      size: 22,
                      color: '2D3748',
                    }),
                  ],
                });
              });
          }),
      ],
    },
  ],
});

const docxDesktopPath = `C:/Users/czark/Desktop/Z_Biblia_za_Pan_Brat_Dzien_${DAY_NUM}_${DATE_STR}.docx`;
const docxBuffer = await Packer.toBuffer(doc);
fs.writeFileSync(docxDesktopPath, docxBuffer);
console.log(
  `✅ Zapisano sformatowany plik DOCX na Pulpicie: ${docxDesktopPath} (${docxBuffer.length} bajtów)`
);

// ── 5. ZAPIS PAKIETU 5 WERSJI ROZWAŻAŃ ──
const pakietFilePath = path.join(
  REPO,
  `scripts/content/pakiet-day${DAY_NUM}-5wersji.md`
);
fs.writeFileSync(pakietFilePath, pakiet5wersji, 'utf8');
console.log(`✅ Zapisano pakiet 5 wersji: ${pakietFilePath}`);

// ── 6. BUDOWANIE PLIKU HTML LEKCJI DO KOLEJKI (BEZ ZAPISU W akademia/) ──
console.log('🌐 Przygotowuję lekcja.html w kolejce publikacji...');
const template49Path = path.join(REPO, 'akademia/kurscodzienny/dzien-49.html');
let html = fs.readFileSync(template49Path, 'utf8');

// 6.1 Meta i naglowek
html = html.replace(
  /<title>Dzień 49: [^<]+<\/title>/,
  `<title>Dzień ${DAY_NUM}: ${TITLE} (${READING}) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`
);
html = html.replace(
  /<meta name="description" content="[^"]+"[^>]*>/,
  `<meta name="description" content="Dzień ${DAY_NUM} Kursu Codziennego Pisma Świętego „Z Biblią za Pan Brat”. ${BOOK} ${READING}: ${SUBTITLE}" />`
);
html = html.replace(
  /<link rel="canonical" href="[^"]*"[^>]*>/,
  `<link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-${DAY_NUM}" />`
);
html = html.replace(
  /<meta property="og:url" content="[^"]*"[^>]*>/,
  `<meta property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-${DAY_NUM}" />`
);
html = html.replace(
  /<meta property="og:title" content="[^"]+"[^>]*>/,
  `<meta property="og:title" content="Dzień ${DAY_NUM}: ${TITLE} (${READING}) | Z Biblią za Pan Brat" />`
);
html = html.replace(
  /<meta property="og:description" content="[^"]+"[^>]*>/,
  `<meta property="og:description" content="${SUBTITLE}" />`
);
html = html.replace(
  /kc_day_49_przymierze_pod_gora_synaj\.jpg(\?v=\d+)?/g,
  `${IMG_FILENAME}?v=20261119`
);

// Social share URL i tekst
html = html.replace(/kurscodzienny%2Fdzien-49/g, `kurscodzienny%2Fdzien-${DAY_NUM}`);
html = html.replace(
  /Z%20Bibli%C4%85%20za%20Pan%20Brat%20%E2%80%94%20Dzie%C5%84%2049[^"']+/g,
  encodeURIComponent(
    `Z Biblią za Pan Brat — Dzień ${DAY_NUM}: ${TITLE} (${READING})`
  )
);

// 6.2 Nawigacja i okruszki (dzien-49 zostaje tylko jako link powrotny ← Dzień 49)
html = html.replace(
  /<span class="text-amber-400 font-semibold">Dzień 49<\/span>/,
  `<span class="text-amber-400 font-semibold">Dzień ${DAY_NUM}</span>`
);

const nav49Regex =
  /<a href="\/akademia\/kurscodzienny\/dzien-48"[\s\S]*?<\/a>\s*<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50[\s\S]*?<\/span>/;
const nav50Block = `<a href="/akademia/kurscodzienny/dzien-49" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 49</span>
        </a>
        <span class="px-3 py-1.5 rounded-lg bg-zinc-900/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 51 (Piątek) →</span>
        </span>`;
html = html.replace(nav49Regex, nav50Block);

// 6.3 Hero i grafika
html = html.replace(
  /<span>Dzień 49 z 2009<\/span>/g,
  `<span>Dzień ${DAY_NUM} z 2009</span>`
);
html = html.replace(
  /18 LISTOPADA 2026 • ŚRODA/g,
  `19 LISTOPADA 2026 • CZWARTEK`
);
html = html.replace(
  /<h1 class="[^"]+">[\s\S]*?<\/h1>/,
  `<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">\n        ${TITLE}\n      </h1>`
);
html = html.replace(
  /<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">[\s\S]*?<\/p>/,
  `<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">\n        ${SUBTITLE}\n      </p>`
);
html = html.replace(
  /alt="Dzień 49:[^"]*"/,
  `alt="Dzień ${DAY_NUM}: ${TITLE} (${READING})"`
);
html = html.replace(
  /<span>Ilustracja biblijna:[^<]*<\/span>/,
  `<span>Ilustracja biblijna: Dwie kamienne tablice przymierza u stóp Góry Synaj o poranku (${READING})</span>`
);
html = html.replace(/Czytanie: Wj 19:1–25/g, `Czytanie: ${READING}`);

// 6.4 Werset pamieciowy i Mysl przewodnia
html = html.replace(
  /<!-- WERSET PAMIĘCIOWY Z KOPIOWANIEM -->[\s\S]*?<!-- MYŚL PRZEWODNIA -->/,
  `<!-- WERSET PAMIĘCIOWY Z KOPIOWANIEM -->
      <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-start justify-between gap-4">
        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
            <i class="fa-solid fa-bookmark"></i>
            <span>Werset do zapamiętania</span>
          </div>
          <p class="font-serif italic text-base sm:text-lg text-white">
            ${MEMORY_VERSE_QUOTE}
          </p>
          <p class="text-xs text-zinc-400 font-semibold">— Księga Wyjścia 20:2–3 (UBG)</p>
        </div>
        <button
          onclick="navigator.clipboard.writeText('„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 20:2–3 (UBG)'); this.innerHTML = '<i class=\\'fa-solid fa-check\\'></i> Skopiowano'; setTimeout(() => this.innerHTML = '<i class=\\'fa-regular fa-copy\\'></i> Kopiuj', 2000);"
          class="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 shrink-0 min-h-[44px]"
          title="Kopiuj werset do schowka"
        >
          <i class="fa-regular fa-copy"></i>
          <span>Kopiuj</span>
        </button>
      </div>

      <!-- MYŚL PRZEWODNIA -->`
);

html = html.replace(
  /<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>[\s\S]*?<\/div>/,
  `<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>\n        ${THEME}\n      </div>`
);

// 6.5 Zanim otworzysz Biblie
html = html.replace(
  /<!-- LESSON BODY CONTENT[^>]*-->/,
  `<!-- LESSON BODY CONTENT (Dzień ${DAY_NUM}, 19.11.2026) -->`
);
html = html.replace(
  /<article class="kc-card">[\s\S]*?<\/article>/,
  `<article class="kc-card">
        <div class="flex items-center gap-3 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
          <i class="fa-solid fa-compass"></i>
          <span>Zanim otworzysz Biblię</span>
        </div>
        <h2 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Podróż przez 66 Ksiąg Pisma Świętego
        </h2>
        <div class="space-y-4 text-sm sm:text-base leading-relaxed text-zinc-300 font-serif">
          <p>
            Kurs „Z Biblią za Pan Brat” prowadzi przez wszystkie <strong>66 ksiąg Biblii</strong> — miesiąc po miesiącu, księga po księdze, każdego dnia jeden fragment Pisma.
          </p>
          <p>
            Dziś jest jubileuszowy <strong class="text-white">Dzień 50</strong>: Księga Wyjścia, <strong class="text-brand-gold">${READING}</strong>. Po dniach uświęcenia ludu w obozie sam Bóg ogłasza Dziesięć Przykazań.
          </p>
          <p>
            Zanim przeczytasz komentarz, otwórz własną Biblię i przeczytaj cały rozdział od wersetu 1 do 26. Zauważ, dlaczego fundamentem Dekalogu jest słowo o wyzwoleniu z domu niewoli oraz dlaczego rozdział zamyka nauka o prostym ołtarzu bez żelaznego dłuta.
          </p>
          <a href="/mojabiblia?book=EXO&chapter=20" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]"><i class="fa-solid fa-book-open"></i><span>Czytaj ${READING}</span></a>
        </div>
      </article>`
);

// 6.6 Tekst Pisma Swietego
html = html.replace(
  /<!-- SCRIPTURE SECTION[^>]*-->/,
  `<!-- SCRIPTURE SECTION (${READING}) -->`
);
html = html.replace(
  /Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 19:1–25/g,
  `Uwspółcześniona Biblia Gdańska (UBG) • ${READING}`
);
html = html.replace(
  /\/mojabiblia\?book=EXO&chapter=19/g,
  `/mojabiblia?book=EXO&chapter=20`
);
html = html.replace(
  /\/mojabiblia\?book=EXO&amp;chapter=19/g,
  `/mojabiblia?book=EXO&amp;chapter=20`
);
html = html.replace(
  /<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>\s*<!-- HEBREW STRONG CODES/,
  `<div class="kc-prose-reading">\n        ${buildVersesParagraphsHtml()}\n        </div>\n      </section>\n\n      <!-- HEBREW STRONG CODES`
);

// 6.7 Klucze Jezykowe & Kody Stronga
const strongChips50 = `<span class="strong-chip"><span class="strong-id">H5650</span> <span class="strong-orig">בֵּית עֲבָדִים (Bejt awadiim)</span> — dom niewoli, z którego Bóg najpierw wyprowadza swój lud (Wj 20:2)</span>
          <span class="strong-chip"><span class="strong-id">H7067</span> <span class="strong-orig">אֵל קַנָּא (El Kanna)</span> — Bóg zazdrosny żarliwą miłością przymierza (Wj 20:5)</span>
          <span class="strong-chip"><span class="strong-id">H2617</span> <span class="strong-orig">חֶסֶד (Chesed)</span> — niewyczerpane miłosierdzie dla tysięcy pokoleń miłujących Boga (Wj 20:6)</span>
          <span class="strong-chip"><span class="strong-id">H7723</span> <span class="strong-orig">שָׁוְא (Szaw)</span> — próżność, pustka, fałsz i nadużycie świętego Imienia PANA (Wj 20:7)</span>
          <span class="strong-chip"><span class="strong-id">H7676</span> <span class="strong-orig">שַׁבָּת (Szabat)</span> — uświęcone odpocznienie siódmego dnia na wzór Stwórcy (Wj 20:8–11)</span>
          <span class="strong-chip"><span class="strong-id">H3513</span> <span class="strong-orig">כַּבֵּד (Kawed)</span> — czcij i nadawaj wagę rodzicom, wspierając ich z wdzięcznością (Wj 20:12)</span>
          <span class="strong-chip"><span class="strong-id">H2530</span> <span class="strong-orig">חָמַד (Chamad)</span> — nieuporządkowane pożądanie serca rodzące krzywdę bliźniego (Wj 20:17)</span>
          <span class="strong-chip"><span class="strong-id">H4196</span> <span class="strong-orig">מִזְבֵּחַ (Mizbeach)</span> — prosty ołtarz z ziemi i nieciosanego kamienia bez żelaznego dłuta (Wj 20:24–26)</span>`;

html = html.replace(
  /Klucze Językowe & Kody Stronga \(Wj 19:1–25\)/g,
  `Klucze Językowe & Kody Stronga (${READING})`
);
html = html.replace(
  /Poniższe terminy hebrajskie stanowią osnowę teologiczną 19\. rozdziału Księgi Wyjścia[\s\S]*?<\/p>/,
  `Poniższe terminy hebrajskie stanowią osnowę teologiczną 20. rozdziału Księgi Wyjścia (wyprowadzenie z domu niewoli, miłosierdzie przymierza, świętość szabatu, czystość pragnień serca oraz ołtarz bez żelaznego dłuta):</p>`
);
html = html.replace(
  /<div class="flex flex-wrap gap-2">[\s\S]*?<\/div>\s*<\/section>\s*<!-- THEOLOGICAL EXEGESIS/,
  `<div class="flex flex-wrap gap-2">\n          ${strongChips50}\n        </div>\n      </section>\n\n      <!-- THEOLOGICAL EXEGESIS`
);

// 6.8 Egzegeza (5 czesci, 45 punktow)
html = html.replace(
  /Pięć części studium Wj 19:1–25 \(45 punktów analitycznych\)/g,
  `Pięć części studium ${READING} (45 punktów analitycznych)`
);

const exegesis50 = `<!-- CZĘŚĆ I -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
            PROLOG ŁASKI I PIERWSZA TABLICA — CZEŚĆ BOGA JEDYNEGO (WJ 20:1–11)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>1. Bóg sam przemawia do zgromadzenia (20:1):</strong> Wszystkie dziesięć słów wypowiada bezpośrednio Stwórca, nadając im ponadczasowy autorytet moralny.</p>
            <p><strong>2. Prolog ewangeliczny przed pierwszym nakazem (20:2):</strong> „Ja jestem PAN, twój Bóg, który cię wyprowadził z ziemi Egiptu, z domu niewoli” — dokonane wyzwolenie jest podstawą posłuszeństwa.</p>
            <p><strong>3. Zakaz rywali wobec Boga Przymierza (20:3):</strong> „Nie będziesz miał innych bogów przede mną” (<em>al-panaj</em>) odrzuca dzielenie serca między Stwórcę a bożki bezpieczeństwa, pieniądza czy prestiżu.</p>
            <p><strong>4. Ochrona transcendencji Stwórcy (20:4):</strong> Zakaz rzeźbionego posągu i podobizn stworzeń broni przed zamykaniem niewidzialnego Boga w materialnym kształcie pod kontrolą człowieka.</p>
            <p><strong>5. Bóg zazdrosny miłością przymierza (20:5):</strong> Hebrajskie <em>El Kanna</em> oznacza żarliwą wierność oblubieńczą, która nie toleruje duchowej zdrady rujnującej człowieka.</p>
            <p><strong>6. Skutki grzechu a ocean miłosierdzia (20:5–6):</strong> Nienawiść wobec Boga niszczy rodziny do trzeciego i czwartego pokolenia, lecz Jego <em>chesed</em> ogarnia tysiące pokoleń tych, którzy Go miłują.</p>
            <p><strong>7. Świętość Imienia PANA (20:7):</strong> Nadużywanie Imienia Boga „nadaremnie” (<em>szaw</em> — kłamstwem, manipulacją religijną lub lekkomyślnością) podważa zaufanie do prawdy.</p>
            <p><strong>8. Pamięć o dniu szabatu (20:8–9):</strong> Przykazanie łączy sześć dni rzetelnej pracy z siódmym dniem oddzielonym na uwielbienie i duchowe odnowienie.</p>
            <p><strong>9. Powszechna ochrona przed wyzyskiem (20:10):</strong> Prawo do odpoczynku w dniu szabatu chroni gospodarza, dzieci, sługi, służące, bydło oraz gościa w obrębie bram.</p>
            <p><strong>10. Zakorzenienie czasu w Stworzeniu (20:11):</strong> Bóg pobłogosławił i uświęcił siódmy dzień na wzór własnego stwórczego odpoczynku po sześciu dniach dzieła.</p>
          </div>
        </div>

        <!-- CZĘŚĆ II -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
            DRUGA TABLICA — MIŁOŚĆ BLIŹNIEGO I CZYSTOŚĆ SERCA (WJ 20:12–17)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>11. Piąte przykazanie pomostem między Bogiem a społeczeństwem (20:12):</strong> „Czcij swego ojca i swoją matkę” (<em>kawed</em> — nadać wagę, okazywać szacunek i wspierać w starości) niesie pierwszą obietnicę (Ef 6:2).</p>
            <p><strong>12. Nietykalność ludzkiego życia (20:13):</strong> Zakaz bezprawnego odbierania życia (<em>lo tircach</em>) broni godności człowieka stworzonego na obraz Boży, a Jezus odnosi go także do pogardy w sercu (Mt 5:21–22).</p>
            <p><strong>13. Nienaruszalność przymierza małżeńskiego (20:14):</strong> „Nie będziesz cudzołożył” osłania dom przed zdradą, sięgając w Nowym Testamencie aż do czystości spojrzenia i myśli (Mt 5:27–28).</p>
            <p><strong>14. Szacunek wobec cudzej własności (20:15):</strong> „Nie będziesz kradł” chroni uczciwą pracę i zabrania zarówno kradzieży jawnej, jak i oszustw ekonomicznych czy wyzysku.</p>
            <p><strong>15. Prawdomówność fundamentem wspólnoty (20:16):</strong> Zakaz fałszywego świadectwa przeciw bliźniemu chroni przed kłamstwem w sądach, obmową i niszczeniem dobrej opinii.</p>
            <p><strong>16. Dziesiąte przykazanie — światło w tajnikach serca (20:17):</strong> Zakaz pożądania domu, żony, sług, zwierząt czy jakiejkolwiek rzeczy bliźniego odsłania wewnętrzną chciwość (<em>chamad</em>), zanim narodzi się czyn.</p>
            <p><strong>17. Jedność dziesięciu słów (20:1–17):</strong> Cały Dekalog odzwierciedla jeden doskonały charakter Boga — wiernego, prawdziwego, sprawiedliwego i dającego życie (Jk 2:10).</p>
            <p><strong>18. Wolność od zazdrości (20:17):</strong> Kto ufa Bożej opiece i zaopatrzeniu, ten nie musi pożądać tego, co Bóg powierzył innemu człowiekowi.</p>
          </div>
        </div>

        <!-- CZĘŚĆ III -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
            TRWOGA LUDU, ROLA POŚREDNIKA I ZDROWA BOJAŹŃ BOŻA (WJ 20:18–21)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>19. Cofnięcie się przed Bożym majestatem (20:18):</strong> Widząc gromy, błyskawice, dymiącą górę i głos trąby, naród staje z daleka w głębokim wstrząsie sumienia.</p>
            <p><strong>20. Prośba o pośrednika słowa (20:19):</strong> „Ty mów do nas, a będziemy słuchać, ale niech Bóg do nas nie mówi, byśmy nie pomarli” — uznanie ludzkiej potrzeby ustanowionego pośrednictwa.</p>
            <p><strong>21. „Nie bójcie się” obok „bojaźni przed obliczem” (20:20):</strong> Mojżesz oddziela paraliżującą panikę od zdrowej, pełnej czci bojaźni Bożej, która uwalnia od pokusy grzechu.</p>
            <p><strong>22. Próba serca przy Synaju (20:20):</strong> Bóg wystawia lud na próbę (<em>nissah</em>), sprawdzając trwałość wierności po wygaśnięciu pierwszych emocji.</p>
            <p><strong>23. Wejście w gęsty mrok (20:21):</strong> Podczas gdy lud stoi z daleka, Mojżesz zbliża się do gęstego mroku (<em>arafel</em>), w którym przebywa Bóg, przyjmując dalsze prawa przymierza.</p>
            <p><strong>24. Głos z nieba świadectwem przeciw idolom (20:22):</strong> Słowo rozbrzmiewające bezpośrednio z nieba przekreśla jakąkolwiek potrzebę wizerunków czynionych ludzką ręką.</p>
            <p><strong>25. Zakaz bogów ze srebra i złota (20:23):</strong> Bogactwo kruszców nie kupuje Bożej obecności; bożki postawione „przy Bogu” są odrzucone z gruntu.</p>
          </div>
        </div>

        <!-- CZĘŚĆ IV -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
            PRAWO OŁTARZA Z ZIEMI I NIECIOSANEGO KAMIENIA (WJ 20:24–26)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>26. Ołtarz z ziemi znakiem prostoty (20:24):</strong> Spotkanie grzesznika ze Świętym Bogiem odbywa się przy prostym ołtarzu ze zwykłej ziemi, nie dzięki wspaniałej architekturze człowieka.</p>
            <p><strong>27. Całopalenia i ofiary pojednawcze (20:24):</strong> Pierwsze synajskie zestawienie ofiary całkowitego oddania (<em>olah</em>) i ofiary pokoju z Bogiem (<em>szelamim</em>).</p>
            <p><strong>28. Suwerenna inicjatywa obecności (20:24):</strong> „Na każdym miejscu, gdzie upamiętnię swoje imię, przyjdę do ciebie i będę ci błogosławił” — miejsce kultu wyznacza sam Stwórca.</p>
            <p><strong>29. Kamienie bez żelaznego dłuta (20:25):</strong> Przyłożenie żelaznego narzędzia do kamieni ołtarza bezcześci go — człowiek nie „poprawia” Bożego dzieła przebłagania.</p>
            <p><strong>30. Ostrzeżenie przed religią ludzkich zasług (20:25):</strong> Zakaz ciosania kamieni przypomina, że do zbawienia nie wolno dokładać własnej pychy i ludzkiego kunsztu moralnego (Ef 2:8–9).</p>
            <p><strong>31. Skromność bez stopni przy ołtarzu (20:26):</strong> Zakaz wysokich stopni strzeże obyczajności i wyraźnie oddziela służbę Bogu od pogańskich obrzędów.</p>
            <p><strong>32. Ołtarz wskazujący na Kalwarię (20:24–26):</strong> Surowa prostota ołtarza bez ozdób prowadzi wzrok wprost ku Jezusowi — naszym prawdziwym Pośredniku i Ołtarzu (Hbr 13:10).</p>
          </div>
        </div>

        <!-- CZĘŚĆ V -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">V</span>
            SYNTEZA EWANGELICZNA I KLUCZE JĘZYKOWE (WJ 20:1–26)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>33. Prawo święte, sprawiedliwe i dobre (Rz 7:12):</strong> Problem po grzechu nie tkwi w Dekalogu, lecz w skażeniu ludzkiego serca niezdolnego zachować go własną siłą.</p>
            <p><strong>34. Pedagog prowadzący do Chrystusa (Ga 3:24):</strong> Przykazania uświadamiają nam potrzebę Zbawiciela, który wyrywa z bezsilności grzechu.</p>
            <p><strong>35. Sprawiedliwość wypełniana w Duchu (Rz 8:3–4):</strong> Bóg posłał Syna w ciele, aby to, czego wymaga Prawo, wypełniało się w chodzących według Ducha.</p>
            <p><strong>36. Asaret ha-Dewarim (עֲשֶׂרֶת הַדְּבָרִים):</strong> Dziesięć Słów przymierza (Wj 34:28; Pwt 4:13) jako zwarty kodeks wierności.</p>
            <p><strong>37. Bejt awadiim (בֵּית עֲבָדִים):</strong> Dom niewoli, z którego Bóg najpierw wykupuje człowieka swoją mocą.</p>
            <p><strong>38. El Kanna (אֵל קַנָּא):</strong> Żarliwa miłość Boga broniąca więzi przymierza przed bałwochwalstwem.</p>
            <p><strong>39. Chesed (חֶסֶד):</strong> Stałe miłosierdzie przymierza okazywane tysiącom pokoleń miłujących PANA.</p>
            <p><strong>40. Szaw (שָׁוְא):</strong> Pustka, fałsz i lekkomyślne branie Imienia Bożego nadaremnie.</p>
            <p><strong>41. Szabat (שַׁבָּת):</strong> Rytm pracy i błogosławionego odpocznienia wspólny dla wszystkich domowników.</p>
            <p><strong>42. Kawed (כַּבֵּד):</strong> Okazanie należnej czci i realnego wsparcia ojcu oraz matce.</p>
            <p><strong>43. Chamad (חָמַד):</strong> Pożądanie w głębi serca zdemaskowane przez dziesiąte przykazanie.</p>
            <p><strong>44. Nissah (נִסָּה):</strong> Boża próba budująca trwałą, oczyszczającą bojaźń przed grzechem.</p>
            <p><strong>45. Mizbeach (מִזְבֵּחַ):</strong> Ołtarz Boży z ziemi i nieciosanego kamienia — zapowiedź łaski w Chrystusie.</p>
          </div>
        </div>`;

html = html.replace(
  /<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── JEZUS W CENTRUM ── -->/,
  `<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">\n        ${exegesis50}\n        </div>\n      </section>\n\n      <!-- ── JEZUS W CENTRUM ── -->`
);

// 6.9 Jezus w Centrum
const jesus50 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Chrystus Wypełnieniem Dekalogu, Naszym Pośrednikiem i Prawdziwym Ołtarzem
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            <strong>1. „Nie przyszedłem znieść, lecz wypełnić” (Mt 5:17–48):</strong> Jezus w Kazaniu na Górze potwierdza świętość Dziesięciu Przykazań i sięga w głąb serca: ukazuje, że korzeń zabójstwa tkwi w gniewie i pogardzie, a korzeń cudzołóstwa w pożądliwym spojrzeniu.
          </p>
          <p>
            <strong>2. Doskonałe posłuszeństwo w naszym imieniu (Rz 5:19; Hbr 4:15):</strong> Jako jedyny człowiek na ziemi Jezus Chrystus wypełnił w stu procentach każdą literę i ducha Dziesięciu Przykazań — miłując Ojca ponad wszystko i bliźniego aż po oddanie życia.
          </p>
          <p>
            <strong>3. Wykupienie od przekleństwa złamanego Prawa (Ga 3:13; Kol 2:14):</strong> Ponieważ każdy z nas złamał przykazania, Chrystus przybił zapis dłużny naszych win do krzyża i zniósł ciążące nad nami potępienie.
          </p>
          <p>
            <strong>4. Przykazania wypisane w sercach Duchem Świętym (Jr 31:33; 2 Kor 3:3; Hbr 8:10):</strong> W Nowym Przymierzu Bóg nie pozostawia wierzącego przed zimnym kamieniem żądań — przez Ducha Świętego wpisuje swoje Prawo w odnowione serca, rodząc posłuszeństwo z wdzięczności.
          </p>
          <p>
            <strong>5. Jedyny Pośrednik i Ołtarz bez żelaznego dłuta (1 Tm 2:5; Hbr 13:10):</strong> Drżący lud pod Synajem wołał o pośrednika; Jezus stał się naszym Arcykapłanem i Ołtarzem, do którego nikt nie przykłada żelaznego narzędzia ludzkich zasług.
          </p>
          <p>
            <strong>6. Streszczenie w miłości Boga i bliźniego (Mt 22:37–40; Rz 13:8–10):</strong> Cała pierwsza i druga tablica łączą się w miłości, która nie czyni bliźniemu zła i stawia żywego Boga ponad wszystko.
          </p>
          <div class="pt-2">
            <a href="/mojabiblia?book=EXO&chapter=20" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
              <i class="fa-solid fa-book-open"></i>
              <span>Czytaj ${READING}</span>
            </a>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── JEZUS W CENTRUM ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-cross"><\/i>\s*<span>Jezus w centrum<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── SPRAWDŹ W BIBLII ── -->)/,
  `$1${jesus50}\n      $2`
);

// 6.10 Sprawdz w Biblii
const compare50 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Sprawdź w Biblii — 12 Wersetów Porównawczych (${READING})
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300 font-serif">
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 20:2 → Rz 6:17–18</strong>: Jak wyprowadzenie z niewoli staje się fundamentem nowego posłuszeństwa w Chrystusie?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 20:3 → Mt 4:10</strong>: Jak Jezus użył słowa o wyłącznej czci Pana Boga podczas kuszenia na pustyni?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 20:4 → Kol 1:15; J 4:24</strong>: Dlaczego Chrystus jest jedynym prawdziwym obrazem niewidzialnego Boga?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 20:8–11 → Mk 2:27–28; Hbr 4:9–10</strong>: Co oznacza, że Syn Człowieczy jest Panem szabatu i daje odpocznienie ludowi Bożemu?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 20:12 → Ef 6:1–3</strong>: Jak apostoł Paweł odnawia piąte przykazanie jako pierwsze opatrzone obietnicą?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 20:13–14 → Mt 5:21–28</strong>: W jaki sposób Jezus odkrywa duchowe korzenie zabójstwa i cudzołóstwa w myślach serca?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 20:15 → Ef 4:28</strong>: Co według Nowego Testamentu ma zastąpić kradzież w życiu wierzącego?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 20:16 → Ef 4:25</strong>: Dlaczego prawda w mowie jest konieczna między członkami jednego ciała Chrystusa?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 20:17 → Rz 7:7; Kol 3:5</strong>: Jak przykazanie przeciw pożądaniu odsłoniło w Pawle prawdziwy stan serca?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 20:18–21 → Hbr 12:18–24</strong>: Dlaczego zamiast drżącej góry Synaj przystępujemy dziś do Pośrednika na Górze Syjon?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 20:25 → Ef 2:8–9; Hbr 13:10</strong>: Co łączy zakaz żelaznego dłuta przy ołtarzu z prawdą o zbawieniu z łaski, nie z uczynków?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 20:1–17 → Mt 22:37–40; Rz 13:8–10</strong>: Jak dwa przykazania miłości streszczają cały Dekalog?</div>
        </div>`;

html = html.replace(
  /(<!-- ── SPRAWDŹ W BIBLII ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-magnifying-glass"><\/i>\s*<span>Porównaj wersety we własnym Piśmie Świętym<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── PRAWDA NA DZIŚ ── -->)/,
  `$1${compare50}\n      $2`
);

// 6.11 Prawda na dzis
const truth50 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          8 Zasad Dekalogu dla Codzienności — Prawo Wolności Przymierza
        </h3>
        <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>• <strong>1. Łaska zawsze wyprzedza wymagania:</strong> Bóg nie daje Dekalogu, abyś zasłużył na wyjście z niewoli — najpierw wyprowadza Cię z Egiptu w Chrystusie, a potem uczy wolnego życia.</p>
          <p>• <strong>2. Każde przykazanie jest murem ochronnym miłości:</strong> Zakazy Boże nie ograniczają radości, lecz bronią Cię przed bożkami, samotnością, rozpadem domu i goryczą.</p>
          <p>• <strong>3. Odpoczynek w Bogu uzdrawia gonitwę świata:</strong> Rytm pracy i świętego czasu przypomina, że świat trwa dzięki Stwórcy, a nie naszemu wyczerpaniu.</p>
          <p>• <strong>4. Szacunek dla rodziców utrwala błogosławieństwo pokoleń:</strong> Troska o ojca i matkę kształtuje odpowiedzialną i trwałą wspólnotę.</p>
          <p>• <strong>5. Życie, wierność, własność i prawda wymagają codziennej troski:</strong> Chrześcijanin chroni dobre imię nieobecnych ludzi i uczciwość w najdrobniejszych sprawach.</p>
          <p>• <strong>6. Bitwa rozgrywa się w pragnieniach serca:</strong> Dziesiąte przykazanie uczy wdzięczności, która rozbraja zazdrość zanim pojawi się czyn.</p>
          <p>• <strong>7. Nie „wyrzeźbisz” zbawienia własnym dłutem:</strong> Tak jak ołtarz miał pozostać z nieciosanego kamienia, tak przed Bogiem stajemy wyłącznie dzięki ofierze Chrystusa.</p>
          <p>• <strong>8. Bojaźń Boża daje prawdziwą wolność:</strong> Kto żyje w czci przed Bogiem Stwórcą, ten nie boi się ludzi i ma siłę powiedzieć „nie” pokusom grzechu.</p>
        </div>`;

html = html.replace(
  /(<!-- ── PRAWDA NA DZIŚ ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-lightbulb"><\/i>\s*<span>Prawda na dziś<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── POMYŚL ── -->)/,
  `$1${truth50}\n      $2`
);

// 6.12 Pomysl
const questions50 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Refleksja Osobista — Spójrz w Światło Słowa (${READING})
        </h3>
        <div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>1. Czy w relacji z Bogiem żyjesz jak ktoś wyprowadzony już z domu niewoli, czy jak ktoś, kto codziennie boi się o swoje przyjęcie przez Ojca?</p>
          <p>2. Co w Twoim planie dnia lub serca próbuje dziś zająć miejsce przed żywym Bogiem jako cichy, współczesny bożek?</p>
          <p>3. Czy używasz Imienia Bożego zawsze ze czcią, czy wkradły się w Twoją mowę bezmyślne skróty i puste powiedzonka?</p>
          <p>4. Jak dbasz o święty rytm odpoczynku i czy nie odbierasz innym prawa do wytchnienia nadmierną presją pracy?</p>
          <p>5. Komu ze swojej rodziny — szczególnie rodzicom — jesteś dziś winien życzliwy telefon, słowo wdzięczności lub konkretne wsparcie?</p>
          <p>6. Gdzie w świetle Chrystusa dostrzegasz w sobie ukryty gniew, zawiść lub porównywanie się z innymi i pragniesz oddać to pod Jego krew?</p>
          <p>7. Czy strzeżesz prawdy o bliźnich w rozmowach i mediach społecznościowych równie starannie, jak chronisz własną reputację?</p>
          <p>8. Czy zbliżasz się do Boga z prostotą pokory przy Chrystusowym ołtarzu łaski, rezygnując z budowania własnych duchowych zasług?</p>
        </div>`;

html = html.replace(
  /(<!-- ── POMYŚL ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-heart"><\/i>\s*<span>Pytania do serca \(Pomyśl\)<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── QUIZ ── -->)/,
  `$1${questions50}\n      $2`
);

// 6.13 Quiz naglowek
html = html.replace(
  /20 Pytań z Wj 19 \(Sprawdź swoją wiedzę\)/g,
  `20 Pytań z Wj 20 (Sprawdź swoją wiedzę)`
);
html = html.replace(/Po przeczytaniu Wj 19/g, `Po przeczytaniu Wj 20`);

// 6.14 Twoja decyzja
const decision50 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Żyj Wolnością Wyzwolonych i Oddaj Serce Panu!
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            Dwudziesty rozdział Księgi Wyjścia rozjaśnia sens całego Pisma: Bóg nigdy nie narzuca przykazań po to, aby zniewolić człowieka, lecz daje prawo wolności tym, których sam wcześniej wyprowadził z domu niewoli. Kto próbuje jednak „wyciosać” przed Nim własną doskonałość jak rzeźbiony posąg lub ozdobny ołtarz z własnych zasług, mija się zarówno z pokorą Synaju, jak i z Ewangelią krzyża.
          </p>
          <p>
            Dzięki Jezusowi Chrystusowi Prawo Boże nie jest już wyrokiem skazującym, lecz jasnym zwierciadłem i pięknym kształtem nowego życia prowadzonego przez Ducha Świętego. Podejmij dziś świadomą decyzję: przyjmij dar łaski za darmo w Jezusie i pozwól Mu pisać Dziesięć Słów miłości Boga oraz bliźniego na tablicach swojego serca!
          </p>
          <div class="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-black/40 to-transparent border border-brand-gold/40">
            <h4 class="font-bold text-amber-300 mb-2 uppercase tracking-wide text-xs">Moja Decyzja — Osobiste Wyznanie:</h4>
            <p class="italic text-white">
              „Dziękuję Ci, Panie Jezu, że wypełniłeś za mnie wymagania całego Dekalogu i wykupiłeś mnie z domu niewoli grzechu. Świadomie wybieram dziś posłuszeństwo płynące z miłości i wdzięczności: pragnę usuwać wszelkie bożki z mojego serca, czcić Twoje Imię i święty czas, szanować bliskich oraz strzec czystości myśli, słów i czynów mocą Ducha Świętego.”
            </p>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── TWOJA DECYZJA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-flag-checkered"><\/i>\s*<span>Twoja decyzja<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── MODLITWA ── -->)/,
  `$1${decision50}\n      $2`
);

// 6.15 Modlitwa
html = html.replace(
  /<span>Modlitwa na 18 listopada<\/span>/g,
  `<span>Modlitwa na 19 listopada</span>`
);
const prayer50 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Modlitwa o Wdzięczność za Wyzwolenie i Prawo Wolności Wpisane w Serce
        </h3>
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed space-y-3">
          <p>
            Wszechmogący, Święty Boże i Miłosierny Wybawicielu z domu niewoli! Staję dziś przed Tobą w ten czwartkowy dzień ze czcią i głęboką wdzięcznością za Dziesięć Słów Twojego Przymierza. Dziękuję Ci, że zanim dałeś jakiekolwiek przykazanie, pierwszy przyszedłeś nas ocalić i wyprowadzić do wolności dzieci Bożych.
          </p>
          <p>
            Wyznaję przed Tobą wszystkie moje wykroczenia przeciw Twojemu świętemu Prawu — zarówno czyny i słowa, jak i ukryte pragnienia zawiści, gniewu, bożków mojego serca oraz pośpiechu odbierającego czas dla Ciebie. Przepraszam Cię za każdą próbę budowania własnej sprawiedliwości zamiast zaufania jedynej ofierze Jezusa Chrystusa.
          </p>
          <p>
            Panie Jezu Chryste, jedyny Pośredniku między Bogiem a ludźmi i nasz prawdziwy Ołtarzu! Dziękuję Ci, że przez swoją krew zmyłeś mój dług i wypisujesz dziś Twoje przykazania wolności na żywych tablicach mojego serca. Napełnij mnie Duchem Świętym, abym w bojaźni Bożej kochał Ciebie ze wszystkich sił, a bliźniego szczerze i w prawdzie.
          </p>
          <p>
            Błogosław dzisiaj moim rodzicom, domownikom i sąsiadom. Strzeż mojego sumienia w pracy i rozmowach, abym każdym dniem głosił Twoją chwałę. Tobie niech będzie cześć i wdzięczność na wieki. Amen!
          </p>
        </div>`;

html = html.replace(
  /(<!-- ── MODLITWA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-hands-praying"><\/i>\s*<span>Modlitwa na [^<]+<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── ZASTOSOWANIE I TWÓJ ZAPIS)/,
  `$1${prayer50}\n      $2`
);

// 6.16 Zadania na dzis (7 zadan)
const tasks50 = `<label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-1" onchange="toggleTaskState(1)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>1. Przeczytaj cały fragment <a href="/mojabiblia?book=EXO&chapter=20" class="text-amber-300 underline font-semibold">Wj 20:1–26</a> w przekładzie UBG oraz równoległy fragment Mt 5:17–28.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-2" onchange="toggleTaskState(2)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>2. Naucz się na pamięć Wj 20:2–3 i przypominaj sobie przed obowiązkami, że najpierw zostałeś wykupiony z niewoli przez łaskę.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-3" onchange="toggleTaskState(3)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>3. Usuń dziś jedną rzecz lub nawyk zajmujący miejsce należne Bogu (nadmiar wiadomości, niepokój, pogoń za uznaniem).</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-4" onchange="toggleTaskState(4)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>4. Wprowadź piąte przykazanie w czyn: zadzwoń z serdecznym słowem lub pomódl się z wdzięcznością za swoich rodziców.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-5" onchange="toggleTaskState(5)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>5. Zaplanuj w kalendarzu czas wyciszonego odpoczynku ze Słowem Bożym oraz uszanuj czas odpoczynku innych osób.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-6" onchange="toggleTaskState(6)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>6. Zrób rachunek sumienia ze słów i pragnień: mów dziś czystą prawdę, strzegąc dobrego imienia innych ludzi.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-7" onchange="toggleTaskState(7)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>7. Oznacz Dzień 50 jako ukończony i udostępnij lekcję komuś, kto uważa przykazania za zimny zbiór nakazów.</span>
          </label>`;

html = html.replace(
  /(<p class="text-zinc-200 font-semibold mb-2">Wykonaj dzisiejsze kroki formacji biblijnej:<\/p>\s*)[\s\S]*?(<\/div>\s*<div class="space-y-4 pt-2">)/,
  `$1${tasks50}\n        $2`
);

// 6.17 Zapowiedz: Jutro (Dzien 51)
const tomorrow50 = `<section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
        <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
          JUTRO — 20 LISTOPADA 2026
        </div>
        <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
          DZIEŃ 51 — PRAWO PRZYMIERZA: GODNOŚĆ SŁUGI, OCHRONA ŻYCIA I SPRAWIEDLIWOŚĆ SPOŁECZNA (Wj 21:1–36)
        </h3>
        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">
          Dzień 51: Ze szczytu Synaju przejdziemy do codziennych ustaw Przymierza. Zobaczysz, jak Boże prawo broni słabych, chroni życie poczęte i uczy odpowiedzialności przed bliźnim i Stwórcą.
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-[44px]">
            <span>Dostępne od północy (20 listopada 2026)</span>
          </span>
          <a href="/akademia/kurscodzienny" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold uppercase tracking-wider transition min-h-[44px]">
            <span>Spis wszystkich dni →</span>
          </a>
        </div>
      </section>`;

html = html.replace(
  /<!-- ── ZAPOWIEDŹ: JUTRO ── -->\s*<section class="p-6 rounded-2xl bg-\[#0E121A\][\s\S]*?<\/section>/,
  `<!-- ── ZAPOWIEDŹ: JUTRO ── -->\n      ${tomorrow50}`
);

// 6.18 JavaScript: QUIZ_DATA (20 pytan z Wj 20:1-26), DAY_KEY, completeDay50, TTS
const quizData50 = `// ── QUIZ LOGIC (20 PYTAŃ Z WJ 20:1–26) ──
    const QUIZ_DATA = [
      {
        q: "Od jakich słów Bóg rozpoczął ogłoszenie Dziesięciu Przykazań w Wj 20:2?",
        a: ["Będziecie przestrzegać wszystkich moich ustaw i wyroków", "Ja jestem PAN, twój Bóg, który cię wyprowadził z ziemi Egiptu, z domu niewoli", "Zbudujcie mi wspaniałą świątynię z cedrów i złota", "Oto zawieram przymierze na pustyni Paran"],
        c: 1
      },
      {
        q: "Jak brzmi pierwsze przykazanie zapisane w Wj 20:3?",
        a: ["Nie będziesz miał innych bogów przede mną", "Będziesz składał ofiary na każdym wzgórzu", "Pamiętaj o świętach nowiu", "Nie oddawaj czci aniołom na niebie"],
        c: 0
      },
      {
        q: "Czego zabrania drugie przykazanie w Wj 20:4–5?",
        a: ["Pisania ksiąg historycznych i kronik", "Czynienia sobie żadnego rzeźbionego posągu ani żadnej podobizny oraz oddawania im pokłonu i służenia im", "Malowania domów na biało", "Stawiania znaków drogowych na pustyni"],
        c: 1
      },
      {
        q: "Jakim określeniem Bóg opisuje Siebie w Wj 20:5, mówiąc o wyłączności przymierza?",
        a: ["Bóg daleki i nieznany", "Bóg zazdrosny", "Bóg obojętny na grzech", "Bóg jednej tylko góry"],
        c: 1
      },
      {
        q: "Komu PAN okazuje miłosierdzie aż do tysięcznych pokoleń w Wj 20:6?",
        a: ["Tysiącom tych, którzy Go miłują i strzegą Jego przykazań", "Wyłącznie najbogatszym rodom w obozie", "Tym, którzy zbudują najwyższe ołtarze", "Każdemu, kto kłania się złotym cielcom"],
        c: 0
      },
      {
        q: "Dlaczego w trzecim przykazaniu (Wj 20:7) nie wolno brać imienia PANA nadaremnie?",
        a: ["Ponieważ ludzie mogli zapomnieć jego wymowy", "Gdyż PAN nie zostawi bez kary tego, który bierze Jego imię nadaremnie", "Ponieważ wolno je wymawiać tylko w Egipcie", "Ponieważ w ten sposób skraca się podróż przez pustynię"],
        c: 1
      },
      {
        q: "Ile dni według Wj 20:9 należy pracować i wykonywać wszystkie swoje prace?",
        a: ["Pięć dni", "Sześć dni", "Siedem dni bez przerwy", "Cztery dni w tygodniu"],
        c: 1
      },
      {
        q: "Kogo według Wj 20:10 obejmuje zakaz wykonywania pracy w siódmym dniu szabatu?",
        a: ["Jedynie starszych ludu i kapłanów", "Nikogo prócz kobiet i dzieci", "Ciebie, twego syna, twoją córkę, sługę, służącą, twoje bydło i twego gościa w obrębie twoich bram", "Wyłącznie cudzoziemców z sąsiednich miast"],
        c: 2
      },
      {
        q: "Jakie stwórcze uzasadnienie dnia szabatu podaje Wj 20:11?",
        a: ["PAN wyprowadził lud przez Jordan siódmego dnia", "PAN bowiem przez sześć dni stworzył niebo i ziemię, morze i wszystko w nich, a siódmego dnia odpoczął", "Na pustyni co siódmy dzień padał deszcz złota", "Tak nakazali doradcy z Midianu"],
        c: 1
      },
      {
        q: "Jaka obietnica została dołączona do piątego przykazania o czci dla ojca i matki w Wj 20:12?",
        a: ["Natychmiastowe bogactwo w srebrze", "Aby twoje dni były długie na ziemi, którą PAN, twój Bóg, da tobie", "Zwolnienie z wszelkich ofiar w przybytku", "Wyłączne panowanie nad Egiptem"],
        c: 1
      },
      {
        q: "Jakie cztery krótkie zakazy moralne następują kolejno w wersetach Wj 20:13–16?",
        a: ["Nie jedz mięsa, nie pij wina, nie wychodź z namiotu, nie spóźniaj się", "Nie będziesz zabijał, nie będziesz cudzołożył, nie będziesz kradł, nie będziesz fałszywie świadczył przeciw twemu bliźniemu", "Nie buduj domów z cegły, nie siej pszenicy, nie kupuj wołów, nie handluj z sąsiadami", "Nie czytaj zwojów, nie mów głośno, nie śpiewaj pieśni, nie rozpalaj ognia"],
        c: 1
      },
      {
        q: "Co konkretnie wymienia dziesiąte przykazanie przeciw pożądliwości w Wj 20:17?",
        a: ["Złotych mieczy i rydwanów faraona", "Domu twego bliźniego, żony twego bliźniego, jego sługi, służącej, wołu, osła ani żadnej rzeczy należącej do twego bliźniego", "Wielkich miast nad Eufratem", "Szat arcykapłańskich Aarona"],
        c: 1
      },
      {
        q: "Jak zareagował cały lud, widząc gromy, błyskawice, dymiącą górę i słysząc głos trąby w Wj 20:18?",
        a: ["Wszedł odważnie na szczyt góry bez pozwolenia", "Cofnął się i stanął z daleka", "Zatańczył wokół ogniska", "Odwrócił się z powrotem do Egiptu"],
        c: 1
      },
      {
        q: "Z jaką prośbą lud zwrócił się do Mojżesza w Wj 20:19?",
        a: ["Aby poprosił o wodę i mannę z nieba", "Ty mów do nas, a będziemy słuchać, ale niech Bóg do nas nie mówi, byśmy nie pomarli", "Aby Mojżesz wrócił na pustynię do Jetry", "Aby zburzyć górę Synaj"],
        c: 1
      },
      {
        q: "W jakim celu według wyjaśnień Mojżesza w Wj 20:20 Bóg przyszedł i wystawił lud na próbę?",
        a: ["Aby zniszczyć cały obóz na pustyni", "Żeby Jego bojaźń była przed waszym obliczem, byście nie grzeszyli", "Aby pokazać swoją przewagę nad górami Midianu", "Aby odebrać im dobytek"],
        c: 1
      },
      {
        q: "Dokąd zbliżył się Mojżesz w Wj 20:21, podczas gdy lud stał z daleka?",
        a: ["Do brzegu Morza Czerwonego", "Do gęstego mroku, w którym był Bóg", "Do miasta Ramzesa", "Do namiotów pokolenia Judy"],
        c: 1
      },
      {
        q: "Jakiego zakazu ponownie udzielił PAN bezpośrednio po stwierdzeniu, że przemawiał z nieba (Wj 20:22–23)?",
        a: ["Zakazu opuszczania pustyni przez rok", "Zakazu czynienia przy Nim bogów ze srebra ani bogów ze złota", "Zakazu rozmów między plemionami", "Zakazu noszenia pierścieni"],
        c: 1
      },
      {
        q: "Z czego według Wj 20:24 Izraelici mieli czynić ołtarz i jakich ofiar jest tam mowa?",
        a: ["Z czystego złota z kadzidłem i mirrą", "Z ziemi, by składać całopalenia i ofiary pojednawcze z owiec i bydła", "Z drewna akacjowego i marmuru", "Z cegieł wypalanych w Egipcie"],
        c: 1
      },
      {
        q: "Czego nie wolno było używać przy budowie ołtarza kamiennego według Wj 20:25 i dlaczego?",
        a: ["Kamieni z rzeki, bo były zbyt gładkie", "Ciosanego kamienia ani żelaznego narzędzia, gdyż przyłożenie żelaznego narzędzia zbezcześciłoby ołtarz", "Bieli wapna z powodu upału", "Więcej niż dwóch kamieni naraz"],
        c: 1
      },
      {
        q: "Dlaczego według Wj 20:26 nie należało wstępować po stopniach do ołtarza PANA?",
        a: ["Aby się nie poślizgnąć na pustynnym piasku", "Aby nagość nie była przy nim odkryta", "Ponieważ kamienie były zbyt kruche", "Aby oszczędzać obuwie w drodze do Kanaanu"],
        c: 1
      }
    ];`;

html = html.replace(
  /\/\/ ── QUIZ LOGIC[\s\S]*?const QUIZ_DATA = \[[\s\S]*?\];/,
  quizData50
);
html = html.replace(
  /Doskonale! Znasz na wskroś 19\. rozdział Księgi Wyjścia!/g,
  `Doskonale! Znasz na wskroś 20. rozdział Księgi Wyjścia!`
);

html = html.replace(/kc_day49_/g, `kc_day${DAY_NUM}_`);
html = html.replace(/DAY_KEY = 'kc_day49'/g, `DAY_KEY = 'kc_day${DAY_NUM}'`);
html = html.replace(/completeDay49/g, `completeDay${DAY_NUM}`);
html = html.replace(
  /Oznacz Dzień 49 jako ukończony/g,
  `Oznacz Dzień ${DAY_NUM} jako ukończony`
);
html = html.replace(/Dzień 49 ukończony!/g, `Dzień ${DAY_NUM} ukończony!`);
html = html.replace(
  /new SpeechSynthesisUtterance\("[^"]+"\)/,
  `new SpeechSynthesisUtterance("${MEMORY_VERSE_QUOTE} Księga Wyjścia 20:2–3.")`
);

// Upewnienie się, że skrypt cc-daily-course-share.js nie ma resztek i tagi są czyste
fs.mkdirSync(QUEUE_DIR, { recursive: true });
fs.writeFileSync(path.join(QUEUE_DIR, 'lekcja.html'), html, 'utf8');

fs.writeFileSync(
  path.join(QUEUE_DIR, 'meta.json'),
  JSON.stringify(
    {
      data: DATE_STR,
      dzien: DAY_NUM,
      zatwierdzil: 'Cezary Rogowski (L0)',
      zatwierdzono: '2026-11-19T05:11:12+01:00',
      przygotowal: '@A001 (antigravity)',
      przygotowano: new Date().toISOString(),
      status: 'approved_l0_for_publication',
      karta: {
        tytul: `Dzień ${DAY_NUM}: Dziesięć Przykazań (Wj 20:1–26)`,
        opis:
          'Ogłoszenie Dekalogu na Synaju: wyzwolenie fundamentem Prawa, 10 słów miłości, zdrowa bojaźń Boża oraz ołtarz bez żelaznego dłuta wskazujący na Chrystusa.',
      },
    },
    null,
    2
  ),
  'utf8'
);

const rozwazanieJson = {
  id: `ref_day${DAY_NUM}_${DATE_STR}`,
  day: DAY_NUM,
  date: DATE_STR,
  dateFormatted: DATE_FORMATTED,
  title: `☀️ Z Biblią za Pan Brat — Dzień ${DAY_NUM}: ${TITLE}`,
  book: BOOK,
  reading: READING,
  memoryVerse: MEMORY_VERSE,
  theme: THEME,
  fullText: v1TtsText,
  contentApp: v1TtsText,
  contentWeb: v2WebText,
  contentSms: v3SmsText,
  tvScript: v4VideoText,
  ccnArticle: v5ArticleText,
  imageUrl: `/${IMG_REL_PATH}`,
  authorName: 'Cezary Rogowski',
  authorUid: 'admin',
  authorSlug: 'cezaryrgowski',
  publishedAt: `${DATE_STR}T00:00:00.000Z`,
  status: 'approved_l0',
};

fs.writeFileSync(
  path.join(QUEUE_DIR, 'rozwazanie.json'),
  JSON.stringify(rozwazanieJson, null, 2),
  'utf8'
);

console.log(
  `✅ Zapisano kompletny pakiet przedpublikacyjny w kolejka-publikacji/kurs-codzienny/${DATE_STR}/ (lekcja.html, meta.json, rozwazanie.json, obrazy/${IMG_FILENAME})`
);
