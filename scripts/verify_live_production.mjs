import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    console.log('Navigating to live production: https://polskieradio.cc/master-live ...');
    await page.goto('https://polskieradio.cc/master-live', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    // 1. Check DEKALOG badge
    const badgeVisible = await page.evaluate(() => {
        const el = document.querySelector('.dekalog-brand-badge');
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
    });
    console.log('1. DEKALOG brand badge visible on live:', badgeVisible);

    // 2. Check Sound Button
    const muteBtnText = await page.locator('#masterMuteText').textContent().catch(() => null);
    console.log('2. Sound button text on live:', muteBtnText);

    // 3. Check PL text
    const plBadge = await page.locator('.ccn-live-text').textContent().catch(() => null);
    console.log('3. Live badge text (PL):', plBadge);

    // 4. Capture screenshot PL
    await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/live_production_pl.png' });
    console.log('Saved screenshot: live_production_pl.png');

    // 5. Test EN translation
    await page.click('.cc-lang-pill-btn[data-lang="en"]');
    await page.waitForTimeout(1000);

    const enBadge = await page.locator('.ccn-live-text').textContent().catch(() => null);
    const enDekalog = await page.locator('#dekalogContent').textContent().catch(() => null);
    const enTicker = await page.locator('#ccnTickerContent').textContent().catch(() => null);
    console.log('4. Live badge text (EN):', enBadge);
    console.log('4. EN Dekalog excerpt:', enDekalog ? enDekalog.trim().slice(0, 50) : null);
    console.log('4. EN Ticker excerpt:', enTicker ? enTicker.trim().slice(0, 50) : null);

    // Capture screenshot EN
    await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/live_production_en.png' });
    console.log('Saved screenshot: live_production_en.png');

    // Click sound button on live
    await page.click('#masterMuteToggleBtn');
    await page.waitForTimeout(500);
    const soundTextAfter = await page.locator('#masterMuteText').textContent().catch(() => null);
    console.log('5. Sound text after toggle on live:', soundTextAfter);

    await browser.close();
    console.log('LIVE PRODUCTION VERIFICATION COMPLETED!');
})();
