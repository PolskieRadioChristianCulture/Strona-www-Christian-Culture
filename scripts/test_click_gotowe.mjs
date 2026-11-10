import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log('1. Opening RCC manage...');
    await openChannelStudio(page, 'Polskie Radio CHRISTIAN CULTURE', '/livestreaming/manage');
    await page.waitForTimeout(4000);

    console.log('2. Clicking Zaplanuj transmisję...');
    await page.locator('#schedule-stream-button, button:has-text("Zaplanuj transmisję")').first().click();
    await page.waitForTimeout(2500);

    const createNew = page.locator('button:has-text("Utwórz nowe")').first();
    if (await createNew.isVisible().catch(() => false)) {
      console.log('Clicking Utwórz nowe...');
      await createNew.click();
      await page.waitForTimeout(2000);
    }

    // Type title
    console.log('Typing title...');
    await page.mouse.click(400, 335);
    await page.waitForTimeout(500);
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Polskie Radio Christian Culture LIVE 🔴 24/7');
    await page.waitForTimeout(1000);

    // Click Dalej step 1
    console.log('Clicking Dalej step 1...');
    await page.mouse.click(1220, 880);
    await page.waitForTimeout(2500);

    // Click Dalej step 2
    console.log('Clicking Dalej step 2...');
    await page.mouse.click(1220, 880);
    await page.waitForTimeout(2500);

    // Select Publiczny
    console.log('Selecting Publiczny...');
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await pubRadio.isVisible().catch(() => false)) {
      await pubRadio.click();
      await page.waitForTimeout(1000);
    }

    // Log all buttons in dialog
    const footerButtons = await page.locator('ytcp-dialog #next-button, ytcp-dialog #done-button, ytcp-dialog button').all();
    console.log(`Found ${footerButtons.length} buttons in dialog:`);
    for (const b of footerButtons) {
      console.log(` - tag: ${await b.evaluate(el => el.tagName)}, id: ${await b.getAttribute('id')}, text: ${(await b.innerText()).trim()}`);
    }

    // Click Gotowe: let's click #done-button or button:has-text("Gotowe")
    const gotowe = page.locator('#done-button button, #done-button, button:has-text("Gotowe")').first();
    console.log('Clicking Gotowe...');
    await gotowe.click();
    await page.waitForTimeout(8000);

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_after_gotowe_fixed.png' });

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
