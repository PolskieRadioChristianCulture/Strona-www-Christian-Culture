import fs from 'node:fs';

const files = [
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/akademia/kurscodzienny/dzien-44.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/akademia/kurscodzienny/dzien-44/index.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy/kurscodzienny/dzien-44.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy/kurscodzienny/dzien-44/index.html'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    const oldVerse = '„Jeden drugiego nie widział i nikt nie wstał ze swego miejsca przez trzy dni; lecz wszyscy synowie Izraela mieli światło w swoich mieszkaniach.”';
    const newVerse = '„PAN będzie za was walczył, a wy będziecie milczeć.”';
    if (c.includes(oldVerse)) {
      c = c.replace(oldVerse, newVerse);
      fs.writeFileSync(f, c, 'utf8');
      console.log('Fixed verse in:', f);
    } else {
      console.log('Not found in:', f);
    }
  } else {
    console.log('File does not exist:', f);
  }
}
