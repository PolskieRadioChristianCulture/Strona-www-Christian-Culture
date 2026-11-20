import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, 'Osobowość +', '/livestreaming/manage');
    await page.waitForTimeout(3000);

    await page.goto('https://studio.youtube.com/video/Al56YdVI40c/edit', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    console.log('Clicking visibility dropdown...');
    await page.locator('ytcp-video-metadata-visibility').click();
    await page.waitForTimeout(2000);

    // Dump all radio buttons and buttons inside the visibility popup
    const popupData = await page.evaluate(() => {
      const radios = Array.from(document.querySelectorAll('tp-yt-paper-radio-button, [role="radio"]')).map(r => ({
        tag: r.tagName,
        name: r.getAttribute('name'),
        id: r.id,
        text: r.innerText.trim(),
        checked: r.getAttribute('aria-checked') || r.hasAttribute('checked')
      }));
      const buttons = Array.from(document.querySelectorAll('button, ytcp-button')).filter(b => b.offsetHeight > 0).map(b => ({
        tag: b.tagName,
        id: b.id,
        text: b.innerText.trim()
      }));
      return { radios, buttons: buttons.slice(0, 15) };
    });

    console.log('Popup Data:', JSON.stringify(popupData, null, 2));

    const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
    await page.screenshot({ path: `${artDir}/osobowosc_vis_popup_open.png` });

    // Click specifically on the radio button with text Publiczny
    console.log('Clicking Publiczny radio...');
    const pubRadio = page.locator('tp-yt-paper-radio-button:has-text("Publiczny")').first();
    await pubRadio.click();
    await page.waitForTimeout(1500);

    await page.screenshot({ path: `${artDir}/osobowosc_vis_popup_selected.png` });

    console.log('Clicking Gotowe...');
    const gotowe = page.locator('ytcp-button#save-button, ytcp-button:has-text("Gotowe")').first();
    await gotowe.click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${artDir}/osobowosc_vis_popup_after_gotowe.png` });

    console.log('Clicking Zapisz on top...');
    const saveTop = page.locator('ytcp-button#save, button:has-text("Zapisz")').first();
    const isSaveEnabled = await saveTop.isEnabled().catch(() => false);
    console.log('Is Save enabled?', isSaveEnabled);
    if (isSaveEnabled) {
      await saveTop.click();
      console.log('Clicked Save!');
      await page.waitForTimeout(4000);
    } else {
      console.log('Save is NOT enabled!');
    }

    await page.screenshot({ path: `${artDir}/osobowosc_final_confirmed.png` });

    // Verify visibility text on page
    const finalVis = await page.locator('ytcp-video-metadata-visibility').innerText().catch(() => '');
    console.log('Final visibility text on page:', finalVis);

  } catch (err) {
    console.error('Błąd:', err);
  } finally {
    await ctx.close();
  }
}

main();
