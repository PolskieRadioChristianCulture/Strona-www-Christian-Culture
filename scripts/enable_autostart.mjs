import { launchStudio } from './yt_studio_session.mjs';

async function enableAutoStart(channelName) {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log(`\n========================================`);
    console.log(`Enabling Auto-Start on: "${channelName}"`);
    await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const card = page.locator('ytd-account-item-renderer', { hasText: channelName }).first();
    await card.click();
    await page.waitForTimeout(4000);

    // Open avatar -> YouTube Studio
    await page.locator('button#avatar-btn').click();
    await page.waitForTimeout(1500);
    const studioLink = page.locator('ytd-compact-link-renderer:has-text("YouTube Studio")').first();
    await studioLink.click();
    await page.waitForTimeout(6000);

    // Click "Utwórz" -> "Transmituj na żywo"
    const createBtn = page.locator('#create-icon, button:has-text("Utwórz"), ytcp-button:has-text("Utwórz")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(1500);
      const goLiveMenuItem = page.locator('tp-yt-paper-item:has-text("Transmituj na żywo")').first();
      await goLiveMenuItem.click();
      await page.waitForTimeout(6000);
    }

    // Click (60, 100) to ensure we are on "Transmisja"
    await page.mouse.click(60, 100);
    await page.waitForTimeout(5000);

    console.log('On stream page URL:', page.url());

    // Look for autostart toggle: "Włącz automatyczne uruchamianie"
    const autostartToggle = page.locator('tp-yt-paper-toggle-button[aria-label*="automatyczne" i], tp-yt-paper-toggle-button[aria-label*="autostart" i], tp-yt-paper-toggle-button:has-text("automatyczne")').first();
    if (await autostartToggle.isVisible()) {
      const isChecked = await autostartToggle.getAttribute('aria-checked');
      console.log('Autostart is checked:', isChecked);
      if (isChecked !== 'true') {
        console.log('Toggling autostart ON...');
        await autostartToggle.click();
        await page.waitForTimeout(2000);
      }
    } else {
      console.log('Autostart toggle not directly visible via selector, searching paper-toggle-button...');
      const toggles = page.locator('tp-yt-paper-toggle-button');
      const count = await toggles.count();
      for (let i = 0; i < count; i++) {
        const t = toggles.nth(i);
        const parentText = await t.evaluate(el => el.parentElement?.innerText || '');
        console.log(`Toggle [${i}] parent text:`, parentText.replace(/\s+/g, ' '));
        if (parentText.includes('automatyczne') || parentText.includes('autostart')) {
          const chk = await t.getAttribute('aria-checked');
          if (chk !== 'true') {
            await t.click();
            console.log('Clicked toggle to enable!');
            await page.waitForTimeout(2000);
          }
        }
      }
    }

    // Check if blue "Rozpocznij transmisję" button exists and is clickable
    const goLiveBtn = page.locator('#go-live-button, button:has-text("Rozpocznij transmisję")').first();
    if (await goLiveBtn.isVisible()) {
      const isDisabled = await goLiveBtn.getAttribute('aria-disabled') === 'true' || await goLiveBtn.hasAttribute('disabled');
      console.log('Go Live button visible, disabled:', isDisabled);
      if (!isDisabled) {
        console.log('Clicking "Rozpocznij transmisję"...');
        await goLiveBtn.click();
        await page.waitForTimeout(4000);
      }
    }

    await page.screenshot({ path: `C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/autostart_${channelName.slice(0, 8)}.png` });

  } catch (err) {
    console.error(`Error on ${channelName}:`, err.message);
  } finally {
    await ctx.close();
  }
}

async function main() {
  await enableAutoStart('Top Seven');
  await enableAutoStart('Worship LIVE CC');
}
main();
