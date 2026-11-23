import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageEkoccArticle } from './package-ekocc-article.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export const articleData = {
  portal: 'em',
  type: 'MOTYWACJA eM',
  title: 'Miłość do bliźniego w praktyce: jeden telefon, który może zmienić dzień',
  slug: 'milosc-do-blizniego-w-praktyce-jeden-telefon-ktory-moze-zmienic-dzien',
  author: 'Cezary Rogowski',
  date: '2026-11-23',
  lead: 'W świecie błyskawicznych komunikatorów i zdawkowych reakcji emotikoną coraz rzadziej wybieramy numer, by po prostu usłyszeć czyjś głos. Z obawy przed niezręcznością lub zakłóceniem cudzego spokoju odkładamy rozmowę na „lepszy moment”, który często nie nadchodzi tygodniami. Tymczasem recenzowane badania z psychologii społecznej pokazują, że niespodziewany telefon buduje głębszą więź i przynosi odbiorcy znacznie więcej radości, niż przypuszczamy — a Pismo Święte w przypowieści o miłosiernym Samarytaninie (Łk 10:25–37 UBG) przypomina, że miłość bliźniego zaczyna się od przekroczenia dystansu.',
  sections: [
    {
      heading: '1. CYFROWE „WIDZĘ CIĘ” KONTRA GŁOS DRUGIEGO CZŁOWIEKA',
      paragraphs: [
        'Większość codziennych kontaktów przeniosła się dziś do krótkich wiadomości tekstowych, grup w komunikatorach i szybkich kliknięć pod zdjęciami znajomych. Taki sposób wymiany informacji jest wygodny przy ustalaniu zakupów albo godziny spotkania, lecz ma swoją ukrytą cenę: łatwo daje złudzenie bycia w relacji, podczas gdy druga osoba od tygodni nie słyszała życzliwego ludzkiego głosu.',
        'Wiele osób powstrzymuje się przed wykonaniem telefonu nie z braku życzliwości, ale z lęku przed byciem natrętnym. Pojawia się wewnętrzny opór: „pewnie jest zajęty”, „nie wiem, od czego zacząć po tylu miesiącach ciszy”, „napiszę krótką wiadomość, będzie bezpieczniej”. Ten pozornie uprzejmy kompromis sprawia, że w trudniejszych, jesienno-zimowych tygodniach osoby starsze, samotni rodzice czy zapracowani znajomi zostają z ciężarem dnia całkowicie sami.',
        'Aby uniknąć ogólników i powierzchownych haseł motywacyjnych, rozdzielmy dwie płaszczyzny odpowiedzi: najpierw spójrzmy na twarde ustalenia empiryczne z psychologii relacji i badań nad zdrowiem publicznym, a następnie przejdźmy do wyraźnie wyodrębnionej egzegezy biblijnej.'
      ]
    },
    {
      heading: '2. FAKTY NAUKOWE: DLACZEGO BOIMY SIĘ ZADZWONIĆ I JAK BARDZO TO POMAGA?',
      paragraphs: [
        'Psycholodzy eksperymentalni precyzyjnie zbadali powód, dla którego tak chętnie wybieramy tekst zamiast rozmowy głosowej. W pracy „It’s Surprisingly Nice to Hear You: Misunderstanding the Impact of Communication Media Can Lead to Suboptimal Choices of How to Connect With Others” („Journal of Experimental Psychology: General”, 2021, t. 150, nr 3, s. 595–607; DOI: 10.1037/xge0000962) Amit Kumar i Nicholas Epley poprosili uczestników w badaniu terenowym o ponowne nawiązanie kontaktu z dawnym znajomym za pomocą wiadomości e-mail lub rozmowy telefonicznej. Przed kontaktem uczestnicy zakładali, że rozmowa telefoniczna będzie wyraźnie bardziej niezręczna. W rzeczywistości połączenie głosowe przyniosło znacznie silniejsze poczucie więzi i bliskości, a poziom niezręczności wcale nie był wyższy niż przy pisaniu tekstu.',
        'Drugi ważny mechanizm opisali Peggy J. Liu, SoYon Rim, Lauren Min oraz Kate E. Min w artykule „The Surprise of Reaching Out: Appreciated More Than We Think” („Journal of Personality and Social Psychology”, publikacja online 2022, wyd. drukowane 2023; DOI: 10.1037/pspi0000402). W serii 13 prerejestrowanych eksperymentów z udziałem niemal 5900 uczestników badacze wykazali, że inicjatorzy kontaktu systematycznie zaniżają to, jak bardzo odbiorcy docenią krótki gest pamięci. Co szczególnie istotne, różnica między obawami nadawcy a wdzięcznością odbiorcy była największa właśnie w przypadku tzw. słabszych więzi — czyli osób, z którymi dawno nie rozmawialiśmy. Element życzliwego zaskoczenia sprawiał, że pamięć o drugim człowieku odbierana była jako wyjątkowo cenna.',
        'Znaczenie codziennych więzi wykracza daleko poza chwilową poprawę nastroju. W klasycznej metaanalizie Julianne Holt-Lunstad, Timothy’ego B. Smitha i J. Bradleya Laytona „Social Relationships and Mortality Risk: A Meta-analytic Review” („PLoS Medicine”, 2010, t. 7, nr 7, e1000316; DOI: 10.1371/journal.pmed.1000316), obejmującej 148 badań i ponad 308 tysięcy uczestników, silniejsze i bardziej zintegrowane relacje społeczne wiązały się z o 50 procent wyższym prawdopodobieństwem przeżycia w porównaniu ze słabymi więziami (iloraz szans OR = 1,50). Utrzymywanie żywego kontaktu nie jest więc wyłącznie grzecznością towarzyską, lecz realnym czynnikiem chroniącym ludzkie zdrowie i odporność psychiczną.'
      ]
    },
    {
      heading: '3. KOMENTARZ TEOLOGICZNY I EGZEGEZA: „KTO JEST MOIM BLIŹNIM?” (ŁK 10:25–37 UBG)',
      paragraphs: [
        'Przechodząc od badań naukowych do refleksji teologicznej, otwieramy Ewangelię według św. Łukasza. Jej autor — lekarz i towarzysz podróży misyjnych apostoła Pawła — zaznacza we wstępie (Łk 1:1–4 UBG), że dokładnie zbadał wszystkie wydarzenia od początku i spisał je po kolei dla Teofila, aby ukazać pewność nauki Chrystusa. W strukturze literackiej tej Ewangelii rozdział 10 należy do tzw. sekcji podróży Jezusa do Jerozolimy (Łk 9:51–19:27), w której Zbawiciel szczególnie mocno akcentuje troskę o wykluczonych, słuchanie Jego słowa i praktyczne miłosierdzie.',
        'W Łk 10:25–29 (UBG) znawca prawa pyta Jezusa o warunek odziedziczenia życia wiecznego, a po przytoczeniu przykazania miłości Boga i bliźniego dopytuje, chcąc się usprawiedliwić: „A kto jest moim bliźnim?” (Łk 10:29 UBG). W odpowiedzi Chrystus opowiada o człowieku schodzącym z Jerozolimy do Jerycha — stromym, liczącym blisko dwadzieścia kilka kilometrów górskim traktem przez pustynię Judzką, znanym w I wieku z zasadzek rabusiów. W tym samym Jerychu mieszkało wielu kapłanów i lewitów pełniących służbę w świątyni. Zarówno kapłan, jak i lewita „zobaczył go i ominął” (Łk 10:31–32 UBG). Dopiero pogardzany w tamtych realiach Samarytanin nie przeszedł na drugą stronę drogi: „Lecz pewien Samarytanin, będąc w podróży, zbliżył się do niego. A gdy go zobaczył, ulitował się nad nim” (Łk 10:33 UBG).',
        'Greckie słownictwo tego fragmentu odsłania sedno biblijnej postawy. Czasownik σπλαγχνίζομαι (splanchnizomai, Strong G4697 — „ulitował się”) oznacza głębokie, poruszające całe wnętrze współczucie, które nie zatrzymuje się na westchnieniu, ale natychmiast przechodzi w działanie: opatrzenie ran, poświęcenie czasu i środków (Łk 10:34–35 UBG). Z kolei rzeczownik πλησίον (plēsion, Strong G4139 — „bliźni”) dosłownie wskazuje na tego, kto znajduje się blisko, w zasięgu naszego spotkania. Na końcu Jezus odwraca pytanie prawnika: nie pytaj, kto zasługuje na miano twojego bliźniego, lecz sam stań się bliźnim dla tego, kto leży na twojej drodze — okazując mu miłosierdzie, ἔλεος (eleos, Strong G1656), a następnie wzywając: „Idź i ty czyń podobnie” (Łk 10:37 UBG).'
      ]
    },
    {
      heading: '4. DOBRE SŁOWO JAKO NARZĘDZIE ŁASKI, WIARY I ODPOWIEDZIALNOŚCI',
      paragraphs: [
        'Już w mądrościowej literaturze Starego Testamentu Pismo Święte realistycznie opisuje ciężar ludzkiego przygnębienia i uzdrawiającą moc życzliwej mowy. W Księdze Przysłów Salomon zapisał dwie krótkie, a niezwykle trafne obserwacje psychologiczne i duchowe: „Troska w sercu człowieka przygnębia je, a dobre słowo je rozwesela” (Prz 12:25 UBG) oraz „Miłe słowa są jak plaster miodu, słodycz dla duszy i lekarstwo dla kości” (Prz 16:24 UBG). Zwykła rozmowa, w której ktoś naprawdę słucha i niesie pokój zamiast pospiesznych pouczeń, staje się realnym narzędziem Bożego pokrzepienia.',
        'W Nowym Testamencie ta sama wrażliwość otrzymuje wspólnotowy wymiar odpowiedzialności. Apostoł Paweł wzywa zbór w Tesalonice: „Dlatego zachęcajcie jedni drugich i budujcie się wzajemnie, jak to zresztą czynicie” (1 Tes 5:11 UBG). Grecki czasownik παρακαλέω (parakaleō, Strong G3870 — „zachęcajcie”) składa się z przedrostka „obok” i czasownika „wołać”; oznacza przywołanie kogoś do swojego boku, by dodać mu otuchy i stanąć przy nim w trudnej próbie. Podobnie w Liście do Galacjan czytamy: „Jedni drugich brzemiona noście, a tak wypełniajcie prawo Chrystusa” (Ga 6:2 UBG) oraz „Dlatego więc, dopóki mamy czas, czyńmy dobrze wszystkim, a zwłaszcza domownikom wiary” (Ga 6:10 UBG). Apostoł Jakub dodaje zaś trzeźwą przestrogę przed pustą deklaracją bez czynu: jeśli ograniczamy miłość do grzecznościowego „Idźcie w pokoju, ogrzejcie się i najedzcie” bez realnego wsparcia, „wiara, jeśli nie ma uczynków, martwa jest sama w sobie” (Jk 2:16–17 UBG).',
        'Zgodnie z 28 Zasadami Wiary Kościoła Bożego (szczególnie Zasadą 10 o zbawieniu z łaski przez wiarę, Zasadą 14 o jedności w Chrystusie i Zasadą 22 o chrześcijańskim życiu) pamiętajmy o właściwym porządku Ewangelii. Telefon do samotnego znajomego czy starszego członka rodziny nie jest biletem do nieba ani sposobem na spłatę długu przed Bogiem: „Łaską bowiem jesteście zbawieni przez wiarę, i to nie jest z was, jest to dar Boga. Nie z uczynków, aby nikt się nie chlubił” (Ef 2:8–9 UBG). Jesteśmy jednak „stworzeni w Chrystusie Jezusie do dobrych uczynków, które Bóg wcześniej przygotował, abyśmy w nich postępowali” (Ef 2:10 UBG). Kto sam doświadczył przyjęcia przez Boga bez zasługi, ma siłę zadzwonić do drugiego człowieka nie z poczucia przymusu, ale z wolności i wdzięczności.'
      ]
    },
    {
      heading: '5. JAK ZADZWONIĆ BEZ NIEZRĘCZNOŚCI? CZTERY PROSTE ZASADY MĄDREJ ROZMOWY',
      paragraphs: [
        'Skoro wiemy z badań (Kumar i Epley, 2021; Liu i in., 2022), że obawa przed niezręcznością bywa znacznie większa w naszej głowie niż w rzeczywistości, warto przygotować sobie prostą, pełną szacunku strukturę rozmowy. Dzięki niej nie poczujesz się jak intruz, a rozmówca nie poczuje się przesłuchiwany.',
        'Po pierwsze, zacznij od szczerości i uszanuj czas drugiej osoby. Zamiast udawać, że nie minęło wiele miesięcy, powiedz wprost: „Pomyślałem dziś o Tobie, dawno nie rozmawialiśmy i chciałem po prostu usłyszeć Twój głos. Czy masz teraz trzy minuty, czy oddzwonić innym razem?”. Takie otwarcie natychmiast zdejmuje presję z obu stron.',
        'Po drugie, pytaj krótko i słuchaj uważniej, niż mówisz. Nie wchodź w rolę terapeuty ani sędziego, nie diagnozuj cudzych problemów i nie zasypuj rozmówcy natychmiastowymi radami. Często największą ulgą dla człowieka obciążonego pracą, chorobą lub samotnością jest świadomość, że ktoś po drugiej stronie słuchawki naprawdę słucha bez pośpiechu i bez przerywania.',
        'Po trzecie, jeśli rozmówca przeżywa trudny czas, zaproponuj konkret zamiast ogólnika „jakby co, to dzwoń”. Lepiej zapytać: „Czy mogę przywieźć Ci jutro zakupy?” albo „Czy możemy w piątek o osiemnastej porozmawiać jeszcze chwilę lub wspólnie się pomodlić?”. Po czwarte, jeśli czujesz pokój i druga strona jest na to otwarta, krótka, serdeczna modlitwa wprost przez telefon albo obietnica pamięci w modlitwie potrafi wnieść w zwykły dzień głębokie światło.'
      ]
    },
    {
      heading: '6. PIĘĆ KROKÓW DO TELEFONU ŻYCZLIWOŚCI W TYM TYGODNIU: PRZEWODNIK eM',
      paragraphs: [
        'Nie czekaj na idealny nastrój ani okrągłą rocznicę. Dobro, które ma przynieść ulgę, potrzebuje małej, konkretnej decyzji w ciągu najbliższych dwudziestu czterech godzin. Oto pięć prostych kroków przygotowanych przez redakcję eM Christian Culture:',
        '1. Wybierz dziś jedną osobę z książki telefonicznej, o której ostatnio pomyślałeś z niepokojem lub wdzięcznością — starszego krewnego, dawnego znajomego, sąsiada po stracie bliskiej osoby albo kogoś ze wspólnoty, kto dawno zamilkł.',
        '2. Zamiast kolejnego komunikatu tekstowego naciśnij zieloną słuchawkę (Kumar i Epley, 2021). Nawet pięciominutowa rozmowa głosowa przekazuje ciepło, ton troski i obecność, których nie zastąpi żadna ikona.',
        '3. Jeśli po drugiej stronie nikt nie odbiera, zostaw krótką, spokojną wiadomość głosową lub SMS z informacją, że nie dzwonisz z problemem, lecz z życzliwą pamięcią — i nie wymagasz natychmiastowego oddzwonienia.',
        '4. Zapisz w kalendarzu prosty cotygodniowy nawyk „jednego telefonu w poniedziałek lub piątek”. Systematyczna troska o jedną osobę tygodniowo w skali roku oznacza ponad pięćdziesiąt realnych spotkań z drugim człowiekiem (Ga 6:9–10 UBG).',
        '5. Zakończ rozmowę wdzięcznością i krótką modlitwą za rozmówcę. Proś Boga o wrażliwe serce i oczy, które nie omijają nikogo po drugiej stronie drogi (Łk 10:33–37 UBG).'
      ]
    }
  ],
  conclusion: 'Miłość do bliźniego rzadko wymaga wielkich przemówień i spektakularnych akcji; najczęściej zaczyna się od odwagi, by przerwać ciszę i poświęcić kilka minut uważnej obecności. Współczesna psychologia potwierdza (Kumar i Epley, 2021; Liu i in., 2022; Holt-Lunstad i in., 2010), że ludzki głos i niespodziewana pamięć budują więź silniej, niż podpowiadają nasze obawy przed niezręcznością. Pismo Święte wzywa nas z kolei do współczującego przekraczania dystansu (Łk 10:25–37 UBG), niesienia dobrego słowa (Prz 12:25 UBG) i budowania siebie nawzajem z wolności płynącej z Bożej łaski (Ef 2:8–10; 1 Tes 5:11 UBG). Jeden szczery telefon jeszcze dziś może stać się dla kogoś odpowiedzią na cichą modlitwę.',
  cta: 'Zanim skończy się dzisiejszy dzień, zatrzymaj się na chwilę i zadzwoń do jednej osoby, której głos dawno nie wybrzmiał w Twoim telefonie — nie po to, by coś załatwić, lecz by zapytać z troską: „Jak się naprawdę masz?”. Jeśli chcesz wesprzeć codzienną służbę słowa i budowania wspólnoty w ekosystemie Christian Culture, pamiętaj o nas w modlitwie i przekaż ten artykuł komuś, kogo warto dziś zachęcić.\n\n„Panie Boże, dziękujemy Ci za Twoją wierną miłość i za to, że w Jezusie Chrystusie pierwszy przybliżyłeś się do nas, gdy sami nie mieliśmy sił. Przełam w nas lęk przed niezręcznością, pośpiech i obojętność. Otwórz nasze serca na ludzi obok nas — szczególnie na tych, którzy dziś zmagają się z ciszą i zniechęceniem. Naucz nas słuchać z cierpliwością i nieść dobre słowo, które umacnia i prowadzi do Ciebie. Amen.”\n\n[Status redakcyjny: Do autoryzacji autora i akceptacji wydawcy — Bramka bezpieczeństwa T4 (L0). Slot kalendarza 365 EkoCC: lp. 20 (2026-11-23, Dział eM, Priorytet B). Proponowany URL publikacji po zatwierdzeniu L0: https://polskieradio.cc/news/milosc-do-blizniego-w-praktyce-jeden-telefon-ktory-moze-zmienic-dzien]',
  sources: [
    {
      name: 'Kumar A., Epley N. — „It’s Surprisingly Nice to Hear You: Misunderstanding the Impact of Communication Media Can Lead to Suboptimal Choices of How to Connect With Others”, Journal of Experimental Psychology: General, 2021, Vol. 150, No. 3, s. 595–607',
      url: 'https://doi.org/10.1037/xge0000962'
    },
    {
      name: 'Liu P. J., Rim S., Min L., Min K. E. — „The Surprise of Reaching Out: Appreciated More Than We Think”, Journal of Personality and Social Psychology, 2022/2023',
      url: 'https://doi.org/10.1037/pspi0000402'
    },
    {
      name: 'Holt-Lunstad J., Smith T. B., Layton J. B. — „Social Relationships and Mortality Risk: A Meta-analytic Review”, PLoS Medicine, 2010, Vol. 7, No. 7, e1000316',
      url: 'https://doi.org/10.1371/journal.pmed.1000316'
    },
    {
      name: 'Uwspółcześniona Biblia Gdańska (UBG) — Ewangelia według św. Łukasza 1:1–4; 10:25–37; Księga Przysłów 12:25; 16:24; List do Galacjan 6:2, 9–10; List do Efezjan 2:8–10; 1 List do Tesaloniczan 5:11; List św. Jakuba 2:14–17',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: 'Strong’s Greek Concordance (słownik interlinearny MojaBiblia CC) — Hasła: G4697 (splanchnizomai — ulitować się), G4139 (plēsion — bliźni), G1656 (eleos — miłosierdzie), G3870 (parakaleō — zachęcać, pocieszać)',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: '28 Zasad Wiary Kościoła Bożego — Zasady 10 (Zbawienie z łaski przez wiarę), 14 (Jedność w Chrystusie) oraz 22 (Chrześcijańskie życie)',
      url: 'https://polskieradio.cc'
    }
  ],
  scripture: 'Ewangelia według św. Łukasza 10:25–37 („Który z tych trzech, twoim zdaniem, był bliźnim... Ten, który okazał mu miłosierdzie. Wtedy Jezus mu powiedział: Idź i ty czyń podobnie”); Księga Przysłów 12:25; 16:24; 1 List do Tesaloniczan 5:11; List do Galacjan 6:2, 9–10; List św. Jakuba 2:14–17; List do Efezjan 2:8–10 (UBG)',
  imagePath: path.join(ROOT, 'images/em/art-milosc-do-blizniego-jeden-telefon.jpg'),
  imageCaption: 'Ilustracja AI (poglądowa, nieprzedstawiająca konkretnego wydarzenia): Osoba przy drewnianym stole w naturalnym porannym świetle wpadającym przez okno, skupiona i życzliwa podczas spokojnej rozmowy telefonicznej z kubkiem ciepłej herbaty obok — symbol uważnej obecności i praktycznej miłości bliźniego.',
  tags: [
    '@CezaryRogowski',
    '@ChristianCulture',
    '@eM',
    '@MojaBiblia',
    '#MiloscBlizniego',
    '#JedenTelefon',
    '#MilosiernySamarytanin',
    '#MotywacjaeM',
    '#EkoCC',
    '#EkoCC365',
    '#BibliaUBG'
  ],
  seo: {
    title: 'Miłość do bliźniego w praktyce: jeden telefon, który pomaga',
    description: 'Badania (Kumar i Epley 2021, Liu i in. 2022) oraz egzegeza UBG (Łk 10:25-37, Prz 12:25): dlaczego zwykły telefon buduje więź i jak kochać czynem.',
    keywords: [
      'milosc do blizniego w praktyce',
      'jeden telefon ktory moze zmienic dzien',
      'Kumar Epley telefon rozmowa glosowa badania',
      'Peggy Liu surprise of reaching out badania',
      'milosierny Samarytanin Lukasza 10 egzegeza',
      'Przyslow 12:25 dobre slowo',
      '1 Tesaloniczan 5:11 zachecajcie jedni drugich',
      'Cezary Rogowski eM Christian Culture',
      'EkoCC Motywacja'
    ]
  }
};

async function main() {
  console.log('🚀 Przygotowanie pakietu redakcyjnego EkoCC (Slot 20: 2026-11-23 — eM)...');
  console.log('Tytuł:', articleData.title);
  console.log('Meta title length:', articleData.seo.title.length, '| Meta description length:', articleData.seo.description.length);
  console.log('Dział kalendarza: eM | Priorytet: B | Portal pakietu:', articleData.portal);
  console.log('Slug:', articleData.slug);

  if (!fs.existsSync(articleData.imagePath)) {
    throw new Error(`Brak pliku grafiki pod ścieżką: ${articleData.imagePath}`);
  }

  const jsonPath = path.join(ROOT, 'scripts/article-lp20-em-2026-11-23.json');
  fs.writeFileSync(jsonPath, JSON.stringify(articleData, null, 2), 'utf8');
  console.log(`💾 Zapisano dane artykułu: ${jsonPath}`);

  const desktopOut = 'C:\\Users\\czark\\Desktop';
  const driveOut = 'H:\\Mój dysk\\OA - orkiestracja Agentowa\\produkowane przez Agentów';

  const result = await packageEkoccArticle(articleData, desktopOut);

  if (fs.existsSync(driveOut)) {
    fs.copyFileSync(result.zipPath, path.join(driveOut, path.basename(result.zipPath)));
    fs.copyFileSync(result.docxPath, path.join(driveOut, path.basename(result.docxPath)));
    console.log(`☁️ Skopiowano pakiet ZIP i DOCX na Google Drive: ${driveOut}`);
  } else {
    console.warn(`⚠️ Katalog Google Drive niedostępny: ${driveOut}`);
  }

  console.log('\n============================================================');
  console.log('🎉 PAKIET ARTYKUŁU EkoCC PRZYGOTOWANY POMYŚLNIE!');
  console.log('Status: Do autoryzacji autora i akceptacji wydawcy (Bramka T4 / L0)');
  console.log('============================================================');
  console.log('📦 Plik ZIP (Pulpit):', result.zipPath);
  console.log('📄 Plik DOCX (Pulpit):', result.docxPath);
  console.log('📝 Plik TXT:', result.txtPath);
  console.log('🔍 Plik SEO:', result.seoPath);
  console.log('============================================================\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('❌ Błąd przygotowania pakietu:', err);
    process.exit(1);
  });
}
