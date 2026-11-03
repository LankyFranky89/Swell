// Full-screen layers on top of the app: Now Playing (with lyrics), the queue,
// and the options menu that a long press on OK opens.
import { badge, button, iconButton } from './components.js';
import { art, artistNames, fmtTime, h, icon, settings, titleOf, fill } from './ui.js';

// ------------------------------------------------------------------ lyrics
export function parseLrc(lrc) {
  const lines = [];
  for (const raw of String(lrc || '').split(/\r?\n/)) {
    const stamps = [...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
    const text = raw.replace(/\[[^\]]*\]/g, '').trim();
    for (const m of stamps) lines.push({ t: +m[1] * 60 + +m[2], text });
  }
  return lines.sort((a, b) => a.t - b.t);
}

function qualityText(ctx, track) {
  if (ctx && ctx.codec) {
    const parts = [ctx.codec.toUpperCase()];
    if (ctx.bitDepth) parts.push(`${ctx.bitDepth}-bit`);
    if (ctx.sampleRate) parts.push(`${(ctx.sampleRate / 1000).toFixed(ctx.sampleRate % 1000 ? 1 : 0)} kHz`);
    return parts.join(' · ');
  }
  return track && track.quality === 'MAX' ? 'Hi-Res available' : '';
}

function qualityBadge(ctx, track) {
  const q = ctx && ctx.quality;
  if (q === 'HI_RES_LOSSLESS' || q === 'HI_RES') return 'MAX';
  if (q === 'LOSSLESS') return 'HIGH';
  if (q === 'HIGH' || q === 'LOW') return 'LOW';
  return track ? track.quality : '';
}

// ------------------------------------------------------------------ Now Playing
export function nowPlaying(app) {
  const p = app.player;
  const artBox = h('div', { class: 'np-art-wrap' });
  const title = h('h1', { class: 'np-title' });
  const artistLine = h('div', { class: 'np-artist' });
  const qBadge = h('div', { class: 'np-badges' });
  const lyricsBox = h('div', { class: 'np-lyrics' });
  const cur = h('span');
  const rem = h('span');
  const barFill = h('div', { class: 'bar-fill' });
  const knob = h('div', { class: 'bar-knob' });
  const seekBar = h(
    'button',
    { class: 'bar np-bar', 'data-arrows': '', 'aria-label': 'Position. Left and right to seek.' },
    h('div', { class: 'bar-track' }, barFill, knob),
  );
  const playBtn = h('button', { class: 'np-play', 'aria-label': 'Play or pause', onclick: () => p.toggle() });
  const repeatBtn = iconButton('repeat', 'Repeat', () => {
    p.setRepeat(!p.repeat);
    repeatBtn.classList.toggle('is-on', p.repeat);
  });
  const favBtn = iconButton('heart', 'Add to favorites', async () => {
    const t = p.current;
    if (!t) return;
    const on = !app.isFavorite('track', t.id);
    if (await app.toggleFavorite('track', t, on)) renderFav();
  });
  const queueBtn = button('Queue', { iconName: 'queue', onClick: () => app.openQueue() });

  let lyrics = null;
  let lyricsFor = null;
  let lyricIdx = -2;
  let timer = null;

  seekBar.addEventListener('arrow', (e) => {
    if (e.detail === 'LEFT' || e.detail === 'RIGHT') {
      e.preventDefault();
      p.seek(p.position() + (e.detail === 'LEFT' ? -10 : 10));
      tick();
    }
  });
  seekBar.addEventListener('click', (e) => {
    const t = p.current;
    if (!t || !e.clientX) return p.toggle();
    const r = seekBar.getBoundingClientRect();
    p.seek(((e.clientX - r.left) / r.width) * duration());
  });

  const duration = () => (p.context && p.context.duration) || (p.current && p.current.duration) || 0;

  function renderFav() {
    const t = p.current;
    const on = t && app.isFavorite('track', t.id);
    fill(favBtn, icon(on ? 'heartFill' : 'heart'));
    favBtn.classList.toggle('is-on', !!on);
  }

  function renderTrack() {
    const t = p.current;
    if (!t) {
      title.textContent = 'Nothing playing';
      artistLine.replaceChildren();
      fill(artBox, h('div', { class: 'art np-art' }));
      lyricsBox.replaceChildren();
      return;
    }
    fill(artBox, art(t, 1280, 'art np-art'));
    title.textContent = titleOf(t);
    fill(artistLine, 
      ...t.artists.map((a) => h('button', { class: 'link', onclick: () => app.go('artist', { id: a.id }) }, a.name)),
      t.album ? h('span', { class: 'muted' }, ' · ') : null,
      t.album ? h('button', { class: 'link muted-link', onclick: () => app.go('album', { id: t.album.id }) }, t.album.title) : null,
    );
    renderQuality();
    renderFav();
    loadLyrics(t);
  }

  function renderQuality() {
    const t = p.current;
    const q = qualityBadge(p.context, t);
    const txt = qualityText(p.context, t);
    fill(qBadge, 
      q ? h('span', { class: 'pill pill-accent' }, icon('bars'), h('span', null, q)) : null,
      txt ? h('span', { class: 'pill' }, txt) : null,
      p.context && p.context.preview ? h('span', { class: 'pill pill-warn' }, 'Preview only') : null,
    );
  }

  function loadLyrics(t) {
    if (!settings().lyrics) {
      lyricsBox.hidden = true;
      return;
    }
    if (lyricsFor === t.id) return;
    lyricsFor = t.id;
    lyrics = null;
    lyricIdx = -2;
    lyricsBox.hidden = false;
    fill(lyricsBox, h('span', { class: 'ly-muted' }, 'Looking for lyrics…'));
    app.api.getLyrics(t.id).then((l) => {
      if (lyricsFor !== t.id) return;
      if (!l) {
        fill(lyricsBox, h('span', { class: 'ly-muted' }, 'No lyrics for this track'));
        return;
      }
      const lines = parseLrc(l.lrc).filter((x) => x.text);
      if (lines.length) {
        lyrics = lines;
        tick();
      } else {
        const plain = l.text.split(/\r?\n/).filter(Boolean).slice(0, 4);
        fill(lyricsBox, ...plain.map((x) => h('span', { class: 'ly-line' }, x)));
      }
    });
  }

  function renderLyrics(pos) {
    if (!lyrics) return;
    let i = -1;
    for (let k = 0; k < lyrics.length; k++) if (lyrics[k].t <= pos + 0.3) i = k;
    if (i === lyricIdx) return;
    lyricIdx = i;
    const line = (k, cls) => (lyrics[k] ? h('span', { class: cls }, lyrics[k].text) : h('span', { class: cls }, ' '));
    fill(lyricsBox, line(i - 1, 'ly-prev'), line(i, 'ly-now'), line(i + 1, 'ly-next'));
  }

  function tick() {
    const pos = p.position();
    const d = duration();
    const pct = d ? Math.min(100, (pos / d) * 100) : 0;
    barFill.style.width = `${pct}%`;
    knob.style.left = `${pct}%`;
    cur.textContent = fmtTime(pos);
    rem.textContent = d ? `-${fmtTime(d - pos)}` : '';
    renderLyrics(pos);
  }

  function renderState() {
    fill(playBtn, icon(p.playing ? 'pause' : 'play'));
  }

  const el = h(
    'div',
    { class: 'overlay np' },
    h(
      'header',
      { class: 'np-head' },
      h(
        'button',
        { class: 'np-back', onclick: () => app.closeOverlay() },
        icon('back'),
        h('span', null, 'Back'),
      ),
      qBadge,
    ),
    h(
      'div',
      { class: 'np-body' },
      artBox,
      h(
        'div',
        { class: 'np-info' },
        title,
        artistLine,
        lyricsBox,
        h('div', { class: 'np-progress' }, seekBar, h('div', { class: 'np-times' }, cur, rem)),
        h(
          'div',
          { class: 'np-controls' },
          h(
            'div',
            { class: 'np-transport' },
            iconButton('prev', 'Previous', () => p.prev()),
            playBtn,
            iconButton('next', 'Next', () => p.next()),
            repeatBtn,
          ),
          h('div', { class: 'np-side' }, queueBtn, favBtn),
        ),
      ),
    ),
    h(
      'footer',
      { class: 'hints' },
      hint('OK', 'Play / pause'),
      hint('← →', 'Seek on the bar'),
      hint('Back', 'Return'),
    ),
  );

  const offs = [
    p.on('track', () => {
      renderTrack();
      tick();
    }),
    p.on('state', renderState),
    p.on('queue', renderQuality),
    p.on('seek', tick),
  ];
  renderTrack();
  renderState();
  repeatBtn.classList.toggle('is-on', p.repeat);
  tick();
  timer = setInterval(tick, 500);
  playBtn.setAttribute('data-autofocus', '');
  return {
    el,
    destroy() {
      clearInterval(timer);
      offs.forEach((f) => f());
    },
  };
}

function hint(key, text) {
  return h('span', { class: 'hint' }, h('kbd', null, key), h('span', null, text));
}

// ------------------------------------------------------------------ Queue
export function queueOverlay(app) {
  const p = app.player;
  const list = h('div', { class: 'queue-list' });
  const now = h('div', { class: 'queue-now' });

  function render() {
    const t = p.current;
    fill(now, 
      t ? art(t, 640, 'art queue-art') : h('div', { class: 'art queue-art' }),
      h('div', { class: 'queue-now-text' }, h('span', { class: 'eyebrow' }, 'Now playing'), h('strong', null, t ? titleOf(t) : 'Nothing playing'), h('span', { class: 'muted' }, artistNames(t))),
    );
    const q = p.queue;
    const focusedIdx = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.qi : null;
    const rows = q.map((track, i) => {
      if (i < p.index) return null;
      const isNow = i === p.index;
      const r = h(
        'button',
        {
          class: `qrow ${isNow ? 'is-current' : ''}`,
          'data-arrows': '',
          'data-menu': '',
          'data-qi': String(i),
          onclick: () => p.jumpTo(i),
        },
        icon(isNow ? 'bars' : 'grip', 'ico qgrip'),
        art(track, 120, 'art track-art'),
        h('span', { class: 'track-main' }, h('span', { class: 'track-title' }, titleOf(track)), h('span', { class: 'track-sub' }, artistNames(track))),
        h('span', { class: 'track-time' }, fmtTime(track.duration)),
      );
      r.addEventListener('arrow', (e) => {
        if (isNow || (e.detail !== 'LEFT' && e.detail !== 'RIGHT')) return;
        e.preventDefault();
        // Left moves the track earlier, right moves it later.
        const dir = e.detail === 'LEFT' ? -1 : 1;
        if (p.move(i, dir)) {
          requestAnimationFrame(() => {
            const el = list.querySelector(`[data-qi="${i + dir}"]`);
            if (el) el.focus();
          });
        }
      });
      r.addEventListener('longpress', () => {
        if (!isNow) p.removeAt(i);
      });
      return r;
    });
    fill(list, ...rows.filter(Boolean));
    if (focusedIdx) {
      const el = list.querySelector(`[data-qi="${focusedIdx}"]`);
      if (el) el.focus({ preventScroll: true });
    }
  }

  const el = h(
    'div',
    { class: 'overlay queue' },
    h('section', { class: 'queue-left' }, h('button', { class: 'np-back', onclick: () => app.closeOverlay() }, icon('back'), h('span', null, 'Back')), now),
    h(
      'section',
      { class: 'queue-right' },
      h(
        'div',
        { class: 'page-head' },
        h('h1', null, 'Queue'),
        h('div', { class: 'actions' }, button('Clear upcoming', { onClick: () => p.clearUpcoming() })),
      ),
      list,
      h('footer', { class: 'hints' }, hint('OK', 'Play this track'), hint('← →', 'Move track'), hint('Hold OK', 'Remove')),
    ),
  );
  const offs = [p.on('queue', render), p.on('track', render)];
  render();
  const first = list.querySelector('.qrow:not(.is-current)') || list.querySelector('.qrow');
  if (first) first.setAttribute('data-autofocus', '');
  return { el, destroy: () => offs.forEach((f) => f()) };
}

// ------------------------------------------------------------------ Options menu
export function menuOverlay(app, item, { source } = {}) {
  const p = app.player;
  const actions = [];
  const close = () => app.closeOverlay();
  const act = (label, iconName, fn) =>
    actions.push(
      h(
        'button',
        {
          class: 'menu-item',
          onclick: async () => {
            close();
            await fn();
          },
        },
        icon(iconName),
        h('span', null, label),
      ),
    );

  if (item.kind === 'track') {
    act('Play now', 'play', () => p.playTracks([item], 0, source));
    act('Play next', 'queue', () => {
      p.playNext(item, source);
      app.toast('Plays next');
    });
    act('Add to queue', 'queue', () => {
      p.addToQueue(item, source);
      app.toast('Added to queue');
    });
    if (item.album) act('Go to album', 'music', () => app.go('album', { id: item.album.id }));
    if (item.artists[0]) act('Go to artist', 'user', () => app.go('artist', { id: item.artists[0].id }));
    const fav = app.isFavorite('track', item.id);
    act(fav ? 'Remove from favorites' : 'Add to favorites', fav ? 'heartFill' : 'heart', () => app.toggleFavorite('track', item, !fav));
  } else if (item.kind === 'album' || item.kind === 'playlist' || item.kind === 'mix') {
    act('Open', 'chevron', () => app.open(item));
    act('Play', 'play', () => app.playItem(item));
    act('Shuffle', 'shuffle', () => app.playItem(item, { shuffle: true }));
    act('Add to queue', 'queue', () => app.queueItem(item));
    if (item.kind === 'album' && item.artists[0]) act('Go to artist', 'user', () => app.go('artist', { id: item.artists[0].id }));
    if (item.kind !== 'mix') {
      const fav = app.isFavorite(item.kind, item.id);
      act(fav ? 'Remove from favorites' : 'Add to favorites', fav ? 'heartFill' : 'heart', () => app.toggleFavorite(item.kind, item, !fav));
    }
  } else if (item.kind === 'artist') {
    act('Open', 'chevron', () => app.open(item));
    act('Play top tracks', 'play', () => app.playItem(item));
    const fav = app.isFavorite('artist', item.id);
    act(fav ? 'Unfollow' : 'Follow', fav ? 'heartFill' : 'heart', () => app.toggleFavorite('artist', item, !fav));
  }
  if (actions[0]) actions[0].setAttribute('data-autofocus', '');
  const el = h(
    'div',
    { class: 'overlay menu', onclick: (e) => e.target === e.currentTarget && close() },
    h(
      'div',
      { class: 'menu-card' },
      h('div', { class: 'menu-head' }, art(item, 240, 'art menu-art'), h('div', null, h('strong', null, titleOf(item)), h('span', { class: 'muted' }, item.kind === 'track' ? artistNames(item) : ''))),
      h('div', { class: 'menu-list' }, actions),
    ),
  );
  return { el };
}

export { badge };
