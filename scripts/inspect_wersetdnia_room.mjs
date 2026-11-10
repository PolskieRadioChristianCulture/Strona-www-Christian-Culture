import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

const CHANNEL_NAME = 'Werset Dnia - Chrześcijański Serwis Biblijny';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, CHANNEL_NAME, '/livestreaming/manage');
    await page.waitForTimeout(4000);

    const rows = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('ytcp-video-row, [role="row"]')).map(r => r.innerText.replace(/\s+/g, ' ').trim());
    });
    console.log('Werset Dnia Manage Rows:', rows);

    // Enter room
    const link = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    if (await link.isVisible().catch(() => false)) {
      await link.click();
      await page.waitForTimeout(5000);
    }

    // Dismiss layout prompt
    await page.mouse.click(598, 612).catch(() => {});
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\wersetdnia_room_inspect.png' });

    const status = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, ytcp-button, tp-yt-paper-button')).map(b => ({
        text: b.innerText.trim(),
        disabled: b.disabled || b.getAttribute('aria-disabled') === 'true',
        id: b.id
      })).filter(b => b.text.length > 0 && b.text.length < 50);

      const badges = Array.from(document.querySelectorAll('.badge, [class*="status"], [class*="state"], [class*="health"]')).map(el => el.innerText.trim()).filter(Boolean);

      return { btns, badges, url: window.location.href };
    });

    console.log('Werset Dnia Room Status:', JSON.stringify(status, null, 2));

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
