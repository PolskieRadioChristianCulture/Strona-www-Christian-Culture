import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const now = new Date();
const timestampWarsaw = '2026-11-10 06:38';

const broadcasterStatePath = 'data/ccn_broadcaster_state.json';
let broadcastNum = 226;
try {
  if (fs.existsSync(broadcasterStatePath)) {
    const s = JSON.parse(fs.readFileSync(broadcasterStatePath, 'utf8'));
    if (s.totalBroadcasts) broadcastNum = s.totalBroadcasts;
  }
} catch (e) {}

const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Akademia Biblijna Dzień 41 (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** „Akademia Biblijna: Z Biblią za Pan Brat — Dzień 41 (Wj 10:1–29): Plagi szarańczy i ciemności egipskiej — Sąd nad fałszywym światłem i wolność bez kompromisów” (URL: https://polskieradio.cc/akademia/kurscodzienny/dzien-41) — kategoria \`module\` (Akademia Biblijna & Kurs Codzienny), rotacja zrównoważona pozycjami: #225 Rozwiąż problem (course), #224 Cokolwiek na świecie (music), #223 Werset Dnia Rdz 15:5 (verse), #222 Pokonać Goliata (book), #221 Kod Źródłowy Duszy (news), #220 Wizytówka Wioletta Rogowska (profile).
  2. **Dedykowana oprawa graficzna:** \`images/academy/daily/kc_day_41_szarancza_ciemnosc.jpg\` — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — fotorealistyczna scena biblijna: plaga szarańczy i mrok nad Egiptem, pełna zgodność z Wj 10:1–29 UBG), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, bezbłędny upload Playwright na X).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     🎓 AKADEMIA BIBLIJNA CC
     Dzień 41 (Wj 10:1–29): Plagi szarańczy i ciemności egipskiej — Boża suwerenność, sąd nad fałszywym światłem i wolność bez kompromisów.

     👉 Studiuj bezpłatnie:
     https://polskieradio.cc/akademia/kurscodzienny/dzien-41

     #KursCodzienny #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia o godz. 05:38Z (06:38 czasu warszawskiego).
  5. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A).
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: AKADEMIA BIBLIJNA DZIEŃ 41 (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Akademia Biblijna: Z Biblią za Pan Brat — Dzień 41 (Wj 10:1–29): Plagi szarańczy i ciemności egipskiej — Sąd nad fałszywym światłem i wolność bez kompromisów (#${broadcastNum})
- **URL:** https://polskieradio.cc/akademia/kurscodzienny/dzien-41
- **Kategoria:** module (Akademia Biblijna CC)
- **Grafika:** images/academy/daily/kc_day_41_szarancza_ciemnosc.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  🎓 AKADEMIA BIBLIJNA CC
  Dzień 41 (Wj 10:1–29): Plagi szarańczy i ciemności egipskiej — Boża suwerenność, sąd nad fałszywym światłem i wolność bez kompromisów.

  👉 Studiuj bezpłatnie:
  https://polskieradio.cc/akademia/kurscodzienny/dzien-41

  #KursCodzienny #ChristianCulture
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (05:38 UTC / 06:38 Warszawa)
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
- **Następny krok:** Kolejna emisja w cyklu co ok. 30 minut (następny slot ok. 07:05-07:15).
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
    mapData.updates.unshift({
      date: '2026-11-10',
      topic: `Cykliczna publikacja CCN News na platformie X #${broadcastNum}: Akademia Biblijna — Dzień 41 (Wj 10:1-29)`,
      agent: 'A'
    });
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
