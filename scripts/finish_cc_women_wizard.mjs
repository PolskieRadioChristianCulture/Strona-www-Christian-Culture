import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'CC Women', '/livestreaming/manage');
  await page.waitForTimeout(5000);

  // Check if wizard dialog is open or open it
  let wizard = page.locator('ytcp-dialog, tp-yt-paper-dialog').first();
  if (!(await wizard.isVisible().catch(() => false))) {
    const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), #schedule-stream-button').first();
    await schedBtn.click();
    await page.waitForTimeout(2000);
    const reuseBtn = page.locator('button:has-text("Użyj poprzednich ustawień")').first();
    if (await reuseBtn.isVisible().catch(() => false)) {
      await reuseBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  // Click Dalej step 1 -> step 2
  console.log('Clicking Dalej step 1...');
  let dalejBtn = page.locator('button:has-text("Dalej")').first();
  await dalejBtn.click();
  await page.waitForTimeout(2000);

  // Click Dalej step 2 -> step 3
  console.log('Clicking Dalej step 2...');
  dalejBtn = page.locator('button:has-text("Dalej")').first();
  if (await dalejBtn.isVisible().catch(() => false)) {
    await dalejBtn.click();
    await page.waitForTimeout(2000);
  }

  // Step 3: Visibility
  console.log('Selecting Publiczny in step 3...');
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
  if (await pubRadio.isVisible().catch(() => false)) {
    await pubRadio.click();
    await page.waitForTimeout(1000);
  }

  // Finish wizard (Gotowe / Utwórz)
  console.log('Clicking Gotowe...');
  const doneBtn = page.locator('button:has-text("Gotowe"), button:has-text("Utwórz"), button:has-text("Zapisz"), #done-button').first();
  await doneBtn.click();
  await page.waitForTimeout(6000);

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\cc_women_wizard_done.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);
  console.log('URL after wizard:', page.url());

  await ctx.close();
}

main().catch(console.error);
