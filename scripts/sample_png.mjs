import sharp from 'sharp';

const origPath = 'C:/Users/czark/Downloads/Projekt bez nazwy (20).png';
const img = sharp(origPath);
const meta = await img.metadata();

console.log('Original PNG Dimensions:', meta.width, 'x', meta.height);

// Let's sample a few pixels:
// Top-left corner (0,0): is it transparent?
const raw = await img.resize(100, 100).raw().toBuffer({ resolveWithObject: true });
const getPixel = (x, y) => {
  const i = (y * 100 + x) * 4;
  return { r: raw.data[i], g: raw.data[i+1], b: raw.data[i+2], a: raw.data[i+3] };
};

console.log('Corner (0,0):', getPixel(0, 0));
console.log('Top center (50, 5):', getPixel(50, 5));
console.log('Center (50, 50):', getPixel(50, 50));
console.log('Bottom left (10, 90):', getPixel(10, 90));
