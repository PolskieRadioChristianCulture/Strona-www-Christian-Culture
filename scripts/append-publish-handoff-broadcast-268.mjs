import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-13 09:41';
const broadcastNum = 268;

const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Werset Dnia: „Ty jesteś Bogiem, który mnie widzi” (Rdz 16:13, UBG) (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Werset Dnia: „Ty jesteś Bogiem, który mnie widzi” (Rdz 16:13, UBG) (URL: https://polskieradio.cc/mojabiblia?ref=GEN.16.13) — kategoria \`verse\` (Werset Dnia / Pismo Święte), rotacja zrównoważona pozycjami: #267 Książka Cezary Rogowski (book), #266 Nowość Muzyczna Cezary Rogowski (music), #265 Wizytówka Cezary Rogowski (profile), #264 Werset Dnia Wj 20:8 (verse), #263 Żywa Mapa Ekosystemu (module).
  2. **Dedykowana oprawa graficzna:** \`images/news/art-rdz16-17-hagar-el-roi.jpg\` (16:9 HD) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — biblijna, fotorealistyczna scena spotkania Hagar z Bogiem El-Roi przy źródle wody na pustyni w drodze do Szur wg Rdz 16:13), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, kontrastu i prawidłowego uploadu Playwright na profilu X).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     📖 WERSET DNIA (UBG)
     „I nazwała PANA, który mówił do niej: Ty jesteś Bogiem, który mnie widzi. Powiedziała bowiem: Czyż tu nie spoglądałam na tego, który widzi mnie?” (Rdz 16:13)

     👉 MojaBiblia:
     https://polskieradio.cc/mojabiblia?ref=GEN.16.13

     #WersetDnia #SlowoBoze
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia o godz. 08:41 UTC (09:41 czasu warszawskiego).
  5. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A) oraz lustro w repozytorium LUMINA.
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: WERSET DNIA (UBG) — „TY JESTEŚ BOGIEM, KTÓRY MNIE WIDZI” (RDZ 16:13) (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Werset Dnia: „Ty jesteś Bogiem, który mnie widzi” (Rdz 16:13, UBG) (#${broadcastNum})
- **URL:** https://polskieradio.cc/mojabiblia?ref=GEN.16.13
- **Kategoria:** verse (Werset Dnia / Pismo Święte UBG)
- **Grafika:** images/news/art-rdz16-17-hagar-el-roi.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  📖 WERSET DNIA (UBG)
  „I nazwała PANA, który mówił do niej: Ty jesteś Bogiem, który mnie widzi. Powiedziała bowiem: Czyż tu nie spoglądałam na tego, który widzi mnie?” (Rdz 16:13)

  👉 MojaBiblia:
  https://polskieradio.cc/mojabiblia?ref=GEN.16.13

  #WersetDnia #SlowoBoze
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (08:41 UTC / 09:41 Warszawa)
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
- **Następny krok:** Kolejna emisja w cyklu co ok. 30 minut (następny slot ok. 10:10–10:20 czasu warszawskiego).
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('Appended entry to JOMA_HANDOFFS.md');
}

// Aktualizacja ecosystem-map.json
const mapUpdateEntry = {
  date: '2026-11-13',
  topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Werset Dnia (Rdz 16:13 UBG) z dedykowaną grafiką tematyczną 16:9`,
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
