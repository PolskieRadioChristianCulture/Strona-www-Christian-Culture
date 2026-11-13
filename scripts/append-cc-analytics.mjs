import { readFileSync, writeFileSync } from 'node:fs';

const vodPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/vod.html';
let vod = readFileSync(vodPath, 'utf8');
if (!vod.includes('/js/cc-analytics.js')) {
  vod = vod.replace("gtag('config', 'G-Y4EFTVBPE3', (function(){try{var s=location.search,k='cc_team';if(/[?&]cc_team=1/.test(s))localStorage.setItem(k,'1');if(/[?&]cc_team=0/.test(s))localStorage.removeItem(k);if(localStorage.getItem(k)==='1'||/[?&]in_mcr=1/.test(s)||window.obsstudio)return{traffic_type:'internal'}}catch(e){}return{}})());\n</script>", "gtag('config', 'G-Y4EFTVBPE3', (function(){try{var s=location.search,k='cc_team';if(/[?&]cc_team=1/.test(s))localStorage.setItem(k,'1');if(/[?&]cc_team=0/.test(s))localStorage.removeItem(k);if(localStorage.getItem(k)==='1'||/[?&]in_mcr=1/.test(s)||window.obsstudio)return{traffic_type:'internal'}}catch(e){}return{}})());\n</script><script src=\"/js/cc-analytics.js?v=20261026_1\" defer></script>");
  writeFileSync(vodPath, vod, 'utf8');
  console.log('vod cc-analytics: done');
}

const luminaPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lumina.html';
let lumina = readFileSync(luminaPath, 'utf8');
if (!lumina.includes('/js/cc-analytics.js')) {
  lumina = lumina.replace("gtag('config', 'G-Y4EFTVBPE3', (function(){try{var s=location.search,k='cc_team';if(/[?&]cc_team=1/.test(s))localStorage.setItem(k,'1');if(/[?&]cc_team=0/.test(s))localStorage.removeItem(k);if(localStorage.getItem(k)==='1'||/[?&]in_mcr=1/.test(s)||window.obsstudio)return{traffic_type:'internal'}}catch(e){}return{}})());\n</script>", "gtag('config', 'G-Y4EFTVBPE3', (function(){try{var s=location.search,k='cc_team';if(/[?&]cc_team=1/.test(s))localStorage.setItem(k,'1');if(/[?&]cc_team=0/.test(s))localStorage.removeItem(k);if(localStorage.getItem(k)==='1'||/[?&]in_mcr=1/.test(s)||window.obsstudio)return{traffic_type:'internal'}}catch(e){}return{}})());\n</script><script src=\"/js/cc-analytics.js?v=20261026_1\" defer></script>");
  writeFileSync(luminaPath, lumina, 'utf8');
  console.log('lumina cc-analytics: done');
}
