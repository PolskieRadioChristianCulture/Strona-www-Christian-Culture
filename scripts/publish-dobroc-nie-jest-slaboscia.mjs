import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const articlesFilePath = path.join(ROOT, 'portals/ccn-news/src/data/articles.ts');
let code = fs.readFileSync(articlesFilePath, 'utf8');

const articleId = 'art-dobroc-nie-jest-slaboscia-7-decyzji-ktore-zmieniaja-relacje';

if (code.includes(articleId)) {
  console.log(`ℹ️ Artykuł ${articleId} już istnieje w articles.ts.`);
} else {
  // Wczytaj dane z current-article-data.json
  const currentDataPath = path.join(ROOT, 'scripts/current-article-data.json');
  const articleData = JSON.parse(fs.readFileSync(currentDataPath, 'utf8'));

  // Zbuduj listę content
  const content = [];
  for (const s of articleData.sections) {
    content.push(s.heading);
    for (const p of s.paragraphs) {
      content.push(p);
    }
  }
  if (articleData.conclusion) {
    content.push('PODSUMOWANIE REDAKCYJNE');
    content.push(articleData.conclusion);
  }
  if (articleData.cta) {
    content.push('WEZWANIE DO DZIAŁANIA I MODLITWA');
    content.push(articleData.cta);
  }

  const newArticle = {
    id: articleId,
    title: articleData.title,
    slug: articleData.slug,
    excerpt: articleData.lead,
    content: content,
    category: "wiara",
    categoryLabel: "eM • Motywacja / Etyka chrześcijańska",
    author: "AUTHORS.cezary",
    publishedAt: "2026-11-13T14:00:00+01:00",
    dateFormatted: "13 listopada 2026",
    imageUrl: "/images/news/art-dobroc-nie-jest-slaboscia-7-decyzji-ktore-zmieniaja-relacje.jpg",
    imageCaption: articleData.imageCaption,
    readTimeMinutes: 8,
    isHero: true,
    isPopular: true,
    popularRank: 1,
    tags: articleData.tags,
    scriptureReference: {
      verse: "Ef 4:32 (UBG)",
      text: "Bądźcie dla siebie nawzajem życzliwi, miłosierni, przebaczając sobie nawzajem, jak i wam Bóg przebaczył w Chrystusie.",
      strongCode: "G5544"
    },
    sourceCitation: {
      sourceName: "The Gottman Institute (University of Washington) & Harvard Study of Adult Development",
      sourceUrl: "https://www.gottman.com"
    },
    biblicalCommentary: {
      thesis: "Biblijna dobroć (chesed, chrestotes, praotes) nie jest bezradną uległością, lecz potęgą pod kontrolą Boga i owocem Ducha Świętego, który zwycięża zło dobrem.",
      verses: [
        { ref: "Ef 4:32 (UBG)", text: "Bądźcie dla siebie nawzajem życzliwi, miłosierni, przebaczając sobie nawzajem, jak i wam Bóg przebaczył w Chrystusie.", strongRef: "G5544" },
        { ref: "Rz 12:21 (UBG)", text: "Nie daj się zwyciężyć złu, ale zło dobrem zwyciężaj." },
        { ref: "Mt 5:5 (UBG)", text: "Błogosławieni cisi, bo oni odziedziczą ziemię.", strongRef: "G4240" },
        { ref: "2 Sm 9:1-7 (UBG)", text: "Czy został jeszcze ktoś z domu Saula, abym mógł mu okazać miłosierdzie [chesed] przez wzgląd na Jonatana?", strongRef: "H2617" }
      ],
      explanation: "Człowiek nie potrafi wykrzesać trwałej miłości agape wyłącznie o własnych siłach moralnych. Dopiero doświadczenie niezasłużonej dobroci Boga w Chrystusie uzdalnia serce do przebaczenia i ofiarnej życzliwości."
    },
    primaryPortalUrl: "https://polskieradio.cc/eM",
    primaryPortalLabel: "eM • Motywacja Christian Culture",
    resourceLinks: [
      { label: "Interlinearna MojaBiblia CC (Kody Stronga i Greka)", url: "/mojabiblia" },
      { label: "Portal eM Motywacja CC", url: "/eM" },
      { label: "Akademia Biblijna Christian Culture", url: "/akademia" },
      { label: "Wsparcie Misji Christian Culture", url: "/wspieraj" }
    ]
  };

  let articleCode = JSON.stringify(newArticle, null, 2);
  articleCode = articleCode.replace('"author": "AUTHORS.cezary"', '"author": AUTHORS.cezary');

  // Wstaw na początku INITIAL_ARTICLES
  const marker = 'export const INITIAL_ARTICLES: Article[] = [\n';
  const idx = code.indexOf(marker);
  if (idx === -1) {
    throw new Error('Nie znaleziono INITIAL_ARTICLES w articles.ts');
  }

  code = code.slice(0, idx + marker.length) + '  ' + articleCode + ',\n' + code.slice(idx + marker.length);

  // Dodaj do BREAKING_NEWS
  const breakingMarker = 'export const BREAKING_NEWS: string[] = [\n';
  const bIdx = code.indexOf(breakingMarker);
  if (bIdx !== -1) {
    const newBreaking = `  "NOWY ARTYKUŁ eM (@MCC): Dobroć nie jest słabością. 7 decyzji, które zmieniają relacje — analiza Cezarego Rogowskiego na Światowy Dzień Dobroci (https://polskieradio.cc/news/dobroc-nie-jest-slaboscia-7-decyzji-ktore-zmieniaja-relacje)",\n`;
    code = code.slice(0, bIdx + breakingMarker.length) + newBreaking + code.slice(bIdx + breakingMarker.length);
  }

  fs.writeFileSync(articlesFilePath, code, 'utf8');
  console.log(`✅ Artykuł ${articleId} pomyślnie dopisany do articles.ts!`);
}

// Aktualizacja data/ccn-news-ticker.json
const tickerPath = path.join(ROOT, 'data/ccn-news-ticker.json');
if (fs.existsSync(tickerPath)) {
  const ticker = JSON.parse(fs.readFileSync(tickerPath, 'utf8'));
  const newItem = {
    topic: "ŚWIATOWY DZIEŃ DOBROCI 2026",
    text: "Dobroć nie jest słabością: 7 decyzji, które zmieniają relacje — nowa analiza Cezarego Rogowskiego na polskieradio.cc"
  };
  const alreadyInTicker = ticker.items.some(i => i.topic.includes('DOBROCI'));
  if (!alreadyInTicker) {
    ticker.items.unshift(newItem);
    ticker.updatedAt = new Date().toISOString();
    fs.writeFileSync(tickerPath, JSON.stringify(ticker, null, 2), 'utf8');
    console.log('✅ Zaktualizowano pasek informacyjny TV w ccn-news-ticker.json!');
  }
}

// Aktualizacja data/ecosystem-map.json
const mapPath = path.join(ROOT, 'data/ecosystem-map.json');
if (fs.existsSync(mapPath)) {
  const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const newMapEntry = {
    date: "2026-11-13",
    topic: "CCN News & eM: Dobroć nie jest słabością. 7 decyzji, które zmieniają relacje (Światowy Dzień Dobroci)",
    agent: "A"
  };
  const alreadyInMap = mapData.updatesLog.some(u => u.topic.includes('Dobroć nie jest słabością'));
  if (!alreadyInMap) {
    mapData.updatesLog.unshift(newMapEntry);
    fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
    console.log('✅ Zaktualizowano rejestr na Żywej Mapie Ekosystemu (@m)!');
  }
}
