import crypto from 'node:crypto';

const OBS_HOST = 'ws://192.168.50.217:4455';
const OBS_PASSWORD = '6qPcL0sXrVvs6sPN';

const ws = new WebSocket(OBS_HOST);

function send(type, data = {}) {
  return new Promise((res, rej) => {
    const id = crypto.randomUUID();
    const h = (e) => {
      const m = JSON.parse(e.data);
      if (m.op === 7 && m.d.requestId === id) {
        ws.removeEventListener('message', h);
        if (m.d.requestStatus.result) res(m.d.responseData);
        else rej(new Error(m.d.requestStatus.comment || 'fail'));
      }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ op: 6, d: { requestType: type, requestId: id, requestData: data } }));
  });
}

ws.onmessage = async (e) => {
  const m = JSON.parse(e.data);
  if (m.op === 0) {
    const { challenge, salt } = m.d.authentication;
    const s1 = crypto.createHash('sha256').update(OBS_PASSWORD + salt).digest('base64');
    const auth = crypto.createHash('sha256').update(s1 + challenge).digest('base64');
    ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: auth, eventSubscriptions: 65536 } }));
  } else if (m.op === 2) {
    const mute = await send('GetInputMute', { inputName: 'Przeglądarka' });
    const vol = await send('GetInputVolume', { inputName: 'Przeglądarka' });
    console.log(`Przeglądarka muted: ${mute.inputMuted}, volumeDb: ${vol.inputVolumeDb.toFixed(1)} dB`);
    setTimeout(() => { ws.close(); process.exit(0); }, 1500);
  } else if (m.op === 5 && m.d.eventType === 'InputVolumeMeters') {
    const inputs = m.d.eventData.inputs;
    const p = inputs.find(i => i.inputName === 'Przeglądarka');
    if (p) {
      console.log(`Audio Meter Levels for Przeglądarka: peak=${JSON.stringify(p.inputLevelsMul.map(ch => ch[1]?.toFixed(3)))}`);
    }
  }
};
