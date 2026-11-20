import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    let filePath = path.join(ROOT_DIR, reqUrl);
    if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not found');
        return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8'
    };
    res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
});

server.listen(8766, async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    try {
        await page.goto('http://localhost:8766/zapolske-live.html', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        const bottomVal = await page.evaluate(() => {
            const el = document.getElementById('livePrayerOverlay');
            return el ? window.getComputedStyle(el).bottom : null;
        });

        console.log('zapolske-live.html #livePrayerOverlay computed bottom:', bottomVal);

        if (bottomVal === '245px') {
            console.log('PASS: Prayer overlay raised to 245px!');
        } else {
            console.error('FAIL: Expected 245px but got', bottomVal);
        }
    } finally {
        await browser.close();
        server.close();
    }
});
