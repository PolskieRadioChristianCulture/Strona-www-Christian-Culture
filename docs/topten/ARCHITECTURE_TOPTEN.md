# ARCHITECTURE_TOPTEN — naturalna rywalizacja (rules `natural-v1`)

Data: 2026-11-01 · @007 · Spec: §14–§20 · Kod: `services/topten/topten-weeks.js`, `services/topten/topten-service.js`, migracja `migrations/topten/0002_naturalna_rywalizacja.sql`

## 1. Dane (D1, SQLite)
```
topten_tracks ──< topten_week_roster >── topten_weeks ──< topten_week_standings (snapshot, wersje, niezmienne)
     │  pool_status: active | queued | archived | suspended        └──< topten_awards (niezmienne)
     │  queued_at, queue_entry: debut | return
     ├──< topten_events (append-only, źródło prawdy) ──trigger──> topten_week_totals (liczniki inkrementalne)
     ├──< topten_roster_transitions (append-only: carryover | new_debut_slot | return | displaced_by_debut | legacy_bootstrap)
     └──  topten_song_archive (archived_at_week, eligible_from_week)
topten_flags: topten_natural_ranking_v1 | topten_waiting_room_v1 | topten_archive_v1 (domyślnie 0)
topten_audit_log (append-only): week.opened/finalized/corrected, flag.on/off, song.rights_hold/release, song.return_queued, totals.rebuilt …
```
Mapowanie na model spec §14: Song = `topten_tracks` (+ `rights`: `status`/`pool_status`), Nomination = `topten_nominations`, ChartWeek = `topten_weeks`, WeekRoster = `topten_week_roster`, VoteEvent = `topten_events`, WeekStanding = `topten_week_totals` (LIVE) + `topten_week_standings` (FINAL), Award = `topten_awards`, RosterTransition = `topten_roster_transitions`, SongArchiveStatus = `topten_song_archive`, AuditLog = `topten_audit_log`.

## 2. Cykl życia tygodnia
```
(pierwsze zapytanie po pon 00:00 Europe/Warsaw)
ensureWeek ── INSERT weeks(status='preparing') ──► zwycięzca blokady
   │                                              ├─ finalizeWeek(poprzedni, jeśli 'open')
   │                                              │     ├─ głosy 'held' → status 'closing' (wynik wstępny, bez FINAL)
   │                                              │     └─ snapshot v1 + wyróżnienia + checksum (batch) → 'finalized'
   │                                              ├─ planRoster(poprzedni → bieżący)
   │                                              └─ batch: roster + przejścia + archiwum + status 'open'
   └─ przegrani blokady → czytają tydzień ('preparing' → UI „Startuje nowe notowanie”, głos 503)
porzucona blokada > 2 min → przejęcie
korekta: admin finalize {correction, reason} → snapshot vN+1, status 'corrected' (stare wersje zostają)
```
**Bez crona (ZERO COST).** Zamknięcie następuje przy pierwszym zapytaniu (strona, API, podgląd linku, mapa strony). Gdy przez cały tydzień nie ma ruchu, nie ma też głosów, więc wynik jest kompletny. @004 może dodatkowo wywołać `GET /api/topten/weeks/current` w poniedziałek po 00:00 (idempotentne), żeby zamknięcie nastąpiło od razu.

## 3. Algorytm puli (spec §5, §16)
1. Kolejka = opublikowane `queued`, FIFO (`queued_at`, `id`); powrót tylko gdy `eligible_from_week ≤ tydzień`.
2. `wanted = min(3, |kolejka|)`, `free = 30 − |utrzymane|`, `fill = min(wanted, free)`.
3. `replace = min(wanted − fill, |utrzymane z miejsc > 10|)` — wymiana najniższych miejsc poprzedniego tygodnia, **nigdy TOP 10**.
4. Wypchnięte → `archived`, `eligible_from_week = tydzień + 4 tygodnie` (4 pełne zamknięte tygodnie po opuszczeniu puli).
5. Pierwszy tydzień po włączeniu flagi (`legacy_bootstrap`): obecne utwory w kolejności poprzedniego tygodnia, maks. 30; nadmiar → kolejka.
6. Utwór `suspended` zostaje w puli (zajmuje miejsce), ale nie przyjmuje głosów i nie ma publicznego wideo; zwolnienie miejsca = decyzja redakcji (takedown/withdrawn).

## 4. Remisy (spec §6)
`punkty ↓ → unikalni głosujący LubięTO ↓ → liczba LubięTO ↓ → last_at ↑ (wcześniejsze osiągnięcie wyniku) → id ↑`. Ten sam porządek w LIVE i w snapshocie.

## 5. Głosowanie (bez zmian limitów)
LubięTO +777 1×/dobę, PodbijTO +77 maks. 7×/dobę co ≥60 min, idempotencja, atomowy `INSERT…SELECT`. Przy włączonej fladze warunek puli (`EXISTS roster … pool_status='active'`) jest **w tej samej instrukcji** co zapis → głos z granicy tygodnia nie trafi do utworu spoza puli. Błędy: 409 `not_in_roster`, 423 `suspended`, 503 `week_preparing`.

## 6. API (dopasowane do istniejącego routera — bez duplikatów)
| Spec §18 | Implementacja |
|---|---|
| GET weeks/current | `GET /api/topten/weeks/current` → week{id, weekStart, weekEnd, status, isProvisional, rulesVersion}, votingEligibility, serverNow |
| GET weeks/{id}/standings?scope | `GET /api/topten/weeks/{id}/standings?scope=top10\|waiting\|all` (official + rankingVersion + checksum) |
| GET weeks/{id}/awards | `GET /api/topten/weeks/{id}/awards` |
| GET weeks/{id}/archive | `GET /api/topten/charts?cycle={id}` (snapshot, gdy istnieje) + `GET /api/topten/archive` (archiwum utworów) |
| GET songs/{id}/history | `GET /api/topten/songs/{id}/history` (tygodnie, allTimePoints, bestRank) |
| GET debuts/queue | `GET /api/topten/debuts/queue` |
| POST votes/like, votes/boost | **bez zmian:** `POST /api/topten/tracks/{id}/like\|boost` (Idempotency-Key) |
| POST nominations | bez zmian: `POST /api/topten/nominations` |
| POST admin/weeks/{id}/finalize | `POST /api/topten/admin/weeks/{id}/finalize` {correction?, reason?} |
| POST admin/weeks/{id}/publish | nie osobno — FINAL publikuje się w chwili zamknięcia; „publish” wyniku wstępnego = finalize po weryfikacji |
| POST admin/songs/{id}/rights-hold | `POST /api/topten/admin/songs/{id}/rights-hold` {hold, reason} |
| POST admin/roster/preview-next | `POST /api/topten/admin/roster/preview-next` (dry-run) |
| — | `GET/POST /api/topten/admin/flags` (potwierdzenie `confirm` = nazwa flagi), `POST /api/topten/admin/songs/{id}/return`, `POST /api/topten/admin/totals/{id}/rebuild` |

Publiczne GET: bez PII, bez ID kont, bez IP, bez linków Drive (test). Nowe publiczne GET zwracają 404 `feature_disabled`, dopóki flaga jest wyłączona. OpenAPI: tabela powyżej jest kontraktem; plik OpenAPI YAML do przygotowania przed publiczną dokumentacją API (RELEASE_CHECKLIST).

## 7. Interfejs
Flaga OFF → widok jak dotąd. Flaga ON → TOP 10 („● NA ŻYWO · wynik wstępny”), Poczekalnia 11–30 (flaga waiting room), „Wkrótce w notowaniach” (kolejka), „Ostatnie notowanie” + wyróżnienia, archiwum utworów (flaga archive), „–” zamiast miejsc do pierwszego głosu, znaczniki DEBIUT / WIELKI POWRÓT / ZAWIESZONE. Panel redakcji: zakładka „Notowanie (nowe zasady)”.

## 8. Odstępstwa od pseudokodu spec (świadome)
1. **Brak crona** — leniwe zamknięcie (patrz §2); spełnia idempotencję i ZERO COST.
2. **Wynik wstępny nie blokuje nowego tygodnia:** gdy poprzedni tydzień czeka na weryfikację głosów (`closing`), pula nowego tygodnia powstaje z kolejności wstępnej, a oficjalny snapshot publikuje redakcja po weryfikacji. Spec §16 zakłada `assert FINALIZED`, ale to wstrzymałoby głosowanie do czasu ręcznej decyzji.
3. **Włączenie flagi w środku tygodnia** tworzy pulę od razu (bootstrap), a kolejka wypełnia wolne miejsca w tym samym tygodniu. Zalecenie: włączać w poniedziałek tuż po 00:00 (RELEASE_CHECKLIST).
4. **Największy awans** porównuje z oficjalnym snapshotem bezpośrednio poprzedniego tygodnia.
5. **Rekord tygodnia** jest przyznawany tylko wtedy, gdy istnieją wcześniejsze snapshoty (pierwszy tydzień nie „bije rekordu”).

## Decyzje L0 z 01.11.2026 (Etap B — wykonany tego samego dnia)
- Tydzień notowania: **niedziela 20:00 → niedziela 20:00** Europe/Warsaw (zamiast pon 00:00). Implementacja: `CYCLE_CLOSE_HOUR = 20` w `topten-service.js` (`warsawClock` liczy tydzień z czasu przesuniętego o +4 h; doba dla limitów głosów pozostaje kalendarzowa); `weekBounds` = niedziela 20:00 → niedziela 20:00. Zmiana czasu (niedziela nad ranem) nie dotyka granicy — testy dla 60 kolejnych tygodni.
- Reklamacje: **polskiercctv@gmail.com** (regulamin §11).
- RODO: odesłanie do istniejącej Polityki prywatności (/privacy#topten); okres retencji zdarzeń głosowania — do uzupełnienia w polityce.
- Zgoda L0 na Etap B: publikacja regulaminu V1 i włączenie wszystkich flag 01.11.2026 przed 20:00; przepis przejściowy — notowanie od 26.10 zamyka się 1.11 o 20:00 jako pierwsze oficjalne.