import sharp from 'sharp';

const origPath = 'C:/Users/czark/Downloads/Projekt bez nazwy (20).png';
// Save transparent PNG at 1024x1024
await sharp(origPath)
  .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9, quality: 95 })
  .toFile('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/ccMC/assistant-avatar.png');

console.log('Saved assistant-avatar.png');

// Also save assistant-avatar.jpg (with dark background matching ccMC #05070c so no harsh box)
await sharp(origPath)
  .resize(1024, 1024, { fit: 'contain', background: { r: 5, g: 7, b: 12, alpha: 1 } })
  .jpeg({ quality: 95 })
  .toFile('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/ccMC/assistant-avatar.jpg');

console.log('Saved assistant-avatar.jpg');
