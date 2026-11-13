const fs = require('fs');

let js = fs.readFileSync('components/cc-global-chat-button.js', 'utf8');

const regex = /\.cc-hotspot\s*\{[\s\S]*?\.cc-hotspot:hover,\s*\.cc-hotspot:focus-visible\s*\{[\s\S]*?\}/;
const match = js.match(regex);
console.log('Regex match:', !!match);

const newCss = `.cc-hotspot {
        position: absolute !important;
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        cursor: pointer !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      .cc-hotspot:hover,
      .cc-hotspot:focus,
      .cc-hotspot:focus-visible,
      .cc-hotspot:active {
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
      }

      .cc-trio-card,
      .cc-trio-card:hover,
      .cc-trio-card:focus,
      .cc-trio-card.is-active,
      .cc-hotspot-pill1,
      .cc-hotspot-pill2,
      .cc-hotspot-pill3,
      .cc-hotspot-pill1:hover,
      .cc-hotspot-pill2:hover,
      .cc-hotspot-pill3:hover {
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
      }`;

if (match) {
  js = js.replace(regex, newCss);
  fs.writeFileSync('components/cc-global-chat-button.js', js, 'utf8');
  console.log('Replaced .cc-hotspot successfully via regex!');
} else {
  console.error('Regex did not match!');
  process.exit(1);
}
