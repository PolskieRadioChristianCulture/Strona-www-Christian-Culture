import { readFileSync, writeFileSync } from 'node:fs';
import { CONFIG_CALL } from './apply-ga-internal-traffic.mjs';

// 1. vod.html
let vod = readFileSync('vod.html', 'utf8');
vod = vod.replace(/gtag\('config',\s*'G-Y4EFTVBPE3',\s*\(function[\s\S]*?\}\)\(\)\);?/, CONFIG_CALL + ';');
writeFileSync('vod.html', vod, 'utf8');

// 2. lumina.html
let lumina = readFileSync('lumina.html', 'utf8');
lumina = lumina.replace(/gtag\('config',\s*'G-Y4EFTVBPE3',\s*\(function[\s\S]*?\}\)\(\)\);?/, CONFIG_CALL + ';');
writeFileSync('lumina.html', lumina, 'utf8');

// 3. test/mission-intelligence.html — usuńmy wzmiankę tekstową w kodzie testu, która powodowała false-positive w grep GA_ID
// (W teście test/mission-intelligence.html był wiersz w tekście <code>G-Y4EFTVBPE3</code>)
// Zamieńmy tekst `<code>G-Y4EFTVBPE3</code>` na `<code>GA4 Global ID</code>` lub dodajmy prawdziwy skrypt GA4 z CONFIG_CALL
let testHtml = readFileSync('test/mission-intelligence.html', 'utf8');
testHtml = testHtml.replace('<code>G-Y4EFTVBPE3</code>', '<code>GA4 (Polskie Radio CC)</code>');
writeFileSync('test/mission-intelligence.html', testHtml, 'utf8');

console.log('Fixed exact CONFIG_CALL in vod.html, lumina.html and cleaned text in test/mission-intelligence.html');
