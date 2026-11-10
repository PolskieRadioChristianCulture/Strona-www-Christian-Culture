import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/channel/UCHmPxDM2zzlUAf5ZvlotPLw/livestreaming/manage?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const cell = page.locator('text=Niepublicz').first();
  if (await cell.isVisible().catch(() => false)) {
    console.log('Opening visibility popup...');
    await cell.click();
    await page.waitForTimeout(1500);

    const pubRadio = page.locator('tp-yt-paper-radio-button').filter({ hasText: 'Publiczny' }).first();
    console.log('Clicking Publiczny radio...');
    await pubRadio.click();
    await page.waitForTimeout(1000);

    const pubBtn = page.locator('button:has-text("Opublikuj"), ytcp-button:has-text("Opublikuj"), #save-button').first();
    console.log('Clicking Opublikuj button...');
    await pubBtn.click();
    await page.waitForTimeout(4000);
  }

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\manage_published_final.png';
  await page.screenshot({ path: shotPath });
  console.log('Screenshot saved to:', shotPath);

  await ctx.close();
}

main().catch(console.error);
