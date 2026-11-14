#!/usr/bin/env node
/**
 * scripts/youtube_external_promoter.mjs
 * Zewnętrzny system automatycznej promocji kanałów YouTube ekosystemu Christian Culture.
 * Przygotowany pod pozyskiwanie nowych odbiorców poza ekosystemem (X / Twitter, FB, IG/TikTok Reels, WhatsApp).
 * Obsługuje rotację Round-Robin 2x dziennie (10:00 i 18:00 CET).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const STATE_FILE = path.join(ROOT, 'data/yt_external_promotion_state.json');

export const EXTERNAL_YT_CHANNELS = [
  {
    id: 'cctv',
    name: 'Christian Culture TV',
    handle: '@ChristianCultureTV',
    url: 'https://www.youtube.com/@ChristianCultureTV',
    targetAudience: 'Osoby poszukujące prawdy, zniechęcone powierzchowną religijnością lub sensacją',
    hook: 'Czy współczesny świat zmierza dokładnie tam, gdzie zapowiadały starożytne proroctwa?',
    xPost: `🎥 Czy współczesny świat zmierza tam, gdzie zapowiadały starożytne proroctwa?\n\nOdkryj rzetelne serie dokumentalne, analizy proroctw i wykłady biblijne bez kompromisów na kanale Christian Culture TV.\n\n🔴 Oglądaj na YouTube:\nhttps://www.youtube.com/@ChristianCultureTV\n\n#Biblia #Historia #Proroctwa #Ewangelia #Prawda #WykładyBiblijne`,
    fbPost: `Zamiast medialnego chaosu i domysłów — poznaj fakty oparte na Słowie Bożym i historii. Na kanale Christian Culture TV publikujemy pełnometrażowe wykłady i dokumenty, które otwierają oczy na to, w jakim punkcie historii żyjemy.\n\n👉 Dołącz do społeczności widzów na YouTube: https://www.youtube.com/@ChristianCultureTV`,
    shortsHook: '3 proroctwa biblijne, które wypełniają się na naszych oczach. Cały dokument na kanale Christian Culture TV na YouTube!',
    hashtags: ['#Biblia', '#Proroctwa', '#Historia', '#Chrześcijaństwo', '#Prawda', '#Dokument']
  },
  {
    id: 'osobowosc_plus',
    name: 'Osobowość + (Studio Dobrego Słowa)',
    handle: '@osobowoscPLUS',
    url: 'https://www.youtube.com/@osobowoscPLUS',
    targetAudience: 'Przedsiębiorcy, ambitni liderzy, osoby zmagające się ze stresem i poszukujące siły ducha',
    hook: 'Jak zachować niezłomny spokój i wygrywać w czasach totalnego chaosu?',
    xPost: `💡 Sukces bez Bożego fundamentu prowadzi do wypalenia. Odkryj serię Apokalipsa w 4K, biblijną psychologię odporności i rozwój silnego charakteru na kanale Osobowość +!\n\n🔴 Subskrybuj teraz:\nhttps://www.youtube.com/@osobowoscPLUS\n\n#RozwójOsobisty #OsobowośćPlus #Apokalipsa #Motywacja #SiłaDucha #Przywództwo`,
    fbPost: `Prawdziwy sukces zaczyna się od porządku w sercu i myśleniu. Kanał Osobowość + (Studio Dobrego Słowa) łączy głębię Księgi Apokalipsy z praktycznymi narzędziami zwycięskiego życia i ochrony rodziny.\n\n👉 Zobacz wykłady w 4K na YouTube: https://www.youtube.com/@osobowoscPLUS`,
    shortsHook: 'Jedna biblijna zasada, która natychmiast eliminuje lęk przed przyszłością. Sprawdź wykłady na kanale Osobowość + na YouTube!',
    hashtags: ['#OsobowośćPlus', '#RozwójOsobisty', '#Sukces', '#Apokalipsa', '#Psychologia', '#Wiara']
  },
  {
    id: 'radio_cc',
    name: 'Polskie Radio Christian Culture',
    handle: '@RadioChristianCulture',
    url: 'https://www.youtube.com/@RadioChristianCulture',
    targetAudience: 'Miłośnicy dobrej muzyki z przesłaniem, kierowcy, pracownicy biurowi szukający spokoju',
    hook: 'Masz dość toksycznej papki w komercyjnych rozgłośniach?',
    xPost: `📻 Włącz dźwięki, które napełniają dom pokojem i nadzieją. Najpiękniejsza muzyka chrześcijańska, inspirujące wywiady i transmisje na żywo Polskiego Radia CC na YouTube!\n\n🔴 Słuchaj za darmo:\nhttps://www.youtube.com/@RadioChristianCulture\n\n#RadioChristianCulture #MuzykaChrześcijańska #RadioInternetowe #Uwielbienie #PokójBoży`,
    fbPost: `Szukasz stacji radiowej, którą możesz bez obaw włączyć przy dzieciach i w pracy? Polskie Radio Christian Culture na YouTube to muzyka, mądre audycje i przestrzeń wolna od wulgaryzmów i manipulacji.\n\n👉 Słuchaj audycji i premier na YouTube: https://www.youtube.com/@RadioChristianCulture`,
    shortsHook: 'Ten utwór zmienił atmosferę w tysiącach domów. Posłuchaj premier w Polskim Radiu Christian Culture na YouTube!',
    hashtags: ['#MuzykaChrześcijańska', '#PolskieRadioCC', '#DobraMuzyka', '#WorshipPL', '#Radio']
  },
  {
    id: 'biblia_audio',
    name: 'Biblia Audio CC',
    handle: '@bibliaaudiocc',
    url: 'https://www.youtube.com/@bibliaaudiocc',
    targetAudience: 'Osoby w podróży, biegacze, ludzie cierpiący na bezsenność, chcący poznać Pismo Święte',
    hook: 'Brakuje Ci czasu na czytanie Biblii? Pozwól, by Słowo mówiło do Ciebie w podróży i przed snem.',
    xPost: `📖 Zanurz się w czystym tekście Pisma Świętego. Profesjonalny głos lektorski, filmowa muzyka i głębia Słowa Bożego na kanale Biblia Audio CC!\n\n🔴 Słuchaj rozdziałów bezpłatnie:\nhttps://www.youtube.com/@bibliaaudiocc\n\n#BibliaAudio #PismoŚwięte #Audiobook #SłowoBoże #Wiara #Spokój`,
    fbPost: `„Wiara przychodzi ze słuchania”. Jeśli nie masz czasu usiąść do tekstu, włącz Biblię Audio CC w samochodzie, na treningu lub wieczorem przy zgaszonym świetle. Czysty tekst Pisma Świętego z profesjonalnym lektorem.\n\n👉 Słuchaj na YouTube: https://www.youtube.com/@bibliaaudiocc`,
    shortsHook: 'Posłuchaj tego fragmentu z Księgi Rodzaju w jakości filmowej. Całe rozdziały na kanale Biblia Audio CC na YouTube!',
    hashtags: ['#BibliaAudio', '#Audiobook', '#PismoŚwięte', '#Relaks', '#MedytacjaBiblijna']
  },
  {
    id: 'werset_dnia',
    name: 'Werset Dnia (ChSB)',
    handle: '@wersetdnia_ChSB',
    url: 'https://www.youtube.com/@wersetdnia_ChSB',
    targetAudience: 'Użytkownicy Shorts/Reels/TikTok szukający szybkiej dawki Bożej obietnicy każdego ranka',
    hook: 'Jedno zdanie z Biblii potrafi zatrzymać lawinę złych myśli i dać siłę na cały dzień.',
    xPost: `⚡ Jedno zdanie z Biblii potrafi odmienić Twój dzień. Codzienna obietnica z Pisma Świętego w nowoczesnym formacie na kanale Werset Dnia ChSB!\n\n🔴 Zobacz dzisiejsze słowo:\nhttps://www.youtube.com/@wersetdnia_ChSB\n\n#WersetDnia #SłowoNaDziś #CytatBiblijny #ObietniceBoże #ChSB #ShortsPolska`,
    fbPost: `Zacznij poranek od Bożej obietnicy zamiast od złych wiadomości z portali informacyjnych. Werset Dnia publikuje 60-sekundowe rozważania Słowa Bożego.\n\n👉 Zaobserwuj kanał na YouTube: https://www.youtube.com/@wersetdnia_ChSB`,
    shortsHook: 'To Słowo jest dzisiaj dla Ciebie, jeśli czujesz niepokój. Subskrybuj Werset Dnia na YouTube!',
    hashtags: ['#WersetDnia', '#Biblia', '#SłowoNaDziś', '#CytatDnia', '#MotywacjaBoża']
  },
  {
    id: 'cc_women',
    name: 'CC Women',
    handle: '@CCWomen7',
    url: 'https://www.youtube.com/@CCWomen7',
    targetAudience: 'Kobiety w każdym wieku zmęczone toksyczną presją mediów społecznościowych',
    hook: 'Przestań udowadniać światu swoją wartość. Bóg już określił, kim jesteś.',
    xPost: `🌸 Jesteś cenna w Bożych oczach. Przestrzeń biblijnego wzmocnienia dla kobiet: tożsamość, wiara, rodzina, emocje i modlitwa na kanale CC Women!\n\n🔴 Dołącz do nas:\nhttps://www.youtube.com/@CCWomen7\n\n#CCWomen #KobietaZWiarą #WartośćKobiety #KobietaChrześcijańska #Mama #ModlitwaKobiet`,
    fbPost: `Nie musisz być idealna, by być kochana i bezpieczna w Bożych rękach. Na kanale CC Women poruszamy tematy relacji, macierzyństwa, samotności i zdrowia emocjonalnego w oparciu o Pismo Święte.\n\n👉 Subskrybuj kanał dla kobiet na YouTube: https://www.youtube.com/@CCWomen7`,
    shortsHook: '3 rzeczy, które Bóg mówi o Twojej wartości, gdy świat próbuje Cię umniejszyć. Obejrzyj na CC Women na YouTube!',
    hashtags: ['#KobietaZWiarą', '#CCWomen', '#DlaKobiet', '#Relacje', '#BożaCórka']
  },
  {
    id: 'cc_men',
    name: 'CC Men',
    handle: '@CCMen7',
    url: 'https://www.youtube.com/@CCMen7',
    targetAudience: 'Mężczyźni, ojcowie, mężowie szukający wzorców męstwa, walki z pokusami i braterstwa',
    hook: 'Prawdziwe męstwo to nie siła mięśni, lecz gotowość do wzięcia odpowiedzialności za innych.',
    xPost: `⚔️ Prawdziwe męstwo nie polega na dominacji, ale na odpowiedzialności i obronie bliskich. Męski charakter i walka duchowa na kanale CC Men!\n\n🔴 Stań w wyłomie:\nhttps://www.youtube.com/@CCMen7\n\n#CCMen #Męstwo #MężczyznaWiara #Ojcowie #Braterstwo #MęskiŚwiat #Honor`,
    fbPost: `Świat oferuje mężczyznom cynizm albo ucieczkę w pasywność. Kanał CC Men powstał dla tych, którzy chcą być mocnym oparciem dla swoich rodzin, wiernymi mężami i ludźmi honoru przed Bogiem.\n\n👉 Dołącz do męskiej społeczności na YouTube: https://www.youtube.com/@CCMen7`,
    shortsHook: 'Czego nikt Ci nie powiedział o prawdziwym męstwie i odpowiedzialności? Zobacz materiały na kanale CC Men na YouTube!',
    hashtags: ['#CCMen', '#Męstwo', '#Mężczyzna', '#Odpowiedzialność', '#WiaraMężczyzny']
  },
  {
    id: 'cc_bible_deep',
    name: 'CC Bible Deep',
    handle: '@CCBibleDeep',
    url: 'https://www.youtube.com/@CCBibleDeep',
    targetAudience: 'Studenci teologii, pasjonaci Pisma Świętego, dociekliwi poszukiwacze faktów historycznych',
    hook: 'Co naprawdę kryje się w oryginalnym tekście hebrajskim i greckim Pisma Świętego?',
    xPost: `🔍 Chcesz zrozumieć Pismo Święte głębiej niż z niedzielnych kazań? Egzegeza werset po wersecie, greka, hebrajski i kontekst kulturowy na kanale CC Bible Deep!\n\n🔴 Badaj Pisma:\nhttps://www.youtube.com/@CCBibleDeep\n\n#CCBibleDeep #StudiumBiblijne #Teologia #Egzegeza #PismoŚwięte #Hebrajski`,
    fbPost: `Wiele współczesnych nieporozumień wynika z wyrwania wersetów z ich historycznego i językowego kontekstu. Na CC Bible Deep zaglądamy w rękopisy, analizujemy gramatykę hebrajską i grecką oraz odkrywamy proroctwa Starego Testamentu.\n\n👉 Studiuj Biblię głęboko na YouTube: https://www.youtube.com/@CCBibleDeep`,
    shortsHook: 'To greckie słowo w Nowym Testamencie całkowicie zmienia sens tego wersetu. Sprawdź analizę na kanale CC Bible Deep na YouTube!',
    hashtags: ['#StudiumBiblijne', '#CCBibleDeep', '#Biblia', '#Egzegeza', '#GrekaBiblijna']
  },
  {
    id: 'worship_live',
    name: 'Worship LIVE CC',
    handle: '@WorshipLiveCC',
    url: 'https://www.youtube.com/@WorshipLiveCC',
    targetAudience: 'Wszyscy potrzebujący wyciszenia, obecności Bożej, modlitwy i pięknej muzyki bez reklam',
    hook: 'Czujesz przytłoczenie i gonitwę myśli? Włącz nieprzerwane uwielbienie i odzyskaj Boży pokój.',
    xPost: `🙌 Muzyka chwały bez przerwy 24/7. Otwórz swoje serce na Bożą obecność i wycisz się przy Worship LIVE CC!\n\n🔴 Oglądaj na żywo:\nhttps://www.youtube.com/@WorshipLiveCC\n\n#WorshipLive #Uwielbienie #PraiseAndWorship #Jezus #BożaObecność #MuzykaChwały`,
    fbPost: `Niezależnie od tego, przez co przechodzisz — uwielbienie Boga zmienia perspektywę i usuwa ciężar z serca. Transmisja Worship LIVE CC na YouTube trwa nieprzerwanie przez całą dobę.\n\n👉 Włącz i módl się pieśnią: https://www.youtube.com/@WorshipLiveCC`,
    shortsHook: 'Niech ten moment uwielbienia przyniesie pokój Twojemu sercu. Dołącz do transmisji 24/7 na YouTube Worship LIVE CC!',
    hashtags: ['#WorshipLive', '#Uwielbienie', '#ChwałaBogu', '#Modlitwa', '#Pokój']
  },
  {
    id: 'cc_prayer_24',
    name: 'CC Prayer 24',
    handle: '@CCPrayer24',
    url: 'https://www.youtube.com/@CCPrayer24',
    targetAudience: 'Ludzie w kryzysie życiowym, chorzy, osoby szukające wsparcia modlitewnego',
    hook: 'Nosisz w sercu ciężar, z którym nie masz już siły walczyć samemu?',
    xPost: `🙏 Nie musisz dźwigać swoich problemów sam. Dołącz do nieustannej modlitwy wstawienniczej i złóż swoją intencję na kanale CC Prayer 24!\n\n🔴 Módl się z nami na żywo:\nhttps://www.youtube.com/@CCPrayer24\n\n#CCPrayer24 #ModlitwaNaŻywo #Wstawiennictwo #Uzdrowienie #Nadzieja #Wiara`,
    fbPost: `„Gdzie dwaj lub trzej zebrani są w Imię Moje, tam jestem pośród nich”. Na CC Prayer 24 wierzący z całego świata łączą się w modlitwie o chorych, o rodziny w kryzysie i o Boże prowadzenie.\n\n👉 Zostaw swoją intencję i módl się z nami: https://www.youtube.com/@CCPrayer24`,
    shortsHook: 'Módl się teraz ze mną o pokój w Twoim domu. Cała modlitwa na kanale CC Prayer 24 na YouTube!',
    hashtags: ['#Modlitwa', '#CCPrayer24', '#Wstawiennictwo', '#Uzdrowienie', '#JezusRatunkiem']
  },
  {
    id: 'top_seven',
    name: 'Top Seven (Lista Przebojów CC)',
    handle: '@TopSeven_CC',
    url: 'https://www.youtube.com/@TopSeven_CC',
    targetAudience: 'Młodzież i fani nowoczesnej muzyki chrześcijańskiej szukający świeżych trendów i playlist',
    hook: 'Myślisz, że muzyka chrześcijańska jest nudna? Posłuchaj premier, które podbijają listy przebojów!',
    xPost: `🎶 Odkryj najgorętsze chrześcijańskie utwory w Polsce i na świecie! Nowe brzmienia, potężne wokale i lista przebojów Top Seven CC!\n\n🔴 Posłuchaj notowania:\nhttps://www.youtube.com/@TopSeven_CC\n\n#TopSeven #MuzykaChrześcijańska #PremieryMuzyczne #ListaPrzebojów #ChristianMusic`,
    fbPost: `Poznaj najchętniej słuchane utwory tego tygodnia! Od energetycznego popu i rocka po głęboki worship — Top Seven CC na YouTube to Twoje źródło najlepszych premier muzycznych.\n\n👉 Sprawdź najnowsze zestawienie: https://www.youtube.com/@TopSeven_CC`,
    shortsHook: 'Ten nowy kawałek ma niesamowity refren i głęboki tekst. Posłuchaj całej listy przebojów Top Seven na YouTube!',
    hashtags: ['#TopSeven', '#MuzykaChrześcijańska', '#NowościMuzyczne', '#WorshipHits', '#Hity']
  },
  {
    id: 'cc_film',
    name: 'CC FILM (Kino Chrześcijańskie)',
    handle: '@CCFILM77',
    url: 'https://www.youtube.com/@CCFILM77',
    targetAudience: 'Rodziny, kinomaniacy szukający filmów z przesłaniem bez wulgaryzmów i demoralizacji',
    hook: 'Szukasz filmu na wieczór, który poruszy Twoje serce zamiast zatruwać umysł cynizmem?',
    xPost: `🎬 Kino, które budzi sumienia i wnosi światło. Pełnometrażowe filmy fabularne, biografie bohaterów wiary i opowieści oparte na faktach na CC FILM!\n\n🔴 Oglądaj bezpłatnie na YouTube:\nhttps://www.youtube.com/@CCFILM77\n\n#CCFILM #KinoChrześcijańskie #FilmyFabularne #FilmNaWieczór #KinoFamilijne #DobreKino`,
    fbPost: `Zrób sobie i swoim bliskim wartościowy wieczór filmowy. Na kanale CC FILM znajdziesz wyselekcjonowane produkcje filmowe: wzruszające dramaty, historie nawrócenia i ekranizacje biblijne w polskiej wersji językowej.\n\n👉 Oglądaj filmy za darmo: https://www.youtube.com/@CCFILM77`,
    shortsHook: 'Fragment filmu, który doprowadził tysiące widzów do łez. Cały seans dostępny za darmo na kanale CC FILM na YouTube!',
    hashtags: ['#KinoChrześcijańskie', '#FilmyZPrzesłaniem', '#DobreKino', '#FilmNaWieczór', '#CCFilm']
  },
  {
    id: 'cc_identity',
    name: 'CC Identity (Twoja Duchowa Tożsamość)',
    handle: '@CCIdentityTwojaDuchowaTożsamoś',
    url: 'https://www.youtube.com/@CCIdentityTwojaDuchowaTożsamoś',
    targetAudience: 'Młodzież i dorośli zmagający się z poczuciem odrzucenia, lękiem społecznym i brakiem sensu',
    hook: 'Wiesz, kim naprawdę jesteś, gdy znikają opinie innych ludzi i lajki w telefonie?',
    xPost: `💎 Odrzuć etykiety nadane Ci przez świat. Odkryj swoją nienaruszalną tożsamość w Chrystusie na kanale CC Identity!\n\n🔴 Zobacz materiały na YouTube:\nhttps://www.youtube.com/@CCIdentityTwojaDuchowaTożsamoś\n\n#CCIdentity #TożsamośćWChrystusie #SensŻycia #PoczucieWartości #Wiara #BożeDziecko`,
    fbPost: `Kiedy poznajesz prawdę o tym, jak widzi Cię Stwórca, lęk przed odrzuceniem traci swoją moc. CC Identity to seria rozważań pomagających odnaleźć trwały pokój i pewność swego powołania.\n\n👉 Oglądaj na YouTube: https://www.youtube.com/@CCIdentityTwojaDuchowaTożsamoś`,
    shortsHook: 'Nie jesteś sumą swoich błędów z przeszłości. Zobacz, co mówi o Tobie Pismo Święte na kanale CC Identity!',
    hashtags: ['#Tożsamość', '#CCIdentity', '#SensŻycia', '#WolnośćWChrystusie', '#Wartość']
  },
  {
    id: 'cc_nature_sounds',
    name: 'CC Nature Sounds',
    handle: '@CCNatureSounds',
    url: 'https://www.youtube.com/@CCNatureSounds',
    targetAudience: 'Pracownicy umysłowi, osoby z bezsennością, szukające relaksujących dźwięków natury',
    hook: 'Potrzebujesz głębokiego wyciszenia po stresującym dniu? Posłuchaj piękna Bożego stworzenia.',
    xPost: `🌿 Odpocznij przy kojących dźwiękach natury: szum lasu, deszcz, śpiew ptaków i górskie strumienie bez reklam na kanale CC Nature Sounds!\n\n🔴 Włącz relaks na YouTube:\nhttps://www.youtube.com/@CCNatureSounds\n\n#DźwiękiNatury #Relaks #DoSnu #DoNauki #Spokój #Natura #BożeStworzenie`,
    fbPost: `Idealne tło do snu, pracy przy komputerze, czytania i modlitwy. Zredukuj poziom stresu dzięki kojącym dźwiękom przyrody w najwyższej jakości audio.\n\n👉 Posłuchaj na YouTube: https://www.youtube.com/@CCNatureSounds`,
    shortsHook: 'Wsłuchaj się w szum lasu i weź głęboki oddech. Pełne sesje dźwiękowe na kanale CC Nature Sounds na YouTube!',
    hashtags: ['#DźwiękiNatury', '#Spokój', '#RelaksDoSnu', '#StresStop', '#Wyciszenie']
  },
  {
    id: 'popraw_korone',
    name: 'Popraw Koronę',
    handle: '@PoprawKoronęCC',
    url: 'https://www.youtube.com/@PoprawKoronęCC',
    targetAudience: 'Kobiety potrzebujące podniesienia po życiowych porażkach, rozwodach czy kryzysach',
    hook: 'Upadłaś? Bóg nie skończył jeszcze z Twoją historią. Czas wstać i poprawić koronę córki Króla.',
    xPost: `👑 Upadłaś? Bóg nie skończył pisać Twojej historii. Czas wstać, otrzepać kurz i poprawić koronę Bożej córki! Wzmacniające treści na Popraw Koronę CC!\n\n🔴 Oglądaj na YouTube:\nhttps://www.youtube.com/@PoprawKoronęCC\n\n#PoprawKoronę #KobietaZWiarą #CórkaKróla #NowyPoczątek #SiłaIKobieceWsparcie`,
    fbPost: `Niezależnie od tego, jak trudne były ostatnie miesiące — w Chrystusie masz prawo do nowego początku. Kanał Popraw Koronę to dawka odwagi, łez oczyszczenia i powrotu do życia w Bożej godności.\n\n👉 Subskrybuj na YouTube: https://www.youtube.com/@PoprawKoronęCC`,
    shortsHook: 'Przestań patrzeć w dół na swoje rany. Spójrz w górę na Tego, który Cię podnosi. Popraw Koronę na YouTube!',
    hashtags: ['#PoprawKoronę', '#KobietyWiary', '#Godność', '#OdwagaKobiety', '#NoweŻycie']
  },
  {
    id: 'cc_instrumental',
    name: 'CC Instrumental',
    handle: '@ChristianCultureInstrumental',
    url: 'https://www.youtube.com/@ChristianCultureInstrumental',
    targetAudience: 'Osoby szukające muzyki instrumentalnej do pracy głębokiej, modlitwy kontemplacyjnej i czytania',
    hook: 'Muzyka bez słów, która pozwala Twojemu umysłowi odpocząć i skupić się na tym, co najważniejsze.',
    xPost: `🎹 Kojące aranżacje fortepianowe i orkiestrowe pieśni wiary. Perfekcyjna muzyka do pracy głębokiej i modlitwy na kanale CC Instrumental!\n\n🔴 Słuchaj na YouTube:\nhttps://www.youtube.com/@ChristianCultureInstrumental\n\n#MuzykaInstrumentalna #Fortepian #DoPracy #ModlitwaWyciszenia #SpokójDucha`,
    fbPost: `Delikatny fortepian, ciepłe smyczki i melodie ponadczasowych hymnów. Włącz CC Instrumental podczas nauki lub wieczornego odpoczynku.\n\n👉 Odsłuchaj na YouTube: https://www.youtube.com/@ChristianCultureInstrumental`,
    shortsHook: 'Spokój zamknięty w dźwiękach fortepianu. Posłuchaj całej sesji na kanale CC Instrumental na YouTube!',
    hashtags: ['#Instrumental', '#Pianino', '#MuzykaDoNauki', '#Wyciszenie', '#Spokój']
  },
  {
    id: 'cc_pop',
    name: 'Christian Culture POP',
    handle: '@ChristianCulturePOP',
    url: 'https://www.youtube.com/@ChristianCulturePOP',
    targetAudience: 'Młodzi słuchacze szukający chrześcijańskiego popu i alternatywy dla komercyjnego mainstreamu',
    hook: 'Światowy poziom produkcji i teksty, które budują zamiast niszczyć. Zobacz Christian Culture POP!',
    xPost: `✨ Nowoczesny pop z przesłaniem światła! Energetyczne brzmienia, radiowe melodie i teksty pełne nadziei na kanale Christian Culture POP!\n\n🔴 Posłuchaj na YouTube:\nhttps://www.youtube.com/@ChristianCulturePOP\n\n#ChristianPop #MuzykaMłodzieżowa #PopZWiarą #NoweBrzmienia #EnergiaWiary`,
    fbPost: `Szukasz nowoczesnych kawałków z głębokim przekazem? Christian Culture POP to świeże produkcje muzyczne na najwyższym poziomie artystycznym.\n\n👉 Posłuchaj premier na YouTube: https://www.youtube.com/@ChristianCulturePOP`,
    shortsHook: 'Ten refren zostanie w Twojej głowie na cały dzień! Zobacz premierę na kanale Christian Culture POP na YouTube!',
    hashtags: ['#ChristianPop', '#NowaMuzyka', '#PolskaMuzyka', '#DobraEnergia']
  },
  {
    id: 'cc_hip_hop',
    name: 'Christian Culture Hip Hop',
    handle: '@christianculturehiphop',
    url: 'https://www.youtube.com/@christianculturehiphop',
    targetAudience: 'Młodzi ludzie, fani kultury ulicznej i rapu szukający autentycznego świadectwa nawrócenia',
    hook: 'Bezkompromisowy rap z ulicznym sznytem i prawdą o zbawieniu w Chrystusie.',
    xPost: `🎤 Prawda prosto z serca, mocne bity i teksty o wyjściu z mroku do światła. Bezkompromisowy chrześcijański rap na Christian Culture Hip Hop!\n\n🔴 Sprawdź klipy na YouTube:\nhttps://www.youtube.com/@christianculturehiphop\n\n#ChristianHipHop #RapChrześcijański #GospelRap #UlicaDlaJezusa #Świadectwo`,
    fbPost: `Mocne rymy, prawdziwe historie nawrócenia z nałogów i bezkompromisowa ewangelizacja miejska. Odkryj scenę chrześcijańskiego hip-hopu!\n\n👉 Sprawdź klipy na YouTube: https://www.youtube.com/@christianculturehiphop`,
    shortsHook: 'Nawrócony z dna nałogu rapuje o łasce, która uratowała mu życie. Obejrzyj klip na Christian Culture Hip Hop na YouTube!',
    hashtags: ['#RapZWiarą', '#ChristianHipHop', '#ŚwiadectwoUlicy', '#HipHopPL']
  },
  {
    id: 'cc_news',
    name: 'CC News (Wideo CCN)',
    handle: '@ccnews7',
    url: 'https://www.youtube.com/@ccnews7',
    targetAudience: 'Osoby szukające rzetelnych wiadomości, obrony wolności religijnej i komentarzy społecznych',
    hook: 'Wiadomości ze świata i z Polski bez medialnej cenzury i ideologicznej poprawności.',
    xPost: `📰 Wydarzenia ze świata i Polski w świetle prawdy i wolności słowa. Rzetelne komentarze, fakty i debaty na kanale CC News!\n\n🔴 Bądź na bieżąco na YouTube:\nhttps://www.youtube.com/@ccnews7\n\n#CCNews #Wiadomości #WolnośćSłowa #WolnośćReligijna #Fakty #KomentarzTygodnia`,
    fbPost: `W dobie dezinformacji potrzebujemy niezależnego spojrzenia na sprawy społeczne, wolność sumienia i wydarzenia na świecie. Oglądaj serwisy wideo portalu CCN News.\n\n👉 Bądź poinformowany na YouTube: https://www.youtube.com/@ccnews7`,
    shortsHook: 'O tym wydarzeniu milczą główne serwisy informacyjne. Zobacz materiał analityczny na kanale CC News na YouTube!',
    hashtags: ['#CCNews', '#Informacje', '#Wolność', '#PrawdaWMediach', '#Fakty']
  },
  {
    id: 'robert_lukasz_pio',
    name: 'Robert Łukasz Pio',
    handle: '@RobertŁukaszPio',
    url: 'https://www.youtube.com/@RobertŁukaszPio',
    targetAudience: 'Miłośnicy intymnej modlitwy, osobistego uwielbienia i autorskiej muzyki z serca',
    hook: 'Wycisz się i wejdź w przestrzeń intymnej rozmowy z Bogiem twarzą w twarz.',
    xPost: `🕊️ Pieśni zrodzone w osobistej obecności Boga. Doświadcz głębokiego ukojenia serca na kanale Robert Łukasz Pio • W Obecności na YouTube!\n\n🔴 Posłuchaj na YouTube:\nhttps://www.youtube.com/@RobertŁukaszPio\n\n#RobertŁukaszPio #WObecności #UwielbienieSerca #IntymnaModlitwa #PieśniChwały`,
    fbPost: `Autorskie pieśni i modlitwy, które pomagają zrzucić maski przed Bogiem i doświadczyć Jego czułości. Włącz nagrania Roberta Łukasza Pio w swoim osobistym czasie z Panem.\n\n👉 Posłuchaj na YouTube: https://www.youtube.com/@RobertŁukaszPio`,
    shortsHook: 'Te słowa dotkną najgłębszych strun Twojego serca. Posłuchaj pieśni Roberta Łukasza Pio na YouTube!',
    hashtags: ['#WObecności', '#ModlitwaSerca', '#PieśniWiary', '#PokójBoży']
  },
  {
    id: 'katarzyna_fedkow',
    name: 'Katarzyna Fedków',
    handle: '@katarzynafedkow',
    url: 'https://www.youtube.com/@katarzynafedkow',
    targetAudience: 'Odbiorcy ceniący wokalną wrażliwość, kobiecą delikatność i akustyczne brzmienia chwały',
    hook: 'Niezwykły głos, który niesie nadzieję i przypomina o Bożej wierności w każdym zmaganiu.',
    xPost: `🌸 Niezwykła wokalna wrażliwość i teksty, które leczą zranione serca. Posłuchaj autorskich pieśni Katarzyny Fedków na YouTube!\n\n🔴 Zobacz i posłuchaj:\nhttps://www.youtube.com/@katarzynafedkow\n\n#KatarzynaFedków #PolskaMuzykaChrześcijańska #WokalChwały #PieśniNadziei #WorshipPL`,
    fbPost: `Delikatny, a zarazem poruszający wokal Katarzyny Fedków wnosi do każdego domu atmosferę Bożej bliskości i wdzięczności za dar życia.\n\n👉 Obejrzyj teledyski i występy na YouTube: https://www.youtube.com/@katarzynafedkow`,
    shortsHook: 'Posłuchaj tego niesamowitego wykonania na żywo. Pełne utwory na kanale Katarzyny Fedków na YouTube!',
    hashtags: ['#KatarzynaFedków', '#PolskaWokalistka', '#DlaSerca', '#MuzykaDuchowa']
  },
  {
    id: 'personality_plus_en',
    name: 'Personality Plus (English)',
    handle: '@PersonalityPlusCC',
    url: 'https://www.youtube.com/@PersonalityPlusCC',
    targetAudience: 'Międzynarodowi odbiorcy anglojęzyczni poszukujący biblijnego przywództwa i nadziei',
    hook: 'Discover the ultimate biblical blueprint for resilience, leadership, and eternal purpose.',
    xPost: `🌍 In a world full of anxiety, discover timeless biblical truths that build unshakable character and eternal hope. Subscribe to Personality Plus on YouTube!\n\n🔴 Watch now:\nhttps://www.youtube.com/@PersonalityPlusCC\n\n#PersonalityPlus #BiblicalLeadership #FaithOverFear #CharacterBuilding #ChristianLiving #Hope`,
    fbPost: `Empowering global audiences with biblical principles of leadership, mental resilience, and spiritual victory in Jesus Christ. Watch our international broadcasts on Personality Plus.\n\n👉 Subscribe on YouTube: https://www.youtube.com/@PersonalityPlusCC`,
    shortsHook: 'The single most powerful biblical principle for conquering daily fear. Watch now on Personality Plus YouTube channel!',
    hashtags: ['#Faith', '#Leadership', '#BiblicalTruth', '#HopeInChrist', '#PersonalityPlus']
  },
  {
    id: 'cc_network',
    name: 'Christian Culture Network',
    handle: '@ChristianCultureNetwork',
    url: 'https://www.youtube.com/@ChristianCultureNetwork',
    targetAudience: 'Ludzie poszukujący całościowego spojrzenia na współczesną kulturę w świetle Ewangelii',
    hook: 'Kultura, wiara, społeczeństwo i przyszłość — całościowy obraz chrześcijańskiej misji XXI wieku.',
    xPost: `🌐 Łączymy wiarę z kulturą, edukacją i mediami. Odkryj zasięg i projekty Christian Culture Network na YouTube!\n\n🔴 Poznaj nas:\nhttps://www.youtube.com/@ChristianCultureNetwork\n\n#ChristianCultureNetwork #MisjaXXI #Ewangelizacja #MediaChrześcijańskie #KulturaWiary`,
    fbPost: `Budujemy silną, niezależną przestrzeń chrześcijańskiej obecności w mediach. Na kanale Christian Culture Network zobaczysz, jak Ewangelia kształtuje kulturę, edukację i życie społeczne.\n\n👉 Subskrybuj na YouTube: https://www.youtube.com/@ChristianCultureNetwork`,
    shortsHook: 'Jak chrześcijaństwo może realnie zmieniać współczesną kulturę? Zobacz na kanale Christian Culture Network na YouTube!',
    hashtags: ['#ChristianCulture', '#MediaNowejEry', '#Misja', '#PrawdaKultury']
  },
  {
    id: 'rcc_tv_24',
    name: 'RCC TV 24 (To Dla Ciebie Gramy)',
    handle: '@ToDlaCiebieGramy',
    url: 'https://www.youtube.com/@ToDlaCiebieGramy',
    targetAudience: 'Widzowie poszukujący telewizji muzycznej bez przemocy, z polską i światową muzyką chwały',
    hook: 'Chrześcijańska telewizja muzyczna, która gra specjalnie dla Ciebie — przez 24 godziny na dobę.',
    xPost: `📺 Teledyski, koncerty, audycje na żywo i najlepsza muzyka chrześcijańska 24/7! Włącz RCC TV 24 (To Dla Ciebie Gramy) na YouTube!\n\n🔴 Oglądaj teraz:\nhttps://www.youtube.com/@ToDlaCiebieGramy\n\n#RCCTV24 #ToDlaCiebieGramy #TelewizjaMuzyczna #WorshipTV #PolskaMuzykaChrześcijańska`,
    fbPost: `Zamiast przypadkowych programów w telewizji — włącz stację, która inspiruje i napełnia Twój salon dobrą energią i chwałą Bożą. RCC TV 24 nadaje non stop na YouTube.\n\n👉 Oglądaj transmisję: https://www.youtube.com/@ToDlaCiebieGramy`,
    shortsHook: 'Najlepsze teledyski chrześcijańskie w jednym strumieniu wideo. Włącz RCC TV 24 na YouTube!',
    hashtags: ['#RCCTV24', '#MuzykaTV', '#ToDlaCiebieGramy', '#WorshipLive']
  }
];

export function getNextExternalChannel() {
  let state = { lastIndex: -1, lastTimestamp: null, history: [] };
  if (fs.existsSync(STATE_FILE)) {
    try { state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (_) {}
  }
  const nextIndex = (state.lastIndex + 1) % EXTERNAL_YT_CHANNELS.length;
  const channel = EXTERNAL_YT_CHANNELS[nextIndex];
  return { channel, nextIndex, state };
}

export function saveExternalPromotionState(nextIndex, channelId, extra = {}) {
  let prevHistory = [];
  if (fs.existsSync(STATE_FILE)) {
    try {
      const prev = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      if (Array.isArray(prev.history)) prevHistory = prev.history;
    } catch (_) {}
  }
  const state = {
    lastIndex: nextIndex,
    lastChannelId: channelId,
    lastTimestamp: new Date().toISOString(),
    history: [
      ...prevHistory,
      {
        index: nextIndex,
        channelId,
        timestamp: new Date().toISOString(),
        status: 'PROMOTED',
        ...extra
      }
    ].slice(-50)
  };
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  return state;
}

if (process.argv[1] && process.argv[1].endsWith('youtube_external_promoter.mjs')) {
  const { channel, nextIndex } = getNextExternalChannel();
  const apply = process.argv.includes('--publish');
  console.log(`[EXTERNAL PROMOTER] Kolejny kanał do promocji (${nextIndex + 1}/${EXTERNAL_YT_CHANNELS.length}): ${channel.name} (${channel.handle})`);
  console.log(`Audience: ${channel.targetAudience}`);
  console.log(`Hook: ${channel.hook}`);
  console.log(`\n=== 1. POST NA X (TWITTER) ===\n${channel.xPost}\n`);
  console.log(`=== 2. POST NA FACEBOOK / GRUPY ===\n${channel.fbPost}\n`);
  console.log(`=== 3. HAK DO SHORTS / REELS / TIKTOK ===\n${channel.shortsHook}\n`);
  console.log(`Hashtagi: ${channel.hashtags.join(' ')}\n`);
  if (apply) {
    saveExternalPromotionState(nextIndex, channel.id);
    console.log(`[STATUS] Zapisano wskaźnik rotacji: ${channel.id} (index ${nextIndex})`);
  } else {
    console.log('[DRY-RUN] Użyj flagi --publish, aby przesunąć wskaźnik kolejki.');
  }
}
