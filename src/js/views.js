// The screens. Each view builds its DOM, loads its data, and returns
// { el, color?, onTrack? } to the router.
import {
  badge,
  button,
  card,
  chips,
  emptyState,
  grid,
  iconButton,
  markCurrent,
  row,
  skeletonGrid,
  skeletonPage,
  trackList,
} from './components.js';
import { art, artistNames, colorOf, fmtLong, fmtTime, h, icon, saveSetting, settings, titleOf, fill } from './ui.js';
import { focusFirst } from './nav.js';
import { refreshTheme, setPageColor } from './theme.js';

export function errorView(app, err, retry) {
  const offline = !navigator.onLine || (err && err.status === 0);
  const expired = err && (err.status === 401 || err.status === 403);
  if (expired) {
    return emptyState({
      iconName: 'alert',
      tone: 'coral',
      title: 'Please sign in again',
      text: 'Your Tidal sign-in has expired or lacks permission for this. Your queue is kept.',
      action: button('Sign in', { primary: true, onClick: () => app.signIn() }),
    });
  }
  return emptyState({
    iconName: offline ? 'wifiOff' : 'alert',
    tone: offline ? 'amber' : 'coral',
    title: offline ? "Can't reach Tidal" : 'Something went wrong',
    text: offline
      ? 'Check that your TV is connected to the internet.'
      : 'Tidal did not answer as expected. Try again in a moment.',
    action: h('div', { class: 'actions' }, button('Try again', { primary: true, onClick: retry })),
  });
}

// Run a loader, show a skeleton meanwhile and an error state on failure.
function loading(app, el, skeleton, load, render) {
  fill(el, skeleton);
  const run = () => {
    fill(el, skeleton);
    load()
      .then((data) => {
        if (!el.isConnected && el.dataset.detached) return;
        fill(el, ...[].concat(render(data)).filter(Boolean));
        app.afterRender(el);
      })
      .catch((err) => {
        console.error(err);
        fill(el, errorView(app, err, run));
        app.afterRender(el);
      });
  };
  run();
}

function header(title, right) {
  return h('header', { class: 'page-head' }, h('h1', null, title), right || null);
}

// ------------------------------------------------------------------ Home
export function homeView(app) {
  const el = h('div', { class: 'page' });
  const hour = new Date().getHours();
  const greet = hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  loading(app, el, skeletonPage(), () => app.api.getHome(), (d) => {
    app.rememberFavorites('album', d.albums);
    const out = [header(app.me && app.me.name ? `${greet}, ${app.me.name}` : greet)];
    const cur = app.player.current;
    const heroItem = cur || d.mixes[0] || d.albums[0];
    if (heroItem) out.push(hero(app, heroItem, !!cur));
    out.push(row('Your mixes', d.mixes));
    out.push(row('Recently added albums', d.albums));
    out.push(row('Your playlists', d.playlists));
    d.featured.forEach((m) => out.push(row(m.title, m.items)));
    if (!d.mixes.length && !d.albums.length && !d.playlists.length && !d.featured.length) {
      out.push(
        emptyState({
          iconName: 'heart',
          title: 'Nothing here yet',
          text: 'Favorite albums and playlists in Tidal and they will show up here.',
          action: button('Browse top charts', { primary: true, onClick: () => app.go('charts') }),
        }),
      );
    }
    return out;
  });
  return { el };
}

function hero(app, item, continuing) {
  const isTrack = item.kind === 'track';
  const play = () => {
    if (continuing) return app.openNowPlaying();
    if (item.kind === 'mix') return app.player.playTracks(item.tracks, 0, { type: 'MIX', id: item.id });
    return app.open(item);
  };
  return h(
    'section',
    { class: 'hero' },
    art(item, 640, 'art hero-art'),
    h(
      'div',
      { class: 'hero-text' },
      h('span', { class: 'eyebrow' }, continuing ? 'Continue listening' : item.kind === 'mix' ? 'Made for you' : 'Jump back in'),
      h('span', { class: 'hero-title' }, titleOf(item)),
      h('span', { class: 'hero-sub' }, isTrack ? artistNames(item) : item.kind === 'mix' ? `${item.count} tracks` : artistNames(item)),
      h(
        'div',
        { class: 'actions' },
        button(continuing ? 'Now playing' : 'Play', { primary: true, iconName: 'play', onClick: play, attrs: { 'data-autofocus': '' } }),
        item.kind === 'mix'
          ? button('Shuffle', { iconName: 'shuffle', onClick: () => app.player.playTracks(item.tracks, 0, { type: 'MIX', id: item.id }, { shuffle: true }) })
          : null,
      ),
    ),
  );
}

// ------------------------------------------------------------------ Search
const KEYS = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');

export function searchView(app, params = {}) {
  const input = h('input', {
    class: 'search-input',
    type: 'text',
    placeholder: 'Artists, albums, tracks',
    'aria-label': 'Search',
    autocomplete: 'off',
    spellcheck: 'false',
    value: params.q || '',
  });
  const results = h('div', { class: 'search-results' });
  let timer = null;
  let seq = 0;

  const run = () => {
    const q = input.value.trim();
    app.state.lastSearch = q;
    if (q.length < 2) {
      fill(results, 
        emptyState({ iconName: 'search', title: 'Search Tidal', text: 'Type at least two letters with the keyboard or your remote.' }),
      );
      return;
    }
    const my = ++seq;
    fill(results, skeletonGrid(10, 5));
    app.api
      .search(q)
      .then((r) => {
        if (my !== seq) return;
        const parts = [];
        if (r.top) {
          parts.push(
            h(
              'section',
              { class: 'top-hit' },
              h('h2', { class: 'shelf-title' }, 'Top result'),
              card(r.top, { size: 'l' }),
            ),
          );
        }
        if (r.tracks.length)
          parts.push(
            h(
              'section',
              { class: 'shelf' },
              h('h2', { class: 'shelf-title' }, 'Tracks'),
              trackList(r.tracks.slice(0, 6), { source: { type: 'SEARCH', id: q } }),
            ),
          );
        parts.push(row('Artists', r.artists));
        parts.push(row('Albums', r.albums));
        parts.push(row('Playlists', r.playlists));
        if (!parts.filter(Boolean).length)
          parts.push(emptyState({ iconName: 'search', title: `No results for “${q}”`, text: 'Check the spelling or try fewer words.' }));
        fill(results, ...parts.filter(Boolean));
        app.afterRender(results);
      })
      .catch((err) => {
        if (my !== seq) return;
        fill(results, errorView(app, err, run));
      });
  };
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(run, 450);
  };
  input.addEventListener('input', schedule);

  const type = (ch) => {
    input.value += ch;
    schedule();
  };
  const kb = h(
    'div',
    { class: 'keyboard' },
    h(
      'div',
      { class: 'keys' },
      KEYS.map((k, i) => h('button', { class: 'key', 'data-autofocus': i === 0 ? '' : null, onclick: () => type(k) }, k)),
    ),
    h(
      'div',
      { class: 'keys-row' },
      h('button', { class: 'key key-wide', onclick: () => type(' ') }, 'Space'),
      h(
        'button',
        {
          class: 'key',
          onclick: () => {
            input.value = input.value.slice(0, -1);
            schedule();
          },
        },
        'Delete',
      ),
      h(
        'button',
        {
          class: 'key',
          onclick: () => {
            input.value = '';
            schedule();
          },
        },
        'Clear',
      ),
    ),
  );

  const el = h(
    'div',
    { class: 'page search-page' },
    h(
      'div',
      { class: 'search-left' },
      header('Search'),
      h('label', { class: 'search-box' }, icon('search'), input),
      kb,
    ),
    results,
  );
  if (!input.value && app.state.lastSearch) input.value = app.state.lastSearch;
  run();
  return { el, submit: run };
}

// ------------------------------------------------------------------ Charts
export function chartsView(app) {
  const el = h('div', { class: 'page' });
  loading(app, el, skeletonPage(), () => app.api.getCharts(), (d) => {
    const out = [header('Top charts', h('span', { class: 'muted' }, 'From Tidal'))];
    if (!d.sections.length) {
      out.push(
        emptyState({
          iconName: 'charts',
          title: 'Charts are not available',
          text: 'Tidal did not return any chart lists for this account or country.',
        }),
      );
      return out;
    }
    d.sections.forEach((s) => {
      const tracks = s.items.filter((i) => i.kind === 'track');
      if (tracks.length >= s.items.length / 2 && tracks.length) {
        out.push(
          h(
            'section',
            { class: 'shelf' },
            h('h2', { class: 'shelf-title' }, s.title),
            trackList(tracks.slice(0, 20), { source: { type: 'CHART', id: s.title } }),
          ),
        );
      } else {
        out.push(row(s.title, s.items));
      }
    });
    if (d.source === 'search') out.push(h('p', { class: 'muted note' }, 'Shown from Tidal’s own chart playlists.'));
    return out;
  });
  return { el };
}

// ------------------------------------------------------------------ Library
const LIB_TABS = [
  { value: 'albums', label: 'Albums' },
  { value: 'artists', label: 'Artists' },
  { value: 'playlists', label: 'Playlists' },
  { value: 'tracks', label: 'Tracks' },
];
const LIB_SORTS = {
  albums: [
    { value: '-addedAt', label: 'Recently added' },
    { value: 'title', label: 'Title' },
    { value: 'artists.name', label: 'Artist' },
    { value: '-releaseDate', label: 'Newest release' },
  ],
  artists: [
    { value: '-addedAt', label: 'Recently added' },
    { value: 'name', label: 'Name' },
  ],
  playlists: [
    { value: '-lastModifiedAt', label: 'Recently updated' },
    { value: 'name', label: 'Name' },
  ],
  tracks: [
    { value: '-addedAt', label: 'Recently added' },
    { value: 'title', label: 'Title' },
    { value: 'artists.name', label: 'Artist' },
  ],
};

export function libraryView(app, params = {}) {
  let tab = params.tab || app.state.libTab || 'albums';
  let sort = (app.state.libSort && app.state.libSort[tab]) || LIB_SORTS[tab][0].value;
  const body = h('div', { class: 'lib-body' });
  const sortWrap = h('div', { class: 'lib-sort' });

  const load = () => {
    const items = [];
    let cursor = null;
    const list = h('div');
    const more = button('Load more', {
      cls: 'load-more',
      onClick: () => fetchPage(),
    });
    const fetchPage = () => {
      more.disabled = true;
      return app.api.getLibrary(tab, { sort, cursor }).then((r) => {
        items.push(...r.items);
        cursor = r.next;
        app.rememberFavorites(tab.slice(0, -1), r.items);
        renderList();
        more.disabled = false;
        more.hidden = !cursor;
      });
    };
    const renderList = () => {
      if (!items.length) {
        fill(list, 
          emptyState({
            iconName: 'heart',
            title: `No favorite ${tab} yet`,
            text: `Favorite ${tab} and they will show up here.`,
            action: button('Browse top charts', { primary: true, onClick: () => app.go('charts') }),
          }),
        );
        return;
      }
      if (tab === 'tracks') fill(list, trackList(items, { source: { type: 'COLLECTION', id: 'tracks' }, showAlbum: true }));
      else fill(list, grid(items, { cols: 7 }));
    };
    loading(app, body, skeletonGrid(14, 7), fetchPage, () => [list, more]);
  };

  const renderSort = () => {
    fill(sortWrap, 
      chips(LIB_SORTS[tab], sort, (v) => {
        sort = v;
        app.state.libSort = { ...(app.state.libSort || {}), [tab]: v };
        load();
      }),
    );
  };

  const tabs = chips(LIB_TABS, tab, (v) => {
    tab = v;
    app.state.libTab = v;
    sort = (app.state.libSort && app.state.libSort[tab]) || LIB_SORTS[tab][0].value;
    renderSort();
    load();
  });
  tabs.classList.add('tabs');
  renderSort();
  load();
  const el = h('div', { class: 'page' }, header('Library'), h('div', { class: 'toolbar' }, tabs, h('span', { class: 'divider' }), sortWrap), body);
  return { el };
}

// ------------------------------------------------------------------ Album
export function albumView(app, { id }) {
  const el = h('div', { class: 'page' });
  const view = { el, onTrack: (t) => markCurrent(el, t && t.id) };
  loading(app, el, skeletonPage(), () => app.api.getAlbum(id), ({ album, tracks }) => {
    setPageColor(colorOf(album));
    const src = { type: 'ALBUM', id: album.id };
    const volumes = new Set(tracks.map((t) => t.volume)).size;
    const list = [];
    if (volumes > 1) {
      // One list bound to the whole album (so OK plays from that track onward), split by disc.
      const rows = [...trackList(tracks, { source: src, showArt: false, numbers: tracks.map((t) => t.number || '') }).children];
      [...new Set(tracks.map((t) => t.volume))].forEach((v) => {
        list.push(h('h3', { class: 'disc' }, `Disc ${v}`));
        list.push(h('div', { class: 'tracklist' }, rows.filter((_, i) => tracks[i].volume === v)));
      });
    } else {
      list.push(trackList(tracks, { source: src, showArt: false, numbers: tracks.map((t) => t.number || '') }));
    }
    return [
      detailHero(app, album, {
        eyebrow: album.type === 'ALBUM' ? 'Album' : album.type === 'EP' ? 'EP' : 'Single',
        title: titleOf(album),
        sub: album.artists.map((a) =>
          h('button', { class: 'link', onclick: () => app.go('artist', { id: a.id }) }, a.name),
        ),
        meta: [album.year, `${tracks.length} tracks`, fmtLong(album.duration || tracks.reduce((s, t) => s + t.duration, 0))]
          .filter(Boolean)
          .join(' · '),
        quality: album.quality,
        tracks,
        source: src,
        favKind: 'album',
      }),
      ...list,
    ];
  });
  return view;
}

function detailHero(app, item, { eyebrow, title, sub, meta, quality, tracks, source, favKind, extra = [] }) {
  const fav = app.isFavorite(favKind, item.id);
  const favBtn = button(fav ? 'In favorites' : 'Favorite', {
    iconName: fav ? 'heartFill' : 'heart',
    onClick: async () => {
      const on = !app.isFavorite(favKind, item.id);
      const ok = await app.toggleFavorite(favKind, item, on);
      if (ok) {
        fill(favBtn, icon(on ? 'heartFill' : 'heart'), h('span', null, on ? 'In favorites' : 'Favorite'));
      }
    },
  });
  return h(
    'section',
    { class: `detail-hero ${item.kind === 'artist' ? 'is-artist' : ''}` },
    art(item, 640, `art detail-art`),
    h(
      'div',
      { class: 'detail-text' },
      h('span', { class: 'eyebrow' }, eyebrow),
      h('h1', { class: 'detail-title' }, title),
      sub && (!Array.isArray(sub) || sub.length) ? h('div', { class: 'detail-sub' }, sub) : null,
      h('div', { class: 'detail-meta' }, meta || null, quality ? badge(quality) : null),
      h(
        'div',
        { class: 'actions' },
        tracks && tracks.length
          ? button('Play', { primary: true, iconName: 'play', attrs: { 'data-autofocus': '' }, onClick: () => app.player.playTracks(tracks, 0, source) })
          : null,
        tracks && tracks.length > 1
          ? button('Shuffle', { iconName: 'shuffle', onClick: () => app.player.playTracks(tracks, 0, source, { shuffle: true }) })
          : null,
        favKind ? favBtn : null,
        ...extra,
      ),
    ),
  );
}

// ------------------------------------------------------------------ Artist
export function artistView(app, { id }) {
  const el = h('div', { class: 'page' });
  const view = { el, onTrack: (t) => markCurrent(el, t && t.id) };
  loading(app, el, skeletonPage(), () => app.api.getArtist(id), (d) => {
    setPageColor(colorOf(d.artist));
    const src = { type: 'ARTIST', id };
    const discWrap = h('div');
    const tabs = [
      { value: 'albums', label: `Albums${d.albums.length ? ` (${d.albums.length})` : ''}` },
      { value: 'singles', label: `Singles and EPs${d.singles.length ? ` (${d.singles.length})` : ''}` },
    ].filter((t) => d[t.value].length);
    const showDisc = (v) => fill(discWrap, grid(d[v], { cols: 6 }));
    if (tabs.length) showDisc(tabs[0].value);
    return [
      detailHero(app, d.artist, {
        eyebrow: 'Artist',
        title: d.artist.name,
        meta: [
          d.albums.length ? `${d.albums.length} ${d.albums.length === 1 ? 'album' : 'albums'}` : '',
          d.singles.length ? `${d.singles.length} ${d.singles.length === 1 ? 'single or EP' : 'singles and EPs'}` : '',
        ]
          .filter(Boolean)
          .join(' · '),
        tracks: d.topTracks,
        source: src,
        favKind: 'artist',
      }),
      d.topTracks.length
        ? h('section', { class: 'shelf' }, h('h2', { class: 'shelf-title' }, 'Top tracks'), trackList(d.topTracks.slice(0, 5), { source: src }))
        : null,
      tabs.length
        ? h(
            'section',
            { class: 'shelf' },
            h('h2', { class: 'shelf-title' }, 'Discography'),
            h('div', { class: 'toolbar' }, chips(tabs, tabs[0].value, showDisc)),
            discWrap,
          )
        : null,
      row('Fans also like', d.similar),
    ];
  });
  return view;
}

// ------------------------------------------------------------------ Playlist and mix
export function playlistView(app, { id, mix }) {
  const el = h('div', { class: 'page' });
  const view = { el, onTrack: (t) => markCurrent(el, t && t.id) };
  const load = mix ? () => Promise.resolve({ playlist: mix, tracks: mix.tracks }) : () => app.api.getPlaylist(id);
  loading(app, el, skeletonPage(), load, ({ playlist, tracks }) => {
    setPageColor(colorOf(playlist) || colorOf(tracks[0]));
    const src = { type: mix ? 'MIX' : 'PLAYLIST', id: playlist.id };
    const total = playlist.duration || tracks.reduce((s, t) => s + t.duration, 0);
    return [
      detailHero(app, playlist, {
        eyebrow: mix ? 'Mix' : 'Playlist',
        title: playlist.name,
        sub: playlist.description ? h('span', { class: 'muted clamp' }, playlist.description) : null,
        meta: [`${tracks.length} tracks`, total ? fmtLong(total) : ''].filter(Boolean).join(' · '),
        tracks,
        source: src,
        favKind: mix ? null : 'playlist',
      }),
      tracks.length
        ? trackList(tracks, { source: src, showAlbum: true })
        : emptyState({ iconName: 'music', title: 'This playlist is empty' }),
    ];
  });
  return view;
}

// ------------------------------------------------------------------ Settings
export function settingsView(app) {
  const s = settings();
  const section = (title, sub, ...content) =>
    h('section', { class: 'panel' }, h('h2', null, title), sub ? h('p', { class: 'muted' }, sub) : null, ...content);

  const radio = (options, key, onChange) => {
    const wrap = h('div', { class: 'radios' });
    const render = () =>
      fill(wrap, 
        ...options.map((o) =>
          h(
            'button',
            {
              class: `radio ${settings()[key] === o.value ? 'is-on' : ''}`,
              onclick: () => {
                saveSetting(key, o.value);
                render();
                onChange && onChange(o.value);
              },
            },
            h('span', { class: 'dot' }),
            h('span', { class: 'radio-text' }, h('span', { class: 'radio-title' }, o.label), o.sub ? h('span', { class: 'radio-sub' }, o.sub) : null),
          ),
        ),
      );
    render();
    return wrap;
  };

  const el = h(
    'div',
    { class: 'page settings' },
    header('Settings'),
    section(
      'Streaming quality',
      'Higher quality uses more data. Your TV and speakers decide what you actually hear.',
      radio(
        [
          { value: 'HI_RES_LOSSLESS', label: 'Max', sub: 'Best available, up to Hi-Res lossless' },
          { value: 'LOSSLESS', label: 'High', sub: 'Lossless, CD quality' },
          { value: 'HIGH', label: 'Low', sub: 'Compressed, saves data' },
        ],
        'quality',
        (v) => app.player.setQuality(v),
      ),
    ),
    section(
      'Look and feel',
      null,
      h('h3', null, 'Colors from cover art'),
      radio(
        [
          { value: true, label: 'On', sub: 'Background and accent follow the cover' },
          { value: false, label: 'Off', sub: 'Always use the default teal' },
        ],
        'artColors',
        refreshTheme,
      ),
      h('h3', null, 'Color intensity'),
      radio(
        [
          { value: 'subtle', label: 'Subtle', sub: 'Soft glow on a dark background' },
          { value: 'rich', label: 'Rich', sub: 'Stronger color, still readable' },
        ],
        'intensity',
        refreshTheme,
      ),
      h('h3', null, 'Change between tracks'),
      radio(
        [
          { value: 'slow', label: 'Slow fade' },
          { value: 'quick', label: 'Quick fade' },
          { value: 'none', label: 'No animation', sub: 'Lightest on the TV' },
        ],
        'fade',
        refreshTheme,
      ),
    ),
    section(
      'Account',
      app.me && app.me.name ? `Signed in as ${app.me.name}.` : 'Signed in to Tidal.',
      h('div', { class: 'actions' }, button('Sign out', { onClick: () => app.signOut() })),
    ),
    section(
      'Diagnostics',
      'Recent errors. If something does not work, take a photo of this list.',
      app.errors && app.errors.length
        ? h(
            'div',
            { class: 'diag' },
            app.errors.map((e) => h('div', { class: 'diag-row' }, h('span', { class: 'muted' }, `${e.at} · ${e.where}`), h('span', null, e.text))),
          )
        : h('p', { class: 'muted' }, 'No errors so far.'),
      h('p', { class: 'muted small' }, navigator.userAgent),
    ),
    section(
      'About',
      null,
      h('p', { class: 'muted' }, 'Swell 0.1 · an unofficial app, not affiliated with Tidal. A Tidal subscription is required.'),
    ),
  );
  return { el };
}

// ------------------------------------------------------------------ Sign in
export function signInView(app, { missingClientId } = {}) {
  const panel = h('section', { class: 'signin-steps' });
  const steps = () =>
    fill(
      panel,
      h('span', { class: 'eyebrow' }, 'Sign in with your phone'),
      [
        ['Choose Sign in with your phone', 'A QR code appears here.'],
        ['Scan it with your phone camera', "Tidal's login page opens on the phone."],
        ['Log in and approve', 'Swell on the TV signs in by itself a few seconds later.'],
      ].map(([t, d], i) =>
        h('div', { class: 'step' }, h('span', { class: 'step-n' }, String(i + 1)), h('div', null, h('strong', null, t), h('p', null, d))),
      ),
      h('div', { class: 'note-box' }, icon('lock'), h('span', null, "Your password is only ever entered on Tidal's page.")),
    );

  let abort = null;
  async function startCode() {
    if (abort) abort.abort();
    abort = new AbortController();
    const signal = abort.signal;
    fill(panel, h('span', { class: 'eyebrow' }, 'Sign in with your phone'), h('p', { class: 'lead' }, 'Preparing…'));
    let auth;
    let pair;
    try {
      auth = await import('./auth.js');
      pair = await auth.startPairing();
    } catch (e) {
      console.error(e);
      return showError('Swell could not prepare the sign-in', auth ? auth.describeAuthError(e) : String(e));
    }
    const qr = await qrSvg(pair.url);
    const left = h('span', { class: 'muted' });
    fill(
      panel,
      h('span', { class: 'eyebrow' }, 'Sign in with your phone'),
      h(
        'div',
        { class: 'code-row' },
        h('div', { class: 'qr qr-big', html: qr }),
        h(
          'div',
          { class: 'code-text' },
          h('strong', { class: 'code-link' }, 'Scan with your phone camera'),
          h('p', null, "Log in on Tidal's page and approve. Keep this screen open."),
          left,
        ),
      ),
      h('p', { class: 'muted small' }, 'Waiting for your phone… this screen updates by itself.'),
    );
    const until = Date.now() + 10 * 60 * 1000;
    const timer = setInterval(() => {
      const s = Math.max(0, Math.round((until - Date.now()) / 1000));
      left.textContent = `QR code works for ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }, 1000);
    try {
      await auth.waitForPairing(pair, { signal });
      clearInterval(timer);
      fill(panel, h('span', { class: 'eyebrow' }, 'Signed in'), h('p', { class: 'lead' }, 'Opening Swell…'));
      location.replace(import.meta.env.BASE_URL);
    } catch (e) {
      clearInterval(timer);
      if (signal.aborted) return;
      console.error(e);
      showError('Sign-in did not finish', auth.describeAuthError(e));
    }
  }

  function showError(title, detail) {
    fill(
      panel,
      h('span', { class: 'eyebrow' }, 'Sign in with your phone'),
      h('h2', { class: 'code-error' }, title),
      h('p', { class: 'code-detail' }, detail),
      h('div', { class: 'actions' }, button('Get a new QR code', { primary: true, attrs: { 'data-autofocus': '' }, onClick: startCode })),
    );
    const btn = panel.querySelector('[data-autofocus]');
    if (btn) btn.focus();
  }

  steps();
  return {
    el: h(
      'div',
      { class: 'signin' },
      h(
        'section',
        { class: 'signin-left' },
        h('div', { class: 'brand' }, h('span', { class: 'brand-mark' }, icon('logo')), h('span', null, 'Swell')),
        h('h1', null, 'Sign in to your Tidal account'),
        h('p', { class: 'lead' }, 'A Tidal subscription is required. Sign in on your phone, and the TV follows.'),
        missingClientId ? h('p', { class: 'warn' }, 'The Tidal client ID has not been added to Swell yet, so sign-in cannot start.') : null,
        h(
          'div',
          { class: 'actions' },
          button('Sign in with your phone', {
            primary: true,
            attrs: { 'data-autofocus': '', disabled: missingClientId ? '' : null },
            onClick: startCode,
          }),
          button('Sign in on this TV', { attrs: { disabled: missingClientId ? '' : null }, onClick: () => app.signIn() }),
        ),
        h('div', { class: 'actions' }, button('Try demo mode', { onClick: () => app.startDemo() })),
        h('p', { class: 'muted small' }, 'This is an unofficial app and is not affiliated with Tidal.'),
      ),
      panel,
    ),
  };
}

async function qrSvg(text) {
  const { default: qrcode } = await import('qrcode-generator');
  const q = qrcode(0, 'L');
  q.addData(text);
  q.make();
  return q.createSvgTag({ cellSize: 8, margin: 2, scalable: true });
}

export { fmtTime };
