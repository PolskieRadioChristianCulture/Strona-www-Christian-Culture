import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/channel/UCG5Y4dwJi5436Gu6QH3nNUQ/livestreaming/manage?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const scheduleBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję")').first();
  await scheduleBtn.click();
  await page.waitForTimeout(2000);

  const reuseBtn = page.locator('button:has-text("Użyj poprzednich ustawień")').first();
  await reuseBtn.click();
  await page.waitForTimeout(3000);

  // Scroll down dialog
  const dialogScrollable = page.locator('ytcp-uploads-dialog #scrollable-content, ytls-broadcast-creator #scrollable-content, .dialog-content').first();
  if (await dialogScrollable.isVisible().catch(() => false)) {
    console.log('Scrolling dialog down...');
    await dialogScrollable.evaluate(el => el.scrollTop = el.scrollHeight);
    await page.waitForTimeout(1000);
  }

  // Check audience radio button "Nie, nie jest dla dzieci"
  const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notForKids.isVisible().catch(() => false)) {
    console.log('Selecting "Nie dla dzieci"...');
    await notForKids.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\wizard_scroll_audience.png' });

  // Now click Dalej
  const nextBtn = page.locator('#next-button button, ytcp-button#next-button, button:has-text("Dalej")').last();
  console.log('Is nextBtn visible:', await nextBtn.isVisible().catch(() => false));
  console.log('Is nextBtn disabled:', await nextBtn.getAttribute('disabled').catch(() => null));
  await nextBtn.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\wizard_after_step1.png' });

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
