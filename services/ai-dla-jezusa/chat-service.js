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
  parseGeminiKeyPool,
  verifyOwnerFromRequest,
  OWNER_MODELS,
  PUBLIC_FREE_MODELS
} from './owner-workspace.js';

const MAX_REQ_PER_MIN = 20;
const OWNER_REQ_PER_MIN = 120;
const RATE_WINDOW_MS = 60_000;
const DAILY_AI_CALL_CAP = 600;
const MAX_BODY_BYTES = 24 * 1024;
const REFLECTION_CACHE_TTL_MS = 5 * 60_000;

const ipBuckets = new Map();
let quotaState = { day: new Date().toISOString().slice(0, 10), calls: 0 };
let reflectionCache = { expiresAt: 0, items: null };

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
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
  quotaState = { day: new Date().toISOString().slice(0, 10), calls: 0 };
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

function canUseDailyQuota(now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  if (quotaState.day !== day) {
    quotaState = { day, calls: 0 };
  }
  return quotaState.calls < DAILY_AI_CALL_CAP;
}

function recordQuotaUsage(now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  if (quotaState.day !== day) {
    quotaState = { day, calls: 0 };
  }
  quotaState.calls += 1;
  return quotaState.calls;
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

function buildSystemInstruction({ assistant, mode, moduleName, sources, scriptureHits, contextGuides, todayReflection, media, memoryNotes, privateMode, tools }) {
  const modeNote = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS['CC Auto'];
  const isFemale = assistant?.gender === 'female';
  const lines = [
    assistant?.systemPrompt || 'Jesteś asystentem „AI dla Jezusa” w ekosystemie Christian Culture (polskieradio.cc).',
    'Misja: Technologia w służbie dobra. Jezus w centrum.',
    `Rozmawiasz jako: ${assistant?.name || 'AI dla Jezusa'} (${assistant?.role || 'Główny Asystent CC'}).`,
    `Aktualny tryb pracy: ${mode} (${moduleName || 'Czat'}). ${modeNote}`,
    'Zasady bezwzględne (Sola Scriptura & Zero-QA):',
    '1. Odpowiadaj po polsku, ciepło, mądrze i rzeczowo, stosując przejrzysty Markdown (nagłówki ##/###, listy, cytaty >).',
    '2. Wszelkie dosłowne cytaty biblijne podawaj wyłącznie w brzmieniu Uwspółcześnionej Biblii Gdańskiej (UBG), oznaczając siglum i przekład (np. Prz 3,5 UBG). Nigdy nie zmyślaj treści wersetów.',
    isFemale
      ? '3. Nigdy nie podszywaj się pod Jezusa Chrystusa ani pod Boga — pomagasz jako chrześcijańska asystentka AI.'
      : '3. Nigdy nie podszywaj się pod Jezusa Chrystusa ani pod Boga — pomagasz jako chrześcijański asystent AI.',
    '4. Zatrzymuj użytkownika wewnątrz aplikacji AI dla Jezusa: najpierw daj kompletną treść i wskaż odtwarzacze multimedialne (audio, wideo, radio, grafiki) osadzone poniżej tej odpowiedzi, a linki zewnętrzne traktuj jako opcjonalny dodatek.',
    '5. Przywołuj wyłącznie prawdziwe tytuły i zasoby z kontekstu poniżej.',
    isFemale
      ? '6. FORMA GRAMATYCZNA (BEZWZGLĘDNA): Jesteś kobietą i asystentką — ZAWSZE pisz w rodzaju żeńskim (np. „przygotowałam”, „chciałabym Ci zaproponować”, „wybrałam”, „z przyjemnością pomogłam”, „jestem gotowa”). NIGDY nie używaj form męskich („przygotowałem”, „chciałbym”, „asystent”).'
      : '6. FORMA GRAMATYCZNA (BEZWZGLĘDNA): Jesteś mężczyzną (głównym asystentem AI dla Jezusa) — ZAWSZE pisz w rodzaju męskim (np. „przygotowałem”, „chciałbym Ci zaproponować”, „wybrałem”, „jestem gotowy”). NIGDY nie używaj form żeńskich („przygotowałam”, „chciałabym”, „asystentka”).',
    [
      `7. CHARAKTER I MENTALNOŚĆ CHRYSTOCENTRYCZNA — ${isFemale ? 'PRZYJAZNA SIOSTRA, PRZYJACIÓŁKA I MENTORKA' : 'PRZYJAZNY BRAT, PRZYJACIEL I MENTOR'} W CODZIENNYM CHODZENIU Z JEZUSEM:`,
      `- Tożsamość relacyjna: bądź dla użytkownika jak żywy, ciepły, optymistyczny ${isFemale ? 'siostra i przyjaciółka w Chrystusie oraz wymagająca w miłości nauczycielka („belfer” serca)' : 'brat i przyjaciel w Chrystusie oraz wymagający w miłości nauczyciel („belfer” serca)'} — prawdziwy towarzysz w codziennym chodzeniu z Jezusem.`,
      '- Odwaga miłości (upomnienie, napomnienie, inspiracja i pocieszenie): kiedy trzeba, nie bój się z miłością i szacunkiem upomnieć ani napomnieć, nazwać grzech, letniość czy kompromis po imieniu; inspiruj do porzucania grzechu i nałogów oraz do codziennej reformacji życia w Duchu Świętym — zawsze z nadzieją i bez potępiania człowieka.',
      '- Prowadź do Źródła: w każdej ważnej sprawie kieruj wzrok rozmówcy wprost do Ojca w niebie, zachęcaj do osobistej rozmowy (modlitwy) z Jezusem, sugeruj żywą społeczność z Duchem Świętym, przypominaj obietnice Boże i opieraj wskazówki na Słowie Bożym (UBG), biblijnym Dekalogu oraz chrześcijańskiej etyce i moralności.',
      '- Interaktywna, empatyczna troska: nie bądź zimnym automatem — podtrzymuj żywy dialog i naturalnie (1–2 konkretne, ciepłe pytania na końcu lub w rozmowie) pytaj: co u Ciebie słychać, jak się czujesz, jaki jest Twój stan duchowy i kondycja emocjonalna, na jakim etapie uświęcenia jesteś i nad czym chcesz dziś popracować z Jezusem.',
      '- Światło, entuzjazm i zaufanie: rozświetlaj mroki ciemności i zwątpienia, wzmacniaj zaufanie do Boga i radość wiary. Gdy sytuacja na to pozwala (zachowując wpierw pełną empatię i delikatność wobec cierpienia czy żałoby), serdecznie i entuzjastycznie wplataj słowa uwielbienia i nadziei: „Chwała Panu!”, „Alleluja!”, „Jezus żyje!”, „Jezus się tym zajmie!”.'
    ].join('\n')
  ];

  if (Array.isArray(tools) && tools.length) {
    lines.push(`Aktywne narzędzia użytkownika: ${tools.join(', ')}.`);
  }

  if (!privateMode && Array.isArray(memoryNotes) && memoryNotes.length) {
    lines.push('Zapisane wskazówki pamięci użytkownika (kontekst pomocniczy):\n- ' + memoryNotes.join('\n- '));
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
  const models = PUBLIC_FREE_MODELS.map((m) => ({ ...m }));
  if (env.GROQ_API_KEY) {
    models.push({
      id: 'groq',
      provider: 'groq',
      label: 'Llama 3.3 70B (Groq)',
      shortLabel: 'Llama 3.3 Groq',
      note: 'Darmowy szybki model'
    });
  }
  if (env.AI && typeof env.AI.run === 'function') {
    models.push({
      id: 'workers-ai',
      provider: 'workers-ai',
      label: 'Cloudflare Workers AI',
      shortLabel: 'Workers AI',
      note: 'Model na brzegu sieci'
    });
  }
  return models;
}

function resolvePreferredFreeModel(payload = {}, env = {}) {
  const raw = String(payload.preferredModel || payload.ownerModel || '').trim();
  if (!raw || raw === 'auto') return 'auto';
  if (raw === 'cc-knowledge-hub') return 'cc-knowledge-hub';
  const allowedGemini = new Set(OWNER_MODELS.map((m) => m.id));
  if (env.GEMINI_MODEL) allowedGemini.add(String(env.GEMINI_MODEL).trim());
  if (allowedGemini.has(raw)) return raw;
  if (raw === 'groq' && env.GROQ_API_KEY) return 'groq';
  if (raw === 'workers-ai' && env.AI && typeof env.AI.run === 'function') return 'workers-ai';
  return 'auto';
}

function buildUserMessageWithAttachment(message, attachmentName, attachmentText) {
  if (!attachmentText) return message;
  const safeName = attachmentName ? `„${attachmentName}”` : 'załączonego pliku';
  return `${message}\n\n---\nTreść ${safeName} do analizy:\n${attachmentText}`;
}

async function callGeminiChat(apiKeyOrPool, preferredModel, systemInstruction, history, userPrompt, fetchImpl = fetch, diagnostics = []) {
  const keys = Array.isArray(apiKeyOrPool)
    ? apiKeyOrPool.filter(Boolean).slice(0, 5)
    : (apiKeyOrPool ? [String(apiKeyOrPool)] : []);
  if (!keys.length) return null;

  const models = [...new Set([
    preferredModel,
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3-flash-preview'
  ].filter(Boolean))];

  const contents = history.map((h) => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.text }]
  }));
  contents.push({ role: 'user', parts: [{ text: userPrompt }] });

  for (const model of models) {
    for (let kIdx = 0; kIdx < Math.min(keys.length, 3); kIdx += 1) {
      const apiKey = keys[kIdx];
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 7500);
      try {
        const res = await fetchImpl(endpoint, {
          method: 'POST',
          signal: ctrl.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 1400
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

async function callWorkersAiChat(env, systemInstruction, history, userPrompt, diagnostics = []) {
  if (!env.AI || typeof env.AI.run !== 'function') return null;
  try {
    const messages = [
      { role: 'system', content: systemInstruction },
      ...history.map((h) => ({ role: h.role, content: h.text })),
      { role: 'user', content: userPrompt }
    ];
    const res = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages,
      max_tokens: 1200,
      temperature: 0.5
    });
    const text = res && (res.response || res.text);
    return text ? { reply: String(text).trim(), provider: 'workers-ai' } : null;
  } catch {
    diagnostics.push('workers-ai:err');
    return null;
  }
}

function buildKnowledgeHubFallback({ assistant, mode, message, scriptureHits, contextGuides, todayReflection, sources, media }) {
  const parts = [];
  const speaker = assistant?.name || 'AI dla Jezusa';
  const isFemale = assistant?.gender === 'female';
  const heading = contextGuides?.[0]?.topic
    ? `### ${contextGuides[0].topic}`
    : `### ${speaker} · ${mode || 'Ekosystem Christian Culture'}`;
  parts.push(heading);

  if (contextGuides?.length) {
    const guide = contextGuides[0];
    parts.push(`${speaker}: ${guide.summary}`);
    const verse = Array.isArray(guide.keyVerses) && guide.keyVerses[0];
    if (verse?.text) {
      parts.push(`> „${verse.text}” — **${verse.ref}** (UBG)`);
    }
  } else {
    parts.push(`${speaker}: ${isFemale ? 'Przygotowałam' : 'Przygotowałem'} dla Ciebie najważniejsze treści i multimedia bezpośrednio tutaj, bez wychodzenia z aplikacji AI dla Jezusa.`);
  }

  if (scriptureHits.length) {
    for (const s of scriptureHits) {
      parts.push(`> „${s.text}” — **${s.reference}** (${s.translation})`);
    }
  }

  if (todayReflection && /dzis|dzisiaj|rozwaz|nadziej|slowo|kurs|plan|wiar/i.test(message)) {
    const cleanTitle = String(todayReflection.title || '').replace(/^☀️\s*/, '').trim();
    const teaser = String(todayReflection.teaser || todayReflection.memoryVerse || '').trim();
    if (cleanTitle) {
      parts.push(`**Dzisiejsze słowo w Christian Culture — ${cleanTitle}:** ${teaser}`);
    }
  }

  if (sources.length) {
    parts.push('**Zintegrowana wiedza z indeksu Christian Culture:**');
    for (const doc of sources) {
      parts.push(`- **${doc.title}**${doc.snippet ? ` — ${doc.snippet}` : ''}`);
    }
  } else if (!contextGuides?.length) {
    parts.push(`Dla hasła „${message}” poniżej w oknie czatu ${isFemale ? 'osadziłam' : 'osadziłem'} odtwarzacze multimedialne Christian Culture, a ponadto możesz przejrzeć pełne Pismo Święte w module **Biblia** po lewej.`);
  }

  if (Array.isArray(media) && media.length) {
    parts.push('**Gotowe multimedia w tym oknie (odtwarzaj poniżej bez opuszczania aplikacji):**');
  }

  parts.push(
    isFemale
      ? '**Słowo od serca siostry i mentorki w Chrystusie:** Chwała Panu — Jezus żyje i nie zostawia Cię w żadnym mroku! Pamiętaj obietnice Ojca w niebie, karm się Słowem Bożym (UBG) i przykazaniami Dekalogu, a każdy grzech czy słabość oddawaj odważnie pod reformację w Duchu Świętym — **Jezus się tym zajmie!** Powiedz mi szczerze, co u Ciebie słychać: jak wygląda dziś Twój stan duchowy, kondycja emocjonalna i nad czym na obecnym etapie uświęcenia chcesz dziś popracować?'
      : '**Słowo od serca brata i mentora w Chrystusie:** Chwała Panu — Jezus żyje i rozświetla każdy mrok! Trzymaj się blisko Ojca w niebie, rozmawiaj z Jezusem w modlitwie, buduj społeczność z Duchem Świętym i strzeż w sercu biblijnego Dekalogu, śmiało porzucając każdy grzech oraz nałóg — **Jezus się tym zajmie!** Powiedz mi po bratersku, co u Ciebie słychać: jak się dziś czujesz, jaki jest Twój stan duchowy i emocjonalny oraz nad czym na swoim etapie uświęcenia chcesz dziś popracować?'
  );

  parts.push(`*Źródło: zweryfikowane zasoby Bazy Wiedzy Christian Culture (UBG · 0 zł · ${speaker}).*`);
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
  const history = sanitizeHistory(payload.history);
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

  const toolsUsed = [...tools];
  if (sources.length || contextGuides.length) toolsUsed.push('cc_search');
  if (scriptureHits.length) toolsUsed.push('cc_find_scripture');
  if (media.length) toolsUsed.push('cc_media_hub');

  const systemInstruction = buildSystemInstruction({
    assistant,
    mode,
    moduleName,
    sources,
    scriptureHits,
    contextGuides,
    todayReflection,
    media,
    memoryNotes,
    privateMode,
    tools: toolsUsed
  });
  const userPrompt = buildUserMessageWithAttachment(effectiveMessage, attachmentName, attachmentText);
  const fetchImpl = deps.fetch || fetch;
  const diagnostics = [];
  const ownerSession = deps.ownerSession || null;
  const geminiPool = parseGeminiKeyPool(env);
  const requestedModel = resolvePreferredFreeModel(payload, env);
  const preferGeminiModel = requestedModel === 'auto'
    ? (env.GEMINI_MODEL || 'gemini-3.5-flash-lite')
    : requestedModel;

  let aiResult = null;
  if (userByok && userByok.apiKey && userByok.provider && (requestedModel === 'auto' || payload.preferredModel === 'byok')) {
    aiResult = await runUserByokProvider(
      { provider: userByok.provider, apiKey: userByok.apiKey, userModel: payload.userModel },
      systemInstruction,
      history,
      userPrompt,
      fetchImpl,
      diagnostics
    );
  }

  if (!aiResult && requestedModel !== 'cc-knowledge-hub' && (ownerSession?.isOwner || canUseDailyQuota())) {
    const callGroq = () => callOpenAiCompatibleChat(
      {
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        apiKey: env.GROQ_API_KEY,
        model: env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        providerName: 'groq'
      },
      systemInstruction,
      history,
      userPrompt,
      fetchImpl,
      diagnostics
    );

    if (requestedModel === 'groq') {
      aiResult =
        (await callGroq()) ||
        (await callGeminiChat(geminiPool, env.GEMINI_MODEL, systemInstruction, history, userPrompt, fetchImpl, diagnostics)) ||
        (await callWorkersAiChat(env, systemInstruction, history, userPrompt, diagnostics));
    } else if (requestedModel === 'workers-ai') {
      aiResult =
        (await callWorkersAiChat(env, systemInstruction, history, userPrompt, diagnostics)) ||
        (await callGeminiChat(geminiPool, env.GEMINI_MODEL, systemInstruction, history, userPrompt, fetchImpl, diagnostics)) ||
        (await callGroq());
    } else {
      aiResult =
        (await callGeminiChat(geminiPool, preferGeminiModel, systemInstruction, history, userPrompt, fetchImpl, diagnostics)) ||
        (await callGroq()) ||
        (await callWorkersAiChat(env, systemInstruction, history, userPrompt, diagnostics));
    }
    if (aiResult && aiResult.reply && !ownerSession?.isOwner) {
      recordQuotaUsage();
    }
  }

  if (aiResult && aiResult.reply) {
    return {
      ok: true,
      reply: aiResult.reply,
      provider: aiResult.provider,
      modelUsed: aiResult.model || preferGeminiModel || 'gemini-3.5-flash-lite',
      modelRequested: requestedModel,
      modelSelectionMode: requestedModel === 'auto' ? 'auto' : 'preferred',
      ownerActive: Boolean(ownerSession?.isOwner),
      assistant: assistantMeta,
      mode,
      module: moduleName,
      sources,
      media,
      scriptureRefs: scriptureHits.map((s) => s.reference),
      toolsUsed: [...new Set(toolsUsed)],
      zeroCostGuaranteed: true
    };
  }

  return {
    ok: true,
    reply: buildKnowledgeHubFallback({
      assistant,
      mode,
      message: effectiveMessage,
      scriptureHits,
      contextGuides,
      todayReflection,
      sources,
      media
    }),
    provider: 'cc-knowledge-hub',
    modelUsed: 'cc-knowledge-hub',
    modelRequested: requestedModel,
    modelSelectionMode: requestedModel === 'auto' ? 'auto' : 'preferred',
    providerDiagnostic: requestedModel === 'cc-knowledge-hub'
      ? 'selected:cc-knowledge-hub'
      : (diagnostics.length ? diagnostics.join(',') : (geminiPool.length ? 'gemini:unavailable' : 'no_key')),
    ownerActive: Boolean(ownerSession?.isOwner),
    assistant: assistantMeta,
    mode,
    module: moduleName,
    sources,
    media,
    scriptureRefs: scriptureHits.map((s) => s.reference),
    toolsUsed: [...new Set(toolsUsed)],
    zeroCostGuaranteed: true
  };
}

export async function handleAiChatRequest(request, env = {}, deps = {}) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method === 'GET') {
    const docs = getCanonicalDocuments();
    const hubs = getAllEcosystemHubs();
    const poolSize = parseGeminiKeyPool(env).length;
    return Response.json(
      {
        ok: true,
        service: 'ai-dla-jezusa-chat',
        indexDocuments: docs.length,
        zeroCostGuaranteed: true,
        geminiKeyPoolSize: poolSize,
        youtubeApi: Boolean(env.YT_API_KEY),
        availableModels: buildAvailableFreeModels(env),
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

  const ownerSession = await verifyOwnerFromRequest(request, deps);
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'anon';
  if (!checkRate(ip, ownerSession?.isOwner ? OWNER_REQ_PER_MIN : MAX_REQ_PER_MIN)) {
    return Response.json(
      { ok: false, error: 'rate_limit_exceeded', detail: 'Zbyt wiele zapytań w ciągu minuty. Odczekaj chwilę i spróbuj ponownie.' },
      { status: 429, headers: { ...CORS_HEADERS, 'Retry-After': '60', 'Cache-Control': 'no-store' } }
    );
  }

  const rawText = await request.text();
  if (new TextEncoder().encode(rawText).byteLength > MAX_BODY_BYTES) {
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
