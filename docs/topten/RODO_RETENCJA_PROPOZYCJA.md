# topTEN — propozycja zapisu o przechowywaniu danych (RODO) — DO DECYZJI L0

Data: 2026-11-01 · @007 · Status: **projekt, nieopublikowany** (zmiana Polityki prywatności = decyzja L0/prawna).
Regulamin §9.3 odsyła do Polityki prywatności (/polityka-prywatnosci). Poniżej faktyczny stan danych i proponowany tekst.

## Jakie dane topTEN przechowuje (stan faktyczny)
| Dane | Gdzie | Po co | Proponowany okres |
|---|---|---|---|
| Identyfikator konta Firebase przy każdym głosie | D1 `topten_events.user_id` | limity dobowe, antyfraud, audyt | 24 miesiące od końca tygodnia, potem pseudonimizacja (zastąpienie skrótem) — wyniki i punkty zostają |
| Skrót sieci (SHA-256 adresu IP, 32 znaki) | `topten_events.ip_hash`, `topten_nominations.ip_hash` | wykrywanie nadużyć, limit nominacji | 90 dni, potem wyczyszczenie pola |
| Dane zgłaszającego nominację (imię, e-mail, link Drive) | `topten_nominations` | kontakt i weryfikacja praw | do 24 miesięcy po decyzji; dla opublikowanych — przez czas publikacji + 24 miesiące (dowód licencji) |
| Obserwowane utwory i subskrypcje push | `topten_follows`, `topten_push_subscriptions` | powiadomienia | do wypisania; nieaktywne push usuwane automatycznie (już działa przy 404/410) |
| Log audytu (konto redakcji / system) | `topten_audit_log` | rozliczalność decyzji | 5 lat |
| Oficjalne wyniki tygodni | `topten_week_standings` | archiwum notowań | bezterminowo (bez danych osobowych) |

## Proponowany tekst do Polityki prywatności (sekcja „topTEN”)
> Głosując w topTEN, przetwarzamy identyfikator Twojego konta i skrót adresu sieciowego, aby pilnować limitów głosowania i chronić notowanie przed nadużyciami (prawnie uzasadniony interes administratora). Skrót sieci usuwamy po 90 dniach, a identyfikator konta przy głosach pseudonimizujemy po 24 miesiącach; wyniki notowań pozostają w archiwum bez danych osobowych. Dane z formularza nominacji przechowujemy do 24 miesięcy od decyzji redakcji, a w przypadku publikacji — przez czas publikacji i 24 miesiące po jej zakończeniu. Możesz zażądać dostępu, sprostowania lub usunięcia danych, pisząc na adres podany w Polityce prywatności; usunięcie konta pseudonimizuje Twoje głosy bez zmiany oficjalnych wyników.

## Po decyzji L0 (do wdrożenia przez @007, ~1 h)
1. Publikacja tekstu w Polityce prywatności.
2. Zadanie czyszczące uruchamiane leniwie raz na tydzień przy zamknięciu tygodnia (bez crona): `UPDATE topten_events SET ip_hash = NULL WHERE created_at < now-90d`, pseudonimizacja `user_id` po 24 mies., czyszczenie nominacji po terminie — z wpisem w audycie i testem.
