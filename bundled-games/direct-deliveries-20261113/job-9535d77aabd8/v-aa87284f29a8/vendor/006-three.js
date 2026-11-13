import { createLocalSession } from "../local-session.js";
import { ACESFilmicToneMapping as at, Color as Ne, SRGBColorSpace as it, Scene as st, WebGLRenderer as ct } from "./002-three.js";
import { SRGBColorSpace as Ge, TextureLoader as je } from "./002-three.js";
import { GLTFLoader as ze } from "./004-GLTFLoader.js";
import { clone as $e } from "./005-SkeletonUtils.js";
import { Cache as be, LoaderUtils as ve } from "./002-three.js";
var Z = new Map();
function _e(e, t) {
  let r = e.manager,
    a = `file:${t}`,
    i = be.get(a);
  if (i !== void 0) return r.itemStart(t), new Promise(u => {
    setTimeout(() => {
      u(i), r.itemEnd(t);
    }, 0);
  });
  let l = Z.get(t);
  if (l) return l;
  r.itemStart(t);
  let n = fetch(t, {
    headers: e.requestHeader,
    credentials: e.withCredentials ? "include" : "same-origin",
    signal: r.abortController.signal
  }).then(async u => {
    if (u.status !== 200 && u.status !== 0) throw Object.assign(new Error(`fetch for "${u.url}" responded with ${u.status}: ${u.statusText}`), {
      response: u
    });
    let d = await u.arrayBuffer();
    return be.add(a, d), d;
  }).catch(u => {
    throw r.itemError(t), u;
  }).finally(() => {
    Z.delete(t), r.itemEnd(t);
  });
  return Z.set(t, n), n;
}
async function Se(e, t) {
  let r = e.manager,
    a = ve.extractUrlBase(t),
    i = e.resourcePath || (e.path ? ve.resolveURL(a, e.path) : a),
    l = r.resolveURL(e.path + t);
  r.itemStart(t);
  try {
    return await e.parseAsync(await _e(e, l), i);
  } catch (n) {
    throw r.itemError(t), n;
  } finally {
    r.itemEnd(t);
  }
}
function J(e = {}) {
  let t = {
      textures: new Map(),
      models: new Map(),
      audio: new Map(),
      json: new Map()
    },
    r = new Set(),
    a = new je(),
    i = new ze();
  function l(s, f, m) {
    let p = s.get(f);
    if (p === void 0) throw new Error(`Asset '${f}' is not a loaded ${m}. Add it to the manifest passed to createGame.`);
    return p;
  }
  function n(s) {
    s.traverse(f => {
      let m = f;
      m.geometry && r.add(m.geometry);
      let p = m.material;
      if (p) for (let y of Array.isArray(p) ? p : [p]) {
        r.add(y);
        for (let M of Object.values(y)) M?.isTexture && r.add(M);
      }
    });
  }
  async function u(s, f) {
    let m = await a.loadAsync(f);
    m.colorSpace = Ge, m.anisotropy = 4, t.textures.set(s, m), r.add(m);
  }
  async function d(s, f) {
    let m = await Se(i, f);
    t.models.set(s, {
      scene: m.scene,
      animations: m.animations
    }), n(m.scene);
  }
  async function c(s, f) {
    if (!e.decodeAudio) return;
    let m = await fetch(f);
    if (!m.ok) throw new Error(`Failed to load audio '${s}' from ${f}`);
    t.audio.set(s, await e.decodeAudio(await m.arrayBuffer()));
  }
  async function o(s, f) {
    let m = await fetch(f);
    if (!m.ok) throw new Error(`Failed to load json '${s}' from ${f}`);
    t.json.set(s, await m.json());
  }
  return {
    texture: s => l(t.textures, s, "texture"),
    model(s) {
      let f = l(t.models, s, "model");
      return $e(f.scene);
    },
    animations: s => l(t.models, s, "model").animations,
    sound: s => l(t.audio, s, "sound"),
    json: s => l(t.json, s, "json"),
    async load(s, f) {
      let m = [];
      for (let [M, k] of Object.entries(s.textures ?? {})) m.push(() => u(M, k));
      for (let [M, k] of Object.entries(s.models ?? {})) m.push(() => d(M, k));
      for (let [M, k] of Object.entries(s.audio ?? {})) m.push(() => c(M, k));
      for (let [M, k] of Object.entries(s.json ?? {})) m.push(() => o(M, k));
      let p = m.length,
        y = 0;
      f?.(0, p), await Promise.all(m.map(async M => {
        await M(), y++, f?.(y, p);
      }));
    },
    owned: r
  };
}
function Q(e) {
  let t = null,
    r = null,
    a = .6,
    i = 1,
    l = !1;
  function n() {
    if (t) return t;
    let d = window.AudioContext ?? window.webkitAudioContext;
    if (!d) throw new Error("Web Audio is unavailable in this runtime");
    let c = new d(),
      o = c.createGain(),
      s = c.createGain(),
      f = c.createGain();
    return o.gain.value = l ? 0 : 1, s.gain.value = a, f.gain.value = i, s.connect(o), f.connect(o), o.connect(c.destination), t = {
      context: c,
      master: o,
      music: s,
      sfx: f
    }, t;
  }
  let u = () => {
    t && (document.visibilityState === "hidden" ? t.context.suspend() : l || t.context.resume());
  };
  return document.addEventListener("visibilitychange", u), {
    async unlock() {
      let {
        context: d
      } = n();
      d.state !== "running" && (await d.resume());
    },
    decode(d) {
      return n().context.decodeAudioData(d);
    },
    playSfx(d, c = {}) {
      let o = e.sound(d);
      if (!o || l) return;
      let {
        context: s,
        sfx: f
      } = n();
      if (s.state !== "running") return;
      let m = s.createBufferSource();
      m.buffer = o, m.playbackRate.value = c.rate ?? 1;
      let p = s.createGain();
      if (p.gain.value = c.volume ?? 1, c.pan !== void 0 && s.createStereoPanner) {
        let y = s.createStereoPanner();
        y.pan.value = Math.max(-1, Math.min(1, c.pan)), m.connect(p).connect(y).connect(f);
      } else m.connect(p).connect(f);
      m.start(), m.onended = () => {
        m.disconnect(), p.disconnect();
      };
    },
    playMusic(d, c = {}) {
      let o = e.sound(d);
      if (!o) return;
      let {
        context: s,
        music: f
      } = n();
      this.stopMusic(0);
      let m = s.createBufferSource();
      m.buffer = o, m.loop = c.loop ?? !0, m.connect(f);
      let p = c.volume ?? a,
        y = c.fadeIn ?? 0;
      y > 0 ? (f.gain.cancelScheduledValues(s.currentTime), f.gain.setValueAtTime(0, s.currentTime), f.gain.linearRampToValueAtTime(p, s.currentTime + y)) : f.gain.value = p, m.start(), r = m;
    },
    stopMusic(d = 0) {
      let c = r;
      if (!c || !t) return;
      if (r = null, d <= 0) {
        c.stop(), c.disconnect();
        return;
      }
      let {
        context: o,
        music: s
      } = t;
      s.gain.cancelScheduledValues(o.currentTime), s.gain.setValueAtTime(s.gain.value, o.currentTime), s.gain.linearRampToValueAtTime(0, o.currentTime + d), c.stop(o.currentTime + d), c.onended = () => c.disconnect();
    },
    get musicVolume() {
      return a;
    },
    set musicVolume(d) {
      a = Math.max(0, d), t && (t.music.gain.value = a);
    },
    get sfxVolume() {
      return i;
    },
    set sfxVolume(d) {
      i = Math.max(0, d), t && (t.sfx.gain.value = i);
    },
    get muted() {
      return l;
    },
    setMuted(d) {
      if (l = d, !t) return;
      let {
        context: c,
        master: o
      } = t;
      o.gain.cancelScheduledValues(c.currentTime), o.gain.setValueAtTime(o.gain.value, c.currentTime), o.gain.linearRampToValueAtTime(d ? 0 : 1, c.currentTime + .05);
    },
    dispose() {
      document.removeEventListener("visibilitychange", u), this.stopMusic(0), t?.context.close(), t = null;
    }
  };
}
import { MathUtils as j, OrthographicCamera as Me, PerspectiveCamera as Ee, Sphere as Ue, Vector3 as C } from "./002-three.js";
function Ae(e, t) {
  let r = e.fov ?? t.fov,
    a = e.position ?? t.position,
    i = e.lookAt ?? t.lookAt,
    l = new Ee(r, 1, e.near ?? .1, e.far ?? 300);
  l.position.copy(a), l.lookAt(i);
  let n = Math.max(a.distanceTo(i), .001),
    u = 2 * n * Math.tan(j.degToRad(r) / 2);
  return {
    camera: l,
    resize(d) {
      l.aspect = d.aspect;
      let c = u * d.scale.y;
      l.fov = j.radToDeg(2 * Math.atan(c / (2 * n))), l.updateProjectionMatrix();
    },
    update() {}
  };
}
function ee(e = {}) {
  return Ae(e, {
    fov: 50,
    position: new C(0, 6, 14),
    lookAt: new C(0, 1.5, 0)
  });
}
function Be(e = {}) {
  return Ae(e, {
    fov: 40,
    position: new C(0, 5, 18),
    lookAt: new C(0, 1, 0)
  });
}
function Ve(e = {}) {
  let t = e.frustumHeight ?? 14,
    r = e.heading ?? 0,
    a = e.pitch ?? .22,
    i = e.distance ?? 40,
    l = e.lookAt ?? new C(),
    n = new Me(-1, 1, 1, -1, e.near ?? .1, e.far ?? 200);
  return n.position.set(Math.sin(r) * Math.cos(a), Math.sin(a), Math.cos(r) * Math.cos(a)).multiplyScalar(i).add(l), n.lookAt(l), {
    camera: n,
    resize(u) {
      let d = t * u.scale.y,
        c = d * u.aspect;
      n.top = d / 2, n.bottom = -d / 2, n.right = c / 2, n.left = -c / 2, n.updateProjectionMatrix();
    },
    update() {}
  };
}
function Ye(e, t = {}) {
  let r = t.offset ?? new C(0, 9, 12),
    a = t.lookOffset ?? new C(0, 1, 0),
    i = t.smoothing ?? .18,
    l = t.fov ?? 50,
    n = new Ee(l, 1, t.near ?? .1, t.far ?? 300),
    u = e.position.clone(),
    d = new C(),
    c = new C(),
    o = Math.max(r.length(), .001),
    s = 2 * o * Math.tan(j.degToRad(l) / 2);
  return u.copy(e.position), t.bounds && t.bounds.clampPoint(u, u), n.position.copy(u).add(r), n.lookAt(c.copy(u).add(a)), {
    camera: n,
    resize(f) {
      n.aspect = f.aspect, n.fov = j.radToDeg(2 * Math.atan(s * f.scale.y / (2 * o))), n.updateProjectionMatrix();
    },
    update(f) {
      d.copy(e.position), t.bounds && t.bounds.clampPoint(d, d);
      let m = i > 0 ? 1 - Math.exp(-f / i) : 1;
      u.lerp(d, Math.min(m, 1)), n.position.copy(u).add(r), n.lookAt(c.copy(u).add(a));
    }
  };
}
function Xe(e, t, r, a = {}) {
  let i = a.padding ?? 1.1,
    l = t.getBoundingSphere(new Ue()),
    n = a.lookAt ?? l.center,
    u = Math.max(l.radius * i, .001);
  if (e instanceof Me) {
    let f = (e.top - e.bottom) / 2,
      m = (e.right - e.left) / 2;
    e.zoom = Math.min(f / u, m / u), e.updateProjectionMatrix(), e.lookAt(n);
    return;
  }
  let d = j.degToRad(e.fov),
    c = 2 * Math.atan(Math.tan(d / 2) * r.aspect),
    o = Math.max(u / Math.sin(d / 2), u / Math.sin(c / 2)),
    s = e.position.clone().sub(n);
  s.lengthSq() < 1e-8 && s.set(0, .4, 1), e.position.copy(n).addScaledVector(s.normalize(), o), e.lookAt(n);
}
var te = `
.rx-hud {
  --rx-black: #060b0f;
  --rx-white: #fafafa;
  --rx-lime: #b6ff00;
  --rx-section: #171717;
  --rx-secondary: #27272a;
  --rx-muted: #a1a1aa;
  --rx-font: 'Outfit', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --rx-hud-scale: 1;
  --rx-safe-top: 0px;
  --rx-safe-right: 0px;
  --rx-safe-bottom: 0px;
  --rx-safe-left: 0px;

  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    'top-left top top-right'
    'left center right'
    'bottom-left bottom bottom-right';
  /* env() first so the notch is respected from frame one, then the platform's
     own contentSafeAreaInset lands ~a few frames later and transitions in. The
     150ms makes the correction read as motion instead of a snap. */
  padding-top: max(var(--rx-safe-top), env(safe-area-inset-top, 0px));
  padding-right: max(var(--rx-safe-right), env(safe-area-inset-right, 0px));
  padding-bottom: max(var(--rx-safe-bottom), env(safe-area-inset-bottom, 0px));
  padding-left: max(var(--rx-safe-left), env(safe-area-inset-left, 0px));
  transition: padding 150ms ease-out;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  font-family: var(--rx-font);
  color: var(--rx-white);
  z-index: 10;
}

.rx-hud-layer {
  display: flex;
  flex-direction: column;
  gap: calc(8px * var(--rx-hud-scale));
  padding: calc(12px * var(--rx-hud-scale));
  pointer-events: none;
}
.rx-hud-layer[data-interactive='true'] { pointer-events: auto; }

.rx-hud-layer[data-anchor^='top'] { align-self: start; }
.rx-hud-layer[data-anchor^='bottom'] { align-self: end; }
.rx-hud-layer[data-anchor$='left'] { align-items: flex-start; justify-self: start; }
.rx-hud-layer[data-anchor$='right'] { align-items: flex-end; justify-self: end; }
.rx-hud-layer[data-anchor='top'],
.rx-hud-layer[data-anchor='bottom'],
.rx-hud-layer[data-anchor='center'] { align-items: center; justify-self: center; }
.rx-hud-layer[data-anchor='left'] { align-items: flex-start; align-self: center; }
.rx-hud-layer[data-anchor='right'] { align-items: flex-end; align-self: center; }
.rx-hud-layer[data-anchor='center'] { align-self: center; }

.rx-hud-score {
  font-size: calc(40px * var(--rx-hud-scale));
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.rx-hud-chip {
  font-size: calc(14px * var(--rx-hud-scale));
  font-weight: 500;
  line-height: 1;
  padding: calc(6px * var(--rx-hud-scale)) calc(10px * var(--rx-hud-scale));
  border-radius: calc(6px * var(--rx-hud-scale));
  background: color-mix(in srgb, var(--rx-black) 60%, transparent);
  border: 1px solid var(--rx-secondary);
  color: var(--rx-white);
}

.rx-hud-button {
  font-family: var(--rx-font);
  font-size: calc(16px * var(--rx-hud-scale));
  font-weight: 600;
  line-height: 1;
  padding: calc(12px * var(--rx-hud-scale)) calc(20px * var(--rx-hud-scale));
  border-radius: calc(6px * var(--rx-hud-scale));
  border: none;
  background: var(--rx-white);
  color: var(--rx-black);
  pointer-events: auto;
  cursor: pointer;
  touch-action: manipulation;
  transition: transform 150ms ease-out, opacity 150ms ease-out;
  /* 44px is the smallest reliable touch target; scaled type must not shrink
     below it or the button becomes a coin flip on a phone. */
  min-height: calc(44px * var(--rx-hud-scale));
}
.rx-hud-button:active { transform: scale(0.98); }
.rx-hud-button[data-variant='cta'] { background: var(--rx-lime); color: var(--rx-black); }
.rx-hud-button[data-variant='ghost'] {
  background: transparent;
  color: var(--rx-white);
  border: 1px solid var(--rx-secondary);
}

.rx-hud-banner {
  grid-area: center;
  align-self: center;
  justify-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(8px * var(--rx-hud-scale));
  padding: calc(24px * var(--rx-hud-scale));
  border-radius: calc(16px * var(--rx-hud-scale));
  background: color-mix(in srgb, var(--rx-section) 92%, transparent);
  border: 1px solid var(--rx-secondary);
  text-align: center;
  pointer-events: auto;
}
.rx-hud-banner-title {
  font-size: calc(30px * var(--rx-hud-scale));
  font-weight: 600;
  line-height: 1.25;
}
.rx-hud-banner-subtitle {
  font-size: calc(16px * var(--rx-hud-scale));
  color: var(--rx-muted);
}
`;
var ke = "rx-hud-style",
  re = "data-rx-run";
function ne(e, t) {
  if (!document.getElementById(ke)) {
    let c = document.createElement("style");
    c.id = ke, c.textContent = te, document.head.append(c);
  }
  let r = document.createElement("div");
  r.className = "rx-hud", e.append(r);
  let a = new Map(),
    i = !1;
  function l(c) {
    return i && c.setAttribute(re, ""), c;
  }
  function n() {
    let {
      safeArea: c,
      hudScale: o
    } = t;
    r.style.setProperty("--rx-safe-top", `${c.top}px`), r.style.setProperty("--rx-safe-right", `${c.right}px`), r.style.setProperty("--rx-safe-bottom", `${c.bottom}px`), r.style.setProperty("--rx-safe-left", `${c.left}px`), r.style.setProperty("--rx-hud-scale", o.toFixed(4));
  }
  n();
  let u = t.on("resize", n);
  function d(c, o = {}) {
    let s = a.get(c);
    if (s) return o.interactive && (s.dataset.interactive = "true"), s;
    let f = l(document.createElement("div"));
    return f.className = "rx-hud-layer", f.dataset.anchor = c, f.style.gridArea = c, o.interactive && (f.dataset.interactive = "true"), r.append(f), a.set(c, f), f;
  }
  return {
    root: r,
    layer: d,
    score(c = {}) {
      let o = c.format ?? (f => String(Math.floor(f))),
        s = l(document.createElement("div"));
      return s.className = "rx-hud-score", s.textContent = o(0), d(c.anchor ?? "top").append(s), {
        el: s,
        set(f) {
          let m = o(f);
          s.textContent !== m && (s.textContent = m);
        }
      };
    },
    chip(c, o = {}) {
      let s = l(document.createElement("div"));
      return s.className = "rx-hud-chip", s.textContent = c, d(o.anchor ?? "top-left").append(s), {
        el: s,
        set(f) {
          s.textContent !== f && (s.textContent = f);
        }
      };
    },
    button(c, o, s = {}) {
      let f = l(document.createElement("button"));
      return f.type = "button", f.className = "rx-hud-button", f.dataset.variant = s.variant ?? "default", f.textContent = c, f.addEventListener("pointerup", m => {
        m.preventDefault(), m.stopPropagation(), o();
      }), d(s.anchor ?? "bottom", {
        interactive: !0
      }).append(f), f;
    },
    banner(c, o) {
      let s = l(document.createElement("div"));
      s.className = "rx-hud-banner";
      let f = document.createElement("div");
      if (f.className = "rx-hud-banner-title", f.textContent = c, s.append(f), o) {
        let m = document.createElement("div");
        m.className = "rx-hud-banner-subtitle", m.textContent = o, s.append(m);
      }
      return r.append(s), {
        el: s,
        dismiss: () => s.remove()
      };
    },
    sealSetup() {
      i = !0;
    },
    resetRun() {
      for (let c of Array.from(r.querySelectorAll(`[${re}]`))) c.remove();
      for (let [c, o] of a) o.hasAttribute(re) && a.delete(c);
    },
    clear() {
      r.replaceChildren(), a.clear();
    },
    dispose() {
      u(), r.remove(), a.clear();
    }
  };
}
import { Raycaster as We, Vector2 as X, Vector3 as Ke } from "./002-three.js";
var Y = {
  tapMaxMs: 250,
  tapMaxTravel: 12,
  dragMinTravel: 8,
  swipeMinTravel: 60,
  swipeMinSpeed: 200
};
function z() {
  return {
    pointers: [],
    pinchStart: null,
    pinchLast: null
  };
}
function He(e, t) {
  return Math.hypot(e.x - t.x, e.y - t.y);
}
function qe(e, t) {
  return Math.abs(e) >= Math.abs(t) ? e >= 0 ? "right" : "left" : t >= 0 ? "down" : "up";
}
function oe(e, t, r = Y) {
  let a = e.pointers.map(o => ({
      ...o
    })),
    i = [],
    l = a.findIndex(o => o.id === t.id);
  if (t.phase === "down") l >= 0 && a.splice(l, 1), a.push({
    id: t.id,
    x: t.x,
    y: t.y,
    dx: 0,
    dy: 0,
    startX: t.x,
    startY: t.y,
    startTime: t.time,
    duration: 0,
    travel: 0,
    dragging: !1
  }), i.push({
    type: "press",
    data: {
      pointerId: t.id,
      x: t.x,
      y: t.y,
      duration: 0
    }
  });else if (l >= 0) {
    let o = a[l],
      s = t.x - o.x,
      f = t.y - o.y;
    o.x = t.x, o.y = t.y, o.dx = s, o.dy = f, o.travel += Math.hypot(s, f), o.duration = t.time - o.startTime;
    let m = Math.hypot(o.x - o.startX, o.y - o.startY);
    if (t.phase === "move") !o.dragging && m > r.dragMinTravel && (o.dragging = !0), o.dragging && i.push({
      type: "drag",
      data: {
        pointerId: o.id,
        x: o.x,
        y: o.y,
        dx: s,
        dy: f,
        totalX: o.x - o.startX,
        totalY: o.y - o.startY
      }
    });else {
      t.phase === "up" && m > r.dragMinTravel && (s !== 0 || f !== 0) && i.push({
        type: "drag",
        data: {
          pointerId: o.id,
          x: o.x,
          y: o.y,
          dx: s,
          dy: f,
          totalX: o.x - o.startX,
          totalY: o.y - o.startY
        }
      }), a.splice(l, 1);
      let p = {
        pointerId: o.id,
        x: o.x,
        y: o.y,
        duration: o.duration
      };
      if (i.push({
        type: "release",
        data: p
      }), t.phase === "up") {
        let y = o.duration > 0 ? m / o.duration * 1e3 : 0;
        m >= r.swipeMinTravel && y >= r.swipeMinSpeed ? i.push({
          type: "swipe",
          data: {
            pointerId: o.id,
            x: o.x,
            y: o.y,
            dx: o.x - o.startX,
            dy: o.y - o.startY,
            direction: qe(o.x - o.startX, o.y - o.startY),
            speed: y
          }
        }) : o.duration <= r.tapMaxMs && o.travel <= r.tapMaxTravel && i.push({
          type: "tap",
          data: p
        });
      }
    }
  }
  let n = e.pinchStart,
    u = e.pinchLast,
    [d, c] = a;
  if (d && c && a.length === 2) {
    let o = He(d, c);
    n === null || u === null ? (n = o, u = o) : t.phase === "move" && (i.push({
      type: "pinch",
      data: {
        scale: n > 0 ? o / n : 1,
        delta: u > 0 ? o / u : 1,
        distance: o,
        centerX: (d.x + c.x) / 2,
        centerY: (d.y + c.y) / 2
      }
    }), u = o);
  } else n = null, u = null;
  return {
    state: {
      pointers: a,
      pinchStart: n,
      pinchLast: u
    },
    events: i
  };
}
var Ze = 5e3;
function Pe(e, t, r, a, i = {}) {
  let l = i.thresholds ? {
      ...Y,
      ...i.thresholds
    } : void 0,
    n = new Map(),
    u = new We(),
    d = new X(),
    c = new X(),
    o = new X(),
    s = new X(),
    f = z(),
    m = !0,
    p = !1,
    y = Number.NEGATIVE_INFINITY,
    M = !1,
    k = () => typeof performance < "u" ? performance.now() : Date.now(),
    x = i.document !== void 0 ? i.document : typeof document > "u" ? null : document;
  e.style.touchAction = "none", e.tabIndex = -1, e.style.outline = "none";
  function w(h, E) {
    let b = n.get(h);
    if (b) for (let L of [...b]) L(E);
  }
  function S(h) {
    let E = oe(f, h, l);
    f = E.state;
    for (let b of E.events) w(b.type, b.data);
  }
  let g = () => x !== null && x.pointerLockElement === e,
    P = () => g() || p,
    A = "",
    T = () => {
      let h = P();
      h !== M && (M = h, w("lock", {
        locked: h
      }));
    },
    O = () => {
      p || g() || (p = !0, A = e.style.cursor ?? "", e.style.cursor = "none", T());
    },
    V = () => {
      p && (p = !1, e.style.cursor = A, T());
    },
    _ = () => {
      let h = e.requestPointerLock;
      return x === null || typeof h != "function" ? Promise.resolve(!1) : g() ? Promise.resolve(!0) : new Promise(E => {
        let b = we => {
            x.removeEventListener("pointerlockchange", L), x.removeEventListener("pointerlockerror", ye), E(we);
          },
          L = () => b(g()),
          ye = () => b(!1);
        x.addEventListener("pointerlockchange", L), x.addEventListener("pointerlockerror", ye);
        try {
          h.call(e)?.catch?.(() => b(!1));
        } catch {
          b(!1);
        }
      });
    };
  function W(h) {
    let E = h.movementX || 0,
      b = h.movementY || 0;
    E === 0 && b === 0 || (t.toDesign(0, 0, o), t.toDesign(1, 1, s), w("look", {
      dx: E * (s.x - o.x),
      dy: b * (s.y - o.y)
    }));
  }
  function D(h, E) {
    return t.toDesign(h.clientX, h.clientY, c), {
      id: h.pointerId,
      x: c.x,
      y: c.y,
      time: h.timeStamp,
      phase: E
    };
  }
  function G(h) {
    try {
      e.setPointerCapture?.(h);
    } catch {}
  }
  function K(h) {
    try {
      e.releasePointerCapture?.(h);
    } catch {}
  }
  let v = h => {
      m && (h.preventDefault(), e.focus?.({
        preventScroll: !0
      }), y = k(), p && !g() && _(), G(h.pointerId), S(D(h, "down")));
    },
    R = h => {
      if (m) {
        if (P()) {
          W(h);
          return;
        }
        S(D(h, "move"));
      }
    },
    I = () => {
      g() && p && (p = !1, e.style.cursor = A), T();
    },
    F = h => {
      h?.key === "Escape" && V();
    },
    N = h => {
      m && (K(h.pointerId), S(D(h, "up")));
    },
    pe = h => {
      m && S(D(h, "cancel"));
    };
  e.addEventListener("pointerdown", v), e.addEventListener("pointermove", R), e.addEventListener("pointerup", N), e.addEventListener("pointercancel", pe), x?.addEventListener("pointerlockchange", I), x?.addEventListener("keydown", F);
  function ge(h) {
    return h ?? f.pointers[0] ?? null;
  }
  function xe(h) {
    t.designToNdc(h.x, h.y, d), u.setFromCamera(d, r.camera);
  }
  return {
    get pointers() {
      return f.pointers;
    },
    get primary() {
      return f.pointers[0] ?? null;
    },
    get locked() {
      return P();
    },
    get enabled() {
      return m;
    },
    set enabled(h) {
      m = h, h || (f = z());
    },
    on(h, E) {
      let b = n.get(h);
      b || (b = new Set(), n.set(h, b));
      let L = E;
      return b.add(L), () => {
        b?.delete(L);
      };
    },
    pick(h, E) {
      let b = ge(E);
      return b ? (xe(b), h ? u.intersectObjects(h, !0) : u.intersectObjects(a.children, !0)) : [];
    },
    pickPlane(h, E, b) {
      let L = ge(b);
      return L ? (xe(L), u.ray.intersectPlane(h, E ?? new Ke())) : null;
    },
    lockPointer() {
      if (P()) return Promise.resolve(!0);
      if (x === null) return Promise.resolve(!1);
      let h = k() - y <= Ze;
      return _().then(E => E ? !0 : h ? (O(), !0) : !1);
    },
    unlockPointer() {
      g() ? x?.exitPointerLock?.() : V();
    },
    dispose() {
      e.removeEventListener("pointerdown", v), e.removeEventListener("pointermove", R), e.removeEventListener("pointerup", N), e.removeEventListener("pointercancel", pe), x?.removeEventListener("pointerlockchange", I), x?.removeEventListener("keydown", F), p && (p = !1, e.style.cursor = A), n.clear(), f = z();
    }
  };
}
var Je = .25;
function ae(e, t, r, a) {
  if (!(r > 0)) throw new Error(`stepClock: step must be > 0, got ${r}`);
  let i = e + Math.min(Math.max(t, 0), .25),
    l = Math.min(Math.floor(i / r), Math.max(0, Math.floor(a))),
    n = i % r;
  return {
    steps: l,
    alpha: n / r,
    accumulator: n
  };
}
var Qt = 10080 * 60 * 1e3;
function Re(e = Date.now()) {
  let t = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${e}:${t}`;
}
var $ = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};
function ie(e, t) {
  return e.add(t), () => {
    e.delete(t);
  };
}
var Ce = new Set();
function Qe(e) {
  return typeof e == "object" && e !== null && e.isTexture === !0;
}
function Le(e, t, r) {
  if (!(t.has(e) || r.has(e))) {
    r.add(e);
    for (let a of Object.values(e)) !Qe(a) || t.has(a) || r.has(a) || (r.add(a), a.dispose());
    e.dispose();
  }
}
function et(e, t, r) {
  t.has(e) || r.has(e) || (r.add(e), e.dispose());
}
function H(e, t = {}) {
  let r = t.skip ?? Ce,
    a = new Set();
  e.traverse(i => {
    let l = i;
    l.geometry && et(l.geometry, r, a);
    let n = l.material;
    if (n) if (Array.isArray(n)) for (let u of n) Le(u, r, a);else Le(n, r, a);
  });
}
function Oe(e, t = {}) {
  e.removeFromParent(), H(e, t);
}
var U = class {
  items = [];
  skip = Ce;
  constructor(t) {
    t && (this.skip = t);
  }
  add(t) {
    return this.items.push(t), t;
  }
  forget(t) {
    let r = this.items.indexOf(t);
    r >= 0 && this.items.splice(r, 1);
  }
  get size() {
    return this.items.length;
  }
  dispose() {
    for (let t = this.items.length - 1; t >= 0; t--) {
      let r = this.items[t];
      this.skip.has(r) || (tt(r) ? Oe(r, {
        skip: this.skip
      }) : rt(r) && r.dispose());
    }
    this.items.length = 0;
  }
};
function tt(e) {
  return typeof e == "object" && e !== null && e.isObject3D === !0;
}
function rt(e) {
  return typeof e?.dispose == "function";
}
import { Vector2 as le } from "./002-three.js";
var Fe = {
    width: 720,
    height: 1080
  },
  nt = {
    width: 1280,
    height: 720
  },
  ot = 393 / 720;
function ue(e, t, r) {
  let a = e.width / e.height,
    i = t > a,
    l = r === "crop" ? i ? 1 : t / a : i ? t / a : 1,
    n = r === "crop" ? i ? a / t : 1 : i ? 1 : a / t;
  return {
    scaleX: l,
    scaleY: n,
    overscanX: (e.width * l - e.width) / 2,
    overscanY: (e.height * n - e.height) / 2
  };
}
function de(e, t, r, a, i) {
  let l = e.width * t.scaleX,
    n = e.height * t.scaleY,
    u = (e.width - l) / 2,
    d = (e.height - n) / 2,
    c = r > 0 ? l / r : 0,
    o = a > 0 ? n / a : 0,
    s = Math.max(u + i.left * c, 0),
    f = Math.min(u + l - i.right * c, e.width),
    m = Math.max(d + i.top * o, 0),
    p = Math.min(d + n - i.bottom * o, e.height);
  return {
    x: s,
    y: m,
    width: Math.max(f - s, 0),
    height: Math.max(p - m, 0)
  };
}
function fe(e, t = {}) {
  let r = t.design ?? Fe,
    a = t.fit ?? "expand",
    i = t.maxPixelRatio ?? 2,
    l = t.host ?? e.parentElement,
    n = new Set(),
    u = $,
    d = 1,
    c = 1,
    o = ue(r, 1, a),
    s = de(r, o, 1, 1, u),
    f = 1,
    m = Math.min(De(), i);
  function p() {
    let w = l?.getBoundingClientRect();
    d = Math.max(Math.round(w?.width ?? window.innerWidth), 1), c = Math.max(Math.round(w?.height ?? window.innerHeight), 1), o = ue(r, d / c, a), s = de(r, o, d, c, u), f = d / (r.width * o.scaleX) / ot;
  }
  function y() {
    for (let w of [...n]) w(k);
  }
  function M(w, S) {
    let g = e.getBoundingClientRect();
    return {
      fx: g.width > 0 ? (w - g.left) / g.width : 0,
      fy: g.height > 0 ? (S - g.top) / g.height : 0
    };
  }
  let k = {
      design: r,
      get width() {
        return d;
      },
      get height() {
        return c;
      },
      get aspect() {
        return d / c;
      },
      get pixelRatio() {
        return m;
      },
      get scale() {
        return {
          x: o.scaleX,
          y: o.scaleY
        };
      },
      get overscan() {
        return {
          x: o.overscanX,
          y: o.overscanY
        };
      },
      get safeArea() {
        return u;
      },
      get safeRect() {
        return s;
      },
      get hudScale() {
        return f;
      },
      toDesign(w, S, g = new le()) {
        let {
            fx: P,
            fy: A
          } = M(w, S),
          T = r.width * o.scaleX,
          O = r.height * o.scaleY;
        return g.set((r.width - T) / 2 + P * T, (r.height - O) / 2 + A * O);
      },
      toNdc(w, S, g = new le()) {
        let {
          fx: P,
          fy: A
        } = M(w, S);
        return g.set(P * 2 - 1, -(A * 2 - 1));
      },
      designToNdc(w, S, g = new le()) {
        let P = r.width * o.scaleX,
          A = r.height * o.scaleY,
          T = (w - (r.width - P) / 2) / P,
          O = (S - (r.height - A) / 2) / A;
        return g.set(T * 2 - 1, -(O * 2 - 1));
      },
      on(w, S) {
        return n.add(S), () => {
          n.delete(S);
        };
      },
      setSafeArea(w) {
        u = w, p(), y();
      },
      setPixelRatio(w) {
        m = Math.max(Math.min(w, i), 1), y();
      },
      refresh() {
        p(), y();
      },
      dispose() {
        n.clear(), window.removeEventListener("resize", x), window.removeEventListener("orientationchange", x), window.visualViewport?.removeEventListener("resize", x);
      }
    },
    x = () => {
      m = Math.min(De(), i), p(), y();
    };
  return p(), window.addEventListener("resize", x), window.addEventListener("orientationchange", x), window.visualViewport?.addEventListener("resize", x), k;
}
function De() {
  let e = typeof devicePixelRatio == "number" ? devicePixelRatio : 1;
  return e > 0 ? e : 1;
}
var lt = 60;
async function ut(e) {
  let t = e.container ?? document.body,
    r = e.fixedStep ?? 1 / 60,
    a = e.maxStepsPerFrame ?? 5;
  dt(t);
  let i = document.createElement("canvas");
  i.style.display = "block", i.style.width = "100%", i.style.height = "100%", t.append(i);
  let l = fe(i, {
      design: e.design,
      fit: e.fit,
      maxPixelRatio: e.maxPixelRatio ?? 2,
      host: t
    }),
    n = new ct({
      canvas: i,
      antialias: l.pixelRatio < 2,
      stencil: !1,
      powerPreference: "high-performance",
      alpha: !1
    });
  n.outputColorSpace = it, n.toneMapping = at, n.toneMappingExposure = 1;
  let u = new st();
  e.background !== null && (u.background = e.background === void 0 ? new Ne(396047) : typeof e.background == "object" ? e.background : new Ne(e.background));
  let d = e.camera ?? ee(),
    c = Q({
      sound: v => o.sound(v)
    }),
    o = J({
      decodeAudio: v => c.decode(v)
    }),
    s = ne(t, l),
    f = Pe(i, l, d, u),
    p = createLocalSession();
  function y() {
    n.setPixelRatio(l.pixelRatio), n.setSize(l.width, l.height, !1), d.resize(l);
  }
  let M = l.on("resize", y);
  y();
  let k = new U(o.owned),
    x = {
      elapsed: 0,
      delta: 0,
      frame: 0
    },
    w = 0,
    S = 0,
    g = !1,
    P = !1,
    A = {
      renderer: n,
      scene: u,
      rig: d,
      get camera() {
        return d.camera;
      },
      viewport: l,
      input: f,
      assets: o,
      audio: c,
      hud: s,
      localSession: p,
      transient: k,
      time: x,
      get running() {
        return g;
      },
      gameOver(v, R) {
        p.gameOver(v, R), g = !1;
      },
      restart(v) {
        k.dispose(), s.resetRun(), p.rearm(), w = 0, x.elapsed = 0, x.frame = 0, g = !0, e.restart?.(A, v);
      },
      pause() {
        g = !1;
      },
      resume() {
        S = performance.now(), g = !0;
      },
      dispose() {
        P || (P = !0, n.setAnimationLoop(null), M(), T(), O(), V(), document.removeEventListener("visibilitychange", _), k.dispose(), f.dispose(), s.dispose(), c.dispose(), l.dispose(), n.dispose(), i.remove());
      }
    };
  f.on("press", () => {
    c.unlock();
  });
  let T = p.onPlayAgain(v => A.restart(v)),
    O = p.onToggleMute(v => c.setMuted(v)),
    V = p.onGameInfo(v => l.setSafeArea(v.contentSafeAreaInset)),
    _ = () => {
      document.visibilityState === "hidden" ? g = !1 : (S = performance.now(), g = !0);
    };
  document.addEventListener("visibilitychange", _), e.assets && (await o.load(e.assets, e.onProgress));
  let W = await p.ready();
  l.setSafeArea(W.contentSafeAreaInset), await e.setup(A), s.sealSetup(), S = performance.now(), g = !0;
  let D = !1,
    G = !1,
    K = () => {
      let v = d.camera,
        R = v.position,
        I = v.quaternion;
      if (!(Number.isFinite(R.x + R.y + R.z) && Number.isFinite(I.x + I.y + I.z + I.w))) {
        D || (D = !0, console.error("[remix] the camera position or rotation is NaN \u2014 nothing renders. A camera helper was called with the wrong arguments, or a lerp/lookAt read undefined. Fix the call in game-main.ts or the camera system before anything else."));
        return;
      }
      if (D = !1, n.info.render.triangles + n.info.render.points + n.info.render.lines === 0) {
        G || (G = !0, console.error("[remix] the renderer drew nothing this frame \u2014 the scene is empty, everything is outside the camera frustum, or the camera sits inside geometry. Check that the world is added to game.scene and that the camera is placed where it can see it."));
        return;
      }
      G = !1;
    };
  return n.setAnimationLoop(v => {
    let R = Math.max((v - S) / 1e3, 0);
    S = v, x.delta = R;
    let I = 1;
    if (g) {
      let F = ae(w, R, r, a);
      w = F.accumulator, I = F.alpha;
      for (let N = 0; N < F.steps; N++) x.elapsed += r, e.update?.(A, r);
    }
    d.update(R), e.render?.(A, R, I), n.render(u, d.camera), x.frame++, x.frame % lt === 0 && K();
  }), A;
}
function dt(e) {
  if (document.documentElement.style.setProperty("height", "100%"), document.body.style.margin = "0", document.body.style.height = "100%", document.body.style.overflow = "hidden", document.body.style.overscrollBehavior = "none", document.body.style.userSelect = "none", document.body.style.setProperty("-webkit-tap-highlight-color", "transparent"), e === document.body) {
    e.style.position = "relative";
    return;
  }
  e.style.position = "relative", e.style.width = "100%", e.style.height = "100%";
}
function ft(e, t = {}) {
  let r = t.rng ?? Math.random,
    a = [];
  for (let n of e) {
    if (!Number.isInteger(n.count) || n.count <= 0) throw new Error(`createShuffleBag: count must be a positive integer, got ${n.count}`);
    for (let u = 0; u < n.count; u++) a.push(n.value);
  }
  if (a.length === 0) throw new Error("createShuffleBag: entries must not be empty");
  let i = [],
    l = () => {
      i.length = 0, i.push(...a);
      for (let n = i.length - 1; n > 0; n--) {
        let u = Math.floor(r() * (n + 1)),
          d = i[n];
        i[n] = i[u], i[u] = d;
      }
    };
  return {
    draw() {
      return i.length === 0 && l(), i.pop();
    },
    get remaining() {
      return i.length;
    },
    size: a.length,
    reset() {
      i.length = 0;
    }
  };
}
function mt(e) {
  let {
      chance: t,
      guaranteedBy: r
    } = e,
    a = e.rng ?? Math.random;
  if (!(t >= 0 && t <= 1)) throw new Error(`createPityTimer: chance must be in 0..1, got ${t}`);
  if (!Number.isInteger(r) || r <= 0) throw new Error(`createPityTimer: guaranteedBy must be a positive integer, got ${r}`);
  let i = 0;
  return {
    roll() {
      let l = i + 1 >= r || a() < t;
      return i = l ? 0 : i + 1, l;
    },
    get misses() {
      return i;
    },
    reset() {
      i = 0;
    }
  };
}
function ht(e) {
  let {
      start: t,
      step: r
    } = e,
    a = e.rng ?? Math.random;
  if (!(t >= 0 && t <= 1)) throw new Error(`createEscalatingChance: start must be in 0..1, got ${t}`);
  if (!(r > 0)) throw new Error(`createEscalatingChance: step must be > 0, got ${r}`);
  let i = t;
  return {
    roll() {
      let l = a() < i;
      return i = l ? t : Math.min(i + r, 1), l;
    },
    get chance() {
      return i;
    },
    reset() {
      i = t;
    }
  };
}
function pt(e) {
  let t = e >>> 0;
  return () => {
    t = t + 1831565813 >>> 0;
    let r = t;
    return r = Math.imul(r ^ r >>> 15, r | 1), r ^= r + Math.imul(r ^ r >>> 7, r | 61), ((r ^ r >>> 14) >>> 0) / 4294967296;
  };
}
var B = {
    linear: e => e,
    quadIn: e => e * e,
    quadOut: e => e * (2 - e),
    quadInOut: e => e < .5 ? 2 * e * e : 1 - 2 * (1 - e) * (1 - e),
    cubicOut: e => 1 + (e - 1) ** 3,
    backOut: e => 1 + 2.70158 * (e - 1) ** 3 + 1.70158 * (e - 1) ** 2,
    elasticOut: e => e === 0 || e === 1 ? e : 2 ** (-10 * e) * Math.sin((e * 10 - .75) * (2 * Math.PI / 3)) + 1
  },
  q = 1e-9,
  gt = e => {
    if (e === void 0) return B.quadOut;
    if (typeof e == "function") return e;
    let t = B[e];
    if (!t) throw new Error(`unknown easing '${String(e)}'`);
    return t;
  };
function xt() {
  let e = [];
  return {
    to(t, r, a) {
      if (!(a.duration >= 0)) throw new Error(`tween duration must be >= 0, got ${a.duration}`);
      let i = t,
        l = Object.keys(r),
        n = {
          target: i,
          keys: l,
          from: l.map(u => {
            let d = i[u];
            if (typeof d != "number") throw new Error(`tween target property '${u}' is not a number`);
            return d;
          }),
          to: l.map(u => r[u]),
          easing: gt(a.easing),
          duration: a.duration,
          yoyo: a.yoyo ?? !1,
          elapsed: 0,
          cancelled: !1,
          onUpdate: a.onUpdate,
          onComplete: a.onComplete
        };
      return e.push(n), {
        cancel() {
          n.cancelled = !0;
        },
        get done() {
          return n.cancelled || n.elapsed + q >= n.duration * (n.yoyo ? 2 : 1);
        }
      };
    },
    update(t) {
      if (e.length === 0) return;
      let r = [];
      for (let a of e) {
        if (a.cancelled) continue;
        a.elapsed += t;
        let i = a.duration * (a.yoyo ? 2 : 1),
          l = a.elapsed + q >= i;
        if (l) {
          let n = a.yoyo ? a.from : a.to;
          for (let u = 0; u < a.keys.length; u++) a.target[a.keys[u]] = n[u];
        } else {
          let n = a.elapsed / i,
            u = a.yoyo ? 1 - Math.abs(1 - 2 * n) : n,
            d = a.easing(u);
          for (let c = 0; c < a.keys.length; c++) {
            let o = a.from[c];
            a.target[a.keys[c]] = o + (a.to[c] - o) * d;
          }
        }
        a.onUpdate?.(), l && r.push(a);
      }
      if (r.length > 0 || e.some(a => a.cancelled)) {
        e = e.filter(a => !a.cancelled && !r.includes(a));
        for (let a of r) a.onComplete?.();
      }
    },
    cancelAll() {
      for (let t of e) t.cancelled = !0;
      e = [];
    },
    get active() {
      return e.filter(t => !t.cancelled).length;
    }
  };
}
function yt(e, t = {}) {
  let r = t.maxOffset ?? .35,
    a = t.maxRoll ?? .04,
    i = t.decay ?? 1.5,
    l = t.rng ?? Math.random,
    n = 0,
    u = 0,
    d = 0,
    c = 0,
    o = () => {
      e.camera.rotateZ(-c), e.camera.translateY(-d), e.camera.translateX(-u), u = 0, d = 0, c = 0;
    };
  return {
    get camera() {
      return e.camera;
    },
    resize(s) {
      e.resize(s);
    },
    update(s) {
      o(), e.update(s), n = Math.max(n - i * s, 0);
      let f = n * n;
      f > 0 && (u = r * f * (l() * 2 - 1), d = r * f * (l() * 2 - 1), c = a * f * (l() * 2 - 1), e.camera.translateX(u), e.camera.translateY(d), e.camera.rotateZ(c));
    },
    shake(s) {
      n = Math.min(n + Math.max(s, 0), 1);
    },
    get trauma() {
      return n;
    }
  };
}
function wt() {
  let e = 0;
  return {
    trigger(t) {
      e = Math.max(e, t);
    },
    frozen(t) {
      return e <= q ? (e = 0, !1) : (e -= t, !0);
    },
    get active() {
      return e > q;
    }
  };
}
function bt(e) {
  if (!(e.over > 0)) throw new Error(`createRamp: over must be > 0, got ${e.over}`);
  let t = typeof e.curve == "function" ? e.curve : B[e.curve ?? "quadIn"];
  if (!t) throw new Error(`createRamp: unknown easing '${String(e.curve)}'`);
  return r => {
    let a = Math.min(Math.max(r / e.over, 0), 1);
    return e.from + (e.to - e.from) * t(a);
  };
}
function vt(e) {
  if (!(e > 0)) throw new Error(`createGraceWindow: seconds must be > 0, got ${e}`);
  let t = 0;
  return {
    refresh() {
      t = e;
    },
    update(r) {
      t = Math.max(t - r, 0);
    },
    get active() {
      return t > 0;
    },
    consume() {
      let r = t > 0;
      return t = 0, r;
    }
  };
}
function St(e) {
  if (!(e > 0)) throw new Error(`createInputBuffer: seconds must be > 0, got ${e}`);
  let t = 0;
  return {
    press() {
      t = e;
    },
    update(r) {
      t = Math.max(t - r, 0);
    },
    consume() {
      let r = t > 0;
      return t = 0, r;
    },
    get pending() {
      return t > 0;
    }
  };
}
var me = class {
  items = [];
  idle = [];
  live = [];
  capacity;
  parent;
  reset;
  constructor(t, r = {}) {
    this.capacity = Math.max(r.size ?? 32, 0), this.parent = r.parent, this.reset = r.reset;
    for (let a = 0; a < this.capacity; a++) {
      let i = t();
      i.visible = !1, this.items.push(i), this.idle.push(i);
    }
  }
  get active() {
    return this.live;
  }
  get free() {
    return this.idle.length;
  }
  acquire() {
    let t = this.idle.pop();
    return t ? (t.visible = !0, this.live.push(t), this.parent && t.parent !== this.parent && this.parent.add(t), t) : null;
  }
  release(t) {
    let r = this.live.indexOf(t);
    r < 0 || (this.live.splice(r, 1), t.visible = !1, this.reset?.(t), this.idle.push(t));
  }
  releaseAll() {
    for (let t of [...this.live]) this.release(t);
  }
  dispose() {
    this.releaseAll();
    for (let t of this.items) t.removeFromParent(), H(t);
    this.items.length = 0, this.idle.length = 0;
  }
};
import { CircleGeometry as Mt, Color as Et, DirectionalLight as At, Fog as kt, HemisphereLight as Pt, Mesh as Rt, MeshBasicMaterial as Tt, PCFSoftShadowMap as It, Vector3 as he } from "./002-three.js";
var Lt = {
  studio: {
    background: 1119773,
    hemiSky: 16777215,
    hemiGround: 4871528,
    hemiIntensity: 1.1,
    keyColor: 16777215,
    keyIntensity: 2.2,
    keyPosition: [5, 10, 7],
    fog: null
  },
  sunset: {
    background: 2825011,
    hemiSky: 16759178,
    hemiGround: 2759226,
    hemiIntensity: 1,
    keyColor: 16765088,
    keyIntensity: 2.6,
    keyPosition: [-6, 6, 4],
    fog: [2825011, 18, 60]
  },
  night: {
    background: 396047,
    hemiSky: 12571903,
    hemiGround: 659220,
    hemiIntensity: .9,
    keyColor: 16777215,
    keyIntensity: 1.2,
    keyPosition: [4, 8, 6],
    fog: [396047, 14, 40]
  }
};
function Ct(e, t, r = {}) {
  let a = Lt[t];
  e.background = new Et(a.background), e.fog = a.fog ? new kt(a.fog[0], a.fog[1], a.fog[2]) : null;
  let i = new Pt(a.hemiSky, a.hemiGround, a.hemiIntensity),
    l = new At(a.keyColor, a.keyIntensity);
  if (l.position.set(...a.keyPosition), e.add(i, l), r.shadows) {
    l.castShadow = !0, l.shadow.mapSize.set(1024, 1024), r.renderer && (r.renderer.shadowMap.enabled = !0, r.renderer.shadowMap.type = It);
    let n = r.shadowBounds;
    if (n) {
      let u = n.getSize(new he()),
        d = Math.max(u.x, u.z) / 2 + 1,
        c = l.shadow.camera;
      c.left = -d, c.right = d, c.top = d, c.bottom = -d, c.near = .5, c.far = Math.max(u.y * 2 + d * 4, 50), c.updateProjectionMatrix(), l.target.position.copy(n.getCenter(new he())), e.add(l.target);
    }
  }
  return {
    key: l,
    fill: i,
    dispose() {
      l.removeFromParent(), l.target.removeFromParent(), i.removeFromParent(), l.dispose(), i.dispose(), e.fog = null;
    }
  };
}
function Ot(e, t = {}) {
  let r = t.radius ?? .72,
    a = t.groundY ?? 0,
    i = new Mt(r, 24),
    l = new Tt({
      color: 0,
      transparent: !0,
      opacity: t.opacity ?? .15,
      depthWrite: !1
    }),
    n = new Rt(i, l);
  n.rotation.x = -Math.PI / 2, n.renderOrder = -1;
  let u = new he();
  return {
    mesh: n,
    update() {
      e.getWorldPosition(u), n.position.set(u.x, a + .01, u.z);
      let d = Math.max(u.y - a, 0),
        c = Math.max(1 - d / 8, .15);
      n.scale.setScalar(c), l.opacity = (t.opacity ?? .15) * c;
    },
    dispose() {
      n.removeFromParent(), i.dispose(), l.dispose();
    }
  };
}
function Dt(e) {
  return Object.freeze({
    ...e
  });
}
export { Fe as DEFAULT_DESIGN, Y as DEFAULT_THRESHOLDS, U as DisposalScope, te as HUD_CSS, nt as LANDSCAPE_DESIGN, Je as MAX_FRAME_DELTA, me as Pool, Ct as applyLighting, Ot as blobShadow, J as createAssets, Q as createAudio, ht as createEscalatingChance, ut as createGame, z as createGestureState, vt as createGraceWindow, wt as createHitStop, ne as createHud, St as createInputBuffer, mt as createPityTimer, bt as createRamp, ft as createShuffleBag, xt as createTweens, fe as createViewport, Dt as defineAsset, Oe as destroy, H as disposeObject, B as easings, Xe as fitBounds, ue as fitFrustum, Ye as followRig, Be as landscapeRig, Ve as orthoRig, ee as portraitRig, oe as reduceGestures, de as safeRectOf, pt as seededRandom, yt as shakeRig, ae as stepClock };
