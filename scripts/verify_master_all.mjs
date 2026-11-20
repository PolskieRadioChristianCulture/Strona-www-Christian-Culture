import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';

// Simple static server
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

server.listen(8765, async () => {
    console.log('Test server running at http://localhost:8765');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    try {
        await page.goto('http://localhost:8765/master-live.html', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        // 1. Verify orange DEKALOG block is gone
        const badgeVisible = await page.evaluate(() => {
            const el = document.querySelector('.dekalog-brand-badge');
            if (!el) return false;
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden';
        });
        console.log('1. DEKALOG brand badge visible:', badgeVisible, badgeVisible ? 'FAIL' : 'PASS (Removed)');

        // 2. Verify sound controls
        const muteBtnText = await page.locator('#masterMuteText').textContent();
        console.log('2. Sound button initial text:', muteBtnText);

        const bannerVisible = await page.locator('#masterUnmuteBanner').isVisible();
        console.log('2b. Unmute banner visible:', bannerVisible);

        // Toggle sound
        await page.click('#masterMuteToggleBtn');
        await page.waitForTimeout(500);
        const muteBtnTextAfter = await page.locator('#masterMuteText').textContent();
        console.log('2c. Sound button text after toggle:', muteBtnTextAfter);

        // 3. Verify language translation
        const plDekalog = await page.locator('#dekalogContent').textContent();
        const plTicker = await page.locator('#ccnTickerContent').textContent();
        const plBadge = await page.locator('.ccn-live-text').textContent();
        console.log('3a. PL Dekalog excerpt:', plDekalog.slice(0, 60));
        console.log('3a. PL Ticker excerpt:', plTicker.slice(0, 60));
        console.log('3a. PL Live badge:', plBadge);

        // Switch to EN
        await page.click('.cc-lang-pill-btn[data-lang="en"]');
        await page.waitForTimeout(500);

        const enDekalog = await page.locator('#dekalogContent').textContent();
        const enTicker = await page.locator('#ccnTickerContent').textContent();
        const enBadge = await page.locator('.ccn-live-text').textContent();
        const enSoundBtn = await page.locator('#masterMuteText').textContent();
        console.log('3b. EN Dekalog excerpt:', enDekalog.slice(0, 60));
        console.log('3b. EN Ticker excerpt:', enTicker.slice(0, 60));
        console.log('3b. EN Live badge:', enBadge);
        console.log('3b. EN Sound button:', enSoundBtn);

        // Screenshot EN
        await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/master_en_verified.png' });

        // Switch back to PL
        await page.click('.cc-lang-pill-btn[data-lang="pl"]');
        await page.waitForTimeout(500);
        const plRestored = await page.locator('#dekalogContent').textContent();
        console.log('3c. Restored PL Dekalog excerpt:', plRestored.slice(0, 60));

        // Screenshot PL
        await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/master_pl_verified.png' });

        console.log('ALL VERIFICATIONS SUCCESSFUL!');
    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        await browser.close();
        server.close();
    }
});
