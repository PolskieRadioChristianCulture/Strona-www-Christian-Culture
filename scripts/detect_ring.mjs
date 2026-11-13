import sharp from 'sharp';

const origPath = 'C:/Users/czark/Downloads/Projekt bez nazwy (20).png';
// Let's analyze at 1000x1000
const { data, info } = await sharp(origPath)
  .resize(1000, 1000)
  .raw()
  .toBuffer({ resolveWithObject: true });

// Find purple ring pixels (alpha > 100, purple/magenta hues: B > 140, R > 120, G < 120)
const ringPixels = [];
for (let y = 0; y < 1000; y++) {
  for (let x = 0; x < 1000; x++) {
    const idx = (y * 1000 + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    // Check if it's part of the neon purple/pink circular ring
    if (a > 150 && b > 140 && r > 100 && g < 120 && Math.abs(r - b) < 100) {
      ringPixels.push({ x, y });
    }
  }
}

console.log('Detected ring pixels:', ringPixels.length);
if (ringPixels.length > 0) {
  let minX = 1000, maxX = 0, minY = 1000, maxY = 0;
  for (const p of ringPixels) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  console.log(`Ring X span: ${minX} to ${maxX} (width: ${maxX - minX + 1})`);
  console.log(`Ring Y span: ${minY} to ${maxY} (height: ${maxY - minY + 1})`);
  console.log(`Center: (${(minX + maxX)/2}, ${(minY + maxY)/2})`);
}
