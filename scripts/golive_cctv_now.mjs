import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  console.log('--- STARTING GO LIVE FOR CHRISTIAN CULTURE TV (KdOBA_zRU0c) ---');
  const { ctx, page } = await launchStudio({ headless: true });
  
  try {
    // 1. Switch identity to Christian Culture TV
    await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/manage');
    await page.waitForTimeout(3000);

    // 2. Direct navigation to live room
    console.log('Navigating directly to https://studio.youtube.com/video/KdOBA_zRU0c/livestreaming ...');
    await page.goto('https://studio.youtube.com/video/KdOBA_zRU0c/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);

    // 3. Dismiss dialog if present (vertical crop modal)
    console.log('Checking for modals / Gotowe button...');
    const gotowe = page.locator('button:has-text("Gotowe"), ytcp-button:has-text("Gotowe")').first();
    if (await gotowe.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Dismissing modal Gotowe...');
      await gotowe.click();
      await page.waitForTimeout(2000);
    }

    // Also click coordinates (598, 612) if gotowe is in shadow dom
    try {
      const modalHeader = page.locator('h1:has-text("Edytowanie układu pionowego")').first();
      if (await modalHeader.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log('Edytowanie układu pionowego visible, clicking (598, 612)...');
        await page.mouse.click(598, 612);
        await page.waitForTimeout(2000);
      }
    } catch {}

    // 4. Check stream health and preview status
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const health = (bodyText.match(/\n(Doskonały|Dobry|Dobra|Słaby|Słaba|Brak danych|Brak sygnału|Oczekiwanie)[^\n]*/) || [])[1] || 'nieznany';
    console.log('Stream health in room:', health);

    // 5. Check Go Live button
    const goLiveBtn = page.locator('#start-stream-button, ytcp-button:has-text("Transmituj na żywo"), button:has-text("Transmituj na żywo")').first();
    const isVisible = await goLiveBtn.isVisible({ timeout: 3000 }).catch(() => false);
    const isEnabled = isVisible ? await goLiveBtn.isEnabled().catch(() => false) : false;
    console.log('Go Live button - visible:', isVisible, 'enabled:', isEnabled);

    if (isVisible && isEnabled) {
      console.log('>>> CLICKING "Transmituj na żywo" <<<');
      await goLiveBtn.click({ force: true });
      await page.waitForTimeout(2500);

      const confirmBtn = page.locator('#confirm-button, button:has-text("Rozpocznij"), ytcp-button:has-text("Rozpocznij")').first();
      if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('>>> CONFIRMING BROADCAST (Rozpocznij) <<<');
        await confirmBtn.click({ force: true });
        await page.waitForTimeout(8000);
      }
    }

    // 6. Check end stream button
    const endBtn = page.locator('#end-stream-button, ytcp-button:has-text("Zakończ transmisję"), button:has-text("Zakończ transmisję")').first();
    const isEndVisible = await endBtn.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('End Stream button visible (WE ARE LIVE!):', isEndVisible);

    await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/cctv_live_after_golive.png' });
    console.log('Screenshot saved.');
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
