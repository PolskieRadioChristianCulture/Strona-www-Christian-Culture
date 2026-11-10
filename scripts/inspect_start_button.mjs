import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/PcczzAgsIto/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const buttonDetails = await page.evaluate(() => {
    const btn = document.querySelector('#start-stream-button');
    if (!btn) return 'btn not found';

    const computed = window.getComputedStyle(btn);
    const parentComputed = btn.parentElement ? window.getComputedStyle(btn.parentElement) : null;

    // Check all properties
    return {
      tagName: btn.tagName,
      id: btn.id,
      className: btn.className,
      disabled: btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true',
      hidden: btn.hasAttribute('hidden') || btn.hidden,
      display: computed.display,
      visibility: computed.visibility,
      parentTag: btn.parentElement?.tagName,
      parentDisplay: parentComputed?.display,
      parentHidden: btn.parentElement?.hasAttribute('hidden'),
      outerHTML: btn.outerHTML
    };
  });

  console.log('Button details:', JSON.stringify(buttonDetails, null, 2));

  // Also check all elements inside ytls-header
  const headerHtml = await page.evaluate(() => {
    const h = document.querySelector('ytls-header');
    return h ? h.innerHTML : 'No header';
  });
  console.log('Header HTML snippet:\n', headerHtml.slice(0, 1500));

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
