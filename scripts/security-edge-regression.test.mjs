import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../_worker.js';

const env = {
  ASSETS: {
    fetch: async (request) => new Response(`asset:${new URL(request.url).pathname}`, { status: 200 }),
  },
};

for (const path of [
  '/.github/DISPATCH_BOARD.md',
  '/.agents/skills/firebase-basics/SKILL.md',
  '/scripts/agent-matrix/.matrix_sessions/agent-01/Default/Network/Cookies',
  '/firebase_functions/index.js',
  '/cloudflare/push/README.md',
  '/cloudflare-worker/lumina-push/src/index.js',
  '/lib/cc-ai-gateway/index.js',
  '/tests/cc-ai-gateway/runtime.test.mjs',
  '/index.html.bak',
  '/firebase.json',
  '/package.json',
]) {
  test(`edge blocks ${path}`, async () => {
    const response = await worker.fetch(new Request(`https://polskieradio.cc${path}`), env);
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  });
}

test('edge serves public portal routes through the asset binding', async () => {
  for (const path of ['/', '/lumina', '/tablica', '/rolki', '/firebase-messaging-sw.js']) {
    const response = await worker.fetch(new Request(`https://polskieradio.cc${path}`), env);
    assert.equal(response.status, 200);
  }
});

test('private release paths are denied for GET and HEAD before any old cached asset is read', async () => {
  let assetReads = 0;
  const cachedEnv = { ASSETS: { fetch: async () => { assetReads++; return new Response('CACHED_PRIVATE_FIXTURE'); } } };
  for (const path of [
    '/data/whatsapp_hooks_state.json', '/data/whatsapp_zaczepki_log.json', '/data/whatsapp_zaczepki_state.json',
    '/Repozytoria-CC/skrzynka/global-previews/private.png', '/%52epozytoria-CC/private.json',
    '/.cursor/rules/private.mdc', '/.codex/config.json', '/.git/config', '/.claude/settings.json',
    '/JOMA_SHARED_MEMORY/private.json', '/.env.production', '/nested/.ENV.LOCAL',
    '/serviceAccountKey.json', '/luminaServiceAccountKey.json', '/cudaServiceAccountKey.json',
    '/nested/custom_service_account_key.json', '/config/service-account.json', '/project-firebase-adminsdk-example.json',
    '/storage.rules', '/firestore.rules',
    '/cert/private.pem', '/cert/private.KEY', '/cert/client.p12', '/cert/client.pfx',
  ]) {
    for (const method of ['GET', 'HEAD']) {
      const response = await worker.fetch(new Request(`https://polskieradio.cc${path}`, { method }), cachedEnv);
      assert.equal(response.status, 404, `${method} ${path}`);
      assert.equal(response.headers.get('Cache-Control'), 'no-store');
      assert.ok(!(await response.text()).includes('CACHED_PRIVATE_FIXTURE'));
    }
  }
  assert.equal(assetReads, 0);
});

test('Cloudflare Pages _routes.json excludes high-volume static assets while keeping all APIs and private paths guarded', async () => {
  const { readFileSync } = await import('node:fs');
  const routes = JSON.parse(readFileSync(new URL('../_routes.json', import.meta.url), 'utf8'));
  assert.equal(routes.version, 1);
  assert.ok(Array.isArray(routes.include) && routes.include.includes('/*'));
  assert.ok(Array.isArray(routes.exclude) && routes.exclude.length > 0);
  const allRules = [...routes.include, ...routes.exclude];
  assert.ok(allRules.length <= 100, `Cloudflare Pages allows max 100 rules, got ${allRules.length}`);
  for (const rule of allRules) {
    assert.ok(typeof rule === 'string' && rule.startsWith('/') && rule.length <= 100, `Invalid rule: ${rule}`);
    const starIdx = rule.indexOf('*');
    if (starIdx !== -1) assert.equal(starIdx, rule.length - 1, `Wildcard allowed only at end: ${rule}`);
  }
  const matchesExclude = (p) => routes.exclude.some((rule) => (
    rule.endsWith('*') ? p.startsWith(rule.slice(0, -1)) : p === rule
  ));
  for (const mustInvokeWorker of [
    '/api/topten/charts',
    '/api/newsletter/stats',
    '/topTEN/',
    '/sitemaps/topten.xml',
    '/the-journal',
    '/lumina.zbyszekgieron',
    '/avatar_zbyszek_gieron.jpg',
    '/data/whatsapp_hooks_state.json',
    '/ccMC/gcalendar-live-report.json',
    '/.git/config',
    '/.env',
    '/lumina-db.js',
    '/firebase-messaging-sw.js',
  ]) {
    assert.equal(matchesExclude(mustInvokeWorker), false, `${mustInvokeWorker} must NOT bypass _worker.js`);
  }
  for (const mustBypassWorker of [
    '/images/holos/holos_hero_bg.jpg',
    '/assets/promo/promo-kartki-16x9.webp',
    '/js/cc-global-auth.js',
    '/css/cc-mobile-edge.css',
    '/components/cc-omni-search.js',
    '/audio/worship/track.mp3',
    '/data/bible/ubg-2025/PRO-003.json',
    '/kartki/assets/hero-urodziny-cc.webp',
    '/topTEN/assets/topten-logo.png',
    '/robots.txt',
    '/sitemap.xml',
  ]) {
    assert.equal(matchesExclude(mustBypassWorker), true, `${mustBypassWorker} should bypass _worker.js`);
  }
});
