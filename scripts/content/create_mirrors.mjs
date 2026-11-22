import fs from 'fs';
import path from 'path';

const ROOT = 'c:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';

const mirrors = [
  // 01 Niedziela handlowa -> biblia, em
  {
    src: 'news/czy-katolik-powinien-uznawac-niedziele-handlowa/index.html',
    destinations: [
      'biblia/czy-katolik-powinien-uznawac-niedziele-handlowa',
      'em/czy-katolik-powinien-uznawac-niedziele-handlowa'
    ]
  },
  // 02 Trybunał -> biblia
  {
    src: 'news/trybunal-konstytucyjny-czy-najwyzszy-jest-jeszcze-sad/index.html',
    destinations: [
      'biblia/trybunal-konstytucyjny-czy-najwyzszy-jest-jeszcze-sad'
    ]
  },
  // 03 Fundusz sprawiedliwości -> biblia
  {
    src: 'finanse/fundusz-sprawiedliwosci-ktorego-nie-znasz/index.html',
    destinations: [
      'biblia/fundusz-sprawiedliwosci-ktorego-nie-znasz'
    ]
  },
  // 04 Okno życia -> em, rodzina, biblia
  {
    src: 'news/okno-zycia-wola-takze-do-ciebie/index.html',
    destinations: [
      'em/okno-zycia-wola-takze-do-ciebie',
      'rodzina/okno-zycia-wola-takze-do-ciebie',
      'biblia/okno-zycia-wola-takze-do-ciebie'
    ]
  }
];

for (const m of mirrors) {
  const srcPath = path.join(ROOT, m.src);
  if (!fs.existsSync(srcPath)) {
    console.error(`Source missing: ${m.src}`);
    continue;
  }
  const content = fs.readFileSync(srcPath, 'utf8');
  for (const dst of m.destinations) {
    const dstDir = path.join(ROOT, dst);
    fs.mkdirSync(dstDir, { recursive: true });
    fs.writeFileSync(path.join(dstDir, 'index.html'), content, 'utf8');
    fs.writeFileSync(path.join(ROOT, `${dst}.html`), content, 'utf8');
    console.log(`Created mirror: ${dst} (.html and /index.html)`);
  }
}
