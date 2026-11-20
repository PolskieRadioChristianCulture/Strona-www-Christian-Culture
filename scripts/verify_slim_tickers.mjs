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

server.listen(8770, async () => {
    console.log('Testing slim tickers at http://localhost:8770 ...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto('http://localhost:8770/master-live.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const measurements = await page.evaluate(() => {
        const topBar = document.querySelector('.dekalog-top-ticker');
        const topText = document.querySelector('.dekalog-text');
        const bottomBar = document.querySelector('.ccn-master-ticker');
        const bottomText = document.querySelector('.ccn-ticker-item span:nth-child(2)');
        const capsule = document.querySelector('.cc-master-controls-capsule');
        const clock = document.querySelector('.ccn-clock-box');

        const topBarRect = topBar.getBoundingClientRect();
        const topTextRect = topText.getBoundingClientRect();
        const bottomBarRect = bottomBar.getBoundingClientRect();
        const bottomTextRect = bottomText.getBoundingClientRect();
        const capsuleRect = capsule.getBoundingClientRect();
        const clockRect = clock.getBoundingClientRect();

        return {
            topBarHeight: Math.round(topBarRect.height),
            topTextFontSize: window.getComputedStyle(topText).fontSize,
            topTextMarginTop: Math.round(topTextRect.top - topBarRect.top),
            topTextMarginBottom: Math.round(topBarRect.bottom - topTextRect.bottom),
            bottomBarHeight: Math.round(bottomBarRect.height),
            bottomTextFontSize: window.getComputedStyle(bottomText).fontSize,
            bottomTextMarginTop: Math.round(bottomTextRect.top - bottomBarRect.top),
            bottomTextMarginBottom: Math.round(bottomBarRect.bottom - bottomTextRect.bottom),
            capsuleHeight: Math.round(capsuleRect.height),
            clockHeight: Math.round(clockRect.height)
        };
    });

    console.log('Measurements:', measurements);

    await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/master_slim_tickers.png' });
    console.log('Saved screenshot: master_slim_tickers.png');

    await browser.close();
    server.close();
});
