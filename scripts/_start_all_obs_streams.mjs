import crypto from 'node:crypto';

const ws = new WebSocket('ws://192.168.50.217:4455');
const PASS = '6qPcL0sXrVvs6sPN';

function send(type, data = {}) {
  return new Promise((res, rej) => {
    const id = crypto.randomUUID();
    const h = (e) => {
      const m = JSON.parse(e.data);
      if (m.op === 7 && m.d.requestId === id) {
        ws.removeEventListener('message', h);
        if (m.d.requestStatus.result) res(m.d.responseData);
        else rej(new Error(m.d.requestStatus.comment || 'failed'));
      }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ op: 6, d: { requestType: type, requestId: id, requestData: data } }));
  });
}

ws.onmessage = async (e) => {
  const msg = JSON.parse(e.data);
  if (msg.op === 0) {
    const a = msg.d.authentication;
    const secret = crypto.createHash('sha256').update(PASS + a.salt).digest('base64');
    const auth = crypto.createHash('sha256').update(secret + a.challenge).digest('base64');
    ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: auth } }));
  } else if (msg.op === 2) {
    console.log('Connected to OBS. Starting Main Stream and Aitum outputs...');
    // 1. Start main stream
    await send('StartStream').catch(e => console.log('StartStream:', e.message));

    // 2. Start all Aitum outputs
    const hk = await send('GetHotkeyList');
    const startKeys = hk.hotkeys.filter(h => h.startsWith('AitumStreamSuiteStartOutput'));
    for (const k of startKeys) {
      const name = k.replace('AitumStreamSuiteStartOutput', '');
      if (name.includes('Vertical') || name.includes('Backtrack')) continue;
      console.log(`Starting ${name}...`);
      await send('TriggerHotkeyByName', { hotkeyName: k }).catch(e => console.log(`Err ${name}:`, e.message));
      await new Promise(r => setTimeout(r, 800));
    }

    // 3. Start Virtual Camera
    await send('StartVirtualCam').catch(e => console.log('StartVirtualCam:', e.message));

    await new Promise(r => setTimeout(r, 3000));
    const ss = await send('GetStreamStatus');
    console.log('MAIN STREAM STATUS:', JSON.stringify(ss));

    const ol = await send('GetOutputList');
    console.log('ACTIVE OUTPUTS:');
    for (const o of ol.outputs) {
      if (o.outputActive) console.log(`  🟢 ${o.outputName}`);
    }

    ws.close();
    process.exit(0);
  }
};
