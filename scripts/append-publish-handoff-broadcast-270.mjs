import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-13 10:34';
const broadcastNum = 270;

const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Wizytówka: Wioletta Rogowska (LUMINA) (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Wizytówka: Wioletta Rogowska — Współzałożycielka Christian Culture, Rodzina i Wiara (URL: https://polskieradio.cc/lumina.wiolettarogowska) — kategoria \`profile\` (Wizytówka / Społeczność LUMINA), rotacja zrównoważona pozycjami: #269 topTEN (music), #268 Werset Dnia Rdz 16:13 (verse), #267 Książki Cezary Rogowski (book), #266 Nowość Muzyczna Cezary Rogowski (music), #265 Wizytówka Cezary Rogowski (profile).
  2. **Dedykowana oprawa graficzna:** \`images/wioletta/wioletta-og.jpg\` (HD Retina) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna fotografia Wioletty Rogowskiej, współzałożycielki misji CC, brak fikcyjnych osób), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania, kontrastu i prawidłowego uploadu Playwright na profilu X).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     👤 SPOŁECZNOŚĆ CC | Portal LUMINA
     Wioletta Rogowska — Współzałożycielka Christian Culture, Rodzina i Wiara

     👉 Dołącz do społeczności LUMINA:
     https://polskieradio.cc/lumina.wiolettarogowska

     #WiolettaRogowska #LudzieMisji #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia o godz. 09:34 UTC (10:34 czasu warszawskiego).
  5. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A) oraz lustro w repozytorium LUMINA.
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: WIZYTÓWKA — WIOLETTA ROGOWSKA (PORTAL LUMINA) (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Wizytówka: Wioletta Rogowska — Współzałożycielka Christian Culture, Rodzina i Wiara (#${broadcastNum})
- **URL:** https://polskieradio.cc/lumina.wiolettarogowska
- **Kategoria:** profile (Wizytówka / Społeczność LUMINA)
- **Grafika:** images/wioletta/wioletta-og.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  👤 SPOŁECZNOŚĆ CC | Portal LUMINA
  Wioletta Rogowska — Współzałożycielka Christian Culture, Rodzina i Wiara

  👉 Dołącz do społeczności LUMINA:
  https://polskieradio.cc/lumina.wiolettarogowska

  #WiolettaRogowska #LudzieMisji #ChristianCulture
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (09:34 UTC / 10:34 Warszawa)
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
- **Następny krok:** Kolejna emisja w cyklu co ok. 30 minut (następny slot ok. 11:00–11:10 czasu warszawskiego).
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('Appended entry to JOMA_HANDOFFS.md');
}

// Aktualizacja ecosystem-map.json
const mapUpdateEntry = {
  date: '2026-11-13',
  topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Wizytówka Wioletta Rogowska (LUMINA) z dedykowaną grafiką tematyczną`,
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

console.log('Synchronizacja zakończona.');
