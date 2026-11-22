const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LUMINA_ROOT = path.resolve('C:/Users/czark/Desktop/@ICC/LUMINA');
const SCRATCH_ROOT = path.resolve('C:/Users/czark/.gemini/antigravity/brain/6171dbb4-faed-472d-ab3b-0ab4afdc2e53/scratch');
const NEWS_SRC = path.join(SCRATCH_ROOT, 'news_src');
const VITE_BIN = path.join(NEWS_SRC, 'node_modules/vite/bin/vite.js');

console.log('=== BUILD ALL PORTALS FOR CHRISTIAN CULTURE ===');
console.log('LUMINA ROOT:', LUMINA_ROOT);
console.log('SCRATCH ROOT:', SCRATCH_ROOT);
console.log('VITE BIN:', VITE_BIN);

// 1. DATA DEFINITIONS FOR ALL 5 PORTALS
const PORTALS = [
  {
    id: 'nauka',
    title: 'CCN Nauka – Kosmologia, Fizyka, Socjologia a Biblia | Christian Culture',
    shortTitle: 'CCN Nauka & Kosmologia',
    brandSubtitle: 'Nauka poświadcza Pismo Święte • Kosmologia • Socjologia a Biblia • Etyka & Moralność',
    canonical: 'https://polskieradio.cc/nauka',
    description: 'Nauka poświadcza prawdę Biblii. Kosmologiczne dostrojenie wszechświata (Fine-Tuning), twierdzenie BGV, creatio ex nihilo oraz socjopatologie współczesnego świata w świetle chrześcijańskiej etyki i obiektywnej moralności.',
    badge: 'KOSMOLOGIA',
    accentColor: '#0284c7',
    categories: [
      { id: 'home', label: 'Wszystkie' },
      { id: 'kosmologia', label: 'Kosmologia & Fizyka' },
      { id: 'socjologia', label: 'Socjologia & Społeczeństwo' },
      { id: 'moralnosc', label: 'Moralność & Etyka' },
      { id: 'leksykon', label: 'Leksykon Pojęć' },
      { id: 'about', label: 'O dziale' }
    ],
    tickerItems: [
      'Kosmologia: Odkrycia James Webb Space Telescope i stałe fizyczne (Fine-Tuning) wskazują na zamysł Stwórcy (Rdz 1:1, Ps 19:2)',
      'Astrofizyka: Twierdzenie Borde-Guth-Vilenkin (BGV) dowodzi, że czasoprzestrzeń miała bezwzględny początek (Creatio ex nihilo)',
      'Socjologia: Badania empiryczne nad rozpadem więzi społecznych – Boży model wspólnoty i rodziny jako jedyne antidotum',
      'Etyka: Obiektywne prawo moralne i sumienie (Rz 2:15) wykluczają relatywizm i poświadczają istnienie Prawodawcy'
    ],
    articles: [

      {
        id: 'nauka-implanty-mozgowe-bci-neuralink',
        slug: 'implanty-mozgowe-bci-neuralink-bioetyka-imago-dei',
        title: 'Implanty mózgowe, interfejs mózg-komputer i granica człowieczeństwa: Przełom Neuralink a biblijna prawda o obrazie Boga (Imago Dei)',
        excerpt: 'Przełom w technologii interfejsów mózg-komputer (BCI) oraz pierwsze pomyślne procedury wszczepienia elektrod neuronowych pacjentom z paraliżem otwierają bezprecedensowy rozdział w dziejach medycyny regeneracyjnej.',
        content: [
          'Rozwój dwukierunkowych interfejsów mózg-komputer (BCI) wszedł w fazę dojrzałych testów klinicznych na ludziach, przekraczając granice dotychczasowych teorii laboratoryjnych. Prowadzona przez firmę Neuralink próba kliniczna PRIME udowodniła, że miniaturowy bezprzewodowy implant N1 pozwala pacjentom z porażeniem czterokończynowym sterować komputerem za pomocą samej intencji motorycznej.',
          'Entuzjazm związany z sukcesami klinicznymi neurotechnologii jest jednak nierozerwalnie spleciony z głębokim niepokojem bioetycznym, którego źródłem są dalekosiężne postulaty transhumanizmu dążące do modyfikowania zdrowego układu nerwowego i rzekomej symbiozy ze sztuczną inteligencją.',
          'Fundamentem chrześcijańskiej odpowiedzi jest prawda o stworzeniu człowieka na obraz i podobieństwo Boże (Rdz 1:26–27 UBG). Człowiek nie jest biologiczną maszyną do optymalizacji, lecz arcydziełem Stwórcy, a prawdziwa odnowa umysłu to duchowe uświęcenie przez Chrystusa, a nie cybernetyczna rekonfiguracja synaps.'
        ],
        scriptureReference: {
          verse: 'Księga Rodzaju 1:26–27 / Psalm 139:13–14 (UBG)',
          text: 'Stworzył więc Bóg człowieka na swój obraz, na obraz Boga go stworzył... Chwalę cię, bo zostałem cudownie i trwożnie stworzony; cudowne są twoje dzieła.',
          strongCode: 'H6754 (celem) / H1823 (demut)'
        },
        category: 'bioetyka',
        categoryLabel: 'Bioetyka & Neurotechnologia',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-11-15T14:00:00Z',
        dateFormatted: '15 listopada 2026',
        imageUrl: '/images/news/art-implanty-mozgowe-bci-neuralink-bioetyka-imago-dei.jpg',
        imageCaption: 'Laboratorium neuroinżynierii: mikrochip interfejsu mózg-komputer (BCI) pod mikroskopem chirurgicznym.',
        readTimeMinutes: 10,
        isHero: true,
        isPopular: true,
        popularRank: 1,
        tags: ['Bioetyka', 'Neuralink', 'BCI', 'ImagoDei', 'Transhumanizm', 'Nauka']
      },
      {
        id: 'art-z-biblia-za-pan-brat-dzien-03',
        title: 'Gdzie jesteś? Anatomia upadku i pierwsza Ewangelia Edenu',
        slug: 'gdzie-jestes-anatomia-upadku-i-pierwsza-ewangelia-edenu',
        excerpt: 'W ramach globalnego programu „Z Biblią za Pan Brat” analizujemy przełomowy trzeci rozdział Księgi Rodzaju — mechanizm pokusy, ucieczkę człowieka i Bożą Protewangelię.',
        category: 'wiara',
        categoryLabel: 'Z BIBLIĄ ZA PAN BRAT · ROZWAŻANIE DNIA',
        publishedAt: '2026-10-03T06:00:00Z',
        dateFormatted: '3 października 2026',
        imageUrl: '/images/academy/daily/kc_day_03_fall.jpg',
        imageCaption: 'Księga Rodzaju 3: Bóg przychodzi szukać człowieka i ogłasza pierwszą obietnicę Zbawiciela.',
        readTimeMinutes: 5,
        isHero: false,
        isPopular: false,
        tags: ['Z Biblią za Pan Brat', 'Księga Rodzaju', 'Rdz 3', 'Protewangelia', 'Cezary Rogowski'],
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        scriptureReference: {
          verse: 'Księga Rodzaju 3:15',
          text: 'I ustanowię nieprzyjaźń między tobą a kobietą, między twoim potomstwem a jej potomstwem; ono zrani ci głowę, a ty zranisz mu piętę.',
          strongCode: 'H2233'
        },
        content: [
          'Czy zauważasz, jak często w momentach trudności lub własnych potknięć Twój pierwszy odruch nie prowadzi do Boga, lecz do lęku i ukrywania się?',
          'Zatrzymaj się na progu trzeciego dnia naszej wspólnej wędrówki w Księdze Rodzaju i zbadaj z całą surowością stan swojego serca. Wypowiedz przed Ojcem to bezkompromisowe pytanie: Tato, dlaczego mój język i moje myśli tak często ulegają podszeptom zwątpienia w Twoją dobroć, zamiast bezwzględnie ufać Twojemu Słowu?',
          'Wchodząc dzisiaj w trzeci rozdział Księgi Rodzaju, stajemy w obliczu dramatu upadku człowieka, ale i niesamowitego, poruszającego poszukiwania ze strony Stwórcy. Kiedy człowiek zgrzeszył, spletł liście figowe i uciekł w cień drzew, to nie człowiek zawołał Boga – to Bóg przerwał milczenie i zadał najgłębsze pytanie w historii ludzkości: „Gdzie jesteś?”.'
        ]
      },
      {
        id: 'nauka-fine-tuning',
        title: 'Kosmologiczne dostrojenie wszechświata (Fine-Tuning): Dlaczego fizyka wskazuje na Umysł Stwórcy',
        slug: 'kosmologiczne-dostrojenie-wszechswiata-fine-tuning',
        excerpt: 'Stała kosmologiczna, siła oddziaływań jądrowych i niezwykle niska entropia początkowa: prawdopodobieństwo przypadkowego powstania wszechświata zdolnego podtrzymać życie wynosi 1 do 10^10^123.',
        content: [
          'Jednym z najbardziej zdumiewających odkryć współczesnej astrofizyki i kosmologii jest fakt, że fundamentalne stałe praw przyrody są z niewiarygodną precyzją dostrojone do umożliwienia istnienia życia białkowego. Gdyby siła grawitacji różniła się o zaledwie jedną część na 10^60, gwiazdy wielkości naszego Słońca nigdy by nie powstały, uniemożliwiając stabilne układy planetarne.',
          'Jak zauważył wybitny matematyk i fizyk Roger Penrose, precyzja fazy początkowej entropii wszechświata po Wielkim Wybuchu musiała być dokładna do jednej części na 10^10^123. Jest to liczba przekraczająca całkowitą ilość cząstek elementarnych w całym obserwowalnym wszechświecie. Materialistyczna próba wyjaśnienia tego fenomenu poprzez hipotezę wieloświatów (Multiverse) jest w rzeczywistości aktem metafizycznej wiary pozbawionym jakiegokolwiek dowodu empirycznego.',
          'Pismo Święte ponad trzy tysiące lat temu deklarowało z pełną mocą: „Niebiosa opowiadają chwałę Boga, a firmament głosi dzieło Jego rąk” (Ps 19:2). Badania kosmologiczne XXI wieku nie tylko nie zaprzeczają prawdzie Słowa Bożego, ale w spektakularny sposób poświadczają, że wszechświat jest arcydziełem Boskiego Inżyniera.'
        ],
        scriptureReference: {
          verse: 'Księga Psalmów 19:2',
          text: 'Niebiosa opowiadają chwałę Boga, a firmament głosi dzieło Jego rąk.',
          strongCode: 'H8064 (shamayim - niebiosa) / H410 (El - Bóg Najwyższy)'
        },
        category: 'kosmologia',
        categoryLabel: 'Kosmologia & Fizyka',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-10-02T12:00:00Z',
        dateFormatted: '2 października 2026',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'Głębokie pole kosmiczne – precyzyjne dostrojenie parametrów fizycznych wszechświata.',
        readTimeMinutes: 7,
        isHero: true,
        isPopular: true,
        popularRank: 1,
        tags: ['Kosmologia', 'Fine-Tuning', 'Fizyka', 'Stworzenie', 'Astrofizyka'],
        biblicalCommentary: {
          thesis: 'Złożoność i precyzja praw fizyki nie są dziełem ślepego losu, lecz wyrazem wiecznej mądrości Chrystusa.',
          verses: [
            {
              ref: 'Kolosan 1:16-17',
              text: 'W Nim bowiem wszystko zostało stworzone na niebie i na ziemi... i wszystko w Nim trwa.',
              strongRef: 'G4921 (synistemi - współistnieć, trwać w spójności)'
            },
            {
              ref: 'Hebrajczyków 11:3',
              text: 'Przez wiarę rozumiemy, że światy zostały ukształtowane słowem Boga, tak że to, co widzimy, nie powstało z rzeczy widzialnych.',
              strongRef: 'G2675 (katartizo - doskonale uładzić, skonstruować)'
            }
          ],
          explanation: 'Współczesna fizyka dochodzi do granicy poznania materii, odkrywając, że podwaliny rzeczywistości mają charakter czysto informacyjny i matematyczny, co jest dokładnym odzwierciedleniem biblijnej prawdy o stworzeniu przez Słowo (Logos).'
        }
      },
      {
        id: 'nauka-socjopatologie',
        title: 'Socjopatologie ponowoczesności: Jak odrzucenie Dekalogu doprowadziło do epidemii samotności',
        slug: 'socjopatologie-ponowoczesnosci-kryzys-etyki',
        excerpt: 'Socjologiczna analiza rozpadu tkanki społecznej: atomizacja, narcyzm kulturowy i rozpad rodziny w świetle badań empirycznych i etyki chrześcijańskiej.',
        content: [
          'Dane socjologiczne z ostatnich trzech dekad w świecie zachodnim biją na alarm. Gwałtowny wzrost wskaźników klinicznej samotności, depresji młodzieńczej, samobójstw oraz załamanie wskaźnika dzietności to bezpośrednie konsekwencje demontażu tradycyjnej etyki chrześcijańskiej.',
          'Gdy społeczeństwo porzuca transcendentną normę moralną na rzecz skrajnego indywidualizmu i subiektywizmu („rób to, co uważasz za dobre dla siebie”), instytucje przymierza – małżeństwo, rodzina, parafialna i sąsiedzka wspólnota – ulegają korozji. Człowiek staje się samotnym konsumentem zdanym na technokratyczny aparat państwowy i algorytmy mediów społecznościowych.',
          'Pismo Święte przestrzegało przed tą dynamiką: „Sprawiedliwość wywyższa naród, lecz grzech jest hańbą dla narodów” (Prz 14:34). Biblijny model relacji, oparty na ofiarnej miłości agape, wierności i odpowiedzialności za słabszych, okazuje się jedynym stabilnym fundamentem zdrowego społeczeństwa.'
        ],
        scriptureReference: {
          verse: 'Księga Przysłów 14:34',
          text: 'Sprawiedliwość wywyższa naród, lecz grzech jest hańbą dla narodów.',
          strongCode: 'H6666 (tsedakah - sprawiedliwość, prawość etyczna)'
        },
        category: 'socjologia',
        categoryLabel: 'Socjologia & Społeczeństwo',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-10-02T10:30:00Z',
        dateFormatted: '2 października 2026',
        imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'Relacje międzyludzkie a kryzys samotności w zatomizowanym świecie.',
        readTimeMinutes: 6,
        isHero: true,
        isPopular: true,
        popularRank: 2,
        tags: ['Socjologia', 'Moralność', 'Rodzina', 'Dekalog', 'Etyka']
      },
      {
        id: 'nauka-bgv-poczatek',
        title: 'Początek czasu i materii: Twierdzenie BGV a biblijne „Creatio ex nihilo”',
        slug: 'poczatek-czasu-twierdzenie-bgv-creatio-ex-nihilo',
        excerpt: 'Fizycy Borde, Guth i Vilenkin matematycznie wykazali, że każdy rozszerzający się model wszechświata musiał mieć absolutny początek w czasie. Materia nie jest wieczna.',
        content: [
          'Przez stulecia filozofowie materialistyczni, od Arystotelesa po marksizm, próbowali twierdzić, że wszechświat jest wieczny i nie potrzebował Stwórcy. W 2003 roku trzej czołowi astrofizycy – Arvin Borde, Alan Guth i Alexander Vilenkin – sformułowali twierdzenie matematyczne (twierdzenie BGV), które dowodzi, że jakikolwiek kosmos o średniej ekspansji większej od zera musiał mieć początkową granicę czasoprzestrzenną.',
          'Jak napisał sam Alexander Vilenkin: „Wszelkie dowody, jakimi dysponujemy, wskazują na to, że wszechświat miał początek. Fizycy nie mogą się już dłużej chować za możliwością wiecznego w przeszłość kosmosu”. Skoro materia, przestrzeń i czas zaczęły istnieć, ich Przyczyna musi znajdować się poza materią, przestrzenią i czasem.',
          'Jest to dokładne poświadczenie pierwszego zdania Pisma Świętego: „Na początku stworzył Bóg niebiosa i ziemię” (Rdz 1:1). Stworzenie z niczego (creatio ex nihilo) z teologicznego dogmatu stało się empiryczną koniecznością współczesnej nauki.'
        ],
        scriptureReference: {
          verse: 'Księga Rodzaju 1:1',
          text: 'Na początku stworzył Bóg niebiosa i ziemię.',
          strongCode: 'H7225 (reshit - początek czasu) / H1254 (bara - stworzyć z niczego)'
        },
        category: 'kosmologia',
        categoryLabel: 'Kosmologia & Fizyka',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-10-01T15:00:00Z',
        dateFormatted: '1 października 2026',
        imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 5,
        isPopular: true,
        popularRank: 3,
        tags: ['BGV', 'Początek Wszechświata', 'Rdz 1:1', 'Fizyka']
      },
      {
        id: 'nauka-moralnosc-obiektywna',
        title: 'Argument z prawa moralnego: Dlaczego obiektywne dobro i zło wymagają Istnienia Boga',
        slug: 'argument-z-prawa-moralnego-obiektywna-etyka',
        excerpt: 'Bez transcendentnego Prawodawcy pojęcia sprawiedliwości i praw człowieka sprowadzają się do subiektywnych preferencji i prawa silniejszego.',
        content: [
          'Czy torturowanie niewinnych dzieci dla zabawy jest obiektywnie złe, czy jest to tylko „ewolucyjna adaptacja sprzyjająca przetrwaniu stada”? Jeśli naturalizm i ateizm byłyby prawdą, żadna obiektywna moralność nie mogłaby istnieć – istniałyby jedynie subiektywne opinie ukształtowane przez chemię mózgu.',
          'Jednak każdy człowiek intuicyjnie wie, że sprawiedliwość, miłość i godność ludzka są obiektywnie realne. Gdy ktoś nas oszukuje lub krzywdzi, nie apelujemy o „zmianę gustu”, lecz odwołujemy się do obiektywnego Prawa, które ten człowiek złamał.',
          'Apostoł Paweł w Liście do Rzymian wyjaśnia: „Oni to pokazują, że dzieło zakonu jest wypisane w ich sercach, a ich sumienie daje temu świadectwo...” (Rz 2:15). Sumienie jest duchowym receptorem Bożego prawa moralnego, dowodzącym istnienia Świętego Prawodawcy.'
        ],
        scriptureReference: {
          verse: 'List do Rzymian 2:15',
          text: 'Oni to pokazują, że dzieło zakonu jest wypisane w ich sercach, a ich sumienie daje temu świadectwo.',
          strongCode: 'G3551 (nomos - prawo) / G4893 (syneidesis - sumienie)'
        },
        category: 'moralnosc',
        categoryLabel: 'Moralność & Etyka',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-09-30T14:20:00Z',
        dateFormatted: '30 września 2026',
        imageUrl: '/images/news/nauka-moralnosc-obiektywna.jpg',
        imageCaption: 'Ilustracja AI: Mosiężna waga sprawiedliwości, otwarta Księga i kamienne tablice Prawa — symbol obiektywnego porządku moralnego wypisanego w sumieniu człowieka (Rz 2:15; ilustracja poglądowa wygenerowana z pomocą AI).',
        readTimeMinutes: 5,
        tags: ['Moralność', 'Etyka', 'Sumienie', 'Apologetyka', 'Rz 2:15']
      },
      {
        id: 'nauka-rozciaganie-niebios',
        title: 'Ekspansja kosmosu a proroctwo Izajasza: Zdumiewająca precyzja biblijnej kosmologii',
        slug: 'ekspansja-kosmosu-a-proroctwo-izajasza',
        excerpt: 'Ponad 11 wersetów Starego Testamentu mówi o „rozciąganiu niebios” przez Boga. Jak starożytny tekst hebrajski opisał zjawisko odkryte przez Hubble\'a dopiero w XX wieku.',
        content: [
          'Gdy w 1929 roku Edwin Hubble odkrył przesunięcie ku czerwieni w widmach odległych galaktyk, świat naukowy przeżył wstrząs: wszechświat nie jest statyczny, lecz podlega nieustannej ekspansji.',
          'Tymczasem prorok Izajasz w VIII wieku przed Chrystusem pisał pod natchnieniem Ducha Świętego: „On rozpościera niebiosa jak tkaninę i rozciąga je jak namiot mieszkalny” (Iz 40:22). Użyty w języku hebrajskim czasownik „natah” (Strong H5186) w formie imiesłowowej oznacza ciągłe, aktywne rozciąganie przestrzeni.',
          'Podobne sformułowania odnajdujemy w Księdze Hioba (9:8), Psalmie 104 (w. 2) oraz u proroka Zachariasza (12:1). Zbieżność biblijnego opisu z odkryciami reliktowego promieniowania tła i geometrii czasoprzestrzeni Einsteina po raz kolejny dowodzi Boskiego natchnienia Pisma.'
        ],
        scriptureReference: {
          verse: 'Księga Izajasza 40:22',
          text: 'On rozpościera niebiosa jak tkaninę i rozciąga je jak namiot mieszkalny.',
          strongCode: 'H5186 (natah - rozciągać, rozwijać)'
        },
        category: 'kosmologia',
        categoryLabel: 'Kosmologia & Fizyka',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-09-28T09:15:00Z',
        dateFormatted: '28 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 4,
        tags: ['Kosmologia', 'Hubble', 'Izajasz', 'Ekspansja']
      },
      {
        id: 'nauka-kryzys-ojcostwa',
        title: 'Kryzys ojcostwa w badaniach empirycznych: Jak brak ojca niszczy pokolenie',
        slug: 'kryzys-ojcostwa-w-badaniach-socjologicznych',
        excerpt: 'Badania socjologiczne jednoznacznie dowodzą, że absencja ojca w domu odpowiada za lawinowy wzrost przestępczości, uzależnień i samobójstw u młodzieży.',
        content: [
          'Według danych amerykańskich i europejskich instytutów demograficznych, dzieci wychowujące się w domach bez ojców stanowią 71% młodzieży porzucającej szkołę, 85% osadzonych w zakładach poprawczych oraz 75% pacjentów młodzieżowych klinik leczenia uzależnień.',
          'Współczesna ideologia próbująca zastąpić ojca „państwem opiekuńczym” lub twierdząca, że płeć rodziców nie ma znaczenia, poniosła spektakularną porażkę na poziomie empirycznym. Mężczyzna został przez Stwórcę zaprojektowany do pełnienia roli obrońcy, żywiciela i duchowego przewodnika domu.',
          'Słowo Boże w Liście do Efezjan nakazuje: „A wy, ojcowie, nie pobudzajcie do gniewu waszych dzieci, lecz wychowujcie je w karności i napomnieniu Pana” (Ef 6:4). Odrodzenie biblijnego ojcostwa jest warunkiem przetrwania naszej cywilizacji.'
        ],
        scriptureReference: {
          verse: 'List do Efezjan 6:4',
          text: 'A wy, ojcowie, nie pobudzajcie do gniewu waszych dzieci, lecz wychowujcie je w karności i napomnieniu Pana.',
          strongCode: 'G3962 (pater - ojciec) / G3809 (paideia - wychowanie, karność)'
        },
        category: 'socjologia',
        categoryLabel: 'Socjologia & Społeczeństwo',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-09-25T11:00:00Z',
        dateFormatted: '25 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 5,
        tags: ['Ojcostwo', 'Rodzina', 'Socjologia', 'Wychowanie']
      }
    ],
    lexicon: [
      {
        id: 'fine-tuning',
        term: 'Fine-Tuning (Precyzyjne Dostrojenie)',
        originalScript: 'תֵּבֵל / κόσμος',
        transliteration: 'tevel / kosmos',
        strongCode: 'H8398 / G2889',
        definition: 'Zjawisko w fizyce teoretycznej oznaczające, że stałe praw przyrody (np. siła grawitacji, stała kosmologiczna) mieszczą się w skrajnie wąskim przedziale umożliwiającym istnienie życia.',
        biblicalContext: 'Wszechświat nie jest dziełem przypadku, lecz został zaplanowany i powołany do bytu przez nieskończenie inteligentnego Stwórcę (Przypowieści 8:27-30).',
        keyVerses: [
          { ref: 'Ps 19:2', text: 'Niebiosa opowiadają chwałę Boga, a firmament głosi dzieło Jego rąk.' },
          { ref: 'Kol 1:17', text: 'On jest przed wszystkim i wszystko w Nim trwa.' }
        ],
        tags: ['Fizyka', 'Kosmologia', 'Projekt'],
        category: 'teologia'
      },
      {
        id: 'creatio-ex-nihilo',
        term: 'Creatio Ex Nihilo (Stworzenie z Niczego)',
        originalScript: 'בָּרָא מֵאַיִן',
        transliteration: 'bara me-ayin',
        strongCode: 'H1254',
        definition: 'Doktryna stwierdzająca, że Bóg powołał wszechświat, czas, przestrzeń i całą materię do istnienia bez użycia jakiegokolwiek uprzednio istniejącego budulca.',
        biblicalContext: 'Odrzuca panteizm i materializm. Bóg jest transcendentny wobec świata i nie jest częścią wszechświata, lecz jego Suwerennym Autorem.',
        keyVerses: [
          { ref: 'Rdz 1:1', text: 'Na początku stworzył Bóg niebiosa i ziemię.' },
          { ref: 'Hbr 11:3', text: 'Przez wiarę rozumiemy, że światy zostały ukształtowane słowem Boga.' }
        ],
        tags: ['Kreacjonizm', 'Kosmologia', 'Teologia'],
        category: 'teologia'
      },
      {
        id: 'zasada-antropiczna',
        term: 'Zasada Antropiczna (Anthropic Principle)',
        originalScript: 'אָדָם',
        transliteration: 'Adam',
        strongCode: 'H120',
        definition: 'Obserwacja astrofizyczna, zgodnie z którą prawa fizyki, położenie Ziemi w Układzie Słonecznym i struktura kosmosu wyglądają tak, jakby wszechświat został celowo przygotowany dla człowieka.',
        biblicalContext: 'Bóg ukształtował Ziemię z miłości do człowieka, aby była przez niego zamieszkana i zarządzana w posłuszeństwie Stwórcy (Izajasza 45:18).',
        keyVerses: [
          { ref: 'Iz 45:18', text: 'Tak mówi PAN, który stworzył niebiosa... nie na próżno ją stworzył, lecz na mieszkanie ją ukształtował.' }
        ],
        tags: ['Kosmologia', 'Człowiek', 'Stworzenie'],
        category: 'teologia'
      },
      {
        id: 'socjopatologia',
        term: 'Socjopatologia Kulturowa',
        originalScript: 'עָוֹן',
        transliteration: 'awon',
        strongCode: 'H5771',
        definition: 'Zjawisko rozpadu norm moralnych, instytucji rodziny i więzi społecznych w wyniku systemowego odrzucenia prawa Bożego na rzecz hedonizmu i relatywizmu.',
        biblicalContext: 'Gdy naród odwraca się od Bożych przykazań, nieuchronnym skutkiem jest demoralizacja, wzrost przemocy, rozpad domów i kryzys tożsamości (Sędziów 21:25).',
        keyVerses: [
          { ref: 'Prz 14:34', text: 'Sprawiedliwość wywyższa naród, lecz grzech jest hańbą dla narodów.' }
        ],
        tags: ['Socjologia', 'Etyka', 'Społeczeństwo'],
        category: 'spoleczenstwo'
      },
      {
        id: 'syneidesis',
        term: 'Sumienie (Syneidesis)',
        originalScript: 'συνείδησις',
        transliteration: 'syneidesis',
        strongCode: 'G4893',
        definition: 'Wewnętrzny zmysł moralny dany każdemu człowiekowi przez Boga, świadczący o obiektywnym dobru i złu, oskarżający lub usprawiedliwiający postępowanie.',
        biblicalContext: 'Sumienie poświadcza, że prawo Boże jest wyryte w ludzkim sercu (Rz 2:15). Może zostać zagłuszone przez uporczywy grzech, lecz odnawia je krew Chrystusa.',
        keyVerses: [
          { ref: 'Rz 2:15', text: 'Ich sumienie daje temu świadectwo, a ich myśli nawzajem się oskarżają lub usprawiedliwiają.' },
          { ref: 'Hbr 9:14', text: 'Krew Chrystusa oczyści wasze sumienie z martwych uczynków.' }
        ],
        tags: ['Etyka', 'Sumienie', 'Nowy Testament'],
        category: 'etyka'
      },
      {
        id: 'bgv-theorem',
        term: 'Twierdzenie Borde-Guth-Vilenkina (BGV)',
        originalScript: 'רֵאשִׁית',
        transliteration: 'reshit',
        strongCode: 'H7225',
        definition: 'Twierdzenie matematyczno-kosmologiczne z 2003 r. dowodzące, że każdy rozszerzający się model wszechświata musi mieć w przeszłości początkowy punkt brzegowy w czasie.',
        biblicalContext: 'Ostateczny naukowy dowód na to, że wszechświat nie istniał odwiecznie i musiał zostać zapoczątkowany przez Wiecznego Boga.',
        keyVerses: [
          { ref: 'Rdz 1:1', text: 'Na początku stworzył Bóg niebiosa i ziemię.' }
        ],
        tags: ['Fizyka', 'BGV', 'Początek'],
        category: 'teologia'
      }
    ]
  },

  // 2. HISTORIA
  {
    id: 'historia',
    title: 'CCN Historia – Rzetelność Historyczna i Archeologia Biblijna | Christian Culture',
    shortTitle: 'CCN Historia & Archeologia',
    brandSubtitle: 'Historia potwierdza Pismo • Archeologia Biblijna • Manuskrypty z Qumran • Wykopaliska',
    canonical: 'https://polskieradio.cc/historia',
    description: 'Archeologia i historia poświadczają rzetelność Pisma Świętego. Zwoje z Qumran, stela z Tel Dan, pieczęcie królów Judy, tunel Ezechiasza i rzetelność rękopisów Nowego Testamentu.',
    badge: 'ARCHEOLOGIA',
    accentColor: '#d97706',
    categories: [
      { id: 'home', label: 'Wszystkie' },
      { id: 'archeologia', label: 'Archeologia Biblijna' },
      { id: 'manuskrypty', label: 'Manuskrypty & Zwoje' },
      { id: 'krolowie', label: 'Królowie & Prorocy' },
      { id: 'leksykon', label: 'Leksykon Historyczny' },
      { id: 'about', label: 'O dziale' }
    ],
    tickerItems: [
      'Archeologia: Odkrycie bulli króla Ezechiasza i proroka Izajasza u stóp Wzgórza Świątynnego potwierdza relację 2 Królewskiej',
      'Manuskrypty: Wielki Zwój Izajasza z Qumran (1QIsa^a) poświadcza niezmienność tekstu biblijnego przez ponad 1000 lat',
      'Inskrypcje: Stela z Tel Dan z IX w. p.n.e. ze wzmianką o „Domu Dawida” (BYTDWD) bezsprzecznie uciszyła krytyków biblijnych',
      'Nowy Testament: Papirus P52 z ok. 125 r. n.e. dowodzi szybkiego obiegu Ewangelii Jana w całym basenie Morza Śródziemnego'
    ],
    articles: [
      {
            "id": "art-dzien-reformacji-2026-wrocmy-do-pisma-i-ewangelii-laski",
            "title": "Reformacja nie skończyła się w 1517 roku — wróćmy do Pisma i Ewangelii łaski",
            "slug": "dzien-reformacji-2026-wrocmy-do-pisma-i-ewangelii-laski",
            "excerpt": "Dziś, 31 października 2026 roku, przypada Dzień Reformacji. Mija 509 lat od 1517 roku, gdy Marcin Luter ogłosił 95 tez w Wittenberdze. Dlaczego Sola Scriptura i Sola Gratia pozostają żywym wezwaniem do przemiany serca i sumienia? Obejrzyj film „Luter” na Christian Culture TV.",
            "category": "manuskrypty",
            "categoryLabel": "CCN HISTORIA • BADANIA I ŹRÓDŁA",
            "publishedAt": "2026-10-31T08:00:00Z",
            "dateFormatted": "31 października 2026",
            "imageUrl": "/images/news/art-dzien-reformacji-2026.jpg",
            "imageCaption": "31 października: 509. rocznica Reformacji. Wittenberga 1517 r. i powrót do autorytetu Słowa Bożego.",
            "readTimeMinutes": 8,
            "isHero": true,
            "isPopular": true,
            "popularRank": 1,
            "tags": [
                  "Dzień Reformacji",
                  "Reformacja",
                  "Marcin Luter",
                  "Sola Scriptura",
                  "Sola Gratia",
                  "Historia Kościoła",
                  "Cezary Rogowski",
                  "Wittenberga",
                  "Wormacja",
                  "Pismo Święte",
                  "Film Luter"
            ],
            "author": {
                  "id": "cezary-rogowski",
                  "name": "Cezary Rogowski",
                  "role": "Założyciel Christian Culture",
                  "status": "Żonaty",
                  "avatarUrl": "/avatar_cezary_official.jpg",
                  "bio": "Założyciel ekosystemu Christian Culture oraz portalu Lumina i stacji Polskie Radio CC."
            },
            "youtubeVideoId": "lug1BNspb8k",
            "videoUrl": "https://youtu.be/lug1BNspb8k",
            "scriptureReference": {
                  "verse": "List do Rzymian 1:16–17",
                  "text": "Nie wstydzę się bowiem ewangelii Chrystusa, ponieważ jest ona mocą Boga ku zbawieniu dla każdego, kto wierzy (...) Sprawiedliwy zaś z wiary żyć będzie.",
                  "strongCode": "G1343"
            },
            "lexiconTerms": [
                  {
                        "term": "Sola Scriptura (2 Tm 3:16–17)",
                        "strongCode": "G2315",
                        "definition": "Zasada nadrzędnego autorytetu natchnionego Pisma Świętego (theopneustos — tchnięte przez Boga) jako jedynej nieomylnej normy wiary i życia chrześcijańskiego."
                  },
                  {
                        "term": "Sola Gratia (Ef 2:8–9)",
                        "strongCode": "G5485",
                        "definition": "Usprawiedliwienie i zbawienie człowieka jako całkowicie darmowy, niezasłużony dar Bożej łaski (charis) przyjmowany przez wiarę w Chrystusa, nie z ludzkich zasług."
                  }
            ],
            "biblicalCommentary": {
                  "thesis": "Prawdziwa Reformacja to powrót do Chrystusa i uświęcenie codziennego sumienia",
                  "explanation": "Odnowa Kościoła i osobistej wiary nie polega na podtrzymywaniu plemiennych wojen religijnych sprzed stuleci, lecz na odwadze podporządkowania własnego życia i przekonań prawdzie Pisma Świętego.",
                  "verses": [
                        {
                              "ref": "Rz 1:16–17",
                              "text": "Sprawiedliwy z wiary żyć będzie."
                        },
                        {
                              "ref": "Ef 2:8–10",
                              "text": "Łaską bowiem jesteście zbawieni przez wiarę (...) stworzeni w Chrystusie Jezusie do dobrych uczynków."
                        },
                        {
                              "ref": "2 Tm 3:16–17",
                              "text": "Całe Pismo przez Boga jest natchnione i pożyteczne do nauki, do strofowania, do poprawy, do wychowania w sprawiedliwości."
                        },
                        {
                              "ref": "Ap 14:6–7",
                              "text": "I widziałem innego anioła lecącego środkiem nieba, mającego wieczną Ewangelię, aby ją zwiastować mieszkańcom ziemi."
                        }
                  ]
            },
            "resourceLinks": [
                  {
                        "label": "Obejrzyj pełnometrażowy film „Luter” na Christian Culture TV (YouTube)",
                        "url": "https://youtu.be/lug1BNspb8k"
                  },
                  {
                        "label": "Interlinearna MojaBiblia CC — Badaj teksty oryginalne ze Strongiem",
                        "url": "https://polskieradio.cc/mojabiblia"
                  },
                  {
                        "label": "Akademia Biblijna — Kurs Codzienny „Z Biblią za Pan Brat”",
                        "url": "https://polskieradio.cc/akademia/kurscodzienny"
                  }
            ],
            "content": [
                  "Dziś, 31 października 2026 roku, przypada Dzień Reformacji. Mija 509 lat od 1517 roku, gdy Marcin Luter ogłosił 95 tez dotyczących odpustów. Dzień ten zwyczajowo upamiętnia początek ruchu, który zmienił oblicze zachodniego chrześcijaństwa. Czy jest to jednak tylko rocznica wydarzenia sprzed pięciu stuleci? A może również okazja, by postawić sobie pytanie, czy moja własna wiara potrzebuje odnowy?",
                  "Wydaje mi się, że prawdziwe dziedzictwo Reformacji nie polega na nieustannym sporze o to, kto zwyciężył w XVI wieku. Polega na odwadze sprawdzania własnych przekonań w świetle Pisma i powracania do Jezusa Chrystusa. Nie potrzebujemy kolejnego święta religijnego pozbawionego przemiany serca. Potrzebujemy prawdy, która dotyka naszego codziennego postępowania.",
                  "[KADR: /images/news/luter-film-plakat-pionowy.jpg | Film „Luter” (2003, reż. Eric Till) z Josephem Fiennesem w roli Marcina Lutra — opowieść o człowieku, który w poszukiwaniu pokoju z Bogiem zmienił bieg dziejów Europy.]",
                  "1. Co naprawdę wydarzyło się w Wittenberdze?",
                  "Luter był augustiańskim zakonnikiem i profesorem teologii. Jego 95 tez otworzyło dyskusję o odpustach, pokucie i nadużyciach religijnych. Początkowo nie były gotowym programem stworzenia osobnego Kościoła. Dzięki drukowi kontrowersja szybko rozprzestrzeniła się daleko poza Wittenbergę.",
                  "Tradycyjna scena przybicia tez do drzwi kościoła stała się symbolem; szczegóły tego gestu pozostają przedmiotem historycznej dyskusji. Samo rozpowszechnienie tez i rosnący spór są dobrze poświadczone. Reformacja przyniosła szerszy dostęp do Biblii, nowe formy nauczania oraz istotną debatę o zbawieniu. Jej historia obejmowała także bolesne podziały i przemoc. Nie służy prawdzie przemilczanie ani osiągnięć, ani błędów ludzi po którejkolwiek stronie.",
                  "[KADR: /images/news/luter-film-kadr-staupitz-klasztor.jpg | Zmagania młodego mnicha w murach klasztoru w Erfurcie: Johann von Staupitz kieruje uwagę udręczonego Lutra z własnej niedoskonałości ku miłości i ofierze Jezusa Chrystusa.]",
                  "2. Sola Scriptura — czy Słowo naprawdę ma ostatnie słowo?",
                  "Reformacyjna zasada Sola Scriptura nie oznacza lekceważenia historii czy mądrości innych chrześcijan. Oznacza, że Pismo pozostaje najwyższym autorytetem dla nauki wiary. Apostoł Paweł wskazuje na jego rolę w nauczaniu, napominaniu i wychowaniu w sprawiedliwości (2 Tm 3,16–17), a Berejczycy sprawdzają głoszone im nauczanie przez badanie Pism (Dz 17,11).",
                  "Zadaję sobie trudne pytanie: czy otwieram Biblię po to, aby Bóg mógł skorygować moje poglądy, czy szukam jedynie wersetów, które je potwierdzą? Reformacja jest żywa tam, gdzie człowiek ma odwagę powiedzieć: „Panie, jeśli się mylę, naucz mnie Twojej prawdy”.",
                  "[KADR: /images/news/luter-film-kadr-wormacja-1521.jpg | Słynna obrona na Sejmie w Wormacji w 1521 roku przed cesarzem Karolem V: „Moje sumienie jest pojmane w Słowie Bożym. Odwołać niczego nie mogę i nie chcę. Tu stoję, inaczej nie mogę, niech mi Bóg dopomoże. Amen”.]",
                  "3. Solus Christus i Sola Gratia — centrum, którego nie wolno zgubić",
                  "Lutrowi towarzyszyło pytanie, jak grzeszny człowiek może zostać uznany za sprawiedliwego przed Bogiem. Rz 1,16–17 ukazuje Ewangelię jako moc Bożą ku zbawieniu, a Rz 3,21–26 przedstawia usprawiedliwienie przez odkupienie w Jezusie Chrystusie.",
                  "Ef 2,8–10 daje nam niezwykle ważną kolejność: zostajemy zbawieni łaską przez wiarę, nie na podstawie naszych uczynków; zostajemy jednak stworzeni w Chrystusie do dobrych czynów. Łaska nie jest więc nagrodą za religijną doskonałość. Jest niezasłużonym darem, który prowadzi do przemienionego życia.",
                  "Nie uratują mnie pieniądze, dobre uczynki rozumiane jako zapłata za zbawienie ani opinia innych o mojej pobożności. Jedynym Pośrednikiem jest Chrystus (1 Tm 2,5). Tylko Jemu należy się chwała. A moja wiara powinna wydawać owoce uczciwości, miłości i odpowiedzialności.",
                  "[KADR: /images/news/luter-film-kadr-fryderyk-madry.jpg | Książę saski Fryderyk Mądry (w filmie wybitna rola Sir Petera Ustinova) — władca, który chronił wolność myśli i dał schronienie Lutrowi na zamku w Wartburgu, umożliwiając przetłumaczenie Nowego Testamentu na język ojczysty.]",
                  "4. Od reformy instytucji do reformy mojego sumienia",
                  "Znacznie łatwiej oceniać pomyłki ludzi sprzed pięciuset lat niż własne. Jezus przypomina jednak, że można zachować religijną formę i zaniedbywać sprawiedliwość, miłosierdzie i wierność (Mt 23,23–28).",
                  "Jeśli mówię o Biblii, a oszukuję w interesach, potrzebuję reformy. Jeśli głoszę miłość, a upokarzam bliskich, potrzebuję reformy. Jeśli wzywam innych do pokuty, ale sam nie chcę przyznać się do winy, moje hasła są puste.",
                  "Prawdziwa odnowa oznacza przyznanie prawdy, zaprzestanie krzywdy i podjęcie odpowiedzialności. Nikt nie zostaje zbawiony przez własną moralną sprawność, ale łaska Chrystusa nigdy nie jest usprawiedliwieniem hipokryzji (Tt 2,11–14).",
                  "[KADR: /images/news/luter-film-kadr-rebel-genius.jpg | Prawdziwe przesłanie Reformacji to nie spór polityczny, lecz osobista przemiana życia w blasku Bożej łaski.]",
                  "5. Wieczna Ewangelia dla współczesnego świata",
                  "Ap 14,6–7 przedstawia wieczną Ewangelię głoszoną wszystkim narodom, językom i ludom. W jej centrum jest wezwanie do oddawania czci Stwórcy. To ważne przypomnienie, że reforma wiary nie kończy się na nowych strukturach organizacyjnych i polemikach. Prowadzi do żywej relacji z Bogiem.",
                  "Nie trzeba dopasowywać każdej bieżącej wiadomości do proroctwa, aby zachować biblijną czujność. Chrześcijanin ma szukać prawdy i żyć nią z miłością oraz nadzieją. Świat potrzebuje przede wszystkim Ewangelii Jezusa Chrystusa, a nie kolejnego religijnego konfliktu prowadzonego dla prestiżu.",
                  "6. Obejrzyj film „Luter” na Christian Culture TV",
                  "Z okazji Dnia Reformacji zapraszam Cię do obejrzenia filmu „Luter – człowiek, który zmienił oblicze Kościoła”, udostępnionego z polskim lektorem na kanale Christian Culture TV.",
                  "Film „Luther” z 2003 roku, wyreżyserowany przez Erica Tilla, przedstawia duchowe zmagania reformatora i wydarzenia prowadzące do Reformacji. W roli tytułowej występuje Joseph Fiennes. Film jest dramatem historycznym, a nie dokumentem, dlatego warto traktować go jako zachętę do dalszego poznawania historii i Pisma Świętego.",
                  "Zobacz cały film z polskim lektorem bezpośrednio pod adresem: https://youtu.be/lug1BNspb8k lub w powyższym oknie odtwarzacza.",
                  "Zaproś rodzinę lub znajomych, a po seansie przeczytajcie razem Rz 1,16–17 oraz Ef 2,8–10. Zastanówcie się: na czym opieramy pewność zbawienia? Co oznacza wolność w Chrystusie? Czy moja religijność pozostaje otwarta na korektę Słowa Bożego?",
                  "7. Reformacja zaczyna się dziś",
                  "Nie chcę, żeby 31 października był tylko datą w kalendarzu. Chciałbym, aby stał się dniem osobistej decyzji. Wróćmy do Biblii. Nie udawajmy bezbłędnych. Przyjmijmy zbawienie z łaski, a następnie uczmy się żyć w sposób godny Ewangelii.",
                  "Modlitwa na Dzień Reformacji: Panie Jezu, daj nam pokorę wobec Twojego Słowa, odwagę do odrzucenia obłudy, miłość do ludzi o innych przekonaniach i wdzięczność za Twoją łaskę. Niech odnowa zacznie się we mnie. Amen.",
                  "Podsumowanie Redakcyjne CCN News: Dzień Reformacji 2026 to zaproszenie do osobistego rachunku sumienia i oparcia życia na niewzruszonym fundamencie Pisma Świętego. Wszystkie publikacje, słuchowiska i materiały Christian Culture są w 100% bezpłatne. Pełny film z polskim lektorem dostępny jest na Christian Culture TV (YouTube: lug1BNspb8k)."
            ]
      },      {
        id: 'art-co-dalej-z-ta-niedziela-szabat-bacchiocchi',
        title: "Co dalej z tą niedzielą? Szabat, pierwszy pełny dzień człowieka i pytanie o spotkanie ze Stwórcą",
        slug: 'co-dalej-z-ta-niedziela-szabat-bacchiocchi',
        excerpt: "Dlaczego chrześcijanie świętują niedzielę, skoro Bóg pobłogosławił siódmy dzień? Biblia, historia i badania Samuele Bacchiocchiego.",
        category: 'manuskrypty',
        categoryLabel: 'CCN HISTORIA • BADANIA I ŹRÓDŁA',
        publishedAt: '2026-10-23T18:00:00Z',
        dateFormatted: '23 października 2026',
        imageUrl: '/images/news/art-co-dalej-z-ta-niedziela-szabat-bacchiocchi.jpg',
        imageCaption: 'Ilustracja artystyczna: Rodzina odpoczywa o zachodzie słońca z otwartą Biblią na stole.',
        readTimeMinutes: 10,
        isHero: true,
        isPopular: true,
        popularRank: 1,
        tags: ['Szabat', 'Niedziela', 'Historia Kościoła', 'Bacchiocchi', 'Dekalog', 'Stworzenie', 'Cezary Rogowski'],
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        scriptureReference: {
          verse: 'Ewangelia wg św. Marka 2:27–28',
          text: 'I mówił im: Szabat został ustanowiony dla człowieka, a nie człowiek dla szabatu. Dlatego Syn Człowieczy jest też Panem szabatu.',
          strongCode: 'G4521'
        },
        content: [
          "Czy zastanawiałeś się kiedyś, dlaczego większość chrześcijan spotyka się na nabożeństwach w niedzielę, skoro czwarte przykazanie mówi o siódmym dniu tygodnia? I dlaczego już na pierwszych stronach Biblii Bóg wyróżnia nie pierwszy, lecz siódmy dzień? Nie chcę rozpoczynać kolejnego sporu o kalendarz. Chcę zaprosić Cię do czegoś głębszego: do odkrycia czasu, który Stwórca oddzielił dla człowieka, zanim pojawił się grzech, Izrael czy jakakolwiek instytucja kościelna.",
          "1. Pierwszy pełny dzień człowieka: dar, nie obowiązek",
          "Według Rdz 1,26–31 człowiek został stworzony szóstego dnia. Następnie Rdz 2,1–3 opowiada o dniu siódmym: Bóg zakończył dzieło stworzenia, odpoczął, pobłogosławił ten dzień i go uświęcił. Bóg nie odpoczywał z wyczerpania. Tekst pokazuje zwieńczenie skończonego, dobrego dzieła.",
          "To prowadzi do pięknej refleksji: pierwszy pełny dzień przeżywany przez człowieka był dniem odpoczynku Boga. Zanim Adam i Ewa zaczęli wykonywać swoje zadania, otrzymali czas, który wskazywał na Dawcę życia. Możemy mówić o szabacie jako przestrzeni ich pierwszej pełnej wspólnoty ze Stwórcą. Trzeba jednak uczciwie dodać: Księga Rodzaju nie opisuje dosłownie pierwszego szabatu Adama ani nie zapisuje rozmowy, która miałaby się wtedy odbyć. To wniosek teologiczny wyprowadzony z kolejności narracji, nie cytat z tekstu.",
          "I właśnie ta kolejność mnie porusza: najpierw dar istnienia i relacji, dopiero potem praca. Człowiek nie musiał zasłużyć na Bożą obecność. Został stworzony, by żyć przed Jego obliczem.",
          "2. Szabat przypomina, do kogo należy nasze życie",
          "Wj 20,8–11 nie ustanawia nowego, przypadkowego rytuału. Przykazanie odsyła do stworzenia: sześć dni pracy i siódmy dzień odpoczynku są zakorzenione w Bożym działaniu. Pwt 5,12–15 dodatkowo łączy odpoczynek z pamięcią o wyzwoleniu z Egiptu. Szabat przypomina więc zarówno o Stwórcy, jak i o Wyzwolicielu.",
          "Wyróżniające jest to, że odpocząć mają także syn, córka, sługa, przybysz i zwierzęta. To nie tylko zasada osobistej pobożności; to również etyka godności, troski i sprawiedliwości. W świecie bezustannej produktywności szabat mówi: nie jesteś wyłącznie tym, co wytwarzasz.",
          "3. Co Jezus zrobił z szabatem?",
          "Jezus regularnie uczestniczył w nabożeństwach w szabat (Łk 4,16), nauczał i uzdrawiał w tym dniu. Spory opisane w Ewangeliach nie dotyczą prostego pytania, czy wolno czynić dobro, lecz sposobu rozumienia odpoczynku i ludzkich tradycji. W Mk 2,27–28 Jezus stwierdza, że szabat został ustanowiony dla człowieka, a Syn Człowieczy jest także Panem szabatu.",
          "Nie odczytuję tych słów jako zachęty do traktowania ludzi surowo. Jezus sprzeciwiał się praktykom, które czyniły z dnia Bożego daru ciężar. W Mt 12,12 wyraźnie dopuszcza czynienie dobra w szabat. Chrystus przywraca dniowi odpoczynku jego sens: życie, miłosierdzie i relację z Bogiem.",
          "4. Skąd zatem wzięła się niedziela?",
          "Nowy Testament mówi, że Jezus zmartwychwstał pierwszego dnia tygodnia (Mk 16,2; J 20,1). Znajdujemy także wzmiankę o spotkaniu uczniów pierwszego dnia tygodnia (Dz 20,7) i o odkładaniu darów tego dnia (1 Kor 16,2). Są to teksty ważne dla historii praktyk chrześcijańskich. Nie zawierają jednak wprost nakazu, że pierwszy dzień tygodnia zastępuje siódmy dzień czwartego przykazania.",
          "Równocześnie trzeba rzetelnie przyznać, że wielu chrześcijan od wczesnych wieków świętowało niedzielę w związku ze zmartwychwstaniem Jezusa. Historia tej praktyki nie sprowadza się do jednego dekretu ani jednego wydarzenia. Rozwijała się stopniowo, w różnych wspólnotach i uwarunkowaniach.",
          "To rozróżnienie jest kluczowe: fakt, że niedziela ma długą historię w chrześcijaństwie, nie jest sam w sobie dowodem biblijnego przeniesienia świętości szabatu; a fakt, że szabat ma podstawę w stworzeniu, nie pozwala pomijać świadectwa historii o niedzielnych spotkaniach.",
          "5. Co ustalił Samuele Bacchiocchi?",
          "Samuele Bacchiocchi, historyk Kościoła i autor książki „From Sabbath to Sunday: A Historical Investigation of the Rise of Sunday Observance in Early Christianity” (1977), badał historyczny rozwój świętowania niedzieli. Praca została wydana przez Pontifical Gregorian University Press. Bacchiocchi argumentował, że zmiana praktyki nie wynikała z jednoznacznego ustanowienia niedzieli przez Jezusa czy apostołów, lecz dokonywała się w toku późniejszych przemian społecznych, teologicznych i kościelnych. Szczególną rolę w jego wyjaśnieniu odgrywają napięcia między chrześcijanami a judaizmem oraz kontekst rzymski.",
          "W „Divine Rest for Human Restlessness: A Theological Study of the Good News of the Sabbath for Today” Bacchiocchi rozwija pozytywne znaczenie odpoczynku: szabat jako dobrą nowinę dla człowieka niespokojnego, przeciążonego i potrzebującego więzi ze Stwórcą. To inspirujące podejście, ponieważ nie ogranicza problemu do tego, co wolno i czego nie wolno robić.",
          "Nie wszyscy historycy zgadzają się jednak z każdym elementem rekonstrukcji Bacchiocchiego. Na przykład Richard Bauckham analizował wczesnochrześcijańską niedzielę w sposób podkreślający złożoność świadectw. Trzeba zatem rozróżnić udokumentowany rozwój niedzielnej praktyki i spory co do konkretnych przyczyn jej powstania. Zamiast traktować książkę jako rozstrzygającą wszystkie kwestie, warto potraktować ją jako zaproszenie do poważnego studiowania źródeł.",
          "6. A co z wolnością sumienia i przyszłością?",
          "Nie chcę, by rozmowa o sobocie i niedzieli przerodziła się w osądzanie osób, które szczerze oddają cześć Bogu w innym dniu. Wiara wymaga prawdy, ale także miłości. Rz 14,5–6 bywa przywoływany w sporze o dni; jego bezpośredni kontekst dotyczy różnic praktyk i wzajemnego niesądzenia, a chrześcijanie różnią się co do tego, czy Paweł miał tam na myśli również szabat Dekalogu. Nie wolno ignorować tego sporu interpretacyjnego.",
          "Historycystyczna interpretacja Dn 7,25 i Ap 13–14 łączy końcowy konflikt z autorytetem Boga, Jego przykazaniami i przymusem religijnym. W tradycji adwentystycznej pojawia się w tym kontekście ostrzeżenie przed przyszłym narzuceniem świętowania niedzieli. Sama Apokalipsa 13 nie wymienia jednak niedzieli ani konkretnej ustawy. Wszelkie obecne przepisy o pracy czy handlu trzeba oceniać według ich rzeczywistej treści; nie wolno bez dowodów nazywać ich spełnieniem tego proroctwa.",
          "Wolność sumienia musi obejmować wszystkich: świętujących sobotę, niedzielę i osoby niewierzące. Oddawanie czci nie staje się prawdziwe przez przymus.",
          "7. Co dalej z tą niedzielą? Moja odpowiedź",
          "Nie chcę odebrać nikomu radości ze spotkania ze zmartwychwstałym Chrystusem. Chcę jednak postawić uczciwe pytanie: czy w naszych zwyczajach pozwalamy Biblii mówić pierwszym głosem?",
          "Dla mnie szabat jest czymś więcej niż dniem w kalendarzu. Jest cotygodniowym przypomnieniem, że świat nie należy do naszej pracy, osiągnięć ani lęków. Należy do Stwórcy. W wizji nowego nieba i nowej ziemi Iz 66,22–23 przedstawia regularne oddawanie czci Bogu, używając również obrazu szabatu. To proroczy obraz, którego szczegóły różne tradycje interpretują odmiennie, ale jego centrum jest jasne: Stwórca jest godzien czci.",
          "Jeśli pierwszy pełny dzień życia człowieka był dniem pobłogosławionym przez Boga, czy nie warto na nowo zapytać, co ten dar oznacza dzisiaj?",
          "Moje zaproszenie jest proste: otwórz Biblię. Przeczytaj spokojnie Rdz 2,1–3, Wj 20,8–11, Mk 2,27–28 i Ap 14,6–12. Nie zaczynaj od ataku na czyjąś tradycję. Zacznij od spotkania ze Stwórcą.",
          "Bo ostatecznie nie pytam tylko: „Co dalej z tą niedzielą?”. Pytam również: „Co zrobię z dniem, który Bóg sam pobłogosławił?”. Niech to pytanie prowadzi nas do Jezusa, do wierności Słowu i do miłości bliźniego. Amen.",
          "ŹRÓDŁA I BIBLIOGRAFIA",
          "Biblia (odniesienia do NKJV / UBG): Rdz 1,26–2,3; Wj 20,8–11; Pwt 5,12–15; Mk 2,27–28; Łk 4,16; Mt 12,12; Mk 16,2; J 20,1; Dz 20,7; 1 Kor 16,2; Rz 14,5–6; Dn 7,25; Ap 13–14; Iz 66,22–23.\n\nSamuele Bacchiocchi, From Sabbath to Sunday: A Historical Investigation of the Rise of Sunday Observance in Early Christianity, Pontifical Gregorian University Press, Rzym, 1977. https://books.google.com/books?id=7_DYAAAAMAAJ\n\nSamuele Bacchiocchi, Divine Rest for Human Restlessness: A Theological Study of the Good News of the Sabbath for Today, Biblical Perspectives, wyd. 1990. https://books.google.com/books?id=lgFSzQEACAAJ\n\nRichard J. Bauckham, „Sabbath and Sunday in the Post-Apostolic Church”, w: D. A. Carson (red.), From Sabbath to Lord's Day, Zondervan, 1982, s. 251–298."
]
      },


      {
        id: 'art-z-biblia-za-pan-brat-dzien-03',
        title: 'Gdzie jesteś? Anatomia upadku i pierwsza Ewangelia Edenu',
        slug: 'gdzie-jestes-anatomia-upadku-i-pierwsza-ewangelia-edenu',
        excerpt: 'W ramach globalnego programu „Z Biblią za Pan Brat” analizujemy przełomowy trzeci rozdział Księgi Rodzaju — mechanizm pokusy, ucieczkę człowieka i Bożą Protewangelię.',
        category: 'wiara',
        categoryLabel: 'Z BIBLIĄ ZA PAN BRAT · ROZWAŻANIE DNIA',
        publishedAt: '2026-10-03T06:00:00Z',
        dateFormatted: '3 października 2026',
        imageUrl: 'https://polskieradio.cc/images/academy/daily/kc_day_03_fall.jpg',
        imageCaption: 'Księga Rodzaju 3: Bóg przychodzi szukać człowieka i ogłasza pierwszą obietnicę Zbawiciela.',
        readTimeMinutes: 5,
        isHero: false,
        isPopular: false,
        tags: ['Z Biblią za Pan Brat', 'Księga Rodzaju', 'Rdz 3', 'Protewangelia', 'Cezary Rogowski'],
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        scriptureReference: {
          verse: 'Księga Rodzaju 3:15',
          text: 'I ustanowię nieprzyjaźń między tobą a kobietą, między twoim potomstwem a jej potomstwem; ono zrani ci głowę, a ty zranisz mu piętę.',
          strongCode: 'H2233'
        },
        content: [
          'Czy zauważasz, jak często w momentach trudności lub własnych potknięć Twój pierwszy odruch nie prowadzi do Boga, lecz do lęku i ukrywania się?',
          'Zatrzymaj się na progu trzeciego dnia naszej wspólnej wędrówki w Księdze Rodzaju i zbadaj z całą surowością stan swojego serca. Wypowiedz przed Ojcem to bezkompromisowe pytanie: Tato, dlaczego mój język i moje myśli tak często ulegają podszeptom zwątpienia w Twoją dobroć, zamiast bezwzględnie ufać Twojemu Słowu?',
          'Wchodząc dzisiaj w trzeci rozdział Księgi Rodzaju, stajemy w obliczu dramatu upadku człowieka, ale i niesamowitego, poruszającego poszukiwania ze strony Stwórcy. Kiedy człowiek zgrzeszył, spletł liście figowe i uciekł w cień drzew, to nie człowiek zawołał Boga – to Bóg przerwał milczenie i zadał najgłębsze pytanie w historii ludzkości: „Gdzie jesteś?”.'
        ]
      },
      {
        id: 'art-historia-halloween-od-samhain-do-popkultury',
        title: 'Od celtyckiego Samhain do amerykańskiego przemysłu strachu: Prawdziwa historia i ewolucja Halloween',
        slug: 'od-celtyckiego-samhain-do-amerykanskiego-przemyslu-strachu-fakty-i-mity',
        excerpt: 'Czy Halloween to starożytny kult celtycki, wigilia chrześcijańska czy współczesny produkt marketingu? Odkrywamy historyczne fakty od brytyjskiego Samhain i All Hallows’ Eve po XX-wieczną transformację w USA w świetle rzetelnych źródeł.',
        category: 'manuskrypty',
        categoryLabel: 'CCN HISTORIA · BADANIA I ŹRÓDŁA',
        publishedAt: '2026-10-14T06:00:00Z',
        dateFormatted: '14 października 2026',
        imageUrl: '/images/news/art-historia-halloween-od-samhain-do-popkultury.jpg',
        imageCaption: 'Ilustracja AI: Gabinet historyka badającego starożytne kroniki i manuskrypty — rzetelne dociekanie prawdy historycznej o dawnych tradycjach.',
        readTimeMinutes: 8,
        isHero: true,
        isPopular: true,
        popularRank: 1,
        tags: ['Historia', 'Halloween', 'Samhain', 'Archeologia', 'Fakty i Mity', 'Cezary Rogowski', 'Christian Culture'],
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        scriptureReference: {
          verse: '1 List do Tesaloniczan 5:21',
          text: 'Wszystkiego doświadczajcie, a co dobre, tego się trzymajcie.',
          strongCode: 'G1381 (dokimazo - badać, weryfikować autentyczność)'
        },
        content: [
          'Wokół Halloween narosło wiele skrajnych teorii: jedni widzą w nim wprost nieprzerwany rytuał satanistyczny odprawiany od tysiącleci, inni twierdzą, że to wyłącznie współczesny, niewinny amerykański karnawał. Aby zająć dojrzałe chrześcijańskie stanowisko, musimy sięgnąć do faktów historycznych i rzetelnych źródeł akademickich (m.in. badań historyków Uniwersytetu Oksfordzkiego i Smithsonian Magazine).',
          '1. Celtyckie Samhain i rytm agrarny. Korzenie niektórych obrzędów sięgają przedchrześcijańskiego święta Samhain obchodzonego na Wyspach Brytyjskich i w Irlandii na przełomie października i listopada. Wyznaczało ono koniec żniw i wejście w ciemną, zimową połowę roku. W archaicznych wierzeniach pasterskich był to czas liminalny — wierzono, że granica między światem zmysłowym a sferą duchów staje się przepuszczalna, co rodziło zwyczaje rozpalania ognisk mających odstraszać błąkające się istoty.',
          '2. Próba chrystianizacji: All Hallows’ Eve. W VIII wieku papież Grzegorz III przeniósł obchody Wszystkich Świętych na 1 listopada, a papież Grzegorz IV w 835 roku rozszerzył je na cały Kościół. Wigilia tego dnia w języku staroangielskim została nazwana „All Hallows’ Eve” (z czego wywodzi się skrócona nazwa Halloween). Kościół starał się zastąpić pogański lęk przed zjawami chrześcijańską nadzieją na wstawiennictwo zbawionych i zmartwychwstanie. Jednak w tradycjach ludowych dawne przesądy wciąż tliły się pod powierzchnią religijnych form.',
          '3. Irlandzka emigracja do Ameryki i narodziny przemysłu grozy. Współczesny kształt święta uformował się w XIX wieku w Stanach Zjednoczonych wraz z masową imigracją Irlandczyków uciekających przed Wielkim Głodem. To w Ameryce tradycyjne irlandzkie rzepy rzeźbione w maski zastąpiono łatwiejszą w obróbce dynią (tzw. Jack-o’-lantern). W latach 30. i 50. XX wieku zwyczaj psot ulicznych („trick or treat”) został przejęty i sformatowany przez producentów słodyczy, kostiumów i hollywoodzkie wytwórnie filmów grozy. W ten sposób z archaicznego obrzędu zrodził się wielomiliardowy, świecki przemysł rozrywki komercyjnej.',
          '4. Wnioski dla współczesnego chrześcijanina. Rzetelna historia uczy nas unikania mitomanii: dynia sama w sobie nie jest demonem, a dzieci pukające do drzwi nie są kapłanami druidycznymi. Lecz równocześnie historia obnaża fakt, że rdzeń tego zjawiska nigdy nie był skupiony na Chrystusie ani na Ewangelii. Pismo wzywa nas: „Wszystkiego doświadczajcie, a co dobre, tego się trzymajcie” (1 Tes 5:21). Skoro współczesna kultura Halloween promuje lęk, brzydotę i fascynację zaświatami bez Boga, chrześcijanin ma pełne prawo i historyczną mądrość, by powiedzieć: to nie jest nasza droga.'
        ]
      },
      {
        id: 'historia-qumran',
        title: 'Zwoje z Qumran: Jak odkrycie nad Morzem Martwym obaliło wiek sceptycyzmu wobec Biblii',
        slug: 'zwoje-z-qumran-dead-sea-scrolls-rzetelnosc-tekstu',
        excerpt: 'Odnalezione w 1947 roku hebrajskie manuskrypty sprzed ponad dwóch tysięcy lat wykazały zdumiewającą, litera w literę, tożsamość z tekstem masoreckim.',
        content: [
          'Przez cały XIX i początek XX wieku racjonalistyczna krytyka biblijna głosiła, że tekst Starego Testamentu był wielokrotnie zmieniany, zniekształcany i przepisywany przez stulecia, przez co dzisiejsza Biblia rzekomo nie przypomina oryginałów.',
          'W 1947 roku beduiński pasterz w jaskiniach Qumran nad Morzem Martwym dokonał największego archeologicznego odkrycia wszech czasów. Odnaleziono setki zwojów hebrajskich datowanych od III wieku przed Chr. do I wieku po Chr., w tym kompletny, siedmiometrowy Zwój Izajasza (1QIsa^a).',
          'Gdy uczeni porównali tekst z Qumran z Kodeksem z Aleppo i Kodeksem Leningradzkim (przepisanymi 1000 lat później!), okazało się, że tekst zachował ponad 95% absolutnej, dosłownej zgodności. Pozostałe 5% stanowiły drobne warianty ortograficzne (np. pełniejszy zapis samogłosek), które nie zmieniały ani jednego dogmatu czy proroctwa. Słowo Boże trwa na wieki!'
        ],
        scriptureReference: {
          verse: 'Księga Izajasza 40:8',
          text: 'Trawa usycha, kwiat więdnie, ale słowo naszego Boga trwa na wieki.',
          strongCode: 'H1697 (dabar - słowo, obietnica Boga) / H5769 (olam - wieczność)'
        },
        category: 'manuskrypty',
        categoryLabel: 'Manuskrypty & Zwoje',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-10-02T11:00:00Z',
        dateFormatted: '2 października 2026',
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'Starożytny zwój hebrajski – świadectwo tysiącletniej wierności kopistów.',
        readTimeMinutes: 7,
        isHero: true,
        isPopular: true,
        popularRank: 1,
        tags: ['Qumran', 'Manuskrypty', 'Izajasz', 'Archeologia', 'Rzetelność']
      },
      {
        id: 'historia-stela-tel-dan',
        title: 'Stela z Tel Dan i Inskrypcja Meszy: Ostateczny dowód na historyczność króla Dawida',
        slug: 'stela-z-tel-dan-dom-dawida-dowod-historyczny',
        excerpt: 'Przełomowe wykopaliska prof. Abrahama Birana w 1993 roku położyły kres teorii o „mitycznym Dawidzie”, ukazując aramejski napis BYTDWD („Dom Dawida”).',
        content: [
          'Do lat 90. XX wieku w kręgach tzw. minimalizmu biblijnego powszechna była teza, że postać króla Dawida jest czystą legendą z epoki perskiej, analogiczną do opowieści o królu Arturze w Anglii.',
          'Wszystko zmieniło się latem 1993 roku w Tel Dan w północnym Izraelu. Zespół prof. Abrahama Birana odkrył bazaltową stelę zwycięstwa wzniesioną przez aramejskiego króla Chazaela w IX w. p.n.e. W tekście wyrytym pismem paleohebrajskim widniały słowa: „zabiłem króla Izraela i króla z Domu Dawida” (hebr. BYTDWD).',
          'Niezależne aramejskie źródło pozabiblijne zaledwie wiek po śmierci Salomona poświadczyło istnienie dynastii Dawidowej. W połączeniu ze Stelą Meszy (Kamień Moabicki z 840 r. p.n.e.) i reliefami w Karnaku, historyczność królestwa Dawida stała się faktem naukowym.'
        ],
        scriptureReference: {
          verse: '2 Księga Samuela 7:16',
          text: 'Twój dom i twoje królestwo będą trwały wiecznie przed tobą; twój tron będzie utwierdzony na wieki.',
          strongCode: 'H1732 (Dawid) / H1004 (bayit - dom, dynastia)'
        },
        category: 'archeologia',
        categoryLabel: 'Archeologia Biblijna',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-10-01T13:45:00Z',
        dateFormatted: '1 października 2026',
        imageUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 6,
        isHero: true,
        isPopular: true,
        popularRank: 2,
        tags: ['Tel Dan', 'Dawid', 'Archeologia', 'Inskrypcje']
      },
      {
        id: 'historia-pieczec-ezechiasza',
        title: 'Pieczęcie króla Ezechiasza i proroka Izajasza: Gliniane bulle z Jerozolimy',
        slug: 'pieczecie-ezechiasza-i-izajasza-wykopaliska-jerozolima',
        excerpt: 'Podczas prac wykopaliskowych w Ofel dr Eilat Mazar odnalazła osobiste pieczęcie króla Judy oraz proroka Izajasza w odległości zaledwie 3 metrów od siebie.',
        content: [
          'Gliniane bulle (odciski pieczęci sygnetowych służące do pieczętowania papirusów) to najcenniejsze miniaturowe świadectwa starożytnej administracji. W 2015 roku dr Eilat Mazar ogłosiła odnalezienie w Jerozolimie bulli z napisem: „Należący do Ezechiasza, syna Achaza, króla Judy”.',
          'Zaledwie kilka metrów dalej odnaleziono kolejny odcisk pieczęci z czytelnym napisem: „Yeshayahu nvy[?]” – Izajasz prorok! Artefakt pochodzi z dokładnie tej samej warstwy spalenizny z VIII w. p.n.e.',
          'Biblia w 2 Księdze Królewskiej (rozdziały 19-20) opisuje bliską relację króla Ezechiasza i proroka Izajasza w obliczu oblężenia asyryjskiego Sennacheryba. Dziś archeologia kładzie przed naszymi oczami fizyczne pieczęcie obu tych mężów Bożych.'
        ],
        scriptureReference: {
          verse: '2 Księga Królewska 19:2',
          text: 'I posłał... do Izajasza, proroka, syna Amosa.',
          strongCode: 'H2396 (Chizqiyahu) / H3470 (Yeshayahu)'
        },
        category: 'krolowie',
        categoryLabel: 'Królowie & Prorocy',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-09-29T16:00:00Z',
        dateFormatted: '29 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 5,
        tags: ['Ezechiasz', 'Izajasz', 'Jerozolima', 'Bulla']
      },
      {
        id: 'historia-tunel-siloe',
        title: 'Tunel Ezechiasza i Sadzawka Siloe: Inżynieria VIII wieku p.n.e. w litej skale',
        slug: 'tunel-ezechiasza-sadzawka-siloe-inzynieria-biblijna',
        excerpt: '533-metrowy tunel wodny wykuty przez dwie grupy górników idących naprzeciw siebie i odnalezienie monumentalnych schodów Sadzawki Siloe.',
        content: [
          'Gdy asyryjskie imperium Sennacheryba zbliżało się do Jerozolimy, król Ezechiasz podjął strategiczną decyzję ukrycia źródła Gichon przed wrogiem i doprowadzenia wody do wnętrza murów obronnych (2 Krn 32:30).',
          'Górnicy w VIII w. p.n.e. wkuli się w lity wapień z dwóch stron i spotkali się pośrodku krętego, 533-metrowego korytarza. Na ścianie tunelu pozostawili słynną Inskrypcję Siloam opisującą moment spotkania, gdy „kilof uderzył o kilof”.',
          'W 2004 roku podczas naprawy rurociągu w dolinie Tyropoeon odkopano monumentalne kamienne stopnie samej Sadzawki Siloe – miejsca, do którego Pan Jezus posłał niewidomego od urodzenia, aby ten obmył się i odzyskał wzrok (J 9:7).'
        ],
        scriptureReference: {
          verse: '2 Księga Kronik 32:30',
          text: 'Ten sam Ezechiasz zatkał górny wypływ wód Gichonu i skierował je prosto na zachód do Miasta Dawida.',
          strongCode: 'H1521 (Gichon) / H7975 (Siloach)'
        },
        category: 'archeologia',
        categoryLabel: 'Archeologia Biblijna',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-09-27T10:15:00Z',
        dateFormatted: '27 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 5,
        tags: ['Siloe', 'Gichon', 'Tunel Ezechiasza', 'Jerozolima']
      },
      {
        id: 'historia-cylinder-cyrusa',
        title: 'Cylinder Cyrusa a powrót z Babilonu: Potwierdzenie dekretu z Księgi Ezdrasza',
        slug: 'cylinder-cyrusa-potwierdzenie-dekrety-ezdrasza',
        excerpt: 'Znajdujący się w British Museum gliniany walec z 539 r. p.n.e. potwierdza politykę perską opisaną na kartach Ksiąg Kronik i Ezdrasza.',
        content: [
          'Księga Ezdrasza rozpoczyna się od sensacyjnego dekretu króla perskiego Cyrusa Wielkiego, który po zdobyciu Babilonu nakazał pozwolić wygnanym Żydom powrócić do Judy i odbudować świątynię w Jerozolimie (Ezd 1:1-4). Przez lata sceptycy twierdzili, że żaden pogański monarcha nie wydałby takiego edyktu.',
          'W 1879 roku w Babilonie archeolodzy odkopali gliniany walec zapisany pismem klinowym – tzw. Cylinder Cyrusa. W tekście Cyrus oświadcza, że z szacunku dla bóstw pozwolił deportowanym ludom powrócić do ich ojczyzn i odbudować zniszczone sanktuaria.',
          'Proroctwo Izajasza z rozdziału 44 i 45, wymieniające Cyrusa z imienia na ponad 150 lat przed jego narodzinami, wypełniło się z historyczną precyzją poświadczoną przez czołowy artefakt British Museum.'
        ],
        scriptureReference: {
          verse: 'Księga Ezdrasza 1:2',
          text: 'Tak mówi Cyrus, król perski: PAN, Bóg niebios, dał mi wszystkie królestwa ziemi i On mi nakazał, abym Mu zbudował dom w Jerozolimie.',
          strongCode: 'H3566 (Koresh - Cyrus)'
        },
        category: 'krolowie',
        categoryLabel: 'Królowie & Prorocy',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-09-24T12:00:00Z',
        dateFormatted: '24 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 5,
        tags: ['Cyrus', 'Babilon', 'Ezdrasz', 'Proroctwo']
      },
      {
        id: 'historia-rekopisy-nt',
        title: '5800 greckich rękopisów Nowego Testamentu: Żadne dzieło starożytności nie ma takiego oparcia',
        slug: '5800-rekopisow-nowego-testamentu-wiarygodnosc',
        excerpt: 'Dla porównania: „Wojna galijska” Cezara przetrwała w kilkunastu kopiach, a Nowy Testament w tysiącach manuskryptów z luką zaledwie kilkudziesięciu lat od oryginału.',
        content: [
          'Gdy historycy badają wiarygodność dokumentów starożytnych, kluczowe są dwa kryteria: liczba zachowanych manuskryptów oraz odstęp czasu między powstaniem oryginału a najstarszą zachowaną kopią.',
          'Dla pism Platona mamy ok. 210 kopii (najstarsza 1200 lat po autorze), dla Tukidydesa ok. 90 kopii (luka 1300 lat), dla Cezara kilkanaście kopii (luka 900 lat). W przypadku Nowego Testamentu posiadamy ponad 5800 rękopisów greckich, ponad 10 000 łacińskich i 9300 w innych językach starożytnych!',
          'Najstarszy zachowany fragment (Papirus P52 z Ewangelii Jana) dzieli od daty spisania zaledwie 30-40 lat. Żaden rzetelny historyk nie może odrzucić tekstu Ewangelii bez jednoczesnego odrzucenia całej wiedzy o starożytnej Grecji i Rzymie.'
        ],
        scriptureReference: {
          verse: 'Ewangelia wg św. Łukasza 1:3',
          text: 'Uznałem za słuszne i ja, zbadawszy wszystko dokładnie od początku, opisać ci to po kolei, dostojny Teofilu.',
          strongCode: 'G199 (akribos - dokładnie, rzetelnie) / G2517 (kathexes - po kolei, chronologicznie)'
        },
        category: 'manuskrypty',
        categoryLabel: 'Manuskrypty & Zwoje',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-09-22T08:30:00Z',
        dateFormatted: '22 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 6,
        tags: ['Nowy Testament', 'Manuskrypty', 'Papirus P52', 'Ewangelia']
      }
    ],
    lexicon: [
      {
        id: 'qumran',
        term: 'Qumran (Zwoje znad Morza Martwego)',
        originalScript: 'קֻמְרָאן',
        transliteration: 'Qumran',
        strongCode: 'H4072',
        definition: 'Stanowisko archeologiczne na Pustyni Judzkiej, gdzie w latach 1947-1956 odnaleziono ponad 900 starożytnych zwojów poświadczających nienaruszalność tekstu Biblii.',
        biblicalContext: 'Zawierały kopie wszystkich ksiąg Starego Testamentu (poza Księgą Estery), potwierdzając wierność przekazu masoreckiego przez ponad 1000 lat.',
        keyVerses: [
          { ref: 'Iz 40:8', text: 'Trawa usycha, kwiat więdnie, ale słowo naszego Boga trwa na wieki.' }
        ],
        tags: ['Qumran', 'Manuskrypty', 'Stary Testament'],
        category: 'oryginal'
      },
      {
        id: 'stela-tel-dan',
        term: 'Stela z Tel Dan',
        originalScript: 'בֵּית דָּוִד',
        transliteration: 'Bayt Dawid',
        strongCode: 'H1004 / H1732',
        definition: 'Bazaltowa płyta z inskrypcją w języku aramejskim z IX w. p.n.e., zawierająca najstarszą pozabiblijną wzmiankę o „Domu Dawida” (dynastii królewskiej w Jerozolimie).',
        biblicalContext: 'Obaliła teorie sceptyków negujące historyczność króla Dawida i potwierdziła biblijną narrację z Ksiąg Królewskich.',
        keyVerses: [
          { ref: '2 Sm 7:16', text: 'Twój dom i twoje królestwo będą trwały wiecznie przed tobą.' }
        ],
        tags: ['Dawid', 'Inskrypcje', 'Archeologia'],
        category: 'oryginal'
      },
      {
        id: 'bulla',
        term: 'Bulla (Pieczęć Gliniana)',
        originalScript: 'חוֹתָם',
        transliteration: 'chotam',
        strongCode: 'H2368',
        definition: 'Kawałek wypalonej gliny z odciskiem sygnetu władcy, kapłana lub urzędnika, używany w starożytnym Izraelu do zabezpieczania dokumentów papirusowych.',
        biblicalContext: 'Wykopaliska w Jerozolimie ujawniły dziesiątki bulli z imionami postaci biblijnych: króla Ezechiasza, proroka Izajasza, Barucha syna Neriasza i Gemariasza.',
        keyVerses: [
          { ref: 'Jer 32:10', text: 'Spisałem kontrakt kupna, zapieczętowałem go i powołałem świadków.' }
        ],
        tags: ['Pieczęć', 'Administracja', 'Jerozolima'],
        category: 'oryginal'
      },
      {
        id: 'cylinder-cyrusa',
        term: 'Cylinder Cyrusa',
        originalScript: 'כּוֹרֶשׁ',
        transliteration: 'Koresh',
        strongCode: 'H3566',
        definition: 'Gliniany walec perskiego monarchy Cyrusa Wielkiego z 539 r. p.n.e., poświadczający dekret repatriacji wygnańców i odbudowy ich świątyń.',
        biblicalContext: 'Bezpośrednie potwierdzenie relacji z Księgi Ezdrasza (rozdział 1) oraz proroctwa Izajasza (Iz 45:1).',
        keyVerses: [
          { ref: 'Ezd 1:2', text: 'Tak mówi Cyrus, król perski: PAN, Bóg niebios, dał mi wszystkie królestwa ziemi.' }
        ],
        tags: ['Persja', 'Cyrus', 'Powrót z wygnania'],
        category: 'oryginal'
      },
      {
        id: 'papirus-p52',
        term: 'Papirus P52 (Rylands Library Papyrus P52)',
        originalScript: 'Ἰωάννης',
        transliteration: 'Ioannes',
        strongCode: 'G2491',
        definition: 'Najstarszy zachowany fragment rękopisu Nowego Testamentu (ok. 125 r. n.e.), zawierający wersety z 18. rozdziału Ewangelii Jana (przesłuchanie Jezusa przed Piłatem).',
        biblicalContext: 'Dowodzi, że czwarta Ewangelia powstała jeszcze w I wieku i błyskawicznie dotarła do Górnego Egiptu.',
        keyVerses: [
          { ref: 'J 18:37', text: 'Ja po to się narodziłem i po to przyszedłem na świat, aby dać świadectwo prawdzie.' }
        ],
        tags: ['Papirus', 'Nowy Testament', 'Ewangelia Jana'],
        category: 'oryginal'
      },
      {
        id: 'minimalizm-biblijny',
        term: 'Minimalizm Biblijny (Krytyka Sceptyczna)',
        originalScript: 'אֱמֶת',
        transliteration: 'emet',
        strongCode: 'H571',
        definition: 'Kierunek w XX-wiecznej historiografii odrzucający autentyczność biblijnych relacji sprzed niewoli babilońskiej, doszczętnie sfalsyfikowany przez odkrycia archeologii polowej.',
        biblicalContext: 'Każda łopata archeologa w Ziemi Świętej potwierdza, że Pismo Święte jest zakorzenione w obiektywnej prawdzie historycznej.',
        keyVerses: [
          { ref: 'J 17:17', text: 'Poświęć ich w twojej prawdzie; twoje słowo jest prawdą.' }
        ],
        tags: ['Historiografia', 'Apologetyka', 'Prawda'],
        category: 'teologia'
      }
    ]
  },

  // 3. BIOLOGIA
  {
    id: 'biologia',
    title: 'CCN Biologia – Biologia a Biblia, Kod DNA i Cud Życia | Christian Culture',
    shortTitle: 'CCN Biologia & Życie',
    brandSubtitle: 'Biologia w świetle Pisma • Kod DNA jako język Stwórcy • Nieredukowalna złożoność • Cud Życia',
    canonical: 'https://polskieradio.cc/biologia',
    description: 'Biologia w świetle Pisma Świętego. Kod genetyczny DNA jako cyfrowa informacja, nieredukowalna złożoność silników molekularnych, syntaza ATP, cud poczęcia i granice zmienności gatunków.',
    badge: 'KOD DNA',
    accentColor: '#059669',
    categories: [
      { id: 'home', label: 'Wszystkie' },
      { id: 'dna', label: 'Kod DNA & Informacja' },
      { id: 'maszyny', label: 'Maszyny Molekularne' },
      { id: 'embriologia', label: 'Cud Poczęcia (Embriologia)' },
      { id: 'leksykon', label: 'Leksykon Biologiczny' },
      { id: 'about', label: 'O dziale' }
    ],
    tickerItems: [
      'Genetyka: Sekwencjonowanie DNA ujawnia 3 miliardy par zasad – cyfrowy kod o gęstości zapisu wymagający Inteligencji Stwórcy',
      'Biochemia: Wić bakteryjna i syntaza ATP to miniaturowe silniki molekularne o nieredukowalnej złożoności wykluczającej przypadek',
      'Embriologia: Badania genomiki prenatalnej potwierdzają prawdę Psalmu 139 – człowiek jest unikalną osobą od momentu poczęcia',
      'Paleontologia: Eksplozja Kambrska ukazuje nagłe pojawienie się wszystkich typów zwierząt bez form przejściowych („według swego rodzaju”)'
    ],
    articles: [

      {
        id: 'art-z-biblia-za-pan-brat-dzien-03',
        title: 'Gdzie jesteś? Anatomia upadku i pierwsza Ewangelia Edenu',
        slug: 'gdzie-jestes-anatomia-upadku-i-pierwsza-ewangelia-edenu',
        excerpt: 'W ramach globalnego programu „Z Biblią za Pan Brat” analizujemy przełomowy trzeci rozdział Księgi Rodzaju — mechanizm pokusy, ucieczkę człowieka i Bożą Protewangelię.',
        category: 'wiara',
        categoryLabel: 'Z BIBLIĄ ZA PAN BRAT · ROZWAŻANIE DNIA',
        publishedAt: '2026-10-03T06:00:00Z',
        dateFormatted: '3 października 2026',
        imageUrl: 'https://polskieradio.cc/images/academy/daily/kc_day_03_fall.jpg',
        imageCaption: 'Księga Rodzaju 3: Bóg przychodzi szukać człowieka i ogłasza pierwszą obietnicę Zbawiciela.',
        readTimeMinutes: 5,
        isHero: false,
        isPopular: false,
        tags: ['Z Biblią za Pan Brat', 'Księga Rodzaju', 'Rdz 3', 'Protewangelia', 'Cezary Rogowski'],
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        scriptureReference: {
          verse: 'Księga Rodzaju 3:15',
          text: 'I ustanowię nieprzyjaźń między tobą a kobietą, między twoim potomstwem a jej potomstwem; ono zrani ci głowę, a ty zranisz mu piętę.',
          strongCode: 'H2233'
        },
        content: [
          'Czy zauważasz, jak często w momentach trudności lub własnych potknięć Twój pierwszy odruch nie prowadzi do Boga, lecz do lęku i ukrywania się?',
          'Zatrzymaj się na progu trzeciego dnia naszej wspólnej wędrówki w Księdze Rodzaju i zbadaj z całą surowością stan swojego serca. Wypowiedz przed Ojcem to bezkompromisowe pytanie: Tato, dlaczego mój język i moje myśli tak często ulegają podszeptom zwątpienia w Twoją dobroć, zamiast bezwzględnie ufać Twojemu Słowu?',
          'Wchodząc dzisiaj w trzeci rozdział Księgi Rodzaju, stajemy w obliczu dramatu upadku człowieka, ale i niesamowitego, poruszającego poszukiwania ze strony Stwórcy. Kiedy człowiek zgrzeszył, spletł liście figowe i uciekł w cień drzew, to nie człowiek zawołał Boga – to Bóg przerwał milczenie i zadał najgłębsze pytanie w historii ludzkości: „Gdzie jesteś?”.'
        ]
      },
      {
        id: 'biologia-kod-dna',
        title: 'Cyfrowy język życia: Dlaczego informacja w DNA wymaga Boskiego Autora',
        slug: 'cyfrowy-jezyk-zycia-kod-dna-informacja-shannona',
        excerpt: '3 miliardy par zasad w ludzkim genomie. Jak informatyka, teoria informacji Shannona i mikrobiologia obaliły mit przypadkowego powstania komórki.',
        content: [
          'DNA nie jest jedynie złożoną substancją chemiczną – jest cyfrowym kodem oprogramowania biologicznego. Cztery zasady azotowe (Adenina, Tymina, Cytozyna, Guanina) działają dokładnie tak, jak bity w kodzie komputerowym, tworząc precyzyjne instrukcje syntezy białek.',
          'Jak zauważył twórca Microsoftu Bill Gates: „DNA jest jak program komputerowy, ale o wiele, wiele bardziej zaawansowany niż jakikolwiek software, jaki kiedykolwiek stworzył człowiek”. Teoria informacji Claude\'a Shannona jednoznacznie dowodzi, że informacja semantyczna zawsze i bez wyjątku pochodzi z inteligentnego źródła.',
          'Prawa chemii i fizyki potrafią wyjaśnić, jak atomy łączą się w cząsteczki, ale nie potrafią wyjaśnić sekwencji liter niosącej instrukcję budowy oka, mózgu czy serca. Apostoł Jan napisał: „Na początku było Słowo [Logos]... Wszystko przez Nie się stało” (J 1:1-3). Życie zaczęło się od Informacji, a tą Informacją jest Boży Logos.'
        ],
        scriptureReference: {
          verse: 'Ewangelia wg św. Jana 1:1-3',
          text: 'Na początku było Słowo, a Słowo było u Boga i Bogiem było Słowo... Wszystko przez Nie się stało.',
          strongCode: 'G3056 (Logos - Słowo, Zamysł, Boski Rozum) / G1096 (ginomai - stać się)'
        },
        category: 'dna',
        categoryLabel: 'Kod DNA & Informacja',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-10-02T11:30:00Z',
        dateFormatted: '2 października 2026',
        imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'Podwójna helisa DNA – 3 miliardy par zasad w każdej komórce człowieka.',
        readTimeMinutes: 7,
        isHero: true,
        isPopular: true,
        popularRank: 1,
        tags: ['DNA', 'Genetyka', 'Logos', 'Biochemia', 'Informacja']
      },
      {
        id: 'biologia-nieredukowalna-zlozonosc',
        title: 'Nieredukowalna złożoność maszyn molekularnych: Wić bakteryjna i syntaza ATP',
        slug: 'nieredukowalna-zlozonosc-maszyny-molekularne-behe',
        excerpt: 'Układy wieloelementowe, w których usunięcie choćby jednej części niszczy całą funkcję. Dlaczego darwinowski gradualizm jest niemożliwy na poziomie komórkowym.',
        content: [
          'Biochemik Michael Behe w przełomowej pracy wprowadził pojęcie „nieredukowalnej złożoności”. Klasycznym przykładem jest wić bakteryjna – miniaturowy silnik obrotowy wirujący z prędkością do 100 000 obrotów na minutę, chłodzony wodą i zasilany przepływem protonów.',
          'Silnik ten składa się z rotora, statora, wału napędowego, tulei, przegubu Cardana i śruby napędowej. Każdy z tych elementów musi być obecny jednocześnie i w odpowiednich proporcjach. Stopniowa ewolucja krok po kroku nie mogła go wytworzyć, ponieważ układ złożony z 50% części nie działałby w 50%, lecz wcale.',
          'Jeszcze bardziej oszałamiająca jest syntaza ATP – miniaturowa turbina generująca cząsteczki energii dla całego organizmu. Człowiek produkuje codziennie ilość ATP równą masie własnego ciała! Apostoł Paweł pisał o tym wprost: „Jego niewidzialne przymioty... stają się widzialne dzięki Jego dziełom” (Rz 1:20).'
        ],
        scriptureReference: {
          verse: 'List do Rzymian 1:20',
          text: 'To bowiem, co o Nim można poznać, jest dla nich jawne... staje się widzialne dzięki Jego dziełom.',
          strongCode: 'G4161 (poiema - dzieło, kunsztowna konstrukcja) / G3539 (noeo - pojmować rozumem)'
        },
        category: 'maszyny',
        categoryLabel: 'Maszyny Molekularne',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-10-01T14:15:00Z',
        dateFormatted: '1 października 2026',
        imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 6,
        isHero: true,
        isPopular: true,
        popularRank: 2,
        tags: ['Maszyny Molekularne', 'Wić Bakteryjna', 'Syntaza ATP', 'Behe']
      },
      {
        id: 'biologia-psalm-139-embriologia',
        title: 'Cud w łonie matki: Psalm 139 a współczesna embriologia i genetyka prenatalna',
        slug: 'cud-w-lonie-matki-psalm-139-embriologia',
        excerpt: 'Od momentu połączenia komórek jajowej i plemnika powstaje kompletna, unikalna istota ludzka z własnym DNA. Bicie serca w 21. dniu.',
        content: [
          'Król Dawid trzy tysiące lat temu pisał pod natchnieniem: „Ty bowiem ukształtowałeś moje nerki, utkałeś mnie w łonie mojej matki. Wysławiam Cię, bo jestem cudownie ukształtowany... Oczy Twoje widziały mój niedoskonały kształt, a w Twojej księdze były zapisane wszystkie moje członki” (Ps 139:13-16).',
          'Współczesna genetyka potwierdza ten fakt w 100%: w momencie zapłodnienia powstaje zygotyczna tożsamość genetyczna człowieka, która nigdy wcześniej nie istniała i nigdy się nie powtórzy. Zdefiniowana jest płeć, kolor oczu, wzrost, a nawet predyspozycje talentów.',
          'W 21. dniu życia zaczyna bić serce, w 6. tygodniu rejestrowane są fale mózgowe, a w 8. tygodniu dziecko reaguje na dotyk. Biologia nie pozostawia wątpliwości: aborcja jest przerwaniem życia żywego człowieka, a nie „zabiegiem na ciele kobiety”.'
        ],
        scriptureReference: {
          verse: 'Księga Psalmów 139:13-14',
          text: 'Ty bowiem ukształtowałeś moje nerki, utkałeś mnie w łonie mojej matki. Wysławiam Cię, bo jestem cudownie ukształtowany.',
          strongCode: 'H7069 (qanah - posiąść, ukształtować) / H5526 (sakak - utkać, spleść misternie)'
        },
        category: 'embriologia',
        categoryLabel: 'Cud Poczęcia (Embriologia)',
        author: {
          id: 'wioletta-rogowska',
          name: 'Wioletta Rogowska',
          role: 'Współzałożycielka Christian Culture',
          avatarUrl: '/avatar_wioletta_official.jpg'
        },
        publishedAt: '2026-09-29T09:30:00Z',
        dateFormatted: '29 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 5,
        tags: ['Embriologia', 'Życie', 'Psalm 139', 'Poczęcie']
      },
      {
        id: 'biologia-eksplozja-kambrska',
        title: 'Eksplozja Kambrska i zapis kopalny: Dlaczego brak form przejściowych potwierdza Biblię',
        slug: 'eksplozja-kambrska-brak-form-przejsciowych',
        excerpt: 'Nagłe pojawienie się w skałach kambru niemal wszystkich głównych typów budowy zwierząt bez jakichkolwiek przodków. Biblijne „według swego rodzaju”.',
        content: [
          'Karol Darwin w dziele „O powstawaniu gatunków” przyznał, że brak form przejściowych w zapisie kopalnym stanowi najpoważniejszy zarzut wobec jego teorii. Wyraził nadzieję, że przyszłe odkrycia paleontologiczne zapełnią te luki.',
          'Minęło ponad 160 lat intensywnych wykopalisk na całym globie, a tzw. Eksplozja Kambrska stała się jeszcze większym problemem dla ewolucjonizmu. Na samym dnie warstw kopalnych nagle pojawiają się w pełni ukształtowane złożone organizmy (np. trylobity o złożonych oczach dwusoczewkowych) bez żadnych form prekursorowych.',
          'Zamiast darwinowskiego „drzewa życia” zapis kopalny ukazuje „sad stworzenia” (polyphyletic orchard) – nagłe pojawienie się odrębnych typów stworzeń, dokładnie tak, jak opisuje Księga Rodzaju: „według ich rodzajów” (Rdz 1:24).'
        ],
        scriptureReference: {
          verse: 'Księga Rodzaju 1:24',
          text: 'I powiedział Bóg: Niech ziemia wyda istoty żywe według ich rodzajów: bydło, zwierzęta pełzające i dzikie zwierzęta ziemi.',
          strongCode: 'H4327 (min - rodzaj, odrębna kategoria stworzenia)'
        },
        category: 'dna',
        categoryLabel: 'Kod DNA & Informacja',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-09-26T14:00:00Z',
        dateFormatted: '26 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 5,
        tags: ['Kambr', 'Skamieniałości', 'Kreacjonizm', 'Darwin']
      },
      {
        id: 'biologia-epigenetyka',
        title: 'Epigenetyka: Drugi poziom kodu, który przekreśla prymitywny determinizm',
        slug: 'epigenetyka-drugi-poziom-kodu-komorkowego',
        excerpt: 'Metylacja DNA i modyfikacje histonów działają jak dynamiczny przełącznik oprogramowania komórkowego, ukazując niewyobrażalny kunszt Boga.',
        content: [
          'Jeszcze niedawno materialistyczna biologia twierdziła, że organizm jest jedynie mechanicznym skutkiem sztywnego zapisu DNA podlegającego ślepym mutacjom. Odkrycie epigenetyki zrewolucjonizowało naukę o życiu.',
          'Okazało się, że nad sekwencją DNA istnieje nadrzędna warstwa znaczników molekularnych (metylacja, acetylacja histonów, niekodujące RNA), które w ułamku sekundy włączają lub wyciszają geny w odpowiedzi na potrzeby środowiska bez żadnej zmiany samego kodu genetycznego.',
          'To dowód na istnienie wielowarstwowej architektury systemowej. Tylko Nadrzędny Programista mógł zaprojektować kod, który posiada wbudowane mechanizmy adaptacyjne bez utraty stabilności tożsamości gatunkowej.'
        ],
        scriptureReference: {
          verse: 'List do Hebrajczyków 1:3',
          text: 'Ten, będąc blaskiem Jego chwały i odbiciem Jego istoty, podtrzymuje wszystko słowem swojej mocy.',
          strongCode: 'G5342 (phero - podtrzymywać w ruchu, zarządzać)'
        },
        category: 'dna',
        categoryLabel: 'Kod DNA & Informacja',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-09-23T11:45:00Z',
        dateFormatted: '23 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 5,
        tags: ['Epigenetyka', 'Genetyka', 'Komórka', 'Stwórca']
      },
      {
        id: 'biologia-granice-mikroewolucji',
        title: 'Granice mikroewolucji: Dlaczego zmienność w rasach nigdy nie stworzy nowego narządu',
        slug: 'granice-mikroewolucji-zmiennosc-w-obrebie-gatunku',
        excerpt: 'Doświadczenia Lenski\'ego na bakteriach E. coli (ponad 70 000 pokoleń) wykazały degradację genów, a nie powstawanie nowych układów biologicznych.',
        content: [
          'Podręczniki biologii często mylą mikroewolucję (zmienność adaptacyjną w obrębie genotypu, np. rasy psów, dzioby zięb z Galapagos) z makroewolucją (powstaniem zupełnie nowych struktur biologicznych, np. oka czy piór).',
          'Tymczasem najdłuższy eksperyment ewolucyjny w historii prowadzony przez prof. Richarda Lenski\'ego na 70 000 pokoleniach bakterii E. coli (odpowiednik 2 milionów lat ludzkich!) wykazał, że bakterie pozostały bakteriami. Adaptacje nastąpiły w wyniku uszkodzenia lub wyłączenia istniejących szlaków metabolicznych (tzw. dewolucja).',
          'Mutacje genetyczne niemal bez wyjątku niszczą lub zubożają informację w kodzie. Słowo Boże uczy prawdy potwierdzonej laboratoryjnie: każde stworzenie rozmnaża się ściśle „według swego rodzaju” (Rdz 1:21).'
        ],
        scriptureReference: {
          verse: '1 List do Koryntian 15:39',
          text: 'Nie każde ciało jest takie samo, ale inne jest ciało ludzi, inne zwierząt, inne ryb, a inne ptaków.',
          strongCode: 'G4561 (sarx - ciało, natura biologiczna)'
        },
        category: 'dna',
        categoryLabel: 'Kod DNA & Informacja',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-09-20T10:00:00Z',
        dateFormatted: '20 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 5,
        tags: ['Mikroewolucja', 'Genetyka', 'Gatunki', 'Lenski']
      }
    ],
    lexicon: [
      {
        id: 'dna-kod',
        term: 'Kod DNA (Kwas Deoksyrybonukleinowy)',
        originalScript: 'חַיִּים',
        transliteration: 'chayim',
        strongCode: 'H2416',
        definition: 'Wielocząsteczkowy nośnik informacji genetycznej zapisany za pomocą czteroliterowego alfabetu (A, T, C, G), sterujący całą biosyntezą w komórce.',
        biblicalContext: 'Cyfrowy dowód na to, że życie pochodzi od Osobowego Logosu – Boga, który przemówił i stało się (Psalm 33:9).',
        keyVerses: [
          { ref: 'J 1:3', text: 'Wszystko przez Nie się stało, a bez Niego nic się nie stało, co się stało.' }
        ],
        tags: ['DNA', 'Genetyka', 'Logos'],
        category: 'teologia'
      },
      {
        id: 'irreducible-complexity',
        term: 'Nieredukowalna Złożoność (Irreducible Complexity)',
        originalScript: 'מַעֲשֶׂה',
        transliteration: 'ma\'aseh',
        strongCode: 'H4639',
        definition: 'Właściwość układu złożonego z wielu dopasowanych części, w którym usunięcie dowolnej z nich powoduje natychmiastowe załamanie funkcji całości.',
        biblicalContext: 'Wyklucza możliwość stopniowej ewolucji przez selekcję naturalną i potwierdza natychmiastowe stworzenie kompletnych maszyn życiowych przez Boga.',
        keyVerses: [
          { ref: 'Rz 1:20', text: 'Niewidzialne Jego przymioty... stają się widzialne dzięki Jego dziełom.' }
        ],
        tags: ['Biochemia', 'Projekt', 'Maszyny'],
        category: 'teologia'
      },
      {
        id: 'atp-synthase',
        term: 'Syntaza ATP (Nanomotor Molekularny)',
        originalScript: 'כֹּחַ',
        transliteration: 'koach',
        strongCode: 'H3581',
        definition: 'Białkowa turbina obrotowa umieszczona w błonie mitochondriów, produkująca nośnik energii ATP poprzez obrót napędzany gradientem elektrochemicznym protonów.',
        biblicalContext: 'Arcydzieło nanotechnologii Stwórcy, bez którego żadna komórka nie mogłaby przeżyć ani sekundy.',
        keyVerses: [
          { ref: 'Ps 104:24', text: 'Jakże liczne są dzieła Twoje, PANIE! Wszystko mądrze uczyniłeś.' }
        ],
        tags: ['ATP', 'Energia', 'Mitochondria'],
        category: 'teologia'
      },
      {
        id: 'min-rodzaj',
        term: 'Min (Biblijny Rodzaj Stworzenia)',
        originalScript: 'מִין',
        transliteration: 'min',
        strongCode: 'H4327',
        definition: 'Podstawowa kategoria taksonomiczna w Księdze Rodzaju, oznaczająca granice genetyczne stworzenia, w ramach których możliwa jest zmienność (odpowiednik rodziny lub rzędu w biologii).',
        biblicalContext: 'Bóg stworzył zwierzęta i rośliny według ich rodzajów, zapobiegając mutacyjnemu przekraczaniu barier gatunkowych.',
        keyVerses: [
          { ref: 'Rdz 1:21', text: 'I stworzył Bóg... wszelkie istoty żywe według ich rodzajów.' }
        ],
        tags: ['Kreacjonizm', 'Gatunki', 'Biblia'],
        category: 'oryginal'
      },
      {
        id: 'epigenom',
        term: 'Epigenetyka (Nadrzędna Regulacja Genów)',
        originalScript: 'תּוֹרָה',
        transliteration: 'torah',
        strongCode: 'H8451',
        definition: 'Nauka o dziedzicznych zmianach ekspresji genów niewynikających ze zmiany sekwencji nukleotydów w DNA, działająca jak inteligentny przełącznik programowy.',
        biblicalContext: 'Wielowarstwowość kodu biologicznego odzwierciedla nieskończoną mądrość Prawodawcy natury.',
        keyVerses: [
          { ref: 'Ps 139:14', text: 'Wysławiam Cię, bo jestem cudownie ukształtowany.' }
        ],
        tags: ['Genetyka', 'Regulacja', 'Projekt'],
        category: 'teologia'
      },
      {
        id: 'embriogeneza',
        term: 'Cud Poczęcia (Imago Dei od Zygote)',
        originalScript: 'צֶלֶם',
        transliteration: 'tselem',
        strongCode: 'H6754',
        definition: 'Fakt biologiczny i teologiczny: od momentu połączenia gamet powstaje odrębna, żywa osoba ludzka nosząca nienaruszalny Boży obraz (Imago Dei).',
        biblicalContext: 'Życie nienarodzonego jest objęte szczególną Bożą ochroną i świętością (Księga Wyjścia 21:22-23).',
        keyVerses: [
          { ref: 'Jer 1:5', text: 'Zanim ukształtowałem cię w łonie matki, znałem cię.' }
        ],
        tags: ['Embriologia', 'Życie', 'Imago Dei'],
        category: 'etyka'
      }
    ]
  },

  // 4. PRAWO
  {
    id: 'prawo',
    title: 'CCN Prawo – Prawo a Biblia, Dekalog i Źródła Sprawiedliwości | Christian Culture',
    shortTitle: 'CCN Prawo & Sprawiedliwość',
    brandSubtitle: 'Prawo a Biblia • Dekalog fundamentem praworządności • Prawo naturalne vs pozytywizm • Sprawiedliwość naprawcza',
    canonical: 'https://polskieradio.cc/prawo',
    description: 'Biblijne korzenie zachodniej praworządności. Dekalog jako fundament konstytucjonalizmu, równość wobec prawa, bezstronność sądów, prawa naturalne i etyka państwa w świetle Pisma Świętego.',
    badge: 'DEKALOG',
    accentColor: '#4f46e5',
    categories: [
      { id: 'home', label: 'Wszystkie' },
      { id: 'dekalog', label: 'Dekalog & Źródła Prawa' },
      { id: 'prawonaturalne', label: 'Prawo Naturalne & Wolność' },
      { id: 'sprawiedliwosc', label: 'Sprawiedliwość Naprawcza' },
      { id: 'leksykon', label: 'Leksykon Prawny' },
      { id: 'about', label: 'O dziale' }
    ],
    tickerItems: [
      'DEKALOG BOŻY (BJW): Księga Wyjścia 20:1–17 w przekładzie ks. Jakuba Wujka — autentyczny, pełny tekst Dziesięciu Przykazań na polskieradio.cc/prawo',
      'Konstytucjonalizm: Dekalog i prawo hebrajskie stanowiły historyczną podstawę Magna Charta, Habeas Corpus i wolności zachodnich',
      'Prawa Naturalne: Niezbywalne prawa człowieka wynikają ze stworzenia na Boży obraz (Imago Dei), a nie z dekretu państwa',
      'Sądownictwo: Zasada dwóch świadków (Pwt 19:15) i zakaz stronniczości (Pwt 16:19) dały początek domniemaniu niewinności',
      'Granice Władzy: Rzymian 13 a Dzieje Apostolskie 5:29 – państwo nie ma prawa nakazywać tego, czego zakazuje Bóg'
    ],
    articles: [
      {
            "id": "art-trybunal-konstytucyjny-czy-najwyzszy-jest-jeszcze-sad",
            "title": "Trybunał Konstytucyjny czy Najwyższy? Jest jeszcze sąd, przed którym stanie każdy człowiek",
            "slug": "trybunal-konstytucyjny-czy-najwyzszy-jest-jeszcze-sad",
            "excerpt": "Od sporów o polskie sądy do świątyni w niebie i Chrystusa — Sędziego oraz Orędownika",
            "content": [
                  "1. Który sąd naprawdę jest najwyższy?",
                  "„Trybunał Konstytucyjny — Najwyższy?” To pytanie brzmi jak kolejna odsłona polskiej debaty politycznej. W natłoku komentarzy łatwo pomieszać instytucje, kompetencje i osobiste oceny. Tymczasem polska Konstytucja rozróżnia Sąd Najwyższy i Trybunał Konstytucyjny. Zgodnie z art. 183 Sąd Najwyższy sprawuje nadzór nad działalnością sądów powszechnych i wojskowych w zakresie orzekania, wykonując też inne ustawowe zadania. Trybunał Konstytucyjny na podstawie art. 188 bada zgodność określonych aktów normatywnych z Konstytucją i rozstrzyga inne sprawy powierzone mu przez ustawę zasadniczą.",
                  "Nie są to dwie nazwy jednego „najwyższego sądu”. Nie musimy opowiadać się po żadnej stronie bieżącej politycznej polemiki, aby uczciwie przyznać tę różnicę. Słowo prawdy powinno zaczynać się od poprawnego opisu faktów, a nie od nagłówka obliczonego na oburzenie.",
                  "2. Czy istnieje trybunał ponad ludzkimi instytucjami?",
                  "Biblia przedstawia obraz sądu, wobec którego spory ziemskich państw tracą swoją ostateczność. W Dn 7,9–10 prorok widzi trony, „Przedwiecznego” oraz otwarte księgi. Następnie w Dn 7,13–14 pojawia się postać podobna do Syna Człowieczego, otrzymująca wieczne panowanie. To wizja Bożej suwerenności i sprawiedliwości wobec potęg świata.",
                  "Ap 20,11–15 opisuje sąd przed wielkim białym tronem i otwarcie ksiąg. Koh 12,14 przypomina, że Bóg osądzi ludzkie czyny, również te ukryte. Nie wolno z tych tekstów konstruować tezy, że konkretny polski organ państwowy jest proroczym symbolem konkretnej niebiańskiej instytucji. To **analogia**, nie dosłowna identyfikacja. Język Biblii prowadzi do pytania o odpowiedzialność każdego z nas wobec Boga.",
                  "3. Świątynia w niebie: proroctwo i Ewangelia",
                  "Hbr 8,1–2 przedstawia Chrystusa jako Arcykapłana w prawdziwym niebiańskim przybytku; Hbr 9,24 opisuje Jego pojawienie się przed obliczem Boga dla nas. Ap 11,19 ukazuje otwartą świątynię Boga w niebie. Ap 14,6–7 wzywa do oddawania chwały Stwórcy w kontekście sądu. Te teksty poszerzają perspektywę: historia człowieka nie kończy się na sali sądowej ani w gabinecie polityka.",
                  "W interpretacji historycystycznej fragment Dn 8,14 odczytywany jest wraz z Hbr 8–9 jako część nauki o szczególnej służbie Chrystusa i sądzie przed Jego powtórnym przyjściem. Inne tradycje chrześcijańskie widzą w Dn 8,14 przede wszystkim historyczne wydarzenia związane ze świątynią, a w Liście do Hebrajczyków pełnię skuteczności już dokonanej ofiary. Uczciwość wobec Biblii wymaga odróżnienia treści, którą tekst mówi bezpośrednio, od rozbudowanej konstrukcji interpretacyjnej.",
                  "4. Najbardziej niezwykłe: Sędzia jest także Orędownikiem",
                  "Sama myśl o sądzie może budzić strach. Kto potrafi udowodnić, że nigdy nie skłamał, nie skrzywdził bliźniego i nie zaniedbał dobra, które mógł uczynić? Rz 3,23 uczy o powszechności grzechu. Ale kolejny werset wskazuje na usprawiedliwienie z łaski dzięki odkupieniu w Chrystusie (Rz 3,24–26).",
                  "W J 5,22 Jezus mówi o sądzie powierzonym Synowi. W 1 J 2,1 czytamy o Jezusie Chrystusie jako Orędowniku wierzących; Hbr 7,25 wskazuje, że żyje On, aby się za nimi wstawiać. Hbr 4,14–16 zachęca, aby z ufnością przystępować do tronu łaski. Nie ma tu sprzeczności między Bożą sprawiedliwością a miłosierdziem: Ewangelia mówi, że Bóg traktuje grzech poważnie, a ratunek daje przez ofiarę Syna.",
                  "To nie oznacza amnestii dla świadomej krzywdy bez pokuty. Sprawiedliwość Boża nie ma nic wspólnego z korupcją. Chrystus wzywa do odwrócenia się od zła i przyjęcia nowego życia, nie do kupienia uniewinnienia religijną deklaracją.",
                  "5. Wyrok nad naszym sumieniem",
                  "Zapytaj dziś nie tylko, czy instytucje państwa działają zgodnie z prawem. Zapytaj, czy Ty żyjesz zgodnie z prawdą. Jak traktujesz pracowników, bliskich, ludzi o innych poglądach? Czy potrafisz naprawić wyrządzoną szkodę? Czy uznajesz własną winę, czy wyłącznie oskarżasz innych? Jezus przestrzega przed obłudnym sądzeniem bliźnich (Mt 7,1–5) i stawia miłosierdzie oraz sprawiedliwość ponad religijną pozą (Mt 23,23).",
                  "Niebiańskiego sądu nie należy używać jako straszaka w sporze partyjnym. Jest przede wszystkim wezwaniem mnie samego do spotkania z prawdą. A największą nadzieją jest to, że prawda ta ma imię Jezus Chrystus. Nie bronię się przed Nim listą własnych zasług. Przyjmuję Jego łaskę, wyznaję grzech (1 J 1,9) i uczę się sprawiedliwie żyć."
            ],
            "category": "prawo",
            "categoryLabel": "CCN Prawo & Wiara",
            "author": {
                  "id": "cezary-rogowski",
                  "name": "Cezary Rogowski",
                  "role": "Założyciel Christian Culture",
                  "avatarUrl": "/avatar_cezary_official.jpg"
            },
            "publishedAt": "2026-11-22T06:15:00+01:00",
            "dateFormatted": "22 listopada 2026",
            "imageUrl": "/images/news/art-trybunal-konstytucyjny-czy-najwyzszy.jpg",
            "imageCaption": "Ilustracja koncepcyjna AI: Ziemskie sądownictwo i sale orzekania a wieczny niebiański tron Bożej sprawiedliwości i łaski (ilustracja poglądowa wygenerowana z pomocą AI — nie przedstawia autentycznych wydarzeń).",
            "readTimeMinutes": 4,
            "isPopular": true,
            "popularRank": 4,
            "tags": [
                  "Sąd Najwyższy",
                  "Trybunał Konstytucyjny",
                  "Sąd Boży",
                  "Sprawiedliwość",
                  "Orędownik",
                  "Chrystus",
                  "Cezary Rogowski",
                  "CCN Prawo"
            ],
            "scriptureReference": {
                  "verse": "Dn 7:9–10; Hbr 4:14–16",
                  "text": "Przystąpmy więc z ufnością do tronu łaski, abyśmy dostąpili miłosierdzia i znaleźli łaskę ku pomocy w stosownym czasie."
            },
            "sourceCitation": {
                  "sourceName": "Konstytucja Rzeczypospolitej Polskiej (Rozdział VIII: Sądy i Trybunały)",
                  "sourceUrl": "https://www.prezydent.pl/prawo/konstytucja-rp/rozdzial-viii-sady-i-trybunaly"
            },
            "primaryPortalUrl": "https://polskieradio.cc/prawo/trybunal-konstytucyjny-czy-najwyzszy-jest-jeszcze-sad",
            "primaryPortalLabel": "CCN Prawo"
      },
      {
            "id": "art-dzien-reformacji-2026-wrocmy-do-pisma-i-ewangelii-laski",
            "title": "Reformacja nie skończyła się w 1517 roku — wróćmy do Pisma i Ewangelii łaski",
            "slug": "dzien-reformacji-2026-wrocmy-do-pisma-i-ewangelii-laski",
            "excerpt": "Dziś, 31 października 2026 roku, przypada Dzień Reformacji. Mija 509 lat od 1517 roku, gdy Marcin Luter ogłosił 95 tez w Wittenberdze. Dlaczego Sola Scriptura i Sola Gratia pozostają żywym wezwaniem do przemiany serca i sumienia? Obejrzyj film „Luter” na Christian Culture TV.",
            "category": "prawonaturalne",
            "categoryLabel": "CCN PRAWO • WOLNOŚĆ SUMIENIA I ŹRÓDŁA PRAWA",
            "publishedAt": "2026-10-31T08:00:00Z",
            "dateFormatted": "31 października 2026",
            "imageUrl": "/images/news/art-dzien-reformacji-2026.jpg",
            "imageCaption": "31 października: 509. rocznica Reformacji. Wittenberga 1517 r. i powrót do autorytetu Słowa Bożego.",
            "readTimeMinutes": 8,
            "isHero": true,
            "isPopular": true,
            "popularRank": 1,
            "tags": [
                  "Dzień Reformacji",
                  "Reformacja",
                  "Marcin Luter",
                  "Sola Scriptura",
                  "Sola Gratia",
                  "Historia Kościoła",
                  "Cezary Rogowski",
                  "Wittenberga",
                  "Wormacja",
                  "Pismo Święte",
                  "Film Luter"
            ],
            "author": {
                  "id": "cezary-rogowski",
                  "name": "Cezary Rogowski",
                  "role": "Założyciel Christian Culture",
                  "status": "Żonaty",
                  "avatarUrl": "/avatar_cezary_official.jpg",
                  "bio": "Założyciel ekosystemu Christian Culture oraz portalu Lumina i stacji Polskie Radio CC."
            },
            "youtubeVideoId": "lug1BNspb8k",
            "videoUrl": "https://youtu.be/lug1BNspb8k",
            "scriptureReference": {
                  "verse": "List do Rzymian 1:16–17",
                  "text": "Nie wstydzę się bowiem ewangelii Chrystusa, ponieważ jest ona mocą Boga ku zbawieniu dla każdego, kto wierzy (...) Sprawiedliwy zaś z wiary żyć będzie.",
                  "strongCode": "G1343"
            },
            "lexiconTerms": [
                  {
                        "term": "Sola Scriptura (2 Tm 3:16–17)",
                        "strongCode": "G2315",
                        "definition": "Zasada nadrzędnego autorytetu natchnionego Pisma Świętego (theopneustos — tchnięte przez Boga) jako jedynej nieomylnej normy wiary i życia chrześcijańskiego."
                  },
                  {
                        "term": "Sola Gratia (Ef 2:8–9)",
                        "strongCode": "G5485",
                        "definition": "Usprawiedliwienie i zbawienie człowieka jako całkowicie darmowy, niezasłużony dar Bożej łaski (charis) przyjmowany przez wiarę w Chrystusa, nie z ludzkich zasług."
                  }
            ],
            "biblicalCommentary": {
                  "thesis": "Prawdziwa Reformacja to powrót do Chrystusa i uświęcenie codziennego sumienia",
                  "explanation": "Odnowa Kościoła i osobistej wiary nie polega na podtrzymywaniu plemiennych wojen religijnych sprzed stuleci, lecz na odwadze podporządkowania własnego życia i przekonań prawdzie Pisma Świętego.",
                  "verses": [
                        {
                              "ref": "Rz 1:16–17",
                              "text": "Sprawiedliwy z wiary żyć będzie."
                        },
                        {
                              "ref": "Ef 2:8–10",
                              "text": "Łaską bowiem jesteście zbawieni przez wiarę (...) stworzeni w Chrystusie Jezusie do dobrych uczynków."
                        },
                        {
                              "ref": "2 Tm 3:16–17",
                              "text": "Całe Pismo przez Boga jest natchnione i pożyteczne do nauki, do strofowania, do poprawy, do wychowania w sprawiedliwości."
                        },
                        {
                              "ref": "Ap 14:6–7",
                              "text": "I widziałem innego anioła lecącego środkiem nieba, mającego wieczną Ewangelię, aby ją zwiastować mieszkańcom ziemi."
                        }
                  ]
            },
            "resourceLinks": [
                  {
                        "label": "Obejrzyj pełnometrażowy film „Luter” na Christian Culture TV (YouTube)",
                        "url": "https://youtu.be/lug1BNspb8k"
                  },
                  {
                        "label": "Interlinearna MojaBiblia CC — Badaj teksty oryginalne ze Strongiem",
                        "url": "https://polskieradio.cc/mojabiblia"
                  },
                  {
                        "label": "Akademia Biblijna — Kurs Codzienny „Z Biblią za Pan Brat”",
                        "url": "https://polskieradio.cc/akademia/kurscodzienny"
                  }
            ],
            "content": [
                  "Dziś, 31 października 2026 roku, przypada Dzień Reformacji. Mija 509 lat od 1517 roku, gdy Marcin Luter ogłosił 95 tez dotyczących odpustów. Dzień ten zwyczajowo upamiętnia początek ruchu, który zmienił oblicze zachodniego chrześcijaństwa. Czy jest to jednak tylko rocznica wydarzenia sprzed pięciu stuleci? A może również okazja, by postawić sobie pytanie, czy moja własna wiara potrzebuje odnowy?",
                  "Wydaje mi się, że prawdziwe dziedzictwo Reformacji nie polega na nieustannym sporze o to, kto zwyciężył w XVI wieku. Polega na odwadze sprawdzania własnych przekonań w świetle Pisma i powracania do Jezusa Chrystusa. Nie potrzebujemy kolejnego święta religijnego pozbawionego przemiany serca. Potrzebujemy prawdy, która dotyka naszego codziennego postępowania.",
                  "[KADR: /images/news/luter-film-plakat-pionowy.jpg | Film „Luter” (2003, reż. Eric Till) z Josephem Fiennesem w roli Marcina Lutra — opowieść o człowieku, który w poszukiwaniu pokoju z Bogiem zmienił bieg dziejów Europy.]",
                  "1. Co naprawdę wydarzyło się w Wittenberdze?",
                  "Luter był augustiańskim zakonnikiem i profesorem teologii. Jego 95 tez otworzyło dyskusję o odpustach, pokucie i nadużyciach religijnych. Początkowo nie były gotowym programem stworzenia osobnego Kościoła. Dzięki drukowi kontrowersja szybko rozprzestrzeniła się daleko poza Wittenbergę.",
                  "Tradycyjna scena przybicia tez do drzwi kościoła stała się symbolem; szczegóły tego gestu pozostają przedmiotem historycznej dyskusji. Samo rozpowszechnienie tez i rosnący spór są dobrze poświadczone. Reformacja przyniosła szerszy dostęp do Biblii, nowe formy nauczania oraz istotną debatę o zbawieniu. Jej historia obejmowała także bolesne podziały i przemoc. Nie służy prawdzie przemilczanie ani osiągnięć, ani błędów ludzi po którejkolwiek stronie.",
                  "[KADR: /images/news/luter-film-kadr-staupitz-klasztor.jpg | Zmagania młodego mnicha w murach klasztoru w Erfurcie: Johann von Staupitz kieruje uwagę udręczonego Lutra z własnej niedoskonałości ku miłości i ofierze Jezusa Chrystusa.]",
                  "2. Sola Scriptura — czy Słowo naprawdę ma ostatnie słowo?",
                  "Reformacyjna zasada Sola Scriptura nie oznacza lekceważenia historii czy mądrości innych chrześcijan. Oznacza, że Pismo pozostaje najwyższym autorytetem dla nauki wiary. Apostoł Paweł wskazuje na jego rolę w nauczaniu, napominaniu i wychowaniu w sprawiedliwości (2 Tm 3,16–17), a Berejczycy sprawdzają głoszone im nauczanie przez badanie Pism (Dz 17,11).",
                  "Zadaję sobie trudne pytanie: czy otwieram Biblię po to, aby Bóg mógł skorygować moje poglądy, czy szukam jedynie wersetów, które je potwierdzą? Reformacja jest żywa tam, gdzie człowiek ma odwagę powiedzieć: „Panie, jeśli się mylę, naucz mnie Twojej prawdy”.",
                  "[KADR: /images/news/luter-film-kadr-wormacja-1521.jpg | Słynna obrona na Sejmie w Wormacji w 1521 roku przed cesarzem Karolem V: „Moje sumienie jest pojmane w Słowie Bożym. Odwołać niczego nie mogę i nie chcę. Tu stoję, inaczej nie mogę, niech mi Bóg dopomoże. Amen”.]",
                  "3. Solus Christus i Sola Gratia — centrum, którego nie wolno zgubić",
                  "Lutrowi towarzyszyło pytanie, jak grzeszny człowiek może zostać uznany za sprawiedliwego przed Bogiem. Rz 1,16–17 ukazuje Ewangelię jako moc Bożą ku zbawieniu, a Rz 3,21–26 przedstawia usprawiedliwienie przez odkupienie w Jezusie Chrystusie.",
                  "Ef 2,8–10 daje nam niezwykle ważną kolejność: zostajemy zbawieni łaską przez wiarę, nie na podstawie naszych uczynków; zostajemy jednak stworzeni w Chrystusie do dobrych czynów. Łaska nie jest więc nagrodą za religijną doskonałość. Jest niezasłużonym darem, który prowadzi do przemienionego życia.",
                  "Nie uratują mnie pieniądze, dobre uczynki rozumiane jako zapłata za zbawienie ani opinia innych o mojej pobożności. Jedynym Pośrednikiem jest Chrystus (1 Tm 2,5). Tylko Jemu należy się chwała. A moja wiara powinna wydawać owoce uczciwości, miłości i odpowiedzialności.",
                  "[KADR: /images/news/luter-film-kadr-fryderyk-madry.jpg | Książę saski Fryderyk Mądry (w filmie wybitna rola Sir Petera Ustinova) — władca, który chronił wolność myśli i dał schronienie Lutrowi na zamku w Wartburgu, umożliwiając przetłumaczenie Nowego Testamentu na język ojczysty.]",
                  "4. Od reformy instytucji do reformy mojego sumienia",
                  "Znacznie łatwiej oceniać pomyłki ludzi sprzed pięciuset lat niż własne. Jezus przypomina jednak, że można zachować religijną formę i zaniedbywać sprawiedliwość, miłosierdzie i wierność (Mt 23,23–28).",
                  "Jeśli mówię o Biblii, a oszukuję w interesach, potrzebuję reformy. Jeśli głoszę miłość, a upokarzam bliskich, potrzebuję reformy. Jeśli wzywam innych do pokuty, ale sam nie chcę przyznać się do winy, moje hasła są puste.",
                  "Prawdziwa odnowa oznacza przyznanie prawdy, zaprzestanie krzywdy i podjęcie odpowiedzialności. Nikt nie zostaje zbawiony przez własną moralną sprawność, ale łaska Chrystusa nigdy nie jest usprawiedliwieniem hipokryzji (Tt 2,11–14).",
                  "[KADR: /images/news/luter-film-kadr-rebel-genius.jpg | Prawdziwe przesłanie Reformacji to nie spór polityczny, lecz osobista przemiana życia w blasku Bożej łaski.]",
                  "5. Wieczna Ewangelia dla współczesnego świata",
                  "Ap 14,6–7 przedstawia wieczną Ewangelię głoszoną wszystkim narodom, językom i ludom. W jej centrum jest wezwanie do oddawania czci Stwórcy. To ważne przypomnienie, że reforma wiary nie kończy się na nowych strukturach organizacyjnych i polemikach. Prowadzi do żywej relacji z Bogiem.",
                  "Nie trzeba dopasowywać każdej bieżącej wiadomości do proroctwa, aby zachować biblijną czujność. Chrześcijanin ma szukać prawdy i żyć nią z miłością oraz nadzieją. Świat potrzebuje przede wszystkim Ewangelii Jezusa Chrystusa, a nie kolejnego religijnego konfliktu prowadzonego dla prestiżu.",
                  "6. Obejrzyj film „Luter” na Christian Culture TV",
                  "Z okazji Dnia Reformacji zapraszam Cię do obejrzenia filmu „Luter – człowiek, który zmienił oblicze Kościoła”, udostępnionego z polskim lektorem na kanale Christian Culture TV.",
                  "Film „Luther” z 2003 roku, wyreżyserowany przez Erica Tilla, przedstawia duchowe zmagania reformatora i wydarzenia prowadzące do Reformacji. W roli tytułowej występuje Joseph Fiennes. Film jest dramatem historycznym, a nie dokumentem, dlatego warto traktować go jako zachętę do dalszego poznawania historii i Pisma Świętego.",
                  "Zobacz cały film z polskim lektorem bezpośrednio pod adresem: https://youtu.be/lug1BNspb8k lub w powyższym oknie odtwarzacza.",
                  "Zaproś rodzinę lub znajomych, a po seansie przeczytajcie razem Rz 1,16–17 oraz Ef 2,8–10. Zastanówcie się: na czym opieramy pewność zbawienia? Co oznacza wolność w Chrystusie? Czy moja religijność pozostaje otwarta na korektę Słowa Bożego?",
                  "7. Reformacja zaczyna się dziś",
                  "Nie chcę, żeby 31 października był tylko datą w kalendarzu. Chciałbym, aby stał się dniem osobistej decyzji. Wróćmy do Biblii. Nie udawajmy bezbłędnych. Przyjmijmy zbawienie z łaski, a następnie uczmy się żyć w sposób godny Ewangelii.",
                  "Modlitwa na Dzień Reformacji: Panie Jezu, daj nam pokorę wobec Twojego Słowa, odwagę do odrzucenia obłudy, miłość do ludzi o innych przekonaniach i wdzięczność za Twoją łaskę. Niech odnowa zacznie się we mnie. Amen.",
                  "Podsumowanie Redakcyjne CCN News: Dzień Reformacji 2026 to zaproszenie do osobistego rachunku sumienia i oparcia życia na niewzruszonym fundamencie Pisma Świętego. Wszystkie publikacje, słuchowiska i materiały Christian Culture są w 100% bezpłatne. Pełny film z polskim lektorem dostępny jest na Christian Culture TV (YouTube: lug1BNspb8k)."
            ]
      },
      {
        "id": "art-dekalog-dziesiec-przykazan-bozych-wujek-bjw",
        "title": "Dziesięć przykazań Bożych wg Biblii w tł. ks. Jakuba Wujka (BJW)",
        "slug": "dziesiec-przykazan-bozych-biblia-jakub-wujek-bjw-dekalog",
        "excerpt": "Księga Wyjścia 20,1–17 w klasycznym, natchnionym przekładzie ks. Jakuba Wujka (wyd. III 1962 r.). Poznaj autentyczne, nienaruszone brzmienie Dekalogu — z biblijnym zakazem kultu obrazów rytych oraz uświęceniem dnia siódmego (sabatu).",
        "content": [
                "„I mówił Bóg wszystkie te słowa, rzekłszy: Jam jest Pan, Bóg twój, który cię wywiódł z ziemi egipskiej, z domu niewoli” (Księga Wyjścia 20,1–2, Biblia w przekładzie Ks. Jakuba Wujka, wyd. III 1962 r.).",
                "Prezentujemy autentyczny, pełny tekst Dziesięciu Przykazań Bożych dokładnie według natchnionego tekstu Pisma Świętego w historycznym przekładzie ks. Jakuba Wujka (BJW):",
                "I. Nie będziesz miał bogów cudzych przede mną.",
                "II. Nie uczynisz sobie obrazu rytego ani żadnej podobizny tego, co jest na niebie w górze i co na ziemi nisko, ani z tych rzeczy, które są w wodach pod ziemią. Nie będziesz się im kłaniał ani służył. Ja jestem Pan, Bóg twój, mocny, zawistny, karzący nieprawość ojców na synach do trzeciego i czwartego pokolenia tych, którzy mnie nienawidzą; a czyniący miłosierdzie tysiącom tych, którzy mię miłują i strzegą przykazań moich.",
                "III. Nie będziesz brał imienia Pana, Boga twego, nadaremno; bo nie będzie miał Pan za niewinnego tego, który by wziął imię Pana, Boga swego, nadaremno.",
                "IV. Pamiętaj, abyś dzień sobotni święcił. Sześć dni robic będziesz i będziesz wykonywał wszystkie roboty twoje; ale dnia siódmego sabat Pana, Boga twego, jest: nie będziesz wykonywał weń żadnej roboty, ty i syn twój, i córka twoja, sługa twój i służebnica twoja, bydlę twoje i gość, który jest między bramami twymi. Przez sześć dni bowiem czynił Pan niebo i ziemię, i morze, i wszystko, co w nich jest, a odpoczął dnia siódmego; i dlatego pobłogosławił Pan dniowi sobotniemu i poświęcił go.",
                "V. Czcij ojca twego i matkę twoją, abyś długo żył na ziemi, którą Pan, Bóg twój, da tobie.",
                "VI. Nie będziesz zabijał.",
                "VII. Nie będziesz cudzołożył.",
                "VIII. Nie będziesz kradzieży czynił.",
                "IX. Nie będziesz mówił fałszywego świadectwa przeciw bliźniemu twemu.",
                "X. Nie będziesz pożądał domu bliźniego twego, ani będziesz pragnął żony jego, ani sługi, ani służebnicy, ani wołu, ani osła, ani żadnej rzeczy, która jego jest.",
                "(Księga Wyjścia 20,1-17, Biblia w przekładzie Ks. Jakuba Wujka, wyd.III 1962r.)",
                "KOMENTARZ REDAKCYJNY — CEZARY ROGOWSKI:",
                "Przekład ks. Jakuba Wujka z 1599 roku (oraz zrewidowane wydanie III z 1962 r.) to nie tylko monumentalny zabytek polszczyzny, ale przede wszystkim wierne świadectwo integralności Słowa Bożego. Tekst ten bez żadnych retuszy zachowuje pełne, natchnione brzmienie Dekalogu.",
                "Współczesna kultura religijna przyzwyczaiła wielu wiernych do skróconych formuł katechizmowych, w których z reguły całkowicie usunięte zostaje drugie przykazanie o zakazie kultu obrazów i posągów, a przykazanie czwarte o sabacie sprowadzone jest do ogólnego nakazu święcenia dni świętych. Aby uzupełnić brakujące przykazanie do liczby dziesięciu, dziesiąte przykazanie o pożądaniu zostało rozdzielone na dwa odrębne punkty.",
                "Pismo Święte w Księdze Wyjścia 20:1–17 ukazuje jednak Dekalog jako nierozerwalną całość Przymierza. Sam Zbawiciel, Jezus Chrystus, podkreślił w Ewangelii wg św. Mateusza (5:17–19), że ani jedna jota, ani jedna kreska nie przeminie z Zakonu. Apostoł Jakub napisał: „Ktokolwiek bowiem zachowa cały Zakon, a uchybi w jednym, stał się winnym wszystkich” (Jk 2:10).",
                "Dekalog ogłoszony na Synaju wyznacza wieczne standardy sprawiedliwości i miłości. Pierwsze cztery przykazania regulują naszą relację z Bogiem — Jego wyłączność, zakaz bałwochwalstwa, cześć dla Jego Imienia oraz odpoczynek sabatowy na pamiątkę Stworzenia. Kolejnych sześć przykazań chroni rodzinę, życie, wierność małżeńską, własność, prawdę i czystość ludzkiego serca.",
                "Jako Christian Culture stajemy na gruncie nieskażonego Słowa Bożego, zachęcając każdego czytelnika do osobistego sięgnięcia po Pismo Święte i weryfikowania każdej nauki w świetle natchnionego tekstu Biblii."
        ],
        "scriptureReference": {
                "verse": "Księga Wyjścia 20:1–17",
                "text": "I mówił Bóg wszystkie te słowa, rzekłszy: Jam jest Pan, Bóg twój, który cię wywiódł z ziemi egipskiej, z domu niewoli.",
                "strongCode": "H1697 (Aseret ha-Dvarim — Dziesięć Przykazań) / H8451 (Torah — Prawo Boże)"
        },
        "sourceCitation": {
                "sourceName": "Biblia w przekładzie Ks. Jakuba Wujka, wyd. III 1962r.",
                "sourceUrl": "https://polskieradio.cc/prawo",
                "quotationDate": "Wydanie III z 1962 r.",
                "originalTitle": "Dziesięć przykazań Bożych wg Biblii w tł. ks. Jakuba Wujka (Wj 20,1-17)"
        },
        "category": "dekalog",
        "categoryLabel": "DEKALOG · PISMO ŚWIĘTE (BJW)",
        "author": {
                "id": "cezary-rogowski",
                "name": "Cezary Rogowski",
                "role": "Założyciel Christian Culture",
                "status": "Żonaty",
                "avatarUrl": "/avatar_cezary_official.jpg",
                "bio": "Założyciel ekosystemu Christian Culture oraz portalu Lumina i stacji Polskie Radio CC."
        },
        "publishedAt": "2026-10-14T19:30:00Z",
        "dateFormatted": "14 października 2026",
        "imageUrl": "/images/news/art-dekalog-dziesiec-przykazan-wujek.jpg",
        "imageCaption": "Ilustracja AI: Tablice Przymierza na Górze Synaj w majestatycznym świetle poranka (ilustracja poglądowa wygenerowana z pomocą AI — nie przedstawia opisywanego wydarzenia).",
        "readTimeMinutes": 6,
        "isHero": true,
        "isPopular": true,
        "popularRank": 1,
        "tags": [
                "Dekalog",
                "Dziesięć Przykazań",
                "Biblia Jakuba Wujka",
                "BJW",
                "Księga Wyjścia 20",
                "Prawo Boże",
                "Sabat",
                "Synaj",
                "Cezary Rogowski"
        ]
},
      {
        id: 'art-pensylwania-grand-jury-prawo-i-moralnosc',
        title: 'Raport z Pensylwanii: Ponad 300 księży i 1000 ofiar. Anatomia systemowego tuszowania w świetle Prawa Bożego i cywilnego',
        slug: 'raport-pensylwania-ponad-300-ksiezy-systemowe-tuszowanie-prawo-boze',
        excerpt: '1356 stron raportu Wielkiej Ławy Przysięgłych i analiza tajnych archiwów diecezjalnych. Dlaczego Boże prawo wyklucza immunitet instytucjonalny i nakazuje bezwzględną ochronę dzieci oraz pełną odpowiedzialność karną sprawców i ich mocodawców.',
        category: 'prawo',
        categoryLabel: 'PRAWO BOŻE A PRAWO KARNE',
        publishedAt: '2026-10-03T12:00:00Z',
        dateFormatted: '3 października 2026',
        imageUrl: 'https://i.ytimg.com/vi/T0NjiajqqRY/hqdefault.jpg',
        imageCaption: 'Śledztwo prokuratury w Pensylwanii: Tuszowanie zbrodni w świetle prawa karnego i moralności biblijnej.',
        readTimeMinutes: 7,
        isHero: false,
        isPopular: true,
        popularRank: 2,
        youtubeVideoId: 'T0NjiajqqRY',
        videoUrl: 'https://youtu.be/T0NjiajqqRY',
        tags: ['Pensylwania', 'Grand Jury', 'Prawo Boże', 'Sprawiedliwość', 'Ochrona Dzieci', 'Wideo', 'Cezary Rogowski'],
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        scriptureReference: {
          verse: 'Ewangelia wg św. Mateusza 18:6',
          text: 'Lecz kto by zgorszył jednego z tych maluczkich, którzy we mnie wierzą, lepiej by mu było, aby zawieszono kamień młyński u szyi jego i utopiono go w głębokości morskiej.',
          strongCode: 'G4624 (skandalizo - zwieść, wyrządzić krzywdę)'
        },
        sourceCitation: {
          sourceName: 'The Guardian / Pennsylvania Attorney General Grand Jury Report',
          sourceUrl: 'https://www.theguardian.com/us-news/2018/aug/14/more-than-300-pennsylvania-priests-committed-sexual-abuse-over-decades',
          quotationDate: 'Raport Wielkiej Ławy Przysięgłych',
          originalTitle: 'More than 300 Pennsylvania priests abused 1,000 children over decades, report says'
        },
        content: [
          'Opublikowany przez Sąd Najwyższy Pensylwanii i prokuraturę generalną 1356-stronicowy raport Wielkiej Ławy Przysięgłych (Grand Jury) stanowi wstrząsający dokument zbrodni oraz ich instytucjonalnego tuszowania w sześciu diecezjach rzymskokatolickich w okresie siedmiu dekad.',
          'Ustalenia prokuratury opierają się na wnikliwym zbadaniu ponad pół miliona stron tajnych dokumentów diecezjalnych. Wynika z nich bezspornie, że biskupi posiadali pełną wiedzę o dewiacjach i gwałtach na dzieciach, jednak zamiast zgłaszać sprawy na policję, przenosili sprawców do nowych parafii, opłacali milczenie ofiar i prowadzili tajne kartoteki.',
          'W świetle biblijnego prawa nie istnieje żaden immunitet religijny chroniący sprawców przemocy. Jezus Chrystus w Ewangelii wg św. Mateusza (18:6) wypowiedział jedno z najsurowszych ostrzeżeń w całym Piśmie Świętym przeciwko tym, którzy krzywdzą dzieci. Prawo Boże żąda prawdy i jawności (Ef 5:11-13: „Nie miejcie społeczności z bezowocnymi uczynkami ciemności, ale je raczej karćcie”). Prawdziwe chrześcijaństwo jednoznacznie potępia fałszywą korporacyjną solidarność i domaga się sprawiedliwości dla skrzywdzonych.'
        ]
      },

      {
        id: 'art-z-biblia-za-pan-brat-dzien-03',
        title: 'Gdzie jesteś? Anatomia upadku i pierwsza Ewangelia Edenu',
        slug: 'gdzie-jestes-anatomia-upadku-i-pierwsza-ewangelia-edenu',
        excerpt: 'W ramach globalnego programu „Z Biblią za Pan Brat” analizujemy przełomowy trzeci rozdział Księgi Rodzaju — mechanizm pokusy, ucieczkę człowieka i Bożą Protewangelię.',
        category: 'wiara',
        categoryLabel: 'Z BIBLIĄ ZA PAN BRAT · ROZWAŻANIE DNIA',
        publishedAt: '2026-10-03T06:00:00Z',
        dateFormatted: '3 października 2026',
        imageUrl: 'https://polskieradio.cc/images/academy/daily/kc_day_03_fall.jpg',
        imageCaption: 'Księga Rodzaju 3: Bóg przychodzi szukać człowieka i ogłasza pierwszą obietnicę Zbawiciela.',
        readTimeMinutes: 5,
        isHero: false,
        isPopular: false,
        tags: ['Z Biblią za Pan Brat', 'Księga Rodzaju', 'Rdz 3', 'Protewangelia', 'Cezary Rogowski'],
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        scriptureReference: {
          verse: 'Księga Rodzaju 3:15',
          text: 'I ustanowię nieprzyjaźń między tobą a kobietą, między twoim potomstwem a jej potomstwem; ono zrani ci głowę, a ty zranisz mu piętę.',
          strongCode: 'H2233'
        },
        content: [
          'Czy zauważasz, jak często w momentach trudności lub własnych potknięć Twój pierwszy odruch nie prowadzi do Boga, lecz do lęku i ukrywania się?',
          'Zatrzymaj się na progu trzeciego dnia naszej wspólnej wędrówki w Księdze Rodzaju i zbadaj z całą surowością stan swojego serca. Wypowiedz przed Ojcem to bezkompromisowe pytanie: Tato, dlaczego mój język i moje myśli tak często ulegają podszeptom zwątpienia w Twoją dobroć, zamiast bezwzględnie ufać Twojemu Słowu?',
          'Wchodząc dzisiaj w trzeci rozdział Księgi Rodzaju, stajemy w obliczu dramatu upadku człowieka, ale i niesamowitego, poruszającego poszukiwania ze strony Stwórcy. Kiedy człowiek zgrzeszył, spletł liście figowe i uciekł w cień drzew, to nie człowiek zawołał Boga – to Bóg przerwał milczenie i zadał najgłębsze pytanie w historii ludzkości: „Gdzie jesteś?”.'
        ]
      },
      {
        id: 'prawo-dekalog-fundament',
        title: 'Dekalog jako fundament zachodniej cywilizacji prawnej: 10 przykazań a prawa obywatelskie',
        slug: 'dekalog-jako-fundament-praworzadnosci-zachodniej',
        excerpt: 'Jak Dekalog ukształtował prawo konstytucyjne, zasadę podziału władzy, tradycję Common Law oraz nienaruszalność wolności sumienia.',
        content: [
          'Nie sposób zrozumieć zachodniej jurysprudencji, instytucji państwa prawa (Rule of Law) ani idei praw człowieka bez odwołania do Dekalogu ogłoszonego na Synaju. Dziesięć Przykazań zdefiniowało obiektywne ramy porządku społecznego: ochronę czci Boga, poszanowanie rodziny, nienaruszalność życia (Nie zabijaj), praworządność małżeńską (Nie cudzołóż), ochronę własności prywatnej (Nie kradnij) oraz uczciwość procesową (Nie mów fałszywego świadectwa).',
          'W tradycji Common Law sir Edward Coke i William Blackstone jednoznacznie uznawali prawo Boże za nadrzędne wobec ustaw stanowionych przez parlament. Doktryna „Lex Rex” Samuela Rutherforda (1644) obaliła absolutyzm monarszy, dowodząc, że to Prawo jest królem, a król podlega prawu Bożemu na równi z najuboższym poddanym.',
          'Gdy współczesne państwa odrzucają Dekalog, prawo zamienia się w bezduszny instrument inżynierii społecznej partii rządzących. Pismo Święte przypomina: „Twoja sprawiedliwość jest wieczną sprawiedliwością, a Twoje prawo jest prawdą” (Ps 119:142).'
        ],
        scriptureReference: {
          verse: 'Księga Psalmów 119:142',
          text: 'Twoja sprawiedliwość jest wieczną sprawiedliwością, a Twoje prawo jest prawdą.',
          strongCode: 'H6666 (tsedek - sprawiedliwość) / H8451 (torah - prawo, nauka) / H571 (emet - prawda)'
        },
        category: 'dekalog',
        categoryLabel: 'Dekalog & Źródła Prawa',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-10-02T10:00:00Z',
        dateFormatted: '2 października 2026',
        imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'Symbole sprawiedliwości – Dekalog jako kamień węgielny zachodniego prawodawstwa.',
        readTimeMinutes: 7,
        isHero: true,
        isPopular: true,
        popularRank: 1,
        tags: ['Prawo', 'Dekalog', 'Konstytucja', 'Praworządność', 'Lex Rex']
      },
      {
        id: 'prawo-pozytywizm-zagrozenie',
        title: 'Prawo naturalne a dramat pozytywizmu: Dlaczego prawo bez Boga prowadzi do tyranii',
        slug: 'prawo-naturalne-a-pozytywizm-prawny-formuła-radbrucha',
        excerpt: 'Czym różni się sprawiedliwe Ius od państwowego Lex? Jak pozytywizm umożliwił legalizm zbrodni nazizmu i komunizmu („ustawowe bezprawie”).',
        content: [
          'Pozytywizm prawniczy głosi, że prawem jest każda norma formalnie uchwalona przez władzę państwową, bez względu na jej treść moralną. Skrajnym skutkiem tej doktryny była tragedia XX wieku: zbrodnie III Rzeszy i Związku Sowieckiego dokonywały się ściśle w zgodzie z obowiązującymi wówczas ustawami.',
          'Dopiero procesy norymberskie i słynna Formuła Gustava Radbrucha zmusiły prawników do powrotu do chrześcijańskiej koncepcji Prawa Naturalnego: gdy ustawa przeczy fundamentalnej sprawiedliwości i godności człowieka, traci moc prawną i staje się „ustawowym bezprawiem”.',
          'Prorok Izajasz przestrzegał przed tym tysiąclecia temu: „Biada tym, którzy wydają niesprawiedliwe ustawy i spisują dekrety niosące ucisk” (Iz 10:1). Prawowite państwo nie tworzy praw człowieka, lecz jedynie je uznaje i chroni, gdyż ich źródłem jest Sam Bóg.'
        ],
        scriptureReference: {
          verse: 'Księga Izajasza 10:1',
          text: 'Biada tym, którzy wydają niesprawiedliwe ustawy i spisują dekrety niosące ucisk.',
          strongCode: 'H1945 (hoy - biada) / H2706 (choq - ustawa, dekret)'
        },
        category: 'prawonaturalne',
        categoryLabel: 'Prawo Naturalne & Wolność',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-10-01T12:30:00Z',
        dateFormatted: '1 października 2026',
        imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 6,
        isHero: true,
        isPopular: true,
        popularRank: 2,
        tags: ['Prawo Naturalne', 'Pozytywizm', 'Radbruch', 'Totalitaryzm']
      },
      {
        id: 'prawo-rownosc-zakaz-korupcji',
        title: 'Równość wobec prawa i bezstronność sędziów w Prawie Mojżeszowym',
        slug: 'rownosc-wobec-prawa-zakaz-korupcji-prawo-mojzeszowe',
        excerpt: 'Podczas gdy starożytne kodeksy (Hammurabi) faworyzowały elity, Biblia wprowadziła jednakową odpowiedzialność dla króla, ubogiego i cudzoziemca.',
        content: [
          'Kodeks Hammurabiego przewidywał drastycznie różne kary w zależności od statusu społecznego ofiary i sprawcy (szlachcic, człowiek wolny, niewolnik). Prawo hebrajskie dokonało absolutnego przełomu w historii świata.',
          'Księga Powtórzonego Prawa nakazuje sędziom: „Nie będziesz naginał prawa, nie będziesz stronniczy ani nie przyjmiesz łapówki, gdyż łapówka zaślepia oczy mądrych i wykrzywia słowa sprawiedliwych” (Pwt 16:19). Nawet król Izraela nie stał ponad prawem – po wstąpieniu na tron musiał własnoręcznie sporządzić kopię Księgi Prawa i studiować ją codziennie (Pwt 17:18-20).',
          'Ta biblijna zasada równości wobec prawa (Isonomia) legła u podstaw nowożytnych deklaracji konstytucyjnych i uniezależnienia sądownictwa od nacisków władzy wykonawczej.'
        ],
        scriptureReference: {
          verse: 'Księga Powtórzonego Prawa 16:19',
          text: 'Nie będziesz naginał prawa, nie będziesz stronniczy ani nie przyjmiesz łapówki.',
          strongCode: 'H5234 (nakar - faworyzować, mieć wzgląd na twarz) / H7810 (shochad - łapówka)'
        },
        category: 'dekalog',
        categoryLabel: 'Dekalog & Źródła Prawa',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-09-28T15:00:00Z',
        dateFormatted: '28 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1436450412740-6b988f486c6b?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 5,
        tags: ['Sprawiedliwość', 'Sądy', 'Antykorupcja', 'Mojżesz']
      },
      {
        id: 'prawo-dwoch-swiadkow',
        title: 'Zasada dwóch świadków i domniemanie niewinności: Korzenie procedury karnej',
        slug: 'zasada-dwoch-swiadkow-domniemanie-niewinnosci',
        excerpt: 'Pwt 19:15 chroniła obywatela przed fałszywym oskarżeniem. Surowa kara dla fałszywego świadka gwarantowała uczciwość procesu.',
        content: [
          'Nowożytna procedura karna szczyci się domniemaniem niewinności oraz standardem dowodowym „poza wszelką uzasadnioną wątpliwość”. Obie te reguły wywodzą się wprost z prawa hebrajskiego.',
          'W Księdze Powtórzonego Prawa czytamy: „Jeden świadek nie wystarczy przeciwko człowiekowi... Na słowie dwóch lub trzech świadków oprze się sprawa” (Pwt 19:15). Ponadto ten, kto składał fałszywe świadectwo, musiał ponieść dokładnie taką karę, jaką zamierzał sprowadzić na oskarżonego (zasada odwzajemnienia, Pwt 19:19).',
          'Pan Jezus potwierdził tę procedurę w sporach prawnych i kościelnych (Mt 18:16), a apostoł Paweł zabronił przyjmowania oskarżeń przeciwko starszym bez dwóch lub trzech naocznych świadków (1 Tm 5:19).'
        ],
        scriptureReference: {
          verse: 'Księga Powtórzonego Prawa 19:15',
          text: 'Na słowie dwóch lub trzech świadków oprze się sprawa.',
          strongCode: 'H5707 (ed - świadek) / H6965 (qum - ostać się, uprawomocnić)'
        },
        category: 'dekalog',
        categoryLabel: 'Dekalog & Źródła Prawa',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-09-25T13:20:00Z',
        dateFormatted: '25 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 5,
        tags: ['Proces Karny', 'Świadkowie', 'Niewinność', 'Procedura']
      },
      {
        id: 'prawo-sprawiedliwosc-naprawcza',
        title: 'Biblijny model sprawiedliwości naprawczej (Restitutio): Zadośćuczynienie zamiast celi',
        slug: 'sprawiedliwosc-naprawcza-restitutio-zadoscuczynienie',
        excerpt: 'Dlaczego hebrajski wymóg finansowego i pracowniczego zadośćuczynienia ofierze przewyższa kosztowne i demoralizujące więzienia.',
        content: [
          'Współczesny system penitencjarny skupia się niemal wyłącznie na izolacji przestępcy w więzieniu na koszt podatników (w tym samej ofiary!), całkowicie marginalizując zadośćuczynienie poszkodowanemu.',
          'Prawo biblijne opiera się na zasadzie sprawiedliwości naprawczej (Restitutio). Złodziej nie siedział bezczynnie w celi, lecz musiał zwrócić skradzione dobro w podwójnej, poczwórnej, a nawet pięciokrotnej wartości (Wj 22:1). Jeśli nie miał pieniędzy, musiał odpracować dług.',
          'W ten sposób sprawiedliwość była wymierzona: ofiara odzyskiwała majątek z nawiązką, sprawca ponosił realny trud naprawy błędu i uczył się szacunku do cudzej własności. Doskonałą ilustracją tego jest nawrócenie Zacheusza: „Jeśli kogoś w czymś oszukałem, zwracam poczwórnie” (Łk 19:8).'
        ],
        scriptureReference: {
          verse: 'Ewangelia wg św. Łukasza 19:8',
          text: 'A jeśli kogoś w czymś oszukałem, zwracam poczwórnie.',
          strongCode: 'G632 (apodidomi - oddać w całości, zadośćuczynić)'
        },
        category: 'sprawiedliwosc',
        categoryLabel: 'Sprawiedliwość Naprawcza',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-09-22T11:00:00Z',
        dateFormatted: '22 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 5,
        tags: ['Restitutio', 'Zadośćuczynienie', 'Zacheusz', 'Naprawa']
      },
      {
        id: 'prawo-panstwo-posluszenstwo',
        title: 'Rzymian 13 a Dzieje 5:29: Kiedy obywatel ma obowiązek odmówić posłuszeństwa państwu',
        slug: 'rzymian-13-a-dzieje-5-29-granice-posluszenstwa-wladzy',
        excerpt: 'Władza państwowa nie ma mandatu absolutnego. Teologia oporu wobec bezprawia od Apostołów po Dietricha Bonhoeffera.',
        content: [
          'List do Rzymian 13:1-4 definiuje Boży mandat dla władzy świeckiej: ma ona być „sługą Boga ku dobremu”, karzącym złoczyńców i chroniącym praworządnych obywateli. Nie jest to jednak czek in blanco dla tyranny.',
          'Gdy aparat państwowy zaczyna karać dobro i nagradzać zło, przekracza swoje Boskie uprawnienia i wchodzi w rolę bestii z Apokalipsy 13. Wówczas obowiązuje kategoryczna norma apostolska: „Trzeba bardziej słuchać Boga niż ludzi” (Dz 5:29).',
          'Chrześcijańska doktryna oporu sumienia dała światu wolność religijną, prawo do strajku sumienia lekarzy i odwagę męczenników, którzy woleli ponieść śmierć niż złożyć pokłon Cezarowi.'
        ],
        scriptureReference: {
          verse: 'Dzieje Apostolskie 5:29',
          text: 'Trzeba bardziej słuchać Boga niż ludzi.',
          strongCode: 'G3980 (peitharcheo - słuchać władzy z uległością sumienia)'
        },
        category: 'prawonaturalne',
        categoryLabel: 'Prawo Naturalne & Wolność',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-09-18T16:00:00Z',
        dateFormatted: '18 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1494178270175-e96de2971df9?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 6,
        tags: ['Władza', 'Rz 13', 'Dz 5:29', 'Wolność Sumienia']
      }
    ],
    lexicon: [
      {
        id: 'ius-naturale',
        term: 'Ius Naturale (Prawo Naturalne)',
        originalScript: 'חֹק / νόμος',
        transliteration: 'choq / nomos',
        strongCode: 'H2706 / G3551',
        definition: 'Zbiór uniwersalnych i niezmiennych norm sprawiedliwości wynikających z woli Boga i wpisanych w naturę człowieka oraz wszechświata.',
        biblicalContext: 'Prawo stanowione przez parlamenty musi być zgodne z Prawem Naturalnym, inaczej traci charakter prawny i staje się bezprawiem.',
        keyVerses: [
          { ref: 'Rz 2:15', text: 'Dzieło zakonu jest wypisane w ich sercach.' }
        ],
        tags: ['Prawo Naturalne', 'Etyka', 'Konstytucja'],
        category: 'teologia'
      },
      {
        id: 'mishpat',
        term: 'Mishpat (Sprawiedliwość / Praworządność)',
        originalScript: 'מִשְׁפָּט',
        transliteration: 'mishpat',
        strongCode: 'H4941',
        definition: 'Kluczowe hebrajskie pojęcie prawne oznaczające bezstronny sąd, ochronę praw ubogiego, wdowy i sieroty oraz praworządne egzekwowanie sprawiedliwości.',
        biblicalContext: 'Bóg miłuje sprawiedliwość (mishpat) i nienawidzi przekupstwa oraz ucisku bezbronnych.',
        keyVerses: [
          { ref: 'Mich 6:8', text: 'Czego PAN żąda od ciebie, jeśli nie czynienia sprawiedliwości, miłowania miłosierdzia i pokornego chodzenia z twoim Bogiem?' }
        ],
        tags: ['Mishpat', 'Sprawiedliwość', 'Hebrajski'],
        category: 'oryginal'
      },
      {
        id: 'restitutio',
        term: 'Restitutio (Sprawiedliwość Naprawcza)',
        originalScript: 'שִׁלֵּם',
        transliteration: 'shillem',
        strongCode: 'H7999',
        definition: 'Instytucja prawna nakładająca na sprawcę obowiązek pełnego wyrównania szkody materialnej i moralnej wyrządzonej pokrzywdzonemu.',
        biblicalContext: 'Główny cel hebrajskiego prawa karnego w miejsce bezdusznego izolowania skazanego bez zadośćuczynienia ofierze.',
        keyVerses: [
          { ref: 'Wj 22:1', text: 'Jeśli ktoś ukradnie wołu lub owcę... zwróci pięć wołów za wołu, a cztery owce za owcę.' }
        ],
        tags: ['Restitutio', 'Zadośćuczynienie', 'Odszkodowanie'],
        category: 'teologia'
      },
      {
        id: 'lex-rex',
        term: 'Lex Rex (Prawo jest Królem)',
        originalScript: 'שֹׁפְטִים',
        transliteration: 'shoftim',
        strongCode: 'H8199',
        definition: 'Zasada konstytucyjna głosząca, że władca i rząd podlegają prawu Bożemu, a nie stoją ponad nim.',
        biblicalContext: 'Zapobiega tyranii i absolutyzmowi państwowemu; fundament praworządności zachodniej.',
        keyVerses: [
          { ref: 'Pwt 17:19', text: 'I będzie ją miał przy sobie, i będzie ją czytał przez wszystkie dni swego życia, aby uczył się bać PANA, swego Boga.' }
        ],
        tags: ['Lex Rex', 'Praworządność', 'Władza'],
        category: 'spoleczenstwo'
      },
      {
        id: 'isonomia',
        term: 'Isonomia (Równość Wobec Prawa)',
        originalScript: 'מִשְׁפָּט אֶחָד',
        transliteration: 'mishpat echad',
        strongCode: 'H4941 / H259',
        definition: 'Zasada jednakowego traktowania wszystkich obywateli przez prawo i sądy bez względu na majątek, urodzenie, rasę czy pozycję polityczną.',
        biblicalContext: '„Jedno prawo będzie dla was – zarówno dla przybysza, jak i dla tubylca” (Kpł 24:22).',
        keyVerses: [
          { ref: 'Kpł 24:22', text: 'Jednakowe prawo będzie dla was, zarówno dla cudzoziemca, jak i dla rodaka.' }
        ],
        tags: ['Równość', 'Prawo', 'Sądy'],
        category: 'spoleczenstwo'
      },
      {
        id: 'klauzula-sumienia',
        term: 'Sprzeciw Sumienia (Prawo do Oporu)',
        originalScript: 'πειθαρχεῖν',
        transliteration: 'peitharchein',
        strongCode: 'G3980',
        definition: 'Niezbywalne prawo człowieka do odmowy wykonania rozkazu lub przepisu prawa nakazującego popełnienie czynu wewnętrznie złego i sprzecznego z wolą Bożą.',
        biblicalContext: 'Postawa położnych egipskich (Wj 1), trzech młodzieńców w piecu ognistym (Dn 3) oraz Apostołów przed Sanhedrynem (Dz 5:29).',
        keyVerses: [
          { ref: 'Dz 5:29', text: 'Trzeba bardziej słuchać Boga niż ludzi.' }
        ],
        tags: ['Sumienie', 'Opór', 'Wolność Religijna'],
        category: 'etyka'
      }
    ]
  },

  // 5. SEKS
  {
    id: 'seks',
    title: 'CCN Małżeństwo – Boży Zamysł dla Małżeństwa, Narzeczeństwo i Czystość | Christian Culture',
    shortTitle: 'CCN Małżeństwo & Czystość',
    brandSubtitle: 'Boży zamysł dla intymności • Narzeczeństwo i wierność • Neurobiologia a pornografia • Uzdrowienie w Chrystusie',
    canonical: 'https://polskieradio.cc/seks',
    description: 'Boży zamysł dla seksualności, małżeństwa i narzeczeństwa. Neurobiologia i duchowe skutki pornografii, biblijna prawda o tożsamości kobiety i mężczyzny oraz droga uwolnienia i uświęcenia w Chrystusie.',
    badge: 'CZYSTOŚĆ',
    accentColor: '#e11d48',
    categories: [
      { id: 'home', label: 'Wszystkie' },
      { id: 'malzenstwo', label: 'Małżeństwo & Przymierze' },
      { id: 'narzeczenstwo', label: 'Narzeczeństwo & Czystość' },
      { id: 'pornografia', label: 'Pornografia & Neurobiologia' },
      { id: 'tozsamosc', label: 'Prawda o Tożsamości' },
      { id: 'leksykon', label: 'Leksykon Małżeński' },
      { id: 'about', label: 'O dziale' }
    ],
    tickerItems: [
      'Małżeństwo: Przymierze jednego mężczyzny i jednej kobiety na całe życie (Rdz 2:24) – Boży archetyp bezpiecznej miłości i rodziny',
      'Neurobiologia: Badania fMRI potwierdzają: pornografia degraduje receptory dopaminy D2 i niszczy zdolność do budowania więzi',
      'Czystość: Narzeczeństwo oparte na czystości przedmałżeńskiej stanowi najlepszy naukowy predyktor trwałego, szczęśliwego związku',
      'Łaska: 1 Kor 6:11: „I takimi niektórzy z was byli, lecz zostaliście obmyci, uświęceni i usprawiedliwieni w Panu Jezusie”'
    ],
    articles: [

      {
        id: 'art-z-biblia-za-pan-brat-dzien-03',
        title: 'Gdzie jesteś? Anatomia upadku i pierwsza Ewangelia Edenu',
        slug: 'gdzie-jestes-anatomia-upadku-i-pierwsza-ewangelia-edenu',
        excerpt: 'W ramach globalnego programu „Z Biblią za Pan Brat” analizujemy przełomowy trzeci rozdział Księgi Rodzaju — mechanizm pokusy, ucieczkę człowieka i Bożą Protewangelię.',
        category: 'wiara',
        categoryLabel: 'Z BIBLIĄ ZA PAN BRAT · ROZWAŻANIE DNIA',
        publishedAt: '2026-10-03T06:00:00Z',
        dateFormatted: '3 października 2026',
        imageUrl: 'https://polskieradio.cc/images/academy/daily/kc_day_03_fall.jpg',
        imageCaption: 'Księga Rodzaju 3: Bóg przychodzi szukać człowieka i ogłasza pierwszą obietnicę Zbawiciela.',
        readTimeMinutes: 5,
        isHero: false,
        isPopular: false,
        tags: ['Z Biblią za Pan Brat', 'Księga Rodzaju', 'Rdz 3', 'Protewangelia', 'Cezary Rogowski'],
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        scriptureReference: {
          verse: 'Księga Rodzaju 3:15',
          text: 'I ustanowię nieprzyjaźń między tobą a kobietą, między twoim potomstwem a jej potomstwem; ono zrani ci głowę, a ty zranisz mu piętę.',
          strongCode: 'H2233'
        },
        content: [
          'Czy zauważasz, jak często w momentach trudności lub własnych potknięć Twój pierwszy odruch nie prowadzi do Boga, lecz do lęku i ukrywania się?',
          'Zatrzymaj się na progu trzeciego dnia naszej wspólnej wędrówki w Księdze Rodzaju i zbadaj z całą surowością stan swojego serca. Wypowiedz przed Ojcem to bezkompromisowe pytanie: Tato, dlaczego mój język i moje myśli tak często ulegają podszeptom zwątpienia w Twoją dobroć, zamiast bezwzględnie ufać Twojemu Słowu?',
          'Wchodząc dzisiaj w trzeci rozdział Księgi Rodzaju, stajemy w obliczu dramatu upadku człowieka, ale i niesamowitego, poruszającego poszukiwania ze strony Stwórcy. Kiedy człowiek zgrzeszył, spletł liście figowe i uciekł w cień drzew, to nie człowiek zawołał Boga – to Bóg przerwał milczenie i zadał najgłębsze pytanie w historii ludzkości: „Gdzie jesteś?”.'
        ]
      },
      {
        id: 'seks-bozy-zamysl',
        title: 'Boży zamysł dla intymności i małżeństwa: Jak przymierze chroni miłość i godność',
        slug: 'bozy-zamysl-dla-malzenstwa-i-intymnosci',
        excerpt: 'Seksualność jako święty dar Stwórcy przeznaczony do wyłącznego przymierza męża i żony. Radość intymności w Pieśni nad Pieśniami.',
        content: [
          'Chrześcijaństwo wbrew obiegowym mitom nigdy nie uważało cielesności za złą – przeciwnie, to Bóg stworzył człowieka jako istotę seksualną i pobłogosławił intymność małżeńską, nazywając ją „bardzo dobrą” (Rdz 1:31). Cała księga biblijna – Pieśń nad Pieśniami – jest poetyckim hymnem na cześć zmysłowej miłości i zachwytu ciałem współmałżonka.',
          'Kluczem jest jednak Boża granica: przymierze małżeńskie (hebr. Berit). Gdy intymność jest przeżywana w bezpiecznych ramach wyłącznej, dozgonnej wierności jednego mężczyzny i jednej kobiety (Rdz 2:24, Mt 19:4-6), staje się źródłem najgłębszego zjednoczenia duszy i ciała („jedno ciało” – Basar Echad).',
          'Wyrwana z przymierza, zamienia się w egoistyczną konsumpcję, która rani serce, wywołuje poczucie pustki i niszczy zdolność do ufania. Pismo mówi jednoznacznie: „Małżeństwo niech będzie we czci u wszystkich, a łoże nieskalane” (Hbr 13:4).'
        ],
        scriptureReference: {
          verse: 'Księga Rodzaju 2:24',
          text: 'Dlatego opuści mężczyzna ojca swego i matkę swoją i złączy się ze swoją żoną, i będą dwoje jednym ciałem.',
          strongCode: 'H1692 (dabaq - przylgnąć, złączyć się nierozerwalnie) / H1320 (basar) / H259 (echad - jeden)'
        },
        category: 'malzenstwo',
        categoryLabel: 'Małżeństwo & Przymierze',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-10-02T09:30:00Z',
        dateFormatted: '2 października 2026',
        imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'Święte przymierze małżeńskie – jedność dusz i ciał przed Bogiem.',
        readTimeMinutes: 7,
        isHero: true,
        isPopular: true,
        popularRank: 1,
        tags: ['Małżeństwo', 'Intymność', 'Przymierze', 'Rdz 2:24', 'Czystość']
      },
      {
        id: 'seks-pornografia-neurobiologia',
        title: 'Plaga pornografii i degradacja mózgu: Neurobiologia uzależnienia a wolność w Chrystusie',
        slug: 'pornografia-a-neurobiologia-mozgu-droga-do-wolnosci',
        excerpt: 'Badania rezonansem fMRI wykazują atrofię receptorów dopaminy D2 i kurczenie się istoty szarej w korze przedczołowej pod wpływem pornografii. Droga do uzdrowienia.',
        content: [
          'Pornografia internetowa nie jest „nieszkodliwą rozrywką”, lecz jedną z najgroźniejszych trucizn neurologicznych współczesności. Zalewa mózg nienaturalnymi dawkami dopaminy (supernormal stimuli), wywołując mechanizm tolerancji, znieczulicy emocjonalnej i eskalacji w stronę coraz bardziej dewiacyjnych i agresywnych treści.',
          'Skutkiem na poziomie biologicznym jest atrofia receptorów dopaminowych D2, zaburzenia erekcji u młodych mężczyzn (PIED), zanik empatii i niemożność odczuwania radości w realnej relacji z żoną. Kobieta zostaje w umyśle zredukowana do pikselowego obiektu zaspokojenia.',
          'Pismo Święte diagnozowało ten proces z precyzją skalpela: „Każdy, kto patrzy na kobietę, aby jej pożądać, już popełnił z nią cudzołóstwo w swoim sercu” (Mt 5:28). Dobra Nowina polega na tym, że dzięki neuroplastyczności mózgu i nadprzyrodzonej łasce Ducha Świętego (Rz 12:2) całkowite uwolnienie i odnowa umysłu są w 100% możliwe!'
        ],
        scriptureReference: {
          verse: 'Ewangelia wg św. Mateusza 5:28',
          text: 'Każdy, kto patrzy na kobietę, aby jej pożądać, już popełnił z nią cudzołóstwo w swoim sercu.',
          strongCode: 'G1937 (epithymeo - pożądać z egoizmem) / G3431 (moicheuo - cudzołożyć)'
        },
        category: 'pornografia',
        categoryLabel: 'Pornografia & Neurobiologia',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-10-01T16:00:00Z',
        dateFormatted: '1 października 2026',
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 6,
        isHero: true,
        isPopular: true,
        popularRank: 2,
        tags: ['Pornografia', 'Neurobiologia', 'Dopamina', 'Wolność', 'Uzdrowienie']
      },
      {
        id: 'seks-czystosc-narzeczenska',
        title: 'Czystość narzeczeńska: Dlaczego wstrzemięźliwość przed ślubem jest dowodem prawdziwej miłości',
        slug: 'czystosc-narzeczenska-wstrzemiezliwosc-przed-slubem',
        excerpt: 'Statystyki socjologiczne: pary zachowujące czystość przedmałżeńską wykazują o 60% niższą stopę rozwodów i znacznie wyższy poziom zadowolenia ze współżycia po ślubie.',
        content: [
          'Świat wmawia młodym ludziom, że przed ślubem trzeba „sprawdzić dopasowanie seksualne”. Badania socjologiczne pokazują dokładnie odwrotny wniosek: pary, które współżyły lub mieszkały razem przed ślubem (tzw. efekt kohabitacji), mają drastycznie wyższe ryzyko rozwodu i zdrady.',
          'Dlaczego? Ponieważ seks przed ślubem działa jak emocjonalny klej maskujący brak prawdziwej dojrzałości, różnice wartości i niezdolność do rozwiązywania konfliktów. Wstrzemięźliwość pozwala narzeczonym poznać się na poziomie ducha, intelektu, charakteru i przyjaźni.',
          'Apostoł Paweł pisał do Tesaloniczan: „Taka jest bowiem wola Boża, wasze uświęcenie, abyście powstrzymywali się od nierządu; aby każdy z was umiał utrzymać swoje naczynie w świętości i w szacunku, nie w namiętności pożądania...” (1 Tes 4:3-5).'
        ],
        scriptureReference: {
          verse: '1 List do Tesaloniczan 4:3-4',
          text: 'Taka jest bowiem wola Boża, wasze uświęcenie, abyście powstrzymywali się od nierządu.',
          strongCode: 'G38 (hagiasmos - uświęcenie) / G4202 (porneia - wszelki nierząd)'
        },
        category: 'narzeczenstwo',
        categoryLabel: 'Narzeczeństwo & Czystość',
        author: {
          id: 'wioletta-rogowska',
          name: 'Wioletta Rogowska',
          role: 'Współzałożycielka Christian Culture',
          avatarUrl: '/avatar_wioletta_official.jpg'
        },
        publishedAt: '2026-09-29T14:30:00Z',
        dateFormatted: '29 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 5,
        tags: ['Narzeczeństwo', 'Czystość', 'Wstrzemięźliwość', 'Świętość']
      },
      {
        id: 'seks-ideologie-gender-biblia',
        title: 'Współczesne ideologie gender i homoseksualizm w świetle Pisma: Prawda w miłości',
        slug: 'ideologie-gender-homoseksualizm-w-swietle-biblii',
        excerpt: 'Niezmienne nauczanie Słowa Bożego (Rz 1:26-27, 1 Kor 6:9-10). Odrzucenie grzechu przy jednoczesnym otwarciu ramion Chrystusa dla każdego zmagającego się człowieka.',
        content: [
          'Żyjemy w epoce bezprecedensowego zamętu tożsamościowego, w której biologiczna prawda o męskości i kobiecości jest podważana przez ideologie gender i redefinicję małżeństwa.',
          'Pismo Święte od pierwszych do ostatnich stron naucza z kryształową jasnością: „Stworzył więc Bóg człowieka na swój obraz... stworzył ich jako mężczyznę i kobietę” (Rdz 1:27). Praktyki homoseksualne są w Biblii jednoznacznie nazwane odejściem od Bożego porządku natury (Rz 1:26-27, Kpł 18:22, 1 Kor 6:9-10).',
          'Jednocześnie chrześcijanin powołany jest do głoszenia Prawdy w Miłości (Ef 4:15). Osoby zmagające się z dysforią płciową czy pociągiem do osób tej samej płci nie są wrogami, lecz ludźmi poranionymi, dla których Chrystus przelał krew, oferując uzdrowienie, tożsamość Dziecka Bożego i moc do czystego życia.'
        ],
        scriptureReference: {
          verse: 'List do Rzymian 1:26-27',
          text: 'Kobiety ich bowiem zamieniły naturalne obcowanie na przeciwne naturze. Podobnie i mężczyźni, porzuciwszy naturalne obcowanie z kobietą...',
          strongCode: 'G5446 (physikos - naturalny, zgodny z zamysłem Boga) / G3844 (para physin - wbrew naturze)'
        },
        category: 'tozsamosc',
        categoryLabel: 'Prawda o Tożsamości',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-09-27T11:00:00Z',
        dateFormatted: '27 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 6,
        tags: ['Tożsamość', 'Rz 1', 'Mężczyzna i Kobieta', 'Prawda w Miłości']
      },
      {
        id: 'seks-swiadectwo-uwalniania',
        title: '„I takimi niektórzy z was byli”: Świadectwo uzdrowienia i wolności w Chrystusie',
        slug: 'i-takimi-byliscie-swiadectwo-uzdrowienia-1-kor-6',
        excerpt: 'Moc ewangelii w wyzwalaniu z nałogów seksualnych, perwersji i zranień emocjonalnych. Uświęceni krwią Baranka.',
        content: [
          'Szatan wmawia człowiekowi uwikłanemu w nałogi seksualne, dewiacje czy nieuporządkowane pragnienia, że „taki już jest” i nie ma dla niego ratunku. To kłamstwo.',
          'W 1 Liście do Koryntian apostoł Paweł po wymienieniu listy grzechów seksualnych zapisuje jedne z najbardziej wyzwalających słów w całej literaturze: „I takimi niektórzy z was byli; ale zostaliście obmyci, ale zostaliście uświęceni, ale zostaliście usprawiedliwieni w imię Pana Jezusa i przez Ducha naszego Boga” (1 Kor 6:11).',
          'Słowo „byliście” w czasie przeszłym oznacza, że tożsamością wierzącego nie jest jego przeszły grzech czy upadła skłonność, lecz nowe stworzenie w Chrystusie (2 Kor 5:17). Tysiące świadectw mężczyzn i kobiet uwolnionych z pornografii, rozwiązłości i homoseksualizmu poświadcza żywą moc zmartwychwstałego Jezusa.'
        ],
        scriptureReference: {
          verse: '1 List do Koryntian 6:11',
          text: 'I takimi niektórzy z was byli; ale zostaliście obmyci, uświęceni, usprawiedliwieni.',
          strongCode: 'G628 (apolouo - całkowicie obmyć) / G37 (hagiazo - uświęcić) / G1344 (dikaioo - usprawiedliwić)'
        },
        category: 'tozsamosc',
        categoryLabel: 'Prawda o Tożsamości',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        publishedAt: '2026-09-24T15:30:00Z',
        dateFormatted: '24 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 5,
        tags: ['Uwolnienie', 'Świadectwo', '1 Kor 6:11', 'Nowe Stworzenie']
      },
      {
        id: 'seks-ochrona-dzieci',
        title: 'Ochrona dzieci przed przedwczesną seksualizacją: Prawa rodziców a presja mediów',
        slug: 'ochrona-dzieci-przed-seksualizacja-rola-rodzicow',
        excerpt: 'Jak chronić niewinność dzieci w erze smartfonów i propagandy szkolnej. Biblijny model wychowania do skromności i szacunku.',
        content: [
          'Pan Jezus wypowiedział najostrzejsze słowa w Ewangeliach pod adresem tych, którzy niszczą czystość najmłodszych: „Kto zaś zgorszy jednego z tych małych, którzy we mnie wierzą, lepiej byłoby dla niego, aby kamień młyński zawieszono mu na szyi...” (Mt 18:6).',
          'Współczesna presja wczesnej inicjacji seksualnej, łatwy dostęp do pornografii w smartfonach i programy tzw. permisywnej edukacji seksualnej odbierają dzieciom niewinność i niszczą ich psychikę.',
          'Pierwszorzędne prawo i obowiązek wychowania dzieci spoczywa na rodzicach. Wprowadzenie filtrów rodzicielskich, otwarta rozmowa o Bożej świętości ciała oraz budowanie klimatu zaufania w domu to kluczowe tarcze ochronne dla młodego pokolenia.'
        ],
        scriptureReference: {
          verse: 'Ewangelia wg św. Mateusza 18:6',
          text: 'Kto zaś zgorszy jednego z tych małych, którzy we mnie wierzą, lepiej byłoby dla niego, aby kamień młyński zawieszono mu na szyi.',
          strongCode: 'G4624 (skandalizo - zwieść, doprowadzić do upadku)'
        },
        category: 'narzeczenstwo',
        categoryLabel: 'Narzeczeństwo & Czystość',
        author: {
          id: 'wioletta-rogowska',
          name: 'Wioletta Rogowska',
          role: 'Współzałożycielka Christian Culture',
          avatarUrl: '/avatar_wioletta_official.jpg'
        },
        publishedAt: '2026-09-21T09:00:00Z',
        dateFormatted: '21 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=1200&q=80',
        readTimeMinutes: 5,
        tags: ['Dzieci', 'Wychowanie', 'Ochrona Czystości', 'Rodzina']
      }
    ],
    lexicon: [
      {
        id: 'berit-malzenstwo',
        term: 'Berit (Przymierze Małżeńskie)',
        originalScript: 'בְּרִית',
        transliteration: 'berit',
        strongCode: 'H1285',
        definition: 'Święte, dozgonne i wiążące przymierze zawarte przed Bogiem między jednym mężczyzną a jedną kobietą.',
        biblicalContext: 'Małżeństwo nie jest świeckim kontraktem, lecz świętym przymierzem odzwierciedlającym miłość Chrystusa do Kościoła (Księga Malachiasza 2:14, Efezjan 5:31-32).',
        keyVerses: [
          { ref: 'Ml 2:14', text: 'PAN był świadkiem między tobą a żoną twojej młodości... jest ona twoją towarzyszką i żoną twojego przymierza.' }
        ],
        tags: ['Małżeństwo', 'Przymierze', 'Wierność'],
        category: 'teologia'
      },
      {
        id: 'basar-echad',
        term: 'Basar Echad (Jedno Ciało)',
        originalScript: 'בָּשָׂר אֶחָד',
        transliteration: 'basar echad',
        strongCode: 'H1320 / H259',
        definition: 'Głęboka, nierozerwalna jedność fizyczna, emocjonalna i duchowa męża i żony zapoczątkowana przez akt małżeński.',
        biblicalContext: 'Boży archetyp intymności wykluczający poligamię, rozwód i zdrady (Księga Rodzaju 2:24).',
        keyVerses: [
          { ref: 'Rdz 2:24', text: 'I złączy się ze swoją żoną, i będą dwoje jednym ciałem.' }
        ],
        tags: ['Jedno Ciało', 'Intymność', 'Rdz 2:24'],
        category: 'oryginal'
      },
      {
        id: 'porneia',
        term: 'Porneia (Nierząd / Nieczystość)',
        originalScript: 'πορνεία',
        transliteration: 'porneia',
        strongCode: 'G4202',
        definition: 'Wszelkie formy nieczystości seksualnej poza związkiem małżeńskim kobiety i mężczyzny (w tym pornografia, prostytucja, seks przedmałżeński i zdrada).',
        biblicalContext: 'Nowy Testament nakazuje zdecydowaną ucieczkę od porneia, gdyż ciało wierzącego jest Świątynią Ducha Świętego (1 Kor 6:18-19).',
        keyVerses: [
          { ref: '1 Kor 6:18', text: 'Uciekajcie od nierządu! Wszelki grzech, jaki popełnia człowiek, jest poza ciałem; lecz kto uprawia nierząd, grzeszy przeciwko własnemu ciału.' }
        ],
        tags: ['Porneia', 'Czystość', 'Nowy Testament'],
        category: 'etyka'
      },
      {
        id: 'katharos',
        term: 'Katharos (Czystość Serca)',
        originalScript: 'καθαρός',
        transliteration: 'katharos',
        strongCode: 'G2513',
        definition: 'Czystość wewnętrzna, nieskalaność intencji, motywów i wzroku umożliwiająca oglądanie Boga i życie w Jego obecności.',
        biblicalContext: 'Błogosławieni czystego serca, albowiem oni Boga oglądać będą (Ewangelia Mateusza 5:8).',
        keyVerses: [
          { ref: 'Mt 5:8', text: 'Błogosławieni czystego serca, albowiem oni Boga oglądać będą.' }
        ],
        tags: ['Czystość', 'Błogosławieństwa', 'Serce'],
        category: 'etyka'
      },
      {
        id: 'hagiasmos',
        term: 'Hagiasmos (Uświęcenie)',
        originalScript: 'ἁγιασμός',
        transliteration: 'hagiasmos',
        strongCode: 'G38',
        definition: 'Proces przemiany umysłu, serca i ciała przez Ducha Świętego, oddzielający człowieka od nieczystości świata ku świętości Boga.',
        biblicalContext: 'Boża wola dla każdego wierzącego, obejmująca czystość seksualną i panowanie nad własnymi żądzami (1 Tesaloniczan 4:3).',
        keyVerses: [
          { ref: '1 Tes 4:3', text: 'Taka jest bowiem wola Boża, wasze uświęcenie, abyście powstrzymywali się od nierządu.' }
        ],
        tags: ['Uświęcenie', 'Świętość', 'Duch Święty'],
        category: 'teologia'
      },
      {
        id: 'apolouo',
        term: 'Apolouo (Całkowite Obmycie i Odnowa)',
        originalScript: 'ἀπολούω',
        transliteration: 'apolouo',
        strongCode: 'G628',
        definition: 'Akt Bożego miłosierdzia zmywający wszelki brud grzechu, winy i wstydu przez wiarę w krew Jezusa Chrystusa.',
        biblicalContext: 'Nawet najgłębsze nałogi i dewiacje przeszłości zostają całkowicie wymazane w Chrystusie (1 Koryntian 6:11).',
        keyVerses: [
          { ref: '1 Kor 6:11', text: 'I takimi niektórzy z was byli; ale zostaliście obmyci, ale zostaliście uświęceni.' }
        ],
        tags: ['Przebaczenie', 'Łaska', 'Oczyszczenie'],
        category: 'teologia'
      }
    ]
  },
  {
    id: 'biblioteka',
    title: 'CCN Biblioteka – Książki, Audiobooki, E-booki Chrześcijańskie | Christian Culture',
    shortTitle: 'CCN Biblioteka & Literatura',
    brandSubtitle: 'Książki Papierowe i Cyfrowe • Audiobooki • E-booki • Klasyka Wiary i Prawda Pisma Świętego',
    canonical: 'https://polskieradio.cc/biblioteka',
    description: 'Chrześcijańska Biblioteka Medialna Christian Culture. Książki, bezpłatne e-booki (PDF/EPUB), profesjonalne audiobooki i słuchowiska biblijne, dzieła klasyków wiary i komentarze teologiczne.',
    badge: 'BIBLIOTEKA',
    accentColor: '#bb142e',
    categories: [
      { id: 'home', label: 'Wszystkie zbiory' },
      { id: 'ksiazki', label: 'Książki' },
      { id: 'audiobooki', label: 'Audiobooki & Słuchowiska' },
      { id: 'ebooki', label: 'E-booki (PDF/EPUB)' },
      { id: 'klasyka', label: 'Klasyka Wiary' },
      { id: 'dzieci', label: 'Dzieci & Młodzież' },
      { id: 'leksykon', label: 'Katalog & Recenzje' },
      { id: 'about', label: 'O Bibliotece' }
    ],
    tickerItems: [
      'BIBLIA JAKUBA WUJKA (BJW): Kompletny tekst Dekalogu z Księgi Wyjścia 20,1–17 (wyd. III 1962 r.) w zbiorach CCN Biblioteka',
      'NOWOŚĆ 2026: „Pokonać Goliata” Cezarego Rogowskiego — bezpłatny e-book EPUB/PDF + Generator Mocy TTS dostępny teraz na polskieradio.cc/pokonac-goliata',
      'Biblioteka Cyfrowa CC: Ponad 100 bezpłatnych e-booków i komentarzy biblijnych dostępnych do pobrania',
      'Audiobooki & Słuchowiska: Nowe profesjonalne nagrania Pisma Świętego i arcydzieł literatury chrześcijańskiej',
      'Klasyka Reformacji: Dzieła Johna Bunyana, C.H. Spurgeona i C.S. Lewisa w wiernych przekładach',
      'Czytelnictwo z Wartościami: Buduj mądrość serca na fundamencie natchnionego Słowa Bożego'
    ],
    articles: [
      {
            "id": "art-dzien-reformacji-2026-wrocmy-do-pisma-i-ewangelii-laski",
            "title": "Reformacja nie skończyła się w 1517 roku — wróćmy do Pisma i Ewangelii łaski",
            "slug": "dzien-reformacji-2026-wrocmy-do-pisma-i-ewangelii-laski",
            "excerpt": "Dziś, 31 października 2026 roku, przypada Dzień Reformacji. Mija 509 lat od 1517 roku, gdy Marcin Luter ogłosił 95 tez w Wittenberdze. Dlaczego Sola Scriptura i Sola Gratia pozostają żywym wezwaniem do przemiany serca i sumienia? Obejrzyj film „Luter” na Christian Culture TV.",
            "category": "klasyka",
            "categoryLabel": "CCN BIBLIOTEKA • KLASYKA WIARY",
            "publishedAt": "2026-10-31T08:00:00Z",
            "dateFormatted": "31 października 2026",
            "imageUrl": "/images/news/art-dzien-reformacji-2026.jpg",
            "imageCaption": "31 października: 509. rocznica Reformacji. Wittenberga 1517 r. i powrót do autorytetu Słowa Bożego.",
            "readTimeMinutes": 8,
            "isHero": true,
            "isPopular": true,
            "popularRank": 1,
            "tags": [
                  "Dzień Reformacji",
                  "Reformacja",
                  "Marcin Luter",
                  "Sola Scriptura",
                  "Sola Gratia",
                  "Historia Kościoła",
                  "Cezary Rogowski",
                  "Wittenberga",
                  "Wormacja",
                  "Pismo Święte",
                  "Film Luter"
            ],
            "author": {
                  "id": "cezary-rogowski",
                  "name": "Cezary Rogowski",
                  "role": "Założyciel Christian Culture",
                  "status": "Żonaty",
                  "avatarUrl": "/avatar_cezary_official.jpg",
                  "bio": "Założyciel ekosystemu Christian Culture oraz portalu Lumina i stacji Polskie Radio CC."
            },
            "youtubeVideoId": "lug1BNspb8k",
            "videoUrl": "https://youtu.be/lug1BNspb8k",
            "scriptureReference": {
                  "verse": "List do Rzymian 1:16–17",
                  "text": "Nie wstydzę się bowiem ewangelii Chrystusa, ponieważ jest ona mocą Boga ku zbawieniu dla każdego, kto wierzy (...) Sprawiedliwy zaś z wiary żyć będzie.",
                  "strongCode": "G1343"
            },
            "lexiconTerms": [
                  {
                        "term": "Sola Scriptura (2 Tm 3:16–17)",
                        "strongCode": "G2315",
                        "definition": "Zasada nadrzędnego autorytetu natchnionego Pisma Świętego (theopneustos — tchnięte przez Boga) jako jedynej nieomylnej normy wiary i życia chrześcijańskiego."
                  },
                  {
                        "term": "Sola Gratia (Ef 2:8–9)",
                        "strongCode": "G5485",
                        "definition": "Usprawiedliwienie i zbawienie człowieka jako całkowicie darmowy, niezasłużony dar Bożej łaski (charis) przyjmowany przez wiarę w Chrystusa, nie z ludzkich zasług."
                  }
            ],
            "biblicalCommentary": {
                  "thesis": "Prawdziwa Reformacja to powrót do Chrystusa i uświęcenie codziennego sumienia",
                  "explanation": "Odnowa Kościoła i osobistej wiary nie polega na podtrzymywaniu plemiennych wojen religijnych sprzed stuleci, lecz na odwadze podporządkowania własnego życia i przekonań prawdzie Pisma Świętego.",
                  "verses": [
                        {
                              "ref": "Rz 1:16–17",
                              "text": "Sprawiedliwy z wiary żyć będzie."
                        },
                        {
                              "ref": "Ef 2:8–10",
                              "text": "Łaską bowiem jesteście zbawieni przez wiarę (...) stworzeni w Chrystusie Jezusie do dobrych uczynków."
                        },
                        {
                              "ref": "2 Tm 3:16–17",
                              "text": "Całe Pismo przez Boga jest natchnione i pożyteczne do nauki, do strofowania, do poprawy, do wychowania w sprawiedliwości."
                        },
                        {
                              "ref": "Ap 14:6–7",
                              "text": "I widziałem innego anioła lecącego środkiem nieba, mającego wieczną Ewangelię, aby ją zwiastować mieszkańcom ziemi."
                        }
                  ]
            },
            "resourceLinks": [
                  {
                        "label": "Obejrzyj pełnometrażowy film „Luter” na Christian Culture TV (YouTube)",
                        "url": "https://youtu.be/lug1BNspb8k"
                  },
                  {
                        "label": "Interlinearna MojaBiblia CC — Badaj teksty oryginalne ze Strongiem",
                        "url": "https://polskieradio.cc/mojabiblia"
                  },
                  {
                        "label": "Akademia Biblijna — Kurs Codzienny „Z Biblią za Pan Brat”",
                        "url": "https://polskieradio.cc/akademia/kurscodzienny"
                  }
            ],
            "content": [
                  "Dziś, 31 października 2026 roku, przypada Dzień Reformacji. Mija 509 lat od 1517 roku, gdy Marcin Luter ogłosił 95 tez dotyczących odpustów. Dzień ten zwyczajowo upamiętnia początek ruchu, który zmienił oblicze zachodniego chrześcijaństwa. Czy jest to jednak tylko rocznica wydarzenia sprzed pięciu stuleci? A może również okazja, by postawić sobie pytanie, czy moja własna wiara potrzebuje odnowy?",
                  "Wydaje mi się, że prawdziwe dziedzictwo Reformacji nie polega na nieustannym sporze o to, kto zwyciężył w XVI wieku. Polega na odwadze sprawdzania własnych przekonań w świetle Pisma i powracania do Jezusa Chrystusa. Nie potrzebujemy kolejnego święta religijnego pozbawionego przemiany serca. Potrzebujemy prawdy, która dotyka naszego codziennego postępowania.",
                  "[KADR: /images/news/luter-film-plakat-pionowy.jpg | Film „Luter” (2003, reż. Eric Till) z Josephem Fiennesem w roli Marcina Lutra — opowieść o człowieku, który w poszukiwaniu pokoju z Bogiem zmienił bieg dziejów Europy.]",
                  "1. Co naprawdę wydarzyło się w Wittenberdze?",
                  "Luter był augustiańskim zakonnikiem i profesorem teologii. Jego 95 tez otworzyło dyskusję o odpustach, pokucie i nadużyciach religijnych. Początkowo nie były gotowym programem stworzenia osobnego Kościoła. Dzięki drukowi kontrowersja szybko rozprzestrzeniła się daleko poza Wittenbergę.",
                  "Tradycyjna scena przybicia tez do drzwi kościoła stała się symbolem; szczegóły tego gestu pozostają przedmiotem historycznej dyskusji. Samo rozpowszechnienie tez i rosnący spór są dobrze poświadczone. Reformacja przyniosła szerszy dostęp do Biblii, nowe formy nauczania oraz istotną debatę o zbawieniu. Jej historia obejmowała także bolesne podziały i przemoc. Nie służy prawdzie przemilczanie ani osiągnięć, ani błędów ludzi po którejkolwiek stronie.",
                  "[KADR: /images/news/luter-film-kadr-staupitz-klasztor.jpg | Zmagania młodego mnicha w murach klasztoru w Erfurcie: Johann von Staupitz kieruje uwagę udręczonego Lutra z własnej niedoskonałości ku miłości i ofierze Jezusa Chrystusa.]",
                  "2. Sola Scriptura — czy Słowo naprawdę ma ostatnie słowo?",
                  "Reformacyjna zasada Sola Scriptura nie oznacza lekceważenia historii czy mądrości innych chrześcijan. Oznacza, że Pismo pozostaje najwyższym autorytetem dla nauki wiary. Apostoł Paweł wskazuje na jego rolę w nauczaniu, napominaniu i wychowaniu w sprawiedliwości (2 Tm 3,16–17), a Berejczycy sprawdzają głoszone im nauczanie przez badanie Pism (Dz 17,11).",
                  "Zadaję sobie trudne pytanie: czy otwieram Biblię po to, aby Bóg mógł skorygować moje poglądy, czy szukam jedynie wersetów, które je potwierdzą? Reformacja jest żywa tam, gdzie człowiek ma odwagę powiedzieć: „Panie, jeśli się mylę, naucz mnie Twojej prawdy”.",
                  "[KADR: /images/news/luter-film-kadr-wormacja-1521.jpg | Słynna obrona na Sejmie w Wormacji w 1521 roku przed cesarzem Karolem V: „Moje sumienie jest pojmane w Słowie Bożym. Odwołać niczego nie mogę i nie chcę. Tu stoję, inaczej nie mogę, niech mi Bóg dopomoże. Amen”.]",
                  "3. Solus Christus i Sola Gratia — centrum, którego nie wolno zgubić",
                  "Lutrowi towarzyszyło pytanie, jak grzeszny człowiek może zostać uznany za sprawiedliwego przed Bogiem. Rz 1,16–17 ukazuje Ewangelię jako moc Bożą ku zbawieniu, a Rz 3,21–26 przedstawia usprawiedliwienie przez odkupienie w Jezusie Chrystusie.",
                  "Ef 2,8–10 daje nam niezwykle ważną kolejność: zostajemy zbawieni łaską przez wiarę, nie na podstawie naszych uczynków; zostajemy jednak stworzeni w Chrystusie do dobrych czynów. Łaska nie jest więc nagrodą za religijną doskonałość. Jest niezasłużonym darem, który prowadzi do przemienionego życia.",
                  "Nie uratują mnie pieniądze, dobre uczynki rozumiane jako zapłata za zbawienie ani opinia innych o mojej pobożności. Jedynym Pośrednikiem jest Chrystus (1 Tm 2,5). Tylko Jemu należy się chwała. A moja wiara powinna wydawać owoce uczciwości, miłości i odpowiedzialności.",
                  "[KADR: /images/news/luter-film-kadr-fryderyk-madry.jpg | Książę saski Fryderyk Mądry (w filmie wybitna rola Sir Petera Ustinova) — władca, który chronił wolność myśli i dał schronienie Lutrowi na zamku w Wartburgu, umożliwiając przetłumaczenie Nowego Testamentu na język ojczysty.]",
                  "4. Od reformy instytucji do reformy mojego sumienia",
                  "Znacznie łatwiej oceniać pomyłki ludzi sprzed pięciuset lat niż własne. Jezus przypomina jednak, że można zachować religijną formę i zaniedbywać sprawiedliwość, miłosierdzie i wierność (Mt 23,23–28).",
                  "Jeśli mówię o Biblii, a oszukuję w interesach, potrzebuję reformy. Jeśli głoszę miłość, a upokarzam bliskich, potrzebuję reformy. Jeśli wzywam innych do pokuty, ale sam nie chcę przyznać się do winy, moje hasła są puste.",
                  "Prawdziwa odnowa oznacza przyznanie prawdy, zaprzestanie krzywdy i podjęcie odpowiedzialności. Nikt nie zostaje zbawiony przez własną moralną sprawność, ale łaska Chrystusa nigdy nie jest usprawiedliwieniem hipokryzji (Tt 2,11–14).",
                  "[KADR: /images/news/luter-film-kadr-rebel-genius.jpg | Prawdziwe przesłanie Reformacji to nie spór polityczny, lecz osobista przemiana życia w blasku Bożej łaski.]",
                  "5. Wieczna Ewangelia dla współczesnego świata",
                  "Ap 14,6–7 przedstawia wieczną Ewangelię głoszoną wszystkim narodom, językom i ludom. W jej centrum jest wezwanie do oddawania czci Stwórcy. To ważne przypomnienie, że reforma wiary nie kończy się na nowych strukturach organizacyjnych i polemikach. Prowadzi do żywej relacji z Bogiem.",
                  "Nie trzeba dopasowywać każdej bieżącej wiadomości do proroctwa, aby zachować biblijną czujność. Chrześcijanin ma szukać prawdy i żyć nią z miłością oraz nadzieją. Świat potrzebuje przede wszystkim Ewangelii Jezusa Chrystusa, a nie kolejnego religijnego konfliktu prowadzonego dla prestiżu.",
                  "6. Obejrzyj film „Luter” na Christian Culture TV",
                  "Z okazji Dnia Reformacji zapraszam Cię do obejrzenia filmu „Luter – człowiek, który zmienił oblicze Kościoła”, udostępnionego z polskim lektorem na kanale Christian Culture TV.",
                  "Film „Luther” z 2003 roku, wyreżyserowany przez Erica Tilla, przedstawia duchowe zmagania reformatora i wydarzenia prowadzące do Reformacji. W roli tytułowej występuje Joseph Fiennes. Film jest dramatem historycznym, a nie dokumentem, dlatego warto traktować go jako zachętę do dalszego poznawania historii i Pisma Świętego.",
                  "Zobacz cały film z polskim lektorem bezpośrednio pod adresem: https://youtu.be/lug1BNspb8k lub w powyższym oknie odtwarzacza.",
                  "Zaproś rodzinę lub znajomych, a po seansie przeczytajcie razem Rz 1,16–17 oraz Ef 2,8–10. Zastanówcie się: na czym opieramy pewność zbawienia? Co oznacza wolność w Chrystusie? Czy moja religijność pozostaje otwarta na korektę Słowa Bożego?",
                  "7. Reformacja zaczyna się dziś",
                  "Nie chcę, żeby 31 października był tylko datą w kalendarzu. Chciałbym, aby stał się dniem osobistej decyzji. Wróćmy do Biblii. Nie udawajmy bezbłędnych. Przyjmijmy zbawienie z łaski, a następnie uczmy się żyć w sposób godny Ewangelii.",
                  "Modlitwa na Dzień Reformacji: Panie Jezu, daj nam pokorę wobec Twojego Słowa, odwagę do odrzucenia obłudy, miłość do ludzi o innych przekonaniach i wdzięczność za Twoją łaskę. Niech odnowa zacznie się we mnie. Amen.",
                  "Podsumowanie Redakcyjne CCN News: Dzień Reformacji 2026 to zaproszenie do osobistego rachunku sumienia i oparcia życia na niewzruszonym fundamencie Pisma Świętego. Wszystkie publikacje, słuchowiska i materiały Christian Culture są w 100% bezpłatne. Pełny film z polskim lektorem dostępny jest na Christian Culture TV (YouTube: lug1BNspb8k)."
            ]
      },
      {
        "id": "art-dekalog-dziesiec-przykazan-bozych-wujek-bjw",
        "title": "Dziesięć przykazań Bożych wg Biblii w tł. ks. Jakuba Wujka (BJW)",
        "slug": "dziesiec-przykazan-bozych-biblia-jakub-wujek-bjw-dekalog",
        "excerpt": "Księga Wyjścia 20,1–17 w klasycznym, natchnionym przekładzie ks. Jakuba Wujka (wyd. III 1962 r.). Poznaj autentyczne, nienaruszone brzmienie Dekalogu — z biblijnym zakazem kultu obrazów rytych oraz uświęceniem dnia siódmego (sabatu).",
        "content": [
                "„I mówił Bóg wszystkie te słowa, rzekłszy: Jam jest Pan, Bóg twój, który cię wywiódł z ziemi egipskiej, z domu niewoli” (Księga Wyjścia 20,1–2, Biblia w przekładzie Ks. Jakuba Wujka, wyd. III 1962 r.).",
                "Prezentujemy autentyczny, pełny tekst Dziesięciu Przykazań Bożych dokładnie według natchnionego tekstu Pisma Świętego w historycznym przekładzie ks. Jakuba Wujka (BJW):",
                "I. Nie będziesz miał bogów cudzych przede mną.",
                "II. Nie uczynisz sobie obrazu rytego ani żadnej podobizny tego, co jest na niebie w górze i co na ziemi nisko, ani z tych rzeczy, które są w wodach pod ziemią. Nie będziesz się im kłaniał ani służył. Ja jestem Pan, Bóg twój, mocny, zawistny, karzący nieprawość ojców na synach do trzeciego i czwartego pokolenia tych, którzy mnie nienawidzą; a czyniący miłosierdzie tysiącom tych, którzy mię miłują i strzegą przykazań moich.",
                "III. Nie będziesz brał imienia Pana, Boga twego, nadaremno; bo nie będzie miał Pan za niewinnego tego, który by wziął imię Pana, Boga swego, nadaremno.",
                "IV. Pamiętaj, abyś dzień sobotni święcił. Sześć dni robic będziesz i będziesz wykonywał wszystkie roboty twoje; ale dnia siódmego sabat Pana, Boga twego, jest: nie będziesz wykonywał weń żadnej roboty, ty i syn twój, i córka twoja, sługa twój i służebnica twoja, bydlę twoje i gość, który jest między bramami twymi. Przez sześć dni bowiem czynił Pan niebo i ziemię, i morze, i wszystko, co w nich jest, a odpoczął dnia siódmego; i dlatego pobłogosławił Pan dniowi sobotniemu i poświęcił go.",
                "V. Czcij ojca twego i matkę twoją, abyś długo żył na ziemi, którą Pan, Bóg twój, da tobie.",
                "VI. Nie będziesz zabijał.",
                "VII. Nie będziesz cudzołożył.",
                "VIII. Nie będziesz kradzieży czynił.",
                "IX. Nie będziesz mówił fałszywego świadectwa przeciw bliźniemu twemu.",
                "X. Nie będziesz pożądał domu bliźniego twego, ani będziesz pragnął żony jego, ani sługi, ani służebnicy, ani wołu, ani osła, ani żadnej rzeczy, która jego jest.",
                "(Księga Wyjścia 20,1-17, Biblia w przekładzie Ks. Jakuba Wujka, wyd.III 1962r.)",
                "KOMENTARZ REDAKCYJNY — CEZARY ROGOWSKI:",
                "Przekład ks. Jakuba Wujka z 1599 roku (oraz zrewidowane wydanie III z 1962 r.) to nie tylko monumentalny zabytek polszczyzny, ale przede wszystkim wierne świadectwo integralności Słowa Bożego. Tekst ten bez żadnych retuszy zachowuje pełne, natchnione brzmienie Dekalogu.",
                "Współczesna kultura religijna przyzwyczaiła wielu wiernych do skróconych formuł katechizmowych, w których z reguły całkowicie usunięte zostaje drugie przykazanie o zakazie kultu obrazów i posągów, a przykazanie czwarte o sabacie sprowadzone jest do ogólnego nakazu święcenia dni świętych. Aby uzupełnić brakujące przykazanie do liczby dziesięciu, dziesiąte przykazanie o pożądaniu zostało rozdzielone na dwa odrębne punkty.",
                "Pismo Święte w Księdze Wyjścia 20:1–17 ukazuje jednak Dekalog jako nierozerwalną całość Przymierza. Sam Zbawiciel, Jezus Chrystus, podkreślił w Ewangelii wg św. Mateusza (5:17–19), że ani jedna jota, ani jedna kreska nie przeminie z Zakonu. Apostoł Jakub napisał: „Ktokolwiek bowiem zachowa cały Zakon, a uchybi w jednym, stał się winnym wszystkich” (Jk 2:10).",
                "Dekalog ogłoszony na Synaju wyznacza wieczne standardy sprawiedliwości i miłości. Pierwsze cztery przykazania regulują naszą relację z Bogiem — Jego wyłączność, zakaz bałwochwalstwa, cześć dla Jego Imienia oraz odpoczynek sabatowy na pamiątkę Stworzenia. Kolejnych sześć przykazań chroni rodzinę, życie, wierność małżeńską, własność, prawdę i czystość ludzkiego serca.",
                "Jako Christian Culture stajemy na gruncie nieskażonego Słowa Bożego, zachęcając każdego czytelnika do osobistego sięgnięcia po Pismo Święte i weryfikowania każdej nauki w świetle natchnionego tekstu Biblii."
        ],
        "scriptureReference": {
                "verse": "Księga Wyjścia 20:1–17",
                "text": "I mówił Bóg wszystkie te słowa, rzekłszy: Jam jest Pan, Bóg twój, który cię wywiódł z ziemi egipskiej, z domu niewoli.",
                "strongCode": "H1697 (Aseret ha-Dvarim — Dziesięć Przykazań) / H8451 (Torah — Prawo Boże)"
        },
        "sourceCitation": {
                "sourceName": "Biblia w przekładzie Ks. Jakuba Wujka, wyd. III 1962r.",
                "sourceUrl": "https://polskieradio.cc/prawo",
                "quotationDate": "Wydanie III z 1962 r.",
                "originalTitle": "Dziesięć przykazań Bożych wg Biblii w tł. ks. Jakuba Wujka (Wj 20,1-17)"
        },
        "category": "klasyka",
        "categoryLabel": "PISMO ŚWIĘTE · PRZEKŁAD KS. JAKUBA WUJKA (BJW)",
        "author": {
                "id": "cezary-rogowski",
                "name": "Cezary Rogowski",
                "role": "Założyciel Christian Culture",
                "status": "Żonaty",
                "avatarUrl": "/avatar_cezary_official.jpg",
                "bio": "Założyciel ekosystemu Christian Culture oraz portalu Lumina i stacji Polskie Radio CC."
        },
        "publishedAt": "2026-10-14T19:30:00Z",
        "dateFormatted": "14 października 2026",
        "imageUrl": "/images/news/art-dekalog-dziesiec-przykazan-wujek.jpg",
        "imageCaption": "Ilustracja AI: Tablice Przymierza na Górze Synaj w majestatycznym świetle poranka (ilustracja poglądowa wygenerowana z pomocą AI — nie przedstawia opisywanego wydarzenia).",
        "readTimeMinutes": 6,
        "isHero": false,
        "isPopular": true,
        "popularRank": 3,
        "tags": [
                "Dekalog",
                "Dziesięć Przykazań",
                "Biblia Jakuba Wujka",
                "BJW",
                "Księga Wyjścia 20",
                "Prawo Boże",
                "Sabat",
                "Synaj",
                "Cezary Rogowski"
        ]
},
      {
        id: 'art-pokonac-goliata-recenzja-2026',
        title: '„Pokonać Goliata — Jak zwyciężać własne słabości” Cezarego Rogowskiego: Recenzja i Platforma Cyfrowa 2026',
        slug: 'pokonac-goliata-cezary-rogowski-recenzja-ebook-generator-mocy',
        excerpt: 'Nowe Wydanie 2026 chrześcijańskiego bestsellera Cezarego Rogowskiego. Osiem praktycznych kroków do wolności od nałogów, lęków i grzechu — teraz z interaktywnym czytnikiem, Generatorem Mocy TTS, e-bookiem EPUB i PDF do bezpłatnego pobrania na polskieradio.cc/pokonac-goliata.',
        category: 'leksykon',
        categoryLabel: 'KATALOG & RECENZJE · KSIĄŻKI CC',
        publishedAt: '2026-10-06T12:00:00Z',
        dateFormatted: '6 października 2026',
        imageUrl: '/assets/pokonac-goliata-book-3d.webp',
        imageCaption: 'Pokonać Goliata — Nowe Wydanie 2026. Autor: Cezary Rogowski, Założyciel Christian Culture.',
        readTimeMinutes: 8,
        isHero: true,
        isPopular: true,
        popularRank: 1,
        tags: ['Pokonać Goliata', 'Cezary Rogowski', 'E-book', 'EPUB', 'PDF', 'Generator Mocy TTS', 'Recenzja', 'Wydanie 2026'],
        externalUrl: 'https://polskieradio.cc/pokonac-goliata',
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        scriptureReference: {
          verse: '1 Księga Samuela 17:45',
          text: 'Ty idziesz na mnie z mieczem, z oszczepem i z włócznią, a ja idę na ciebie w imieniu Pana Zastępów, Boga wojsk izraelskich, którym urągałeś!',
          strongCode: 'H3068 (JHWH Sabaot — Pan Zastępów)'
        },
        content: [
          '„Pokonać Goliata — Jak zwyciężać własne słabości” to osobiste świadectwo i praktyczny przewodnik Cezarego Rogowskiego, Założyciela ekosystemu Christian Culture. Nowe Wydanie 2026 zostało poszerzone o materiały cyfrowe, interaktywny czytnik e-book i Generator Mocy TTS — unikatowe narzędzie czytające każdy rozdział na głos przy użyciu polskiego lektora AI.',
          'Książka oparta jest na biblijnej historii Dawida i Goliata (1 Sm 17) i prowadzi czytelnika przez osiem praktycznych kroków: od Świadomości i Wiary, przez Modlitwę i Słowo Boże, aż po Wytrwałość, Zapobieganie, Miłość Bożą i ostateczną Nagrodę wolności. Każdy krok jest oparty na osobistym doświadczeniu autora oraz konkretnych fragmentach Pisma Świętego z kodami Stronga.',
          'Recenzja redakcji CCN Biblioteka: Cezary Rogowski pisze z niezwykłą odwagą szczerości — nie ukrywa własnych „goliatów” (nałóg palenia, depresja, zniewolenie grzechem), ale pokazuje dokładnie, jak w mocy Jezusa Chrystusa zostały pokonane. To nie akademicki traktat teologiczny, lecz żywe świadectwo, które trafia prosto w serce człowieka zmagającego się z tym, z czym po ludzku nie może sobie poradzić.',
          'Platforma „Pokonać Goliata” (polskieradio.cc/pokonac-goliata) oferuje bezpłatny czytnik e-book z 10 rozdziałami w pełnym tekście, Generator Mocy TTS z polskim lektorem AI czytającym każdy krok, pobieranie PDF Premium (5.5 MB) i EPUB E-Book (8.9 MB) oraz opcję wsparcia misji przez Revolut. Każdy, kto szuka drogi z niewoli do wolności — znajdzie tu konkretne narzędzia i żywe Słowo Boże.'
        ]
      },
      {
        id: 'art-wedrowka-pielgrzyma',
        title: '„Wędrówka Pielgrzyma” Johna Bunyana: Kompletne Słuchowisko Audio i E-book PDF',
        slug: 'wedrowka-pielgrzyma-john-bunyan-sluchowisko-audio-ebook-pdf',
        excerpt: 'Ponadczasowe arcydzieło literatury chrześcijańskiej opisujące drogę chrześcijanina z Miasta Zagłady do Niebiańskiego Syjonu. Kompletne słuchowisko wielogłosowe i darmowy e-book do pobrania.',
        category: 'audiobooki',
        categoryLabel: 'AUDIOBOOKI & SŁUCHOWISKA · KLASYKA',
        publishedAt: '2026-10-03T10:00:00Z',
        dateFormatted: '3 października 2026',
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'Alegoria drogi wiary – od ciężaru grzechu u stóp Krzyża po bramy Miasta Niebiańskiego.',
        readTimeMinutes: 12,
        isHero: false,
        isPopular: true,
        popularRank: 2,
        tags: ['Wędrówka Pielgrzyma', 'John Bunyan', 'Audiobook', 'E-book', 'Klasyka Wiary', 'Cezary Rogowski'],
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        scriptureReference: {
          verse: 'Ewangelia Mateusza 7:13-14',
          text: 'Wchodźcie przez ciasną bramę; albowiem szeroka jest brama i przestronna droga, która prowadzi na zatracenie, a wielu jest takich, którzy przez nią wchodzą. A ciasna jest brama i wąska droga, która prowadzi do żywota, a mało jest takich, którzy ją znajdują.',
          strongCode: 'G4646 (stenos - ciasna, wymagająca zaparcia się siebie)'
        },
        content: [
          '„Wędrówka Pielgrzyma” (The Pilgrim’s Progress) Johna Bunyana, napisana w celi więzienia w Bedford w 1678 roku, pozostaje po Biblii najbardziej poczytną i przekładaną książką w historii chrześcijaństwa. Bunyan, więziony przez 12 lat za bezkompromisowe głoszenie Ewangelii bez zezwolenia państwowego, stworzył alegorię, która od ponad trzech stuleci prowadzi wierzących przez meandry duchowej walki.',
          'Główny bohater, Pielgrzym (wcześniej zwany Bezbożnikiem), opuszcza Miasto Zagłady z księgą w dłoni i olbrzymim brzemieniem na plecach. Jego droga przez Błoto Zwątpienia, Wzgórze Trudności, Dolinę Cienia Śmierci oraz Targowisko Próżności ukazuje realne niebezpieczeństwa, jakie czyhają na każdego ucznia Chrystusa.',
          'W ramach inicjatywy Biblioteki Medialnej Christian Culture z radością oddajemy w Państwa ręce kompletne, profesjonalne słuchowisko wielogłosowe z nastrojową oprawą symfoniczną oraz cyfrowe wydanie książki w formatach PDF i EPUB. Materiały są dostępne całkowicie bezpłatnie na chwałę Bożą.',
          'Niech ta niezwykła lektura i słuchowisko staną się dla Państwa źródłem niezłomnej odwagi, przypominając, że nasz ciężar spada na zawsze tylko u stóp Krzyża Zbawiciela, a na końcu wąskiej drogi czeka wieczne powitanie w obecności Króla Chwały.'
        ]
      },
      {
        id: 'art-z-biblia-za-pan-brat-dzien-03',
        title: 'Gdzie jesteś? Anatomia upadku i pierwsza Ewangelia Edenu',
        slug: 'gdzie-jestes-anatomia-upadku-i-pierwsza-ewangelia-edenu',
        excerpt: 'W ramach globalnego programu „Z Biblią za Pan Brat” analizujemy przełomowy trzeci rozdział Księgi Rodzaju — mechanizm pokusy, ucieczkę człowieka i Bożą Protewangelię.',
        category: 'wiara',
        categoryLabel: 'Z BIBLIĄ ZA PAN BRAT · ROZWAŻANIE DNIA',
        publishedAt: '2026-10-03T06:00:00Z',
        dateFormatted: '3 października 2026',
        imageUrl: 'https://polskieradio.cc/images/academy/daily/kc_day_03_fall.jpg',
        imageCaption: 'Księga Rodzaju 3: Bóg przychodzi szukać człowieka i ogłasza pierwszą obietnicę Zbawiciela.',
        readTimeMinutes: 5,
        isHero: false,
        isPopular: false,
        tags: ['Z Biblią za Pan Brat', 'Księga Rodzaju', 'Rdz 3', 'Protewangelia', 'Cezary Rogowski'],
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        scriptureReference: {
          verse: 'Księga Rodzaju 3:15',
          text: 'I ustanowię nieprzyjaźń między tobą a kobietą, między twoim potomstwem a jej potomstwem; ono zrani ci głowę, a ty zranisz mu piętę.',
          strongCode: 'H2233'
        },
        content: [
          'Czy zauważasz, jak często w momentach trudności lub własnych potknięć Twój pierwszy odruch nie prowadzi do Boga, lecz do lęku i ukrywania się?',
          'Zatrzymaj się na progu trzeciego dnia naszej wspólnej wędrówki w Księdze Rodzaju i zbadaj z całą surowością stan swojego serca. Wypowiedz przed Ojcem to bezkompromisowe pytanie: Tato, dlaczego mój język i moje myśli tak często ulegają podszeptom zwątpienia w Twoją dobroć, zamiast bezwzględnie ufać Twojemu Słowu?',
          'Wchodząc dzisiaj w trzeci rozdział Księgi Rodzaju, stajemy w obliczu dramatu upadku człowieka, ale i niesamowitego, poruszającego poszukiwania ze strony Stwórcy. Kiedy człowiek zgrzeszył, spletł liście figowe i uciekł w cień drzew, to nie człowiek zawołał Boga – to Bóg przerwał milczenie i zadał najgłębsze pytanie w historii ludzkości: „Gdzie jesteś?”.'
        ]
      },
      {
        id: 'art-z-biblia-za-pan-brat-tom-1',
        title: '„Z Biblią za Pan Brat” Tom I: Od Stworzenia do Abrahama (Księga Rodzaju 1–12)',
        slug: 'z-biblia-za-pan-brat-tom-1-od-stworzenia-do-abrahama',
        excerpt: 'Książkowy podręcznik codziennego studium biblijnego werset po wersecie. Hebrajskie rdzenie słów, kody Stronga, kontekst kulturowy i praktyczne zastosowanie w życiu współczesnego chrześcijanina.',
        category: 'ksiazki',
        categoryLabel: 'KSIĄŻKI · STUDIUM BIBLIJNE',
        publishedAt: '2026-10-02T14:00:00Z',
        dateFormatted: '2 października 2026',
        imageUrl: '/images/academy/daily/kc_day_01_creation.jpg',
        imageCaption: 'Kompendium wiedzy biblijnej – powrót do autorytetu natchnionego tekstu Pisma Świętego.',
        readTimeMinutes: 8,
        isHero: false,
        isPopular: true,
        popularRank: 2,
        tags: ['Z Biblią za Pan Brat', 'Księga Rodzaju', 'Studium Biblijne', 'Książki', 'Cezary Rogowski'],
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        scriptureReference: {
          verse: 'Księga Rodzaju 1:1',
          text: 'Na początku stworzył Bóg niebiosa i ziemię.',
          strongCode: 'H7225 (Bereszit - na początku) / H1254 (Bara - stworzył z niczego)'
        },
        content: [
          'Tom I serii podręczników „Z Biblią za Pan Brat” to owoc wieloletnich badań nad oryginalnym tekstem hebrajskim oraz praktycznym wymiarem codziennego uświęcenia. Książka przeprowadza czytelnika przez pierwsze dwanaście rozdziałów Księgi Rodzaju, kładąc trwały fundament pod zrozumienie całego Pisma Świętego.',
          'W publikacji drobiazgowo omówiono zagadnienia kosmologiczne (Creatio ex nihilo), antropologiczne (człowiek stworzony na Boży obraz i podobieństwo – Imago Dei), tajemnicę upadku i obietnicę Zbawiciela, a także potop Noego i przymierze z Abrahamem.',
          'Książka została wyposażona w interlinearne zestawienia wersetów, odnośniki do konkordancji Stronga oraz pytania do osobistej introspekcji. Jest to niezastąpiona pomoc dla kaznodziejów, liderów grup domowych oraz każdego poszukiwacza prawdy pragnącego poznać Boga osobiście.'
        ]
      },
      {
        id: 'art-biblia-audio-psalmy',
        title: 'Księga Psalmów – Biblia Audio CC w Przekładzie Uwspółcześnionej Biblii Gdańskiej',
        slug: 'ksiega-psalmow-biblia-audio-cc-przeklad-ubg',
        excerpt: '150 Psalmów Dawidowych nagranych z najwyższą dbałością o czystość dykcji, akustykę i wierność natchnionemu Słowu. Studyjne słuchowisko do modlitwy, medytacji i odpoczynku.',
        category: 'audiobooki',
        categoryLabel: 'AUDIOBOOKI · SŁOWO BOŻE',
        publishedAt: '2026-10-01T16:00:00Z',
        dateFormatted: '1 października 2026',
        imageUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'Psałterz Dawidowy – uniwersalna pieśń ludzkiego serca wołającego do Stwórcy.',
        readTimeMinutes: 10,
        isHero: false,
        isPopular: true,
        popularRank: 3,
        tags: ['Psalmy', 'Biblia Audio', 'Audiobook', 'UBG', 'Modlitwa', 'Cezary Rogowski'],
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        scriptureReference: {
          verse: 'Księga Psalmów 23:1-2',
          text: 'PAN jest moim pasterzem, niczego mi nie braknie. Na zielonych niwach daje mi odpoczynek, prowadzi mnie nad spokojne wody.',
          strongCode: 'H7462 (Raah - paść, chronić, przewodzić)'
        },
        content: [
          'Księga Psalmów to najintymniejsza część Pisma Świętego — modlitewnik, w którym radość przeplata się z lamentem, a wołanie z głębokości rozpaczy zawsze znajduje odpowiedź w niezmiennej wierności Przymierza Bożego.',
          'W studiu nagraniowym Christian Culture zrealizowaliśmy kompletne nagranie wszystkich 150 Psalmów na podstawie tekstu Uwspółcześnionej Biblii Gdańskiej (UBG). Lektura została zrealizowana w spokojnym, dostojnym tempie, z zachowaniem naturalnych oddechów i subtelnym podkładem akustycznym nastrojonym do częstotliwości 432 Hz.',
          'Nagranie jest dostępne do bezpłatnego odsłuchu na naszej platformie radiowej oraz do pobrania w bezstratnych plikach audio dla wszystkich członków społeczności LUMINA.'
        ]
      },
      {
        id: 'art-wielki-boj-ebook',
        title: '„Wielki Bój”: Prawda o Zmaganiach Dobra i Zła w Dziejach Świata (Pobierz PDF & EPUB)',
        slug: 'wielki-boj-prawda-o-zmaganiach-dobra-i-zla-ebook',
        excerpt: 'Fascynująca i bezkompromisowa panorama historii chrześcijaństwa od zburzenia Jerozolimy, przez wieki średnie i Reformację, aż po kulminację proroctw biblijnych czasów ostatecznych.',
        category: 'ebooki',
        categoryLabel: 'E-BOOKI (PDF/EPUB) · HISTORIA I PROROCTWA',
        publishedAt: '2026-09-30T11:00:00Z',
        dateFormatted: '30 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'Światło prawdy rozpraszające mroki wieków – od waldensów i Husa po triumf Ewangelii.',
        readTimeMinutes: 15,
        isHero: false,
        isPopular: true,
        popularRank: 4,
        tags: ['Wielki Bój', 'E-book', 'Proroctwa', 'Reformacja', 'Historia Kościoła', 'Wioletta Rogowska'],
        author: {
          id: 'wioletta-rogowska',
          name: 'Wioletta Rogowska',
          role: 'Współzałożycielka Christian Culture',
          avatarUrl: '/avatar_wioletta_official.jpg'
        },
        scriptureReference: {
          verse: 'Księga Objawienia 12:11',
          text: 'A oni zwyciężyli go przez krew Baranka i przez słowo swego świadectwa, i nie miłowali swego życia aż do śmierci.',
          strongCode: 'G3528 (nikao - zwyciężać, triumfować w prawdzie)'
        },
        content: [
          '„Wielki Bój” to jedno z najważniejszych dzieł opisujących niewidzialny dla ludzkich oczu konflikt duchowy, który rozgrywa się za kurtyną wydarzeń politycznych, religijnych i społecznych naszej cywilizacji.',
          'Książka rozpoczyna się dramatycznym opisem oblężenia i upadku Jerozolimy w 70 roku n.e., ukazując wierność chrześcijan, którzy posłuszni ostrzeżeniu Chrystusa ocalili swoje życie. Następnie czytelnik wędruje przez wieki prześladowań, poznając wierność waldensów w alpejskich dolinach, odwagę Jana Husa na stosie w Konstancji oraz przełomowe wystąpienie Marcina Lutra w Wormacji.',
          'W końcowych rozdziałach autorka w precyzyjny sposób odnosi proroctwa Księgi Daniela i Objawienia do wyzwań współczesnego świata: wolności sumienia, prawa Bożego oraz powtórnego przyjścia Chrystusa w chwale.',
          'Oddajemy do Państwa dyspozycji zoptymalizowany pod kątem czytników e-booków plik EPUB oraz elegancko sformatowany plik PDF z przypisami i indeksem biblijnym.'
        ]
      },
      {
        id: 'art-o-nasladowaniu-chrystusa',
        title: '„O naśladowaniu Chrystusa” Tomasza à Kempis: O Pokoju Serca i Pogardzie Pychy Świata',
        slug: 'o-nasladowaniu-chrystusa-tomasz-a-kempis',
        excerpt: 'Klasyczny podręcznik wewnętrznego życia chrześcijańskiego. Jak w hałaśliwym świecie zachować czystość sumienia, pokorę i niewzruszony pokój w obecności Boga.',
        category: 'klasyka',
        categoryLabel: 'KLASYKA WIARY · DUCHOWOŚĆ',
        publishedAt: '2026-09-28T09:00:00Z',
        dateFormatted: '28 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'Cicha komora serca – poszukiwanie jedynej prawdy, która przewyższa wszelką ludzką wiedzę.',
        readTimeMinutes: 7,
        isHero: false,
        isPopular: false,
        tags: ['O naśladowaniu Chrystusa', 'Klasyka Wiary', 'Pokora', 'Modlitwa', 'Cezary Rogowski'],
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        scriptureReference: {
          verse: 'Ewangelia Jana 8:12',
          text: 'Ja jestem światłością świata. Kto idzie za mną, nie będzie chodził w ciemności, ale będzie miał światłość żywota.',
          strongCode: 'G5457 (phos - światłość czysta i życiodajna)'
        },
        content: [
          'Napisana na początku XV wieku książka „O naśladowaniu Chrystusa” (De Imitatione Christi) jest po dziś dzień jednym z najbardziej przejmujących świadectw tęsknoty duszy za Bogiem. W epoce kryzysu autorytetów i powierzchownej religijności, à Kempis wzywa do radykalnego powrotu do prostoty serca.',
          '„Cóż ci pomoże wysokie rozprawianie o Trójcy Świętej, jeśli brak ci pokory, przez co nie podobasz się Trójcy Świętej?” — pyta autor w pierwszych zdaniach swojego traktatu. Przypomina, że wszelka wiedza teologiczna pozbawiona miłości i uświęcenia staje się jedynie zarzewiem pychy.',
          'W naszym wydaniu cyfrowym i opracowaniu audio skupiliśmy się na wyakcentowaniu biblijnych fundamentów tekstu, zestawiając poszczególne rozdziały z wersetami Nowego Testamentu. Jest to lektura, do której wraca się przez całe życie.'
        ]
      },
      {
        id: 'art-listy-starego-diabla-audiobook',
        title: '„Listy starego diabła do młodego” C.S. Lewisa: Audiobook z Biblijnym Komentarzem',
        slug: 'listy-starego-diabla-do-mlodego-cs-lewis-audiobook',
        excerpt: 'Błyskotliwa i głęboka psychologicznie satyra odsłaniająca subtelne mechanizmy kuszenia, zniechęcenia i religijnej obłudy, którymi wróg próbuje zniszczyć wiarę człowieka.',
        category: 'audiobooki',
        categoryLabel: 'AUDIOBOOKI · APOLOGETYKA',
        publishedAt: '2026-09-25T15:00:00Z',
        dateFormatted: '25 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'Mistrzowska apologetyka C.S. Lewisa – demaskowanie strategii zła w codziennym życiu.',
        readTimeMinutes: 9,
        isHero: false,
        isPopular: false,
        tags: ['C.S. Lewis', 'Listy starego diabła', 'Audiobook', 'Apologetyka', 'Cezary Rogowski'],
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        scriptureReference: {
          verse: '1 List Piotra 5:8',
          text: 'Bądźcie trzeźwi, czuwajcie, gdyż wasz przeciwnik, diabeł, jak lew ryczący krąży, szukając, kogo by pożreć.',
          strongCode: 'G3525 (nepho - zachować trzeźwy umysł, wolny od ułudy)'
        },
        content: [
          'W korespondencji doświadczonego demona Krętacza do młodego pachołka Piołuna, C.S. Lewis w genialny sposób odwrócił perspektywę, zmuszając czytelnika do spojrzenia na własne słabości i zaniedbania oczyma wroga.',
          'Okazuje się, że najgroźniejsze dla chrześcijanina nie są spektakularne grzechy, lecz ciche, drobne kompromisy: nawyk odkładania modlitwy na później, złośliwe myśli w trakcie nabożeństwa, osądzanie innych przy zachowaniu pozorów pobożności czy zapatrzenie w siebie.',
          'Nasze nagranie audio zostało wzbogacone o merytoryczny komentarz teologiczny po każdym z listów, wskazujący na biblijne antidotum: trzeźwość umysłu, wdzięczność, przebaczenie i nieustanne trwanie w łasce Chrystusa.'
        ]
      },
      {
        id: 'art-opowiesci-dolina-dobrej-nadziei',
        title: '„Opowieści z Doliny Dobrej Nadziei”: Ilustrowany Zbiór Opowiadań Biblijnych dla Dzieci',
        slug: 'opowiesci-z-doliny-dobrej-nadziei-dla-dzieci',
        excerpt: 'Ciepłe, budujące wiarę i prawe serce opowieści dla najmłodszych. Wierność Dawida, mądrość Salomona, odwaga Estery i bezwarunkowa miłość Pana Jezusa w przystępnej formie.',
        category: 'dzieci',
        categoryLabel: 'DZIECI & MŁODZIEŻ · OPOWIEŚCI Z MORAŁEM',
        publishedAt: '2026-09-22T13:00:00Z',
        dateFormatted: '22 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'Literatura dziecięca z wartościami – fundament prawdy, bezpieczeństwa i Bożej miłości.',
        readTimeMinutes: 6,
        isHero: false,
        isPopular: false,
        tags: ['Dzieci', 'Opowiadania Biblijne', 'E-book', 'Audiobook', 'Rodzina', 'Wioletta Rogowska'],
        author: {
          id: 'wioletta-rogowska',
          name: 'Wioletta Rogowska',
          role: 'Współzałożycielka Christian Culture',
          avatarUrl: '/avatar_wioletta_official.jpg'
        },
        scriptureReference: {
          verse: 'Księga Przysłów 22:6',
          text: 'Pouczaj dziecko w drodze, którą ma iść, a gdy się zestarzeje, nie odstąpi od niej.',
          strongCode: 'H2596 (Chanak - wychować, poświęcić, wdrożyć od małego)'
        },
        content: [
          'W dobie wszechobecnych cyfrowych bodźców i bajek pozbawionych głębszego sensu, książka „Opowieści z Doliny Dobrej Nadziei” powstała jako bezpieczna, czysta przystań dla serc dzieci i ich rodziców.',
          'Tomik zawiera 24 barwne historie, z których każda skupia się na jednej kluczowej wartości chrześcijańskiej: prawdomówności, posłuszeństwie rodzicom, dzieleniu się z potrzebującymi, wierności danemu słowu oraz zaufaniu Bogu w chwilach strachu.',
          'Wydanie elektroniczne zawiera duże, czytelne ilustracje oraz pytania do wspólnej wieczornej rozmowy rodziców z dziećmi. Do książki dołączony jest także audiobook czytany ciepłym głosem z delikatnym tłem kołysanek instrumentalnych.'
        ]
      },
      {
        id: 'art-przymierze-na-cale-zycie-ksiazka',
        title: '„Przymierze na Całe Życie”: Biblijny Przewodnik po Narzeczeństwie i Małżeństwie',
        slug: 'przymierze-na-cale-zycie-biblijny-przewodnik-malzenstwo',
        excerpt: 'Praktyczny podręcznik budowania trwałej, bezpiecznej i pełnej szacunku relacji małżeńskiej opartej na fundamencie Bożego przymierza, wierności i bezwarunkowej miłości agape.',
        category: 'ksiazki',
        categoryLabel: 'KSIĄŻKI · RODZINA I MAŁŻEŃSTWO',
        publishedAt: '2026-09-20T10:00:00Z',
        dateFormatted: '20 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'Świętość przymierza małżeńskiego – dar Bożej opatrzności chroniący rodzinę.',
        readTimeMinutes: 11,
        isHero: false,
        isPopular: false,
        tags: ['Małżeństwo', 'Rodzina', 'Czystość', 'Przymierze', 'Wioletta Rogowska'],
        author: {
          id: 'wioletta-rogowska',
          name: 'Wioletta Rogowska',
          role: 'Współzałożycielka Christian Culture',
          avatarUrl: '/avatar_wioletta_official.jpg'
        },
        scriptureReference: {
          verse: 'List do Efezjan 5:25',
          text: 'Mężowie, miłujcie swoje żony, jak i Chrystus umiłował kościół i wydał za niego samego siebie.',
          strongCode: 'G26 (Agape - miłość ofiarna, wierna, bezinteresowna)'
        },
        content: [
          'Książka „Przymierze na Całe Życie” stanowi odpowiedź na głęboki kryzys tożsamości małżeńskiej we współczesnym świecie. Autorka odrzuca świecki model małżeństwa opartego na zmiennych emocjach i umowie handlowej, przypominając Boży zamysł nierozerwalnego przymierza.',
          'W kolejnych rozdziałach omówiono przygotowanie do małżeństwa w okresie narzeczeństwa (z zachowaniem czystości przedmałżeńskiej), komunikację w sytuacjach kryzysowych, finanse domowe, wychowanie dzieci w wierze oraz pielęgnowanie intymności zgodnej z zamysłem Stwórcy.',
          'Książka zawiera praktyczne ćwiczenia dla par, wzorce modlitw małżeńskich oraz analizę najczęstszych pułapek, które prowadzą do ochłodzenia relacji.'
        ]
      },
      {
        id: 'art-komentarz-rzymian-ebook',
        title: 'Komentarz do Listu do Rzymian: Sprawiedliwość z Wiary i Tryumf Bożej Łaski (PDF)',
        slug: 'komentarz-do-listu-do-rzymian-sprawiedliwosc-z-wiary-pdf',
        excerpt: 'Gruntowne opracowanie teologiczne najważniejszego listu Apostoła Pawła. Wyczerpujące studium usprawiedliwienia z wiary, uświęcenia, suwerenności Boga i życia w Duchu Świętym.',
        category: 'ebooki',
        categoryLabel: 'E-BOOKI (PDF/EPUB) · TEOLOGIA',
        publishedAt: '2026-09-15T12:00:00Z',
        dateFormatted: '15 września 2026',
        imageUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'List do Rzymian – nieprzemijający fundament teologii apostolskiej i Reformacji.',
        readTimeMinutes: 14,
        isHero: false,
        isPopular: false,
        tags: ['List do Rzymian', 'Komentarz Teologiczny', 'E-book', 'Łaska', 'Cezary Rogowski'],
        author: {
          id: 'cezary-rogowski',
          name: 'Cezary Rogowski',
          role: 'Założyciel Christian Culture',
          avatarUrl: '/avatar_cezary_official.jpg'
        },
        scriptureReference: {
          verse: 'List do Rzymian 1:16-17',
          text: 'Nie wstydzę się bowiem ewangelii Chrystusa, ponieważ jest ona mocą Boga ku zbawieniu dla każdego, kto wierzy... Bo w niej objawia się sprawiedliwość Boga z wiary w wiarę, jak jest napisane: Sprawiedliwy będzie żył z wiary.',
          strongCode: 'G1343 (Dikaiosyne - sprawiedliwość Boża przypisana grzesznikowi)'
        },
        content: [
          'List do Rzymian od stuleci stanowił iskrę rozpalającą wielkie duchowe przebudzenia — to pod wpływem jego słów nawrócił się Augustyn, a Marcin Luter odkrył wyzwalającą prawdę o usprawiedliwieniu z samej łaski przez wiarę (Sola Gratia, Sola Fide).',
          'Niniejszy komentarz, przygotowany w zespole redakcyjnym pod kierunkiem Cezarego Rogowskiego, stanowi systematyczny wykład szesnastu rozdziałów listu. Autorzy krok po kroku wyjaśniają stan powszechnego zepsucia człowieka (rozdziały 1–3), Boże dzieło przebłagania na Krzyżu (rozdziały 3–5), walkę z cielesnością i zwycięskie życie w Duchu Świętym (rozdziały 6–8), Boży plan wobec Izraela (rozdziały 9–11) oraz etykę chrześcijańską w życiu społecznym (rozdziały 12–16).',
          'E-book jest dostępny w formacie PDF ze spisem treści, odnośnikami do kodów Stronga i aparatem krytycznym.'
        ]
      }
    ],
    lexicon: [
      {
        id: 'kanon-pisma',
        term: 'Kanon Pisma Świętego',
        originalScript: 'κανών',
        transliteration: 'kanon',
        strongCode: 'G2583',
        definition: 'Zamknięty zbiór 66 natchnionych ksiąg (39 Starego i 27 Nowego Testamentu), stanowiący jedyną i ostateczną regułę wiary i moralności.',
        biblicalContext: 'Pismo Święte jest samouwierzytelniającym się Słowem Bożym, do którego nikt nie ma prawa niczego dodawać ani ujmować (Objawienie 22:18-19).',
        keyVerses: [
          { ref: '2 Tm 3:16', text: 'Całe Pismo przez Boga jest natchnione i pożyteczne do nauki, do strofowania, do poprawy, do wychowania w sprawiedliwości.' }
        ],
        tags: ['Kanon', 'Natchnienie', 'Biblia'],
        category: 'teologia'
      },
      {
        id: 'apokryfy',
        term: 'Apokryfy i Pseudoepigrafy',
        originalScript: 'ἀπόκρυφος',
        transliteration: 'apokryphos',
        strongCode: 'G614',
        definition: 'Pisma pozakanoniczne powstałe w okresie międzytestamentalnym lub we wczesnym chrześcijaństwie, nieuznane przez Żydów ani apostołów za natchnione Słowo Boże.',
        biblicalContext: 'Chociaż niektóre apokryfy posiadają wartość historyczną, nie mogą stanowić źródła doktryny wiary.',
        keyVerses: [
          { ref: 'Przp 30:5-6', text: 'Każde słowo Boga jest czyste... Nie dodawaj nic do Jego słów, aby cię nie zganił i abyś nie okazał się kłamcą.' }
        ],
        tags: ['Apokryfy', 'Historia', 'Kanon'],
        category: 'teologia'
      },
      {
        id: 'qumran',
        term: 'Rękopisy z Qumran (Zwoje znad Morza Martwego)',
        originalScript: 'מגילות ים המלח',
        transliteration: 'Megilot Yam HaMelach',
        strongCode: 'H4405',
        definition: 'Odkryte w 1947 roku hebrajskie manuskrypty biblijne datowane od III w. p.n.e. do I w. n.e., potwierdzające niewiarygodną dokładność przekazu tekstu Biblii przez stulecia.',
        biblicalContext: 'Wielki Zwój Izajasza z Qumran jest w 99,5% identyczny z tekstem masoreckim powstałym tysiąc lat później, co dowodzi Bożej opatrzności nad tekstem Pisma.',
        keyVerses: [
          { ref: 'Iz 40:8', text: 'Trawa usycha, kwiat więdnie, ale słowo naszego Boga trwa na wieki.' }
        ],
        tags: ['Qumran', 'Archeologia', 'Manuskrypty'],
        category: 'oryginal'
      },
      {
        id: 'septuaginta',
        term: 'Septuaginta (LXX)',
        originalScript: 'Septuaginta',
        transliteration: 'LXX',
        strongCode: 'G1440',
        definition: 'Najstarszy przekład Starego Testamentu z języka hebrajskiego na grekę koine, sporządzony w Aleksandrii w III–II w. p.n.e., powszechnie cytowany przez apostołów w Nowym Testamencie.',
        biblicalContext: 'Septuaginta przygotowała świat śródziemnomorski na przyjęcie Ewangelii, dostarczając greckiego słownictwa teologicznego.',
        keyVerses: [
          { ref: 'Dz 8:32-33', text: 'A ustęp Pisma, który czytał, był ten: Jak owca na rzeź był prowadzony...' }
        ],
        tags: ['Septuaginta', 'Grekakoine', 'Przekład'],
        category: 'oryginal'
      },
      {
        id: 'interlinearny',
        term: 'Przekład Interlinearny',
        originalScript: 'Interlinear',
        definition: 'Tłumaczenie tekstu biblijnego słowo po słowie, umieszczające pod każdym oryginalnym słowem hebrajskim lub greckim jego dosłowne polskie znaczenie, formę gramatyczną i numer Stronga.',
        biblicalContext: 'Umożliwia każdemu czytelnikowi dotarcie do pierwotnego sensu natchnionego tekstu bez pośrednictwa interpretacji tłumaczy.',
        keyVerses: [
          { ref: 'Ps 119:160', text: 'Początkiem twego słowa jest prawda, a wszelki wyrok twojej sprawiedliwości trwa na wieki.' }
        ],
        tags: ['Interlinearny', 'Strong', 'Egzegeza'],
        category: 'oryginal'
      },
      {
        id: 'hermeneutyka',
        term: 'Hermeneutyka i Egzegeza Biblijna',
        originalScript: 'ἑρμηνεύω',
        transliteration: 'hermeneuo',
        strongCode: 'G2059',
        definition: 'Zbiór fundamentalnych zasad poprawnego odczytywania, interpretacji i wyjaśniania tekstu Pisma Świętego zgodnie z intencją natchnionego autora.',
        biblicalContext: 'Podstawową zasadą biblijnej hermeneutyki jest: Pismo interpretuje Pismo (Scriptura sacra sui ipsius interpres).',
        keyVerses: [
          { ref: '2 P 1:20-21', text: 'Wiedzcie przede wszystkim to, że żadne proroctwo Pisma nie podlega dowolnemu wykładowi. Albowiem proroctwo nie było przyniesione z woli ludzkiej, lecz święci Boży ludzie mówili natchnieni Duchem Świętym.' }
        ],
        tags: ['Hermeneutyka', 'Egzegeza', 'Zasady'],
        category: 'teologia'
      },
      {
        id: 'apologetyka',
        term: 'Apologetyka Chrześcijańska',
        originalScript: 'ἀπολογία',
        transliteration: 'apologia',
        strongCode: 'G627',
        definition: 'Dział teologii zajmujący się rozumną obroną prawdy chrześcijańskiej, historyczności Pisma Świętego oraz zmartwychwstania Jezusa Chrystusa.',
        biblicalContext: 'Chrześcijanin ma być zawsze gotów do rzeczowej i łagodnej obrony nadziei, która w nim jest (1 Piotra 3:15).',
        keyVerses: [
          { ref: '1 P 3:15', text: 'Pana Boga uświęcajcie w waszych sercach i bądźcie zawsze gotowi do obrony przed każdym, kto domaga się od was uzasadnienia nadziei, która jest w was.' }
        ],
        tags: ['Apologetyka', 'Obrona Wiary', 'Prawda'],
        category: 'teologia'
      },
      {
        id: 'solascriptura',
        term: 'Sola Scriptura (Tylko Pismo)',
        originalScript: 'Sola Scriptura',
        definition: 'Naczelna zasada Reformacji stanowiąca, że Pismo Święte jest jedynym nieomylnym, wystarczającym i ostatecznym autorytetem w sprawach wiary, doktryny i życia chrześcijanina.',
        biblicalContext: 'Wszelkie tradycje ludzkie, sobory i nauki muszą być bezwzględnie weryfikowane przez Słowo Boże.',
        keyVerses: [
          { ref: 'Iz 8:20', text: 'Do prawa i do świadectwa! Jeśli nie będą mówić według tego słowa, to dlatego, że nie ma w nich światła.' }
        ],
        tags: ['Sola Scriptura', 'Reformacja', 'Autorytet'],
        category: 'teologia'
      }
    ]
  },
];

// Export for consumption
module.exports = {
  LUMINA_ROOT,
  SCRATCH_ROOT,
  NEWS_SRC,
  VITE_BIN,
  PORTALS
};
