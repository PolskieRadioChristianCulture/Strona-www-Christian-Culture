import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, 'Polskie Radio CHRISTIAN CULTURE', '/livestreaming/manage');
    await page.waitForTimeout(4000);

    await page.locator('#schedule-stream-button, button:has-text("Zaplanuj transmisję")').first().click();
    await page.waitForTimeout(2500);

    const createNew = page.locator('button:has-text("Utwórz nowe")').first();
    if (await createNew.isVisible().catch(() => false)) {
      await createNew.click();
      await page.waitForTimeout(2000);
    }

    // Type title
    await page.mouse.click(400, 335);
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Polskie Radio Christian Culture LIVE 🔴 24/7');
    await page.waitForTimeout(1000);

    // Also click "Nie, nie jest przeznaczony dla dzieci" on step 1 just in case
    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], tp-yt-paper-radio-button:has-text("Nie, nie jest przeznaczony dla dzieci")').first();
    if (await notForKids.isVisible().catch(() => false)) {
      console.log('Selecting not for kids...');
      await notForKids.click();
      await page.waitForTimeout(500);
    }

    // Dalej 1
    await page.mouse.click(1220, 880);
    await page.waitForTimeout(2500);

    // Dalej 2
    await page.mouse.click(1220, 880);
    await page.waitForTimeout(2500);

    // In step 3: Select Publiczny
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await pubRadio.isVisible().catch(() => false)) {
      await pubRadio.click();
      await page.waitForTimeout(1000);
    }

    // Click time input at (388, 712)
    console.log('Clicking time input at (388, 712)...');
    await page.mouse.click(388, 712);
    await page.waitForTimeout(500);
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('23:00');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_step3_after_time.png' });

    // Check Gotowe button state now
    const gotowe = page.locator('#done-button button, [aria-label="Gotowe"]').first();
    const disabled = await gotowe.getAttribute('disabled');
    const ariaDisabled = await gotowe.getAttribute('aria-disabled');
    console.log(`Gotowe button disabled: ${disabled}, aria-disabled: ${ariaDisabled}`);

    if (disabled === null && ariaDisabled !== 'true') {
      console.log('Gotowe is ENABLED! Clicking it...');
      await gotowe.click();
      await page.waitForTimeout(8000);
      await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_gotowe_worked_now.png' });
    }

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
