export const ROTATIONAL_CTAS = Object.freeze([
  'Przeczytaj dzisiaj fragment Biblii.',
  'Podziel się tym przesłaniem z kimś bliskim.',
  'Zatrzymaj się na chwilę modlitwy.',
  'Napisz w komentarzu „Amen”, jeśli utożsamiasz się się z przesłaniem.'.replace('się się', 'się'),
]);

export const GOSPEL_BOOK_CODES = new Set(['MAT', 'MRK', 'LUK', 'JHN']);

export const THEME_CATALOG = Object.freeze([
  {
    id: 'samotnosc',
    label: 'Samotność — Bóg pamięta o człowieku',
    keywords: [
      'sam', 'opuśc', 'porzuc', 'emmanuel', 'bóg z nami', 'blisko', 'pamięt',
      'sierot', 'towarzysz', 'widzi', 'mnie widzi', 'przy tobie', 'nie jesteś sam',
    ],
    hooks: [
      '📩 Ktoś o Tobie pamięta.',
      '❤️ Nie jesteś zapomniany.',
      '📩 Masz wiadomość na dzisiaj: Bóg jest bliżej, niż myślisz.',
    ],
    reflections: [
      'Nawet jeśli dziś telefon milczy i czujesz, że wszystko musisz udźwignąć w pojedynkę, ten fragment przypomina, że Bóg o Tobie nie zapomniał. Jego obecność w Chrystusie nie zależy od tego, jak głośny jest Twój dzień, ale od Jego wierności. Spróbuj dzisiaj choć na chwilę zaufać, że nie idziesz przez ten dzień sam.',
      'Ludzkie relacje bywają kruche, a poczucie bycia niezauważonym potrafi odebrać radość. Pismo Święte pokazuje nam jednak Boga, który dostrzega każdego człowieka z bliska i wychodzi mu naprzeciw w Jezusie. Niech ta myśl wniesie dziś do Twojego serca spokojną pewność, że jesteś ważny.',
    ],
  },
  {
    id: 'niepokoj',
    label: 'Niepokój — zaufanie i Boży pokój',
    keywords: [
      'pokój', 'pokoj', 'troszcz', 'zmartw', 'niepok', 'ufaj', 'zauf', 'serce',
      'rada pana', 'ostoi', 'wszystko współdziała', 'opatrzno', 'ciężar',
    ],
    hooks: [
      '🤍 Nie musisz wszystkiego dźwigać sam.',
      '💬 Może właśnie tych słów potrzebujesz w natłoku spraw.',
      '🕊️ Zanim pobiegniesz dalej, przeczytaj jedno zdanie o pokoju.',
    ],
    reflections: [
      'Kiedy myśli krążą wokół jutra i rzeczy, na które nie mamy wpływu, łatwo stracić wewnętrzną równowagę. To słowo przypomina, że pokój przychodzi wtedy, gdy oddajemy Bogu to, czego sami nie potrafimy poskładać. W dzisiejszych obowiązkach zrób krok z zaufaniem, zamiast z lękiem.',
      'Współczesny pośpiech często podpowiada nam, że wszystko zależy wyłącznie od naszego wysiłku. Biblia kieruje nasze spojrzenie ku Bogu, który prowadzi historie swoich dzieci mądrzej niż nasze własne plany. Pozwól sobie dziś odłożyć nadmiar napięcia i powierzyć ten dzień Chrystusowi.',
    ],
  },
  {
    id: 'zmeczenie',
    label: 'Zmęczenie — odpoczynek w Chrystusie',
    keywords: [
      'zmęcz', 'spracowan', 'odpocz', 'ukojen', 'sił', 'orły', 'ustan', 'słab',
      'krzepi', 'moc', 'brzem', 'obciążen', 'odnow',
    ],
    hooks: [
      '🤍 Nie musisz wszystkiego dźwigać sam.',
      '☕ Zatrzymaj się na minutę — ten werset jest dla zmęczonego serca.',
      '💬 Jeśli brakuje Ci dziś sił, zatrzymaj się przy tym zdaniu.',
    ],
    reflections: [
      'Zmęczenie nie zawsze bierze się tylko z pracy — często wynika z długiego noszenia trosk w ciszy. Przesłanie Ewangelii zaprasza, by nie udawać silniejszego, niż się jest, lecz przyjść z prawdziwym stanem serca do Chrystusa. Zrób dziś krótką przerwę i pozwól Bogu odnowić Twoje siły.',
      'W świecie, który oczekuje ciągłej wydajności, łatwo zapomnieć o odpoczynku dla duszy. Pismo Święte przypomina, że prawdziwe wytchnienie rodzi się w zaufaniu Bogu, który zna granice naszych możliwości. Ten dzień może być łagodniejszy, gdy przestaniesz nieść wszystko o własnych siłach.',
    ],
  },
  {
    id: 'poczucie_winy',
    label: 'Poczucie winy — przebaczenie i łaska',
    keywords: [
      'grzech', 'przebacz', 'łask', 'miłosierd', 'wyznaj', 'porzuca', 'oczyszcz',
      'usprawiedliw', 'krew', 'pokut', 'wina', 'potępien',
    ],
    hooks: [
      '🌅 Dzisiaj możesz zacząć od nowa.',
      '💬 Bóg nie zamyka drzwi przed szczerym sercem.',
      '❤️ Łaska jest większa niż wczorajszy błąd.',
    ],
    reflections: [
      'Ukrywanie błędów przed sobą i Bogiem tylko pogłębia ciężar sumienia, natomiast szczerość otwiera drogę do wolności. Słowo Boże jasno wskazuje, że przebaczenie jest darem Bożego miłosierdzia przez Jezusa Chrystusa, a nie nagrodą za bezbłędność. Dzisiaj możesz przyjść przed Boga w prawdzie i odetchnąć nowym początkiem.',
      'Często potrafimy surowo oceniać samych siebie za przeszłość, której nie da się cofnąć. Biblia pokazuje jednak drogę szczerego wyznania i przemiany serca, na końcu której czeka miłosierdzie, a nie odrzucenie. Nie pozwól, by dawne potknięcia zatrzymały Cię przed dzisiejszym dobrem.',
    ],
  },
  {
    id: 'strach',
    label: 'Strach — odwaga i Boża obecność',
    keywords: [
      'lęk', 'boisz', 'bój się', 'będę się lękał', 'strach', 'ciemną dolin',
      'odwag', 'mężn', 'z tobą', 'zbawieniem', 'zaufam', 'tarcza', 'schron',
    ],
    hooks: [
      '💬 Może właśnie tych słów potrzebujesz przed trudną rozmową lub decyzją.',
      '🕊️ Zanim ogarnie Cię lęk, przeczytaj to jedno przypomnienie.',
      '🤍 Odwaga zaczyna się tam, gdzie kończy się samotne zmaganie.',
    ],
    reflections: [
      'Strach często podpowiada najczarniejsze scenariusze, zanim jeszcze zrobimy pierwszy krok. Ten werset przypomina, że źródłem wewnętrznego spokoju jest zaufanie Bogu, który pozostaje wierny niezależnie od okoliczności. Kiedy dziś pojawi się obawa, wróć do tej obietnicy i przypomnij sobie, komu ufasz.',
      'Odwaga w rozumieniu Pisma Świętego nie oznacza braku emocji, ale świadome oparcie się na Bogu pośród niepewności. W Chrystusie mamy pewność, że nawet trudne ścieżki nie są poza zasięgiem Jego opieki. Zrób dzisiejszy krok spokojnie, nie oddając steru swojego serca lękowi.',
    ],
  },
  {
    id: 'brak_nadziei',
    label: 'Brak nadziei — nowy początek',
    keywords: [
      'nadziej', 'upada', 'powstaje', 'łzy', 'otrze', 'śmierć', 'zwycięstw',
      'przyszłoś', 'początek', 'hańb', 'pociesz', 'zmartwychwsta', 'rano',
    ],
    hooks: [
      '🌅 Dzisiaj możesz zacząć od nowa.',
      '📩 Wiadomość na trudniejszy poranek: porażka nie ma ostatniego słowa.',
      '❤️ Nawet po upadku można podnieść się z nadzieją.',
    ],
    reflections: [
      'Gdy coś nie wyszło raz czy kolejny, najłatwiej uwierzyć, że nic już się nie zmieni. Słowo Boże niesie jednak inną perspektywę: historia człowieka z Bogiem nie kończy się w miejscu upadku ani łez. W Chrystusie zawsze istnieje droga ku odnowie, która zaczyna się od dzisiejszego zaufania.',
      'Nadzieja biblijna nie jest naiwnym optymizmem, lecz oparciem w obietnicach Boga, który potrafi wyprowadzić dobro nawet z trudnych doświadczeń. To przypomnienie może zmienić Twój sposób patrzenia na dzisiejszy dzień, bo przywraca sens małym krokom naprzód. Nie rezygnuj z dobra, nawet jeśli idziesz powoli.',
    ],
  },
  {
    id: 'wdziecznosc',
    label: 'Wdzięczność — dostrzeganie dobra',
    keywords: [
      'dzięk', 'wdzięczn', 'błogosław', 'dobr', 'raduj', 'pieśn', 'chwał',
      'wielbi', 'dar', 'pasterzem', 'niczego mi nie braknie',
    ],
    hooks: [
      '✨ Zatrzymaj się na chwilę i zauważ dobro, które już masz.',
      '📩 Krótka wiadomość na dziś: wdzięczność zmienia spojrzenie na cały dzień.',
      '🌅 Dobre słowo pomaga dostrzec Bożą troskę w codzienności.',
    ],
    reflections: [
      'W codziennym biegu łatwo skupiać się wyłącznie na tym, czego jeszcze brakuje lub co wymaga naprawy. Tymczasem Pismo Święte uczy dostrzegać Bożą dobroć w zwykłych darach życia, relacjach i sile na kolejny poranek. Spróbuj dziś nazwać choć jedną rzecz, za którą możesz szczerze podziękować Bogu.',
      'Wdzięczne serce nie ignoruje wyzwań, ale odmawia zamknięcia się w narzekaniu. Kiedy patrzymy na życie w świetle Chrystusowej dobroci, nawet drobne chwile odzyskują wartość i sens. Niech ten fragment pomoże Ci spojrzeć dzisiaj na świat z większą życzliwością i spokojem.',
    ],
  },
  {
    id: 'relacje',
    label: 'Relacje — miłość, pojednanie i przebaczenie',
    keywords: [
      'miłoś', 'bliźn', 'brater', 'pokor', 'pych', 'wyniosł', 'przyjaciel',
      'z mądrymi', 'słow', 'język', 'pojedn', 'rodzin', 'dom', 'mąż', 'żon',
    ],
    hooks: [
      '💬 Może właśnie tych słów potrzebujesz przed rozmową z bliską osobą.',
      '🤍 Mądre serce buduje mosty tam, gdzie łatwo o podział.',
      '📩 Dobra relacja zaczyna się od uważnego, pokornego serca.',
    ],
    reflections: [
      'Wiele napięć między ludźmi rodzi się z pośpiechu, uporu lub pragnienia postawienia wyłącznie na swoim. Biblia uczy nas, by kierować się pokorą, mądrością i życzliwością, które otwierają drogę do zgody i zaufania. Jedno spokojne, dobre słowo może dzisiaj odmienić atmosferę w Twoim domu lub pracy.',
      'Relacje potrzebują prawdy połączonej z cierpliwością, bo same dobre chęci czasem nie wystarczają. Przykład Jezusa pokazuje, że prawdziwa siła przejawia się w szacunku, przebaczeniu i trosce o drugiego człowieka. Warto dziś świadomie wybrać budowanie zamiast oceniania.',
    ],
  },
  {
    id: 'trudne_decyzje',
    label: 'Trudne decyzje — Boże prowadzenie i mądrość',
    keywords: [
      'drog', 'krok', 'ścieżk', 'kieruj', 'obmyśl', 'zamysł', 'mądr',
      'rozum', 'słuszn', 'prosta', 'śmierci', 'prowadz', 'wybór', 'zważaj',
    ],
    hooks: [
      '🧭 Zanim podejmiesz ważną decyzję, zatrzymaj się na chwilę.',
      '💬 Może właśnie tych słów potrzebujesz, gdy stoisz na rozdrożu.',
      '📩 Nie każda droga wyglądająca dobrze z zewnątrz prowadzi w bezpieczne miejsce.',
    ],
    reflections: [
      'Codziennie podejmujemy dziesiątki wyborów — czasem drobnych, a czasem wpływających na całe lata życia. To biblijne przypomnienie zachęca, by nie ufać wyłącznie chwilowym emocjom czy pierwszym wrażeniom, ale pytać o Bożą mądrość. Zanim dziś podejmiesz ostateczną decyzję, zatrzymaj się na chwilę refleksji w świetle Słowa Bożego.',
      'Często mamy gotowy plan i oczekujemy jedynie, że wszystko potoczy się dokładnie po naszej myśli. Pismo Święte pokazuje, że prawdziwa dojrzałość polega na oddaniu swoich ścieżek pod mądre prowadzenie Boga. Taka postawa chroni przed pochopnymi błędami i daje spokojniejszą pewność co do kolejnego kroku.',
    ],
  },
  {
    id: 'zbawienie',
    label: 'Zbawienie — ewangelia i życie wieczne',
    keywords: [
      'zbawien', 'jezus', 'chrystus', 'mesjasz', 'syn', 'ewangeli', 'wierzy',
      'życie wieczne', 'umiłował', 'krzyż', 'odkupien', 'światłość',
    ],
    hooks: [
      '❤️ Masz dziś ważną wiadomość o miłości Boga.',
      '📩 Ktoś o Tobie pamięta — oto centrum Dobrej Nowiny.',
      '📖 Jedno zdanie, które nadaje sens całemu życiu.',
    ],
    reflections: [
      'W centrum przesłania Biblii nie stoją ciężkie wymagania, na które człowiek musiałby sam zapracować, lecz dar Bożej łaski objawiony w Jezusie Chrystusie. Zbawienie oznacza pojednanie z Bogiem i nową nadzieję, która wykracza daleko poza doczesne troski. Dzisiaj warto przyjąć to Słowo nie tylko jako dawną historię, ale jako żywe zaproszenie dla własnego serca.',
      'Każdy człowiek szuka sensu, akceptacji i pewności, że jego życie ma trwałą wartość. Ewangelia odpowiada na to poszukiwanie, wskazując na Chrystusa jako jedynego Zbawiciela, który oddał życie z miłości do świata. Zatrzymaj się dziś nad tą prawdą i otwórz serce na Jej światło.',
    ],
  },
]);

export function selectThemeForVerse(verse, recentThemes = []) {
  const haystack = `${verse.text || ''} ${verse.sourceTheme || ''} ${verse.reference || ''}`.toLowerCase();
  const recentSet = new Set(recentThemes.slice(-2));

  let bestTheme = THEME_CATALOG[0];
  let bestScore = -Infinity;

  for (let i = 0; i < THEME_CATALOG.length; i++) {
    const theme = THEME_CATALOG[i];
    let score = 0;
    for (const kw of theme.keywords) {
      if (haystack.includes(kw)) {
        score += kw.length >= 6 ? 3 : 2;
      }
    }
    if (recentSet.has(theme.id)) {
      score -= 1.5;
    }
    // Delikatny deterministyczny tie-breaker zależny od dnia roku
    if (score > bestScore || (score === bestScore && i === Number(verse.day || 0) % THEME_CATALOG.length)) {
      bestScore = score;
      bestTheme = theme;
    }
  }

  const daySeed = Math.abs(Number(verse.day || 1));
  const hook = bestTheme.hooks[daySeed % bestTheme.hooks.length];
  let reflection = bestTheme.reflections[daySeed % bestTheme.reflections.length];

  // Jeśli werset NIE pochodzi z Ewangelii, unikamy sformułowania sugerującego, że to cytat z Ewangelii.
  if (!GOSPEL_BOOK_CODES.has(verse.bookCode)) {
    reflection = reflection.replace('Przesłanie Ewangelii zaprasza', 'Przesłanie Biblii zaprasza');
  }

  const secondaryCta = ROTATIONAL_CTAS[daySeed % ROTATIONAL_CTAS.length];

  return {
    themeId: bestTheme.id,
    themeLabel: bestTheme.label,
    matchScore: bestScore,
    hook,
    reflection,
    secondaryCta,
  };
}
