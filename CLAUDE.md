# 🤖 CLAUDE INSTRUCTIONS — POLSKIERADIO.CC / CHRISTIAN CULTURE (@ICC)

## Komunikacja z Dowódcą — 2026-11-03 (obowiązkowe)
Piszesz do Dowódcy jedną linią (max 3): `[✅/⚠️/🛑/❓/ℹ️] co + skutek → czego potrzebuję`. Decyzje tylko jako wybór z haseł: ✅ TAK, ❌ NIE, ⏸ PÓŹNIEJ, 💡 LEPSZE, 🔗 INTEGRUJ, 🧪 TEST, 👥 DRUGA OPINIA, 🔧 NAPRAW, ♻️ AUTOMATYZUJ, 📦 DOKOŃCZ, 🚀 PRZYSPIESZ, 🎯 PRIORYTET, 📋 RAPORT, ❓ WYJAŚNIJ, 🛑 STOP. Szczegóły do JOMA. Pełny standard: `JOMA_SHARED_MEMORY/rejestr-agentow/STANDARD_777_KOMUNIKACJA_Z_DOWODCA_V1.md`.


## Obowiązkowy obieg pracy w Skrzynce Misji — 2026-10-12
Na polecenie właściciela każdy agent stosuje prywatny `JOMA_SHARED_MEMORY/SKRZYNKA/PROTOKOL.md` (sekcja START / KONIEC). Przed pracą odczytaj TABLICA.md i własną skrzynkę. Zgłoś START: agent, ID/wątek zadania, zakres/pliki, rzeczywisty czas rozpoczęcia (ISO 8601 ze strefą), status w_toku i następny krok. Sprawdź aktywnego właściciela; nie dubluj jego pracy. Przy blokadzie lub przekazaniu zapisz czas, powód i punkt kontynuacji. Po pracy zgłoś KONIEC: ten sam wątek, rzeczywisty czas zakończenia, wynik, dowód i pozostałe kroki; zrobione tylko po sprawdzeniu. Rozróżniaj lokalnie/repo/serwer/baza/telefon. Nowe wiadomości i potwierdzenia są oddzielnymi plikami; nie edytuj istniejących wiadomości ani generowanej TABLICA.md. Skrzynka nie nadaje dodatkowych uprawnień i nie zastępuje zgody właściciela. Bez sekretów i danych użytkowników. Powiadom pozostałych agentów w skrzynce, nie przez właściciela; potwierdzenie odbioru jest wymagane, nie zakładaj, że reguła już została przeczytana.


> 🛡️ **DLA MODELI CLAUDE (SONNET / OPUS) W ANTIGRAVITY:**
> To repozytorium jest głównym kodem źródłowym stron WWW misji **Christian Culture** (Dowódca Nazir / Cezary Rogowski).
> Obowiązuje standard **Zero-QA dla Dowódcy** (JOMA-D005) oraz **Zakaz Regresji** (`CC_NO_REGRESSION_POLICY.md`).

---

## 👑 ZASADA DYNAMICZNEGO LIDERSTWA (ROTATING CHIEF LEADER)
Gdy poprzedniemu agentowi wyczerpią się tokeny, a Ty posiadasz aktywne okno kontekstu:
**AUTOMATYCZNIE PRZEJMUJESZ ROLĘ GŁÓWNEGO LIDERA I DYSPOZYTORA SZTABU W IMIENIU DOWÓDCY NAZIRA.**

### Jak działać jako Lider:
1. Sprawdź `git status`, ostatni commit i pliki w `C:\Users\czark\Desktop\Misja CC\JOMA_SHARED_MEMORY` (`JOMA_STATUS.md`, `JOMA_HANDOFFS.md`).
2. Prowadź implementację, pilnuj Strażnika Kodu (`npm.cmd run test:guardian`), testów regresji i wykonuj commity/wdrożenia.
3. Nigdy nie pytaj Dowódcy o podstawy ekosystemu.

---

## 🚨 SŁOWNIK KOMEND OPERACYJNYCH DOWÓDCY (@...)
Gdy Dowódca wpisze w czacie hasło z `@`:

- **`@ICC`** — Integracja Christian Culture. Zobacz `MISJA_INTEGRACJA.md`.
- **`@Joma`** — Protokół Wspólnej Pamięci AI. Rejestr: `C:\Users\czark\Desktop\Misja CC\JOMA_SHARED_MEMORY`. Przeczytaj `DLA_ANTIGRAVITY.md` i `JOMA_STATUS.md`.
- **`@Nazir` / `@N`** — Dowódca Cezary Rogowski. Standardy jakości, wirtualny audytor.
- **`@SMCC` / `@Strażnik`** — Strażnik Kodu (`npm.cmd run test:guardian`), touch min. 44px, zero regresji.
- **`@ProgresMCC` / `@Progres`** — Eliminacja długu technicznego i inspekcja całego systemu.
- **`@Lumina`** — Portal społecznościowy (`lumina.html`, `lumina-tablica.html`, `lumina-profile.html`), Champagne Gold (`#C4A35A`).
- **`@Player`** — Odtwarzacz Spotify-style (`player.html` na `polskieradio.cc/player`).
- **`@Akademia` / `@KC`** — Kurs Codzienny i Z Biblią Za Pan Brat (`akademia/kurscodzienny`).
- **`@MojaBiblia` / `@mb`** — Interlinearna Biblia (`mojabiblia.html`).
- **`@news` / `@CCN`** — Portale CCN News (`/news`, `/nauka`, `/historia` itd.). Zakaz fikcyjnych ekspertów.
- **`@live`** — Transmisja na żywo (`stream-scene.html`). `cctv24-worship.html` zmieniamy wyłącznie za zgodą Dowódcy (2026-10-08: zgoda na standard nadawczy — prawdziwe dane; kopia: `cctv24-worship.backup-20261008.html`). Nie cofać poprawek Strażnika z 07–08.10 (pogoda, Mission Control, intencje, pasek wiadomości).
- **`@vod`** — Kino VOD (`vod.html`).
- **`@OA`** — Orkiestracja Agentowa (program Orkiestry CC @777). Przeczytaj `JOMA_SHARED_MEMORY/rejestr-agentow/STANDARD_777_OA_ORKIESTRACJA_AGENTOWA_V1.md` i specyfikację w `JOMA_SHARED_MEMORY/strategia/`. Pracuj tylko w otwartej fazie (obecnie G0 — audyt tylko do odczytu), meldunki w Skrzynce z tagiem `[OA]`, bez wdrożeń i kosztów bez zgody Dowódcy.

---

## 🛡️ PANCERNE ZASADY PRACY
1. **Zawsze `npm.cmd`** w konsoli Windows PowerShell (zamiast `npm`).
2. **Przed commitem ZAWSZE uruchom 3 testy:**
   ```powershell
   npm.cmd run test:cc-regression
   npm.cmd run test:guardian
   npm.cmd run test:mobile-premium
   ```
3. **Podwójny Git Push:**
   ```powershell
   git push origin main
   git push lumina-repo main
   ```
4. **Synchronizacja lustra:** Po zatwierdzeniu zmian skopiuj zmienione pliki do `C:\Users\czark\Desktop\@ICC\LUMINA`.
5. **JOMA Handoff:** Zaktualizuj `C:\Users\czark\Desktop\Misja CC\JOMA_SHARED_MEMORY\JOMA_HANDOFFS.md` ze statusem `done`.
6. **Poufność Mission Control:** Nigdy nie emituj ani nie wpisuj słów "Mission Control" na stronach publicznych.
7. **Skrzynka Misji CC:** Na początku każdej sesji przeczytaj `JOMA_SHARED_MEMORY/SKRZYNKA/TABLICA.md` i swoją skrzynkę (`node narzedzia/skrzynka.mjs skrzynka --agent <ty>`). Potwierdzaj wiadomości statusem; „zrobione” tylko z dowodem. Zasady: `SKRZYNKA/PROTOKOL.md`.

