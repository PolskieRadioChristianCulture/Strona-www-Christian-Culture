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
        else rej(new Error(m.d.requestStatus.comment));
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
    console.log('=== OBS AUDIO DIAGNOSTICS ===');
    const inputList = await send('GetInputList');
    for (const inp of inputList.inputs) {
      const mute = await send('GetInputMute', { inputName: inp.inputName }).catch(e => ({ err: e.message }));
      const vol = await send('GetInputVolume', { inputName: inp.inputName }).catch(e => ({ err: e.message }));
      const tracks = await send('GetInputAudioTracks', { inputName: inp.inputName }).catch(e => ({ err: e.message }));
      const monitor = await send('GetInputAudioMonitorType', { inputName: inp.inputName }).catch(e => ({ err: e.message }));
      console.log(`INPUT: [${inp.inputName}] (${inp.inputKind})`);
      console.log(`  Muted: ${mute.inputMuted}, VolDb: ${vol.inputVolumeDb}, Monitor: ${monitor.monitorType}`);
      console.log(`  Tracks: ${JSON.stringify(tracks.inputAudioTracks)}`);
    }

    const scene = await send('GetCurrentProgramScene');
    console.log('\nCURRENT PROGRAM SCENE:', scene.currentProgramSceneName);
    const sceneItems = await send('GetSceneItemList', { sceneName: scene.currentProgramSceneName });
    for (const s of sceneItems.sceneItems) {
      console.log(`  Item: ${s.sourceName} (${s.sourceType}), enabled: ${s.sceneItemEnabled}`);
    }

    const special = await send('GetSpecialInputs');
    console.log('\nSPECIAL INPUTS:', JSON.stringify(special));

    ws.close();
    process.exit(0);
  }
};
