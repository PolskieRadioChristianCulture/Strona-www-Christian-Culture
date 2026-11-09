import crypto from 'node:crypto';

const OBS_HOST = 'ws://192.168.50.217:4455';
const OBS_PASSWORD = '6qPcL0sXrVvs6sPN';

async function connectObs() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(OBS_HOST);

    ws.onopen = () => {
      console.log('Połączono z OBS WebSocket na cc-nadajnik (192.168.50.217:4455)');
    };

    ws.onerror = (err) => {
      console.error('Błąd WebSocket:', err);
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
        console.log('✅ Zautoryzowano pomyślnie z OBS na cc-nadajnik!');
        resolve(ws);
      }
    };
  });
}

function sendRequest(ws, requestType, requestData = {}) {
  return new Promise((resolve) => {
    const requestId = crypto.randomUUID();
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.op === 7 && msg.d.requestId === requestId) {
        ws.removeEventListener('message', handler);
        resolve(msg.d);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({
      op: 6, // Request
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

  // 1. Sprawdź stream service settings
  const serviceSettings = await sendRequest(ws, 'GetStreamServiceSettings');
  console.log('\n📡 USTAWIENIA USŁUGI STREAMU (DOKĄD NADAJE GŁÓWNY OBS):');
  console.log(JSON.stringify(serviceSettings.responseData, null, 2));

  // 2. Sprawdź status streamu
  const streamStatus = await sendRequest(ws, 'GetStreamStatus');
  console.log('\n📡 STATUS STREAMU OBS (GŁÓWNY):');
  console.log(`Aktywny (outputActive): ${streamStatus.responseData?.outputActive}`);
  console.log(`Czas trwania: ${streamStatus.responseData?.outputTimecode} (${streamStatus.responseData?.outputDuration} ms)`);
  console.log(`Przesłano: ${(streamStatus.responseData?.outputBytes / 1024 / 1024).toFixed(2)} MB`);

  // 3. Sprawdź listę wszystkich wyjść (outputs)
  const outputs = await sendRequest(ws, 'GetOutputList');
  console.log('\n📋 LISTA WYJŚĆ (OUTPUTS):');
  for (const out of outputs.responseData?.outputs || []) {
    const st = await sendRequest(ws, 'GetOutputStatus', { outputName: out.outputName });
    console.log(`• ${out.outputName} [${out.outputKind}]: ${st.responseData?.outputActive ? '🟢 NADAJE (ACTIVE)' : '🔴 WYŁĄCZONE (INACTIVE)'}`);
  }

  // 4. Jeśli główny stream nie nadaje - uruchom!
  if (!streamStatus.responseData?.outputActive) {
    console.log('\n🚀 Uruchamiam StartStream na cc-nadajnik...');
    const res = await sendRequest(ws, 'StartStream');
    console.log('StartStream wynik:', res.requestStatus);
  }

  // 5. Uruchom wszystkie inne wyjścia streamu
  for (const out of outputs.responseData?.outputs || []) {
    if (out.outputKind.includes('stream') || out.outputKind === 'rtmp_output') {
      const st = await sendRequest(ws, 'GetOutputStatus', { outputName: out.outputName });
      if (!st.responseData?.outputActive) {
        console.log(`🚀 Uruchamiam wyjście: ${out.outputName}...`);
        const r = await sendRequest(ws, 'StartOutput', { outputName: out.outputName });
        console.log(`Wynik dla ${out.outputName}:`, r.requestStatus);
      }
    }
  }

  // Odczekaj 3s i sprawdź status końcowy
  await new Promise(r => setTimeout(r, 3000));
  const finalStatus = await sendRequest(ws, 'GetStreamStatus');
  console.log('\n🏁 STATUS KOŃCOWY STREAMU PO URUCHOMIENIU:');
  console.log(`Aktywny: ${finalStatus.responseData?.outputActive}, Czas: ${finalStatus.responseData?.outputTimecode}`);

  ws.close();
}

main().catch(err => {
  console.error('Błąd:', err);
  process.exit(1);
});
