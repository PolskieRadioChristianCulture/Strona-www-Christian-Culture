import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { verifyAiOwnerToken } from '../_worker.js';
import { handleAiDlaJezusaApi } from '../services/ai-dla-jezusa/api-v1.js';
import { processAiChat } from '../services/ai-dla-jezusa/chat-service.js';
import { reserveSharedAiAttempt, readLimitedText } from '../services/ai-dla-jezusa/cost-guard.js';

function budget(limit = '2') {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../migrations/ai-cost/0001_daily_attempts.sql', import.meta.url),'utf8'));
  return {
    AI_SHARED_FREE_PROJECT_VERIFIED: 'true', AI_DAILY_ATTEMPT_LIMIT: limit, AI_SHARED_FREE_GEMINI_KEY: 'synthetic-test-only',
    AI_COST_DB: { prepare: sql => ({ bind: (...args) => ({
      first: async () => sqlite.prepare(sql).get(...args)
    }) }) }
  };
}
const noModel = () => assert.fail('unexpected provider call');
const signedClaims = { aud: 'lumina-cc', iss:'https://securetoken.google.com/lumina-cc', sub:'owner-fixture', email_verified:true };
test('owner requires exact Firebase issuer, audience and configured immutable UID', async () => {
  const env={AI_OWNER_UID:'owner-fixture'};
  const verify = claims => async () => claims;
  assert.equal(await verifyAiOwnerToken('mock',env,verify(signedClaims)),signedClaims);
  for (const claims of [
    {...signedClaims,aud:'another-client'},
    {...signedClaims,iss:'https://accounts.google.com'},
    {...signedClaims,iss:'https://securetoken.google.com/cc-mission-control'},
    {...signedClaims,sub:'different-user'},
    {...signedClaims,email_verified:false}
  ]) assert.equal(await verifyAiOwnerToken('mock',env,verify(claims)),null);
  assert.equal(await verifyAiOwnerToken('mock',{},verify(signedClaims)),null);
});

test('same-origin restriction, anonymous owner refusal and body limit', async () => {
  const domain='https://example.test';
  const api=domain+'/api/ai-dla-jezusa/v1';
  const foreign=await handleAiDlaJezusaApi(new Request(api+'/chat',{method:'POST',headers:{Origin:'https://other.test'},body:'{}'}));
  assert.equal(foreign.status,403);
  const owner=await handleAiDlaJezusaApi(new Request(api+'/owner/session'));
  assert.equal(owner.status,401);
  assert.match(owner.headers.get('cache-control'),/no-store/);
  assert.equal(await readLimitedText(new Request(api+'/chat',{method:'POST',body:'a'.repeat(9)}),8),null);
});

test('database atomically reserves the cap, including across concurrent requests', async () => {
  const env=budget('5');
  const date=new Date('2026-11-26T11:00:00Z');
  const claims=await Promise.all(Array.from({length:24},()=>reserveSharedAiAttempt(env,date)));
  assert.equal(claims.filter(Boolean).length,5);
  assert.equal(await reserveSharedAiAttempt(env,new Date('2026-11-27T11:00:00Z')),true);
  assert.equal(await reserveSharedAiAttempt({...env,AI_COST_DB:null},date),false);
});

test('private mode and unconfigured budget make no provider calls', async () => {
  const env=budget();
  const byok={provider:'gemini',apiKey:'synthetic-user-key',userModel:'gemini-3.1-flash-lite'};
  for (const [body,settings] of [
    [{message:'J 3:16',privateMode:true,preferredModel:'byok',byokConsent:true},env],
    [{message:'J 3:16'},{}],
    [{message:'J 3:16',preferredModel:'byok'},env]
  ]) {
    const result=await processAiChat(body,settings,{fetch:noModel,userByok:byok});
    assert.equal(result.provider,'cc-knowledge-hub');
    assert.equal(result.zeroCostGuaranteed,true);
  }
});

test('failed provider attempt consumes one reservation and carries key only in header', async () => {
  const env=budget('1');
  let upstream=0;
  const fetch=async (url,options)=>{
    upstream++;
    assert.equal(new URL(url).origin,'https://generativelanguage.googleapis.com');
    assert.equal(new URL(url).search,'');
    assert.equal(options.headers['x-goog-api-key'],env.AI_SHARED_FREE_GEMINI_KEY);
    assert.equal(options.redirect,'error');
    return Response.json({}, {status:503});
  };
  const first=await processAiChat({message:'J 3:16'},env,{fetch});
  const second=await processAiChat({message:'J 3:16'},env,{fetch});
  assert.equal(first.zeroCostGuaranteed,false);
  assert.equal(second.zeroCostGuaranteed,true);
  assert.equal(upstream,1);
});
