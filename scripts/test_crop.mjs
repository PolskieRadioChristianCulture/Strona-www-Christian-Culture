import sharp from 'sharp';

const origPath = 'C:/Users/czark/Downloads/Projekt bez nazwy (20).png';
const origMeta = await sharp(origPath).metadata();
console.log('Original size:', origMeta.width, origMeta.height);

// In 6250 x 6250 original:
// In 1000x1000:
// CenterX = 638.5 -> in 6250: 638.5 * 6.25 = 3990.6
// CenterY = 548.5 -> in 6250: 548.5 * 6.25 = 3428.1
// Radius = 325.5  -> in 6250: 325.5 * 6.25 = 2034.4 (Diameter = 4068.75)

// What is the full content bbox in 6250?
// From check_orig_alpha: X [29, 966] -> [181, 6037]
// Y [27, 928] -> [168, 5800]
// Badge extends to X=181 on left.

console.log('Calculated circle in 6250:');
console.log('Center: (3991, 3428), Radius: 2034, Diameter: 4069');
