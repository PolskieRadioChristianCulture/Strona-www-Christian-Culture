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
