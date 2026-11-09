# CC Guardian 360 — Raport Audytu Ekosystemu Christian Culture
**Sygnatura wykonania:** `2026-11-09T21-50-19-626Z`  
**Tryb:** Diagnostyka Zero-QA (Read-Only)  
**Stan:** P0: **0** | P1: **4** | P2: **10** | P3: **0** | Łącznie prób: **33**

---

## 1. Wykryte Incydenty i Obserwacje

| Priorytet | Serwis / Moduł | Ekran | Kategoria | Obserwacja / Diagnoza |
|---|---|---|---|---|
| **P1** | Komunikator LUMI MESS | mobile | visual-collision | Odtwarzacz wideo zasłonięty przez element: <lumi-dashboard> |
| **P1** | Komunikator LUMI MESS | tablet | visual-collision | Odtwarzacz wideo zasłonięty przez element: <INPUT> |
| **P1** | Komunikator LUMI MESS | desktop | visual-collision | Odtwarzacz wideo zasłonięty przez element: <SPAN> |
| **P1** | Interlinearna MojaBiblia | desktop | scan | page.screenshot: Timeout 30000ms exceeded. Call log: [2m  - taking page screenshot[22m [2m    - disabled all CSS animations[22m [2m  - waiting for fonts to load...[22m [2m  - fonts loaded[22m  |
| **P2** | Portal Główny Christian Culture | mobile | touch-target | Wykryto 15 przycisków o wymiarach dotykowych poniżej 40px |
| **P2** | Tablica Społeczności LUMINA | mobile | touch-target | Wykryto 20 przycisków o wymiarach dotykowych poniżej 40px |
| **P2** | Transmisja TV LIVE Master | mobile | touch-target | Wykryto 6 przycisków o wymiarach dotykowych poniżej 40px |
| **P2** | Transmisja TV LIVE Master | mobile | javascript | this.api.isExternalMethodAvailable is not a function |
| **P2** | Transmisja TV LIVE Master | tablet | javascript | this.api.isExternalMethodAvailable is not a function |
| **P2** | Transmisja TV LIVE Master | desktop | javascript | this.api.isExternalMethodAvailable is not a function |
| **P2** | Player Audio 24/7 | mobile | touch-target | Wykryto 11 przycisków o wymiarach dotykowych poniżej 40px |
| **P2** | Interlinearna MojaBiblia | mobile | layout | Poziomy overflow (scroll poziomy) — naruszenie responsywności mobilnej |
| **P2** | Interlinearna MojaBiblia | mobile | touch-target | Wykryto 164 przycisków o wymiarach dotykowych poniżej 40px |
| **P2** | Kino Chrześcijańskie VOD | mobile | touch-target | Wykryto 192 przycisków o wymiarach dotykowych poniżej 40px |

---

## 2. Pokrycie i Wydajność Serwisów

- **Portal Główny Christian Culture** [mobile]: HTTP 200, DOM: **5199 ms**, Błędy JS: **0**, Zrzut: `screenshots/Portal-G-wny-Christian-Culture-mobile.png`
- **Portal Główny Christian Culture** [tablet]: HTTP 200, DOM: **1068 ms**, Błędy JS: **0**, Zrzut: `screenshots/Portal-G-wny-Christian-Culture-tablet.png`
- **Portal Główny Christian Culture** [desktop]: HTTP 200, DOM: **1014 ms**, Błędy JS: **0**, Zrzut: `screenshots/Portal-G-wny-Christian-Culture-desktop.png`
- **Portal Społecznościowy LUMINA** [mobile]: HTTP 200, DOM: **1449 ms**, Błędy JS: **0**, Zrzut: `screenshots/Portal-Spo-eczno-ciowy-LUMINA-mobile.png`
- **Portal Społecznościowy LUMINA** [tablet]: HTTP 200, DOM: **1427 ms**, Błędy JS: **0**, Zrzut: `screenshots/Portal-Spo-eczno-ciowy-LUMINA-tablet.png`
- **Portal Społecznościowy LUMINA** [desktop]: HTTP 200, DOM: **1398 ms**, Błędy JS: **0**, Zrzut: `screenshots/Portal-Spo-eczno-ciowy-LUMINA-desktop.png`
- **Tablica Społeczności LUMINA** [mobile]: HTTP 200, DOM: **1901 ms**, Błędy JS: **0**, Zrzut: `screenshots/Tablica-Spo-eczno-ci-LUMINA-mobile.png`
- **Tablica Społeczności LUMINA** [tablet]: HTTP 200, DOM: **1591 ms**, Błędy JS: **0**, Zrzut: `screenshots/Tablica-Spo-eczno-ci-LUMINA-tablet.png`
- **Tablica Społeczności LUMINA** [desktop]: HTTP 200, DOM: **2238 ms**, Błędy JS: **0**, Zrzut: `screenshots/Tablica-Spo-eczno-ci-LUMINA-desktop.png`
- **Komunikator LUMI MESS** [mobile]: HTTP 200, DOM: **813 ms**, Błędy JS: **0**, Zrzut: `screenshots/Komunikator-LUMI-MESS-mobile.png`
- **Komunikator LUMI MESS** [tablet]: HTTP 200, DOM: **710 ms**, Błędy JS: **0**, Zrzut: `screenshots/Komunikator-LUMI-MESS-tablet.png`
- **Komunikator LUMI MESS** [desktop]: HTTP 200, DOM: **767 ms**, Błędy JS: **0**, Zrzut: `screenshots/Komunikator-LUMI-MESS-desktop.png`
- **Transmisja TV LIVE Master** [mobile]: HTTP 200, DOM: **293 ms**, Błędy JS: **1**, Zrzut: `screenshots/Transmisja-TV-LIVE-Master-mobile.png`
- **Transmisja TV LIVE Master** [tablet]: HTTP 200, DOM: **291 ms**, Błędy JS: **1**, Zrzut: `screenshots/Transmisja-TV-LIVE-Master-tablet.png`
- **Transmisja TV LIVE Master** [desktop]: HTTP 200, DOM: **282 ms**, Błędy JS: **1**, Zrzut: `screenshots/Transmisja-TV-LIVE-Master-desktop.png`
- **Player Audio 24/7** [mobile]: HTTP 200, DOM: **681 ms**, Błędy JS: **0**, Zrzut: `screenshots/Player-Audio-24-7-mobile.png`
- **Player Audio 24/7** [tablet]: HTTP 200, DOM: **820 ms**, Błędy JS: **0**, Zrzut: `screenshots/Player-Audio-24-7-tablet.png`
- **Player Audio 24/7** [desktop]: HTTP 200, DOM: **724 ms**, Błędy JS: **0**, Zrzut: `screenshots/Player-Audio-24-7-desktop.png`
- **Akademia Biblijna** [mobile]: HTTP 200, DOM: **1058 ms**, Błędy JS: **0**, Zrzut: `screenshots/Akademia-Biblijna-mobile.png`
- **Akademia Biblijna** [tablet]: HTTP 200, DOM: **944 ms**, Błędy JS: **0**, Zrzut: `screenshots/Akademia-Biblijna-tablet.png`
- **Akademia Biblijna** [desktop]: HTTP 200, DOM: **1004 ms**, Błędy JS: **0**, Zrzut: `screenshots/Akademia-Biblijna-desktop.png`
- **Kurs Codzienny Z Biblią za Pan Brat** [mobile]: HTTP 200, DOM: **868 ms**, Błędy JS: **0**, Zrzut: `screenshots/Kurs-Codzienny-Z-Bibli-za-Pan-Brat-mobile.png`
- **Kurs Codzienny Z Biblią za Pan Brat** [tablet]: HTTP 200, DOM: **819 ms**, Błędy JS: **0**, Zrzut: `screenshots/Kurs-Codzienny-Z-Bibli-za-Pan-Brat-tablet.png`
- **Kurs Codzienny Z Biblią za Pan Brat** [desktop]: HTTP 200, DOM: **809 ms**, Błędy JS: **0**, Zrzut: `screenshots/Kurs-Codzienny-Z-Bibli-za-Pan-Brat-desktop.png`
- **Interlinearna MojaBiblia** [mobile]: HTTP 200, DOM: **393 ms**, Błędy JS: **0**, Zrzut: `screenshots/Interlinearna-MojaBiblia-mobile.png`
- **Interlinearna MojaBiblia** [tablet]: HTTP 200, DOM: **439 ms**, Błędy JS: **0**, Zrzut: `screenshots/Interlinearna-MojaBiblia-tablet.png`
- **Interlinearna MojaBiblia** [desktop]: HTTP 200, DOM: **523 ms**, Błędy JS: **0**, Zrzut: `screenshots/Interlinearna-MojaBiblia-desktop.png`
- **Kino Chrześcijańskie VOD** [mobile]: HTTP 200, DOM: **495 ms**, Błędy JS: **0**, Zrzut: `screenshots/Kino-Chrze-cija-skie-VOD-mobile.png`
- **Kino Chrześcijańskie VOD** [tablet]: HTTP 200, DOM: **441 ms**, Błędy JS: **0**, Zrzut: `screenshots/Kino-Chrze-cija-skie-VOD-tablet.png`
- **Kino Chrześcijańskie VOD** [desktop]: HTTP 200, DOM: **427 ms**, Błędy JS: **0**, Zrzut: `screenshots/Kino-Chrze-cija-skie-VOD-desktop.png`
- **Kalendarz Misyjny ccMC** [mobile]: HTTP 200, DOM: **275 ms**, Błędy JS: **0**, Zrzut: `screenshots/Kalendarz-Misyjny-ccMC-mobile.png`
- **Kalendarz Misyjny ccMC** [tablet]: HTTP 200, DOM: **262 ms**, Błędy JS: **0**, Zrzut: `screenshots/Kalendarz-Misyjny-ccMC-tablet.png`
- **Kalendarz Misyjny ccMC** [desktop]: HTTP 200, DOM: **278 ms**, Błędy JS: **0**, Zrzut: `screenshots/Kalendarz-Misyjny-ccMC-desktop.png`

---

## 3. Wytyczne Strategiczne i Następne Kroki

1. **Weryfikacja P0/P1:** Wszelkie incydenty krytyczne wymagają natychmiastowej naprawy w repozytorium roboczym.
2. **Standard Zero-QA:** Uruchomić pełną baterię testów regresji (`npm.cmd run test:guardian`, `test:mobile-premium`, `test:cc-regression`) po każdej zmianie.
3. **Archiwizacja i Pamięć JOMA:** Wyniki skanu są automatycznie rejestrowane w `JOMA_HANDOFFS.md` oraz dostępne w `reports/2026-11-09T21-50-19-626Z/`.
