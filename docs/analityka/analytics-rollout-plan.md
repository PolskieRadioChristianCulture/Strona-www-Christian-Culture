# PLAN WDROŻENIA I COFNIĘCIA (ROLLOUT & ROLLBACK) — CC ANALYTICS MISSION CONTROL 1.0 (`analytics-rollout-plan.md`)

**Data:** 21 listopada 2026  
**Wykonawca:** Antigravity (`@A001`)  
**Tryb:** `ZERO COST / TEST FIRST / APPROVAL REQUIRED`  
**Zasada nadrzędna:** **ŻADNA zmiana nie została wdrożona na środowisko produkcyjne (`polskieradio.cc`) przed wyraźną akceptacją właściciela Christian Culture.**

---

## 1. STATUS WSZYSTKICH ELEMENTÓW DYREKTYWY (OBOWIĄZKOWA KLASYFIKACJA STATUSÓW)

Zgodnie z Sekcją X Dyrektywy każdy element został oznaczony jednym z pięciu statusów (`ZROBIONE` / `TESTOWANE` / `WYMAGA UPRAWNIEŃ` / `WYMAGA AKCEPTACJI` / `ZABLOKOWANE`):

| Element / Zadanie z Dyrektywy | Status | Lokalizacja pliku / Szczegóły |
|---|---|---|
| **Etap A1:** Inwentaryzacja kodu repozytorium (`gtag.js`, GTM, Firebase, SW, OBS, iframe) | **`ZROBIONE`** | `docs/analityka/analytics-audit.md` (`1 801` plików `G-Y4EFTVBPE3`, `223` pliki `G-M24C85RG49`, `0` GTM) |
| **Etap A2:** Kontrola duplikacji i anomalii (`video_progress` spam, dual-tags, fałszywe `video_complete`) | **`ZROBIONE`** | `docs/analityka/analytics-audit.md` (Sekcja 3) |
| **Etap A3:** Audyt jakości ruchu (Polska, USA, Irlandia, Szwecja, centra danych Meta/Azure/GCP/AWS) | **`ZROBIONE`** | `docs/analityka/analytics-audit.md` (Sekcja 4) + odczyt GA4 Data API |
| **Etap II:** Mapa wszystkich 8 usług GA4 + identyfikacja `gen-lang-client-0094354839` (`529214226`) | **`ZROBIONE`** | `docs/analityka/analytics-property-map.md` |
| **Etap II:** Bezpośredni odczyt API z 5 usług GA4 (`518223715`, `529214226`, `522101206`, `534305954`, `526414935`) | **`WYMAGA UPRAWNIEŃ`** | Wymaga dodania `firebase-adminsdk-fbsvc@lumina-cc.iam.gserviceaccount.com` jako **Viewer** w GA4 Admin dla tych 5 usług |
| **Etap B1–B5:** Zunifikowany moduł analityczny `js/cc-analytics.js` v2.0.0 (`window.ccTrack` + `window.CCAnalyticsMC`) | **`TESTOWANE`** | `js/cc-analytics.js` (zbudowany lokalnie, przetestowany w 28 testach automatycznych, **wstrzymany przed deployem na produkcję**) |
| **Etap C1–C3:** Plan zmian administracyjnych w GA4 (6 Key Events, Unwanted Referrals, `chatgpt.com)`, filtr `internal`, retencja 14 mies.) | **`WYMAGA AKCEPTACJI`** | `docs/analityka/analytics-ga4-admin-changes.md` |
| **Etap D:** Diagnoza SEO i ruchu organicznego Google (`biblia interlinearna`, `biblia do pobrania za darmo`) | **`ZROBIONE`** | `docs/analityka/analytics-audit.md` (Sekcja 5) |
| **Etap D:** Bezpośredni odczyt tabel z Google Search Console API (`searchconsole.googleapis.com`) | **`WYMAGA UPRAWNIEŃ`** | Wymaga włączenia `Google Search Console API` w projekcie GCP `413985877183` (`lumina-cc`) i dodania konta serwisowego w GSC |
| **Etap E1–E4:** Prywatny prototyp `/test/analityka` z autoryzacją serwerową (`401`/`403`/`200`), 10 KPI, filtrami i sekcją diagnostyczną | **`TESTOWANE`** | `test/analityka/index.html` + `services/cc-analytics-mc/analytics-mc-service.js` + trasa w `_worker.js` |
| **Etap F:** 20 obowiązkowych scenariuszy testów automatycznych | **`TESTOWANE`** | `tests/cc-analytics-mission-control.test.mjs` (**28/28 PASS**) |
| **Wdrożenie produkcyjne (Git Push + Cloudflare Pages Deploy)** | **`WYMAGA AKCEPTACJI`** | Zgodnie z Sekcją IX pkt 7 wstrzymane do momentu decyzji `GO` od właściciela Christian Culture |

---

## 2. BEZPIECZNY PLAN WDROŻENIA KROK PO KROKU (PO AKCEPTACJI WŁAŚCICIELA)

Wdrożenie zostało podzielone na **4 bezpieczne fazy**, tak aby w żadnym momencie nie utracić ciągłości pomiarów ani nie naruszyć działania radia, telewizji LIVE i Biblii:

### Faza 1: Publikacja środowiska testowego `/test/analityka` oraz modułu `js/cc-analytics.js` v2.0 (Zero ryzyka dla obecnych raportów)
1. Ponieważ `js/cc-analytics.js` v2.0 zachowuje **100% kompatybilności wstecznej** z dotychczasowymi zdarzeniami (`radio_play`, `audio_play`, `lesson_view`, `donate_click`, `contact_click`, `share`, `search`, `select_content`, `polonia_engagement`), istniejące raporty w GA4 będą działać bez żadnej przerwy.
2. Nowe zdarzenia (`radio_pause`, `radio_stop`, `radio_listen_60s`, `radio_listen_300s`, `audio_complete`, `tv_watch_60s`, `tv_watch_300s`, `tv_channel_change`, `bible_*`, `lesson_start`, `lesson_complete`, `course_progress`, `support_copy_account`) zaczną spływać do usługi `548623550` obok dotychczasowych.
3. Środowisko `/test/analityka` jest chronione nagłówkiem `X-Robots-Tag: noindex, nofollow, noarchive` oraz weryfikacją tokenu Google/Firebase po stronie serwera (`nazirczarkes@gmail.com`).

### Faza 2: Odblokowanie uprawnień tylko-do-odczytu (Read-Only IAM) przez Właściciela (Zero zmian w danych historycznych)
1. Włączenie **Google Search Console API** oraz **Google Analytics Admin API** w projekcie GCP `413985877183` (`lumina-cc`):
   - `https://console.developers.google.com/apis/api/searchconsole.googleapis.com/overview?project=413985877183`
   - `https://console.developers.google.com/apis/api/analyticsadmin.googleapis.com/overview?project=413985877183`
2. Dodanie konta serwisowego `firebase-adminsdk-fbsvc@lumina-cc.iam.gserviceaccount.com` jako **Przeglądający (Viewer)** w 5 usługach GA4 (`518223715`, `529214226`, `522101206`, `534305954`, `526414935`) oraz jako użytkownik **Ograniczony (Restricted)** w Google Search Console dla `sc-domain:polskieradio.cc`.

### Faza 3: Konfiguracja administracyjna w GA4 (`548623550`) w trybie testowym
1. Dodanie listy niechcianych odesłań (*Unwanted Referrals*): `polskieradio.cc`, `polskieradio.pages.dev`, `cclite.pl`, `accounts.google.com`, `lumina-cc.firebaseapp.com`.
2. Ustawienie retencji danych o zdarzeniach na **14 miesięcy** i wyłączenie Google Signals.
3. Włączenie filtrów `Internal Traffic` (`traffic_type = internal`) oraz `Technical & Automated Monitoring` (`traffic_type = technical_monitor`) najpierw w trybie **Testowanie (Testing)** na 7 dni, a dopiero po weryfikacji wymiaru *Nazwa filtra danych testowych* przełączenie na **Aktywny (Active)**.
4. Oznaczenie 6 zweryfikowanych zdarzeń (`radio_listen_300s`, `tv_watch_300s`, `bible_audio_complete`, `lesson_complete`, `support_form_submit`, `donation_complete`) jako **Najważniejsze zdarzenia (Key Events)**.

### Faza 4: Porządkowanie duplikacji tagów `G-M24C85RG49` / `G-9M92G6S27M` (Opcjonalnie, po decyzji Właściciela)
1. Dopisanie kanonicznego fragmentu `G-Y4EFTVBPE3` + `/js/cc-analytics.js` do 17 stron społecznościowych LUMINA (`lumina-tablica.html`, `lumina-profile.html` itd.), które obecnie wysyłają dane wyłącznie do usługi `550097091`, przy jednoczesnym zachowaniu `G-M24C85RG49` w okresie przejściowym (lub pozostawieniu `G-Y4EFTVBPE3` jako jedynego kanonicznego tagu w całym ekosystemie).

---

## 3. PLAN NATYCHMIASTOWEGO COFNIĘCIA ZMIAN (ROLLBACK PLAN — ZERO UTRATY DANYCH)

Każda wprowadzona zmiana w kodzie jest w 100% odwracalna w czasie poniżej 60 sekund bez utraty jakichkolwiek danych historycznych w Google Analytics 4:

1. **Cofnięcie modułu `js/cc-analytics.js` do wersji v1 (`2026-10-26`):**
   ```powershell
   cd "C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc"
   git checkout HEAD -- js/cc-analytics.js
   ```
2. **Wyłączenie trasy `/test/analityka` i `/api/analytics-mc`:**
   ```powershell
   cd "C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc"
   git checkout HEAD -- _worker.js
   Remove-Item -Recurse -Force test/analityka, services/cc-analytics-mc, tests/cc-analytics-mission-control.test.mjs
   ```
3. **Cofnięcie zmian w GA4 Admin:**
   - Odznaczenie przełącznika *Key Event* przy dowolnym zdarzeniu w GA4 Admin działa natychmiastowo i nie usuwa samych zdarzeń z historii.
   - Przełączenie filtra danych z *Aktywny* na *Nieaktywny* lub *Testowanie* natychmiast przywraca pełny strumień surowych zdarzeń.
   - Żadne historyczne dane w GA4 ani w Google Search Console nie zostały i nie zostaną usunięte.
