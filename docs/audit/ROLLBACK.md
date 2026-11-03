# Procedura Przywracania i Rollbacku — CC Broadcast Automation
**Data zatwierdzenia:** 2026-11-03 09:50 CET  
**Wersja:** 1.0  

---

## 1. Cel Procedury

Procedura określa natychmiastowe kroki przywrócenia stabilnego stanu emisji węzła nadawczego (`cc-nadajnik`) w przypadku awarii oprogramowania, nieudanego przełączenia sceny, błędu wtyczki multi-stream lub zawieszenia procesu OBS.

---

## 2. Pliki Kopii Zapasowej (Backup Manifest)

Przed wdrożeniem zmian na laptopie utworzono kopie zapasowe:
- Profil główny: `%APPDATA%\obs-studio\basic\profiles\Bez_tytułu`
- Konfiguracja WebSocket: `%APPDATA%\obs-studio\plugin_config\obs-websocket\config.json`
- Konfiguracja Aitum: `%APPDATA%\obs-studio\plugin_config\aitum-multistream\config.json`
- Zestaw scen: `%APPDATA%\obs-studio\basic\scenes\Bez_tytułu.json`

Katalog narzędzi ratunkowych na stacji głównej: `C:\Users\czark\Christian_Culture_Projekty\narzedzia-a007\`.  
Katalog narzędzi ratunkowych na laptopie: `C:\Users\nazir\a007\`.

---

## 3. Scenariusze Awaryjne i Działania

### Scenariusz A: Natychmiastowe zatrzymanie automatyzacji (SAFE_HOLD)
Gdy zachodzi podejrzenie nieprawidłowego działania skryptu automatycznego:
1. Nie zatrzymywać działającego procesu OBS, jeśli obraz jest poprawny na antenie.
2. Z poziomu stacji głównej wyłączyć zadania harmonogramu:
   ```powershell
   ssh cc-nadajnik "schtasks /End /TN CC_OBS_Clicker; schtasks /End /TN CC_OBS_Broadcaster"
   ```
3. Przełączyć system w tryb manualny — operator ma pełną kontrolę z poziomu myszki/klawiatury laptopa.

### Scenariusz B: Zawieszenie lub awaria OBS (Czysty Restart Emisji)
Gdy OBS przestanie odpowiadać lub klatkarz spadnie do 0:
1. Uruchomić sprawdzony skrypt naprawczy z ominięciem Safe Mode:
   ```powershell
   ssh cc-nadajnik "powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\nazir\a007\obs-fix-and-launch.ps1"
   ```
2. Skrypt automatycznie:
   - Zamyka wiszący proces `obs64.exe`,
   - Ustawia `CleanExit=true` i `SafeModePrompt=false` w `global.ini`,
   - Startuje zadanie z flagami `--disable-shutdown-check --startstreaming` w interaktywnej sesji użytkownika `nazir`.
3. Zweryfikować status podglądu:
   ```powershell
   ssh cc-nadajnik "powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\nazir\a007\obs-podglad.ps1"
   ```

### Scenariusz C: Całkowity powrót do pojedynczego strumienia (Rollback Multi-Stream)
Jeśli łącze internetowe nie wytrzymuje 25 strumieni równolegle:
1. Wyłączyć wtyczkę `obs-multi-rtmp` pozostawiając wyłącznie główny strumień:
   - Przestawić flagi `"sync-start": false` w pliku `%APPDATA%\obs-studio\basic\profiles\Bez_tytułu\obs-multi-rtmp.json`.
2. Zrestartować OBS. Na antenie pozostaje wówczas wyłącznie główny, gwarantowany strumień YouTube (`O+` / Osobowość Plus) o zerowym ryzyku przeciążenia upstreamu.
