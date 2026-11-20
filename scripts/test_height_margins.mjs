import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/master-live.html';
    let filePath = path.join(ROOT_DIR, reqUrl);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
    if (!fs.existsSync(filePath)) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
    res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
});

server.listen(8769, async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto('http://localhost:8769/master-live.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Test different heights dynamically
    for (const h of [40, 42, 44, 46, 48]) {
        const margins = await page.evaluate((targetHeight) => {
            document.documentElement.style.setProperty('--ticker-height', targetHeight + 'px');
            document.documentElement.style.setProperty('--dekalog-height', targetHeight + 'px');
            
            const topBar = document.querySelector('.dekalog-top-ticker');
            const topText = document.querySelector('.dekalog-text');
            const bottomBar = document.querySelector('.ccn-master-ticker');
            const bottomText = document.querySelector('.ccn-ticker-item span:nth-child(2)');

            const topBarRect = topBar.getBoundingClientRect();
            const topTextRect = topText.getBoundingClientRect();
            const bottomBarRect = bottomBar.getBoundingClientRect();
            const bottomTextRect = bottomText.getBoundingClientRect();

            return {
                height: targetHeight,
                topBarMarginTop: Math.round(topTextRect.top - topBarRect.top),
                topBarMarginBottom: Math.round(topBarRect.bottom - topTextRect.bottom),
                bottomBarMarginTop: Math.round(bottomTextRect.top - bottomBarRect.top),
                bottomBarMarginBottom: Math.round(bottomBarRect.bottom - bottomTextRect.bottom)
            };
        }, h);

        console.log(`Height ${h}px:`, margins);
    }

    await browser.close();
    server.close();
});
