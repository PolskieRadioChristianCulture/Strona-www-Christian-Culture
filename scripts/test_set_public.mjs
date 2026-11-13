import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/channel/UCHmPxDM2zzlUAf5ZvlotPLw/livestreaming/manage', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Look for visibility column or dropdown in table
  console.log('Inspecting visibility dropdowns on manage page...');
  const visCell = page.locator('ytcp-video-row [cell-title*="Widoczność"], ytcp-video-row #visibility-col, ytcp-entity-table-row #visibility, [aria-label*="Widoczność"]').first();
  if (await visCell.isVisible().catch(() => false)) {
    console.log('Clicking visibility cell...');
    await visCell.click();
    await page.waitForTimeout(1500);

    const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await publicRadio.isVisible().catch(() => false)) {
      console.log('Clicking Publiczny...');
      await publicRadio.click();
      await page.waitForTimeout(1000);

      const saveBtn = page.locator('ytcp-button#save-button, button:has-text("Zapisz"), button:has-text("Opublikuj")').first();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        console.log('Saved visibility as Publiczny!');
        await page.waitForTimeout(2000);
      }
    }
  } else {
    // If not found in row, let's open details page: https://studio.youtube.com/video/suYDIRikPjQ/edit
    console.log('Navigating directly to video edit page...');
    await page.goto('https://studio.youtube.com/video/suYDIRikPjQ/edit', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);
    
    // Check visibility dropdown on edit page
    const visDropdown = page.locator('#visibility-button, [aria-label*="Widoczność"]').first();
    if (await visDropdown.isVisible().catch(() => false)) {
      console.log('Clicking visibility dropdown on edit page...');
      await visDropdown.click();
      await page.waitForTimeout(1500);
      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
      if (await pubRadio.isVisible().catch(() => false)) {
        await pubRadio.click();
        console.log('Selected Publiczny.');
        await page.waitForTimeout(500);
        const doneBtn = page.locator('ytcp-button#save-button, button:has-text("Gotowe")').first();
        if (await doneBtn.isVisible().catch(() => false)) await doneBtn.click();
        await page.waitForTimeout(1000);
        
        // Save overall video
        const saveVideoBtn = page.locator('ytcp-button#save, button:has-text("Zapisz")').first();
        if (await saveVideoBtn.isVisible().catch(() => false)) {
          await saveVideoBtn.click();
          console.log('Saved video edit as Publiczny!');
          await page.waitForTimeout(3000);
        }
      }
    }
  }

  const shot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\osobowosc_visibility_result.png';
  await page.screenshot({ path: shot, fullPage: true });
  console.log('Saved visibility result screenshot to:', shot);

  await ctx.close();
}

main().catch(console.error);
