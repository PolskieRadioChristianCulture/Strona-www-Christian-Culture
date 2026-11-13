import { readFileSync, writeFileSync } from 'node:fs';

const internalParam = "(function(){try{var s=location.search,k='cc_team';if(/[?&]cc_team=1/.test(s))localStorage.setItem(k,'1');if(/[?&]cc_team=0/.test(s))localStorage.removeItem(k);if(localStorage.getItem(k)==='1'||/[?&]in_mcr=1/.test(s)||window.obsstudio)return{traffic_type:'internal'}}catch(e){}return{}})()";

// 1. vod.html
const vodPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/vod.html';
let vod = readFileSync(vodPath, 'utf8');
const oldVod = "gtag('config', 'G-M24C85RG49');";
const newVod = `gtag('config', 'G-M24C85RG49', ${internalParam});\n  gtag('config', 'G-Y4EFTVBPE3', ${internalParam});`;
if (vod.includes(oldVod)) {
  vod = vod.replace(oldVod, newVod);
  if (!vod.includes('/js/cc-analytics.js')) {
    vod = vod.replace('</script>\n\n    <meta charset="UTF-8">', '</script><script src="/js/cc-analytics.js?v=20261026_1" defer></script>\n\n    <meta charset="UTF-8">');
  }
  writeFileSync(vodPath, vod, 'utf8');
  console.log('vod.html: OK');
} else {
  console.log('vod.html: old pattern not found');
}

// 2. lumina.html
const luminaPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lumina.html';
let lumina = readFileSync(luminaPath, 'utf8');
const oldLumina = "gtag('config', 'G-M24C85RG49');";
const newLumina = `gtag('config', 'G-M24C85RG49', ${internalParam});\n  gtag('config', 'G-Y4EFTVBPE3', ${internalParam});`;
if (lumina.includes(oldLumina)) {
  lumina = lumina.replace(oldLumina, newLumina);
  if (!lumina.includes('/js/cc-analytics.js')) {
    lumina = lumina.replace('</script>\n    <meta charset="UTF-8">', '</script><script src="/js/cc-analytics.js?v=20261026_1" defer></script>\n    <meta charset="UTF-8">');
  }
  writeFileSync(luminaPath, lumina, 'utf8');
  console.log('lumina.html: OK');
} else {
  console.log('lumina.html: old pattern not found');
}

// 3. test/mission-intelligence.html (naprawienie zgłoszonego przez apply-ga-internal-traffic)
const testPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/test/mission-intelligence.html';
try {
  let t = readFileSync(testPath, 'utf8');
  if (t.includes("gtag('config', 'G-Y4EFTVBPE3');")) {
    t = t.replace("gtag('config', 'G-Y4EFTVBPE3');", `gtag('config','G-Y4EFTVBPE3',${internalParam});`);
    if (!t.includes('/js/cc-analytics.js')) {
      t = t.replace('</script>', '</script><script src="/js/cc-analytics.js?v=20261026_1" defer></script>');
    }
    writeFileSync(testPath, t, 'utf8');
    console.log('test/mission-intelligence.html: OK');
  }
} catch (e) {
  console.log('test/mission-intelligence.html error:', e.message);
}
