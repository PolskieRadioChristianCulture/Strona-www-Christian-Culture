import { execSync } from 'node:child_process';
import fs from 'node:fs';

const logList = execSync('ssh cc-nadajnik dir /B /O-D C:\\Users\\nazir\\AppData\\Roaming\\obs-studio\\logs', { encoding: 'utf8' });
const newestLog = logList.split(/\r?\n/)[0].trim();
console.log('Newest log:', newestLog);

execSync(`scp "cc-nadajnik:C:/Users/nazir/AppData/Roaming/obs-studio/logs/${newestLog}" "C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/scratch/obs_newest.log"`, { stdio: 'inherit' });

const content = fs.readFileSync('C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/scratch/obs_newest.log', 'utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);
console.log('Last 50 lines:\n', lines.slice(-50).join('\n'));
