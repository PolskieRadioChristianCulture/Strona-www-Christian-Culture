import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

const CHANNEL_NAME = 'Biblia Audio Christian Culture';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log(`Navigating to ${CHANNEL_NAME} manage page...`);
    await openChannelStudio(page, CHANNEL_NAME, '/livestreaming/manage');
    await page.waitForTimeout(5000);

    const niepubCell = page.locator('text=Niepubliczny').first();
    console.log('Is Niepubliczny visible?', await niepubCell.isVisible().catch(() => false));
    if (await niepubCell.isVisible().catch(() => false)) {
      console.log('Clicking Niepubliczny cell...');
      await niepubCell.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\biblia_visibility_dialog.png' });

      console.log('Selecting PUBLIC radio...');
      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
      if (await pubRadio.isVisible().catch(() => false)) {
        await pubRadio.click();
        await page.waitForTimeout(1000);
      }

      console.log('Clicking save...');
      const saveBtn = page.locator('#save-button, button:has-text("Zapisz"), ytcp-button:has-text("Zapisz")').first();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(5000);
      }
      await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\biblia_after_public_save.png' });
    }

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
