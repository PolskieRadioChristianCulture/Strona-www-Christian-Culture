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
const DAY_NUM = 56;
const DATE_STR = '2026-11-25';
const DATE_FORMATTED = '25 LISTOPADA 2026 R. (ŚRODA)';
const DATE_SHORT_UPPER = '25 LISTOPADA 2026 • ŚRODA';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 26:1–37';
const TITLE = 'ZASŁONY PRZYBYTKU, DESKI AKACJOWE I ZASŁONA ŚWIĄTYNI';
const SUBTITLE =
  'Cztery warstwy okrycia, złote haczyki jedności, czterdzieści osiem desek akacjowych na srebrnych podstawkach oraz zasłona oddzielająca Miejsce Święte od Najświętszego (Wj 26:1–37)';

const EXO26_PATH = path.join(REPO, 'data/bible/ubg-2025/EXO-026.json');
const exo26Data = JSON.parse(fs.readFileSync(EXO26_PATH, 'utf8'));
const verses = exo26Data.verses;

const v33 = verses.find((v) => v.number === 33)?.text || '';
const MEMORY_VERSE_QUOTE = v33.trim();
const MEMORY_VERSE = `„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 26:33 (UBG)`;

const THEME =
  'Dwudziesty szósty rozdział Księgi Wyjścia ukazuje architekturę Bożego Przybytku — świętego namiotu, który otacza Arkę Przymierza, stół chlebów pokładnych i złoty świecznik. Najpierw powstaje dziesięć wewnętrznych zasłon ze skręconego bisioru, błękitu, purpury i karmazynu z wyhaftowanymi cherubinami, spiętych pięćdziesięcioma złotymi haczykami, aby cały przybytek „stanowił jedną całość” (Wj 26:6). Ponad nimi spoczywają trzy warstwy ochronne: jedenaście zasłon z koziej sierści, skóry baranie farbowane na czerwono oraz zewnętrzne skóry borsucze (Wj 26:7–14) — zewnętrzna prostota skrywa niezwykłe królewskie piękno wnętrza! Konstrukcję tworzy czterdzieści osiem pionowych desek z drewna akacjowego pokrytych złotem, stojących na srebrnych podstawkach odkupienia i połączonych pięcioma drążkami, w tym środkowym przechodzącym przez całą długość ściany (Wj 26:15–30). Punktem kulminacyjnym rozdziału jest haftowana zasłona na czterech złotych słupach oddzielająca Miejsce Święte od Najświętszego (Wj 26:31–35) — ta sama zasłona, która w chwili śmierci Jezusa na Golgocie rozdarła się od góry aż do dołu (Mt 27:51; Hbr 10:19–20), otwierając nam żywą i nową drogę do Ojca!';

const IMG_FILENAME = 'kc_day_56_przybytek_zaslona_swiatyni.jpg';
const IMG_REL_PATH = `images/academy/daily/${IMG_FILENAME}`;
const IMG_CAPTION =
  'Ilustracja biblijna: Wnętrze Przybytku Mojżeszowego — haftowana zasłona z cherubinami na czterech złotych słupach, złocone deski akacjowe na srebrnych podstawkach i blask Szekiny z Miejsca Najświętszego — Wj 26:1–37';
const QUEUE_DIR = path.join(REPO, `kolejka-publikacji/kurs-codzienny/${DATE_STR}`);

const imgFullPath = path.join(REPO, IMG_REL_PATH);
if (!fs.existsSync(imgFullPath)) {
  throw new Error(`Brak wygenerowanej grafiki Dnia 56: ${imgFullPath}`);
}

function buildVersesParagraphsHtml() {
  const sections = [
    {
      heading:
        'KSIĘGA WYJŚCIA 26:1–6 — Dziesięć zasłon z bisioru, błękitu, purpury i karmazynu z cherubinami oraz pięćdziesiąt złotych haczyków jedności',
      from: 1,
      to: 6,
      extraClass: 'mb-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 26:7–14 — Jedenaście zasłon z koziej sierści, pięćdziesiąt miedzianych haczyków, skóry baranie czerwone i borsucze',
      from: 7,
      to: 14,
      extraClass: 'my-6 pt-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 26:15–30 — Prosto stojące deski z drewna akacjowego pokryte złotem, srebrne podstawki i drążki łączące według wzoru z góry',
      from: 15,
      to: 30,
      extraClass: 'my-6 pt-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 26:31–37 — Zasłona oddzielająca Miejsce Święte od Najświętszego, ustawienie sprzętów oraz zasłona wejścia do namiotu',
      from: 31,
      to: 37,
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
            `<p><span class="verse-num">26:${v.number}</span> ${v.text}</p>`
        )
        .join('\n        ');
      return `${header}\n        ${ps}`;
    })
    .join('\n        ');
}

function buildVersesDocxText() {
  return verses.map((v) => `${v.number}. ${v.text}`).join('\n');
}

// ── 1. PAKIET 5 WERSJI ROZWAŻAŃ ──
const v1TtsText = `☀️ Z Biblią za Pan Brat — Dzień Pięćdziesiąty Szósty

**Czy wiesz, że pod niepozornym, szarym okryciem pustynnego namiotu Bóg ukrył najpiękniejszy obraz jedności Kościoła i otwartej drogi do swojego tronu?**

Zatrzymaj się w ten środowy poranek, dwudziestego piątego listopada dwa tysiące dwudziestego szóstego roku. Kiedy patrzysz na swoje życie, na zbór albo na codzienną służbę w tym świecie, łatwo zniechęcić się tym, co widać z zewnątrz: zmęczeniem, skromnością i pustynnym kurzem. A jednak Bóg patrzy głębiej. W porannej ciszy zapytaj dziś swojego Ojca w niebie: Panie, czy potrafię dostrzec Twoje królewskie piękno i jedność tam, gdzie świat widzi tylko prosty namiot, i czy korzystam dziś śmiało z otwartej drogi do Miejsca Najświętszego?

W dwudziestym szóstym rozdziale Księgi Wyjścia Bóg opisuje Mojżeszowi całą budowlę Świętego Przybytku. Zaczyna od dziesięciu kosztownych zasłon ze skręconego bisioru, błękitnej tkaniny, purpury i karmazynu z wyhaftowanymi cherubinami, które spina pięćdziesiąt złotych haczyków, aby cały przybytek stanowił jedną całość. Nad nimi rozpościerają się trzy warstwy ochronne: jedenaście zasłon z koziej sierści, skóry baranie barwione na czerwono oraz wytrzymałe skóry borsucze chroniące przed pustynnym skwarem i burzą. Ściany tworzą pionowe deski z drewna akacjowego pokryte szczerym złotem, osadzone w srebrnych podstawkach i spięte drążkami — w tym jednym środkowym drążkiem biegnącym nieprzerwanie od końca do końca. A w samym sercu świątyni zawisa majestatyczna zasłona z cherubinami na czterech złotych słupach, oddzielająca Miejsce Święte od Najświętszego, gdzie spoczywa Arka Świadectwa z przebłagalnią.

Psychologia wspólnoty i architektura budowli uczą nas tej samej prawdy: pojedyncza deska na pustyni przewróci się przy pierwszym wietrze, ale czterdzieści osiem desek osadzonych na wspólnym fundamencie i połączonych niewidocznym środkowym drążkiem wytrzymuje każdą burzę. Prawdziwa odporność rodzi się z mocnego fundamentu i głębokiej jedności.

A w świetle Ewangelii każda część Przybytku wskazuje wprost na Jezusa Chrystusa! Na zewnątrz — jak proste skóry borsucze — Mesjasz nie miał okazałego wyglądu, który by nas pociągał, lecz w środku mieszkała w Nim cała pełnia bóstwa i królewskiej chwały! Czerwone skóry baranie zapowiadały Jego ofiarną krew, srebrne podstawki — cenę naszego odkupienia, a środkowy drążek łączący wszystkie deski — Ducha Świętego jednoczącego wierzących w jedno Ciało Chrystusa. A najważniejsze stało się na Golgocie: kiedy Jezus oddał życie na krzyżu, gruba zasłona świątyni rozdarła się od góry aż do dołu! List do Hebrajczyków mówi, że ta zasłona to Jego ciało — przez Niego mamy dziś śmiały, wolny dostęp do samego Ojca!

Jezus otwiera Ci dziś drogę w Słowie Bożym:
„Mając więc, bracia, śmiałość, aby przez krew Jezusa wejść do Miejsca Najświętszego, drogą nową i żywą, którą zapoczątkował dla nas przez zasłonę, to jest przez swoje ciało.” (List do Hebrajczyków, rozdział dziesiąty, wersety dziewiętnasty i dwudziesty, UBG)

Zadanie Taktyczne:
Wejdź dziś z odwagą i spokojem w modlitwie przed tron łaski przez otwartą zasłonę krzyża Jezusa. Zadbaj też o jeden konkretny gest jedności w domu lub wspólnocie — bądź jak złoty haczyk i środkowy drążek, który spina i umacnia innych, zamiast dzielić.

W Christian Culture aplikacje i portale są dla Ciebie zawsze bezpłatne.
Błogosławionej środy z Bogiem!`;

const v2WebText = `☀️ Z Biblią za Pan Brat — Dzień 56 (25.11.2026, Środa)
📖 Czytanie dnia: Księga Wyjścia 26:1–37 (UBG) — Zasłony Przybytku, Deski Akacjowe i Zasłona Świątyni

„A zasłonę zawiesisz na haczykach i wniesiesz za zasłonę arkę świadectwa, a ta zasłona będzie oddzielać wam Miejsce Święte od Najświętszego.” (Wj 26:33, UBG)

W 26. rozdziale Księgi Wyjścia Bóg odsłania pełną architekturę Świętego Przybytku:
• 10 wewnętrznych zasłon z bisioru, błękitu, purpury i karmazynu z cherubinami spiętych 50 złotymi haczykami — „aby przybytek stanowił jedną całość” (Wj 26:1–6),
• 3 zewnętrzne okrycia: 11 zasłon z koziej sierści, czerwone skóry baranie (obraz krwi ofiary) i wytrzymałe skóry borsucze (Wj 26:7–14),
• 48 desek akacjowych pokrytych złotem, stojących na 96 srebrnych podstawkach odkupienia i spiętych 5 drążkami (Wj 26:15–30),
• Haftowana zasłona na 4 złotych słupach oddzielająca Miejsce Święte od Najświętszego (Wj 26:31–35) — rozdarła się od góry do dołu w godzinie śmierci Jezusa (Mt 27:51; Hbr 10:19–20)!

📖 Pełna lekcja z komentarzem (45 punktów), kodami Stronga i quizem (20 pytań):
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-56

📜 Przeczytaj cały rozdział Wj 26 w MojaBiblia (UBG + interlinia):
👉 https://polskieradio.cc/mojabiblia?book=EXO&chapter=26

📻 Radio 24/7 i Biblia Audio: https://polskieradio.cc
💛 WspieramTO — Budujemy Dom + Studio CC: https://polskieradio.cc/wspieramto`;

const v3SmsText = `Z Biblia za Pan Brat - Dzien 56 (Wj 26:1-37): Zaslony Przybytku, zlote haczyki jednosci i zaslona Miejsca Najswietszego rozdarta na Golgocie (Hbr 10:19-20). Masz dzis otwarta droge do Ojca! Lekcja i quiz: polskieradio.cc/akademia/kurscodzienny/dzien-56`;

const v4VideoText = `[SCENARIUSZ TV / SHORTS 60s — DZIEŃ 56: ZASŁONA PRZYBYTKU (Wj 26:1–37)]
0–5s (HAK): Z zewnątrz wyglądał jak szary namiot ze skór. W środku lśniło szczere złoto i haftowane cherubiny!
5–25s (TREŚĆ): W Księdze Wyjścia 26 Bóg łączy 10 kosztownych zasłon 50 złotymi haczykami, by Przybytek był jedną całością. Stawia 48 złoconych desek na srebrnych podstawkach i zawiesza grubą zasłonę oddzielającą Miejsce Święte od Najświętszego.
25–45s (CHRYSTUS): Kiedy Jezus umarł na krzyżu, ta zasłona rozdarła się od góry do dołu (Mt 27:51)! List do Hebrajczyków 10:20 mówi wprost: zasłona to Jego ciało. Dziś droga do Ojca jest otwarta!
45–60s (CTA): Przeczytaj pełną lekcję Dnia 56 i rozwiąż 20 pytań quizu na polskieradio.cc/akademia!`;

const v5ArticleText = `# Zasłony Przybytku, Deski Akacjowe i Rozdarta Zasłona Świątyni (Wj 26:1–37)

Dwudziesty szósty rozdział Księgi Wyjścia to nie sucha lista pomiarów stolarskich, lecz jedna z najbogatszych chrystologicznych map Starego Testamentu. Pod prostym zewnętrznym okryciem ze skór borsuczych (Wj 26:14) kryło się wnętrze pełne błękitu, purpury, karmazynu, białego bisioru i szczerego złota.

Każdy detal zapowiadał Jezusa Chrystusa i Jego Kościół: pięćdziesiąt złotych haczyków jedności (Wj 26:6), dziewięćdziesiąt sześć srebrnych podstawek fundamentu odkupienia (Wj 26:19–25), środkowy drążek łączący wszystkie deski w jedną ścianę (Wj 26:28) oraz majestatyczna zasłona przed Arką Świadectwa (Wj 26:31–33). W chwili śmierci Jezusa zasłona świątyni rozdarła się od góry aż do dołu (Mt 27:51), otwierając wierzącym „drogę nową i żywą” do samego tronu łaski (Hbr 10:19–20).`;

const pakiet5wersji = `# PAKIET 5 WERSJI ROZWAŻAŃ — DZIEŃ ${DAY_NUM} (${DATE_STR})
## ${BOOK} ${READING} — ${TITLE}

---
### WERSJA 1: PORANNA TTS (Aplikacja / Radio)
${v1TtsText}

---
### WERSJA 2: CAŁODZIENNA WWW (WhatsApp / Facebook / LUMINA)
${v2WebText}

---
### WERSJA 3: WIECZORNA SMS
${v3SmsText}

---
### WERSJA 4: SKRYPT TV / SHORTS
${v4VideoText}

---
### WERSJA 5: ARTYKUŁ CCN NEWS
${v5ArticleText}
`;

// ── 2. QUIZ: 20 PYTAŃ Z WJ 26:1–37 (100% ZGODNE Z UBG) ──
const quizItems = [
  {
    q: '1. Z ilu wewnętrznych zasłon ze skręconego bisioru, błękitu, purpury i karmazynu miał powstać Przybytek (Wj 26:1)?',
    a: ['Z siedmiu zasłon', 'Z dziesięciu zasłon', 'Z dwunastu zasłon', 'Z dwudziestu zasłon'],
    c: 1,
  },
  {
    q: '2. Jakie postacie miały być wyhaftowane na dziesięciu wewnętrznych zasłonach Przybytku (Wj 26:1)?',
    a: ['Lwy pokolenia Judy', 'Palmy i granaty', 'Cherubiny', 'Dwanaście gwiazd'],
    c: 2,
  },
  {
    q: '3. Jakie były wymiary każdej z dziesięciu wewnętrznych zasłon Przybytku (Wj 26:2)?',
    a: ['28 łokci długości i 4 łokcie szerokości', '30 łokci długości i 4 łokcie szerokości', '20 łokci długości i 5 łokci szerokości', '10 łokci długości i 1,5 łokcia szerokości'],
    c: 0,
  },
  {
    q: '4. W jaki sposób były spięte dziesięć wewnętrznych zasłon (Wj 26:3)?',
    a: ['Wszystkie dziesięć w jednym pasie', 'Po dwie w pięciu pasach', 'Pięć zasłon razem i drugie pięć zasłon razem', 'Cztery zasłony i sześć zasłon'],
    c: 2,
  },
  {
    q: '5. Jakiego koloru miały być pętle na brzegach wewnętrznych zasłon (Wj 26:4)?',
    a: ['Karmazynowe', 'Błękitne', 'Białe z bisioru', 'Purpurowe'],
    c: 1,
  },
  {
    q: '6. Ile złotych haczyków łączyło dwie połowy wewnętrznych zasłon, aby Przybytek stanowił jedną całość (Wj 26:6)?',
    a: ['Dwunastu złotych haczyków', 'Czterdziestu złotych haczyków', 'Pięćdziesięciu złotych haczyków', 'Stu złotych haczyków'],
    c: 2,
  },
  {
    q: '7. Z jakiego materiału i w jakiej liczbie wykonano zasłony przykrywające Przybytek z wierzchu (Wj 26:7)?',
    a: ['Z wełny owczej — 10 zasłon', 'Z koziej sierści — 11 zasłon', 'Z lnu egipskiego — 12 zasłon', 'Ze skór cielęcych — 8 zasłon'],
    c: 1,
  },
  {
    q: '8. Jakie wymiary miała każda z jedenastu zasłon z koziej sierści (Wj 26:8)?',
    a: ['28 łokci długości i 4 łokcie szerokości', '30 łokci długości i 4 łokcie szerokości', '25 łokci długości i 5 łokci szerokości', '40 łokci długości i 3 łokcie szerokości'],
    c: 1,
  },
  {
    q: '9. Jakiego metalu użyto do wykonania pięćdziesięciu haczyków spinających namiot z koziej sierści (Wj 26:11)?',
    a: ['Złota', 'Srebra', 'Miedzi', 'Żelaza'],
    c: 2,
  },
  {
    q: '10. Jakie dwie zewnętrzne warstwy skórzane tworzyły najwyższe przykrycie namiotu (Wj 26:14)?',
    a: ['Skóry baranie farbowane na czerwono oraz skóry borsucze', 'Skóry lwie oraz skóry kozie', 'Skóry wielbłądzie oraz płótno', 'Skóry cielęce oraz skóry owcze'],
    c: 0,
  },
  {
    q: '11. Z jakiego drewna wykonano prosto stojące deski Przybytku (Wj 26:15)?',
    a: ['Z drewna cedrowego z Libanu', 'Z drewna oliwnego', 'Z drewna akacjowego', 'Z drewna cyprysowego'],
    c: 2,
  },
  {
    q: '12. Jakie wymiary miała każda pojedyncza deska Przybytku (Wj 26:16)?',
    a: ['10 łokci długości i półtora łokcia szerokości', '12 łokci długości i 2 łokcie szerokości', '8 łokci długości i 1 łokieć szerokości', '15 łokci długości i 2 łokcie szerokości'],
    c: 0,
  },
  {
    q: '13. Ile desek ustawiono na stronie południowej i ile na stronie północnej Przybytku (Wj 26:18, 20)?',
    a: ['Po 10 desek na każdą stronę', 'Po 15 desek na każdą stronę', 'Po 20 desek na każdą stronę', 'Po 25 desek na każdą stronę'],
    c: 2,
  },
  {
    q: '14. Z jakiego metalu wykonano podstawki pod wszystkie deski Przybytku (Wj 26:19, 21, 25)?',
    a: ['Ze złota', 'Ze srebra', 'Z miedzi', 'Z brązu i kamienia'],
    c: 1,
  },
  {
    q: '15. Ile łącznie desek stanowiło tylną (zachodnią) ścianę Przybytku wraz z dwiema deskami narożnymi (Wj 26:22–25)?',
    a: ['Sześć desek', 'Osiem desek (6 + 2 narożne) na 16 srebrnych podstawkach', 'Dziesięć desek', 'Dwanaście desek'],
    c: 1,
  },
  {
    q: '16. Co wyróżniało środkowy drążek z pięciu drążków akacjowych pokrywanych złotem (Wj 26:26–29)?',
    a: ['Był wykonany z czystego srebra', 'W połowie wysokości desek przechodził od jednego końca do drugiego', 'Wisiał na zewnątrz nad dachem namiotu', 'Służył wyłącznie do noszenia Arki'],
    c: 1,
  },
  {
    q: '17. Jakie słowa z Wj 26:30 przypominają o wierności Bożemu objawieniu przy wznoszeniu Przybytku?',
    a: ['„Wystawisz więc przybytek według wzoru, który ci ukazano na górze”', '„Zbudujesz go według uznania starszych Izraela”', '„Postawisz go na wzór świątyń Egiptu”', '„Możesz zmieniać jego wymiary w drodze”'],
    c: 0,
  },
  {
    q: '18. Na ilu słupach i jakich podstawkach zawieszono zasłonę oddzielającą Miejsce Święte od Najświętszego (Wj 26:31–32)?',
    a: ['Na pięciu słupach na miedzianych podstawkach', 'Na czterech złotych słupach akacjowych na czterech srebrnych podstawkach', 'Na dwóch złotych kolumnach na złotych podstawkach', 'Na sześciu słupach cedrowych'],
    c: 1,
  },
  {
    q: '19. Jak rozłożono sprzęty w Miejscu Świętym przed zasłoną według Wj 26:35?',
    a: ['Stół po stronie południowej, a świecznik po północnej', 'Stół po stronie północnej, a świecznik naprzeciw niego po stronie południowej', 'Oba sprzęty za zasłoną obok Arki', 'Oba sprzęty przy samym wejściu na wschodzie'],
    c: 1,
  },
  {
    q: '20. Na ilu słupach i jakich podstawkach zawieszono zasłonę u wejścia do namiotu (Wj 26:36–37)?',
    a: ['Na czterech słupach na srebrnych podstawkach', 'Na trzech słupach na złotych podstawkach', 'Na pięciu złotych słupach akacjowych na pięciu miedzianych podstawkach', 'Na siedmiu słupach bez podstawek'],
    c: 2,
  },
];

// ── 3. TEKST LEKCJI DO DOCX ──
const lessonDocxText = `Z BIBLIĄ ZA PAN BRAT — DZIEŃ ${DAY_NUM}
${DATE_FORMATTED}
${BOOK} • ${READING}
${TITLE}

WERSET PAMIĘCIOWY:
${MEMORY_VERSE}

MYŚL PRZEWODNIA:
${THEME}

TEKST PISMA ŚWIĘTEGO (UBG):
${buildVersesDocxText()}

PAKIET ROZWAŻAŃ (WERSJA PORANNA TTS):
${v1TtsText}

QUIZ (20 PYTAŃ Z WJ 26:1–37):
${quizItems.map((it) => `${it.q}\n   Poprawna odpowiedź: ${it.a[it.c]}`).join('\n')}
`;

const doc = new Document({
  sections: [
    {
      properties: {},
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: `Z Biblią za Pan Brat — Dzień ${DAY_NUM} (${DATE_STR}) • ${READING}`,
                  font: 'Calibri',
                  size: 18,
                  color: '718096',
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
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'Christian Culture • polskieradio.cc/akademia • Strona ',
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
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: `Z BIBLIĄ ZA PAN BRAT — DZIEŃ ${DAY_NUM}`,
              bold: true,
              font: 'Calibri',
              size: 36,
              color: '1A202C',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          border: {
            bottom: { color: 'C4A35A', space: 6, style: BorderStyle.SINGLE, size: 12 },
          },
          children: [
            new TextRun({
              text: `${DATE_FORMATTED} • ${BOOK} ${READING} — ${TITLE}`,
              bold: true,
              font: 'Calibri',
              size: 24,
              color: '8B6914',
            }),
          ],
        }),
        ...lessonDocxText
          .split('\n\n')
          .filter((b) => b.trim())
          .flatMap((block) =>
            block
              .split('\n')
              .filter((l) => l.trim())
              .map(
                (line) =>
                  new Paragraph({
                    spacing: { before: 70, after: 70 },
                    children: [
                      new TextRun({
                        text: line.trim(),
                        font: 'Calibri',
                        size: 22,
                        color: '2D3748',
                      }),
                    ],
                  })
              )
          ),
      ],
    },
  ],
});

const gdriveOutputsDir = 'H:/Mój dysk/OA - orkiestracja Agentowa/produkowane przez Agentów';
const docxOutDir = fs.existsSync(gdriveOutputsDir) ? gdriveOutputsDir : path.join(REPO, 'scripts/content');
const docxOutPath = path.join(docxOutDir, `Z_Biblia_za_Pan_Brat_Dzien_${DAY_NUM}_${DATE_STR}.docx`);
const docxBuffer = await Packer.toBuffer(doc);
fs.writeFileSync(docxOutPath, docxBuffer);
console.log(`✅ Zapisano plik DOCX: ${docxOutPath} (${docxBuffer.length} bajtów)`);

// ── 4. ZAPIS PAKIETU 5 WERSJI + SUROWEJ LEKCJI ──
fs.mkdirSync(path.join(REPO, 'scripts/content'), { recursive: true });
fs.writeFileSync(path.join(REPO, `scripts/content/pakiet-day${DAY_NUM}-5wersji.md`), pakiet5wersji, 'utf8');
fs.writeFileSync(path.join(REPO, `scripts/content/kc-day${DAY_NUM}-lesson.txt`), lessonDocxText, 'utf8');

// ── 5. BUDOWANIE PLIKU HTML LEKCJI (SZABLON DZIEŃ 55 = 21/21) ──
console.log('🌐 Generuję plik HTML lekcji Dnia 56 (4 ścieżki Clean URLs + kolejka)...');
const template55Path = path.join(REPO, 'akademia/kurscodzienny/dzien-55.html');
let html = fs.readFileSync(template55Path, 'utf8');

// 5.1 Meta, tytuły i social share
html = html.replace(
  /<title>Dzień 55: [^<]+<\/title>/,
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
  /kc_day_55_swiatynia_arka_swiecznik\.jpg(\?v=\d+)?/g,
  `${IMG_FILENAME}?v=20261125`
);

html = html.replace(/kurscodzienny%2Fdzien-55/g, `kurscodzienny%2Fdzien-${DAY_NUM}`);
html = html.replace(
  /Z%20Bibli%C4%85%20za%20Pan%20Brat%20%E2%80%94%20Dzie%C5%84%2055[^"']+/g,
  encodeURIComponent(`Z Biblią za Pan Brat — Dzień ${DAY_NUM}: ${TITLE} (${READING})`)
);
html = html.replace(
  /Jedno kliknięcie może przynieść światło Bożej obecności, pokój Przebłagalni i pokarm Chleba Życia komuś, kto dziś szczególnie tego potrzebuje\./,
  'Jedno kliknięcie może przynieść pokój otwartej drogi do Ojca i światło jedności w Chrystusie komuś, kto dziś szczególnie tego potrzebuje.'
);

// 5.2 Nawigacja i okruszki
html = html.replace(
  /<span class="text-amber-400 font-semibold">Dzień 55<\/span>/,
  `<span class="text-amber-400 font-semibold">Dzień ${DAY_NUM}</span>`
);

const nav55Regex =
  /<a href="\/akademia\/kurscodzienny\/dzien-54"[\s\S]*?<\/a>\s*<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50[\s\S]*?<\/span>\s*<\/span>/;
const nav56Block = `<a href="/akademia/kurscodzienny/dzien-55" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 55</span>
        </a>
        <span class="px-3 py-1.5 rounded-lg bg-zinc-900/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 57 (Czwartek) →</span>
        </span>`;
if (!nav55Regex.test(html)) {
  throw new Error('Nie znaleziono bloku nawigacji Dnia 55 w szablonie');
}
html = html.replace(nav55Regex, nav56Block);

// 5.3 Hero i grafika
html = html.replace(/<span>Dzień 55 z 2009<\/span>/g, `<span>Dzień ${DAY_NUM} z 2009</span>`);
html = html.replace(/24 LISTOPADA 2026 • WTOREK/g, DATE_SHORT_UPPER);
html = html.replace(
  /<h1 class="[^"]+">[\s\S]*?<\/h1>/,
  `<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">\n        ${TITLE}\n      </h1>`
);
html = html.replace(
  /<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">[\s\S]*?<\/p>/,
  `<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">\n        ${SUBTITLE}\n      </p>`
);
html = html.replace(
  /alt="Dzień 55:[^"]*"/,
  `alt="Dzień ${DAY_NUM}: ${TITLE} (${READING})"`
);
html = html.replace(
  /<span>Ilustracja biblijna:[^<]*<\/span>/,
  `<span>${IMG_CAPTION}</span>`
);
html = html.replace(/Czytanie: Wj 25:1–40/g, `Czytanie: ${READING}`);

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
          <p class="text-xs text-zinc-400 font-semibold">— Księga Wyjścia 26:33 (UBG)</p>
        </div>
        <button
          onclick="navigator.clipboard.writeText('„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 26:33 (UBG)'); this.innerHTML = '<i class=\\'fa-solid fa-check\\'></i> Skopiowano'; setTimeout(() => this.innerHTML = '<i class=\\'fa-regular fa-copy\\'></i> Kopiuj', 2000);"
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
  `<!-- LESSON BODY CONTENT (Dzień ${DAY_NUM}, 25.11.2026) -->`
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
            Dziś jest <strong class="text-white">Dzień 56</strong>: Księga Wyjścia, <strong class="text-brand-gold">${READING}</strong>. Po świętych sprzętach z Wj 25 poznajemy dziś architekturę samego Przybytku: cztery warstwy okrycia, pięćdziesiąt złotych haczyków jedności, czterdzieści osiem złoconych desek akacjowych na srebrnych podstawkach oraz majestatyczną zasłonę oddzielającą Miejsce Święte od Najświętszego.
          </p>
          <p>
            Zanim przejdziesz do komentarza, przeczytaj spokojnie wszystkie trzydzieści siedem wersetów w przekładzie UBG. Zwróć uwagę na powtarzającą się frazę „aby stanowił jedną całość” (Wj 26:6, 11) oraz na zasłonę z wersetu 33, która w Ewangelii rozdarła się na dwoje, otwierając nam żywą drogę do Ojca (Mt 27:51; Hbr 10:20).
          </p>
          <a href="/mojabiblia?book=EXO&chapter=26" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]"><i class="fa-solid fa-book-open"></i><span>Czytaj ${READING}</span></a>
        </div>
      </article>`
);

// 5.6 Tekst Pisma Świętego
html = html.replace(/<!-- SCRIPTURE SECTION[^>]*-->/, `<!-- SCRIPTURE SECTION (${READING}) -->`);
html = html.replace(/Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 25:1–40/g, `Uwspółcześniona Biblia Gdańska (UBG) • ${READING}`);
html = html.replace(/\/mojabiblia\?book=EXO&chapter=25/g, `/mojabiblia?book=EXO&chapter=26`);
html = html.replace(/\/mojabiblia\?book=EXO&amp;chapter=25/g, `/mojabiblia?book=EXO&amp;chapter=26`);
html = html.replace(
  /<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>\s*<!-- KLUCZE JĘZYKOWE/,
  `<div class="kc-prose-reading">\n        ${buildVersesParagraphsHtml()}\n        </div>\n      </section>\n\n      <!-- KLUCZE JĘZYKOWE`
);

// 5.7 Klucze Językowe & Kody Stronga
const strongChips56 = `<span class="strong-chip"><span class="strong-id">H3407</span> <span class="strong-orig">יְרִיעָה (Jeriah)</span> — tkanina, zasłona namiotowa z bisioru, błękitu, purpury i karmazynu (Wj 26:1)</span>
          <span class="strong-chip"><span class="strong-id">H7165</span> <span class="strong-orig">קֶרֶס (Keres)</span> — złoty lub miedziany haczyk spinający zasłony w jedną całość (Wj 26:6, 11)</span>
          <span class="strong-chip"><span class="strong-id">H259</span> <span class="strong-orig">אֶחָד (Echad)</span> — jeden, stanowiący zjednoczoną całość — cel spięcia Przybytku (Wj 26:6, 11)</span>
          <span class="strong-chip"><span class="strong-id">H8476</span> <span class="strong-orig">תַּחַשׁ (Tachasz)</span> — wytrzymała skóra zewnętrzna (UBG: „skóry borsucze”) chroniąca namiot (Wj 26:14)</span>
          <span class="strong-chip"><span class="strong-id">H7175</span> <span class="strong-orig">קֶרֶשׁ (Keresz)</span> — pionowa deska konstrukcyjna z drewna akacjowego pokrytego złotem (Wj 26:15)</span>
          <span class="strong-chip"><span class="strong-id">H134</span> <span class="strong-orig">אֶדֶן (Eden / Adanim)</span> — srebrna lub miedziana podstawka fundamentowa pod deski i słupy (Wj 26:19, 37)</span>
          <span class="strong-chip"><span class="strong-id">H1280</span> <span class="strong-orig">בְּרִיחַ (Beriach)</span> — poprzeczny drążek spinający deski, w tym środkowy od końca do końca (Wj 26:26–28)</span>
          <span class="strong-chip"><span class="strong-id">H6532</span> <span class="strong-orig">פָּרֹכֶת (Parochet)</span> — zasłona oddzielająca Miejsce Święte od Najświętszego (Wj 26:31–35)</span>`;

html = html.replace(/Klucze Językowe &amp; Kody Stronga \(Wj 25:1–40\)/g, `Klucze Językowe &amp; Kody Stronga (${READING})`);
html = html.replace(
  /Poniższe terminy hebrajskie tworzą osnowę teologiczną 25\. rozdziału Księgi Wyjścia[\s\S]*?<\/p>/,
  `Poniższe terminy hebrajskie tworzą osnowę teologiczną 26. rozdziału Księgi Wyjścia (zasłony Przybytku, haczyki jedności, zewnętrzne okrycia, złocone deski akacjowe na srebrnych podstawkach, środkowy drążek oraz zasłona Parochet):</p>`
);
html = html.replace(
  /<div class="flex flex-wrap gap-2">[\s\S]*?<\/div>\s*<\/section>\s*<!-- THEOLOGICAL EXEGESIS/,
  `<div class="flex flex-wrap gap-2">\n          ${strongChips56}\n        </div>\n      </section>\n\n      <!-- THEOLOGICAL EXEGESIS`
);

// 5.8 Egzegeza (5 części, 45 punktów)
html = html.replace(
  /Pięć części studium Wj 25:1–40 \(45 punktów analitycznych\)/g,
  `Pięć części studium ${READING} (45 punktów analitycznych)`
);

const exegesis56 = `<!-- CZĘŚĆ I -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
            DZIESIĘĆ ZASŁON Z BISIORU I ZŁOTE HACZYKI JEDNOŚCI (WJ 26:1–6)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>1. Pierwsza warstwa — piękno widziane od środka (26:1):</strong> Wnętrze Przybytku zdobiło dziesięć artystycznie tkanych zasłon widocznych tylko dla kapłanów wchodzących przed oblicze Boga.</p>
            <p><strong>2. Cztery barwy Chrystusa (26:1):</strong> Skręcony bisior (sprawiedliwość), błękit (niebiańskie pochodzenie), purpura (królewskość) i karmazyn (krew ofiary).</p>
            <p><strong>3. Wyhaftowane cherubiny nad głowami kapłanów (26:1):</strong> Przypomnienie o niebiańskim zgromadzeniu aniołów otaczających tron Boży (Hbr 12:22).</p>
            <p><strong>4. Jednolite wymiary 28 × 4 łokcie (26:2):</strong> Pełna harmonia i porządek w Bożym projekcie — nic przypadkowego ani niedbałego.</p>
            <p><strong>5. Dwie połowy po pięć zasłon (26:3):</strong> Pięć zasłon spiętych razem i drugie pięć razem — gotowe do połączenia w jeden święty dach.</p>
            <p><strong>6. Pięćdziesiąt błękitnych pętli po każdej stronie (26:4–5):</strong> Niebieskie więzy spajające dwie części — jak miłość niebiańska jednocząca Kościół.</p>
            <p><strong>7. Pięćdziesiąt złotych haczyków jedności (26:6):</strong> Boskie spoiwo łączące dwie połowy w jeden organizm.</p>
            <p><strong>8. „I tak przybytek będzie stanowił jedną całość” (26:6):</strong> Słowo <em>echad</em> podkreśla, że mimo wielu elementów Boży dom jest jeden (J 17:21; Ef 4:3–6).</p>
            <p><strong>9. Jedność bez utraty różnorodności (26:1–6):</strong> Dziesięć tkanin zachowuje swoją rolę, lecz każda służy wspólnej chwale Bożej.</p>
          </div>
        </div>

        <!-- CZĘŚĆ II -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
            TRZY WARSTWY OCHRONNE: KOZIA SIERŚĆ, CZERWONE SKÓRY BARANIE I BORSUCZE (WJ 26:7–14)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>10. Jedenaście zasłon z koziej sierści (26:7):</strong> Druga warstwa — gęsta, ciemna tkanina namiotowa, jak ofiara kozła za grzech w Dzień Pojednania (Kpł 16).</p>
            <p><strong>11. Długość 30 łokci — pełne zakrycie (26:8, 12–13):</strong> Zasłony z koziej sierści były dłuższe o dwa łokcie, aby dokładnie osłonić wewnętrzne piękno ze wszystkich stron.</p>
            <p><strong>12. Podział 5 + 6 zasłon i złożona szósta z przodu (26:9):</strong> Podwójna osłona frontu wejściowego chroniąca przed słońcem i wiatrem pustyni.</p>
            <p><strong>13. Pięćdziesiąt miedzianych haczyków (26:10–11):</strong> Miedź w symbolice świątyni oznacza wytrwałość w ogniu sądu nad grzechem poniesionego przez Chrystusa.</p>
            <p><strong>14. Drugi raz: „aby stanowił jedną całość” (26:11):</strong> Nawet zewnętrzna osłona musi być szczelnie zjednoczona, by nie przepuścić burzy.</p>
            <p><strong>15. Skóry baranie farbowane na czerwono (26:14):</strong> Trzecia warstwa — wyrazisty obraz baranka ofiarnego i krwi przelanej za grzechy świata (J 1:29).</p>
            <p><strong>16. Skóry borsucze (hebr. <em>tachasz</em>) na samym wierzchu (26:14):</strong> Czwarta, zewnętrzna warstwa — niepozorna, szara i niezwykle odporna na deszcz, piasek i skwar.</p>
            <p><strong>17. Kontrast między wyglądem zewnętrznym a wnętrzem (26:14; Iz 53:2):</strong> Świat widział w Jezusie prostego Cieślę bez okazałości, a wierzący oglądali w Nim chwałę Jednorodzonego od Ojca (J 1:14).</p>
            <p><strong>18. Czterowarstwowa tarcza Bożej opieki (26:1–14):</strong> Boża obecność w sercu wierzącego jest bezpiecznie strzeżona w każdych warunkach pustyni.</p>
          </div>
        </div>

        <!-- CZĘŚĆ III -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
            CZTERDZIEŚCI OSIEM DESEK AKACJOWYCH, SREBRNE PODSTAWKI I DRĄŻKI (WJ 26:15–30)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>19. Prosto stojące deski z drewna akacjowego (26:15):</strong> Niezniszczalne drewno pustynne ukazujące wierzących postawionych prosto w Chrystusie (Ef 2:21–22).</p>
            <p><strong>20. Wymiary 10 × 1,5 łokcia (26:16):</strong> Około 4,5 metra wysokości — majestatyczna, lecz przenośna ściana wędrującej świątyni.</p>
            <p><strong>21. Dwa czopy w każdej desce (26:17):</strong> Podwójne zakotwiczenie chroniące każdą deskę przed zachwianiem i skręceniem.</p>
            <p><strong>22. 20 desek na południu, 20 na północy, 6 + 2 narożne na zachodzie (26:18–25):</strong> Łącznie 48 desek tworzących prostokątny zarys Przybytku (30 × 10 łokci).</p>
            <p><strong>23. 96 srebrnych podstawek fundamentowych (26:19, 21, 25):</strong> Srebro pochodziło z półszeklowego okupu odkupienia (Wj 30:12–16; 38:27) — Kościół stoi wyłącznie na fundamencie odkupienia!</p>
            <p><strong>24. Dwie deski narożne złączone u dołu i u góry (26:23–24):</strong> Wzmocnienie narożników zapewnia stabilność całej konstrukcji w czasie burzy.</p>
            <p><strong>25. Pięć drążków na każdą z trzech ścian (26:26–27):</strong> Poprzeczne więzy trzymające wszystkie pojedyncze deski ramię przy ramieniu.</p>
            <p><strong>26. Środkowy drążek przechodzący od końca do końca (26:28):</strong> Niewidoczny z zewnątrz, biegnący w samym sercu desek — piękny obraz Ducha Świętego jednoczącego wierzących.</p>
            <p><strong>27. Złote pokrycie desek, drążków i pierścieni (26:29):</strong> Nasze ziemskie człowieczeństwo zostaje przyodziane sprawiedliwością i chwałą Chrystusa (Rz 13:14).</p>
            <p><strong>28. Ponowny nakaz wierności wzorowi (26:30):</strong> „Wystawisz więc przybytek według wzoru, który ci ukazano na górze” — zero samowoli w Bożym domu.</p>
          </div>
        </div>

        <!-- CZĘŚĆ IV -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
            ZASŁONA MIEJSCA NAJŚWIĘTSZEGO, PORZĄDEK SPRZĘTÓW I WEJŚCIE DO NAMIOTU (WJ 26:31–37)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>29. Zasłona <em>Parochet</em> w czterech królewskich barwach z cherubinami (26:31):</strong> Najbardziej uroczysta tkanina Przybytku strzegąca tronu Bożej chwały.</p>
            <p><strong>30. Cztery złote słupy na czterech srebrnych podstawkach (26:32):</strong> Cztery filary podtrzymujące zasłonę (jak cztery Ewangelie ukazujące ciało i ofiarę Chrystusa).</p>
            <p><strong>31. Oddzielenie Miejsca Świętego od Najświętszego (26:33):</strong> Przypomnienie, że grzech oddziela człowieka od świętego Boga, dopóki nie nastąpi pełne pojednanie (Hbr 9:8).</p>
            <p><strong>32. Arka Świadectwa z przebłagalnią za zasłoną (26:33–34):</strong> Samo serce świątyni — Boże Prawo pod złotym tronem łaski.</p>
            <p><strong>33. Stół chlebów pokładnych po stronie północnej (26:35):</strong> Pokarm Słowa Bożego ustawiony na prawo od wchodzącego kapłana.</p>
            <p><strong>34. Złoty świecznik po stronie południowej naprzeciw stołu (26:35):</strong> Światło Ducha Świętego padające prosto na chleby pokładne — Słowo rozumie się wyłącznie w świetle Ducha!</p>
            <p><strong>35. Haftowana zasłona wejścia do namiotu (26:36):</strong> Jedna szeroka brama wschodnia bez wyhaftowanych cherubinów — otwarte zaproszenie do społeczności (J 10:9).</p>
            <p><strong>36. Pięć złotych słupów na pięciu miedzianych podstawkach (26:37):</strong> Wejście do świątyni prowadzi obok miedzianego ołtarza ofiarnego — najpierw krzyż i przebaczenie, potem społeczność Miejsca Świętego.</p>
          </div>
        </div>

        <!-- CZĘŚĆ V -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">V</span>
            ROZDARTA ZASŁONA GOLGOTY, EKLEZJOLOGIA I KLUCZE JĘZYKOWE (WJ 26:1–37)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>37. Rozdarcie zasłony od góry aż do dołu (Mt 27:51; Mk 15:38):</strong> Bóg sam, nie człowiek, otworzył drogę do Miejsca Najświętszego w chwili śmierci Jezusa!</p>
            <p><strong>38. Zasłona jako ciało Chrystusa (Hbr 10:19–20):</strong> Przez złamane ciało i krew Jezusa mamy śmiały wstęp przed tron Ojca.</p>
            <p><strong>39. Kościół jako żywa budowla z desek na srebrze odkupienia (Ef 2:20–22; 1 P 2:5):</strong> Nikt nie stoi samotnie — każdy potrzebuje fundamentu odkupienia i spoiwa Ducha.</p>
            <p><strong>40. Światło świecznika nad stołem Słowa (26:35):</strong> Bez modlitwy o oświecenie Ducha Świętego lektura Biblii pozostaje w półmroku.</p>
            <p><strong>41. <em>Jeriah</em> (יְרִיעָה):</strong> Kosztowna tkanina Bożej chwały okrywająca od wewnątrz miejsce spotkania.</p>
            <p><strong>42. <em>Echad</em> (אֶחָד):</strong> Złożona, żywa jedność wielu elementów złączonych w jeden Przybytek.</p>
            <p><strong>43. <em>Adanim</em> (אֲדָנִים):</strong> Srebrne podstawki okupu — niezachwiany fundament łaski pod naszymi stopami.</p>
            <p><strong>44. <em>Beriach</em> (בְּרִיחַ):</strong> Środkowy drążek Ducha Świętego spajający wszystkie deski od końca do końca.</p>
            <p><strong>45. <em>Parochet</em> (פָּרֹכֶת):</strong> Święta zasłona, która na krzyżu Golgoty zamieniła barierę oddzielenia w otwartą bramę łaski!</p>
          </div>
        </div>`;

html = html.replace(
  /<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── JEZUS W CENTRUM ── -->/,
  `<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">\n        ${exegesis56}\n        </div>\n      </section>\n\n      <!-- ── JEZUS W CENTRUM ── -->`
);

// 5.9 Jezus w Centrum
const jesus56 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Rozdarta Zasłona Drogi do Ojca, Skryte Piękno Wcielenia i Fundament Jedności Kościoła
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            <strong>1. Jezus Chrystus — rozdarta Zasłona otwierająca Miejsce Najświętsze (Wj 26:31–33; Mateusza 27:51; Hebrajczyków 10:19–20):</strong> Przez wieki zasłona <em>Parochet</em> mówiła, że grzeszny człowiek nie może sam wejść przed świętego Boga. W chwili śmierci Pana Jezusa zasłona świątyni rozdarła się od góry aż do dołu — a List do Hebrajczyków wyjaśnia wprost, że „drogą nową i żywą, którą zapoczątkował dla nas przez zasłonę, to jest przez swoje ciało” mamy dziś śmiały dostęp do Ojca!
          </p>
          <p>
            <strong>2. Jezus Chrystus — niepozorny z zewnątrz, chwalebny wewnątrz (Wj 26:1, 14; Izajasza 53:2; Kolosan 2:9):</strong> Z zewnątrz Przybytek okrywały proste skóry borsucze, a w środku lśniło złoto, błękit, purpura i karmazyn. Tak samo Mesjasz przyszedł w pokorze ludzkiego ciała, lecz w Nim zamieszkała cieleśnie cała pełnia bóstwa!
          </p>
          <p>
            <strong>3. Jezus Chrystus — czerwone skóry baranie i srebrne podstawki okupu (Wj 26:14, 19–25; 1 Piotra 1:18–19):</strong> Każda ze ścian Przybytku spoczywała na srebrnych podstawkach odkupienia, a ponad nimi leżały czerwone skóry baranie — obraz przelanej krwi Baranka Bożego, na której stoi bezpiecznie cały Kościół.
          </p>
          <p>
            <strong>4. Jezus Chrystus — Jedina Brama do Miejsca Świętego (Wj 26:36–37; Ewangelia Jana 10:9; 14:6):</strong> Przybytek miał tylko jedno wejście od wschodu, zawieszone na pięciu słupach. Jezus powiedział jasno: „Ja jestem drzwiami; jeśli ktoś wejdzie przeze mnie, będzie zbawiony”.
          </p>
          <p>
            <strong>5. Jezus Chrystus — Duch Jedności spajający żywe deski (Wj 26:6, 26–29; Efezjan 2:20–22; 4:3–6):</strong> Jak złote haczyki i środkowy drążek łączyły dziesięć zasłon i czterdzieści osiem desek w „jedną całość”, tak Chrystus przez Ducha Świętego buduje z wierzących jedno święte mieszkanie Boga!
          </p>
          <div class="pt-2">
            <a href="/mojabiblia?book=EXO&chapter=26" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
              <i class="fa-solid fa-book-open"></i>
              <span>Czytaj ${READING}</span>
            </a>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── JEZUS W CENTRUM ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-cross"><\/i>\s*<span>Jezus w centrum<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── SPRAWDŹ W BIBLII ── -->)/,
  `$1${jesus56}\n      $2`
);

// 5.10 Sprawdź w Biblii (12 wersetów porównawczych)
const compare56 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Sprawdź w Biblii — 12 Wersetów Porównawczych (${READING})
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300 font-serif">
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 26:1 → Księga Wyjścia 36:8; Efezjan 3:10</strong>: Dlaczego na wewnętrznych zasłonach wyhaftowano cherubiny?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 26:6, 11 → Ewangelia Jana 17:21; Efezjan 4:3–6</strong>: Co oznacza cel Bożej budowy: „aby stanowił jedną całość”?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 26:7–13 → Kapłańska 16:15; Izajasza 4:5–6</strong>: W jaki sposób zasłony z koziej sierści okrywały i chroniły Przybytek?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 26:14 → Izajasza 53:2–3; Filipian 2:6–8</strong>: Jak zewnętrzna prostota skór borsuczych zapowiadała pokorę Wcielenia?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 26:15–17 → Efezjan 2:19–22; 1 Piotra 2:5</strong>: Jak pionowe deski akacjowe ilustrują wierzących budowanych w Chrystusie?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 26:19–25 → Księga Wyjścia 30:12–16; 38:27</strong>: Skąd pochodziło srebro na 96 podstawek fundamentowych Przybytku?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 26:26–29 → 1 Koryntian 12:12–13; Kolosan 3:14</strong>: Co symbolizuje środkowy drążek przechodzący przez wszystkie deski?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 26:30 → List do Hebrajczyków 8:5; Dzieje 7:44</strong>: Dlaczego Mojżesz musiał ściśle trzymać się wzoru z góry Synaj?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 26:31–33 → Mateusza 27:51; Marka 15:38</strong>: Co wydarzyło się z zasłoną świątyni w godzinie śmierci Jezusa?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 26:33 → List do Hebrajczyków 9:7–8; 10:19–20</strong>: Dlaczego przez ciało Jezusa mamy dziś śmiałość wejść do Miejsca Najświętszego?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 26:35 → Psalm 119:105; 1 Koryntian 2:12–14</strong>: Dlaczego świecznik stał dokładnie naprzeciw stołu chlebów pokładnych?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 26:36–37 → Ewangelia Jana 10:9; 14:6</strong>: Dlaczego do całego Przybytku prowadziło tylko jedno wejście?</div>
        </div>`;

html = html.replace(
  /(<!-- ── SPRAWDŹ W BIBLII ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-magnifying-glass"><\/i>\s*<span>Porównaj wersety we własnym Piśmie Świętym<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── PRAWDA NA DZIŚ ── -->)/,
  `$1${compare56}\n      $2`
);

// 5.11 Prawda na dziś
const truth56 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          8 Zasad Jedności, Fundamentu Odkupienia i Otwartej Zasłony — co zmienia się w moim patrzeniu
        </h3>
        <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>• <strong>1. Droga do Ojca jest dla mnie całkowicie otwarta:</strong> Zasłona oddzielenia rozdarła się na Golgocie — wchodzę przed tron łaski śmiało przez krew Jezusa.</p>
          <p>• <strong>2. Nie oceniam Bożego dzieła po skromnym wyglądzie zewnętrznym:</strong> Pod prostym okryciem ze skór borsuczych Bóg ukrywa królewskie piękno swojej chwały.</p>
          <p>• <strong>3. Moje życie stoi na srebrnych podstawkach odkupienia:</strong> Moją stabilnością w burzy nie są własne zasługi, lecz cena zapłacona przez Chrystusa.</p>
          <p>• <strong>4. Nie jestem samotną deską na pustyni:</strong> Potrzebuję wspólnoty wierzących i niewidocznego środkowego drążka Ducha Świętego, by ustać w próbie.</p>
          <p>• <strong>5. Buduję jedność, a nie podziały:</strong> Moje słowa i postawa mają działać jak złote haczyki spinające Boży dom w jedną całość.</p>
          <p>• <strong>6. Czytam Pismo Święte w świetle Ducha Świętego:</strong> Jak świecznik oświetlał stół chlebów pokładnych, tak Duch czyni Słowo żywym pokarmem.</p>
          <p>• <strong>7. Do społeczności z Bogiem prowadzi jedna brama — Jezus:</strong> Nie szukam pobocznych ścieżek religijnych, lecz wchodzę przez jedyne drzwi zbawienia.</p>
          <p>• <strong>8. Buduję życie wiernie według wzoru z góry:</strong> Wybieram posłuszeństwo objawieniu Biblii ponad wygodę i doraźne kompromisy.</p>
        </div>`;

html = html.replace(
  /(<!-- ── PRAWDA NA DZIŚ ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-lightbulb"><\/i>\s*<span>Prawda na dziś<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── POMYŚL ── -->)/,
  `$1${truth56}\n      $2`
);

// 5.12 Pomyśl
const questions56 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Refleksja Osobista — Spójrz w Światło Słowa (${READING})
        </h3>
        <div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>1. Czy korzystasz na co dzień ze śmiałego dostępu do Ojca przez rozdartą zasłonę krzyża, czy wciąż zatrzymujesz się z lękiem na progu?</p>
          <p>2. Czy zdarza Ci się zniechęcać prostotą lub brakiem „zewnętrznego blasku” w życiu wiary, zapominając o królewskim pięknie ukrytym wewnątrz?</p>
          <p>3. Na czym opierasz swoje poczucie bezpieczeństwa w trudnych dniach — na kruchym piasku własnych sił, czy na srebrnych podstawkach odkupienia?</p>
          <p>4. W jakiej relacji w domu lub wspólnocie możesz dziś zadziałać jak „złoty haczyk” jedności, łącząc zamiast dzielić?</p>
          <p>5. Czy pozwalasz Duchowi Świętemu (środkowemu drążkowi Przybytku) scalać Twoje serce z innymi wierzącymi mimo różnic charakterów?</p>
          <p>6. Czy przed otwarciem Biblii prosisz o światło „złotego świecznika” Ducha Świętego, aby Słowo naprawdę nakarmiło Twoją duszę?</p>
          <p>7. Jakie obszary Twojego tygodnia wymagają dziś powrotu do wierności „wzorowi ukazanemu na górze” Pisma Świętego?</p>
          <p>8. Komu z Twojego otoczenia możesz dziś przypomnieć, że brama do Bożej łaski w Jezusie Chrystusie stoi szeroko otwarta?</p>
        </div>`;

html = html.replace(
  /(<!-- ── POMYŚL ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-heart"><\/i>\s*<span>Pytania do serca \(Pomyśl\)<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── QUIZ ── -->)/,
  `$1${questions56}\n      $2`
);

// 5.13 Quiz nagłówek
html = html.replace(/20 Pytań z Wj 25 \(Sprawdź swoją wiedzę\)/g, `20 Pytań z Wj 26 (Sprawdź swoją wiedzę)`);
html = html.replace(/Po przeczytaniu Wj 25/g, `Po przeczytaniu Wj 26`);

// 5.14 Twoja decyzja
const decision56 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Wejdź Śmiało przez Rozdartą Zasłonę i Buduj Jedność Domu Bożego!
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            Dwudziesty szósty rozdział Księgi Wyjścia pokazuje, jak precyzyjnie Bóg zadbał o jedność, trwałość i świętość swojego Przybytku — aż po zasłonę oddzielającą Miejsce Święte od Najświętszego. Na Golgocie Bóg sam rozdarł tę zasłonę od góry aż do dołu, abyś mógł dziś bez lęku przyjść przed tron łaski!
          </p>
          <p>
            Podejmij dziś świadomą decyzję: oprzyj swój dzień na srebrnych podstawkach odkupienia w Chrystusie, wejdź śmiało w modlitwie za rozdartą zasłonę i bądź narzędziem jedności pośród ludzi, których Bóg postawił obok Ciebie!
          </p>
          <div class="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-black/40 to-transparent border border-brand-gold/40">
            <h4 class="font-bold text-amber-300 mb-2 uppercase tracking-wide text-xs">Moja Decyzja — Osobiste Wyznanie:</h4>
            <p class="italic text-white">
              „Panie Jezu Chryste, dziękuję Ci, że przez Twoje ciało i krew rozdarła się zasłona oddzielenia i mam dziś wolną, żywą drogę do Ojca. Stawiam całe moje życie na fundamencie Twojego odkupienia, proszę o światło Ducha Świętego nad Twoim Słowem i decyduję się dziś budować jedność, pokój i wierność w moim domu i wspólnocie.”
            </p>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── TWOJA DECYZJA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-flag-checkered"><\/i>\s*<span>Twoja decyzja<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── MODLITWA ── -->)/,
  `$1${decision56}\n      $2`
);

// 5.15 Modlitwa
html = html.replace(/<span>Modlitwa na 24 listopada<\/span>/g, `<span>Modlitwa na 25 listopada</span>`);
const prayer56 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Modlitwa o Śmiałość Przed Tronem Łaski, Jedność Ducha i Trwałość Fundamentu
        </h3>
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed space-y-3">
          <p>
            Święty Ojcze w niebie, Architekcie naszego zbawienia! Dziękujemy Ci za dwudziesty szósty rozdział Księgi Wyjścia i za cudowny obraz Przybytku, w którym każdy haczyk, każda deska i każda srebrna podstawka mówią o Twojej trosce, jedności i odkupieniu.
          </p>
          <p>
            Dziękujemy Ci ponad wszystko za Twojego Syna, Jezusa Chrystusa — za rozdartą na Golgocie zasłonę, przez którą otworzyłeś nam nową i żywą drogę do Miejsca Najświętszego! Przepraszamy za chwile zwątpienia, za budowanie na własnych siłach i za słowa, które zamiast łączyć, dzieliły naszych bliskich.
          </p>
          <p>
            Umocnij nas dziś na fundamencie Twojego odkupienia, połącz nasze serca niewidocznym drążkiem Ducha Świętego i oświecaj nasze czytanie Pisma Świętego blaskiem złotego świecznika przez całą tę środę. W imieniu Jezusa Chrystusa, Amen!
          </p>
        </div>`;

html = html.replace(
  /(<!-- ── MODLITWA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-hands-praying"><\/i>\s*<span>Modlitwa na [^<]+<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── ZASTOSOWANIE I TWÓJ ZAPIS)/,
  `$1${prayer56}\n      $2`
);

// 5.16 Zadania na dziś (7 zadań)
const tasks56 = `<label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-1" onchange="toggleTaskState(1)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>1. Przeczytaj cały fragment <a href="/mojabiblia?book=EXO&chapter=26" class="text-amber-300 underline font-semibold">Wj 26:1–37</a> w przekładzie UBG oraz List do Hebrajczyków 10:19–25.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-2" onchange="toggleTaskState(2)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>2. Zapamiętaj werset Wj 26:33 i podziękuj Jezusowi za rozdartą zasłonę na Golgocie (Mt 27:51), która otworzyła Ci drogę do Ojca.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-3" onchange="toggleTaskState(3)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>3. Zrób dziś jeden konkretny gest jedności („złoty haczyk” z Wj 26:6) — napisz życzliwą wiadomość, przeproś lub wesprzyj kogoś w rodzinie albo zborze.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-4" onchange="toggleTaskState(4)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>4. Gdy pojawi się dziś stres lub zniechęcenie, przypomnij sobie, że stoisz na „srebrnych podstawkach odkupienia” w Chrystusie, nie na własnych siłach.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-5" onchange="toggleTaskState(5)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>5. Przed kolejnym czytaniem Biblii pomódl się krótko o światło Ducha Świętego, tak jak świecznik oświetlał stół chlebów pokładnych (Wj 26:35).</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-6" onchange="toggleTaskState(6)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>6. Rozwiąż wszystkich 20 pytań quizu z Wj 26 i sprawdź, ile szczegółów Przybytku zapamiętałeś.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-7" onchange="toggleTaskState(7)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>7. Oznacz Dzień 56 jako ukończony i udostępnij lekcję jednej osobie, aby przypomnieć jej, że droga do Boga stoi otworem.</span>
          </label>`;

html = html.replace(
  /(<p class="text-zinc-200 font-semibold mb-2">Wykonaj dzisiejsze kroki formacji biblijnej:<\/p>\s*)[\s\S]*?(<\/div>\s*<div class="space-y-4 pt-2">)/,
  `$1${tasks56}\n        $2`
);

// 5.17 Zapowiedź: Jutro (Dzień 57)
const tomorrow56 = `<section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
        <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
          JUTRO — 26 LISTOPADA 2026
        </div>
        <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
          DZIEŃ 57 — OŁTARZ CAŁOPALENIA, DZIEDZINIEC PRZYBYTKU I OLIWA DO ŚWIECZNIKA (Wj 27:1–21)
        </h3>
        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">
          Dzień 57: W dwudziestym siódmym rozdziale Księgi Wyjścia wyjdziemy na dziedziniec Przybytku: staniemy przy miedzianym ołtarzu całopalenia — pierwszym miejscu spotkania grzesznika z łaską krzyża — poznamy jedną szeroką bramę dziedzińca oraz tajemnicę czystej oliwy z tłoczonych oliwek podtrzymującej nieustanny płomień w świątyni!
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-[44px]">
            <span>Dostępne od północy (26 listopada 2026)</span>
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
  `<!-- ── ZAPOWIEDŹ: JUTRO ── -->\n      ${tomorrow56}`
);

// 5.18 JavaScript: QUIZ_DATA (20 pytań), DAY_KEY, completeDay56, TTS
const quizJsItems = quizItems.map(({ q, a, c }) => ({ q, a, c }));
const quizData56 = `// ── QUIZ LOGIC (20 PYTAŃ Z WJ 26:1–37) ──\n    const QUIZ_DATA = ${JSON.stringify(quizJsItems, null, 6)};`;

html = html.replace(/\/\/ ── QUIZ LOGIC[\s\S]*?const QUIZ_DATA = \[[\s\S]*?\];/, quizData56);
html = html.replace(
  /Doskonale! Znasz na wskroś 25\. rozdział Księgi Wyjścia!/g,
  `Doskonale! Znasz na wskroś 26. rozdział Księgi Wyjścia!`
);

html = html.replace(/kc_day55_/g, `kc_day${DAY_NUM}_`);
html = html.replace(/DAY_KEY = 'kc_day55'/g, `DAY_KEY = 'kc_day${DAY_NUM}'`);
html = html.replace(/completeDay55/g, `completeDay${DAY_NUM}`);
html = html.replace(/Oznacz Dzień 55 jako ukończony/g, `Oznacz Dzień ${DAY_NUM} jako ukończony`);
html = html.replace(/Dzień 55 ukończony!/g, `Dzień ${DAY_NUM} ukończony!`);
html = html.replace(
  /new SpeechSynthesisUtterance\("[^"]+"\)/,
  `new SpeechSynthesisUtterance("${MEMORY_VERSE_QUOTE} Księga Wyjścia 26:33.")`
);

// Zapis 4 ścieżek Clean URLs w Akademii i Kursach dla Dnia 56
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
console.log('✅ Zapisano 4 ścieżki Clean URLs dla Dnia 56.');

// Zapis paczki przedpublikacyjnej w kolejka-publikacji/kurs-codzienny/2026-11-25/
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
          'Dziesięć zasłon z bisioru i cherubinów, 50 złotych haczyków jedności, 48 złoconych desek akacjowych na srebrnych podstawkach oraz zasłona oddzielająca Miejsce Święte od Najświętszego.',
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
