// A daily count of voluntary confirmations. Store rotating random IDs, never account or network data.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const formatDay = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' });
const response = (body, status = 200) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }
});

export async function handlePrayerCounter(request, db, now = new Date()) {
  const method = request.method;
  if (method !== 'GET' && method !== 'POST') return response({ error: 'method_not_allowed' }, 405);
  if (!db) return response({ error: 'counter_unavailable' }, 503);
  const day = formatDay.format(now);
  const countQuery = db.prepare('SELECT COUNT(*) AS count FROM prayer_40dm_confirmations WHERE day = ?').bind(day);
  try {
    if (method === 'GET') return response({ day, count: Number((await countQuery.first()).count) });
    if (request.headers.get('Origin') !== new URL(request.url).origin) return response({ error: 'origin_required' }, 403);
    if (request.headers.get('Content-Type')?.split(';', 1)[0] !== 'text/plain') return response({ error: 'bad_type' }, 415);
    const reader = request.body?.getReader();
    if (!reader) return response({ error: 'invalid_token' }, 400);
    let token = '';
    const decoder = new TextDecoder();
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) { token += decoder.decode(); break; }
        if (value.byteLength + token.length > 36) return response({ error: 'invalid_token' }, 400);
        token += decoder.decode(value, { stream: true });
      }
    } finally {
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    }
    if (!UUID.test(token)) return response({ error: 'invalid_token' }, 400);
    const [, , result] = await db.batch([
      db.prepare('DELETE FROM prayer_40dm_confirmations WHERE day < ?').bind(day),
      db.prepare('INSERT OR IGNORE INTO prayer_40dm_confirmations (day, token) VALUES (?, ?)').bind(day, token),
      countQuery
    ]);
    return response({ day, count: Number(result.results[0].count) });
  } catch {
    return response({ error: 'counter_unavailable' }, 503);
  }
}
