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
const DAY_NUM = 54;
const DATE_STR = '2026-11-23';
const DATE_FORMATTED = '23 LISTOPADA 2026 R. (PONIEDZIAŁEK)';
const DATE_SHORT_UPPER = '23 LISTOPADA 2026 • PONIEDZIAŁEK';
const BOOK = 'KSIĘGA WYJŚCIA';
const READING = 'Wj 24:1–18';
const TITLE =
  'KREW PRZYMIERZA, UCZTA STARSZYCH I CHWAŁA PANA NA SYNAJU';
const SUBTITLE =
  'Uroczysta ratyfikacja Przymierza krwią ofiar, szafirowe niebo pod stopami Boga podczas uczty siedemdziesięciu starszych oraz Mojżesz wstępujący w obłok chwały na czterdzieści dni i nocy (Wj 24:1–18)';

const EXO24_PATH = path.join(REPO, 'data/bible/ubg-2025/EXO-024.json');
const exo24Data = JSON.parse(fs.readFileSync(EXO24_PATH, 'utf8'));
const verses = exo24Data.verses;

const v8 = verses.find((v) => v.number === 8)?.text || '';
const MEMORY_VERSE_QUOTE = v8.trim();
const MEMORY_VERSE = `„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 24:8 (UBG)`;

const THEME =
  'Dwudziesty czwarty rozdział Księgi Wyjścia to jeden z najbardziej majestatycznych punktów zwrotnych w całej historii zbawienia: uroczysta ratyfikacja Przymierza zawartego między świętym Bogiem a odkupionym ludem u stóp góry Synaj. Po odczytaniu przez Mojżesza Księgi Przymierza cały lud jednogłośnie odpowiada: „Wypełnimy wszystko, co PAN mówił, i będziemy posłuszni” (Wj 24:7). Wówczas Mojżesz kropi krwią zarówno ołtarz, jak i lud, wypowiadając prorocze słowa: „Oto krew przymierza, które PAN zawarł z wami” (Wj 24:8) — dokładnie te same słowa, które piętnaście wieków później wypowie Pan Jezus Chrystus w Wieczerniku przy ustanowieniu Wieczerzy Pańskiej: „To jest bowiem moja krew nowego przymierza, która się wylewa za wielu na przebaczenie grzechów” (Mt 26:28; Hbr 9:18–20)! Dzięki krwi Przymierza siedemdziesięciu starszych wraz z Mojżeszem, Aaronem, Nadabem i Abihu wstępuje na górę, ogląda Boga Izraela ponad szafirowym sklepieniem czystego nieba, je i pije w Jego obecności bez trwogi o śmierć, a sam Mojżesz wchodzi w środek obłoku i ognia chwały PANA na czterdzieści dni i czterdzieści nocy, by otrzymać kamienne tablice Prawa!';

const IMG_FILENAME = 'kc_day_54_krew_przymierza_chwala_synaj.jpg';
const IMG_REL_PATH = `images/academy/daily/${IMG_FILENAME}`;
const IMG_CAPTION =
  'Ilustracja biblijna: Ratyfikacja Przymierza u stóp góry Synaj, szafirowe niebo pod stopami Boga Izraela i Mojżesz wstępujący w obłok chwały PANA — Wj 24:8–18';
const QUEUE_DIR = path.join(REPO, `kolejka-publikacji/kurs-codzienny/${DATE_STR}`);

// Jeśli plik grafiki 54 jeszcze nie istnieje, skopiuj z kc_day_49_przymierze_pod_gora_synaj.jpg jako bazę 16:9
const imgFullPath = path.join(REPO, IMG_REL_PATH);
if (!fs.existsSync(imgFullPath)) {
  const fallbackImg = path.join(REPO, 'images/academy/daily/kc_day_49_przymierze_pod_gora_synaj.jpg');
  fs.copyFileSync(fallbackImg, imgFullPath);
}

function buildVersesParagraphsHtml() {
  const sections = [
    {
      heading:
        'KSIĘGA WYJŚCIA 24:1–8 — Ołtarz, dwanaście słupów, odczytanie Księgi Przymierza i pokropienie krwią przymierza',
      from: 1,
      to: 8,
      extraClass: 'mb-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 24:9–11 — Wstąpienie starszych Izraela, szafirowe niebo pod stopami Boga i uczta przymierza w Jego obecności',
      from: 9,
      to: 11,
      extraClass: 'my-6 pt-4 pb-2 border-b border-brand-border/40',
    },
    {
      heading:
        'KSIĘGA WYJŚCIA 24:12–18 — Obietnica kamiennych tablic, chwała PANA jak ogień pożerający i czterdzieści dni Mojżesza w obłoku',
      from: 12,
      to: 18,
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
            `<p><span class="verse-num">24:${v.number}</span> ${v.text}</p>`
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
const v1TtsText = `☀️ Z Biblią za Pan Brat — Dzień Pięćdziesiąty Czwarty

**Czy wiesz, że dzięki krwi Przymierza możesz dziś zasiąść przy stole z samym Bogiem pod czystym, szafirowym niebem Jego łaski?**

Zatrzymaj się w ten poniedziałkowy poranek, dwudziestego trzeciego listopada dwa tysiące dwudziestego szóstego roku. Rozpoczyna się nowy tydzień pracy, obowiązków i decyzji. Zanim ruszysz w bieg dzisiejszych zadań, weź spokojny oddech i pomyśl przez chwilę: na czym opiera się Twoja więź z Bogiem? Czy na lęku, że za chwilę zostaniesz odrzucony za swoją słabość, czy na pewności nierozerwalnego Przymierza przypieczętowanego krwią? W ciszy porannej modlitwy zapytaj dziś swojego Ojca: Tato, czy wchodzę w ten nowy tydzień jako przestraszony daleki przechodzień, czy jako Twoje dziecko zaproszone do stołu pod szafirowym niebem Twojej obecności?

W dwudziestym czwartym rozdziale Księgi Wyjścia jesteśmy świadkami jednej z najbardziej niezwykłych scen w całym Piśmie Świętym. Mojżesz schodzi do ludu, opowiada wszystkie słowa Pana i spisuje je w Księdze Przymierza. O świcie buduje u stóp góry ołtarz oraz dwanaście słupów odpowiadających dwunastu pokoleniom Izraela. Młodzieńcy składają ofiary całopalne i pojednawcze, a Mojżesz bierze połowę krwi i kropi nią ołtarz, po czym odczytuje głośno Księgę Przymierza. Cały lud odpowiada jednym głosem: Wypełnimy wszystko, co Pan mówił, i będziemy posłuszni! Wtedy Mojżesz kropi drugą połową krwi lud i wypowiada słowa, które zapiszą się na wieki: Oto krew przymierza, które Pan zawarł z wami! Zaraz po tym dzieje się coś zapierającego dech w piersiach: Mojżesz, Aaron, Nadab, Abihu i siedemdziesięciu starszych wstępują na górę i widzą Boga Izraela! Pod Jego stopami lśni dzieło z szafirowego kamienia, czyste jak jasne niebo. I choć widzą Świętego Boga, Pan nie wyciąga na nich ręki — jedzą i piją w Jego obecności! Na koniec Mojżesz zostawia w obozie Aarona i Chura, a sam z Jozuem wstępuje wyżej i wchodzi w środek obłoku chwały Pana, wyglądającej jak ogień pożerający, na czterdzieści dni i czterdzieści nocy, by otrzymać kamienne tablice Prawa.

Psychologia więzi i poczucia bezpieczeństwa potwierdza, że człowiek rozkwita dopiero wtedy, gdy wie, że relacja nie opiera się na przelotnym nastroju, lecz na uroczystym, nierozerwalnym zobowiązaniu. Wspólny posiłek przy jednym stole od wieków jest najwyższym znakiem pokoju, przebaczenia i pełnej akceptacji.

A w świetle Ewangelii całe to wydarzenie prowadzi nas prosto do Wieczernika i na Golgotę! Gdy Pan Jezus podaje uczniom kielich i mówi: To jest bowiem moja krew nowego przymierza, która się wylewa za wielu na przebaczenie grzechów, nawiązuje bezpośrednio do słów Mojżesza spod góry Synaj! Tam krew cielców otworzyła starszym drogę na zbocze góry, a tutaj przelana krew Syna Bożego otwiera każdemu wierzącemu śmiały przystęp do tronu łaski i do wiecznej uczty w Królestwie Ojca!

Jezus mówi dziś do Ciebie:
„To jest bowiem moja krew nowego przymierza, która się wylewa za wielu na przebaczenie grzechów.” (Ewangelia według świętego Mateusza, rozdział dwudziesty szósty, werset dwudziestyósmy, UBG)

Zadanie Taktyczne:
Rozpocznij ten poniedziałek od świadomego odnowienia swojego przymierza posłuszeństwa i wdzięczności wobec Boga. Zanim podejmiesz pierwszą ważną decyzję w pracy lub w domu, przypomnij sobie słowa: Wypełnimy wszystko, co Pan mówił, i będziemy posłuszni! Podczas dzisiejszego posiłku podziękuj Jezusowi za Jego krew Nowego Przymierza, dzięki której masz pokój z Bogiem i czyste, szafirowe niebo nad swoim życiem.

W Christian Culture aplikacje i portale są dla Ciebie zawsze bezpłatne.

Modlitwa Bojowa:
Ojcze w niebie, dziękuję Ci za uroczystą chwilę pod górą Synaj, w której przypieczętowałeś swoje Przymierze z ludem, i za szafirowe niebo Twojej świętej obecności. Przepraszam Cię za chwile, gdy zapominałem o swoich obietnicach wierności i żyłem tak, jakby Twoje Słowo było tylko luźną propozycją. Panie Jezu Chryste, dziękuję Ci za Twoją najdroższą krew Nowego Przymierza przelaną na przebaczenie moich grzechów. Dziękuję Ci, że dzięki Twojej ofierze nie wyciągasz przeciwko mnie ręki sądu, lecz zapraszasz mnie do swojego stołu, karmisz i prowadzisz w obłok swojej chwały. Wypisz swoje prawo na tablicach mojego serca na cały ten tydzień. Tobie chwała na wieki. Amen.

Rozkaz Dnia (Zadbaj o wzrost):
Otwórz swoje serce na sześćdziesiąt sześć miesięcy codziennej formacji biblijnej w akademii. Wejdź do wspólnoty ludzi wiernych Pismu, buduj codzienny nawyk czytania Słowa Bożego i każdego dnia wzrastaj w poznaniu Jezusa Chrystusa.

Błogosławieństwo:
Niech krew Nowego Przymierza w Chrystusie Jezusie strzeże Twojego sumienia w czystości i pokoju, niech nad Twoim domem jaśnieje pogodne niebo Bożej łaski, a Duch Święty niech prowadzi Cię przez wszystkie dni nowego tygodnia. Dobrego dnia! Podaj dalej.`;

if (/[0-9]/.test(v1TtsText)) {
  throw new Error('BŁĄD STANDARD_PRODUKCYJNY: Wersja 1 TTS zawiera cyfry arabskie!');
}

const v2WebText = `☀️ Z Biblią za Pan Brat — Dzień 54 (23 listopada 2026 r.)
📖 Księga Wyjścia 24:1–18: Krew Przymierza, Uczta Starszych i Chwała PANA na Synaju

Czy zastanawiałeś się kiedyś, skąd wzięły się słowa Pana Jezusa z Wieczernika: „To jest krew moja nowego przymierza” — i jak wyglądało szafirowe niebo pod stopami Boga, gdy siedemdziesięciu starszych Izraela jadło i piło przed Jego obliczem?

W 54. dniu codziennej formacji biblijnej (https://polskieradio.cc/akademia#kurscodzienny) otwieramy 24. rozdział Księgi Wyjścia (Wj 24:1–18: https://polskieradio.cc/mojabiblia?book=EXO&chapter=24). Jesteśmy świadkami uroczystego przypieczętowania Przymierza u stóp góry Synaj oraz wejścia Mojżesza w ogień i obłok Bożej chwały na 40 dni i 40 nocy.

Kluczowe filary dzisiejszego studium:
1. Księga i Krew Przymierza (Wj 24:1–8): Mojżesz spisuje wszystkie słowa PANA, buduje ołtarz i 12 słupów, a po jednogłośnej deklaracji ludu („Wypełnimy wszystko, co PAN mówił, i będziemy posłuszni”, w. 7) kropi ołtarz oraz lud krwią ze słowami: „Oto krew przymierza, które PAN zawarł z wami” (w. 8; por. Hbr 9:18–20).
2. Szafirowe niebo i uczta w obecności Boga (Wj 24:9–11): Mojżesz, Aaron, Nadab, Abihu i 70 starszych wstępują na górę i oglądają Boga Izraela, pod którego stopami lśni dzieło z szafirowego kamienia jak pogodne niebo (w. 10). Dzięki krwi przymierza Bóg nie wyciąga na nich ręki sądu — „widzieli Boga, jedli i pili” (w. 11)!
3. Obłok chwały i kamienne tablice (Wj 24:12–18): PAN wzywa Mojżesza na szczyt, by przekazać mu kamienne tablice z Prawem i przykazaniami (w. 12). Chwała PANA spoczywa na Synaju jak ogień pożerający, a Mojżesz po sześciu dniach oczekiwania wchodzi w środek obłoku na 40 dni i 40 nocy (w. 16–18).

Jezus mówi dziś do Ciebie:
„To jest bowiem moja krew nowego przymierza, która się wylewa za wielu na przebaczenie grzechów.” (Mt 26:28, UBG)

Zadanie Taktyczne:
• Czytaj: Wj 24:1–18 oraz Mt 26:26–29 i Hbr 9:18–24.
• Wierz: Przelana krew Jezusa Chrystusa otwiera Ci bezpieczny przystęp do stołu i obecności żywego Boga.
• Działaj: Rozpocznij nowy tydzień od świadomej deklaracji posłuszeństwa Bożemu Słowu w swoim domu i pracy.

Studiuj pełny tekst UBG, 8 kodów Stronga, 45-punktową egzegezę i quiz z 20 pytaniami:
👉 https://polskieradio.cc/akademia/kurscodzienny/dzien-54

Dołącz do wspólnoty wzrostu:
💬 https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0
Wspieraj misję Słowa: https://polskieradio.cc/wspieramto`;

const v3SmsText = `Dzień 54 (Wj 24:8): „Oto krew przymierza, które PAN zawarł z wami”. Dzięki krwi Chrystusa masz dziś pokój z Bogiem i dostęp do Jego chwały! polskieradio.cc`;

const v4VideoText = `[OPRAWA GRAFICZNA & MUZYCZNA]
Nowoczesne, eleganckie studio Christian Culture TV w głębokiej czerni (#000000) oraz szlachetnym złocie Champagne Gold (#C4A35A / #D4AF37). Na wielkoformatowym ekranie za prowadzącymi monumentalna scena biblijna: ołtarz i dwanaście kamiennych słupów u podnóża góry Synaj, szafirowy blask czystego nieba ponad obłokiem oraz ogień chwały PANA na szczycie góry. Tytuł na ekranie: „Z BIBLIĄ ZA PAN BRAT — DZIEŃ 54: KREW PRZYMIERZA, UCZTA STARSZYCH I CHWAŁA PANA NA SYNAJU (WJ 24:1–18)”.

[INTRO: PRZYPIECZĘTOWANIE PRZYMIERZA]
Noemi: Dzień dobry w poniedziałkowy poranek! Witamy bardzo serdecznie w pięćdziesiątym czwartym dniu naszego kursu „Z Biblią za Pan Brat”! Po ogłoszeniu Dekalogu w dwudziestym rozdziale i Księgi Przymierza w rozdziałach od dwudziestego pierwszego do dwudziestego trzeciego nadchodzi dziś moment uroczystej ratyfikacji Przymierza w dwudziestym czwartym rozdziale Księgi Wyjścia!
Sara: Witaj Noemi, witamy wszystkich widzów Christian Culture TV na progu nowego tygodnia! Ten rozdział to jedna z najpiękniejszych i najbardziej przełomowych kart całej Biblii. Mojżesz schodzi do ludu, opowiada wszystkie słowa PANA, spisuje je w Księdze Przymierza, a rano buduje ołtarz reprezentujący Boga oraz dwanaście słupów reprezentujących dwanaście pokoleń Izraela!

[ANALIZA PROBLEMOWA: KREW PRZYMIERZA I SZAFIROWE NIEBO POD STOPAMI BOGA]
Noemi: Zwróćmy uwagę na symbolikę krwi w wersetach od szóstego do ósmego! Mojżesz dzieli krew ofiar na dwie części: pierwszą połową kropi ołtarz, następnie czyta głośno Księgę Przymierza, a gdy lud odpowiada: „Wypełnimy wszystko, co PAN mówił, i będziemy posłuszni”, kropi lud drugą połową krwi i woła: „Oto krew przymierza, które PAN zawarł z wami”!
Sara: I zobaczmy, co otwiera ta krew przymierza w wersetach od dziewiątego do jedenastego! Mojżesz, Aaron, Nadab, Abihu oraz siedemdziesięciu starszych Izraela wstępują na górę i czytamy niezwykłe słowa: „I widzieli Boga Izraela, a pod jego nogami było jakby dzieło z szafirowego kamienia jak niebo, gdy jest jasne. A na przywódców synów Izraela PAN nie wyciągnął swej ręki, choć widzieli Boga, jedli i pili”!
Noemi: Jeszcze niedawno góra dymiła i nikt nie mógł jej dotknąć pod karą śmierci, a teraz — po pokropieniu krwią przymierza — przedstawiciele ludu zasiadają do uczty pokoju w obecności samego Boga pod czystym, szafirowym niebem!

[SŁOWO ROZKAZU: JEZUS W CENTRUM I CZTERDZIEŚCI DNI W OBŁOKU]
Sara: A w drugiej części rozdziału Bóg wzywa Mojżesza jeszcze wyżej: „Wstąp do mnie na górę i bądź tam, a dam ci kamienne tablice, prawo i przykazania, które napisałem, abyś ich nauczał”. Mojżesz zostawia w obozie Aarona i Chura, idzie z Jozuem, przez sześć dni czeka przed obłokiem, aż siódmego dnia — w Szabat! — Bóg woła go spośród obłoku i ognia chwały na czterdzieści dni i czterdzieści nocy!
Noemi: I spójrzmy, jak wszystko to wypełnia się w Jezusie Chrystusie! W Wieczerniku Pan Jezus bierze kielich i wypowiada dokładnie słowa z Księgi Wyjścia dwadzieścia cztery osiem: „To jest bowiem moja krew nowego przymierza, która się wylewa za wielu na przebaczenie grzechów”! Dzięki przelanej krwi Chrystusa nie stoimy już z daleka w strachu, lecz zostaliśmy zaproszeni do stołu Ojca, a Duch Święty wypisuje Boże Prawo nie tylko na kamiennych tablicach, ale na żywych tablicach naszych serc!

[ZADANIE TAKTYCZNE: CZYTAJ, WIERZ, DZIAŁAJ]
Sara: Jak wejść w ten poniedziałek z mocą dwudziestego czwartego rozdziału Księgi Wyjścia?
• Czytaj: dwudziesty czwarty rozdział Księgi Wyjścia oraz dziewiąty rozdział Listu do Hebrajczyków.
• Wierz: Krew Nowego Przymierza w Jezusie Chrystusie oczyszcza Twoje sumienie i otwiera nad Tobą jasne, szafirowe niebo Bożej łaski.
• Działaj: wypowiedz dziś przed Bogiem szczere „Wypełnię wszystko, co PAN mówił, i będę posłuszny” w konkretnej sprawie nowego tygodnia!

[MANIFEST: MODLITWA BOJOWA]
Noemi: Pomódlmy się wspólnie! Ojcze Niebieski, dziękujemy Ci za dar Twojego świętego Przymierza, za Twoje Słowo spisane dla naszego pouczenia oraz za krew naszego Zbawiciela Jezusa Chrystusa, która jedna nas z Tobą.
Sara: Panie Jezu, dziękujemy Ci, że dzięki Twojej krwi zapraszasz nas do swojej obecności i karmisz przy swoim stole. Wprowadź nas w ten nowy tydzień w mocy Twojej chwały i wypisz swoje przykazania w naszych sercach. W imieniu Jezusa. Amen!

[OUTRO: BŁOGOSŁAWIEŃSTWO I WZROST]
Noemi: Niech szafirowe niebo Bożego pokoju i łaski jaśnieje nad całym Twoim tygodniem!
Sara: Czytaj, wierz, działaj. Dla Jezusa! Do zobaczenia jutro w dwudziestym piątym rozdziale Księgi Wyjścia!`;

const v5ArticleText = `🌐 CCN | WIADOMOŚCI Z KRAJU I ZE ŚWIATA / LEKSYKON BIBLIJNY
## @CCN: KREW PRZYMIERZA, SZAFIROWE NIEBO I CZTERDZIEŚCI DNI W OBŁOKU CHWAŁY — EGZEGEZA WJ 24:1–18
Autor: Cezary Rogowski, red. nacz. CCN News | Data publikacji: 23 listopada 2026 r.

Dwudziesty czwarty rozdział Księgi Wyjścia (Wj 24:1–18) stanowi liturgiczne i teologiczne zwieńczenie pierwszej części objawienia synajskiego (Wj 19–24). Po ogłoszeniu Dekalogu (Wj 20) oraz szczegółowych praw Księgi Przymierza (Wj 21–23) następuje oficjalna ceremonia zawarcia i ratyfikacji Przymierza między Jahwe a dwunastoma pokoleniami Izraela.

1. Ołtarz, dwanaście słupów i Księga Przymierza (Wj 24:1–7)
> „Następnie wziął księgę przymierza i czytał ludowi, a oni powiedzieli: Wypełnimy wszystko, co PAN mówił, i będziemy posłuszni.” — Księga Wyjścia 24:7 (UBG)

Mojżesz nie pozostawia Bożego objawienia wyłącznie w zawodnej pamięci ustnej, lecz „spisał wszystkie słowa PANA” (Wj 24:4), tworząc *Sefer HaBerit* (סֵפֶר הַבְּרִית — „Księgę Przymierza”, Wj 24:7). U podnóża góry buduje ołtarz (reprezentujący obecność Boga) oraz dwanaście kamiennych słupów (*maccewa*, Strong H4676) odpowiadających dwunastu pokoleniom Izraela. Dwukrotna odpowiedź narodu, zwieńczona hebrajskim wyznaniem *naaseh weniszma* („Wypełnimy i będziemy posłuszni”, Wj 24:7), wyraża świadome przyjęcie Bożego panowania.

2. „Oto krew przymierza” — pomost od Synaju do Wieczernika (Wj 24:6, 8)
Krew ofiar całopalnych i pojednawczych (*szelamim*, Strong H8002) zostaje podzielona na dwie równe części: pierwsza kropi ołtarz, druga — po odczytaniu Księgi Przymierza — kropi lud ze słowami: „Oto krew przymierza (*dam ha-berit*, דַּם־הַבְּרִית), które PAN zawarł z wami” (Wj 24:8, UBG). Autor Listu do Hebrajczyków (Hbr 9:18–22) wskazuje ten moment jako bezpośrednią zapowiedź ofiary Chrystusa, a sam Pan Jezus podczas Ostatniej Wieczerzy cytuje formułę Mojżesza: „To jest bowiem moja krew nowego przymierza, która się wylewa za wielu na przebaczenie grzechów” (Mt 26:28, UBG).

3. Szafirowe sklepienie i uczta przymierza w obecności Boga (Wj 24:9–11)
Bezpośrednim owocem pokropienia krwią przymierza jest bezpieczny przystęp do Świętego Boga. Mojżesz, Aaron, Nadab, Abihu oraz siedemdziesięciu starszych Izraela wstępują na zbocze Synaju i oglądają teofanię Boga Izraela, pod którego stopami widnieje „jakby dzieło z szafirowego kamienia (*liwnat ha-sappir*, Strong H5601) jak niebo, gdy jest jasne” (Wj 24:10; por. Ez 1:26). Werset 11 podkreśla cud łaski: „PAN nie wyciągnął swej ręki, choć widzieli Boga, jedli i pili” — zapowiadając ucztę odkupionych w Królestwie Bożym.

4. Kamienne tablice i czterdzieści dni w ogniu chwały PANA (Wj 24:12–18)
W finałowej scenie Bóg powołuje Mojżesza na sam szczyt, by przekazać mu kamienne tablice (*luchot ha-ewen*), Prawo (*tora*, Strong H8451) i przykazania (*micwa*, Strong H4687) napisane przez samego Boga „abyś ich nauczał” (Wj 24:12). Mojżesz powierza sprawy sądownicze w obozie Aaronowi i Churowi, zabiera ze sobą Jozuego, a po sześciu dniach oczekiwania przed obłokiem zostaje zawołany przez PANA w dniu siódmym (Szabat!) i wchodzi w środek chwały PANA (*kewod Jahwe*, Strong H3519), płonącej jak ogień pożerający, na czterdzieści dni i czterdzieści nocy (Wj 24:16–18).

📌 PODSUMOWANIE REDAKCYJNE CCN:
Księga Wyjścia 24:1–18 objawia istotę biblijnej wiary: Słowo spisane i przyjęte z posłuszeństwem, Przymierze przypieczętowane krwią Odkupiciela, radosną społeczność przy Bożym stole oraz przemieniające spotkanie z chwałą PANA.

🌐 Źródła i serwisy pokrewne: polskieradio.cc | polskieradio.cc/akademia | mojabiblia.cc`;

const pakiet5wersji = `# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI
## Dzień 54 (23 listopada 2026): Krew Przymierza, Uczta Starszych i Chwała PANA na Synaju (Wj 24:1–18)

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
    q: 'Kogo Bóg wezwał w Wj 24:1, aby wstąpił wraz z Mojżeszem do PANA i oddał pokłon z daleka?',
    a: [
      'Aarona, Nadaba i Abihu oraz siedemdziesięciu ze starszych Izraela',
      'Wszystkich pierworodnych synów z dwunastu pokoleń Izraela',
      'Wyłącznie Jozuego, Kaleba oraz Chura',
      'Cały obóz Izraela wraz z kobietami i dziećmi',
    ],
    c: 0,
    exp: 'Wj 24:1 (UBG): „I powiedział do Mojżesza: Wstąpcie do PANA ty i Aaron, Nadab i Abihu oraz siedemdziesięciu ze starszych Izraela i oddajcie pokłon z daleka.”',
  },
  {
    q: 'Kto według Wj 24:2 miał prawo zbliżyć się bezpośrednio do PANA na szczycie góry?',
    a: [
      'Aaron wraz ze swoimi synami Nadabem i Abihu',
      'Tylko sam Mojżesz — pozostali nie mieli się zbliżać ani lud nie miał wstępować z nim',
      'Każdy ze starszych Izraela po kolei',
      'Młodzieńcy składający ofiary całopalne',
    ],
    c: 1,
    exp: 'Wj 24:2 (UBG): „Tylko sam Mojżesz zbliży się do PANA. Oni zaś nie zbliżą się ani lud nie wstąpi z nim.”',
  },
  {
    q: 'Jak odpowiedział cały lud jednym głosem w Wj 24:3 po wysłuchaniu od Mojżesza wszystkich słów i praw PANA?',
    a: [
      '„Poproś PANA, aby dał nam siedem dni na zastanowienie”',
      '„Wybierzemy spośród siebie sędziów, którzy rozważą te prawa”',
      '„Wypełnimy wszystkie słowa, które PAN powiedział”',
      '„Te przykazania są zbyt trudne do zachowania na pustyni”',
    ],
    c: 2,
    exp: 'Wj 24:3 (UBG): „I cały lud odpowiedział jednym głosem: Wypełnimy wszystkie słowa, które PAN powiedział.”',
  },
  {
    q: 'Co uczynił Mojżesz z usłyszanymi słowami PANA i co zbudował rano u stóp góry według Wj 24:4?',
    a: [
      'Wyrył je na brązowej tarczy i wykopał studnię pośrodku obozu',
      'Zapieczętował je w glinianym naczyniu i zbudował wieżę strażniczą',
      'Przekazał je ustnie Lewitom i rozbił dwanaście czerwonych namiotów',
      'Spisał wszystkie słowa PANA, a rano zbudował ołtarz u stóp góry i ustawił dwanaście słupów według liczby dwunastu pokoleń Izraela',
    ],
    c: 3,
    exp: 'Wj 24:4 (UBG) podkreśla zarówno spisanie Słowa Bożego, jak i budowę ołtarza (reprezentującego Boga) oraz 12 słupów (reprezentujących 12 pokoleń Izraela).',
  },
  {
    q: 'Kogo posłał Mojżesz w Wj 24:5 do złożenia PANU całopaleń oraz cielców jako ofiar pojednawczych?',
    a: [
      'Młodzieńców z synów Izraela',
      'Starców powyżej osiemdziesiątego roku życia',
      'Kapłanów z ziemi Midian',
      'Tylko synów pokolenia Judy',
    ],
    c: 0,
    exp: 'Wj 24:5 (UBG): „I posłał młodzieńców z synów Izraela, i ci ofiarowali całopalenia, i złożyli PANU cielce jako ofiary pojednawcze.”',
  },
  {
    q: 'Co Mojżesz uczynił z krwią ofiar w pierwszym etapie obrzędu według Wj 24:6?',
    a: [
      'Wylał całą krew na piasek pustyni poza obozem',
      'Wziął połowę krwi i wlał do czaszy, a drugą połową pokropił ołtarz',
      'Pomazał krwią dwanaście drewnianych lasek pokoleń',
      'Przechował całą krew w namiocie do czterdziestego dnia',
    ],
    c: 1,
    exp: 'Wj 24:6 (UBG): „Potem Mojżesz wziął połowę krwi i wlał do czaszy, a drugą połową pokropił ołtarz.”',
  },
  {
    q: 'Jak nazywał się zwój odczytany głośno ludowi przez Mojżesza w Wj 24:7 przed pokropieniem ludu krwią?',
    a: [
      'Księga Wojny PANA',
      'Księga Rodowodów Patriarchów',
      'Księga Przymierza',
      'Księga Psalmów Synajskich',
    ],
    c: 2,
    exp: 'Wj 24:7 (UBG): „Następnie wziął księgę przymierza i czytał ludowi, a oni powiedzieli: Wypełnimy wszystko, co PAN mówił, i będziemy posłuszni.”',
  },
  {
    q: 'Jakie słowa wypowiedział Mojżesz w Wj 24:8, kropiąc lud krwią z czaszy?',
    a: [
      '„Oto woda oczyszczenia na drogę przez pustynię”',
      '„Od dziś nikt nie potrzebuje już składać żadnych ofiar”',
      '„Oto znak zwycięstwa nad wojskami Amaleka”',
      '„Oto krew przymierza, które PAN zawarł z wami, według wszystkich tych słów”',
    ],
    c: 3,
    exp: 'Wj 24:8 (UBG) zawiera kluczową formułę „Oto krew przymierza”, do której nawiązał Pan Jezus podczas Ostatniej Wieczerzy (Mt 26:28).',
  },
  {
    q: 'Co zobaczyli pod stopami Boga Izraela Mojżesz, Aaron, Nadab, Abihu i siedemdziesięciu starszych według Wj 24:10?',
    a: [
      'Jakby dzieło z szafirowego kamienia jak niebo, gdy jest jasne',
      'Głębokie morze pełne wzburzonych fal i ciemności',
      'Złote schody prowadzące do rzeki Eufrat',
      'Żelazny rydwan zaprzężony w cztery konie',
    ],
    c: 0,
    exp: 'Wj 24:10 (UBG): „I widzieli Boga Izraela, a pod jego nogami było jakby dzieło z szafirowego kamienia jak niebo, gdy jest jasne.”',
  },
  {
    q: 'Jaki niezwykły znak łaski i pokoju wobec przywódców Izraela odnotowuje Wj 24:11?',
    a: [
      'Otrzymali oni natychmiastowe korony ze złota i srebra',
      'PAN nie wyciągnął swej ręki na przywódców synów Izraela, choć widzieli Boga, jedli i pili',
      'Zostali przeniesieni w jednej chwili do ziemi Kanaan',
      'Przez czterdzieści dni nie odczuwali żadnego pragnienia',
    ],
    c: 1,
    exp: 'Wj 24:11 pokazuje, że dzięki krwi przymierza grzeszny człowiek nie ginie w obecności Świętego Boga, lecz zasiada do uczty przymierza.',
  },
  {
    q: 'Co PAN obiecał przekazać Mojżeszowi na górze i w jakim celu według Wj 24:12?',
    a: [
      'Złotą laskę królewską, aby rządził sąsiednimi narodami',
      'Plany budowy murów Jerozolimy oraz spisy wojsk',
      'Kamienne tablice, prawo i przykazania, które PAN napisał, aby Mojżesz ich nauczał',
      'Klucze do skarbca egipskiego pozostawionego nad morzem',
    ],
    c: 2,
    exp: 'Wj 24:12 (UBG): „Wstąp do mnie na górę i bądź tam, a dam ci kamienne tablice, prawo i przykazania, które napisałem, abyś ich nauczał.”',
  },
  {
    q: 'Kto towarzyszył Mojżeszowi jako jego sługa podczas wyruszenia w górę Boga według Wj 24:13?',
    a: [
      'Eleazar',
      'Kaleb',
      'Gerszom',
      'Jozue',
    ],
    c: 3,
    exp: 'Wj 24:13 (UBG): „Mojżesz wstał więc wraz z Jozuem, swoim sługą; i Mojżesz wstąpił na górę Boga.”',
  },
  {
    q: 'Komu Mojżesz powierzył rozstrzyganie spraw spornych w obozie podczas swojej nieobecności na górze według Wj 24:14?',
    a: [
      'Aaronowi i Churowi („A oto Aaron i Chur będą z wami. Kto by miał jakąś sprawę, niech idzie do nich”)',
      'Nadabowi i Abihu',
      'Jetrze, kapłanowi Midianu',
      'Miriam i starszym pokolenia Lewiego',
    ],
    c: 0,
    exp: 'Wj 24:14 wyznacza Aarona i Chura jako zastępców odpowiedzialnych za utrzymanie porządku prawnego do powrotu Mojżesza.',
  },
  {
    q: 'Co zakryło górę Synaj, gdy Mojżesz na nią wstąpił w Wj 24:15–16?',
    a: [
      'Gęsty piasek niesiony wiatrem z pustyni',
      'Obłok, w którym spoczęła chwała PANA',
      'Stado ptaków przelatujących nad pustynią',
      'Zasłona z błękitnego płótna rozpięta przez starszych',
    ],
    c: 1,
    exp: 'Wj 24:15–16: „Wtedy Mojżesz wstąpił na górę, a obłok zakrył górę. I chwała PANA spoczęła na górze Synaj...”.',
  },
  {
    q: 'Przez ile dni obłok okrywał górę Synaj i w którym dniu PAN zawołał na Mojżesza spośród obłoku według Wj 24:16?',
    a: [
      'Przez trzy dni, a zawołał w czwartym dniu',
      'Przez dziesięć dni, a zawołał w jedenastym dniu',
      'Przez sześć dni obłok okrywał górę, a w siódmym dniu PAN zawołał na Mojżesza spośród obłoku',
      'Przez dwanaście dni, a zawołał w połowie miesiąca',
    ],
    c: 2,
    exp: 'Wj 24:16 podkreśla święty rytm sześciu dni oczekiwania i wezwania w dniu siódmym (Szabat) do bezpośredniej społeczności z Bogiem.',
  },
  {
    q: 'Do czego przypominał wygląd chwały PANA na szczycie góry w oczach synów Izraela według Wj 24:17?',
    a: [
      'Do spokojnej rzeki płynącej w dolinie',
      'Do srebrnego księżyca podczas pełni',
      'Do zielonego drzewa oliwnego na wzgórzu',
      'Był jak ogień pożerający na szczycie góry',
    ],
    c: 3,
    exp: 'Wj 24:17 (UBG): „A wygląd chwały PANA w oczach synów Izraela był jak ogień pożerający na szczycie góry” (por. Hbr 12:29).',
  },
  {
    q: 'Jak długo przebywał Mojżesz na górze Synaj w środku obłoku według Wj 24:18?',
    a: [
      'Czterdzieści dni i czterdzieści nocy',
      'Siedem dni i siedem nocy',
      'Dwadzieścia cztery dni i dwadzieścia cztery noce',
      'Sto dwadzieścia dni bez przerwy',
    ],
    c: 0,
    exp: 'Wj 24:18 (UBG): „A był Mojżesz na górze czterdzieści dni i czterdzieści nocy.”',
  },
  {
    q: 'W jaki sposób Pan Jezus Chrystus wypełnił w Wieczerniku proroctwo i obrzęd z Wj 24:8?',
    a: [
      'Kazał uczniom zbudować dwanaście kamiennych słupów w Jerozolimie',
      'Podając kielich, ogłosił: „To jest bowiem moja krew nowego przymierza, która się wylewa za wielu na przebaczenie grzechów” (Mt 26:28)',
      'Nakazał skropić krwią cielców bramy świątyni Heroda',
      'Odwołał wszystkie obietnice dane wcześniej Abrahamowi',
    ],
    c: 1,
    exp: 'Pan Jezus użył dokładnie formuły Mojżesza z Wj 24:8, ustanawiając Nowe Przymierze we własnej krwi przelanej na krzyżu.',
  },
  {
    q: 'Jak List do Hebrajczyków 9:18–20 komentuje wydarzenie z Księgi Wyjścia 24:6–8?',
    a: [
      'Twierdzi, że pierwsze przymierze zostało zawarte wyłącznie słowem bez żadnej ofiary',
      'Mówi, że Mojżesz użył tylko wody źródlanej ze skały Horeb',
      'Wskazuje, że także pierwsze przymierze nie zostało zapoczątkowane bez krwi, którą Mojżesz pokropił księgę i cały lud',
      'Uznaje obrzęd pod Synajem za zwyczaj zapożyczony od Egipcjan',
    ],
    c: 2,
    exp: 'Hbr 9:18–22 bezpośrednio cytuje Wj 24:8, wykazując, że bez rozlania krwi nie ma odpuszczenia grzechów, co znalazło doskonałe spełnienie w krwi Chrystusa.',
  },
  {
    q: 'Czego uczy nas kolejność wydarzeń w Wj 24:3–11 (najpierw Słowo i krew przymierza na dole, potem oglądanie Boga i uczta na górze)?',
    a: [
      'Że człowiek może zbliżyć się do Boga wyłącznie o własnych siłach bez Zbawiciela',
      'Że czytanie Pisma Świętego jest potrzebne tylko raz w życiu',
      'Że uczta duchowa nie ma żadnego związku z posłuszeństwem Bogu',
      'Że droga do społeczności, pokoju i stołu z Bogiem prowadzi zawsze przez przyjęcie Jego Słowa z wiarą oraz oczyszczenie krwią Przymierza',
    ],
    c: 3,
    exp: 'Bez Słowa Bożego i krwi Odkupiciela góra Synaj budziła przerażenie; po przyjęciu Słowa i pokropieniu krwią otworzyła się droga do szafirowego nieba i uczty przed obliczem Boga.',
  },
];

const lessonDocxText = `66 KSIĄG • 66 MIESIĘCY • CODZIENNA PODRÓŻ PRZEZ PISMO ŚWIĘTE
KSIĘGA WYJŚCIA • MIESIĄC 2 • DZIEŃ 54
${TITLE}
${SUBTITLE}
${DATE_FORMATTED}  |  Czytanie: ${READING}
TEKST PAMIĘCIOWY: ${MEMORY_VERSE}
MYŚL PRZEWODNIA: ${THEME}

ZANIM OTWORZYSZ BIBLIĘ
Dwudziesty czwarty rozdział Księgi Wyjścia to uroczysty szczyt całej dotychczasowej wędrówki Izraela z niewoli egipskiej. Po cudzie Paschy, przejściu przez Morze Czerwone, ogłoszeniu Dziesięciu Przykazań (Wj 20) oraz przekazaniu praw Księgi Przymierza (Wj 21–23), nadchodzi chwila formalnego przypieczętowania Przymierza między świętym Bogiem a dwunastoma pokoleniami Jego ludu.
W zaledwie osiemnastu wersetach rozgrywają się tu trzy niezwykle bogate duchowo sceny: u podnóża góry Mojżesz spisuje Księgę Przymierza, buduje ołtarz i dwanaście słupów oraz kropi ołtarz i lud krwią przymierza (Wj 24:1–8); na zboczu góry siedemdziesięciu starszych wraz z Mojżeszem, Aaronem, Nadabem i Abihu ogląda Boga Izraela ponad szafirowym niebem oraz je i pije w Jego obecności bez lęku o śmierć (Wj 24:9–11); wreszcie na samym szczycie góry Mojżesz po sześciu dniach oczekiwania zostaje w siódmym dniu wezwany w środek obłoku i ognia chwały PANA na czterdzieści dni i czterdzieści nocy, by otrzymać kamienne tablice Prawa (Wj 24:12–18).
Zanim przejdziesz do komentarza, otwórz własną Biblię i przeczytaj spokojnie cały 24. rozdział Księgi Wyjścia w przekładzie Uwspółcześnionej Biblii Gdańskiej. Zwróć szczególną uwagę na werset 8 — bo to właśnie te słowa weźmie na swoje usta Pan Jezus Chrystus w Wieczerniku w noc przed Golgotą!

TEKST PISMA ŚWIĘTEGO (UWSPÓŁCZEŚNIONA BIBLIA GDAŃSKA — WJ 24:1–18)
${buildVersesDocxText()}

KLUCZE JĘZYKOWE & KODY STRONGA (WJ 24:1–18)
• H5066 נָגַשׁ (Nagasz) — zbliżyć się, przystąpić do PANA; Mojżesz zbliża się jako pośrednik zapowiadający Chrystusa (Wj 24:2).
• H4676 מַצֵּבָה (Maccewa) — kamienny słup pamiątkowy; dwanaście słupów reprezentowało dwanaście pokoleń Izraela wokół jednego ołtarza (Wj 24:4).
• H8002 שֶׁלֶם (Szelem / Szelamim) — ofiara pojednawcza / pokoju, wyrażająca przywróconą jedność i społeczność z Bogiem (Wj 24:5).
• H1285 בְּרִית (Berit) — przymierze; w Wj 24:7–8 występuje zarówno „Księga Przymierza” (Sefer HaBerit), jak i „krew przymierza” (Dam HaBerit).
• H5601 סַפִּיר (Sappir) — szafir; szafirowe dzieło pod stopami Boga Izraela lśniące jak bezchmurne, czyste niebo (Wj 24:10).
• H2372 חָזָה (Chaza) — oglądać, kontemplować oblicze Boga; starsi widzieli Boga oraz jedli i pili w pokoju przymierza (Wj 24:11).
• H8451 תּוֹרָה (Tora) — Prawo, Boże pouczenie i wskazówka drogi zapisana przez PANA wraz z przykazaniami dla nauczania ludu (Wj 24:12).
• H3519 כָּבוֹד (Kawod) — chwała, majestat i ciężar Bożej obecności spoczywającej na Synaju jak ogień pożerający (Wj 24:16–17).

ANALIZA EGZEGETYCZNA I TEOLOGICZNA (5 CZĘŚCI, 45 PUNKTÓW)

CZĘŚĆ I — KSIĘGA I KREW PRZYMIERZA U STÓP GÓRY SYNAJ (WJ 24:1–8)
1. Stopniowany dostęp do świętości Boga (24:1–2)
Bóg wyznacza na Synaju trzy strefy zbliżenia: lud pozostaje u podnóża góry, Aaron, Nadab, Abihu i siedemdziesięciu starszych oddają pokłon na zboczu, a tylko sam Mojżesz jako pośrednik wchodzi w obłok na szczycie.
2. Wierny przekaz całego Słowa Bożego (24:3)
Mojżesz nie przemilcza żadnego trudnego przykazania: „opowiedział ludowi wszystkie słowa PANA i wszystkie prawa”. Prawdziwe przymierze wymaga pełnej prawdy.
3. Jednogłośna odpowiedź wiary i zgody ludu (24:3)
„I cały lud odpowiedział jednym głosem: Wypełnimy wszystkie słowa, które PAN powiedział” — przymierze nie jest narzucone siłą bez pytania, lecz przyjęte dobrowolnym wyznaniem ust.
4. Spisanie Słowa Bożego jako fundament wiary (24:4)
„Wtedy Mojżesz spisał wszystkie słowa PANA” — wiara biblijna opiera się na trwałym, spisanym Słowie Bożym, które chroni objawienie przed ludzkim zniekształceniem i zapomnieniem.
5. Poranna gorliwość o świcie (24:4)
Mojżesz wstaje wcześnie rano, by wznieść ołtarz — najważniejsze sprawy Boże zasługują na pierwsze godziny naszego dnia i świeże siły serca.
6. Jeden ołtarz i dwanaście słupów (24:4)
Ołtarz reprezentuje jedynego Boga, a dwanaście słupów (maccewa) dwanaście pokoleń Izraela. Jedność narodu buduje się wyłącznie wokół Bożego ołtarza.
7. Służba młodzieńców w składaniu ofiar (24:5)
Zanim ustanowiono kapłaństwo Aarona, posługę ofiarniczą pełnili młodzieńcy — pełne całopalenia (oddanie życia Bogu) łączyły się z ofiarami pojednawczymi (szelamim — pokój z Bogiem).
8. Podział krwi między ołtarz a czasze (24:6)
Połowa krwi wylana na ołtarz oznacza zadośćuczynienie wobec Bożej sprawiedliwości i świętości, a druga połowa w czaszach czeka na połączenie ludu z Bogiem.
9. Głośne odczytanie Księgi Przymierza i deklaracja: „Wypełnimy i będziemy posłuszni” (24:7)
Zanim lud zostanie pokropiony krwią, słucha odczytanej Księgi Przymierza (Sefer HaBerit) i odpowiada słynnym hebrajskim wyznaniem naaseh weniszma („uczynimy i posłuchamy”).
10. „Oto krew przymierza” — pieczęć nierozerwalnej więzi (24:8)
Pokropienie ludu krwią pieczętuje przymierze na śmierć i życie, zapowiadając przelaną krew Jezusa Chrystusa, która oczyszcza nasze sumienia (Mt 26:28; Hbr 9:14–20).

CZĘŚĆ II — SZAFIROWE NIEBO I UCZTA STARSZYCH PRZED OBLICZEM BOGA (WJ 24:9–11)
11. Wstąpienie reprezentantów całego narodu (24:9)
Mojżesz, Aaron, dwaj jego starsi synowie oraz siedemdziesięciu starszych wstępują na górę w imieniu całego odkupionego Izraela.
12. „I widzieli Boga Izraela” — oglądanie chwały Przymierza (24:10)
Choć nikt z ludzi nie może zobaczyć samej istoty Boskiego oblicza (Wj 33:20; J 1:18), przywódcy ujrzeli prawdziwe, widzialne objawienie chwały Syna Bożego — Boga Izraela!
13. Dzieło z szafirowego kamienia pod Jego stopami (24:10)
Starsi z pokorą kierują wzrok pod stopy Boga, gdzie widzą posadzkę lśniącą jak szafir (sappir) — kolor królewskiego tronu niebios (por. Ez 1:26; 10:1).
14. „Jak niebo, gdy jest jasne” — obraz pełnego pojednania (24:10)
Przez poprzednie rozdziały Synaj spowijały ciemne chmury, dym i gromy. Teraz, po pokropieniu krwią przymierza, ponad głowami zbawionych otwiera się krystalicznie czyste, bezchmurne niebo Bożego pokoju!
15. Kontrast między glinianą cegłą Egiptu a szafirową cegłą nieba (24:10)
Użyte hebrajskie słowo liwnat („tafla / cegła” szafiru) nawiązuje do cegieł wyrabianych w błocie niewoli egipskiej (Wj 1:14; 5:7) — Bóg zamienia błoto niewoli na szafirowy pałac wolności!
16. „PAN nie wyciągnął swej ręki” — cud ocalenia przez krew (24:11)
Wobec świętości Boga grzesznik zasługiwał na sąd, lecz dzięki krwi przymierza ręka Bożej sprawiedliwości powstrzymuje wyrok i przynosi osłonę łaski.
17. „Widzieli Boga, jedli i pili” — uczta przymierza na świętej górze (24:11)
W świecie starożytnym wspólny posiłek był ostatecznym potwierdzeniem pokoju i przyjaźni. Bóg zaprasza swój lud do stołu w swojej obecności!
18. Prorocza zapowiedź Wieczerzy Pańskiej i Uczty Baranka (24:11; Łk 22:15–20; Obj 19:9)
Posiłek starszych na Synaju stanowi starotestamentowy przedsmak Wieczerzy Pańskiej oraz wiecznej uczty weselnej Baranka w nowym niebie i nowej ziemi.

CZĘŚĆ III — KAMIENNE TABLICE I PORZĄDEK W OBOZIE PODCZAS OCZEKIWANIA (WJ 24:12–14)
19. Wezwanie na szczyt: „Wstąp do mnie na górę i bądź tam” (24:12)
Bóg wzywa Mojżesza nie tylko po szybki odbiór tablic, ale do trwania w Jego obecności („bądź tam”) — głęboka służba rodzi się z czasu spędzonego sam na sam z Bogiem.
20. Kamienne tablice zapisane przez samego Boga (24:12)
Kamień symbolizuje niezmienność i wieczność Bożego Prawa (Dekalogu), które w przeciwieństwie do ludzkich opinii nigdy nie ulega przedawnieniu.
21. „Prawo i przykazania, które napisałem, abyś ich nauczał” (24:12)
Celem Bożego objawienia nie jest ukryta wiedza dla elit, lecz jasne i wierne nauczanie całego ludu Bożego z pokolenia na pokolenie.
22. Wierność Jozuego u boku Mojżesza (24:13)
Jozue towarzyszy Mojżeszowi w drodze na górę Boga i wiernie czuwa na zboczu przez czterdzieści dni, z dala od późniejszego buntu złotego cielca (por. Wj 32:17).
23. Odpowiedzialna troska lidera o pozostawioną wspólnotę (24:14)
Zanim Mojżesz wejdzie w obłok, nie zostawia ludu w anarchii, lecz daje jasne polecenie: „Zostańcie tu, aż wrócimy do was”.
24. Wyznaczenie Aarona i Chura do rozstrzygania sporów (24:14)
„Kto by miał jakąś sprawę, niech idzie do nich” — ci sami dwaj mężowie, którzy podtrzymywali ręce Mojżesza w bitwie z Amalekiem (Wj 17:12), otrzymują pieczę nad pokojem w obozie.
25. Próba cierpliwości podczas nieobecności pasterza (24:14)
Polecenie „Zostańcie tu, aż wrócimy” stanie się wkrótce wielkim sprawdzianem wierności dla starszych i ludu (Wj 32:1) — tak jak dziś dla Kościoła oczekującego powrotu Chrystusa.

CZĘŚĆ IV — SZEŚĆ DNI OCZEKIWANIA, SIÓDMY DZIEŃ WEZWANIA I OGIEŃ CHWAŁY (WJ 24:15–18)
26. Obłok zakrywający górę Synaj (24:15)
Obłok (anan) jednocześnie objawia bliskość Boga i osłania niepojęty blask Jego majestatu przed ludzkim wzrokiem.
27. Spoczęcie chwały PANA na górze Synaj (24:16)
Hebrajskie czasownik szakan („zamieszkać / spocząć”, od którego pochodzi Szechina oraz miszkan — Przybytek) zapowiada, że Bóg pragnie zamieszkać pośród swojego ludu (Wj 25:8).
28. Sześć dni cichego oczekiwania przed obłokiem (24:16)
Mojżesz nie wdziera się zuchwale w obłok, lecz przez sześć pełnych dni cierpliwie czeka i przygotowuje serce na wezwanie PANA.
29. Wezwanie w siódmym dniu — korona Szabatu (24:16)
„W siódmym dniu PAN zawołał na Mojżesza spośród obłoku” — Szabat jest dniem szczególnego spotkania, w którym Bóg zaprasza człowieka do najgłębszej społeczności ze Sobą!
30. Chwała PANA jak ogień pożerający w oczach całego Izraela (24:17)
Podczas gdy Mojżesz słyszy głos Ojca w obłoku, cały obóz u dołu widzi na szczycie płonący ogień świętości (por. Pwt 4:24; Hbr 12:29), który oczyszcza i budzi świętą bojaźń.
31. Odważne wejście w środek obłoku (24:18)
Ponieważ Mojżesz został zawołany przez samego Boga i oczyszczony krwią przymierza, wchodzi bez lęku w środek tego ognia i obłoku.
32. Czterdzieści dni i czterdzieści nocy na górze Boga (24:18)
W biblijnej symbolice liczba czterdzieści oznacza pełny okres duchowego przygotowania, oczyszczenia i przełomu (por. 40 dni Eliasza w 1 Krl 19:8 oraz 40 dni postu Pana Jezusa w Mt 4:2).
33. Człowiek podtrzymywany samą obecnością i Słowem Boga (24:18; Pwt 9:9)
Przez czterdzieści dni i nocy Mojżesz nie jadł chleba i nie pił wody (Pwt 9:9), żyjąc bezpośrednio obecnością Tego, który powiedział: „Nie samym chlebem żyje człowiek, ale każdym słowem pochodzącym z ust Bożych” (Mt 4:4).
34. Narodziny projektu Przybytku i tablic Dekalogu (24:18; Wj 25–31)
To właśnie podczas tych czterdziestu dni na szczycie Synaju Mojżesz otrzyma wzór Przybytku — cienia niebiańskiej świątyni Chrystusa (Hbr 8:5).
35. Przejście od strachu przed górą do mieszkania w chwale (24:17–18)
Rozdział zamyka się obrazem człowieka przebywającego w samym sercu Bożej chwały — zapowiedzią naszego zjednoczenia z Bogiem w Chrystusie.
36. Ostrzeżenie przed duchowym pośpiechem: Bóg mówi w swoim czasie (24:16–18)
Sześć dni ciszy i czterdzieści dni na górze uczą, że najtrwalsze owoce duchowe wymagają wytrwałości i oderwania od zgiełku świata.

CZĘŚĆ V — SYNTEZA TEOLOGICZNA I KLUCZE JĘZYKOWE (WJ 24:1–18)
37. Nierozerwalność Słowa i Krwi:
W Wj 24 Księga Przymierza i krew przymierza występują razem — bez Słowa wiara traci treść, a bez krwi Chrystusa człowiek traci przebaczenie i dostęp do Boga.
38. Od ołtarza ofiary do stołu uczty:
Biblijna droga zbawienia prowadzi zawsze od ołtarza pojednania u stóp góry (krzyża Chrystusa) do stołu społeczności pod szafirowym niebem Bożej obecności.
39. Wspólnota i osobiste spotkanie:
Na Synaju jest miejsce zarówno na wspólne „jednym głosem” całego ludu i ucztę starszych, jak i na osobiste wejście sam na sam z Bogiem w obłok modlitwy.
40. Sefer HaBerit (סֵפֶר הַבְּרִית):
Spisana Księga Przymierza przypomina, że Pismo Święte jest jedyną nieomylną normą wiary i posłuszeństwa ludu Bożego.
41. Dam HaBerit (דַּם־הַבְּרִית):
„Krew przymierza” z Wj 24:8 to bezpośredni klucz do zrozumienia słów Jezusa z Wieczernika i ofiary Golgoty.
42. Naaseh weniszma (נַעֲשֶׂה וְנִשְׁמָע):
Gotowość do czynnego posłuszeństwa („wypełnimy i będziemy posłuszni”) otwiera serce na głębsze poznanie Boga.
43. Liwnat HaSappir (לִבְנַת הַסַּפִּיר):
Szafirowe sklepienie pod stopami Boga przypomina, że ponad burzami ziemi tron Boży spoczywa w doskonałym, błękitnym pokoju.
44. Szakan (שָׁכַן) i Kawod (כָּבוֹד):
Chwała PANA spoczywająca na górze w dniu siódmym zapowiada Słowo, które „stało się ciałem i zamieszkało wśród nas” (J 1:14).
45. Czterdzieści dni na górze:
Czas wytrwałego przebywania ze Słowem Bożym przemienia oblicze człowieka i uzdalnia go do niesienia Bożej prawdy światu.

JEZUS W CENTRUM — POŚREDNIK NOWEGO PRZYMIERZA, JEGO KREW I SZAFIROWY TRON ŁASKI
1. „Oto krew przymierza” — od Mojżesza pod Synajem do Jezusa w Wieczerniku (Wj 24:8; Mt 26:28; Hbr 9:18–20):
Gdy Mojżesz kropił lud krwią i mówił: „Oto krew przymierza, które PAN zawarł z wami” (Wj 24:8), wypowiadał słowa, które znalazły swoje ostateczne wypełnienie w Panu Jezusie Chrystusie: „To jest bowiem moja krew nowego przymierza, która się wylewa za wielu na przebaczenie grzechów” (Mt 26:28, UBG). Krew zwierząt była jedynie cieniem, natomiast krew Chrystusa raz na zawsze oczyszcza nasze sumienia z martwych uczynków, abyśmy mogli służyć Bogu żywemu (Hbr 9:14)!
2. Jedyny Pośrednik wstępujący w samą obecność Ojca (Wj 24:2, 18; 1 Tm 2:5; Hbr 9:24):
Tak jak w Wj 24:2 powiedziano: „Tylko sam Mojżesz zbliży się do PANA”, tak Jezus Chrystus jest naszym jedynym i doskonałym Pośrednikiem między Bogiem a ludźmi, który wszedł nie w ziemski obłok na Synaju, lecz do samego nieba, aby teraz wstawiać się za nami przed obliczem Boga!
3. Uczta w obecności Boga bez lęku przed sądem (Wj 24:10–11; Łk 22:29–30; Rz 5:1–2):
Dzięki krwi Przymierza siedemdziesięciu starszych oglądało Boga ponad szafirowym niebem, jadło i piło, a Bóg „nie wyciągnął na nich swej ręki”. W Chrystusie usprawiedliwieni z wiary mamy pokój z Bogiem, zasiadamy przy stole Wieczerzy Pańskiej i oczekujemy dnia, gdy będziemy jeść i pić przy stole w Jego Królestwie!
4. Prawo Boże wypisane nie tylko na kamieniu, lecz na tablicach serc (Wj 24:12; 2 Kor 3:3; Hbr 8:10):
Na Synaju Mojżesz otrzymał kamienne tablice z Prawem i przykazaniami napisanymi palcem Bożym. W Nowym Przymierzu Chrystus przez Ducha Świętego wypisuje to samo święte Prawo miłości na mięsistych tablicach naszych serc!
5. Góra Przemienienia i czterdzieści dni Chrystusa (Wj 24:13, 16, 18; Mt 4:2; 17:1–5):
Motywy z Wj 24 powracają w życiu Jezusa: czterdzieści dni postu na pustyni przed rozpoczęciem publicznej służby (Mt 4:2) oraz zabranie trzech najbliższych uczniów po sześciu dniach na Górę Przemienienia, gdzie obłok chwały okrył ich i rozległ się głos Ojca: „To jest mój umiłowany Syn... Jego słuchajcie!” (Mt 17:1–5).

SPRAWDŹ W BIBLII — STUDIUM PORÓWNAWCZE (12 ZESTAWIEŃ)
• Wj 24:1–2 → Hbr 9:24; 1 Tm 2:5: W jaki sposób rola Mojżesza zbliżającego się do Boga wskazuje na jedynego Pośrednika, Jezusa Chrystusa?
• Wj 24:3, 7 → Joz 24:24; J 14:15: Dlaczego prawdziwa miłość i przymierze z Bogiem zawsze wyrażają się w posłuszeństwie Jego słowom?
• Wj 24:4 → Rz 15:4; 2 Tm 3:16–17: Dlaczego Bóg polecił spisać swoje słowa w Księdze i jaką wartość ma dziś dla nas spisane Pismo Święte?
• Wj 24:6–8 → Hbr 9:18–22: Dlaczego ani pierwsze, ani Nowe Przymierze nie zostało zapoczątkowane bez przelania krwi?
• Wj 24:8 → Mt 26:28; 1 P 1:2: Jak słowa Mojżesza „Oto krew przymierza” łączą się z kielichem Wieczerzy Pańskiej i pokropieniem krwią Jezusa?
• Wj 24:9–10 → Ez 1:26; Obj 4:2–6: Co symbolizuje szafirowy tron i krystaliczne, jasne niebo pod stopami Boga?
• Wj 24:11 → Ps 23:5; Obj 19:9: Jak uczta starszych na Synaju zapowiada stół Pański i wesele Baranka?
• Wj 24:12 → Wj 31:18; 2 Kor 3:3: Jaka jest relacja między kamiennymi tablicami Dekalogu a prawem wypisanym przez Ducha w sercu wierzącego?
• Wj 24:13 → Wj 32:17; Joz 1:1: Jak wierna służba Jozuego u boku Mojżesza przygotowała go do późniejszego przywództwa?
• Wj 24:14 → Mt 24:45–46; 1 Tes 5:14: Czego słowa „Zostańcie tu, aż wrócimy” uczą nas o wiernym trwaniu do powrotu Pana Jezusa?
• Wj 24:16–17 → Mt 17:1–5; Hbr 12:28–29: Co łączy wezwanie Mojżesza w siódmym dniu spośród obłoku i ognia z Górą Przemienienia oraz naszą czcią dla Boga?
• Wj 24:18 → Pwt 9:9; Mt 4:1–4: Jak czterdzieści dni Mojżesza na górze koresponduje z czterdziestoma dniami Pana Jezusa na pustyni?

PRAWDA NA DZIŚ (8 ZASAD — CO ZMIENIA SIĘ W MOIM PATRZENIU)
• 1. Moje zbawienie i pokój z Bogiem spoczywają na Krwi Przymierza: Nie zbliżam się do Boga na podstawie własnych zasług, lecz przez przelaną krew Jezusa Chrystusa.
• 2. Słowo Boże spisane jest kotwicą mojego tygodnia: Tak jak Mojżesz spisał i odczytał Księgę Przymierza, tak ja codziennie karmię się spisanym Pismem Świętym.
• 3. Wiara mówi Bogu: „Wypełnimy i będziemy posłuszni”: Prawdziwe słuchanie Słowa zawsze prowadzi do konkretnego posłuszeństwa w czynach.
• 4. Nad dzieckiem Przymierza lśni szafirowe, pogodne niebo: Choć wokół na ziemi bywają burze, w Chrystusie mam nad sobą czyste niebo Bożego pojednania.
• 5. Bóg zaprasza mnie do swojego stołu, a nie na stracenie: Dzięki krwi Baranka ręka sądu jest powstrzymana, a ja mogę radować się społecznością z Ojcem.
• 6. Głębia duchowa wymaga wejścia na górę i cierpliwego czekania: Najważniejsze Boże słowa słyszy ten, kto potrafi jak Mojżesz wyjść ponad hałas obozu i poczekać w ciszy.
• 7. Siódmy dzień (Szabat) jest dniem szczególnego głosu z obłoku: Po sześciu dniach drogi Bóg w siódmym dniu zaprasza mnie do głębszego wejścia w Jego chwałę.
• 8. Prawo Boże ma żyć w moim sercu i nauczaniu: Przykazania napisane przez Boga są światłem, którego mam się uczyć i którym mam dzielić się z bliźnimi.

POMYŚL — PYTANIA DO SERCA (8 PYTAŃ)
1. Czy na progu nowego tygodnia Twoje sumienie czerpie pokój z krwi Nowego Przymierza w Chrystusie, czy wciąż próbujesz sam udowodnić Bogu swoją wartość?
2. W jakiej konkretnej sprawie Bóg czeka dziś na Twoje szczere wyznanie: „Wypełnię wszystko, co PAN mówił, i będę posłuszny”?
3. Czy tak jak Mojżesz wstający wcześnie rano do budowy ołtarza, oddajesz Bogu pierwszą, najlepszą chwilę swojego poranka?
4. Co w Twoim codziennym życiu przypomina jeszcze „błotną cegłę egipskiego pośpiechu”, którą Bóg chce zastąpić pokojem szafirowego nieba swojej obecności?
5. Jak przeżywasz wspólnotę przy stole Pańskim i przy posiłkach w swoim domu — czy pamiętasz, że każdy dar jedzenia i picia odbywa się przed obliczem dobrego Boga?
6. Czy w Twoim życiu jest „Jozue” — osoba, którą wprowadzasz w wiarę i modlitwę, albo dojrzały przewodnik, przy którym sam uczysz się wierności?
7. Czy potrafisz cierpliwie czekać na Bożą odpowiedź przez „sześć dni ciszy”, zanim w siódmym dniu usłyszysz wyraźny głos Pana z obłoku?
8. Czy podczas pozornej „nieobecności” widocznych znaków pozostajesz wierny Bożym przykazaniom w obozie codzienności, czekając na powrót Pana?

MAŁY QUIZ WIEDZY BIBLIJNEJ (20 PYTAŃ Z WJ 24:1–18)
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
Dwudziesty czwarty rozdział Księgi Wyjścia stawia przed Tobą niesamowite zaproszenie. Bóg, którego chwała płonie na szczycie Synaju jak ogień pożerający, nie chce, abyś przez całe życie stał z daleka w paraliżującym lęku. Przez spisaną Księgę Jego Słowa i przez przelaną Krew Przymierza — krew Jezusa Chrystusa, Baranka Bożego — otworzył Ci drogę na górę, rozpostarł nad Tobą szafirowe niebo przebaczenia i zastawił dla Ciebie stół pokoju.
Podejmij dziś świadomą decyzję: przyjmij z wiarą oczyszczenie w krwi Nowego Przymierza, odpowiedz Bogu całym sercem „Wypełnię i będę posłuszny” oraz znajdź w tym tygodniu cichy czas sam na sam z Panem na górze modlitwy!

MOJA DECYZJA:
„Panie Jezu Chryste, Pośredniku Nowego Przymierza, dziękuję Ci za Twoją świętą krew przelaną na przebaczenie moich grzechów, dzięki której mam pokój z Ojcem i przystęp pod szafirowe niebo Twojej łaski. Świadomie odnawiam dziś moje przymierze z Tobą: pragnę słuchać Twojego spisanego Słowa, wypełniać Twoje przykazania z miłością i trwać wiernie w Twojej obecności każdego dnia.”

MODLITWA NA 23 LISTOPADA 2026 R.
Święty, Wszechmogący Boże Izraela, nasz Ojcze w niebie! Dziękujemy Ci za majestatyczny dwudziesty czwarty rozdział Księgi Wyjścia, w którym odsłaniasz przed nami zarówno ogień swojej chwały na szczycie Synaju, jak i czysty, szafirowy błękit łaski pod Twoimi stopami. Dziękujemy Ci, że spisałeś swoje Słowo i zawarłeś ze swoim ludem Przymierze życia.
Przepraszamy Cię za wszystkie chwile, w których nasze usta mówiły „Wypełnimy i będziemy posłuszni”, a nasze czyny szybko o tym zapominały. Przepraszamy za pośpiech i zniecierpliwienie, przez które tak rzadko zatrzymujemy się w ciszy, by słuchać Twojego głosu.
Panie Jezu Chryste, dziękujemy Ci za Twoją krew Nowego Przymierza, przelaną za nas na krzyżu Golgoty. Dziękuję Ci, że dzięki Twojej ofierze nie wyciągasz przeciwko nam ręki sądu, lecz zapraszasz nas do swojego stołu, karmisz swoim Słowem i wprowadzasz w obecność Ojca. Wypisz swoje święte Prawo na tablicach naszych serc i prowadź nas przez cały ten nowy tydzień. W Twoim świętym imieniu. Amen!

ZADANIE NA DZIŚ (7 ZADAŃ TAKTYCZNYCH)
1. Przeczytaj uważnie cały 24. rozdział Księgi Wyjścia (Wj 24:1–18 UBG) oraz Ewangelię Mateusza 26:26–29 i List do Hebrajczyków 9:18–24.
2. Zapamiętaj werset Wj 24:8 i zestaw go w modlitwie dziękczynnej ze słowami Pana Jezusa z Mt 26:28.
3. Rozpocznij ten poniedziałek od porannego „ołtarza modlitwy” — oddaj Bogu pierwsze minuty dnia i wypowiedz świadome „Wypełnię i będę posłuszny” w swoim dzisiejszym zadaniu.
4. Podczas dzisiejszego posiłku zatrzymaj się na chwilę dłużej w dziękczynieniu, pamiętając o uczcie starszych przed obliczem Boga (Wj 24:11) i o zaproszeniu na Ucztę Baranka.
5. Spójrz w ciągu dnia w niebo (Wj 24:10) i przypomnij sobie, że dzięki krwi Chrystusa ponad wszystkimi troskami tego tygodnia panuje szafirowy pokój Bożego tronu.
6. Wyznacz w swoim tygodniowym planie osobisty czas ciszy „na górze z Bogiem” — bez telefonu i pośpiechu, sam na sam z otwartą Biblią.
7. Oznacz Dzień 54 jako ukończony w Akademii i prześlij tę lekcję osobie, która potrzebuje na progu nowego tygodnia pokoju i pewności Bożego Przymierza!

JUTRO — 24 LISTOPADA 2026 R.
DZIEŃ 55: DOBROWOLNY DAR SERCA, ARKA PRZYMIERZA, STÓŁ I ZŁOTY ŚWIECZNIK (WJ 25:1–40)
Jutro w 25. rozdziale Księgi Wyjścia wejdziemy razem z Mojżeszem w sam środek niebiańskiego objawienia na górze Synaj! Usłyszymy wspaniałe słowa Boga: „Niech uczynią mi świątynię, abym mieszkał pośród nich”, i przyjrzymy się z bliska Arce Przymierza z przebłagalnią, stołowi na chleby pokładne oraz siedmioramiennemu złotemu świecznikowi (Menorze), w których każdy szczegół wskazuje na Jezusa Chrystusa!`;

// ── 3. GENEROWANIE PLIKU WORD (.DOCX) ──
console.log('📄 Generuję profesjonalny plik Microsoft Word (.docx) dla Dnia 54...');

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

// Zgodnie z Dyrektywą Czystego Pulpitu (AGENTS.md Sekcja 15) zapisujemy w folderze Google Drive:
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

// ── 5. BUDOWANIE PLIKU HTML LEKCJI (SZABLON DZIEŃ 53 = 21/21) ──
console.log('🌐 Generuję plik HTML lekcji Dnia 54 (4 ścieżki Clean URLs + kolejka)...');
const template53Path = path.join(REPO, 'akademia/kurscodzienny/dzien-53.html');
let html = fs.readFileSync(template53Path, 'utf8');

// 5.1 Meta, tytuły i social share
html = html.replace(
  /<title>Dzień 53: [^<]+<\/title>/,
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
  /<meta property="og:description" content="[^"]+"[^>]*>/,
  `<meta property="og:description" content="${SUBTITLE}" />`
);
html = html.replace(
  /kc_day_53_sprawiedliwy_sad_aniol_przymierza\.jpg(\?v=\d+)?/g,
  `${IMG_FILENAME}?v=20261123`
);

html = html.replace(/kurscodzienny%2Fdzien-53/g, `kurscodzienny%2Fdzien-${DAY_NUM}`);
html = html.replace(
  /Z%20Bibli%C4%85%20za%20Pan%20Brat%20%E2%80%94%20Dzie%C5%84%2053[^"']+/g,
  encodeURIComponent(`Z Biblią za Pan Brat — Dzień ${DAY_NUM}: ${TITLE} (${READING})`)
);
html = html.replace(
  /Jedno kliknięcie może przynieść odwagę prawdy i pewność obecności Anioła Przymierza komuś, kto dziś szczególnie jej potrzebuje\./,
  'Jedno kliknięcie może przynieść pokój Krwi Przymierza i światło Bożej obecności komuś, kto dziś szczególnie tego potrzebuje.'
);

// 5.2 Nawigacja i okruszki
html = html.replace(
  /<span class="text-amber-400 font-semibold">Dzień 53<\/span>/,
  `<span class="text-amber-400 font-semibold">Dzień ${DAY_NUM}</span>`
);

const nav53Regex =
  /<a href="\/akademia\/kurscodzienny\/dzien-52"[\s\S]*?<\/a>\s*<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50[\s\S]*?<\/span>/;
const nav54Block = `<a href="/akademia/kurscodzienny/dzien-53" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 53</span>
        </a>
        <span class="px-3 py-1.5 rounded-lg bg-zinc-900/50 text-xs text-zinc-600 flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 55 (Wtorek) →</span>
        </span>`;
if (!nav53Regex.test(html)) {
  throw new Error('Nie znaleziono bloku nawigacji Dnia 53 w szablonie');
}
html = html.replace(nav53Regex, nav54Block);

// 5.3 Hero i grafika
html = html.replace(/<span>Dzień 53 z 2009<\/span>/g, `<span>Dzień ${DAY_NUM} z 2009</span>`);
html = html.replace(/22 LISTOPADA 2026 • NIEDZIELA/g, DATE_SHORT_UPPER);
html = html.replace(
  /<h1 class="[^"]+">[\s\S]*?<\/h1>/,
  `<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">\n        ${TITLE}\n      </h1>`
);
html = html.replace(
  /<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">[\s\S]*?<\/p>/,
  `<p class="text-lg sm:text-xl text-zinc-300 font-serif italic">\n        ${SUBTITLE}\n      </p>`
);
html = html.replace(
  /alt="Dzień 53:[^"]*"/,
  `alt="Dzień ${DAY_NUM}: ${TITLE} (${READING})"`
);
html = html.replace(
  /<span>Ilustracja biblijna:[^<]*<\/span>/,
  `<span>${IMG_CAPTION}</span>`
);
html = html.replace(/Czytanie: Wj 23:1–33/g, `Czytanie: ${READING}`);

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
          <p class="text-xs text-zinc-400 font-semibold">— Księga Wyjścia 24:8 (UBG)</p>
        </div>
        <button
          onclick="navigator.clipboard.writeText('„${MEMORY_VERSE_QUOTE}” — Księga Wyjścia 24:8 (UBG)'); this.innerHTML = '<i class=\\'fa-solid fa-check\\'></i> Skopiowano'; setTimeout(() => this.innerHTML = '<i class=\\'fa-regular fa-copy\\'></i> Kopiuj', 2000);"
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
  `<!-- LESSON BODY CONTENT (Dzień ${DAY_NUM}, 23.11.2026) -->`
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
            Dziś jest <strong class="text-white">Dzień 54</strong>: Księga Wyjścia, <strong class="text-brand-gold">${READING}</strong>. W tym niezwykłym rozdziale jesteśmy świadkami uroczystej ratyfikacji Przymierza krwią ofiar, oglądania Boga Izraela ponad szafirowym niebem podczas uczty starszych oraz wejścia Mojżesza w obłok chwały na czterdzieści dni i nocy.
          </p>
          <p>
            Zanim przejdziesz do komentarza, przeczytaj spokojnie wszystkie osiemnaście wersetów w przekładzie UBG. Zwróć uwagę na słowa z wersetu 8 („Oto krew przymierza”), które piętnaście wieków później powtórzy Pan Jezus w Wieczerniku!
          </p>
          <a href="/mojabiblia?book=EXO&chapter=24" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]"><i class="fa-solid fa-book-open"></i><span>Czytaj ${READING}</span></a>
        </div>
      </article>`
);

// 5.6 Tekst Pisma Świętego
html = html.replace(
  /<!-- SCRIPTURE SECTION[^>]*-->/,
  `<!-- SCRIPTURE SECTION (${READING}) -->`
);
html = html.replace(
  /Uwspółcześniona Biblia Gdańska \(UBG\) • Wj 23:1–33/g,
  `Uwspółcześniona Biblia Gdańska (UBG) • ${READING}`
);
html = html.replace(/\/mojabiblia\?book=EXO&chapter=23/g, `/mojabiblia?book=EXO&chapter=24`);
html = html.replace(/\/mojabiblia\?book=EXO&amp;chapter=23/g, `/mojabiblia?book=EXO&amp;chapter=24`);
html = html.replace(
  /<div class="kc-prose-reading">[\s\S]*?<\/div>\s*<\/section>\s*<!-- KLUCZE JĘZYKOWE/,
  `<div class="kc-prose-reading">\n        ${buildVersesParagraphsHtml()}\n        </div>\n      </section>\n\n      <!-- KLUCZE JĘZYKOWE`
);

// 5.7 Klucze Językowe & Kody Stronga
const strongChips54 = `<span class="strong-chip"><span class="strong-id">H5066</span> <span class="strong-orig">נָגַשׁ (Nagasz)</span> — zbliżyć się, przystąpić do PANA jako pośrednik przymierza (Wj 24:2)</span>
          <span class="strong-chip"><span class="strong-id">H4676</span> <span class="strong-orig">מַצֵּבָה (Maccewa)</span> — dwanaście słupów pamiątkowych odpowiadających dwunastu pokoleniom Izraela (Wj 24:4)</span>
          <span class="strong-chip"><span class="strong-id">H8002</span> <span class="strong-orig">שֶׁלֶם (Szelem)</span> — ofiara pojednawcza / pokoju wyrażająca wspólnotę z Bogiem (Wj 24:5)</span>
          <span class="strong-chip"><span class="strong-id">H1285</span> <span class="strong-orig">בְּרִית (Berit)</span> — przymierze; Księga Przymierza (Sefer HaBerit) i krew przymierza (Dam HaBerit) (Wj 24:7–8)</span>
          <span class="strong-chip"><span class="strong-id">H5601</span> <span class="strong-orig">סַפִּיר (Sappir)</span> — szafir; szafirowe dzieło pod stopami Boga jak czyste niebo (Wj 24:10)</span>
          <span class="strong-chip"><span class="strong-id">H2372</span> <span class="strong-orig">חָזָה (Chaza)</span> — oglądać Boga i zasiadać do uczty przymierza w pokoju (Wj 24:11)</span>
          <span class="strong-chip"><span class="strong-id">H8451</span> <span class="strong-orig">תּוֹרָה (Tora)</span> — Prawo i pouczenie Boże zapisane dla nauczania ludu (Wj 24:12)</span>
          <span class="strong-chip"><span class="strong-id">H3519</span> <span class="strong-orig">כָּבוֹד (Kawod)</span> — chwała PANA spoczywająca na górze Synaj jak ogień pożerający (Wj 24:16–17)</span>`;

html = html.replace(
  /Klucze Językowe &amp; Kody Stronga \(Wj 23:1–33\)/g,
  `Klucze Językowe &amp; Kody Stronga (${READING})`
);
html = html.replace(
  /Poniższe terminy hebrajskie tworzą osnowę teologiczną 23\. rozdziału Księgi Wyjścia[\s\S]*?<\/p>/,
  `Poniższe terminy hebrajskie tworzą osnowę teologiczną 24. rozdziału Księgi Wyjścia (pośrednictwo Mojżesza, ołtarz i 12 słupów, krew przymierza, szafirowe niebo, uczta starszych, kamienne tablice Tory oraz chwała PANA w obłoku):</p>`
);
html = html.replace(
  /<div class="flex flex-wrap gap-2">[\s\S]*?<\/div>\s*<\/section>\s*<!-- THEOLOGICAL EXEGESIS/,
  `<div class="flex flex-wrap gap-2">\n          ${strongChips54}\n        </div>\n      </section>\n\n      <!-- THEOLOGICAL EXEGESIS`
);

// 5.8 Egzegeza (5 części, 45 punktów)
html = html.replace(
  /Pięć części studium Wj 23:1–33 \(45 punktów analitycznych\)/g,
  `Pięć części studium ${READING} (45 punktów analitycznych)`
);

const exegesis54 = `<!-- CZĘŚĆ I -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
            KSIĘGA I KREW PRZYMIERZA U STÓP GÓRY SYNAJ (WJ 24:1–8)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>1. Stopniowany dostęp do świętości Boga (24:1–2):</strong> Lud u stóp góry, starsi na zboczu, a sam Mojżesz na szczycie — zapowiedź ładu świątyni i jedynego Pośrednika.</p>
            <p><strong>2. Wierny przekaz całego Słowa Bożego (24:3):</strong> Mojżesz opowiada ludowi wszystkie słowa i wszystkie prawa PANA bez niczego ukrytego.</p>
            <p><strong>3. Jednogłośna odpowiedź wiary ludu (24:3):</strong> „Cały lud odpowiedział jednym głosem: Wypełnimy wszystkie słowa, które PAN powiedział”.</p>
            <p><strong>4. Spisanie Słowa Bożego jako trwały fundament (24:4):</strong> Mojżesz spisuje słowa PANA, chroniąc Boże objawienie przed zapomnieniem i zniekształceniem.</p>
            <p><strong>5. Poranna gorliwość o świcie (24:4):</strong> Wczesny poranek poświęcony na budowę ołtarza uczy oddawania Bogu pierwszych chwil dnia.</p>
            <p><strong>6. Jeden ołtarz i dwanaście słupów (24:4):</strong> Ołtarz reprezentuje Boga, a dwanaście słupów (<em>maccewa</em>) dwanaście pokoleń Izraela zjednoczonych wokół Pana.</p>
            <p><strong>7. Służba młodzieńców i dwie postacie ofiar (24:5):</strong> Całopalenia wyrażały pełne oddanie Bogu, a ofiary pojednawcze (<em>szelamim</em>) pokój i społeczność z Nim.</p>
            <p><strong>8. Podział krwi między ołtarz a czasze (24:6):</strong> Połowa krwi na ołtarzu i połowa dla ludu łączy obie strony świętego Przymierza.</p>
            <p><strong>9. Odczytanie Księgi Przymierza i „Wypełnimy oraz będziemy posłuszni” (24:7):</strong> Publiczna lektura <em>Sefer HaBerit</em> poprzedza pokropienie krwią.</p>
            <p><strong>10. „Oto krew przymierza” (24:8):</strong> Prorocza formuła Mojżesza (<em>Dam HaBerit</em>), którą Pan Jezus wypowie w Wieczerniku nad kielichem Nowego Przymierza (Mt 26:28).</p>
          </div>
        </div>

        <!-- CZĘŚĆ II -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
            SZAFIROWE NIEBO I UCZTA STARSZYCH PRZED OBLICZEM BOGA (WJ 24:9–11)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>11. Wstąpienie reprezentantów narodu (24:9):</strong> Mojżesz, Aaron, Nadab, Abihu i siedemdziesięciu starszych wchodzą na zbocze po pokropieniu krwią.</p>
            <p><strong>12. „I widzieli Boga Izraela” (24:10):</strong> Starsi oglądają widzialną teofanię chwały Syna Bożego — Króla Izraela.</p>
            <p><strong>13. Dzieło z szafirowego kamienia pod Jego stopami (24:10):</strong> Szafir (<em>sappir</em>) ukazuje królewski majestat i czystość niebiańskiego tronu (por. Ez 1:26).</p>
            <p><strong>14. „Jak niebo, gdy jest jasne” (24:10):</strong> Po gromach i dymie krew przymierza odsłania nad odkupionymi pogodne, bezchmurne niebo Bożego pokoju.</p>
            <p><strong>15. Od glinianej cegły Egiptu do szafirowej tafli nieba (24:10):</strong> Hebrajskie <em>liwnat</em> („cegła / tafla”) kontrastuje błoto niewoli z szafirem Bożego królestwa.</p>
            <p><strong>16. „PAN nie wyciągnął swej ręki” (24:11):</strong> Krew przymierza osłania grzeszników przed sądem, dzięki czemu mogą bezpiecznie przebywać blisko Boga.</p>
            <p><strong>17. „Widzieli Boga, jedli i pili” (24:11):</strong> Uczta przymierza na świętej górze pieczętuje przyjaźń i pojednanie między Bogiem a Jego ludem.</p>
            <p><strong>18. Zapowiedź Wieczerzy Pańskiej i Uczty Baranka (24:11; Obj 19:9):</strong> Posiłek starszych na Synaju zapowiada stół Pański i wieczną ucztę w Królestwie Bożym.</p>
          </div>
        </div>

        <!-- CZĘŚĆ III -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
            KAMIENNE TABLICE I PORZĄDEK W OBOZIE PODCZAS OCZEKIWANIA (WJ 24:12–14)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>19. Wezwanie na szczyt: „Wstąp do mnie na górę i bądź tam” (24:12):</strong> Bóg zaprasza do trwałego przebywania w Jego obecności, a nie tylko przelotnej wizyty.</p>
            <p><strong>20. Kamienne tablice zapisane przez Boga (24:12):</strong> Kamień świadczy o niezmiennej trwałości Bożego Dekalogu.</p>
            <p><strong>21. „Prawo i przykazania, które napisałem, abyś ich nauczał” (24:12):</strong> Objawienie jest dane po to, by wiernie nauczać go cały lud.</p>
            <p><strong>22. Wierny sługa Jozue u boku Mojżesza (24:13):</strong> Jozue idzie z Mojżeszem na górę Boga, ucząc się wierności i wytrwałości.</p>
            <p><strong>23. Odpowiedzialny porządek przed odejściem lidera (24:14):</strong> Mojżesz zabezpiecza opiekę duszpasterską i sądową nad obozem.</p>
            <p><strong>24. Aaron i Chur jako stróże sprawiedliwości (24:14):</strong> „Kto by miał jakąś sprawę, niech idzie do nich” — ciągłość prawa podczas nieobecności Mojżesza.</p>
            <p><strong>25. Polecenie „Zostańcie tu, aż wrócimy” (24:14):</strong> Sprawdzian cierpliwej wierności w czasie oczekiwania na powrót z góry.</p>
          </div>
        </div>

        <!-- CZĘŚĆ IV -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
            SZEŚĆ DNI OCZEKIWANIA, SIÓDMY DZIEŃ WEZWANIA I OGIEŃ CHWAŁY (WJ 24:15–18)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>26. Obłok zakrywający górę (24:15):</strong> Obłok (<em>anan</em>) stanowi zasłonę i znak zamieszkania Najwyższego.</p>
            <p><strong>27. Spoczęcie chwały PANA na Synaju (24:16):</strong> Czasownik <em>szakan</em> („spocząć / zamieszkać”) zapowiada Przybytek pośród Izraela.</p>
            <p><strong>28. Sześć dni cichego czuwania przed obłokiem (24:16):</strong> Mojżesz cierpliwie czeka, aż sam Bóg otworzy mu wejście do swojej chwały.</p>
            <p><strong>29. Wezwanie w siódmym dniu — błogosławieństwo Szabatu (24:16):</strong> „W siódmym dniu PAN zawołał na Mojżesza spośród obłoku” — dzień Szabatu jako czas szczególnego głosu Boga.</p>
            <p><strong>30. Chwała PANA jak ogień pożerający (24:17):</strong> W oczach całego obozu szczyt góry płonie świętym ogniem Bożej obecności (por. Hbr 12:29).</p>
            <p><strong>31. Wejście w sam środek obłoku (24:18):</strong> Oczyszczony krwią przymierza pośrednik wchodzi bezpiecznie w środek chwały.</p>
            <p><strong>32. Czterdzieści dni i czterdzieści nocy na górze (24:18):</strong> Pełny czas formacji, postu i przyjęcia niebiańskiego wzoru Przybytku.</p>
            <p><strong>33. Życie każdym słowem z ust Bożych (24:18; Pwt 9:9):</strong> Przez 40 dni Mojżesz jest podtrzymywany samą obecnością Pana.</p>
            <p><strong>34. Otrzymanie projektu Przybytku (24:18; Wj 25–31):</strong> Na górze rodzi się plan świątyni, w której każdy element mówi o Chrystusie.</p>
            <p><strong>35. Od lęku u podnóża do komunii w obłoku (24:17–18):</strong> Droga wiary prowadzi od bojaźni ku głębokiej zażyłości z Bogiem.</p>
            <p><strong>36. Lekcja cierpliwości duchowej (24:16–18):</strong> Boże objawienie nie znosi pośpiechu — wymaga ciszy i wytrwałości.</p>
          </div>
        </div>

        <!-- CZĘŚĆ V -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">V</span>
            SYNTEZA TEOLOGICZNA I KLUCZE JĘZYKOWE (WJ 24:1–18)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>37. Jedność Księgi i Krwi:</strong> Spisane Słowo Boże i Krew Przymierza razem tworzą fundament naszego zbawienia.</p>
            <p><strong>38. Od ołtarza ofiary do stołu uczty:</strong> Pojednanie przez krew otwiera drzwi do radosnego stołu przed obliczem Boga.</p>
            <p><strong>39. Wymiar wspólnotowy i osobisty:</strong> Lud odpowiada jednym głosem, starsi ucztują razem, a Mojżesz wchodzi osobiście w obłok.</p>
            <p><strong>40. <em>Sefer HaBerit</em> (סֵפֶר הַבְּרִית):</strong> Księga Przymierza jako spisany, niezmienny autorytet Bożego Słowa.</p>
            <p><strong>41. <em>Dam HaBerit</em> (דַּם־הַבְּרִית):</strong> Krew Przymierza z Wj 24:8 wypełniona w kielichu Nowego Przymierza Chrystusa.</p>
            <p><strong>42. <em>Naaseh weniszma</em> (נַעֲשֶׂה וְנִשְׁמָע):</strong> Deklaracja czynnego posłuszeństwa: „Wypełnimy i będziemy posłuszni”.</p>
            <p><strong>43. <em>Liwnat HaSappir</em> (לִבְנַת הַסַּפִּיר):</strong> Szafirowe, jasne niebo pod stopami Boga jako znak pojednania i pokoju.</p>
            <p><strong>44. <em>Szakan</em> (שָׁכַן) i <em>Kawod</em> (כָּבוֹד):</strong> Chwała PANA spoczywająca na górze i wzywająca człowieka w siódmym dniu.</p>
            <p><strong>45. Czterdzieści dni w obłoku:</strong> Wytrwałe przebywanie z Bogiem przemienia serce do służby innym.</p>
          </div>
        </div>`;

html = html.replace(
  /<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">[\s\S]*?<\/div>\s*<\/section>\s*<!-- ── JEZUS W CENTRUM ── -->/,
  `<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">\n        ${exegesis54}\n        </div>\n      </section>\n\n      <!-- ── JEZUS W CENTRUM ── -->`
);

// 5.9 Jezus w Centrum
const jesus54 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Krew Nowego Przymierza, Uczta pod Szafirowym Niebem i Pośrednik w Chwale Ojca
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            <strong>1. „Oto krew przymierza” — od Synaju do Wieczernika i Golgoty (Wj 24:8; Ewangelia Mateusza 26:28; List do Hebrajczyków 9:18–20):</strong> Gdy Mojżesz pokropił lud krwią, mówiąc: „Oto krew przymierza, które PAN zawarł z wami”, wypowiedział słowa, które piętnaście wieków później powtórzył sam Pan Jezus Chrystus nad kielichem Wieczerzy Pańskiej: „To jest bowiem moja krew nowego przymierza, która się wylewa za wielu na przebaczenie grzechów”!
          </p>
          <p>
            <strong>2. Jedyny Pośrednik zbliżający się do Boga w naszym imieniu (Wj 24:2, 18; 1 Tymoteusza 2:5; Hebrajczyków 9:24):</strong> Jak tylko Mojżesz mógł wejść w sam środek obłoku na szczycie góry, tak Jezus Chrystus wszedł do samego nieba, aby wstawiać się za nami przed obliczem Ojca i otworzyć nam śmiały przystęp do tronu łaski.
          </p>
          <p>
            <strong>3. Bezpieczna uczta przed obliczem Boga pod szafirowym niebem (Wj 24:10–11; Ewangelia Łukasza 22:29–30; Objawienie 19:9):</strong> Dzięki krwi Przymierza Bóg nie wyciągnął ręki sądu na starszych, lecz pozwolił im oglądać swoją chwałę oraz jeść i pić w pokoju — co znajduje spełnienie przy stole Pańskim i na wiecznej Uczcie Weselnej Baranka!
          </p>
          <p>
            <strong>4. Prawo Boże na kamiennych tablicach i na tablicach naszych serc (Wj 24:12; 2 Koryntian 3:3; Hebrajczyków 8:10):</strong> Ten sam Bóg, który napisał Prawo i przykazania na kamiennych tablicach dla Mojżesza, w Chrystusie przez Ducha Świętego wypisuje swoje święte Prawo miłości w naszych sercach.
          </p>
          <p>
            <strong>5. Sześć dni, obłok chwały i czterdzieści dni Syna Bożego (Wj 24:16–18; Ewangelia Mateusza 4:2; 17:1–5):</strong> Wezwanie Mojżesza po sześciu dniach spośród obłoku oraz jego czterdziestodniowy pobyt na górze zapowiadają czterdzieści dni postu Jezusa na pustyni oraz Górę Przemienienia, gdzie z jasnego obłoku zabrzmiał głos Ojca: „To jest mój umiłowany Syn, jego słuchajcie!”.
          </p>
          <div class="pt-2">
            <a href="/mojabiblia?book=EXO&chapter=24" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
              <i class="fa-solid fa-book-open"></i>
              <span>Czytaj ${READING}</span>
            </a>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── JEZUS W CENTRUM ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-cross"><\/i>\s*<span>Jezus w centrum<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── SPRAWDŹ W BIBLII ── -->)/,
  `$1${jesus54}\n      $2`
);

// 5.10 Sprawdź w Biblii
const compare54 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Sprawdź w Biblii — 12 Wersetów Porównawczych (${READING})
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300 font-serif">
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 24:1–2 → List do Hebrajczyków 9:24; 1 Tymoteusza 2:5</strong>: Jak pośrednictwo Mojżesza wskazuje na Jezusa Chrystusa?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 24:3, 7 → Księga Jozuego 24:24; Ewangelia Jana 14:15</strong>: Dlaczego przymierze z Bogiem wyraża się w posłuszeństwie Jego słowom?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 24:4 → List do Rzymian 15:4; 2 Tymoteusza 3:16–17</strong>: Dlaczego Bóg nakazał spisać swoje słowa w Księdze?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 24:6–8 → List do Hebrajczyków 9:18–22</strong>: Dlaczego przymierze wymagało oczyszczenia i przypieczętowania krwią?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 24:8 → Ewangelia Mateusza 26:28; 1 Piotra 1:2</strong>: Jak słowa „Oto krew przymierza” wypełniają się w Wieczerzy Pańskiej i krzyżu?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 24:9–10 → Księga Ezechiela 1:26; Objawienie 4:2–6</strong>: Co oznacza szafirowy tron i jasne niebo pod stopami Boga?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 24:11 → Psalm 23:5; Objawienie 19:9</strong>: Jak uczta starszych na Synaju zapowiada Ucztę Weselną Baranka?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 24:12 → 2 List do Koryntian 3:3; Hebrajczyków 8:10</strong>: Jak kamienne tablice łączą się z prawem wypisanym przez Ducha w sercu?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 24:13 → Księga Wyjścia 32:17; Jozuego 1:1</strong>: Czego uczy nas wierność Jozuego czekającego na zboczu góry?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 24:14 → Ewangelia Mateusza 24:45–46</strong>: Czego słowa „Zostańcie tu, aż wrócimy” uczą o wierności do powrotu Chrystusa?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 24:16–17 → Ewangelia Mateusza 17:1–5; Hebrajczyków 12:28–29</strong>: Co łączy głos z obłoku po sześciu dniach z Górą Przemienienia?</div>
          <div class="p-3 rounded-lg bg-black/40 border border-brand-line"><strong class="text-amber-300">Wj 24:18 → Księga Powtórzonego Prawa 9:9; Mateusza 4:1–4</strong>: Jak 40 dni Mojżesza na górze zapowiada 40 dni Jezusa na pustyni?</div>
        </div>`;

html = html.replace(
  /(<!-- ── SPRAWDŹ W BIBLII ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-magnifying-glass"><\/i>\s*<span>Porównaj wersety we własnym Piśmie Świętym<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── PRAWDA NA DZIŚ ── -->)/,
  `$1${compare54}\n      $2`
);

// 5.11 Prawda na dziś
const truth54 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          8 Zasad Krwi Przymierza, Stołu Łaski i Obecności Boga — co zmienia się w moim patrzeniu
        </h3>
        <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>• <strong>1. Mój dostęp do Boga opiera się na Krwi Przymierza:</strong> Nie przychodzę przed oblicze Ojca z własną doskonałością, lecz oczyszczony krwią Jezusa Chrystusa.</p>
          <p>• <strong>2. Spisane Słowo Boże jest moim kompasem:</strong> Tak jak Mojżesz spisał i odczytał Księgę Przymierza, tak ja opieram życie na spisanym Piśmie Świętym.</p>
          <p>• <strong>3. Prawdziwa wiara odpowiada: „Wypełnimy i będziemy posłuszni”:</strong> Słuchanie Słowa Bożego znajduje dopełnienie w konkretnym posłuszeństwie każdego dnia.</p>
          <p>• <strong>4. Nad dzieckiem Przymierza lśni szafirowe, jasne niebo:</strong> Dzięki krwi Chrystusa burze sądów ustępują miejsca pogodnemu niebu Bożej łaski.</p>
          <p>• <strong>5. Bóg zaprasza mnie do stołu społeczności:</strong> W Chrystusie Bóg nie wyciąga przeciwko mnie ręki potępienia, lecz karmi mnie w swojej obecności.</p>
          <p>• <strong>6. Pierwsze minuty poranka należą do ołtarza modlitwy:</strong> Jak Mojżesz wstający rano u stóp Synaju, zaczynam dzień od spotkania z Panem.</p>
          <p>• <strong>7. Siódmy dzień (Szabat) jest czasem szczególnego wezwania z obłoku:</strong> Po sześciu dniach drogi Bóg zaprasza mnie w Szabat do głębszego wejścia w Jego chwałę.</p>
          <p>• <strong>8. Czas sam na sam z Bogiem przemienia serce:</strong> Wytrwałe przebywanie ze Słowem na górze modlitwy daje siłę do wiernej służby w dolinie codzienności.</p>
        </div>`;

html = html.replace(
  /(<!-- ── PRAWDA NA DZIŚ ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-lightbulb"><\/i>\s*<span>Prawda na dziś<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── POMYŚL ── -->)/,
  `$1${truth54}\n      $2`
);

// 5.12 Pomyśl
const questions54 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Refleksja Osobista — Spójrz w Światło Słowa (${READING})
        </h3>
        <div class="space-y-3 text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed">
          <p>1. Czy na początku tego nowego tygodnia Twoje serce odpoczywa w pewności Krwi Nowego Przymierza w Jezusie Chrystusie?</p>
          <p>2. W jakiej konkretnej sprawie Bóg czeka dziś na Twoje szczere wyznanie: „Wypełnię wszystko, co PAN mówił, i będę posłuszny”?</p>
          <p>3. Czy wzorem Mojżesza budującego ołtarz o poranku oddajesz Bogu pierwsze, najcichsze chwile swojego dnia?</p>
          <p>4. Czy ponad codziennymi troskami potrafisz dostrzec oczyma wiary „szafirowe, jasne niebo” Bożego panowania i pokoju?</p>
          <p>5. Jak przeżywasz udział w Wieczerzy Pańskiej oraz codzienne posiłki — czy są one dla Ciebie chwilą wdzięcznej społeczności przed obliczem Boga?</p>
          <p>6. Kogo w swoim otoczeniu wspierasz na drodze wiary tak, jak Mojżesz zabierający ze sobą wiernego Jozuego?</p>
          <p>7. Czy potrafisz cierpliwie czekać na Boży głos przez „sześć dni ciszy”, nie tracąc pokoju i nie ulegając niecierpliwości?</p>
          <p>8. Jak wykorzystujesz błogosławiony siódmy dzień tygodnia — czy wchodzisz w nim głębiej w obłok Bożej obecności i Słowa?</p>
        </div>`;

html = html.replace(
  /(<!-- ── POMYŚL ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-heart"><\/i>\s*<span>Pytania do serca \(Pomyśl\)<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── QUIZ ── -->)/,
  `$1${questions54}\n      $2`
);

// 5.13 Quiz nagłówek
html = html.replace(/20 Pytań z Wj 23 \(Sprawdź swoją wiedzę\)/g, `20 Pytań z Wj 24 (Sprawdź swoją wiedzę)`);
html = html.replace(/Po przeczytaniu Wj 23/g, `Po przeczytaniu Wj 24`);

// 5.14 Twoja decyzja
const decision54 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Przyjmij Pokój Krwi Przymierza, Zasiądź pod Szafirowym Niebem i Wejdź na Górę Modlitwy!
        </h3>
        <div class="space-y-4 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed">
          <p>
            Dwudziesty czwarty rozdział Księgi Wyjścia pokazuje, że nasz Bóg nie jest dalekim, niedostępnym władcą, lecz Ojcem Przymierza, który przez przelaną krew i spisane Słowo zaprasza swój lud do stołu pod szafirowym niebem swojej chwały.
          </p>
          <p>
            Ponieważ Pan Jezus Chrystus przelał za Ciebie własną krew Nowego Przymierza, podejmij dziś na progu nowego tygodnia świadomą decyzję: żyj w radości pojednania z Bogiem, odpowiadaj Mu wiernym posłuszeństwem i znajduj każdego dnia czas na spotkanie z Nim w Jego Słowie!
          </p>
          <div class="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-black/40 to-transparent border border-brand-gold/40">
            <h4 class="font-bold text-amber-300 mb-2 uppercase tracking-wide text-xs">Moja Decyzja — Osobiste Wyznanie:</h4>
            <p class="italic text-white">
              „Panie Jezu Chryste, Pośredniku Nowego Przymierza, dziękuję Ci za Twoją krew przelaną na przebaczenie moich grzechów i za szafirowe niebo pokoju, które otworzyłeś nad moim życiem. Świadomie wybieram dziś pełne posłuszeństwo Twojemu spisanemu Słowu, wdzięczną społeczność przy Twoim stole oraz wierne trwanie w Twojej obecności przez cały ten tydzień.”
            </p>
          </div>
        </div>`;

html = html.replace(
  /(<!-- ── TWOJA DECYZJA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-flag-checkered"><\/i>\s*<span>Twoja decyzja<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── MODLITWA ── -->)/,
  `$1${decision54}\n      $2`
);

// 5.15 Modlitwa
html = html.replace(/<span>Modlitwa na 22 listopada<\/span>/g, `<span>Modlitwa na 23 listopada</span>`);
const prayer54 = `<h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">
          Modlitwa Dziękczynienia za Krew Nowego Przymierza, Szafirowe Niebo Łaski i Prawo w Sercu
        </h3>
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 text-sm sm:text-base text-zinc-200 font-serif leading-relaxed space-y-3">
          <p>
            Święty, Wszechmogący Boże Izraela, nasz Ojcze w niebie! Dziękujemy Ci za dwudziesty czwarty rozdział Księgi Wyjścia, w którym ukazujesz nam uroczystą pieczęć Twojego Przymierza, szafirowy błękit czystego nieba pod Twoimi stopami oraz ogień Twojej chwały na szczycie Synaju.
          </p>
          <p>
            Przepraszamy Cię za chwile, w których składaliśmy Ci obietnice wierności, a potem w codziennym pośpiechu zapominaliśmy o Twoim Słowie. Oczyść nasze serca z duchowej powierzchowności i zniecierpliwienia.
          </p>
          <p>
            Panie Jezu Chryste, dziękujemy Ci za Twoją najdroższą krew Nowego Przymierza, wylaną za nas na przebaczenie grzechów. Dziękujemy Ci, że dzięki Twojej ofierze nie wyciągasz na nas ręki sądu, lecz zapraszasz nas do swojego stołu, obdarzasz pokojem i wypisujesz przez Ducha Świętego swoje święte Prawo na tablicach naszych serc.
          </p>
          <p>
            Prowadź nas w ten poniedziałek i przez cały nowy tydzień w świetle Twojej chwały. Amen!
          </p>
        </div>`;

html = html.replace(
  /(<!-- ── MODLITWA ── -->\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-hands-praying"><\/i>\s*<span>Modlitwa na [^<]+<\/span>\s*<\/div>\s*)[\s\S]*?(<\/section>\s*<!-- ── ZASTOSOWANIE I TWÓJ ZAPIS)/,
  `$1${prayer54}\n      $2`
);

// 5.16 Zadania na dziś (7 zadań)
const tasks54 = `<label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-1" onchange="toggleTaskState(1)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>1. Przeczytaj cały fragment <a href="/mojabiblia?book=EXO&chapter=24" class="text-amber-300 underline font-semibold">Wj 24:1–18</a> w przekładzie UBG oraz Mt 26:26–29 i Hbr 9:18–24.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-2" onchange="toggleTaskState(2)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>2. Zapamiętaj werset Wj 24:8 („Oto krew przymierza...”) i podziękuj Jezusowi za Jego krew Nowego Przymierza.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-3" onchange="toggleTaskState(3)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>3. Wypowiedz dziś rano przed Bogiem świadome wyznanie: „Wypełnię wszystko, co PAN mówił, i będę posłuszny” w swoich obowiązkach.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-4" onchange="toggleTaskState(4)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>4. Przeżyj dzisiejszy posiłek z głęboką wdzięcznością jako zaproszenie do stołu w obecności dobrego Boga (Wj 24:11).</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-5" onchange="toggleTaskState(5)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>5. Spójrz w ciągu dnia w niebo (Wj 24:10) i powierz Bogu jedną troskę tego tygodnia, ufając w pokój Jego szafirowego tronu.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-6" onchange="toggleTaskState(6)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>6. Zaplanuj w tym tygodniu cichy czas „na górze z Bogiem” — osobiste studium Biblii i modlitwę bez pośpiechu.</span>
          </label>
          <label class="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-brand-line hover:border-brand-gold/40 cursor-pointer transition">
            <input type="checkbox" id="chk-task-7" onchange="toggleTaskState(7)" class="mt-1 rounded text-amber-500 focus:ring-amber-400">
            <span>7. Oznacz Dzień 54 jako ukończony i prześlij tę lekcję bliskiej osobie na dobry, błogosławiony początek tygodnia.</span>
          </label>`;

html = html.replace(
  /(<p class="text-zinc-200 font-semibold mb-2">Wykonaj dzisiejsze kroki formacji biblijnej:<\/p>\s*)[\s\S]*?(<\/div>\s*<div class="space-y-4 pt-2">)/,
  `$1${tasks54}\n        $2`
);

// 5.17 Zapowiedź: Jutro (Dzień 55) + Karta WspieramTO 2.0 (Value-Moment Trigger)
const tomorrow54 = `<section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
        <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
          JUTRO — 24 LISTOPADA 2026
        </div>
        <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
          DZIEŃ 55 — DOBROWOLNY DAR SERCA, ARKA PRZYMIERZA, STÓŁ I ZŁOTY ŚWIECZNIK (Wj 25:1–40)
        </h3>
        <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 font-serif">
          Dzień 55: W dwudziestym piątym rozdziale Księgi Wyjścia usłyszymy poruszające wyznanie Boga: „Niech uczynią mi świątynię, abym mieszkał pośród nich”, i odkryjemy chrystologiczną głębię Arki Przymierza z przebłagalnią, stołu na chleby pokładne oraz siedmioramiennego złotego świecznika!
        </p>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider min-h-[44px]">
            <span>Dostępne od północy (24 listopada 2026)</span>
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
  `<!-- ── ZAPOWIEDŹ: JUTRO ── -->\n      ${tomorrow54}`
);

// 5.18 JavaScript: QUIZ_DATA (20 pytań), DAY_KEY, completeDay54, TTS
const quizJsItems = quizItems.map(({ q, a, c }) => ({ q, a, c }));
const quizData54 = `// ── QUIZ LOGIC (20 PYTAŃ Z WJ 24:1–18) ──\n    const QUIZ_DATA = ${JSON.stringify(quizJsItems, null, 6)};`;

html = html.replace(/\/\/ ── QUIZ LOGIC[\s\S]*?const QUIZ_DATA = \[[\s\S]*?\];/, quizData54);
html = html.replace(
  /Doskonale! Znasz na wskroś 23\. rozdział Księgi Wyjścia!/g,
  `Doskonale! Znasz na wskroś 24. rozdział Księgi Wyjścia!`
);

html = html.replace(/kc_day53_/g, `kc_day${DAY_NUM}_`);
html = html.replace(/DAY_KEY = 'kc_day53'/g, `DAY_KEY = 'kc_day${DAY_NUM}'`);
html = html.replace(/completeDay53/g, `completeDay${DAY_NUM}`);
html = html.replace(/Oznacz Dzień 53 jako ukończony/g, `Oznacz Dzień ${DAY_NUM} jako ukończony`);
html = html.replace(/Dzień 53 ukończony!/g, `Dzień ${DAY_NUM} ukończony!`);
html = html.replace(
  /new SpeechSynthesisUtterance\("[^"]+"\)/,
  `new SpeechSynthesisUtterance("${MEMORY_VERSE_QUOTE} Księga Wyjścia 24:8.")`
);

// Aktualizacja przycisku "Dzień 54 (Poniedziałek) →" na aktywny link w Dniu 53!
const day53Paths = [
  path.join(REPO, 'akademia/kurscodzienny/dzien-53.html'),
  path.join(REPO, 'akademia/kurscodzienny/dzien-53/index.html'),
  path.join(REPO, 'kursy/kurscodzienny/dzien-53.html'),
  path.join(REPO, 'kursy/kurscodzienny/dzien-53/index.html'),
];
for (const p53 of day53Paths) {
  if (fs.existsSync(p53)) {
    let h53 = fs.readFileSync(p53, 'utf8');
    h53 = h53.replace(
      /<span class="px-3 py-1\.5 rounded-lg bg-zinc-900\/50 text-xs text-zinc-600 flex items-center gap-1\.5 min-h-\[44px\]">\s*<span>Dzień 54 \(Poniedziałek\) →<\/span>\s*<\/span>/,
      `<a href="/akademia/kurscodzienny/dzien-54" class="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs text-amber-300 hover:text-amber-200 transition flex items-center gap-1.5 min-h-[44px]">\n          <span>Dzień 54 →</span>\n          <i class="fa-solid fa-chevron-right text-[10px]"></i>\n        </a>`
    );
    fs.writeFileSync(p53, h53, 'utf8');
  }
}

// Zapis 4 ścieżek Clean URLs w Akademii i Kursach dla Dnia 54
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
console.log('✅ Zapisano 4 ścieżki Clean URLs dla Dnia 54.');

// Zapis paczki przedpublikacyjnej w kolejka-publikacji/kurs-codzienny/2026-11-23/
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
          'Ratyfikacja Przymierza krwią ofiar („Oto krew przymierza”), szafirowe niebo pod stopami Boga podczas uczty 70 starszych oraz Mojżesz w obłoku chwały na 40 dni i nocy.',
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
