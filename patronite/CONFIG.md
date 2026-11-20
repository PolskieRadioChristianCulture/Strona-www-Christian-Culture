# CONFIG.md — Konfiguracja harmonogramu, integracji @ICC i bezpieczeństwa

## 1. Strefa czasowa i reguła szabatowa (`Europe/Warsaw`)
- Wszystkie obliczenia dat używają natywnego `Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw' })`, co automatycznie obsługuje przejścia **CET (`+01:00`) ↔ CEST (`+02:00`)** w ostatnią niedzielę marca i października bez ręcznych poprawek.
- Domyślny rytm publikacji:
  - **Poniedziałek `09:00`** (`DZIENNIK MISJI`, widoczność: `PUBLICZNY`)
  - **Środa `18:00`** (`ZA KULISAMI CHRISTIAN CULTURE`, widoczność: `PUBLICZNY`)
  - **Piątek `10:00`** (`DZIĘKI, ŻE JESTEŚ`, widoczność: `PUBLICZNY`)
- **Okno przygotowawcze:** zadania zbierania źródeł, redakcji i grafiki uruchamiane są minimum **2 godziny wcześniej** (Pon `07:00`, Śr `16:00`, Pt `08:00`).
- **Ochrona szabatu:** w piątki każda publikacja oraz zadanie wymagające akceptacji lub interwencji człowieka musi zakończyć się najpóźniej do `14:30 Europe/Warsaw`. Późniejsze sloty piątkowe oraz sloty sobotnie przed zachodem słońca są twardo odrzucane przez `scheduler.mjs`.

## 2. Integracja z harmonogramem `@ICC` (bez drugiego równoległego crona)
- Po uzyskaniu zgody L0 na uruchomienie produkcyjne automatyzacja nie uruchamia osobnego, drugiego demona cron obok istniejącej infrastruktury `@ICC` (`OpenBot` + `Agent-Cron` PM2 + Kalendarz `@ccMC`).
- Gotowy, wyłączony deskryptor rejestracji do istniejącego mechanizmu znajduje się w `patronite/state/openbot-schedule-proposal.json` (model darmowy `opencode/deepseek-v4.1-flash-free` / lokalny skrypt Node bez płatnego LLM).
- Dopóki właściciel nie zatwierdzi przejścia z trybu `test_simulation` na produkcję, flaga `productionApprovedByOwner` wynosi `false`.

## 3. Uprawnienia i izolacja sekretów
- Żadne hasła, ciasteczka sesyjne ani klucze API nie mogą znajdować się w repozytorium Git ani w plikach `logs/`, `reports/`, `drafts/` czy `SKRZYNKA`.
- Ewentualny token oficjalnego zamkniętego API Patronite odczytywany jest wyłącznie z zmiennej środowiskowej `PATRONITE_API_TOKEN` i automatycznie maskowany w dziennikach audytowych `db.mjs`.
- Moduł publikujący blokuje programowo próby wykonania niedozwolonych operacji (`read_patron_finances`, `send_private_message`, `modify_tiers`, `modify_account_settings`).
