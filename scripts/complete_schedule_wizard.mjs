import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/channel/UCG5Y4dwJi5436Gu6QH3nNUQ/livestreaming/manage?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const scheduleBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję")').first();
  await scheduleBtn.click();
  await page.waitForTimeout(2000);

  const reuseBtn = page.locator('button:has-text("Użyj poprzednich ustawień")').first();
  await reuseBtn.click();
  await page.waitForTimeout(3000);

  // Set Title
  const titleBox = page.locator('#textbox[contenteditable="true"]').first();
  if (await titleBox.isVisible().catch(() => false)) {
    await titleBox.fill('Christian Culture TV LIVE 🔴 24/7');
  }

  // Audience: Not for kids
  const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notForKids.isVisible().catch(() => false)) {
    await notForKids.click();
  }
  await page.waitForTimeout(1000);

  // Step 1 -> Step 2
  console.log('Clicking Dalej (Step 1 -> 2)...');
  await page.locator('#next-button button, ytcp-button#next-button, button:has-text("Dalej")').last().click();
  await page.waitForTimeout(2000);

  // Step 2 -> Step 3 (Zarabianie)
  console.log('Clicking Dalej (Step 2 -> 3)...');
  await page.locator('#next-button button, ytcp-button#next-button, button:has-text("Dalej")').last().click();
  await page.waitForTimeout(2000);

  // Step 3 -> Step 4 (Dostosowywanie)
  console.log('Clicking Dalej (Step 3 -> 4)...');
  await page.locator('#next-button button, ytcp-button#next-button, button:has-text("Dalej")').last().click();
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\wizard_step_4_visibility.png' });

  // In Step 4 (Widoczność): choose Publiczny
  const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
  if (await publicRadio.isVisible().catch(() => false)) {
    console.log('Selecting Publiczny...');
    await publicRadio.click();
    await page.waitForTimeout(1000);
  }

  // Click Gotowe / Zapisz
  console.log('Clicking Gotowe / Zapisz...');
  const doneBtn = page.locator('#done-button button, ytcp-button#done-button, button:has-text("Gotowe"), button:has-text("Zapisz")').last();
  await doneBtn.click();
  await page.waitForTimeout(5000);

  console.log('Final URL:', page.url());
  const shotFinal = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\wizard_completed.png';
  await page.screenshot({ path: shotFinal, fullPage: true });
  console.log('Screenshot saved to:', shotFinal);

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
