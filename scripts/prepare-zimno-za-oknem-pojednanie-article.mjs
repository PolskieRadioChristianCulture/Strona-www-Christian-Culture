import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageEkoccArticle } from './package-ekocc-article.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export const articleData = {
  portal: 'news',
  type: 'ANALIZA RODZINNO-BIBLIJNA',
  title: 'Zimno za oknem, chłód w domu: od czego zacząć pojednanie?',
  slug: 'zimno-za-oknem-chlod-w-domu-od-czego-zaczac-pojednanie',
  author: 'Cezary Rogowski',
  date: '2026-11-18',
  lead: 'Listopadowa aura za oknem bywa surowa, lecz znacznie dotkliwsze bywa ciche napięcie, które wkrada się między domowników i zamienia wspólną kuchnię lub salon w przestrzeń chłodnych uników. Wielu ludzi szczerze pragnie zgody, ale zatrzymuje ich lęk przed kolejną kłótnią albo przekonanie, że pierwszy krok powinna zrobić druga strona. Pismo Święte oraz rzetelna psychologia relacji wskazują wspólnie, że odbudowa bliskości nie zaczyna się od wymuszania racji, lecz od opanowania emocjonalnego zalania, rozróżnienia między przebaczeniem a pojednaniem oraz spokojnego, odpowiedzialnego gestu w świetle Bożej łaski.',
  sections: [
    {
      heading: '1. SKĄD BIERZE SIĘ DOMOWY CHŁÓD? FIZJOLOGIA ZALANIA EMOCJONALNEGO I MUR MILCZENIA',
      paragraphs: [
        'Chłód w domu rzadko rodzi się z jednego wielkiego dramatu. Częściej wyrasta z drobnych, niedopowiedzianych urazów, przemęczenia i powtarzanych kłótni, po których domownicy zamykają się za bezpieczną barierą milczenia lub zdawkowej uprzejmości. W badaniach nad dynamiką konfliktów małżeńskich i rodzinnych dr John Gottman (m.in. prace opublikowane w „Journal of Consulting and Clinical Psychology” oraz „Journal of Family Psychology”, 1993) opisał to zjawisko jako „mur milczenia” (ang. stonewalling) — moment, w którym jedna ze stron wycofuje się z rozmowy, przestaje odpowiadać i zamyka kontakt emocjonalny.',
        'Co niezwykle istotne z punktu widzenia psychofizjologii, takie wycofanie nie zawsze wynika ze złej woli czy pogardy. Badania laboratoryjne Gottmana wykazały, że mur milczenia bardzo często stanowi reakcję obronną na tzw. zalanie fizjologiczne (physiological flooding). Kiedy w trakcie gwałtownego sporu tętno rośnie powyżej około 100 uderzeń na minutę i aktywuje się reakcja stresowa „walcz lub uciekaj”, organizm traci zdolność spokojnego słuchania, empatii i przetwarzania złożonych argumentów. Próba wymuszenia natychmiastowego rozwiązania konfliktu w takim stanie kończy się zwykle jeszcze większym krzykiem albo całkowitym zamrożeniem rozmowy.',
        'Z tych samych wieloletnich obserwacji płynie jednak bardzo praktyczna nadzieja: stabilne i trwałe rodziny wcale nie są rodzinami bezkonfliktowymi. Zasadniczą różnicą między relacjami pogrążającymi się w wielotygodniowym chłodzie a tymi, które potrafią wracać do ciepła, jest umiejętność podejmowania i przyjmowania drobnych „prób naprawy” (repair attempts) — zwykłych gestów lub słów hamujących eskalację, zanim spór przerodzi się w mur obojętności.'
      ]
    },
    {
      heading: '2. FAKTY PSYCHOLOGICZNE A TEOLOGIA: PRZEBACZENIE TO NIE TO SAMO CO POJEDNANIE',
      paragraphs: [
        'Aby mądrze wyjść z domowego impasu, trzeba wyraźnie oddzielić empiryczne ustalenia psychologii od refleksji teologicznej i uniknąć popularnych uproszczeń. Współczesna psychologia kliniczna — w tym badania zespołu prof. Everetta L. Worthingtona Jr. oraz metaanaliza opublikowana w „Journal of Consulting and Clinical Psychology” (Wade, Hoyt, Kidwell i Worthington, 2014; DOI: 10.1037/a0035268) — podkreśla zasadniczą różnicę między przebaczeniem a pojednaniem. Przebaczenie jest procesem wewnątrzpsychicznym (intrapersonalnym): polega na stopniowym uwalnianiu własnego serca od urazy, goryczy i pragnienia odwetu. Z przywołanej metaanalizy wynika również, że realne przepracowanie krzywdy wymaga czasu — średni postęp w ustrukturyzowanych programach wynosił około 0,1 odchylenia standardowego na godzinę pracy (a sześciogodzinne warsztaty przynosiły średnio ok. 0,6 SD wzrostu przebaczenia i nadziei przy ok. 0,3 SD spadku objawów lęku i depresji). Nie warto więc obwiniać się, jeśli ból nie znika w pięć minut.',
        'Pojednanie jest natomiast procesem dwustronnym (interpersonalnym), który wymaga gotowości obu stron do prawdy, odpowiedzialności i odbudowy zaufania. Z perspektywy klinicznej i etycznej kluczowe jest tutaj kryterium bezpieczeństwa: jeśli w domu dochodzi do przemocy fizycznej, zastraszania lub uporczywego krzywdzenia, ofiara nie ma obowiązku natychmiastowego powrotu do bezbronnej bliskości. Przebaczenie nie polega na zaprzeczeniu faktom ani na przyzwoleniu na dalszą krzywdę, lecz na odmowie oddania złem za złe, przy jednoczesnym stawianiu mądrych granic i szukaniu profesjonalnej lub wspólnotowej ochrony.',
        'Na płaszczyźnie teologicznej — w zgodzie z 28 Zasadami Wiary Kościoła Bożego — chłód w relacjach nie jest jedynie kwestią temperamentów, lecz miejscem, w którym ujawnia się nasza upadła ludzka natura skłonna do dumy i samoobrony. Zbawienie pozostaje wyłącznym darem Bożej łaski przez wiarę w Jezusa Chrystusa (Sola Gratia), a nie nagrodą za perfekcyjne relacje rodzinne. Jednocześnie żywa wiara nie zwalnia nas z odpowiedzialności za słowo i czyn: ponieważ sami zostaliśmy pojednani z Bogiem niezasłużenie, otrzymujemy duchową siłę, by nie pielęgnować zatwardziałości serca wobec najbliższych.'
      ]
    },
    {
      heading: '3. EGZEGEZA BIBLIJNA: „NAJPIERW POJEDNAJ SIĘ ZE SWOIM BRATEM” (MT 5:21–26; 2 KOR 5:18–19 UBG)',
      paragraphs: [
        'Najmocniejsze wezwanie do przełamania chłodu między bliskimi zapisał ewangelista Mateusz w Kazaniu na Górze — programowej mowie Jezusa wygłoszonej w Galilei, w której Zbawiciel odsłania duchowy sens Prawa Bożego. W serii sześciu literackich antytez („Słyszeliście, że powiedziano przodkom... Lecz ja wam mówię...”) Jezus łączy szóste przykazanie Dekalogu („Nie będziesz zabijał”) z lekceważącym gniewem i pogardliwymi słowami w rodzinie oraz wspólnocie (Mt 5:21–22 UBG). Chwilę później przenosi słuchaczy wyobraźnią na dziedziniec świątyni jerozolimskiej, gdzie pobożny człowiek stoi już przy ołtarzu z darem ofiarnym.',
        'Właśnie w tej podniosłej chwili modlitwy i kultu Jezus stawia zaskakujący warunek: „Jeśli więc przyniesiesz swój dar na ołtarz i tam przypomnisz sobie, że twój brat ma coś przeciwko tobie; Zostaw swój dar tam przed ołtarzem, idź i najpierw pojednaj się ze swoim bratem, a potem przyjdź i ofiaruj swój dar” (Mt 5:23–24 UBG). W tekście greckim pada tu czasownik diallassō (Strong G1259), oznaczający zamianę wrogości w zgodę poprzez wyjście naprzeciw i wzajemne ustępstwo. Zwróćmy uwagę na szczegół, który często umyka w pobieżnej lekturze: Jezus nie mówi „jeśli ty masz żal do brata”, lecz „jeśli przypomnisz sobie, że twój brat ma coś przeciwko tobie”. Bóg traktuje zepsute relacje w domu tak poważnie, że prosi o podjęcie inicjatywy nawet wtedy, gdy czujemy się stroną silniejszą lub mniej winną.',
        'Dlaczego jednak człowiek miałby zdobyć się na taki krok, skoro duma podpowiada czekanie na przeprosiny drugiej strony? Odpowiedź daje apostoł Paweł w Drugim Liście do Koryntian, pisanym ok. 55–56 r. po Chr. z Macedonii w atmosferze bolesnych napięć i odbudowy zaufania między apostołem a tamtejszym zborem: „A wszystko to jest z Boga, który nas pojednał ze sobą przez Jezusa Chrystusa i dał nam służbę pojednania. Bóg bowiem był w Chrystusie, jednając świat z samym sobą, nie poczytując ludziom ich grzechów, i nam powierzył to słowo pojednania” (2 Kor 5:18–19 UBG). Greckie pojęcia katallagē (Strong G2643 — pojednanie) i katallassō (G2644) opisują inicjatywę podjętą najpierw przez Boga z czystej łaski. Chrześcijanin nie zaczyna pojednania w domu o własnych siłach ani z poczucia moralnej wyższości — robi to dlatego, że sam pierwszy doświadczył przebaczenia pod krzyżem Chrystusa.'
      ]
    },
    {
      heading: '4. JAK ROZMAWIAĆ BEZ RAN? GRANICE GNIEWU I JĘZYKA WEDŁUG LISTÓW APOSTOLSKICH (EF 4; KOL 3; JK 1)',
      paragraphs: [
        'Kiedy w domu zapada decyzja o rozmowie, wiele dobrych chęci rozbija się o ton głosu i stare nawyki oskarżania. Apostoł Paweł w listach pisanych podczas uwięzienia rzymskiego (ok. 60–62 r. po Chr.) kierował do rodzin w Azji Mniejszej niezwykle trzeźwe wskazówki higieny emocjonalnej. W Liście do Efezjan czytamy: „Gniewajcie się, lecz nie grzeszcie; niech nad waszym gniewem nie zachodzi słońce. Nie dawajcie miejsca diabłu” (Ef 4:26–27 UBG). Pismo Święte nie potępia samego odczucia gniewu (gr. orgē, Strong G3709) jako naturalnego sygnału, że jakaś granica została naruszona. Ostrzega natomiast przed przetrzymywaniem urazy przez kolejne dni i noce, gdyż nieprzepracowany gniew szybko zamienia się w złośliwość, krzyk i podkopuje zaufanie.',
        'Kilka wersetów dalej apostoł przeciwstawia niszczącej zapalczywości konkretną postawę serca: „Wszelka gorycz i zapalczywość, gniew, wrzask i złorzeczenie niech zostaną usunięte spośród was wraz ze wszelką złośliwością. Bądźcie dla siebie nawzajem życzliwi, miłosierni, przebaczając sobie, jak i wam Bóg przebaczył w Chrystusie” (Ef 4:31–32 UBG). W podobnym duchu w Liście do Kolosan Paweł zachęca, by w codziennym współżyciu przyodziać się w „serdeczne miłosierdzie, dobroć, pokorę, łagodność, cierpliwość; Znosząc jedni drugich i przebaczając sobie nawzajem, jeśli ktoś ma skargę przeciw drugiemu: jak i Chrystus przebaczył wam, tak i wy” (Kol 3:12–13 UBG). Wyraźnie widać tu połączenie łaski i odpowiedzialności: mamy sobie wybaczać na wzór Chrystusa, a jednocześnie uczyć się cierpliwego znoszenia codziennych różnic charakteru.',
        'Równie praktyczny jest głos Listu Jakuba i starotestamentowej Księgi Przypowieści: „niech każdy człowiek będzie skory do słuchania, nieskory do mówienia i nieskory do gniewu. Gniew bowiem człowieka nie wykonuje sprawiedliwości Bożej” (Jk 1:19–20 UBG), a „Łagodna odpowiedź uśmierza zapalczywość, a przykre słowa wzniecają gniew” (Przyp 15:1 UBG). Zarazem Biblia zachowuje głęboki realizm wobec granic ludzkich możliwości. Apostoł Paweł w Liście do Rzymian pisze uczciwie: „Jeśli to możliwe, o ile to od was zależy, ze wszystkimi ludźmi żyjcie w pokoju” (Rz 12:18 UBG). Sformułowanie „o ile to od was zależy” uwalnia od fałszywego poczucia winy: odpowiadasz przed Bogiem za zbudowanie swojej połowy mostu, lecz nie możesz zmusić drugiego dorosłego człowieka, by wszedł na niego w tej samej chwili.'
      ]
    },
    {
      heading: '5. OD CZEGO ZACZĄĆ DZIŚ WIECZOREM? 5 KONKRETNYCH KROKÓW KU POJEDNANIU W DOMU',
      paragraphs: [
        'Pojednanie po dniach chłodu nie potrzebuje wielkiej mowy obronnej ani rozliczania przewinień z ostatnich pięciu lat. Redakcja Christian Culture przygotowała pięć spokojnych, sprawdzonych kroków łączących psychologię relacji z mądrością Pisma Świętego, od których można zacząć jeszcze dzisiaj:',
        '1. Zadbaj najpierw o ciszę i uspokojenie emocji, nie rozmawiaj w szczycie napięcia (Przyp 15:1; Ef 4:26 UBG). Jeśli czujesz, że głos drży lub serce bije zbyt szybko, poproś o dwadzieścia minut przerwy — ale zawsze z jasną obietnicą powrotu: „Zależy mi na tym, żebyśmy się dogadali. Potrzebuję kwadransa na ochłonięcie i wrócę do kuchni o 19:30”. Przerwa bez zapowiedzi powrotu pogłębia lęk przed odrzuceniem; przerwa z konkretną godziną przywraca poczucie bezpieczeństwa.',
        '2. Rozpocznij rozmowę w cztery oczy i od własnych uczuć, bez etykietowania drugiej osoby (Mt 18:15 UBG). Jezus zachęcał, by trudne sprawy wyjaśniać najpierw „sam na sam”, z dala od publiczności, dzieci czy mediów społecznościowych. Zamiast słów „zawsze mnie lekceważysz” albo modnych etykiet o „toksyczności”, nazwij konkretny fakt i swoje przeżycie: „Kiedy od kilku dni mijamy się w milczeniu, czuję się samotny i jest mi przykro. Chciałbym zrozumieć, co zabolało cię w mojej ostatniej reakcji”.',
        '3. Zrób małą „próbę naprawy” i przyjmij odpowiedzialność za własną część błędu (Mt 5:24; Jk 1:19 UBG). Zaparz dwie herbaty, usiądź spokojnie przy stole i — nawet jeśli uważasz, że druga strona zawiniła bardziej — zacznij od tego, co sam możesz uczciwie przeprosić: ostrzejszego tonu, zniecierpliwienia, wycofania się w ekran telefonu. W badaniach relacji to właśnie takie drobne gesty wyłączają tryb obronny u rozmówcy i otwierają drzwi do wzajemnego wysłuchania.',
        '4. Zastosuj zasadę cierpliwego słuchania i model REACH w sercu (Kol 3:12–13 UBG). Gdy druga osoba zaczyna mówić o swoim bólu, nie przerywaj jej przygotowywaniem kontrargumentów. Spróbuj spokojnie nazwać fakty bez wyolbrzymiania (Recall), zobaczyć zmęczenie lub lęk kryjący się za jej słowami (Empathize) i świadomie wybrać rezygnację z chęci odegrania się (Altruistic gift), opierając tę decyzję na łasce, którą sam otrzymałeś od Boga.',
        '5. Oddziel gotowość serca od tempa odbudowy zaufania (Rz 12:18 UBG). Jeśli chłód wynikał z poważnego naruszenia zaufania, jedno „przepraszam” jest ważnym początkiem, lecz zaufanie wraca poprzez kolejne tygodnie słowności, dotrzymywania małych obietnic i szacunku dla granic. A gdy rozmowy w domu wciąż kończą się w tym samym ślepym zaułku lub pojawia się lęk przed krzywdą — odważnie poproś o wsparcie dojrzałego chrześcijańskiego doradcę rodzinnego, pastora lub certyfikowanego terapeutę par. Szukanie mądrej pomocy to oznaka odpowiedzialności za dom, a nie porażka wiary.'
      ]
    }
  ],
  conclusion: 'Zimno za oknem nie musi oznaczać trwałej zimy w naszych relacjach. Domowy chłód rzadko ustępuje pod wpływem nakazów czy wyliczania cudzych win, lecz topnieje tam, gdzie ktoś odważy się zatrzymać spiralę złości, wysłuchać drugiego człowieka bez pogardy i wykonać pierwszy, spokojny krok naprzód. Chrześcijańskie pojednanie nie unieważnia prawdy o bólu i nie lekceważy bezpieczeństwa — przeciwnie, zakorzenione w łasce Jezusa Chrystusa (2 Kor 5:18–19 UBG) daje pokorę potrzebną do przeprosin oraz mądrość, by odbudowywać bliskość krok po kroku.',
  cta: 'Zastanów się dziś wieczorem, czy w Twoim domu lub najbliższej rodzinie nie ma sprawy, nad którą od kilku dni „zaszło słońce” (Ef 4:26 UBG). Jeśli jest to bezpieczne i zależy od Ciebie (Rz 12:18 UBG), nie czekaj na idealny nastrój: zaparz ciepłą herbatę, usiądź z bliską osobą bez telefonu w dłoni i zacznij od jednego życzliwego zdania. Możesz też powierzyć tę rozmowę Bogu w krótkiej modlitwie:\n\n„Panie Boże, Ojcze pokoju i wszelkiej pociechy, Ty pierwszy wyszedłeś ku nam z pojednaniem w Jezusie Chrystusie, choć nie mieliśmy w sobie żadnej zasługi. Widzisz chłód, zmęczenie i niedopowiedziane słowa w naszych domach. Uwolnij nasze serca od dumy, zapalczywości i lęku przed rozmową. Naucz nas być skorymi do słuchania, a nieskorymi do gniewu, daj nam pokorę do szczerego przeproszenia za własny błąd oraz mądrość do budowania domu pełnego prawdy, bezpieczeństwa i Twojej miłości. Amen.”\n\n[Status redakcyjny: DO AUTORYZACJI CZŁOWIEKA (L0) — Bramka bezpieczeństwa T4. Proponowany portal docelowy: EkoCC — rodzina i relacje (propozycja kanoniczna /news lub /konflikty-rodzinne — dokładny URL do potwierdzenia przez wydawcę)]',
  sources: [
    {
      name: 'Wade N. G., Hoyt W. T., Kidwell J. E. M., Worthington E. L. Jr. — „Efficacy of psychotherapeutic interventions to promote forgiveness: A meta-analysis”, Journal of Consulting and Clinical Psychology, 2014, Vol. 82(1), s. 154–170 (PMID: 24364794)',
      url: 'https://doi.org/10.1037/a0035268'
    },
    {
      name: 'Gottman J. M. — „The roles of conflict engagement, escalation, and avoidance in marital interaction: A longitudinal view of five types of couples”, Journal of Consulting and Clinical Psychology, 1993, Vol. 61(1), s. 6–15',
      url: 'https://doi.org/10.1037/0022-006X.61.1.6'
    },
    {
      name: 'Gottman J. M. — „A theory of marital dissolution and stability”, Journal of Family Psychology, 1993, Vol. 7(1), s. 57–75 (zalanie fizjologiczne, mur milczenia i próby naprawy)',
      url: 'https://doi.org/10.1037/0893-3200.7.1.57'
    },
    {
      name: 'Uwspółcześniona Biblia Gdańska (UBG) — Ewangelia według św. Mateusza 5:21–26; 18:15; 2 List do Koryntian 5:18–19; List do Efezjan 4:26–32; List do Kolosan 3:12–14; List do Rzymian 12:18; List Jakuba 1:19–20; Księga Przypowieści 15:1, 18',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: 'Strong\'s Greek Concordance (słownik interlinearny MojaBiblia CC) — Hasła: G1259 (diallassō — pojednać się przez wyjście naprzeciw), G2643 (katallagē — pojednanie), G2644 (katallassō — pojednać), G3709 (orgē — gniew)',
      url: 'https://polskieradio.cc/mojabiblia'
    },
    {
      name: '28 Zasad Wiary Kościoła Bożego — Zasady 10 (Zbawienie z łaski przez wiarę), 11 (Wzrost w Chrystusie) oraz 23 (Małżeństwo i rodzina oparte na wzajemnym szacunku)',
      url: 'https://polskieradio.cc'
    }
  ],
  scripture: 'Ewangelia według św. Mateusza 5:23–24 („Zostaw swój dar tam przed ołtarzem, idź i najpierw pojednaj się ze swoim bratem, a potem przyjdź i ofiaruj swój dar”); 2 List do Koryntian 5:18–19 („A wszystko to jest z Boga, który nas pojednał ze sobą przez Jezusa Chrystusa i dał nam służbę pojednania”); List do Efezjan 4:26, 32; List do Kolosan 3:12–14; List do Rzymian 12:18; List Jakuba 1:19–20 (UBG)',
  imagePath: path.join(ROOT, 'images/news/art-zimno-za-oknem-chlod-w-domu-od-czego-zaczac-pojednanie.jpg'),
  imageCaption: 'Ilustracja AI (poglądowa, nieprzedstawiająca konkretnego wydarzenia): Dwa parujące kubki ciepłej herbaty oraz otwarty skórzany notatnik przy drewnianym stole w ciepłym świetle domowej lampy, podczas gdy za oknem widać chłodne listopadowe popołudnie — symbol gotowości do spokojnej rozmowy i pojednania w domu.',
  tags: [
    '@CezaryRogowski',
    '@ChristianCulture',
    '#Pojednanie',
    '#Rodzina',
    '#Przebaczenie',
    '#RelacjeDomowe',
    '#EkoCC',
    '#EkoCC365',
    '#BibliaUBG',
    '#CCNNews'
  ],
  seo: {
    title: 'Zimno za oknem, chłód w domu: od czego zacząć pojednanie?',
    description: 'Jak przerwać mur milczenia w domu? Badania Gottmana i Worthingtona oraz biblijna egzegeza Mt 5:23–24 i 2 Kor 5:18 UBG o drodze do pojednania.',
    keywords: [
      'pojednanie w rodzinie',
      'chłód w domu rozmowa',
      'przebaczenie a pojednanie',
      'mur milczenia stonewalling Gottman',
      'model REACH Worthington',
      'Mateusza 5:24 pojednaj się',
      '2 Koryntian 5:18 służba pojednania',
      'Efezjan 4:26 gniew',
      'Cezary Rogowski',
      'Christian Culture EkoCC'
    ]
  }
};

async function main() {
  console.log('🚀 Przygotowanie pakietu redakcyjnego EkoCC (Slot 15: 2026-11-18)...');
  console.log('Tytuł:', articleData.title);
  console.log('Dział kalendarza: RODZINA | Portal roboczy:', articleData.portal, '(URL docelowy do potwierdzenia L0)');
  console.log('Slug:', articleData.slug);

  if (!fs.existsSync(articleData.imagePath)) {
    throw new Error(`Brak pliku grafiki pod ścieżką: ${articleData.imagePath}`);
  }

  const currentJsonPath = path.join(ROOT, 'scripts/current-article-data.json');
  fs.writeFileSync(currentJsonPath, JSON.stringify(articleData, null, 2), 'utf8');
  console.log(`💾 Zapisano dane artykułu: ${currentJsonPath}`);

  const result = await packageEkoccArticle(articleData);

  console.log('\n============================================================');
  console.log('🎉 PAKIET ARTYKUŁU EkoCC PRZYGOTOWANY POMYŚLNIE!');
  console.log('Status: DO AUTORYZACJI CZŁOWIEKA (L0) — Bramka bezpieczeństwa T4');
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
