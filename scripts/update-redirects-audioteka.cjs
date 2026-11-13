const fs = require('fs');

if (fs.existsSync('_redirects')) {
  let red = fs.readFileSync('_redirects', 'utf8');
  if (!red.includes('/audioteka')) {
    const entry = '\n# === AUDIOTEKA CHRISTIAN CULTURE (Audiobiblioteka Wiary 0,00 zł) ===\n/audioteka /audioteka.html 200\n/audioteka/ /audioteka.html 200\n/Audioteka /audioteka.html 200\n/Audioteka/ /audioteka.html 200\n';
    fs.appendFileSync('_redirects', entry, 'utf8');
    console.log('Appended audioteka to _redirects');
  } else {
    console.log('audioteka already in _redirects');
  }
}
