# HOLOS × Gabinet L0 × Chronos @004 × Mission Control × LUMI MESS
Data: 20.10.2026. Status: SPECYFIKACJA + bezpieczny kontrakt/testy na gałęzi roboczej. NIE WDROŻONO do produkcji.

## Potwierdzony audyt źródeł
- HOLOS w pliku `holos.html` jest już wdrożoną koncepcją Life OS: metoda 5·10·15, widoki czasu, Google Calendar, logowanie CC ID. Nie ma dowodu operacyjnego, że obsługuje dziś delegowanie do JOMA.
- `js/holos-calendar-sync.js` implementuje OAuth kalendarza, lokalny stan i token w localStorage. PRZED integracją prywatnych zadań L0 wymaga audytu bezpieczeństwa; nie należy rozszerzać dostępu zastępcy na dostęp do tokenu Google Calendar ani przekazywać go do pokojów agentów.
- `scripts/holos-integration-regression.test.mjs` sprawdza m.in. że lokalne dane nie udają synchronizacji chmurowej.
- `scripts/d1_mission_control_schema.sql` definiuje istniejącą kolejkę komend, ale nie oznacza automatycznie gotowego systemu zadań misyjnych.

## Decyzje architektoniczne
1. Gabinet Prezesa L0: prywatny, serwerowy magazyn spraw; separacja od publicznego repo WWW, brak przechowywania sekretów w GitHub.
2. Planer HOLOS pokazuje: Dziś, Tydzień, Misja, Delegowane, Oczekujące na ACK, Zablokowane, Do odbioru, Kalendarium, Raporty; widok mobilny premium. To zakres DOCZELOWY, nie zaimplementowany UI.
3. Prywatność: część `OWNER_PRIVATE` widzi wyłącznie zweryfikowany L0. Zastępca dostaje udostępnione `MISSION_TASK_ONLY`, po osobnej autoryzacji L0, z odwoływalnym dostępem; oddzielne odczyt/delegowanie/edycja.
4. Chronos @004: przyjmuje zatwierdzoną datę, strefę Europe/Warsaw i termin UTC, wykrywa brak ACK, opóźnienia i ponowienia; bez samowolnego wykonywania operacji T4.
5. MC i Pokój Agentów LUMI MESS: tylko projekcja *udostępnionych* zadań, statusów i identyfikatorów Listów Misyjnych; żadne prywatne notatki/sekrety/tokeny kalendarza.
6. JOMA/Skrzynka to źródło obiegu Listów Misyjnych; `task_id`, `message_id`, `#DDMMRRRRGGMM` (Europe/Warsaw podczas wysyłki), imienny wykaz agentów i oddzielne ACK.
7. Delegacja z HOLOS wymaga zapisu serwerowego, autoryzacji, outbox/retry/idempotencji, ACK i potwierdzenia wykonania z dowodem. Jeden właściciel zadania, zastępca tylko po HANDOFF+ACK. Zero spychologii.
8. ZERO COST, minimalne uprawnienia, log audytowy, brak deklarowania dostępności agentów bez heartbeat/statusu potwierdzonego wykonawcą.
9. Nie uruchamiać Google Calendar sync na koncie zastępcy przez konto L0; osobne OAuth scopes i sesje.

## Proponowany docelowy kontrakt backendu (jeszcze nie istniejące API)
`GET /api/holos/mission-tasks` (L0 lub serwerowo autoryzowany zastępca, zakres danych zależny od roli).
`POST /api/holos/mission-tasks`, `POST /api/holos/mission-tasks/{id}/dispatch`;
`POST /api/holos/mission-tasks/{id}/ack`;
`GET /api/holos/mission-tasks/{id}/history`;
`POST /api/holos/delegates` / `DELETE /api/holos/delegates/{id}` (L0 only).
Nie dodawać ich w frontendzie jako działających, zanim backend nie jest gotowy.

## P0: kroki do zamknięcia przez @007 / @077
- Uzgodnić prywatny magazyn L0 i model tożsamości CC ID po analizie prawdziwego backendu.
- Podzielić dane prywatne, misyjne i publiczne, wdrożyć serwerowe ACL i revoke.
- Implementować rzeczywisty backend + UI planera z transakcjami, historią i widokiem MC / prywatnego pokoju LUMI.
- Chronos: scheduler trwały z alarmami i ACK / bez duplikatów; test Europe/Warsaw DST.
- Testy odmowy dostępu, E2E Android/iOS/desktop, test wysyłka→ACK→wykonanie→odbiór, test awarii i rollback.
- Audyt OAuth Google Calendar i przechowywania tokenów przed upublicznieniem prywatnych zadań.
- Dowodowy raport, recenzja i zgoda L0 przed produkcją.

## Zakaz pozornego ukończenia
Kontrakt JS to walidacja/UI policy, NIE serwerowa kontrola dostępu. Frontend może być zmanipulowany; nigdy nie traktować jego wyniku jako dowodu autoryzacji. Bez rzeczywistego backendu i testów nie nazywać integracji ukończoną.
