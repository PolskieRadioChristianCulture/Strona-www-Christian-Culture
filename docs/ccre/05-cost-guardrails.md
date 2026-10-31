# BARIERY KOSZTOWE I BUDŻET ZERO-COST (COST GUARDRAILS) — CCRE
**Dokument:** `docs/ccre/05-cost-guardrails.md`  
**Wersja:** 1.0 (2026-10-31)  
**Autor:** Antigravity (@001) / Konsultacja: @004, @777  
**Status:** DOKUMENTACJA KOSZTOWA I BEZPIECZEŃSTWA ZASOBÓW  

---

## 1. Nienaruszalna Zasada ZERO COST (0,00 PLN)

Ekosystem Christian Culture realizuje misję ewangelizacyjną w modelu pełnej dyscypliny finansowej:
- **Miesięczny koszt infrastruktury CCRE:** **0,00 PLN / 0,00 USD**.
- **Kategoryczny zakaz:** Żadnych płatnych API za pojedyncze zapytanie (pay-per-request LLM), żadnych płatnych subskrypcji baz danych, żadnych komercyjnych trackerów.

---

## 2. Limity Darmowych Warstw (Free Tier Quota)

Wykorzystujemy wyłącznie oficjalne, legalne i nielimitowane lub wysokie limity bezpłatne:

| Usługa | Dostawca | Bezpłatny Limit (Miesięcznie / Dziennie) | Szacowane Zużycie CCRE | Margines Bezpieczeństwa |
|---|---|---|---|---|
| **Cloudflare Pages** | Cloudflare | Nielimitowany transfer, nieograniczona liczba requestów | ~250 000 req/mies. | **100% BEZPIECZNY** |
| **Cloudflare Workers** | Cloudflare | 100 000 żądań dziennie (Free Tier) | ~2 000 - 5 000 req/dzień | **95% marginesu wolnego** |
| **Cloudflare D1** | Cloudflare | 5 000 000 odczytów / dzień, 100 000 zapisów / dzień | ~500 zapisów / dzień | **99% marginesu wolnego** |
| **Pamięć Klienta (LocalStorage)** | Przeglądarka | 5 MB na domenę | ~50 KB (1% limitu) | **100% BEZPIECZNY** |
| **E-mail SMTP** | Google Workspace / Gmail | 500 maili dziennie (konto standard) | ~10-50 powiadomień DOI | **90% marginesu wolnego** |

---

## 3. Mechanizmy Obronne (Fail-Safe & Throttling)

Aby zapobiec przypadkowemu wyczerpaniu darmowych limitów lub przeciążeniu workerów:
1. **Lokalna Redukcja Egressu (LocalStorage-First):**
   - 99% operacji CCRE (Warm Welcome, wznawianie pozycji audio, filtrowanie katalogu, zapisane zakładki) wykonuje się **w 100% w przeglądarce klienta**.
   - Zero żądań HTTP do serwera przy pauzie, przewijaniu czy wznowieniu audio.
2. **Throttling Zdarzeń:**
   - W odtwarzaczach audio zdarzenie `timeupdate` jest dławione (throttled) do maksymalnie jednego zapisu w LocalStorage co 15 sekund.
3. **Statyczny Cache na brzegu (Edge Cache-Control):**
   - Endpoint `/api/ccre/v1/catalog` oraz `/api/ccre/v1/today` posiada nagłówek `Cache-Control: public, max-age=3600, s-maxage=3600` (1 godzina w pamięci podręcznej Cloudflare Edge).
   - Tysiące żądań od gości trafia w pamięć CDN Cloudflare, generując 0 operacji na bazie D1.
4. **Kill-Switch (Wyłącznik awaryjny):**
   - W razie konieczności wyłączenia modułów, pojedyncza flaga w pliku konfiguracyjnym lub w workerze deaktywuje wszystkie zapytania serwerowe w czasie <1s.
