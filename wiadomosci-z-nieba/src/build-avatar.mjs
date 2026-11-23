import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const DEFAULT_REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');
export const DEFAULT_AVATAR_SOURCE =
  'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/.user_uploaded/media_1795420464327_d2cf71c9.jpg';

function findEdge(limit, getBrightness, forward = true) {
  if (forward) {
    for (let i = 0; i < limit; i++) {
      if (getBrightness(i) >= 24) return i;
    }
    return 0;
  }
  for (let i = limit - 1; i >= 0; i--) {
    if (getBrightness(i) >= 24) return i;
  }
  return limit - 1;
}

export function detectCircleGeometry(rgbBuffer, width, height) {
  const bright = (x, y) => {
    const cx = Math.min(width - 1, Math.max(0, x));
    const cy = Math.min(height - 1, Math.max(0, y));
    const idx = (cy * width + cx) * 3;
    return (rgbBuffer[idx] + rgbBuffer[idx + 1] + rgbBuffer[idx + 2]) / 3;
  };

  const probeY = Math.floor(height / 2);
  const probeX = Math.floor(width / 2);
  const left = findEdge(width, x => bright(x, probeY), true);
  const right = findEdge(width, x => bright(x, probeY), false);
  const refinedCx = Math.round((left + right) / 2);
  const top = findEdge(height, y => bright(refinedCx, y), true);
  const bottom = findEdge(height, y => bright(refinedCx, y), false);
  const refinedCy = Math.round((top + bottom) / 2);

  // Re-measure horizontal extent through refined vertical center
  const left2 = findEdge(width, x => bright(x, refinedCy), true);
  const right2 = findEdge(width, x => bright(x, refinedCy), false);

  const cx = (left2 + right2) / 2;
  const cy = (top + bottom) / 2;
  const rx = (right2 - left2) / 2;
  const ry = (bottom - top) / 2;

  return { cx, cy, rx, ry, left: left2, right: right2, top, bottom };
}

export async function buildTransparentJesusAvatar({
  repoRoot = DEFAULT_REPO_ROOT,
  sourcePath = DEFAULT_AVATAR_SOURCE,
  pngOutPath,
  webpOutPath,
  size = 512,
} = {}) {
  const resolvedPngOut = pngOutPath || path.join(repoRoot, 'images', 'lumina', 'wiadomosci-z-nieba-avatar.png');
  const resolvedWebpOut = webpOutPath || path.join(repoRoot, 'images', 'lumina', 'wiadomosci-z-nieba-avatar.webp');

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Brak źródłowego wizerunku awatara: ${sourcePath}`);
  }

  fs.mkdirSync(path.dirname(resolvedPngOut), { recursive: true });
  fs.mkdirSync(path.dirname(resolvedWebpOut), { recursive: true });

  const { data: rgb, info } = await sharp(sourcePath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const geom = detectCircleGeometry(rgb, width, height);

  // Budujemy bufor RGBA w pełnej rozdzielczości źródła z gładką maską kołową
  // usuwającą wyłącznie czarne tło poza złotym pierścieniem.
  const rgba = Buffer.alloc(width * height * 4);
  const rInner = 0.992;
  const rOuter = 1.001;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sIdx = (y * width + x) * 3;
      const dIdx = (y * width + x) * 4;
      const r = rgb[sIdx];
      const g = rgb[sIdx + 1];
      const b = rgb[sIdx + 2];

      const dx = (x - geom.cx) / geom.rx;
      const dy = (y - geom.cy) / geom.ry;
      const dist = Math.hypot(dx, dy);

      let alpha = 255;
      if (dist >= rOuter) {
        alpha = 0;
      } else if (dist > rInner) {
        const lum = (r + g + b) / 3;
        const t = 1 - (dist - rInner) / (rOuter - rInner);
        const lumFactor = lum < 12 ? 0 : Math.min(1, lum / 42);
        alpha = Math.max(0, Math.min(255, Math.round(255 * t * lumFactor)));
      }

      rgba[dIdx] = r;
      rgba[dIdx + 1] = g;
      rgba[dIdx + 2] = b;
      rgba[dIdx + 3] = alpha;
    }
  }

  // Wytnij wyśrodkowany kwadrat wokół wykrytego pierścienia i zeskaluj do 512x512 z transparentnym marginesem 2px
  const ringDiameter = Math.ceil(Math.max(geom.rx, geom.ry) * 2);
  const cropLeft = Math.max(0, Math.round(geom.cx - ringDiameter / 2));
  const cropTop = Math.max(0, Math.round(geom.cy - ringDiameter / 2));
  const cropWidth = Math.min(width - cropLeft, ringDiameter);
  const cropHeight = Math.min(height - cropTop, ringDiameter);

  const innerSize = size - 4; // 508px w środku płótna 512x512 = 2px symetrycznej rezerwy przezroczystej
  const scaledRing = await sharp(rgba, {
    raw: { width, height, channels: 4 },
  })
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .resize(innerSize, innerSize, {
      fit: 'contain',
      kernel: sharp.kernel.lanczos3,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const canvasPipeline = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite([{ input: scaledRing, left: 2, top: 2 }]);

  await canvasPipeline.clone().png({ compressionLevel: 9, palette: false }).toFile(resolvedPngOut);
  await canvasPipeline.clone().webp({ quality: 90, alphaQuality: 100 }).toFile(resolvedWebpOut);

  // Weryfikacja pikseli wyjściowego PNG
  const verify = await sharp(resolvedPngOut).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const vw = verify.info.width;
  const vh = verify.info.height;
  const alphaAt = (x, y) => verify.data[(y * vw + x) * 4 + 3];
  const corners = [
    alphaAt(2, 2),
    alphaAt(vw - 3, 2),
    alphaAt(2, vh - 3),
    alphaAt(vw - 3, vh - 3),
  ];
  const centerAlpha = alphaAt(Math.floor(vw / 2), Math.floor(vh / 2));
  const pngBytes = fs.statSync(resolvedPngOut).size;
  const webpBytes = fs.statSync(resolvedWebpOut).size;

  return {
    ok: corners.every(a => a === 0) && centerAlpha === 255 && vw === size && vh === size,
    width: vw,
    height: vh,
    geometry: geom,
    cornersAlpha: corners,
    centerAlpha,
    pngOutPath: resolvedPngOut,
    webpOutPath: resolvedWebpOut,
    pngBytes,
    webpBytes,
  };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  buildTransparentJesusAvatar()
    .then(res => {
      console.log(JSON.stringify(res, null, 2));
      if (!res.ok) process.exit(1);
    })
    .catch(err => {
      console.error('❌ Błąd generowania awatara:', err);
      process.exit(1);
    });
}
