import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/manage');
  await page.waitForTimeout(5000);

  // Get video link from row
  const rowLink = await page.locator('ytcp-video-row a#video-title, [role="row"] a').first().getAttribute('href');
  console.log('Row link:', rowLink);

  // Click on the row to open the live room
  await page.locator('text=Christian Culture TV LIVE').first().click();
  await page.waitForTimeout(6000);

  const roomUrl = page.url();
  console.log('Opened Live room URL:', roomUrl);

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\cctv_room_inspect.png';
  await page.screenshot({ path: shotPath });
  console.log('Screenshot saved to:', shotPath);

  // Check stream key input
  const streamKey = await page.evaluate(() => {
    const input = document.querySelector('input[type="password"]');
    return input ? input.value : null;
  });
  console.log('CCTV Stream key in room:', streamKey);

  // Check auto-start toggle state
  const toggles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('tp-yt-paper-toggle-button')).map(t => ({
      text: t.innerText.trim(),
      checked: t.getAttribute('aria-checked') || t.hasAttribute('checked')
    }));
  });
  console.log('Toggles:', JSON.stringify(toggles, null, 2));

  await ctx.close();
}

main().catch(console.error);
