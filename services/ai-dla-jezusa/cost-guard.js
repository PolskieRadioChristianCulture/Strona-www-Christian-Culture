export const SHARED_MODEL = 'gemini-3.1-flash-lite';

export function sharedAiReady(env) {
  return env.AI_SHARED_FREE_PROJECT_VERIFIED === 'true' && typeof env.AI_COST_DB?.prepare === 'function'
    && /^[1-9][0-9]{0,2}$/.test(String(env.AI_DAILY_ATTEMPT_LIMIT || ''))
    && Boolean(env.AI_SHARED_FREE_GEMINI_KEY);
}

export async function reserveSharedAiAttempt(env, now = new Date()) {
  if (!sharedAiReady(env)) return false;
  try {
    const row = await env.AI_COST_DB.prepare(`
      INSERT INTO ai_daily_attempts (day, attempts) VALUES (?1, 1)
      ON CONFLICT(day) DO UPDATE SET attempts = attempts + 1 WHERE attempts < ?2
      RETURNING attempts
    `).bind(now.toISOString().slice(0, 10), Number(env.AI_DAILY_ATTEMPT_LIMIT)).first();
    return Boolean(row?.attempts);
  } catch {
    return false;
  }
}

export async function readLimitedText(request, maxBytes) {
  if (Number(request.headers.get('content-length')) > maxBytes) return null;
  const reader = request.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder();
  let bytes = 0, text = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return text + decoder.decode();
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}
