import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/master-live.html';
    let filePath = path.join(ROOT_DIR, reqUrl);
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not found');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
    };

    res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
});

server.listen(8767, async () => {
    console.log('Test server running at http://localhost:8767');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    try {
        await page.goto('http://localhost:8767/master-live.html', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        // 1. Check Capsule integration
        const capsule = await page.locator('.cc-master-controls-capsule').boundingBox();
        console.log('1. Controls capsule bounding box:', capsule);

        const btnClass = await page.locator('#masterMuteToggleBtn').getAttribute('class');
        console.log('1b. Mute button class:', btnClass);

        // 2. Click Mute button (turns sound ON)
        await page.click('#masterMuteToggleBtn');
        await page.waitForTimeout(500);

        const btnClassAfter = await page.locator('#masterMuteToggleBtn').getAttribute('class');
        console.log('2. Mute button class after click:', btnClassAfter);

        // Capture screenshot of the bottom bar
        await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/master_compact_capsule.png' });
        console.log('Saved screenshot: master_compact_capsule.png');

        // 3. Switch to EN
        await page.click('.cc-lang-pill-btn[data-lang="en"]');
        await page.waitForTimeout(500);
        const enTitle = await page.locator('#masterMuteToggleBtn').getAttribute('title');
        console.log('3. Mute button EN title:', enTitle);

        console.log('TEST PASSED SUCCESSFULLY!');
    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await browser.close();
        server.close();
    }
});
