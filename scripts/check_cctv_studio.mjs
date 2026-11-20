import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

  try {
    await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/manage');
    await page.waitForTimeout(3000);
    await page.goto('https://studio.youtube.com/video/OGmZpYMGve4/livestreaming', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${artDir}/cctv_studio_now.png` });

    const keyTrigger = await page.locator('ytls-ingestion-dropdown-trigger-renderer, [id="prefix"]:has-text("Klucz:")').first().innerText().catch(() => '');
    console.log('CCTV key trigger text:', keyTrigger);

    const btn = page.locator('button, ytcp-button').filter({ hasText: /^Transmituj na żywo$/ }).first();
    console.log('Btn visible:', await btn.isVisible().catch(() => false));
    console.log('Btn enabled:', await btn.isEnabled().catch(() => false));
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
