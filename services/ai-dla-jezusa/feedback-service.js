import { readLimitedText } from './cost-guard.js';
import { requireVerifiedOwner } from './owner-workspace.js';

const MAX_FEEDBACK_BODY_BYTES = 4096;
const FEEDBACK_RATE_WINDOW_MS = 60_000;
const FEEDBACK_MAX_PER_MIN = 15;
const ALLOWED_KINDS = new Set(['opinion', 'thumbs_up', 'thumbs_down', 'favorite']);
const ALLOWED_CATEGORIES = new Set(['pomocna', 'biblijna', 'za_dluga', 'blad', 'inne', 'brak']);

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+?\d[\d\s\-()]{6,}\d)/g;

const feedbackBuckets = new Map();

const FB_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
};

const OWNER_FB_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
  Vary: 'Authorization'
};

export function resetFeedbackRateState() {
  feedbackBuckets.clear();
}

function checkFeedbackRate(ip = 'anon', now = Date.now()) {
  const key = String(ip || 'anon').split(',')[0].trim() || 'anon';
  const entry = feedbackBuckets.get(key);
  if (!entry || now - entry.start >= FEEDBACK_RATE_WINDOW_MS) {
    feedbackBuckets.set(key, { start: now, count: 1 });
    if (feedbackBuckets.size > 2000) {
      for (const [k, v] of feedbackBuckets.entries()) {
        if (now - v.start >= FEEDBACK_RATE_WINDOW_MS) feedbackBuckets.delete(k);
      }
    }
    return true;
  }
  if (entry.count >= FEEDBACK_MAX_PER_MIN) return false;
  entry.count += 1;
  return true;
}

function scrubPii(raw, maxLen) {
  return String(raw || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .replace(EMAIL_RE, '[EMAIL_REDACTED]')
    .replace(PHONE_RE, '[PHONE_REDACTED]')
    .trim()
    .slice(0, maxLen);
}

function csvSafeCell(val) {
  let s = String(val ?? '').replace(/\r?\n/g, ' ');
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function handleAiFeedbackPost(request, env = {}, _deps = {}, corsHeaders = {}) {
  if (request.method !== 'POST') {
    return Response.json(
      { ok: false, error: 'method_not_allowed' },
      { status: 405, headers: { ...FB_HEADERS, ...corsHeaders } }
    );
  }

  if (request.headers.has('Origin') && request.headers.get('Origin') !== new URL(request.url).origin) {
    return Response.json(
      { ok: false, error: 'origin_not_allowed' },
      { status: 403, headers: FB_HEADERS }
    );
  }

  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'anon';
  if (!checkFeedbackRate(ip)) {
    return Response.json(
      { ok: false, error: 'rate_limit_exceeded', detail: 'Zbyt wiele zgłoszeń. Odczekaj chwilę.' },
      { status: 429, headers: { ...FB_HEADERS, ...corsHeaders, 'Retry-After': '60' } }
    );
  }

  const rawText = await readLimitedText(request, MAX_FEEDBACK_BODY_BYTES);
  if (rawText === null) {
    return Response.json(
      { ok: false, error: 'payload_too_large' },
      { status: 413, headers: { ...FB_HEADERS, ...corsHeaders } }
    );
  }

  let body;
  try {
    body = JSON.parse(rawText || '{}');
  } catch {
    return Response.json(
      { ok: false, error: 'invalid_json' },
      { status: 400, headers: { ...FB_HEADERS, ...corsHeaders } }
    );
  }

  if (body?.privateMode === true) {
    return Response.json(
      { ok: true, stored: false, reason: 'private_mode' },
      { status: 200, headers: { ...FB_HEADERS, ...corsHeaders } }
    );
  }

  const kind = String(body?.kind || '').trim();
  if (!ALLOWED_KINDS.has(kind)) {
    return Response.json(
      { ok: false, error: 'invalid_kind' },
      { status: 400, headers: { ...FB_HEADERS, ...corsHeaders } }
    );
  }

  let rating = null;
  if (body?.rating !== undefined && body?.rating !== null && body?.rating !== '') {
    const n = Number(body.rating);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      return Response.json(
        { ok: false, error: 'invalid_rating' },
        { status: 400, headers: { ...FB_HEADERS, ...corsHeaders } }
      );
    }
    rating = n;
  }

  const rawCat = String(body?.category || 'brak').trim().toLowerCase();
  const category = ALLOWED_CATEGORIES.has(rawCat) ? rawCat : 'inne';
  const comment = scrubPii(body?.comment || '', 500);
  const assistantId = scrubPii(body?.assistantId || 'ai-dla-jezusa', 40) || 'ai-dla-jezusa';
  const mode = scrubPii(body?.mode || 'CC Auto', 40) || 'CC Auto';
  const modelId = scrubPii(body?.modelId || 'auto', 64) || 'auto';
  const promptExcerpt = scrubPii(body?.promptExcerpt || '', 160);
  const replyExcerpt = scrubPii(body?.replyExcerpt || '', 240);

  if (!env?.AI_COST_DB || typeof env.AI_COST_DB.prepare !== 'function') {
    return Response.json(
      { ok: false, error: 'feedback_db_unavailable' },
      { status: 503, headers: { ...FB_HEADERS, ...corsHeaders } }
    );
  }

  const id = typeof crypto?.randomUUID === 'function'
    ? `fb-${crypto.randomUUID()}`
    : `fb-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const createdAt = new Date().toISOString();

  try {
    await env.AI_COST_DB.prepare(`
      INSERT INTO ai_feedback (
        id, created_at, kind, rating, category, comment,
        assistant_id, mode, model_id, prompt_excerpt, reply_excerpt
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
    `)
      .bind(id, createdAt, kind, rating, category, comment, assistantId, mode, modelId, promptExcerpt, replyExcerpt)
      .run();
  } catch {
    return Response.json(
      { ok: false, error: 'feedback_write_failed' },
      { status: 503, headers: { ...FB_HEADERS, ...corsHeaders } }
    );
  }

  return Response.json(
    { ok: true, id, createdAt, stored: true },
    { status: 201, headers: { ...FB_HEADERS, ...corsHeaders } }
  );
}

export async function handleOwnerFeedbackGet(request, env = {}, deps = {}, corsHeaders = {}) {
  if (request.method !== 'GET') {
    return Response.json(
      { ok: false, error: 'method_not_allowed' },
      { status: 405, headers: { ...OWNER_FB_HEADERS, ...corsHeaders } }
    );
  }

  const check = await requireVerifiedOwner(request, env, deps, corsHeaders);
  if (check.error) return check.error;

  if (!env?.AI_COST_DB || typeof env.AI_COST_DB.prepare !== 'function') {
    return Response.json(
      { ok: false, error: 'feedback_db_unavailable' },
      { status: 503, headers: { ...OWNER_FB_HEADERS, ...corsHeaders } }
    );
  }

  const url = new URL(request.url);
  const rawLimit = Number(url.searchParams.get('limit') || '60');
  const limit = Number.isFinite(rawLimit) ? Math.min(200, Math.max(1, Math.trunc(rawLimit))) : 60;
  const rawKind = String(url.searchParams.get('kind') || '').trim();
  const kindFilter = ALLOWED_KINDS.has(rawKind) ? rawKind : '';
  const format = String(url.searchParams.get('format') || 'json').trim().toLowerCase();

  try {
    const summary = await env.AI_COST_DB.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN kind = 'opinion' THEN 1 ELSE 0 END) AS opinions,
        SUM(CASE WHEN kind = 'thumbs_up' THEN 1 ELSE 0 END) AS thumbs_up,
        SUM(CASE WHEN kind = 'thumbs_down' THEN 1 ELSE 0 END) AS thumbs_down,
        SUM(CASE WHEN kind = 'favorite' THEN 1 ELSE 0 END) AS favorites,
        ROUND(AVG(CASE WHEN kind = 'opinion' AND rating IS NOT NULL THEN rating END), 2) AS avg_rating
      FROM ai_feedback
    `).first();

    const rowsRes = kindFilter
      ? await env.AI_COST_DB.prepare(`
          SELECT id, created_at, kind, rating, category, comment, assistant_id, mode, model_id, prompt_excerpt, reply_excerpt
          FROM ai_feedback
          WHERE kind = ?1
          ORDER BY created_at DESC
          LIMIT ?2
        `).bind(kindFilter, limit).all()
      : await env.AI_COST_DB.prepare(`
          SELECT id, created_at, kind, rating, category, comment, assistant_id, mode, model_id, prompt_excerpt, reply_excerpt
          FROM ai_feedback
          ORDER BY created_at DESC
          LIMIT ?1
        `).bind(limit).all();

    const items = Array.isArray(rowsRes?.results) ? rowsRes.results : [];

    if (format === 'csv') {
      const header = 'created_at,kind,rating,category,comment,assistant_id,mode,model_id,prompt_excerpt';
      const lines = items.map((r) => [
        csvSafeCell(r.created_at),
        csvSafeCell(r.kind),
        csvSafeCell(r.rating ?? ''),
        csvSafeCell(r.category),
        csvSafeCell(r.comment),
        csvSafeCell(r.assistant_id),
        csvSafeCell(r.mode),
        csvSafeCell(r.model_id),
        csvSafeCell(r.prompt_excerpt)
      ].join(','));
      const csvBody = '\uFEFF' + [header, ...lines].join('\r\n');
      return new Response(csvBody, {
        status: 200,
        headers: {
          ...OWNER_FB_HEADERS,
          ...corsHeaders,
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="ai-dla-jezusa-opinie.csv"'
        }
      });
    }

    return Response.json(
      {
        ok: true,
        ownerEmail: check.owner.email,
        summary: {
          total: Number(summary?.total || 0),
          opinions: Number(summary?.opinions || 0),
          thumbs_up: Number(summary?.thumbs_up || 0),
          thumbs_down: Number(summary?.thumbs_down || 0),
          favorites: Number(summary?.favorites || 0),
          avg_rating: summary?.avg_rating ?? null
        },
        items
      },
      { status: 200, headers: { ...OWNER_FB_HEADERS, ...corsHeaders } }
    );
  } catch {
    return Response.json(
      { ok: false, error: 'feedback_read_failed' },
      { status: 503, headers: { ...OWNER_FB_HEADERS, ...corsHeaders } }
    );
  }
}
