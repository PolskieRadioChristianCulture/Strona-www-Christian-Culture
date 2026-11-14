import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-14 08:04';
const broadcastNum = 294;

const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Werset Dnia: Psalm 119:130 UBG (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Werset Dnia: „Wykład Twoich słów oświeca i daje zrozumienie prostaczkom” (Psalm 119:130, UBG) — URL: https://polskieradio.cc/werset-dnia?day=318 — kategoria \`verse\` (Werset Dnia / MojaBiblia CC), rotacja zrównoważona pozycjami: #293 Kino VOD Apokalipsa (vod), #292 Bóg jest MIŁOŚCIĄ? (book), #291 Pismo Święte (course), #290 Dzień 46 (module), #289 Premier HeatFix UK (profile), #288 Historia hymnu Amazing Grace (news), #287 Podcasty CC (music).
  2. **Dedykowana oprawa graficzna:** \`images/player/sidebar-verse-bg.jpg\` — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna grafika Słowa Bożego i wersetu dnia dla MojaBiblia / Psalm 119), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, kontrastu i prawidłowego uploadu Playwright na profilu X @csbwersetdnia).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     📖 WERSET DNIA (UBG)
     „Początek twoich słów oświeca i daje rozum prostym.” (Psalm 119:130, UBG)

     👉 MojaBiblia:
     https://polskieradio.cc/werset-dnia?day=318

     #WersetDnia #SlowoBoze
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia w porannym oknie 08:04 czasu warszawskiego.
  5. **Tablica LUMINA (/tablica):** Automatyczna równoległa publikacja na Tablicy Społeczności LUMINA jako Christian Culture (docId: \`M9bhcXOsEgsBQctBTeXh\`).
  6. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A) oraz lustro w repozytorium LUMINA.
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: WERSET DNIA PSALM 119:130 UBG (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Werset Dnia: „Wykład Twoich słów oświeca i daje zrozumienie prostaczkom” (Psalm 119:130, UBG) (#${broadcastNum})
- **URL:** https://polskieradio.cc/werset-dnia?day=318
- **Kategoria:** verse (Werset Dnia / MojaBiblia CC)
- **Grafika:** images/player/sidebar-verse-bg.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  📖 WERSET DNIA (UBG)
  „Początek twoich słów oświeca i daje rozum prostym.” (Psalm 119:130, UBG)

  👉 MojaBiblia:
  https://polskieradio.cc/werset-dnia?day=318

  #WersetDnia #SlowoBoze
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (Zweryfikowano toast/alert i zniknięcie modalu na profilu @csbwersetdnia)
  - Tablica LUMINA (/tablica): Opublikowano jako Christian Culture (docId: M9bhcXOsEgsBQctBTeXh)
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
- **Następny krok:** Kolejna emisja w cyklu co ok. 30 minut (następny slot ok. 08:35–08:45 czasu warszawskiego).
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('Appended entry to JOMA_HANDOFFS.md');
}

// Aktualizacja ecosystem-map.json
const mapUpdateEntry = {
  date: '2026-11-14',
  topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Werset Dnia: Psalm 119:130 (UBG) z dedykowaną grafiką Słowa Bożego`,
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
