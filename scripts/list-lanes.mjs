import fs from 'node:fs';

const p = 'C:/Users/czark/Desktop/@ICC/Misja CC/JOMA_SHARED_MEMORY/SKRZYNKA/narzedzia/build-cc-workflows.mjs';
const code = fs.readFileSync(p, 'utf8');

const regex = /workflowId:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"[\s\S]*?laneLabel:\s*"([^"]+)"[\s\S]*?laneY:\s*(-?\d+)/g;
let m;
const list = [];
while ((m = regex.exec(code)) !== null) {
  list.push({ y: parseInt(m[4], 10), title: m[2], id: m[1] });
}
list.sort((a, b) => a.y - b.y);
console.log('Lanes in OpenBot sorted by Y position:');
for (const item of list) {
  console.log(`${String(item.y).padStart(6, ' ')} px | ${item.title}`);
}
