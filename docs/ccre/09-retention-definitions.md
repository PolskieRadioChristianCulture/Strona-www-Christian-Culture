# DEFINICJE METRYK RETENCJI I ETYKA ZAANGAŻOWANIA (RETENTION DEFINITIONS)
**Dokument:** `docs/ccre/09-retention-definitions.md`  
**Wersja:** 1.0 (2026-10-31)  
**Autor:** Antigravity (@001) / Konsultacja: @077, @777  
**Status:** DOKUMENTACJA ANALITYCZNA I ETYCZNA  

---

## 1. Cel Pomiaru: Wzrost Duchowy vs Monetyzacja Uwagi

W komercyjnych portalach społecznościowych metryki retencji służą maksymalizacji czasu przed ekranem (screen time) i sprzedaży reklam za wszelką cenę.
W misji Christian Culture cel jest przeciwny:
- Chcemy wspierać regularne, spokojne obcowanie ze Słowem Bożym i wartościową audycją.
- Szanujemy czas użytkownika — dobra relacja nie polega na uzależnieniu, lecz na wierności i zaufaniu.

---

## 2. Kanoniczne Definicje Kohortowe (D1, D7, D30)

| Wskaźnik | Okres | Definicja Operacyjna w CCRE | Cel Misyjny |
|---|---|---|---|
| **D1 Retention** | 24–48 godzin | Odsetek użytkowników powracających kolejnego dnia po pierwszej wizycie (np. po codzienne rozważanie lub kolejny rozdział Biblii). | Sprawdzenie, czy treść poruszyła serce i zachęciła do powrotu. |
| **D7 Retention** | 7 dni (1 tydzień) | Powrót użytkownika w ciągu 7 dni od pierwszej wizyty. | Zbadanie nawyku słuchania cotygodniowych audycji radiowych / modlitwy. |
| **D30 Retention** | 30 dni (1 miesiąc) | Powrót użytkownika w oknie miesięcznym. | Stabilna, trwała wspólnota słuchaczy i czytelników. |

---

## 3. Pancerne Zasady Anty-Manipulacyjne (Dark Pattern Ban)

W implementacji CCRE obowiązuje **bezwzględny zakaz**:
1. **Zakaz sztucznej presji („Streak Shaming”):**
   - Nie karzemy użytkownika za opuszczenie dnia w Kursie Codziennym ani nie wyświetlamy alarmujących komunikatów typu „Twój ciąg czytania przepadnie!”.
   - Zamiast tego stosujemy łagodne, zachęcające zaproszenie: „Witaj ponownie. Rozdział czeka na Ciebie w Twoim tempie”.
2. **Zakaz fałszywej pilności („Fake Urgency”):**
   - Zakaz liczników odliczających czas do „końca dostępu” do treści biblijnych. Treści ewangelizacyjne są bezpłatne i zawsze dostępne.
3. **Zakaz wymuszania notyfikacji / powiadomień Push:**
   - Zapytanie o powiadomienia Push lub zapis do Newslettera może nastąpić wyłącznie z wyraźnej inicjatywy użytkownika (np. po kliknięciu przycisku „Powiadamiaj mnie o nowych rozdziałach”).
4. **Zero Pułapek Wyjścia (Exit Traps):**
   - Kategoryczny zakaz wyskakujących okienek typu `beforeunload` („Nie odchodź jeszcze!”) przy próbie zamknięcia karty.
