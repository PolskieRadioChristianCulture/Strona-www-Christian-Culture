import fs from 'node:fs';

const handoffEntry = `## [2026-11-15 13:10] ANTIGRAVITY — MANDAT BEZPOŚREDNI DOWÓDCY NAZIRA: PUBLIKACJA ARTYKUŁU eM „GDY RELIGIA STAJE SIĘ KONKURSEM NA NIENAGANNY WIZERUNEK” (SLOT 12, EkoCC 365)
- **Status:** done (Opublikowano produkcyjnie / HTTP 200 OK na polskieradio.cc / Zero-QA PASS)
- **MANDAT BEZPOŚREDNI DOWÓDCY NAZIRA:** Autoryzacja wykonawcza L0 (Bramka T4 -> T3) dla publikacji artykułu autorskiego Cezarego Rogowskiego ze Slotu 12 (2026-11-15, Niedziela 15 listopada 2026 r.).
- **Agent:** @A001 (Antigravity) — Publicysta i Pisarz Ekosystemu Christian Culture (@ICC / @joma / @777 / @OA)
- **ZREALIZOWANY ZAKRES:**
  1. **Pakiet redakcyjny na Pulpicie:**
     - ZIP: \`C:\\Users\\czark\\Desktop\\EkoCC_em_gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek_2026-11-15.zip\`
     - DOCX: \`C:\\Users\\czark\\Desktop\\EkoCC_em_gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek_2026-11-15.docx\`
     - Grafika 16:9 HD: \`images/news/art-gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek.jpg\` (oraz \`images/em/\`)
  2. **Wdrożenie w kodzie i baza artykułów:**
     - Zaktualizowano \`portals/ccn-news/src/data/articles.ts\` (INITIAL_ARTICLES oraz BREAKING_NEWS).
     - Zaktualizowano \`em.html\` o nową wyróżnioną kartę artykułu w sekcji inauguracji eM.
     - Przebudowano produkcyjny bundle CCN News oraz wygenerowano statyczne strony SSG: \`news/gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek.html\`, \`news/gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek/index.html\` oraz alias \`news/art-*\`.
  3. **Wyszukiwarka @w & Pasek Informacyjny TV:**
     - Zaindeksowano artykuł w \`szukaj/catalog.json\` i \`data/cc-search-index.json\`.
     - Zaktualizowano \`data/ccn-news-ticker.json\` dla pasków informacyjnych kanałów TV LIVE.
     - Zaktualizowano \`data/ccn-article-routes.js\`.
  4. **Kalendarz 365 & Rejestr Ekosystemu:**
     - Zaktualizowano \`data/ekocc_kalendarz_365_artykulow.json\` (Slot 12: status \`Opublikowany (Autoryzacja L0: 2026-11-15)\`, bramka \`T3 (OPUBLIKOWANO PRODUKCYJNIE)\`).
     - Zaktualizowano \`data/kalendarz_365_artykulow/EkoCC_365_Dni_Kalendarz.csv\`.
     - Zaktualizowano Żywą Mapę Ekosystemu (\`data/ecosystem-map.json\`, wpis z symbolem A).
  5. **Bateria Testów Weryfikacyjnych (ZERO-QA PASS):**
     - Strażnik Kodu (\`npm.cmd run test:guardian\`): 0 naruszeń.
     - Mobile Premium (\`npm.cmd run test:mobile-premium\`): 25/25 PASS (100%).
     - Testy Regresji (\`npm.cmd run test:cc-regression\`): 594/594 PASS (100%).
  6. **Centralny Pipeline Discovery & Wdrożenie Cloudflare Pages:**
     - Wykonano \`scripts/cc-universal-publish-discovery.mjs\`.
     - Sitemapy: \`sitemap.xml\`, \`sitemaps/news-google.xml\`, RSS \`feed.xml\`, IndexNow (355 adresów URL HTTP 200 Bing & Global).
     - Wdrożono pakiet \`.pages-release\` na Cloudflare Pages: potwierdzono HTTP 200 OK na \`https://polskieradio.cc/news/gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek\`.
     - Podwójny Git Push: \`origin\` oraz \`lumina-repo\` zsynchronizowane.
     - Zsynchronizowano lustro w \`C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\`.
`;

const handoffsPath = 'C:\\Users\\czark\\Desktop\\Misja CC\\JOMA_SHARED_MEMORY\\JOMA_HANDOFFS.md';
if (fs.existsSync(handoffsPath)) {
  const content = fs.readFileSync(handoffsPath, 'utf8');
  fs.writeFileSync(handoffsPath, handoffEntry + '\n' + content, 'utf8');
  console.log('✅ Zaktualizowano JOMA_HANDOFFS.md');
}

const statusPath = 'C:\\Users\\czark\\Desktop\\Misja CC\\JOMA_SHARED_MEMORY\\JOMA_STATUS.md';
if (fs.existsSync(statusPath)) {
  const statusContent = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, handoffEntry + '\n' + statusContent, 'utf8');
  console.log('✅ Zaktualizowano JOMA_STATUS.md');
}
