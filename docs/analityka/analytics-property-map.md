# MAPA USŁUG I STRUMIENI GA4 — CC ANALYTICS MISSION CONTROL 1.0 (`analytics-property-map.md`)

**Data:** 21 listopada 2026  
**Wykonawca:** Antigravity (`@A001`)  
**Status:** `ZROBIONE / TESTOWANE / WYMAGA UPRAWNIEŃ (dla 5 usług z HTTP 403)`

---

## 1. ZESTAWIENIE WSZYSTKICH 8 ZIDENTYFIKOWANYCH USŁUG GA4

| # | ID Usługi GA4 | Nazwa Usługi | Measurement ID (`G-*`) | Stream ID | Projekt GCP / Firebase | Domeny / Ścieżki w kodzie | Status Dostępu API (`lumina-cc`) | Dane (30 dni: 22 X – 20 XI) | Rekomendacja Architektoniczna |
|---|---|---|---|---|---|---|---|---|---|
| **1** | **`548623550`** | **Christian Culture (Polskie Radio CC)** | `G-Y4EFTVBPE3` (w `1 801` plikach) | `15383676066` | `lumina-cc` (`413985877183`) | `polskieradio.cc`, `www.polskieradio.cc`, `cclite.pl` | **200 OK (`ACTIVE_VERIFIED`)** | **1 521 użytk. / 2 630 sesji / 6 814 odsłon / 27 079 zdarzeń** | **GŁÓWNA USŁUGA KANONICZNA** całego ekosystemu WWW. |
| **2** | **`550097091`** | **Lumina** | `G-M24C85RG49` (w `223` plikach) | `15444169939` | `lumina-cc` (`413985877183`) | `polskieradio.cc/lumina`, `/mess`, `/tablica`, `/werset-dnia`, `werset-dnia.polskieradio.cc` | **200 OK (`ACTIVE_VERIFIED`)** | **73 użytk. / 195 sesji / 549 odsłon / 1 726 zdarzeń** | Usługa pomocnicza portalu społecznościowego LUMINA. Docelowo ujednolicić tak, aby każda strona LUMINA wysyłała dane także do głównej usługi `548623550`. |
| **3** | **`526422549`** | **Biblia Audio CC** | `G-K8PKXF3KSM` (`https://biblia.cclite.pl`, zastąpiony w kodzie przez `G-Y4EFTVBPE3`) | `13684646910` | `lumina-cc` (`413985877183`, Konto GA4: `385962006`) | Dawniej `biblia.cclite.pl` (obecnie `/biblia-audio/` używa `G-Y4EFTVBPE3`) | **200 OK (`ACTIVE_EMPTY_0_ROWS`)** | **0 użytk. / 0 sesji / 0 odsłon** | **NIE SCALAĆ / ZARCHIWIZOWAĆ.** Ruch `/biblia-audio/` (`134` odsłony, `43` użytk.) jest już w pełni rejestrowany w głównej usłudze `548623550`. |
| **4** | **`518223715`** | **christian-culture** | `G-6440T9VBQB` (w `21` plikach `dist/` i `lumina-db.js`) | `WYMAGA UPRAWNIEŃ NA KONCIE 379195658` | `christian-culture` (Konto GA4: `379195658` — `Default Account for Firebase`) | `christian-culture.web.app` | **403 (`REQUIRES_IAM_PERMISSION`)** | Niedostępne przez API bez nadania roli Viewer na koncie `379195658` | Dodać konto serwisowe `lumina-cc` jako Viewer w GA4 Admin (`accounts/379195658`) w celu odczytu archiwalnego. |
| **5** | **`529214226`** | **gen-lang-client-0094354839** | Prawdopodobny `G-9M92G6S27M` lub `G-P5L6Q1MXRL` | `WYMAGA UPRAWNIEŃ NA KONCIE 379195658` | `gen-lang-client-0094354839` (Konto GA4: `379195658` — Google AI Studio / Gemini API) | Projekt GCP wygenerowany przez Google AI Studio | **403 (`REQUIRES_IAM_PERMISSION`)** | Niedostępne przez API bez nadania roli Viewer na koncie `379195658` | Patrz Sekcja 2 poniżej (pełna identyfikacja właściciela i przeznaczenia). |
| **6** | **`522101206`** | **christian-culture-global** | Brak tagu w kodzie HTML | `WYMAGA UPRAWNIEŃ NA KONCIE 382396237` | `christian-culture-global` (Konto GA4: `382396237`, `worship-audio-cdn/.firebaserc`) | `christian-culture-global.web.app` (CDN plików MP3) | **403 (`REQUIRES_IAM_PERMISSION`)** | Niedostępne przez API bez nadania roli Viewer na koncie `382396237` | Projekt techniczny CDN dla plików audio — nie wymaga śledzenia GA4. |
| **7** | **`534305954`** | **aplikacja-christian-culture** | Strumień aplikacji mobilnej / PWA | `WYMAGA UPRAWNIEŃ NA KONCIE 382396237` | `cuda-398c0` / `cc-mission-control` (Konto GA4: `382396237`) | Aplikacja mobilna Android / Web | **403 (`REQUIRES_IAM_PERMISSION`)** | Niedostępne przez API bez nadania roli Viewer na koncie `382396237` | Dodać konto serwisowe `lumina-cc` jako Viewer na koncie GA4 `382396237`, aby połączyć statystyki aplikacji mobilnej w panelu `/test/analityka`. |
| **8** | **`526414935`** | **Radio CC Lite** | Zastąpiony przez `G-Y4EFTVBPE3` | `WYMAGA UPRAWNIEŃ NA KONCIE 385960831` | `cclite.pl` / `_cclite-release` (Konto GA4: `385960831`) | `cclite.pl` | **403 (`REQUIRES_IAM_PERMISSION`)** | Niedostępne przez API (domena `cclite.pl` raportuje już do `548623550`) | Domena `cclite.pl` (`10` użytk., `12` sesji, `21` odsłon w 30d) raportuje bezpośrednio do głównej usługi `548623550`. |

---

## 2. IDENTYFIKACJA USŁUGI `529214226` (`gen-lang-client-0094354839`)

Zgodnie z wymogiem Sekcji II Dyrektywy (*„Usługa o nazwie `gen-lang-client-0094354839` wymaga dodatkowej identyfikacji właściciela i przeznaczenia”*):

1. **Pochodzenie nazwy `gen-lang-client-0094354839`:**
   - W ekosystemie Google Cloud / Google AI Studio (`aistudio.google.com`) prefiks **`gen-lang-client-`** (*Generative Language Client*) wraz z 10-cyfrowym sufiksem (`0094354839`) jest **automatycznie nadawaną przez Google nazwą projektu GCP** w momencie, gdy użytkownik po raz pierwszy klika *„Create API key in new project”* dla interfejsu **Gemini API (`generativelanguage.googleapis.com`)**.
2. **Właściciel:**
   - Projekt należy do głównego konta Google właściciela Christian Culture (`nazirczarkes@gmail.com`), ponieważ jest widoczny na liście usług GA4 tego konta.
3. **Dlaczego powstała usługa GA4 o tej nazwie:**
   - Gdy projekt GCP `gen-lang-client-0094354839` został następnie otwarty w konsoli Firebase (lub użyty w Google AI Studio Build / Firebase Studio do wygenerowania prototypu aplikacji webowej, np. katalogu usług `/uslugi` z tagiem `G-9M92G6S27M` lub prototypu `temp.js` z `G-P5L6Q1MXRL`), kreator Firebase automatycznie włączył integrację Google Analytics i utworzył usługę GA4 o nazwie identycznej z ID projektu GCP (`gen-lang-client-0094354839`, Property ID: `529214226`).
4. **Rekomendacja:**
   - Nie łączyć z usługą główną `548623550`. Po potwierdzeniu w konsoli Google Analytics (`Admin -> Zarządzanie dostępem`), że usługa nie odbiera unikalnego ruchu produkcyjnego poza podwójnie otagowanym `/uslugi`, pozostawić projekt `gen-lang-client-0094354839` wyłącznie do obsługi kluczy Gemini API.

---

## 3. WYJAŚNIENIE BRAKU DANYCH W 5 USŁUGACH GA4

Podczas audytu API zbadano wszystkie 3 dostępne klucze serwisowe (`luminaServiceAccountKey.json`, `serviceAccountKey.json`, `cudaServiceAccountKey.json`):

1. **Usługa `526422549` (`Biblia Audio CC`):**
   - Konto serwisowe `firebase-adminsdk-fbsvc@lumina-cc.iam.gserviceaccount.com` **posiada uprawnienia Viewer** (HTTP `200 OK`), jednak zapytanie `runReport` za ostatnie 30 dni zwraca **0 wierszy (`rowCount: 0`)**.
   - **Przyczyna:** Podstrona `https://polskieradio.cc/biblia-audio/` została w październiku 2026 r. przepisana na główny tag `G-Y4EFTVBPE3` i wysyła wszystkie swoje odsłony (`134` w ostatnich 30 dniach) do głównej usługi `548623550`.
2. **Pozostałe 5 usług (`518223715`, `529214226`, `522101206`, `534305954`, `526414935`):**
   - Zapytania Data API z klucza `lumina-cc` zwracają HTTP `403 PERMISSION_DENIED`: `"User does not have sufficient permissions for this property."`
   - Zapytania z kluczy `cc-mission-control` (`519207260358`) oraz `cuda-398c0` (`422075095518`) zwracają HTTP `403 SERVICE_DISABLED`: `"Google Analytics Data API has not been used in project ... before or it is disabled."`
   - **Jak odblokować odczyt tych 5 usług w 60 sekund (Zero-Cost):**
     W panelu Google Analytics (`https://analytics.google.com`) dla każdej z tych 5 usług wejść w **Administracja -> Zarządzanie dostępem do usługi** i dodać adres:
     `firebase-adminsdk-fbsvc@lumina-cc.iam.gserviceaccount.com`
     z rolą **Przeglądający (Viewer)**. Ponieważ w projekcie `lumina-cc` interfejs `Google Analytics Data API` jest już aktywny, jeden klucz serwisowy odczyta wówczas wszystkie 8 usług bez włączania API w innych projektach GCP.

---

## 4. SZCZEGÓŁY STRUMIENI W AKTYWNYCH USŁUGACH (`548623550` ORAZ `550097091`)

### 4.1. Usługa `548623550` — Strumień `15383676066` (`Christian Culture`, `G-Y4EFTVBPE3`)
Rozkład hostów przesyłających dane do strumienia `15383676066` w ostatnich 30 dniach (22 X – 20 XI 2026):

| Host (`hostName`) | Aktywni użytkownicy | Sesje | Odsłony (`screenPageViews`) | Zdarzenia (`eventCount`) | Klasyfikacja |
|---|---:|---:|---:|---:|---|
| `polskieradio.cc` | 1 456 | 2 497 | 6 201 | 24 394 | **Produkcja (Kanoniczna)** |
| `www.polskieradio.cc` | 15 | 41 | 121 | 1 170 | **Produkcja (Alias www)** |
| `cclite.pl` | 10 | 12 | 21 | 75 | **Produkcja (Radio CC Lite)** |
| `localhost` | 8 | 41 | 254 | 865 | **Ruch deweloperski / testy** |
| `ml.test` | 8 | 8 | 118 | 296 | **Ruch testowy Playwright** |
| `127.0.0.1` | 7 | 10 | 31 | 78 | **Ruch deweloperski / testy** |
| `tvw.test` | 6 | 6 | 27 | 73 | **Ruch testowy Playwright** |
| `*.polskieradio.pages.dev` (7 subdomen preview) | 16 | 20 | 38 | 119 | **Środowiska preview Cloudflare Pages** |
| `lumina-cc-b90b0.web.app` | 3 | 3 | 3 | 9 | **Mirror Firebase Hosting** |

### 4.2. Usługa `550097091` — Strumień `15444169939` (`Lumina`, `G-M24C85RG49`)
Rozkład podstron przesyłających dane do strumienia `15444169939` w ostatnich 30 dniach:

| Host (`hostName`) | Ścieżka (`pagePath`) | Aktywni użytkownicy | Sesje | Odsłony | Zdarzenia |
|---|---|---:|---:|---:|---:|
| `polskieradio.cc` | `/lumina` | 23 | 76 | 210 | 500 |
| `polskieradio.cc` | `/mess` | 18 | 70 | 177 | 540 |
| `polskieradio.cc` | `/tablica` | 12 | 40 | 60 | 299 |
| `polskieradio.cc` | `/werset-dnia` | 36 | 38 | 37 | 162 |
| `polskieradio.cc` | `/lumina-profile` | 6 | 12 | 18 | 53 |
| `polskieradio.cc` | `/lumina-tablica` | 5 | 12 | 17 | 80 |
| `werset-dnia.polskieradio.cc` | `/` | 6 | 7 | 7 | 27 |
| `polskieradio.cc` | `/lumina.wiolettarogowska` | 3 | 4 | 6 | 14 |
| `polskieradio.cc` | `/lumina.cezaryrgowski` | 3 | 3 | 4 | 11 |
| `werset-dnia.pages.dev` | `/` | 3 | 3 | 3 | 12 |
