# AUDYT ISTNIEJĄCEGO EKOSYSTEMU EKOCC — CC RELATIONSHIP ENGINE (CCRE)
**Dokument:** `docs/ccre/00-audit.md`  
**Wersja:** 1.0 (2026-10-31)  
**Autor:** Antigravity (@001) / Konsultacja: @077, @005, @004, @777  
**Status:** AUDYT UKOŃCZONY — STAN FAKTYCZNY (Bramka GA-0)  

---

## 1. Wprowadzenie i Cel Audytu

Niniejszy dokument przedstawia faktyczny stan technologiczny, infrastrukturę, tożsamość, media, dane i mechanizmy retencji w ekosystemie Christian Culture (`EkoCC`), pod kątem wdrożenia silnika relacyjnego **CC Relationship Engine (CCRE)**.

> **Żelazna zasada audytu:** Nie opieramy się na przypuszczeniach ani deklaracjach marketingowych. Wszystkie ustalenia wynikają bezpośrednio z analizy repozytoriów, konfiguracji Cloudflare Pages, kodu workerów, schematów baz danych oraz reguł bezpieczeństwa.

---

## 2. Inwentaryzacja Technologiczna (Stan Faktyczny)

### 2.1 Domeny, Portale i Hosting
- **Główna domena produkcyjna:** `https://polskieradio.cc`
- **Hosting i CDN:** Cloudflare Pages (projekt: `polskieradio`, domena techniczna `polskieradio.pages.dev`).
- **Architektura brzegowa (Edge):** Cloudflare Workers (`_worker.js`) z routingiem statycznym, dynamicznymi endpointami `/api/*` oraz blokadą plików prywatnych (`BLOCKED_PREFIXES`, `BLOCKED_FILES`, `BLOCKED_EXTENSIONS`).
- **Główne moduły WWW:**
  - Radio CC Live 24/7 (`polskieradio.cc/`, `polskieradio.cc/player`)
  - Biblia Audio CC (`polskieradio.cc/biblia-audio`)
  - Akademia Biblijna & Kurs Codzienny (`polskieradio.cc/akademia`, `polskieradio.cc/akademia#kurscodzienny`)
  - MojaBiblia Interlinearna (`polskieradio.cc/mojabiblia`)
  - Kino Chrześcijańskie VOD (`polskieradio.cc/vod`)
  - Portale tematyczne CCN News (`/news`, `/nauka`, `/historia`, `/biologia`, `/prawo`, `/seks`, `/edukacja`, `/finanse`, `/psychologia`)
  - Portal społecznościowy LUMINA (`polskieradio.cc/lumina`, `lumina-tablica.html`, `lumina-profile.html`)
  - Strona wsparcia i mecenatu (`polskieradio.cc/wspieraj`)
  - Newsletter (`polskieradio.cc/newsletter`)

### 2.2 Tożsamość i Uwierzytelnianie (Identity & Auth)
- **Goście (Odwiedzający):** 100% anonimowi, brak konieczności logowania, brak śledzących ciasteczek stron trzecich (third-party cookies).
- **LUMINA (Społeczność):** Firebase Authentication (`cuda-398c0` / `cc-mission-control`).
- **CC PASS / Globalne SSO:** `BRAK` — obecnie nie istnieje zunifikowane SSO obejmujące całe `polskieradio.cc`. Przejście między LUMINA a stroną radiową jest luźno powiązane.
- **Konsekwencja dla CCRE:** Moduły dla gości (Warm Welcome, CC Dzisiaj, Kontynuacja) **muszą działać w 100% lokalnie i bezloginkowo (LocalStorage first)**, bez uzależniania funkcji od zalogowania. Synchronizacja chmurowa to funkcja opcjonalna wyłącznie po zalogowaniu.

### 2.3 Audio, Wideo i Odtwarzacze
- **Radio LIVE 24/7:** Strumień Icecast/Zeno: `https://stream.zeno.fm/gn3uhltrrytuv`.
- **Biblia Audio:** Pliki studyjne MP3 (320 kbps, mastering radiowy EBU R128: -16 LUFS) hostowane bezpośrednio w `/biblia-audio/audio/` (dostępne Rdz 1–9).
- **Podcasty i Wideo:** Embedy YouTube (oficjalna playlista serii Księga Rodzaju: `PLcU_14pQp0SY`).
- **Stan odtwarzania (Resume):** Brak globalnego stanu zapamiętywania pozycji odsłuchu pomiędzy podstronami — każdy odtwarzacz zarządza stanem lokalnie w sesji. CCRE M3 rozwiąże ten problem bez naruszania prywatności.

### 2.4 Katalog Treści i Wyszukiwanie
- Istniejące rejestry:
  - `data/cc-search-index.json` (ponad 100 wpisów: moduły, audycje, profile, artykuły, werset dnia).
  - `data/ccn-article-routes.js` (kanoniczne trasy artykułów i portali CCN).
  - `biblia-audio/data/catalog.json` (50 rozdziałów Księgi Rodzaju z metadanymi i częściami audio).
  - `szukaj/catalog.json` (lekcje Akademii i Kursu Codziennego).
  - `data/ecosystem-map.json` (rejestr projektów EkoCC na mapie ekosystemu).
- **Problem / Luka:** Brak jednego zunifikowanego adaptera odczytującego te źródła jako spójny strumień API / JSON dla widgetów kontynuacji i rekomendacji.

### 2.5 Komunikacja i Newsletter
- **Baza danych:** Cloudflare D1 (`newsletter_subscribers`, `newsletter_preferences`, `newsletter_tokens`, `newsletter_audit_log`, `newsletter_suppressions`).
- **Mechanizm zapisu:** Double Opt-In (DOI), hashowanie tokenów SHA-256, jednoetapowy wypis (POST /api/newsletter/unsubscribe).
- **Transport e-mail:** Gmail SMTP (darmowe konta misyjne przez hasła aplikacji).
- **Bezpiecznik:** Flaga `NEWSLETTER_DELIVERY_ENABLED=false` gwarantuje tryb bezpiecznego testu (dry-run).

### 2.6 Prywatność, RODO i Cookies
- **Polityka prywatności:** `privacy.html` (zaktualizowana pod RODO i transparentność przetwarzania).
- **Ciasteczka:** Brak inwazyjnych trackerów.
- **Analityka:** Google Analytics 4 (`G-Y4EFTVBPE3`) z flagą wyłączenia dla zespołu (`?cc_team=1`), bez profilowania religijnego i bez zbierania danych wrażliwych.

### 2.7 Budżet i Finanse (ZERO COST)
- Hosting Cloudflare Pages: Free Tier (nielimitowany transfer, 0 zł).
- Cloudflare Workers: Free Tier (100 000 req/dzień, 0 zł).
- Cloudflare D1: Free Tier (5 mln odczytów/dzień, 100k zapisów/dzień, 5 GB storage, 0 zł).
- GitHub: Public/Private repos Free Tier (0 zł).
- **Bieżący koszt miesięczny EkoCC:** **0,00 PLN**.
- **Wymóg CCRE:** Cały silnik musi zachować **0,00 PLN** kosztów operacyjnych.

---

## 3. Raport Braków (Gap Analysis)

| Obszar CCRE | Stan Obecny w Repo | Wymagany Stan CCRE | Zidentyfikowana Luka / Rozwiązanie |
|---|---|---|---|
| **M1: Wspólny Katalog** | Rozproszone JSON-y (`cc-search-index.json`, `catalog.json`, `ccn-article-routes.js`) | Jeden zunifikowany adapter normalizujący (`/api/ccre/v1/catalog` lub moduł JS) | Brak ujednoliconego kontraktu CCRE. Rozwiązanie: utworzyć adapter `ccre-catalog.js` i endpoint GET. |
| **M2: CC Dzisiaj** | `werset-dnia`, `inspiracje`, codzienne rozważania w oddzielnych plikach | Spójny widok „Co dziś w Christian Culture” (Słowo + Radio + Odcinek + Premiera) | Brak zagregowanego widoku dla gościa. Rozwiązanie: moduł `ccre-today.js`. |
| **M3: Kontynuacja (Resume)** | Odtwarzacze nie zapisują pozycji lub robią to lokalnie bez wspólnego standardu | Wznowienie odsłuchu/czytania (±5s tolerancja, throttled 15s, LocalStorage) | Brak ustandaryzowanego klucza i zdarzeń. Rozwiązanie: `ccre-progress.js` (0 egress, 100% private). |
| **M4: Biblioteka & Zapisane** | Schowek / zakładki nie istnieją dla gości | Zakładki „Na później” w LocalStorage z opcją eksportu/importu JSON | Pełny brak mechanizmu zapisu ulubionych treści w sekcjach portalu. |
| **M5: Kalendarz Premier** | Brak publicznego pliku iCalendar (.ics) dla słuchowisk | Plik `premieres.ics` + dynamiczny widok premier w czasie Europe/Warsaw | Brak feedu ICS. Rozwiązanie: statyczny generator / endpoint `.ics`. |
| **M6: Retencja & Agregaty** | Brak ujednoliconych metryk D1/D7/D30 opartych na prawie | Dyskretny, zanonimizowany pomiar kohortowy bez zbierania wrażliwych danych | Brak definicji kohortowej. Rozwiązanie: specyfikacja `09-retention-definitions.md`. |
| **M7: Społeczność** | Komentarze w Lumina, formularze kontaktu rozproszone | Propozycje tematów, świadectwa pod moderacją, anty-spam | Rozszerzenie formularzy w istniejącym workerze. |
| **M8: CC Warm Welcome** | Wdrożony testowo w Lumina Toast, brak uniwersalnego bąbelka | Subtelny dymek powitania/błogosławieństwa (10s delay, 24h cooldown, opt-out, a11y) | Wdrożyć `cc-warm-welcome.js` i `cc-warm-welcome.css` w architekturze ZERO COST. |

---

## 4. Wnioski Audytu i Bramka GA-0

> [!IMPORTANT]
> **Decyzja Bramki GA-0:** **PASS (WARUNKOWY)**
> - Infrastruktura techniczna (`polskieradio.cc`, Cloudflare Pages + Worker + D1, LocalStorage) w 100% umożliwia realizację projektu CCRE bez jakichkolwiek kosztów zewnętrznych (**ZERO COST**).
> - Wdrażanie modułów należy realizować **etapowo w branchu `feature/cc-relationship-engine-v1`**, rozpoczynając od komponentu frontendowego **CC Warm Welcome** oraz adapterów katalogu, CC Dzisiaj i kontynuacji.
> - Kategoryczny zakaz bezpośredniej publikacji na produkcję bez uprzednich testów E2E, audytu bezpieczeństwa i zgody Operatora.
