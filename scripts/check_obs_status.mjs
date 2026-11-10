import OBSWebSocket from 'obs-websocket-js';

const obs = new OBSWebSocket();
async function checkObs() {
  try {
    await obs.connect('ws://192.168.50.217:4455', '6qPcL0sXrVvs6sPN');
    console.log('Connected to OBS WebSocket');
    const streamStatus = await obs.call('GetStreamStatus');
    console.log('Main stream status:', JSON.stringify(streamStatus));
    const outputList = await obs.call('GetOutputList');
    for (const out of outputList.outputs) {
      try {
        const status = await obs.call('GetOutputStatus', { outputName: out.outputName });
        console.log(`Output: ${out.outputName.padEnd(25)} | Active: ${status.outputActive} | Reconnecting: ${status.outputReconnecting}`);
      } catch (e) {
        console.log(`Output: ${out.outputName.padEnd(25)} | Error: ${e.message}`);
      }
    }
    await obs.disconnect();
  } catch (err) {
    console.error('OBS error:', err.message);
  }
}
checkObs();
