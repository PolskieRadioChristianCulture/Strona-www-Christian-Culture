import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-14 21:04';
const broadcastNum = 316;

// 1. Aktualizacja data/ecosystem-map.json
if (fs.existsSync(mapPath)) {
  const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const newEntry = {
    date: '2026-11-14',
    topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Słowo Boże: Werset Dnia Psalm 138:8 (UBG) z dedykowaną grafiką tematyczną i Tablicą LUMINA`,
    agent: 'A'
  };
  mapData.updatesLog.unshift(newEntry);
  if (Array.isArray(mapData.recentUpdates)) {
    mapData.recentUpdates.unshift(newEntry);
    if (mapData.recentUpdates.length > 30) mapData.recentUpdates = mapData.recentUpdates.slice(0, 30);
  }
  mapData.lastUpdated = '2026-11-14T21:04:00+01:00';
  fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
  console.log(`Updated ecosystem-map.json with entry #${broadcastNum}`);
}

// 2. Prepended entry do JOMA_STATUS.md
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Werset Dnia: Psalm 138:8 (UBG) (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** „Werset Dnia: Pan dokona tego, co mnie dotyczy; Twoje miłosierdzie, Panie, trwa na wieki (Psalm 138:8, UBG)” — URL: https://polskieradio.cc/werset-dnia?day=321 — kategoria \`verse\` (Słowo Boże / Werset Dnia UBG), rotacja zrównoważona pozycjami: #315 Półka z Książkami Cezarego Rogowskiego (book), #314 Lekcja 29 (course), #313 LUMINA (profile), #312 Moje Centrum CC (module), #311 Kącik Ewangelizacyjny Ewy (music), #310 Co z tym Michałem? (news).
  2. **Dedykowana oprawa graficzna:** \`werset-day-321-psalm-138-8.jpg\` (\`images/werset-dnia/generated/werset-day-321-psalm-138-8.jpg\`) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna dedykowana ilustracja biblijna 16:9 z podwójną złotą ramą Champagne Gold #C4A35A, symbolem otwartej księgi Pisma Świętego i pełną typografią UBG), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 1280x720 HD, upload w Playwright na profilu X @csbwersetdnia).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     📖 WERSET DNIA (UBG)
     „PAN dokona wszystkiego za mnie. PANIE, twoje miłosierdzie trwa na wieki; nie opuszczaj dzieł twoich rąk.” (Psalm 138:8, UBG)

     👉 MojaBiblia:
     https://polskieradio.cc/werset-dnia?day=321

     #WersetDnia #SlowoBoze
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post zweryfikowany i opublikowany na profilu @csbwersetdnia o godz. 20:04:02 UTC (21:04:02 czasu warszawskiego).
  5. **Tablica Społeczności LUMINA (/tablica):** Opublikowano z sukcesem jako Cezary Rogowski (ID: \`U6X3PaErTLpzvY7BDqNZ\`).
  6. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\` (320 wpisów), \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, lastIndex: 9, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A) oraz lustro w repozytorium LUMINA.
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: WERSET DNIA — PSALM 138:8 UBG (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia + Tablica LUMINA / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Werset Dnia: Psalm 138:8 UBG (#${broadcastNum})
- **URL:** https://polskieradio.cc/werset-dnia?day=321
- **Kategoria:** verse (Słowo Boże / Werset Dnia)
- **Grafika:** werset-day-321-psalm-138-8.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format posta X:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  📖 WERSET DNIA (UBG)
  „PAN dokona wszystkiego za mnie. PANIE, twoje miłosierdzie trwa na wieki; nie opuszczaj dzieł twoich rąk.” (Psalm 138:8, UBG)

  👉 MojaBiblia:
  https://polskieradio.cc/werset-dnia?day=321

  #WersetDnia #SlowoBoze
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (Zweryfikowano publikację na profilu @csbwersetdnia o 21:04:02 czasu warszawskiego)
  - Status publikacji LUMINA Tablica: SUKCES (Opublikowano wpis na /tablica jako Cezary Rogowski, ID: U6X3PaErTLpzvY7BDqNZ)
  - Ślad publikacji: \`data/x_published_history.json\` (320 pozycji)
  - Stan nadajnika: \`data/ccn_broadcaster_state.json\` (totalBroadcasts: 316, lastIndex: 9)
  - Żywa Mapa Ekosystemu: Wpis zaktualizowany w \`data/ecosystem-map.json\` (Symbol A)
  - Koszt: 0,00 PLN (Playwright, 100% Free Tier)
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('Appended entry to JOMA_HANDOFFS.md');
}

// Synchronizacja mapy do LUMINA
if (fs.existsSync(luminaMapPath) && fs.existsSync(mapPath)) {
  fs.copyFileSync(mapPath, luminaMapPath);
  console.log('Synced ecosystem-map.json to Desktop/@ICC/LUMINA/data/ecosystem-map.json');
}
