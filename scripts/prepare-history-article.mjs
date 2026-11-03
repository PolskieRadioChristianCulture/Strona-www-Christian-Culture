import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageEkoccArticle } from './package-ekocc-article.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const articleData = {
  portal: 'news',
  type: 'ANALIZA',
  title: 'Gdy kamienie wołają w Jerozolimie: Jak bulla króla Ezechiasza, tunel Siloe i stela z Tel Dan weryfikują historię biblijną',
  slug: 'gdy-kamienie-wolaja-archeologia-jerozolima-ezechiasz-tel-dan',
  author: 'Cezary Rogowski',
  date: '2026-11-03',
  lead: 'Współczesna archeologia Bliskiego Wschodu coraz częściej weryfikuje minimalistyczne teorie kwestionujące historyczność biblijnych królów Judy i Izraela. Odkrycia w Jerozolimie i Galilei – w tym odnaleziona na Ofelu bulla z pieczęcią króla Ezechiasza, aramejska stela z Tel Dan oraz monumentalny podziemny akwedukt Siloe – dostarczają bezspornych, materialnych dowodów na autentyczność relacji Ksiąg Królewskich. W dobie wszechobecnego relatywizmu starożytne inskrypcje i warstwy stratygraficzne przypominają słowa Jezusa Chrystusa, że prawda o Bożym działaniu w historii nie da się uciszyć.',
  sections: [
    {
      heading: '1. ARCHEOLOGICZNY SPÓR O HISTORIĘ: MINIMALIZM KONTRA FAKTY MATERIALNE',
      paragraphs: [
        'Przez dziesięciolecia tzw. szkoła minimalistyczna w biblistyce twierdziła, że postacie Dawida, Salomona czy Ezechiasza były jedynie mitycznymi figurami stworzonymi w epoce perskiej lub hellenistycznej. Argumentowano, że rzekomy brak pozabiblijnych inskrypcji z epoki żelaza dowodzi fikcyjności Zjednoczonego Królestwa oraz wczesnej monarchii judzkiej.',
        'Jednak ostatnie trzy dekady intensywnych badań wykopaliskowych w Ziemi Świętej doprowadziły do radykalnej zmiany perspektywy naukowej. Zamiast literackich spekulacji badacze otrzymali do rąk twarde świadectwa epigraficzne, ceramikę datowaną radiowęglowo oraz monumentalne struktury obronne, które krok po kroku weryfikują geografię, chronologię i imiona utrwalone w natchnionym tekście Pisma Świętego.'
      ]
    },
    {
      heading: '2. STELA Z TEL DAN: PIERWSZY POZABIBLIJNY DOWÓD NA „DOM DAWIDA”',
      paragraphs: [
        'Przełomem o fundamentalnym znaczeniu dla obrony historyczności monarchii Dawidowej było odkrycie dokonane w 1993 roku w Tel Dan w północnym Izraelu przez zespół prof. Avrahama Birana. Archeolodzy natrafili na bazaltowy fragment steli triumfalnej z IX wieku p.n.e., wzniesionej najprawdopodobniej przez aramejskiego króla Chazaela z Damaszku po zwycięskiej kampanii przeciwko królom Izraela i Judy.',
        'Inskrypcja wyryta w języku staroaramejskim zawiera jednoznaczne sformułowanie „Byt Dwd” (Dom Dawida), określające dynastię panującą w Jerozolimie. Jest to najstarsze bezpośrednie pozabiblijne poświadczenie istnienia króla Dawida jako postaci historycznej i założyciela dynastii judzkiej, pochodzące zaledwie sto lat po jego panowaniu. Odkrycie to definitywnie zamknęło dyskusję nad rzekomo mitycznym charakterem rodu Dawida.'
      ]
    },
    {
      heading: '3. BULLA KRÓLA EZECHIASZA NA OFELU: OSOBISTA PIECZĘĆ WŁADCY JUDY',
      paragraphs: [
        'Kolejnego przełomowego odkrycia dokonała w 2015 roku ekspedycja Uniwersytetu Hebrajskiego pod kierunkiem prof. Eilat Mazar podczas prac wykopaliskowych na wzgórzu Ofel, tuż poniżej południowego muru Wzgórza Świątynnego w Jerozolimie. W nienaruszonej warstwie gruzowiska z końca VIII wieku p.n.e. odnaleziono gliniany odcisk pieczęci (bullę) o wymiarach zaledwie 13 na 12 milimetrów.',
        'Mikroanaliza paleograficzna odsłoniła dwuwierszowy napis w piśmie paleohebrajskim: „[Należąca] do Ezechiasza, [syna] Achaza, króla Judy”. W centrum pieczęci widnieje dwuskrzydlate słońce z symbolami oznaczającymi życie – powszechny wówczas motyw królewski na starożytnym Bliskim Wschodzie. To pierwszy przypadek w historii archeologii biblijnej, gdy odcisk pieczęci judzkiego monarchy został odnaleziony w kontrolowanych naukowo wykopaliskach stratygraficznych.'
      ]
    },
    {
      heading: '4. TUNEL SILOE I PRYZMAT SENNACHERYBA: OBLĘŻENIE Z 701 ROKU P.N.E.',
      paragraphs: [
        'Wiarygodność biblijnego opisu rządów Ezechiasza potwierdza również inżynieria wodna starożytnej Jerozolimy. W obliczu najazdu asyryjskiego władcy Sennacheryba w 701 roku p.n.e., król Ezechiasz nakazał zabezpieczenie źródeł wody poza murami miasta i wykucie podziemnego tunelu w litej skale (2 Krl 20:20; 2 Krn 32:30). Zachowany do dziś 533-metrowy Tunel Siloe doprowadzał wodę ze źródła Gichon do sadzawki Siloe wewnątrz obwarowań miejskich.',
        'Znaleziona wewnątrz akweduktu Inskrypcja z Siloe w języku hebrajskim opisuje dramatyczny moment spotkania dwóch grup kamieniarzy kujących skałę z przeciwległych stron. Wydarzenie to ma swoje niezależne potwierdzenie w asyryjskich źródłach klinowych: na tzw. Pryzmacie Taylora w British Museum asyryjski władca przechwala się, że uwięził Ezechiasza w Jerozolimie „jak ptaka w klatce”, nie zdobywszy jednak miasta, co koresponduje z relacją 2 Królów 19 o ocaleniu stolicy Judy.'
      ]
    },
    {
      heading: '5. GRANICE METODOLOGICZNE: CZYM ARCHEOLOGIA JEST, A CZYM NIE MOŻE BYĆ',
      paragraphs: [
        'Należy zachować ścisłą dyscyplinę badawczą i oddzielić ustalenia archeologii od teologicznej interpretacji. Archeologia jako nauka materialna weryfikuje kontekst historyczny, geografię, chronologię, zniszczenia wojenne i dokumenty epigraficzne. Nie potrafi jednak „udowodnić” cudu, nawrócenia serca ani Bożej obecności, ponieważ rzeczywistość duchowa wykracza poza zasięg wykopalisk i datowania radiowęglowego.',
        'Christian Culture podkreśla, że archeologia nie zastępuje wiary, lecz stanowi dla niej solidne historyczne oparcie. Pismo Święte nie jest zbiorem abstrakcyjnych mitów ani alegorycznych baśni; to natchnione Słowo Boga, które wkracza w konkretną historię ludzką, pośród realnych królów, miast, wojen i traktatów politycznych.'
      ]
    },
    {
      heading: '6. PERSPEKTYWA BIBLIJNA: BÓG PRZYMIERZA OBJAWIONY W CHRYSTUSIE',
      paragraphs: [
        'Przekład Uwspółcześnionej Biblii Gdańskiej (UBG) w 2 Księdze Królów 18:5 podsumowuje postawę Ezechiasza słowami: „W PANU, Bogu Izraela, pokładał nadzieję, tak że po nim nie było wśród wszystkich królów Judy żadnego podobnego do niego, ani przed nim”. Ezechiasz nie ocalał dzięki sile militarnej ani sojuszowi z Egiptem, lecz dzięki zgięciu kolan przed Najwyższym, gdy rozłożył asyryjskie groźby w świątyni przed obliczem Boga (Iz 37:14 UBG).',
        'Wszystkie ziemskie zwycięstwa i ocalenia Judy wskazują jednak na ostateczne wyzwolenie w Jezusie Chrystusie. Jezus – Syn Dawida i Król Królów – wkraczając do Jerozolimy, przypomniał faryzeuszom domagającym się uciszenia Jego uczniów: „Powiadam wam, że jeśli oni będą milczeć, kamienie wołać będą” (Łk 19:40 UBG). Dziś, po niemal trzech tysiącach lat, starożytne kamienie Jerozolimy dosłownie „wołają”, dając świadectwo prawdomówności Słowa Bożego.'
      ]
    },
    {
      heading: '7. ZASTOSOWANIE DLA WSPÓŁCZESNEGO CHRZEŚCIJANINA: WIARA OPARTA NA PRAWDZIE',
      paragraphs: [
        'Dla współczesnego wierzącego świadectwo archeologii biblijnej jest wezwaniem do niezachwianej ufności w autorytet Pisma Świętego. W świecie, który próbuje sprowadzić chrześcijaństwo do kulturowego folkloru lub subiektywnego sentymentu, prawda o realnym zakotwiczeniu wiary w faktach historycznych daje odwagę do publicznego wyznawania Chrystusa.',
        'Drugą lekcją jest postawa samego Ezechiasza: w obliczu zagrożenia i trudnych okoliczności człowiek wiary nie ulega panice, lecz szuka ratunku u Boga. Zamiast budować swoje bezpieczeństwo wyłącznie na ludzkich fortyfikacjach, chrześcijanin jest powołany do całkowitego oparcia się na łasce i obietnicach Chrystusa, który pokonał grzech, śmierć i wszelki lęk.'
      ]
    }
  ],
  conclusion: 'Odkrycia archeologiczne w Jerozolimie, bulla króla Ezechiasza, stela z Tel Dan oraz Tunel Siloe nie tworzą wiary, lecz bezlitośnie obalają bezpodstawny sceptycyzm wobec Pisma Świętego. Biblia okazuje się niezmiennie wiarygodna w każdym szczególe historycznym, chronologicznym i geograficznym. Gdy ludzie milkną lub ulegają zwątpieniu, starożytne kamienie zgodnie z zapowiedzią Chrystusa głośno wołają o wielkości i wierności Boga przymierza.',
  sources: [
    { name: 'Israel Antiquities Authority (IAA) — City of David Archaeological Excavations', url: 'https://www.antiquities.org.il/' },
    { name: 'Hebrew University of Jerusalem / Israel Exploration Journal (prof. Eilat Mazar — Ophel Reports)', url: 'https://en.huji.ac.il/' },
    { name: 'The Israel Museum, Jerusalem — Tel Dan Stele ("House of David") & The British Museum (Sennacherib Prism)', url: 'https://www.imj.org.il/' }
  ],
  scripture: '2 Królów 18:1–5, 20:20; 2 Kronik 32:30; Ewangelia Łukasza 19:40; Izajasza 37:14–20 (UBG)',
  imagePath: path.join(ROOT, 'images/news/art-gdy-kamienie-wolaja-archeologia-jerozolima-ezechiasz-tel-dan.jpg'),
  imageCaption: 'Ilustracja redakcyjna @A520 dla CCN News: Wykopaliska w Mieście Dawida w Jerozolimie, fortyfikacje z czasów Pierwszej Świątyni i starożytne inskrypcje hebrajskie.',
  cta: 'Zachęcamy do pogłębiania wiedzy biblijnej i historycznej w Akademii Biblijnej Christian Culture (https://polskieradio.cc/akademia) oraz korzystania z interlinearnej Mojej Biblii (https://polskieradio.cc/mojabiblia). Módlmy się o odwagę wiary i miłość do Bożej prawdy w każdym pokoleniu.',
  tags: ['@CezaryRogowski', '@ChristianCulture', '#ArcheologiaBiblijna', '#Jerozolima', '#Ezechiasz', '#TelDan', '#KsięgiKrólewskie', '#UBG', '#HistoriaBiblii'],
  seo: {
    title: 'Gdy kamienie wołają: Archeologia w Jerozolimie a Biblia',
    description: 'Bulla króla Ezechiasza, tunel Siloe i stela z Tel Dan. Jak wykopaliska w Jerozolimie weryfikują autentyczność Ksiąg Królewskich w świetle Pisma.',
    keywords: ['archeologia biblijna', 'bulla Ezechiasza', 'stela Tel Dan', 'tunel Siloe', 'Jerozolima wykopaliska', 'Miasto Dawida', 'autentyczność Biblii', 'UBG', 'Księgi Królewskie']
  }
};

async function main() {
  console.log('🚀 Rozpoczynam przygotowanie artykułu EkoCC...');
  const res = await packageEkoccArticle(articleData);
  console.log('✅ Wynik pakowania:', res);
}

main().catch(err => {
  console.error('❌ Błąd:', err);
  process.exit(1);
});
