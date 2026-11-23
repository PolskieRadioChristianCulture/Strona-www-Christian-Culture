# Jezus Chrystus — Wiadomości z nieba (`@wiadomosci_z_nieba`)

Oficjalny, zero-kosztowy moduł redakcyjny **Christian Culture** przeznaczony do codziennej publikacji jednego zweryfikowanego wersetu biblijnego (przekład **UBG-2025**) z krótką, ciepłą refleksją oraz bezpośrednim odnośnikiem do strony **Mój Werset Dnia** (`https://polskieradio.cc/werset-dnia`).

> **Stan wdrożenia:** `TEST_SIMULATION` (`autoPublishEnabled: false`, `productionApprovedByOwner: false`).
> **Środowisko testowe (`noindex, nofollow, noarchive`):** `test/wiadomosci-z-nieba/` (`/test/wiadomosci-z-nieba`).
> **Koszt:** **0,00 zł** (`ZERO COST` — lokalny Node.js, `node:sqlite`, `sharp`, lokalne dane UBG-2025 w repozytorium).

---

## 1. Tożsamość i transparentność profilu (§2)

- **Nazwa widoczna:** Jezus Chrystus
- **Nazwa cyklu:** Wiadomości z nieba
- **Identyfikator:** `@wiadomosci_z_nieba` (docelowy slug danych LUMINA: `wiadomosci_z_nieba`)
- **Kategoria:** Biblia / Inspiracje / Wiara
- **Wydawca:** Christian Culture (**Oficjalny profil tematyczny Christian Culture**)
- **Awatar przezroczysty (512×512):** `images/lumina/wiadomosci-z-nieba-avatar.png` oraz `.webp` (`78,8 KB`)
- **Link główny:** `https://polskieradio.cc/werset-dnia`

Profil jawnie informuje odbiorcę, że jest prowadzony przez **Christian Culture** i prezentuje nauczanie biblijne oraz zweryfikowane wersety Pisma Świętego — nie udaje prywatnego konta Jezusa ani bezpośrednich nowych objawień.

---

## 2. Architektura modułów (`wiadomosci-z-nieba/src/`)

| Moduł | Rola |
|---|---|
| `build-avatar.mjs` | Generuje okrągły awatar `512×512` PNG/WebP z czystą przezroczystością poza złotą obręczą (`sharp`) |
| `db.mjs` | Transakcyjny SQLite (`daily_runs`, `analytics_daily`, `audit_log`, `system_flags`) + redakcja sekretów |
| `verse-source.mjs` | Pobiera werset dnia z `data/werset_dnia_365_ubg.json` (`Europe/Warsaw`) i krzyżowo weryfikuje z `data/bible/*.json` (`UBG` + `CC BY-ND 4.0`). W razie błędu działa **fail-closed** (`BLOCKED_SOURCE`) |
| `theme-catalog.mjs` | Rotacyjny katalog **10 obszarów tematycznych** (§5) z dopasowaniem wynikającym z treści wersetu i rotacją 4 CTA (§3D) |
| `composer.mjs` | Składa 5-elementowy post (Hak, Werset UBG, Refleksja 2–3 zdania, CTA z linkiem, Podpis) zgodny ze schematem `lumina_posts` |
| `theology-guard.mjs` | **10 twardych bramek** bezpieczeństwa teologicznego i jakościowego (1 `FAIL` = blokada publikacji) |
| `scheduler.mjs` | Konfigurowalny harmonogram `07:00 Europe/Warsaw` (CET/CEST) + wyłączona propozycja OpenBot (`opencode/deepseek-v4.1-flash-free`) |
| `publisher.mjs` | `TestSimulationPublisher`, `LuminaTablicaFirestorePublisher` (reuse `lumina_posts`), kontrolowany retry z read-back i twardy zakaz niezamówionych DM/push |
| `pipeline.mjs` | Orkiestrator CLI (`simulate-ten-days`, `run-daily`, `status`, `pause`, `resume`) |

---

## 3. Komendy CLI

Wszystkie polecenia uruchamiaj z katalogu głównego `C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc`:

```powershell
npm.cmd run wzn:simulate   # Symulacja 10 dni + testy duplikatu i fail-closed źródła + eksport do /test/wiadomosci-z-nieba
npm.cmd run test:wzn       # 12 automatycznych testów akceptacyjnych (§11)
npm.cmd run wzn:status     # Podgląd stanu flag, liczników i przebiegów w SQLite
npm.cmd run wzn:pause      # Wyłącznik awaryjny (kill_switch = 1)
npm.cmd run wzn:resume     # Wznowienie po wyłączniku awaryjnym (kill_switch = 0)
```

---

## 4. Izolacja środowiska TEST

- Katalog `wiadomosci-z-nieba/` (kod, stan SQLite, szkice, raporty) jest wykluczony z paczki publicznej `.pages-release` przez `scripts/cc-release-files.mjs`.
- Powierzchnia podglądu `test/wiadomosci-z-nieba/` posiada `<meta name="robots" content="noindex, nofollow, noarchive">` oraz nagłówki `X-Robots-Tag: noindex, nofollow, noarchive` i `Cache-Control: no-cache, no-store, must-revalidate` w `_headers`.
- Produkcja (`lumina_posts`, `lumina_profiles`, `lumina-profile.html`, `firestore.rules`, automatyczna publikacja o `07:00`) pozostaje **nietknięta i nieaktywna** do czasu decyzji L0.
