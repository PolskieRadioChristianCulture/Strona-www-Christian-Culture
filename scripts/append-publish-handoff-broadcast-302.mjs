import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = 'data/ecosystem-map.json';
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-14 14:10';
const broadcastNum = 302;

const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — CCN Finanse: Jak przygotować domowy budżet na grudzień bez kredytu? (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** „Jak przygotować domowy budżet na grudzień bez kredytu?” — URL: https://polskieradio.cc/news/jak-przygotowac-domowy-budzet-na-grudzien-bez-kredytu — kategoria \`news\` (CCN Finanse / CCN News), rotacja zrównoważona pozycjami: #301 Werset Dnia: Ps 119:165 (verse), #300 Kod Źródłowy Duszy (book), #299 Lekcja 35 (course), #298 Duchowny Mariusz (profile), #297 cclite.pl (module), #296 Czy Jezus naprawdę był Bogiem (news).
  2. **Dedykowana oprawa graficzna:** \`images/news/art-jak-przygotowac-domowy-budzet-na-grudzien-bez-kredytu.jpg\` — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna grafika domowego budżetu, kalkulatora i biblijnej roztropności finansowej, zero postaci stockowych), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, kontrastu i prawidłowego uploadu w Playwright na profilu X @csbwersetdnia).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     💰 FINANSE PO BOŻEMU | CEZARY ROGOWSKI
     Jak przygotować domowy budżet na grudzień bez kredytu?

     👉 Czytaj w serwisie:
     https://polskieradio.cc/news/jak-przygotowac-domowy-budzet-na-grudzien-bez-kredytu

     #CCNNews #FinansePoBozemu #ChristianCulture #Prawda
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia o godz. 13:10:21 UTC (14:10:21 czasu warszawskiego).
  5. **Tablica LUMINA (/tablica):** Automatyczna równoległa publikacja na Tablicy Społeczności LUMINA jako Cezary Rogowski (docId: \`rd8LUkTPdLvowBNjG2h2\`).
  6. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\` (306 wpisów), \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` — wpis #${broadcastNum}, symbol A) oraz lustro w repozytorium LUMINA.
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('Prepended entry to JOMA_STATUS.md');
}

const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: JAK PRZYGOTOWAĆ DOMOWY BUDŻET NA GRUDZIEŃ BEZ KREDYTU? (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Jak przygotować domowy budżet na grudzień bez kredytu? (#${broadcastNum})
- **URL:** https://polskieradio.cc/news/jak-przygotowac-domowy-budzet-na-grudzien-bez-kredytu
- **Kategoria:** news (CCN Finanse / CCN News)
- **Grafika:** images/news/art-jak-przygotowac-domowy-budzet-na-grudzien-bez-kredytu.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  💰 FINANSE PO BOŻEMU | CEZARY ROGOWSKI
  Jak przygotować domowy budżet na grudzień bez kredytu?

  👉 Czytaj w serwisie:
  https://polskieradio.cc/news/jak-przygotowac-domowy-budzet-na-grudzien-bez-kredytu

  #CCNNews #FinansePoBozemu #ChristianCulture #Prawda
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (Zweryfikowano zniknięcie composer modal i publikację na profilu @csbwersetdnia o 14:10 czasu warszawskiego)
  - Tablica LUMINA (/tablica): Opublikowano jako Cezary Rogowski (docId: rd8LUkTPdLvowBNjG2h2)
  - Ślad publikacji: \`data/x_published_history.json\` (306 pozycji)
  - Stan nadajnika: \`data/ccn_broadcaster_state.json\` (totalBroadcasts: 302)
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
- **Następny krok:** Kolejna emisja w cyklu co ok. 30 minut (następny slot ok. 14:35–14:45 czasu warszawskiego).
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('Appended entry to JOMA_HANDOFFS.md');
}

// Aktualizacja ecosystem-map.json
const mapUpdateEntry = {
  date: '2026-11-14',
  topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — CCN Finanse: Jak przygotować domowy budżet na grudzień bez kredytu? z dedykowaną grafiką`,
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
