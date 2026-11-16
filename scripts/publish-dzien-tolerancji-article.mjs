#!/usr/bin/env node
/**
 * PUBLIKACJA ARTYKUŁU: DZIEŃ TOLERANCJI: CZY SZACUNEK OZNACZA ZGODĘ NA WSZYSTKO?
 * Autor: Cezary Rogowski | 16 listopada 2026 r. (Slot 13 w Kalendarzu 365 EkoCC)
 * Portal docelowy: CCN News / Aktualności (https://polskieradio.cc/news)
 *
 * Podręcznik Redakcyjny EkoCC Wersja 1.0 (30 października 2026)
 * Mandat Bezpośredni Dowódcy Nazira — Autoryzacja Wykonawcza L0 (Bramka T4 -> T3)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageEkoccArticle } from './package-ekocc-article.mjs';
import { articleData } from './prepare-dzien-tolerancji-article.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

async function main() {
  console.log('🚀 Rozpoczynam publikację artykułu EkoCC (Slot 13: 2026-11-16)...');
  console.log('Tytuł:', articleData.title);

  // 1. Zapewnij obecność grafiki
  const newsImgPath = path.join(ROOT, 'images/news/art-dzien-tolerancji-szacunek-czy-zgoda-na-wszystko.jpg');
  if (fs.existsSync(articleData.imagePath) && !fs.existsSync(newsImgPath)) {
    fs.copyFileSync(articleData.imagePath, newsImgPath);
    console.log('✔ Skopiowano grafikę do images/news:', newsImgPath);
  } else if (fs.existsSync(newsImgPath)) {
    console.log('✔ Grafika w images/news już istnieje.');
  } else {
    throw new Error(`Brak grafiki: ${newsImgPath}`);
  }

  // 2. Spakuj kompletny pakiet DOCX, TXT, SEO.txt i ZIP na Pulpicie
  const pkg = await packageEkoccArticle(articleData);
  console.log('✔ Spakowano pakiet redakcyjny na Pulpicie:', pkg.zipPath);

  // 3. Przygotuj strukturę akapitów content dla articles.ts
  const contentParagraphs = [articleData.lead];
  for (const s of articleData.sections) {
    contentParagraphs.push(s.heading);
    for (const p of s.paragraphs) {
      contentParagraphs.push(p);
    }
  }
  contentParagraphs.push('PODSUMOWANIE REDAKCYJNE CCN NEWS');
  contentParagraphs.push(articleData.conclusion);
  contentParagraphs.push('WEZWANIE DO DZIAŁANIA I MODLITWA');
  contentParagraphs.push(articleData.cta);

  // 4. Dodaj do portals/ccn-news/src/data/articles.ts
  const newsArticlesTsPath = path.join(ROOT, 'portals/ccn-news/src/data/articles.ts');
  let newsCode = fs.readFileSync(newsArticlesTsPath, 'utf8');

  const articleEntry = `  {
    id: 'art-${articleData.slug}',
    title: ${JSON.stringify(articleData.title)},
    slug: '${articleData.slug}',
    excerpt: ${JSON.stringify(articleData.lead)},
    content: ${JSON.stringify(contentParagraphs, null, 6)},
    imageUrl: '/images/news/art-${articleData.slug}.jpg',
    imageCaption: ${JSON.stringify(articleData.imageCaption)},
    readTimeMinutes: 9,
    isHero: true,
    isPopular: true,
    popularRank: 1,
    tags: ${JSON.stringify(articleData.tags, null, 6)},
    author: AUTHORS.cezary,
    primaryPortalUrl: 'https://polskieradio.cc/news/${articleData.slug}',
    primaryPortalLabel: 'CCN NEWS • MIĘDZYNARODOWY DZIEŃ TOLERANCJI',
    category: 'spoleczenstwo',
    categoryLabel: 'CCN NEWS • MIĘDZYNARODOWY DZIEŃ TOLERANCJI',
    publishedAt: '${articleData.date}T14:00:00Z',
    dateFormatted: '16 listopada 2026',
    scriptureReference: {
      verse: 'Ewangelia Jana 4:24; List do Efezjan 4:15; 1 List Piotra 3:15 (UBG)',
      text: 'Lecz mówiąc prawdę w miłości, we wszystkim rośnijmy w tego, który jest głową — w Chrystusa... Bądźcie zawsze gotowi do obrony przed każdym, kto domaga się od was uzasadnienia waszej nadziei, z łagodnością i bojaźnią.',
      strongCode: 'G226'
    },
    sourceCitation: {
      sourceName: 'UNESCO (Deklaracja Zasad Tolerancji 1995), ONZ, John Locke, Karl Popper oraz UBG',
      sourceUrl: 'https://polskieradio.cc/mojabiblia',
      name: 'UNESCO (Deklaracja Zasad Tolerancji 1995), ONZ, John Locke, Karl Popper oraz UBG',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    actionLinks: [
      {
        label: 'MojaBiblia — Ewangelia Jana 4 (Samarytanka)',
        url: 'https://polskieradio.cc/mojabiblia'
      },
      {
        label: 'CCN News — Wszystkie artykuły',
        url: 'https://polskieradio.cc/news'
      }
    ]
  },
`;

  if (!newsCode.includes(`'art-${articleData.slug}'`)) {
    const insertIdx = newsCode.indexOf('export const INITIAL_ARTICLES: Article[] = [');
    if (insertIdx !== -1) {
      const insertPos = insertIdx + 'export const INITIAL_ARTICLES: Article[] = [\n'.length;
      newsCode = newsCode.slice(0, insertPos) + articleEntry + newsCode.slice(insertPos);

      // Dodaj także do BREAKING_NEWS
      const breakingEntry = `  "NOWY ARTYKUŁ CCN NEWS: Dzień Tolerancji: czy szacunek oznacza zgodę na wszystko? Analiza Cezarego Rogowskiego o prawdzie w miłości i Deklaracji UNESCO (https://polskieradio.cc/news/${articleData.slug})",\n`;
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

  // 5. Zaktualizuj data/ekocc_kalendarz_365_artykulow.json
  const kalendarzPath = path.join(ROOT, 'data/ekocc_kalendarz_365_artykulow.json');
  if (fs.existsSync(kalendarzPath)) {
    const calData = JSON.parse(fs.readFileSync(kalendarzPath, 'utf8'));
    const item = calData.artykuly.find(a => a.lp === 13 || a.data_publikacji === '2026-11-16');
    if (item) {
      item.status = 'Opublikowany (Autoryzacja L0: 2026-11-16)';
      item.url_opublikowany = `https://polskieradio.cc/news/${articleData.slug}`;
      item.data_publikacji_dokonana = '2026-11-16T14:00:00+01:00';
      item.pakiet_zip = pkg.zipPath;
      item.pakiet_docx = pkg.docxPath;
      item.grafika_16_9 = `images/news/art-${articleData.slug}.jpg`;
      item.data_opracowania = '2026-11-16T14:00:00+01:00';
      item.bramka_bezpieczenstwa = 'T3 (OPUBLIKOWANO PRODUKCYJNIE)';
      item.slug = articleData.slug;
      item.autor = articleData.author;
      fs.writeFileSync(kalendarzPath, JSON.stringify(calData, null, 2), 'utf8');
      console.log('✔ Zaktualizowano data/ekocc_kalendarz_365_artykulow.json (Slot 13: Opublikowany).');
    }
  }

  // 6. Zaktualizuj CSV data/kalendarz_365_artykulow/EkoCC_365_Dni_Kalendarz.csv
  const csvPath = path.join(ROOT, 'data/kalendarz_365_artykulow/EkoCC_365_Dni_Kalendarz.csv');
  if (fs.existsSync(csvPath)) {
    let csvContent = fs.readFileSync(csvPath, 'utf8');
    csvContent = csvContent.replace(
      '13;2026-11-16;poniedziałek;2026-11-16;Temat sezonowy / uzupełniający;Dzień Tolerancji: czy szacunek oznacza zgodę na wszystko?;NEWS;CCN News / aktualności;B;2026-11-08;Opracowany / Czeka na autoryzację L0;',
      '13;2026-11-16;poniedziałek;2026-11-16;Temat sezonowy / uzupełniający;Dzień Tolerancji: czy szacunek oznacza zgodę na wszystko?;NEWS;CCN News / aktualności;B;2026-11-08;Opublikowany (Autoryzacja L0: 2026-11-16);'
    );
    csvContent = csvContent.replace(
      '13;2026-11-16;poniedziałek;2026-11-16;Temat sezonowy / uzupełniający;Dzień Tolerancji: czy szacunek oznacza zgodę na wszystko?;NEWS;CCN News / aktualności;B;2026-11-08;Planowany / do opracowania;',
      '13;2026-11-16;poniedziałek;2026-11-16;Temat sezonowy / uzupełniający;Dzień Tolerancji: czy szacunek oznacza zgodę na wszystko?;NEWS;CCN News / aktualności;B;2026-11-08;Opublikowany (Autoryzacja L0: 2026-11-16);'
    );
    fs.writeFileSync(csvPath, csvContent, 'utf8');
    console.log('✔ Zaktualizowano data/kalendarz_365_artykulow/EkoCC_365_Dni_Kalendarz.csv.');
  }

  // 7. Zaktualizuj data/ccn-news-ticker.json
  const tickerPath = path.join(ROOT, 'data/ccn-news-ticker.json');
  if (fs.existsSync(tickerPath)) {
    try {
      const tickerData = JSON.parse(fs.readFileSync(tickerPath, 'utf8'));
      const tickerItem = {
        title: `${articleData.title} — ${articleData.author}`,
        url: `https://polskieradio.cc/news/${articleData.slug}`,
        publishedAt: `${articleData.date}T14:00:00Z`
      };
      if (Array.isArray(tickerData.items)) {
        tickerData.items = tickerData.items.filter(it => it.url !== tickerItem.url);
        tickerData.items.unshift(tickerItem);
        tickerData.items = tickerData.items.slice(0, 20);
        tickerData.updatedAt = new Date().toISOString();
        fs.writeFileSync(tickerPath, JSON.stringify(tickerData, null, 2), 'utf8');
        console.log('✔ Zaktualizowano data/ccn-news-ticker.json.');
      }
    } catch (e) {
      console.warn('Uwaga przy aktualizacji tickera:', e.message);
    }
  }

  // 8. Zaktualizuj data/ecosystem-map.json
  const mapPath = path.join(ROOT, 'data/ecosystem-map.json');
  if (fs.existsSync(mapPath)) {
    try {
      const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
      const updateEntry = {
        date: articleData.date,
        topic: 'CCN News / Kalendarz 365: Publikacja artykułu LP 13 („Dzień Tolerancji: czy szacunek oznacza zgodę na wszystko?”) — autoryzacja L0 (bramka T3)',
        agent: 'A'
      };
      if (!mapData.recentUpdates) mapData.recentUpdates = [];
      mapData.recentUpdates = mapData.recentUpdates.filter(u => !u.topic.includes('LP 13'));
      mapData.recentUpdates.unshift(updateEntry);
      mapData.recentUpdates = mapData.recentUpdates.slice(0, 25);

      if (!mapData.updatesLog) mapData.updatesLog = [];
      mapData.updatesLog = mapData.updatesLog.filter(u => !u.topic.includes('LP 13'));
      mapData.updatesLog.unshift(updateEntry);
      mapData.updatesLog = mapData.updatesLog.slice(0, 60);

      mapData.lastUpdated = `${articleData.date}T14:00:00+01:00`;
      fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
      console.log('✔ Zaktualizowano data/ecosystem-map.json.');
    } catch (e) {
      console.warn('Uwaga przy aktualizacji ecosystem-map:', e.message);
    }
  }

  // 9. Indeksowanie wyszukiwarki @w
  const searchIndexTarget = {
    title: articleData.title,
    category: 'Wiadomości i artykuły',
    url: `https://polskieradio.cc/news/${articleData.slug}`,
    description: articleData.lead,
    image: `https://polskieradio.cc/images/news/art-${articleData.slug}.jpg`,
    tags: [
      'dzień tolerancji',
      'tolerancja',
      'szacunek',
      'prawda',
      'wolność sumienia',
      'dialog',
      'unesco',
      'biblia',
      'cezary rogowski',
      'ccn news',
      '16 listopada 2026'
    ],
    featured: true
  };

  const searchFiles = [
    path.join(ROOT, 'data/cc-search-index.json'),
    path.join(ROOT, 'szukaj/catalog.json'),
    'C:/Users/czark/Desktop/@ICC/LUMINA/data/cc-search-index.json',
    'C:/Users/czark/Desktop/@ICC/LUMINA/szukaj/catalog.json'
  ];

  for (const sf of searchFiles) {
    if (fs.existsSync(sf)) {
      try {
        const sdata = JSON.parse(fs.readFileSync(sf, 'utf8'));
        if (Array.isArray(sdata.items)) {
          sdata.items = sdata.items.filter(i => (i.url || '').toLowerCase() !== searchIndexTarget.url.toLowerCase());
          const newsIdx = sdata.items.findIndex(i => (i.category || '').includes('Wiadomości') || (i.url || '').includes('/news/'));
          if (newsIdx >= 0) {
            sdata.items.splice(newsIdx, 0, searchIndexTarget);
          } else {
            sdata.items.unshift(searchIndexTarget);
          }
          sdata.totalItems = sdata.items.length;
          sdata.updatedAt = new Date().toISOString();
          fs.writeFileSync(sf, JSON.stringify(sdata, null, 2), 'utf8');
          console.log(`✔ Zaktualizowano wyszukiwarkę @w w: ${sf}`);
        }
      } catch (err) {
        console.warn(`Błąd aktualizacji indeksu ${sf}:`, err.message);
      }
    }
  }

  console.log('\n🎉 Rejestracja artykułu i aktualizacja struktur zakończona sukcesem!');
}

main().catch(err => {
  console.error('❌ Błąd publikacji:', err);
  process.exit(1);
});
