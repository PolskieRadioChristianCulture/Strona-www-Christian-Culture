const fs = require('fs');
const tab = fs.readFileSync('lumina-tablica.html', 'utf8');
const lum = fs.readFileSync('lumina.html', 'utf8');

const idxTab = tab.indexOf('window.toggleReactionPicker = function');
const idxLum = lum.indexOf('window.toggleReactionPicker = function');

console.log('=== TABLICA 2200-3000 ===\n', tab.slice(idxTab + 2200, idxTab + 3000));
console.log('=== LUMINA 2200-3000 ===\n', lum.slice(idxLum + 2200, idxLum + 3000));
