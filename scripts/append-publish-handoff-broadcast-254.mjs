import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapLocalPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/data/ecosystem-map.json';
const mapMirrorPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-11 00:34';
const broadcastNum = 254;

const mapEntry = {
  date: '2026-11-11',
  topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Świętość nie wymaga udawania: dlaczego prawda o słabości uwalnia? (Cezary Rogowski) z dedykowaną grafiką 16:9`,
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
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — CCN News: Świętość nie wymaga udawania (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Artykuł formacyjny CCN News: „Świętość nie wymaga udawania: dlaczego prawda o słabości uwalnia?” — autor: Cezary Rogowski — URL: https://polskieradio.cc/news/swietosc-nie-wymaga-udawania-dlaczego-prawda-o-slabosci-uwalnia — kategoria \`news\` (CCN News / Formacja i Wiara), zrównoważona rotacja: #253 Dzień 42 Pascha i Krew Baranka (module), #252 topTEN (music), #251 Werset Dnia Rdz 15:5 (verse), #250 Bóg jest MIŁOŚCIĄ? (book), #249 Gdy próbujemy pomóc Bogu oszustwem (news), #248 Gerald Welch — THE CALL (music), #247 Wizytówka: Wioletta Rogowska (profile).
  2. **Dedykowana oprawa graficzna:** \`images/news/art-swietosc-nie-wymaga-udawania-dlaczego-prawda-o-slabosci-uwalnia.jpg\` (16:9 HD, 401 KB) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna ilustracja redakcyjna glinianego naczynia z pęknięciami przepuszczającymi światło wg 2 Kor 4:7), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, bezbłędny upload Playwright na X).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     ✝️ FORMACJA & WIARA | CEZARY ROGOWSKI
     Świętość nie wymaga udawania: dlaczego prawda o słabości uwalnia?

     👉 Czytaj artykuł w serwisie:
     https://polskieradio.cc/news/swietosc-nie-wymaga-udawania-dlaczego-prawda-o-slabosci-uwalnia

     #Swietosc #CezaryRogowski #CCNNews #Prawda
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia o godz. 23:34 UTC (00:34 czasu warszawskiego).
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
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: ŚWIĘTOŚĆ NIE WYMAGA UDAWANIA (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** CCN News: Świętość nie wymaga udawania: dlaczego prawda o słabości uwalnia? — Cezary Rogowski (#${broadcastNum})
- **URL:** https://polskieradio.cc/news/swietosc-nie-wymaga-udawania-dlaczego-prawda-o-slabosci-uwalnia
- **Kategoria:** news (CCN News / Formacja i Wiara)
- **Grafika:** images/news/art-swietosc-nie-wymaga-udawania-dlaczego-prawda-o-slabosci-uwalnia.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format posta:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  ✝️ FORMACJA & WIARA | CEZARY ROGOWSKI
  Świętość nie wymaga udawania: dlaczego prawda o słabości uwalnia?

  👉 Czytaj artykuł w serwisie:
  https://polskieradio.cc/news/swietosc-nie-wymaga-udawania-dlaczego-prawda-o-slabosci-uwalnia

  #Swietosc #CezaryRogowski #CCNNews #Prawda
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (23:34 UTC / 00:34 Warszawa)
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('[JOMA] Zaktualizowano JOMA_HANDOFFS.md');
}
