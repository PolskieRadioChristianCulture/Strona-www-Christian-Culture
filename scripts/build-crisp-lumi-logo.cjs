const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 512x512 Master SVG matching the circular luxury LUMI Messenger identity with 100% transparent exterior
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Deep Royal Violet radial gradient for disc body -->
    <radialGradient id="discGrad" cx="50%" cy="38%" r="62%" fx="42%" fy="28%">
      <stop offset="0%" stop-color="#7B2CBF"/>
      <stop offset="35%" stop-color="#5A189A"/>
      <stop offset="70%" stop-color="#3C096C"/>
      <stop offset="100%" stop-color="#240046"/>
    </radialGradient>

    <!-- Luxury Champagne Gold perimeter ring -->
    <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF3C4"/>
      <stop offset="20%" stop-color="#F7D070"/>
      <stop offset="45%" stop-color="#D4AF37"/>
      <stop offset="70%" stop-color="#AA820A"/>
      <stop offset="90%" stop-color="#F5D77F"/>
      <stop offset="100%" stop-color="#FFF6D8"/>
    </linearGradient>

    <!-- Warm Golden Ambient Glow at bottom/edges -->
    <radialGradient id="bottomGlow" cx="50%" cy="85%" r="55%">
      <stop offset="0%" stop-color="#F7D070" stop-opacity="0.75"/>
      <stop offset="35%" stop-color="#D4AF37" stop-opacity="0.45"/>
      <stop offset="70%" stop-color="#7B2CBF" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#240046" stop-opacity="0"/>
    </radialGradient>

    <!-- Primary Upper-Left Bubble (Soft Champagne Gold 3D) -->
    <linearGradient id="bubble1" x1="25%" y1="10%" x2="75%" y2="90%">
      <stop offset="0%" stop-color="#FFF6D9"/>
      <stop offset="25%" stop-color="#FCE59F"/>
      <stop offset="60%" stop-color="#E8B84B"/>
      <stop offset="100%" stop-color="#BF8B1D"/>
    </linearGradient>

    <!-- Secondary Lower-Right Bubble -->
    <linearGradient id="bubble2" x1="20%" y1="10%" x2="80%" y2="95%">
      <stop offset="0%" stop-color="#FFF9E6"/>
      <stop offset="30%" stop-color="#FCEAB3"/>
      <stop offset="65%" stop-color="#EBBF5C"/>
      <stop offset="100%" stop-color="#C79528"/>
    </linearGradient>

    <!-- Soft drop shadows -->
    <filter id="shadowDisc" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#05010B" flood-opacity="0.6"/>
    </filter>

    <filter id="shadowBubble" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#140026" flood-opacity="0.55"/>
    </filter>
  </defs>

  <!-- Circular Disc with 100% transparent exterior -->
  <g filter="url(#shadowDisc)">
    <!-- Base Violet Sphere -->
    <circle cx="256" cy="256" r="236" fill="url(#discGrad)"/>

    <!-- Bottom Crescent Ambient Warmth -->
    <path d="M 40,256 C 40,375 137,472 256,472 C 375,472 472,375 472,256 C 440,360 355,420 256,420 C 157,420 72,360 40,256 Z" fill="url(#bottomGlow)"/>

    <!-- Outer Gold Ring -->
    <circle cx="256" cy="256" r="236" fill="none" stroke="url(#goldRing)" stroke-width="8"/>
    <!-- Subtle Inner Highlight Rim -->
    <circle cx="256" cy="256" r="231" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.35"/>
  </g>

  <!-- Two Golden Chat Bubbles -->
  <g filter="url(#shadowBubble)">
    <!-- 1. Upper-Left Chat Bubble -->
    <!-- Center approx (195, 210), radius ~68, tail pointing towards 205, 305 -->
    <path d="M 132, 205
             C 132, 162 168, 126 212, 126
             C 256, 126 292, 162 292, 205
             C 292, 248 256, 284 212, 284
             C 197, 284 182, 279 170, 272
             L 142, 283
             L 150, 254
             C 139, 240 132, 223 132, 205 Z"
          fill="url(#bubble1)"/>

    <!-- Subtle Bubble 1 Sheen -->
    <path d="M 148, 185 C 155, 150 180, 138 212, 138 C 190, 142 165, 155 155, 185 Z" fill="#FFFFFF" fill-opacity="0.45"/>

    <!-- 2. Lower-Right Chat Bubble -->
    <!-- Center approx (305, 290), radius ~75, tail pointing towards 350, 375 -->
    <path d="M 235, 285
             C 235, 238 274, 200 322, 200
             C 370, 200 409, 238 409, 285
             C 409, 332 370, 370 322, 370
             C 305, 370 289, 365 275, 356
             L 242, 368
             L 252, 336
             C 241, 322 235, 304 235, 285 Z"
          fill="url(#bubble2)"
          stroke="#3C096C" stroke-width="3" stroke-opacity="0.35"/>

    <!-- Subtle Bubble 2 Sheen -->
    <path d="M 252, 265 C 260, 226 290, 212 325, 212 C 300, 216 272, 230 260, 265 Z" fill="#FFFFFF" fill-opacity="0.45"/>
  </g>
</svg>`;

async function main() {
  const scratchDir = path.resolve('scratch');
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  const svgPath = path.join(scratchDir, 'lumi_header_logo_master.svg');
  fs.writeFileSync(svgPath, svg, 'utf8');

  // Render 512x512 Master PNG and WebP
  const png512 = await sharp(Buffer.from(svg))
    .resize(512, 512)
    .png()
    .toBuffer();

  const webp512 = await sharp(Buffer.from(svg))
    .resize(512, 512)
    .webp({ quality: 95, lossless: false })
    .toBuffer();

  // Save to scratch and brain for visual check
  fs.writeFileSync(path.join(scratchDir, 'lumi_logo_cand.png'), png512);
  fs.writeFileSync('C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/lumi_logo_cand.png', png512);
  console.log('Generated lumi_logo_cand.png in brain successfully');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
