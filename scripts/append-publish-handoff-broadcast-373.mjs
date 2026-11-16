import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapLocalPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/data/ecosystem-map.json';
const mapMirrorPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-16 21:36';
const broadcastNum = 373;
const dateIso = '2026-11-16';

// 1. Aktualizacja data/ecosystem-map.json
if (fs.existsSync(mapLocalPath)) {
  try {
    const mapData = JSON.parse(fs.readFileSync(mapLocalPath, 'utf8'));
    if (!Array.isArray(mapData.updatesLog)) {
      mapData.updatesLog = [];
    }
    const topic = `CCN News X: Cykliczna publikacja #${broadcastNum} — Akademia Biblijna Dzień 18 (Jakub i Ezaw) z dedykowaną grafiką i Tablicą LUMINA`;
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
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Akademia Biblijna Dzień 18 (Jakub i Ezaw) z dedykowaną grafiką i Tablicą LUMINA (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Akademia Biblijna / Kurs Codzienny „Z Biblią za Pan Brat” — Dzień 18 (Lekcja 18): Jakub i Ezaw — Czego naprawdę pragniesz? (Rdz 25:1–26:35) — URL: https://polskieradio.cc/akademia/kurscodzienny/dzien-18 — kategoria \`course\` (Biblia i formacja), zrównoważona rotacja filarów ekosystemu CC.
  2. **Dedykowana grafika tematyczna:** \`kc_day_18_jakub_ezaw.jpg\` (Full HD 16:9, 844 KB) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna kinowa ilustracja lekcji biblijnej Dnia 18), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania HD, upload w Playwright na profilu X @csbwersetdnia).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     🎓 AKADEMIA BIBLIJNA | KURS CODZIENNY
     Z Biblią za Pan Brat — Dzień 18 (Lekcja 18): Jakub i Ezaw — Czego naprawdę pragniesz? (Rdz 25:1–26:35)

     👉 Studiuj lekcję w serwisie:
     https://polskieradio.cc/akademia/kurscodzienny/dzien-18

     #KursCodzienny #ZBibliaZaPanBrat
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post zweryfikowany i opublikowany na profilu @csbwersetdnia.
  5. **Tablica LUMINA (/tablica):** Automatyczna publikacja w portalu LUMINA jako Christian Culture (ID: \`FPn6fLfbEWi9LsfloFh2\`).
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
- **Wątek Skrzynki:** MSG-20261116T203530Z-antigravity-1d83ec
- **Opublikowana pozycja z ekosystemu:**
  - Kategoria: Biblia i formacja / Akademia Biblijna (course)
  - Tytuł: Z Biblią za Pan Brat — Dzień 18 (Lekcja 18): Jakub i Ezaw — Czego naprawdę pragniesz? (Rdz 25:1–26:35)
  - Link: https://polskieradio.cc/akademia/kurscodzienny/dzien-18
  - Grafika dedykowana: \`kc_day_18_jakub_ezaw.jpg\` (16:9, 844 KB)
- **Treść wpisu na X (@csbwersetdnia):**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  🎓 AKADEMIA BIBLIJNA | KURS CODZIENNY
  Z Biblią za Pan Brat — Dzień 18 (Lekcja 18): Jakub i Ezaw — Czego naprawdę pragniesz? (Rdz 25:1–26:35)

  👉 Studiuj lekcję w serwisie:
  https://polskieradio.cc/akademia/kurscodzienny/dzien-18

  #KursCodzienny #ZBibliaZaPanBrat
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (Playwright headless Chromium, weryfikacja wysłania i publikacji na profilu @csbwersetdnia)
  - Tablica LUMINA (/tablica): Opublikowano jako Christian Culture (ID: \`FPn6fLfbEWi9LsfloFh2\`)
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
