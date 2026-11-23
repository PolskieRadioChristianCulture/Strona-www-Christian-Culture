import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  console.log('Launching Studio for Christian Culture TV...');
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/manage');
  await page.waitForTimeout(3000);

  console.log('Navigating to room KdOBA_zRU0c...');
  await page.goto('https://studio.youtube.com/video/KdOBA_zRU0c/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  // 1. Dismiss "Edytowanie układu pionowego" modal by clicking "Gotowe"
  console.log('Looking for "Gotowe" modal button...');
  const gotoweBtn = page.locator('ytcp-button:has-text("Gotowe"), button:has-text("Gotowe"), #confirm-button:has-text("Gotowe")').first();
  if (await gotoweBtn.isVisible().catch(() => false)) {
    console.log('Clicking "Gotowe" modal button...');
    await gotoweBtn.click();
    await page.waitForTimeout(2000);
  } else {
    console.log('Clicking at (598, 612) directly...');
    await page.mouse.click(598, 612);
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/modal_dismissed.png' });

  // 2. Check signal status
  const bodyText = await page.evaluate(() => document.body.innerText);
  const isExcellent = bodyText.includes('Doskonały') || bodyText.includes('Doskonałe');
  console.log('Signal is excellent:', isExcellent);

  // 3. Find and click "Transmituj na żywo" button
  console.log('Checking "Transmituj na żywo" button...');
  const startBtn = page.locator('#start-stream-button, ytls-header ytcp-button:has-text("Transmituj na żywo"), button:has-text("Transmituj na żywo")').first();
  const isEnabled = await startBtn.isEnabled().catch(() => false);
  const isVisible = await startBtn.isVisible().catch(() => false);
  console.log(`Start button: isVisible=${isVisible}, isEnabled=${isEnabled}`);

  if (isEnabled) {
    console.log('>>> CLICKING "Transmituj na żywo" <<<');
    await startBtn.click();
    await page.waitForTimeout(2500);

    const confBtn = page.locator('button:has-text("Rozpocznij"), #confirm-button, ytcp-button:has-text("Rozpocznij")').first();
    if (await confBtn.isVisible().catch(() => false)) {
      console.log('Confirming broadcast start...');
      await confBtn.click();
      await page.waitForTimeout(4000);
    }
  }

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/golive_after_dismiss.png' });

  // 4. Verify in Studio if it is now transmitting
  const afterText = await page.evaluate(() => document.body.innerText);
  console.log('Contains "Zakończ transmisję":', afterText.includes('Zakończ transmisję'));
  console.log('Contains "TRANSMITUJESZ NA ŻYWO":', afterText.includes('TRANSMITUJESZ') || afterText.includes('na żywo'));

  await ctx.close();

  // 5. Public verification
  console.log('\n[Public Verification] Checking https://www.youtube.com/watch?v=KdOBA_zRU0c...');
  const res = await fetch('https://www.youtube.com/watch?v=KdOBA_zRU0c', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const html = await res.text();
  const playability = html.match(/"playabilityStatus":\{"status":"([^"]+)"/)?.[1];
  const isLiveNow = html.includes('"isLiveNow":true') || html.includes('"isLive":true');
  console.log(`PUBLIC RESULT: playabilityStatus=${playability}, isLiveNow=${isLiveNow}`);
}

main().catch(console.error);
