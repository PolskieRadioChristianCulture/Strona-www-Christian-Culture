import fs from 'node:fs';
import path from 'node:path';

const outDir = 'C:\\Users\\czark\\Desktop\\Publikacja_Apo15_5_Kanalow';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const commonTimestamps = `00:00 - Wstęp: Powrót z rozdziałów 17–18 do Apokalipsy 15 i 16 (wstęp do plag)
01:22 - Konstrukcja Apokalipsy: Proroctwa siódemkowe i powracające obrazy powrotu Chrystusa
03:48 - Skupienie na czasach ostatecznych: Dlaczego od 15. rozdziału patrzymy wyłącznie w przyszłość
04:53 - Apokalipsa 15:1 – Siedmiu aniołów i czas dokonany: „Dopełnił się gniew Boga”
05:47 - Kim jest biblijny prorok? „Widzący” kontra prognozy pogody i wróżby świata
08:07 - Bóg ponad wymiarem czasu: Dlaczego dla Stwórcy cała oś historii jest widoczna naraz
11:16 - Boża wszechwiedza a wolna wola człowieka: Czy Bóg widzi obie drogi bez predestynacji?
14:07 - Apokalipsa 15:2–4 – Morze szklane z ogniem: Radosna wizja zwycięzców nad bestią
15:25 - Mechanizm wizji Jana: Przeniesienie na osi czasu (przykład roku 1798)
17:06 - Kontekst wielkiego ucisku (Daniel 12 i Daniel 3): Piec ognisty siedem razy bardziej rozpalony
20:25 - Pieśń Mojżesza: Świadectwo ocalenia nad Morzem Czerwonym i nowa pieśń 144 tysięcy
22:05 - Pieśń Baranka: Wierność wśród prześladowań i siła osobistego doświadczenia Boga
25:30 - Apokalipsa 15:5–6 – Otwarcie świątyni Przybytku Świadectwa w niebie
26:33 - Dlaczego „Świadectwo”? Arka Przymierza, Dekalog i 59 wersetów Starego Testamentu (Wj 25:16; 31:18)
28:24 - Finał historii a Dziesięć Przykazań: Wierność Resztki i próba czwartego przykazania (Apo 12:17; 14:12)
30:44 - Apokalipsa 15:7–8 – Siedem złotych czasz gniewu i świątynia napełniona dymem
31:43 - Symbolika Dnia Pojednania (Jom Kipur): Koniec pośrednictwa i zamknięcie czasu łaski
33:57 - Hebrajskie „Ne'ila” (zamknięcie) oraz pozdrowienie na Jom Kipur: „Obyś był dobrze zapieczętowany”
37:09 - List do Hebrajczyków 4:16 – „Przystąpmy z ufnością do tronu łaski w stosownej chwili”
39:22 - Droga przez zasłonę otwarta dzisiaj kontra groza zamkniętej świątyni
40:33 - Próg siedmiu plag (rozdział 16): Pokora wobec proroctw przyszłości i zapowiedź kolejnego odcinka`;

const commonLinks = `🔔 ZASUBSKRYBUJ nasz kanał, kliknij dzwoneczek i podaj dalej Boże Słowo!
📻 Słuchaj Radia Chrześcijańskiego i podcastów 24/7: https://polskieradio.cc
📖 Czytaj Pismo Święte z kodami interlinearnymi: https://polskieradio.cc/mojabiblia
🎵 Odtwarzacz audio Christian Culture: https://polskieradio.cc/player
📚 Akademia Biblijna i Kurs Codzienny: https://polskieradio.cc/akademia
👥 Społeczność chrześcijańska LUMINA: https://polskieradio.cc/lumina
🎬 Filmy i wykłady wideo VOD: https://polskieradio.cc/vod`;

const channelsConfig = [
  {
    fileName: 'meta_1_cctv.json',
    channelName: 'Christian Culture TV',
    channelId: 'UCG5Y4dwJi5436Gu6QH3nNUQ',
    thumbnailPath: path.join(outDir, 'miniaturka_5_koniec_laski.jpg'),
    title: 'Koniec Czasu Łaski! Nikt nie mógł wejść do Świątyni (Apokalipsa 15) | Wykład biblijny',
    lead: `Co zwiastuje dym wypełniający świątynię w niebie tuż przed wylaniem siedmiu plag ostatecznych? „I napełniła się świątynia dymem od chwały Boga i jego mocy. I nikt nie mógł wejść do świątyni, dopóki nie dopełniło się siedem plag siedmiu aniołów” (Objawienie 15:8, UBG).

W tym odcinku wykładowca Wincenty Sieja oraz Mariusz Adamczyk (Studio Dobrego Słowa / Christian Culture TV) odkrywają prorocze znaczenie 15. rozdziału Apokalipsy:
• Zakończenie służby orędowniczej Chrystusa i biblijny sens Dnia Pojednania (Jom Kipur).
• Hebrajskie pojęcie „Ne'ila” – zamknięcie bram i zapieczętowanie ludzkich losów.
• Dlaczego wezwanie z Listu do Hebrajczyków 4:16 („Przystąpmy z ufnością do tronu łaski”) jest kluczowe WŁAŚNIE TERAZ, dopóki trwa stosowna chwila?`,
    tags: ['Apokalipsa 15', 'Koniec czasu łaski', 'Wstęp do plag', 'Wincenty Sieja', 'Mariusz Adamczyk', 'Studio Dobrego Słowa', 'Christian Culture TV', 'Dym w świątyni', 'Sąd Ostateczny', 'Proroctwa biblijne', 'Jom Kipur', 'Zapieczętowanie']
  },
  {
    fileName: 'meta_2_prcc.json',
    channelName: 'Polskie Radio CHRISTIAN CULTURE',
    channelId: 'UCNnCdsJ-K6FXulZzXZHWkjQ',
    thumbnailPath: path.join(outDir, 'miniaturka_1_7_plag_poczatek.jpg'),
    title: 'Apokalipsa 15 – 7 PLAG: POCZĄTEK. Kiedy zamkną się drzwi świątyni? (Odc. 33)',
    lead: `Oficjalna 33. część serii „Apokalipsa: Księga Nadziei” na antenie Polskiego Radia Christian Culture. Po studium rozdziałów 17 i 18 wracamy do 15. rozdziału Księgi Objawienia – uroczystego wstępu do ostatecznych plag.

Wykładowca Wincenty Sieja w rozmowie z Mariuszem Adamczykiem wyjaśnia:
• Konstrukcję proroctw siódemkowych w Apokalipsie i ich zbieżność przy powtórnym przyjściu Chrystusa.
• Czas dokonany w proroctwie: dlaczego napisano „zakończył się gniew Boży”, zanim jeszcze spadła pierwsza plaga?
• Spojrzenie na Boga ponad czasem: Boża wszechwiedza bez determinizmu i predestynacji – człowiek zawsze posiada wolną wolę wyboru.`,
    tags: ['Apokalipsa 15', '7 Plag początek', 'Księga Nadziei', 'Polskie Radio Christian Culture', 'Wincenty Sieja', 'Mariusz Adamczyk', 'Studio Dobrego Słowa', 'Proroctwa siódemkowe', 'Czas łaski', 'Sąd Boży', 'Biblia UBG']
  },
  {
    fileName: 'meta_3_biblia_audio.json',
    channelName: 'Biblia Audio Christian Culture',
    channelId: 'UCCqHRCEuSDhlRcvcQ6qM1Kw',
    thumbnailPath: path.join(outDir, 'miniaturka_2_sad_ostateczny.jpg'),
    title: 'Sąd Ostateczny i Morze Szklane zmieszane z ogniem | Studium Apokalipsy 15 (UBG)',
    lead: `Głębokie studium Pisma Świętego (Objawienie 15:1–8 wg Uwspółcześnionej Biblii Gdańskiej - UBG). 

Zanim niebo napełni się dymem Bożego gniewu, Jan widzi zachwycającą scenę: morze szklane zmieszane z ogniem oraz stojących nad nim zwycięzców trzymających harfy Boże:
• Kim są zwycięzcy i dlaczego śpiewają zarówno Pieśń Mojżesza (ocalenie nad Morzem Czerwonym), jak i Pieśń Baranka (zwycięstwo przez krzyż)?
• Piec ognisty rozpalony siedem razy bardziej (Księga Daniela 3 i 12:1) jako zapowiedź ostatecznej próby i cudownej Bożej ochrony.
• Studium werset po wersecie prowadzą Wincenty Sieja i Mariusz Adamczyk.`,
    tags: ['Apokalipsa 15', 'Sąd Ostateczny', 'Morze szklane', 'Biblia Audio', 'Christian Culture', 'Wincenty Sieja', 'Pieśń Mojżesza', 'Pieśń Baranka', '144 tysiące', 'Studium biblijne', 'UBG', 'Pismo Święte']
  },
  {
    fileName: 'meta_4_werset_dnia.json',
    channelName: 'Werset Dnia - Chrześcijański Serwis Biblijny',
    channelId: 'UCyOvW5DuDLVq5XWFyijgtbw',
    thumbnailPath: path.join(outDir, 'miniaturka_3_7_ostatnich_plag.jpg'),
    title: '7 Ostatnich Plag – „Dopełnił się gniew Boga” (Apokalipsa 15:1) | Proroctwa siódemkowe',
    lead: `Analiza kluczowego wersetu: „I zobaczyłem inny znak na niebie, wielki i zadziwiający: siedmiu aniołów, którzy mieli siedem plag ostatecznych, bo przez nie dopełnił się gniew Boga” (Objawienie 15:1, UBG).

W tym materiale:
• Dlaczego biblijny prorok jest nazywany „widzącym” (widzi finał wydarzeń w czasie dokonanym) i czym różni się to od ludzkich prognoz i wróżb?
• Siedem złotych czasz pełnych gniewu Boga żyjącego na wieki wieków.
• Jak przygotować swoje serce na czas ostatecznych wydarzeń? Wykład Wincentego Siei i Mariusza Adamczyka w Chrześcijańskim Serwisie Biblijnym Werset Dnia.`,
    tags: ['Apokalipsa 15:1', '7 ostatnich plag', 'Werset Dnia', 'Chrześcijański Serwis Biblijny', 'Wincenty Sieja', 'Mariusz Adamczyk', 'Czasze gniewu', 'Gniew Boży', 'Proroctwo', 'Biblia', 'UBG', 'Czas ostateczny']
  },
  {
    fileName: 'meta_5_cc_men.json',
    channelName: 'CC Men',
    channelId: 'UCUpuq9JS7jitIcm9iBn0jnA',
    thumbnailPath: path.join(outDir, 'miniaturka_4_czara_gniewu.jpg'),
    title: 'Apokalipsa 15: Czara Gniewu i Przybytek Świadectwa | Ostateczna próba wierności',
    lead: `Męskie, bezkompromisowe studium wierności Bogu w czasach ostatecznych. Objawienie 15:5 mówi: „Potem zobaczyłem, a oto została otwarta świątynia Przybytku Świadectwa w niebie”.

Wincenty Sieja i Mariusz Adamczyk odpowiadają na kluczowe pytania wiary:
• Dlaczego Pismo Święte aż 59 razy łączy słowo „Świadectwo” z Arką Przymierza i dwiema kamiennymi tablicami Dekalogu (Wj 25:16; 31:18)?
• Finałowa konfrontacja lojalności: zachowywanie przykazań Bożych i wiary Jezusa (Apokalipsa 12:17; 14:12) w obliczu czary gniewu.
• Jak być wiernym i niezłomnym mężem Bożym, gdy zamykają się drzwi niebiańskiej świątyni?`,
    tags: ['Apokalipsa 15', 'Czara gniewu', 'CC Men', 'Mężczyźni wiary', 'Wincenty Sieja', 'Mariusz Adamczyk', 'Przybytek Świadectwa', 'Dekalog', 'Próba wierności', 'Arka Przymierza', 'Czas ostateczny', 'Christian Culture']
  }
];

for (const ch of channelsConfig) {
  const fullDescription = `${ch.lead}

👥 PROWADZĄCY I PRODUKCJA:
• Wykładowca biblijny: Wincenty Sieja (Studio Dobrego Słowa)
• Prowadzący rozmowę / Gospodarz: Mariusz Adamczyk (Studio Dobrego Słowa)
• Seria: Apokalipsa – Księga Nadziei (Odc. 33: Wstęp do plag)

⏱️ ZNACZNIKI CZASU (ROZDZIAŁY):
${commonTimestamps}

${commonLinks}

#Apokalipsa #Apokalipsa15 #WstępDoPlag #KsięgaNadziei #WincentySieja #MariuszAdamczyk #StudioDobregoSłowa #ChristianCulture #SiedemPlag #CzasŁaski #MorzeSzklane #Dekalog #ProroctwaBiblijne`;

  const metaData = {
    title: ch.title,
    channelName: ch.channelName,
    channelId: ch.channelId,
    thumbnailPath: ch.thumbnailPath,
    description: fullDescription,
    tags: ch.tags,
    videoLanguage: 'pl',
    titleDescriptionLanguage: 'pl'
  };

  const filePath = path.join(outDir, ch.fileName);
  fs.writeFileSync(filePath, JSON.stringify(metaData, null, 2), 'utf8');
  console.log('Zapisano metadane dla:', ch.channelName, '->', filePath);
}
