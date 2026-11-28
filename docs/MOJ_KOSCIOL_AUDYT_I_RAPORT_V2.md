# Audyt Etapu 1 & Raport Wdrożeniowy: Śpiewnik „Śpiewajmy Panu” + Mój kościół v2.0 (Scrolluj Biblię)

**Data:** 2026-11-28 | **Branch:** `feat/moj-kosciol-spiewnik-v2` (izolowany worktree `_wt_moj_kosciol_v2`)
**Status publikacji:** **ŚRODOWISKO TESTOWE / BRANCH ROBOCZY — NIE WDROŻONO NA PRODUKCJĘ BEZ ODBIORU L0**

---

## 1. Etap 1 — Audyt istniejącej infrastruktury, praw i kosztów

| Obszar | Stan zastany w repozytorium `polskieradio.cc` / `Lumina-Web-App` | Decyzja architektoniczna (ZERO duplikacji) |
|---|---|---|
| **Hosting & Routing** | Cloudflare Pages (`.pages-release`) + `_worker.js` (Advanced Mode) | Nowe API pod `/api/moj-kosciol/v1/*`, pilot pod `/test/sba/moj-kosciol/` (`X-Robots-Tag: noindex, nofollow, noarchive`), śpiewnik pod `/spiewnik-biblijny/`. `scripts/cc-release-files.mjs` już dopuszcza `test/sba/`. |
| **Tożsamość i sesja** | Firebase Auth (`lumina-cc`), weryfikacja JWT `verifyFirebaseIdToken(token)` w `_worker.js` | Ponowne użycie `verifyFirebaseIdToken` przekazywanego przez DI do `handleMojKosciolApi` — bez osobnego systemu kont. |
| **Baza danych** | Cloudflare D1 (`milion_db`, `mission_control_db`, `bu_votes_db`, `topten_db`, `AI_COST_DB`) | Schemat SQLite/D1 w `migrations/moj-kosciol/0001_init.sql` (21 tabel, izolacja `church_id`, klucze obce, audyt) + deterministyczny store DEMO do testów zero-cost. |
| **Limity infrastruktury (Free Tier)** | Cloudflare Pages: maks. 25 MB / plik, 20 000 plików; Workers: 100 000 żądań/dzień; D1: 5 mln odczytów/dzień, 100 tys. zapisów/dzień, 5 GB | Polling LIVE z `ETag` / `304 Not Modified` i backoffem (8s → 60s) minimalizuje zużycie. Przy dużej skali (>100 zborów równocześnie LIVE) potrzebny będzie płatny plan Workers/Durable Objects — **nie obiecujemy bezpłatnej infrastruktury przy dowolnej skali**. |
| **Koszt wdrożenia** | **0 zł / mies.** (brak nowych usług płatnych) | Zgodność z **ZERO COST FIRST**. |
| **Biblia & Głębokie Studium** | UBG-2025 (`data/bible/ubg-2025/`), `mojabiblia-bridge.js`, `/sba`, `/sba/studium/` | Bezpośrednie linki klikane do `/mojabiblia` i `/sba/studium/?ref=...&translation=UBG`. |
| **CC Connect 2.0, MCP, LumiMes** | `plugin-registry.js`, `mcp-server.js`, `chat-service.js`, `components/cc-global-chat-button.js` | Dodano 3 wtyczki: `spiewajmy-panu`, `cc.my-church` oraz niezależną `cc.sabbath-school` + 13 nowych narzędzi MCP działających **bez modelu AI**. |

---

## 2. Audyt licencji i blokad prawnych (Rozróżnienie: Działające / DEMO / Blokady)

| Zasób | Status prawny | Sposób wdrożenia |
|---|---|---|
| **Śpiewnik „Śpiewajmy Panu” — 57 pieśni historycznych (np. Kochanowski, Neander, Rinkart)** | ✅ **Domena publiczna** (`cc-spiewajmy-panu-public-domain`) | Pełny tekst + metadane dozwolone publicznie wszędzie. |
| **Śpiewnik „Śpiewajmy Panu” — 643 pieśni z polskimi tłumaczeniami XX w.** | ⚠️ **BLOKADA LICENCYJNA przed szeroką publiczną redystrybucją** (`kads-spiewajmy-panu-review`, źródło: `muzycy.adwent.pl`) | W `/test/sba/moj-kosciol/` i MCP `cc_church_get_hymn_metadata`: **ściśle TYLKO metadane (numer, tytuł, tonacja, kategoria) + legalny link `https://muzycy.adwent.pl/`**. Pełny zbiór z Dysku Google Dowódcy (`data/spiewajmy-panu.json`) dostępny w `/spiewnik-biblijny/` i wbudowanym oknie SBA na gałęzi roboczej — **wymaga decyzji L0 / potwierdzenia z Wydawnictwem Znaki Czasu przed publicznym wdrożeniem tekstów objętych prawem autorskim**. |
| **30 nagrań MP3 Christian Culture (Dysk Google `L:\`)** | ✅ **Własne nagrania studyjne CC** (`cc-studio-recording-owner`) | Skopiowane jako `audio/spiewajmy-panu/sp-NNN.mp3` (każdy plik < 8 MB, łącznie ~138 MB). |
| **Szkoła Sobotnia PL/EN (`adwent.pl`, `absg.sspmadventist.org`, `adventech.io`)** | ⚠️ **Etap A (Linki + Metadane)** (`ss-stage-a-links-only`) | Kod Adventech ma licencję MIT, ale **treści lekcji są chronione prawem autorskim GC SSPM / KADS**. Import pełnych tekstów lekcji jest **twardo zablokowany w kodzie** (`403 LICENSE_FULL_IMPORT_BLOCKED`) do czasu pisemnej zgody (Etap B). |
| **Dane zborów (Warszawa Centrum DEMO, Kraków DEMO)** | 🧪 **DANE DEMO** | Wyraźnie oznaczone plakietką `DEMO` oraz notą: *„Nie sugeruje oficjalnego partnerstwa KADS bez zgody”*. |

---

## 3. Instrukcja dla Prowadzącego LIVE i Skarbnika

### Prowadzący LIVE (`owner` / `admin` / `live_leader`)
1. Otwórz zakładkę **Więcej → Panel Prowadzącego LIVE**.
2. Używaj przycisków **Start → Dalej / Pomiń / Wstecz / Pauza / Wznów / Zakończ** — zegar nigdy nie przełącza punktów automatycznie za Ciebie.
3. Aby dodać spontaniczny werset kaznodziei, wpisz referencję (np. `J 3:16`) i kliknij **+ Dodaj werset do bieżącego punktu**.
4. Konflikty równoczesnej edycji z dwóch urządzeń są bezpiecznie odrzucane (`409 Conflict`) — po odświeżeniu pobierany jest aktualny snapshot.

### Skarbnik (`owner` / `treasurer` — rola oddzielona od edytora agendy)
1. Edytor agendy i prowadzący LIVE nie mają dostępu do kont bankowych (`403 Forbidden`).
2. Wprowadzenie lub zmiana numeru IBAN/NRB przechodzi walidację sumy kontrolnej `mod-97` (z jawnym ostrzeżeniem, że suma kontrolna nie potwierdza właściciela konta) i **natychmiast ukrywa rachunek z widoku publicznego** (`pending_second_approval`).
3. Dopiero **druga, niezależna uprawniona osoba** (np. właściciel/starszy zboru po potwierdzeniu oficjalnym kanałem) zatwierdza rachunek — każde zdarzenie trafia do `AuditLog`.
4. Christian Culture **nie przyjmuje, nie przekazuje ani nie ewidencjonuje żadnych wpłat zborowych**.

---

## 4. Plan wycofania (Rollback)

1. Całość znajduje się na izolowanej gałęzi `feat/moj-kosciol-spiewnik-v2` — gałąź `main` pozostaje nienaruszona do momentu odbioru przez Dowódcę.
2. Po ewentualnym włączeniu testowym: szybki rollback przez `git revert <commit>` lub wyłączenie tras `/api/moj-kosciol/v1` i `/test/sba/moj-kosciol/` w `_worker.js`. Żadne istniejące tabele D1 ani kanały nadawcze live nie zostały naruszone.
