import sharp from 'sharp';

const origPath = 'C:/Users/czark/Downloads/Projekt bez nazwy (20).png';
const { data, info } = await sharp(origPath)
  .resize(1000, 1000)
  .raw()
  .toBuffer({ resolveWithObject: true });

console.log('Channels:', info.channels);

let minX = 1000, maxX = 0, minY = 1000, maxY = 0;
let transparentCount = 0;

for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const idx = (y * info.width + x) * info.channels;
    const a = info.channels === 4 ? data[idx + 3] : 255;
    if (a < 10) {
      transparentCount++;
    } else {
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      if (r > 10 || g > 10 || b > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
}

console.log('Transparent pixels:', transparentCount, 'out of 1,000,000 (' + (transparentCount/10000).toFixed(1) + '%)');
console.log(`Opaque Content bounding box in 1000x1000: X [${minX}, ${maxX}], Y [${minY}, ${maxY}]`);
