import sharp from 'sharp';
import fs from 'node:fs';

const origPath = 'C:/Users/czark/Downloads/Projekt bez nazwy (20).png';
const origMeta = await sharp(origPath).metadata();
console.log('Original PNG:', origMeta.width, 'x', origMeta.height, 'hasAlpha:', origMeta.hasAlpha, 'format:', origMeta.format);
const meta = await sharp(imgPath).metadata();
console.log('Metadata:', meta.width, 'x', meta.height, meta.format);

// Find bounds of the circle / non-black content
const { data, info } = await sharp(imgPath)
  .raw()
  .toBuffer({ resolveWithObject: true });

console.log('Channels:', info.channels, 'Width:', info.width, 'Height:', info.height);

// Let's find non-black bounding box (threshold > 15 on any channel)
let minX = info.width, maxX = 0, minY = info.height, maxY = 0;
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const idx = (y * info.width + x) * info.channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    if (r > 20 || g > 20 || b > 20) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

console.log(`Content bounding box: X [${minX}, ${maxX}] (${maxX - minX + 1}px), Y [${minY}, ${maxY}] (${maxY - minY + 1}px)`);

// Also check the purple ring specifically (high R & B, low G: e.g. R > 120, B > 140, G < 100)
let ringMinX = info.width, ringMaxX = 0, ringMinY = info.height, ringMaxY = 0;
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const idx = (y * info.width + x) * info.channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Purple / magenta ring detector
    if (b > 130 && r > 90 && g < 110 && (b - g > 50)) {
      if (x < ringMinX) ringMinX = x;
      if (x > ringMaxX) ringMaxX = x;
      if (y < ringMinY) ringMinY = y;
      if (y > ringMaxY) ringMaxY = y;
    }
  }
}

console.log(`Purple ring bounding box: X [${ringMinX}, ${ringMaxX}] (${ringMaxX - ringMinX + 1}px), Y [${ringMinY}, ${ringMaxY}] (${ringMaxY - ringMinY + 1}px)`);
const ringCenterX = (ringMinX + ringMaxX) / 2;
const ringCenterY = (ringMinY + ringMaxY) / 2;
const ringDiameterX = ringMaxX - ringMinX + 1;
const ringDiameterY = ringMaxY - ringMinY + 1;
console.log(`Ring Center: (${ringCenterX.toFixed(1)}, ${ringCenterY.toFixed(1)}), Diameter: ${ringDiameterX} x ${ringDiameterY}`);
