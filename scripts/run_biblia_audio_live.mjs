import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import { restartAitumOutput, updateAitumKeyOnRemote } from './setup_channel_live.mjs';

const CHANNEL_NAME = 'Biblia Audio Christian Culture';
const OUTPUT_NAME = 'Biblia Audio';
const TITLE = 'Biblia Audio Christian Culture LIVE 🔴 24/7';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log(`1. Opening ${CHANNEL_NAME} manage...`);
    await openChannelStudio(page, CHANNEL_NAME, '/livestreaming/manage');
    await page.waitForTimeout(4000);

    let row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    let hasRow = await row.isVisible().catch(() => false);

    if (!hasRow) {
      console.log('No broadcast row found. Clicking Zaplanuj transmisję...');
      await page.locator('#schedule-stream-button, button:has-text("Zaplanuj transmisję")').first().click();
      await page.waitForTimeout(2500);

      const createNew = page.locator('button:has-text("Utwórz nowe")').first();
      if (await createNew.isVisible().catch(() => false)) {
        await createNew.click();
        await page.waitForTimeout(2000);
      }

      // Step 1: Title
      console.log(`Typing title: ${TITLE}...`);
      await page.mouse.click(400, 335);
      await page.waitForTimeout(500);
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(TITLE);
      await page.waitForTimeout(1000);

      // Dalej 1
      console.log('Clicking Dalej step 1...');
      await page.mouse.click(1220, 880);
      await page.waitForTimeout(2500);

      // Dalej 2
      console.log('Clicking Dalej step 2...');
      await page.mouse.click(1220, 880);
      await page.waitForTimeout(2500);

      // Dalej 3
      console.log('Clicking Dalej step 3...');
      await page.mouse.click(1220, 880);
      await page.waitForTimeout(2500);

      // Select Publiczny
      console.log('Selecting Publiczny...');
      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
      if (await pubRadio.isVisible().catch(() => false)) {
        await pubRadio.click();
        await page.waitForTimeout(1000);
      }

      // Click Gotowe
      console.log('Clicking Gotowe at (1220, 880)...');
      await page.mouse.click(1220, 880);
      await page.waitForTimeout(8000);
    }

    // Check if visibility is Niepubliczny on manage table
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
    console.log('2. Entering broadcast room...');
    row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    if (await row.isVisible().catch(() => false)) {
      await row.click();
      await page.waitForTimeout(6000);
    }

    // Dismiss layout modal
    await page.mouse.click(598, 612).catch(() => {});
    await page.waitForTimeout(1500);

    // Read stream key
    console.log('3. Reading stream key...');
    let streamKey = await page.evaluate(() => {
      const inp = document.querySelector('input[type="password"]');
      return inp ? inp.value : null;
    });

    if (!streamKey) {
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
    console.log('5. Checking Transmituj na żywo button...');
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
