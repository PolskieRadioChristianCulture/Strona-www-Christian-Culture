import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {Miniflare,convertV4MiniflareOptions,Response:RuntimeResponse}=require('miniflare');
const ID='12345678-1234-4234-9234-123456789abc';
const RECEIPT='MSG-20261019T150000Z-dowodca-abcdef';

test('isolated Workers + real D1: auth, durable queue, idempotency and bridge receipts',{timeout:90000},async t=>{
  const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,
    publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
  const jwk=await crypto.subtle.exportKey('jwk',pair.publicKey);jwk.kid='mailbox-fixture';
  const b64=v=>Buffer.from(v).toString('base64url');
  const now=Math.floor(Date.now()/1000);
  const claims={iss:'https://securetoken.google.com/local-fixture',aud:'local-fixture',sub:'owner-fixture',
    email:'owner@example.invalid',email_verified:true,ccMissionControl:true,iat:now,auth_time:now,exp:now+3600,
    firebase:{sign_in_provider:'google.com',sign_in_second_factor:'totp'}};
  async function sign(c){const input=`${b64(JSON.stringify({alg:'RS256',kid:jwk.kid}))}.${b64(JSON.stringify(c))}`;
    return `${input}.${b64(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(input)))}`;}
  const idToken=await sign(claims),appToken=await sign({iss:'https://firebaseappcheck.googleapis.com/123',aud:['projects/123'],sub:'fixture-app',iat:now,exp:now+3600});
  const credential='local-fixture-only-'.repeat(4);
  const persist=await mkdtemp(join(tmpdir(),'lumi-d1-runtime-'));
  const bundle=await build({entryPoints:['cloudflare/lumi-agent-mailbox/worker.js'],bundle:true,write:false,format:'esm',platform:'browser'});
  const options={name:'lumi-mailbox-local-test',modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-10-13',
    d1Databases:{MAILBOX_DB:'local-fixture-db'},d1Persist:persist,resourcePersistencePath:persist,cachePersist:false,
    bindings:{MAILBOX_ENABLED:'true',CC_FIREBASE_PROJECT_ID:'local-fixture',CC_FIREBASE_PROJECT_NUMBER:'123',
      CC_FIREBASE_APP_ID:'fixture-app',MAILBOX_OWNER_UID:'owner-fixture',MAILBOX_OWNER_EMAIL:'owner@example.invalid',MAILBOX_BRIDGE_CREDENTIAL:credential},
    outboundService:async req=>{
      if(!['https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
        'https://firebaseappcheck.googleapis.com/v1/jwks'].includes(req.url))throw Error('Unexpected external request blocked');
      return RuntimeResponse.json({keys:[jwk]},{headers:{'Cache-Control':'public, max-age=300'}});
    }};
  const start=()=>new Miniflare(convertV4MiniflareOptions?convertV4MiniflareOptions(options):options);
  let mf=start();
  const headers=()=>({Authorization:`Bearer ${idToken}`,'X-Firebase-AppCheck':appToken,Origin:'https://polskieradio.cc'});
  async function req(path,method='GET',value,authHeaders=headers()) {
    return mf.dispatchFetch('https://mailbox.invalid'+path,{method,headers:{...authHeaders,...(value?{'Content-Type':'application/json'}:{})},
      ...(value?{body:JSON.stringify(value)}:{})});
  }
  const bridgeHeaders=()=>({Authorization:`Bearer ${credential}`});
  const send=command=>req('/v1/commands','POST',{id:ID,command});
  try{
    let db=await mf.getD1Database('MAILBOX_DB');
    const migration=await readFile('cloudflare/lumi-agent-mailbox/migrations/0001_mailbox.sql','utf8');
    await db.exec(migration.replace(/--[^\n]*/g,'').replace(/\s+/g,' '));
    await t.test('disabled configuration cannot be activated by a client',async()=>{
      const disabled={...options,bindings:{...options.bindings,MAILBOX_ENABLED:'false'}};
      await mf.setOptions(convertV4MiniflareOptions?convertV4MiniflareOptions(disabled):disabled);
      const r=await send('TEST disabled');assert.equal(r.status,503);assert.equal((await r.json()).error,'DISABLED');
      await mf.setOptions(convertV4MiniflareOptions?convertV4MiniflareOptions(options):options);
      db=await mf.getD1Database('MAILBOX_DB');
    });
    await t.test('unauthenticated and hostile origins rejected without data',async()=>{
      assert.equal((await req('/v1/commands','GET',null,{})).status,401);
      assert.equal((await req('/v1/commands','GET',null,{...headers(),Origin:'https://evil.invalid'})).status,403);
      assert.equal((await req('/bridge/pending','GET',null,{...bridgeHeaders(),Origin:'https://polskieradio.cc'})).status,403);
      assert.equal((await req('/bridge/pending','GET',null,{Authorization:'Bearer wrong-fixture'})).status,403);
    });
    await t.test('signature, project, claim, owner, MFA, expiry and App Check validated',async()=>{
      for(const change of [{sub:'other'},{ccMissionControl:false},{email_verified:false},{email:'other@example.invalid'},
        {aud:'other-project'},{exp:now-1},{firebase:{sign_in_provider:'anonymous'}},{firebase:{sign_in_provider:'google.com'}}]){
        const r=await req('/v1/commands','GET',null,{...headers(),Authorization:`Bearer ${await sign({...claims,...change})}`});assert.equal(r.status,403);
      }
      assert.equal((await req('/v1/commands','GET',null,{...headers(),'X-Firebase-AppCheck':'bad'})).status,403);
      const tampered=idToken.split('.');tampered[1]=b64(JSON.stringify({...claims,sub:'other'}));
      assert.equal((await req('/v1/commands','GET',null,{...headers(),Authorization:`Bearer ${tampered.join('.')}`})).status,403);
    });
    await t.test('body limits, schema and accidental secrets rejected',async()=>{
      for(const command of ['','x'.repeat(4001),'bad\u0000input','Bearer '+'a'.repeat(32)])assert.equal((await send(command)).status,400);
      assert.equal((await req('/v1/commands','POST',{id:ID,command:'TEST',status:'accepted'})).status,400);
      assert.equal((await req('/v1/commands','POST',{id:ID,command:'x'.repeat(17000)})).status,413);
      assert.equal((await req('/v1/commands','POST',{id:[ID],command:'TEST'})).status,400);
    });
    await t.test('concurrent retries have exactly one durable command and no fabricated acceptance',async()=>{
      const values=await Promise.all(Array.from({length:8},()=>send('TEST command')));
      for(const r of values){assert.equal(r.status,200);assert.equal((await r.json()).status,'queued');}
      assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM lumi_agent_mailbox').first()).n,1);
      assert.equal((await send('DIFFERENT')).status,409);
      const list=await req('/v1/commands');assert.equal(list.headers.get('Cache-Control'),'no-store, private');
      const row=(await list.json()).items[0];assert.equal(row.reply,null);assert.equal(row.requestId,null);
      const pending=await req('/bridge/pending','GET',null,bridgeHeaders());assert.equal((await pending.json()).items[0].revision,1);
    });
    await t.test('D1 survives runtime restart',async()=>{
      await mf.dispose();mf=start();
      assert.equal((await (await req('/v1/commands')).json()).items[0].command,'TEST command');
    });
    await t.test('refresh racing receipt does not lose pending work',async()=>{
      assert.equal((await req(`/v1/commands/${ID}/refresh`,'POST')).status,200);
      const receipt={revision:1,status:'accepted',requestId:RECEIPT,acknowledgement:null,reply:null};
      assert.equal((await req('/bridge/'+ID,'POST',receipt,bridgeHeaders())).status,409);
      receipt.revision=2;assert.equal((await req('/bridge/'+ID,'POST',receipt,bridgeHeaders())).status,200);
      assert.equal((await (await req('/bridge/pending','GET',null,bridgeHeaders())).json()).items.length,0);
      assert.equal((await (await req('/v1/commands')).json()).items[0].status,'accepted');
    });
    await t.test('only bridge can publish a validated reply; acceptance cannot regress',async()=>{
      await req(`/v1/commands/${ID}/refresh`,'POST');
      const reply={revision:3,status:'answered',requestId:RECEIPT,acknowledgement:null,
        reply:{id:'MSG-20261019T150100Z-codex-abcdef',agent:'codex',at:new Date().toISOString(),text:'TEST response'}};
      assert.equal((await req('/bridge/'+ID,'POST',reply)).status,403);
      assert.equal((await req('/bridge/'+ID,'POST',reply,bridgeHeaders())).status,200);
      assert.equal((await (await req('/v1/commands')).json()).items[0].reply.text,'TEST response');
      await req(`/v1/commands/${ID}/refresh`,'POST');
      assert.equal((await req('/bridge/'+ID,'POST',{...reply,revision:4,status:'accepted',reply:null},bridgeHeaders())).status,409);
      assert.equal((await req('/bridge/'+ID,'POST',{...reply,revision:4,requestId:RECEIPT+'x'},bridgeHeaders())).status,409);
    });
    await t.test('bounded daily intake never exceeds 100 rows, including races',async()=>{
      const latest=await mf.getD1Database('MAILBOX_DB');
      for(let i=0;i<98;i++)await latest.prepare('INSERT INTO lumi_agent_mailbox(owner_uid,id,command,created_at) VALUES (?1,?2,?3,?4)').bind('owner-fixture',`fixture-${i}`,'TEST quota',Date.now()).run();
      const results=await Promise.all(Array.from({length:6},()=>req('/v1/commands','POST',{id:crypto.randomUUID(),command:'TEST cap'})));
      assert.equal(results.filter(r=>r.status===200).length,1);assert.equal(results.filter(r=>r.status===429).length,5);
      assert.equal((await latest.prepare('SELECT COUNT(*) AS n FROM lumi_agent_mailbox').first()).n,100);
      assert.equal((await send('TEST command')).status,200,'retry existing UUID works even at daily cap');
    });
    await t.test('database outage does not claim success or leak SQL',async()=>{
      const latest=await mf.getD1Database('MAILBOX_DB');await latest.exec('DROP TABLE lumi_agent_mailbox');
      const r=await send('TEST outage');assert.equal(r.status,503);assert.deepEqual(await r.json(),{ok:false,error:'UNAVAILABLE'});
    });
  }finally{await mf.dispose();await rm(persist,{recursive:true,force:true});}
});
