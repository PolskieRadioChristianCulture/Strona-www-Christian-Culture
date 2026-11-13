import { readFileSync, writeFileSync } from 'node:fs';

const vodPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/vod.html';
let vod = readFileSync(vodPath, 'utf8');
const vodTarget = 'gtag(\'config\', \'G-Y4EFTVBPE3\'';
const vodIdx = vod.indexOf(vodTarget);
if (vodIdx !== -1) {
  const scriptEnd = vod.indexOf('</script>', vodIdx);
  if (scriptEnd !== -1) {
    const afterScript = scriptEnd + '</script>'.length;
    if (!vod.slice(afterScript, afterScript + 100).includes('cc-analytics.js')) {
      vod = vod.slice(0, afterScript) + '<script src="/js/cc-analytics.js?v=20261026_1" defer></script>' + vod.slice(afterScript);
      writeFileSync(vodPath, vod, 'utf8');
      console.log('vod: cc-analytics added');
    }
  }
}

const luminaPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lumina.html';
let lumina = readFileSync(luminaPath, 'utf8');
const luminaTarget = 'gtag(\'config\', \'G-Y4EFTVBPE3\'';
const luminaIdx = lumina.indexOf(luminaTarget);
if (luminaIdx !== -1) {
  const scriptEnd = lumina.indexOf('</script>', luminaIdx);
  if (scriptEnd !== -1) {
    const afterScript = scriptEnd + '</script>'.length;
    if (!lumina.slice(afterScript, afterScript + 100).includes('cc-analytics.js')) {
      lumina = lumina.slice(0, afterScript) + '<script src="/js/cc-analytics.js?v=20261026_1" defer></script>' + lumina.slice(afterScript);
      writeFileSync(luminaPath, lumina, 'utf8');
      console.log('lumina: cc-analytics added');
    }
  }
}
