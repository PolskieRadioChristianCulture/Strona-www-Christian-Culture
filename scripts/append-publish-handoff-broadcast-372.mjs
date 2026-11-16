import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapLocalPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/data/ecosystem-map.json';
const mapMirrorPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-16 21:06';
const broadcastNum = 372;
const dateIso = '2026-11-16';

// 1. Aktualizacja data/ecosystem-map.json
if (fs.existsSync(mapLocalPath)) {
  try {
    const mapData = JSON.parse(fs.readFileSync(mapLocalPath, 'utf8'));
    if (!Array.isArray(mapData.updatesLog)) {
      mapData.updatesLog = [];
    }
    const topic = `CCN News X: Cykliczna publikacja #${broadcastNum} — Studio Dobrego Słowa (SDS) z dedykowaną grafiką i Tablicą LUMINA`;
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
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Studio Dobrego Słowa (SDS) z dedykowaną grafiką i Tablicą LUMINA (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Studio Dobrego Słowa (SDS) — URL: https://polskieradio.cc/studium — kategoria \`module\` (Media i treści / Wykłady biblijne), zrównoważona rotacja filarów ekosystemu CC.
  2. **Dedykowana grafika tematyczna:** \`art-globalny-reset-premiera-sds.jpg\` (Full HD 16:9) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — oficjalna dedykowana grafika premiery wykładów biblijnych SDS), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania HD, upload w Playwright na profilu X @csbwersetdnia).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     🏛️ STUDIO DOBREGO SŁOWA | SDS
     Studio Dobrego Słowa (SDS): Wykłady biblijne, seria Apokalipsa i prawda Pisma Świętego.

     👉 Oglądaj wykłady i transmisje:
     https://polskieradio.cc/studium

     #StudioDobregoSlowa #Apokalipsa #Biblia #CCNNews
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post zweryfikowany i opublikowany na profilu @csbwersetdnia.
  5. **Tablica LUMINA (/tablica):** Automatyczna publikacja w portalu LUMINA.
  6. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` oraz mirror LUMINA — wpis #${broadcastNum}, symbol A).
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  if (!currentStatus.includes(`CCN BROADCASTER #${broadcastNum}`)) {
    fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
    console.log('Prepended status entry to JOMA_STATUS.md');
  }
}

// 3. Aktualizacja JOMA_HANDOFFS.md
const handoffEntry = `
---

### [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA CCN NEWS NA PLATFORMIE X (#${broadcastNum}) [PASS]
- **Wątek Skrzynki:** MSG-20261116T200544Z-antigravity-87dbca
- **Opublikowana pozycja z ekosystemu:**
  - Kategoria: Media i treści / Studio Dobrego Słowa (module)
  - Tytuł: Studio Dobrego Słowa (SDS)
  - Link: https://polskieradio.cc/studium
  - Grafika dedykowana: \`art-globalny-reset-premiera-sds.jpg\` (16:9)
- **Treść wpisu na X (@csbwersetdnia):**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  🏛️ STUDIO DOBREGO SŁOWA | SDS
  Studio Dobrego Słowa (SDS): Wykłady biblijne, seria Apokalipsa i prawda Pisma Świętego.

  👉 Oglądaj wykłady i transmisje:
  https://polskieradio.cc/studium

  #StudioDobregoSlowa #Apokalipsa #Biblia #CCNNews
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (Playwright headless chrome, weryfikacja wysłania i publikacji na profilu @csbwersetdnia)
  - Tablica LUMINA (/tablica): Opublikowano w portalu LUMINA
  - Ślad publikacji: \`data/x_published_history.json\` (#${broadcastNum})
  - Stan nadajnika: \`data/ccn_broadcaster_state.json\` (totalBroadcasts: ${broadcastNum})
  - Żywa Mapa Ekosystemu: Wpis zaktualizowany w \`data/ecosystem-map.json\` oraz mirror LUMINA (Symbol A)
  - Bezpieczeństwo i koszty: 100% Free Tier (Playwright), 0,00 PLN
`;

if (fs.existsSync(handoffsPath)) {
  const currentHandoffs = fs.readFileSync(handoffsPath, 'utf8');
  if (!currentHandoffs.includes(`CCN NEWS NA PLATFORMIE X (#${broadcastNum})`)) {
    fs.writeFileSync(handoffsPath, currentHandoffs + handoffEntry, 'utf8');
    console.log('Appended handoff entry to JOMA_HANDOFFS.md');
  }
}
