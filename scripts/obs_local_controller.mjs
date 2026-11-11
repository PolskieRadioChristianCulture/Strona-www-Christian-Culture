import crypto from 'node:crypto';

const OBS_HOST = 'ws://127.0.0.1:4455';
const OBS_PASSWORD = 'zcPZNSKSv3o1g9gb';

async function connectObs() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(OBS_HOST);

    ws.onopen = () => {
      console.log('Połączono z lokalnym OBS WebSocket (127.0.0.1:4455)');
    };

    ws.onerror = (err) => {
      console.error('Błąd WebSocket:', err.message || err);
      reject(err);
    };

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.op === 0) {
        if (msg.d.authentication) {
          const { challenge, salt } = msg.d.authentication;
          const secretHash = crypto.createHash('sha256').update(OBS_PASSWORD + salt).digest('base64');
          const authResponse = crypto.createHash('sha256').update(secretHash + challenge).digest('base64');

          ws.send(JSON.stringify({
            op: 1, // Identify
            d: {
              rpcVersion: 1,
              authentication: authResponse,
              eventSubscriptions: 33
            }
          }));
        } else {
          ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1 } }));
        }
      } else if (msg.op === 2) {
        console.log('✅ Zautoryzowano pomyślnie z lokalnym OBS!');
        resolve(ws);
      }
    };
  });
}

function sendRequest(ws, requestType, requestData = {}) {
  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
    const timer = setTimeout(() => reject(new Error('Timeout ' + requestType)), 5000);
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.op === 7 && msg.d.requestId === requestId) {
        clearTimeout(timer);
        ws.removeEventListener('message', handler);
        resolve(msg.d);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({
      op: 6,
      d: {
        requestType,
        requestId,
        requestData
      }
    }));
  });
}

async function main() {
  const ws = await connectObs();

  // 1. Sprawdź status kamery wirtualnej
  const vcamStatus = await sendRequest(ws, 'GetVirtualCamStatus');
  console.log('\n📹 STATUS KAMERY WIRTUALNEJ OBS:');
  console.log(`Aktywna (outputActive): ${vcamStatus.responseData?.outputActive}`);
  if (!vcamStatus.responseData?.outputActive) {
    console.log('▶️ Uruchamianie Kamery Wirtualnej OBS...');
    try {
      await sendRequest(ws, 'StartVirtualCam');
      console.log('✅ Kamera Wirtualna OBS uruchomiona pomyślnie!');
    } catch (e) {
      console.error('⚠️ Błąd uruchamiania kamery:', e.message);
    }
  }

  // 2. Sprawdź status głównego streamu
  const streamStatus = await sendRequest(ws, 'GetStreamStatus');
  console.log('\n📡 STATUS STREAMU OBS (GŁÓWNY):');
  console.log(`Aktywny (outputActive): ${streamStatus.responseData?.outputActive}`);
  console.log(`Czas trwania: ${streamStatus.responseData?.outputTimecode} (${streamStatus.responseData?.outputDuration} ms)`);
  console.log(`Bity na sekundę: ${streamStatus.responseData?.outputBytes}`);
  if (!streamStatus.responseData?.outputActive) {
    console.log('▶️ Uruchamianie Streamu Głównego OBS...');
    try {
      await sendRequest(ws, 'StartStream');
      console.log('✅ Stream Główny OBS uruchomiony!');
    } catch (e) {
      console.log('⚠️ StartStream:', e.message);
    }
  }

  // 3. Pobierz listę hotkeyów
  const hotkeyList = await sendRequest(ws, 'GetHotkeyList');
  const allHotkeys = hotkeyList.responseData?.hotkeys || [];
  const aitumHotkeys = allHotkeys.filter(h => /Aitum|Output|Stream/i.test(h));
  console.log(`\nZnaleziono ${aitumHotkeys.length} pasujących hotkeyów:`);
  console.log(aitumHotkeys);

  // 4. Uruchom wyjścia Aitum
  const startHotkeys = aitumHotkeys.filter(h => /Start/i.test(h) && /Aitum/i.test(h));
  console.log(`\nUruchamianie ${startHotkeys.length} wyjść Aitum...`);
  for (const hk of startHotkeys) {
    try {
      await sendRequest(ws, 'TriggerHotkeyByName', { hotkeyName: hk });
      console.log(`  ▶️ Uruchomiono: ${hk}`);
      await new Promise(r => setTimeout(r, 400));
    } catch (err) {
      console.log(`  ⚠️ Błąd dla ${hk}: ${err.message}`);
    }
  }

  // 5. Końcowy status kamery wirtualnej
  const finalVcam = await sendRequest(ws, 'GetVirtualCamStatus');
  console.log(`\n🎯 KOŃCOWY STATUS KAMERY WIRTUALNEJ: ${finalVcam.responseData?.outputActive ? '🟢 AKTYWNA' : '🔴 NIEAKTYWNA'}`);

  console.log('\n✅ TRANSMISJA NADAJE!');
  ws.close();
}

main().catch(console.error);
