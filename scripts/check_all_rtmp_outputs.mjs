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
    const list = await send('GetOutputList');
    const rtmpOutputs = list.outputs.filter(o => o.outputKind === 'rtmp_output');
    console.log(`Found ${rtmpOutputs.length} RTMP outputs:`);
    let activeCount = 0;
    for (const out of rtmpOutputs) {
      const st = await send('GetOutputStatus', { outputName: out.outputName }).catch(e => ({ outputActive: false, err: e.message }));
      const active = st.outputActive;
      if (active) activeCount++;
      console.log(`- [${out.outputName}]: active=${active}${st.err ? ' (' + st.err + ')' : ''}`);
    }
    console.log(`Total active RTMP outputs: ${activeCount} / ${rtmpOutputs.length}`);
    ws.close();
    process.exit(0);
  }
};
