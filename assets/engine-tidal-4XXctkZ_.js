import{y as E,f as se,p as ce,n as ue,_ as h}from"./state-BujoNwcN-BvPw8g1C.js";import{a as W}from"./pushkin-C5TU0Pwc-RY0P7U4B.js";import{o as fe,c as le}from"./pushkin-DrXZTQWP-B98o5HSR.js";import{y as de,b as ve,x as he}from"./load-uTL4eiru-CG-eJmr7.js";import{_ as pe}from"./preload-helper-CRSC8v4Z.js";import{E as ye,d as me,A as F,e as ge}from"./main-B1eKfo6b.js";import"./generate-guid-C7EoYu64-Cy9jLxbI.js";function be(){return E.activePlayer?.getPosition()??0}function _e(){return E.activePlayer?.pause()}async function we(){await W.synchronize();let{activePlayer:e}=E;return e?(h.dispatchEvent(new CustomEvent("user-action")),e.play()):Promise.reject(Error("No active player"))}async function Ee(e){let{activePlayer:r}=E;return r?.seek(e)}function Se(e){se.credentialsProvider=e}function Ie(e){ce.eventSender=e}function M(e){ue({streamingWifiAudioQuality:e})}W.synchronize().then().catch(console.error);function Ne(e){E.activePlayer=void 0,de(e.players)}function Re(){let e=localStorage.getItem("ssuid");try{e&&indexedDB.deleteDatabase("streaming-sessions-"+e)}catch(r){console.warn(`DB streaming-sessions-${e} could not be deleted`),console.error(r)}}fe().then().catch(console.error),le().then().catch(console.error),Re();var q=Object.defineProperty,Oe=(e,r)=>{let t={};for(var o in e)q(t,o,{get:e[o],enumerable:!0});return q(t,Symbol.toStringTag,{value:"Module"}),t};function L(e,r){Error.captureStackTrace&&Error.captureStackTrace(e,r)}var V=class A extends Error{errorCode;name="TidalError";constructor(r,t){super(r,t),Object.setPrototypeOf(this,A.prototype),L(this,A),this.errorCode=r}},H=class j extends V{name="IllegalArgumentError";constructor(r,t){super(r,t),Object.setPrototypeOf(this,j.prototype),L(this,j)}},x=!1,Pe=class B extends V{name="OutageStartError";constructor(r,t){super(r,t),Object.setPrototypeOf(this,B.prototype),L(this,B)}},Ce={name:"OutageEndMessage"},C=e=>{x!==e&&(x=e,K(e?new Pe("1"):Ce))},Te=()=>x,De=Oe({bus:()=>Ae,postMessage:()=>K}),Ae=e=>globalThis.addEventListener("eventProducerEventBus",e),K=e=>{const r=new CustomEvent("eventProducerEventBus",{detail:e});globalThis.dispatchEvent(r)},_,je=e=>{_=e},xe=e=>{_.credentialsProvider=e},Be=e=>{_.blockedConsentCategories={..._.blockedConsentCategories,...e}},p=()=>_,ke=class{#e;#r=!1;#t;#n;constructor(e){this.#n=new URL(e),this.synchronize()}now(e=Date.now()){return!this.#t||!this.#e?(console.warn("TrueTime is not yet synchronized"),e):this.#t+(e-this.#e)}async synchronize(){if(!(this.#e&&Math.abs(Date.now()-this.#e)<36e5||this.#r)){this.#r=!0;try{let e=await fetch(this.#n);e.ok&&e.headers.has("date")&&(this.#t=new Date(e.headers.get("date")).getTime(),this.#e=Date.now())}catch(e){console.error(e)}this.#r=!1}}timestamp(e,r){let t;if(r){if(t=performance.getEntriesByName(e).find(o=>"detail"in o&&o.detail===r),!t)throw ReferenceError(`There is no performance entry named "${e}" with detail "${r}"`)}else t=performance.getEntriesByName(e).pop();return t?t.startTime:void 0}},U=new ke("https://api.tidal.com/v1/ping"),Y=`var Ur = Object.create, Ye = Object.defineProperty, Yr = Object.getOwnPropertyDescriptor, $r = Object.getOwnPropertyNames, zr = Object.getPrototypeOf, $e = Object.prototype.hasOwnProperty, Wr = (w, R) => () => (R || (w((R = { exports: {} }).exports, R), w = null), R.exports), Vr = (w, R, E, A) => {
	if (R && typeof R == "object" || typeof R == "function") for (var Y = $r(R), S = 0, B = Y.length, m; S < B; S++) m = Y[S], !$e.call(w, m) && m !== E && Ye(w, m, {
		get: ((x) => R[x]).bind(null, m),
		enumerable: !(A = Yr(R, m)) || A.enumerable
	});
	return w;
}, Kr = (w, R, E) => (E = w != null ? Ur(zr(w)) : {}, Vr(R || !w || !w.__esModule || !$e.call(w, "default") ? Ye(E, "default", {
	value: w,
	enumerable: !0
}) : E, w)), te = /* @__PURE__ */ ((w) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(w, { get: (R, E) => (typeof require < "u" ? require : R)[E] }) : w)(function(w) {
	if (typeof require < "u") return require.apply(this, arguments);
	throw Error("Calling \`require\` for \\"" + w + "\\" in an environment that doesn't expose the \`require\` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
}), Fe = /* @__PURE__ */ Kr((/* @__PURE__ */ Wr(((w, R) => {
	(function(E) {
		if (typeof w == "object" && typeof R < "u") R.exports = E();
		else if (typeof define == "function" && define.amd) define([], E);
		else {
			var A;
			typeof window < "u" ? A = window : typeof global < "u" ? A = global : typeof self < "u" ? A = self : A = this, A.localforage = E();
		}
	})(function() {
		return (function E(A, Y, S) {
			function B(P, $) {
				if (!Y[P]) {
					if (!A[P]) {
						var l = typeof te == "function" && te;
						if (!$ && l) return l(P, !0);
						if (m) return m(P, !0);
						var y = /* @__PURE__ */ new Error("Cannot find module '" + P + "'");
						throw y.code = "MODULE_NOT_FOUND", y;
					}
					var D = Y[P] = { exports: {} };
					A[P][0].call(D.exports, function(N) {
						var z = A[P][1][N];
						return B(z || N);
					}, D, D.exports, E, A, Y, S);
				}
				return Y[P].exports;
			}
			for (var m = typeof te == "function" && te, x = 0; x < S.length; x++) B(S[x]);
			return B;
		})({
			1: [function(E, A, Y) {
				(function(S) {
					"use strict";
					var B = S.MutationObserver || S.WebKitMutationObserver, m;
					if (B) {
						var x = 0, P = new B(N), $ = S.document.createTextNode("");
						P.observe($, { characterData: !0 }), m = function() {
							$.data = x = ++x % 2;
						};
					} else if (!S.setImmediate && typeof S.MessageChannel < "u") {
						var l = new S.MessageChannel();
						l.port1.onmessage = N, m = function() {
							l.port2.postMessage(0);
						};
					} else "document" in S && "onreadystatechange" in S.document.createElement("script") ? m = function() {
						var T = S.document.createElement("script");
						T.onreadystatechange = function() {
							N(), T.onreadystatechange = null, T.parentNode.removeChild(T), T = null;
						}, S.document.documentElement.appendChild(T);
					} : m = function() {
						setTimeout(N, 0);
					};
					var y, D = [];
					function N() {
						y = !0;
						for (var T, W, O = D.length; O;) {
							for (W = D, D = [], T = -1; ++T < O;) W[T]();
							O = D.length;
						}
						y = !1;
					}
					A.exports = z;
					function z(T) {
						D.push(T) === 1 && !y && m();
					}
				}).call(this, typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
			}, {}],
			2: [function(E, A, Y) {
				"use strict";
				var S = E(1);
				function B() {}
				var m = {}, x = ["REJECTED"], P = ["FULFILLED"], $ = ["PENDING"];
				A.exports = l;
				function l(c) {
					if (typeof c != "function") throw new TypeError("resolver must be a function");
					this.state = $, this.queue = [], this.outcome = void 0, c !== B && z(this, c);
				}
				l.prototype.catch = function(c) {
					return this.then(null, c);
				}, l.prototype.then = function(c, b) {
					if (typeof c != "function" && this.state === P || typeof b != "function" && this.state === x) return this;
					var p = new this.constructor(B);
					return this.state !== $ ? D(p, this.state === P ? c : b, this.outcome) : this.queue.push(new y(p, c, b)), p;
				};
				function y(c, b, p) {
					this.promise = c, typeof b == "function" && (this.onFulfilled = b, this.callFulfilled = this.otherCallFulfilled), typeof p == "function" && (this.onRejected = p, this.callRejected = this.otherCallRejected);
				}
				y.prototype.callFulfilled = function(c) {
					m.resolve(this.promise, c);
				}, y.prototype.otherCallFulfilled = function(c) {
					D(this.promise, this.onFulfilled, c);
				}, y.prototype.callRejected = function(c) {
					m.reject(this.promise, c);
				}, y.prototype.otherCallRejected = function(c) {
					D(this.promise, this.onRejected, c);
				};
				function D(c, b, p) {
					S(function() {
						var I;
						try {
							I = b(p);
						} catch (C) {
							return m.reject(c, C);
						}
						I === c ? m.reject(c, /* @__PURE__ */ new TypeError("Cannot resolve promise with itself")) : m.resolve(c, I);
					});
				}
				m.resolve = function(c, b) {
					var p = T(N, b);
					if (p.status === "error") return m.reject(c, p.value);
					var I = p.value;
					if (I) z(c, I);
					else {
						c.state = P, c.outcome = b;
						for (var C = -1, L = c.queue.length; ++C < L;) c.queue[C].callFulfilled(b);
					}
					return c;
				}, m.reject = function(c, b) {
					c.state = x, c.outcome = b;
					for (var p = -1, I = c.queue.length; ++p < I;) c.queue[p].callRejected(b);
					return c;
				};
				function N(c) {
					var b = c && c.then;
					if (c && (typeof c == "object" || typeof c == "function") && typeof b == "function") return function() {
						b.apply(c, arguments);
					};
				}
				function z(c, b) {
					var p = !1;
					function I(M) {
						p || (p = !0, m.reject(c, M));
					}
					function C(M) {
						p || (p = !0, m.resolve(c, M));
					}
					function L() {
						b(C, I);
					}
					var F = T(L);
					F.status === "error" && I(F.value);
				}
				function T(c, b) {
					var p = {};
					try {
						p.value = c(b), p.status = "success";
					} catch (I) {
						p.status = "error", p.value = I;
					}
					return p;
				}
				l.resolve = W;
				function W(c) {
					return c instanceof this ? c : m.resolve(new this(B), c);
				}
				l.reject = O;
				function O(c) {
					var b = new this(B);
					return m.reject(b, c);
				}
				l.all = ie;
				function ie(c) {
					var b = this;
					if (Object.prototype.toString.call(c) !== "[object Array]") return this.reject(/* @__PURE__ */ new TypeError("must be an array"));
					var p = c.length, I = !1;
					if (!p) return this.resolve([]);
					for (var C = new Array(p), L = 0, F = -1, M = new this(B); ++F < p;) V(c[F], F);
					return M;
					function V(G, k) {
						b.resolve(G).then(ae, function(X) {
							I || (I = !0, m.reject(M, X));
						});
						function ae(X) {
							C[k] = X, ++L === p && !I && (I = !0, m.resolve(M, C));
						}
					}
				}
				l.race = H;
				function H(c) {
					var b = this;
					if (Object.prototype.toString.call(c) !== "[object Array]") return this.reject(/* @__PURE__ */ new TypeError("must be an array"));
					var p = c.length, I = !1;
					if (!p) return this.resolve([]);
					for (var C = -1, L = new this(B); ++C < p;) F(c[C]);
					return L;
					function F(M) {
						b.resolve(M).then(function(V) {
							I || (I = !0, m.resolve(L, V));
						}, function(V) {
							I || (I = !0, m.reject(L, V));
						});
					}
				}
			}, { 1: 1 }],
			3: [function(E, A, Y) {
				(function(S) {
					"use strict";
					typeof S.Promise != "function" && (S.Promise = E(2));
				}).call(this, typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {});
			}, { 2: 2 }],
			4: [function(E, A, Y) {
				"use strict";
				var S = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
					return typeof e;
				} : function(e) {
					return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
				};
				function B(e, n) {
					if (!(e instanceof n)) throw new TypeError("Cannot call a class as a function");
				}
				function m() {
					try {
						if (typeof indexedDB < "u") return indexedDB;
						if (typeof webkitIndexedDB < "u") return webkitIndexedDB;
						if (typeof mozIndexedDB < "u") return mozIndexedDB;
						if (typeof OIndexedDB < "u") return OIndexedDB;
						if (typeof msIndexedDB < "u") return msIndexedDB;
					} catch {
						return;
					}
				}
				var x = m();
				function P() {
					try {
						if (!x || !x.open) return !1;
						var e = typeof openDatabase < "u" && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform), n = typeof fetch == "function" && fetch.toString().indexOf("[native code") !== -1;
						return (!e || n) && typeof indexedDB < "u" && typeof IDBKeyRange < "u";
					} catch {
						return !1;
					}
				}
				function $(e, n) {
					e = e || [], n = n || {};
					try {
						return new Blob(e, n);
					} catch (i) {
						if (i.name !== "TypeError") throw i;
						for (var r = new (typeof BlobBuilder < "u" ? BlobBuilder : typeof MSBlobBuilder < "u" ? MSBlobBuilder : typeof MozBlobBuilder < "u" ? MozBlobBuilder : WebKitBlobBuilder)(), t = 0; t < e.length; t += 1) r.append(e[t]);
						return r.getBlob(n.type);
					}
				}
				typeof Promise > "u" && E(3);
				var l = Promise;
				function y(e, n) {
					n && e.then(function(r) {
						n(null, r);
					}, function(r) {
						n(r);
					});
				}
				function D(e, n, r) {
					typeof n == "function" && e.then(n), typeof r == "function" && e.catch(r);
				}
				function N(e) {
					return typeof e != "string" && (console.warn(e + " used as a key, but it is not a string."), e = String(e)), e;
				}
				function z() {
					if (arguments.length && typeof arguments[arguments.length - 1] == "function") return arguments[arguments.length - 1];
				}
				var T = "local-forage-detect-blob-support", W = void 0, O = {}, ie = Object.prototype.toString, H = "readonly", c = "readwrite";
				function b(e) {
					for (var n = e.length, r = new ArrayBuffer(n), t = new Uint8Array(r), i = 0; i < n; i++) t[i] = e.charCodeAt(i);
					return r;
				}
				function p(e) {
					return new l(function(n) {
						var r = e.transaction(T, c), t = $([""]);
						r.objectStore(T).put(t, "key"), r.onabort = function(i) {
							i.preventDefault(), i.stopPropagation(), n(!1);
						}, r.oncomplete = function() {
							var i = navigator.userAgent.match(/Chrome\\/(\\d+)/);
							n(navigator.userAgent.match(/Edge\\//) || !i || parseInt(i[1], 10) >= 43);
						};
					}).catch(function() {
						return !1;
					});
				}
				function I(e) {
					return typeof W == "boolean" ? l.resolve(W) : p(e).then(function(n) {
						return W = n, W;
					});
				}
				function C(e) {
					var n = O[e.name], r = {};
					r.promise = new l(function(t, i) {
						r.resolve = t, r.reject = i;
					}), n.deferredOperations.push(r), n.dbReady ? n.dbReady = n.dbReady.then(function() {
						return r.promise;
					}) : n.dbReady = r.promise;
				}
				function L(e) {
					var n = O[e.name].deferredOperations.pop();
					if (n) return n.resolve(), n.promise;
				}
				function F(e, n) {
					var r = O[e.name].deferredOperations.pop();
					if (r) return r.reject(n), r.promise;
				}
				function M(e, n) {
					return new l(function(r, t) {
						if (O[e.name] = O[e.name] || pe(), e.db) if (n) C(e), e.db.close();
						else return r(e.db);
						var i = [e.name];
						n && i.push(e.version);
						var o = x.open.apply(x, i);
						n && (o.onupgradeneeded = function(a) {
							var f = o.result;
							try {
								f.createObjectStore(e.storeName), a.oldVersion <= 1 && f.createObjectStore(T);
							} catch (u) {
								if (u.name === "ConstraintError") console.warn("The database \\"" + e.name + "\\" has been upgraded from version " + a.oldVersion + " to version " + a.newVersion + ", but the storage \\"" + e.storeName + "\\" already exists.");
								else throw u;
							}
						}), o.onerror = function(a) {
							a.preventDefault(), t(o.error);
						}, o.onsuccess = function() {
							var a = o.result;
							a.onversionchange = function(f) {
								f.target.close();
							}, r(a), L(e);
						};
					});
				}
				function V(e) {
					return M(e, !1);
				}
				function G(e) {
					return M(e, !0);
				}
				function k(e, n) {
					if (!e.db) return !0;
					var r = !e.db.objectStoreNames.contains(e.storeName), t = e.version < e.db.version, i = e.version > e.db.version;
					if (t && (e.version !== n && console.warn("The database \\"" + e.name + \`" can't be downgraded from version \` + e.db.version + " to version " + e.version + "."), e.version = e.db.version), i || r) {
						if (r) {
							var o = e.db.version + 1;
							o > e.version && (e.version = o);
						}
						return !0;
					}
					return !1;
				}
				function ae(e) {
					return new l(function(n, r) {
						var t = new FileReader();
						t.onerror = r, t.onloadend = function(i) {
							n({
								__local_forage_encoded_blob: !0,
								data: btoa(i.target.result || ""),
								type: e.type
							});
						}, t.readAsBinaryString(e);
					});
				}
				function X(e) {
					return $([b(atob(e.data))], { type: e.type });
				}
				function ye(e) {
					return e && e.__local_forage_encoded_blob;
				}
				function ze(e) {
					var n = this, r = n._initReady().then(function() {
						var t = O[n._dbInfo.name];
						if (t && t.dbReady) return t.dbReady;
					});
					return D(r, e, e), r;
				}
				function We(e) {
					C(e);
					for (var n = O[e.name], r = n.forages, t = 0; t < r.length; t++) {
						var i = r[t];
						i._dbInfo.db && (i._dbInfo.db.close(), i._dbInfo.db = null);
					}
					return e.db = null, V(e).then(function(o) {
						return e.db = o, k(e) ? G(e) : o;
					}).then(function(o) {
						e.db = n.db = o;
						for (var a = 0; a < r.length; a++) r[a]._dbInfo.db = o;
					}).catch(function(o) {
						throw F(e, o), o;
					});
				}
				function K(e, n, r, t) {
					t === void 0 && (t = 1);
					try {
						r(null, e.db.transaction(e.storeName, n));
					} catch (i) {
						if (t > 0 && (!e.db || i.name === "InvalidStateError" || i.name === "NotFoundError")) return l.resolve().then(function() {
							if (!e.db || i.name === "NotFoundError" && !e.db.objectStoreNames.contains(e.storeName) && e.version <= e.db.version) return e.db && (e.version = e.db.version + 1), G(e);
						}).then(function() {
							return We(e).then(function() {
								K(e, n, r, t - 1);
							});
						}).catch(r);
						r(i);
					}
				}
				function pe() {
					return {
						forages: [],
						db: null,
						dbReady: null,
						deferredOperations: []
					};
				}
				function Ve(e) {
					var n = this, r = { db: null };
					if (e) for (var t in e) r[t] = e[t];
					var i = O[r.name];
					i || (i = pe(), O[r.name] = i), i.forages.push(n), n._initReady || (n._initReady = n.ready, n.ready = ze);
					var o = [];
					function a() {
						return l.resolve();
					}
					for (var f = 0; f < i.forages.length; f++) {
						var u = i.forages[f];
						u !== n && o.push(u._initReady().catch(a));
					}
					var s = i.forages.slice(0);
					return l.all(o).then(function() {
						return r.db = i.db, V(r);
					}).then(function(v) {
						return r.db = v, k(r, n._defaultConfig.version) ? G(r) : v;
					}).then(function(v) {
						r.db = i.db = v, n._dbInfo = r;
						for (var d = 0; d < s.length; d++) {
							var h = s[d];
							h !== n && (h._dbInfo.db = r.db, h._dbInfo.version = r.version);
						}
					});
				}
				function Ke(e, n) {
					var r = this;
					e = N(e);
					var t = new l(function(i, o) {
						r.ready().then(function() {
							K(r._dbInfo, H, function(a, f) {
								if (a) return o(a);
								try {
									var u = f.objectStore(r._dbInfo.storeName).get(e);
									u.onsuccess = function() {
										var s = u.result;
										s === void 0 && (s = null), ye(s) && (s = X(s)), i(s);
									}, u.onerror = function() {
										o(u.error);
									};
								} catch (s) {
									o(s);
								}
							});
						}).catch(o);
					});
					return y(t, n), t;
				}
				function Qe(e, n) {
					var r = this, t = new l(function(i, o) {
						r.ready().then(function() {
							K(r._dbInfo, H, function(a, f) {
								if (a) return o(a);
								try {
									var u = f.objectStore(r._dbInfo.storeName).openCursor(), s = 1;
									u.onsuccess = function() {
										var v = u.result;
										if (v) {
											var d = v.value;
											ye(d) && (d = X(d));
											var h = e(d, v.key, s++);
											h !== void 0 ? i(h) : v.continue();
										} else i();
									}, u.onerror = function() {
										o(u.error);
									};
								} catch (v) {
									o(v);
								}
							});
						}).catch(o);
					});
					return y(t, n), t;
				}
				function qe(e, n, r) {
					var t = this;
					e = N(e);
					var i = new l(function(o, a) {
						var f;
						t.ready().then(function() {
							return f = t._dbInfo, ie.call(n) === "[object Blob]" ? I(f.db).then(function(u) {
								return u ? n : ae(n);
							}) : n;
						}).then(function(u) {
							K(t._dbInfo, c, function(s, v) {
								if (s) return a(s);
								try {
									var d = v.objectStore(t._dbInfo.storeName);
									u === null && (u = void 0);
									var h = d.put(u, e);
									v.oncomplete = function() {
										u === void 0 && (u = null), o(u);
									}, v.onabort = v.onerror = function() {
										a(h.error ? h.error : h.transaction.error);
									};
								} catch (_) {
									a(_);
								}
							});
						}).catch(a);
					});
					return y(i, r), i;
				}
				function He(e, n) {
					var r = this;
					e = N(e);
					var t = new l(function(i, o) {
						r.ready().then(function() {
							K(r._dbInfo, c, function(a, f) {
								if (a) return o(a);
								try {
									var u = f.objectStore(r._dbInfo.storeName).delete(e);
									f.oncomplete = function() {
										i();
									}, f.onerror = function() {
										o(u.error);
									}, f.onabort = function() {
										o(u.error ? u.error : u.transaction.error);
									};
								} catch (s) {
									o(s);
								}
							});
						}).catch(o);
					});
					return y(t, n), t;
				}
				function Xe(e) {
					var n = this, r = new l(function(t, i) {
						n.ready().then(function() {
							K(n._dbInfo, c, function(o, a) {
								if (o) return i(o);
								try {
									var f = a.objectStore(n._dbInfo.storeName).clear();
									a.oncomplete = function() {
										t();
									}, a.onabort = a.onerror = function() {
										i(f.error ? f.error : f.transaction.error);
									};
								} catch (u) {
									i(u);
								}
							});
						}).catch(i);
					});
					return y(r, e), r;
				}
				function je(e) {
					var n = this, r = new l(function(t, i) {
						n.ready().then(function() {
							K(n._dbInfo, H, function(o, a) {
								if (o) return i(o);
								try {
									var f = a.objectStore(n._dbInfo.storeName).count();
									f.onsuccess = function() {
										t(f.result);
									}, f.onerror = function() {
										i(f.error);
									};
								} catch (u) {
									i(u);
								}
							});
						}).catch(i);
					});
					return y(r, e), r;
				}
				function Ge(e, n) {
					var r = this, t = new l(function(i, o) {
						if (e < 0) {
							i(null);
							return;
						}
						r.ready().then(function() {
							K(r._dbInfo, H, function(a, f) {
								if (a) return o(a);
								try {
									var u = f.objectStore(r._dbInfo.storeName), s = !1, v = u.openKeyCursor();
									v.onsuccess = function() {
										var d = v.result;
										if (!d) {
											i(null);
											return;
										}
										e === 0 || s ? i(d.key) : (s = !0, d.advance(e));
									}, v.onerror = function() {
										o(v.error);
									};
								} catch (d) {
									o(d);
								}
							});
						}).catch(o);
					});
					return y(t, n), t;
				}
				function Je(e) {
					var n = this, r = new l(function(t, i) {
						n.ready().then(function() {
							K(n._dbInfo, H, function(o, a) {
								if (o) return i(o);
								try {
									var f = a.objectStore(n._dbInfo.storeName).openKeyCursor(), u = [];
									f.onsuccess = function() {
										var s = f.result;
										if (!s) {
											t(u);
											return;
										}
										u.push(s.key), s.continue();
									}, f.onerror = function() {
										i(f.error);
									};
								} catch (s) {
									i(s);
								}
							});
						}).catch(i);
					});
					return y(r, e), r;
				}
				function Ze(e, n) {
					n = z.apply(this, arguments);
					var r = this.config();
					e = typeof e != "function" && e || {}, e.name || (e.name = e.name || r.name, e.storeName = e.storeName || r.storeName);
					var t = this, i;
					if (!e.name) i = l.reject("Invalid arguments");
					else {
						var o = e.name === r.name && t._dbInfo.db ? l.resolve(t._dbInfo.db) : V(e).then(function(a) {
							var f = O[e.name], u = f.forages;
							f.db = a;
							for (var s = 0; s < u.length; s++) u[s]._dbInfo.db = a;
							return a;
						});
						e.storeName ? i = o.then(function(a) {
							if (a.objectStoreNames.contains(e.storeName)) {
								var f = a.version + 1;
								C(e);
								var u = O[e.name], s = u.forages;
								a.close();
								for (var v = 0; v < s.length; v++) {
									var d = s[v];
									d._dbInfo.db = null, d._dbInfo.version = f;
								}
								return new l(function(h, _) {
									var g = x.open(e.name, f);
									g.onerror = function(U) {
										g.result.close(), _(U);
									}, g.onupgradeneeded = function() {
										g.result.deleteObjectStore(e.storeName);
									}, g.onsuccess = function() {
										var U = g.result;
										U.close(), h(U);
									};
								}).then(function(h) {
									u.db = h;
									for (var _ = 0; _ < s.length; _++) {
										var g = s[_];
										g._dbInfo.db = h, L(g._dbInfo);
									}
								}).catch(function(h) {
									throw (F(e, h) || l.resolve()).catch(function() {}), h;
								});
							}
						}) : i = o.then(function(a) {
							C(e);
							var f = O[e.name], u = f.forages;
							a.close();
							for (var s = 0; s < u.length; s++) {
								var v = u[s];
								v._dbInfo.db = null;
							}
							return new l(function(d, h) {
								var _ = x.deleteDatabase(e.name);
								_.onerror = function() {
									var g = _.result;
									g && g.close(), h(_.error);
								}, _.onblocked = function() {
									console.warn("dropInstance blocked for database \\"" + e.name + "\\" until all open connections are closed");
								}, _.onsuccess = function() {
									var g = _.result;
									g && g.close(), d(g);
								};
							}).then(function(d) {
								f.db = d;
								for (var h = 0; h < u.length; h++) {
									var _ = u[h];
									L(_._dbInfo);
								}
							}).catch(function(d) {
								throw (F(e, d) || l.resolve()).catch(function() {}), d;
							});
						});
					}
					return y(i, n), i;
				}
				var ke = {
					_driver: "asyncStorage",
					_initStorage: Ve,
					_support: P(),
					iterate: Qe,
					getItem: Ke,
					setItem: qe,
					removeItem: He,
					clear: Xe,
					length: je,
					key: Ge,
					keys: Je,
					dropInstance: Ze
				};
				function er() {
					return typeof openDatabase == "function";
				}
				var Q = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", rr = "~~local_forage_type~", me = /^~~local_forage_type~([^~]+)~/, ee = "__lfsc__:", fe = ee.length, ue = "arbf", se = "blob", ge = "si08", _e = "ui08", be = "uic8", we = "si16", Ee = "si32", Se = "ur16", Ie = "ui32", Re = "fl32", Ae = "fl64", De = fe + ue.length, Ne = Object.prototype.toString;
				function Te(e) {
					var n = e.length * .75, r = e.length, t, i = 0, o, a, f, u;
					e[e.length - 1] === "=" && (n--, e[e.length - 2] === "=" && n--);
					var s = new ArrayBuffer(n), v = new Uint8Array(s);
					for (t = 0; t < r; t += 4) o = Q.indexOf(e[t]), a = Q.indexOf(e[t + 1]), f = Q.indexOf(e[t + 2]), u = Q.indexOf(e[t + 3]), v[i++] = o << 2 | a >> 4, v[i++] = (a & 15) << 4 | f >> 2, v[i++] = (f & 3) << 6 | u & 63;
					return s;
				}
				function ce(e) {
					var n = new Uint8Array(e), r = "", t;
					for (t = 0; t < n.length; t += 3) r += Q[n[t] >> 2], r += Q[(n[t] & 3) << 4 | n[t + 1] >> 4], r += Q[(n[t + 1] & 15) << 2 | n[t + 2] >> 6], r += Q[n[t + 2] & 63];
					return n.length % 3 === 2 ? r = r.substring(0, r.length - 1) + "=" : n.length % 3 === 1 && (r = r.substring(0, r.length - 2) + "=="), r;
				}
				function nr(e, n) {
					var r = "";
					if (e && (r = Ne.call(e)), e && (r === "[object ArrayBuffer]" || e.buffer && Ne.call(e.buffer) === "[object ArrayBuffer]")) {
						var t, i = ee;
						e instanceof ArrayBuffer ? (t = e, i += ue) : (t = e.buffer, r === "[object Int8Array]" ? i += ge : r === "[object Uint8Array]" ? i += _e : r === "[object Uint8ClampedArray]" ? i += be : r === "[object Int16Array]" ? i += we : r === "[object Uint16Array]" ? i += Se : r === "[object Int32Array]" ? i += Ee : r === "[object Uint32Array]" ? i += Ie : r === "[object Float32Array]" ? i += Re : r === "[object Float64Array]" ? i += Ae : n(/* @__PURE__ */ new Error("Failed to get type for BinaryArray"))), n(i + ce(t));
					} else if (r === "[object Blob]") {
						var o = new FileReader();
						o.onload = function() {
							var a = rr + e.type + "~" + ce(this.result);
							n(ee + se + a);
						}, o.readAsArrayBuffer(e);
					} else try {
						n(JSON.stringify(e));
					} catch (a) {
						console.error("Couldn't convert value into a JSON string: ", e), n(null, a);
					}
				}
				function tr(e) {
					if (e.substring(0, fe) !== ee) return JSON.parse(e);
					var n = e.substring(De), r = e.substring(fe, De), t;
					if (r === se && me.test(n)) {
						var i = n.match(me);
						t = i[1], n = n.substring(i[0].length);
					}
					var o = Te(n);
					switch (r) {
						case ue: return o;
						case se: return $([o], { type: t });
						case ge: return new Int8Array(o);
						case _e: return new Uint8Array(o);
						case be: return new Uint8ClampedArray(o);
						case we: return new Int16Array(o);
						case Se: return new Uint16Array(o);
						case Ee: return new Int32Array(o);
						case Ie: return new Uint32Array(o);
						case Re: return new Float32Array(o);
						case Ae: return new Float64Array(o);
						default: throw new Error("Unkown type: " + r);
					}
				}
				var le = {
					serialize: nr,
					deserialize: tr,
					stringToBuffer: Te,
					bufferToString: ce
				};
				function xe(e, n, r, t) {
					e.executeSql("CREATE TABLE IF NOT EXISTS " + n.storeName + " (id INTEGER PRIMARY KEY, key unique, value)", [], r, t);
				}
				function or(e) {
					var n = this, r = { db: null };
					if (e) for (var t in e) r[t] = typeof e[t] != "string" ? e[t].toString() : e[t];
					var i = new l(function(o, a) {
						try {
							r.db = openDatabase(r.name, String(r.version), r.description, r.size);
						} catch (f) {
							return a(f);
						}
						r.db.transaction(function(f) {
							xe(f, r, function() {
								n._dbInfo = r, o();
							}, function(u, s) {
								a(s);
							});
						}, a);
					});
					return r.serializer = le, i;
				}
				function q(e, n, r, t, i, o) {
					e.executeSql(r, t, i, function(a, f) {
						f.code === f.SYNTAX_ERR ? a.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", [n.storeName], function(u, s) {
							s.rows.length ? o(u, f) : xe(u, n, function() {
								u.executeSql(r, t, i, o);
							}, o);
						}, o) : o(a, f);
					}, o);
				}
				function ir(e, n) {
					var r = this;
					e = N(e);
					var t = new l(function(i, o) {
						r.ready().then(function() {
							var a = r._dbInfo;
							a.db.transaction(function(f) {
								q(f, a, "SELECT * FROM " + a.storeName + " WHERE key = ? LIMIT 1", [e], function(u, s) {
									var v = s.rows.length ? s.rows.item(0).value : null;
									v && (v = a.serializer.deserialize(v)), i(v);
								}, function(u, s) {
									o(s);
								});
							});
						}).catch(o);
					});
					return y(t, n), t;
				}
				function ar(e, n) {
					var r = this, t = new l(function(i, o) {
						r.ready().then(function() {
							var a = r._dbInfo;
							a.db.transaction(function(f) {
								q(f, a, "SELECT * FROM " + a.storeName, [], function(u, s) {
									for (var v = s.rows, d = v.length, h = 0; h < d; h++) {
										var _ = v.item(h), g = _.value;
										if (g && (g = a.serializer.deserialize(g)), g = e(g, _.key, h + 1), g !== void 0) {
											i(g);
											return;
										}
									}
									i();
								}, function(u, s) {
									o(s);
								});
							});
						}).catch(o);
					});
					return y(t, n), t;
				}
				function Oe(e, n, r, t) {
					var i = this;
					e = N(e);
					var o = new l(function(a, f) {
						i.ready().then(function() {
							n === void 0 && (n = null);
							var u = n, s = i._dbInfo;
							s.serializer.serialize(n, function(v, d) {
								d ? f(d) : s.db.transaction(function(h) {
									q(h, s, "INSERT OR REPLACE INTO " + s.storeName + " (key, value) VALUES (?, ?)", [e, v], function() {
										a(u);
									}, function(_, g) {
										f(g);
									});
								}, function(h) {
									if (h.code === h.QUOTA_ERR) {
										if (t > 0) {
											a(Oe.apply(i, [
												e,
												u,
												r,
												t - 1
											]));
											return;
										}
										f(h);
									}
								});
							});
						}).catch(f);
					});
					return y(o, r), o;
				}
				function fr(e, n, r) {
					return Oe.apply(this, [
						e,
						n,
						r,
						1
					]);
				}
				function ur(e, n) {
					var r = this;
					e = N(e);
					var t = new l(function(i, o) {
						r.ready().then(function() {
							var a = r._dbInfo;
							a.db.transaction(function(f) {
								q(f, a, "DELETE FROM " + a.storeName + " WHERE key = ?", [e], function() {
									i();
								}, function(u, s) {
									o(s);
								});
							});
						}).catch(o);
					});
					return y(t, n), t;
				}
				function sr(e) {
					var n = this, r = new l(function(t, i) {
						n.ready().then(function() {
							var o = n._dbInfo;
							o.db.transaction(function(a) {
								q(a, o, "DELETE FROM " + o.storeName, [], function() {
									t();
								}, function(f, u) {
									i(u);
								});
							});
						}).catch(i);
					});
					return y(r, e), r;
				}
				function cr(e) {
					var n = this, r = new l(function(t, i) {
						n.ready().then(function() {
							var o = n._dbInfo;
							o.db.transaction(function(a) {
								q(a, o, "SELECT COUNT(key) as c FROM " + o.storeName, [], function(f, u) {
									var s = u.rows.item(0).c;
									t(s);
								}, function(f, u) {
									i(u);
								});
							});
						}).catch(i);
					});
					return y(r, e), r;
				}
				function lr(e, n) {
					var r = this, t = new l(function(i, o) {
						r.ready().then(function() {
							var a = r._dbInfo;
							a.db.transaction(function(f) {
								q(f, a, "SELECT key FROM " + a.storeName + " WHERE id = ? LIMIT 1", [e + 1], function(u, s) {
									i(s.rows.length ? s.rows.item(0).key : null);
								}, function(u, s) {
									o(s);
								});
							});
						}).catch(o);
					});
					return y(t, n), t;
				}
				function dr(e) {
					var n = this, r = new l(function(t, i) {
						n.ready().then(function() {
							var o = n._dbInfo;
							o.db.transaction(function(a) {
								q(a, o, "SELECT key FROM " + o.storeName, [], function(f, u) {
									for (var s = [], v = 0; v < u.rows.length; v++) s.push(u.rows.item(v).key);
									t(s);
								}, function(f, u) {
									i(u);
								});
							});
						}).catch(i);
					});
					return y(r, e), r;
				}
				function vr(e) {
					return new l(function(n, r) {
						e.transaction(function(t) {
							t.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function(i, o) {
								for (var a = [], f = 0; f < o.rows.length; f++) a.push(o.rows.item(f).name);
								n({
									db: e,
									storeNames: a
								});
							}, function(i, o) {
								r(o);
							});
						}, function(t) {
							r(t);
						});
					});
				}
				function hr(e, n) {
					n = z.apply(this, arguments);
					var r = this.config();
					e = typeof e != "function" && e || {}, e.name || (e.name = e.name || r.name, e.storeName = e.storeName || r.storeName);
					var t = this, i;
					return e.name ? i = new l(function(o) {
						var a;
						e.name === r.name ? a = t._dbInfo.db : a = openDatabase(e.name, "", "", 0), e.storeName ? o({
							db: a,
							storeNames: [e.storeName]
						}) : o(vr(a));
					}).then(function(o) {
						return new l(function(a, f) {
							o.db.transaction(function(u) {
								function s(_) {
									return new l(function(g, U) {
										u.executeSql("DROP TABLE IF EXISTS " + _, [], function() {
											g();
										}, function(ne, Z) {
											U(Z);
										});
									});
								}
								for (var v = [], d = 0, h = o.storeNames.length; d < h; d++) v.push(s(o.storeNames[d]));
								l.all(v).then(function() {
									a();
								}).catch(function(_) {
									f(_);
								});
							}, function(u) {
								f(u);
							});
						});
					}) : i = l.reject("Invalid arguments"), y(i, n), i;
				}
				var yr = {
					_driver: "webSQLStorage",
					_initStorage: or,
					_support: er(),
					iterate: ar,
					getItem: ir,
					setItem: fr,
					removeItem: ur,
					clear: sr,
					length: cr,
					key: lr,
					keys: dr,
					dropInstance: hr
				};
				function pr() {
					try {
						return typeof localStorage < "u" && "setItem" in localStorage && !!localStorage.setItem;
					} catch {
						return !1;
					}
				}
				function Be(e, n) {
					var r = e.name + "/";
					return e.storeName !== n.storeName && (r += e.storeName + "/"), r;
				}
				function mr() {
					var e = "_localforage_support_test";
					try {
						return localStorage.setItem(e, !0), localStorage.removeItem(e), !1;
					} catch {
						return !0;
					}
				}
				function gr() {
					return !mr() || localStorage.length > 0;
				}
				function _r(e) {
					var n = this, r = {};
					if (e) for (var t in e) r[t] = e[t];
					return r.keyPrefix = Be(e, n._defaultConfig), gr() ? (n._dbInfo = r, r.serializer = le, l.resolve()) : l.reject();
				}
				function br(e) {
					var n = this, r = n.ready().then(function() {
						for (var t = n._dbInfo.keyPrefix, i = localStorage.length - 1; i >= 0; i--) {
							var o = localStorage.key(i);
							o.indexOf(t) === 0 && localStorage.removeItem(o);
						}
					});
					return y(r, e), r;
				}
				function wr(e, n) {
					var r = this;
					e = N(e);
					var t = r.ready().then(function() {
						var i = r._dbInfo, o = localStorage.getItem(i.keyPrefix + e);
						return o && (o = i.serializer.deserialize(o)), o;
					});
					return y(t, n), t;
				}
				function Er(e, n) {
					var r = this, t = r.ready().then(function() {
						for (var i = r._dbInfo, o = i.keyPrefix, a = o.length, f = localStorage.length, u = 1, s = 0; s < f; s++) {
							var v = localStorage.key(s);
							if (v.indexOf(o) === 0) {
								var d = localStorage.getItem(v);
								if (d && (d = i.serializer.deserialize(d)), d = e(d, v.substring(a), u++), d !== void 0) return d;
							}
						}
					});
					return y(t, n), t;
				}
				function Sr(e, n) {
					var r = this, t = r.ready().then(function() {
						var i = r._dbInfo, o;
						try {
							o = localStorage.key(e);
						} catch {
							o = null;
						}
						return o && (o = o.substring(i.keyPrefix.length)), o;
					});
					return y(t, n), t;
				}
				function Ir(e) {
					var n = this, r = n.ready().then(function() {
						for (var t = n._dbInfo, i = localStorage.length, o = [], a = 0; a < i; a++) {
							var f = localStorage.key(a);
							f.indexOf(t.keyPrefix) === 0 && o.push(f.substring(t.keyPrefix.length));
						}
						return o;
					});
					return y(r, e), r;
				}
				function Rr(e) {
					var n = this.keys().then(function(r) {
						return r.length;
					});
					return y(n, e), n;
				}
				function Ar(e, n) {
					var r = this;
					e = N(e);
					var t = r.ready().then(function() {
						var i = r._dbInfo;
						localStorage.removeItem(i.keyPrefix + e);
					});
					return y(t, n), t;
				}
				function Dr(e, n, r) {
					var t = this;
					e = N(e);
					var i = t.ready().then(function() {
						n === void 0 && (n = null);
						var o = n;
						return new l(function(a, f) {
							var u = t._dbInfo;
							u.serializer.serialize(n, function(s, v) {
								if (v) f(v);
								else try {
									localStorage.setItem(u.keyPrefix + e, s), a(o);
								} catch (d) {
									(d.name === "QuotaExceededError" || d.name === "NS_ERROR_DOM_QUOTA_REACHED") && f(d), f(d);
								}
							});
						});
					});
					return y(i, r), i;
				}
				function Nr(e, n) {
					if (n = z.apply(this, arguments), e = typeof e != "function" && e || {}, !e.name) {
						var r = this.config();
						e.name = e.name || r.name, e.storeName = e.storeName || r.storeName;
					}
					var t = this, i;
					return e.name ? i = new l(function(o) {
						e.storeName ? o(Be(e, t._defaultConfig)) : o(e.name + "/");
					}).then(function(o) {
						for (var a = localStorage.length - 1; a >= 0; a--) {
							var f = localStorage.key(a);
							f.indexOf(o) === 0 && localStorage.removeItem(f);
						}
					}) : i = l.reject("Invalid arguments"), y(i, n), i;
				}
				var Tr = {
					_driver: "localStorageWrapper",
					_initStorage: _r,
					_support: pr(),
					iterate: Er,
					getItem: wr,
					setItem: Dr,
					removeItem: Ar,
					clear: br,
					length: Rr,
					key: Sr,
					keys: Ir,
					dropInstance: Nr
				}, xr = function(n, r) {
					return n === r || typeof n == "number" && typeof r == "number" && isNaN(n) && isNaN(r);
				}, Or = function(n, r) {
					for (var t = n.length, i = 0; i < t;) {
						if (xr(n[i], r)) return !0;
						i++;
					}
					return !1;
				}, Pe = Array.isArray || function(e) {
					return Object.prototype.toString.call(e) === "[object Array]";
				}, J = {}, Ce = {}, j = {
					INDEXEDDB: ke,
					WEBSQL: yr,
					LOCALSTORAGE: Tr
				}, Br = [
					j.INDEXEDDB._driver,
					j.WEBSQL._driver,
					j.LOCALSTORAGE._driver
				], re = ["dropInstance"], de = [
					"clear",
					"getItem",
					"iterate",
					"key",
					"keys",
					"length",
					"removeItem",
					"setItem"
				].concat(re), Pr = {
					description: "",
					driver: Br.slice(),
					name: "localforage",
					size: 4980736,
					storeName: "keyvaluepairs",
					version: 1
				};
				function Cr(e, n) {
					e[n] = function() {
						var r = arguments;
						return e.ready().then(function() {
							return e[n].apply(e, r);
						});
					};
				}
				function ve() {
					for (var e = 1; e < arguments.length; e++) {
						var n = arguments[e];
						if (n) for (var r in n) n.hasOwnProperty(r) && (Pe(n[r]) ? arguments[0][r] = n[r].slice() : arguments[0][r] = n[r]);
					}
					return arguments[0];
				}
				A.exports = new ((function() {
					function e(n) {
						B(this, e);
						for (var r in j) if (j.hasOwnProperty(r)) {
							var t = j[r], i = t._driver;
							this[r] = i, J[i] || this.defineDriver(t);
						}
						this._defaultConfig = ve({}, Pr), this._config = ve({}, this._defaultConfig, n), this._driverSet = null, this._initDriver = null, this._ready = !1, this._dbInfo = null, this._wrapLibraryMethodsWithReady(), this.setDriver(this._config.driver).catch(function() {});
					}
					return e.prototype.config = function(r) {
						if ((typeof r > "u" ? "undefined" : S(r)) === "object") {
							if (this._ready) return /* @__PURE__ */ new Error("Can't call config() after localforage has been used.");
							for (var t in r) {
								if (t === "storeName" && (r[t] = r[t].replace(/\\W/g, "_")), t === "version" && typeof r[t] != "number") return /* @__PURE__ */ new Error("Database version must be a number.");
								this._config[t] = r[t];
							}
							return "driver" in r && r.driver ? this.setDriver(this._config.driver) : !0;
						} else return typeof r == "string" ? this._config[r] : this._config;
					}, e.prototype.defineDriver = function(r, t, i) {
						var o = new l(function(a, f) {
							try {
								var u = r._driver, s = /* @__PURE__ */ new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");
								if (!r._driver) {
									f(s);
									return;
								}
								for (var v = de.concat("_initStorage"), d = 0, h = v.length; d < h; d++) {
									var _ = v[d];
									if ((!Or(re, _) || r[_]) && typeof r[_] != "function") {
										f(s);
										return;
									}
								}
								(function() {
									for (var ne = function(Fr) {
										return function() {
											var Mr = /* @__PURE__ */ new Error("Method " + Fr + " is not implemented by the current driver"), Le = l.reject(Mr);
											return y(Le, arguments[arguments.length - 1]), Le;
										};
									}, Z = 0, Lr = re.length; Z < Lr; Z++) {
										var he = re[Z];
										r[he] || (r[he] = ne(he));
									}
								})();
								var g = function(ne) {
									J[u] && console.info("Redefining LocalForage driver: " + u), J[u] = r, Ce[u] = ne, a();
								};
								"_support" in r ? r._support && typeof r._support == "function" ? r._support().then(g, f) : g(!!r._support) : g(!0);
							} catch (U) {
								f(U);
							}
						});
						return D(o, t, i), o;
					}, e.prototype.driver = function() {
						return this._driver || null;
					}, e.prototype.getDriver = function(r, t, i) {
						var o = J[r] ? l.resolve(J[r]) : l.reject(/* @__PURE__ */ new Error("Driver not found."));
						return D(o, t, i), o;
					}, e.prototype.getSerializer = function(r) {
						var t = l.resolve(le);
						return D(t, r), t;
					}, e.prototype.ready = function(r) {
						var t = this, i = t._driverSet.then(function() {
							return t._ready === null && (t._ready = t._initDriver()), t._ready;
						});
						return D(i, r, r), i;
					}, e.prototype.setDriver = function(r, t, i) {
						var o = this;
						Pe(r) || (r = [r]);
						var a = this._getSupportedDrivers(r);
						function f() {
							o._config.driver = o.driver();
						}
						function u(d) {
							return o._extend(d), f(), o._ready = o._initStorage(o._config), o._ready;
						}
						function s(d) {
							return function() {
								var h = 0;
								function _() {
									for (; h < d.length;) {
										var g = d[h];
										return h++, o._dbInfo = null, o._ready = null, o.getDriver(g).then(u).catch(_);
									}
									f();
									var U = /* @__PURE__ */ new Error("No available storage method found.");
									return o._driverSet = l.reject(U), o._driverSet;
								}
								return _();
							};
						}
						var v = this._driverSet !== null ? this._driverSet.catch(function() {
							return l.resolve();
						}) : l.resolve();
						return this._driverSet = v.then(function() {
							var d = a[0];
							return o._dbInfo = null, o._ready = null, o.getDriver(d).then(function(h) {
								o._driver = h._driver, f(), o._wrapLibraryMethodsWithReady(), o._initDriver = s(a);
							});
						}).catch(function() {
							f();
							var d = /* @__PURE__ */ new Error("No available storage method found.");
							return o._driverSet = l.reject(d), o._driverSet;
						}), D(this._driverSet, t, i), this._driverSet;
					}, e.prototype.supports = function(r) {
						return !!Ce[r];
					}, e.prototype._extend = function(r) {
						ve(this, r);
					}, e.prototype._getSupportedDrivers = function(r) {
						for (var t = [], i = 0, o = r.length; i < o; i++) {
							var a = r[i];
							this.supports(a) && t.push(a);
						}
						return t;
					}, e.prototype._wrapLibraryMethodsWithReady = function() {
						for (var r = 0, t = de.length; r < t; r++) Cr(this, de[r]);
					}, e.prototype.createInstance = function(r) {
						return new e(r);
					}, e;
				})())();
			}, { 3: 3 }]
		}, {}, [4])(4);
	});
})))(), 1);
const oe = Fe.default.createInstance({
	driver: Fe.default.INDEXEDDB,
	name: "EventProducerDB",
	version: 1
});
let Me = !1;
async function qr() {
	return await oe.getItem("events", (w) => {
		if (w) throw console.error("Error in restoring events:", w), w;
	}) ?? void 0;
}
const Ue = async () => {
	Me || (await oe.ready(), Me = !0);
};
self.onmessage = async (w) => {
	const { data: R } = w;
	switch (R.action) {
		case "clear":
			try {
				await Ue(), await oe.removeItem("events"), self.postMessage({ action: "clearSuccess" });
			} catch (E) {
				console.error("Error clearing queue db:", E), self.postMessage({ action: "clearFailed" });
			}
			break;
		case "init":
			try {
				await Ue();
				const E = await qr();
				self.postMessage({
					action: "initSuccess",
					events: E
				});
			} catch (E) {
				console.error("Error initializing queue db:", E), self.postMessage({ action: "initFailed" });
			}
			break;
		case "persist": oe.setItem("events", R.events).catch(console.error);
	}
};
`,z=typeof self<"u"&&self.Blob&&new Blob(["URL.revokeObjectURL(import.meta.url);",Y],{type:"text/javascript;charset=utf-8"});function Le(e){let r;try{if(r=z&&(self.URL||self.webkitURL).createObjectURL(z),!r)throw"";const t=new Worker(r,{type:"module",name:e?.name});return t.addEventListener("error",()=>{(self.URL||self.webkitURL).revokeObjectURL(r)}),t}catch{return new Worker("data:text/javascript;charset=utf-8,"+encodeURIComponent(Y),{type:"module",name:e?.name})}}if(!window.Worker)throw new Error("Web Workers are not supported in this browser");var N=new Le,y=[];function w(){return y}function Ue(){const e=w();return e.length>=10?e.slice(0,10):e}function Q(e){y=e}var J=(e,r)=>new Promise(t=>{const o=a=>{r.includes(a.data.action)&&(N.removeEventListener("message",o),t(a.data))};N.addEventListener("message",o),N.postMessage(e)}),Fe=async e=>{const r=await J({action:"init"},["initSuccess","initFailed"]);if(r.action!=="initSuccess")throw new Error("Failed to initialize queue db");if(r.events){const t=e?.feralEventTypes??[],o=t.length>0?r.events.filter(a=>!t.includes(a.name)):r.events;Q(w().concat(o))}},S=null,Me=e=>S||(S=Fe(e).finally(()=>{S=null}),S),b=null,qe=()=>{if(b)return b;const e=y.length;return y=[],b=J({action:"clear"},["clearSuccess","clearFailed"]).then(r=>{if(r.action!=="clearSuccess")throw new Error("Failed to clear queue db");return e}).finally(()=>{b=null}),b};function G(){N.postMessage({action:"persist",events:w()})}function ze(e){y=y.filter(r=>!e.includes(r.id)),G()}function $e(e){y.push(e),G()}var X=({appInfo:{appName:e,appVersion:r},authorize:t=!0,consentCategory:o,credentials:a,platformData:{browserName:n,browserVersion:i,osName:m},sentTimestamp:g,suppliedHeaders:d})=>{const f=a?.token,s={"app-name":e,"app-version":r,"browser-name":n,"browser-version":i,"client-id":a?.clientId??"clientIDMissing!","consent-category":o,"os-name":m,"requested-sent-timestamp":g};return t&&f&&(s.authorization=f),d&&Object.entries(d).forEach(([c,v])=>{s[c]=v}),s};function Z(e){const r=new URLSearchParams;return e.forEach((t,o)=>{const a=`SendMessageBatchRequestEntry.${o+1}`,n=`${a}.MessageAttribute`;r.append(`${a}.Id`,t.id),r.append(`${a}.MessageBody`,typeof t.payload=="string"?t.payload:JSON.stringify(t.payload)),r.append(`${n}.1.Name`,"Name"),r.append(`${n}.1.Value.StringValue`,t.name),r.append(`${n}.1.Value.DataType`,"String"),t.headers&&(r.append(`${n}.2.Name`,"Headers"),r.append(`${n}.2.Value.DataType`,"String"),r.append(`${n}.2.Value.StringValue`,JSON.stringify(t.headers)))}),r}var R=typeof globalThis?.crypto?.randomUUID=="function",We=()=>globalThis.crypto?.randomUUID(),ee=R?We:()=>{if(!R)throw new Error("Uuid not initialized; run await init(); before using uuid.");return"UUID_NOT_INITIALIZED"};async function Ve(){if(!R){const{nanoid:e}=await pe(async()=>{const{nanoid:r}=await import("./index.browser-B3btpU3i-BjLWcOsa.js");return{nanoid:r}},[]);ee=()=>e()}R=!0}var re=()=>ee(),u={consentFilteredEvents:{},storingFailedEvents:{},validationFailedEvents:{}},te=()=>{u.consentFilteredEvents={},u.storingFailedEvents={},u.validationFailedEvents={}},ne=({eventName:e,reason:r})=>{const t=u[r][e]??0;u[r][e]=t+1},He=()=>Object.keys(u.consentFilteredEvents).length+Object.keys(u.storingFailedEvents).length+Object.keys(u.validationFailedEvents).length>0,Ke=async()=>{if(He()){const e=p();if(!e.credentialsProvider)throw new Error("CredentialsProvider not set");const r=new Headers({"Content-Type":"application/x-www-form-urlencoded"}),t={headers:X({appInfo:e.appInfo,authorize:!1,consentCategory:"NECESSARY",credentials:await e.credentialsProvider?.getCredentials(),platformData:e.platform,sentTimestamp:U.now()}),id:re(),name:"tep-tl-monitoring",payload:JSON.stringify(u)};globalThis.__tepTlDebug?.debug&&console.log("monitoringEvent sent:",t);const o=Z([t]);fetch(e.tlPublicConsumerUri,{body:o,headers:r,method:"post"}).catch(console.error),te()}return Promise.resolve()},oe=async({config:e})=>{const r=Ue();if(r.length===0)return Promise.resolve();const t=new Headers({"Content-Type":"application/x-www-form-urlencoded"});if(!e.credentialsProvider)return Promise.reject(new H("CredentialsProvider not set"));const o=(await e.credentialsProvider?.getCredentials()).token;o&&t.set("Authorization",`Bearer ${o}`);const a=o?e.tlConsumerUri:e.tlPublicConsumerUri,n=Z(r),i=new AbortController,m=setTimeout(()=>i.abort(),1e4);let g,d;try{g=await fetch(a,{body:n,headers:t,method:"post",signal:i.signal}),d=await g.text()}catch{clearTimeout(m),C(!0);return}if(clearTimeout(m),g.ok){Te()&&C(!1);const f=new window.DOMParser().parseFromString(d,"text/xml"),s=[];if(f.querySelectorAll("SendMessageBatchResponse SendMessageBatchResult SendMessageBatchResultEntry Id").forEach(c=>{c.textContent&&s.push(c.textContent)}),f.querySelectorAll("SendMessageBatchResponse SendMessageBatchResult BatchResultErrorEntry").forEach(c=>{const v=c.querySelector("Id")?.textContent,P=c.querySelector("SenderFault")?.textContent==="true";if(v&&P){s.push(v);const l=r.find(ie=>ie.id===v);l&&ne({eventName:l.name,reason:"validationFailedEvents"})}}),ze(s),s.length>0&&w().length>0)return oe({config:e})}else{console.error("Error sending event batch:",d),C(!0);const f=new window.DOMParser().parseFromString(d,"text/xml");if(f.querySelector("ErrorResponse Error Type")?.textContent==="Sender"&&f.querySelector("ErrorResponse Error Code")?.textContent==="AWS.SimpleQueueService.BatchEntryIdsNotDistinct"){const s=w(),c={},v=new Set(s.map(l=>(c[l.id]=l,l.id))),P=Array.from(v).map(l=>c[l]);Q(P)}}return Promise.resolve()},I=null,k=({config:e})=>I||(I=oe({config:e}).finally(()=>{I=null}),I),Ye=3e4,Qe=6e4,T,D,Je=e=>{T&&clearInterval(T);const r=e?.eventBatchInterval??Ye;T=setInterval(()=>{k({config:p()}).catch(console.error)},r),D&&clearInterval(D);const t=e?.monitoringInterval??Qe;D=setInterval(()=>{Ke().catch(console.error)},t)},Ge=async e=>{je(e),await Promise.all([U.synchronize(),Ve(),Me({feralEventTypes:e.feralEventTypes})]),Je(p())},Xe=new TextEncoder,Ze=e=>e.isWellFormed?e.isWellFormed():!0,er=e=>Xe.encode(e).length<20480,rr=({payload:e,...r})=>{const t=JSON.stringify(r)+e;return er(t)&&Ze(t)},tr=({event:e,id:r,ts:t})=>{const{consentCategory:o,...a}=e;return JSON.stringify({...a,ts:t,uuid:r})},nr=async({config:e,credentialsProvider:r,event:t})=>{const o=re(),a=U.now();return{headers:X({appInfo:e.appInfo,consentCategory:t.consentCategory,credentials:await r?.getCredentials(),platformData:e.platform,sentTimestamp:a,suppliedHeaders:t.headers}),id:o,name:t.name,payload:tr({event:t,id:o,ts:a})}},or=e=>{if(!e.payload)throw new Error(`Event is missing payload!: ${JSON.stringify(e)}`);if(!e.name)throw new Error(`Event is missing name! ${JSON.stringify(e)}`);if(!e.consentCategory)throw new Error(`Event is missing consentCategory! ${JSON.stringify(e)}`)},ar=async({config:e,credentialsProvider:r,event:t})=>{if(e.strictMode&&or(t),e.blockedConsentCategories[t.consentCategory])return ne({eventName:t.name,reason:"consentFilteredEvents"}),Promise.resolve();const o=await nr({config:e,credentialsProvider:r,event:t});return rr(o)?$e(o):Promise.resolve()},O=new Set,ir=e=>{const r=p(),{credentialsProvider:t}=r;if(t){const o=ar({config:r,credentialsProvider:t,event:e}).catch(console.error).finally(()=>{O.delete(o)});O.add(o)}else throw new H("CredentialsProvider not set")},ae=e=>Ge(e),sr=async e=>{for(;O.size>0;)await Promise.allSettled(Array.from(O));if(!e?.discardUnsent)return await k({config:p()}),{discarded:0};try{await k({config:p()})}catch(t){console.error("flush: could not submit queued events:",t)}const r=await qe();return te(),{discarded:r}};const cr=Object.freeze(Object.defineProperty({__proto__:null,bus:De,flush:sr,getConfig:p,init:ae,sendEvent:ir,setConsentCategory:Be,setCredentialsProvider:xe},Symbol.toStringTag,{value:"Module"}));function $(e){const r=e.source||{};return{productId:String(e.track.id),productType:"track",referenceId:e.ref,sourceId:String(r.id||"swell"),sourceType:r.type||"TRACK"}}function ur(e){return e?{codec:e.codec||null,bitDepth:e.bitDepth||null,sampleRate:e.sampleRate||null,quality:e.actualAudioQuality||null,preview:e.actualAssetPresentation==="PREVIEW",duration:e.actualDuration||0}:null}async function gr(e){let r={sendEvent(){}};try{await ae({appInfo:{appName:ge,appVersion:F},blockedConsentCategories:{NECESSARY:!1,PERFORMANCE:!0,TARGETING:!0},credentialsProvider:e,platform:{browserName:"webOS TV",browserVersion:navigator.userAgent.match(/Chrome\/([\d.]+)/)?.[1]||"",deviceVendor:"LG",model:"webOS TV",osName:"webOS",version:F},strictMode:!1,tlConsumerUri:me,tlPublicConsumerUri:ye}),r=cr}catch(n){console.warn("Event producer unavailable",n)}const t={...r,sendEvent(n){try{return r.sendEvent(n)}catch(i){console.warn("sendEvent failed",i)}}};Ne({players:[{itemTypes:["track"],player:"shaka",qualities:["HI_RES_LOSSLESS","LOSSLESS","HIGH","LOW"]}]}),Se(e),Ie(t),M(fr());const o={state:[],transition:[],preload:[],ended:[],error:[]},a=(n,...i)=>o[n].forEach(m=>m(...i));return h.addEventListener("playback-state-change",n=>a("state",n.detail.state)),h.addEventListener("media-product-transition",n=>a("transition",n.detail.mediaProduct.referenceId,ur(n.detail.playbackContext))),h.addEventListener("preload-request",()=>a("preload")),h.addEventListener("ended",n=>a("ended",n.detail.reason)),h.addEventListener("error",n=>a("error",n.detail||n)),h.addEventListener("streaming-privileges-revoked",()=>a("error",{errorCode:"PRIVILEGES_REVOKED",message:"Tidal is playing on another device."})),{onState:n=>o.state.push(n),onTransition:n=>o.transition.push(n),onPreload:n=>o.preload.push(n),onEnded:n=>o.ended.push(n),onError:n=>o.error.push(n),load:(n,i)=>he($(n),i||0),play:()=>we(),pause:()=>_e(),seek:n=>Ee(n),setNext:n=>ve(n?$(n):void 0),position:()=>be()||0,setQuality:n=>{M(n)}}}function fr(){try{return JSON.parse(localStorage.getItem("swell.settings")||"{}").quality||"HI_RES_LOSSLESS"}catch{return"HI_RES_LOSSLESS"}}export{gr as createTidalEngine};
