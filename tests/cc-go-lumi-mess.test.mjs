import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';

const ROOT = process.cwd();

test('CC GO LUMI MESS integration — catalog, header, mobile-nav, defs', () => {
  const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'go', 'catalog.json'), 'utf8'));
  const html = fs.readFileSync(path.join(ROOT, 'go', 'index.html'), 'utf8');
  const appJs = fs.readFileSync(path.join(ROOT, 'go', 'app.js'), 'utf8');

  // 1. Catalog entry for LUMI MESS
  const messItem = catalog.items.find(i => i.id === 'mess');
  assert.ok(messItem, 'LUMI MESS must exist in go/catalog.json with id "mess"');
  assert.equal(messItem.title, 'LUMI MESS', 'Title must be "LUMI MESS"');
  assert.equal(messItem.path, '/mess', 'Path must be "/mess"');
  assert.equal(messItem.spotlight, true, 'Spotlight must be true so it appears in hero carousel');
  assert.equal(messItem.badge, 'ASYSTENT CC', 'Badge must be "ASYSTENT CC"');
  assert.equal(messItem.icon, 'chat', 'Icon must be "chat"');
  assert.ok(messItem.tags.includes('lumi mess'), 'Tags must include "lumi mess"');

  // 2. Icon definition in go/index.html defs
  assert.match(html, /<symbol\s+id=["']i-chat["']\s+viewBox=["']0\s+0\s+24\s+24["']>/i, 'Symbol i-chat must exist in SVG defs');

  // 3. Header action link to LUMI MESS
  assert.match(html, /<a\s+class=["']icon-btn["']\s+href=["']\/mess["'][^>]*aria-label=["']LUMI MESS/i, 'Header actions must contain LUMI MESS button');

  // 4. Mobile navigation link to LUMI MESS
  assert.match(html, /<a\s+href=["']\/mess["'][^>]*><span><svg[^>]*><use\s+href=["']#i-chat["']\/><\/svg><\/span>LUMI MESS<\/a>/i, 'Mobile nav must contain LUMI MESS link');

  // 5. App.js icon mapping
  assert.match(appJs, /chat:\s*['"]chat['"]/, 'app.js iconIds must map chat to chat');
});

test('CC GO Browser E2E — LUMI MESS card is searchable, rendered in catalog, and linked in header/nav', async () => {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '/go' || reqPath === '/go/') reqPath = '/go/index.html';
    const filePath = path.join(ROOT, reqPath.replace(/^\//, ''));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mime = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
        '.woff2': 'font/woff2',
        '.webp': 'image/webp'
      }[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${baseUrl}/go/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // 1. Sprawdź przycisk LUMI MESS w nagłówku
    const headerMessBtn = page.locator('.header-actions a[href="/mess"]');
    assert.ok(await headerMessBtn.isVisible(), 'Header actions must display LUMI MESS button');

    // 2. Sprawdź pozycję LUMI MESS w dolnej belce nawigacyjnej
    const mobileMessLink = page.locator('.mobile-nav a[href="/mess"]');
    assert.ok(await mobileMessLink.isVisible(), 'Mobile nav must display LUMI MESS link');

    // 3. Wyszukaj "LUMI MESS" w katalogu
    const searchInput = page.locator('#catalogSearch');
    await searchInput.fill('LUMI MESS');
    await page.waitForTimeout(300);

    const catalogGrid = page.locator('#catalogGrid');
    const messCard = catalogGrid.locator('article[data-id="mess"]');
    assert.ok(await messCard.isVisible(), 'LUMI MESS card must be found and visible in catalog search');

    const cardTitle = await messCard.locator('h3').textContent();
    assert.equal(cardTitle.trim(), 'LUMI MESS', 'Card title must be "LUMI MESS"');

    const openLink = messCard.locator('a.card-open');
    const href = await openLink.getAttribute('href');
    assert.ok(href.endsWith('/mess'), `LUMI MESS card link must point to /mess (got ${href})`);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
