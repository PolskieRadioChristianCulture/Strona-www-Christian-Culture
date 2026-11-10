import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import { restartAitumOutput, updateAitumKeyOnRemote } from './setup_channel_live.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log('1. Opening RCC manage...');
    await openChannelStudio(page, 'Polskie Radio CHRISTIAN CULTURE', '/livestreaming/manage');
    await page.waitForTimeout(4000);

    // If dialog not open, click Zaplanuj transmisję
    let dialog = page.locator('ytcp-dialog').first();
    if (!(await dialog.isVisible().catch(() => false))) {
      console.log('Clicking Zaplanuj transmisję...');
      await page.locator('#schedule-stream-button, button:has-text("Zaplanuj transmisję")').first().click();
      await page.waitForTimeout(2500);

      const createNew = page.locator('button:has-text("Utwórz nowe")').first();
      if (await createNew.isVisible().catch(() => false)) {
        await createNew.click();
        await page.waitForTimeout(2000);
      }
    }

    // Step 1: Set Title & Not for kids
    console.log('Setting title...');
    await page.mouse.click(400, 335);
    await page.waitForTimeout(500);
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Polskie Radio Christian Culture LIVE 🔴 24/7');
    await page.waitForTimeout(1000);

    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], tp-yt-paper-radio-button:has-text("Nie, nie jest przeznaczony dla dzieci")').first();
    if (await notForKids.isVisible().catch(() => false)) {
      await notForKids.click();
      await page.waitForTimeout(500);
    }

    // Loop through wizard steps until Gotowe is reached
    for (let step = 1; step <= 5; step++) {
      console.log(`Checking step ${step}...`);

      // Check if we are on Widoczność (visibility step)
      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
      if (await pubRadio.isVisible().catch(() => false)) {
        console.log('On Widoczność step! Selecting Publiczny...');
        await pubRadio.click();
        await page.waitForTimeout(1000);

        // Click Gotowe
        console.log('Clicking Gotowe at (765, 880)...');
        await page.mouse.click(765, 880);
        await page.waitForTimeout(8000);
        break;
      }

      // If not on visibility step yet, click Dalej
      console.log(`Clicking Dalej at (765, 880) for step ${step}...`);
      await page.mouse.click(765, 880);
      await page.waitForTimeout(2500);
    }

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_created_final_check.png' });

    // Open row in table
    console.log('2. Opening broadcast from table...');
    const row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    if (await row.isVisible().catch(() => false)) {
      await row.click();
      await page.waitForTimeout(5000);
    }

    // Dismiss layout modal
    await page.mouse.click(598, 612).catch(() => {});
    await page.waitForTimeout(1000);

    // Read stream key
    const streamKey = await page.evaluate(() => {
      const input = document.querySelector('input[type="password"]');
      return input ? input.value : null;
    });
    console.log('Stream key for RCC is:', streamKey);
    if (!streamKey) throw new Error('No stream key found for RCC');

    // Update Aitum & restart RCC
    updateAitumKeyOnRemote('RCC', streamKey);
    await restartAitumOutput('RCC');

    console.log('Waiting 15s for stream to arrive in Studio...');
    await page.waitForTimeout(15000);

    // Click Transmituj na żywo
    const goLive = page.locator('button:has-text("Transmituj na żywo"), #go-live-button').first();
    if (await goLive.isVisible().catch(() => false)) {
      const disabled = await goLive.getAttribute('disabled');
      console.log('Go live disabled:', disabled);
      if (!disabled) {
        console.log('Clicking Transmituj na żywo...');
        await goLive.click();
        await page.waitForTimeout(2500);

        const confirm = page.locator('#confirm-button, button:has-text("Rozpocznij")').first();
        if (await confirm.isVisible().catch(() => false)) {
          await confirm.click();
          await page.waitForTimeout(3000);
        }
      }
    }

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_live_worked.png' });
    console.log('RCC setup finished successfully!');

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
