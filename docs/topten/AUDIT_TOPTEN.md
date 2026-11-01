# AUDIT_TOPTEN — stan przed wdrożeniem naturalnej rywalizacji

Data: 2026-11-01 · Wykonawca: @007 (Claude Code) · Spec: `TOPTEN_REGULAMIN_NATURALNA_RYWALIZACJA_WDROZENIE_ANTIGRAVITY_CLAUDE.md` §13

## 1. Infrastruktura (sprawdzona, nie zakładana)
| Element | Stan |
|---|---|
| Repozytorium | `polskieradio.cc` (remote: origin + lumina-repo), gałąź `main` |
| Hosting | Cloudflare Pages (projekt `polskieradio`), worker `_worker.js` w trybie zaawansowanym |
| Router API | `_worker.js` → `services/topten/topten-service.js` (`/api/topten/*`), strona utworu `/topTEN/utwor/*`, SEO `/topTEN/`, mapa `/sitemaps/topten.xml` |
| Baza | Cloudflare D1 `topten-db` (0d572992-dbe0-443f-9146-aa60b35dd058, EEUR, plan darmowy), binding `topten_db`, migracje `migrations/topten/` |
| Logowanie | Firebase `lumina-cc` (Google), weryfikacja tokenu w workerze; głos wymaga `email_verified` |
| Harmonogram | **Brak** crona dla topTEN. PM2 na komputerze L0 nie jest niezawodnym schedulerem produkcyjnym (zależy od włączonego PC). |
| Maile | Gmail SMTP (sekrety `GMAIL_RADIO_PASS`/`GMAIL_CCTV_PASS`) |
| Push | Web Push VAPID (sekret `TOPTEN_VAPID_JWK`) |

## 2. Model punktów — stan faktyczny (01.11.2026, przed zmianą)
- LubięTO +777: 1×/dobę Europe/Warsaw na użytkownika i utwór — atomowy `INSERT…SELECT` + `UNIQUE(user,track,local_date,action,slot)`.
- PodbijTO +77: maks. 7×/dobę, odstęp ≥60 min — ten sam mechanizm (slot 1..7), test wyścigu 50 żądań.
- Idempotencja: `Idempotency-Key` → `idempotency_key UNIQUE`.
- Punkty LIVE: `SUM(points)` z `topten_events` (append-only, wyzwalacz blokuje DELETE) dla `cycle_id` (poniedziałek Europe/Warsaw); `review_status='held'|'void'` wyłącza głos z punktów.
- Archiwum notowań: liczone w locie z `topten_events` — **brak niezmiennych snapshotów, brak statusu tygodnia, brak wersji korekt**.
- Remisy (stare): głosujący (dowolna akcja) → LubięTO → wcześniejszy wynik → data utworu. **Różni się od §6 spec** (unikalni głosujący LubięTO, na końcu id).
- Brak puli 30, Poczekalni, kolejki debiutów, archiwum utworów, powrotów, wyróżnień, punktów wszech czasów.
- Opublikowana nominacja wchodzi do rankingu **natychmiast** (spec: czeka do poniedziałku).

## 3. Dane produkcyjne (odczyt 01.11.2026 ~17:00)
| | |
|---|---|
| utwory | 1 (opublikowany: CC-TT-2026-0001) |
| nominacje | 2 (0001 opublikowana, 0002 test @007 odrzucony) |
| zdarzenia głosów | 4, 1 słuchacz, wszystkie w tygodniu 2026-10-26 |
| obserwujący / push | 1 / 1 |

Głosy mają serwerowy czas i tydzień → zgodnie z §22 **można je wiarygodnie przenieść** (nie trzeba „wyników sprzed regulaminu”). Migracja niczego nie przelicza wstecz: historia zostaje w `topten_events`.

## 4. Przepływ nominacja → publikacja (stan)
Formularz → D1 (`topten_nominations`, Drive tylko w bazie/mailu do redakcji) → panel redakcji (statusy) → „Opublikowane” tworzy `topten_tracks` → YouTube: kanał `@toptenchristianculture`, wideo wgrywa redakcja **ręcznie** (brak automatyzacji uploadu — zgodnie ze spec §21.6). Link Drive nie występuje w publicznym API (test).

## 5. Luki i ryzyka
| Ryzyko | Ocena | Działanie |
|---|---|---|
| Brak schedulera → brak zamknięcia tygodnia | wysokie | leniwe, idempotentne zamknięcie przy pierwszym zapytaniu po pon 00:00 (bez kosztów); opcjonalnie @004 „pinguje” API |
| Koszt odczytów D1 przy wzroście głosów | średnie | cache rankingu 10 s (Cache API); snapshoty zamiast agregacji historii |
| Wyścig przy starcie tygodnia | średnie | blokada wierszem `preparing` + transakcja `batch`; test 20 równoległych zapytań |
| Zmiana czasu (DST) | średnie | granice tygodnia liczone z lokalnej północy Europe/Warsaw → UTC; testy 7d±1h |
| Zmiana remisów w trakcie tygodnia | niskie | nowe remisy tylko przy włączonej fladze; stary tryb bez zmian |
| RODO: retencja zdarzeń | otwarte | wymaga decyzji L0/prawnej (patrz RELEASE_CHECKLIST) |

## 6. Kopia i rollback
Przed migracją zdalną: `wrangler d1 export topten-db --remote --output=<plik poza repo>` (kopia lokalna L0). Migracja 0002 tylko dodaje tabele/kolumny. Rollback: flagi OFF (natychmiast, bez wdrożenia) → szczegóły `ROLLBACK_TOPTEN.md`.

## 7. Szacunek obciążenia (plan darmowy D1: 5 mln odczytów wierszy/dobę)
**Wykryte ryzyko w wersji produkcyjnej sprzed migracji 0002:** ranking LIVE agregował wszystkie głosy tygodnia (oraz poprzedniego) przy każdym przeliczeniu (co 10 s z cache + po każdym głosie). Przy stałym ruchu limit 5 mln odczytów/dobę wyczerpałby się już przy ok. 300–600 głosach/tydzień (≈ 8 640 przeliczeń/dobę × 2 tygodnie × liczba głosów) — po przekroczeniu D1 odrzuca zapytania do końca doby.

**Naprawa (migracja 0002, spec §17):** liczniki inkrementalne `topten_week_totals` aktualizowane wyzwalaczami w tej samej operacji co zapis/zmiana głosu; ranking czyta ≤ kilkadziesiąt wierszy na tydzień niezależnie od liczby głosów. Koszt głosu: kilka odczytów indeksowanych. Rekoncyliacja: `POST /api/topten/admin/totals/{tydzień}/rebuild`; test porównuje liczniki z dziennikiem na 400 losowych operacjach (głosy, wstrzymania, unieważnienia, przywrócenia). Szacunek po zmianie: < 1 mln odczytów/dobę przy 50 000 głosów/tydzień i ciągłym ruchu.
