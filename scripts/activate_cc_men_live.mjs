import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  console.log('Opening CC Men live control room...');
  await openChannelStudio(page, 'CC Men', '/livestreaming/manage');
  await page.waitForTimeout(4000);

  // Click on the broadcast in the table to open its room
  const row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
  if (await row.isVisible().catch(() => false)) {
    console.log('Clicking broadcast row...');
    await row.click();
    await page.waitForTimeout(5000);
  }

  // Dismiss layout prompt if visible
  await page.mouse.click(598, 612).catch(() => {});
  await page.waitForTimeout(1000);

  // 1. Turn ON toggles
  console.log('Checking toggles...');
  const toggles = await page.locator('tp-yt-paper-toggle-button').all();
  for (const t of toggles) {
    const parentText = await t.evaluate(el => el.closest('div, ytcp-live-broadcast-setting')?.innerText || '');
    const isChecked = await t.evaluate(el => el.getAttribute('aria-checked') === 'true' || el.hasAttribute('checked'));
    if (parentText.includes('uruchamianie') || parentText.includes('zatrzymywanie')) {
      console.log(`Found toggle: ${parentText.slice(0, 30)} - checked: ${isChecked}`);
      if (!isChecked) {
        console.log('Clicking to enable toggle...');
        await t.click();
        await page.waitForTimeout(1000);
      }
    }
  }

  // 2. Change visibility to Publiczny via "Edytuj"
  console.log('Opening metadata Edytuj dialog...');
  const editBtn = page.locator('button:has-text("Edytuj"), #edit-button').first();
  if (await editBtn.isVisible().catch(() => false)) {
    await editBtn.click();
    await page.waitForTimeout(2500);

    // Look for visibility dropdown or radio in edit dialog
    const visDropdown = page.locator('#visibility-select, [aria-label*="Widoczność"], #privacy-status-dropdown').first();
    if (await visDropdown.isVisible().catch(() => false)) {
      await visDropdown.click();
      await page.waitForTimeout(1000);
      const pubOpt = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-item:has-text("Publiczny")').first();
      if (await pubOpt.isVisible().catch(() => false)) {
        await pubOpt.click();
        await page.waitForTimeout(500);
      }
    } else {
      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
      if (await pubRadio.isVisible().catch(() => false)) {
        await pubRadio.click();
        await page.waitForTimeout(500);
      }
    }

    const saveBtn = page.locator('#save-button, button:has-text("Zapisz")').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      console.log('Saving metadata edit...');
      await saveBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  // 3. Check if "Transmituj na żywo" button is enabled and click it if auto-start wasn't active
  const goLiveBtn = page.locator('button:has-text("Transmituj na żywo"), #go-live-button').first();
  if (await goLiveBtn.isVisible().catch(() => false)) {
    const disabled = await goLiveBtn.getAttribute('disabled');
    console.log('Go live button state, disabled:', disabled);
    if (!disabled) {
      console.log('Clicking Transmituj na żywo!');
      await goLiveBtn.click();
      await page.waitForTimeout(2000);
      // confirm dialog if any
      const confirmBtn = page.locator('#confirm-button, button:has-text("Rozpocznij")').first();
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
        await page.waitForTimeout(2000);
      }
    }
  }

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\cc_men_activated.png' });
  await ctx.close();
  console.log('Done.');
}

main().catch(console.error);
