const fs = require('fs');

let tab = fs.readFileSync('lumina-tablica.html', 'utf8');
let lum = fs.readFileSync('lumina.html', 'utf8');

function extractFunction(src, name) {
  const start = src.indexOf('window.' + name + ' = function');
  if (start === -1) return null;
  const brace = src.indexOf('{', start);
  let depth = 0, i = brace;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    if (src[i] === '}') { depth--; if (depth === 0) break; }
  }
  return src.slice(start, i + 1);
}

const tabPicker = extractFunction(tab, 'toggleReactionPicker');
const lumPicker = extractFunction(lum, 'toggleReactionPicker');

if (tabPicker && lumPicker) {
  lum = lum.replace(lumPicker, tabPicker);
  fs.writeFileSync('lumina.html', lum, 'utf8');
  console.log('Replaced toggleReactionPicker in lumina.html successfully!');
} else {
  console.error('Could not extract toggleReactionPicker');
  process.exit(1);
}
