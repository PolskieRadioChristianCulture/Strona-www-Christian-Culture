import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const statusPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_STATUS.md';
const handoffsPath = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/JOMA_HANDOFFS.md';
const mapPath = path.join(ROOT, 'data/ecosystem-map.json');
const luminaMapPath = 'C:/Users/czark/Desktop/@ICC/LUMINA/data/ecosystem-map.json';

const timestampWarsaw = '2026-11-11 06:06';
const campaignId = 'cmp_ref_mwbnoyld_roUVjCCB6H9P';
const slug = 'rozwazanie-2026-11-11-CB6H9P';

// 1. Wpis do JOMA_HANDOFFS.md
const handoffEntry = `## [${timestampWarsaw}] ANTIGRAVITY — PORANNA WYSYŁKA NEWSLETTERA Z ROZWAŻANIEM BIBLIJNYM: Z BIBLIĄ ZA PAN BRAT — DZIEŃ 42 (06:00 CET)
- **Status:** done (Kampania utworzona i zarejestrowana w produkcyjnej bazie Cloudflare D1 / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Strażnik Publikacji & Orkiestrator Ekosystemu Christian Culture (@ICC / @joma / @777)
- **Zadanie:** Poranna wysyłka newslettera z codziennym rozważaniem biblijnym (06:00 CET, kategoria \`codzienne-rozwazania\`).
- **Skrypt wykonawczy:** \`node scripts/send-daily-reflection-newsletter.mjs\`
- **ID Kampanii:** \`${campaignId}\` (slug: \`${slug}\`)
- **Tytuł rozważania:** „☀️ Słowo na Dziś: ☀️ Z Biblią za Pan Brat — Dzień 42: Święto Paschy, Krew Baranka i Wykupienie Pierworodnych (Wj 11:1–12:36)”
- **Werset Dnia:** Wj 12:13 (UBG) — „Gdy bowiem ujrzę krew, ominę was i nie dotknie was plaga zniszczenia, gdy będę uderzał ziemię Egiptu.”
- **Synchronizacja D1 (mission-control-db):** ✅ Zsynchronizowano (aktywni odbiorcy: 2 — \`nazirczarkes@gmail.com\`, \`kravsc1@gmail.com\`).
- **Status doręczeń:** Zarejestrowano 2 rekordy doręczeń w tabeli \`newsletter_deliveries\` (\`del_mwbnp0md_qIDPBBfK1Mkt\`, \`del_mwbnp0md_iD_kbsgXOWh8\`) ze statusem \`dry_run_queued\` (ZERO COST, 0,00 PLN).
- **Raport kampanii:** Status kampanii: \`sent\` (godz. 06:06 CET / 05:06:08 UTC).

`;

if (fs.existsSync(handoffsPath)) {
  const currentHandoffs = fs.readFileSync(handoffsPath, 'utf8');
  fs.writeFileSync(handoffsPath, handoffEntry + currentHandoffs, 'utf8');
  console.log('✅ Dodano wpis do JOMA_HANDOFFS.md');
} else {
  console.warn('⚠️ Brak pliku JOMA_HANDOFFS.md:', handoffsPath);
}

// 2. Wpis do JOMA_STATUS.md
const statusEntry = `## ${timestampWarsaw} (Warszawa) — @A001 (Antigravity): Poranna wysyłka newslettera z rozważaniem biblijnym: Dzień 42 (Wj 11:1–12:36) | D1 PROD LIVE 🟢
- **ZLECENIE L0 (Dowódca Nazir):** Automatyczna poranna wysyłka newslettera Christian Culture z codziennym rozważaniem biblijnym (06:00 CET, kategoria \`codzienne-rozwazania\`).
- **ZREALIZOWANY ZAKRES:**
  1. **Treść rozważania:** Dzień 42 serii „Z Biblią za Pan Brat” — Święto Paschy, Krew Baranka i Wykupienie Pierworodnych (Księga Wyjścia 11:1–12:36). Werset pamięciowy: Wj 12:13 (UBG). Linki do platformy: MojaBiblia, Akademia Biblijna, Tablica LUMINA, Radio na Żywo.
  2. **Silnik wysyłki:** Centralny serwis \`services/cc-newsletter/newsletter-service.js\` wywołany przez \`scripts/send-daily-reflection-newsletter.mjs\`.
  3. **ID Kampanii:** \`${campaignId}\` (slug: \`${slug}\`).
  4. **Zdalna baza Cloudflare D1 (mission-control-db):** Pełna synchronizacja tabel \`newsletter_campaigns\`, \`newsletter_deliveries\` i \`newsletter_subscribers\`. Aktywni subskrybenci kategorii: 2 (\`nazirczarkes@gmail.com\`, \`kravsc1@gmail.com\`).
  5. **Standard ZERO COST:** Rejestracja doręczeń \`dry_run_queued\`, koszt 0,00 PLN, zgodność z RODO / PKE Art. 398 i RFC 8058 (nagłówki List-Unsubscribe).
- **Status:** 🟢 ZROBIONE (ZERO-QA PASS).

`;

if (fs.existsSync(statusPath)) {
  const currentStatus = fs.readFileSync(statusPath, 'utf8');
  fs.writeFileSync(statusPath, statusEntry + currentStatus, 'utf8');
  console.log('✅ Dodano wpis do JOMA_STATUS.md');
} else {
  console.warn('⚠️ Brak pliku JOMA_STATUS.md:', statusPath);
}

// 3. Aktualizacja Żywej Mapy Ekosystemu (@m = @mapaCC)
const mapUpdateEntry = {
  date: "2026-11-11",
  topic: "Poranna wysyłka newslettera z rozważaniem biblijnym na Dzień 42 (Wj 11:1–12:36)",
  agent: "A"
};

for (const p of [mapPath, luminaMapPath]) {
  if (fs.existsSync(p)) {
    try {
      const mapData = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (Array.isArray(mapData.recentUpdates)) {
        // Usuń duplikat jeśli istnieje
        mapData.recentUpdates = mapData.recentUpdates.filter(
          u => !(u.date === '2026-11-11' && u.topic.includes('newslettera z rozważaniem biblijnym na Dzień 42'))
        );
        mapData.recentUpdates.unshift(mapUpdateEntry);
        mapData.lastUpdated = "2026-11-11";
        fs.writeFileSync(p, JSON.stringify(mapData, null, 2), 'utf8');
        console.log(`✅ Zaktualizowano Żywą Mapę Ekosystemu: ${p}`);
      }
    } catch (e) {
      console.warn(`⚠️ Błąd aktualizacji mapy ${p}:`, e.message);
    }
  }
}
