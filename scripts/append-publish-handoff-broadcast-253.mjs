import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapLocalPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/data/ecosystem-map.json';
const mapMirrorPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-11 00:05';
const broadcastNum = 253;

const mapEntry = {
  date: '2026-11-11',
  topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Akademia Biblijna: Z Biblią za Pan Brat — Dzień 42 (Święto Paschy, Krew Baranka i Wykupienie Pierworodnych) z dedykowaną grafiką 16:9`,
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
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Akademia Biblijna: Dzień 42 Pascha i Krew Baranka (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Akademia Biblijna: Z Biblią za Pan Brat — Dzień 42 (Wj 11:1–12:36): Święto Paschy, Krew Baranka i Wykupienie Pierworodnych — Noc sądu i triumfalne wyjście z Egiptu — URL: https://polskieradio.cc/akademia/kurscodzienny/dzien-42 — kategoria \`module\` (Akademia Biblijna), zrównoważona rotacja: #252 topTEN (music), #251 Werset Dnia Rdz 15:5 (verse), #250 Bóg jest MIŁOŚCIĄ? (book), #249 Gdy próbujemy pomóc Bogu oszustwem (news), #248 Gerald Welch — THE CALL (music), #247 Wizytówka: Wioletta Rogowska (profile).
  2. **Dedykowana oprawa graficzna:** \`images/academy/daily/kc_day_42_swieto_paschy_krew_baranka.jpg\` (16:9 HD, 858 KB) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna ilustracja tematyczna Paschy i krwi Baranka na odrzwiach), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, bezbłędny upload Playwright na X).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     🎓 AKADEMIA BIBLIJNA CC
     Dzień 42 (Wj 11:1–12:36): Święto Paschy, krew Baranka na odrzwiach w Goszen, sąd nad bóstwami Egiptu i odkupienie ludu Bożego.

     👉 Studiuj bezpłatnie:
     https://polskieradio.cc/akademia/kurscodzienny/dzien-42

     #KursCodzienny #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia o godz. 23:04:32 UTC (00:04:32 czasu warszawskiego).
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
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: AKADEMIA BIBLIJNA DZIEŃ 42 (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Akademia Biblijna: Z Biblią za Pan Brat — Dzień 42 (Wj 11:1–12:36): Święto Paschy, Krew Baranka i Wykupienie Pierworodnych (#${broadcastNum})
- **URL:** https://polskieradio.cc/akademia/kurscodzienny/dzien-42
- **Kategoria:** module (Akademia Biblijna CC)
- **Grafika:** images/academy/daily/kc_day_42_swieto_paschy_krew_baranka.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format posta:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  🎓 AKADEMIA BIBLIJNA CC
  Dzień 42 (Wj 11:1–12:36): Święto Paschy, krew Baranka na odrzwiach w Goszen, sąd nad bóstwami Egiptu i odkupienie ludu Bożego.

  👉 Studiuj bezpłatnie:
  https://polskieradio.cc/akademia/kurscodzienny/dzien-42

  #KursCodzienny #ChristianCulture
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (23:04:32 UTC / 00:04:32 Warszawa)
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('[JOMA] Zaktualizowano JOMA_HANDOFFS.md');
}
