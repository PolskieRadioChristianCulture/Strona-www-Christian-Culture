# RELEASE_CHECKLIST_TOPTEN — naturalna rywalizacja

Data: 2026-11-01 · @007 · Bramka: spec §23 „Warunki wejścia na produkcję”

## Etap A — wdrożenie kodu z flagami WYŁĄCZONYMI (bez zmiany zasad dla słuchaczy)
- [x] Testy jednostkowe/integracyjne: `scripts/topten-weeks.test.mjs` (16), `scripts/topten-api.test.mjs` (25) — w baterii `test:cc-regression`
- [x] Granice tygodnia i DST (jesień 7d+1h, wiosna 7d−1h, ndz 23:59:59 / pon 00:00:00)
- [x] Liczebność 0, 1, 9, 10, 11, 29, 30, 31; remisy §6; brak rotacji przymusowej (lider 6 tygodni)
- [x] Debiut w środę czeka do poniedziałku; maks. 3/tydzień FIFO; wymiana tylko 28–30, nigdy TOP 10; pula 25+3 bez wypychania
- [x] Powrót po 4 pełnych tygodniach, bez duplikatu, znacznik „return”
- [x] Wyścig 20 zapytań na starcie tygodnia → 1 pula, 1 snapshot; wyścigi głosów (50 równoległych) bez zmian
- [x] Snapshot niezmienny (wyzwalacze), checksum, idempotentne finalize, korekta = nowa wersja z uzasadnieniem
- [x] Głosy wstrzymane → wynik wstępny (`closing`), bez FINAL
- [x] Wstrzymanie prawne: głos 423, brak wideo, audyt
- [x] Publiczne API bez PII / Drive / IP
- [x] Liczniki inkrementalne = dziennik zdarzeń (400 losowych operacji) + rekoncyliacja
- [ ] `npm.cmd run test:guardian`, `test:cc-regression`, `test:mobile-premium` — przed commitem na main
- [ ] Kopia bazy: `npx.cmd wrangler d1 export topten-db --remote --output=C:\Users\czark\Desktop\@ICC\_kopie\topten-db-AAAAMMDD.sql`
- [ ] `npx.cmd wrangler d1 migrations apply topten-db --remote` (0002: tylko dodaje tabele/kolumny/wyzwalacze + liczniki z obecnych głosów)
- [ ] Sprawdzenie: `SELECT * FROM topten_week_totals` = agregacja `topten_events` (te same punkty co ranking LIVE)
- [ ] Wdrożenie Pages; na żywo: ranking jak dotąd (flagi OFF), `/api/topten/weeks/current` → 404 `feature_disabled`
- [ ] **Zgoda L0 na Etap A** (zmienia sposób liczenia „pod spodem” — liczniki; zasady dla słuchaczy bez zmian)

## Etap B — włączenie nowych zasad (decyzja L0)
- [ ] Kontrola redakcyjno-prawna `REGULAMIN_TOPTEN_V1.md` + decyzje z jego nagłówka (pkt 1–6)
- [ ] Ogłoszenie daty startu (spec §10) — banner na /topTEN/ i w kanałach CC
- [ ] Publikacja regulaminu na https://polskieradio.cc/topTEN/regulamin/ (+ kopia `/topTEN/regulamin.html`), SEO z §25 (tytuł, meta description, canonical)
- [ ] W poniedziałek tuż po 00:00 Europe/Warsaw: panel → „Notowanie (nowe zasady)” → włącz `topten_natural_ranking_v1`, następnie `topten_waiting_room_v1`, `topten_archive_v1`
- [ ] Sprawdzenie na żywo: `GET /api/topten/weeks/current` (status open), lista TOP 10, Poczekalnia, kolejka; testowy głos L0
- [ ] (Opcjonalnie) @004: w poniedziałek po 00:00 jedno wywołanie `GET https://polskieradio.cc/api/topten/weeks/current` (idempotentne)
- [ ] Monitoring pierwszego zamknięcia tygodnia: `topten_weeks.status = finalized`, snapshot, wyróżnienia; audyt `week.opened/finalized`

## Etap C — po starcie (P1/P2, poza tym wdrożeniem)
- [ ] Karty/bannery topTEN na muzycznych stronach EkoCC (spec §25 — najpierw audyt mapy EkoCC: radio, Biblia Śpiewana, Śpiewajmy Panu, BiblijneUwielbienie, /music)
- [ ] Grafiki wyróżnień tygodnia do udostępniania (rozszerzenie istniejącej grafiki 1080×1350)
- [ ] OpenAPI YAML dla publicznych endpointów
- [ ] RODO: retencja zdarzeń i procedura usunięcia konta (decyzja L0/prawna)
- [ ] Limit sieciowy (rate limit per konto + sieć) na głosowanie — dziś: limity dzienne per konto + ręczne wstrzymywanie
- [ ] Alert nietypowej liczby głosów (np. > N/h na utwór) do Skrzynki @005
