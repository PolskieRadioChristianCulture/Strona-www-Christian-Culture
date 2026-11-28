// =========================================================================
// AI DLA JEZUSA — NARZĘDZIA AGENTA I ORKIESTRACJA EKOSYSTEMU CHRISTIAN CULTURE
// Realne połączenia z aplikacjami ekosystemu (HOLOS 2027, MojaBiblia,
// Biblia Audio, Akademia, Radio 24/7, LUMINA, Dobrze że jesteś, VOD, Modlitwa)
// oraz akcje zarządzania osobistą ścieżką użytkownika wprost z okna czatu.
// Standard: 100% uczciwości • ZERO COST FIRST • Sola Scriptura & Dekalog
// =========================================================================

export const CC_ECOSYSTEM_APPS = [
  {
    id: 'holos',
    name: 'HOLOS 2027',
    shortName: 'HOLOS',
    category: 'Rozwój i Life OS',
    tagline: 'System celów, wyzwań, 5 sektorów życia i Tarcza Szabatu',
    url: '/holos',
    liveBridge: 'holos_2027_state_v1',
    aliases: ['holos', 'cholos', 'hollos', 'holosie', 'holosa', 'holos 2027', 'life os', 'tarcza szabatu', 'kolo zycia', 'koło życia']
  },
  {
    id: 'mojabiblia',
    name: 'MojaBiblia Interlinear',
    shortName: 'MojaBiblia',
    category: 'Pismo Święte',
    tagline: 'Biblia UBG z oryginałem hebrajskim i greckim oraz kodami Stronga',
    url: '/mojabiblia',
    liveBridge: 'module:Biblia',
    aliases: ['mojabiblia', 'moja biblia', 'interlinear', 'strong', 'przeklad ubg', 'biblia interlinearna']
  },
  {
    id: 'biblia-audio',
    name: 'Biblia Audio CC',
    shortName: 'Biblia Audio',
    category: 'Audio i Słowo',
    tagline: 'Słuchowiska biblijne MP3 do codziennego karmienia się Słowem',
    url: '/biblia-audio/',
    liveBridge: 'media:biblia_audio',
    aliases: ['biblia audio', 'biblia-audio', 'sluchowisko', 'słuchowisko', 'sluchac biblii', 'słuchać biblii']
  },
  {
    id: 'akademia',
    name: 'Akademia & Kurs Codzienny',
    shortName: 'Akademia CC',
    category: 'Nauka i Uświęcenie',
    tagline: 'Codzienne lekcje „Z Biblią za Pan Brat” i kursy biblijne',
    url: '/akademia#kurscodzienny',
    liveBridge: 'portal:akademia',
    aliases: ['akademia', 'kurs codzienny', 'z biblia za pan brat', 'z biblią za pan brat', 'lekcja dnia']
  },
  {
    id: 'radio',
    name: 'Polskie Radio CC 24/7',
    shortName: 'Radio CC',
    category: 'Muzyka i Uwielbienie',
    tagline: 'Chrześcijańskie radio 24/7, Biblia Śpiewana i Player audio',
    url: '/player',
    liveBridge: 'media:radio',
    aliases: ['radio', 'polskieradio', 'player', 'odtwarzacz', 'biblia spiewana', 'biblia śpiewana', 'uwielbienie']
  },
  {
    id: 'lumina',
    name: 'LUMINA Społeczność',
    shortName: 'LUMINA',
    category: 'Wspólnota',
    tagline: 'Chrześcijański portal społecznościowy, profile i komunikator LUMI MESS',
    url: '/lumina',
    liveBridge: 'portal:lumina',
    aliases: ['lumina', 'lumi mess', 'spolecznosc', 'społeczność', 'tablica lumina']
  },
  {
    id: 'dobrze-ze-jestes',
    name: 'Dobrze, że jesteś',
    shortName: 'Rozważania',
    category: 'Codzienna Inspiracja',
    tagline: 'Poranne rozważania, pokój serca i motywacja w Chrystusie',
    url: '/rozwazania',
    liveBridge: 'portal:rozwazania',
    aliases: ['dobrze ze jestes', 'dobrze, że jesteś', 'rozwazania', 'rozważania', 'cuda kazdego dnia']
  },
  {
    id: 'vod',
    name: 'Kino Chrześcijańskie VOD',
    shortName: 'Kino VOD',
    category: 'Filmy i Wideo',
    tagline: 'Wartościowe chrześcijańskie filmy fabularne i seriale bez reklam',
    url: '/vod',
    liveBridge: 'portal:vod',
    aliases: ['vod', 'kino', 'filmy chrzescijanskie', 'filmy chrześcijańskie', 'cctv24']
  },
  {
    id: 'modlitwa',
    name: '40 Dni Modlitwy',
    shortName: 'Modlitwa CC',
    category: 'Modlitwa',
    tagline: 'Modlitwa wstawiennicza, Zjednoczeni za Polskę i intencje serca',
    url: '/modlitwa',
    liveBridge: 'portal:modlitwa',
    aliases: ['40 dni modlitwy', 'zjednoczeni za polske', 'zjednoczeni za polskę', 'sciana modlitwy', 'ściana modlitwy']
  }
];

export const SANCTIFICATION_HOLOS_PACK = [
  {
    packId: 'ai-morning-5-10',
    title: 'Poranne 5+10: Modlitwa i Słowo (UBG)',
    sector: 'faith',
    frequency: 'daily',
    targetPerWeek: 6,
    minutes: 15,
    verseRef: 'Prz 3,5–6 (UBG)',
    milestones: ['Pierwsze 7 poranków z Bogiem przed ekranem', '21 dni stałego rytmu modlitwy i Słowa', '90 dni codziennego chodzenia z Jezusem']
  },
  {
    packId: 'ai-bible-study',
    title: 'Codzienne Studium Biblii (MojaBiblia / Kurs)',
    sector: 'faith',
    frequency: 'daily',
    targetPerWeek: 6,
    minutes: 15,
    verseRef: 'Ps 119,105 (UBG)',
    milestones: ['Rozdział dziennie z notatką w AI dla Jezusa', 'Zapisane 10 ulubionych obietnic UBG', 'Przerobiony pierwszy pełny miesiąc Kursu Codziennego']
  },
  {
    packId: 'ai-sabbath-shield',
    title: 'Sabat Pana — Święty Odpoczynek (Sobota)',
    sector: 'faith',
    frequency: 'weekly',
    targetPerWeek: 1,
    minutes: 30,
    verseRef: 'Wj 20,8–11 (UBG)',
    milestones: ['Piątkowe przygotowanie przed zachodem słońca', '4 kolejne Soboty w pokoju bez pracy zawodowej', 'Wspólnota, natura i wdzięczność w Sabat']
  }
];

function foldPl(input = '') {
  return String(input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findMentionedEcosystemApps(rawMessage = '') {
  const folded = foldPl(rawMessage);
  if (!folded) return [];
  const matched = [];
  for (const app of CC_ECOSYSTEM_APPS) {
    const hit = app.aliases.some((al) => {
      const a = foldPl(al);
      if (!a) return false;
      const escaped = a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i').test(folded);
    });
    if (hit) matched.push(app);
  }
  return matched;
}

export function planWorkspaceActions(rawMessage = '', opts = {}) {
  const text = String(rawMessage || '').trim();
  const folded = foldPl(text);
  if (!folded) return [];

  const actions = [];
  const mentionedApps = findMentionedEcosystemApps(text);
  const connectedSet = new Set(Array.isArray(opts.connectedApps) ? opts.connectedApps : []);

  const wantsConnect =
    /(polacz|podlacz|polaczenie|integracj|aktywuj|uruchom|dodaj aplikacj|skontaktuj|mostek|sync|synchroniz|otworz)/.test(folded);
  const wantsHolos = mentionedApps.some((a) => a.id === 'holos');
  const wantsSanctificationPlan =
    /(plan uswiec|uswiecen|rozwoj osobist|rozwoju osobist|moja sciezk|wlasna sciezk|plan duchow|wyzwani|nawyk|plan na tydzien|plan tygodnia|rytm dnia|cel duchow|cele na)/.test(folded);
  const wantsEcosystemBuilder =
    /(wlasny ekosystem|moj ekosystem|moim ekosystem|zarzadz.*ekosystem|spersonalizuj.*ekosystem|personalizuj.*ekosystem|zbuduj.*ekosystem|skonfiguruj.*ekosystem|dobor aplikacji|dobierz aplikacje)/.test(folded);
  const wantsAboutMe =
    /(zakladk.*o mnie|otworz o mnie|zwracaj sie do mnie|mow do mnie|nazywam sie|jestem .* i chce abys wiedzial)/.test(folded);
  const wantsAboutYou =
    /(zakladk.*o tobie|otworz o tobie|zmien swoje zachowanie|jak masz sie zachowywac|twoje preferencje|ustaw ton|odpowiadaj krocej|odpowiadaj bardziej)/.test(folded);
  const wantsMemorySave =
    /(zapamietaj ze|zapamietaj,|zapisz w pamieci|dodaj do pamieci)/.test(folded);
  const wantsProjectSave =
    /(dodaj projekt|utworz projekt|stworz projekt|nowy projekt)/.test(folded);
  const wantsReminder =
    /(przypomnij mi|ustaw przypomnienie|dodaj przypomnienie)/.test(folded);

  // 1. Realne połączenie z aplikacjami ekosystemu (w tym HOLOS 2027 — nawet przy głosowym "Cholos")
  for (const app of mentionedApps.slice(0, 3)) {
    if (wantsConnect || app.id === 'holos' || wantsSanctificationPlan || wantsEcosystemBuilder) {
      const isHolos = app.id === 'holos';
      actions.push({
        id: `connect-${app.id}`,
        type: 'connect_app',
        appId: app.id,
        appName: app.name,
        category: app.category,
        tagline: app.tagline,
        url: app.url,
        liveBridge: app.liveBridge,
        alreadyConnected: connectedSet.has(app.id),
        autoConnect: Boolean(wantsConnect || isHolos),
        suggestedHolosGoals: isHolos && wantsSanctificationPlan ? SANCTIFICATION_HOLOS_PACK : (isHolos ? SANCTIFICATION_HOLOS_PACK.slice(0, 2) : []),
        suggestedProjectTitle: isHolos && wantsSanctificationPlan ? 'Plan uświęcenia i rozwoju osobistego (HOLOS)' : ''
      });
    }
  }

  // 2. Jeśli użytkownik prosi o plan uświęcenia / rozwoju osobistego bez nazwania HOLOS — zaproponuj realny plan HOLOS + Projekt
  if (wantsSanctificationPlan && !wantsHolos) {
    const holosApp = CC_ECOSYSTEM_APPS.find((a) => a.id === 'holos');
    actions.push({
      id: 'plan-holos-sanctification',
      type: 'holos_plan',
      appId: 'holos',
      appName: holosApp.name,
      url: holosApp.url,
      title: 'Plan uświęcenia i rozwoju osobistego (HOLOS 2027)',
      summary: 'Gotowy 3-filarowy rytm z Tarczą Szabatu, który możesz 1 kliknięciem wgrać bezpośrednio do swojej aplikacji HOLOS 2027 i do Projektów AI.',
      goals: SANCTIFICATION_HOLOS_PACK,
      suggestedProjectTitle: 'Plan uświęcenia i rozwoju osobistego'
    });
  }

  // 3. Kreator własnego ekosystemu Christian Culture w oknie czatu
  if (wantsEcosystemBuilder || (wantsConnect && !mentionedApps.length && /ekosystem|aplikacj|sciezk/.test(folded))) {
    const recommendedIds = ['holos', 'mojabiblia', 'biblia-audio', 'akademia', 'radio', 'dobrze-ze-jestes', 'lumina'];
    actions.push({
      id: 'ecosystem-builder',
      type: 'ecosystem_builder',
      title: 'Personalizacja Twojego Ekosystemu Christian Culture',
      summary: 'Zaznacz aplikacje Christian Culture, które mają tworzyć Twoją codzienną ścieżkę — połączę je w jednym miejscu i dopasuję sugestie.',
      recommendedIds,
      apps: CC_ECOSYSTEM_APPS.map((a) => ({
        id: a.id,
        name: a.name,
        shortName: a.shortName,
        category: a.category,
        tagline: a.tagline,
        url: a.url
      }))
    });
  }

  // 4. Bezpośrednia aktualizacja „O mnie” / „O tobie” z okna czatu
  if (wantsAboutMe) {
    const nameMatch = text.match(/(?:zwracaj\s+si[ęe]\s+do\s+mnie|m[óo]w\s+do\s+mnie|nazywam\s+si[ęe])\s*(?:[:,-]?\s*)(?:per\s+|jako\s+)?[„"']?([A-Za-zÀ-ž\s-]{2,40})[”"']?/i);
    const extractedName = nameMatch ? nameMatch[1].replace(/[.,!?;]+$/, '').trim().slice(0, 48) : '';
    const extractedAddress = /bracie|siostro/i.test(text) ? 'bracie_siostro' : (/panie|pani\b/i.test(text) ? 'pan_pani' : '');
    actions.push({
      id: 'update-about-me',
      type: 'personalization_shortcut',
      targetTab: 'O mnie',
      title: 'Zakładka „O mnie” — Twój profil i relacja z AI',
      summary: extractedName
        ? `Mogę od razu zapisać zwrot „${extractedName}” w zakładce „O mnie” i otworzyć pełne ustawienia naszej relacji.`
        : 'Otwórz zakładkę „O mnie”, aby ustawić jak mam się do Ciebie zwracać i jaka ma być nasza relacja.',
      patch: extractedName || extractedAddress ? { preferredName: extractedName, addressStyle: extractedAddress } : null
    });
  }

  if (wantsAboutYou) {
    const extractedLength = /kr[óo]c|zwi[ęe]z|kr[óo]tk/i.test(text) ? 'krotkie' : (/szczeg[óo][łl]|rozbud|g[łl][ęe]b/i.test(text) ? 'rozbudowane' : '');
    actions.push({
      id: 'update-about-you',
      type: 'personalization_shortcut',
      targetTab: 'O tobie',
      title: 'Zakładka „O tobie” — Preferencje zachowania agenta',
      summary: 'Dopasuj mój styl, długość wypowiedzi, sposób cytowania Biblii (UBG) i własne zasady działania.',
      patch: extractedLength ? { responseLength: extractedLength } : null
    });
  }

  // 5. Zapis do Pamięci lub Projektu bezpośrednio z czatu
  if (wantsMemorySave) {
    const memMatch = text.match(/(?:zapami[ęe]taj(?:\s+[żz]e)?|zapisz\s+w\s+pami[ęe]ci|dodaj\s+do\s+pami[ęe]ci)\s*[:,]?\s*(.+)$/i);
    const memText = (memMatch ? memMatch[1] : text).trim().slice(0, 200);
    if (memText.length >= 6) {
      actions.push({
        id: 'save-memory-item',
        type: 'save_memory',
        title: 'Zapisz w Pamięci kontekstowej AI',
        memoryText: memText
      });
    }
  }

  if (wantsProjectSave) {
    const projMatch = text.match(/(?:dodaj|utw[óo]rz|stw[óo]rz|nowy)\s+projekt\s*[:,]?\s*[„"']?([^„”"'\n.!?]{3,70})[”"']?/i);
    const projTitle = (projMatch ? projMatch[1] : 'Nowy projekt misyjny CC').trim().slice(0, 80);
    actions.push({
      id: 'save-project-item',
      type: 'save_project',
      title: `Nowy projekt: ${projTitle}`,
      projectTitle: projTitle
    });
  }

  if (wantsReminder) {
    actions.push({
      id: 'open-reminder-tool',
      type: 'open_reminder',
      title: 'Ustaw przypomnienie w aplikacji',
      summary: 'Zaplanuj dokładną godzinę i datę przypomnienia z powiadomieniem w aplikacji.'
    });
  }

  return actions.slice(0, 4);
}

export function buildWorkspaceToolsSystemPromptNote(workspaceActions = [], connectedApps = []) {
  const lines = [];
  if (Array.isArray(connectedApps) && connectedApps.length) {
    const names = connectedApps
      .map((id) => CC_ECOSYSTEM_APPS.find((a) => a.id === id)?.name || id)
      .slice(0, 10);
    lines.push(`AKTYWNY OSOBISTY EKOSYSTEM UŻYTKOWNIKA (połączone aplikacje CC): ${names.join(', ')}.`);
  }
  if (Array.isArray(workspaceActions) && workspaceActions.length) {
    const desc = workspaceActions.map((act) => {
      if (act.type === 'connect_app') {
        return `- [NARZĘDZIE AKTYWNE] Połączenie z aplikacją „${act.appName}” (${act.url}) zostało przygotowane i osadzone jako interaktywna karta akcji bezpośrednio pod Twoją odpowiedzią${act.suggestedHolosGoals?.length ? ' wraz z 1-klikowym wgraniem planu wyzwań do HOLOS 2027' : ''}.`;
      }
      if (act.type === 'holos_plan') {
        return `- [NARZĘDZIE AKTYWNE] Karta „${act.title}” z 3 gotowymi wyzwaniami HOLOS 2027 (z Tarczą Szabatu) jest osadzona bezpośrednio pod Twoją odpowiedzią — wskaż użytkownikowi, że może kliknąć przycisk pod odpowiedzią, aby natychmiast wgrać plan do HOLOS.`;
      }
      if (act.type === 'ecosystem_builder') {
        return '- [NARZĘDZIE AKTYWNE] Interaktywny Kreator Własnego Ekosystemu Christian Culture jest osadzony bezpośrednio pod Twoją odpowiedzią — użytkownik może jednym kliknięciem podłączyć wybrane aplikacje CC do swojej codziennej ścieżki.';
      }
      if (act.type === 'personalization_shortcut') {
        return `- [NARZĘDZIE AKTYWNE] Karta szybkiego zapisu i przejścia do zakładki „${act.targetTab}” jest osadzona bezpośrednio pod Twoją odpowiedzią.`;
      }
      return `- [NARZĘDZIE AKTYWNE] Karta akcji „${act.title}” jest gotowa pod Twoją odpowiedzią.`;
    });
    lines.push(
      'NARZĘDZIA EKOSYSTEMU DOSTĘPNE W CZASIE RZECZYWISTYM POD TĄ ODPOWIEDZIĄ (używaj ich świadomie i uczciwie — nie zmyślaj integracji spoza tej listy; jeśli użytkownik powiedział „Cholos”, chodzi o chrześcijańską aplikację Life OS „HOLOS 2027” z ekosystemu Christian Culture):\n' +
      desc.join('\n')
    );
  }
  return lines.join('\n\n');
}
