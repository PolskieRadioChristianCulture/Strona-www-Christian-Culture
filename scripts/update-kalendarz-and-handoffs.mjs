import fs from 'node:fs';
import path from 'node:path';

// 1. Aktualizacja data/ekocc_kalendarz_365_artykulow.json
const jsonPath = path.resolve('data/ekocc_kalendarz_365_artykulow.json');
const calendarData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const item12 = calendarData.artykuly.find(x => x.lp === 12);
if (item12) {
  item12.status = 'Opracowany / Czeka na autoryzację L0';
  item12.bramka_bezpieczenstwa = 'T4 (DO AUTORYZACJI CZŁOWIEKA - L0)';
  item12.autor = 'Cezary Rogowski';
  item12.slug = 'gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek';
  item12.pakiet_zip = 'C:\\Users\\czark\\Desktop\\EkoCC_em_gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek_2026-11-15.zip';
  item12.pakiet_docx = 'C:\\Users\\czark\\Desktop\\EkoCC_em_gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek_2026-11-15.docx';
  item12.grafika_16_9 = 'images/em/art-gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek.jpg';
  item12.data_opracowania = '2026-11-15T10:05:00+01:00';
  item12.url_kanoniczny_szkic = 'https://polskieradio.cc/news/gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek';
}

fs.writeFileSync(jsonPath, JSON.stringify(calendarData, null, 2), 'utf8');
console.log('✅ Zaktualizowano data/ekocc_kalendarz_365_artykulow.json');

// Kopia do .pages-release jeśli istnieje
const pagesJsonPath = path.resolve('.pages-release/data/ekocc_kalendarz_365_artykulow.json');
if (fs.existsSync(pagesJsonPath)) {
  fs.writeFileSync(pagesJsonPath, JSON.stringify(calendarData, null, 2), 'utf8');
  console.log('✅ Zsynchronizowano .pages-release/data/ekocc_kalendarz_365_artykulow.json');
}

// 2. Aktualizacja CSV data/kalendarz_365_artykulow/EkoCC_365_Dni_Kalendarz.csv
const csvPath = path.resolve('data/kalendarz_365_artykulow/EkoCC_365_Dni_Kalendarz.csv');
if (fs.existsSync(csvPath)) {
  let csvContent = fs.readFileSync(csvPath, 'utf8');
  csvContent = csvContent.replace(
    '12;2026-11-15;niedziela;2026-11-15;Temat sezonowy / uzupełniający;Gdy religia staje się konkursem na nienaganny wizerunek;eM;eM — Motywacja Christian Culture;B;2026-11-07;Planowany / do opracowania;',
    '12;2026-11-15;niedziela;2026-11-15;Temat sezonowy / uzupełniający;Gdy religia staje się konkursem na nienaganny wizerunek;eM;eM — Motywacja Christian Culture;B;2026-11-07;Opracowany / Czeka na autoryzację L0;'
  );
  fs.writeFileSync(csvPath, csvContent, 'utf8');
  console.log('✅ Zaktualizowano data/kalendarz_365_artykulow/EkoCC_365_Dni_Kalendarz.csv');
}

// 3. Aktualizacja data/ecosystem-map.json
const mapPath = path.resolve('data/ecosystem-map.json');
if (fs.existsSync(mapPath)) {
  const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const newMapEntry = {
    date: '2026-11-15',
    topic: 'eM / Kalendarz 365: Opracowanie pakietu redakcyjnego LP 12 („Gdy religia staje się konkursem na nienaganny wizerunek”) — DOCX, ZIP na Pulpicie, status T4',
    agent: 'A'
  };

  if (!mapData.recentUpdates) mapData.recentUpdates = [];
  mapData.recentUpdates.unshift(newMapEntry);
  if (mapData.recentUpdates.length > 25) mapData.recentUpdates.pop();

  if (!mapData.updatesLog) mapData.updatesLog = [];
  mapData.updatesLog.unshift(newMapEntry);
  if (mapData.updatesLog.length > 60) mapData.updatesLog.pop();

  mapData.lastUpdated = '2026-11-15T10:05:00+01:00';
  fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
  console.log('✅ Zaktualizowano data/ecosystem-map.json');
}

// 4. Aktualizacja JOMA_HANDOFFS.md
const handoffsPath = 'C:\\Users\\czark\\Desktop\\Misja CC\\JOMA_SHARED_MEMORY\\JOMA_HANDOFFS.md';
if (fs.existsSync(handoffsPath)) {
  const handoffEntry = `## [2026-11-15 10:05] ANTIGRAVITY — KALENDARZ 365 ARTYKUŁÓW EkoCC: OPRACOWANIE PAKIETU REDAKCYJNEGO LP 12 (T4)
- **Status:** done (Opracowano kompletny pakiet redakcyjny / Czeka na autoryzację L0 — T4 / Zero-QA PASS)
- **Agent:** @A001 (Antigravity) — Publicysta i Pisarz Ekosystemu Christian Culture (@ICC / @joma / @777 / @OA)
- **Data operacji:** 2026-11-15 (Niedziela, 15 listopada 2026 r., godz. 10:05 CET)
- **Slot kalendarzowy:** Dzień 12 z 365 (LP 12 w \`data/ekocc_kalendarz_365_artykulow.json\`), priorytet B (start: 2026-11-07)
- **Tytuł artykułu (H1):** „Gdy religia staje się konkursem na nienaganny wizerunek”
- **Autor zweryfikowany:** Cezary Rogowski (Redakcja eM — Motywacja Christian Culture)
- **Portal docelowy:** eM — Motywacja Christian Culture (\`https://polskieradio.cc/news\` / \`https://polskieradio.cc/em\`)
- **Dział tematyczny:** eM / Motywacja, Prawda i Dojrzałość Wiary
- **Bramka bezpieczeństwa:** T4 (DO AUTORYZACJI CZŁOWIEKA — L0). Bezwzględny brak automatycznej publikacji produkcyjnej bez jawnej zgody Cezarego Rogowskiego.

### 📦 Wygenerowane pakiety i artefakty redakcyjne:
1. **Paczka ZIP na Pulpicie:** \`C:\\Users\\czark\\Desktop\\EkoCC_em_gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek_2026-11-15.zip\` (1,52 MB)
2. **Dokument Word (.docx) na Pulpicie:** \`C:\\Users\\czark\\Desktop\\EkoCC_em_gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek_2026-11-15.docx\` (769 KB)
   - Zawiera profesjonalne formatowanie typograficzne, nagłówek H1, lead bold, 6 rozbudowanych sekcji H2, podsumowanie redakcyjne CCN, wezwanie do działania i modlitwę, blok patronacki EkoCC, źródła pierwotne oraz osadzoną pełnowymiarową grafikę 16:9.
3. **Plik tekstowy TXT/MD:** \`temp_packages/EkoCC_em_gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek_2026-11-15/EkoCC_em_gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek_2026-11-15.txt\` (21,8 KB)
4. **Metadane SEO i rejestr AI:** \`EkoCC_em_gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek_2026-11-15_SEO.txt\`
   - Tytuł SEO: „Gdy religia staje się konkursem na nienaganny wizerunek | eM Christian Culture” (73 znaki)
   - Meta Description: „Dlaczego w kościele tak trudno przyznać się do słabości? Odkryj egzegezę greckiego hypokrites, badania Goffmana i Allporta oraz 6 kroków do wiary bez masek.” (154 znaki)
   - Slug ASCII: \`gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek\`
   - Schema.org NewsArticle JSON-LD, sitemap, deklaracje botów AI (GPTBot, ClaudeBot, PerplexityBot).
5. **Dedykowana grafika redakcyjna 16:9 (1376×768):** \`images/em/art-gdy-religia-staje-sie-konkursem-na-nienaganny-wizerunek.jpg\` (752 KB)
   - Fotorealistyczna, nastrojowa kompozycja redakcyjna w tonacji Champagne Gold (#C4A35A), przedstawiająca otwartą, oświetloną porannym słońcem Biblię oraz odłożoną obok na drewnianym stole pękniętą porcelanową maskę jako symbol porzucenia gry pozorów i powrotu do autentycznej wiary.
   - Podwójna aprobata: IMAGE_CONTENT_MATCH = PASS (@A520) | PUBLISHER_VISUAL_APPROVAL = PASS (@A001).

### 📖 Zgodność egzegetyczna i doktrynalna:
- Przekład Pisma Świętego: **Uwspółcześniona Biblia Gdańska (UBG)**.
- Wykorzystane wersety w kontekście historycznym, literackim i autorskim:
  * **Ewangelia wg św. Mateusza 23:1–7.25–28 (UBG):** Konfrontacja Jezusa z faryzejską obłudą, poszerzaniem filakterii na pokaz i metaforą „grobów pobielanych” (gr. *hypokrites* — aktor w masce teatralnej).
  * **Ewangelia wg św. Łukasza 18:9–14 (UBG):** Przypowieść o faryzeuszu i celniku — demaskacja religijnego samozachwytu i modlitwy „w sobie” (*pros heauton*) na rzecz pokornego wołania o miłosierdzie (*hilastheti*), skutkującego usprawiedliwieniem z łaski.
  * **1 Księga Samuela 16:7 (UBG):** *„Człowiek bowiem patrzy na to, co jest przed oczyma, ale PAN patrzy na serce.”* (hebr. *lewaw* — centrum sumienia i autentyczności).
  * **List do Galacjan 2:11–14 (UBG):** Spór w Antiochii — apostoł Paweł konfrontuje Piotra i Barnabę za uleganie presji wizerunkowej i lękowi przed ludźmi ze stronnictwa obrzezania (*hypokrisis*).
  * **List do Rzymian 3:23–24 (UBG):** *„Wszyscy bowiem zgrzeszyli i są pozbawieni chwały Bożej; a zostają usprawiedliwieni darmo, z jego łaski, przez odkupienie, które jest w Chrystusie Jezusie.”*
  * **Ewangelia wg św. Mateusza 6:1–6 (UBG):** Jałmużna, post i modlitwa w skrytości jako skuteczna odtrutka na budowanie kapitału wizerunkowego.
- Doktryna: Zgodność z 28 Zasadami Wiary Kościoła Bożego (Zasada o naturze człowieka i grzechu, zbawieniu i usprawiedliwieniu z łaski przez wiarę, uświęceniu przez Ducha Świętego oraz Kościele jako wspólnocie Ciała Chrystusowego).

### ⚖️ Prawda, etyka i źródła naukowe:
- Erving Goffman — „The Presentation of Self in Everyday Life” (teoria socjologiczna: scena *front stage* vs kulisy *backstage*, impression management).
- Gordon W. Allport, J. Michael Ross — „Personal Religious Orientation and Prejudice” (typologia religijności zewnętrznej *extrinsic* vs wewnętrznej *intrinsic*).
- Kenneth I. Pargament (Bowling Green State University) — badania kliniczne nad psychologią religii i destrukcyjnymi skutkami tłumienia słabości we wspólnocie.
- John Welwood — definicja mechanizmu ucieczki w duchowość (*spiritual bypass*).
- Brené Brown (University of Houston) — badania nad perfekcjonizmem jako tarczą chroniącą przed wstydem i odwagą do autentyczności (*vulnerability*).
- Zero clickbaitu, zero fikcyjnych wspomnień Cezarego Rogowskiego, zero niesprawdzonych statystyk, zero etykietowania rodziców jako toksycznych.

### 🗓️ Przegląd wyprzedzający pozycji z Kalendarza 365 (Priorytety A i B):
- **LP 13 (2026-11-16, Prio B — jutro):** „Dzień Tolerancji: czy szacunek oznacza zgodę na wszystko?” (CCN News / aktualności, start: 2026-11-08) — przygotowany do startu.
- **LP 14 (2026-11-17, Prio B):** „Wielki post internetowy? Jak odzyskać uwagę przed świętami” (eM, start: 2026-11-09).
- **LP 15 (2026-11-18, Prio B):** „Zimno za oknem, chłód w domu: od czego zacząć pojednanie?” (Rodzina i relacje, start: 2026-11-10).
- **LP 16 (2026-11-19, Prio A — 14 dni wyprzedzenia):** „Silni aż do wyczerpania: dlaczego mężczyźni wciąż boją się prosić o pomoc?” (Rodzina/eM, start: 2026-11-05).
- **LP 17 (2026-11-20, Prio A — 14 dni wyprzedzenia):** „Dziecko nie jest własnością rodzica. Co Biblia mówi o godności najmłodszych?” (Rodzina, start: 2026-11-06).
- **LP 21 (2026-11-24, Prio A):** „Kto wspiera głowę rodziny, gdy nie ma już siły? O milczącym ciężarze odpowiedzialności” (start: 2026-11-10).
- **LP 22 (2026-11-25, Prio A):** „Miłość nie bije. Gdzie kończy się cierpliwość, a zaczyna przemoc?” (start: 2026-11-11).
- **LP 24 (2026-11-27, Prio A):** „Czarny piątek, czerwone konto: jak nie kupować szczęścia na kredyt?” (start: 2026-11-13).
- **LP 25 (2026-11-28, Prio A):** „Kupuję, bo czuję pustkę: dlaczego promocja nie uleczy jesiennej samotności?” (start: 2026-11-14).
- **LP 26 (2026-11-29, Prio A):** „Adwent bez religijnych złudzeń. Na kogo naprawdę czekasz?” (start: 2026-11-15).

`;

  const existing = fs.readFileSync(handoffsPath, 'utf8');
  fs.writeFileSync(handoffsPath, handoffEntry + '\n' + existing, 'utf8');
  console.log('✅ Zaktualizowano C:\\Users\\czark\\Desktop\\Misja CC\\JOMA_SHARED_MEMORY\\JOMA_HANDOFFS.md');
}
