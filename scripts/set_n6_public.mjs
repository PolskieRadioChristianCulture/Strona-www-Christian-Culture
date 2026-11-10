import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/n6IfxzwXBXU/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Close "Edytowanie układu pionowego" modal if present
  console.log('Checking for Gotowe modal...');
  await page.mouse.click(598, 612);
  await page.waitForTimeout(1500);

  // Click on "Niepubliczny" badge/text directly in the metadata section
  console.log('Looking for Niepubliczny clickable element...');
  const privBadge = page.locator('text=Niepubliczny').first();
  if (await privBadge.isVisible().catch(() => false)) {
    console.log('Clicking Niepubliczny text...');
    await privBadge.click();
    await page.waitForTimeout(1500);
    const pubOption = page.locator('tp-yt-paper-radio-button:has-text("Publiczny"), tp-yt-paper-item:has-text("Publiczny")').first();
    if (await pubOption.isVisible().catch(() => false)) {
      console.log('Selecting Publiczny...');
      await pubOption.click();
      await page.waitForTimeout(1000);
      const saveBtn = page.locator('ytcp-button:has-text("Zapisz"), button:has-text("Zapisz"), #save-button').first();
      if (await saveBtn.isVisible().catch(() => false)) {
        console.log('Clicking Zapisz...');
        await saveBtn.click();
        await page.waitForTimeout(2000);
      }
    }
  }

  // Take screenshot
  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\n6IfxzwXBXU_privacy_check.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);

  // Now read the stream key
  const streamKey = await page.evaluate(() => {
    const input = document.querySelector('input[type="password"]');
    return input ? input.value : null;
  });
  console.log('Stream key found:', streamKey);

  await ctx.close();
}

main().catch(console.error);
