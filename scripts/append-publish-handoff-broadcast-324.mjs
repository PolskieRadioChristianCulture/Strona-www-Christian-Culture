import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-15 10:36';
const broadcastNum = 324;

// 1. Aktualizacja data/ecosystem-map.json
if (fs.existsSync(mapPath)) {
  const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const newEntry = {
    date: '2026-11-15',
    topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Gerald Welch – THE CALL (Analiza Muzyczna i Wiara) z dedykowaną grafiką tematyczną i Tablicą LUMINA`,
    agent: 'A'
  };
  if (Array.isArray(mapData.updatesLog)) {
    mapData.updatesLog.unshift(newEntry);
  }
  if (Array.isArray(mapData.recentUpdates)) {
    mapData.recentUpdates.unshift(newEntry);
    if (mapData.recentUpdates.length > 30) mapData.recentUpdates = mapData.recentUpdates.slice(0, 30);
  }
  mapData.lastUpdated = '2026-11-15T10:36:00+01:00';
  fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
  console.log(`Updated ecosystem-map.json with entry #${broadcastNum}`);
}

// 2. Prepended entry do JOMA_STATUS.md
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Gerald Welch – THE CALL (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** „Gerald Welch – THE CALL. Rockowe wezwanie do przebudzenia sumienia i żywej wiary” — URL: https://polskieradio.cc/news/gerald-welch-the-call-rockowe-wezwanie-do-przebudzenia-sumienia-i-zywej-wiary — kategoria \`news\` (CCN NEWS / Recenzja & Wiara), rotacja zrównoważona po: #323 Werset Dnia Psalm 143:8 (verse), #322 U boku Diabła (book), #321 Dzień 28 (course), #320 LumiMess (profile), #319 Mój Werset Dnia (module), #318 CC Global (music), #317 Lekcja 30 (news).
  2. **Dedykowana oprawa graficzna:** \`art-gerald-welch-the-call.jpg\` (\`images/news/art-gerald-welch-the-call.jpg\`) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — dedykowana tematyczna grafika artysty scenicznego), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania HD, upload w Playwright na profilu X @csbwersetdnia).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     📰 RAPORT & PUBLICYSTYKA CCN
     Gerald Welch – THE CALL. Rockowe wezwanie do przebudzenia sumienia i żywej wiary

     👉 Czytaj w serwisie:
     https://polskieradio.cc/news/gerald-welch-the-call-rockowe-wezwanie-do-przebudzenia-sumienia-i-zywej-wiary

     #CCNNews #ChristianCulture #Prawda
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post zweryfikowany i opublikowany na profilu @csbwersetdnia o godz. 09:36:08 UTC (10:36:08 czasu warszawskiego).
  5. **Tablica Społeczności LUMINA (/tablica):** Opublikowano z sukcesem jako Christian Culture (docId: \`IFvCQDltg9YMiAdqo9v3\`).
  6. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\` (#${broadcastNum}), \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A) oraz lustro w repozytorium LUMINA.
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: GERALD WELCH – THE CALL (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia + Tablica LUMINA / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Gerald Welch – THE CALL. Rockowe wezwanie do przebudzenia sumienia i żywej wiary (#${broadcastNum})
- **URL:** https://polskieradio.cc/news/gerald-welch-the-call-rockowe-wezwanie-do-przebudzenia-sumienia-i-zywej-wiary
- **Kategoria:** news (CCN NEWS / Recenzja & Wiara)
- **Grafika:** art-gerald-welch-the-call.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format posta X:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  📰 RAPORT & PUBLICYSTYKA CCN
  Gerald Welch – THE CALL. Rockowe wezwanie do przebudzenia sumienia i żywej wiary

  👉 Czytaj w serwisie:
  https://polskieradio.cc/news/gerald-welch-the-call-rockowe-wezwanie-do-przebudzenia-sumienia-i-zywej-wiary

  #CCNNews #ChristianCulture #Prawda
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (Zweryfikowano publikację na profilu @csbwersetdnia o 10:36:08 czasu warszawskiego)
  - Status publikacji LUMINA Tablica: SUKCES (Opublikowano wpis na /tablica jako Christian Culture, docId: \`IFvCQDltg9YMiAdqo9v3\`)
  - Ślad publikacji: \`data/x_published_history.json\` (#${broadcastNum})
  - Stan nadajnika: \`data/ccn_broadcaster_state.json\` (totalBroadcasts: ${broadcastNum})
  - Żywa Mapa Ekosystemu: Wpis zaktualizowany w \`data/ecosystem-map.json\` (Symbol A)
  - Koszt: 0,00 PLN (Playwright, 100% Free Tier)
  - Następny slot: za ok. 30 minut (~11:05–11:15 czasu warszawskiego)
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
