import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

  try {
    await openChannelStudio(page, 'Osobowość +', '/livestreaming/manage');
    await page.waitForTimeout(3000);
    await page.goto('https://studio.youtube.com/video/Al56YdVI40c/livestreaming', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);

    const trigger = page.locator('ytls-ingestion-dropdown-trigger-renderer, [id="prefix"]:has-text("Klucz:")').first();
    console.log('Trigger visible:', await trigger.isVisible().catch(() => false));

    await trigger.click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${artDir}/dropdown_clicked.png` });

    // Look for options in popup / dialog
    const options = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('paper-item, ytcp-ve, [role="option"], ytls-ingestion-item-renderer, ytls-dropdown-item-renderer'));
      return items.map(el => ({ tag: el.tagName, text: el.innerText?.trim() })).filter(x => x.text);
    });
    console.log('Found options:', options);

    // If options found, click the default / first key
    const defaultOption = page.locator('paper-item, [role="option"], ytcp-ve').filter({ hasText: /Domyślny|Default|RTMP|klucz/i }).first();
    if (await defaultOption.isVisible().catch(() => false)) {
      console.log('Clicking option:', await defaultOption.innerText());
      await defaultOption.click();
      await page.waitForTimeout(4000);
      await page.screenshot({ path: `${artDir}/after_key_selected.png` });
    }

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
