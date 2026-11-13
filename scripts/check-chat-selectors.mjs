import fs from 'node:fs';

const code = fs.readFileSync('components/cc-global-chat-button.js', 'utf8');
const idMatches = [...code.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
const uniqueIds = [...new Set(idMatches)];
console.log('Unique IDs queried with getElementById:');
console.log(uniqueIds.sort());

const qsMatches = [...code.matchAll(/querySelector\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
console.log('Unique querySelectors:');
console.log([...new Set(qsMatches)].filter(s => s.startsWith('#') || s.startsWith('.')).sort());
