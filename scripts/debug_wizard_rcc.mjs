import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  console.log('1. Opening RCC manage...');
  await openChannelStudio(page, 'Polskie Radio CHRISTIAN CULTURE', '/livestreaming/manage');
  await page.waitForTimeout(4000);

  console.log('2. Clicking Zaplanuj transmisję button...');
  const schedBtn = page.locator('#schedule-stream-button, button:has-text("Zaplanuj transmisję")').first();
  await schedBtn.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_wizard_step1.png' });

  // Check if "Utwórz nowe" is visible
  const createNew = page.locator('button:has-text("Utwórz nowe")').first();
  if (await createNew.isVisible().catch(() => false)) {
    console.log('Clicking Utwórz nowe...');
    await createNew.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_wizard_step1_after_create.png' });
  }

  // Type title
  console.log('Clicking title box at (400, 335)...');
  await page.mouse.click(400, 335);
  await page.waitForTimeout(500);
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('Polskie Radio Christian Culture LIVE 🔴 24/7');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_wizard_step1_typed.png' });

  // Click Dalej step 1
  console.log('Clicking Dalej step 1 at (1220, 880)...');
  await page.mouse.click(1220, 880);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_wizard_step2.png' });

  // Click Dalej step 2
  console.log('Clicking Dalej step 2 at (1220, 880)...');
  await page.mouse.click(1220, 880);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_wizard_step3.png' });

  // Select Publiczny
  console.log('Selecting Publiczny...');
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
  if (await pubRadio.isVisible().catch(() => false)) {
    await pubRadio.click();
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_wizard_step3_selected.png' });

  // Click Gotowe
  console.log('Clicking Gotowe at (1220, 880)...');
  await page.mouse.click(1220, 880);
  await page.waitForTimeout(8000);
  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_wizard_after_gotowe.png' });

  await ctx.close();
}

main().catch(console.error);
