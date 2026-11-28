// ============================================================================
// Kazania z Pasją — Backend API udostępniania kazań przez Dysk Google / Docs
// Moduł: services/kazania/kazania-service.js
// Baza: Cloudflare D1 (env.milion_db) | Auth: LUMINA (Firebase ID Token)
// Zero-QA: walidacja linków Google Drive/Docs, limity, moderacja, brak wycieku PII
// ============================================================================

export const KAZANIA_CATEGORIES = [
  'Jezus Chrystus',
  'Ewangelia i zbawienie',
  'Wiara i modlitwa',
  'Proroctwa biblijne',
  'Duch Święty',
  'Misja i ewangelizacja',
  'Rodzina i relacje',
  'Uczniostwo',
  'Życie chrześcijańskie',
  'Kazania okolicznościowe',
  'Studia ksiąg biblijnych',
  'Serie kaznodziejskie',
];

export const KAZANIA_FORMATS = new Set(['mp3', 'pdf', 'doc', 'outline']);
export const ADMIN_EMAILS = new Set(['nazirczarkes@gmail.com']);

const DRIVE_ID_RE = /^[A-Za-z0-9_-]{15,80}$/;
const INVALID_DRIVE_MSG =
  'Dozwolone są wyłącznie publiczne linki z Dysku Google (drive.google.com) lub Dokumentów Google (docs.google.com).';

function sanitizeText(value, maxLen = 500) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g, '')
    .trim()
    .slice(0, maxLen);
}

function sanitizeMultiline(value, maxLen = 12000) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, maxLen);
}

function jsonResp(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  });
}

/**
 * Waliduje i normalizuje publiczny link Google Drive / Google Docs do bezpiecznych adresów podglądu i pobierania.
 */
export function parseGoogleDriveLink(rawUrl) {
  const input = String(rawUrl || '').trim();
  if (!input || input.length > 600) {
    return { valid: false, error: INVALID_DRIVE_MSG };
  }
  let u;
  try {
    u = new URL(input);
  } catch {
    return { valid: false, error: INVALID_DRIVE_MSG };
  }
  if (u.protocol !== 'https:') {
    return { valid: false, error: INVALID_DRIVE_MSG };
  }
  const host = u.hostname.toLowerCase();
  if (host !== 'drive.google.com' && host !== 'docs.google.com') {
    return { valid: false, error: INVALID_DRIVE_MSG };
  }

  let fileId = '';
  if (host === 'drive.google.com') {
    const fileMatch = u.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)(?:\/|$)/);
    if (fileMatch) {
      fileId = fileMatch[1];
    } else if (u.pathname === '/open' || u.pathname === '/uc') {
      fileId = u.searchParams.get('id') || '';
    }
    if (!DRIVE_ID_RE.test(fileId)) {
      return { valid: false, error: INVALID_DRIVE_MSG };
    }
    return {
      valid: true,
      provider: 'drive',
      fileId,
      canonicalUrl: `https://drive.google.com/file/d/${fileId}/view`,
      previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
    };
  }

  // docs.google.com
  const docMatch = u.pathname.match(/^\/document\/d\/([A-Za-z0-9_-]+)(?:\/|$)/);
  if (docMatch) {
    fileId = docMatch[1];
  }
  if (!DRIVE_ID_RE.test(fileId)) {
    return { valid: false, error: INVALID_DRIVE_MSG };
  }
  return {
    valid: true,
    provider: 'gdocs',
    fileId,
    canonicalUrl: `https://docs.google.com/document/d/${fileId}/view`,
    previewUrl: `https://docs.google.com/document/d/${fileId}/preview`,
    downloadUrl: `https://docs.google.com/document/d/${fileId}/export?format=pdf`,
  };
}

export function isAdminUser(verified) {
  return Boolean(
    verified &&
      verified.email_verified === true &&
      ADMIN_EMAILS.has(String(verified.email || '').toLowerCase())
  );
}

export function isNonAnonymous(verified) {
  return Boolean(
    verified &&
      typeof verified.sub === 'string' &&
      verified.sub.length > 0 &&
      verified.firebase?.sign_in_provider !== 'anonymous'
  );
}

let schemaReady = false;
async function ensureSchema(db) {
  if (schemaReady) return;
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS cc_kazania_submissions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        ref TEXT,
        cat TEXT NOT NULL,
        series TEXT,
        desc TEXT NOT NULL,
        format TEXT NOT NULL,
        drive_url TEXT,
        drive_provider TEXT,
        drive_file_id TEXT,
        drive_preview_url TEXT,
        drive_download_url TEXT,
        outline_text TEXT,
        apply_text TEXT,
        author_uid TEXT NOT NULL,
        author_name TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`
    )
    .run();
  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_kazania_status_created ON cc_kazania_submissions(status, created_at DESC)`
    )
    .run();
  schemaReady = true;
}

function mapSubmissionRow(row, viewerUid) {
  return {
    id: row.id,
    title: row.title,
    ref: row.ref || '',
    cat: row.cat,
    series: row.series || 'Kazania społeczności',
    desc: row.desc,
    format: row.format,
    driveUrl: row.drive_url || '',
    driveProvider: row.drive_provider || '',
    driveFileId: row.drive_file_id || '',
    drivePreviewUrl: row.drive_preview_url || '',
    driveDownloadUrl: row.drive_download_url || '',
    outlineText: row.outline_text || '',
    apply: row.apply_text || '',
    authorName: row.author_name || 'Kaznodzieja LUMINA',
    isMine: Boolean(viewerUid && row.author_uid === viewerUid),
    status: row.status,
    createdAt: row.created_at,
    publishedDate: String(row.created_at || '').slice(0, 10),
    isCommunity: true,
    isDemo: false,
  };
}

export async function handleKazaniaApi(request, env, { verifyToken } = {}) {
  const db = env?.milion_db;
  if (!db) {
    return jsonResp({ ok: false, error: 'Database unavailable' }, 503);
  }

  try {
    await ensureSchema(db);
  } catch (err) {
    return jsonResp({ ok: false, error: 'Schema initialization failed' }, 500);
  }

  const url = new URL(request.url);
  const authHeader = request.headers.get('Authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  let verified = null;
  if (bearer && typeof verifyToken === 'function') {
    try {
      verified = await verifyToken(bearer);
    } catch {
      verified = null;
    }
  }
  const admin = isAdminUser(verified);
  const member = isNonAnonymous(verified);
  const viewerUid = member ? verified.sub : '';

  // GET /api/kazania/community
  if (url.pathname === '/api/kazania/community' && request.method === 'GET') {
    let rows = [];
    if (admin) {
      const res = await db
        .prepare(
          `SELECT * FROM cc_kazania_submissions WHERE status IN ('published', 'pending') ORDER BY created_at DESC LIMIT 100`
        )
        .all();
      rows = res?.results || [];
    } else if (member) {
      const res = await db
        .prepare(
          `SELECT * FROM cc_kazania_submissions WHERE status = 'published' OR (author_uid = ? AND status = 'pending') ORDER BY created_at DESC LIMIT 100`
        )
        .bind(viewerUid)
        .all();
      rows = res?.results || [];
    } else {
      const res = await db
        .prepare(
          `SELECT * FROM cc_kazania_submissions WHERE status = 'published' ORDER BY created_at DESC LIMIT 100`
        )
        .all();
      rows = res?.results || [];
    }

    return jsonResp({
      ok: true,
      isAdmin: admin,
      items: rows.map((r) => mapSubmissionRow(r, viewerUid)),
    });
  }

  // POST /api/kazania/submit
  if (url.pathname === '/api/kazania/submit' && request.method === 'POST') {
    if (!member) {
      return jsonResp(
        { ok: false, error: 'Zaloguj się kontem LUMINA (Google), aby udostępnić kazanie.' },
        401
      );
    }
    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      return jsonResp({ ok: false, error: 'Wymagany nagłówek Content-Type: application/json.' }, 415);
    }
    const raw = await request.text();
    if (raw.length > 24 * 1024) {
      return jsonResp({ ok: false, error: 'Przekroczono maksymalny rozmiar danych (24 KB).' }, 413);
    }
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return jsonResp({ ok: false, error: 'Nieprawidłowy format JSON.' }, 400);
    }

    if (!admin) {
      const cutoff = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const rateRes = await db
        .prepare(
          `SELECT COUNT(*) AS cnt FROM cc_kazania_submissions WHERE author_uid = ? AND created_at >= ?`
        )
        .bind(viewerUid, cutoff)
        .first();
      if ((rateRes?.cnt || 0) >= 5) {
        return jsonResp(
          { ok: false, error: 'Limit dzienny (5 kazań na 24h) został osiągnięty.' },
          429
        );
      }
    }

    const title = sanitizeText(body?.title, 140);
    const ref = sanitizeText(body?.ref, 80);
    const cat = sanitizeText(body?.cat, 80);
    const series = sanitizeText(body?.series, 80) || 'Kazania społeczności';
    const desc = sanitizeText(body?.desc, 600);
    const format = sanitizeText(body?.format, 20).toLowerCase();
    const rawDriveUrl = sanitizeText(body?.driveUrl, 600);
    const outlineText = sanitizeMultiline(body?.outlineText, 12000);
    const applyText = sanitizeText(body?.apply, 500);
    const authorName =
      sanitizeText(body?.authorName, 60) ||
      sanitizeText(verified.name, 60) ||
      'Kaznodzieja LUMINA';

    if (title.length < 3) {
      return jsonResp({ ok: false, error: 'Tytuł kazania musi mieć co najmniej 3 znaki.' }, 400);
    }
    if (!KAZANIA_CATEGORIES.includes(cat)) {
      return jsonResp({ ok: false, error: 'Wybierz poprawną kategorię kazania.' }, 400);
    }
    if (desc.length < 10) {
      return jsonResp({ ok: false, error: 'Krótki opis musi mieć co najmniej 10 znaków.' }, 400);
    }
    if (!KAZANIA_FORMATS.has(format)) {
      return jsonResp({ ok: false, error: 'Wybierz poprawny format (mp3, pdf, doc lub outline).' }, 400);
    }

    let driveParsed = null;
    if (format !== 'outline' && !rawDriveUrl) {
      return jsonResp(
        { ok: false, error: 'Wklej publiczny link z Dysku Google lub Dokumentów Google.' },
        400
      );
    }
    if (rawDriveUrl) {
      driveParsed = parseGoogleDriveLink(rawDriveUrl);
      if (!driveParsed.valid) {
        return jsonResp({ ok: false, error: driveParsed.error }, 400);
      }
    }
    if (format === 'outline' && !rawDriveUrl && outlineText.length < 30) {
      return jsonResp(
        { ok: false, error: 'Wpisz treść konspektu (min. 30 znaków) lub podaj link Google Docs / Drive.' },
        400
      );
    }

    const nowIso = new Date().toISOString();
    const id = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 12);
    const status = admin ? 'published' : 'pending';

    const row = {
      id,
      title,
      ref,
      cat,
      series,
      desc,
      format,
      drive_url: driveParsed ? driveParsed.canonicalUrl : '',
      drive_provider: driveParsed ? driveParsed.provider : '',
      drive_file_id: driveParsed ? driveParsed.fileId : '',
      drive_preview_url: driveParsed ? driveParsed.previewUrl : '',
      drive_download_url: driveParsed ? driveParsed.downloadUrl : '',
      outline_text: outlineText,
      apply_text: applyText,
      author_uid: viewerUid,
      author_name: authorName,
      status,
      created_at: nowIso,
      updated_at: nowIso,
    };

    await db
      .prepare(
        `INSERT INTO cc_kazania_submissions (
          id, title, ref, cat, series, desc, format,
          drive_url, drive_provider, drive_file_id, drive_preview_url, drive_download_url,
          outline_text, apply_text, author_uid, author_name, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        row.id,
        row.title,
        row.ref,
        row.cat,
        row.series,
        row.desc,
        row.format,
        row.drive_url,
        row.drive_provider,
        row.drive_file_id,
        row.drive_preview_url,
        row.drive_download_url,
        row.outline_text,
        row.apply_text,
        row.author_uid,
        row.author_name,
        row.status,
        row.created_at,
        row.updated_at
      )
      .run();

    return jsonResp(
      {
        ok: true,
        id,
        status,
        item: mapSubmissionRow(row, viewerUid),
      },
      201
    );
  }

  // POST /api/kazania/moderate
  if (url.pathname === '/api/kazania/moderate' && request.method === 'POST') {
    if (!admin) {
      return jsonResp({ ok: false, error: 'Brak uprawnień administratora.' }, 403);
    }
    let body;
    try {
      body = JSON.parse(await request.text());
    } catch {
      return jsonResp({ ok: false, error: 'Nieprawidłowy format JSON.' }, 400);
    }
    const id = sanitizeText(body?.id, 40);
    const action = sanitizeText(body?.action, 20).toLowerCase();
    if (!id || (action !== 'approve' && action !== 'reject')) {
      return jsonResp({ ok: false, error: 'Wymagane id oraz action (approve|reject).' }, 400);
    }
    const nextStatus = action === 'approve' ? 'published' : 'rejected';
    const existing = await db
      .prepare(`SELECT id FROM cc_kazania_submissions WHERE id = ?`)
      .bind(id)
      .first();
    if (!existing) {
      return jsonResp({ ok: false, error: 'Nie znaleziono zgłoszenia.' }, 404);
    }
    await db
      .prepare(`UPDATE cc_kazania_submissions SET status = ?, updated_at = ? WHERE id = ?`)
      .bind(nextStatus, new Date().toISOString(), id)
      .run();

    return jsonResp({ ok: true, id, status: nextStatus });
  }

  // DELETE /api/kazania/item/<id>
  if (url.pathname.startsWith('/api/kazania/item/') && request.method === 'DELETE') {
    if (!member) {
      return jsonResp({ ok: false, error: 'Wymagane logowanie.' }, 401);
    }
    const id = sanitizeText(url.pathname.slice('/api/kazania/item/'.length), 60);
    if (!id) {
      return jsonResp({ ok: false, error: 'Brak ID.' }, 400);
    }
    const existing = await db
      .prepare(`SELECT id, author_uid FROM cc_kazania_submissions WHERE id = ?`)
      .bind(id)
      .first();
    if (!existing) {
      return jsonResp({ ok: false, error: 'Nie znaleziono kazania.' }, 404);
    }
    if (existing.author_uid !== viewerUid && !admin) {
      return jsonResp({ ok: false, error: 'Możesz usunąć wyłącznie własne kazanie.' }, 403);
    }
    await db.prepare(`DELETE FROM cc_kazania_submissions WHERE id = ?`).bind(id).run();
    return jsonResp({ ok: true, deleted: id });
  }

  return jsonResp({ ok: false, error: 'Not found' }, 404);
}
