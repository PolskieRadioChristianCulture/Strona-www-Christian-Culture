import fs from 'fs';
import path from 'path';

const REPO = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const MIRROR = 'C:/Users/czark/Desktop/@ICC/LUMINA';
const SLUG = 'silni-az-do-wyczerpania-dlaczego-mezczyzni-wciaz-boja-sie-prosic-o-pomoc';
const CANONICAL_URL = `https://polskieradio.cc/news/${SLUG}`;
const ARTICLE_ID = `art-${SLUG}`;
const IMG_NAME = `art-${SLUG}.jpg`;
const DATE_ISO = '2026-11-19';
const DATE_HUMAN = '19 listopada 2026';

const rawJson = JSON.parse(
  fs.readFileSync(path.join(REPO, 'scripts/current-article-data.json'), 'utf8')
);

// 1. Weryfikacja obrazu 16:9 i synchronizacja do lustra
const srcImgPath = path.join(REPO, 'images/news', IMG_NAME);
if (!fs.existsSync(srcImgPath)) {
  throw new Error(`Brak wymaganego obrazu: ${srcImgPath}`);
}
const mirrorImgPath = path.join(MIRROR, 'images/news', IMG_NAME);
fs.mkdirSync(path.dirname(mirrorImgPath), { recursive: true });
fs.copyFileSync(srcImgPath, mirrorImgPath);

// 2. Oczyszczenie CTA z notatek redakcyjnych T4
const rawCta = typeof rawJson.cta === 'string' ? rawJson.cta : '';
const cleanCta = rawCta.replace(/\n*\[Status redakcyjny:[\s\S]*$/m, '').trim();

// 3. Budowa akapitow tresci (obsluga roznych struktur sekcji)
const contentBlocks = [];
if (rawJson.lead) contentBlocks.push(rawJson.lead.trim());

if (Array.isArray(rawJson.sections)) {
  for (const sec of rawJson.sections) {
    const heading = (sec.heading || sec.title || '').trim();
    if (heading) contentBlocks.push(heading);
    if (Array.isArray(sec.paragraphs)) {
      for (const p of sec.paragraphs) {
        if (String(p).trim()) contentBlocks.push(String(p).trim());
      }
    } else if (typeof sec.body === 'string') {
      for (const p of sec.body.split(/\r?\n\r?\n+/)) {
        if (p.trim()) contentBlocks.push(p.trim());
      }
    } else if (typeof sec.text === 'string' && sec.text.trim()) {
      contentBlocks.push(sec.text.trim());
    }
  }
}

if (rawJson.conclusion && rawJson.conclusion.trim()) {
  contentBlocks.push('Podsumowanie: odpowiedzialna siła zaczyna się od prawdy');
  contentBlocks.push(rawJson.conclusion.trim());
}
if (cleanCta) {
  contentBlocks.push(cleanCta);
}

contentBlocks.push(
  'Cezary Rogowski\nChristian Culture Network — CCN News / Rodzina i Relacje\nhttps://polskieradio.cc'
);

if (Array.isArray(rawJson.sources) && rawJson.sources.length > 0) {
  const formattedSources = rawJson.sources.map((s) => {
    if (typeof s === 'string') return s;
    return [s.title || s.name || s.label, s.url || s.href].filter(Boolean).join(' — ');
  });
  contentBlocks.push(`ŹRÓDŁA:\n${formattedSources.join('\n')}`);
}

let scriptureVerse = 'List do Galatów 6:2; Przypowieści Salomona 27:17 (UBG)';
let scriptureText = 'Jedni drugich brzemiona noście, a tak wypełniajcie prawo Chrystusa.';
if (Array.isArray(rawJson.scripture) && rawJson.scripture.length > 0) {
  scriptureVerse = rawJson.scripture
    .map((s) => (typeof s === 'string' ? s : s.ref || s.verse))
    .filter(Boolean)
    .slice(0, 3)
    .join('; ');
  const firstObj = rawJson.scripture[0];
  if (firstObj && typeof firstObj === 'object' && (firstObj.text || firstObj.quote)) {
    scriptureText = firstObj.text || firstObj.quote;
  }
} else if (rawJson.scripture && typeof rawJson.scripture === 'object') {
  scriptureVerse = rawJson.scripture.verse || rawJson.scripture.ref || scriptureVerse;
  scriptureText = rawJson.scripture.text || rawJson.scripture.quote || scriptureText;
}

const cleanTags = Array.isArray(rawJson.tags) && rawJson.tags.length > 0
  ? rawJson.tags
  : [
      'Dzień Mężczyzn',
      'Rodzina',
      'Relacje',
      'Zdrowie psychiczne',
      'Wiara',
      'Ga 6:2',
      'UBG',
      'CCN News',
    ];

const articleObj = {
  id: ARTICLE_ID,
  title: rawJson.title,
  slug: SLUG,
  excerpt: rawJson.lead || rawJson.seo?.description || rawJson.title,
  content: contentBlocks,
  primaryPortalLabel: 'CCN NEWS • RODZINA I RELACJE',
  category: 'opinia',
  categoryLabel: 'CCN NEWS • RODZINA I RELACJE',
  authorKey: '__AUTHOR_CEZARY__',
  publishedAt: '2026-11-19T05:15:00Z',
  dateFormatted: DATE_HUMAN,
  imageUrl: `/images/news/${IMG_NAME}`,
  imageCaption:
    rawJson.imageCaption ||
    'Cicha presja i potrzeba prawdziwego braterskiego wsparcia wśród mężczyzn. Fotografia redakcyjna EkoCC.',
  readTimeMinutes: 7,
  isHero: true,
  isPopular: true,
  popularRank: 1,
  tags: cleanTags,
  viewsCount: 1240,
  scriptureReference: {
    verse: scriptureVerse,
    text: scriptureText,
    strongCode: 'G0922',
  },
  sourceCitation: {
    sourceName: 'Analiza społeczno-biblijna EkoCC & Uwspółcześniona Biblia Gdańska (UBG)',
    sourceUrl: 'https://polskieradio.cc/mojabiblia',
  },
  actionLinks: [
    {
      label: 'MojaBiblia — List do Galatów 6 (UBG)',
      url: 'https://polskieradio.cc/mojabiblia?ref=Ga6:1-10',
    },
    {
      label: 'Akademia Biblijna — Kurs Codzienny',
      url: 'https://polskieradio.cc/akademia#kurscodzienny',
    },
    {
      label: 'CCN News — Wszystkie artykuły',
      url: 'https://polskieradio.cc/news',
    },
  ],
};

// Serializacja zgodna ze stylem articles.ts (author: AUTHORS.cezary)
const serializedArticle = JSON.stringify(articleObj, null, 2)
  .replace('"authorKey": "__AUTHOR_CEZARY__"', '"author": AUTHORS.cezary')
  .split('\n')
  .map((line) => '  ' + line)
  .join('\n');

// 4. Aktualizacja portals/ccn-news/src/data/articles.ts
const articlesTsPath = path.join(REPO, 'portals/ccn-news/src/data/articles.ts');
let articlesTs = fs.readFileSync(articlesTsPath, 'utf8');

const breakingEntry = `  "NOWY ARTYKUŁ CCN NEWS (DZIEŃ MĘŻCZYZN): Silni aż do wyczerpania: dlaczego mężczyźni wciąż boją się prosić o pomoc? Analiza Cezarego Rogowskiego (${CANONICAL_URL})",`;
if (!articlesTs.includes(SLUG)) {
  articlesTs = articlesTs.replace(
    /export const BREAKING_NEWS: string\[\] = \[\r?\n/,
    `export const BREAKING_NEWS: string[] = [\n${breakingEntry}\n`
  );
  articlesTs = articlesTs.replace(
    /export const INITIAL_ARTICLES: Article\[\] = \[\r?\n/,
    `export const INITIAL_ARTICLES: Article[] = [\n${serializedArticle},\n`
  );
  fs.writeFileSync(articlesTsPath, articlesTs, 'utf8');
  console.log('✅ Dodano artykuł LP 16 i BREAKING_NEWS do portals/ccn-news/src/data/articles.ts');
} else {
  console.log('ℹ️ Slug LP 16 już obecny w articles.ts');
}

// 5. Aktualizacja kalendarza 365 JSON
const calJsonPath = path.join(REPO, 'data/ekocc_kalendarz_365_artykulow.json');
const calJson = JSON.parse(fs.readFileSync(calJsonPath, 'utf8'));
const lp16 = calJson.artykuly.find((a) => a.lp === 16);
if (lp16) {
  lp16.status = 'Opublikowany (Autoryzacja L0: 2026-11-19)';
  lp16.bramka_bezpieczenstwa = 'T3 (OPUBLIKOWANO PRODUKCYJNIE)';
  lp16.portal_docelowy = 'CCN News / Rodzina i relacje';
  lp16.url_opublikowany = CANONICAL_URL;
  lp16.data_publikacji_dokonana = '2026-11-19T05:15:00+01:00';
  fs.writeFileSync(calJsonPath, JSON.stringify(calJson, null, 2), 'utf8');
  console.log('✅ Zaktualizowano data/ekocc_kalendarz_365_artykulow.json (LP 16)');
}

// 6. Aktualizacja CSV kalendarza
const calCsvPath = path.join(REPO, 'data/kalendarz_365_artykulow/EkoCC_365_Dni_Kalendarz.csv');
if (fs.existsSync(calCsvPath)) {
  const csvLines = fs.readFileSync(calCsvPath, 'utf8').split(/\r?\n/);
  const updatedCsv = csvLines.map((line) => {
    if (line.startsWith('16;2026-11-19;')) {
      return line.replace(
        /;Opracowany \/ Czeka na autoryzację L0;/,
        ';Opublikowany (Autoryzacja L0: 2026-11-19);'
      );
    }
    return line;
  });
  fs.writeFileSync(calCsvPath, updatedCsv.join('\n'), 'utf8');
  console.log('✅ Zaktualizowano EkoCC_365_Dni_Kalendarz.csv (LP 16)');
}

// 7. Aktualizacja data/ccn-news-ticker.json
const tickerPath = path.join(REPO, 'data/ccn-news-ticker.json');
if (fs.existsSync(tickerPath)) {
  const ticker = JSON.parse(fs.readFileSync(tickerPath, 'utf8'));
  const item = {
    category: 'RODZINA & WIARA',
    text: `Silni aż do wyczerpania: dlaczego mężczyźni wciąż boją się prosić o pomoc? — analiza Cezarego Rogowskiego na Dzień Mężczyzn`,
    url: `/news/${SLUG}`,
  };
  if (Array.isArray(ticker.items)) {
    if (!ticker.items.some((x) => x.url && x.url.includes(SLUG))) {
      ticker.items.unshift(item);
      ticker.updatedAt = new Date().toISOString();
    }
  } else if (Array.isArray(ticker)) {
    if (!ticker.some((x) => x.url && x.url.includes(SLUG))) {
      ticker.unshift(item);
    }
  }
  fs.writeFileSync(tickerPath, JSON.stringify(ticker, null, 2), 'utf8');
  console.log('✅ Zaktualizowano data/ccn-news-ticker.json');
}

// 8. Aktualizacja indeksów wyszukiwarki @w (data/cc-search-index.json i szukaj/catalog.json) + mirror
function upsertSearchFile(filePath, newItem) {
  if (!fs.existsSync(filePath)) return;
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (Array.isArray(parsed)) {
    if (!parsed.some((i) => i.url === newItem.url)) {
      parsed.unshift(newItem);
      fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf8');
    }
  } else if (Array.isArray(parsed.items)) {
    if (!parsed.items.some((i) => i.url === newItem.url)) {
      parsed.items.unshift(newItem);
      parsed.updatedAt = new Date().toISOString();
      fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf8');
    }
  }
}

const searchEntry = {
  id: ARTICLE_ID,
  title: rawJson.title,
  description: rawJson.lead || rawJson.title,
  url: `/news/${SLUG}`,
  category: 'Wiedza & Publicystyka',
  section: 'CCN News',
  tags: cleanTags,
  publishedAt: DATE_ISO,
  author: 'Cezary Rogowski',
  image: `/images/news/${IMG_NAME}`,
};

for (const base of [REPO, MIRROR]) {
  upsertSearchFile(path.join(base, 'data/cc-search-index.json'), searchEntry);
  upsertSearchFile(path.join(base, 'szukaj/catalog.json'), searchEntry);
}
console.log('✅ Zaktualizowano indeksy wyszukiwarki @w (repo + mirror)');

// 9. Aktualizacja data/ecosystem-map.json (@m = @mapaCC)
const mapPath = path.join(REPO, 'data/ecosystem-map.json');
if (fs.existsSync(mapPath)) {
  const ecoMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const entry = {
    topic: 'Publikacja artykułu LP 16 na Dzień Mężczyzn (CCN News / Rodzina)',
    date: DATE_ISO,
    agent: 'A',
  };
  const logArr = ecoMap.updates || ecoMap.changelog || ecoMap.recentUpdates;
  if (Array.isArray(logArr)) {
    if (!logArr.some((u) => u.date === DATE_ISO && u.topic && u.topic.includes('LP 16'))) {
      logArr.unshift(entry);
    }
  }
  ecoMap.lastUpdated = DATE_ISO;
  fs.writeFileSync(mapPath, JSON.stringify(ecoMap, null, 2), 'utf8');
  console.log('✅ Zaktualizowano data/ecosystem-map.json');
}
