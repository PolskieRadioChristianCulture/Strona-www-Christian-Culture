import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-15 22:06';
const broadcastNum = 347;

// 1. Aktualizacja data/ecosystem-map.json
if (fs.existsSync(mapPath)) {
  const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const newEntry = {
    date: '2026-11-15',
    topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Wizytówka: Wioletta Rogowska z dedykowaną grafiką i Tablicą LUMINA`,
    agent: 'A'
  };
  if (Array.isArray(mapData.updatesLog)) {
    mapData.updatesLog.unshift(newEntry);
  }
  if (Array.isArray(mapData.recentUpdates)) {
    mapData.recentUpdates.unshift(newEntry);
    if (mapData.recentUpdates.length > 30) mapData.recentUpdates = mapData.recentUpdates.slice(0, 30);
  }
  mapData.lastUpdated = '2026-11-15T22:06:00+01:00';
  fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
  console.log(`Updated ecosystem-map.json with entry #${broadcastNum}`);
}

// 2. Prepended entry do JOMA_STATUS.md
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Wizytówka: Wioletta Rogowska (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Wizytówka & Profil LUMINA: „Wizytówka: Wioletta Rogowska — Współzałożycielka Christian Culture, Rodzina i Wiara” — URL: https://polskieradio.cc/lumina.wiolettarogowska — kategoria \`profile\` (Społeczność & Ludzie Misji CC), zrównoważona rotacja: #346 Gerald Welch (news), #345 Kod Źródłowy Duszy (book), #344 Werset Dnia Prz 10:22 (verse), #343 Smart TV CC (module).
  2. **Dedykowana oprawa graficzna:** \`wioletta-og.jpg\` (\`images/wioletta/wioletta-og.jpg\`, 148 KB) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna dedykowana fotografia portretowa HD 16:9), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania HD, upload w Playwright na profilu X @csbwersetdnia).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     👤 SPOŁECZNOŚĆ CC | Portal LUMINA
     Wioletta Rogowska — Współzałożycielka Christian Culture, Rodzina i Wiara

     👉 Dołącz do społeczności LUMINA:
     https://polskieradio.cc/lumina.wiolettarogowska

     #WiolettaRogowska #LudzieMisji #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post pomyślnie zweryfikowany i opublikowany na profilu @csbwersetdnia.
  5. **Tablica Społeczności LUMINA (/tablica):** Opublikowano z sukcesem jako Wioletta Rogowska (docId: \`3l1I8qFLxmkhrWHGlqMA\`).
  6. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\` (#${broadcastNum}), \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A) oraz lustro w repozytorium LUMINA.
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: WIZYTÓWKA WIOLETTA ROGOWSKA (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia + Tablica LUMINA / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Wizytówka: Wioletta Rogowska — Współzałożycielka Christian Culture, Rodzina i Wiara (#${broadcastNum})
- **URL:** https://polskieradio.cc/lumina.wiolettarogowska
- **Kategoria:** profile (Wizytówka & Profil Społeczności LUMINA)
- **Grafika:** wioletta-og.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format posta X:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  👤 SPOŁECZNOŚĆ CC | Portal LUMINA
  Wioletta Rogowska — Współzałożycielka Christian Culture, Rodzina i Wiara

  👉 Dołącz do społeczności LUMINA:
  https://polskieradio.cc/lumina.wiolettarogowska

  #WiolettaRogowska #LudzieMisji #ChristianCulture
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (Zweryfikowano publikację posta na profilu @csbwersetdnia)
  - Status publikacji LUMINA Tablica: SUKCES (Opublikowano wpis na /tablica jako Wioletta Rogowska docId 3l1I8qFLxmkhrWHGlqMA)
  - Ślad publikacji: \`data/x_published_history.json\` (#${broadcastNum})
  - Stan nadajnika: \`data/ccn_broadcaster_state.json\` (totalBroadcasts: ${broadcastNum})
  - Żywa Mapa Ekosystemu: Wpis zaktualizowany w \`data/ecosystem-map.json\` (Symbol A)
  - Koszt: 0,00 PLN (Playwright, 100% Free Tier)
  - Następny slot: za ok. 30 minut (~22:35 czasu warszawskiego)
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
