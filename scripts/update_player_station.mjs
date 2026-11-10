import fs from 'node:fs';

const filePath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/player.html';
let content = fs.readFileSync(filePath, 'utf8');

const isCrlf = content.includes('\r\n');
const eol = isCrlf ? '\r\n' : '\n';

// 1. Sidebar - under Clash of Minds
const sideTarget = [
    '                        <!-- Clash of Minds (Walter Veith) -->',
    '                        <div onclick="playStation(\'clashofminds\')" id="side-item-clashofminds" class="channel-side-item group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition hover:bg-white/5 border border-transparent hover:border-white/10">',
    '                            <div class="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:scale-105 transition">',
    '                                <i class="fa-solid fa-scroll text-sm"></i>',
    '                            </div>',
    '                            <div class="flex-1 min-w-0">',
    '                                <div class="flex items-center justify-between">',
    '                                    <span class="text-xs font-bold text-gray-200 group-hover:text-white truncate">Clash of Minds</span>',
    '                                    <span class="text-[9px] font-bold text-amber-400">• PROROCTWA</span>',
    '                                </div>',
    '                                <p class="text-[10px] text-gray-400 truncate">Walter Veith · What\'s Up Prof?</p>',
    '                            </div>',
    '                        </div>'
].join(eol);

const sideReplacement = [
    sideTarget,
    '',
    '                        <!-- Radio CC Women -->',
    '                        <div onclick="playStation(\'ccwomen\')" id="side-item-ccwomen" class="channel-side-item group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition hover:bg-white/5 border border-transparent hover:border-white/10">',
    '                            <div class="w-9 h-9 rounded-lg overflow-hidden border border-[#E83F94]/40 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-sm bg-[#2A072A]">',
    '                                <img src="/assets/ccw-icon.png" alt="Radio CC Women" class="w-full h-full object-cover">',
    '                            </div>',
    '                            <div class="flex-1 min-w-0">',
    '                                <div class="flex items-center justify-between">',
    '                                    <span class="text-xs font-bold text-gray-200 group-hover:text-pink-300 truncate">Radio CC Women</span>',
    '                                    <span class="text-[9px] font-bold text-[#FF75B5]">• LIVE</span>',
    '                                </div>',
    '                                <p class="text-[10px] text-gray-400 truncate">Miejsce Kobiet Takich Jak Ty</p>',
    '                            </div>',
    '                        </div>'
].join(eol);

// 2. Channels Grid - unique target with data-category="Christian Culture TV Rozmowy"
const gridTarget = 'data-category="Christian Culture TV Rozmowy">';
const gridCardSnippet = [
    'data-category="Christian Culture TV Rozmowy">',
    '                        <div class="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500">',
    '                            <img loading="lazy" decoding="async" src="/images/player/art-chan-slowo.jpg?v=2" alt="Słowo" class="w-full h-full object-cover object-center">',
    '                            <div class="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-[#0a0f1d]/40 to-transparent"></div>',
    '                        </div>',
    '                        <div class="relative z-10 flex items-center justify-between">',
    '                            <div class="w-7 h-7 rounded-lg bg-teal-500/30 backdrop-blur-md flex items-center justify-center text-teal-300 text-xs">',
    '                                <i class="fa-solid fa-comment-dots"></i>',
    '                            </div>',
    '                            <span class="px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[9px] font-bold">Studio DS</span>',
    '                        </div>',
    '                        <div class="relative z-10">',
    '                            <h3 class="font-bold text-sm text-white group-hover:text-amber-300 transition">Radio Słowo</h3>',
    '                            <p class="text-[10px] text-gray-300 mt-0.5 line-clamp-1">Komentarze · Rozmowy · Tematy</p>',
    '                            <div class="mt-2.5 flex items-center justify-between">',
    '                                <span class="text-[9px] font-medium text-teal-300/80">Audycje CC</span>',
    '                                <div class="w-8 h-8 rounded-full gold-button-gradient flex items-center justify-center text-gray-950 text-xs shadow-lg group-hover:scale-110 transition">',
    '                                    <i class="fa-solid fa-play"></i>',
    '                                </div>',
    '                            </div>',
    '                        </div>',
    '                    </div>'
].join(eol);

const gridReplacement = [
    gridCardSnippet,
    '',
    '                    <!-- Radio CC Women -->',
    '                    <div onclick="playStation(\'ccwomen\')" class="channel-card group glass-panel rounded-2xl overflow-hidden cursor-pointer glass-card-hover border border-pink-500/20 hover:border-pink-500/50 relative flex flex-col justify-between p-3.5 aspect-[4/5] bg-gradient-to-b from-[#2A072A] to-[#120315]" data-category="Wszystkie CC Women Kobiety Live Muzyka">',
    '                        <div class="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500">',
    '                            <img loading="lazy" decoding="async" src="/images/player/art-chan-ccwomen.jpg" alt="Radio CC Women" class="w-full h-full object-cover object-center">',
    '                            <div class="absolute inset-0 bg-gradient-to-t from-[#120315] via-[#120315]/40 to-transparent"></div>',
    '                        </div>',
    '                        <div class="relative z-10 flex items-center justify-between">',
    '                            <div class="w-7 h-7 rounded-lg overflow-hidden border border-[#E83F94]/40 flex items-center justify-center bg-[#2A072A] shadow-sm">',
    '                                <img src="/assets/ccw-icon.png" alt="CCW" class="w-full h-full object-cover">',
    '                            </div>',
    '                            <span class="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[9px] font-bold">CC Women</span>',
    '                        </div>',
    '                        <div class="relative z-10">',
    '                            <h3 class="font-bold text-sm text-white group-hover:text-pink-300 transition">Radio CC Women</h3>',
    '                            <p class="text-[10px] text-gray-300 mt-0.5 line-clamp-1">Miejsce Kobiet Takich Jak Ty</p>',
    '                            <div class="mt-2.5 flex items-center justify-between">',
    '                                <span class="text-[9px] font-medium text-pink-300/90">Inspiracja & Słowo</span>',
    '                                <div class="w-8 h-8 rounded-full bg-gradient-to-r from-[#E83F94] to-[#FF75B5] flex items-center justify-center text-white text-xs shadow-lg group-hover:scale-110 transition">',
    '                                    <i class="fa-solid fa-play"></i>',
    '                                </div>',
    '                            </div>',
    '                        </div>',
    '                    </div>'
].join(eol);

// 3. LIVE_STATIONS
const stationsTarget = '            clashofminds: {';
const stationsReplacement = [
    '            ccwomen: {',
    '                id: \'ccwomen\',',
    '                title: \'Radio CC Women\',',
    '                subtitle: \'Miejsce Kobiet Takich Jak Ty\',',
    '                type: \'live\',',
    '                streamUrl: \'\',',
    '                badge: \'CC Women\',',
    '                heroBadge: \'RADIO CC WOMEN\',',
    '                cover: \'/assets/ccw-icon.png\',',
    '                heroImg: \'/images/player/art-chan-ccwomen.jpg\',',
    '                headline: \'Miejsce Kobiet Takich Jak Ty: <span class="gold-gradient-text">Radio CC Women</span>.\',',
    '                desc: \'Muzyka, inspiracje, rozmowy i duchowe wsparcie dla kobiet każdego dnia.\',',
    '                ticker: \'Radio CC Women — Miejsce Kobiet Takich Jak Ty\',',
    '                timeText: \'RADIO LIVE\'',
    '            },',
    '            clashofminds: {'
].join(eol);

// 4. playStation streamUrl check
const playStationTarget = [
    '            if (st.type === \'live\') {',
    '                switchEngine(\'native\');',
    '                spectrum?.prepare();',
    '                nativeAudio.src = st.streamUrl + \'?t=\' + Date.now();'
].join(eol);

const playStationReplacement = [
    '            if (st.type === \'live\') {',
    '                switchEngine(\'native\');',
    '                spectrum?.prepare();',
    '                if (!st.streamUrl) {',
    '                    nativeAudio.pause();',
    '                    nativeAudio.removeAttribute(\'src\');',
    '                    setPlaybackState(false);',
    '                    playbackStatus(\'Oczekuje na inaugurację emisji 24/7\');',
    '                    return;',
    '                }',
    '                nativeAudio.src = st.streamUrl + \'?t=\' + Date.now();'
].join(eol);

let updated = content;

if (updated.includes(sideTarget)) {
    updated = updated.replace(sideTarget, sideReplacement);
    console.log('✓ Sidebar updated');
} else {
    console.error('✗ sideTarget not found');
}

if (updated.includes(gridCardSnippet)) {
    updated = updated.replace(gridCardSnippet, gridReplacement);
    console.log('✓ Channels Grid updated');
} else {
    console.error('✗ gridCardSnippet not found');
}

if (updated.includes(stationsTarget)) {
    updated = updated.replace(stationsTarget, stationsReplacement);
    console.log('✓ LIVE_STATIONS updated');
} else {
    console.error('✗ stationsTarget not found');
}

if (updated.includes(playStationTarget)) {
    updated = updated.replace(playStationTarget, playStationReplacement);
    console.log('✓ playStation logic updated');
} else {
    console.error('✗ playStationTarget not found');
}

fs.writeFileSync(filePath, updated, 'utf8');
console.log('player.html successfully written');
