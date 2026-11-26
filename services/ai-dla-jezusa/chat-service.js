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

const MAX_REQ_PER_MIN = 20;
const RATE_WINDOW_MS = 60_000;
const DAILY_AI_CALL_CAP = 600;
const MAX_BODY_BYTES = 24 * 1024;

const ipBuckets = new Map();
let quotaState = { day: new Date().toISOString().slice(0, 10), calls: 0 };

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, X-Requested-With, X-User-AI-Key, X-User-AI-Provider',
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
}

function checkRate(ip = 'anon', now = Date.now()) {
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
  if (entry.count >= MAX_REQ_PER_MIN) return false;
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

function buildSystemInstruction({ mode, moduleName, sources, scriptureHits, memoryNotes, privateMode, tools }) {
  const modeNote = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS['CC Auto'];
  const lines = [
    'Jesteś asystentem „AI dla Jezusa” w ekosystemie Christian Culture (polskieradio.cc).',
    'Misja: Technologia w służbie dobra. Jezus w centrum.',
    `Aktualny tryb pracy: ${mode} (${moduleName || 'Czat'}). ${modeNote}`,
    'Zasady bezwzględne (Sola Scriptura & Zero-QA):',
    '1. Odpowiadaj po polsku, ciepło, mądrze i rzeczowo, stosując przejrzysty Markdown (nagłówki ##/###, listy, cytaty >).',
    '2. Wszelkie dosłowne cytaty biblijne podawaj wyłącznie w brzmieniu Uwspółcześnionej Biblii Gdańskiej (UBG), oznaczając siglum i przekład (np. Prz 3,5 UBG). Nigdy nie zmyślaj treści wersetów.',
    '3. Nigdy nie podszywaj się pod Jezusa Chrystusa ani pod Boga — pomagasz jako chrześcijańskie narzędzie AI.',
    '4. Jeśli korzystasz z dostarczonych dokumentów Christian Culture, przywołuj wyłącznie prawdziwe tytuły i linki z kontekstu poniżej.'
  ];

  if (Array.isArray(tools) && tools.length) {
    lines.push(`Aktywne narzędzia użytkownika: ${tools.join(', ')}.`);
  }

  if (!privateMode && Array.isArray(memoryNotes) && memoryNotes.length) {
    lines.push('Zapisane wskazówki pamięci użytkownika (kontekst pomocniczy):\n- ' + memoryNotes.join('\n- '));
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

  return lines.join('\n\n');
}

function buildUserMessageWithAttachment(message, attachmentName, attachmentText) {
  if (!attachmentText) return message;
  const safeName = attachmentName ? `„${attachmentName}”` : 'załączonego pliku';
  return `${message}\n\n---\nTreść ${safeName} do analizy:\n${attachmentText}`;
}

async function callGeminiChat(apiKey, preferredModel, systemInstruction, history, userPrompt, fetchImpl = fetch, diagnostics = []) {
  if (!apiKey) return null;
  const models = [...new Set([
    preferredModel || 'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash'
  ].filter(Boolean))];

  const contents = history.map((h) => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.text }]
  }));
  contents.push({ role: 'user', parts: [{ text: userPrompt }] });

  for (const model of models) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
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

function buildKnowledgeHubFallback({ message, scriptureHits, sources }) {
  const parts = [];
  parts.push('### Odpowiedź z Bazy Wiedzy Christian Culture');
  parts.push('Połączenie z modelem generatywnym jest obecnie niedostępne, więc przedstawiam zweryfikowane materiały bezpośrednio z indeksu Christian Culture.');

  if (scriptureHits.length) {
    for (const s of scriptureHits) {
      parts.push(`> „${s.text}” — **${s.reference}** (${s.translation})`);
    }
  }

  if (sources.length) {
    parts.push('**Powiązane opracowania i narzędzia CC:**');
    for (const doc of sources) {
      parts.push(`- **${doc.title}**${doc.snippet ? ` — ${doc.snippet}` : ''}`);
    }
  } else {
    parts.push(`Dla zapytania „${message}” nie znaleziono bezpośredniego dopasowania w lokalnym indeksie, ale możesz otworzyć pełne Pismo Święte w **MojaBiblia (UBG)** albo skorzystać z modułu **Biblia** w panelu bocznym.`);
  }

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
      reply: 'Jestem narzędziem „AI dla Jezusa” Christian Culture — pomagam w studiowaniu Pisma Świętego, tworzeniu wartościowych treści oraz pracy z dokumentami. W czym mogę Ci dziś pomóc?',
      provider: 'guard',
      mode,
      module: moduleName,
      sources: [],
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

  const detectedRefs = extractScriptureRefs(effectiveMessage).slice(0, 2);
  const scriptureHits = [];
  for (const ref of detectedRefs) {
    const found = findScripture(ref);
    if (found) scriptureHits.push(found);
  }

  const toolsUsed = [...tools];
  if (sources.length) toolsUsed.push('cc_search');
  if (scriptureHits.length) toolsUsed.push('cc_find_scripture');

  const systemInstruction = buildSystemInstruction({
    mode,
    moduleName,
    sources,
    scriptureHits,
    memoryNotes,
    privateMode,
    tools: toolsUsed
  });
  const userPrompt = buildUserMessageWithAttachment(effectiveMessage, attachmentName, attachmentText);
  const fetchImpl = deps.fetch || fetch;
  const diagnostics = [];

  let aiResult = null;
  if (userByok && userByok.apiKey && userByok.provider) {
    aiResult = await runUserByokProvider(
      { provider: userByok.provider, apiKey: userByok.apiKey, userModel: payload.userModel },
      systemInstruction,
      history,
      userPrompt,
      fetchImpl,
      diagnostics
    );
  }

  if (!aiResult && canUseDailyQuota()) {
    aiResult =
      (await callGeminiChat(env.GEMINI_API_KEY, env.GEMINI_MODEL, systemInstruction, history, userPrompt, fetchImpl, diagnostics)) ||
      (await callOpenAiCompatibleChat(
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
      )) ||
      (await callWorkersAiChat(env, systemInstruction, history, userPrompt, diagnostics));
    if (aiResult && aiResult.reply) {
      recordQuotaUsage();
    }
  }

  if (aiResult && aiResult.reply) {
    return {
      ok: true,
      reply: aiResult.reply,
      provider: aiResult.provider,
      mode,
      module: moduleName,
      sources,
      scriptureRefs: scriptureHits.map((s) => s.reference),
      toolsUsed: [...new Set(toolsUsed)],
      zeroCostGuaranteed: true
    };
  }

  return {
    ok: true,
    reply: buildKnowledgeHubFallback({ message: effectiveMessage, scriptureHits, sources }),
    provider: 'cc-knowledge-hub',
    providerDiagnostic: diagnostics.length ? diagnostics.join(',') : (env.GEMINI_API_KEY ? 'gemini:unavailable' : 'no_key'),
    mode,
    module: moduleName,
    sources,
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
    return Response.json(
      {
        ok: true,
        service: 'ai-dla-jezusa-chat',
        indexDocuments: docs.length,
        zeroCostGuaranteed: true,
        providersConfigured: {
          gemini: Boolean(env.GEMINI_API_KEY),
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

  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'anon';
  if (!checkRate(ip)) {
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
