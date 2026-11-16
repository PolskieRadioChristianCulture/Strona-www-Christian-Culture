import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-16 06:15';
const broadcastNum = 351;

// 1. Aktualizacja data/ecosystem-map.json
if (fs.existsSync(mapPath)) {
  const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const newEntry = {
    date: '2026-11-16',
    topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Premiera Muzyczna: Cezary Rogowski — Cokolwiek na świecie (Rz 8:38-39 / CC Men) z dedykowaną grafiką i Tablicą LUMINA`,
    agent: 'A'
  };
  if (Array.isArray(mapData.updatesLog)) {
    mapData.updatesLog.unshift(newEntry);
  }
  if (Array.isArray(mapData.recentUpdates)) {
    mapData.recentUpdates.unshift(newEntry);
    if (mapData.recentUpdates.length > 30) mapData.recentUpdates = mapData.recentUpdates.slice(0, 30);
  }
  mapData.lastUpdated = '2026-11-16T06:15:00+01:00';
  fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
  console.log(`Updated ecosystem-map.json with entry #${broadcastNum}`);
}

// 2. Prepended entry do JOMA_STATUS.md
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Premiera: Cezary Rogowski — Cokolwiek na świecie (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Premiera Muzyczna: „Cezary Rogowski — Cokolwiek na świecie (Rz 8:38-39 / CC Men). Premiera utworu z tekstem w odtwarzaczu CC Men” — URL: https://polskieradio.cc/CezaryRogowski — kategoria \`music\` (Muzyka & Wizytówka / Cezary Rogowski), rotacja pozycjami: #350 Werset Dnia Prz 13:20 (verse), #349 Kurs Codzienny Dzień 21 (course), #348 topTEN Notowania (music), #347 Wizytówka Wioletta Rogowska (profile), #346 Gerald Welch – THE CALL (news).
  2. **Dedykowana oprawa graficzna:** \`cezary-hero.jpg\` (\`images/cezaryrogowski/cezary-hero.jpg\`) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna dedykowana grafika 16:9 profilowa Cezarego Rogowskiego w odtwarzaczu CC Men), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania HD 16:9, upload w Playwright na profilu X @csbwersetdnia).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     🎵 PREMIERA AUTORSKA | CC MEN
     Cezary Rogowski — Cokolwiek na świecie (Rz 8:38-39). Premiera utworu z tekstem w odtwarzaczu CC Men.

     👉 Słuchaj z tekstem:
     https://polskieradio.cc/CezaryRogowski

     #CCMen #CezaryRogowski #MuzykaChrzescijanska
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post zweryfikowany i opublikowany na profilu @csbwersetdnia.
  5. **Tablica Społeczności LUMINA (/tablica):** Opublikowano z sukcesem jako Christian Culture (docId: \`AE6PvRZo7OxZeZanpS0v\`).
  6. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\` (#${broadcastNum}), \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A) oraz lustro w repozytorium LUMINA.
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: PREMIERA CEZARY ROGOWSKI — COKOLWIEK NA ŚWIECIE (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia + Tablica LUMINA / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Premiera: Cezary Rogowski — Cokolwiek na świecie (Rz 8:38-39 / CC Men) (#${broadcastNum})
- **URL:** https://polskieradio.cc/CezaryRogowski
- **Kategoria:** music (Muzyka & Wizytówka / Cezary Rogowski)
- **Grafika:** cezary-hero.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format posta X:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  🎵 PREMIERA AUTORSKA | CC MEN
  Cezary Rogowski — Cokolwiek na świecie (Rz 8:38-39). Premiera utworu z tekstem w odtwarzaczu CC Men.

  👉 Słuchaj z tekstem:
  https://polskieradio.cc/CezaryRogowski

  #CCMen #CezaryRogowski #MuzykaChrzescijanska
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (Zweryfikowano publikację na profilu @csbwersetdnia)
  - Status publikacji LUMINA Tablica: SUKCES (Opublikowano wpis na /tablica jako Christian Culture docId AE6PvRZo7OxZeZanpS0v)
  - Ślad publikacji: \`data/x_published_history.json\` (#${broadcastNum})
  - Stan nadajnika: \`data/ccn_broadcaster_state.json\` (totalBroadcasts: ${broadcastNum})
  - Żywa Mapa Ekosystemu: Wpis zaktualizowany w \`data/ecosystem-map.json\` (Symbol A)
  - Koszt: 0,00 PLN (Playwright, 100% Free Tier)
  - Następny slot: za ok. 30 minut (~06:45 czasu warszawskiego)
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
