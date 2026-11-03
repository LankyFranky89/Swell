// Engine backed by Tidal's official web player (@tidal-music/player).
import * as Player from '@tidal-music/player';
import * as EventProducer from '@tidal-music/event-producer';
import { APP_NAME, APP_VERSION, EVENTS_PUBLIC_URI, EVENTS_URI } from './config.js';

function mediaProduct(e) {
  const src = e.source || {};
  return {
    productId: String(e.track.id),
    productType: 'track',
    referenceId: e.ref,
    sourceId: String(src.id || 'swell'),
    sourceType: src.type || 'TRACK',
  };
}

function contextInfo(ctx) {
  if (!ctx) return null;
  return {
    codec: ctx.codec || null,
    bitDepth: ctx.bitDepth || null,
    sampleRate: ctx.sampleRate || null,
    quality: ctx.actualAudioQuality || null,
    preview: ctx.actualAssetPresentation === 'PREVIEW',
    duration: ctx.actualDuration || 0,
  };
}

export async function createTidalEngine(credentialsProvider, log = () => {}) {
  // Play reports, so plays are counted for the artists. Failures here never stop playback.
  let sender = { sendEvent() {} };
  try {
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('Event producer did not start in 6 s')), 6000));
    await Promise.race([timeout, EventProducer.init({
      appInfo: { appName: APP_NAME, appVersion: APP_VERSION },
      blockedConsentCategories: { NECESSARY: false, PERFORMANCE: true, TARGETING: true },
      credentialsProvider,
      platform: {
        browserName: 'webOS TV',
        browserVersion: navigator.userAgent.match(/Chrome\/([\d.]+)/)?.[1] || '',
        deviceVendor: 'LG',
        model: 'webOS TV',
        osName: 'webOS',
        version: APP_VERSION,
      },
      strictMode: false,
      tlConsumerUri: EVENTS_URI,
      tlPublicConsumerUri: EVENTS_PUBLIC_URI,
    })]);
    sender = EventProducer;
  } catch (e) {
    console.warn('Event producer unavailable', e);
    log('Play reports', e);
  }
  const safeSender = {
    ...sender,
    sendEvent(ev) {
      try {
        return sender.sendEvent(ev);
      } catch (e) {
        console.warn('sendEvent failed', e);
        log('Play reports', e);
      }
    },
  };

  Player.bootstrap({
    outputDevices: false,
    players: [
      { itemTypes: ['track'], player: 'shaka', qualities: ['HI_RES_LOSSLESS', 'LOSSLESS', 'HIGH', 'LOW'] },
    ],
  });
  Player.setCredentialsProvider(credentialsProvider);
  Player.setEventSender(safeSender);
  Player.setStreamingWifiAudioQuality(readQuality());

  const h = { state: [], transition: [], preload: [], ended: [], error: [] };
  const fire = (k, ...a) => h[k].forEach((f) => f(...a));

  Player.events.addEventListener('playback-state-change', (e) => fire('state', e.detail.state));
  Player.events.addEventListener('media-product-transition', (e) =>
    fire('transition', e.detail.mediaProduct.referenceId, contextInfo(e.detail.playbackContext)),
  );
  Player.events.addEventListener('preload-request', () => fire('preload'));
  Player.events.addEventListener('ended', (e) => fire('ended', e.detail.reason));
  Player.events.addEventListener('error', (e) => fire('error', e.detail || e));
  Player.events.addEventListener('streaming-privileges-revoked', () =>
    fire('error', { errorCode: 'PRIVILEGES_REVOKED', message: 'Tidal is playing on another device.' }),
  );

  return {
    onState: (f) => h.state.push(f),
    onTransition: (f) => h.transition.push(f),
    onPreload: (f) => h.preload.push(f),
    onEnded: (f) => h.ended.push(f),
    onError: (f) => h.error.push(f),
    load: (e, pos) => Player.load(mediaProduct(e), pos || 0),
    play: () => Player.play(),
    pause: () => Player.pause(),
    seek: (s) => Player.seek(s),
    setNext: (e) => Player.setNext(e ? mediaProduct(e) : undefined),
    position: () => Player.getAssetPosition() || 0,
    setQuality: (q) => {
      Player.setStreamingWifiAudioQuality(q);
    },
  };
}

function readQuality() {
  try {
    const s = JSON.parse(localStorage.getItem('swell.settings') || '{}');
    return s.quality || 'HI_RES_LOSSLESS';
  } catch {
    return 'HI_RES_LOSSLESS';
  }
}
