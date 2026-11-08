import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// Odczyt .env.local
const envContent = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/.env.local', 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx !== -1) {
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
}

const apiKey = env.X_API_KEY;
const apiSecret = env.X_API_SECRET;
const accessToken = env.X_ACCESS_TOKEN;
const accessSecret = env.X_ACCESS_SECRET;

console.log('Testing X API keys...');
console.log('API Key present:', !!apiKey);
console.log('Access Token present:', !!accessToken);

function generateOAuthHeader(method, url) {
  const oauthParams = {
    oauth_consumer_key: apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0'
  };

  const paramString = Object.keys(oauthParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`)
    .join('&');

  const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
  const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessSecret)}`;
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

  oauthParams.oauth_signature = signature;

  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(', ');

  return authHeader;
}

async function verify() {
  const url = 'https://api.twitter.com/2/users/me';
  const authHeader = generateOAuthHeader('GET', url);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader
      }
    });

    const status = res.status;
    const body = await res.text();
    console.log(`X API /2/users/me Status: ${status}`);
    console.log(`X API Response: ${body}`);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

verify();
