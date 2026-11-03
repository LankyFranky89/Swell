// Colour that follows the cover art: a soft glow behind the app and an accent
// for progress bars, badges and buttons. Two background layers cross-fade.
import { DEFAULT_ACCENT } from './config.js';
import { accentFrom, hexToRgb, settings } from './ui.js';

let layers = [];
let active = 0;
let currentKey = '';
let pending = null;
let base = null; // colour of the playing track, used when nothing else claims the theme

export function initTheme() {
  layers = [document.getElementById('bgA'), document.getElementById('bgB')];
  applyFade();
  apply(null);
}

export function applyFade() {
  const f = settings().fade;
  const ms = f === 'none' ? 0 : f === 'quick' ? 300 : 900;
  document.documentElement.style.setProperty('--fade', `${ms}ms`);
}

function glow(hex, strength) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'none';
  const [r, g, b] = rgb;
  return [
    `radial-gradient(ellipse 70% 80% at 18% 12%, rgba(${r},${g},${b},${0.34 * strength}) 0%, rgba(${r},${g},${b},0) 70%)`,
    `radial-gradient(ellipse 60% 70% at 92% 100%, rgba(${r},${g},${b},${0.16 * strength}) 0%, rgba(${r},${g},${b},0) 70%)`,
  ].join(',');
}

function apply(color) {
  const s = settings();
  const accent = (s.artColors && color && accentFrom(color)) || DEFAULT_ACCENT;
  const glowColor = s.artColors && color && accentFrom(color) ? color : DEFAULT_ACCENT;
  const strength = s.artColors ? (s.intensity === 'rich' ? 1.7 : 1) : 0.6;
  const k = `${accent}|${glowColor}|${strength}`;
  if (k === currentKey) return;
  currentKey = k;
  document.documentElement.style.setProperty('--accent', accent);
  const rgb = hexToRgb(glowColor) || [61, 219, 217];
  document.documentElement.style.setProperty('--glow-rgb', rgb.join(','));
  if (!layers.length) return;
  const next = 1 - active;
  layers[next].style.backgroundImage = glow(glowColor, strength);
  layers[next].style.opacity = '1';
  layers[active].style.opacity = '0';
  active = next;
}

let page = null; // colour of the open album, artist or playlist page
let focus = null; // colour of the focused card while browsing

function schedule(immediate) {
  clearTimeout(pending);
  const c = focus || page || base;
  if (immediate) apply(c);
  else pending = setTimeout(() => apply(c), 220);
}

// Colour of the playing track: the fallback when no page or card claims the theme.
export function setBaseColor(color) {
  base = color || null;
  schedule(false);
}

export function setPageColor(color) {
  page = color || null;
  focus = null;
  schedule(false);
}

// Debounced, so moving quickly across a grid does not flicker.
export function setFocusColor(color) {
  focus = color || null;
  schedule(false);
}

export function refreshTheme() {
  currentKey = '';
  applyFade();
  schedule(true);
}
