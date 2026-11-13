const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8089;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4'
};

function startServer() {
  const rootDir = process.cwd();
  const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/index.html';
    let filePath = path.join(rootDir, reqPath);
    if (!fs.existsSync(filePath)) {
      if (fs.existsSync(filePath + '.html')) filePath += '.html';
      else if (fs.existsSync(path.join(filePath, 'index.html'))) filePath = path.join(filePath, 'index.html');
      else {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' });
    fs.createReadStream(filePath).pipe(res);
  });
  return new Promise(resolve => server.listen(PORT, () => resolve(server)));
}

async function verify() {
  const server = await startServer();
  console.log(`Local test server running at http://localhost:${PORT}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:' + PORT);
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);

  // Directly call window.CCGlobalChat.open()
  console.log('Opening chat drawer via CCGlobalChat.open()...');
  await page.evaluate(() => {
    if (window.CCGlobalChat && window.CCGlobalChat.open) {
      window.CCGlobalChat.open();
    } else {
      const btn = document.getElementById('ccGlobalChatBtn');
      if (btn) btn.click();
    }
  });
  await page.waitForTimeout(1500);

  // Capture full drawer
  const drawerEl = await page.$('.cc-chat-drawer');
  if (drawerEl) {
    await drawerEl.screenshot({ path: 'scratch/verify_drawer_full.png' });
    console.log('Saved scratch/verify_drawer_full.png');
  } else {
    console.warn('.cc-chat-drawer not found!');
  }

  // Capture header logo zoom
  const logoEl = await page.$('.cc-chat-header-logo-wrap');
  if (logoEl) {
    await logoEl.screenshot({ path: 'scratch/verify_logo_zoom.png' });
    console.log('Saved scratch/verify_logo_zoom.png');
  }

  // Capture hero banner area (where the 3 buttons sit)
  const heroEl = await page.$('.cc-hero-art-top');
  if (heroEl) {
    await heroEl.screenshot({ path: 'scratch/verify_hero_buttons.png' });
    console.log('Saved scratch/verify_hero_buttons.png');
  }

  // Hover over the buttons to verify NO dark boxes or borders appear
  console.log('Hovering over #ccPillRadio...');
  await page.hover('#ccPillRadio');
  await page.waitForTimeout(300);
  if (heroEl) {
    await heroEl.screenshot({ path: 'scratch/verify_hero_hover_radio.png' });
    console.log('Saved scratch/verify_hero_hover_radio.png');
  }

  await browser.close();
  server.close();
  console.log('Verification finished successfully!');
}

verify().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
