import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function main() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  console.log('Navigating to CCTV livestreaming manage...');
  await page.goto('https://studio.youtube.com/channel/UCG5Y4dwJi5436Gu6QH3nNUQ/livestreaming/manage', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    await gate.click();
    await page.waitForTimeout(5000);
  }

  // Dismiss any confirmation modals if present
  const leaveBtn = page.locator('button:has-text("Wyjdź"), #confirm-button').first();
  if (await leaveBtn.isVisible().catch(() => false)) {
    console.log('Dismissing leave modal...');
    await leaveBtn.click();
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/lcr_cctv_manage.png' });

  // Get table rows
  const rows = await page.evaluate(() => {
    const rList = Array.from(document.querySelectorAll('ytcp-video-row, [role="row"]'));
    return rList.map(r => {
      const text = r.innerText.replace(/\s+/g, ' ').trim();
      const href = r.querySelector('a')?.href;
      return { text, href };
    }).filter(r => r.text.length > 0);
  });
  console.log('Manage Rows count:', rows.length);
  for (const r of rows) {
    console.log('Row:', r.text);
    console.log('Link:', r.href);
  }

  await ctx.close();
}

main().catch(console.error);
