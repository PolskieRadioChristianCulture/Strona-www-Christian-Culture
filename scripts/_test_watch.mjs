const url = 'https://www.youtube.com/watch?v=ST_Y_Yve0Eo';
const res = await fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+667; SOCS=CAESHAgBEhJnd3NfMjAyMzA4MTAtMF9SQzIaAmVuIAEaBgiA_LyaBg'
  }
});
const html = await res.text();
console.log('isLiveNow:', html.includes('"isLiveNow":true'));
console.log('isLive:', html.includes('"isLive":true'));
console.log('status OK:', html.includes('"status":"OK"'));
const m = html.match(/<title>(.*?)<\/title>/);
console.log('TITLE:', m ? m[1] : 'none');
