import fs from 'node:fs';
import path from 'node:path';
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
const DAY_NUM = 57;
const DATE_STR = '2026-11-26';
const DATE_FORMATTED = '26 LISTOPADA 2026 R. (CZWARTEK)';
const DATE_SHORT_UPPER = '26 LISTOPADA 2026 • CZWARTEK';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 27:1–21';
const TITLE = 'OŁTARZ CAŁOPALENIA, DZIEDZINIEC PRZYBYTKU I OLIWA DO ŚWIECZNIKA';
const SUBTITLE =
  'Miedziany ołtarz ofiarny na progu łaski, biały dziedziniec sprawiedliwości z jedną szeroką bramą oraz czysta wytłoczona oliwa podtrzymująca nieustanny płomień przed PANEM (Wj 27:1–21)';

const EXO27_PATH = path.join(REPO, 'data/bible/ubg-2025/EXO-027.json');
const exo27Data = JSON.parse(fs.readFileSync(EXO27_PATH, 'utf8'));
const verses = exo27Data.verses;

const v20 = verses.find((v) => v.number === 20)?.text || '';
const MEMORY_VERSE_QUOTE = v20.trim();
const MEMORY_VERSE = `„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 27:20 (UBG)`;

const THEME =
  'Dwudziesty siódmy rozdział Księgi Wyjścia wyprowadza nas na dziedziniec Przybytku — tam, gdzie każdy Izraelita mógł wejść przez jedną szeroką, dwudziestołokciową bramę wschodnią (Wj 27:16) i natychmiast stanąć przed kwadratowym, miedzianym ołtarzem całopalenia z czterema rogami na narożnikach (Wj 27:1–8). Zanim ktokolwiek zbliżył się do wnętrza świątyni, musiał zatrzymać się przy ołtarzu ofiary — obrazie krzyża Golgoty, na którym Jezus Chrystus wziął na siebie ogień Bożego sądu za nasze grzechy (Hbr 13:10–12). Cały dziedziniec o wymiarach stu na pięćdziesiąt łokci otaczały białe zasłony ze skręconego bisioru, zawieszone na słupach ze srebrnymi haczykami i miedzianymi podstawkami (Wj 27:9–19) — granica Bożej sprawiedliwości i zarazem szerokie zaproszenie łaski! Rozdział zamyka się wzruszającym nakazem przynoszenia czystej, wytłoczonej oliwy z oliwek, „aby lampy zawsze się paliły” od wieczora aż do poranka (Wj 27:20–21) — obrazem Ducha Świętego, którego ogień w naszym sercu nigdy nie powinien zgasnąć!';

const IMG_FILENAME = 'kc_day_57_oltarz_dziedziniec_oliwa.jpg';
const IMG_REL_PATH = `images/academy/daily/${IMG_FILENAME}`;
const IMG_CAPTION =
  'Ilustracja biblijna: Dziedziniec Przybytku Mojżeszowego — miedziany ołtarz całopalenia z czterema rogami, białe zasłony z bisioru, szeroka brama wschodnia i czysta oliwa do wiecznego płomienia — Wj 27:1–21';
const QUEUE_DIR = path.join(REPO, `kolejka-publikacji/kurs-codzienny/${DATE_STR}`);

const imgFullPath = path.join(REPO, IMG_REL_PATH);
if (!fs.existsSync(imgFullPath)) {
  throw new Error(`Brak wygenerowanej grafiki Dnia 57: ${imgFullPath}`);
}

function buildVersesParagraphsHtml() {
  const sections = [
    {
      heading:
        'KSIĘGA WYJŚCIA 27:1–8 — Miedziany ołtarz całopalenia z drewna akacjowego, cztery rogi, krata i naczynia ofiarne',
      from: 1,
      to: 8,
      extraClass: 'mb-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 27:9–19 — Dziedziniec Przybytku (100 × 50 łokci), białe zasłony z bisioru, szeroka brama wschodnia i słupy',
      from: 9,
      to: 19,
      extraClass: 'my-6 pt-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 27:20–21 — Czysta, wytłoczona oliwa z oliwek i nieustanny płomień lamp od wieczora aż do poranka',
      from: 20,
      to: 21,
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
            `<p><span class="verse-num">27:${v.number}</span> ${v.text}</p>`
        )
        .join('\n        ');
      return `${header}\n        ${ps}`;
    })
    .join('\n        ');
}

function buildVersesDocxText() {
  return verses.map((v) => `${v.number}. ${v.text}`).join('\n');
}

// ── 1. PAKIET 5 WERSJI ROZWAŻAŃ (Standard Antigravity) ──
const v1TtsText = `☀️ Z Biblią za Pan Brat — Dzień Pięćdziesiąty Siódmy

**Czy zdajesz sobie sprawę, że w samym środku pustynnej nocy przed obliczem Boga musiało płonąć nieustanne światło z czystej, wytłoczonej oliwy, a droga do tego światła zaczynała się zawsze przy miedzianym ołtarzu łaski?**

Zatrzymaj się w ten czwartkowy poranek, dwudziestego szóstego listopada dwa tysiące dwudziestego szóstego roku. Pomyśl przez chwilę o progu, przez który wchodzisz w każdy nowy dzień: kiedy przychodzisz do Boga ze swoimi zmaganiami, winą albo zmęczeniem, co spotykasz jako pierwsze? Zamknięte drzwi i mur wymagań, czy szeroką bramę i miejsce przebaczenia? Tato, dlaczego tak często próbujemy zasłużyć na Twoją bliskość własnym wysiłkiem, zamiast najpierw stanąć przy ołtarzu Twojej łaski i przyjąć światło Twojego Ducha?

W dwudziestym siódmym rozdziale Księgi Wyjścia Bóg opisuje dziedziniec Przybytku — jedyną część świątyni, na którą wchodził każdy zwykły człowiek z ludu. Kiedy przekraczałeś szeroką, barwną bramę wschodnią, pierwszą rzeczą przed Twoimi oczami był potężny, kwadratowy ołtarz całopalenia z drewna akacjowego pokrytego miedzią, z czterema rogami na narożnikach i miedzianą kratą sięgającą połowy wysokości. Wokół rozciągały się wysokie, śnieżnobiałe zasłony ze skręconego bisioru, zawieszone na słupach ze srebrnymi haczykami i miedzianymi podstawkami — jasny znak, że lud Boży otacza czystość i porządek, ale brama łaski pozostaje szeroko otwarta. Na końcu rozdziału Bóg wydaje uroczysty nakaz dla całego ludu: niech przyniosą czystą, wytłoczoną oliwę do oświetlenia, aby lampy przed Arką Świadectwa zawsze się paliły — od wieczora aż do poranka, jako wieczna ustawa!

Psychologia życia duchowego potwierdza, że nikt nie utrzymuje wewnętrznego światła siłą samego przymusu — lampa świeci jasno tylko wtedy, gdy regularnie dolewa się do niej czystego paliwa miłości i prawdy. A najczystsza oliwa w starożytności powstawała wtedy, gdy oliwki były delikatnie tłoczone, bez domieszek i pośpiechu.

Prawda Królestwa uderza z wyzwalającą mocą: każdy obraz dwudziestego siódmego rozdziału Księgi Wyjścia prowadzi nas wprost pod krzyż Jezusa Chrystusa! Miedziany ołtarz całopalenia był zapowiedzią Golgoty, gdzie Baranek Boży poniósł cały ogień sądu za nasz grzech, abyśmy mogli wejść dalej w pokoju. Cztery rogi ołtarza wskazywały na cztery strony świata — zbawienie jest otwarte dla każdego człowieka na ziemi! Szeroka, jedyna brama dziedzińca utkana z błękitu, purpury, karmazynu i białego bisioru to sam Jezus, który powiedział, że to On jest drzwiami dla owiec. A czysta, wytłoczona oliwa płonąca nieustannie w ciemności nocy to dar Ducha Świętego, wyproszony przez mękę Jezusa w ogrodzie Getsemani — czyli w miejscu tłoczni oliwnej — aby Twoje serce nigdy nie zgasło w mrokach tego świata!

Jezus mówi dziś do Ciebie:
„Ja jestem drzwiami. Jeśli ktoś wejdzie przeze mnie, będzie zbawiony; wejdzie i wyjdzie, i znajdzie pastwisko.” (Ewangelia według świętego Jana, rozdział dziesiąty, werset dziewiąty, UBG)

Zadanie Taktyczne:
Na swoim czwartkowym posterunku zatrzymaj się dziś świadomie przy ołtarzu krzyża — oddaj Bogu jedną konkretną troskę lub winę i przyjmij Jego pełne przebaczenie. Nie noś dziś ciężaru samowystarczalności ani narzekania, lecz wyznaj z wiarą: Jezus Chrystus jest moją jedyną bramą do Ojca, a czysta oliwa Jego Ducha podtrzymuje mój płomień od wieczora aż do poranka! Poświęć kwadrans na spokojną modlitwę i lekturę Pisma Świętego.

W Christian Culture aplikacje i portale są dla Ciebie zawsze bezpłatne.

Modlitwa Bojowa:
Ojcze w niebie, dziękuję Ci za dwudziesty siódmy rozdział Księgi Wyjścia — za miedziany ołtarz pojednania, białe zasłony sprawiedliwości zawieszone na srebrze odkupienia i szeroką bramę łaski otwartą od wschodu. Przepraszam Cię za chwile, w których próbowałem dźwigać własne winy bez krzyża albo pozwalałem, by płomień mojego serca przygasał w pośpiechu bez czystej oliwy Twojego Słowa. Panie Jezu Chryste, Ty jesteś moim Ołtarzem, moją Bramą i moim Arcykapłanem, który czuwa nad lampami naszych serc przez całą noc tego świata. Napełniaj mnie dziś czystą oliwą Ducha Świętego, oczyszczaj moje myśli i prowadź przez cały czwartek w pokoju i prawdzie. Tobie chwała na wieki. Amen.

Rozkaz Dnia (Zadbaj o wzrost):
Zbuduj dziś swoje życie według wiernego wzoru Pisma Świętego przez sześćdziesiąt sześć miesięcy codziennej formacji biblijnej w akademii. Czytaj codziennie jeden rozdział, dziel się światłem Ewangelii z bliskimi i wzrastaj we wspólnocie wiary.

Błogosławieństwo:
Niech Pan zastępów otacza Twój dom pokojem krzyża i bielą swojej sprawiedliwości, niech czysta oliwa Ducha Świętego rozświetla każdą Twoją decyzję tego czwartku, a obecność Jezusa prowadzi Cię od wieczora aż do poranka. Dobrego dnia! Podaj dalej.`;

if (/[0-9]/.test(v1TtsText)) {
  throw new Error('BŁĄD STANDARD_PRODUKCYJNY: Wersja 1 TTS zawiera cyfry arabskie!');
}

const v2WebText = `☀️ Z Biblią za Pan Brat — Dzień 57 (26 listopada 2026 r., Czwartek)
📖 Księga Wyjścia 27:1–21: Ołtarz Całopalenia, Dziedziniec Przybytku i Oliwa do Świecznika

Czy wiesz, dlaczego pierwszą rzeczą za szeroką bramą Przybytku nie był złoty tron, lecz miedziany ołtarz ofiarny — i w jaki sposób czysta, wytłoczona oliwa zapowiada dar Ducha Świętego z ogrodu Getsemani?

W 57. dniu codziennej formacji biblijnej (https://polskieradio.cc/akademia#kurscodzienny) otwieramy 27. rozdział Księgi Wyjścia (Wj 27:1–21: https://polskieradio.cc/mojabiblia?book=EXO&chapter=27). Po wnętrzu świątyni wychodzimy na dziedziniec Przybytku, gdzie spotykają się sprawiedliwość Boga i szerokie zaproszenie łaski: miedziany ołtarz całopalenia o wymiarach 5 × 5 × 3 łokcie z czterema rogami na cztery strony świata (Wj 27:1–8), dziedziniec 100 × 50 łokci ze śnieżnobiałego bisioru na srebrnych haczykach odkupienia z jedną szeroką na 20 łokci bramą od wschodu (Wj 27:9–19) oraz nakaz przynoszenia czystej, wytłoczonej oliwy, „aby lampy zawsze się paliły” od wieczora aż do poranka (Wj 27:20–21). Wybieraj dzisiaj świadomie: zaczynaj każdy dzień pod krzyżem Chrystusa i pielęgnuj nieustanny płomień Ducha Świętego w swoim sercu!

Jezus mówi dziś do Ciebie:
• „Rozkażesz synom Izraela, aby przynieśli do ciebie czystą, wytłoczoną oliwę do oświetlenia, aby lampy zawsze się paliły.” (Wj 27:20, UBG)
• „Ja jestem drzwiami. Jeśli ktoś wejdzie przeze mnie, będzie zbawiony; wejdzie i wyjdzie, i znajdzie pastwisko.” (J 10:9, UBG)

Zadanie Taktyczne:
• Czytaj: Wj 27:1–21 oraz Hbr 13:10–16 i Mt 25:1–13.
• Wierz: Jezus Chrystus jest Twoim Ołtarzem pojednania, jedyną Bramą do Ojca i Arcykapłanem pielęgnującym światło Twojej wiary.
• Działaj: Oddaj dziś Bogu jedną konkretną troskę pod krzyżem, wykonaj cichą posługę „miedzianych kołków” dla bliskich i zasil serce kwadransem spokojnej modlitwy.

Studiuj pełny tekst UBG, 8 kodów Stronga, 45-punktową egzegezę i quiz z 20 pytaniami:
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-57

Dołącz do wspólnoty wzrostu:
💬 https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0
📻 Radio 24/7 i Biblia Audio: https://polskieradio.cc
💛 Wspieraj misję Słowa (WspieramTO): https://polskieradio.cc/wspieramto`;

const v3SmsText = `Dzień 57 (Wj 27:20): „Aby lampy zawsze się paliły”. Wejdź dziś przez szeroką bramę łaski Jezusa, złóż troski przy ołtarzu krzyża i płoń czystą oliwą Ducha! polskieradio.cc/akademia/kurscodzienny/dzien-57`;

const v4VideoText = `[OPRAWA GRAFICZNA & MUZYCZNA]
Nowoczesne, eleganckie studio Christian Culture TV w głębokiej czerni (#000000) oraz szlachetnym złocie Champagne Gold (#C4A35A / #D4AF37). Na wielkoformatowym ekranie za prowadzącymi monumentalna scena biblijna: dziedziniec Przybytku na pustyni Synaj otoczony śnieżnobiałym bisiorem, szeroka brama wschodnia w barwach błękitu, purpury, karmazynu i bieli, dymiący miedziany ołtarz całopalenia z czterema rogami oraz złota czara z czystą, wytłoczoną oliwą do świecznika. Tytuł na ekranie: „Z BIBLIĄ ZA PAN BRAT — DZIEŃ 57: OŁTARZ CAŁOPALENIA, DZIEDZINIEC PRZYBYTKU I OLIWA DO ŚWIECZNIKA (WJ 27:1–21)”.

[INTRO: PIERWSZY KROK NA DZIEDZINIEC ŁASKI]
Noemi: Dzień dobry w czwartkowy poranek! Witamy bardzo serdecznie w pięćdziesiątym siódmym dniu naszego kursu „Z Biblią za Pan Brat”! W poprzednich dwóch rozdziałach Bóg ukazał Mojżeszowi święte sprzęty i ściany wnętrza Przybytku, a dziś w dwudziestym siódmym rozdziale Księgi Wyjścia wychodzimy na dziedziniec zewnętrzny — dokładnie tam, gdzie wchodził każdy zwykły Izraelita!
Sara: Witaj Noemi, witamy wszystkich widzów Christian Culture TV! I zwróćmy uwagę na to, co człowiek widział w pierwszej sekundzie po przekroczeniu bramy dziedzińca! Nie było tam od razu złotego tronu ani tajemnych komnat — przed samym wejściem stał potężny, kwadratowy miedziany ołtarz całopalenia o wymiarach pięć na pięć łokci i wysokości trzech łokci, z czterema rogami na narożnikach!

[ANALIZA PROBLEMOWA: MIEDZIANY OŁTARZ, SZEROKA BRAMA I CZYSTA OLIWA]
Noemi: Ten porządek ma głębokie przesłanie dla każdego z nas: droga do Boga zawsze zaczyna się od pojednania i ofiary, a nie od naszych własnych zasług! Zobacz też niezwykły detal wymiarów: w piątym wersecie czytamy, że miedziana krata ołtarza sięgała dokładnie do połowy jego wysokości — czyli półtora łokcia. To dokładnie ta sama wysokość, na jakiej spoczywała złota przebłagalnia na Arce Przymierza w Miejscu Najświętszym!
Sara: Niesamowita harmonia Pisma Świętego! A wokół całego dziedzińca o wymiarach sto na pięćdziesiąt łokci rozciągały się białe zasłony ze skręconego bisioru, zawieszone na srebrnych haczykach odkupienia i miedzianych podstawkach. Co więcej, od strony wschodniej była tylko jedna brama, ale za to szeroka aż na dwadzieścia łokci — czyli około dziewięciu metrów! Jedna droga do Boga, ale szeroko otwarta dla każdego, kto chce wejść z wiarą!
Noemi: A rozdział kończy się poruszającym nakazem w dwudziestym i dwudziestym pierwszym wersecie: cały lud miał przynosić czystą, wytłoczoną oliwę z oliwek, aby lampy w Namiocie Zgromadzenia zawsze się paliły — od wieczora aż do poranka, pod czujnym okiem Aarona i jego synów!

[SŁOWO ROZKAZU: OD GOLGOTY I GETSEMANI DO NIEUSTANNEGO ŚWIATŁA]
Sara: I w tym miejscu całe Pismo Święte zbiega się w osobie Pana Jezusa Chrystusa! Miedziany ołtarz całopalenia wskazuje wprost na krzyż Golgoty, gdzie Jezus złożył jednorazową ofiarę za nasze grzechy, a cztery rogi ołtarza ogłaszają zbawienie dla wszystkich czterech stron świata!
Noemi: Dokładnie tak! Szeroka brama z błękitu, purpury, karmazynu i białego bisioru to sam Jezus, który powiedział w dziesiątym rozdziale Ewangelii Jana: „Ja jestem drzwiami. Jeśli ktoś wejdzie przeze mnie, będzie zbawiony”. A czysta, wytłoczona oliwa (po hebrajsku katit) przypomina nam ogród Getsemani — czyli dosłownie „tłocznię oliwną” — gdzie nasz Zbawiciel wyprosił dla nas dar Ducha Świętego, aby światło wiary płonęło w nas bez przerwy, nawet w najciemniejszą noc tego świata!

[ZADANIE TAKTYCZNE: CZYTAJ, WIERZ, DZIAŁAJ]
Noemi: Jak przeżyć dwudziesty siódmy rozdział Księgi Wyjścia w ten czwartek?
• Czytaj: dwudziesty siódmy rozdział Księgi Wyjścia oraz trzynasty rozdział Listu do Hebrajczyków, wersety od dziesiątego do szesnastego.
• Wierz: Jezus Chrystus jest Twoim Ołtarzem przebaczenia, jedyną Bramą do Ojca i Arcykapłanem strzegącym płomienia Twojego serca.
• Działaj: Złóż dziś pod krzyżem jedną konkretną troskę, wykonaj cichą posługę wiernych „miedzianych kołków” dla bliskiej osoby i poświęć kwadrans na czystą oliwę modlitwy i Słowa!

[MANIFEST: MODLITWA BOJOWA]
Sara: Pomódlmy się razem! Ojcze Niebieski, dziękujemy Ci za ołtarz łaski, białą czystość bisioru zawieszoną na srebrze odkupienia i szeroką bramę wschodnią otwartą w Jezusie Chrystusie.
Noemi: Panie Jezu, Ty cierpiałeś w tłoczni Getsemani i na ołtarzu Golgoty, abyśmy mogli chodzić w świetle. Napełniaj nas dziś czystą oliwą Twojego Ducha Świętego i strzeż naszego płomienia od wieczora aż do poranka Twojego przyjścia. W imieniu Jezusa. Amen!

[OUTRO: BŁOGOSŁAWIEŃSTWO I WZROST]
Sara: Niech pokój krzyża, wolność szerokiej bramy i nieustanne światło Ducha Świętego towarzyszą Ci przez cały ten czwartek!
Noemi: Czytaj, wierz, działaj. Dla Jezusa! Do zobaczenia jutro w dwudziestym ósmym rozdziale Księgi Wyjścia!`;

const v5ArticleText = `🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: PRÓG POJEDNANIA I WIECZNY PŁOMIEŃ — TEOLOGIA OŁTARZA, DZIEDZIŃCA I CZYSTEJ OLIWY (WJ 27:1–21)
Autor: Cezary Rogowski, red. nacz. CCN News | Data publikacji: 26 listopada 2026 r.

Dwudziesty siódmy rozdział Księgi Wyjścia (Wj 27:1–21) przenosi czytelnika ze świętego wnętrza Przybytku na jego zewnętrzny dziedziniec — miejsce codziennego spotkania grzesznego człowieka ze świętym Bogiem. Tekst biblijny łączy tu precyzyjną geometrię ołtarza i ogrodzenia z głęboką teologią odkupienia oraz nieustannego światła Ducha Świętego.

1. Miedziany ołtarz całopalenia i cztery rogi ratunku (Wj 27:1–8)
> „Uczynisz też ołtarz z drewna akacjowego, długi na pięć łokci i szeroki na pięć łokci. Ołtarz będzie kwadratowy i wysoki na trzy łokcie.” — Księga Wyjścia 27:1 (UBG)

Pierwszym obiektem po przekroczeniu wejścia na dziedziniec był ołtarz (*mizbeach*, מִזְבֵּחַ, Strong H4196) wykonany z trwałego drewna akacjowego pokrytego miedzią (*nechoszet*, נְחֹשֶׁת, Strong H5178 — metalem kojarzonym w Biblii z wytrwałością w ogniu sądu). Na jego czterech narożnikach wznosiły się cztery rogi (*keren*, קֶרֶן, Strong H7161) symbolizujące moc ratunku zwróconą ku czterem stronom świata (por. 1 Krl 1:50; Ps 118:27). Wewnątrz umieszczono miedzianą kratę (*mikbar*, Strong H4345) na połowie wysokości ołtarza — na poziomie półtora łokcia, czyli dokładnie na wysokości przebłagalni Arki Przymierza (Wj 25:10). Wskazywało to na ścisłą zgodność ofiary przebłagalnej z wymaganiami Bożego tronu.

2. Dziedziniec z białego bisioru i jedna szeroka brama wschodnia (Wj 27:9–19)
> „A do wejścia dziedzińca będzie zasłona na dwadzieścia łokci z błękitnej tkaniny, z purpury i karmazynu oraz skręconego bisioru, haftowana.” — Księga Wyjścia 27:16 (UBG)

Dziedziniec (*chacer*, חָצֵר, Strong H2691) o wymiarach 100 na 50 łokci wyznaczały śnieżnobiałe zasłony ze skręconego bisioru o wysokości pięciu łokci, zawieszone na sześćdziesięciu słupach. Słupy spoczywały na miedzianych podstawkach, lecz same zasłony utrzymywały się na srebrnych haczykach i klamrach (Wj 27:10, 17) — biblijnym obrazie sprawiedliwości wierzących (Obj 19:8) opartej wyłącznie na srebrze odkupienia (1 P 1:18–19). Choć do świątyni prowadziła tylko jedna brama (*szaar*, שַׁעַר, Strong H8179) od strony wschodniej, miała ona aż dwadzieścia łokci szerokości i jaśniała czterema barwami chwały Mesjasza. Nawet wszystkie miedziane kołki utrzymujące namiot (Wj 27:19) podkreślają wartość cichej, wiernej służby.

3. Czysta, wytłoczona oliwa i ustawa nieustannego światła (Wj 27:20–21)
> „Rozkażesz synom Izraela, aby przynieśli do ciebie czystą, wytłoczoną oliwę do oświetlenia, aby lampy zawsze się paliły.” — Księga Wyjścia 27:20 (UBG)

Zwieńczeniem rozdziału jest polecenie dotyczące czystej, wytłoczonej oliwy (*katit*, כָּתִית, Strong H3795) — uzyskiwanej bez miażdżenia pestek, by płomień świecznika nie wydzielał dymu. Słowo *tamid* (תָּמִיד, Strong H8548 — „zawsze, nieustannie”) wyznaczało służbę Aarona i jego synów „od wieczora aż do poranka”, dopóki nad nocą tego świata nie wzejdzie poranek chwały (2 P 1:19).

4. Perspektywa Chrystocentryczna: Golgota, Drzwi Owiec i Tłocznia Getsemani
W świetle Nowego Testamentu cały 27. rozdział Księgi Wyjścia kieruje wzrok ku osobie Jezusa Chrystusa. List do Hebrajczyków 13:10–12 stwierdza wprost: „Mamy ołtarz, z którego nie mają prawa spożywać ci, którzy służą przybytkowi... Dlatego i Jezus, aby uświęcić lud własną krwią, cierpiał poza bramą”. Jednocześnie to sam Zbawiciel ogłosił: „Ja jestem drzwiami. Jeśli ktoś wejdzie przeze mnie, będzie zbawiony” (J 10:9, UBG), jednocząc w sobie wyłączność drogi zbawienia i jej szerokie zaproszenie dla każdego człowieka. Z kolei czysta oliwa tłoczona w moździerzu zapowiada ogród Getsemani („tłocznię oliwną”), z którego męki i zwycięstwa płynie dla Kościoła nieskażona oliwa Ducha Świętego, nad której płomieniem czuwa zmartwychwstały Arcykapłan (Obj 1:12–20; 2:1).

📌 PODSUMOWANIE REDAKCYJNE CCN:
Księga Wyjścia 27:1–21 przypomina, że zbliżenie do Boga zaczyna się przy ołtarzu ofiary Chrystusa, wejście prowadzi przez jedną, lecz szeroko otwartą bramę łaski, a wierność w najdrobniejszych zadaniach i czysta oliwa Ducha Świętego utrzymują żywy płomień wiary „od wieczora aż do poranka”.

🌐 Źródła i serwisy pokrewne: polskieradio.cc | polskieradio.cc/akademia | polskieradio.cc/mojabiblia`;

const pakiet5wersji = `# PAKIET 5 WERSJI ROZWAŻAŃ — DZIEŃ ${DAY_NUM} (${DATE_STR})
## ${BOOK} ${READING} — ${TITLE}

====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

${v1TtsText}

====================================================================
WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / WhatsApp / cclite.pl)
====================================================================

${v2WebText}

====================================================================
WERSJA 3: WERSJA WIECZORNA (SMS)
====================================================================

${v3SmsText}

====================================================================
WERSJA 4: SCENARIUSZ TELEWIZYJNY (Christian Culture TV / CCTV24 — Noemi i Sara)
====================================================================

${v4VideoText}

====================================================================
WERSJA 5: ARTYKUŁ TEOLOGICZNY / LEKSYKON BIBLIJNY (CCN NEWS @CCN)
====================================================================

${v5ArticleText}
`;

// ── 2. QUIZ: 20 PYTAŃ Z WJ 27:1–21 (100% ZGODNE Z UBG) ──
const quizItems = [
  {
    q: '1. Z jakiego drewna miał zostać wykonany ołtarz całopalenia (Wj 27:1)?',
    a: ['Z drewna cedrowego', 'Z drewna akacjowego', 'Z drewna oliwnego', 'Z drewna dębowego'],
    c: 1,
  },
  {
    q: '2. Jakie były wymiary kwadratowego ołtarza całopalenia (Wj 27:1)?',
    a: ['5 łokci długości, 5 łokci szerokości i 3 łokcie wysokości', '10 łokci długości, 5 łokci szerokości i 5 łokci wysokości', '3 łokcie długości, 3 łokcie szerokości i 2 łokcie wysokości', '2 łokcie długości, 1 łokieć szerokości i 1,5 łokcia wysokości'],
    c: 0,
  },
  {
    q: '3. Co miało znajdować się na czterech narożnikach ołtarza całopalenia (Wj 27:2)?',
    a: ['Cztery złote korony', 'Cztery rogi z tego samego drewna pokryte miedzią', 'Cztery srebrne dzwonki', 'Cztery kamienie onyksowe'],
    c: 1,
  },
  {
    q: '4. Jakim metalem pokryto ołtarz całopalenia oraz wykonano wszystkie jego naczynia (Wj 27:2–3)?',
    a: ['Złotem', 'Srebrem', 'Miedzią', 'Żelazem'],
    c: 2,
  },
  {
    q: '5. Jakie naczynia służące do obsługi ołtarza wymienia Wj 27:3?',
    a: ['Misy, czasze, kubki i szczypce', 'Kociołki do popiołu, szufle, miednice, widełki i łopaty na rozżarzone węgle', 'Kadzielnice, trąby i harfy', 'Dzbanki na wodę i noże'],
    c: 1,
  },
  {
    q: '6. Jak wysoko sięgała miedziana krata na kształt sieci umieszczona pod obramowaniem ołtarza (Wj 27:4–5)?',
    a: ['Do samej góry ołtarza', 'Do połowy wysokości ołtarza', 'Tylko na szerokość jednego łokcia od ziemi', 'Wisiała nad ołtarzem'],
    c: 1,
  },
  {
    q: '7. Do czego służyły drążki z drewna akacjowego pokryte miedzią włożone w pierścienie ołtarza (Wj 27:6–7)?',
    a: ['Do podtrzymywania zasłon dziedzińca', 'Aby można było nosić ołtarz w czasie wędrówki', 'Do rozniecania ognia ofiarnego', 'Do wieszania lamp oliwnych'],
    c: 1,
  },
  {
    q: '8. Jaki miał być środek ołtarza wykonanego z desek (Wj 27:8)?',
    a: ['Wypełniony czystym złotem', 'Pusty wewnątrz', 'Wypełniony ciosanym marmurem', 'Podzielony na dwanaście komór'],
    c: 1,
  },
  {
    q: '9. Z jakiego materiału wykonano zasłony otaczające dziedziniec Przybytku (Wj 27:9, 18)?',
    a: ['Z koziej sierści', 'Ze skręconego bisioru', 'Ze skór baranich', 'Z wełny purpurowej'],
    c: 1,
  },
  {
    q: '10. Jaka była długość zasłon dziedzińca po stronie południowej i północnej (Wj 27:9, 11, 18)?',
    a: ['Pięćdziesiąt łokci', 'Sto łokci na każdą z tych stron', 'Dwadzieścia osiem łokci', 'Dwieście łokci'],
    c: 1,
  },
  {
    q: '11. Ile słupów i podstawek przypadało na stronę południową (i tyle samo na północną) dziedzińca (Wj 27:10–11)?',
    a: ['10 słupów i 10 podstawek', '15 słupów i 15 podstawek', '20 słupów i 20 miedzianych podstawek', '40 słupów i 40 srebrnych podstawek'],
    c: 2,
  },
  {
    q: '12. Z jakiego metalu wykonano haczyki i klamry na wszystkich słupach dziedzińca (Wj 27:10, 17)?',
    a: ['Ze złota', 'Ze srebra', 'Z miedzi', 'Z żelaza'],
    c: 1,
  },
  {
    q: '13. Jaka była szerokość dziedzińca od strony zachodniej oraz ile słupów tam ustawiono (Wj 27:12)?',
    a: ['50 łokci oraz 10 słupów i 10 podstawek', '100 łokci oraz 20 słupów', '30 łokci oraz 6 słupów', '20 łokci oraz 4 słupy'],
    c: 0,
  },
  {
    q: '14. Po której stronie świata znajdował się przód i wejście do dziedzińca Przybytku (Wj 27:13)?',
    a: ['Po stronie zachodniej', 'Po stronie północnej', 'Po stronie wschodniej', 'Po stronie południowej'],
    c: 2,
  },
  {
    q: '15. Jaką długość miały zasłony po jednej i po drugiej stronie wejścia na wschodzie (Wj 27:14–15)?',
    a: ['Po 10 łokci na każdą stronę (po 2 słupy)', 'Po 15 łokci na każdą stronę (po 3 słupy i 3 podstawki)', 'Po 20 łokci na każdą stronę (po 4 słupy)', 'Po 25 łokci na każdą stronę (po 5 słupów)'],
    c: 1,
  },
  {
    q: '16. Jaką szerokość i jakie barwy miała haftowana zasłona wejścia do dziedzińca (Wj 27:16)?',
    a: ['20 łokci — z błękitu, purpury, karmazynu i skręconego bisioru na 4 słupach', '10 łokci — wyłącznie z białego bisioru na 2 słupach', '30 łokci — z koziej sierści na 5 słupach', '15 łokci — ze skór baranich na 3 słupach'],
    c: 0,
  },
  {
    q: '17. Jaka była wysokość zasłon otaczających cały dziedziniec (Wj 27:18)?',
    a: ['Trzy łokcie', 'Pięć łokci', 'Dziesięć łokci', 'Piętnaście łokci'],
    c: 1,
  },
  {
    q: '18. Z jakiego metalu wykonano wszystkie kołki Przybytku i kołki dziedzińca (Wj 27:19)?',
    a: ['Ze złota', 'Ze srebra', 'Z miedzi', 'Z drewna akacjowego'],
    c: 2,
  },
  {
    q: '19. Jaką oliwę mieli przynosić synowie Izraela, aby lampy zawsze się paliły (Wj 27:20)?',
    a: ['Oliwę zmieszaną z kadzidłem', 'Czystą, wytłoczoną oliwę do oświetlenia', 'Oliwę z pierwszego zbioru w Egipcie', 'Oliwę gotowaną z ziołami'],
    c: 1,
  },
  {
    q: '20. Kto i w jakich porach miał doglądać lamp przed zasłoną w Namiocie Zgromadzenia (Wj 27:21)?',
    a: ['Mojżesz i Jozue tylko w Szabat', 'Aaron i jego synowie — od wieczora aż do poranka, jako wieczna ustawa', 'Starsi Izraela raz w miesiącu', 'Lewici wyłącznie w południe'],
    c: 1,
  },
];

// ── 3. PEŁNA LEKCJA WG WYTYCZNYCH GPT (12 SEKCJI, 45 PUNKTÓW EGZEGETYCZNYCH) ──
const lessonDocxText = `STRONA OTWIERAJĄCA

ZANIM OTWORZYSZ BIBLIĘ — WPROWADZENIE KONTEKSTOWE
Kurs „Z Biblią za Pan Brat” prowadzi przez wszystkie 66 ksiąg Pisma Świętego — miesiąc po miesiącu, księga po księdze, każdego dnia jeden fragment Słowa Bożego.
Dziś jest Dzień 57: Księga Wyjścia 27:1–21. Po objawieniu świętych sprzętów Miejsca Najświętszego i Miejsca Świętego (Wj 25) oraz konstrukcji samego namiotu Przybytku (Wj 26) wychodzimy na zewnętrzny dziedziniec — jedyną część świątyni, na którą wchodził każdy zwykły człowiek z ludu Izraela.
Przekraczając szeroką na dwadzieścia łokci bramę wschodnią, wkraczamy w przestrzeń wyznaczoną przez śnieżnobiałe zasłony z bisioru zawieszone na srebrnych haczykach i stajemy wprost przed kwadratowym, miedzianym ołtarzem całopalenia z czterema rogami na narożnikach (Wj 27:1–19). Rozdział zamyka się uroczystym nakazem przynoszenia czystej, wytłoczonej oliwy z oliwek, aby lampy płonęły nieustannie od wieczora aż do poranka jako wieczna ustawa (Wj 27:20–21).

TEKST PISMA ŚWIĘTEGO (UWSPÓŁCZEŚNIONA BIBLIA GDAŃSKA — WJ 27:1–21)
${buildVersesDocxText()}

KLUCZE JĘZYKOWE & KODY STRONGA (WJ 27:1–21)
• H4196 — מִזְבֵּחַ (Mizbeach): ołtarz ofiarny, miejsce składania ofiary przebłagalnej za grzech (Wj 27:1).
• H7161 — קֶרֶן (Keren): róg ołtarza — symbol mocy, azylu i ratunku skierowanego na cztery strony świata (Wj 27:2).
• H5178 — נְחֹשֶׁת (Nechoszet): miedź (brąz) — metal wytrzymały na ogień sądu i próby (Wj 27:2–6).
• H4345 — מִכְבָּר (Mikbar): miedziana krata na kształt sieci wewnątrz ołtarza na połowie wysokości (Wj 27:4–5).
• H2691 — חָצֵר (Chacer): dziedziniec Przybytku o wymiarach 100 × 50 łokci otoczony białymi zasłonami z bisioru (Wj 27:9).
• H8179 — שַׁעַר (Szaar): szeroka, dwudziestołokciowa brama wschodnia dziedzińca w czterech barwach Chrystusa (Wj 27:16).
• H3795 — כָּתִית (Katit): czysta, wytłoczona w moździerzu oliwa z oliwek bez osadu i domieszek (Wj 27:20).
• H8548 — תָּמִיד (Tamid): nieustannie, zawsze — wieczny rytm płonącego światła przed obliczem PANA (Wj 27:20).

ANALIZA EGZEGETYCZNA — 5 CZĘŚCI, 45 PUNKTÓW STUDIUM (WJ 27:1–21)

CZĘŚĆ I — MIEDZIANY OŁTARZ CAŁOPALENIA — PROGOWE SPOTKANIE Z KRZYŻEM (WJ 27:1–8)
1. Pierwszy sprzęt po wejściu przez bramę (27:1): Zanim człowiek mógł pomyśleć o Miejscu Świętym, musiał stanąć przy ołtarzu ofiary — bez przebaczenia nie ma społeczności z Bogiem.
2. Kwadrat 5 × 5 łokci, wysokość 3 łokcie (27:1): Największy sprzęt całego Przybytku — mógł pomieścić w sobie każdy inny sprzęt, tak jak ofiara krzyża obejmuje całe nasze życie.
3. Drewno akacjowe pokryte miedzią (27:1–2): Nieskazitelne człowieczeństwo Chrystusa poddane ogniowi Bożego sądu za grzech ludzkości (2 Kor 5:21).
4. Cztery rogi na narożnikach z jednego kawałka (27:2): Symbol mocy zbawienia skierowanej na cztery strony świata oraz miejsca schronienia (1 Krl 1:50).
5. Pięć rodzajów miedzianych naczyń służebnych (27:3): Kociołki, szufle, miednice, widełki i łopaty na węgle — nawet usuwanie popiołu było świętą służbą.
6. Miedziana krata sięgająca połowy ołtarza (27:4–5): Ołtarz miał 3 łokcie wysokości, więc krata wypadała na 1,5 łokcia — dokładnie na wysokości Arki Przymierza i stołu chlebów!
7. Drążki do przenoszenia ołtarza (27:6–7): Ewangelia krzyża nie jest przywiązana do jednego miejsca — wędruje wszędzie tam, gdzie idzie lud Boży.
8. Ołtarz pusty wewnątrz (27:8): Na każdym postoju wypełniano go ziemią (Wj 20:24) — prostota i gotowość do przyjęcia ofiary w każdym zakątku pustyni.
9. Ponowny akcent na wzór z góry (27:8): Także sposób pojednania z Bogiem pochodzi z objawienia nieba, nie z ludzkich religii.

CZĘŚĆ II — DZIEDZINIEC PRZYBYTKU I BIAŁE ZASŁONY SPRAWIEDLIWOŚCI (WJ 27:9–15, 17–19)
10. Prostokąt 100 × 50 łokci (27:9, 12, 18): Dwa idealne kwadraty po 50 × 50 łokci — około 45 × 22,5 metra świętej przestrzeni w sercu obozu.
11. Białe zasłony ze skręconego bisioru (27:9, 18): W Piśmie Świętym biały bisior oznacza sprawiedliwość świętych (Obj 19:8) — jasne oddzielenie od grzechu świata.
12. Wysokość pięciu łokci (27:18): Ponad dwa metry wysokości — nikt nie mógł zajrzeć ponad ogrodzeniem ani wejść boczną drogą; trzeba było przejść przez bramę (J 10:1).
13. Sześćdziesiąt słupów dokoła dziedzińca (27:10–16): 20 na południu, 20 na północy, 10 na zachodzie i 10 na wschodzie (3 + 4 + 3).
14. Miedziane podstawki słupów (27:10–11, 17–18): Kontakt ze skażoną ziemią spoczywał na miedzi sądu i wytrwałości.
15. Srebrne haczyki i srebrne klamry u góry (27:10, 17): Białe zasłony sprawiedliwości wisiały wyłącznie na srebrze odkupienia — nasza sprawiedliwość trzyma się łaski Chrystusa!
16. Wszystkie kołki Przybytku i dziedzińca z miedzi (27:19): Małe, wbite w piasek kołki utrzymywały cały namiot w czasie wichury — cisi, niewidoczni słudzy są bezcenni dla zboru.
17. Harmonia geometrii i światła (27:9–19): Bóg jest Bogiem ładu, a nie zamieszania (1 Kor 14:33).
18. Zaproszenie na dziedzińce PANA (Ps 84:3; 100:4): Dziedziniec nie miał odstraszać, lecz wzywać: „Wchodźcie w jego bramy z dziękczynieniem!”.

CZĘŚĆ III — JEDNA SZEROKA BRAMA WSCHODNIA — ZAPROSZENIE ŁASKI (WJ 27:13–16)
19. Wejście wyłącznie od wschodu (27:13): Od strony wschodzącego słońca — naprzeciw wschodu stał obóz Mojżesza, Aarona i pokolenia Judy, z którego przyszedł Mesjasz!
20. Jedna jedyna brama dla całego narodu (27:16): Nie było wielu konkurencyjnych dróg do Boga — jedna brama wskazuje na jednego Pośrednika, Jezusa Chrystusa (J 14:6; 1 Tm 2:5).
21. Szerokość aż dwudziestu łokci (27:16): Około 9 metrów szerokości! Choć droga jest jedna, brama łaski jest szeroko otwarta dla każdego, kto chce przyjść (J 6:37).
22. Cztery królewskie barwy bramy (27:16): Błękit (niebo), purpura (król), karmazyn (krew ofiary) i biały bisior (sprawiedliwość) — pełny portret Jezusa witający przybysza.
23. Cztery słupy bramy wschodniej (27:16): Jak cztery Ewangelie głoszące całemu światu otwartą bramę zbawienia.
24. Symetria 15 + 20 + 15 łokci na wschodzie (27:14–16): Brama leżała dokładnie w centrum wschodniej ściany — Chrystus w centrum każdego wejścia do Boga.
25. Brak zasłony zamykającej na klucz (27:16): Wystarczyło odsunąć tkaninę i wejść z wiarą.
26. Trzy etapy zbliżania się do Boga: Brama dziedzińca (usprawiedliwienie) → Zasłona Miejsca Świętego (uświęcenie) → Zasłona Miejsca Najświętszego (uwielbienie i obecność Ojca).

CZĘŚĆ IV — CZYSTA WYTŁOCZONA OLIWA I WIECZNY PŁOMIEŃ LAMP (WJ 27:20–21)
27. Odpowiedzialność całego ludu (27:20): „Rozkażesz synom Izraela, aby przynieśli...” — utrzymywanie światła Bożego to wspólny przywilej wszystkich wierzących.
28. Czysta oliwa z oliwek bez osadu (27:20): Tylko najczystsza oliwa paliła się jasnym płomieniem bez gryzącego dymu — obraz czystości Ducha Świętego i doktryny.
29. Słowo katit — „wytłoczona” w moździerzu (27:20): Nie miażdżona ciężkim kamieniem z pestkami, lecz delikatnie tłoczona — zapowiedź Getsemani (dosł. „tłocznia oliwna”), gdzie Jezus wyprosił dla nas Ducha!
30. Cel: „aby lampy zawsze się paliły” (27:20): Słowo tamid oznacza ciągłość — wiara nie jest chwilowym zrywem, lecz stałym płomieniem.
31. „Od wieczora aż do poranka” (27:21): Światło świeci najjaśniej w środku nocy tego świata, aż do poranka powrotu Jezusa Chrystusa (2 P 1:19).
32. Służba Aarona i jego synów (27:21): Nasz Arcykapłan Jezus (Obj 1:13; 2:1) nieustannie przechadza się pośród świeczników, doglądając płomienia naszych serc!
33. „Przed zasłoną, za którą jest arka świadectwa” (27:21): Światło płonie bezpośrednio przed obliczem Boga i Jego Prawa.
34. „Wieczna ustawa wśród ich potomków” (27:21): Kościół aż do końca czasów jest wezwany, by nie gasić Ducha (1 Tes 5:19) i nieść światło światu (Mt 5:14–16).

CZĘŚĆ V — SYNTEZA EWANGELICZNA, GETSEMANI I KLUCZE JĘZYKOWE (WJ 27:1–21)
35. Krzyż jako nasz jedyny ołtarz (Hbr 13:10–12): „Mamy ołtarz, z którego nie mają prawa spożywać ci, którzy służą przybytkowi” — jednorazowa ofiara Jezusa wystarcza na wieki.
36. Równa wysokość kraty ołtarza i Arki Przymierza: Sprawiedliwość Boża z Miejsca Najświętszego spotkała się dokładnie z ogniem ofiary na ołtarzu Golgoty!
37. Panny mądre z zapasem oliwy (Mt 25:1–13): Przypowieść Jezusa o oliwie w lampach wyrasta wprost z Wj 27:20–21 — czuwanie w nocy wymaga żywej relacji z Duchem Świętym.
38. Kołki dziedzińca — pochwała wierności w małym (Łk 16:10): Bez miedzianych kołków w piasku nawet najpiękniejszy bisior opadłby na ziemię.
39. Mizbeach (מִזְבֵּחַ): Ołtarz, na którym niewinna Ofiara zajmuje miejsce grzesznika.
40. Keren (קֶרֶן): Róg ołtarza — moc zbawienia dostępna ze wszystkich stron ziemi.
41. Nechoszet (נְחֹשֶׁת): Miedź wytrzymująca żar sądu — niezachwiana miłość Chrystusa na krzyżu.
42. Chacer (חָצֵר): Białe dziedzińce czystości i otwartego spotkania z Bogiem.
43. Szaar (שַׁעַר): Szeroka brama wschodnia — jedna droga zbawienia otwarta dla każdego.
44. Katit (כָּתִית): Czysta, wytłoczona oliwa Ducha Świętego z ogrodu Getsemani.
45. Tamid (תָּמִיד): Nieustanny płomień wiary i świadectwa płonący aż do brzasku wieczności!

JEZUS W CENTRUM — NASZ OŁTARZ GOLGOTY, JEDYNA SZEROKA BRAMA ŁASKI I ARCYKAPŁAN PIELĘGNUJĄCY PŁOMIEŃ NASZYCH SERC
1. Jezus Chrystus — prawdziwy Ołtarz i Ofiara Całopalna (Wj 27:1–8; Hbr 13:10–12; Ef 5:2): Każdy, kto wchodził na dziedziniec, spotykał najpierw miedziany ołtarz ofiarny. Tak samo droga do pokoju z Bogiem zaczyna się zawsze pod krzyżem Jezusa, który wydał samego siebie za nas jako ofiarę wonną Bogu!
2. Jezus Chrystus — Jedyna i Szeroka Brama Dziedzińca (Wj 27:16; J 10:9; 6:37): Dwudziestołokciowa brama wschodnia w barwach błękitu, purpury, karmazynu i białego bisioru była jedynym wejściem do Przybytku — a zarazem tak szerokim, że mieściło każdego szukającego. Jezus zaprasza: „Ja jestem drzwiami. Jeśli ktoś wejdzie przeze mnie, będzie zbawiony”.
3. Jezus Chrystus — nasza Sprawiedliwość jak Biały Bisior na Srebrze Odkupienia (Wj 27:9–18; Obj 19:8; 1 Kor 1:30): Śnieżnobiałe zasłony dziedzińca wisiały na srebrnych haczykach okupu. Nasza czystość przed Bogiem nie jest utkana z ludzkiej pychy, lecz zawieszona na odkupieniu dokonanym przez Jezusa!
4. Jezus Chrystus — Tłocznia Getsemani i Dawca Czystej Oliwy Ducha Świętego (Wj 27:20; Mt 26:36; Dz 2:33): Nazwa ogrodu Getsemani znaczy dosłownie „tłocznia oliwna”. To tam Chrystus wycierpiał ból za nasz grzech, aby wyprosić dla swojego Kościoła czystą, wytłoczoną oliwę Ducha Świętego, dzięki której światło prawdy płonie bez dymu fałszu!
5. Jezus Chrystus — Arcykapłan strzegący naszego płomienia od wieczora aż do poranka (Wj 27:21; Obj 1:12–13; 2:1): Jak Aaron i jego synowie pilnowali lamp przez całą noc, tak zmartwychwstały Pan przechadza się pośród złotych świeczników swojego Kościoła, aby w ciemności tego świata nasza wiara nie zgasła aż do poranka Jego przyjścia!

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE (12 ZESTAWIEŃ)
• Wj 27:1–8 → Hbr 13:10–12: W jaki sposób krzyż Jezusa jest naszym prawdziwym ołtarzem?
• Wj 27:2 → 1 Krl 1:50; Ps 118:27: Co oznaczały cztery rogi ołtarza jako miejsce ratunku i mocy?
• Wj 27:8 → Wj 20:24–25; Hbr 8:5: Dlaczego ołtarz miał powstać dokładnie według wzoru ukazanego na górze?
• Wj 27:9–18 → Ps 84:3, 11; Ps 100:4: Z jakim nastawieniem serca wchodzimy na dziedzińce PANA?
• Wj 27:9, 18 → Obj 19:8; Iz 61:10: Co w Biblii symbolizują białe tkaniny ze skręconego bisioru?
• Wj 27:16 → J 10:1–9; 14:6: Dlaczego do dziedzińca prowadziła tylko jedna, lecz bardzo szeroka brama?
• Wj 27:17 → 1 P 1:18–19; Ef 1:7: Dlaczego białe zasłony wisiały na srebrnych haczykach odkupienia?
• Wj 27:19 → Iz 54:2; Łk 16:10: Czego uczą nas pozornie małe miedziane kołki utrzymujące cały namiot?
• Wj 27:20 → Kpł 24:1–4; Za 4:2–6: Co oznacza czysta, wytłoczona oliwa podtrzymująca płomień?
• Wj 27:20 → Mt 25:1–13; 1 Tes 5:19: Dlaczego nie wolno dopuścić, aby zabrakło oliwy w naszych lampach?
• Wj 27:21 → 2 P 1:19; Obj 1:12–13: Jak płonie Boże światło „od wieczora aż do poranka” powrotu Chrystusa?
• Wj 27:20–21 → Mt 5:14–16; Flp 2:15: Jak mamy świecić jako dzieci światłości pośród ciemnego świata?

PRAWDA NA DZIŚ (8 ZASAD — CO ZMIENIA SIĘ W MOIM PATRZENIU)
• 1. Każde zbliżenie do Boga zaczyna się od krzyża: Nie próbuję zasłużyć na łaskę, lecz przychodzę najpierw pod ołtarz ofiary Jezusa.
• 2. Brama zbawienia jest jedna, ale szeroko otwarta: W Chrystusie jest miejsce dla każdego — nikogo nie skreślam i sam nie wątpię w Boże przyjęcie.
• 3. Moja czystość trzyma się na srebrze odkupienia: Sprawiedliwość mojego życia nie bierze się z pychy, lecz z codziennej zależności od Chrystusa.
• 4. Nawet małe, niewidoczne służby mają ogromną wagę: Jak miedziane kołki w piasku, cicha wierność utrzymuje w całości dom i zbór.
• 5. Nie pozwalam, aby zgasła lampa mojego serca: Codziennie zasilam duszę czystą oliwą modlitwy i Słowa Bożego.
• 6. Próby jak tłocznia wydobywają czystą oliwę: W trudnych doświadczeniach proszę Boga, aby oczyszczały moje serce, zamiast napełniać je goryczą.
• 7. Świecę najjaśniej właśnie wtedy, gdy wokół zapada noc: Jak lampy płonące „od wieczora aż do poranka”, wnoszę pokój w trudne rozmowy i czasy.
• 8. Jezus osobiście dogląda mojego płomienia: Nie jestem sam — mój Arcykapłan czuwa nade mną aż do poranka swojej chwały!

POMYŚL — PYTANIA DO SERCA (8 PYTAŃ)
1. Czy na początku dnia stajesz z ufnością przy „ołtarzu krzyża”, oddając Bogu swoje słabości, czy dźwigasz je w samotności?
2. Czy Twoja postawa wobec ludzi przypomina szeroką na 20 łokci bramę łaski z Wj 27:16, czy raczej zamknięte ogrodzenie?
3. Jaką cichą, „kołkową” służbę w rodzinie lub wspólnocie możesz dziś wykonać wiernie, nawet jeśli nikt jej nie zauważy?
4. Czy w ostatnim tygodniu dolewałeś regularnie „czystej oliwy” Słowa i modlitwy do lampy swojego serca?
5. Co dziś najbardziej próbuje przygasić Twój płomień pokoju i wdzięczności — i jak możesz to oddać Jezusowi?
6. Czy w trudniejszych chwilach („tłoczni” codzienności) pozwalasz Duchowi Świętemu kształtować w Tobie łagodność zamiast zniechęcenia?
7. Gdzie dziś — w pracy, w domu lub w rozmowie — możesz wnieść jasne, spokojne światło bez dymu krytyki?
8. Komu z Twoich bliskich możesz dziś przypomnieć, że brama do Bożego przebaczenia jest szeroko otwarta?

MAŁY QUIZ WIEDZY BIBLIJNEJ (20 PYTAŃ Z WJ 27:1–21)
${quizItems
  .map(
    (item, idx) => `Pytanie ${idx + 1}: ${item.q}
A. ${item.a[0]}
B. ${item.a[1]}
C. ${item.a[2]}
D. ${item.a[3]}
Poprawna odpowiedź: ${['A', 'B', 'C', 'D'][item.c]} — ${item.a[item.c]}.`
  )
  .join('\n\n')}

TWOJA DECYZJA
Dwudziesty siódmy rozdział Księgi Wyjścia przypomina dwie proste, niezmienne prawdy: droga do Boga zaczyna się zawsze przy ołtarzu ofiary Chrystusa, a lampa naszej wiary płonie tylko dzięki czystej oliwie Ducha Świętego podtrzymywanej od wieczora aż do poranka.
Podejmij dziś świadomą decyzję: przyjmij pełne przebaczenie spod krzyża, bądź wierny nawet w małych sprawach jak miedziane kołki Przybytku i nie pozwól, aby w Twoim domu zabrakło światła Słowa Bożego!

MOJA DECYZJA:
„Panie Jezu Chryste, Ty jesteś moim Ołtarzem pojednania i jedyną, szeroką Bramą na dziedzińce Ojca. Przyjmuję dziś Twoje przebaczenie, oddaję Ci moją codzienną służbę nawet w najmniejszych sprawach i proszę: napełniaj moje serce czystą oliwą Ducha Świętego, aby Twoje światło płonęło we mnie aż do poranka Twojego przyjścia!”

MODLITWA NA 26 LISTOPADA 2026 R.
Łaskawy Ojcze w niebie! Dziękujemy Ci za dwudziesty siódmy rozdział Księgi Wyjścia — za szeroką bramę na Twoje dziedzińce, za miedziany ołtarz zapowiadający krzyż naszego Zbawiciela oraz za białe zasłony sprawiedliwości zawieszone na srebrze odkupienia.
Dziękujemy Ci, Panie Jezu, że wziąłeś na siebie cały żar sądu za nasze grzechy, abyśmy mogli żyć w wolności i pokoju! Przepraszamy za chwile, w których zaniedbywaliśmy modlitwę i pozwalaliśmy, aby płomień naszego zapału przygasał pośród codziennego pośpiechu.
Napełnij nas dziś czystą, wytłoczoną oliwą Twojego Ducha Świętego. Pielęgnuj nasz płomień od wieczora aż do poranka i spraw, aby przez nasze życie w ten czwartek świeciło Twoje ciepłe, prawdziwe światło. Amen!

ZADANIE NA DZIŚ (7 ZADAŃ TAKTYCZNYCH)
[ ] 1. Przeczytaj cały fragment Wj 27:1–21 w przekładzie UBG oraz List do Hebrajczyków 13:10–16.
[ ] 2. Zapamiętaj werset Wj 27:20 („aby lampy zawsze się paliły”) i pomódl się o świeżą oliwę Ducha Świętego na ten czwartek.
[ ] 3. Oddaj Bogu w krótkiej modlitwie jedną konkretną troskę lub poczucie winy — złóż ją pod „miedzianym ołtarzem” krzyża Jezusa.
[ ] 4. Wykonaj dziś jedną cichą, pozornie drobną posługę dla bliskich — z wiernością „miedzianych kołków” z Wj 27:19.
[ ] 5. Zarezerwuj wieczorem 10 minut bez telefonu na spokojną lekturę Psalmu 84 i dziękczynienie za Boże dziedzińce.
[ ] 6. Rozwiąż wszystkich 20 pytań quizu z Wj 27, aby utrwalić szczegóły ołtarza, dziedzińca i oliwy.
[ ] 7. Oznacz Dzień 57 jako ukończony w Akademii i prześlij tę lekcję osobie, której chcesz dziś wnieść trochę światła i otuchy.

JUTRO — 27 LISTOPADA 2026 R.
DZIEŃ 58: SZATY ARCYKAPŁAŃSKIE, NAPIERŚNIK Z DWUNASTOMA KAMIENIAMI I ZŁOTA PŁYTKA ŚWIĘTOŚCI (WJ 28:1–43)
Jutro w 28. rozdziale Księgi Wyjścia poznamy majestatyczne szaty arcykapłana Aarona „ku chwale i ku ozdobie”: efod z imionami Izraela na ramionach, napierśnik sądu z dwunastoma drogimi kamieniami noszonymi nieustannie na sercu przed PANEM oraz złotą płytkę z napisem „Świętość PANU” — żywy portret Jezusa, naszego Arcykapłana w niebie!
`;

console.log('📄 Generuję profesjonalny plik Microsoft Word (.docx) dla Dnia 57 (12 sekcji)...');

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
                const isTask = /^\[\s*\]/.test(l) || /^\d+\.\s/.test(l) || /^•\s/.test(l);
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

const gdriveOutputsDir = 'H:/Mój dysk/OA - orkiestracja Agentowa/produkowane przez Agentów';
const desktopDir = 'C:/Users/czark/Desktop';
const docxFilename = `Z_Biblia_za_Pan_Brat_Dzien_${DAY_NUM}_${DATE_STR}.docx`;
const docxBuffer = await Packer.toBuffer(doc);
if (fs.existsSync(gdriveOutputsDir)) {
  const gdriveOutPath = path.join(gdriveOutputsDir, docxFilename);
  fs.writeFileSync(gdriveOutPath, docxBuffer);
  console.log(`✅ Zapisano plik DOCX na Google Drive: ${gdriveOutPath} (${docxBuffer.length} bajtów)`);
}
if (fs.existsSync(desktopDir)) {
  const desktopOutPath = path.join(desktopDir, docxFilename);
  fs.writeFileSync(desktopOutPath, docxBuffer);
  console.log(`✅ Zapisano plik DOCX na Desktop: ${desktopOutPath} (${docxBuffer.length} bajtów)`);
}
if (!fs.existsSync(gdriveOutputsDir) && !fs.existsSync(desktopDir)) {
  const fallbackPath = path.join(REPO, 'scripts/content', docxFilename);
  fs.writeFileSync(fallbackPath, docxBuffer);
  console.log(`✅ Zapisano plik DOCX (fallback): ${fallbackPath} (${docxBuffer.length} bajtów)`);
}

// ── 4. ZAPIS PAKIETU 5 WERSJI + SUROWEJ LEKCJI ──
fs.mkdirSync(path.join(REPO, 'scripts/content'), { recursive: true });
fs.writeFileSync(path.join(REPO, `scripts/content/pakiet-day${DAY_NUM}-5wersji.md`), pakiet5wersji, 'utf8');
fs.writeFileSync(path.join(REPO, `scripts/content/kc-day${DAY_NUM}-lesson.txt`), lessonDocxText, 'utf8');

// ── 5. BUDOWANIE PLIKU HTML LEKCJI (SZABLON DZIEŃ 56 = 21/21) ──
console.log('🌐 Generuję plik HTML lekcji Dnia 57 (4 ścieżki Clean URLs + kolejka)...');
const template56Path = path.join(REPO, 'akademia/kurscodzienny/dzien-56.html');
let html = fs.readFileSync(template56Path, 'utf8');

// 5.1 Meta, tytuły i social share
html = html.replace(
  /<title>Dzień 56: [^<]+<\/title>/,
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
  /<meta property="og:title" content="[^"]*"[^>]*>/,
  `<meta property="og:title" content="Dzień ${DAY_NUM}: ${TITLE} (${READING}) | Z Biblią za Pan Brat" />`
);
html = html.replace(
  /<meta property="og:description" content="[^"]*"[^>]*>/,
  `<meta property="og:description" content="${SUBTITLE}" />`
);
html = html.replace(
  /kc_day_56_przybytek_zaslona_swiatyni\.jpg(\?v=\d+)?/g,
  `${IMG_FILENAME}?v=20261126`
);

html = html.replace(/kurscodzienny%2Fdzien-56/g, `kurscodzienny%2Fdzien-${DAY_NUM}`);
html = html.replace(
  /Z%20Bibli%C4%85%20za%20Pan%20Brat%20%E2%80%94%20Dzie%C5%84%2056[^"']+/g,
  encodeURIComponent(`Z Biblią za Pan Brat — Dzień ${DAY_NUM}: ${TITLE} (${READING})`)
);
html = html.replace(
  /Jedno kliknięcie może przynieść pokój otwartej drogi do Ojca i światło jedności w Chrystusie komuś, kto dziś szczególnie tego potrzebuje\./,
  'Jedno kliknięcie może przynieść pokój krzyża, czystą oliwę Ducha Świętego i światło nadziei komuś, kto dziś szczególnie tego potrzebuje.'
);

// 5.2 Nawigacja i okruszki
html = html.replace(
  /<span class="text-amber-400 font-semibold">Dzień 56<\/span>/,
  `<span class="text-amber-400 font-semibold">Dzień ${DAY_NUM}</span>`
);

const nav56Regex =
  /<a href="\/akademia\/kurscodzienny\/dzien-55"[\s\S]*?<\/a>\s*(?:<a href="\/akademia\/kurscodzienny\/dzien-57"[\s\S]*?<\/a>|<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50[\s\S]*?<\/span>\s*<\/span>)/;
const nav57Block = `<a href="/akademia/kurscodzienny/dzien-56" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 56</span>
        </a>
        <span class="px-3 py-1.5 rounded-lg bg-zinc-900/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 58 (Piątek) →</span>
        </span>`;
if (!nav56Regex.test(html)) {
  throw new Error('Nie znaleziono bloku nawigacji Dnia 56 w szablonie');
}
html = html.replace(nav56Regex, nav57Block);

// 5.3 Hero i grafika
html = html.replace(/<span>Dzień 56 z 2009<\/span>/g, `<span>Dzień ${DAY_NUM} z 2009</span>`);
html = html.replace(/25 LISTOPADA 2026 • ŚRODA/g, DATE_SHORT_UPPER);
html = html.replace(
  /<h1 class="[^"]+">[\s\S]*?<\/h1>/,
  `<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">\n        ${TITLE}\n      </h1>`
);
html = html.replace(
  /<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">[\s\S]*?<\/p>/,
  `<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">\n        ${SUBTITLE}\n      </p>`
);
html = html.replace(
  /alt="Dzień 56:[^"]*"/,
  `alt="Dzień ${DAY_NUM}: ${TITLE} (${READING})"`
);
html = html.replace(
  /<span>Ilustracja biblijna:[^<]*<\/span>/,
  `<span>${IMG_CAPTION}</span>`
);
html = html.replace(/Czytanie: Wj 26:1–37/g, `Czytanie: ${READING}`);

// 5.4 Werset pamięciowy i Myśl przewodnia
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
          <p class="text-xs text-zinc-400 font-semibold">— Księga Wyjścia 27:20 (UBG)</p>
        </div>
        <button
          onclick="navigator.clipboard.writeText('„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 27:20 (UBG)'); this.innerHTML = '<i class=\\'fa-solid fa-check\\'></i> Skopiowano'; setTimeout(() => this.innerHTML = '<i class=\\'fa-regular fa-copy\\'></i> Kopiuj', 2000);"
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

// 5.5 Zanim otworzysz Biblię
html = html.replace(
  /<!-- LESSON BODY CONTENT[^>]*-->/,
  `<!-- LESSON BODY CONTENT (Dzień ${DAY_NUM}, 26.11.2026) -->`
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
            Dziś jest <strong class="text-white">Dzień 57</strong>: Księga Wyjścia, <strong class="text-brand-gold">${READING}</strong>. Po wnętrzu świątyni (Wj 25–26) wychodzimy na zewnętrzny dziedziniec Przybytku: stajemy przy miedzianym ołtarzu całopalenia, poznajemy białe zasłony sprawiedliwości z jedną szeroką bramą od wschodu oraz nakaz przynoszenia czystej, wytłoczonej oliwy, aby lampy płonęły nieustannie od wieczora aż do poranka.
          </p>
          <p>
            Zanim przejdziesz do komentarza, przeczytaj spokojnie dwadzieścia jeden wersetów w przekładzie UBG. Zwróć uwagę na pierwsze spotkanie przy ołtarzu ofiary (Wj 27:1–8) oraz na obietnicę nieustannego światła w ciemności nocy (Wj 27:20–21).
          </p>
          <a href="/mojabiblia?book=EXO&chapter=27" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]"><i class="fa-solid fa-book-open"></i><span>Czytaj ${READING}</span></a>
        </div>
      </article>`
);

// 5.6 Tekst Pisma Świętego
html = html.replace(/<!-- SCRIPTURE SECTION[^>]*-->/, `<!-- SCRIPTURE SECTION (${READING}) -->`);
html = html.replace(/Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 26:1–37/g, `Uwspółcześniona Biblia Gdańska (UBG) • ${READING}`);
html = html.replace(/\/mojabiblia\?book=EXO&chapter=26/g, `/mojabiblia?book=EXO&chapter=27`);
html = html.replace(/\/mojabiblia\?book=EXO&amp;chapter=26/g, `/mojabiblia?book=EXO&amp;chapter=27`);
html = html.replace(
  /<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>\s*<!-- KLUCZE JĘZYKOWE/,
  `<div class="kc-prose-reading">\n        ${buildVersesParagraphsHtml()}\n        </div>\n      </section>\n\n      <!-- KLUCZE JĘZYKOWE`
);

// 5.7 Klucze Językowe & Kody Stronga
const strongChips57 = `<span class="strong-chip"><span class="strong-id">H4196</span> <span class="strong-orig">מִזְבֵּחַ (Mizbeach)</span> — ołtarz ofiarny, miejsce składania ofiary przebłagalnej (Wj 27:1)</span>
          <span class="strong-chip"><span class="strong-id">H7161</span> <span class="strong-orig">קֶרֶן (Keren)</span> — róg ołtarza: symbol mocy, azylu i ratunku na cztery strony świata (Wj 27:2)</span>
          <span class="strong-chip"><span class="strong-id">H5178</span> <span class="strong-orig">נְחֹשֶׁת (Nechoszet)</span> — miedź (brąz): metal wytrzymujący ogień sądu nad grzechem (Wj 27:2–6)</span>
          <span class="strong-chip"><span class="strong-id">H4345</span> <span class="strong-orig">מִכְבָּר (Mikbar)</span> — miedziana krata na kształt sieci wewnątrz ołtarza (Wj 27:4)</span>
          <span class="strong-chip"><span class="strong-id">H2691</span> <span class="strong-orig">חָצֵר (Chacer)</span> — dziedziniec Przybytku otoczony białymi zasłonami z bisioru (Wj 27:9)</span>
          <span class="strong-chip"><span class="strong-id">H8179</span> <span class="strong-orig">שַׁעַר (Szaar)</span> — szeroka, dwudziestołokciowa brama wschodnia dziedzińca (Wj 27:16)</span>
          <span class="strong-chip"><span class="strong-id">H3795</span> <span class="strong-orig">כָּתִית (Katit)</span> — wytłoczona, czysta oliwa z oliwek bez domieszek i osadu (Wj 27:20)</span>
          <span class="strong-chip"><span class="strong-id">H8548</span> <span class="strong-orig">תָּמִיד (Tamid)</span> — nieustannie, zawsze — wieczny rytm płonącego światła przed PANEM (Wj 27:20)</span>`;

html = html.replace(/Klucze Językowe &amp; Kody Stronga \(Wj 26:1–37\)/g, `Klucze Językowe &amp; Kody Stronga (${READING})`);
html = html.replace(
  /Poniższe terminy hebrajskie tworzą osnowę teologiczną 26\. rozdziału Księgi Wyjścia[\s\S]*?<\/p>/,
  `Poniższe terminy hebrajskie tworzą osnowę teologiczną 27. rozdziału Księgi Wyjścia (miedziany ołtarz całopalenia, rogi ratunku, krata ofiarna, dziedziniec z białego bisioru, szeroka brama oraz czysta wytłoczona oliwa nieustannego światła):</p>`
);
html = html.replace(
  /<div class="flex flex-wrap gap-2">[\s\S]*?<\/div>\s*<\/section>\s*<!-- THEOLOGICAL EXEGESIS/,
  `<div class="flex flex-wrap gap-2">\n          ${strongChips57}\n        </div>\n      </section>\n\n      <!-- THEOLOGICAL EXEGESIS`
);

// 5.8 Egzegeza (5 części, 45 punktów)
html = html.replace(
  /Pięć części studium Wj 26:1–37 \(45 punktów analitycznych\)/g,
  `Pięć części studium ${READING} (45 punktów analitycznych)`
);

const exegesis57 = `<!-- CZĘŚĆ I -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
            MIEDZIANY OŁTARZ CAŁOPALENIA — PROGOWE SPOTKANIE Z KRZYŻEM (WJ 27:1–8)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>1. Pierwszy sprzęt po wejściu przez bramę (27:1):</strong> Zanim człowiek mógł pomyśleć o Miejscu Świętym, musiał stanąć przy ołtarzu ofiary — bez przebaczenia nie ma społeczności z Bogiem.</p>
            <p><strong>2. Kwadrat 5 × 5 łokci, wysokość 3 łokcie (27:1):</strong> Największy sprzęt całego Przybytku — mógł pomieścić w sobie każdy inny sprzęt, tak jak ofiara krzyża obejmuje całe nasze życie.</p>
            <p><strong>3. Drewno akacjowe pokryte miedzią (27:1–2):</strong> Nieskazitelne człowieczeństwo Chrystusa poddane ogniowi Bożego sądu za grzech ludzkości (2 Kor 5:21).</p>
            <p><strong>4. Cztery rogi na narożnikach z jednego kawałka (27:2):</strong> Symbol mocy zbawienia skierowanej na cztery strony świata oraz miejsca schronienia (1 Krl 1:50).</p>
            <p><strong>5. Pięć rodzajów miedzianych naczyń służebnych (27:3):</strong> Kociołki, szufle, miednice, widełki i łopaty na węgle — nawet usuwanie popiołu było świętą służbą.</p>
            <p><strong>6. Miedziana krata sięgająca połowy ołtarza (27:4–5):</strong> Ołtarz miał 3 łokcie wysokości, więc krata wypadała na 1,5 łokcia — dokładnie na wysokości Arki Przymierza i stołu chlebów!</p>
            <p><strong>7. Drążki do przenoszenia ołtarza (27:6–7):</strong> Ewangelia krzyża nie jest przywiązana do jednego miejsca — wędruje wszędzie tam, gdzie idzie lud Boży.</p>
            <p><strong>8. Ołtarz pusty wewnątrz (27:8):</strong> Na każdym postoju wypełniano go ziemią (Wj 20:24) — prostota i gotowość do przyjęcia ofiary w każdym zakątku pustyni.</p>
            <p><strong>9. Ponowny akcent na wzór z góry (27:8):</strong> Także sposób pojednania z Bogiem pochodzi z objawienia nieba, nie z ludzkich religii.</p>
          </div>
        </div>

        <!-- CZĘŚĆ II -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
            DZIEDZINIEC PRZYBYTKU I BIAŁE ZASŁONY SPRAWIEDLIWOŚCI (WJ 27:9–15, 17–19)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>10. Prostokąt 100 × 50 łokci (27:9, 12, 18):</strong> Dwa idealne kwadraty po 50 × 50 łokci — około 45 × 22,5 metra świętej przestrzeni w sercu obozu.</p>
            <p><strong>11. Białe zasłony ze skręconego bisioru (27:9, 18):</strong> W Piśmie Świętym biały bisior oznacza sprawiedliwość świętych (Obj 19:8) — jasne oddzielenie od grzechu świata.</p>
            <p><strong>12. Wysokość pięciu łokci (27:18):</strong> Ponad dwa metry wysokości — nikt nie mógł zajrzeć ponad ogrodzeniem ani wejść boczną drogą; trzeba było przejść przez bramę (J 10:1).</p>
            <p><strong>13. Sześćdziesiąt słupów dokoła dziedzińca (27:10–16):</strong> 20 na południu, 20 na północy, 10 na zachodzie i 10 na wschodzie (3 + 4 + 3).</p>
            <p><strong>14. Miedziane podstawki słupów (27:10–11, 17–18):</strong> Kontakt ze skażoną ziemią spoczywał na miedzi sądu i wytrwałości.</p>
            <p><strong>15. Srebrne haczyki i srebrne klamry u góry (27:10, 17):</strong> Białe zasłony sprawiedliwości wisiały wyłącznie na srebrze odkupienia — nasza sprawiedliwość trzyma się łaski Chrystusa!</p>
            <p><strong>16. Wszystkie kołki Przybytku i dziedzińca z miedzi (27:19):</strong> Małe, wbite w piasek kołki utrzymywały cały namiot w czasie wichury — cisi, niewidoczni słudzy są bezcenni dla zboru.</p>
            <p><strong>17. Harmonia geometrii i światła (27:9–19):</strong> Bóg jest Bogiem ładu, a nie zamieszania (1 Kor 14:33).</p>
            <p><strong>18. Zaproszenie na dziedzińce PANA (Ps 84:3; 100:4):</strong> Dziedziniec nie miał odstraszać, lecz wzywać: „Wchodźcie w jego bramy z dziękczynieniem!”.</p>
          </div>
        </div>

        <!-- CZĘŚĆ III -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
            JEDNA SZEROKA BRAMA WSCHODNIA — ZAPROSZENIE ŁASKI (WJ 27:13–16)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>19. Wejście wyłącznie od wschodu (27:13):</strong> Od strony wschodzącego słońca — naprzeciw wschodu stał obóz Mojżesza, Aarona i pokolenia Judy, z którego przyszedł Mesjasz!</p>
            <p><strong>20. Jedna jedyna brama dla całego narodu (27:16):</strong> Nie było wielu konkurencyjnych dróg do Boga — jedna brama wskazuje na jednego Pośrednika, Jezusa Chrystusa (J 14:6; 1 Tm 2:5).</p>
            <p><strong>21. Szerokość aż dwudziestu łokci (27:16):</strong> Około 9 metrów szerokości! Choć droga jest jedna, brama łaski jest szeroko otwarta dla każdego, kto chce przyjść (J 6:37).</p>
            <p><strong>22. Cztery królewskie barwy bramy (27:16):</strong> Błękit (niebo), purpura (król), karmazyn (krew ofiary) i biały bisior (sprawiedliwość) — pełny portret Jezusa witający przybysza.</p>
            <p><strong>23. Cztery słupy bramy wschodniej (27:16):</strong> Jak cztery Ewangelie głoszące całemu światu otwartą bramę zbawienia.</p>
            <p><strong>24. Symetria 15 + 20 + 15 łokci na wschodzie (27:14–16):</strong> Brama leżała dokładnie w centrum wschodniej ściany — Chrystus w centrum każdego wejścia do Boga.</p>
            <p><strong>25. Brak zasłony zamykającej na klucz (27:16):</strong> Wystarczyło odsunąć tkaninę i wejść z wiarą.</p>
            <p><strong>26. Trzy etapy zbliżania się do Boga:</strong> Brama dziedzińca (usprawiedliwienie) → Zasłona Miejsca Świętego (uświęcenie) → Zasłona Miejsca Najświętszego (uwielbienie i obecność Ojca).</p>
          </div>
        </div>

        <!-- CZĘŚĆ IV -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
            CZYSTA WYTŁOCZONA OLIWA I WIECZNY PŁOMIEŃ LAMP (WJ 27:20–21)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>27. Odpowiedzialność całego ludu (27:20):</strong> „Rozkażesz synom Izraela, aby przynieśli...” — utrzymywanie światła Bożego to wspólny przywilej wszystkich wierzących.</p>
            <p><strong>28. Czysta oliwa z oliwek bez osadu (27:20):</strong> Tylko najczystsza oliwa paliła się jasnym płomieniem bez gryzącego dymu — obraz czystości Ducha Świętego i doktryny.</p>
            <p><strong>29. Słowo <em>katit</em> — „wytłoczona” w moździerzu (27:20):</strong> Nie miażdżona ciężkim kamieniem z pestkami, lecz delikatnie tłoczona — zapowiedź Getsemani (dosł. „tłocznia oliwna”), gdzie Jezus wyprosił dla nas Ducha!</p>
            <p><strong>30. Cel: „aby lampy zawsze się paliły” (27:20):</strong> Słowo <em>tamid</em> oznacza ciągłość — wiara nie jest chwilowym zrywem, lecz stałym płomieniem.</p>
            <p><strong>31. „Od wieczora aż do poranka” (27:21):</strong> Światło świeci najjaśniej w środku nocy tego świata, aż do poranka powrotu Jezusa Chrystusa (2 P 1:19).</p>
            <p><strong>32. Służba Aarona i jego synów (27:21):</strong> Nasz Arcykapłan Jezus (Obj 1:13; 2:1) nieustannie przechadza się pośród świeczników, doglądając płomienia naszych serc!</p>
            <p><strong>33. „Przed zasłoną, za którą jest arka świadectwa” (27:21):</strong> Światło płonie bezpośrednio przed obliczem Boga i Jego Prawa.</p>
            <p><strong>34. „Wieczna ustawa wśród ich potomków” (27:21):</strong> Kościół aż do końca czasów jest wezwany, by nie gasić Ducha (1 Tes 5:19) i nieść światło światu (Mt 5:14–16).</p>
          </div>
        </div>

        <!-- CZĘŚĆ V -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">V</span>
            SYNTEZA EWANGELICZNA, GETSEMANI I KLUCZE JĘZYKOWE (WJ 27:1–21)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>35. Krzyż jako nasz jedyny ołtarz (Hbr 13:10–12):</strong> „Mamy ołtarz, z którego nie mają prawa spożywać ci, którzy służą przybytkowi” — jednorazowa ofiara Jezusa wystarcza na wieki.</p>
            <p><strong>36. Równa wysokość kraty ołtarza i Arki Przymierza:</strong> Sprawiedliwość Boża z Miejsca Najświętszego spotkała się dokładnie z ogniem ofiary na ołtarzu Golgoty!</p>
            <p><strong>37. Panny mądre z zapasem oliwy (Mt 25:1–13):</strong> Przypowieść Jezusa o oliwie w lampach wyrasta wprost z Wj 27:20–21 — czuwanie w nocy wymaga żywej relacji z Duchem Świętym.</p>
            <p><strong>38. Kołki dziedzińca — pochwała wierności w małym (Łk 16:10):</strong> Bez miedzianych kołków w piasku nawet najpiękniejszy bisior opadłby na ziemię.</p>
            <p><strong>39. <em>Mizbeach</em> (מִזְבֵּחַ):</strong> Ołtarz, na którym niewinna Ofiara zajmuje miejsce grzesznika.</p>
            <p><strong>40. <em>Keren</em> (קֶרֶן):</strong> Róg ołtarza — moc zbawienia dostępna ze wszystkich stron ziemi.</p>
            <p><strong>41. <em>Nechoszet</em> (נְחֹשֶׁת):</strong> Miedź wytrzymująca żar sądu — niezachwiana miłość Chrystusa na krzyżu.</p>
            <p><strong>42. <em>Chacer</em> (חָצֵר):</strong> Białe dziedzińce czystości i otwartego spotkania z Bogiem.</p>
            <p><strong>43. <em>Szaar</em> (שַׁעַר):</strong> Szeroka brama wschodnia — jedna droga zbawienia otwarta dla każdego.</p>
            <p><strong>44. <em>Katit</em> (כָּתִית):</strong> Czysta, wytłoczona oliwa Ducha Świętego z ogrodu Getsemani.</p>
            <p><strong>45. <em>Tamid</em> (תָּמִיד):</strong> Nieustanny płomień wiary i świadectwa płonący aż do brzasku wieczności!</p>
          </div>
        </div>`;

html = html.replace(
  /<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── JEZUS W CENTRUM ── -->/,
  `<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">\n        ${exegesis57}\n        </div>\n      </section>\n\n      <!-- ── JEZUS W CENTRUM ── -->`
);

// 5.9 Jezus w Centrum
const jesus57 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Nasz Ołtarz Golgoty, Jedyna Szeroka Brama Łaski i Arcykapłan Pielęgnujący Płomień Naszych Serc
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            <strong>1. Jezus Chrystus — prawdziwy Ołtarz i Ofiara Całopalna (Wj 27:1–8; Hebrajczyków 13:10–12; Efezjan 5:2):</strong> Każdy, kto wchodził na dziedziniec, spotykał najpierw miedziany ołtarz ofiarny. Tak samo droga do pokoju z Bogiem zaczyna się zawsze pod krzyżem Jezusa, który wydał samego siebie za nas jako ofiarę wonną Bogu!
          </p>
          <p>
            <strong>2. Jezus Chrystus — Jedyna i Szeroka Brama Dziedzińca (Wj 27:16; Ewangelia Jana 10:9; 6:37):</strong> Dwudziestołokciowa brama wschodnia w barwach błękitu, purpury, karmazynu i białego bisioru była jedynym wejściem do Przybytku — a zarazem tak szerokim, że mieściło każdego szukającego. Jezus zaprasza: „Ja jestem drzwiami; tego, który przychodzi do mnie, nie wyrzucę precz”.
          </p>
          <p>
            <strong>3. Jezus Chrystus — nasza Sprawiedliwość jak Biały Bisior na Srebrze Odkupienia (Wj 27:9–18; Objawienie 19:8; 1 Koryntian 1:30):</strong> Śnieżnobiałe zasłony dziedzińca wisiały na srebrnych haczykach okupu. Nasza czystość przed Bogiem nie jest utkana z ludzkiej pychy, lecz zawieszona na odkupieniu dokonanym przez Jezusa!
          </p>
          <p>
            <strong>4. Jezus Chrystus — Tłocznia Getsemani i Dawca Czystej Oliwy Ducha Świętego (Wj 27:20; Mateusza 26:36; Dzieje 2:33):</strong> Nazwa ogrodu Getsemani znaczy dosłownie „tłocznia oliwna”. To tam Chrystus wycierpiał ból za nasz grzech, aby wyprosić dla swojego Kościoła czystą, wytłoczoną oliwę Ducha Świętego, dzięki której światło prawdy płonie bez dymu fałszu!
          </p>
          <p>
            <strong>5. Jezus Chrystus — Arcykapłan strzegący naszego płomienia od wieczora aż do poranka (Wj 27:21; Objawienie 1:12–13; 2:1):</strong> Jak Aaron i jego synowie pilnowali lamp przez całą noc, tak zmartwychwstały Pan przechadza się pośród złotych świeczników swojego Kościoła, aby w ciemności tego świata nasza wiara nie zgasła aż do poranka Jego przyjścia!
          </p>
          <div class="pt-2">
            <a href="/mojabiblia?book=EXO&chapter=27" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
              <i class="fa-solid fa-book-open"></i>
              <span>Czytaj ${READING}</span>
            </a>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── JEZUS W CENTRUM ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-cross"><\/i>\s*<span>Jezus w centrum<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── SPRAWDŹ W BIBLII ── -->)/,
  `$1${jesus57}\n      $2`
);

// 5.10 Sprawdź w Biblii (12 wersetów porównawczych)
const compare57 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Sprawdź w Biblii — 12 Wersetów Porównawczych (${READING})
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300 font-serif">
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 27:1–8 → List do Hebrajczyków 13:10–12</strong>: W jaki sposób krzyż Jezusa jest naszym prawdziwym ołtarzem?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 27:2 → 1 Królewska 1:50; Psalm 118:27</strong>: Co oznaczały cztery rogi ołtarza jako miejsce ratunku i mocy?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 27:8 → Księga Wyjścia 20:24–25; Hebrajczyków 8:5</strong>: Dlaczego ołtarz miał powstać dokładnie według wzoru ukazanego na górze?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 27:9–18 → Psalm 84:3, 11; Psalm 100:4</strong>: Z jakim nastawieniem serca wchodzimy na dziedzińce PANA?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 27:9, 18 → Objawienie 19:8; Izajasza 61:10</strong>: Co w Biblii symbolizują białe tkaniny ze skręconego bisioru?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 27:16 → Ewangelia Jana 10:1–9; 14:6</strong>: Dlaczego do dziedzińca prowadziła tylko jedna, lecz bardzo szeroka brama?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 27:17 → 1 Piotra 1:18–19; Efezjan 1:7</strong>: Dlaczego białe zasłony wisiały na srebrnych haczykach odkupienia?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 27:19 → Izajasza 54:2; Łukasza 16:10</strong>: Czego uczą nas pozornie małe miedziane kołki utrzymujące cały namiot?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 27:20 → Kapłańska 24:1–4; Zachariasza 4:2–6</strong>: Co oznacza czysta, wytłoczona oliwa podtrzymująca płomień?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 27:20 → Mateusza 25:1–13; 1 Tesaloniczan 5:19</strong>: Dlaczego nie wolno dopuścić, aby zabrakło oliwy w naszych lampach?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 27:21 → 2 Piotra 1:19; Objawienie 1:12–13</strong>: Jak płonie Boże światło „od wieczora aż do poranka” powrotu Chrystusa?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 27:20–21 → Mateusza 5:14–16; Filipian 2:15</strong>: Jak mamy świecić jako dzieci światłości pośród ciemnego świata?</div>
        </div>`;

html = html.replace(
  /(<!-- ── SPRAWDŹ W BIBLII ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-magnifying-glass"><\/i>\s*<span>Porównaj wersety we własnym Piśmie Świętym<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── PRAWDA NA DZIŚ ── -->)/,
  `$1${compare57}\n      $2`
);

// 5.11 Prawda na dziś
const truth57 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          8 Zasad Ołtarza Łaski, Szerokiej Bramy i Nieustannego Światła — co zmienia się w moim patrzeniu
        </h3>
        <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>• <strong>1. Każde zbliżenie do Boga zaczyna się od krzyża:</strong> Nie próbuję zasłużyć na łaskę, lecz przychodzę najpierw pod ołtarz ofiary Jezusa.</p>
          <p>• <strong>2. Brama zbawienia jest jedna, ale szeroko otwarta:</strong> W Chrystusie jest miejsce dla każdego — nikogo nie skreślam i sam nie wątpię w Boże przyjęcie.</p>
          <p>• <strong>3. Moja czystość trzyma się na srebrze odkupienia:</strong> Sprawiedliwość mojego życia nie bierze się z pychy, lecz z codziennej zależności od Chrystusa.</p>
          <p>• <strong>4. Nawet małe, niewidoczne służby mają ogromną wagę:</strong> Jak miedziane kołki w piasku, cicha wierność utrzymuje w całości dom i zbór.</p>
          <p>• <strong>5. Nie pozwalam, aby zgasła lampa mojego serca:</strong> Codziennie zasilam duszę czystą oliwą modlitwy i Słowa Bożego.</p>
          <p>• <strong>6. Próby jak tłocznia wydobywają czystą oliwę:</strong> W trudnych doświadczeniach proszę Boga, aby oczyszczały moje serce, zamiast napełniać je goryczą.</p>
          <p>• <strong>7. Świecę najjaśniej właśnie wtedy, gdy wokół zapada noc:</strong> Jak lampy płonące „od wieczora aż do poranka”, wnoszę pokój w trudne rozmowy i czasy.</p>
          <p>• <strong>8. Jezus osobiście dogląda mojego płomienia:</strong> Nie jestem sam — mój Arcykapłan czuwa nade mną aż do poranka swojej chwały!</p>
        </div>`;

html = html.replace(
  /(<!-- ── PRAWDA NA DZIŚ ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-lightbulb"><\/i>\s*<span>Prawda na dziś<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── POMYŚL ── -->)/,
  `$1${truth57}\n      $2`
);

// 5.12 Pomyśl
const questions57 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Refleksja Osobista — Spójrz w Światło Słowa (${READING})
        </h3>
        <div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>1. Czy na początku dnia stajesz z ufnością przy „ołtarzu krzyża”, oddając Bogu swoje słabości, czy dźwigasz je w samotności?</p>
          <p>2. Czy Twoja postawa wobec ludzi przypomina szeroką na 20 łokci bramę łaski z Wj 27:16, czy raczej zamknięte ogrodzenie?</p>
          <p>3. Jaką cichą, „kołkową” służbę w rodzinie lub wspólnocie możesz dziś wykonać wiernie, nawet jeśli nikt jej nie zauważy?</p>
          <p>4. Czy w ostatnim tygodniu dolewałeś regularnie „czystej oliwy” Słowa i modlitwy do lampy swojego serca?</p>
          <p>5. Co dziś najbardziej próbuje przygasić Twój płomień pokoju i wdzięczności — i jak możesz to oddać Jezusowi?</p>
          <p>6. Czy w trudniejszych chwilach („tłoczni” codzienności) pozwalasz Duchowi Świętemu kształtować w Tobie łagodność zamiast zniechęcenia?</p>
          <p>7. Gdzie dziś — w pracy, w domu lub w rozmowie — możesz wnieść jasne, spokojne światło bez dymu krytyki?</p>
          <p>8. Komu z Twoich bliskich możesz dziś przypomnieć, że brama do Bożego przebaczenia jest szeroko otwarta?</p>
        </div>`;

html = html.replace(
  /(<!-- ── POMYŚL ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-heart"><\/i>\s*<span>Pytania do serca \(Pomyśl\)<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── QUIZ ── -->)/,
  `$1${questions57}\n      $2`
);

// 5.13 Quiz nagłówek
html = html.replace(/20 Pytań z Wj 26 \(Sprawdź swoją wiedzę\)/g, `20 Pytań z Wj 27 (Sprawdź swoją wiedzę)`);
html = html.replace(/Po przeczytaniu Wj 26/g, `Po przeczytaniu Wj 27`);

// 5.14 Twoja decyzja
const decision57 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Zostań przy Krzyżu, Wejdź Szeroką Bramą Łaski i Płoń Czystą Oliwą Ducha!
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            Dwudziesty siódmy rozdział Księgi Wyjścia przypomina dwie proste, niezmienne prawdy: droga do Boga zaczyna się zawsze przy ołtarzu ofiary Chrystusa, a lampa naszej wiary płonie tylko dzięki czystej oliwie Ducha Świętego podtrzymywanej od wieczora aż do poranka.
          </p>
          <p>
            Podejmij dziś świadomą decyzję: przyjmij pełne przebaczenie spod krzyża, bądź wierny nawet w małych sprawach jak miedziane kołki Przybytku i nie pozwól, aby w Twoim domu zabrakło światła Słowa Bożego!
          </p>
          <div class="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-black/40 to-transparent border border-brand-gold/40">
            <h4 class="font-bold text-amber-300 mb-2 uppercase tracking-wide text-xs">Moja Decyzja — Osobiste Wyznanie:</h4>
            <p class="italic text-white">
              „Panie Jezu Chryste, Ty jesteś moim Ołtarzem pojednania i jedyną, szeroką Bramą na dziedzińce Ojca. Przyjmuję dziś Twoje przebaczenie, oddaję Ci moją codzienną służbę nawet w najmniejszych sprawach i proszę: napełniaj moje serce czystą oliwą Ducha Świętego, aby Twoje światło płonęło we mnie aż do poranka Twojego przyjścia!”
            </p>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── TWOJA DECYZJA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-flag-checkered"><\/i>\s*<span>Twoja decyzja<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── MODLITWA ── -->)/,
  `$1${decision57}\n      $2`
);

// 5.15 Modlitwa
html = html.replace(/<span>Modlitwa na 25 listopada<\/span>/g, `<span>Modlitwa na 26 listopada</span>`);
const prayer57 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Modlitwa o Łaskę Krzyża, Wierność w Małych Sprawach i Nieustanny Płomień Ducha Świętego
        </h3>
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed space-y-3">
          <p>
            Łaskawy Ojcze w niebie! Dziękujemy Ci za dwudziesty siódmy rozdział Księgi Wyjścia — za szeroką bramę na Twoje dziedzińce, za miedziany ołtarz zapowiadający krzyż naszego Zbawiciela oraz za białe zasłony sprawiedliwości zawieszone na srebrze odkupienia.
          </p>
          <p>
            Dziękujemy Ci, Panie Jezu, że wziąłeś na siebie cały żar sądu za nasze grzechy, abyśmy mogli żyć w wolności i pokoju! Przepraszamy za chwile, w których zaniedbywaliśmy modlitwę i pozwalaliśmy, aby płomień naszego zapału przygasał pośród codziennego pośpiechu.
          </p>
          <p>
            Napełnij nas dziś czystą, wytłoczoną oliwą Twojego Ducha Świętego. Pielęgnuj nasz płomień od wieczora aż do poranka i spraw, aby przez nasze życie w ten czwartek świeciło Twoje ciepłe, prawdziwe światło. Amen!
          </p>
        </div>`;

html = html.replace(
  /(<!-- ── MODLITWA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-hands-praying"><\/i>\s*<span>Modlitwa na [^<]+<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── ZASTOSOWANIE I TWÓJ ZAPIS)/,
  `$1${prayer57}\n      $2`
);

// 5.16 Zadania na dziś (7 zadań)
const tasks57 = `<label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-1" onchange="toggleTaskState(1)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>1. Przeczytaj cały fragment <a href="/mojabiblia?book=EXO&chapter=27" class="text-amber-300 underline font-semibold">Wj 27:1–21</a> w przekładzie UBG oraz List do Hebrajczyków 13:10–16.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-2" onchange="toggleTaskState(2)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>2. Zapamiętaj werset Wj 27:20 („aby lampy zawsze się paliły”) i pomódl się o świeżą oliwę Ducha Świętego na ten czwartek.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-3" onchange="toggleTaskState(3)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>3. Oddaj Bogu w krótkiej modlitwie jedną konkretną troskę lub poczucie winy — złóż ją pod „miedzianym ołtarzem” krzyża Jezusa.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-4" onchange="toggleTaskState(4)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>4. Wykonaj dziś jedną cichą, pozornie drobną posługę dla bliskich — z wiernością „miedzianych kołków” z Wj 27:19.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-5" onchange="toggleTaskState(5)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>5. Zarezerwuj wieczorem 10 minut bez telefonu na spokojną lekturę Psalmu 84 i dziękczynienie za Boże dziedzińce.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-6" onchange="toggleTaskState(6)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>6. Rozwiąż wszystkich 20 pytań quizu z Wj 27, aby utrwalić szczegóły ołtarza, dziedzińca i oliwy.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-7" onchange="toggleTaskState(7)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>7. Oznacz Dzień 57 jako ukończony i prześlij tę lekcję osobie, której chcesz dziś wnieść trochę światła i otuchy.</span>
          </label>`;

html = html.replace(
  /(<p class="text-zinc-200 font-semibold mb-2">Wykonaj dzisiejsze kroki formacji biblijnej:<\/p>\s*)[\s\S]*?(<\/div>\s*<div class="space-y-4 pt-2">)/,
  `$1${tasks57}\n        $2`
);

// 5.17 Zapowiedź: Jutro (Dzień 58)
const tomorrow57 = `<section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
        <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
          JUTRO — 27 LISTOPADA 2026
        </div>
        <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
          DZIEŃ 58 — SZATY ARCYKAPŁAŃSKIE, NAPIERŚNIK Z DWUNASTOMA KAMIENIAMI I ZŁOTA PŁYTKA ŚWIĘTOŚCI (Wj 28:1–43)
        </h3>
        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">
          Dzień 58: W dwudziestym ósmym rozdziale Księgi Wyjścia poznamy majestatyczne szaty arcykapłana Aarona „ku chwale i ku ozdobie”: efod z imionami Izraela na ramionach, napierśnik sądu z dwunastoma drogimi kamieniami noszonymi nieustannie na sercu przed PANEM oraz złotą płytkę z napisem „Świętość PANU” — żywy portret Jezusa, naszego Arcykapłana w niebie!
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-[44px]">
            <span>Dostępne od północy (27 listopada 2026)</span>
          </span>
          <a href="/akademia/kurscodzienny" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold uppercase tracking-wider transition min-h-[44px]">
            <span>Spis wszystkich dni →</span>
          </a>
          <a href="/wspieramto" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#FF8C33] active:bg-[#E66A00] text-white text-xs font-extrabold uppercase tracking-wider transition min-h-[44px]">
            <i class="fa-solid fa-heart"></i>
            <span>WspieramTO — Budujemy Dom + Studio CC →</span>
          </a>
        </div>
      </section>`;

html = html.replace(
  /<!-- ── ZAPOWIEDŹ: JUTRO ── -->\s*<section class="p-6 rounded-2xl bg-\[#0E121A\][\s\S]*?<\/section>/,
  `<!-- ── ZAPOWIEDŹ: JUTRO ── -->\n      ${tomorrow57}`
);

// 5.18 JavaScript: QUIZ_DATA (20 pytań), DAY_KEY, completeDay57, TTS
const quizJsItems = quizItems.map(({ q, a, c }) => ({ q, a, c }));
const quizData57 = `// ── QUIZ LOGIC (20 PYTAŃ Z WJ 27:1–21) ──\n    const QUIZ_DATA = ${JSON.stringify(quizJsItems, null, 6)};`;

html = html.replace(/\/\/ ── QUIZ LOGIC[\s\S]*?const QUIZ_DATA = \[[\s\S]*?\];/, quizData57);
html = html.replace(
  /Doskonale! Znasz na wskroś 26\. rozdział Księgi Wyjścia!/g,
  `Doskonale! Znasz na wskroś 27. rozdział Księgi Wyjścia!`
);

html = html.replace(/kc_day56_/g, `kc_day${DAY_NUM}_`);
html = html.replace(/DAY_KEY = 'kc_day56'/g, `DAY_KEY = 'kc_day${DAY_NUM}'`);
html = html.replace(/completeDay56/g, `completeDay${DAY_NUM}`);
html = html.replace(/Oznacz Dzień 56 jako ukończony/g, `Oznacz Dzień ${DAY_NUM} jako ukończony`);
html = html.replace(/Dzień 56 ukończony!/g, `Dzień ${DAY_NUM} ukończony!`);
html = html.replace(
  /new SpeechSynthesisUtterance\("[^"]+"\)/,
  `new SpeechSynthesisUtterance("${MEMORY_VERSE_QUOTE} Księga Wyjścia 27:20.")`
);

// Zapis 4 ścieżek Clean URLs w Akademii i Kursach dla Dnia 57
const cleanUrlPaths = [
  path.join(REPO, `akademia/kurscodzienny/dzien-${DAY_NUM}.html`),
  path.join(REPO, `akademia/kurscodzienny/dzien-${DAY_NUM}/index.html`),
  path.join(REPO, `kursy/kurscodzienny/dzien-${DAY_NUM}.html`),
  path.join(REPO, `kursy/kurscodzienny/dzien-${DAY_NUM}/index.html`),
];
for (const p of cleanUrlPaths) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html, 'utf8');
}
console.log('✅ Zapisano 4 ścieżki Clean URLs dla Dnia 57.');

// Zapis paczki przedpublikacyjnej w kolejka-publikacji/kurs-codzienny/2026-11-26/
fs.mkdirSync(path.join(QUEUE_DIR, 'obrazy'), { recursive: true });
fs.copyFileSync(imgFullPath, path.join(QUEUE_DIR, 'obrazy', IMG_FILENAME));
fs.writeFileSync(path.join(QUEUE_DIR, 'lekcja.html'), html, 'utf8');

fs.writeFileSync(
  path.join(QUEUE_DIR, 'meta.json'),
  JSON.stringify(
    {
      data: DATE_STR,
      dzien: DAY_NUM,
      przygotowal: '@A001 (antigravity)',
      przygotowano: new Date().toISOString(),
      status: 'prepared_for_00_00',
      karta: {
        tytul: `Dzień ${DAY_NUM}: ${TITLE}`,
        opis:
          'Miedziany ołtarz całopalenia z czterema rogami, biały dziedziniec Przybytku z jedną szeroką bramą (20 łokci) oraz czysta, wytłoczona oliwa podtrzymująca nieustanny płomień lamp.',
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
  status: 'prepared_for_00_00',
};

fs.writeFileSync(
  path.join(QUEUE_DIR, 'rozwazanie.json'),
  JSON.stringify(rozwazanieJson, null, 2),
  'utf8'
);

console.log(
  `✅ Zapisano kompletny pakiet przedpublikacyjny w kolejka-publikacji/kurs-codzienny/${DATE_STR}/ (lekcja.html, meta.json, rozwazanie.json, obrazy/${IMG_FILENAME})`
);
