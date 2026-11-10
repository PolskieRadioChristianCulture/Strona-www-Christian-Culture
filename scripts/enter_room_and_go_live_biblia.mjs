import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import { restartAitumOutput, updateAitumKeyOnRemote } from './setup_channel_live.mjs';

const CHANNEL_NAME = 'Biblia Audio Christian Culture';
const OUTPUT_NAME = 'Biblia Audio';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log(`1. Opening ${CHANNEL_NAME} manage...`);
    await openChannelStudio(page, CHANNEL_NAME, '/livestreaming/manage');
    await page.waitForTimeout(5000);

    // If visibility is Niepubliczny on manage table, make it Public
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

    // Wait for row and click it
    console.log('2. Waiting for row in table...');
    const row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    await row.waitFor({ timeout: 20000 });
    console.log('Row visible! Clicking row to enter room...');
    await row.click();
    await page.waitForTimeout(6000);

    // Dismiss layout modal
    await page.mouse.click(598, 612).catch(() => {});
    await page.waitForTimeout(1500);

    // Take screenshot of room
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\biblia_room.png' });

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

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\biblia_audio_live_started.png' });
    console.log('Biblia Audio setup finished successfully!');

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
