import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, 'Robert Łukasz Pio', '/livestreaming/manage');
    await page.waitForTimeout(3000);
    await page.goto('https://studio.youtube.com/video/z33rEkjNciY/livestreaming', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

    // Find all elements containing "Transmituj na żywo"
    const btn = page.locator('button, ytcp-button').filter({ hasText: /^Transmituj na żywo$/ }).first();
    console.log('Is button visible?', await btn.isVisible().catch(() => false));
    console.log('Is button enabled?', await btn.isEnabled().catch(() => false));

    await btn.click();
    console.log('Clicked Transmituj na żywo!');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: `${artDir}/robert_after_click.png` });

    // Check if dialog appeared
    const dialogBtn = page.locator('ytcp-button, button').filter({ hasText: /Transmituj na żywo|Rozpocznij/ }).last();
    if (await dialogBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Confirming in dialog...');
      await dialogBtn.click();
      await page.waitForTimeout(3000);
    }

    await page.screenshot({ path: `${artDir}/robert_after_confirm.png` });

    // Check if end stream button is now visible
    const endBtn = page.locator('button, ytcp-button').filter({ hasText: /Zakończ transmisję/ }).first();
    console.log('Is Zakończ transmisję visible?', await endBtn.isVisible({ timeout: 4000 }).catch(() => false));

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
