import { getAllEcosystemCandidates } from 'file:///C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/scripts/ccn_auto_broadcaster.mjs';

const candidates = getAllEcosystemCandidates();
const nonNews = candidates.filter(c => c.type !== 'news');
console.log('=== KLUCZOWE OGNIWA EKOSYSTEMU DO INTENSYWNEJ PROMOCJI ===');
nonNews.forEach(c => console.log(`[${c.type}] ${c.title} -> ${c.url}`));
