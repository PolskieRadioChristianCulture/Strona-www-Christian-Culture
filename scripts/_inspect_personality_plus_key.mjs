import { chromium } from 'playwright';
const ctx = await chromium.launchPersistentContext('C:\\Users\\czark\\.youtube_browser_profile', {
  headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
});
const page = ctx.pages()[0] || await ctx.newPage();
try {
  await page.goto('https://studio.youtube.com/video/G592342GYwE/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) { await gate.click(); await page.waitForTimeout(4000); }
  const eye = page.locator('ytcp-icon-button[aria-label*="Pokaż"], #toggle-button').first();
  if (await eye.isVisible().catch(() => false)) { await eye.click(); await page.waitForTimeout(500); }
  const key = await page.evaluate(() => {
    const inp = document.querySelector('input[type="text"][aria-label*="Klucz"], input[type="text"][value*="-"], input[type="password"]');
    return inp ? inp.value : null;
  });
  console.log('Personality Plus room key:', key);
  const bodyText = (await page.locator('body').innerText()).replace(/\n{2,}/g, '\n');
  const health = (bodyText.match(/\n(Doskonały|Dobry|Dobra|Słaby|Słaba|Brak danych|Brak sygnału|Oczekiwanie)[^\n]*/) || [])[1] || '?';
  console.log('HEALTH:', health);
} finally {
  await ctx.close();
}
