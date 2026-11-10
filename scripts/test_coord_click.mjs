import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/n6IfxzwXBXU/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Click at the Gotowe button coordinates
  console.log('Clicking at (598, 612)...');
  await page.mouse.click(598, 612);
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\after_coord_click.png' });

  // Now click Edytuj button at (665, 703)
  console.log('Clicking Edytuj button...');
  const editBtn = page.locator('ytls-broadcast-metadata #edit-button').first();
  if (await editBtn.isVisible().catch(() => false)) {
    await editBtn.click();
    await page.waitForTimeout(3000);
  } else {
    // try clicking by coordinates around 665, 703
    await page.mouse.click(665, 703);
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\after_coord_edit.png' });

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
