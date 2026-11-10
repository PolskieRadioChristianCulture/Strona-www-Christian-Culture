import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-10 10:06';
const broadcastNum = 231;

const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Książka: Prawda Bez Filtra (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** „Książka: Prawda Bez Filtra — Cezary Rogowski. Bezkompromisowe chrześcijaństwo” (URL: https://polskieradio.cc/prawda-bez-filtra) — kategoria \`book\` (Książki & Wydawnictwo CC), rotacja zrównoważona pozycjami: #230 Studio Dobrego Słowa (vod), #229 LUMINA (profile), #228 Werset Dnia Rdz 18:25 (verse), #227 Czy Bóg jest miłością? (news), #226 Akademia Biblijna Dzień 41 (module).
  2. **Dedykowana oprawa graficzna:** \`images/news/art-prawda-bez-filtra.jpg\` — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — oficjalna okładka autorska książki Cezarego Rogowskiego, estetyka wydawnicza Christian Culture), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, bezbłędny upload Playwright na platformie X).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     📚 KSIĄŻKA & WYDAWNICTWO CC
     Prawda Bez Filtra — Cezary Rogowski. Bezkompromisowe chrześcijaństwo

     👉 Czytaj w ekosystemie:
     https://polskieradio.cc/prawda-bez-filtra

     #PrawdaBezFiltra #CezaryRogowski #ChristianCulture
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia o godz. 09:06:19Z (10:06:19 czasu warszawskiego). Usprawniono selektor composer dialogu zapobiegający blokowaniu przez maskę warstwy modalu.
  5. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A).
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: KSIĄŻKA PRAWDA BEZ FILTRA (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Książka: Prawda Bez Filtra — Cezary Rogowski. Bezkompromisowe chrześcijaństwo (#${broadcastNum})
- **URL:** https://polskieradio.cc/prawda-bez-filtra
- **Kategoria:** book (Książki & Wydawnictwo CC)
- **Grafika:** images/news/art-prawda-bez-filtra.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  📚 KSIĄŻKA & WYDAWNICTWO CC
  Prawda Bez Filtra — Cezary Rogowski. Bezkompromisowe chrześcijaństwo

  👉 Czytaj w ekosystemie:
  https://polskieradio.cc/prawda-bez-filtra

  #PrawdaBezFiltra #CezaryRogowski #ChristianCulture
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (09:06:19 UTC / 10:06:19 Warszawa)
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
- **Następny krok:** Kolejna emisja w cyklu co ok. 30 minut (następny slot ok. 10:35-10:45).
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
        date: '2026-11-10',
        topic: `Cykliczna publikacja CCN News na platformie X #${broadcastNum}: Książka — Prawda Bez Filtra (Cezary Rogowski)`,
        agent: 'A'
      });
    }
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
