import fs from 'fs';
import path from 'path';

const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestamp = '2026-11-13 08:18';

const entryHandoff = `
## [${timestamp}] ANTIGRAVITY — PUBLIKACJA ROZWAŻANIA DZIEŃ 43 ORAZ DZIEŃ 44 W CAŁYM EKOSYSTEMIE (FIREBASE, WWW, FB, X, MAPA)
- **Status:** done (Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Orkiestrator Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Opublikowane materiały:**
  1. **Dzień 43 (Wj 12:37–13:22):** Wyjście z Egiptu — Bóg prowadzi swój lud (werset Wj 13:21 UBG).
  2. **Dzień 44 (Wj 14:1–31 — DZIŚ):** Przejście przez Morze Czerwone — PAN będzie za was walczył (werset Wj 14:14 UBG).
- **Zrealizowany zakres:**
  - **Firestore (cuda-398c0):** Utworzono dokumenty ref_day43_2026-11-12 oraz ref_day44_2026-11-13 (kolekcja reflections).
  - **Akademia Biblijna WWW (polskieradio.cc):** 8 ścieżek clean-routing dla Dnia 43 i Dnia 44, zaktualizowane przyciski Hero CTA (CZYTAJ DZIEŃ 44 (13 LISTOPADA) ->, <- DZIEŃ 43), zsynchronizowana siatka lekcji (Dzień 44 jako DZISIEJSZA LEKCJA, Dzień 43 jako DOSTĘPNA TERAZ).
  - **Baza rozważań:** Zsynchronizowano wpisy w 6 mirrorach (rozwazania_baza.json — 99 wpisów).
  - **Wyszukiwarka uniwersalna (@w):** Zaktualizowano szukaj/catalog.json oraz data/cc-search-index.json.
  - **Dystrybucja Platforma X (@csbwersetdnia):** Opublikowano post dla Dnia 44 przez automatyzację Playwright.
  - **Dystrybucja Facebook:** Opublikowano post dla Dnia 44 na Facebooku przez aktywną sesję Playwright.
  - **Żywa Mapa Ekosystemu (@m = @mapaCC):** Zarejestrowano wpis pod symbolem A na mapie.
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, entryHandoff, 'utf8');
  console.log('✅ Zaktualizowano JOMA_HANDOFFS.md');
}

for (const p of [mapPath, luminaMapPath]) {
  if (fs.existsSync(p)) {
    try {
      const mapData = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (Array.isArray(mapData.recentUpdates)) {
        mapData.recentUpdates = mapData.recentUpdates.filter(u => !u.topic.includes('Dzień 44'));
        mapData.recentUpdates.unshift({
          date: '2026-11-13',
          topic: 'Publikacja rozważania i lekcji na dziś: Dzień 44 (Wj 14:1-31 Przejście przez Morze Czerwone) oraz Dzień 43',
          agent: 'A'
        });
        mapData.lastUpdated = '2026-11-13';
        fs.writeFileSync(p, JSON.stringify(mapData, null, 2), 'utf8');
        console.log('✅ Zaktualizowano mapę:', p);
      }
    } catch (e) {
      console.warn('Błąd mapy:', e.message);
    }
  }
}
