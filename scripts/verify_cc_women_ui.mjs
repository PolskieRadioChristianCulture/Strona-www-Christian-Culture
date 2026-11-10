import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const repoDir = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const artifactDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(repoDir, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
            'Content-Type': mimeTypes[ext] || 'application/octet-stream',
            'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(3888, async () => {
    console.log('Static server listening on port 3888');
    try {
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

        // 1. Test index.html
        console.log('Loading http://localhost:3888/index.html...');
        await page.goto('http://localhost:3888/index.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1000);

        // Open station dropdown
        const dropBtn = page.locator('#stationDropdownBtn');
        if (await dropBtn.count() > 0) {
            await dropBtn.click();
            await page.waitForTimeout(400);
        }

        const ccwItem = page.locator('[data-station-id="radio_cc_women"]');
        console.log('CC Women items in index.html dropdown:', await ccwItem.count());

        await page.screenshot({ path: path.join(artifactDir, 'cc_women_index_dropdown.png'), fullPage: false });
        console.log('Saved cc_women_index_dropdown.png');

        // Click CC Women in index
        if (await ccwItem.count() > 0) {
            await ccwItem.first().click();
            await page.waitForTimeout(500);
            const activeName = await page.locator('#activeStationName').innerText().catch(() => '');
            const trackTitle = await page.locator('#playerTrackTitle').innerText().catch(() => '');
            const statusText = await page.locator('#playerStatusText').innerText().catch(() => '');
            console.log('Index after selecting CC Women -> activeName:', activeName, '| trackTitle:', trackTitle, '| statusText:', statusText);
        }

        // 2. Test player.html
        console.log('Loading http://localhost:3888/player.html...');
        await page.goto('http://localhost:3888/player.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1500);

        const sideItem = page.locator('#side-item-ccwomen');
        console.log('Sidebar item count in player.html:', await sideItem.count());
        
        if (await sideItem.count() > 0) {
            await sideItem.scrollIntoViewIfNeeded();
            await sideItem.click();
            await page.waitForTimeout(1000);
        }

        await page.screenshot({ path: path.join(artifactDir, 'cc_women_player_view.png'), fullPage: false });
        console.log('Saved cc_women_player_view.png');

        // Scroll to grid
        const gridCard = page.locator('.channel-card[onclick*="ccwomen"]');
        console.log('Grid card count in player.html:', await gridCard.count());
        if (await gridCard.count() > 0) {
            await gridCard.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
            await page.screenshot({ path: path.join(artifactDir, 'cc_women_player_grid.png'), fullPage: false });
            console.log('Saved cc_women_player_grid.png');
        }

        await browser.close();
        console.log('Verification completed successfully!');
    } catch (err) {
        console.error('Error during verification:', err);
    } finally {
        server.close();
        process.exit(0);
    }
});
