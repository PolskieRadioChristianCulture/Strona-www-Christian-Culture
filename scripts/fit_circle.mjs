import sharp from 'sharp';

const origPath = 'C:/Users/czark/Downloads/Projekt bez nazwy (20).png';
// Let's resize to 1000x1000 for fast analysis
const { data, info } = await sharp(origPath)
  .resize(1000, 1000)
  .raw()
  .toBuffer({ resolveWithObject: true });

// Look for the circular ring:
// In the upper half (y < 600), the circle is clearly visible on left, top, and right.
// Let's find the circle arc points in y in [150, 500]:
const arcPoints = [];
for (let y = 150; y < 550; y++) {
  for (let x = 0; x < 1000; x++) {
    const idx = (y * 1000 + x) * 4;
    const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
    // Purple / magenta ring: strong blue & red, moderate or low green, high alpha
    // Specifically looking at the bright ring edge
    if (a > 200 && b > 140 && r > 100 && g < 130 && (b - g > 50)) {
      // Avoid woman's blonde hair or shirt if any in this region
      // Circle is at the outer edges
      if (x < 400 || x > 600 || y < 250) {
        arcPoints.push({ x, y });
      }
    }
  }
}

console.log('Arc points found:', arcPoints.length);

// Let's find bounding circle of the arc points:
let minX = 1000, maxX = 0, minY = 1000, maxY = 0;
for (const p of arcPoints) {
  if (p.x < minX) minX = p.x;
  if (p.x > maxX) maxX = p.x;
  if (p.y < minY) minY = p.y;
  if (p.y > maxY) maxY = p.y;
}
console.log(`Arc X: [${minX}, ${maxX}] span=${maxX - minX}`);
console.log(`Arc Y: [${minY}, ${maxY}] span=${maxY - minY}`);

// The circle's horizontal center is (minX + maxX)/2
const cx = (minX + maxX) / 2;
// The circle's diameter should equal maxX - minX
const diameter = maxX - minX;
const radius = diameter / 2;
// If the top of the circle is minY, then center Y should be minY + radius
const cy = minY + radius;
console.log(`Estimated Circle: Center=(${cx}, ${cy}), Radius=${radius}, Diameter=${diameter}`);

// Verify radius on left (cx - minX), right (maxX - cx), top (cy - minY)
console.log('Check radii:', cx - minX, maxX - cx, cy - minY);
