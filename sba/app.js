import { loadBible, loadRecordings, officialTrack, site, inEcosystem } from './data.js?v=2';

const $ = (query) => document.querySelector(query);
const icons = {
  book: '<path d="M12 6c-3-3-7-3-10-1v14c3-2 7-2 10 1 3-3 7-3 10-1V5c-3-2-7-2-10 1zm0 0v14"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/>',
  star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
  user: '<circle cx="12" cy="8" r="3"/><path d="M5 20v-2a7 7 0 0 1 14 0v2"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l1.5-4A8.5 8.5 0 1 1 21 11.5zM8 11h8m-8 4h5"/>',
  play: '<path d="m9 5 11 7-11 7z"/>',
  pause: '<path d="M7 5h3v14H7zM14 5h3v14h-3z"/>',
  music: '<path d="M9 18V5l12-2v13M9 18a3 2 0 1 1-6 0 3 2 0 0 1 6 0zm12-2a3 2 0 1 1-6 0 3 2 0 0 1 6 0z"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.08a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.08a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'
};

function icon(node, name) {
  node.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">' + icons[name] + '</svg>';
}

function element(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  if (tag === 'button') node.type = 'button';
  return node;
}

function iconButton(name, label, handler) {
  const button = element('button', 'icon');
  icon(button, name);
  button.setAttribute('aria-label', label);
  button.title = label;
  button.addEventListener('click', handler);
  return button;
}

const feed = $('#verses');
const dialog = $('#dialog');
const dialogContent = $('#dialog-content');
const audio = $('#audio');
const playButton = $('#play');
const seek = $('#seek');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const stations = [
  { type: 'radio', title: 'Biblia Audio Christian Culture', url: 'https://stream.zeno.fm/gn3uhltrrytuv' },
  { type: 'radio', title: 'Polskie Radio Christian Culture', url: 'https://stream.zeno.fm/vz96pvl3pnktv' },
  { type: 'radio', title: 'Christian Culture Global', url: 'https://stream.zeno.fm/umej2cuqncluv' }
];
let bible;
let recordings = new Map();
let recordingsState = 'loading';
let cards = [];
let active = -1;
let pool = [];
let orderIndex = 0;
let scrollTimer;
let toastTimer;
let pressTimer;
let pressOrigin;
let settings = readLocal('cc-biblia-ubg-verses-v1') || {};
let audioMode = readLocal('cc-biblia-ubg-audio-v1') === 'voice' ? 'voice' : 'automatic';
let playingTrack = null;
let speech = null;
let playerError = '';
let returningFocus;
const trackedVerses = new Set();

function trackEvent(eventName, params = {}) {
  try {
    if (typeof window.ccTrack === 'function') {
      window.ccTrack(eventName, { app: 'scrolluj_biblie', ...params });
    }
  } catch {
    /* keep reader resilient if analytics is blocked */
  }
}

for (const item of document.querySelectorAll('[data-icon]')) icon(item, item.dataset.icon);

const LOCALE_STORAGE_KEY = 'ekocc_ui_lang';
const LOCALE_COOKIE_KEY = 'ekocc_lang';
const THEME_STORAGE_KEY = 'cc-sba-theme-v1';
const SCOPE_STORAGE_KEY = 'cc-sba-scope-v1';

const normalizeScope = (val) => (val === 'ot' || val === 'nt' ? val : 'all');
let testamentScope = normalizeScope(readLocal(SCOPE_STORAGE_KEY));

const I18N = {
  pl: {
    pageTitle: 'Scrolluj Biblię — Czytaj i słuchaj jednocześnie | Biblia UBG | Christian Culture',
    brandTitle: 'Scrolluj Biblię',
    brandSubtitle: 'CZYTAJ I SŁUCHAJ JEDNOCZEŚNIE',
    topActionsAria: 'Czytnik i konto',
    savedVerses: 'Ulubione wersety',
    appFavAdd: 'Dodaj aplikację do ulubionych',
    appFavRemove: 'Usuń aplikację z ulubionych',
    loginGoogle: 'Zaloguj z Google do LUMINA',
    readerAria: 'Czytnik losowych wersetów',
    loadingVerses: 'Wczytuję wersety UBG…',
    loadingFailed: 'Nie udało się wczytać Biblii UBG. Sprawdź połączenie i spróbuj ponownie.',
    retry: 'Wczytaj ponownie',
    versesAria: 'Wersety. Strzałki w górę i w dół zmieniają werset.',
    prevVerse: 'Poprzedni werset',
    nextVerse: 'Kolejny losowy werset',
    gestureHint: 'Przytrzymaj werset, aby otworzyć opcje',
    edgeOpen: 'Otwórz panel Christian Culture',
    edgeTitle: 'Panel Christian Culture',
    chatOpen: 'Otwórz czat LumiMes',
    playerAria: 'Odtwarzacz Biblii Audio',
    audioTitle: 'Biblia Audio',
    audioOptionsAria: 'Wybierz rodzaj odczytu',
    audioOptionsTitle: 'Opcje audio',
    seekAria: 'Zmień pozycję nagrania',
    liveBadge: 'NA ŻYWO',
    close: 'Zamknij',
    saveVerse: 'Zapisz werset',
    verseOptions: 'Opcje wersetu',
    addFavVerse: 'Dodaj werset do ulubionych',
    removeFavVerse: 'Usuń z ulubionych wersetów',
    savedFavToast: 'Zapisano w ulubionych wersetach.',
    removedFavToast: 'Usunięto z ulubionych wersetów.',
    storageBlocked: 'Przeglądarka blokuje zapis na urządzeniu.',
    copied: 'Skopiowano.',
    copyTitle: 'Skopiuj tekst',
    copyAria: 'Tekst do skopiowania',
    openChapterMojaBiblia: 'Otwórz rozdział w MojaBiblia',
    notePlaceholder: 'Twoja prywatna notatka…',
    noteAria: 'Notatka do wersetu',
    noteTitle: 'Notatka · {ref}',
    saveNote: 'Zapisz notatkę',
    noteSavedToast: 'Zapisano notatkę na tym urządzeniu.',
    askAiPrompt: 'Pomóż mi zrozumieć ten werset w kontekście całego rozdziału: {quote}. Wyjaśnij kontekst i wskaż powiązane fragmenty Biblii.',
    askAiRow: 'Zapytaj AI dla Jezusa o ten fragment',
    removeHighlight: 'Usuń podkreślenie',
    highlightVerse: 'Podkreśl werset',
    shareVerse: 'Udostępnij werset',
    copyVerse: 'Kopiuj tekst wersetu',
    readContext: 'Czytaj kontekst rozdziału',
    openMojaBiblia: 'Otwórz ten werset w MojaBiblia',
    readVoice: 'Odczytaj ten werset głosem urządzenia',
    playRecording: 'Odtwórz nagranie Christian Culture',
    editNote: 'Edytuj notatkę',
    addNote: 'Dodaj notatkę',
    searchInCc: 'Wyszukaj ten fragment w Christian Culture',
    openCcSearch: 'Otwórz Wyszukiwarkę Christian Culture',
    emptyFavorites: 'Zapisane wersety pojawią się tutaj.',
    readingVerse: 'Czytanie wersetu',
    noAudioDetail: 'Brak nagrania i polskiego głosu urządzenia.',
    loadingCatalog: 'Wczytuję katalog nagrań…',
    recordingRange: 'Nagranie CC · wersety {range}',
    recordingChapter: 'Biblia Audio · nagranie rozdziału',
    radioLive: 'Radio na żywo · {state}',
    radioConnected: 'połączono',
    radioPaused: 'wstrzymane',
    catalogUnavailable: 'Katalog audio niedostępny · ',
    deviceVoiceDetail: 'Głos urządzenia · UBG',
    previousFragment: ' · poprzedni fragment',
    stopReading: 'Zatrzymaj czytanie',
    pauseTrack: 'Wstrzymaj nagranie',
    playTrack: 'Odtwórz',
    noPolishVoice: 'Na tym urządzeniu brakuje polskiego głosu.',
    voiceError: 'Nie udało się odczytać tekstu głosem urządzenia.',
    radioConnectError: 'Nie udało się połączyć z radiem. Wybierz stację ponownie.',
    recordingPlayError: 'Nie udało się uruchomić nagrania. Spróbuj ponownie lub wybierz głos urządzenia.',
    radioTempUnavailable: 'Radio jest chwilowo niedostępne.',
    recordingTempUnavailable: 'Nagranie jest chwilowo niedostępne.',
    audioModeAuto: 'Nagrania CC, gdy są dostępne',
    audioModeVoice: 'Zawsze używaj głosu urządzenia',
    openAudioCatalog: 'Otwórz katalog Biblii Audio',
    liveRadioHeading: 'Radio na żywo',
    ytAria: 'Ustawienia i kanały Christian Culture',
    settingsBtn: 'Ustawienia',
    settingsTitle: 'Ustawienia',
    settingsScopeHeading: 'Zakres losowania wersetów',
    scope_all: 'Cała Biblia',
    scope_ot: 'Tylko Stary Testament',
    scope_nt: 'Tylko Nowy Testament',
    scopeSavedToast: 'Zapisano zakres: {scope}.',
    settingsBgHeading: 'Kolor tła panelu głównego',
    settingsCustomLabel: 'Własny kolor',
    settingsReset: 'Domyślny (Biel)',
    settingsSavedToast: 'Zapisano motyw czytnika.',
    settingsScriptureNote: 'Tekst Pisma Świętego pozostaje w polskim przekładzie UBG; interfejs aplikacji dostosowano do wybranego języka.',
    panelFallbackTitle: 'Panel Christian Culture',
    installTitle: 'Zainstaluj Scrolluj Biblię',
    installDesc: 'Otwieraj jednym dotknięciem z ekranu głównego — czytaj i słuchaj jak w natywnej aplikacji.',
    installCloseAria: 'Zamknij zaproszenie do instalacji',
    installCta: 'Zainstaluj aplikację',
    installLater: 'Później',
    installDone: 'Już zainstalowałem',
    installIosSteps: 'Na iPhone/iPad: dotknij ikony Udostępnij na pasku Safari, a następnie wybierz „Do ekranu początkowego”.',
    installAndroidSteps: 'Otwórz menu przeglądarki (⋮) i wybierz „Zainstaluj aplikację” lub „Dodaj do ekranu głównego”.',
    installedToast: 'Aplikacja Scrolluj Biblię została zainstalowana.',
    langGroupAria: 'Wybierz język interfejsu',
    theme_white: 'Biel',
    theme_paper: 'Papier (Sepia)',
    theme_sage: 'Szałwia',
    theme_sky: 'Błękit poranny',
    theme_rose: 'Pudrowy róż',
    theme_night: 'Ciemny (Noc)'
  },
  en: {
    pageTitle: 'Scroll the Bible — Read and listen at once | Polish UBG | Christian Culture',
    brandTitle: 'Scrolluj Biblię',
    brandSubtitle: 'READ AND LISTEN AT ONCE',
    topActionsAria: 'Reader and account',
    savedVerses: 'Saved verses',
    appFavAdd: 'Add app to favorites',
    appFavRemove: 'Remove app from favorites',
    loginGoogle: 'Sign in with Google to LUMINA',
    readerAria: 'Random Bible verse reader',
    loadingVerses: 'Loading UBG verses…',
    loadingFailed: 'Could not load UBG Bible. Check your connection and try again.',
    retry: 'Try again',
    versesAria: 'Verses. Up and down arrow keys switch verses.',
    prevVerse: 'Previous verse',
    nextVerse: 'Next random verse',
    gestureHint: 'Hold a verse to open options',
    edgeOpen: 'Open Christian Culture panel',
    edgeTitle: 'Christian Culture Panel',
    chatOpen: 'Open LumiMes chat',
    playerAria: 'Biblia Audio player',
    audioTitle: 'Biblia Audio',
    audioOptionsAria: 'Choose audio source',
    audioOptionsTitle: 'Audio options',
    seekAria: 'Seek recording position',
    liveBadge: 'LIVE',
    close: 'Close',
    saveVerse: 'Save verse',
    verseOptions: 'Verse options',
    addFavVerse: 'Add verse to favorites',
    removeFavVerse: 'Remove from saved verses',
    savedFavToast: 'Saved to favorite verses.',
    removedFavToast: 'Removed from saved verses.',
    storageBlocked: 'Browser blocks saving to this device.',
    copied: 'Copied.',
    copyTitle: 'Copy text',
    copyAria: 'Text to copy',
    openChapterMojaBiblia: 'Open chapter in MojaBiblia',
    notePlaceholder: 'Your private note…',
    noteAria: 'Note for verse',
    noteTitle: 'Note · {ref}',
    saveNote: 'Save note',
    noteSavedToast: 'Saved note on this device.',
    askAiPrompt: 'Help me understand this verse in the context of the whole chapter: {quote}. Explain the context and point to related Bible passages.',
    askAiRow: 'Ask AI for Jesus about this passage',
    removeHighlight: 'Remove highlight',
    highlightVerse: 'Highlight verse',
    shareVerse: 'Share verse',
    copyVerse: 'Copy verse text',
    readContext: 'Read chapter context',
    openMojaBiblia: 'Open this verse in MojaBiblia',
    readVoice: 'Read this verse aloud with device voice',
    playRecording: 'Play Christian Culture recording',
    editNote: 'Edit note',
    addNote: 'Add note',
    searchInCc: 'Search this passage in Christian Culture',
    openCcSearch: 'Open Christian Culture Search',
    emptyFavorites: 'Saved verses will appear here.',
    readingVerse: 'Reading verse',
    noAudioDetail: 'No recording or Polish device voice available.',
    loadingCatalog: 'Loading audio catalog…',
    recordingRange: 'CC Recording · verses {range}',
    recordingChapter: 'Biblia Audio · chapter recording',
    radioLive: 'Live Radio · {state}',
    radioConnected: 'connected',
    radioPaused: 'paused',
    catalogUnavailable: 'Audio catalog unavailable · ',
    deviceVoiceDetail: 'Device voice · UBG',
    previousFragment: ' · previous passage',
    stopReading: 'Stop reading',
    pauseTrack: 'Pause audio',
    playTrack: 'Play',
    noPolishVoice: 'Polish voice is missing on this device.',
    voiceError: 'Could not read text with device voice.',
    radioConnectError: 'Could not connect to radio. Select a station again.',
    recordingPlayError: 'Could not start recording. Try again or pick device voice.',
    radioTempUnavailable: 'Radio is temporarily unavailable.',
    recordingTempUnavailable: 'Recording is temporarily unavailable.',
    audioModeAuto: 'CC recordings when available',
    audioModeVoice: 'Always use device voice',
    openAudioCatalog: 'Open Biblia Audio catalog',
    liveRadioHeading: 'Live Radio',
    ytAria: 'Settings and Christian Culture channels',
    settingsBtn: 'Settings',
    settingsTitle: 'Settings',
    settingsScopeHeading: 'Bible verse range',
    scope_all: 'Whole Bible',
    scope_ot: 'Old Testament only',
    scope_nt: 'New Testament only',
    scopeSavedToast: 'Saved range: {scope}.',
    settingsBgHeading: 'Main panel background color',
    settingsCustomLabel: 'Custom color',
    settingsReset: 'Default (White)',
    settingsSavedToast: 'Reader theme saved.',
    settingsScriptureNote: 'Scripture text remains in the Polish UBG translation; interface controls follow your chosen language.',
    panelFallbackTitle: 'Christian Culture Panel',
    installTitle: 'Install Scrolluj Biblię',
    installDesc: 'Open with one tap from your home screen — read and listen like a native app.',
    installCloseAria: 'Close install prompt',
    installCta: 'Install app',
    installLater: 'Later',
    installDone: 'Already installed',
    installIosSteps: 'On iPhone/iPad: tap Share in Safari, then choose “Add to Home Screen”.',
    installAndroidSteps: 'Open the browser menu (⋮) and choose “Install app” or “Add to Home screen”.',
    installedToast: 'Scrolluj Biblię app has been installed.',
    langGroupAria: 'Select interface language',
    theme_white: 'White',
    theme_paper: 'Paper (Sepia)',
    theme_sage: 'Sage',
    theme_sky: 'Morning Sky',
    theme_rose: 'Soft Rose',
    theme_night: 'Dark (Night)'
  },
  de: {
    pageTitle: 'Scrolluj Biblię — Gleichzeitig lesen und hören | Polnische UBG | Christian Culture',
    brandTitle: 'Scrolluj Biblię',
    brandSubtitle: 'GLEICHZEITIG LESEN UND HÖREN',
    topActionsAria: 'Leser und Konto',
    savedVerses: 'Gespeicherte Verse',
    appFavAdd: 'App zu Favoriten hinzufügen',
    appFavRemove: 'App aus Favoriten entfernen',
    loginGoogle: 'Mit Google bei LUMINA anmelden',
    readerAria: 'Zufälliger Bibelvers-Leser',
    loadingVerses: 'Lade UBG-Verse…',
    loadingFailed: 'UBG-Bibel konnte nicht geladen werden. Verbindung prüfen und erneut versuchen.',
    retry: 'Erneut laden',
    versesAria: 'Verse. Pfeiltasten hoch und runter wechseln den Vers.',
    prevVerse: 'Vorheriger Vers',
    nextVerse: 'Nächster zufälliger Vers',
    gestureHint: 'Vers gedrückt halten für Optionen',
    edgeOpen: 'Christian-Culture-Panel öffnen',
    edgeTitle: 'Christian-Culture-Panel',
    chatOpen: 'LumiMes-Chat öffnen',
    playerAria: 'Biblia-Audio-Player',
    audioTitle: 'Biblia Audio',
    audioOptionsAria: 'Audioquelle wählen',
    audioOptionsTitle: 'Audiooptionen',
    seekAria: 'Aufnahmeposition ändern',
    liveBadge: 'LIVE',
    close: 'Schließen',
    saveVerse: 'Vers speichern',
    verseOptions: 'Vers-Optionen',
    addFavVerse: 'Vers zu Favoriten hinzufügen',
    removeFavVerse: 'Aus gespeicherten Versen entfernen',
    savedFavToast: 'In Lieblingsversen gespeichert.',
    removedFavToast: 'Aus Lieblingsversen entfernt.',
    storageBlocked: 'Browser blockiert Speicherung auf diesem Gerät.',
    copied: 'Kopiert.',
    copyTitle: 'Text kopieren',
    copyAria: 'Zu kopierender Text',
    openChapterMojaBiblia: 'Kapitel in MojaBiblia öffnen',
    notePlaceholder: 'Deine private Notiz…',
    noteAria: 'Notiz zum Vers',
    noteTitle: 'Notiz · {ref}',
    saveNote: 'Notiz speichern',
    noteSavedToast: 'Notiz auf diesem Gerät gespeichert.',
    askAiPrompt: 'Hilf mir, diesen Vers im Zusammenhang des ganzen Kapitels zu verstehen: {quote}. Erkläre den Kontext und zeige verwandte Bibelstellen.',
    askAiRow: 'KI für Jesus nach diesem Abschnitt fragen',
    removeHighlight: 'Hervorhebung entfernen',
    highlightVerse: 'Vers hervorheben',
    shareVerse: 'Vers teilen',
    copyVerse: 'Verstext kopieren',
    readContext: 'Kapitelkontext lesen',
    openMojaBiblia: 'Diesen Vers in MojaBiblia öffnen',
    readVoice: 'Diesen Vers mit Gerätestimme vorlesen',
    playRecording: 'Christian-Culture-Aufnahme abspielen',
    editNote: 'Notiz bearbeiten',
    addNote: 'Notiz hinzufügen',
    searchInCc: 'Diesen Abschnitt in Christian Culture suchen',
    openCcSearch: 'Christian-Culture-Suche öffnen',
    emptyFavorites: 'Gespeicherte Verse erscheinen hier.',
    readingVerse: 'Vers vorlesen',
    noAudioDetail: 'Keine Aufnahme oder polnische Gerätestimme verfügbar.',
    loadingCatalog: 'Lade Audiokatalog…',
    recordingRange: 'CC-Aufnahme · Verse {range}',
    recordingChapter: 'Biblia Audio · Kapitelaufnahme',
    radioLive: 'Live-Radio · {state}',
    radioConnected: 'verbunden',
    radioPaused: 'pausiert',
    catalogUnavailable: 'Audiokatalog nicht verfügbar · ',
    deviceVoiceDetail: 'Gerätestimme · UBG',
    previousFragment: ' · vorheriger Abschnitt',
    stopReading: 'Vorlesen stoppen',
    pauseTrack: 'Aufnahme pausieren',
    playTrack: 'Abspielen',
    noPolishVoice: 'Auf diesem Gerät fehlt eine polnische Stimme.',
    voiceError: 'Text konnte nicht mit der Gerätestimme vorgelesen werden.',
    radioConnectError: 'Verbindung zum Radio fehlgeschlagen. Bitte Sender erneut wählen.',
    recordingPlayError: 'Aufnahme konnte nicht gestartet werden. Erneut versuchen oder Gerätestimme wählen.',
    radioTempUnavailable: 'Radio ist vorübergehend nicht verfügbar.',
    recordingTempUnavailable: 'Aufnahme ist vorübergehend nicht verfügbar.',
    audioModeAuto: 'CC-Aufnahmen, wenn verfügbar',
    audioModeVoice: 'Immer Gerätestimme verwenden',
    openAudioCatalog: 'Biblia-Audio-Katalog öffnen',
    liveRadioHeading: 'Live-Radio',
    ytAria: 'Einstellungen und Christian-Culture-Kanäle',
    settingsBtn: 'Einstellungen',
    settingsTitle: 'Einstellungen',
    settingsScopeHeading: 'Bibelbereich für Zufallsverse',
    scope_all: 'Ganze Bibel',
    scope_ot: 'Nur Altes Testament',
    scope_nt: 'Nur Neues Testament',
    scopeSavedToast: 'Bereich gespeichert: {scope}.',
    settingsBgHeading: 'Hintergrundfarbe des Hauptbereichs',
    settingsCustomLabel: 'Eigene Farbe',
    settingsReset: 'Standard (Weiß)',
    settingsSavedToast: 'Leser-Design gespeichert.',
    settingsScriptureNote: 'Der Bibeltext bleibt in der polnischen UBG-Übersetzung; die Benutzeroberfläche nutzt Ihre gewählte Sprache.',
    panelFallbackTitle: 'Christian-Culture-Panel',
    installTitle: 'Scrolluj Biblię installieren',
    installDesc: 'Mit einem Tipp vom Startbildschirm öffnen — lesen und hören wie in einer App.',
    installCloseAria: 'Installationshinweis schließen',
    installCta: 'App installieren',
    installLater: 'Später',
    installDone: 'Bereits installiert',
    installIosSteps: 'Auf iPhone/iPad: Tippe in Safari auf „Teilen“ und wähle „Zum Home-Bildschirm“.',
    installAndroidSteps: 'Öffne das Browser-Menü (⋮) und wähle „App installieren“ oder „Zum Startbildschirm hinzufügen“.',
    installedToast: 'Die App Scrolluj Biblię wurde installiert.',
    langGroupAria: 'Oberflächensprache wählen',
    theme_white: 'Weiß',
    theme_paper: 'Papier (Sepia)',
    theme_sage: 'Salbei',
    theme_sky: 'Morgenblau',
    theme_rose: 'Zartrosa',
    theme_night: 'Dunkel (Nacht)'
  }
};

const BOOK_NAMES_EN = {
  GEN: 'Genesis', EXO: 'Exodus', LEV: 'Leviticus', NUM: 'Numbers', DEU: 'Deuteronomy',
  JOS: 'Joshua', JDG: 'Judges', RUT: 'Ruth', '1SA': '1 Samuel', '2SA': '2 Samuel',
  '1KI': '1 Kings', '2KI': '2 Kings', '1CH': '1 Chronicles', '2CH': '2 Chronicles', EZR: 'Ezra',
  NEH: 'Nehemiah', EST: 'Esther', JOB: 'Job', PSA: 'Psalms', PRO: 'Proverbs',
  ECC: 'Ecclesiastes', SNG: 'Song of Songs', ISA: 'Isaiah', JER: 'Jeremiah', LAM: 'Lamentations',
  EZK: 'Ezekiel', DAN: 'Daniel', HOS: 'Hosea', JOL: 'Joel', AMO: 'Amos',
  OBA: 'Obadiah', JON: 'Jonah', MIC: 'Micah', NAM: 'Nahum', HAB: 'Habakkuk',
  ZEP: 'Zephaniah', HAG: 'Haggai', ZEC: 'Zechariah', MAL: 'Malachi',
  MAT: 'Matthew', MRK: 'Mark', LUK: 'Luke', JHN: 'John', ACT: 'Acts',
  ROM: 'Romans', '1CO': '1 Corinthians', '2CO': '2 Corinthians', GAL: 'Galatians', EPH: 'Ephesians',
  PHP: 'Philippians', COL: 'Colossians', '1TH': '1 Thessalonians', '2TH': '2 Thessalonians', '1TI': '1 Timothy',
  '2TI': '2 Timothy', TIT: 'Titus', PHM: 'Philemon', HEB: 'Hebrews', JAS: 'James',
  '1PE': '1 Peter', '2PE': '2 Peter', '1JN': '1 John', '2JN': '2 John', '3JN': '3 John',
  JUD: 'Jude', REV: 'Revelation'
};

const BOOK_NAMES_DE = {
  GEN: '1. Mose', EXO: '2. Mose', LEV: '3. Mose', NUM: '4. Mose', DEU: '5. Mose',
  JOS: 'Josua', JDG: 'Richter', RUT: 'Rut', '1SA': '1. Samuel', '2SA': '2. Samuel',
  '1KI': '1. Könige', '2KI': '2. Könige', '1CH': '1. Chronik', '2CH': '2. Chronik', EZR: 'Esra',
  NEH: 'Nehemia', EST: 'Ester', JOB: 'Hiob', PSA: 'Psalmen', PRO: 'Sprüche',
  ECC: 'Prediger', SNG: 'Hohelied', ISA: 'Jesaja', JER: 'Jeremia', LAM: 'Klagelieder',
  EZK: 'Hesekiel', DAN: 'Daniel', HOS: 'Hosea', JOL: 'Joel', AMO: 'Amos',
  OBA: 'Obadja', JON: 'Jona', MIC: 'Micha', NAM: 'Nahum', HAB: 'Habakuk',
  ZEP: 'Zefanja', HAG: 'Haggai', ZEC: 'Sacharja', MAL: 'Maleachi',
  MAT: 'Matthäus', MRK: 'Markus', LUK: 'Lukas', JHN: 'Johannes', ACT: 'Apostelgeschichte',
  ROM: 'Römer', '1CO': '1. Korinther', '2CO': '2. Korinther', GAL: 'Galater', EPH: 'Epheser',
  PHP: 'Philipper', COL: 'Kolosser', '1TH': '1. Thessalonicher', '2TH': '2. Thessalonicher', '1TI': '1. Timotheus',
  '2TI': '2. Timotheus', TIT: 'Titus', PHM: 'Philemon', HEB: 'Hebräer', JAS: 'Jakobus',
  '1PE': '1. Petrus', '2PE': '2. Petrus', '1JN': '1. Johannes', '2JN': '2. Johannes', '3JN': '3. Johannes',
  JUD: 'Judas', REV: 'Offenbarung'
};

function normalizeLocale(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const clean = raw.trim().toLowerCase().replace('_', '-').split('-')[0];
  return ['pl', 'en', 'de'].includes(clean) ? clean : null;
}

function readLocaleCookie() {
  try {
    const match = (`; ${document.cookie}`).split(`; ${LOCALE_COOKIE_KEY}=`);
    if (match.length === 2) return normalizeLocale(match.pop().split(';').shift());
  } catch {}
  return null;
}

function detectInitialLocale() {
  try {
    const query = normalizeLocale(new URLSearchParams(location.search).get('lang'));
    if (query) return query;
    const sess = normalizeLocale(sessionStorage.getItem(LOCALE_STORAGE_KEY));
    if (sess) return sess;
    const stored = normalizeLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
    if (stored) return stored;
  } catch {}
  return readLocaleCookie() || 'pl';
}

let currentLocale = detectInitialLocale();

function setLocale(locale, scope = 'global') {
  const target = normalizeLocale(locale) || 'pl';
  const prevLocale = currentLocale;
  currentLocale = target;
  try {
    if (scope === 'app') {
      sessionStorage.setItem(LOCALE_STORAGE_KEY, target);
    } else {
      localStorage.setItem(LOCALE_STORAGE_KEY, target);
      const exp = new Date(Date.now() + 365 * 86400000).toUTCString();
      document.cookie = `${LOCALE_COOKIE_KEY}=${target};expires=${exp};path=/;SameSite=Lax`;
      sessionStorage.removeItem(LOCALE_STORAGE_KEY);
    }
  } catch {}
  document.documentElement.lang = target;
  document.querySelectorAll('[data-ekocc-lang-choice]').forEach((btn) => {
    const isActive = btn.dataset.ekoccLangChoice === target;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
  document.dispatchEvent(new CustomEvent('ekocc:locale-changed', {
    detail: { locale: target, prevLocale, scope }
  }));
  return target;
}

if (!window.EkoCCI18n) {
  window.EkoCCI18n = {
    supportedLocales: ['pl', 'en', 'de'],
    defaultLocale: 'pl',
    getLocale: () => currentLocale,
    setLocale,
    t: (key, vars) => tr(key, vars)
  };
}

function tr(key, vars = {}) {
  const dict = I18N[currentLocale] || I18N.pl;
  let text = dict[key] ?? I18N.pl[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    text = text.replaceAll(`{${k}}`, String(v));
  }
  return text;
}

const READER_THEMES = [
  {
    id: 'white',
    labelKey: 'theme_white',
    tokens: {
      bg: '#ffffff', fg: '#121212', muted: '#565251', line: '#ede9e8', accent: '#b71933',
      btnBg: '#ffffff', btnHover: '#f6f3f3', markBg: '#ffe3e9', rowBg: '#f7f5f5',
      rowHover: '#fbe8ec', contextBg: '#fff1f3', colorScheme: 'light'
    }
  },
  {
    id: 'paper',
    labelKey: 'theme_paper',
    tokens: {
      bg: '#f6efe2', fg: '#2b2118', muted: '#6d5c4c', line: '#e3d7c3', accent: '#9e2a2b',
      btnBg: '#fbf6ed', btnHover: '#ece2d0', markBg: '#f5dcc4', rowBg: '#eee4d3',
      rowHover: '#e6d7be', contextBg: '#efe2cc', colorScheme: 'light'
    }
  },
  {
    id: 'sage',
    labelKey: 'theme_sage',
    tokens: {
      bg: '#eef4ef', fg: '#17261c', muted: '#4c6354', line: '#d6e2d8', accent: '#b71933',
      btnBg: '#f6faf7', btnHover: '#e2ece4', markBg: '#f9dce2', rowBg: '#e4ede6',
      rowHover: '#dbe7dd', contextBg: '#e7f0e9', colorScheme: 'light'
    }
  },
  {
    id: 'sky',
    labelKey: 'theme_sky',
    tokens: {
      bg: '#edf3fa', fg: '#152233', muted: '#4d6078', line: '#d5e1ee', accent: '#b71933',
      btnBg: '#f6f9fd', btnHover: '#e0eaf5', markBg: '#f8dce4', rowBg: '#e3ecf6',
      rowHover: '#d8e4f2', contextBg: '#e5eef8', colorScheme: 'light'
    }
  },
  {
    id: 'rose',
    labelKey: 'theme_rose',
    tokens: {
      bg: '#fbf0f3', fg: '#2b161d', muted: '#704e59', line: '#ecd8de', accent: '#b71933',
      btnBg: '#fff7f9', btnHover: '#f4e2e7', markBg: '#ffd7e1', rowBg: '#f4e5e9',
      rowHover: '#eed6dd', contextBg: '#fae6ec', colorScheme: 'light'
    }
  },
  {
    id: 'night',
    labelKey: 'theme_night',
    tokens: {
      bg: '#141418', fg: '#f5f2f2', muted: '#b8b2b4', line: '#2d2a32', accent: '#e74763',
      btnBg: '#1e1d22', btnHover: '#2a2830', markBg: '#4f1824', rowBg: '#212026',
      rowHover: '#31262c', contextBg: '#2c191f', colorScheme: 'dark'
    }
  }
];

function tokensFromCustomHex(hex) {
  if (typeof hex !== 'string' || !/^#[0-9a-f]{6}$/i.test(hex)) return READER_THEMES[0].tokens;
  const clean = hex.toLowerCase();
  const r = parseInt(clean.slice(1, 3), 16);
  const g = parseInt(clean.slice(3, 5), 16);
  const b = parseInt(clean.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  const dark = yiq < 145;
  const mix = (tr2, tg2, tb2, alpha) => {
    const mr = Math.round(r * (1 - alpha) + tr2 * alpha);
    const mg = Math.round(g * (1 - alpha) + tg2 * alpha);
    const mb = Math.round(b * (1 - alpha) + tb2 * alpha);
    return '#' + [mr, mg, mb].map((n) => n.toString(16).padStart(2, '0')).join('');
  };
  if (dark) {
    return {
      bg: clean, fg: '#f5f2f2', muted: '#c6c0c2', line: mix(255, 255, 255, 0.16), accent: '#e74763',
      btnBg: mix(255, 255, 255, 0.08), btnHover: mix(255, 255, 255, 0.16),
      markBg: '#4f1824', rowBg: mix(255, 255, 255, 0.08),
      rowHover: mix(231, 71, 99, 0.22), contextBg: mix(231, 71, 99, 0.18), colorScheme: 'dark'
    };
  }
  return {
    bg: clean, fg: '#141414', muted: '#524e4d', line: mix(0, 0, 0, 0.12), accent: '#b71933',
    btnBg: mix(255, 255, 255, 0.55), btnHover: mix(0, 0, 0, 0.06),
    markBg: '#ffe3e9', rowBg: mix(0, 0, 0, 0.05),
    rowHover: mix(183, 25, 51, 0.10), contextBg: mix(183, 25, 51, 0.08), colorScheme: 'light'
  };
}

function loadThemePref() {
  const saved = readLocal(THEME_STORAGE_KEY);
  if (saved && typeof saved === 'object' && typeof saved.id === 'string') return saved;
  return { id: 'white', customHex: '#f6efe2' };
}

let themePref = loadThemePref();

function applyReaderTheme(pref = themePref) {
  const nextPref = pref && typeof pref === 'object' ? pref : { id: 'white', customHex: '#f6efe2' };
  const preset = READER_THEMES.find((t) => t.id === nextPref.id);
  const customHex = /^#[0-9a-f]{6}$/i.test(nextPref.customHex || '') ? nextPref.customHex.toLowerCase() : '#f6efe2';
  const resolvedId = nextPref.id === 'custom' ? 'custom' : (preset ? preset.id : 'white');
  const tokens = resolvedId === 'custom'
    ? tokensFromCustomHex(customHex)
    : (preset ? preset.tokens : READER_THEMES[0].tokens);
  themePref = { id: resolvedId, customHex };

  const rootStyle = document.documentElement.style;
  rootStyle.setProperty('--sba-surface-bg', tokens.bg);
  rootStyle.setProperty('--sba-surface-fg', tokens.fg);
  rootStyle.setProperty('--sba-surface-muted', tokens.muted);
  rootStyle.setProperty('--sba-surface-line', tokens.line);
  rootStyle.setProperty('--sba-surface-accent', tokens.accent);
  rootStyle.setProperty('--sba-surface-btn-bg', tokens.btnBg);
  rootStyle.setProperty('--sba-surface-btn-hover', tokens.btnHover);
  rootStyle.setProperty('--sba-surface-mark-bg', tokens.markBg);
  rootStyle.setProperty('--sba-surface-row-bg', tokens.rowBg);
  rootStyle.setProperty('--sba-surface-row-hover', tokens.rowHover);
  rootStyle.setProperty('--sba-surface-context-bg', tokens.contextBg);
  rootStyle.colorScheme = tokens.colorScheme;
  document.documentElement.dataset.sbaTheme = resolvedId;
  const metaTheme = $('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', tokens.bg);
}

function setReaderTheme(nextPref, { save = true, toast = false } = {}) {
  applyReaderTheme(nextPref);
  if (save) {
    saveLocal(THEME_STORAGE_KEY, themePref);
    trackEvent('sba_theme_change', { theme_id: themePref.id });
    if (toast) notify(tr('settingsSavedToast'));
  }
}

function readLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    notify(tr('storageBlocked'));
  }
}

function notify(message) {
  const toast = $('#toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toastTimer = setTimeout(() => { toast.textContent = ''; }, 2400);
}

const bookName = (verse) => {
  if (!verse) return '';
  if (currentLocale === 'en') return BOOK_NAMES_EN[verse.book] || verse.name;
  if (currentLocale === 'de') return BOOK_NAMES_DE[verse.book] || verse.name;
  return verse.name;
};
const ref = (verse) => bookName(verse) + ' ' + verse.chapter + ':' + verse.number;
const chapterRef = (verse) => bookName(verse) + ' ' + verse.chapter;
const selected = () => cards[active]?.verse;

function verseMatchesScope(verse, scope = testamentScope) {
  if (!verse) return false;
  if (scope === 'ot') return verse.testament === 'OT';
  if (scope === 'nt') return verse.testament === 'NT';
  return true;
}

function filteredVerses() {
  const list = bible.verses.filter((verse) => verseMatchesScope(verse));
  return list.length ? list : bible.verses;
}

function shuffleVerses() {
  pool = [...filteredVerses()];
  for (let index = pool.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swap]] = [pool[swap], pool[index]];
  }
  orderIndex = 0;
}

function draw() {
  if (orderIndex === pool.length) shuffleVerses();
  return pool[orderIndex++];
}

function addCards(count, initial = null) {
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < count; index++) {
    let verse = index === 0 && initial ? initial : draw();
    if (!initial || index !== 0) {
      while (pool.length > 1 && verse.key === cards.at(-1)?.verse.key) verse = draw();
    }
    const card = element('article', 'verse' + (verse.text.length > 175 ? ' long' : ''));
    card.setAttribute('aria-hidden', 'true');
    card.dataset.testament = verse.testament || 'OT';
    card.dataset.book = verse.book;
    const body = element('div', 'body');
    const quote = element('blockquote');
    const actions = element('div', 'verse-actions');
    const favorite = iconButton('heart', tr('saveVerse'), () => toggleFavorite(verse));
    const more = iconButton('more', tr('verseOptions'), () => openVerseMenu(verse));
    actions.append(favorite, more);
    const refEl = element('div', 'ref', ref(verse) + ' · UBG');
    body.append(refEl, quote, actions);
    card.append(body);
    const entry = { verse, card, refEl, quote, favorite, more };
    paintVerse(entry);
    cards.push(entry);
    fragment.append(card);
  }
  feed.append(fragment);
}

function paintVerse(entry) {
  const value = settings[entry.verse.key];
  if (value?.marked) {
    entry.quote.replaceChildren(element('mark', '', entry.verse.text));
  } else {
    entry.quote.textContent = entry.verse.text;
  }
  if (entry.refEl) entry.refEl.textContent = ref(entry.verse) + ' · UBG';
  const label = value?.saved ? tr('removeFavVerse') : tr('addFavVerse');
  entry.favorite.setAttribute('aria-label', label);
  entry.favorite.setAttribute('aria-pressed', String(Boolean(value?.saved)));
  entry.favorite.title = label;
  const moreLabel = tr('verseOptions');
  entry.more.setAttribute('aria-label', moreLabel);
  entry.more.title = moreLabel;
}

function updateVerse(verse, change) {
  const value = { ...settings[verse.key], ...change };
  if (!value.saved && !value.marked && !value.note) delete settings[verse.key];
  else settings[verse.key] = value;
  saveLocal('cc-biblia-ubg-verses-v1', settings);
  cards.filter((entry) => entry.verse.key === verse.key).forEach(paintVerse);
}

function toggleFavorite(verse) {
  const saved = !settings[verse.key]?.saved;
  updateVerse(verse, { saved });
  trackEvent('sba_verse_favorite', { verse_key: verse.key, book: verse.book, chapter: verse.chapter, saved });
  notify(saved ? tr('savedFavToast') : tr('removedFavToast'));
}

function activate(index) {
  if (index === active || !cards[index]) return;
  const old = cards[active];
  if (old) {
    old.card.classList.remove('active');
    old.card.setAttribute('aria-hidden', 'true');
  }
  active = index;
  const entry = cards[index];
  entry.card.classList.add('active');
  entry.card.removeAttribute('aria-hidden');
  $('#verse-announcement').textContent = ref(entry.verse) + '. ' + entry.verse.text;
  $('#previous').disabled = index === 0;
  if (old) $('#edge').hidden = false;
  playerError = '';
  if (!isPlaying() && playingTrack?.type !== 'radio' && playingTrack?.verse.key !== entry.verse.key) stopPlayback();
  updatePlayer();
  if (!trackedVerses.has(entry.verse.key)) {
    trackedVerses.add(entry.verse.key);
    trackEvent('sba_verse_view', {
      verse_key: entry.verse.key,
      book: entry.verse.book,
      chapter: entry.verse.chapter,
      initial_view: !old
    });
  }
  if (active >= cards.length - 4) addCards(12);
}

// Only near the last active element is normally inspected. Binary search handles jumps.
function nearestCard() {
  if (!cards.length) return 0;
  const center = feed.scrollTop + feed.clientHeight / 2;
  let first = 0;
  let last = cards.length - 1;
  while (first < last) {
    const middle = Math.floor((first + last) / 2);
    const card = cards[middle].card;
    if (card.offsetTop + card.offsetHeight < center) first = middle + 1;
    else last = middle;
  }
  return first;
}

function settleScroll() {
  const next = nearestCard();
  activate(next);
  // Limit DOM growth while retaining a substantial backwards history.
  if (cards.length > 108 && active > 75) {
    const removed = cards.splice(0, 48);
    const previousTop = cards[active - removed.length].card.offsetTop;
    const previousScroll = feed.scrollTop;
    const snapStyle = feed.style.scrollSnapType;
    feed.style.scrollSnapType = 'none';
    removed.forEach(({ card }) => card.remove());
    active -= removed.length;
    feed.scrollTop = previousScroll - (previousTop - cards[active].card.offsetTop);
    requestAnimationFrame(() => { feed.style.scrollSnapType = snapStyle; });
  }
}

function goTo(index, instant = false) {
  if (index >= cards.length) addCards(12);
  const card = cards[index]?.card;
  if (!card) return;
  feed.scrollTo({ top: card.offsetTop + (card.offsetHeight - feed.clientHeight) / 2, behavior: instant || reduceMotion.matches ? 'instant' : 'smooth' });
  if (instant) activate(index);
}

function layout() {
  feed.style.setProperty('--verse-space', Math.round(feed.clientHeight * .43) + 'px');
  feed.style.paddingBlock = Math.max(0, (feed.clientHeight * .57) / 2) + 'px';
  if (active >= 0) goTo(active, true);
}

let frameScrollTimer;
let touchSwipe = null;
let wheelCooldown = 0;

feed.addEventListener('scroll', () => {
  clearPress();
  if (!frameScrollTimer) {
    frameScrollTimer = requestAnimationFrame(() => {
      frameScrollTimer = 0;
      const next = nearestCard();
      if (next !== active) activate(next);
    });
  }
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(settleScroll, 55);
}, { passive: true });
feed.addEventListener('scrollend', () => {
  clearTimeout(scrollTimer);
  settleScroll();
});
feed.addEventListener('touchstart', (event) => {
  if (event.touches.length !== 1) return;
  const touch = event.touches[0];
  touchSwipe = { x: touch.clientX, y: touch.clientY, time: performance.now() };
}, { passive: true });
feed.addEventListener('touchend', (event) => {
  if (!touchSwipe || dialog.open || event.changedTouches.length !== 1) {
    touchSwipe = null;
    return;
  }
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchSwipe.x;
  const dy = touch.clientY - touchSwipe.y;
  const dt = performance.now() - touchSwipe.time;
  touchSwipe = null;
  if (dt <= 260 && Math.abs(dy) >= 38 && Math.abs(dx) < Math.abs(dy) * 0.8) {
    goTo(active + (dy < 0 ? 1 : -1));
  }
}, { passive: true });
feed.addEventListener('wheel', (event) => {
  if (dialog.open || Math.abs(event.deltaY) < 18) return;
  event.preventDefault();
  const now = performance.now();
  if (now - wheelCooldown < 280) return;
  wheelCooldown = now;
  goTo(active + (event.deltaY > 0 ? 1 : -1));
}, { passive: false });
$('#previous').addEventListener('click', () => goTo(active - 1));
$('#next').addEventListener('click', () => goTo(active + 1));
feed.addEventListener('keydown', (event) => {
  if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(event.key)) return;
  event.preventDefault();
  goTo(active + (['ArrowDown', 'PageDown'].includes(event.key) ? 1 : -1));
});
new ResizeObserver(() => {
  if (!feed.hidden) layout();
}).observe(feed);

function clearPress() {
  clearTimeout(pressTimer);
  pressOrigin = null;
}

let dialogGuardUntil = 0;
let awaitingHoldRelease = false;
function armDialogHoldGuard() {
  awaitingHoldRelease = true;
  dialogGuardUntil = performance.now() + 800;
  const onRelease = () => {
    awaitingHoldRelease = false;
    dialogGuardUntil = Math.max(dialogGuardUntil, performance.now() + 700);
    window.removeEventListener('pointerup', onRelease, true);
    window.removeEventListener('pointercancel', onRelease, true);
    window.removeEventListener('touchend', onRelease, true);
    window.removeEventListener('touchcancel', onRelease, true);
  };
  window.addEventListener('pointerup', onRelease, true);
  window.addEventListener('pointercancel', onRelease, true);
  window.addEventListener('touchend', onRelease, true);
  window.addEventListener('touchcancel', onRelease, true);
}

feed.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary || event.button !== 0 || !event.target.closest('.verse.active') || event.target.closest('button')) return;
  pressOrigin = [event.clientX, event.clientY];
  const verse = selected();
  pressTimer = setTimeout(() => {
    clearPress();
    if (selected() === verse) {
      armDialogHoldGuard();
      openVerseMenu(verse);
    }
  }, 510);
});
feed.addEventListener('pointermove', (event) => {
  if (pressOrigin && Math.hypot(event.clientX - pressOrigin[0], event.clientY - pressOrigin[1]) > 10) clearPress();
});
for (const type of ['pointerup', 'pointercancel', 'pointerleave']) feed.addEventListener(type, clearPress);
feed.addEventListener('contextmenu', (event) => {
  if (!event.target.closest('.verse.active') || event.target.closest('button')) return;
  event.preventDefault();
  clearPress();
  if (!dialog.open && selected()) {
    armDialogHoldGuard();
    openVerseMenu(selected());
  }
});

function show(title, items, { edge = false, view = '' } = {}) {
  dialog.classList.toggle('sba-edge-panel', edge);
  dialog.dataset.view = view;
  $('#dialog-title').textContent = title;
  dialogContent.replaceChildren(...items);
  if (!dialog.open) {
    returningFocus = document.activeElement;
    dialog.showModal();
  }
  dialog.scrollTop = 0;
  $('#close').focus();
}
dialog.addEventListener('pointerdown', (event) => {
  if (!awaitingHoldRelease && event.isPrimary) dialogGuardUntil = 0;
}, true);
dialog.addEventListener('click', (event) => {
  if (awaitingHoldRelease || performance.now() < dialogGuardUntil) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
}, true);
$('#close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => {
  awaitingHoldRelease = false;
  dialogGuardUntil = 0;
  dialog.dataset.view = '';
  if (returningFocus?.isConnected && !returningFocus.closest('[aria-hidden=true]')) returningFocus.focus({ preventScroll: true });
  else feed.focus({ preventScroll: true });
});

function row(title, handler) {
  const button = element('button', 'menu-row', title);
  button.addEventListener('click', handler);
  return button;
}
function link(title, url) {
  const anchor = element('a', 'menu-row', title);
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener';
  anchor.addEventListener('click', () => {
    const href = typeof url === 'string' ? url : url.href;
    let targetHost = '';
    let targetPath = '';
    try {
      const parsed = new URL(href, location.href);
      targetHost = parsed.hostname;
      targetPath = parsed.pathname;
    } catch {
      /* ignore malformed url */
    }
    trackEvent('sba_integration_click', { link_label: title, target_host: targetHost, target_path: targetPath });
  });
  return anchor;
}

function withSbaContext(url, verse = selected()) {
  url.searchParams.set('skin', 'sba');
  url.searchParams.set('source', 'sba');
  if (verse?.key) url.searchParams.set('ref', verse.key);
  return url;
}

function ccSearchUrl(verse, path = '/wyszukiwarka') {
  const url = withSbaContext(site(path), verse);
  if (verse) url.searchParams.set('q', ref(verse));
  return url;
}

function mojaBiblia(verse) {
  const url = site('/mojabiblia');
  url.search = new URLSearchParams({ book: verse.book, ch: verse.chapter, chapter: verse.chapter, mode: 'reader', verse: verse.number });
  return withSbaContext(url, verse);
}

function verseLink(verse) {
  const url = new URL(location.href);
  if (inEcosystem) url.pathname = '/sba';
  url.search = '';
  url.hash = 'werset=' + verse.key;
  return url;
}

function verseQuote(verse) {
  return '„' + verse.text + '” — ' + ref(verse) + ' (UBG)';
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    notify(tr('copied'));
  } catch {
    const input = element('textarea');
    input.value = text;
    input.readOnly = true;
    input.setAttribute('aria-label', tr('copyAria'));
    show(tr('copyTitle'), [input]);
    input.focus();
    input.select();
  }
}

async function share(verse) {
  const link = verseLink(verse);
  try {
    if (navigator.share) {
      await navigator.share({ title: ref(verse) + ' · UBG', text: verseQuote(verse), url: link.href });
      trackEvent('sba_verse_share', { verse_key: verse.key, method: 'web_share' });
      return;
    }
  } catch (error) {
    if (error.name === 'AbortError') return;
  }
  await copy(verseQuote(verse) + '\n' + link.href);
  trackEvent('sba_verse_share', { verse_key: verse.key, method: 'clipboard' });
}

function showContext(verse) {
  const chapter = bible.chapters.get(verse.book + '.' + verse.chapter);
  const nodes = chapter.map((item) => {
    const paragraph = element('p', 'context-verse' + (item.key === verse.key ? ' active' : ''));
    paragraph.append(element('strong', '', String(item.number) + ' '), document.createTextNode(item.text));
    if (item.key === verse.key) paragraph.setAttribute('aria-current', 'true');
    return paragraph;
  });
  show(chapterRef(verse) + ' · UBG', [link(tr('openChapterMojaBiblia'), mojaBiblia(verse)), ...nodes]);
  dialogContent.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest' });
  trackEvent('sba_chapter_context', { verse_key: verse.key, book: verse.book, chapter: verse.chapter });
}

function showNote(verse) {
  const input = element('textarea');
  input.maxLength = 2500;
  input.value = settings[verse.key]?.note || '';
  input.placeholder = tr('notePlaceholder');
  input.setAttribute('aria-label', tr('noteAria'));
  show(tr('noteTitle', { ref: ref(verse) }), [input, row(tr('saveNote'), () => {
    dialog.close();
    const noteText = input.value.trim();
    updateVerse(verse, { note: noteText });
    trackEvent('sba_verse_note_saved', { verse_key: verse.key, has_note: Boolean(noteText) });
    notify(tr('noteSavedToast'));
  })]);
  input.focus();
}

function askAiQuestion(verse) {
  return tr('askAiPrompt', { quote: verseQuote(verse) });
}

function askAiUrl(verse) {
  const url = withSbaContext(site('/ai/aplikacja'), verse);
  url.searchParams.set('q', askAiQuestion(verse));
  url.searchParams.set('mode', 'Studium Biblijne');
  return url;
}

function openVerseMenu(verse) {
  const saved = settings[verse.key];
  const recording = officialTrack(recordings, verse);
  const askLink = link(tr('askAiRow'), askAiUrl(verse));
  askLink.addEventListener('click', () => {
    dialog.close();
    trackEvent('sba_ai_ask_open', { verse_key: verse.key, book: verse.book, chapter: verse.chapter });
    navigator.clipboard?.writeText(askAiQuestion(verse)).catch(() => {});
  });
  show(ref(verse), [
    row(saved?.marked ? tr('removeHighlight') : tr('highlightVerse'), () => {
      dialog.close();
      const marked = !saved?.marked;
      updateVerse(verse, { marked });
      trackEvent('sba_verse_highlight', { verse_key: verse.key, marked });
    }),
    row(saved?.saved ? tr('removeFavVerse') : tr('addFavVerse'), () => { dialog.close(); toggleFavorite(verse); }),
    row(tr('shareVerse'), () => { dialog.close(); void share(verse); }),
    row(tr('copyVerse'), () => {
      dialog.close();
      trackEvent('sba_verse_copy', { verse_key: verse.key, book: verse.book, chapter: verse.chapter });
      void copy(verseQuote(verse));
    }),
    row(tr('readContext'), () => showContext(verse)),
    link(tr('openMojaBiblia'), mojaBiblia(verse)),
    row(tr('readVoice'), () => { dialog.close(); startVoice(verse); }),
    ...(recording ? [row(tr('playRecording'), () => {
      dialog.close();
      void startMedia(recording);
    })] : []),
    row(saved?.note ? tr('editNote') : tr('addNote'), () => showNote(verse)),
    link(tr('searchInCc'), ccSearchUrl(verse, '/szukaj')),
    link(tr('openCcSearch'), ccSearchUrl(verse, '/wyszukiwarka')),
    askLink
  ]);
  trackEvent('sba_verse_menu_open', { verse_key: verse.key });
}

$('#saved-verses').addEventListener('click', () => {
  const saved = bible ? Object.keys(settings).filter((key) => settings[key]?.saved && bible.byKey.has(key)) : [];
  show(tr('savedVerses'), saved.length ? saved.map((key) => {
    const verse = bible.byKey.get(key);
    return row(ref(verse) + ' · ' + verse.text, () => {
      dialog.close();
      const existing = cards.findIndex((entry) => entry.verse.key === key);
      if (existing >= 0) goTo(existing, true);
      else {
        const index = cards.length;
        addCards(4, verse);
        goTo(index, true);
      }
    });
  }) : [element('p', '', tr('emptyFavorites'))]);
});

const hasSpeech = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
const canSpeakPolish = () => hasSpeech && (!speechSynthesis.getVoices().length || speechSynthesis.getVoices().some((voice) => /^pl(?:-|_|$)/i.test(voice.lang)));
const isPlaying = () => Boolean(speech) || (!audio.paused && !audio.ended);
const formatTime = (time) => Math.floor(time / 60) + ':' + String(Math.floor(time % 60)).padStart(2, '0');

function stopPlayback() {
  playingTrack = null;
  if (speech) {
    speech = null;
    speechSynthesis.cancel();
  }
  if (audio.hasAttribute('src')) {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  }
}

function trackFor(verse, mode = audioMode) {
  if (!verse) return null;
  if (mode === 'automatic') {
    const recording = officialTrack(recordings, verse);
    if (recording) return recording;
  }
  return canSpeakPolish() ? { type: 'voice', verse } : null;
}

function updatePlayer() {
  const track = playingTrack || trackFor(selected());
  const recorded = track?.type === 'recording';
  const radio = track?.type === 'radio';
  const live = isPlaying();
  let title = tr('audioTitle');
  if (recorded) title = chapterRef(track.verse);
  if (radio) title = track.title;
  if (track?.type === 'voice') title = tr('readingVerse');
  let detail = tr('noAudioDetail');
  if (!bible || (!track && recordingsState === 'loading')) detail = tr('loadingCatalog');
  else if (recorded) detail = track.range ? tr('recordingRange', { range: track.range }) : tr('recordingChapter');
  else if (radio) detail = tr('radioLive', { state: live ? tr('radioConnected') : tr('radioPaused') });
  else if (track) detail = (recordingsState === 'failed' ? tr('catalogUnavailable') : '') + tr('deviceVoiceDetail');
  if (track?.verse && live && track.verse.key !== selected()?.key) detail += tr('previousFragment');
  $('#track-title').textContent = title;
  $('#track-detail').textContent = playerError || detail;
  playButton.disabled = !track;
  $('#audio-options').disabled = !selected();
  playButton.setAttribute('aria-label', live ? (speech ? tr('stopReading') : tr('pauseTrack')) : tr('playTrack'));
  icon(playButton, live ? 'pause' : 'play');
  $('#progress').hidden = !recorded;
  const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
  seek.disabled = !recorded || !duration;
  seek.max = duration || 1;
  seek.value = audio.currentTime || 0;
  $('#elapsed').textContent = formatTime(audio.currentTime || 0);
  $('#duration').textContent = formatTime(duration);
  const radioPlaying = Boolean(radio && live);
  const playerEl = $('.player');
  if (playerEl) playerEl.classList.toggle('is-radio-playing', radioPlaying);
  const radioEq = $('#radio-eq');
  if (radioEq) radioEq.hidden = !radioPlaying;
}

function startVoice(verse) {
  if (!canSpeakPolish()) {
    notify(tr('noPolishVoice'));
    return;
  }
  stopPlayback();
  playerError = '';
  playingTrack = { type: 'voice', verse };
  const utterance = new SpeechSynthesisUtterance(verse.text);
  utterance.lang = 'pl-PL';
  const polishVoice = speechSynthesis.getVoices().find((voice) => /^pl(?:-|_|$)/i.test(voice.lang));
  if (polishVoice) utterance.voice = polishVoice;
  utterance.rate = .91;
  const finished = (error = false) => {
    if (speech !== utterance) return;
    speech = null;
    playingTrack = null;
    if (error) playerError = tr('voiceError');
    updatePlayer();
  };
  utterance.onend = () => finished();
  utterance.onerror = () => finished(true);
  speech = utterance;
  speechSynthesis.speak(utterance);
  trackEvent('sba_voice_play', { verse_key: verse.key, book: verse.book, chapter: verse.chapter });
  updatePlayer();
}

async function startMedia(track) {
  playerError = '';
  if (audio.getAttribute('src') !== track.url) {
    stopPlayback();
    audio.src = track.url;
  }
  playingTrack = track;
  updatePlayer();
  try {
    await audio.play();
  } catch (error) {
    if (error.name === 'AbortError' || playingTrack !== track) return;
    stopPlayback();
    playerError = track.type === 'radio' ? tr('radioConnectError') : tr('recordingPlayError');
  }
  updatePlayer();
}

playButton.addEventListener('click', () => {
  if (speech) stopPlayback();
  else if (isPlaying()) {
    audio.pause();
    if (playingTrack?.type !== 'radio' && playingTrack?.verse.key !== selected()?.key) stopPlayback();
  } else {
    const track = playingTrack || trackFor(selected());
    if (track?.type === 'voice') startVoice(track.verse);
    if (track?.type === 'recording' || track?.type === 'radio') void startMedia(track);
  }
  updatePlayer();
});
seek.addEventListener('input', () => { if (!seek.disabled) audio.currentTime = Number(seek.value); });
for (const event of ['play', 'pause', 'timeupdate', 'durationchange', 'loadedmetadata']) audio.addEventListener(event, updatePlayer);
audio.addEventListener('ended', () => {
  if (playingTrack?.type !== 'radio' && playingTrack?.verse.key !== selected()?.key) stopPlayback();
  updatePlayer();
});
audio.addEventListener('error', () => {
  if (!audio.hasAttribute('src')) return;
  const failedTrack = playingTrack;
  stopPlayback();
  if (failedTrack?.type === 'radio') playingTrack = failedTrack;
  playerError = failedTrack?.type === 'radio' ? tr('radioTempUnavailable') : tr('recordingTempUnavailable');
  updatePlayer();
});
if (hasSpeech) speechSynthesis.addEventListener('voiceschanged', updatePlayer);

function setAudioMode(mode) {
  audioMode = mode;
  saveLocal('cc-biblia-ubg-audio-v1', mode);
  stopPlayback();
  playerError = '';
  trackEvent('sba_audio_mode', { audio_mode: mode });
  updatePlayer();
  dialog.close();
}
$('#audio-options').addEventListener('click', () => {
  show(tr('audioTitle'), [
    row((playingTrack?.type !== 'radio' && audioMode === 'automatic' ? '✓  ' : '') + tr('audioModeAuto'), () => setAudioMode('automatic')),
    row((playingTrack?.type !== 'radio' && audioMode === 'voice' ? '✓  ' : '') + tr('audioModeVoice'), () => setAudioMode('voice')),
    link(tr('openAudioCatalog'), withSbaContext(site('/biblia-audio'), selected())),
    element('h3', '', tr('liveRadioHeading')),
    ...stations.map((station) => row((playingTrack === station ? '✓  ' : '') + station.title, () => {
      dialog.close();
      trackEvent('sba_radio_select', { station_title: station.title, stream_url: station.url });
      void startMedia(station);
    }))
  ]);
});

const pageStar = $('#ccTopBarFavBtn');
const pageFavoriteKey = 'cc-biblia-ubg-app-favorite-v1';
function paintLocalPageStar() {
  const saved = readLocal(pageFavoriteKey) === true;
  pageStar.setAttribute('aria-pressed', String(saved));
  const label = saved ? tr('appFavRemove') : tr('appFavAdd');
  pageStar.setAttribute('aria-label', label);
  pageStar.title = label;
}
paintLocalPageStar();
pageStar.addEventListener('click', () => {
  if (window.CCFavorites) return;
  const saved = readLocal(pageFavoriteKey) === true;
  saveLocal(pageFavoriteKey, !saved);
  paintLocalPageStar();
});

$('#chat').addEventListener('click', (event) => {
  trackEvent('sba_lumimes_open', { mode: window.CCUnifiedChat?.open ? 'widget' : 'link' });
  document.getElementById('ccChatTeaserClose')?.click();
  if (!window.CCUnifiedChat?.open) return;
  event.preventDefault();
  window.CCUnifiedChat.open({ tab: 'public' });
});

document.addEventListener('click', (event) => {
  const anchor = event.target?.closest?.('.cc-auth-dropdown a[href="/wyszukiwarka"], .cc-auth-dropdown a[href="/ai/aplikacja"]');
  if (!anchor) return;
  try {
    const rawHref = anchor.getAttribute('href');
    const contextual = withSbaContext(new URL(rawHref, location.origin), selected());
    anchor.href = contextual.pathname + contextual.search;
  } catch {
    /* keep static href if URL construction fails */
  }
});
function closeEdgePanelIfOpen() {
  const drawer = $('#cc-mobile-edge-dialog');
  if (drawer?.open) {
    if (typeof drawer._ccClose === 'function') drawer._ccClose();
    else drawer.close();
  }
  if (dialog.open && dialog.classList.contains('sba-edge-panel')) {
    dialog.close();
  }
}

function resetFeedForScope() {
  if (!bible) return;
  const current = selected();
  const keepCurrent = verseMatchesScope(current);
  shuffleVerses();
  feed.replaceChildren();
  cards = [];
  active = -1;
  addCards(1);
  addCards(15, keepCurrent ? current : null);
  layout();
  goTo(1, true);
}

function setTestamentScope(nextScope) {
  const normalized = normalizeScope(nextScope);
  if (normalized === testamentScope) return;
  testamentScope = normalized;
  saveLocal(SCOPE_STORAGE_KEY, testamentScope);
  trackEvent('sba_scope_change', { scope: testamentScope });
  resetFeedForScope();
  notify(tr('scopeSavedToast', { scope: tr('scope_' + testamentScope) }));
}

function openSettingsDialog() {
  const section = element('div', 'sba-settings-section');

  section.append(element('h3', 'sba-settings-heading', tr('settingsScopeHeading')));
  const scopeGroup = element('div', 'sba-scope-group');
  scopeGroup.setAttribute('role', 'group');
  scopeGroup.setAttribute('aria-label', tr('settingsScopeHeading'));
  const syncScopeButtons = () => {
    scopeGroup.querySelectorAll('.sba-scope-btn').forEach((btn) => {
      const isSelected = btn.dataset.scopeId === testamentScope;
      btn.setAttribute('aria-pressed', String(isSelected));
      const check = btn.querySelector('.sba-scope-check');
      if (check) check.textContent = isSelected ? '✓' : '';
    });
  };
  for (const scopeId of ['all', 'ot', 'nt']) {
    const scopeBtn = element('button', 'sba-scope-btn');
    scopeBtn.dataset.scopeId = scopeId;
    const check = element('span', 'sba-scope-check');
    check.setAttribute('aria-hidden', 'true');
    scopeBtn.append(element('span', '', tr('scope_' + scopeId)), check);
    scopeBtn.addEventListener('click', () => {
      setTestamentScope(scopeId);
      syncScopeButtons();
    });
    scopeGroup.append(scopeBtn);
  }
  syncScopeButtons();
  section.append(scopeGroup);

  section.append(element('h3', 'sba-settings-heading', tr('settingsBgHeading')));

  const grid = element('div', 'sba-theme-grid');
  grid.setAttribute('role', 'group');
  grid.setAttribute('aria-label', tr('settingsBgHeading'));

  const syncControls = (hexInput, hexBadge) => {
    grid.querySelectorAll('.sba-theme-swatch').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.themeId === themePref.id));
    });
    const activePreset = READER_THEMES.find((t) => t.id === themePref.id);
    const activeHex = themePref.id === 'custom' ? themePref.customHex : (activePreset?.tokens.bg || '#ffffff');
    hexInput.value = activeHex;
    hexBadge.textContent = activeHex.toUpperCase();
  };

  const customRow = element('label', 'sba-custom-color-row');
  const picker = document.createElement('input');
  picker.type = 'color';
  picker.id = 'sba-custom-bg';
  picker.className = 'sba-color-input';
  picker.setAttribute('aria-label', tr('settingsCustomLabel'));
  const customLabel = element('span', 'sba-color-label', tr('settingsCustomLabel'));
  const hexBadge = element('span', 'sba-color-hex');
  customRow.append(picker, customLabel, hexBadge);

  for (const theme of READER_THEMES) {
    const btn = element('button', 'sba-theme-swatch');
    btn.dataset.themeId = theme.id;
    const dot = element('span', 'sba-swatch-dot');
    dot.style.background = theme.tokens.bg;
    btn.append(dot, element('span', '', tr(theme.labelKey)));
    btn.addEventListener('click', () => {
      setReaderTheme({ id: theme.id, customHex: themePref.customHex }, { save: true, toast: true });
      syncControls(picker, hexBadge);
    });
    grid.append(btn);
  }

  picker.addEventListener('input', () => {
    applyReaderTheme({ id: 'custom', customHex: picker.value });
    saveLocal(THEME_STORAGE_KEY, themePref);
    syncControls(picker, hexBadge);
  });
  picker.addEventListener('change', () => {
    setReaderTheme({ id: 'custom', customHex: picker.value }, { save: true, toast: true });
    syncControls(picker, hexBadge);
  });

  const resetBtn = element('button', 'menu-row sba-settings-reset', tr('settingsReset'));
  resetBtn.addEventListener('click', () => {
    setReaderTheme({ id: 'white', customHex: themePref.customHex }, { save: true, toast: true });
    syncControls(picker, hexBadge);
  });

  syncControls(picker, hexBadge);
  section.append(grid, customRow, resetBtn);
  if (currentLocale !== 'pl') {
    section.append(element('p', 'sba-settings-note', tr('settingsScriptureNote')));
  }
  show(tr('settingsTitle'), [section], { view: 'settings' });
  trackEvent('sba_settings_open');
}

window.CCAppSettings = { open: openSettingsDialog };

function syncEdgeChannelsLocale(root) {
  const container = root?.querySelector('.sba-edge-channels');
  if (!container) return;
  container.setAttribute('aria-label', tr('ytAria'));
  const settingsLabel = container.querySelector('[data-sba-settings-label]');
  if (settingsLabel) settingsLabel.textContent = tr('settingsBtn');
}

function edgeChannelLinks() {
  const group = element('section', 'sba-edge-channels');
  group.setAttribute('aria-label', tr('ytAria'));

  const settingsBtn = element('button', 'menu-row sba-edge-settings-btn');
  settingsBtn.dataset.sbaEdgeSettings = 'true';
  const iconWrap = element('span');
  iconWrap.setAttribute('aria-hidden', 'true');
  icon(iconWrap, 'settings');
  const labelSpan = element('span', '', tr('settingsBtn'));
  labelSpan.dataset.sbaSettingsLabel = 'true';
  settingsBtn.append(iconWrap, labelSpan);
  settingsBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    closeEdgePanelIfOpen();
    openSettingsDialog();
  });

  group.append(
    settingsBtn,
    element('h3', 'sba-edge-label', 'YouTube'),
    link('Osobowość PLUS', 'https://www.youtube.com/@osobowo%C5%9B%C4%87PLUS'),
    link('Christian Culture TV', 'https://www.youtube.com/@ChristianCultureTV'),
    link('Polskie Radio Christian Culture', 'https://www.youtube.com/@RadioChristianCulture')
  );
  const support = link('wspieramTO', site('/wspieramto'));
  support.classList.add('sba-edge-support');
  support.addEventListener('click', () => {
    closeEdgePanelIfOpen();
  });
  group.append(support);
  return group;
}

$('#edge').addEventListener('click', () => {
  const usingDrawer = Boolean(window.CCEdgePlus?.open && window.CCMobileEdge);
  trackEvent('sba_panel_open', { panel: usingDrawer ? 'cc_edge_drawer' : 'fallback_dialog' });
  if (usingDrawer) {
    window.CCEdgePlus.open();
    const panel = $('#cc-mobile-edge-dialog');
    const navigation = panel?.querySelector('nav');
    if (panel?.open && navigation) {
      panel.classList.add('sba-edge-panel');
      if (!navigation.querySelector('.sba-edge-channels')) {
        const channels = edgeChannelLinks();
        const langDivider = navigation.querySelector('.cc-edge-lang-divider');
        if (langDivider) langDivider.before(channels);
        else navigation.append(channels);
      } else {
        syncEdgeChannelsLocale(navigation);
      }
      const closeBtn = navigation.querySelector('button[data-edge-key="close"]');
      const langGroup = navigation.querySelector('.cc-edge-lang-group');
      if (closeBtn && langGroup && !navigation.querySelector('.sba-edge-footer-bar')) {
        const footerBar = element('div', 'sba-edge-footer-bar');
        footerBar.append(langGroup, closeBtn);
        navigation.append(footerBar);
      }
      const supportHeart = navigation.querySelector('[data-edge-key="heart"]');
      if (supportHeart && !supportHeart.dataset.sbaCloseBound) {
        supportHeart.dataset.sbaCloseBound = '1';
        supportHeart.addEventListener('click', () => closeEdgePanelIfOpen());
      }
      return;
    }
  }
  const footerBar = element('div', 'sba-edge-footer-bar');
  const langBar = element('div', 'sba-edge-lang-fallback cc-edge-lang-group');
  langBar.setAttribute('role', 'group');
  langBar.setAttribute('aria-label', tr('langGroupAria'));
  for (const code of ['pl', 'en', 'de']) {
    const btn = element('button', code === currentLocale ? 'is-active' : '', code.toUpperCase());
    btn.dataset.ekoccLangChoice = code;
    btn.setAttribute('aria-pressed', String(code === currentLocale));
    btn.addEventListener('click', () => {
      setLocale(code, 'global');
      langBar.querySelectorAll('button').forEach((b) => {
        const activeBtn = b.dataset.ekoccLangChoice === code;
        b.classList.toggle('is-active', activeBtn);
        b.setAttribute('aria-pressed', String(activeBtn));
      });
    });
    langBar.append(btn);
  }
  const closeFallbackBtn = iconButton('close', tr('close'), () => dialog.close());
  closeFallbackBtn.className = 'sba-edge-close-fallback';
  closeFallbackBtn.dataset.edgeKey = 'close';
  footerBar.append(langBar, closeFallbackBtn);
  show(tr('panelFallbackTitle'), [
    link('Wyszukiwarka Christian Culture', ccSearchUrl(selected(), '/wyszukiwarka')),
    link('MojaBiblia', selected() ? mojaBiblia(selected()) : withSbaContext(site('/mojabiblia?book=JHN&ch=1&chapter=1&mode=reader'))),
    link('AI dla Jezusa', selected() ? askAiUrl(selected()) : withSbaContext(site('/ai/aplikacja'))),
    link('Biblia Audio', withSbaContext(site('/biblia-audio'), selected())),
    link('LumiMes', site('/mess')),
    edgeChannelLinks(),
    footerBar
  ], { edge: true });
});

function applyAppLocale() {
  document.documentElement.lang = currentLocale;
  document.title = tr('pageTitle');
  const brandTitle = $('.brand strong');
  if (brandTitle) brandTitle.textContent = tr('brandTitle');
  const brandSub = $('.brand small');
  if (brandSub) brandSub.textContent = tr('brandSubtitle');
  const topActions = $('.top-actions');
  if (topActions) topActions.setAttribute('aria-label', tr('topActionsAria'));
  const savedBtn = $('#saved-verses');
  if (savedBtn) {
    savedBtn.setAttribute('aria-label', tr('savedVerses'));
    savedBtn.title = tr('savedVerses');
  }
  paintLocalPageStar();
  const loginLink = $('.login');
  if (loginLink) {
    loginLink.setAttribute('aria-label', tr('loginGoogle'));
    loginLink.title = tr('loginGoogle');
  }
  const readerEl = $('.reader');
  if (readerEl) readerEl.setAttribute('aria-label', tr('readerAria'));
  const loadingMsg = $('#loading-message');
  if (loadingMsg && !$('#reader-status')?.hidden) {
    const retryHidden = $('#retry')?.hidden !== false;
    loadingMsg.textContent = retryHidden ? tr('loadingVerses') : tr('loadingFailed');
  }
  const retryBtn = $('#retry');
  if (retryBtn) retryBtn.textContent = tr('retry');
  feed.setAttribute('aria-label', tr('versesAria'));
  const prevBtn = $('#previous');
  if (prevBtn) {
    prevBtn.setAttribute('aria-label', tr('prevVerse'));
    prevBtn.title = tr('prevVerse');
  }
  const nextBtn = $('#next');
  if (nextBtn) {
    nextBtn.setAttribute('aria-label', tr('nextVerse'));
    nextBtn.title = tr('nextVerse');
  }
  const gestureEl = $('.gesture');
  if (gestureEl) gestureEl.textContent = tr('gestureHint');
  const edgeBtn = $('#edge');
  if (edgeBtn) {
    edgeBtn.setAttribute('aria-label', tr('edgeOpen'));
    edgeBtn.title = tr('edgeTitle');
  }
  const chatLink = $('#chat');
  if (chatLink) {
    chatLink.setAttribute('aria-label', tr('chatOpen'));
    chatLink.title = 'LumiMes';
  }
  const playerSection = $('.player');
  if (playerSection) playerSection.setAttribute('aria-label', tr('playerAria'));
  const audioOptBtn = $('#audio-options');
  if (audioOptBtn) {
    audioOptBtn.setAttribute('aria-label', tr('audioOptionsAria'));
    audioOptBtn.title = tr('audioOptionsTitle');
  }
  seek.setAttribute('aria-label', tr('seekAria'));
  const badge = $('.radio-eq-badge');
  if (badge) badge.innerHTML = '<i class="radio-eq-dot"></i>' + tr('liveBadge');
  const closeBtn = $('#close');
  if (closeBtn) closeBtn.setAttribute('aria-label', tr('close'));

  const bannerTitle = $('#install-banner-title');
  if (bannerTitle) bannerTitle.textContent = tr('installTitle');
  const bannerDesc = $('#install-banner-desc');
  if (bannerDesc) bannerDesc.textContent = tr('installDesc');
  const bannerClose = $('#install-banner-close');
  if (bannerClose) {
    bannerClose.setAttribute('aria-label', tr('installCloseAria'));
    bannerClose.title = tr('close');
  }
  const bannerCta = $('#install-banner-cta');
  if (bannerCta) bannerCta.textContent = tr('installCta');
  const bannerLater = $('#install-banner-later');
  if (bannerLater) bannerLater.textContent = tr('installLater');
  const bannerDone = $('#install-banner-done');
  if (bannerDone) bannerDone.textContent = tr('installDone');
  const bannerSteps = $('#install-banner-steps');
  if (bannerSteps && $('#install-banner-help') && !$('#install-banner-help').hidden) {
    const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent || '');
    bannerSteps.textContent = tr(isIos ? 'installIosSteps' : 'installAndroidSteps');
  }

  for (const entry of cards) paintVerse(entry);
  const currentVerse = selected();
  if (currentVerse) $('#verse-announcement').textContent = ref(currentVerse) + '. ' + currentVerse.text;
  syncEdgeChannelsLocale($('#cc-mobile-edge-dialog'));
  updatePlayer();
  if (dialog.open && dialog.dataset.view === 'settings') openSettingsDialog();
}

document.addEventListener('ekocc:locale-changed', (event) => {
  const next = normalizeLocale(event?.detail?.locale) || normalizeLocale(window.EkoCCI18n?.getLocale?.()) || 'pl';
  if (next !== currentLocale) currentLocale = next;
  applyAppLocale();
});

function bootCommunity() {
  if (!inEcosystem) return;
  const scripts = [
    '/js/cc-global-auth.js?v=20261127_sba_menu1',
    '/js/cc-favorites.js?v=20261120_fav4',
    '/js/cc-mobile-edge.js?v=20261119_gold3',
    '/js/cc-edge-plus.js?v=20261110_edgep2',
    '/js/cc-chat-integration.js?v=20261120_prayer40dm',
    '/components/cc-global-chat-button.js?v=20261125_chat13',
    '/components/cc-wspieramto-modal.js?v=20261127_wt3'
  ];
  // Classic scripts execute in insertion order. CC modules resolve their own same-origin dependencies.
  for (const path of scripts) {
    const pathname = new URL(path, location.href).pathname;
    if ([...document.scripts].some((script) => script.src && new URL(script.src).pathname === pathname)) continue;
    const script = document.createElement('script');
    script.async = false;
    script.src = path;
    document.head.append(script);
  }
}

async function initBible() {
  const retry = $('#retry');
  retry.hidden = true;
  $('#loading-message').textContent = tr('loadingVerses');
  try {
    bible = await loadBible();
  } catch {
    $('#loading-message').textContent = tr('loadingFailed');
    retry.hidden = false;
    return;
  }
  shuffleVerses();
  const key = new URLSearchParams(location.hash.slice(1)).get('werset');
  const initial = bible.byKey.get(key) || draw();
  addCards(1);
  addCards(15, initial);
  $('#reader-status').hidden = true;
  feed.hidden = false;
  $('.reader-controls').hidden = false;
  $('.gesture').hidden = false;
  layout();
  goTo(1, true);
  requestAnimationFrame(() => feed.classList.add('is-ready'));
  scheduleInstallBanner();
}

const INSTALL_DONE_KEY = 'cc-sba-installed-v1';
const INSTALL_DAY_KEY = 'cc-sba-install-banner-day-v1';
let deferredInstallPrompt = null;
let installBannerTimer = 0;

function todayLocalKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isStandaloneInstalled() {
  try {
    if (localStorage.getItem(INSTALL_DONE_KEY) === '1' || readLocal(INSTALL_DONE_KEY) === true) return true;
  } catch {
    /* ignore storage block */
  }
  const standalone =
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    window.matchMedia?.('(display-mode: fullscreen)')?.matches ||
    window.matchMedia?.('(display-mode: minimal-ui)')?.matches ||
    window.navigator.standalone === true ||
    document.referrer.startsWith('android-app://');
  if (standalone) {
    try { localStorage.setItem(INSTALL_DONE_KEY, '1'); } catch {}
  }
  return Boolean(standalone);
}

function hideInstallBanner() {
  const banner = $('#install-banner');
  if (!banner) return;
  banner.classList.remove('is-visible');
  banner.hidden = true;
}

function markInstalled(method) {
  try { localStorage.setItem(INSTALL_DONE_KEY, '1'); } catch {}
  deferredInstallPrompt = null;
  clearTimeout(installBannerTimer);
  hideInstallBanner();
  trackEvent('sba_pwa_installed', { method });
  if (method !== 'standalone') notify(tr('installedToast'));
}

function initInstallBanner() {
  const banner = $('#install-banner');
  if (!banner) return;
  if ('serviceWorker' in navigator && (inEcosystem || location.protocol === 'https:')) {
    navigator.serviceWorker.register('/sba/sw.js', { scope: '/sba' }).catch(() => {});
  }
  if (isStandaloneInstalled()) {
    hideInstallBanner();
    return;
  }
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
  });
  window.addEventListener('appinstalled', () => markInstalled('event'));

  const cta = $('#install-banner-cta');
  const later = $('#install-banner-later');
  const closeBtn = $('#install-banner-close');
  const help = $('#install-banner-help');
  const steps = $('#install-banner-steps');
  const doneBtn = $('#install-banner-done');

  const dismissToday = () => {
    hideInstallBanner();
    trackEvent('sba_install_dismiss');
  };
  closeBtn?.addEventListener('click', dismissToday);
  later?.addEventListener('click', dismissToday);
  doneBtn?.addEventListener('click', () => markInstalled('manual'));

  cta?.addEventListener('click', async () => {
    trackEvent('sba_install_click', { has_prompt: Boolean(deferredInstallPrompt) });
    if (deferredInstallPrompt) {
      const promptEvent = deferredInstallPrompt;
      deferredInstallPrompt = null;
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice?.outcome === 'accepted') {
          markInstalled('prompt');
          return;
        }
        dismissToday();
        return;
      } catch {
        /* fallback to instructions below */
      }
    }
    const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent || '');
    if (steps) {
      steps.textContent = tr(isIos ? 'installIosSteps' : 'installAndroidSteps');
    }
    if (help) help.hidden = false;
  });
}

function scheduleInstallBanner() {
  const banner = $('#install-banner');
  if (!banner || isStandaloneInstalled()) return;
  const today = todayLocalKey();
  try {
    if (localStorage.getItem(INSTALL_DAY_KEY) === today) return;
  } catch {
    return;
  }
  clearTimeout(installBannerTimer);
  installBannerTimer = setTimeout(() => {
    if (isStandaloneInstalled()) return;
    try { localStorage.setItem(INSTALL_DAY_KEY, today); } catch {}
    banner.hidden = false;
    requestAnimationFrame(() => banner.classList.add('is-visible'));
    trackEvent('sba_install_banner_shown');
  }, 700);
}

applyReaderTheme(loadThemePref());
applyAppLocale();
initInstallBanner();
$('#retry').addEventListener('click', initBible);
window.addEventListener('hashchange', () => {
  const verse = bible?.byKey.get(new URLSearchParams(location.hash.slice(1)).get('werset'));
  if (!verse || verse.key === selected()?.key) return;
  const existing = cards.findIndex((entry) => entry.verse.key === verse.key);
  if (existing >= 0) goTo(existing, true);
  else {
    const index = cards.length;
    addCards(4, verse);
    goTo(index, true);
  }
});
bootCommunity();
void initBible();
loadRecordings().then((result) => {
  recordings = result;
  recordingsState = 'loaded';
  updatePlayer();
}).catch(() => {
  recordingsState = 'failed';
  updatePlayer();
});
