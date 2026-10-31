# RUNBOOK PROCEDURY AWARYJNEJ I WYCOFANIA (ROLLBACK RUNBOOK) — CCRE
**Dokument:** `docs/ccre/08-rollback-runbook.md`  
**Wersja:** 1.0 (2026-10-31)  
**Autor:** Antigravity (@001) / Konsultacja: @777  
**Status:** PROCEDURA AWARYJNA (P0)  

---

## 1. Wyzwalacze Rollbacku (Kiedy wycofujemy?)

Procedura natychmiastowego rollbacku musi zostać uruchomiona w przypadku:
1. Jakiegokolwiek zakłócenia odtwarzania audycji radiowych LIVE lub Biblii Audio.
2. Zgłoszenia użytkowników o irytującym lub zablokowanym dymku powitalnym (np. niemożność zamknięcia).
3. Błędów JavaScript blokujących inne skrypty na stronach głównych ekosystemu.
4. Zwiększenia wskaźników LCP > 2.5s lub INP > 200ms wywołanych skryptami CCRE.

---

## 2. Metody Wycofania (Od Najszybszej)

### Poziom 1: Natychmiastowy Kill-Switch w przeglądarce (<1 sekunda)
Jeśli konieczne jest natychmiastowe zneutralizowanie modułów po stronie klienta, wystarczy wyczyścić lub przestawić flagę:
```javascript
window.CCRE_CONFIG.enabled = false;
```
W kodzie komponentów zaimplementowano natychmiastowe sprawdzenie `if (!window.CCRE_CONFIG?.enabled) return;`, co powoduje natychmiastowe zniknięcie elementów z DOM.

### Poziom 2: Wyłączenie w Cloudflare Dashboard / Pages (<2 minuty)
W panelu Cloudflare Pages wycofujemy wdrożenie do poprzedniego stabilnego deploymentu:
1. Wejdź w `Cloudflare Pages` -> projekt `polskieradio`.
2. W zakładce `Deployments` wskaż wdrożenie z commita `eb985d2f` (poprzednia stabilna wersja Biblii Audio).
3. Kliknij `Rollback to this deployment`.
4. Propagacja na całym świecie następuje w ciągu 30 sekund.

### Poziom 3: Git Revert na gałęzi produkcyjnej
```powershell
cd C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc
git checkout main
git revert HEAD -m 1 --no-edit
git push origin main
git push lumina-repo main
```

---

## 3. Komunikacja i Bezpieczeństwo
Po wykonaniu rollbacku:
1. Zgłoś fakt natychmiast do Skrzynki Misji JOMA do @005 i @777.
2. Wyjaśnij przyczynę usterki w `JOMA_HANDOFFS.md`.
3. Zabezpiecz logi błędów do analizy w środowisku lokalnym.
