# KATALOG ZDARZEŃ ANALITYCZNYCH — CC ANALYTICS MISSION CONTROL 1.0 (`analytics-event-catalog.md`)

**Data:** 21 listopada 2026  
**Wykonawca:** Antigravity (`@A001`)  
**Moduł wykonawczy:** `js/cc-analytics.js` (v2.0.0 — `window.ccTrack` oraz `window.CCAnalyticsMC`)  
**Status:** `ZROBIONE / TESTOWANE`

---

## 1. PODZIAŁ I WERYFIKACJA ISTNIEJĄCYCH ZDARZEŃ W GA4 (USŁUGA `548623550`, OSTATNIE 30 DNI)

Przed wdrożeniem nowych zdarzeń przeanalizowano wszystkie istniejące zdarzenia w usłudze `548623550` pod kątem ich pochodzenia, poprawności i ryzyka duplikacji:

| Zdarzenie | Liczba (30d) | Użytkownicy (30d) | Źródło pochodzenia | Ocena poprawności i decyzja w Standardzie v2.0 |
|---|---:|---:|---|---|
| `page_view` | 6 814 | 1 515 | `gtag('config', 'G-Y4EFTVBPE3')` | **POPRAWNE.** `cc-analytics.js` nie wysyła duplikatu `page_view`. Na stronach z podwójnym tagiem (`vod.html`, `werset-dnia.html`) wysyłane było do dwóch różnych usług (`548623550` i `550097091`). |
| `scroll` | 4 006 | 802 | GA4 Enhanced Measurement (90% przewinięcia) | **POPRAWNE.** Nie duplikować własnym zdarzeniem `scroll`. |
| `video_progress` | 3 730 | 35 | GA4 Enhanced Measurement (YouTube IFrame) + lokalne skrypty TV | **ZAWYŻONE NA KANAŁACH LIVE.** Na `/spiewajmy-panu-live` `2` użytkowników wygenerowało `2 287` zdarzeń. W Standardzie v2.0 rzeczywiste utrzymanie widza mierzą `tv_watch_60s` i `tv_watch_300s`. |
| `video_start` | 1 162 | 62 | GA4 Enhanced Measurement + `js/cc-analytics.js` | **ZACHOWANE Z POPRAWKĄ.** Dodano parametr `initiation_type: 'user' \| 'auto'` oraz `content_type: 'live_tv' \| 'vod'` i deduplikację 30-minutową na źródło. |
| `promo_impression` | 1 155 | 44 | Rotatory banerów / kart promocyjnych (`/SpiritualSounds/tv/`, `/master-live`) | **ZACHOWANE (istniejące).** Nie oznaczać jako Key Event. |
| `audio_play` | 1 102 | 68 | `js/cc-analytics.js` (`HTMLMediaElement.prototype.play`) + `js/cc-universal-tts.js` | **ZACHOWANE (100% kompatybilności).** Wyzwalane raz na 30 min dla danego pliku `.mp3` tylko gdy `!el.muted`. |
| `polonia_engagement` | 695 | 359 | `js/cc-analytics.js` (`window.ccTrackPolonia`) + `js/cc-polonia-hub.js` | **POPRAWNE.** Klasyfikuje ośrodek Polonii na podstawie strefy czasowej bez danych osobowych. |
| `radio_play` | 536 | 123 | `js/cc-analytics.js` (`HTMLMediaElement.prototype.play` dla strumieni `zeno.fm` / `duration === Infinity`) | **POPRAWNE (ZACHOWANE).** Wyzwalane wyłącznie przy faktycznym starcie niewyciszonego odtwarzacza radia. |
| `lesson_view` | 344 | 146 | `js/cc-analytics.js` (automatycznie na `/akademia/<kurs>/dzien-XX`) | **POPRAWNE (ZACHOWANE).** Oznacza otwarcie strony lekcji; ukończenie mierzy nowe `lesson_complete`. |
| `view_search_results` / `search` | 83 / 64 | 25 / 29 | Enhanced Measurement (`?q=`) + `js/cc-analytics.js` (`#ccOmniInput` po 1,5 s pauzy lub `Enter`) | **POPRAWNE.** Posiada filtr PII blokujący zapytania zawierające `@` lub ciągi cyfr (numery telefonów). |
| `support_view` | 49 | 35 | Strony wsparcia (`/pomogebomoge`, `/wspieraj`) + `js/cc-analytics.js` | **POPRAWNE (ZACHOWANE).** Ujednolicone dla `/wspieraj`, `/pomogebomoge`, `/darowizna`, `/patron`. |
| `select_content` | 35 | 9 | `js/cc-analytics.js` (kliknięcie wyniku w wyszukiwarce `@w` `#ccOmniBody a`) | **POPRAWNE (ZACHOWANE).** Parametry: `content_type: 'search_result'`, `item_id: pathname`. |
| `donate_click` | 30 | 14 | `js/cc-analytics.js` + `wspieraj.html` | **POPRAWNE (ZACHOWANE).** Oznacza wyłącznie kliknięcie w link wsparcia, nigdy faktyczną wpłatę. |
| `share` | 27 | 11 | `js/cc-analytics.js` (`navigator.share` + linki social share) | **POPRAWNE (ZACHOWANE).** W v2.0 adres `content_url` jest oczyszczany przez `sanitizeUrl()`. |
| `contact_click` | 24 | 8 | `js/cc-analytics.js` (`tel:`, `mailto:`, `wa.me`, `m.me`) | **POPRAWNE (ZACHOWANE).** Wysyła wyłącznie typ kontaktu (`phone`, `email`, `whatsapp`, `messenger`) i ID sekcji, bez numeru telefonu czy adresu e-mail. |
| `video_complete` | 15 | 2 | YouTube IFrame na `/studium-live` (6), `/spiewajmy-panu-live` (5), `/apokalipsa-live` (4) | **NAPRAWIONE W V2.0.** Zablokowano wyzwalanie `video_complete` dla transmisji LIVE (`is_live === true` lub `duration === Infinity`). |
| `login` | 12 | 8 | `lumina-db.js` po udanym uwierzytelnieniu Firebase Auth | **POPRAWNE (ZACHOWANE).** Nie wysyła adresu e-mail ani UID użytkownika. |
| `support_method_select` | 11 | 3 | Wybór metody na stronach wsparcia (`[data-support-method]`) | **POPRAWNE (ZACHOWANE).** |
| `promo_click` | 7 | 6 | Kliknięcie w kartę promocyjną | **POPRAWNE (ZACHOWANE).** |

---

## 2. STANDARD ZDARZEŃ CC ANALYTICS V2.0 (ETAP B1–B5)

Wszystkie zdarzenia przechodzą przez centralny strażnik `window.ccTrack(name, params)` w `js/cc-analytics.js`:
- **Respektowanie zgody:** jeśli `getConsentState() === 'denied'`, zdarzenie jest natychmiast odrzucane.
- **Sanityzacja PII:** automatyczne usuwanie kluczy `email`, `phone`, `amount`, `kwota`, `donor_name`, `prayer_text`, `note_text`, `message_text`, `token` oraz maskowanie wzorców e-mail/telefon wewnątrz stringów.
- **Ruch techniczny:** automatyczne dodawanie `traffic_type: 'internal'` (dla `?cc_team=1`, `?in_mcr=1`, `window.obsstudio`) lub `traffic_type: 'technical_monitor'` (dla `navigator.webdriver`, `localhost`, `127.0.0.1`, `*.test`, `HeadlessChrome`/`Playwright`).

### B1. Radio i audio

| Nazwa zdarzenia | Warunek wyzwolenia (Trigger) | Parametry | Reguła deduplikacji / bezpieczeństwa |
|---|---|---|---|
| `radio_play` | Faktyczny start odtwarzania strumienia live (`zeno.fm`, `.m3u8`, `duration === Infinity`) z dźwiękiem (`!el.muted`) | `stream_host`, `stream` | Maks. 1 raz na 30 minut dla tego samego adresu strumienia. Samo załadowanie `<audio>` lub wyciszony autoplay nie wyzwala zdarzenia. |
| `audio_play` | Faktyczny start skończonego pliku audio (`.mp3` — Biblia Audio, podcast, TTS) z dźwiękiem (`!el.muted`) | `stream_host`, `stream` | Maks. 1 raz na 30 minut dla tego samego pliku. |
| `radio_pause` | Zdarzenie `pause` na aktywnym odtwarzaczu audio/radia (gdy `!el.ended`) | `stream_host`, `stream`, `listened_seconds` | Zawiera rzeczywisty skumulowany czas słuchania w sekundach. |
| `radio_stop` | Zamknięcie/opróżnienie strumienia (`emptied`) po min. 1 s słuchania lub wywołanie `CCAnalyticsMC.trackRadioStop()` | `stream_host`, `stream`, `listened_seconds` | Rejestruje zakończenie sesji radiowej. |
| `radio_listen_60s` | Potwierdzone **60 sekund** faktycznego odtwarzania audio/radia (`!paused && !ended && !muted` + postęp `currentTime` / `readyState >= 2`) | `stream_host`, `stream`, `initiation_type` | Maks. 1 raz na sesję odtwarzacza. Nigdy nie naliczane samym `setTimeout` przy zatrzymanym odtwarzaczu. |
| `radio_listen_300s` | Potwierdzone **300 sekund (5 minut)** faktycznego odtwarzania audio/radia | `stream_host`, `stream`, `initiation_type` | **Kandydat na Key Event (Konwersję).** Maks. 1 raz na sesję odtwarzacza. |
| `audio_complete` | Zdarzenie `ended` wyłącznie dla nagrania o skończonym czasie trwania (`!isLive && Number.isFinite(duration) && duration > 0`) | `stream_host`, `stream`, `duration_seconds` | **Zablokowane dla emisji całodobowej 24/7 LIVE.** |
| `audio_error` | Błąd odtwarzacza HTML5 Audio (`error`) | `stream_host`, `stream`, `error_code` | Diagnostyka awarii strumieni ZenoFM / CDN. |

### B2. Telewizja LIVE i Wideo

| Nazwa zdarzenia | Warunek wyzwolenia (Trigger) | Parametry | Reguła deduplikacji / bezpieczeństwa |
|---|---|---|---|
| `video_start` | Start odtwarzania `<video>` (`!el.muted`) lub wywołanie `trackVideoStart()` | `stream_host`, `stream`, `content_type` (`live_tv` \| `vod`), `initiation_type` (`user` \| `auto`) | Rozróżnia start zainicjowany przez użytkownika (do 5 s od gestu kliknięcia/klawiatury) od autostartu. |
| `video_progress` | Postęp odtwarzania materiału wideo | `stream_host`, `stream`, `percent_scrolled` / `video_current_time` | Zachowane dla kompatybilności z Enhanced Measurement. |
| `video_complete` | Ukończenie materiału wideo **wyłącznie o skończonym czasie trwania (VOD)** | `stream_host`, `stream`, `duration_seconds` | **Bezwzględna blokada dla `is_live === true`, `content_type === 'live_tv'` oraz `duration === Infinity`.** Przełączenie strumienia LIVE nie generuje `video_complete`. |
| `tv_watch_60s` | Potwierdzone **60 sekund** faktycznego oglądania wideo/TV (`!paused && !ended && !muted`) | `stream_host`, `stream`, `initiation_type` | Maks. 1 raz na sesję odtwarzacza wideo. |
| `tv_watch_300s` | Potwierdzone **300 sekund (5 minut)** faktycznego oglądania wideo/TV | `stream_host`, `stream`, `initiation_type` | **Kandydat na Key Event (Konwersję).** Maks. 1 raz na sesję odtwarzacza wideo. |
| `tv_channel_change` | Kliknięcie przełącznika kanału (`[data-tv-channel]`, `[data-channel-id]`) lub `trackTvChannelChange()` | `channel_id`, `previous_channel_id`, `initiation_type` | Rejestruje zmianę kanału bez fałszywego `video_complete`. |
| `video_error` | Błąd odtwarzania wideo (`error`) | `stream_host`, `stream`, `error_code` | Diagnostyka awarii HLS / MP4. |

### B3. Biblia Audio i MojaBiblia

| Nazwa zdarzenia | Warunek wyzwolenia (Trigger) | Obowiązkowe parametry | Ochrona prywatności |
|---|---|---|---|
| `bible_chapter_open` | Otwarcie rozdziału w `/mojabiblia` lub `/biblia-audio` (`trackBibleChapterOpen`) | `book_code`, `chapter_number`, `translation`, `content_type`, `player_type` | Tylko kod księgi (np. `JHN`), numer rozdziału (`3`) i przekład (`UBG`). |
| `bible_audio_start` | Rozpoczęcie odsłuchu rozdziału Biblii Audio (`<audio>` na `/biblia-audio/` lub `trackBibleAudioStart`) | `book_code`, `chapter_number`, `translation`, `content_type`, `player_type` | Automatycznie wyzwalane dla plików audio ksiąg biblijnych. |
| `bible_audio_complete` | Ukończenie odsłuchu rozdziału Biblii Audio (`ended` dla skończonego pliku lub `trackBibleAudioComplete`) | `book_code`, `chapter_number`, `translation`, `content_type`, `player_type` | **Kandydat na Key Event (Konwersję).** Zablokowane dla radia 24/7. |
| `bible_translation_select` | Zmiana przekładu Biblii (`UBG`, `BW`, `BT`, `BG`, `GRE`, `HEB`) | `book_code`, `chapter_number`, `translation`, `content_type`, `player_type` | Pomiar popularności przekładów. |
| `bible_search` | Wyszukiwanie wersetu lub kodu Stronga w MojaBiblia (`trackBibleSearch`) | `search_term`, `translation`, `content_type`, `player_type` | Filtr PII odrzuca zapytania zawierające adres e-mail lub numer telefonu. |
| `bible_bookmark_add` | Dodanie zakładki / ulubionego wersetu (`trackBibleBookmarkAdd`) | `book_code`, `chapter_number`, `translation`, `content_type`, `player_type` | **Kategoryczny zakaz wysyłania treści prywatnych notatek, modlitw i refleksji użytkownika.** |

### B4. Akademia i kursy

| Nazwa zdarzenia | Warunek wyzwolenia (Trigger) | Parametry | Reguła walidacji |
|---|---|---|---|
| `course_open` | Wejście na stronę główną kursu (`/akademia/<kurs>` lub `/kursy/<kurs>`) | `course` | Nie wyzwalane na konkretnej lekcji (tam działa `lesson_view`). |
| `lesson_view` | Wejście na stronę lekcji (`/akademia/<kurs>/dzien-XX` lub `/kursy/<kurs>/lekcja-XX`) | `course`, `lesson` | **100% kompatybilne z dotychczasową implementacją.** |
| `lesson_start` | Faktyczne rozpoczęcie interakcji z lekcją (przewinięcie `>= 15%` wysokości strony lub pierwsze kliknięcie w treść/audio lekcji) | `course`, `lesson`, `trigger` | Maks. 1 raz na otwarcie lekcji. |
| `lesson_complete` | Rzeczywiste ukończenie lekcji: **(A)** przewinięcie `>= 80%` treści ORAZ skumulowany czas zaangażowania `>= 30 sekund`, LUB **(B)** kliknięcie przycisku ukończenia lekcji (`[data-lesson-complete]`, `#kcCompleteLessonBtn`) | `course`, `lesson`, `trigger` | **Kandydat na Key Event (Konwersję).** Samo wejście na stronę NIGDY nie wyzwala `lesson_complete`. |
| `course_progress` | Aktualizacja procentowego postępu w kursie (automatycznie przy `lesson_complete` lub przez `trackCourseProgress`) | `course`, `lesson`, `progress_percent` (`0–100`) | Pozwala mierzyć, ilu studentów dochodzi do końca kursu. |

### B5. Wspieranie misji

| Nazwa zdarzenia | Warunek wyzwolenia (Trigger) | Parametry | Pancerna zasada uczciwości finansowej i RODO |
|---|---|---|---|
| `support_view` | Otwarcie strony wsparcia (`/wspieraj`, `/pomogebomoge`, `/darowizna`, `/patron`, `/mecenas`) | `page_path` | Mierzy zainteresowanie wsparciem misji. |
| `support_method_select` | Wybór metody wsparcia (`[data-support-method]`: `blik`, `bank`, `patronite`, `revolut`, `zrzutka`, `paypal`) | `method` | Bez kwot i bez danych osobowych. |
| `donate_click` | Kliknięcie w link zewnętrzny prowadzący do bramki wsparcia (`patronite.pl`, `zrzutka.pl`, `revolut.me`, `paypal`, `/wspieraj`) | `link_url`, `place` | **ZAKAZ traktowania `donate_click` jako dokonanej wpłaty.** |
| `support_copy_account` | Kliknięcie przycisku kopiowania numeru konta bankowego IBAN (`[data-support-copy-account]`, `#copyAccountBtn`) | `currency` (`PLN` \| `EUR` \| `USD`), `place` | Nie wysyła numeru konta ani danych użytkownika. |
| `support_form_submit` | Wysłanie formularza deklaracji patronatu / wsparcia (`trackSupportFormSubmit`) | `form_type` | **Kandydat na Key Event.** Nie wysyła imienia, nazwiska, e-maila ani kwoty. |
| `donation_complete` | **Wyłącznie po zweryfikowanym potwierdzeniu płatności** (`trackDonationComplete({ verified: true, method })`) | `method` | **Twarda blokada w kodzie (`ccTrack`):** każde wywołanie `donation_complete` bez `verified_payment: true` zwraca `false` i jest blokowane. Klucze `amount`, `kwota`, `donor_name`, `email` są automatycznie wycinane przez `sanitizeParams()`. |
