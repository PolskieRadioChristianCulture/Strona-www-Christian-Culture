import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

const CHANNEL_NAME = 'Werset Dnia - Chrześcijański Serwis Biblijny';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log(`Opening ${CHANNEL_NAME} manage page...`);
    await openChannelStudio(page, CHANNEL_NAME, '/livestreaming/manage');
    await page.waitForTimeout(5000);

    const niepub = page.locator('text=Niepublicz').first();
    console.log('Is Niepubliczny visible?', await niepub.isVisible().catch(() => false));
    if (await niepub.isVisible().catch(() => false)) {
      console.log('Clicking Niepubliczny cell...');
      await niepub.click();
      await page.waitForTimeout(2000);

      console.log('Selecting PUBLIC radio...');
      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
      await pubRadio.click();
      await page.waitForTimeout(1000);

      console.log('Clicking tp-yt-paper-dialog #save-button...');
      const saveBtn = page.locator('tp-yt-paper-dialog #save-button').first();
      await saveBtn.click();
      await page.waitForTimeout(5000);
      console.log('Saved to Public!');
    }

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\wersetdnia_after_public.png' });

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
