import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const BG_IMAGE_PATH = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/wieczor_ze_slowem_bozym_bg_1794822760581.jpg';
const OUTPUT_JPG = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/scripts/wieczor_ze_slowem_bozym_thumb.jpg';
const OUTPUT_PNG = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/wieczor_ze_slowem_bozym_thumb.png';

const htmlContent = `
<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Inter:wght@500;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1280px;
    height: 720px;
    overflow: hidden;
    position: relative;
    background: #000;
    font-family: 'Inter', sans-serif;
  }

  .bg-img {
    position: absolute;
    top: 0; left: 0;
    width: 1280px; height: 720px;
    object-fit: cover;
    filter: brightness(0.92) contrast(1.08);
  }

  /* Winieta i cieniowanie z lewej dla maksymalnej czytelności typografii */
  .vignette {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(
      90deg,
      rgba(5, 7, 15, 0.92) 0%,
      rgba(7, 10, 20, 0.82) 42%,
      rgba(10, 12, 22, 0.40) 70%,
      rgba(5, 7, 15, 0.20) 100%
    );
  }

  .content {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    padding: 60px 70px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 10;
  }

  .top-row {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .live-badge {
    background: #bb142e;
    color: #ffffff;
    font-weight: 800;
    font-size: 19px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 10px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(187, 20, 46, 0.6);
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .live-dot {
    width: 12px; height: 12px;
    background: #ffffff;
    border-radius: 50%;
  }

  .time-badge {
    background: rgba(20, 24, 38, 0.85);
    border: 1.5px solid #d4a94a;
    color: #f5dfa0;
    font-weight: 700;
    font-size: 18px;
    letter-spacing: 1.5px;
    padding: 10px 22px;
    border-radius: 8px;
    text-transform: uppercase;
    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
  }

  .middle-block {
    max-width: 820px;
  }

  .main-title {
    font-family: 'Cinzel', serif;
    font-weight: 900;
    font-size: 66px;
    line-height: 1.08;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 0 4px 25px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.8);
    margin-bottom: 20px;
  }

  .main-title span {
    color: #f3d47d;
  }

  .subtitle {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-weight: 700;
    font-size: 42px;
    color: #e5b958;
    text-shadow: 0 3px 15px rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .subtitle::before {
    content: "—";
    color: #f3d47d;
  }

  .bottom-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid rgba(212, 169, 74, 0.35);
    padding-top: 24px;
    max-width: 900px;
  }

  .tags {
    color: #e2e8f0;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    display: flex;
    gap: 20px;
  }

  .tags span {
    color: #d4a94a;
  }

  .brand-pill {
    background: rgba(10, 14, 25, 0.88);
    border: 1px solid rgba(212, 169, 74, 0.6);
    color: #ffffff;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 8px 20px;
    border-radius: 6px;
  }
</style>
</head>
<body>
  <img class="bg-img" src="${BG_IMAGE_PATH}" alt="Tło">
  <div class="vignette"></div>
  <div class="content">
    <div class="top-row">
      <div class="live-badge"><span class="live-dot"></span> NA ŻYWO</div>
      <div class="time-badge">DZIŚ GODZINA 20:00</div>
    </div>
    <div class="middle-block">
      <h1 class="main-title">WIECZÓR ZE <span>SŁOWEM BOŻYM</span></h1>
      <div class="subtitle">Zaznaj spokoju serca</div>
    </div>
    <div class="bottom-row">
      <div class="tags">
        Pismo Święte <span>•</span> Modlitwa <span>•</span> Pokój Boży
      </div>
      <div class="brand-pill">
        Polskie Radio CC &amp; Robert Łukasz Pio
      </div>
    </div>
  </div>
</body>
</html>
`;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500); // Wait for Google Fonts to render

  await page.screenshot({ path: OUTPUT_PNG });
  console.log('Saved PNG to:', OUTPUT_PNG);

  await page.screenshot({ path: OUTPUT_JPG, quality: 95, type: 'jpeg' });
  console.log('Saved JPG to:', OUTPUT_JPG);

  await browser.close();
}

main().catch(console.error);
