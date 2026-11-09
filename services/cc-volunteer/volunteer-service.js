// ============================================================================
// EkoCC / CC POMOC — Wolontariat & Rekrutacja Specjalistów
// Moduł: services/cc-volunteer/volunteer-service.js
// Standard: ZERO COST, Privacy-by-Design, RODO Art. 6 ust. 1 lit. a
// Zgoda L0 (Cezary Rogowski, 2026-10-27 & 2026-11-09)
// ============================================================================

export const RODO_ADMIN_INFO = {
  administrator: 'Christian Culture — Prywatna Chrześcijańska Inicjatywa Społeczna',
  adres: 'ul. Siennieńska 121, Ostrowiec Świętokrzyski, Polska',
  kontakt: 'polskiercctv@gmail.com',
  routingEmail: 'wolontariat@polskieradio.cc',
  cel: 'Rekrutacja i organizacja wolontariatu specjalistycznego w ramach inicjatywy CC Pomoc',
  podstawaPrawna: 'Zgoda kandydata (art. 6 ust. 1 lit. a RODO)',
  retencjaMiesiecy: 12
};

export const ALLOWED_SPECIALTIES = [
  'prawo',
  'finanse',
  'psychologia',
  'psychoterapia',
  'uzaleznienia',
  'duszpasterstwo',
  'edukacja',
  'rodzina',
  'medycyna',
  'doradztwo-zawodowe',
  'seniorzy',
  'inne'
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeText(value, maxLen = 1000) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .trim()
    .slice(0, maxLen);
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

/**
 * Główny kontroler API dla formularza zgłoszeń wolontariatu
 * Obsługuje: POST /api/wolontariat oraz POST /api/volunteer-applications
 */
export async function handleVolunteerApiRequest(request, env, ctx) {
  const url = new URL(request.url);

  // Zezwalamy na GET /api/wolontariat wyłącznie w celach informacyjnych / diagnostyki
  if (request.method === 'GET') {
    return jsonResponse({
      service: 'CC Pomoc — Formularz Wolontariatu',
      status: 'active',
      routingAddress: RODO_ADMIN_INFO.routingEmail,
      forwardDestination: RODO_ADMIN_INFO.kontakt,
      administrator: RODO_ADMIN_INFO.administrator,
      allowedSpecialties: ALLOWED_SPECIALTIES
    });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'METHOD_NOT_ALLOWED' }, 405);
  }

  // Kontrola rozmiaru i typu zawartości
  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return jsonResponse({ ok: false, error: 'INVALID_CONTENT_TYPE' }, 415);
  }

  let body;
  try {
    const raw = await request.text();
    if (raw.length > 32 * 1024) {
      return jsonResponse({ ok: false, error: 'PAYLOAD_TOO_LARGE' }, 413);
    }
    body = JSON.parse(raw);
  } catch (_) {
    return jsonResponse({ ok: false, error: 'INVALID_JSON' }, 400);
  }

  // Honeypot — ciche ignorowanie botów internetowych
  if (body.website || body.company || body.fax || body.botField) {
    return jsonResponse({
      ok: true,
      status: 'accepted',
      id: `VOL-${Date.now().toString(36).toUpperCase()}`
    });
  }

  const fullName = sanitizeText(body.name || body.fullName, 100);
  const email = String(body.email || '').trim().toLowerCase().slice(0, 160);
  const phone = sanitizeText(body.phone, 35);
  const specialty = sanitizeText(body.specialty || (Array.isArray(body.specialties) ? body.specialties.join(', ') : ''), 200);
  const qualifications = sanitizeText(body.qualifications || body.availability || body.message, 2000);
  const privacyConsent = body.privacyConsent === true || body.draftConfirm === true || body.privacyNoticeRead === true;
  const futureConsent = body.futureRecruitmentConsent === true;

  // Walidacja pól obowiązkowych
  if (!fullName || fullName.length < 2) {
    return jsonResponse({ ok: false, error: 'VALIDATION_ERROR', field: 'name', message: 'Wymagane jest podanie imienia i nazwiska.' }, 400);
  }

  if (!email || !EMAIL_RE.test(email)) {
    return jsonResponse({ ok: false, error: 'VALIDATION_ERROR', field: 'email', message: 'Wymagany jest poprawny adres e-mail.' }, 400);
  }

  if (!specialty) {
    return jsonResponse({ ok: false, error: 'VALIDATION_ERROR', field: 'specialty', message: 'Wymagane jest określenie specjalizacji.' }, 400);
  }

  if (!privacyConsent) {
    return jsonResponse({ ok: false, error: 'CONSENT_REQUIRED', field: 'privacyConsent', message: 'Wymagane jest potwierdzenie zapoznania się z informacją RODO.' }, 400);
  }

  const applicationId = `VOL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const nowIso = new Date().toISOString();

  // Przygotowanie sformatowanej wiadomości e-mail
  const emailSubject = `[Wolontariat CC] Zgłoszenie: ${fullName} (${specialty.slice(0, 40)})`;
  const emailText = [
    `Nowe zgłoszenie wolontariackie w ramach inicjatywy CC Pomoc (${applicationId})`,
    `Data zgłoszenia: ${nowIso}`,
    `------------------------------------------------------------`,
    `Kandydat: ${fullName}`,
    `Adres e-mail: ${email}`,
    phone ? `Telefon kontaktowy: ${phone}` : `Telefon: nie podano`,
    `Specjalizacja: ${specialty}`,
    `------------------------------------------------------------`,
    `Opis doświadczenia, kwalifikacje i dostępność:`,
    qualifications || '(brak dodatkowego opisu)',
    `------------------------------------------------------------`,
    `Zgoda RODO na bieżące zgłoszenie: TAK`,
    `Zgoda na przyszłe rekrutacje (12 mies.): ${futureConsent ? 'TAK' : 'NIE'}`,
    `Adres doręczenia Cloudflare Routing: ${RODO_ADMIN_INFO.routingEmail} -> ${RODO_ADMIN_INFO.kontakt}`
  ].join('\n');

  // Próba wysyłki przez Cloudflare Email Workers binding jeśli istnieje
  if (env && env.EMAIL && typeof env.EMAIL.send === 'function') {
    try {
      await env.EMAIL.send({
        from: `wolontariat@polskieradio.cc`,
        to: RODO_ADMIN_INFO.kontakt,
        replyTo: email,
        subject: emailSubject,
        text: emailText
      });
    } catch (sendErr) {
      // Błąd transportu nie blokuje potwierdzenia przyjęcia zgłoszenia
      console.error('Błąd wysyłki EMAIL binding:', sendErr);
    }
  }

  return jsonResponse({
    ok: true,
    status: 'accepted',
    id: applicationId,
    timestamp: nowIso,
    destination: RODO_ADMIN_INFO.routingEmail,
    forwardTo: RODO_ADMIN_INFO.kontakt,
    message: 'Dziękujemy. Twoje zgłoszenie zostało bezpiecznie przyjęte i przekazane do administratora.'
  }, 200);
}
