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
const DAY_NUM = 55;
const DATE_STR = '2026-11-24';
const DATE_FORMATTED = '24 LISTOPADA 2026 R. (WTOREK)';
const DATE_SHORT_UPPER = '24 LISTOPADA 2026 • WTOREK';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 25:1–40';
const TITLE =
  'DOBROWOLNY DAR SERCA, ARKA PRZYMIERZA, STÓŁ I ZŁOTY ŚWIECZNIK';
const SUBTITLE =
  'Niebiański wzór Świątyni pośród ludu: dobrowolne dary serca, Arka Przymierza z przebłagalnią i cherubinami, stół na chleby pokładne oraz siedmioramienny złoty świecznik (Wj 25:1–40)';

const EXO25_PATH = path.join(REPO, 'data/bible/ubg-2025/EXO-025.json');
const exo25Data = JSON.parse(fs.readFileSync(EXO25_PATH, 'utf8'));
const verses = exo25Data.verses;

const v8 = verses.find((v) => v.number === 8)?.text || '';
const MEMORY_VERSE_QUOTE = v8.trim();
const MEMORY_VERSE = `„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 25:8 (UBG)`;

const THEME =
  'Dwudziesty piąty rozdział Księgi Wyjścia otwiera najdłuższą i najgłębszą część Księgi Wyjścia poświęconą Bożemu Przybytkowi — miejscu, w którym święty Bóg pragnie zamieszkać pośród swojego odkupionego ludu: „I zbudują mi świątynię, abym mieszkał pośród nich” (Wj 25:8). Zanim padnie pierwszy wymiar drewna czy złota, Bóg stawia warunek serca: przyjmuje wyłącznie dary przyniesione dobrowolnie, z ochotnego serca (Wj 25:2). Następnie w dokładnym porządku — od Miejsca Najświętszego na zewnątrz, czyli od Bożego tronu ku człowiekowi — PAN objawia Mojżeszowi trzy główne święte sprzęty wskazujące bezpośrednio na Jezusa Chrystusa: Arkę Przymierza z tablicami Świadectwa i złotą przebłagalnią pod skrzydłami cherubinów (gdzie Bóg spotyka się z człowiekiem i rozmawia z nim sponad krwi przebłagania, Wj 25:10–22), złoty stół z dwunastoma chlebami pokładnymi spoczywającymi nieustannie przed obliczem PANA (Wj 25:23–30) oraz siedmioramienny złoty świecznik wykuty z jednej bryły szczerego złota (Wj 25:31–40). Cały rozdział zamyka uroczyste wezwanie do wierności niebiańskiemu objawieniu: „Uważaj, abyś uczynił wszystko według wzoru tego, co ci ukazano na górze” (Wj 25:40; Hbr 8:5)!';

const IMG_FILENAME = 'kc_day_55_swiatynia_arka_swiecznik.jpg';
const IMG_REL_PATH = `images/academy/daily/${IMG_FILENAME}`;
const IMG_CAPTION =
  'Ilustracja biblijna: Wzór Przybytku ukazany na górze Synaj — Arka Przymierza z przebłagalnią i cherubinami w blasku Szekiny, stół na chleby pokładne i złoty siedmioramienny świecznik — Wj 25:8–40';
const QUEUE_DIR = path.join(REPO, `kolejka-publikacji/kurs-codzienny/${DATE_STR}`);

const imgFullPath = path.join(REPO, IMG_REL_PATH);
if (!fs.existsSync(imgFullPath)) {
  throw new Error(`Brak wygenerowanej grafiki Dnia 55: ${imgFullPath}`);
}

function buildVersesParagraphsHtml() {
  const sections = [
    {
      heading:
        'KSIĘGA WYJŚCIA 25:1–9 — Dobrowolny dar serca, materiały Przybytku i pragnienie Boga: „abym mieszkał pośród nich”',
      from: 1,
      to: 9,
      extraClass: 'mb-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 25:10–22 — Arka Przymierza z drewna akacjowego i złota, tablice Świadectwa, przebłagalnia i cherubini',
      from: 10,
      to: 22,
      extraClass: 'my-6 pt-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 25:23–30 — Złoty stół, naczynia ofiarne i nieustanne chleby pokładne przed obliczem PANA',
      from: 23,
      to: 30,
      extraClass: 'my-6 pt-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 25:31–40 — Siedmioramienny świecznik ze szczerego złota i nakaz wierności niebiańskiemu wzorowi',
      from: 31,
      to: 40,
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
            `<p><span class="verse-num">25:${v.number}</span> ${v.text}</p>`
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
const v1TtsText = `☀️ Z Biblią za Pan Brat — Dzień Pięćdziesiąty Piąty

**Czy wiesz, że Wszechmogący Bóg nie chce mieszkać daleko poza Twoją codziennością, lecz pragnie zbudować sobie mieszkanie dokładnie pośród spraw Twojego życia?**

Zatrzymaj się w ten wtorkowy poranek, dwudziestego czwartego listopada dwa tysiące dwudziestego szóstego roku. Pomyśl przez chwilę, zanim wejdziesz w wir dzisiejszych obowiązków i rozmów: czego najbardziej pragnie Stwórca wszechświata w relacji z Tobą? Czy surowego, chłodnego dystansu, czy bliskiej obecności w samym centrum Twojego domu i serca? W porannej ciszy zapytaj dziś swojego Niebieskiego Ojca: Panie, czy moje serce daje Ci dzisiaj z miłości i wdzięczności to, co najlepsze, abyś mógł naprawdę zamieszkać pośród nas?

W dwudziestym piątym rozdziale Księgi Wyjścia przenosimy się na szczyt góry Synaj, w sam środek obłoku Bożej chwały. Bóg przekazuje Mojżeszowi poruszający projekt Świętego Przybytku, lecz zaczyna od postawy ludzkiego serca: niech przyniosą mi dar tylko ci, którzy dają dobrowolnie ze swego serca. Pan nie szuka wymuszonej daniny, lecz miłości, która chętnie przynosi złoto, purpurę, drewno akacjowe i oliwę, aby mogła powstać świątynia. A zaraz potem padają najczulsze słowa całego rozdziału: I zbudują mi świątynię, abym mieszkał pośród nich! Zobacz też niezwykły porządek Bożego projektu: Bóg zaczyna od środka na zewnątrz, od najświętszego miejsca ku światu. Pierwsza powstaje Arka Przymierza z niezniszczalnego drewna akacjowego pokrytego szczerym złotem, kryjąca w sobie tablice Bożego Świadectwa. Na niej spoczywa złota przebłagalnia osłonięta skrzydłami dwóch cherubinów — to stamtąd Pan obiecuje spotykać się z człowiekiem i rozmawiać z nim. Dalej staje złoty stół z chlebami pokładnymi, leżącymi nieustannie przed obliczem Boga, oraz wykuty z jednej bryły szczerego złota siedmioramienny świecznik, którego siedem lamp rozprasza ciemność. Na koniec Pan ostrzega Mojżesza: uważaj, abyś uczynił wszystko według wzoru tego, co ci ukazano na górze.

Psychologia relacji i duchowego zaangażowania jasno potwierdza, że prawdziwe piękno i trwałość powstają tylko tam, gdzie człowiek daje siebie dobrowolnie i bez przymusu. Kiedy coś budujemy z przymusu, szybko pojawia się znużenie; kiedy dajemy z wdzięcznego serca, nasze mieszkanie staje się miejscem pokoju i światła.

A w świetle Ewangelii każdy z tych świętych sprzętów Przybytku jaśnieje pełnią osoby Jezusa Chrystusa! To On, odwieczne Słowo, stał się ciałem i rozbił swój namiot pośród nas, stając się prawdziwą Świątynią i Immanuelem, czyli Bogiem z nami! Jego nieskazitelne człowieczeństwo i chwała bóstwa łączą się jak drewno akacjowe i szczere złoto w Arce Przymierza. On jest naszą Przebłagalnią, na której Boża sprawiedliwość i miłosierdzie spotykają się we krwi krzyża. On jest Chlebem Życia nieustannie obecnym dla każdego głodnego serca, i On jest Światłością Świata, która przez siedmiorakiego Ducha Świętego rozświetla naszą drogę!

Jezus mówi dziś do Ciebie:
„Ja jestem chlebem życia; kto do mnie przychodzi, nigdy nie będzie łaknął, a kto wierzy we mnie, nigdy nie będzie pragnął.” (Ewangelia według świętego Jana, rozdział szósty, werset trzydziesty piąty, UBG)

Zadanie Taktyczne:
Przynieś dziś Bogu dobrowolny dar swojego serca: oddaj Mu swój czas, dobre słowo wypowiedziane w domu lub cichy uczynek miłości, bez narzekania i bez przymusu. Zadbaj też o światło i pokarm swojej duszy — nakarm się Słowem Bożym przy stole Pisma Świętego i stań przed Chrystusem jako przed swoim jedynym Pośrednikiem w niebiańskiej świątyni.

W Christian Culture aplikacje i portale są dla Ciebie zawsze bezpłatne.

Modlitwa Bojowa:
Ojcze w niebie, dziękuję Ci za poruszającą miłość, która kazała Ci powiedzieć pod Synajem: abym mieszkał pośród nich. Przepraszam Cię za chwile, gdy dawałem Ci tylko resztki mojego czasu i uwagi albo służyłem Ci z obowiązku zamiast z wdzięcznego serca. Panie Jezu Chryste, Ty jesteś prawdziwą Świątynią, naszą Przebłagalnią, Chlebem Życia i Światłością tego świata. Zamieszkaj dziś w pełni w moim sercu, w moim domu i w mojej pracy, rozświetlaj ciemności i kształtuj całe moje życie według niebiańskiego wzoru Twojego Słowa. Tobie chwała na wieki. Amen.

Rozkaz Dnia (Zadbaj o wzrost):
Zbuduj dziś swoje życie według wiernego wzoru Pisma Świętego przez sześćdziesiąt sześć miesięcy codziennej formacji biblijnej w akademii. Czytaj codziennie jeden rozdział, dziel się światłem Ewangelii z bliskimi i wzrastaj we wspólnocie wiary.

Błogosławieństwo:
Niech obecność żywego Boga mieszka pośród Twojego domu jak w świętym Przybytku, niech Chleb Życia krzepi Twoje siły, a światło siedmioramiennego świecznika Ducha Świętego rozjaśnia każdy Twój krok tego wtorku. Dobrego dnia! Podaj dalej.`;

if (/[0-9]/.test(v1TtsText)) {
  throw new Error('BŁĄD STANDARD_PRODUKCYJNY: Wersja 1 TTS zawiera cyfry arabskie!');
}

const v2WebText = `☀️ Z Biblią za Pan Brat — Dzień 55 (24 listopada 2026 r.)
📖 Księga Wyjścia 25:1–40: Dobrowolny Dar Serca, Arka Przymierza, Stół i Złoty Świecznik

Czy wiesz, dlaczego Bóg nie zaczął projektu Przybytku od murów zewnętrznych, lecz od samego serca Świętego Miejsca — i w jaki sposób Arka, stół chlebów pokładnych oraz Menora zapowiadają osobę Jezusa Chrystusa?

W 55. dniu codziennej formacji biblijnej (https://polskieradio.cc/akademia#kurscodzienny) otwieramy 25. rozdział Księgi Wyjścia (Wj 25:1–40: https://polskieradio.cc/mojabiblia?book=EXO&chapter=25). Wchodzimy wraz z Mojżeszem w niebiańskie objawienie na górze Synaj, gdzie Bóg wyznaje pragnienie swojego serca: „I zbudują mi świątynię, abym mieszkał pośród nich” (Wj 25:8).

Trzy chrystologiczne skarby dzisiejszego studium:
1. Dobrowolny dar serca i Boże zamieszkanie (Wj 25:1–9): PAN przyjmuje dary wyłącznie od każdego człowieka, który daje dobrowolnie ze swego serca (w. 2). Celem tych ofiar nie jest ludzka ambicja, lecz zbudowanie Przybytku (Miszkan) według dokładnego wzoru ukazanego na górze (w. 8–9).
2. Arka Przymierza i złota przebłagalnia (Wj 25:10–22): Skrzynia z trwałego drewna akacjowego pokryta szczerym złotem kryje tablice Świadectwa (w. 16), a nad nią spoczywa złota przebłagalnia (Kapporet) pod skrzydłami dwóch cherubinów — dokładne miejsce, gdzie Bóg spotyka się z człowiekiem i przemawia do niego (w. 22; por. Rz 3:25).
3. Stół chlebów pokładnych i złoty świecznik (Wj 25:23–40): Na złotym stole nieustannie spoczywają chleby pokładne przed obliczem PANA (w. 30), a wykuty z jednej bryły szczerego złota siedmioramienny świecznik (Menora) z siedmioma lampami oświetla Święte Miejsce, prowadząc nas wprost do Jezusa — Chleba Życia i Światłości Świata (w. 31–40; J 6:35; 8:12)!

Jezus mówi dziś do Ciebie:
„Ja jestem chlebem życia; kto do mnie przychodzi, nigdy nie będzie łaknął, a kto wierzy we mnie, nigdy nie będzie pragnął.” (J 6:35, UBG)

Zadanie Taktyczne:
• Czytaj: Wj 25:1–40 oraz Hbr 8:1–5 i Hbr 9:1–12.
• Wierz: Jezus Chrystus jest Twoją Przebłagalnią, Chlebem Życia i Światłością w niebiańskiej świątyni Ojca.
• Działaj: Złóż dziś Bogu dobrowolny dar serca — czas na szczerą modlitwę, pomoc bliskiej osobie i wierność Jego Słowu.

Studiuj pełny tekst UBG, 8 kodów Stronga, 45-punktową egzegezę i quiz z 20 pytaniami:
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-55

Dołącz do wspólnoty wzrostu:
💬 https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0
Wspieraj misję Słowa: https://polskieradio.cc/wspieramto`;

const v3SmsText = `Dzień 55 (Wj 25:8): „I zbudują mi świątynię, abym mieszkał pośród nich”. Oddaj dziś Bogu dobrowolne serce i przyjmij Jezusa — Twoją Przebłagalnię, Chleb i Światło! polskieradio.cc`;

const v4VideoText = `[OPRAWA GRAFICZNA & MUZYCZNA]
Nowoczesne, eleganckie studio Christian Culture TV w głębokiej czerni (#000000) oraz szlachetnym złocie Champagne Gold (#C4A35A / #D4AF37). Na wielkoformatowym ekranie za prowadzącymi monumentalna scena biblijna: wnętrze Świętego Przybytku w błękicie, purpurze, karmazynie i bisiorze, złota Arka Przymierza z przebłagalnią i dwoma cherubinami w blasku Szekiny, stół z chlebami pokładnymi oraz płonący siedmioramienny złoty świecznik. Tytuł na ekranie: „Z BIBLIĄ ZA PAN BRAT — DZIEŃ 55: DOBROWOLNY DAR SERCA, ARKA PRZYMIERZA, STÓŁ I ZŁOTY ŚWIECZNIK (WJ 25:1–40)”.

[INTRO: PRAGNIENIE SERCA BOGA]
Noemi: Dzień dobry we wtorkowy poranek! Witamy bardzo serdecznie w pięćdziesiątym piątym dniu naszego kursu „Z Biblią za Pan Brat”! Wczoraj w dwudziestym czwartym rozdziale Księgi Wyjścia Mojżesz wstąpił w środek obłoku chwały PANA na górze Synaj na czterdzieści dni i czterdzieści nocy, a dziś w dwudziestym piątym rozdziale słyszymy pierwsze słowa, jakie Bóg przekazał mu w tym obłoku!
Sara: Witaj Noemi, witamy wszystkich widzów Christian Culture TV! I jakie to są niezwykłe słowa! Bóg nie zaczyna od żądań bezdusznej budowli, lecz mówi w drugim wersecie: „Powiedz synom Izraela, aby przynieśli mi dar. Od każdego człowieka, który daje dobrowolnie ze swego serca, zbierzcie dar dla mnie”! A w ósmym wersecie odkrywa przed nami cały cel tego projektu: „I zbudują mi świątynię, abym mieszkał pośród nich”!

[ANALIZA PROBLEMOWA: ARKA, STÓŁ I ZŁOTY ŚWIECZNIK]
Noemi: Zobaczmy, jak genialny jest Boży kierunek projektowania! Kiedy człowiek buduje dom, zaczyna od ścian i dachu, a na końcu wnosi meble. Bóg zaczyna od środka na zewnątrz — od swojego tronu i miejsca spotkania z człowiekiem! Pierwszym sprzętem jest Arka Przymierza z niezniszczalnego drewna akacjowego pokrytego wewnątrz i zewnątrz szczerym złotem, z tablicami Świadectwa w środku i złotą przebłagalnią pod skrzydłami dwóch cherubinów.
Sara: I w dwudziestym drugim wersecie pada obietnica łaski: „Tam będę się z tobą spotykać i sponad przebłagalni, spomiędzy dwóch cherubinów... będę z tobą rozmawiać”! Zaraz potem Bóg opisuje złoty stół, na którym nieustannie mają leżeć chleby pokładne przed Jego obliczem, oraz siedmioramienny złoty świecznik — Menorę — wykuty z jednej bryły szczerego złota, przyozdobiony kielichami na kształt kwiatów migdałowca i niosący siedem płonących lamp!

[SŁOWO ROZKAZU: JEZUS W CENTRUM I NIEBIAŃSKI WZÓR]
Noemi: Każdy z tych świętych znaków prowadzi nasze oczy wprost do Pana Jezusa Chrystusa! Ewangelia Jana mówi, że Słowo stało się ciałem i rozbiło swój przybytek pośród nas! Jezus jest prawdziwą Arką — w Nim łączą się doskonałe człowieczeństwo i pełnia bóstwa, a w swoim sercu niósł On Boże Prawo. W Liście do Rzymian czytamy, że Bóg wystawił Chrystusa jako Przebłagalnię w Jego krwi!
Sara: Dokładnie tak! A złoty stół wskazuje na Jezusa — Chleb Życia, który codziennie karmi nasze dusze swoim Słowem, zaś złoty świecznik objawia Chrystusa — Światłość Świata i siedmiorakiego Ducha Bożego oświetlającego Kościół! A wszystko to podsumowuje czterdziesty werset: „Uważaj, abyś uczynił wszystko według wzoru tego, co ci ukazano na górze” — bo ziemski przybytek był cieniem prawdziwej świątyni w niebie, w której Jezus jest dziś naszym Arcykapłanem!

[ZADANIE TAKTYCZNE: CZYTAJ, WIERZ, DZIAŁAJ]
Noemi: Jak zastosować dwudziesty piąty rozdział Księgi Wyjścia w ten wtorek?
• Czytaj: dwudziesty piąty rozdział Księgi Wyjścia oraz ósmy i dziewiąty rozdział Listu do Hebrajczyków.
• Wierz: Jezus Chrystus jest Twoją Przebłagalnią, Chlebem Życia i Światłem w samej obecności Ojca.
• Działaj: Przynieś Bogu dziś dobrowolny dar swojego serca — chwilę wdzięczności, bezinteresowną pomoc i wierność Jego biblijnemu wzorowi!

[MANIFEST: MODLITWA BOJOWA]
Sara: Pomódlmy się razem! Ojcze Niebieski, dziękujemy Ci za Twoje wielkie pragnienie, by mieszkać pośród swojego ludu, i za każdy szczegół Przybytku wskazujący na naszego Zbawiciela Jezusa Chrystusa.
Noemi: Panie Jezu, Ty jesteś naszą jedyną Przebłagalnią, Chlebem Życia i Światłością Świata. Oczyść nasze serca, byśmy służyli Ci dobrowolnie i z radością, i buduj nasze domy ściśle według wzoru Twojego Słowa. W imieniu Jezusa. Amen!

[OUTRO: BŁOGOSŁAWIEŃSTWO I WZROST]
Sara: Niech pokój Przebłagalni, sytość Chleba Życia i światło Ducha Świętego wypełniają cały Twój dzień!
Noemi: Czytaj, wierz, działaj. Dla Jezusa! Do zobaczenia jutro w dwudziestym szóstym rozdziale Księgi Wyjścia!`;

const v5ArticleText = `🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: PRZYBYTEK BOGA POŚRÓD LUDU — CHRYSTOLOGICZNA ARCHITEKTURA ARKI, STOŁU I MENORY (WJ 25:1–40)
Autor: Cezary Rogowski, red. nacz. CCN News | Data publikacji: 24 listopada 2026 r.

Dwudziesty piąty rozdział Księgi Wyjścia (Wj 25:1–40) otwiera wielką teologiczną sekcję poświęconą budowie Przybytku (Wj 25–31 oraz 35–40). W tym jednym fragmencie Stary Testament odsłania fundamentalną prawdę Ewangelii: Bóg nie stworzył człowieka po to, aby trzymać go na dystans, lecz pragnie zamieszkać pośród swojego odkupionego ludu na podstawie pojednania i prawdy.

1. Dobrowolny dar serca i tajemnica słowa „Miszkan” (Wj 25:1–9)
> „I zbudują mi świątynię, abym mieszkał pośród nich.” — Księga Wyjścia 25:8 (UBG)

Budowa Bożej świątyni rozpoczyna się od wezwania do ofiarności pozbawionej przymusu: „Od każdego człowieka, który daje dobrowolnie ze swego serca, zbierzcie dar dla mnie” (Wj 25:2, UBG; hebr. *teruma*, תְּרוּמָה, Strong H8641). Obok złota, srebra, miedzi, tkanin i oliwy Bóg wymienia zarówno „świątynię” (*mikdasz*, מִקְדָּשׁ, Strong H4720), jak i „przybytek” (*miszkan*, מִשְׁכָּן, Strong H4908 — dosłownie „mieszkanie, namiot zamieszkania”). Grecka Septuaginta używa tu czasownika *skenoo* („rozbić namiot”), którym Apostoł Jan opisuje wcielenie Syna Bożego: „A Słowo stało się ciałem i zamieszkało [*eskenosen*] wśród nas” (J 1:14).

2. Arka Przymierza i złota Przebłagalnia (Wj 25:10–22)
Projekt Przybytku zaczyna się nie od ogrodzenia dziedzińca, lecz od samego serca Miejsca Najświętszego — od Arki Przymierza (*aron*, אָרוֹן, Strong H727). Wykonana z trwałego drewna akacjowego (*szittim*) i pokryta wewnątrz i zewnątrz szczerym złotem, kryła w sobie tablice Świadectwa (Wj 25:16). Na niej spoczywała złota przebłagalnia (*kapporet*, כַּפֹּרֶת, Strong H3727) osłonięta skrzydłami dwóch złotych cherubinów (*keruwim*, Strong H3742). W tym punkcie Bóg daje obietnicę: „Tam będę się z tobą spotykać i sponad przebłagalni... będę z tobą rozmawiać” (Wj 25:22). W Nowym Testamencie Apostoł Paweł nazywa Jezusa Chrystusa tym samym greckim słowem (*hilasterion*): „Którego Bóg ustanowił przebłagalnią przez wiarę w jego krew” (Rz 3:25, UBG).

3. Złoty stół z chlebami pokładnymi (Wj 25:23–30)
W Miejscu Świętym naprzeciw świecznika stawał stół z drewna akacjowego obity złotem, na którym nieustannie spoczywały chleby pokładne — dosłownie „chleb oblicza” (*lechem panim*, Wj 25:30). Wskazywały one na nieprzerwaną społeczność dwunastu pokoleń Izraela przed obliczem Boga oraz na Chrystusa, który ogłosił: „Ja jestem chlebem życia” (J 6:35).

4. Siedmioramienny złoty świecznik i wierność niebiańskiemu wzorowi (Wj 25:31–40)
Naprzeciw stołu płonął wykuty z jednej bryły talentu szczerego złota siedmioramienny świecznik (*menora*, מְנוֹרָה, Strong H4501) zdobiony kielichami migdałowca — pierwszego drzewa kwitnącego wiosną, znaku zmartwychwstania i życia (por. Lb 17:8). Siedem lamp oświetlało wnętrze Świętego Miejsca, zapowiadając Chrystusa — Światłość Świata (J 8:12) oraz pełnię Ducha Świętego pośród zborów (Obj 1:12–20; 4:5). Całość wieńczy kluczowa reguła hermeneutyki biblijnej: „Uważaj, abyś uczynił wszystko według wzoru (*tawnit*, Strong H8403) tego, co ci ukazano na górze” (Wj 25:40), zacytowana w Liście do Hebrajczyków 8:5 dla wskazania na prawdziwą niebiańską świątynię, w której arcykapłańską służbę pełni sam Jezus Chrystus.

📌 PODSUMOWANIE REDAKCYJNE CCN:
Księga Wyjścia 25 uczy nas, że Bóg zamieszkuje pośród swojego ludu nie dzięki ludzkiej sile czy przymusowi, lecz przez dobrowolnie oddane serce, ofiarę Chrystusa na Przebłagalni, karmienie się Chlebem Życia oraz wierność niebiańskiemu wzorowi Pisma Świętego.

🌐 Źródła i serwisy pokrewne: polskieradio.cc | polskieradio.cc/akademia | mojabiblia.cc`;

const pakiet5wersji = `# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI
## Dzień 55 (24 listopada 2026): Dobrowolny Dar Serca, Arka Przymierza, Stół i Złoty Świecznik (Wj 25:1–40)

====================================================================
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

${v5ArticleText}
`;

// ── 2. PEŁNA LEKCJA (12 OBOWIĄZKOWYCH SEKCJI, 45 PUNKTÓW EGZEGETYCZNYCH, 20 PYTAŃ QUIZU) ──
const quizItems = [
  {
    q: 'Od jakiego rodzaju ludzi Bóg polecił Mojżeszowi zebrać dar na budowę Przybytku według Wj 25:2?',
    a: [
      'Od każdego człowieka, który daje dobrowolnie ze swego serca',
      'Wyłącznie od najbogatszych kupców wracających z Egiptu',
      'Przez przymusowy podatek nałożony na pierworodnych synów',
      'Wyłącznie od lewitów i starszych powyżej pięćdziesiątego roku życia',
    ],
    c: 0,
    exp: 'Wj 25:2 (UBG): „Powiedz synom Izraela, aby przynieśli mi dar. Od każdego człowieka, który daje dobrowolnie ze swego serca, zbierzcie dar dla mnie.”',
  },
  {
    q: 'Jakie trzy rodzaje metali zostały wymienione wśród darów na świątynię w Wj 25:3?',
    a: [
      'Żelazo, cyna i ołów',
      'Złoto, srebro i miedź',
      'Platyna, brąz i mosiądz',
      'Złoto, żelazo i kamień szlachetny',
    ],
    c: 1,
    exp: 'Wj 25:3 (UBG): „A to są dary, które zbierzecie od nich: złoto, srebro i miedź;”.',
  },
  {
    q: 'Jakie cztery rodzaje tkanin i przędz wymieniono w Wj 25:4 wraz z sierścią kozią?',
    a: [
      'Zieleń, żółć, wełnę owczą i len',
      'Czerń, biel, jedwab i płótno z Egiptu',
      'Błękitną tkaninę, purpurę, karmazyn i bisior',
      'Tkaninę z wielbłądziej sierści, szkarłat i korę cedrową',
    ],
    c: 2,
    exp: 'Wj 25:4 (UBG): „Błękitna tkanina, purpura, karmazyn, bisior i sierść kozia;”.',
  },
  {
    q: 'Z jakiego gatunku drewna miały zostać wykonane Arka Przymierza, jej drążki oraz stół na chleby pokładne według Wj 25:5, 10, 23?',
    a: [
      'Z drzewa oliwnego z góry Oliwnej',
      'Z cedru libańskiego',
      'Z cyprysu egipskiego',
      'Z drewna akacjowego',
    ],
    c: 3,
    exp: 'Wj 25:5, 10, 23 (UBG) wielokrotnie wskazuje na trwałe, odporne na gnicie drewno akacjowe (szittim) jako bazę pokrywaną szczerym złotem.',
  },
  {
    q: 'Do czego miały służyć kamienie onyksowe oraz inne drogie kamienie wymienione w Wj 25:7?',
    a: [
      'Do osadzenia efodu i pektorału',
      'Do wyłożenia podłogi przed ołtarzem całopalenia',
      'Do ozdobienia korony Mojżesza i Jozuego',
      'Do wykucia dwóch tablic Przymierza',
    ],
    c: 0,
    exp: 'Wj 25:7 (UBG): „Kamienie onyksowe i kamienie do osadzenia efodu i pektorału.”',
  },
  {
    q: 'Jaki główny cel zbudowania świątyni ogłosił Bóg w Wj 25:8?',
    a: [
      '„Aby sąsiednie narody bały się potęgi Izraela”',
      '„I zbudują mi świątynię, abym mieszkał pośród nich”',
      '„Aby Mojżesz miał gdzie przechowywać skarby z Egiptu”',
      '„Aby kapłani nie musieli już wyruszać w dalszą drogę”',
    ],
    c: 1,
    exp: 'Wj 25:8 (UBG): „I zbudują mi świątynię, abym mieszkał pośród nich.” — to fundament teologii zamieszkania Boga z człowiekiem (Immanuel).',
  },
  {
    q: 'Według czego Izraelici mieli wykonać przybytek i wszystkie jego naczynia zgodnie z Wj 25:9?',
    a: [
      'Według najlepszego pomysłu mistrzów rzemieślniczych',
      'Według wzoru świątyń widzianych w Egipcie',
      'Według wszystkiego, co PAN ukaże Mojżeszowi — według wzoru przybytku i wszystkich jego naczyń',
      'Według rady siedemdziesięciu starszych Izraela',
    ],
    c: 2,
    exp: 'Wj 25:9 (UBG): „Według wszystkiego, co ci ukażę, według wzoru przybytku i wzoru wszystkich jego naczyń, tak uczynicie.”',
  },
  {
    q: 'Jakie były dokładne wymiary Arki Przymierza według Wj 25:10?',
    a: [
      'Długość na pięć łokci, szerokość na trzy łokcie, wysokość na dwa łokcie',
      'Długość na dwa łokcie, szerokość na jeden łokieć, wysokość na jeden łokieć',
      'Długość na trzy łokcie, szerokość na dwa łokcie, wysokość na półtora łokcia',
      'Długość na dwa i pół łokcia, szerokość na półtora łokcia, wysokość na półtora łokcia',
    ],
    c: 3,
    exp: 'Wj 25:10 (UBG): „Uczynią też arkę z drewna akacjowego. Jej długość będzie na dwa i pół łokcia, jej szerokość – na półtora łokcia, a jej wysokość – na półtora łokcia.”',
  },
  {
    q: 'Jak należało pokryć Arkę Przymierza złotem według Wj 25:11?',
    a: [
      'Szczerym złotem wewnątrz i na zewnątrz, ze złotą listwą dokoła',
      'Wyłącznie z wierzchu, pozostawiając wnętrze z surowego drewna',
      'Cienką warstwą srebra w środku i miedzią na zewnątrz',
      'Tylko jej cztery narożniki i podstawę',
    ],
    c: 0,
    exp: 'Wj 25:11 (UBG): „I pokryjesz ją szczerym złotem, wewnątrz i na zewnątrz pokryjesz ją, a na niej dokoła uczynisz złotą listwę.”',
  },
  {
    q: 'Jaki szczegółowy przepis dotyczył drążków do noszenia Arki według Wj 25:14–15?',
    a: [
      'Po rozbiciu obozu należało je wyjmować i chować w skrzyni lewitów',
      'Drążki miały pozostać w pierścieniach arki i nie miały być z niej wyjmowane',
      'Należało je spalić po dotarciu do Kanaanu',
      'Były wykonane z samego żelaza i zawieszane na suficie',
    ],
    c: 1,
    exp: 'Wj 25:15 (UBG): „Drążki te pozostaną w pierścieniach arki; nie będą z niej wyjmowane.” — znak gotowości do podążania za Bogiem i ochrony świętości przed dotykaniem.',
  },
  {
    q: 'Co Mojżesz miał włożyć do wnętrza Arki Przymierza według Wj 25:16 i 25:21?',
    a: [
      'Złotą koronę królewską dla przyszłych władców',
      'Pieczęć siedemdziesięciu starszych i laskę Aarona',
      'Świadectwo (kamienne tablice Prawa), które Bóg mu da',
      'Srebrne kielichy z uczty na Synaju',
    ],
    c: 2,
    exp: 'Wj 25:16 (UBG): „W arkę włożysz świadectwo, które ci dam.” (Wj 25:21 powtarza to samo po umieszczeniu przebłagalni).',
  },
  {
    q: 'Z jakiego materiału miała zostać wykonana przebłagalnia i dwa cherubiny na jej końcach według Wj 25:17–19?',
    a: [
      'Z drewna akacjowego pokrytego srebrem',
      'Z polerowanego brązu i błękitnego kamienia',
      'Z białego marmuru z góry Horeb',
      'Ze szczerego złota, a cherubiny wykute z samej przebłagalni na obu jej końcach',
    ],
    c: 3,
    exp: 'Wj 25:17–19 (UBG) podkreśla jedność przebłagalni i cherubinów wykutych ze szczerego złota.',
  },
  {
    q: 'Jak były zwrócone skrzydła i twarze dwóch cherubinów nad przebłagalnią według Wj 25:20?',
    a: [
      'Skrzydła rozpostarte ku górze zakrywające przebłagalnię, a twarze zwrócone ku sobie i ku przebłagalni',
      'Skrzydła opuszczone w dół, a twarze zwrócone na zewnątrz w stronę wejścia',
      'Tylko jeden cherubin miał rozpostarte skrzydła, a drugi patrzył w niebo',
      'Cherubini stali za Arką i patrzyli w stronę świecznika',
    ],
    c: 0,
    exp: 'Wj 25:20 (UBG): „A cherubiny będą mieć skrzydła rozpostarte ku górze, zakrywając swymi skrzydłami przebłagalnię. Ich twarze zaś będą zwrócone ku sobie, twarze cherubinów będą zwrócone ku przebłagalni.”',
  },
  {
    q: 'Co Bóg obiecał czynić w miejscu nad przebłagalnią między dwoma cherubinami według Wj 25:22?',
    a: [
      'Przechowywać jedynie roczne spisy ludności Izraela',
      'Spotykać się z Mojżeszem i rozmawiać o wszystkim, co rozkaże dla synów Izraela',
      'Zsyłać raz w roku deszcz na pustynię Synaj',
      'Otwierać tajemne przejście do jaskini Horeb',
    ],
    c: 1,
    exp: 'Wj 25:22 (UBG): „Tam będę się z tobą spotykać i sponad przebłagalni, spomiędzy dwóch cherubinów, którzy są nad arką świadectwa, będę z tobą rozmawiać o wszystkim, co ci rozkażę dla synów Izraela.”',
  },
  {
    q: 'Jakie wymiary miał mieć złoty stół z drewna akacjowego według Wj 25:23?',
    a: [
      'Długość na cztery łokcie, szerokość na dwa łokcie, wysokość na dwa łokcie',
      'Długość na półtora łokcia, szerokość na pół łokcia, wysokość na jeden łokieć',
      'Długość na dwa łokcie, szerokość na jeden łokieć, wysokość na półtora łokcia',
      'Długość na trzy łokcie, szerokość na półtora łokcia, wysokość na jeden łokieć',
    ],
    c: 2,
    exp: 'Wj 25:23 (UBG): „Uczynisz też stół z drewna akacjowego. Jego długość będzie na dwa łokcie, jego szerokość – na jeden łokieć, a jego wysokość – na półtora łokcia.”',
  },
  {
    q: 'Co miało nieustannie spoczywać na złotym stole przed obliczem PANA według Wj 25:30?',
    a: [
      'Siedem złotych świeczników',
      'Zwoje Księgi Przymierza',
      'Naczynia z manną i wodą ze skały',
      'Chleby pokładne',
    ],
    c: 3,
    exp: 'Wj 25:30 (UBG): „I na ten stół nieustannie będziesz kłaść przede mną chleby pokładne.”',
  },
  {
    q: 'W jaki sposób miał zostać wykonany złoty świecznik (podstawa, ramiona, kielichy, gałki i kwiaty) według Wj 25:31 i 36?',
    a: [
      'Wykuty w całości z tej samej bryły szczerego złota',
      'Złożony z siedmiu oddzielnych miedzianych prętów przykręconych śrubami',
      'Wyrzeźbiony z drewna oliwnego i pomalowany na żółto',
      'Odlany z połączenia srebra, miedzi i brązu',
    ],
    c: 0,
    exp: 'Wj 25:31, 36 (UBG): cały świecznik miał być wykuty z jednej bryły (jednego talentu) szczerego złota — obraz jedności Chrystusa i Kościoła.',
  },
  {
    q: 'Ile ramion wychodziło z boków trzonu świecznika i na kształt jakiego drzewa były uformowane kielichy według Wj 25:32–33?',
    a: [
      'Cztery ramiona z kielichami na kształt granatu',
      'Sześć ramion (po trzy z każdego boku) z kielichami na kształt migdału, wraz z gałkami i kwiatami',
      'Dwanaście ramion z kielichami na kształt palmy daktylowej',
      'Osiem ramion z kielichami na kształt cedru',
    ],
    c: 1,
    exp: 'Wj 25:32–33 (UBG): trzy ramiona z jednego boku i trzy z drugiego (plus środkowy trzon = 7 lamp), zdobione kielichami na kształt migdału.',
  },
  {
    q: 'Z jakiej ilości złota należało wykonać świecznik wraz ze wszystkimi jego naczyniami (szczypcami i naczyniami na popiół) według Wj 25:39?',
    a: [
      'Z dziesięciu syklów srebra i jednego sykla złota',
      'Ze stu funtów mieszanki złota i miedzi',
      'Z jednego talentu szczerego złota',
      'Z dwunastu brył złota przyniesionych przez przywódców pokoleń',
    ],
    c: 2,
    exp: 'Wj 25:39 (UBG): „Uczynisz go i wszystkie naczynia z talentu szczerego złota.”',
  },
  {
    q: 'Jakim uroczystym wezwaniem Bóg zamyka cały 25. rozdział Księgi Wyjścia w wersecie 40?',
    a: [
      '„Zbuduj świątynię według upodobania starszych w obozie”',
      '„Przekaż tę księgę kapłanom, aby sami wybrali wymiary”',
      '„Odłóż te plany aż do wejścia do miasta Jerozolimy”',
      '„Uważaj, abyś uczynił wszystko według wzoru tego, co ci ukazano na górze”',
    ],
    c: 3,
    exp: 'Wj 25:40 (UBG): „Uważaj, abyś uczynił wszystko według wzoru tego, co ci ukazano na górze.” (zacytowane w Hbr 8:5).',
  },
];

const lessonDocxText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA WYJŚCIA • MIESIĄC 2 • DZIEŃ 55
${TITLE}
${SUBTITLE}
${DATE_FORMATTED}  |  Czytanie: ${READING}
TEKST PAMIĘCIOWY: ${MEMORY_VERSE}
MYŚL PRZEWODNIA: ${THEME}

ZANIM OTWORZYSZ BIBLIĘ
Po uroczystym zawarciu Przymierza u stóp Synaju i wejściu Mojżesza w środek obłoku Bożej chwały (Wj 24), otwiera się przed nami w dwudziestym piątym rozdziale Księgi Wyjścia prawdziwy klejnot biblijnej teologii: Boży projekt Przybytku — świętego namiotu spotkania między Bogiem a człowiekiem.
Wielu czytelników Biblii przeskakuje rozdziały o wymiarach Arki, stołu czy świecznika, sądząc, że są to jedynie suche instrukcje budowlane. Tymczasem Pismo Święte poświęca opisowi stworzenia całego wszechświata zaledwie dwa rozdziały (Rdz 1–2), natomiast na opis Bożego Przybytku i służby w nim przeznacza kilkadziesiąt rozdziałów Biblii! Dlaczego? Ponieważ każdy wymiar, każdy materiał i każdy sprzęt Przybytku to trójwymiarowa Ewangelia — żywy obraz osoby i zbawczego dzieła Jezusa Chrystusa oraz naszego przystępu do Ojca w niebiańskiej świątyni!
Zanim przejdziesz do komentarza, otwórz swoją Biblię i przeczytaj spokojnie cały 25. rozdział Księgi Wyjścia w przekładzie Uwspółcześnionej Biblii Gdańskiej. Zwróć uwagę na słowa z wersetu 8 („I zbudują mi świątynię, abym mieszkał pośród nich”) oraz z wersetu 40 („Uważaj, abyś uczynił wszystko według wzoru tego, co ci ukazano na górze”).

TEKST PISMA ŚWIĘTEGO (UWSPÓŁCZEŚNIONA BIBLIA GDAŃSKA — WJ 25:1–40)
${buildVersesDocxText()}

KLUCZE JĘZYKOWE & KODY STRONGA (WJ 25:1–40)
• H8641 תְּרוּמָה (Teruma) — dar, danina, ofiara podniesienia składana dobrowolnie z ochotnego serca dla PANA (Wj 25:2).
• H4720 מִקְדָּשׁ (Mikdasz) — świątynia, święte sanktuarium oddzielone dla obecności Najwyższego (Wj 25:8).
• H4908 מִשְׁכָּן (Miszkan) — przybytek, mieszkanie Boga pośród ludu; od czasownika szakan („mieszkać / rozbić namiot”) (Wj 25:9).
• H8403 תַּבְנִית (Tawnit) — wzór, projekt, model architektoniczny ukazany Mojżeszowi na górze Synaj (Wj 25:9, 40).
• H727 אָרוֹן (Aron) — arka, święta skrzynia Przymierza przechowująca kamienne tablice Bożego Świadectwa (Wj 25:10).
• H3727 כַּפֹּרֶת (Kapporet) — przebłagalnia, złote wieko Arki (od kapar — „przykryć grzech, dokonać przebłagania”); w NT gr. hilasterion (Wj 25:17–22; Rz 3:25).
• H3742 כְּרוּבִים (Keruwim) — cherubini, złote istoty anielskie strzegące świętości Bożego tronu nad przebłagalnią (Wj 25:18–22).
• H4501 מְנוֹרָה (Menora) — siedmioramienny świecznik wykuty z jednego talentu szczerego złota z kielichami migdałowca (Wj 25:31–39).

ANALIZA EGZEGETYCZNA I TEOLOGICZNA (5 CZĘŚCI, 45 PUNKTÓW)

CZĘŚĆ I — DOBROWOLNY DAR SERCA I PRAGNIENIE BOGA: „ABYM MIESZKAŁ POŚRÓD NICH” (WJ 25:1–9)
1. Bóg sam inicjuje spotkanie ze swoim ludem (25:1–2)
Wszystko w zbawieniu zaczyna się od inicjatywy PANA: to nie ludzie wymyślili świątynię, by ułagodzić Boga, lecz sam Bóg przemawia do Mojżesza i otwiera drogę bliskości.
2. Dobrowolność serca jako pierwszy warunek ofiary (25:2)
„Od każdego człowieka, który daje dobrowolnie ze swego serca, zbierzcie dar dla mnie” — Bóg nigdy nie żebrze i nie wymusza daniny; przyjmuje to, co płynie z wdzięcznej miłości (por. 2 Kor 9:7).
3. Pełna skala darów: od złota po sierść kozią (25:3–7)
W spisie darów znajdują się zarówno kosztowności królewskie (złoto, srebro, onyksy), jak i zwykłe dary dostępne każdemu pasterzowi (sierść kozia, drewno, oliwa) — w służbie Bogu potrzebny jest każdy człowiek.
4. Trzy metale symbolizujące chwałę, odkupienie i sąd (25:3)
Złoto symbolizuje chwałę i bóstwo, srebro w Biblii wiąże się z okupem odkupienia (por. Wj 30:11–16), a miedź z ołtarzem ofiarnym i sądem nad grzechem.
5. Cztery barwy tkanin wskazujące na Chrystusa (25:4)
Błękit (niebo), purpura (królewskość), karmazyn (ofiara krwi) i biały bisior (bezgrzeszna sprawiedliwość) — w tych czterech kolorach Przybytku cztery Ewangelie ukażą nam Jezusa!
6. Oliwa, wonności i kamienie kapłańskie (25:6–7)
Oliwa podtrzymuje nieustanne światło Ducha Świętego, kadzidło przedstawia modlitwy świętych, a dwanaście kamieni na efodzie i pektorale nosi na sercu arcykapłana wszystkie pokolenia ludu Bożego.
7. „I zbudują mi świątynię, abym mieszkał pośród nich” (25:8)
To jeden z najważniejszych wersetów w całej Biblii: Bóg, którego nie mogą ogarnąć niebiosa niebios (1 Krl 8:27), pragnie zamieszkać w samym środku obozu swoich dzieci!
8. Od raju utraconego do Przybytku na pustyni (25:8)
Od czasu wygnania z Edenu Bóg nie mieszkał tak blisko ludzi. Przybytek jest zapowiedzią wcielenia Syna Bożego (J 1:14) oraz nowego stworzenia: „Oto przybytek Boga z ludźmi” (Obj 21:3).
9. Zasada wierności Bożemu wzorowi (tawnit) (25:9)
„Według wszystkiego, co ci ukażę... tak uczynicie” — w kulcie i budowaniu Kościoła nie rządzi ludzka fantazja ani moda świata, lecz objawiony wzór Bożego Słowa.
10. Bóg buduje od środka na zewnątrz (25:9–10)
W ludzkim budownictwie zaczyna się od zewnętrznych ścian, lecz Bóg zaczyna od Arki w Miejscu Najświętszym — najpierw przemienia wnętrze i serce, a dopiero potem kształtuje zewnętrzne formy.

CZĘŚĆ II — ARKA PRZYMIERZA I PRZEBŁAGALNIA POD SKRZYDŁAMI CHERUBINÓW (WJ 25:10–22)
11. Skrzynia z drewna akacjowego i szczerego złota (25:10–11)
Drewno akacjowe (szittim) rosło na surowej pustyni i było niemal niezniszczalne — w połączeniu ze szczerym złotem obrazuje doskonałą jedność człowieczeństwa i bóstwa w Jezusie Chrystusie.
12. Złoto wewnątrz i na zewnątrz — bezkompromisowa czystość (25:11)
Arka jest pokryta złotem zarówno z zewnątrz, jak i wewnątrz — Boża świętość nie jest powierzchowną pozłotką na pokaz, lecz głęboką prawdą wnętrza.
13. Złota listwa dokoła — królewska korona Chrystusa (25:11)
Złota korona (zer) otaczająca krawędź Arki zapowiada królewski majestat Tego, który panuje nad prawem i łaską.
14. Złote pierścienie i stałe drążki w bokach Arki (25:12–15)
„Drążki te pozostaną w pierścieniach arki; nie będą z niej wyjmowane” (25:15) — lud Boży na ziemi jest pielgrzymem zawsze gotowym do drogi za obecnością Pana, bez dotykania świętości niepowołaną ręką.
15. „W arkę włożysz świadectwo, które ci dam” (25:16)
W samym centrum Arki spoczywają kamienne tablice Dekalogu — znak, że tron Boga opiera się na sprawiedliwości i niezmienności Jego świętego Prawa (Ps 89:15; 40:9).
16. Przebłagalnia ze szczerego złota nad tablicami Prawa (25:17)
Przebłagalnia (kapporet) przykrywa dokładnie całą powierzchnię Arki (2,5 na 1,5 łokcia): ponad Prawem, które oskarża grzesznika, spoczywa złote miejsce przebłagania krwią!
17. Dwa cherubiny wykute z samej przebłagalni (25:18–19)
Cherubiny nie są doklejone z zewnątrz, lecz wykute z jednej bryły złota przebłagalni — w samym niebie aniołowie ze zdumieniem wglądają w dzieło naszego odkupienia (1 P 1:12).
18. Skrzydła rozpostarte ku górze i wzrok skierowany na przebłagalnię (25:20)
Twarze cherubinów nie patrzą na boki, lecz ku sobie i w dół, na miejsce skropienia krwią w Dzień Pojednania (Kpł 16:14–15) — tam spotyka się łaska z prawdą!
19. „Tam będę się z tobą spotykać” — teologia przebłagalni (25:22)
Spotkanie człowieka ze świętym Bogiem nie następuje na podstawie naszych zasług, lecz „sponad przebłagalni”, gdzie sprawiedliwość Prawa została zaspokojona przez krew ofiary.
20. Głos Boga rozmawiającego z człowiekiem (25:22)
„Będę z tobą rozmawiać o wszystkim, co ci rozkażę” — przebłagalnia to nie milczący zabytek, lecz żywy tron słowa, modlitwy i prowadzenia dla całego ludu Bożego (por. Hbr 4:16).
21. Jedność Prawa i Ewangelii na Arce Przymierza (25:16–22)
Wewnątrz Arki leży Prawo, nad nią przebłagalnia — Ewangelia nie znosi Bożego Prawa (Rz 3:31), lecz dzięki krwi Chrystusa daje przebaczenie tym, którzy je złamali, i moc do jego wypełnienia!
22. Bóg zasiadający na cherubinach jako Król pokoju (25:22; Ps 80:2; 99:1)
Kiedy Izrael mówi o Bogu „który siedzisz na cherubinach”, odwołuje się właśnie do Arki Przymierza jako ziemskiego podnóżka niebiańskiego tronu Boga!

CZĘŚĆ III — ZŁOTY STÓŁ I NIEUSTANNE CHLEBY POKŁADNE PRZED OBLICZEM PANA (WJ 25:23–30)
23. Stół z drewna akacjowego pokryty szczerym złotem (25:23–24)
Podobnie jak Arka, stół łączy trwałe drewno akacjowe ze szczerym złotem i posiada złotą listwę (koronę) dokoła swojej krawędzi.
24. Szerokie obramowanie chroniące chleby przed upadkiem (25:25)
Obramowanie szerokie na cztery palce ze złotą listwą zabezpieczało chleby na stole — w Chrystusie nasz pokarm i wspólnota z Bogiem są bezpiecznie strzeżone przed utratą!
25. Pierścienie i drążki przy czterech nogach stołu (25:26–28)
Także stół społeczności miał wędrować z Izraelem przez pustynię — Bóg karmi swój lud nie tylko w stabilnym mieście, lecz w każdej próbie wędrówki.
26. Złote naczynia służebne stołu (25:29)
Misy, czasze, przykrycia i kubki do nalewania ze szczerego złota przypominają, że w służbie Bożemu Słowu i społeczności wierzących liczy się czystość narzędzi i intencji (2 Tm 2:20–21).
27. „Chleby pokładne” — chleb oblicza Bożego (25:30)
Hebrajskie lechem hapanim oznacza dosłownie „chleb oblicza”. Było ich dwanaście (Kpł 24:5–6) — po jednym za każde pokolenie Izraela, nieustannie przed oczyma PANA!
28. Nieustanna obecność chleba przed Bogiem (25:30)
Słowo „nieustannie” (tamid) oznacza, że ani przez jedną chwilę Bóg nie zapomina o swoim ludzie — każdy wierzący jest w Chrystusie nieprzerwanie pamiętany przed obliczem Ojca.
29. Chleb odnawiany w każdy Szabat (25:30; Kpł 24:8)
Świeże chleby kładziono przed Panem w każdy dzień Szabatu, ukazując odnowienie przymierza i duchowy pokarm czerpany w dniu Pańskiego odpoczynku.
30. Od stołu chlebów pokładnych do Wieczerzy Pańskiej (25:30; J 6:35, 51)
Chleb przed obliczem Boga wskazuje wprost na Jezusa Chrystusa — prawdziwy Chleb, który zstąpił z nieba i daje życie światu!

CZĘŚĆ IV — SIEDMIORAMIENNY ZŁOTY ŚWIECZNIK (MENORA) I NIEBIAŃSKI WZÓR (WJ 25:31–40)
31. Świecznik wykuty z jednej bryły szczerego złota (25:31, 36)
W przeciwieństwie do Arki i stołu Menora nie zawierała w ogóle drewna — była wykuta w całości z jednego talentu szczerego złota (ok. 34 kg!), obrazując czystą Boską światłość i nierozerwalną jedność Chrystusa z Jego Kościołem.
32. Sztuka kucia młotem zamiast odlewania (25:31)
Menora nie była odlewana w formie, lecz ręcznie wykuwana z jednej bryły — Duch Boży kształtuje nasz charakter i światło często poprzez „uderzenia” życiowych prób, nie łamiąc nas, lecz wydobywając blask.
33. Środkowy trzon i sześć bocznych ramion (25:32)
Z jednego centralnego pnia wyrastają trzy ramiona z jednej strony i trzy z drugiej — tak jak z Krzewu Winnego, Chrystusa, wyrastają wszystkie latorośle niosące owoc i światło (J 15:5).
34. Kielichy na kształt migdału, gałki i kwiaty (25:33–35)
Drzewo migdałowe (szaked — „czuwające”) jako pierwsze zakwita po zimie w Izraelu. Na świeczniku przypomina o zmartwychwstaniu Chrystusa oraz o czujnym Bogu czuwającym nad swoim Słowem (Jr 1:11–12).
35. Liczba kielichów: trzy na każdym ramieniu i cztery na trzonie (25:33–34)
Razem dwadzieścia dwa kielichy (3 × 6 + 4 = 22 — tyle, ile liter ma alfabet hebrajski!), jakby cały świecznik był żywym hymnem Pisma Świętego płonącym czystym światłem!
36. Siedem lamp świecących naprzód ku stołowi (25:37)
W Świętym Miejscu nie było żadnych okien — jedynym źródłem światła był złoty świecznik zasilany czystą oliwą, kierujący blask wprost na stół chlebów pokładnych: to Duch Święty oświetla nam Chleb Słowa Bożego!
37. Złote szczypce i naczynia na popiół (25:38)
Nawet usuwanie zwęglonych knotów odbywało się złotymi szczypcami — w Kościele nawet napomnienie i oczyszczanie z błędów powinno dokonywać się w duchu łagodności, czystości i Bożej miłości (Ga 6:1).
38. „Uważaj, abyś uczynił wszystko według wzoru” (25:40)
Ten końcowy nakaz strzeże Kościół przed synkretyzmem: prawdziwy wzór jest w niebie i został zapisany w Piśmie Świętym, a nie wymyślony przez tradycję ludzką.

CZĘŚĆ V — SYNTEZA TEOLOGICZNA, NIEBIAŃSKA ŚWIĄTYNIA I KLUCZE JĘZYKOWE (WJ 25:1–40)
39. Od Synaju do Niebiańskiej Świątyni Nowego Przymierza (25:9, 40; Hbr 8:1–5)
List do Hebrajczyków wyjaśnia, że Mojżesz zobaczył na Synaju „cień rzeczy niebieskich”, ponieważ prawdziwy Przybytek znajduje się w niebie, gdzie Jezus Chrystus wszedł z własną krwią jako nasz Arcykapłan (Hbr 9:11–12, 24).
40. Bóg z nami — Immanuel w każdej epoce historii (25:8; Mt 1:23; Obj 21:3)
Cała Biblia rozwija obietnicę z Wj 25:8 w czterech etapach: Przybytek na pustyni (Wj 25:8) → Wcielenie Jezusa (J 1:14) → Kościół jako świątynia Ducha Świętego (1 Kor 3:16; 2 Kor 6:16) → Nowe Jeruzalem bez rozdzielającej zasłony (Obj 21:3).
41. Teruma (תְּרוּמָה) i ochotne serce:
Prawdziwa służba nigdy nie jest ciężarem pańszczyźnianym, lecz radością serca dotkniętego łaską Bożą.
42. Miszkan (מִשְׁכָּן) i Szechina:
Bóg nie zostawia odkupionego ludu samego na pustyni — rozbija swój namiot pośród jego codziennych wędrówek.
43. Kapporet (כַּפֹּרֶת) i Hilasterion:
Przebłagalnia nad tablicami Dekalogu to najczystszy obraz Ewangelii: sprawiedliwość i miłosierdzie ucałowały się w Chrystusie (Ps 85:11).
44. Lechem Hapanim (לֶחֶם הַפָּנִים):
Chleb obecności uczy codziennego karmienia się Słowem Bożym i dziękczynnej wspólnoty z braćmi i siostrami w wierze.
45. Menora (מְנוֹרָה) i Światło Ducha:
Kościół nie świeci własnym blaskiem psychologii czy kultury, lecz oliwą Ducha Świętego czerpaną z Chrystusa — Światłości Świata.

JEZUS W CENTRUM — ŚWIĄTYNIA BOGA Z NAMI, NASZA PRZEBŁAGALNIA, CHLEB ŻYCIA I ŚWIATŁOŚĆ ŚWIATA
1. Jezus Chrystus — prawdziwy Przybytek i Immanuel („abym mieszkał pośród nich”, Wj 25:8; J 1:14; Kol 2:9):
Kiedy Bóg powiedział: „I zbudują mi świątynię, abym mieszkał pośród nich” (Wj 25:8), zapowiedział przyjście Tego, o którym Apostoł Jan napisał: „A Słowo stało się ciałem i zamieszkało [dosłownie: rozbiło swój przybytek] wśród nas, i widzieliśmy jego chwałę” (J 1:14, UBG). W Chrystusie mieszka cieleśnie cała pełnia Bóstwa (Kol 2:9)!
2. Jezus Chrystus — prawdziwa Arka Przymierza i Przebłagalnia we własnej krwi (Wj 25:10–22; Ps 40:9; Rz 3:25):
Jak Arka łączyła niezniszczalne drewno akacjowe i czyste złoto, tak Jezus łączy prawdziwe, bezgrzeszne człowieczeństwo z pełnym bóstwem. W swoim sercu miał wypisane Boże Prawo (Ps 40:9), a na krzyżu stał się naszą Przebłagalnią (*hilasterion*): „Którego Bóg ustanowił przebłagalnią przez wiarę w jego krew, aby okazać swoją sprawiedliwość przez odpuszczenie przedtem popełnionych grzechów” (Rz 3:25, UBG)!
3. Jezus Chrystus — nieustanny Chleb Życia przed obliczem Ojca (Wj 25:23–30; J 6:35, 51):
Dwanaście chlebów pokładnych leżących nieustannie na złotym stole zapowiadało Pana Jezusa, który karmi każdą duszę: „Ja jestem chlebem życia; kto do mnie przychodzi, nigdy nie będzie łaknął” (J 6:35). On również reprezentuje przed obliczem Ojca cały swój lud!
4. Jezus Chrystus — Światłość Świata płonąca w złotym świeczniku (Wj 25:31–40; J 8:12; Obj 1:12–20):
Siedmioramienna Menora ze szczerego złota oświetlała Święte Miejsce bez udziału światła słonecznego — tak w Kościele jedynym źródłem duchowego poznania jest Jezus Chrystus („Ja jestem światłością świata”, J 8:12), kroczący pośród siedmiu złotych świeczników w mocy Ducha Świętego!
5. Jezus Chrystus — nasz Arcykapłan w prawdziwym niebiańskim Przybytku (Wj 25:9, 40; Hbr 8:1–5; 9:11–12, 24):
List do Hebrajczyków 8:5 cytuje bezpośrednio Wj 25:40, podkreślając, że świątynia na ziemi była tylko cieniem i wzorem niebiańskiej rzeczywistości, w której Pan Jezus Chrystus pełni dziś żywą służbę wstawienniczą po prawicy tronu Majestatu na wysokościach!

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE (12 ZESTAWIEŃ)
• Wj 25:2 → Wj 35:5, 21; 2 Kor 9:7: Dlaczego Bóg przyjmuje wyłącznie dar składany dobrowolnie, z ochotnego serca?
• Wj 25:8 → J 1:14; Obj 21:3: Jak pragnienie Boga „abym mieszkał pośród nich” wypełnia się we wcieleniu Jezusa i w Nowym Jeruzalem?
• Wj 25:8 → 1 Kor 3:16; 2 Kor 6:16: W jaki sposób wierzący i cały zbór stają się dziś żywą świątynią Ducha Świętego?
• Wj 25:9, 40 → Hbr 8:5; Dz 7:44: Co znaczy, że ziemski Przybytek był tylko cieniem i odbiciem prawdziwego Przybytku w niebie?
• Wj 25:10–16 → Pwt 10:1–5; Ps 40:9: Dlaczego w Arce Przymierza znajdowały się właśnie kamienne tablice Dekalogu i jak wiąże się to z sercem Chrystusa?
• Wj 25:17–22 → Kpł 16:14–15; Rz 3:25: Jak złota przebłagalnia i krew Dnia Pojednania wyjaśniają zbawcze dzieło Chrystusa z Rz 3:25?
• Wj 25:20 → 1 P 1:12; Ef 3:10: Dlaczego cherubini spoglądają w dół na przebłagalnię i czego aniołowie uczą się z naszego odkupienia?
• Wj 25:22 → Hbr 4:14–16: Jak obietnica spotkania sponad przebłagalni łączy się z przystępem do tronu łaski w Jezusie Chrystusie?
• Wj 25:23–30 → Kpł 24:5–9; J 6:35, 51: Jak stół i dwanaście chlebów pokładnych wskazują na Chrystusa — Chleb Życia?
• Wj 25:31–37 → Za 4:2–6; Obj 1:12–20: Co oznacza siedmioramienny świecznik w proroctwach Zachariasza i Objawienia?
• Wj 25:33–34 → Lb 17:8; Jr 1:11–12: Dlaczego świecznik ozdobiono kielichami kwitnącego migdałowca?
• Wj 25:37 → Mt 5:14–16; J 8:12: W jaki sposób światło Chrystusa odbija się w wierzących posłanych do świata?

PRAWDA NA DZIŚ (8 ZASAD — CO ZMIENIA SIĘ W MOIM PATRZENIU)
• 1. Bóg pragnie mieszkać pośród mojego zwykłego wtorku: Najwyższy nie zamyka się w odległym niebie, lecz chce być obecny w moim domu, pracy i decyzjach.
• 2. Liczy się ochotne serce, a nie wielkość daru: Bóg patrzy z jednakową miłością na złoto zamożnego i na sierść kozią ubogiego, gdy płyną z dobrowolnego serca.
• 3. Moje sumienie odpoczywa na Przebłagalni Chrystusa: Ponad wymaganiami Dekalogu leży krew Jezusa, dzięki której Bóg rozmawia ze mną w pokoju, a nie w gniewie.
• 4. Złote wnętrze jest ważniejsze od zewnętrznej oprawy: Tak jak Arka była złota również od środka, tak Bóg kształtuje najpierw ukryte motywy mojego serca.
• 5. Moja dusza potrzebuje nieustannego Chleba Życia: Nie mogę żyć duchowo wczorajszym posiłkiem — codziennie przystępuję do stołu Bożego Słowa.
• 6. Prawdziwe światło płynie z jednej bryły — z jedności z Chrystusem: Wyłącznie olej Ducha Świętego sprawia, że moje życie świeci w ciemności świata.
• 7. Złote szczypce uczą łagodności przy oczyszczaniu: Nawet gdy usuwamy błędy i zwęglone knoty, w domu Bożym robimy to złotem miłości, nie surowym żelazem.
• 8. Buduję życie według Bożego wzoru, nie według opinii świata: „Uważaj, abyś uczynił wszystko według wzoru” chroni wiarę przed ludzkimi wymysłami i kompromisami.

POMYŚL — PYTANIA DO SERCA (8 PYTAŃ)
1. Czy w Twoim życiu i służbie dla Boga dominuje dzisiaj radosna dobrowolność wdzięcznego serca, czy poczucie ciężkiego obowiązku i przymusu?
2. Co dziś możesz ofiarować Bogu ze swoich „darów codzienności” — czasu, talentów, cierpliwości lub środków — na budowanie Jego dzieła wśród ludzi?
3. Czy naprawdę wierzysz, że święty Bóg chce mieszkać pośród Twoich realnych spraw i zmagań tego wtorku?
4. Czy Twoje serce jest „pokryte złotem także wewnątrz” — czy Twoje ukryte myśli przed Bogiem zgadzają się z tym, co pokazujesz ludziom?
5. Gdy sumienie przypomina Ci o wymaganiach Bożego Prawa, czy uciekasz pod strach, czy spoglądasz z wiarą na Przebłagalnię skropioną krwią Chrystusa?
6. Czy masz każdego dnia stałą porę przy „stole chlebów pokładnych”, by karmić duszę żywym Słowem Pisma Świętego?
7. Czy w Twoim otoczeniu ludzie widzą łagodny, ciepły blask siedmioramiennego świecznika Ducha Świętego, czy raczej dym zniechęcenia?
8. W jakiej jednej sferze Twojego domu lub decyzji musisz dziś wrócić do biblijnego wzoru z góry, rezygnując z ludzkich skrótów?

MAŁY QUIZ WIEDZY BIBLIJNEJ (20 PYTAŃ Z WJ 25:1–40)
${quizItems
  .map(
    (item, idx) => `Pytanie ${idx + 1}: ${item.q}
A. ${item.a[0]}
B. ${item.a[1]}
C. ${item.a[2]}
D. ${item.a[3]}
Poprawna odpowiedź: ${['A', 'B', 'C', 'D'][item.c]}. Wyjaśnienie: ${item.exp}`
  )
  .join('\n\n')}

TWOJA DECYZJA
Dwudziesty piąty rozdział Księgi Wyjścia objawia poruszającą prawdę: Stwórca nieba i ziemi nie chce pozostać dla Ciebie jedynie daleką ideą. Jego serce bije pragnieniem zamieszkania pośród Ciebie — przez krew Przebłagalni Jezusa Chrystusa, przez codzienny Chleb Życia i przez czyste światło Ducha Świętego.
Podejmij dziś konkretną decyzję serca: oddaj Bogu dobrowolnie swój czas i uwagę, powierz Mu swoje sumienie na Przebłagalni Chrystusa i oprzyj całe swoje życie na wiernym wzorze Bożego Słowa!

MOJA DECYZJA:
„Panie Jezu Chryste, Ty jesteś prawdziwą Świątynią Boga z nami, naszą Przebłagalnią, Chlebem Życia i Światłością Świata. Dobrowolnie i z wdzięcznego serca oddaję Ci dziś mój czas, mój dom i moje decyzje. Pragnę każdego dnia karmić się Twoim Słowem, świecić olejem Twojego Ducha i budować całe swoje życie wiernie według wzoru Pisma Świętego.”

MODLITWA NA 24 LISTOPADA 2026 R.
Wszechmogący Ojcze w niebie, Boże Przymierza! Dziękujemy Ci za dwudziesty piąty rozdział Księgi Wyjścia i za poruszające słowa Twojej miłości: „I zbudują mi świątynię, abym mieszkał pośród nich”. Dziękujemy Ci, że nie trzymasz nas na dystans, lecz sam wyszedłeś nam naprzeciw w osobie swojego Syna, Jezusa Chrystusa!
Przepraszamy Cię za chwile, gdy przynosiliśmy Ci dary niechętnego serca, z przymusu albo z pośpiechu, oraz za momenty, gdy budowaliśmy nasze życie według własnych pomysłów zamiast według wzoru ukazanego na górze Twojego Słowa.
Panie Jezu Chryste, dziękujemy Ci, że jesteś naszą Arka Przymierza, w której kryje się święte Prawo Ojca, i naszą złotą Przebłagalnią skropioną Twoją najdroższą krwią! Dziękujemy Ci, że karmisz nas jako Chleb Życia i rozświetlasz naszą ciemność światłem siedmioramiennego świecznika Ducha Świętego. Zamieszkaj dziś w naszych sercach i domach, rozmawiaj z nami w ciszy modlitwy i prowadź nas przez cały ten wtorek. W Twoim świętym imieniu. Amen!

ZADANIE NA DZIŚ (7 ZADAŃ TAKTYCZNYCH)
1. Przeczytaj uważnie cały 25. rozdział Księgi Wyjścia (Wj 25:1–40 UBG) oraz List do Hebrajczyków 8:1–5 i 9:1–12.
2. Zapamiętaj werset Wj 25:8 („I zbudują mi świątynię, abym mieszkał pośród nich”) i podziękuj Bogu za Jego bliską obecność w Twoim domu.
3. Przynieś dziś Bogu przynajmniej jeden dobrowolny „dar z ochotnego serca” — bezinteresowną pomoc, dobre słowo wsparcia lub cichy dar miłości dla kogoś w potrzebie.
4. W chwili duchowego zmagania lub poczucia winy spójrz w modlitwie na Chrystusa jako swoją Przebłagalnię (Rz 3:25) i przyjmij Boży pokój.
5. Zadbaj dziś o chwilę przy „stole chlebów pokładnych” — przeczytaj z uwagą wybrany fragment Ewangelii (np. J 6:35–51) jako żywy pokarm dla duszy.
6. W rozmowach tego wtorku bądź odbiciem światła Menory (Mt 5:14–16) — wnosząc łagodność, nadzieję i czystość słowa zamiast narzekania.
7. Oznacz Dzień 55 jako ukończony w Akademii i podziel się tą lekcją z osobą, której chcesz przypomnieć, że Bóg pragnie mieszkać pośród jej codziennych spraw!

JUTRO — 25 LISTOPADA 2026 R.
DZIEŃ 56: ZASŁONY PRZYBYTKU, DESKI AKACJOWE I ZASŁONA ŚWIĄTYNI (WJ 26:1–37)
Jutro w 26. rozdziale Księgi Wyjścia przyjrzymy się z bliska konstrukcji samego namiotu Przybytku: dziesięciu kobiercom z bisioru, błękitu, purpury i karmazynu z wyhaftowanymi cherubinami, pięćdziesięciu złotym haczykom łączącym całość w jeden Przybytek oraz tajemnicy zasłony oddzielającej Miejsce Święte od Najświętszego — zasłony, która rozdarła się na dwoje w chwili śmierci Jezusa na Golgocie!`;

// ── 3. GENEROWANIE PLIKU WORD (.DOCX) ──
console.log('📄 Generuję profesjonalny plik Microsoft Word (.docx) dla Dnia 55...');

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

const gdriveOutputsDir = 'H:/Mój dysk/OA - orkiestracja Agentowa/produkowane przez Agentów';
const docxOutDir = fs.existsSync(gdriveOutputsDir) ? gdriveOutputsDir : path.join(REPO, 'scripts/content');
const docxOutPath = path.join(docxOutDir, `Z_Biblia_za_Pan_Brat_Dzien_${DAY_NUM}_${DATE_STR}.docx`);
const docxBuffer = await Packer.toBuffer(doc);
fs.writeFileSync(docxOutPath, docxBuffer);
console.log(
  `✅ Zapisano sformatowany plik DOCX na Google Drive (Czysty Pulpit): ${docxOutPath} (${docxBuffer.length} bajtów)`
);

// ── 4. ZAPIS PAKIETU 5 WERSJI + SUROWEJ LEKCJI ──
const pakietFilePath = path.join(REPO, `scripts/content/pakiet-day${DAY_NUM}-5wersji.md`);
fs.writeFileSync(pakietFilePath, pakiet5wersji, 'utf8');
console.log(`✅ Zapisano pakiet 5 wersji: ${pakietFilePath}`);

const lessonTxtPath = path.join(REPO, `scripts/content/kc-day${DAY_NUM}-lesson.txt`);
fs.writeFileSync(lessonTxtPath, lessonDocxText, 'utf8');
console.log(`✅ Zapisano tekst lekcji: ${lessonTxtPath}`);

// ── 5. BUDOWANIE PLIKU HTML LEKCJI (SZABLON DZIEŃ 54 = 21/21) ──
console.log('🌐 Generuję plik HTML lekcji Dnia 55 (4 ścieżki Clean URLs + kolejka)...');
const template54Path = path.join(REPO, 'akademia/kurscodzienny/dzien-54.html');
let html = fs.readFileSync(template54Path, 'utf8');

// 5.1 Meta, tytuły i social share
html = html.replace(
  /<title>Dzień 54: [^<]+<\/title>/,
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
  /<meta property="og:description" content="[^"]*"[^>]*>/,
  `<meta property="og:description" content="${SUBTITLE}" />`
);
html = html.replace(
  /kc_day_54_krew_przymierza_chwala_synaj\.jpg(\?v=\d+)?/g,
  `${IMG_FILENAME}?v=20261124`
);

html = html.replace(/kurscodzienny%2Fdzien-54/g, `kurscodzienny%2Fdzien-${DAY_NUM}`);
html = html.replace(
  /Z%20Bibli%C4%85%20za%20Pan%20Brat%20%E2%80%94%20Dzie%C5%84%2054[^"']+/g,
  encodeURIComponent(`Z Biblią za Pan Brat — Dzień ${DAY_NUM}: ${TITLE} (${READING})`)
);
html = html.replace(
  /Jedno kliknięcie może przynieść pokój Krwi Przymierza i światło Bożej obecności komuś, kto dziś szczególnie tego potrzebuje\./,
  'Jedno kliknięcie może przynieść światło Bożej obecności, pokój Przebłagalni i pokarm Chleba Życia komuś, kto dziś szczególnie tego potrzebuje.'
);

// 5.2 Nawigacja i okruszki
html = html.replace(
  /<span class="text-amber-400 font-semibold">Dzień 54<\/span>/,
  `<span class="text-amber-400 font-semibold">Dzień ${DAY_NUM}</span>`
);

const nav54Regex =
  /<a href="\/akademia\/kurscodzienny\/dzien-53"[\s\S]*?<\/a>\s*<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50[\s\S]*?<\/span>\s*<\/span>/;
const nav55Block = `<a href="/akademia/kurscodzienny/dzien-54" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 54</span>
        </a>
        <span class="px-3 py-1.5 rounded-lg bg-zinc-900/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 56 (Środa) →</span>
        </span>`;
if (!nav54Regex.test(html)) {
  throw new Error('Nie znaleziono bloku nawigacji Dnia 54 w szablonie');
}
html = html.replace(nav54Regex, nav55Block);

// 5.3 Hero i grafika
html = html.replace(/<span>Dzień 54 z 2009<\/span>/g, `<span>Dzień ${DAY_NUM} z 2009</span>`);
html = html.replace(/23 LISTOPADA 2026 • PONIEDZIAŁEK/g, DATE_SHORT_UPPER);
html = html.replace(
  /<h1 class="[^"]+">[\s\S]*?<\/h1>/,
  `<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">\n        ${TITLE}\n      </h1>`
);
html = html.replace(
  /<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">[\s\S]*?<\/p>/,
  `<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">\n        ${SUBTITLE}\n      </p>`
);
html = html.replace(
  /alt="Dzień 54:[^"]*"/,
  `alt="Dzień ${DAY_NUM}: ${TITLE} (${READING})"`
);
html = html.replace(
  /<span>Ilustracja biblijna:[^<]*<\/span>/,
  `<span>${IMG_CAPTION}</span>`
);
html = html.replace(/Czytanie: Wj 24:1–18/g, `Czytanie: ${READING}`);

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
          <p class="text-xs text-zinc-400 font-semibold">— Księga Wyjścia 25:8 (UBG)</p>
        </div>
        <button
          onclick="navigator.clipboard.writeText('„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 25:8 (UBG)'); this.innerHTML = '<i class=\\'fa-solid fa-check\\'></i> Skopiowano'; setTimeout(() => this.innerHTML = '<i class=\\'fa-regular fa-copy\\'></i> Kopiuj', 2000);"
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
  `<!-- LESSON BODY CONTENT (Dzień ${DAY_NUM}, 24.11.2026) -->`
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
            Dziś jest <strong class="text-white">Dzień 55</strong>: Księga Wyjścia, <strong class="text-brand-gold">${READING}</strong>. Rozpoczynamy tu wielkie objawienie Bożego Przybytku przekazane Mojżeszowi w obłoku chwały na górze Synaj: od dobrowolnego daru serca po Arkę Przymierza z przebłagalnią, złoty stół chlebów pokładnych i siedmioramienny świecznik (Menorę).
          </p>
          <p>
            Zanim przejdziesz do komentarza, przeczytaj spokojnie wszystkie czterdzieści wersetów w przekładzie UBG. Zwróć szczególną uwagę na słowa z wersetu 8 („I zbudują mi świątynię, abym mieszkał pośród nich”) oraz z wersetu 40 („Uważaj, abyś uczynił wszystko według wzoru tego, co ci ukazano na górze”).
          </p>
          <a href="/mojabiblia?book=EXO&chapter=25" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]"><i class="fa-solid fa-book-open"></i><span>Czytaj ${READING}</span></a>
        </div>
      </article>`
);

// 5.6 Tekst Pisma Świętego
html = html.replace(
  /<!-- SCRIPTURE SECTION[^>]*-->/,
  `<!-- SCRIPTURE SECTION (${READING}) -->`
);
html = html.replace(
  /Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 24:1–18/g,
  `Uwspółcześniona Biblia Gdańska (UBG) • ${READING}`
);
html = html.replace(/\/mojabiblia\?book=EXO&chapter=24/g, `/mojabiblia?book=EXO&chapter=25`);
html = html.replace(/\/mojabiblia\?book=EXO&amp;chapter=24/g, `/mojabiblia?book=EXO&amp;chapter=25`);
html = html.replace(
  /<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>\s*<!-- KLUCZE JĘZYKOWE/,
  `<div class="kc-prose-reading">\n        ${buildVersesParagraphsHtml()}\n        </div>\n      </section>\n\n      <!-- KLUCZE JĘZYKOWE`
);

// 5.7 Klucze Językowe & Kody Stronga
const strongChips55 = `<span class="strong-chip"><span class="strong-id">H8641</span> <span class="strong-orig">תְּרוּמָה (Teruma)</span> — dobrowolny dar serca, ofiara podniesienia składana PANU (Wj 25:2)</span>
          <span class="strong-chip"><span class="strong-id">H4720</span> <span class="strong-orig">מִקְדָּשׁ (Mikdasz)</span> — świątynia, święte miejsce obecności Najwyższego (Wj 25:8)</span>
          <span class="strong-chip"><span class="strong-id">H4908</span> <span class="strong-orig">מִשְׁכָּן (Miszkan)</span> — przybytek, mieszkanie Boga pośród Jego ludu (Wj 25:9)</span>
          <span class="strong-chip"><span class="strong-id">H8403</span> <span class="strong-orig">תַּבְנִית (Tawnit)</span> — niebiański wzór i projekt ukazany Mojżeszowi na górze (Wj 25:9, 40)</span>
          <span class="strong-chip"><span class="strong-id">H727</span> <span class="strong-orig">אָרוֹן (Aron)</span> — Arka Przymierza z drewna akacjowego i złota kryjąca tablice Świadectwa (Wj 25:10)</span>
          <span class="strong-chip"><span class="strong-id">H3727</span> <span class="strong-orig">כַּפֹּרֶת (Kapporet)</span> — złota przebłagalnia nad Arką (w NT gr. <em>hilasterion</em>, Rz 3:25) (Wj 25:17–22)</span>
          <span class="strong-chip"><span class="strong-id">H3742</span> <span class="strong-orig">כְּרוּבִים (Keruwim)</span> — złoci cherubini strzegący świętości nad przebłagalnią (Wj 25:18–22)</span>
          <span class="strong-chip"><span class="strong-id">H4501</span> <span class="strong-orig">מְנוֹרָה (Menora)</span> — siedmioramienny świecznik ze szczerego złota z kielichami migdałowca (Wj 25:31–39)</span>`;

html = html.replace(
  /Klucze Językowe &amp; Kody Stronga \(Wj 24:1–18\)/g,
  `Klucze Językowe &amp; Kody Stronga (${READING})`
);
html = html.replace(
  /Poniższe terminy hebrajskie tworzą osnowę teologiczną 24\. rozdziału Księgi Wyjścia[\s\S]*?<\/p>/,
  `Poniższe terminy hebrajskie tworzą osnowę teologiczną 25. rozdziału Księgi Wyjścia (dobrowolny dar serca, Przybytek jako mieszkanie Boga, niebiański wzór, Arka Przymierza, przebłagalnia pod skrzydłami cherubinów oraz złota Menora):</p>`
);
html = html.replace(
  /<div class="flex flex-wrap gap-2">[\s\S]*?<\/div>\s*<\/section>\s*<!-- THEOLOGICAL EXEGESIS/,
  `<div class="flex flex-wrap gap-2">\n          ${strongChips55}\n        </div>\n      </section>\n\n      <!-- THEOLOGICAL EXEGESIS`
);

// 5.8 Egzegeza (5 części, 45 punktów)
html = html.replace(
  /Pięć części studium Wj 24:1–18 \(45 punktów analitycznych\)/g,
  `Pięć części studium ${READING} (45 punktów analitycznych)`
);

const exegesis55 = `<!-- CZĘŚĆ I -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
            DOBROWOLNY DAR SERCA I PRAGNIENIE BOGA: „ABYM MIESZKAŁ POŚRÓD NICH” (WJ 25:1–9)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>1. Inicjatywa łaski należy do Boga (25:1–2):</strong> To Bóg sam proponuje bliskość i przekazuje projekt miejsca spotkania.</p>
            <p><strong>2. Dobrowolność jako fundament ofiarności (25:2):</strong> „Od każdego człowieka, który daje dobrowolnie ze swego serca” — PAN nie przyjmuje daru wymuszonego (por. 2 Kor 9:7).</p>
            <p><strong>3. Różnorodność darów dla każdego (25:3–7):</strong> Od złota i kamieni szlachetnych po sierść kozią i oliwę — w dziele Bożym liczy się każdy wkład z miłości.</p>
            <p><strong>4. Trzy metale Przybytku (25:3):</strong> Złoto wyraża chwałę i bóstwo, srebro okup odkupienia, a miedź ofiarę i sąd nad grzechem.</p>
            <p><strong>5. Cztery barwy tkanin wskazujące na Chrystusa (25:4):</strong> Błękit (niebo), purpura (król), karmazyn (krew ofiary) i biały bisior (sprawiedliwość).</p>
            <p><strong>6. Oliwa, wonności i kamienie arcykapłańskie (25:6–7):</strong> Światło Ducha Świętego, modlitwy świętych i dwanaście pokoleń noszonych na sercu arcykapłana.</p>
            <p><strong>7. „I zbudują mi świątynię, abym mieszkał pośród nich” (25:8):</strong> Wszechmogący Bóg pragnie zamieszkać w samym sercu obozu swojego odkupionego ludu.</p>
            <p><strong>8. Od Edenu do Przybytku i Nowego Jeruzalem (25:8; Obj 21:3):</strong> Zapowiedź Immanuela („Bóg z nami”) realizowana w Chrystusie i wieczności.</p>
            <p><strong>9. Wierność niebiańskiemu wzorowi <em>tawnit</em> (25:9):</strong> Kult i Kościół buduje się według objawienia Bożego Słowa, nie ludzkiej mody.</p>
            <p><strong>10. Projektowanie od środka na zewnątrz (25:9–10):</strong> Bóg zaczyna od tronu łaski w sercu, a dopiero potem kształtuje zewnętrzne ściany.</p>
          </div>
        </div>

        <!-- CZĘŚĆ II -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
            ARKA PRZYMIERZA I PRZEBŁAGALNIA POD SKRZYDŁAMI CHERUBINÓW (WJ 25:10–22)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>11. Drewno akacjowe i szczere złoto (25:10–11):</strong> Niezniszczalne drewno pustyni i czyste złoto łączą w obrazie człowieczeństwo i bóstwo Chrystusa.</p>
            <p><strong>12. Złoto wewnątrz i na zewnątrz (25:11):</strong> Świętość nie jest powierzchowną pozłotką, lecz prawdą ukrytego wnętrza.</p>
            <p><strong>13. Złota listwa dokoła Arki (25:11):</strong> Królewska korona majestatu spoczywająca nad Arką Przymierza.</p>
            <p><strong>14. Pierścienie i nieusuwalne drążki (25:12–15):</strong> „Nie będą z niej wyjmowane” — gotowość do wędrówki za Panem i ochrona świętości.</p>
            <p><strong>15. Tablice Świadectwa we wnętrzu Arki (25:16):</strong> Sprawiedliwe Prawo Dekalogu jako trwały fundament Bożego tronu (Ps 89:15).</p>
            <p><strong>16. Przebłagalnia ze szczerego złota nad Prawem (25:17):</strong> Złote wieko <em>kapporet</em> przykrywa dokładnie całą Arkę, ukazując łaskę przebłagania nad oskarżeniem Prawa.</p>
            <p><strong>17. Dwa cherubiny wykute z jednej bryły przebłagalni (25:18–19):</strong> Anielska straż świętości zjednoczona z miejscem pojednania (1 P 1:12).</p>
            <p><strong>18. Skrzydła ku górze, oczy ku przebłagalni (25:20):</strong> Cherubini wpatrują się w miejsce skropienia krwią w Dzień Pojednania (Kpł 16:14–15).</p>
            <p><strong>19. „Tam będę się z tobą spotykać” (25:22):</strong> Spotkanie człowieka z Bogiem następuje wyłącznie na gruncie przebłagania krwią Chrystusa.</p>
            <p><strong>20. Żywy głos Boga sponad przebłagalni (25:22):</strong> Z tronu łaski płynie słowo prowadzenia i pokoju dla całego ludu (Hbr 4:16).</p>
            <p><strong>21. Harmonia Prawa i Ewangelii (25:16–22):</strong> Ewangelia nie przekreśla Dekalogu, lecz zaspokaja jego sprawiedliwość w ofierze Baranka (Rz 3:31).</p>
            <p><strong>22. Tron między cherubinami (25:22; Ps 80:2):</strong> Ziemski obraz królewskiego tronu Boga w niebie.</p>
          </div>
        </div>

        <!-- CZĘŚĆ III -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
            ZŁOTY STÓŁ I NIEUSTANNE CHLEBY POKŁADNE PRZED OBLICZEM PANA (WJ 25:23–30)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>23. Stół z drewna akacjowego i złota (25:23–24):</strong> Królewski stół społeczności w Miejscu Świętym o wymiarach 2 × 1 × 1,5 łokcia.</p>
            <p><strong>24. Obramowanie na cztery palce ze złotą listwą (25:25):</strong> Ochronna krawędź strzegąca chlebów przed zsunięciem — obraz pewności naszego utrzymania w Chrystusie.</p>
            <p><strong>25. Drążki przy czterech nogach stołu (25:26–28):</strong> Boże zaopatrzenie i wspólnota stołu idą z ludem nawet przez pustynię.</p>
            <p><strong>26. Złote naczynia służebne (25:29):</strong> Misy, czasze, przykrycia i kubki ze szczerego złota uczą czystości w służbie (2 Tm 2:20–21).</p>
            <p><strong>27. „Chleby pokładne” — <em>Lechem Hapanim</em> (25:30):</strong> Dosłownie „chleb oblicza Bożego” — dwanaście bochenków reprezentujących wszystkie pokolenia przed Bogiem.</p>
            <p><strong>28. Słowo „nieustannie” (<em>tamid</em>) (25:30):</strong> Nieprzerwana pamięć i opieka Ojca nad Jego ludem w każdej godzinie.</p>
            <p><strong>29. Odnawianie chlebów w każdy Szabat (25:30; Kpł 24:8):</strong> Cotygodniowy rytm karmienia się świeżym Słowem i społecznością dnia Pańskiego.</p>
            <p><strong>30. Zapowiedź Chleba Życia (25:30; J 6:35):</strong> Każdy chleb na stole wskazuje na Jezusa Chrystusa karmiącego głodne serca.</p>
          </div>
        </div>

        <!-- CZĘŚĆ IV -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
            SIEDMIORAMIENNY ZŁOTY ŚWIECZNIK (MENORA) I NIEBIAŃSKI WZÓR (WJ 25:31–40)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>31. Jedna bryła szczerego złota (25:31, 36):</strong> Bez domieszki drewna — czyste Boskie światło i nierozerwalna jedność Chrystusa z Kościołem.</p>
            <p><strong>32. Wykuty młotem ze złota talentu (25:31, 39):</strong> Ręcznie kształtowane piękno, jak charakter wierzącego formowany w próbach.</p>
            <p><strong>33. Środkowy trzon i sześć bocznych ramion (25:32):</strong> Jak Krzew Winny i jego latorośle czerpiące życiodajną oliwę z jednego źródła (J 15:5).</p>
            <p><strong>34. Kielichy migdałowca, gałki i kwiaty (25:33–35):</strong> Pierwsze kwitnące drzewo wiosny jako symbol zmartwychwstania i czuwania Boga nad Słowem (Jr 1:12).</p>
            <p><strong>35. Dwadzieścia dwa kielichy światła (25:33–34):</strong> Liczba liter alfabetu hebrajskiego — całe Pismo Święte płonące światłem Chrystusa.</p>
            <p><strong>36. Siedem lamp świecących naprzód (25:37):</strong> Duch Święty oświeca stół chlebów pokładnych — w ciemności świata jedynym światłem jest Boża oliwa.</p>
            <p><strong>37. Złote szczypce i naczynia na popiół (25:38):</strong> Oczyszczanie knotów złotem łagodności i miłości, aby światło płonęło czysto (Ga 6:1).</p>
            <p><strong>38. „Uważaj, abyś uczynił wszystko według wzoru” (25:40):</strong> Bezwzględny nakaz wierności Pismu Świętemu bez ludzkich dodatków.</p>
          </div>
        </div>

        <!-- CZĘŚĆ V -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">V</span>
            SYNTEZA TEOLOGICZNA, NIEBIAŃSKA ŚWIĄTYNIA I KLUCZE JĘZYKOWE (WJ 25:1–40)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>39. Cień niebiańskiego Przybytku (25:9, 40; Hbr 8:1–5):</strong> Ziemskie sanktuarium było obrazem prawdziwej świątyni w niebie, gdzie służy Chrystus.</p>
            <p><strong>40. Cztery etapy obietnicy „abym mieszkał pośród nich”:</strong> Przybytek na pustyni → Wcielenie Jezusa (J 1:14) → Kościół jako świątynia Ducha → Nowe Jeruzalem (Obj 21:3).</p>
            <p><strong>41. <em>Teruma</em> (תְּרוּמָה):</strong> Radosny, dobrowolny dar serca wdzięcznego za odkupienie.</p>
            <p><strong>42. <em>Miszkan</em> (מִשְׁכָּן):</strong> Bóg rozbijający swój namiot pośród codziennej pielgrzymki swojego ludu.</p>
            <p><strong>43. <em>Kapporet</em> (כַּפֹּרֶת):</strong> Złote miejsce pojednania, gdzie sprawiedliwość Prawa i miłosierdzie łaski spotykają się we krwi Baranka.</p>
            <p><strong>44. <em>Lechem Hapanim</em> (לֶחֶם הַפָּנִים):</strong> Nieustanny chleb przed obliczem Ojca — nasze codzienne nasycenie Słowem.</p>
            <p><strong>45. <em>Menora</em> (מְנוֹרָה):</strong> Pełnia Ducha Świętego czyniąca z wierzących światło pośród ciemności świata.</p>
          </div>
        </div>`;

html = html.replace(
  /<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── JEZUS W CENTRUM ── -->/,
  `<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">\n        ${exegesis55}\n        </div>\n      </section>\n\n      <!-- ── JEZUS W CENTRUM ── -->`
);

// 5.9 Jezus w Centrum
const jesus55 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Świątynia Boga z Nami, Nasza Przebłagalnia, Chleb Życia i Światłość Świata
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            <strong>1. Jezus Chrystus — prawdziwy Przybytek i Immanuel („abym mieszkał pośród nich”, Wj 25:8; Ewangelia Jana 1:14; Kolosan 2:9):</strong> Kiedy Bóg powiedział pod Synajem: „I zbudują mi świątynię, abym mieszkał pośród nich”, zapowiedział przyjście Pana Jezusa, o którym Ewangelia Jana mówi dosłownie: „A Słowo stało się ciałem i zamieszkało [rozbiło swój przybytek] wśród nas” (J 1:14)!
          </p>
          <p>
            <strong>2. Jezus Chrystus — prawdziwa Arka Przymierza i Przebłagalnia (Wj 25:10–22; Psalm 40:9; Rzymian 3:25):</strong> Trwałe drewno akacjowe i szczere złoto Arki ukazują doskonałe człowieczeństwo i bóstwo Zbawiciela, który nosił Prawo Boże w sercu i stał się naszą Przebłagalnią (<em>hilasterion</em>) przez wiarę w Jego krew przelaną na Golgocie!
          </p>
          <p>
            <strong>3. Jezus Chrystus — nieustanny Chleb Życia przed obliczem Ojca (Wj 25:23–30; Ewangelia Jana 6:35, 51):</strong> Dwanaście chlebów pokładnych na złotym stole zapowiadało Jezusa — prawdziwy Chleb z nieba, który zaspokaja każdy duchowy głód i nieustannie reprezentuje swój lud przed Bogiem.
          </p>
          <p>
            <strong>4. Jezus Chrystus — Światłość Świata w złotym świeczniku (Wj 25:31–40; Ewangelia Jana 8:12; Objawienie 1:12–20):</strong> Siedmioramienna Menora ze szczerego złota była jedynym źródłem blasku w Świętym Miejscu — tak Jezus jest Światłością Świata, posyłającą siedmiorakiego Ducha Świętego do serc wierzących.
          </p>
          <p>
            <strong>5. Jezus Chrystus — nasz Arcykapłan w prawdziwej niebiańskiej świątyni (Wj 25:9, 40; Hebrajczyków 8:1–5; 9:11–12, 24):</strong> List do Hebrajczyków 8:5 cytuje bezpośrednio Wj 25:40, wskazując, że ziemski Przybytek był cieniem prawdziwej świątyni w niebie, gdzie Jezus wstawia się dziś za nami przed obliczem Ojca!
          </p>
          <div class="pt-2">
            <a href="/mojabiblia?book=EXO&chapter=25" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
              <i class="fa-solid fa-book-open"></i>
              <span>Czytaj ${READING}</span>
            </a>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── JEZUS W CENTRUM ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-cross"><\/i>\s*<span>Jezus w centrum<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── SPRAWDŹ W BIBLII ── -->)/,
  `$1${jesus55}\n      $2`
);

// 5.10 Sprawdź w Biblii
const compare55 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Sprawdź w Biblii — 12 Wersetów Porównawczych (${READING})
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300 font-serif">
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 25:2 → Księga Wyjścia 35:5, 21; 2 Koryntian 9:7</strong>: Dlaczego Bóg przyjmuje wyłącznie dar dobrowolnego serca?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 25:8 → Ewangelia Jana 1:14; Objawienie 21:3</strong>: Jak obietnica „abym mieszkał pośród nich” wypełnia się w Chrystusie i wieczności?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 25:8 → 1 List do Koryntian 3:16; 2 Koryntian 6:16</strong>: Jak zbór i serce wierzącego stają się świątynią Ducha Świętego?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 25:9, 40 → List do Hebrajczyków 8:5; Dzieje 7:44</strong>: Dlaczego ziemski Przybytek był tylko cieniem niebiańskiej świątyni?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 25:10–16 → Powtórzonego Prawa 10:1–5; Psalm 40:9</strong>: Dlaczego tablice Dekalogu spoczywały we wnętrzu Arki Przymierza?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 25:17–22 → Kapłańska 16:14–15; Rzymian 3:25</strong>: W jaki sposób złota przebłagalnia zapowiada krew Jezusa Chrystusa?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 25:20 → 1 Piotra 1:12; Efezjan 3:10</strong>: Czego aniołowie uczą się, patrząc na dzieło naszego odkupienia?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 25:22 → List do Hebrajczyków 4:14–16</strong>: Jak obietnica spotkania nad przebłagalnią prowadzi do tronu łaski?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 25:23–30 → Kapłańska 24:5–9; Jana 6:35, 51</strong>: Jak stół chlebów pokładnych wskazuje na Jezusa — Chleb Życia?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 25:31–37 → Zachariasza 4:2–6; Objawienie 1:12–20</strong>: Co symbolizuje złoty świecznik o siedmiu lampach?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 25:33–34 → Liczb 17:8; Jeremiasza 1:11–12</strong>: Dlaczego Menorę zdobiono kielichami kwitnącego migdałowca?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 25:37 → Mateusza 5:14–16; Jana 8:12</strong>: Jak światło Jezusa ma promieniować przez nasze życie?</div>
        </div>`;

html = html.replace(
  /(<!-- ── SPRAWDŹ W BIBLII ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-magnifying-glass"><\/i>\s*<span>Porównaj wersety we własnym Piśmie Świętym<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── PRAWDA NA DZIŚ ── -->)/,
  `$1${compare55}\n      $2`
);

// 5.11 Prawda na dziś
const truth55 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          8 Zasad Dobrowolnego Serca, Przebłagalni i Niebiańskiego Wzoru — co zmienia się w moim patrzeniu
        </h3>
        <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>• <strong>1. Bóg chce mieszkać pośród mojego zwykłego dnia:</strong> Stwórca wszechświata pragnie być blisko moich rozmów, decyzji i domu.</p>
          <p>• <strong>2. Wartość daru mierzy się dobrowolnością serca:</strong> Bóg z równą radością przyjmuje wielki talent i cichy uczynek miłości złożony bez przymusu.</p>
          <p>• <strong>3. Spokój mojego sumienia spoczywa na Przebłagalni Chrystusa:</strong> Ponad wymaganiami Prawa leży krew Jezusa, sponad której Bóg mówi do mnie z łaską.</p>
          <p>• <strong>4. Złoto wnętrza liczy się bardziej niż zewnętrzny blask:</strong> Tak jak Arka była złota również od środka, Bóg oczyszcza najpierw ukryte motywy serca.</p>
          <p>• <strong>5. Każdy dzień wymaga świeżej porcji Chleba Życia:</strong> Jak chleby pokładne spoczywały nieustannie na stole, tak ja codziennie karmię się Słowem Bożym.</p>
          <p>• <strong>6. Świecę wyłącznie olejem Ducha Świętego:</strong> Jedność z Chrystusem, jak z jedną bryłą złota Menory, pozwala nieść światło w ciemności świata.</p>
          <p>• <strong>7. Nawet oczyszczanie i napomnienie czynię złotem łagodności:</strong> Złote szczypce świecznika uczą troski o czystość zboru bez surowości i pogardy.</p>
          <p>• <strong>8. Trzymam się wzoru ukazanego na górze Pisma Świętego:</strong> Nie dopasowuję wiary do chwilowej mody, lecz buduję życie na objawionym Słowie Bożym.</p>
        </div>`;

html = html.replace(
  /(<!-- ── PRAWDA NA DZIŚ ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-lightbulb"><\/i>\s*<span>Prawda na dziś<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── POMYŚL ── -->)/,
  `$1${truth55}\n      $2`
);

// 5.12 Pomyśl
const questions55 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Refleksja Osobista — Spójrz w Światło Słowa (${READING})
        </h3>
        <div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>1. Czy w Twoim dawaniu czasu, uwagi i wsparcia Bogu oraz ludziom przeważa dziś wdzięczna dobrowolność serca, czy ciężar przymusu?</p>
          <p>2. Jaki konkretny „dar z codzienności” możesz dziś złożyć Panu na budowanie pokoju i dobra wokół siebie?</p>
          <p>3. Czy zapraszasz Boga, aby naprawdę „mieszkał pośród” Twoich zwykłych obowiązków tego wtorku?</p>
          <p>4. Czy Twoje wnętrze — myśli, intencje i modlitwy w ukryciu — jest pokryte tym samym „szczerym złotem”, co Twoja postawa wśród ludzi?</p>
          <p>5. Gdzie szukasz przebaczenia i pokoju, gdy uświadamiasz sobie własne potknięcia wobec Bożego Prawa — we własnych wysiłkach czy na Przebłagalni Chrystusa?</p>
          <p>6. Czy znajdujesz codziennie czas przy „stole chlebów pokładnych”, by nakarmić swoją duszę Słowem Bożym?</p>
          <p>7. Co sprawia, że światło Ducha Świętego w Twoim sercu płonie jasno albo przygasa pod ciężarem trosk?</p>
          <p>8. Czy w swojej wierze i codziennych decyzjach kierujesz się wzorem Pisma Świętego, czy raczej wygodnymi kompromisami otoczenia?</p>
        </div>`;

html = html.replace(
  /(<!-- ── POMYŚL ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-heart"><\/i>\s*<span>Pytania do serca \(Pomyśl\)<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── QUIZ ── -->)/,
  `$1${questions55}\n      $2`
);

// 5.13 Quiz nagłówek
html = html.replace(/20 Pytań z Wj 24 \(Sprawdź swoją wiedzę\)/g, `20 Pytań z Wj 25 (Sprawdź swoją wiedzę)`);
html = html.replace(/Po przeczytaniu Wj 24/g, `Po przeczytaniu Wj 25`);

// 5.14 Twoja decyzja
const decision55 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Złóż Bogu Dobrowolne Serce, Odpocznij na Przebłagalni i Świeć Światłem Chrystusa!
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            Dwudziesty piąty rozdział Księgi Wyjścia odkrywa przed nami najczulsze pragnienie Stwórcy: „I zbudują mi świątynię, abym mieszkał pośród nich”. Bóg nie chce być tylko tematem książek — pragnie mieszkać w samym centrum Twojego życia przez swojego Syna, Jezusa Chrystusa!
          </p>
          <p>
            Podejmij dziś świadomą decyzję: przyjdź przed Jego tron nie ze strachem, lecz przez Przebłagalnię krwi Jezusa, nakarm się Chlebem Życia i oddaj Mu dobrowolnie swój dzień według wiernego wzoru Pisma Świętego!
          </p>
          <div class="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-black/40 to-transparent border border-brand-gold/40">
            <h4 class="font-bold text-amber-300 mb-2 uppercase tracking-wide text-xs">Moja Decyzja — Osobiste Wyznanie:</h4>
            <p class="italic text-white">
              „Panie Jezu Chryste, Ty jesteś prawdziwą Świątynią Boga z nami, moją Przebłagalnią, Chlebem Życia i Światłością Świata. Z dobrowolnego i wdzięcznego serca oddaję Ci dziś mój dom, moją pracę i moje decyzje. Pragnę karmić się każdego dnia Twoim Słowem i budować całe swoje życie wiernie według wzoru Twojego objawienia.”
            </p>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── TWOJA DECYZJA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-flag-checkered"><\/i>\s*<span>Twoja decyzja<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── MODLITWA ── -->)/,
  `$1${decision55}\n      $2`
);

// 5.15 Modlitwa
html = html.replace(/<span>Modlitwa na 23 listopada<\/span>/g, `<span>Modlitwa na 24 listopada</span>`);
const prayer55 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Modlitwa o Dobrowolne Serce, Obecność Przebłagalni i Światło Ducha Świętego
        </h3>
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed space-y-3">
          <p>
            Wszechmogący Ojcze w niebie, Boże Przymierza! Dziękujemy Ci za dwudziesty piąty rozdział Księgi Wyjścia i za poruszające wyznanie Twojego serca: „I zbudują mi świątynię, abym mieszkał pośród nich”. Dziękujemy Ci, że nie trzymasz nas na dystans, lecz sam pragniesz bliskości z Twoimi dziećmi.
          </p>
          <p>
            Przepraszamy Cię za chwile, w których służyliśmy Ci z przymusu lub dawaliśmy Ci tylko resztki naszego czasu i uwagi, a także za momenty, gdy budowaliśmy nasze życie według ludzkich schematów zamiast według niebiańskiego wzoru Twojego Słowa.
          </p>
          <p>
            Panie Jezu Chryste, dziękujemy Ci, że jesteś naszą prawdziwą Arką Przymierza, naszą złotą Przebłagalnią skropioną krwią pojednania, naszym codziennym Chlebem Życia i Światłością Świata! Zamieszkaj dziś w pełni w naszych sercach i domach, rozmawiaj z nami w ciszy modlitwy i rozświetlaj każdy nasz krok tego wtorku. Amen!
          </p>
        </div>`;

html = html.replace(
  /(<!-- ── MODLITWA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-hands-praying"><\/i>\s*<span>Modlitwa na [^<]+<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── ZASTOSOWANIE I TWÓJ ZAPIS)/,
  `$1${prayer55}\n      $2`
);

// 5.16 Zadania na dziś (7 zadań)
const tasks55 = `<label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-1" onchange="toggleTaskState(1)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>1. Przeczytaj cały fragment <a href="/mojabiblia?book=EXO&chapter=25" class="text-amber-300 underline font-semibold">Wj 25:1–40</a> w przekładzie UBG oraz List do Hebrajczyków 8:1–5 i 9:1–12.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-2" onchange="toggleTaskState(2)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>2. Zapamiętaj werset Wj 25:8 („I zbudują mi świątynię, abym mieszkał pośród nich”) i podziękuj Bogu za Jego bliską obecność.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-3" onchange="toggleTaskState(3)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>3. Złóż dziś dobrowolny dar z ochotnego serca — bezinteresowną pomoc, dobre słowo wsparcia lub cichy gest miłości bliźniego.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-4" onchange="toggleTaskState(4)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>4. W chwili poczucia winy lub zmęczenia spójrz w modlitwie na Chrystusa jako swoją Przebłagalnię (Rz 3:25) i przyjmij Jego pokój.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-5" onchange="toggleTaskState(5)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>5. Zatrzymaj się przy „stole chlebów pokładnych” — nakarm duszę wersetami z Ewangelii Jana 6:35–51 o Chlebie Życia.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-6" onchange="toggleTaskState(6)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>6. W rozmowach tego wtorku wnoś łagodne światło złotego świecznika Ducha Świętego zamiast krytyki czy pośpiechu.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-7" onchange="toggleTaskState(7)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>7. Oznacz Dzień 55 jako ukończony i prześlij tę lekcję bliskiej osobie, aby wiedziała, że Bóg pragnie mieszkać pośród jej spraw.</span>
          </label>`;

html = html.replace(
  /(<p class="text-zinc-200 font-semibold mb-2">Wykonaj dzisiejsze kroki formacji biblijnej:<\/p>\s*)[\s\S]*?(<\/div>\s*<div class="space-y-4 pt-2">)/,
  `$1${tasks55}\n        $2`
);

// 5.17 Zapowiedź: Jutro (Dzień 56) + Karta WspieramTO 2.0
const tomorrow55 = `<section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
        <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
          JUTRO — 25 LISTOPADA 2026
        </div>
        <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
          DZIEŃ 56 — ZASŁONY PRZYBYTKU, DESKI AKACJOWE I ZASŁONA ŚWIĄTYNI (Wj 26:1–37)
        </h3>
        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">
          Dzień 56: W dwudziestym szóstym rozdziale Księgi Wyjścia zobaczymy, jak dziesięć tkanin, pięćdziesiąt złotych haczyków i deski akacjowe łączą się w jeden harmonijny Przybytek — oraz odkryjemy tajemnicę zasłony Miejsca Najświętszego, która w chwili śmierci Jezusa rozdarła się na dwoje, otwierając nam żywą drogę do Ojca!
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-[44px]">
            <span>Dostępne od północy (25 listopada 2026)</span>
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
  `<!-- ── ZAPOWIEDŹ: JUTRO ── -->\n      ${tomorrow55}`
);

// 5.18 JavaScript: QUIZ_DATA (20 pytań), DAY_KEY, completeDay55, TTS
const quizJsItems = quizItems.map(({ q, a, c }) => ({ q, a, c }));
const quizData55 = `// ── QUIZ LOGIC (20 PYTAŃ Z WJ 25:1–40) ──\n    const QUIZ_DATA = ${JSON.stringify(quizJsItems, null, 6)};`;

html = html.replace(/\/\/ ── QUIZ LOGIC[\s\S]*?const QUIZ_DATA = \[[\s\S]*?\];/, quizData55);
html = html.replace(
  /Doskonale! Znasz na wskroś 24\. rozdział Księgi Wyjścia!/g,
  `Doskonale! Znasz na wskroś 25. rozdział Księgi Wyjścia!`
);

html = html.replace(/kc_day54_/g, `kc_day${DAY_NUM}_`);
html = html.replace(/DAY_KEY = 'kc_day54'/g, `DAY_KEY = 'kc_day${DAY_NUM}'`);
html = html.replace(/completeDay54/g, `completeDay${DAY_NUM}`);
html = html.replace(/Oznacz Dzień 54 jako ukończony/g, `Oznacz Dzień ${DAY_NUM} jako ukończony`);
html = html.replace(/Dzień 54 ukończony!/g, `Dzień ${DAY_NUM} ukończony!`);
html = html.replace(
  /new SpeechSynthesisUtterance\("[^"]+"\)/,
  `new SpeechSynthesisUtterance("${MEMORY_VERSE_QUOTE} Księga Wyjścia 25:8.")`
);

// Aktualizacja przycisku "Dzień 55 (Wtorek) →" na aktywny link w Dniu 54!
const day54Paths = [
  path.join(REPO, 'akademia/kurscodzienny/dzien-54.html'),
  path.join(REPO, 'akademia/kurscodzienny/dzien-54/index.html'),
  path.join(REPO, 'kursy/kurscodzienny/dzien-54.html'),
  path.join(REPO, 'kursy/kurscodzienny/dzien-54/index.html'),
];
for (const p54 of day54Paths) {
  if (fs.existsSync(p54)) {
    let h54 = fs.readFileSync(p54, 'utf8');
    h54 = h54.replace(
      /<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50 text-xs text-zinc-600 flex items-center gap-1\.5 min-h-\[44px\]">\s*<span>Dzień 55 \(Wtorek\) →<\/span>\s*<\/span>/,
      `<a href="/akademia/kurscodzienny/dzien-55" class="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs text-amber-300 hover:text-amber-200 transition flex items-center gap-1.5 min-h-[44px]">\n          <span>Dzień 55 →</span>\n          <i class="fa-solid fa-chevron-right text-[10px]"></i>\n        </a>`
    );
    fs.writeFileSync(p54, h54, 'utf8');
  }
}

// Zapis 4 ścieżek Clean URLs w Akademii i Kursach dla Dnia 55
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
console.log('✅ Zapisano 4 ścieżki Clean URLs dla Dnia 55.');

// Zapis paczki przedpublikacyjnej w kolejka-publikacji/kurs-codzienny/2026-11-24/
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
          'Boże pragnienie zamieszkania pośród ludu („abym mieszkał pośród nich”), dobrowolny dar serca, Arka Przymierza z przebłagalnią i cherubinami, stół chlebów pokładnych oraz złoty świecznik.',
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
