import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'CC Women', '/livestreaming/manage');
  await page.waitForTimeout(5000);

  console.log('Current URL:', page.url());
  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\cc_women_manage_now.png';
  await page.screenshot({ path: shotPath });

  // Open the scheduled stream row
  const row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
  if (await row.isVisible().catch(() => false)) {
    console.log('Clicking row to open room...');
    await row.click();
    await page.waitForTimeout(5000);
  }

  // Dismiss any "Gotowe" modal for vertical layout
  await page.mouse.click(598, 612);
  await page.waitForTimeout(1000);

  // Read stream key
  const streamKey = await page.evaluate(() => {
    const input = document.querySelector('input[type="password"]');
    return input ? input.value : null;
  });
  console.log('Stream key for CC Women is:', streamKey);

  // Read room toggles
  const toggles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('tp-yt-paper-toggle-button')).map(t => ({
      text: t.innerText.trim(),
      checked: t.getAttribute('aria-checked') === 'true' || t.hasAttribute('checked')
    }));
  });
  console.log('Toggles:\n', JSON.stringify(toggles, null, 2));

  // Enable Auto-start and Auto-stop
  for (const t of await page.locator('tp-yt-paper-toggle-button').all()) {
    const txt = (await t.innerText()).trim();
    const isChecked = await t.evaluate(el => el.getAttribute('aria-checked') === 'true' || el.hasAttribute('checked'));
    if ((txt.includes('automatyczne uruchamianie') || txt.includes('automatyczne zatrzymywanie')) && !isChecked) {
      console.log(`Enabling ${txt}...`);
      await t.click();
      await page.waitForTimeout(1000);
    }
  }

  await ctx.close();
}

main().catch(console.error);
