import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapLocalPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/data/ecosystem-map.json';
const mapMirrorPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-11 05:35';
const broadcastNum = 257;

const mapEntry = {
  date: '2026-11-11',
  topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Kurs: Rozwiąż problem: Rzuć palenie w 14 dni z dedykowaną grafiką`,
  agent: 'A'
};

// 1. Aktualizacja ecosystem-map.json (lokalna i mirror)
for (const p of [mapLocalPath, mapMirrorPath]) {
  if (fs.existsSync(p)) {
    try {
      const mapData = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (Array.isArray(mapData.updatesLog)) {
        mapData.updatesLog.unshift(mapEntry);
        fs.writeFileSync(p, JSON.stringify(mapData, null, 2), 'utf8');
        console.log(`[MAP] Zaktualizowano ${p}`);
      }
    } catch (e) {
      console.warn(`[MAP WARN] Błąd aktualizacji ${p}:`, e.message);
    }
  }
}

// 2. Aktualizacja JOMA_STATUS.md
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Kurs: Rzuć palenie w 14 dni (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Kurs formacyjny i wolnościowy: „Rozwiąż problem: Rzuć palenie w 14 dni — Praktyczny kurs chrześcijański” — URL: https://polskieradio.cc/rozwiaz-problem — kategoria \`course\` (Kurs & Wolność / Rozwiąż problem). Zrównoważona rotacja filarów ekosystemu: #256 Portal LUMINA (profile), #255 Książka: Kod Źródłowy Duszy (book), #254 Świętość nie wymaga udawania (news), #253 Dzień 42 Pascha i Krew Baranka (module), #252 topTEN (music), #251 Werset Dnia Rdz 15:5 (verse).
  2. **Dedykowana oprawa graficzna:** \`rozwiaz-problem/assets/og-rozwiaz-problem.jpg\` (16:9 HD) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna ilustracja tematyczna kursu „Rozwiąż problem”), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, bezbłędny upload Playwright na X).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     🕊️ ROZWIĄŻ PROBLEM | NOWY KURS
     Rzuć palenie w 14 dni — bezpłatny kurs, plan na głód nikotynowy, audio i biblijna nadzieja.

     👉 Rozpocznij kurs:
     https://polskieradio.cc/rozwiaz-problem

     #RozwiazProblem #RzucPalenie #Wolnosc
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia o godz. 04:34 UTC (05:34 czasu warszawskiego).
  5. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` oraz mirror LUMINA — wpis #${broadcastNum}, symbol A).
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('[JOMA] Zaktualizowano JOMA_STATUS.md');
}

console.log('✅ Skrypt pomocniczy zakończony sukcesem.');
