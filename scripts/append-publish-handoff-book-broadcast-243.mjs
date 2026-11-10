import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapLocalPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/data/ecosystem-map.json';
const mapMirrorPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-10 19:04';
const broadcastNum = 243;

const mapEntry = {
  date: '2026-11-10',
  topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Książka & Wydawnictwo CC: Pokonać Goliata — Twoja walka, Boże zwycięstwo (Cezary Rogowski) z dedykowaną grafiką tematyczną 16:9`,
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
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Książka & Wydawnictwo CC: Pokonać Goliata (Cezary Rogowski) (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Książka: Pokonać Goliata — Cezary Rogowski. Twoja walka, Boże zwycięstwo — URL: https://polskieradio.cc/pokonac-goliata — kategoria \`book\` (Książki & Wydawnictwo Christian Culture), autor: Cezary Rogowski, rotacja zrównoważona pozycjami: #242 U boku Diabła (news), #241 Rozwiąż problem: Rzuć palenie (course), #240 Werset Dnia Rdz 16:13 (verse), #239 Biblia Śpiewana Live (music), #238 Wizytówka Cezary Rogowski (profile).
  2. **Dedykowana oprawa graficzna:** \`images/news/art-pokonac-goliata.jpg\` (1376x768 16:9 HD) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — biblijna dolina Ela, kamienie Dawida i duchowe zwycięstwo w Chrystusie wg 1 Sm 17), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, bezbłędny upload Playwright na X).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     📚 KSIĄŻKA & WYDAWNICTWO CC
     Pokonać Goliata — 8 kroków zwycięzcy z doliny lęku do pełnej wolności według Słowa Bożego.

     👉 Czytaj w ekosystemie:
     https://polskieradio.cc/pokonac-goliata

     #PokonacGoliata #CezaryRogowski #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia o godz. 18:03:47 UTC (19:03:47 czasu warszawskiego).
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
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: POKONAĆ GOLIATA (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Książka: Pokonać Goliata — Cezary Rogowski. Twoja walka, Boże zwycięstwo (#${broadcastNum})
- **URL:** https://polskieradio.cc/pokonac-goliata
- **Kategoria:** book (Książki & Wydawnictwo CC)
- **Autor:** Cezary Rogowski (1 Sm 17 / Rz 8:31 UBG)
- **Grafika:** images/news/art-pokonac-goliata.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  📚 KSIĄŻKA & WYDAWNICTWO CC
  Pokonać Goliata — 8 kroków zwycięzcy z doliny lęku do pełnej wolności według Słowa Bożego.

  👉 Czytaj w ekosystemie:
  https://polskieradio.cc/pokonac-goliata

  #PokonacGoliata #CezaryRogowski #ChristianCulture
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (18:03:47 UTC / 19:03:47 Warszawa)
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('[JOMA] Zaktualizowano JOMA_HANDOFFS.md');
}
