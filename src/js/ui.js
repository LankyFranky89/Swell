// Small DOM helpers, icons, settings and formatting shared by all screens.
import { coverColor, coverUrl } from './media.js';

export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  append(el, children);
  return el;
}

// Replace an element's children, skipping empty values (null, false, undefined).
export function fill(el, ...children) {
  el.textContent = '';
  append(el, children);
  return el;
}

function append(el, children) {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

const P = (d, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
const F = (d) => `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${d}</svg>`;

export const icons = {
  logo: P('<path d="M3 12c3-6 6-6 9 0s6 6 9 0"/>', 'stroke-width="2.4"'),
  home: P('<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>'),
  search: P('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'),
  charts: P('<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'),
  library: P('<path d="M4 4v16M9 4v16M14 6l5 13"/>'),
  settings: P(
    '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  ),
  play: F('<path d="M7 4l13 8-13 8z"/>'),
  pause: F('<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>'),
  prev: F('<path d="M6 5h2v14H6zM20 5v14L9 12z"/>'),
  next: F('<path d="M16 5h2v14h-2zM4 5l11 7-11 7z"/>'),
  shuffle: P('<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>'),
  repeat: P('<path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/>'),
  heart: P(
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  ),
  heartFill: F(
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  ),
  queue: P('<path d="M4 6h16M4 12h16M4 18h10"/>'),
  lyrics: P('<path d="M4 5h16M4 10h10M4 15h16M4 20h8"/>'),
  back: P('<path d="M15 5l-7 7 7 7"/>', 'stroke-width="2.4"'),
  chevron: P('<path d="M9 5l7 7-7 7"/>', 'stroke-width="2.4"'),
  bars: P('<path d="M4 9v6M8 5v14M12 8v8M16 3v18M20 9v6"/>', 'stroke-width="2.2"'),
  wifiOff: P('<path d="M2 8.8a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01M3 3l18 18"/>'),
  alert: P('<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5h.01"/>'),
  lock: P('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  grip: P('<path d="M5 9h14M5 15h14"/>'),
  user: P('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'),
  music: P('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
  radio: P('<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5"/>'),
};

export function icon(name, cls = 'ico') {
  return h('span', { class: cls, html: icons[name] || '' });
}

// ---------------- settings ----------------
const SETTINGS_KEY = 'swell.settings';
const DEFAULTS = { quality: 'HI_RES_LOSSLESS', artColors: true, intensity: 'subtle', fade: 'slow', lyrics: true };
let settingsCache = null;

export function settings() {
  if (!settingsCache) {
    try {
      settingsCache = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
    } catch {
      settingsCache = { ...DEFAULTS };
    }
  }
  return settingsCache;
}

export function saveSetting(k, v) {
  settings()[k] = v;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsCache));
  } catch {
    /* storage unavailable: setting lasts for this session only */
  }
}

// ---------------- formatting ----------------
export function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec || 0));
  const hh = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = String(sec % 60).padStart(2, '0');
  return hh ? `${hh}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

export function fmtLong(sec) {
  const hh = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (hh) return `${hh} h ${m} min`;
  return `${m} min`;
}

export const artistNames = (t) => (t && t.artists && t.artists.length ? t.artists.map((a) => a.name).join(', ') : '');

export function titleOf(item) {
  if (!item) return '';
  if (item.kind === 'artist') return item.name;
  if (item.kind === 'playlist' || item.kind === 'mix') return item.name;
  return item.version ? `${item.title} (${item.version})` : item.title;
}

export function subtitleOf(item) {
  if (!item) return '';
  if (item.kind === 'album') return [artistNames(item), item.year].filter(Boolean).join(' · ');
  if (item.kind === 'track') return artistNames(item);
  if (item.kind === 'artist') return 'Artist';
  if (item.kind === 'playlist') return item.count ? `${item.count} tracks` : 'Playlist';
  if (item.kind === 'mix') return `Mix · ${item.count} tracks`;
  return '';
}

export function coverOf(item) {
  if (!item) return null;
  if (item.kind === 'artist') return item.picture;
  return item.cover;
}

// Cover image with a soft coloured placeholder while it loads (or if there is none).
export function art(item, size, cls = 'art') {
  const cover = coverOf(item);
  const url = coverUrl(cover, size);
  const color = cover && cover.color ? cover.color : null;
  const el = h('div', { class: cls });
  el.style.backgroundColor = color ? mix(color, '#151922', 0.55) : '#1A202B';
  if (url) {
    const img = h('img', { src: url, alt: '', loading: 'lazy', decoding: 'async', draggable: 'false' });
    img.addEventListener('load', () => img.classList.add('loaded'));
    img.addEventListener('error', () => img.remove());
    el.appendChild(img);
  } else {
    el.appendChild(icon(item && item.kind === 'artist' ? 'user' : 'music', 'ph'));
  }
  return el;
}

export const colorOf = (item) => {
  const c = coverOf(item);
  return c && c.color ? coverColor(c) : null;
};

// ---------------- colour maths ----------------
export function hexToRgb(hex) {
  let x = String(hex || '').replace('#', '');
  if (x.length === 3) x = x.split('').map((c) => c + c).join('');
  const n = parseInt(x, 16);
  if (Number.isNaN(n) || x.length !== 6) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}

export function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  if (!A || !B) return a;
  return rgbToHex(A.map((v, i) => v * (1 - t) + B[i] * t));
}

function lum([r, g, b]) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(a, b) {
  const la = lum(hexToRgb(a));
  const lb = lum(hexToRgb(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function saturation([r, g, b]) {
  const mx = Math.max(r, g, b) / 255;
  const mn = Math.min(r, g, b) / 255;
  const l = (mx + mn) / 2;
  if (mx === mn) return 0;
  return l > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn);
}

// Turn a cover colour into a readable accent on the dark base, or null for grey covers.
export function accentFrom(hex, base = '#0B0D10') {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  if (saturation(rgb) < 0.18) return null;
  let c = rgbToHex(rgb);
  for (let i = 0; i < 12 && contrast(c, base) < 4.5; i++) c = mix(c, '#FFFFFF', 0.12);
  return c;
}
