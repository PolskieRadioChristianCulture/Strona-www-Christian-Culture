import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapLocalPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/data/ecosystem-map.json';
const mapMirrorPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-16 22:05';
const broadcastNum = 374;
const dateIso = '2026-11-16';

// 1. Aktualizacja data/ecosystem-map.json
if (fs.existsSync(mapLocalPath)) {
  try {
    const mapData = JSON.parse(fs.readFileSync(mapLocalPath, 'utf8'));
    if (!Array.isArray(mapData.updatesLog)) {
      mapData.updatesLog = [];
    }
    const topic = `CCN News X: Cykliczna publikacja #${broadcastNum} — Kino VOD SDS (Proroctwa Księgi Apokalipsy) z dedykowaną grafiką tematyczną`;
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
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Kino VOD SDS (Proroctwa Księgi Apokalipsy) z dedykowaną grafiką (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Kino VOD & YouTube: Studio Dobrego Słowa — Proroctwa Księgi Apokalipsy — URL: https://polskieradio.cc/vod — kategoria \`vod\` (Kino VOD & Wykłady biblijne), zrównoważona rotacja filarów ekosystemu CC.
  2. **Dedykowana grafika tematyczna:** \`art-cbdc-prawo-niedzielne-apokalipsa-13.jpg\` (Full HD 16:9) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna kinowa ilustracja wykładów Apokalipsy SDS), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania HD, upload w Playwright na profilu X @csbwersetdnia).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     🎬 KINO CHRZEŚCIJAŃSKIE VOD | SDS
     Studio Dobrego Słowa (SDS): Wykłady biblijne, seria Apokalipsa i prawda Pisma Świętego.

     👉 Oglądaj bezpłatnie w jakości 4K:
     https://polskieradio.cc/vod

     #StudioDobregoSlowa #KinoVOD #Apokalipsa #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post zweryfikowany i opublikowany na profilu @csbwersetdnia.
  5. **Tablica LUMINA (/tablica):** Sprawdzono lokalne okno deduplikacji 12h (duplicate_local_window — pominięto duplikat, zabezpieczenie antyspamowe).
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
- **Wątek Skrzynki:** MSG-20261116T210407Z-antigravity-663a81
- **Opublikowana pozycja z ekosystemu:**
  - Kategoria: Kino VOD & Wykłady biblijne (vod)
  - Tytuł: Kino VOD & YouTube: Studio Dobrego Słowa — Proroctwa Księgi Apokalipsy
  - Link: https://polskieradio.cc/vod
  - Grafika dedykowana: \`art-cbdc-prawo-niedzielne-apokalipsa-13.jpg\` (16:9)
- **Treść wpisu na X (@csbwersetdnia):**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  🎬 KINO CHRZEŚCIJAŃSKIE VOD | SDS
  Studio Dobrego Słowa (SDS): Wykłady biblijne, seria Apokalipsa i prawda Pisma Świętego.

  👉 Oglądaj bezpłatnie w jakości 4K:
  https://polskieradio.cc/vod

  #StudioDobregoSlowa #KinoVOD #Apokalipsa #ChristianCulture
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (Playwright headless Chromium, weryfikacja wysłania i publikacji na profilu @csbwersetdnia)
  - Ślad publikacji: \`data/x_published_history.json\` (#${broadcastNum})
  - Stan nadajnika: \`data/ccn_broadcaster_state.json\` (totalBroadcasts: ${broadcastNum})
  - Żywa Mapa Ekosystemu: Wpis zaktualizowany w \`data/ecosystem-map.json\` oraz mirror LUMINA (Symbol A)
  - Koszt: 0,00 PLN (ZERO COST)
- **Status:** 🟢 ZROBIONE
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('Appended handoff entry to JOMA_HANDOFFS.md');
}
