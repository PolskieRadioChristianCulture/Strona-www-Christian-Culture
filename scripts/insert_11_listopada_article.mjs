import fs from 'fs';
import path from 'path';

const txtPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\db144fde-c11f-407d-ac06-6b4bec418097\\unpacked_11_listopada\\Niepodleglosc_11_listopada_2026_tekst_CMS.txt';
const articlesTsPath = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\portals\\ccn-news\\src\\data\\articles.ts';

const rawTxt = fs.readFileSync(txtPath, 'utf8');
const lines = rawTxt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

// Wyodrębniamy akapity treści (od 6. linii, pomijając nagłówki i stopkę źródeł)
// Linia 0: Polska wolna. Ale czy nasze serca są wolne?
// Linia 1: 11 listopada: chrześcijański patriotyzm między wdzięcznością, prawdą i odpowiedzialnością
// Linia 2: Autor: Cezary Rogowski
// Linia 3: 11 listopada 2026

const title = "Polska wolna. Ale czy nasze serca są wolne? 11 listopada: chrześcijański patriotyzm";
const slug = "11-listopada-2026-polska-wolna-biblijny-patriotyzm";
const excerpt = "Dziś, 11 listopada 2026 roku, mijają 108 lat od odzyskania przez Polskę niepodległości. Mamy prawo do dumy i wdzięczności. Warto jednak postawić trudniejsze pytanie: czy wolna Polska ma obywateli, którzy potrafią uczciwie, odpowiedzialnie i w prawdzie Chrystusa korzystać z wolności? Biblijna analiza patriotyzmu, miłości ojczyzny i wolności serca.";

// Zbieramy akapity
const contentParagraphs = [];
let collecting = false;

for (const l of lines) {
  if (l.startsWith('108 lat niepodległości')) {
    collecting = true;
  }
  if (l.startsWith('Źródła:')) {
    break;
  }
  if (collecting) {
    if (l === 'Cezary Rogowski' || l === 'Christian Culture Network — Christian Culture' || l === 'https://polskieradio.cc') {
      continue;
    }
    contentParagraphs.push(l);
  }
}

console.log('Znaleziono akapitów:', contentParagraphs.length);

const newArticle = {
  id: 'art-11-listopada-2026-polska-wolna-biblijny-patriotyzm',
  title: "Polska wolna. Ale czy nasze serca są wolne? 11 listopada: chrześcijański patriotyzm",
  slug: slug,
  excerpt: excerpt,
  content: contentParagraphs,
  imageUrl: '/images/news/art-11-listopada-2026-polska-wolna-biblijny-patriotyzm.jpg',
  imageCaption: 'Narodowe Święto Niepodległości 11 Listopada 2026: Polski patriotyzm, wdzięczność Bogu i biblijna odpowiedzialność za wolność serca i narodu (Cezary Rogowski / Christian Culture).',
  readTimeMinutes: 7,
  isHero: true,
  isPopular: true,
  popularRank: 1,
  tags: [
    '@CezaryRogowski',
    '@ChristianCulture',
    '#Niepodległość',
    '#11Listopada',
    '#Patriotyzm',
    '#Wolność',
    '#Polska',
    '#Biblia',
    '#CCNNews',
    '#PolskiHymnChrzescijanski',
    '#UBG',
    '#EkoCC365'
  ],
  authorRef: 'AUTHORS.cezary',
  primaryPortalUrl: 'https://polskieradio.cc/news',
  primaryPortalLabel: 'CCN News / aktualności',
  category: 'wiara',
  categoryLabel: 'CCN NEWS • NARODOWE ŚWIĘTO NIEPODLEGŁOŚCI, PATRIOTYZM I WOLNOŚĆ SERCA',
  publishedAt: '2026-11-11T06:00:00Z',
  dateFormatted: '11 listopada 2026',
  scriptureReference: {
    verse: 'Jeremiasza 29:7; Jana 8:36; Filipian 3:20 (UBG)',
    text: 'Jeśli więc Syn was wyzwoli, będziecie prawdziwie wolni. Nasza zaś ojczyzna jest w niebie, skąd też oczekujemy Zbawiciela, Pana Jezusa Chrystusa.',
    strongCode: 'H7965'
  },
  sourceCitation: {
    sourceName: 'Instytut Pamięci Narodowej, Sejm Rzeczypospolitej Polskiej, MSZ RP oraz Polski Hymn Chrześcijański',
    sourceUrl: 'https://youtu.be/Q9Ying0bwTo',
    name: 'Instytut Pamięci Narodowej, Sejm Rzeczypospolitej Polskiej, MSZ RP oraz Polski Hymn Chrześcijański',
    url: 'https://youtu.be/Q9Ying0bwTo'
  },
  actionLinks: [
    {
      label: 'Posłuchaj: Polski Hymn Chrześcijański (YouTube)',
      url: 'https://youtu.be/Q9Ying0bwTo'
    },
    {
      label: 'CCN News — Wiadomości i Formacja',
      url: 'https://polskieradio.cc/news'
    },
    {
      label: 'Prawdziwa wolność — MojaBiblia J 8:36',
      url: 'https://polskieradio.cc/mojabiblia?ref=JHN.8.36'
    }
  ]
};

// Zapisujemy skrypt wstawiający do articles.ts
const codeToInsert = `  {
    id: ${JSON.stringify(newArticle.id)},
    title: ${JSON.stringify(newArticle.title)},
    slug: ${JSON.stringify(newArticle.slug)},
    excerpt: ${JSON.stringify(newArticle.excerpt)},
    content: ${JSON.stringify(newArticle.content, null, 6)},
    imageUrl: ${JSON.stringify(newArticle.imageUrl)},
    imageCaption: ${JSON.stringify(newArticle.imageCaption)},
    readTimeMinutes: ${newArticle.readTimeMinutes},
    isHero: true,
    isPopular: true,
    popularRank: 1,
    tags: ${JSON.stringify(newArticle.tags, null, 6)},
    author: AUTHORS.cezary,
    primaryPortalUrl: ${JSON.stringify(newArticle.primaryPortalUrl)},
    primaryPortalLabel: ${JSON.stringify(newArticle.primaryPortalLabel)},
    category: ${JSON.stringify(newArticle.category)},
    categoryLabel: ${JSON.stringify(newArticle.categoryLabel)},
    publishedAt: ${JSON.stringify(newArticle.publishedAt)},
    dateFormatted: ${JSON.stringify(newArticle.dateFormatted)},
    scriptureReference: ${JSON.stringify(newArticle.scriptureReference, null, 6)},
    sourceCitation: ${JSON.stringify(newArticle.sourceCitation, null, 6)},
    actionLinks: ${JSON.stringify(newArticle.actionLinks, null, 6)}
  },
`;

let articlesTs = fs.readFileSync(articlesTsPath, 'utf8');

// Ustawiamy isHero: false dla poprzednich
articlesTs = articlesTs.replace(/isHero:\s*true/g, 'isHero: false');

// Wstawiamy nowy artykuł na początek INITIAL_ARTICLES
const marker = 'export const INITIAL_ARTICLES: Article[] = [\n';
if (!articlesTs.includes(marker)) {
  console.error('Nie znaleziono znacznika INITIAL_ARTICLES!');
  process.exit(1);
}

articlesTs = articlesTs.replace(marker, marker + codeToInsert);

fs.writeFileSync(articlesTsPath, articlesTs, 'utf8');
console.log('✅ Artykuł 11 listopada dodany pomyślnie do articles.ts!');
