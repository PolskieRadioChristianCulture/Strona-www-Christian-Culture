# @ICC · CC-YT-POST-FACTORY-001 · dyrektywa dla Antigravity

**Cel:** jedna zatwierdzona kampania tematyczna → gotowe posty społeczności z grafiką, tekstem, CTA i linkiem dla wszystkich uprawnionych kanałów YouTube Christian Culture.

## Procedura wykonawcza

1. Zidentyfikuj rzeczywiste kanały, uprawnienia, profile marki, możliwość tworzenia postów i dostępność harmonogramu. Nie zgaduj adresów, liczby kanałów, uprawnień ani stanu publikacji.
2. Używaj `campaign.json` jako pojedynczego źródła tematu, grafiki, CTA i URL. `channels.json` to mapa kanałów. Redaguj treść pod odbiorców kanału; nie produkuj identycznego spamu.
3. Generator `scripts/build.py` automatycznie przygotowuje posty PL/EN, grafikę 1080×1080, panel kopiowania, CSV statusów. Wymień grafikę szablonową na zatwierdzoną grafikę premium, jeśli jest dostępna.
4. Standard posta: krótki hook, 1–2 zdania, jedno działanie, prawdziwy link, maksymalnie kilka hashtagów. Grafika czytelna na telefonie, zgodna z DNA CC.
5. Przejrzyj poprawność językową, link, prawa do grafiki i zasady danego kanału. Publikacja wymaga zatwierdzenia. YouTube umożliwia tworzenie i planowanie postów w Studio, ale **nie udostępnia oficjalnego publicznego API ich publikacji**. Nie obchodź zabezpieczeń.
6. Zatwierdzone posty opublikuj lub zaplanuj przez oficjalny interfejs YouTube Studio przy odpowiednim koncie kanału.
7. Każdy wynik wpisz do CSV: PRZYGOTOWANO / DO ZATWIERDZENIA / ZAPLANOWANO / OPUBLIKOWANO / BŁĄD + faktyczny URL, data, uwagi.
8. Wyniki skieruj do `Repozytoria-CC/skrzynka/` według obowiązującego szablonu; @Skaner / @A008 sprawdza poprawność grafiki, linków, statusów i dopasowanie kanałów.
9. Nie przechowuj danych logowania, tokenów ani prywatnych informacji. ZERO COST, ZERO REGRESSION. Ręczna akceptacja przed publikacją.

## Warunki odbioru

- Wszystkie *zweryfikowane i aktywne* kanały uwzględnione; brak publikacji na przypadkowych kontach.
- Jeden zatwierdzony temat, jeden link docelowy, grafika 1:1, poprawne języki i odpowiednie CTA.
- Dostępny audyt statusów i URL opublikowanych postów.
- Testy walidacji danych i grafik zakończone PASS.
- Status OPUBLIKOWANO tylko z rzeczywistym potwierdzeniem.
- Ewentualne blokady jawnie raportowane.
