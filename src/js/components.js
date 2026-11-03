// Building blocks shared by the screens: cards, rows, grids, track lists and buttons.
import { art, artistNames, colorOf, fmtTime, h, icon, subtitleOf, titleOf, fill } from './ui.js';
import { setFocusColor } from './theme.js';

let ctx = null; // { open(item), play(item), menu(item, extra), player }
export function setComponentContext(c) {
  ctx = c;
}

export function button(label, { iconName, primary, onClick, cls = '', attrs = {} } = {}) {
  return h(
    'button',
    { class: `btn ${primary ? 'btn-primary' : ''} ${cls}`, onclick: onClick, ...attrs },
    iconName ? icon(iconName) : null,
    label ? h('span', null, label) : null,
  );
}

export function iconButton(iconName, label, onClick, cls = '') {
  return h('button', { class: `icon-btn ${cls}`, 'aria-label': label, title: label, onclick: onClick }, icon(iconName));
}

export function badge(q) {
  return q ? h('span', { class: 'q-badge' }, q) : null;
}

// A cover card. OK opens it; a long press opens the options menu.
export function card(item, { size = 'm', onClick } = {}) {
  const round = item.kind === 'artist';
  const el = h(
    'button',
    {
      class: `card card-${size} ${round ? 'card-round' : ''}`,
      'data-menu': '',
      onclick: onClick || (() => ctx.open(item)),
    },
    h(
      'div',
      { class: 'card-art-wrap' },
      art(item, size === 'l' ? 480 : 320, 'art card-art'),
      item.quality === 'MAX' ? h('span', { class: 'card-q' }, 'MAX') : null,
    ),
    h('span', { class: 'card-title' }, titleOf(item)),
    h('span', { class: 'card-sub' }, subtitleOf(item)),
  );
  el.addEventListener('focus', () => setFocusColor(colorOf(item)));
  el.addEventListener('longpress', () => ctx.menu(item));
  el.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    ctx.menu(item);
  });
  return el;
}

export function row(title, items, opts = {}) {
  if (!items || !items.length) return null;
  return h(
    'section',
    { class: 'shelf' },
    h('h2', { class: 'shelf-title' }, title),
    h('div', { class: 'shelf-row' }, items.map((it) => card(it, opts))),
  );
}

export function grid(items, opts = {}) {
  return h('div', { class: `grid grid-${opts.cols || 7}` }, items.map((it) => card(it, opts)));
}

// One line of a track list.
export function trackRow(track, i, { list, source, showArt = true, showAlbum = false, number } = {}) {
  const isCurrent = () => ctx.player.current && ctx.player.current.id === track.id;
  const el = h(
    'button',
    {
      class: 'track',
      'data-menu': '',
      'data-track': track.id,
      onclick: () => ctx.player.playTracks(list || [track], list ? i : 0, source),
    },
    h('span', { class: 'track-n' }, number !== undefined ? String(number) : String(i + 1)),
    showArt ? art(track, 120, 'art track-art') : null,
    h(
      'span',
      { class: 'track-main' },
      h('span', { class: 'track-title' }, titleOf(track), track.explicit ? h('span', { class: 'explicit' }, 'E') : null),
      h('span', { class: 'track-sub' }, artistNames(track)),
    ),
    showAlbum ? h('span', { class: 'track-album' }, track.album ? track.album.title : '') : null,
    track.quality ? badge(track.quality) : null,
    h('span', { class: 'track-time' }, fmtTime(track.duration)),
  );
  if (isCurrent()) el.classList.add('is-current');
  el.addEventListener('longpress', () => ctx.menu(track, { source }));
  el.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    ctx.menu(track, { source });
  });
  return el;
}

export function trackList(tracks, opts = {}) {
  return h(
    'div',
    { class: 'tracklist' },
    tracks.map((t, i) => trackRow(t, i, { ...opts, list: tracks, number: opts.numbers ? opts.numbers[i] : undefined })),
  );
}

// Mark the playing track in any visible list.
export function markCurrent(rootEl, trackId) {
  rootEl.querySelectorAll('.track').forEach((el) => el.classList.toggle('is-current', el.dataset.track === String(trackId)));
}

export function chips(options, value, onChange) {
  const wrap = h('div', { class: 'chips' });
  const render = (v) => {
    fill(wrap, 
      ...options.map((o) =>
        h(
          'button',
          {
            class: `chip ${o.value === v ? 'is-on' : ''}`,
            onclick: () => {
              render(o.value);
              onChange(o.value);
            },
          },
          o.label,
        ),
      ),
    );
  };
  render(value);
  return wrap;
}

export function skeletonGrid(n = 14, cols = 7) {
  return h(
    'div',
    { class: `grid grid-${cols}`, 'aria-busy': 'true' },
    Array.from({ length: n }, () =>
      h('div', { class: 'card skeleton' }, h('div', { class: 'sk sk-art' }), h('div', { class: 'sk sk-line' }), h('div', { class: 'sk sk-line short' })),
    ),
  );
}

export function skeletonPage() {
  return h(
    'div',
    { class: 'page' },
    h('div', { class: 'sk sk-title' }),
    h(
      'div',
      { class: 'shelf-row' },
      Array.from({ length: 7 }, () =>
        h('div', { class: 'card card-m skeleton' }, h('div', { class: 'sk sk-art' }), h('div', { class: 'sk sk-line' })),
      ),
    ),
    h('div', { class: 'sk sk-title' }),
    h(
      'div',
      { class: 'shelf-row' },
      Array.from({ length: 7 }, () =>
        h('div', { class: 'card card-m skeleton' }, h('div', { class: 'sk sk-art' }), h('div', { class: 'sk sk-line' })),
      ),
    ),
  );
}

export function emptyState({ iconName = 'music', title, text, action, tone = 'accent' }) {
  return h(
    'div',
    { class: `state state-${tone}` },
    icon(iconName, 'state-ico'),
    h('h2', null, title),
    text ? h('p', null, text) : null,
    action || null,
  );
}
