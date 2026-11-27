import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const ALLOWED_PILLARS = new Set(['news', 'event', 'offer']);
export const ALLOWED_POST_TYPES = new Set(['UPDATE', 'EVENT', 'OFFER']);
export const COOLDOWN_HOURS = 36;
export const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;
export const MAX_GBP_IMAGE_BYTES = 5 * 1024 * 1024;
export const MIN_SUMMARY_CHARS = 100;
export const MAX_SUMMARY_CHARS = 1400;
export const MAX_EVENT_TITLE_CHARS = 58;

const PHONE_REGEX = /(?:\+\d[\d\s-]{6,}\d|\b(?:\d[\s-]?){7,}\b)/;
const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const URL_REGEX = /(?:https?:\/\/|www\.)/i;
const FORBIDDEN_CC_REGEX = /\b(?:mission\s+control|bartek|sms)\b/i;

export function validateGbpPost(post, repoRoot) {
  const errors = [];
  if (!post || typeof post !== 'object') {
    return { valid: false, errors: ['Post musi być obiektem JSON.'] };
  }

  const id = String(post.id || '').trim();
  if (!id) errors.push('Brak wymaganego pola id.');

  if (!ALLOWED_PILLARS.has(post.pillar)) {
    errors.push(`Nieprawidłowy pillar "${post.pillar}" (dozwolone: news, event, offer).`);
  }
  if (!ALLOWED_POST_TYPES.has(post.postType)) {
    errors.push(`Nieprawidłowy postType "${post.postType}" (dozwolone: UPDATE, EVENT, OFFER).`);
  }

  const summary = String(post.summary || '').trim();
  if (summary.length < MIN_SUMMARY_CHARS || summary.length > MAX_SUMMARY_CHARS) {
    errors.push(`Długość summary (${summary.length}) poza zakresem ${MIN_SUMMARY_CHARS}–${MAX_SUMMARY_CHARS} znaków.`);
  }
  if (PHONE_REGEX.test(summary)) {
    errors.push('Bramka Google: zakaz numerów telefonów w treści posta (summary).');
  }
  if (EMAIL_REGEX.test(summary)) {
    errors.push('Bramka Google: zakaz adresów e-mail w treści posta (summary).');
  }
  if (URL_REGEX.test(summary)) {
    errors.push('Bramka Google: zakaz gołych linków/URL w treści posta (link tylko w CTA).');
  }
  if (FORBIDDEN_CC_REGEX.test(summary)) {
    errors.push('Bramka CC: wykryto frazę zabronioną w komunikacji publicznej.');
  }

  if (post.postType === 'EVENT' || post.postType === 'OFFER') {
    const evTitle = String(post.eventTitle || '').trim();
    if (!evTitle) {
      errors.push(`Dla typu ${post.postType} wymagane jest pole eventTitle.`);
    } else if (evTitle.length > MAX_EVENT_TITLE_CHARS) {
      errors.push(`eventTitle (${evTitle.length} zn.) przekracza limit Google (${MAX_EVENT_TITLE_CHARS} zn.).`);
    }
    if (FORBIDDEN_CC_REGEX.test(evTitle)) {
      errors.push('Bramka CC: zakazana fraza w eventTitle.');
    }
  }

  const ctaLabel = String(post.ctaLabel || '').trim();
  if (!ctaLabel) errors.push('Brak pola ctaLabel.');

  const ctaUrl = String(post.ctaUrl || '').trim();
  if (!ctaUrl.startsWith('https://polskieradio.cc/')) {
    errors.push(`ctaUrl musi zaczynać się od https://polskieradio.cc/ (otrzymano: "${ctaUrl}").`);
  }

  const imagePath = String(post.imagePath || '').trim();
  if (!imagePath) {
    errors.push('Brak pola imagePath.');
  } else {
    const absImage = path.resolve(repoRoot, imagePath);
    if (!fs.existsSync(absImage)) {
      errors.push(`Brak pliku grafiki na dysku: ${absImage}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function buildTrackedCtaUrl(rawUrl, postId) {
  const url = new URL(rawUrl);
  const cleanId = String(postId || '').trim();
  url.searchParams.set('utm_source', 'gbp');
  url.searchParams.set('utm_medium', 'organic');
  url.searchParams.set('utm_campaign', cleanId.startsWith('gbp_') ? cleanId : `gbp_${cleanId}`);
  return url.toString();
}

export function prepareGbpImage4x3(srcAbsPath, outAbsPath) {
  if (!fs.existsSync(srcAbsPath)) {
    throw new Error(`Brak pliku źródłowego grafiki: ${srcAbsPath}`);
  }
  fs.mkdirSync(path.dirname(outAbsPath), { recursive: true });
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      srcAbsPath,
      '-vf',
      'scale=1200:900:force_original_aspect_ratio=increase,crop=1200:900',
      '-q:v',
      '2',
      outAbsPath
    ],
    { stdio: 'pipe' }
  );
  if (!fs.existsSync(outAbsPath)) {
    throw new Error(`Nie utworzono wynikowej grafiki 4:3: ${outAbsPath}`);
  }
  const sizeBytes = fs.statSync(outAbsPath).size;
  if (sizeBytes <= 0 || sizeBytes > MAX_GBP_IMAGE_BYTES) {
    throw new Error(`Rozmiar grafiki ${outAbsPath} (${sizeBytes} B) poza limitem 1 B – 5 MB.`);
  }
  return { outAbsPath, sizeBytes };
}

export function pickNextQueuedPost(queue, state, nowDate = new Date(), options = {}) {
  const { ignoreCooldown = false } = options;
  const nowMs = nowDate instanceof Date ? nowDate.getTime() : new Date(nowDate).getTime();

  if (!ignoreCooldown && state?.lastPublishedAt) {
    const lastMs = new Date(state.lastPublishedAt).getTime();
    if (Number.isFinite(lastMs) && nowMs - lastMs < COOLDOWN_MS) {
      return {
        allowed: false,
        reason: 'COOLDOWN_ACTIVE',
        nextAllowedAt: new Date(lastMs + COOLDOWN_MS).toISOString(),
        post: null
      };
    }
  }

  const publishedSet = new Set(Array.isArray(state?.publishedIds) ? state.publishedIds : []);
  const posts = Array.isArray(queue?.posts) ? queue.posts : [];
  const nextPost = posts.find((p) => p && p.id && !publishedSet.has(p.id));

  if (!nextPost) {
    return {
      allowed: false,
      reason: 'QUEUE_EXHAUSTED',
      nextAllowedAt: null,
      post: null
    };
  }

  return {
    allowed: true,
    reason: 'OK',
    nextAllowedAt: null,
    post: nextPost
  };
}
