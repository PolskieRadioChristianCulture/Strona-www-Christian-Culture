import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';

const ROOT = process.cwd();

test('CC GO Star Button (/go) — identical styling to other quick navigation buttons', () => {
  const html = fs.readFileSync(path.join(ROOT, 'go', 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(ROOT, 'go', 'styles.css'), 'utf8');
  const favJs = fs.readFileSync(path.join(ROOT, 'js', 'cc-favorites.js'), 'utf8');

  // 1. Symbol i-star exists in index.html SVG defs
  assert.match(html, /<symbol\s+id=["']i-star["']\s+viewBox=["']0\s+0\s+24\s+24["']>/i, 'Symbol i-star must be defined in SVG defs');

  // 2. Star button is present in <nav class="quick">
  assert.match(
    html,
    /<nav\s+class=["']quick["'][^>]*>[\s\S]*?<button[^>]+id=["']ccTopBarFavBtn["'][^>]*>[\s\S]*?<svg[^>]*class=["'][^"']*ic[^"']*cc-fav-star-icon[^"']*["'][^>]*>[\s\S]*?<use\s+href=["']#i-star["']\/>[\s\S]*?<\/svg>[\s\S]*?<span>Ulubione<\/span>[\s\S]*?<\/button>[\s\S]*?<\/nav>/i,
    'Star button must be present in <nav class="quick"> with identical structure (ic SVG + Ulubione span)'
  );

  // 3. CSS for .quick buttons and links guarantees 76px width, flex column, 52px squircle icon with 18px radius
  assert.match(css, /\.quick\s+a\s*,\s*\.quick\s+button\s*,\s*\.quick\s+\.cc-topbar-fav-btn/, 'CSS must style .quick button and .cc-topbar-fav-btn with .quick a');
  assert.match(css, /width:\s*52px;\s*height:\s*52px;\s*min-width:\s*52px;\s*min-height:\s*52px;\s*padding:\s*14px;\s*border-radius:\s*18px;/, 'Icon must be 52x52px with 18px radius squircle');
  assert.match(css, /\.quick\s+a:hover\s+\.ic\s*,\s*\.quick\s+button:hover\s+\.ic\s*,\s*\.quick\s+\.cc-topbar-fav-btn:hover\s+\.ic/, 'Hover style must apply to star button');

  // 4. cc-favorites.js includes overrides for .quick integration
  assert.match(favJs, /\.quick\s+\.cc-topbar-fav-btn/, 'cc-favorites.js must include styles for .quick container');
});

test('CC GO Browser Visual Layout — Star button matches other 7 buttons in computed geometry', async () => {
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
        '.woff2': 'font/woff2'
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
    const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
    await page.goto(`${baseUrl}/go/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    const quickNav = page.locator('nav.quick');
    await quickNav.waitFor({ state: 'visible' });

    // Porównaj wymiary pierwszego przycisku (Słuchaj) i przycisku gwiazdki (Ulubione)
    const firstBtn = quickNav.locator('a').first();
    const starBtn = page.locator('#ccTopBarFavBtn');

    await starBtn.waitFor({ state: 'visible' });

    const firstBox = await firstBtn.boundingBox();
    const starBox = await starBtn.boundingBox();

    assert.ok(firstBox && starBox, 'Both buttons must have bounding boxes');
    assert.equal(Math.round(starBox.width), Math.round(firstBox.width), 'Star button width must match first button width (76px)');

    // Sprawdź wymiary ikon .ic
    const firstIcon = firstBtn.locator('.ic');
    const starIcon = starBtn.locator('.ic');

    const firstIconBox = await firstIcon.boundingBox();
    const starIconBox = await starIcon.boundingBox();

    assert.equal(Math.round(starIconBox.width), 52, 'Star icon box width must be 52px');
    assert.equal(Math.round(starIconBox.height), 52, 'Star icon box height must be 52px');
    assert.equal(Math.round(starIconBox.width), Math.round(firstIconBox.width), 'Star icon width must equal first button icon width');
    assert.equal(Math.round(starIconBox.height), Math.round(firstIconBox.height), 'Star icon height must equal first button icon height');

    // Sprawdź computed border-radius ikony gwiazdki (powinno być 18px)
    const starIconRadius = await starIcon.evaluate(el => window.getComputedStyle(el).borderRadius);
    assert.equal(starIconRadius, '18px', 'Star icon border-radius must be 18px');

    // Sprawdź etykietę tekstową
    const starLabel = await starBtn.locator('span').textContent();
    assert.equal(starLabel.trim(), 'Ulubione', 'Star button label must be Ulubione');

    // Zrób screenshot nawigacji do weryfikacji
    const screenshotsDir = path.join(ROOT, 'tests', 'screenshots');
    fs.mkdirSync(screenshotsDir, { recursive: true });
    await quickNav.screenshot({ path: path.join(screenshotsDir, 'cc_go_quick_nav_verified.png') });
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
