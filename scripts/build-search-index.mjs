#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';
import ccnArticleRoutes from '../data/ccn-article-routes.js';
import portalsData from './portals_data.cjs';

const ROOT = process.cwd();

// --- 1. CONTEXT GUIDES (INTELIGENTNE PRZEWODNIKI TEMATYCZNE) ---
const CONTEXT_GUIDES = {
  "nadzieja": {
    keywords: ["nadzieja", "nadziei", "nadzieje", "nadzieja w bogu", "brak nadziei", "zwatpienie"],
    topic: "Nadzieja w Bogu i obietnice Pisma Świętego",
    summary: "Biblijna nadzieja (hebr. tikwah, gr. elpis) nie jest życzeniowym myśleniem, lecz niezłomną kotwicą duszy opartą na charakterze Boga. W ekosystemie Christian Culture odkryjesz nadzieję poprzez studium proroctw, słuchanie Słowa i wsparcie w kryzysie.",
    keyVerses: [
      { ref: "Rz 15:13", text: "A Bóg nadziei niech was napełni wszelką radością i pokojem w wierze, abyście obfitowali w nadzieję przez moc Ducha Świętego.", url: "https://polskieradio.cc/mojabiblia" },
      { ref: "Jer 29:11", text: "Gdyż ja znam myśli, które mam o was, mówi Pan, myśli o pokoju, a nie o nieszczęściu, aby dać wam przyszłość i nadzieję.", url: "https://polskieradio.cc/mojabiblia" },
      { ref: "Hbr 11:1", text: "A wiara jest pewnością tego, czego się spodziewamy, przeświadczeniem o tym, czego nie widzimy.", url: "https://polskieradio.cc/mojabiblia" }
    ],
    shortcuts: [
      { title: "Mój Werset Dnia", url: "https://polskieradio.cc/werset-dnia", icon: "✨" },
      { title: "Kurs Apokalipsa — Księga Nadziei", url: "https://polskieradio.cc/kursy/apokalipsa/", icon: "📖" },
      { title: "Książka: Pokonać Goliata", url: "https://polskieradio.cc/pokonac-goliata", icon: "🛡️" },
      { title: "Infolinia Nadziei & Pomoc Duchowa", url: "https://polskieradio.cc/pomoc", icon: "🤝" },
      { title: "Nocne Czuwanie TV (Pokój i obecność Boża)", url: "https://polskieradio.cc/czuwanie", icon: "🌙" }
    ]
  },
  "werset": {
    keywords: ["werset", "werset dnia", "wersety", "slowo na dzis", "cytat z biblii", "cytaty biblijne", "kartka z wersetem"],
    topic: "Słowo Boże na dziś & Wyszukiwarki Wersetów",
    summary: "W ekosystemie Christian Culture masz natychmiastowy dostęp do generatora wersetów dnia, interlinearnej Biblii z kodami Stronga oraz codziennych rozważań biblijnych.",
    keyVerses: [
      { ref: "Ps 119:105", text: "Twoje słowo jest pochodnią dla moich nóg i światłością na mojej ścieżce.", url: "https://polskieradio.cc/mojabiblia" },
      { ref: "Hbr 4:12", text: "Słowo Boże bowiem jest żywe i skuteczne, ostrzejsze niż wszelki miecz obosieczny.", url: "https://polskieradio.cc/mojabiblia" }
    ],
    shortcuts: [
      { title: "Mój Werset Dnia (Generator kart & losowanie)", url: "https://polskieradio.cc/werset-dnia", icon: "✨" },
      { title: "MojaBiblia — Interlinearna Biblia online", url: "https://polskieradio.cc/mojabiblia", icon: "📖" },
      { title: "Dobrze, że jesteś — Codzienne Rozważania Słowa", url: "https://polskieradio.cc/dzj", icon: "🕊️" },
      { title: "Biblia Śpiewana Live (Wersety w pieśniach)", url: "https://polskieradio.cc/biblia-spiewana", icon: "🎵" }
    ]
  },
  "modlitwa": {
    keywords: ["modlitwa", "modlic sie", "intencja", "wstawiennictwo", "jak sie modlic", "ojcze nasz", "prosba o modlitwe"],
    topic: "Modlitwa, Intencje & Zjednoczeni za Polskę",
    summary: "Modlitwa to intymny dialog z żywym Bogiem i duchowy oręż wierzącego. Włącz się w modlitwę wstawienniczą za naród, zgłoś własną intencję lub módl się razem z nami podczas nocnego czuwania.",
    keyVerses: [
      { ref: "Flp 4:6", text: "O nic się zbytnio nie troszczcie, ale we wszystkim w modlitwie i błaganiu z dziękczynieniem powierzcie prośby wasze Bogu.", url: "https://polskieradio.cc/mojabiblia" },
      { ref: "1 Tes 5:17", text: "Nieustannie się módlcie. Za wszystko dziękujcie.", url: "https://polskieradio.cc/mojabiblia" }
    ],
    shortcuts: [
      { title: "Modlitwa & Zjednoczeni za Polskę", url: "https://polskieradio.cc/modlitwa", icon: "🙏" },
      { title: "Nocne Czuwanie TV Live 24/7", url: "https://polskieradio.cc/czuwanie", icon: "🌙" },
      { title: "Duszpasterz Mariusz — Rozmowa i modlitwa", url: "https://polskieradio.cc/lumina.mariusz", icon: "👤" },
      { title: "Dobrze, że jesteś — Modlitwa na każdy dzień", url: "https://polskieradio.cc/dzj", icon: "🕊️" }
    ]
  },
  "swiadectwo": {
    keywords: ["swiadectwo", "swiadectwa", "nawrocenie", "uwolnienie", "pokonac goliata", "cud", "cuda", "uzdrowienie", "narkomania", "nalog", "swiadectwo wiary"],
    topic: "Świadectwa Wiary, Nawrócenia & Uwolnienia",
    summary: "Autentyczne historie przemiany życia, nawrócenia i uwolnienia z książki „Pokonać Goliata” Cezarego Rogowskiego oraz nagrania CCTV Świadectwa. Poznaj moc Bożej łaski w ludzkiej słabości.",
    keyVerses: [
      { ref: "Ap 12:11", text: "A oni zwyciężyli go przez krew Baranka i przez słowo świadectwa swojego.", url: "https://polskieradio.cc/mojabiblia" },
      { ref: "Ps 107:2", text: "Niech to wyznają odkupieni przez Pana, których odkupił z ręki wroga.", url: "https://polskieradio.cc/mojabiblia" }
    ],
    shortcuts: [
      { title: "Katalog 19 Świadectw Wiary", url: "https://polskieradio.cc/swiadectwa", icon: "📖" },
      { title: "Książka: Pokonać Goliata", url: "https://polskieradio.cc/swiadectwa", icon: "🛡️" },
      { title: "CCTV Świadectwa Live 24/7", url: "https://polskieradio.cc/swiadectwa-live.html", icon: "📺" }
    ]
  },
  "lek": {
    keywords: ["lek", "strach", "niepokoj", "depresja", "panika", "leki", "zalamanie", "stres", "bezsennosc"],
    topic: "Uwolnienie od lęku, depresji i Boży pokój",
    summary: "Biblia powtarza ponad 365 razy wezwanie: „Nie bój się!”. Odkryj praktyczne, duchowe i psychologiczne narzędzia przezwyciężania lęku i odzyskania równowagi w Chrystusie.",
    keyVerses: [
      { ref: "Iz 41:10", text: "Nie bój się, bo ja jestem z tobą; nie lękaj się, bo ja jestem twoim Bogiem. Wzmocnię cię, a także ci pomogę.", url: "https://polskieradio.cc/mojabiblia" },
      { ref: "2 Tm 1:7", text: "Albowiem nie dał nam Bóg ducha bojaźni, lecz mocy i miłości, i zdrowego zmysłu.", url: "https://polskieradio.cc/mojabiblia" },
      { ref: "J 14:27", text: "Pokój zostawiam wam, mój pokój daję wam; nie tak jak daje świat, Ja wam daję. Niech się nie trwoży wasze serce ani się nie lęka.", url: "https://polskieradio.cc/mojabiblia" }
    ],
    shortcuts: [
      { title: "Książka: Pokonać Goliata (8 kroków z doliny lęku)", url: "https://polskieradio.cc/pokonac-goliata", icon: "🛡️" },
      { title: "CCN Psychologia — Zdrowie psychiczne i wiara", url: "https://polskieradio.cc/psychologia", icon: "🧠" },
      { title: "Infolinia Nadziei & Pomoc Kryzysowa", url: "https://polskieradio.cc/pomoc", icon: "🤝" },
      { title: "Ambient Sleep Live — Muzyka wyciszająca do snu", url: "https://polskieradio.cc/ambient-sleep-live.html", icon: "✨" }
    ]
  },
  "milosc": {
    keywords: ["milosc", "przebaczenie", "laska", "milosierdzie", "pojednanie", "zranienie", "odrzucenie"],
    topic: "Miłość Boża, Przebaczenie i Uzdrowienie Serca",
    summary: "Bóg jest miłością. Prawdziwa miłość agape nie stawia warunków i ma moc uleczyć najgłębsze traumy, odrzucenie oraz zranienia w relacjach.",
    keyVerses: [
      { ref: "1 J 4:8", text: "Kto nie miłuje, nie zna Boga, gdyż Bóg jest miłością.", url: "https://polskieradio.cc/mojabiblia" },
      { ref: "1 Kor 13:4-7", text: "Miłość jest cierpliwa, jest łaskawa; miłość nie zazdrości, nie przechwala się, nie unosi się pychą...", url: "https://polskieradio.cc/mojabiblia" },
      { ref: "Rz 5:8", text: "Bóg zaś okazuje swoją miłość do nas przez to, że gdy byliśmy jeszcze grzesznikami, Chrystus za nas umarł.", url: "https://polskieradio.cc/mojabiblia" }
    ],
    shortcuts: [
      { title: "Książka: Bóg Jest Miłością", url: "https://polskieradio.cc/bog-jest-miloscia", icon: "❤️" },
      { title: "Książka: Prawda Bez Filtra (Wioletta Rogowska)", url: "https://polskieradio.cc/prawda-bez-filtra", icon: "✨" },
      { title: "CCN Seks & Małżeństwo — Boży zamysł relacji", url: "https://polskieradio.cc/seks", icon: "💍" }
    ]
  },
  "apokalipsa": {
    keywords: ["apokalipsa", "objawienie", "proroctwa", "koniec swiata", "znaki czasu", "antychryst", "baranek", "paruzja", "powrot jezusa"],
    topic: "Księga Apokalipsy, Proroctwa & Nadzieja Końca Wieków",
    summary: "Księga Objawienia nie powstała, by budzić grozę, lecz by odsłonić chwałę Jezusa Chrystusa jako Zwycięskiego Baranka. Poznaj 27 wykładów biblijnych dr. Alfreda Palli.",
    keyVerses: [
      { ref: "Obj 1:3", text: "Błogosławiony, który czyta, i ci, którzy słuchają słów tego proroctwa i strzegą tego, co w nim jest napisane; czas bowiem jest bliski.", url: "https://polskieradio.cc/mojabiblia" },
      { ref: "Obj 21:4", text: "I otrze Bóg wszelką łzę z ich oczu, i śmierci już nie będzie ani smutku, ani krzyku, ani bólu już nie będzie.", url: "https://polskieradio.cc/mojabiblia" }
    ],
    shortcuts: [
      { title: "Kurs Apokalipsa — Pełne 27 Lekcji Online", url: "https://polskieradio.cc/kursy/apokalipsa/", icon: "📖" },
      { title: "Studio Dobrego Słowa (SDS) — Transmisje", url: "https://polskieradio.cc/studium", icon: "🎙️" },
      { title: "Księga Objawienia w MojejBiblii (UBG)", url: "https://polskieradio.cc/mojabiblia", icon: "📜" }
    ]
  },
  "dekalog": {
    keywords: ["dekalog", "przykazania", "prawo boze", "sabat", "sobota", "synaj", "wujek", "bjw"],
    topic: "Dekalog Boży wg Pisma Świętego (Księga Wyjścia 20)",
    summary: "Autentyczne brzmienie Dziesięciu Przykazań Bożych w klasycznym natchnionym przekładzie ks. Jakuba Wujka (BJW) z zachowaniem drugiego przykazania i uświęcenia sabatu.",
    keyVerses: [
      { ref: "Wj 20:1-17", text: "Jam jest Pan, Bóg twój, który cię wywiódł z ziemi egipskiej, z domu niewoli. Nie będziesz miał bogów cudzych przede mną...", url: "https://polskieradio.cc/prawo" },
      { ref: "Mt 5:17", text: "Nie sądźcie, że przyszedłem znieść Prawo albo Proroków. Nie przyszedłem znieść, ale wypełnić.", url: "https://polskieradio.cc/mojabiblia" }
    ],
    shortcuts: [
      { title: "Artykuł: Dziesięć Przykazań Bożych wg Biblii (BJW)", url: "https://polskieradio.cc/news?art=dziesiec-przykazan-bozych-biblia-jakub-wujek-bjw-dekalog", icon: "📜" },
      { title: "CCN Prawo — Etyka biblijna i wolność sumienia", url: "https://polskieradio.cc/prawo", icon: "⚖️" }
    ]
  },
  "pokoj": {
    keywords: ["pokoj", "pokoju", "ukojenie", "wyciszenie", "odpoczynek", "spokoj"],
    topic: "Boży Pokój Przewyższający Wszelki Rozum",
    summary: "Pokój Boży (hebr. Szalom) to nie brak problemów, lecz Boża obecność i panowanie Chrystusa pośród burz codzienności.",
    keyVerses: [
      { ref: "Flp 4:7", text: "A pokój Boży, który przewyższa wszelki rozum, będzie strzegł waszych serc i myśli w Chrystusie Jezusie.", url: "https://polskieradio.cc/mojabiblia" },
      { ref: "Kol 3:15", text: "A pokój Boży niech rządzi w waszych sercach, do którego też jesteście powołani w jednym ciele.", url: "https://polskieradio.cc/mojabiblia" }
    ],
    shortcuts: [
      { title: "Ambient Sleep Live (Wyciszenie i sen z Bogiem)", url: "https://polskieradio.cc/ambient-sleep-live.html", icon: "✨" },
      { title: "Dobrze, że jesteś — Rozważanie o Bożym pokoju", url: "https://polskieradio.cc/dzj", icon: "🕊️" },
      { title: "Nocne Czuwanie TV", url: "https://polskieradio.cc/czuwanie", icon: "🌙" }
    ]
  },
  "wiara": {
    keywords: ["wiara", "wierzyc", "zaufanie", "zaufac", "wiernosc", "swiadectwo"],
    topic: "Wiara, Zaufanie Bogu & Świadectwa",
    summary: "Wiara rodzi się ze słuchania Słowa Bożego (Rz 10:17). Zobacz prawdziwe świadectwa przemiany życia i poznaj fundamenty chrześcijańskiej pewności.",
    keyVerses: [
      { ref: "Rz 10:17", text: "Wiara więc jest ze słuchania, a słuchanie przez słowo Boże.", url: "https://polskieradio.cc/mojabiblia" },
      { ref: "Hbr 11:6", text: "Bez wiary zaś nie można podobać się Bogu; kto bowiem przystępuje do Boga, musi wierzyć, że On jest.", url: "https://polskieradio.cc/mojabiblia" }
    ],
    shortcuts: [
      { title: "Świadectwa Wiary Live", url: "https://polskieradio.cc/swiadectwa", icon: "🎙️" },
      { title: "Akademia Biblijna Christian Culture", url: "https://polskieradio.cc/akademia", icon: "📖" },
      { title: "MojaBiblia — Studium Słowa Bożego", url: "https://polskieradio.cc/mojabiblia", icon: "📜" }
    ]
  },
  "malzenstwo": {
    keywords: ["malzenstwo", "rodzina", "czystosc", "seks", "intymnosc", "zona", "maz", "narzeczenstwo"],
    topic: "Boży Plan dla Małżeństwa, Rodziny i Czystości",
    summary: "Małżeństwo zostało ustanowione przez Boga jako święte przymierze jednego mężczyzny i jednej kobiety na całe życie, będące ziemskim obrazem miłości Chrystusa do Kościoła.",
    keyVerses: [
      { ref: "Rdz 2:24", text: "Dlatego opuści mężczyzna swego ojca i swoją matkę i złączy się ze swoją żoną, i będą jednym ciałem.", url: "https://polskieradio.cc/mojabiblia" },
      { ref: "Ef 5:25", text: "Mężowie, miłujcie swoje żony, jak i Chrystus umiłował kościół i wydał za niego samego siebie.", url: "https://polskieradio.cc/mojabiblia" }
    ],
    shortcuts: [
      { title: "CCN Seks & Małżeństwo", url: "https://polskieradio.cc/seks", icon: "💍" },
      { title: "Książka: Prawda Bez Filtra (Wioletta Rogowska)", url: "https://polskieradio.cc/prawda-bez-filtra", icon: "✨" },
      { title: "CCN Edukacja — Wychowanie dzieci w wierze", url: "https://polskieradio.cc/edukacja", icon: "👨‍👩‍👧‍👦" }
    ]
  },
  "nauka": {
    keywords: ["nauka", "stworzenie", "kosmologia", "fizyka", "biologia", "dna", "ewolucja", "wszechswiat", "genom"],
    topic: "Nauka, Kosmologia i Biologia w Świetle Biblii",
    summary: "Prawdziwa nauka nie przeczy istnieniu Boga, lecz odsłania niesamowity geniusz i precyzję Stwórcy w prawach fizyki, kosmologii oraz kodzie genetycznym DNA.",
    keyVerses: [
      { ref: "Ps 19:2", text: "Niebiosa głoszą chwałę Boga, a dzieło jego rąk obwieszcza nieboskłon.", url: "https://polskieradio.cc/mojabiblia" },
      { ref: "Rz 1:20", text: "To bowiem, co niewidzialne u niego, jego wieczna moc i bóstwo, jest wyraźnie widoczne od stworzenia świata w jego dziełach.", url: "https://polskieradio.cc/mojabiblia" }
    ],
    shortcuts: [
      { title: "CCN Nauka — Kosmologia i Fizyka", url: "https://polskieradio.cc/nauka", icon: "🔬" },
      { title: "CCN Biologia — Genom i Projekt w Naturze", url: "https://polskieradio.cc/biologia", icon: "🧬" },
      { title: "Kurs Codzienny: Dzień 1 — Na początku Bóg", url: "https://polskieradio.cc/kursy/kurscodzienny/dzien-01.html", icon: "🌌" }
    ]
  },
  "historia": {
    keywords: ["historia", "archeologia", "qumran", "zwoje", "starozytnosc", "jerozolima", "wykopaliska", "fosa"],
    topic: "Archeologia Biblijna i Rzetelność Historyczna Pisma",
    summary: "Wykopaliska archeologiczne w Ziemi Świętej, odkrycie zwojów znad Morza Martwego i inskrypcje historyczne nieustannie potwierdzają dokładność biblijnej narracji.",
    keyVerses: [
      { ref: "Łk 1:3-4", text: "Uznałem za właściwe zbadać dokładnie wszystko od początku i tobie po kolei opisać, abyś poznał pewność nauki, w której zostałeś pouczony.", url: "https://polskieradio.cc/mojabiblia" }
    ],
    shortcuts: [
      { title: "CCN Historia — Archeologia Biblijna", url: "https://polskieradio.cc/historia", icon: "🏺" },
      { title: "Artykuł: Odkrycia w Jerozolimie potwierdzają Księgi Królewskie", url: "https://polskieradio.cc/news?art=jerozolima-odkrycia-archeologiczne-fosa-pieczec-potwierdzenie-biblii", icon: "📜" },
      { title: "Studio Dobrego Słowa (SDS)", url: "https://polskieradio.cc/studium", icon: "🏛️" }
    ]
  },
  "muzyka": {
    keywords: ["muzyka", "worship", "uwielbienie", "piesni", "psalmy", "chwala", "adoracja", "cctv24"],
    topic: "Muzyka Chrześcijańska, Uwielbienie & CCTV24 Live",
    summary: "W ekosystemie Christian Culture muzyka uwielbienia gra nieustannie: od nowoczesnego worshipu, przez wersety śpiewane, po chóry i pieśni tradycyjne.",
    keyVerses: [
      { ref: "Ps 150:6", text: "Wszystko, co oddycha, niech chwali Pana! Alleluja!", url: "https://polskieradio.cc/mojabiblia" },
      { ref: "Kol 3:16", text: "Śpiewajcie Bogu w swoich sercach z wdzięcznością psalmy, hymny i pieśni duchowe.", url: "https://polskieradio.cc/mojabiblia" }
    ],
    shortcuts: [
      { title: "CCTV24 Worship TV Live 24/7", url: "https://polskieradio.cc/cctv24-worship.html", icon: "📺" },
      { title: "Biblia Śpiewana Live", url: "https://polskieradio.cc/biblia-spiewana", icon: "🎵" },
      { title: "Radio CC — Kanał Uwielbienie", url: "https://polskieradio.cc/player", icon: "📻" },
      { title: "Śpiewajmy Panu TV", url: "https://polskieradio.cc/spiewajmy-panu", icon: "🎶" }
    ]
  },
  "wsparcie": {
    keywords: ["wsparcie", "wspieraj", "patron", "patroni", "patronat", "mecenas", "mecenasi", "mecenat", "darowizna", "darowizny", "wesprzyj", "ofiara", "ofiary", "dziesiecina", "dziesięcina", "blik", "patronite", "revolut"],
    topic: "Wsparcie Misji Christian Culture — Zostań Patronem lub Mecenasem",
    summary: "Razem niesiemy nadzieję dalej. Dołącz do grona Mecenasów i Patronów misji Christian Culture. Możesz wesprzeć misję przez modlitwę, wolontariat, BLIK, przelew bankowy, Patronite lub Revolut.",
    keyVerses: [
      { ref: "Mt 10:8", text: "Darmo wzięliście, darmo dawajcie.", url: "https://polskieradio.cc/mojabiblia" },
      { ref: "2 Kor 9:7", text: "Każdy niech daje, jak postanowił w sercu, nie z żalem ani z przymusu; radosnego bowiem dawcę miłuje Bóg.", url: "https://polskieradio.cc/mojabiblia" },
      { ref: "Mk 16:15", text: "Idźcie na cały świat i głoście Ewangelię wszelkiemu stworzeniu.", url: "https://polskieradio.cc/mojabiblia" }
    ],
    shortcuts: [
      { title: "Centrum Wsparcia Misji (polskieradio.cc/wspieraj)", url: "https://polskieradio.cc/wspieraj", icon: "❤️" },
      { title: "Zostań Patronem (polskieradio.cc/patron)", url: "https://polskieradio.cc/patron", icon: "🤝" },
      { title: "Klub Mecenasów Misji (polskieradio.cc/mecenas)", url: "https://polskieradio.cc/mecenas", icon: "🏛️" },
      { title: "Profil Patronite Osobowość Plus", url: "https://patronite.pl/osobowoscplus", icon: "✨" }
    ]
  }
};

// --- 2. GŁÓWNE PLATFORMY I MODUŁY EKOSYSTEMU ---
const CORE_PROJECTS = [
{
  title: "Usługi EkoCC — Chrześcijańskie Usługi, Pomoc i Specjaliści z Wartościami",
  category: "Narzędzia i misja",
  url: "https://polskieradio.cc/uslugi",
  description: "Centralny katalog chrześcijańskich usług, całodobowej infolinii wsparcia duchowego, duszpasterstwa, coachingu i rzetelnych fachowców z wartościami.",
  tags: ["usługi", "uslugi", "pomoc", "infolinia nadzieja", "duszpasterz", "coaching", "specjaliści", "fachowcy", "rzemiosło"],
  featured: true
},
{
  title: "Wizytówki EkoCC — Katalog Wszystkich Wizytówek Christian Culture",
  category: "LUMINA i społeczność",
  url: "https://polskieradio.cc/wizytowki",
  description: "Centralny katalog wszystkich 23 wizytówek ekosystemu Christian Culture: Kąciki Ewangelizacyjne (/Żaneta, /Ewa, /CezaryRogowski), służby, projekty z wartościami i profile społeczności LUMINA.",
  tags: ["wizytówki", "wizytowki", "wizytówka", "wizytowka", "katalog wizytówek", "kącik ewangelizacyjny", "profile", "służby", "ogłoszenia"],
  featured: true
},
{
  title: "Rozwiąż problem — Rzuć palenie. Chrześcijański kurs 14 dni",
  category: "Biblia i formacja",
  url: "https://polskieradio.cc/Rozwi%C4%85%C5%BCProblem",
  description: "Bezpłatny chrześcijański kurs rzucania palenia: 14 krótkich lekcji z zadaniem, Biblią w kontekście i modlitwą, plan kryzysowy na głód nikotynowy, timer 5 minut, 52 fiszki, podsumowanie audio i numery Poradni Pomocy Palącym NIO.",
  tags: ["rozwiąż problem", "rozwiaz problem", "rzuć palenie", "rzuc palenie", "rzucanie palenia", "jak rzucić palenie", "papierosy", "nikotyna", "głód nikotynowy", "nałóg", "nalog", "uzależnienie", "kurs", "14 dni", "poradnia pomocy palącym"],
  featured: true
},
{
  title: "Pobierz — Biblioteka Plików Christian Culture",
  category: "Narzędzia i misja",
  url: "https://polskieradio.cc/pobierz",
  description: "Otwarta biblioteka plików Christian Culture: oficjalne logotypy Radio CC i LUMINA, grafiki kampanii (#antyHALLOWEEN, #WspieramTo), materiały audio i wideo.",
  tags: ["pobierz", "pliki", "biblioteka", "logo", "grafiki", "zasoby", "media kit", "identyfikacja", "download"],
  featured: true
},
{
  title: "Kącik Ewangelizacyjny Żanety — CC WOMEN",
  category: "Wiara i świadectwa",
  url: "https://polskieradio.cc/%C5%BBaneta",
  description: "Misja Żanety, świadectwo wideo i Biblia UBG bez opłaty za egzemplarz. Odbiorca pokrywa koszt przesyłki.",
  tags: ["Żaneta", "Zaneta", "CC WOMEN", "Biblia UBG", "świadectwo", "ewangelizacja"],
  featured: false
},
{
  title: "Kącik Ewangelizacyjny Ewy — CC WOMEN",
  category: "Muzyka i świadectwa",
  url: "https://polskieradio.cc/Ewa",
  description: "Nagrania CC WOMEN, muzyka z przesłaniem i pełne świadectwo Ewy „Jak poznałam prawdę?” w PDF.",
  tags: ["Ewa", "CC WOMEN", "świadectwo", "muzyka", "wiara", "ewangelizacja"],
  featured: false
},
{
  "title": "Christian Culture Global (Międzynarodowa Platforma Chrześcijańska)",
  "category": "Radio i audio",
  "url": "https://polskieradio.cc/Global/",
  "description": "Międzynarodowa platforma Christian Culture w 10 językach. Global Radio 24/7, Global Bible, premiery muzyczne JJ Beauvais, playlisty Personality Plus oraz artykuły biblijne i historie wiary.",
  "tags": [
    "global",
    "christian culture global",
    "radio global",
    "global radio",
    "global bible",
    "international",
    "english",
    "jj beauvais",
    "personality plus",
    "worship",
    "world",
    "multilingual"
  ],
  "featured": true
},
{
  "title": "Moje Centrum CC — Twój Osobisty Pulpit (Personal Hub)",
  "category": "LUMINA i społeczność",
  "url": "https://polskieradio.cc/moje-centrum",
  "description": "Prywatny pulpit użytkownika Christian Culture. Zarządzaj swoimi ulubionymi stronami, historią odwiedzin, postępami w Akademii, zapisanymi utworami Biblijnego Uwielbienia, zakładkami MojejBiblii i skrótami LUMINA w jednym miejscu.",
  "tags": [
    "moje centrum",
    "moje centrum cc",
    "personal hub",
    "ulubione",
    "ulubione strony",
    "historia",
    "pulpit",
    "profil",
    "lumina",
    "moje konto",
    "zapisane",
    "zakladki",
    "zakładki",
    "postepy",
    "postępy"
  ],
  "featured": true
},
{
  "title": "Na początku Bóg stworzył niebo i ziemię — Księga Rodzaju 1 (Biblia Śpiewana)",
  "category": "Muzyka i radio",
  "url": "https://polskieradio.cc/BiblijneUwielbienie?chapter=GEN-001",
  "description": "Oficjalny utwór Biblii Śpiewanej: Księga Rodzaju rozdział 1 (Rodzaju 1:1–31). Produkcja Christian Culture, czas trwania: 11:56. Możliwość odsłuchania, udostępnienia i objęcia patronatem.",
  "contentSnippet": "Na początku Bóg stworzył niebo i ziemię. A ziemia była bezkształtna i pusta, i ciemność była nad otchłanią, a Duch Boży unosił się nad wodami. I rzekł Bóg: Niech stanie się światłość! I stała się światłość.",
  "tags": [
    "biblijne uwielbienie",
    "biblia spiewana",
    "biblia śpiewana",
    "ksiega rodzaju",
    "księga rodzaju",
    "rodzaju 1",
    "gen-001",
    "na poczatku bog stworzyl niebo i ziemie",
    "stworzenie swiata",
    "patron rozdzialu",
    "muzyka chrzescijanska"
  ],
  "featured": true
},
  {
    title: "Mój Werset Dnia",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/werset-dnia",
    description: "Minimalistyczna wyszukiwarka Słowa Bożego i generator pięknych kart z wersetami biblijnymi. Wylosuj lub wyszukaj werset na dziś, stwórz grafikę i podziel się nadzieją.",
    tags: ["werset dnia", "mój werset dnia", "wersety biblijne", "słowo na dziś", "cytaty z biblii", "generator kart", "słowo boże", "obietnice boże", "nadzieja", "pokój", "losowanie wersetu"],
    featured: true
  },
  {
    title: "MojaBiblia — Biblia Interlinearna",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/mojabiblia",
    description: "Kompleksowa interlinearna Biblia internetowa z numeracją Stronga, morfologią hebrajską i grecką oraz zestawieniem przekładów: UBG, BW, BT, BG. Pełnotekstowa wyszukiwarka wersetów.",
    tags: ["mojabiblia", "biblia interlinearna", "pismo święte online", "strong", "hebrajski", "greka", "ubg", "bw", "bt", "bg", "wyszukiwarka biblijna", "słownik biblijny"],
    featured: true
  },
  {
    title: "Radio Christian Culture (6 Stacji 24/7)",
    category: "Radio & Live",
    url: "https://polskieradio.cc/player",
    description: "Globalna stacja radiowa Christian Culture nadająca 24/7 bez reklam: Uwielbienie, Biblia Audio, Instrumental Worship, Klasyka Chrześcijańska, Młode Pokolenie i Słowo Nadziei.",
    tags: ["radio cc", "radio chrześcijańskie", "player", "odtwarzacz", "live", "muzyka chrześcijańska", "worship", "biblia audio", "audycje", "stream"],
    featured: true
  },
  {
    title: "Dobrze, że jesteś — Codzienne Rozważania",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/dzj",
    description: "Codzienne poranne inspiracje biblijne i rozważania z lektorem audio TTS, modlitwą dnia oraz wersją tekstową pełną nadziei i budowania wiary.",
    tags: ["dobrze że jesteś", "cuda każdego dnia", "rozważania codzienne", "rozważanie na dziś", "modlitwa dnia", "poranna inspiracja", "tts", "audio", "andrzej thiel"],
    featured: true
  },
  {
    title: "LUMINA — Portal Społecznościowy",
    category: "Społeczność & Relacje",
    url: "https://polskieradio.cc/lumina",
    description: "Ekskluzywny chrześcijański portal społecznościowy wolny od hejtu, manipulacji i algorytmów uzależniających. Tablica świadectw, relacje, profile wierzących i wzajemne budowanie.",
    tags: ["lumina", "portal społecznościowy", "tablica", "posty", "świadectwa", "społeczność chrześcijańska", "profile", "relacje"],
    featured: true
  },
  {
    title: "LumiMess — Chrześcijański Komunikator",
    category: "Społeczność & Relacje",
    url: "https://polskieradio.cc/mess",
    description: "Bezpieczny, zintegrowany komunikator ekosystemu Christian Culture. Bezpośredni kontakt z braćmi i siostrami w wierze, duszpasterzami i zespołem misji.",
    tags: ["lumimess", "czat", "komunikator", "wiadomości prywatne", "rozmowy", "kontakt", "społeczność"],
    featured: true
  },
  {
    title: "Akademia Biblijna Christian Culture",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/akademia",
    description: "Otwarte centrum formacji chrześcijańskiej i studium Pisma Świętego. Dostęp do Kursu Codziennego oraz Kursu Apokalipsa dr. Alfreda Palli.",
    tags: ["akademia biblijna", "kursy biblijne", "szkoła biblijna", "studium pisma", "wykłady", "teologia"],
    featured: true
  },
  {
    title: "Kurs Codzienny: Z Biblią za Pan Brat",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/kursy/kurscodzienny/",
    description: "Systematyczny, 31-dniowy kurs przez Księgę Rodzaju: od Stworzenia, przez Przymierze z Noem i powołanie Abrahama, po narodziny Izaaka. Z wersetami pamięciowymi UBG.",
    tags: ["kurs codzienny", "z biblią za pan brat", "księga rodzaju", "stworzenie", "abraham", "noé", "sodoma", "izaak", "studium"],
    featured: true
  },
  {
    title: "Kurs Apokalipsa — Księga Nadziei",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/kursy/apokalipsa/",
    description: "27 profesjonalnych lekcji biblijnych z dr. Alfredem Pallą (Studio Dobrego Słowa). Odkryj proroctwa Księgi Objawienia jako radosną obietnicę triumfu Baranka i Bożej miłości.",
    tags: ["kurs apokalipsa", "księga nadziei", "alfred palla", "objawienie św jana", "proroctwa", "znaki czasu", "nowe jeruzalem", "baranek", "nadzieja"],
    featured: true
  },
  {
    title: "Kino Chrześcijańskie VOD",
    category: "Media i treści",
    url: "https://polskieradio.cc/vod",
    description: "Legalne, starannie wyselekcjonowane kino chrześcijańskie online: filmy fabularne, biograficzne, biblijne ekranizacje i dokumenty z polskim lektorem lub dubbingiem.",
    tags: ["kino chrześcijańskie", "vod", "filmy biblijne", "filmy o wierze", "kino online", "ekranizacje biblii", "dokumenty"],
    featured: true
  },
  {
    title: "CCTV24 Worship TV Live 24/7",
    category: "Radio & Live",
    url: "https://polskieradio.cc/cctv24-worship.html",
    description: "Całodobowa telewizja muzyki uwielbienia i adoracji w jakości Full HD. Przestrzeń modlitwy, pokoju i Bożej obecności w Twoim domu 24 godziny na dobę.",
    tags: ["cctv24 worship", "telewizja uwielbienia", "live worship", "adoracja", "muzyka chwały", "pieśni uwielbienia", "pokój boży", "worship tv"],
    featured: true
  },
  {
    title: "Biblia Śpiewana Live",
    category: "Radio & Live",
    url: "https://polskieradio.cc/biblia-spiewana",
    description: "Niezwykły kanał radiowo-telewizyjny prezentujący natchnione wersety biblijne i Psalmy w wykonaniach muzycznych. Słowo Boże które śpiewa w Twoim sercu.",
    tags: ["biblia śpiewana", "psalmy śpiewane", "wersety śpiewane", "muzyka biblijna", "słowo boże śpiewane", "uwielbienie"],
    featured: true
  },
  {
    title: "Biblijne Uwielbienie — Cała Biblia w Muzyce (66 ksiąg, 1189 rozdziałów)",
    category: "Muzyka i radio",
    url: "https://polskieradio.cc/BiblijneUwielbienie",
    description: "Oficjalny portal Biblijnego Uwielbienia Christian Culture. Odkrywaj całe Pismo Święte rozdział po rozdziale w pięknej muzyce. 38 utworów dostępnych w oficjalnej playliście YouTube (m.in. Księga Rodzaju, Przypowieści Salomona i Księga Kaznodziei), katalog 1189 rozdziałów, moduł Patron Rozdziału, ulubione i udostępnianie.",
    tags: [
      "biblijne uwielbienie", "uwielbienie", "biblia spiewana", "biblia śpiewana", "spiewana biblia", "śpiewana biblia",
      "worship", "muzyka chrzescijanska", "muzyka chrześcijańska", "suno", "przypowiesci salomona", "przypowieści salomona",
      "kaznodzieja", "piesn nad piesniami", "pieśń nad pieśniami", "spiewajmy panu", "śpiewajmy panu", "66 ksiag", "1189 rozdzialow",
      "psalmy", "radio 24/7", "patron rozdzialu", "patron rozdziału", "rodzaju 1",
      "karaoke", "karaoke biblijne", "spiewnik", "śpiewnik", "worship mode", "tryb pelnoekranowy", "tryb pełnoekranowy"
    ],
    featured: true
  },
  {
    title: "topTEN — Notowanie Muzyki Chrześcijańskiej na żywo (lista przebojów)",
    category: "Muzyka i radio",
    url: "https://polskieradio.cc/topTEN/",
    description: "Oficjalna lista przebojów Polskiego Radia Christian Culture. Ranking na żywo liczony z głosów słuchaczy: LubięTO (+777 pkt raz dziennie) i PodbijTO (+77 pkt do 7 razy dziennie). Tygodniowe notowania, archiwum, teledyski, udostępnianie utworów i bezpośrednie wsparcie artystów wspieramTO. Wszystkie utwory z historii notowań oglądasz na oficjalnym kanale YouTube topTEN | Christian Culture.",
    tags: ["topten", "top ten", "top 10", "lista przebojów", "lista przebojow", "notowanie", "notowania", "ranking muzyki",
      "muzyka chrześcijańska", "muzyka chrzescijanska", "głosowanie", "glosowanie", "lubięto", "lubieto", "podbijto",
      "wspieramto", "przeboje", "worship", "gospel", "teledyski", "christian music chart", "youtube topten", "kanał youtube", "kanal youtube", "toptenchristianculture"],
    featured: true
  },
  {
    title: "topTEN — Zgłoś utwór do notowań (nominacja)",
    category: "Muzyka i radio",
    url: "https://polskieradio.cc/topTEN/nominacje/",
    description: "Formularz nominacji utworu do listy przebojów topTEN. Zgłoś swojego ulubionego artystę chrześcijańskiego lub własny utwór z teledyskiem — redakcja weryfikuje przesłanie biblijne i prawa.",
    tags: ["nominacja", "zgłoś utwór", "zglos utwor", "zgłoszenie", "topten nominacje", "artysta chrześcijański", "dodaj piosenkę"]
  },
  {
    title: "topTEN — Regulamin notowań i programu wspieramTO",
    category: "Muzyka i radio",
    url: "https://polskieradio.cc/topTEN/regulamin/",
    description: "Zasady głosowania LubięTO i PodbijTO, punktacja 777/77, tygodniowy cykl notowań, nominacje i bezpośrednie wsparcie artystów.",
    tags: ["regulamin topten", "zasady głosowania", "punktacja", "777", "77", "wspieramto regulamin"]
  },
  {
    title: "Karaoke Biblijne & Śpiewnik Słowa Bożego — Biblijne Uwielbienie (Tryb Pełnoekranowy Worship Mode)",
    category: "Muzyka i radio",
    url: "https://polskieradio.cc/karaoke",
    description: "Profesjonalny tryb pełnoekranowy Karaoke Biblijnego i Śpiewnik Słowa Bożego na polskieradio.cc/karaoke. Zsynchronizowany tekst biblijny słowo po słowie, akompaniament muzyczny, podświetlanie fraz, kinowy tryb uwielbienia (Fullscreen Worship Mode) z grafiką w blasku krzyża i 3-stopniowym dimmerem (60%, 75%, 90%) na komputery, telefony, tablety i telewizory TV.",
    tags: [
      "karaoke", "karaoke biblijne", "spiewnik", "śpiewnik", "spiewnik chrzescijanski", "śpiewnik chrześcijański",
      "biblia spiewana", "biblia śpiewana", "spiewana biblia", "śpiewana biblia",
      "uwielbienie", "biblijne uwielbienie", "worship", "worship mode",
      "tryb pelnoekranowy", "tryb pełnoekranowy", "fullscreen", "fullscreen worship",
      "tekst spiewany", "tekst śpiewany", "slowa piesni", "słowa pieśni",
      "spiewaj", "śpiewaj", "czytaj biblie", "czytaj biblię",
      "ubg 2025", "akompaniament", "podklad muzyczny", "podkład muzyczny",
      "wspolne spiewanie", "wspólne śpiewanie", "piesni uwielbienia", "pieśni uwielbienia",
      "nabozenstwo", "nabożeństwo", "telewizor", "tv", "projektor"
    ],
    featured: true
  },
  {
    title: "Studio Dobrego Słowa (SDS)",
    category: "Media i treści",
    url: "https://polskieradio.cc/studium",
    description: "Partner misyjny Christian Culture prowadzony przez dr. Alfreda Pallę. Wykłady biblijne, seria Apokalipsa, archeologia biblijna i prawda Pisma Świętego.",
    tags: ["studio dobrego słowa", "sds", "alfred palla", "wykłady biblijne", "studium", "archeologia biblijna", "prawda pisma"],
    featured: true
  },
  {
    title: "Modlitwa & Zjednoczeni za Polskę",
    category: "Biblia i formacja",
    url: "https://polskieradio.cc/modlitwa",
    description: "Ogólnopolska ściana modlitwy wstawienniczej i duchowego zjednoczenia. Składaj swoje intencje, módl się za innych oraz za duchowe przebudzenie w Polsce.",
    tags: ["modlitwa", "zjednoczeni za polskę", "intencje modlitewne", "wstawiennictwo", "ściana modlitwy", "modlitwa o uzdrowienie", "ojczyzna"],
    featured: true
  },
  {
    title: "Świadectwa Wiary Live",
    category: "Media i treści",
    url: "https://polskieradio.cc/swiadectwa",
    description: "Prawdziwe, poruszające historie nawróceń, uwolnień z nałogów i Bożych cudów w życiu współczesnych Polaków. Dowód na to, że Jezus żyje i działa dzisiaj.",
    tags: ["świadectwa", "cuda boże", "nawrócenie", "uwolnienie", "uzdrowienie", "historie wiary", "bóg działa"],
    featured: false
  },
  {
    title: "Śpiewajmy Panu TV",
    category: "Radio & Live",
    url: "https://polskieradio.cc/spiewajmy-panu",
    description: "Tradycyjne i współczesne pieśni chrześcijańskie, chóry i hymny kościelne emitowane całodobowo z tekstami na ekranie.",
    tags: ["śpiewajmy panu", "pieśni kościelne", "hymny", "chóry", "tradycyjne pieśni", "uwielbienie"],
    featured: false
  },
  {
    title: "Nocne Czuwanie TV",
    category: "Radio & Live",
    url: "https://polskieradio.cc/czuwanie",
    description: "Nocny strumień modlitwy, łagodnego uwielbienia i obecności Bożej. Oaza pokoju i wytchnienia dla osób przeżywających trudne noce, bezsenność czy samotność.",
    tags: ["nocne czuwanie", "czuwanie modlitewne", "pokój w nocy", "bezsenność", "ukojenie", "modlitwa nocna"],
    featured: false
  },
  {
    title: "Śniadaniowa Live",
    category: "Radio & Live",
    url: "https://polskieradio.cc/snadaniowa-live.html",
    description: "Poranny program na żywo z kawą, dobrą muzyką, inspirującymi gośćmi i Słowem Bożym na dobry początek dnia.",
    tags: ["śniadaniowa", "poranek", "kawa i słowo", "inspiracje poranne", "goście", "rozmowy"],
    featured: false
  },
  {
    title: "Ambient Sleep Live",
    category: "Radio & Live",
    url: "https://polskieradio.cc/ambient-sleep-live.html",
    description: "Kojąca muzyka ambientowa z cichym, biblijnym tłem do głębokiego snu, wyciszenia emocji i pokonania lęków nocnych.",
    tags: ["ambient sleep", "muzyka do snu", "wyciszenie", "odpoczynek", "pokój", "walka z lękiem", "relaks"],
    featured: false
  },
  {
    title: "Książka: Pokonać Goliata — Cezary Rogowski",
    category: "Media i treści",
    url: "https://polskieradio.cc/pokonac-goliata",
    description: "Bestsellerowa publikacja Cezarego Rogowskiego. 8 kroków zwycięzcy z doliny lęku i depresji do duchowego przełomu. Jak pokonać życiowe olbrzymy w mocy Chrystusa.",
    tags: ["pokonać goliata", "cezary rogowski", "książka", "lęk", "depresja", "zwycięstwo", "odwaga", "nadzieja", "kryzys"],
    featured: true
  },
  {
    title: "Książka: Kod Źródłowy Duszy — Cezary Rogowski",
    category: "Media i treści",
    url: "https://polskieradio.cc/kod",
    description: "Przełomowa książka o tożsamości w Bogu, resecie myślenia, uwolnieniu z nałogów i duchowej wolności dziecka Bożego.",
    tags: ["kod źródłowy", "cezary rogowski", "tożsamość w bogu", "wolność", "reset myślenia", "uzależnienia", "przemiana"],
    featured: true
  },
  {
    title: "Wioletta Rogowska — Wizytówka autorska & Powieść online",
    category: "Media i treści",
    url: "https://polskieradio.cc/Wioletta",
    description: "Oficjalna wizytówka autorska Wioletty Rogowskiej — powieść Pardon, Czy To Miłość?, czytnik online z lektorem TTS, newsletter i kontakt.",
    tags: ["wioletta rogowska", "autorka", "pardon czy to miłość", "powieść", "romans chrześcijański", "romance author", "książki", "wioletta"],
    featured: true
  },
  {
    title: "Powieść: Pardon, Czy To Miłość? — Wioletta Rogowska (Czytnik Online)",
    category: "Media i treści",
    url: "https://polskieradio.cc/Wioletta/pardon-czy-to-milosc/",
    description: "Czytaj online powieść Wioletty Rogowskiej Pardon, Czy To Miłość? Tom I — 25 rozdziałów, czytnik z modułem lektora audio TTS.",
    tags: ["pardon czy to miłość", "wioletta rogowska", "powieść", "czytnik", "rozdziały", "audiobook", "lektor tts", "książka online"],
    featured: true
  },
  {
    title: "Książka: Prawda Bez Filtra — Wioletta Rogowska",
    category: "Media i treści",
    url: "https://polskieradio.cc/prawda-bez-filtra",
    description: "Szczera i głęboka książka Wioletty Rogowskiej o kobiecej tożsamości, ucieczce z toksycznych iluzji i odzyskaniu godności córki Króla królów.",
    tags: ["prawda bez filtra", "wioletta rogowska", "relacje", "kobieta w bogu", "godność", "uzdrowienie emocji", "odrzucenie"],
    featured: true
  },
  {
    title: "Książka: U Boku Diabła — Cezary Rogowski",
    category: "Media i treści",
    url: "https://polskieradio.cc/u-boku-diabla",
    description: "Mocne studium walki duchowej, zdemaskowanie okultystycznych pułapek współczesności i autorytet wierzącego w imieniu Jezusa Chrystusa.",
    tags: ["u boku diabła", "cezary rogowski", "walka duchowa", "okultyzm", "uwolnienie", "autorytet wierzącego", "prawda"],
    featured: false
  },
  {
    title: "Książka: Bóg Jest Miłością — Cezary Rogowski",
    category: "Media i treści",
    url: "https://polskieradio.cc/bog-jest-miloscia",
    description: "Głębokie rozważanie o ojcowskim sercu Boga, bezwarunkowej łasce i pojednaniu, które przewyższa wszelkie ludzkie potępienie.",
    tags: ["bóg jest miłością", "cezary rogowski", "łaska", "miłość ojca", "przebaczenie", "zbawienie", "pokój"],
    featured: false
  },
  {
    title: "Książki Autora — Biblioteka Cezarego Rogowskiego",
    category: "Media i treści",
    url: "https://polskieradio.cc/ksiazki-autora",
    description: "Katalog wszystkich książek, e-booków i publikacji Cezarego Rogowskiego w formatach PDF, EPUB oraz z możliwością zamówienia.",
    tags: ["książki autora", "cezary rogowski", "publikacje", "ebooki", "literatura chrześcijańska"],
    featured: false
  },
  {
    title: "Pomoc Duchowa & Infolinia Nadziei",
    category: "Narzędzia i misja",
    url: "https://polskieradio.cc/pomoc",
    description: "Centrum pomocy duchowej, telefon zaufania i wsparcie w kryzysie życiowym, małżeńskim czy emocjonalnym. Zgłoś się do duszpasterza.",
    tags: ["pomoc duchowa", "infolinia nadziei", "telefon zaufania", "wsparcie w kryzysie", "duszpasterz", "modlitwa o pomoc", "kryzys"],
    featured: true
  },
  {
    title: "Wsparcie Misji Christian Culture — Zostań Patronem lub Mecenasem",
    category: "Narzędzia i misja",
    url: "https://polskieradio.cc/wspieraj",
    description: "Dołącz do grona Mecenasów i Patronów misji Christian Culture. Wesprzyj ewangelizację Polski (/wspieraj, /patron, /mecenas, /darowizna, /wesprzyj). Twoje wsparcie umożliwia docieranie z Ewangelią do milionów Polaków.",
    tags: ["wsparcie misji", "wspieraj", "patron", "mecenas", "patronat", "mecenat", "darowizna", "darowizny", "wesprzyj", "ofiara", "dziesięcina", "dziesiecina", "donate", "support", "zrzutka", "rozwój ewangelizacji"],
    featured: true
  },
  {
    title: "O Nas — Wizja i Statut Christian Culture",
    category: "Narzędzia i misja",
    url: "https://polskieradio.cc/o-nas",
    description: "Poznaj historię, statut, zespół i fundamenty doktrynalne ekosystemu mediów chrześcijańskich Christian Culture oraz radia PolskieRadio.cc.",
    tags: ["o nas", "misja", "statut", "fundamenty", "cezary rogowski", "wioletta rogowska", "historia radia"],
    featured: false
  },
  {
    title: "Polityka Redakcyjna CCN 1.0 — Christian Culture Network",
    category: "Wiedza & Standardy",
    url: "https://polskieradio.cc/polityka-redakcyjna",
    description: "Oficjalny standard i kodeks dziennikarski 20 portali Christian Culture Network. Model mieszany, zasady weryfikacji źródeł, etyka AI, rzetelność i chrześcijańska odpowiedzialność za słowo.",
    tags: ["polityka redakcyjna", "ccn", "standard redakcyjny", "etyka dziennikarska", "weryfikacja faktów", "etyka ai", "regulamin ccn", "kodeks", "zasady publikacji", "o ccn"],
    featured: true
  },
  {
    title: "Licznik 1 000 000 Słuchaczy",
    category: "Narzędzia i misja",
    url: "https://polskieradio.cc/milion",
    description: "Wielka misja dotarcia do 1 000 000 Polaków ze Słowem Bożym i chrześcijańskim przesłaniem nadziei. Zobacz aktualny stan licznika.",
    tags: ["milion słuchaczy", "licznik", "ewangelizacja polski", "zasięg", "misja narodowa"],
    featured: false
  },
  {
    title: "Żywa Mapa Ekosystemu @m",
    category: "Narzędzia i misja",
    url: "https://polskieradio.cc/mapa",
    description: "Interaktywny, trójwymiarowy atlas projektów, platform, audycji i narzędzi Christian Culture. Pełny wgląd w architekturę ekosystemu.",
    tags: ["mapa ekosystemu", "mapa cc", "atlas projektów", "infrastruktura", "sieć cc"],
    featured: true
  },
  {
    title: "Profil: Cezary Rogowski",
    category: "Społeczność & Relacje",
    url: "https://polskieradio.cc/lumina.cezaryrgowski",
    description: "Oficjalny profil Założyciela i Głównego Architekta Christian Culture, autora książek Pokonać Goliata i Kod Źródłowy.",
    tags: ["cezary rogowski", "założyciel", "profil", "autor", "publicysta", "lumina"],
    featured: false
  },
  {
    title: "Profil: Wioletta Rogowska",
    category: "Społeczność & Relacje",
    url: "https://polskieradio.cc/lumina.wiolettarogowska",
    description: "Oficjalny profil Współzałożycielki Christian Culture, autorki książki Prawda Bez Filtra oraz koordynatorki dzieł miłosierdzia.",
    tags: ["wioletta rogowska", "współzałożycielka", "profil", "autorka", "pomoc", "lumina"],
    featured: false
  },
  {
    title: "Profil: Duszpasterz Mariusz",
    category: "Społeczność & Relacje",
    url: "https://polskieradio.cc/lumina.mariusz",
    description: "Duszpasterz ekosystemu Christian Culture gotowy do modlitwy, rozmowy duchowej i wsparcia w trudnych momentach życia.",
    tags: ["duszpasterz mariusz", "duszpasterz", "modlitwa", "rozmowa duchowa", "wsparcie", "lumina"],
    featured: false
  }
];

// --- 3. PORTALE TEMATYCZNE CCN ---
const CCN_PORTALS = [
  {
    title: "CCN News — Portal Informacyjny",
    category: "Portale",
    url: "https://polskieradio.cc/news",
    description: "Główny chrześcijański portal informacyjny Christian Culture. Wiadomości z Polski i ze świata, raporty o prześladowaniach chrześcijan i analizy teologiczne.",
    tags: ["ccn news", "wiadomości", "informacje", "kościół", "prześladowania", "open doors", "polska", "świat"],
    featured: true
  },
  {
    title: "CCN Nauka — Kosmologia, Fizyka i Wiara",
    category: "Portale",
    url: "https://polskieradio.cc/nauka",
    description: "Rzetelne spojrzenie na naukę w świetle Pisma Świętego. Kosmologia, astrofizyka, fizyka kwantowa, pochodzenie wszechświata i harmonia nauki z Bogiem.",
    tags: ["ccn nauka", "nauka i wiara", "kosmologia", "fizyka", "początek wszechświata", "kreacjonizm", "wielki wybuch", "stworzenie"],
    featured: true
  },
  {
    title: "CCN Historia — Archeologia i Rzetelność Biblii",
    category: "Portale",
    url: "https://polskieradio.cc/historia",
    description: "Odkrycia archeologiczne, zwoje z Qumran, historia starożytnego Izraela i Kościoła weryfikujące historyczną autentyczność Pisma Świętego.",
    tags: ["ccn historia", "archeologia biblijna", "rękopisy z qumran", "zwoje", "starożytność", "rzetelność biblii", "jerozolima", "historia"],
    featured: true
  },
  {
    title: "CCN Biologia — Genom i Projekt w Naturze",
    category: "Portale",
    url: "https://polskieradio.cc/biologia",
    description: "Genetyka, kod DNA, maszyneria molekularna komórki oraz niesamowite dowody inteligentnego zamysłu Stwórcy w przyrodzie.",
    tags: ["ccn biologia", "biologia", "dna", "genetyka", "komórka", "inteligentny projekt", "bioróżnorodność", "natura"],
    featured: true
  },
  {
    title: "CCN Prawo — Etyka, Wolność i Dekalog",
    category: "Portale",
    url: "https://polskieradio.cc/prawo",
    description: "Prawo Boże, Dekalog ks. Jakuba Wujka (BJW), wolność sumienia i religii oraz chrześcijańskie fundamenty sprawiedliwości i praworządności.",
    tags: ["ccn prawo", "prawo boże", "dekalog", "wolność sumienia", "wolność religijna", "przykazania", "etyka", "sabat"],
    featured: true
  },
  {
    title: "CCN Seks & Małżeństwo — Boży Zamysł Intymności",
    category: "Portale",
    url: "https://polskieradio.cc/seks",
    description: "Piękno biblijnego małżeństwa, czystość przedmałżeńska, wierność, Boży plan dla seksualności oraz uleczenie zranień w relacjach.",
    tags: ["ccn seks", "małżeństwo", "seksualność", "czystość", "wierność", "relacje", "intymność w bogu", "rodzina"],
    featured: true
  },
  {
    title: "CCN Kultura & Sztuka Chrześcijańska",
    category: "Portale",
    url: "https://polskieradio.cc/kultura",
    description: "Chrześcijański wkład w literaturę, muzykę, sztukę sakralną i film. Promocja prawdziwego piękna, dobra i prawdy w kulturze.",
    tags: ["ccn kultura", "kultura chrześcijańska", "muzyka", "sztuka", "literatura", "piękno", "film"],
    featured: false
  },
  {
    title: "CCN Psychologia — Wiara i Zdrowie Psychiczne",
    category: "Portale",
    url: "https://polskieradio.cc/psychologia",
    description: "Przezwyciężanie depresji, lęków i traum w świetle prawdy biblijnej i rzetelnej psychologii. Boży pokój przewyższający wszelki rozum.",
    tags: ["ccn psychologia", "psychologia chrześcijańska", "zdrowie psychiczne", "lęk", "depresja", "trauma", "przebaczenie", "pokój boży"],
    featured: true
  },
  {
    title: "CCN Technologie — AI w Służbie Ewangelii",
    category: "Portale",
    url: "https://polskieradio.cc/technologie",
    description: "Nowoczesne technologie, sztuczna inteligencja i media cyfrowe jako potężne narzędzie globalnej ewangelizacji i formacji chrześcijańskiej.",
    tags: ["ccn technologie", "technologia", "sztuczna inteligencja", "ai", "innowacje", "ewangelizacja cyfrowa"],
    featured: false
  },
  {
    title: "CCN Edukacja — Wychowanie w Wartościach",
    category: "Portale",
    url: "https://polskieradio.cc/edukacja",
    description: "Chrześcijańskie wychowanie dzieci, edukacja domowa, kształtowanie biblijnego charakteru i ochrona młodego pokolenia przed nihilizmem.",
    tags: ["ccn edukacja", "edukacja", "wychowanie dzieci", "edukacja domowa", "wartości biblijne", "młodzież"],
    featured: false
  },
  {
    title: "CCN ZIU — Portal Zdrowia, Urody & Atlas Ziół („Ciało Świątynią Ducha Świętego”)",
    category: "Portale",
    url: "https://polskieradio.cc/ziu",
    description: "Boża apteka natury: atlas ziół leczniczych, zdrowy styl życia, pielęgnacja ciała jako świątyni Ducha Świętego, profilaktyka i biblijne zasady witalności.",
    tags: ["ccn ziu", "zdrowie", "atlas ziół", "uroda", "ciało świątynią ducha", "medycyna naturalna", "profilaktyka", "witalność"],
    featured: true
  },
  {
    title: "Polityka Redakcyjna CCN 1.0 — Christian Culture Network",
    category: "Wiedza & Standardy",
    url: "https://polskieradio.cc/polityka-redakcyjna",
    description: "Oficjalny standard i kodeks dziennikarski 20 portali Christian Culture Network. Model mieszany, zasady weryfikacji źródeł, etyka AI, rzetelność i chrześcijańska odpowiedzialność za słowo.",
    tags: ["polityka redakcyjna", "ccn", "standard redakcyjny", "etyka dziennikarska", "weryfikacja faktów", "etyka ai", "regulamin ccn", "kodeks", "zasady publikacji", "o ccn"],
    featured: true
  },
  {
    title: "Czy sztuczna inteligencja może zastąpić ludzką mądrość? Technologia stawia pytanie o przyszłość człowieka",
    category: "Artykuły & Wiedza CCN",
    url: "https://polskieradio.cc/nauka/czy-ai-zastapi-ludzka-madrosc",
    description: "Systemy sztucznej inteligencji potrafią analizować ogromne ilości informacji i tworzyć teksty. Jednak wraz ze wzrostem ich możliwości pojawia się pytanie: czy technologia może również zastąpić ludzką mądrość?",
    contentSnippet: "Systemy sztucznej inteligencji potrafią analizować ogromne ilości informacji, tworzyć teksty, pomagać w programowaniu i wspierać podejmowanie decyzji. Jednak czy technologia może zastąpić mądrość Bożą?",
    author: "Cezary Rogowski",
    date: "15 października 2026",
    tags: ["sztuczna inteligencja", "etyka ai", "mądrość biblijna", "technologia i wiara", "analiza ccn", "nauka", "cezary rogowski", "artykuł"],
    featured: true
  },
  {
    title: "Dlaczego czuję się samotny, chociaż mam setki znajomych w sieci? Prawdziwa więź w erze cyfrowej izolacji",
    category: "Artykuły & Wiedza CCN",
    url: "https://polskieradio.cc/news?art=dlaczego-czuje-sie-samotny-choc-mam-setki-znajomych",
    description: "Można mieć setki kontaktów na komunikatorach, tysiące obserwujących, a mimo to doświadczać dotkliwego poczucia pustki. Dlaczego cyfrowa łączność nie leczy samotności i czym różni się od autentycznej obecności?",
    contentSnippet: "Paradoks współczesnego świata polega na tym, że nigdy w historii ludzkości nie byliśmy tak stale połączeni technologicznie — i jednocześnie tak głęboko wyobcowani w realnym życiu.",
    author: "Wioletta Rogowska",
    date: "15 października 2026",
    tags: ["samotność w sieci", "psychologia i wiara", "relacje", "bliskość i więź", "zdrowie psychiczne", "wioletta rogowska", "psychologia", "artykuł"],
    featured: true
  }
];

Object.assign(CONTEXT_GUIDES, {
  "global": {
    "keywords": [
      "global",
      "globalne",
      "international",
      "english",
      "world",
      "global radio",
      "swiat",
      "świat"
    ],
    "topic": "Christian Culture Global — Międzynarodowa Misja i Muzyka",
    "summary": "Odkryj międzynarodowy portal Christian Culture Global dostępny w 10 językach świata. Słuchaj Global Radio 24/7 i Global Bible, oglądaj premiery worship JJ Beauvais oraz playlisty Personality Plus.",
    "keyVerses": [
      {
        "ref": "Mk 16:15",
        "text": "Idźcie na cały świat i głoście ewangelię wszelkiemu stworzeniu.",
        "url": "https://polskieradio.cc/Global/"
      }
    ],
    "shortcuts": [
      {
        "title": "Christian Culture Global",
        "url": "https://polskieradio.cc/Global/",
        "icon": "🌍"
      },
      {
        "title": "JJ Beauvais — Now Is The Time",
        "url": "https://polskieradio.cc/Global/#music",
        "icon": "🎵"
      },
      {
        "title": "Global Bible Radio 24/7",
        "url": "https://polskieradio.cc/Global/#radio",
        "icon": "📖"
      }
    ]
  },
  "cbdc": {
    "keywords": [
      "cbdc",
      "cyfrowy pieniadz",
      "cyfrowy pieniądz",
      "waluta banku centralnego",
      "pieniadz cyfrowy",
      "pieniądz programowalny",
      "gotowka",
      "gotówka",
      "nadzor finansowy",
      "nadzór finansowy",
      "prawo niedzielne",
      "apokalipsa 13",
      "wolnosc religijna",
      "wolność religijna"
    ],
    "topic": "CBDC, Cyfrowy Pieniądz, Wolność Sumienia & Apokalipsa 13",
    "summary": "Badania nad cyfrowymi walutami banków centralnych (CBDC) i programowalnym pieniądzem w świetle biblijnych proroctw Apokalipsy 13. Rzetelne rozróżnienie faktów ekonomicznych od teologicznej analizy wolności sumienia i prawa niedzielnego.",
    "keyVerses": [
      {
        "ref": "Ap 13:16-17",
        "text": "I sprawia, że wszyscy, mali i wielcy, bogaci i ubodzy, wolni i niewolnicy, otrzymują znamię na prawą rękę lub na czoło, i że nikt nie może kupić ani sprzedać, oprócz tego, kto ma znamię...",
        "url": "https://polskieradio.cc/mojabiblia"
      },
      {
        "ref": "Dz 5:29",
        "text": "Trzeba bardziej słuchać Boga niż ludzi.",
        "url": "https://polskieradio.cc/mojabiblia"
      }
    ],
    "shortcuts": [
      {
        "title": "Artykuł: Programowalny Pieniądz i Apokalipsa 13 (CCN Finanse)",
        "url": "https://polskieradio.cc/finanse/cbdc-prawo-niedzielne-apokalipsa-13",
        "icon": "💳"
      },
      {
        "title": "Artykuł: Wydanie w portalu CCN News",
        "url": "https://polskieradio.cc/news/cbdc-prawo-niedzielne-apokalipsa-13",
        "icon": "📰"
      },
      {
        "title": "Portal CCN Finanse & Gospodarność",
        "url": "https://polskieradio.cc/finanse",
        "icon": "📊"
      },
      {
        "title": "Kurs Apokalipsy — Wykłady Wideo",
        "url": "https://polskieradio.cc/kursy/apokalipsa/",
        "icon": "📖"
      }
    ]
  }
});

// --- 4. WCZYTANIE ARTYKUŁÓW CCN ---
function toSearchArticle(art, section) {
  const contentText = Array.isArray(art.content) ? art.content.join(' ') : (art.content || '');
  const scripture = art.scriptureReference ? `${art.scriptureReference.verse || ''} ${art.scriptureReference.text || ''}` : '';
  const tags = Array.isArray(art.tags) ? art.tags : [];
  const authorName = art.author && art.author.name ? art.author.name : 'Redakcja CCN';

  const route = ccnArticleRoutes[section]?.[art.id] || ccnArticleRoutes[section]?.[art.slug];
  if (!route) throw new Error('Article missing from generated public route registry');
  const primary = art.primaryPortalUrl && new URL(art.primaryPortalUrl, 'https://polskieradio.cc');
  const artUrl = primary?.origin === 'https://polskieradio.cc' && fs.existsSync(path.join(ROOT, decodeURI(primary.pathname), 'index.html'))
    ? primary.href : new URL(route, 'https://polskieradio.cc').href;

  return {
    type: 'article',
    access: 'public',
    publishedAt: art.publishedAt,
    title: art.title,
    category: "Artykuły & Wiedza CCN",
    url: artUrl,
    description: art.excerpt || contentText.slice(0, 180) + '…',
    contentSnippet: contentText.slice(0, 350) + '…',
    author: authorName,
    date: art.dateFormatted || art.publishedAt,
    tags: [
      ...tags,
      art.category,
      art.categoryLabel,
      authorName,
      "artykuł",
      "wiedza",
      "ccn"
    ].filter(Boolean),
    scripture: scripture,
    featured: Boolean(art.isHero || art.isPopular)
  };
}

function loadCcnArticles(section = 'news') {
  try {
    const articlesPath = path.join(ROOT, `portals/ccn-${section}/src/data/articles.ts`);
    if (!fs.existsSync(articlesPath)) throw new Error('Missing public article source: ' + section);
    const code = fs.readFileSync(articlesPath, 'utf8');
    const res = esbuild.transformSync(code, {
      loader: 'ts',
      format: 'cjs',
      banner: 'var exports = {};',
      footer: 'module.exports = { INITIAL_ARTICLES };'
    });
    const fn = new Function('module', 'exports', 'require', res.code);
    const mod = { exports: {} };
    fn(mod, mod.exports, () => ({}));
    const raw = mod.exports.INITIAL_ARTICLES || [];

    return raw.map(art => toSearchArticle(art, section));
  } catch (err) {
    throw new Error('Nie udało się wczytać publicznych artykułów: ' + section, { cause: err });
  }
}

// --- 5. WCZYTANIE LEKCJI KURSU APOKALIPSA ---
function loadApokalipsaLessons() {
  try {
    const filePath = path.join(ROOT, 'data/kurs-apokalipsa-baza-pelna.json');
    if (!fs.existsSync(filePath)) return [];
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const lessons = [];

    for (const [key, lesson] of Object.entries(raw)) {
      const num = lesson.numerLekcji || lesson.id || key;
      const title = lesson.tytul || lesson.title || `Lekcja ${num}: Kurs Apokalipsa`;
      const desc = lesson.opis || lesson.streszczenie || lesson.summary || 'Szczegółowe studium proroctwa Księgi Objawienia z dr. Alfredem Pallą.';
      const verses = lesson.wersetyKluczowe || lesson.scripture || '';

      lessons.push({
        title: `Kurs Apokalipsa — Lekcja ${num}: ${title}`,
        category: "Biblia i formacja",
        url: `https://polskieradio.cc/kursy/apokalipsa/lekcja-${String(num).padStart(2, '0')}.html`,
        description: desc,
        tags: [
          "kurs apokalipsa",
          "apokalipsa",
          "lekcja",
          "alfred palla",
          "proroctwa",
          "księga objawienia",
          "księga nadziei",
          "znaki czasu",
          "baranek",
          "studium biblijne",
          ...(Array.isArray(verses) ? verses : [verses])
        ],
        featured: num <= 3 || num === 20 || num === 27
      });
    }
    return lessons;
  } catch (err) {
    console.warn('Nie udało się wczytać kursu apokalipsa:', err.message);
    return [];
  }
}

// --- 6. WCZYTANIE LEKCJI KURSU CODZIENNEGO ---
function loadDailyCourseLessons() {
  try {
    const filePath = path.join(ROOT, 'data/kurscodzienny/m01_rodzaju.json');
    if (!fs.existsSync(filePath)) return [];
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const lessons = [];

    for (const l of (raw.lessons || [])) {
      const num = l.lessonGlobalNumber || l.lessonMonthNumber;
      const memVerse = l.memoryVerse ? `${l.memoryVerse.reference}: „${l.memoryVerse.text}”` : '';
      lessons.push({
        title: `Z Biblią za Pan Brat — Dzień ${num}: ${l.title}`,
        category: "Biblia i formacja",
        url: `https://polskieradio.cc/kursy/kurscodzienny/dzien-${String(num).padStart(2, '0')}.html`,
        description: `${l.subtitle || ''}. ${l.mainIdea || ''} ${memVerse}`.trim(),
        tags: [
          "kurs codzienny",
          "z biblią za pan brat",
          "księga rodzaju",
          l.scriptureRange,
          l.visualMotif,
          "lekcja biblijna",
          "rozważanie",
          "stworzenie"
        ].filter(Boolean),
        featured: num <= 3
      });
    }
    return lessons;
  } catch (err) {
    console.warn('Nie udało się wczytać kursu codziennego:', err.message);
    return [];
  }
}

// --- 7. WCZYTANIE HASEŁ LEKSYKONU BIBLIJNEGO ---
function loadLexiconEntries() {
  try {
    const lexPath = path.join(ROOT, 'portals/ccn-news/src/data/lexicon.ts');
    if (!fs.existsSync(lexPath)) return [];
    const code = fs.readFileSync(lexPath, 'utf8');
    const res = esbuild.transformSync(code, {
      loader: 'ts',
      format: 'cjs',
      banner: 'var exports = {};',
      footer: 'module.exports = { LEXICON_ENTRIES };'
    });
    const fn = new Function('module', 'exports', 'require', res.code);
    const mod = { exports: {} };
    fn(mod, mod.exports, () => ({}));
    const raw = mod.exports.LEXICON_ENTRIES || [];
    return raw.map(lex => {
      const verses = (lex.keyVerses || []).map(v => `${v.ref}: ${v.text}`).join(' ');
      return {
        title: `Leksykon: ${lex.term} (${lex.transliteration || ''})`,
        category: "Biblia i formacja",
        url: lex.relatedCourseLesson && lex.relatedCourseLesson.url ? `https://polskieradio.cc${lex.relatedCourseLesson.url}` : "https://polskieradio.cc/mojabiblia",
        description: `${lex.strongCode ? '[' + lex.strongCode + '] ' : ''}${lex.definition || ''} ${lex.biblicalContext || ''}`.trim(),
        tags: [
          ...(lex.tags || []),
          lex.term,
          lex.transliteration,
          lex.strongCode,
          "leksykon",
          "greka",
          "hebrajski",
          "słownik biblijny"
        ].filter(Boolean),
        scripture: verses,
        featured: false
      };
    });
  } catch (err) {
    console.warn('Nie udało się wczytać leksykonu:', err.message);
    return [];
  }
}

// --- 8. WCZYTANIE ROZWAŻAŃ DOBRZE, ŻE JESTEŚ ---
function loadDailyReflections() {
  try {
    const filePath = path.join(ROOT, 'rozwazania_cuda_baza.json');
    if (!fs.existsSync(filePath)) return [];
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const items = [];
    const history = raw.history || [];

    // Bierzemy wszystkie unikalne rozważania z bazy (anty-duplikat)
    const seenReflections = new Set();
    for (const ref of history) {
      const dedupKey = `${(ref.title || '').trim().toLowerCase()}|${(ref.dateText || '').trim().toLowerCase()}`;
      if (seenReflections.has(dedupKey)) continue;
      seenReflections.add(dedupKey);

      const pText = Array.isArray(ref.paragraphs) ? ref.paragraphs.slice(0, 3).join(' ') : '';
      const prayer = ref.prayer || '';
      items.push({
        title: `Rozważanie: ${ref.title}`,
        category: "Biblia i formacja",
        url: `https://polskieradio.cc/dzj`,
        description: `${ref.dateText}: ${pText.slice(0, 180)}… Modlitwa: ${prayer.slice(0, 140)}…`,
        contentSnippet: pText.slice(0, 400),
        tags: [
          "dobrze że jesteś",
          "cuda każdego dnia",
          "rozważanie",
          "modlitwa",
          "poranna inspiracja",
          ref.dateText,
          "nadzieja",
          "pokój boży",
          "wiara",
          "słowo boże"
        ].filter(Boolean),
        featured: false
      });
    }
    return items;
  } catch (err) {
    console.warn('Nie udało się wczytać rozważań:', err.message);
    return [];
  }
}

// --- 9. BUDOWANIE PEŁNEGO INDEKSU ---
async function build() {
  console.log('🔄 Rozpoczynam indeksowanie ekosystemu Christian Culture...');

  const ccnArticles = [...loadCcnArticles(), ...loadCcnArticles('finanse'),
    ...portalsData.PORTALS.filter(p => ['nauka','historia','prawo'].includes(p.id))
      .flatMap(p => p.articles.map(a => toSearchArticle(a, p.id)))];
  console.log(`✅ Zindeksowano artykuły CCN: ${ccnArticles.length}`);

  const apokalipsa = loadApokalipsaLessons();
  console.log(`✅ Zindeksowano lekcje Kursu Apokalipsa: ${apokalipsa.length}`);

  const dailyCourse = loadDailyCourseLessons();
  console.log(`✅ Zindeksowano lekcje Kursu Codziennego: ${dailyCourse.length}`);

  const lexicon = loadLexiconEntries();
  console.log(`✅ Zindeksowano hasła leksykonu biblijnego: ${lexicon.length}`);

  const reflections = loadDailyReflections();
  console.log(`✅ Zindeksowano rozważania dzienne: ${reflections.length}`);

  const rawItems = [
    ...CORE_PROJECTS,
    ...CCN_PORTALS,
    ...ccnArticles,
    ...apokalipsa,
    ...dailyCourse,
    ...lexicon,
    ...reflections
  ];

  // Resolve aliases and relative URLs before deduplication. Prefer current source records.
  const uniqueItems = new Map();
  for (const item of rawItems) {
    const url = new URL(item.url, 'https://polskieradio.cc');
    const section = url.pathname.slice(1);
    const route = ccnArticleRoutes[section]?.[url.searchParams.get('art')];
    if (route) { url.pathname = route; url.searchParams.delete('art'); }
    const key = item.type === 'article' ? url.href : url.href + '|' + item.title;
    uniqueItems.set(key, { ...uniqueItems.get(key), ...item, url: url.href });
  }
  const allItems = [...uniqueItems.values()];

  const finalCatalog = {
    version: "2.0.0",
    updatedAt: new Date().toISOString(),
    totalItems: allItems.length,
    contextGuides: CONTEXT_GUIDES,
    items: allItems
  };

  const outPath1 = path.join(ROOT, 'szukaj/catalog.json');
  fs.writeFileSync(outPath1, JSON.stringify(finalCatalog, null, 2), 'utf8');
  console.log(`✨ Zapisano szukaj/catalog.json: ${allItems.length} zindeksowanych pozycji.`);

  const outPath2 = path.join(ROOT, 'data/cc-search-index.json');
  fs.writeFileSync(outPath2, JSON.stringify(finalCatalog, null, 2), 'utf8');
  console.log(`✨ Zapisano data/cc-search-index.json: ${allItems.length} zindeksowanych pozycji.`);

  const originalArgs = process.argv;
  process.argv = [...originalArgs, '--no-mirror'];
  try {
    for (const script of ['index-cclite.mjs', 'index-lessons.mjs', 'index-menu-items.mjs']) {
      await import(new URL(script, import.meta.url));
    }
  } finally { process.argv = originalArgs; }
  const completeCatalog = fs.readFileSync(outPath2, 'utf8');
  if (process.argv.includes('--no-mirror')) return;

  // Zapis do lustrzanego katalogu LUMINA
  const mirrorPath = path.join('C:/Users/czark/Desktop/@ICC/LUMINA/szukaj/catalog.json');
  const mirrorPath2 = path.join('C:/Users/czark/Desktop/@ICC/LUMINA/data/cc-search-index.json');
  try {
    fs.mkdirSync(path.dirname(mirrorPath), { recursive: true });
    fs.writeFileSync(mirrorPath, completeCatalog, 'utf8');
    fs.mkdirSync(path.dirname(mirrorPath2), { recursive: true });
    fs.writeFileSync(mirrorPath2, completeCatalog, 'utf8');
    console.log(`✨ Zsynchronizowano do lustra LUMINA (szukaj/catalog.json i data/cc-search-index.json).`);
  } catch (e) {
    console.warn('Nie udało się zapisać do lustra:', e.message);
  }
}

await build();
