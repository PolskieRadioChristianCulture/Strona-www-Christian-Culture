import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapLocalPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/data/ecosystem-map.json';
const mapMirrorPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-16 18:04';
const broadcastNum = 366;
const dateIso = '2026-11-16';

// 1. Aktualizacja data/ecosystem-map.json
if (fs.existsSync(mapLocalPath)) {
  try {
    const mapData = JSON.parse(fs.readFileSync(mapLocalPath, 'utf8'));
    if (!Array.isArray(mapData.updatesLog)) {
      mapData.updatesLog = [];
    }
    const topic = `CCN News X: Cykliczna publikacja #${broadcastNum} — Akademia Biblijna: Z Biblią za Pan Brat Dzień 19 z dedykowaną grafiką i Tablicą LUMINA`;
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
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Akademia Biblijna: Z Biblią za Pan Brat Dzień 19 z dedykowaną grafiką i Tablicą LUMINA (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Z Biblią za Pan Brat — Dzień 19 (Lekcja 19): Gdy próbujemy pomóc Bogu oszustwem (Rdz 27:1–46) — URL: https://polskieradio.cc/akademia/kurscodzienny/dzien-19 — kategoria \`course\` (Akademia Biblijna / Kurs Codzienny), rotacja zrównoważona: #365 Duchowny Mariusz (profile), #364 topTEN Notowania CC (music), #363 Werset Dnia Prz 16:9 UBG (verse), #362 Półka z Książkami Cezarego Rogowskiego (book), #361 Akademia Biblijna Dzień 43 (module).
  2. **Dedykowana grafika tematyczna:** \`kc_day_19_jakub_izaak_podstep.jpg\` — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna, dedykowana ilustracja 16:9 Rdz 27 Jakub i Izaak), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania HD, upload w Playwright na profilu X @csbwersetdnia).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     🎓 AKADEMIA BIBLIJNA | KURS CODZIENNY
     Z Biblią za Pan Brat — Dzień 19 (Lekcja 19): Gdy próbujemy pomóc Bogu oszustwem (Rdz 27:1–46)

     👉 Studiuj lekcję w serwisie:
     https://polskieradio.cc/akademia/kurscodzienny/dzien-19

     #KursCodzienny #ZBibliaZaPanBrat #AkademiaBiblijna
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post zweryfikowany i opublikowany na profilu @csbwersetdnia.
  5. **Tablica LUMINA (/tablica):** Automatyczna publikacja jako Wioletta Rogowska (\`PwJYkGIkRSk98K7O5rpw\`) w portalu LUMINA.
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
- **Wątek Skrzynki:** MSG-${dateIso.replace(/-/g, '')}T180400Z-antigravity-broadcast-${broadcastNum}
- **Opublikowana pozycja z ekosystemu:**
  - Kategoria: Akademia Biblijna / Kurs Codzienny (course)
  - Tytuł: Z Biblią za Pan Brat — Dzień 19 (Lekcja 19): Gdy próbujemy pomóc Bogu oszustwem (Rdz 27:1–46)
  - Link: https://polskieradio.cc/akademia/kurscodzienny/dzien-19
  - Grafika dedykowana: \`kc_day_19_jakub_izaak_podstep.jpg\`
- **Treść wpisu na X (@csbwersetdnia):**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  🎓 AKADEMIA BIBLIJNA | KURS CODZIENNY
  Z Biblią za Pan Brat — Dzień 19 (Lekcja 19): Gdy próbujemy pomóc Bogu oszustwem (Rdz 27:1–46)

  👉 Studiuj lekcję w serwisie:
  https://polskieradio.cc/akademia/kurscodzienny/dzien-19

  #KursCodzienny #ZBibliaZaPanBrat #AkademiaBiblijna
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (Playwright headless chrome, weryfikacja wysłania i publikacji na profilu @csbwersetdnia)
  - Tablica LUMINA (/tablica): Opublikowano w portalu LUMINA jako Wioletta Rogowska (\`PwJYkGIkRSk98K7O5rpw\`)
  - Ślad publikacji: \`data/x_published_history.json\` (#${broadcastNum})
  - Stan nadajnika: \`data/ccn_broadcaster_state.json\` (totalBroadcasts: ${broadcastNum})
  - Żywa Mapa Ekosystemu: Wpis zaktualizowany w \`data/ecosystem-map.json\` (Symbol A)
  - Koszt: 0,00 PLN (Playwright, 100% Free Tier)
  - Następny slot: za ok. 30 minut (~18:35–18:45 czasu warszawskiego)
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('Appended handoff to JOMA_HANDOFFS.md');
}
