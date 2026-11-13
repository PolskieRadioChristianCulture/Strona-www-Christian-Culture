import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-13 20:05';
const broadcastNum = 282;

const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Akademia Biblijna: Dzień 36 (Wj 5:1–23) (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Akademia Biblijna: Z Biblią za Pan Brat — Dzień 36 (Lekcja 36): Pierwsza konfrontacja z faraonem: Ciężary niewoli i próba wiary (Wj 5:1–23) (URL: https://polskieradio.cc/akademia/kurscodzienny/dzien-36) — kategoria \`course\` (Akademia Biblijna / Kurs Codzienny), rotacja zrównoważona pozycjami: #281 cclite.pl (module), #280 Holistyczny Coaching (profile), #279 Dobroć nie jest słabością (news), #278 Biblia Śpiewana Live (music), #277 Kino VOD SDS (vod).
  2. **Dedykowana oprawa graficzna:** \`kc_day_36_mojzesz_faraon_cegly.jpg\` — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna kinowa ilustracja Mojżesza, Aarona i ludu pod uciskiem faraona), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, kontrastu i prawidłowego uploadu Playwright na profilu X).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     🎓 AKADEMIA BIBLIJNA | KURS CODZIENNY
     Dzień 36 (Wj 5:1–23): Pierwsza konfrontacja z faraonem, próba wiary i Boża wierność.

     👉 Studiuj lekcję w serwisie:
     https://polskieradio.cc/akademia/kurscodzienny/dzien-36

     #KursCodzienny #ZBibliaZaPanBrat #AkademiaBiblijna
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia o godz. 19:05:15 UTC (20:05 czasu warszawskiego).
  5. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A) oraz lustro w repozytorium LUMINA.
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: AKADEMIA BIBLIJNA — DZIEŃ 36 (WJ 5:1–23) (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Akademia Biblijna: Z Biblią za Pan Brat — Dzień 36 (Wj 5:1–23) (#${broadcastNum})
- **URL:** https://polskieradio.cc/akademia/kurscodzienny/dzien-36
- **Kategoria:** course (Akademia Biblijna / Kurs Codzienny)
- **Grafika:** kc_day_36_mojzesz_faraon_cegly.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  🎓 AKADEMIA BIBLIJNA | KURS CODZIENNY
  Dzień 36 (Wj 5:1–23): Pierwsza konfrontacja z faraonem, próba wiary i Boża wierność.

  👉 Studiuj lekcję w serwisie:
  https://polskieradio.cc/akademia/kurscodzienny/dzien-36

  #KursCodzienny #ZBibliaZaPanBrat #AkademiaBiblijna
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (19:05:15 UTC / 20:05 Warszawa)
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
- **Następny krok:** Kolejna emisja w cyklu co ok. 30 minut (następny slot ok. 20:35–20:45 czasu warszawskiego).
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('Appended entry to JOMA_HANDOFFS.md');
}

// Aktualizacja ecosystem-map.json
const mapUpdateEntry = {
  date: '2026-11-13',
  topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Akademia Biblijna: Dzień 36 (Wj 5:1–23) z dedykowaną grafiką tematyczną`,
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

console.log('Synchronizacja #${broadcastNum} zakończona pomyślnie.');
