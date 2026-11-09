#!/usr/bin/env node
/**
 * CC SEARCH RECOMMENDATIONS SENTINEL & ENGINE
 * Automatyczna codzienna aktualizacja okna i treści /wyszukiwarka:
 * - Dynamiczne zasilanie 4 pul rotacyjnych (Inspiracje, Akademia, Aktualności CCN, 24/7)
 * - Tętniące życiem propozycje ze świeżymi publikacjami Dowódcy i Wioletty Rogowskich
 * - Generowanie /data/cc-search-recommendations.json oraz aktualizacja szukaj/catalog.json
 * - Synchronizacja do lustra roboczego LUMINA
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

export async function updateSearchRecommendations() {
  console.log('🔍 [SEARCH LIVING SENTINEL] Rozpoczynam aktualizację okna i propozycji /wyszukiwarka...');

  const now = new Date();
  const dayOfMonth = now.getDate();
  const monthNamesPL = [
    'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
  ];
  const dateFormattedPL = `${dayOfMonth} ${monthNamesPL[now.getMonth()]} ${now.getFullYear()}`;

  // 1. Sprawdź najświeższy artykuł CCN (np. Google News XML lub centralny indeks)
  const googleNewsXmlPath = path.join(ROOT, 'sitemaps/news-google.xml');
  const freshArticles = extractFromGoogleNewsXml(googleNewsXmlPath);

  const searchIndexPath = path.join(ROOT, 'data/cc-search-index.json');
  let searchIndex = { items: [] };
  if (fs.existsSync(searchIndexPath)) {
    try {
      searchIndex = JSON.parse(fs.readFileSync(searchIndexPath, 'utf8'));
    } catch (_) {}
  }

  const latestArticle = freshArticles[0] || {
    title: 'Gdy lęk o jutro odbiera Ci pokój — 5 zasad',
    url: 'https://polskieradio.cc/news/gdy-lek-o-jutro-odbiera-ci-pokoj-5-zasad-cezary-rogowski'
  };

  // 2. Sprawdź dzisiejszą lekcję Kursu Codziennego
  let cycleDay = dayOfMonth;
  if (now.getFullYear() === 2026 && now.getMonth() === 10) cycleDay = 31 + dayOfMonth;
  else if (now.getFullYear() === 2026 && now.getMonth() === 11) cycleDay = 61 + dayOfMonth;
  const cycleDayPad = String(cycleDay).padStart(2, "0");
  const latestLesson = {
    title: `Lekcja Dnia: Z Biblią za Pan Brat (Dzień ${cycleDay})`,
    url: `/akademia/kurscodzienny/dzien-${cycleDayPad}`
  };

  // 3. Przygotuj 4 tętniące życiem pule propozycji (16 różnorodnych, świeżych modułów)
  const pools = [
    // Slot 0: Inspiracje & Słowo Boże & Modlitwa
    [
      {
        tag: 'Inspiracja na Dziś',
        title: `Rozważanie „Dobrze, że jesteś” • Dzień ${dayOfMonth}`,
        desc: `Codzienne słowo umocnienia, modlitwa i Boży pokój na ${dateFormattedPL}.`,
        url: '/player',
        icon: 'heart'
      },
      {
        tag: 'Słowo Boże na Dziś',
        title: 'Mój Werset Dnia z Obietnicą',
        desc: 'Losuj i rozważaj żywe obietnice Pisma Świętego przygotowane na dziś.',
        url: '/werset-dnia',
        icon: 'sparkle'
      },
      {
        tag: 'Modlitwa & Wstawiennictwo',
        title: 'Zjednoczeni za Polskę — Czuwanie',
        desc: 'Wspólna modlitwa narodu o pokój, Boże prowadzenie i przebudzenie.',
        url: '/modlitwa',
        icon: 'shield'
      },
      {
        tag: 'Słuchowisko Biblijne',
        title: 'Biblia Audio — Nowy Testament UBG',
        desc: 'Żywe Słowo Boże z profesjonalną muzyką i udźwiękowieniem radiowym.',
        url: '/player',
        icon: 'volume'
      }
    ],
    // Slot 1: Akademia Biblijna & Narzędzia Pisma Świętego & Autopromocja Wyszukiwarki
    [
      {
        tag: 'Akademia Biblijna',
        title: latestLesson.title,
        desc: 'Codzienne studium Pisma Świętego werset po wersecie z komentarzem.',
        url: latestLesson.url,
        icon: 'book'
      },
      {
        tag: 'Interlinearna Biblia',
        title: 'MojaBiblia: Kody Stronga & Greka',
        desc: 'Oryginalne znaczenie słów hebrajskich i greckich w Twojej przeglądarce.',
        url: '/mojabiblia',
        icon: 'scroll'
      },
      {
        tag: 'Wyszukiwarka Ekosystemu',
        title: 'Błyskawiczne Odkrywanie w CC',
        desc: 'Szukaj wersetów, lekcji, audycji i artykułów natychmiast od 1. litery.',
        url: '/wyszukiwarka',
        icon: 'search'
      },
      {
        tag: 'Kurs Proroctw Biblijnych',
        title: 'Księga Daniela — 2300 Wieczorów i Poranków',
        desc: 'Klucz do zrozumienia czasów ostatecznych i nadziei Zbawienia w Chrystusie.',
        url: '/akademia',
        icon: 'compass'
      }
    ],
    // Slot 2: Aktualności CCN & Podcasty SDS & VOD
    [
      {
        tag: 'Dzień Reformacji 2026 • Na Dziś',
        title: 'Reformacja nie skończyła się w 1517 roku — film „Luter”',
        desc: '509 lat od 1517 r. Sola Scriptura, Sola Gratia i odnowa sumienia (Cezary Rogowski).',
        url: '/news/dzien-reformacji-2026-wrocmy-do-pisma-i-ewangelii-laski',
        icon: 'newspaper'
      },
      {
        tag: 'Rodzina & Zdrowie • Nowość',
        title: 'Cyfrowy detoks w chrześcijańskim domu',
        desc: 'Jak odzyskać prawdziwą bliskość przy wspólnym stole (Wioletta Rogowska).',
        url: '/news/cyfrowy-detoks-rodziny-jak-odzyskac-bliskosc-i-spokoj',
        icon: 'newspaper'
      },
      {
        tag: 'Podcast Spotify SDS',
        title: 'APOKALIPSA — Księga Nadziei',
        desc: 'Profetyczny cykl wykładów biblijnych Studia Dobrego Słowa.',
        url: '/podcasty',
        icon: 'mic'
      },
      {
        tag: 'Kino Chrześcijańskie VOD',
        title: 'Filmy Fabularne i Dokumentalne CC',
        desc: 'Wartościowe kino chrześcijańskie bez reklam, opłat i subskrypcji.',
        url: '/vod',
        icon: 'film'
      }
    ],
    // Slot 3: Live TV & Radio CC & Muzyka Uwielbienia & Społeczność
    [
      {
        tag: 'Nadajemy 24/7',
        title: 'Radio Christian Culture & Player',
        desc: 'Muzyka uwielbienia, słuchowiska Biblia Audio i stacje tematyczne.',
        url: '/player',
        icon: 'radio'
      },
      {
        tag: 'Przegląd Ekosystemu • Nowość',
        title: 'Tętno Misji: Nowe Lekcje i Artykuły',
        desc: 'Aktualne premiery, audycje i materiały w całym ekosystemie CC.',
        url: '/news/przeglad-ekosystemu-nowe-artykuly-i-lekcje-akademii',
        icon: 'sparkle'
      },
      {
        tag: 'Telewizja CCTV24 Worship',
        title: 'CCTV24 — Pasmo Bożej Obecności',
        desc: 'Nocne czuwania, modlitwy i pieśni chwały w krystalicznej jakości HD.',
        url: '/cctv24-worship',
        icon: 'play'
      },
      {
        tag: 'Społeczność Wiary',
        title: 'Portal Społecznościowy LUMINA',
        desc: 'Dołącz do chrześcijan z całej Polski — dyskusje, świadectwa, modlitwa.',
        url: '/lumina',
        icon: 'users'
      }
    ]
  ];

  // 4 Wyjściowe filary na dziś (Set 0)
  const todayPillars = [pools[0][0], pools[1][0], pools[2][0], pools[3][0]];

  const recommendationsPayload = {
    updatedAt: now.toISOString(),
    heading: 'Polecane na dziś',
    dateFormattedPL,
    pools,
    recommendedToday: todayPillars
  };

  // 4. Zapisz plik data/cc-search-recommendations.json
  const recJsonPath = path.join(ROOT, 'data/cc-search-recommendations.json');
  fs.writeFileSync(recJsonPath, JSON.stringify(recommendationsPayload, null, 2), 'utf8');
  console.log(`✅ Zapisano rekomendacje wyszukiwarki do ${recJsonPath}`);

  // 5. Wstrzyknij recommendedToday do data/cc-search-index.json i szukaj/catalog.json
  const catalogPaths = [
    path.join(ROOT, 'data/cc-search-index.json'),
    path.join(ROOT, 'szukaj/catalog.json')
  ];

  for (const cp of catalogPaths) {
    if (fs.existsSync(cp)) {
      try {
        const cat = JSON.parse(fs.readFileSync(cp, 'utf8'));
        cat.recommendedToday = todayPillars;
        cat.searchRecommendations = recommendationsPayload;
        fs.writeFileSync(cp, JSON.stringify(cat, null, 2), 'utf8');
        console.log(`✨ Zaktualizowano ${path.basename(cp)} o dynamiczne propozycje na dziś.`);
      } catch (err) {
        console.warn(`Ostrzeżenie: Błąd aktualizacji ${cp}:`, err.message);
      }
    }
  }

  // 6. Synchronizacja do lustra LUMINA
  if (fs.existsSync(LUMINA_ROOT)) {
    try {
      const luminaDataDir = path.join(LUMINA_ROOT, 'data');
      if (!fs.existsSync(luminaDataDir)) fs.mkdirSync(luminaDataDir, { recursive: true });
      fs.writeFileSync(path.join(LUMINA_ROOT, 'data/cc-search-recommendations.json'), JSON.stringify(recommendationsPayload, null, 2), 'utf8');

      const luminaIndex = path.join(LUMINA_ROOT, 'data/cc-search-index.json');
      if (fs.existsSync(luminaIndex)) {
        const lcat = JSON.parse(fs.readFileSync(luminaIndex, 'utf8'));
        lcat.recommendedToday = todayPillars;
        lcat.searchRecommendations = recommendationsPayload;
        fs.writeFileSync(luminaIndex, JSON.stringify(lcat, null, 2), 'utf8');
      }

      const luminaCatalog = path.join(LUMINA_ROOT, 'szukaj/catalog.json');
      if (fs.existsSync(luminaCatalog)) {
        const lcat2 = JSON.parse(fs.readFileSync(luminaCatalog, 'utf8'));
        lcat2.recommendedToday = todayPillars;
        lcat2.searchRecommendations = recommendationsPayload;
        fs.writeFileSync(luminaCatalog, JSON.stringify(lcat2, null, 2), 'utf8');
      }

      console.log('✨ Zsynchronizowano dynamiczne rekomendacje do lustra LUMINA.');
    } catch (err) {
      console.warn('Ostrzeżenie: synchronizacja do lustra LUMINA pominięta:', err.message);
    }
  }

  return recommendationsPayload;
}

// Bezpośrednie uruchomienie
if (process.argv[1] && process.argv[1].endsWith('update-search-recommendations.mjs')) {
  updateSearchRecommendations().then(() => {
    console.log('🎉 Rekomendacje wyszukiwarki zaktualizowane pomyślnie!');
  }).catch(err => {
    console.error('❌ Błąd aktualizacji rekomendacji:', err);
    process.exit(1);
  });
}
