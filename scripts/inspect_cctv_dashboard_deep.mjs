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

  console.log('Navigating to CCTV livestreaming dashboard...');
  await page.goto('https://studio.youtube.com/channel/UCG5Y4dwJi5436Gu6QH3nNUQ/livestreaming/dashboard', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    await gate.click();
    await page.waitForTimeout(5000);
  }

  // Look for any dialog / modal overlay that might be open (e.g. "Zamknij" or "Gotowe")
  const dialogs = await page.locator('ytcp-dialog, paper-dialog, [role="dialog"]').all();
  console.log('Open dialogs count:', dialogs.length);
  for (let i = 0; i < dialogs.length; i++) {
    const dText = await dialogs[i].innerText().catch(() => '');
    console.log(`Dialog ${i} text:\n`, dText.slice(0, 300));
  }

  // Look for tabs: "Ustawienia transmisji", "Stan transmisji", "Statystyki"
  const tabs = await page.locator('paper-tab, [role="tab"]').all();
  console.log('Tabs count:', tabs.length);
  for (const t of tabs) {
    console.log('Tab:', (await t.innerText().catch(() => '')).replace(/\s+/g, ' '));
  }

  // Look for the stream key dropdown or stream key field
  const streamKeyContainers = await page.evaluate(() => {
    const el = document.querySelectorAll('#stream-key, ytls-stream-key-input, [aria-label*="klucz"], [aria-label*="Klucz"]');
    return Array.from(el).map(e => e.outerHTML.slice(0, 200));
  });
  console.log('Stream key containers:', streamKeyContainers);

  // Take full screenshot
  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/lcr_cctv_dashboard_full.png', fullPage: true });

  await ctx.close();
}

main().catch(console.error);
