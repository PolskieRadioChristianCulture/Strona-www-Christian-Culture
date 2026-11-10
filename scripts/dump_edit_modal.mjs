import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await page.goto('https://studio.youtube.com/video/LXF-yIcnO_g/livestreaming', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);

    const editBtn = page.locator('#edit-button, button:has-text("Edytuj")').first();
    await editBtn.click();
    await page.waitForTimeout(3000);

    const modalDump = await page.evaluate(() => {
      const modal = document.querySelector('ytcp-dialog, [role="dialog"], ytls-live-control-room-metadata-dialog');
      if (!modal) return 'No modal found';
      return {
        text: modal.innerText,
        inputs: Array.from(modal.querySelectorAll('input, select, [role="radio"], [role="button"], [role="combobox"]')).map(el => ({
          tag: el.tagName,
          type: el.type,
          id: el.id,
          name: el.name,
          text: el.innerText || el.value,
          role: el.getAttribute('role')
        }))
      };
    });
    console.log('Modal Dump:', JSON.stringify(modalDump, null, 2));

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
