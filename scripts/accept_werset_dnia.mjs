import { chromium } from 'playwright';

async function acceptInvitation() {
  const ctx = await chromium.launchPersistentContext('C:/Users/czark/.youtube_browser_profile', {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  const inviteUrl = 'https://studio.youtube.com/channel/UCyOvW5DuDLVq5XWFyijgtbw?token=FxPGEx8ZaNs4XQaeOiDBrw';
  console.log(`Otwieram link zaproszenia do kanału Werset Dnia: ${inviteUrl}`);
  await page.goto(inviteUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  console.log('Final URL:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
  console.log('Tekst na ekranie:\n', bodyText);

  // Check for accept button if invitation dialog is shown
  const acceptBtn = page.locator('button:has-text("Zaakceptuj"), button:has-text("Accept"), ytcp-button:has-text("Zaakceptuj"), ytcp-button:has-text("Accept")').first();
  if (await acceptBtn.count() > 0) {
    console.log('Znaleziono przycisk akceptacji zaproszenia, klikam...');
    await acceptBtn.click();
    await page.waitForTimeout(4000);
    console.log('Po kliknięciu URL:', page.url());
  }

  // Check channel header
  const header = await page.locator('#channel-title, #entity-name, ytcp-entity-page header').allInnerTexts().catch(() => []);
  console.log('Header kanału:', header);

  await page.screenshot({ path: 'werset_dnia_screen.png' });
  await ctx.close();
}

acceptInvitation().catch(err => {
  console.error('Błąd:', err);
  process.exit(1);
});
