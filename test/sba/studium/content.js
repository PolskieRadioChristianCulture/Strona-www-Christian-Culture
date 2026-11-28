/**
 * content.js — Treści metodyczne i pytania Christian Culture dla „Głębokie studium”.
 * Zestawy pytań stanowią oryginalne opracowanie Christian Culture na bazie zasad hermeneutycznych.
 */

export const OPENING_SCREEN = {
  mottoPrimary: 'Czytaj w obecności Autora. Nie tylko czytaj. Odkrywaj. Rozumiej. Żyj.',
  mottoSecondary: 'Gdy nie rozumiesz tekstu, zacznij od modlitwy.',
  introHeading: 'Czytaj w obecności Autora',
  introText: 'Czytaj w obecności Autora. Zanim rozpoczniesz studium, zatrzymaj się na chwilę. Poproś Boga, aby przez Ducha Świętego pomógł Ci zrozumieć Jego Słowo, rozpoznać prawdę i zastosować ją w życiu.',
  prayerLabel: 'Proponowana modlitwa przed studium',
  proposedPrayer: 'Ojcze, dziękuję Ci za Twoje Słowo. Proszę, otwórz mój umysł i serce, pomóż mi dostrzec prawdę, odrzucić własne uprzedzenia i żyć zgodnie z Twoją wolą. W imieniu Jezusa Chrystusa. Amen.',
  verseRefs: [
    { book: 'PSA', ch: 119, v: 18, end: 18, label: 'Ps 119:18' },
    { book: 'JAS', ch: 1, v: 5, end: 5, label: 'Jk 1:5' },
    { book: 'LUK', ch: 24, v: 45, end: 45, label: 'Łk 24:45' },
    { book: 'JHN', ch: 16, v: 13, end: 13, label: 'J 16:13' },
    { book: '2TI', ch: 3, v: 16, end: 17, label: '2 Tm 3:16–17' }
  ]
};

export const STUCK_HELP = {
  title: 'Nie rozumiem tekstu — spokojny plan powrotu',
  lead: 'Brak jasności na początku studium jest naturalny. Nie musisz niczego wymuszać ani zgadywać.',
  steps: [
    '1. Zacznij od modlitwy — poproś Autora Pisma o światło i cierpliwość (Jk 1:5; Ps 119:18).',
    '2. Przeczytaj szerszy kontekst: poszerz widok w panelu po lewej na cały Akapit lub Rozdział.',
    '3. Sprawdź, kto mówi, do kogo i w jakiej sytuacji — często jedno wcześniejsze zdanie wyjaśnia cały werset.',
    '4. Porównaj z innymi wersetami (zakładka Teksty paralelne w etapie 04 lub MojaBiblia ze słownikiem Stronga).',
    '5. Jeśli nadal masz wątpliwości — zapisz pytanie w polu „Niepewność” w etapie 05 lub oznacz kartę jako „Nie dotyczy / wrócę później”.'
  ]
};

export const STAGES = [
  { id: '01', code: '01', title: 'Czytaj', shortTitle: '01. Czytaj', quick: true, desc: 'Modlitwa, uważne czytanie tekstu UBG, poszerzenie zakresu i pierwsze wrażenia.' },
  { id: '02', code: '02', title: 'Odkrywaj', shortTitle: '02. Odkrywaj', quick: true, desc: 'Wielka Szóstka obserwacji: Kto, Co, Kiedy, Gdzie, Dlaczego i Jak.' },
  { id: '03', code: '03', title: 'Analizuj', shortTitle: '03. Analizuj', quick: false, desc: 'Wielka Dwunastka powiązań w tekście oraz oznaczanie kluczowych elementów.' },
  { id: '04', code: '04', title: 'Badaj kontekst', shortTitle: '04. Kontekst', quick: true, desc: 'Siedem kręgów kontekstu, kontekst bliski i cały kanon oraz 12 pytań hermeneutycznych.' },
  { id: '05', code: '05', title: 'Zrozum', shortTitle: '05. Zrozum', quick: false, desc: 'Zasady rzetelnej egzegezy (Sola Scriptura) i 12 pytań interpretacyjnych.' },
  { id: '06', code: '06', title: 'Zastosuj', shortTitle: '06. Zastosuj', quick: true, desc: 'Osobista odpowiedź serca, konkretne postanowienia i modlitwa.' },
  { id: '07', code: '07', title: 'Twórz', shortTitle: '07. Twórz', quick: false, desc: 'Studio Kreatywne Biblii (13 formatów bez AI) oraz interaktywna Mapa myśli.' },
  { id: '08', code: '08', title: 'Dziel się', shortTitle: '08. Dziel się', quick: false, desc: 'Moje studia, eksport PDF / JSON, prywatne udostępnianie i narzędzia ekosystemu.' }
];

export const QUICK_STAGE_IDS = ['01', '02', '04', '06'];

export const BIG_SIX = [
  { id: 'b6_who', badge: '01 Kto?', title: 'Kto mówi, kto słucha i kto działa?', help: 'Wypisz wszystkie osoby, grupy, Boga, posłańców lub rozmówców obecnych albo wspomnianych w fragmencie.' },
  { id: 'b6_what', badge: '02 Co?', title: 'Co się wydarza, co zostaje powiedziane lub nakazane?', help: 'Uchwyć główne czynności, słowa, decyzje, obietnice albo ostrzeżenia bez dopowiadania własnych wniosków.' },
  { id: 'b6_when', badge: '03 Kiedy?', title: 'Kiedy to się dzieje i jakie są sygnały czasu?', help: 'Wypisz słowa takie jak: „wtedy”, „potem”, „dzisiaj”, „zanim”, „aż”, święta, pory dnia lub etapy historii.' },
  { id: 'b6_where', badge: '04 Gdzie?', title: 'Gdzie rozgrywa się ta scena?', help: 'Zauważ nazwy geograficzne, miejsca (np. świątynia, droga, więzienie, dom) i kierunek przemieszczania się.' },
  { id: 'b6_why', badge: '05 Dlaczego?', title: 'Dlaczego to zostało powiedziane lub zapisane?', help: 'Szukaj spójników przyczynowych i celowych: „abym”, „ponieważ”, „dlatego”, „bo”, „żeby”.' },
  { id: 'b6_how', badge: '06 Jak?', title: 'Jak to przebiega, w jakim tonie i jakim sposobem?', help: 'Zwróć uwagę na sposób działania, kolejność wydarzeń, styl wypowiedzi (pytanie, nakaz, obietnica, prośba).' }
];

export const BIG_TWELVE = [
  { id: 'b12_similarities', title: 'Podobieństwa i porównania', help: 'Czy w tekście są słowa „jak”, „podobnie”, „tak samo” albo zestawienia dwóch rzeczy o wspólnej cesze?' },
  { id: 'b12_contrasts', title: 'Kontrasty i przeciwieństwa', help: 'Szukaj sygnałów „lecz”, „ale”, „natomiast”, „inaczej” (np. światło vs ciemność, ciało vs duch).' },
  { id: 'b12_repetitions', title: 'Powtórzenia słów i myśli', help: 'Które wyrazy, tematy lub zwroty powracają najczęściej? W Biblii powtórzenie wskazuje wagę myśli.' },
  { id: 'b12_causality', title: 'Przyczynowość i skutki', help: 'Co z czego wynika? Co jest fundamentem, a co owocem lub konsekwencją?' },
  { id: 'b12_details', title: 'Szczegóły pozornie drobne', help: 'Liczby, przymiotniki, zaimki („my”, „wy”, „on”), czasowniki w określonym czasie lub trybie.' },
  { id: 'b12_progression', title: 'Rozwój i punkt kulminacyjny', help: 'Czy napięcie lub argumentacja narasta od wstępu do głównego zdania?' },
  { id: 'b12_dialogue', title: 'Dialog, pytania i odpowiedzi', help: 'Jak rozmówcy reagują na siebie nawzajem? Czy odpowiedź wprost odpowiada na pytanie, czy sięga głębiej?' },
  { id: 'b12_solutions', title: 'Problemy i Boże rozwiązania', help: 'Jaki kryzys, brak lub grzech jest widoczny i w jaki sposób Bóg na niego odpowiada?' },
  { id: 'b12_proportions', title: 'Proporcje i nacisk tekstu', help: 'Czemu autor poświęca najwięcej miejsca i słów w tym fragmencie?' },
  { id: 'b12_connections', title: 'Powiązania spójnikowe', help: 'Zaznacz „więc”, „przeto”, „dlatego”, „ponieważ” — łączą myśli w logiczny ciąg.' },
  { id: 'b12_commands', title: 'Polecenia i wezwania', help: 'Czy tekst zawiera wyraźne wezwanie do działania, postawy serca lub zaniechania czegoś?' },
  { id: 'b12_promises', title: 'Obietnice i gwarancje Boga', help: 'Co Bóg deklaruje, do kogo ta obietnica jest skierowana i na jakich warunkach (jeśli są podane)?' }
];

export const ANNOTATION_CATEGORIES = [
  { id: 'obietnice', label: 'Obietnice', icon: '★', color: '#1b6b3a', bg: '#e8f5ee' },
  { id: 'prawdy_o_bogu', label: 'Prawdy o Bogu', icon: '✦', color: '#8f1227', bg: '#fdecef' },
  { id: 'wskazowki', label: 'Wskazówki', icon: '➜', color: '#184e77', bg: '#eaf3fa' },
  { id: 'ostrzezenia', label: 'Ostrzeżenia', icon: '▲', color: '#9a4b00', bg: '#fff3e2' },
  { id: 'proroctwa', label: 'Proroctwa', icon: '◈', color: '#5c2d91', bg: '#f3ecfc' },
  { id: 'polecenia', label: 'Polecenia', icon: '⚑', color: '#b71933', bg: '#fce8ec' },
  { id: 'kontekst', label: 'Kontekst', icon: '◎', color: '#374151', bg: '#f1f3f5' },
  { id: 'relacje', label: 'Relacje', icon: '❖', color: '#7c2d12', bg: '#fbeee8' }
];

export const CONTEXT_CIRCLES = [
  { id: 'verse', title: '1. Werset', desc: 'Dokładna struktura zdania i relacje między wyrazami w badanym wersecie.' },
  { id: 'paragraph', title: '2. Akapit', desc: 'Bezpośrednio poprzedzające i następujące zdania tworzące jedną myśl.' },
  { id: 'chapter', title: '3. Rozdział', desc: 'Główny temat, argument lub scena całego rozdziału.' },
  { id: 'book', title: '4. Księga', desc: 'Cel napisania całej księgi, jej autor, adresaci i układ literacki.' },
  { id: 'history', title: '5. Historia i kultura', desc: 'Realia epoki, geografia, zwyczaje i sytuacja życiowa pierwszych odbiorców.' },
  { id: 'theology', title: '6. Teologia biblijna', desc: 'Miejsce fragmentu w historii zbawienia i objawieniu o Chrystusie.' },
  { id: 'canon', title: '7. Całe Pismo', desc: 'Zgodność z nauczaniem całej Biblii (Starego i Nowego Testamentu).' }
];

export const HERMENEUTIC_QUESTIONS = [
  { id: 'h1', title: 'Co poprzedza ten fragment w najbliższych wersetach?', help: 'Sprawdź, od czego zaczęła się myśl w akapicie powyżej.' },
  { id: 'h2', title: 'Co następuje bezpośrednio po tym fragmencie?', help: 'Zobacz konkluzję autora lub skutek opisanego zdarzenia.' },
  { id: 'h3', title: 'Jaki jest główny wątek całego rozdziału?', help: 'Spróbuj streścić ten rozdział w 1–2 własnych zdaniach.' },
  { id: 'h4', title: 'Jaki cel miała cała księga dla pierwszych czytelników?', help: 'Odnieś fragment do przesłania księgi jako całości.' },
  { id: 'h5', title: 'Jaki to gatunek literacki?', help: 'Narracja historyczna, poezja/psalm, przysłowie, proroctwo, apokaliptyka, przypowieść czy list?' },
  { id: 'h6', title: 'Jakie realia historyczne lub kulturowe tłumaczą ten obraz?', help: 'Czy pojawiają się urzędy, zwyczaje, miary, miejsca lub napięcia tamtych czasów?' },
  { id: 'h7', title: 'Do kogo kierowano te słowa pierwotnie?', help: 'Izrael pod Przymierzem, uczniowie, pojedynczy człowiek, cały zbór czy konkretny adresat?' },
  { id: 'h8', title: 'Czy autor cytuje tu albo nawiązuje do Starego Testamentu?', help: 'Sprawdź zapożyczenia, aluzje lub obietnice wcześniejszego objawienia.' },
  { id: 'h9', title: 'Czy sformułowanie ma charakter dosłowny, czy przenośny/symboliczny?', help: 'Oceń na podstawie gatunku i sąsiednich zdań.' },
  { id: 'h10', title: 'Jakie inne fragmenty Pisma mówią na ten sam temat jaśniej?', help: 'Fragmenty trudniejsze wyjaśniamy przez jaśniejsze z tego samego tematu.' },
  { id: 'h11', title: 'Co ten fragment wnosi do historii zbawienia i osoby Jezusa?', help: 'Jak łączy się z Ewangelią łaski i dziełem Chrystusa?' },
  { id: 'h12', title: 'Co mogłoby zmienić znaczenie, gdyby wyrwać ten werset z kontekstu?', help: 'Nazwij najczęstsze nieporozumienie wynikające z czytania samego wyrwanego zdania.' }
];

export const INTERPRETATION_PRINCIPLES = [
  { id: 'p_sola', title: 'Sola Scriptura', desc: 'Pismo Święte stanowi jedyną i wystarczającą normę wiary oraz praktyki chrześcijańskiej.' },
  { id: 'p_tota', title: 'Tota Scriptura', desc: 'Całe Pismo jest natchnione i spójne — nie wybieramy wygodnych fragmentów w oderwaniu od reszty.' },
  { id: 'p_self', title: 'Pismo wyjaśnia Pismo', desc: 'Najlepszym komentarzem do Biblii jest sama Biblia, zwłaszcza jaśniejsze miejsca paralelne.' },
  { id: 'p_christ', title: 'Chrystocentryczność', desc: 'Pismo wskazuje na Jezusa Chrystusa — Jego osobę, charakter Boga, krzyż i zmartwychwstanie.' },
  { id: 'p_hist', title: 'Metoda historyczno-gramatyczna', desc: 'Pytamy, co słowa znaczyły w swojej gramatyce i sytuacji historycznej autora.' },
  { id: 'p_exegesis', title: 'Egzegeza zamiast eisegezy', desc: 'Wydobywamy znaczenie z tekstu, zamiast wnosić własne życzenia lub modne hasła.' },
  { id: 'p_analogy', title: 'Analogia wiary', desc: 'Żadna interpretacja jednego wersetu nie może przeczyć jasnemu nauczaniu całej Biblii.' },
  { id: 'p_desc', title: 'Opis vs nakaz', desc: 'To, że Biblia opisuje czyjeś zachowanie, nie oznacza automatycznie, że nakazuje je naśladować.' },
  { id: 'p_diff', title: 'Interpretacja vs zastosowanie', desc: 'Tekst ma jedno zakorzenione znaczenie dla autora i adresatów, a wiele zastosowań dziś.' },
  { id: 'p_humility', title: 'Pokora interpretacyjna', desc: 'Gdzie Pismo milczy lub pozostawia napięcie, przyznajemy uczciwie: „jeszcze nie wiem”.' }
];

export const CONTROL_EXAMPLE = {
  title: 'Przykład kontrolny rzetelnej interpretacji: List do Filipian 4:13 w świetle 4:10–14',
  focusRef: { book: 'PHP', ch: 4, v: 13, end: 13, label: 'Flp 4:13' },
  contextRef: { book: 'PHP', ch: 4, v: 10, end: 14, label: 'Flp 4:10–14' },
  eisegezaMistake: 'Błąd czytania wyrwanego (eisegeza): „Chrystus sprawi, że na pewno wygram zawody, zdam bez nauki lub osiągnę każdy cel finansowy, jaki sobie wymarzę”.',
  exegesisTruth: 'Odczyt z kontekstu Flp 4:10–14 (egzegeza): Apostoł Paweł pisze z więzienia, że w Chrystusie nauczył się poprzestawać na tym, co ma — zarówno żyć w niedostatku i głodzie, jak i w obfitości. Siła z wersetu 4:13 to wierność i pokój w każdych okolicznościach pod Jego wolą.'
};

export const INTERPRETATION_QUESTIONS = [
  { id: 'i1', title: 'Jak brzmi główna teza lub sedno tego fragmentu w jednym zdaniu?', help: 'Streść, co autor chciał przekazać swoim pierwszym odbiorcom.' },
  { id: 'i2', title: 'Jakie znaczenie mają kluczowe słowa w ich kontekście?', help: 'Uwzględnij użycie wyrazu w tym akapicie i w MojaBiblia (kody Stronga).' },
  { id: 'i3', title: 'Czy zdanie wyraża prawdę opisową, nakaz moralny czy obietnicę przymierza?', help: 'Rozdziel relację historyczną od uniwersalnej zasady.' },
  { id: 'i4', title: 'Co fragment objawia o charakterze, miłości, sprawiedliwości i świętości Boga?', help: 'Bóg jest głównym bohaterem całego Pisma.' },
  { id: 'i5', title: 'Co fragment pokazuje o kondycji i sercu człowieka?', help: 'Jakie postawy, słabości, potrzeby lub powołanie człowieka wychodzą na jaw?' },
  { id: 'i6', title: 'Jak ten fragment łączy się z Ewangelią Jezusa Chrystusa?', help: 'Jak prowadzi do krzyża, łaski, zbawienia lub nowego życia w Duchu?' },
  { id: 'i7', title: 'Czy są tu warunki, ostrzeżenia albo obiecane skutki wiary?', help: 'Sprawdź zależność między posłuszeństwem, zaufaniem a działaniem Boga.' },
  { id: 'i8', title: 'Czy mój wniosek zgadza się z resztą Pisma Świętego?', help: 'Sprawdź, czy nie powstaje sprzeczność z innymi jasnymi wersetami.' },
  { id: 'i9', title: 'Jakich współczesnych założeń nie powinienem tu dopisywać na siłę?', help: 'Sprawdź, czy nie narzucasz tekstowi dzisiejszych haseł kulturowych lub sukcesu.' },
  { id: 'i10', title: 'Jaką ponadczasową zasadę duchową można stąd wyprowadzić?', help: 'Oddziel formę kulturową od wiecznej prawdy Bożej.' },
  { id: 'i11', title: 'Co w tym fragmencie pozostaje trudne albo jeszcze niejasne?', help: 'Uczciwe zapisanie pytania chroni przed pochopnym błędem.' },
  { id: 'i12', title: 'Co zmieniłbym w swojej pierwszej myśli po zbadaniu kontekstu?', help: 'Porównaj pierwsze wrażenie z etapu 01 z dojrzałym odczytem z etapu 04–05.' }
];

export const APPLICATION_QUESTIONS = [
  { id: 'a1', title: 'Jaką prawdę o Bogu chcę dziś przyjąć z wdzięcznością i uwielbieniem?', help: 'Zastosowanie zaczyna się od poznania Boga, zanim pojawi się lista zadań.' },
  { id: 'a2', title: 'Jaki grzech, niewiarę lub złą postawę ten fragment odsłania w moim życiu?', help: 'Bez potępienia — w świetle łaski i gotowości do nawrócenia.' },
  { id: 'a3', title: 'Jakiej obietnicy Bożej mogę dziś zaufać w swojej obecnej sytuacji?', help: 'Zapisz ją krótko i pamiętaj o jej biblijnym kontekście.' },
  { id: 'a4', title: 'Przed jakim błędem lub pokusą to Słowo mnie ostrzega?', help: 'Na co szczególnie powinienem uważać w najbliższych dniach?' },
  { id: 'a5', title: 'Jaki przykład postawy z tego tekstu warto naśladować (lub czego unikać)?', help: 'Wskaż konkretną cechę lub decyzję z fragmentu.' },
  { id: 'a6', title: 'Co ten tekst mówi do mojego myślenia i nawyków dnia codziennego?', help: 'Przekuj prawdę na konkret: czas, słowa, decyzje, odpoczynek, priorytety.' },
  { id: 'a7', title: 'Jak wpływa to na moje relacje (dom, rodzina, przyjaciele, sąsiedzi)?', help: 'Przebaczenie, cierpliwość, prawda wypowiedziana w miłości, pojednanie.' },
  { id: 'a8', title: 'Jak dotyczy to mojej pracy, nauki, obowiązków lub finansów?', help: 'Uczciwość, służba, hojność, zaufanie zamiast lęku.' },
  { id: 'a9', title: 'W jaki sposób mogę tym Słowem posłużyć komuś we wspólnocie lub kościele?', help: 'Zachęta, modlitwa za kogoś, realna pomoc, rozmowa.' },
  { id: 'a10', title: 'Co konkretnego, mierzalnego i możliwego zrobię jeszcze w tym tygodniu?', help: 'Mały wierny krok znaczy więcej niż wielka niespełniona deklaracja.' },
  { id: 'a11', title: 'O jaką siłę Ducha Świętego muszę prosić, bo sam nie dam rady tego wypełnić?', help: 'Posłuszeństwo chrześcijanina płynie z łaski, nie z własnej pyszałkowatości.' },
  { id: 'a12', title: 'Jak mogę krótko podziękować Bogu i oddać Mu tę sprawę w modlitwie?', help: 'Zapisz krótką modlitwę odpowiedzi (prywatnie na tym urządzeniu).' }
];

export const CREATIVE_TEMPLATES = [
  { id: 'pieśń', title: 'Pieśń uwielbienia', prompt: 'Zwrotka 1 (prawda z tekstu):\nRefren (odpowiedź serca do Boga):\nZwrotka 2 (zastosowanie i nadzieja):' },
  { id: 'wiersz', title: 'Wiersz / medytacja poetycka', prompt: 'Tytuł:\nObrazy z badanego fragmentu:\nWersy:' },
  { id: 'grafika', title: 'Koncepcja grafiki / plakatu', prompt: 'Główny werset UBG:\nHasło przewodnie:\nOpis kadru / symbolika i paleta barw (np. do Kartek CC):' },
  { id: 'rozważanie', title: 'Krótkie rozważanie dzienne', prompt: 'Tytuł:\nWerset otwierający (UBG):\nKontekst i myśl główna:\nJedno zdanie na dziś:\nKrótka modlitwa:' },
  { id: 'konspekt_kazania', title: 'Konspekt kazania / nauczania', prompt: 'Temat i tekst główny:\n1. Wstęp (pytanie życiowe):\n2. Kontekst i znaczenie tekstu:\n3. Punkt centralny — Chrystus:\n4. Zastosowanie dla słuchaczy:' },
  { id: 'modlitwa', title: 'Modlitwa inspirowana Pismem', prompt: 'Uwielbienie (kim Bóg jest w tym tekście):\nWyznanie / skrucha:\nDziękczynienie:\nProśba o przemianę i prowadzenie:' },
  { id: 'opowiadanie', title: 'Opowiadanie / współczesna przypowieść', prompt: 'Bohater i sytuacja dnia codziennego:\nPunkt zwrotny w świetle fragmentu:\nPuenta:' },
  { id: 'komiks', title: 'Scenopis krótkiego komiksu (4 kadry)', prompt: 'Kadr 1 (sytuacja z tekstu):\nKadr 2 (napięcie / pytanie):\nKadr 3 (kluczowe słowo Pisma):\nKadr 4 (zastosowanie):' },
  { id: 'scenariusz', title: 'Scenariusz krótkiego filmu / audio', prompt: 'Otwarcie (pierwsze 3 sekundy):\nGłówny werset UBG:\nWyjaśnienie kontekstu (15–25 s):\nZakończenie i wezwanie do lektury:' },
  { id: 'fiszki', title: 'Fiszki do zapamiętania i nauki', prompt: 'Fiszka 1 — Adres i pełne brzmienie UBG:\nFiszka 2 — Główne słowo kluczowe i sens kontekstu:\nFiszka 3 — Osobiste przypomnienie na trudny dzień:' },
  { id: 'list', title: 'List zachęty do bliskiej osoby', prompt: 'Drogi/Droga …,\nPiszę, dzieląc się fragmentem, który dziś rozważałem:\nDlaczego to słowo niesie nadzieję:\nModlę się o Ciebie:' },
  { id: 'świadectwo', title: 'Osobiste świadectwo działania Słowa', prompt: 'Z czym przyszedłem przed ten fragment:\nCo Bóg pokazał mi w Swoim Słowie:\nCo się zmienia w moim działaniu:' },
  { id: 'mapa_mysli', title: 'Notatka tekstowa do Mapy myśli', prompt: 'Temat centralny:\nGłówne gałęzie odkryć:\nKluczowe odnośniki do innych wersetów:' }
];

export const STUDY_TYPES = [
  { id: 'werset', label: 'Werset / fragment' },
  { id: 'tematyczne', label: 'Tematyczne' },
  { id: 'biograficzne', label: 'Biograficzne (postać)' },
  { id: 'księgi', label: 'Przegląd księgi' },
  { id: 'słowa', label: 'Studium słowa kluczowego' }
];
