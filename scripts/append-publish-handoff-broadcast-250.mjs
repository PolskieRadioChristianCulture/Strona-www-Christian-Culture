import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapLocalPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/data/ecosystem-map.json';
const mapMirrorPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-10 22:34';
const broadcastNum = 250;

const mapEntry = {
  date: '2026-11-10',
  topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Książka & Wydawnictwo CC: Bóg jest MIŁOŚCIĄ? — Cezary i Wioletta Rogowscy z dedykowaną grafiką 16:9`,
  agent: 'A'
};

// 1. Aktualizacja ecosystem-map.json
for (const p of [mapLocalPath, mapMirrorPath]) {
  if (fs.existsSync(p)) {
    try {
      const mapData = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (Array.isArray(mapData.updatesLog)) {
        mapData.updatesLog.unshift(mapEntry);
        fs.writeFileSync(p, JSON.stringify(mapData, null, 2), 'utf8');
        console.log(`[MAP] Zaktualizowano ${p}`);
      }
    } catch (e) {
      console.warn(`[MAP WARN] Błąd aktualizacji ${p}:`, e.message);
    }
  }
}

// 2. Aktualizacja JOMA_STATUS.md
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Bóg jest MIŁOŚCIĄ? — Cezary i Wioletta Rogowscy (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Książka & Wydawnictwo CC: Bóg jest MIŁOŚCIĄ? — Cezary i Wioletta Rogowscy. Odpowiedź na trudne pytania — URL: https://polskieradio.cc/bog-jest-miloscia — kategoria \`book\` (Książka & Wydawnictwo CC), zrównoważona rotacja pozycjami: #249 Gdy próbujemy pomóc Bogu oszustwem (news), #248 Gerald Welch — THE CALL (music), #247 Wizytówka: Wioletta Rogowska (profile), #246 Kino VOD & SDS: Proroctwa Księgi Apokalipsy (vod), #245 Werset Dnia Rdz 50:20 (verse), #244 Akademia Biblijna (module), #243 Pokonać Goliata (book), #242 U boku Diabła (news), #241 Rozwiąż problem (course).
  2. **Dedykowana oprawa graficzna:** \`images/news/art-bog-jest-miloscia.jpg\` (16:9 HD) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna okładka/ilustracja autorska Cezarego i Wioletty Rogowskich), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, bezbłędny upload Playwright na X).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     📚 KSIĄŻKA & WYDAWNICTWO CC
     Bóg jest MIŁOŚCIĄ? — Cezary i Wioletta Rogowscy. Odpowiedź na trudne pytania

     👉 Czytaj w ekosystemie:
     https://polskieradio.cc/bog-jest-miloscia

     #BogJestMiloscia #CezaryRogowski #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia o godz. 21:33:55 UTC (22:33:55 czasu warszawskiego).
  5. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` oraz mirror LUMINA — wpis #${broadcastNum}, symbol A).
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('[JOMA] Zaktualizowano JOMA_STATUS.md');
}

// 3. Aktualizacja JOMA_HANDOFFS.md
const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: BÓG JEST MIŁOŚCIĄ? — CEZARY I WIOLETTA ROGOWSCY (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Książka & Wydawnictwo CC: Bóg jest MIŁOŚCIĄ? — Cezary i Wioletta Rogowscy. Odpowiedź na trudne pytania (#${broadcastNum})
- **URL:** https://polskieradio.cc/bog-jest-miloscia
- **Kategoria:** book (Książka & Wydawnictwo CC)
- **Grafika:** images/news/art-bog-jest-miloscia.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  📚 KSIĄŻKA & WYDAWNICTWO CC
  Bóg jest MIŁOŚCIĄ? — Cezary i Wioletta Rogowscy. Odpowiedź na trudne pytania

  👉 Czytaj w ekosystemie:
  https://polskieradio.cc/bog-jest-miloscia

  #BogJestMiloscia #CezaryRogowski #ChristianCulture
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (21:33:55 UTC / 22:33:55 Warszawa)
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('[JOMA] Zaktualizowano JOMA_HANDOFFS.md');
}
