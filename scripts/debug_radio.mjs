import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/channel/UCHmPxDM2zzlUAf5ZvlotPLw/livestreaming/manage?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const cell = page.locator('text=Niepublicz').first();
  await cell.click();
  await page.waitForTimeout(1500);

  // Find all radio buttons
  const radios = page.locator('tp-yt-paper-radio-button');
  const count = await radios.count();
  console.log('Radios count:', count);
  for (let i = 0; i < count; i++) {
    const r = radios.nth(i);
    const txt = (await r.innerText()).trim();
    console.log(`Radio ${i}: "${txt}"`);
    if (txt.includes('Publiczny')) {
      console.log('Clicking radio', i);
      await r.click();
      await page.waitForTimeout(1000);
    }
  }

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\radio_clicked_debug.png' });

  const saveBtn = page.locator('ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').first();
  console.log('Save visible:', await saveBtn.isVisible());
  console.log('Save disabled:', await saveBtn.getAttribute('aria-disabled'));
  await saveBtn.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\after_real_save.png' });

  await ctx.close();
}

main().catch(console.error);
