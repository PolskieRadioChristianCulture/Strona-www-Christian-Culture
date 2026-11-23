import crypto from 'node:crypto';

const OBS_HOST = '192.168.50.217';
const OBS_PORT = 4455;
const OBS_PASS = '6qPcL0sXrVvs6sPN';
const TARGET_KEY = 'bpta-dj4x-p34k-5d8y-3mqx';

function callOBS() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${OBS_HOST}:${OBS_PORT}`);
    function send(type, data = {}) {
      return new Promise((res, rej) => {
        const id = crypto.randomUUID();
        const timer = setTimeout(() => rej(new Error('timeout ' + type)), 10000);
        const h = (e) => {
          const m = JSON.parse(e.data);
          if (m.op === 7 && m.d.requestId === id) {
            clearTimeout(timer);
            ws.removeEventListener('message', h);
            if (m.d.requestStatus.result) res(m.d.responseData);
            else rej(new Error(m.d.requestStatus.comment || 'OBS error'));
          }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ op: 6, d: { requestType: type, requestId: id, requestData: data } }));
      });
    }

    ws.onmessage = async (e) => {
      const msg = JSON.parse(e.data);
      if (msg.op === 0 && msg.d.authentication) {
        const { challenge, salt } = msg.d.authentication;
        const s1 = crypto.createHash('sha256').update(OBS_PASS + salt).digest('base64');
        const auth = crypto.createHash('sha256').update(s1 + challenge).digest('base64');
        ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: auth } }));
      } else if (msg.op === 2) {
        console.log('Connected to OBS. Checking current StreamServiceSettings...');
        const curr = await send('GetStreamServiceSettings');
        console.log('Current Stream Service Settings:', JSON.stringify(curr));

        console.log('Stopping main stream...');
        await send('StopStream').catch(e => console.log('StopStream note:', e.message));
        await new Promise(r => setTimeout(r, 2000));

        console.log(`Setting stream key to ${TARGET_KEY}...`);
        await send('SetStreamServiceSettings', {
          streamServiceType: 'rtmp_custom',
          streamServiceSettings: {
            server: 'rtmp://a.rtmp.youtube.com/live2',
            key: TARGET_KEY
          }
        });

        console.log('Starting main stream...');
        await send('StartStream');
        await new Promise(r => setTimeout(r, 2000));

        const status = await send('GetStreamStatus');
        console.log('Stream Status after restart:', JSON.stringify(status));

        ws.close();
        resolve();
      }
    };
    ws.onerror = reject;
  });
}

callOBS().catch(console.error);
