// Play queue on top of an "engine": Tidal's official player in the real app,
// or a timer-based stand-in in demo mode. The queue decides what plays next;
// the engine only loads, plays and reports.

const listeners = new Map();
function emit(name, detail) {
  (listeners.get(name) || []).forEach((fn) => {
    try {
      fn(detail);
    } catch (e) {
      console.error(e);
    }
  });
}

let engine = null;
let nonce = 0;
const state = {
  entries: [], // { ref, track, source }
  index: -1,
  playback: 'IDLE', // IDLE | PLAYING | NOT_PLAYING | STALLED
  context: null, // { codec, bitDepth, sampleRate, quality }
  repeat: false,
  shuffle: false,
};

export const player = {
  on(name, fn) {
    if (!listeners.has(name)) listeners.set(name, []);
    listeners.get(name).push(fn);
    return () => listeners.set(name, listeners.get(name).filter((f) => f !== fn));
  },
  get current() {
    const e = state.entries[state.index];
    return e ? e.track : null;
  },
  get source() {
    const e = state.entries[state.index];
    return e ? e.source : null;
  },
  get queue() {
    return state.entries.map((e) => e.track);
  },
  get index() {
    return state.index;
  },
  get playback() {
    return state.playback;
  },
  get context() {
    return state.context;
  },
  get shuffle() {
    return state.shuffle;
  },
  get repeat() {
    return state.repeat;
  },
  get playing() {
    return state.playback === 'PLAYING' || state.playback === 'STALLED';
  },
  position() {
    return engine ? engine.position() : 0;
  },
  async init(newEngine) {
    engine = newEngine;
    engine.onState((s) => {
      state.playback = s;
      emit('state', s);
    });
    engine.onTransition((ref, context) => {
      const i = state.entries.findIndex((e) => e.ref === ref);
      if (i >= 0) state.index = i;
      state.context = context || null;
      emit('track', player.current);
      emit('queue');
      preloadNext();
    });
    engine.onPreload(() => preloadNext());
    engine.onEnded((reason) => {
      if (reason === 'completed' && state.index >= state.entries.length - 1) {
        if (state.repeat && state.entries.length) loadIndex(0, true);
        else emit('ended');
      }
    });
    engine.onError((err) => emit('error', err));
  },
  async playTracks(tracks, start = 0, source = null, { shuffle = false } = {}) {
    const list = tracks.filter(Boolean);
    if (!list.length) return;
    let order = list.map((t, i) => i);
    if (shuffle) {
      order = shuffled(order);
      start = 0;
    }
    state.shuffle = shuffle;
    state.entries = order.map((i) => entry(list[i], source));
    await loadIndex(Math.max(0, Math.min(start, state.entries.length - 1)), true);
  },
  async toggle() {
    if (!engine || state.index < 0) return;
    if (player.playing) engine.pause();
    else await engine.play();
  },
  async next() {
    if (state.index < state.entries.length - 1) await loadIndex(state.index + 1, true);
    else if (state.repeat && state.entries.length) await loadIndex(0, true);
  },
  async prev() {
    if (player.position() > 3 || state.index <= 0) {
      await player.seek(0);
      return;
    }
    await loadIndex(state.index - 1, true);
  },
  async seek(seconds) {
    if (!engine || state.index < 0) return;
    await engine.seek(Math.max(0, seconds));
    emit('seek');
  },
  async jumpTo(i) {
    if (i >= 0 && i < state.entries.length) await loadIndex(i, true);
  },
  playNext(track, source = null) {
    if (state.index < 0) return player.playTracks([track], 0, source);
    state.entries.splice(state.index + 1, 0, entry(track, source));
    emit('queue');
    preloadNext();
  },
  addToQueue(track, source = null) {
    if (state.index < 0) return player.playTracks([track], 0, source);
    state.entries.push(entry(track, source));
    emit('queue');
    preloadNext();
  },
  removeAt(i) {
    if (i === state.index || i < 0 || i >= state.entries.length) return;
    state.entries.splice(i, 1);
    if (i < state.index) state.index -= 1;
    emit('queue');
    preloadNext();
  },
  move(i, dir) {
    const j = i + dir;
    if (i === state.index || j === state.index) return false;
    if (j < 0 || j >= state.entries.length || i < 0 || i >= state.entries.length) return false;
    const [e] = state.entries.splice(i, 1);
    state.entries.splice(j, 0, e);
    emit('queue');
    preloadNext();
    return true;
  },
  clearUpcoming() {
    state.entries = state.entries.slice(0, state.index + 1);
    emit('queue');
    preloadNext();
  },
  setRepeat(on) {
    state.repeat = !!on;
    emit('queue');
    preloadNext();
  },
  setQuality(q) {
    if (engine && engine.setQuality) engine.setQuality(q);
  },
};

function entry(track, source) {
  nonce += 1;
  return { ref: `${track.id}-${nonce}`, track, source };
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function loadIndex(i, autoplay) {
  const e = state.entries[i];
  if (!e || !engine) return;
  state.index = i;
  state.context = null;
  emit('track', e.track);
  emit('queue');
  const t0 = Date.now();
  const step = (what) => emit('trace', `${what} (${Date.now() - t0} ms) · track ${e.track.id}`);
  const limit = (promise, what) =>
    Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error(`${what} did not finish in 20 s`)), 20000))]);
  try {
    step('Loading');
    await limit(engine.load(e, 0), 'Loading the track');
    step('Loaded, starting');
    if (autoplay) await limit(engine.play(), 'Starting playback');
    step(`Started, state ${state.playback}`);
  } catch (err) {
    step('Failed');
    emit('error', err);
  }
  preloadNext();
}

function preloadNext() {
  if (!engine) return;
  let n = state.entries[state.index + 1];
  if (!n && state.repeat) n = state.entries[0];
  engine.setNext(n || null).catch(() => {});
}
