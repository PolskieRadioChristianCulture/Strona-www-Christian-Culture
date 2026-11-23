import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  console.log('Launching Studio and opening Christian Culture TV directly...');
  const { ctx, page } = await launchStudio({ headless: true });

  // Open Studio under Christian Culture TV
  const channelId = await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/manage');
  console.log(`Successfully in Christian Culture TV Studio (${channelId})`);
  await page.waitForTimeout(4000);

  // Navigate to room KdOBA_zRU0c
  console.log('Navigating to room KdOBA_zRU0c as Christian Culture TV...');
  await page.goto(`https://studio.youtube.com/video/KdOBA_zRU0c/livestreaming?approve_browser_access=true`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  // Dismiss modal
  await page.mouse.click(600, 600);
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/real_cctv_room.png' });

  // Piercing shadow DOM search for stream keys
  const findings = await page.evaluate(() => {
    function walk(node, list = []) {
      if (!node) return list;
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.value && node.value.length > 10 && !node.value.startsWith('http')) {
          list.push({ tag: node.tagName, id: node.id, val: node.value });
        }
        if (node.shadowRoot) walk(node.shadowRoot, list);
      }
      for (let ch = node.firstChild; ch; ch = ch.nextSibling) {
        walk(ch, list);
      }
      return list;
    }
    return walk(document.body);
  });
  console.log('REAL findings for Christian Culture TV in room KdOBA_zRU0c:\n', JSON.stringify(findings, null, 2));

  await ctx.close();
}

main().catch(console.error);
