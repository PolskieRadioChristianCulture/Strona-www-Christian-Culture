import fs from 'node:fs';
import path from 'node:path';

const profilesDir = 'C:\\Users\\nazir\\AppData\\Roaming\\obs-studio\\basic\\profiles';
const dirs = fs.readdirSync(profilesDir);

for (const d of dirs) {
  const filePath = path.join(profilesDir, d, 'aitum.json');
  if (fs.existsSync(filePath)) {
    try {
      let raw = fs.readFileSync(filePath, 'utf8');
      if (raw.charCodeAt(0) === 0xFEFF) {
        raw = raw.slice(1);
      }
      const data = JSON.parse(raw);
      console.log(`=== Profile: ${d} ===`);
      for (const out of data.outputs || []) {
        console.log(`Output: "${out.name}" -> stream_key: "${out.stream_key}"`);
      }
      // Re-save without BOM
      fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
    } catch (err) {
      console.error(`Error in ${d}:`, err.message);
    }
  }
}
