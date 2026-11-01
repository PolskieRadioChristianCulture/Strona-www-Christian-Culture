# Christian Culture topTEN × wspieramTO — Specyfikacja wdrożeniowa Etap II
Wersja 1.0 • 2026-11-01 • Dokument dla Antigravity / Claude Code

## 1. Cel i zasady nienegocjowalne
Serwis: https://polskieradio.cc/topTEN. Projekt: ZERO COST po stronie Christian Culture (preferuj istniejącą infrastrukturę, darmowe narzędzia i brak płatnych API). Nie wdrażać automatycznie do produkcji bez audytu. Zachować obecny frontend i kolory identyfikacji: czarny, biały, pomarańczowy. Nie prezentować demo jako faktycznych notowań.

Cel: katalog utworów chrześcijańskich, zgłoszenia nominacyjne, moderacja, interaktywne rankingi w czasie rzeczywistym, obserwowanie utworów, push, pomoc w dobrowolnym wsparciu artystów i dystrybucja wideo do Christian Culture TV / Polskie Radio TV / Osobowość PLUS.

## 2. Model punktowy — decyzja projektowa
Dwie czynności muszą być wyraźnie rozdzielone, aby zasada 'raz na dobę LubięTO' nie kolidowała z '7 podbić co godzinę'.
- LubięTO: 1 raz na użytkownika i utwór w dobie kalendarzowej Europe/Warsaw; +777 punktów.
- PodbijTO: maksymalnie 7 razy na użytkownika i utwór w tej samej dobie; interwał >=60 minut między zaakceptowanymi podbiciami. **Proponowana** wartość +77 punktów za podbicie. Parametr w konfiguracji panelu; wymaga zatwierdzenia wydawcy przed uruchomieniem. Maksymalnie +539 z PodbijTO i +777 z LubięTO na utwór na użytkownika w dobie, łącznie 1316. Wariant +777 za każde z siedmiu podbić wymaga świadomej zmiany polityki i znacząco podnosi podatność na manipulacje.
- Punkty liczone oddzielnie od rzeczywistej liczby unikalnych sympatyków, głosów i wsparć finansowych.
- Brak punktów za wpłaty, kliknięcia linków płatności, odsłuchy bez weryfikacji i udostępnienia.
- W tabeli live: pozycja, zmiana pozycji, suma punktów w bieżącym cyklu, liczba unikalnych głosujących, czas aktualizacji.
- Ograniczyć rankingi live do zatwierdzonych utworów i trwającego cyklu, np. poniedziałek 00:00–niedziela 23:59:59 Europe/Warsaw (konfigurowalne); publikować oficjalny wynik po audycie i zamknięciu cyklu.
- Remisy: większa liczba unikalnych głosujących, następnie więcej ważnych LubięTO, następnie wcześniejszy czas osiągnięcia wyniku, a w ostateczności wspólny ex aequo lub decyzja redakcyjna odnotowana w audycie.

## 3. Bezpieczeństwo punktacji i doświadczenie
Rejestracja/logowanie z potwierdzeniem e-mail. Serwerowy czas i walidacja. Unikalne klucze idempotencji, ograniczenia per konto/utwór/czas, anty-bot i ryzyko kont masowych, IP tylko jako sygnał nadużycia (nie jako definicja osoby), log audytowy append-only, wstrzymanie punktów podejrzanych, procedura odwołania. Nie pozwolić klientowi na wysłanie arbitralnych punktów. Transakcja bazy danych z blokadą/wymuszeniem unikalności. Widoczne informowanie o limicie: 'LubięTO dostępne jutro' i 'PodbijTO ponownie za xx minut'. Nie obiecywać aktualizacji w każdej milisekundzie: WebSocket/SSE przy aktywnej karcie, polling fallback (15–30 s), aktualizacja atomowa.

## 4. Nominacja — formularz
Ścieżka: /topTEN/nominacje. Pola obowiązkowe: nazwa artysty/projektu, nazwa utworu, kraj, język, gatunek, imię i nazwisko zgłaszającego / nazwa uprawnionego podmiotu, e-mail, opis przesłania biblijnego i odniesienia do Pisma, link do pliku wideo na Google Drive, tytuł i potwierdzenie własności/licencji praw do muzyki, tekstu, nagrania, wideo, okładki, wykonania i osób widocznych w materiale. Opcjonalnie link do oficjalnego YouTube, tekst piosenki, link do dokumentacji praw, miniatura, informacja o CC, informacja o materiałach AI (jeśli ma znaczenie dla oceny praw).

Google Drive: użytkownik udostępnia link tylko do odczytu, włączony dostęp dla osób z linkiem lub osobna autoryzacja dla redakcji; konieczne jest realne prawo pobrania i odtworzenia (dostęp pod linkiem nie jest licencją). Walidacja URL, test odczytu, skan pliku po pobraniu, dopuszczalne formaty MP4 (H.264/AAC zalecane), limit rozmiaru administracyjny, nie pobierać automatycznie z niezaufanych URL bez polityki SSRF. Unikać publicznego ujawnienia prywatnych linków Drive.

Formularz po wysłaniu: rekord zgłoszenia, identyfikator CC-TT-YYYY-NNNN, status 'złożono', e-mail potwierdzający, powiadomienie na radiochristianculture@gmail.com. Mail jest oficjalnym kanałem otrzymywania zgłoszeń; w przypadku awarii e-mail kolejka retry i panel. Nie obiecywać, że samo przesłanie wiadomości oznacza publikację.

## 5. Warunki publikacji na YouTube
Oddzielna obowiązkowa zgoda/licencja na: ocenę przez redakcję; pobranie i przechowanie materiału; ewentualne techniczne kodowanie/napisy/miniaturę; publiczną publikację wideo na wskazanych kanałach: Christian Culture TV, Polskie Radio TV, Osobowość PLUS; dodanie do playlist i cross-promocję. Pełny zakres: niewyłączna, terytorialnie światowa, bezpłatna licencja na uzgodniony okres (np. do odwołania z odpowiednim trybem wycofania), z prawem hostingu na YouTube, bez przenoszenia praw własności; doprecyzować prawa do synchronizacji muzyki i praw pokrewnych, możliwość ograniczenia kanałów, kontakt do zgłoszeń praw. Oddzielnie zgoda na publikację danych artysty/profilu, której nie należy mylić z podstawą RODO.

Przed publikacją sprawdzenie licencji, praw do sampli, cudzych nagrań i aranżacji, zdjęć, wizerunków oraz warunków YouTube. Prawa do pliku nie wynikają z posiadania linku Google Drive. Publikacja redakcyjna po akceptacji, nie automatyczna.

## 6. Kwalifikacja treści i moderacja
Kryteria: treść zgodna z biblijnym chrześcijaństwem, szacunek dla Boga i bliźniego, brak nawoływania do przemocy, nienawiści, pornografii, oszustw i naruszeń praw; Dekalog jako etyczno-biblijny fundament; wymagany punkt odniesienia do konkretnego wersetu/tematu biblijnego. Nie wymuszać arbitralnych kryteriów teologicznych bez ich jawnego zdefiniowania; możliwość konsultacji redakcyjno-teologicznej.

Stany: draft -> submitted -> awaiting_media -> theological_review -> rights_review -> approved -> published / rejected / withdrawn / takedown. Redakcja może odmówić nominacji bez indywidualnego uzasadnienia, z zastrzeżeniem obowiązującego prawa, informacji wymaganych przepisami i procedury zgłoszenia błędu/odwołania. Zapis decyzji wewnętrzny obowiązkowy. Neutralny komunikat odmowy; nie upubliczniać szczegółów zgłaszającego.

## 7. wspieramTO
Na karcie utworu dyskretny przycisk 'Wspieram artystę' obok akcji LubięTO/PodbijTO. Na stronie głównej 1 moduł partnerski między rankingami, bez modalów, autoplay ani dark patterns. Płatności poza topTEN, bez pośredniczenia w przelewie przez CC i bez punktów rankingowych.

Dopuszczalne metody: zrzutka.pl, Revolut, PayPal, BLIK QR. Artysta uzupełnia 'support_methods': typ, bezpieczny URL lub obraz QR, etykieta, własność rachunku, waluta, kraj, czy to darowizna/zrzutka. BLIK: tylko zatwierdzony statyczny QR/instrukcja płatności; NIE przyjmować i NIE publikować jednorazowych 6-cyfrowych kodów BLIK, tokenów lub danych logowania. Kody jednorazowe są poufne i krótkotrwałe. Dla QR: upload obrazu PNG/JPG/WebP, antywirus/skan, dekodowanie do sprawdzenia docelowego adresu, weryfikacja domeny i zgodności treści; użytkownik widzi nazwę odbiorcy i ostrzeżenie o zewnętrznej płatności.

Sposoby wsparcia muszą być opcjonalne, niewymagane do nominacji, moderowane i możliwe do zgłoszenia. Linki `rel=noopener noreferrer ugc nofollow`; nie przechowywać danych kart ani informacji o tym, kto i ile wpłacił.

## 8. Obserwowanie i powiadomienia
Dla zalogowanych: 'Obserwuj utwór' + ustawienia zdarzeń: awans o N miejsc (np. >=3), spadek o N, wejście do TOP 10, nowe notowanie, przypomnienie o dostępności LubięTO i PodbijTO; domyślnie powiadomienia niskiej częstotliwości, dzienny limit i quiet hours. Push tylko opt-in osobno od zgody marketingowej; Web Push z service worker + VAPID, unsubscribe 1 kliknięciem, tokeny przechowywane zaszyfrowane/bezpiecznie. iOS web push zgodnie z ograniczeniami instalowanych web apps. Email fallback tylko jeśli osobno włączony. Nie wysyłać alertów przy każdej zmianie o jedno miejsce.

## 9. Informacja o zmianach na żywo
UI: znacznik 'NA ŻYWO', strzałki góra/dół, animacja z preferencją `prefers-reduced-motion`, wykres 24 h/7 dni, historia punktów, ślad audytu do moderatora. Wyniki zatwierdzonych akcji aktualizują pozycję w czasie rzeczywistym; po zamknięciu cyklu oficjalny archiwalny snapshot niezmienny.

## 10. Interfejsy / API — propozycja
GET /api/topten/charts?edition=global|pl|world&week=...
GET /api/topten/tracks/:id
GET /api/topten/tracks/:id/history
POST /api/topten/tracks/:id/like (auth, idempotency)
POST /api/topten/tracks/:id/boost (auth, idempotency)
POST /api/topten/tracks/:id/follow; DELETE .../follow
GET /api/topten/events (SSE, auth optional)
POST /api/topten/nominations (auth optional with verified email + rate limits)
POST /api/topten/support-qr-upload (auth, validated object storage)
GET /api/topten/me/actions?track=...
POST /api/topten/push/subscribe; DELETE /api/topten/push/subscribe
GET/POST /api/admin/topten/nominations/... (admin RBAC + 2FA)
POST /api/admin/topten/publish-week (admin, double confirmation)

Nigdy nie opierać autoryzacji na ukrytych przyciskach w frontendzie. Ochrona przed CSRF, CORS ograniczony, cookies Secure HttpOnly SameSite, CSP, rate limiting, sanitizacja HTML, walidacja wejść, integralność transakcyjna.

## 11. Model danych — tabele
users(id,email_verified_at,role,created_at); artists(id,name,country,links,rights_contact); tracks(id,artist_id,title,slug,language,genre,bible_refs,status,cover_url,video_url,created_at); nominations(id,track_id,submitter_id,submitter_email,drive_url,rights_declaration,publication_license_version,status,submitted_at,reviewer_id,reviewed_at); support_methods(id,artist_id,type,url,qr_asset_id,verified_at,status); chart_cycles(id,edition,start_at,end_at,status); action_events(id,user_id,track_id,cycle_id,action_type,points,created_at,idempotency_key,review_status); chart_totals(track_id,cycle_id,score,unique_likers,boosts,rank,updated_at); follows(user_id,track_id,notification_preferences); push_subscriptions(id,user_id,endpoint,keys_encrypted,created_at); notifications(id,user_id,track_id,event_type,status,created_at); audit_log(id,actor_id,action,object_id,details,timestamp).

Constraints: unique(user_id,track_id,local_date,action_type='like') logic via like_daily table; boosts max 7/day and >=60min enforced transactionally; idempotency_key UNIQUE; foreign keys, indexes (cycle_id,score desc), event append-only. Race tests: parallel 50 requests -> max exactly one LubięTO, max 7 boosts, no overscoring.

## 12. Zero-cost i integracje EkoCC
Preferuj istniejące logowanie i katalog EkoCC; nie twórz nowego Identity bez potrzeby. Przed implementacją audyt repozytorium i środowiska hostingu. Backend kompatybilny z obecnym stosikiem; opcjonalnie Cloudflare Workers/D1/R2 free tier **po weryfikacji aktualnych limitów** i ryzyka wyczerpania; cron do zamknięć tygodnia. Web Push self-hosted z VAPID. SMTP lub Gmail API tylko przy istniejącym, autoryzowanym dostępie i ograniczeniach kwotowych. Drive linki do pobrania nie wymagają tworzenia kopii bez pozwolenia; pobranie manualne po akceptacji. YouTube API opcjonalne, automatyczna publikacja dopiero po audycie praw i zgodzie operatora.

Orkiestra: @005 — przyjęcie i przekazanie spraw; @077 — strategia, standardy i QA; @004 — harmonogram cykli, zamknięcie notowań, przypomnienia; @777 — reguły ustrojowe/standard zgodności, nie automatyczny wykonawca. Wdrożenia mogą dokonać dostępni agenci programistyczni w ramach faktycznych uprawnień. Nie zakładać sprawnych integracji bez testu E2E.

## 13. Etapy i kryteria akceptacji
Faza 0 — audyt /topTEN i EkoCC, kopia zapasowa, plan rollback, potwierdzenie domeny, logowania i infrastruktury.
Faza 1 — baza, API, nominacje, walidacja formularza, kolejka wysyłki maila na radiochristianculture@gmail.com, panel moderacji oraz prawa publikacji. Kryterium: nominacja E2E trafia do bazy i oficjalnej skrzynki, weryfikacja praw działa.
Faza 2 — LubięTO, PodbijTO, liczniki, live leaderboard, audyt, antyfraud, wyświetlanie rankingu. Kryterium: powtarzane żądania i wyścigi nie obchodzą limitów; wyniki przewidywalne.
Faza 3 — obserwowanie, push opt-in, cisza nocna, frekwencja alertów, ustawienia wycofania zgód.
Faza 4 — wspieramTO i bezpieczne QR, analiza bezpieczeństwa linków, UX i polityka zgłoszeń.
Faza 5 — publikacja YouTube z checklistą praw, edycja danych artystów, SEO/schema.org MusicRecording/MusicGroup i archiwum.
Faza 6 — testy integracyjne, dostępność WCAG 2.2 AA, wydajność mobile, monitoring, kopie zapasowe, rollout testowy i produkcyjny po akceptacji.

## 14. Dodatki rekomendowane
- Publiczny 'Jak liczymy punkty' + metryka unikalnych głosujących i transparentne historie notowań.
- Przycisk 'Zgłoś naruszenie' przy każdym teledysku i linku wsparcia.
- Automatyczna kontrola martwych linków Drive i płatności, rewalidacja nominacji przed publikacją.
- Eksport tygodniowej audycji radiowej i grafiki do YouTube 16:9 / short 9:16, wyłącznie z licencjonowanymi okładkami/fragmentami.
- WspieramTO jako wsparcie artystów, ale bez komercyjnego faworyzowania i bez obowiązkowej wpłaty.
- Osobne zestawienia Polska / Świat jako widoki filtrów; unikać podwójnego liczenia tych samych punktów między kategoriami, publikować spójny algorytm.

## 15. Decyzje wymagające zatwierdzenia przed kodowaniem produkcyjnym
A. Czy PodbijTO ma 77 punktów (rekomendowane), 777 punktów, czy tylko wpływać na widoczność promocyjną? W dokumencie obowiązuje domyślnie projektowe +77.
B. Czy limity 7 PodbijTO mają dotyczyć jednej piosenki, czy łącznie wszystkich piosenek na konto dziennie? Tu: na piosenkę.
C. Częstotliwość notowania: rekomendowane tygodniowe; ranking na żywo ciągły w ramach tygodnia.
D. Ostateczna treść Dekalogu jako kryterium, zasady interpretacji i wersja regulaminu — do zatwierdzenia redakcyjno-prawnego.
E. Dokładny publiczny URL wspieramTO i regulamin płatności. Nie zmyślać.

## 16. Materiały źródłowe do implementacji
Google Drive sharing: https://support.google.com/drive/answer/7166529
YouTube Terms: https://www.youtube.com/t/terms
MDN Notifications API: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API
Apple Web Push: https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers
