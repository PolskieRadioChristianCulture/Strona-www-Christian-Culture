import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-14 19:05';
const broadcastNum = 312;

// 1. Aktualizacja data/ecosystem-map.json
if (fs.existsSync(mapPath)) {
  const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const newEntry = {
    date: '2026-11-14',
    topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Ekosystem & Pulpit: Moje Centrum CC (Personal Hub) z dedykowaną grafiką tematyczną i Tablicą LUMINA`,
    agent: 'A'
  };
  mapData.updatesLog.unshift(newEntry);
  fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
  console.log(`Updated ecosystem-map.json with entry #${broadcastNum}`);
}

// 2. Prepended entry do JOMA_STATUS.md
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Moje Centrum CC (Personal Hub) (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** „Moje Centrum CC — Twój Osobisty Pulpit (Personal Hub)” — URL: https://polskieradio.cc/moje-centrum — kategoria \`module\` (Osobisty Pulpit Ekosystemu / Personal Hub), rotacja zrównoważona pozycjami: #311 Kącik Ewangelizacyjny Ewy (music), #310 Co z tym Michałem? (news), #309 Kino VOD SDS (vod), #308 Werset Dnia Ps 126:5-6 (verse), #307 Pokonać Goliata (book), #306 Lekcja 30 (course), #305 Biblia PDF (module), #304 Paweł Murawski (profile).
  2. **Dedykowana oprawa graficzna:** \`art-moje-centrum.jpg\` — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczny autorski kadr 16:9 z interfejsem Moje Centrum CC, paletą Obsidian & Imperial Gold i wizytówką Cezarego Rogowskiego), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 1920x1080 w standardzie 16:9, upload w Playwright na profilu X @csbwersetdnia).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     👑 MOJE CENTRUM CC | OSOBISTY PULPIT
     Moje Centrum CC — Twój Osobisty Pulpit (Personal Hub)

     👉 Otwórz swój prywatny pulpit w ekosystemie:
     https://polskieradio.cc/moje-centrum

     #MojeCentrumCC #PersonalHub #Lumina #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post zweryfikowany i opublikowany na profilu @csbwersetdnia o godz. 18:05:00 UTC (19:05:00 czasu warszawskiego).
  5. **Tablica Społeczności LUMINA (/tablica):** Opublikowano z sukcesem jako Wioletta Rogowska / Cezary Rogowski.
  6. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\` (316 wpisów), \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A) oraz lustro w repozytorium LUMINA.
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: MOJE CENTRUM CC — TWÓJ OSOBISTY PULPIT (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia + Tablica LUMINA / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Moje Centrum CC — Twój Osobisty Pulpit (Personal Hub) (#${broadcastNum})
- **URL:** https://polskieradio.cc/moje-centrum
- **Kategoria:** module (Ekosystem & Osobisty Pulpit / Personal Hub)
- **Grafika:** art-moje-centrum.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format posta X:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  👑 MOJE CENTRUM CC | OSOBISTY PULPIT
  Moje Centrum CC — Twój Osobisty Pulpit (Personal Hub)

  👉 Otwórz swój prywatny pulpit w ekosystemie:
  https://polskieradio.cc/moje-centrum

  #MojeCentrumCC #PersonalHub #Lumina #ChristianCulture
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (Zweryfikowano publikację na profilu @csbwersetdnia o 19:05:00 czasu warszawskiego)
  - Status publikacji LUMINA Tablica: SUKCES (Opublikowano wpis na /tablica)
  - Ślad publikacji: \`data/x_published_history.json\` (316 pozycji)
  - Stan nadajnika: \`data/ccn_broadcaster_state.json\` (totalBroadcasts: 312, index: 570)
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
