import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, 'Biblia Audio Christian Culture', '/livestreaming/manage');
    await page.waitForTimeout(4000);

    // Enter room
    const row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    await row.click();
    await page.waitForTimeout(6000);

    // Dismiss modal
    await page.mouse.click(598, 612).catch(() => {});
    await page.waitForTimeout(1000);

    // Click copy button
    console.log('Clicking copy button...');
    const copyBtn = page.locator('button:has-text("Kopiuj"), #copy-button, ytcp-button:has-text("Kopiuj")').first();
    await copyBtn.click();
    await page.waitForTimeout(1000);

    // Read clipboard
    const clip = await page.evaluate(async () => {
      try {
        return await navigator.clipboard.readText();
      } catch (e) {
        return 'clipboard-error: ' + e.message;
      }
    });
    console.log('Clipboard content:', clip);

    // Click unmask (eye icon)
    const eyeBtn = page.locator('#toggle-key-button, button[aria-label*="klucz"], [aria-label*="Wyświetl"]').first();
    if (await eyeBtn.isVisible().catch(() => false)) {
      console.log('Clicking eye button...');
      await eyeBtn.click();
      await page.waitForTimeout(1000);
    }

    const keyVal = await page.evaluate(() => {
      const inp = document.querySelector('input[type="text"], input[type="password"]');
      return inp ? inp.value : null;
    });
    console.log('Input value after eye:', keyVal);

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
