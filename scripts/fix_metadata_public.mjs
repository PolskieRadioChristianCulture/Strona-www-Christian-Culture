import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/n6IfxzwXBXU/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click Gotowe on the layout modal
  const gotoweBtn = page.locator('button:has-text("Gotowe")').first();
  if (await gotoweBtn.isVisible().catch(() => false)) {
    console.log('Clicking Gotowe...');
    await gotoweBtn.click();
    await page.waitForTimeout(1500);
  }

  // Click Edytuj under metadata
  console.log('Clicking Edytuj metadata button...');
  const editBtn = page.locator('ytls-broadcast-metadata #edit-button, button:has-text("Edytuj")').first();
  await editBtn.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\real_metadata_dialog.png' });

  // In the real metadata dialog: find Widoczność / Privacy
  console.log('Selecting Publiczny...');
  // The privacy section has a dropdown or radio buttons
  const privacyTrigger = page.locator('#privacy-dropdown, ytcp-video-metadata-visibility, [name="privacy"]').first();
  if (await privacyTrigger.isVisible().catch(() => false)) {
    await privacyTrigger.click();
    await page.waitForTimeout(1000);
  }
  const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny"), tp-yt-paper-item:has-text("Publiczny")').first();
  if (await publicRadio.isVisible().catch(() => false)) {
    await publicRadio.click();
    await page.waitForTimeout(1000);
  }

  // Click Zapisz
  const saveBtn = page.locator('#save-button button, ytcp-button#save-button, button:has-text("Zapisz")').last();
  if (await saveBtn.isVisible().catch(() => false)) {
    console.log('Clicking Zapisz...');
    await saveBtn.click();
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\metadata_saved_public.png' });

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
