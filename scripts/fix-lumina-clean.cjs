const fs = require('fs');

let content = fs.readFileSync('lumina.html', 'utf8');

// Also sync the 3 functions from lumina-tablica.html
function extractFunctionBody(src, fnName) {
  const idx = src.indexOf('window.' + fnName + ' = function');
  const idx2 = idx === -1 ? src.indexOf('function ' + fnName + '(') : idx;
  if (idx2 === -1) return null;
  const braceStart = src.indexOf('{', idx2);
  if (braceStart === -1) return null;
  let depth = 0, i = braceStart;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    if (src[i] === '}') { depth--; if (depth === 0) break; }
  }
  return src.slice(idx2, i + 1);
}

const tablica = fs.readFileSync('lumina-tablica.html', 'utf8');
for (const fn of ['resolveChatAvatar', 'renderPublicChatMessages', 'renderDirectChatMessages']) {
  const tabBody = extractFunctionBody(tablica, fn);
  const lumBody = extractFunctionBody(content, fn);
  if (tabBody && lumBody) {
    content = content.replace(lumBody, tabBody);
    console.log('Synced function', fn);
  }
}

// Fix mojibake lines where C1 chars occur
const lines = content.split('\n');
let fixedCount = 0;
for (let i = 0; i < lines.length; i++) {
  if (/[\u0080-\u009f]/.test(lines[i])) {
    try {
      const decoded = Buffer.from(lines[i], 'binary').toString('utf8');
      // If decoded doesn't have replacement character \uFFFD and has fewer or 0 C1 chars, use it
      if (!decoded.includes('\uFFFD') && (!/[\u0080-\u009f]/.test(decoded) || (decoded.match(/[\u0080-\u009f]/g) || []).length < (lines[i].match(/[\u0080-\u009f]/g) || []).length)) {
        lines[i] = decoded;
        fixedCount++;
      } else {
        // Strip or replace stray C1 chars in comments/strings
        lines[i] = lines[i].replace(/[\u0080-\u009f]/g, '');
        fixedCount++;
      }
    } catch(e) {
      lines[i] = lines[i].replace(/[\u0080-\u009f]/g, '');
      fixedCount++;
    }
  }
}

content = lines.join('\n');
fs.writeFileSync('lumina.html', content, 'utf8');
console.log('Fixed lines in lumina.html:', fixedCount);
