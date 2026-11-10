import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

export async function setupScheduledStream(channelName, streamTitle) {
  const { ctx, page } = await launchStudio({ headless: true });
  console.log(`\n========================================`);
  console.log(`Setting up stream for: ${channelName}`);

  const channelId = await openChannelStudio(page, channelName, '/livestreaming/manage');
  await page.waitForTimeout(5000);

  // Check if a scheduled broadcast already exists
  const existingRows = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('ytcp-video-row, ytls-broadcast-row, [role="row"]'));
    return rows.map(r => r.innerText.replace(/\s+/g, ' ').trim()).filter(t => t.includes('Zaplanowana') || t.includes('Wkrótce'));
  });
  console.log('Existing scheduled rows:', existingRows);

  let streamKey = null;

  if (existingRows.length === 0) {
    console.log('No scheduled stream found, clicking "Zaplanuj transmisję"...');
    const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję"), #schedule-stream-button').first();
    await schedBtn.click();
    await page.waitForTimeout(3000);

    // Check for "Planowanie z wykorzystaniem wcześniejszych ustawień" modal
    const createNewBtn = page.locator('button:has-text("Utwórz nowe"), ytcp-button:has-text("Utwórz nowe")').first();
    if (await createNewBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('Clicking "Utwórz nowe"...');
      await createNewBtn.click();
      await page.waitForTimeout(2500);
    }

    // Step 1: Details
    console.log('Filling title:', streamTitle);
    const titleInput = page.locator('#textbox, input[name="title"], textarea').first();
    if (await titleInput.isVisible().catch(() => false)) {
      await titleInput.fill(streamTitle);
    }

    // Select Not made for kids
    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
    if (await notForKids.isVisible().catch(() => false)) {
      await notForKids.click();
    }
    await page.waitForTimeout(1000);

    // Loop through wizard steps clicking Next
    for (let step = 1; step <= 3; step++) {
      console.log(`Advancing wizard step ${step}...`);
      const nextBtn = page.locator('#next-button, button:has-text("Dalej"), ytcp-button:has-text("Dalej")').first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2500);
      }
    }

    // Step 4: Visibility
    console.log('Selecting Publiczny visibility in wizard...');
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await pubRadio.isVisible().catch(() => false)) {
      await pubRadio.click();
      await page.waitForTimeout(1000);
    }

    // Click Gotowe / Zapisz
    console.log('Finishing wizard...');
    const doneBtn = page.locator('#done-button, button:has-text("Gotowe"), ytcp-button:has-text("Gotowe"), button:has-text("Zapisz")').first();
    if (await doneBtn.isVisible().catch(() => false)) {
      await doneBtn.click();
      await page.waitForTimeout(6000);
    }
  }

  // If on manage page, open the scheduled broadcast room
  if (page.url().includes('/manage')) {
    console.log('Opening scheduled stream room from manage page...');
    const rowTitle = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    await rowTitle.click();
    await page.waitForTimeout(6000);
  }

  console.log('Current live room URL:', page.url());

  // Dismiss any "Gotowe" modal for vertical layout
  await page.mouse.click(598, 612);
  await page.waitForTimeout(1500);

  // Turn ON Auto-start and Auto-stop
  const toggles = page.locator('tp-yt-paper-toggle-button');
  const count = await toggles.count();
  console.log(`Found ${count} toggles in room`);
  for (let i = 0; i < count; i++) {
    const t = toggles.nth(i);
    const txt = (await t.innerText()).trim();
    const isChecked = await t.evaluate(el => el.getAttribute('aria-checked') === 'true' || el.hasAttribute('checked'));
    if ((txt.includes('automatyczne uruchamianie') || txt.includes('automatyczne zatrzymywanie')) && !isChecked) {
      console.log(`Enabling ${txt}...`);
      await t.click();
      await page.waitForTimeout(1000);
    }
    if (txt.includes('Podwójna transmisja') && isChecked) {
      console.log('Disabling Podwójna transmisja...');
      await t.click();
      await page.waitForTimeout(1000);
      const conf = page.locator('button:has-text("Wyłącz"), button:has-text("Potwierdź")').first();
      if (await conf.isVisible().catch(() => false)) await conf.click();
    }
  }

  // Read the stream key
  streamKey = await page.evaluate(() => {
    const input = document.querySelector('input[type="password"]');
    return input ? input.value : null;
  });
  console.log(`Stream key for ${channelName}:`, streamKey);

  const shotPath = `C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\setup_${channelName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
  await page.screenshot({ path: shotPath });
  console.log('Screenshot saved to:', shotPath);

  await ctx.close();
  return streamKey;
}
