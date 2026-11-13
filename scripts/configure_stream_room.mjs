import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/suYDIRikPjQ/livestreaming', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  // 1. Click "Edytuj" button to change visibility to Publiczny
  console.log('Looking for Edytuj button...');
  const editBtn = page.locator('button:has-text("Edytuj"), ytcp-button:has-text("Edytuj")').first();
  if (await editBtn.isVisible().catch(() => false)) {
    console.log('Clicking Edytuj...');
    await editBtn.click();
    await page.waitForTimeout(3000);

    // Look for visibility or scroll down dialog
    const publicOption = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await publicOption.isVisible().catch(() => false)) {
      console.log('Setting visibility to Publiczny...');
      await publicOption.click();
      await page.waitForTimeout(1000);
    } else {
      console.log('Public radio not immediately visible, inspecting dialog options...');
      const dialogText = await page.evaluate(() => {
        const d = document.querySelector('ytcp-dialog, ytcp-live-edit-dialog, [role="dialog"]');
        return d ? d.innerText : 'no dialog';
      });
      console.log('Dialog text:', dialogText.slice(0, 300));
    }

    const saveBtn = page.locator('ytcp-button#save-button, button:has-text("Zapisz")').last();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      console.log('Saved edit dialog.');
      await page.waitForTimeout(3000);
    }
  }

  // 2. Scroll settings card on the left to see auto-start toggles
  console.log('Looking for auto-start toggle...');
  const toggles = await page.evaluate(() => {
    // Find all toggles and their surrounding labels
    const tList = Array.from(document.querySelectorAll('tp-yt-paper-toggle-button, ytcp-paper-toggle-button, ytcp-toggle, paper-toggle-button'));
    return tList.map(t => {
      const parent = t.closest('.toggle-container') || t.parentElement?.parentElement || t.parentElement;
      return {
        id: t.id,
        ariaChecked: t.getAttribute('aria-checked') || t.hasAttribute('checked'),
        label: parent ? parent.innerText.replace(/\n+/g, ' ') : ''
      };
    });
  });
  console.log('Found toggles:', JSON.stringify(toggles, null, 2));

  // Enable auto-start toggle
  const clickedToggle = await page.evaluate(() => {
    const tList = Array.from(document.querySelectorAll('tp-yt-paper-toggle-button, ytcp-paper-toggle-button, ytcp-toggle, paper-toggle-button'));
    for (const t of tList) {
      const p = t.closest('.toggle-container') || t.parentElement?.parentElement || t.parentElement;
      const text = p ? p.innerText : '';
      if (/automatyczne uruchamianie/i.test(text)) {
        const isChecked = t.getAttribute('aria-checked') === 'true' || t.hasAttribute('checked');
        if (!isChecked) {
          t.click();
          return 'Clicked auto-start ON';
        }
        return 'Already checked';
      }
    }
    return 'Not found';
  });
  console.log('Auto-start toggle result:', clickedToggle);
  await page.waitForTimeout(2000);

  // If a confirmation dialog pops up
  const confirmBtn = page.locator('ytcp-confirmation-dialog #confirm-button, button:has-text("Włącz")').first();
  if (await confirmBtn.isVisible().catch(() => false)) {
    console.log('Confirming auto-start modal...');
    await confirmBtn.click();
    await page.waitForTimeout(2000);
  }

  const shot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\osobowosc_room_configured.png';
  await page.screenshot({ path: shot, fullPage: true });
  console.log('Saved room configured screenshot to:', shot);

  await ctx.close();
}

main().catch(console.error);
