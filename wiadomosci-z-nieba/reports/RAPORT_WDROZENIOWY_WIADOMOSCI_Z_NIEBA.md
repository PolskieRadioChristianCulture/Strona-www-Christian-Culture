# RAPORT WDROŻENIOWY: WIADOMOŚCI Z NIEBA (`@wiadomosci_z_nieba`)

```yaml
projekt: Jezus Chrystus — Wiadomości z nieba (@wiadomosci_z_nieba)
agent: Antigravity
repozytorium: C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc
produkcja_url: NIEWDROZONE (docelowo https://polskieradio.cc/lumina-profile.html?u=wiadomosci_z_nieba)
staging_url: /test/wiadomosci-z-nieba/ (lokalnie zweryfikowane Playwright HTTP; czeka na L0 przed deployem)
commit_sha: LOKALNY_COMMIT_PO_TESTACH (podany w JOMA_HANDOFFS.md i Skrzynce KONIEC)
zakres: awatar 512x512 PNG/WebP bez tła + silnik wiadomosci-z-nieba/ + podgląd test/wiadomosci-z-nieba/ + testy Zero-QA
testy: test:wzn 12/12 PASS; 365/365 wersetow UBG PASS; cc-release-files 5/5 PASS; test:guardian 0 naruszen; test:mobile-premium 25/25 PASS; test:cc-regression uruchomiony po finalnych zmianach; Playwright 1440/390/360 PASS
ryzyka: Przed aktywacją produkcji wymagane dodanie rekordu danych profilu dla lumina-profile.html?u=wiadomosci_z_nieba, rezerwacja slugu w firestore.rules przez subagenta firestore-rules-author oraz zatwierdzenie harmonogramu 07:00 Europe/Warsaw
rollback: npm.cmd run wzn:pause (natychmiastowy kill_switch w SQLite) oraz git revert <SHA>
status: TESTING
akceptacja_wlasciciela: BRAK
zatwierdzony_sha: BRAK
wdrozenie_czas_utc: BRAK
```

---

## 1. Wynik symulacji 10 kolejnych dni (`2026-11-23` .. `2026-12-02`)

Każdy wpis został wygenerowany lokalnie w trybie `TEST_SIMULATION`, zweryfikowany krzyżowo z kanonicznym tekstem UBG (`data/bible/*.json`), sprawdzony pod kątem licencji (`CC BY-ND 4.0`) oraz zatwierdzony przez 10/10 bramek teologicznych:

| Dzień | Data (`Europe/Warsaw`) | Dzień roku | Werset (`UBG-2025`) | Dobrany temat z katalogu 10 obszarów | Bramka teologiczna | ID dokumentu (`lumina_posts` schema) |
|---|---|---|---|---|---|---|
| 1 | `2026-11-23` | 327 | Księga Przysłów 14,12 | Trudne decyzje — Boże prowadzenie i mądrość | **10/10 PASS** | `wzn_post_2026-11-23` |
| 2 | `2026-11-24` | 328 | Księga Przysłów 16,9 | Trudne decyzje — Boże prowadzenie i mądrość | **10/10 PASS** | `wzn_post_2026-11-24` |
| 3 | `2026-11-25` | 329 | Księga Przysłów 16,18 | Relacje — miłość, pojednanie i przebaczenie | **10/10 PASS** | `wzn_post_2026-11-25` |
| 4 | `2026-11-26` | 330 | Księga Przysłów 19,21 | Niepokój — zaufanie i Boży pokój | **10/10 PASS** | `wzn_post_2026-11-26` |
| 5 | `2026-11-27` | 331 | Księga Przysłów 20,24 | Trudne decyzje — Boże prowadzenie i mądrość | **10/10 PASS** | `wzn_post_2026-11-27` |
| 6 | `2026-11-28` | 332 | Księga Przysłów 24,16 | Brak nadziei — nowy początek | **10/10 PASS** | `wzn_post_2026-11-28` |
| 7 | `2026-11-29` | 333 | Księga Przysłów 28,13 | Poczucie winy — przebaczenie i łaska | **10/10 PASS** | `wzn_post_2026-11-29` |
| 8 | `2026-11-30` | 334 | Księga Izajasza 7,14 | Samotność — Bóg pamięta o człowieku | **10/10 PASS** | `wzn_post_2026-11-30` |
| 9 | `2026-12-01` | 335 | Księga Izajasza 12,2 | Strach — odwaga i Boża obecność | **10/10 PASS** | `wzn_post_2026-12-01` |
| 10 | `2026-12-02` | 336 | Księga Izajasza 25,8 | Brak nadziei — nowy początek | **10/10 PASS** | `wzn_post_2026-12-02` |

- Dodatkowa pełna kontrola wszystkich **365/365** wersetów w `data/werset_dnia_365_ubg.json`: **365 PASS, 0 FAIL** (wszystkie przechodzą weryfikację UBG, skład 5-elementowy oraz bramkę teologiczną 10/10).
- Próba podwójnego uruchomienia w dniu 1 (`2026-11-23`): zablokowana poprawnie (`SKIPPED_DUPLICATE`, `duplicates_blocked_count = 1`).
- Próba awarii źródła wersetów: zatrzymana fail-closed (`BLOCKED_SOURCE`), zero wpisów w `drafts/`, wygenerowany alert nadzoru.

---

## 2. Awatar przezroczysty (`images/lumina/wiadomosci-z-nieba-avatar.*`)

- Przetworzony z oryginalnego wizerunku przesłanego przez Dowódcę przez wykrycie geometrii złotego pierścienia i gładką maskę kołową w `wiadomosci-z-nieba/src/build-avatar.mjs` (`sharp`).
- PNG RGBA: `512 × 512 px`, 4 rogi `alpha === 0`, środek `alpha === 255`.
- WebP RGBA: `512 × 512 px`, rozmiar `78 822 B` (`< 100 KB`).
- Zweryfikowany wzrokowo zarówno w motywie ciemnym (`Obsidian`), jak i jasnym (`Porcelana`) bez czarnych narożników i bez zniekształcenia obręczy.

---

## 3. Plan aktywacji produkcyjnej (dopiero po decyzji L0 `ZATWIERDZAM`)

1. Rejestracja kanonicznego rekordu danych `@wiadomosci_z_nieba` dla `lumina-profile.html?u=wiadomosci_z_nieba` (zgodnie z Regułą Nadrzędną Profili LUMINA — **bez tworzenia osobnego pliku HTML**) oraz włączenie wpisu w produkcyjnym strumieniu `lumina_posts`.
2. Zastrzeżenie slugu `'wiadomosci_z_nieba'` w `isReservedSlug` w `firestore.rules` poprzez wyspecjalizowanego subagenta `firestore-rules-author`.
3. Włączenie harmonogramu `07:00 Europe/Warsaw` (`wiadomosci-z-nieba/state/openbot-schedule-proposal.json` ➔ `enabled: true` i przełączenie `config.json` z `TEST_SIMULATION` na `PRODUCTION_LIVE` z kontem `server_admin`), z utrzymaniem twardej blokady jakichkolwiek niezamówionych wiadomości prywatnych (wyłącznie dobrowolny opt-in z wypisaniem).
4. Synchronizacja do `.pages-release`, wdrożenie przez `scripts/safe_pages_deploy.mjs`, aktualizacja `@m` (`data/ecosystem-map.json`) i indeksu wyszukiwarki `@w`.

---

## 4. Plan wycofania (Rollback)

- Natychmiastowe zatrzymanie publikacji: `npm.cmd run wzn:pause` (`kill_switch = 1` w SQLite).
- Cofnięcie kodu w Git: `git revert <COMMIT_SHA>`.
