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

  // Dismiss modal
  await page.mouse.click(600, 600);
  await page.waitForTimeout(1000);

  // Turn on Auto-start toggle so it NEVER stays offline again!
  const toggles = await page.locator('tp-yt-paper-toggle-button').all();
  for (const t of toggles) {
    const txt = (await t.innerText().catch(() => '')).trim();
    const isChecked = await t.evaluate(el => el.getAttribute('aria-checked') === 'true' || el.hasAttribute('checked'));
    if (txt.includes('automatyczne uruchamianie') && !isChecked) {
      console.log(`Enabling Auto-Start toggle...`);
      await t.click();
      await page.waitForTimeout(1500);
    }
  }

  // Check start button
  const startBtn = page.locator('#start-stream-button, button:has-text("Transmituj na żywo"), ytcp-button:has-text("Transmituj na żywo")').first();
  const isEnabled = await startBtn.isEnabled().catch(() => false);
  console.log('Start button isEnabled:', isEnabled);

  if (isEnabled) {
    console.log('CLICKING "Transmituj na żywo" NOW!');
    await startBtn.click();
    await page.waitForTimeout(2000);

    const conf = page.locator('#confirm-button, button:has-text("Rozpocznij"), button:has-text("Gotowe")').first();
    if (await conf.isVisible().catch(() => false)) {
      console.log('Confirming broadcast...');
      await conf.click();
      await page.waitForTimeout(4000);
    }
  }

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/room_kdoba_final_live.png' });

  // Check top status bar
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Contains "Zakończ transmisję":', bodyText.includes('Zakończ transmisję'));
  console.log('Contains "Doskonałe połączenie" / "Doskonały":', bodyText.includes('Doskonałe') || bodyText.includes('Doskonały'));
  console.log('Contains "Brak danych":', bodyText.includes('Brak danych'));

  await ctx.close();
}

main().catch(console.error);
