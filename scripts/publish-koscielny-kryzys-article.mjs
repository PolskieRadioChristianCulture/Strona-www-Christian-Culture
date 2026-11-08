#!/usr/bin/env node
/**
 * PUBLIKACJA ARTYKUŁU: CZY W KOŚCIELE WOLNO MÓWIĆ O WŁASNYM KRYZYSIE?
 * Autor: Cezary Rogowski | 8 listopada 2026 r. (Slot 5 w Kalendarzu 365 EkoCC)
 * Portal docelowy: eM — Motywacja Christian Culture / CCN News (https://polskieradio.cc/news)
 *
 * Podręcznik Redakcyjny EkoCC Wersja 1.0 (30 października 2026)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageEkoccArticle } from './package-ekocc-article.mjs';
import { articleData } from './prepare-koscielny-kryzys-article.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

async function main() {
  console.log('🚀 Rozpoczynam publikację artykułu EkoCC (Slot 5: 2026-11-08)...');
  console.log('Tytuł:', articleData.title);

  // 1. Zapewnij obecność grafiki w obu katalogach (images/em i images/news)
  const newsImgPath = path.join(ROOT, 'images/news/art-czy-w-kosciele-wolno-mowic-o-wlasnym-kryzysie.jpg');
  if (fs.existsSync(articleData.imagePath) && !fs.existsSync(newsImgPath)) {
    fs.copyFileSync(articleData.imagePath, newsImgPath);
    console.log('✔ Skopiowano grafikę do images/news:', newsImgPath);
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
  contentParagraphs.push('PODSUMOWANIE REDAKCYJNE CCN');
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
    readTimeMinutes: 8,
    isHero: true,
    isPopular: true,
    popularRank: 1,
    tags: ${JSON.stringify(articleData.tags, null, 6)},
    author: AUTHORS.cezary,
    primaryPortalUrl: 'https://polskieradio.cc/news',
    primaryPortalLabel: 'eM • Motywacja Christian Culture',
    category: 'wiara',
    categoryLabel: 'eM • FORMACJA DUCHOWA I WSPÓLNOTA KOŚCIOŁA',
    publishedAt: '${articleData.date}T14:00:00Z',
    dateFormatted: '8 listopada 2026',
    scriptureReference: {
      verse: '2 Koryntian 12:9; List Jakuba 5:16 (UBG)',
      text: 'Lecz powiedział mi: Wystarczy ci moja łaska. Moja moc bowiem doskonali się w słabości. Wyznawajcie sobie nawzajem upadki i módlcie się jedni za drugich, abyście byli uzdrowieni.',
      strongCode: 'G769'
    },
    sourceCitation: {
      sourceName: 'Prof. Kenneth I. Pargament (Bowling Green State University), APA oraz raporty The Psychology of Religion and Coping',
      sourceUrl: 'https://www.apa.org',
      name: 'Prof. Kenneth I. Pargament (Bowling Green State University), APA oraz raporty The Psychology of Religion and Coping',
      url: 'https://www.apa.org'
    },
    actionLinks: [
      {
        label: 'eM — Motywacja Christian Culture',
        url: 'https://polskieradio.cc/em'
      },
      {
        label: 'Szpital dla zranionych — MojaBiblia',
        url: 'https://polskieradio.cc/mojabiblia'
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
      const breakingEntry = `  "NOWY ARTYKUŁ eM (@MCC): Czy w Kościele wolno mówić o własnym kryzysie? Egzegeza 2 Kor 12:9 i Jk 5:16 UBG autorstwa Cezarego Rogowskiego (https://polskieradio.cc/news/czy-w-kosciele-wolno-mowic-o-wlasnym-kryzysie)",\n`;
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

  // 5. Zaktualizuj kartę wyróżnioną w em.html
  const emHtmlPath = path.join(ROOT, 'em.html');
  if (fs.existsSync(emHtmlPath)) {
    let emHtml = fs.readFileSync(emHtmlPath, 'utf8');
    if (!emHtml.includes(articleData.slug)) {
      const newCardHtml = `
<div class="feature-inauguration" style="margin-top: 32px; margin-bottom: 24px; border: 1px solid rgba(214,174,104,0.55); border-radius: 18px; padding: clamp(20px, 3vw, 36px); background: radial-gradient(circle at 85% 20%, #4a151b 0%, #201322 50%, #0d0f17 100%); display: grid; grid-template-columns: 1.15fr 1fr; gap: 28px; align-items: center; overflow: hidden; position: relative; box-shadow: 0 10px 35px rgba(0,0,0,0.5);">
  <div>
    <span style="color: #ffd8a7; font-size: 11px; letter-spacing: 2px; font-weight: 850; text-transform: uppercase; display: inline-flex; align-items: center; gap: 6px;">
      <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#ed182c;"></span>
      NAJNOWSZY ARTYKUŁ eM • 8 LISTOPADA 2026
    </span>
    <h3 style="font-size: clamp(23px, 2.5vw, 34px); line-height: 1.15; margin: 14px 0 12px; color: #fff; letter-spacing: -1px;">
      Czy w Kościele wolno mówić<br><span style="color: #d6ae68;">o własnym kryzysie?</span>
    </h3>
    <p style="color: #cdd0db; font-size: 14px; line-height: 1.65; margin: 0 0 22px;">
      Iluzja nieskazitelności a biblijna prawda o słabości. Egzegeza 2 Kor 12:9 i Jk 5:16 UBG, psychologia religijnego wizerunku oraz 5 zasad bezpiecznej wspólnoty wiary autorstwa Cezarego Rogowskiego.
    </p>
    <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
      <a href="https://polskieradio.cc/news/${articleData.slug}" style="display: inline-flex; align-items: center; justify-content: center; min-height: 44px; background: #ed182c; color: white; padding: 12px 22px; border-radius: 8px; font-weight: 800; font-size: 13px; text-decoration: none; box-shadow: 0 4px 15px rgba(237,24,44,0.4);">
        Czytaj artykuł Cezarego Rogowskiego →
      </a>
      <span style="font-size: 12px; color: #a8adbc;">8 min czytania • Pismo Święte UBG</span>
    </div>
  </div>
  <div style="position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 16/9; box-shadow: 0 10px 30px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.12);">
    <a href="https://polskieradio.cc/news/${articleData.slug}" aria-label="Czytaj artykuł: Czy w Kościele wolno mówić o własnym kryzysie?">
      <img src="/images/news/art-${articleData.slug}.jpg" alt="Czy w Kościele wolno mówić o własnym kryzysie? — Cezary Rogowski" style="width: 100%; height: 100%; object-fit: cover; display: block;" loading="lazy" />
    </a>
  </div>
</div>
`;
      const targetPattern = '<div class="feature-inauguration"';
      const targetIdx = emHtml.indexOf(targetPattern);
      if (targetIdx !== -1) {
        emHtml = emHtml.slice(0, targetIdx) + newCardHtml + '\n' + emHtml.slice(targetIdx);
        fs.writeFileSync(emHtmlPath, emHtml, 'utf8');
        console.log('✔ Zaktualizowano em.html z nową kartą artykułu.');
      }
    }
  }

  // 6. Zaktualizuj data/ekocc_kalendarz_365_artykulow.json
  const kalendarzPath = path.join(ROOT, 'data/ekocc_kalendarz_365_artykulow.json');
  if (fs.existsSync(kalendarzPath)) {
    const calData = JSON.parse(fs.readFileSync(kalendarzPath, 'utf8'));
    const item = calData.artykuly.find(a => a.lp === 5 || a.data_publikacji === '2026-11-08');
    if (item) {
      item.status = 'Opublikowany (Autoryzacja L0: 2026-11-08)';
      item.url_opublikowany = `https://polskieradio.cc/news/${articleData.slug}`;
      item.data_publikacji_dokonana = '2026-11-08T14:00:00+01:00';
      item.pakiet_zip = pkg.zipPath;
      item.pakiet_docx = pkg.docxPath;
      item.grafika_16_9 = `images/news/art-${articleData.slug}.jpg`;
      item.data_opracowania = '2026-11-08T14:00:00+01:00';
      item.bramka_bezpieczenstwa = 'T3 (OPUBLIKOWANO PRODUKCYJNIE)';
      fs.writeFileSync(kalendarzPath, JSON.stringify(calData, null, 2), 'utf8');
      console.log('✔ Zaktualizowano data/ekocc_kalendarz_365_artykulow.json (Slot 5: Opublikowany).');
    }
  }

  // 7. Zaktualizuj data/ccn-news-ticker.json jeśli istnieje
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
