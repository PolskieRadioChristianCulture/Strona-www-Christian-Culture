import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-13 09:07';
const broadcastNum = 267;

const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Książka & Wydawnictwo CC: Oficjalna Biblioteka Autorska Cezarego Rogowskiego (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** „Półka z Książkami: Cezary Rogowski — Oficjalna Biblioteka Autorska” (URL: https://polskieradio.cc/ksiazki-autora) — kategoria \`book\` (Książki & Wydawnictwo Christian Culture), rotacja zrównoważona pozycjami: #266 Nowość Muzyczna Cezary Rogowski (music), #265 Wizytówka Cezary Rogowski (profile), #264 Werset Dnia Wj 20:8 (verse), #263 Żywa Mapa Ekosystemu (module), #262 Kino VOD & SDS (vod).
  2. **Dedykowana oprawa graficzna:** \`assets/ksiazki-autora-og.jpg\` (1200x630 HD) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autorska dedykowana grafika 1200x630 półki z książkami i publikacjami formacyjnymi Cezarego Rogowskiego), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania OpenGraph 1200x630, prawidłowy upload Playwright na platformie X).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     📚 KSIĄŻKA & WYDAWNICTWO CC
     Oficjalna biblioteka Cezarego Rogowskiego: czytaj online, słuchaj audiobooków i pobieraj książki bezpłatnie.

     👉 Czytaj w ekosystemie:
     https://polskieradio.cc/ksiazki-autora

     #KsiazkiAutora #CezaryRogowski #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia o godz. 08:06:45 UTC (09:06:45 czasu warszawskiego).
  5. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A).
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: KSIĄŻKA & WYDAWNICTWO CC — OFICJALNA BIBLIOTEKA AUTORSKA CEZAREGO ROGOWSKIEGO (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Półka z Książkami: Cezary Rogowski — Oficjalna Biblioteka Autorska (#${broadcastNum})
- **URL:** https://polskieradio.cc/ksiazki-autora
- **Kategoria:** book (Książki & Wydawnictwo Christian Culture)
- **Grafika:** assets/ksiazki-autora-og.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  📚 KSIĄŻKA & WYDAWNICTWO CC
  Oficjalna biblioteka Cezarego Rogowskiego: czytaj online, słuchaj audiobooków i pobieraj książki bezpłatnie.

  👉 Czytaj w ekosystemie:
  https://polskieradio.cc/ksiazki-autora

  #KsiazkiAutora #CezaryRogowski #ChristianCulture
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (08:06:45 UTC / 09:06:45 Warszawa)
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
- **Następny krok:** Kolejna emisja w cyklu co ok. 30 minut (następny slot ok. 09:35–09:45 czasu warszawskiego).
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('Appended entry to JOMA_HANDOFFS.md');
}

// Aktualizacja ecosystem-map.json
const mapUpdateEntry = {
  date: '2026-11-13',
  topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Książka & Wydawnictwo CC: Oficjalna Biblioteka Autorska (Cezary Rogowski) z dedykowaną grafiką tematyczną 16:9`,
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

console.log('Synchronizacja zakończona.');
