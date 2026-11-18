import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';

// @007 2026-11-18: /nadawaj w nowej wersji (L0 17.11, ae923b3f) — karty kanałów budowane w JS z tablic G i V.
const html = readFileSync('nadawaj.html', 'utf8');
const registry = JSON.parse(readFileSync('data/cc-channels.json', 'utf8')).channels.filter(c => c.kind === 'broadcast');
const files = [...html.matchAll(/\{f:'([^']+\.html)'/g)].map(m => m[1]);
const strip = (url) => url.replace(/^\//, '').replace(/\.html$/, '');

test('każda scena w katalogu prowadzi do istniejącego pliku i występuje raz', () => {
  assert.ok(files.length >= 19, 'za mało scen: ' + files.length);
  const seen = new Set();
  for (const file of files) {
    assert.ok(existsSync(file), file);
    assert.equal(seen.has(file), false, file);
    seen.add(file);
  }
});

test('oficjalne numery kanałów 1–17 zgadzają się z rejestrem data/cc-channels.json', () => {
  const map = JSON.parse(html.match(/const CC_NUM=(\{[^;]+\});/)[1]);
  for (const ch of registry) {
    for (const url of [ch.url, ...(ch.aliases || [])]) assert.equal(map[strip(url)], ch.number, url);
  }
  assert.match(html, /data-cc-channel-number=/);
});

test('OBS i kod osadzenia używają dokładnie adresu sceny, bez odtwarzaczy w kartach', () => {
  assert.ok(html.includes('data-copy="${BASE}${x.f}" data-what="URL dla OBS"'));
  assert.ok(html.includes('<iframe src="${BASE}${x.f}"'));
  const tpl = html.slice(html.indexOf('const card=x=>'), html.indexOf("document.getElementById('groups')"));
  assert.doesNotMatch(tpl.replace(/data-copy='<iframe[^']*'/, ''), /<iframe|<video|<audio/);
});

test('katalog nie udaje trwającej transmisji i działa na wąskim ekranie', () => {
  assert.doesNotMatch(html, /OGLĄDAJ NA ŻYWO|WATCH LIVE|Uruchom w OBS/);
  assert.match(html, /Katalog nie jest wskaźnikiem trwającej transmisji/);
  assert.ok(html.includes('@media (max-width:620px){.grid{grid-template-columns:minmax(0,1fr)}'));
  assert.ok(html.includes('min-height:44px'));
});

test('Apocalypse lesson count matches the actual registry and runtime uses its length', () => {
  const scene = readFileSync('apokalipsa-ksiega-nadziei-live.html', 'utf8');
  const registry = scene.match(/const LESSONS_25\s*=\s*(\[[\s\S]*?\n        \]);/);
  assert.ok(registry);
  const lessons = vm.runInNewContext(registry[1]);
  assert.equal(lessons.length, 28);
  assert.equal(new Set(lessons.map(l => l.id)).size, 28);
  assert.equal(lessons[27].id, '2JjWOb3bWiA');
  const canonical = JSON.parse(readFileSync('data/kurs-apokalipsa-odcinki.json', 'utf8')).episodesChronological;
  assert.deepEqual(Array.from(lessons.slice(0,25), l => l.id), canonical.map(l => l.videoId));
  // Total series count confirmed directly by owner on 2026-10-17;
  // selectable player count must still come from actually registered recordings.
  assert.match(html, /28 lekcji cyklu/);
  assert.match(scene, /lesson.ep \+ ' \/ ' \+ LESSONS_25.length/);
  assert.doesNotMatch(scene, /% 25\b|z 25'|LEKCJA 1 \/ 25/);
});

test('player loads all registered videos, starts at lesson 28 and wraps to lesson 1', () => {
  const scene = readFileSync('apokalipsa-ksiega-nadziei-live.html', 'utf8');
  const registry = scene.match(/const LESSONS_25\s*=\s*(\[[\s\S]*?\n        \]);/)[1];
  const init = scene.slice(scene.indexOf('        function onYouTubeIframeAPIReady()'), scene.indexOf("        window.addEventListener('message'"));
  const state = scene.slice(scene.indexOf('        function onPlayerStateChange(event)'), scene.indexOf('        function enableAudio()'));
  let config, loaded, playedIndex;
  const player = {loadPlaylist: options => {loaded = options;}, playVideo(){}, mute(){}, getPlaylistIndex:()=>27, playVideoAt: index=>{playedIndex=index;}};
  const win = {location:{origin:'https://polskieradio.cc',search:'?muted=1'}};
  win.self=win; win.top=win;
  const ctx = vm.createContext({window:win, document:{}, console, URLSearchParams, getDayOfYear:()=>28,
    updateEpisodeUI(){}, disableCaptions(){}, resetAutoFadeTimer(){}, setTimeout(){},
    YT:{Player:function(id, options){config=options;return player;},PlayerState:{ENDED:0,PLAYING:1,BUFFERING:3}},
    player, initialJumpDone:false});
  vm.runInContext('const LESSONS_25 = '+registry+';\n'+init+'\n'+state, ctx);
  ctx.onYouTubeIframeAPIReady();
  assert.equal(config.videoId, '2JjWOb3bWiA');
  ctx.onPlayerReady({target:player});
  assert.equal(loaded.playlist.length,28);
  assert.equal(loaded.playlist[27],'2JjWOb3bWiA');
  assert.equal(loaded.index,27);
  ctx.onPlayerStateChange({data:0});
  assert.equal(playedIndex,0);
});

test('initial dates never flash an obsolete July date; global Bible title is accurate', () => {
  for (const file of ['cctv24-worship.html', 'bibleaudio-global.html']) {
    assert.match(readFileSync(file, 'utf8'), /id="clockDateLabel">—<\/div>/);
    assert.match(readFileSync(file, 'utf8'), /id="timeHour">--<\/span>/);
  }
  assert.match(readFileSync('bibleaudio-global.html', 'utf8'), /<title>Bible Audio Global \| Christian Culture<\/title>/);
});
