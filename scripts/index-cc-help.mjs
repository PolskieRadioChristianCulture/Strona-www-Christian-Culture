import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// ── 1. PEŁNY REJESTR TEMATÓW CC POMOC ─────────────────────────────────────────
const HELP_PAGES = [
  // Zdrowie i styl życia
  { slug: 'aktywnosc-fizyczna', title: 'Aktywność fizyczna i ruch', desc: 'Ruch, rehabilitacja i zdrowy tryb życia. Jak zacząć bezpiecznie dbać o kondycję.', category: 'Zdrowie i styl życia', emoji: '🏃', tags: ['aktywnosc fizyczna', 'sport', 'ruch', 'kondycja', 'zdrowie', 'rehabilitacja', 'trening'] },
  { slug: 'cukrzyca',           title: 'Cukrzyca — wsparcie i wiedza', desc: 'Życie z cukrzycą – praktyczne wsparcie, dieta, profilaktyka i pomoc specjalistów.', category: 'Zdrowie i styl życia', emoji: '💉', tags: ['cukrzyca', 'glikemia', 'dieta cukrzycowa', 'insulina', 'zdrowie', 'lekarz'] },
  { slug: 'depresja',           title: 'Depresja — szukanie pomocy', desc: 'Depresja jest problemem zdrowotnym. Bezpłatne wsparcie, kontakty do poradni i infolinie.', category: 'Zdrowie psychiczne', emoji: '🌧️', tags: ['depresja', 'smutek', 'kryzys psychiczny', 'infolinia zaufania', 'psychiatra', 'pomoc psychologiczna'] },
  { slug: 'dietetyk',           title: 'Dietetyk i zdrowe odżywianie', desc: 'Zbilansowana dieta, zdrowe nawyki żywieniowe i konsultacje z dietetykiem.', category: 'Zdrowie i styl życia', emoji: '🥗', tags: ['dietetyk', 'dieta', 'odzywianie', 'zdrowe jedzenie', 'odchudzanie', 'zdrowy styl zycia'] },
  { slug: 'lek',                title: 'Lęk, ataki paniki i niepokój', desc: 'Zaburzenia lękowe – jak radzić sobie z napadami lęku, gdzie szukać fachowej pomocy.', category: 'Zdrowie psychiczne', emoji: '🫁', tags: ['lek', 'niepokoj', 'ataki paniki', 'nerwica', 'stres', 'psycholog'] },
  { slug: 'nadcisnienie',       title: 'Nadciśnienie tętnicze', desc: 'Profilaktyka i kontrola nadciśnienia tętniczego. Porady zdrowotne i zmiana nawyków.', category: 'Zdrowie i styl życia', emoji: '❤️', tags: ['nadcisnienie', 'cisnienie', 'serce', 'kardiolog', 'zdrowie', 'leki'] },
  { slug: 'rehabilitacja',      title: 'Rehabilitacja medyczna i ruchowa', desc: 'Powrót do sprawności po urazach i chorobach. Dostęp do rehabilitacji i fizjoterapii.', category: 'Zdrowie i styl życia', emoji: '🦽', tags: ['rehabilitacja', 'fizjoterapia', 'urazy', 'kregoslup', 'powrot do zdrowia'] },
  { slug: 'sanatoria',          title: 'Sanatoria i leczenie uzdrowiskowe', desc: 'Jak uzyskać skierowanie do sanatorium, leczenie uzdrowiskowe w Polsce.', category: 'Zdrowie i styl życia', emoji: '🏥', tags: ['sanatoria', 'sanatorium', 'uzdrowisko', 'leczenie uzdrowiskowe', 'nfz', 'rekonwalescencja'] },
  { slug: 'wypalenie',          title: 'Wypalenie zawodowe i chroniczne zmęczenie', desc: 'Objawy wypalenia, przeciążenie pracą i odbudowa równowagi życiowej.', category: 'Zdrowie psychiczne', emoji: '🔥', tags: ['wypalenie zawodowe', 'zmeczenie', 'praca', 'regeneracja', 'stres w pracy', 'odpoczynek'] },
  { slug: 'zdrowe-serce',       title: 'Zdrowe serce — profilaktyka chorób krążenia', desc: 'Choroby układu krążenia – profilaktyka, objawy ostrzegawcze i zdrowy styl życia.', category: 'Zdrowie i styl życia', emoji: '💓', tags: ['zdrowe serce', 'kardiologia', 'serce', 'zawal', 'profilaktyka', 'cisnienie'] },
  { slug: 'zdrowy-sen',         title: 'Zdrowy sen i bezsenność', desc: 'Higiena snu, walka z bezsennością i przywracanie regenerującego odpoczynku w nocy.', category: 'Zdrowie i styl życia', emoji: '🌙', tags: ['zdrowy sen', 'bezsennosc', 'sen', 'zasypianie', 'regeneracja', 'zmeczenie'] },
  { slug: 'zdrowy-styl-zycia',  title: 'Zdrowy styl życia — holistyczne podejście', desc: 'Połączenie zdrowia ciała, umysłu i ducha. Praktyczny przewodnik po zdrowych nawykach.', category: 'Zdrowie i styl życia', emoji: '🌿', tags: ['zdrowy styl zycia', 'holistyka', 'nawyki', 'energia', 'witalnosc'] },
  { slug: 'wsparcie-zdrowia',   title: 'Wsparcie zdrowia — baza wiedzy', desc: 'Ogólne wsparcie zdrowotne, oficjalne placówki NFZ, infolinie medyczne w Polsce.', category: 'Zdrowie i styl życia', emoji: '🩺', tags: ['wsparcie zdrowia', 'lekarz', 'poradnia', 'nfz', 'zdrowie publiczne'] },

  // Uzależnienia
  { slug: 'alkoholizm',                   title: 'Problemy z alkoholem — leczenie i wsparcie', desc: 'Nie musisz być sam z problemem alkoholowym. Placówki leczenia uzależnień i grupy wsparcia.', category: 'Uzależnienia', emoji: '🍷', tags: ['alkoholizm', 'alkohol', 'leczenie uzaleznien', 'aa', 'odwyk', 'terapia uzaleznien'] },
  { slug: 'hazard',                        title: 'Uzależnienie od hazardu — pomoc', desc: 'Gry losowe, zakłady bukmacherskie i długi hazardowe. Gdzie szukać pomocy terapeutycznej.', category: 'Uzależnienia', emoji: '🎰', tags: ['hazard', 'uzaleznienie od hazardu', 'kasyno', 'zaklady', 'dlugi hazardowe'] },
  { slug: 'narkomania',                    title: 'Uzależnienie od narkotyków — pomoc i detoks', desc: 'Substancje psychoaktywne – bezpieczny kontakt z ośrodkami terapii, detoks i wsparcie bliskich.', category: 'Uzależnienia', emoji: '💊', tags: ['narkomania', 'narkotyki', 'detoks', 'osrodek terapii', 'leczenie uzaleznien'] },
  { slug: 'rzucanie-palenia',             title: 'Rzucanie palenia — skuteczny proces', desc: 'Plan rzucania palenia tytoniu i e-papierosów. Bezpłatna pomoc i infolinia dla palących.', category: 'Uzależnienia', emoji: '🚭', tags: ['rzucanie palenia', 'nikotyna', 'papierosy', 'palenie', 'zdrowe pluca'] },
  { slug: 'terapia-uzaleznien',           title: 'Terapia uzależnień — jak wybrać ośrodek', desc: 'Rodzaje terapii uzależnień w Polsce (NFZ i prywatne), przygotowanie do leczenia.', category: 'Uzależnienia', emoji: '🛋️', tags: ['terapia uzaleznien', 'psychoterapia', 'terapeuta', 'osrodek uzaleznien', 'odwyk'] },
  { slug: 'uzaleznienia',                 title: 'Uzależnienia — centrum pomocy EkoCC', desc: 'Kompleksowy przegląd form wsparcia dla osób zmagających się z różnymi formami uzależnień.', category: 'Uzależnienia', emoji: '🔗', tags: ['uzaleznienia', 'nalog', 'pomoc w nalogu', 'terapia', 'wsparcie'] },
  { slug: 'uzaleznienie-od-pornografii',  title: 'Uzależnienie od pornografii — wolność i odbudowa', desc: 'Trudny temat, bezpieczna przestrzeń. Kroki do odzyskania kontroli, czystości myśli i relacji.', category: 'Uzależnienia', emoji: '🛡️', tags: ['pornografia', 'uzaleznienie od porno', 'czystosc', 'relacje', 'wolnosc'] },
  { slug: 'uzaleznienie-od-telefonu',     title: 'Uzależnienie od smartfona i social mediów', desc: 'Cyfrowy detoks, kontrola czasu przed ekranem i odzyskanie uwagi dla realnego życia.', category: 'Uzależnienia', emoji: '📵', tags: ['fonoholizm', 'smartfon', 'social media', 'uzaleznienie od telefonu', 'cyfrowy detoks'] },
  { slug: 'wspoluzaleznienie',            title: 'Współuzależnienie — wsparcie dla bliskich', desc: 'Jak żyć obok osoby uzależnionej i nie zatracić siebie. Grupy Al-Anon i pomoc psychologiczna.', category: 'Uzależnienia', emoji: '🤝', tags: ['wspoluzaleznienie', 'al-anon', 'rodzina alkoholika', 'granice', 'bliscy uzaleznionych'] },

  // Rodzina i relacje
  { slug: 'dziecko-a-rozwod',       title: 'Dziecko w sytuacji rozwodu rodziców', desc: 'Jak chronić psychikę dziecka podczas rozstania rodziców. Mediacja i wsparcie emocjonalne.', category: 'Rodzina i relacje', emoji: '👨‍👩‍👧', tags: ['dziecko rozwod', 'rozwod rodzicow', 'opieka nad dzieckiem', 'psychologia dziecka'] },
  { slug: 'komunikacja-w-malzenstwie', title: 'Komunikacja w małżeństwie — sztuka dialogu', desc: 'Jak rozmawiać bez oskarżeń, słuchać z empatią i rozwiązywać codzienne spory w małżeństwie.', category: 'Rodzina i relacje', emoji: '💬', tags: ['komunikacja w malzenstwie', 'malzenstwo', 'dialog', 'relacje malzenskie', 'bliskosc'] },
  { slug: 'konflikty-rodzinne',     title: 'Konflikty rodzinne — mediacja i pojednanie', desc: 'Napięcia wielopokoleniowe, spory majątkowe i emocjonalne. Droga do pojednania w rodzinie.', category: 'Rodzina i relacje', emoji: '⚖️', tags: ['konflikty rodzinne', 'spory w rodzinie', 'mediacja', 'pojednanie', 'relacje'] },
  { slug: 'kryzys-malzenski',       title: 'Kryzys małżeński — ratowanie związku', desc: 'Kiedy małżeństwo przeżywa załamanie. Chrześcijańska perspektywa, terapia par i odnowa przymierza.', category: 'Rodzina i relacje', emoji: '💍', tags: ['kryzys malzenski', 'terapia par', 'ratowanie malzenstwa', 'zdrada', 'separacja'] },
  { slug: 'narzeczenstwo',          title: 'Narzeczeństwo i przygotowanie do małżeństwa', desc: 'Ważne pytania przed ślubem: finanse, wartości, rodzina i wizja wspólnego życia z Bogiem.', category: 'Rodzina i relacje', emoji: '💑', tags: ['narzeczenstwo', 'przed slubem', 'przygotowanie do malzenstwa', 'slub', 'para'] },
  { slug: 'nastolatki',             title: 'Wychowanie i relacja z nastolatkiem', desc: 'Zrozumieć świat młodzieży, utrzymać więź i autorytet bez walki i odrzucenia.', category: 'Rodzina i relacje', emoji: '🧑‍🎓', tags: ['nastolatki', 'dorastanie', 'bunt', 'rodzice i nastolatki', 'wychowanie'] },
  { slug: 'problemy-w-szkole',      title: 'Problemy szkolne — nauka i rówieśnicy', desc: 'Trudności edukacyjne, fobia szkolna i presja grupy. Jak pomóc dziecku przejść przez szkołę.', category: 'Rodzina i relacje', emoji: '🏫', tags: ['problemy w szkole', 'trudnosci w nauce', 'szkola', 'fobia szkolna', 'dzieci'] },
  { slug: 'przemoc-domowa',         title: 'Przemoc domowa — natychmiastowa pomoc', desc: 'Niebieska Linia, bezpieczne schronienie, pomoc prawna i psychologiczna dla ofiar przemocy.', category: 'Rodzina i relacje', emoji: '🆘', tags: ['przemoc domowa', 'niebieska linia', 'ofiara przemocy', 'pomoc kobietom', 'bezpieczenstwo'] },
  { slug: 'rodzicielstwo',          title: 'Mądre rodzicielstwo i wychowanie', desc: 'Wychowanie w miłości, dyscyplinie i prawdzie. Budowanie poczucia bezpieczeństwa u dzieci.', category: 'Rodzina i relacje', emoji: '👪', tags: ['rodzicielstwo', 'wychowanie dzieci', 'rodzina', 'rodzice', 'mama i tata'] },
  { slug: 'rozwod',                 title: 'Rozwód — wsparcie prawne i emocjonalne', desc: 'Kiedy rozstanie staje się faktem. Bezpieczne przejście przez proces i opieka nad bliskimi.', category: 'Rodzina i relacje', emoji: '📋', tags: ['rozwod', 'separacja', 'prawo rodzinne', 'emocje po rozwodzie', 'wsparcie'] },
  { slug: 'samotny-rodzic',         title: 'Samodzielne rodzicielstwo — wsparcie samotnych rodziców', desc: 'Samotna mama, samotny ojciec. Praktyczne porady, świadczenia socjalne i grupy wsparcia.', category: 'Rodzina i relacje', emoji: '👩‍👦', tags: ['samotny rodzic', 'samodzielna mama', 'samotny ojciec', 'alimenty', 'zasilki'] },
  { slug: 'trudne-zachowania',      title: 'Trudne zachowania u dzieci i młodzieży', desc: 'Agresja, wycofanie, autoagresja. Jak reagować spokojnie i gdzie szukać diagnozy.', category: 'Rodzina i relacje', emoji: '🧩', tags: ['trudne zachowania', 'agresja u dzieci', 'autyzm', 'adhd', 'psycholog dzieciecy'] },
  { slug: 'wiara-dzieci',           title: 'Wychowanie w wierze — jak przekazać wartości Bogu', desc: 'Autentyczne świadectwo wiary w domu, rozmowy o Bogu bez przymusu i formalizmu.', category: 'Rodzina i relacje', emoji: '✝️', tags: ['wiara dzieci', 'wychowanie w wierze', 'modlitwa z dziecmi', 'biblia dla dzieci'] },
  { slug: 'wsparcie-malzenstwa',    title: 'Wsparcie małżeństwa — narzędzia i warsztaty', desc: 'Inicjatywy wspierające trwałość małżeństw, spotkania dla par i doradztwo rodzinne.', category: 'Rodzina i relacje', emoji: '💞', tags: ['wsparcie malzenstwa', 'warsztaty dla par', 'umocnienie zwiazku', 'milosc'] },
  { slug: 'wsparcie-rodzicow',      title: 'Wsparcie dla rodziców w kryzysie', desc: 'Kiedy rodzic czuje się bezsilny. Konsultacje, grupy wsparcia rodzicielskiego i poradnie.', category: 'Rodzina i relacje', emoji: '🫂', tags: ['wsparcie rodzicow', 'rodzic w kryzysie', 'bezsilnosc rodzicielska', 'poradnia'] },
  { slug: 'wsparcie-rodziny',       title: 'Centrum wsparcia rodziny EkoCC', desc: 'Kompleksowe doradztwo rodzinne, prawne i pedagogiczne pod skrzydłami Christian Culture.', category: 'Rodzina i relacje', emoji: '🏡', tags: ['wsparcie rodziny', 'rodzina', 'dom', 'wartosci rodzinne', 'pomoc rodzinie'] },
  { slug: 'zdrada',                 title: 'Zdrada w małżeństwie — co dalej?', desc: 'Bolesne doświadczenie zdrady. Proces żałoby po zaufaniu, przebaczenie i decyzje o przyszłości.', category: 'Rodzina i relacje', emoji: '💔', tags: ['zdrada', 'niewiernosc', 'przebaczenie', 'zaufanie', 'odbudowa malzenstwa'] },

  // Zdrowie psychiczne
  { slug: 'cyberprzemoc',       title: 'Cyberprzemoc i hejt w sieci', desc: 'Jak reagować na hejt, szantaż online i prześladowanie w mediach społecznościowych.', category: 'Zdrowie psychiczne', emoji: '💻', tags: ['cyberprzemoc', 'hejt', 'przemoc w internecie', 'bezpieczenstwo w sieci', 'zglos hejt'] },
  { slug: 'holistyczny-coaching', title: 'Holistyczny coaching chrześcijański', desc: 'Odkrywanie powołania, talentów i celów życiowych w oparciu o Boże zasady.', category: 'Zdrowie psychiczne', emoji: '🌟', tags: ['coaching', 'rozwoj osobisty', 'powolanie', 'cele', 'motywacja'] },
  { slug: 'kryzys',             title: 'Kryzys emocjonalny i psychiczny — pierwsza pomoc', desc: 'Kiedy ból staje się nieznośny. Bezpłatne numery telefonów zaufania i ośrodki interwencji kryzysowej.', category: 'Zdrowie psychiczne', emoji: '🆘', tags: ['kryzys emocjonalny', 'telefon zaufania', 'interwencja kryzysowa', 'pomoc natychmiastowa'] },
  { slug: 'poczucie-wartosci',  title: 'Poczucie wartości oparte na Bogu', desc: 'Uwalnianie się od porównań, lęku przed odrzuceniem i budowanie tożsamości dziecka Bożego.', category: 'Zdrowie psychiczne', emoji: '🌱', tags: ['poczucie wartosci', 'samoocena', 'tozsamosc', 'akceptacja', 'pewnosc siebie'] },
  { slug: 'psycholog',          title: 'Psycholog z chrześcijańskimi wartościami', desc: 'Jak znaleźć psychologa, który szanuje Twoją wiarę i stosuje rzetelną wiedzę naukową.', category: 'Zdrowie psychiczne', emoji: '🧠', tags: ['psycholog', 'psychoterapia', 'chrzescijanski psycholog', 'terapia', 'gabinet'] },
  { slug: 'psycholog-dzieciecy', title: 'Psycholog dziecięcy — pomoc najmłodszym', desc: 'Konsultacje psychologiczne dla dzieci i młodzieży, diagnoza emocjonalna i rozwojowa.', category: 'Zdrowie psychiczne', emoji: '🧒', tags: ['psycholog dzieciecy', 'pomoc dzieciom', 'emocje dziecka', 'poradnia psychologiczna'] },
  { slug: 'samotnosc',          title: 'Samotność i izolacja — odnaleźć więź', desc: 'Samotność w tłumie, utrata relacji i budowanie nowych, bezpiecznych więzi we wspólnocie.', category: 'Zdrowie psychiczne', emoji: '🕯️', tags: ['samotnosc', 'izolacja', 'brak przyjaciol', 'wspolnota', 'bliskosc'] },
  { slug: 'senior',             title: 'Wsparcie dla seniorów — godność i aktywność', desc: 'Opieka nad osobami starszymi, walka z samotnością seniorów, infolinie i kluby seniora.', category: 'Zdrowie psychiczne', emoji: '👴', tags: ['senior', 'seniorzy', 'osoby starsze', 'opiekun seniora', 'klub seniora'] },
  { slug: 'stres',              title: 'Przewlekły stres i przeciążenie', desc: 'Objawy fizyczne stresu, techniki wyciszenia, biblijny pokój i higiena układu nerwowego.', category: 'Zdrowie psychiczne', emoji: '😮‍💨', tags: ['stres', 'przeciazenie', 'uspokojenie', 'relaks', 'uklad nerwowy', 'spokoj'] },
  { slug: 'trauma',             title: 'Doświadczenie traumy — proces leczenia', desc: 'Zespół stresu pourazowego (PTSD), bezpieczna terapia traumy i odzyskiwanie poczucia bezpieczeństwa.', category: 'Zdrowie psychiczne', emoji: '🌊', tags: ['trauma', 'ptsd', 'terapia traumy', 'przezycia traumatyczne', 'zdrowie psychiczne'] },
  { slug: 'zaloba',             title: 'Żałoba i strata bliskiej osoby', desc: 'Etapy żałoby, prawo do bólu i łez, wsparcie duszpasterskie i psychologiczne po stracie.', category: 'Zdrowie psychiczne', emoji: '🕊️', tags: ['zaloba', 'strata', 'smierc bliskiego', 'pogrzeb', 'pocieszenie'] },

  // Finanse i prawo
  { slug: 'budzet-domowy',         title: 'Budżet domowy — kontrola nad wydatkami', desc: 'Praktyczny szablon budżetu domowego, planowanie wydatków i wychodzenie na prostą finansową.', category: 'Finanse i prawo', emoji: '📊', tags: ['budzet domowy', 'finanse osobiste', 'oszczedzanie', 'wydatki', 'pieniadze'] },
  { slug: 'dlugi',                  title: 'Wyjście z długów — plan oddłużenia', desc: 'Pilotaż CC Pomoc. Praktyczne kroki, uporządkowanie zobowiązań, darmowy arkusz i oficjalna pomoc.', category: 'Finanse i prawo', emoji: '📉', tags: ['dlugi', 'wyjscie z dlugow', 'oddluzanie', 'zadluzenie', 'komornik', 'kredyty'] },
  { slug: 'komornik',               title: 'Egzekucja komornicza — prawa dłużnika', desc: 'Kwota wolna od potrąceń, co może zająć komornik, a co jest chronione prawem w Polsce.', category: 'Finanse i prawo', emoji: '📜', tags: ['komornik', 'egzekucja komornicza', 'zajecie konta', 'prawa dluznika', 'prawo'] },
  { slug: 'kredyty',                title: 'Kredyty, pożyczki i chwilówki — co robić', desc: 'Pętla kredytowa, konsolidacja, negocjacje z bankiem i unikanie pułapek lichwiarskich.', category: 'Finanse i prawo', emoji: '🏦', tags: ['kredyty', 'chwilowki', 'pozyczki', 'bank', 'petla kredytowa', 'odsetki'] },
  { slug: 'oddluzanie',             title: 'Skuteczne oddłużanie osób fizycznych', desc: 'Prawne i finansowe metody redukcji długu, restrukturyzacja i pomoc doradcy finansowego.', category: 'Finanse i prawo', emoji: '🔓', tags: ['oddluzanie', 'redukcja dlugu', 'wierzyciele', 'doradca finansowy'] },
  { slug: 'pomoc-prawna',           title: 'Nieodpłatna pomoc prawna w Polsce', desc: 'Gdzie skorzystać z darmowych punktów pomocy prawnej i poradnictwa obywatelskiego.', category: 'Finanse i prawo', emoji: '⚖️', tags: ['pomoc prawna', 'darmowy prawnik', 'punkty npp', 'poradnictwo obywatelskie', 'prawo'] },
  { slug: 'prawa-konsumenta',       title: 'Prawa konsumenta — reklamacje i oszustwa', desc: 'Rzecznik Praw Konsumenta, zwroty towaru, reklamacje, ochrona przed nieuczciwymi umowami.', category: 'Finanse i prawo', emoji: '🛒', tags: ['prawa konsumenta', 'rzecznik konsumentow', 'reklamacja', 'odstapienie od umowy', 'uokik'] },
  { slug: 'prawnik',                title: 'Konsultacja z prawnikiem — jak się przygotować', desc: 'Jak wybrać rzetelnego adwokata lub radcę prawnego, przygotowanie dokumentów do sprawy.', category: 'Finanse i prawo', emoji: '👨‍⚖️', tags: ['prawnik', 'adwokat', 'radca prawny', 'porada prawna', 'sad'] },
  { slug: 'upadlosc-konsumencka',   title: 'Upadłość konsumencka — nowy start', desc: 'Warunki ogłoszenia upadłości konsumenckiej w sądzie, plan spłaty i całkowite umorzenie długów.', category: 'Finanse i prawo', emoji: '📋', tags: ['upadlosc konsumencka', 'sad upadlosciowy', 'umorzenie dlugow', 'nowy start'] },
  { slug: 'windykacja',             title: 'Windykacja — jak rozmawiać z firmą windykacyjną', desc: 'Granice działań windykatora, przedawnienie długu, ochrona przed nękaniem telefonicznym.', category: 'Finanse i prawo', emoji: '📩', tags: ['windykacja', 'windykator', 'przedawnienie', 'nekanie', 'dlugi'] },
  { slug: 'pastor',                 title: 'Duszpasterz i pastor — wsparcie duchowe', desc: 'Rozmowa duszpasterska, modlitwa, poszukiwanie Boga i odpowiedzi w Piśmie Świętym.', category: 'Finanse i prawo', emoji: '✝️', tags: ['pastor', 'duszpasterz', 'rozmowa duchowa', 'modlitwa', 'rada biblijna'] },
  { slug: 'specjalisci',            title: 'Katalog specjalistów CC Pomoc', desc: 'Baza zweryfikowanych specjalistów wolontariuszy gotowych do bezpłatnej wstępnej pomocy.', category: 'Finanse i prawo', emoji: '📋', tags: ['specjalisci', 'baza specjalistow', 'wolontariusze', 'doradcy', 'pomoc specjalisty'] }
];

// ── 2. AKTUALIZACJA SZUKAJ/CATALOG.JSON ORAZ DATA/CC-SEARCH-INDEX.JSON ───────
function updateSearchIndexes() {
  const catalogPaths = [
    path.join(ROOT, 'szukaj', 'catalog.json'),
    path.join(ROOT, 'data', 'cc-search-index.json')
  ];

  for (const catPath of catalogPaths) {
    if (!fs.existsSync(catPath)) continue;
    let data = JSON.parse(fs.readFileSync(catPath, 'utf8'));

    // Usuń stare wpisy pomocy (aby uniknąć duplikatów przy ponownym uruchomieniu)
    data.items = data.items.filter(it => !it.url.includes('/help') && !HELP_PAGES.some(hp => it.url === `https://polskieradio.cc/${hp.slug}`));

    // Dodaj wpis strony głównej /help
    data.items.push({
      title: "CC Pomoc — Centralny Katalog Wsparcia Tematycznego EkoCC",
      category: "Wsparcie i pomoc",
      url: "https://polskieradio.cc/help",
      description: "Ponad 60 bezpłatnych stron tematycznych z praktycznym wsparciem w kryzysie: zdrowie, uzależnienia, rodzina, psychologia, finanse i prawo. Bez oceniania, w duchu chrześcijańskich wartości, z naborem specjalistów wolontariuszy.",
      tags: ["pomoc", "cc pomoc", "help", "wsparcie", "kryzys", "specjalisci", "wolontariat", "zdrowie", "uzaleznienia", "rodzina", "prawo", "finanse", "psycholog", "infolinia"],
      featured: true
    });

    // Dodaj wszystkie 62 strony tematyczne
    for (const page of HELP_PAGES) {
      data.items.push({
        title: `${page.title} — CC Pomoc | Christian Culture`,
        category: page.category,
        url: `https://polskieradio.cc/${page.slug}`,
        description: page.desc,
        tags: [...page.tags, "cc pomoc", "pomoc", "wsparcie"],
        featured: page.slug === 'dlugi' || page.slug === 'depresja' || page.slug === 'kryzys'
      });
    }

    data.totalItems = data.items.length;
    data.updatedAt = new Date().toISOString();

    fs.writeFileSync(catPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Zaktualizowano ${path.basename(catPath)} (${data.totalItems} pozycji, dodano 63 wpisy CC Pomoc)`);
  }
}

// ── 3. WZBOGACENIE HELP.HTML I HELP/INDEX.HTML (SEO, GA4, AI SCHEMA) ──────────
function buildHelpPageHtml() {
  const CATEGORIES = ['Zdrowie i styl życia', 'Uzależnienia', 'Rodzina i relacje', 'Zdrowie psychiczne', 'Finanse i prawo'];
  const CAT_LABELS = {
    'Zdrowie i styl życia': '🏥 Zdrowie i styl życia',
    'Uzależnienia':        '💊 Uzależnienia',
    'Rodzina i relacje':    '👨‍👩‍👧 Rodzina i relacje',
    'Zdrowie psychiczne':   '🧠 Zdrowie psychiczne',
    'Finanse i prawo':      '⚖️ Finanse i prawo',
  };

  let sectionsHTML = '';
  for (const cat of CATEGORIES) {
    const pages = HELP_PAGES.filter(p => p.category === cat);
    const cards = pages.map(p => `
      <a class="help-card" href="/${p.slug}" data-slug="${p.slug}" data-title="${p.title}" aria-label="${p.title}">
        <span class="help-card-emoji" aria-hidden="true">${p.emoji}</span>
        <strong class="help-card-title">${p.title}</strong>
        <span class="help-card-desc">${p.desc}</span>
      </a>`).join('');
    sectionsHTML += `
    <section class="help-category" aria-labelledby="cat-${encodeURIComponent(cat)}">
      <h2 id="cat-${encodeURIComponent(cat)}" class="help-cat-title">${CAT_LABELS[cat]}</h2>
      <div class="help-cards-grid">
        ${cards}
      </div>
    </section>`;
  }

  // Schema.org Structured Data dla botów AI i wyszukiwarek
  const schemaOrgJSON = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://polskieradio.cc/#organization",
        "name": "Christian Culture",
        "url": "https://polskieradio.cc",
        "logo": "https://polskieradio.cc/dlugi/assets/cc-logo.webp",
        "sameAs": [
          "https://www.youtube.com/@ChristianCultureTV"
        ]
      },
      {
        "@type": "CollectionPage",
        "@id": "https://polskieradio.cc/help#webpage",
        "url": "https://polskieradio.cc/help",
        "name": "CC Pomoc — Katalog Wsparcia Tematycznego | Christian Culture",
        "description": "Bezpłatny katalog ponad 60 stron tematycznego wsparcia w duchu chrześcijańskich wartości: zdrowie, uzależnienia, relacje rodzinne, psychologia, finanse i prawo.",
        "inLanguage": "pl-PL",
        "isPartOf": { "@id": "https://polskieradio.cc/#website" },
        "about": {
          "@type": "Thing",
          "name": "Pomoc społeczna, wsparcie psychologiczne, prawne i duchowe"
        }
      },
      {
        "@type": "ItemList",
        "name": "Katalog tematów pomocy CC Pomoc",
        "numberOfItems": HELP_PAGES.length,
        "itemListElement": HELP_PAGES.map((p, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": p.title,
          "description": p.desc,
          "url": `https://polskieradio.cc/${p.slug}`
        }))
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Christian Culture",
            "item": "https://polskieradio.cc"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "CC Pomoc",
            "item": "https://polskieradio.cc/help"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Czym jest inicjatywa CC Pomoc?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "CC Pomoc to bezpłatna inicjatywa ekosystemu Christian Culture oferująca ponad 60 merytorycznych podstron wsparcia w trudnych sytuacjach życiowych (długi, depresja, uzależnienia, kryzys małżeński, samotność, kwestie prawne i zdrowotne)."
            }
          },
          {
            "@type": "Question",
            "name": "Czy pomoc oferowana w serwisie jest płatna?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Nie, wszystkie materiały, przewodniki, arkusze i kontakty do zweryfikowanych placówek są w 100% bezpłatne. Christian Culture nie pobiera żadnych opłat od osób szukających wsparcia."
            }
          },
          {
            "@type": "Question",
            "name": "Jak specjaliści mogą dołączyć do wolontariatu CC Pomoc?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Specjaliści (psycholodzy, prawnicy, doradcy finansowi, lekarze, duszpasterze) mogą zgłosić chęć bezpłatnego wsparcia potrzebujących poprzez formularz współpracy na stronie polskieradio.cc/wspolpraca."
            }
          },
          {
            "@type": "Question",
            "name": "Czy serwisy CC Pomoc zastępują profesjonalną opiekę medyczną lub prawną?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Materiały mają charakter edukacyjno-informacyjny i wspierający. Zawsze zalecamy bezpośredni kontakt z wykwalifikowanymi lekarzami, certyfikowanymi psychoterapeutami oraz radcami prawnymi i podajemy oficjalne telefony zaufania."
            }
          }
        ]
      }
    ]
  };

  return `<!doctype html>
<html lang="pl">
<head>
<!-- Google tag (gtag.js) GA4 Standard EkoCC -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y4EFTVBPE3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config','G-Y4EFTVBPE3',(function(){
    try {
      var s = location.search, k = 'cc_team';
      if(/[?&]cc_team=1/.test(s)) localStorage.setItem(k,'1');
      if(/[?&]cc_team=0/.test(s)) localStorage.removeItem(k);
      if(localStorage.getItem(k)==='1'||/[?&]in_mcr=1/.test(s)||window.obsstudio) return {traffic_type:'internal'};
    } catch(e){}
    return {};
  })());
</script>
<script src="/js/cc-analytics.js?v=20261026_1" defer></script>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="googlebot" content="index, follow">
<meta name="bingbot" content="index, follow">

<title>CC Pomoc — Katalog wsparcia tematycznego | Christian Culture</title>
<meta name="description" content="Oficjalny katalog bezpłatnego wsparcia tematycznego Christian Culture. Ponad 60 tematów: zdrowie, uzależnienia, rodzina, depresja, finanse i prawo. Rzetelne informacje i wolontariusze.">
<meta name="author" content="Christian Culture">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Christian Culture">
<meta property="og:title" content="CC Pomoc — Katalog wsparcia tematycznego">
<meta property="og:description" content="Ponad 60 tematycznych stron wsparcia. Znajdź pomoc w swojej sprawie — bezpłatnie, bez oceniania, w duchu chrześcijańskich wartości.">
<meta property="og:url" content="https://polskieradio.cc/help">
<meta property="og:image" content="https://polskieradio.cc/icon.png">
<meta property="og:locale" content="pl_PL">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@ChristianCultPL">
<meta name="twitter:title" content="CC Pomoc — Katalog wsparcia tematycznego">
<meta name="twitter:description" content="Bezpłatne wsparcie w kryzysie: zdrowie, finanse, rodzina, psychologia. Ponad 60 sprawdzonych tematów.">
<meta name="twitter:image" content="https://polskieradio.cc/icon.png">

<link rel="canonical" href="https://polskieradio.cc/help">
<link rel="icon" href="/dlugi/assets/cc-logo.webp" type="image/webp">
<link rel="stylesheet" href="/dlugi/styles.css?v=20261027b">
<link rel="stylesheet" href="/cc-pomoc/catalog.css?v=20261027">

<!-- Structured Data (JSON-LD) for Google, AI Answer Engines & LLMs -->
<script type="application/ld+json">
${JSON.stringify(schemaOrgJSON, null, 2)}
</script>

<style>
  :root {
    --help-gold: #C4A35A;
    --help-gold-hover: #D4B578;
    --help-bg: #0a0a0a;
    --help-card-bg: #131313;
    --help-card-border: rgba(196,163,90,.18);
    --help-card-hover-border: rgba(196,163,90,.55);
    --help-radius: 14px;
    --help-gap: 1rem;
  }
  @media(prefers-color-scheme:light) {
    :root { --help-bg:#f4f4f0; --help-card-bg:#fff; --help-card-border:rgba(0,0,0,.09); }
  }

  .help-hero {
    background: linear-gradient(135deg,#0d1a2a 0%,#0a2a1a 100%);
    padding: 3.5rem 1.25rem 2.5rem;
    text-align: center;
  }
  .help-hero-badge {
    display: inline-block;
    font-size:.75rem; letter-spacing:.12em; text-transform:uppercase;
    color: var(--help-gold); font-weight:700; margin-bottom:.75rem;
  }
  .help-hero h1 {
    font-size: clamp(1.75rem,5vw,2.75rem);
    color: #fff; font-weight:800; margin:0 0 .75rem; line-height:1.15;
  }
  .help-hero p {
    color: rgba(255,255,255,.75); max-width: 560px; margin: 0 auto 1.5rem; font-size:1.05rem;
  }
  .help-hero-stats {
    display:flex; gap:2rem; justify-content:center; flex-wrap:wrap;
  }
  .help-hero-stat { text-align:center; }
  .help-hero-stat strong { display:block; font-size:2rem; color:var(--help-gold); font-weight:800; }
  .help-hero-stat span { font-size:.8rem; color:rgba(255,255,255,.6); text-transform:uppercase; letter-spacing:.08em; }

  .help-search-bar {
    max-width: 540px; margin: 1.75rem auto 0;
    position: relative;
  }
  .help-search-bar input {
    width:100%; padding:.85rem 1.25rem .85rem 3rem;
    border-radius: 999px; border: 1.5px solid var(--help-gold);
    background: rgba(255,255,255,.07); color:#fff; font-size:1rem;
    outline:none; box-sizing:border-box;
  }
  .help-search-bar input::placeholder { color:rgba(255,255,255,.45); }
  .help-search-bar svg { position:absolute; left:1rem; top:50%; transform:translateY(-50%); opacity:.6; }

  .help-main { max-width:1120px; margin:0 auto; padding:2rem 1.25rem 4rem; }

  .help-category { margin-bottom: 2.5rem; }
  .help-cat-title {
    font-size:1.1rem; font-weight:700; color:var(--help-gold);
    margin:0 0 1rem; padding-bottom:.5rem;
    border-bottom: 1px solid var(--help-card-border);
  }
  .help-cards-grid {
    display:grid;
    grid-template-columns: repeat(auto-fill, minmax(220px,1fr));
    gap: var(--help-gap);
  }
  .help-card {
    display:flex; flex-direction:column; gap:.35rem;
    background: var(--help-card-bg);
    border: 1.5px solid var(--help-card-border);
    border-radius: var(--help-radius);
    padding: 1.15rem 1.1rem;
    text-decoration: none;
    transition: border-color .2s, transform .15s, box-shadow .2s;
    min-height: 110px;
  }
  .help-card:hover, .help-card:focus-visible {
    border-color: var(--help-card-hover-border);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(196,163,90,.12);
    outline: none;
  }
  .help-card:focus-visible { outline: 2px solid var(--help-gold); }
  .help-card-emoji { font-size:1.6rem; line-height:1; }
  .help-card-title { font-size:.92rem; font-weight:700; color: #e8e0cc; }
  @media(prefers-color-scheme:light) { .help-card-title { color:#1a1a1a; } }
  .help-card-desc { font-size:.78rem; color:rgba(255,255,255,.55); line-height:1.4; }
  @media(prefers-color-scheme:light) { .help-card-desc { color:rgba(0,0,0,.55); } }

  .help-volunteer-cta {
    background: linear-gradient(135deg,rgba(196,163,90,.12),rgba(196,163,90,.04));
    border: 1.5px solid var(--help-card-border);
    border-radius: var(--help-radius);
    padding: 2.25rem 1.5rem; text-align:center; margin-top:3.5rem;
  }
  .help-volunteer-cta h2 { font-size:1.35rem; color:#e8e0cc; margin:0 0 .5rem; }
  .help-volunteer-cta p { color:rgba(255,255,255,.65); max-width:620px; margin:0 auto 1.25rem; font-size:.95rem; }
  .help-volunteer-btn {
    display:inline-block; padding:.85rem 2.25rem; border-radius:999px;
    background: var(--help-gold); color:#0a0a0a; font-weight:700; font-size:.92rem;
    text-decoration:none; transition: background .2s, transform .1s;
    min-height:44px; min-width:44px;
  }
  .help-volunteer-btn:hover { background: var(--help-gold-hover); transform:scale(1.02); }

  .help-back-link {
    display:inline-flex; align-items:center; gap:.4rem;
    color:var(--help-gold); font-size:.85rem; text-decoration:none;
    padding:.75rem 0; margin-bottom:1rem;
    min-height:44px;
  }
  .help-back-link:hover { text-decoration:underline; }

  @media(max-width:480px) {
    .help-cards-grid { grid-template-columns:1fr; }
    .help-hero-stats { gap:1.25rem; }
  }
</style>
</head>
<body>
<a class="skip" href="#main">Przejdź do treści</a>

<header class="header">
  <div class="header-inner wrap">
    <a class="brand" href="https://polskieradio.cc/" aria-label="Christian Culture">
      <img src="/dlugi/assets/cc-logo.webp" width="66" height="68" alt="Christian Culture">
      <span>CHRISTIAN CULTURE<small>WIARA · WSPARCIE · NADZIEJA</small></span>
    </a>
    <nav class="desktop-nav" aria-label="Nawigacja">
      <a href="https://polskieradio.cc/player">Radio</a>
      <a href="https://polskieradio.cc/lumina">LUMINA</a>
      <a href="https://polskieradio.cc/akademia">Akademia</a>
      <a href="#wolontariat">Zostań specjalistą</a>
    </nav>
    <div class="header-actions">
      <a class="support" href="https://polskieradio.cc/wspieraj">Wspieram to</a>
      <button class="menu-toggle" id="open-menu" type="button" aria-expanded="false" aria-controls="cc-mobile-edge-dialog" aria-label="Otwórz panel">+</button>
    </div>
  </div>
</header>

<div class="help-hero">
  <span class="help-hero-badge">CHRISTIAN CULTURE · CC POMOC</span>
  <h1>Katalog wsparcia tematycznego</h1>
  <p>Bezpłatne strony z rzetelną wiedzą i praktycznym wsparciem. Bez oceniania. Bez obietnic szybkich dróg na skróty. Z szacunkiem do Twojej sytuacji.</p>
  <div class="help-hero-stats">
    <div class="help-hero-stat"><strong>${HELP_PAGES.length}</strong><span>tematów</span></div>
    <div class="help-hero-stat"><strong>5</strong><span>kategorii</span></div>
    <div class="help-hero-stat"><strong>0 zł</strong><span>zawsze bezpłatnie</span></div>
  </div>
  <div class="help-search-bar" role="search">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <input type="search" id="helpSearch" placeholder="Szukaj tematu (np. długi, depresja, małżeństwo)…" aria-label="Szukaj tematu wsparcia" autocomplete="off">
  </div>
</div>

<main id="main" class="help-main">
  <a class="help-back-link" href="https://polskieradio.cc/">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
    Polskie Radio Christian Culture
  </a>

${sectionsHTML}

  <section class="help-volunteer-cta" id="wolontariat" aria-labelledby="vol-heading">
    <h2 id="vol-heading">🙋 Jesteś specjalistą? Chcesz pomóc bezpłatnie?</h2>
    <p>Dołącz do grona wolontariuszy ekosystemu Christian Culture. Poszukujemy psychologów, prawników, doradców finansowych, dietetyków i duszpasterzy, którzy pragną dzielić się wiedzą i wspierać innych bez pobierania opłat.</p>
    <a class="help-volunteer-btn" id="volBtn" href="https://polskieradio.cc/wspolpraca">Zgłoś się jako specjalista →</a>
  </section>
</main>

<script src="/js/cc-mobile-edge.js?v=20261030_edge10" defer></script>
<script>
  // 1. Filtrowanie kart na żywo + telemetria GA4 search
  const searchInput = document.getElementById('helpSearch');
  const cards = document.querySelectorAll('.help-card');
  const sections = document.querySelectorAll('.help-category');
  let searchDebounceTimer = null;

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      cards.forEach(c => c.hidden = false);
      sections.forEach(s => s.hidden = false);
      return;
    }
    cards.forEach(c => {
      const text = c.textContent.toLowerCase();
      c.hidden = !text.includes(q);
    });
    sections.forEach(s => {
      const visible = [...s.querySelectorAll('.help-card')].some(c => !c.hidden);
      s.hidden = !visible;
    });

    // GA4 Search Event (zabezpieczenie 500ms debounce)
    clearTimeout(searchDebounceTimer);
    if (q.length >= 3) {
      searchDebounceTimer = setTimeout(() => {
        if (typeof gtag === 'function') {
          gtag('event', 'search', {
            search_term: q,
            page_location: window.location.href,
            page_title: document.title
          });
        }
      }, 500);
    }
  });

  // 2. GA4 Telemetria kliknięć w karty pomocy
  document.querySelectorAll('.help-card').forEach(card => {
    card.addEventListener('click', () => {
      const slug = card.getAttribute('data-slug');
      const title = card.getAttribute('data-title');
      if (typeof gtag === 'function') {
        gtag('event', 'select_content', {
          content_type: 'help_topic',
          item_id: slug,
          item_name: title
        });
      }
    });
  });

  // 3. GA4 Telemetria kliknięcia CTA wolontariatu
  const volBtn = document.getElementById('volBtn');
  if (volBtn) {
    volBtn.addEventListener('click', () => {
      if (typeof gtag === 'function') {
        gtag('event', 'select_content', {
          content_type: 'volunteer_cta',
          item_name: 'Zgłoś się jako specjalista'
        });
      }
    });
  }
</script>
</body>
</html>`;
}

// ── 4. ZAPIS PLIKÓW HELP.HTML ORAZ HELP/INDEX.HTML ────────────────────────────
function updateHelpPages() {
  const html = buildHelpPageHtml();
  fs.writeFileSync(path.join(ROOT, 'help.html'), html, 'utf8');
  const helpDir = path.join(ROOT, 'help');
  if (!fs.existsSync(helpDir)) fs.mkdirSync(helpDir, { recursive: true });
  fs.writeFileSync(path.join(helpDir, 'index.html'), html, 'utf8');
  console.log("✅ Wygenerowano help.html i help/index.html z JSON-LD, GA4 i Open Graph");
}

// ── 5. AKTUALIZACJA SITEMAPS/PAGES.XML ─────────────────────────────────────────
function updateSitemap() {
  const sitemapPath = path.join(ROOT, 'sitemaps', 'pages.xml');
  if (!fs.existsSync(sitemapPath)) return;
  let xml = fs.readFileSync(sitemapPath, 'utf8');

  // Sprawdź czy /help już istnieje
  if (!xml.includes('<loc>https://polskieradio.cc/help</loc>')) {
    let entries = `
  <url>
    <loc>https://polskieradio.cc/help</loc>
    <lastmod>2026-11-04</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>`;

    for (const p of HELP_PAGES) {
      entries += `
  <url>
    <loc>https://polskieradio.cc/${p.slug}</loc>
    <lastmod>2026-11-04</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
  </url>`;
    }

    xml = xml.replace('</urlset>', entries + '\n</urlset>');
    fs.writeFileSync(sitemapPath, xml, 'utf8');
    console.log("✅ Dodano /help oraz 62 podstrony do sitemaps/pages.xml");
  } else {
    console.log("ℹ️  /help już jest w sitemaps/pages.xml");
  }
}

// ── 6. AKTUALIZACJA LLMS.TXT (OPT Z POD AI / LLM / BOTY) ──────────────────────
function updateLlmsTxt() {
  const llmsPath = path.join(ROOT, 'llms.txt');
  if (!fs.existsSync(llmsPath)) return;
  let content = fs.readFileSync(llmsPath, 'utf8');

  const helpSectionMarker = "### CC Pomoc — Katalog Wsparcia Tematycznego";
  if (!content.includes(helpSectionMarker)) {
    const helpSection = `
### CC Pomoc — Katalog Wsparcia Tematycznego
- **URL**: https://polskieradio.cc/help
- **Opis dla Modeli AI**: Centralny, publiczny katalog bezpłatnego wsparcia tematycznego w ekosystemie Christian Culture. Obejmuje ponad 60 specjalistycznych zagadnień z 5 filarów:
  1. **Zdrowie i styl życia**: aktywność fizyczna (/aktywnosc-fizyczna), cukrzyca (/cukrzyca), nadciśnienie (/nadcisnienie), zdrowe serce (/zdrowe-serce), sen (/zdrowy-sen), sanatoria (/sanatoria), rehabilitacja (/rehabilitacja), dietetyk (/dietetyk).
  2. **Uzależnienia**: alkoholizm (/alkoholizm), hazard (/hazard), narkomania (/narkomania), rzucanie palenia (/rzucanie-palenia), pornografia (/uzaleznienie-od-pornografii), smartfon (/uzaleznienie-od-telefonu), współuzależnienie (/wspoluzaleznienie), terapia (/terapia-uzaleznien).
  3. **Rodzina i relacje**: kryzys małżeński (/kryzys-malzenski), komunikacja (/komunikacja-w-malzenstwie), przemoc domowa (/przemoc-domowa), dziecko a rozwód (/dziecko-a-rozwod), samotny rodzic (/samotny-rodzic), nastolatki (/nastolatki), wychowanie w wierze (/wiara-dzieci).
  4. **Zdrowie psychiczne**: depresja (/depresja), lęk i ataki paniki (/lek), żałoba (/zaloba), trauma (/trauma), stres (/stres), samotność (/samotnosc), cyberprzemoc (/cyberprzemoc), poczucie wartości (/poczucie-wartosci), pomoc psychologiczna (/psycholog).
  5. **Finanse i prawo**: wyjście z długów (/dlugi), upadłość konsumencka (/upadlosc-konsumencka), komornik (/komornik), kredyty i pożyczki (/kredyty), bezpłatna pomoc prawna (/pomoc-prawna), windykacja (/windykacja), prawa konsumenta (/prawa-konsumenta).
- **Zasady i Etyka**: Wszystkie materiały są w 100% bezpłatne (0 zł). Inicjatywa łączy potrzebujących z rzetelną wiedzą, oficjalnymi infoliniami (Niebieska Linia, Telefon Zaufania, UOKiK, NFZ) oraz wolontariuszami specjalistami (nabór: https://polskieradio.cc/wspolpraca). Nie zastępuje diagnozy lekarskiej ani reprezentacji procesowej.
`;
    // Wstaw przed "## Key Platforms & Endpoints" lub na końcu sekcji
    if (content.includes("### 0. Christian Culture Search")) {
      content = content.replace("### 0. Christian Culture Search", helpSection + "\n### 0. Christian Culture Search");
    } else {
      content += "\n" + helpSection;
    }
    fs.writeFileSync(llmsPath, content, 'utf8');
    console.log("✅ llms.txt zaktualizowany o wytyczne dla modeli AI i agentów");
  } else {
    console.log("ℹ️  llms.txt już zawiera sekcję CC Pomoc");
  }
}

// ── 7. SYNCHRONIZACJA Z .PAGES-RELEASE I DESKTOP/@ICC/LUMINA ─────────────────
function syncDistFiles() {
  const prDir = path.join(ROOT, '.pages-release');
  const mirrorDir = "C:\\Users\\czark\\Desktop\\@ICC\\LUMINA";

  const filesToCopy = [
    'help.html',
    path.join('help', 'index.html'),
    path.join('szukaj', 'catalog.json'),
    path.join('data', 'cc-search-index.json'),
    path.join('sitemaps', 'pages.xml'),
    'llms.txt'
  ];

  for (const rel of filesToCopy) {
    const src = path.join(ROOT, rel);
    if (!fs.existsSync(src)) continue;

    // do .pages-release
    const targetPr = path.join(prDir, rel);
    fs.mkdirSync(path.dirname(targetPr), { recursive: true });
    fs.copyFileSync(src, targetPr);

    // do mirrora
    if (fs.existsSync(mirrorDir)) {
      const targetMir = path.join(mirrorDir, rel);
      fs.mkdirSync(path.dirname(targetMir), { recursive: true });
      fs.copyFileSync(src, targetMir);
    }
  }
  console.log("✅ Zsynchronizowano pliki do .pages-release oraz Desktop/@ICC/LUMINA");
}

// ── URUCHOMIENIE ─────────────────────────────────────────────────────────────
console.log("🚀 Rozpoczynam pełne indeksowanie i optymalizację CC Pomoc /help...");
updateHelpPages();
updateSearchIndexes();
updateSitemap();
updateLlmsTxt();
syncDistFiles();
console.log("🎉 Wszystkie operacje zakończone sukcesem!");
