#!/usr/bin/env node
/**
 * scripts/youtube_channels_promoter.mjs
 * Automatyczny multiplatformowy system promocji kanałów YouTube ekosystemu Christian Culture.
 * Obsługuje rotację Round-Robin (2 razy dziennie: 10:00 i 18:00 CET).
 * Generuje gotowe formaty dla: X (Twitter), Tablica LUMINA, Grupy WhatsApp, Komunikaty CC Player.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const STATE_FILE = path.join(ROOT, 'data/yt_promotion_state.json');

export const YT_PROMOTION_CATALOG = [
  {
    id: 'cctv',
    name: 'Christian Culture TV',
    handle: '@ChristianCultureTV',
    url: 'https://www.youtube.com/@ChristianCultureTV',
    category: 'Główne media i wykłady',
    headline: 'Odkryj pełnometrażowe wykłady biblijne, serie dokumentalne i debaty!',
    xPost: `🎥 Odkryj prawdę, która uwalnia i buduje wiarę. Pełnometrażowe wykłady biblijne, rzetelne serie dokumentalne i analizy proroctw na kanale Christian Culture TV!\n\n🔴 Oglądaj i subskrybuj:\nhttps://www.youtube.com/@ChristianCultureTV\n\n#ChristianCulture #Biblia #WykładyBiblijne #Ewangelia #Prawda #Jezus`,
    luminaPost: `🌟 **Oficjalny Kanał Wideo: Christian Culture TV**\n\nSzukasz głębokich, rzetelnych i bezkompromisowych materiałów biblijnych? Na kanale Christian Culture TV znajdziesz autorskie serie wykładów, debaty teologiczne, analizy proroctw oraz inspirujące filmy dokumentalne zrealizowane w najwyższym standardzie.\n\n👉 **Dołącz do społeczności widzów:** [youtube.com/@ChristianCultureTV](https://www.youtube.com/@ChristianCultureTV)\n\nZostaw subskrypcję z dzwonkiem 🔔, aby nie przegapić żadnej premiery!\n\n#ChristianCultureTV #Ewangelia #WykładyBiblijne #PismoŚwięte #Wiara`,
    whatsAppPost: `🎥 *POLECAMY KANAŁ YT: Christian Culture TV*\n\nGłówne wideo-ramię naszej misji! Zobacz inspirujące wykłady biblijne, serie o proroctwach i filmy dokumentalne o wierze.\n\n▶️ *Subskrybuj tutaj:* https://www.youtube.com/@ChristianCultureTV\n\nPodaj dalej i buduj wiarę razem z nami! ✨`
  },
  {
    id: 'osobowosc_plus',
    name: 'Osobowość + (Studio Dobrego Słowa)',
    handle: '@osobowoscPLUS',
    url: 'https://www.youtube.com/@osobowoscPLUS',
    category: 'Studio Dobrego Słowa',
    headline: 'Psychologia sukcesu w świetle Pisma Świętego i seria Apokalipsa 4K!',
    xPost: `💡 Buduj silny charakter i duchową tożsamość. Seria Apokalipsa w jakości 4K, wykłady o powołaniu i biblijnych zasadach zwycięskiego życia na kanale Osobowość +!\n\n🔴 Subskrybuj teraz:\nhttps://www.youtube.com/@osobowoscPLUS\n\n#OsobowośćPlus #StudioDobregoSłowa #Apokalipsa #Wiara #RozwójDuchowy #SukcesWChrystusie`,
    luminaPost: `🔥 **Studio Dobrego Słowa: Osobowość +**\n\nJak łączyć biblijną wierność z praktycznym sukcesem, zdrowiem emocjonalnym i silnym charakterem? Kanał Osobowość + to unikalne miejsce łączące serię wykładów z Księgi Apokalipsy (UHD 4K), wywiady ze świadkami wiary oraz praktyczne biblijne narzędzia zwycięstwa.\n\n👉 **Oglądaj na YouTube:** [youtube.com/@osobowoscPLUS](https://www.youtube.com/@osobowoscPLUS)\n\nKliknij subskrypcję i rozwijaj swój potencjał w Bogu!\n\n#OsobowośćPlus #Apokalipsa #StudioDobregoSłowa #Zwycięstwo #Chrześcijaństwo`,
    whatsAppPost: `💡 *ZAINSPIRUJ SIĘ: Osobowość + (Studio Dobrego Słowa)*\n\nWykłady o Księdze Apokalipsy w 4K, biblijna psychologia zwycięstwa i rozwój charakteru.\n\n▶️ *Zobacz kanał:* https://www.youtube.com/@osobowoscPLUS\n\nWłącz subskrypcję i czerp mądrość każdego dnia!`
  },
  {
    id: 'radio_cc',
    name: 'Polskie Radio Christian Culture',
    handle: '@RadioChristianCulture',
    url: 'https://www.youtube.com/@RadioChristianCulture',
    category: 'Radio i audycje',
    headline: 'Najpiękniejsza muzyka chrześcijańska, wywiady i audycje na żywo 24/7!',
    xPost: `📻 Dobre Słowo i muzyka, która napełnia dom Bożym pokojem. Audycje na żywo, wywiady i archiwalne nagrania Polskiego Radia Christian Culture!\n\n🔴 Dołącz do słuchaczy na YT:\nhttps://www.youtube.com/@RadioChristianCulture\n\n#RadioChristianCulture #MuzykaChrześcijańska #RadioCC #Uwielbienie #PokójBoży`,
    luminaPost: `🎵 **Włącz Dźwięk Nadziei: Polskie Radio CC na YouTube**\n\nMuzyka uwielbienia, inspirujące wywiady, transmisje na żywo i codzienne słowo otuchy. Oficjalny kanał Polskiego Radia Christian Culture gromadzi nasze audycje w jednym miejscu, by Boży pokój towarzyszył Ci w pracy, podróży i domu.\n\n👉 **Odwiedź kanał radiowy:** [youtube.com/@RadioChristianCulture](https://www.youtube.com/@RadioChristianCulture)\n\n#PolskieRadioCC #RadioInternetowe #WorshipPL #MuzykaChrześcijańska #ChwałaBogu`,
    whatsAppPost: `📻 *POLSKIE RADIO CC NA YOUTUBE*\n\nSłuchaj naszych audycji, wywiadów i najlepszej chrześcijańskiej muzyki w dowolnym momencie!\n\n▶️ *Słuchaj i subskrybuj:* https://www.youtube.com/@RadioChristianCulture\n\nNiech ten dźwięk wypełni Twój dzień pokojem!`
  },
  {
    id: 'biblia_audio',
    name: 'Biblia Audio CC',
    handle: '@bibliaaudiocc',
    url: 'https://www.youtube.com/@bibliaaudiocc',
    category: 'Pismo Święte',
    headline: 'Słowo Boże z narracją lektorską i filmową ścieżką dźwiękową!',
    xPost: `📖 Zanurz się w czystym tekście Pisma Świętego. Profesjonalna narracja lektorska, filmowa muzyka i głębia Słowa Bożego na kanale Biblia Audio CC!\n\n🔴 Słuchaj za darmo:\nhttps://www.youtube.com/@bibliaaudiocc\n\n#BibliaAudio #PismoŚwięte #BibliaGdańska #SłowoBoże #WiaraZeSłuchania #Słuchowisko`,
    luminaPost: `✨ **Zanurz się w Słowie: Biblia Audio Christian Culture**\n\n„Wiara przychodzi ze słuchania, a słuchanie przez Słowo Boże”. Nasz dedykowany kanał Biblia Audio CC prezentuje kolejne księgi Starego i Nowego Testamentu w mistrzowskiej interpretacji lektorskiej z bogatym tłem dźwiękowym.\n\n👉 **Odsłuchaj rozdziały na YouTube:** [youtube.com/@bibliaaudiocc](https://www.youtube.com/@bibliaaudiocc)\n\nZasubskrybuj i karm swoją duszę Słowem każdego dnia!\n\n#BibliaAudio #Biblia #PismoŚwięte #MedytacjaBiblijna #JezusChrystus`,
    whatsAppPost: `📖 *SŁUCHAJ BIBLII AUDIO NA YOUTUBE*\n\nRozdziały Pisma Świętego z profesjonalnym lektorem i filmową muzyką. Idealne do modlitwy, drogi i wyciszenia.\n\n▶️ *Subskrybuj:* https://www.youtube.com/@bibliaaudiocc\n\n„Słowo Twoje jest pochodnią dla moich nóg”!`
  },
  {
    id: 'werset_dnia',
    name: 'Werset Dnia (Chrześcijański Serwis Biblijny)',
    handle: '@wersetdnia_ChSB',
    url: 'https://www.youtube.com/@wersetdnia_ChSB',
    category: 'Krótkie formy i Shorts',
    headline: 'Codzienna porcja obietnic Bożych w formacie Shorts i wideo!',
    xPost: `⚡ Jedno zdanie z Biblii potrafi odmienić cały Twój dzień. Codzienna Boża obietnica z piękną grafiką na kanale Werset Dnia ChSB!\n\n🔴 Zobacz dzisiejszy werset:\nhttps://www.youtube.com/@wersetdnia_ChSB\n\n#WersetDnia #ChSB #BibliaWJednąMinutę #CytatBiblijny #SłowoNaDziś #Wiara`,
    luminaPost: `🕊️ **Werset Dnia — Chrześcijański Serwis Biblijny**\n\nZatrzymaj się na 60 sekund pośród codziennego pośpiechu. Kanał Werset Dnia publikuje precyzyjnie dobrane fragmenty Pisma Świętego w nowoczesnym formacie wideo, które przynoszą pocieszenie, siłę i Boże prowadzenie.\n\n👉 **Zasubskrybuj dawkę Słowa:** [youtube.com/@wersetdnia_ChSB](https://www.youtube.com/@wersetdnia_ChSB)\n\n#WersetDnia #ObietniceBoże #ChSB #Biblia #ShortsPolska`,
    whatsAppPost: `🕊️ *WERSET DNIA — SŁOWO DLA CIEBIE*\n\nCodzienna porcja Bożych obietnic w krótkich, inspirujących filmach.\n\n▶️ *Oglądaj codziennie:* https://www.youtube.com/@wersetdnia_ChSB\n\nZapisz i zacznij dzień ze Słowem Bożym!`
  },
  {
    id: 'cc_women',
    name: 'CC Women',
    handle: '@CCWomen7',
    url: 'https://www.youtube.com/@CCWomen7',
    category: 'Formacja kobiet',
    headline: 'Boża tożsamość kobiety, relacje, macierzyństwo i siła modlitwy!',
    xPost: `🌸 Jesteś cenna w Bożych oczach. Przestrzeń biblijnego wzmocnienia dla kobiet: tożsamość, wiara, rodzina i modlitwa na kanale CC Women!\n\n🔴 Subskrybuj z sercem:\nhttps://www.youtube.com/@CCWomen7\n\n#CCWomen #KobietaZWiarą #BożaCórka #KobietaChrześcijańska #ModlitwaKobiet #Wartość`,
    luminaPost: `🌷 **Dla Każdej Kobiety: CC Women**\n\nOdkryj piękno Bożej tożsamości, pokój w sercu i mądrość w codziennych relacjach. Kanał CC Women powstał, by wspierać kobiety w każdym wieku — od młodych dziewcząt, przez matki, po seniorki wiary.\n\n👉 **Dołącz do grona kobiet wiary:** [youtube.com/@CCWomen7](https://www.youtube.com/@CCWomen7)\n\n#CCWomen #KobietyBiblii #Chrześcijanka #WiaraIKobieta #BożePiękno`,
    whatsAppPost: `🌸 *KANAŁ CC WOMEN DLA KOBIET*\n\nInspiracja, wzmocnienie, modlitwa i Boża tożsamość kobiety w dzisiejszym świecie.\n\n▶️ *Subskrybuj:* https://www.youtube.com/@CCWomen7\n\nUdostępnij swojej mamie, siostrze i przyjaciółce! 💖`
  },
  {
    id: 'cc_men',
    name: 'CC Men',
    handle: '@CCMen7',
    url: 'https://www.youtube.com/@CCMen7',
    category: 'Formacja mężczyzn',
    headline: 'Męstwo, odpowiedzialność, przywództwo w rodzinie i walka duchowa!',
    xPost: `⚔️ Bądź mężczyzną według Bożego serca. Odpowiedzialność, ochrona rodziny, honor i duchowe męstwo na kanale CC Men!\n\n🔴 Stań w wyłomie:\nhttps://www.youtube.com/@CCMen7\n\n#CCMen #MężczyznaWiara #BożyWojownik #Ojcowie #Męstwo #ChrześcijańskiMężczyzna`,
    luminaPost: `🛡️ **Męstwo i Odpowiedzialność: CC Men**\n\nPrawdziwe przywództwo zaczyna się od pokory przed Bogiem i odwagi w ochronie najbliższych. Kanał CC Men porusza twarde, konkretne tematy: walka z pokusami, rola ojca i męża, uczciwość w biznesie oraz duchowa walka.\n\n👉 **Oglądaj i subskrybuj:** [youtube.com/@CCMen7](https://www.youtube.com/@CCMen7)\n\n#CCMen #MęskiKrag #WiaraMężczyzny #Odpowiedzialność #BożyMąż`,
    whatsAppPost: `🛡️ *DLA MĘŻCZYZN: CC MEN*\n\nMęstwo w wierze, ochrona rodziny, wyzwania i biblijny charakter bez kompromisów.\n\n▶️ *Subskrybuj:* https://www.youtube.com/@CCMen7\n\nPrzekaż braciom w wierze! ⚔️`
  },
  {
    id: 'cc_bible_deep',
    name: 'CC Bible Deep',
    handle: '@CCBibleDeep',
    url: 'https://www.youtube.com/@CCBibleDeep',
    category: 'Studium biblijne',
    headline: 'Głębokie studium werset po wersecie, greka, hebrajski i kontekst historyczny!',
    xPost: `🔍 Wejdź głębiej w Pismo Święte. Egzegeza, języki oryginalne, typologia i kontekst przymierza na kanale CC Bible Deep!\n\n🔴 Odkryj bogactwo Słowa:\nhttps://www.youtube.com/@CCBibleDeep\n\n#CCBibleDeep #StudiumBiblijne #Egzegeza #TeologiaBiblijna #Hebrajski #GrekaBiblijna`,
    luminaPost: `📜 **Głębokie Studium Pisma: CC Bible Deep**\n\nDla tych, którzy pragną więcej niż pobieżne czytanie. Na CC Bible Deep analizujemy wersety w ich oryginalnym języku (hebrajski, greka), odkrywamy cienie Chrystusa w Starym Testamencie i badamy archeologię biblijną.\n\n👉 **Studiuj razem z nami:** [youtube.com/@CCBibleDeep](https://www.youtube.com/@CCBibleDeep)\n\n#CCBibleDeep #PismoŚwięte #BibliaInterlinearna #BadajPisma #MądrośćBoża`,
    whatsAppPost: `📜 *GŁĘBOKIE STUDIUM BIBLII: CC Bible Deep*\n\nAnaliza werset po wersecie, archeologia, język hebrajski i grecki. Zobacz Pismo w nowym świetle!\n\n▶️ *Subskrybuj:* https://www.youtube.com/@CCBibleDeep\n\n„Poznacie prawdę, a prawda was wyzwoli”!`
  },
  {
    id: 'worship_live',
    name: 'Worship LIVE CC',
    handle: '@WorshipLiveCC',
    url: 'https://www.youtube.com/@WorshipLiveCC',
    category: 'Uwielbienie 24/7',
    headline: 'Ciągłe uwielbienie Króla królów, muzyka chwały i atmosfera Bożej obecności!',
    xPost: `🙌 Uwielbienie bez przerwy. Pieśni chwały, które otwierają niebo i przynoszą uzdrowienie serca na Worship LIVE CC!\n\n🔴 Bądź w obecności Pana:\nhttps://www.youtube.com/@WorshipLiveCC\n\n#WorshipLive #Uwielbienie #PraiseAndWorship #JezusJestPanem #BożaObecność #Chwała`,
    luminaPost: `🕊️ **Nieustanne Uwielbienie: Worship LIVE CC**\n\nMuzyka, która skupia wzrok wyłącznie na Jezusie. Włącz Worship LIVE CC w domu, w czasie modlitwy osobistej lub wyciszenia i doświadczaj atmosfery Bożej świętości i łaski.\n\n👉 **Dołącz do uwielbienia:** [youtube.com/@WorshipLiveCC](https://www.youtube.com/@WorshipLiveCC)\n\n#WorshipLiveCC #ChwałaBogu #Uwielbienie24h #ModlitwaŚpiewem #Jezus`,
    whatsAppPost: `🙌 *UWIELBIENIE NA ŻYWO: Worship LIVE CC*\n\nMuzyka chwały 24/7 dla Twojego domu i osobistego czasu z Bogiem.\n\n▶️ *Włącz i uwielbiaj:* https://www.youtube.com/@WorshipLiveCC\n\nNiech chwała Panu rozbrzmiewa bez końca!`
  },
  {
    id: 'cc_prayer_24',
    name: 'CC Prayer 24',
    handle: '@CCPrayer24',
    url: 'https://www.youtube.com/@CCPrayer24',
    category: 'Modlitwa na żywo',
    headline: 'Wspólna modlitwa wstawiennicza, wołanie o naród i uzdrowienie chorych!',
    xPost: `🙏 Nie jesteś sam. Dołącz do nieustannej modlitwy wstawienniczej i składaj swoje intencje na kanale CC Prayer 24!\n\n🔴 Módl się z nami na żywo:\nhttps://www.youtube.com/@CCPrayer24\n\n#CCPrayer24 #ModlitwaNaŻywo #Wstawiennictwo #Uzdrowienie #ModlitwaOPolskę #Wiara`,
    luminaPost: `🕯️ **Wieczernik Modlitwy: CC Prayer 24**\n\nGdy dwaj lub trzej gromadzą się w Imię Jezusa, On jest pośród nich. Na kanale CC Prayer 24 trwamy w modlitwie o rodziny, o chorych, o duchowe przebudzenie i Bożą ochronę.\n\n👉 **Zjednocz się w modlitwie:** [youtube.com/@CCPrayer24](https://www.youtube.com/@CCPrayer24)\n\n#CCPrayer24 #MódlSię #ModlitwaWstawiennicza #BógWysłuchuje #CudaJezusa`,
    whatsAppPost: `🙏 *MODLITWA 24/7: CC Prayer 24*\n\nWspólne wstawiennictwo, modlitwa o uzdrowienie i Boże prowadzenie w trudnych chwilach.\n\n▶️ *Dołącz do modlitwy:* https://www.youtube.com/@CCPrayer24\n\nPamiętaj — modlitwa sprawiedliwego ma wielką moc!`
  },
  {
    id: 'top_seven',
    name: 'Top Seven (Lista Przebojów CC)',
    handle: '@TopSeven_CC',
    url: 'https://www.youtube.com/@TopSeven_CC',
    category: 'Muzyka i notowania',
    headline: 'Najgorętsze chrześcijańskie utwory, premiery płytowe i głosowanie słuchaczy!',
    xPost: `🎶 Najlepsza chrześcijańska muzyka w Polsce i na świecie! Poznaj premierowe utwory i głosuj w liście przebojów na Top Seven CC!\n\n🔴 Posłuchaj notowania:\nhttps://www.youtube.com/@TopSeven_CC\n\n#TopSeven #ListaPrzebojówCC #MuzykaChrześcijańska #ChristianMusic #Premiery`,
    luminaPost: `🎧 **Oficjalna Lista Przebojów: Top Seven CC**\n\nOdkryj świeże brzmienia, wokalne talenty i poruszające teksty z Polski i całego świata. Top Seven to prestiżowe zestawienie chrześcijańskich utworów tworzone razem ze słuchaczami Polskiego Radia Christian Culture.\n\n👉 **Posłuchaj i subskrybuj:** [youtube.com/@TopSeven_CC](https://www.youtube.com/@TopSeven_CC)\n\n#TopSevenCC #HityWiary #ChrześcijańskiPop #WorshipChart #RadioCC`,
    whatsAppPost: `🎶 *LISTA PRZEBOJÓW: Top Seven CC*\n\nPoznaj najchętniej słuchane utwory chrześcijańskie tego tygodnia i odkryj nowości muzyczne!\n\n▶️ *Posłuchaj:* https://www.youtube.com/@TopSeven_CC\n\nDobra muzyka budująca ducha!`
  },
  {
    id: 'cc_film',
    name: 'CC FILM (Kino Chrześcijańskie)',
    handle: '@CCFILM77',
    url: 'https://www.youtube.com/@CCFILM77',
    category: 'Kino i filmy',
    headline: 'Inspirujące filmy fabularne, kino wartości i poruszające opowieści wiary!',
    xPost: `🎬 Kino, które porusza sumienia i wnosi światło. Filmy fabularne, etiudy i ekranizacje historii wiary na kanale CC FILM!\n\n🔴 Oglądaj bezpłatnie:\nhttps://www.youtube.com/@CCFILM77\n\n#CCFILM #KinoChrześcijańskie #FilmyWiary #KinoWartości #DobreKino #Chrześcijaństwo`,
    luminaPost: `🍿 **Kino z Przesłaniem: CC FILM**\n\nOdrzuć pustą rozrywkę na rzecz opowieści, które zostają w pamięci na lata. CC FILM to platforma filmowa prezentująca dramaty, świadectwa, biografie bohaterów wiary i produkcje ewangelizacyjne dla całej rodziny.\n\n👉 **Oglądaj filmy na YouTube:** [youtube.com/@CCFILM77](https://www.youtube.com/@CCFILM77)\n\n#CCFILM #ChrześcijańskieKino #FilmyDlaRodziny #ŚwiadectwoWiary #FilmZPrzesłaniem`,
    whatsAppPost: `🎬 *KINO CHRZEŚCIJAŃSKIE: CC FILM*\n\nInspirujące filmy fabularne i poruszające historie na rodzinny wieczór przed ekranem.\n\n▶️ *Subskrybuj kanał filmowy:* https://www.youtube.com/@CCFILM77\n\nPodziel się z bliskimi dobrą kulturą!`
  }
];

export function getNextPromotionChannel() {
  let state = { lastIndex: -1, lastTimestamp: null, history: [] };
  if (fs.existsSync(STATE_FILE)) {
    try { state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (_) {}
  }
  const nextIndex = (state.lastIndex + 1) % YT_PROMOTION_CATALOG.length;
  const channel = YT_PROMOTION_CATALOG[nextIndex];
  return { channel, nextIndex, state };
}

export function savePromotionState(nextIndex, channelId) {
  const state = {
    lastIndex: nextIndex,
    lastChannelId: channelId,
    lastTimestamp: new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  return state;
}

if (process.argv[1] && process.argv[1].endsWith('youtube_channels_promoter.mjs')) {
  const { channel, nextIndex } = getNextPromotionChannel();
  const apply = process.argv.includes('--publish');
  console.log(`[YT PROMOTER] Wybrany kanał rotacji (${nextIndex + 1}/${YT_PROMOTION_CATALOG.length}): ${channel.name} (${channel.handle})`);
  console.log(`--- POST X (TWITTER) ---\n${channel.xPost}\n`);
  console.log(`--- POST LUMINA TABLICA ---\n${channel.luminaPost}\n`);
  console.log(`--- WIADOMOŚĆ WHATSAPP ---\n${channel.whatsAppPost}\n`);
  if (apply) {
    savePromotionState(nextIndex, channel.id);
    console.log(`[STATUS] Zapisano stan rotacji: ${channel.id}`);
  } else {
    console.log('[DRY-RUN] Użyj flagi --publish, aby zatwierdzić rotację.');
  }
}
