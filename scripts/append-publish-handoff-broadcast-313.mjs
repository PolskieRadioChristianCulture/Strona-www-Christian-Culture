import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-14 19:33';
const broadcastNum = 313;

// 1. Aktualizacja data/ecosystem-map.json
if (fs.existsSync(mapPath)) {
  const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const newEntry = {
    date: '2026-11-14',
    topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Społeczność CC: Portal LUMINA z dedykowaną fotografią redakcyjną i Tablicą LUMINA`,
    agent: 'A'
  };
  mapData.updatesLog.unshift(newEntry);
  fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
  console.log(`Updated ecosystem-map.json with entry #${broadcastNum}`);
}

// 2. Prepended entry do JOMA_STATUS.md
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — LUMINA: Portal Społecznościowy (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** „LUMINA — Portal Społecznościowy” — URL: https://polskieradio.cc/lumina — kategoria \`profile\` (Społeczność & Relacje / Portal Społecznościowy LUMINA), rotacja zrównoważona pozycjami: #312 Moje Centrum CC (module), #311 Kącik Ewangelizacyjny Ewy (music), #310 Co z tym Michałem? (news), #309 Kino VOD SDS (vod), #308 Werset Dnia Ps 126:5-6 (verse), #307 Pokonać Goliata (book), #306 Lekcja 30 (course), #305 Biblia PDF (module).
  2. **Dedykowana oprawa graficzna:** \`cezary-wioletta-radiocc.jpg\` — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna fotografia redakcyjna Cezarego i Wioletty Rogowskich w studio Polskiego Radia CC na tle portalu LUMINA, ciepła paleta Champagne Gold, wysoka rozdzielczość 16:9), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, upload w Playwright na profilu X @csbwersetdnia).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     👤 SPOŁECZNOŚĆ CC | Portal LUMINA
     LUMINA: Wolna od manipulacji i algorytmów przestrzeń społeczności ludzi wiary.

     👉 Dołącz do społeczności LUMINA:
     https://polskieradio.cc/lumina

     #Lumina #LudzieMisji #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post zweryfikowany i opublikowany na profilu @csbwersetdnia o godz. 18:33:31 UTC (19:33:31 czasu warszawskiego).
  5. **Tablica Społeczności LUMINA (/tablica):** Opublikowano z sukcesem jako Christian Culture (ID: \`iLUS8kCbdf8yAfQt31Op\`).
  6. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\` (317 wpisów), \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, lastIndex: 574, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A) oraz lustro w repozytorium LUMINA.
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: LUMINA — PORTAL SPOŁECZNOŚCIOWY (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia + Tablica LUMINA / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** LUMINA — Portal Społecznościowy (#${broadcastNum})
- **URL:** https://polskieradio.cc/lumina
- **Kategoria:** profile (Społeczność & Relacje / Portal Społecznościowy LUMINA)
- **Grafika:** cezary-wioletta-radiocc.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format posta X:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  👤 SPOŁECZNOŚĆ CC | Portal LUMINA
  LUMINA: Wolna od manipulacji i algorytmów przestrzeń społeczności ludzi wiary.

  👉 Dołącz do społeczności LUMINA:
  https://polskieradio.cc/lumina

  #Lumina #LudzieMisji #ChristianCulture
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (Zweryfikowano publikację na profilu @csbwersetdnia o 19:33:31 czasu warszawskiego)
  - Status publikacji LUMINA Tablica: SUKCES (Opublikowano wpis na /tablica jako Christian Culture, ID: iLUS8kCbdf8yAfQt31Op)
  - Ślad publikacji: \`data/x_published_history.json\` (317 pozycji)
  - Stan nadajnika: \`data/ccn_broadcaster_state.json\` (totalBroadcasts: 313, lastIndex: 574)
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
