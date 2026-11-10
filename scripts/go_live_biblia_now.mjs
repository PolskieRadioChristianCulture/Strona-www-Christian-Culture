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

    // If visibility is Niepubliczny, change it on manage table
    const niepub = page.locator('text=Niepublicz').first();
    if (await niepub.isVisible().catch(() => false)) {
      console.log('Publishing to Public on manage table...');
      await niepub.click();
      await page.waitForTimeout(1500);
      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
      if (await pubRadio.isVisible().catch(() => false)) {
        await pubRadio.click();
        await page.waitForTimeout(1000);
      }
      const saveBtn = page.locator('tp-yt-paper-dialog #save-button').first();
      if (await saveBtn.isVisible().catch(() => false)) {
        console.log('Clicking tp-yt-paper-dialog #save-button...');
        await saveBtn.click();
        await page.waitForTimeout(4000);
      }
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

    // Read stream key by toggling eye button if needed
    console.log('3. Checking stream key...');
    let key = await page.evaluate(() => {
      const inp = document.querySelector('input[type="password"]');
      return inp ? inp.value : null;
    });
    if (!key) {
      const eye = page.locator('ytcp-icon-button[aria-label*="Pokaż"], button[aria-label*="Pokaż"], #toggle-button').first();
      if (await eye.isVisible().catch(() => false)) {
        await eye.click();
        await page.waitForTimeout(1000);
      }
      key = await page.evaluate(() => {
        const inp = document.querySelector('input[type="text"][aria-label*="Klucz"], input[type="text"][value*="-"]');
        return inp ? inp.value : null;
      });
    }

    console.log(`Current room stream key: ${key}`);
    if (key && key !== 'wf6b-91hh-e6jt-ga17-41yh') {
      console.log(`Updating key on remote to ${key}...`);
      updateAitumKeyOnRemote(OUTPUT_NAME, key);
    }

    // Restart OBS output
    console.log(`Restarting OBS output ${OUTPUT_NAME}...`);
    await restartAitumOutput(OUTPUT_NAME);

    console.log('Waiting 15 seconds for YouTube to ingest signal...');
    await page.waitForTimeout(15000);

    // Click Transmituj na żywo
    console.log('4. Clicking Transmituj na żywo...');
    const goLive = page.locator('button:has-text("Transmituj na żywo"), #go-live-button, [aria-label*="Transmituj na żywo"]').first();
    if (await goLive.isVisible().catch(() => false)) {
      console.log('Found go live button, clicking with force: true...');
      await goLive.click({ force: true });
      await page.waitForTimeout(2000);

      const confirm = page.locator('#confirm-button, button:has-text("Rozpocznij")').first();
      if (await confirm.isVisible().catch(() => false)) {
        console.log('Confirming Rozpocznij...');
        await confirm.click({ force: true });
        await page.waitForTimeout(4000);
      }
    }

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\biblia_live_started.png' });
    console.log('Biblia Audio setup completed.');

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
