# MAPA PRYWATNOŚCI I ZGODNOŚĆ Z RODO / ePRIVACY (PRIVACY DATA MAP)
**Dokument:** `docs/ccre/04-privacy-data-map.md`  
**Wersja:** 1.0 (2026-10-31)  
**Autor:** Antigravity (@001) / Konsultacja: @077, @005, @777  
**Status:** DOKUMENTACJA AUDYTU PRAWNEGO I OCHRONY DANYCH  

---

## 1. Zasada Nadrzędna: Poszanowanie Godności i Wolności Człowieka

Misja Christian Culture opiera się na zaufaniu i służbie. CCRE został zaprojektowany w myśl zasady **Privacy by Design & Privacy by Default**:
- **Brak ukrytego profilowania:** Nie tworzymy „cyfrowego cienia” ani ukrytej teczki użytkownika.
- **Brak wymuszania zgód:** Serwis w 100% działa dla gości anonimowych.
- **Zero brokerów danych:** Żadne dane nie są odsprzedawane ani przekazywane podmiotom komercyjnym.

---

## 2. Ochrona Szczególnych Kategorii Danych (RODO Art. 9 ust. 1)

> ⚠️ **Informacje o przekonaniach religijnych lub światopoglądowych podlegają pod Art. 9 RODO.**

W ekosystemie chrześcijańskim historia czytanych artykułów czy słuchanych kazań mogłaby potencjalnie ujawniać przekonania religijne.
Z tego względu przyjęto bezkompromisowe zabezpieczenia:
1. **Pamięć Wyłącznie Lokalna (On-Device Sandbox):**
   - Historia odtworzonych rozdziałów Biblii Audio i lekcji jest zapisywana **wyłącznie w `window.localStorage` przeglądarki użytkownika**.
   - Żaden log z historią słuchania nie jest wysyłany na serwer Cloudflare ani do baz zewnętrznych.
2. **Pełna Kontrola Użytkownika:**
   - W każdym momencie użytkownik ma prawo jednym kliknięciem zresetować pamięć lokalną (`Wyczyść historię i postęp`).
   - Tryb prywatny przeglądarki automatycznie izoluje pamięć sesji bez żadnych trwałych śladów.
3. **Anonimizacja Danych Agregowanych:**
   - Wskaźniki statystyczne (np. popularność rozdziału Rdz 1) są zliczane wyłącznie jako bezosobowe sumy liczbowe (increment `total_plays`), bez powiązania z adresem IP czy ciasteczkiem sesyjnym.

---

## 3. Zgodność z Dyrektywą ePrivacy i Polityką Cookies

1. **Ciasteczka Techniczne vs Śledzące:**
   - CCRE **nie używa ciasteczek (cookies)** do śledzenia gości.
   - Pamięć podręczna modułu powitalnego (`cc_warm_welcome_v1`) korzysta z LocalStorage wyłącznie w celu zapobieżenia irytacji użytkownika (cooldown 24h) — działanie ściśle funkcjonalne i w interesie użytkownika.
2. **Opt-Out (Prawo Sprzeciwu):**
   - Moduł CC Warm Welcome posiada widoczny, jednoznaczny przycisk `Nie pokazuj więcej`, który natychmiastowo i trwale blokuje wyświetlanie powitania w danej przeglądarce.

---

## 4. Rejestr Przetwarzania Danych w CCRE

| Zakres Danych | Gdzie Przechowywane | Cel Przetwarzania | Podstawa Prawna | Okres Przechowywania |
|---|---|---|---|---|
| Flaga powitania (`cc_warm_welcome_v1`) | LocalStorage (klient) | Ograniczenie częstotliwości dymka | Uzasadniony interes (funkcjonalność UX) | Do wyczyszczenia przez użytkownika |
| Postęp audio (`cc_progress_state_v1`) | LocalStorage (klient) | Wznowienie odsłuchu (-5s) | Zgoda konkludentna użytkownika | Do wyczyszczenia przez użytkownika (max 50 wpisów) |
| Zakładki (`cc_library_bookmarks_v1`) | LocalStorage (klient) | Zapisane materiały na później | Zgoda użytkownika (akcja „Zapisz”) | Do usunięcia przez użytkownika |
| Adres e-mail (Newsletter) | Cloudflare D1 (serwer) | Wysyłka biuletynu CC | Zgoda wyraźna (Double Opt-In, Art. 6 ust. 1 lit. a) | Do momentu kliknięcia Wypisz (Unsubscribe) |
| Zgłoszenie społeczności (M7) | Cloudflare D1 (serwer) | Przegląd propozycji redakcyjnych | Zgoda użytkownika przy wysłaniu | Do 90 dni od rozpatrzenia |
