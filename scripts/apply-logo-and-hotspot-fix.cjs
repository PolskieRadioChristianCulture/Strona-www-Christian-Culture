const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function run() {
  console.log('1. Building crisp high-res LUMI logo assets...');
  
  // Read SVG master
  const svgPath = path.resolve('scratch/lumi_header_logo_master.svg');
  if (!fs.existsSync(svgPath)) {
    throw new Error('SVG master not found: ' + svgPath);
  }
  const svgBuffer = fs.readFileSync(svgPath);

  // 1. High-Res 512x512 WebP & PNG
  const webp512 = await sharp(svgBuffer)
    .resize(512, 512)
    .webp({ quality: 98, lossless: false })
    .toBuffer();

  const png512 = await sharp(svgBuffer)
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toBuffer();

  // 2. High-Res 256x256 WebP & PNG (Standard Retina)
  const webp256 = await sharp(svgBuffer)
    .resize(256, 256)
    .webp({ quality: 98, lossless: false })
    .toBuffer();

  const png256 = await sharp(svgBuffer)
    .resize(256, 256)
    .png({ compressionLevel: 9 })
    .toBuffer();

  // Save to images/chat
  fs.writeFileSync('images/chat/lumi_header_logo.webp', webp256);
  fs.writeFileSync('images/chat/lumi_header_logo.png', png256);
  fs.writeFileSync('images/chat/lumi_header_logo_512.webp', webp512);
  fs.writeFileSync('images/chat/lumi_header_logo_512.png', png512);

  console.log('Saved images/chat/lumi_header_logo.webp (256x256)', webp256.length, 'bytes');
  console.log('Saved images/chat/lumi_header_logo.png (256x256)', png256.length, 'bytes');

  // 2. Update components/cc-global-chat-button.js
  console.log('2. Updating components/cc-global-chat-button.js...');
  const chatJsPath = 'components/cc-global-chat-button.js';
  let js = fs.readFileSync(chatJsPath, 'utf8');

  // Remove cc-showcase-pill from hotspot buttons in HTML
  js = js.replace(
    '<button type="button" class="cc-hotspot cc-hotspot-pill1 cc-showcase-pill" id="ccPillRadio" aria-label="Posłuchaj radia" title="Posłuchaj radia"></button>',
    '<button type="button" class="cc-hotspot cc-hotspot-pill1" id="ccPillRadio" aria-label="Posłuchaj radia" title="Posłuchaj radia"></button>'
  );
  js = js.replace(
    '<button type="button" class="cc-hotspot cc-hotspot-pill2 cc-showcase-pill" id="ccPillBible" aria-label="Poznaj Biblię" title="Poznaj Biblię"></button>',
    '<button type="button" class="cc-hotspot cc-hotspot-pill2" id="ccPillBible" aria-label="Poznaj Biblię" title="Poznaj Biblię"></button>'
  );
  js = js.replace(
    '<button type="button" class="cc-hotspot cc-hotspot-pill3 cc-showcase-pill" id="ccPillDiscover" aria-label="Odkryj CC" title="Odkryj CC"></button>',
    '<button type="button" class="cc-hotspot cc-hotspot-pill3" id="ccPillDiscover" aria-label="Odkryj CC" title="Odkryj CC"></button>'
  );

  // Update CSS for .cc-hotspot to enforce 100% transparency
  const oldHotspotCss = `      .cc-hotspot {
        position: absolute !important;
        background: transparent !important;
        border: none !important;
        cursor: pointer !important;
        outline: none !important;
        transition: background 0.15s ease, box-shadow 0.15s ease !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      .cc-hotspot:hover, .cc-hotspot:focus-visible {
        background: rgba(242, 209, 124, 0.14) !important;
        box-shadow: inset 0 0 0 1.5px rgba(242, 209, 124, 0.5) !important;
      }`;

  const newHotspotCss = `      .cc-hotspot {
        position: absolute !important;
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        cursor: pointer !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      .cc-hotspot:hover,
      .cc-hotspot:focus,
      .cc-hotspot:focus-visible,
      .cc-hotspot:active {
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
      }

      .cc-trio-card,
      .cc-trio-card:hover,
      .cc-trio-card:focus,
      .cc-trio-card.is-active,
      .cc-hotspot-pill1,
      .cc-hotspot-pill2,
      .cc-hotspot-pill3,
      .cc-hotspot-pill1:hover,
      .cc-hotspot-pill2:hover,
      .cc-hotspot-pill3:hover {
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
      }`;

  if (js.includes(oldHotspotCss)) {
    js = js.replace(oldHotspotCss, newHotspotCss);
    console.log('Replaced .cc-hotspot CSS successfully');
  } else {
    console.warn('oldHotspotCss not found by exact string, checking variants...');
  }

  // Ensure header icon has object-fit: contain
  js = js.replace(
    `.cc-chat-header-icon {
        width: 100% !important;
        height: 100% !important;
        border-radius: 50% !important;
        object-fit: cover !important;
      }`,
    `.cc-chat-header-icon {
        width: 100% !important;
        height: 100% !important;
        border-radius: 50% !important;
        object-fit: contain !important;
        display: block !important;
      }`
  );

  fs.writeFileSync(chatJsPath, js, 'utf8');
  console.log('Saved components/cc-global-chat-button.js');
}

run().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
