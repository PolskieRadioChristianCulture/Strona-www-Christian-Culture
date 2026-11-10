import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const indexPath = path.join(ROOT, 'data/cc-search-index.json');
const catalogPath = path.join(ROOT, 'szukaj/catalog.json');
const luminaMirrorPath = 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\\data\\cc-search-index.json';
const luminaCatalogMirror = 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\\szukaj\\catalog.json';

const rawData = fs.readFileSync(indexPath, 'utf8');
const data = JSON.parse(rawData);

// 1. Lekcje Kursu Codziennego "Z Biblią za Pan Brat"
const dailyLessons = [
  {
    title: "Z Biblią za Pan Brat — Dzień 41 (Lekcja 41 na dziś): Plagi szarańczy i ciemności egipskiej — Sąd nad fałszywym światłem i wolność bez kompromisów (Wj 10:1–29)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-41",
    description: "Kurs Codzienny Pisma Świętego — Dzień 41 (Lekcja 41 na dziś, 10 listopada 2026). Księga Wyjścia 10:1–29: Plagi szarańczy i namacalnej ciemności egipskiej. Sąd nad fałszywym światłem i bóstwem Ra, Boża suwerenność i bezkompromisowa wolność przymierza w Chrystusie.",
    tags: [
      "lekcja 41", "lekcja 41 na dziś", "lekcja na dziś", "dzień 41", "dzien 41",
      "rozważanie 41", "rozważanie na dziś", "słowo na dziś", "szarańcza", "ciemność egipska",
      "plagi egipskie", "faraon", "bóstwo ra", "ziemia goszen", "wj 10", "z biblią za pan brat",
      "kurs codzienny", "akademia biblijna", "10 listopada 2026", "dzisiaj", "dziś"
    ],
    featured: true
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 40 (Lekcja 40): Pomór bydła, wrzody i ogień z gradem — Boża moc ponad pychą faraona (Wj 9:1–35)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-40",
    description: "Kurs Codzienny Pisma Świętego — Dzień 40 (Lekcja 40, 9 listopada 2026). Księga Wyjścia 9:1–35: Pomór bydła, wrzody z pieca i bezprecedensowy ogień z gradem. Boża moc ponad pychą faraona, ochrona w ziemi Goszen i Chrystus jako nasze jedyne schronienie.",
    tags: [
      "lekcja 40", "dzień 40", "dzien 40",
      "rozważanie 40", "słowo na dziś", "pomór bydła", "wrzody",
      "grad z ogniem", "ziemia goszen", "faraon", "wj 9", "z biblią za pan brat",
      "kurs codzienny", "akademia biblijna", "9 listopada 2026", "archiwalne"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 39 (Lekcja 39): Żaby, komary i muchy — Wybór terminu cudu i granica ziemi Goszen (Wj 8:1–32)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-39",
    description: "Kurs Codzienny Pisma Świętego — Dzień 39 (Lekcja 39, 8 listopada 2026). Księga Wyjścia: inwazja żab, bezradność czarowników przy komarach, Boże rozdzielenie i ochrona ziemi Goszen przed plagą much — Wj 8:1–32.",
    tags: [
      "lekcja 39", "dzień 39", "dzien 39", "rozważanie 39", "słowo na dziś",
      "żaby", "komary", "muchy", "palec boży", "ziemia goszen", "faraon",
      "wj 8", "z biblią za pan brat", "kurs codzienny", "akademia biblijna", "8 listopada 2026"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 38 (Lekcja 38): Laska, która połknęła węże, i woda zamieniona w krew (Wj 7:1–25)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-38",
    description: "Kurs Codzienny Pisma Świętego — Dzień 38 (Lekcja 38 na dziś, 7 listopada 2026). Księga Wyjścia: Mojżesz ustanowiony bogiem dla faraona, pojedynek lasek czarowników i uderzenie w święty Nil — Wj 7:1–25.",
    tags: [
      "lekcja 38", "lekcja 38 na dziś", "lekcja na dziś", "dzień 38", "dzien 38",
      "rozważanie 38", "rozważanie na dziś", "słowo na dziś", "laska która połknęła węże",
      "woda zamieniona w krew", "nil", "faraon", "aaron", "plagi", "znaki i cuda",
      "wj 7", "z biblią za pan brat", "kurs codzienny", "akademia biblijna",
      "7 listopada 2026", "dzisiaj", "dziś"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 37 (Lekcja 37): Teraz zobaczysz, co uczynię faraonowi: Siedem obietnic odkupienia (Wj 6:1–30)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-37",
    description: "Kurs Codzienny Pisma Świętego — Dzień 37 (Lekcja 37, 6 listopada 2026). Księga Wyjścia: objawienie Imienia JAHWE, wieczne przymierze z ojcami i 7 obietnic odkupienia wyciągniętym ramieniem — Wj 6:1–30.",
    tags: [
      "lekcja 37", "dzień 37", "dzien 37", "rozważanie 37", "słowo na dziś",
      "siedem obietnic", "odkupienie", "ramię pana", "jahwe", "faraon",
      "wj 6", "z biblią za pan brat", "kurs codzienny", "akademia biblijna", "6 listopada 2026"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 36 (Lekcja 36): Pierwsza konfrontacja z faraonem: Ciężary niewoli i próba wiary (Wj 5:1–23)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-36",
    description: "Kurs Codzienny Pisma Świętego — Dzień 36 (Lekcja 36, 5 listopada 2026). Księga Wyjścia: pierwsza konfrontacja Mojżesza i Aarona z faraonem, nakaz wyrobu cegieł bez słomy, ból ucisku i wołanie w ciemności próby — Wj 5:1–23.",
    tags: [
      "lekcja 36", "dzień 36", "dzien 36", "rozważanie 36", "słowo na dziś",
      "pierwsza konfrontacja", "faraon", "cegły bez słomy", "próba wiary",
      "wj 5", "z biblią za pan brat", "kurs codzienny", "akademia biblijna", "5 listopada 2026"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 35 (Lekcja 35): Znaki wiary, powołanie i powrót do Egiptu: Boża moc w ludzkiej słabości (Wj 4:1–31)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-35",
    description: "Kurs Codzienny Pisma Świętego — Dzień 35 (Lekcja 35, 4 listopada 2026). Księga Wyjścia: wątpliwości Mojżesza, trzy cudowne znaki, Aaron rzecznikiem, przymierze krwi i powrót do uciemiężonego ludu — Wj 4:1–31.",
    tags: [
      "lekcja 35", "dzień 35", "dzien 35", "rozważanie 35", "słowo na dziś",
      "trzy znaki", "aaron", "laska mojżesza", "powołanie",
      "wj 4", "z biblią za pan brat", "kurs codzienny", "akademia biblijna", "4 listopada 2026"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 34 (Lekcja 34): Płonący Krzak: Święte Imię Boga i Boże zstąpienie na ratunek (Wj 3:1–22)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-34",
    description: "Kurs Codzienny Pisma Świętego — Dzień 34 (Lekcja 34, 3 listopada 2026). Księga Wyjścia: teofania w płonącym krzewie na Horebie, objawienie Imienia JESTEM, KTÓRY JESTEM — Wj 3:1–22.",
    tags: [
      "lekcja 34", "dzień 34", "dzien 34", "rozważanie 34", "słowo na dziś",
      "płonący krzak", "jestem który jestem", "jhwh", "horeb",
      "wj 3", "z biblią za pan brat", "kurs codzienny", "akademia biblijna", "3 listopada 2026"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 33 (Lekcja 33): Narodziny Mojżesza, Sitowie Nilu i Czterdzieści Lat w Madianie (Wj 2:1–25)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-33",
    description: "Kurs Codzienny Pisma Świętego — Dzień 33 (Lekcja 33, 2 listopada 2026). Księga Wyjścia: koszyk z papirusu, córka faraona, ucieczka do Madianu i Boża pamięć o przymierzu — Wj 2:1–25.",
    tags: [
      "lekcja 33", "dzień 33", "dzien 33", "rozważanie 33", "słowo na dziś",
      "narodziny mojżesza", "sitowie nilu", "madian", "przymierze",
      "wj 2", "z biblią za pan brat", "kurs codzienny", "akademia biblijna", "2 listopada 2026"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 32 (Lekcja 32): W nieskrępowanym rozroście: Nowy król, uciskanie i Boże ocalenie (Wj 1:1–22)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-32",
    description: "Kurs Codzienny Pisma Świętego — Dzień 32 (Lekcja 32, 1 listopada 2026). Księga Wyjścia: nowy faraon, niewola Izraela, heroiczna wiara położnych Szifry i Pui oraz Boże ocalenie życia — Wj 1:1–22.",
    tags: [
      "lekcja 32", "dzień 32", "dzien 32", "rozważanie 32", "słowo na dziś", "w nieskrępowanym rozroście",
      "nowy król", "faraon", "szifra i pua", "położne", "bojaźń boża", "niewola egipska",
      "wj 1", "z biblią za pan brat", "kurs codzienny", "akademia biblijna",
      "1 listopada 2026"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 31 (Lekcja 31): Bóg obrócił to w dobro — Ewangelia Opatrzności (Rdz 50:1–26)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-31",
    description: "Kurs Codzienny Pisma Świętego — Dzień 31 (Lekcja 31, 31 października 2026). Finał Księgi Rodzaju: pochówek Jakuba w Kanaanie, lęk braci przed zemstą, wyznanie Bożej Opatrzności i kości Józefa — Rdz 50:1–26.",
    tags: [
      "lekcja 31", "dzień 31", "dzien 31", "rozważanie 31", "słowo na dziś",
      "bóg obrócił to w dobro", "opatrzność", "józef", "rdz 50", "z biblią za pan brat",
      "kurs codzienny", "akademia biblijna", "31 października 2026"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 30 (Lekcja 30): Błogosławieństwo, obietnica i Lew z Judy (Rdz 48:1–49:33)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-30",
    description: "Kurs Codzienny Pisma Świętego — Dzień 30 (Lekcja 30, 30 października 2026). Jakub adoptuje i błogosławi Efraima i Manassesa, prorocze błogosławieństwo dwunastu synów, berło Judy i przyjście Szilo — Rdz 48:1–49:33.",
    tags: [
      "lekcja 30", "dzień 30", "dzien 30", "rozważanie 30", "słowo na dziś",
      "lew z judy", "szilo", "jakub", "rdz 48", "rdz 49", "z biblią za pan brat",
      "kurs codzienny", "akademia biblijna", "30 października 2026"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 29 (Lekcja 29): Bóg prowadzi swój lud do Egiptu (Rdz 46:1–47:31)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-29",
    description: "Kurs Codzienny Pisma Świętego — Dzień 29 (Lekcja 29, 29 października 2026). Jakub w Beer-Szebie, podróż do Egiptu, spotkanie z Józefem i osiedlenie w ziemi Goszen — Rdz 46:1–47:31.",
    tags: [
      "lekcja 29", "dzień 29", "dzien 29", "rozważanie 29", "słowo na dziś",
      "ziemia goszen", "jakub", "józef", "rdz 46", "rdz 47", "z biblią za pan brat",
      "kurs codzienny", "akademia biblijna", "29 października 2026"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 28 (Lekcja 28): Ja jestem Józef — Przebaczenie i pojednanie (Rdz 44:1–45:28)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-28",
    description: "Kurs Codzienny Pisma Świętego — Dzień 28 (Lekcja 28, 28 października 2026). Srebrny puchar w worku Beniamina, wstawiennictwo Judy, odsłonięcie tożsamości Józefa i łaska przebaczenia — Rdz 44:1–45:28.",
    tags: [
      "lekcja 28", "dzień 28", "dzien 28", "rozważanie 28", "słowo na dziś",
      "ja jestem józef", "przebaczenie", "juda", "rdz 44", "rdz 45", "z biblią za pan brat",
      "kurs codzienny", "akademia biblijna", "28 października 2026"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 27 (Lekcja 27): Bracia w Egipcie — Przebudzenie sumienia (Rdz 42:1–43:34)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-27",
    description: "Kurs Codzienny Pisma Świętego — Dzień 27 (Lekcja 27, 27 października 2026). Głód w Kanaanie, pierwsza podróż braci po zboże do Egiptu, próba Józefa i ból sumienia — Rdz 42:1–43:34.",
    tags: [
      "lekcja 27", "dzień 27", "dzien 27", "rozważanie 27", "słowo na dziś",
      "bracia w egipcie", "przebudzenie sumienia", "józef", "rdz 42", "rdz 43", "z biblią za pan brat",
      "kurs codzienny", "akademia biblijna", "27 października 2026"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 26 (Lekcja 26): Od więzienia do pałacu (Rdz 40:1–41:57)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-26",
    description: "Kurs Codzienny Pisma Świętego — Dzień 26 (26 października 2026). Józef zapomniany w więzieniu, sny podczaszego, piekarza i faraona, siedem lat obfitości i głodu oraz wywyższenie Józefa — Rdz 40:1–41:57.",
    tags: [
      "lekcja 26", "dzień 26", "dzien 26",
      "rozważanie 26", "słowo na dziś", "od więzienia do pałacu", "józef",
      "faraon", "sny faraona", "rdz 40", "rdz 41", "z biblią za pan brat", "kurs codzienny",
      "akademia biblijna", "26 października 2026"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 22 (Lekcja 22 na dziś): Jakub walczy z Bogiem — Przemiana człowieka (Rdz 31:1–32:32)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-22",
    description: "Kurs Codzienny Pisma Świętego — Dzień 22 (Lekcja 22 na dziś, 22 października 2026). Przymierze z Labanem w Gileadzie, lęk przed Ezawem, nocne zmaganie nad potokiem Jabbok i nowe imię Izrael — Rdz 31:1–32:32. Prawdziwe zwycięstwo w Chrystusie przez pokorę i moc w słabości.",
    tags: [
      "lekcja 22", "lekcja 22 na dziś", "lekcja na dziś", "dzień 22", "dzien 22",
      "rozważanie 22", "rozważanie na dziś", "słowo na dziś", "jakub walczy z bogiem", "jabbok",
      "peniel", "izrael", "rdz 31", "rdz 32", "z biblią za pan brat", "kurs codzienny",
      "akademia biblijna", "22 października 2026", "dzisiaj", "dziś"
    ],
    featured: true
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 21: Bóg działa pośród niedoskonałych rodzin (Rdz 29:1–30:43)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-21",
    description: "Kurs Codzienny Pisma Świętego — Dzień 21 (Lekcja 21, 21 października 2026). Jakub, Rachela, Lea i Laban w Charanie — Rdz 29:1–30:43. Boża suwerenna łaska działa pośród skomplikowanych relacji i zranień.",
    tags: [
      "lekcja 21", "dzień 21", "dzien 21",
      "rozważanie 21", "słowo na dziś", "jakub rachela lea", "laban",
      "rdz 29", "rdz 30", "z biblią za pan brat", "kurs codzienny",
      "akademia biblijna", "21 października 2026"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 21: Bóg działa pośród niedoskonałych rodzin (Rdz 29:1–30:43)",
    category: "Wiadomości i artykuły",
    url: "https://polskieradio.cc/news/art-z-biblia-za-pan-brat-dzien-21",
    description: "Formacja i studium biblijne na 21 października 2026. Rozważanie z 29. i 30. rozdziału Księgi Rodzaju — Jakub, Rachela, Lea i Laban w Charanie oraz suwerenny Boży plan zbawienia.",
    tags: [
      "z biblią za pan brat", "jakub rachela lea", "rdz 29", "rdz 30", "charan", "laban",
      "formacja", "artykuł", "ccn news", "21 października 2026"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 20 (Lekcja 20): Drabina Jakuba — Bóg jest bliżej, niż myślisz (Rdz 28:1–22)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-20",
    description: "Kurs Codzienny Pisma Świętego — Dzień 20 (Lekcja 20, 20 października 2026). Ucieczka Jakuba z Beer-Szeby do Charanu, sen na pustkowiu pod gołym niebem, schody łączące ziemię z niebem i Boża wierność — Rdz 28:1–22. Żywy pomost i otwarte niebo w Chrystusie.",
    tags: [
      "lekcja 20", "dzień 20", "dzien 20",
      "rozważanie 20", "słowo na dziś", "drabina jakuba", "betel",
      "rdz 28", "z biblią za pan brat", "kurs codzienny",
      "akademia biblijna", "20 października 2026"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 19 (Lekcja 19): Gdy próbujemy pomóc Bogu oszustwem (Rdz 27:1–46)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-19",
    description: "Kurs Codzienny Pisma Świętego — Dzień 19 (Lekcja 19, 19 października 2026). Jakub, Rebeka i wyłudzone błogosławieństwo niewidomego Izaaka — Rdz 27:1–46. Boża obietnica nie potrzebuje ludzkiego kłamstwa ani manipulacji.",
    tags: [
      "lekcja 19", "dzień 19", "dzien 19",
      "rozważanie 19", "słowo na dziś", "jakub i izaak", "wyłudzone błogosławieństwo",
      "rdz 27", "z biblią za pan brat", "kurs codzienny",
      "akademia biblijna", "19 października 2026"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 18 (Lekcja 18): Jakub i Ezaw — Czego naprawdę pragniesz? (Rdz 25:1–26:35)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-18",
    description: "Kurs Codzienny Pisma Świętego — Dzień 18 (Lekcja 18, 18 października 2026). Abraham odchodzi, Ezaw sprzedaje pierworództwo za miskę soczewicy, Izaak kopie studnie w Gerarze — Rdz 25:1–26:35. Chwilowe pragnienia nie powinny przesłaniać duchowego dziedzictwa.",
    tags: [
      "lekcja 18", "dzień 18", "dzien 18",
      "rozważanie 18", "słowo na dziś", "jakub i ezaw", "pierworództwo",
      "rdz 25", "rdz 26", "z biblią za pan brat", "kurs codzienny",
      "akademia biblijna", "18 października 2026"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 17 (Lekcja 17): Wiara patrząca w przyszłość (Rdz 23:1–24:67)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-17",
    description: "Kurs Codzienny Pisma Świętego — Dzień 17 (Lekcja 17). Śmierć Sary, grota Machpela i spotkanie Izaaka z Rebeką — Rdz 23:1–24:67.",
    tags: [
      "lekcja 17", "dzień 17", "dzien 17", "rozważanie 17", "słowo na dziś",
      "machpela", "rebeka", "izaak", "z biblią za pan brat", "kurs codzienny"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 16 (Lekcja 16): Bóg sam zapewni Baranka (Rdz 22:1–24)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-16",
    description: "Kurs Codzienny Pisma Świętego — Dzień 16 (Lekcja 16). Abraham i Izaak na górze Moria — wiara poddana największej próbie — Rdz 22:1–24.",
    tags: [
      "lekcja 16", "dzień 16", "dzien 16", "rozważanie 16", "moria", "baranek", "ofiara izaaka",
      "z biblią za pan brat", "kurs codzienny"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 15 (Lekcja 15): Bóg Dotrzymuje Obietnicy (Narodziny Izaaka, Rdz 20–21)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-15",
    description: "Kurs Codzienny Pisma Świętego — Dzień 15 (Lekcja 15). Gdy ludzkie możliwości się kończą, Boża wierność pozostaje — Rdz 20:1–21:34.",
    tags: [
      "lekcja 15", "dzień 15", "dzien 15", "rozważanie 15", "narodziny izaaka",
      "rdz 20", "rdz 21", "z biblią za pan brat", "kurs codzienny"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 14 (Lekcja 14): Boża Sprawiedliwość i Ocalenie (Rdz 18–19)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-14",
    description: "Kurs Codzienny Pisma Świętego — Dzień 14 (Lekcja 14). Sąd nad Sodomą, wstawiennictwo Abrahama i Boże miłosierdzie nad sprawiedliwym Lotem — Rdz 18–19.",
    tags: [
      "lekcja 14", "dzień 14", "dzien 14", "rozważanie 14", "słowo na dziś",
      "sodoma", "abraham", "wstawiennictwo", "z biblią za pan brat", "kurs codzienny"
    ],
    featured: false
  },
  {
    title: "Z Biblią za Pan Brat — Dzień 3 (Lekcja 3): Protoewangelia — Pierwsza Obietnica Zbawiciela (Rdz 3:15)",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia/kurscodzienny/dzien-03",
    description: "Kurs Codzienny Pisma Świętego — Dzień 3 (Lekcja 3). Upadek pierwszych ludzi i natychmiastowa odpowiedź Bożej miłości — Protoewangelia w Rdz 3:15: zapowiedź zwycięstwa Potomka Niewiasty nad wężem.",
    tags: [
      "lekcja 3", "dzień 3", "dzien 3", "rozważanie 3", "protoewangelia",
      "rdz 3:15", "obietnica zbawiciela", "z biblią za pan brat", "kurs codzienny"
    ],
    featured: false
  }
];

// 2. Fundamentalny Kurs Biblijny 28 Kroków (Lekcje 1–28 z katalogu kursy/)
const fundamentalLessons = [
  { num: 1, title: "Lekcja 1: Pismo Święte — Źródło Prawdy i Boże Objawienie", file: "01-pismo-swiete.html", tags: ["lekcja 1", "pismo święte", "natchnienie biblii"] },
  { num: 2, title: "Lekcja 2: Trójca — Jedność i Wieczna Wspólnota Boga", file: "02-trojca.html", tags: ["lekcja 2", "trójca", "bóg w trzech osobach"] },
  { num: 3, title: "Lekcja 3: Bóg Ojciec — Suwerenny Stwórca i Miłujący Ojciec", file: "03-bog-ojciec.html", tags: ["lekcja 3", "bóg ojciec", "miłość ojca"] },
  { num: 4, title: "Lekcja 4: Bóg Syn — Wcielenie, Bóstwo i Zbawiciel Świata", file: "04-bog-syn.html", tags: ["lekcja 4", "jezus chrystus", "bóg syn"] },
  { num: 5, title: "Lekcja 5: Bóg Duch Święty — Pocieszyciel, Nauczyciel i Moc Przemiany", file: "05-bog-duch-swiety.html", tags: ["lekcja 5", "duch święty", "pocieszyciel"] },
  { num: 6, title: "Lekcja 6: Stworzenie — Geneza Wszechświata i Godność Człowieka", file: "06-stworzenie.html", tags: ["lekcja 6", "stworzenie", "geneza"] },
  { num: 7, title: "Lekcja 7: Natura Ludzka — Obraz Boga, Upadek i Potrzeba Zbawienia", file: "07-natura-ludzka.html", tags: ["lekcja 7", "natura ludzka", "obraz boży"] },
  { num: 8, title: "Lekcja 8: Wielki Bój — Kosmiczny Konflikt między Dobrem a Złem", file: "08-wielki-boj.html", tags: ["lekcja 8", "wielki bój", "kosmiczny konflikt"] },
  { num: 9, title: "Lekcja 9: Życie, Śmierć i Zmartwychwstanie Chrystusa — Serce Ewangelii", file: "09-zycie-smierc-i-zmartwychwstanie-chrystusa.html", tags: ["lekcja 9", "krzyż", "zmartwychwstanie jezusa"] },
  { num: 10, title: "Lekcja 10: Doświadczenie Zbawienia — Łaska, Wiara i Nowe Narodzenie", file: "10-doswiadczenie-zbawienia.html", tags: ["lekcja 10", "zbawienie z łaski", "nowe narodzenie"] },
  { num: 11, title: "Lekcja 11: Wzrastanie w Chrystusie — Zwycięstwo nad Ciemnością i Uświęcenie", file: "11-wzrastanie-w-chrystusie.html", tags: ["lekcja 11", "wzrastanie w wierze", "uświęcenie"] },
  { num: 12, title: "Lekcja 12: Kościół Boży — Ciało Chrystusa i Wspólnota Wiary", file: "12-kosciol-bozy.html", tags: ["lekcja 12", "kościół boży", "wspólnota"] },
  { num: 13, title: "Lekcja 13: Ostatek i Jego Misja — Wierność w Dniach Ostatnich", file: "13-ostatek-i-jego-misja.html", tags: ["lekcja 13", "ostatek", "misja na dni ostatnie"] },
  { num: 14, title: "Lekcja 14: Jedność Ciała Chrystusa — Miłość Ponad Podziałami", file: "14-jednosc-ciala-chrystusa.html", tags: ["lekcja 14", "jedność", "ciało chrystusa"] },
  { num: 15, title: "Lekcja 15: Chrzest Święty — Przymierze z Chrystusem, Śmierć dla Grzechu i Nowe Życie", file: "15-chrzest.html", tags: ["lekcja 15", "chrzest", "chrzest święty", "zanurzenie", "przymierze", "nowe życie", "28 kroków", "akademia"] },
  { num: 16, title: "Lekcja 16: Wieczerza Pańska — Pamiątka Ofiary, Obmycie Nóg i Społeczność", file: "16-wieczerza-panska.html", tags: ["lekcja 16", "wieczerza pańska", "komunia", "obmycie nóg"] },
  { num: 17, title: "Lekcja 17: Dary i Posługi Duchowe — Wyposażenie do Służby Bliźnim", file: "17-dary-i-poslugi-duchowe.html", tags: ["lekcja 17", "dary duchowe", "służba"] },
  { num: 18, title: "Lekcja 18: Dar Proroctwa — Świadectwo Jezusa w Historii Kościoła", file: "18-dar-proroctwa.html", tags: ["lekcja 18", "proroctwo", "świadectwo jezusa"] },
  { num: 19, title: "Lekcja 19: Prawo Boże — Niezmienny Dekalog i Wyraz Bożej Miłości", file: "19-prawo-boze.html", tags: ["lekcja 19", "prawo boże", "dekalog", "10 przykazań"] },
  { num: 20, title: "Lekcja 20: Szabat — Dzień Odpoczynku, Pamiątka Stworzenia i Znak Przymierza", file: "20-szabat.html", tags: ["lekcja 20", "szabat", "dzień odpoczynku", "sobota"] },
  { num: 21, title: "Lekcja 21: Szafarstwo — Wierność w Zarządzaniu Czasem, Ciałem i Dobrami", file: "21-szafarstwo.html", tags: ["lekcja 21", "szafarstwo", "zarządzanie dobrami", "dziesięcina"] },
  { num: 22, title: "Lekcja 22: Chrześcijańskie Zachowanie — Czystość Serca, Ubiór i Styl Życia", file: "22-chrzescijanskie-zachowanie.html", tags: ["lekcja 22", "styl życia", "czystość serca"] },
  { num: 23, title: "Lekcja 23: Małżeństwo i Rodzina — Boży Wzór Przymierza i Wychowania", file: "23-malzenstwo-i-rodzina.html", tags: ["lekcja 23", "małżeństwo", "rodzina", "świętość przymierza"] },
  { num: 24, title: "Lekcja 24: Służba Chrystusa w Niebiańskiej Świątyni — Arykapłan i Orędownik", file: "24-sluzba-chrystusa-w-niebianskiej-swiatyni.html", tags: ["lekcja 24", "świątynia niebiańska", "arcykapłan", "orędownik"] },
  { num: 25, title: "Lekcja 25: Powtórne Przyjście Chrystusa — Błogosławiona Nadzieja Chrześcijan", file: "25-powtorne-przyjscie-chrystusa.html", tags: ["lekcja 25", "paruzja", "powtórne przyjście", "nadzieja"] },
  { num: 26, title: "Lekcja 26: Śmierć i Zmartwychwstanie — Stan Umarłych i Zwycięstwo Życia", file: "26-smierc-i-zmartwychwstanie.html", tags: ["lekcja 26", "śmierć", "stan umarłych", "zmartwychwstanie"] },
  { num: 27, title: "Lekcja 27: Tysiąclecie i Koniec Grzechu — Sąd Ostateczny i Nowy Początek", file: "27-tysiaclecie-i-koniec-grzechu.html", tags: ["lekcja 27", "millennium", "tysiąclecie", "sąd ostateczny"] },
  { num: 28, title: "Lekcja 28: Nowa Ziemia — Wieczność w Obecności Boga i Brak Cierpienia", file: "28-nowa-ziemia.html", tags: ["lekcja 28", "nowa ziemia", "nowe jeruzalem", "wieczność"] }
].map(item => ({
  title: `Kurs 28 Kroków — ${item.title}`,
  category: "Biblia i formacja",
  url: `https://polskieradio.cc/kursy/${item.file}`,
  description: `Fundamentalne studium biblijne Akademii Christian Culture — ${item.title}. Analiza wersetów, kody Stronga, pytania sprawdzające i zastosowanie w życiu wiary.`,
  tags: [...item.tags, "28 kroków", "kurs biblijny", "akademia biblijna", "lekcje biblijne", "nauka pisma"],
  featured: item.num === 15 || item.num === 1 || item.num === 20
}));

const allNewItems = [...dailyLessons, ...fundamentalLessons];
const newUrls = new Set(allNewItems.map(i => i.url.toLowerCase()));

// Usuń stare duplikaty wg URL jeśli istniały
data.items = data.items.filter(item => !newUrls.has((item.url || '').toLowerCase()));

// Wstaw nowe lekcje na początek sekcji edukacyjnej (po cclite)
data.items.splice(12, 0, ...allNewItems);

data.totalItems = data.items.length;
data.updatedAt = new Date().toISOString();

const formattedJson = JSON.stringify(data, null, 2);

fs.writeFileSync(indexPath, formattedJson, 'utf8');
console.log(`Updated ${indexPath} (totalItems: ${data.totalItems})`);

fs.writeFileSync(catalogPath, formattedJson, 'utf8');
console.log(`Updated ${catalogPath}`);

if (!process.argv.includes('--no-mirror') && fs.existsSync(path.dirname(luminaMirrorPath))) {
  fs.writeFileSync(luminaMirrorPath, formattedJson, 'utf8');
  console.log(`Updated mirror ${luminaMirrorPath}`);
}
if (!process.argv.includes('--no-mirror') && fs.existsSync(path.dirname(luminaCatalogMirror))) {
  fs.writeFileSync(luminaCatalogMirror, formattedJson, 'utf8');
  console.log(`Updated mirror ${luminaCatalogMirror}`);
}
