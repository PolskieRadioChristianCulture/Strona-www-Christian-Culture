# Raport Audytu Technicznego Repozytorium dla Inicjatywy CC 1101
## Centrum Pytań i Odpowiedzi Christian Culture (`/pytania`)

**Data audytu:** 2026-11-05  
**Wykonawca:** Antigravity (@A001)  
**Standard:** ZERO-QA dla Dowódcy • ZERO COST (0 zł) • Sola Scriptura (UBG)  
**Status:** AUDYT TECHNICZNY UKOŃCZONY — GOTOWOŚĆ DO ETAPU 1 (BEZ ZMIAN PRODUKCYJNYCH)

---

### 1. Repozytorium i Branch
- **Repozytorium robocze:** `C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc`
- **Lustro wdrożeniowe:** `C:\Users\czark\Desktop\@ICC\LUMINA`
- **Aktualna gałąź:** `main`
- **Punkt wyjścia (HEAD):** `030472d8` (`feat(biblia-audio): publikacja genesis 14`)

---

### 2. Wykryty Stack Technologiczny i Istotne Moduły
- **Środowisko uruchomieniowe:** Node.js v24.13.0, PowerShell na Windows, `npm.cmd`.
- **Hosting i CDN:** Cloudflare Pages z brzegowym Workerem (`_worker.js`) obsługującym routing, nagłówki bezpieczeństwa i API.
- **Renderowanie:** HTML-First / SSG (statyczne, semantyczne pliki HTML generowane przed publikacją z pełną dostępnością WCAG 2.2 AA i touch targetami min. 44×44 px).
- **Globalna Wyszukiwarka Ekosystemu (@w):**
  - Główny silnik: `components/cc-omni-search.js` (`window.CCOmniSearch`)
  - Interfejsy: `/wyszukiwarka` (`wyszukiwarka.html`) oraz `/szukaj` (`szukaj.html`)
  - Bazy indeksu: `szukaj/catalog.json` oraz `data/cc-search-index.json` (532 zindeksowane pozycje)
- **Serwis Remote MCP:**
  - `services/ai-dla-jezusa/mcp-server.js` obsługujący endpoint `/api/ai-dla-jezusa/v1/mcp/sse`.
- **Zarządzanie SEO i robotami:**
  - `robots.txt`: zaawansowana konfiguracja rozróżniająca boty wyszukiwarek AI (OAI-SearchBot, PerplexityBot, Applebot, Googlebot, Bingbot) od botów treningowych.
  - `sitemap.xml`: `sitemapindex` łączący mapy tematyczne: `pages.xml`, `biblia.xml`, `akademia.xml`, `news.xml`, `news-google.xml`, `muzyka.xml`, `video.xml`.
- **Telemetria:**
  - Google Analytics 4 (`G-Y4EFTVBPE3`) ze skryptem `js/cc-analytics.js` oraz filtrem ruchu wewnętrznego zespołu reżyserskiego OBS (`scripts/apply-ga-internal-traffic.mjs`).

---

### 3. Macierz Zgodności ze Specyfikacją CC 1101
- **Walidacja katalogu (1101 pytań):** **100% PASS**
  - Dokładnie 1101 unikalnych rekordów, 1101 unikalnych slugów, 1101 ID (`CCQ-0001` do `CCQ-1101`).
  - Rozkład kategorii w 100% zgodny z taksonomią:
    - BIB (160), CHR (120), DUC (100), ROD (110), KRY (100), MLO (90), NAO (90), PRC (80), SEN (70), PRO (70), ZDR (60), KUL (51).
  - Wszyscy kandydaci mają status: `editorial_status: "BACKLOG"` oraz `publication_status: "NOT_PUBLISHED"`.
  - W pakiecie wyznaczono 50 pytań priorytetu `P0` do redakcyjnego pilotażu.
- **Zasada ZERO COST:** **100% zgodności** — brak zewnętrznych baz danych SQL wymagających opłat, brak płatnych wtyczek czy subskrypcji. Architektura bazuje na wersjonowanych plikach JSON/JSONL oraz statycznym silniku Cloudflare Pages.
- **Bezpieczeństwo publikacji:** Żaden szkic nie trafi do sitemapy ani publicznego indeksu bez procedury K1-K12, podpisu recenzenta i zatwierdzenia człowieka.

---

### 4. Rzeczywiste URL i Zasoby EkoCC Gotowe do Wykorzystania
Odpowiedzi w sekcji *„Posłuchaj / obejrzyj / przeczytaj dalej”* mogą łączyć się ze zweryfikowanymi, działającymi platformami:
1. `https://polskieradio.cc/biblia-audio` — publiczny odtwarzacz Biblii Audio UBG (Księga Rodzaju, Ewangelie).
2. `https://polskieradio.cc/akademia#kurscodzienny` — Kurs Codzienny „Z Biblią za Pan Brat”.
3. `https://polskieradio.cc/mojabiblia` — interlinearna Biblia z kodami Stronga.
4. `https://polskieradio.cc/player` — Radio CC 24/7, Śniadaniowa, Ambient Sleep, Worship Live.
5. `https://polskieradio.cc/the-journal` — pamiętnik i przewodnik dla młodzieży 13–17 lat.
6. `https://polskieradio.cc/help` — katalog 62 stron wsparcia kryzysowego i wolontariatu CC Pomoc.
7. `https://polskieradio.cc/badz-blisko` — 7-dniowy plan biblijny, wyciszenie i chwila ze Słowem.
8. `https://polskieradio.cc/vod` — Kino Chrześcijańskie Christian Culture.

---

### 5. Obecny Stan SEO i Indeksowania
- `robots.txt` zawiera blokadę `Disallow: /*?q=*` oraz `Disallow: /*?query=*` zapobiegającą indeksowaniu wewnętrznych wyników wyszukiwania (zgodnie ze specyfikacją CC 1101).
- Dla modułu `/pytania` utworzona zostanie dedykowana mapa `sitemaps/pytania.xml`, podpięta do `sitemap.xml`. Początkowo mapa zawiera **dokładnie 0 adresów URL**, a wpisy będą dopisywane wyłącznie w momencie przejścia artykułu w stan `PUBLISHED`.
- Standard metadanych JSON-LD: stosowanie wyłącznie typu `@type: "Article"` lub `"BlogPosting"` dla opublikowanych artykułów (brak niewłaściwego `QAPage` oraz wycofanego przez Google `FAQPage`).

---

### 6. Proponowane Migracje i Architektura Wdrożenia
- **Krok A:** Import pakietu danych do repozytorium: `data/cc1101/catalog.jsonl`, `data/cc1101/pilotaż_50_pytan.md` oraz utworzenie skryptu walidującego `scripts/validate-cc1101.mjs`.
- **Krok B:** Stworzenie landing page `/pytania` (`pytania/index.html`) z 12 kategoriami tematycznymi, wyszukiwarką live i blokami wejściowymi.
- **Krok C:** Opracowanie adaptera do `components/cc-omni-search.js`, aby opublikowane odpowiedzi pojawiały się jako dedykowana sekcja w wyszukiwarce głównej.
- **Krok D:** Przygotowanie szablonu odpowiedzi (`pytania/[slug]/index.html`) spełniającego standardy Champagne Gold (`#C4A35A`), touch 44px, WCAG 2.2 AA oraz odtwarzacza TTS.

---

### 7. Ryzyka i Bramki Decyzyjne
- **Ryzyko Doorway Pages / Thin Content:** Przeciwdziałanie: 1101 pytań istnieje wyłącznie jako redakcyjna kolejka `BACKLOG`. Nie generujemy 1101 pustych podstron. Pytania bliskoznaczne będą łączone jako aliasy (`merged_into_id`) pod jeden kanoniczny artykuł.
- **Ryzyko YMYL (KRY, NAO, ZDR):** Kategoryczny wymóg: przy tematach zagrożenia życia (112), przemocy i zdrowia, na pierwszym miejscu znajduje się wyraźna belka pomocy kryzysowej i kontakt do profesjonalistów, a treść podlega procedurze Safety Review.
- **Koszty:** 0 zł (wszystkie narzędzia i zasoby działają w ramach obecnego limitu Free Tier).

---

### 8. Testy i Zabezpieczenia Przed Regresją
- **Przed wdrożeniem:**
  - `npm.cmd run test:guardian` (Strażnik Kodu) → wymagane 0 naruszeń.
  - `npm.cmd run test:mobile-premium` → wymagane 24/24 PASS.
  - `npm.cmd run test:cc-regression` → wymagane 536/536 PASS.
- **Nowy test:** `scripts/cc1101.test.mjs` weryfikujący:
  1. Integralność 1101 pytań w kolejce.
  2. Brak wycieku nieopublikowanych pytań do sitemap i API publicznego.
  3. Poprawność generowania schematu JSON-LD Article.

---

### 9. Estymacja Nakładu Prac
1. **Etap 0 (Audyt i przygotowanie):** UKOŃCZONY.
2. **Etap 1 (Fundament):** Import katalogu BACKLOG, schematy, testy walidacyjne, strona główna `/pytania` i 12 kategorii (ok. 4 zadania).
3. **Etap 2 (Pilotaż P0):** Redakcja i weryfikacja pierwszych 5–10 wzorcowych artykułów z procedurą K1-K12 (zależne od tempa redakcji człowieka).
4. **Etap 3 (SEO & Dystrybucja):** Sitemap, IndexNow dry-run, podpięcie do wyszukiwarki głównej @w.

---

### 10. Propozycja Pierwszego Bezpiecznego PR
- **Nazwa gałęzi / zakresu:** `feat/cc1101-foundation`
- **Zakres:**
  1. Umieszczenie plików specyfikacji i katalogu w `data/cc1101/`.
  2. Dodanie skryptu walidującego `scripts/validate-cc1101.mjs`.
  3. Dodanie testu automatycznego `scripts/cc1101.test.mjs`.
  4. Przygotowanie strony `/pytania/index.html` w trybie draft / preview bez naruszania istniejących tras.
- **Wpływ na produkcję:** ZERO ryzyka, 100% odwracalne, brak zmian w istniejących serwisach.
