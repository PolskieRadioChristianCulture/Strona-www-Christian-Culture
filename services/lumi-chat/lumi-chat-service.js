// =========================================================================
// LUMI MESSENGER — SERWIS ASYSTENTEK CC (RUT, LEA, NOEMI)
// Standard ZERO COST FIRST: Gemini Free Tier -> Groq Free -> Workers AI
// -> Smart Catalog + Dzisiejsze Rozważanie Fallback (działa zawsze, 0 zł)
// =========================================================================

const MAX_REQ_PER_MIN = 20;
const RATE_WINDOW_MS = 60_000;
const DAILY_AI_CAP = 500;
const CACHE_TTL_MS = 5 * 60_000;

const ipBuckets = new Map();
let quotaState = { day: new Date().toISOString().slice(0, 10), used: 0 };
let dataCache = { expiresAt: 0, reflections: null, catalog: null };

const INJECTION_RE = [
  /ignore (?:all )?(?:previous|above) instructions/i,
  /reveal (?:system )?prompt/i,
  /bypass (?:all )?filters/i,
  /<script\b/i,
  /javascript:/i
];

const CORE_ECOSYSTEM = [
  { label: '🎧 Biblia Audio 24/7', url: '/biblia-audio', tags: ['biblia', 'audio', 'słuchaj', 'pismo', 'księga'] },
  { label: '📖 Kurs Codzienny', url: '/akademia/kurscodzienny', tags: ['kurs', 'akademia', 'lekcja', 'dziś', 'nauka', 'studium'] },
  { label: '🎸 Spiritual Sounds 24/7', url: '/SpiritualSounds', tags: ['muzyka', 'psalmy', 'spiritual', 'uwielbienie', 'radio'] },
  { label: '🎬 Kino VOD', url: '/vod', tags: ['film', 'filmy', 'vod', 'kino', 'rodzina'] },
  { label: '🏆 Lista topTEN', url: '/topten', tags: ['topten', 'głosuj', 'przeboje', 'pieśni', 'piosenki'] },
  { label: '🔎 MojaBiblia (UBG)', url: '/mojabiblia', tags: ['werset', 'biblia', 'ubg', 'strong', 'czytaj'] },
  { label: '🕊️ LUMINA Społeczność', url: '/lumina', tags: ['lumina', 'społeczność', 'posty', 'znajomi'] },
  { label: '🪪 Wizytówki CC', url: '/wizytowki', tags: ['wizytówki', 'ewangelizacja', 'zamów', 'rozdaj'] },
  { label: '🧡 Wspieram to', url: '/wspieraj', tags: ['wspieraj', 'patronite', 'darowizna', 'pomoc', 'modlitwa'] },
  { label: '🔍 Wyszukiwarka CC', url: '/wyszukiwarka', tags: ['szukaj', 'wyszukiwarka', 'wszystko'] }
];

const PERSONAS = {
  rut: {
    name: 'Rut',
    role: 'Gospodyni CC',
    greeting: 'Cześć! Jestem Rut, gospodyni Christian Culture. Chętnie pokażę Ci, co dziś ciekawego gra i dzieje się w naszym ekosystemie.',
    system: 'Jesteś Rut — ciepłą, konkretną gospodynią LUMI Messenger i całego ekosystemu Christian Culture (polskieradio.cc). Pomagasz użytkownikowi odkrywać radio 24/7, Spiritual Sounds, Kino VOD, topTEN, LUMINA i codzienne treści. Odpowiadasz zwięźle po polsku (2-4 zdania), serdecznie, bez żargonu.'
  },
  lea: {
    name: 'Lea',
    role: 'Planista',
    greeting: 'Dzień dobry! Jestem Lea, Twoja planistka w CC. Pomogę Ci ułożyć rytm dnia ze Słowem Bożym i Kursem Codziennym.',
    system: 'Jesteś Lea — uporządkowaną, praktyczną planistką w Christian Culture (polskieradio.cc). Pomagasz zaplanować codzienną lekturę Kursu Codziennego „Z Biblią za Pan Brat”, wykłady Akademii Biblijnej i słuchanie Biblii Audio. Odpowiadasz konkretnie po polsku (2-4 zdania).'
  },
  noemi: {
    name: 'Noemi',
    role: 'Doradca',
    greeting: 'Pokój Tobie! Jestem Noemi. Jeśli szukasz wsparcia w Słowie Bożym, modlitwie lub codziennym rozważaniu — jestem tu dla Ciebie.',
    system: 'Jesteś Noemi — łagodną, biblijną doradczynią w Christian Culture (polskieradio.cc). Kierujesz się wyłącznie Pismem Świętym (UBG) i Ewangelią Jezusa Chrystusa. Pocieszasz, wskazujesz wersety i modlitwę. Odpowiadasz spokojnie, z szacunkiem po polsku (2-4 zdania).'
  },
  miriam: {
    name: 'Miriam',
    role: 'Psalmy i Uwielbienie',
    greeting: 'Niech będzie pochwalony Pan! Jestem Miriam — prowadzę przez Psalmy, muzykę uwielbienia i codzienne rozważania w duchu wdzięczności.',
    system: 'Jesteś Miriam — radosną, rozmodloną przewodniczką po Psalmach, pieśniach uwielbienia i codziennych rozważaniach w Christian Culture (polskieradio.cc). Wskazujesz Spiritual Sounds 24/7, Biblię Śpiewaną, topTEN i rozważania dnia. Odpowiadasz ciepło i poetycko-konkretnie po polsku (2-4 zdania).'
  }
};

const ASSISTANT_ALIASES = {
  'asystentka-1': 'rut',
  'asystentka-2': 'lea',
  'asystentka-3': 'noemi',
  'asystentka-4': 'miriam',
  rut: 'rut',
  lea: 'lea',
  noemi: 'noemi',
  miriam: 'miriam'
};

export function resolveAssistantKey(id) {
  const k = String(id || '').trim().toLowerCase();
  return ASSISTANT_ALIASES[k] || 'rut';
}

export function buildDailyDialogue(reflection) {
  if (!reflection) return null;
  const day = reflection.day || '';
  const title = String(reflection.title || '').replace(/^☀️\s*/, '').trim();
  const reading = reflection.reading || '';
  const verse = reflection.memoryVerse || '';
  const teaser = reflection.teaser || reflection.theme || '';
  const firstSentence = String(teaser).split(/(?<=[.!?])\s+/)[0] || teaser;

  const turns = [
    {
      assistantId: 'rut',
      name: 'Rut',
      role: 'Gospodyni CC',
      avatar: '/images/chat/lumi_avatar_rut_circle.webp',
      text: `Dzień dobry kochani! ${day ? `Dziś Dzień ${day}` : 'Dziś'} rozważamy: „${title}”${reading ? ` (${reading})` : ''}. ${firstSentence}`
    },
    {
      assistantId: 'lea',
      name: 'Lea',
      role: 'Planista',
      avatar: '/images/chat/lumi_avatar_lea_circle.webp',
      text: `Zróbmy z tego konkretny krok na dziś: poświęć 10 minut na spokojną lekturę ${reading || 'dzisiejszego fragmentu'} i zastosuj jedną myśl w swojej codzienności.`
    },
    {
      assistantId: 'noemi',
      name: 'Noemi',
      role: 'Doradca',
      avatar: '/images/chat/lumi_avatar_noemi_circle.webp',
      text: verse
        ? `Słowo do serca na ten dzień: ${verse}`
        : `Pamiętajmy, że w każdej sprawie możemy przyjść z modlitwą do naszego Pana Jezusa Chrystusa.`
    },
    {
      assistantId: 'miriam',
      name: 'Miriam',
      role: 'Psalmy i Uwielbienie',
      avatar: '/images/chat/lumi_avatar_miriam_circle.webp',
      text: `Panie, dziękujemy Ci za Twoje Słowo i prowadzenie na cały dzień! Zapraszamy Was do wspólnej rozmowy poniżej oraz do pełnej lekcji w Akademii.`
    }
  ];

  return {
    day,
    date: reflection.date || '',
    title,
    reading,
    lessonUrl: day ? `/akademia/kurscodzienny/dzien-${day}` : '/akademia/kurscodzienny',
    turns
  };
}

export function resetLumiChatState() {
  ipBuckets.clear();
  quotaState = { day: new Date().toISOString().slice(0, 10), used: 0 };
  dataCache = { expiresAt: 0, reflections: null, catalog: null };
}

function checkRate(ip = 'anon', now = Date.now()) {
  const key = String(ip || 'anon').split(',')[0].trim() || 'anon';
  const cur = ipBuckets.get(key);
  if (!cur || now - cur.start >= RATE_WINDOW_MS) {
    ipBuckets.set(key, { start: now, count: 1 });
    if (ipBuckets.size > 2000) {
      for (const [k, v] of ipBuckets.entries()) {
        if (now - v.start >= RATE_WINDOW_MS) ipBuckets.delete(k);
      }
    }
    return true;
  }
  if (cur.count >= MAX_REQ_PER_MIN) return false;
  cur.count += 1;
  return true;
}

function canUseQuota(now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  if (quotaState.day !== day) quotaState = { day, used: 0 };
  return quotaState.used < DAILY_AI_CAP;
}

function bumpQuota(now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  if (quotaState.day !== day) quotaState = { day, used: 0 };
  quotaState.used += 1;
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

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .trim();
}

async function loadAssetJson(env, path) {
  if (env && env.ASSETS && typeof env.ASSETS.fetch === 'function') {
    try {
      const res = await env.ASSETS.fetch(new Request(`https://polskieradio.cc${path}`));
      if (res && res.ok) return await res.json();
    } catch {
      // ignore asset fetch errors
    }
  }
  return null;
}

async function getEcosystemData(env, overrides) {
  if (overrides && (overrides.reflections || overrides.catalog)) {
    return {
      reflections: overrides.reflections || [],
      catalog: overrides.catalog || null
    };
  }
  const now = Date.now();
  if (dataCache.expiresAt > now && (dataCache.reflections || dataCache.catalog)) {
    return { reflections: dataCache.reflections || [], catalog: dataCache.catalog };
  }
  const [reflections, catalog] = await Promise.all([
    loadAssetJson(env, '/rozwazania_baza.json'),
    loadAssetJson(env, '/szukaj/catalog.json')
  ]);
  dataCache = {
    expiresAt: now + CACHE_TTL_MS,
    reflections: Array.isArray(reflections) ? reflections : [],
    catalog: catalog && typeof catalog === 'object' ? catalog : null
  };
  return { reflections: dataCache.reflections, catalog: dataCache.catalog };
}

function pickTodayReflection(reflections) {
  if (!Array.isArray(reflections) || !reflections.length) return null;
  const today = getWarsawDateStr();
  const exact = reflections.find((r) => r && r.date === today);
  if (exact) return exact;
  const sorted = reflections
    .filter((r) => r && r.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return sorted[0] || reflections[0];
}

function matchCatalog(query, catalog) {
  const qn = norm(query);
  const words = qn.split(/[^a-z0-9]+/).filter((w) => w.length >= 3);
  const guides = [];
  const items = [];

  if (catalog && catalog.contextGuides) {
    for (const [key, g] of Object.entries(catalog.contextGuides)) {
      const kws = Array.isArray(g.keywords) ? g.keywords.map(norm) : [norm(key)];
      if (kws.some((kw) => qn.includes(kw) || words.some((w) => kw.includes(w)))) {
        guides.push({ key, ...g });
      }
    }
  }

  const list = Array.isArray(catalog?.items) ? catalog.items : [];
  if (words.length && list.length) {
    for (const it of list) {
      const hay = norm(`${it.title || ''} ${it.description || ''} ${it.category || ''} ${(it.tags || []).join(' ')}`);
      let score = 0;
      for (const w of words) {
        if (hay.includes(w)) score += 1;
      }
      if (score > 0) items.push({ score, item: it });
    }
    items.sort((a, b) => b.score - a.score);
  }

  return { guides: guides.slice(0, 2), items: items.slice(0, 3).map((x) => x.item) };
}

function pickActionsForQuery(query, matchedItems, reflection) {
  const qn = norm(query);
  const actions = [];
  const seen = new Set();

  const pushAct = (label, url) => {
    if (!label || !url || seen.has(url)) return;
    seen.add(url);
    actions.push({ label, url });
  };

  for (const it of matchedItems || []) {
    if (it.url && it.title) pushAct(it.title.slice(0, 42), it.url.replace(/^https:\/\/polskieradio\.cc/, '') || '/');
    if (actions.length >= 2) break;
  }

  for (const core of CORE_ECOSYSTEM) {
    if (core.tags.some((t) => qn.includes(norm(t)))) {
      pushAct(core.label, core.url);
      if (actions.length >= 3) break;
    }
  }

  if (reflection && reflection.day && actions.length < 3) {
    pushAct(`📖 Dzień ${reflection.day}: Kurs Codzienny`, `/akademia/kurscodzienny/dzien-${reflection.day}`);
  }

  if (actions.length < 3) pushAct('🎸 Spiritual Sounds 24/7', '/SpiritualSounds');
  if (actions.length < 3) pushAct('🎬 Kino VOD', '/vod');
  if (actions.length < 3) pushAct('🔍 Wyszukiwarka CC', '/wyszukiwarka');

  return actions.slice(0, 3);
}

function buildSmartCatalogReply(query, personaKey, ecoData) {
  const persona = PERSONAS[personaKey] || PERSONAS.rut;
  const reflection = pickTodayReflection(ecoData.reflections);
  const { guides, items } = matchCatalog(query, ecoData.catalog);
  const qn = norm(query);
  const actions = pickActionsForQuery(query, items, reflection);

  if (guides.length) {
    const g = guides[0];
    const verse = Array.isArray(g.keyVerses) && g.keyVerses[0]
      ? ` Słowo na ten temat (${g.keyVerses[0].ref}, UBG): „${g.keyVerses[0].text}”`
      : '';
    return {
      reply: `${g.summary}${verse}`,
      actions,
      mode: 'smart-catalog'
    };
  }

  const isDiscovery = /co dobrego|co nowego|co sl|co ciekawego|polec|co dzis|co robic|od czego zaczac|jak zaczac|pomoz|hej|czesc|witaj|dzien dobry/.test(qn);
  if (isDiscovery || !items.length) {
    const refPart = reflection
      ? ` Dziś w naszym cyklu mamy ${reflection.title ? `„${reflection.title.replace(/^☀️\s*/, '')}”` : `Dzień ${reflection.day}`}${reflection.reading ? ` (${reflection.reading})` : ''}.`
      : '';
    if (personaKey === 'lea') {
      return {
        reply: `Zapraszam Cię do uporządkowanego rytmu dnia z Biblią!${refPart} Możesz poświęcić 10 minut na Kurs Codzienny lub odsłuchać rozdział w Biblii Audio 24/7.`,
        actions,
        mode: 'smart-catalog'
      };
    }
    if (personaKey === 'noemi') {
      return {
        reply: `Pokój Tobie!${refPart} Jeśli potrzebujesz chwili wyciszenia i Bożego słowa, zajrzyj do dzisiejszego rozważania, otwórz MojaBiblia (UBG) albo posłuchaj Psalmów w Spiritual Sounds.`,
        actions,
        mode: 'smart-catalog'
      };
    }
    if (personaKey === 'miriam') {
      return {
        reply: `Chwała Panu!${refPart} Zapraszam Cię do uwielbienia w Spiritual Sounds 24/7, Biblii Śpiewanej i wspólnego rozważania Słowa Bożego.`,
        actions,
        mode: 'smart-catalog'
      };
    }
    return {
      reply: `W Christian Culture zawsze czeka na Ciebie coś dobrego bez opłat i algorytmów!${refPart} Polecam szczególnie muzykę biblijną Spiritual Sounds 24/7, bezpłatne Kino VOD oraz naszą listę topTEN.`,
      actions,
      mode: 'smart-catalog'
    };
  }

  const top = items[0];
  return {
    reply: `${persona.name} poleca w tym temacie: ${top.title}${top.description ? ` — ${top.description}` : ''}. Poniżej masz bezpośrednie przejście do materiałów w CC:`,
    actions,
    mode: 'smart-catalog'
  };
}

function buildContextPrompt(persona, query, history, ecoData) {
  const reflection = pickTodayReflection(ecoData.reflections);
  const { guides, items } = matchCatalog(query, ecoData.catalog);
  const lines = [
    persona.system,
    'Zasady bezwzględne:',
    '1. Cytaty biblijne wyłącznie z UBG (Uwspółcześniona Biblia Gdańska), jeśli masz pewność co do treści.',
    '2. Nie wymyślaj adresów URL. Używaj wyłącznie istniejących ścieżek: /biblia-audio, /akademia/kurscodzienny, /SpiritualSounds, /vod, /topten, /mojabiblia, /lumina, /wizytowki, /wspieraj, /wyszukiwarka, /nadawaj.',
    '3. Odpowiadaj naturalnie, ciepło, krótko (maks. 3-4 zdania) po polsku.'
  ];
  if (reflection) {
    lines.push(`Aktualne rozważanie dnia: ${reflection.title || ''} (${reflection.reading || ''}) — ${reflection.memoryVerse || reflection.teaser || ''}`.slice(0, 450));
  }
  if (guides.length) {
    lines.push(`Dopasowany temat CC: ${guides[0].topic} — ${guides[0].summary}`.slice(0, 350));
  }
  if (items.length) {
    lines.push('Powiązane pozycje w katalogu CC: ' + items.map((i) => `${i.title} (${i.url})`).join('; '));
  }
  if (Array.isArray(history) && history.length) {
    const recent = history.slice(-4).map((h) => `${h.role === 'user' ? 'Użytkownik' : persona.name}: ${String(h.text || '').slice(0, 180)}`);
    lines.push('Ostatnie wiadomości:\n' + recent.join('\n'));
  }
  return lines.join('\n');
}

async function callGemini(env, systemPrompt, query, fetchImpl = fetch) {
  if (!env.GEMINI_API_KEY) return null;
  const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: query }] }],
        generationConfig: { temperature: 0.55, maxOutputTokens: 280 }
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return txt ? { reply: String(txt).trim(), mode: 'gemini' } : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function callGroq(env, systemPrompt, query, fetchImpl = fetch) {
  if (!env.GROQ_API_KEY) return null;
  const model = env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetchImpl('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.55,
        max_tokens: 280,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ]
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const txt = data?.choices?.[0]?.message?.content;
    return txt ? { reply: String(txt).trim(), mode: 'groq' } : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function callWorkersAi(env, systemPrompt, query) {
  if (!env.AI || typeof env.AI.run !== 'function') return null;
  try {
    const res = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      max_tokens: 280,
      temperature: 0.55
    });
    const txt = res && (res.response || res.text);
    return txt ? { reply: String(txt).trim(), mode: 'workers-ai' } : null;
  } catch {
    return null;
  }
}

export async function processLumiChat({ assistantId = 'rut', message = '', history = [] }, env = {}, deps = {}) {
  const personaKey = resolveAssistantKey(assistantId);
  const persona = PERSONAS[personaKey];
  const cleanMsg = String(message || '').trim().slice(0, 600);

  if (!cleanMsg) {
    return { ok: false, error: 'empty_message', reply: persona.greeting, actions: CORE_ECOSYSTEM.slice(0, 3) };
  }

  if (INJECTION_RE.some((re) => re.test(cleanMsg))) {
    return {
      ok: true,
      assistant: personaKey,
      reply: 'Jestem tutaj, aby pomóc Ci odkrywać treści Christian Culture, radio 24/7 i Słowo Boże. W czym mogę Ci dziś pomóc?',
      actions: CORE_ECOSYSTEM.slice(0, 3),
      mode: 'guard',
      zeroCostGuaranteed: true
    };
  }

  const ecoData = await getEcosystemData(env, deps.data);
  const reflection = pickTodayReflection(ecoData.reflections);
  const { items } = matchCatalog(cleanMsg, ecoData.catalog);
  const actions = pickActionsForQuery(cleanMsg, items, reflection);

  if (canUseQuota()) {
    const sysPrompt = buildContextPrompt(persona, cleanMsg, history, ecoData);
    const fetchImpl = deps.fetch || fetch;
    const aiRes =
      (await callGemini(env, sysPrompt, cleanMsg, fetchImpl)) ||
      (await callGroq(env, sysPrompt, cleanMsg, fetchImpl)) ||
      (await callWorkersAi(env, sysPrompt, cleanMsg));

    if (aiRes && aiRes.reply) {
      bumpQuota();
      return {
        ok: true,
        assistant: personaKey,
        reply: aiRes.reply,
        actions,
        mode: aiRes.mode,
        zeroCostGuaranteed: true
      };
    }
  }

  const fallback = buildSmartCatalogReply(cleanMsg, personaKey, ecoData);
  return {
    ok: true,
    assistant: personaKey,
    reply: fallback.reply,
    actions: fallback.actions,
    mode: fallback.mode,
    zeroCostGuaranteed: true
  };
}

export async function handleLumiChatApi(request, env = {}, deps = {}) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || 'https://polskieradio.cc',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  if (request.method === 'GET') {
    const reqUrl = new URL(request.url);
    if (reqUrl.searchParams.get('daily') === '1') {
      const ecoData = await getEcosystemData(env, deps.data);
      const reflection = pickTodayReflection(ecoData.reflections);
      const dialogue = buildDailyDialogue(reflection);
      return Response.json({
        ok: Boolean(dialogue),
        zeroCostGuaranteed: true,
        dialogue
      }, { headers: { 'Cache-Control': 'public, max-age=300' } });
    }
    return Response.json({
      ok: true,
      service: 'lumi-chat-assistants',
      assistants: Object.keys(PERSONAS),
      zeroCostGuaranteed: true,
      providersConfigured: {
        gemini: Boolean(env.GEMINI_API_KEY),
        groq: Boolean(env.GROQ_API_KEY),
        workersAi: Boolean(env.AI && typeof env.AI.run === 'function'),
        smartCatalogFallback: true
      }
    }, { headers: { 'Cache-Control': 'no-store' } });
  }

  if (request.method !== 'POST') {
    return Response.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
  }

  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'anon';
  if (!checkRate(ip)) {
    return Response.json({ ok: false, error: 'rate_limit_exceeded' }, {
      status: 429,
      headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' }
    });
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 4096) {
    return Response.json({ ok: false, error: 'payload_too_large' }, { status: 413 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const result = await processLumiChat(body || {}, env, deps);
  return Response.json(result, {
    status: result.ok ? 200 : 400,
    headers: {
      'Cache-Control': 'no-store',
      'X-CC-Zero-Cost-Mode': 'active'
    }
  });
}
