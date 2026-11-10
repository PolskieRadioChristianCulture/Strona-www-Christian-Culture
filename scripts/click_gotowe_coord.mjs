import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'CC Women', '/livestreaming/manage');
  await page.waitForTimeout(5000);

  // If dialog is not open, open it
  let wizard = page.locator('ytcp-dialog, tp-yt-paper-dialog').first();
  if (!(await wizard.isVisible().catch(() => false))) {
    const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), #schedule-stream-button').first();
    await schedBtn.click();
    await page.waitForTimeout(2000);
    const reuseBtn = page.locator('button:has-text("Użyj poprzednich ustawień")').first();
    if (await reuseBtn.isVisible().catch(() => false)) {
      await reuseBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  // Click Dalej step 1
  console.log('Clicking Dalej step 1...');
  await page.mouse.click(760, 884);
  await page.waitForTimeout(2000);

  // Click Dalej step 2
  console.log('Clicking Dalej step 2...');
  await page.mouse.click(760, 884);
  await page.waitForTimeout(2000);

  // In Step 3, click Gotowe at (760, 884)
  console.log('Clicking Gotowe step 3 at (760, 884)...');
  await page.mouse.click(760, 884);
  await page.waitForTimeout(6000);

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\cc_women_created.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);
  console.log('Current URL:', page.url());

  // Check rows in manage
  const rows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('ytcp-video-row, [role="row"]')).map(r => r.innerText.replace(/\s+/g, ' ').trim());
  });
  console.log('Rows now:', rows);

  await ctx.close();
}

main().catch(console.error);
