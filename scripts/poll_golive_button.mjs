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

  console.log('Navigating to room KdOBA_zRU0c...');
  await page.goto('https://studio.youtube.com/video/KdOBA_zRU0c/livestreaming', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    await gate.click();
    await page.waitForTimeout(5000);
  }

  await page.mouse.click(600, 600);
  await page.waitForTimeout(1000);

  // Monitor for up to 60 seconds
  for (let i = 1; i <= 20; i++) {
    const btn = page.locator('#start-stream-button, button:has-text("Transmituj na żywo"), ytcp-button:has-text("Transmituj na żywo")').first();
    const isEnabled = await btn.isEnabled().catch(() => false);
    const isVisible = await btn.isVisible().catch(() => false);
    const endBtn = page.locator('#end-stream-button, button:has-text("Zakończ transmisję")').first();
    const endEnabled = await endBtn.isEnabled().catch(() => false);
    const endVisible = await endBtn.isVisible().catch(() => false);

    console.log(`[Tick ${i}] startBtn(vis=${isVisible}, en=${isEnabled}) | endBtn(vis=${endVisible}, en=${endEnabled})`);

    if (isEnabled) {
      console.log('>>> BUTTON BECAME ENABLED! CLICKING! <<<');
      await btn.click();
      await page.waitForTimeout(2000);

      const conf = page.locator('#confirm-button, button:has-text("Rozpocznij"), button:has-text("Gotowe")').first();
      if (await conf.isVisible().catch(() => false)) {
        console.log('Clicking confirm button...');
        await conf.click();
        await page.waitForTimeout(5000);
      }
      break;
    }
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/room_kdoba_tick_result.png' });
  await ctx.close();
}

main().catch(console.error);
