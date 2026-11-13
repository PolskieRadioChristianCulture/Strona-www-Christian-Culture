const fs = require('fs');

let lum = fs.readFileSync('lumina.html', 'utf8');

// 1. Fix "Na żywo w Chrystusie" subtitle
lum = lum.replace('<span></span> Na żywo w Chrystusie âś¨', '<span></span> Na żywo w Chrystusie ✨');

// 2. Fix the EMOJI DRAWER comment after toggleReactionPicker
const targetRe = /\/\/ â•+ EMOJI DRAWER[^\n]*/;
if (targetRe.test(lum)) {
  lum = lum.replace(targetRe, '// ══════════ EMOJI DRAWER DLA CZATU OGÓLNEGO ══════════');
  console.log('Replaced EMOJI DRAWER comment via regex');
} else {
  // Try finding the position right after toggleReactionPicker
  const idx = lum.indexOf('window.toggleReactionPicker = function');
  if (idx !== -1) {
    const endPicker = lum.indexOf('}, 60);', idx);
    if (endPicker !== -1) {
      const nextSemi = lum.indexOf('};', endPicker);
      const after = lum.slice(nextSemi, nextSemi + 150);
      console.log('After picker:', after);
      // Replace whatever comment is on the next line
      const commentStart = lum.indexOf('//', nextSemi);
      const commentEnd = lum.indexOf('\n', commentStart);
      lum = lum.slice(0, commentStart) + '// ══════════ EMOJI DRAWER DLA CZATU OGÓLNEGO ══════════' + lum.slice(commentEnd);
      console.log('Replaced comment after picker successfully');
    }
  }
}

fs.writeFileSync('lumina.html', lum, 'utf8');
console.log('Saved lumina.html');
