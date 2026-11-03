// Demo mode: invented artists and albums and a pretend player, so Swell can be
// tried on the TV (or tested) without signing in. Nothing here talks to Tidal.

const PALETTE = ['#3DDBD9', '#F2B84B', '#B58CF5', '#F5846C', '#5CE0A4', '#6C8CF5', '#E86FA8', '#8A8F98'];
const DARKS = ['#3A1C4D', '#7A2E3A', '#1B1F4B', '#0F3B4A', '#2A1238', '#10131A'];

function coverSvg(a, b, shape) {
  const shapes = [
    `<circle cx="300" cy="300" r="190" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="6"/><circle cx="300" cy="300" r="70" fill="rgba(255,255,255,.8)"/>`,
    `<rect x="150" y="150" width="300" height="300" rx="20" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="6" transform="rotate(12 300 300)"/>`,
    `<path d="M60 380 C180 220 300 520 540 260" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="10"/>`,
    `<circle cx="420" cy="200" r="110" fill="rgba(255,255,255,.22)"/><circle cx="220" cy="390" r="150" fill="rgba(0,0,0,.18)"/>`,
  ];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="600" height="600" fill="url(#g)"/>${shapes[shape % shapes.length]}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function cover(i) {
  const a = PALETTE[i % PALETTE.length];
  const b = DARKS[(i * 3 + 1) % DARKS.length];
  // Grey covers (index 7) show the fallback to the default accent.
  return { files: [{ href: coverSvg(a, b, i), w: 600 }], color: a };
}

const ARTISTS = ['Harbor Static', 'Mira Oyelaran', 'Kestrel Rowe', 'Oko Brandt', 'Pale Meridian', 'Lumen Fjord', 'Ada Vesper', 'Northline'];
const ALBUM_TITLES = [
  'Glass Coast', 'Tidewrack', 'Lantern Years', 'Offshore', 'Paper Lanterns', 'Salt Atlas', 'Low Water', 'Quiet Engine',
  'After Rain', 'Signal Garden', 'Copper Hours', 'North Platform', 'Slow Orbit', 'Wide Open Room', 'Blue Interval',
  'Tape Weather', 'Distant Rooms', 'Soft Machinery', 'Night Ferry', 'Silver Delta', 'Morning Static', 'Fjordlight',
];
const WORDS = ['Slow', 'Lights', 'Salt', 'Signal', 'Night', 'Ferry', 'Glass', 'Hour', 'Pier', 'Home', 'Low', 'Tide', 'Copper', 'Orbit', 'Blue', 'Paper', 'Static', 'Harbor', 'Echo', 'Drift', 'North', 'Weather', 'Room', 'Garden'];

const rnd = (seed) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

const artists = ARTISTS.map((name, i) => ({ kind: 'artist', id: `ar${i}`, name, picture: cover(i + 3) }));
const albums = [];
const tracks = new Map();
ALBUM_TITLES.forEach((title, i) => {
  const r = rnd(i + 7);
  const artist = artists[i % artists.length];
  const type = i % 5 === 3 ? 'EP' : i % 7 === 5 ? 'SINGLE' : 'ALBUM';
  const count = type === 'ALBUM' ? 8 + Math.floor(r() * 6) : type === 'EP' ? 5 : 2;
  const year = String(2015 + Math.floor(r() * 11));
  const album = {
    kind: 'album',
    id: `al${i}`,
    title,
    version: '',
    type,
    releaseDate: `${year}-0${1 + (i % 9)}-15`,
    year,
    count,
    duration: 0,
    explicit: false,
    quality: i % 3 === 1 ? 'HIGH' : 'MAX',
    artists: [{ id: artist.id, name: artist.name }],
    cover: cover(i),
  };
  const list = [];
  for (let n = 0; n < count; n++) {
    const t = {
      kind: 'track',
      id: `tr${i}_${n}`,
      title: n === 0 ? title : `${WORDS[Math.floor(r() * WORDS.length)]} ${WORDS[Math.floor(r() * WORDS.length)]}`,
      version: '',
      duration: 150 + Math.floor(r() * 150),
      explicit: false,
      quality: album.quality,
      artists: [{ id: artist.id, name: artist.name }],
      album: { id: album.id, title },
      cover: album.cover,
      number: n + 1,
      volume: 1,
    };
    list.push(t);
    tracks.set(t.id, t);
    album.duration += t.duration;
  }
  album._tracks = list;
  albums.push(album);
});

const allTracks = [...tracks.values()];
const pickTracks = (seed, n) => {
  const r = rnd(seed);
  return Array.from({ length: n }, () => allTracks[Math.floor(r() * allTracks.length)]);
};

const playlists = ['Night Drive Sessions', 'Low Tide Focus', 'Sunday Kitchen', 'Deep Catalogue', 'Studio Floor', 'Quiet Hours'].map((name, i) => {
  const t = pickTracks(100 + i, 18 + i * 3);
  return {
    kind: 'playlist',
    id: `pl${i}`,
    name,
    description: i === 0 ? 'Long roads, late hours.' : '',
    count: t.length,
    duration: t.reduce((s, x) => s + x.duration, 0),
    playlistType: i > 2 ? 'EDITORIAL' : 'USER',
    cover: cover(i + 10),
    _tracks: t,
  };
});

const mixes = ['Daily Mix', 'Discovery Mix', 'New Releases Mix'].map((name, i) => {
  const t = pickTracks(200 + i, 25);
  return { kind: 'mix', id: `mix${i}`, name, count: t.length, tracks: t, cover: cover(i + 4) };
});

const wait = (v, ms = 250) => new Promise((res) => setTimeout(() => res(v), ms));
const strip = (o) => {
  const { _tracks, ...rest } = o;
  return rest;
};

const LRC = [
  '[00:00.00] (instrumental)',
  '[00:08.00] Lights on the water, slow as the tide',
  '[00:14.00] Every harbor sleeping, every window wide',
  '[00:20.00] I keep the engine running',
  '[00:26.00] Out where the signal fades',
  '[00:32.00] Hold on to the low lights',
  '[00:38.00] Hold on till the morning',
  '[00:44.00] (demo lyrics, written for Swell)',
].join('\n');

export const demoApi = {
  setCountry() {},
  async getMe() {
    return wait({ id: 'demo', name: 'Frank', country: 'NO' });
  },
  async getHome() {
    return wait({
      mixes,
      albums: albums.slice(0, 12).map(strip),
      playlists: playlists.slice(0, 3).map(strip),
      featured: [{ title: 'New this week', items: albums.slice(10, 20).map(strip) }],
    }, 500);
  },
  async search(q) {
    const s = q.toLowerCase();
    const m = (x) => x.toLowerCase().includes(s);
    const t = allTracks.filter((x) => m(x.title) || m(x.artists[0].name)).slice(0, 12);
    const al = albums.filter((x) => m(x.title) || m(x.artists[0].name)).map(strip);
    const ar = artists.filter((x) => m(x.name));
    const pl = playlists.filter((x) => m(x.name)).map(strip);
    return wait({ top: ar[0] || al[0] || t[0] || null, tracks: t, albums: al, artists: ar, playlists: pl }, 400);
  },
  async getLibrary(kind, { sort } = {}) {
    let items = { albums: albums.map(strip), artists, playlists: playlists.map(strip), tracks: allTracks.slice(0, 40) }[kind] || [];
    const by = (f) => [...items].sort((a, b) => f(a).localeCompare(f(b)));
    if (sort === 'title') items = by((x) => x.title);
    else if (sort === 'name') items = by((x) => x.name);
    else if (sort === 'artists.name') items = by((x) => x.artists[0].name);
    else if (sort === '-releaseDate') items = by((x) => x.releaseDate).reverse();
    return wait({ items, next: null }, 450);
  },
  async getAlbum(id) {
    const a = albums.find((x) => x.id === id) || albums[0];
    return wait({ album: strip(a), tracks: a._tracks });
  },
  async getArtist(id) {
    const ar = artists.find((x) => x.id === id) || artists[0];
    const own = albums.filter((a) => a.artists[0].id === ar.id).map(strip);
    const topTracks = albums.filter((a) => a.artists[0].id === ar.id).flatMap((a) => a._tracks).slice(0, 10);
    return wait({
      artist: ar,
      topTracks,
      albums: own.filter((a) => a.type === 'ALBUM'),
      singles: own.filter((a) => a.type !== 'ALBUM'),
      similar: artists.filter((x) => x.id !== ar.id).slice(0, 6),
    });
  },
  async getPlaylist(id) {
    const p = playlists.find((x) => x.id === id) || playlists[0];
    return wait({ playlist: strip(p), tracks: p._tracks });
  },
  async getCharts() {
    return wait({
      source: 'editorial',
      sections: [
        { title: 'Top 20 this week', items: pickTracks(300, 20) },
        { title: 'Top albums', items: albums.slice(3, 15).map(strip) },
        { title: 'Trending artists', items: artists },
      ],
    }, 500);
  },
  async getLyrics() {
    return wait({ lrc: LRC, text: '' }, 300);
  },
  async setFavorite() {
    return wait(true, 200);
  },
};

// A pretend player that counts seconds, so the whole interface can be exercised.
export function createDemoEngine() {
  const h = { state: [], transition: [], preload: [], ended: [], error: [] };
  const fire = (k, ...a) => h[k].forEach((f) => f(...a));
  let cur = null;
  let next = null;
  let pos = 0;
  let playing = false;
  let last = 0;
  let quality = 'HI_RES_LOSSLESS';
  const ctxFor = (e) => {
    const max = e.track.quality === 'MAX' && quality === 'HI_RES_LOSSLESS';
    return {
      codec: 'flac',
      bitDepth: max ? 24 : 16,
      sampleRate: max ? 96000 : 44100,
      quality: max ? 'HI_RES_LOSSLESS' : 'LOSSLESS',
      preview: false,
      duration: e.track.duration,
    };
  };
  setInterval(() => {
    if (!playing || !cur) return;
    const now = performance.now();
    pos += (now - last) / 1000;
    last = now;
    if (pos >= cur.track.duration) {
      fire('ended', 'completed');
      if (next) {
        cur = next;
        next = null;
        pos = 0;
        fire('transition', cur.ref, ctxFor(cur));
      } else {
        playing = false;
        pos = 0;
        fire('state', 'IDLE');
      }
    }
  }, 250);
  return {
    onState: (f) => h.state.push(f),
    onTransition: (f) => h.transition.push(f),
    onPreload: (f) => h.preload.push(f),
    onEnded: (f) => h.ended.push(f),
    onError: (f) => h.error.push(f),
    async load(e, p) {
      cur = e;
      pos = p || 0;
      playing = false;
      fire('state', 'NOT_PLAYING');
      setTimeout(() => fire('transition', e.ref, ctxFor(e)), 50);
    },
    async play() {
      if (!cur) return;
      playing = true;
      last = performance.now();
      fire('state', 'PLAYING');
    },
    pause() {
      playing = false;
      fire('state', 'NOT_PLAYING');
    },
    async seek(s) {
      pos = Math.min(s, cur ? cur.track.duration - 1 : 0);
      last = performance.now();
      return pos;
    },
    async setNext(e) {
      next = e;
    },
    position: () => pos,
    setQuality(q) {
      quality = q;
    },
  };
}
