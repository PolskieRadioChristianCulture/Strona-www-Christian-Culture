import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

// Wczytujemy szablon Dnia 37
const d37Path = path.join(ROOT, 'akademia/kurscodzienny/dzien-37.html');
const d37Content = fs.readFileSync(d37Path, 'utf8');

console.log('🔄 Buduję plik lekcji HTML dla Dnia 38 (Wj 7:1–25)...');

// Nowe metadane i treść dla Dnia 38
const DAY = 38;
const PREV_DAY = 37;
const NEXT_DAY = 39;
const TITLE = 'LASKA, KTÓRA POŁKNĘŁA WĘŻE, I WODA ZAMIENIONA W KREW';
const READING = 'Wj 7:1–25';
const DATE_LABEL = '7 LISTOPADA 2026 • SOBOTA';
const MEMORY_VERSE_TEXT = '„Tak mówi PAN: Po tym poznasz, że ja jestem PANEM: oto uderzę laską, którą mam w ręku, wodę w rzece, a zamieni się w krew.”';
const MEMORY_VERSE_REF = 'Księga Wyjścia 7:17 (UBG)';
const MEMORY_VERSE_CLIP = 'Tak mówi PAN: Po tym poznasz, że ja jestem PANEM: oto uderzę laską, którą mam w ręku, wodę w rzece, a zamieni się w krew. (Wj 7:17, UBG)';
const THEME = 'Siódmy rozdział Księgi Wyjścia rozpoczyna bezpośrednie starcie Boga JAHWE z panteonem bóstw egipskich oraz zatwardziałym sercem faraona. Przemiana laski w węża połykającego laski czarowników oraz uderzenie w Nil dowodzą, że pozorna siła demonicznych iluzji jest bezsilna wobec suwerennego Stwórcy, a sąd nad rzeką Egiptu zapowiada ostateczne zwycięstwo łaski i odkupienia w Chrystusie.';
const IMAGE_URL = '/images/academy/daily/kc_day_38_laska_woda_w_krew_nil.jpg?v=20261107';
const IMAGE_ALT = 'Dzień 38: LASKA, KTÓRA POŁKNĘŁA WĘŻE, I WODA ZAMIENIONA W KREW (Wj 7:1–25)';
const CAPTION = 'Ilustracja biblijna: Aaron uderzający laską w wody Nilu przed faraonem (Wj 7:20)';

// QUIZ_DATA dla Dnia 38 (20 pytań)
const QUIZ_DATA_JSON = JSON.stringify([
  {
    "q": "Kim Bóg ustanowił Mojżesza dla faraona w Wj 7:1?",
    "a": [
      "Zwykłym sługą i posłańcem",
      "Bogiem (Elohim) dla faraona",
      "Namiestnikiem ziemi Goszen"
    ],
    "c": 1
  },
  {
    "q": "Kto miał być prorokiem (rzecznikiem) Mojżesza według Wj 7:1?",
    "a": [
      "Jozue",
      "Aaron",
      "Chur"
    ],
    "c": 1
  },
  {
    "q": "Co Bóg zapowiedział Mojżeszowi odnośnie serca faraona w Wj 7:3?",
    "a": [
      "Że faraon natychmiast uwierzy",
      "Że Bóg zatwardzi serce faraona i rozmnoży swe znaki w Egipcie",
      "Że faraon ucieknie przed Mojżeszem"
    ],
    "c": 1
  },
  {
    "q": "Jak Bóg nazwał Izraelitów wyprowadzanych z Egiptu w Wj 7:4?",
    "a": [
      "Biednymi uchodźcami",
      "Moimi zastępami, moim ludem, synami Izraela",
      "Plemieniem niewolników"
    ],
    "c": 1
  },
  {
    "q": "Jaki był cel wyciągnięcia Bożej ręki nad Egiptem według Wj 7:5?",
    "a": [
      "Aby Izraelici poznali pogańskie bóstwa",
      "Aby Egipcjanie poznali, że On jest PANEM",
      "Aby zniszczyć całą przyrodę Afryki"
    ],
    "c": 1
  },
  {
    "q": "Ile lat miał Mojżesz, a ile Aaron, gdy stanęli przed faraonem w Wj 7:7?",
    "a": [
      "Mojżesz 40 lat, Aaron 43 lata",
      "Mojżesz 80 lat, Aaron 83 lata",
      "Mojżesz 120 lat, Aaron 123 lata"
    ],
    "c": 1
  },
  {
    "q": "W co zamieniła się laska Aarona po rzuceniu jej przed faraonem w Wj 7:9–10?",
    "a": [
      "W węża / potwora morskiego (tannin)",
      "W gałąź oliwną",
      "W słup ognia"
    ],
    "c": 0
  },
  {
    "q": "Kogo wezwał faraon w odpowiedzi na znak laski Aarona (Wj 7:11)?",
    "a": [
      "Mędrców, czarowników i kapłanów wróżbitów Egiptu",
      "Żołnierzy straży przybocznej",
      "Budowniczych piramid"
    ],
    "c": 0
  },
  {
    "q": "Jakie imiona nosili przywódcy egipskich czarowników według 2 Tm 3:8?",
    "a": [
      "Nadab i Abihu",
      "Jannes i Jambres",
      "Datan i Abiram"
    ],
    "c": 1
  },
  {
    "q": "Co stało się z laskami egipskich czarowników po rzuceniu ich na ziemię (Wj 7:12)?",
    "a": [
      "Zostały spalone przez ogień z nieba",
      "Laska Aarona połknęła ich laski",
      "Zamieniły się w kamienie"
    ],
    "c": 1
  },
  {
    "q": "Jak zareagował faraon na cud pożarcia lasek swoich czarowników (Wj 7:13)?",
    "a": [
      "Ukorzył się i padł na kolana",
      "Jego serce pozostało zatwardziałe i nie usłuchał ich",
      "Zarządził uwolnienie Izraela"
    ],
    "c": 1
  },
  {
    "q": "O jakiej porze i gdzie Mojżesz miał stanąć naprzeciw faraona w Wj 7:15?",
    "a": [
      "W południe w świątyni boga Ra",
      "Rano na brzegu rzeki Nil, gdy faraon wychodził nad wodę",
      "O północy w pałacu królewskim"
    ],
    "c": 1
  },
  {
    "q": "Jaką laskę Mojżesz miał wziąć do ręki według nakazu z Wj 7:15?",
    "a": [
      "Laskę z czystego złota",
      "Laskę, która zamieniła się w węża",
      "Nową laskę cedrową"
    ],
    "c": 1
  },
  {
    "q": "W co miała zamienić się woda rzeki Nil po uderzeniu laską (Wj 7:17)?",
    "a": [
      "W oliwę",
      "W krew",
      "W piasek"
    ],
    "c": 1
  },
  {
    "q": "Co według Wj 7:18 stało się z rzeką Nil po zamianie wody w krew?",
    "a": [
      "Ryby wyginęły, rzeka zasmrodziła się i nie można było pić wody",
      "Rzeka wyschła całkowicie",
      "Rzeka wylała na pustynię"
    ],
    "c": 0
  },
  {
    "q": "Gdzie jeszcze według Wj 7:19 pojawiła się krew w całym Egipcie?",
    "a": [
      "Tylko w pałacu faraona",
      "We wszystkich rzekach, kanałach, stawach oraz w naczyniach drewnianych i kamiennych",
      "Jedynie w krainie Goszen"
    ],
    "c": 1
  },
  {
    "q": "Na czyich oczach Aaron podniósł laskę i uderzył wody Nilu w Wj 7:20?",
    "a": [
      "W tajemnicy przed wszystkimi w nocy",
      "Na oczach faraona i na oczach wszystkich jego sług",
      "Tylko w obecności kapłanów lewickich"
    ],
    "c": 1
  },
  {
    "q": "Co zrobili egipscy czarownicy po zamianie wód Nilu w krew (Wj 7:22)?",
    "a": [
      "Oczyścili Nil z powrotem w wodę pitną",
      "Uczynili to samo swymi czarami, również zamieniając wodę w krew",
      "Uciekli z Egiptu w popłochu"
    ],
    "c": 1
  },
  {
    "q": "Co zrobił faraon po ujrzeniu plagi krwi w Wj 7:23?",
    "a": [
      "Wszedł do swego domu i nie wziął tego do swego serca",
      "Rozdarł szaty i ogłosił post narodowy",
      "Wydał rozkaz zabicia Mojżesza"
    ],
    "c": 0
  },
  {
    "q": "Ile dni minęło po uderzeniu Nilu przez Pana przed kolejnym ostrzeżeniem (Wj 7:25)?",
    "a": [
      "Trzy dni",
      "Siedem dni",
      "Czterdzieści dni"
    ],
    "c": 1
  }
], null, 2);

// Pełny tekst Pisma Świętego Wj 7:1–25
const SCRIPTURE_HTML = `
        <p><span class="verse-num">1</span> I PAN powiedział do Mojżesza: Oto ustanowiłem cię bogiem dla faraona, a Aaron, twój brat, będzie twoim prorokiem.</p>
        <p><span class="verse-num">2</span> Będziesz mówił wszystko, co ci rozkażę, a Aaron, twój brat, będzie mówił do faraona, aby wypuścił synów Izraela ze swojej ziemi.</p>
        <p><span class="verse-num">3</span> Lecz ja zatwardzę serce faraona i rozmnożę moje znaki i moje cuda w ziemi Egiptu.</p>
        <p><span class="verse-num">4</span> Faraon was nie usłucha, a ja wyciągnę swoją rękę nad Egipt i wyprowadzę moje zastępy, mój lud, synów Izraela, z ziemi Egiptu przez wielkie sądy.</p>
        <p><span class="verse-num">5</span> I poznają Egipcjanie, że ja jestem PANEM, gdy wyciągnę swoją rękę nad Egiptem i wyprowadzę synów Izraela spośród nich.</p>
        <p><span class="verse-num">6</span> I uczynili Mojżesz i Aaron tak, jak im PAN nakazał; tak uczynili.</p>
        <p><span class="verse-num">7</span> A Mojżesz miał osiemdziesiąt lat, Aaron zaś osiemdziesiąt trzy lata, gdy mówili do faraona.</p>
        <p><span class="verse-num">8</span> Potem PAN powiedział do Mojżesza i do Aarona:</p>
        <p><span class="verse-num">9</span> Gdy faraon powie do was: Uczyńcie cud, wtedy powiesz do Aarona: Weź swoją laskę i rzuć ją przed faraonem, a zamieni się w węża.</p>
        <p><span class="verse-num">10</span> Przyszli więc Mojżesz i Aaron do faraona i uczynili tak, jak nakazał PAN. Aaron rzucił swoją laskę przed faraonem i przed jego sługami, a zamieniła się w węża.</p>
        <p><span class="verse-num">11</span> Wtedy faraon wezwał mędrców i czarowników. I czarownicy egipscy również uczynili to samo swymi czarami.</p>
        <p><span class="verse-num">12</span> Rzucili bowiem każdy swoją laskę, a zamieniły się w węże. Lecz laska Aarona połknęła ich laski.</p>
        <p><span class="verse-num">13</span> I serce faraona pozostało zatwardziałe, i nie usłuchał ich, jak zapowiedział PAN.</p>
        <p><span class="verse-num">14</span> I PAN powiedział do Mojżesza: Serce faraona jest zatwardziałe, odmawia wypuszczenia ludu.</p>
        <p><span class="verse-num">15</span> Idź do faraona rano; oto wychodzi on nad wodę. Stań naprzeciw niego na brzegu rzeki, weź też do ręki laskę, która zamieniła się w węża.</p>
        <p><span class="verse-num">16</span> I powiedz mu: PAN, Bóg Hebrajczyków, posłał mnie do ciebie, mówiąc: Wypuść mój lud, aby mi służył na pustyni; lecz ty dotąd nie usłuchałeś.</p>
        <p><span class="verse-num">17</span> Tak mówi PAN: Po tym poznasz, że ja jestem PANEM: oto uderzę laską, którą mam w ręku, wodę w rzece, a zamieni się w krew.</p>
        <p><span class="verse-num">18</span> Ryby w rzece wyginą, a rzeka zasmrodzi się, tak że Egipcjanie będą się brzydzić pić wodę z rzeki.</p>
        <p><span class="verse-num">19</span> I PAN powiedział do Mojżesza: Powiedz do Aarona: Weź swoją laskę i wyciągnij rękę nad wody Egiptu, nad ich rzeki, nad ich kanały, nad ich stawy i nad wszystkie ich zbiorniki wód, a zamienią się w krew. I krew będzie w całej ziemi egipskiej, w naczyniach drewnianych i kamiennych.</p>
        <p><span class="verse-num">20</span> I Mojżesz z Aaronem uczynili tak, jak PAN nakazał. Podniósł laskę i uderzył wodę w rzece na oczach faraona i na oczach jego sług; i cała woda w rzece zamieniła się w krew.</p>
        <p><span class="verse-num">21</span> A ryby w rzece wyginęły i rzeka zasmrodziła się, tak że Egipcjanie nie mogli pić wody z rzeki. I była krew w całej ziemi egipskiej.</p>
        <p><span class="verse-num">22</span> Lecz czarownicy egipscy uczynili to samo swymi czarami. I serce faraona pozostało zatwardziałe, i nie usłuchał ich, jak zapowiedział PAN.</p>
        <p><span class="verse-num">23</span> Faraon odwrócił się więc, wszedł do swego domu i nie wziął tego do swego serca.</p>
        <p><span class="verse-num">24</span> Wszyscy zaś Egipcjanie kopali wokół rzeki w poszukiwaniu wody do picia, gdyż nie mogli pić wody z rzeki.</p>
        <p><span class="verse-num">25</span> I minęło siedem dni po tym, jak PAN uderzył w rzekę.</p>`;

// Kody Stronga dla Wj 7
const STRONGS_HTML = `
      <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">
        <i class="fa-solid fa-spell-check text-amber-400"></i>
        <span>Klucze Językowe & Kody Stronga (Wj 7)</span>
      </div>
      <p class="text-xs text-zinc-300 mb-4 leading-relaxed font-serif">
        Poniższe terminy hebrajskie stanowią osnowę teologiczną 7. rozdziału Księgi Wyjścia:
      </p>
      <div class="flex flex-wrap gap-2">
        <span class="strong-chip"><span class="strong-id">H430</span> <span class="strong-orig">אֱלֹהִים (Elohim)</span> — Bóg / sędzia: „Ustanowiłem cię bogiem dla faraona” (Wj 7:1)</span>
        <span class="strong-chip"><span class="strong-id">H5030</span> <span class="strong-orig">נָבִיא (nawi)</span> — prorok / rzecznik mówiący w imieniu suwerena (Wj 7:1)</span>
        <span class="strong-chip"><span class="strong-id">H8577</span> <span class="strong-orig">תַּנִּין (tannin)</span> — potwór morski / smok / wąż (Wj 7:9, 10, 12)</span>
        <span class="strong-chip"><span class="strong-id">H1104</span> <span class="strong-orig">בָּלַע (bala)</span> — połknąć / pochłonąć laski czarowników (Wj 7:12)</span>
        <span class="strong-chip"><span class="strong-id">H2975</span> <span class="strong-orig">יְאֹר (Jeor)</span> — rzeka Nil — święte źródło życia Egiptu (Wj 7:15, 17, 20)</span>
        <span class="strong-chip"><span class="strong-id">H1818</span> <span class="strong-orig">דָּם (dam)</span> — krew — znak sądu i śmierci w Nilu (Wj 7:17, 20)</span>
      </div>`;

// Egzegeza w 4 częściach
const EXEGESIS_HTML = `
        <!-- CZĘŚĆ I -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">I</span>
            BOSKIE PEŁNOMOCNICTWO I ZAPOWIEDŹ SĄDÓW (WJ 7:1–7)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>1. Ustanowienie Mojżesza bogiem dla faraona (7:1a):</strong> Słowa Boga: „Oto ustanowiłem cię bogiem (hebr. Elohim) dla faraona” oznaczają plenipotentne pełnomocnictwo. Mojżesz nie staje się bóstwem ontologicznie, lecz występuje z najwyższym autorytetem Najwyższego wobec tyrana, który uważał siebie za żywe bóstwo na ziemi.</p>
            <p><strong>2. Aaron jako prorok Mojżesza (7:1b):</strong> Relacja Mojżesza i Aarona ukazuje istotę biblijnego urzędu prorockiego: prorok (nawi) to usta i rzecznik, który wiernie powtarza orędzie swego suwerena.</p>
            <p><strong>3. Bezwzględna wierność orędziu (7:2):</strong> Posłaniec Boży nie ma prawa łagodzić ani cenzurować Bożego nakazu pod kątem upodobań władcy. Słowo Boga musi być głoszone w całej swej prawdzie.</p>
            <p><strong>4. Tajemnica zatwardzenia serca faraona (7:3a):</strong> Bóg zapowiada zatwardzenie serca faraona, utwierdzając go w wybranym przez niego buncie, aby obnażyć bezsilność pogaństwa i okazać swą chwałę (por. Rz 9:17).</p>
            <p><strong>5. Rozmnożenie znaków i cudów (7:3b):</strong> Plagi egipskie (otot u-moftim) nie były ślepymi katastrofami naturalnymi, lecz celową pedagogiką Bożą demaskującą nicość egipskich bóstw.</p>
            <p><strong>6. Boże zastępy uwalniane przez sądy (7:4):</strong> Naród niewolników zostaje nazwany przez Boga „moimi zastępami (cewaot), moim ludem”. Wyzwolenie ma charakter królewskiej defilady zwycięstwa.</p>
            <p><strong>7. Ewangelizacyjny cel sądów nad imperium (7:5):</strong> Nawet pogański Egipt ma stanąć w prawdzie i poznać, że JAHWE jest jedynym prawdziwym Władcą wszechświata.</p>
            <p><strong>8. Natychmiastowe posłuszeństwo posłańców (7:6):</strong> Minął czas wymówek i wątpliwości z Horebu; Mojżesz i Aaron wkraczają na drogę radykalnego posłuszeństwa.</p>
            <p><strong>9. Sędziwy wiek i Boża perspektywa czasu (7:7):</strong> Mojżesz ma 80 lat, a Aaron 83 lata. W oczach Boga ich największa misja życiowa dopiero się rozpoczyna — Bóg nie patrzy na metryki, lecz na serce.</p>
          </div>
        </div>

        <!-- CZĘŚĆ II -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">II</span>
            POJEDYNEK LASEK I PORAŻKA CZAROWNIKÓW (WJ 7:8–13)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>10. Znak legitymizujący misję (7:8–9a):</strong> Pogański władca żąda cudu potwierdzającego autorytet wysłanników. Bóg uprzedza działania monarchy i wyposaża swoich sług.</p>
            <p><strong>11. Przemiana laski w węża-potwora (7:9b–10):</strong> Użycie terminu tannin wskazuje na potwora morskiego lub kobrę nilową (uraeus) — symbol królewskiej korony i boskiej opieki faraona.</p>
            <p><strong>12. Wezwanie okultystycznej elity Egiptu (7:11a):</strong> Faraon wzywa mędrców, czarowników i kapłanów wróżbitów (hartummim), szukając oparcia w pogańskim okultyzmie.</p>
            <p><strong>13. Świadectwo Nowego Testamentu o magach (por. 2 Tm 3:8):</strong> Apostoł Paweł wymienia imiona przywódców egipskich czarowników: Jannes i Jambres, którzy sprzeciwili się prawdzie.</p>
            <p><strong>14. Demonizm potrafi imitować znaki (7:11b–12a):</strong> Magowie rzucają swoje laski i one również stają się wężami przez swe zaklęcia (balatehem). Szatan ma moc tworzenia zwodniczych iluzji.</p>
            <p><strong>15. Triumf Bożej laski: pożarcie węży czarowników (7:12b):</strong> Laska Aarona połyka laski czarowników! To potężny znak: prawda Boża pochłania i unicestwia kłamstwo wroga.</p>
            <p><strong>16. Ślepota zatwardziałego serca (7:13):</strong> Mimo druzgocącej porażki swoich czarowników faraon utwierdza się w uporze i nie słucha Bożego głosu.</p>
          </div>
        </div>

        <!-- CZĘŚĆ III -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">III</span>
            SĄD NAD ŚWIĘTYM NILEM: PIERWSZA PLAGA KRWI (WJ 7:14–21)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>17. Poranne spotkanie u źródeł Nilu (7:14–15a):</strong> Mojżesz ma wyjść naprzeciw faraonowi rano nad brzeg rzeki, gdy król udaje się na poranne ablucje lub kult bóstw rzeki.</p>
            <p><strong>18. Laska sądu w ręku Mojżesza (7:15b):</strong> Ta sama laska, która połknęła węże czarowników, staje się berłem sprawiedliwości wymierzonej w dumę imperium.</p>
            <p><strong>19. Przypomnienie odrzuconego wezwania (7:16):</strong> „Wypuść mój lud, aby mi służył na pustyni, lecz ty dotąd nie usłuchałeś”. Bóg uderza dopiero po odrzuceniu cierpliwych ostrzeżeń.</p>
            <p><strong>20. Doświadczenie sądu drogą do poznania PANA (7:17a):</strong> Skoro faraon mówił „Nie znam PANA”, teraz poznaje Go przez nieodwracalny wyrok nad swoimi bogami.</p>
            <p><strong>21. Uderzenie w kult boga Hapi i Ozyrysa (7:17b):</strong> Nil był dla Egipcjan bóstwem dającym życie i urodzaj. Bóg uderza w to, co człowiek postawił na Jego miejscu.</p>
            <p><strong>22. Dosłowna zamiana wody w krew (7:17c):</strong> Woda rzeki na oczach świadków natychmiast zamienia się w dosłowną krew (dam), wykluczając racjonalistyczne teorie o czerwonej glince.</p>
            <p><strong>23. Zagłada biologiczna i niemożność picia (7:18):</strong> Ryby w rzece wyginęły, a Nil zasmrodził się tak, że Egipcjanie brzydzili się z niego pić. Święta rzeka stała się cuchnącym grobem.</p>
            <p><strong>24. Powszechny zasięg sądu (7:19):</strong> Krew pojawiła się we wszystkich odnogach, kanałach, stawach oraz w drewnianych i kamiennych naczyniach w domach. Sąd Boży objął cały kraj.</p>
            <p><strong>25. Publiczne wykonanie wyroku (7:20):</strong> Aaron unosi laskę i uderza rzekę na oczach faraona i jego dostojników. Prawda Boża działa w pełnym świetle dnia.</p>
            <p><strong>26. Totalna bezradność Egiptu (7:21):</strong> Całe imperium staje w obliczu katastrofy ekologicznej i gospodarczej — bogowie Nilu okazali się bezsilnym mitem.</p>
          </div>
        </div>

        <!-- CZĘŚĆ IV -->
        <div class="p-5 rounded-2xl bg-black/40 border border-brand-border/30 space-y-3">
          <h3 class="font-display font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-sans font-bold">IV</span>
            PARODIA CZAROWNIKÓW, UCIECZKA FARAONA I TYDZIEŃ CIERPIENIA (WJ 7:22–25)
          </h3>
          <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 pl-2 border-l border-brand-gold/30">
            <p><strong>27. Tragikomiczna imitacja czarowników (7:22a):</strong> Magowie egipscy swymi czarami również zamieniają resztki wody w krew. Nie potrafią oczyścić wód — potrafią jedynie powiększyć zniszczenie i cierpienie!</p>
            <p><strong>28. Grzeszny pretekst do trwania w uporze (7:22b):</strong> Zamiast ukorzyć się, faraon traktuje sztuczkę magów jako wymówkę, by nie uznać Bożej ręki.</p>
            <p><strong>29. Cyniczna ucieczka władcy do pałacu (7:23a):</strong> Faraon odwraca się plecami do Bożych posłańców i chowa w klimatyzowanym pałacu, obojętny na ból poddanych.</p>
            <p><strong>30. Duchowa znieczulica: „nie wziął tego do serca” (7:23b):</strong> Tyran widzi kataklizm, lecz zamyka serce i umysł na prawdę. To przerażająca diagnoza zatwardziałości grzesznika.</p>
            <p><strong>31. Rozpaczliwe kopanie studni w piasku (7:24):</strong> Zwykli mieszkańcy muszą kopać doły wzdłuż Nilu, szukając przefiltrowanej wody. Pycha bezbożnych władców zawsze uderza w bezbronnych.</p>
            <p><strong>32. Siedem dni Bożej cierpliwości (7:25):</strong> Przez pełny tydzień rzeka krwi przypomina o świętości Boga, dając czas na upamiętanie przed nadejściem kolejnej plagi.</p>
          </div>
        </div>`;

// Jezus w centrum
const CHRIST_HTML = `
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-cross"></i>
        <span>Jezus w centrum</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Laska połykająca śmierć, Krew Przymierza i Źródło Wody Żywej — Chrystus w centrum Wj 7</h3>
      <p class="text-sm sm:text-base text-zinc-300 leading-relaxed mb-4">
        Siódmy rozdział Księgi Wyjścia ukazuje fundamentalne typologie biblijne, które znajdują swoje ostateczne wypełnienie w osobie i dziele Jezusa Chrystusa:
      </p>
      <div class="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed pl-2 border-l-2 border-brand-gold/40">
        <p><strong>33. Laska Aarona a Krzyż Golgoty (Wj 7:12 a Kol 2:15; 1 Kor 15:54):</strong> Laska Aarona połykająca laski czarowników zapowiada Krzyż Jezusa Chrystusa, na którym Zbawiciel rozbroił zwierzchności i władze ciemności, a śmierć została na wieki pochłonięta w zwycięstwie.</p>
        <p><strong>34. Pierwszy znak Mojżesza a pierwszy cud Jezusa (Wj 7:20 a J 1:17; J 2:1–11):</strong> Mojżesz rozpoczyna swoją misję od zamiany wody w krew — znaku sądu, śmierci i potępienia pod Prawem. Jezus Chrystus w Kanie Galilejskiej zamienia wodę w wino — znak łaski, wesela, przebaczenia i nowego życia pod panowaniem Ewangelii!</p>
        <p><strong>35. Krew Nilu a Krew Baranka Bożego (Wj 7:20 a J 19:34; Hbr 12:24):</strong> Krew w Nilu przyniosła śmierć i odrazę. Krew przelana przez Chrystusa na Golgocie przynosi oczyszczenie sumienia, usprawiedliwienie i życie wieczne.</p>
        <p><strong>36. Chrystus Prawdziwym Źródłem Wody Żywej (Wj 7:24 a J 4:13–14; J 7:37–38):</strong> Egipcjanie kopali w piasku, szukając kropli wody. Jezus Chrystus woła do spragnionych: „Kto wierzy we mnie, rzeki wody żywej popłyną z jego wnętrza!”.</p>
      </div>`;

// Porównaj wersety
const CROSS_REFS_HTML = `
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-book-bible"></i>
        <span>Sprawdź w Biblii</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Porównaj wersety w swojej Biblii — studium porównawcze Wj 7:1–25</h3>
      <ul class="space-y-2.5 text-sm sm:text-base text-zinc-300 leading-relaxed list-disc list-inside">
        <li><strong>Wj 7:1 a J 10:34–36</strong> — Znaczenie nadania Mojżeszowi tytułu Elohim i słowa Jezusa o autorytecie tych, do których doszło Słowo Boże.</li>
        <li><strong>Wj 7:11–12 a 2 Tm 3:8–9</strong> — Kim byli Jannes i Jambres i jak apostoł Paweł demaskuje zwodzicieli sprzeciwiających się prawdzie?</li>
        <li><strong>Wj 7:12 a Kol 2:15; 1 J 4:4</strong> — Dlaczego laska połykająca węże daje nam pewność, że „Większy jest Ten, który jest w was”?</li>
        <li><strong>Wj 7:13, 22 a Hbr 3:12–15</strong> — Ostrzeżenie Pisma przed zatwardzaniem serca przez zwodniczość grzechu.</li>
        <li><strong>Wj 7:17 a Ps 78:44; Ps 105:29</strong> — Jak psalmiści wspominają zamianę rzek Egiptu w krew jako dowód Bożej wierności.</li>
        <li><strong>Wj 7:19–20 a Ap 8:8; Ap 16:4–6</strong> — Jak plaga zamiany wód w krew powraca w sądach ostatecznych Księgi Apokalipsy.</li>
        <li><strong>Wj 7:20 a J 1:17; J 2:1–11</strong> — Kontrast między sądem Prawa (woda w krew) a weselem Łaski (woda w wino).</li>
        <li><strong>Wj 7:21 a Iz 19:5–10</strong> — Proroctwo Izajasza o sądzie nad Nilem i bezradności doradców Egiptu.</li>
        <li><strong>Wj 7:22 a 2 Tes 2:9–11</strong> — Dlaczego okultystyczne iluzje zwodzą tych, którzy nie przyjęli miłości prawdy?</li>
        <li><strong>Wj 7:23 a Prz 29:1</strong> — Jaki los spotyka człowieka, który mimo upomnień usztywnia swój kark?</li>
        <li><strong>Wj 7:24 a Jr 2:13</strong> — Ostrzeżenie przed porzuceniem Źródła Wód Żywych na rzecz popękanych cystern tego świata.</li>
        <li><strong>Wj 7:25 a 2 P 3:9</strong> — Czego uczy nas siedem dni Bożej cierpliwości przed kolejnym uderzeniem?</li>
      </ul>`;

// Prawda na dziś
const TRUTHS_HTML = `
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-lightbulb"></i>
        <span>Prawda na dziś</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Prawda na dziś — co zmienia się w moim patrzeniu</h3>
      <div class="space-y-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <p>• <strong>Iluzje zła są bezsilne wobec Bożej Prawdy:</strong> Demoniczne podróbki mogą imponować na krótką metę, lecz prawda Boża ostatecznie połyka wszelkie kłamstwo.</p>
        <p>• <strong>Bóg uderza w to, co stawiasz na Jego miejscu:</strong> Nil był dla Egipcjan bogiem i źródłem bezpieczeństwa — gdy człowiek tworzy bożka, Bóg obnaża jego bezwartościowość.</p>
        <p>• <strong>Uważaj na proces zatwardzania serca:</strong> Każde zignorowane Boże ostrzeżenie sprawia, że sumienie staje się twardsze, a człowiek bardziej ślepy na prawdę.</p>
        <p>• <strong>Szatan potrafi niszczyć, ale nigdy nie potrafi uzdrawiać:</strong> Czarownicy powiększyli ilość krwi, ale nie potrafili dać ani kropli czystej wody. Grzech zawsze pogłębia problem.</p>
        <p>• <strong>Nie uciekaj do pałacu duchowej obojętności:</strong> Ucieczka faraona („nie wziął tego do serca”) to śmiertelna pułapka dla tych, którzy chcą zagłuszyć głos sumienia.</p>
        <p>• <strong>Wiek nie ogranicza Bożego powołania:</strong> Mojżesz miał 80 lat, a Aaron 83 — Bóg może użyć Twojego życia w najpotężniejszy sposób właśnie wtedy, gdy świat spisuje Cię na straty.</p>
        <p>• <strong>Zakon przynosi sąd, Chrystus przynosi wesele łaski:</strong> Woda w krew objawia wyrok Prawa, podczas gdy woda w wino w Kanie objawia obfitość przebaczenia w Chrystusie.</p>
        <p>• <strong>Prawdziwe ugaszenie pragnienia jest tylko w Jezusie:</strong> Nie trać sił na kopanie studni w piasku, gdy Zbawiciel zaprasza Cię, byś darmo pił ze Źródła Wody Żywej.</p>
      </div>`;

// Pytania do serca
const QUESTIONS_HTML = `
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-heart"></i>
        <span>Pomyśl</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">Pytania do serca</h3>
      <ol class="space-y-3 text-sm sm:text-base text-zinc-300 leading-relaxed list-decimal list-inside">
        <li>Czy w Twoim życiu istnieją „Nilowe rzeki” — rzeczy, sukcesy lub zabezpieczenia finansowe — na których polegasz bardziej niż na Bogu?</li>
        <li>Jak reagujesz, gdy Słowo Boże dotyka Twoich błędów: czy w pokorze szukasz przebaczenia, czy wzorem faraona „wchodzisz do domu” i nie bierzesz tego do serca?</li>
        <li>Czy doświadczyłeś w swoim życiu sytuacji, w której kłamstwo lub ludzka manipulacja próbowały Cię zastraszyć, a prawda Boża ostatecznie zatriumfowała?</li>
        <li>W jaki sposób fakt, że Mojżesz i Aaron rozpoczęli swoją największą misję po osiemdziesiątce, wpływa na Twoje podejście do własnego wieku i planów?</li>
        <li>Czy nie dajesz się zwieść współczesnym imitacjom duchowości (horoskopom, ezoteryce, fałszywym teoriom), które obiecują pomoc, a w istocie zatruwają źródła życia?</li>
        <li>Co osobiście oznacza dla Ciebie kontrast między sądem wody w krew pod Mojżeszem a weselem wody w wino pod panowaniem Jezusa Chrystusa?</li>
        <li>W jakich obszarach codzienności zdarza Ci się „kopać w piasku” w poszukiwaniu ulgi, zamiast przyjść bezpośrednio do Chrystusa po Wodę Żywą?</li>
        <li>Kogo w swoim otoczeniu powinieneś dziś z miłością i odwagą przestrzec przed zatwardzaniem serca wobec Bożego głosu?</li>
      </ol>`;

// Twoja decyzja
const DECISION_HTML = `
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-flag-checkered"></i>
        <span>Twoja decyzja</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-3">Twoja decyzja wiary</h3>
      <p class="text-sm sm:text-base text-zinc-300 leading-relaxed mb-4">
        Siódmy rozdział Księgi Wyjścia stawia każdego z nas w obliczu konfrontacji z własną pychą i fałszywymi źródłami bezpieczeństwa. Możemy wzorem faraona otaczać się iluzjami, lekceważyć napomnienia Ducha Świętego, uciekać do pałacu własnej obojętności i „nie brać do serca” Bożego głosu. Możemy też wybrać drogę pokornego posłuszeństwa Bogu, zaufania Jego suwerenności i stanięcia po stronie Prawdy, która połyka wszelkie demoniczne kłamstwo. Pierwszy cud Mojżesza przypomina o surowości Bożego Prawa, lecz w Jezusie Chrystusie otrzymaliśmy dar nieskończenie wspanialszy: Jego Krew daruje wieczne przebaczenie, a On sam jest Źródłem Wody Żywej.
      </p>
      <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm font-serif italic">
        <strong>MOJA DECYZJA:</strong> Panie Boże Wszechmogący, wyznaję, że Ty jesteś jedynym, suwerennym Królem mojego życia. Odrzucam wszelkie bożki tego świata — fałszywe poczucie bezpieczeństwa, pychę rozumu i znieczulicę serca. Nie chcę jak faraon uciekać przed Twoim głosem. Przyjmuję dziś z wiarą oczyszczającą Krew Jezusa Chrystusa i otwieram moje serce na strumienie Jego Wody Żywej. Wybieram posłuszeństwo Twojemu Słowu w każdym dniu mojego życia.
      </div>`;

// Modlitwa
const PRAYER_HTML = `
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-hands-praying"></i>
        <span>Modlitwa</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-3">Modlitwa na 7 listopada</h3>
      <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm sm:text-base text-zinc-300 font-serif leading-relaxed italic space-y-2">
        <p>Święty, Sprawiedliwy i Wszechmogący Boże, Panie nieba, ziemi i wszystkich wód!</p>
        <p>Stajemy przed Twoim majestatem w ten sobotni poranek z drżeniem i głębokim dziękczynieniem za potęgę Twojego Słowa objawionego w siódmym rozdziale Księgi Wyjścia. Ty jesteś Bogiem, przed którym uginają się tyrani i milkną zwierzchności ciemności. Dziękujemy Ci, że w Twoim ręku żadne demoniczne zwiedzenie ani ludzka pycha nie mają mocy przetrwać próby prawdy.</p>
        <p>Przebacz nam, Panie, każdą chwilę, gdy nasze serca stawały się twarde, gdy lekceważyliśmy cichy głos Twojego Ducha lub gdy szukaliśmy ratunku w mętnych wodach tego świata zamiast u Ciebie. Wybacz nam momenty, w których pokładaliśmy nadzieję w ludziach, pieniądzach lub własnych siłach, czyniąc z nich współczesny Nil. Oczyść nasze sumienia i zachowaj nas przed duchową znieczulicą faraona.</p>
        <p>Dziękujemy Ci z całego serca za Pana Jezusa Chrystusa! Dziękujemy, że podczas gdy Prawo Mojżesza obnażyło nasz grzech i zamieniło ziemskie wody w krew sądu, nasz Zbawiciel przelał swoją bezcenną Krew na Golgocie, aby nas odkupić, usprawiedliwić i obdarować Wodą Żywą. Dziękujemy, że w Chrystusie Krzyż pochłonął wszelką władzę wroga, a Jego zmartwychwstanie gwarantuje nam wieczne zwycięstwo. Napełnij nas dziś Twoim pokojem, odwagą i Duchem Świętym. W imieniu Jezusa Chrystusa. Amen.</p>
      </div>`;

// Zadanie na dziś & Dziennik
const TASK_HTML = `
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
        <i class="fa-solid fa-clipboard-check"></i>
        <span>Zadanie na dziś</span>
      </div>
      <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-3">
        Zastosowanie i Twój Zapis
      </h3>
      <div class="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm mb-4">
        📖 <strong>Krok 1:</strong> Przeczytaj cały fragment <a href="/mojabiblia?book=EXO&chapter=7" class="text-amber-300 underline font-semibold">Księgi Wyjścia 7:1–25</a>.
      </div>

      <div class="space-y-4 mb-6">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1" for="kc-input-learned">
            1. „Po przeczytaniu Wj 7 dowiedziałem się o Bogu, że…”
          </label>
          <input type="text" id="kc-input-learned" oninput="saveDailyField('learned', this.value)" placeholder="Wpisz swoje spostrzeżenie..." class="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 text-sm min-h-[44px]" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1" for="kc-input-decision">
            2. „Dlatego dzisiaj chcę…”
          </label>
          <input type="text" id="kc-input-decision" oninput="saveDailyField('decision', this.value)" placeholder="Wpisz swoją praktyczną decyzję..." class="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 text-sm min-h-[44px]" />
        </div>
      </div>

      <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 mb-6">
        <div class="text-xs font-bold uppercase text-zinc-400 mb-3 tracking-wider">Potwierdź realizację:</div>
        <div class="space-y-2.5">
          <label class="flex items-center gap-3 cursor-pointer text-sm min-h-[44px]">
            <input type="checkbox" id="chk-read" onchange="updateChecklist()" class="accent-amber-500 w-4 h-4 rounded" />
            <span class="font-bold text-white">✓ PRZECZYTAŁEM</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer text-sm min-h-[44px]">
            <input type="checkbox" id="chk-understood" onchange="updateChecklist()" class="accent-amber-500 w-4 h-4 rounded" />
            <span class="font-bold text-white">✓ ZROZUMIAŁEM</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer text-sm min-h-[44px]">
            <input type="checkbox" id="chk-apply" onchange="updateChecklist()" class="accent-amber-500 w-4 h-4 rounded" />
            <span class="font-bold text-white">✓ ZASTOSUJĘ</span>
          </label>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-4">
        <button type="button" id="btn-complete-day" onclick="completeDay38()" class="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:from-amber-400 hover:to-amber-500 transition min-h-[44px]">
          <i class="fa-solid fa-check"></i>
          <span id="btn-complete-text">Oznacz Dzień 38 jako ukończony</span>
        </button>
        <span id="save-status-msg" class="text-xs text-emerald-400 font-semibold hidden">
          ✓ Zapisano w Twoim profilu
        </span>
      </div>`;

// Jutro
const TOMORROW_HTML = `
      <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
        JUTRO — 8 LISTOPADA
      </div>
      <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
        DZIEŃ 39 — Plaga żab, wszy i much: Sąd nad bożkami Egiptu i oddzielenie Goszen (Wj 8:1–32)
      </h3>
      <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
        Jutro czytamy ósmy rozdział Księgi Wyjścia: sądy nad Egiptem przybierają na sile! Żaby w sypialniach i piecach chlebowych, proch zamieniony we wszy oraz wyznanie magów: „To palec Boży!”. Zobaczymy też, jak Bóg w widoczny sposób oddziela krainę Goszen, chroniąc swój lud przed plagą much. Wróć jutro, aby kontynuować podróż!
      </p>
      <div class="flex items-center gap-3 flex-wrap">
        <a href="/akademia/kurscodzienny" class="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-300 hover:text-white text-xs font-bold transition min-h-[44px] flex items-center">
          ← Wróć do spisu kursu
        </a>
      </div>`;

// Złożenie kompletnego pliku HTML dla Dnia 38
let d38Html = d37Content;

// 1. Tytuł i Meta
d38Html = d38Html.replace(
  /<title>.*?<\/title>/,
  `<title>Dzień 38: ${TITLE} (${READING}) | Z Biblią za Pan Brat | LUMINA Bible Academy</title>`
);

d38Html = d38Html.replace(
  /<!-- LESSON BODY CONTENT \(Dzień \d+[^>]*\) -->/,
  '<!-- LESSON BODY CONTENT (Dzień 38, 07.11.2026) -->'
);

d38Html = d38Html.replace(
  /\(UBG\) • Wj 6:1–30/,
  '(UBG) • Wj 7:1–25'
);

d38Html = d38Html.replace(
  /<meta name="description" content="[^"]*"/,
  `<meta name="description" content="Dzień 38: Księga Wyjścia 7:1–25. Mojżesz ustanowiony bogiem dla faraona, pojedynek lasek czarowników i uderzenie w święty Nil. Woda zamieniona w krew. Studium biblijne i quiz wiedzy."`
);

d38Html = d38Html.replace(
  /<link rel="canonical" href="https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-\d+"/,
  `<link rel="canonical" href="https://polskieradio.cc/akademia/kurscodzienny/dzien-38"`
);

d38Html = d38Html.replace(
  /<meta property="og:title" content="[^"]*"/,
  `<meta property="og:title" content="Dzień 38: ${TITLE} (${READING}) — Z Biblią za Pan Brat"`
);

d38Html = d38Html.replace(
  /<meta property="og:description" content="[^"]*"/,
  `<meta property="og:description" content="Księga Wyjścia — Miesiąc 2, Dzień 38. Pojedynek lasek przed faraonem i uderzenie w Nil — Wj 7:1–25."`
);

d38Html = d38Html.replace(
  /<meta property="og:image" content="[^"]*"/,
  `<meta property="og:image" content="https://polskieradio.cc${IMAGE_URL}"`
);

d38Html = d38Html.replace(
  /<meta property="og:url" content="[^"]*"/,
  `<meta property="og:url" content="https://polskieradio.cc/akademia/kurscodzienny/dzien-38"`
);

// 2. Nawigacja breadcrumbs i sąsiedzi
d38Html = d38Html.replace(
  /<span class="text-amber-400 font-semibold">Dzień \d+<\/span>/,
  `<span class="text-amber-400 font-semibold">Dzień 38</span>`
);

d38Html = d38Html.replace(
  /<a href="\/akademia\/kurscodzienny\/dzien-\d+" class="px-3 py-1.5 rounded-lg bg-white\/5 hover:bg-white\/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-\[44px\]">[\s\S]*?<\/a>/,
  `<a href="/akademia/kurscodzienny/dzien-37" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 min-h-[44px]">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>← Dzień 37</span>
        </a>`
);

// 3. Hero Header
d38Html = d38Html.replace(
  /Księga Wyjścia • Miesiąc 2 • Dzień \d+ z 2009/,
  `Księga Wyjścia • Miesiąc 2 • Dzień 38 z 2009`
);

d38Html = d38Html.replace(
  /<span class="text-xs text-zinc-400 font-mono">[^<]+<\/span>/,
  `<span class="text-xs text-zinc-400 font-mono">${DATE_LABEL}</span>`
);

d38Html = d38Html.replace(
  /<h1 class="text-2xl sm:text-4xl md:text-5xl font-black text-white font-display tracking-tight leading-tight">[\s\S]*?<\/h1>/,
  `<h1 class="text-2xl sm:text-4xl md:text-5xl font-black text-white font-display tracking-tight leading-tight">
            ${TITLE}
          </h1>`
);

d38Html = d38Html.replace(
  /<p class="text-base sm:text-lg text-amber-300\/90 font-serif italic">[\s\S]*?<\/p>/,
  `<p class="text-base sm:text-lg text-amber-300/90 font-serif italic">
        Mojżesz ustanowiony bogiem dla faraona, pojedynek lasek czarowników i uderzenie w święty Nil (${READING})
      </p>`
);

// Hero Image
d38Html = d38Html.replace(
  /<img\s+src="\/images\/academy\/daily\/[^"]*"\s+alt="[^"]*"\s+class="w-full h-full object-cover"\s+loading="eager"\s*\/>/,
  `<img
          src="${IMAGE_URL}"
          alt="${IMAGE_ALT}"
          class="w-full h-full object-cover"
          loading="eager"
        />`
);

d38Html = d38Html.replace(
  /<span>Ilustracja biblijna: [^<]*<\/span>/,
  `<span>${CAPTION}</span>`
);

d38Html = d38Html.replace(
  /<span class="font-mono text-brand-gold">Czytanie: [^<]*<\/span>/,
  `<span class="font-mono text-brand-gold">Czytanie: ${READING}</span>`
);

// Werset pamięciowy
d38Html = d38Html.replace(
  /navigator\.clipboard\.writeText\('[^']*'\); alert\('Skopiowano werset!'\);/,
  `navigator.clipboard.writeText('${MEMORY_VERSE_CLIP}'); alert('Skopiowano werset!');`
);

d38Html = d38Html.replace(
  /<blockquote class="font-serif italic text-base sm:text-lg text-white">[\s\S]*?<\/blockquote>/,
  `<blockquote class="font-serif italic text-base sm:text-lg text-white">
          ${MEMORY_VERSE_TEXT}
        </blockquote>`
);

d38Html = d38Html.replace(
  /— Księga Wyjścia [^<]* \(UBG\)/,
  `— ${MEMORY_VERSE_REF}`
);

// Myśl przewodnia
d38Html = d38Html.replace(
  /<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:<\/strong>[\s\S]*?<\/div>/,
  `<strong class="text-brand-gold uppercase tracking-wider block mb-1">Myśl przewodnia lekcji:</strong>
        ${THEME}
      </div>`
);

// Wstęp "Zanim otworzysz Biblię"
d38Html = d38Html.replace(
  /Dziś jest <strong class="text-white">Dzień \d+<\/strong>: Księga Wyjścia, <strong class="text-brand-gold">[^<]*<\/strong>\./,
  `Dziś jest <strong class="text-white">Dzień 38</strong>: Księga Wyjścia, <strong class="text-brand-gold">${READING}</strong>.`
);

d38Html = d38Html.replace(
  /<a href="\/mojabiblia\?book=EXO&chapter=\d+" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-\[44px\]">\s*<i class="fa-solid fa-book-bible"><\/i>\s*<span>Czytaj [^<]*<\/span>\s*<\/a>/,
  `<a href="/mojabiblia?book=EXO&chapter=7" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
            <i class="fa-solid fa-book-bible"></i>
            <span>Czytaj ${READING}</span>
          </a>`
);

// Tekst Pisma Świętego
d38Html = d38Html.replace(
  /<div class="kc-prose-reading">[\s\S]*?<\/div>/,
  `<div class="kc-prose-reading">${SCRIPTURE_HTML}\n      </div>`
);

// Kody Stronga
d38Html = d38Html.replace(
  /<!-- HEBREW STRONG CODES & EXEGESIS CHIPS -->\s*<section class="kc-card">[\s\S]*?<\/section>/,
  `<!-- HEBREW STRONG CODES & EXEGESIS CHIPS -->\n    <section class="kc-card">\n${STRONGS_HTML}\n    </section>`
);

// Egzegeza
d38Html = d38Html.replace(
  /<h2 class="text-xl sm:text-2xl font-bold text-white font-display">EGZEGEZA & FORMACJA TEOLOGICZNA<\/h2>\s*<p class="text-xs text-zinc-400">[^<]*<\/p>/,
  `<h2 class="text-xl sm:text-2xl font-bold text-white font-display">EGZEGEZA & FORMACJA TEOLOGICZNA</h2>\n          <p class="text-xs text-zinc-400">Cztery części studium ${READING} (32 punkty analityczne)</p>`
);

d38Html = d38Html.replace(
  /<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">[\s\S]*?<\/div>\s*<\/section>\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-cross"><\/i>\s*<span>Jezus w centrum<\/span>/,
  `<div class="space-y-6 text-zinc-200 leading-relaxed font-serif text-sm sm:text-base">\n${EXEGESIS_HTML}\n      </div>\n    </section>\n\n    <section class="kc-card">\n      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\n        <i class="fa-solid fa-cross"></i>\n        <span>Jezus w centrum</span>`
);

// Jezus w centrum
d38Html = d38Html.replace(
  /<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-cross"><\/i>\s*<span>Jezus w centrum<\/span>\s*<\/div>[\s\S]*?<\/section>\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-book-bible"><\/i>\s*<span>Sprawdź w Biblii<\/span>/,
  `${CHRIST_HTML}\n    </section>\n\n    <section class="kc-card">\n      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\n        <i class="fa-solid fa-book-bible"></i>\n        <span>Sprawdź w Biblii</span>`
);

// Porównaj wersety
d38Html = d38Html.replace(
  /<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-book-bible"><\/i>\s*<span>Sprawdź w Biblii<\/span>\s*<\/div>[\s\S]*?<\/section>\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-lightbulb"><\/i>\s*<span>Prawda na dziś<\/span>/,
  `${CROSS_REFS_HTML}\n    </section>\n\n    <section class="kc-card">\n      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\n        <i class="fa-solid fa-lightbulb"></i>\n        <span>Prawda na dziś</span>`
);

// Prawda na dziś
d38Html = d38Html.replace(
  /<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-lightbulb"><\/i>\s*<span>Prawda na dziś<\/span>\s*<\/div>[\s\S]*?<\/section>\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-heart"><\/i>\s*<span>Pomyśl<\/span>/,
  `${TRUTHS_HTML}\n    </section>\n\n    <section class="kc-card">\n      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\n        <i class="fa-solid fa-heart"></i>\n        <span>Pomyśl</span>`
);

// Pomyśl
d38Html = d38Html.replace(
  /<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-heart"><\/i>\s*<span>Pomyśl<\/span>\s*<\/div>[\s\S]*?<\/section>\s*<\/section>\s*<!-- 20-QUESTION QUIZ SECTION -->/,
  `${QUESTIONS_HTML}\n    </section>\n\n    </section>\n\n    <!-- 20-QUESTION QUIZ SECTION -->`
);

// Quiz nagłówek
d38Html = d38Html.replace(
  /Sprawdź swoją wiedzę — 20 Pytań z Wj \d+/,
  `Sprawdź swoją wiedzę — 20 Pytań z Wj 7`
);

// Twoja decyzja
d38Html = d38Html.replace(
  /<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-flag-checkered"><\/i>\s*<span>Twoja decyzja<\/span>\s*<\/div>[\s\S]*?<\/section>\s*<section class="kc-card">\s*<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-hands-praying"><\/i>\s*<span>Modlitwa<\/span>/,
  `${DECISION_HTML}\n    </section>\n\n    <section class="kc-card">\n      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\n        <i class="fa-solid fa-hands-praying"></i>\n        <span>Modlitwa</span>`
);

// Modlitwa
d38Html = d38Html.replace(
  /<div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">\s*<i class="fa-solid fa-hands-praying"><\/i>\s*<span>Modlitwa<\/span>\s*<\/div>[\s\S]*?<\/section>\s*<!-- ── ZADANIE NA DZIŚ & DZIENNIK/,
  `${PRAYER_HTML}\n    </section>\n\n    <!-- ── ZADANIE NA DZIŚ & DZIENNIK`
);

// Zadanie na dziś & Zapis
d38Html = d38Html.replace(
  /<!-- ── ZADANIE NA DZIŚ & DZIENNIK \(wzór Dnia 1\) ── -->[\s\S]*?<\/section>\s*<!-- ── POROZMAWIAJ Z DUCHOWNYM/,
  `<!-- ── ZADANIE NA DZIŚ & DZIENNIK (wzór Dnia 1) ── -->\n    <section class="kc-card border-brand-gold/40">\n${TASK_HTML}\n    </section>\n\n    <!-- ── POROZMAWIAJ Z DUCHOWNYM`
);

// Podziel się
d38Html = d38Html.replace(
  /Dzie%C5%84%20\d+%20Kursu%20Codziennego[^"]*dzien-\d+/g,
  `Dzie%C5%84%2038%20Kursu%20Codziennego%20Pisma%20%C5%9Awi%C4%99tego%3A%20Laska%2C%20kt%C3%B3ra%20po%C5%82kn%C4%99%C5%82a%20w%C4%99%C5%BCe%2C%20i%20woda%20zamieniona%20w%20krew%20https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-38`
);

d38Html = d38Html.replace(
  /u=https%3A%2F%2Fpolskieradio\.cc%2Fakademia%2Fkurscodzienny%2Fdzien-\d+/g,
  `u=https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-38`
);

d38Html = d38Html.replace(
  /url=https%3A%2F%2Fpolskieradio\.cc%2Fakademia%2Fkurscodzienny%2Fdzien-\d+/g,
  `url=https%3A%2F%2Fpolskieradio.cc%2Fakademia%2Fkurscodzienny%2Fdzien-38`
);

// Jutro
d38Html = d38Html.replace(
  /<section class="p-6 rounded-2xl bg-\[#0E121A\] border border-brand-line text-zinc-300" id="jutro">[\s\S]*?<\/section>/,
  `<section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">\n${TOMORROW_HTML}\n    </section>`
);

// QUIZ_DATA i skrypty JS
d38Html = d38Html.replace(
  /const QUIZ_DATA = \[[\s\S]*?\];\s*let userAnswers = \{\};/,
  `const QUIZ_DATA = ${QUIZ_DATA_JSON};\n    let userAnswers = {};`
);

// Zmiana kluczy localStorage na kc_day38_...
d38Html = d38Html.replace(/kc_day\d+_quiz/g, 'kc_day38_quiz');
d38Html = d38Html.replace(/kc_day\d+_completed/g, 'kc_day38_completed');
d38Html = d38Html.replace(/kc_day\d+_learned/g, 'kc_day38_learned');
d38Html = d38Html.replace(/kc_day\d+_decision/g, 'kc_day38_decision');
d38Html = d38Html.replace(/kc_day\d+_chk_/g, 'kc_day38_chk_');
d38Html = d38Html.replace(/completeDay\d+\(\)/g, 'completeDay38()');
d38Html = d38Html.replace(/function completeDay\d+\(\)/g, 'function completeDay38()');
d38Html = d38Html.replace(/const DAY_KEY = 'kc_day\d+';/g, "const DAY_KEY = 'kc_day38';");
d38Html = d38Html.replace(/Dzień \d+ ukończony/g, 'Dzień 38 ukończony');
d38Html = d38Html.replace(/Oznacz Dzień \d+ jako ukończony/g, 'Oznacz Dzień 38 jako ukończony');

// Zapisujemy plik lekcji do akademia/kurscodzienny/dzien-38.html
const d38Dest = path.join(ROOT, 'akademia/kurscodzienny/dzien-38.html');
fs.writeFileSync(d38Dest, d38Html, 'utf8');
console.log(`✅ Zapisano ${d38Dest}`);

// 4. Kopiujemy do 4 ścieżek Clean URLs
const paths = [
  'akademia/kurscodzienny/dzien-38.html',
  'akademia/kurscodzienny/dzien-38/index.html',
  'kursy/kurscodzienny/dzien-38.html',
  'kursy/kurscodzienny/dzien-38/index.html'
];

for (const p of paths) {
  const fullP = path.join(ROOT, p);
  fs.mkdirSync(path.dirname(fullP), { recursive: true });
  fs.writeFileSync(fullP, d38Html, 'utf8');
  console.log(`✅ Zapisano ścieżkę Clean URL: ${p}`);
}

// 5. Aktualizujemy Dzień 37, aby linkował do Dnia 38
console.log('🔄 Aktualizuję Dzień 37...');
let d37Updated = fs.readFileSync(d37Path, 'utf8');

// Dodaj link do Dnia 38 w nagłówku Dnia 37
if (!d37Updated.includes('dzien-38')) {
  d37Updated = d37Updated.replace(
    /(<a href="\/akademia\/kurscodzienny\/dzien-36"[\s\S]*?<\/a>)/,
    `$1
        <a href="/akademia/kurscodzienny/dzien-38" class="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs text-amber-300 hover:text-amber-200 transition flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 38 →</span>
          <i class="fa-solid fa-chevron-right text-[10px]"></i>
        </a>`
  );
}

// Zaktualizuj sekcję #jutro w Dniu 37
const jutro37 = `
    <!-- ── ZAPOWIEDŹ: JUTRO (wzór Dnia 1) ── -->
    <section class="p-6 rounded-2xl bg-[#0E121A] border border-brand-line text-zinc-300" id="jutro">
      <div class="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
        JUTRO — 7 LISTOPADA
      </div>
      <h3 class="font-serif text-lg sm:text-xl font-bold text-white mb-2">
        DZIEŃ 38 — ${TITLE} (${READING})
      </h3>
      <p class="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
        Dzień 38: Księga Wyjścia 7:1–25. Mojżesz ustanowiony bogiem dla faraona, pojedynek lasek czarowników i uderzenie w święty Nil. Woda zamieniona w krew. Studium biblijne i quiz wiedzy.
      </p>
      <div class="flex items-center gap-3 flex-wrap">
        <a href="/akademia/kurscodzienny/dzien-38" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px]">
          <span>Przejdź do Dnia 38</span>
          <span>→</span>
        </a>
        <a href="/akademia/kurscodzienny" class="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-300 hover:text-white text-xs font-bold transition min-h-[44px] flex items-center">
          ← Spis kursu
        </a>
      </div>
    </section>`;

d37Updated = d37Updated.replace(
  /<section class="p-6 rounded-2xl bg-\[#0E121A\] border border-brand-line text-zinc-300" id="jutro">[\s\S]*?<\/section>/,
  jutro37
);

// Zapisujemy Dzień 37 we wszystkich 4 ścieżkach
const paths37 = [
  'akademia/kurscodzienny/dzien-37.html',
  'akademia/kurscodzienny/dzien-37/index.html',
  'kursy/kurscodzienny/dzien-37.html',
  'kursy/kurscodzienny/dzien-37/index.html'
];

for (const p of paths37) {
  const fullP = path.join(ROOT, p);
  fs.writeFileSync(fullP, d37Updated, 'utf8');
}
console.log('✅ Zaktualizowano wszystkie 4 ścieżki Dnia 37.');

console.log('🎉 Sukces! Lekcja Dnia 38 oraz aktualizacja Dnia 37 zakończone.');
