import crypto from 'node:crypto';

const ws = new WebSocket('ws://192.168.50.217:4455');

function send(type, data = {}) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const timer = setTimeout(() => reject(new Error('timeout ' + type)), 10000);
    const h = (e) => {
      const m = JSON.parse(e.data);
      if (m.op === 7 && m.d.requestId === id) {
        clearTimeout(timer);
        ws.removeEventListener('message', h);
        if (m.d.requestStatus.result) {
          resolve(m.d.responseData);
        } else {
          reject(new Error(m.d.requestStatus.comment || 'OBS request failed'));
        }
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
    const secret = crypto.createHash('sha256').update('6qPcL0sXrVvs6sPN' + salt).digest('base64');
    const auth = crypto.createHash('sha256').update(secret + challenge).digest('base64');
    ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: auth } }));
  } else if (msg.op === 2) {
    console.log('Connected to OBS.');

    const newKey = 'vjq2-18xr-jyys-4z8b-0f43';
    console.log('Stopping stream to update key...');
    await send('StopStream').catch(e => console.log('StopStream note:', e.message));
    await new Promise(r => setTimeout(r, 2000));

    console.log('Setting new stream service settings with key:', newKey);
    await send('SetStreamServiceSettings', {
      streamServiceType: 'rtmp_custom',
      streamServiceSettings: {
        server: 'rtmps://a.rtmps.youtube.com:443/live2',
        key: newKey,
        use_auth: false,
        bwtest: false
      }
    });

    console.log('Starting stream...');
    await send('StartStream');
    await new Promise(r => setTimeout(r, 2000));

    const status = await send('GetStreamStatus');
    console.log('Stream status now:', status);

    ws.close();
  }
};
