import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, 'Osobowość +', '/video/Al56YdVI40c/edit');
    await page.waitForTimeout(6000);

    const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
    await page.screenshot({ path: `${artDir}/osobowosc_edit_inspect.png` });
    console.log('Saved screenshot of edit page');

    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    console.log('Current URL:', page.url());

    // Check for any visible dialogs or overlays
    const modals = await page.evaluate(() => {
      const dialogs = Array.from(document.querySelectorAll('tp-yt-paper-dialog, ytcp-dialog, [role="dialog"]')).filter(d => d.offsetHeight > 0);
      return dialogs.map(d => ({ tag: d.tagName, text: d.innerText?.slice(0, 100) }));
    });
    console.log('Visible modals:', modals);

    // Look for visibility elements
    const visElements = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('[id*="visibility"], [class*="visibility"], ytcp-video-metadata-visibility, [name="PUBLIC"]'));
      return els.map(e => ({ tag: e.tagName, id: e.id, class: e.className, text: e.innerText?.slice(0, 100) }));
    });
    console.log('Visibility elements found:', visElements);

    // Try to click visibility
    const visTrigger = page.locator('ytcp-video-metadata-visibility, [id="visibility-button"], #visibility-container, [test-id="visibility"]').first();
    if (await visTrigger.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('Visibility trigger found! Clicking...');
      await visTrigger.click();
      await page.waitForTimeout(1500);

      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
      if (await pubRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
        await pubRadio.click();
        console.log('Selected PUBLIC');
        await page.waitForTimeout(1000);
      }

      const doneBtn = page.locator('#save-button, ytcp-button:has-text("Gotowe")').first();
      if (await doneBtn.isVisible().catch(() => false)) {
        await doneBtn.click();
        console.log('Clicked Gotowe');
        await page.waitForTimeout(1500);
      }

      const saveBtn = page.locator('ytcp-button#save, button:has-text("Zapisz")').first();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        console.log('Clicked Save!');
        await page.waitForTimeout(4000);
      }

      await page.screenshot({ path: `${artDir}/osobowosc_after_save.png` });
      console.log('Saved after save screenshot');
    } else {
      console.log('Visibility trigger NOT found directly.');
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await ctx.close();
  }
}

main();
