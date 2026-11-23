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
  if (m.op === 0 && m.d.authentication) {
    const { challenge, salt } = m.d.authentication;
    const s = crypto.createHash('sha256').update(OBS_PASSWORD + salt).digest('base64');
    const a = crypto.createHash('sha256').update(s + challenge).digest('base64');
    ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: a } }));
  } else if (m.op === 2) {
    console.log('Connected to nadajnik OBS.');
    const newUrl = 'https://polskieradio.cc/tvw-women-live?in_mcr=1&unmute=1';
    console.log(`Setting Przeglądarka URL to: ${newUrl}`);
    await send('SetInputSettings', {
      inputName: 'Przeglądarka',
      inputSettings: {
        url: newUrl,
        restart_when_active: true,
        reroute_audio: true
      }
    });

    console.log('Pressing refreshnocache...');
    await send('PressInputPropertiesButton', {
      inputName: 'Przeglądarka',
      propertyName: 'refreshnocache'
    }).catch(e => console.log('refreshnocache response:', e.message));

    console.log('Successfully switched input URL on cc-nadajnik.');
    ws.close();
    process.exit(0);
  }
};
