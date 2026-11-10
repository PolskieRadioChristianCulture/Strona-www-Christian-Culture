import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/channel/UCHmPxDM2zzlUAf5ZvlotPLw/livestreaming/manage?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  console.log('Clicking on Niepubliczny...');
  const cell = page.locator('text=Niepublicz').first();
  await cell.click();
  await page.waitForTimeout(1500);

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\manage_visibility_popup.png';
  await page.screenshot({ path: shotPath });
  console.log('Screenshot saved to:', shotPath);

  // Look for Publiczny radio button
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
  if (await pubRadio.isVisible().catch(() => false)) {
    console.log('Clicking Publiczny radio...');
    await pubRadio.click();
    await page.waitForTimeout(1000);
    const saveBtn = page.locator('#save-button, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').first();
    console.log('Clicking save...');
    await saveBtn.click();
    await page.waitForTimeout(3000);
  }

  const shotPath2 = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\manage_after_save.png';
  await page.screenshot({ path: shotPath2 });
  console.log('Final screenshot saved to:', shotPath2);

  await ctx.close();
}

main().catch(console.error);
