import { chromium } from 'playwright';
import fs from 'fs';

async function measure() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const b64 = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/images/wieczor_ze_slowem_bozym_live_bg.jpg').toString('base64');
  await page.setContent(`
    <style>body { margin: 0; background: #000; }</style>
    <img id="bg" src="data:image/jpeg;base64,${b64}">
  `);
  await page.waitForSelector('#bg');
  await page.evaluate(() => document.querySelector('#bg').decode());

  const data = await page.evaluate(() => {
    const img = document.querySelector('#bg');
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 1920, 1080);

    // Wysokość dolnego czarnego paska:
    let bottomBandHeight = 0;
    for (let y = 1079; y >= 900; y -= 5) {
      const p = ctx.getImageData(960, y, 1, 1).data;
      if ((p[0] + p[1] + p[2]) / 3 > 30) {
        bottomBandHeight = 1080 - y;
        break;
      }
    }

    // Gdzie kończy się czerwony prostokąt YT "DZISIAJ O 20:00" na dole po lewej:
    let ytRightEdge = 0;
    for (let x = 100; x < 900; x += 5) {
      const p = ctx.getImageData(x, 1030, 1, 1).data;
      // Jeśli jest czerwony lub jasny
      if (p[0] > 100 && p[1] < 50) {
        ytRightEdge = x;
      }
    }

    // Górny pas:
    // Branding po prawej zaczyna się od jakiego X?
    let brandingStartX = 1920;
    for (let x = 700; x < 1500; x += 10) {
      for (let y = 50; y < 180; y += 10) {
        const p = ctx.getImageData(x, y, 1, 1).data;
        if ((p[0] + p[1] + p[2]) / 3 > 60) {
          if (x < brandingStartX) brandingStartX = x;
        }
      }
    }

    return { bottomBandHeight, ytRightEdge, brandingStartX };
  });

  console.log('Pomiary grafiki:', data);
  await browser.close();
}

measure();
