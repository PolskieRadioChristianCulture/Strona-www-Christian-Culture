import fs from 'node:fs';
import path from 'node:path';

const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapLocalPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/data/ecosystem-map.json';
const mapMirrorPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-10 20:05';
const broadcastNum = 245;

const mapEntry = {
  date: '2026-11-10',
  topic: `CCN News X: Cykliczna publikacja #${broadcastNum} — Werset Dnia Rdz 50:20 UBG („Bóg obrócił to w dobro”) z dedykowaną grafiką tematyczną 16:9`,
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
const newStatus = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Cykliczna emisja nowości ekosystemu na platformie X — Werset Dnia Rdz 50:20 UBG (CCN BROADCASTER #${broadcastNum}) | X PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Cykliczna publikacja kolejnej nowości z ekosystemu Christian Culture na platformie X pod oficjalnym szyldem: 🔴 CCN NEWS | polskieradio.cc/news.
- **ZREALIZOWANY ZAKRES:**
  1. **Wybrana nowość z ekosystemu:** Werset Dnia: „Wy myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro” (Rdz 50:20, UBG) — URL: https://polskieradio.cc/akademia/kurscodzienny/dzien-31 — kategoria \`verse\` (Słowo Boże & Werset Pamięciowy), rotacja zrównoważona pozycjami: #244 Akademia Biblijna (module), #243 Pokonać Goliata (book), #242 U boku Diabła (news), #241 Rozwiąż problem: Rzuć palenie (course), #240 Werset Dnia Rdz 16:13 (verse), #239 Biblia Śpiewana Live (music).
  2. **Dedykowana oprawa graficzna:** \`images/news/art-z-biblia-za-pan-brat-dzien-31-bog-obrocil-to-w-dobro.jpg\` (1024x576 16:9 HD) — podwójna aprobata: \`IMAGE_CONTENT_MATCH = PASS\` (@A520 — biblijne pojednanie Józefa z braćmi, suwerenna Opatrzność Boża), \`PUBLISHER_VISUAL_APPROVAL = PASS\` (@A001 — weryfikacja kadrowania 16:9, bezbłędny upload Playwright na X).
  3. **Weryfikacja biblijna UBG (Dyrektywa 20.10.2026):** 100% dosłowne brzmienie Uwspółcześnionej Biblii Gdańskiej: „Wy wprawdzie myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro, by zachować przy życiu liczny lud.” (Rdz 50:20, UBG).
  4. **Wdrożona treść posta na X (@csbwersetdnia):**
     🔴 CCN NEWS | polskieradio.cc/news
     📖 WERSET DNIA (UBG)
     „Wy wprawdzie myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro, by zachować przy życiu liczny lud.” (Rdz 50:20, UBG)

     👉 Akademia Biblijna:
     https://polskieradio.cc/akademia/kurscodzienny/dzien-31

     #WersetDnia #SlowoBoze
  5. **Silnik & Automatyzacja:** Playwright (\`scripts/ccn_auto_broadcaster.mjs\`), ZERO COST (0,00 PLN), post opublikowany na profilu @csbwersetdnia o godz. 19:04:55 UTC (20:04:55 czasu warszawskiego).
  6. **Rejestr & Synchronizacja:** Zaktualizowano \`data/x_published_history.json\`, \`data/ccn_broadcaster_state.json\` (pozycja #${broadcastNum}, totalBroadcasts: ${broadcastNum}), \`data/ccn_broadcaster_log.json\`, Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\` oraz mirror LUMINA — wpis #${broadcastNum}, symbol A).
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, newStatus + currentStatus, 'utf8');
  console.log('[JOMA] Zaktualizowano JOMA_STATUS.md');
}

// 3. Aktualizacja JOMA_HANDOFFS.md
const handoffEntry = `
## [${timestampWarsaw}] ANTIGRAVITY — CYKLICZNA EMISJA NOWOŚCI EKOSYSTEMU NA PLATFORMIE X: WERSET DNIA RDZ 50:20 UBG (CCN BROADCASTER #${broadcastNum})
- **Status:** done (Opublikowano na X @csbwersetdnia / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Analityk Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Pozycja:** Werset Dnia: „Wy myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro” (Rdz 50:20, UBG) (#${broadcastNum})
- **URL:** https://polskieradio.cc/akademia/kurscodzienny/dzien-31
- **Kategoria:** verse (Werset Dnia / Słowo Boże)
- **Grafika:** images/news/art-z-biblia-za-pan-brat-dzien-31-bog-obrocil-to-w-dobro.jpg (IMAGE_CONTENT_MATCH = PASS, PUBLISHER_VISUAL_APPROVAL = PASS)
- **Format:**
  \`\`\`
  🔴 CCN NEWS | polskieradio.cc/news
  📖 WERSET DNIA (UBG)
  „Wy wprawdzie myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro, by zachować przy życiu liczny lud.” (Rdz 50:20, UBG)

  👉 Akademia Biblijna:
  https://polskieradio.cc/akademia/kurscodzienny/dzien-31

  #WersetDnia #SlowoBoze
  \`\`\`
- **Weryfikacja Zero-QA:**
  - Status publikacji X: SUKCES (19:04:55 UTC / 20:04:55 Warszawa)
  - Ślad publikacji: \`data/x_published_history.json\`
  - Log nadajnika: \`data/ccn_broadcaster_log.json\`
  - Rejestr Żywej Mapy (@m): \`data/ecosystem-map.json\` (wpis #${broadcastNum}, symbol A)
`;

if (fs.existsSync(handoffsPath)) {
  fs.appendFileSync(handoffsPath, handoffEntry, 'utf8');
  console.log('[JOMA] Zaktualizowano JOMA_HANDOFFS.md');
}
