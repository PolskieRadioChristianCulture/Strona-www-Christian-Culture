#!/usr/bin/env node
/**
 * PUBLIKACJA ARTYKUŁU: GDY RELIGIA STAJE SIĘ KONKURSEM NA NIENAGANNY WIZERUNEK
 * Autor: Cezary Rogowski | 15 listopada 2026 r. (Slot 12 w Kalendarzu 365 EkoCC)
 * Portal docelowy: eM — Motywacja Christian Culture / CCN News (https://polskieradio.cc/news)
 *
 * Podręcznik Redakcyjny EkoCC Wersja 1.0 (30 października 2026)
 * Mandat Bezpośredni Dowódcy Nazira — Autoryzacja Wykonawcza L0 (Bramka T4 -> T3)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageEkoccArticle } from './package-ekocc-article.mjs';
import { articleData } from './prepare-religia-wizerunek-article.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

async function main() {
  console.log('🚀 Rozpoczynam publikację artykułu EkoCC (Slot 12: 2026-11-15)...');
  console.log('Tytuł:', articleData.title);

  // 1. Zapewnij obecność grafiki w obu katalogach (images/em i images/news)
  const newsImgPath = path.join(ROOT, 'images/news/art-gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek.jpg');
  if (fs.existsSync(articleData.imagePath) && !fs.existsSync(newsImgPath)) {
    fs.copyFileSync(articleData.imagePath, newsImgPath);
    console.log('✔ Skopiowano grafikę do images/news:', newsImgPath);
  } else if (fs.existsSync(newsImgPath)) {
    console.log('✔ Grafika w images/news już istnieje.');
  }

  // 2. Spakuj kompletny pakiet DOCX, TXT, SEO.txt i ZIP na Pulpicie jeśli potrzeba
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
  contentParagraphs.push('PODSUMOWANIE REDAKCYJNE CCN / eM');
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
    primaryPortalUrl: 'https://polskieradio.cc/news',
    primaryPortalLabel: 'eM • Motywacja Christian Culture',
    category: 'wiara',
    categoryLabel: 'eM • FORMACJA DUCHOWA, ETYKA I WSPÓLNOTA KOŚCIOŁA',
    publishedAt: '${articleData.date}T14:00:00Z',
    dateFormatted: '15 listopada 2026',
    scriptureReference: {
      verse: 'Mateusza 23:27–28; Łukasza 18:13–14; 1 Samuela 16:7 (UBG)',
      text: 'Biada wam, uczeni w Piśmie i faryzeusze, obłudnicy! Bo jesteście podobni do grobów pobielanych... PAN nie patrzy na to, na co patrzy człowiek. Człowiek bowiem patrzy na to, co jest przed oczyma, ale PAN patrzy na serce.',
      strongCode: 'G5273'
    },
    sourceCitation: {
      sourceName: 'Prof. Erving Goffman, Prof. Gordon Allport, Prof. Kenneth I. Pargament, Dr Brené Brown oraz UBG',
      sourceUrl: 'https://polskieradio.cc/mojabiblia',
      name: 'Prof. Erving Goffman, Prof. Gordon Allport, Prof. Kenneth I. Pargament, Dr Brené Brown oraz UBG',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    actionLinks: [
      {
        label: 'eM — Motywacja Christian Culture',
        url: 'https://polskieradio.cc/em'
      },
      {
        label: 'Pan patrzy na serce — MojaBiblia (1 Sm 16)',
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
      const breakingEntry = `  "NOWY ARTYKUŁ eM (@MCC): Gdy religia staje się konkursem na nienaganny wizerunek — analiza Cezarego Rogowskiego o faryzejskiej presji i łasce Chrystusa (https://polskieradio.cc/news/gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek)",\n`;
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
      NAJNOWSZY ARTYKUŁ eM • 15 LISTOPADA 2026
    </span>
    <h3 style="font-size: clamp(23px, 2.5vw, 34px); line-height: 1.15; margin: 14px 0 12px; color: #fff; letter-spacing: -1px;">
      Gdy religia staje się<br><span style="color: #d6ae68;">konkursem na nienaganny wizerunek</span>
    </h3>
    <p style="color: #cdd0db; font-size: 14px; line-height: 1.65; margin: 0 0 22px;">
      Teatr życia niedzielnego a prawda serca przed Bogiem. Egzegeza greckiego hypokrites (Mt 23, Łk 18), badania socjologiczne Goffmana i Allporta oraz 6 kroków do wiary bez masek autorstwa Cezarego Rogowskiego.
    </p>
    <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
      <a href="https://polskieradio.cc/news/${articleData.slug}" style="display: inline-flex; align-items: center; justify-content: center; min-height: 44px; background: #ed182c; color: white; padding: 12px 22px; border-radius: 8px; font-weight: 800; font-size: 13px; text-decoration: none; box-shadow: 0 4px 15px rgba(237,24,44,0.4);">
        Czytaj artykuł Cezarego Rogowskiego →
      </a>
      <span style="font-size: 12px; color: #a8adbc;">9 min czytania • Pismo Święte UBG</span>
    </div>
  </div>
  <div style="position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 16/9; box-shadow: 0 10px 30px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.12);">
    <a href="https://polskieradio.cc/news/${articleData.slug}" aria-label="Czytaj artykuł: Gdy religia staje się konkursem na nienaganny wizerunek">
      <img src="/images/news/art-${articleData.slug}.jpg" alt="Gdy religia staje się konkursem na nienaganny wizerunek — Cezary Rogowski" style="width: 100%; height: 100%; object-fit: cover; display: block;" loading="lazy" />
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
    const item = calData.artykuly.find(a => a.lp === 12 || a.data_publikacji === '2026-11-15');
    if (item) {
      item.status = 'Opublikowany (Autoryzacja L0: 2026-11-15)';
      item.url_opublikowany = `https://polskieradio.cc/news/${articleData.slug}`;
      item.data_publikacji_dokonana = '2026-11-15T14:00:00+01:00';
      item.pakiet_zip = pkg.zipPath;
      item.pakiet_docx = pkg.docxPath;
      item.grafika_16_9 = `images/news/art-${articleData.slug}.jpg`;
      item.data_opracowania = '2026-11-15T14:00:00+01:00';
      item.bramka_bezpieczenstwa = 'T3 (OPUBLIKOWANO PRODUKCYJNIE)';
      fs.writeFileSync(kalendarzPath, JSON.stringify(calData, null, 2), 'utf8');
      console.log('✔ Zaktualizowano data/ekocc_kalendarz_365_artykulow.json (Slot 12: Opublikowany).');
    }
  }

  // 7. Zaktualizuj CSV data/kalendarz_365_artykulow/EkoCC_365_Dni_Kalendarz.csv
  const csvPath = path.join(ROOT, 'data/kalendarz_365_artykulow/EkoCC_365_Dni_Kalendarz.csv');
  if (fs.existsSync(csvPath)) {
    let csvContent = fs.readFileSync(csvPath, 'utf8');
    csvContent = csvContent.replace(
      '12;2026-11-15;niedziela;2026-11-15;Temat sezonowy / uzupełniający;Gdy religia staje się konkursem na nienaganny wizerunek;eM;eM — Motywacja Christian Culture;B;2026-11-07;Opracowany / Czeka na autoryzację L0;',
      '12;2026-11-15;niedziela;2026-11-15;Temat sezonowy / uzupełniający;Gdy religia staje się konkursem na nienaganny wizerunek;eM;eM — Motywacja Christian Culture;B;2026-11-07;Opublikowany (Autoryzacja L0: 2026-11-15);'
    );
    // W razie gdyby status był stary:
    csvContent = csvContent.replace(
      '12;2026-11-15;niedziela;2026-11-15;Temat sezonowy / uzupełniający;Gdy religia staje się konkursem na nienaganny wizerunek;eM;eM — Motywacja Christian Culture;B;2026-11-07;Planowany / do opracowania;',
      '12;2026-11-15;niedziela;2026-11-15;Temat sezonowy / uzupełniający;Gdy religia staje się konkursem na nienaganny wizerunek;eM;eM — Motywacja Christian Culture;B;2026-11-07;Opublikowany (Autoryzacja L0: 2026-11-15);'
    );
    fs.writeFileSync(csvPath, csvContent, 'utf8');
    console.log('✔ Zaktualizowano data/kalendarz_365_artykulow/EkoCC_365_Dni_Kalendarz.csv.');
  }

  // 8. Zaktualizuj data/ccn-news-ticker.json
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

  // 9. Zaktualizuj data/ecosystem-map.json
  const mapPath = path.join(ROOT, 'data/ecosystem-map.json');
  if (fs.existsSync(mapPath)) {
    try {
      const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
      const updateEntry = {
        date: articleData.date,
        topic: 'eM / Kalendarz 365: Publikacja artykułu LP 12 („Gdy religia staje się konkursem na nienaganny wizerunek”) — autoryzacja L0 (bramka T3)',
        agent: 'A'
      };
      if (!mapData.recentUpdates) mapData.recentUpdates = [];
      mapData.recentUpdates = mapData.recentUpdates.filter(u => !u.topic.includes('LP 12'));
      mapData.recentUpdates.unshift(updateEntry);
      mapData.recentUpdates = mapData.recentUpdates.slice(0, 25);

      if (!mapData.updatesLog) mapData.updatesLog = [];
      mapData.updatesLog = mapData.updatesLog.filter(u => !u.topic.includes('LP 12'));
      mapData.updatesLog.unshift(updateEntry);
      mapData.updatesLog = mapData.updatesLog.slice(0, 60);

      mapData.lastUpdated = `${articleData.date}T14:00:00+01:00`;
      fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
      console.log('✔ Zaktualizowano data/ecosystem-map.json.');
    } catch (e) {
      console.warn('Uwaga przy aktualizacji ecosystem-map:', e.message);
    }
  }

  console.log('\n🎉 Rejestracja artykułu i aktualizacja struktur zakończona sukcesem!');
}

main().catch(err => {
  console.error('❌ Błąd publikacji:', err);
  process.exit(1);
});
