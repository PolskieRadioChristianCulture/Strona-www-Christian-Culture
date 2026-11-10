import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/n6IfxzwXBXU/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  await page.mouse.click(598, 612);
  await page.waitForTimeout(1500);

  const editBtn = page.locator('ytls-broadcast-metadata #edit-button').first();
  await editBtn.click();
  await page.waitForTimeout(2000);

  const text = await page.evaluate(() => {
    const dialog = document.querySelector('ytcp-dialog') || document.querySelector('tp-yt-paper-dialog');
    return dialog ? dialog.innerText : 'NO DIALOG';
  });
  console.log('DIALOG TEXT:\n', text);

  // Check all inputs inside dialog
  const inputs = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('ytcp-dialog input, ytcp-dialog tp-yt-paper-radio-button, ytcp-dialog ytcp-dropdown-trigger'));
    return els.map(el => ({
      tag: el.tagName,
      name: el.getAttribute('name'),
      text: el.innerText || el.value,
      type: el.getAttribute('type')
    }));
  });
  console.log('DIALOG INPUTS:\n', JSON.stringify(inputs, null, 2));

  await ctx.close();
}

main().catch(console.error);
