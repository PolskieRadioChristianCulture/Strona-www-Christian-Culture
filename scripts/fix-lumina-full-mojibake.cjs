const fs = require('fs');

let content = fs.readFileSync('lumina.html', 'utf8');

const replacements = [
  [/Ä…/g, 'ą'],
  [/Ä‡/g, 'ć'],
  [/Ä™/g, 'ę'],
  [/Ĺ‚/g, 'ł'],
  [/Ĺ„/g, 'ń'],
  [/Ăł/g, 'ó'],
  [/Ĺ›/g, 'ś'],
  [/Ĺş/g, 'ź'],
  [/ĹĽ/g, 'ż'],
  [/Ä„/g, 'Ą'],
  [/Ä†/g, 'Ć'],
  [/Ä˜/g, 'Ę'],
  [/Ä\x98/g, 'Ę'],
  [/Ĺ\x81/g, 'Ł'],
  [/Ĺƒ/g, 'Ń'],
  [/Ă“/g, 'Ó'],
  [/Ĺš/g, 'Ś'],
  [/Ĺą/g, 'Ź'],
  [/Ĺ»/g, 'Ż'],
  [/â€˘/g, '•'],
  [/â€”/g, '—'],
  [/â€“/g, '–'],
  [/â†’/g, '→'],
  [/â†“/g, '↓'],
  [/â•\x90/g, '═'],
  [/â”€/g, '─'],
  [/đź•Šď¸Ź/g, '🕊️'],
  [/đźŽ§/g, '🎧'],
  [/đź“–/g, '📖'],
  [/đźŽ“/g, '🎓'],
  [/đź“ž/g, '📞'],
  [/đź’¬/g, '💬'],
  [/âœ¨/g, '✨']
];

for (const [re, rep] of replacements) {
  content = content.replace(re, rep);
}

// Remove any lingering C1 control chars
content = content.replace(/[\u0080-\u009f]/g, '');

fs.writeFileSync('lumina.html', content, 'utf8');
console.log('Full mojibake fix applied to lumina.html');
