import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createGivingLedger, verifyWebhookSignature } from './milion-gestow-ledger.mjs';

const htmlPath = path.resolve('test/milion-gestow/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const prodHtmlPath = path.resolve('milion-gestow/index.html');
const prodHtml = fs.readFileSync(prodHtmlPath, 'utf8');

test('T01-T04 & T11-T12: Landing /test/milion-gestow oraz produkcyjny /milion-gestow spełniają wymogi CC FULL PREMIUM, progów 2/5/10/20 zł i oficjalnej nazwy CHRISTIAN CULTURE', () => {
  assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
  assert.match(prodHtml, /<meta name="robots" content="index,follow">/);
  assert.match(prodHtml, /https:\/\/polskieradio\.cc\/milion-gestow/);
  assert.match(prodHtml, /\/milion-gestow\/audio\/spot-30s\.mp3/);
  assert.match(html, /data-value="2"/);
  assert.match(html, /data-value="5"/);
  assert.match(html, /data-value="10"/);
  assert.match(html, /data-value="20"/);
  assert.match(html, /data-freq="monthly"/);
  assert.match(html, /data-freq="once"/);
  assert.match(html, /id="btnDemoCheckout"[^>]*disabled/);
  assert.match(prodHtml, /id="btnProdCheckout"/);
  assert.match(html, /CHRISTIAN CULTURE/);
  assert.match(html, /Milion Drobnych/i);
  assert.match(html, /Mały gest\. Wielka misja\./);
  assert.match(html, /class="header-right/);
  assert.match(html, /id="tickRun"/);
  assert.match(html, /id="promoStage"/);
});

test('T05: Podwójny webhook SETTLED zalicza dokładnie 1 gest i 1 wpłatę (idempotentność)', () => {
  const ledger = createGivingLedger();
  const payload = {
    event_id: 'evt_001',
    payment_id: 'pay_100',
    provider: 'operator_cc',
    supporter_id_hash: 'hash_user_a',
    amount_minor: 500,
    provider_fee_minor: 0,
    kind: 'recurring',
    status: 'settled'
  };

  const r1 = ledger.processWebhookEvent(payload);
  const r2 = ledger.processWebhookEvent(payload); // ten sam event_id
  const r3 = ledger.processWebhookEvent({ ...payload, event_id: 'evt_002' }); // inny event_id, ten sam payment_id

  assert.equal(r1.accepted, true);
  assert.equal(r2.accepted, false);
  assert.equal(r3.accepted, false);

  const summary = ledger.getPublicSummary();
  assert.equal(summary.settled_gestures, 1);
  assert.equal(summary.gross_pln, 5);
  assert.equal(summary.active_recurring_supporters, 1);
});

test('T06: Transakcje FAILED, PENDING oraz TESTOWE dają 0 gestów', () => {
  const ledger = createGivingLedger();
  ledger.processWebhookEvent({
    event_id: 'evt_p1',
    payment_id: 'pay_p1',
    amount_minor: 1000,
    status: 'pending'
  });
  ledger.processWebhookEvent({
    event_id: 'evt_f1',
    payment_id: 'pay_f1',
    amount_minor: 2000,
    status: 'failed'
  });
  ledger.processWebhookEvent({
    event_id: 'evt_t1',
    payment_id: 'pay_t1',
    amount_minor: 500,
    status: 'settled',
    is_test: true
  });

  const summary = ledger.getPublicSummary();
  assert.equal(summary.settled_gestures, 0);
  assert.equal(summary.gross_pln, 0);
});

test('T07: Zwrot (REFUNDED / chargeback) odejmuje wcześniej zaliczony gest i koryguje saldo', () => {
  const ledger = createGivingLedger();
  ledger.processWebhookEvent({
    event_id: 'evt_s1',
    payment_id: 'pay_s1',
    supporter_id_hash: 'hash_u1',
    amount_minor: 1000,
    kind: 'recurring',
    status: 'settled'
  });
  ledger.processWebhookEvent({
    event_id: 'evt_s2',
    payment_id: 'pay_s2',
    supporter_id_hash: 'hash_u2',
    amount_minor: 500,
    kind: 'one_time',
    status: 'settled'
  });

  assert.equal(ledger.getPublicSummary().settled_gestures, 2);

  ledger.processWebhookEvent({
    event_id: 'evt_ref1',
    payment_id: 'pay_s1',
    status: 'refunded'
  });

  const afterRefund = ledger.getPublicSummary();
  assert.equal(afterRefund.settled_gestures, 1);
  assert.equal(afterRefund.gross_pln, 5);
  assert.equal(afterRefund.active_recurring_supporters, 0);
});

test('T13 & T15: Niezaufany podpis webhooka jest odrzucany, a publiczny raport nie zawiera danych osobowych (PII)', () => {
  const secret = 'cc_webhook_secret_test';
  const body = JSON.stringify({ event_id: 'evt_99', payment_id: 'pay_99', status: 'settled', amount_minor: 500 });
  const validSig = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex');

  assert.equal(verifyWebhookSignature(body, validSig, secret), true);
  assert.equal(verifyWebhookSignature(body, 'deadbeef', secret), false);

  const ledger = createGivingLedger();
  const rejected = ledger.processWebhookEvent(JSON.parse(body), { signatureValid: false });
  assert.equal(rejected.accepted, false);
  assert.equal(rejected.reason, 'INVALID_SIGNATURE');

  const summaryKeys = Object.keys(ledger.getPublicSummary());
  assert.deepEqual(summaryKeys.sort(), ['active_recurring_supporters', 'gross_pln', 'net_pln', 'settled_gestures', 'updated_at']);
});
