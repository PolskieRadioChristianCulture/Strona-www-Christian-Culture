# PLAN ZMIAN ADMINISTRACYJNYCH W GA4 — CC ANALYTICS MISSION CONTROL 1.0 (`analytics-ga4-admin-changes.md`)

**Data:** 21 listopada 2026  
**Wykonawca:** Antigravity (`@A001`)  
**Docelowa usługa główna:** `548623550` (`Christian Culture`, strumień `15383676066`, `G-Y4EFTVBPE3`)  
**Status:** **`ZROBIONE I ZWERYFIKOWANE PRZEZ GOOGLE ANALYTICS ADMIN API (HTTP 200 OK — 21.11.2026)`**

---

## 0. POTWIERDZENIE WDROŻENIA W GOOGLE ANALYTICS ADMIN API (`properties/548623550`)

Po zatwierdzeniu przez Właściciela wszystkie kluczowe zmiany administracyjne w usłudze `548623550` zostały wprowadzone i potwierdzone bezpośrednim odczytem z `analyticsadmin.googleapis.com`:

1. **Retencja danych (`properties/548623550/dataRetentionSettings`) — `ZROBIONE`:**
   - `eventDataRetention`: **`FOURTEEN_MONTHS`** (zmieniono z `TWO_MONTHS`),
   - `userDataRetention`: **`FOURTEEN_MONTHS`**, `resetUserDataOnNewActivity`: **`true`**.
2. **Google Signals (`properties/548623550/googleSignalsSettings`) — `ZROBIONE`:**
   - `state`: **`GOOGLE_SIGNALS_DISABLED`** (wyłączono zbieranie danych reklamowych zgodnie z minimalizacją danych RODO).
3. **Najważniejsze zdarzenia / Key Events (`properties/548623550/keyEvents`) — `ZROBIONE (6/6 utworzonych)`:**
   - `radio_listen_300s` (`properties/548623550/keyEvents/16386885611`)
   - `tv_watch_300s` (`properties/548623550/keyEvents/16386855059`)
   - `bible_audio_complete` (`properties/548623550/keyEvents/16386860325`)
   - `lesson_complete` (`properties/548623550/keyEvents/16386896463`)
   - `support_form_submit` (`properties/548623550/keyEvents/16386870205`)
   - `donation_complete` (`properties/548623550/keyEvents/16386913077`)
4. **Wymiary niestandardowe / Custom Dimensions (`properties/548623550/customDimensions`) — `ZROBIONE (6/6 utworzonych, zakres: EVENT)`:**
   - `Book Code` -> `book_code` (`customDimensions/16386904576`)
   - `Chapter Number` -> `chapter_number` (`customDimensions/16386895594`)
   - `Bible Translation` -> `translation` (`customDimensions/16386914941`)
   - `Content Type` -> `content_type` (`customDimensions/16386892763`)
   - `Player Type` -> `player_type` (`customDimensions/16386881635`)
   - `Initiation Type` -> `initiation_type` (`customDimensions/16386923932`)
5. **Naprawa błędnego parametru `utm_source=chatgpt.com)` — `ZROBIONE W KODZIE (_worker.js + js/cc-analytics.js)`:**
   - Na poziomie Cloudflare Worker (`_worker.js` — przekierowanie `301`) oraz w skrypcie `js/cc-analytics.js` (`normalizeCampaignQueryInUrl()`) automatycznie usuwany jest doklejony nawias zamykający `)` z parametrów `utm_*` i dopisywane `utm_medium=ai-assistant`, dzięki czemu ruch z ChatGPT trafia do kanału `AI Assistant`, a nie `Unassigned`.

---

## 1. ETAP C1 — KONFIGURACJA NAJWAŻNIEJSZYCH ZDARZEŃ (KEY EVENTS / KONWERSJE)

Obecnie w usłudze `548623550` liczba zarejestrowanych zdarzeń kluczowych (Key Events) wynosi **0**. Zgodnie z wytycznymi Etapu C1:
- **NIE oznaczać** zwykłych kliknięć (`donate_click`, `promo_click`, `click`, `scroll`, `page_view`, `lesson_view`) jako najważniejszych zdarzeń, ponieważ zawyżałoby to współczynnik konwersji bez potwierdzenia realnego zaangażowania.
- W panelu **GA4 -> Administracja -> Wyświetlanie danych -> Najważniejsze zdarzenia (Key events)** dla usługi `548623550` należy zarejestrować dokładnie **6 poniższych zdarzeń**:

| # | Nazwa zdarzenia (Key Event) | Metoda zliczania w GA4 | Uzasadnienie misyjne |
|---|---|---|---|
| **1** | `radio_listen_300s` | **Raz na sesję** (*Once per session*) | Potwierdzony 5-minutowy odsłuch radia na żywo (odfiltrowuje przypadkowe włączenia na kilka sekund). |
| **2** | `tv_watch_300s` | **Raz na sesję** (*Once per session*) | Potwierdzone 5-minutowe oglądanie kanału telewizyjnego LIVE. |
| **3** | `bible_audio_complete` | **Raz na zdarzenie** (*Once per event*) | Pełne wysłuchanie rozdziału Biblii Audio / słuchowiska biblijnego. |
| **4** | `lesson_complete` | **Raz na sesję** (*Once per session*) | Faktyczne przestudiowanie lekcji Akademii Biblijnej / Kursu Codziennego (przewinięcie `>= 80%` + czas `>= 30 s` lub przycisk ukończenia). |
| **5** | `support_form_submit` | **Raz na sesję** (*Once per session*) | Wysłanie formularza deklaracji wsparcia / patronatu rozdziału. |
| **6** | `donation_complete` | **Raz na zdarzenie** (*Once per event*) | Zweryfikowane potwierdzenie darowizny (wyzwalane wyłącznie po potwierdzeniu płatności, nigdy przy kliknięciu przycisku). |

---

## 2. ETAP C2 — ATRYBUCJA, ŹRÓDŁA RUCHU I NAPRAWA BŁĘDÓW (`chatgpt.com)` ORAZ SELF-REFERRAL)

### 2.1. Diagnoza zniekształconego źródła `chatgpt.com)` (79 sesji w kanale `Unassigned`)
- **Dowód z GA4 Data API:**
  - `chatgpt.com) / (not set)` — `73` sesje (`303` odsłony, śr. czas `386,4 s`)
  - `chatgpt.com) / ` — `4` sesje (`5` odsłon)
  - `chatgpt.com) / (none)` — `2` sesje (`12` odsłon)
- **Pochodzenie błędu:**
  Linki udostępniane lub zapisywane w dokumentach Markdown / konwersacjach ChatGPT w nawiasach okrągłych — np. `(https://polskieradio.cc/?utm_source=chatgpt.com)` — przy automatycznym parsowaniu bez spacji przed nawiasem zamykającym przekazały do URL wartość `utm_source=chatgpt.com)`. Ponieważ obecna wartość `utm_source` zawiera nawias `)` i nie ma parametru `utm_medium`, domyślne reguły grup kanałów GA4 nie dopasowują jej do `AI Assistant` i wrzucają sesję do **`Unassigned`**.
- **Działanie naprawcze (bez przepisywania historycznych danych):**
  1. W konfiguracji niestandardowych grup kanałów (**GA4 -> Administracja -> Wyświetlanie danych -> Grupy kanałów**) dla kanału **`AI Assistant`** dodać warunek wyrażenia regularnego (Regex) dla `Źródło (Source)`:
     `^(chatgpt\.com\)?|chat\.openai\.com|claude\.ai|gemini\.google\.com|perplexity\.ai|copilot\.microsoft\.com)$`
  2. W kodzie startowym (przed wywołaniem `gtag('config')`) lub na poziomie Cloudflare Worker oczyszczać w locie parametr `utm_source` z końcowych znaków interpunkcyjnych (`)`, `]`, `>`, `.`, `,`).

### 2.2. Diagnoza własnych odesłań (`polskieradio.pages.dev / referral` oraz `polskieradio.cc / referral`)
- **Dowód z GA4 Data API:**
  - `polskieradio.pages.dev / referral` — `11` sesji (`44` odsłony)
  - `polskieradio.cc / referral` — `2` sesje (`3` odsłony)
  - `accounts.google.com / referral` — `1` sesja (powrót po logowaniu Google OAuth do LUMINA!)
- **Działanie naprawcze w GA4 Admin:**
  Wejść w **Administracja -> Zbieranie i modyfikowanie danych -> Strumienie danych -> Christian Culture (`15383676066`) -> Skonfiguruj ustawienia tagów -> Pokaż wszystko -> Konfiguracja niechcianych odesłań (List unwanted referrals)** i dodać:
  1. `polskieradio.cc` (*Domena pasuje do wyrażenia / Contains*)
  2. `polskieradio.pages.dev` (*Domena kończy się na / Ends with*)
  3. `cclite.pl`
  4. `accounts.google.com` (aby powrót z okna logowania Google OAuth nie przerywał oryginalnej sesji użytkownika i nie nadpisywał źródła wejścia jako referral z Google Accounts!)
  5. `lumina-cc.firebaseapp.com`

### 2.3. Kanoniczny Schemat Tagowania UTM dla Ekosystemu Christian Culture
Aby wyeliminować wpadanie ruchu z WhatsAppa, Facebooka i newslettera do worka `Direct` (`50,6%` wszystkich sesji), należy stosować jednolity schemat małych liter (lowercase, bez nawiasów na końcu linku):

| Kanał dystrybucji | `utm_source` | `utm_medium` | `utm_campaign` (wzór) | Przykład pełnego linku |
|---|---|---|---|---|
| **WhatsApp — Grupy rotacyjne FIFO** | `whatsapp` | `social_group` | `dzj_rozwazanie_2026` | `https://polskieradio.cc/?utm_source=whatsapp&utm_medium=social_group&utm_campaign=dzj_rozwazanie_2026` |
| **WhatsApp — Udostępnij lekcję KC** | `whatsapp` | `share_button` | `kc_z_biblia_za_pan_brat` | `https://polskieradio.cc/akademia/kurscodzienny/dzien-19?utm_source=whatsapp&utm_medium=share_button&utm_campaign=kc_z_biblia_za_pan_brat` |
| **Facebook — Fanpage oficjalny** | `facebook` | `social_organic` | `cc_daily_post` | `https://polskieradio.cc/news?utm_source=facebook&utm_medium=social_organic&utm_campaign=cc_daily_post` |
| **YouTube — Opisy filmów i transmisji** | `youtube` | `video_description` | `sds_apokalipsa` | `https://polskieradio.cc/akademia?utm_source=youtube&utm_medium=video_description&utm_campaign=sds_apokalipsa` |
| **Newsletter e-mail CC** | `newsletter_cc` | `email` | `tygodnik_cc_2026` | `https://polskieradio.cc/?utm_source=newsletter_cc&utm_medium=email&utm_campaign=tygodnik_cc_2026` |
| **Powiadomienia Push FCM** | `fcm_push` | `push_notification` | `poranna_lekcja` | `https://polskieradio.cc/akademia/kurscodzienny?utm_source=fcm_push&utm_medium=push_notification&utm_campaign=poranna_lekcja` |

---

## 3. ETAP C3 — FILTRY RUCHU TECHNICZNEGO, RODO, CONSENT MODE V2 I RETENCJA

### 3.1. Aktywacja filtra ruchu wewnętrznego i technicznego w GA4 Admin
W kodzie stron (`apply-ga-internal-traffic.mjs` oraz `js/cc-analytics.js` v2.0) parametr `traffic_type: 'internal'` (dla `?cc_team=1`, `?in_mcr=1`, `window.obsstudio`) oraz `traffic_type: 'technical_monitor'` (dla `navigator.webdriver`, `localhost`, `127.0.0.1`, `*.test`) jest już automatycznie wysyłany.
- **Krok w GA4 Admin (wymaga zatwierdzenia właściciela, ponieważ filtry w GA4 działają od momentu włączenia):**
  1. **Administracja -> Zbieranie i modyfikowanie danych -> Filtry danych (Data filters):**
  2. Sprawdzić filtr **`Internal Traffic`** (`traffic_type = internal`) — najpierw przełączyć w stan **Testowanie (Testing)**, zweryfikować w raporcie czasu rzeczywistego wymiar *Nazwa filtra danych testowych*, a po potwierdzeniu przez właściciela przełączyć na **Aktywny (Active)**.
  3. Utworzyć drugi filtr **`Technical & Automated Monitoring`** wykluczający zdarzenia z parametrem `traffic_type = technical_monitor` (tryb: **Testowanie**, do akceptacji właściciela).

### 3.2. Zgodność z RODO (GDPR) i Google Consent Mode v2
Audyt repozytorium wykazał **niespójność mechanizmu zgody** pomiędzy sekcjami portalu:
1. **Strony posiadające Consent Mode v2 (`default: denied`):**
   - `40DM/analytics.js`, `the-journal/analytics.js`, `js/cc-search-consent.js` (`/wyszukiwarka`): pełny opt-in (`analytics_storage: 'denied'`, `window['ga-disable-G-Y4EFTVBPE3'] = true` do momentu kliknięcia *„Zgadzam się”*).
   - `uslugi.html`, `vod.html`, `lumina-tablica.html`, `lumina-profile.html`: posiadają blok `gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 })` aktualizowany po odczycie `localStorage.getItem('lumina_cookie_consent') === 'granted'`.
2. **Strony bez deklaracji `gtag('consent', 'default', ...)` (`index.html`, `/player`, `/mojabiblia`, `/akademia/*`):**
   - Ładują `gtag('config', 'G-Y4EFTVBPE3')` bezpośrednio przy wejściu, bez wcześniejszego wywołania `gtag('consent', 'default', ...)`.
3. **Zabezpieczenie wdrożone w `js/cc-analytics.js` v2.0:**
   - Moduł `cc-analytics.js` v2.0 sprawdza wszystkie klucze zgody (`lumina_cookie_consent`, `cc-search-analytics-consent-v1`, `cc-40dm-analytics-consent`, `cc-journal-analytics-consent`, `cc_analytics_consent`) oraz flagę `window['ga-disable-G-Y4EFTVBPE3']`. Jeżeli użytkownik wyraził odmowę (`denied` / `rejected`), `ccTrack()` blokuje wysyłanie jakichkolwiek zdarzeń.
   - Dodatkowo we wszystkich zdarzeniach wyłączono przesyłanie jakichkolwiek danych osobowych (PII), kwot darowizn, adresów e-mail, numerów telefonów oraz treści prywatnych modlitw i notatek.

### 3.3. Retencja danych i ustawienia prywatności w GA4 Admin (Potwierdzone przez świeżo włączone Google Analytics Admin API)
Odczyt z **Google Analytics Admin API (`v1beta/v1alpha`)** wykonany 21.11.2026 wykazał następujący rzeczywisty stan konfiguracji usług na koncie `accounts/385962006`:
- **Usługa `548623550` (`Polskie Radio Christian Culture`):**
  - `eventDataRetention`: **`TWO_MONTHS` (2 miesiące!)** — `userDataRetention`: `FOURTEEN_MONTHS` (`resetUserDataOnNewActivity: true`).
  - `googleSignalsSettings`: **`GOOGLE_SIGNALS_ENABLED`** (`consent: GOOGLE_SIGNALS_CONSENT_CONSENTED`).
  - `keyEvents`: tylko domyślne `purchase` (`ONCE_PER_EVENT`).
  - `customDimensions`: `{}` (brak zarejestrowanych wymiarów niestandardowych).
- **Usługa `550097091` (`Lumina`) oraz `526422549` (`Biblia Audio CC`):**
  - `eventDataRetention`: **`TWO_MONTHS` (2 miesiące!)**, `googleSignalsSettings`: `GOOGLE_SIGNALS_DISABLED`.

W panelu **GA4 -> Administracja -> Zbieranie i modyfikowanie danych** dla usługi `548623550` oraz `550097091` należy zmienić:
1. **Przechowywanie danych (Data retention):**
   - *Przechowywanie danych o zdarzeniach (Event data retention)*: zmienić z obecnych **2 miesięcy (`TWO_MONTHS`)** na **14 miesięcy (`FOURTEEN_MONTHS`)** (maksymalny bezpłatny okres w standardowym GA4, niezbędny do porównań rok do roku w eksploracjach).
   - *Resetuj dane użytkownika przy nowej aktywności (Reset user data on new activity)*: pozostawić **Włączone (ON)**.
2. **Zbieranie danych (Data collection — Google Signals):**
   - W usłudze `548623550` zmienić *Zbieranie danych przez Google Signals* z obecnego `GOOGLE_SIGNALS_ENABLED` na **Wyłączone (OFF)** — zgodnie z zasadą minimalizacji danych RODO i brakiem kampanii remarketingowych Google Ads w misji Christian Culture.
3. **Niestandardowe wymiary (Custom dimensions) do zarejestrowania w GA4 Admin (`Zakres: Zdarzenie`):**
   - `book_code` (Kod księgi biblijnej, np. `JHN`, `GEN`)
   - `chapter_number` (Numer rozdziału)
   - `translation` (Przekład Biblii, np. `UBG`, `BW`)
   - `content_type` (Typ treści, np. `audio_bible`, `live_tv`, `vod`, `search_result`)
   - `player_type` (Typ odtwarzacza, np. `reader`, `sticky_player`, `html5_audio`)
   - `initiation_type` (`user` vs `auto`)
   - `course` (Identyfikator kursu Akademii)
   - `lesson` (Identyfikator lekcji)
   - `polonia_hub` (Ośrodek strefy czasowej Polonii)
