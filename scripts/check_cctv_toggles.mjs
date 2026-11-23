import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/manage');
  await page.waitForTimeout(3000);

  await page.goto('https://studio.youtube.com/video/KdOBA_zRU0c/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Dismiss modal
  await page.mouse.click(600, 600);
  await page.waitForTimeout(1000);

  // Scroll the left settings pane down
  console.log('Scrolling settings panel down...');
  await page.evaluate(() => {
    const pane = document.querySelector('ytls-stream-settings-tab-renderer, [role="tabpanel"], .scrollable');
    if (pane) pane.scrollTop = 500;
    else window.scrollBy(0, 500);
  });
  await page.waitForTimeout(1500);

  // Find all toggles and their states
  const toggles = await page.evaluate(() => {
    function walk(node, list = []) {
      if (!node) return list;
      if (node.tagName === 'TP-YT-PAPER-TOGGLE-BUTTON') {
        list.push({
          text: node.textContent.trim(),
          checked: node.getAttribute('aria-checked') === 'true' || node.hasAttribute('checked')
        });
      }
      if (node.shadowRoot) walk(node.shadowRoot, list);
      for (let ch = node.firstChild; ch; ch = ch.nextSibling) walk(ch, list);
      return list;
    }
    return walk(document.body);
  });
  console.log('All toggles in room KdOBA_zRU0c:\n', JSON.stringify(toggles, null, 2));

  // Also check "Edytuj" modal (Title, Thumbnail, Date)
  console.log('Clicking "Edytuj" button...');
  const editBtn = page.locator('#edit-button, button:has-text("Edytuj"), ytcp-button:has-text("Edytuj")').first();
  if (await editBtn.isVisible().catch(() => false)) {
    await editBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/edit_modal_cctv.png' });
  }

  await ctx.close();
}

main().catch(console.error);
