import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/n6IfxzwXBXU/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  
  // Wait up to 10s for the Gotowe button to appear
  const gotoweBtn = page.locator('button:has-text("Gotowe")').first();
  await gotoweBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  if (await gotoweBtn.isVisible().catch(() => false)) {
    console.log('Clicking Gotowe...');
    await gotoweBtn.click();
    await page.waitForTimeout(2000);
  }

  // Now click Edytuj
  console.log('Clicking Edytuj...');
  const editBtn = page.locator('ytls-broadcast-metadata #edit-button, button:has-text("Edytuj")').first();
  await editBtn.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\edit_opened_real.png' });

  // Look for elements inside dialog
  const dialogHtml = await page.evaluate(() => {
    const d = document.querySelector('ytcp-dialog, ytls-edit-broadcast-dialog');
    return d ? d.innerText : 'None';
  });
  console.log('Dialog text:\n', dialogHtml.slice(0, 800));

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
