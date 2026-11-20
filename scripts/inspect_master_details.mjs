import fs from 'fs';

const html = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/master-live.html', 'utf8');
const lines = html.split('\n');

console.log('Total lines:', lines.length);

lines.forEach((line, index) => {
    if (line.includes('livePrayerOverlay') || line.includes('mlL3') || line.includes('dekalog-brand') || line.includes('masterMuteToggleBtn') || line.includes('updateMasterLiveLanguage')) {
        console.log(`${index + 1}: ${line.trim()}`);
    }
});
