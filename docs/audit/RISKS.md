# Rejestr Ryzyk Operacyjnych i Technicznych — CC Broadcast Automation
**Data audytu:** 2026-11-03 09:50 CET  
**Standard:** Bezpieczeństwo emisji, Zero-QA, Zero Cost  

---

## 1. Zidentyfikowane Ryzyka Techniczne

| ID | Kategoria | Opis ryzyka | Prawdopodobieństwo | Wpływ | Środki zaradcze / Ochrona |
|---|---|---|---|---|---|
| **R01** | **Sieć** | Nadawanie przez Wi-Fi (144 Mbps) zamiast kabla Ethernet | Wysokie | Średni | Laptop ma kartę kablową w stanie `Disconnected`. Wpięcie fizycznego kabla Ethernet wyeliminuje wahania bitrate'u (spadki 600–3500 kbps widoczne w logu). |
| **R02** | **Aplikacja** | Blokowanie startu OBS przez okno Safe Mode po restarcie | Średnie | Krytyczny | OBS 33.0 po niespodziewanym zamknięciu wyświetla modal Safe Mode. Wdrożono flagę `--disable-shutdown-check`, czyszczenie flag w `global.ini` oraz zadanie `CC_OBS_Clicker`. |
| **R03** | **Zasoby** | Wyczerpanie łącza przy 25 równoległych strumieniach | Średnie | Wysoki | 25 strumieni x ~3.5 Mbps = ~87.5 Mbps uploadu. Łącze domowe/światłowodowe musi gwarantować min. 100 Mbps stabilnego upstreamu. Monitorowanie telemetrii A/V. |
| **R04** | **Poufność** | Przypadkowy wyciek kluczy strumieniowych w logach/gicie | Niskie | Krytyczny | Maskowanie kluczy regułą `key=***` w skryptach PowerShell i logach. Zakaz commitowania plików `config.json` z kluczami do repozytorium publicznego. |
| **R05** | **Zarządzanie** | Konflikt dwóch schedulerów (Split-Brain) | Niskie | Wysoki | Centralny dzierżawca (lease fencing) w CC Broadcast Controllerze. Zakaz bezpośredniego wysyłania komend z wielu procesów jednocześnie. |
| **R06** | **Platforma** | Odrzucenie strumienia przez serwer docelowy (błąd -3) | Średnie | Średni | Sprawdzenie czy wszystkie kanały YouTube mają włączony panel Live w YouTube Studio i czy klucze nie wygasły. |
