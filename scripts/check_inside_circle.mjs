import sharp from 'sharp';

const origPath = 'C:/Users/czark/Downloads/Projekt bez nazwy (20).png';
const { data, info } = await sharp(origPath)
  .resize(1000, 1000)
  .raw()
  .toBuffer({ resolveWithObject: true });

// Check inside the circle: e.g. at (x=638, y=300) - above the woman's head but inside circle
// Center is (638.5, 548.5), radius is 325.5.
// Top of circle is y=223.
// Point (638, 250) is inside the circle, above head.
const getP = (x, y) => {
  const i = (y * 1000 + x) * 4;
  return { x, y, r: data[i], g: data[i+1], b: data[i+2], a: data[i+3] };
};

console.log('Inside circle above head (638, 260):', getP(638, 260));
console.log('Inside circle upper-left (500, 350):', getP(500, 350));
console.log('Inside circle upper-right (780, 350):', getP(780, 350));
console.log('Outside circle upper-left (400, 200):', getP(400, 200));
console.log('Outside circle upper-right (850, 200):', getP(850, 200));
