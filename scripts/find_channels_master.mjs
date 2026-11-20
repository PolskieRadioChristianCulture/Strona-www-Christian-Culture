import fs from 'fs';

const html = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/master-live.html', 'utf8');

const regex = /(?:src|url|channel|schedule)[\w\s:=,"'./-]{0,100}\.html/gi;
const matches = html.match(regex) || [];
console.log('Matches:', [...new Set(matches)].slice(0, 30));
