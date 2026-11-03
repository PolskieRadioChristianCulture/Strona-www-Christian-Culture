import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const articlesFilePath = path.join(ROOT, 'portals/ccn-news/src/data/articles.ts');
let code = fs.readFileSync(articlesFilePath, 'utf8');

const articleId = 'art-gdy-kamienie-wolaja-archeologia-jerozolima-ezechiasz-tel-dan';

if (code.includes(articleId)) {
  console.log(`ℹ️ Artykuł ${articleId} już istnieje w articles.ts — pomijam dopisywanie.`);
  process.exit(0);
}

const newArticleCode = `  {
    id: 'art-gdy-kamienie-wolaja-archeologia-jerozolima-ezechiasz-tel-dan',
    title: 'Gdy kamienie wołają w Jerozolimie: Jak bulla króla Ezechiasza, tunel Siloe i stela z Tel Dan weryfikują historię biblijną',
    slug: 'gdy-kamienie-wolaja-archeologia-jerozolima-ezechiasz-tel-dan',
    excerpt: 'Współczesna archeologia Bliskiego Wschodu weryfikuje minimalistyczne teorie kwestionujące historyczność monarchii judzkiej. Odkrycia w Jerozolimie i Galilei – w tym bulla Ezechiasza, stela z Tel Dan i akwedukt Siloe – dostarczają bezspornych dowodów na autentyczność relacji Ksiąg Królewskich.',
    content: [
      'Współczesna archeologia Bliskiego Wschodu coraz częściej weryfikuje minimalistyczne teorie kwestionujące historyczność biblijnych królów Judy i Izraela. Odkrycia w Jerozolimie i Galilei – w tym odnaleziona na Ofelu bulla z pieczęcią króla Ezechiasza, aramejska stela z Tel Dan oraz monumentalny podziemny akwedukt Siloe – dostarczają bezspornych, materialnych dowodów na autentyczność relacji Ksiąg Królewskich. W dobie wszechobecnego relatywizmu starożytne inskrypcje i warstwy stratygraficzne przypominają słowa Jezusa Chrystusa, że prawda o Bożym działaniu w historii nie da się uciszyć.',
      '1. Archeologiczny spór o historię: Minimalizm kontra fakty materialne',
      'Przez dziesięciolecia tzw. szkoła minimalistyczna w biblistyce twierdziła, że postacie Dawida, Salomona czy Ezechiasza były jedynie mitycznymi figurami stworzonymi w epoce perskiej lub hellenistycznej. Argumentowano, że rzekomy brak pozabiblijnych inskrypcji z epoki żelaza dowodzi fikcyjności Zjednoczonego Królestwa oraz wczesnej monarchii judzkiej.',
      'Jednak ostatnie trzy dekady intensywnych badań wykopaliskowych w Ziemi Świętej doprowadziły do radykalnej zmiany perspektywy naukowej. Zamiast literackich spekulacji badacze otrzymali do rąk twarde świadectwa epigraficzne, ceramikę datowaną radiowęglowo oraz monumentalne struktury obronne, które krok po kroku weryfikują geografię, chronologię i imiona utrwalone w natchnionym tekście Pisma Świętego.',
      '2. Stela z Tel Dan: Pierwszy pozabiblijny dowód na „Dom Dawida”',
      'Przełomem o fundamentalnym znaczeniu dla obrony historyczności monarchii Dawidowej było odkrycie dokonane w 1993 roku w Tel Dan w północnym Izraelu przez zespół prof. Avrahama Birana. Archeolodzy natrafili na bazaltowy fragment steli triumfalnej z IX wieku p.n.e., wzniesionej najprawdopodobniej przez aramejskiego króla Chazaela z Damaszku po zwycięskiej kampanii przeciwko królom Izraela i Judy.',
      'Inskrypcja wyryta w języku staroaramejskim zawiera jednoznaczne sformułowanie „Byt Dwd” (Dom Dawida), określające dynastię panującą w Jerozolimie. Jest to najstarsze bezpośrednie pozabiblijne poświadczenie istnienia króla Dawida jako postaci historycznej i założyciela dynastii judzkiej, pochodzące zaledwie sto lat po jego panowaniu. Odkrycie to definitywnie zamknęło dyskusję nad rzekomo mitycznym charakterem rodu Dawida.',
      '3. Bulla króla Ezechiasza na Ofelu: Osobista pieczęć władcy Judy',
      'Kolejnego przełomowego odkrycia dokonała w 2015 roku ekspedycja Uniwersytetu Hebrajskiego pod kierunkiem prof. Eilat Mazar podczas prac wykopaliskowych na wzgórzu Ofel, tuż poniżej południowego muru Wzgórza Świątynnego w Jerozolimie. W nienaruszonej warstwie gruzowiska z końca VIII wieku p.n.e. odnaleziono gliniany odcisk pieczęci (bullę) o wymiarach zaledwie 13 na 12 milimetrów.',
      'Mikroanaliza paleograficzna odsłoniła dwuwierszowy napis w piśmie paleohebrajskim: „[Należąca] do Ezechiasza, [syna] Achaza, króla Judy”. W centrum pieczęci widnieje dwuskrzydlate słońce z symbolami oznaczającymi życie – powszechny wówczas motyw królewski na starożytnym Bliskim Wschodzie. To pierwszy przypadek w historii archeologii biblijnej, gdy odcisk pieczęci judzkiego monarchy został odnaleziony w kontrolowanych naukowo wykopaliskach stratygraficznych.',
      '4. Tunel Siloe i Pryzmat Sennacheryba: Oblężenie z 701 roku p.n.e.',
      'Wiarygodność biblijnego opisu rządów Ezechiasza potwierdza również inżynieria wodna starożytnej Jerozolimy. W obliczu najazdu asyryjskiego władcy Sennacheryba w 701 roku p.n.e., król Ezechiasz nakazał zabezpieczenie źródeł wody poza murami miasta i wykucie podziemnego tunelu w litej skale (2 Krl 20:20; 2 Krn 32:30). Zachowany do dziś 533-metrowy Tunel Siloe doprowadzał wodę ze źródła Gichon do sadzawki Siloe wewnątrz obwarowań miejskich.',
      'Znaleziona wewnątrz akweduktu Inskrypcja z Siloe w języku hebrajskim opisuje dramatyczny moment spotkania dwóch grup kamieniarzy kujących skałę z przeciwległych stron. Wydarzenie to ma swoje niezależne potwierdzenie w asyryjskich źródłach klinowych: na tzw. Pryzmacie Taylora w British Museum asyryjski władca przechwala się, że uwięził Ezechiasza w Jerozolimie „jak ptaka w klatce”, nie zdobywszy jednak miasta, co koresponduje z relacją 2 Królów 19 o ocaleniu stolicy Judy.',
      '5. Granice metodologiczne: Czym archeologia jest, a czym nie może być',
      'Należy zachować ścisłą dyscyplinę badawczą i oddzielić ustalenia archeologii od teologicznej interpretacji. Archeologia jako nauka materialna weryfikuje kontekst historyczny, geografię, chronologię, zniszczenia wojenne i dokumenty epigraficzne. Nie potrafi jednak „udowodnić” cudu, nawrócenia serca ani Bożej obecności, ponieważ rzeczywistość duchowa wykracza poza zasięg wykopalisk i datowania radiowęglowego.',
      'Christian Culture podkreśla, że archeologia nie zastępuje wiary, lecz stanowi dla niej solidne historyczne oparcie. Pismo Święte nie jest zbiorem abstrakcyjnych mitów ani alegorycznych baśni; to natchnione Słowo Boga, które wkracza w konkretną historię ludzką, pośród realnych królów, miast, wojen i traktatów politycznych.',
      '6. Perspektywa biblijna: Bóg przymierza objawiony w Chrystusie',
      'Przekład Uwspółcześnionej Biblii Gdańskiej (UBG) w 2 Księdze Królów 18:5 podsumowuje postawę Ezechiasza słowami: „W PANU, Bogu Izraela, pokładał nadzieję, tak że po nim nie było wśród wszystkich królów Judy żadnego podobnego do niego, ani przed nim”. Ezechiasz nie ocalał dzięki sile militarnej ani sojuszowi z Egiptem, lecz dzięki zgięciu kolan przed Najwyższym, gdy rozłożył asyryjskie groźby w świątyni przed obliczem Boga (Iz 37:14 UBG).',
      'Wszystkie ziemskie zwycięstwa i ocalenia Judy wskazują jednak na ostateczne wyzwolenie w Jezusie Chrystusie. Jezus – Syn Dawida i Król Królów – wkraczając do Jerozolimy, przypomniał faryzeuszom domagającym się uciszenia Jego uczniów: „Powiadam wam, że jeśli oni będą milczeć, kamienie wołać będą” (Łk 19:40 UBG). Dziś, po niemal trzech tysiącach lat, starożytne kamienie Jerozolimy dosłownie „wołają”, dając świadectwo prawdomówności Słowa Bożego.',
      '7. Zastosowanie dla współczesnego chrześcijanina: Wiara oparta na prawdzie',
      'Dla współczesnego wierzącego świadectwo archeologii biblijnej jest wezwaniem do niezachwianej ufności w autorytet Pisma Świętego. W świecie, który próbuje sprowadzić chrześcijaństwo do kulturowego folkloru lub subiektywnego sentymentu, prawda o realnym zakotwiczeniu wiary w faktach historycznych daje odwagę do publicznego wyznawania Chrystusa.',
      'Drugą lekcją jest postawa samego Ezechiasza: w obliczu zagrożenia i trudnych okoliczności człowiek wiary nie ulega panice, lecz szuka ratunku u Boga. Zamiast budować swoje bezpieczeństwo wyłącznie na ludzkich fortyfikacjach, chrześcijanin jest powołany do całkowitego oparcia się na łasce i obietnicach Chrystusa, który pokonał grzech, śmierć i wszelki lęk.'
    ],
    category: 'Historia i Archeologia',
    categoryLabel: 'CCN HISTORIA • ARCHEOLOGIA BIBLIJNA',
    author: AUTHORS.cezary,
    publishedAt: '2026-11-03T14:00:00+01:00',
    dateFormatted: '3 listopada 2026',
    imageUrl: '/images/news/art-gdy-kamienie-wolaja-archeologia-jerozolima-ezechiasz-tel-dan.jpg',
    imageCaption: 'Ilustracja redakcyjna @A520 dla CCN News: Wykopaliska w Mieście Dawida w Jerozolimie, mury z czasów Pierwszej Świątyni i starożytne inskrypcje hebrajskie.',
    readTimeMinutes: 8,
    isHero: true,
    isPopular: true,
    popularRank: 1,
    tags: [
      '@CezaryRogowski',
      '@ChristianCulture',
      '#ArcheologiaBiblijna',
      '#Jerozolima',
      '#Ezechiasz',
      '#TelDan',
      '#KsięgiKrólewskie',
      '#UBG',
      '#HistoriaBiblii'
    ],
    scriptureReference: {
      verse: '2 Królów 20:20 (UBG)',
      text: 'A pozostałe sprawy Ezechiasza i cała jego potęga, i jak wykopał staw oraz wodociąg, i doprowadził wodę do miasta, czy nie są zapisane w księdze kronik królów Judy?',
      strongCode: 'H2396'
    },
    sourceCitation: {
      sourceName: 'Israel Antiquities Authority (IAA) & Hebrew University of Jerusalem (City of David / Ophel)',
      sourceUrl: 'https://www.antiquities.org.il/'
    },
    resourceLinks: [
      { label: 'Interlinearna MojaBiblia CC (Księgi Królewskie)', url: '/mojabiblia' },
      { label: 'Akademia Biblijna Christian Culture', url: '/akademia' },
      { label: 'Wsparcie Misji Christian Culture', url: '/wspieraj' }
    ]
  },
`;

// Wstaw na początku INITIAL_ARTICLES
const marker = 'export const INITIAL_ARTICLES: Article[] = [\n';
const idx = code.indexOf(marker);
if (idx === -1) {
  throw new Error('Nie znaleziono INITIAL_ARTICLES w articles.ts');
}

code = code.slice(0, idx + marker.length) + newArticleCode + code.slice(idx + marker.length);

// Dodaj także do BREAKING_NEWS
const breakingMarker = 'export const BREAKING_NEWS: string[] = [\n';
const bIdx = code.indexOf(breakingMarker);
if (bIdx !== -1) {
  const newBreaking = `  "CCN HISTORIA & ARCHEOLOGIA: Gdy kamienie wołają w Jerozolimie — bulla króla Ezechiasza, tunel Siloe i stela z Tel Dan weryfikują historię biblijną (https://polskieradio.cc/news/gdy-kamienie-wolaja-archeologia-jerozolima-ezechiasz-tel-dan)",\n`;
  code = code.slice(0, bIdx + breakingMarker.length) + newBreaking + code.slice(bIdx + breakingMarker.length);
}

fs.writeFileSync(articlesFilePath, code, 'utf8');
console.log('✅ Pomyślnie zaktualizowano articles.ts o nowy artykuł.');
