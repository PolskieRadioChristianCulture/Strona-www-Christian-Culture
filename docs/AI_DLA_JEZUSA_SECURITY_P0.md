# AI dla Jezusa — poprawki bezpieczeństwa P0

Zakres obejmuje wariant testowy. Produkcyjna domena i jej zasoby pozostają bez zmian.

- Panel właściciela przyjmuje wyłącznie token projektu Firebase lumina-cc z dopasowanym wystawcą, odbiorcą, zweryfikowanym e-mailem oraz UID ustawionym prywatnie jako AI_OWNER_UID. Bez UID panel jest zamknięty. Ustawienie UID i rzeczywiste logowanie są osobnym testem na uprawnionym koncie.
- Klucz BYOK jest przechowywany w pamięci karty po świadomej zgodzie. Jest usuwany po odświeżeniu i zmianie konta. Aplikacja usuwa stare klucze BYOK z localStorage i nie czyta wspólnego klucza historii. Gotowa odpowiedź ze starej sesji zostaje odrzucona po zmianie konta. Tryb prywatny wybiera Bazę Wiedzy CC, odcina historię i załączniki od żądania i nie korzysta z zewnętrznych modeli ani serwerowej transkrypcji. Wysyła bieżące pytanie tekstowe do serwera Christian Culture.
- Analityka aplikacji jest wyłączona do czasu integracji zgody. Trasa aplikacji ma CSP. Publiczne REST i MCP pozostają odczytowe. Rozmowa i transkrypcja dopuszczają żądania z własnego originu i ograniczają rozmiar podczas odczytu ciała.
- Wspólny model Gemini i transkrypcja działają po prywatnym potwierdzeniu darmowego projektu. Wymagają osobnego bindingu AI_COST_DB z migracją migrations/ai-cost/0001_daily_attempts.sql, limitu AI_DAILY_ATTEMPT_LIMIT, dedykowanego sekretu AI_SHARED_FREE_GEMINI_KEY i jawnego AI_SHARED_FREE_PROJECT_VERIFIED=true. Jedno żądanie rezerwuje atomowo jedną próbę przed wywołaniem. Limit ma zakres dobowy UTC, wspólny dla czatu i transkrypcji. Błąd dostawcy nie zwalnia rezerwacji. Błąd bazy, brak krytycznej konfiguracji lub wyczerpanie limitu odcinają żądanie do dostawcy. Nie ma automatycznego przejścia do innego dostawcy.
- Uprawnienia właściciela nie omijają limitu. Podgląd nie otrzymuje UID właściciela, kluczy ani bazy limitów. Realny limit kosztów wymaga dodatkowo potwierdzenia konfiguracji rozliczeń po stronie dostawcy.
- Cofnięcie podglądu polega na powrocie do poprzedniego wydania podglądowego. Migracji i zasobów chmurowych nie uruchamiano.

Testy bezpieczeństwa: node --test tests/ai-p0-security.test.mjs. Obejmują walidację kontekstu tokenu z atrapą weryfikatora podpisu, żądanie spoza aplikacji, limit bajtów, realistyczny lokalny SQLite, prywatność trybu źródeł i próbę dostawcy z atrapą. Testy nie uruchamiają płatnych wywołań.
