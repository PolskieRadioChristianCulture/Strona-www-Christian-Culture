import fs from 'node:fs';

const filePath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/index.html';
let content = fs.readFileSync(filePath, 'utf8');

// 1. JSON-LD BroadcastChannel
const targetJsonLd = `"broadcastChannelId": "biblia_spiewana",\r
              "name": "Biblia Śpiewana (Wersety w Muzyce)",\r
              "broadcastServiceTier": "Free",\r
              "genre": "Biblical Songs, Scripture in Music, Uwielbienie"\r
            }`;

const replacementJsonLd = targetJsonLd + `,\r
            {\r
              "@type": "BroadcastChannel",\r
              "broadcastChannelId": "radio_cc_women",\r
              "name": "Radio CC Women (Miejsce Kobiet Takich Jak Ty)",\r
              "broadcastServiceTier": "Free",\r
              "genre": "Christian Women, Worship, Inspiracja, Rozmowy, Świadectwa"\r
            }`;

if (content.includes(targetJsonLd)) {
  content = content.replace(targetJsonLd, replacementJsonLd);
  console.log('✓ JSON-LD updated');
} else {
  console.error('Target JSON-LD not found');
}

// 2. Dropdown Menu
const targetDropdown = `<button class="dropdown-item" data-station-id="biblia_spiewana">\r
                                <span class="dot biblia-spiewana-accent" style="background: #D4A94A; box-shadow: 0 0 8px #D4A94A;"></span> Biblia Śpiewana\r
                            </button>`;

const replacementDropdown = targetDropdown + `\r
                            <button class="dropdown-item" data-station-id="radio_cc_women">\r
                                <span class="dot ccw-accent" style="background: #E83F94; box-shadow: 0 0 8px #E83F94;"></span> Radio CC Women\r
                            </button>`;

if (content.includes(targetDropdown)) {
  content = content.replace(targetDropdown, replacementDropdown);
  console.log('✓ Dropdown updated');
} else {
  console.error('Target Dropdown not found');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('index.html saved successfully');
