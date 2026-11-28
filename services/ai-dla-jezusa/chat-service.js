import { SHARED_MODEL, sharedAiReady, reserveSharedAiAttempt, readLimitedText } from './cost-guard.js';
// =========================================================================
// AI DLA JEZUSA — BACKEND KONWERSACYJNY + RAG + BYOK (ETAP 2B)
// Standard: Sola Scriptura • ZERO COST FIRST • Gemini / Groq / OpenRouter / Workers AI
// =========================================================================

import {
  getCanonicalDocuments,
  searchKnowledgeHub,
  findScripture,
  extractScriptureRefs
} from './knowledge-hub.js';
import {
  resolveAiAssistant,
  matchContextGuides,
  resolveEcosystemMedia,
  getAllEcosystemHubs
} from './ecosystem-media.js';
import {
  verifyOwnerFromRequest,
  PUBLIC_FREE_MODELS
} from './owner-workspace.js';
import {
  resolveMojaBibliaVerses,
  extractAllScriptureRefs
} from './mojabiblia-bridge.js';
import {
  CC_ECOSYSTEM_APPS,
  planWorkspaceActions,
  buildWorkspaceToolsSystemPromptNote
} from './workspace-tools.js';
import {
  ccBibleGetVerse,
  ccBibleGetChapter,
  ccBibleGetContext,
  ccSbaDeepStudy,
  ccFindSermon,
  ccFindAudioBible
} from './cc-domain-tools.js';
import {
  ccBibleLexiconLookup,
  ccBibleCrossReferences,
  ccBibleConcordance,
  ccBibleStudyQuestions
} from './scholar-tools.js';
import {
  sanitizePluginIds,
  isToolAllowedForSession
} from './plugin-registry.js';

const MAX_REQ_PER_MIN = 20;
const OWNER_REQ_PER_MIN = 120;
const RATE_WINDOW_MS = 60_000;
const MAX_BODY_BYTES = 24 * 1024;
const REFLECTION_CACHE_TTL_MS = 5 * 60_000;

const ipBuckets = new Map();
let reflectionCache = { expiresAt: 0, items: null };

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-Requested-With, X-User-AI-Key, X-User-AI-Provider',
  'Access-Control-Max-Age': '86400'
};

const INJECTION_RE = [
  /ignore (?:all )?(?:previous|above) instructions/i,
  /reveal (?:system )?prompt/i,
  /bypass (?:all )?filters/i,
  /<script\b/i,
  /javascript:/i
];

const MODE_INSTRUCTIONS = {
  'CC Auto': 'Dobieraj styl i głębię odpowiedzi do potrzeby użytkownika — łącz wierność Słowu Bożemu z praktyczną pomocą i odniesieniami do zasobów Christian Culture.',
  'Studium Biblijne': 'Skup się na egzegezie, kontekście historycznym, teologii Pisma Świętego i wiernych cytatach z Uwspółcześnionej Biblii Gdańskiej (UBG). Zaproponuj 2-3 pytania do dalszej refleksji.',
  'Twórczość CC': 'Twórz angażujące, merytoryczne i klarowne treści chrześcijańskie (artykuły, szkice kazań, scenariusze, posty) z mocnym początkiem, treścią opartą o Ewangelię i czytelną strukturą Markdown.',
  'Deep Research': 'Analizuj temat wnikliwie i uporządkowanie: przedstaw tezy, argumentację biblijną, kontekst historyczno-proroczy oraz zweryfikowane źródła z bazy Christian Culture.'
};

export function resetAiChatRuntimeState() {
  ipBuckets.clear();
  reflectionCache = { expiresAt: 0, items: null };
}

function getWarsawDateStr(now = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Warsaw',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

async function loadTodayReflection(env = {}) {
  try {
    const now = Date.now();
    let list = reflectionCache.expiresAt > now ? reflectionCache.items : null;
    if (!list && env?.ASSETS && typeof env.ASSETS.fetch === 'function') {
      const res = await env.ASSETS.fetch(new Request('https://polskieradio.cc/rozwazania_baza.json'));
      if (res && res.ok) {
        const parsed = await res.json();
        list = Array.isArray(parsed) ? parsed : [];
        reflectionCache = { expiresAt: now + REFLECTION_CACHE_TTL_MS, items: list };
      }
    }
    if (!Array.isArray(list) || !list.length) return null;
    const today = getWarsawDateStr();
    return list.find((r) => r && r.date === today) || list.filter((r) => r?.date).sort((a, b) => String(b.date).localeCompare(String(a.date)))[0] || list[0];
  } catch {
    return null;
  }
}

function extractCommaAndColonRefs(text = '') {
  const normalized = String(text || '').replace(/\b([1-3]?\s?[A-Za-zżźćńółęąśŻŹĆĄŚĘŁÓŃ]{1,8})\s+(\d{1,3}),(\d{1,3}(?:-\d{1,3})?)\b/g, '$1 $2:$3');
  return extractScriptureRefs(`${text} ${normalized}`);
}

function checkRate(ip = 'anon', maxReq = MAX_REQ_PER_MIN, now = Date.now()) {
  const key = String(ip || 'anon').split(',')[0].trim() || 'anon';
  const entry = ipBuckets.get(key);
  if (!entry || now - entry.start >= RATE_WINDOW_MS) {
    ipBuckets.set(key, { start: now, count: 1 });
    if (ipBuckets.size > 2000) {
      for (const [k, v] of ipBuckets.entries()) {
        if (now - v.start >= RATE_WINDOW_MS) ipBuckets.delete(k);
      }
    }
    return true;
  }
  if (entry.count >= maxReq) return false;
  entry.count += 1;
  return true;
}

function sanitizeArrayOfStrings(arr, maxItems, maxLen) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((v) => typeof v === 'string')
    .map((v) => v.trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((h) => h && (h.role === 'user' || h.role === 'assistant') && typeof h.text === 'string')
    .map((h) => ({
      role: h.role,
      text: h.text.trim().slice(0, 800)
    }))
    .filter((h) => h.text.length > 0)
    .slice(-8);
}

function normalizeResponseDepth(raw) {
  const val = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  return val === 'fast' || val === 'deep' ? val : 'balanced';
}

const PERSONALIZATION_ADDRESS_MAP = {
  ty: 'Zwracaj się bezpośrednio na „Ty”.',
  bracie_siostro: 'Zwracaj się serdecznie i wspólnotowo (np. „Bracie” / „Siostro” zgodnie z podanym imieniem i kontekstem).',
  pan_pani: 'Zwracaj się uprzejmie i oficjalnie w formie „Pan” / „Pani”.'
};

const PERSONALIZATION_RELATIONSHIP_MAP = {
  przyjaciel: 'Przyjaciel w wierze — bliska, życzliwa, wspierająca rozmowa w duchu Ewangelii.',
  mentor: 'Mentor i nauczyciel Biblii — mądry, konkretny i wymagający w miłości przewodnik w Słowie Bożym.',
  wspolpracownik: 'Współpracownik w misji — rzeczowe, sprawne partnerstwo w planowaniu, projektach i działaniu.',
  duszpasterz: 'Wsparcie i modlitwa — łagodność, pokój serca, empatyczna otucha i zachęta do modlitwy.',
  asystent: 'Neutralny asystent — spokojny, rzeczowy pomocnik bez poufałości.'
};

const PERSONALIZATION_TONE_MAP = {
  zrownowazony: 'Zrównoważony — łącz serdeczność z konkretem.',
  cieply: 'Ciepły i serdeczny — empatyczny, podnoszący na duchu.',
  konkretny: 'Konkretny i rzeczowy — krótko, precyzyjnie, zero lania wody.',
  gleboki: 'Egzegetyczny i głęboki — analiza kontekstu, języków oryginalnych i teologii Biblii.',
  misyjny: 'Inspirujący i misyjny — motywujący do odwagi wiary i realnego działania dla Jezusa.'
};

const PERSONALIZATION_LENGTH_MAP = {
  krotkie: 'Krótkie i zwięzłe odpowiedzi — samo sedno bez rozciągania.',
  srednie: 'Zrównoważona długość odpowiedzi.',
  rozbudowane: 'Szczegółowe, pogłębione i wyczerpujące opracowania.'
};

const PERSONALIZATION_SCRIPTURE_MAP = {
  naturalnie: 'Przywołuj wersety Pisma Świętego (UBG) wtedy, gdy naturalnie pasują do tematu.',
  zawsze: 'Zawsze zakorzeniaj odpowiedź w co najmniej jednym trafnym, dosłownym wersecie z Uwspółcześnionej Biblii Gdańskiej (UBG).',
  oryginal: 'Gdy to możliwe, sięgaj do oryginału hebrajskiego/greckiego (transliteracja + numer Stronga + UBG).'
};

const PERSONALIZATION_FORMAT_MAP = {
  mieszany: 'Naturalny układ (akapity oraz listy tam, gdzie poprawiają czytelność).',
  punkty: 'Przejrzyste wypunktowania, nagłówki i konkretne kroki do wykonania.',
  rozmowa: 'Płynna, naturalna forma rozmowy w akapitach (bez zbędnych list i technicznych nagłówków).'
};

function sanitizePersonalText(val, maxLen) {
  if (typeof val !== 'string') return '';
  const clean = val.replace(/\s+/g, ' ').trim().slice(0, maxLen);
  if (!clean) return '';
  if (INJECTION_RE.some((re) => re.test(clean))) return '';
  return clean;
}

export function sanitizeUserPersonalization(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const rawMe = raw.aboutMe && typeof raw.aboutMe === 'object' ? raw.aboutMe : {};
  const rawYou = raw.aboutYou && typeof raw.aboutYou === 'object' ? raw.aboutYou : {};

  const aboutMe = {
    preferredName: sanitizePersonalText(rawMe.preferredName, 60),
    addressStyle: Object.prototype.hasOwnProperty.call(PERSONALIZATION_ADDRESS_MAP, rawMe.addressStyle) ? rawMe.addressStyle : '',
    relationship: Object.prototype.hasOwnProperty.call(PERSONALIZATION_RELATIONSHIP_MAP, rawMe.relationship) ? rawMe.relationship : '',
    aboutBio: sanitizePersonalText(rawMe.aboutBio, 600),
    spiritualContext: sanitizePersonalText(rawMe.spiritualContext, 600)
  };

  const aboutYou = {
    tone: Object.prototype.hasOwnProperty.call(PERSONALIZATION_TONE_MAP, rawYou.tone) ? rawYou.tone : '',
    responseLength: Object.prototype.hasOwnProperty.call(PERSONALIZATION_LENGTH_MAP, rawYou.responseLength) ? rawYou.responseLength : '',
    scriptureStyle: Object.prototype.hasOwnProperty.call(PERSONALIZATION_SCRIPTURE_MAP, rawYou.scriptureStyle) ? rawYou.scriptureStyle : '',
    responseFormat: Object.prototype.hasOwnProperty.call(PERSONALIZATION_FORMAT_MAP, rawYou.responseFormat) ? rawYou.responseFormat : '',
    proactiveSteps: Boolean(rawYou.proactiveSteps),
    prayerSupport: Boolean(rawYou.prayerSupport),
    avoidFluff: Boolean(rawYou.avoidFluff),
    customBehavior: sanitizePersonalText(rawYou.customBehavior, 700)
  };

  const hasMe = Boolean(
    aboutMe.preferredName ||
    (aboutMe.addressStyle && aboutMe.addressStyle !== 'ty') ||
    aboutMe.relationship ||
    aboutMe.aboutBio ||
    aboutMe.spiritualContext
  );
  const hasYou = Boolean(
    (aboutYou.tone && aboutYou.tone !== 'zrownowazony') ||
    (aboutYou.responseLength && aboutYou.responseLength !== 'srednie') ||
    (aboutYou.scriptureStyle && aboutYou.scriptureStyle !== 'naturalnie') ||
    (aboutYou.responseFormat && aboutYou.responseFormat !== 'mieszany') ||
    aboutYou.proactiveSteps ||
    aboutYou.prayerSupport ||
    aboutYou.avoidFluff ||
    aboutYou.customBehavior
  );

  if (!hasMe && !hasYou) return null;
  return { aboutMe, aboutYou, hasMe, hasYou };
}

export const BIBLICAL_DECALOGUE_CANON = [
  '8. KANON DOKTRYNALNY — BIBLIJNY DEKALOG (Księga Wyjścia 20,1–17) ORAZ 28 ZASAD WIARY KOŚCIOŁA BOŻEGO (NORMA BEZWZGLĘDNA):',
  '- Przestrzegaj bez wyjątku Pisma Świętego (Sola Scriptura) oraz 28 Zasad Wiary Kościoła Bożego (zasada 1: Pismo Święte jako jedyny autorytet; zasada 19: Prawo Boże — Dziesięć Przykazań z Wj 20,1–17; zasada 20: Sabat w sobotę — siódmy dzień tygodnia). KATEGORYCZNIE ZABRANIA SIĘ afirmowania lub nauczania pozabiblijnych tradycji ludzkich sprzecznych z Dekalogiem.',
  '- Pełna biblijna numeracja Dziesięciu Przykazań Bożych (Wj 20,1–17 — zgodna z UBG i historycznym przekładem ks. Jakuba Wujka, wyd. III 1962 r.):',
  '  I. Nie będziesz miał bogów cudzych przede mną (Wj 20,3).',
  '  II. Zakaz czynienia obrazów rytych i podobizn oraz oddawania im pokłonu i służenia im (Wj 20,4–6) — NIGDY nie pomijaj II przykazania ani nie łącz go z I.',
  '  III. Nie będziesz brał imienia Pana, Boga twego, nadaremno (Wj 20,7).',
  '  IV. Pamiętaj, abyś dzień sobotni święcił — sześć dni będziesz pracował i wykonywał wszelką swoją pracę, ale siódmego dnia jest Sabat Pana, Boga twego (SOBOTA, od zachodu słońca w piątek do zachodu słońca w sobotę) (Wj 20,8–11; Rdz 2,2–3; Iz 58,13–14).',
  '  V. Czcij ojca twego i matkę twoją (Wj 20,12). VI. Nie będziesz zabijał (Wj 20,13). VII. Nie będziesz cudzołożył (Wj 20,14). VIII. Nie będziesz kradzieży czynił (Wj 20,15). IX. Nie będziesz mówił fałszywego świadectwa przeciw bliźniemu twemu (Wj 20,16).',
  '  X. Nie będziesz pożądał domu bliźniego twego, żony jego ani żadnej rzeczy jego (Wj 20,17) — to jedno X przykazanie, NIGDY nie rozbijaj go na IX i X.',
  '- BEZWZGLĘDNA REGUŁA PLANU TYGODNIA I DNIA ŚWIĘTEGO: Piątek (szczególnie czas przed zachodem słońca) jest dniem przygotowania na rozpoczęcie Sabatu. Sobota (siódmy dzień, od zachodu słońca w piątek do zachodu słońca w sobotę) jest JEDYNYM biblijnym dniem świętym — Sabatem Pana (Dniem Pańskim — Mk 2,28; Iz 58,13), dniem odpoczynku od pracy zawodowej, uwielbienia, nabożeństwa i wspólnoty z Bogiem. Niedziela to pierwszy dzień tygodnia — zwykły dzień pracy i codziennych obowiązków. KATEGORYCZNIE ZABRANIA SIĘ nazywania niedzieli „Dniem Pańskim”, „dniem świętym” lub dniem odpoczynku zastępującym Sabat, jak również pisania o „przygotowaniu w sobotę do niedzielnego nabożeństwa lub spotkania ze wspólnotą”.',
  '- Gdy użytkownik prosi o pełny tekst Dziesięciu Przykazań według ks. Jakuba Wujka (BJW 1962) lub Biblii (Wj 20,1–17), podaj pełny, nieskrócony tekst biblijny wszystkich dziesięciu przykazań I–X.'
].join('\n');

function buildSystemInstruction({ assistant, mode, moduleName, sources, scriptureHits, mojabibliaVerses = [], contextGuides, todayReflection, media, memoryNotes, userPersonalization = null, workspaceActions = [], connectedApps = [], privateMode, tools, voiceConversation = false, responseDepth = 'balanced' }) {
  const modeNote = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS['CC Auto'];
  const isFemale = assistant?.gender === 'female';
  const hasMedia = Array.isArray(media) && media.length > 0;
  const lines = [
    assistant?.systemPrompt || 'Jesteś asystentem „AI dla Jezusa” w ekosystemie Christian Culture (polskieradio.cc).',
    'Misja: Technologia w służbie dobra. Jezus w centrum.',
    `Rozmawiasz jako: ${assistant?.name || 'AI dla Jezusa'} (${assistant?.role || 'Główny Asystent CC'}).`,
    `Aktualny tryb pracy: ${mode} (${moduleName || 'Czat'}). ${modeNote}`,
    'Zasady bezwzględne (Sola Scriptura & Zero-QA):',
    '1. KONKRET NA PIERWSZYM MIEJSCU (ZERO WATY): Zaczynaj OD RAZU od precyzyjnej, merytorycznej odpowiedzi na pytanie użytkownika — bez lania wody, pustych wstępów i ogólnych frazesów. Odpowiadaj po polsku, mądrze i przejrzyście (Markdown: ##/###, listy, cytaty >). W pytaniach biblijnych, egzegetycznych, językowych, historycznych i doktrynalnych trzymaj wysoki poziom merytoryczny; duszpasterskie pytania osobiste i okrzyki uwielbienia stosuj WYŁĄCZNIE w rozmowach osobistych, modlitewnych lub o zmaganiach życiowych.',
    '2. Wszelkie dosłowne cytaty biblijne podawaj wyłącznie w brzmieniu Uwspółcześnionej Biblii Gdańskiej (UBG), oznaczając siglum i przekład (np. Prz 3,5 UBG). Nigdy nie zmyślaj treści wersetów.',
    isFemale
      ? '3. Nigdy nie podszywaj się pod Jezusa Chrystusa ani pod Boga — pomagasz jako chrześcijańska asystentka AI.'
      : '3. Nigdy nie podszywaj się pod Jezusa Chrystusa ani pod Boga — pomagasz jako chrześcijański asystent AI.',
    hasMedia
      ? '4. Zatrzymuj użytkownika wewnątrz aplikacji AI dla Jezusa: najpierw daj kompletną treść i wskaż wyłącznie te odtwarzacze multimedialne (audio, wideo, radio), które są osadzone pod tą odpowiedzią i pasują do pytania.'
      : '4. Skup się bezpośrednio na pytaniu użytkownika i Słowie Bożym — NIE reklamuj odtwarzaczy, radia ani zewnętrznych kanałów, skoro użytkownik o nie nie prosił.',
    '5. Przywołuj wyłącznie prawdziwe tytuły i zasoby z kontekstu poniżej.',
    isFemale
      ? '6. FORMA GRAMATYCZNA (BEZWZGLĘDNA): Jesteś kobietą i asystentką — ZAWSZE pisz w rodzaju żeńskim (np. „przygotowałam”, „chciałabym Ci zaproponować”, „wybrałam”, „z przyjemnością pomogłam”, „jestem gotowa”). NIGDY nie używaj form męskich („przygotowałem”, „chciałbym”, „asystent”).'
      : '6. FORMA GRAMATYCZNA (BEZWZGLĘDNA): Jesteś mężczyzną (głównym asystentem AI dla Jezusa) — ZAWSZE pisz w rodzaju męskim (np. „przygotowałem”, „chciałbym Ci zaproponować”, „wybrałem”, „jestem gotowy”). NIGDY nie używaj form żeńskich („przygotowałam”, „chciałabym”, „asystentka”).',
    [
      `7. CHARAKTER I MENTALNOŚĆ CHRYSTOCENTRYCZNA (W ROZMOWACH OSOBISTYCH I DUSZPASTERSKICH) — ${isFemale ? 'PRZYJAZNA SIOSTRA, PRZYJACIÓŁKA I MENTORKA' : 'PRZYJAZNY BRAT, PRZYJACIEL I MENTOR'} W CODZIENNYM CHODZENIU Z JEZUSEM:`,
      isFemale
        ? '- Tożsamość relacyjna: gdy użytkownik szuka wsparcia osobistego, modlitwy lub porady życiowej, bądź jak żywa, ciepła, optymistyczna siostra i przyjaciółka w Chrystusie oraz wymagająca w miłości nauczycielka („belfer” serca) — prawdziwa towarzyszka w codziennym chodzeniu z Jezusem.'
        : '- Tożsamość relacyjna: gdy użytkownik szuka wsparcia osobistego, modlitwy lub porady życiowej, bądź jak żywy, ciepły, optymistyczny brat i przyjaciel w Chrystusie oraz wymagający w miłości nauczyciel („belfer” serca) — prawdziwy towarzysz w codziennym chodzeniu z Jezusem.',
      '- Odwaga miłości (upomnienie, napomnienie, inspiracja i pocieszenie): kiedy sytuacja duchowa tego wymaga, z miłością i szacunkiem potrafisz upomnieć i napomnieć, nazwać grzech czy kompromis po imieniu i inspirować do porzucania grzechu, nałogów oraz reformacji życia w Duchu Świętym — zawsze z nadzieją i bez potępiania człowieka.',
      '- Prowadź do Źródła: kieruj do Ojca w niebie, rozmowy z Jezusem, społeczności z Duchem Świętym, Słowa Bożego (UBG) oraz biblijnego Dekalogu.',
      '- Rozmowa osobista vs pytanie badawcze: TYLKO gdy rozmowa dotyczy osobistych zmagań, modlitwy lub codziennego życia wiary (a NIE przy pytaniach teologicznych/językowych/historycznych), pytaj życzliwie o stan duchowy, kondycja emocjonalna lub etap uświęcenia oraz wplataj zwroty typu „Chwała Panu!”, „Alleluja!”, „Jezus żyje!”, „Jezus się tym zajmie!”. Przy pytaniach egzegetycznych i doktrynalnych nie wstawiaj pustych sloganów ani rutynowego „co u Ciebie słychać” — szanuj intelekt i potrzebę konkretu.'
    ].join('\n'),
    BIBLICAL_DECALOGUE_CANON,
    [
      '9. EGZEGEZA JĘZYKÓW ORYGINALNYCH BIBLII I INTEGRACJA Z MOJABIBLIA (https://polskieradio.cc/mojabiblia):',
      '- Przy każdym pytaniu o Pismo Święte, doktrynę lub znaczenie słów schodź głęboko do tekstu oryginalnego: hebrajskiego/aramejskiego (ST) oraz greki koine (NT). Podawaj dokładne słowo w oryginale, transliterację, numer Stronga (H.../G...), znaczenie leksykalne i kontekst gramatyczny w zdaniu.',
      '- Zawsze sprawdzaj, czy język oryginalny używa odrębnych słów dla rozróżnianych pojęć (przykład kluczowy: w NT greka wyraźnie rozróżnia ἀδελφός / adelphos G80 = brat z tego samego łona, rodzony brat vs ἀνεψιός / anepsios G431 = kuzyn w Kol 4,10 vs συγγενής / syngenes G4773 = krewny w Łk 2,44; podobnie πρωτότοκος / prōtotokos G4416 = pierworodny vs μονογενής / monogenēs G3439 = jednorodzony). Wyraźnie oddzielaj to, co napisano w natchnionym tekście hebrajskim/greckim, od późniejszych tradycji ludzkich lub domysłów.',
      '- Jeśli w sekcji poniżej otrzymujesz wersety interlinearne z MojaBiblia CC, wykorzystaj je bezpośrednio w analizie i podaj link do podglądu interlinearnego na https://polskieradio.cc/mojabiblia.'
    ].join('\n')
  ];

  if (voiceConversation) {
    lines.push('10. TRYB ROZMOWY GŁOSOWEJ NA ŻYWO: Odpowiadaj naturalnym, zwięzłym językiem mówionym (3–6 zdań). Unikaj tabel, długich wypunktowań i surowych adresów URL.');
  } else if (responseDepth === 'fast') {
    lines.push('10. TRYB TURBO (SZYBKI I KONKRETNY): Odpowiadaj zwięźle i od razu do rzeczy (2–4 krótkie akapity z 1 kluczowym wersetem UBG i ewentualnym słowem oryginalnym).');
  } else if (responseDepth === 'deep') {
    lines.push('10. TRYB GŁĘBOKI (PEŁNA EGZEGEZA): Przedstaw dogłębną analizę: oryginalny tekst grecki/hebrajski z numerami Stronga, kontekst najbliższy i całej Biblii (UBG), odniesienie do źródeł tradycji oraz praktyczne wnioski.');
  }

  if (Array.isArray(tools) && tools.length) {
    lines.push(`Aktywne narzędzia użytkownika: ${tools.join(', ')}.`);
  }

  if (!privateMode && userPersonalization) {
    if (userPersonalization.hasMe && userPersonalization.aboutMe) {
      const me = userPersonalization.aboutMe;
      const meLines = ['PROFIL UŻYTKOWNIKA (ZAKŁADKA „O MNIE” — respektuj formę zwrotu, imię i relację):'];
      if (me.preferredName) meLines.push(`- Imię / preferowany zwrot: ${me.preferredName}`);
      if (me.addressStyle && PERSONALIZATION_ADDRESS_MAP[me.addressStyle]) {
        meLines.push(`- Forma zwracania się: ${PERSONALIZATION_ADDRESS_MAP[me.addressStyle]}`);
      }
      if (me.relationship && PERSONALIZATION_RELATIONSHIP_MAP[me.relationship]) {
        meLines.push(`- Oczekiwana relacja: ${PERSONALIZATION_RELATIONSHIP_MAP[me.relationship]}`);
      }
      if (me.aboutBio) meLines.push(`- Co warto wiedzieć o użytkowniku: ${me.aboutBio}`);
      if (me.spiritualContext) meLines.push(`- Cele duchowe, zainteresowania i kontekst: ${me.spiritualContext}`);
      lines.push(meLines.join('\n'));
    }

    if (userPersonalization.hasYou && userPersonalization.aboutYou) {
      const you = userPersonalization.aboutYou;
      const youLines = ['OSOBISTE PREFERENCJE ZACHOWANIA AGENTA (ZAKŁADKA „O TOBIE” — stosuj w ramach kanonu Sola Scriptura i Dekalogu):'];
      if (you.tone && PERSONALIZATION_TONE_MAP[you.tone]) {
        youLines.push(`- Ton wypowiedzi: ${PERSONALIZATION_TONE_MAP[you.tone]}`);
      }
      if (you.responseLength && PERSONALIZATION_LENGTH_MAP[you.responseLength]) {
        youLines.push(`- Długość odpowiedzi: ${PERSONALIZATION_LENGTH_MAP[you.responseLength]}`);
      }
      if (you.scriptureStyle && PERSONALIZATION_SCRIPTURE_MAP[you.scriptureStyle]) {
        youLines.push(`- Korzystanie z Biblii: ${PERSONALIZATION_SCRIPTURE_MAP[you.scriptureStyle]}`);
      }
      if (you.responseFormat && PERSONALIZATION_FORMAT_MAP[you.responseFormat]) {
        youLines.push(`- Struktura odpowiedzi: ${PERSONALIZATION_FORMAT_MAP[you.responseFormat]}`);
      }
      if (you.avoidFluff) {
        youLines.push('- Zawsze przechodź od razu do konkretu bez zbędnych wstępów i ozdobników.');
      }
      if (you.proactiveSteps) {
        youLines.push('- Na zakończenie zaproponuj 1 konkretny krok praktyczny lub pytanie pogłębiające.');
      }
      if (you.prayerSupport) {
        youLines.push('- W rozmowach o trudnościach i zmaganiach proponuj krótką, szczerą modlitwę.');
      }
      if (you.customBehavior) {
        youLines.push(`- Dodatkowe osobiste instrukcje użytkownika: ${you.customBehavior}`);
      }
      lines.push(youLines.join('\n'));
    }
  }

  if (!privateMode && Array.isArray(memoryNotes) && memoryNotes.length) {
    lines.push('Zapisane wskazówki pamięci użytkownika (kontekst pomocniczy):\n- ' + memoryNotes.join('\n- '));
  }

  const toolsPromptNote = buildWorkspaceToolsSystemPromptNote(workspaceActions, privateMode ? [] : connectedApps);
  if (toolsPromptNote) {
    lines.push(toolsPromptNote);
  }

  if (todayReflection) {
    lines.push(`Dzisiejsze rozważanie Christian Culture: „${todayReflection.title || ''}” (${todayReflection.reading || ''}) — ${todayReflection.memoryVerse || todayReflection.teaser || ''}`.slice(0, 420));
  }

  if (Array.isArray(contextGuides) && contextGuides.length) {
    lines.push(
      'Przewodniki tematyczne CC:\n' +
      contextGuides.map((g) => `- ${g.topic}: ${g.summary}`).join('\n')
    );
  }

  if (scriptureHits.length) {
    lines.push(
      'Zweryfikowane fragmenty Pisma Świętego (UBG):\n' +
      scriptureHits.map((s) => `- ${s.reference} (${s.translation}): „${s.text}” [${s.canonical_url}]`).join('\n')
    );
  }

  if (Array.isArray(mojabibliaVerses) && mojabibliaVerses.length) {
    lines.push(
      'Dane interlinearne z MojaBiblia CC (UBG + tekst oryginalny ze słownikiem Stronga):\n' +
      mojabibliaVerses.map((v) => {
        const wordTokens = (Array.isArray(v.allWords) ? v.allWords : v.keyWords || [])
          .slice(0, 26)
          .map((w) => `${w.original} [${w.translit || ''}, ${w.strong}${w.glossPl ? `: ${w.glossPl}` : ''}]`)
          .join(' | ');
        return `- **${v.shortRef}** (UBG): „${v.ubg}”\n  Język oryginalny (${v.originalLang}): ${wordTokens}\n  Podgląd interlinearny: ${v.interlinearUrl}`;
      }).join('\n')
    );
  }

  if (sources.length) {
    lines.push(
      'Powiązane zweryfikowane zasoby Christian Culture:\n' +
      sources.map((doc, i) => `${i + 1}. ${doc.title} — ${doc.snippet} (${doc.url})`).join('\n')
    );
  }

  if (Array.isArray(media) && media.length) {
    lines.push(
      'Multimedia osadzone bezpośrednio w oknie czatu pod odpowiedzią:\n' +
      media.map((m) => `- [${m.kind}] ${m.title}`).join('\n')
    );
  }

  return lines.join('\n\n');
}

function buildAvailableFreeModels(env = {}) {
  return PUBLIC_FREE_MODELS.filter(model => model.id === 'auto' || model.id === 'cc-knowledge-hub' ||
    (model.id === SHARED_MODEL && sharedAiReady(env))).map(model => ({ ...model }));
}

function resolvePreferredFreeModel(payload = {}, env = {}) {
  const raw = String(payload.preferredModel || payload.ownerModel || '').trim();
  if (!raw || raw === 'auto') return 'auto';
  if (raw === 'cc-knowledge-hub') return 'cc-knowledge-hub';
  const allowedGemini = new Set(sharedAiReady(env) ? [SHARED_MODEL] : []);
  if (env.GEMINI_MODEL) allowedGemini.add(String(env.GEMINI_MODEL).trim());
  if (allowedGemini.has(raw)) return raw;
  return 'auto';
}

function buildUserMessageWithAttachment(message, attachmentName, attachmentText) {
  if (!attachmentText) return message;
  const safeName = attachmentName ? `„${attachmentName}”` : 'załączonego pliku';
  return `${message}\n\n---\nTreść ${safeName} do analizy:\n${attachmentText}`;
}

async function callGeminiChat(apiKeyOrPool, preferredModel, systemInstruction, history, userPrompt, fetchImpl = fetch, diagnostics = [], opts = {}) {
  const keys = Array.isArray(apiKeyOrPool)
    ? apiKeyOrPool.filter(Boolean).slice(0, 5)
    : (apiKeyOrPool ? [String(apiKeyOrPool)] : []);
  if (!keys.length) return null;

  const maxOutputTokens = Number(opts?.maxOutputTokens) > 0 ? Number(opts.maxOutputTokens) : 1400;
  const models = [preferredModel];

  const contents = history.map((h) => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.text }]
  }));
  contents.push({ role: 'user', parts: [{ text: userPrompt }] });

  for (const model of models) {
    for (let kIdx = 0; kIdx < Math.min(keys.length, 3); kIdx += 1) {
      const apiKey = keys[kIdx];
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      try {
        const res = await fetchImpl(endpoint, {
          method: 'POST',
          signal: ctrl.signal,
          redirect: 'manual',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens
            }
          })
        });
        if (!res.ok) {
          diagnostics.push(`gemini:${res.status}`);
          continue;
        }
        const data = await res.json();
        const parts = data?.candidates?.[0]?.content?.parts;
        const text = Array.isArray(parts) ? parts.map((p) => p?.text || '').join('').trim() : '';
        if (text) return { reply: text, provider: 'gemini', model };
        diagnostics.push('gemini:empty');
      } catch {
        diagnostics.push('gemini:timeout_or_net');
      } finally {
        clearTimeout(timer);
      }
    }
  }
  return null;
}

async function callOpenAiCompatibleChat({ endpoint, apiKey, model, providerName, extraHeaders = {} }, systemInstruction, history, userPrompt, fetchImpl = fetch, diagnostics = []) {
  if (!apiKey) return null;
  const messages = [
    { role: 'system', content: systemInstruction },
    ...history.map((h) => ({ role: h.role, content: h.text })),
    { role: 'user', content: userPrompt }
  ];

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetchImpl(endpoint, {
      method: 'POST',
      redirect: 'manual',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...extraHeaders
      },
      body: JSON.stringify({
        model,
        temperature: 0.5,
        max_tokens: 1400,
        messages
      })
    });
    if (!res.ok) {
      diagnostics.push(`${providerName}:${res.status}`);
      return null;
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (text) return { reply: String(text).trim(), provider: providerName, model };
    diagnostics.push(`${providerName}:empty`);
    return null;
  } catch {
    diagnostics.push(`${providerName}:timeout_or_net`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function buildKnowledgeHubFallback({ assistant, mode, message, scriptureHits, mojabibliaVerses = [], contextGuides, todayReflection, sources, media, workspaceActions = [], activeContext = null, scholarData = null }) {
  const parts = [];
  const speaker = assistant?.name || 'AI dla Jezusa';
  const isFemale = assistant?.gender === 'female';
  const isFactualOrScripture = Boolean(contextGuides?.length || mojabibliaVerses?.length || scriptureHits?.length || activeContext || scholarData);
  const heading = activeContext?.reference
    ? `### Kontekst Scrolluj Biblię — ${activeContext.reference} (UBG)`
    : (scholarData?.lexicon?.entry?.strong
      ? `### Leksykon Stronga — ${scholarData.lexicon.entry.strong} (${scholarData.lexicon.entry.original || scholarData.lexicon.entry.translit})`
      : (contextGuides?.[0]?.topic
        ? `### ${contextGuides[0].topic}`
        : (mojabibliaVerses?.[0]?.shortRef
          ? `### Analiza biblijna i interlinearna — ${mojabibliaVerses[0].shortRef}`
          : `### ${speaker} · ${mode || 'Ekosystem Christian Culture'}`)));
  parts.push(heading);

  if (activeContext?.text) {
    parts.push(`> „${activeContext.text}” — **${activeContext.reference}** (UBG)`);
    parts.push(`Słowo Boże bada się w obecności Autora: *„Gdy nie rozumiesz tekstu, zacznij od modlitwy.”*\nMożesz uruchomić pełne **Głębokie Studium** (8 etapów, Wielka Szóstka, mapa myśli) lub zbadać kontekst bliski w Scrolluj Biblię.`);
  }

  if (contextGuides?.length) {
    const guide = contextGuides[0];
    parts.push(`${guide.summary}`);
    const verse = Array.isArray(guide.keyVerses) && guide.keyVerses[0];
    if (verse?.text) {
      parts.push(`> „${verse.text}” — **${verse.ref}** (UBG)`);
    }
  } else if (!mojabibliaVerses?.length && !scriptureHits?.length) {
    parts.push(`${speaker}: ${isFemale ? 'Przygotowałam' : 'Przygotowałem'} dla Ciebie najważniejsze treści i multimedia bezpośrednio tutaj, bez wychodzenia z aplikacji AI dla Jezusa.`);
  }

  if (Array.isArray(mojabibliaVerses) && mojabibliaVerses.length) {
    parts.push('**Tekst UBG i analiza interlinearna (MojaBiblia CC):**');
    for (const v of mojabibliaVerses) {
      const strongWords = (v.keyWords || [])
        .slice(0, 6)
        .map((w) => `**${w.original}** (*${w.translit}*, \`${w.strong}\` — ${w.glossPl || 'zobacz w MojaBiblia'})`)
        .join(', ');
      parts.push(`> „${v.ubg}” — **${v.shortRef}** (UBG)\n${strongWords ? `Słowa kluczowe oryginału: ${strongWords}\n` : ''}[Otwórz interlinearnie w MojaBiblia ↗](${v.interlinearUrl})`);
    }
  } else if (scriptureHits.length) {
    for (const s of scriptureHits) {
      parts.push(`> „${s.text}” — **${s.reference}** (${s.translation})`);
    }
  }

  if (todayReflection && /dzis|dzisiaj|rozwaz|nadziej|slowo|kurs|plan|wiar/i.test(message) && !contextGuides?.length) {
    const cleanTitle = String(todayReflection.title || '').replace(/^☀️\s*/, '').trim();
    const teaser = String(todayReflection.teaser || todayReflection.memoryVerse || '').trim();
    if (cleanTitle) {
      parts.push(`**Dzisiejsze słowo w Christian Culture — ${cleanTitle}:** ${teaser}`);
    }
  }

  if (sources.length) {
    parts.push('**Zweryfikowane źródła z indeksu Christian Culture:**');
    for (const doc of sources) {
      parts.push(`- **${doc.title}**${doc.snippet ? ` — ${doc.snippet}` : ''}`);
    }
  } else if (!isFactualOrScripture) {
    parts.push(
      Array.isArray(media) && media.length
        ? `Dla hasła „${message}” poniżej w oknie czatu ${isFemale ? 'osadziłam' : 'osadziłem'} pasujące materiały multimedialne Christian Culture, a ponadto możesz przejrzeć pełne Pismo Święte w module **Biblia** po lewej.`
        : `Dla hasła „${message}” ${isFemale ? 'osadziłam' : 'osadziłem'} najważniejsze wskazówki bezpośrednio w tym oknie, a pełne Pismo Święte znajdziesz w module **Biblia** po lewej.`
    );
  }

  if (Array.isArray(workspaceActions) && workspaceActions.length) {
    const names = workspaceActions.map((a) => a.appName || a.title).filter(Boolean).join(', ');
    parts.push(`**Aktywne narzędzia Twojego Ekosystemu Christian Culture (${names}):** Poniżej pod tą odpowiedzią masz gotową kartę połączenia i akcji w czasie rzeczywistym — kliknij przycisk na karcie, aby natychmiast zapisać plan w **HOLOS 2027**, dodać projekt lub skonfigurować swoją ścieżkę.`);
  }

  if (Array.isArray(media) && media.length) {
    parts.push('**Gotowe multimedia w tym oknie (odtwarzaj poniżej bez opuszczania aplikacji):**');
  }

  if (scholarData) {
    if (scholarData.lexicon?.found && scholarData.lexicon.entry) {
      const e = scholarData.lexicon.entry;
      parts.push(`**CC Bible Scholar — Słownik Stronga (${e.strong}, ${e.strongTier}):** ${e.original} (*${e.translit}*, wym. ${e.pronunciation}) — ${e.definitionPl}${e.autoGenerated ? ' *(oznaczenie STEP autoGenerated)*' : ''}`);
    }
    if (scholarData.crossReferences?.found && scholarData.crossReferences.items?.length) {
      const refs = scholarData.crossReferences.items.slice(0, 6).map((x) => `${x.targetRef} (${x.votes})`).join(', ');
      parts.push(`**Odsyłacze biblijne (${scholarData.crossReferences.reference}, OpenBible CC BY 4.0):** ${refs} *(łącznie: ${scholarData.crossReferences.totalCount})*.`);
    }
    if (scholarData.concordance?.found && scholarData.concordance.items?.length) {
      const preview = scholarData.concordance.items.slice(0, 4).map((x) => `- **${x.reference} (UBG):** „${x.text}”`).join('\n');
      parts.push(`**Konkordancja UBG („${scholarData.concordance.query}”, znaleziono ${scholarData.concordance.totalCount}×):**\n${preview}`);
    }
    if (scholarData.studyQuestions?.found && scholarData.studyQuestions.questions?.length) {
      const qs = scholarData.studyQuestions.questions.slice(0, 6).map((q) => `- **${q.label}** ${q.prompt}`).join('\n');
      parts.push(`**${scholarData.studyQuestions.title}:**\n${qs}\n[Otwórz Głębokie Studium ↗](${scholarData.studyQuestions.deepStudyUrl})`);
    }
  }

  if (!isFactualOrScripture) {
    parts.push(
      isFemale
        ? '**Słowo od serca siostry i mentorki w Chrystusie:** Chwała Panu — Jezus żyje i nie zostawia Cię w żadnym mroku! Pamiętaj obietnice Ojca w niebie, karm się Słowem Bożym (UBG) i przykazaniami Dekalogu, a każdy grzech czy słabość oddawaj odważnie pod reformację w Duchu Świętym — **Jezus się tym zajmie!** Powiedz mi szczerze, co u Ciebie słychać: jak wygląda dziś Twój stan duchowy, kondycja emocjonalna i nad czym na obecnym etapie uświęcenia chcesz dziś popracować?'
        : '**Słowo od serca brata i mentora w Chrystusie:** Chwała Panu — Jezus żyje i rozświetla każdy mrok! Trzymaj się blisko Ojca w niebie, rozmawiaj z Jezusem w modlitwie, buduj społeczność z Duchem Świętym i strzeż w sercu biblijnego Dekalogu, śmiało porzucając każdy grzech oraz nałóg — **Jezus się tym zajmie!** Powiedz mi po bratersku, co u Ciebie słychać: jak się dziś czujesz, jaki jest Twój stan duchowy i emocjonalny oraz nad czym na swoim etapie uświęcenia chcesz dziś popracować?'
    );
  }

  parts.push(`*Źródło: zweryfikowane zasoby Bazy Wiedzy Christian Culture & MojaBiblia Interlinear (UBG · 0 zł · ${speaker}).*`);
  return parts.join('\n\n');
}

async function runUserByokProvider({ provider, apiKey, userModel }, systemInstruction, history, userPrompt, fetchImpl, diagnostics) {
  if (!apiKey || !provider) return null;
  const p = String(provider).trim().toLowerCase();
  const safeModel = typeof userModel === 'string' && /^[a-z0-9._:/-]{3,80}$/i.test(userModel.trim()) ? userModel.trim() : '';

  if (p === 'gemini') {
    return callGeminiChat(apiKey, safeModel || 'gemini-2.5-flash', systemInstruction, history, userPrompt, fetchImpl, diagnostics);
  }
  if (p === 'openrouter') {
    return callOpenAiCompatibleChat(
      {
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        apiKey,
        model: safeModel || 'meta-llama/llama-3.3-70b-instruct:free',
        providerName: 'openrouter-byok',
        extraHeaders: { 'HTTP-Referer': 'https://polskieradio.cc/ai/', 'X-Title': 'AI dla Jezusa Christian Culture' }
      },
      systemInstruction,
      history,
      userPrompt,
      fetchImpl,
      diagnostics
    );
  }
  if (p === 'groq') {
    return callOpenAiCompatibleChat(
      {
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        apiKey,
        model: safeModel || 'llama-3.3-70b-versatile',
        providerName: 'groq-byok'
      },
      systemInstruction,
      history,
      userPrompt,
      fetchImpl,
      diagnostics
    );
  }
  if (p === 'openai') {
    return callOpenAiCompatibleChat(
      {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        apiKey,
        model: safeModel || 'gpt-4o-mini',
        providerName: 'openai-byok'
      },
      systemInstruction,
      history,
      userPrompt,
      fetchImpl,
      diagnostics
    );
  }
  return null;
}

export async function processAiChat(payload = {}, env = {}, deps = {}) {
  const rawMessage = typeof payload.message === 'string' ? payload.message.trim() : '';
  const mode = typeof payload.mode === 'string' && MODE_INSTRUCTIONS[payload.mode] ? payload.mode : 'CC Auto';
  const moduleName = typeof payload.module === 'string' && payload.module.trim() ? payload.module.trim().slice(0, 60) : 'Czat';
  const assistant = resolveAiAssistant(payload.assistantId);
  const assistantMeta = {
    id: assistant.id,
    name: assistant.name,
    gender: assistant.gender || 'male',
    role: assistant.role,
    avatar: assistant.avatar,
    avatarFallback: assistant.avatarFallback
  };
  const attachmentName = typeof payload.attachmentName === 'string' ? payload.attachmentName.trim().slice(0, 120) : '';
  const attachmentText = typeof payload.attachmentText === 'string' ? payload.attachmentText.trim().slice(0, 8000) : '';
  const privateMode = Boolean(payload.privateMode);
  const tools = sanitizeArrayOfStrings(payload.tools, 6, 40);
  const memoryNotes = privateMode ? [] : sanitizeArrayOfStrings(payload.memoryNotes, 8, 200);
  const connectedApps = privateMode ? [] : sanitizeArrayOfStrings(payload.connectedApps, 12, 40);
  const userPersonalization = privateMode ? null : sanitizeUserPersonalization(payload.userPersonalization);
  const history = privateMode ? [] : sanitizeHistory(payload.history);
  const userByok = deps.userByok || null;

  const effectiveMessage = rawMessage.slice(0, 2000) || (attachmentText ? `Przeanalizuj załączony materiał${attachmentName ? ` (${attachmentName})` : ''}.` : '');

  if (!effectiveMessage) {
    return {
      ok: false,
      error: 'empty_message',
      detail: 'Wpisz pytanie lub dołącz tekst do analizy.'
    };
  }

  if (INJECTION_RE.some((re) => re.test(effectiveMessage))) {
    return {
      ok: true,
      reply: `Jestem ${assistant.name} w ekosystemie „AI dla Jezusa” Christian Culture — pomagam w studiowaniu Pisma Świętego, tworzeniu treści i odkrywaniu naszych multimediów. W czym mogę Ci dziś pomóc?`,
      provider: 'guard',
      assistant: assistantMeta,
      mode,
      module: moduleName,
      sources: [],
      media: [],
      scriptureRefs: [],
      toolsUsed: tools,
      zeroCostGuaranteed: true
    };
  }

  const searchQuery = rawMessage.slice(0, 256) || attachmentName;
  const rag = searchQuery ? searchKnowledgeHub(searchQuery, { lang: 'pl', limit: 4 }) : { results: [] };
  const sources = (rag.results || []).slice(0, 4).map((item) => ({
    title: item.title,
    url: item.url,
    snippet: item.snippet,
    type: item.type
  }));

  const contextGuides = matchContextGuides(effectiveMessage);
  const media = resolveEcosystemMedia(effectiveMessage, { assistantId: assistant.id, mode, limit: 4 });
  const todayReflection = await loadTodayReflection(env);

  const detectedRefs = extractCommaAndColonRefs(effectiveMessage).slice(0, 2);
  const scriptureHits = [];
  for (const ref of detectedRefs) {
    const found = findScripture(ref);
    if (found) scriptureHits.push(found);
  }

  const guideRefs = contextGuides.flatMap((g) => (Array.isArray(g?.mojabibliaRefs) ? g.mojabibliaRefs : []));
  const mbCandidateRefs = [...new Set([...extractAllScriptureRefs(effectiveMessage), ...guideRefs])].slice(0, 3);
  const mojabibliaVerses = await resolveMojaBibliaVerses(mbCandidateRefs, env, deps);
  const publicMojabibliaVerses = mojabibliaVerses.map(({ allWords: _all, ...rest }) => rest);

  if (publicMojabibliaVerses.length && !sources.some((s) => s.url.includes('/mojabiblia'))) {
    sources.unshift({
      title: `MojaBiblia Interlinear — ${publicMojabibliaVerses[0].shortRef}`,
      url: publicMojabibliaVerses[0].interlinearUrl,
      snippet: 'Tekst biblijny UBG wraz z greckim/hebrajskim oryginałem i kodami Stronga.',
      type: 'scripture'
    });
    if (sources.length > 4) sources.length = 4;
  }

  const workspaceActions = planWorkspaceActions(effectiveMessage, { connectedApps });

  // CC Connect 2.0: Dwukierunkowy kontekst z aplikacji (np. SBA, MojaBiblia, Kazania)
  const incomingContext = payload.context && typeof payload.context === 'object' ? payload.context : null;
  let activeContextSnapshot = null;
  const contextActions = [];

  if (incomingContext && incomingContext.bible) {
    const bReq = incomingContext.bible;
    if (bReq.book && bReq.chapter && (bReq.verseStart || bReq.verse)) {
      const vTarget = bReq.verseStart || bReq.verse;
      const bRes = await ccBibleGetVerse({
        book: bReq.book,
        chapter: bReq.chapter,
        verse: vTarget,
        translation: bReq.translation || 'UBG'
      }, env, deps);

      if (bRes && bRes.ok) {
        activeContextSnapshot = {
          schemaVersion: 1,
          appId: incomingContext.appId || 'scroll-bible',
          route: incomingContext.route || '/sba',
          contextType: incomingContext.contextType || 'bible-verse',
          reference: `${bRes.book} ${bRes.chapter}:${bRes.verse}`,
          bookCode: bRes.bookCode,
          chapter: bRes.chapter,
          verse: bRes.verse,
          text: bRes.text,
          translation: 'UBG',
          deepStudyUrl: bRes.deepStudyUrl,
          sourceUrl: bRes.sourceUrl
        };
        scriptureHits.unshift({
          reference: `${bRes.book} ${bRes.chapter}:${bRes.verse}`,
          translation: 'Uwspółcześniona Biblia Gdańska (UBG)',
          license: 'UBG_AUTHORIZED',
          topic: 'Aktywny werset z aplikacji',
          text: bRes.text,
          canonical_url: bRes.sourceUrl
        });
        contextActions.push({
          label: `Głębokie studium: ${bRes.book} ${bRes.chapter}:${bRes.verse}`,
          url: bRes.deepStudyUrl,
          target: '_blank',
          type: 'deep-study'
        });
        contextActions.push({
          label: `Scrolluj Biblię: ${bRes.book} ${bRes.chapter}`,
          url: bRes.sourceUrl,
          target: '_blank',
          type: 'open-app'
        });
      }
    }
  }

  const toolsUsed = [...tools];
  if (sources.length || contextGuides.length) toolsUsed.push('cc_search');
  if (scriptureHits.length) toolsUsed.push('cc_find_scripture');
  if (activeContextSnapshot) toolsUsed.push('cc_bible_get_verse');
  if (/gł[eę]boki[e|ego]|studium|zbadaj werset|analiza/i.test(effectiveMessage) && (activeContextSnapshot || detectedRefs.length)) {
    toolsUsed.push('cc_sba_deep_study');
  }
  if (publicMojabibliaVerses.length) toolsUsed.push('mojabiblia_interlinear');
  if (media.length) toolsUsed.push('cc_media_hub');
  if (workspaceActions.length) toolsUsed.push('cc_workspace_tools');

  // CC Bible Scholar deterministic tooling (honoruje aktywne wtyczki i bramki licencyjne)
  const sessionActivePlugins = Array.isArray(payload.activePlugins) ? sanitizePluginIds(payload.activePlugins) : null;
  let scholarData = null;
  const strongMatch = effectiveMessage.match(/\b([GH]\d{1,5}[a-z]?)\b/i);
  const targetRefStr = activeContextSnapshot?.reference || detectedRefs[0] || mbCandidateRefs[0] || '';

  if (strongMatch && isToolAllowedForSession('cc_bible_lexicon_lookup', sessionActivePlugins).allowed) {
    const lex = await ccBibleLexiconLookup({ strongId: strongMatch[1] }, env, deps);
    if (lex?.found) {
      scholarData = scholarData || {};
      scholarData.lexicon = lex;
      toolsUsed.push('cc_bible_lexicon_lookup');
    }
  }
  if (/odsy[łl]acz|cross[- ]?ref|powi[ąa]zan/i.test(effectiveMessage) && targetRefStr && isToolAllowedForSession('cc_bible_cross_references', sessionActivePlugins).allowed) {
    const xrefs = await ccBibleCrossReferences({ reference: targetRefStr, limit: 8 }, env, deps);
    if (xrefs?.found) {
      scholarData = scholarData || {};
      scholarData.crossReferences = xrefs;
      toolsUsed.push('cc_bible_cross_references');
    }
  }
  const concMatch = effectiveMessage.match(/konkordanc\w*\s+(?:dla|słowa|slowa|w\s+ubg)?\s*[„"']?([A-Za-zżźćńółęąśŻŹĆĄŚĘŁÓŃ0-9 -]{2,40})[”"']?/i);
  if (concMatch && isToolAllowedForSession('cc_bible_concordance', sessionActivePlugins).allowed) {
    const conc = await ccBibleConcordance({ query: concMatch[1].trim(), limit: 5 }, env, deps);
    if (conc?.found) {
      scholarData = scholarData || {};
      scholarData.concordance = conc;
      toolsUsed.push('cc_bible_concordance');
    }
  }
  const methodHit = /12 pyta[ńn]|dwana[śs]cie pyta[ńn]/i.test(effectiveMessage)
    ? 'twelve-questions'
    : (/6 pyta[ńn]|sze[śs][ćc] pyta[ńn]|wielka sz[óo]stka/i.test(effectiveMessage)
      ? 'six-questions'
      : (/hermeneut|kontekst/i.test(effectiveMessage) && /studium|metod/i.test(effectiveMessage)
        ? 'hermeneutics'
        : (/zastosowan/i.test(effectiveMessage) && /studium|werset/i.test(effectiveMessage) ? 'life-application' : '')));
  if (methodHit && isToolAllowedForSession('cc_bible_study_questions', sessionActivePlugins).allowed) {
    const sq = await ccBibleStudyQuestions({ method: methodHit, reference: targetRefStr }, env, deps);
    if (sq?.found) {
      scholarData = scholarData || {};
      scholarData.studyQuestions = sq;
      toolsUsed.push('cc_bible_study_questions');
    }
  }

  const responseDepth = normalizeResponseDepth(payload.responseDepth);
  const maxOutputTokens = responseDepth === 'fast' ? 700 : responseDepth === 'deep' ? 2200 : 1400;
  const systemInstruction = buildSystemInstruction({
    assistant,
    mode,
    moduleName,
    sources,
    scriptureHits,
    mojabibliaVerses,
    contextGuides,
    todayReflection,
    media,
    memoryNotes,
    userPersonalization,
    workspaceActions,
    connectedApps,
    privateMode,
    tools: toolsUsed,
    voiceConversation: Boolean(payload.voiceConversation),
    responseDepth
  });
  const userPrompt = buildUserMessageWithAttachment(effectiveMessage, attachmentName, attachmentText);
  const fetchImpl = deps.fetch || fetch;
  const diagnostics = [];
  const ownerSession = deps.ownerSession || null;
  const geminiPool = sharedAiReady(env) ? [env.AI_SHARED_FREE_GEMINI_KEY] : [];
  const requestedModel = resolvePreferredFreeModel(payload, env);
  const preferGeminiModel = requestedModel === 'auto'
    ? (env.GEMINI_MODEL || 'gemini-3.5-flash-lite')
    : requestedModel;

  let aiResult = null;
  let providerAttempted = false;
  if (!privateMode && userByok && userByok.apiKey && userByok.provider && payload.preferredModel === 'byok' && payload.byokConsent === true) {
    providerAttempted = true;
    aiResult = await runUserByokProvider(
      { provider: userByok.provider, apiKey: userByok.apiKey, userModel: payload.userModel },
      systemInstruction,
      history,
      userPrompt,
      fetchImpl,
      diagnostics
    );
  }

  if (!aiResult && !payload.privateMode && payload.preferredModel !== 'byok' &&
      (requestedModel === 'auto' || requestedModel === SHARED_MODEL) &&
      await reserveSharedAiAttempt(env)) {
    providerAttempted = true;
    aiResult = await callGeminiChat(geminiPool, SHARED_MODEL, systemInstruction, history, userPrompt, fetchImpl, diagnostics, { maxOutputTokens });
  }

  if (aiResult && aiResult.reply) {
    return {
      ok: true,
      reply: aiResult.reply,
      provider: aiResult.provider,
      modelUsed: aiResult.model || preferGeminiModel || 'gemini-3.5-flash-lite',
      modelRequested: requestedModel,
      modelSelectionMode: requestedModel === 'auto' ? 'auto' : 'preferred',
      responseDepth,
      ownerActive: Boolean(ownerSession?.isOwner),
      assistant: assistantMeta,
      mode,
      module: moduleName,
      sources,
      media,
      workspaceActions,
      contextSnapshot: activeContextSnapshot,
      scholarData,
      actions: [...contextActions, ...(Array.isArray(workspaceActions) ? workspaceActions : [])],
      mojabibliaVerses: publicMojabibliaVerses,
      scriptureRefs: scriptureHits.map((s) => s.reference),
      toolsUsed: [...new Set(toolsUsed)],
      zeroCostGuaranteed: false
    };
  }

  return {
    ok: true,
    reply: buildKnowledgeHubFallback({
      assistant,
      mode,
      message: effectiveMessage,
      scriptureHits,
      mojabibliaVerses: publicMojabibliaVerses,
      contextGuides,
      todayReflection,
      sources,
      media,
      workspaceActions,
      activeContext: activeContextSnapshot,
      scholarData
    }),
    provider: 'cc-knowledge-hub',
    modelUsed: 'cc-knowledge-hub',
    modelRequested: requestedModel,
    modelSelectionMode: requestedModel === 'auto' ? 'auto' : 'preferred',
    responseDepth,
    providerDiagnostic: requestedModel === 'cc-knowledge-hub'
      ? 'selected:cc-knowledge-hub'
      : (diagnostics.length ? diagnostics.join(',') : (geminiPool.length ? 'gemini:unavailable' : 'no_key')),
    ownerActive: Boolean(ownerSession?.isOwner),
    assistant: assistantMeta,
    mode,
    module: moduleName,
    sources,
    media,
    workspaceActions,
    contextSnapshot: activeContextSnapshot,
    actions: [...contextActions, ...(Array.isArray(workspaceActions) ? workspaceActions : [])],
    mojabibliaVerses: publicMojabibliaVerses,
    scriptureRefs: scriptureHits.map((s) => s.reference),
    toolsUsed: [...new Set(toolsUsed)],
    zeroCostGuaranteed: !providerAttempted
  };
}

export async function handleAiChatRequest(request, env = {}, deps = {}) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method === 'GET') {
    const docs = getCanonicalDocuments();
    const hubs = getAllEcosystemHubs();
    const poolSize = sharedAiReady(env) ? 1 : 0;
    return Response.json(
      {
        ok: true,
        service: 'ai-dla-jezusa-chat',
        indexDocuments: docs.length,
        zeroCostGuaranteed: false,
        sharedModelsEnabled: sharedAiReady(env),
        geminiKeyPoolSize: poolSize,
        youtubeApi: Boolean(env.YT_API_KEY),
        availableModels: buildAvailableFreeModels(env),
        ecosystemApps: CC_ECOSYSTEM_APPS,
        assistants: hubs.assistants,
        hubs,
        providersConfigured: {
          gemini: poolSize > 0,
          geminiKeyPoolSize: poolSize,
          youtubeApi: Boolean(env.YT_API_KEY),
          groq: Boolean(env.GROQ_API_KEY),
          workersAi: Boolean(env.AI && typeof env.AI.run === 'function'),
          byokSupported: ['gemini', 'openrouter', 'groq', 'openai'],
          knowledgeHubFallback: true
        }
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
          ...CORS_HEADERS
        }
      }
    );
  }

  if (request.method !== 'POST') {
    return Response.json(
      { ok: false, error: 'method_not_allowed', detail: 'Obsługiwane są wyłącznie zapytania GET i POST.' },
      { status: 405, headers: { ...CORS_HEADERS, Allow: 'GET, POST, OPTIONS' } }
    );
  }

  if (request.headers.get('Origin') !== new URL(request.url).origin) {
    return Response.json({ ok: false, error: 'origin_not_allowed' }, {
      status: 403, headers: { 'Cache-Control': 'no-store' }
    });
  }
  const ownerSession = await verifyOwnerFromRequest(request, deps);
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'anon';
  if (!checkRate(ip, ownerSession?.isOwner ? OWNER_REQ_PER_MIN : MAX_REQ_PER_MIN)) {
    return Response.json(
      { ok: false, error: 'rate_limit_exceeded', detail: 'Zbyt wiele zapytań w ciągu minuty. Odczekaj chwilę i spróbuj ponownie.' },
      { status: 429, headers: { ...CORS_HEADERS, 'Retry-After': '60', 'Cache-Control': 'no-store' } }
    );
  }

  const rawText = await readLimitedText(request, MAX_BODY_BYTES);
  if (rawText === null) {
    return Response.json(
      { ok: false, error: 'payload_too_large', detail: 'Wiadomość wraz z załącznikiem przekracza limit 24 KB.' },
      { status: 413, headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' } }
    );
  }

  let body;
  try {
    body = JSON.parse(rawText);
  } catch {
    return Response.json(
      { ok: false, error: 'invalid_json', detail: 'Nieprawidłowy format JSON żądania.' },
      { status: 400, headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' } }
    );
  }

  const userKey = (request.headers.get('X-User-AI-Key') || '').trim().slice(0, 256);
  const userProvider = (request.headers.get('X-User-AI-Provider') || '').trim().slice(0, 32);
  const mergedDeps = {
    ...deps,
    ownerSession,
    userByok: userKey && userProvider ? { provider: userProvider, apiKey: userKey } : deps.userByok
  };

  const result = await processAiChat(body || {}, env, mergedDeps);
  return Response.json(result, {
    status: result.ok ? 200 : 400,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-CC-Zero-Cost-Mode': 'active',
      ...CORS_HEADERS
    }
  });
}

const ALLOWED_AUDIO_MIMES = new Set([
  'audio/webm',
  'audio/mp4',
  'audio/ogg',
  'audio/wav',
  'audio/x-wav',
  'audio/mpeg'
]);
const MAX_TRANSCRIBE_BYTES = 2.5 * 1024 * 1024;

export async function handleAiTranscribeRequest(request, env = {}, deps = {}) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method !== 'POST') {
    return Response.json(
      { ok: false, error: 'method_not_allowed', detail: 'Obsługiwane jest wyłącznie POST.' },
      { status: 405, headers: { ...CORS_HEADERS, Allow: 'POST, OPTIONS' } }
    );
  }

  if (request.headers.get('Origin') !== new URL(request.url).origin) {
    return Response.json({ ok: false, error: 'origin_not_allowed' }, {
      status: 403, headers: { 'Cache-Control': 'no-store' }
    });
  }
  const ownerSession = await verifyOwnerFromRequest(request, deps);
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'anon';
  if (!checkRate(ip, ownerSession?.isOwner ? OWNER_REQ_PER_MIN : MAX_REQ_PER_MIN)) {
    return Response.json(
      { ok: false, error: 'rate_limit_exceeded', detail: 'Zbyt wiele zapytań transkrypcji.' },
      { status: 429, headers: { ...CORS_HEADERS, 'Retry-After': '60', 'Cache-Control': 'no-store' } }
    );
  }

  const rawText = await readLimitedText(request, MAX_TRANSCRIBE_BYTES);
  if (rawText === null) {
    return Response.json(
      { ok: false, error: 'payload_too_large', detail: 'Nagranie audio jest zbyt długie.' },
      { status: 413, headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' } }
    );
  }

  let body;
  try {
    body = JSON.parse(rawText);
  } catch {
    return Response.json(
      { ok: false, error: 'invalid_json', detail: 'Nieprawidłowy JSON żądania.' },
      { status: 400, headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' } }
    );
  }

  const audioBase64 = String(body?.audioBase64 || '').replace(/^data:[^;]+;base64,/, '').trim();
  const baseMime = String(body?.mimeType || 'audio/webm').split(';')[0].trim().toLowerCase();
  const mimeType = ALLOWED_AUDIO_MIMES.has(baseMime) ? baseMime : 'audio/webm';
  if (!audioBase64 || audioBase64.length < 32) {
    return Response.json(
      { ok: false, error: 'empty_audio', detail: 'Brak danych audio do transkrypcji.' },
      { status: 400, headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' } }
    );
  }

  const keys = sharedAiReady(env) ? [env.AI_SHARED_FREE_GEMINI_KEY] : [];
  if (!keys.length || body?.privateMode || !await reserveSharedAiAttempt(env)) {
    return Response.json(
      { ok: false, error: 'no_speech_engine', detail: 'Brak skonfigurowanej puli AI do transkrypcji.' },
      { status: 503, headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' } }
    );
  }

  const fetchImpl = deps.fetch || fetch;
  const models = [SHARED_MODEL];
  for (const model of models) {
    for (let i = 0; i < Math.min(keys.length, 2); i += 1) {
      const apiKey = keys[i];
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 9000);
      try {
        const res = await fetchImpl(endpoint, {
          method: 'POST',
          signal: ctrl.signal,
          redirect: 'manual',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [
                { text: 'Dokładnie przepisz wypowiedź z nagrania audio po polsku. Zwróć wyłącznie czysty tekst transkrypcji bez komentarzy ani znaczników. Jeśli nagranie jest puste lub niesłyszalne, zwróć pusty napis.' },
                { inlineData: { mimeType, data: audioBase64 } }
              ]
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 320 }
          })
        });
        if (!res.ok) continue;
        const data = await res.json();
        const parts = data?.candidates?.[0]?.content?.parts;
        const text = Array.isArray(parts) ? parts.map((p) => p?.text || '').join('').trim() : '';
        return Response.json(
          { ok: true, text, provider: 'gemini-audio', modelUsed: model },
          { headers: { 'Cache-Control': 'no-store', ...CORS_HEADERS } }
        );
      } catch {
        // próba kolejnego klucza/modelu
      } finally {
        clearTimeout(timer);
      }
    }
  }

  return Response.json(
    { ok: false, error: 'transcribe_unavailable', detail: 'Nie udało się rozpoznać mowy po stronie serwera.' },
    { status: 503, headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' } }
  );
}
