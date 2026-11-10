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

    // Dalej 1
    await page.mouse.click(1220, 880);
    await page.waitForTimeout(2500);

    // Dalej 2
    await page.mouse.click(1220, 880);
    await page.waitForTimeout(2500);

    // In step 3:
    // List all inputs
    const inputs = await page.locator('ytcp-dialog input').all();
    console.log(`Found ${inputs.length} inputs in dialog:`);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const val = await inp.inputValue().catch(() => '');
      const aria = await inp.getAttribute('aria-label');
      console.log(`Input type="${type}", val="${val}", aria="${aria}"`);
    }

    // Look for time input or text input with 12:30
    for (const inp of inputs) {
      const val = await inp.inputValue().catch(() => '');
      if (val.includes(':')) {
        console.log(`Found time input with value: ${val}. Changing to 18:00...`);
        await inp.click();
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.type('18:00');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
      }
    }

    // Select Publiczny
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await pubRadio.isVisible().catch(() => false)) {
      await pubRadio.click();
      await page.waitForTimeout(1000);
    }

    // Check Gotowe button state now
    const gotowe = page.locator('#done-button button, [aria-label="Gotowe"]').first();
    const disabled = await gotowe.getAttribute('disabled');
    const ariaDisabled = await gotowe.getAttribute('aria-disabled');
    console.log(`Gotowe button disabled: ${disabled}, aria-disabled: ${ariaDisabled}`);

    if (disabled === null && ariaDisabled !== 'true') {
      console.log('Gotowe is ENABLED! Clicking it...');
      await gotowe.click();
      await page.waitForTimeout(8000);
      await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_gotowe_worked.png' });
      console.log('Saved rcc_gotowe_worked.png');
    }

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
