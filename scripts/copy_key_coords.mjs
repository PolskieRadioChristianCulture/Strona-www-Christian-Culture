import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function main() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1600, height: 1000 },
    permissions: ['clipboard-read', 'clipboard-write'],
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  console.log('Navigating to room KdOBA_zRU0c...');
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

  // Click the copy icon near the stream key dropdown (around x=530, y=113)
  console.log('Clicking copy icon at coordinates (530, 113)...');
  await page.mouse.click(530, 113);
  await page.waitForTimeout(1500);

  const clip = await page.evaluate(async () => {
    return await navigator.clipboard.readText();
  }).catch(e => e.message);
  console.log('CLIPBOARD VALUE:', clip);

  // Also click the dropdown itself at (420, 113) to open it
  console.log('Clicking dropdown at coordinates (420, 113)...');
  await page.mouse.click(420, 113);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/dropdown_opened.png' });

  await ctx.close();
}

main().catch(console.error);
