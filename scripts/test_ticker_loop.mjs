import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  // Test HTML with continuous 2-copy marquee
  const testHtml = `
  <!DOCTYPE html>
  <html>
  <head>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background: #111; color: #fff; font-family: sans-serif; }
    .track {
      width: 1920px;
      height: 84px;
      overflow: hidden;
      background: rgba(0,0,0,0.92);
      display: flex;
      align-items: center;
    }
    .inner {
      display: inline-flex;
      white-space: nowrap;
      animation: marquee 90s linear infinite;
    }
    .group {
      display: inline-flex;
      white-space: nowrap;
      gap: 70px;
      padding-right: 70px;
    }
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  </style>
  </head>
  <body>
    <div class="track">
      <div class="inner" id="inner">
        <div class="group" id="g1">
          <span>J 14,27 • Pokój zostawiam wam...</span>
          <span>Flp 4,6-7 • O nic się zbytnio nie troskajcie...</span>
          <span>WSPARCIE • polskieradio.cc/wspieraj</span>
          <span>Mt 11,28 • Pójdźcie do Mnie wszyscy...</span>
        </div>
        <div class="group" id="g2">
          <span>J 14,27 • Pokój zostawiam wam...</span>
          <span>Flp 4,6-7 • O nic się zbytnio nie troskajcie...</span>
          <span>WSPARCIE • polskieradio.cc/wspieraj</span>
          <span>Mt 11,28 • Pójdźcie do Mnie wszyscy...</span>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(testHtml);
  await page.waitForTimeout(100);

  const st1 = await page.evaluate(() => {
    const el = document.getElementById('inner');
    return {
      x: el.getBoundingClientRect().x,
      transform: window.getComputedStyle(el).transform,
      g1Width: document.getElementById('g1').offsetWidth
    };
  });
  console.log('At 0.1s:', st1);

  await page.waitForTimeout(2000);
  const st2 = await page.evaluate(() => {
    const el = document.getElementById('inner');
    return {
      x: el.getBoundingClientRect().x,
      transform: window.getComputedStyle(el).transform
    };
  });
  console.log('At 2.1s:', st2);

  await browser.close();
}

main();
