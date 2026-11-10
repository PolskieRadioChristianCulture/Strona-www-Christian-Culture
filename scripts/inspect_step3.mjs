import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'CC Women', '/livestreaming/manage');
  await page.waitForTimeout(5000);

  // If dialog is not open, open it
  const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), #schedule-stream-button').first();
  if (await schedBtn.isVisible().catch(() => false)) {
    await schedBtn.click();
    await page.waitForTimeout(2000);
    const reuseBtn = page.locator('button:has-text("Użyj poprzednich ustawień")').first();
    if (await reuseBtn.isVisible().catch(() => false)) {
      await reuseBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  // Click Dalej step 1
  await page.locator('button:has-text("Dalej")').first().click();
  await page.waitForTimeout(1500);

  // Click Dalej step 2
  await page.locator('button:has-text("Dalej")').first().click();
  await page.waitForTimeout(1500);

  // Screenshot step 3
  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\cc_women_step3.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved step 3 screenshot:', shotPath);

  // Print all buttons in step 3
  const btns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('ytcp-dialog button, ytcp-dialog ytcp-button')).map(b => ({
      text: b.innerText.trim(),
      id: b.id,
      classes: b.className,
      disabled: b.disabled || b.getAttribute('aria-disabled')
    }));
  });
  console.log('Step 3 buttons:', JSON.stringify(btns, null, 2));

  await ctx.close();
}

main().catch(console.error);
