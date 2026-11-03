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

// Sign-in with a code: the TV shows a short code that is approved on a phone or PC.
// Tidal may not allow this for every app; the error is passed on so the screen can say why.
export async function startDeviceLogin() {
  try {
    return await auth.initializeDeviceLogin();
  } catch (first) {
    try {
      return await auth.initializeDeviceLogin({ appApproval: true });
    } catch {
      throw first;
    }
  }
}

// Polls until the code is approved (or expires).
export async function waitForDeviceLogin() {
  await auth.finalizeDeviceLogin();
}

export function describeAuthError(e) {
  if (!e) return 'Unknown error';
  const parts = [e.errorCode, e.name !== 'Error' ? e.name : '', e.message].filter(Boolean);
  return [...new Set(parts)].join(' · ');
}

export function logout() {
  auth.logout();
}
