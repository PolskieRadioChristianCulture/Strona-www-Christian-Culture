import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/channel/UCHmPxDM2zzlUAf5ZvlotPLw/livestreaming/manage?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const cell = page.locator('text=Niepublicz').first();
  await cell.click();
  await page.waitForTimeout(1500);

  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
  console.log('Clicking PUBLIC radio...');
  await pubRadio.click();
  await page.waitForTimeout(1000);

  const saveBtn = page.locator('tp-yt-paper-dialog #save-button').first();
  console.log('Save button aria-disabled:', await saveBtn.getAttribute('aria-disabled'));
  console.log('Clicking save...');
  await saveBtn.click();
  await page.waitForTimeout(4000);

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\manage_pub_success.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);

  await ctx.close();
}

main().catch(console.error);
