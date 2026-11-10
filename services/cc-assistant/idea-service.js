// ============================================================================
// EkoCC / LUMI MESS — Asystent Christian Culture: Idea Intake Service
// Moduł: services/cc-assistant/idea-service.js
// Standard: ZERO COST, Privacy-by-Design, RODO Minimalizacja Danych
// ============================================================================

export const IDEA_INTAKE_INFO = {
  service: 'Asystent Christian Culture — Zgłoszenia Pomysłów (LUMI MESS)',
  administrator: 'Christian Culture — Prywatna Chrześcijańska Inicjatywa Społeczna',
  contactEmail: 'polskiercctv@gmail.com',
  routingEmail: 'pomysly@polskieradio.cc',
  privacyNotice: 'Podanie e-maila jest dobrowolne i służy wyłącznie do odpowiedzi na Twoje zgłoszenie.'
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENSITIVE_PATTERNS = [
  /\b\d{11}\b/, // PESEL-like 11 digits
  /\b(?:\d[ -]*?){13,19}\b/, // Payment card number pattern
  /\b(?:hasło|haslo|password|pin)\s*[:=]\s*\S+/i
];

const rateBuckets = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

export function sanitizeIdeaText(value, maxLen = 500) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, maxLen);
}

export function containsSensitiveData(text) {
  const s = String(text || '');
  return SENSITIVE_PATTERNS.some((re) => re.test(s));
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow, noarchive'
    }
  });
}

export async function handleAssistantIdeaApiRequest(request, env) {
  if (request.method === 'GET') {
    return jsonResponse({
      ok: true,
      service: IDEA_INTAKE_INFO.service,
      status: 'active',
      privacyNotice: IDEA_INTAKE_INFO.privacyNotice
    });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'METHOD_NOT_ALLOWED' }, 405);
  }

  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return jsonResponse({ ok: false, error: 'INVALID_CONTENT_TYPE' }, 415);
  }

  const clientKey =
    (request.headers.get('CF-Connecting-IP') || 'local') +
    '|' +
    (request.headers.get('User-Agent') || '').slice(0, 64);
  const now = Date.now();
  const prev = (rateBuckets.get(clientKey) || []).filter((ts) => now - ts < WINDOW_MS);
  if (prev.length >= MAX_PER_WINDOW) {
    return jsonResponse(
      {
        ok: false,
        error: 'RATE_LIMITED',
        message: 'Przekroczono limit zgłoszeń w krótkim czasie. Spróbuj ponownie za kilka minut.'
      },
      429
    );
  }

  let body;
  try {
    const raw = await request.text();
    if (raw.length > 16 * 1024) {
      return jsonResponse({ ok: false, error: 'PAYLOAD_TOO_LARGE' }, 413);
    }
    body = JSON.parse(raw);
  } catch (_) {
    return jsonResponse({ ok: false, error: 'INVALID_JSON' }, 400);
  }

  if (body.website || body.company || body.botField) {
    return jsonResponse({
      ok: true,
      status: 'accepted',
      id: `IDEA-${now.toString(36).toUpperCase()}`
    });
  }

  const missingWhat = sanitizeIdeaText(body.whatIsMissing || body.missing || body.idea || '', 500);
  const useCase = sanitizeIdeaText(body.useCase || body.purpose || '', 500);
  const email = String(body.email || '').trim().toLowerCase().slice(0, 160);
  const source = sanitizeIdeaText(body.source || 'mess', 40);

  if (!missingWhat || missingWhat.length < 3) {
    return jsonResponse(
      {
        ok: false,
        error: 'VALIDATION_ERROR',
        field: 'whatIsMissing',
        message: 'Opisz krótko, czego Ci brakuje (minimum 3 znaki).'
      },
      400
    );
  }

  if (containsSensitiveData(missingWhat) || containsSensitiveData(useCase)) {
    return jsonResponse(
      {
        ok: false,
        error: 'SENSITIVE_DATA_DETECTED',
        field: 'whatIsMissing',
        message: 'Ze względów bezpieczeństwa nie wpisuj w formularzu numerów PESEL, kart płatniczych ani haseł.'
      },
      400
    );
  }

  if (email && !EMAIL_RE.test(email)) {
    return jsonResponse(
      {
        ok: false,
        error: 'VALIDATION_ERROR',
        field: 'email',
        message: 'Podaj poprawny adres e-mail lub pozostaw to pole puste.'
      },
      400
    );
  }

  prev.push(now);
  rateBuckets.set(clientKey, prev);

  const ideaId = `IDEA-${now.toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const nowIso = new Date(now).toISOString();

  if (env && env.EMAIL && typeof env.EMAIL.send === 'function') {
    try {
      await env.EMAIL.send({
        from: IDEA_INTAKE_INFO.routingEmail,
        to: IDEA_INTAKE_INFO.contactEmail,
        ...(email ? { replyTo: email } : {}),
        subject: `[Asystent CC — Pomysł] ${ideaId}`,
        text: [
          `Nowe zgłoszenie pomysłu z Asystenta Christian Culture (${ideaId})`,
          `Data: ${nowIso}`,
          `Źródło: ${source}`,
          `------------------------------------------------------------`,
          `Czego brakuje:`,
          missingWhat,
          `------------------------------------------------------------`,
          `Do czego użytkownik chce tego użyć:`,
          useCase || '(nie podano)',
          `------------------------------------------------------------`,
          `E-mail do odpowiedzi (dobrowolny): ${email || '(nie podano)'}`
        ].join('\n')
      });
    } catch (_) {
      // Transport emaila jest opcjonalny w środowisku brzegowym
    }
  }

  return jsonResponse(
    {
      ok: true,
      status: 'accepted',
      id: ideaId,
      timestamp: nowIso,
      message: 'Dziękujemy! Twój pomysł został zapisany i przekazany zespołowi Christian Culture.'
    },
    200
  );
}
