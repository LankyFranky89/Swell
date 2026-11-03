// Small gaps in Chromium 94 (LG webOS 23) that newer code may rely on.
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
}
if (!Array.prototype.findLast) {
  Object.defineProperty(Array.prototype, 'findLast', {
    value(fn, thisArg) {
      for (let i = this.length - 1; i >= 0; i--) if (fn.call(thisArg, this[i], i, this)) return this[i];
      return undefined;
    },
    configurable: true,
    writable: true,
  });
}
if (!Array.prototype.findLastIndex) {
  Object.defineProperty(Array.prototype, 'findLastIndex', {
    value(fn, thisArg) {
      for (let i = this.length - 1; i >= 0; i--) if (fn.call(thisArg, this[i], i, this)) return i;
      return -1;
    },
    configurable: true,
    writable: true,
  });
}
if (!Array.prototype.toSorted) {
  Object.defineProperty(Array.prototype, 'toSorted', {
    value(cmp) {
      return this.slice().sort(cmp);
    },
    configurable: true,
    writable: true,
  });
}
if (!Array.prototype.toReversed) {
  Object.defineProperty(Array.prototype, 'toReversed', {
    value() {
      return this.slice().reverse();
    },
    configurable: true,
    writable: true,
  });
}
if (typeof Promise.withResolvers !== 'function') {
  Promise.withResolvers = function () {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}
if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout !== 'function') {
  AbortSignal.timeout = (ms) => {
    const c = new AbortController();
    setTimeout(() => c.abort(new DOMException('TimeoutError', 'TimeoutError')), ms);
    return c.signal;
  };
}
if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.any !== 'function') {
  AbortSignal.any = (signals) => {
    const c = new AbortController();
    for (const s of signals) {
      if (s.aborted) {
        c.abort(s.reason);
        break;
      }
      s.addEventListener('abort', () => c.abort(s.reason), { once: true });
    }
    return c.signal;
  };
}
if (!Object.hasOwn) {
  Object.hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
}
if (!Array.prototype.at) {
  Object.defineProperty(Array.prototype, 'at', {
    value(n) {
      n = Math.trunc(n) || 0;
      if (n < 0) n += this.length;
      return this[n];
    },
    configurable: true,
    writable: true,
  });
}
