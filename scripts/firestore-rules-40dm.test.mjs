import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { once } from 'node:events';
import { createConnection } from 'node:net';

// Explicit opt-in: starts only a loopback, in-memory demo project. No production SDK credentials.
test('40DM access respects the actual Firestore rules', {
  skip: !process.env.CC_FIRESTORE_EMULATOR_JAR,
  timeout: 60000,
}, async () => {
  const project = 'demo-cc-40dm';
  const base = 'http://127.0.0.1:18988';
  const root = `${base}/v1/projects/${project}/databases/(default)/documents`;
  const occupied = await new Promise(resolvePort => {
    const socket = createConnection({ host: '127.0.0.1', port: 18988 });
    socket.once('connect', () => { socket.destroy(); resolvePort(true); });
    socket.once('error', () => { socket.destroy(); resolvePort(false); });
  });
  assert.equal(occupied, false, 'Refuse to reuse another process on the test port');
  const emulator = spawn('java', ['-Duser.language=en', '-Duser.country=US', '-jar', process.env.CC_FIRESTORE_EMULATOR_JAR,
    '--host', '127.0.0.1', '--port', '18988', '--project_id', project,
    '--single_project_mode', '--single_project_mode_error', '--rules', resolve('firestore.rules')],
  { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  emulator.stdout.on('data', x => { log = (log + x).slice(-12000); });
  emulator.stderr.on('data', x => { log = (log + x).slice(-12000); });
  const exited = once(emulator, 'exit');
  function token(uid, provider = 'password') {
    const b64 = x => Buffer.from(JSON.stringify(x)).toString('base64url');
    return `${b64({ alg: 'none', typ: 'JWT' })}.${b64({
      aud: project, iss: `https://securetoken.google.com/${project}`, sub: uid,
      user_id: uid, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600,
      email_verified: false, email: 'synthetic@example.invalid',
      firebase: { sign_in_provider: provider, identities: {} },
    })}.`;
  }
  async function request(url, body, bearer, method = 'POST') {
    const res = await fetch(url, { method, headers: {
      'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    }, ...(method === 'GET' ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(8000) });
    return { status: res.status, data: await res.json() };
  }
  try {
    for (let n = 0; n < 100; n++) {
      if (emulator.exitCode !== null) throw Error(`Emulator exited: ${log}`);
      try { if ((await fetch(base, { signal: AbortSignal.timeout(300) })).status) break; } catch {}
      if (n === 99) throw Error(`Emulator not ready: ${log}`);
      await new Promise(r => setTimeout(r, 200));
    }

    const st = stringValue => ({ stringValue });
    const member = token('p40-adult','google.com');
    const child = token('p40-child','google.com');
    const guest = token('p40-anon','anonymous');
    const room = id => root+'/lumina_live_rooms/'+id+'/messages';
    assert.equal((await request(root+'/kids_pilot/config',{fields:{childUid:st('p40-child')}},'owner','PATCH')).status,200);
    for (const [bearer, code] of [[undefined,403],[guest,403],[child,403],[member,200]]) {
      assert.equal((await request(room('prayer_40dm'),undefined,bearer,'GET')).status,code);
    }
    assert.equal((await request(room('tv_cc24'),undefined,undefined,'GET')).status,200);
    const write = (id, uid, kind, bearer) => request(root+':commit',{ writes:[{
      update:{name:'projects/'+project+'/databases/(default)/documents/lumina_live_rooms/prayer_40dm/messages/'+id,fields:{
        roomId:st('prayer_40dm'),text:st('Synthetic fixture'),senderAuthUid:st(uid),senderName:st('Fixture'),senderAvatar:st(''),kind:st(kind)
      }},updateTransforms:[{fieldPath:'createdAt',setToServerValue:'REQUEST_TIME'}]
    }]},bearer);
    for (const [id, uid, kind, bearer, code] of [
      ['own','p40-adult','text',member,200], ['prayer','p40-adult','prayer',member,403],
      ['anon','p40-anon','text',guest,403], ['child','p40-child','text',child,403],
      ['guest','guest','text',undefined,403]
    ]) assert.equal((await write(id,uid,kind,bearer)).status,code,id);
    assert.equal((await request(room('prayer_40dm')+'/own',undefined,member,'GET')).status,200);
  } finally { emulator.kill(); await exited; }
});
