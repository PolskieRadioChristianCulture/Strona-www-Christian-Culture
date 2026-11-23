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

  console.log('Navigating directly to Christian Culture TV Live Control Room...');
  await page.goto('https://studio.youtube.com/channel/UCG5Y4dwJi5436Gu6QH3nNUQ/livestreaming', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    console.log('Clicking studio gate...');
    await gate.click();
    await page.waitForTimeout(6000);
  }

  console.log('Current URL:', page.url());
  console.log('Title:', await page.title());

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/lcr_cctv_direct.png' });

  // Get all text content
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Page text preview:\n', bodyText.slice(0, 1500));

  // Check buttons
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, ytcp-button')).map(b => ({
      text: b.innerText.replace(/\s+/g, ' ').trim(),
      id: b.id,
      disabled: b.disabled || b.hasAttribute('disabled') || b.getAttribute('aria-disabled') === 'true'
    })).filter(b => b.text.length > 0 && b.text.length < 50);
  });
  console.log('Buttons:', buttons);

  // Check stream key input
  const streamKeyInfo = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[type="password"]'));
    return inputs.map(i => ({ val: i.value ? i.value.slice(0, 4) + '****' : '(empty)', id: i.id }));
  });
  console.log('Stream key inputs:', streamKeyInfo);

  await ctx.close();
}

main().catch(console.error);
