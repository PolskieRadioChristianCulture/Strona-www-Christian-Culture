/**
 * CC Mission Giving — Idempotent Ledger & Webhook Verification Engine (ZERO COST)
 * Kampania: Milion Drobnych Gestów (Christian Culture)
 *
 * Zasady nienegocjowalne:
 * 1. 1 skutecznie rozliczona wpłata (status === 'settled') = 1 gest.
 * 2. Podwójny webhook o tym samym event_id lub payment_id (settled) nie dubluje gestu.
 * 3. Zwrot (refunded) lub chargeback odejmuje wcześniej zaliczony gest.
 * 4. Transakcje pending, failed lub testowe (is_test === true) nigdy nie zwiększają licznika.
 * 5. Zero danych osobowych (PII) w publicznym podsumowaniu.
 */

import crypto from 'node:crypto';

export function verifyWebhookSignature(rawBody, signatureHex, secret) {
  if (!rawBody || !signatureHex || !secret) return false;
  const expected = crypto.createHmac('sha256', String(secret)).update(String(rawBody), 'utf8').digest('hex');
  try {
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(String(signatureHex), 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function createGivingLedger() {
  const seenEvents = new Set();
  const payments = new Map(); // payment_id -> record

  function processWebhookEvent(payload, { signatureValid = true } = {}) {
    if (!signatureValid) {
      return { accepted: false, reason: 'INVALID_SIGNATURE' };
    }
    if (!payload || typeof payload !== 'object') {
      return { accepted: false, reason: 'INVALID_PAYLOAD' };
    }
    if (payload.is_test === true || payload.env === 'test') {
      return { accepted: false, reason: 'TEST_TRANSACTION_IGNORED' };
    }

    const eventId = String(payload.event_id || '').trim();
    const paymentId = String(payload.payment_id || '').trim();
    const status = String(payload.status || '').trim().toLowerCase();
    const amountMinor = Number(payload.amount_minor) || 0;
    const feeMinor = Number(payload.provider_fee_minor) || 0;
    const kind = payload.kind === 'recurring' ? 'recurring' : 'one_time';
    const supporterHash = payload.supporter_id_hash ? String(payload.supporter_id_hash) : null;

    if (!eventId || !paymentId) {
      return { accepted: false, reason: 'MISSING_IDS' };
    }
    if (seenEvents.has(eventId)) {
      return { accepted: false, reason: 'DUPLICATE_EVENT_ID' };
    }
    seenEvents.add(eventId);

    const existing = payments.get(paymentId);

    if (status === 'settled') {
      if (existing && existing.status === 'settled') {
        return { accepted: false, reason: 'ALREADY_SETTLED' };
      }
      if (amountMinor <= 0) {
        return { accepted: false, reason: 'INVALID_AMOUNT' };
      }
      payments.set(paymentId, {
        payment_id: paymentId,
        provider: String(payload.provider || 'unknown'),
        supporter_id_hash: supporterHash,
        amount_minor: amountMinor,
        provider_fee_minor: feeMinor,
        currency: 'PLN',
        kind,
        status: 'settled',
        settled_at: payload.settled_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      return { accepted: true, status: 'settled' };
    }

    if (status === 'refunded' || status === 'chargeback') {
      if (!existing || existing.status !== 'settled') {
        return { accepted: false, reason: 'REFUND_WITHOUT_SETTLED' };
      }
      payments.set(paymentId, {
        ...existing,
        status,
        updated_at: new Date().toISOString()
      });
      return { accepted: true, status };
    }

    if (status === 'pending' || status === 'failed') {
      if (!existing) {
        payments.set(paymentId, {
          payment_id: paymentId,
          provider: String(payload.provider || 'unknown'),
          supporter_id_hash: supporterHash,
          amount_minor: amountMinor,
          provider_fee_minor: feeMinor,
          currency: 'PLN',
          kind,
          status,
          updated_at: new Date().toISOString()
        });
      }
      return { accepted: true, status, gestureCounted: false };
    }

    return { accepted: false, reason: 'UNSUPPORTED_STATUS' };
  }

  function getPublicSummary() {
    let settledGestures = 0;
    let grossMinor = 0;
    let netMinor = 0;
    const activeRecurringHashes = new Set();

    for (const rec of payments.values()) {
      if (rec.status === 'settled') {
        settledGestures += 1;
        grossMinor += rec.amount_minor;
        netMinor += Math.max(0, rec.amount_minor - rec.provider_fee_minor);
        if (rec.kind === 'recurring' && rec.supporter_id_hash) {
          activeRecurringHashes.add(rec.supporter_id_hash);
        }
      }
    }

    return {
      settled_gestures: settledGestures,
      active_recurring_supporters: activeRecurringHashes.size,
      gross_pln: Number((grossMinor / 100).toFixed(2)),
      net_pln: Number((netMinor / 100).toFixed(2)),
      updated_at: new Date().toISOString()
    };
  }

  return {
    processWebhookEvent,
    getPublicSummary
  };
}
