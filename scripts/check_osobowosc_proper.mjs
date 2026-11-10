import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });

  console.log('Switching to Osobowość + identity...');
  await openChannelStudio(page, 'Osobowość +', '/livestreaming/dashboard');
  await page.waitForTimeout(4000);

  console.log('Navigated. Current URL:', page.url());

  // Click Transmisja on the left sidebar
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
  console.log('Clicked Transmisja:', clicked);

  await page.waitForTimeout(6000);
  console.log('URL now:', page.url());

  // Capture any errors / status
  const status = await page.evaluate(() => {
    const alerts = Array.from(document.querySelectorAll('.badge, ytcp-badge, ytls-stream-status, .stream-status, #stream-status, .error-message')).map(e => e.innerText);
    const bodySnippet = document.body.innerText.slice(0, 1000);
    return { alerts, bodySnippet };
  });

  console.log('Status alerts:', status.alerts);
  console.log('Body snippet:\n', status.bodySnippet);

  const shot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\osobowosc_proper_live.png';
  await page.screenshot({ path: shot, fullPage: true });
  console.log('Screenshot saved to:', shot);

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
