#!/usr/bin/env node
/**
 * PUBLIKACJA ARTYKUŁU: ŚWIĘTOŚĆ NIE WYMAGA UDAWANIA: DLACZEGO PRAWDA O SŁABOŚCI UWALNIA?
 * Autor: Cezary Rogowski | 9 listopada 2026 r. (Slot 6 w Kalendarzu 365 EkoCC)
 * Portal docelowy: CCN News (https://polskieradio.cc/news)
 *
 * Podręcznik Redakcyjny EkoCC Wersja 1.0 (30 października 2026)
 * Autoryzacja Wykonawcza: L0 / Dowódca Nazir (Bramka T4 -> T3)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageEkoccArticle } from './package-ekocc-article.mjs';
import { articleData } from './prepare-swietosc-bez-udawania-article.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

async function main() {
  console.log('🚀 Rozpoczynam publikację artykułu EkoCC (Slot 6: 2026-11-09)...');
  console.log('Tytuł:', articleData.title);

  // 1. Spakuj kompletny pakiet DOCX, TXT, SEO.txt i ZIP na Pulpicie
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
    imageCaption: ${JSON.stringify(articleData.imageCaption)},
    readTimeMinutes: 8,
    isHero: true,
    isPopular: true,
    popularRank: 1,
    tags: ${JSON.stringify(articleData.tags, null, 6)},
    author: AUTHORS.cezary,
    primaryPortalUrl: 'https://polskieradio.cc/news',
    primaryPortalLabel: 'CCN News / aktualności',
    category: 'wiara',
    categoryLabel: 'CCN NEWS • FORMACJA DUCHOWA, UŚWIĘCENIE I PRAWDZIWA WOLNOŚĆ',
    publishedAt: '${articleData.date}T14:00:00Z',
    dateFormatted: '9 listopada 2026',
    scriptureReference: {
      verse: '2 Koryntian 4:7; 2 Koryntian 12:9 (UBG)',
      text: 'Mamy zaś ten skarb w naczyniach glinianych, aby wspaniałość tej mocy była z Boga, a nie z nas. Moja moc bowiem doskonali się w słabości.',
      strongCode: 'G3749'
    },
    sourceCitation: {
      sourceName: 'Harold G. Koenig (Duke University Medical Center), Kenneth I. Pargament oraz Brené Brown',
      sourceUrl: 'https://spiritualityandhealth.duke.edu',
      name: 'Harold G. Koenig (Duke University Medical Center), Kenneth I. Pargament oraz Brené Brown',
      url: 'https://spiritualityandhealth.duke.edu'
    },
    actionLinks: [
      {
        label: 'CCN News — Wiadomości i Formacja',
        url: 'https://polskieradio.cc/news'
      },
      {
        label: 'Gliniane naczynia — MojaBiblia 2 Kor 4:7',
        url: 'https://polskieradio.cc/mojabiblia?ref=2CO.4.7'
      }
    ]
  },
`;

  // Sprawdź czy artykuł już istnieje w articles.ts
  if (!newsCode.includes(`'art-${articleData.slug}'`)) {
    const insertIdx = newsCode.indexOf('export const INITIAL_ARTICLES: Article[] = [');
    if (insertIdx !== -1) {
      const insertPos = insertIdx + 'export const INITIAL_ARTICLES: Article[] = [\n'.length;
      newsCode = newsCode.slice(0, insertPos) + articleEntry + newsCode.slice(insertPos);

      // Dodaj także do BREAKING_NEWS
      const breakingEntry = `  "NOWY ARTYKUŁ CCN NEWS: Świętość nie wymaga udawania: dlaczego prawda o słabości uwalnia? Analiza Cezarego Rogowskiego o glinianych naczyniach i Bożej łasce (https://polskieradio.cc/news/swietosc-nie-wymaga-udawania-dlaczego-prawda-o-slabosci-uwalnia)",\n`;
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
    const item = calData.artykuly.find(a => a.lp === 6 || a.data_publikacji === '2026-11-09');
    if (item) {
      item.status = 'Opublikowany (Autoryzacja L0: 2026-11-09)';
      item.url_opublikowany = `https://polskieradio.cc/news/${articleData.slug}`;
      item.data_publikacji_dokonana = '2026-11-09T14:00:00+01:00';
      item.pakiet_zip = pkg.zipPath;
      item.pakiet_docx = pkg.docxPath;
      item.grafika_16_9 = `images/news/art-${articleData.slug}.jpg`;
      item.data_opracowania = '2026-11-09T14:00:00+01:00';
      item.bramka_bezpieczenstwa = 'T3 (OPUBLIKOWANO PRODUKCYJNIE)';
      fs.writeFileSync(kalendarzPath, JSON.stringify(calData, null, 2), 'utf8');
      console.log('✔ Zaktualizowano data/ekocc_kalendarz_365_artykulow.json (Slot 6: Opublikowany).');
    }
  }

  // 5. Zaktualizuj data/ccn-news-ticker.json jeśli istnieje
  const tickerPath = path.join(ROOT, 'data/ccn-news-ticker.json');
  if (fs.existsSync(tickerPath)) {
    try {
      const tickerData = JSON.parse(fs.readFileSync(tickerPath, 'utf8'));
      const tickerItem = {
        title: articleData.title,
        url: `https://polskieradio.cc/news/${articleData.slug}`,
        publishedAt: `${articleData.date}T14:00:00Z`
      };
      if (Array.isArray(tickerData.items)) {
        tickerData.items.unshift(tickerItem);
        tickerData.items = tickerData.items.slice(0, 20);
        fs.writeFileSync(tickerPath, JSON.stringify(tickerData, null, 2), 'utf8');
        console.log('✔ Zaktualizowano data/ccn-news-ticker.json.');
      }
    } catch (e) {
      console.warn('Uwaga przy aktualizacji tickera:', e.message);
    }
  }

  console.log('\n🎉 Rejestracja artykułu i przygotowanie paczek zakończone sukcesem!');
}

main().catch(err => {
  console.error('❌ Błąd publikacji:', err);
  process.exit(1);
});
