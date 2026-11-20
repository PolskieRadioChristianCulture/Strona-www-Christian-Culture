import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, 'Robert Łukasz Pio', '/livestreaming/manage');
    await page.waitForTimeout(3000);

    console.log('Navigating to live room: https://studio.youtube.com/video/z33rEkjNciY/livestreaming');
    await page.goto('https://studio.youtube.com/video/z33rEkjNciY/livestreaming', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);

    const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
    await page.screenshot({ path: `${artDir}/robert_live_room_stream_check.png` });

    // Check toggles (Auto-start, Auto-stop)
    const toggles = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('tp-yt-paper-toggle-button, ytcp-paper-toggle-button, ytcp-toggle, [role="switch"]'));
      return items.map(i => ({
        id: i.id,
        text: i.closest('div')?.innerText?.slice(0, 80) || i.parentElement?.innerText?.slice(0, 80),
        checked: i.getAttribute('aria-checked') || i.hasAttribute('checked')
      }));
    });
    console.log('Toggles in live room:', JSON.stringify(toggles, null, 2));

    const endBtn = await page.locator('button:has-text("Zakończ transmisję"), ytcp-button:has-text("Zakończ transmisję")').isVisible().catch(() => false);
    console.log('Is "Zakończ transmisję" visible?', endBtn);

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await ctx.close();
  }
}

main();
