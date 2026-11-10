import fs from 'node:fs';

const filePath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/player.html';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replaceAll("playbackStatus('YouTube nie udostępnił tej playlisty. Wybierz inną.');", "playbackStatus('Strumień chwilowo niedostępny. Wybierz inną stację.');");
code = code.replaceAll("playbackStatus('Odtwarzanie YouTube');", "playbackStatus('Odtwarzanie radia');");
code = code.replaceAll("playbackStatus('Buforowanie YouTube…');", "playbackStatus('Buforowanie…');");
code = code.replaceAll("playbackStatus('Ładowanie YouTube…');", "playbackStatus('Ładowanie radia…');");
code = code.replaceAll("playbackStatus('Włączono losową kolejność playlisty YouTube');", "playbackStatus('Włączono losową kolejność');");

fs.writeFileSync(filePath, code, 'utf8');
console.log('✓ player.html successfully cleaned of user-facing YouTube mentions');
