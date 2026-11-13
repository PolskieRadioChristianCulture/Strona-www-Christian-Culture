import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const root = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(root, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.webp': 'image/webp',
      '.jpg': 'image/jpeg',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.json': 'application/json'
    };
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(4892, async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();
  await page.goto('http://localhost:4892/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Trigger chat drawer open
  await page.evaluate(() => {
    const btn = document.querySelector('.cc-chat-btn, #ccGlobalChatBtn, #ccChatTrigger');
    if (btn) btn.click();
    else if (window.CC_GLOBAL_CHAT && window.CC_GLOBAL_CHAT.open) window.CC_GLOBAL_CHAT.open();
  });
  await page.waitForTimeout(1000);

  const drawer = await page.$('.cc-chat-drawer');
  if (drawer) {
    if (!fs.existsSync('tests/screenshots')) fs.mkdirSync('tests/screenshots', { recursive: true });
    await drawer.screenshot({ path: 'tests/screenshots/current_drawer_state.png' });
    console.log('Screenshot saved to tests/screenshots/current_drawer_state.png');
  } else {
    console.log('Drawer not found!');
  }

  await browser.close();
  server.close();
});
