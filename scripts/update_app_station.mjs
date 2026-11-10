import fs from 'node:fs';

const filePath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/app.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Dodaj stację do STATIONS
const targetStations = `        tracks: [\r
            "Śpiewane Przypowieści Salomona - Rozdział 1",\r
            "Śpiewane Przypowieści Salomona - Rozdział 2",\r
            "Śpiewane Przypowieści Salomona - Rozdział 3"\r
        ]\r
    }\r
};`;

const replacementStations = `        tracks: [\r
            "Śpiewane Przypowieści Salomona - Rozdział 1",\r
            "Śpiewane Przypowieści Salomona - Rozdział 2",\r
            "Śpiewane Przypowieści Salomona - Rozdział 3"\r
        ]\r
    },\r
    radio_cc_women: {\r
        id: "radio_cc_women",\r
        name: "RADIO CC WOMEN",\r
        shortName: "CCW",\r
        tagline: "Miejsce Kobiet Takich Jak Ty",\r
        streamUrl: "",\r
        accentColors: ["#E83F94", "#FF75B5"],\r
        logo: "./assets/ccw-icon.png",\r
        tracks: [\r
            "Radio CC Women — Miejsce Kobiet Takich Jak Ty",\r
            "Inspiracja, muzyka i słowo dla kobiet",\r
            "Pasmo modlitewne i refleksyjne",\r
            "Świadectwa wiary i rozmowy"\r
        ]\r
    }\r
};`;

if (content.includes(targetStations)) {
  content = content.replace(targetStations, replacementStations);
  console.log('✓ STATIONS object updated');
} else {
  console.error('Target STATIONS not found');
}

// 2. Obsługa braku targetUrl w playRadio
const targetPlay = `    if (targetUrl) {\r
        if (currentAudioUrl !== targetUrl || !audio.src) {\r
            audio.src = targetUrl;\r
            currentAudioUrl = targetUrl;\r
        }\r
        if (seekOffset > 0) {\r
            try { audio.currentTime = seekOffset; } catch(e) {}\r
        }\r
    }\r
    \r
    const playPromise = audio.play();`;

const replacementPlay = `    if (!targetUrl) {\r
        audio.pause();\r
        audio.removeAttribute('src');\r
        currentAudioUrl = "";\r
        playerTrackTitle.textContent = \`\${activeStation.name} — \${activeStation.tagline || 'Wkrótce emisja 24/7'}\`;\r
        playerStatusText.textContent = "Oczekuje na emisję";\r
        isPlaying = false;\r
        updatePlayerUI(false);\r
        return;\r
    }\r
\r
    if (targetUrl) {\r
        if (currentAudioUrl !== targetUrl || !audio.src) {\r
            audio.src = targetUrl;\r
            currentAudioUrl = targetUrl;\r
        }\r
        if (seekOffset > 0) {\r
            try { audio.currentTime = seekOffset; } catch(e) {}\r
        }\r
    }\r
    \r
    const playPromise = audio.play();`;

if (content.includes(targetPlay)) {
  content = content.replace(targetPlay, replacementPlay);
  console.log('✓ playRadio handling updated');
} else {
  console.error('Target playRadio not found');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('app.js saved successfully');
