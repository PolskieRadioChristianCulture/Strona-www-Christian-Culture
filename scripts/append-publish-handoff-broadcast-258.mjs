import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapLocalPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/data/ecosystem-map.json';
const mapMirrorPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-11 06:04';
const broadcastNum = 258;

const mapEntry = {
  date: '2026-11-11',
  topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Werset Dnia: Rdz 18:25 (MojaBiblia CC) z dedykowaną grafiką 16:9`,
  agent: 'A'
};

// 1. Aktualizacja ecosystem-map.json
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
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Werset Dnia Rdz 18:25 (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Werset Dnia & MojaBiblia: „Czy Sędzia całej ziemi nie postąpi sprawiedliwie?” (Rdz 18:25, UBG) — URL: https://polskieradio.cc/mojabiblia?ref=GEN.18.25 — kategoria \`verse\` (Pismo Święte / Werset Dnia), rotacja filarów ekosystemu: #257 Kurs: Rzuć palenie w 14 dni (course), #256 Portal LUMINA (profile), #255 Książka: Kod Źródłowy Duszy (book), #254 Świętość nie wymaga udawania (news), #253 Dzień 42 Pascha i Krew Baranka (module), #252 topTEN (music), #251 Werset Dnia Rdz 15:5 (verse).
  2. **Dedykowana oprawa graficzna:** \`images/news/art-rdz18-mamre-wstawiennictwo.jpg\` (16:9 HD, 1.1 MB) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — autentyczna ilustracja tematyczna wstawiennictwa Abrama pod Mamre i sprawiedliwości Bożej), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, bezbłędny upload Playwright na X).
  3. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     📖 WERSET DNIA (UBG)
     „Niech to będzie dalekie od ciebie, by zabić sprawiedliwego z niegodziwym (...) Czy Sędzia całej ziemi nie postąpi sprawiedliwie?” (Rdz 18:25, UBG)

     👉 MojaBiblia:
     https://polskieradio.cc/mojabiblia?ref=GEN.18.25

     #WersetDnia #SlowoBoze
  4. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia o godz. 05:04 UTC (06:04 czasu warszawskiego).
  5. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` oraz mirror LUMINA — wpis #${broadcastNum}, symbol A).
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('[JOMA] Zaktualizowano JOMA_STATUS.md');
}

// 3. Aktualizacja JOMA_HANDOFFS.md
const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: WERSET DNIA RDZ 18:25 (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Werset Dnia: „Czy Sędzia całej ziemi nie postąpi sprawiedliwie?” (Rdz 18:25, UBG) (#${broadcastNum})
- **URL:** https://polskieradio.cc/mojabiblia?ref=GEN.18.25
- **Kategoria:** verse (Pismo Święte / Werset Dnia)
- **Grafika:** images/news/art-rdz18-mamre-wstawiennictwo.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format posta:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  📖 WERSET DNIA (UBG)
  „Niech to będzie dalekie od ciebie, by zabić sprawiedliwego z niegodziwym (...) Czy Sędzia całej ziemi nie postąpi sprawiedliwie?” (Rdz 18:25, UBG)

  👉 MojaBiblia:
  https://polskieradio.cc/mojabiblia?ref=GEN.18.25

  #WersetDnia #SlowoBoze
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (05:04 UTC / 06:04 Warszawa)
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
- **Następny krok:** Kolejna emisja w cyklu co ok. 30 minut (następny slot ok. 06:30–06:40 czasu warszawskiego).
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('[JOMA] Zaktualizowano JOMA_HANDOFFS.md');
}

console.log('✅ Skrypt pomocniczy zakończony sukcesem.');
