import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log('1. Opening RCC manage...');
    await openChannelStudio(page, 'Polskie Radio CHRISTIAN CULTURE', '/livestreaming/manage');
    await page.waitForTimeout(4000);

    // If dialog open, take screenshot
    let dialog = page.locator('ytcp-dialog').first();
    let isOpen = await dialog.isVisible().catch(() => false);
    console.log('Is dialog currently open?', isOpen);

    if (!isOpen) {
      console.log('Clicking Zaplanuj transmisję...');
      await page.locator('#schedule-stream-button, button:has-text("Zaplanuj transmisję")').first().click();
      await page.waitForTimeout(2500);

      const createNew = page.locator('button:has-text("Utwórz nowe")').first();
      if (await createNew.isVisible().catch(() => false)) {
        await createNew.click();
        await page.waitForTimeout(2000);
      }
    }

    // Step 1: Set Title
    console.log('Typing title...');
    await page.mouse.click(400, 335);
    await page.waitForTimeout(500);
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Polskie Radio Christian Culture LIVE 🔴 24/7');
    await page.waitForTimeout(1000);

    // Click Dalej step 1 at (1220, 880)
    console.log('Clicking Dalej step 1 at (1220, 880)...');
    await page.mouse.click(1220, 880);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_after_dalej1.png' });

    // Click Dalej step 2 at (1220, 880)
    console.log('Clicking Dalej step 2 at (1220, 880)...');
    await page.mouse.click(1220, 880);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_after_dalej2.png' });

    // Click Dalej step 3 at (1220, 880)
    console.log('Clicking Dalej step 3 at (1220, 880)...');
    await page.mouse.click(1220, 880);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_after_dalej3.png' });

    // In step 4: Visibility Publiczny
    console.log('Selecting Publiczny...');
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await pubRadio.isVisible().catch(() => false)) {
      await pubRadio.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_step4_visibility.png' });

    // Click Gotowe at (1220, 880)
    console.log('Clicking Gotowe at (1220, 880)...');
    await page.mouse.click(1220, 880);
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_after_gotowe_check.png' });

    console.log('Complete step by step test done.');
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
