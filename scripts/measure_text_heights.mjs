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

server.listen(8768, async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto('http://localhost:8768/master-live.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const dekalogItemBox = await page.evaluate(() => {
        const item = document.querySelector('.dekalog-item');
        const text = document.querySelector('.dekalog-text');
        const tickerItem = document.querySelector('.ccn-ticker-item');
        return {
            dekalogItemHeight: item ? item.getBoundingClientRect().height : null,
            dekalogTextHeight: text ? text.getBoundingClientRect().height : null,
            ccnItemHeight: tickerItem ? tickerItem.getBoundingClientRect().height : null
        };
    });

    console.log('Current rendered heights:', dekalogItemBox);

    await browser.close();
    server.close();
});
