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

export function logout() {
  auth.logout();
}
