import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/KYSla9a5bjQ/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const gotoweBtn = page.locator('button:has-text("Gotowe")').first();
  if (await gotoweBtn.isVisible().catch(() => false)) await gotoweBtn.click();

  const items = await page.evaluate(() => {
    const list = Array.from(document.querySelectorAll('ytcp-form-toggle, tp-yt-paper-toggle-button, ytcp-button, button'));
    return list.map(el => ({
      tag: el.tagName,
      id: el.id,
      text: (el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' '),
      checked: el.getAttribute('aria-checked') || el.hasAttribute('checked'),
      disabled: el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true'
    })).filter(x => x.text.length > 0 || x.id.length > 0);
  });
  console.log(JSON.stringify(items, null, 2));

  // Also check if there's any Go Live button
  const goLive = page.locator('#start-stream-button, button:has-text("Transmituj na żywo"), button:has-text("Go live")');
  console.log('Go Live button count:', await goLive.count());
  if (await goLive.count() > 0) {
    console.log('Go Live text:', await goLive.first().innerText());
    console.log('Go Live visible:', await goLive.first().isVisible());
    console.log('Go Live disabled:', await goLive.first().getAttribute('aria-disabled'));
  }

  await ctx.close();
}

main().catch(console.error);
