import crypto from 'node:crypto';

const OBS_HOST = 'ws://192.168.50.217:4455';
const OBS_PASS = '6qPcL0sXrVvs6sPN';

// 7 Dni Tygodnia (0 = Niedziela, 1 = Poniedziałek, ..., 6 = Sobota)
export const WEEK_CHANNELS = {
  1: {
    dayName: 'Poniedziałek',
    channelName: 'Worship LIVE CC (cctv24-worship-live)',
    url: 'https://polskieradio.cc/cctv24-worship-live.html',
    desc: 'Pieśni chwały, potężne uwielbienie i wstawiennictwo na start nowego tygodnia'
  },
  2: {
    dayName: 'Wtorek',
    channelName: 'Apokalipsa & Księga Nadziei (apokalipsa-ksiega-nadziei-live)',
    url: 'https://polskieradio.cc/apokalipsa-ksiega-nadziei-live.html',
    desc: 'Głębokie studium biblijne i wykłady prorocze prof. Waltera Veitha'
  },
  3: {
    dayName: 'Środa',
    channelName: 'Biblia Śpiewana (biblia-spiewana-live)',
    url: 'https://polskieradio.cc/biblia-spiewana-live.html',
    desc: 'Słuchowiska, Przypowieści Salomona i Psalmy wyśpiewane Słowem Bożym'
  },
  4: {
    dayName: 'Czwartek',
    channelName: 'Zjednoczeni za Polskę (zapolske-live)',
    url: 'https://polskieradio.cc/zapolske-live.html',
    desc: 'Narodowa modlitwa wstawiennicza, patriotyzm chrześcijański i walka duchowa'
  },
  5: {
    dayName: 'Piątek',
    channelName: 'Świadectwa Wiary & Żywe Doświadczenia Boga (swiadectwa-live)',
    url: 'https://polskieradio.cc/swiadectwa-live.html',
    desc: 'Poruszające, prawdziwe historie nawróceń, uzdrowień, uwolnień i żywych cudów działania Boga w życiu ludzi'
  },
  6: {
    dayName: 'Sobota',
    channelName: 'Biblia Audio & Spoczynek Słowa (studium-live)',
    url: 'https://polskieradio.cc/studium-live.html',
    desc: 'Uroczysty odpoczynek biblijny, nasycenie czystym Słowem Bożym i cisza'
  },
  0: {
    dayName: 'Niedziela',
    channelName: 'Gala Chwały & Top Seven (master-live)',
    url: 'https://polskieradio.cc/master-live.html?mode=full_rotation',
    desc: 'Wielkie podsumowanie tygodnia, najpiękniejsza muzyka chrześcijańska i orędzie'
  }
};

function send(ws, type, data = {}) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const timer = setTimeout(() => reject(new Error('OBS timeout: ' + type)), 10000);
    const h = (e) => {
      const m = JSON.parse(e.data);
      if (m.op === 7 && m.d.requestId === id) {
        clearTimeout(timer);
        ws.removeEventListener('message', h);
        if (m.d.requestStatus.result) resolve(m.d.responseData);
        else reject(new Error(m.d.requestStatus.comment || 'OBS request failed'));
      }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ op: 6, d: { requestType: type, requestId: id, requestData: data } }));
  });
}

export async function switchObsDailyChannel(targetDay = new Date().getDay()) {
  const config = WEEK_CHANNELS[targetDay];
  console.log(`[OBS-SWITCH] Przełączanie na kanał dnia (${config.dayName}): ${config.channelName}`);
  console.log(`[OBS-SWITCH] Docelowy URL: ${config.url}`);

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(OBS_HOST);
    const timer = setTimeout(() => { ws.close(); reject(new Error('Connection timeout to OBS')); }, 15000);

    ws.onmessage = async (e) => {
      const msg = JSON.parse(e.data);
      if (msg.op === 0) {
        const a = msg.d.authentication;
        const d = { rpcVersion: 1 };
        if (a) {
          const secret = crypto.createHash('sha256').update(OBS_PASS + a.salt).digest('base64');
          d.authentication = crypto.createHash('sha256').update(secret + a.challenge).digest('base64');
        }
        ws.send(JSON.stringify({ op: 1, d }));
      } else if (msg.op === 2) {
        clearTimeout(timer);
        try {
          // 1. Zaktualizuj URL w źródle "Przeglądarka"
          await send(ws, 'SetInputSettings', {
            inputName: 'Przeglądarka',
            inputSettings: {
              url: config.url
            },
            overlay: true
          });
          console.log('✅ Zaktualizowano URL źródła Przeglądarka w OBS');

          // 2. Wymuś odświeżenie pamięci podręcznej (cache)
          await send(ws, 'PressInputPropertiesButton', {
            inputName: 'Przeglądarka',
            propertyName: 'refreshnocache'
          }).catch(() => {});
          console.log('✅ Odświeżono pamięć podręczną źródła w OBS');

          ws.close();
          resolve(config);
        } catch (err) {
          ws.close();
          reject(err);
        }
      }
    };

    ws.onerror = (err) => {
      clearTimeout(timer);
      reject(err);
    };
  });
}

// Uruchomienie bezpośrednie
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const forcedDay = process.argv[2] !== undefined ? parseInt(process.argv[2], 10) : new Date().getDay();
  switchObsDailyChannel(forcedDay)
    .then(c => console.log(`🚀 Sukces! Ustawiono: ${c.dayName} -> ${c.channelName}`))
    .catch(err => {
      console.error('❌ Błąd przełączania:', err.message);
      process.exit(1);
    });
}
