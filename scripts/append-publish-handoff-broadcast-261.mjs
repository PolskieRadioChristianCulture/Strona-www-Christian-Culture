import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-11 07:38';
const broadcastNum = 261;

const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Książka: Pokonać Goliata (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** „Książka: Pokonać Goliata — Cezary Rogowski. Twoja walka, Boże zwycięstwo” (URL: https://polskieradio.cc/pokonac-goliata) — kategoria \`book\` (Wydawnictwo & Półka Autorska), rotacja zrównoważona pozycjami: #260 11 Listopada Patriotyzm (news), #259 Ark of Fire (music), #258 Werset Dnia Rdz 18:25 (verse), #257 Rozwiąż problem (course), #256 LUMINA (profile).
  2. **Dedykowana oprawa graficzna:** \`images/news/art-pokonac-goliata.jpg\` — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — fotorealistyczna okładka bestsellera o wierze i zwycięstwie w Chrystusie), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, bezbłędny upload Playwright na platformie X).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     📚 KSIĄŻKA & WYDAWNICTWO CC
     Pokonać Goliata — 8 kroków zwycięzcy z doliny lęku do pełnej wolności według Słowa Bożego.

     👉 Czytaj w ekosystemie:
     https://polskieradio.cc/pokonac-goliata

     #PokonacGoliata #CezaryRogowski #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia o godz. 06:38:41Z (07:38:41 czasu warszawskiego).
  5. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A).
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: KSIĄŻKA POKONAĆ GOLIATA (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Książka: Pokonać Goliata — Cezary Rogowski. Twoja walka, Boże zwycięstwo (#${broadcastNum})
- **URL:** https://polskieradio.cc/pokonac-goliata
- **Kategoria:** book (Książka & Wydawnictwo CC)
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
  - Status publikacji X: SUKCES (06:38:41 UTC / 07:38:41 Warszawa)
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
- **Następny krok:** Kolejna emisja w cyklu co ok. 30 minut (następny slot ok. 08:05–08:15).
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
        topic: `Cykliczna publikacja CCN News na platformie X #${broadcastNum}: Książka — Pokonać Goliata (Cezary Rogowski)`,
        agent: 'A'
      });
    }
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
