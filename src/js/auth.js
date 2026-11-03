// Sign-in with Tidal's own login page (authorization code with PKCE).
// The SDK stores and refreshes the tokens itself; Swell never sees the password.
import * as auth from '@tidal-music/auth';
import { CLIENT_ID, REDIRECT_URI, SCOPES, STORAGE_KEY } from './config.js';

export const credentialsProvider = auth.credentialsProvider;

export function clientIdMissing() {
  return !CLIENT_ID || CLIENT_ID.startsWith('PASTE_');
}

export async function initAuth() {
  await auth.init({
    clientId: CLIENT_ID,
    credentialsStorageKey: STORAGE_KEY,
    scopes: SCOPES,
  });
}

export async function isSignedIn() {
  try {
    const c = await auth.credentialsProvider.getCredentials();
    return !!(c && c.token && c.userId);
  } catch {
    return false;
  }
}

export async function startLogin() {
  const lang = (navigator.language || 'en').slice(0, 2);
  const url = await auth.initializeLogin({
    redirectUri: REDIRECT_URI,
    loginConfig: { language: lang },
  });
  window.location.href = url;
}

// Called on the /callback/ page after Tidal sends the user back.
export async function finishLogin(query) {
  await auth.finalizeLogin(query);
}

// ---------------------------------------------------------------------------------
// Sign in with your phone. Tidal blocks its login page in the TV browser and keeps
// code sign-in for its own apps, so:
//   1. The TV prepares a normal Tidal sign-in (with a secret PKCE verifier that stays
//      on the TV) and shows the link as a QR code.
//   2. The phone opens it, logs in, and Tidal returns to Swell's callback page on the phone.
//   3. That page passes the one-time code to the TV through a ntfy.sh topic whose random
//      name is in the link. The code is useless without the TV's verifier.
//   4. The TV exchanges the code for tokens itself.
export const PAIR_PREFIX = 'swellpair';
const RELAY = 'https://ntfy.sh';

function randomTopic() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  const abc = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return PAIR_PREFIX + [...bytes].map((b) => abc[b % abc.length]).join('');
}

export async function startPairing() {
  const topic = randomTopic();
  const url = await auth.initializeLogin({ redirectUri: REDIRECT_URI, loginConfig: { state: topic } });
  return { url, topic, since: Math.floor(Date.now() / 1000) - 5 };
}

// Wait for the phone to hand over the code, then finish sign-in on the TV.
export async function waitForPairing({ topic, since }, { signal, timeoutMs = 10 * 60 * 1000 } = {}) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    if (signal && signal.aborted) throw new Error('Cancelled');
    let res = null;
    try {
      res = await fetch(`${RELAY}/${topic}/json?poll=1&since=${since}`, { signal, cache: 'no-store' });
    } catch (e) {
      if (signal && signal.aborted) throw e;
    }
    if (res && res.ok) {
      const lines = (await res.text()).split('\n').filter(Boolean);
      for (const line of lines) {
        let msg;
        try {
          msg = JSON.parse(line);
        } catch {
          continue;
        }
        if (msg.event !== 'message' || !msg.message) continue;
        const q = new URLSearchParams(msg.message);
        if (q.get('state') !== topic) continue;
        if (q.get('error')) throw new Error(q.get('error_description') || q.get('error'));
        if (q.get('code')) {
          await auth.finalizeLogin(msg.message);
          return;
        }
      }
    }
    await new Promise((r) => setTimeout(r, 2500));
  }
  throw new Error('The QR code expired. Get a new one.');
}

// On the phone's callback page: is this a TV sign-in, and if so, pass it on.
export function isPairingCallback(query) {
  const s = new URLSearchParams(query).get('state') || '';
  return s.startsWith(PAIR_PREFIX);
}

export async function handOverToTv(query) {
  const topic = new URLSearchParams(query).get('state');
  const q = query.startsWith('?') ? query.slice(1) : query;
  const res = await fetch(`${RELAY}/${topic}`, { method: 'POST', body: q });
  if (!res.ok) throw new Error(`Relay answered ${res.status}`);
}

export function describeAuthError(e) {
  if (!e) return 'Unknown error';
  const parts = [e.errorCode, e.name !== 'Error' ? e.name : '', e.message].filter(Boolean);
  return [...new Set(parts)].join(' · ');
}

export function logout() {
  auth.logout();
}
