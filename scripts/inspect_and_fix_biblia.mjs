import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

const CHANNEL_NAME = 'Biblia Audio Christian Culture';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log(`Opening ${CHANNEL_NAME} manage...`);
    await openChannelStudio(page, CHANNEL_NAME, '/livestreaming/manage');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\biblia_manage_now.png' });

    const rows = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('ytcp-video-row, [role="row"]')).map(r => ({
        text: r.innerText.replace(/\s+/g, ' ').trim(),
      }));
    });
    console.log('Rows found:', JSON.stringify(rows, null, 2));

    // Kliknij pierwszy wiersz
    const link = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    if (await link.isVisible().catch(() => false)) {
      console.log('Clicking link to enter room...');
      await link.click();
    } else {
      console.log('Clicking via coordinate 300, 350');
      await page.mouse.click(300, 350);
    }
    await page.waitForTimeout(6000);

    // Dismiss any dialog if present
    await page.mouse.click(598, 612).catch(() => {});
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\biblia_room_now.png' });

    // Inspect buttons and status
    const status = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, ytcp-button, tp-yt-paper-button')).map(b => ({
        text: b.innerText.trim(),
        disabled: b.disabled || b.getAttribute('aria-disabled') === 'true',
        id: b.id,
        cls: b.className
      })).filter(b => b.text.length > 0 && b.text.length < 50);

      const badges = Array.from(document.querySelectorAll('.badge, [class*="status"], [class*="state"], [class*="health"]')).map(el => el.innerText.trim()).filter(Boolean);

      return { btns, badges, url: window.location.href };
    });

    console.log('Studio Room Status:', JSON.stringify(status, null, 2));

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
