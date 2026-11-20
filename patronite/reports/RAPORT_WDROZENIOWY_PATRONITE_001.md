# RAPORT WDROŻENIOWY: CC PATRONITE MISSION REPORTER (`@ICC-PATRONITE-001`)

- **Data raportu:** 2026-11-20 (`Europe/Warsaw`)
- **Status ogólny:** **GOTOWY DO AKCEPTACJI L0 (W TRYBIE TESTOWYM)**
- **Tryb aktywny:** `TEST_SIMULATION` (`productionApprovedByOwner: false`, `autoPublishEnabled: false`)
- **Publiczny podgląd testowy (`noindex, nofollow, noarchive`):** `https://polskieradio.cc/test/patronite`
- **Koszt uruchomienia i utrzymania:** **0,00 zł** (`ZERO COST` — lokalny Node.js `v24.13.0`, `node:sqlite`, `sharp`, lokalna Biblia UBG-2025, lokalne fotografie `@ICC`)

---

## 1. Architektura 10 niezależnych modułów (`patronite/src/`)

| Moduł | Plik | Odpowiedzialność |
|---|---|---|
| State & Audit DB | `patronite/src/db.mjs` | Transakcyjny SQLite (`jobs`, `evidence_registry`, `published_archive`, `audit_log`, `system_flags`), maskowanie sekretów i tokenów w logach |
| Scheduler & Kill-Switch | `patronite/src/scheduler.mjs` | Harmonogram `Europe/Warsaw` z obsługą zmian czasu CET/CEST, oknem przygotowawczym `-2h`, twardym progiem przed-szabatowym w piątki (`14:30`) i blokadą `kill_switch` |
| Collector | `patronite/src/collector.mjs` | Odczyt wyłącznie autoryzowanych źródeł (`polskieradio.cc`, `biblia-audio/data/catalog.json`, `data/ecosystem-map.json`, repozytorium Git, `JOMA`), sanityzacja i blokada nazw zaplecza |
| Evidence Validator | `patronite/src/evidence-validator.mjs` | Rozróżnienie `ZREALIZOWANE / W TRAKCIE / PLANOWANE / NIEPOTWIERDZONE`, blokada publikacji niepotwierdzonych faktów/planów jako gotowych oraz ścisła weryfikacja dosłownych cytatów w **UBG-2025** i pełnych nazw ksiąg |
| Editorial Planner | `patronite/src/editorial-planner.mjs` | Punktowany wybór najwartościowszego tematu i 30-dniowa kontrola powtórzeń (klucz tematu, hash SHA-256, podobieństwo tokenowe Jaccarda ≥ `0.65`) |
| Text Writer | `patronite/src/text-writer.mjs` | Redakcja polskich tekstów w stylu `cc-human-voice` i 28 Zasad Wiary: tytuł `35–85` zn., zajawka `120–250` zn., treść `900–1800` zn., pytanie angażujące, 1 naturalne CTA, maks. 3 hashtagi, opis ALT |
| Visual Director | `patronite/src/visual-director.mjs` | Programowy skład warstwowy (SVG + `sharp`) szablonu **„DOBRO, KTÓRE TWORZYMY RAZEM”** w formacie głównym **`1068×630 PNG`** (≤ 10 MB) oraz promocyjnym **`1080×1080 PNG`** dla 3 wariantów (`mission-report`, `behind-the-scenes`, `thank-you`) z wyodrębnioną parą oficjalnych znaków firmowych |
| Quality Guardian | `patronite/src/quality-guardian.mjs` | 12 twardych bramek krytycznych (jeden `FAIL` = blokada publikacji; brak uśredniania ocen) |
| Publisher & Verifier | `patronite/src/publisher.mjs`, `verifier.mjs` | Bramki uprawnień (`assertPermittedAction` blokuje finanse, wiadomości prywatne, progi i ustawienia konta), blokada publikacji na żywo przed akceptacją L0, obsługa `503`/`401`/`500` oraz idempotentne odzyskiwanie po częściowym sukcesie (read-back po `job_id`) |
| Mission Reporter & Pipeline | `patronite/src/reporter.mjs`, `pipeline.mjs` | Raporty cykli, podsumowania tygodniowe, eksport JSON dla `/test/patronite`, propozycja harmonogramu `@ICC` (`patronite/state/openbot-schedule-proposal.json`, `enabled: false`) |

---

## 2. Uczciwy audyt integracji z Patronite (`patronite.pl/osobowoscplus`)

1. **Publiczne REST API Patronite:** Na dzień `2026-11-20` platforma `patronite.pl` **nie udostępnia publicznego, samoobsługowego REST API do tworzenia i publikowania postów** (sekcja API i webhooków działa w trybie zamkniętej bety po kontakcie z `kontakt@patronite.pl`).
2. **Bezpieczeństwo i zgodność z zasadami:** System nie używa nieudokumentowanych prywatnych endpointów, nie obchodzi CAPTCHA/2FA i nie przechowuje haseł w repozytorium ani logach.
3. **Domyślny adapter (`DraftPackagePublisher`):** Do czasu decyzji właściciela system działa jako `DraftPackagePublisher` — generuje kompletne, zweryfikowane pakiety (`post.json`, `post.md`, `graphic-1068x630.png`, `promo-1080x1080.png`) ze statusem **`SZKIC`** (gotowe do ręcznej publikacji/zaplanowania w panelu Patronite, bez udawania automatycznej publikacji na żywo).
4. **Gotowość do dalszych trybów:**
   - Wariant A (`PatroniteOfficialApiAdapter`): zaimplementowany i przetestowany na lokalnym serwerze HTTP mock (obsługa `createDraft`, `updateDraft`, `schedulePost`, `publishPost`, `verifyPost`, błędy `503`/`401`/`500` oraz częściowy sukces + odzyskiwanie URL). Wymaga jedynie tokenu od `kontakt@patronite.pl` w zmiennej środowiskowej `PATRONITE_API_TOKEN`.
   - Wariant B (Rola **Moderator** postów): Patronite przewiduje dedykowaną rolę Moderatora do obsługi postów bez dostępu do finansów i ustawień wypłat — możliwy do bezpiecznego użycia w osobnym kroku po decyzji L0.

---

## 3. Wynik symulacji 2 tygodni (6 cykli: Pon / Śr / Pt × 2)

| ID zadania | Termin (`Europe/Warsaw`) | Seria | Tytuł posta | Znaki (T / Z / B) | PNG (`1068×630`) | QA | Źródło faktu |
|---|---|---|---|---|---|---|---|
| `PAT-20261123-mission-report` | `2026-11-23 09:00` (prep `07:00`) | `DZIENNIK MISJI` | Dziennik Misji: 31 rozdziałów Księgi Rodzaju już w Biblii Audio CC | 66 / 144 / 1312 | 809 KB | **12/12 PASS** | `[ZREALIZOWANE]` `polskieradio.cc/biblia-audio` |
| `PAT-20261125-behind-the-scenes` | `2026-11-25 18:00` (prep `16:00`) | `ZA KULISAMI CHRISTIAN CULTURE` | Za kulisami CC: jak powstają nagrania Studia Dobrego Słowa i Biblii Audio | 73 / 151 / 1292 | 714 KB | **12/12 PASS** | `[ZREALIZOWANE]` `polskieradio.cc/vod & /news` |
| `PAT-20261127-thank-you` | `2026-11-27 10:00` (prep `08:00`) | `DZIĘKI, ŻE JESTEŚ` | Dzięki, że jesteś: Słowo Boże daje siłę przed rozpoczynającym się szabatem | 74 / 143 / 1412 | 814 KB | **12/12 PASS** | `[ZREALIZOWANE]` `UBG (polskieradio.cc/mojabiblia)` |
| `PAT-20261130-mission-report` | `2026-11-30 09:00` (prep `07:00`) | `DZIENNIK MISJI` | Dziennik Misji: 51 lekcji kursu Z Biblią za Pan Brat na Akademii CC | 67 / 135 / 1189 | 806 KB | **12/12 PASS** | `[ZREALIZOWANE]` `polskieradio.cc/akademia` |
| `PAT-20261202-behind-the-scenes` | `2026-12-02 18:00` (prep `16:00`) | `ZA KULISAMI CHRISTIAN CULTURE` | Za kulisami CC: porządkujemy blisko 200 miejsc serwisu pod smartfony | 68 / 136 / 1339 | 1101 KB | **12/12 PASS** | `[ZREALIZOWANE]` `polskieradio.cc/lumina & /mapa` |
| `PAT-20261204-thank-you` | `2026-12-04 10:00` (prep `08:00`) | `DZIĘKI, ŻE JESTEŚ` | Dzięki, że jesteś: pokój nadziei na próg kolejnego szabatu | 58 / 145 / 1505 | 910 KB | **12/12 PASS** | `[ZREALIZOWANE]` `UBG (polskieradio.cc/werset-dnia)` |

- **Duplikaty w oknie 30 dni:** `0 / 6`
- **Podsumowania tygodniowe:** Tydzień 1 (`SZKIC: 3, OPUBLIKOWANO: 0`), Tydzień 2 (`SZKIC: 3, OPUBLIKOWANO: 0`).
- **Strona przeglądowa:** `/test/patronite` (wyłącznie `noindex, nofollow, noarchive`, nagłówki w `_headers`, zero odwołań do nazwy zaplecza właściciela).

---

## 4. Kontrola bezpieczeństwa, prywatności i wyłącznika awaryjnego

1. **Izolacja publikacji (`scripts/cc-release-files.mjs`):** Katalog operacyjny `patronite/` jest twardo zablokowany przed wejściem do paczki `.pages-release`; publiczna paczka zawiera wyłącznie stronę testową `test/patronite/`.
2. **Wyłącznik awaryjny (`kill-switch`):** Zweryfikowano w bazie SQLite:
   - `npm.cmd run patronite:pause` → ustawia `killSwitch: true` (twarda blokada cyklu kodem `KILL_SWITCH_ACTIVE`).
   - `npm.cmd run patronite:resume` → przywraca `killSwitch: false`.
   - `npm.cmd run patronite:status` → raportuje aktualne flagi oraz ostatnie zadania.
3. **Minimalne uprawnienia:** Próby wywołania `read_patron_finances`, `send_private_message`, `modify_tiers` lub `modify_account_settings` rzucają wyjątek `PERMISSION_DENIED`.

---

## 5. Wyniki testów weryfikacyjnych (ZERO-QA)

| Zestaw testowy | Wynik obserwowany | Uwagi / szczegóły |
|---|---|---|
| `npm.cmd run test:patronite` | **10 / 10 PASS** (`0` fail, `0` skipped) | Harmonogram DST/szabat, Collector, Evidence Validator, UBG-2025, duplikaty 30d, grafiki `1068×630` + `1080×1080`, Quality Guardian 12/12, adapter mock (`503`/`401`/`500`/częściowy sukces), kill-switch SQLite, symulacja 6 cykli, strona `/test/patronite` |
| Playwright (`/test/patronite/`) | **Desktop `1440×900` & Mobile `390×844` PASS** | `overflow=false`, wszystkie przyciski/taby `>= 44 px`, grafiki `1068×630` i `1080×1080` załadowane, przełączanie kart `6` cykli działa, `0` błędów konsoli |
| `node --test scripts/cc-release-files.test.mjs` | **5 / 5 PASS** (`0` fail, `0` skipped) | Potwierdza blokadę prywatnych plików operacyjnych i publikację `test/patronite/` |
| `npm.cmd run test:guardian` | **0 naruszeń** (`exit code 0`) | 13 reguł na 279 plikach HTML i 146 plikach JS |
| `npm.cmd run test:mobile-premium` | **25 / 25 PASS** (`0` fail, `0` skipped) | Zgodność warstwy mobilnej i kontraktów LUMINA |
| `npm.cmd run test:cc-regression` | **670 PASS, 1 SKIP, 0 FAIL** (`exit code 0`) | 1 pominięty test to pre-existing test czatu wymagający emulatora Firestore (`ordinary members complete first-contact...`) |

---

## 6. Lista decyzji właściciela (L0) przed uruchomieniem na żywo

System pozostaje celowo w bezpiecznym trybie `TEST_SIMULATION`. Aby włączyć regularną produkcję, potrzebne są **3 decyzje Cezarego Rogowskiego**:

1. **Wybór kanału publikacji na Patronite:**
   - **Opcja A (zalecana natychmiastowo, zero ryzyka):** Gotowe pakiety (`SZKIC` + grafiki) z cyklicznym powiadomieniem i ręcznym zatwierdzeniem/planowaniem przez konto Moderatora postów.
   - **Opcja B:** Wysłanie zapytania do `kontakt@patronite.pl` o dostęp do zamkniętej bety oficjalnego API postów Patronite (moduł `PatroniteOfficialApiAdapter` jest gotowy do podpięcia zmiennej środowiskowej `PATRONITE_API_TOKEN`).
2. **Akceptacja harmonogramu produkcyjnego w istniejącej automatyzacji `@ICC`:**
   - Czy aktywować wpis `patronite/state/openbot-schedule-proposal.json` dla **Poniedziałek `09:00`**, **Środa `18:00`**, **Piątek `10:00`** (przygotowanie `-2h`: `07:00` / `16:00` / `08:00`, przed szabatem `14:30`)?
3. **Domyślna widoczność postów na Patronite:**
   - Czy serię poniedziałkową, środową i piątkową publikować domyślnie jako **`PUBLICZNY`** (budowanie zasięgu i zapraszanie nowych Patronów) czy wybrane wpisy jako tylko dla Patronów?
