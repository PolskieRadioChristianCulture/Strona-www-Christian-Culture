import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'Osobowość +', '/livestreaming/dashboard');
  await page.waitForTimeout(3000);
  await page.goto('https://studio.youtube.com/video/KYSla9a5bjQ/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const debugInfo = await page.evaluate(() => {
    const btn = document.querySelector('#start-stream-button');
    const header = document.querySelector('ytls-header');
    if (!btn || !header) return 'not found';

    // In Polymer / Lit, check __data, __properties, or internal fields
    const data = {};
    for (const k of Object.getOwnPropertyNames(header)) {
      if (!k.startsWith('__zone') && typeof header[k] !== 'function') {
        data[k] = header[k];
      }
    }

    // Check prototype properties
    let proto = Object.getPrototypeOf(header);
    const protoProps = [];
    while (proto && proto !== Object.prototype) {
      protoProps.push(...Object.getOwnPropertyNames(proto));
      proto = Object.getPrototypeOf(proto);
    }

    return {
      headerData: data,
      btnProperties: {
        disabled: btn.disabled,
        hidden: btn.hidden,
        attributes: Array.from(btn.attributes).map(a => `${a.name}="${a.value}"`)
      },
      protoProps: protoProps.filter(p => /stream|broadcast|start|live|disable/i.test(p))
    };
  });

  console.log('Debug info:\n', JSON.stringify(debugInfo, null, 2));

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
