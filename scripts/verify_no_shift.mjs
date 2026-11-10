import { chromium } from 'playwright';

async function verify() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('https://polskieradio.cc', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const debug = await page.evaluate(() => {
    const link = document.getElementById('helplineFloat');
    const modal = document.getElementById('helplineModal');

    // Test calling openHelplineModal directly or dispatching event
    const evt = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(evt);

    return {
      windowWidth: window.innerWidth,
      modalClassesAfterDispatch: modal.className,
      defaultPrevented: evt.defaultPrevented
    };
  });
  console.log('Dispatch debug:', debug);

  await browser.close();
}

verify().catch(console.error);
