# RAPORT AUDYTU ANALITYKI — CC ANALYTICS MISSION CONTROL 1.0 (`analytics-audit.md`)

**Data audytu:** 21 listopada 2026  
**Wykonawca:** Antigravity (`@A001`) / agenci techniczni `@ICC`  
**Zleceniodawca:** Christian Culture (Dowódca Nazir — Cezary Rogowski)  
**Tryb:** `ZERO COST / TEST FIRST / APPROVAL REQUIRED`  
**Środowisko testowe:** `https://polskieradio.cc/test/analityka`  
**Status dokumentu:** `ZROBIONE / TESTOWANE` (w oparciu o bezpośredni odczyt GA4 Data API i pełny skan repozytorium)

---

## 1. ODPOWIEDZI NA 7 PYTAŃ MISYJNYCH (NA PODSTAWIE ZWERYFIKOWANYCH DANYCH GA4 DATA API)

Wszystkie liczby w poniższym podsumowaniu pochodzą z bezpośredniego zapytania do **Google Analytics Data API v1beta** dla głównej usługi **`548623550`** (`G-Y4EFTVBPE3`, strumień `15383676066`) za okres ostatnich 30 pełnych dni (**22.10.2026 – 20.11.2026**), strefa czasowa `Europe/Warsaw`:

1. **Ilu rzeczywistych odbiorców dociera do Christian Culture?**
   - W ostatnich 30 dniach usługa `548623550` zarejestrowała **1 521 aktywnych użytkowników** (`2 630` sesji, `6 814` wyświetleń, `1 380` sesji zaangażowanych — `52,47%`).
   - Po odjęciu zidentyfikowanego ruchu z centrów danych / prefetcherów w USA (`~650` jednorazowych wizyt z serwerowni Prineville, Des Moines, Forest City, Council Bluffs, Fort Worth, Ashburn, Boydton, Flint Hill), w Dublinie (`75` wizyt) i w Luleå (`75` wizyt) oraz ruchu sztabowego/emisyjnego z Ostrowca Świętokrzyskiego (`~140` identyfikatorów przeglądarek / `739` sesji), **rzeczywista baza autentycznych odbiorców zewnętrznych w ostatnich 30 dniach wynosi ok. 580–650 unikalnych osób**, generujących ponad **1 150 zaangażowanych sesji** ze średnim czasem trwania **3,5 – 13,5 minuty**.
2. **Które kanały radiowe i telewizyjne są rzeczywiście odtwarzane?**
   - **Radio (`/player` + belka główna `/`):** `536` zdarzeń `radio_play` wywołanych przez **123 unikalnych użytkowników** (głównie na `/player` — `163` starty od `44` użytkowników, na `/` — `112` startów od `49` użytkowników oraz na `/zapolske-live` — `108` startów od `24` użytkowników).
   - **Telewizja LIVE i Biblia Śpiewana:**
     - `/master-live`: `342` odsłony, **110 użytkowników**, `202` zaangażowane sesje (`95,3%` zaangażowania, śr. `3 min 48 s`).
     - `/biblia-spiewana-live` (+ `.html`): `270` odsłon, **68 użytkowników**, `121` zaangażowanych sesji (`92,4%`, śr. `13 min 22 s`), `657` zdarzeń `audio_play`.
     - `/zapolske-live` (+ `.html`): `195` odsłon, **45 użytkowników**, `100` zaangażowanych sesji (`96,2%`, śr. `2 min 36 s`).
     - `/SpiritualSounds/tv/`: `63` odsłony, **35 użytkowników**, `29` zaangażowanych sesji (`74,4%`, śr. `44 min 22 s`).
     - `/spiewajmy-panu-live`: `197` odsłon, **28 użytkowników**, `79` zaangażowanych sesji (`98,8%`, śr. `43 min 29 s`).
     - `/studium-live`: `124` odsłony, **26 użytkowników**, `43` zaangażowane sesje (`91,5%`, śr. `14 min 06 s`).
     - `/apokalipsa-ksiega-nadziei-live`: `73` odsłony, **24 użytkowników**, `47` zaangażowanych sesji (`92,2%`, śr. `7 min 36 s`).
3. **Jak długo użytkownicy słuchają, oglądają i czytają?**
   - Średni czas sesji w Polsce wynosi **13 min 22 s** (`802,18 s`), w Niemczech **7 min 59 s** (`478,88 s`), w Austrii **5 min 18 s** (`318,43 s`), a dla ruchu z Google Organic **4 min 03 s** (`242,92 s`).
   - Najdłuższy czas zaangażowania notują kanały muzyczno-modlitewne (`/SpiritualSounds/tv/` — śr. `44,4 min`, `/spiewajmy-panu-live` — śr. `43,5 min`, `/biblia-spiewana-live` — śr. `14,1 min`), słuchowiska `/biblia-audio/` (śr. `3 min 49 s`, `88,5%` zaangażowania) oraz lekcje Kursu Codziennego (np. `/akademia/kurscodzienny/dzien-50` — śr. `5 min 32 s`).
4. **Które materiały biblijne i programy prowadzą do dalszego zaangażowania?**
   - **MojaBiblia (`/mojabiblia`):** `230` odsłon, `76` użytkowników, aż **87,5% sesji zaangażowanych**.
   - **Akademia i Kurs Codzienny (`/akademia`, `/akademia/kurscodzienny/dzien-*`):** `344` zdarzenia `lesson_view` wywołane przez **146 unikalnych użytkowników** (bardzo wysoka retencja czytelników między kolejnymi dniami kursu `dzien-32` do `dzien-51`).
   - **Biblia Audio (`/biblia-audio/`):** `134` odsłony, `43` użytkowników, **88,5% sesji zaangażowanych**.
   - **Uniwersalna Wyszukiwarka (`@w` `/wyszukiwarka`):** `467` odsłon, `66` użytkowników, `62` zapytania `search` i `35` kliknięć w wyniki `select_content`.
5. **Skąd odbiorcy przychodzą i dlaczego opuszczają portal?**
   - **Główne kanały pozyskania (30 dni):**
     1. `Direct` (`1 331` sesji, `765` użytk., `45,8%` zaangażowania) — obejmuje wejścia bezpośrednie, brak tagów UTM w linkach WhatsApp oraz ruch botów z serwerowni USA.
     2. `Organic Social` (`697` sesji łącznie z `m.facebook.com`, `facebook.com`, `lm.facebook.com`, `l.facebook.com`, `christianculture7.wordpress.com`, `t.co`) — rzeczywiste wejścia z `l.facebook.com` mają śr. czas `13 min 05 s` (`76,1%` zaangażowania), natomiast w `m.facebook.com` (`246` sesji, śr. `16,4 s`) około połowę stanowią automatyczne skanery Meta z Prineville/Forest City/Dublina/Luleå.
     3. `Organic Search` (`243` sesje: `241` Google + `2` Bing, `132` użytk., **63,9% zaangażowania**, śr. `4 min 03 s`).
     4. `AI Assistant` (`128` sesji `chatgpt.com / ai-assistant` + `79` błędnie otagowanych sesji `chatgpt.com)` w `Unassigned` = `207` sesji, wywołanych głównie przez zespół z Ostrowca Świętokrzyskiego i Wrocławia).
     5. `Organic Video` (`70` sesji z `youtube.com / referral`, `60,0%` zaangażowania, śr. `6 min 10 s`).
6. **Jakie działania wspierają realizację misji?**
   - Podstrony wsparcia (`/wspieraj` — `83` odsłony, `43` użytk.; `/pomogebomoge` — `35` odsłon, `29` użytk.) wygenerowały **49 zdarzeń `support_view`**, **30 kliknięć `donate_click`** (od `14` unikalnych użytkowników) oraz **11 wyborów metody wsparcia `support_method_select`**.
7. **Czy automatyczne systemy zniekształcają statystyki?**
   - **TAK — potwierdzono trzy źródła zniekształceń:**
     1. **Skanery i prefetchery centrów danych (USA, Dublin, Luleå):** W tygodniu 14–20 XI spowodowały pozorny skok sesji z `552` do `994` przy jednoczesnym spadku udziału sesji zaangażowanych z `57,1%` do `46,8%`.
     2. **Inflacja zdarzeń `video_progress` na kanałach LIVE:** `3 730` zdarzeń `video_progress` wygenerowało zaledwie `35` użytkowników (na `/spiewajmy-panu-live` `2` użytkowników wygenerowało `2 287` zdarzeń!).
     3. **Ruch deweloperski i podglądowy:** `41` sesji z `localhost`, `10` z `127.0.0.1`, `14` z `ml.test`/`tvw.test` oraz `20` z `*.polskieradio.pages.dev` trafiło do głównego strumienia `15383676066`.

---

## 2. ETAP A1 — INWENTARYZACJA KODU REPOZYTORIUM

Przeskanowano pełne repozytorium `polskieradio.cc` (`2 035` plików HTML oraz wszystkie skrypty `.js`/`.mjs`/`.ts`):

| Mechanizm / Element | Wynik skanu repozytorium | Status / Diagnoza |
|---|---|---|
| **Google tag (`gtag.js`) — `G-Y4EFTVBPE3`** | Obecny w **1 801 plikach** HTML/JS | Główny tag usługi `548623550` (strumień `15383676066`). |
| **Google tag (`gtag.js`) — `G-M24C85RG49`** | Obecny w **223 plikach** (17 profili/stron LUMINA + 201 zbudowanych bundli `assets/*-index-*.js` portali CCN + `vod.html` + `werset-dnia.html`) | Tag usługi `550097091` (Lumina, strumień `15444169939`). Powoduje rozszczepienie lub duplikację pomiaru. |
| **Google tag (`gtag.js`) — `G-9M92G6S27M`** | Obecny w **2 plikach** (`uslugi.html`, `uslugi/index.html`) obok `G-Y4EFTVBPE3` | Dodatkowy tag na stronie usług. |
| **Firebase config `measurementId: G-6440T9VBQB`** | Obecny w **21 plikach** (`dist/assets/main-*.js`, `firebase-messaging-sw.js`, `lumina-db.js`) | Historyczny identyfikator z konfiguracji SDK Firebase. |
| **Google Tag Manager (`GTM-*`)** | **0 plików** | Ekosystem nie używa kontenera GTM — wszystkie zdarzenia idą bezpośrednio przez `gtag.js`. Brak duplikacji GTM vs `gtag`. |
| **Measurement Protocol (server-side)** | **0 aktywnych wywołań** w `_worker.js` | Cały pomiar odbywa się po stronie klienta (`transport_type: 'beacon'`). |
| **Moduł `js/cc-analytics.js`** | Podpięty w **1 763 plikach HTML** | Centralny skrypt przechwytujący `HTMLMediaElement.prototype.play`, `navigator.share`, kliknięcia wsparcia/kontaktu i wyszukiwarkę `@w`. |
| **Osobne moduły zgody (`40DM/analytics.js`, `the-journal/analytics.js`, `js/cc-search-consent.js`)** | 3 dedykowane moduły opt-in | Stosują `window['ga-disable-G-Y4EFTVBPE3'] = true` oraz `gtag('consent', 'default', { analytics_storage: 'denied' })` do czasu wyraźnej zgody. |
| **Service Workery (`firebase-messaging-sw.js`, `go/sw.js`, `portals/kultura/sw.js`)** | 12 plików rejestrujących/obsługujących SW | Service Workery nie wykonują ani nie przechwytują żądań do `google-analytics.com/g/collect`. |
| **Integracje OBS i parametry reżyserskie** | `scripts/apply-ga-internal-traffic.mjs` | Wykrywa `window.obsstudio`, `?in_mcr=1` oraz `?cc_team=1` i dodaje `traffic_type: 'internal'`. |

### Mapa: Adres URL → Komponent → ID GA4 → Zdarzenie → Źródło wysłania → Cel analityczny

| Adres URL / Sekcja | Komponent / Skrypt | ID GA4 | Zdarzenia wysyłane | Źródło wysłania | Cel analityczny |
|---|---|---|---|---|---|
| `/*` (1 763 strony z kanonicznym snippetem) | Inline `<head>` + `js/cc-analytics.js` | `G-Y4EFTVBPE3` (`548623550`) | `page_view`, `scroll`, `user_engagement`, `session_start`, `first_visit` | `gtag('config', 'G-Y4EFTVBPE3')` | Pomiar zasięgu, sesji i zaangażowania |
| `/`, `/player`, kanały z belką radia | `js/cc-analytics.js` (`HTMLMediaElement.prototype.play`) | `G-Y4EFTVBPE3` | `radio_play`, `radio_pause` (v2), `radio_stop` (v2), `radio_listen_60s` (v2), `radio_listen_300s` (v2), `audio_error` (v2) | Hook na `<audio>` (strumienie `zeno.fm` / `duration === Infinity`) | Rzeczywisty odsłuch radia i utrzymanie słuchacza (60s / 5 min) |
| `/biblia-audio/`, `/biblia-spiewana-live`, `/Ewangelia` | `js/cc-analytics.js` + `js/cc-universal-tts.js` | `G-Y4EFTVBPE3` | `audio_play`, `audio_complete` (v2), `bible_audio_start` (v2), `bible_audio_complete` (v2) | Hook na `<audio>` (pliki `.mp3`) + `CCAnalyticsMC` | Pomiar słuchania Pisma Świętego i słuchowisk |
| `/mojabiblia` | `js/cc-analytics.js` (`CCAnalyticsMC`) | `G-Y4EFTVBPE3` | `bible_chapter_open`, `bible_translation_select`, `bible_search`, `bible_bookmark_add` | `window.CCAnalyticsMC.trackBible*` | Studium Biblii Interlinearnej bez naruszania prywatności notatek |
| `/master-live`, `/spiewajmy-panu-live`, `/tvw-women-live`, `/studium-live`, `/zapolske-live`, `/SpiritualSounds/tv/` | Osadzone YouTube IFrame (Enhanced Measurement) + `js/cc-analytics.js` | `G-Y4EFTVBPE3` | `video_start`, `video_progress`, `tv_watch_60s` (v2), `tv_watch_300s` (v2), `tv_channel_change` (v2), `video_error` (v2) | `gtag.js` YouTube listener + `CCAnalyticsMC` | Rzeczywisty czas oglądania telewizji LIVE bez fałszywego `video_complete` |
| `/akademia`, `/akademia/<kurs>/dzien-XX`, `/kursy/<kurs>/lekcja-XX` | `js/cc-analytics.js` | `G-Y4EFTVBPE3` | `course_open` (v2), `lesson_view`, `lesson_start` (v2), `lesson_complete` (v2), `course_progress` (v2) | Dopasowanie ścieżki URL + weryfikacja scrolla `>=80%` i czasu `>=30s` | Rozróżnienie samego wejścia w lekcję od jej faktycznego przestudiowania |
| `/wspieraj`, `/pomogebomoge`, stopki wsparcia | `js/cc-analytics.js` + `wspieraj.html` | `G-Y4EFTVBPE3` | `support_view`, `support_method_select`, `donate_click`, `support_copy_account` (v2), `support_form_submit` (v2), `donation_complete` (v2 — zablokowane bez weryfikacji) | Delegacja kliknięć `document.addEventListener('click')` | Mierzenie intencji wsparcia bez mylenia kliknięcia z wpłatą |
| `/wyszukiwarka` oraz modal `Ctrl+K` (`#ccOmniInput`) | `js/cc-analytics.js` + `components/cc-omni-search.js` | `G-Y4EFTVBPE3` | `search` (debounce `1500ms`), `select_content` (`content_type: 'search_result'`) | Zdarzenia `input`, `keydown(Enter)`, `click(#ccOmniBody a)` | Jakość wyszukiwarki `@w` z blokadą PII (e-mail / telefon) |
| `/lumina`, `/mess`, `/tablica`, `/lumina-profile` | Inline `<head>` + `lumina-db.js` | `G-M24C85RG49` (`550097091`) oraz na `lumina.html` także `G-Y4EFTVBPE3` | `page_view`, `login`, `lumina_login_completed` | `gtag('config', 'G-M24C85RG49')` + `lumina-db.js` | Aktywność społecznościowa LUMINA |
| `/werset-dnia`, `/vod` | Inline `<head>` | `G-Y4EFTVBPE3` + `G-M24C85RG49` (duplikacja dwóch usług) | `page_view`, `verse_generated`, `verse_saved` | Podwójny `gtag('config')` | Werset Dnia i Kino VOD |

---

## 3. ETAP A2 — KONTROLA DUPLIKACJI I ANOMALII POMIAROWYCH

1. **Podwójne tagowanie w plikach HTML (8 plików):**
   - `lumina.html`, `vod.html`, `werset-dnia.html`, `werset-dnia/index.html` ładują jednocześnie `G-M24C85RG49` (`550097091`) i `G-Y4EFTVBPE3` (`548623550`).
   - `uslugi.html` i `uslugi/index.html` ładują jednocześnie `G-9M92G6S27M` i `G-Y4EFTVBPE3`.
   - **Skutek:** Każde zdarzenie na tych stronach jest wysyłane do dwóch różnych usług GA4.
2. **Inflacja `video_progress` i `video_start` na kanałach LIVE (`3 730` zdarzeń od `35` użytkowników):**
   - Na `/spiewajmy-panu-live` `2` użytkowników wygenerowało `2 287` zdarzeń `video_progress`, a `7` użytkowników `606` zdarzeń `video_start`.
   - **Przyczyna:** Automatyczne śledzenie wideo (Enhanced Measurement) w `gtag.js` oraz pętle auto-wznawiania iframe YouTube przy wielogodzinnym odtwarzaniu strumienia 24/7 wysyłają dziesiątki zdarzeń w jednej sesji.
3. **Fałszywe `video_complete` na kanałach transmisji LIVE (`15` zdarzeń):**
   - Zarejestrowano `6` zdarzeń `video_complete` na `/studium-live`, `5` na `/spiewajmy-panu-live` i `4` na `/apokalipsa-live`.
   - **Rozwiązanie wdrożone w `js/cc-analytics.js` v2.0:** Bezwzględna blokada `audio_complete` i `video_complete` dla każdego elementu z `isLive === true` lub `duration === Infinity`.
4. **Rozszczepienie ścieżek URL z `.html` i bez `.html`:**
   - W GA4 widnieją osobno `/zapolske-live` (`165` odsłon) i `/zapolske-live.html` (`30` odsłon), `/biblia-spiewana-live` (`242`) i `/biblia-spiewana-live.html` (`28`), `/wyszukiwarka` (`424`) i `/wyszukiwarka/` (`43`).

---

## 4. ETAP A3 — AUDYT JAKOŚCI RUCHU (POLSKA, USA, IRLANDIA, SZWECJA, CENTRA DANYCH)

Zgodnie z dyrektywą nie klasyfikowano botów wyłącznie na podstawie kraju — przeanalizowano krzyżowo: **miasto + źródło/medium + podstrony + system operacyjny + przeglądarkę + czas zaangażowania + stosunek sesji do użytkowników**:

| Lokalizacja (Kraj / Miasto) | Użytkownicy (30d) | Sesje (30d) | Sesje / Użytk. | Zaangażowanie | Śr. czas sesji | Klasyfikacja jakości ruchu | Dowód techniczny z GA4 Data API |
|---|---:|---:|---:|---:|---:|---|---|
| **Polska — Warszawa, Wrocław, Poznań, Kraków, Katowice, Gdańsk, Lublin** | ~361 | ~746 | **2,07** | **59,8%** | **210 – 813 s** | **POTWIERDZENI ODBIORCY** | Wielokrotne powroty, przeglądanie wielu podstron (`2,3 – 3,5` strony/sesję), realny odsłuch radia i czytanie lekcji. |
| **Polska — Ostrowiec Świętokrzyski** | 140 | 739 | **5,28** | **66,0%** | **1 353,4 s (22,5 min)** | **RUCH TECHNICZNY / ZESPÓŁ / EMISJA** | Główna siedziba redakcji i komputerów emisyjnych (m.in. większość sesji `chatgpt.com / ai-assistant`, testy `/test/*`, `/mapa`, `/stream-scene`). |
| **Niemcy, Wielka Brytania, Holandia, Austria** | 79 | 175 | **2,22** | **54,3%** | **104 – 479 s** | **POTWIERDZENI ODBIORCY (POLONIA)** | Wysoka powracalność, realne czasy słuchania (Niemcy śr. `7 min 59 s`, Austria `5 min 18 s`). |
| **USA — Prineville (OR), Forest City (NC), Fort Worth (TX), Altoona (IA)** | 265 | 266 | **1,004** | 46–57% | **13,7 – 15,9 s** | **RUCH PODEJRZANY / CENTRA DANYCH META** | Lokalizacje głównych serwerowni **Meta (Facebook)** w USA. Źródło: `facebook.com / referral` i `m.facebook.com / referral`. Powstają, gdy serwery Meta z włączonym JS pobierają podgląd linku po publikacji posta na FB. |
| **USA — Des Moines (IA), Boydton (VA), Flint Hill (VA)** | 138 | 138 | **1,000** | **17,8 – 19,5%** | **3,2 – 3,6 s** | **AUTOMATYCZNY SKANER CHMUROWY (AZURE)** | Lokalizacje serwerowni **Microsoft Azure**. W GA4 widnieje identyczny ślad: po dokładnie `6` lub `2` odpytań `Direct` na te same `11` adresów URL (`/`, `/akademia`, `/audioteka`, `/biblia-audio/`, `/master-live`, `/milion`, `/mojabiblia`, `/player`, `/pomogebomoge`, `/topTEN/`, `/wspieraj`, `/wyszukiwarka`) z czasem `0–5 s`. |
| **USA — Council Bluffs (IA), Ashburn (VA), Boardman (OR), Moses Lake (WA)** | 115 | 115 | **1,000** | **7,7 – 21,4%** | **3,1 – 6,9 s** | **RUCH PODEJRZANY / SERWEROWNIE GCP & AWS** | Serwerownie **Google Cloud** (Council Bluffs) i **AWS** (Ashburn, Boardman). Pojedyncze wejścia `Direct` na `/` (np. Windows Edge z Council Bluffs `33` razy po `6,5 s`). |
| **Irlandia — Dublin** | 75 | 76 | **1,013** | 52,6% | **19,5 s** | **MIESZANY: SERWEROWNIA EU-WEST + POLONIA** | Zdecydowana większość to węzeł chmurowy Meta/AWS w Dublinie (`m.facebook.com / referral` na `/` i `/werset-dnia`, śr. `5–7 s`). |
| **Szwecja — Luleå vs Sollentuna** | 75 (Luleå) / 1 (Sollentuna) | 75 / 14 | **1,00** vs **14,00** | 44,0% vs **64,3%** | **13,4 s** vs **172,0 s** | **ROZDZIELONO: LULEÅ = META DC / SOLLENTUNA = ODBIORCA** | Doskonały dowód, dlaczego nie wolno blokować całych krajów: **Luleå** to europejska serwerownia Meta (`75` jednorazowych wejść z FB po `8–13 s`), podczas gdy **Sollentuna** (`14` sesji od `1` użytkownika, śr. `2 min 52 s`) to autentyczny słuchacz Polonii w Szwecji. |

---

## 5. ETAP D — SEO I GOOGLE SEARCH CONSOLE

### 5.1. Status techniczny Google Search Console API
- Sprawdzono połączenie z `https://www.googleapis.com/webmasters/v3/sites` przy użyciu wszystkich 3 kluczy serwisowych (`lumina-cc`, `cc-mission-control`, `cuda-398c0`).
- **Wynik:** HTTP `403 PERMISSION_DENIED` (`reason: SERVICE_DISABLED` — `Google Search Console API has not been used in project 413985877183 before or it is disabled`).
- Zgodnie z zakazem symulowania danych (Etap E4), żadne fikcyjne liczby kliknięć GSC nie zostały wygenerowane. Aby odblokować bezpośredni pobór tabel z GSC API do `/test/analityka`:
  1. Włączyć `Google Search Console API` w projekcie GCP `413985877183` (`lumina-cc`).
  2. W panelu Google Search Console dla domeny `sc-domain:polskieradio.cc` dodać adres `firebase-adminsdk-fbsvc@lumina-cc.iam.gserviceaccount.com` z uprawnieniem **Ograniczone (Restricted / Read-only)**.

### 5.2. Analiza ruchu organicznego z wyszukiwarek (GA4 Organic Search — 30 dni)
W ostatnich 30 dniach kanał `Organic Search` w usłudze `548623550` wygenerował **243 sesje** (`241` Google Organic + `2` Bing Organic) od **132 użytkowników**, z bardzo wysokim wskaźnikiem zaangażowania **63,90%** i średnim czasem sesji **4 min 03 s** (`242,92 s`):

| Sekcja / Strona wejścia (`landingPagePlusQueryString`) | Sesje Organic | Użytkownicy | Sesje zaangażowane | Śr. czas sesji |
|---|---:|---:|---:|---:|
| `/` (Strona Główna & Radio) | 162 | 98 | 126 (77,8%) | 2 min 18 s |
| `/player` (Odtwarzacz Radio CC) | 22 | 14 | 16 (72,7%) | 7 min 12 s |
| `/biblia-do-pobrania` | 13 | 12 | 10 (76,9%) | 2 min 38 s |
| `/news/kryzys-infrastrukturalny-blackout-72-godziny-rodzina-roztropnosc` | 8 | 8 | 7 (87,5%) | 3 min 01 s |
| `/topTEN/` | 8 | 3 | 8 (100%) | 6 min 14 s |
| `/milion` | 8 | 1 | 2 (25,0%) | 3 min 18 s |
| `/codzienne-uwielbienie-live?muted=1&mute=1&in_mcr=1` | 6 | 1 | 6 (100%) | 31 s |
| `/RozwiążProblem` | 5 | 2 | 5 (100%) | 16 s |
| `/mojabiblia?book=MAT&ch=1&mode=interlinear&chapter=1` | 2 | 1 | 1 (50,0%) | 2 min 00 s |
| `/akademia/apokalipsa/lekcja-22` | 2 | 2 | 1 (50,0%) | 1 min 27 s |

### 5.3. Diagnoza 3 priorytetowych zapytań biblijnych
1. **`biblia do pobrania za darmo` (`/biblia-do-pobrania`):**
   - **Stan obecny:** Najlepiej konwertująca podstrona biblijna w wyszukiwarce Google (`13` sesji organicznych, `76,9%` zaangażowania, śr. czas `2 min 38 s`, `15` zdarzeń `file_download`).
   - **Rekomendacja SEO/CRO:** Dodać nad linią zgięcia bezpośrednie odnośniki do czytania online w `/mojabiblia` (Tryb Czytnik UBG) oraz słuchania w `/biblia-audio/`, aby użytkownik pobierający plik PDF/EPUB zostawał na portalu.
2. **`biblia interlinearna` oraz `biblia interlinearna online` (`/mojabiblia`):**
   - **Stan obecny:** Podstrona `/mojabiblia` ma bardzo wysokie zaangażowanie wśród użytkowników portalu (`230` odsłon, `87,5%` sesji zaangażowanych), ale z wyszukiwarki Google pozyskała tylko `2` sesje (i to na niekanoniczny URL z parametrami `?book=MAT&ch=1&mode=interlinear&chapter=1`).
   - **Przyczyna techniczna:** Cały tekst biblijny, kody Stronga i słownik grecko-hebrajski w `/mojabiblia` są ładowane dynamicznie przez JavaScript po stronie klienta (CSR). Ponadto w parametrach URL używane są naprzemiennie `ch=1` i `chapter=1`, co rozprasza sygnał kanoniczny.
   - **Rekomendacja SEO:** Wprowadzić statyczny blok wprowadzający SSR/HTML na `/mojabiblia` z wyraźnymi nagłówkami `H1`/`H2` zawierającymi frazy *„Biblia Interlinearna Online — Grecko-Polska i Hebrajsko-Polska z kodami Stronga (UBG / BW / BT / BG)”*, ujednolicić `<link rel="canonical" href="https://polskieradio.cc/mojabiblia">` oraz wyeliminować z indeksu Google duplikaty parametrów `?ch=` i `?chapter=`.
3. **Wykryty błąd SEO — parametr `?in_mcr=1` w wynikach organicznych Google:**
   - W Google zaindeksował się adres `/codzienne-uwielbienie-live?muted=1&mute=1&in_mcr=1`. Ponieważ parametr `in_mcr=1` włącza w snippety GA4 flagę `traffic_type: 'internal'`, każdy odbiorca klikający ten wynik w Google jest oznaczany jako ruch wewnętrzny reżyserii!
   - **Rekomendacja naprawcza:** W `_worker.js` dla zapytań od botów wyszukiwarek (`Googlebot`, `bingbot`) lub posiadających w `Referer` domenę `google.` wykonywać przekierowanie `301` usuwające parametry techniczne `?in_mcr=1`, `?muted=1`, `?mute=1` na czysty kanoniczny URL `/codzienne-uwielbienie-live`.
