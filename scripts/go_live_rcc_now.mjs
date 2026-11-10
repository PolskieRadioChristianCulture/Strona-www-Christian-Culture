import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log('1. Opening RCC manage...');
    await openChannelStudio(page, 'Polskie Radio CHRISTIAN CULTURE', '/livestreaming/manage');
    await page.waitForTimeout(4000);

    // If visibility is Niepubliczny, change it on manage table
    const niepub = page.locator('text=Niepublicz').first();
    if (await niepub.isVisible().catch(() => false)) {
      console.log('Publishing to Public on manage table...');
      await niepub.click();
      await page.waitForTimeout(1500);
      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
      await pubRadio.click();
      await page.waitForTimeout(1000);
      const saveBtn = page.locator('tp-yt-paper-dialog #save-button').first();
      await saveBtn.click();
      await page.waitForTimeout(4000);
    }

    // Enter room
    console.log('2. Entering room...');
    const row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    if (await row.isVisible().catch(() => false)) {
      await row.click();
      await page.waitForTimeout(6000);
    }

    // Dismiss layout prompt
    await page.mouse.click(598, 612).catch(() => {});
    await page.waitForTimeout(1500);

    // Click Transmituj na żywo
    console.log('3. Clicking Transmituj na żywo...');
    const goLive = page.locator('button:has-text("Transmituj na żywo"), #go-live-button').first();
    if (await goLive.isVisible().catch(() => false)) {
      console.log('Found go live button, clicking with force: true...');
      await goLive.click({ force: true });
      await page.waitForTimeout(2000);

      const confirm = page.locator('#confirm-button, button:has-text("Rozpocznij")').first();
      if (await confirm.isVisible().catch(() => false)) {
        console.log('Confirming Rozpocznij...');
        await confirm.click({ force: true });
        await page.waitForTimeout(3000);
      }
    }

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_live_started.png' });
    console.log('Saved rcc_live_started.png');

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
