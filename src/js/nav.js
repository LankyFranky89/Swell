// Remote control navigation: arrow keys move focus to the nearest item in that
// direction, OK activates it, a long press on OK opens the options menu,
// and Back returns. The Magic Remote pointer focuses whatever it hovers.

const KEY = {
  LEFT: [37],
  UP: [38],
  RIGHT: [39],
  DOWN: [40],
  OK: [13],
  BACK: [461, 27, 8, 10009],
  PLAY: [415],
  PAUSE: [19],
  PLAYPAUSE: [179],
  STOP: [413],
  FF: [417, 176],
  RW: [412, 177],
};
const is = (name, code) => KEY[name].includes(code);

let root = null;
let handlers = {};
let okDownAt = 0;
let okTimer = null;
let longFired = false;

export const FOCUSABLE = 'button:not([disabled]), a[href], input, [data-focus]';

export function initNav(rootEl, h) {
  root = rootEl;
  handlers = h;
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('keyup', onKeyUp, true);
  // Magic Remote pointer: hovering focuses.
  root.addEventListener('mouseover', (e) => {
    const el = e.target.closest(FOCUSABLE);
    if (el && el !== document.activeElement && visible(el) && inScope(el)) el.focus({ preventScroll: true });
  });
  // Keep a highlighted element even after clicks on empty areas.
  root.addEventListener('mousedown', (e) => {
    if (!e.target.closest(FOCUSABLE)) e.preventDefault();
  });
}

// When an overlay (Now Playing, queue, menu) is open, focus stays inside it.
let scopeEl = null;
export function setScope(el) {
  scopeEl = el;
}

function inScope(el) {
  return !scopeEl || scopeEl.contains(el);
}

function visible(el) {
  if (!el.isConnected) return false;
  const r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return false;
  const style = getComputedStyle(el);
  return style.visibility !== 'hidden' && style.display !== 'none';
}

function candidates() {
  const scope = scopeEl || root;
  return [...scope.querySelectorAll(FOCUSABLE)].filter(
    (el) => !el.closest('[hidden]') && !el.closest('[inert]') && visible(el),
  );
}

export function focusFirst(container) {
  const scope = container || scopeEl || root;
  const auto = [...scope.querySelectorAll('[data-autofocus]')].find((x) => !x.disabled && visible(x));
  const el = auto || [...scope.querySelectorAll(FOCUSABLE)].find((x) => visible(x) && !x.closest('.sidebar'));
  if (el) {
    el.focus({ preventScroll: true });
    reveal(el);
    return true;
  }
  return false;
}

function rectOf(el) {
  return el.getBoundingClientRect();
}

function move(dir) {
  const cur = document.activeElement;
  const list = candidates();
  if (!cur || !list.includes(cur)) {
    if (list[0]) {
      list[0].focus({ preventScroll: true });
      reveal(list[0]);
    }
    return;
  }
  const a = rectOf(cur);
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  let best = null;
  let bestScore = Infinity;
  for (const el of list) {
    if (el === cur) continue;
    const b = rectOf(el);
    const bx = b.left + b.width / 2;
    const by = b.top + b.height / 2;
    let primary;
    let secondary;
    if (dir === 'LEFT') {
      if (b.right > a.left + 4 && bx >= ax) continue;
      primary = Math.max(0, a.left - b.right);
      secondary = overlap(a.top, a.bottom, b.top, b.bottom) ? 0 : Math.abs(by - ay);
    } else if (dir === 'RIGHT') {
      if (b.left < a.right - 4 && bx <= ax) continue;
      primary = Math.max(0, b.left - a.right);
      secondary = overlap(a.top, a.bottom, b.top, b.bottom) ? 0 : Math.abs(by - ay);
    } else if (dir === 'UP') {
      if (b.bottom > a.top + 4 && by >= ay) continue;
      primary = Math.max(0, a.top - b.bottom);
      secondary = overlap(a.left, a.right, b.left, b.right) ? Math.abs(bx - ax) * 0.1 : Math.abs(bx - ax);
    } else {
      if (b.top < a.bottom - 4 && by <= ay) continue;
      primary = Math.max(0, b.top - a.bottom);
      secondary = overlap(a.left, a.right, b.left, b.right) ? Math.abs(bx - ax) * 0.1 : Math.abs(bx - ax);
    }
    const score = primary + secondary * 2.2;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }
  if (best) {
    best.focus({ preventScroll: true });
    reveal(best);
  } else if (handlers.edge) {
    handlers.edge(dir, cur);
  }
}

function overlap(a1, a2, b1, b2) {
  return Math.min(a2, b2) - Math.max(a1, b1) > 4;
}

// Scroll the focused item into view inside its scrolling row or page, with margin.
export function reveal(el) {
  let p = el.parentElement;
  while (p && p !== document.body) {
    const s = getComputedStyle(p);
    const sx = /(auto|scroll)/.test(s.overflowX) && p.scrollWidth > p.clientWidth;
    const sy = /(auto|scroll)/.test(s.overflowY) && p.scrollHeight > p.clientHeight;
    if (sx || sy) {
      const pr = p.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const m = 60;
      if (sx) {
        if (r.left < pr.left + m) p.scrollLeft -= pr.left + m - r.left;
        else if (r.right > pr.right - m) p.scrollLeft += r.right - (pr.right - m);
      }
      if (sy) {
        const mt = 120;
        if (r.top < pr.top + mt) p.scrollTop -= pr.top + mt - r.top;
        else if (r.bottom > pr.bottom - mt) p.scrollTop += r.bottom - (pr.bottom - mt);
      }
    }
    p = p.parentElement;
  }
}

function typing() {
  const a = document.activeElement;
  return a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA');
}

function onKeyDown(e) {
  const c = e.keyCode;
  if (typing()) {
    // In a text field, left/right move the caret; up/down and Back leave the field.
    if (is('UP', c) || is('DOWN', c)) {
      e.preventDefault();
      move(is('UP', c) ? 'UP' : 'DOWN');
      return;
    }
    if (c === 461 || c === 27) {
      e.preventDefault();
      document.activeElement.blur();
      focusFirst();
      return;
    }
    if (is('OK', c) && handlers.submit) {
      handlers.submit(document.activeElement);
    }
    return;
  }
  const dir = is('LEFT', c) ? 'LEFT' : is('RIGHT', c) ? 'RIGHT' : is('UP', c) ? 'UP' : is('DOWN', c) ? 'DOWN' : null;
  if (dir) {
    // Elements marked data-arrows (seek bar, queue rows) may use arrows themselves.
    const a = document.activeElement;
    if (a && a.dataset && a.dataset.arrows !== undefined) {
      const ev = new CustomEvent('arrow', { detail: dir, cancelable: true });
      a.dispatchEvent(ev);
      if (ev.defaultPrevented) return prevent(e, () => {});
    }
    return prevent(e, () => move(dir));
  }
  if (is('BACK', c)) return prevent(e, () => handlers.back && handlers.back());
  if (is('PLAY', c) || is('PAUSE', c) || is('PLAYPAUSE', c)) return prevent(e, () => handlers.media && handlers.media(c === 415 ? 'play' : c === 19 ? 'pause' : 'toggle'));
  if (is('STOP', c)) return prevent(e, () => handlers.media && handlers.media('pause'));
  if (is('FF', c)) return prevent(e, () => handlers.media && handlers.media('next'));
  if (is('RW', c)) return prevent(e, () => handlers.media && handlers.media('prev'));
  if (is('OK', c)) {
    e.preventDefault();
    if (e.repeat) return;
    okDownAt = Date.now();
    longFired = false;
    const target = document.activeElement;
    clearTimeout(okTimer);
    okTimer = setTimeout(() => {
      if (target && target.dataset && target.dataset.menu !== undefined) {
        longFired = true;
        target.dispatchEvent(new CustomEvent('longpress', { bubbles: true }));
      }
    }, 650);
  }
}

function onKeyUp(e) {
  if (typing()) return;
  if (is('OK', e.keyCode)) {
    e.preventDefault();
    clearTimeout(okTimer);
    if (!longFired && okDownAt) {
      const el = document.activeElement;
      if (el && el.matches(FOCUSABLE)) el.click();
    }
    okDownAt = 0;
  }
}

function prevent(e, fn) {
  e.preventDefault();
  e.stopPropagation();
  fn();
}
