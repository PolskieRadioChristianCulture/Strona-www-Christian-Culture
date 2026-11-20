import { execSync } from 'node:child_process';

const cmd = `ssh -o BatchMode=yes cc-nadajnik "powershell -NoProfile -Command \\"Get-ChildItem 'C:\\Users\\nazir\\AppData\\Roaming\\obs-studio\\basic\\profiles' | Select-Object Name\\""`;
const res = execSync(cmd).toString();
console.log(res);
