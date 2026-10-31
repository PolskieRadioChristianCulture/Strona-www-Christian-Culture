# ARCHITECTURE DECISION RECORD (ADR-001): CC RELATIONSHIP ENGINE (CCRE)
**Dokument:** `docs/ccre/01-architecture-adr.md`  
**Wersja:** 1.0 (2026-10-31)  
**Autor:** Antigravity (@001) / Konsultacja: @077 (Strategia Doświadczenia), @005 (Sekretariat), @004 (Harmonogram), @777 (Standardy)  
**Status:** PROPOSED / GATES DEFINED (Gotowy do zatwierdzenia przez Operatora L0)  

---

## 1. Kontekst i Uzasadnienie (Context)

Ekosystem Christian Culture (`EkoCC`) rozwija się dynamicznie wokół portali tematycznych, Radia LIVE 24/7, Biblii Audio CC, interlinearnej MojaBiblia, Akademii Biblijnej i społeczności LUMINA.
Obecnie relacja z użytkownikiem (w szczególności gościem anonimowym) jest rozproszona:
1. Brak pamięci o rozpoczętym odtwarzaniu/czytaniu (utrata kontekstu po przejściu na inną podstronę).
2. Brak dyskretnego, serdecznego powitania i orientacji dla nowych gości (Warm Welcome).
3. Brak zagregowanego widoku „Co nowego i ważnego dzisiaj w CC” łączącego radio, Słowo Boże, premierę odcinka i artykuł.
4. Potrzeba zachowania 100% zgodności z etyką chrześcijańską, nienaruszalności prywatności (RODO / ePrivacy) oraz **żelaznej zasady ZERO COST (0,00 PLN)**.

---

## 2. Decyzja Architektoniczna (Decision)

Wdrażamy **CC Relationship Engine (CCRE) v1.0** w architekturze hybrydowej: **LocalStorage-First + Cloudflare Edge Workers / D1 (opcjonalny sync)**.

### 2.1 Podział Modułowy (Modular Boundary)
Silnik składa się z 8 niezależnych modułów (M1–M8):
- **M1: Unified Content Catalog (`ccre-catalog.js`):** Standaryzowany model danych spajający audio, wideo, artykuły, lekcje i modlitwy w ujednolicone obiekty CCRE Content Item.
- **M2: CC Dzisiaj (`ccre-today.js`):** Dynamiczny widget „Co dzisiaj w EkoCC” (werset dnia, audycja na żywo, odcinek Biblii Audio, czytanie dnia).
- **M3: Kontynuacja Treści (`ccre-progress.js`):** Throttled (15s) zapis pozycji odtwarzacza/lektury w `localStorage`, obsługa wznowienia z marginesem -5s, 0 egress do serwera dla gości.
- **M4: Biblioteka & Zapisane (`ccre-library.js`):** Zakładki offline, historia aktywności z limitem 50 pozycji, eksport/import JSON, pełne prawo do zapomnienia (jednym kliknięciem).
- **M5: Kalendarz Premier (`ccre-premieres.js` & `premieres.ics`):** Harmonogram premier słuchowisk i audycji w formacie iCalendar (RFC 5545).
- **M6: Dyskretna Retencja & Kohorty (`ccre-retention.js`):** Anonimowy, zhashowany licznik wizyt D1/D7/D30 w pamięci przeglądarki (zero fingerprintingu, zero identyfikacji osoby).
- **M7: Dialog Społeczności & Propozycje:** Lekki formularz propozycji tematów i świadectw zintegrowany z istniejącym Cloudflare Workerem i D1.
- **M8: CC Warm Welcome (`cc-warm-welcome.js` + `cc-warm-welcome.css`):** Subtelny dymek powitalny dla gości po 10s od wejścia, z 24-godzinnym cooldownem, pełnym opt-outem („Nie pokazuj więcej”) i estetyką Champagne Gold (`#C4A35A`) / Pomarańczowy CTA (`#FF7A00`).

---

## 3. Bramki Zgody i Wdrożenia (Consent Gates GA-0 do GA-4)

Wdrożenie CCRE podlega ścisłej kontroli etapowej:

| Bramka | Nazwa Bramki | Kryteria Zaliczenia | Wymagana Zgoda | Status |
|---|---|---|---|---|
| **GA-0** | **Audyt & Architektura** | Zbadanie faktycznego stanu repo, zero regresji, budżet 0 zł, raport `00-audit.md` i ADR `01-architecture-adr.md`. | Przegląd wewnętrzny (@001, @005, @077) | **ZALICZONA (PASS)** |
| **GA-1** | **Frontend Modules (Branch)** | Implementacja modułów M8 (Warm Welcome), M1 (Katalog), M2 (Dzisiaj), M3 (Kontynuacja) na gałęzi `feature/cc-relationship-engine-v1`. Testy jednostkowe 100% PASS. | Weryfikacja kodu i a11y | **W TRAKCIE** |
| **GA-2** | **Testy Bezpieczeństwa & RODO** | Brak BOLA, brak wycieków danych wrażliwych, zero ciasteczek śledzących, testy mobile 44px, audyt Strażnika Kodu (`npm run test:guardian`). | Recenzent @150 & @077 | OCZEKUJE NA GA-1 |
| **GA-3** | **Canary / Pilot Staging** | Wdrożenie pilotażowe na subdomenie testowej / preview Cloudflare Pages, weryfikacja realnych czasów ładowania (INP < 200ms, LCP bez zmian). | Operator Nazir (L0) | OCZEKUJE NA GA-2 |
| **GA-4** | **General Availability (Produkcja)** | Włączenie flag funkcjonalnych na `polskieradio.cc`, aktywacja harmonogramów, rejestracja na Mapie Ekosystemu (@m). | **Wyłączna zgoda Operatora L0** | OCZEKUJE NA GA-3 |

---

## 4. Feature Flags (Flagi Funkcjonalne)

Każdy moduł CCRE jest zabezpieczony flagą konfiguracyjną (w kodzie i w zmiennych środowiskowych):

```javascript
window.CCRE_CONFIG = {
  enabled: true,                       // Główny wyłącznik bezpieczeństwa (Kill Switch)
  modules: {
    warmWelcome: true,                 // Moduł M8: Powitanie gościa
    catalog: true,                     // Moduł M1: Zunifikowany katalog
    today: true,                       // Moduł M2: Pulpit dzienny
    progress: true,                    // Moduł M3: Wznawianie treści
    library: false,                    // Moduł M4: Zapisane (faza 2)
    premieres: false,                  // Moduł M5: Kalendarz ICS (faza 2)
    retention: false,                  // Moduł M6: Statystyki kohortowe (faza 2)
    feedback: false                    // Moduł M7: Formularz propozycji (faza 2)
  },
  warmWelcome: {
    delayMs: 10000,                    // 10 sekund zwłoki
    displayDurationMs: 7000,           // 7 sekund autoukrywania (jeśli brak interakcji)
    cooldownHours: 24,                 // 24 godziny cooldownu po wyświetleniu
    storageKey: 'cc_warm_welcome_v1'
  },
  progress: {
    throttleMs: 15000,                 // Zapis co 15 sekund
    rewindSeconds: 5,                  // Cofnięcie o 5 sekund przy wznowieniu
    storageKey: 'cc_progress_state_v1'
  }
};
```

---

## 5. Granice Bezpieczeństwa i Integralności (Security & Integrity)

1. **Brak BOLA / IDOR:** Anonimowi goście nie mają kont serwerowych. Stan zapisywany jest wyłącznie w piaskownicy `window.localStorage` ich własnej przeglądarki. Serwer nie przechowuje historii odtwarzania pojedynczego anonimowego użytkownika.
2. **Ochrona Wyznań Wiary (RODO Art. 9 ust. 1):** Historia czytania/słuchania nie jest łączona z IP, e-mailem ani żadnym unikalnym identyfikatorem reklamowym. W LocalStorage nie stosujemy tagowania „konwersja”, „przekonania religijne”.
3. **Pojedynczy Aktywny Odtwarzacz:** Moduł CCRE nie inicjuje automatycznego odtwarzania audio (autoplay) w tle. Odtwarzanie audio wymaga jawnego kliknięcia użytkownika i respektuje wyciszenie innych kanałów radia.
4. **Zasada ZERO-COST:** Żadne zapytanie nie odpytuje płatnych API zewnętrznych. Zero OpenAI, zero zewnętrznych baz danych. Działa w 100% na darmowej infrastrukturze Cloudflare i przeglądarce klienta.

---

## 6. Procedura Rollbacku (Odwracalność)

W przypadku wykrycia jakiejkolwiek usterki, regresji lub spowolnienia:
1. Natychmiastowe ustawienie `window.CCRE_CONFIG.enabled = false` (lub w Cloudflare Workerze zmiennej `CCRE_ENABLED = false`).
2. Wszystkie komponenty natychmiast ukrywają się z drzewa DOM i zaprzestają nasłuchiwania zdarzeń.
3. Wycofanie commita w Git (`git revert`) lub powrót do poprzedniego wdrożenia na Cloudflare Pages zajmuje mniej niż 60 sekund.

---

## 7. Status i Rekomendacja

Architektura spełnia wszystkie kryteria dyrektywy Dowódcy Nazira (@777, ZERO COST, ochrona prywatności, ZERO-QA).  
Zaleca się zatwierdzenie ADR-001 i przystąpienie do realizacji etapu GA-1 (moduły M8, M1, M2, M3).
