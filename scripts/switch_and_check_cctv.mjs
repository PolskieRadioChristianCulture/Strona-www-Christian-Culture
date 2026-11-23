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

  console.log('[1] Navigating to channel switcher...');
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click on "Christian Culture TV"
  console.log('[2] Switching to Christian Culture TV...');
  const items = await page.locator('ytd-account-item-renderer').all();
  for (const item of items) {
    const text = await item.innerText().catch(() => '');
    if (text.includes('@ChristianCultureTV')) {
      console.log('Found @ChristianCultureTV item! Clicking...');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
        item.click()
      ]);
      await page.waitForTimeout(3000);
      break;
    }
  }

  console.log('[3] Navigating to Studio Live Control Room (https://studio.youtube.com/livestreaming)...');
  await page.goto('https://studio.youtube.com/livestreaming', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    console.log('Clicking gate...');
    await gate.click();
    await page.waitForTimeout(5000);
  }

  // Dismiss any dialog
  await page.mouse.click(600, 600);
  await page.waitForTimeout(1000);

  console.log('Current URL in Studio:', page.url());
  console.log('Page Title:', await page.title());

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/cctv_switched_studio.png' });

  // Piercing shadow DOM search for stream keys
  const streamKeys = await page.evaluate(() => {
    function walk(node, list = []) {
      if (!node) return list;
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.value && node.value.length > 10 && !node.value.startsWith('http')) {
          list.push({ tag: node.tagName, id: node.id, val: node.value });
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
  console.log('Found stream keys:', streamKeys);

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Page text snippet:\n', bodyText.slice(0, 500));

  await ctx.close();
}

main().catch(console.error);
