import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageEkoccArticle } from './package-ekocc-article.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export const articleData = {
  portal: 'news',
  type: 'ANALIZA SPOŁECZNO-BIBLIJNA',
  title: 'Dzień Tolerancji: czy szacunek oznacza zgodę na wszystko?',
  slug: 'dzien-tolerancji-czy-szacunek-oznacza-zgode-na-wszystko',
  author: 'Cezary Rogowski',
  date: '2026-11-16',
  lead: 'Międzynarodowy Dzień Tolerancji przypomina o jednej z najważniejszych, a zarazem najbardziej zniekształconych wartości współczesnej cywilizacji. W debacie publicznej coraz częściej szacunek dla drugiego człowieka bywa mylony z przymusem bezkrytycznej afirmacji każdego poglądu i stylu życia, co paraliżuje otwarty dialog i prowadzi do nowej formy cenzury. Pismo Święte oferuje perspektywę znacznie głębszą niż chłodna poprawność czy obojętność: wzywa do bezwarunkowej miłości bliźniego i obrony jego przyrodzonej godności, nierozerwalnie łącząc tę postawę z wiernością obiektywnej prawdzie. Prawdziwa tolerancja nie polega na zatarciu różnic ani na rezygnacji z przekonań, lecz na umiejętności spotkania drugiego człowieka w duchu pokoju, łagodności i czystego sumienia.',
  sections: [
    {
      heading: '1. GENEZA I WSPÓŁCZESNY PARADOKS: OD DEKLARACJI UNESCO PO KRYZYS DIALOGU',
      paragraphs: [
        'Ustanowiony 16 listopada 1995 roku przez Zgromadzenie Ogólne UNESCO Międzynarodowy Dzień Tolerancji (rezolucja 5.61) był odpowiedzią społeczności międzynarodowej na dramatyczne konflikty etniczne, religijne i nacjonalistyczne końca XX wieku. W preambule Deklaracji Zasad Tolerancji podkreślono, że pokój na świecie jest niemożliwy bez powszechnego szacunku dla różnorodności kultur i wolności sumienia. W artykule 1.1 zdefiniowano tolerancję jako „szacunek, akceptację i uznanie bogatej różnorodności kultur naszego świata, naszych form wyrazu i sposobów bycia człowiekiem”. Kluczowy, a dziś nagminnie zapominany fragment znajduje się jednak w artykule 1.4 tejże deklaracji, gdzie jednoznacznie zastrzeżono: „Praktykowanie tolerancji nie oznacza tolerowania niesprawiedliwości społecznej ani rezygnacji z własnych przekonań czy ich osłabiania. Oznacza, że każdy człowiek ma swobodę trzymania się swoich przekonań i akceptuje, że inni korzystają z tego samego prawa”.',
        'Historycznie pojęcie to wywodzi się z łacińskiego czasownika tolerare, oznaczającego „znosić, cierpliwie wytrzymywać, ścierpieć ciężar”. W epoce nowożytnej fundamenty pod filozofię tolerancji położył John Locke w fundamentalnym dziele „List o tolerancji” (1689). Locke dowodził, że państwo i prawo nie mają mandatu do wymuszania zbawienia ani narzucania wiary przemocą, ponieważ wiara ze swej natury może być wyłącznie wolną odpowiedzią ludzkiego sumienia. Z kolei austriacko-brytyjski filozof Karl Popper w klasycznej pracy „Społeczeństwo otwarte i jego wrogowie” (1945) sformułował słynny „paradoks tolerancji”. Popper przestrzegał: nieograniczona tolerancja musi nieuchronnie doprowadzić do zaniku tolerancji. Jeśli bowiem społeczeństwo wykaże bezgraniczną tolerancję wobec tych, którzy głoszą zniszczenie wolności i posługują się przemocą, wówczas wolni ludzie zostaną zniszczeni, a tolerancja zniknie wraz z nimi.',
        'Współczesna kultura zachodnia dokonała jednak niebezpiecznego przesunięcia semantycznego. Tradycyjna tolerancja — rozumiana jako zgoda na pokojowe współistnienie ludzi o diametralnie różnych poglądach i prawo do otwartej dyskusji — została w wielu kręgach zastąpiona nową doktryną moralnego relatywizmu. W myśl tej idei jakakolwiek krytyka cudzych wyborów etycznych czy ideologicznych bywa natychmiast piętnowana jako „mowa nienawiści” lub „brak tolerancji”. Powstał mechanizm wykluczania oponentów (tzw. cancel culture), który zamiast chronić wolność, niszczy przestrzeń debaty. Jeśli warunkiem szacunku ma być bezkrytyczna afirmacja cudzych poglądów, słowo „tolerancja” traci jakikolwiek sens — zamienia się w konformizm i przymus ideologiczny. Prawdziwa tolerancja istnieje wyłącznie tam, gdzie ludzie potrafią szanować się nawzajem pomimo głębokiego i nierzadko nieprzejednanego sporu co do prawdy.'
      ]
    },
    {
      heading: '2. ROZDZIELENIE FAKTÓW OD TEOLOGII: GODNOŚĆ CZŁOWIEKA (IMAGO DEI) A OCENA POGLĄDÓW',
      paragraphs: [
        'Rzetelna debata wymaga precyzyjnego rozdzielenia faktów porządku społeczno-prawnego od prawd teologicznych. Na płaszczyźnie prawa państwowego i praw człowieka fundamentem jest Powszechna Deklaracja Praw Człowieka ONZ z 1948 roku. Artykuł 1 Deklaracji stwierdza, że „wszyscy ludzie rodzą się wolni i równi pod względem swej godności i swych praw”, a artykuły 18 i 19 gwarantują każdemu wolność myśli, sumienia, religii oraz wolność wyrażania opinii. Państwo prawa ma obowiązek chronić każdego obywatela przed dyskryminacją i agresją, gwarantując każdemu równe traktowanie bez względu na jego wyznanie czy światopogląd.',
        'Z perspektywy teologii biblijnej godność człowieka nie wynika z nadania przez państwo, statusu społecznego czy moralnej doskonałości jednostki, lecz z aktu stwórczego Boga. W Księdze Rodzaju czytamy: „I stworzył Bóg człowieka na swój obraz, na obraz Boży stworzył go: stworzył ich mężczyzną i kobietą” (Rdz 1:27 UBG). Fakt, że każdy człowiek został ukształtowany jako Imago Dei (obraz Boży), nadaje ludzkiemu życiu świętą, nienaruszalną wartość. Z tego powodu chrześcijanin ma bezwzględny obowiązek szanować każdego człowieka — nawet tego, który błądzi, jest wrogo nastawiony lub odrzuca Boga. Szacunek dla osoby jest nakazem wynikającym bezpośrednio z posłuszeństwa Stwórcy.',
        'Jednocześnie Pismo Święte radykalnie odróżnia szacunek dla człowieka od bezkrytycznej aprobaty dla jego poglądów i czynów. Bóg kocha każdego człowieka miłością odkupieńczą: „Tak bowiem Bóg umiłował świat, że dał swego jednorodzonego Syna, aby każdy, kto w niego wierzy, nie zginął, ale miał życie wieczne” (J 3:16 UBG). Jednak ten sam Bóg nie akceptuje grzechu, ponieważ grzech jest niszczycielską siłą obracającą się przeciwko samemu człowiekowi. W świetle 28 Zasad Wiary Kościoła Bożego prawo moralne Stwórcy jest niezmiennym wzorcem sprawiedliwości i dobra. Prawdziwa miłość do bliźniego nie polega na utwierdzaniu go w błędzie czy fałszu, lecz na życzliwym, mądrym i odważnym ukazywaniu mu drogi prawdy i życia.'
      ]
    },
    {
      heading: '3. JEZUS WŚRÓD INNYCH: REWOLUCJA SZACUNKU I PRAWDY W EWANGELIACH (J 4, J 8, ŁK 9)',
      paragraphs: [
        'Aby pojąć, jak w praktyce wygląda chrześcijańska postawa wobec ludzi o odmiennych przekonaniach i stylach życia, należy przyjrzeć się postawie Jezusa z Nazaretu. Społeczeństwo Judei i Galilei I wieku było bezlitośnie podzielone: faryzeusze gardzili celnikami, Żydzi nie utrzymywali kontaktów z Samarytanami, a radykalni zeloci marzyli o zbrojnym wymordowaniu rzymskich okupantów. W ten duszny świat podziałów wkracza Chrystus z rewolucją godności i prawdy.',
        'Klasycznym tego dowodem jest spotkanie Jezusa z Samarytanką przy studni w Sychar (J 4:7–26 UBG). Jezus łamie wszelkie ówczesne konwenanse: rozmawia sam na sam z kobietą, i to pochodzącą z wrogiego narodu, o którym Żydzi mówili z najwyższą odrazą. Prosi ją o wodę, traktuje z pełnym szacunkiem i prowadzi z nią jedną z najgłębszych rozmów teologicznych w całym Nowym Testamencie. Czy jednak ten szacunek oznaczał udawanie, że wszystko jest w porządku? Bynajmniej. W pewnym momencie Jezus mówi wprost: „Dobrze powiedziałaś: Nie mam męża. Miałaś bowiem pięciu mężów, a ten, którego masz teraz, nie jest twoim mężem” (J 4:17–18 UBG), a odnosząc się do różnic religijnych stwierdza: „Wy czcicie to, czego nie znacie; my czcimy to, co znamy, ponieważ zbawienie pochodzi od Żydów” (J 4:22 UBG). Zbawiciel nie relatywizował prawdy, ale wypowiadał ją z tak nieskończoną miłością i brakiem potępienia, że kobieta nie poczuła się odrzucona, lecz wyzwolona, stając się ewangelistką dla całego swojego miasta.',
        'Podobnie w dramatycznej scenie z kobietą pochwyconą na cudzołóstwie (J 8:1–11 UBG) Jezus bez wahania staje w obronie człowieka skazanego na lincz przez religijnych radykałów: „Kto z was jest bez grzechu, niech pierwszy rzuci w nią kamień” (J 8:7 UBG). Gdy oskarżyciele odeszli, Jezus obdarza kobietę łaską i życiem: „I ja cię nie potępiam”. Zaraz jednak dodaje słowa moralnej odpowiedzialności: „Idź i odtąd już nie grzesz” (J 8:11 UBG). Jezus nie zniósł przykazania chroniącego świętość małżeństwa, ale uratował człowieka przed nienawiścią tłumu. Z kolei gdy uczniowie Jakub i Jan chcieli w akcie religijnego odwetu sprowadzić ogień na samarytańską wioskę, która nie chciała ich przenocować, Jezus surowo ich zgromił: „Nie wiecie, jakiego ducha jesteście. Syn Człowieczy bowiem nie przyszedł zatracać dusz ludzkich, ale je zbawić” (Łk 9:55–56 UBG). W Królestwie Bożym nie ma miejsca na religijną agresję, przemoc ani narzucanie wiary siłą.'
      ]
    },
    {
      heading: '4. APOSTOŁ PAWEŁ NA AREOPAGU: SZACUNEK DLA KULTURY BEZ ZDRADY EWANGELII (DZIEJE 17:16–34)',
      paragraphs: [
        'Kolejnym mistrzowskim wzorcem dialogu z obcym kulturowo światem jest przemowa apostoła Pawła na ateńskim Areopagu, zapisana w 17. rozdziale Dziejów Apostolskich. Gdy Paweł spacerował ulicami Aten — ówczesnej stolicy myśli filozoficznej — jego duch burzył się na widok powszechnego bałwochwalstwa (Dz 17:16 UBG). Jak jednak zareagował, stając przed zgromadzeniem filozofów epikurejskich i stoickich? Nie zaczął od drwin, nie niszczył posągów pogańskich bóstw ani nie wykrzykiwał obelg.',
        'Paweł rozpoczął przemowę od okazania szacunku dla poszukiwań swoich słuchaczy: „Mężowie ateńscy! Widzę, że pod każdym względem jesteście bardzo religijni” (Dz 17:22 UBG). Następnie odwołał się do tego, co zobaczył w ich własnym mieście — ołtarza poświęconego „Nieznanemu Bogu” (Agnosto Theo) — wykorzystując go jako most do rozmowy o prawdziwym Bogu Stwórcy niebios i ziemi. Co więcej, apostoł zacytował greckich poetów Aratosa z Soloj i Kleantesa: „W nim bowiem żyjemy, poruszamy się i jesteśmy, jak to i niektórzy z waszych poetów powiedzieli: Jego bowiem i rodem jesteśmy” (Dz 17:28 UBG). Wykazał się doskonałą znajomością kultury swoich rozmówców i gotowością do odnalezienia wspólnego języka.',
        'Szacunek dla słuchaczy nie doprowadził jednak Pawła do synkretyzmu ani rozwodnienia prawdy. Gdy doszedł do sedna, bez kompromisu wezwał do opamiętania i zwiastował zmartwychwstanie Jezusa Chrystusa. Wiedział doskonale, że dla racjonalistycznej filozofii greckiej cielesne zmartwychwstanie było koncepcją obcą i gorszącą. Część ateńczyków zaczęła drwić, inni powiedzieli: „Posłuchamy cię o tym znowu”, ale znaleźli się ludzie, którzy uwierzyli, w tym Dionizy Areopagita i Damaris (Dz 17:32–34 UBG). Postawa Pawła realizowała w pełni nakaz zapisany przez apostoła Piotra: „Lecz Pana Boga uświęcajcie w waszych sercach i bądźcie zawsze gotowi do obrony przed każdym, kto domaga się od was uzasadnienia waszej nadziei, z łagodnością i bojaźnią. Mając czyste sumienie...” (1 P 3:15–16 UBG). Prawda nie potrzebuje krzyku; broni się sama, o ile głosimy ją z pokorą i łagodnością.'
      ]
    },
    {
      heading: '5. GDZIE KOŃCZY SIĘ TOLERANCJA? GRANICE PRAWDY, WOLNOŚCI SUMIENIA I OBRONA SŁABSZYCH',
      paragraphs: [
        'Zarówno w refleksji konstytucyjnej, jak i w etyce chrześcijańskiej tolerancja nie jest wartością autonomiczną ani absolutną. Tolerancja pozbawiona fundamentu prawdy i sprawiedliwości zamienia się w moralną znieczulicę. Gdzie zatem przebiega granica, której przekroczyć nie wolno?',
        'Pierwszą nienaruszalną granicą jest ochrona życia i obrona niewinnych przed krzywdą. Pismo Święte wzywa: „Ratuj tych, którzy są prowadzeni na śmierć, a tych, którzy chwiejąc się idą na stracenie — czyż ich nie powstrzymasz?” (Przyp 24:11 UBG). Społeczeństwo ani wspólnota wiary nie mają prawa „tolerować” przemocy fizycznej, molestowania dzieci, ucisku słabszych, handlu ludźmi czy niszczenia ludzkiej godności. W takich sytuacjach milczenie w imię fałszywego spokoju staje się współudziałem w złu.',
        'Drugą granicą jest nienaruszalność wolności sumienia. W 28 Zasadach Wiary Kościoła Bożego wyraźnie podkreśla się, że sumienie każdego człowieka odpowiada bezpośrednio przed Bogiem. Prawdziwa tolerancja chroni prawo chrześcijanina do odmowy udziału w działaniach sprzecznych z Dekalogiem i Bożym Słowem (klauzula sumienia). Kiedy władza państwowa lub presja społeczna domaga się zdrady Bożych przykazań, obowiązuje wieczna zasada apostołów: „Trzeba bardziej słuchać Boga niż ludzi” (Dz 5:29 UBG). Chrześcijanin ma odwagę powiedzieć spokojne i stanowcze „nie”, przyjmując ewentualne konsekwencje bez uciekania się do nienawiści.',
        'Trzecią granicą jest obrona obiektywnej prawdy. Zgoda na to, by każdy człowiek miał prawo do błędu, nie oznacza zgody na uznanie błędu za prawdę. Nie istnieje „moja prawda” i „twoja prawda” w kwestiach fundamentalnego ładu stworzenia i moralności. Chrześcijanin nie godzi się na relatywizm epistemologiczny, ponieważ wie, że prawda wyzwala, a kłamstwo zniewala (J 8:32 UBG). Mamy prawo i obowiązek niezłomnie głosić prawdę Ewangelii, nie odmawiając jednocześnie nikomu prawa do życia i szacunku.'
      ]
    },
    {
      heading: '6. 6 BIBLIJNYCH ZASAD DOJRZAŁEGO DIALOGU W ŚWIECIE POLARYZACJI: PRZEWODNIK EkoCC',
      paragraphs: [
        'Jak w praktyce codziennego życia — w rodzinie, miejscu pracy, szkole i mediach społecznościowych — realizować biblijną kulturę szacunku bez kompromisu z prawdą? Redakcja CCN News przygotowała sześć sprawdzonych, opartych na Piśmie Świętym zasad:',
        '1. Rozdzielaj godność człowieka od jego poglądów (Rdz 1:27; Mt 7:12 UBG). Człowiek, z którym się nie zgadzasz — nawet w najbardziej fundamentalnych sprawach etycznych czy politycznych — jest stworzony na obraz Boży i odkupiony krwią Chrystusa. Dyskutuj z argumentami, polemizuj z ideami, ale nigdy nie poniżaj, nie wyśmiewaj i nie dehumanizuj osoby.',
        '2. Mów prawdę w miłości — odrzuć obłudę i agresję (Ef 4:15 UBG). Prawda pozbawiona miłości staje się zimnym kamieniem raniącym rozmówcę; z kolei miłość pozbawiona prawdy zamienia się w pusty, zwodniczy sentymentalizm. Dojrzałość polega na jednoczesnym trzymaniu się prawdy Bożego Słowa i okazywaniu szczerego ciepła, troski i empatii.',
        '3. Bądź skory do słuchania, a nieskory do mówienia i gniewu (Jk 1:19; Przyp 18:13 UBG). Zanim odpowiesz na zarzut lub odmienne stanowisko, upewnij się, że naprawdę zrozumiałeś, co twój rozmówca ma na myśli i z jakiego doświadczenia życiowego wynikają jego lęki. Wielu konfliktów można by uniknąć, gdybyśmy zamiast konstruować w myślach ripostę, poświęcili czas na autentyczne wysłuchanie drugiego człowieka.',
        '4. Dąż do pokoju ze wszystkimi ludźmi, o ile to od ciebie zależy (Rz 12:18; Hbr 12:14 UBG). Nie szukaj sporów dla samego wykazania wyższości intelektualnej. Zrezygnuj z internetowych wojenek, złośliwych komentarzy i triumfalizmu. Pokój nie oznacza kapitulacji przed złem, ale oznacza odmowę eskalowania wrogości.',
        '5. Uzasadniaj swoją nadzieję z łagodnością i bojaźnią (1 P 3:15–16 UBG). Prawdziwa pewność wiary nie potrzebuje arogancji ani krzyku. Jeśli twoje życie jest zakotwiczone w Chrystusie, potrafisz spokojnie, rzeczowo i z uśmiechem wyjaśnić zasady, którymi się kierujesz, zachowując czyste sumienie.',
        '6. Szanuj wolność sumienia bliźniego i zrezygnuj z manipulacji (2 Kor 4:2; Rz 14:12 UBG). Bóg nie zmusza nikogo do miłości, lecz zaprasza. Chrześcijanin nie stosuje szantażu emocjonalnego, presji społecznej ani przymusu. Dzielimy się Ewangelią z modlitwą i życzliwością, pozostawiając decyzję wolnemu sercu człowieka i działaniu Ducha Świętego.'
      ]
    }
  ],
  conclusion: 'Międzynarodowy Dzień Tolerancji stawia przed nami fundamentalne wyzwanie: jak ocalić kulturę szacunku i dialogu w świecie coraz głębszej polaryzacji, nie rezygnując jednocześnie z prawdy. Pismo Święte uczy nas, że szacunek dla drugiego człowieka nigdy nie oznaczał, nie oznacza i nie może oznaczać zgody na wszystko. Człowiek dojrzały potrafi bez wahania podać rękę bliźniemu o odmiennych poglądach, obronić jego godność i prawo do wolności, a jednocześnie z odwagą i miłością pozostać wiernym Bożym przykazaniom. Prawdziwa tolerancja nie jest obojętnością ani relatywizmem — jest szlachetną sztuką spotkania wolnych ludzi w świetle prawdy i miłości Chrystusa.',
  cta: 'Czy w twoim codziennym życiu zdarza ci się ulegać pokusie agresji wobec inaczej myślących lub przeciwnie — lękowi przed wyrażeniem własnej wiary? Zapraszamy cię dziś do podjęcia decyzji o budowaniu kultury biblijnego szacunku i odwagi. Pomódlmy się wspólnie:\n\n„Panie Boże Wszechmogący, Stwórco każdego człowieka, dziękujemy Ci za dar życia i godności, którą obdarzyłeś nas na Twój święty obraz. Wyznajemy, jak często w świecie pełnym sporów brakuje nam cierpliwości, łagodności i gotowości do wysłuchania drugiego człowieka. Przebacz nam chwile, w których odpowiadaliśmy gniewem na gniew, oraz sytuacje, w których z ludzkiego lęku milczeliśmy o Twojej prawdzie. Napełnij nasze serca Twoją miłością agape, abyśmy potrafili szanować każdego bliźniego, chronić wolność sumienia i z odwagą, w duchu łagodności i pokoju, świadczyć o Twojej Ewangelii. Przez Jezusa Chrystusa, naszego Pana i Zbawiciela. Amen.”',
  sources: [
    {
      name: 'UNESCO — Deklaracja Zasad Tolerancji (Declaration of Principles on Tolerance), Rezolucja 5.61 przyjęta na 28. sesji Konferencji Generalnej UNESCO w Paryżu, 16 listopada 1995 r.',
      url: 'https://www.unesco.org'
    },
    {
      name: 'Organizacja Narodów Zjednoczonych (ONZ) — Powszechna Deklaracja Praw Człowieka (rezolucja Zgromadzenia Ogólnego ONZ 217 A (III) z 10 grudnia 1948 r.), Artykuły 1, 18 i 19 (wolność myśli, sumienia i wyznania)',
      url: 'https://www.un.org'
    },
    {
      name: 'John Locke — „A Letter Concerning Toleration” (List o tolerancji, 1689); klasyczna teoria rozdziału kompetencji władzy państwowej i sumienia jednostki',
      url: 'https://plato.stanford.edu/entries/locke-toleration/'
    },
    {
      name: 'Karl R. Popper — „The Open Society and Its Enemies” (Społeczeństwo otwarte i jego wrogowie, Routledge 1945); definicja paradoksu tolerancji i obrona wolności przed tyranią',
      url: 'https://www.routledge.com'
    },
    {
      name: 'Uwspółcześniona Biblia Gdańska (UBG) — Ewangelia według św. Jana 3:16; 4:7–26; 8:1–11; 17:17; Ewangelia według św. Łukasza 9:51–56; Dzieje Apostolskie 5:29; 17:16–34; List do Rzymian 12:18; 14:12; List do Efezjan 4:15; 1 List Piotra 3:15–16; List Jakuba 1:19; Księga Rodzaju 1:26–27; Księga Przypowieści 24:11–12; 2 List do Koryntian 4:2',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: 'Strong\'s Greek & Hebrew Concordance — Hasła: G26 (agape — bezwarunkowa Boża miłość), G226 (aletheuo — mówić prawdę, postępować w prawdzie), G4240 (praotes — łagodność, opanowanie, pokora), G627 (apologia — uzasadniona obrona, odpowiedź prawna), H6754 (celem — obraz, odzwierciedlenie Boga)',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: '28 Zasad Wiary Kościoła Bożego — Zasada o Piśmie Świętym jako najwyższym autorytecie wiary i życia, prawie moralnym Boga jako wiecznym ładzie oraz wolności sumienia człowieka',
      url: 'https://polskieradio.cc'
    }
  ],
  scripture: 'Ewangelia według św. Jana 4:24 („Bóg jest duchem, a ci, którzy go czczą, powinni go czcić w duchu i w prawdzie”); List do Efezjan 4:15 („Lecz mówiąc prawdę w miłości, we wszystkim rośnijmy w tego, który jest głową — w Chrystusa”); 1 List Piotra 3:15 („Lecz Pana Boga uświęcajcie w waszych sercach i bądźcie zawsze gotowi do obrony przed każdym, kto domaga się od was uzasadnienia waszej nadziei, z łagodnością i bojaźnią”); Dzieje Apostolskie 17:28; List do Rzymian 12:18 (UBG)',
  imagePath: path.join(ROOT, 'images/news/art-dzien-tolerancji-szacunek-czy-zgoda-na-wszystko.jpg'),
  imageCaption: 'Ilustracja redakcyjna CCN News / Christian Culture: Otwarta Biblia, notatki i okulary przy stole gotowym do dojrzałego dialogu w ciepłym świetle porannego słońca — symbol spotkania w szacunku, prawdzie i wolności sumienia w Dniu Tolerancji.',
  tags: [
    '@CezaryRogowski',
    '@ChristianCulture',
    '#DzienTolerancji',
    '#Tolerancja',
    '#Prawda',
    '#Szacunek',
    '#CCNNews',
    '#EkoCC',
    '#WolnoscSumienia',
    '#Biblia',
    '#Dialog'
  ],
  seo: {
    title: 'Dzień Tolerancji: czy szacunek oznacza zgodę na wszystko?',
    description: 'Czy szacunek dla drugiego człowieka wymaga rezygnacji z własnych przekonań? Analiza Deklaracji UNESCO i biblijnego wzorca prawdy w miłości.',
    keywords: [
      'Dzień Tolerancji',
      'tolerancja a prawda',
      'szacunek dla człowieka',
      'Biblia o tolerancji',
      'Deklaracja UNESCO 1995',
      'wolność sumienia',
      'Jan 4 Samarytanka',
      'Efezjan 4:15',
      'Areopag Dzieje 17',
      'Cezary Rogowski',
      'CCN News',
      'EkoCC'
    ]
  }
};

async function main() {
  console.log('🚀 Rozpoczynanie przygotowania i pakowania artykułu EkoCC na dzień 2026-11-16...');
  console.log('Tytuł:', articleData.title);
  console.log('Slug:', articleData.slug);
  console.log('Data:', articleData.date);
  console.log('Grafika:', articleData.imagePath);

  if (!fs.existsSync(articleData.imagePath)) {
    throw new Error(`Brak pliku grafiki pod ścieżką: ${articleData.imagePath}`);
  }

  // Zapisz aktualne dane artykułu do pliku roboczego
  const currentJsonPath = path.join(ROOT, 'scripts/current-article-data.json');
  fs.writeFileSync(currentJsonPath, JSON.stringify(articleData, null, 2), 'utf8');
  console.log(`💾 Zapisano aktualne dane artykułu: ${currentJsonPath}`);

  // Spakuj artykuł za pomocą silnika packageEkoccArticle
  const result = await packageEkoccArticle(articleData);

  console.log('\n============================================================');
  console.log('🎉 PAKIET ARTYKUŁU EkoCC PRZYGOTOWANY POMYŚLNIE!');
  console.log('============================================================');
  console.log('📦 Plik ZIP (Pulpit):', result.zipPath);
  console.log('📄 Plik DOCX (Pulpit):', result.docxPath);
  console.log('📝 Plik TXT:', result.txtPath);
  console.log('🔍 Plik SEO:', result.seoPath);
  console.log('============================================================\n');

  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('❌ Błąd podczas przygotowywania artykułu:', err);
    process.exit(1);
  });
}
