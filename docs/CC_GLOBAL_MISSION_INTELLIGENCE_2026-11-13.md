# DYREKTYWA STRATEGICZNA @777: CC GLOBAL MISSION INTELLIGENCE (GA4 • Search Console • Google Trends • Looker Studio • ZERO COST)

- **Identyfikator dokumentu:** `JOMA-DIR-CC-MISSION-INTEL-20261113`
- **Data wydania:** 13 listopada 2026
- **Właściciel i Decydent (L0):** Cezary Rogowski (Dowódca Nazir)
- **Powiązany system wykonawczy:** `CC GLOBAL DISTRIBUTION` (`JOMA-DIR-CC-GLOBAL-DIST-20261113`)
- **Środowisko testowe przed produkcją:** `https://polskieradio.cc/test/mission-intelligence.html`
- **Zasada nadrzędna:** *„Dane Google stają się narzędziem służącym misji, a nie celem samym w sobie. Chcemy wiedzieć, gdzie ludzie poszukują treści biblijnych, z jakimi pytaniami przychodzą i jak możemy skuteczniej dotrzeć do nich z Ewangelią.”*

---

## 1. Cztery Źródła Danych Strategicznych (Standard ZERO COST)

1. **Google Analytics 4 (`GA4 Data API`, identyfikator pomiaru `G-Y4EFTVBPE3`):**
   - Kraje, języki, źródła ruchu, podział `mobile` vs `desktop`, najczęściej odwiedzane treści oraz mierzalne zdarzenia misyjne (`cc_radio_play`, `cc_biblia_audio_listen`, `cc_kc_lesson_open`, `cc_dzj_read`, `cc_subscription_optin`).
   - Automatyczne odfiltrowanie ruchu wewnętrznego (`traffic_type: 'internal'` dla `?cc_team=1`, `?in_mcr=1` oraz `window.obsstudio`).
2. **Google Search Console (`Search Console API`):**
   - Wyszukiwane pytania biblijne i życiowe, wyświetlenia (`impressions`), kliknięcia (`clicks`), współczynnik `CTR` oraz średnie pozycje stron (`position`) — wskazywanie tematów o wysokim popycie i niskim nasyceniu.
3. **Google Trends:**
   - Dynamika zmian popularności tematów biblijnych i społecznych według krajów i okresów — planowanie wyprzedzających publikacji i tłumaczeń.
4. **Looker Studio + Google Sheets + Google Apps Script:**
   - Centralny, bezpłatny pulpit analityczny łączący GA4 i Search Console oraz przechowujący nieulotną historię porównawczą okresów (tydzień do tygodnia, miesiąc do miesiąca, kwartał do kwartału).

---

## 2. Pięcioetapowy Mechanizm Decyzyjny (Oddzielenie Analizy od Wdrożenia)

```
[1. DANE GOOGLE] ➔ [2. ANALIZA MISYJNA] ➔ [3. PLAN DZIAŁANIA] ➔ [4. AKCEPTACJA L0 & PUBLIKACJA] ➔ [5. POMIAR EFEKTÓW]
```

1. **Dane Google:** Odbiorcy, kraje, wyszukiwane pytania, zachowania (oddzielnie: użytkownicy, sesje, odsłony, kliknięcia, zdarzenia).
2. **Analiza Misyjna:** Potrzeby duchowe i poznawcze, potencjał wzrostu, luki językowe, priorytety.
3. **Plan Działania:** Konkretne rekomendacje (np. *„Rosnące zapytania o Psalm 23 po angielsku w GSC + wysokie zaangażowanie z USA w GA4 -> rekomendacja lokalizacji gotowego nagrania Biblii Audio, dodania napisów EN i dystrybucji przez CC GLOBAL DISTRIBUTION”*).
4. **Akceptacja i Publikacja (Bramka L0 + Testy EKOCC):** Odświeżanie statystyk **nigdy nie uruchamia automatycznej przebudowy portalu ani samowolnej publikacji**. Każda zmiana przechodzi przez `/test/` oraz zatwierdzenie Dowódcy L0.
5. **Pomiar Efektów:** Porównanie wyników przed i po działaniu oraz korekta wag i priorytetów.

---

## 3. Dynamiczny Ranking Krajów Misyjnych (Model Punktacji 100%)

Każdy kraj otrzymuje ocenę potencjału misyjnego (`0–100 pkt`) wyliczaną z 5 ważonych wskaźników (automatycznie normalizowanych do `100%`):

| Wskaźnik | Waga domyślna | Źródło i znaczenie |
|---|---|---|
| **1. Zainteresowanie** | **25%** | Wyszukiwania i wyświetlenia w Google Search Console |
| **2. Zaangażowanie** | **25%** | Aktywność i wartościowe działania w GA4 (uruchomienia radia, Biblia Audio, Kurs Codzienny, subskrypcje) |
| **3. Potencjał wzrostu** | **20%** | Google Trends i dynamika zmiany wyników w czasie (okres do okresu) |
| **4. Luka w dostępności** | **15%** | Brak dopasowanych językowo materiałów CC przy istniejącym popycie |
| **5. Gotowość dystrybucyjna** | **15%** | Dostępne nagrania, tłumaczenia i kanały w `CC GLOBAL DISTRIBUTION` |

### Trzy Grupy Krajów + Zabezpieczenie Małej Próby:
- **Grupa A (`ACTIVE_AUDIENCE`):** Kraje, gdzie CC ma już aktywnych odbiorców (np. Polska, Niemcy, Wielka Brytania, USA).
- **Grupa B (`HIGH_INTEREST_LOW_REACH`):** Kraje, gdzie Google wskazuje wysokie zainteresowanie tematami biblijnymi, ale CC ma jeszcze niewielki zasięg.
- **Grupa C (`EXPLORATION_NEEDED`):** Rynki wymagające wstępnego rozpoznania językowego i kanałowego.
- **Zabezpieczenie statystyczne (`INSUFFICIENT_DATA`):** Przy małej liczbie obserwacji (`observations < 30`) system obowiązkowo oznacza kraj jako **`DANE NIEWYSTARCZAJĄCE`**, zamiast generować pozornie precyzyjne rekomendacje.

---

## 4. Harmonogram Aktualizacji Strategii (OpenBot + `@ccMC` + Google Calendar)

| Częstotliwość | Rutyna | Działanie |
|---|---|---|
| **Codziennie (05:30)** | **CC 21** | Pobranie dostępnych danych, audyt poprawności pomiarów GA4/GSC na podstronach i odtwarzaczach, monitoring anomalii, dopisanie migawki do historii. |
| **Co tydzień (Poniedziałek 08:00)** | **CC 22** | **Poniedziałkowy Raport Misyjny L0:** 5 najważniejszych rekomendacji (`Który kraj potrzebuje uwagi? Który materiał przetłumaczyć? Na której platformie się pojawić? Co przyniosło zaangażowanie?`) + przekazanie zatwierdzonych zadań do `CC GLOBAL DISTRIBUTION`. |
| **Co miesiąc (1. dzień miesiąca)** | **CC 22 (Monthly)** | Pełna aktualizacja rankingu krajów, języków (`EN -> DE -> ES -> PT -> FR`), tematów i kanałów. |
| **Co kwartał** | **Przegląd L0** | Przegląd celów misyjnych, strategii ekspansji i długoterminowych efektów działania. |

---

## 5. Żelazne Zasady Analityczne i Etyczne

1. **Zakaz mieszania metryk:** Użytkownicy (`users`), sesje (`sessions`), odsłony (`pageviews`), kliknięcia (`clicks`) i zdarzenia (`events`) są przechowywane i raportowane **oddzielnie** — kategoryczny zakaz sumowania ich w jedną sztuczną liczbę.
2. **Zakaz nadpisywania historii:** Każda migawka jest dopisywana do rejestru historycznego (`history[]`), co umożliwia rzetelne porównywanie okresów.
3. **Zakaz duchowej nadinterpretacji (`spiritualStateInference: FORBIDDEN`):** Dane analityczne mierzą zasięg i zaangażowanie w treści, ale **nigdy nie są traktowane jako dowód nawróceń ani osobistego stanu duchowego odbiorców**.
4. **Ochrona prywatności (`PII_STRIPPED`):** Agenci otrzymują wyłącznie zagregowane raporty zbiorcze bez danych osobowych użytkowników.
5. **Uczciwość danych (Zero Fikcji):** Dopóki klucze usługowe `GA4 Data API` / `Search Console API` nie zwrócą żywego odczytu dla danego okresu, system jawnie oznacza status źródła jako `AUDIT_BASELINE_AWAITING_LIVE_API` i nigdy nie prezentuje hipotetycznych prognoz jako bieżących statystyk.
