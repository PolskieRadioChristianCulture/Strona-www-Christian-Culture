import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  console.log('1. Opening CC Men manage page...');
  await openChannelStudio(page, 'CC Men', '/livestreaming/manage');
  await page.waitForTimeout(5000);

  const cell = page.locator('text=Niepublicz').first();
  if (await cell.isVisible().catch(() => false)) {
    console.log('Clicking Niepubliczny cell on CC Men...');
    await cell.click();
    await page.waitForTimeout(1500);

    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
    console.log('Clicking PUBLIC radio...');
    await pubRadio.click();
    await page.waitForTimeout(1000);

    const saveBtn = page.locator('tp-yt-paper-dialog #save-button').first();
    console.log('Save disabled:', await saveBtn.getAttribute('aria-disabled'));
    console.log('Clicking save...');
    await saveBtn.click();
    await page.waitForTimeout(4000);
  }

  // Now enter the room to click "Transmituj na żywo"
  console.log('2. Entering CC Men control room...');
  const row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
  if (await row.isVisible().catch(() => false)) {
    await row.click();
    await page.waitForTimeout(5000);
  }

  // Dismiss layout dialog
  await page.mouse.click(598, 612).catch(() => {});
  await page.waitForTimeout(1000);

  // Look for "Transmituj na żywo" button
  console.log('3. Checking Transmituj na żywo button...');
  const goLive = page.locator('button:has-text("Transmituj na żywo"), #go-live-button').first();
  if (await goLive.isVisible().catch(() => false)) {
    const disabled = await goLive.getAttribute('disabled');
    console.log('Go live button found, disabled:', disabled);
    if (!disabled) {
      console.log('Clicking Transmituj na żywo...');
      await goLive.click();
      await page.waitForTimeout(2000);
      const confirm = page.locator('#confirm-button, button:has-text("Rozpocznij")').first();
      if (await confirm.isVisible().catch(() => false)) {
        console.log('Clicking Rozpocznij in confirm dialog...');
        await confirm.click();
        await page.waitForTimeout(3000);
      }
    }
  }

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\cc_men_live_final.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);

  await ctx.close();
}

main().catch(console.error);
