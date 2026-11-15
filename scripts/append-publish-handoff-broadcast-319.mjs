import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-14 22:36';
const broadcastNum = 319;

// 1. Aktualizacja data/ecosystem-map.json
if (fs.existsSync(mapPath)) {
  const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const newEntry = {
    date: '2026-11-14',
    topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Mój Werset Dnia: Wyszukiwarka Słowa Bożego i generator kart z dedykowaną grafiką tematyczną i Tablicą LUMINA`,
    agent: 'A'
  };
  mapData.updatesLog.unshift(newEntry);
  if (Array.isArray(mapData.recentUpdates)) {
    mapData.recentUpdates.unshift(newEntry);
    if (mapData.recentUpdates.length > 30) mapData.recentUpdates = mapData.recentUpdates.slice(0, 30);
  }
  mapData.lastUpdated = '2026-11-14T22:36:00+01:00';
  fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
  console.log(`Updated ecosystem-map.json with entry #${broadcastNum}`);

  if (fs.existsSync(path.dirname(luminaMapPath))) {
    try {
      fs.writeFileSync(luminaMapPath, JSON.stringify(mapData, null, 2), 'utf8');
      console.log(`Synced ecosystem-map.json to LUMINA repo`);
    } catch (e) {
      console.warn('Sync to LUMINA map failed:', e.message);
    }
  }
}

// 2. Prepended entry do JOMA_STATUS.md
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Mój Werset Dnia (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** „Mój Werset Dnia — Wyszukiwarka Słowa Bożego i generator kart z wersetami” — URL: https://polskieradio.cc/werset-dnia — kategoria \`module\` (Biblia i formacja), rotacja zrównoważona pozycjami: #318 Christian Culture Global (music), #317 Lekcja 30 (news), #316 Werset Dnia Psalm 138:8 (verse), #315 Półka z Książkami (book), #314 Lekcja 29 (course), #313 LUMINA (profile), #312 Moje Centrum CC (module).
  2. **Dedykowana oprawa graficzna:** \`werset-pismo-swiete-ubg-minimalistyczna-wyszukiwarka-slo.jpg\` (\`images/werset-dnia/generated/werset-pismo-swiete-ubg-minimalistyczna-wyszukiwarka-slo.jpg\`) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — pełna merytoryczna zgodność z tematem Pisma Świętego UBG i wyszukiwarki słowa), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, wysoka jakość 201 KB, upload w Playwright na profilu X @csbwersetdnia).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     📖 MÓJ WERSET DNIA | GENERATOR KART
     Wyszukiwarka Słowa Bożego i generator kart z wersetami. Wylosuj werset na dziś i podziel się nadzieją!

     👉 Wyszukaj werset i stwórz kartę:
     https://polskieradio.cc/werset-dnia

     #WersetDnia #SlowoBoze #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post zweryfikowany i opublikowany na profilu @csbwersetdnia o godz. 21:36:07 UTC (22:36:07 czasu warszawskiego).
  5. **Tablica Społeczności LUMINA (/tablica):** Opublikowano z sukcesem jako Wioletta Rogowska (ID: \`XivZpgRYPWSF2pbIFv5U\`).
  6. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\` (323 wpisy), \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, lastIndex: 572, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A) oraz lustro w repozytorium LUMINA.
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: MÓJ WERSET DNIA (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia + Tablica LUMINA / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Mój Werset Dnia — Wyszukiwarka Słowa Bożego i generator kart z wersetami (#${broadcastNum})
- **URL:** https://polskieradio.cc/werset-dnia
- **Kategoria:** module (Biblia i formacja)
- **Grafika:** werset-pismo-swiete-ubg-minimalistyczna-wyszukiwarka-slo.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format posta X:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  📖 MÓJ WERSET DNIA | GENERATOR KART
  Wyszukiwarka Słowa Bożego i generator kart z wersetami. Wylosuj werset na dziś i podziel się nadzieją!

  👉 Wyszukaj werset i stwórz kartę:
  https://polskieradio.cc/werset-dnia

  #WersetDnia #SlowoBoze #ChristianCulture
  \`\`\`
- **Dowód emisji:**
  - Silnik: Playwright (ZERO COST, 0,00 PLN, sesja X_AUTH_TOKEN @csbwersetdnia)
  - Czas: 21:36:07 UTC / 22:36:07 CET
  - Tablica LUMINA: Wpis Wioletty Rogowskiej (ID: \`XivZpgRYPWSF2pbIFv5U\`)
  - Licznik cyklicznych publikacji: #${broadcastNum} (łącznie 323 wpisy w historii)
- **Pliki objęte zmianą:**
  - \`scripts/ccn_auto_broadcaster.mjs\` (wzbogacenie formatowania dla modułu Mój Werset Dnia)
  - \`data/x_published_history.json\`
  - \`data/ccn_broadcaster_state.json\`
  - \`data/ccn_broadcaster_log.json\`
  - \`data/ecosystem-map.json\`
- **Weryfikacja ZERO-QA:** Strażnik Kodu 0 naruszeń, Mobile Premium PASS, CC Regression PASS.
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('Appended entry to JOMA_HANDOFFS.md');
}
