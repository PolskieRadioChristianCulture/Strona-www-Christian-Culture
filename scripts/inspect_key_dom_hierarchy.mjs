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

  await page.goto('https://studio.youtube.com/video/KdOBA_zRU0c/livestreaming', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    await gate.click();
    await page.waitForTimeout(5000);
  }

  // Dismiss modal
  await page.mouse.click(600, 600);
  await page.waitForTimeout(1000);

  // Search DOM for "Default stream key"
  const elementsWithKey = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const matches = all.filter(el => el.children.length === 0 && (el.textContent || '').includes('Default stream key'));
    return matches.map(el => {
      let p = el;
      const chain = [];
      while (p && chain.length < 5) {
        chain.push({ tag: p.tagName, id: p.id, className: p.className, rect: p.getBoundingClientRect() });
        p = p.parentElement;
      }
      return chain;
    });
  });
  console.log('DOM Hierarchy around "Default stream key":', JSON.stringify(elementsWithKey, null, 2));

  await ctx.close();
}

main().catch(console.error);
