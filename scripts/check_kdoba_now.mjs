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

  // Dismiss any "Gotowe" dialog
  await page.mouse.click(600, 600);
  await page.waitForTimeout(1000);

  // Check all dialogs/modals
  const dialogs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('ytcp-dialog, paper-dialog, [role="dialog"], ytcp-confirmation-dialog')).map(d => ({
      visible: d.offsetParent !== null,
      text: d.innerText.replace(/\s+/g, ' ').trim()
    })).filter(d => d.text.length > 0);
  });
  console.log('Dialogs present:', dialogs);

  // Check top status bar (is it LIVE? Does it say "Transmitujesz na żywo" or "NA ŻYWO"?)
  const topBar = await page.evaluate(() => {
    const el = document.querySelector('ytls-status-bar, #live-status, [aria-label*="Stan"], ytls-header');
    return el ? el.innerText.replace(/\s+/g, ' ').trim() : 'NONE';
  });
  console.log('Top bar status:', topBar);

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Contains "Zakończ transmisję":', bodyText.includes('Zakończ transmisję'));
  console.log('Contains "Brak danych":', bodyText.includes('Brak danych'));
  console.log('Contains "Doskonałe połączenie":', bodyText.includes('Doskonałe połączenie'));
  console.log('Contains "Transmitujesz na żywo":', bodyText.includes('Transmitujesz na żywo'));

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/room_kdoba_live_status.png' });

  await ctx.close();
}

main().catch(console.error);
