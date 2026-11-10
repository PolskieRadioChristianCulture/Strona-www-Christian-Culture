import fs from 'node:fs';
import path from 'node:path';

const [outputName, newKey] = process.argv.slice(2);
if (!outputName || !newKey) {
  console.error('Usage: node update_aitum.mjs <outputName> <newKey>');
  process.exit(1);
}

const profilesDir = 'C:\\Users\\nazir\\AppData\\Roaming\\obs-studio\\basic\\profiles';
const dirs = fs.readdirSync(profilesDir);

let totalUpdated = 0;
for (const d of dirs) {
  const filePath = path.join(profilesDir, d, 'aitum.json');
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let modified = false;
      for (const out of data.outputs || []) {
        if (out.name === outputName) {
          console.log(`Found ${outputName} in profile "${d}". Old key: ${out.stream_key} -> New key: ${newKey}`);
          out.stream_key = newKey;
          if (Array.isArray(out.video_encoders)) {
            for (const enc of out.video_encoders) {
              enc.stream_key = newKey;
            }
          }
          modified = true;
          totalUpdated++;
        }
      }
      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
        console.log(`Saved updated aitum.json in profile: ${d}`);
      }
    } catch (err) {
      console.error(`Error processing ${filePath}:`, err.message);
    }
  }
}

console.log(`Update complete. Updated ${totalUpdated} occurrences.`);
