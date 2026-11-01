# ROLLBACK_TOPTEN — naturalna rywalizacja

Data: 2026-11-01 · @007

## Poziom 1 — wyłączenie nowych zasad (natychmiast, bez wdrożenia)
Panel redakcji → „Notowanie (nowe zasady)” → wyłącz `topten_natural_ranking_v1` (wpisz nazwę flagi jako potwierdzenie).
Albo: `npx.cmd wrangler d1 execute topten-db --remote --command "UPDATE topten_flags SET enabled = 0"`.
Skutek: ranking wraca do trybu sprzed zmian (wszystkie utwory `published` + `pool_status='active'`). Utwory w kolejce/archiwum
nie pokazują się w starym trybie — aby je przywrócić: `UPDATE topten_tracks SET pool_status = 'active' WHERE pool_status IN ('queued','archived')`.
Snapshoty, wyróżnienia i pule zostają w bazie (historia nienaruszona) i wrócą po ponownym włączeniu.

## Poziom 2 — powrót do poprzedniego kodu
Cloudflare Pages → poprzednie wdrożenie (Deployments → Rollback) albo `git revert <commit>` + wdrożenie standardową procedurą.
Migracja 0002 jest wstecznie zgodna: poprzedni kod nie odwołuje się do nowych tabel; kolumny `pool_status/queued_at/queue_entry`
mają wartości domyślne. **Uwaga:** kod sprzed 0002 liczy ranking bez liczników (wraca ryzyko limitu D1 — AUDIT §7).

## Poziom 3 — usunięcie struktur (tylko na wyraźne polecenie L0; historia przepada)
Nie zalecane. Wymaga kopii (`wrangler d1 export`) i ręcznego `DROP TRIGGER`/`DROP TABLE` dla obiektów z 0002 (wyzwalacze
niezmienności blokują DELETE na snapshotach — najpierw `DROP TRIGGER topten_standings_no_delete` itd.). Głosy (`topten_events`) nietknięte.

## Korekta błędnego wyniku tygodnia (zamiast rollbacku)
`POST /api/topten/admin/weeks/{tydzień}/finalize {"correction": true, "reason": "…"}` → nowa wersja snapshotu, status `corrected`,
poprzednia wersja zostaje w archiwum. Błędne liczniki: `POST /api/topten/admin/totals/{tydzień}/rebuild` (przebudowa z dziennika zdarzeń).
