import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleVolunteerApiRequest, RODO_ADMIN_INFO } from '../services/cc-volunteer/volunteer-service.js';

test('GET /api/wolontariat zwraca status 200 oraz metadane serwisu i administratora RODO', async () => {
  const req = new Request('https://polskieradio.cc/api/wolontariat', { method: 'GET' });
  const res = await handleVolunteerApiRequest(req, {});
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'active');
  assert.equal(data.routingAddress, 'wolontariat@polskieradio.cc');
  assert.equal(data.forwardDestination, 'polskiercctv@gmail.com');
  assert.equal(data.administrator, RODO_ADMIN_INFO.administrator);
});

test('Inne metody niż GET i POST zwracają 405 METHOD_NOT_ALLOWED', async () => {
  const req = new Request('https://polskieradio.cc/api/wolontariat', { method: 'PUT' });
  const res = await handleVolunteerApiRequest(req, {});
  assert.equal(res.status, 405);
  const data = await res.json();
  assert.equal(data.error, 'METHOD_NOT_ALLOWED');
});

test('POST bez nagłówka application/json zwraca 415 INVALID_CONTENT_TYPE', async () => {
  const req = new Request('https://polskieradio.cc/api/wolontariat', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: 'hello'
  });
  const res = await handleVolunteerApiRequest(req, {});
  assert.equal(res.status, 415);
  const data = await res.json();
  assert.equal(data.error, 'INVALID_CONTENT_TYPE');
});

test('POST z wypełnionym polem honeypot zwraca ciche 200 accepted (ochrona antyspamowa)', async () => {
  const req = new Request('https://polskieradio.cc/api/wolontariat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ website: 'http://spam.com', name: 'Bot', email: 'bot@spam.com' })
  });
  const res = await handleVolunteerApiRequest(req, {});
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.status, 'accepted');
});

test('POST z brakującymi danymi lub brakiem zgody RODO zwraca błąd 400', async () => {
  // Brak nazwiska
  let req = new Request('https://polskieradio.cc/api/wolontariat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'jan@example.com', specialty: 'prawo', privacyConsent: true })
  });
  let res = await handleVolunteerApiRequest(req, {});
  assert.equal(res.status, 400);
  let data = await res.json();
  assert.equal(data.field, 'name');

  // Niepoprawny email
  req = new Request('https://polskieradio.cc/api/wolontariat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Jan Kowalski', email: 'zly-email', specialty: 'prawo', privacyConsent: true })
  });
  res = await handleVolunteerApiRequest(req, {});
  assert.equal(res.status, 400);
  data = await res.json();
  assert.equal(data.field, 'email');

  // Brak zgody RODO
  req = new Request('https://polskieradio.cc/api/wolontariat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Jan Kowalski', email: 'jan@example.com', specialty: 'prawo', privacyConsent: false })
  });
  res = await handleVolunteerApiRequest(req, {});
  assert.equal(res.status, 400);
  data = await res.json();
  assert.equal(data.error, 'CONSENT_REQUIRED');
});

test('POST z poprawnymi danymi zwraca 200 accepted i identyfikator VOL- z routingiem', async () => {
  const req = new Request('https://polskieradio.cc/api/wolontariat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Jan Kowalski',
      email: 'jan.kowalski@example.com',
      phone: '+48 600 000 000',
      specialty: 'prawo, oddłużanie',
      qualifications: 'Radca prawny z 10-letnim doświadczeniem, chęć wsparcia pro bono',
      privacyConsent: true,
      futureRecruitmentConsent: true
    })
  });
  const res = await handleVolunteerApiRequest(req, {});
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.status, 'accepted');
  assert.match(data.id, /^VOL-[A-Z0-9]+-[A-Z0-9]+/);
  assert.equal(data.destination, 'wolontariat@polskieradio.cc');
  assert.equal(data.forwardTo, 'polskiercctv@gmail.com');
  assert.match(data.message, /przyjęte/);
});
