import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapLocalPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/data/ecosystem-map.json';
const mapMirrorPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const now = new Date();
const timestampWarsaw = '2026-11-16 11:39';
const broadcastNum = 356;
const dateIso = '2026-11-16';

// 1. Aktualizacja data/ecosystem-map.json
if (fs.existsSync(mapLocalPath)) {
  try {
    const mapData = JSON.parse(fs.readFileSync(mapLocalPath, 'utf8'));
    if (!Array.isArray(mapData.updatesLog)) {
      mapData.updatesLog = [];
    }
    const topic = `CCN News X: Cykliczna publikacja #${broadcastNum} — Wizytówka Społeczności: Premier HeatFix UK z dedykowaną grafiką i Tablicą LUMINA`;
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
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Społeczność LUMINA: Premier HeatFix UK z dedykowaną grafiką i publikacją na Tablicy LUMINA (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Premier HeatFix UK — Certyfikowane Usługi Gazowe i Hydrauliczne w Londynie — URL: https://polskieradio.cc/premier-heatfix — kategoria \`profile\` (Społeczność CC / Portal LUMINA), rotacja zrównoważona: #355 Werset Dnia Prz 14:12 (verse), #354 Raport eM Jaka jest Twoja pobożność (news), #353 Kurs Codzienny Dzień 21 (course).
  2. **Dedykowana grafika tematyczna:** \`ogloszenia-premier-heatfix.jpg\` — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — estetyczna, dedykowana grafika 16:9), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania HD, upload w Playwright na profilu X @csbwersetdnia).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     👤 SPOŁECZNOŚĆ CC | Portal LUMINA
     Premier HeatFix UK — Certyfikowane Usługi Gazowe i Hydrauliczne w Londynie

     👉 Dołącz do społeczności LUMINA:
     https://polskieradio.cc/premier-heatfix

     #Lumina #LudzieMisji #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia.
  5. **Tablica LUMINA (/tablica):** Automatyczna publikacja jako Cezary Rogowski w portalu LUMINA.
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
- **Wątek Skrzynki:** MSG-20261116T103824Z-antigravity-ab5b35
- **Opublikowana pozycja z ekosystemu:**
  - Kategoria: Społeczność & Relacje (profile)
  - Tytuł: Premier HeatFix UK — Certyfikowane Usługi Gazowe i Hydrauliczne w Londynie
  - Link: https://polskieradio.cc/premier-heatfix
  - Grafika dedykowana: \`ogloszenia-premier-heatfix.jpg\`
- **Treść wpisu na X (@csbwersetdnia):**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  👤 SPOŁECZNOŚĆ CC | Portal LUMINA
  Premier HeatFix UK — Certyfikowane Usługi Gazowe i Hydrauliczne w Londynie

  👉 Dołącz do społeczności LUMINA:
  https://polskieradio.cc/premier-heatfix

  #Lumina #LudzieMisji #ChristianCulture
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (Playwright headless chrome, weryfikacja wysłania i publikacji na profilu @csbwersetdnia)
  - Tablica LUMINA (/tablica): Opublikowano w portalu LUMINA
  - Ślad publikacji: \`data/x_published_history.json\`
  - Stan nadajnika: \`data/ccn_broadcaster_state.json\` (totalBroadcasts: ${broadcastNum})
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` oraz mirror Desktop/@ICC/LUMINA (wpis #${broadcastNum}, symbol A)
- **Następny krok:** Kolejna emisja w cyklu co ok. 30 minut (następny slot ok. 12:10–12:20 czasu warszawskiego).
`;

if (fs.existsSync(handoffsPath)) {
  const currentHandoffs = fs.readFileSync(handoffsPath, 'utf8');
  if (!currentHandoffs.includes(`CCN BROADCASTER #${broadcastNum}`)) {
    fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
    console.log('Appended handoff entry to JOMA_HANDOFFS.md');
  }
}
