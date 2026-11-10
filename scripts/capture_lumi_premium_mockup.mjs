import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const PORT = 8089;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  if (reqPath === '/mess') reqPath = '/mess/index.html';
  const filePath = path.join(ROOT, reqPath.replace(/^\//, ''));
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

await new Promise(resolve => server.listen(PORT, resolve));
console.log(`Server listening on http://localhost:${PORT}`);

fs.mkdirSync('tests/screenshots', { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  // 1. Mobile Capture (390 x 844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`http://localhost:${PORT}/index.html`);
  await mobilePage.waitForSelector('#ccChatFabBtn', { timeout: 5000 });

  // Click fab button to open drawer
  await mobilePage.click('#ccChatFabBtn');
  await mobilePage.waitForSelector('#ccGlobalChatOverlay.is-open', { timeout: 5000 });
  await mobilePage.waitForTimeout(600); // Wait for transition

  const mobilePath = path.join(ROOT, 'tests/screenshots/lumi_messenger_premium_mobile_390.png');
  await mobilePage.screenshot({ path: mobilePath });
  console.log(`Mobile screenshot saved: ${mobilePath}`);

  // 2. Desktop Capture (1280 x 800)
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(`http://localhost:${PORT}/index.html`);
  await desktopPage.waitForSelector('#ccChatFabBtn', { timeout: 5000 });

  // Click fab button to open drawer
  await desktopPage.click('#ccChatFabBtn');
  await desktopPage.waitForSelector('#ccGlobalChatOverlay.is-open', { timeout: 5000 });
  await desktopPage.waitForTimeout(600); // Wait for transition

  const desktopPath = path.join(ROOT, 'tests/screenshots/lumi_messenger_premium_desktop_1280.png');
  await desktopPage.screenshot({ path: desktopPath });
  console.log(`Desktop screenshot saved: ${desktopPath}`);

} catch (err) {
  console.error('Capture error:', err);
} finally {
  await browser.close();
  server.close();
  console.log('Capture finished');
}
