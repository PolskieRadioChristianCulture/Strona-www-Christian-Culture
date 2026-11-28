// =========================================================================
// CHRISTIAN CULTURE — CC CONNECT 2.0 PLUGIN REGISTRY
// Standard: Sola Scriptura • ZERO COST FIRST • Szyfrowana tożsamość
// Specyfikacja: CC_Connect_2_0_Antigravity.md (Dyrektywa P1 / Wersja 2.0)
// =========================================================================

export const CC_PLUGIN_REGISTRY = Object.freeze([
  {
    id: 'scroll-bible',
    version: '2.0.0',
    name: 'Scrolluj Biblię',
    shortName: 'SBA',
    description: 'Współczesny czytnik Pisma Świętego w przekładzie UBG z Głębokim Studium (8 etapów studium, brama modlitwy, Wielka Szóstka i mapy myśli).',
    category: 'Pismo Święte',
    route: '/sba',
    deepStudyRoute: '/sba/studium/',
    icon: '📖',
    lumimes: true,
    contextTypes: ['bible-verse', 'bible-passage'],
    tools: [
      { name: 'cc_bible_get_verse', scope: 'bible:read', mode: 'read', description: 'Pobiera werset z UBG na podstawie referencji (np. J 3:16).' },
      { name: 'cc_bible_get_chapter', scope: 'bible:read', mode: 'read', description: 'Pobiera pełny rozdział UBG z nagłówkami i wersetami.' },
      { name: 'cc_bible_get_context', scope: 'bible:read', mode: 'read', description: 'Zwraca kontekst bliski (jednostka literacka) i szeroki dla wersetu.' },
      { name: 'cc_sba_deep_study', scope: 'bible:study', mode: 'read', description: 'Generuje link i konspekt 8 etapów Głębokiego Studium dla wersetu.' }
    ],
    scopes: ['bible:read', 'bible:study'],
    availability: 'ready',
    cost: 'free',
    defaultConnected: true
  },
  {
    id: 'mojabiblia',
    version: '2.0.0',
    name: 'MojaBiblia Interlinear',
    shortName: 'MojaBiblia',
    description: 'Interlinearny tekst Pisma Świętego z numerami Stronga, językiem greckim/hebrajskim i porównywarką przekładów UBG/BW/BT.',
    category: 'Pismo Święte',
    route: '/mojabiblia',
    icon: '📜',
    lumimes: true,
    contextTypes: ['bible-verse'],
    tools: [
      { name: 'cc_bible_interlinear', scope: 'bible:interlinear', mode: 'read', description: 'Zwraca morfologię, kody Stronga i tekst oryginalny.' },
      { name: 'cc_bible_search', scope: 'bible:read', mode: 'read', description: 'Przeszukuje Pismo Święte wg słów kluczowych lub Stronga.' }
    ],
    scopes: ['bible:read', 'bible:interlinear'],
    availability: 'ready',
    cost: 'free',
    defaultConnected: true
  },
  {
    id: 'biblia-audio',
    version: '2.0.0',
    name: 'Biblia Audio CC',
    shortName: 'Biblia Audio',
    description: 'Oficjalne słuchowiska biblijne MP3 w 320 kbps (Księga Rodzaju, Ewangelie, Psalmy) z synchronizacją tekstu.',
    category: 'Audio i Słowo',
    route: '/biblia-audio/',
    icon: '🎧',
    lumimes: true,
    contextTypes: ['audio-chapter'],
    tools: [
      { name: 'cc_find_audio_bible', scope: 'audio:read', mode: 'read', description: 'Wyszukuje nagrania audio rozdziałów i wersetów biblijnych.' }
    ],
    scopes: ['audio:read'],
    availability: 'ready',
    cost: 'free',
    defaultConnected: true
  },
  {
    id: 'cc-search',
    version: '2.0.0',
    name: 'Wyszukiwarka Ekosystemu (@w)',
    shortName: 'Wyszukiwarka',
    description: 'Uniwersalna wyszukiwarka zasobów Christian Culture przeszukująca cały cyfrowy świat misji od pierwszej litery.',
    category: 'Zasoby i Wiedza',
    route: '/wyszukiwarka',
    icon: '🔍',
    lumimes: true,
    contextTypes: ['resource'],
    tools: [
      { name: 'cc_search', scope: 'search:read', mode: 'read', description: 'Uniwersalne wyszukiwanie w artykułach, lekcjach, wersetach i audio.' }
    ],
    scopes: ['search:read'],
    availability: 'ready',
    cost: 'free',
    defaultConnected: true
  },
  {
    id: 'kazania',
    version: '2.0.0',
    name: 'Kazania z Pasją',
    shortName: 'Kazania',
    description: 'Baza kazań, wykładów biblijnych, konspektów i serii tematycznych (Apokalipsa, Uświęcenie, Proroctwa).',
    category: 'Nauczanie',
    route: '/kazania',
    icon: '🎙️',
    lumimes: true,
    contextTypes: ['sermon'],
    tools: [
      { name: 'cc_find_sermon', scope: 'sermons:read', mode: 'read', description: 'Wyszukuje kazania i konspekty wg tematu, mówcy lub wersetu.' }
    ],
    scopes: ['sermons:read'],
    availability: 'ready',
    cost: 'free',
    defaultConnected: true
  },
  {
    id: 'akademia',
    version: '2.0.0',
    name: 'Akademia Biblijna & Kurs Codzienny',
    shortName: 'Akademia',
    description: 'Codzienny kurs biblijny „Z Biblią za Pan Brat” oraz ustrukturyzowane lekcje uświęcenia i teologii.',
    category: 'Edukacja',
    route: '/akademia#kurscodzienny',
    icon: '🎓',
    lumimes: true,
    contextTypes: ['lesson'],
    tools: [
      { name: 'cc_get_daily_lesson', scope: 'courses:read', mode: 'read', description: 'Pobiera dzisiejszą lub wskazaną lekcję Kursu Codziennego.' }
    ],
    scopes: ['courses:read'],
    availability: 'ready',
    cost: 'free',
    defaultConnected: true
  },
  {
    id: 'biblioteka',
    version: '2.0.0',
    name: 'Biblioteka Pionierów CC',
    shortName: 'Biblioteka',
    description: 'Cyfrowa biblioteka historycznych dzieł reformacyjnych i adwentowych z czytnikiem PDF i metadanymi.',
    category: 'Zasoby i Wiedza',
    route: '/biblioteka-pionierow',
    icon: '📚',
    lumimes: true,
    contextTypes: ['book'],
    tools: [
      { name: 'cc_find_book', scope: 'library:read', mode: 'read', description: 'Wyszukuje książki, autorów i publikacje w Bibliotece Pionierów.' }
    ],
    scopes: ['library:read'],
    availability: 'ready',
    cost: 'free',
    defaultConnected: false
  },
  {
    id: 'kartki',
    version: '2.0.0',
    name: 'Kartki Chrześcijańskie CC',
    shortName: 'Kartki',
    description: 'Generowanie i wysyłanie kartek z wersetami biblijnymi, życzeniami pokoju i inspiracją w Chrystusie.',
    category: 'Inspiracja i Ewangelizacja',
    route: '/kartki/',
    icon: '💌',
    lumimes: true,
    contextTypes: ['card'],
    tools: [
      { name: 'cc_get_cards', scope: 'cards:read', mode: 'read', description: 'Katalog motywów i cytatów na kartkach chrześcijańskich.' }
    ],
    scopes: ['cards:read'],
    availability: 'ready',
    cost: 'free',
    defaultConnected: false
  },
  {
    id: 'radio',
    version: '2.0.0',
    name: 'Polskie Radio CC 24/7 & Player',
    shortName: 'Radio CC',
    description: 'Strumień radiowy 24/7, Biblia Śpiewana, muzyka uwielbienia i nocne słuchowiska biblijne w stylu Spotify.',
    category: 'Muzyka i Uwielbienie',
    route: '/player',
    icon: '📻',
    lumimes: true,
    contextTypes: ['radio-station'],
    tools: [
      { name: 'cc_get_radio_stations', scope: 'radio:read', mode: 'read', description: 'Zwraca listę kanałów radiowych, aktualną ramówkę i RDS.' }
    ],
    scopes: ['radio:read'],
    availability: 'ready',
    cost: 'free',
    defaultConnected: false
  },
  {
    id: 'ccn-news',
    version: '2.0.0',
    name: 'CCN News & Portale Tematyczne',
    shortName: 'CCN News',
    description: 'Wiadomości, publicystyka, portale tematyczne (Nauka, Historia, Biologia, Prawo) redagowane w prawdzie Bożej.',
    category: 'Wiadomości i Publicystyka',
    route: '/news',
    icon: '📰',
    lumimes: true,
    contextTypes: ['article'],
    tools: [
      { name: 'cc_get_news', scope: 'news:read', mode: 'read', description: 'Pobiera najnowsze artykuły z portali tematycznych CCN.' }
    ],
    scopes: ['news:read'],
    availability: 'ready',
    cost: 'free',
    defaultConnected: false
  },
  {
    id: '40dm',
    version: '2.0.0',
    name: '40 Dni Modlitwy & Zjednoczeni za Polskę',
    shortName: 'Modlitwa CC',
    description: 'Ściana modlitwy, codzienne rozważania modlitewne i wstawiennictwo za naród polski.',
    category: 'Modlitwa',
    route: '/modlitwa',
    icon: '🙏',
    lumimes: true,
    contextTypes: ['prayer-request'],
    tools: [
      { name: 'cc_get_prayers', scope: 'prayer:read', mode: 'read', description: 'Przegląd publicznych intencji modlitewnych i rozważań 40DM.' }
    ],
    scopes: ['prayer:read'],
    availability: 'ready',
    cost: 'free',
    defaultConnected: false
  },
  {
    id: 'wiadomosc-z-nieba',
    version: '2.0.0',
    name: 'Wiadomość z Nieba',
    shortName: 'WZN',
    description: 'Krótkie traktaty ewangelizacyjne, kluczowe prawdy wiary i osobiste wezwanie do pojednania z Bogiem.',
    category: 'Ewangelizacja',
    route: '/wiadomosci-z-nieba',
    icon: '🕊️',
    lumimes: true,
    contextTypes: ['gospel-tract'],
    tools: [
      { name: 'cc_get_wzn', scope: 'tracts:read', mode: 'read', description: 'Katalog traktatów i wersetów ewangelizacyjnych Wiadomości z Nieba.' }
    ],
    scopes: ['tracts:read'],
    availability: 'ready',
    cost: 'free',
    defaultConnected: false
  },
  {
    id: 'holos',
    version: '2.0.0',
    name: 'HOLOS 2027 (Life OS)',
    shortName: 'HOLOS',
    description: 'Osobisty plan uświęcenia, 5 sektorów życia, Tarcza Szabatu i biblijny balans w Chrystusie.',
    category: 'Rozwój Osobisty',
    route: '/holos',
    icon: '🛡️',
    lumimes: true,
    contextTypes: ['life-goals'],
    tools: [
      { name: 'cc_holos_goals', scope: 'holos:read', mode: 'read', description: 'Pobiera cele, sektory uświęcenia i status Tarczy Szabatu.' }
    ],
    scopes: ['holos:read'],
    availability: 'ready',
    cost: 'free',
    defaultConnected: true
  }
]);

export const EXTERNAL_AI_PROVIDERS = Object.freeze([
  {
    id: 'chatgpt',
    name: 'ChatGPT / OpenAI',
    tagline: 'Custom MCP Client / GPTs Actions',
    icon: '🟢',
    protocol: 'Streamable MCP (JSON-RPC 2.0 / SSE)',
    endpoint: 'https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp',
    instructions: '1. Otwórz Ustawienia ChatGPT → Połączone aplikacje lub własne GPT.\n2. Wklej adres serwera MCP: https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp\n3. Wybierz autoryzację Anonymous (publiczny odczyt CC) lub Header Bearer z tokenem sesji.\n4. ChatGPT zyskuje natychmiastowy dostęp do narzędzi cc_search, cc_find_scripture i biblioteki CC.',
    zeroCostNotice: 'MCP udostępnia narzędzia Christian Culture w ChatGPT. Nie przenosi abonamentu ChatGPT Plus do wnętrza aplikacji CC.',
    docsUrl: 'https://developers.openai.com/'
  },
  {
    id: 'claude',
    name: 'Claude Desktop / Anthropic',
    tagline: 'Model Context Protocol Client',
    icon: '🟠',
    protocol: 'Streamable MCP (JSON-RPC 2.0 / SSE)',
    endpoint: 'https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp',
    instructions: '1. Otwórz plik konfiguracyjny claude_desktop_config.json.\n2. W sekcji "mcpServers" dodaj:\n   "christian-culture": {\n     "command": "npx",\n     "args": ["-y", "@modelcontextprotocol/server-fetch", "https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp"]\n   }\n3. Zrestartuj Claude Desktop. Claude zobaczy narzędzia CC w ikonie młotka.',
    zeroCostNotice: 'Darmowa integracja narzędzi CC z aplikacją Claude. Odpowiedzi generuje Twój własny klient Claude.',
    docsUrl: 'https://modelcontextprotocol.io/'
  },
  {
    id: 'ollama',
    name: 'Ollama (Lokalny AI)',
    tagline: 'Prywatny lokalny model na Twoim komputerze',
    icon: '🦙',
    protocol: 'Lokalny adapter HTTP (localhost)',
    endpoint: 'http://localhost:11434',
    instructions: '1. Zainstaluj Ollama na swoim komputerze (np. ollama run llama3).\n2. Skonfiguruj klienta MCP do odpytywania lokalnego serwera.\n3. Cała rozmowa odbywa się w 100% lokalnie i bezpłatnie na Twoim sprzęcie.',
    zeroCostNotice: '100% offline, zero opłat, całkowita prywatność danych.',
    docsUrl: 'https://ollama.com/'
  }
]);

const STORAGE_KEY = 'cc_connected_plugins_v1';

export function getAllPlugins() {
  return CC_PLUGIN_REGISTRY;
}

export function getPluginManifest(id) {
  if (!id) return null;
  const needle = String(id).trim().toLowerCase();
  return CC_PLUGIN_REGISTRY.find(p => p.id.toLowerCase() === needle) || null;
}

export function getDefaultConnectedPluginIds() {
  return CC_PLUGIN_REGISTRY.filter(p => p.defaultConnected).map(p => p.id);
}

export function sanitizePluginIds(ids) {
  if (!Array.isArray(ids)) return getDefaultConnectedPluginIds();
  const known = new Set(CC_PLUGIN_REGISTRY.map(p => p.id));
  const res = [];
  for (const item of ids) {
    const s = String(item || '').trim().toLowerCase();
    if (known.has(s) && !res.includes(s)) {
      res.push(s);
    }
  }
  return res.length > 0 ? res : getDefaultConnectedPluginIds();
}

export function getConnectedPluginIdsFromStorage() {
  if (typeof localStorage === 'undefined') return getDefaultConnectedPluginIds();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultConnectedPluginIds();
    const parsed = JSON.parse(raw);
    return sanitizePluginIds(parsed);
  } catch (_) {
    return getDefaultConnectedPluginIds();
  }
}

export function setConnectedPluginIdsToStorage(ids) {
  if (typeof localStorage === 'undefined') return;
  try {
    const sanitized = sanitizePluginIds(ids);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (_) {}
}

export function togglePluginConnection(pluginId, shouldConnect) {
  const current = getConnectedPluginIdsFromStorage();
  const targetId = String(pluginId || '').trim().toLowerCase();
  const set = new Set(current);
  if (shouldConnect) {
    set.add(targetId);
  } else {
    set.delete(targetId);
  }
  const updated = Array.from(set);
  setConnectedPluginIdsToStorage(updated);
  return updated;
}

export function isPluginConnected(pluginId, connectedIds) {
  const list = Array.isArray(connectedIds) ? connectedIds : getConnectedPluginIdsFromStorage();
  return list.includes(String(pluginId || '').trim().toLowerCase());
}
