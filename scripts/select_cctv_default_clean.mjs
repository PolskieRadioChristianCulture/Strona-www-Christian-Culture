import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

  try {
    await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/manage');
    await page.waitForTimeout(3000);
    await page.goto('https://studio.youtube.com/video/OGmZpYMGve4/livestreaming', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);

    const trigger = page.locator('ytls-ingestion-dropdown-trigger-renderer, [id="prefix"]:has-text("Klucz:"), span:has-text("Klucz:")').first();
    console.log('Clicking trigger...');
    await trigger.click({ force: true });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${artDir}/cctv_dropdown_test.png` });

    const items = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*'));
      return all
        .filter(el => el.children.length === 0 && (el.innerText?.includes('Default stream key') || el.innerText?.includes('Domyślny')))
        .map(el => ({ tag: el.tagName, text: el.innerText, class: el.className }));
    });
    console.log('Matched items for Default stream key:', items);

    const defaultEl = page.locator('text=Default stream key').first();
    console.log('defaultEl visible:', await defaultEl.isVisible().catch(() => false));
    if (await defaultEl.isVisible()) {
      await defaultEl.click();
      console.log('Clicked text=Default stream key!');
      await page.waitForTimeout(6000);
      await page.screenshot({ path: `${artDir}/cctv_after_default_click.png` });

      const text = await page.evaluate(() => document.body.innerText);
      const isGood = text.includes('Doskonały') || text.includes('Dobra jakość');
      console.log('Stream quality is good?', isGood);

      const btn = page.locator('button, ytcp-button').filter({ hasText: /^Transmituj na żywo$/ }).first();
      console.log('Btn enabled?', await btn.isEnabled().catch(() => false));
      if (await btn.isEnabled().catch(() => false)) {
        await btn.click();
        console.log('CLICKED TRANSMITUJ NA ZYWO!');
        await page.waitForTimeout(4000);
      }
    }

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
