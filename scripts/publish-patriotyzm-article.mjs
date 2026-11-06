#!/usr/bin/env node
/**
 * PUBLIKACJA ARTYKUŁU: CZY PATRIOTYZM ZOBOWIĄZUJE DO SZACUNKU WOBEC PRZECIWNIKA?
 * Autor: Cezary Rogowski | 6 listopada 2026 r. (Slot 3 w Kalendarzu 365 EkoCC)
 * Portal docelowy: CCN News (https://polskieradio.cc/news)
 *
 * Podręcznik Redakcyjny EkoCC Wersja 1.0 (30 października 2026)
 */

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
  title: 'Czy patriotyzm zobowiązuje do szacunku wobec przeciwnika?',
  slug: 'czy-patriotyzm-zobowiazuje-do-szacunku-wobec-przeciwnika',
  author: 'Cezary Rogowski',
  date: '2026-11-06',
  lead: 'W obliczu zbliżającego się Narodowego Święta Niepodległości w polskiej debacie publicznej z nową siłą powraca pytanie o granice sporu i fundamenty wspólnoty obywatelskiej. Coraz częściej miłość do ojczyzny bywa utożsamiana z bezwzględnością wobec oponentów, a inaczej myślący rodak staje się wrogiem pozbawionym prawa do szacunku. Pismo Święte, polskie dziedzictwo ustrojowe oraz twarde dane socjologiczne dowodzą jednak, że prawdziwy patriotyzm nie karmi się pogardą — jego miarą jest zdolność do wierności prawdzie przy jednoczesnym poszanowaniu godności każdego człowieka.',
  sections: [
    {
      heading: '1. POLARYZACJA AFEKTYWNA I KRYZYS ZAUFANIA: GDY SPÓR ZAMIENIA SIĘ W POGARDĘ',
      paragraphs: [
        'Zjawisko polaryzacji politycznej w ostatnich latach przestało dotyczyć wyłącznie różnic programowych czy odmiennych wizji rozwoju gospodarczego. Socjolodzy opisują współczesny stan debaty pojęciem polaryzacji afektywnej – sytuacji, w której motorem zaangażowania nie jest już racjonalna obrona własnych postulatów, lecz emocjonalna niechęć, a nierzadko wstręt do grupy przeciwnej. Oponent przestaje być partnerem w dyskusji o dobru wspólnym, a staje się egzystencjalnym zagrożeniem, które należy za wszelką cenę wyeliminować z przestrzeni publicznej.',
        'Potwierdzają to systematyczne badania Centrum Badania Opinii Społecznej (CBOS) nad zaufaniem społecznym. Wynika z nich jednoznacznie, że wskaźnik ogólnego zaufania do drugiego człowieka w Polsce utrzymuje się na historycznie niskim poziomie poniżej 30%, a największa przepaść emocjonalna przebiega wzdłuż linii sympatii politycznych. Odmawianie przeciwnikowi prawa do patriotyzmu i moralnej uczciwości staje się destrukcyjnym nawykiem, który paraliżuje zdolność państwa i społeczeństwa do wspólnego rozwiązywania realnych problemów – od bezpieczeństwa narodowego po kondycję demograficzną i edukację.'
      ]
    },
    {
      heading: '2. PATRIOTYZM A SZOWINIZM: POLSKA TRADYCJA SZACUNKU I WOLNOŚCI',
      paragraphs: [
        'W klasycznej myśli chrześcijańskiej i republikańskiej patriotyzm jest cnotą opartą na wdzięczności i odpowiedzialności. To miłość do ziemi ojczystej, kultury, języka oraz rodaków, połączona z gotowością do ofiarnej pracy na rzecz dobra wspólnego (res publica). Zasadniczą cechą dojrzałego patriotyzmu jest jego inkluzywność: miłość do własnego narodu nie rodzi nienawiści do innych nacji ani pogardy dla współobywateli o odmiennej wrażliwości.',
        'Przeciwieństwem tej postawy jest szowinizm i plemienny nacjonalizm, które budują poczucie tożsamości wyłącznie na mechanizmie kozła ofiarnego i szukaniu wroga wewnętrznego. Polska ma w swojej historii chlubną tradycję, która przypomina o wyższości kultury dialogu nad plemienną wrogością. Symbolem tego dziedzictwa pozostaje Akt Konfederacji Warszawskiej z 1573 roku, wpisany na Listę Pamięci Świata UNESCO. W epoce, gdy Europę Zachodnią trawiły krwawe wojny religijne, polska szlachta i senatorowie uroczyście zadeklarowali: „którzy jesteśmy różni w wierze, pokój między sobą zachować”. Prawdziwa wielkość Rzeczypospolitej rodziła się wtedy, gdy fundamentem państwa było poszanowanie prawa i godności wolnych obywateli, a nie przymus i pogarda.'
      ]
    },
    {
      heading: '3. BIBLIJNA EGZEGEZA SZACUNKU: 1 LIST PIOTRA I GRECKIE POJĘCIE TIMAO',
      paragraphs: [
        'Gdy otwieramy karty Nowego Testamentu, uderza nas bezkompromisowość apostolskich nakazów dotyczących traktowania innych ludzi. Apostoł Piotr pisał swój Pierwszy List do zborów w Azji Mniejszej w okresie panowania cesarza Nerona – w czasie, gdy chrześcijanie stanowili bezbronną mniejszość, spotykali się ze społecznym ostracyzmem, oszczerstwami i groźbą brutalnych prześladowań państwowych. W takim właśnie kontekście historycznym pada kategoryczny imperatyw:',
        '„Wszystkich szanujcie, braci miłujcie, Boga się bójcie, króla czcijcie” (1 P 2:17 UBG). W tekście greckim na określenie szacunku wobec wszystkich ludzi użyto czasownika timao (Strong G5091), od rzeczownika time (Strong G5092), co oznacza dosłownie: „wyznaczać wartość, traktować z czcią, szacunkiem i powagą”. Apostoł nie napisał: „szanujcie tych, którzy się z wami zgadzają”, ani „szanujcie tych, którzy są dla was życzliwi”. Sformułowanie pantas timesate oznacza uniwersalny szacunek należny każdemu człowiekowi z faktu, że został powołany do istnienia przez Stwórcę.',
        'Z kolei apostoł Paweł w Liście do Rzymian rozwija ten sam wątek w praktyce życia społecznego: „Nikomu złem za zło nie odpłacajcie; starajcie się o to, co uczciwe wobec wszystkich ludzi. Jeśli to możliwe, o ile to od was zależy, ze wszystkimi ludźmi żyjcie w pokoju” (Rz 12:17–18 UBG) oraz „Nie daj się zwyciężyć złu, ale zło dobrem zwyciężaj” (Rz 12:21 UBG). Biblijna wizja relacji z oponentem wyklucza odwet i obelgę jako narzędzie walki o rację.'
      ]
    },
    {
      heading: '4. ÓSME PRZYKAZANIE DEKALOGU W CYFROWYM ŚWIECIE: ODPOWIEDZIALNOŚĆ ZA SŁOWO',
      paragraphs: [
        'Zgodnie z nadrzędnym fundamentem wiary chrześcijańskiej – niezmiennym Prawem Bożym zapisanym w Dekalogu – sprawa szacunku wobec bliźniego jest nierozerwalnie związana z ósmym przykazaniem: „Nie będziesz fałszywie świadczył przeciw twemu bliźniemu” (Wj 20:16 UBG). W kulturze internetowej, zdominowanej przez algorytmy premiujące skrajne emocje, łamanie tego przykazania stało się powszechną metodą walki politycznej. Wycinanie zdań z kontekstu, przypisywanie przeciwnikowi niecnych intencji, rozpowszechnianie niezweryfikowanych pomówień czy tworzenie fałszywych etykiet to jawne pogwałcenie Bożego prawa.',
        'Apostoł Jakub w niezwykle dosadny sposób diagnozuje tę moralną schizofrenię: „Nim błogosławimy Boga i Ojca i nim przeklinamy ludzi stworzonych na podobieństwo Boga. Z tych samych ust wychodzi błogosławieństwo i przekleństwo. Tak być nie powinno, moi bracia” (Jk 3:9–10 UBG). Jeżeli człowiek deklaruje gorącą miłość do Boga i ojczyzny, a jednocześnie używa swojego języka lub klawiatury do obrzucania błotem drugiego obywatela, jego religijność i patriotyzm stoją w jaskrawej sprzeczności z nauką Pisma Świętego. Człowiek stworzony na Boże podobieństwo nie traci swojej godności z powodu głosowania na inną partię czy odmiennych zapatrywań na ustrój państwa.'
      ]
    },
    {
      heading: '5. ŁASKA, SUWERENNOŚĆ BOGA I WOLNOŚĆ OD POLITYCZNEJ HISTERII',
      paragraphs: [
        'Chrześcijańskie spojrzenie na patriotyzm chroni człowieka przed dwiema skrajnościami: z jednej strony przed cynicznym nihilizmem, który lekceważy obowiązki obywatelskie, a z drugiej – przed bałwochwalstwem politycznym, które w ziemskiej władzy widzi jedynego zbawiciela lub jedyne źródło nadziei. Jezus Chrystus w rozmowie z Poncjuszem Piłatem wypowiedział słowa, które na zawsze ustawiły hierarchię wartości każdego chrześcijanina: „Moje królestwo nie jest z tego świata” (J 18:36 UBG).',
        'Gdy wierzący ma pewność, że ostateczny los historii i narodów spoczywa w rękach suwerennego Boga, zostaje uwolniony od paraliżującego lęku i histerii. Nie musi niszczyć przeciwnika, aby czuć się bezpiecznie. Wie, że żadna ziemska formacja polityczna nie zastąpi Królestwa Bożego, a doczesne państwo jest jedynie przestrzenią porządku prawnego i służby bliźnim. Z tego źródła wypływa apostolski nakaz modlitwy: „Zachęcam więc przede wszystkim, aby zanoszone były prośby, modlitwy, wstawiennictwa i dziękczynienia za wszystkich ludzi; Za królów i za wszystkich sprawujących władzę, abyśmy mogli prowadzić życie ciche i spokojne, z całą pobożnością i uczciwością” (1 Tm 2:1–2 UBG).'
      ]
    },
    {
      heading: '6. PRAKTYCZNY PRZEWODNIK PATRIOTY: CZTERY DECYZJE BUDUJĄCE KULTURĘ SZACUNKU',
      paragraphs: [
        'Jak przenieść te zasady do codziennego życia – zwłaszcza przy rodzinnym stole podczas zbliżającego się Święta Niepodległości czy w rozmowach ze współpracownikami? Redakcja CCN proponuje cztery konkretne decyzje:',
        '1. Oddzielaj poglądy od godności człowieka. Masz pełne prawo do stanowczej, merytorycznej krytyki błędnych idei, szkodliwych ustaw czy niesprawiedliwych decyzji politycznych. Nigdy jednak nie atakuj godności osoby, która te poglądy wyraża. Zamiast mówić: „Jesteś zdrajcą / ignorantem”, powiedz: „Nie zgadzam się z tą tezą z następujących powodów”.',
        '2. Stosuj zasadę pauzy i weryfikacji źródeł. Zanim udostępnisz w mediach społecznościowych oburzający wpis na temat oponenta politycznego, sprawdź źródło pierwotne. Zapytaj samego siebie: czy to cytat dosłowny, czy manipulacja? Powstrzymanie się od powielenia nieprawdy jest realnym aktem patriotyzmu.',
        '3. Szanuj relację ponad chęć wygrania sporu. Żadne zwycięstwo w rodzinnej kłótni o politykę nie jest warte zerwania więzi z bratem, rodzicem czy dzieckiem. Pamiętaj o mądrości Księgi Przysłów: „Łagodna odpowiedź uśmierza gniew, a przykre słowo wzbudza złość” (Prz 15:1 UBG).',
        '4. Zdefiniuj patriotyzm przez czyny, a nie przez wykrzykiwanie haseł. Prawdziwa miłość do ojczyzny to rzetelna praca, uczciwość w rozliczeniach podatkowych, troska o słabszych, pomoc sąsiadowi bez pytania o jego poglądy polityczne oraz codzienna modlitwa o pokój i błogosławieństwo dla naszego narodu.'
      ]
    }
  ],
  conclusion: 'Patriotyzm, który wymaga nienawiści do przeciwnika, nie jest cnotą, lecz jej zdegenerowaną karykaturą. Wierność Rzeczypospolitej i wierność Słowu Bożemu nakładają na nas obowiązek szacunku wobec każdego rodaka – także tego, z którym fundamentalnie się nie zgadzamy. Siła narodu nie mierzy się głośnością plemiennych okrzyków, lecz kulturą ducha, poszanowaniem prawdy i zdolnością do budowania trwałego pokoju w oparciu o nienaruszalną godność człowieka stworzonego na obraz Boga.',
  cta: 'Zbliżające się Święto Niepodległości to doskonała okazja, aby podjąć osobiste zobowiązanie do budowania kultury dialogu i szacunku. Zachęcamy do wspólnej modlitwy za Polskę: „Panie Boże Wszechmogący, Stwórco nieba i ziemi, dziękujemy Ci za dar wolnej Ojczyzny i za pokolenia, które przelewały krew za naszą niepodległość. Prosimy Cię o mądrość, łaskę i opamiętanie dla nas wszystkich. Ulecz nasze serca z pogardy, zawiści i wrogości wobec tych, którzy myślą inaczej. Naucz nas szanować każdego człowieka, stać nieugięcie przy Twojej prawdzie i budować dobro wspólne w pokoju i sprawiedliwości. Przez Jezusa Chrystusa, naszego Zbawiciela. Amen.”',
  sources: [
    { name: 'Centrum Badania Opinii Społecznej (CBOS) — Raport „Zaufanie społeczne w Polsce” oraz komunikaty o polaryzacji afektywnej', url: 'https://www.cbos.pl' },
    { name: 'Archiwum Główne Akt Dawnych (AGAD) — Akt Konfederacji Warszawskiej (1573 r., Lista UNESCO Pamięć Świata)', url: 'https://agad.gov.pl' },
    { name: 'Uwspółcześniona Biblia Gdańska (UBG) — 1 List Piotra 2:11–17; List do Rzymian 12:14–21; Księga Wyjścia 20:16; List Jakuba 3:8–13; 1 List do Tymoteusza 2:1–4; Ewangelia Jana 18:36', url: 'https://polskieradio.cc/mojabiblia' },
    { name: 'Strong\'s Greek & Hebrew Concordance — Hasła: G5091 (timao), G5092 (time), G26 (agape), H5707 (ed), H8267 (szeker)', url: 'https://polskieradio.cc/mojabiblia' }
  ],
  scripture: '1 List Piotra 2:17 („Wszystkich szanujcie, braci miłujcie, Boga się bójcie, króla czcijcie”); List do Rzymian 12:17–18, 21; Księga Wyjścia 20:16; List Jakuba 3:9–10; 1 List do Tymoteusza 2:1–3 (UBG)',
  imagePath: path.join(ROOT, 'images/news/art-czy-patriotyzm-zobowiazuje-do-szacunku-wobec-przeciwnika.jpg'),
  imageCaption: 'Ilustracja redakcyjna CCN News: Klasyczny gabinet archiwalny z otwartą Biblią, historycznymi dokumentami i subtelnymi narodowymi akcentami, symbolizujący refleksję nad etyką dialogu i szacunkiem w debacie publicznej.',
  tags: [
    'Patriotyzm',
    'Święto Niepodległości',
    'Kultura Debaty',
    'Szacunek',
    'Dekalog',
    '1 List Piotra',
    'Konfederacja Warszawska',
    'Cezary Rogowski',
    'CCN News',
    'EkoCC365'
  ],
  seo: {
    title: 'Czy patriotyzm zobowiązuje do szacunku wobec przeciwnika? | CCN',
    description: 'Czy miłość do ojczyzny wymaga pogardy dla oponentów? Analiza CCN News: dane CBOS, historia wolności, 1 List Piotra 2:17 UBG i Dekalog w debacie publicznej.',
    keywords: [
      'patriotyzm a szacunek',
      'szacunek wobec przeciwnika',
      'kultura debaty publicznej',
      'polaryzacja afektywna CBOS',
      'Święto Niepodległości 11 listopada',
      '1 List Piotra 2 17 UBG',
      'Konfederacja Warszawska',
      'Dekalog ósme przykazanie',
      'Cezary Rogowski',
      'CCN News Christian Culture'
    ]
  }
};

async function main() {
  console.log('🚀 Rozpoczynam publikację artykułu EkoCC (Slot 2026-11-06)...');
  console.log('Tytuł:', articleData.title);

  // 1. Spakuj pakiet DOCX, TXT, SEO.txt i ZIP na Pulpicie
  const pkg = await packageEkoccArticle(articleData);
  console.log('✔ Spakowano pakiet redakcyjny na Pulpicie:', pkg.zipPath);

  // 2. Przygotuj strukturę akapitów content dla articles.ts
  const contentParagraphs = [articleData.lead];
  for (const s of articleData.sections) {
    contentParagraphs.push(s.heading);
    for (const p of s.paragraphs) {
      contentParagraphs.push(p);
    }
  }
  contentParagraphs.push('PODSUMOWANIE REDAKCYJNE CCN');
  contentParagraphs.push(articleData.conclusion);
  contentParagraphs.push('WEZWANIE DO DZIAŁANIA I MODLITWA');
  contentParagraphs.push(articleData.cta);

  // 3. Dodaj do portals/ccn-news/src/data/articles.ts
  const newsArticlesTsPath = path.join(ROOT, 'portals/ccn-news/src/data/articles.ts');
  let newsCode = fs.readFileSync(newsArticlesTsPath, 'utf8');

  const articleEntry = `  {
    id: 'art-${articleData.slug}',
    title: ${JSON.stringify(articleData.title)},
    slug: '${articleData.slug}',
    excerpt: ${JSON.stringify(articleData.lead)},
    content: ${JSON.stringify(contentParagraphs, null, 6)},
    imageUrl: '/images/news/art-${articleData.slug}.jpg',
    imageCaption: 'Ilustracja redakcyjna CCN News: Etyka dialogu, otwarta Biblia i poszanowanie godności w debacie publicznej.',
    readTimeMinutes: 8,
    isHero: true,
    isPopular: true,
    popularRank: 1,
    tags: ${JSON.stringify(articleData.tags, null, 6)},
    author: AUTHORS.cezary,
    primaryPortalUrl: 'https://polskieradio.cc/news',
    primaryPortalLabel: 'CCN News / aktualności',
    category: 'spoleczenstwo',
    categoryLabel: 'CCN NEWS • SPOŁECZEŃSTWO, HISTORIA I DIALOG',
    publishedAt: '${articleData.date}T14:00:00Z',
    dateFormatted: '6 listopada 2026',
    scriptureReference: {
      verse: '1 List Piotra 2:17 (UBG)',
      text: 'Wszystkich szanujcie, braci miłujcie, Boga się bójcie, króla czcijcie.',
      strongCode: 'G5091'
    },
    sourceCitation: {
      name: 'Centrum Badania Opinii Społecznej (CBOS) oraz Akt Konfederacji Warszawskiej (AGAD / UNESCO)',
      url: 'https://www.cbos.pl'
    }
  },
`;

  // Sprawdź czy artykuł już istnieje
  if (!newsCode.includes(`'art-${articleData.slug}'`)) {
    const insertIdx = newsCode.indexOf('export const INITIAL_ARTICLES: Article[] = [');
    if (insertIdx !== -1) {
      const insertPos = insertIdx + 'export const INITIAL_ARTICLES: Article[] = [\n'.length;
      newsCode = newsCode.slice(0, insertPos) + articleEntry + newsCode.slice(insertPos);

      // Dodaj także do BREAKING_NEWS
      const breakingEntry = `  "NOWY ARTYKUŁ CCN NEWS: Czy patriotyzm zobowiązuje do szacunku wobec przeciwnika? Analiza Cezarego Rogowskiego na Święto Niepodległości (https://polskieradio.cc/news/czy-patriotyzm-zobowiazuje-do-szacunku-wobec-przeciwnika)",\n`;
      const breakingIdx = newsCode.indexOf('export const BREAKING_NEWS: string[] = [');
      if (breakingIdx !== -1) {
        const breakingPos = breakingIdx + 'export const BREAKING_NEWS: string[] = [\n'.length;
        newsCode = newsCode.slice(0, breakingPos) + breakingEntry + newsCode.slice(breakingPos);
      }

      fs.writeFileSync(newsArticlesTsPath, newsCode, 'utf8');
      console.log('✔ Artykuł dodany do portals/ccn-news/src/data/articles.ts');
    }
  } else {
    console.log('ℹ Artykuł już istnieje w portals/ccn-news/src/data/articles.ts');
  }

  // 4. Zaktualizuj data/ekocc_kalendarz_365_artykulow.json
  const kalendarzPath = path.join(ROOT, 'data/ekocc_kalendarz_365_artykulow.json');
  if (fs.existsSync(kalendarzPath)) {
    const calData = JSON.parse(fs.readFileSync(kalendarzPath, 'utf8'));
    const item = calData.artykuly.find(a => a.lp === 3 || a.data_publikacji === '2026-11-06');
    if (item) {
      item.status = 'Opublikowany (Autoryzacja L0: 2026-11-06)';
      item.url_opublikowany = `https://polskieradio.cc/news/${articleData.slug}`;
      item.data_publikacji_dokonana = '2026-11-06T14:00:00+01:00';
      fs.writeFileSync(kalendarzPath, JSON.stringify(calData, null, 2), 'utf8');
      console.log('✔ Zaktualizowano data/ekocc_kalendarz_365_artykulow.json (Slot 3: Opublikowany).');
    }
  }

  console.log('\n🎉 Rejestracja artykułu i przygotowanie paczek zakończone sukcesem!');
}

main().catch(err => {
  console.error('❌ Błąd publikacji:', err);
  process.exit(1);
});
