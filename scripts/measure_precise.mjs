import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const b64 = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/images/wieczor_ze_slowem_bozym_live_bg.jpg').toString('base64');
  await page.setContent(`<img id="i" src="data:image/jpeg;base64,${b64}" style="width:1920px;height:1080px;display:block;">`);
  await page.evaluate(() => document.querySelector('#i').decode());

  const box = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 1920; c.height = 1080;
    const ctx = c.getContext('2d'); ctx.drawImage(document.querySelector('#i'), 0, 0, 1920, 1080);
    
    // Znajdźmy górną i dolną granicę czerwonej belki na dole (x = 400)
    let topRed = null, bottomRed = null;
    for (let y = 900; y < 1080; y++) {
      const p = ctx.getImageData(400, y, 1, 1).data;
      if (p[0] > 100 && p[1] < 45 && p[2] < 45) {
        if (topRed === null) topRed = y;
        bottomRed = y;
      }
    }

    // Wysokość czarnego tła na górze (x = 300)
    let topBlackHeight = 0;
    for (let y = 0; y < 200; y++) {
      const p = ctx.getImageData(300, y, 1, 1).data;
      if (p[0] > 28 || p[1] > 28 || p[2] > 28) {
        topBlackHeight = y;
        break;
      }
    }

    // Gdzie kończy się czarny pas na dole (granica dolnego letterboxa)
    let bottomLetterboxTop = 1080;
    for (let y = 1079; y > 850; y--) {
      const p = ctx.getImageData(960, y, 1, 1).data;
      if (p[0] > 30 || p[1] > 30 || p[2] > 30) {
        bottomLetterboxTop = y + 1;
        break;
      }
    }

    return { topRed, bottomRed, topBlackHeight, bottomLetterboxTop };
  });

  console.log('Precyzyjne wymiary grafiki:', box);
  await browser.close();
}

main();
