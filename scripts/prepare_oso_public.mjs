import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/n6IfxzwXBXU/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Close any overlay
  const closeBtn = page.locator('button:has-text("Gotowe"), button:has-text("Zamknij")').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(1000);
  }

  // Click Edytuj button under metadata
  console.log('Clicking Edytuj metadata...');
  const editBtn = page.locator('ytls-broadcast-metadata #edit-button, button:has-text("Edytuj")').first();
  await editBtn.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\edit_oso_dialog.png' });

  // In Edit modal, look for Widoczność / Privacy dropdown
  console.log('Looking for privacy dropdown in edit modal...');
  const privacyDropdown = page.locator('ytcp-video-metadata-visibility, [name="privacy"], tp-yt-paper-dropdown-menu:has-text("Prywatność"), tp-yt-paper-dropdown-menu:has-text("Niepubliczny")').first();
  if (await privacyDropdown.isVisible().catch(() => false)) {
    console.log('Found privacy dropdown, clicking...');
    await privacyDropdown.click();
    await page.waitForTimeout(1000);
    const pubOption = page.locator('tp-yt-paper-item:has-text("Publiczny"), tp-yt-paper-radio-button:has-text("Publiczny")').first();
    await pubOption.click();
    await page.waitForTimeout(1000);
  } else {
    console.log('Privacy dropdown not found via locator, trying radio...');
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await pubRadio.isVisible().catch(() => false)) {
      await pubRadio.click();
      await page.waitForTimeout(1000);
    }
  }

  // Save metadata
  const saveBtn = page.locator('#save-button button, ytcp-button#save-button, button:has-text("Zapisz")').last();
  console.log('Clicking Zapisz...');
  await saveBtn.click();
  await page.waitForTimeout(3000);

  // Verify toggles
  const toggles = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('tp-yt-paper-toggle-button, ytcp-paper-toggle-button, ytcp-toggle'));
    return items.map(t => ({
      id: t.id,
      checked: t.hasAttribute('checked') || t.getAttribute('aria-checked') === 'true',
      text: (t.closest('div')?.innerText || t.parentElement?.innerText || '').replace(/\s+/g, ' ').trim()
    }));
  });
  console.log('Toggles on page:\n', JSON.stringify(toggles, null, 2));

  // Get stream key
  const streamKey = await page.evaluate(() => {
    const p = document.querySelector('input[type="password"]');
    return p ? p.value : null;
  });
  console.log('Stream key:', streamKey);

  const shot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\oso_ready_to_stream.png';
  await page.screenshot({ path: shot, fullPage: true });
  console.log('Screenshot saved to:', shot);

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
