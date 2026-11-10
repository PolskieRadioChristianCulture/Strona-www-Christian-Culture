import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

const CHANNEL_NAME = 'Biblia Audio Christian Culture';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log('Opening room directly...');
    await page.goto('https://studio.youtube.com/video/LXF-yIcnO_g/livestreaming', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);

    // Dismiss any dialog
    await page.mouse.click(598, 612).catch(() => {});
    await page.waitForTimeout(1000);

    // Click Edytuj
    console.log('Clicking Edytuj...');
    const editBtn = page.locator('#edit-button, button:has-text("Edytuj")').first();
    await editBtn.click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\biblia_edit_modal.png' });

    // Find visibility radio buttons or dropdown
    const visibilityInfo = await page.evaluate(() => {
      const radios = Array.from(document.querySelectorAll('tp-yt-paper-radio-button, [role="radio"]')).map(r => ({
        name: r.getAttribute('name'),
        text: r.innerText.trim(),
        checked: r.getAttribute('aria-checked') === 'true'
      }));
      return radios;
    });
    console.log('Visibility radios:', visibilityInfo);

    // Click "Publiczny"
    const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await publicRadio.isVisible().catch(() => false)) {
      console.log('Clicking Publiczny radio...');
      await publicRadio.click();
      await page.waitForTimeout(1000);
    } else {
      console.log('Public radio not directly found, searching text "Publiczny"...');
      const textPub = page.locator('text="Publiczny"').first();
      await textPub.click().catch(() => {});
    }

    // Click Zapisz
    console.log('Looking for Zapisz...');
    const saveBtn = page.locator('button:has-text("Zapisz"), #save-button, ytcp-button:has-text("Zapisz")').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      console.log('Clicking Zapisz...');
      await saveBtn.click();
      await page.waitForTimeout(4000);
    }

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\biblia_after_save.png' });
    console.log('Biblia Audio edit visibility script done.');

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
