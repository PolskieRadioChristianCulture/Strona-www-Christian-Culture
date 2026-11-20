import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Cinzel:wght@700;800&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background: #000; color: #fff; font-family: 'Montserrat', sans-serif; }
    .top-ticker-track {
      width: 1500px;
      height: 84px;
      overflow: hidden;
      display: flex;
      align-items: center;
    }
    .top-ticker-inner {
      display: inline-flex;
      white-space: nowrap;
      animation: continuousScroll 120s linear infinite;
    }
    .top-ticker-group {
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
      font-size: 25px;
      font-weight: 700;
      letter-spacing: 0.8px;
    }
    .top-ticker-group span {
      display: inline-block;
      margin-right: 70px;
    }
    .ticker-sig { color: #f5d77f; font-weight: 800; margin-right: 8px; }
    .ticker-sep { color: rgba(245, 215, 127, 0.6); margin: 0 10px; }
    .ticker-highlight { color: #f5d77f; font-weight: 800; }

    @keyframes continuousScroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  </style>
  </head>
  <body>
    <div class="top-ticker-track">
      <div class="top-ticker-inner" id="inner">
        <div class="top-ticker-group" id="g1">
          <span><strong class="ticker-sig">J 14,27</strong><span class="ticker-sep">•</span>„Pokój zostawiam wam, pokój mój daję wam. Nie tak jak daje świat, Ja wam daję. Niech się nie trwoży serce wasze ani się nie lęka.”</span>
          <span><strong class="ticker-sig">Flp 4,6-7</strong><span class="ticker-sep">•</span>„O nic się zbytnio nie troskajcie, ale we wszystkim w modlitwie i błaganiu z dziękczynieniem powierzcie prośby wasze Bogu.”</span>
          <span><strong class="ticker-sig">WSPARCIE MISJI</strong><span class="ticker-sep">•</span>Pomóż nam budować niezależne chrześcijańskie media w Polsce: <strong class="ticker-highlight">https://polskieradio.cc/wspieraj</strong> • Szybki BLIK: <strong>537 137 043</strong></span>
          <span><strong class="ticker-sig">Mt 11,28</strong><span class="ticker-sep">•</span>„Pójdźcie do Mnie wszyscy, którzy utrudzeni i obciążeni jesteście, a Ja wam dam ukojenie.”</span>
          <span><strong class="ticker-sig">Iz 26,3</strong><span class="ticker-sep">•</span>„Temu, którego myśl jest stała, zachowujesz pokój, pokój, bo tobie zaufał.”</span>
          <span><strong class="ticker-sig">PORTAL LUMINA</strong><span class="ticker-sep">•</span>Dołącz do wolnej społeczności wierzących: <strong class="ticker-highlight">https://polskieradio.cc/lumina</strong> • Dobre treści bez zgiełku</span>
          <span><strong class="ticker-sig">Ps 4,9</strong><span class="ticker-sep">•</span>„W pokoju się położę i zaraz zasnę, bo Ty sam, Panie, sprawiasz, że bezpiecznie mieszkam.”</span>
          <span><strong class="ticker-sig">BIBLIA INTERLINEARNA</strong><span class="ticker-sep">•</span>Odkryj oryginalny tekst Pisma Świętego z kodami Stronga: <strong class="ticker-highlight">https://polskieradio.cc/mojabiblia</strong></span>
        </div>
        <div class="top-ticker-group" id="g2">
          <span><strong class="ticker-sig">J 14,27</strong><span class="ticker-sep">•</span>„Pokój zostawiam wam, pokój mój daję wam. Nie tak jak daje świat, Ja wam daję. Niech się nie trwoży serce wasze ani się nie lęka.”</span>
          <span><strong class="ticker-sig">Flp 4,6-7</strong><span class="ticker-sep">•</span>„O nic się zbytnio nie troskajcie, ale we wszystkim w modlitwie i błaganiu z dziękczynieniem powierzcie prośby wasze Bogu.”</span>
          <span><strong class="ticker-sig">WSPARCIE MISJI</strong><span class="ticker-sep">•</span>Pomóż nam budować niezależne chrześcijańskie media w Polsce: <strong class="ticker-highlight">https://polskieradio.cc/wspieraj</strong> • Szybki BLIK: <strong>537 137 043</strong></span>
          <span><strong class="ticker-sig">Mt 11,28</strong><span class="ticker-sep">•</span>„Pójdźcie do Mnie wszyscy, którzy utrudzeni i obciążeni jesteście, a Ja wam dam ukojenie.”</span>
          <span><strong class="ticker-sig">Iz 26,3</strong><span class="ticker-sep">•</span>„Temu, którego myśl jest stała, zachowujesz pokój, pokój, bo tobie zaufał.”</span>
          <span><strong class="ticker-sig">PORTAL LUMINA</strong><span class="ticker-sep">•</span>Dołącz do wolnej społeczności wierzących: <strong class="ticker-highlight">https://polskieradio.cc/lumina</strong> • Dobre treści bez zgiełku</span>
          <span><strong class="ticker-sig">Ps 4,9</strong><span class="ticker-sep">•</span>„W pokoju się położę i zaraz zasnę, bo Ty sam, Panie, sprawiasz, że bezpiecznie mieszkam.”</span>
          <span><strong class="ticker-sig">BIBLIA INTERLINEARNA</strong><span class="ticker-sep">•</span>Odkryj oryginalny tekst Pisma Świętego z kodami Stronga: <strong class="ticker-highlight">https://polskieradio.cc/mojabiblia</strong></span>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(500);

  const data = await page.evaluate(() => {
    const g1 = document.getElementById('g1');
    return {
      g1Width: g1.offsetWidth,
      speedAt120s: (g1.offsetWidth / 120).toFixed(1) + ' px/s',
      speedAt140s: (g1.offsetWidth / 140).toFixed(1) + ' px/s',
      speedAt160s: (g1.offsetWidth / 160).toFixed(1) + ' px/s'
    };
  });
  console.log('Ticker Group Metrics:', data);
  await browser.close();
}

main();
