// Tidal catalogue and collection access, normalised into small plain objects
// the views can render. Every JSON:API response is merged into one resource cache,
// so related items (covers, artists, albums) can be read back by type and id.
import { createAPIClient } from '@tidal-music/api';
import { credentialsProvider } from '@tidal-music/auth';
import { APP_VERSION } from './config.js';
import { coverColor, coverUrl, parseDuration } from './media.js';

export { coverColor, coverUrl, parseDuration };

let client = null;
let country = undefined;
const cache = new Map();

export class ApiError extends Error {
  constructor(status, detail) {
    super(`Tidal API error ${status}`);
    this.status = status;
    this.detail = detail;
  }
}

let onError = () => {};
export function setErrorHook(fn) {
  onError = fn;
}

export function initApi() {
  client = createAPIClient(credentialsProvider);
}

export function setCountry(code) {
  country = code || undefined;
}

const key = (type, id) => `${type}:${id}`;

function remember(doc) {
  if (!doc) return;
  const put = (r) => {
    if (!r || !r.type || !r.id) return;
    const k = key(r.type, r.id);
    const prev = cache.get(k);
    if (!prev) {
      cache.set(k, r);
      return;
    }
    // Merge so a later, richer copy keeps relationships an earlier copy had.
    cache.set(k, {
      ...prev,
      ...r,
      attributes: { ...(prev.attributes || {}), ...(r.attributes || {}) },
      relationships: { ...(prev.relationships || {}), ...(r.relationships || {}) },
    });
  };
  if (Array.isArray(doc.data)) doc.data.forEach(put);
  else if (doc.data && doc.data.attributes) put(doc.data);
  (doc.included || []).forEach(put);
}

function res(type, id) {
  return cache.get(key(type, id));
}

function relIds(resource, name) {
  const rel = resource && resource.relationships && resource.relationships[name];
  if (!rel || !rel.data) return [];
  return Array.isArray(rel.data) ? rel.data : [rel.data];
}

function nextCursor(doc) {
  const next = doc && doc.links && doc.links.next;
  if (!next) return null;
  try {
    const u = new URL(next, 'https://openapi.tidal.com');
    return u.searchParams.get('page[cursor]');
  } catch {
    return null;
  }
}

async function get(path, { path: pathParams, query } = {}) {
  if (!client) throw new Error('API not initialised');
  const q = { ...(query || {}) };
  if (country && !('countryCode' in q)) q.countryCode = country;
  let result;
  try {
    result = await client.GET(path, { params: { path: pathParams, query: q } });
  } catch (e) {
    onError('Tidal API', `${path} → ${(e && e.message) || e}`);
    throw new ApiError(0, e);
  }
  const { data, error, response } = result;
  if (error || !response.ok) {
    const err = new ApiError(response ? response.status : 0, error);
    const detail = error && error.errors && error.errors[0] ? `${error.errors[0].code || ''} ${error.errors[0].detail || ''}`.trim() : '';
    onError('Tidal API', `${path} → HTTP ${err.status}${detail ? ` · ${detail}` : ''}`);
    throw err;
  }
  remember(data);
  return data;
}

async function send(method, path, { path: pathParams, body } = {}) {
  const { error, response } = await client[method](path, {
    params: { path: pathParams },
    body,
  });
  if (error || !response.ok) throw new ApiError(response ? response.status : 0, error);
}

const chunk = (arr, n) => {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};

// ---------- helpers that turn cached resources into view objects ----------

function qualityFromTags(tags) {
  const t = tags || [];
  if (t.includes('HIRES_LOSSLESS')) return 'MAX';
  if (t.includes('DOLBY_ATMOS')) return 'ATMOS';
  if (t.includes('LOSSLESS')) return 'HIGH';
  return '';
}

function coverFrom(resource, relName) {
  const ids = relIds(resource, relName);
  for (const ref of ids) {
    const art = res(ref.type || 'artworks', ref.id);
    const files = art && art.attributes && art.attributes.files;
    if (files && files.length) {
      const vm = art.attributes.visualMetadata || {};
      const color = vm.status === 'OK' || vm.selectedPaletteColor ? vm.selectedPaletteColor : null;
      return {
        files: files
          .filter((f) => f.href)
          .map((f) => ({ href: f.href, w: (f.meta && f.meta.width) || 0 }))
          .sort((a, b) => a.w - b.w),
        color: color || null,
      };
    }
  }
  return null;
}

function artistObj(r) {
  if (!r) return null;
  return {
    kind: 'artist',
    id: r.id,
    name: (r.attributes && r.attributes.name) || 'Unknown artist',
    picture: coverFrom(r, 'profileArt'),
  };
}

function artistsOf(resource) {
  return relIds(resource, 'artists')
    .map((ref) => res('artists', ref.id))
    .filter(Boolean)
    .map((a) => ({ id: a.id, name: (a.attributes && a.attributes.name) || '' }));
}

function albumObj(r) {
  if (!r) return null;
  const a = r.attributes || {};
  const date = a.releaseDate || '';
  return {
    kind: 'album',
    id: r.id,
    title: a.title || 'Untitled',
    version: a.version || '',
    type: a.albumType || a.type || 'ALBUM',
    releaseDate: date,
    year: date ? date.slice(0, 4) : '',
    count: a.numberOfItems || 0,
    duration: parseDuration(a.duration),
    explicit: !!a.explicit,
    quality: qualityFromTags(a.mediaTags),
    artists: artistsOf(r),
    cover: coverFrom(r, 'coverArt'),
  };
}

function trackObj(r) {
  if (!r) return null;
  const a = r.attributes || {};
  const albumRef = relIds(r, 'albums')[0];
  const album = albumRef ? res('albums', albumRef.id) : null;
  return {
    kind: 'track',
    id: r.id,
    title: a.title || 'Untitled',
    version: a.version || '',
    duration: parseDuration(a.duration),
    explicit: !!a.explicit,
    quality: qualityFromTags(a.mediaTags),
    artists: artistsOf(r),
    album: album ? { id: album.id, title: (album.attributes && album.attributes.title) || '' } : null,
    cover: album ? coverFrom(album, 'coverArt') : null,
  };
}

function playlistObj(r) {
  if (!r) return null;
  const a = r.attributes || {};
  return {
    kind: 'playlist',
    id: r.id,
    name: a.name || 'Playlist',
    description: a.description || '',
    count: a.numberOfItems || a.numberOfTrackItems || 0,
    duration: parseDuration(a.duration),
    playlistType: a.playlistType || '',
    updated: a.lastModifiedAt || '',
    cover: coverFrom(r, 'coverArt'),
  };
}

function objFor(ref) {
  const r = res(ref.type, ref.id);
  if (!r) return null;
  if (ref.type === 'tracks') return trackObj(r);
  if (ref.type === 'albums') return albumObj(r);
  if (ref.type === 'artists') return artistObj(r);
  if (ref.type === 'playlists') return playlistObj(r);
  return null;
}

// Make sure tracks have their artists, album and album cover in the cache.
async function hydrateTracks(ids) {
  const missing = ids.filter((id) => {
    const t = res('tracks', id);
    return !t || !relIds(t, 'albums').length || !relIds(t, 'artists').length;
  });
  for (const part of chunk(missing, 20)) {
    await get('/tracks', {
      query: { 'filter[id]': part, include: ['artists', 'albums'] },
    }).catch(() => null);
  }
  const albumIds = new Set();
  ids.forEach((id) => {
    const t = res('tracks', id);
    const ref = t && relIds(t, 'albums')[0];
    if (ref) albumIds.add(ref.id);
  });
  await hydrateAlbums([...albumIds]);
}

async function hydrateAlbums(ids) {
  const missing = ids.filter((id) => {
    const a = res('albums', id);
    return !a || !relIds(a, 'coverArt').length || !relIds(a, 'artists').length;
  });
  for (const part of chunk(missing, 20)) {
    await get('/albums', {
      query: { 'filter[id]': part, include: ['coverArt', 'artists'] },
    }).catch(() => null);
  }
}

async function hydrateArtists(ids) {
  const missing = ids.filter((id) => {
    const a = res('artists', id);
    return !a || !relIds(a, 'profileArt').length;
  });
  for (const part of chunk(missing, 20)) {
    await get('/artists', {
      query: { 'filter[id]': part, include: ['profileArt'] },
    }).catch(() => null);
  }
}

async function hydratePlaylists(ids) {
  const missing = ids.filter((id) => {
    const p = res('playlists', id);
    return !p || !relIds(p, 'coverArt').length;
  });
  for (const part of chunk(missing, 20)) {
    await get('/playlists', {
      query: { 'filter[id]': part, include: ['coverArt'] },
    }).catch(() => null);
  }
}

async function hydrateRefs(refs) {
  const by = (t) => refs.filter((r) => r.type === t).map((r) => r.id);
  await Promise.all([
    hydrateTracks(by('tracks')),
    hydrateAlbums(by('albums')),
    hydrateArtists(by('artists')),
    hydratePlaylists(by('playlists')),
  ]);
  return refs.map(objFor).filter(Boolean);
}

// ---------------------------------- public API ----------------------------------

export async function getMe() {
  const doc = await get('/users/{id}', { path: { id: 'me' }, query: { countryCode: undefined } });
  const a = (doc && doc.data && doc.data.attributes) || {};
  return {
    id: doc && doc.data ? doc.data.id : 'me',
    // Use the first name; the username is often an email address, which should not be on screen.
    name: a.firstName || (a.username && !a.username.includes('@') ? a.username : ''),
    country: a.country || '',
  };
}

async function collection(kind, { sort, cursor } = {}) {
  const path = {
    albums: '/userCollectionAlbums/{id}/relationships/items',
    artists: '/userCollectionArtists/{id}/relationships/items',
    playlists: '/userCollectionPlaylists/{id}/relationships/items',
    tracks: '/userCollectionTracks/{id}/relationships/items',
  }[kind];
  const query = { include: ['items'] };
  if (sort) query.sort = [sort];
  if (cursor) query['page[cursor]'] = cursor;
  if (kind === 'playlists') query.collectionView = 'FLAT';
  const doc = await get(path, { path: { id: 'me' }, query });
  const refs = (doc.data || []).filter((r) => r && r.type && r.id);
  const items = await hydrateRefs(refs);
  return { items, next: nextCursor(doc) };
}

export const getLibrary = collection;

async function mix(path, name) {
  try {
    const doc = await get(path, { path: { id: 'me' }, query: { include: ['items'] } });
    const refs = relIds(Array.isArray(doc.data) ? doc.data[0] : doc.data, 'items');
    if (!refs.length) return null;
    const items = await hydrateRefs(refs.slice(0, 50));
    const tracks = items.filter((i) => i.kind === 'track');
    if (!tracks.length) return null;
    return {
      kind: 'mix',
      id: path,
      name,
      count: tracks.length,
      tracks,
      cover: tracks[0].cover,
    };
  } catch {
    return null;
  }
}

async function editorialModules() {
  try {
    const doc = await get('/dynamicPages', {
      query: {
        'filter[pageType]': ['HOME_EDITORIAL'],
        deviceType: 'TV',
        systemType: 'WEB',
        clientVersion: APP_VERSION,
        include: ['modules'],
      },
    });
    const page = (doc.data || [])[0];
    const moduleRefs = relIds(page, 'modules');
    const modules = [];
    for (const ref of moduleRefs.slice(0, 12)) {
      const m = res('dynamicModules', ref.id);
      if (!m) continue;
      let itemRefs = relIds(m, 'items');
      if (!itemRefs.length) {
        const md = await get('/dynamicModules', {
          query: {
            'filter[id]': [ref.id],
            deviceType: 'TV',
            systemType: 'WEB',
            clientVersion: APP_VERSION,
            include: ['items'],
          },
        }).catch(() => null);
        const full = md && (md.data || [])[0];
        itemRefs = relIds(full, 'items');
      }
      const items = await hydrateRefs(itemRefs.slice(0, 24));
      if (items.length) modules.push({ title: (m.attributes && m.attributes.title) || 'Featured', items });
    }
    return modules;
  } catch {
    return [];
  }
}

export async function getHome() {
  const [mixes, albums, playlists, featured] = await Promise.all([
    Promise.all([
      mix('/userDailyMixes/{id}', 'Daily Mix'),
      mix('/userDiscoveryMixes/{id}', 'Discovery Mix'),
      mix('/userNewReleaseMixes/{id}', 'New Releases Mix'),
    ]).then((m) => m.filter(Boolean)),
    collection('albums', { sort: '-addedAt' }).then((r) => r.items).catch(() => []),
    collection('playlists', { sort: '-lastModifiedAt' }).then((r) => r.items).catch(() => []),
    editorialModules().then((m) => m.slice(0, 2)),
  ]);
  return { mixes, albums: albums.slice(0, 14), playlists: playlists.slice(0, 14), featured };
}

export async function search(query) {
  const doc = await get('/searchResults', {
    query: {
      'filter[query]': query,
      deviceType: 'TV',
      include: ['topHits', 'tracks', 'albums', 'artists', 'playlists'],
    },
  });
  // Tidal wraps the one search result in a list.
  const sr = Array.isArray(doc.data) ? doc.data[0] : doc.data;
  const pick = async (name, n) => hydrateRefs(relIds(sr, name).slice(0, n));
  const [top, tracks, albums, artists, playlists] = await Promise.all([
    pick('topHits', 1),
    pick('tracks', 12),
    pick('albums', 14),
    pick('artists', 14),
    pick('playlists', 14),
  ]);
  return { top: top[0] || null, tracks, albums, artists, playlists };
}

async function allPages(path, pathParams, query, maxPages = 10) {
  const refs = [];
  let cursor = null;
  for (let i = 0; i < maxPages; i++) {
    const q = { ...query };
    if (cursor) q['page[cursor]'] = cursor;
    const doc = await get(path, { path: pathParams, query: q });
    (doc.data || []).forEach((r) => refs.push({ ...r }));
    cursor = nextCursor(doc);
    if (!cursor) break;
  }
  return refs;
}

export async function getAlbum(id) {
  await get('/albums/{id}', { path: { id }, query: { include: ['artists', 'coverArt'] } });
  const refs = await allPages('/albums/{id}/relationships/items', { id }, { include: ['items'] }, 8);
  const album = albumObj(res('albums', id));
  const trackRefs = refs.filter((r) => r.type === 'tracks');
  await hydrateTracks(trackRefs.map((r) => r.id));
  const tracks = trackRefs
    .map((r) => {
      const t = trackObj(res('tracks', r.id));
      if (!t) return null;
      t.number = (r.meta && r.meta.trackNumber) || 0;
      t.volume = (r.meta && r.meta.volumeNumber) || 1;
      t.cover = t.cover || album.cover;
      return t;
    })
    .filter(Boolean);
  return { album, tracks };
}

export async function getPlaylist(id) {
  await get('/playlists/{id}', { path: { id }, query: { include: ['coverArt'] } });
  const refs = await allPages('/playlists/{id}/relationships/items', { id }, { include: ['items'] }, 10);
  const trackRefs = refs.filter((r) => r.type === 'tracks');
  await hydrateTracks(trackRefs.map((r) => r.id));
  const tracks = trackRefs.map((r) => trackObj(res('tracks', r.id))).filter(Boolean);
  const playlist = playlistObj(res('playlists', id));
  if (!playlist.cover && tracks[0]) playlist.cover = tracks[0].cover;
  return { playlist, tracks };
}

export async function getArtist(id) {
  await get('/artists/{id}', { path: { id }, query: { include: ['profileArt'] } });
  const [albumRefs, trackRefs, similarRefs] = await Promise.all([
    allPages('/artists/{id}/relationships/albums', { id }, { include: ['albums'] }, 5).catch(() => []),
    get('/artists/{id}/relationships/tracks', {
      path: { id },
      query: { include: ['tracks'], collapseBy: 'FINGERPRINT' },
    })
      .then((d) => d.data || [])
      .catch(() => []),
    get('/artists/{id}/relationships/similarArtists', { path: { id }, query: { include: ['similarArtists'] } })
      .then((d) => d.data || [])
      .catch(() => []),
  ]);
  const [albumsAll, topTracks, similar] = await Promise.all([
    hydrateRefs(albumRefs),
    hydrateRefs(trackRefs.slice(0, 10)),
    hydrateRefs(similarRefs.slice(0, 8)),
  ]);
  const byDate = (a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || '');
  const albums = albumsAll.filter((a) => a.type === 'ALBUM').sort(byDate);
  const singles = albumsAll.filter((a) => a.type !== 'ALBUM').sort(byDate);
  return { artist: artistObj(res('artists', id)), topTracks, albums, singles, similar };
}

export async function getCharts() {
  const modules = await editorialModules();
  const chartLike = modules.filter((m) => /top|chart|trend|popular|hot|viral|most/i.test(m.title));
  if (chartLike.length) return { source: 'editorial', sections: chartLike };
  // Fallback: Tidal's own chart playlists, found through search.
  try {
    const r = await search('TIDAL Top');
    const lists = r.playlists.filter((p) => p.playlistType === 'EDITORIAL' || /top/i.test(p.name));
    if (lists.length) return { source: 'search', sections: [{ title: 'Chart playlists', items: lists }] };
  } catch {
    /* fall through */
  }
  return { source: 'none', sections: modules };
}

export async function getLyrics(trackId) {
  try {
    const doc = await get('/tracks/{id}/relationships/lyrics', {
      path: { id: trackId },
      query: { include: ['lyrics'] },
    });
    const ref = (doc.data || [])[0];
    const l = ref && res('lyrics', ref.id);
    const a = (l && l.attributes) || {};
    if (a.technicalStatus && a.technicalStatus !== 'OK') return null;
    if (!a.lrcText && !a.text) return null;
    return { lrc: a.lrcText || '', text: a.text || '' };
  } catch {
    return null;
  }
}

export async function setFavorite(kind, id, on) {
  const path = {
    album: '/userCollectionAlbums/{id}/relationships/items',
    artist: '/userCollectionArtists/{id}/relationships/items',
    playlist: '/userCollectionPlaylists/{id}/relationships/items',
    track: '/userCollectionTracks/{id}/relationships/items',
  }[kind];
  const type = { album: 'albums', artist: 'artists', playlist: 'playlists', track: 'tracks' }[kind];
  await send(on ? 'POST' : 'DELETE', path, {
    path: { id: 'me' },
    body: { data: [{ id, type }] },
  });
}
