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

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/room_kdoba_incoming_check.png' });

  const bodyText = await page.evaluate(() => document.body.innerText);
  const lines = bodyText.split('\n').map(l => l.trim()).filter(l => 
    l.includes('Klucz') || l.includes('sygnał') || l.includes('Brak') || l.includes('Dobre') || l.includes('Doskonałe') || 
    l.includes('Transmisj') || l.includes('uruchamianie') || l.includes('zatrzymywanie') || l.includes('Podgląd') ||
    l.includes('na żywo') || l.includes('Transmitujesz')
  );
  console.log('Health lines:', lines);

  // Check buttons
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, ytcp-button')).map(b => ({
      text: b.innerText.replace(/\s+/g, ' ').trim(),
      id: b.id,
      disabled: b.disabled || b.hasAttribute('disabled') || b.getAttribute('aria-disabled') === 'true'
    })).filter(b => b.text.includes('Transmituj') || b.text.includes('Zakończ') || b.text.includes('Rozpocznij'));
  });
  console.log('Buttons:', buttons);

  // If "Transmituj na żywo" is enabled, click it!
  const startBtn = page.locator('#start-stream-button, button:has-text("Transmituj na żywo"), ytcp-button:has-text("Transmituj na żywo")').first();
  if (await startBtn.isEnabled().catch(() => false)) {
    console.log('CLICKING "Transmituj na żywo"!');
    await startBtn.click();
    await page.waitForTimeout(2000);

    const conf = page.locator('#confirm-button, button:has-text("Rozpocznij"), button:has-text("Gotowe")').first();
    if (await conf.isVisible().catch(() => false)) {
      console.log('Confirming...');
      await conf.click();
      await page.waitForTimeout(3000);
    }
    await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/room_kdoba_went_live.png' });
  }

  await ctx.close();
}

main().catch(console.error);
