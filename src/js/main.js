// Swell entry point: sign-in handling, the router, the side menu, the mini player
// and the glue between screens, the play queue and the colour theme.
import './polyfills.js';
import { player } from './player.js';
import { initNav, focusFirst, setScope, reveal } from './nav.js';
import { initTheme, setBaseColor, setPageColor } from './theme.js';
import { setComponentContext } from './components.js';
import { art, artistNames, colorOf, fmtTime, h, icon, titleOf, fill } from './ui.js';
import * as views from './views.js';
import { menuOverlay, nowPlaying, queueOverlay } from './overlays.js';

const BASE = import.meta.env.BASE_URL; // '/Swell/'
const demo = /[?&]demo=1/.test(location.search) || sessionStorage.getItem('swell.demo') === '1';

const app = {
  api: null,
  player,
  me: null,
  state: {},
  favorites: { album: new Set(), artist: new Set(), playlist: new Set(), track: new Set() },
};

const ROUTES = {
  home: views.homeView,
  search: views.searchView,
  charts: views.chartsView,
  library: views.libraryView,
  settings: views.settingsView,
  album: views.albumView,
  artist: views.artistView,
  playlist: views.playlistView,
};
const TOP = ['home', 'search', 'charts', 'library', 'settings'];

const stack = []; // { name, params, view, focusKey, scroll }
const overlays = []; // { el, destroy }
let viewEl;
let sidebar;
let mini;

// ------------------------------------------------------------------ routing
app.go = (name, params = {}, { replace = false } = {}) => {
  closeAllOverlays();
  const top = stack[stack.length - 1];
  if (top) saveFocus(top);
  if (TOP.includes(name)) {
    // Top-level sections reset the history so Back always lands on Home.
    stack.forEach((s) => s.view && s.view.destroy && s.view.destroy());
    stack.length = 0;
    if (name !== 'home') stack.push({ name: 'home', params: {} });
  } else if (replace && stack.length) {
    const old = stack.pop();
    old.view && old.view.destroy && old.view.destroy();
  }
  stack.push({ name, params });
  render();
};

app.back = () => {
  if (overlays.length) return app.closeOverlay();
  if (stack.length > 1) {
    const old = stack.pop();
    old.view && old.view.destroy && old.view.destroy();
    render(true);
    return;
  }
  // On Home, Back moves focus to the side menu first; webOS shows its own exit prompt otherwise.
  const a = document.activeElement;
  if (!sidebar.contains(a)) {
    const btn = sidebar.querySelector('.is-active') || sidebar.querySelector('button');
    if (btn) btn.focus();
  } else if (window.webOS && window.webOS.platformBack) {
    window.webOS.platformBack();
  }
};

function saveFocus(entry) {
  const a = document.activeElement;
  entry.scroll = viewEl.scrollTop;
  if (a && viewEl.contains(a)) {
    const all = [...viewEl.querySelectorAll('button, input, a[href], [data-focus]')];
    entry.focusIndex = all.indexOf(a);
  } else entry.focusIndex = -1;
}

function render(restoring = false) {
  const entry = stack[stack.length - 1];
  setPageColor(null);
  const make = ROUTES[entry.name] || ROUTES.home;
  // Re-create the view; data comes from the API cache quickly when going back.
  const v = make(app, entry.params);
  entry.view = v;
  fill(viewEl, v.el);
  viewEl.scrollTop = 0;
  updateSidebar(entry.name);
  entry.restoring = restoring;
  app.afterRender(v.el);
}

app.afterRender = (el) => {
  const entry = stack[stack.length - 1];
  if (!entry || !entry.view) return;
  if (!(entry.view.el === el || entry.view.el.contains(el))) return;
  if (overlays.length) return;
  if (entry.restoring && entry.focusIndex >= 0) {
    const all = [...viewEl.querySelectorAll('button, input, a[href], [data-focus]')];
    const target = all[entry.focusIndex];
    if (target) {
      entry.restoring = false;
      viewEl.scrollTop = entry.scroll || 0;
      target.focus({ preventScroll: true });
      reveal(target);
      return;
    }
  }
  const a = document.activeElement;
  if (a && a.isConnected && viewEl.contains(a)) return;
  focusFirst(viewEl);
};

function updateSidebar(name) {
  const section = TOP.includes(name) ? name : stack.map((s) => s.name).filter((n) => TOP.includes(n)).pop() || 'home';
  sidebar.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('is-active', b.dataset.route === section));
}

// ------------------------------------------------------------------ opening things
app.open = (item) => {
  if (!item) return;
  if (item.kind === 'album') app.go('album', { id: item.id });
  else if (item.kind === 'artist') app.go('artist', { id: item.id });
  else if (item.kind === 'playlist') app.go('playlist', { id: item.id });
  else if (item.kind === 'mix') app.go('playlist', { id: item.id, mix: item });
  else if (item.kind === 'track') player.playTracks([item], 0, { type: 'TRACK', id: item.id });
};

async function tracksOf(item) {
  if (item.kind === 'album') return (await app.api.getAlbum(item.id)).tracks;
  if (item.kind === 'playlist') return (await app.api.getPlaylist(item.id)).tracks;
  if (item.kind === 'mix') return item.tracks;
  if (item.kind === 'artist') return (await app.api.getArtist(item.id)).topTracks;
  if (item.kind === 'track') return [item];
  return [];
}

const sourceOf = (item) => ({ type: { album: 'ALBUM', playlist: 'PLAYLIST', mix: 'MIX', artist: 'ARTIST', track: 'TRACK' }[item.kind], id: item.id });

app.playItem = async (item, { shuffle = false } = {}) => {
  try {
    const tracks = await tracksOf(item);
    await player.playTracks(tracks, 0, sourceOf(item), { shuffle });
  } catch (e) {
    app.toast('Could not start playback');
  }
};

app.queueItem = async (item) => {
  try {
    const tracks = await tracksOf(item);
    tracks.forEach((t) => player.addToQueue(t, sourceOf(item)));
    app.toast(`Added ${tracks.length} tracks to the queue`);
  } catch {
    app.toast('Could not add to the queue');
  }
};

// ------------------------------------------------------------------ favorites
app.rememberFavorites = (kind, items) => {
  const set = app.favorites[kind];
  if (set) (items || []).forEach((i) => set.add(String(i.id)));
};
app.isFavorite = (kind, id) => !!(kind && app.favorites[kind] && app.favorites[kind].has(String(id)));
app.toggleFavorite = async (kind, item, on) => {
  try {
    await app.api.setFavorite(kind, item.id, on);
    if (on) app.favorites[kind].add(String(item.id));
    else app.favorites[kind].delete(String(item.id));
    app.toast(on ? 'Added to favorites' : 'Removed from favorites');
    return true;
  } catch (e) {
    console.error(e);
    app.toast(e && e.status === 403 ? 'Tidal did not allow this change' : 'Could not update favorites');
    return false;
  }
};

// ------------------------------------------------------------------ overlays
function openOverlay(o) {
  const prev = document.activeElement;
  o.returnFocus = prev;
  overlays.push(o);
  document.getElementById('overlays').appendChild(o.el);
  document.getElementById('app').setAttribute('inert', '');
  setScope(o.el);
  requestAnimationFrame(() => focusFirst(o.el));
}

app.closeOverlay = () => {
  const o = overlays.pop();
  if (!o) return;
  o.destroy && o.destroy();
  o.el.remove();
  const top = overlays[overlays.length - 1];
  setScope(top ? top.el : null);
  if (!top) document.getElementById('app').removeAttribute('inert');
  if (o.returnFocus && o.returnFocus.isConnected) o.returnFocus.focus({ preventScroll: true });
  else focusFirst(top ? top.el : viewEl);
};

function closeAllOverlays() {
  while (overlays.length) app.closeOverlay();
}

app.openNowPlaying = () => {
  if (overlays.some((o) => o.kind === 'np')) return;
  const o = nowPlaying(app);
  o.kind = 'np';
  openOverlay(o);
};
app.openQueue = () => openOverlay(queueOverlay(app));
app.menu = (item, extra) => openOverlay(menuOverlay(app, item, extra));

let toastTimer;
app.toast = (text) => {
  const t = document.getElementById('toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
};

// ------------------------------------------------------------------ shell
function buildSidebar() {
  const item = (route, label, iconName) =>
    h(
      'button',
      {
        class: 'nav-item',
        'data-route': route,
        onclick: () => app.go(route),
      },
      icon(iconName),
      h('span', null, label),
    );
  return h(
    'nav',
    { class: 'sidebar', 'aria-label': 'Main' },
    h('div', { class: 'brand' }, h('span', { class: 'brand-mark' }, icon('logo')), h('span', null, 'Swell')),
    item('home', 'Home', 'home'),
    item('search', 'Search', 'search'),
    item('charts', 'Charts', 'charts'),
    item('library', 'Library', 'library'),
    h('div', { class: 'nav-spacer' }),
    item('settings', 'Settings', 'settings'),
    demo ? h('span', { class: 'demo-tag' }, 'Demo mode') : null,
  );
}

function buildMini() {
  const artBox = h('div', { class: 'mini-art-wrap' });
  const title = h('span', { class: 'mini-title' });
  const sub = h('span', { class: 'mini-sub' });
  const cur = h('span', { class: 'mini-time' });
  const dur = h('span', { class: 'mini-time' });
  const barFill = h('div', { class: 'bar-fill' });
  const playBtn = h('button', { class: 'mini-play', 'aria-label': 'Play or pause', onclick: () => player.toggle() });
  const openBtn = h(
    'button',
    { class: 'mini-open', 'aria-label': 'Open Now Playing', onclick: () => app.openNowPlaying() },
    artBox,
    h('span', { class: 'mini-text' }, title, sub),
  );
  const el = h(
    'footer',
    { class: 'mini', hidden: true },
    openBtn,
    h('div', { class: 'mini-progress' }, cur, h('div', { class: 'bar-track' }, barFill), dur),
    h(
      'div',
      { class: 'mini-controls' },
      h('button', { class: 'icon-btn', 'aria-label': 'Previous', onclick: () => player.prev() }, icon('prev')),
      playBtn,
      h('button', { class: 'icon-btn', 'aria-label': 'Next', onclick: () => player.next() }, icon('next')),
      h('button', { class: 'icon-btn', 'aria-label': 'Queue', onclick: () => app.openQueue() }, icon('queue')),
    ),
  );
  let lastId = null;
  const renderTrack = () => {
    const t = player.current;
    el.hidden = !t;
    document.body.classList.toggle('has-mini', !!t);
    if (!t) return;
    if (t.id !== lastId) {
      lastId = t.id;
      fill(artBox, art(t, 160, 'art mini-art'));
      title.textContent = titleOf(t);
      sub.textContent = artistNames(t);
    }
  };
  const renderState = () => fill(playBtn, icon(player.playing ? 'pause' : 'play'));
  const tick = () => {
    const t = player.current;
    if (!t) return;
    const d = (player.context && player.context.duration) || t.duration || 0;
    const pos = player.position();
    barFill.style.width = d ? `${Math.min(100, (pos / d) * 100)}%` : '0%';
    cur.textContent = fmtTime(pos);
    dur.textContent = fmtTime(d);
  };
  player.on('track', renderTrack);
  player.on('state', renderState);
  setInterval(tick, 1000);
  renderTrack();
  renderState();
  return el;
}

// ------------------------------------------------------------------ sign-in
app.signIn = async () => {
  if (demo) return;
  const { startLogin } = await import('./auth.js');
  try {
    await startLogin();
  } catch (e) {
    console.error(e);
    app.toast('Could not open Tidal sign-in');
  }
};

app.signOut = async () => {
  if (demo) {
    sessionStorage.removeItem('swell.demo');
    location.href = BASE;
    return;
  }
  const { logout } = await import('./auth.js');
  logout();
  location.href = BASE;
};

app.startDemo = () => {
  sessionStorage.setItem('swell.demo', '1');
  location.href = `${BASE}?demo=1`;
};

function showSignIn(opts) {
  const root = document.getElementById('root');
  const v = views.signInView(app, opts);
  fill(root, v.el);
  initNav(root, { back: () => {}, media: () => {} });
  focusFirst(root);
}

function showFatal(title, text) {
  const root = document.getElementById('root');
  fill(root, 
    h('div', { class: 'fatal' }, icon('alert', 'state-ico'), h('h1', null, title), h('p', null, text), h('button', { class: 'btn btn-primary', onclick: () => (location.href = BASE) }, 'Try again')),
  );
  root.querySelector('button').focus();
}

// ------------------------------------------------------------------ start
async function startApp() {
  const root = document.getElementById('root');
  viewEl = h('main', { id: 'view', class: 'view' });
  sidebar = buildSidebar();
  mini = buildMini();
  fill(root, h('div', { id: 'app', class: 'shell' }, sidebar, viewEl, mini));
  initTheme();
  setComponentContext({ open: app.open, menu: app.menu, player });

  initNav(root, {
    back: app.back,
    media: (what) => {
      if (what === 'next') player.next();
      else if (what === 'prev') player.prev();
      else if (what === 'play') !player.playing && player.toggle();
      else if (what === 'pause') player.playing && player.toggle();
      else player.toggle();
    },
    submit: () => {
      const entry = stack[stack.length - 1];
      if (entry && entry.view && entry.view.submit) entry.view.submit();
    },
    edge: (dir) => {
      // Right from the side menu enters the page; left from the page edge opens the menu.
      if (dir === 'RIGHT' && sidebar.contains(document.activeElement)) focusFirst(viewEl);
      if (dir === 'LEFT' && viewEl.contains(document.activeElement)) {
        const btn = sidebar.querySelector('.is-active');
        if (btn) btn.focus();
      }
    },
  });

  player.on('track', (t) => {
    setBaseColor(colorOf(t));
    const entry = stack[stack.length - 1];
    if (entry && entry.view && entry.view.onTrack) entry.view.onTrack(t);
  });
  player.on('error', (err) => {
    console.error('Player error', err);
    const code = err && (err.errorCode || err.code);
    if (code === 'PRIVILEGES_REVOKED') app.toast('Playback moved to another device');
    else if (err && /EUN|subscription|privilege/i.test(String(err.message || err.errorId || ''))) app.toast('Your Tidal subscription does not allow this track');
    else app.toast('This track could not be played');
  });

  try {
    app.me = await app.api.getMe();
    if (app.api.setCountry) app.api.setCountry(app.me.country);
  } catch (e) {
    console.warn('Could not read account', e);
    if (e && e.status === 401) {
      showSignIn({});
      return;
    }
  }
  app.go('home');
}

async function boot() {
  const path = location.pathname;
  if (demo) {
    const [{ demoApi, createDemoEngine }] = await Promise.all([import('./demo.js')]);
    app.api = demoApi;
    await player.init(createDemoEngine());
    return startApp();
  }

  const authMod = await import('./auth.js');
  if (authMod.clientIdMissing()) {
    showSignIn({ missingClientId: true });
    return;
  }
  await authMod.initAuth();

  // Coming back from Tidal's login page.
  if (/\/callback\/?$/.test(path)) {
    const q = location.search;
    if (/[?&](code|error)=/.test(q)) {
      try {
        await authMod.finishLogin(q);
      } catch (e) {
        console.error(e);
        showFatal('Sign-in did not finish', 'Tidal did not confirm the sign-in. Please try again.');
        return;
      }
    }
    location.replace(BASE);
    return;
  }

  if (!(await authMod.isSignedIn())) {
    showSignIn({});
    return;
  }

  const apiMod = await import('./api.js');
  apiMod.initApi();
  app.api = apiMod;
  try {
    const { createTidalEngine } = await import('./engine-tidal.js');
    await player.init(await createTidalEngine(authMod.credentialsProvider));
  } catch (e) {
    console.error('Player could not start', e);
    showFatal('The player could not start', 'This TV may not support Tidal’s web player. Try updating the TV software.');
    return;
  }
  startApp();
}

boot().catch((e) => {
  console.error(e);
  showFatal('Swell could not start', String((e && e.message) || e));
});
