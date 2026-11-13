import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const targetDir = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/images/academy/daily';
const luminaDir = 'C:/Users/czark/Desktop/@ICC/LUMINA/images/academy/daily';

const img43 = 'C:/Users/czark/Downloads/Gemini_Generated_Image_cfgdjtcfgdjtcfgd.jpg';
const img44 = 'C:/Users/czark/Downloads/Gemini_Generated_Image_efh5e3efh5e3efh5.jpg';

const out43 = path.join(targetDir, 'kc_day_43_slup_obloku_i_ognia.jpg');
const out44 = path.join(targetDir, 'kc_day_44_przejscie_przez_morze_czerwone.jpg');

async function run() {
  await sharp(img43).resize(1920, 1080, { fit: 'cover' }).jpeg({ quality: 90 }).toFile(out43);
  await sharp(img44).resize(1920, 1080, { fit: 'cover' }).jpeg({ quality: 90 }).toFile(out44);

  if (fs.existsSync(luminaDir)) {
    fs.copyFileSync(out43, path.join(luminaDir, 'kc_day_43_slup_obloku_i_ognia.jpg'));
    fs.copyFileSync(out44, path.join(luminaDir, 'kc_day_44_przejscie_przez_morze_czerwone.jpg'));
  }
  console.log('✅ Obrazy dla Dnia 43 i 44 przygotowane i skopiowane do obydwu repozytoriów!');
}

run().catch(console.error);
