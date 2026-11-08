import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const articlesPath = path.join(ROOT, 'portals/ccn-news/src/data/articles.ts');
let content = fs.readFileSync(articlesPath, 'utf8');

const newBreaking = '  "PILNE CCN NEWS: Kraków w żałobie: 6 ofiar strzelaniny. Jak odpowiedzieć na zło? Chrześcijański komentarz Cezarego Rogowskiego (https://polskieradio.cc/news/krakow-strzelanina-7-listopada-2026-chrzescijanski-komentarz)",\n';

if (!content.includes('krakow-strzelanina-7-listopada-2026-chrzescijanski-komentarz')) {
  // 1. Dodaj do BREAKING_NEWS
  const breakingMarker = 'export const BREAKING_NEWS: string[] = [';
  if (content.includes(breakingMarker)) {
    content = content.replace(breakingMarker, breakingMarker + '\n' + newBreaking);
  }

  // 2. Dodaj do INITIAL_ARTICLES
  const newArticleCode = `  {
    id: 'art-krakow-strzelanina-7-listopada-2026-chrzescijanski-komentarz',
    title: "Kraków w żałobie: 6 ofiar strzelaniny. Chrześcijański komentarz",
    slug: 'krakow-strzelanina-7-listopada-2026-chrzescijanski-komentarz',
    excerpt: "W sobotę 7 listopada 2026 roku w centrum Krakowa doszło do tragicznej strzelaniny. Zginęło sześć osób, a piętnaście zostało rannych. Miasto ogłosiło żałobę. Jak w obliczu niewyobrażalnego bólu odpowiedzieć na zło chrześcijańską solidarnością, prawdą i modlitwą — analiza Cezarego Rogowskiego.",
    content: [
      "W sobotę 7 listopada 2026 roku około godziny 15.00 w centrum Krakowa, w rejonie Rynku Głównego i ulicy Sławkowskiej, doszło do strzelaniny. Według aktualizacji oficjalnego serwisu miejskiego, który powołuje się na Małopolski Urząd Wojewódzki, zginęło sześć osób, a piętnaście zostało rannych. Podawanej wcześniej liczby siedmiu zabitych nie potwierdzono. Informację o bilansie potwierdza również Radio Kraków.",
      "Według komunikatów mężczyzna strzelał z jadącego samochodu. Sprawca został postrzelony i zatrzymany przez policję w rejonie skrzyżowania ulic Dietla i Stradomskiej. Ostrzelany został też tramwaj linii numer 1; pasażerowie i motorniczy nie odnieśli obrażeń podczas tego incydentu. Miasto ogłosiło żałobę od 8 do 11 listopada 2026 roku.",
      "Stan zdrowia poszkodowanych i szczegóły śledztwa mogą się zmieniać. Informacji o motywie ataku nie należy zastępować spekulacjami. Sama nazwa „zamach” nie przesądza jeszcze o prawnej kwalifikacji czynu jako przestępstwa terrorystycznego.",
      "1. NIE SZUKAJMY WINY W OFIARACH",
      "Wobec śmierci niewinnych ludzi słowa stają się szczególnie odpowiedzialne. Nie wolno sugerować, że ofiary zasłużyły na tragedię, ani przypisywać Bożej woli szczegółowego scenariusza przemocy. W Łk 13,1–5 Jezus wspomina o ofiarach brutalnego czynu Piłata i katastrofy w Syloe, ale odrzuca myślenie, że zmarli byli bardziej winni niż pozostali. W J 9,1–3 także nie pozwala na łatwe utożsamianie cierpienia z konkretną winą człowieka.",
      "Nie wiemy, dlaczego właśnie te osoby znalazły się w miejscu ataku. Wiemy natomiast, że każde ludzkie życie ma wartość i godność (Rdz 1,26–27). Wiara nie zwalnia z pokory wobec niewiedzy.",
      "2. JEZUS NIE WSTYDIŁ SIĘ ŁEZ",
      "Ewangelia przedstawia Jezusa płaczącego przed grobem Łazarza (J 11,33–35). Nadzieja zmartwychwstania nie unieważnia bólu rodziny, przyjaciół ani świadków zdarzenia. Rz 12,15 wzywa chrześcijan do współodczuwania z cierpiącymi.",
      "W tej chwili rodziny potrzebują bezpieczeństwa, przestrzeni do żałoby, wsparcia i rzetelnych informacji. Nie żądajmy od nich natychmiastowego przebaczenia ani religijnych deklaracji. Reakcje po traumie nie świadczą same w sobie o słabej wierze; czasem potrzebna jest profesjonalna pomoc psychologiczna. Modlitwa może jej towarzyszyć, nie powinna jej zastępować.",
      "3. PRAWDA JEST FORMĄ MIŁOŚCI",
      "Strach sprzyja plotkom. Krążą niezweryfikowane liczby ofiar, nagrania oraz oskarżenia wobec całych grup ludzi. Chrześcijanin nie może przekazywać takich treści bez sprawdzenia. Przykazanie zakazujące fałszywego świadectwa (Wj 20,16) dotyczy także mediów społecznościowych; Jk 1,19 wzywa do rozwagi w mówieniu.",
      "Ważne jest również odróżnianie żądania sprawiedliwości od nawoływania do zemsty. Rz 13,1–4 uznaje obowiązek władz w zakresie ochrony i wymierzania sprawiedliwości, natomiast Rz 12,17–21 odrzuca prywatny odwet. Uczciwe śledztwo i ochrona społeczeństwa muszą iść w parze z odmową zbiorowego piętnowania ludzi.",
      "4. JAK MĄDRZE POMAGAĆ?",
      "Po pierwsze, stosujmy się do poleceń policji i ratowników. Nie odwiedzajmy miejsc akcji dla zdjęć czy sensacji. W bezpośrednim zagrożeniu dzwońmy pod numer 112.",
      "Po drugie, nie rozpowszechniajmy drastycznych nagrań. Szanujmy prywatność zabitych, rannych i ich rodzin. Jeśli chcemy wspierać poszkodowanych lub oddać krew, sprawdzajmy aktualne komunikaty właściwych instytucji, zamiast działać na podstawie wiralowych postów.",
      "Po trzecie, pamiętajmy o świadkach, dzieciach, ratownikach oraz policjantach. Dla niektórych przeżycie takiego wydarzenia może oznaczać długotrwały kryzys. Oficjalny serwis miasta informował o wsparciu psychologicznym po tragedii. Szczegóły pomocy należy sprawdzać bezpośrednio w miejskich komunikatach.",
      "Po czwarte, zapytajmy konkretnie, czy ktoś potrzebuje towarzyszenia, pomocy w obowiązkach lub zwykłej rozmowy. Jakub ostrzega przed wiarą, która poprzestaje na dobrych słowach, nie troszcząc się o rzeczywiste potrzeby człowieka (Jk 2,15–17).",
      "5. GDZIE JEST BÓG?",
      "To pytanie nie jest wyrazem buntu, którego trzeba się wstydzić. Prorok Habakuk skarżył się Bogu na przemoc i niesprawiedliwość (Ha 1,2–3). Pismo nie daje nam pełnego wyjaśnienia każdego dramatu. Kieruje nas jednak do Chrystusa, który sam doznał przemocy, umarł i zmartwychwstał.",
      "W 1 Kor 15,20–26 zmartwychwstanie Chrystusa stanowi fundament nadziei na pokonanie śmierci. Ap 21,4 przedstawia obietnicę świata bez śmierci i łez. To nie zwalnia z pomagania dziś. Wieczna nadzieja powinna czynić nas bardziej odpowiedzialnymi za ludzi obecnie cierpiących, a nie mniej.",
      "MODLITWA ZA KRAKÓW",
      "Panie Boże, polecamy Tobie rodziny zabitych, rannych, świadków oraz wszystkich, którzy niosą pomoc. Daj mądrość lekarzom, wytrwałość ratownikom, uczciwość śledczym, pokój przestraszonym i siłę pogrążonym w żałobie. Broń nasze serca przed nienawiścią i nasze usta przed kłamstwem. Naucz nas nie tylko modlić się, ale także pomagać. Przez Jezusa Chrystusa. Amen.",
      "Wobec tragedii w Krakowie chcę wybrać prawdę zamiast plotki, solidarność zamiast widowiska i miłosierdzie zamiast zemsty. Tak może wyglądać praktyczna odpowiedź chrześcijanina."
    ],
    imageUrl: '/images/news/art-krakow-strzelanina-7-listopada-2026-chrzescijanski-komentarz.png',
    imageCaption: 'Ilustracja symboliczna AI (CCN News): Rynek Główny w Krakowie o zmierzchu, płonące znicze i chrześcijańska refleksja nad tragedią, żałobą i solidarnością.',
    readTimeMinutes: 6,
    isHero: true,
    isPopular: true,
    popularRank: 1,
    tags: [
      "@CezaryRogowski",
      "@ChristianCulture",
      "#Kraków",
      "#Żałoba",
      "#KrakówWŻałobie",
      "#CCNNews",
      "#Solidarność",
      "#Modlitwa",
      "#UBG"
    ],
    author: AUTHORS.cezary,
    primaryPortalUrl: 'https://polskieradio.cc/news',
    primaryPortalLabel: 'CCN News / aktualności',
    category: 'kraj',
    categoryLabel: 'CCN NEWS • KRAJ, SPOŁECZEŃSTWO I BEZPIECZEŃSTWO',
    publishedAt: '2026-11-08T07:00:00Z',
    dateFormatted: '8 listopada 2026',
    scriptureReference: {
      verse: 'Ewangelia Jana 11:35; List do Rzymian 12:15 (UBG)',
      text: 'Jezus zapłakał. Radujcie się z tymi, którzy się radują, a płaczcie z tymi, którzy płaczą.',
      strongCode: 'G1145'
    },
    sourceCitation: {
      name: 'Oficjalny serwis miasta Krakowa (krakow.pl), Radio Kraków, Małopolski Urząd Wojewódzki',
      url: 'https://krakow.pl'
    }
  },\n`;

  const articlesMarker = 'export const INITIAL_ARTICLES: Article[] = [';
  if (content.includes(articlesMarker)) {
    content = content.replace(articlesMarker, articlesMarker + '\n' + newArticleCode);
    fs.writeFileSync(articlesPath, content, 'utf8');
    console.log('✅ Dodano artykuł o Krakowie do portals/ccn-news/src/data/articles.ts');
  }
} else {
  console.log('ℹ️ Artykuł o Krakowie już istnieje w articles.ts');
}
