# RUNBOOK WDROŻENIA PILOTAŻOWEGO I PRODUKCYJNEGO (LAUNCH RUNBOOK) — CCRE
**Dokument:** `docs/ccre/07-launch-runbook.md`  
**Wersja:** 1.0 (2026-10-31)  
**Autor:** Antigravity (@001) / Konsultacja: @004, @005, @777  
**Status:** INSTRUKCJA OPERACYJNA DLA OPERATORA L0  

---

## 1. Etapy Wdrożenia (Phased Rollout)

Wdrożenie CCRE podzielone jest na 3 kontrolowane kroki:
1. **Krok 1: Weryfikacja Lokalna (Branch `feature/cc-relationship-engine-v1`)**
   - Wszystkie pliki CCRE w izolacji.
   - Uruchomienie `node tests/ccre-engine.test.mjs`.
   - Uruchomienie `npm.cmd run test:guardian` oraz `npm.cmd run test:cc-regression`.
2. **Krok 2: Pilotaż Staging / Preview (Canary Deployment)**
   - Wdrożenie brancha na środowisko podglądowe Cloudflare Pages Preview.
   - Testy manualne na smartfonie i desktopie przez Operatora Nazira (L0) oraz @077.
   - Ocena odbioru estetycznego powitania Warm Welcome (czy dymek jest serdeczny, dyskretny i nienachalny).
3. **Krok 3: Publikacja Produkcyjna na `polskieradio.cc`**
   - Po formalnym zatwierdzeniu przez Operatora Nazira („tak” / „publikuj”):
   - Scalenie (Merge) brancha do `main`.
   - Podwójny Git Push:
     ```powershell
     git push origin main
     git push lumina-repo main
     ```
   - Aktualizacja Mapy Ekosystemu (`data/ecosystem-map.json`) z symbolem `A` (Antigravity).
   - Wpis końcowy w `JOMA_HANDOFFS.md` ze statusem `done`.

---

## 2. Playbook Kontrolny Przed Uruchomieniem

- [ ] Brak błędów w konsoli przeglądarki na testowych podstronach.
- [ ] Przyciski Warm Welcome posiadają min. 44px wysokości i pełny kontrast.
- [ ] Zmienna `dismissedForever` po kliknięciu „Nie pokazuj więcej” blokuje kolejne próby otwarcia dymka.
- [ ] Radio LIVE nie jest w żaden sposób przerywane ani zakłócane przez CCRE.
- [ ] D1 i Worker nie przekraczają darmowych limitów.
