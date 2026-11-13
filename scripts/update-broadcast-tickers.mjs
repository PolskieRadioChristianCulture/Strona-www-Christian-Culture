#!/usr/bin/env node
/**
 * CC BROADCAST TICKER AUTOMATION (Paski Informacyjne Kanałów Nadawczych)
 * Automatyczne generowanie i synchronizacja pasków informacyjnych dla kanałów TV na żywo
 * (CCTV24, CCTV24 Worship, Biblia Śpiewana Live, Zapolskę Live, Dzień po Dniu Vertical).
 *
 * Zasada bezpieczeństwa:
 * - Działające kanały HTML (cctv24-worship.html, zapolske-live.html itp.) są ZAMROŻONE (READ-ONLY).
 * - Aktualizacja odbywa się w 100% dynamicznie przez odświeżanie:
 *     1. /data/ccn-news-ticker.json (WIADOMOŚCI CCN dla modułu cc-live-mission-feed.js)
 *     2. /news.json (nagłówki wiadomości dla loadNewsMarquee())
 * - Wszystkie kanały TV odświeżają te pliki w tle przez fetch co kilkanaście minut bez konieczności przeładowania sceny OBS!
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

function extractFromGoogleNewsXml(xmlPath) {
  if (!fs.existsSync(xmlPath)) return [];
  const content = fs.readFileSync(xmlPath, 'utf8');
  const items = [];
  const regex = /<url>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<news:title>(.*?)<\/news:title>[\s\S]*?<\/url>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    items.push({
      url: match[1].trim(),
      title: match[2].trim()
    });
  }
  return items;
}

export async function updateBroadcastTickers() {
  console.log('📺 [TICKER SENTINEL] Rozpoczynam automatyzację pasków informacyjnych TV...');

  // 1. Sprawdź najświeższe publikacje z Google News (okno 48h)
  const googleNewsXmlPath = path.join(ROOT, 'sitemaps/news-google.xml');
  const freshGoogleArticles = extractFromGoogleNewsXml(googleNewsXmlPath);

  // 2. Odczytaj centralny indeks wyszukiwarki
  const searchIndexPath = path.join(ROOT, 'data/cc-search-index.json');
  let searchIndex = { items: [] };
  if (fs.existsSync(searchIndexPath)) {
    try {
      searchIndex = JSON.parse(fs.readFileSync(searchIndexPath, 'utf8'));
    } catch (e) {
      console.warn('Ostrzeżenie: Nie udało się odczytać cc-search-index.json.');
    }
  }

  // 3. Połącz najświeższe artykuły
  const ccnArticles = [
    ...freshGoogleArticles,
    ...searchIndex.items.filter(i => 
      (i.category === 'Artykuły & Wiedza CCN' || (i.url && i.url.includes('/news/'))) &&
      !i.title.toLowerCase().includes('leksykon')
    )
  ];

  // Usuń duplikaty po tytule
  const seenTitles = new Set();
  const uniqueArticles = [];
  for (const a of ccnArticles) {
    if (!seenTitles.has(a.title)) {
      seenTitles.add(a.title);
      uniqueArticles.push(a);
    }
  }

  // Wyodrębnij najnowszą lekcję Kursu Codziennego
  const academyLessons = searchIndex.items.filter(i => 
    i.url && i.url.includes('/akademia/kurscodzienny/') &&
    !i.title.toLowerCase().includes('leksykon')
  );

  const latestArticle = uniqueArticles[0] || {
    title: 'Gdy lęk o jutro odbiera ci pokój: 5 biblijnych zasad uciszenia burzy w sercu według Słowa Bożego',
    url: 'https://polskieradio.cc/news/gdy-lek-o-jutro-odbiera-ci-pokoj-5-zasad-cezary-rogowski'
  };

  const secondArticle = uniqueArticles[1] || null;

  const latestLesson = academyLessons[0] || {
    title: 'Z Biblią za Pan Brat — Kurs Codzienny Pisma Świętego',
    url: 'https://polskieradio.cc/akademia'
  };

  // Odczytaj dzisiejsze rozważanie z rozwazania_baza.json
  const bazaPath = path.join(ROOT, 'rozwazania_baza.json');
  let todayReflection = null;
  if (fs.existsSync(bazaPath)) {
    try {
      const bazaList = JSON.parse(fs.readFileSync(bazaPath, 'utf8'));
      const todayStr = (() => {
        const d = new Date();
        const warsaw = new Date(d.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }));
        return warsaw.getFullYear() + '-' + String(warsaw.getMonth() + 1).padStart(2, '0') + '-' + String(warsaw.getDate()).padStart(2, '0');
      })();
      todayReflection = bazaList.find(r => r.date === todayStr) || bazaList[0];
    } catch (e) {
      console.warn('Ostrzeżenie: Nie udało się odczytać rozwazania_baza.json.');
    }
  }

  // 4. Zbuduj dynamiczną listę WIADOMOŚCI CCN dla data/ccn-news-ticker.json
  const tickerItems = [];

  // ZAWSZE NA PIERWSZYM MIEJSCU: Rozważanie i lekcja na dzisiaj!
  if (todayReflection) {
    tickerItems.push({
      topic: `SŁOWO NA DZIŚ — DZIEŃ ${todayReflection.day}`,
      text: `${todayReflection.title.replace(/^☀️\s*/, '')} (${todayReflection.reading}) — „${(todayReflection.memoryVerse || todayReflection.theme || '').replace(/^[„"']|[”"']$/g, '').slice(0, 140)}” • polskieradio.cc`
    });
    tickerItems.push({
      topic: `AKADEMIA BIBLIJNA — DZIEŃ ${todayReflection.day}`,
      text: `Z Biblią za Pan Brat — Dzień ${todayReflection.day} na dziś: ${todayReflection.reading} — studiuj na polskieradio.cc/akademia/kurscodzienny/dzien-${todayReflection.day}`
    });
  } else {
    tickerItems.push({
      topic: "AKADEMIA BIBLIJNA",
      text: `${latestLesson.title} — studiuj na polskieradio.cc/akademia`
    });
    tickerItems.push({
      topic: "SŁOWO NA DZIŚ",
      text: "Codzienne rozważania „Dobrze, że jesteś” w aplikacji mobilnej i na cclite.pl"
    });
  }

  tickerItems.push(
    {
      topic: "DZIEŃ REFORMACJI 2026",
      text: "509 lat od 1517 r. Powrót do Pisma Świętego i Ewangelii łaski (Sola Scriptura, Sola Gratia) — czytaj na polskieradio.cc"
    },
    {
      topic: "KINO I HISTORIA",
      text: "Premiera filmu „Luter” na kanale Christian Culture TV — zobacz poruszający dramat historyczny na polskieradio.cc"
    },
    {
      topic: "NAJNOWSZY ARTYKUŁ CCN",
      text: `${latestArticle.title} — czytaj na polskieradio.cc`
    }
  );

  if (secondArticle) {
    tickerItems.push({
      topic: "ANALIZA I WIEDZA",
      text: `${secondArticle.title} — czytaj na polskieradio.cc`
    });
  }

  tickerItems.push(
    {
      topic: "WYSZUKIWARKA EKOSYSTEMU",
      text: "Inteligentna wyszukiwarka treści, wersetów Pisma Świętego, lekcji i audycji: polskieradio.cc/wyszukiwarka (skrót: Ctrl+K)"
    },
    {
      topic: "WOLNE MEDIA BOŻE",
      text: "Wspieraj naszą misję: polskieradio.cc/wspieraj | Patronite: patronite.pl/osobowoscplus"
    },
    {
      topic: "BEZPŁATNA BIBLIA PAPIEROWA",
      text: "Wyślij darmowy SMS o treści: BIBLIA pod numer 507 821 789"
    },
    {
      topic: "INFOLINIA NADZIEJA CC",
      text: "Bezpłatna linia wsparcia duchowego i modlitwy: +48 730 958 583"
    },
    {
      topic: "SPOŁECZNOŚĆ LUMINA",
      text: "Dołącz do chrześcijańskiej społeczności wiary, profile autorów i modlitwa: polskieradio.cc/lumina"
    },
    {
      topic: "BIBLIA ŚPIEWANA LIVE 24/7",
      text: "Śpiewane Przypowieści Salomona i Psalmy z dynamicznym karaoke TV na żywo (polskieradio.cc/biblia-spiewana-live)"
    }
  );

  const tickerPayload = {
    updatedAt: new Date().toISOString(),
    category: "WIADOMOŚCI CCN",
    items: tickerItems
  };

  const tickerJsonPath = path.join(ROOT, 'data/ccn-news-ticker.json');
  fs.writeFileSync(tickerJsonPath, JSON.stringify(tickerPayload, null, 2), 'utf8');
  console.log(`✅ Zaktualizowano ${tickerJsonPath} (${tickerItems.length} pozycji).`);

  // 5. news.json jest celowo zachowany jako [] (wymóg Cloudflare Worker live RSS & Zero-QA lumina-straznik)
  const newsJsonPath = path.join(ROOT, 'news.json');
  if (!fs.existsSync(newsJsonPath) || fs.readFileSync(newsJsonPath, 'utf8').trim() !== '[]') {
    fs.writeFileSync(newsJsonPath, '[]\n', 'utf8');
  }

  // 6. Synchronizacja do lustra roboczego LUMINA
  if (fs.existsSync(LUMINA_ROOT)) {
    try {
      const luminaDataDir = path.join(LUMINA_ROOT, 'data');
      if (!fs.existsSync(luminaDataDir)) fs.mkdirSync(luminaDataDir, { recursive: true });
      fs.writeFileSync(path.join(LUMINA_ROOT, 'data/ccn-news-ticker.json'), JSON.stringify(tickerPayload, null, 2), 'utf8');
      fs.writeFileSync(path.join(LUMINA_ROOT, 'news.json'), '[]\n', 'utf8');
      console.log('✨ Zsynchronizowano paski informacyjne do lustra LUMINA.');
    } catch (err) {
      console.warn('Ostrzeżenie: synchronizacja do lustra LUMINA pominięta:', err.message);
    }
  }

  return {
    tickerItemsCount: tickerItems.length,
    updatedAt: tickerPayload.updatedAt
  };
}

// Bezpośrednie uruchomienie
if (process.argv[1] && process.argv[1].endsWith('update-broadcast-tickers.mjs')) {
  updateBroadcastTickers().then(() => {
    console.log('🎉 Paski informacyjne kanałów nadawczych zaktualizowane pomyślnie!');
  }).catch(err => {
    console.error('❌ Błąd aktualizacji pasków:', err);
    process.exit(1);
  });
}
