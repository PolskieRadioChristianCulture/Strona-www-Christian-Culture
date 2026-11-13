import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-13 08:07';
const broadcastNum = 265;

const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Wizytówka Społeczności LUMINA: Cezary Rogowski (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** „Wizytówka: Cezary Rogowski — Założyciel Christian Culture & Polskie Radio CC” (URL: https://polskieradio.cc/lumina.cezaryrgowski) — kategoria \`profile\` (Społeczność CC & Portal LUMINA), rotacja zrównoważona pozycjami: #264 Werset Dnia Wj 20:8 (verse), #263 Żywa Mapa Ekosystemu (module), #262 Kino VOD & SDS (vod), #261 Pokonać Goliata (book), #260 11 Listopada Patriotyzm (news), #259 Ark of Fire (music).
  2. **Dedykowana oprawa graficzna:** \`images/mcc/em-cezary-rogowski-16-9.jpg\` — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — oficjalna dedykowana grafika 16:9 HD przedstawiająca założyciela ekosystemu), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, bezbłędny upload Playwright na platformie X).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     👤 SPOŁECZNOŚĆ CC | Portal LUMINA
     Cezary Rogowski — Założyciel Christian Culture & Polskie Radio CC

     👉 Dołącz do społeczności LUMINA:
     https://polskieradio.cc/lumina.cezaryrgowski

     #CezaryRogowski #LudzieMisji #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia o godz. 07:07 UTC (08:07 czasu warszawskiego).
  5. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A).
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: WIZYTÓWKA SPOŁECZNOŚCI LUMINA — CEZARY ROGOWSKI (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Wizytówka: Cezary Rogowski — Założyciel Christian Culture & Polskie Radio CC (#${broadcastNum})
- **URL:** https://polskieradio.cc/lumina.cezaryrgowski
- **Kategoria:** profile (Społeczność CC & Portal LUMINA)
- **Grafika:** images/mcc/em-cezary-rogowski-16-9.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  👤 SPOŁECZNOŚĆ CC | Portal LUMINA
  Cezary Rogowski — Założyciel Christian Culture & Polskie Radio CC

  👉 Dołącz do społeczności LUMINA:
  https://polskieradio.cc/lumina.cezaryrgowski

  #CezaryRogowski #LudzieMisji #ChristianCulture
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (07:07 UTC / 08:07 Warszawa)
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
- **Następny krok:** Kolejna emisja w cyklu co ok. 30 minut (następny slot ok. 08:35–08:45 czasu warszawskiego).
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
        date: '2026-11-13',
        topic: `Cykliczna publikacja CCN News na platformie X #${broadcastNum}: Wizytówka Społeczności LUMINA — Cezary Rogowski`,
        agent: 'A'
      });
    }
    if (!Array.isArray(mapData.updatesLog)) mapData.updatesLog = [];
    if (!mapData.updatesLog.some(u => u.topic && u.topic.includes(`#${broadcastNum}`))) {
      mapData.updatesLog.unshift({
        date: '2026-11-13',
        topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Wizytówka Społeczności LUMINA (Cezary Rogowski) z dedykowaną grafiką 16:9`,
        agent: 'A'
      });
    }
    mapData.lastUpdated = '2026-11-13';
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
