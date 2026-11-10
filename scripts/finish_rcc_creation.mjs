import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import { restartAitumOutput, updateAitumKeyOnRemote } from './setup_channel_live.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  console.log('1. Opening RCC manage...');
  await openChannelStudio(page, 'Polskie Radio CHRISTIAN CULTURE', '/livestreaming/manage');
  await page.waitForTimeout(5000);

  // Check if dialog is open with Gotowe
  const doneBtn = page.locator('#done-button, button:has-text("Gotowe")').first();
  if (await doneBtn.isVisible().catch(() => false)) {
    console.log('Clicking Gotowe button...');
    await doneBtn.click();
    await page.waitForTimeout(6000);
  }

  // Click row to enter room
  console.log('2. Opening broadcast room...');
  let row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
  if (await row.isVisible().catch(() => false)) {
    await row.click();
    await page.waitForTimeout(5000);
  }

  // Dismiss layout prompt
  await page.mouse.click(598, 612).catch(() => {});
  await page.waitForTimeout(1000);

  // Get stream key
  const streamKey = await page.evaluate(() => {
    const input = document.querySelector('input[type="password"]');
    return input ? input.value : null;
  });
  console.log('Stream key for RCC is:', streamKey);

  if (!streamKey) {
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_no_key_debug.png' });
    throw new Error('No stream key found for RCC');
  }

  // Update aitum.json for RCC
  updateAitumKeyOnRemote('RCC', streamKey);
  await restartAitumOutput('RCC');

  console.log('Waiting 15s for OBS stream to arrive...');
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

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_live_success.png' });
  console.log('Done!');
  await ctx.close();
}

main().catch(console.error);
