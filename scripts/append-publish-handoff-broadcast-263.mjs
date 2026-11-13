import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-11 09:03';
const broadcastNum = 263;

const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Żywa Interaktywna Mapa Ekosystemu Christian Culture (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** „Żywa Interaktywna Mapa Ekosystemu Christian Culture” (URL: https://polskieradio.cc/mapa) — kategoria \`module\` (Architektura & Ekosystem CC), rotacja zrównoważona pozycjami: #262 Kino VOD & SDS (vod), #261 Pokonać Goliata (book), #260 11 Listopada Patriotyzm (news), #259 Ark of Fire (music), #258 Werset Dnia Rdz 18:25 (verse).
  2. **Dedykowana oprawa graficzna:** \`assets/mapa/planeta-poster.jpg\` — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — fotorealistyczna grafika 16:9 HD przedstawiająca interaktywną planetę i strukturę architektury ekosystemu CC), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, bezbłędny upload Playwright na platformie X).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     🗺️ ŻYWA MAPA EKOSYSTEMU CC
     Żywa Interaktywna Mapa Ekosystemu Christian Culture

     👉 Zobacz architekturę na żywo:
     https://polskieradio.cc/mapa

     #MapaCC #EkosystemCC #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia o godz. 08:03:35Z (09:03:35 czasu warszawskiego).
  5. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A).
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: ŻYWA MAPA EKOSYSTEMU CC (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Żywa Interaktywna Mapa Ekosystemu Christian Culture (#${broadcastNum})
- **URL:** https://polskieradio.cc/mapa
- **Kategoria:** module (Architektura & Ekosystem Christian Culture)
- **Grafika:** assets/mapa/planeta-poster.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  🗺️ ŻYWA MAPA EKOSYSTEMU CC
  Żywa Interaktywna Mapa Ekosystemu Christian Culture

  👉 Zobacz architekturę na żywo:
  https://polskieradio.cc/mapa

  #MapaCC #EkosystemCC #ChristianCulture
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (08:03:35 UTC / 09:03:35 Warszawa)
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
- **Następny krok:** Kolejna emisja w cyklu co ok. 30 minut (następny slot ok. 09:30–09:40 czasu warszawskiego).
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('Appended entry to JOMA_HANDOFFS.md');
}

// Aktualizacja ecosystem-map.json
if (fs.existsSync(mapPath)) {
  try {
    const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    if (!Array.isArray(mapData.updates)) mapData.updates = [];
    if (!mapData.updates.some(u => u.topic && u.topic.includes(`#${broadcastNum}`))) {
      mapData.updates.unshift({
        date: '2026-11-11',
        topic: `Cykliczna publikacja CCN News na platformie X #${broadcastNum}: Żywa Interaktywna Mapa Ekosystemu CC`,
        agent: 'A'
      });
    }
    if (!Array.isArray(mapData.updatesLog)) mapData.updatesLog = [];
    if (!mapData.updatesLog.some(u => u.topic && u.topic.includes(`#${broadcastNum}`))) {
      mapData.updatesLog.unshift({
        date: '2026-11-11',
        topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Żywa Interaktywna Mapa Ekosystemu CC z dedykowaną grafiką 16:9`,
        agent: 'A'
      });
    }
    mapData.lastUpdated = '2026-11-11';
    fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
    console.log('Updated data/ecosystem-map.json');

    if (fs.existsSync(path.dirname(luminaMapPath))) {
      fs.writeFileSync(luminaMapPath, JSON.stringify(mapData, null, 2), 'utf8');
      console.log('Mirrored to Desktop/@ICC/LUMINA/data/ecosystem-map.json');
    }
  } catch (err) {
    console.warn('Błąd aktualizacji ecosystem-map.json:', err.message);
  }
}
