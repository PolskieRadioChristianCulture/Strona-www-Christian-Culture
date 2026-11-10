import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });

  let startBroadcastResponse = null;
  page.on('response', async res => {
    const url = res.url();
    if (url.includes('broadcast') || url.includes('start') || url.includes('live')) {
      try {
        const text = await res.text();
        if (text.includes('error') || text.includes('ERROR') || text.includes('status')) {
          console.log(`[Response from ${url.slice(0, 80)}]:`, text.slice(0, 500));
        }
      } catch (e) {}
    }
  });

  // Check Christian Culture TV channel settings / status:
  console.log('Navigating to channel status / features...');
  await page.goto('https://studio.youtube.com/channel/UCG5Y4dwJi5436Gu6QH3nNUQ/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Take screenshot
  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\cctv_live_status_check.png', fullPage: true });

  // Now let's check Osobowość +
  console.log('Navigating to Osobowość + video KYSla9a5bjQ...');
  await page.goto('https://studio.youtube.com/video/KYSla9a5bjQ/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Check if start button exists on Osobowość +
  const osoBtn = await page.evaluate(() => {
    const btn = document.querySelector('#start-stream-button');
    if (!btn) return 'no btn';
    return {
      outerHTML: btn.outerHTML,
      disabled: btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true',
      hidden: btn.hasAttribute('hidden') || btn.hidden
    };
  });
  console.log('Osobowość + button:', osoBtn);

  // Try start on Osobowość +
  const clicked = await page.evaluate(() => {
    const btn = document.querySelector('#start-stream-button');
    if (!btn) return 'not found';
    btn.removeAttribute('hidden');
    btn.removeAttribute('disabled');
    btn.setAttribute('aria-disabled', 'false');
    const innerBtn = btn.querySelector('button');
    if (innerBtn) {
      innerBtn.removeAttribute('disabled');
      innerBtn.removeAttribute('aria-disabled');
      innerBtn.click();
      return 'clicked inner';
    }
    btn.click();
    return 'clicked';
  });
  console.log('Clicked on Osobowość +:', clicked);
  await page.waitForTimeout(4000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\osobowosc_after_start.png', fullPage: true });

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
