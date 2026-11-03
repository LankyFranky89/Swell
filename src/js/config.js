// Swell configuration. The client ID is not a secret: it identifies the app,
// it does not grant access on its own. Paste yours from developer.tidal.com.
export const CLIENT_ID = 'jwZF2dM5qE56ke94';

// Must match a redirect URI registered for the app on developer.tidal.com, letter for letter.
export const REDIRECT_URI = 'https://lankyfranky89.github.io/Swell/callback/';

// Third-party scopes listed in Tidal's API reference. Enable the same ones for the app
// in the Tidal developer dashboard.
export const SCOPES = [
  'user.read',
  'collection.read',
  'collection.write',
  'playlists.read',
  'search.read',
  'recommendations.read',
  'playback',
  'entitlements.read',
];

export const APP_NAME = 'Swell';
export const APP_VERSION = '0.1.0';
export const STORAGE_KEY = 'swell';

// Play reports go to Tidal through its event producer so plays are counted.
// These addresses come from Tidal's SDK docs; playback still works if sending fails.
export const EVENTS_URI = 'https://events.tidal.com/batch';
export const EVENTS_PUBLIC_URI = 'https://events.tidal.com/public-batch';

// Default accent when a cover has no usable color.
export const DEFAULT_ACCENT = '#3DDBD9';
