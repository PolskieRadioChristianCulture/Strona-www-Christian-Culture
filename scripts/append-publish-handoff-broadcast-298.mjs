import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-14 11:38';
const broadcastNum = 298;

const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Społeczność CC: Duchowny Mariusz (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Duchowny Mariusz — Wsparcie Duszpasterskie, Rozmowa Telefoniczna i SMS — URL: https://polskieradio.cc/lumina.mariusz — kategoria \`profile\` (Społeczność & Relacje / Portal LUMINA), rotacja zrównoważona pozycjami: #297 cclite.pl (module), #296 Czy Jezus naprawdę był Bogiem (news), #295 CC Music Hub (music), #294 Werset Dnia: Psalm 119:130 (verse), #293 Kino VOD Apokalipsa (vod), #292 Bóg jest MIŁOŚCIĄ? (book), #291 Pismo Święte (course).
  2. **Dedykowana oprawa graficzna:** \`avatar_mariusz.jpg\` — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna fotografia Mariusza ze Studia Dobrego Słowa, zero postaci stockowych, brak kadrów radiowych), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 1:1 / 16:9, kontrastu i prawidłowego załączenia w Playwright na profilu X @csbwersetdnia).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     👤 SPOŁECZNOŚĆ CC | Portal LUMINA
     Duchowny Mariusz — Wsparcie Duszpasterskie, Rozmowa Telefoniczna i SMS

     👉 Dołącz do społeczności LUMINA:
     https://polskieradio.cc/lumina.mariusz

     #Lumina #LudzieMisji #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia o godz. 10:37:47 UTC (11:37:47 czasu warszawskiego).
  5. **Tablica LUMINA (/tablica):** Automatyczna równoległa publikacja na Tablicy Społeczności LUMINA jako Wioletta Rogowska (docId: \`gil3WDByc1oStUuYdZaw\`).
  6. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A) oraz lustro w repozytorium LUMINA.
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: DUCHOWNY MARIUSZ (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Duchowny Mariusz — Wsparcie Duszpasterskie, Rozmowa Telefoniczna i SMS (#${broadcastNum})
- **URL:** https://polskieradio.cc/lumina.mariusz
- **Kategoria:** profile (Społeczność & Relacje / Portal LUMINA)
- **Grafika:** avatar_mariusz.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  👤 SPOŁECZNOŚĆ CC | Portal LUMINA
  Duchowny Mariusz — Wsparcie Duszpasterskie, Rozmowa Telefoniczna i SMS

  👉 Dołącz do społeczności LUMINA:
  https://polskieradio.cc/lumina.mariusz

  #Lumina #LudzieMisji #ChristianCulture
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (Zweryfikowano zniknięcie composer modal i publikację na profilu @csbwersetdnia)
  - Tablica LUMINA (/tablica): Opublikowano jako Wioletta Rogowska (docId: gil3WDByc1oStUuYdZaw)
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
- **Następny krok:** Kolejna emisja w cyklu co ok. 30 minut (następny slot ok. 12:05–12:15 czasu warszawskiego).
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('Appended entry to JOMA_HANDOFFS.md');
}

// Aktualizacja ecosystem-map.json
const mapUpdateEntry = {
  date: '2026-11-14',
  topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Społeczność & Relacje: Duchowny Mariusz (Portal LUMINA) z autentyczną fotografią`,
  agent: 'A'
};

for (const p of [mapPath, luminaMapPath]) {
  if (fs.existsSync(p)) {
    try {
      const mapData = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (!Array.isArray(mapData.updatesLog)) mapData.updatesLog = [];
      if (!mapData.updatesLog.some(u => u.topic && u.topic.includes(`#${broadcastNum}`))) {
        mapData.updatesLog.unshift(mapUpdateEntry);
        fs.writeFileSync(p, JSON.stringify(mapData, null, 2), 'utf8');
        console.log(`Updated updatesLog in ${p}`);
      }
    } catch (e) {
      console.warn(`Warn updating map ${p}:`, e.message);
    }
  }
}

console.log(`Synchronizacja #${broadcastNum} zakończona pomyślnie.`);
