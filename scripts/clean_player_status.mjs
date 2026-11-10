import fs from 'node:fs';

const filePath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/app.js';
let code = fs.readFileSync(filePath, 'utf8');

// Replace "Odtwarza (YouTube)" with ""
code = code.replaceAll('playerStatusText.textContent = "Odtwarza (YouTube)";', 'playerStatusText.textContent = "";');

// Replace "Błąd odtwarzania YouTube" with "Błąd strumienia"
code = code.replaceAll('playerStatusText.textContent = "Błąd odtwarzania YouTube";', 'playerStatusText.textContent = "Błąd strumienia";');

// Replace "Ładowanie YouTube…" with "Łączenie..."
code = code.replaceAll('playerStatusText.textContent = "Ładowanie YouTube…";', 'playerStatusText.textContent = "Łączenie...";');

// Replace "Ładowanie playlisty…" with "Łączenie..."
code = code.replaceAll('playerStatusText.textContent = "Ładowanie playlisty…";', 'playerStatusText.textContent = "Łączenie...";');

// Replace "Odtwarza" with ""
code = code.replaceAll('playerStatusText.textContent = "Odtwarza";', 'playerStatusText.textContent = "";');

// Replace "Zatrzymany" with ""
code = code.replaceAll('playerStatusText.textContent = "Zatrzymany";', 'playerStatusText.textContent = "";');

fs.writeFileSync(filePath, code, 'utf8');
console.log('✓ app.js successfully cleaned of ODTWARZA / YouTube statuses');
