import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/channel/UCHmPxDM2zzlUAf5ZvlotPLw/livestreaming/manage?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  console.log('Clicking on Niepubliczny...');
  const cell = page.locator('text=Niepublicz').first();
  await cell.click();
  await page.waitForTimeout(1500);

  console.log('Clicking Publiczny radio at (670, 742)...');
  await page.mouse.click(670, 742);
  await page.waitForTimeout(1000);

  console.log('Clicking Zapisz button at (968, 818)...');
  await page.mouse.click(968, 818);
  await page.waitForTimeout(3000);

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\manage_public_saved.png';
  await page.screenshot({ path: shotPath });
  console.log('Screenshot saved to:', shotPath);

  await ctx.close();
}

main().catch(console.error);
