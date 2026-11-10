import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'CC Women', '/livestreaming/manage');
  await page.waitForTimeout(4000);

  const schedBtn = page.locator('button:has-text("Zaplanuj transmisję")').first();
  if (await schedBtn.isVisible().catch(() => false)) await schedBtn.click();
  await page.waitForTimeout(2000);
  const reuseBtn = page.locator('button:has-text("Użyj poprzednich ustawień")').first();
  if (await reuseBtn.isVisible().catch(() => false)) await reuseBtn.click();
  await page.waitForTimeout(2000);

  const btns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, ytcp-button')).filter(b => b.innerText && b.innerText.includes('Dalej')).map(b => {
      const rect = b.getBoundingClientRect();
      return { tag: b.tagName, id: b.id, text: b.innerText.trim(), x: rect.x, y: rect.y, w: rect.width, h: rect.height };
    });
  });
  console.log('DALEJ BUTTONS:', JSON.stringify(btns, null, 2));

  await ctx.close();
}

main().catch(console.error);
