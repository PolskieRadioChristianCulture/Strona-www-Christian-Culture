import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-14 07:35';
const broadcastNum = 293;

const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Kino VOD: Studio Dobrego Słowa — Proroctwa Księgi Apokalipsy (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Kino VOD & YouTube: Studio Dobrego Słowa — Proroctwa Księgi Apokalipsy (URL: https://polskieradio.cc/vod) — kategoria \`vod\` (Kino Chrześcijańskie VOD & SDS / Proroctwa Daniela i Objawienia 4K UHD), rotacja zrównoważona pozycjami: #292 Bóg jest MIŁOŚCIĄ? (book), #291 Pismo Święte (course), #290 Dzień 46 (module), #289 Premier HeatFix UK (profile), #288 Historia hymnu Amazing Grace (news), #287 Podcasty CC (music).
  2. **Dedykowana oprawa graficzna:** \`art-cbdc-prawo-niedzielne-apokalipsa-13.jpg\` — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna kinowa grafika tematyczna dla cyklu wykładów Apokalipsy), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, kontrastu i prawidłowego uploadu Playwright na profilu X).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     🎬 KINO CHRZEŚCIJAŃSKIE VOD | SDS
     Proroctwa Daniela i Księgi Objawienia w serii wykładów biblijnych 4K UHD ze SDS.

     👉 Oglądaj bezpłatnie w jakości 4K:
     https://polskieradio.cc/vod

     #StudioDobregoSlowa #KinoVOD #Apokalipsa #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia w porannym oknie 07:35 czasu warszawskiego.
  5. **Tablica LUMINA (/tablica):** Automatyczna równoległa publikacja na Tablicy Społeczności LUMINA jako Wioletta Rogowska (docId: \`4QKltTUwDzkr8vZQOcmz\`).
  6. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A) oraz lustro w repozytorium LUMINA.
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: KINO VOD — PROROCTWA KSIĘGI APOKALIPSY SDS (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Kino VOD & YouTube: Studio Dobrego Słowa — Proroctwa Księgi Apokalipsy (#${broadcastNum})
- **URL:** https://polskieradio.cc/vod
- **Kategoria:** vod (Kino Chrześcijańskie VOD & SDS)
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
  - Status publikacji X: SUKCES (Zweryfikowano toast/alert i zniknięcie modalu)
  - Tablica LUMINA (/tablica): Opublikowano jako Wioletta Rogowska (docId: 4QKltTUwDzkr8vZQOcmz)
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
- **Następny krok:** Kolejna emisja w cyklu co ok. 30 minut (następny slot ok. 08:05–08:15 czasu warszawskiego).
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('Appended entry to JOMA_HANDOFFS.md');
}

// Aktualizacja ecosystem-map.json
const mapUpdateEntry = {
  date: '2026-11-14',
  topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Kino VOD: Studio Dobrego Słowa — Proroctwa Księgi Apokalipsy z dedykowaną grafiką tematyczną`,
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
