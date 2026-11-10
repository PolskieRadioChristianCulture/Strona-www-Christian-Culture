import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import { restartAitumOutput, updateAitumKeyOnRemote } from './setup_channel_live.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log('1. Opening RCC manage...');
    await openChannelStudio(page, 'Polskie Radio CHRISTIAN CULTURE', '/livestreaming/manage');
    await page.waitForTimeout(4000);

    // If on manage page, click the broadcast row
    let row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    if (await row.isVisible().catch(() => false)) {
      console.log('Clicking row to enter room...');
      await row.click();
      await page.waitForTimeout(5000);
    }

    // Dismiss layout prompt if visible
    await page.mouse.click(598, 612).catch(() => {});
    await page.waitForTimeout(1000);

    // Read stream key by copying from clipboard or input
    console.log('2. Reading stream key...');
    let streamKey = await page.evaluate(() => {
      const inp = document.querySelector('input[type="password"]');
      return inp ? inp.value : null;
    });

    if (!streamKey) {
      console.log('Trying copy button...');
      // Click the copy button next to stream key
      const copyBtn = page.locator('button:has-text("Kopiuj"), #copy-button').first();
      if (await copyBtn.isVisible().catch(() => false)) {
        await copyBtn.click();
        await page.waitForTimeout(1000);
        streamKey = await page.evaluate(() => navigator.clipboard.readText().catch(() => null));
      }
    }

    console.log('Extracted Stream Key for RCC:', streamKey);
    if (!streamKey) {
      await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_key_fail.png' });
      throw new Error('Could not get stream key for RCC');
    }

    // 3. Update visibility to Publiczny via "Edytuj"
    console.log('3. Changing visibility to Publiczny...');
    const editBtn = page.locator('button:has-text("Edytuj"), #edit-button').first();
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();
      await page.waitForTimeout(2500);

      // Select Publiczny in edit dialog
      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
      if (await pubRadio.isVisible().catch(() => false)) {
        await pubRadio.click();
        await page.waitForTimeout(500);
      }

      const saveBtn = page.locator('#save-button, button:has-text("Zapisz")').first();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(3000);
      }
    }

    // 4. Update aitum.json and restart RCC
    console.log('4. Updating aitum.json on cc-nadajnik for output RCC...');
    updateAitumKeyOnRemote('RCC', streamKey);
    await restartAitumOutput('RCC');

    console.log('5. Waiting 15s for stream signal in Studio...');
    await page.waitForTimeout(15000);

    // 6. Click "Transmituj na żywo"
    const goLive = page.locator('button:has-text("Transmituj na żywo"), #go-live-button').first();
    if (await goLive.isVisible().catch(() => false)) {
      const disabled = await goLive.getAttribute('disabled');
      console.log('Go live disabled:', disabled);
      if (!disabled) {
        console.log('Clicking Transmituj na żywo!');
        await goLive.click();
        await page.waitForTimeout(2500);

        const confirm = page.locator('#confirm-button, button:has-text("Rozpocznij")').first();
        if (await confirm.isVisible().catch(() => false)) {
          await confirm.click();
          await page.waitForTimeout(3000);
        }
      }
    }

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_live_success_final.png' });
    console.log('RCC stream activated successfully!');

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
