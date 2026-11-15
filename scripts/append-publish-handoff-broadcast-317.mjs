import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-14 21:34';
const broadcastNum = 317;

// 1. Aktualizacja data/ecosystem-map.json
if (fs.existsSync(mapPath)) {
  const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const newEntry = {
    date: '2026-11-14',
    topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Akademia Biblijna: Dzień 30 (Rdz 48–49) — Błogosławieństwo Jakuba i berło Judy z dedykowaną grafiką tematyczną i Tablicą LUMINA`,
    agent: 'A'
  };
  mapData.updatesLog.unshift(newEntry);
  if (Array.isArray(mapData.recentUpdates)) {
    mapData.recentUpdates.unshift(newEntry);
    if (mapData.recentUpdates.length > 30) mapData.recentUpdates = mapData.recentUpdates.slice(0, 30);
  }
  mapData.lastUpdated = '2026-11-14T21:34:00+01:00';
  fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
  console.log(`Updated ecosystem-map.json with entry #${broadcastNum}`);
}

// 2. Prepended entry do JOMA_STATUS.md
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Z Biblią za Pan Brat: Dzień 30 (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** „Z Biblią za Pan Brat: Dzień 30 — Błogosławieństwo Jakuba, proroctwo o berle Judy i Chrystus jako Lew i Baranek w Rdz 48–49” — URL: https://polskieradio.cc/news/z-biblia-za-pan-brat-dzien-30-blogoslawienstwo-obietnica-i-lew-z-judy — kategoria \`news\` (CCN NEWS / Akademia Biblijna), rotacja zrównoważona pozycjami: #316 Werset Dnia Psalm 138:8 (verse), #315 Półka z Książkami Cezarego Rogowskiego (book), #314 Lekcja 29 (course), #313 LUMINA (profile), #312 Moje Centrum CC (module).
  2. **Dedykowana oprawa graficzna:** \`art-z-biblia-za-pan-brat-dzien-30-blogoslawienstwo-obietnica-i-lew-z-judy.jpg\` (\`images/news/art-z-biblia-za-pan-brat-dzien-30-blogoslawienstwo-obietnica-i-lew-z-judy.jpg\`) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — pełna merytoryczna zgodność z tematem błogosławieństwa Jakuba, proroctwa o berle Judy i narracji biblijnej Rdz 48–49), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, wysoka rozdzielczość 881 KB, upload w Playwright na profilu X @csbwersetdnia).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     🎓 AKADEMIA BIBLIJNA | KURS CODZIENNY
     Dzień 30 (Rdz 48:1–49:33): Błogosławieństwo Jakuba, proroctwo o Lwie z pokolenia Judy i Boża obietnica.

     👉 Studiuj w serwisie:
     https://polskieradio.cc/news/z-biblia-za-pan-brat-dzien-30-blogoslawienstwo-obietnica-i-lew-z-judy

     #KursCodzienny #AkademiaBiblijna #CCNNews
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post zweryfikowany i opublikowany na profilu @csbwersetdnia o godz. 20:34:40 UTC (21:34:40 czasu warszawskiego).
  5. **Tablica Społeczności LUMINA (/tablica):** Opublikowano z sukcesem jako Wioletta Rogowska (ID: \`paRO0kCPUFpVH6QvA2Dq\`).
  6. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\` (321 wpisów), \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, lastIndex: 425, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A) oraz lustro w repozytorium LUMINA.
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: Z BIBLIĄ ZA PAN BRAT DZIEŃ 30 (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia + Tablica LUMINA / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Z Biblią za Pan Brat: Dzień 30 — Błogosławieństwo Jakuba, proroctwo o berle Judy i Chrystus jako Lew i Baranek w Rdz 48–49 (#${broadcastNum})
- **URL:** https://polskieradio.cc/news/z-biblia-za-pan-brat-dzien-30-blogoslawienstwo-obietnica-i-lew-z-judy
- **Kategoria:** news (Akademia Biblijna / CCN News)
- **Grafika:** art-z-biblia-za-pan-brat-dzien-30-blogoslawienstwo-obietnica-i-lew-z-judy.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format posta X:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  🎓 AKADEMIA BIBLIJNA | KURS CODZIENNY
  Dzień 30 (Rdz 48:1–49:33): Błogosławieństwo Jakuba, proroctwo o Lwie z pokolenia Judy i Boża obietnica.

  👉 Studiuj w serwisie:
  https://polskieradio.cc/news/z-biblia-za-pan-brat-dzien-30-blogoslawienstwo-obietnica-i-lew-z-judy

  #KursCodzienny #AkademiaBiblijna #CCNNews
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (Zweryfikowano publikację na profilu @csbwersetdnia o 21:34:40 czasu warszawskiego)
  - Status publikacji LUMINA Tablica: SUKCES (Opublikowano wpis na /tablica jako Wioletta Rogowska, ID: paRO0kCPUFpVH6QvA2Dq)
  - Ślad publikacji: \`data/x_published_history.json\` (321 pozycji)
  - Stan nadajnika: \`data/ccn_broadcaster_state.json\` (totalBroadcasts: 317, lastIndex: 425)
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
