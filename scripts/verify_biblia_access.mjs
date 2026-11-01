import { chromium } from 'playwright';

async function checkAccess() {
  const ctx = await chromium.launchPersistentContext('C:/Users/czark/.youtube_browser_profile', {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = await ctx.newPage();
  console.log('Sprawdzam dostęp do https://studio.youtube.com/channel/UCCqHRCEuSDhlRcvcQ6qM1Kw ...');
  await page.goto('https://studio.youtube.com/channel/UCCqHRCEuSDhlRcvcQ6qM1Kw', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // If there is "PRZEJDŹ DO YOUTUBE STUDIO" button, click it
  const proceedBtn = page.locator('text="PRZEJDŹ DO YOUTUBE STUDIO", text="PROCEED TO YOUTUBE STUDIO"').first();
  if (await proceedBtn.count() > 0) {
    console.log('Klikam "PRZEJDŹ DO YOUTUBE STUDIO"...');
    await proceedBtn.click().catch(() => {});
    await page.waitForTimeout(3000);
  }

  const url = page.url();
  console.log('Final URL:', url);
  const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('Page snippet:\n', text);
  
  const canUpload = await page.evaluate(() => {
    return !!(
      document.querySelector('#create-icon') ||
      document.querySelector('ytcp-button#create-icon') ||
      document.querySelector('button[aria-label*="Utwórz"]') ||
      document.querySelector('button[aria-label*="Create"]')
    );
  });
  console.log('Can upload button found:', canUpload);

  // Also check channel switcher for "Biblia Audio"
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  const switcherMatches = await page.locator('ytd-account-item-renderer', { hasText: 'Biblia' }).allInnerTexts();
  console.log('Matching channels on switcher:', switcherMatches);

  await ctx.close();
}

checkAccess().catch(err => {
  console.error('Błąd:', err);
  process.exit(1);
});
