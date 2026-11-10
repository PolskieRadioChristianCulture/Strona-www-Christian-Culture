import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  console.log('Switching to Osobowość + identity...');
  await openChannelStudio(page, 'Osobowość +', '/livestreaming/manage');
  await page.waitForTimeout(4000);

  // Click "Zaplanuj transmisję"
  console.log('Clicking Zaplanuj transmisję...');
  const scheduleBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję")').first();
  await scheduleBtn.click();
  await page.waitForTimeout(2500);

  // Check if reuse dialog appears
  const reuseBtn = page.locator('button:has-text("Użyj poprzednich ustawień")').first();
  const createNewBtn = page.locator('button:has-text("Utwórz nowe")').first();
  if (await reuseBtn.isVisible().catch(() => false)) {
    console.log('Clicking Użyj poprzednich ustawień...');
    await reuseBtn.click();
  } else if (await createNewBtn.isVisible().catch(() => false)) {
    console.log('Clicking Utwórz nowe...');
    await createNewBtn.click();
  }
  await page.waitForTimeout(3000);

  // Step 1: Title
  const titleBox = page.locator('#textbox[contenteditable="true"]').first();
  if (await titleBox.isVisible().catch(() => false)) {
    await titleBox.fill('Osobowość + LIVE 🔴 | Christian Culture TV24');
    console.log('Title set.');
  }

  // Not for kids
  const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notForKids.isVisible().catch(() => false)) {
    await notForKids.click();
    console.log('Audience set to not for kids.');
  }
  await page.waitForTimeout(1000);

  // Advance steps
  for (let s = 1; s <= 3; s++) {
    console.log(`Advancing wizard step ${s}...`);
    const nextBtn = page.locator('#next-button button, ytcp-button#next-button, button:has-text("Dalej")').last();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  // Step 4: Visibility -> Publiczny
  console.log('Setting visibility to Publiczny...');
  const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
  if (await publicRadio.isVisible().catch(() => false)) {
    await publicRadio.click();
    await page.waitForTimeout(1000);
  }

  // Done button
  console.log('Clicking Gotowe / Zapisz...');
  const doneBtn = page.locator('#done-button button, ytcp-button#done-button, button:has-text("Gotowe"), button:has-text("Zapisz")').last();
  await doneBtn.click();
  await page.waitForTimeout(5000);

  console.log('URL after creating stream:', page.url());
  const newStreamUrl = page.url();

  // Now enable Auto-start and Auto-stop!
  console.log('Enabling Auto-start and Auto-stop...');
  const switched = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('tp-yt-paper-toggle-button, ytcp-paper-toggle-button, ytcp-toggle'));
    const res = [];
    for (const item of items) {
      const text = item.closest('div')?.innerText || item.parentElement?.innerText || '';
      if (/automatyczne uruchamianie/i.test(text)) {
        if (!item.hasAttribute('checked') && item.getAttribute('aria-checked') !== 'true') {
          item.click();
          res.push('Auto-start turned ON');
        }
      }
      if (/automatyczne zatrzymywanie/i.test(text)) {
        if (!item.hasAttribute('checked') && item.getAttribute('aria-checked') !== 'true') {
          item.click();
          res.push('Auto-stop turned ON');
        }
      }
      // If layout switch is on, turn it off!
      if (item.id === 'layout-switch') {
        if (item.hasAttribute('checked') || item.getAttribute('aria-checked') === 'true') {
          item.click();
          res.push('Layout switch turned OFF');
        }
      }
    }
    return res;
  });
  console.log('Toggles result:', switched);

  await page.waitForTimeout(2000);

  // Check if confirmation modal appeared (e.g. for autostop or layout)
  const confirmBtn = page.locator('ytcp-confirmation-dialog #confirm-button, button:has-text("Włącz"), button:has-text("Wyłącz")').first();
  if (await confirmBtn.isVisible().catch(() => false)) {
    console.log('Confirming modal action...');
    await confirmBtn.click();
    await page.waitForTimeout(2000);
  }

  // Wait 10 seconds for stream to ingest and auto-start
  console.log('Waiting 10s for stream auto-start...');
  await page.waitForTimeout(10000);

  const shot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\osobowosc_scheduled_result.png';
  await page.screenshot({ path: shot, fullPage: true });
  console.log('Screenshot saved to:', shot);

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
