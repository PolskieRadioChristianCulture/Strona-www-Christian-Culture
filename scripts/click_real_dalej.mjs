import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'CC Women', '/livestreaming/manage');
  await page.waitForTimeout(5000);

  const schedBtn = page.locator('button:has-text("Zaplanuj transmisję")').first();
  if (await schedBtn.isVisible().catch(() => false)) {
    console.log('Clicking Zaplanuj transmisję...');
    await schedBtn.click();
    await page.waitForTimeout(2000);
    const reuseBtn = page.locator('button:has-text("Użyj poprzednich ustawień")').first();
    if (await reuseBtn.isVisible().catch(() => false)) {
      console.log('Clicking Użyj poprzednich ustawień...');
      await reuseBtn.click();
      await page.waitForTimeout(2500);
    }
  }

  // Click Dalej step 1 at (1220, 880)
  console.log('Clicking Dalej step 1 at (1220, 880)...');
  await page.mouse.click(1220, 880);
  await page.waitForTimeout(2000);

  // Click Dalej step 2 at (1220, 880)
  console.log('Clicking Dalej step 2 at (1220, 880)...');
  await page.mouse.click(1220, 880);
  await page.waitForTimeout(2000);

  // Step 3: Select Publiczny
  console.log('Selecting Publiczny in step 3...');
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
  if (await pubRadio.isVisible().catch(() => false)) {
    await pubRadio.click();
    await page.waitForTimeout(1000);
  }

  // Click Gotowe at (1220, 880)
  console.log('Clicking Gotowe at (1220, 880)...');
  await page.mouse.click(1220, 880);
  await page.waitForTimeout(6000);

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\cc_women_wizard_complete.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);

  // Print rows on manage page
  const rows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('ytcp-video-row, [role="row"]')).map(r => r.innerText.replace(/\s+/g, ' ').trim());
  });
  console.log('Rows now:\n', JSON.stringify(rows, null, 2));

  await ctx.close();
}

main().catch(console.error);
