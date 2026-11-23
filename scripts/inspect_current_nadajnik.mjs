import crypto from 'node:crypto';
import fs from 'node:fs';

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
    const scene = await send('GetCurrentProgramScene');
    console.log('Current Scene:', scene.currentProgramSceneName);

    const scenes = await send('GetSceneList');
    console.log('Available Scenes:', scenes.scenes.map(s => s.sceneName));

    const inputs = await send('GetInputList');
    for (const inp of inputs.inputs) {
      if (inp.inputKind === 'browser_source') {
        const settings = await send('GetInputSettings', { inputName: inp.inputName });
        console.log(`Input "${inp.inputName}": URL = ${settings.inputSettings?.url}`);
      }
    }

    try {
      const shot = await send('GetSourceScreenshot', {
        sourceName: scene.currentProgramSceneName,
        imageFormat: 'png',
        imageWidth: 960,
        imageHeight: 540
      });
      const b64 = shot.imageData.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync('C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/nadajnik_current_scene.png', Buffer.from(b64, 'base64'));
      console.log('Saved nadajnik_current_scene.png');
    } catch (err) {
      console.error('Screenshot err:', err.message);
    }

    ws.close();
    process.exit(0);
  }
};
