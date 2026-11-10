import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/D_Sy-I2Gr2Y/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click "Włącz" on confirmation dialog if present
  const wlaczBtn = page.locator('button:has-text("Włącz")').first();
  if (await wlaczBtn.isVisible().catch(() => false)) {
    console.log('Clicking "Włącz"...');
    await wlaczBtn.click();
    await page.waitForTimeout(2000);
  }

  // Check the player dropdown "Klucz: Default stream key"
  const playerDropdown = page.locator('ytls-player-renderer tp-yt-paper-dropdown-menu, ytls-player-renderer .dropdown-trigger, ytls-player-renderer [aria-haspopup="true"]').first();
  console.log('Player dropdown visible:', await playerDropdown.isVisible().catch(() => false));
  if (await playerDropdown.isVisible().catch(() => false)) {
    await playerDropdown.click();
    await page.waitForTimeout(2000);
    const items = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('tp-yt-paper-item, ytcp-text-menu-item, [role="option"]'));
      return els.map(e => e.innerText.trim()).filter(Boolean);
    });
    console.log('Player stream key dropdown items:\n', items);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\player_key_dropdown.png' });
  }

  // Change privacy to Publiczny
  console.log('Changing privacy to Publiczny...');
  const editMetadataBtn = page.locator('ytls-broadcast-metadata #edit-button, button:has-text("Edytuj")').first();
  if (await editMetadataBtn.isVisible().catch(() => false)) {
    await editMetadataBtn.click();
    await page.waitForTimeout(2500);

    // Look for privacy dropdown or radio
    const privacySelect = page.locator('ytcp-video-metadata-visibility, [name="privacy"], #privacy-dropdown').first();
    console.log('Privacy selector visible:', await privacySelect.isVisible().catch(() => false));

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\edit_metadata_dialog.png' });

    // Close or save
    const saveBtn = page.locator('#save-button button, button:has-text("Zapisz")').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
