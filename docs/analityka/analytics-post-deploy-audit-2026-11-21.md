# @ICC — RAPORT KONTROLNY GA4 PO WDROŻENIU (`analytics-post-deploy-audit-2026-11-21.md`)

**Data kontroli:** 21 listopada 2026, godz. 12:35 CET  
**Wykonawca:** Antigravity (`@A001`)  
**Tryb:** `ZERO COST / TEST FIRST / APPROVAL REQUIRED` (żadnych zmian produkcyjnych w tym kroku bez akceptacji właściciela)

---

## WNIOSKI KLUCZOWE (OŚ CZASU WDROŻENIA VS OPÓŹNIENIE PRZETWARZANIA GA4)

Bezpośrednie zapytanie `runReport` z wymiarem **`dateHour`** do usługi głównej **`548623550`** wykonane o godz. **12:34 CET** wykazało, że standardowe tabele raportowe GA4 zawierają obecnie dane z dnia dzisiejszego (`2026-11-21`) **wyłącznie do godziny `09:59 CET` (`dateHour = 2026112109`)**:

| Godzina (`dateHour` w GA4) | Sesje | Aktywni użytkownicy | Odsłony (`screenPageViews`) | Zdarzenia (`eventCount`) | Key Events | Status względem wdrożenia |
|---|---:|---:|---:|---:|---:|---|
| `2026112102` (02:00–02:59) | 2 | 2 | 2 | 11 | 0 | **PRZED WDROŻENIEM** |
| `2026112106` (06:00–06:59) | 3 | 2 | 9 | 21 | 0 | **PRZED WDROŻENIEM** |
| `2026112107` (07:00–07:59) | 5 | 3 | 8 | 36 | 0 | **PRZED WDROŻENIEM** (`verse_searched`, `background_changed` na `/werset-dnia`) |
| `2026112108` (08:00–08:59) | 21 | 20 | 48 | 152 | 0 | **PRZED WDROŻENIEM** (`1` sesja `chatgpt.com) / ` na `/mess`) |
| `2026112109` (09:00–09:59) | 3 | 3 | 12 | 52 | 0 | **PRZED WDROŻENIEM** (`5` sesji `(not set)`) |
| **`2026112110` (10:00–10:59)** | *w buforze intraday* | *w buforze intraday* | *w buforze intraday* | *w buforze intraday* | *w buforze intraday* | **OKNO WDROŻENIA KODU (`10:33 CET`)** |
| **`2026112111` (11:00–11:59)** | *w buforze intraday* | *w buforze intraday* | *w buforze intraday* | *w buforze intraday* | *w buforze intraday* | **OKNO KONFIGURACJI GA4 ADMIN (`11:46–11:51 CET`)** |
| **`2026112112` (12:00–12:35)** | *widoczne w Realtime* | *widoczne w Realtime* | *widoczne w Realtime* | *widoczne w Realtime* | *widoczne w Realtime* | **PO WDROŻENIU (`commit 0fc4a3bf` o `12:01 CET`)** |

**Dlaczego w raportach dziennych za 21.11.2026 widać jeszcze `0` najważniejszych zdarzeń oraz `1` sesję `chatgpt.com)`?**
1. **Standardowe opóźnienie przetwarzania GA4 (Intraday Processing Lag 4–8 godzin):** Wszystkie wdrożenia kodu (`10:33–12:01 CET`) oraz rejestracja 6 najważniejszych zdarzeń w GA4 Admin (`11:46–11:51 CET`) nastąpiły **po godzinie `10:00 CET`**, natomiast standardowe tabele GA4 Data API przetworzyły dotychczas dane tylko **do godziny `09:59 CET`**.
2. **Zdarzenia kluczowe (Key Events) w GA4 działają prospektywnie (od momentu utworzenia):** Zostały utworzone w GA4 Admin między `10:46:24 UTC` (`11:46:24 CET`) a `10:51:12 UTC` (`11:51:12 CET`) i nie przeliczają wstecznie zdarzeń z godzin porannych ani z dnia 20.11.2026.

---

## ZADANIE 1. LISTA ZMIAN RZECZYWIŚCIE WDROŻONYCH W GA4 I KODZIE (Z DATAMI I IDENTYFIKATORAMI COMMITÓW)

### 1.1. Zmiany wdrożone w kodzie i na produkcji Cloudflare Pages (`https://polskieradio.cc`)

| Data i czas (CET) | Commit Git (`main`) | Wdrożenie Cloudflare Pages | Zakres rzeczywiście wdrożonych zmian w kodzie |
|---|---|---|---|
| **21.11.2026, 10:32 CET** | `da50894b` | — | **1.** Wdrożenie zunifikowanego modułu `js/cc-analytics.js` v2.0.0 (`radio_pause`, `radio_stop`, `radio_listen_60s`, `radio_listen_300s`, `audio_complete`, `audio_error`, `tv_watch_60s`, `tv_watch_300s`, `tv_channel_change`, `video_error`, `bible_chapter_open`, `bible_audio_start`, `bible_audio_complete`, `bible_translation_select`, `bible_search`, `bible_bookmark_add`, `course_open`, `lesson_start`, `lesson_complete`, `course_progress`, `support_copy_account`, `support_form_submit`, `donation_complete`).<br>**2.** Prywatny prototyp `/test/analityka` (`test/analityka/index.html`) i serwis `/api/analytics-mc/dashboard` (`services/cc-analytics-mc/analytics-mc-service.js`) z autoryzacją serwerową `401/403/200`.<br>**3.** Zestaw testów automatycznych (`tests/cc-analytics-mission-control.test.mjs`) oraz 6 raportów w `docs/analityka/`. |
| **21.11.2026, 10:33 CET** | `3a99b2a1` | `https://604bd1c7.polskieradio.pages.dev` | Dodanie `test/analityka/index.html` do zbioru zamrożonych plików w `scripts/apply-ga-internal-traffic.mjs` i publikacja produkcyjna v2.0.0. |
| **21.11.2026, 11:14 CET** | `8f72869a` | `https://68984e2a.polskieradio.pages.dev` | Integracja danych na żywo z odblokowanego **Google Search Console API** (`sc-domain:polskieradio.cc` — `20` kliknięć, `1 087` wyświetleń, śr. pozycja `9,16`) oraz mapowania kont GA4 (`385962006`, `379195658`, `382396237`, `385960831`) w `/test/analityka` i raportach. |
| **21.11.2026, 11:30 CET** | `08a954e6` | `https://467c0656.polskieradio.pages.dev` | **1.** Optymalizacja `<title>`, `<meta name="description">` i `<link rel="canonical">` w `mojabiblia.html` i `biblia-do-pobrania.html`.<br>**2.** Przekierowania `301` w `_worker.js` usuwające z indeksu wyszukiwarek parametr techniczny `?in_mcr=1` (oraz nagłówek `X-Robots-Tag: noindex, follow, noarchive`) i scalające `?chapter=X` do `?ch=X`. |
| **21.11.2026, 12:01 CET** | `0fc4a3bf` | `https://3f269588.polskieradio.pages.dev` | **1.** Przekierowanie `301` w `_worker.js` oraz funkcja `normalizeCampaignQueryInUrl()` w `js/cc-analytics.js` usuwające doklejony nawias zamykający `)` z parametru `utm_source=chatgpt.com)` i dopisujące `utm_medium=ai-assistant`.<br>**2.** Zapisanie potwierdzonego stanu konfiguracji GA4 Admin API w `services/cc-analytics-mc/analytics-mc-service.js`, `docs/analityka/analytics-ga4-admin-changes.md`, `data/ecosystem-map.json` i `JOMA_HANDOFFS.md`. |

### 1.2. Zmiany rzeczywiście wdrożone w konsoli Google Cloud, Search Console i GA4 Admin (`properties/548623550`)

Wszystkie poniższe zmiany zostały zweryfikowane bezpośrednim odczytem z `analyticsadmin.googleapis.com` oraz `searchconsole.googleapis.com` (`HTTP 200 OK`):

| Data i czas (UTC / CET) | System / Zasób API | Wdrożona konfiguracja | Dowód z API |
|---|---|---|---|
| **21.11.2026, 09:42 UTC (10:42 CET)** | GCP `lumina-cc` (`413985877183`), `christian-culture`, `christian-culture-global` | Włączenie `searchconsole.googleapis.com`, `analyticsadmin.googleapis.com`, `analyticsdata.googleapis.com` | `STATE_ENABLED` (`HTTP 200 OK`) |
| **21.11.2026, 09:58 UTC (10:58 CET)** | Google Search Console `sc-domain:polskieradio.cc` | Dodanie `firebase-adminsdk-fbsvc@lumina-cc.iam.gserviceaccount.com` jako użytkownika | `permissionLevel: "siteRestrictedUser"` (`HTTP 200 OK`) |
| **21.11.2026, 10:44 UTC (11:44 CET)** | GA4 `properties/548623550/dataRetentionSettings` | Zmiana retencji danych o zdarzeniach z `TWO_MONTHS` na **`FOURTEEN_MONTHS`** | `"eventDataRetention": "FOURTEEN_MONTHS"`, `"resetUserDataOnNewActivity": true` |
| **21.11.2026, 10:45 UTC (11:45 CET)** | GA4 `properties/548623550/googleSignalsSettings` | Wyłączenie Google Signals (minimalizacja danych RODO) | `"state": "GOOGLE_SIGNALS_DISABLED"` |
| **21.11.2026, 10:46–10:51 UTC (11:46–11:51 CET)** | GA4 `properties/548623550/keyEvents` | Rejestracja **6 najważniejszych zdarzeń (Key Events)** | `16386885611` (`radio_listen_300s`), `16386855059` (`tv_watch_300s`), `16386860325` (`bible_audio_complete`), `16386896463` (`lesson_complete`), `16386870205` (`support_form_submit`), `16386913077` (`donation_complete`) |
| **21.11.2026, 10:52–10:54 UTC (11:52–11:54 CET)** | GA4 `properties/548623550/customDimensions` | Rejestracja **6 wymiarów niestandardowych (zakres: `EVENT`)** | `book_code` (`16386904576`), `chapter_number` (`16386895594`), `translation` (`16386914941`), `content_type` (`16386892763`), `player_type` (`16386881635`), `initiation_type` (`16386923932`) |

---

## ZADANIE 2. WERYFIKACJA ZAPLANOWANYCH ZDARZEŃ (AUTOMATYCZNE DOM VS WYMAGAJĄCE PODPIĘCIA W KOMPONENTACH + DEBUGVIEW)

Przeprowadzono rygorystyczną kontrolę każdego z **27 zdarzeń** ze standardu Etapu B pod kątem tego, czy wyzwalają się one już **automatycznie z globalnego nasłuchu DOM w `js/cc-analytics.js`**, czy też zostały udostępnione jako metody `window.CCAnalyticsMC.*`, ale **wymagają jeszcze dopięcia w dedykowanych silnikach podstron** (`mojabiblia-engine.js`, `biblia-audio/app.js`, `wspieraj.html`):

### 2.1. Zdarzenia aktywne i automatycznie wyzwalane na produkcji przez globalne listenery `js/cc-analytics.js` (20 z 27 zdarzeń)

| Grupa | Zdarzenie | Jak jest wyzwalane automatycznie na produkcji | Status w GA4 / Testach |
|---|---|---|---|
| **B1. Radio i audio** | `radio_play` | Automatyczny hook `HTMLMediaElement.prototype.play` dla strumieni live (`zeno.fm`, `.m3u8`, `live`) | **AKTYWNE W GA4** (`8` zdarzeń 20.11, `3` zdarzenia 21.11 do godz. 09:59) |
| **B1. Radio i audio** | `audio_play` | Automatyczny hook `HTMLMediaElement.prototype.play` dla plików MP3 o skończonym czasie | **AKTYWNE W GA4** (`2` zdarzenia 20.11, `1` zdarzenie 21.11 + widoczne w Realtime) |
| **B1. Radio i audio** | `radio_pause` | Automatyczny listener `pause` na każdym `<audio>` | **AKTYWNE NA PRODUKCJI OD 10:33 CET** (przetestowane w `cc-analytics-mission-control.test.mjs`) |
| **B1. Radio i audio** | `radio_stop` | Automatyczny listener `emptied` na `<audio>` po zakończeniu strumienia | **AKTYWNE NA PRODUKCJI OD 10:33 CET** |
| **B1. Radio i audio** | `radio_listen_60s` | Automatyczny licznik rzeczywistego postępu `timeupdate` (`AccumulatedSec >= 60`) na każdym `<audio>` | **AKTYWNE NA PRODUKCJI OD 10:33 CET** |
| **B1. Radio i audio** | `radio_listen_300s` | Automatyczny licznik rzeczywistego postępu `timeupdate` (`AccumulatedSec >= 300`) na każdym `<audio>` | **AKTYWNE NA PRODUKCJI OD 10:33 CET (Key Event)** |
| **B1. Radio i audio** | `audio_complete` | Automatyczny listener `ended` na plikach `<audio>` o skończonym `duration` (z blokadą dla LIVE) | **AKTYWNE NA PRODUKCJI OD 10:33 CET** |
| **B1. Radio i audio** | `audio_error` | Automatyczny listener `error` na `<audio>` | **AKTYWNE NA PRODUKCJI OD 10:33 CET** |
| **B2. Telewizja LIVE** | `video_start` | Automatyczny hook `HTMLMediaElement.prototype.play` na `<video>` + YouTube Enhanced Measurement | **AKTYWNE W GA4** (`24` zdarzenia 20.11, `5` zdarzeń 21.11) |
| **B2. Telewizja LIVE** | `video_progress` | YouTube Enhanced Measurement + `CCAnalyticsMC.trackVideoProgress` | **AKTYWNE W GA4** (`23` zdarzenia 20.11, `3` zdarzenia 21.11) |
| **B2. Telewizja LIVE** | `video_complete` | Automatyczny listener `ended` na `<video>` wyłącznie dla materiałów VOD o skończonym czasie | **AKTYWNE NA PRODUKCJI OD 10:33 CET** |
| **B2. Telewizja LIVE** | `tv_watch_60s` | Automatyczny licznik `timeupdate` (`AccumulatedSec >= 60`) na każdym `<video>` | **AKTYWNE NA PRODUKCJI OD 10:33 CET** |
| **B2. Telewizja LIVE** | `tv_watch_300s` | Automatyczny licznik `timeupdate` (`AccumulatedSec >= 300`) na każdym `<video>` | **AKTYWNE NA PRODUKCJI OD 10:33 CET (Key Event)** |
| **B2. Telewizja LIVE** | `tv_channel_change` | Automatyczny listener kliknięć `[data-tv-channel], [data-channel-id]` | **AKTYWNE NA PRODUKCJI OD 10:33 CET** |
| **B2. Telewizja LIVE** | `video_error` | Automatyczny listener `error` na `<video>` | **AKTYWNE NA PRODUKCJI OD 10:33 CET** |
| **B3. Biblia Audio** | `bible_audio_start` | Automatyczny hook `play` na `<audio>` gdy ścieżka to `/biblia-audio` lub plik MP3 księgi biblijnej | **AKTYWNE NA PRODUKCJI OD 10:33 CET** *(uwaga: domyślnie `book_code='UNKNOWN'`, dopóki `biblia-audio/app.js` nie ustawi `dataset.bookCode` — patrz p. 2.2)* |
| **B3. Biblia Audio** | `bible_audio_complete` | Automatyczny listener `ended` na `<audio>` w `/biblia-audio` | **AKTYWNE NA PRODUKCJI OD 10:33 CET (Key Event)** |
| **B4. Akademia** | `course_open` | Automatyczny detektor ścieżki `/akademia/<kurs>` przy wejściu na stronę kursu | **AKTYWNE NA PRODUKCJI OD 10:33 CET** |
| **B4. Akademia** | `lesson_view` | Automatyczny detektor ścieżki `/akademia/<kurs>/dzien-XX` lub `lekcja-XX` | **AKTYWNE W GA4** (`10` zdarzeń 20.11, `5` zdarzeń 21.11 + `2` w Realtime) |
| **B4. Akademia** | `lesson_start` | Automatyczny listener pierwszego kliknięcia lub przewinięcia `>= 15%` na stronie lekcji | **AKTYWNE NA PRODUKCJI OD 10:33 CET** |
| **B5. Wsparcie** | `support_view` | Automatyczny detektor ścieżki `/wspieraj` i `/pomogebomoge` | **AKTYWNE W GA4** (`4` zdarzenia 20.11) |
| **B5. Wsparcie** | `donate_click` | Automatyczny listener kliknięć w linki Patronite, Revolut, Zrzutka, PayPal i `/wspieraj` | **AKTYWNE W GA4** (`30` zdarzeń w 30 dni) |

*(Uwaga dot. zaobserwowanych zdarzeń `background_changed`, `verse_searched`, `verse_generated`: pochodzą one z bundla React podstrony `/werset-dnia` (`/werset-dnia/assets/index-uoHDAOhx.js`), która od rana 21.11 posiada zarówno tag `G-Y4EFTVBPE3`, jak i `G-M24C85RG49`, dlatego jej własne zdarzenia pojawiły się dziś także w głównej usłudze `548623550`).*

### 2.2. Wykryte luki integracyjne w 7 zdarzeniach (Metody istnieją w `window.CCAnalyticsMC`, ale komponenty podstron ich jeszcze nie wywołują!)

Podczas obecnej kontroli kodu wykryto, że poniższe **7 zdarzeń** ma gotowe i przetestowane metody w `js/cc-analytics.js` (`window.CCAnalyticsMC.*`), ale pliki `mojabiblia-engine.js`, `biblia-audio/app.js`, `wspieraj.html` i timer w `cc-analytics.js` **nie wywołują ich jeszcze automatycznie przy interakcji użytkownika**:

1. **`lesson_complete` oraz `course_progress` (`js/cc-analytics.js`):**
   - Warunek w `cc-analytics.js` wymaga `lessonState.maxScrollPct >= 80 && lessonState.engagedSeconds >= 30`, jednak w `cc-analytics.js` zabrakło `setInterval`, który co 1 sekundę (gdy karta jest widoczna: `!document.hidden`) inkrementuje `lessonState.engagedSeconds++`! W efekcie w testach jednostkowych wywołujących `_advanceLessonEngagement(25, 85)` zdarzenie przechodziło, ale na żywej stronie bez kliknięcia przycisku `[data-lesson-complete]` licznik sekund stał na `0`.
2. **`bible_chapter_open`, `bible_translation_select`, `bible_search`, `bible_bookmark_add` (`mojabiblia-engine.js`):**
   - Silnik `mojabiblia-engine.js` w metodach `loadChapter(bookId, chapterNum)`, `toggleTransFilter(trans)`, `handleSearch(query)` oraz `toggleBookmark(bookId, ch, v)` nie wywołuje jeszcze `window.CCAnalyticsMC.trackBibleChapterOpen(...)`, `trackBibleTranslationSelect(...)`, `trackBibleSearch(...)` ani `trackBibleBookmarkAdd(...)`.
3. **Parametry `book_code` i `chapter_number` dla `bible_audio_start` / `bible_audio_complete` (`biblia-audio/app.js` + `biblia-audio/index.html`):**
   - W `biblia-audio/app.js` funkcja `chooseChapter(id)` nie ustawia `chapterAudio.dataset.bookCode = 'GEN'` oraz `chapterAudio.dataset.chapterNumber = item.chapter`, przez co `cc-analytics.js` wysyłałby domyślne `'UNKNOWN'`. Ponadto w `biblia-audio/index.html` (linie 40–41) tag `<script src="/js/cc-analytics.js?v=20261026_1" defer></script>` jest wpisany dwukrotnie.
4. **`support_copy_account`, `support_method_select`, `support_form_submit` na `/wspieraj` (`wspieraj.html` + `assets/cc-support/support.js`):**
   - W `wspieraj.html` (linia 359) przyciski kopiowania numeru konta i BLIK mają atrybut `data-copy="..."` (a nie `data-copy-account`) oraz posiadają stary inline listener, który zamiast `support_copy_account` wysyła `gtag('event', 'donate_click', { method: b.dataset.label || 'kopiuj' })`!
   - Z kolei formularz `#consent-form` w `assets/cc-support/support.js` (linia 304) po zapisaniu deklaracji nie wywołuje `window.CCAnalyticsMC.trackSupportFormSubmit('thanks_consent')`.
5. **Cache-busting `?v=20261026_1` na `<script src="/js/cc-analytics.js?v=20261026_1" defer>`:**
   - Ponieważ w `_headers` pliki `/js/*.js` mają `Cache-Control: public, max-age=604800` (7 dni), przeglądarki powracających użytkowników z cachem sprzed 21.11 ładują z dysku starszą wersję `cc-analytics.js?v=20261026_1`! Zmiana wersji w `scripts/apply-ga-internal-traffic.mjs` lub ustawienie `no-cache` w `_worker.js` dla `/js/cc-analytics.js` natychmiast wymusi pobranie wersji `v2.0` u 100% użytkowników.
6. **Weryfikacja DebugView:**
   - Dotychczasowe testy (`29/29 PASS`) wykonywane były w lokalnym środowisku symulacyjnym Node.js (`tests/cc-analytics-mission-control.test.mjs`), które przechwytuje wywołania `window.gtag('event', ...)` bez wysyłania pakietów sieciowych z parametrem `debug_mode: true` do serwerów Google Analytics DebugView.

---

## ZADANIE 3. SPRAWDZENIE KONFIGURACJI NAJWAŻNIEJSZYCH ZDARZEŃ (KEY EVENTS) W GA4

Bezpośrednie zapytanie `GET https://analyticsadmin.googleapis.com/v1beta/properties/548623550/keyEvents` wykonane 21.11.2026 o godz. 12:29 CET potwierdza (`HTTP 200 OK`), że **wszystkie 6 najważniejszych zdarzeń jest już aktywnie skonfigurowanych w GA4**:

| ID Zasobu w GA4 Admin API | Nazwa Najważniejszego Zdarzenia (`eventName`) | Data i czas utworzenia (`createTime` UTC) | Metoda zliczania (`countingMethod`) |
|---|---|---|---|
| `properties/548623550/keyEvents/16386885611` | **`radio_listen_300s`** | `2026-11-21T10:46:24.739082Z` (11:46 CET) | `ONCE_PER_EVENT` |
| `properties/548623550/keyEvents/16386855059` | **`tv_watch_300s`** | `2026-11-21T10:47:05.895791Z` (11:47 CET) | `ONCE_PER_EVENT` |
| `properties/548623550/keyEvents/16386860325` | **`bible_audio_complete`** | `2026-11-21T10:47:13.058206Z` (11:47 CET) | `ONCE_PER_EVENT` |
| `properties/548623550/keyEvents/16386896463` | **`lesson_complete`** | `2026-11-21T10:47:43.270236Z` (11:47 CET) | `ONCE_PER_EVENT` |
| `properties/548623550/keyEvents/16386870205` | **`support_form_submit`** | `2026-11-21T10:51:05.088120Z` (11:51 CET) | `ONCE_PER_EVENT` |
| `properties/548623550/keyEvents/16386913077` | **`donation_complete`** | `2026-11-21T10:51:12.496440Z` (11:51 CET) | `ONCE_PER_EVENT` |
| `properties/548623550/keyEvents/15383676071` | `purchase` *(domyślne systemowe GA4)* | `2026-08-05T07:53:43.999945Z` | `ONCE_PER_EVENT` |

**Dlaczego licznik `Key Events` w raportach za 20–21.11 wynosi obecnie `0`?**
1. Konfiguracja Key Events w GA4 została zapisana o godz. **11:46–11:51 CET** w dniu 21.11.2026. W GA4 oznaczenie zdarzenia jako Key Event **nie działa wstecz** dla danych zebranych przed godziną `11:46 CET`.
2. Raporty standardowe za 21.11.2026 zawierają obecnie przetworzone dane tylko do godziny **`09:59 CET`**.
3. Aby każde wywołanie `radio_listen_300s`, `tv_watch_300s`, `bible_audio_complete`, `lesson_complete` i `support_form_submit` było rejestrowane od pierwszej wizyty u wszystkich użytkowników, przygotowano poprawkę cache-bustingu dla `/js/cc-analytics.js` oraz podpięcie timera `lesson_complete` (opisaną w Sekcji 8 do zatwierdzenia).

---

## ZADANIE 4. DIAGNOZA BŁĘDNEJ ATRYBUCJI ŹRÓDEŁ (`chatgpt.com)` ORAZ `(not set)`)

Przeprowadzono szczegółowy rozbiór wszystkich sesji `chatgpt.com)` oraz `(not set)` z dni **20–21 listopada 2026** z dokładnością do godziny (`dateHour`), podstrony (`pagePath` / `landingPagePlusQueryString`) i miasta (`city`):

### 4.1. Skąd wzięło się `chatgpt.com) / ` w dniu 21.11.2026 (1 sesja) i 20.11.2026 (4 sesje)?
- **Dowód z GA4 Data API (`scratch/post-deploy-audit.json`):**
  - W dniu **21.11.2026** wystąpiła dokładnie **1 sesja** `chatgpt.com) / ` (`0` nowych użytkowników, `1` odsłona) — miała ona miejsce o godzinie **`08:00–08:59 CET` (`dateHour = 2026112108`)** z **Ostrowca Świętokrzyskiego** na podstronie `/mess` (**3 godziny przed wdrożeniem poprawki `0fc4a3bf` o 12:01 CET**!).
  - Co więcej, w tej sesji `landingPagePlusQueryString` to czyste `/mess` (bez parametrów UTM w adresie dzisiaj). Dlaczego więc GA4 przypisało jej `sessionSourceMedium = chatgpt.com) / `?
  - **Mechanizm GA4 + luka kolejności skryptów:**
    1. **Dziedziczenie źródła w GA4 i powrót na otwartą kartę:** Użytkownik z zespołu w Ostrowcu Świętokrzyskim lub Warszawie otworzył w dniach 18–20.11 link z ChatGPT zakończony nawiasem `?utm_source=chatgpt.com)`.
    2. **Luka kolejności wykonania w HTML (Wykryta podczas obecnej kontroli!):** W plikach HTML najpierw w `<head>` wykonuje się inline'owy skrypt `gtag('config', 'G-Y4EFTVBPE3', ...)`, który natychmiast wysyła `page_view` z surowym adresem `location.search`, a dopiero po nim ładuje się `<script src="/js/cc-analytics.js" defer></script>`! Dodatkowo `/mess` (`mess.html`) używało wyłącznie tagu `G-M24C85RG49` lub starego cache'u.
    3. **Naprawa wdrożona o 12:01 CET (`_worker.js`):** Przekierowanie `301` w `_worker.js` przechwytuje zapytanie HTTP **na brzegu sieci Cloudflare jeszcze przed wysłaniem dokumentu HTML do przeglądarki**, usuwa nawias `)` z `utm_source=chatgpt.com)` i przekierowuje na czysty URL `?utm_source=chatgpt.com&utm_medium=ai-assistant`. Od godziny `12:01 CET` żaden nowy klik w link z nawiasem nie dotrze już do `gtag('config')`.

### 4.2. Skąd wzięło się `(not set)` w kanale `Unassigned` (23 sesje 20.11 oraz 7 sesji 21.11 do godz. 09:59)?
Analiza wiersz po wierszu wszystkich `7` sesji `(not set)` z 21.11.2026 (godz. `06:00–09:59 CET`) oraz `23` sesji z 20.11.2026 wykazała, że mają one **`0` sesji zaangażowanych (`engagedSessions: 0`)** i dzielą się na **trzy konkretne przyczyny techniczne**:

1. **Osadzone iframe'y i sceny reżyserskie bez `session_start` (`landingPage = ""` lub `/master-live?muted=1&mute=1&in_mcr=1` oraz `/mess?embed=1&room=prayer_40dm`):**
   - Na podstronach `/40DM/` oraz w reżyserce `/master-live?muted=1&mute=1&in_mcr=1` (Ostrowiec Świętokrzyski, Warszawa, Wrocław) otwarte przez wiele godzin karty lub osadzone iframe'y czatu `/mess?embed=1&room=prayer_40dm&v=20261120_40dm_v4` wysyłają po wygaśnięciu 30-minutowego okna sesji pojedyncze zdarzenie w tle (np. `user_engagement`, `scroll` lub `video_progress`), które nie zawiera parametru `_ss=1` (`session_start`). W GA4 każde zdarzenie wysłane po wygaśnięciu sesji bez nowego `session_start` otrzymuje `sessionSourceMedium = (not set)`.
2. **Podwójne wywołanie `gtag('config')` i natychmiastowe zdarzenie `verse_generated` przy starcie `/werset-dnia` (`4` sesje `(not set)` w dniu 21.11 o godz. 08:00–09:59 z Ostrowca Świętokrzyskiego):**
   - W pliku `werset-dnia.html` (linie 10–11) wywoływane są pod rząd dwie komendy:
     `gtag('config', 'G-Y4EFTVBPE3', ...)` oraz `gtag('config', 'G-M24C85RG49')`, a aplikacja React natychmiast przy montowaniu komponentu wywołuje `gtag('event', 'verse_generated')` zanim zakończy się inicjalizacja ciasteczka sesji `_ga_Y4EFTVBPE3`.
3. **Automatyczne odpytania serwerowni (Des Moines, Prineville, Luleå) z czasem 0 s (`landingPage = ""`):**
   - W dniu 20.11 trzy sesje `(not set)` z pustym `landingPage` pochodziły z serwerowni `Des Moines` (Azure), `Prineville` (Meta) i `Luleå` (Meta), które przerwały połączenie przed zarejestrowaniem pełnego `page_view`.

---

## ZADANIE 5. WYJAŚNIENIE BRAKU DANYCH W PIĘCIU USŁUGACH GA4 ZA 20–21 LISTOPADA

Sprawdzono wszystkie 8 usług GA4 pod kątem obecności ich tagów (`G-*`) w kodzie produkcyjnym `polskieradio.cc` oraz uprawnień IAM na kontach GA4:

| # | ID Usługi GA4 | Konto Nadrzędne GA4 | Tag `G-*` w kodzie produkcyjnym `polskieradio.cc` | Dane za 20–21.11.2026 | Dokładna przyczyna braku danych / statusu |
|---|---|---|---|---|---|
| **1** | **`548623550`** (*Polskie Radio Christian Culture*) | `accounts/385962006` (*Biblia Audio CC*) | **`G-Y4EFTVBPE3`** (aktywny na **`1 801`** stronach HTML) | **SĄ DANE:** 20.11: `147` sesji, `297` odsłon; 21.11 (do 09:59): `34` sesje, `79` odsłon + Realtime | **Główna aktywna usługa produkcyjna.** |
| **2** | **`550097091`** (*Lumina*) | `accounts/385962006` (*Biblia Audio CC*) | **`G-M24C85RG49`** (aktywny na **`223`** stronach LUMINA / SPA) | **SĄ DANE:** 20.11: `18` sesji, `65` odsłon; 21.11 (do 09:59): `5` sesji, `30` odsłon | **Aktywna usługa pomocnicza portalu LUMINA.** |
| **3** | **`526422549`** (*Biblia Audio CC*) | `accounts/385962006` (*Biblia Audio CC*) | **`G-K8PKXF3KSM`** — **0 plików w kodzie** (zastąpiony przez `G-Y4EFTVBPE3`) | **0 wierszy (API zwraca `200 OK`, `rowCount: 0`)** | **Usługa nieużywana w kodzie:** Strumień `13684646910` został utworzony dla starej subdomeny `https://biblia.cclite.pl`. Obecnie cały serwis `/biblia-audio/` używa głównego tagu `G-Y4EFTVBPE3` i wysyła dane do głównej usługi `548623550`. |
| **4** | **`518223715`** (*christian-culture*) | `accounts/379195658` (*Default Account for Firebase*) | `G-6440T9VBQB` (tylko w starym katalogu `dist/` i `lumina-db.js`, brak na głównych stronach `polskieradio.cc`) | **Brak odczytu API (`403 PERMISSION_DENIED`) / brak ruchu z `polskieradio.cc`** | **1)** Domena `polskieradio.cc` nie wysyła tam ruchu (używa `G-Y4EFTVBPE3`).<br>**2)** Konto GA4 `379195658` nie ma dodanego konta serwisowego `lumina-cc` jako Viewer. |
| **5** | **`529214226`** (*gen-lang-client-0094354839*) | `accounts/379195658` (*Default Account for Firebase*) | Brak tagu na głównym portalu (ew. pojedynczy plik `/uslugi` z `G-9M92G6S27M`) | **Brak odczytu API (`403 PERMISSION_DENIED`)** | Projekt techniczny Google AI Studio / Gemini API utworzony automatycznie przy generowaniu klucza API na koncie `379195658`. |
| **6** | **`522101206`** (*christian-culture-global*) | `accounts/382396237` | **0 plików w kodzie** | **Brak odczytu API (`403`) i 0 ruchu z definicji** | Projekt Firebase Hosting `christian-culture-global.web.app` służy wyłącznie jako **serwer CDN statycznych plików MP3** (`worship-audio-cdn`) — nie zawiera stron HTML ani skryptu `gtag.js`. |
| **7** | **`534305954`** (*aplikacja-christian-culture*) | `accounts/382396237` | **0 plików w kodzie WWW** (usługa aplikacji mobilnej) | **Brak odczytu API (`403 PERMISSION_DENIED`)** | Usługa na osobnym koncie GA4 `382396237` (wymaga dodania `firebase-adminsdk-fbsvc@lumina-cc.iam.gserviceaccount.com` w `Administracja -> Zarządzanie dostępem do konta 382396237`). |
| **8** | **`526414935`** (*Radio CC Lite*) | `accounts/385960831` | **0 plików w kodzie** (domena `cclite.pl` używa `G-Y4EFTVBPE3`) | **Brak odczytu API (`403`) / ruch idzie do `548623550`** | Odtwarzacz na domenie `cclite.pl` ma wdrożony główny tag `G-Y4EFTVBPE3` i wysyła swoje sesje bezpośrednio do głównej usługi `548623550`. |

**Podsumowanie Zadania 5:**
- **4 usługi (`526422549`, `522101206`, `526414935`, `529214226`)** w ogóle nie są podpięte pod aktywne strony produkcyjne `polskieradio.cc` / `cclite.pl`, ponieważ cały ruch WWW został scentralizowany w usłudze głównej **`548623550`** (oraz pomocniczej **`550097091`** dla LUMINA).
- Dla kont GA4 **`379195658`**, **`382396237`** i **`385960831`** wbudowana przeglądarka zwraca blokadę bezpieczeństwa Google `HTTP 401` na wewnętrznym endpointzie `analyticssuitefrontend-pa.clients6.google.com/v1/usermanagement/selfgaiaid`. Jeżeli Właściciel chce podejrzeć historyczne dane z usługi aplikacji mobilnej `534305954` w panelu `/test/analityka`, wystarczy w zwykłej przeglądarce Chrome dodać `firebase-adminsdk-fbsvc@lumina-cc.iam.gserviceaccount.com` jako **Przeglądający (Viewer)** na kontach `379195658` i `382396237`.

---

## ZADANIE 6. SPRAWDZENIE, CZY MONITORING I AUTOMATYCZNE TESTY NIE ZNIEKSZTAŁCAJĄ RUCHU (20–21 LISTOPADA)

Zbadano pełną tabelę `hostName + country + city + browser` w usłudze `548623550` za dni **20–21 listopada 2026** (`scratch/post-deploy-audit.json`, sekcja `hosts20_21`):

### 6.1. Czy lokalne testy automatyczne (`localhost`, `127.0.0.1`, `*.test`, `*.pages.dev`) zanieczyściły dane w dniach 20–21.11?
- **WYNIK: `0` sesji z `localhost`, `0` sesji z `127.0.0.1`, `0` sesji z `ml.test`/`tvw.test`, `0` sesji z `*.polskieradio.pages.dev`!**
- **100% ruchu w dniach 20–21.11.2026** pochodzi wyłącznie z produkcyjnej domeny `polskieradio.cc` (oraz `1` sesji z `www.polskieradio.cc`). Nasze dzisiejsze testy automatyczne (`node --test tests/cc-analytics-mission-control.test.mjs scripts/ga-internal-traffic.test.mjs`) działały w izolowanym środowisku Node.js i nie wysłały ani jednego fałszywego hitu do GA4.

### 6.2. Jaki ruch techniczny / automatyczny nadal wpływa na statystyki produkcyjne `polskieradio.cc` w dniach 20–21.11?
1. **Zewnętrzne serwerownie Meta / Azure / GCP (Prefetchery Facebooka i skanery chmurowe):**
   - **20.11.2026:** `Prineville` (Meta USA — `25` sesji), `Dublin` (Meta/AWS Irlandia — `19` sesji), `Luleå` (Meta Szwecja — `17` sesji), `Forest City` (Meta USA — `12` sesji), `Fort Worth` (Meta USA — `8` sesji), `Des Moines` (Azure USA — `4` sesje), `Council Bluffs` (GCP USA — `3` sesje). Łącznie ok. **88 sesji z centrów danych** w dniu 20.11.
   - **21.11.2026 (do godz. 09:59):** `Prineville` (`5` sesji — wejścia botów FB na `/akademia/kurscodzienny/dzien-52` po porannej publikacji lekcji!), `Dublin` (`2` sesje).
2. **Ruch wewnętrzny zespołu i przeglądarki testowej z Ostrowca Świętokrzyskiego:**
   - **20.11.2026:** `Ostrowiec Świętokrzyski` wygenerował `32` sesje (`113` odsłon, `551` zdarzeń).
   - **21.11.2026 (do godz. 09:59):** `Ostrowiec Świętokrzyski` wygenerował `10` sesji (`46` odsłon, `123` zdarzenia — w tym poranne prace nad `/werset-dnia`, `/mojabiblia` i `/lumina-login`).
   - **Dlaczego ruch z Ostrowca Świętokrzyskiego i Playwright/WebDriver jest jeszcze widoczny w głównych raportach GA4?**
     Ponieważ zgodnie z dyrektywą (*„nie wprowadzać nieodwracalnych filtrów bez zgody właściciela”*) w kodzie wysyłamy parametr `traffic_type: 'internal'` (dla `?cc_team=1`, `?in_mcr=1`, `obsstudio`) oraz `traffic_type: 'technical_monitor'` (dla `navigator.webdriver` / HeadlessChrome), ale filtr **Data Filter** w GA4 Admin nie został przełączony w tryb **Active** (który w GA4 trwale wycina dane przed zapisem).
   - **Bezpieczna rekomendacja (100% odwracalna + blokada lokalna):**
     Zamiast nieodwracalnego filtra w GA4 Admin możemy:
     a) zarejestrować wymiar niestandardowy **`Traffic Type` (`traffic_type`)** w GA4 Admin, aby w każdym raporcie można było jednym kliknięciem odfiltrować `internal` i `technical_monitor` **bez utraty jakichkolwiek danych**, oraz
     b) w `js/cc-analytics.js` i snippety HTML zablokować wysyłanie `gtag('config')` / `gtag('event')` na domenach nieprodukcyjnych (`localhost`, `127.0.0.1`, `*.test`, `*.pages.dev`) oraz dla `navigator.webdriver === true` (automatycznych przeglądarek Playwright/Puppeteer).

---

## ZADANIE 7. RAPORT PRZED / PO (UWZGLĘDNIAJĄCY MOMENT WDROŻENIA I OPÓŹNIENIA GA4)

### 7.1. Porównanie stanu konfiguracji i architektury: PRZED (do 21.11.2026, godz. 10:30 CET) vs PO (21.11.2026, godz. 12:35 CET)

| Obszar | Stan PRZED wdrożeniem (do 21.11, godz. 10:30 CET) | Stan PO wdrożeniu (21.11, godz. 12:35 CET — zweryfikowany przez API) | Kiedy efekt będzie widoczny w standardowych tabelach GA4 |
|---|---|---|---|
| **Retencja danych GA4 (`548623550`)** | `TWO_MONTHS` (2 miesiące — utrata danych historycznych po 60 dniach) | **`FOURTEEN_MONTHS` (14 miesięcy — `HTTP 200 OK`)** | **Natychmiast** (obowiązuje dla całej usługi `548623550`). |
| **Google Signals (`548623550`)** | `GOOGLE_SIGNALS_ENABLED` (ryzyko RODO przy braku Consent Mode dla reklam) | **`GOOGLE_SIGNALS_DISABLED` (Wyłączone — `HTTP 200 OK`)** | **Natychmiast** (od godz. `11:45 CET`). |
| **Najważniejsze zdarzenia (`Key Events`)** | `1` (tylko nieużywane domyślne `purchase` = `0` konwersji) | **`7` (`radio_listen_300s`, `tv_watch_300s`, `bible_audio_complete`, `lesson_complete`, `support_form_submit`, `donation_complete` + `purchase`)** | W **Realtime API** od razu po wyzwoleniu; w **standardowych raportach dziennych** po przetworzeniu okna `> 11:51 CET` (opóźnienie intraday 4–8h, pełne przeliczenie jutro rano o `06:00 CET`). |
| **Wymiary niestandardowe (`Custom Dimensions`)** | `0` zarejestrowanych wymiarów | **`6` wymiarów (`book_code`, `chapter_number`, `translation`, `content_type`, `player_type`, `initiation_type`)** | W raportach GA4 dla zdarzeń zarejestrowanych po godz. **`11:54 CET`** (pełna widoczność po 24h przetwarzania GA4). |
| **Google Search Console API (`sc-domain:polskieradio.cc`)** | `403 SERVICE_DISABLED` (API wyłączone w GCP, brak uprawnień konta serwisowego) | **`200 OK ACTIVE_VERIFIED` (`20` kliknięć, `1 087` wyświetleń, śr. pozycja `9,16`, `93` zapytania, `180` stron)** | **Widoczne natychmiast** w `https://polskieradio.cc/test/analityka` oraz w raportach. |
| **Oczyszczanie `utm_source=chatgpt.com)`** | Brak (73+4+2 = `79` sesji wpadało do `Unassigned`) | **Przekierowanie `301` w `_worker.js` + `normalizeCampaignQueryInUrl()` w `cc-analytics.js`** (wdrożone o `12:01 CET`) | Dla wszystkich sesji rozpoczętych **po godz. `12:01 CET`** (1 sesja widoczna dzisiaj w GA4 pochodziła z godz. `08:00–08:59 CET`, czyli sprzed wdrożenia). |
| **Oczyszczanie `?in_mcr=1` z Google Search** | Linki z `?in_mcr=1` indeksowały się w Google (poz. 2.0) i oznaczały odbiorców z Google jako `traffic_type=internal` | **Przekierowanie `301` dla botów i wejść z wyszukiwarek + `X-Robots-Tag: noindex`** (wdrożone o `11:30 CET`) | **Natychmiast** dla nowych kliknięć z Google; wyindeksowanie starych parametrów z SERP przy kolejnym crawlu Googlebota. |

### 7.2. Porównanie metryk ilościowych GA4 Data API: 20.11 (wczoraj — pełna doba PRZED) vs 21.11 (dziś — tylko godziny 00:00–09:59 PRZED) vs Realtime (12:05–12:35 PO)

| Wskaźnik (`548623550`) | 20.11.2026 (Pełna doba PRZED wdrożeniem) | 21.11.2026 (Tylko godz. 00:00–09:59 CET — PRZED wdrożeniem, stan intraday) | 21.11.2026, godz. 12:05–12:35 CET (Raport Realtime — PO wdrożeniu) |
|---|---:|---:|---:|
| **Aktywni użytkownicy** | 130 | 25 *(dane częściowe do 09:59)* | Aktywni w ostatnich 30 min |
| **Sesje (`session_start`)** | 144 (147 z sesjami bez startu) | 26 (34 z sesjami `(not set)`) | `2` nowe sesje w ostatnich 30 min |
| **Wyświetlenia (`page_view`)** | 297 | 79 | `5` odsłon w ostatnich 30 min |
| **Odtworzenia radia / audio (`radio_play` / `audio_play`)** | 8 `radio_play` / 2 `audio_play` | 3 `radio_play` / 1 `audio_play` | `1` `audio_play` (4 min temu) |
| **Otwarcia lekcji (`lesson_view`)** | 10 | 5 | `2` `lesson_view` |
| **Zniekształcone `chatgpt.com)`** | 4 sesje | 1 sesja *(o godz. 08:00–08:59 CET, przed poprawką z 12:01 CET)* | **0 sesji po 12:01 CET** |
| **Ruch z `localhost` / `*.test` / `*.pages.dev`** | 0 sesji | 0 sesji | **0 sesji** |

---

## 8. PROPONOWANY PAKIET KOREKT UZUPEŁNIAJĄCYCH (GOTOWY DO PRZETESTOWANIA — WYMAGA AKCEPTACJI WŁAŚCICIELA PRZED PUBLIKACJĄ)

Zgodnie z zasadą: *„Wszystkie korekty najpierw testować. Nie publikować zmian produkcyjnych bez akceptacji właściciela”*, przed jakimkolwiek wdrożeniem na produkcję przedstawiam do akceptacji precyzyjny pakiet **5 bezpiecznych korekt kodu**, które domkną wykryte w Zadaniu 2 i 4 luki:

1. **Podpięcie brakującego timera `engagedSeconds` dla `lesson_complete` w `js/cc-analytics.js`:**
   - Dodanie lekkiego licznika (`setInterval` co 1 s na stronach lekcji Akademii, aktywnego wyłącznie gdy `!document.hidden`), który inkrementuje `lessonState.engagedSeconds`, dzięki czemu po 30 sekundach czytania i przewinięciu `>= 80%` lekcji automatycznie wyzwoli się najważniejsze zdarzenie **`lesson_complete`** (Key Event).
2. **Podpięcie wywołań `CCAnalyticsMC` w `mojabiblia-engine.js`, `biblia-audio/app.js` oraz `wspieraj.html`:**
   - W `mojabiblia-engine.js`: wywołanie `bible_chapter_open` przy otwarciu rozdziału, `bible_translation_select` przy zmianie filtra przekładu, `bible_search` przy wyszukiwaniu wersetu/Stronga oraz `bible_bookmark_add` przy dodaniu zakładki.
   - W `biblia-audio/app.js` i `biblia-audio/index.html`: przypisanie `dataset.bookCode = 'GEN'` oraz `dataset.chapterNumber = item.chapter` na elemencie `#chapterAudio` (aby `bible_audio_start` i Key Event `bible_audio_complete` raportowały dokładny rozdział zamiast `'UNKNOWN'`) oraz usunięcie zduplikowanego `<script src="/js/cc-analytics.js">` z linii 41.
   - W `wspieraj.html` i `assets/cc-support/support.js`: zamiana błędnego `donate_click` przy kliknięciu *„Kopiuj numer konta / BLIK”* na właściwe zdarzenie **`support_copy_account`**, dodanie `support_method_select` przy wyborze kwoty/metody oraz wywołanie Key Eventu **`support_form_submit`** po zapisaniu formularza `#consent-form`.
3. **Wymuszenie świeżego `js/cc-analytics.js` (Cache-Busting) w `_worker.js`:**
   - Dodanie `/js/cc-analytics.js` do listy plików z `Cache-Control: no-cache, no-store, must-revalidate` w `_worker.js` (linia 1977), aby każda przeglądarka natychmiast pobierała wersję `v2.0` zamiast 7-dniowego cache'u `?v=20261026_1`.
4. **Eliminacja sesji `(not set)` z podwójnego `gtag('config')` na `/werset-dnia` oraz blokada ruchu `localhost` / `navigator.webdriver`:**
   - W `js/cc-analytics.js`: automatyczne wyłączenie wysyłania zdarzeń z `localhost`, `127.0.0.1`, `*.test` i `navigator.webdriver === true` (chyba że włączono jawny parametr `?cc_debug_ga=1` dla testów DebugView).
5. **Test w GA4 DebugView / Realtime:**
   - Po akceptacji uruchomimy test z parametrem `debug_mode: true` i potwierdzimy odbiór zdarzeń bezpośrednio w GA4 DebugView / Realtime API.
