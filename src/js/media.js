// Artwork and duration helpers with no dependency on Tidal's libraries,
// so screens and demo mode can use them without loading the SDK.
import { DEFAULT_ACCENT } from './config.js';

export function coverUrl(cover, size) {
  if (!cover || !cover.files || !cover.files.length) return '';
  const pick = cover.files.find((f) => f.w >= size) || cover.files[cover.files.length - 1];
  return pick.href;
}

export function coverColor(cover) {
  return (cover && cover.color) || DEFAULT_ACCENT;
}

export function parseDuration(iso) {
  if (!iso || typeof iso !== 'string') return 0;
  const m = iso.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:([\d.]+)S)?/);
  if (!m) return 0;
  return (+m[1] || 0) * 86400 + (+m[2] || 0) * 3600 + (+m[3] || 0) * 60 + Math.round(+m[4] || 0);
}
