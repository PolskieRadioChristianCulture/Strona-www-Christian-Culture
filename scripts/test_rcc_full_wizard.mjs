import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
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
  console.log('Clicking Dalej step 1 at (1220, 880)...');
  await page.mouse.click(1220, 880);
  await page.waitForTimeout(2500);

  // Click Dalej step 2
  console.log('Clicking Dalej step 2 at (1220, 880)...');
  await page.mouse.click(1220, 880);
  await page.waitForTimeout(2500);

  // Select Publiczny
  console.log('Selecting Publiczny...');
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
  if (await pubRadio.isVisible().catch(() => false)) {
    await pubRadio.click();
    await page.waitForTimeout(1000);
  }

  // Look for all buttons in the dialog footer
  console.log('Inspecting dialog buttons:');
  const btns = await page.locator('ytcp-dialog button, ytcp-dialog ytcp-button').all();
  for (const b of btns) {
    const text = (await b.innerText()).trim();
    const id = await b.getAttribute('id');
    console.log(`Button: "${text}", id: "${id}"`);
  }

  // Click Gotowe
  const gotoweBtn = page.locator('button:has-text("Gotowe"), ytcp-button:has-text("Gotowe"), #done-button').first();
  if (await gotoweBtn.isVisible().catch(() => false)) {
    console.log('Clicking Gotowe via locator...');
    await gotoweBtn.click();
  } else {
    console.log('Gotowe not found by text, clicking coordinate (760, 880)...');
    await page.mouse.click(760, 880);
  }
  await page.waitForTimeout(8000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\rcc_created_table.png' });
  console.log('Table after creation saved.');

  // Find rows
  const rows = await page.locator('ytcp-video-row').all();
  console.log(`Found ${rows.length} rows.`);
  for (const r of rows) {
    console.log('Row text:', (await r.innerText()).replace(/\s+/g, ' '));
  }

  await ctx.close();
}

main().catch(console.error);
