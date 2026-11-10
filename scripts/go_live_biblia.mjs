import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import { restartAitumOutput, updateAitumKeyOnRemote } from './setup_channel_live.mjs';

const CHANNEL_NAME = 'Biblia Audio Christian Culture';
const OUTPUT_NAME = 'Biblia Audio';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log(`1. Opening ${CHANNEL_NAME} manage...`);
    await openChannelStudio(page, CHANNEL_NAME, '/livestreaming/manage');
    await page.waitForTimeout(4000);

    // Enter room from row
    console.log('2. Entering broadcast room...');
    const row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    if (await row.isVisible().catch(() => false)) {
      console.log('Clicking broadcast row...');
      await row.click();
      await page.waitForTimeout(6000);
    } else {
      console.log('Row not directly visible, checking first link in table...');
      await page.mouse.click(300, 350);
      await page.waitForTimeout(5000);
    }

    // Dismiss layout modal
    await page.mouse.click(598, 612).catch(() => {});
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\biblia_room_inspect.png' });

    // Read stream key
    console.log('3. Reading stream key...');
    let streamKey = await page.evaluate(() => {
      const inp = document.querySelector('input[type="password"]');
      return inp ? inp.value : null;
    });

    if (!streamKey) {
      console.log('Trying copy button...');
      const copyBtn = page.locator('button:has-text("Kopiuj"), #copy-button').first();
      if (await copyBtn.isVisible().catch(() => false)) {
        await copyBtn.click();
        await page.waitForTimeout(1000);
        streamKey = await page.evaluate(() => navigator.clipboard.readText().catch(() => null));
      }
    }

    console.log(`Extracted Stream Key for ${CHANNEL_NAME}: ${streamKey}`);
    if (!streamKey) throw new Error(`Could not find stream key for ${CHANNEL_NAME}`);

    // Update Aitum & restart output
    updateAitumKeyOnRemote(OUTPUT_NAME, streamKey);
    await restartAitumOutput(OUTPUT_NAME);

    console.log('4. Waiting 15s for stream signal in Studio...');
    await page.waitForTimeout(15000);

    // Click Transmituj na żywo
    console.log('5. Clicking Transmituj na żywo...');
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

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\biblia_live_started_final.png' });
    console.log('Biblia Audio setup finished successfully!');

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
