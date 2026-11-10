import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import { restartAitumOutput, updateAitumKeyOnRemote } from './setup_channel_live.mjs';

const CHANNEL_NAME = 'Werset Dnia - Chrześcijański Serwis Biblijny';
const OUTPUT_NAME = 'Werset Dnia';
const TITLE = 'Werset Dnia LIVE 🔴 24/7 | Chrześcijański Serwis Biblijny';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log(`1. Opening ${CHANNEL_NAME} manage page...`);
    await openChannelStudio(page, CHANNEL_NAME, '/livestreaming/manage');
    await page.waitForTimeout(5000);

    // Check if row already exists
    let row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    let hasRow = await row.isVisible().catch(() => false);

    if (!hasRow) {
      console.log('2. Clicking Zaplanuj transmisję...');
      const schedBtn = page.locator('#schedule-stream-button, button:has-text("Zaplanuj transmisję")').first();
      await schedBtn.click();
      await page.waitForTimeout(3000);

      const createNew = page.locator('button:has-text("Utwórz nowe")').first();
      if (await createNew.isVisible().catch(() => false)) {
        console.log('Clicking Utwórz nowe...');
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

      // Select "Nie, nie są przeznaczone dla dzieci" if present
      const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], tp-yt-paper-radio-button:has-text("przeznaczone dla dzieci")').last();
      if (await notForKids.isVisible().catch(() => false)) {
        await notForKids.click();
        await page.waitForTimeout(500);
      }

      // Step 1 -> Step 2
      console.log('Clicking Dalej step 1...');
      const nextBtn1 = page.locator('#next-button, button:has-text("Dalej")').first();
      if (await nextBtn1.isVisible().catch(() => false)) {
        await nextBtn1.click();
      } else {
        await page.mouse.click(1220, 880);
      }
      await page.waitForTimeout(2500);

      // Step 2 -> Step 3 (or visibility)
      console.log('Clicking Dalej step 2...');
      const nextBtn2 = page.locator('#next-button, button:has-text("Dalej")').first();
      if (await nextBtn2.isVisible().catch(() => false)) {
        await nextBtn2.click();
      } else {
        await page.mouse.click(1220, 880);
      }
      await page.waitForTimeout(2500);

      // Check if another Dalej is needed (Step 3 -> Step 4)
      const nextBtn3 = page.locator('#next-button, button:has-text("Dalej")').first();
      if (await nextBtn3.isVisible().catch(() => false)) {
        console.log('Clicking Dalej step 3...');
        await nextBtn3.click();
        await page.waitForTimeout(2500);
      }

      // Select Publiczny
      console.log('Selecting Publiczny...');
      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
      if (await pubRadio.isVisible().catch(() => false)) {
        await pubRadio.click();
        await page.waitForTimeout(1000);
      }

      // Click Gotowe
      console.log('Clicking Gotowe...');
      const doneBtn = page.locator('#done-button, button:has-text("Gotowe"), ytcp-button:has-text("Gotowe")').first();
      if (await doneBtn.isVisible().catch(() => false)) {
        await doneBtn.click();
      } else {
        await page.mouse.click(1220, 880);
      }
      await page.waitForTimeout(8000);
    }

    // Check if visibility in row is Niepubliczny
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
        await saveBtn.click();
        await page.waitForTimeout(4000);
      }
    }

    // Enter room
    console.log('3. Entering broadcast room...');
    row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    if (await row.isVisible().catch(() => false)) {
      await row.click();
      await page.waitForTimeout(6000);
    } else {
      await page.mouse.click(300, 350);
      await page.waitForTimeout(5000);
    }

    // Dismiss layout prompt
    await page.mouse.click(598, 612).catch(() => {});
    await page.waitForTimeout(1500);

    // Read stream key
    console.log('4. Extracting stream key...');
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

    if (!key) {
      const copyBtn = page.locator('button:has-text("Kopiuj"), #copy-button').first();
      if (await copyBtn.isVisible().catch(() => false)) {
        await copyBtn.click();
        await page.waitForTimeout(1000);
        key = await page.evaluate(() => navigator.clipboard.readText().catch(() => null));
      }
    }

    console.log(`Stream key for ${OUTPUT_NAME}: ${key}`);
    if (!key) throw new Error(`Could not find stream key for ${CHANNEL_NAME}`);

    // Update Aitum key on remote & restart output
    updateAitumKeyOnRemote(OUTPUT_NAME, key);
    await restartAitumOutput(OUTPUT_NAME);

    console.log('5. Waiting 15s for stream signal in Studio...');
    await page.waitForTimeout(15000);

    // Click Transmituj na żywo
    console.log('6. Clicking Transmituj na żywo...');
    const goLive = page.locator('button:has-text("Transmituj na żywo"), #go-live-button').first();
    if (await goLive.isVisible().catch(() => false)) {
      console.log('Clicking go live with force: true...');
      await goLive.click({ force: true });
      await page.waitForTimeout(2000);

      const confirm = page.locator('#confirm-button, button:has-text("Rozpocznij")').first();
      if (await confirm.isVisible().catch(() => false)) {
        console.log('Confirming Rozpocznij...');
        await confirm.click({ force: true });
        await page.waitForTimeout(3000);
      }
    }

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\wersetdnia_live_started.png' });
    console.log('Werset Dnia live setup complete!');

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
