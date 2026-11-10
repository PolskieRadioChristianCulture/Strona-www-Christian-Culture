import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'CC Women', '/livestreaming/manage');
  await page.waitForTimeout(5000);

  const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję"), #schedule-stream-button').first();
  await schedBtn.click();
  await page.waitForTimeout(3000);

  // Click "Użyj poprzednich ustawień"
  const reuseBtn = page.locator('button:has-text("Użyj poprzednich ustawień"), ytcp-button:has-text("Użyj poprzednich ustawień")').first();
  if (await reuseBtn.isVisible().catch(() => false)) {
    console.log('Clicking "Użyj poprzednich ustawień"...');
    await reuseBtn.click();
    await page.waitForTimeout(6000);
  }

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\cc_women_reused.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);
  console.log('Current URL:', page.url());

  await ctx.close();
}

main().catch(console.error);
