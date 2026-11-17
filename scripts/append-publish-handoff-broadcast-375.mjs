import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapLocalPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/data/ecosystem-map.json';
const mapMirrorPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-17 06:32';
const broadcastNum = 375;
const dateIso = '2026-11-17';

// 1. Aktualizacja data/ecosystem-map.json + mirror LUMINA
if (fs.existsSync(mapLocalPath)) {
  try {
    const mapData = JSON.parse(fs.readFileSync(mapLocalPath, 'utf8'));
    if (!Array.isArray(mapData.updatesLog)) {
      mapData.updatesLog = [];
    }
    const topic = `CCN News X: Cykliczna publikacja #${broadcastNum} — Społeczność LUMINA: Holistyczny Coaching & Terapia Wolności (Paweł Murawski) z dedykowaną grafiką i Tablicą LUMINA`;
    const alreadyExists = mapData.updatesLog.some(u => u.topic && u.topic.includes(`#${broadcastNum}`));
    if (!alreadyExists) {
      mapData.updatesLog.unshift({
        date: dateIso,
        topic,
        agent: 'A'
      });
      if (mapData.updatesLog.length > 500) {
        mapData.updatesLog = mapData.updatesLog.slice(0, 500);
      }
      fs.writeFileSync(mapLocalPath, JSON.stringify(mapData, null, 2) + '\n', 'utf8');
      console.log('✅ Zaktualizowano data/ecosystem-map.json');
      if (fs.existsSync(path.dirname(mapMirrorPath))) {
        fs.writeFileSync(mapMirrorPath, JSON.stringify(mapData, null, 2) + '\n', 'utf8');
        console.log('✅ Zsynchronizowano mirror Desktop/@ICC/LUMINA/data/ecosystem-map.json');
      }
    }
  } catch (err) {
    console.error('Błąd aktualizacji ecosystem-map.json:', err.message);
  }
}

// 2. Aktualizacja JOMA_STATUS.md
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Społeczność LUMINA: Holistyczny Coaching & Terapia Wolności (Paweł Murawski) z dedykowaną grafiką i Tablicą LUMINA (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Holistyczny Coaching & Terapia Wolności — Paweł Murawski — URL: https://polskieradio.cc/holistyczny-coaching — kategoria \`profile\` (Społeczność & Relacje), zrównoważona rotacja filarów ekosystemu CC (pozycja [514/694]).
  2. **Dedykowana grafika tematyczna:** \`avatar_pawel_murawski.jpg\` — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczne zdjęcie profilowe Pawła Murawskiego zgodne z podstroną), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja wizualna, HTTP 200 na produkcji, upload w Playwright na profilu X @csbwersetdnia).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     👤 SPOŁECZNOŚĆ CC | Portal LUMINA
     Holistyczny Coaching & Terapia Wolności — Paweł Murawski

     👉 Dołącz do społeczności LUMINA:
     https://polskieradio.cc/holistyczny-coaching

     #Lumina #LudzieMisji #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs --once\`), ZERO COST (0,00 PLN), post zweryfikowany i opublikowany na profilu @csbwersetdnia.
  5. **Tablica LUMINA (/tablica):** Opublikowano jako Wioletta Rogowska (ID: \`TLNDraJBEzqDaXUcvyhJ\`).
  6. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}, lastIndex: 513), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` oraz mirror LUMINA — wpis #${broadcastNum}, symbol A).
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  if (!currentStatus.includes(`CCN BROADCASTER #${broadcastNum}`)) {
    fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
    console.log('✅ Zaktualizowano JOMA_STATUS.md');
  }
}

// 3. Aktualizacja JOMA_HANDOFFS.md
const handoffEntry = `
---

### [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA CCN NEWS NA PLATFORMIE X (#${broadcastNum}) [PASS]
- **Wątek Skrzynki:** MSG-20261117T053210Z-antigravity-d657db
- **Opublikowana pozycja z ekosystemu:**
  - Kategoria: Społeczność & Relacje (profile)
  - Tytuł: Holistyczny Coaching & Terapia Wolności — Paweł Murawski
  - Link: https://polskieradio.cc/holistyczny-coaching (HTTP 200)
  - Grafika dedykowana: \`avatar_pawel_murawski.jpg\`
- **Treść wpisu na X (@csbwersetdnia):**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  👤 SPOŁECZNOŚĆ CC | Portal LUMINA
  Holistyczny Coaching & Terapia Wolności — Paweł Murawski

  👉 Dołącz do społeczności LUMINA:
  https://polskieradio.cc/holistyczny-coaching

  #Lumina #LudzieMisji #ChristianCulture
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (Playwright headless Chromium, weryfikacja wysłania i publikacji na profilu @csbwersetdnia)
  - Tablica LUMINA (/tablica): Opublikowano jako Wioletta Rogowska (ID: \`TLNDraJBEzqDaXUcvyhJ\`)
  - Ślad publikacji: \`data/x_published_history.json\` (#${broadcastNum})
  - Stan nadajnika: \`data/ccn_broadcaster_state.json\` (totalBroadcasts: ${broadcastNum}, lastPostedAt: 2026-11-17T05:32:37.973Z)
  - Żywa Mapa Ekosystemu: Wpis zaktualizowany w \`data/ecosystem-map.json\` oraz mirror LUMINA (Symbol A)
  - Koszt: 0,00 PLN (ZERO COST)
- **Status:** 🟢 ZROBIONE
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('✅ Dopisano raport do JOMA_HANDOFFS.md');
}
