import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-14 05:34';
const broadcastNum = 290;

const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Akademia Biblijna: Dzień 46 Manna z nieba i świętość szabatu (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Akademia Biblijna: Z Biblią za Pan Brat — Dzień 46 (Wj 16:1–36): Manna z nieba i świętość szabatu — Boże zaopatrzenie na pustyni (URL: https://polskieradio.cc/akademia/kurscodzienny/dzien-46) — kategoria \`module\` (Edukacja Biblijna / Kurs Codzienny), rotacja zrównoważona pozycjami: #289 Premier HeatFix UK (profile), #288 Historia hymnu Amazing Grace (news), #287 Podcasty CC (music), #286 Artykuł Dzień 31 (news), #285 Ambient Sleep (music), #284 Werset Dnia: Psalm 119:114 (verse), #283 Książka: Prawda Bez Filtra (book), #282 Dzień 36 (course), #281 cclite.pl (module), #280 Holistyczny Coaching (profile).
  2. **Dedykowana oprawa graficzna:** \`kc_day_46_manna_z_nieba_chleb_zycia.jpg\` — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna kinowa grafika przedstawiająca zbieranie manny na pustyni i Boże zaopatrzenie), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, kontrastu i prawidłowego uploadu Playwright na profilu X).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     🎓 AKADEMIA BIBLIJNA CC
     Dzień 46 (Wj 16:1–36): Manna z nieba, chleb powszedni, Boże zaopatrzenie na pustyni i nienaruszalna świętość szabatu.

     👉 Studiuj bezpłatnie:
     https://polskieradio.cc/akademia/kurscodzienny/dzien-46

     #KursCodzienny #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia w porannym oknie 05:34 czasu warszawskiego.
  5. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A) oraz lustro w repozytorium LUMINA.
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: AKADEMIA BIBLIJNA — DZIEŃ 46 (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Akademia Biblijna: Z Biblią za Pan Brat — Dzień 46 (Wj 16:1–36): Manna z nieba i świętość szabatu (#${broadcastNum})
- **URL:** https://polskieradio.cc/akademia/kurscodzienny/dzien-46
- **Kategoria:** module (Edukacja Biblijna / Kurs Codzienny)
- **Grafika:** kc_day_46_manna_z_nieba_chleb_zycia.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  🎓 AKADEMIA BIBLIJNA CC
  Dzień 46 (Wj 16:1–36): Manna z nieba, chleb powszedni, Boże zaopatrzenie na pustyni i nienaruszalna świętość szabatu.

  👉 Studiuj bezpłatnie:
  https://polskieradio.cc/akademia/kurscodzienny/dzien-46

  #KursCodzienny #ChristianCulture
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
- **Następny krok:** Kolejna emisja w cyklu co ok. 30 minut (następny slot ok. 06:05–06:15 czasu warszawskiego).
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('Appended entry to JOMA_HANDOFFS.md');
}

// Aktualizacja ecosystem-map.json
const mapUpdateEntry = {
  date: '2026-11-14',
  topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Akademia Biblijna: Dzień 46 (Manna z nieba i świętość szabatu) z dedykowaną grafiką tematyczną`,
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

console.log(`Synchronizacja #${broadcastNum} zakończona pomyślnie.`);
