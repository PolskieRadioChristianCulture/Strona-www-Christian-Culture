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
const DAY_NUM = 58;
const DATE_STR = '2026-11-27';
const DATE_FORMATTED = '27 LISTOPADA 2026 R. (PIĄTEK)';
const DATE_SHORT_UPPER = '27 LISTOPADA 2026 • PIĄTEK';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 28:1–43';
const TITLE = 'SZATY ARCYKAPŁAŃSKIE, NAPIERŚNIK Z DWUNASTOMA KAMIENIAMI I ZŁOTA PŁYTKA ŚWIĘTOŚCI';
const SUBTITLE =
  'Święte szaty Aarona „na cześć i na ozdobę”, imiona dwunastu pokoleń na ramionach i na sercu, Urim i Tummim, dzwonki na błękitnym ornacie oraz złota blaszka „Świętość PANU” (Wj 28:1–43)';

const EXO28_PATH = path.join(REPO, 'data/bible/ubg-2025/EXO-028.json');
const exo28Data = JSON.parse(fs.readFileSync(EXO28_PATH, 'utf8'));
const verses = exo28Data.verses;

const v29 = verses.find((v) => v.number === 29)?.text || '';
const MEMORY_VERSE_QUOTE = v29.trim();
const MEMORY_VERSE = `„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 28:29 (UBG)`;

const THEME =
  'Dwudziesty ósmy rozdział Księgi Wyjścia przenosi nasz wzrok od sprzętów i ścian Przybytku na samego arcykapłana, który ma w nim służyć przed obliczem Boga. Święte szaty Aarona nie były ludzką modą ani pokazem próżności — zostały zaprojektowane przez Boga „na cześć i na ozdobę” (Wj 28:2), a wykonali je rzemieślnicy napełnieni „duchem mądrości” (Wj 28:3). Każdy element stroju niósł głębokie poselstwo ewangeliczne: na dwóch kamieniach onyksu na ramionach efodu arcykapłan dźwigał ciężar imion całego Izraela (Wj 28:9–12), a na kwadratowym pektorale wyrokowania z dwunastoma drogimi kamieniami nosił te same imiona nieustannie na swoim sercu przed PANEM wraz z Urim i Tummim (Wj 28:15–30). Na błękitnym ornacie dźwięczały złote dzwonki na przemian z granatami (Wj 28:31–35), a na czole Aarona lśniła blaszka ze szczerego złota z wyrytym napisem „Świętość PANU” (Wj 28:36–38) — zapowiedź Jezusa Chrystusa, naszego Wielkiego Najwyższego Kapłana, który zawsze żyje, aby wstawiać się za nami (Hbr 4:14–16; 7:25)!';

const IMG_FILENAME = 'kc_day_58_szaty_arcykaplana_napiersnik.jpg';
const IMG_REL_PATH = `images/academy/daily/${IMG_FILENAME}`;
const IMG_CAPTION =
  'Ilustracja biblijna: Święte szaty arcykapłana Aarona — efod z kamieniami onyksu, pektorał z dwunastoma klejnotami, błękitny ornat z dzwonkami i granatami oraz mitra ze złotą blaszką — Wj 28:1–43';
const QUEUE_DIR = path.join(REPO, `kolejka-publikacji/kurs-codzienny/${DATE_STR}`);

const imgFullPath = path.join(REPO, IMG_REL_PATH);
if (!fs.existsSync(imgFullPath)) {
  throw new Error(`Brak wygenerowanej grafiki Dnia 58: ${imgFullPath}`);
}

function buildVersesParagraphsHtml() {
  const sections = [
    {
      heading:
        'KSIĘGA WYJŚCIA 28:1–5 — Powołanie Aarona i jego synów, duch mądrości oraz sześć świętych szat chwały',
      from: 1,
      to: 5,
      extraClass: 'mb-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 28:6–14 — Efod ze złota i królewskich barw oraz dwa kamienie onyksu z imionami Izraela na ramionach',
      from: 6,
      to: 14,
      extraClass: 'my-6 pt-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 28:15–30 — Pektorał wyrokowania z dwunastoma kamieniami na sercu arcykapłana oraz Urim i Tummim',
      from: 15,
      to: 30,
      extraClass: 'my-6 pt-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 28:31–43 — Błękitny ornat z dzwonkami, złota blaszka „Świętość PANU”, szaty synów Aarona i czystość służby',
      from: 31,
      to: 43,
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
            `<p><span class="verse-num">28:${v.number}</span> ${v.text}</p>`
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
const v1TtsText = `☀️ Z Biblią za Pan Brat — Dzień Pięćdziesiąty Ósmy

**Czy zdajesz sobie sprawę, że Twój Wielki Arcykapłan nie tylko dźwiga ciężar Twojego życia na swoich potężnych ramionach, lecz nieustannie nosi Twoje imię blisko swojego serca przed obliczem Ojca w niebie?**

Zatrzymaj się w ten piątkowy poranek, dwudziestego siódmego listopada dwa tysiące dwudziestego szóstego roku. Pomyśl przez chwilę o sytuacjach, w których czujesz się niewidzialny, zapomniany albo przytłoczony własną niedoskonałością przed Bogiem. Kiedy patrzysz na swoje słabości i porażki mijającego tygodnia, czy wierzysz, że w niebie jest Ktoś, kto wstawia się za Tobą z pełną mocą i osobistą czułością? Tato, dlaczego tak często próbujemy ukryć swoje braki pod własnymi zasługami zamiast przyjąć święte szaty chwały i łaski, które przygotowałeś dla nas w swoim Synu?

W dwudziestym ósmym rozdziale Księgi Wyjścia Bóg opisuje niezwykły strój arcykapłana Aarona oraz jego synów — wykonany przez rzemieślników napełnionych duchem mądrości, na cześć i na ozdobę. Wśród sześciu głównych części stroju szczególne miejsce zajmował misternie tkany efod z dwóch naramienników, na których spoczywały dwa kamienie onyksu z wyrytymi imionami wszystkich dwunastu pokoleń Izraela. Na piersiach arcykapłana spoczywał natomiast kwadratowy pektorał wyrokowania wysadzany dwunastoma szlachetnymi kamieniami — każdy z wyrytym imieniem jak na pieczęci, blisko serca Aarona, wraz z Urim i Tummim do szukania Bożej woli. Pod efodem znajdował się błękitny ornat ze złotymi dzwonkami i haftowanymi jabłkami granatu u dołu, aby podczas służby rozbrzmiewał dźwięk w Miejscu Świętym. A na przodzie białej bisiorowej mitry lśniła blaszka ze szczerego złota z wyrytym napisem Świętość Panu, aby arcykapłan zjednał ludowi łaskę u Boga.

Psychologia głębokiej więzi i zaufania potwierdza, że ludzkie serce odzyskuje wewnętrzny pokój wtedy, gdy wie, że zostało zapamiętane po imieniu i objęte opieką silniejszego Pośrednika. Poczucie bezpieczeństwa nie rodzi się z własnej nieomylności, lecz z pewności bycia noszonym w czyimś sercu.

Prawda Królestwa uderza z wyzwalającą mocą: cały dwudziesty ósmy rozdział Księgi Wyjścia jest wspaniałym portretem naszego Pana Jezusa Chrystusa! Jak Aaron dźwigał imiona ludu na obu ramionach i na swych piersiach, tak Jezus łączy w sobie wszechmoc ramion Dobrego Pasterza z czułą miłością serca, które nigdy o Tobie nie zapomina. Dwanaście klejnotów na pektorale pokazuje różnorodność Bożego ludu — każdy kamień ma inną barwę i kształt, lecz wszystkie lśnią w jednej złotej oprawie łaski! A złota blaszka z napisem Świętość Panu na czole arcykapłana zapowiada doskonałą świętość samego Jezusa, który nigdy nie musiał składać ofiary za własne grzechy, lecz przez własną krew stał się naszym jedynym i wiecznym Pośrednikiem.

Jezus mówi dziś do Ciebie przez świadectwo Pisma:
„Dlatego też całkowicie może zbawić tych, którzy przez niego przychodzą do Boga, bo zawsze żyje, aby wstawiać się za nimi.” (List do Hebrajczyków, rozdział siódmy, werset dwudziesty piąty, UBG)

Zadanie Taktyczne:
Na swoim piątkowym posterunku odrzuć dziś wszelkie zwątpienie w Bożą pamięć o Tobie — nie polegaj na własnym samousprawiedliwieniu ani na lęku, lecz wyznaj z odwagą: Jezus Chrystus nosi moje imię na swoich ramionach i na swoim sercu przed tronem Ojca, a Jego doskonała świętość okrywa moją niedoskonałość! Znajdź dzisiaj spokojną chwilę na lekturę Słowa i modlitwę za osoby, których imiona chcesz przynieść przed Boga.

W Christian Culture aplikacje i portale są dla Ciebie zawsze bezpłatne.

Modlitwa Bojowa:
Ojcze w niebie, dziękuję Ci za dwudziesty ósmy rozdział Księgi Wyjścia — za obraz świętych szat chwały, za kamienie pamięci na ramionach i za pektorał miłości na sercu arcykapłana. Przepraszam Cię za chwile, w których wątpiłem w Twoją pamięć o moim życiu albo próbowałem stanąć przed Tobą we własnej sprawiedliwości zamiast w szacie Twojego Syna. Panie Jezu Chryste, Ty jesteś moim Wielkim Najwyższym Kapłanem, który przeszedł przez niebiosa i zawsze żyje, aby wstawiać się za mną. Okrywaj moje serce swoją świętością, prowadź moje decyzje w świetle Twojego Słowa i napełniaj mój piątek głębokim pokojem. Tobie chwała na wieki. Amen.

Rozkaz Dnia (Zadbaj o wzrost):
Zbuduj dziś swoje życie według wiernego wzoru Pisma Świętego przez sześćdziesiąt sześć miesięcy codziennej formacji biblijnej w akademii. Czytaj codziennie jeden rozdział, dziel się światłem Ewangelii z bliskimi i wzrastaj we wspólnocie wiary.

Błogosławieństwo:
Niech Pan zastępów okryje Cię szatą sprawiedliwości Chrystusa i przypomni dziś Twojemu sercu, że Twoje imię jest wyryte przed Nim jak na pieczęci; niech mądrość Jego Ducha prowadzi każdy Twój krok tego piątku, a pokój Jezusa strzeże Twojego domu. Dobrego dnia! Podaj dalej.`;

if (/[0-9]/.test(v1TtsText)) {
  throw new Error('BŁĄD STANDARD_PRODUKCYJNY: Wersja 1 TTS zawiera cyfry arabskie!');
}
if (/\b[IVXLCDM]+\b/.test(v1TtsText)) {
  throw new Error('BŁĄD STANDARD_PRODUKCYJNY: Wersja 1 TTS zawiera cyfry rzymskie!');
}

const v2WebText = `☀️ Z Biblią za Pan Brat — Dzień 58 (27 listopada 2026 r., Piątek)
📖 Księga Wyjścia 28:1–43: Szaty Arcykapłańskie, Pektorał z Dwunastoma Kamieniami i Złota Blaszka Świętości

Czy wiesz, dlaczego arcykapłan nosił imiona dwunastu pokoleń Izraela zarówno na obu ramionach, jak i na swoim sercu — i w jaki sposób złota blaszka „Świętość PANU” zapowiada doskonałe pośrednictwo Jezusa Chrystusa?

W 58. dniu codziennej formacji biblijnej (https://polskieradio.cc/akademia#kurscodzienny) otwieramy 28. rozdział Księgi Wyjścia (Wj 28:1–43: https://polskieradio.cc/mojabiblia?book=EXO&chapter=28). Po opisie Przybytku Bóg powołuje Aarona i jego synów do służby kapłańskiej i nakazuje wykonać święte szaty „na cześć i na ozdobę” (Wj 28:1–5): misterny efod z dwoma kamieniami onyksu na naramiennikach (Wj 28:6–14), kwadratowy pektorał wyrokowania wysadzany 12 drogimi kamieniami wraz z Urim i Tummim noszony nieustannie na sercu przed PANEM (Wj 28:15–30), błękitny ornat ze złotymi dzwonkami i granatami (Wj 28:31–35) oraz złotą blaszkę „Świętość PANU” na przodzie mitry (Wj 28:36–43). Wybieraj dzisiaj świadomie: przystępuj z ufnością do tronu łaski, wiedząc, że Jezus — nasz Wielki Arcykapłan — zawsze żyje, aby wstawiać się za Tobą!

Jezus mówi dziś do Ciebie:
• „I Aaron będzie nosił imiona synów Izraela na pektorale wyrokowania, na swych piersiach, gdy będzie wchodził do Miejsca Świętego, na wieczną pamiątkę przed PANEM.” (Wj 28:29, UBG)
• „Dlatego też całkowicie może zbawić tych, którzy przez niego przychodzą do Boga, bo zawsze żyje, aby wstawiać się za nimi.” (Hbr 7:25, UBG)

Zadanie Taktyczne:
• Czytaj: Wj 28:1–43 oraz Hbr 4:14–16 i 7:23–28.
• Wierz: Jezus Chrystus dźwiga Cię na ramionach swojej mocy, nosi Twoje imię na swoim sercu i staje przed Ojcem jako Twoja doskonała „Świętość PANU”.
• Działaj: Przynieś dziś w modlitwie po imieniu 3 bliskie osoby przed tron łaski i pamiętaj, że dźwięk Twojej wiary (jak złote dzwonki na ornacie) niesie świadectwo innym.

Studiuj pełny tekst UBG, 8 kodów Stronga, 45-punktową egzegezę i quiz z 20 pytaniami:
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-58

Dołącz do wspólnoty wzrostu:
💬 https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0
📻 Radio 24/7 i Biblia Audio: https://polskieradio.cc
💛 Wspieraj misję Słowa (WspieramTO): https://polskieradio.cc/wspieramto`;

const v3SmsText = `Dzień 58 (Wj 28:29): Aaron nosił imiona ludu na piersiach przed PANEM. Dziś Jezus nosi Twoje imię na swoim sercu i wstawia się za Tobą! polskieradio.cc/akademia/kurscodzienny/dzien-58`;

const v4VideoText = `[OPRAWA GRAFICZNA & MUZYCZNA]
Nowoczesne, eleganckie studio Christian Culture TV w głębokiej czerni (#000000) oraz szlachetnym złocie Champagne Gold (#C4A35A / #D4AF37). Na wielkoformatowym ekranie za prowadzącymi monumentalna scena biblijna z Miejsca Świętego: arcykapłan Aaron w bogato tkanym efodzie ze złota, błękitu, purpury i karmazynu, z dwoma kamieniami onyksu na ramionach, kwadratowym pektorałem wysadzanym dwunastoma szlachetnymi kamieniami, błękitnym ornatem ze złotymi dzwonkami i granatami u dołu oraz białą bisiorową mitrą ze lśniącą złotą blaszką. Tytuł na ekranie: „Z BIBLIĄ ZA PAN BRAT — DZIEŃ 58: SZATY ARCYKAPŁAŃSKIE, PEKTORAŁ Z DWUNASTOMA KAMIENIAMI I ZŁOTA BLASZKA ŚWIĘTOŚCI (WJ 28:1–43)”.

[INTRO: PIĘKNO SŁUŻBY I IMIĘ NA SERCU]
Noemi: Dzień dobry w piątkowy poranek! Witamy serdecznie wszystkich widzów Christian Culture TV w pięćdziesiątym ósmym dniu naszego kursu „Z Biblią za Pan Brat”! Wczoraj w dwudziestym siódmym rozdziale Księgi Wyjścia poznaliśmy dziedziniec Przybytku i miedziany ołtarz, a dziś w dwudziestym ósmym rozdziale spotykamy osobę, która w tym Przybytku staje między świętym Bogiem a grzesznym ludem!
Sara: Witaj Noemi, witamy bardzo ciepło każdego z Was! Bóg powołuje dziś Aarona i jego synów na urząd kapłański i nakazuje zdolnym rzemieślnikom, napełnionym duchem mądrości, utkać święte szaty „na cześć i na ozdobę”. To niezwykle poruszające: każdy kolor, każdy kamień i każdy złoty łańcuszek na tym stroju miał opowiadać o tym, jak Bóg traktuje swój lud!

[ANALIZA PROBLEMOWA: RAMIONA MOCY, PEKTORAŁ MIŁOŚCI I ZŁOTA BLASZKA]
Noemi: Zobaczmy tę niesamowitą podwójną symbolikę z dziewiątego i dwudziestego dziewiątego wersetu! Na obu naramiennikach efodu spoczywały dwa kamienie onyksu — po sześć wyrytych imion synów Izraela na każdym ramieniu. Ramiona w Biblii to symbol siły i dźwigania ciężaru — dokładnie tak jak pasterz bierze zagubioną owcę na swoje ramiona!
Sara: A na piersiach arcykapłana spoczywał kwadratowy pektorał wyrokowania z dwunastoma różnymi, drogocennymi kamieniami w złotych oprawach — od karneolu i szmaragdu po szafir, ametyst i jaspis! Wewnątrz pektorału znajdowały się Urim i Tummim, a dwudziesty dziewiąty werset mówi wyraźnie: „Aaron będzie nosił imiona synów Izraela na pektorale wyrokowania, na swych piersiach, gdy będzie wchodził do Miejsca Świętego, na wieczną pamiątkę przed PANEM”. Nie tylko siła na ramionach, ale i czułość tuż przy sercu!
Noemi: Do tego dochodzi błękitny ornat ze złotymi dzwonkami i granatami na dole, aby w Miejscu Świętym rozbrzmiewał dźwięk życia, oraz szczytowy znak na czole Aarona — blaszka ze szczerego złota z wyrytym napisem: „Świętość PANU”, aby zjednał ludowi łaskę u Boga!

[SŁOWO ROZKAZU: JEZUS — NASZ WIELKI ARCYKAPŁAN W NIEBIE]
Sara: I w tym punkcie cały dwudziesty ósmy rozdział Księgi Wyjścia rozświetla się blaskiem Ewangelii! List do Hebrajczyków w czwartym i siódmym rozdziale pokazuje, że te święte szaty były cieniem doskonałej służby Pana Jezusa Chrystusa, który przeszedł przez niebiosa i jest święty, niewinny, nieskalany i wywyższony ponad niebiosa!
Noemi: Właśnie tak! Jezus Chrystus nosi nasze imiona jak wyryte na pieczęci: dźwiga nas na swoich ramionach i trzyma blisko swojego serca przed obliczem Ojca! A ponieważ ma kapłaństwo nieprzemijające, List do Hebrajczyków w siódmym rozdziale, dwudziestym piątym wersecie zapewnia: „Dlatego też całkowicie może zbawić tych, którzy przez niego przychodzą do Boga, bo zawsze żyje, aby wstawiać się za nimi”!

[ZADANIE TAKTYCZNE: CZYTAJ, WIERZ, DZIAŁAJ]
Noemi: Jak przeżyć dwudziesty ósmy rozdział Księgi Wyjścia w ten piątek?
• Czytaj: dwudziesty ósmy rozdział Księgi Wyjścia oraz czwarty i siódmy rozdział Listu do Hebrajczyków.
• Wierz: Twoje imię nie zostało zapomniane — Jezus Chrystus jest Twoim wiecznym Arcykapłanem i Twoją doskonałą świętością przed Bogiem.
• Działaj: Przynieś dzisiaj w modlitwie imiona trzech bliskich osób przed tron łaski i pamiętaj, by w każdej rozmowie brzmiał czysty dźwięk prawdy i życzliwości!

[MANIFEST: MODLITWA BOJOWA]
Sara: Pomódlmy się razem! Ojcze Niebieski, dziękujemy Ci za piękny obraz szat chwały z dwudziestego ósmego rozdziału Księgi Wyjścia — za ramiona mocy, serce pamięci i złotą pieczęć „Świętość PANU”.
Noemi: Panie Jezu, nasz Wielki Arcykapłanie, dziękujemy Ci, że znasz nas po imieniu i zawsze żyjesz, aby wstawiać się za nami przed Ojcem. Okryj nas dziś swoją sprawiedliwością i prowadź przez cały ten piątek w pokoju i odwadze wiary. W imieniu Jezusa. Amen!

[OUTRO: BŁOGOSŁAWIEŃSTWO I WZROST]
Sara: Niech świadomość, że Jezus nosi Twoje imię na swoim sercu, da Ci dziś głęboki pokój i radość!
Noemi: Czytaj, wierz, działaj. Dla Jezusa! Do zobaczenia jutro w dwudziestym dziewiątym rozdziale Księgi Wyjścia!`;

const v5ArticleText = `🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: SZATY CHWAŁY, PEKTORAŁ PAMIĘCI I „ŚWIĘTOŚĆ PANU” — TEOLOGIA ARCYKAPŁAŃSTWA W KSIĘDZE WYJŚCIA 28
Autor: Cezary Rogowski, red. nacz. CCN News | Data publikacji: 27 listopada 2026 r.

Dwudziesty ósmy rozdział Księgi Wyjścia (Wj 28:1–43) zamyka pierwszy etap objawienia dotyczącego kultu w Przybytku, przechodząc od jego przestrzeni i sprzętów do osoby samego pośrednika — arcykapłana Aarona. Precyzyjny opis świętych szat ukazuje teologię reprezentacji, mądrości rzemieślniczej oraz świętości, która znajduje swoje ostateczne wypełnienie w służbie Jezusa Chrystusa.

1. Szaty „na cześć i na ozdobę” oraz efod z kamieniami onyksu (Wj 28:1–14)
> „Uczynisz święte szaty dla twego brata Aarona, na cześć i na ozdobę.” — Księga Wyjścia 28:2 (UBG)

Wykonanie szat (*beged*, בֶּגֶד, Strong H899) Bóg powierzył rzemieślnikom napełnionym „duchem mądrości” (Wj 28:3) — co potwierdza, że biblijne piękno i sztuka służą prawdzie objawienia. Zewnętrzny *efod* (אֵפוֹד, Strong H646) utkano ze złota, błękitnej tkaniny, purpury, karmazynu i skręconego bisioru. Na obu jego naramiennikach osadzono w złotych oprawach dwa kamienie onyksu z wyrytymi jak na pieczęci imionami dwunastu synów Izraela — po sześć na każdym ramieniu według kolejności narodzenia (Wj 28:9–12). W ten sposób arcykapłan wchodził przed Boże oblicze nie jako osoba prywatna, lecz jako przedstawiciel całego ludu dźwiganego na ramionach mocy.

2. Pektorał wyrokowania, dwanaście kamieni oraz Urim i Tummim (Wj 28:15–30)
> „I Aaron będzie nosił imiona synów Izraela na pektorale wyrokowania, na swych piersiach, gdy będzie wchodził do Miejsca Świętego, na wieczną pamiątkę przed PANEM.” — Księga Wyjścia 28:29 (UBG)

Centralnym elementem stroju był kwadratowy, złożony we dwoje pektorał wyrokowania (*choszen*, חֹשֶׁן, Strong H2833) o wymiarach piędzi na piędź, połączony z efodem złotymi łańcuszkami i błękitnym sznurem, aby nigdy od niego nie odstawał (Wj 28:22–28). W czterech rzędach po trzy kamienie lśniło w nim dwanaście klejnotów (karneol, topaz, szmaragd; karbunkuł, szafir, diament; hiacynt, agat, ametyst; beryl, onyks, jaspis) — każdy z wyrytym imieniem jednego z dwunastu pokoleń (Wj 28:17–21). Wewnątrz pektorału umieszczono *Urim i Tummim* (אוּרִים וְתֻמִּים, Strong H224 i H8550 — tradycyjnie rozumiane jako „Światła i Doskonałości”), przez które arcykapłan nosił „sąd synów Izraela” nieustannie na swoim sercu (Wj 28:30).

3. Błękitny ornat, złota blaszka „Świętość PANU” i szaty kapłańskie (Wj 28:31–43)
> „Uczynisz też blaszkę ze szczerego złota, a na niej wyryjesz jak na pieczęci: Świętość PANU.” — Księga Wyjścia 28:36 (UBG)

Pod efodem Aaron nosił błękitny ornat (*meil*, מְעִיל, Strong H4598) wykończony u dołu naprzemiennymi jabłkami granatu i złotymi dzwonkami, których dźwięk miał być słyszalny przy wchodzeniu i wychodzeniu przed PANEM (Wj 28:31–35). Na przodzie bisiorowej mitry (*micnefet*, מִצְנֶפֶת, Strong H4701) przytwierdzono błękitnym sznurem lśniącą złotą blaszkę (*cic*, צִיץ, Strong H6731) z napisem „Świętość PANU” (*kodesz*, קֹדֶשׁ, Strong H6944), aby Aaron „nosił nieprawość poświęconych rzeczy” i zjednał ludowi łaskę u PANA (Wj 28:36–38). Dopełnieniem całości była tkana bisiorowa tunika, pas, szaty dla synów Aarona oraz lniane spodnie chroniące świętość i godność służby (Wj 28:39–43).

4. Perspektywa Chrystocentryczna: Wielki Najwyższy Kapłan Nowego Przymierza
W kanonie Nowego Testamentu cały 28. rozdział Księgi Wyjścia odnajduje swoje spełnienie w osobie Jezusa Chrystusa. List do Hebrajczyków ukazuje Jezusa jako Wielkiego Najwyższego Kapłana, który przeszedł przez niebiosa (Hbr 4:14), współczuje naszym słabościom (Hbr 4:15) i jako jedyny nie musi składać ofiar za własne grzechy, lecz raz na zawsze ofiarował samego siebie (Hbr 7:26–27). Podczas gdy Aaron nosił ludzką słabość pod symbolem złotej blaszki „Świętość PANU”, Chrystus jest samą świętością i sprawiedliwością swoich wierzących (1 Kor 1:30), dźwigając ich imiona na ramionach wszechmocy i na sercu wiecznego wstawiennictwa (Hbr 7:25), a zróżnicowane klejnoty pektorału zapowiadają różnorodne piękno odkupionego ludu Bożego w Nowym Jeruzalem (Obj 21:19–20).

📌 PODSUMOWANIE REDAKCYJNE CCN:
Księga Wyjścia 28:1–43 odsłania prawdę o Bożej pamięci, pięknie i pośrednictwie: żaden wierzący nie staje przed świętym Bogiem sam, ponieważ nasz Najwyższy Kapłan Jezus Chrystus nosi nasze imiona zarówno na ramionach mocy, jak i na sercu wiecznej łaski.

🌐 Źródła i serwisy pokrewne: polskieradio.cc | polskieradio.cc/akademia | polskieradio.cc/mojabiblia`;

// ── 2. QUIZ: 20 PYTAŃ Z WJ 28:1–43 (100% ZGODNE Z UBG-2025) ──
const quizItems = [
  {
    q: '1. Kogo Bóg kazał przywołać Mojżeszowi do sprawowania urzędu kapłańskiego (Wj 28:1)?',
    a: ['Tylko Mojżesza i Jozuego', 'Aarona oraz jego synów: Nadaba, Abihu, Eleazara i Itamara', 'Dwunastu książąt pokoleń Izraela', 'Kalebów i Lewitów z pokolenia Judy'],
    c: 1,
  },
  {
    q: '2. W jakim celu miały zostać wykonane święte szaty dla Aarona (Wj 28:2)?',
    a: ['Na znak bogactwa wobec Egiptu', 'Na cześć i na ozdobę', 'Jako pancerz wojenny', 'Wyłącznie na dzień Postu'],
    c: 1,
  },
  {
    q: '3. Czym Bóg napełnił zdolnych rzemieślników, aby wykonali szaty dla Aarona (Wj 28:3)?',
    a: ['Srebrem i miedzią', 'Duchem mądrości', 'Księgami praw', 'Oliwą namaszczenia'],
    c: 1,
  },
  {
    q: '4. Jakie sześć szat wymienia Wj 28:4?',
    a: ['Pektorał, efod, ornat, tunikę haftowaną, mitrę i pas', 'Płaszcz skórzany, sandały, koronę, pierścień, laskę i zasłonę', 'Zbroję miedzianą, hełm, pas, tarczę, sandały i płaszcz', 'Tunikę z koziej sierści, pas ze złota, dzwonki, kadzielnicę, mitrę i laskę'],
    c: 0,
  },
  {
    q: '5. Z jakich pięciu materiałów mieli wykonać efod i pektorał wyrokowania (Wj 28:5–6, 15)?',
    a: ['Z miedzi, srebra, żelaza, wełny i skór baranich', 'Ze złota, błękitnej tkaniny, purpury, karmazynu i skręconego bisioru', 'Z jedwabiu, srebra, kości słoniowej, cedru i lnu', 'Z akacji, mosiądzu, wełny białej, popiołu i złota'],
    c: 1,
  },
  {
    q: '6. Jakie dwa kamienie miał wziąć Mojżesz i wyryć na nich imiona synów Izraela na naramienniki efodu (Wj 28:9–12)?',
    a: ['Dwa szafiry', 'Dwa kamienie onyksu', 'Dwa diamenty', 'Dwa karneole'],
    c: 1,
  },
  {
    q: '7. W jakim porządku i po ile imion wyryto na dwóch kamieniach onyksu (Wj 28:10)?',
    a: ['Po cztery imiona według wieku synów Aarona', 'Sześć imion na jednym kamieniu i sześć na drugim według kolejności ich narodzenia', 'Dwanaście imion na jednym kamieniu bez kolejności', 'Tylko imiona Judy i Lewiego'],
    c: 1,
  },
  {
    q: '8. Gdzie Aaron miał nosić te dwa kamienie onyksu „na pamiątkę” przed PANEM (Wj 28:12)?',
    a: ['Na obu swoich dłoniach', 'Na obu swych ramionach (na naramiennikach efodu)', 'Na dole błękitnego ornatu', 'Na skraju pasa efodu'],
    c: 1,
  },
  {
    q: '9. Jaki kształt i jakie wymiary miał pektorał wyrokowania (Wj 28:16)?',
    a: ['Okrągły, o średnicy jednego łokcia', 'Kwadratowy, złożony we dwoje, na piędź długości i na piędź szerokości', 'Trójkątny, na dwa łokcie wysokości', 'Prostokątny, na pięć łokci długości'],
    c: 1,
  },
  {
    q: '10. Ile rzędów i ile łącznie drogich kamieni znajdowało się na pektorale wyrokowania (Wj 28:17–21)?',
    a: ['Dwa rzędy po trzy kamienie (6 kamieni)', 'Cztery rzędy po trzy kamienie (12 kamieni z imionami według dwunastu pokoleń)', 'Trzy rzędy po cztery kamienie (12 kamieni bez napisów)', 'Siedem kamieni w jednym kręgu'],
    c: 1,
  },
  {
    q: '11. Które trzy kamienie otwierały pierwszy rząd na pektorale (Wj 28:17)?',
    a: ['Karneol, topaz i szmaragd', 'Szafir, diament i ametyst', 'Hiacynt, agat i jaspis', 'Beryl, onyks i karneol'],
    c: 0,
  },
  {
    q: '12. Czym pektorał był przywiązany od dołu do efodu, aby od niego nie odstawał (Wj 28:28)?',
    a: ['Miedzianym drutem', 'Sznurem z błękitnej tkaniny łączącym złote pierścienie pektorału i efodu', 'Klamrą ze srebra', 'Skórzanym rzemieniem'],
    c: 1,
  },
  {
    q: '13. Gdzie według Wj 28:29 Aaron miał nosić imiona synów Izraela na pektorale wyrokowania?',
    a: ['Na swoich plecach', 'Na swych piersiach, gdy będzie wchodził do Miejsca Świętego, na wieczną pamiątkę przed PANEM', 'Na lewym ramieniu przed ołtarzem całopalenia', 'Tylko podczas świąt na dziedzińcu'],
    c: 1,
  },
  {
    q: '14. Co Mojżesz miał włożyć do pektorału wyrokowania, aby było na sercu Aarona przed PANEM (Wj 28:30)?',
    a: ['Tablice kamienne', 'Urim i Tummim', 'Srebrne trąby', 'Kadzidło i mirrę'],
    c: 1,
  },
  {
    q: '15. Z jakiej tkaniny i jakiego koloru miał być wykonany ornat pod efod (Wj 28:31)?',
    a: ['Cały z karmazynowej wełny', 'Cały z błękitnej tkaniny', 'Z białej koziej sierści', 'Ze skóry borsuczej'],
    c: 1,
  },
  {
    q: '16. Dlaczego dokoła górnego otworu na głowę w ornacie miała być pleciona obwódka na wzór pancerza (Wj 28:32)?',
    a: ['Aby przytrzymywała dwa łańcuszki', 'Aby ornat się nie rozdzierał', 'Aby ukryć złote dzwonki', 'Aby można go było zawiesić na słupie'],
    c: 1,
  },
  {
    q: '17. Co znajdowało się na przemian dokoła dolnego brzegu błękitnego ornatu (Wj 28:33–34)?',
    a: ['Srebrne gwiazdy i korony', 'Jabłka granatu (z błękitnej tkaniny, purpury i karmazynu) oraz złote dzwonki', 'Kamienie onyksu i pierścienie z miedzi', 'Hafty z liści akacji i oliwek'],
    c: 1,
  },
  {
    q: '18. Dlaczego podczas służby Aarona musiał być słyszalny dźwięk złotych dzwonków na ornacie (Wj 28:35)?',
    a: ['Aby wzywać lud na posiłek', 'Gdy będzie wchodził do Miejsca Świętego przed PANA i gdy będzie wychodzić, żeby nie umarł', 'Aby odmierzać trzy godziny dnia', 'Aby ogłaszać rok jubileuszowy'],
    c: 1,
  },
  {
    q: '19. Jaki napis miał być wyryty na blaszce ze szczerego złota na czole Aarona (Wj 28:36–38)?',
    a: ['Król nad Izraelem', 'Świętość PANU', 'Dwunastu synów Jakuba', 'Wieczne przymierze'],
    c: 1,
  },
  {
    q: '20. Jaką dodatkową część ubioru z lnu dla Aarona i jego synów nakazuje Wj 28:42–43, aby nie ściągnęli na siebie winy?',
    a: ['Lniane płaszcze podróżne', 'Lniane spodnie od bioder aż po uda dla zakrycia nagości ciała', 'Lniane rękawice do ołtarza', 'Lniane opaski na oczy'],
    c: 1,
  },
];

// ── 3. PEŁNA LEKCJA WG WYTYCZNYCH GPT (12 SEKCJI, 45 PUNKTÓW EGZEGETYCZNYCH) ──
const lessonDocxText = `STRONA OTWIERAJĄCA

ZANIM OTWORZYSZ BIBLIĘ — WPROWADZENIE KONTEKSTOWE
Kurs „Z Biblią za Pan Brat” prowadzi przez wszystkie 66 ksiąg Pisma Świętego — miesiąc po miesiącu, księga po księdze, każdego dnia jeden fragment Słowa Bożego.
Dziś jest Dzień 58: Księga Wyjścia 28:1–43. Po ukazaniu sprzętów Miejsca Najświętszego i Świętego (Wj 25), konstrukcji samego namiotu Przybytku (Wj 26) oraz dziedzińca z miedzianym ołtarzem całopalenia i oliwą do lamp (Wj 27), Bóg kieruje teraz uwagę na osobę pośrednika — arcykapłana Aarona i jego synów.
Zanim Aaron postawi krok w Miejscu Świętym, musi przywdziać święte szaty wykonane „na cześć i na ozdobę” przez rzemieślników napełnionych duchem mądrości (Wj 28:1–5). Każdy szczegół tego stroju — od dwóch kamieni onyksu na ramionach, przez pektorał wyrokowania z dwunastoma klejnotami na sercu oraz Urim i Tummim, po błękitny ornat ze złotymi dzwonkami i lśniącą blaszkę „Świętość PANU” na czole — uczy nas, jak Jezus Chrystus reprezentuje swój lud przed tronem Ojca (Wj 28:6–43).

TEKST PISMA ŚWIĘTEGO (UWSPÓŁCZEŚNIONA BIBLIA GDAŃSKA — WJ 28:1–43)
${buildVersesDocxText()}

KLUCZE JĘZYKOWE & KODY STRONGA (WJ 28:1–43)
• H899 — בֶּגֶד (Beged): święte szaty kapłańskie wykonane „na cześć i na ozdobę” służby Bożej (Wj 28:2).
• H646 — אֵפוֹד (Efod): misternie tkana szata wierzchnia ze złota, błękitu, purpury, karmazynu i bisioru z dwoma naramiennikami (Wj 28:6).
• H2833 — חֹשֶׁן (Choszen): kwadratowy pektorał (napierśnik) wyrokowania z dwunastoma kamieniami na piersiach arcykapłana (Wj 28:15, 29).
• H224 — אוּרִים (Urim) i H8550 — תֻּמִּים (Tummim): „Światła i Doskonałości” włożone do pektorału wyrokowania przed obliczem PANA (Wj 28:30).
• H4598 — מְעִיל (Meil): cały błękitny ornat pod efod, obszyty u dołu złotymi dzwonkami i jabłkami granatu (Wj 28:31–34).
• H6731 — צִיץ (Cic): lśniąca blaszka (korona) ze szczerego złota umieszczona na przodzie mitry (Wj 28:36–37).
• H6944 — קֹדֶשׁ (Kodesz): świętość, oddzielenie dla Boga — wyryty napis „Świętość PANU” na czole arcykapłana (Wj 28:36–38).
• H4701 — מִצְנֶפֶת (Micnefet): bisiorowa mitra arcykapłana podtrzymująca złotą blaszkę na błękitnym sznurze (Wj 28:4, 37, 39).

ANALIZA EGZEGETYCZNA — 5 CZĘŚCI, 45 PUNKTÓW STUDIUM (WJ 28:1–43)

CZĘŚĆ I — POWOŁANIE KAPŁAŃSKIE, DUCH MĄDROŚCI I SZEŚĆ SZAT CHWAŁY (WJ 28:1–5)
1. Bóg sam powołuje pośrednika (28:1): „Przywołaj do siebie twego brata Aarona...” — nikt nie bierze sobie tej godności sam, lecz otrzymuje ją z powołania Bożego (Hbr 5:4).
2. Rodzinna ciągłość służby (28:1): Aaron wraz z czterema synami — Nadabem, Abihu, Eleazarem i Itamarem — wchodzi do urzędu, który wymaga pokory i posłuszeństwa (por. Kpł 10:1–2).
3. „Na cześć i na ozdobę” (28:2): Święte szaty miały ukazywać majestat i piękno samego Boga, a nie próżność człowieka; w Chrystusie grzesznik otrzymuje szatę chwały zamiast łachmanów winy (Iz 61:10).
4. Zdolni rzemieślnicy napełnieni „duchem mądrości” (28:3): Duch Święty udziela darów nie tylko prorokom i kapłanom, lecz także artystom, tkaczom i rytownikom pracującym dla chwały Bożej!
5. Cel szat: „na jego poświęcenie, aby mi sprawował urząd kapłański” (28:3): Strój wyznaczał oddzielenie do świętej służby i przypominał o obecności Króla.
6. Sześć głównych części stroju (28:4): Pektorał, efod, ornat, tunika haftowana, mitra i pas — kompletne wyposażenie na spotkanie ze świętym Bogiem.
7. Pięć szlachetnych surowców (28:5): Złoto (bóstwo i chwała), błękit (niebo), purpura (królewskość), karmazyn (ofiara krwi) i bisior (sprawiedliwość) — te same barwy, co zasłony Przybytku!
8. Kapłan zharmonizowany ze świątynią (28:5–6): Wygląd arcykapłana współgrał z wnętrzem Przybytku, bo sługa Boży ma odzwierciedlać charakter miejsca, w którym służy.
9. Powaga urzędu mimo ludzkiej słabości (28:1–4): Nawet po grzechu Aarona ze złotym cielcem (Wj 32) Bóg pokazał przez strój, że urząd stoi łaską i powołaniem Pana, a nie ludzką bezbłędnością.

CZĘŚĆ II — EFOD I DWA KAMIENIE ONYKSU NA RAMIONACH ARCYKAPŁANA (WJ 28:6–14)
10. Efod — rozpoznawalna szata wierzchnia (28:6): Utkano go ze złotej nici i czterech królewskich barw; był widocznym znakiem służby arcykapłańskiej.
11. Dwa naramienniki połączone na końcach (28:7): Spajały przód i tył efodu w jedną całość — jedność służby przed Bogiem i przed ludem.
12. Pas efodu z tych samych surowców (28:8): Przepasanie oznacza w Biblii gotowość do pracy i wierności (Łk 12:35; Ef 6:14).
13. Dwa kamienie onyksu z wyrytymi imionami (28:9–10): Sześć imion na jednym kamieniu i sześć na drugim według kolejności narodzenia — ani jedno z dwunastu pokoleń nie zostało pominięte!
14. „Jak rytownik, który wykuwa pieczęć” (28:11): Imiona nie były napisane atramentem, który ściera czas, lecz głęboko wyryte w twardym kamieniu — trwałość Bożej pamięci (Iz 49:16).
15. Osadzone w złotych oprawach (28:11): Nawet imiona słabych ludzi spoczywały w oprawie czystego złota Bożej chwały.
16. „Na obu swych ramionach na pamiątkę” (28:12): Ramiona symbolizują siłę i dźwiganie ciężaru — jak pasterz bierze zagubioną owcę na ramiona (Łk 15:5), tak arcykapłan niósł cały Izrael!
17. Dwa plecione łańcuszki ze szczerego złota (28:13–14): Mocne, nierozerwalne połączenie naramienników mocy z pektorałem serca — Boża siła i Boża miłość nigdy nie działają osobno.
18. Złote oprawy jako kotwice (28:13–14): Precyzyjne wykonanie uczy nas rzetelności i solidności w sprawach Bożych.

CZĘŚĆ III — PEKTORAŁ WYROKOWANIA, DWANAŚCIE KAMIENI ORAZ URIM I TUMMIM (WJ 28:15–30)
19. „Pektorał wyrokowania” — dosł. napierśnik sądu (28:15): Wyhaftowany z tych samych materiałów co efod, bo wyroki Boga zawsze łączą sprawiedliwość z miłosierdziem.
20. Kwadratowy, złożony we dwoje, piędź na piędź (28:16): Tworzył wewnątrz rodzaj kieszeni na Urim i Tummim; kwadrat symbolizował doskonałość i stałość (por. Obj 21:16).
21. Dwanaście klejnotów w czterech rzędach po trzy (28:17–20): Karneol, topaz, szmaragd; karbunkuł, szafir, diament; hiacynt, agat, ametyst; beryl, onyks, jaspis — każdy kamień niepowtarzalny w barwie, lecz równie cenny.
22. „Każdy z własnym imieniem, według dwunastu pokoleń” (28:21): Bóg nie traktuje nas jak bezimienny tłum — zna imię każdego swojego dziecka i każdego obdarza osobnym blaskiem!
23. Dwa rodzaje imion — na ramionach i na piersiach (28:12, 29): Na ramionach imiona spoczywały na sile Boga; na piersiach — na Jego sercu pełnym miłości i współczucia (Pnp 8:6).
24. Złote pierścienie i błękitny sznur mocujący (28:22–28): Pektorał nie mógł odstawać od efodu — serce pasterza i jego służba mają być zawsze złączone z niebiańskim błękitem woli Bożej.
25. „Na wieczną pamiątkę przed PANEM” (28:29): Gdy arcykapłan stawał w Miejscu Świętym, Bóg patrzył na imiona całego ludu lśniące na piersiach pośrednika.
26. Tajemnica Urim i Tummim (28:30): Dosłownie „Światła i Doskonałości” (Lb 27:21; 1 Sm 28:6); tekst nie opisuje szczegółowo ich kształtu ani dokładnego sposobu użycia, lecz jasno wskazuje, że służyły do rozpoznawania Bożych rozstrzygnięć przed PANEM.
27. „Nieustannie będzie nosił na sercu przed PANEM sąd synów Izraela” (28:30): Prawdziwe rozeznanie duchowe nie rodzi się z chłodnej kalkulacji, lecz z serca, które kocha ludzi i słucha Boga.

CZĘŚĆ IV — BŁĘKITNY ORNAT, DZWONKI I GRANATY ORAZ ZŁOTA BLASZKA „ŚWIĘTOŚĆ PANU” (WJ 28:31–38)
28. Ornat pod efod „cały z błękitnej tkaniny” (28:31): Barwa nieba przypominała, że ziemskie kapłaństwo czerpie powagę z niebiańskiego sanktuarium (Hbr 8:1–5).
29. Otwór z plecioną obwódką „na wzór pancerza, aby się nie rozdzierał” (28:32): Jednolita szata bez rozdarć zapowiada całodzianą tunikę Jezusa, której żołnierze nie rozdarli pod krzyżem (J 19:23–24)!
30. Jabłka granatu w trzech barwach na przemian ze złotymi dzwonkami (28:33–34): Owocność duchowa (granaty pełne ziaren) zawsze idzie w parze z czystym świadectwem słowa i posłuszeństwa (dzwonki).
31. „Aby słychać było jego dźwięk... żeby nie umarł” (28:35): Złote dzwonki świadczyły na zewnątrz, że arcykapłan żyje i pełni służbę w środku — tak w Ewangeliach i Dziejach głos świadectwa ogłasza, że nasz Arcykapłan Jezus żyje!
32. Blaszka ze szczerego złota na przodzie mitry (28:36–37): Umieszczona na czole — miejscu myśli, rozumu i otwartego wyznania wiary.
33. Pieczęć „Świętość PANU” (28:36): Najwyższy napis całego stroju — nie „władza”, nie „bogactwo”, lecz całkowite oddanie PANU!
34. „Aby nosił Aaron nieprawość poświęconych rzeczy” (28:38): Nawet nasze najgorliwsze dary i modlitwy wymagają oczyszczenia przez Pośrednika, aby zostały przyjęte przez świętego Boga!
35. Przymocowana błękitnym sznurem (28:37): Błękit niebiańskiego posłuszeństwa wiązał myśl kapłana z jego świętością.
36. „Aby im zjednał łaskę u PANA” (28:38): Kapłaństwo nie miało potępiać ludu, lecz wypraszać dla niego przyjęcie i łaskę.

CZĘŚĆ V — TUNIKA, MITRA, LNIANE SPODNIE I SYNTEZA CHRYSTOCENTRYCZNA (WJ 28:39–43)
37. Tunika i mitra z białego bisioru oraz haftowany pas (28:39): Pod zewnętrznym przepychem efodu najbliżej ciała spoczywała czysta biel bisioru — osobista prawość serca przed Bogiem.
38. Szaty dla synów Aarona również „na cześć i na ozdobę” (28:40): Także młodsi kapłani — zapowiedź całego królewskiego kapłaństwa wierzących (1 P 2:9) — dzielili godność służby.
39. Namaszczenie, poświęcenie i uświęcenie (28:41): Trzykrotne słownictwo oddania ukazuje pełnię przygotowania (rozwinie je Wj 29).
40. Lniane spodnie od bioder aż po uda (28:42): Skromność i cześć w służbie — brak miejsca dla pogańskiej zmysłowości i bezwstydu przy ołtarzu Bożym (por. Wj 20:26).
41. „Aby nie ściągnęli na siebie winy i nie pomarli” (28:43): Bliskość świętego Boga wymaga głębokiej czci i posłuszeństwa Jego słowu.
42. „Wieczna ustawa” (28:43): Zapowiedź nieprzemijającego kapłaństwa Chrystusa według porządku Melchizedeka (Hbr 7:24).
43. Efod (אֵפוֹד) i Pektorał (חֹשֶׁן): Zjednoczenie siły ramion i czułości serca w jednym Pośredniku.
44. Urim i Tummim (אוּרִים וְתֻמִּים): Światło i pełnia prawdy Bożego Słowa rozświetlająca ludzkie decyzje (J 1:9; Kol 2:3).
45. „Świętość PANU” (קֹדֶשׁ לַיהוָה): Cel zarówno wielkiej chwały arcykapłana, jak i codziennego życia każdego naśladowcy Chrystusa (1 P 1:15–16)!

JEZUS W CENTRUM — NASZ WIELKI ARCYKAPŁAN NOSZĄCY NASZE IMIONA NA RAMIONACH I NA SERCU
1. Jezus Chrystus — Najwyższy Kapłan przewyższający Aarona (Wj 28:1; Hbr 4:14–16; 7:26–27): Aaron potrzebował świętych szat, bo sam był grzesznym człowiekiem. Jezus jest święty, niewinny i nieskalany z natury, dlatego z ufnością możemy przystępować przez Niego do tronu łaski w każdej potrzebie!
2. Jezus Chrystus — Ramiona Mocy i Serce Pamięci (Wj 28:12, 29; Łk 15:5; J 10:3): Jak Aaron nosił imiona pokoleń na kamieniach onyksu na ramionach oraz na dwunastu kamieniach pektorału na piersiach, tak Dobry Pasterz bierze zagubioną owcę na ramiona i zna swoje owce po imieniu!
3. Jezus Chrystus — Prawdziwe Światło i Doskonałość (Wj 28:30; J 8:12; Kol 2:3): Urim i Tummim wskazywały na Boga jako źródło światła i prawdy. W Jezusie Chrystusie „są ukryte wszystkie skarby mądrości i poznania”, a Jego Słowo jest światłem na naszej ścieżce.
4. Jezus Chrystus — Niepodzielna Szata i Żywy Dźwięk Zmartwychwstania (Wj 28:32–35; J 19:23–24; Hbr 7:25): Błękitny ornat z nieba bez rozdarć oraz złote dzwonki ogłaszające, że kapłan żyje przed Bogiem, kierują nas do krzyża i pustego grobu: Jezus zawsze żyje, aby wstawiać się za nami!
5. Jezus Chrystus — Nasza „Świętość PANU” i Sprawiedliwość (Wj 28:36–38; 1 Kor 1:30; 2 Kor 5:21): Aaron nosił złotą blaszkę na czole, aby przyjąć w imieniu ludu przychylność Boga. Jezus stał się dla nas mądrością, sprawiedliwością, uświęceniem i odkupieniem, aby nasze niedoskonałe dary były miłe Ojcu!
6. Jezus Chrystus — Dawca Szat Kapłańskich dla Swojego Kościoła (Wj 28:40–41; 1 P 2:9; Obj 19:8): Przez wiarę i chrzest w Chrystusie stajemy się „królewskim kapłaństwem”, przyobleczonym w czysty bisior Jego sprawiedliwości i powołanym do ogłaszania chwały Tego, który nas wezwał z ciemności do swego przedziwnego światła.

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE (12 ZESTAWIEŃ)
• Wj 28:1 → Hbr 5:1–5: Kto powołuje prawdziwego arcykapłana i dlaczego nikt sam nie bierze sobie tej godności?
• Wj 28:2, 40 → Iz 61:10; Za 3:3–5: W jakie „szaty zbawienia” Bóg przyobleka grzesznika, który przychodzi do Niego z wiarą?
• Wj 28:3 → Wj 31:1–6; 1 Kor 12:4–7: W jaki sposób Duch Święty udziela praktycznych darów mądrości do służby?
• Wj 28:9–12 → Iz 49:16; Łk 15:4–6: Co znaczy dla wierzącego fakt, że Bóg wyrył jego imię i dźwiga go na swoich ramionach?
• Wj 28:17–21 → Obj 21:19–20; Ml 3:17: Jak dwanaście kamieni szlachetnych z pektorału powraca w wizji Nowego Jeruzalem?
• Wj 28:29 → Hbr 7:24–25; Rz 8:34: W jaki sposób Jezus pełni dzisiaj służbę nieustannego wstawiennictwa za swój lud?
• Wj 28:30 → Lb 27:21; Ps 119:105: Jak dziś rozpoznajemy wolę Bożą dzięki światłu Pisma Świętego i Ducha?
• Wj 28:31–32 → J 19:23–24: Co łączy niepodzielny ornat arcykapłana z niepodzielną tuniką Jezusa pod krzyżem?
• Wj 28:33–35 → Ga 5:22–23; Rz 10:14–17: Dlaczego w życiu wierzącego owoce („granaty”) muszą iść w parze z dźwiękiem świadectwa („dzwonki”)?
• Wj 28:36–38 → Hbr 4:14–16; 1 Kor 1:30: Dlaczego nasze modlitwy i dary są przyjmowane przez Ojca ze względu na Chrystusa?
• Wj 28:36 → Za 14:20; 1 P 1:15–16: Co oznacza wezwanie „Świętość PANU” w naszej codziennej pracy, domu i myślach?
• Wj 28:40–43 → 1 P 2:5, 9; Obj 1:5–6: Co znaczy, że w Chrystusie staliśmy się „królewskim kapłaństwem”?

PRAWDA NA DZIŚ (8 ZASAD — CO ZMIENIA SIĘ W MOIM PATRZENIU)
• 1. Moje imię nie jest dla Boga statystyką: Chrystus nosi mnie zarówno na ramionach swojej siły, jak i na sercu swojej miłości.
• 2. Różnorodność w Kościele jest Bożym klejnotem: Jak 12 różnych kamieni na jednym pektorale, każdy wierzący ma własny blask w jednej oprawie łaski.
• 3. Moje talenty mogą służyć chwale Bożej: Duch mądrości uzdalnia nie tylko mówców, lecz także rzemieślników, twórców i ludzi codziennej pracy.
• 4. Nie staję przed Bogiem we własnych łachmanach: Przyjmuję białą szatę sprawiedliwości Jezusa, zyskując pokój sumienia.
• 5. Prawdziwe poznanie woli Bożej zaczyna się na sercu pełnym miłości: Zanim szukam odpowiedzi, pamiętam o ludziach, których Bóg postawił obok mnie.
• 6. Owoc i głos wiary należą do siebie: Bez owoców Ducha same słowa brzmią pusto, a bez świadectwa świat nie słyszy o żywym Zbawicielu.
• 7. Świętość nie jest ponurym przymusem, lecz pięknem „na cześć i na ozdobę”: Życie oddane Bogu ma blask godności i pokoju.
• 8. Nawet moje niedoskonałe modlitwy są oczyszczone w Chrystusie: Nasz Najwyższy Kapłan zjednuje nam łaskę przed obliczem Ojca!

POMYŚL — PYTANIA DO SERCA (8 PYTAŃ)
1. Czy w chwilach zwątpienia wierzysz naprawdę, że Twoje imię jest wyryte na sercu Chrystusa „na wieczną pamiątkę przed PANEM”?
2. Których ludzi ze swojej rodziny, pracy lub zboru powinieneś dziś częściej nosić „na ramionach” modlitwy i „na sercu” troski?
3. Czy używasz swoich codziennych zdolności i rzemiosła tak, jakby napełnił Cię nimi Boży „duch mądrości” z Wj 28:3?
4. Czy w relacjach z innymi braćmi i siostrami w Chrystusie potrafisz docenić piękno różnorodności „dwunastu kamieni” w jednej złotej oprawie?
5. Czym jest dla Ciebie pieczęć „Świętość PANU” na czole — w sferze myśli, decyzji i tego, na co patrzysz każdego dnia?
6. Czy w Twoim życiu między „jabłkami granatu” (cichym owocem charakteru) a „złotymi dzwonkami” (głośnym wyznaniem) panuje zdrowa równowaga?
7. Czy zdajesz sobie sprawę, że nawet Twoje najlepsze służby i modlitwy potrzebują łaski Najwyższego Kapłana, by były miłe Bogu?
8. Co dziś najbardziej potrzebujesz złożyć przed tronem łaski, wiedząc, że Jezus współczuje Twoim słabościom (Hbr 4:15–16)?

MAŁY QUIZ WIEDZY BIBLIJNEJ (20 PYTAŃ Z WJ 28:1–43)
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
Dwudziesty ósmy rozdział Księgi Wyjścia pokazuje z niezwykłą czułością i powagą, jak bardzo Bóg troszczy się o to, aby człowiek miał w Jego obecności wiernego Pośrednika. Nie musimy sami zdobywać nieba ani zakładać maski bezbłędności — Jezus Chrystus przyjął na siebie urząd naszego Arcykapłana i nosi nasze imiona przed tronem Ojca.
Podejmij dziś świadomą decyzję: przyjmij z wiarą Boże pośrednictwo Chrystusa, szanuj piękno i powagę świętości w codziennym życiu oraz noś na swoim sercu imiona bliskich w modlitwie wstawienniczej!

MOJA DECYZJA:
„Panie Jezu Chryste, mój Wielki Najwyższy Kapłanie! Dziękuję Ci, że wyryłeś moje imię w swojej pamięci, dźwigasz mnie na swoich ramionach mocy i nosisz mnie nieustannie na swoim sercu przed Ojcem. Przyjmuję dziś Twoją doskonałą świętość zamiast mojej słabości i pragnę, aby moje myśli, słowa i czyny nosiły pieczęć: Świętość PANU!”

MODLITWA NA 27 LISTOPADA 2026 R.
Wszechmogący Ojcze w niebie! Dziękujemy Ci za dwudziesty ósmy rozdział Księgi Wyjścia — za objawienie świętych szat chwały i ozdoby, które z taką miłością opisują pośrednictwo naszego Zbawiciela. Dziękujemy Ci za dwa kamienie onyksu na ramionach mocy i za dwanaście klejnotów na piersiach miłości, które przypominają nam, że każde Twoje dziecko jest cenne i znane po imieniu.
Przepraszamy Cię, Panie, za chwile, w których zapominaliśmy o powadze Twojej świętości lub wątpiliśmy w to, że pamiętasz o naszych zmaganiach. Przepraszamy za słowa i czyny, w których brakowało owocu granatu i czystego dźwięku wiernego świadectwa.
Panie Jezu Chryste, Ty zawsze żyjesz, aby wstawiać się za nami przed tronem łaski. Odziej nasze serca swoją sprawiedliwością, uświęć nasze myśli pod znakiem „Świętość PANU” i spraw, aby przez ten piątek rozbrzmiewała w nas radość i pokój Twojej obecności. Amen!

ZADANIE NA DZIŚ (7 ZADAŃ TAKTYCZNYCH)
[ ] 1. Przeczytaj cały fragment Wj 28:1–43 w przekładzie UBG oraz List do Hebrajczyków 4:14–16 i 7:23–28.
[ ] 2. Zapamiętaj werset Wj 28:29 o imionach noszonych „na wieczną pamiątkę przed PANEM” i podziękuj Jezusowi za Jego wstawiennictwo.
[ ] 3. Zapisz imiona 3 konkretnych osób i módl się dziś za każdą z nich — noś je na sercu jak kamienie pektorału.
[ ] 4. Przejrzyj swoje dzisiejsze plany pod kątem pieczęci „Świętość PANU” — oddaj Bogu jedną sferę myśli lub nawyków do oczyszczenia.
[ ] 5. Zrób coś praktycznego dla kogoś obok siebie, łącząc piękno charakteru („granat”) z życzliwym słowem („dzwonek”).
[ ] 6. Rozwiąż wszystkich 20 pytań quizu z Wj 28, aby utrwalić wszystkie elementy świętych szat arcykapłańskich.
[ ] 7. Oznacz Dzień 58 jako ukończony w Akademii i podziel się tą lekcją z osobą, która potrzebuje dziś pewności, że Bóg o niej pamięta.

JUTRO — 28 LISTOPADA 2026 R.
DZIEŃ 59: POŚWIĘCENIE AARONA I JEGO SYNÓW, OFIARY OCZYSZCZENIA ORAZ NIEUSTANNE CAŁOPALENIE (WJ 29:1–46)
Jutro w 29. rozdziale Księgi Wyjścia zobaczymy siedmiodniową uroczystość poświęcenia kapłanów: obmycie wodą, namaszczenie olejkiem, ofiarę za grzech, barana poświęcenia oraz nakaz codziennego porannego i wieczornego całopalenia — wszystko po to, aby Bóg zamieszkał pośród swojego ludu i był jego Bogiem!
`;

console.log('📄 Generuję profesjonalny plik Microsoft Word (.docx) dla Dnia 58 (12 sekcji)...');

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
console.log(`✅ Zapisano pakiet-day${DAY_NUM}-5wersji.md i kc-day${DAY_NUM}-lesson.txt`);

// ── 5. BUDOWANIE PLIKU HTML LEKCJI (SZABLON DZIEŃ 57 = 21/21) ──
console.log('🌐 Generuję plik HTML lekcji Dnia 58 (4 ścieżki Clean URLs + kolejka)...');
const template57Path = path.join(REPO, 'akademia/kurscodzienny/dzien-57.html');
let html = fs.readFileSync(template57Path, 'utf8');

// 5.1 Meta, tytuły i social share
html = html.replace(
  /<title>Dzień 57: [^<]+<\/title>/,
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
  /kc_day_57_oltarz_dziedziniec_oliwa\.jpg(\?v=\d+)?/g,
  `${IMG_FILENAME}?v=20261127`
);

html = html.replace(/kurscodzienny%2Fdzien-57/g, `kurscodzienny%2Fdzien-${DAY_NUM}`);
html = html.replace(
  /Z%20Bibli%C4%85%20za%20Pan%20Brat%20%E2%80%94%20Dzie%C5%84%2057[^"']+/g,
  encodeURIComponent(`Z Biblią za Pan Brat — Dzień ${DAY_NUM}: ${TITLE} (${READING})`)
);
html = html.replace(
  /Jedno kliknięcie może przynieść pokój krzyża, czystą oliwę Ducha Świętego i światło nadziei komuś, kto dziś szczególnie tego potrzebuje\./,
  'Jedno kliknięcie może przypomnieć komuś, że Jezus Chrystus nosi jego imię na swoich ramionach mocy i na swoim sercu przed tronem Ojca.'
);

// 5.2 Nawigacja i okruszki
html = html.replace(
  /<span class="text-amber-400 font-semibold">Dzień 57<\/span>/,
  `<span class="text-amber-400 font-semibold">Dzień ${DAY_NUM}</span>`
);

const nav57Regex =
  /<a href="\/akademia\/kurscodzienny\/dzien-56"[\s\S]*?<\/a>\s*(?:<a href="\/akademia\/kurscodzienny\/dzien-58"[\s\S]*?<\/a>|<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50[\s\S]*?<\/span>\s*<\/span>)/;
const nav58Block = `<a href="/akademia/kurscodzienny/dzien-57" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 57</span>
        </a>
        <span class="px-3 py-1.5 rounded-lg bg-zinc-900/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 59 (Sobota) →</span>
        </span>`;
if (!nav57Regex.test(html)) {
  throw new Error('Nie znaleziono bloku nawigacji Dnia 57 w szablonie');
}
html = html.replace(nav57Regex, nav58Block);

// 5.3 Hero i grafika
html = html.replace(/<span>Dzień 57 z 2009<\/span>/g, `<span>Dzień ${DAY_NUM} z 2009</span>`);
html = html.replace(/26 LISTOPADA 2026 • CZWARTEK/g, DATE_SHORT_UPPER);
html = html.replace(
  /<h1 class="[^"]+">[\s\S]*?<\/h1>/,
  `<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">\n        ${TITLE}\n      </h1>`
);
html = html.replace(
  /<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">[\s\S]*?<\/p>/,
  `<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">\n        ${SUBTITLE}\n      </p>`
);
html = html.replace(
  /alt="Dzień 57:[^"]*"/,
  `alt="Dzień ${DAY_NUM}: ${TITLE} (${READING})"`
);
html = html.replace(
  /<span>Ilustracja biblijna:[^<]*<\/span>/,
  `<span>${IMG_CAPTION}</span>`
);
html = html.replace(/Czytanie: Wj 27:1–21/g, `Czytanie: ${READING}`);

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
          <p class="text-xs text-zinc-400 font-semibold">— Księga Wyjścia 28:29 (UBG)</p>
        </div>
        <button
          onclick="navigator.clipboard.writeText('„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 28:29 (UBG)'); this.innerHTML = '<i class=\\'fa-solid fa-check\\'></i> Skopiowano'; setTimeout(() => this.innerHTML = '<i class=\\'fa-regular fa-copy\\'></i> Kopiuj', 2000);"
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
  `<!-- LESSON BODY CONTENT (Dzień ${DAY_NUM}, 27.11.2026) -->`
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
            Dziś jest <strong class="text-white">Dzień 58</strong>: Księga Wyjścia, <strong class="text-brand-gold">${READING}</strong>. Po ukazaniu sprzętów świątyni i dziedzińca (Wj 25–27) Bóg powołuje Aarona i jego synów na urząd kapłański i projektuje święte szaty „na cześć i na ozdobę”.
          </p>
          <p>
            Zanim przejdziesz do komentarza, przeczytaj spokojnie czterdzieści trzy wersety w przekładzie UBG. Zwróć uwagę na dwa kamienie onyksu na ramionach efodu, dwanaście klejnotów na sercu arcykapłana oraz złotą blaszkę „Świętość PANU” na czole.
          </p>
          <a href="/mojabiblia?book=EXO&chapter=28" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]"><i class="fa-solid fa-book-open"></i><span>Czytaj ${READING}</span></a>
        </div>
      </article>`
);

// 5.6 Tekst Pisma Świętego
html = html.replace(/<!-- SCRIPTURE SECTION[^>]*-->/, `<!-- SCRIPTURE SECTION (${READING}) -->`);
html = html.replace(/Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 27:1–21/g, `Uwspółcześniona Biblia Gdańska (UBG) • ${READING}`);
html = html.replace(/\/mojabiblia\?book=EXO&chapter=27/g, `/mojabiblia?book=EXO&chapter=28`);
html = html.replace(/\/mojabiblia\?book=EXO&amp;chapter=27/g, `/mojabiblia?book=EXO&amp;chapter=28`);
html = html.replace(
  /<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>\s*<!-- KLUCZE JĘZYKOWE/,
  `<div class="kc-prose-reading">\n        ${buildVersesParagraphsHtml()}\n        </div>\n      </section>\n\n      <!-- KLUCZE JĘZYKOWE`
);

// 5.7 Klucze Językowe & Kody Stronga
const strongChips58 = `<span class="strong-chip"><span class="strong-id">H899</span> <span class="strong-orig">בֶּגֶד (Beged)</span> — święte szaty kapłańskie wykonane „na cześć i na ozdobę” (Wj 28:2)</span>
          <span class="strong-chip"><span class="strong-id">H646</span> <span class="strong-orig">אֵפוֹד (Efod)</span> — misternie tkana szata wierzchnia ze złota i królewskich barw z naramiennikami (Wj 28:6)</span>
          <span class="strong-chip"><span class="strong-id">H2833</span> <span class="strong-orig">חֹשֶׁן (Choszen)</span> — kwadratowy pektorał wyrokowania z dwunastoma kamieniami na piersiach (Wj 28:15, 29)</span>
          <span class="strong-chip"><span class="strong-id">H224 / H8550</span> <span class="strong-orig">אוּרִים וְתֻמִּים (Urim i Tummim)</span> — „Światła i Doskonałości” na sercu arcykapłana przed PANEM (Wj 28:30)</span>
          <span class="strong-chip"><span class="strong-id">H4598</span> <span class="strong-orig">מְעִיל (Meil)</span> — błękitny ornat pod efod ze złotymi dzwonkami i jabłkami granatu (Wj 28:31–34)</span>
          <span class="strong-chip"><span class="strong-id">H6731</span> <span class="strong-orig">צִיץ (Cic)</span> — lśniąca blaszka ze szczerego złota na przodzie mitry (Wj 28:36–37)</span>
          <span class="strong-chip"><span class="strong-id">H6944</span> <span class="strong-orig">קֹדֶשׁ (Kodesz)</span> — świętość: pieczęć „Świętość PANU” na czole arcykapłana (Wj 28:36–38)</span>
          <span class="strong-chip"><span class="strong-id">H4701</span> <span class="strong-orig">מִצְנֶפֶת (Micnefet)</span> — bisiorowa mitra arcykapłana podtrzymująca złotą blaszkę (Wj 28:4, 37, 39)</span>`;

html = html.replace(/Klucze Językowe &amp; Kody Stronga \(Wj 27:1–21\)/g, `Klucze Językowe &amp; Kody Stronga (${READING})`);
html = html.replace(
  /Poniższe terminy hebrajskie tworzą osnowę teologiczną 27\. rozdziału Księgi Wyjścia[\s\S]*?<\/p>/,
  `Poniższe terminy hebrajskie tworzą osnowę teologiczną 28. rozdziału Księgi Wyjścia (święte szaty chwały, efod z naramiennikami, pektorał wyrokowania, Urim i Tummim, błękitny ornat z dzwonkami oraz złota blaszka „Świętość PANU”):</p>`
);
html = html.replace(
  /<div class="flex flex-wrap gap-2">[\s\S]*?<\/div>\s*<\/section>\s*<!-- THEOLOGICAL EXEGESIS/,
  `<div class="flex flex-wrap gap-2">\n          ${strongChips58}\n        </div>\n      </section>\n\n      <!-- THEOLOGICAL EXEGESIS`
);

// 5.8 Egzegeza (5 części, 45 punktów)
html = html.replace(
  /Pięć części studium Wj 27:1–21 \(45 punktów analitycznych\)/g,
  `Pięć części studium ${READING} (45 punktów analitycznych)`
);

const exegesis58 = `<!-- CZĘŚĆ I -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
            POWOŁANIE KAPŁAŃSKIE, DUCH MĄDROŚCI I SZEŚĆ SZAT CHWAŁY (WJ 28:1–5)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>1. Bóg sam powołuje pośrednika (28:1):</strong> „Przywołaj do siebie twego brata Aarona...” — nikt nie bierze sobie tej godności sam, lecz otrzymuje ją z powołania Bożego (Hbr 5:4).</p>
            <p><strong>2. Rodzinna ciągłość służby (28:1):</strong> Aaron wraz z czterema synami — Nadabem, Abihu, Eleazarem i Itamarem — wchodzi do urzędu wymagającego pokory i posłuszeństwa (por. Kpł 10:1–2).</p>
            <p><strong>3. „Na cześć i na ozdobę” (28:2):</strong> Święte szaty ukazywały majestat i piękno samego Boga; w Chrystusie grzesznik otrzymuje szatę zbawienia zamiast łachmanów winy (Iz 61:10).</p>
            <p><strong>4. Zdolni rzemieślnicy napełnieni „duchem mądrości” (28:3):</strong> Duch Święty uzdalnia nie tylko proroków i kapłanów, lecz także artystów, tkaczy i rytowników pracujących dla chwały Bożej.</p>
            <p><strong>5. Cel szat: „na jego poświęcenie, aby mi sprawował urząd kapłański” (28:3):</strong> Strój wyznaczał oddzielenie do świętej służby i przypominał o obecności Króla.</p>
            <p><strong>6. Sześć głównych części stroju (28:4):</strong> Pektorał, efod, ornat, tunika haftowana, mitra i pas — kompletne wyposażenie na spotkanie ze świętym Bogiem.</p>
            <p><strong>7. Pięć szlachetnych surowców (28:5):</strong> Złoto, błękit, purpura, karmazyn i bisior — dokładnie te same królewskie barwy, co zasłony Przybytku.</p>
            <p><strong>8. Kapłan zharmonizowany ze świątynią (28:5–6):</strong> Wygląd arcykapłana współgrał z wnętrzem Przybytku, bo sługa Boży ma odzwierciedlać charakter Boga, któremu służy.</p>
            <p><strong>9. Powaga urzędu mimo ludzkiej słabości (28:1–4):</strong> Nawet po późniejszym upadku Aarona (Wj 32) Bóg pokazał, że urząd stoi łaską i powołaniem Pana, a nie ludzką bezbłędnością.</p>
          </div>
        </div>

        <!-- CZĘŚĆ II -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
            EFOD I DWA KAMIENIE ONYKSU NA RAMIONACH ARCYKAPŁANA (WJ 28:6–14)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>10. Efod — rozpoznawalna szata wierzchnia (28:6):</strong> Utkano go ze złotej nici i czterech królewskich barw; był widocznym znakiem posługi arcykapłańskiej.</p>
            <p><strong>11. Dwa naramienniki połączone na końcach (28:7):</strong> Spajały przód i tył efodu w jedną całość — jedność służby przed Bogiem i przed ludem.</p>
            <p><strong>12. Pas efodu z tych samych surowców (28:8):</strong> Przepasanie oznacza w Biblii gotowość do pracy, czujność i wierność (Łk 12:35; Ef 6:14).</p>
            <p><strong>13. Dwa kamienie onyksu z wyrytymi imionami (28:9–10):</strong> Sześć imion na jednym kamieniu i sześć na drugim według kolejności narodzenia — ani jedno pokolenie nie zostało pominięte!</p>
            <p><strong>14. „Jak rytownik, który wykuwa pieczęć” (28:11):</strong> Imiona wyryto głęboko w twardym kamieniu, nie atramentem — obraz trwałej Bożej pamięci (Iz 49:16).</p>
            <p><strong>15. Osadzone w złotych oprawach (28:11):</strong> Nawet imiona słabych ludzi spoczywały bezpiecznie w oprawie czystego złota Bożej chwały.</p>
            <p><strong>16. „Na obu swych ramionach na pamiątkę” (28:12):</strong> Ramiona symbolizują siłę i dźwiganie ciężaru — jak pasterz bierze zagubioną owcę na ramiona (Łk 15:5), tak arcykapłan niósł cały Izrael.</p>
            <p><strong>17. Dwa plecione łańcuszki ze szczerego złota (28:13–14):</strong> Nierozerwalne połączenie naramienników mocy z pektorałem serca — Boża siła i miłość zawsze idą razem.</p>
            <p><strong>18. Złote oprawy jako kotwice (28:13–14):</strong> Precyzja wykonania uczy nas rzetelności i solidności w najdrobniejszych sprawach służby.</p>
          </div>
        </div>

        <!-- CZĘŚĆ III -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
            PEKTORAŁ WYROKOWANIA, DWANAŚCIE KAMIENI ORAZ URIM I TUMMIM (WJ 28:15–30)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>19. „Pektorał wyrokowania” — napierśnik sądu (28:15):</strong> Wyhaftowany z tych samych materiałów co efod, bo Boże wyroki łączą prawdę z miłosierdziem.</p>
            <p><strong>20. Kwadratowy, złożony we dwoje, piędź na piędź (28:16):</strong> Tworzył kieszeń na Urim i Tummim; kwadrat symbolizował doskonałość i stałość (por. Obj 21:16).</p>
            <p><strong>21. Dwanaście klejnotów w czterech rzędach po trzy (28:17–20):</strong> Karneol, topaz, szmaragd; karbunkuł, szafir, diament; hiacynt, agat, ametyst; beryl, onyks, jaspis — każdy niepowtarzalny w barwie.</p>
            <p><strong>22. „Każdy z własnym imieniem, według dwunastu pokoleń” (28:21):</strong> Bóg nie widzi bezimiennego tłumu — zna imię każdego dziecka Bożego i obdarza je osobnym blaskiem.</p>
            <p><strong>23. Imiona na ramionach i na piersiach (28:12, 29):</strong> Na ramionach lud spoczywał na sile Boga; na piersiach — blisko Jego serca pełnego miłości (Pnp 8:6).</p>
            <p><strong>24. Złote pierścienie i błękitny sznur (28:22–28):</strong> Pektorał miał przylegać do efodu — serce pasterza i jego służba mają być ściśle związane z niebem.</p>
            <p><strong>25. „Na wieczną pamiątkę przed PANEM” (28:29):</strong> Gdy arcykapłan stawał w Miejscu Świętym, Bóg patrzył na imiona ludu lśniące na piersiach pośrednika.</p>
            <p><strong>26. Tajemnica <em>Urim i Tummim</em> (28:30):</strong> Dosłownie „Światła i Doskonałości” (Lb 27:21; 1 Sm 28:6); tekst nie opisuje szczegółowo ich kształtu, lecz jasno wskazuje, że służyły do rozpoznawania Bożych rozstrzygnięć przed PANEM.</p>
            <p><strong>27. „Nieustannie będzie nosił na sercu przed PANEM sąd synów Izraela” (28:30):</strong> Prawdziwe rozeznanie duchowe nie rodzi się z chłodnej surowości, lecz z serca, które kocha lud Boży.</p>
          </div>
        </div>

        <!-- CZĘŚĆ IV -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
            BŁĘKITNY ORNAT, DZWONKI I GRANATY ORAZ ZŁOTA BLASZKA „ŚWIĘTOŚĆ PANU” (WJ 28:31–38)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>28. Ornat pod efod „cały z błękitnej tkaniny” (28:31):</strong> Barwa nieba przypominała, że ziemskie kapłaństwo odbija niebiańskie sanktuarium (Hbr 8:1–5).</p>
            <p><strong>29. Otwór z obwódką „aby się nie rozdzierał” (28:32):</strong> Jednolita szata bez rozdarć zapowiada całodzianą tunikę Jezusa pod krzyżem (J 19:23–24).</p>
            <p><strong>30. Jabłka granatu i złote dzwonki na przemian (28:33–34):</strong> Owocność duchowa (granaty pełne nasion) zawsze idzie w parze z czystym świadectwem wiary (dzwonki).</p>
            <p><strong>31. „Aby słychać było jego dźwięk... żeby nie umarł” (28:35):</strong> Dźwięk złotych dzwonków zaświadczał na zewnątrz, że arcykapłan żyje przed Bogiem — tak Ewangelia głosi, że nasz Arcykapłan Jezus żyje!</p>
            <p><strong>32. Blaszka ze szczerego złota na przodzie mitry (28:36–37):</strong> Umieszczona na czole — miejscu myśli, rozumu i otwartego wyznania wiary.</p>
            <p><strong>33. Pieczęć „Świętość PANU” (28:36):</strong> Najwyższy napis całego stroju — nie władza ani bogactwo, lecz całkowite oddanie PANU.</p>
            <p><strong>34. „Aby nosił Aaron nieprawość poświęconych rzeczy” (28:38):</strong> Nawet nasze najgorliwsze dary i modlitwy potrzebują oczyszczenia przez Pośrednika, by zostały przyjęte przez świętego Boga.</p>
            <p><strong>35. Przymocowana błękitnym sznurem (28:37):</strong> Niebiańskie posłuszeństwo spinało myśli kapłana z jego świętością.</p>
            <p><strong>36. „Aby im zjednał łaskę u PANA” (28:38):</strong> Kapłaństwo miało wypraszać ludowi Bożą przychylność i przyjęcie.</p>
          </div>
        </div>

        <!-- CZĘŚĆ V -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">V</span>
            TUNIKA, MITRA, LNIANE SPODNIE I SYNTEZA CHRYSTOCENTRYCZNA (WJ 28:39–43)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>37. Tunika i mitra z białego bisioru oraz haftowany pas (28:39):</strong> Najbliżej ciała spoczywała czysta biel — osobista prawość serca przed Bogiem.</p>
            <p><strong>38. Szaty dla synów Aarona również „na cześć i na ozdobę” (28:40):</strong> Młodsi kapłani zapowiadają królewskie kapłaństwo wszystkich wierzących w Chrystusie (1 P 2:9).</p>
            <p><strong>39. Namaszczenie, poświęcenie i uświęcenie (28:41):</strong> Trzykrotne słownictwo oddania wskazuje na pełnię przygotowania, którą rozwinie rozdział 29.</p>
            <p><strong>40. Lniane spodnie od bioder aż po uda (28:42):</strong> Skromność i cześć w służbie — wyraźne odcięcie się od pogańskiej zmysłowości przy ołtarzu (por. Wj 20:26).</p>
            <p><strong>41. „Aby nie ściągnęli na siebie winy i nie pomarli” (28:43):</strong> Bliskość świętego Boga wymaga głębokiej czci i posłuszeństwa Jego słowu.</p>
            <p><strong>42. „Wieczna ustawa” (28:43):</strong> Zapowiedź nieprzemijającego kapłaństwa Chrystusa według porządku Melchizedeka (Hbr 7:24).</p>
            <p><strong>43. <em>Efod</em> (אֵפוֹד) i <em>Choszen</em> (חֹשֶׁן):</strong> Zjednoczenie siły ramion i czułości serca w jednym Pośredniku.</p>
            <p><strong>44. <em>Urim i Tummim</em> (אוּרִים וְתֻמִּים):</strong> Światło i pełnia prawdy Bożego Słowa rozświetlająca ludzkie decyzje (J 1:9; Kol 2:3).</p>
            <p><strong>45. „Świętość PANU” (קֹדֶשׁ לַיהוָה):</strong> Cel zarówno wielkiej chwały arcykapłana, jak i codziennego życia każdego naśladowcy Jezusa (1 P 1:15–16)!</p>
          </div>
        </div>`;

html = html.replace(
  /<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── JEZUS W CENTRUM ── -->/,
  `<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">\n        ${exegesis58}\n        </div>\n      </section>\n\n      <!-- ── JEZUS W CENTRUM ── -->`
);

// 5.9 Jezus w Centrum
const jesus58 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Nasz Wielki Najwyższy Kapłan Noszący Nasze Imiona na Ramionach i na Sercu
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            <strong>1. Jezus Chrystus — Najwyższy Kapłan przewyższający Aarona (Wj 28:1; Hebrajczyków 4:14–16; 7:26–27):</strong> Aaron potrzebował świętych szat, bo sam był grzesznym człowiekiem. Jezus jest święty, niewinny i nieskalany z natury, dlatego z ufnością możemy przystępować przez Niego do tronu łaski w każdej potrzebie!
          </p>
          <p>
            <strong>2. Jezus Chrystus — Ramiona Mocy i Serce Pamięci (Wj 28:12, 29; Łukasza 15:5; Jana 10:3):</strong> Jak Aaron nosił imiona pokoleń na kamieniach onyksu na ramionach oraz na dwunastu kamieniach pektorału na piersiach, tak Dobry Pasterz bierze zagubioną owcę na swoje ramiona i zna swoje owce po imieniu!
          </p>
          <p>
            <strong>3. Jezus Chrystus — Prawdziwe Światło i Doskonałość (Wj 28:30; Jana 8:12; Kolosan 2:3):</strong> Urim i Tummim wskazywały na Boga jako źródło światła i prawdy. W Jezusie Chrystusie „są ukryte wszystkie skarby mądrości i poznania”, a Jego Słowo jest światłem na naszej ścieżce.
          </p>
          <p>
            <strong>4. Jezus Chrystus — Niepodzielna Szata i Żywy Dźwięk Zmartwychwstania (Wj 28:32–35; Jana 19:23–24; Hebrajczyków 7:25):</strong> Błękitny ornat bez rozdarć oraz złote dzwonki ogłaszające, że kapłan żyje przed Bogiem, kierują nas do krzyża i pustego grobu: Chrystus zawsze żyje, aby wstawiać się za nami!
          </p>
          <p>
            <strong>5. Jezus Chrystus — Nasza „Świętość PANU” i Sprawiedliwość (Wj 28:36–38; 1 Koryntian 1:30; 2 Koryntian 5:21):</strong> Aaron nosił złotą blaszkę na czole, aby przyjąć w imieniu ludu przychylność Boga. Jezus stał się dla nas mądrością, sprawiedliwością, uświęceniem i odkupieniem, aby nasze niedoskonałe dary były miłe Ojcu!
          </p>
          <p>
            <strong>6. Jezus Chrystus — Dawca Szat Kapłańskich dla Swojego Kościoła (Wj 28:40–41; 1 Piotra 2:9; Objawienie 19:8):</strong> Przez wiarę w Chrystusa stajemy się „królewskim kapłaństwem”, przyobleczonym w czysty bisior Jego sprawiedliwości i powołanym do ogłaszania chwały Tego, który nas wezwał do swego przedziwnego światła.
          </p>
          <div class="pt-2">
            <a href="/mojabiblia?book=EXO&chapter=28" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
              <i class="fa-solid fa-book-open"></i>
              <span>Czytaj ${READING}</span>
            </a>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── JEZUS W CENTRUM ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-cross"><\/i>\s*<span>Jezus w centrum<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── SPRAWDŹ W BIBLII ── -->)/,
  `$1${jesus58}\n      $2`
);

// 5.10 Sprawdź w Biblii (12 wersetów porównawczych)
const compare58 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Sprawdź w Biblii — 12 Wersetów Porównawczych (${READING})
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300 font-serif">
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 28:1 → List do Hebrajczyków 5:1–5</strong>: Kto powołuje prawdziwego arcykapłana i dlaczego nikt sam nie bierze sobie tej godności?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 28:2, 40 → Izajasza 61:10; Zachariasza 3:3–5</strong>: W jakie „szaty zbawienia” Bóg przyobleka grzesznika, który przychodzi z wiarą?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 28:3 → Księga Wyjścia 31:1–6; 1 Koryntian 12:4–7</strong>: W jaki sposób Duch Święty udziela praktycznych darów mądrości do służby?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 28:9–12 → Izajasza 49:16; Łukasza 15:4–6</strong>: Co znaczy dla wierzącego fakt, że Bóg wyrył jego imię i dźwiga go na swoich ramionach?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 28:17–21 → Objawienie 21:19–20; Malachiasza 3:17</strong>: Jak dwanaście klejnotów pektorału powraca w wizji Nowego Jeruzalem?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 28:29 → List do Hebrajczyków 7:24–25; Rzymian 8:34</strong>: W jaki sposób Jezus pełni dzisiaj służbę nieustannego wstawiennictwa za swój lud?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 28:30 → Liczb 27:21; Psalm 119:105</strong>: Jak dziś rozpoznajemy wolę Bożą dzięki światłu Pisma Świętego i Ducha?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 28:31–32 → Ewangelia Jana 19:23–24</strong>: Co łączy niepodzielny ornat arcykapłana z niepodzielną tuniką Jezusa pod krzyżem?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 28:33–35 → Galacjan 5:22–23; Rzymian 10:14–17</strong>: Dlaczego owoce („granaty”) muszą iść w parze z dźwiękiem świadectwa („dzwonki”)?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 28:36–38 → Hebrajczyków 4:14–16; 1 Koryntian 1:30</strong>: Dlaczego nasze modlitwy i dary są przyjmowane przez Ojca ze względu na Chrystusa?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 28:36 → Zachariasza 14:20; 1 Piotra 1:15–16</strong>: Co oznacza wezwanie „Świętość PANU” w codziennej pracy, domu i myślach?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 28:40–43 → 1 Piotra 2:5, 9; Objawienie 1:5–6</strong>: Co znaczy, że w Chrystusie staliśmy się „królewskim kapłaństwem”?</div>
        </div>`;

html = html.replace(
  /(<!-- ── SPRAWDŹ W BIBLII ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-magnifying-glass"><\/i>\s*<span>Porównaj wersety we własnym Piśmie Świętym<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── PRAWDA NA DZIŚ ── -->)/,
  `$1${compare58}\n      $2`
);

// 5.11 Prawda na dziś
const truth58 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          8 Zasad Szat Chwały, Pektorału Pamięci i Pieczęci „Świętość PANU” — co zmienia się w moim patrzeniu
        </h3>
        <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>• <strong>1. Moje imię nie jest dla Boga statystyką:</strong> Chrystus nosi mnie zarówno na ramionach swojej siły, jak i na sercu swojej miłości.</p>
          <p>• <strong>2. Różnorodność w Kościele jest Bożym klejnotem:</strong> Jak 12 różnych kamieni na jednym pektorale, każdy wierzący ma własny blask w jednej oprawie łaski.</p>
          <p>• <strong>3. Moje talenty mogą służyć chwale Bożej:</strong> Duch mądrości uzdalnia nie tylko mówców, lecz także rzemieślników, twórców i ludzi codziennej pracy.</p>
          <p>• <strong>4. Nie staję przed Bogiem we własnych łachmanach:</strong> Przyjmuję białą szatę sprawiedliwości Jezusa, zyskując pokój sumienia.</p>
          <p>• <strong>5. Prawdziwe poznanie woli Bożej zaczyna się na sercu pełnym miłości:</strong> Zanim szukam odpowiedzi, pamiętam o ludziach, których Bóg postawił obok mnie.</p>
          <p>• <strong>6. Owoc i głos wiary należą do siebie:</strong> Bez owoców Ducha same słowa brzmią pusto, a bez świadectwa świat nie słyszy o żywym Zbawicielu.</p>
          <p>• <strong>7. Świętość nie jest ponurym przymusem, lecz pięknem „na cześć i na ozdobę”:</strong> Życie oddane Bogu ma blask godności i pokoju.</p>
          <p>• <strong>8. Nawet moje niedoskonałe modlitwy są oczyszczone w Chrystusie:</strong> Nasz Najwyższy Kapłan zjednuje nam łaskę przed obliczem Ojca!</p>
        </div>`;

html = html.replace(
  /(<!-- ── PRAWDA NA DZIŚ ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-lightbulb"><\/i>\s*<span>Prawda na dziś<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── POMYŚL ── -->)/,
  `$1${truth58}\n      $2`
);

// 5.12 Pomyśl
const questions58 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Refleksja Osobista — Spójrz w Światło Słowa (${READING})
        </h3>
        <div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>1. Czy w chwilach zwątpienia wierzysz naprawdę, że Twoje imię jest wyryte na sercu Chrystusa „na wieczną pamiątkę przed PANEM”?</p>
          <p>2. Których ludzi ze swojej rodziny, pracy lub zboru powinieneś dziś częściej nosić „na ramionach” modlitwy i „na sercu” troski?</p>
          <p>3. Czy używasz swoich codziennych zdolności i rzemiosła tak, jakby napełnił Cię nimi Boży „duch mądrości” z Wj 28:3?</p>
          <p>4. Czy w relacjach z innymi braćmi i siostrami w Chrystusie potrafisz docenić piękno różnorodności „dwunastu kamieni” w jednej złotej oprawie?</p>
          <p>5. Czym jest dla Ciebie pieczęć „Świętość PANU” na czole — w sferze myśli, decyzji i tego, na co patrzysz każdego dnia?</p>
          <p>6. Czy w Twoim życiu między „jabłkami granatu” (cichym owocem charakteru) a „złotymi dzwonkami” (głośnym wyznaniem) panuje zdrowa równowaga?</p>
          <p>7. Czy zdajesz sobie sprawę, że nawet Twoje najlepsze służby i modlitwy potrzebują łaski Najwyższego Kapłana, by były miłe Bogu?</p>
          <p>8. Co dziś najbardziej potrzebujesz złożyć przed tronem łaski, wiedząc, że Jezus współczuje Twoim słabościom (Hbr 4:15–16)?</p>
        </div>`;

html = html.replace(
  /(<!-- ── POMYŚL ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-heart"><\/i>\s*<span>Pytania do serca \(Pomyśl\)<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── QUIZ ── -->)/,
  `$1${questions58}\n      $2`
);

// 5.13 Quiz nagłówek
html = html.replace(/20 Pytań z Wj 27 \(Sprawdź swoją wiedzę\)/g, `20 Pytań z Wj 28 (Sprawdź swoją wiedzę)`);
html = html.replace(/Po przeczytaniu Wj 27/g, `Po przeczytaniu Wj 28`);

// 5.14 Twoja decyzja
const decision58 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Zaufaj Pośrednikowi, Przyjmij Jego Świętość i Noś Bliskich na Sercu!
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            Dwudziesty ósmy rozdział Księgi Wyjścia pokazuje z niezwykłą czułością i powagą, jak bardzo Bóg troszczy się o to, aby człowiek miał w Jego obecności wiernego Pośrednika. Nie musimy sami zdobywać nieba ani zakładać maski bezbłędności — Jezus Chrystus przyjął na siebie urząd naszego Arcykapłana i nosi nasze imiona przed tronem Ojca.
          </p>
          <p>
            Podejmij dziś świadomą decyzję: przyjmij z wiarą Boże pośrednictwo Chrystusa, szanuj piękno i powagę świętości w codziennym życiu oraz noś na swoim sercu imiona bliskich w modlitwie wstawienniczej!
          </p>
          <div class="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-black/40 to-transparent border border-brand-gold/40">
            <h4 class="font-bold text-amber-300 mb-2 uppercase tracking-wide text-xs">Moja Decyzja — Osobiste Wyznanie:</h4>
            <p class="italic text-white">
              „Panie Jezu Chryste, mój Wielki Najwyższy Kapłanie! Dziękuję Ci, że wyryłeś moje imię w swojej pamięci, dźwigasz mnie na swoich ramionach mocy i nosisz mnie nieustannie na swoim sercu przed Ojcem. Przyjmuję dziś Twoją doskonałą świętość zamiast mojej słabości i pragnę, aby moje myśli, słowa i czyny nosiły pieczęć: Świętość PANU!”
            </p>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── TWOJA DECYZJA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-flag-checkered"><\/i>\s*<span>Twoja decyzja<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── MODLITWA ── -->)/,
  `$1${decision58}\n      $2`
);

// 5.15 Modlitwa
html = html.replace(/<span>Modlitwa na 26 listopada<\/span>/g, `<span>Modlitwa na 27 listopada</span>`);
const prayer58 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Modlitwa o Zaufanie Naszemu Arcykapłanowi, Pamięć o Bliskich i Pieczęć Świętości
        </h3>
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed space-y-3">
          <p>
            Wszechmogący Ojcze w niebie! Dziękujemy Ci za dwudziesty ósmy rozdział Księgi Wyjścia — za objawienie świętych szat chwały i ozdoby, które z taką miłością opisują pośrednictwo naszego Zbawiciela. Dziękujemy Ci za dwa kamienie onyksu na ramionach mocy i za dwanaście klejnotów na piersiach miłości, które przypominają nam, że każde Twoje dziecko jest cenne i znane po imieniu.
          </p>
          <p>
            Przepraszamy Cię, Panie, za chwile, w których zapominaliśmy o powadze Twojej świętości lub wątpiliśmy w to, że pamiętasz o naszych zmaganiach. Przepraszamy za słowa i czyny, w których brakowało owocu granatu i czystego dźwięku wiernego świadectwa.
          </p>
          <p>
            Panie Jezu Chryste, Ty zawsze żyjesz, aby wstawiać się za nami przed tronem łaski. Odziej nasze serca swoją sprawiedliwością, uświęć nasze myśli pod znakiem „Świętość PANU” i spraw, aby przez ten piątek rozbrzmiewała w nas radość i pokój Twojej obecności. Amen!
          </p>
        </div>`;

html = html.replace(
  /(<!-- ── MODLITWA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-hands-praying"><\/i>\s*<span>Modlitwa na [^<]+<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── ZASTOSOWANIE I TWÓJ ZAPIS)/,
  `$1${prayer58}\n      $2`
);

// 5.16 Zadania na dziś (7 zadań)
const tasks58 = `<label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-1" onchange="toggleTaskState(1)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>1. Przeczytaj cały fragment <a href="/mojabiblia?book=EXO&chapter=28" class="text-amber-300 underline font-semibold">Wj 28:1–43</a> w przekładzie UBG oraz List do Hebrajczyków 4:14–16 i 7:23–28.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-2" onchange="toggleTaskState(2)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>2. Zapamiętaj werset Wj 28:29 o imionach noszonych „na wieczną pamiątkę przed PANEM” i podziękuj Jezusowi za Jego wstawiennictwo.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-3" onchange="toggleTaskState(3)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>3. Zapisz imiona 3 konkretnych osób i módl się dziś za każdą z nich — noś je na sercu jak kamienie pektorału.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-4" onchange="toggleTaskState(4)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>4. Przejrzyj swoje dzisiejsze plany pod kątem pieczęci „Świętość PANU” — oddaj Bogu jedną sferę myśli lub nawyków do oczyszczenia.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-5" onchange="toggleTaskState(5)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>5. Zrób coś praktycznego dla kogoś obok siebie, łącząc piękno charakteru („granat”) z życzliwym słowem („dzwonek”).</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-6" onchange="toggleTaskState(6)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>6. Rozwiąż wszystkich 20 pytań quizu z Wj 28, aby utrwalić wszystkie elementy świętych szat arcykapłańskich.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-7" onchange="toggleTaskState(7)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>7. Oznacz Dzień 58 jako ukończony i podziel się tą lekcją z osobą, która potrzebuje dziś pewności, że Bóg o niej pamięta.</span>
          </label>`;

html = html.replace(
  /(<p class="text-zinc-200 font-semibold mb-2">Wykonaj dzisiejsze kroki formacji biblijnej:<\/p>\s*)[\s\S]*?(<\/div>\s*<div class="space-y-4 pt-2">)/,
  `$1${tasks58}\n        $2`
);

// 5.17 Zapowiedź: Jutro (Dzień 59)
const tomorrow58 = `<section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
        <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
          JUTRO — 28 LISTOPADA 2026
        </div>
        <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
          DZIEŃ 59 — POŚWIĘCENIE AARONA I JEGO SYNÓW, OFIARY OCZYSZCZENIA ORAZ NIEUSTANNE CAŁOPALENIE (Wj 29:1–46)
        </h3>
        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">
          Dzień 59: W dwudziestym dziewiątym rozdziale Księgi Wyjścia zobaczymy siedmiodniową uroczystość poświęcenia kapłanów: obmycie wodą, namaszczenie olejkiem, ofiarę za grzech, barana poświęcenia oraz nakaz codziennego porannego i wieczornego całopalenia — wszystko po to, aby Bóg zamieszkał pośród swojego ludu!
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-[44px]">
            <span>Dostępne od północy (28 listopada 2026)</span>
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
  `<!-- ── ZAPOWIEDŹ: JUTRO ── -->\n      ${tomorrow58}`
);

// 5.18 JavaScript: QUIZ_DATA (20 pytań), DAY_KEY, completeDay58, TTS
const quizJsItems = quizItems.map(({ q, a, c }) => ({ q, a, c }));
const quizData58 = `// ── QUIZ LOGIC (20 PYTAŃ Z WJ 28:1–43) ──\n    const QUIZ_DATA = ${JSON.stringify(quizJsItems, null, 6)};`;

html = html.replace(/\/\/ ── QUIZ LOGIC[\s\S]*?const QUIZ_DATA = \[[\s\S]*?\];/, quizData58);
html = html.replace(
  /Doskonale! Znasz na wskroś 27\. rozdział Księgi Wyjścia!/g,
  `Doskonale! Znasz na wskroś 28. rozdział Księgi Wyjścia!`
);

html = html.replace(/kc_day57_/g, `kc_day${DAY_NUM}_`);
html = html.replace(/DAY_KEY = 'kc_day57'/g, `DAY_KEY = 'kc_day${DAY_NUM}'`);
html = html.replace(/completeDay57/g, `completeDay${DAY_NUM}`);
html = html.replace(/Oznacz Dzień 57 jako ukończony/g, `Oznacz Dzień ${DAY_NUM} jako ukończony`);
html = html.replace(/Dzień 57 ukończony!/g, `Dzień ${DAY_NUM} ukończony!`);
html = html.replace(
  /new SpeechSynthesisUtterance\("[^"]+"\)/,
  `new SpeechSynthesisUtterance("${MEMORY_VERSE_QUOTE} Księga Wyjścia 28:29.")`
);

// Zapis 4 ścieżek Clean URLs w Akademii i Kursach dla Dnia 58
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
console.log('✅ Zapisano 4 ścieżki Clean URLs dla Dnia 58.');

// Zapis paczki przedpublikacyjnej w kolejka-publikacji/kurs-codzienny/2026-11-27/
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
          'Święte szaty Aarona „na cześć i na ozdobę”, efod z dwoma kamieniami onyksu, pektorał wyrokowania z dwunastoma klejnotami, Urim i Tummim oraz złota blaszka „Świętość PANU”.',
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
