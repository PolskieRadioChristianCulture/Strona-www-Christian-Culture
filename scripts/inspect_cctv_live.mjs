import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  console.log('Opening Studio for Christian Culture TV...');
  const channelId = await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/dashboard');
  await page.waitForTimeout(4000);

  console.log('Navigated. Current URL:', page.url());

  // Click Transmisja on the left sidebar
  console.log('Clicking "Transmisja" icon on sidebar...');
  const clicked = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('*'))
      .find(e => (e.innerText === 'Transmisja' || e.getAttribute('aria-label') === 'Transmisja') && e.children.length === 0);
    if (el) {
      const target = el.closest('a, button, ytcp-navigation-item, tp-yt-paper-icon-item, ytls-icon-button') || el.parentElement || el;
      target.click();
      return { clickedTag: target.tagName, text: el.innerText };
    }
    return null;
  });
  console.log('Clicked:', clicked);

  await page.waitForTimeout(6000);
  console.log('URL after clicking Transmisja:', page.url());

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\cctv_control_room.png';
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('Screenshot saved to:', shotPath);

  // Check buttons and toggles
  const info = await page.evaluate(() => {
    const body = document.body.innerText;
    const buttons = Array.from(document.querySelectorAll('ytls-header button, ytls-header ytcp-button')).map(b => ({
      text: (b.innerText || b.getAttribute('aria-label') || '').trim(),
      id: b.id,
      disabled: b.hasAttribute('disabled') || b.getAttribute('aria-disabled') === 'true',
      visible: b.offsetParent !== null
    }));
    const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
      id: i.id,
      type: i.type,
      value: i.value
    }));
    return { buttons, inputs, snippet: body.slice(0, 800) };
  });

  console.log('Buttons:', JSON.stringify(info.buttons, null, 2));
  console.log('Inputs:', JSON.stringify(info.inputs, null, 2));
  console.log('Snippet:\n', info.snippet);

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
