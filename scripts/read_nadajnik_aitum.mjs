import { execSync } from 'child_process';

const ps = "Get-Content 'C:\\Users\\nazir\\AppData\\Roaming\\obs-studio\\plugin_config\\aitum-multistream\\config.json' -Raw";
const b64 = Buffer.from(ps, 'utf16le').toString('base64');
const out = execSync(`ssh -o BatchMode=yes cc-nadajnik "powershell -NoProfile -EncodedCommand ${b64}"`, { encoding: 'utf8' });

try {
  const clean = out.replace(/#< CLIXML[\s\S]*?<\/Objs>/, '').trim();
  const json = JSON.parse(clean);
  const profile = json.profiles[0];
  console.log('Profile name:', profile.name);
  console.log('Total outputs in profile:', profile.outputs.length);
  profile.outputs.forEach((o, i) => {
    console.log(`${String(i + 1).padStart(2)}. [${o.name}] server=${o.stream_server} | key=${o.stream_key}`);
  });
} catch (e) {
  console.log('Error or raw output:', out.slice(0, 1000));
}
