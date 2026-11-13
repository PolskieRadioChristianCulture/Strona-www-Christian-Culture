const fs = require('fs');

let lumina = fs.readFileSync('lumina.html', 'utf8');

// 1. Fix guestNav aria-labels
lumina = lumina.replace('aria-label="Zaloguj siÄ™ do LUMINA"', 'aria-label="Zaloguj się do LUMINA"');
lumina = lumina.replace('title="Zaloguj siÄ™ do LUMINA"', 'title="Zaloguj się do LUMINA"');
lumina = lumina.replace('aria-label="OtwĂłrz TablicÄ™ LUMINA"', 'aria-label="Otwórz Tablicę LUMINA"');
lumina = lumina.replace('title="Tablica LUMINA"', 'title="Tablica LUMINA"');

// 2. Fix reaction toast text
lumina = lumina.replace(
  "showToast('Zaloguj siÄ™, aby dodawaÄ‡ reakcje na wiadomoĹ›ci! đź•Šď¸Ź');",
  "showToast('Zaloguj się, aby dodawać reakcje na wiadomości! 🕊️');"
);
lumina = lumina.replace(
  "window.showToast('Zaloguj siÄ™, aby dodawaÄ‡ reakcje na wiadomoĹ›ci! đź•Šď¸Ź');",
  "window.showToast('Zaloguj się, aby dodawać reakcje na wiadomości! 🕊️');"
);

fs.writeFileSync('lumina.html', lumina, 'utf8');
console.log('Fixed lumina.html strings for lumina-straznik test.');
