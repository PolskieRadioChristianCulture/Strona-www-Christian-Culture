import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

  try {
    await openChannelStudio(page, 'Osobowość +', '/livestreaming/manage');
    await page.waitForTimeout(3000);
    await page.goto('https://studio.youtube.com/video/Al56YdVI40c/livestreaming', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);

    const btn = page.locator('button, ytcp-button').filter({ hasText: /^Transmituj na żywo$/ }).first();
    console.log('Button visible:', await btn.isVisible());
    console.log('Button enabled:', await btn.isEnabled());

    await btn.click({ force: true });
    console.log('Clicked Transmituj na żywo!');
    await page.waitForTimeout(3000);

    // Dialog confirmation if present
    const dialogBtn = page.locator('ytcp-button, button').filter({ hasText: /Transmituj na żywo|Rozpocznij/ }).last();
    if (await dialogBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('Confirming in dialog...');
      await dialogBtn.click();
      await page.waitForTimeout(3000);
    }

    await page.screenshot({ path: `${artDir}/osobowosc_live_confirmed.png` });

    // Wait 5 seconds and check end button
    await page.waitForTimeout(5000);
    const endBtn = page.locator('button, ytcp-button').filter({ hasText: /Zakończ transmisję/ }).first();
    console.log('Is Zakończ visible?', await endBtn.isVisible({ timeout: 4000 }).catch(() => false));

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
