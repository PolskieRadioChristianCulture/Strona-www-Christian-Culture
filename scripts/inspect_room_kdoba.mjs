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

  console.log('Navigating to room KdOBA_zRU0c (Public scheduled stream)...');
  await page.goto('https://studio.youtube.com/video/KdOBA_zRU0c/livestreaming', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    await gate.click();
    await page.waitForTimeout(5000);
  }

  // Dismiss any "Gotowe" / vertical dialog
  await page.mouse.click(600, 600);
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/room_KdOBA_zRU0c.png' });

  // Get stream key from input
  const streamKey = await page.evaluate(() => {
    const input = document.querySelector('input[type="password"]');
    return input ? input.value : null;
  });
  console.log('Stream key for KdOBA_zRU0c:', streamKey ? streamKey.slice(0, 4) + '****' + streamKey.slice(-4) : 'NONE');

  // Check health / status text
  const bodyText = await page.evaluate(() => document.body.innerText);
  const lines = bodyText.split('\n').map(l => l.trim()).filter(l => 
    l.includes('Klucz') || l.includes('sygnał') || l.includes('Brak') || l.includes('Dobre') || l.includes('Doskonałe') || 
    l.includes('Transmisj') || l.includes('uruchamianie') || l.includes('zatrzymywanie') || l.includes('Podgląd')
  );
  console.log('Health/Status lines:', lines);

  // Check buttons
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, ytcp-button')).map(b => ({
      text: b.innerText.replace(/\s+/g, ' ').trim(),
      id: b.id,
      disabled: b.disabled || b.hasAttribute('disabled') || b.getAttribute('aria-disabled') === 'true'
    })).filter(b => b.text.includes('Transmituj') || b.text.includes('Zakończ') || b.text.includes('Edytuj'));
  });
  console.log('Action buttons:', buttons);

  await ctx.close();
}

main().catch(console.error);
