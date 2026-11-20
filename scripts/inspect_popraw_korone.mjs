import { launchStudio } from './yt_studio_session.mjs';

async function checkPoprawKorone() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log(`\n========================================`);
    console.log(`Inspecting Popraw Koronę...`);
    await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const card = page.locator('ytd-account-item-renderer', { hasText: 'Popraw Koronę' }).first();
    await card.click();
    await page.waitForTimeout(4000);

    // Open avatar menu -> YouTube Studio
    await page.locator('button#avatar-btn').click();
    await page.waitForTimeout(1500);
    const studioLink = page.locator('ytd-compact-link-renderer:has-text("YouTube Studio")').first();
    await studioLink.click();
    await page.waitForTimeout(6000);

    console.log('Popraw Koronę Studio URL:', page.url());

    // Click "Utwórz" -> "Transmituj na żywo"
    const createBtn = page.locator('#create-icon, button:has-text("Utwórz"), ytcp-button:has-text("Utwórz")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(1500);
      const goLiveMenuItem = page.locator('tp-yt-paper-item:has-text("Transmituj na żywo")').first();
      await goLiveMenuItem.click();
      await page.waitForTimeout(6000);
    }

    // Click (x: 60, y: 100) to switch to "Transmisja" tab
    await page.mouse.click(60, 100);
    await page.waitForTimeout(5000);

    console.log('Popraw Koronę Livestream URL:', page.url());
    const ssPath = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/popraw_korone_stream_room.png';
    await page.screenshot({ path: ssPath });
    console.log('Screenshot saved to:', ssPath);

    const details = await page.evaluate(() => {
      const keyInput = document.querySelector('input[type="password"]');
      const statusBadge = document.querySelector('ytls-stream-status, .stream-status, #status')?.innerText.trim();
      const titleInput = document.querySelector('#title, input[aria-label*="Tytuł" i]');
      return {
        key: keyInput ? keyInput.value : '',
        status: statusBadge || '',
        title: titleInput ? (titleInput.value || titleInput.innerText) : ''
      };
    });
    console.log('Popraw Koronę details:', {
      ...details,
      keyMasked: details.key ? details.key.slice(0, 4) + '...' + details.key.slice(-4) : 'none'
    });

  } catch (err) {
    console.error('Error on Popraw Koronę:', err.message);
  } finally {
    await ctx.close();
  }
}

checkPoprawKorone();
