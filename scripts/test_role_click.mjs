import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/n6IfxzwXBXU/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Use Playwright role selector which automatically pierces open shadow roots
  const gotowe = page.getByRole('button', { name: 'Gotowe' });
  console.log('Gotowe count:', await gotowe.count());
  if (await gotowe.count() > 0) {
    console.log('Clicking Gotowe via getByRole...');
    await gotowe.first().click();
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\after_role_gotowe.png' });

  // Now click Edytuj button
  const editBtn = page.getByRole('button', { name: 'Edytuj' }).first();
  console.log('Edit count:', await page.getByRole('button', { name: 'Edytuj' }).count());
  await editBtn.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\after_edit_click.png' });

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
