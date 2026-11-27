/**
 * TTS BYOK Service (P2b — ElevenLabs & Gemini TTS)
 * - ZERO CC-owned ElevenLabs or Gemini TTS API keys
 * - Server-side ephemeral session (15-minute TTL) stored in memory only
 * - Fixed provider endpoints (no custom URL overrides / no SSRF)
 * - Strict char caps (280 for sample, 2500 for full answer), ZERO auto-retries
 * - Explicit mock mode for ZERO-COST local verification & testing
 * - Fallback recommendation (`fallbackToSystem: true`) on any upstream failure
 */

export const TTS_SESSION_TTL_MS = 15 * 60 * 1000;
export const MAX_TTS_SAMPLE_CHARS = 280;
export const MAX_TTS_FULL_CHARS = 2500;

export const SAMPLE_PSALM_23_TEXT =
  'Pan jest pasterzem moim, niczego mi nie braknie. Na zielonych niwach pasie mnie, nad wody spokojne prowadzi mnie.';

export const BIBLICAL_PRONUNCIATION_SAMPLE_TEXT =
  'Rzymian 8,28: Bóg współdziała ku dobremu z Tymoteuszem, Ezechiaszem i Melchizedekiem z Jerozolimy.';

export const TTS_PROVIDERS = Object.freeze({
  elevenlabs: Object.freeze({
    id: 'elevenlabs',
    label: 'ElevenLabs (BYOK)',
    defaultVoiceId: 'EXAVITQu4vr4xnSDxMaL',
    allowedModels: Object.freeze(['eleven_multilingual_v2', 'eleven_flash_v2_5']),
    defaultModel: 'eleven_multilingual_v2'
  }),
  gemini: Object.freeze({
    id: 'gemini',
    label: 'Gemini TTS (BYOK)',
    defaultVoiceId: 'Aoede',
    allowedModels: Object.freeze(['gemini-2.5-flash-preview-tts', 'gemini-2.5-pro-preview-tts']),
    defaultModel: 'gemini-2.5-flash-preview-tts'
  })
});

const SENSITIVE_FIELD_RE = /^(api[_-]?key|x-xi-api-key|xi-api-key|x-goog-api-key|session[_-]?token|x-tts-session-token|authorization|cookie|secret|token)$/i;

// Sesje BYOK żyją wyłącznie w pamięci instancji przez maks. 15 minut.
const ttsSessions = new Map();

function nowMs(deps) {
  return typeof deps?.now === 'function' ? deps.now() : Date.now();
}

function purgeExpiredSessions(deps) {
  const current = nowMs(deps);
  for (const [token, entry] of ttsSessions.entries()) {
    if (!entry || entry.expiresAt <= current) {
      ttsSessions.delete(token);
    }
  }
}

function generateSessionToken() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return `tts_${globalThis.crypto.randomUUID()}`;
  }
  return `tts_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

function uint8ArrayToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa === 'function') {
    return btoa(binary);
  }
  return Buffer.from(bytes).toString('base64');
}

function buildMockWavBase64(durationMs = 180) {
  // Generuje poprawny nagłówek PCM WAV (8 kHz mono 8-bit cisza) bez żadnych kosztów zewnętrznych.
  const sampleRate = 8000;
  const numSamples = Math.max(400, Math.floor((sampleRate * durationMs) / 1000));
  const bytes = new Uint8Array(44 + numSamples);
  const view = new DataView(bytes.buffer);
  const writeAscii = (offset, str) => {
    for (let i = 0; i < str.length; i += 1) {
      bytes[offset + i] = str.charCodeAt(i);
    }
  };
  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + numSamples, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  writeAscii(36, 'data');
  view.setUint32(40, numSamples, true);
  bytes.fill(128, 44);

  return uint8ArrayToBase64(bytes);
}

export function resetTtsSessionsForTest() {
  ttsSessions.clear();
}

export function scrubTelemetryPayload(input, depth = 0) {
  if (depth > 8 || input === null || input === undefined) {
    return input;
  }
  if (Array.isArray(input)) {
    return input.map(item => scrubTelemetryPayload(item, depth + 1));
  }
  if (typeof input === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(input)) {
      if (SENSITIVE_FIELD_RE.test(k)) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = scrubTelemetryPayload(v, depth + 1);
      }
    }
    return out;
  }
  if (typeof input === 'string') {
    return input
      .replace(/sk_[A-Za-z0-9]{12,}/g, '[REDACTED_KEY]')
      .replace(/AIza[0-9A-Za-z_-]{16,}/g, '[REDACTED_KEY]');
  }
  return input;
}

export function buildProviderEndpoint(providerId, voiceId, model) {
  if (providerId === 'elevenlabs') {
    const safeVoice = /^[A-Za-z0-9_-]{3,64}$/.test(String(voiceId || ''))
      ? String(voiceId)
      : TTS_PROVIDERS.elevenlabs.defaultVoiceId;
    return `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(safeVoice)}`;
  }
  if (providerId === 'gemini') {
    const allowed = TTS_PROVIDERS.gemini.allowedModels;
    const safeModel = allowed.includes(model) ? model : TTS_PROVIDERS.gemini.defaultModel;
    return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(safeModel)}:generateContent`;
  }
  return null;
}

export function createTtsSession(payload = {}, deps = {}) {
  purgeExpiredSessions(deps);

  if (payload.endpoint || payload.baseUrl || payload.apiUrl || payload.url) {
    return {
      ok: false,
      status: 400,
      error: 'custom_endpoint_forbidden',
      message: 'Niestandardowe adresy API są zablokowane ze względów bezpieczeństwa.'
    };
  }

  const providerId = String(payload.provider || '').trim().toLowerCase();
  const provider = TTS_PROVIDERS[providerId];
  if (!provider) {
    return {
      ok: false,
      status: 400,
      error: 'unsupported_tts_provider',
      message: 'Obsługiwani dostawcy BYOK TTS to wyłącznie elevenlabs oraz gemini.'
    };
  }

  const apiKey = String(payload.apiKey || '').trim();
  if (apiKey.length < 8 || apiKey.length > 256 || /\s/.test(apiKey)) {
    return {
      ok: false,
      status: 400,
      error: 'invalid_api_key_format',
      message: 'Podaj prawidłowy klucz API dostawcy (min. 8 znaków, bez spacji).'
    };
  }

  const requestedVoice = String(payload.voiceId || '').trim();
  const voiceId = /^[A-Za-z0-9_-]{2,64}$/.test(requestedVoice)
    ? requestedVoice
    : provider.defaultVoiceId;

  const requestedModel = String(payload.model || '').trim();
  const model = provider.allowedModels.includes(requestedModel)
    ? requestedModel
    : provider.defaultModel;

  const createdAt = nowMs(deps);
  const expiresAt = createdAt + TTS_SESSION_TTL_MS;
  const sessionToken = generateSessionToken();
  const mode = (deps.fetch && !apiKey.startsWith('mock_')) ? 'live_test' : 'mock';

  ttsSessions.set(sessionToken, {
    provider: providerId,
    apiKey,
    voiceId,
    model,
    createdAt,
    expiresAt,
    mode
  });

  return {
    ok: true,
    status: 201,
    sessionToken,
    provider: providerId,
    providerLabel: provider.label,
    voiceId,
    model,
    mode,
    ttlSeconds: Math.floor(TTS_SESSION_TTL_MS / 1000),
    expiresAt,
    storagePolicy: 'server_memory_15m_no_local_storage'
  };
}

export function getTtsSessionStatus(sessionToken = '', deps = {}) {
  purgeExpiredSessions(deps);
  const token = String(sessionToken || '').trim();
  const entry = token ? ttsSessions.get(token) : null;
  const current = nowMs(deps);

  return {
    ok: true,
    status: 200,
    active: Boolean(entry && entry.expiresAt > current),
    provider: entry?.provider || null,
    voiceId: entry?.voiceId || null,
    model: entry?.model || null,
    mode: entry?.mode || 'mock',
    expiresAt: entry?.expiresAt || null,
    remainingSeconds: entry ? Math.max(0, Math.floor((entry.expiresAt - current) / 1000)) : 0,
    limits: {
      sampleMaxChars: MAX_TTS_SAMPLE_CHARS,
      fullMaxChars: MAX_TTS_FULL_CHARS,
      ttlMinutes: 15
    },
    samples: {
      psalm23: SAMPLE_PSALM_23_TEXT,
      biblicalNames: BIBLICAL_PRONUNCIATION_SAMPLE_TEXT
    },
    providers: Object.values(TTS_PROVIDERS).map(p => ({
      id: p.id,
      label: p.label,
      defaultVoiceId: p.defaultVoiceId,
      defaultModel: p.defaultModel
    }))
  };
}

export function deleteTtsSession(sessionToken = '', deps = {}) {
  purgeExpiredSessions(deps);
  const token = String(sessionToken || '').trim();
  const existed = token ? ttsSessions.delete(token) : false;
  return { ok: true, status: 200, cleared: existed };
}

function mapUpstreamStatusToError(status, providerId) {
  if (status === 401 || status === 403) {
    return {
      ok: false,
      status: 401,
      error: 'invalid_api_key',
      fallbackToSystem: true,
      message: `Klucz API dla ${providerId} został odrzucony (${status}). Przełączono na bezpieczny głos systemowy.`
    };
  }
  if (status === 402) {
    return {
      ok: false,
      status: 402,
      error: 'quota_exhausted',
      fallbackToSystem: true,
      message: `Limit środków na Twoim koncie ${providerId} został wyczerpany. Używam głosu systemowego.`
    };
  }
  if (status === 429) {
    return {
      ok: false,
      status: 429,
      error: 'rate_limit_or_quota',
      fallbackToSystem: true,
      message: `Limit zapytań (429) w ${providerId}. Brak automatycznych ponowień — przełączono na głos systemowy.`
    };
  }
  return {
    ok: false,
    status: 502,
    error: 'tts_upstream_error',
    fallbackToSystem: true,
    message: `Usługa ${providerId} zwróciła błąd ${status}. Przełączono na głos systemowy.`
  };
}

export async function synthesizeTtsWithSession({
  sessionToken = '',
  text = '',
  isSample = false,
  endpoint,
  baseUrl,
  apiUrl,
  url,
  env = {},
  deps = {}
} = {}) {
  purgeExpiredSessions(deps);

  if (endpoint || baseUrl || apiUrl || url) {
    return {
      ok: false,
      status: 400,
      error: 'custom_endpoint_forbidden',
      fallbackToSystem: true,
      message: 'Niestandardowe adresy URL dla TTS BYOK są zablokowane.'
    };
  }

  const token = String(sessionToken || '').trim();
  const session = token ? ttsSessions.get(token) : null;
  const current = nowMs(deps);
  if (!session || session.expiresAt <= current) {
    if (token) ttsSessions.delete(token);
    return {
      ok: false,
      status: 401,
      error: 'session_missing_or_expired',
      fallbackToSystem: true,
      message: 'Sesja BYOK TTS wygasła (limit 15 min) lub nie istnieje. Przełączono na głos systemowy.'
    };
  }

  const cleanedText = String(text || '').replace(/\s+/g, ' ').trim();
  if (!cleanedText) {
    return {
      ok: false,
      status: 400,
      error: 'empty_text',
      fallbackToSystem: false,
      message: 'Brak tekstu do syntezy mowy.'
    };
  }

  const maxChars = isSample ? MAX_TTS_SAMPLE_CHARS : MAX_TTS_FULL_CHARS;
  if (cleanedText.length > maxChars) {
    return {
      ok: false,
      status: 400,
      error: 'text_too_long',
      fallbackToSystem: false,
      maxChars,
      actualChars: cleanedText.length,
      message: `Tekst przekracza limit ${maxChars} znaków (jest ${cleanedText.length}).`
    };
  }

  const targetUrl = buildProviderEndpoint(session.provider, session.voiceId, session.model);
  if (!targetUrl) {
    return {
      ok: false,
      status: 400,
      error: 'unsupported_tts_provider',
      fallbackToSystem: true
    };
  }

  // Testowalna ścieżka sieciowa wyłącznie przy jawnym mocku `deps.fetch` lub w trybie `AI_TTS_BYOK_LIVE=true`.
  const allowNetwork = typeof deps.fetch === 'function' ||
    (String(env.AI_TTS_BYOK_LIVE || '').toLowerCase() === 'true' && !session.apiKey.startsWith('mock_'));

  if (!allowNetwork) {
    if (session.apiKey.startsWith('mock_invalid')) {
      return mapUpstreamStatusToError(401, session.provider);
    }
    if (session.apiKey.startsWith('mock_429')) {
      return mapUpstreamStatusToError(429, session.provider);
    }
    if (session.apiKey.startsWith('mock_timeout')) {
      return {
        ok: false,
        status: 504,
        error: 'tts_timeout',
        fallbackToSystem: true,
        message: 'Przekroczono czas odpowiedzi TTS BYOK. Przełączono na głos systemowy.'
      };
    }

    return {
      ok: true,
      status: 200,
      mode: 'mock',
      provider: session.provider,
      voiceId: session.voiceId,
      model: session.model,
      isSample: Boolean(isSample),
      charCount: cleanedText.length,
      targetUrl,
      mimeType: 'audio/wav',
      audioBase64: buildMockWavBase64(180),
      fallbackToSystem: false
    };
  }

  // Pojedyncze wywołanie bez żadnych automatycznych ponowień (ochrona kosztów BYOK).
  const fetchImpl = deps.fetch || fetch;
  const controller = new AbortController();
  const timeoutMs = Number(deps.timeoutMs) > 0 ? Number(deps.timeoutMs) : 12000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response;
    if (session.provider === 'elevenlabs') {
      response = await fetchImpl(targetUrl, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
          'xi-api-key': session.apiKey
        },
        body: JSON.stringify({
          text: cleanedText,
          model_id: session.model
        })
      });
    } else {
      response = await fetchImpl(targetUrl, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': session.apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: cleanedText }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: session.voiceId }
              }
            }
          }
        })
      });
    }

    if (!response.ok) {
      return mapUpstreamStatusToError(response.status, session.provider);
    }

    if (session.provider === 'elevenlabs') {
      const buf = new Uint8Array(await response.arrayBuffer());
      const base64 = uint8ArrayToBase64(buf);
      return {
        ok: true,
        status: 200,
        mode: 'live',
        provider: 'elevenlabs',
        voiceId: session.voiceId,
        model: session.model,
        isSample: Boolean(isSample),
        charCount: cleanedText.length,
        mimeType: response.headers?.get?.('content-type') || 'audio/mpeg',
        audioBase64: base64,
        fallbackToSystem: false
      };
    }

    const data = await response.json();
    const inlineData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!inlineData?.data) {
      return {
        ok: false,
        status: 502,
        error: 'tts_empty_audio',
        fallbackToSystem: true,
        message: 'Gemini TTS nie zwróciło danych audio. Przełączono na głos systemowy.'
      };
    }
    return {
      ok: true,
      status: 200,
      mode: 'live',
      provider: 'gemini',
      voiceId: session.voiceId,
      model: session.model,
      isSample: Boolean(isSample),
      charCount: cleanedText.length,
      mimeType: inlineData.mimeType || 'audio/wav',
      audioBase64: inlineData.data,
      fallbackToSystem: false
    };
  } catch (err) {
    const isTimeout = err?.name === 'AbortError' || /abort|timeout/i.test(String(err?.message || ''));
    return {
      ok: false,
      status: isTimeout ? 504 : 502,
      error: isTimeout ? 'tts_timeout' : 'tts_network_error',
      fallbackToSystem: true,
      message: isTimeout
        ? 'Przekroczono czas odpowiedzi TTS BYOK. Przełączono na głos systemowy.'
        : 'Błąd połączenia z dostawcą TTS BYOK. Przełączono na głos systemowy.'
    };
  } finally {
    clearTimeout(timer);
  }
}
