export const batch14Sources = {
  "social": [
    "https://www.gov.pl/web/gov/skorzystaj-z-pomocy-spolecznej",
    "Jak skorzystać z pomocy społecznej — Gov.pl",
    "How to access social assistance in Poland — Gov.pl"
  ],
  "shelter": [
    "https://www.gov.pl/web/rodzina/pomoc-w-postaci-schronienia-posilku-odziezy",
    "Schronienie, posiłek i odzież — Ministerstwo Rodziny",
    "Shelter, meals and clothing — Polish Ministry of Family"
  ],
  "housing": [
    "https://www.gov.pl/web/gov/uzyskaj-dodatek-mieszkaniowy",
    "Dodatek mieszkaniowy — Gov.pl",
    "Housing allowance in Poland — Gov.pl"
  ],
  "migrants": [
    "https://www.gov.pl/web/nieodplatna-pomoc/pomoc-dla-cudzoziemcow",
    "Pomoc prawna dla cudzoziemców — Ministerstwo Sprawiedliwości",
    "Legal aid for foreign nationals — Polish Ministry of Justice"
  ],
  "mediation": [
    "https://www.gov.pl/web/nieodplatna-pomoc/czym-jest-niedoplatna-mediacja",
    "Nieodpłatna mediacja — Ministerstwo Sprawiedliwości",
    "Free mediation — Polish Ministry of Justice"
  ]
};

export const batch14Topics = [
  {
    "id": "social-assistance",
    "route": "pomoc-spoleczna",
    "enRoute": "social-assistance",
    "ref": "Ga 6,2",
    "checkedDate": "18.11.2026",
    "resources": [
      "social"
    ],
    "pl": {
      "name": "Pomoc społeczna",
      "title": "Pomoc społeczna",
      "lead": "Dowiedz się, gdzie zgłosić potrzebę i jak przygotować pierwszą rozmowę.",
      "steps": [
        [
          "Ustal najpilniejszą sprawę",
          "Zapisz, czy w pierwszej kolejności chodzi o jedzenie, schronienie, opiekę lub inne wsparcie."
        ],
        [
          "Skontaktuj się z ośrodkiem",
          "Na stronie gminy znajdź kontakt do ośrodka pomocy społecznej lub centrum usług społecznych."
        ],
        [
          "Zapytaj o dokumenty i termin",
          "Omów sposób zgłoszenia, właściwy kanał przekazania dokumentów oraz przewidywany termin następnego kontaktu."
        ]
      ],
      "guides": [
        [
          "Rozmowa w ośrodku",
          "Opisz potrzeby bez ukrywania pilnych okoliczności. Przed wysłaniem dokumentów sprawdź odbiorcę w oficjalnym wykazie gminy i ustal, które informacje są potrzebne."
        ]
      ],
      "faq": [
        [
          "Czy ośrodek może coś wyjaśnić przed złożeniem podania?",
          "Tak. Zapytaj o właściwy rodzaj zgłoszenia i informacje potrzebne w danej sprawie."
        ]
      ],
      "hope": "List do Galatów 6,2 zachęca do niesienia ciężarów jedni drugich.",
      "alt": "Teczki, kartka do notatek i pióro na jasnym biurku"
    },
    "en": {
      "name": "Social assistance",
      "title": "Social assistance",
      "lead": "Find out where to ask for help and how to prepare for the first conversation.",
      "steps": [
        [
          "Identify the most urgent issue",
          "Write down whether your priority is food, shelter, care or another type of support."
        ],
        [
          "Contact a local centre",
          "Use the Polish municipality website to find its social assistance or social services centre."
        ],
        [
          "Ask about documents and timing",
          "Ask how to apply, how to submit documents securely and when to expect the next contact."
        ]
      ],
      "guides": [
        [
          "Speaking to a service",
          "Describe your needs and mention anything urgent. Before sending documents, verify the recipient in the municipality’s official directory and ask what information they need."
        ]
      ],
      "faq": [
        [
          "Can I ask before applying?",
          "Yes. Ask which application fits your needs and what information you should prepare."
        ]
      ],
      "hope": "Galatians 6:2 encourages people to bear one another’s burdens.",
      "alt": "Document folders, a blank note sheet and a pen on a bright desk"
    }
  },
  {
    "id": "homelessness-support",
    "route": "bezdomnosc",
    "enRoute": "homelessness-support",
    "ref": "Ga 6,2",
    "checkedDate": "18.11.2026",
    "resources": [
      "shelter",
      "social"
    ],
    "crisisFirst": true,
    "pl": {
      "name": "Bezdomność — bezpieczne schronienie",
      "title": "Bezdomność — bezpieczne schronienie",
      "lead": "Jeśli potrzebujesz noclegu, ustal, kto potwierdzi miejsce i warunki przyjęcia.",
      "steps": [
        [
          "Powiedz, że potrzebujesz miejsca dziś",
          "Skontaktuj się z gminnym ośrodkiem lub punktem wskazanym przez gminę. Podaj obszar, w którym przebywasz."
        ],
        [
          "Zapytaj o przyjęcie",
          "Ustal dostępność, godzinę przyjęcia, dojazd oraz warunki związane z mobilnością lub potrzebą opieki."
        ],
        [
          "Sprawdź wsparcie na kolejny dzień",
          "Po ustaleniu noclegu zapytaj też o posiłek, ubranie, pracownika socjalnego i dalsze kroki."
        ]
      ],
      "guides": [
        [
          "Pilne zagrożenie",
          "Jeśli czyjeś życie lub zdrowie jest bezpośrednio zagrożone, zadzwoń pod 112. Sama informacja o placówce w wykazie nie potwierdza, że ma ona wolne miejsce."
        ]
      ],
      "faq": [
        [
          "Czy mogę przyjechać bez zapowiedzi?",
          "Przed wyjazdem potwierdź przyjęcie i godziny, jeśli możesz zadzwonić."
        ]
      ],
      "hope": "List do Galatów 6,2 zachęca do niesienia ciężarów jedni drugich.",
      "alt": "Spokojny fotel, koc i szklanka wody przy jasnym oknie"
    },
    "en": {
      "name": "Homelessness — finding safe shelter",
      "title": "Homelessness — finding safe shelter",
      "lead": "If you need somewhere to sleep, find out who can confirm a place and explain admission.",
      "steps": [
        [
          "Say if you need a place tonight",
          "Contact the local Polish social assistance centre or the service listed by the municipality. Say what area you are in."
        ],
        [
          "Ask about admission",
          "Check availability, admission times, transport and arrangements for mobility or care needs."
        ],
        [
          "Plan for tomorrow",
          "Once shelter is arranged, ask about food, clothing, a social worker and the next steps."
        ]
      ],
      "guides": [
        [
          "Immediate danger",
          "Call 112 in Poland if there is an immediate threat to life or health. A directory listing does not confirm that a facility has a place available."
        ]
      ],
      "faq": [
        [
          "Can I arrive without calling?",
          "If you can call, confirm admission and opening hours before you travel."
        ]
      ],
      "hope": "Galatians 6:2 encourages people to bear one another’s burdens.",
      "alt": "A calm armchair, blanket and glass of water by a bright window"
    }
  },
  {
    "id": "poverty-support",
    "route": "ubostwo",
    "enRoute": "poverty-support",
    "ref": "Ga 6,2",
    "checkedDate": "18.11.2026",
    "resources": [
      "social"
    ],
    "pl": {
      "name": "Ubóstwo — dostępne formy wsparcia",
      "title": "Ubóstwo — dostępne formy wsparcia",
      "lead": "Uporządkuj najpilniejsze potrzeby i przygotuj rozmowę o możliwej pomocy.",
      "steps": [
        [
          "Sprawdź, czego brakuje w tym tygodniu",
          "Wypisz podstawowe potrzeby, np. posiłki, leki, ogrzewanie lub dojazd. Wskaż najpilniejszą."
        ],
        [
          "Zapytaj o pomoc doraźną i dłuższą",
          "Opowiedz pracownikowi socjalnemu o potrzebach i zapytaj o formy wsparcia oraz warunki skorzystania."
        ],
        [
          "Ustal kolejny kontakt",
          "Zapisz, do kogo zadzwonić, jakie dokumenty będą potrzebne i co zrobić, jeśli sytuacja pogorszy się wcześniej."
        ]
      ],
      "guides": [
        [
          "Rozmowa o pieniądzach",
          "Zabierz prostą listę podstawowych kosztów oraz dochodów, jeśli ośrodek jej potrzebuje. Przekazuj dane tylko za pośrednictwem wskazanego, oficjalnego kanału."
        ]
      ],
      "faq": [
        [
          "Co jeśli brakuje mi środków już dziś?",
          "Od razu powiedz o potrzebie pomocy doraźnej i zapytaj o dostępne miejsce jeszcze tego dnia."
        ]
      ],
      "hope": "List do Galatów 6,2 zachęca do niesienia ciężarów jedni drugich.",
      "alt": "Okulary, książka i herbata przy jasnym oknie"
    },
    "en": {
      "name": "Poverty — routes to support",
      "title": "Poverty — routes to support",
      "lead": "Identify what is urgent and prepare to ask about the help available.",
      "steps": [
        [
          "Identify what you need this week",
          "List essentials such as food, medicine, heating or transport. Mark the priority."
        ],
        [
          "Ask about immediate and longer-term help",
          "Explain the needs to a social worker and ask about available support and eligibility."
        ],
        [
          "Arrange the next contact",
          "Record whom to call, which documents are needed and what to do if the situation gets worse before then."
        ]
      ],
      "guides": [
        [
          "Talking about money",
          "Bring a simple list of essential expenses and income if the centre needs it. Share financial information only through an official channel identified by the centre."
        ]
      ],
      "faq": [
        [
          "What if I cannot afford essentials today?",
          "Say that you need immediate help and ask what is available today."
        ]
      ],
      "hope": "Galatians 6:2 encourages people to bear one another’s burdens.",
      "alt": "Reading glasses, a book and tea beside a bright window"
    }
  },
  {
    "id": "housing-crisis",
    "route": "problemy-mieszkaniowe",
    "enRoute": "housing-crisis",
    "ref": "Ga 6,2",
    "checkedDate": "18.11.2026",
    "resources": [
      "housing",
      "shelter",
      "social"
    ],
    "pl": {
      "name": "Kryzys mieszkaniowy — prawa i możliwości",
      "title": "Kryzys mieszkaniowy — prawa i możliwości",
      "lead": "Rozpoznaj, czy potrzebujesz odpowiedzi na pismo, wsparcia w kosztach lub schronienia.",
      "steps": [
        [
          "Ustal pilność",
          "Jeżeli przyszło pismo, zapisz datę odbioru i termin wskazany w dokumencie. Zachowaj kopię."
        ],
        [
          "Zapytaj o wsparcie w kosztach",
          "Skontaktuj się z gminą, by omówić dodatek mieszkaniowy. Zapytaj, jakie dane i dokumenty będą potrzebne."
        ],
        [
          "Skorzystaj z porady przy sporze",
          "Jeśli otrzymałeś wypowiedzenie lub pismo urzędowe, pokaż dokument osobie uprawnionej do udzielenia porady."
        ]
      ],
      "guides": [
        [
          "Jeżeli dziś nie masz noclegu",
          "Skontaktuj się z gminnym ośrodkiem pomocy albo lokalną placówką wskazaną przez gminę. Zapytaj o dzisiejsze przyjęcie, niezależnie od sprawy dodatku."
        ]
      ],
      "faq": [
        [
          "Czy złożenie wniosku pokrywa zaległości?",
          "Samo złożenie wniosku nie rozstrzyga sprawy. Zapytaj gminę o decyzję, a warunki dotyczące zaległości omów z doradcą."
        ]
      ],
      "hope": "List do Galatów 6,2 zachęca do niesienia ciężarów jedni drugich.",
      "alt": "Teczki, kartka do notatek i pióro na jasnym biurku"
    },
    "en": {
      "name": "Housing crisis — rights and options",
      "title": "Housing crisis — rights and options",
      "lead": "Identify whether you need to answer a letter, get help with costs or find shelter.",
      "steps": [
        [
          "Determine urgency",
          "If you received a letter, record the date of receipt and any deadline in it. Keep a copy."
        ],
        [
          "Ask about help with costs",
          "Contact the Polish municipality about housing allowance and ask which information and documents are needed."
        ],
        [
          "Get advice on a dispute",
          "If you received a tenancy termination or official letter, show it to a qualified adviser."
        ]
      ],
      "guides": [
        [
          "If you need a place tonight",
          "Contact the municipal social assistance centre or a shelter listed by the municipality. Ask about tonight’s admission separately from any housing allowance application."
        ]
      ],
      "faq": [
        [
          "Does an application cover overdue rent?",
          "Applying alone does not resolve the issue. Ask the municipality about the decision and discuss arrears with an adviser."
        ]
      ],
      "hope": "Galatians 6:2 encourages people to bear one another’s burdens.",
      "alt": "Document folders, a blank note sheet and a pen on a bright desk"
    }
  },
  {
    "id": "food-assistance",
    "route": "pomoc-zywnosciowa",
    "enRoute": "food-assistance",
    "ref": "Ga 6,2",
    "checkedDate": "18.11.2026",
    "resources": [
      "shelter",
      "social"
    ],
    "pl": {
      "name": "Pomoc żywnościowa i materialna",
      "title": "Pomoc żywnościowa i materialna",
      "lead": "Sprawdź, gdzie można dziś otrzymać posiłek i gdzie pytać o pomoc okresową.",
      "steps": [
        [
          "Powiedz, co jest potrzebne dziś",
          "Zapytaj o najbliższe miejsce wydawania posiłków i sprawdź godziny przed wyjazdem."
        ],
        [
          "Zapytaj o pomoc okresową",
          "Ośrodek pomocy społecznej może wskazać lokalne zasady dostępu oraz aktualne punkty wsparcia."
        ],
        [
          "Sprawdź warunki odbioru",
          "Zapytaj o potrzebne skierowanie, termin oraz możliwość odbioru, jeśli ogranicza Cię stan zdrowia lub transport."
        ]
      ],
      "guides": [
        [
          "Aktualny nabór",
          "Informacja o programie krajowym nie potwierdza terminu wydawania w Twojej gminie. Ustal go bezpośrednio w lokalnym ośrodku lub punkcie dystrybucji."
        ]
      ],
      "faq": [
        [
          "Czy potrzebuję skierowania?",
          "Ustal zasady w konkretnym punkcie. Warunki wydania posiłku mogą różnić się od warunków przyznania paczki."
        ]
      ],
      "hope": "List do Galatów 6,2 zachęca do niesienia ciężarów jedni drugich.",
      "alt": "Rodzinny stół z krzesłami i miską jabłek"
    },
    "en": {
      "name": "Food and material assistance",
      "title": "Food and material assistance",
      "lead": "Find out where to get a meal today and where to ask about ongoing support.",
      "steps": [
        [
          "Describe the immediate need",
          "Ask where the nearest meal service is and check its hours before you travel."
        ],
        [
          "Ask about longer-term support",
          "A Polish social assistance centre can explain local access requirements and current services."
        ],
        [
          "Check collection arrangements",
          "Ask about referrals, timing and collection options if mobility, health or transport makes it difficult."
        ]
      ],
      "guides": [
        [
          "Current availability",
          "A national programme announcement does not confirm dates in your municipality. Ask the local centre or distribution point directly."
        ]
      ],
      "faq": [
        [
          "Do I need a referral?",
          "Check with the service. Meal and food parcel programmes may have different conditions."
        ]
      ],
      "hope": "Galatians 6:2 encourages people to bear one another’s burdens.",
      "alt": "A family dining table with chairs and a bowl of apples"
    }
  },
  {
    "id": "migrant-support",
    "route": "pomoc-uchodzcom",
    "enRoute": "migrant-support",
    "ref": "Ga 6,2",
    "checkedDate": "18.11.2026",
    "resources": [
      "migrants"
    ],
    "pl": {
      "name": "Pomoc dla uchodźców i migrantów",
      "title": "Pomoc dla uchodźców i migrantów",
      "lead": "Ustal, która instytucja może pomóc w sprawie pobytu, dokumentów lub wsparcia.",
      "steps": [
        [
          "Opisz sprawę ogólnie",
          "Zapisz, czy potrzebujesz informacji o pobycie, odpowiedzi na pismo, tłumaczenia lub pomocy socjalnej."
        ],
        [
          "Zapytaj o właściwy kontakt",
          "Przy sprawie prawnej sprawdź punkt nieodpłatnej pomocy prawnej dla cudzoziemców w Polsce."
        ],
        [
          "Potwierdź język i termin",
          "Przy zapisie zapytaj o dostępność porady w Twoim języku, tłumacza oraz potrzebne dokumenty."
        ]
      ],
      "guides": [
        [
          "Dokumenty i prywatność",
          "Sprawy pobytowe zależą od statusu i okoliczności. Przekazuj kopie paszportu lub dokumentów tylko uprawnionej instytucji przez kanał, który sama wskazała."
        ]
      ],
      "faq": [
        [
          "Czy angielska strona gwarantuje poradę po angielsku?",
          "Sprawdź, w jakim języku przyjmuje wybrany punkt i czy umożliwia udział tłumacza."
        ]
      ],
      "hope": "List do Galatów 6,2 zachęca do niesienia ciężarów jedni drugich.",
      "alt": "Teczki, kartka do notatek i pióro na jasnym biurku"
    },
    "en": {
      "name": "Help for refugees and migrants",
      "title": "Help for refugees and migrants",
      "lead": "Find the appropriate service for residence, documents or support.",
      "steps": [
        [
          "Describe the issue in general terms",
          "Write down whether you need residence information, help with a letter, interpreting or social assistance."
        ],
        [
          "Ask for the right contact",
          "For a legal matter, check Poland’s public legal aid information for foreign nationals."
        ],
        [
          "Confirm language and timing",
          "When booking, ask about advice in your language, an interpreter and the documents you need."
        ]
      ],
      "guides": [
        [
          "Documents and privacy",
          "Residence matters depend on status and circumstances. Share passport or document copies only with an authorised service through the channel it provides."
        ]
      ],
      "faq": [
        [
          "Does this English guide guarantee advice in English?",
          "Ask the individual provider which languages it supports and whether an interpreter can take part."
        ]
      ],
      "hope": "Galatians 6:2 encourages people to bear one another’s burdens.",
      "alt": "Document folders, a blank note sheet and a pen on a bright desk"
    }
  },
  {
    "id": "mediation-support",
    "route": "mediacje",
    "enRoute": "mediation-support",
    "ref": "Ga 6,2",
    "checkedDate": "18.11.2026",
    "resources": [
      "mediation"
    ],
    "pl": {
      "name": "Mediacje — rozwiązywanie konfliktów",
      "title": "Mediacje — rozwiązywanie konfliktów",
      "lead": "Sprawdź, czy dobrowolna rozmowa z mediatorem odpowiada obu stronom.",
      "steps": [
        [
          "Nazwij temat rozmowy",
          "Zapisz jedną sprawę do uzgodnienia i to, co każda strona musi móc powiedzieć swobodnie."
        ],
        [
          "Sprawdź warunki mediacji",
          "Zapytaj o dobrowolność, poufność i jej granice, koszty, a także możliwość konsultacji przed ugodą."
        ],
        [
          "Znajdź właściwy punkt",
          "Informacja ministerstwa wskazuje nieodpłatną mediację w ramach polskiego systemu pomocy prawnej."
        ]
      ],
      "guides": [
        [
          "Przemoc i przymus",
          "Jeśli obawiasz się odwetu lub przemocy, zacznij od osobnej konsultacji i pomocy w zapewnieniu bezpieczeństwa. Nieodpłatna mediacja nie obejmuje spraw, w których istnieje uzasadnione podejrzenie przemocy między stronami."
        ]
      ],
      "faq": [
        [
          "Czy muszę podpisać ugodę?",
          "Zapytaj mediatora, jak przerwać rozmowę i jak skonsultować projekt ugody przed podjęciem decyzji."
        ]
      ],
      "hope": "List do Galatów 6,2 zachęca do niesienia ciężarów jedni drugich.",
      "alt": "Biały kwiat, herbata i notes przy spokojnie oświetlonym oknie"
    },
    "en": {
      "name": "Mediation — resolving disputes",
      "title": "Mediation — resolving disputes",
      "lead": "Check whether a voluntary conversation with a mediator suits both sides.",
      "steps": [
        [
          "Define the issue",
          "Write down one issue to resolve and what each party needs to be able to say freely."
        ],
        [
          "Check the terms of mediation",
          "Ask about consent, confidentiality and its limits, costs and whether you can seek advice before agreeing."
        ],
        [
          "Find the appropriate service",
          "The ministry explains where to find free mediation within the Polish legal aid system."
        ]
      ],
      "guides": [
        [
          "Violence and coercion",
          "If you fear retaliation or violence, start with individual advice and safety support. The Polish public legal aid mediation scheme excludes cases where there is reasonable suspicion of violence between the parties."
        ]
      ],
      "faq": [
        [
          "Do I have to sign a settlement?",
          "Ask the mediator how to end the session and how to get advice on a draft agreement before deciding."
        ]
      ],
      "hope": "Galatians 6:2 encourages people to bear one another’s burdens.",
      "alt": "A white flower, tea and a notebook beside a softly lit window"
    }
  },
  {
    "id": "urgent-life-support",
    "route": "pomoc-kryzysowa",
    "enRoute": "urgent-life-support",
    "ref": "Ga 6,2",
    "checkedDate": "18.11.2026",
    "resources": [
      "social"
    ],
    "crisisFirst": true,
    "pl": {
      "name": "Pomoc w nagłych kryzysach życiowych",
      "title": "Pomoc w nagłych kryzysach życiowych",
      "lead": "Zacznij od bezpieczeństwa i ustal właściwe miejsce pomocy na dziś.",
      "steps": [
        [
          "Oceń najpilniejszą potrzebę",
          "Przy bezpośrednim zagrożeniu życia lub zdrowia dzwoń pod 112. W pozostałych sprawach ustal, czy potrzebujesz schronienia czy pilnej rozmowy."
        ],
        [
          "Sprawdź lokalną pomoc",
          "Zapytaj ośrodek pomocy społecznej lub urząd powiatu o ośrodek interwencji kryzysowej, godziny i warunki przyjęcia."
        ],
        [
          "Umów kolejny kontakt",
          "Jeśli możesz, poproś zaufaną osobę o towarzyszenie w drodze, rozmowie lub umówieniu spotkania."
        ]
      ],
      "guides": [
        [
          "Najbliższe godziny",
          "Zapisz czynność, którą możesz wykonać teraz, oraz gdzie zadzwonisz, jeśli sytuacja się zmieni. Informacje o przemocy lub zdrowiu przekazuj uprawnionemu specjaliście."
        ]
      ],
      "faq": [
        [
          "Co podać przy pierwszym kontakcie?",
          "Powiedz, czy jesteś w bezpiecznym miejscu i jakiego wsparcia potrzebujesz teraz."
        ]
      ],
      "hope": "List do Galatów 6,2 zachęca do niesienia ciężarów jedni drugich.",
      "alt": "Spokojny fotel, koc i szklanka wody przy jasnym oknie"
    },
    "en": {
      "name": "Support during a sudden life crisis",
      "title": "Support during a sudden life crisis",
      "lead": "Start with safety and find the appropriate support for today.",
      "steps": [
        [
          "Identify the immediate need",
          "Call 112 in Poland for an immediate threat to life or health. Otherwise, decide whether you need shelter or an urgent conversation."
        ],
        [
          "Find local support",
          "Ask the Polish social assistance centre or county office about its crisis intervention service, hours and admission."
        ],
        [
          "Arrange the next contact",
          "If possible, ask someone you trust to accompany you, be present for a call or help arrange an appointment."
        ]
      ],
      "guides": [
        [
          "The next few hours",
          "Write down what you can do now and whom you will call if the situation changes. Share details of abuse or health concerns only with an appropriate professional."
        ]
      ],
      "faq": [
        [
          "What should I share on the first call?",
          "Explain whether you are somewhere safe and what kind of help you need now."
        ]
      ],
      "hope": "Galatians 6:2 encourages people to bear one another’s burdens.",
      "alt": "A calm armchair, blanket and glass of water by a bright window"
    }
  }
];
