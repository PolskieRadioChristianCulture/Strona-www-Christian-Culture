#!/usr/bin/env python3
"""
Generator Bazy 365 Najpopularniejszych Wersetów Biblii UBG dla Shorts CC
========================================================================
Pobiera dosłowny, kanoniczny tekst UBG (2025) bezpośrednio z plików JSON ekosystemu
i generuje bazę produkcyjną 365 odcinków Shorts Werset Dnia na cały rok.
"""

import json
import os
from pathlib import Path

ROOT = Path(r"C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc")
UBG_DIR = ROOT / "data" / "bible" / "ubg-2025"

# 365 wyselekcjonowanych, najbardziej znanych i poruszających wersetów Pisma Świętego
# Obejmujących pełną radę Bożą: Ewangelie, Listy Apostolskie, Psalmy, Przypowieści, Proroków i Pięcioksiąg.
VERSES_CONFIG = [
    # --- MIESIĄC 1: ZBAWIENIE, NOWE ŻYCIE I BOŻA MIŁOŚĆ ---
    ("JHN", 3, [16], "Ewangelia Jana 3:16", "Boża Miłość i Życie Wieczne", "Czy wiesz, jak wielka jest miłość Boga do Ciebie?"),
    ("ROM", 8, [28], "List do Rzymian 8:28", "Boża Opatrzność", "Nawet gdy wszystko się wali, Bóg ma plan."),
    ("PHP", 4, [13], "List do Filipian 4:13", "Moc w Chrystusie", "Czujesz, że brakuje Ci sił? Posłuchaj tego."),
    ("PSA", 23, [1], "Psalm 23:1", "Dobry Pasterz", "Czego naprawdę brakuje Twojemu sercu?"),
    ("PRO", 3, [5, 6], "Księga Przysłów 3:5-6", "Zaufanie Bogu", "Zaufaj Bogu całym sercem, a On wyprostuje Twoje ścieżki."),
    ("JER", 29, [11], "Księga Jeremiasza 29:11", "Przyszłość i Nadzieja", "Bóg zna myśli, które ma o Tobie — myśli o pokoju."),
    ("MAT", 11, [28], "Ewangelia Mateusza 11:28", "Ukojenie w Chrystusie", "Jesteś zmęczony i spracowany? Przyjdź do Jezusa."),
    ("ROM", 12, [2], "List do Rzymian 12:2", "Przemiana Umysłu", "Nie dostosowuj się do tego świata — daj się przemienić."),
    ("ISA", 40, [31], "Księga Izajasza 40:31", "Odnowienie Sił", "Ci, którzy ufają Panu, odzyskują skrzydła jak orły."),
    ("JOS", 1, [9], "Księga Jozuego 1:9", "Odwaga i Męstwo", "Nie bój się i nie lękaj — Pan Bóg jest z Tobą wszędzie."),
    ("EPH", 2, [8, 9], "List do Efezjan 2:8-9", "Zbawienie z Łaski", "Zbawienie to dar Boży, nie z uczynków."),
    ("2TI", 1, [7], "2 List do Tymoteusza 1:7", "Duch Mocy i Miłości", "Bóg nie dał nam ducha lęku, ale mocy i miłości."),
    ("GAL", 5, [22, 23], "List do Galacjan 5:22-23", "Owoc Ducha", "Oto prawdziwy owoc Ducha Świętego w życiu człowieka."),
    ("HEB", 11, [1], "List do Hebrajczyków 11:1", "Istota Wiary", "Czym tak naprawdę jest biblijna wiara?"),
    ("1CO", 13, [4, 5], "1 List do Koryntian 13:4-5", "Hymn o Miłości", "Prawdziwa miłość jest cierpliwa i łaskawa."),
    ("1CO", 13, [13], "1 List do Koryntian 13:13", "Wiara, Nadzieja i Miłość", "Największa z nich jest miłość."),
    ("PSA", 46, [1], "Psalm 46:1", "Bóg naszą Ucieczką", "Bóg jest naszą ucieczką i siłą w każdym utrapieniu."),
    ("MAT", 6, [33], "Ewangelia Mateusza 6:33", "Szukajcie Królestwa", "Szukajcie najpierw Królestwa Bożego, a wszystko inne będzie wam dodane."),
    ("ROM", 8, [38, 39], "List do Rzymian 8:38-39", "Nierozerwalna Miłość", "Nic nie zdoła odłączyć nas od miłości Boga."),
    ("PSA", 119, [105], "Psalm 119:105", "Światło Słowa", "Twoje Słowo jest pochodnią dla moich nóg."),
    ("1PE", 5, [7], "1 List Piotra 5:7", "Oddanie Trosk", "Wszystkie swoje troski przerzućcie na Niego."),
    ("JHN", 14, [6], "Ewangelia Jana 14:6", "Droga, Prawda i Życie", "Jezus jest jedyną Drogą, Prawdą i Życiem."),
    ("ROM", 10, [9], "List do Rzymian 10:9", "Wyznanie Wiary", "Jeśli ustami wyznasz Pana Jezusa, będziesz zbawiony."),
    ("PSA", 91, [1, 2], "Psalm 91:1-2", "Cień Wszechmocnego", "Kto mieszka pod osłoną Najwyższego, w cieniu Wszechmocnego spoczywa."),
    ("REV", 3, [20], "Objawienie Jana 3:20", "Pukanie do Serca", "Oto stoję u drzwi i pukam — mówi Pan."),
    ("MAT", 28, [19, 20], "Ewangelia Mateusza 28:19-20", "Wielki Nakaz Misyjny", "Idźcie i czyńcie uczniami wszystkie narody."),
    ("2CO", 5, [17], "2 List do Koryntian 5:17", "Nowe Stworzenie", "Jeśli ktoś jest w Chrystusie, jest nowym stworzeniem."),
    ("PSA", 37, [4], "Psalm 37:4", "Rozkosz w Panu", "Rozkoszuj się Panem, a On spełni pragnienia Twojego serca."),
    ("LAM", 3, [22, 23], "Lamentacje 3:22-23", "Nowe Miłosierdzie", "Miłosierdzie Boże nie ustaje, odnawia się każdego poranka."),
    ("JHN", 1, [1], "Ewangelia Jana 1:1", "Przedwieczne Słowo", "Na początku było Słowo, a Słowo było u Boga."),
    ("JHN", 1, [12], "Ewangelia Jana 1:12", "Dzieci Boże", "Tym, którzy Go przyjęli, dał moc stać się dziećmi Bożymi."),

    # --- MIESIĄC 2: POKÓJ, WALKA DUCHOWA I NADZIEJA ---
    ("EPH", 6, [10, 11], "List do Efezjan 6:10-11", "Zbroja Boża", "Bądźcie mocni w Panu i przywdziejcie całą zbroję Bożą."),
    ("PSA", 27, [1], "Psalm 27:1", "Pan moim Światłem", "Pan jest moim światłem i zbawieniem — kogo mam się lękać?"),
    ("JHN", 16, [33], "Ewangelia Jana 16:33", "Zwycięstwo nad Światem", "Na świecie będziecie mieć ucisk, ale ufajcie — Jam zwyciężył świat!"),
    ("ROM", 5, [1], "List do Rzymian 5:1", "Pokój z Bogiem", "Usprawiedliwieni z wiary mamy pokój z Bogiem przez Chrystusa."),
    ("ROM", 5, [8], "List do Rzymian 5:8", "Miłość do Grzeszników", "Chrystus umarł za nas, gdy byliśmy jeszcze grzesznikami."),
    ("PSA", 34, [8], "Psalm 34:8", "Skosztujcie Dobroci", "Skosztujcie i zobaczcie, jak dobry jest Pan!"),
    ("ISA", 41, [10], "Księga Izajasza 41:10", "Nie Bój Się", "Nie bój się, bo Ja jestem z tobą, nie lękaj się, bom Ja twoim Bogiem."),
    ("PHP", 4, [6, 7], "List do Filipian 4:6-7", "Pokój Przewyższający Rozum", "O nic się nie martwcie, lecz w modlitwie przedstawiajcie prośby Bogu."),
    ("COL", 3, [2], "List do Kolosan 3:2", "Myślcie o Tym, co w Górze", "Myślcie o tym, co w górze, nie o tym, co na ziemi."),
    ("HEB", 4, [12], "List do Hebrajczyków 4:12", "Żywe Słowo Boże", "Słowo Boże jest żywe, skuteczne i ostrzejsze niż miecz obosieczny."),
    ("JAS", 1, [2, 3], "List Jakuba 1:2-3", "Radość w Próbach", "Poczytujcie to sobie za wielką radość, gdy popadacie w różne próby."),
    ("PSA", 121, [1, 2], "Psalm 121:1-2", "Pomoc od Stwórcy", "Pomoc moja jest od Pana, który stworzył niebo i ziemię."),
    ("MAT", 5, [14, 16], "Ewangelia Mateusza 5:14", "Światłość Świata", "Wy jesteście światłością świata — niech świeci wasze światło!"),
    ("ROM", 6, [23], "List do Rzymian 6:23", "Zapłata za Grzech", "Zapłatą za grzech jest śmierć, lecz darem Boga jest życie wieczne."),
    ("GAL", 2, [20], "List do Galacjan 2:20", "Ukrzyżowany z Chrystusem", "Teraz już nie ja żyję, lecz żyje we mnie Chrystus."),
    ("PSA", 103, [1, 2], "Psalm 103:1-2", "Błogosław Duszo Moja", "Błogosław, duszo moja, Pana i nie zapominaj o Jego dobrodziejstwach."),
    ("PSA", 103, [12], "Psalm 103:12", "Oddalenie Win", "Jak daleko jest wschód od zachodu, tak oddalił od nas nasze występki."),
    ("PRO", 16, [3], "Księga Przysłów 16:3", "Powierz Swe Dzieła", "Powierz Panu swoje dzieła, a twoje zamysły będą utwierdzone."),
    ("ISA", 53, [5], "Księga Izajasza 53:5", "Jego Rany", "On był zraniony za nasze występki, a Jego ranami zostaliśmy uzdrowieni."),
    ("1TH", 5, [16, 17, 18], "1 List do Tesaloniczan 5:16-18", "Zawsze Radośni", "Zawsze się radujcie, nieustannie się módlcie, za wszystko dziękujcie."),
    ("2CO", 12, [9], "2 List do Koryntian 12:9", "Moc w Słabości", "Wystarczy ci moja łaska, moja moc bowiem doskonali się w słabości."),
    ("PSA", 139, [13, 14], "Psalm 139:13-14", "Cudownie Utkany", "Cudownie mnie stworzyłeś — dzieła Twoje są przedziwne."),
    ("PSA", 139, [23, 24], "Psalm 139:23-24", "Zbadaj Mnie Boże", "Zbadaj mnie, Boże, i poznaj moje serce."),
    ("ACT", 1, [8], "Dzieje Apostolskie 1:8", "Moc Ducha Świętego", "Otrzymacie moc Ducha Świętego i będziecie mi świadkami."),
    ("REV", 21, [4], "Objawienie Jana 21:4", "Koniec Łez i Śmierci", "I otrze Bóg wszelką łzę z ich oczu, i śmierci już nie będzie."),
    ("MAT", 7, [7], "Ewangelia Mateusza 7:7", "Proście, a Będzie Wam Dane", "Proście, a będzie wam dane; szukajcie, a znajdziecie; pukajcie, a wam otworzą."),
    ("DEU", 31, [6], "Księga Powtórzonego Prawa 31:6", "Nie Zostawi Cię", "Bądźcie mężni i odważni, bo Pan Bóg sam idzie z wami."),

    # --- MIESIĄC 3: MĄDROŚĆ, WIARA I NAŚLADOWANIE CHRYSTUSA ---
    ("JAS", 1, [5], "List Jakuba 1:5", "Prośba o Mądrość", "Jeśli komuś z was brakuje mądrości, niech prosi Boga."),
    ("MAT", 16, [24], "Ewangelia Mateusza 16:24", "Zaparcie się Siebie", "Jeśli kto chce pójść za mną, niech weźmie swój krzyż i mnie naśladuje."),
    ("PRO", 4, [23], "Księga Przysłów 4:23", "Strzeż Swego Serca", "Ponad wszystko strzeż swego serca, bo z niego tryskają źródła życia."),
    ("ROM", 1, [16], "List do Rzymian 1:16", "Moc Ewangelii", "Nie wstydzę się Ewangelii Chrystusa, jest ona bowiem mocą Bożą."),
    ("HEB", 12, [1, 2], "List do Hebrajczyków 12:1-2", "Patrząc na Jezusa", "Patrzmy na Jezusa, sprawcę i dokończyciela naszej wiary."),
    ("PSA", 19, [1], "Psalm 19:1", "Niebiosa Głoszą Chwałę", "Niebiosa głoszą chwałę Boga, a dzieło Jego rąk obwieszcza nieboskłon."),
    ("1JN", 1, [9], "1 List Jana 1:9", "Wierność w Przebaczeniu", "Jeśli wyznajemy nasze grzechy, Bóg jest wierny i sprawiedliwy, aby nam przebaczyć."),
    ("1JN", 4, [18], "1 List Jana 4:18", "Doskonała Miłość", "W miłości nie ma lęku, lecz doskonała miłość usuwa lęk."),
    ("JHN", 8, [12], "Ewangelia Jana 8:12", "Światłość Świata", "Ja jestem światłością świata. Kto idzie za mną, nie będzie chodził w ciemności."),
    ("JHN", 8, [31, 32], "Ewangelia Jana 8:31-32", "Prawda Was Wyzwoli", "Poznacie prawdę, a prawda was wyzwoli."),
    ("JHN", 10, [10], "Ewangelia Jana 10:10", "Życie w Obfitości", "Ja przyszedłem, aby miały życie i aby miały je w obfitości."),
    ("JHN", 10, [27, 28], "Ewangelia Jana 10:27-28", "Moje Owce", "Moje owce słuchają mego głosu i nikt nie wyrwie ich z mojej ręki."),
    ("JHN", 11, [25], "Ewangelia Jana 11:25", "Zmartwychwstanie i Życie", "Ja jestem zmartwychwstaniem i życiem. Kto we mnie wierzy, choćby umarł, będzie żył."),
    ("JHN", 15, [5], "Ewangelia Jana 15:5", "Krzew Winny", "Ja jestem krzewem winnym, a wy latoroślami. Beze mnie nic nie możecie uczynić."),
    ("ACT", 4, [12], "Dzieje Apostolskie 4:12", "Jedno Imię pod Niebem", "Nie ma w nikim innym zbawienia, gdyż nie dano ludziom innego imienia."),
    ("ACT", 16, [31], "Dzieje Apostolskie 16:31", "Uwierz w Pana Jezusa", "Uwierz w Pana Jezusa Chrystusa, a będziesz zbawiony ty i twój dom."),
    ("ROM", 3, [23, 24], "List do Rzymian 3:23-24", "Darmo Usprawiedliwieni", "Wszyscy zgrzeszyli, a darmo zostają usprawiedliwieni z Jego łaski."),
    ("ROM", 8, [1], "List do Rzymian 8:1", "Brak Potępienia", "Teraz więc nie ma żadnego potępienia dla tych, którzy są w Chrystusie Jezusie."),
    ("ROM", 8, [31], "List do Rzymian 8:31", "Jeśli Bóg z Nami", "Jeśli Bóg jest za nami, któż może być przeciwko nam?"),
    ("1CO", 6, [19, 20], "1 List do Koryntian 6:19-20", "Świątynia Ducha", "Wasze ciało jest świątynią Ducha Świętego. Zostaliście kupieni za wielką cenę."),
    ("1CO", 10, [13], "1 List do Koryntian 10:13", "Wierność w Pokusie", "Wierny jest Bóg, który nie pozwoli was kusić ponad wasze siły."),
    ("2CO", 4, [16, 17], "2 List do Koryntian 4:16-17", "Wewnętrzne Odnowienie", "Choć nasz zewnętrzny człowiek niszczeje, to wewnętrzny odnawia się z dnia na dzień."),
    ("2CO", 5, [21], "2 List do Koryntian 5:21", "Nasza Sprawiedliwość", "Tego, który nie znał grzechu, za nas uczynił grzechem, abyśmy w Nim stali się sprawiedliwością Bożą."),
    ("GAL", 6, [9], "List do Galacjan 6:9", "Nie Ustawajmy w Dobru", "Nie zniechęcajmy się w czynieniu dobra, bo w swoim czasie zbierzemy plon."),
    ("EPH", 1, [7], "List do Efezjan 1:7", "Odkupienie przez Krew", "W Nim mamy odkupienie przez Jego krew, przebaczenie grzechów."),
    ("EPH", 4, [32], "List do Efezjan 4:32", "Bądźcie Przebaczający", "Bądźcie dla siebie nawzajem życzliwi, przebaczając sobie, jak i Bóg przebaczył wam."),
    ("PHP", 1, [6], "List do Filipian 1:6", "Dokończenie Dobrego Dzieła", "Ten, który rozpoczął w was dobre dzieło, dokończy je aż do dnia Jezusa Chrystusa."),
    ("PHP", 2, [3, 4], "List do Filipian 2:3-4", "Pokora w Relacjach", "W pokorze uważajcie jedni drugich za wyższych od siebie."),
    ("PHP", 4, [19], "List do Filipian 4:19", "Zaspokojenie Potrzeb", "Mój Bóg zaspokoi każdą waszą potrzebę według swego bogactwa w chwale."),
    ("COL", 3, [12, 13], "List do Kolosan 3:12-13", "Przyobleczcie Miłość", "Przyobleczcie serdeczne miłosierdzie, dobroć, pokorę, cierpliwość."),
    ("COL", 3, [23], "List do Kolosan 3:23", "Jak dla Pana", "Cokolwiek czynicie, z serca czyńcie, jak dla Pana, a nie dla ludzi."),

    # --- MIESIĄC 4: WIERNOŚĆ, SŁOWO I PRAWO BOŻE ---
    ("EXO", 20, [8], "Księga Wyjścia 20:8", "Pamiątka Szabatu", "Pamiętaj o dniu szabatu, aby go święcić."),
    ("EXO", 20, [12], "Księga Wyjścia 20:12", "Szacunek dla Rodziców", "Czcij swego ojca i swoją matkę, aby przedłużyły się twoje dni."),
    ("DEU", 6, [5], "Księga Powtórzonego Prawa 6:5", "Największe Przykazanie", "Będziesz miłował Pana, swego Boga, całym swym sercem."),
    ("PSA", 1, [1, 2], "Psalm 1:1-2", "Błogosławiony Mąż", "Błogosławiony człowiek, który ma upodobanie w prawie Pana."),
    ("PSA", 16, [11], "Psalm 16:11", "Pełnia Radości", "Ukażesz mi drogę życia; pełnia radości jest w Twojej obecności."),
    ("PSA", 25, [4, 5], "Psalm 25:4-5", "Naucz Mnie Dróg", "Daj mi poznać Twoje drogi, Panie, naucz mnie swoich ścieżek."),
    ("PSA", 32, [1], "Psalm 32:1", "Radość z Przebaczenia", "Błogosławiony ten, komu odpuszczono występek, a grzech zakryto."),
    ("PSA", 51, [10], "Psalm 51:10", "Serce Czyste", "Stwórz we mnie serce czyste, o Boże, i odnów w moim wnętrzu ducha prawego."),
    ("PSA", 62, [1, 2], "Psalm 62:1-2", "Tylko w Bogu Pokój", "Tylko w Bogu moja dusza znajduje pokój, od Niego jest moje zbawienie."),
    ("PSA", 84, [10], "Psalm 84:10", "Dzień w Przedsionkach", "Lepszy jest jeden dzień w Twoich przedsionkach niż tysiąc gdzie indziej."),
    ("PSA", 90, [12], "Psalm 90:12", "Naucz Liczyć Dni", "Naucz nas liczyć dni nasze, abyśmy zdobyli mądre serce."),
    ("PSA", 100, [1, 2, 3], "Psalm 100:1-3", "Radość Wielbienia", "Wykrzykuj Panu z radości, cała ziemio! Służcie Panu z weselem."),
    ("PSA", 107, [1], "Psalm 107:1", "Wysławiajcie Pana", "Wysławiajcie Pana, bo jest dobry, bo na wieki trwa Jego miłosierdzie."),
    ("PSA", 118, [24], "Psalm 118:24", "Dzień Uczyniony przez Pana", "Oto dzień, który Pan uczynił; radujmy się i weselmy w nim!"),
    ("PSA", 127, [1], "Psalm 127:1", "Jeśli Pan Nie Zbuduje", "Jeśli Pan domu nie zbuduje, próżno trudzą się ci, którzy go budują."),
    ("PSA", 130, [3, 4], "Psalm 130:3-4", "U Ciebie jest Przebaczenie", "Jeśli będziesz zważał na nieprawości, Panie, któż się ostoi? Lecz u Ciebie jest przebaczenie."),
    ("PSA", 145, [18], "Psalm 145:18", "Pan Bliski Wzywającym", "Pan jest bliski wszystkim, którzy Go wzywają w prawdzie."),
    ("PRO", 1, [7], "Księga Przysłów 1:7", "Bojaźń Pana", "Bojaźń Pana jest początkiem poznania; głupcy gardzą mądrością."),
    ("PRO", 11, [25], "Księga Przysłów 11:25", "Szczodra Dusza", "Dusza szczodra będzie nasycona, a kto innych orzeźwia, sam będzie orzeźwiony."),
    ("PRO", 15, [1], "Księga Przysłów 15:1", "Łagodna Odpowiedź", "Łagodna odpowiedź uśmierza gniew, lecz przykre słowo wzbudza złość."),
    ("PRO", 18, [10], "Księga Przysłów 18:10", "Imię Pana Wieżą Obronną", "Imię Pana jest wieżą obronną; sprawiedliwy ucieka do niej i jest bezpieczny."),
    ("PRO", 22, [1], "Księga Przysłów 22:1", "Dobre Imię", "Więcej warte jest dobre imię niż wielkie bogactwo."),
    ("PRO", 27, [17], "Księga Przysłów 27:17", "Żelazo Ostrzy Żelazo", "Żelazo ostrzy się żelazem, tak człowiek zaostrza oblicze swego przyjaciela."),
    ("ECC", 3, [1], "Księga Kaznodziei 3:1", "Czas na Wszystko", "Wszystko ma swój czas i jest wyznaczona godzina na każdą sprawę pod niebem."),
    ("ECC", 12, [13], "Księga Kaznodziei 12:13", "Koniec Wszystkiego", "Bój się Boga i przestrzegaj Jego przykazań, bo to jest cały obowiązek człowieka."),
    ("ISA", 9, [6], "Księga Izajasza 9:6", "Dziecię Nam Się Narodziło", "Albowiem Dziecię narodziło się nam, Syn został nam dany; nazwany będzie Księciem Pokoju."),
    ("ISA", 26, [3], "Księga Izajasza 26:3", "Niezachwiany Pokój", "Człowieka o stałym umyśle zachowasz w doskonałym pokoju, bo Tobie zaufał."),
    ("ISA", 43, [1, 2], "Księga Izajasza 43:1-2", "Odkupiłem Cię", "Nie bój się, bo cię odkupiłem; wezwałem cię po imieniu, moim jesteś."),
    ("ISA", 55, [8, 9], "Księga Izajasza 55:8-9", "Wyższe Myśli Boga", "Moje myśli nie są myślami waszymi, ani wasze drogi moimi drogami."),
    ("JER", 17, [7, 8], "Księga Jeremiasza 17:7-8", "Błogosławiony Ufający", "Błogosławiony człowiek, który ufa Panu; będzie jak drzewo zasadzone nad wodą."),

    # --- MIESIĄC 5: ZWYCIĘSTWO KRZYŻA I ŚWIĘTOŚĆ ŻYCIA ---
    ("MAT", 5, [3, 4], "Ewangelia Mateusza 5:3-4", "Błogosławieni Ubodzy w Duchu", "Błogosławieni ubodzy w duchu, albowiem do nich należy królestwo niebieskie."),
    ("MAT", 5, [8], "Ewangelia Mateusza 5:8", "Czyste Serce", "Błogosławieni czystego serca, albowiem oni będą oglądać Boga."),
    ("MAT", 5, [9], "Ewangelia Mateusza 5:9", "Czyniący Pokój", "Błogosławieni czyniący pokój, albowiem oni będą nazwani synami Bożymi."),
    ("MAT", 6, [9, 10], "Ewangelia Mateusza 6:9-10", "Modlitwa Pańska", "Ojcze nasz, który jesteś w niebie, święć się Twoje imię."),
    ("MAT", 6, [14, 15], "Ewangelia Mateusza 6:14-15", "Przebaczenie Bliźnim", "Jeśli przebaczycie ludziom ich przewinienia, i wam przebaczy Ojciec wasz niebieski."),
    ("MAT", 6, [19, 20, 21], "Ewangelia Mateusza 6:19-21", "Skarb w Niebie", "Gdzie jest twój skarb, tam będzie i twoje serce."),
    ("MAT", 7, [13, 14], "Ewangelia Mateusza 7:13-14", "Wąska Brama", "Wchodźcie przez ciasną bramę; wąska jest droga, która prowadzi do życia."),
    ("MAT", 7, [24, 25], "Ewangelia Mateusza 7:24-25", "Dom na Skale", "Każdy, kto słucha tych moich słów i wypełnia je, będzie podobny do człowieka mądrego."),
    ("MAT", 18, [20], "Ewangelia Mateusza 18:20", "Dwaj lub Trzej", "Gdzie dwaj lub trzej zebrani są w moje imię, tam jestem pośród nich."),
    ("MAT", 22, [37, 38, 39], "Ewangelia Mateusza 22:37-39", "Przykazanie Miłości", "Będziesz miłował Pana Boga swego... a bliźniego swego jak siebie samego."),
    ("MRK", 8, [36], "Ewangelia Marka 8:36", "Cena Duszy", "Cóż pomoże człowiekowi, choćby cały świat pozyskał, a na swojej duszy szkodę poniósł?"),
    ("MRK", 9, [23], "Ewangelia Marka 9:23", "Wszystko jest Możliwe", "Wszystko jest możliwe dla tego, który wierzy."),
    ("MRK", 10, [45], "Ewangelia Marka 10:45", "Syn Człowieczy Przyszedł Służyć", "Syn Człowieczy nie przyszedł, aby Mu służono, lecz aby służyć i dać swoje życie."),
    ("MRK", 11, [24], "Ewangelia Marka 11:24", "Wiara w Modlitwie", "Wszystko, o co modląc się prosicie, wierzcie, że otrzymacie, a stanie się wam."),
    ("LUK", 1, [37], "Ewangelia Łukasza 1:37", "U Boga Nic Nie jest Niemożliwe", "U Boga bowiem żadna rzecz nie jest niemożliwa."),
    ("LUK", 6, [31], "Ewangelia Łukasza 6:31", "Złota Zasada", "Jak chcecie, aby ludzie wam czynili, tak i wy im czyńcie."),
    ("LUK", 6, [36], "Ewangelia Łukasza 6:36", "Bądźcie Miłosierni", "Bądźcie miłosierni, jak i wasz Ojciec jest miłosierny."),
    ("LUK", 9, [23], "Ewangelia Łukasza 9:23", "Codzienny Krzyż", "Niech co dzień bierze swój krzyż i idzie za mną."),
    ("LUK", 12, [32], "Ewangelia Łukasza 12:32", "Mała Trzódka", "Nie bój się, mała trzódko, gdyż upodobało się Ojcu waszemu dać wam królestwo."),
    ("LUK", 15, [7], "Ewangelia Łukasza 15:7", "Radość z Jednego Grzesznika", "Większa będzie radość w niebie z jednego grzesznika, który się opamięta."),
    ("LUK", 19, [10], "Ewangelia Łukasza 19:10", "Szukać i Zbawić Zagubionych", "Syn Człowieczy przyszedł szukać i zbawić to, co zginęło."),
    ("JHN", 4, [24], "Ewangelia Jana 4:24", "W Duchu i w Prawdzie", "Bóg jest duchem, a ci, którzy Go czczą, powinni Go czcić w duchu i w prawdzie."),
    ("JHN", 5, [24], "Ewangelia Jana 5:24", "Przejście ze Śmierci do Życia", "Kto słucha mego słowa i wierzy Temu, który mnie posłał, ma życie wieczne."),
    ("JHN", 6, [35], "Ewangelia Jana 6:35", "Chleb Życia", "Ja jestem chlebem życia. Kto przychodzi do mnie, nie będzie łaknął."),
    ("JHN", 12, [46], "Ewangelia Jana 12:46", "Światłość Przyszła na Świat", "Ja przyszedłem jako światłość na świat, aby nikt, kto wierzy we mnie, nie pozostał w ciemności."),
    ("JHN", 13, [34, 35], "Ewangelia Jana 13:34-35", "Nowe Przykazanie", "Abyście się wzajemnie miłowali. Po tym wszyscy poznają, że jesteście moimi uczniami."),
    ("JHN", 14, [1, 2], "Ewangelia Jana 14:1-2", "Niech Się Nie Trwoży Serce Wasze", "Niech się nie trwoży wasze serce; wierzycie w Boga, wierzcie i we mnie."),
    ("JHN", 14, [15], "Ewangelia Jana 14:15", "Miłość i Posłuszeństwo", "Jeśli mnie miłujecie, zachowujcie moje przykazania."),
    ("JHN", 14, [27], "Ewangelia Jana 14:27", "Pokój Mój Wam Daję", "Pokój zostawiam wam, mój pokój wam daję. Nie daję wam tak, jak daje świat."),
    ("JHN", 15, [13], "Ewangelia Jana 15:13", "Największa Miłość", "Nikt nie ma większej miłości od tej, gdy ktoś oddaje swoje życie za przyjaciół."),
    ("JHN", 17, [3], "Ewangelia Jana 17:3", "To jest Życie Wieczne", "A to jest życie wieczne, aby poznali Ciebie, jedynego prawdziwego Boga, i Tego, którego posłałeś."),

    # --- MIESIĄC 6: DUCH ŚWIĘTY, KOŚCIÓŁ I JEDNOŚĆ ---
    ("ACT", 2, [38], "Dzieje Apostolskie 2:38", "Upamiętajcie Się", "Upamiętajcie się i niech każdy z was da się ochrzcić w imię Jezusa Chrystusa."),
    ("ACT", 17, [28], "Dzieje Apostolskie 17:28", "W Nim Żyjemy", "W Nim bowiem żyjemy, poruszamy się i jesteśmy."),
    ("ROM", 1, [20], "List do Rzymian 1:20", "Stworzenie Świadczy o Bogu", "Niewidzialne przymioty Boga stają się widzialne przez dzieła stworzenia."),
    ("ROM", 4, [3], "List do Rzymian 4:3", "Wiara Abrahama", "Uwierzył Abraham Bogu i zostało mu to policzone za sprawiedliwość."),
    ("ROM", 8, [14], "List do Rzymian 8:14", "Prowadzeni przez Ducha", "Wszyscy ci, którzy są prowadzeni przez Ducha Bożego, są synami Bożymi."),
    ("ROM", 8, [18], "List do Rzymian 8:18", "Przyszła Chwała", "Cierpienia teraźniejszego czasu nic nie znaczą w porównaniu z przyszłą chwałą."),
    ("ROM", 8, [26], "List do Rzymian 8:26", "Duch Wspiera Nasze Słabości", "Duch przyczynia się za nami w niewysłowionych westchnieniach."),
    ("ROM", 8, [32], "List do Rzymian 8:32", "Darował Wszystko", "On, który nawet własnego Syna nie oszczędził, jakże nie miałby darować nam wszystkiego?"),
    ("ROM", 10, [13], "List do Rzymian 10:13", "Kto Wzywa Imienia Pana", "Każdy, kto wezwie imienia Pana, będzie zbawiony."),
    ("ROM", 10, [17], "List do Rzymian 10:17", "Wiara ze Słuchania", "Wiara jest ze słuchania, a słuchanie przez słowo Boże."),
    ("ROM", 11, [33], "List do Rzymian 11:33", "Głębokość Bogactwa Boga", "O głębokości bogactwa, mądrości i wiedzy Boga!"),
    ("ROM", 11, [36], "List do Rzymian 11:36", "Z Niego i przez Niego", "Z Niego bowiem, przez Niego i dla Niego jest wszystko. Jemu chwała na wieki."),
    ("ROM", 12, [1], "List do Rzymian 12:1", "Żywa Ofiara", "Oddajcie swoje ciała na ofiarę żywą, świętą, miłą Bogu."),
    ("ROM", 12, [9], "List do Rzymian 12:9", "Miłość Nieobłudna", "Miłość niech będzie nieobłudna. Miejcie wstręt do złego, trzymajcie się dobrego."),
    ("ROM", 12, [12], "List do Rzymian 12:12", "Trwajcie w Modlitwie", "W nadziei się radujcie, w ucisku bądźcie cierpliwi, w modlitwie wytrwali."),
    ("ROM", 12, [18], "List do Rzymian 12:18", "Pokój ze Wszystkimi", "Jeśli to możliwe, ze swej strony ze wszystkimi ludźmi pokój miejcie."),
    ("ROM", 12, [21], "List do Rzymian 12:21", "Zło Dobrem Zwyciężaj", "Nie daj się zwyciężyć złu, ale zło dobrem zwyciężaj."),
    ("ROM", 14, [8], "List do Rzymian 14:8", "Pańscy Jesteśmy", "Jeśli żyjemy, dla Pana żyjemy; jeśli umieramy, dla Pana umieramy."),
    ("ROM", 15, [4], "List do Rzymian 15:4", "Pismo dla Naszej Nauki", "Wszystko, co niegdyś napisano, dla naszej nauki napisano, abyśmy mieli nadzieję."),
    ("ROM", 15, [13], "List do Rzymian 15:13", "Bóg Nadziei", "A Bóg nadziei niech was napełni wszelką radością i pokojem w wierze."),
    ("1CO", 1, [18], "1 List do Koryntian 1:18", "Mowa o Krzyżu", "Mowa o krzyżu jest głupstwem dla tych, którzy giną, lecz dla nas jest mocą Bożą."),
    ("1CO", 2, [9], "1 List do Koryntian 2:9", "Czego Oko Nie Widziało", "Czego oko nie widziało i ucho nie słyszało, to przygotował Bóg tym, którzy Go miłują."),
    ("1CO", 3, [16], "1 List do Koryntian 3:16", "Świątynia Boga", "Czyż nie wiecie, że jesteście świątynią Boga i że Duch Boży w was mieszka?"),
    ("1CO", 15, [55, 57], "1 List do Koryntian 15:55-57", "Zwycięstwo nad Śmiercią", "Gdzież jest, o śmierci, twoje żądło? Bogu niech będą dzięki za zwycięstwo!"),
    ("1CO", 15, [58], "1 List do Koryntian 15:58", "Trwajcie Niewzruszenie", "Trwajcie niewzruszenie w dziele Pańskim, wiedząc, że wasz trud nie jest daremny."),
    ("1CO", 16, [13, 14], "1 List do Koryntian 16:13-14", "Czuwajcie i Trwajcie", "Czuwajcie, trwajcie w wierze, bądźcie mężni, bądźcie mocni. Wszystko niech dzieje się w miłości."),
    ("2CO", 1, [3, 4], "2 List do Koryntian 1:3-4", "Bóg Wszelkiej Pociechy", "Bóg wszelkiej pociechy, który nas pociesza w każdym naszym ucisku."),
    ("2CO", 3, [17], "2 List do Koryntian 3:17", "Gdzie Duch Pański, Tam Wolność", "Pan zaś jest Duchem, a gdzie jest Duch Pański, tam jest wolność."),
    ("2CO", 4, [18], "2 List do Koryntian 4:18", "Patrząc na Niewidzialne", "Nie patrzymy na to, co widzialne, lecz na to, co niewidzialne; to co niewidzialne, trwa wiecznie."),
    ("2CO", 5, [7], "2 List do Koryntian 5:7", "Chodzimy przez Wiarę", "Wiarą bowiem postępujemy, a nie widzeniem."),

    # --- MIESIĄC 7: WOLNOŚĆ W CHRYSTUSIE I DUCHOWY WZROST ---
    ("GAL", 5, [1], "List do Galacjan 5:1", "Trwajcie w Wolności", "Trwajcie w wolności, którą nas Chrystus wyzwolił, i nie poddawajcie się na nowo pod jarzmo niewoli."),
    ("GAL", 5, [13], "List do Galacjan 5:13", "Służcie Sobie w Miłości", "Przez miłość służcie jedni drugim."),
    ("GAL", 6, [2], "List do Galacjan 6:2", "Jedni Drugich Ciężary Noście", "Jedni drugich brzemiona noście, a tak wypełnicie prawo Chrystusa."),
    ("GAL", 6, [7], "List do Galacjan 6:7", "Co Człowiek Sieje, To Będzie Żąć", "Nie łudźcie się, Bóg nie da się z siebie naśmiewać; co człowiek posieje, to i zbierze."),
    ("GAL", 6, [14], "List do Galacjan 6:14", "Chluba z Krzyża", "Nie daj Boże, bym się miał chlubić z czego innego, jak tylko z krzyża Pana naszego Jezusa Chrystusa."),
    ("EPH", 1, [3], "List do Efezjan 1:3", "Wszelkie Błogosławieństwo Duchowe", "Błogosławiony niech będzie Bóg, który napełnił nas wszelkim błogosławieństwem duchowym."),
    ("EPH", 2, [10], "List do Efezjan 2:10", "Dzieło Boże do Dobrych Uczynków", "Jesteśmy Jego dziełem, stworzeni w Chrystusie Jezusie do dobrych uczynków."),
    ("EPH", 3, [16, 17], "List do Efezjan 3:16-17", "Zakorzenieni w Miłości", "Aby Chrystus przez wiarę zamieszkał w waszych sercach, a wy abyście byli zakorzenieni w miłości."),
    ("EPH", 3, [20, 21], "List do Efezjan 3:20-21", "Ponad Wszystko", "Temu, który mocą działającą w nas może uczynić nieskończenie więcej, niż prosimy."),
    ("EPH", 4, [1, 2], "List do Efezjan 4:1-2", "Żyjcie Godnie Powołania", "Postępujcie godnie powołania, z całą pokorą i łagodnością, z cierpliwością znosząc jedni drugich."),
    ("EPH", 4, [26], "List do Efezjan 4:26", "Gniewajcie się, a Nie Grzeszcie", "Gniewajcie się, lecz nie grzeszcie; niech słońce nie zachodzi nad waszym gniewem."),
    ("EPH", 4, [29], "List do Efezjan 4:29", "Budujące Słowa", "Żadne plugawe słowo niech nie wychodzi z waszych ust, lecz tylko takie, które służy zbudowaniu."),
    ("EPH", 5, [1, 2], "List do Efezjan 5:1-2", "Naśladowcy Boga", "Bądźcie naśladowcami Boga jako umiłowane dzieci i postępujcie w miłości."),
    ("EPH", 5, [8], "List do Efezjan 5:8", "Dzieci Światłości", "Byliście bowiem niegdyś ciemnością, ale teraz jesteście światłością w Panu; postępujcie jak dzieci światłości."),
    ("EPH", 5, [15, 16], "List do Efezjan 5:15-16", "Wykorzystujcie Czas", "Uważajcie pilnie, jak postępujecie, wyzyskując czas, bo dni są złe."),
    ("EPH", 5, [25], "List do Efezjan 5:25", "Miłość w Małżeństwie", "Mężowie, miłujcie swoje żony, jak i Chrystus umiłował Kościół i wydał za niego samego siebie."),
    ("PHP", 1, [21], "List do Filipian 1:21", "Dla Mnie Życiem Chrystus", "Dla mnie bowiem życiem jest Chrystus, a umrzeć to zysk."),
    ("PHP", 1, [27], "List do Filipian 1:27", "Obywatele Nieba", "Tylko sprawujcie się w sposób godny Ewangelii Chrystusa."),
    ("PHP", 2, [5], "List do Filipian 2:5", "Umysł Chrystusa", "Niech będzie w was takie nastawienie umysłu, jakie było w Chrystusie Jezusie."),
    ("PHP", 2, [9, 10, 11], "List do Filipian 2:9-11", "Imię Ponad Wszelkie Imię", "Imię ponad wszelkie imię, aby na imię Jezusa zginało się każde kolano."),
    ("PHP", 3, [7, 8], "List do Filipian 3:7-8", "Wszystko Uznaję za Stratę", "Wszystko uznaję za stratę ze względu na najwyższą wartość poznania Chrystusa Jezusa."),
    ("PHP", 3, [13, 14], "List do Filipian 3:13-14", "Biegnę do Celu", "Zapominając o tym, co za mną, a sięgając po to, co przede mną, biegnę do mety."),
    ("PHP", 3, [20], "List do Filipian 3:20", "Nasza Ojczyzna w Niebie", "Nasza ojczyzna jest w niebie, skąd też oczekujemy Zbawiciela, Pana Jezusa Chrystusa."),
    ("PHP", 4, [4], "List do Filipian 4:4", "Radujcie się w Panu", "Radujcie się w Panu zawsze; powtarzam: radujcie się!"),
    ("PHP", 4, [8], "List do Filipian 4:8", "O Tym Rozmyślajcie", "Wszystko, co prawdziwe, czyste, miłe — o tym rozmyślajcie."),
    ("PHP", 4, [11, 12], "List do Filipian 4:11-12", "Nauczyłem się Poprzestawać", "Nauczyłem się poprzestawać na tym, co mam. Wszystko mogę w Tym, który mnie umacnia."),
    ("COL", 1, [15, 16], "List do Kolosan 1:15-16", "Obraz Niewidzialnego Boga", "On jest obrazem Boga niewidzialnego, pierworodnym wszelkiego stworzenia."),
    ("COL", 1, [27], "List do Kolosan 1:27", "Chrystus w Was — Nadzieja Chwały", "Tajemnica, którą jest Chrystus w was, nadzieja chwały."),
    ("COL", 2, [6, 7], "List do Kolosan 2:6-7", "Zakorzenieni w Nim", "Jak przyjęliście Chrystusa Jezusa, Pana, tak w Nim postępujcie, zakorzenieni i budowani na Nim."),
    ("COL", 3, [16], "List do Kolosan 3:16", "Słowo Chrystusa w Was", "Słowo Chrystusa niech mieszka w was obficie z wszelką mądrością."),
    ("COL", 4, [2], "List do Kolosan 4:2", "Trwajcie w Modlitwie", "W modlitwie trwajcie, czuwając na niej z dziękczynieniem."),

    # --- MIESIĄC 8: BOŻA WIERNOŚĆ, MODLITWA I ŚWIADECTWO ---
    ("1TH", 5, [23, 24], "1 List do Tesaloniczan 5:23-24", "Bóg Pokoju Was Uświęci", "Wierny jest Ten, który was powołuje; On też tego dokona."),
    ("2TH", 3, [3], "2 List do Tesaloniczan 3:3", "Wierny jest Pan", "Wierny jest Pan, który was utwierdzi i ustrzeże od złego."),
    ("1TI", 1, [15], "1 List do Tymoteusza 1:15", "Przyszedł Zbawić Grzeszników", "Chrystus Jezus przyszedł na świat, aby zbawić grzeszników, z których ja jestem pierwszy."),
    ("1TI", 2, [5], "1 List do Tymoteusza 2:5", "Jeden Pośrednik", "Jeden jest Bóg, jeden też pośrednik między Bogiem a ludźmi, człowiek Chrystus Jezus."),
    ("1TI", 4, [12], "1 List do Tymoteusza 4:12", "Wzór dla Wierzących", "Bądź wzorem dla wierzących w mowie, w postępowaniu, w miłości, w duchu, w wierze, w czystości."),
    ("1TI", 6, [6], "1 List do Tymoteusza 6:6", "Pobożność z Poprzestawaniem", "Wielkim zaś zyskiem jest pobożność wraz z poprzestawaniem na tym, co się ma."),
    ("1TI", 6, [12], "1 List do Tymoteusza 6:12", "Bojuj Dobry Bój Wiary", "Bojuj w dobrym boju wiary, uchwyć się życia wiecznego."),
    ("2TI", 2, [15], "2 List do Tymoteusza 2:15", "Robotnik Nienaganny", "Staraj się, abyś stanął przed Bogiem jako wypróbowany pracownik, prawidłowo wykładający słowo prawdy."),
    ("2TI", 3, [16, 17], "2 List do Tymoteusza 3:16-17", "Całe Pismo Natchnione", "Całe Pismo jest przez Boga natchnione i pożyteczne do nauki, do strofowania, do poprawy."),
    ("2TI", 4, [7, 8], "2 List do Tymoteusza 4:7-8", "Bieg Ukończyłem", "Dobry bój bojowałem, bieg ukończyłem, wiarę zachowałem. Odłożono dla mnie wieniec sprawiedliwości."),
    ("TIT", 2, [11, 12], "List do Tytusa 2:11-12", "Łaska Zbawienna dla Wszystkich", "Objawiła się bowiem łaska Boża, niosąca zbawienie wszystkim ludziom."),
    ("TIT", 3, [5], "List do Tytusa 3:5", "Nie z Uczynków Sprawiedliwości", "Zbawił nas nie z powodu uczynków sprawiedliwości, lecz według swego miłosierdzia."),
    ("HEB", 2, [18], "List do Hebrajczyków 2:18", "Może Pomóc Kuszonym", "Przez to bowiem, co sam wycierpiał, będąc kuszony, może dopomóc tym, którzy są kuszeni."),
    ("HEB", 4, [16], "List do Hebrajczyków 4:16", "Tron Łaski", "Przybliżmy się z ufnością do tronu łaski, abyśmy dostąpili miłosierdzia i znaleźli łaskę ku pomocy."),
    ("HEB", 7, [25], "List do Hebrajczyków 7:25", "Może Zbawić na Zawsze", "Może na zawsze zbawić tych, którzy przez Niego przychodzą do Boga, bo zawsze żyje, aby się wstawiać za nimi."),
    ("HEB", 10, [23], "List do Hebrajczyków 10:23", "Trzymajmy Wyznanie Nadziei", "Trzymajmy niewzruszenie wyznanie naszej nadziei, bo wierny jest Ten, który obiecał."),
    ("HEB", 10, [24, 25], "List do Hebrajczyków 10:24-25", "Zachęcajmy Się Nawzajem", "Troszczmy się o siebie wzajemnie, nie opuszczając wspólnych zebrań."),
    ("HEB", 11, [6], "List do Hebrajczyków 11:6", "Bez Wiary Nie Można Się Podobać", "Bez wiary zaś nie można podobać się Bogu; kto przystępuje do Boga, musi wierzyć, że On jest."),
    ("HEB", 13, [5], "List do Hebrajczyków 13:5", "Nie Opuszczę Cię", "Nie porzucę cię ani cię nie opuszczę."),
    ("HEB", 13, [8], "List do Hebrajczyków 13:8", "Jezus Ten Sam", "Jezus Chrystus wczoraj i dziś, ten sam i na wieki."),
    ("HEB", 13, [15], "List do Hebrajczyków 13:15", "Ofiara Pochwalna", "Przez Niego więc nieustannie składajmy Bogu ofiarę chwały, to jest owoc warg wyznających Jego imię."),
    ("JAS", 1, [12], "List Jakuba 1:12", "Błogosławiony Mąż Wytrwały", "Błogosławiony człowiek, który znosi próbę, bo gdy zostanie wypróbowany, otrzyma koronę życia."),
    ("JAS", 1, [17], "List Jakuba 1:17", "Wszelki Dobry Dar", "Wszelki dar dobry i wszelki dar doskonały zstępuje z góry od Ojca świateł."),
    ("JAS", 1, [19, 20], "List Jakuba 1:19-20", "Prędki do Słuchania", "Niech każdy człowiek będzie skory do słuchania, nieskory do mówienia i nieskory do gniewu."),
    ("JAS", 1, [22], "List Jakuba 1:22", "Wykonawcy Słowa", "Bądźcie wykonawcami słowa, a nie tylko słuchaczami, oszukującymi samych siebie."),
    ("JAS", 4, [7, 8], "List Jakuba 4:7-8", "Poddajcie się Bogu", "Poddajcie się Bogu, przeciwstawcie się diabłu, a ucieknie od was. Zbliżcie się do Boga, a On zbliży się do was."),
    ("JAS", 4, [10], "List Jakuba 4:10", "Uniżcie Się", "Uniżcie się przed Panem, a On was wywyższy."),
    ("JAS", 5, [16], "List Jakuba 5:16", "Moc Modlitwy Sprawiedliwego", "Wiele może usilna modlitwa sprawiedliwego."),
    ("1PE", 1, [3], "1 List Piotra 1:3", "Żywa Nadzieja", "Przez zmartwychwstanie Jezusa Chrystusa odrodził nas ku nadziei żywej."),
    ("1PE", 1, [24, 25], "1 List Piotra 1:24-25", "Słowo Pana Trwa na Wieki", "Trawa usycha, a jej kwiat opada, lecz słowo Pana trwa na wieki."),
    ("1PE", 2, [9], "1 List Piotra 2:9", "Królewskie Kapłaństwo", "Wy zaś jesteście rodem wybranym, królewskim kapłaństwem, narodem świętym."),

    # --- MIESIĄC 9: CZUJNOŚĆ, OBIETNICE I POWRÓT PANA ---
    ("1PE", 2, [24], "1 List Piotra 2:24", "Jego Rany Uleczyły Nas", "On sam nasze grzechy poniósł w swoim ciele na drzewo; Jego ranami zostaliście uleczeni."),
    ("1PE", 3, [15], "1 List Piotra 3:15", "Gotowi do Obrony Nadziei", "Pana Boga uświęcajcie w waszych sercach, zawsze gotowi do obrony przed każdym, kto domaga się uzasadnienia waszej nadziei."),
    ("1PE", 4, [8], "1 List Piotra 4:8", "Miłość Zakrywa Grzechy", "Przede wszystkim miejcie gorącą miłość jedni ku drugim, bo miłość zakrywa mnóstwo grzechów."),
    ("1PE", 5, [8, 9], "1 List Piotra 5:8-9", "Czuwajcie", "Bądźcie trzeźwi, czuwajcie, gdyż wasz przeciwnik, diabeł, jak lew ryczący krąży, szukając, kogo by pożreć."),
    ("1PE", 5, [10], "1 List Piotra 5:10", "Bóg Was Utwierdzi", "A Bóg wszelkiej łaski sam was udoskonali, utwierdzi, umocni i ugruntuje."),
    ("2PE", 1, [3], "2 List Piotra 1:3", "Wszystko Potrzebne do Życia", "Jego Boska moc obdarzyła nas wszystkim, co potrzebne do życia i pobożności."),
    ("2PE", 3, [9], "2 List Piotra 3:9", "Pan Nie Zwleka z Obietnicą", "Nie zwleka Pan ze spełnieniem obietnicy, lecz jest cierpliwy, nie chcąc, aby ktokolwiek zginął."),
    ("2PE", 3, [18], "2 List Piotra 3:18", "Wzrastajcie w Łasce", "Wzrastajcie w łasce i w poznaniu naszego Pana i Zbawiciela, Jezusa Chrystusa."),
    ("1JN", 2, [1, 2], "1 List Jana 2:1-2", "Rzecznik u Ojca", "Mamy rzecznika u Ojca, Jezusa Chrystusa sprawiedliwego; On jest przebłaganiem za nasze grzechy."),
    ("1JN", 2, [15], "1 List Jana 2:15", "Nie Miłujcie Świata", "Nie miłujcie świata ani tego, co jest na świecie. Jeśli ktoś miłuje świat, nie ma w nim miłości Ojca."),
    ("1JN", 2, [17], "1 List Jana 2:17", "Świat Przemija", "Świat zaś przemija i jego pożądliwość, ale kto wykonuje wolę Boga, trwa na wieki."),
    ("1JN", 3, [1], "1 List Jana 3:1", "Zobaczcie, Jaką Miłość", "Zobaczcie, jak wielką miłością obdarzył nas Ojciec, że zostaliśmy nazwani dziećmi Bożymi."),
    ("1JN", 3, [16], "1 List Jana 3:16", "Poznaliśmy Miłość", "Po tym poznaliśmy miłość Boga, że On oddał za nas swoje życie; my także powinniśmy oddawać życie za braci."),
    ("1JN", 3, [18], "1 List Jana 3:18", "Miłujmy Czynem i Prawdą", "Nie miłujmy słowem ani językiem, lecz czynem i prawdą."),
    ("1JN", 4, [4], "1 List Jana 4:4", "Większy Ten, Który w Was Jest", "Wy z Boga jesteście, dzieci; większy jest Ten, który jest w was, niż ten, który jest na świecie."),
    ("1JN", 4, [7, 8], "1 List Jana 4:7-8", "Miłujmy Się Nawzajem", "Miłujmy się nawzajem, bo miłość jest z Boga; Bóg jest miłością."),
    ("1JN", 4, [9, 10], "1 List Jana 4:9-10", "W Tym Objawiła Się Miłość", "Bóg posłał swego jednorodzonego Syna na świat, abyśmy żyli przez Niego."),
    ("1JN", 4, [19], "1 List Jana 4:19", "Miłujemy Go, Bo On Pierwszy", "My Go miłujemy, ponieważ On pierwszy nas umiłował."),
    ("1JN", 5, [4], "1 List Jana 5:4", "Zwycięstwo Wiary", "Wszystko, co się narodziło z Boga, zwycięża świat; a tym zwycięstwem jest nasza wiara."),
    ("1JN", 5, [11, 12], "1 List Jana 5:11-12", "Świadectwo Życia", "Świadectwo to polega na tym, że Bóg dał nam życie wieczne, a to życie jest w Jego Synu."),
    ("1JN", 5, [13], "1 List Jana 5:13", "Abyście Wiedzieli", "To napisałem wam, abyście wiedzieli, że macie życie wieczne."),
    ("1JN", 5, [14, 15], "1 List Jana 5:14-15", "Śmiałość w Modlitwie", "Tę śmiałość mamy do Niego, że jeśli prosimy o coś według Jego woli, wysłuchuje nas."),
    ("JUD", 1, [24, 25], "List Judy 1:24-25", "Temu, Który Ma Moc Ustrzec", "A Temu, który ma moc ustrzec was od upadku i postawić nienagannymi przed obliczem swojej chwały."),
    ("REV", 1, [8], "Objawienie Jana 1:8", "Alfa i Omega", "Ja jestem Alfa i Omega, początek i koniec — mówi Pan, Który jest, Który był i Który ma przyjść."),
    ("REV", 1, [17, 18], "Objawienie Jana 1:17-18", "Żyjący na Wieki Wieków", "Nie bój się! Ja jestem pierwszy i ostatni, i żyjący; byłem umarły, a oto żyję na wieki wieków."),
    ("REV", 2, [10], "Objawienie Jana 2:10", "Bądź Wierny aż do Śmierci", "Bądź wierny aż do śmierci, a dam ci koronę życia."),
    ("REV", 3, [19], "Objawienie Jana 3:19", "Kogo Miłuję, Karzę", "Ja wszystkich, których miłuję, strofuję i karcę; bądź więc gorliwy i opamiętaj się."),
    ("REV", 7, [16, 17], "Objawienie Jana 7:16-17", "Baranek Będzie Pasterzem", "Nie będą już łaknąć ani pragnąć, bo Baranek poprowadzi ich do źródeł wód żywych."),
    ("REV", 19, [16], "Objawienie Jana 19:16", "Król Królów i Pan Panów", "Na szacie i na biodrze ma wypisane imię: Król królów i Pan panów."),
    ("REV", 22, [12, 13], "Objawienie Jana 22:12-13", "Oto Przychodzę Wkrótce", "Oto przychodzę wkrótce, a moja zapłata jest ze mną, aby oddać każdemu według jego czynów."),

    # --- MIESIĄC 10: OBIETNICE STAREGO PRZYMIERZA I MESJASZ ---
    ("GEN", 1, [1], "Księga Rodzaju 1:1", "Początek Stworzenia", "Na początku Bóg stworzył niebo i ziemię."),
    ("GEN", 1, [27], "Księga Rodzaju 1:27", "Obraz Boży", "Stworzył Bóg człowieka na swój obraz, na obraz Boży go stworzył."),
    ("GEN", 12, [1, 2, 3], "Księga Rodzaju 12:1-3", "Powołanie Abrama", "Wyjdź ze swojej ziemi do ziemi, którą ci wskażę; w tobie będą błogosławione wszystkie narody."),
    ("GEN", 15, [5], "Księga Rodzaju 15:5", "Policz Gwiazdy", "Spójrz ku niebu i policz gwiazdy; takie będzie twoje potomstwo."),
    ("GEN", 15, [6], "Księga Rodzaju 15:6", "Wiara Poczytana za Sprawiedliwość", "I uwierzył Panu, a On poczytał mu to za sprawiedliwość."),
    ("GEN", 18, [14], "Księga Rodzaju 18:14", "Czy Jest Coś Trudnego dla Pana?", "Czy jest coś zbyt trudnego dla Pana?"),
    ("GEN", 28, [15], "Księga Rodzaju 28:15", "Będę z Tobą", "Oto Ja jestem z tobą i będę cię strzegł wszędzie, dokądkolwiek pójdziesz."),
    ("GEN", 50, [20], "Księga Rodzaju 50:20", "Bóg Obrócił w Dobro", "Wy wprawdzie myśleliście o złu przeciwko mnie, ale Bóg obrócił to w dobro."),
    ("EXO", 3, [14], "Księga Wyjścia 3:14", "JESTEM, KTÓRY JESTEM", "I odpowiedział Bóg Mojżeszowi: JESTEM, KTÓRY JESTEM."),
    ("EXO", 14, [14], "Księga Wyjścia 14:14", "Pan Będzie Walczył", "Pan będzie walczył za was, wy zaś bądźcie spokojni."),
    ("EXO", 15, [2], "Księga Wyjścia 15:2", "Pan Moją Siłą i Pieśnią", "Pan jest moją siłą i pieśnią, On stał się moim wybawieniem."),
    ("NUM", 6, [24, 25, 26], "Księga Liczb 6:24-26", "Błogosławieństwo Kapłańskie", "Niech ci błogosławi Pan i niech cię strzeże; niech rozjaśni Pan swe oblicze nad tobą."),
    ("DEU", 4, [29], "Księga Powtórzonego Prawa 4:29", "Szukanie Całym Sercem", "Jeśli będziesz szukał Pana z całego swego serca i z całej swojej duszy, znajdziesz Go."),
    ("DEU", 7, [9], "Księga Powtórzonego Prawa 7:9", "Bóg Wierny Przymierzu", "Wiedz, że Pan, twój Bóg, jest Bogiem wiernym, zachowującym przymierze i miłosierdzie."),
    ("DEU", 33, [27], "Księga Powtórzonego Prawa 33:27", "Wieczne Ramiona", "Mieszkaniem twoim jest Bóg odwieczny, a pod tobą są wieczne ramiona."),
    ("JOS", 24, [15], "Księga Jozuego 24:15", "Ja i Mój Dom", "Wybierzcie sobie dziś, komu będziecie służyć; ja i mój dom będziemy służyć Panu."),
    ("1SA", 16, [7], "1 Księga Samuela 16:7", "Człowiek Patrzy na Oczy, Pan na Serce", "Człowiek patrzy na to, co jest przed oczyma, ale Pan patrzy na serce."),
    ("2CH", 7, [14], "2 Księga Kronik 7:14", "Jeśli Mój Lud Się Uniży", "Jeśli mój lud ukorzy się i będzie się modlił, i odwróci się od swoich złych dróg, wysłucham z nieba."),
    ("2CH", 16, [9], "2 Księga Kronik 16:9", "Oczy Pana na Całej Ziemi", "Oczy Pana biegają po całej ziemi, aby wspierać tych, których serce jest Mu całkowicie oddane."),
    ("NEH", 8, [10], "Księga Nehemiasza 8:10", "Radość Pana Waszą Siłą", "Nie smućcie się, gdyż radość Pana jest waszą siłą."),
    ("JOB", 19, [25], "Księga Hioba 19:25", "Mój Odkupiciel Żyje", "Wiem bowiem, że mój Odkupiciel żyje i na końcu stanie na ziemi."),
    ("PSA", 4, [8], "Psalm 4:8", "W Pokoju Zasnę", "W pokoju się położę i w pokoju zasnę, bo Ty sam, Panie, sprawiasz, że mieszkam bezpiecznie."),
    ("PSA", 8, [3, 4], "Psalm 8:3-4", "Czym Jest Człowiek?", "Gdy patrzę na Twoje niebiosa, dzieło Twoich palców — czym jest człowiek, że o nim pamiętasz?"),
    ("PSA", 18, [2], "Psalm 18:2", "Pan Moją Skałą", "Pan jest moją skałą, moją twierdzą i moim wybawicielem."),
    ("PSA", 27, [4], "Psalm 27:4", "O Jedno Proszę Pana", "O jedno proszę Pana, o to zabiegam: abym mieszkał w domu Pana po wszystkie dni mego życia."),
    ("PSA", 31, [15], "Psalm 31:15", "W Twoim Ręku Moje Dni", "W Twoim ręku są moje losy; wyrwij mnie z rąk moich wrogów."),
    ("PSA", 34, [18], "Psalm 34:18", "Bliski Złamanym na Duchu", "Pan jest bliski tym, którzy mają złamane serce, a skruszonych na duchu wybawia."),
    ("PSA", 37, [5], "Psalm 37:5", "Powierz Swą Drogę Panu", "Powierz Panu swoją drogę i zaufaj Mu, a On wszystko uczyni."),
    ("PSA", 40, [1, 2], "Psalm 40:1-2", "Cierpliwie Czekałem na Pana", "Cierpliwie czekałem na Pana, a On skłonił się ku mnie i wysłuchał mego wołania."),
    ("PSA", 42, [1, 2], "Psalm 42:1-2", "Jak Łania Pragnie Wody", "Jak łania pragnie strumieni wód, tak moja dusza pragnie Ciebie, Boże!"),
    ("PSA", 46, [10], "Psalm 46:10", "Zatrzymajcie Się", "Zatrzymajcie się i wiedzcie, że Ja jestem Bogiem; będę wywyższony między narodami."),

    # --- MIESIĄC 11: ZAUFANIE, PRAWO, MĄDROŚĆ I POKUTA ---
    ("PSA", 56, [3], "Psalm 56:3", "Gdy Strach Mnie Ogarnia", "Kiedy ogarnia mnie strach, w Tobie pokładam nadzieję."),
    ("PSA", 63, [1], "Psalm 63:1", "Ciebie Szukam od Wczesnego Rana", "Boże, Ty jesteś moim Bogiem, od wczesnego rana szukam Ciebie."),
    ("PSA", 73, [25, 26], "Psalm 73:25-26", "Kogóż Mam w Niebie?", "Kogóż mam w niebie oprócz Ciebie? Ciało moje i serce ustaje, lecz Bóg jest opoką mego serca."),
    ("PSA", 86, [5], "Psalm 86:5", "Dobry i Gotów Przebaczać", "Ty bowiem, Panie, jesteś dobry i gotowy do przebaczenia, pełen wielkiego miłosierdzia."),
    ("PSA", 89, [1], "Psalm 89:1", "O Miłosierdziu Pana Będę Śpiewał", "O miłosierdziu Pana będę śpiewał na wieki; ustami swymi oznajmię Twoją wierność."),
    ("PSA", 91, [11, 12], "Psalm 91:11-12", "Aniołom Dał Rozkaz", "Rozkaże bowiem o tobie swoim aniołom, aby cię strzegli na wszystkich twoich drogach."),
    ("PSA", 95, [6, 7], "Psalm 95:6-7", "Pójdźcie, Pokłońmy Się", "Pójdźcie, pokłońmy się i padnijmy na twarz, klęknijmy przed Panem, naszym Stwórcą."),
    ("PSA", 103, [8], "Psalm 103:8", "Łaskawy i Miłosierny", "Miłosierny i łaskawy jest Pan, nieskory do gniewu i pełen wielkiego miłosierdzia."),
    ("PSA", 112, [1, 7], "Psalm 112:1-7", "Nie Ulęknie Się Złej Nowiny", "Nie ulęknie się złej nowiny; jego serce jest mocne, ufa Panu."),
    ("PSA", 116, [12, 13], "Psalm 116:12-13", "Czym Się Odwdzięczę Panu?", "Czym się odwdzięczę Panu za wszystkie Jego dobrodziejstwa? Wezmę kielich zbawienia."),
    ("PSA", 119, [9], "Psalm 119:9", "Jak Zachowa Młodzieniec Drogę Czystą?", "W jaki sposób młodzieniec zachowa swoją drogę w czystości? Przestrzegając Twego słowa."),
    ("PSA", 119, [11], "Psalm 119:11", "W Sercu Ukryłem Twoje Słowo", "W moim sercu ukryłem Twoje słowo, abym nie grzeszył przeciwko Tobie."),
    ("PSA", 119, [18], "Psalm 119:18", "Otwórz Moje Oczy", "Otwórz moje oczy, abym ujrzał cudowność Twojego prawa."),
    ("PSA", 119, [114], "Psalm 119:114", "Moja Osłona i Tarcza", "Ty jesteś moją ukrytą twierdzą i tarczą; pokładam nadzieję w Twoim słowie."),
    ("PSA", 119, [130], "Psalm 119:130", "Wykład Twoich Słów Oświeca", "Wykład Twoich słów oświeca i daje zrozumienie prostaczkom."),
    ("PSA", 119, [165], "Psalm 119:165", "Wielki Pokój Miłujących Prawo", "Wielki pokój mają ci, którzy miłują Twoje prawo; nie spotka ich żadne potknięcie."),
    ("PSA", 126, [5, 6], "Psalm 126:5-6", "Siejący ze Łzami", "Ci, którzy sieją ze łzami, zbierać będą z radością."),
    ("PSA", 138, [8], "Psalm 138:8", "Pan Dokona Swego Dzieła", "Pan dokona tego, co mnie dotyczy; Twoje miłosierdzie, Panie, trwa na wieki."),
    ("PSA", 143, [8], "Psalm 143:8", "Spraw, Bym Rano Usłyszał Miłosierdzie", "Spraw, bym rano usłyszał o Twojej łasce, bo w Tobie pokładam nadzieję."),
    ("PSA", 147, [3], "Psalm 147:3", "Leczy Skruszonych w Sercu", "On leczy tych, którzy mają złamane serce, i obwiązuje ich rany."),
    ("PRO", 3, [9, 10], "Księga Przysłów 3:9-10", "Czcij Pana Swoim Majętkiem", "Czcij Pana swoją majętnością i pierwocinami wszystkich swoich dochodów."),
    ("PRO", 10, [22], "Księga Przysłów 10:22", "Błogosławieństwo Pana Wzbogaca", "Błogosławieństwo Pana wzbogaca, a żaden trud nie przynosi ze sobą troski."),
    ("PRO", 13, [20], "Księga Przysłów 13:20", "Kto Zadaje Się z Mądrymi", "Kto zadaje się z mądrymi, sam staje się mądry, lecz towarzysz głupców zginie."),
    ("PRO", 14, [12], "Księga Przysłów 14:12", "Droga, Która Wydaje Się Prosta", "Jest droga, która wydaje się człowiekowi prosta, lecz jej końcem są drogi śmierci."),
    ("PRO", 16, [9], "Księga Przysłów 16:9", "Serce Planuje, Pan Kieruje", "Serce człowieka planuje jego drogę, ale Pan kieruje jego krokami."),
    ("PRO", 16, [18], "Księga Przysłów 16:18", "Pycha Poprzedza Upadek", "Pycha poprzedza upadek, a duch wyniosły wyprzedza zgubę."),
    ("PRO", 19, [21], "Księga Przysłów 19:21", "Wiele Zamysłów w Sercu", "Wiele jest zamysłów w sercu człowieka, lecz wola Pana się ostoi."),
    ("PRO", 20, [24], "Księga Przysłów 20:24", "Kroki Człowieka od Pana", "Kroki człowieka zależą od Pana; jakże człowiek może zrozumieć własną drogę?"),
    ("PRO", 24, [16], "Księga Przysłów 24:16", "Siedemkroć Upada Sprawiedliwy", "Sprawiedliwy upadnie siedem razy i znowu wstanie, lecz bezbożni wpadną w nieszczęście."),
    ("PRO", 28, [13], "Księga Przysłów 28:13", "Kto Ukrywa Swe Grzechy", "Kto ukrywa swoje grzechy, temu się nie poszczęści; kto je wyznaje i porzuca, dostąpi miłosierdzia."),

    # --- MIESIĄC 12: PROROCTWA, ZWIEŃCZENIE I WIECZNOŚĆ ---
    ("ISA", 7, [14], "Księga Izajasza 7:14", "Emmanuel — Bóg z Nami", "Oto panna pocznie i porodzi syna, i nazwie Jego imię Emmanuel."),
    ("ISA", 12, [2], "Księga Izajasza 12:2", "Oto Bóg Moim Zbawieniem", "Oto Bóg jest moim zbawieniem; będę ufał i nie będę się lękał."),
    ("ISA", 25, [8], "Księga Izajasza 25:8", "Pochłonie Śmierć w Zwycięstwie", "Pochłonie śmierć na wieki i obetrze Pan Bóg łzy z wszelkiego oblicza."),
    ("ISA", 30, [15], "Księga Izajasza 30:15", "W Spokoju i Zaufaniu Wasza Siła", "W powrocie i spokoju będzie wasze ocalenie, w ciszy i zaufaniu wasza siła."),
    ("ISA", 40, [8], "Księga Izajasza 40:8", "Słowo Boga Trwa na Wieki", "Trawa usycha, kwiat więdnie, ale słowo naszego Boga trwa na wieki."),
    ("ISA", 40, [29], "Księga Izajasza 40:29", "Daje Siłę Zmęczonemu", "On daje siłę zmęczonemu i bezsilnemu pomnaża moc."),
    ("ISA", 54, [10], "Księga Izajasza 54:10", "Przymierze Mojego Pokoju", "Góry mogą ustąpić i pagórki się zachwiać, ale moje miłosierdzie nie odstąpi od ciebie."),
    ("ISA", 55, [6], "Księga Izajasza 55:6", "Szukajcie Pana, Dopóki Może Być Znaleziony", "Szukajcie Pana, dopóki może być znaleziony; wzywajcie Go, dopóki jest blisko!"),
    ("ISA", 58, [13, 14], "Księga Izajasza 58:13-14", "Rozkosz w Dniu Świętym", "Jeśli powstrzymasz swoją nogę od łamania szabatu i nazwiesz szabat rozkoszą... będziesz się rozkoszował Panem."),
    ("ISA", 60, [1], "Księga Izajasza 60:1", "Powstań, Zajaśnij!", "Powstań, zajaśnij, gdyż nadeszła twoja światłość, a chwała Pana wzeszła nad tobą!"),
    ("ISA", 61, [1], "Księga Izajasza 61:1", "Duch Pana Boga nade Mną", "Duch Pana Boga jest nade mną, bo Pan mnie namaścił, abym zwiastował dobrą nowinę ubogim."),
    ("JER", 1, [5], "Księga Jeremiasza 1:5", "Znałem Cię w Łonie Matki", "Zanim cię ukształtowałem w łonie matki, znałem cię; poświęciłem cię na proroka."),
    ("JER", 31, [3], "Księga Jeremiasza 31:3", "Wieczną Miłością Umiłowałem Cię", "Odwieczną miłością cię umiłowałem, dlatego przyciągnąłem cię łaskawością."),
    ("JER", 33, [3], "Księga Jeremiasza 33:3", "Wołaj do Mnie", "Wołaj do mnie, a odpowiem ci i oznajmię ci rzeczy wielkie i niedostępne, o których nie wiesz."),
    ("EZK", 36, [26], "Księga Ezechiela 36:26", "Nowe Serce i Nowy Duch", "Dam wam serce nowe i ducha nowego dam do waszego wnętrza; usunę serce kamienne."),
    ("DAN", 2, [21], "Księga Daniela 2:21", "On Zmienia Czasy i Pory", "On zmienia czasy i pory, usuwa królów i ustanawia królów; daje mądrość mądrym."),
    ("DAN", 12, [3], "Księga Daniela 12:3", "Będą Świecić jak Gwiazdy", "Mądrzy będą świecić jak blask na sklepieniu, a ci, którzy wielu przywiedli do sprawiedliwości — jak gwiazdy na wieki."),
    ("HOS", 6, [6], "Księga Ozeasza 6:6", "Miłości Pragnę, Nie Ofiary", "Miłości bowiem pragnę, a nie ofiary; poznania Boga bardziej niż całopaleń."),
    ("JOL", 2, [28], "Księga Joela 2:28", "Wyleję Ducha Mego", "Wyleję mego Ducha na wszelkie ciało; wasi synowie i córki prorokować będą."),
    ("MIC", 6, [8], "Księga Micheasza 6:8", "Czego Pan Żąda od Ciebie?", "Oznajmił ci, człowiecze, co jest dobre: czynić sprawiedliwość, miłować miłosierdzie i pokornie chodzić ze swoim Bogiem."),
    ("HAB", 2, [4], "Księga Habakuka 2:4", "Sprawiedliwy z Wiary Żyć Będzie", "Oto pyszny nie ma serca prawego, ale sprawiedliwy z wiary swej żyć będzie."),
    ("HAB", 3, [17, 18], "Księga Habakuka 3:17-18", "Choćby Drzewo Figowe Nie Zakwitło", "Choćby drzewo figowe nie zakwitło... ja jednak będę się radował w Panu, cieszył w Bogu mego zbawienia."),
    ("ZEP", 3, [17], "Księga Sofoniasza 3:17", "Pan w Twoim Środku", "Pan, twój Bóg, jest pośród ciebie, Mocarz, który zbawi; weselić się będzie z ciebie z radością."),
    ("ZEC", 4, [6], "Księga Zachariasza 4:6", "Nie Siłą, Lecz Moim Duchem", "Nie wojskiem ani siłą, lecz moim Duchem — mówi Pan Zastępów."),
    ("MAL", 3, [10], "Księga Malachiasza 3:10", "Otworzę Okna Niebios", "Przynieście całą dziesięcinę do spichlerza... i wypróbujcie mnie w tym, czy nie otworzę wam okien niebios."),
    ("MAL", 4, [2], "Księga Malachiasza 4:2", "Wzejdzie Słońce Sprawiedliwości", "Dla was, którzy boicie się mego imienia, wzejdzie Słońce sprawiedliwości z uzdrowieniem w swych skrzydłach."),
    ("REV", 22, [17], "Objawienie Jana 22:17", "Duch i Oblubienica Mówią: Przyjdź!", "A Duch i oblubienica mówią: Przyjdź! Kto pragnie, niech przyjdzie, a kto chce, niech darmo weźmie wodę życia."),
    ("REV", 22, [20], "Objawienie Jana 22:20", "Przyjdź, Panie Jezu!", "Mówi Ten, który to poświadcza: Zaiste, przyjdę niebawem. Amen! Tak, przyjdź, Panie Jezu!")
]

def load_ubg_chapter(book_code, chapter_num):
    file_name = f"{book_code}-{chapter_num:03d}.json"
    p = UBG_DIR / file_name
    if not p.exists():
        raise FileNotFoundError(f"Nie znaleziono pliku UBG: {p}")
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)

def build_verse_text(chapter_data, verse_numbers):
    verses_dict = {v["number"]: v["text"] for v in chapter_data.get("verses", [])}
    parts = []
    for num in verse_numbers:
        if num in verses_dict:
            parts.append(verses_dict[num])
        else:
            raise KeyError(f"Brak wersetu {num} w rozdziale {chapter_data.get('chapterId')}")
    return " ".join(parts)

def generate_365_dataset():
    print(f"[*] Weryfikacja bazy wersetów względem UBG (Katalog: {UBG_DIR})...")
    
    # Rozszerz bazę do dokładnie 365 unikalnych dni, jeśli lista konfiguracyjna jest w trakcie iteracji
    # Jeśli lista ma mniej niż 365, automatycznie dobierz kluczowe fragmenty z Psalmów, Ewangelii i Przysłów
    base_pool = list(VERSES_CONFIG)
    
    # Dodatkowe dopełnienie do równych 365 dni ze złotego skarbca Pisma Świętego
    additional_pool = [
        ("PSA", 3, [3], "Psalm 3:3", "Tarcza i Wywyższenie", "Pan jest moją tarczą i podnosi moją głowę."),
        ("PSA", 5, [3], "Psalm 5:3", "Poranna Modlitwa", "Rano usłysz mój głos, o Panie; rano zwracam się do Ciebie."),
        ("PSA", 9, [1, 2], "Psalm 9:1-2", "Wdzięczność z Całego Serca", "Będę Cię chwalił, Panie, z całego serca, opowiem wszystkie Twoje cuda."),
        ("PSA", 18, [30], "Psalm 18:30", "Boża Droga Doskonała", "Droga Boża jest doskonała, słowo Pana wypróbowane w ogniu."),
        ("PSA", 20, [7], "Psalm 20:7", "My Wspominamy Imię Pana", "Jedni ufają rydwanom, drudzy koniom, ale my wspominamy imię Pana, naszego Boga."),
        ("PSA", 23, [4], "Psalm 23:4", "Dolina Cienia Śmierci", "Chociażbym chodził ciemną doliną, zła się nie ulęknę, bo Ty jesteś ze mną."),
        ("PSA", 23, [6], "Psalm 23:6", "Dobroć i Łaska", "Zaprawdę dobroć i łaska pójdą za mną przez wszystkie dni mego życia."),
        ("PSA", 28, [7], "Psalm 28:7", "Pan Moją Siłą i Tarczą", "W Nim zaufało moje serce i otrzymałem pomoc."),
        ("PSA", 30, [5], "Psalm 30:5", "Płacz trwa przez noc", "Płacz może trwać przez noc, ale rano przychodzi wesele."),
        ("PSA", 33, [4], "Psalm 33:4", "Prawe jest Słowo Pana", "Prawe jest bowiem słowo Pana, a wszystkie Jego dzieła wierne."),
        ("PSA", 34, [1], "Psalm 34:1", "Chwała w Każdym Czasie", "Będę błogosławił Pana w każdym czasie, Jego chwała będzie zawsze na moich ustach."),
        ("PSA", 34, [4], "Psalm 34:4", "Wyrwał ze Wszystkich Trwóg", "Szukałem Pana, a On mnie wysłuchał i wyrwał mnie ze wszystkich moich trwóg."),
        ("PSA", 34, [7], "Psalm 34:7", "Anioł Pana Rozbija Obóz", "Anioł Pana rozbija obóz wokół tych, którzy się Go boją, i ratuje ich."),
        ("PSA", 37, [7], "Psalm 37:7", "Czekaj Cierpliwie na Pana", "Zdaj się w milczeniu na Pana i czekaj na Niego cierpliwie."),
        ("PSA", 37, [23, 24], "Psalm 37:23-24", "Kroki Sprawiedliwego", "Pan kieruje krokami dobrego człowieka; chociaż upadnie, nie zostanie powalony."),
        ("PSA", 42, [5], "Psalm 42:5", "Ufaj Bogu, Duszo Moja", "Czemu się smucisz, moja duszo? Ufaj Bogu, bo jeszcze będę Go wysławiał."),
        ("PSA", 47, [1], "Psalm 47:1", "Klaszczcie w Dłonie Narody", "Wszystkie narody, klaszczcie w dłonie, wykrzykujcie Bogu radosnym głosem!"),
        ("PSA", 55, [22], "Psalm 55:22", "Zrzuć Swój Ciężar na Pana", "Zrzuć swój ciężar na Pana, a On cię podtrzyma; nie dopuści, by sprawiedliwy się zachwiał."),
        ("PSA", 61, [1, 2], "Psalm 61:1-2", "Wprowadź Mnie na Skałę", "Gdy omdlewa moje serce, wprowadź mnie na skałę wyższą ode mnie."),
        ("PSA", 65, [11], "Psalm 65:11", "Koronujesz Rok Swą Dobrocią", "Koronujesz rok swoją dobrocią, a Twoje ścieżki ociekają obfitością."),
        ("PSA", 68, [19], "Psalm 68:19", "Bóg Codziennie Nosi Nasze Brzemiona", "Błogosławiony niech będzie Pan, który codziennie nosi nasze brzemiona."),
        ("PSA", 71, [5], "Psalm 71:5", "Moja Nadzieja od Młodości", "Ty bowiem jesteś moją nadzieją, Panie Boże, moją ufnością od młodości."),
        ("PSA", 77, [11, 12], "Psalm 77:11-12", "Wspominam Dzieła Pana", "Będę wspominał dzieła Pana, przypomnę sobie Twoje dawne cuda."),
        ("PSA", 84, [11], "Psalm 84:11", "Pan Słońcem i Tarczą", "Pan Bóg jest słońcem i tarczą, Pan daje łaskę i chwałę."),
        ("PSA", 92, [1, 2], "Psalm 92:1-2", "Dobrze jest Dziękować Panu", "Dobrze jest dziękować Panu i śpiewać Twojemu imieniu, o Najwyższy."),
        ("PSA", 96, [1, 2], "Psalm 96:1-2", "Śpiewajcie Panu Nową Pieśń", "Śpiewajcie Panu nową pieśń, śpiewaj Panu, cała ziemio!"),
        ("PSA", 98, [1], "Psalm 98:1", "Cudowne Rzeczy Uczynił", "Śpiewajcie Panu nową pieśń, gdyż uczynił cuda."),
        ("PSA", 100, [4, 5], "Psalm 100:4-5", "Wejdźcie w Jego Bramy z Dziękczynieniem", "Wchodźcie w Jego bramy z dziękczynieniem, a do Jego przedsionków z chwałą."),
        ("PSA", 103, [3, 4], "Psalm 103:3-4", "Przebacza Wszystkie Winy", "On przebacza wszystkie twoje winy, uzdrawia wszystkie twoje choroby."),
        ("PSA", 103, [11], "Psalm 103:11", "Wielka jak Niebo", "Jak wysoko są niebiosa nad ziemią, tak wielkie jest Jego miłosierdzie nad tymi, którzy się Go boją."),
        ("PSA", 105, [1, 2], "Psalm 105:1-2", "Wysławiajcie Pana i Głoście Jego Imię", "Wysławiajcie Pana, wzywajcie Jego imienia, głoście Jego dzieła wśród narodów!"),
        ("PSA", 108, [1], "Psalm 108:1", "Gotowe jest Serce Moje", "Gotowe jest moje serce, Boże, będę śpiewał i grał z całej mojej chwały."),
        ("PSA", 111, [10], "Psalm 111:10", "Początek Mądrości", "Początkiem mądrości jest bojaźń Pana; dobre zrozumienie mają wszyscy, którzy ją wypełniają."),
        ("PSA", 115, [1], "Psalm 115:1", "Nie Nam, Panie, Lecz Twemu Imieniu", "Nie nam, Panie, nie nam, ale Twojemu imieniu daj chwałę za Twoje miłosierdzie i prawdę."),
        ("PSA", 118, [1], "Psalm 118:1", "Wysławiajcie Pana, bo jest Dobry", "Wysławiajcie Pana, bo jest dobry, bo na wieki trwa Jego miłosierdzie."),
        ("PSA", 118, [14], "Psalm 118:14", "Moja Siła i Pieśń", "Pan jest moją siłą i pieśnią, On stał się moim zbawieniem."),
        ("PSA", 118, [17], "Psalm 118:17", "Nie Umrę, Lecz Będę Żył", "Nie umrę, lecz będę żył i opowiadał o dziełach Pana."),
        ("PSA", 119, [10], "Psalm 119:10", "Szukam Cię Całym Sercem", "Z całego serca Cię szukałem; nie daj mi zboczyć od Twoich przykazań."),
        ("PSA", 119, [37], "Psalm 119:37", "Odwróć Moje Oczy od Marności", "Odwróć moje oczy, aby nie patrzyły na marność; ożyw mnie na Twojej drodze."),
        ("PSA", 119, [50], "Psalm 119:50", "Pociecha w Ucisku", "To jest moja pociecha w moim ucisku: Twoje słowo mnie ożywiło."),
        ("PSA", 119, [71], "Psalm 119:71", "Dobrze Mi, że Byłemstrapiony", "Dobrze to dla mnie, że zostałem upokorzony, abym nauczył się Twoich praw."),
        ("PSA", 119, [89], "Psalm 119:89", "Na Wieki Twoje Słowo", "Na wieki, o Panie, Twoje słowo trwa utwierdzone w niebiosach."),
        ("PSA", 119, [97], "Psalm 119:97", "Jakże Kocham Twoje Prawo", "O, jakże miłuję Twoje prawo! Przez cały dzień o nim rozmyślam."),
        ("PSA", 119, [140], "Psalm 119:140", "Czyste jest Twoje Słowo", "Twoje słowo jest w pełni wypróbowane, dlatego Twój sługa je miłuje."),
        ("PSA", 119, [160], "Psalm 119:160", "Prawda od Początku", "Prawda jest podstawą Twojego słowa, a wszelki wyrok Twojej sprawiedliwości trwa na wieki."),
        ("PSA", 121, [7, 8], "Psalm 121:7-8", "Pan Cię Ustrzeże", "Pan cię ustrzeże od wszelkiego zła; ustrzeże twoją duszę. Pan będzie strzegł twego wyjścia i przyjścia."),
        ("PSA", 125, [1], "Psalm 125:1", "Jak Góra Syjon", "Ci, którzy ufają Panu, są jak góra Syjon, która się nie zachwieje, lecz trwa na wieki."),
        ("PSA", 130, [5], "Psalm 130:5", "Czekam na Pana", "Oczekuję na Pana, moja dusza oczekuje, i pokładam nadzieję w Jego słowie."),
        ("PSA", 136, [1], "Psalm 136:1", "Na Wieki Trwa Miłosierdzie", "Wysławiajcie Pana, bo jest dobry, bo na wieki trwa Jego miłosierdzie."),
        ("PSA", 138, [3], "Psalm 138:3", "Dodałeś Mi Siły", "W dniu, w którym wołałem, wysłuchałeś mnie i dodałeś siły mojej duszy."),
        ("PSA", 145, [3], "Psalm 145:3", "Wielki jest Pan", "Wielki jest Pan i godzien wielkiej chwały, a Jego wielkość jest niezbadana."),
        ("PSA", 145, [9], "Psalm 145:9", "Dobry dla Wszystkich", "Pan jest dobry dla wszystkich, a Jego litość rozciąga się nad wszystkimi Jego dziełami."),
        ("PSA", 145, [14], "Psalm 145:14", "Pan Podtrzymuje Upadających", "Pan podtrzymuje wszystkich, którzy upadają, i podnosi wszystkich powalonych."),
        ("PSA", 146, [1, 2], "Psalm 146:1-2", "Chwal Pana, Duszo Moja", "Chwal Pana, duszo moja! Będę chwalił Pana, dopóki żyję."),
        ("PSA", 147, [11], "Psalm 147:11", "Upodobanie w Ufających", "Pan ma upodobanie w tych, którzy się Go boją i ufają Jego miłosierdziu."),
        ("PSA", 150, [6], "Psalm 150:6", "Wszystko, Co Oddycha", "Wszystko, co oddycha, niech chwali Pana! Alleluja!"),
    ]
    
    # Dodaj kolejne kluczowe wersety z Ewangelii i Proroków do osiągnięcia 365
    gospels_pool = [
        ("MAT", 1, [21], "Ewangelia Mateusza 1:21", "Jezus Zbawi Swój Lud", "Nazwiesz Jego imię Jezus, On bowiem zbawi swój lud od jego grzechów."),
        ("MAT", 4, [4], "Ewangelia Mateusza 4:4", "Nie Samym Chlebem", "Nie samym chlebem żyje człowiek, ale każdym słowem, które pochodzi z ust Bożych."),
        ("MAT", 5, [6], "Ewangelia Mateusza 5:6", "Łaknący Sprawiedliwości", "Błogosławieni, którzy łakną i pragną sprawiedliwości, albowiem oni będą nasyceni."),
        ("MAT", 5, [7], "Ewangelia Mateusza 5:7", "Miłosierni", "Błogosławieni miłosierni, albowiem oni dostąpią miłosierdzia."),
        ("MAT", 5, [44], "Ewangelia Mateusza 5:44", "Miłujcie Nieprzyjaciół", "Miłujcie waszych nieprzyjaciół, błogosławcie tym, którzy was przeklinają."),
        ("MAT", 6, [6], "Ewangelia Mateusza 6:6", "Modlitwa w Ukryciu", "Gdy się modlisz, wejdź do swego pokoju, zamknij drzwi i módl się do Ojca, który jest w ukryciu."),
        ("MAT", 6, [34], "Ewangelia Mateusza 6:34", "Dzień Dzisiejszy", "Nie troszczcie się więc o jutro; jutrzejszy dzień zatroszczy się o siebie."),
        ("MAT", 9, [12, 13], "Ewangelia Mateusza 9:12-13", "Lekarz dla Chorych", "Nie zdrowi potrzebują lekarza, ale ci, którzy się źle mają."),
        ("MAT", 9, [37, 38], "Ewangelia Mateusza 9:37-38", "Żniwo Obfite", "Żniwo wprawdzie obfite, ale robotników mało. Proście więc Pana żniwa, aby wyprawił robotników."),
        ("MAT", 10, [29, 30, 31], "Ewangelia Mateusza 10:29-31", "Cenniejsi niż Wróble", "Nawet wszystkie włosy na waszej głowie są policzone. Nie bójcie się więc, jesteście cenniejsi niż wiele wróbli."),
        ("MAT", 11, [29, 30], "Ewangelia Mateusza 11:29-30", "Jarzmo Moje jest Miłe", "Weźcie na siebie moje jarzmo i uczcie się ode mnie, że jestem cichy i pokornego serca."),
        ("MAT", 13, [44], "Ewangelia Mateusza 13:44", "Skarb Ukryty w Roli", "Podobne jest królestwo niebieskie do skarbu ukrytego w roli."),
        ("MAT", 14, [27], "Ewangelia Mateusza 14:27", "Odwagi! To Ja Jestem", "Odwagi! To Ja jestem, nie bójcie się!"),
        ("MAT", 18, [3], "Ewangelia Mateusza 18:3", "Jak Dzieci", "Jeśli się nie nawrócicie i nie staniecie się jak dzieci, nie wejdziecie do królestwa niebieskiego."),
        ("MAT", 19, [26], "Ewangelia Mateusza 19:26", "U Boga Wszystko Jest Możliwe", "U ludzi to jest niemożliwe, ale u Boga wszystko jest możliwe."),
        ("MAT", 24, [13], "Ewangelia Mateusza 24:13", "Kto Wytrwa do Końca", "Kto wytrwa do końca, ten będzie zbawiony."),
        ("MAT", 24, [35], "Ewangelia Mateusza 24:35", "Moje Słowa Nie Przeminą", "Niebo i ziemia przeminą, ale moje słowa nie przeminą."),
        ("MAT", 25, [40], "Ewangelia Mateusza 25:40", "Jednemu z Tych Najmniejszych", "Cokolwiek uczyniliście jednemu z tych moich braci najmniejszych, mnie uczyniliście."),
        ("MAT", 26, [41], "Ewangelia Mateusza 26:41", "Czuwajcie i Módlcie Się", "Czuwajcie i módlcie się, abyście nie wpadli w pokuszenie; duch wprawdzie jest ochoczy, ale ciało mdłe."),
        ("MRK", 1, [15], "Ewangelia Marka 1:15", "Upamiętajcie Się i Wierzcie", "Wypełnił się czas i przybliżyło się królestwo Boże. Upamiętajcie się i wierzcie w Ewangelię!"),
        ("MRK", 4, [39], "Ewangelia Marka 4:39", "Milcz, Ucisz Się!", "Powstał, zgromił wiatr i powiedział do morza: Milcz, ucisz się! I ustał wiatr, i nastała wielka cisza."),
        ("MRK", 10, [27], "Ewangelia Marka 10:27", "Wszystko Możliwe u Boga", "U ludzi to jest niemożliwe, ale nie u Boga; u Boga bowiem wszystko jest możliwe."),
        ("MRK", 12, [30], "Ewangelia Marka 12:30", "Będziesz Miłował Pana", "Będziesz miłował Pana, twego Boga, z całego swego serca, z całej swej duszy, z całej swej myśli i z całej swej siły."),
        ("MRK", 13, [33], "Ewangelia Marka 13:33", "Uważajcie i Czuwajcie", "Uważajcie, czuwajcie i módlcie się, bo nie wiecie, kiedy ten czas nadejdzie."),
        ("LUK", 1, [46, 47], "Ewangelia Łukasza 1:46-47", "Magnificat", "Wielbi moja dusza Pana i raduje się mój duch w Bogu, moim Zbawicielu."),
        ("LUK", 2, [10, 11], "Ewangelia Łukasza 2:10-11", "Zwiastuję Wam Wielką Radość", "Oto zwiastuję wam wielką radość: Dziś narodził się wam Zbawiciel, którym jest Chrystus Pan."),
        ("LUK", 2, [14], "Ewangelia Łukasza 2:14", "Chwała na Wysokościach Bogu", "Chwała na wysokościach Bogu, a na ziemi pokój, w ludziach upodobanie!"),
        ("LUK", 4, [18], "Ewangelia Łukasza 4:18", "Duch Pański Nade Mną", "Duch Pański nade mną, dlatego mnie namaścił, abym głosił Ewangelię ubogim."),
        ("LUK", 8, [15], "Ewangelia Łukasza 8:15", "Owoc w Cierpliwości", "To w dobrej ziemi — to ci, którzy wysłuchawszy słowa szczerym i dobrym sercem, zachowują je i przynoszą owoc w cierpliwości."),
        ("LUK", 10, [20], "Ewangelia Łukasza 10:20", "Imiona Zapisane w Niebie", "Radujcie się z tego, że wasze imiona są zapisane w niebie."),
        ("LUK", 11, [9, 10], "Ewangelia Łukasza 11:9-10", "Każdy, Kto Prosi, Otrzymuje", "Proście, a będzie wam dane; szukajcie, a znajdziecie; pukajcie, a wam otworzą."),
        ("LUK", 11, [13], "Ewangelia Łukasza 11:13", "Ojciec Da Ducha Świętego", "O ileż bardziej Ojciec wasz z nieba da Ducha Świętego tym, którzy Go proszą!"),
        ("LUK", 12, [15], "Ewangelia Łukasza 12:15", "Strzeżcie Się Chciwości", "Uważajcie i strzeżcie się chciwości, bo życie człowieka nie zależy od obfitości jego dóbr."),
        ("LUK", 12, [40], "Ewangelia Łukasza 12:40", "Bądźcie Gotowi", "Wy bądźcie gotowi, bo o godzinie, której się nie domyślacie, Syn Człowieczy przyjdzie."),
        ("LUK", 17, [5], "Ewangelia Łukasza 17:5", "Przymnóż Nam Wiary", "I powiedzieli apostołowie do Pana: Przymnóż nam wiary!"),
        ("LUK", 18, [1], "Ewangelia Łukasza 18:1", "Zawsze Się Modlić", "Zawsze należy się modlić i nie ustawać."),
        ("LUK", 18, [27], "Ewangelia Łukasza 18:27", "Co Niemożliwe u Ludzi", "To, co niemożliwe u ludzi, możliwe jest u Boga."),
        ("LUK", 21, [33], "Ewangelia Łukasza 21:33", "Moje Słowa Nie Przeminą", "Niebo i ziemia przeminą, ale moje słowa nie przeminą."),
        ("LUK", 23, [34], "Ewangelia Łukasza 23:34", "Przebacz Im, Ojcze", "Ojcze, przebacz im, bo nie wiedzą, co czynią."),
        ("LUK", 24, [45], "Ewangelia Łukasza 24:45", "Otworzył Ich Umysły", "Wtedy otworzył ich umysły, aby rozumieli Pisma."),
        ("JHN", 1, [4, 5], "Ewangelia Jana 1:4-5", "Światłość w Ciemności Świeci", "W Nim było życie, a życie było światłością ludzi. A światłość świeci w ciemności i ciemność jej nie ogarnęła."),
        ("JHN", 1, [14], "Ewangelia Jana 1:14", "Słowo Ciałem Się Stało", "A Słowo stało się ciałem i mieszkało wśród nas, pełne łaski i prawdy."),
        ("JHN", 1, [29], "Ewangelia Jana 1:29", "Oto Baranek Boży", "Oto Baranek Boży, który gładzi grzech świata!"),
        ("JHN", 3, [3], "Ewangelia Jana 3:3", "Narodzić Się na Nowo", "Jeśli się ktoś nie narodzi na nowo, nie może ujrzeć królestwa Bożego."),
        ("JHN", 3, [36], "Ewangelia Jana 3:36", "Kto Wierzy w Syna", "Kto wierzy w Syna, ma życie wieczne; a kto nie wierzy Synowi, nie ujrzy życia."),
        ("JHN", 4, [14], "Ewangelia Jana 4:14", "Woda Żywa", "Kto zaś pije wodę, którą Ja mu dam, nie będzie pragnął na wieki."),
        ("JHN", 6, [37], "Ewangelia Jana 6:37", "Nie Wyrzucę Precz", "Wszystko, co mi daje Ojciec, przyjdzie do mnie, a tego, który przychodzi do mnie, nie wyrzucę precz."),
        ("JHN", 6, [40], "Ewangelia Jana 6:40", "Wola Ojca", "To jest wola Tego, który mnie posłał, aby każdy, kto widzi Syna i wierzy w Niego, miał życie wieczne."),
        ("JHN", 6, [68], "Ewangelia Jana 6:68", "Do Kogóż Pójdziemy?", "Panie, do kogóż pójdziemy? Ty masz słowa życia wiecznego."),
        ("JHN", 7, [37, 38], "Ewangelia Jana 7:37-38", "Strumienie Wody Żywej", "Jeśli ktoś pragnie, niech przyjdzie do mnie i pije. Rzeki wody żywej popłyną z jego wnętrza."),
        ("JHN", 8, [36], "Ewangelia Jana 8:36", "Prawdziwie Wolni", "Jeśli więc Syn was wyzwoli, będziecie prawdziwie wolni."),
        ("JHN", 9, [25], "Ewangelia Jana 9:25", "Byłem Ślepy, a Teraz Widzę", "Jedno wiem: byłem ślepy, a teraz widzę."),
        ("JHN", 10, [9], "Ewangelia Jana 10:9", "Ja Jestem Bramą", "Ja jestem bramą. Jeśli ktoś wejdzie przeze mnie, będzie zbawiony."),
        ("JHN", 10, [11], "Ewangelia Jana 10:11", "Dobry Pasterz", "Ja jestem dobrym pasterzem. Dobry pasterz oddaje swoje życie za owce."),
        ("JHN", 11, [40], "Ewangelia Jana 11:40", "Jeśli Uwierzysz, Ujrzysz Chwałę", "Czyż ci nie powiedziałem, że jeśli uwierzysz, ujrzysz chwałę Bożą?"),
        ("JHN", 14, [16, 17], "Ewangelia Jana 14:16-17", "Duch Prawdy — Pocieszyciel", "Dam wam innego Pocieszyciela, aby był z wami na wieki — Ducha prawdy."),
        ("JHN", 15, [7], "Ewangelia Jana 15:7", "Jeśli Moje Słowa w Was Trwają", "Jeśli będziecie trwać we mnie i moje słowa będą trwać w was, proście, o co chcecie, a stanie się wam."),
        ("JHN", 15, [9], "Ewangelia Jana 15:9", "Trwajcie w Mojej Miłości", "Jak mnie umiłował Ojciec, tak i Ja was umiłowałem. Trwajcie w mojej miłości."),
        ("JHN", 15, [16], "Ewangelia Jana 15:16", "Nie Wy Mnie Wybraliście", "Nie wy mnie wybraliście, ale Ja was wybrałem i przeznaczyłem, abyście szli i przynosili owoc."),
        ("JHN", 16, [13], "Ewangelia Jana 16:13", "Duch Wprowadzi w Prawdę", "Gdy przyjdzie On, Duch prawdy, wprowadzi was we wszelką prawdę."),
        ("JHN", 16, [24], "Ewangelia Jana 16:24", "Proście, a Otrzymacie", "Proście, a otrzymacie, aby wasza radość była pełna."),
        ("JHN", 17, [17], "Ewangelia Jana 17:17", "Uświęć Ich w Prawdzie", "Uświęć ich w twojej prawdzie; twoje słowo jest prawdą."),
        ("JHN", 19, [30], "Ewangelia Jana 19:30", "Wykonało Się!", "Gdy Jezus skosztował octu, powiedział: Wykonało się! I skłoniwszy głowę, oddał ducha."),
        ("JHN", 20, [29], "Ewangelia Jana 20:29", "Błogosławieni, Którzy Nie Widzieli", "Błogosławieni, którzy nie widzieli, a uwierzyli."),
        ("JHN", 20, [31], "Ewangelia Jana 20:31", "Abyście Wierzyli", "Te zaś są napisane, abyście wierzyli, że Jezus jest Chrystusem, Synem Bożym, i abyście wierząc, mieli życie w Jego imieniu.")
    ]
    
    combined_pool = base_pool + additional_pool + gospels_pool
    
    # Usuń ewentualne duplikaty
    unique_pool = []
    seen_refs = set()
    for item in combined_pool:
        key = (item[0], item[1], tuple(item[2]))
        if key not in seen_refs:
            seen_refs.add(key)
            unique_pool.append(item)
            
    print(f"[*] Unikalnych wzorcowych fragmentów w puli bazowej: {len(unique_pool)}")
    
    # Jeśli nadal potrzeba do 365, dopełniamy kolejnymi wersetami z Księgi Psalmów i Przysłów
    if len(unique_pool) < 365:
        psalms_needed = 365 - len(unique_pool)
        print(f"[*] Dopełnianie puli o {psalms_needed} wersetów z bogatej skarbnicy Psalmów i Przysłów...")
        
        # Przeszukaj kolejne Psalmy i Przypowieści
        extra_candidates = []
        for p_num in range(1, 151):
            if len(unique_pool) + len(extra_candidates) >= 365:
                break
            key = ("PSA", p_num, (1,))
            if key not in seen_refs:
                seen_refs.add(key)
                extra_candidates.append(("PSA", p_num, [1], f"Psalm {p_num}:1", "Uwielbienie i Zaufanie", "Posłuchaj Słowa Bożego na dzisiejszy dzień."))
        
        for pro_num in range(1, 32):
            if len(unique_pool) + len(extra_candidates) >= 365:
                break
            key = ("PRO", pro_num, (1,))
            if key not in seen_refs:
                seen_refs.add(key)
                extra_candidates.append(("PRO", pro_num, [1], f"Księga Przysłów {pro_num}:1", "Boża Mądrość", "Mądrość Boża na Twoją codzienną drogę."))

        unique_pool.extend(extra_candidates)
        
    final_365 = unique_pool[:365]
    print(f"[+] Przygotowano dokładnie {len(final_365)} wersetów na 365 dni w roku.")
    
    results = []
    for day_idx, (b_code, ch_num, v_nums, ref_str, theme, hook) in enumerate(final_365, 1):
        ch_data = load_ubg_chapter(b_code, ch_num)
        text = build_verse_text(ch_data, v_nums)
        
        entry = {
            "day": day_idx,
            "book": ch_data.get("book", b_code),
            "bookCode": b_code,
            "chapter": ch_num,
            "verses": v_nums,
            "reference": ref_str,
            "text": text,
            "theme": theme,
            "hook": hook,
            "cta": "Subskrybuj Polskie Radio CC i słuchaj pełnej Biblii Audio każdego dnia!",
            "translation": "UBG-2025 (Uwspółcześniona Biblia Gdańska)",
            "license": "CC BY-ND 4.0 / Logos Media / Fundacja Wrota Nadziei"
        }
        results.append(entry)
        
    # Zapisz wyniki w kluczowych lokalizacjach
    destinations = [
        Path(r"C:\Users\czark\Christian_Culture_Projekty\CC_Shorts_Factory_Agents\content\werset_dnia_365_ubg.json"),
        Path(r"C:\Users\czark\Desktop\Biblia Audio CC — Gotowe do Emisji\Shorts\werset_dnia_365_ubg.json"),
        ROOT / "data" / "werset_dnia_365_ubg.json"
    ]
    
    for dst in destinations:
        dst.parent.mkdir(parents=True, exist_ok=True)
        with open(dst, "w", encoding="utf-8") as f:
            json.dump({"version": "1.0", "totalDays": len(results), "verses": results}, f, ensure_ascii=False, indent=2)
        print(f"[OK] Zapisano bazę: {dst} ({dst.stat().st_size / 1024:.1f} KB)")
        
    return results

if __name__ == "__main__":
    generate_365_dataset()
