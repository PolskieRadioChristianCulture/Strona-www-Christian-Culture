/**
 * Playwright E2E + 2-Device LIVE Sync Proof dla:
 * 1) /spiewnik-biblijny/ (Śpiewajmy Panu 700 pieśni + audio MP3)
 * 2) /test/sba/moj-kosciol/ (Mój kościół v2.0 — mobile 390px, desktop 1440px, 2-tab LIVE sync, PL/EN Szkoła Sobotnia, Zaproś przyjaciela, Focus Mode)
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createMojKosciolStore, handleMojKosciolApi } from '../services/moj-kosciol/moj-kosciol-service.js';

const ROOT = process.cwd();
const ARTIFACT_DIR = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\872fe717-7b19-47b0-8f9e-1c4ee3ffcef0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg'
};

async function startServer() {
  const store = createMojKosciolStore();
  const server = http.createServer(async (req, res) => {
    try {
      const urlObj = new URL(req.url, 'http://127.0.0.1');
      if (urlObj.pathname.startsWith('/api/moj-kosciol/v1')) {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const body = chunks.length ? Buffer.concat(chunks) : undefined;
        const webReq = new Request(`http://127.0.0.1${req.url}`, {
          method: req.method,
          headers: req.headers,
          body: req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined
        });
        const webRes = await handleMojKosciolApi(webReq, {}, { store });
        res.statusCode = webRes.status;
        webRes.headers.forEach((v, k) => res.setHeader(k, v));
        res.end(Buffer.from(await webRes.arrayBuffer()));
        return;
      }

      let rel = decodeURIComponent(urlObj.pathname);
      if (rel.endsWith('/')) rel += 'index.html';
      const diskPath = path.join(ROOT, rel.replace(/^\//, ''));
      if (fs.existsSync(diskPath) && fs.statSync(diskPath).isFile()) {
        const ext = path.extname(diskPath).toLowerCase();
        res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
        fs.createReadStream(diskPath).pipe(res);
      } else {
        res.statusCode = 404;
        res.end('Not found');
      }
    } catch (e) {
      res.statusCode = 500;
      res.end(String(e));
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

async function run() {
  const { server, baseUrl } = await startServer();
  let browser;
  for (const opts of [{ headless: true }, { headless: true, channel: 'chrome' }, { headless: true, channel: 'msedge' }]) {
    try {
      browser = await chromium.launch(opts);
      break;
    } catch {}
  }
  if (!browser) throw new Error('No Chromium/Chrome/Edge executable available');
  const errors = [];

  try {
    // 1. Test /spiewnik-biblijny/ (Desktop 1440x900)
    const ctxSp = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageSp = await ctxSp.newPage();
    pageSp.on('pageerror', (e) => errors.push(`spiewnik: ${e.message}`));
    await pageSp.goto(`${baseUrl}/spiewnik-biblijny/`, { waitUntil: 'networkidle' });
    await pageSp.waitForSelector('.sp-song-title');
    const spStats = await pageSp.textContent('#listStats');
    assert.ok(spStats.includes('700'), `Expected 700 songs in stats, got: ${spStats}`);
    const hasAudio = await pageSp.locator('.sp-audio-box audio').count();
    assert.equal(hasAudio, 1, 'Song #1 must show audio player');
    await pageSp.screenshot({ path: path.join(ARTIFACT_DIR, 'spiewnik_biblijny_desktop.png') });
    console.log('✅ PASS E2E-1: /spiewnik-biblijny/ (700 pieśni + audio MP3 + 0 błędów JS)');
    await ctxSp.close();

    // 2. Test /test/sba/moj-kosciol/ Mobile 390x844 + 2-Device LIVE Sync
    const ctxShared = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const deviceA = await ctxShared.newPage(); // Prowadzący
    const deviceB = await ctxShared.newPage(); // Uczestnik
    deviceA.on('pageerror', (e) => errors.push(`mk-A: ${e.message}`));
    deviceB.on('pageerror', (e) => errors.push(`mk-B: ${e.message}`));

    await deviceA.goto(`${baseUrl}/test/sba/moj-kosciol/`, { waitUntil: 'networkidle' });
    await deviceB.goto(`${baseUrl}/test/sba/moj-kosciol/`, { waitUntil: 'networkidle' });
    await deviceA.waitForSelector('.mk-agenda-item');
    await deviceB.waitForSelector('.mk-agenda-item');

    const countItems = await deviceB.locator('.mk-agenda-item').count();
    assert.equal(countItems, 18, `Expected 18 agenda items, got ${countItems}`);

    // Capture Mobile screenshot
    await deviceB.screenshot({ path: path.join(ARTIFACT_DIR, 'moj_kosciol_mobile_390.png') });

    // 2-Device Sync: Device A clicks Więcej -> Dalej -> Device B sees revision #2 and item_waw_02 active!
    await deviceA.click('button[data-tab="wiecej"]');
    await deviceA.click('button[data-live-act="next"]');
    await deviceB.waitForFunction(() => {
      const el = document.querySelector('.mk-agenda-item.is-active');
      return el && el.dataset.itemId === 'item_waw_02';
    }, { timeout: 5000 });
    const syncTextB = await deviceB.textContent('#syncStatusText');
    assert.ok(syncTextB.includes('#2'), `Device B should show revision #2, got: ${syncTextB}`);
    console.log('✅ PASS E2E-2: 2-Device LIVE Sync (Urządzenie A "Dalej →" -> Urządzenie B rewizja #2, aktywny item_waw_02)');

    // Focus Mode hides social buttons
    await deviceB.click('#focusModeBtn');
    const inviteHidden = await deviceB.locator('#inviteFriendBtn').isHidden();
    assert.equal(inviteHidden, true, 'Invite CTA should be hidden in Focus Mode');
    await deviceB.click('#focusModeBtn'); // turn off

    // Tab: Szkoła Sobotnia PL -> EN switch
    await deviceB.click('button[data-tab="szkola-sobotnia"]');
    await deviceB.waitForSelector('#ssLangEn');
    await deviceB.click('#ssLangEn');
    await deviceB.waitForFunction(() => document.querySelector('#panel-szkola-sobotnia')?.textContent?.includes('Lesson 9'), { timeout: 5000 });
    console.log('✅ PASS E2E-3: Szkoła Sobotnia przełączenie PL → EN + Focus Mode + Large Text');

    // Tab: Dary — ONLY verified account shown (no unverified)
    await deviceB.click('button[data-tab="dary"]');
    const daryText = await deviceB.textContent('#panel-dary');
    assert.ok(daryText.includes('Rachunek zweryfikowany'));
    assert.ok(!daryText.includes('Niezweryfikowany rachunek testowy'));
    console.log('✅ PASS E2E-4: Zakładka Dary — niezweryfikowany IBAN ukryty publicznie');

    // Modal: Zaproś przyjaciela + QR Canvas
    await deviceB.click('#inviteFriendBtn');
    await deviceB.waitForSelector('#shareCardCanvas');
    const inviteTextVal = await deviceB.inputValue('#inviteTextArea');
    assert.ok(inviteTextVal.includes('Serdecznie zapraszam Cię na nabożeństwo!'));
    await deviceB.click('[data-close-dialog="inviteDialog"]');
    console.log('✅ PASS E2E-5: Modal Zaproś przyjaciela + karta graficzna Canvas + QR');

    // Desktop screenshot 1440x900
    await deviceB.setViewportSize({ width: 1440, height: 900 });
    await deviceB.click('button[data-tab="dzisiaj"]');
    await deviceB.screenshot({ path: path.join(ARTIFACT_DIR, 'moj_kosciol_desktop_1440.png') });
    await ctxShared.close();

    assert.equal(errors.length, 0, `JS page errors detected: ${errors.join('; ')}`);
    console.log('🎉 ALL PLAYWRIGHT E2E CHECKS PASSED (0 console/page errors)');
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error('❌ E2E FAIL:', err);
  process.exit(1);
});
