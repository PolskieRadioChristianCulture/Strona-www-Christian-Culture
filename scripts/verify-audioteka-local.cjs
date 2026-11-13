const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8092;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

function startServer() {
  const rootDir = process.cwd();
  const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/audioteka.html';
    let filePath = path.join(rootDir, reqPath);
    
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
    } else if (fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    } else {
      res.writeHead(404);
      res.end('Not Found');
      return;
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
  console.log(`Test server running at http://localhost:${PORT}`);

  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Test (1280x900)
  const contextDesk = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2
  });
  const pageDesk = await contextDesk.newPage();
  await pageDesk.goto(`http://localhost:${PORT}/audioteka`, { waitUntil: 'domcontentloaded' });
  await pageDesk.waitForTimeout(1000);

  await pageDesk.screenshot({ path: 'scratch/audioteka_desktop_hero.png', clip: { x: 0, y: 0, width: 1280, height: 900 } });
  await pageDesk.screenshot({ path: 'scratch/audioteka_desktop_full.png', fullPage: true });
  console.log('Saved desktop screenshots');

  // 2. Mobile Test (iPhone 14 - 390x844)
  const contextMob = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true
  });
  const pageMob = await contextMob.newPage();
  await pageMob.goto(`http://localhost:${PORT}/audioteka`, { waitUntil: 'domcontentloaded' });
  await pageMob.waitForTimeout(1000);

  await pageMob.screenshot({ path: 'scratch/audioteka_mobile_hero.png', clip: { x: 0, y: 0, width: 390, height: 844 } });
  await pageMob.screenshot({ path: 'scratch/audioteka_mobile_full.png', fullPage: true });
  console.log('Saved mobile screenshots');

  // 3. Test interactive playback trigger
  console.log('Testing start listening CTA button...');
  await pageDesk.click('#ccStartListeningBtn');
  await pageDesk.waitForTimeout(500);

  await browser.close();
  server.close();
  console.log('Audioteka verification complete!');
}

verify().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
