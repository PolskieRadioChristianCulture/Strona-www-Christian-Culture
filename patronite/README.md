# CC PATRONITE MISSION REPORTER (`@ICC-PATRONITE-001`)

Autonomiczny, zero-kosztowy system przygotowywania, weryfikacji dowodowej, generowania grafik (`1068×630` + wariant promocyjny `1080×1080`) i bezpiecznego raportowania publikacji dla Patronów **Christian Culture** (`https://patronite.pl/osobowoscplus`).

> **Stan wdrożenia:** `TEST_SIMULATION` (środowisko testowe: `https://polskieradio.cc/test/patronite`). **Publikacja produkcyjna jest zablokowana** aż do uzyskania jawnej akceptacji właściciela misji (L0 — Cezary Rogowski).

---

## 1. Wynik audytu technicznego i integracji z Patronite (Faza I)

1. **Oficjalne API Patronite (sekcja 9 dyrektywy):**
   - Weryfikacja stanu na 2026-11-20 potwierdza, że serwis `patronite.pl` **nie udostępnia publicznego, samoobsługowego REST API do tworzenia ani publikowania postów** (sekcja „Programiści” / API i webhooki ma charakter zamkniętej bety wymagającej indywidualnego uzgodnienia z `kontakt@patronite.pl`).
   - Zgodnie z zakazem używania nieudokumentowanych prywatnych endpointów, obchodzenia CAPTCHA/2FA oraz zapisywania haseł w repozytorium:
     - Aktywny domyślny tryb pracy to **`DraftPackagePublisher` (szkic kompletny)** — system buduje gotowy, zweryfikowany pakiet (`post.json`, `post.md`, `graphic-1068x630.png`, `promo-1080x1080.png`) i oznacza go uczciwie jako **`SZKIC`**, nie symulując pełnej autopublikacji.
     - Moduł `patronite/src/publisher.mjs` zawiera również przygotowany **`PatroniteOfficialApiAdapter`** (do uruchomienia wyłącznie po ewentualnym uzyskaniu oficjalnych tokenów od `kontakt@patronite.pl` w zmiennych środowiskowych) oraz **`PatroniteBrowserDraftAdapter`** (wyłączony domyślnie; wyłącznie dla dedykowanej roli **Moderatora** sekcji „Posty” na Patronite bez dostępu finansowego, po osobnej akceptacji L0).
2. **Środowisko i zero kosztów (`ZERO COST`):**
   - Node.js `v24.13.0` + natywny silnik **`node:sqlite`** (baza transakcyjna `patronite/state/patronite.sqlite`).
   - Lokalny `sharp` + wektorowy SVG z osadzonymi fontami systemowymi (`Segoe UI` / `Arial`) + lokalne fotografie ekosystemu CC oraz autorskie szablony **„DOBRO, KTÓRE TWORZYMY RAZEM”**.
   - Kanoniczny tekst Pisma Świętego: lokalna baza **UBG-2025** (`data/bible/szukaj-ubg.json` oraz `data/werset_dnia_365_ubg.json`) — zero płatnych wywołań LLM lub zewnętrznych API graficznych.
3. **Separacja produkcji i testów (`SAFE DEPLOY`):**
   - Katalog roboczy `patronite/` (baza SQLite, logi audytowe, szkice, kod produkcyjny) jest twardo wykluczony z paczki wdrożeniowej `.pages-release` przez `scripts/cc-release-files.mjs`.
   - Publicznie dostępny wyłącznie w trybie przeglądowym (`noindex, nofollow, noarchive`) pozostaje katalog testowy `test/patronite/` (`https://polskieradio.cc/test/patronite`).

---

## 2. Architektura 10 niezależnych modułów (`patronite/src/`)

| Moduł | Rola | Plik |
|---|---|---|
| **Scheduler & Kill-Switch** | Strefa `Europe/Warsaw` (odporna na zmianę czasu CET/CEST), okno przygotowawcze `-2h`, blokada przed-szabatowa | `patronite/src/scheduler.mjs` |
| **State & Audit DB** | Transakcyjny SQLite (`jobs`, `evidence_registry`, `published_archive`, `audit_log`, `system_flags`), redakcja sekretów | `patronite/src/db.mjs` |
| **Collector** | Odczyt wyłącznie autoryzowanych źródeł (`polskieradio.cc`, `catalog.json`, `biblia-audio`, `ecosystem-map`, git, JOMA) | `patronite/src/collector.mjs` |
| **Evidence Validator** | Klasyfikacja `ZREALIZOWANE / W TRAKCIE / PLANOWANE / NIEPOTWIERDZONE`, walidacja cytatów z Biblii UBG | `patronite/src/evidence-validator.mjs` |
| **Editorial Planner** | Selekcja tematu wg 6 kryteriów + kontrola duplikatów 30 dni (SQLite + token Jaccard) | `patronite/src/editorial-planner.mjs` |
| **Text Writer** | Generowanie autentycznych polskich tekstów wg `cc-human-voice` i 28 Zasad Wiary | `patronite/src/text-writer.mjs` |
| **Visual Director** | Warstwowy render SVG+Sharp do dokładnie `1068×630 PNG` + wariantu `1080×1080 PNG` | `patronite/src/visual-director.mjs` |
| **Quality Guardian** | 12 twardych bramek krytycznych (jeden `FAIL` = twarda blokada publikacji, brak średniej punktowej) | `patronite/src/quality-guardian.mjs` |
| **Publisher & Verifier** | Granice uprawnień (brak finansów/DM/progów), obsługa błędów API/sesji, retry idempotentny, read-back | `patronite/src/publisher.mjs`, `verifier.mjs` |
| **Reporter & Pipeline** | Zapis raportów cyklu, podsumowań tygodniowych, eksportu `/test/patronite` oraz wpisów `skrzynka/` | `patronite/src/reporter.mjs`, `pipeline.mjs` |

---

## 3. Instrukcja obsługi (CLI)

Wszystkie komendy uruchamiaj z katalogu głównego repozytorium (`C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc`):

- **Symulacja pełnych 2 tygodni (6 kolejnych cykli: Pon/Śr/Pt × 2, bez publikacji na żywo):**
  ```powershell
  npm.cmd run patronite:simulate
  ```
- **Podgląd bieżącego stanu i wyłącznika awaryjnego:**
  ```powershell
  npm.cmd run patronite:status
  ```
- **Natychmiastowe wstrzymanie automatyzacji (Kill-Switch ON):**
  ```powershell
  npm.cmd run patronite:pause
  ```
- **Wznowienie automatyzacji (Kill-Switch OFF):**
  ```powershell
  npm.cmd run patronite:resume
  ```
- **Uruchomienie pełnego zestawu testów automatycznych (`node:test`):**
  ```powershell
  npm.cmd run test:patronite
  ```

---

## 4. Procedura odzyskiwania po awarii (Disaster Recovery)

1. **Wygaśnięta sesja / błąd `401 SESSION_EXPIRED`:**
   - System natychmiast zatrzymuje publikację ze statusem `WSTRZYMANO`, zapisuje incydent w `audit_log` i raport w `patronite/reports/` — nigdy nie ponawia próby logowania na ślepo i nie obchodzi 2FA/CAPTCHA.
   - Operator wznawia sesję ręcznie w panelu Moderatora Patronite lub odnawia token w bezpiecznym magazynie środowiskowym, a następnie uruchamia ponowną weryfikację cyklu.
2. **Niedostępność platformy lub częściowy sukces (`503 API_UNAVAILABLE` / timeout weryfikacji):**
   - Każdy cykl ma unikalny deterministyczny `job_id` (`PAT-YYYYMMDD-<seria>`).
   - Przy ponowieniu `publisher.mjs` najpierw sprawdza `verifier.mjs` po `job_id` / `remote_post_id`: jeśli post powstał po stronie Patronite mimo timeoutu, system odzyskuje jego URL zamiast tworzyć duplikat.
3. **Błąd kontroli jakości (`BLOCKED` w `Quality Guardian`):**
   - Publikacja jest wstrzymywana (zero publikacji niezweryfikowanych treści pod presją harmonogramu). Powód blokady trafia do `patronite/logs/audit.jsonl` oraz `patronite/reports/`.
4. **Wyłączenie awaryjne w 1 sekundę:**
   - `npm.cmd run patronite:pause` (zapisuje `kill_switch = "1"` w SQLite) lub ustawienie `"killSwitch": true` w `patronite/config.json`.
