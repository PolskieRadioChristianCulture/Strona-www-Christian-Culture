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

  await page.mouse.click(600, 600);
  await page.waitForTimeout(1000);

  // Piercing shadow DOM search
  const found = await page.evaluate(() => {
    function walk(node, list = []) {
      if (!node) return list;
      if (node.nodeType === Node.ELEMENT_NODE) {
        const text = node.textContent ? node.textContent.trim() : '';
        if (text.includes('Default stream key') || (node.value && node.value.length > 10)) {
          list.push({
            tag: node.tagName,
            id: node.id,
            className: node.className,
            val: node.value || '',
            text: text.slice(0, 100),
            rect: node.getBoundingClientRect()
          });
        }
        if (node.shadowRoot) walk(node.shadowRoot, list);
      }
      for (let ch = node.firstChild; ch; ch = ch.nextSibling) {
        walk(ch, list);
      }
      return list;
    }
    return walk(document.body);
  });

  console.log('Shadow DOM findings:', JSON.stringify(found, null, 2));

  await ctx.close();
}

main().catch(console.error);
