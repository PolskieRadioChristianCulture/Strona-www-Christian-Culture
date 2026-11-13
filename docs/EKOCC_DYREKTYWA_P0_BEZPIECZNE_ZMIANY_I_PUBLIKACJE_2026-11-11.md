# EKOCC — DYREKTYWA PRIORYTETOWA P0: BEZPIECZNE ZMIANY I PUBLIKACJE

**ID:** EKOCC-DIRECTIVE-P0-001  
**Wersja:** 1.0  
**Data:** 2026-11-11  
**Właściciel decyzji:** Założyciel / administrator Christian Culture  
**Obowiązuje:** Wszystkich agentów, repozytoria, aplikacje, strony, skrypty, automatyzacje, infrastrukturę i dostawców EKOCC  
**Priorytet:** P0 — nadrzędny w wewnętrznym procesie wdrażania zmian  
**Status dokumentu:** Zatwierdzona dyspozycja właściciela; techniczne wdrożenie zabezpieczeń wymaga osobnej realizacji i weryfikacji

> **NAJPIERW TEST. POTEM WERYFIKACJA. NASTĘPNIE OSOBISTA AKCEPTACJA WŁAŚCICIELA. DOPIERO WTEDY PRODUKCJA.**
>
> **Żaden agent AI ani automat nie ma domyślnego prawa do wdrożenia na produkcję.**

## 1. Zasada bezwzględna

Każda planowana zmiana — nawet pojedyncza poprawka CSS, treść, konfiguracja, integracja API czy automatyzacja — powstaje i przechodzi weryfikację poza produkcją. Wersja publiczna pozostaje niezmieniona do momentu jednoznacznej akceptacji właściciela **konkretnej, niezmiennej wersji**. Samo polecenie „popraw”, „zbuduj” lub „sprawdź” nie stanowi zgody na publikację. Nie należy traktować milczenia jako akceptacji.

Zakaz dotyczy również samodzielnych publikacji wykonywanych przez Claude, Antigravity, Gemini, GPT, Codex, Copilot, boty CI/CD oraz pozostałe narzędzia.

## 2. Jednolity adres staging

**Docelowy wzorzec:**

- Produkcja: `https://polskieradio.cc/<ścieżka>`
- Test: `https://polskieradio.cc/test/<ścieżka>`

Przykłady:

| Produkcja | Staging |
|---|---|
| `/ccMC` | `/test/ccMC` |
| `/go` | `/test/go` |
| `/akademia` | `/test/akademia` |
| `/Ewangelia` | `/test/Ewangelia` |
| `/lumina` | `/test/lumina` |
| `/BCM` | `/test/BCM` |
| `/lumi-kids/app` | `/test/lumi-kids/app` |
| `/studio` | `/test/studio` |

**Uwaga:** adresy są konwencją do wdrożenia, a nie potwierdzeniem istnienia tras. W dyspozycji ustnej pojawiło się również `polskieradio.pl`; za domenę bazową przyjęto funkcjonujące `polskieradio.cc`. Nie zakładać dostępności ani własności `.pl` bez weryfikacji.

Dla funkcji bez interfejsu WWW stosować staging/preview/sandbox z równoważną izolacją, bez wymuszania fikcyjnego URL.

## 3. Proces obowiązkowy

1. **Zgłoszenie:** cel, zakres, ryzyka, repozytorium, plan testów, kryteria akceptacji.
2. **Przygotowanie:** odtworzenie stabilnej wersji w izolowanym środowisku testowym; osobna gałąź lub wersjonowany artefakt.
3. **Realizacja:** wszystkie iteracje i poprawki wyłącznie w środowisku rozwojowym/testowym.
4. **Testy:** build, lint, testy jednostkowe/integracyjne/E2E, regresja, RWD, dostępność, bezpieczeństwo, wydajność; zgodnie z charakterem zmiany.
5. **Prezentacja:** działający link testowy, lista zmian, wyniki testów, nierozwiązane problemy, identyfikator commit/SHA lub artefaktu.
6. **Decyzja właściciela:** `ZATWIERDZAM [wersja/SHA]`, `DO POPRAWY`, `ODRZUCAM`, `WSTRZYMUJĘ`.
7. **Publikacja:** dopiero po autoryzowanej akceptacji danej wersji, przy zachowaniu bramki wdrożeniowej. Każda zmiana paczki po akceptacji wymaga ponownej akceptacji.
8. **Po wdrożeniu:** smoke tests, monitoring, raport i gotowość do przywrócenia poprzedniej wersji.

Jeśli rezultat nie spełnia oczekiwań właściciela, prace toczą się na testowej wersji **do skutku** w ramach przydzielonych zasobów; nie wymuszać publikacji na podstawie harmonogramu lub „zielonych” testów automatycznych.

## 4. Izolacja testowa — wymagania techniczne

- Oddzielić produkcyjne i testowe środowiska uruchomieniowe, bazy, buckety, konta serwisowe, sekrety, webhooki i kolejki.
- Testy korzystają z danych fikcyjnych lub odpowiednio zanonimizowanych. Zakaz kopiowania realnych danych osobowych bez legalnej podstawy i zabezpieczeń.
- Staging nie wysyła prawdziwych SMS/MMS, e-maili, push, transakcji, zamówień ani nie uruchamia publicznych emisji. Używać atrap, symulatorów i dry-run.
- Zabezpieczyć staging uwierzytelnianiem i autoryzacją; ustawić `noindex`, lecz nie traktować samego `robots.txt` ani `noindex` jako ochrony dostępu.
- Zapewnić osobne zmienne środowiskowe, ograniczone uprawnienia i ochronę przed użyciem produkcyjnych sekretów.
- Sporządzać kopie danych i plan rollbacku; przed migracją produkcyjnej bazy wykonać plan zgodności oraz niezależną weryfikację.
- Uruchamiać testy na preview, nie na produkcji; ryzykowne migracje etapować.
- Dla aplikacji mobilnych stosować wewnętrzne kanały testowe; dla transmisji osobny niepubliczny stream.

**Sama ścieżka URL `/test/` nie zapewnia izolacji.** Wdrożenie wymaga rzeczywistych ograniczeń na poziomie hostingu, API, baz i uprawnień.

## 5. RELEASE GUARDIAN — egzekwowanie

W każdym repozytorium i systemie wdrożeń wdrożyć, jeśli technicznie możliwe:

- Chronioną gałąź produkcyjną, ograniczenia zapisu, obowiązkowy PR/code review i wymagane testy.
- Jedną kontrolowaną ścieżkę deploy produkcyjnego (bez ukrytych równoległych workflow i auto-deploy).
- Manualną bramkę akceptacji przez uwierzytelnionego właściciela **konkretnego SHA/artefaktu**.
- Oddzielne role: agent przygotowuje release, właściciel autoryzuje, pipeline publikuje zatwierdzony artefakt.
- Zasadę najmniejszych uprawnień: agenci nie przechowują kluczy produkcyjnego deployu ani nie mogą samodzielnie obejść bramki.
- Audyt niezmiennych zdarzeń, rejestr zatwierdzeń, zapis commitów i wdrożeń.
- Mechanizm rollbacku oraz alert przy próbie niezautoryzowanego wdrożenia.

Dodatkowo przeprowadzić audyt istniejących webhooków GitHub/Firebase/Vercel/Netlify i innych automatów, które mogą publikować na produkcji bez bramki. Nie wyłączać działających emisji ani usług pochopnie: wszelkie zmiany konfiguracji przeprowadzać kontrolowanie, po analizie ryzyka i akceptacji.

## 6. Zakres systemowy

Dotyczy całego EKOCC: polskieradio.cc i jego podstron, Christian Culture GO, ccMC, LUMINA, aplikacji Android/PWA, radia i TV LIVE, OBS, DAW, SMS/MMS, WhatsApp, newsletterów, stron medialnych, chatbotów, wyszukiwarek, baz danych, kalendarza, API, skryptów, repozytoriów i przyszłych produktów.

Dotyczy również zmian niewidocznych dla odbiorcy: migracji baz, zasad Firebase, uprawnień, kluczy, cronów, webhooków, harmonogramów emisji, wydań aplikacji i modeli AI.

## 7. Obowiązki agentów

Każdy agent przed pracą:
1. Czyta tę dyrektywę i potwierdza jej przyjęcie w systemie skrzynki.
2. Rozpoznaje aktualne ścieżki produkcyjne i testowe; nie tworzy pozornych środowisk.
3. Przygotowuje i testuje zmianę, nie dotykając publicznej wersji.
4. Przekazuje link do testów, wyniki i SHA do zatwierdzenia.
5. Oczekuje na jednoznaczne `ZATWIERDZAM` właściciela dotyczące tej wersji.
6. Nie publikuje przy braku zgody, konflikcie zasad, błędach krytycznych lub braku zabezpieczeń.
7. Raportuje wynik i dokumentuje ewentualny rollback.

Nie wolno domniemywać, że sama publikacja tej dyrektywy wdrożyła techniczne blokady. Do zakończenia audytu agentom bezwzględnie zabrania się samodzielnych wdrożeń produkcyjnych.

## 8. Raport zmiany

```yaml
projekt: 
agent: 
repozytorium: 
produkcja_url: 
staging_url: 
commit_sha: 
zakres: 
testy: 
ryzyka: 
rollback: 
status: DEVELOPMENT # TESTING / REVIEW / CHANGES_REQUESTED / APPROVED / DEPLOYED / VERIFIED / REJECTED / BLOCKED / ROLLED_BACK
akceptacja_wlasciciela: BRAK
zatwierdzony_sha: BRAK
wdrozenie_czas_utc: BRAK
```

Dziennik: kto, co, kiedy, dlaczego, w jakiej wersji, na podstawie jakiej zgody i z jakim wynikiem.

## 9. Pierwsze zadania wdrożeniowe

1. Sporządzić inwentaryzację repozytoriów, publicznych URL, hostingu, baz i workflow deploy.
2. Przygotować matrycę `produkcja -> staging` dla całego EKOCC.
3. Opracować izolowane środowiska staging i politykę danych testowych.
4. Zweryfikować wszystkie istniejące drogi publikacji, blokując obejścia po uzgodnionym planie migracji.
5. Skonfigurować RELEASE GUARDIAN w CI/CD oraz uprawnienia właściciela.
6. Zbudować formularz raportu, rejestr akceptacji i rollback.
7. Przetestować procedurę na `/ccMC -> /test/ccMC` przed rolloutem globalnym.
8. Uzyskać od właściciela osobne zatwierdzenie każdego wdrożenia mechanizmów bezpieczeństwa.

## 10. Zasada nadrzędna

**TEST → WERYFIKACJA → AKCEPTACJA WŁAŚCICIELA → PUBLIKACJA → KONTROLA.**

**NIE MA AKCEPTACJI = NIE MA DEPLOY.**

Christian Culture / @ICC / EKOCC · P0 · 2026-11-11
