function clampOrVerifyRange(label, str, min, max) {
  const len = String(str || '').length;
  if (len < min || len > max) {
    return { ok: false, label, len, min, max };
  }
  return { ok: true, label, len, min, max };
}

function composeBody(segments) {
  return segments.map(s => String(s || '').trim()).filter(Boolean).join('\n\n');
}

/**
 * Tworzy samodzielny, serdeczny, chrystocentryczny post w języku polskim na Patronite.
 * Każdy cytat biblijny pochodzi bezpośrednio ze zweryfikowanej bazy UBG-2025 z pełną nazwą księgi.
 */
export function generatePatroniteDraft({ cycle, topic, config }) {
  if (!topic) {
    throw new Error('Brak zatwierdzonego tematu do wygenerowania szkicu.');
  }

  let title = '';
  let teaser = '';
  let body = '';
  let question = '';
  let cta = '';
  let hashtags = [];
  let graphicSpec = {
    seriesType: cycle.seriesType,
    headline: 'DOBRO, KTÓRE TWORZYMY',
    accentHeadline: 'RAZEM',
    subtitle: 'Dzięki Tobie docieramy dalej.',
    photoRelPath: topic.photoRelPath,
    altText: '',
  };

  if (topic.id === 'src-biblia-audio-progress') {
    const pub = topic.countPublished || 31;
    const tot = topic.countTotal || 50;
    title = `Dziennik Misji: ${pub} rozdziałów Księgi Rodzaju już w Biblii Audio CC`;
    teaser = `Sprawdź, co nowego pojawiło się w naszej darmowej Biblii Audio oraz jak systematycznie udostępniamy kolejne rozdziały Pisma Świętego bez reklam.`;
    body = composeBody([
      `Drodzy Patroni, rozpoczynamy kolejny tydzień krótkim, rzeczowym sprawozdaniem z tego, co w ostatnich dniach zostało ukończone i przekazane słuchaczom na polskieradio.cc.`,
      `W dziale Biblia Audio Christian Culture (https://polskieradio.cc/biblia-audio) udostępniliśmy już ${pub} z ${tot} rozdziałów Księgi Rodzaju. Każdy opublikowany odcinek przechodzi pełne przygotowanie lektorskie, wyrównanie poziomu głośności do standardu radiowego oraz zapis w formacie do wygodnego odsłuchu w przeglądarce i w drodze.`,
      `Dlaczego to tak ważne dla odbiorców? Wiele osób chce codziennie wracać do Pisma Świętego, ale w zabieganiu łatwiej włączyć im czyste nagranie podczas spaceru, jazdy autem czy wieczornego odpoczynku w domu. Dzięki Wam w całym serwisie nie pojawiają się reklamy przerywające lekturę Słowa Bożego.`,
      `Wsparcie naszej społeczności pozwala utrzymywać infrastrukturę publikacji, archiwum audio i równoległą dystrybucję materiałów na kanałach YouTube całkowicie bezpłatnie dla każdego, kto szuka pokoju i biblijnej prawdy.`,
      `Czy słuchaliście już ostatnich rozdziałów Księgi Rodzaju w naszym odtwarzaczu — i w jakiej porze dnia najchętniej wracacie do nagrań Pisma Świętego?`,
      `Jeśli ten kierunek jest Wam bliski, zajrzyjcie na polskieradio.cc/biblia-audio i udostępnijcie wybrany odcinek osobie, której może dziś dodać otuchy.`,
    ]);
    question = `W jakiej porze dnia najchętniej wracacie do słuchania Pisma Świętego w wersji audio?`;
    cta = `Posłuchaj bezpłatnych rozdziałów Biblii Audio na https://polskieradio.cc/biblia-audio`;
    hashtags = ['#ChristianCulture', '#BibliaAudio', '#Patronite'];
    graphicSpec = {
      seriesType: 'mission-report',
      headline: `${pub} ROZDZIAŁÓW`,
      accentHeadline: 'BIBLII AUDIO CC',
      subtitle: 'Słowo Boże bezpłatnie i bez reklam.',
      photoRelPath: topic.photoRelPath || 'images/ogloszenia-tworcy-wolontariat.jpg',
      altText: `Grafika Dziennik Misji Christian Culture i Patronite: ${pub} rozdziałów Biblii Audio CC dostępnych bezpłatnie na polskieradio.cc`,
    };
  } else if (topic.id === 'src-cc-pomoc-portal') {
    title = `Dziennik Misji: Dział CC Pomoc otwarty dla osób szukających wsparcia`;
    teaser = `Na polskieradio.cc/help działa bezpłatny przewodnik po polskich i angielskich stronach pomocowych na czas samotności, długów, kryzysu i pytań o wiarę.`;
    body = composeBody([
      `Witamy serdecznie na początku nowego tygodnia i dzielimy się owocem pracy, która od początku powstawała z myślą o ludziach w najtrudniejszych momentach życia.`,
      `Na stronie https://polskieradio.cc/help działa rozbudowany dział CC Pomoc, w którym zebraliśmy bezpłatne przewodniki po polsku i angielsku dotyczące bardzo konkretnych spraw: kryzysu emocjonalnego, żałoby, samotności, wychodzenia z długów, trudności w rodzinie, poszukiwania wsparcia prawnego oraz szczerych pytań o Boga i Pismo Święte.`,
      `Chcemy, aby człowiek wpisujący w wyszukiwarkę hasło pełne lęku lub bezradności nie trafiał wyłącznie na zimne fora czy płatne reklamy, lecz na spokojne, rzeczowe miejsce, w którym znajdzie pierwszą orientację, życzliwość i wskazanie dalszej realnej pomocy.`,
      `Wasza obecność na Patronite umożliwia nam rozwijanie takich bezpłatnych miejsc służby niezależnie od komercyjnych algorytmów. To cicha, ale bardzo praktyczna cegiełka niesienia nadziei Ewangelii tam, gdzie brakuje dziś dobrego słowa.`,
      `Który z tematów działu CC Pomoc uważacie dziś za najbardziej potrzebny w otoczeniu Waszych bliskich lub sąsiadów?`,
      `Zobaczcie cały indeks wsparcia na https://polskieradio.cc/help — warto zachować ten adres na wypadek, gdyby ktoś zapytał o pomoc.`,
    ]);
    question = `Który temat wsparcia z działu CC Pomoc jest dziś według Was najbardziej potrzebny?`;
    cta = `Poznaj bezpłatne przewodniki pomocowe na https://polskieradio.cc/help`;
    hashtags = ['#ChristianCulture', '#CCPomoc', '#Nadzieja'];
    graphicSpec = {
      seriesType: 'mission-report',
      headline: 'WSPARCIE W KRYZYSIE',
      accentHeadline: 'DZIAŁ CC POMOC',
      subtitle: 'Rzeczowe przewodniki dostępne bezpłatnie.',
      photoRelPath: topic.photoRelPath || 'images/ogloszenia-infolinia-nadzieja.jpg',
      altText: `Grafika Dziennik Misji: dział CC Pomoc na polskieradio.cc z bezpłatnymi przewodnikami dla osób w trudnej sytuacji`,
    };
  } else if (topic.id === 'src-akademia-kurs-codzienny') {
    const days = topic.countPublished || 51;
    title = `Dziennik Misji: ${days} lekcji kursu Z Biblią za Pan Brat na Akademii CC`;
    teaser = `Codzienna lektura Biblii z prostym komentarzem działa już przez ${days} kolejnych dni w Akademii Christian Culture — bezpłatnie dla każdego.`;
    body = composeBody([
      `Drodzy Patroni, dzielimy się dziś wymiernym efektem naszej codziennej pracy nad przystępnym studium Pisma Świętego w ramach Akademii Christian Culture.`,
      `Na stronie https://polskieradio.cc/akademia opublikowaliśmy już ${days} lekcji Kursu Codziennego „Z Biblią za Pan Brat”. Każdy dzień zawiera konkretny fragment biblijny z Uwspółcześnionej Biblii Gdańskiej, spokojne wyjaśnienie kontekstu oraz krótkie pytania pomagające zastosować treść rozdziału w zwykłych domowych decyzjach.`,
      `Dla wielu odbiorców najważniejsze jest to, że próg wejścia pozostaje bardzo prosty: wystarczy kilka minut rano lub wieczorem przy herbacie, bez konieczności kupowania podręczników ani zakładania płatnych kont. Jednym kliknięciem można też przesłać wybraną lekcję przyjacielowi.`,
      `Regularne wsparcie na Patronite pozwala nam przygotowywać te lekcje dzień po dniu, dbać o oprawę wizualną i utrzymywać cały serwis otwarty dla osób z Polski i z zagranicy. Dziękujemy, że dokładacie do tej pracy swoją wierną cegiełkę.`,
      `Co najbardziej pomaga Wam utrzymywać codzienny rytm czytania Pisma Świętego w trakcie zabieganego tygodnia?`,
      `Odwiedźcie Akademię i zajrzyjcie do dzisiejszej lekcji na https://polskieradio.cc/akademia`,
    ]);
    question = `Co pomaga Wam zachować codzienny spokój na przeczytanie krótkiego fragmentu Biblii?`;
    cta = `Sprawdź dzisiejszą lekcję biblijną na https://polskieradio.cc/akademia`;
    hashtags = ['#ChristianCulture', '#AkademiaCC', '#Biblia'];
    graphicSpec = {
      seriesType: 'mission-report',
      headline: `${days} LEKCJI BIBLII`,
      accentHeadline: 'KURS CODZIENNY',
      subtitle: 'Krok po kroku przez Słowo Boże.',
      photoRelPath: topic.photoRelPath || 'images/ogloszenia-tworcy-wolontariat.jpg',
      altText: `Grafika Dziennik Misji: ${days} opublikowanych lekcji Kursu Codziennego na polskieradio.cc/akademia`,
    };
  } else if (topic.id === 'src-radio-tv-music-collection') {
    const ch = topic.channelCount || 37;
    const alb = topic.albumCount || 27;
    title = `Dziennik Misji: ${ch} kanałów nadawczych oraz ${alb} albumów muzyki Christian Culture`;
    teaser = `Na polskieradio.cc/player i topTEN łączymy całodobowe kanały radiowo-telewizyjne z kolekcją albumów uwielbieniowych oraz instrumentalnych.`;
    body = composeBody([
      `Witajcie, kochani Patroni! Dzisiaj zaglądamy do muzycznej i antenowej części naszego wspólnego dzieła, która działa dla słuchaczy przez całą dobę.`,
      `W odtwarzaczu https://polskieradio.cc/player oraz na liście https://polskieradio.cc/topTEN udostępniamy obecnie ${ch} tematycznych kanałów radiowych i telewizyjnych — od muzyki uwielbieniowej i Biblii Śpiewanej po wykłady biblijne — a katalog albumów Christian Culture obejmuje już ${alb} wydań płytowych udostępnionych również na platformach streamingowych.`,
      `Odbiorcy często piszą, że potrzebują w domu spokojnej przestrzeni dźwiękowej: podczas pracy, odpoczynku lub rodzinnej rozmowy. Zależało nam na tym, aby zamiast przypadkowych treści z internetu można było jednym kliknięciem włączyć uporządkowaną, chrześcijańską alternatywę.`,
      `To właśnie stabilne wsparcie Patronów sprawia, że serwery audio, baza utworów i odtwarzacz mogą służyć za darmo słuchaczom o każdej porze dnia i nocy. Dziękujemy za zaufanie i współtworzenie tej przestrzeni.`,
      `Po jaki rodzaj audycji albo muzyki sięgacie w Christian Culture najczęściej — uwielbienie, instrumenty czy wykłady?`,
      `Włącz wybrany kanał i posłuchaj najnowszych albumów na https://polskieradio.cc/topTEN`,
    ]);
    question = `Po jaki rodzaj audycji lub muzyki sięgacie u nas najczęściej?`;
    cta = `Zobacz zestawienie kanałów i albumów na https://polskieradio.cc/topTEN`;
    hashtags = ['#ChristianCulture', '#MuzykaChrześcijańska', '#RadioCC'];
    graphicSpec = {
      seriesType: 'mission-report',
      headline: `${ch} KANAŁÓW LIVE`,
      accentHeadline: `${alb} ALBUMÓW CC`,
      subtitle: 'Radio, telewizja biblijna i muzyka 24/7.',
      photoRelPath: topic.photoRelPath || 'images/ogloszenia-widget-radio.webp',
      altText: `Grafika Dziennik Misji: ${ch} kanałów radiowo-telewizyjnych i ${alb} albumów muzycznych Christian Culture`,
    };
  } else if (topic.id === 'src-behind-scenes-audio-vod-ccn') {
    title = `Za kulisami CC: jak powstają nagrania Studia Dobrego Słowa i Biblii Audio`;
    teaser = `Pomiędzy pomysłem a publikacją odcinka trwa długa praca nad czystym dźwiękiem, zgodnością z Biblią i przejrzystością przekazu. Zobaczcie nasz warsztat.`;
    body = composeBody([
      `Środowe popołudnie to dobry moment, żeby zaprosić Was za kulisy codziennej pracy nad nagraniami dźwiękowymi i wideo w Christian Culture oraz Studiu Dobrego Słowa.`,
      `Wyzwanie przy produkcji materiałów biblijnych jest bardzo konkretne: łatwo dziś wypuścić w sieć treści robione w pośpiechu, pełne hałasu i błędów tekstowych. My wybraliśmy dłuższą drogę, ponieważ zależy nam na szacunku do Słowa Bożego i do uwagi każdego słuchacza.`,
      `Nad każdym nowym odcinkiem Biblii Audio oraz wykładami publikowanymi w dziale VOD (https://polskieradio.cc/vod) pracujemy etapami: najpierw weryfikujemy tekst w Uwspółcześnionej Biblii Gdańskiej, następnie przygotowujemy nagranie i wielościeżkowy montaż dźwięku z zachowaniem równego poziomu głośności, a na końcu składamy czytelne plansze i napisy bez zbędnego przepychu.`,
      `Ten proces wciąż doskonalimy i porządkujemy, aby kolejne rozdziały Biblii oraz wykłady mogły ukazywać się jeszcze sprawniej w kolejnych tygodniach. Dla całej misji oznacza to materiały, którymi bez wstydu można podzielić się zarówno z osobą wierzącą, jak i kimś, kto dopiero poznaje Ewangelię.`,
      `Czy wolicie krótkie formy audio do posłuchania w biegu, czy dłuższe wykłady i słuchowiska na spokojny wieczór?`,
      `Zobaczcie efekty tej pracy w naszym kinie misyjnym na https://polskieradio.cc/vod`,
    ]);
    question = `Czy wolicie krótkie materiały do posłuchania w drodze, czy dłuższe wykłady na spokojny wieczór?`;
    cta = `Odwiedź Kino VOD Christian Culture pod adresem https://polskieradio.cc/vod`;
    hashtags = ['#ZaKulisamiCC', '#StudioDobregoSłowa', '#ChristianCulture'];
    graphicSpec = {
      seriesType: 'behind-the-scenes',
      headline: 'OD TEKSTU DO',
      accentHeadline: 'CZYSTEGO AUDIO',
      subtitle: 'Kulisy montażu i kontroli jakości nagrań.',
      photoRelPath: topic.photoRelPath || 'images/ogloszenia-sprzet-studio.jpg',
      altText: `Grafika Za kulisami Christian Culture: mikrofon studyjny i stanowisko montażowe audio`,
    };
  } else if (topic.id === 'src-behind-scenes-mobile-lumina-care') {
    title = `Za kulisami CC: porządkujemy blisko 200 miejsc serwisu pod smartfony`;
    teaser = `Gdy serwis szybko rośnie, najważniejsza staje się wygoda na telefonie. Zobaczcie, jak krok po kroku testujemy i upraszczamy cały portal.`;
    body = composeBody([
      `Dziś w serii „Za kulisami” zaglądamy do tej części naszej pracy, której zazwyczaj nie widać na pierwszy rzut oka, a która decyduje o tym, czy ktoś zostanie na stronie dłużej niż kilkanaście sekund.`,
      `Największe wyzwanie? Na https://polskieradio.cc oraz na mapie projektów (https://polskieradio.cc/mapa) działa dziś blisko dwieście powiązanych ze sobą podstron, narzędzi biblijnych, kanałów radiowych, artykułów CCN i profili społeczności LUMINA. Kiedy tyle miejsc rozwija się równolegle, na małych ekranach telefonów łatwo o nakładające się przyciski albo zbyt długie ładowanie.`,
      `Właśnie dlatego prowadzimy teraz spokojną, systematyczną pracę techniczną: ujednolicamy menu mobilne i wielkość przycisków dotykowych, poprawiamy czytelność czcionek oraz uruchamiamy automatyczne testy przed każdą aktualizacją serwisu. Zależy nam też na uproszczeniu przejść między odtwarzaczem, Biblią a społecznością.`,
      `Im mniej barier technicznych stoi na drodze czytelnika korzystającego ze zwykłego smartfona, tym łatwiej mu skupić się na tym, co naprawdę ważne — na modlitwie, lekturze i rozmowie z ludźmi o podobnych wartościach.`,
      `Czy korzystacie z naszych stron głównie na telefonie, czy częściej na komputerze? Chętnie przeczytamy każdą uwagę o wygodzie obsługi.`,
      `Sprawdźcie aktualny układ projektów na interaktywnej mapie: https://polskieradio.cc/mapa`,
    ]);
    question = `Czy korzystacie z polskieradio.cc częściej na smartfonie czy na komputerze?`;
    cta = `Zobacz całą mapę serwisów na https://polskieradio.cc/mapa`;
    hashtags = ['#ZaKulisamiCC', '#polskieradio', '#ChristianCulture'];
    graphicSpec = {
      seriesType: 'behind-the-scenes',
      headline: 'PROSTOTA NA',
      accentHeadline: 'KAŻDYM TELEFONIE',
      subtitle: 'Porządkujemy i testujemy ekosystem CC.',
      photoRelPath: topic.photoRelPath || 'images/ogloszenia-dom-studio.jpg',
      altText: `Grafika Za kulisami CC: porządkowanie ekosystemu polskieradio.cc z myślą o użytkownikach telefonów`,
    };
  } else {
    // Piątek — DZIĘKI, ŻE JESTEŚ (z wersetem zweryfikowanym z UBG-2025)
    const sc = topic.scripture;
    if (!sc) {
      throw new Error('Piątkowy cykl thank-you wymaga zweryfikowanego wersetu biblijnego UBG.');
    }
    const isFirstVerse = topic.id.includes('PSA') || sc.bookCode === 'PSA';
    title = isFirstVerse
      ? `Dzięki, że jesteś: Słowo Boże daje siłę przed rozpoczynającym się szabatem`
      : `Dzięki, że jesteś: pokój nadziei na próg kolejnego szabatu`;
    teaser = `Zatrzymujemy się w piątkowy poranek z wdzięcznością dla naszych Patronów oraz krótką refleksją opartą na fragmencie: ${sc.reference} (UBG).`;
    body = composeBody([
      `Drodzy Patroni i Przyjaciele Christian Culture, w ten piątkowy poranek nie chcemy rozpoczynać od żadnej listy zadań. Najpierw pragniemy po prostu podziękować — Bogu za Jego wierną opiekę przez cały mijający tydzień oraz Wam za serce, modlitwę i obecność przy tym dziele.`,
      `Na dzisiejsze wyciszenie przed wieczornym rozpoczęciem szabatu zabieramy słowa Pisma Świętego z księgi ${sc.book} (rozdział ${sc.chapter}, werset ${sc.verse}, przekład Uwspółcześniona Biblia Gdańska): „${sc.text}”.`,
      `Ten krótki fragment przypomina nam o fundamentalnej prawdzie Ewangelii: bezpieczeństwo i sens naszej codzienności nie opierają się na ludzkiej sile ani na pośpiechu tego świata, ale na wierności Jezusa Chrystusa. W praktyce oznacza to pokój serca pośród zwykłych obowiązków — umiejętność zatrzymania się, odłożenia lęku oraz okazania życzliwości domownikom i sąsiadom.`,
      `Dzięki Waszemu wsparciu na Patronite możemy dalej spokojnie dzielić się żywym Słowem Bożym na stronie https://polskieradio.cc/mojabiblia oraz w codziennym czytaniu bez barier finansowych dla nikogo. Każda dobra myśl i życzliwość wracają tu z podziękowaniem.`,
      `Za co szczególnie pragniecie dziś podziękować Bogu u progu tego odpoczynku — i o co możemy wspólnie się pomodlić?`,
      `Życzymy Wam i Waszym bliskim spokojnego, pełnego pokoju Bożego i błogosławionego szabatu. Zaglądajcie do Pisma Świętego na https://polskieradio.cc/mojabiblia`,
    ]);
    question = `Za co jesteście dziś szczególnie wdzięczni Bogu przed nadchodzącym szabatem?`;
    cta = `Czytaj Pismo Święte w spokoju na https://polskieradio.cc/mojabiblia`;
    hashtags = ['#DziękiŻeJesteś', '#Szabat', '#ChristianCulture'];
    graphicSpec = {
      seriesType: 'thank-you',
      headline: isFirstVerse ? 'DOBRO, KTÓRE' : 'SŁOWO POKOJU',
      accentHeadline: isFirstVerse ? 'TWORZYMY RAZEM' : 'NA DZIEŃ SZABATU',
      subtitle: `${sc.reference} — Uwspółcześniona Biblia Gdańska.`,
      photoRelPath: topic.photoRelPath || (isFirstVerse ? 'images/ogloszenia-biblia-gdanska.jpg' : 'images/ogloszenia-hero.jpg'),
      altText: `Grafika Dzięki, że jesteś: ${sc.reference} z życzeniami błogosławionego szabatu dla Patronów Christian Culture`,
    };
  }

  // Weryfikacja precyzyjnych norm długości (sekcja 6)
  const checks = [
    clampOrVerifyRange('title', title, config.textLimits.titleMin, config.textLimits.titleMax),
    clampOrVerifyRange('teaser', teaser, config.textLimits.teaserMin, config.textLimits.teaserMax),
    clampOrVerifyRange('body', body, config.textLimits.bodyMin, config.textLimits.bodyMax),
  ];

  const failedRange = checks.find(c => !c.ok);
  if (failedRange) {
    throw new Error(`Naruszenie limitu długości pola ${failedRange.label}: ${failedRange.len} znaków (norma ${failedRange.min}–${failedRange.max}).`);
  }

  const sources = [
    {
      sourceName: topic.sourceName,
      sourceRef: topic.sourceRef,
      verifiedDate: topic.verifiedDate,
      status: topic.evidenceStatus,
      publicUrl: topic.publicUrl,
      claim: topic.headlineFact,
    },
  ];

  return {
    jobId: cycle.jobId,
    seriesType: cycle.seriesType,
    seriesLabel: cycle.seriesLabel,
    scheduledForWarsaw: cycle.scheduledForWarsaw,
    prepAtWarsaw: cycle.prepAtWarsaw,
    visibility: cycle.visibility || 'PUBLICZNY',
    notifyPatronsEmail: Boolean(cycle.notifyPatronsEmail),
    topicKey: topic.id,
    title,
    teaser,
    body,
    question,
    cta,
    hashtags: hashtags.slice(0, config.textLimits.maxHashtags || 3),
    scripture: topic.scripture || null,
    altText: graphicSpec.altText,
    graphicSpec,
    sources,
    evidenceStatus: topic.evidenceStatus,
    charCounts: {
      title: title.length,
      teaser: teaser.length,
      body: body.length,
    },
  };
}
