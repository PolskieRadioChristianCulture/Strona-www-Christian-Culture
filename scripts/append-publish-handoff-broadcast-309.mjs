import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-14 17:34';
const broadcastNum = 309;

const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Kino VOD SDS: Proroctwa Apokalipsy (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** „Kino VOD & YouTube: Studio Dobrego Słowa — Proroctwa Księgi Apokalipsy” — URL: https://polskieradio.cc/vod — kategoria \`vod\` (Kino Chrześcijańskie VOD & Studio Dobrego Słowa), rotacja zrównoważona pozycjami: #308 Werset Dnia: Ps 126:5-6 (verse), #307 Pokonać Goliata (book), #306 Lekcja 30 (course), #305 Biblia PDF (module), #304 Paweł Murawski Coaching (profile), #303 TV Epafraz (music), #302 Budżet bez kredytu (news).
  2. **Dedykowana oprawa graficzna:** \`art-cbdc-prawo-niedzielne-apokalipsa-13.jpg\` — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna grafika wykładów biblijnych SDS o proroctwach i prawie niedzielnym), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, uploadu w Playwright na profilu X @csbwersetdnia).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     🎬 KINO CHRZEŚCIJAŃSKIE VOD | SDS
     Proroctwa Daniela i Księgi Objawienia w serii wykładów biblijnych 4K UHD ze SDS.

     👉 Oglądaj bezpłatnie w jakości 4K:
     https://polskieradio.cc/vod

     #StudioDobregoSlowa #KinoVOD #Apokalipsa #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post zweryfikowany i opublikowany na profilu @csbwersetdnia o godz. 16:33:43 UTC (17:33:43 czasu warszawskiego).
  5. **Tablica LUMINA (/tablica):** Automatyczna kontrola równoległa (okno lokalnego duplikatu pominięte zgodnie z regułą anti-flood).
  6. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\` (308 wpisów), \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A) oraz lustro w repozytorium LUMINA.
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: KINO VOD SDS (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Kino VOD & YouTube: Studio Dobrego Słowa — Proroctwa Księgi Apokalipsy (#${broadcastNum})
- **URL:** https://polskieradio.cc/vod
- **Kategoria:** vod (Kino Chrześcijańskie VOD & Studio Dobrego Słowa)
- **Grafika:** art-cbdc-prawo-niedzielne-apokalipsa-13.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  🎬 KINO CHRZEŚCIJAŃSKIE VOD | SDS
  Proroctwa Daniela i Księgi Objawienia w serii wykładów biblijnych 4K UHD ze SDS.

  👉 Oglądaj bezpłatnie w jakości 4K:
  https://polskieradio.cc/vod

  #StudioDobregoSlowa #KinoVOD #Apokalipsa #ChristianCulture
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (Zweryfikowano publikację na profilu @csbwersetdnia o 17:33:43 czasu warszawskiego)
  - Ślad publikacji: \`data/x_published_history.json\` (308 pozycji)
  - Stan nadajnika: \`data/ccn_broadcaster_state.json\` (totalBroadcasts: 309, lastIndex: 380)
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
- **Następny krok:** Kolejna emisja w cyklu co ok. 30 minut (następny slot ok. 18:00–18:10 czasu warszawskiego).
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('Appended entry to JOMA_HANDOFFS.md');
}

// Aktualizacja ecosystem-map.json
const mapUpdateEntry = {
  date: '2026-11-14',
  topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Kino VOD: Proroctwa Apokalipsy SDS z dedykowaną grafiką`,
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
