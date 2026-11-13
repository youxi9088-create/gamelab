import { ACESFilmicToneMapping as it, Color as Ne, SRGBColorSpace as st, Scene as ct, WebGLRenderer as lt } from "./002-three.js";
import { SRGBColorSpace as je, TextureLoader as ze } from "./002-three.js";
import { GLTFLoader as Ue } from "./004-GLTFLoader.js";
import { clone as $e } from "./005-SkeletonUtils.js";
import { Cache as ve, LoaderUtils as Se } from "./002-three.js";
var J = new Map();
function Ge(e, t) {
  let n = e.manager,
    a = `file:${t}`,
    i = ve.get(a);
  if (i !== void 0) return n.itemStart(t), new Promise(l => {
    setTimeout(() => {
      l(i), n.itemEnd(t);
    }, 0);
  });
  let u = J.get(t);
  if (u) return u;
  n.itemStart(t);
  let r = fetch(t, {
    headers: e.requestHeader,
    credentials: e.withCredentials ? "include" : "same-origin",
    signal: n.abortController.signal
  }).then(async l => {
    if (l.status !== 200 && l.status !== 0) throw Object.assign(new Error(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`), {
      response: l
    });
    let d = await l.arrayBuffer();
    return ve.add(a, d), d;
  }).catch(l => {
    throw n.itemError(t), l;
  }).finally(() => {
    J.delete(t), n.itemEnd(t);
  });
  return J.set(t, r), r;
}
async function Ee(e, t) {
  let n = e.manager,
    a = Se.extractUrlBase(t),
    i = e.resourcePath || (e.path ? Se.resolveURL(a, e.path) : a),
    u = n.resolveURL(e.path + t);
  n.itemStart(t);
  try {
    return await e.parseAsync(await Ge(e, u), i);
  } catch (r) {
    throw n.itemError(t), r;
  } finally {
    n.itemEnd(t);
  }
}
function Q(e = {}) {
  let t = {
      textures: new Map(),
      models: new Map(),
      audio: new Map(),
      json: new Map()
    },
    n = new Set(),
    a = new ze(),
    i = new Ue();
  function u(s, f, m) {
    let p = s.get(f);
    if (p === void 0) throw new Error(`Asset '${f}' is not a loaded ${m}. Add it to the manifest passed to createGame.`);
    return p;
  }
  function r(s) {
    s.traverse(f => {
      let m = f;
      m.geometry && n.add(m.geometry);
      let p = m.material;
      if (p) for (let y of Array.isArray(p) ? p : [p]) {
        n.add(y);
        for (let E of Object.values(y)) E?.isTexture && n.add(E);
      }
    });
  }
  async function l(s, f) {
    let m = await a.loadAsync(f);
    m.colorSpace = je, m.anisotropy = 4, t.textures.set(s, m), n.add(m);
  }
  async function d(s, f) {
    let m = await Ee(i, f);
    t.models.set(s, {
      scene: m.scene,
      animations: m.animations
    }), r(m.scene);
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
    texture: s => u(t.textures, s, "texture"),
    model(s) {
      let f = u(t.models, s, "model");
      return $e(f.scene);
    },
    animations: s => u(t.models, s, "model").animations,
    sound: s => u(t.audio, s, "sound"),
    json: s => u(t.json, s, "json"),
    async load(s, f) {
      let m = [];
      for (let [E, k] of Object.entries(s.textures ?? {})) m.push(() => l(E, k));
      for (let [E, k] of Object.entries(s.models ?? {})) m.push(() => d(E, k));
      for (let [E, k] of Object.entries(s.audio ?? {})) m.push(() => c(E, k));
      for (let [E, k] of Object.entries(s.json ?? {})) m.push(() => o(E, k));
      let p = m.length,
        y = 0;
      f?.(0, p), await Promise.all(m.map(async E => {
        await E(), y++, f?.(y, p);
      }));
    },
    owned: n
  };
}
function ee(e) {
  let t = null,
    n = null,
    a = .6,
    i = 1,
    u = !1;
  function r() {
    if (t) return t;
    let d = window.AudioContext ?? window.webkitAudioContext;
    if (!d) throw new Error("Web Audio is unavailable in this runtime");
    let c = new d(),
      o = c.createGain(),
      s = c.createGain(),
      f = c.createGain();
    return o.gain.value = u ? 0 : 1, s.gain.value = a, f.gain.value = i, s.connect(o), f.connect(o), o.connect(c.destination), t = {
      context: c,
      master: o,
      music: s,
      sfx: f
    }, t;
  }
  let l = () => {
    t && (document.visibilityState === "hidden" ? t.context.suspend() : u || t.context.resume());
  };
  return document.addEventListener("visibilitychange", l), {
    async unlock() {
      let {
        context: d
      } = r();
      d.state !== "running" && (await d.resume());
    },
    decode(d) {
      return r().context.decodeAudioData(d);
    },
    playSfx(d, c = {}) {
      let o = e.sound(d);
      if (!o || u) return;
      let {
        context: s,
        sfx: f
      } = r();
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
      } = r();
      this.stopMusic(0);
      let m = s.createBufferSource();
      m.buffer = o, m.loop = c.loop ?? !0, m.connect(f);
      let p = c.volume ?? a,
        y = c.fadeIn ?? 0;
      y > 0 ? (f.gain.cancelScheduledValues(s.currentTime), f.gain.setValueAtTime(0, s.currentTime), f.gain.linearRampToValueAtTime(p, s.currentTime + y)) : f.gain.value = p, m.start(), n = m;
    },
    stopMusic(d = 0) {
      let c = n;
      if (!c || !t) return;
      if (n = null, d <= 0) {
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
      return u;
    },
    setMuted(d) {
      if (u = d, !t) return;
      let {
        context: c,
        master: o
      } = t;
      o.gain.cancelScheduledValues(c.currentTime), o.gain.setValueAtTime(o.gain.value, c.currentTime), o.gain.linearRampToValueAtTime(d ? 0 : 1, c.currentTime + .05);
    },
    dispose() {
      document.removeEventListener("visibilitychange", l), this.stopMusic(0), t?.context.close(), t = null;
    }
  };
}
import { MathUtils as z, OrthographicCamera as Me, PerspectiveCamera as Ae, Sphere as Be, Vector3 as O } from "./002-three.js";
function ke(e, t) {
  let n = e.fov ?? t.fov,
    a = e.position ?? t.position,
    i = e.lookAt ?? t.lookAt,
    u = new Ae(n, 1, e.near ?? .1, e.far ?? 300);
  u.position.copy(a), u.lookAt(i);
  let r = Math.max(a.distanceTo(i), .001),
    l = 2 * r * Math.tan(z.degToRad(n) / 2);
  return {
    camera: u,
    resize(d) {
      u.aspect = d.aspect;
      let c = l * d.scale.y;
      u.fov = z.radToDeg(2 * Math.atan(c / (2 * r))), u.updateProjectionMatrix();
    },
    update() {}
  };
}
function te(e = {}) {
  return ke(e, {
    fov: 50,
    position: new O(0, 6, 14),
    lookAt: new O(0, 1.5, 0)
  });
}
function Ve(e = {}) {
  return ke(e, {
    fov: 40,
    position: new O(0, 5, 18),
    lookAt: new O(0, 1, 0)
  });
}
function Ye(e = {}) {
  let t = e.frustumHeight ?? 14,
    n = e.heading ?? 0,
    a = e.pitch ?? .22,
    i = e.distance ?? 40,
    u = e.lookAt ?? new O(),
    r = new Me(-1, 1, 1, -1, e.near ?? .1, e.far ?? 200);
  return r.position.set(Math.sin(n) * Math.cos(a), Math.sin(a), Math.cos(n) * Math.cos(a)).multiplyScalar(i).add(u), r.lookAt(u), {
    camera: r,
    resize(l) {
      let d = t * l.scale.y,
        c = d * l.aspect;
      r.top = d / 2, r.bottom = -d / 2, r.right = c / 2, r.left = -c / 2, r.updateProjectionMatrix();
    },
    update() {}
  };
}
function Xe(e, t = {}) {
  let n = t.offset ?? new O(0, 9, 12),
    a = t.lookOffset ?? new O(0, 1, 0),
    i = t.smoothing ?? .18,
    u = t.fov ?? 50,
    r = new Ae(u, 1, t.near ?? .1, t.far ?? 300),
    l = e.position.clone(),
    d = new O(),
    c = new O(),
    o = Math.max(n.length(), .001),
    s = 2 * o * Math.tan(z.degToRad(u) / 2);
  return l.copy(e.position), t.bounds && t.bounds.clampPoint(l, l), r.position.copy(l).add(n), r.lookAt(c.copy(l).add(a)), {
    camera: r,
    resize(f) {
      r.aspect = f.aspect, r.fov = z.radToDeg(2 * Math.atan(s * f.scale.y / (2 * o))), r.updateProjectionMatrix();
    },
    update(f) {
      d.copy(e.position), t.bounds && t.bounds.clampPoint(d, d);
      let m = i > 0 ? 1 - Math.exp(-f / i) : 1;
      l.lerp(d, Math.min(m, 1)), r.position.copy(l).add(n), r.lookAt(c.copy(l).add(a));
    }
  };
}
function He(e, t, n, a = {}) {
  let i = a.padding ?? 1.1,
    u = t.getBoundingSphere(new Be()),
    r = a.lookAt ?? u.center,
    l = Math.max(u.radius * i, .001);
  if (e instanceof Me) {
    let f = (e.top - e.bottom) / 2,
      m = (e.right - e.left) / 2;
    e.zoom = Math.min(f / l, m / l), e.updateProjectionMatrix(), e.lookAt(r);
    return;
  }
  let d = z.degToRad(e.fov),
    c = 2 * Math.atan(Math.tan(d / 2) * n.aspect),
    o = Math.max(l / Math.sin(d / 2), l / Math.sin(c / 2)),
    s = e.position.clone().sub(r);
  s.lengthSq() < 1e-8 && s.set(0, .4, 1), e.position.copy(r).addScaledVector(s.normalize(), o), e.lookAt(r);
}
var re = `
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
var Re = "rx-hud-style",
  ne = "data-rx-run";
function oe(e, t) {
  if (!document.getElementById(Re)) {
    let c = document.createElement("style");
    c.id = Re, c.textContent = re, document.head.append(c);
  }
  let n = document.createElement("div");
  n.className = "rx-hud", e.append(n);
  let a = new Map(),
    i = !1;
  function u(c) {
    return i && c.setAttribute(ne, ""), c;
  }
  function r() {
    let {
      safeArea: c,
      hudScale: o
    } = t;
    n.style.setProperty("--rx-safe-top", `${c.top}px`), n.style.setProperty("--rx-safe-right", `${c.right}px`), n.style.setProperty("--rx-safe-bottom", `${c.bottom}px`), n.style.setProperty("--rx-safe-left", `${c.left}px`), n.style.setProperty("--rx-hud-scale", o.toFixed(4));
  }
  r();
  let l = t.on("resize", r);
  function d(c, o = {}) {
    let s = a.get(c);
    if (s) return o.interactive && (s.dataset.interactive = "true"), s;
    let f = u(document.createElement("div"));
    return f.className = "rx-hud-layer", f.dataset.anchor = c, f.style.gridArea = c, o.interactive && (f.dataset.interactive = "true"), n.append(f), a.set(c, f), f;
  }
  return {
    root: n,
    layer: d,
    score(c = {}) {
      let o = c.format ?? (f => String(Math.floor(f))),
        s = u(document.createElement("div"));
      return s.className = "rx-hud-score", s.textContent = o(0), d(c.anchor ?? "top").append(s), {
        el: s,
        set(f) {
          let m = o(f);
          s.textContent !== m && (s.textContent = m);
        }
      };
    },
    chip(c, o = {}) {
      let s = u(document.createElement("div"));
      return s.className = "rx-hud-chip", s.textContent = c, d(o.anchor ?? "top-left").append(s), {
        el: s,
        set(f) {
          s.textContent !== f && (s.textContent = f);
        }
      };
    },
    button(c, o, s = {}) {
      let f = u(document.createElement("button"));
      return f.type = "button", f.className = "rx-hud-button", f.dataset.variant = s.variant ?? "default", f.textContent = c, f.addEventListener("pointerup", m => {
        m.preventDefault(), m.stopPropagation(), o();
      }), d(s.anchor ?? "bottom", {
        interactive: !0
      }).append(f), f;
    },
    banner(c, o) {
      let s = u(document.createElement("div"));
      s.className = "rx-hud-banner";
      let f = document.createElement("div");
      if (f.className = "rx-hud-banner-title", f.textContent = c, s.append(f), o) {
        let m = document.createElement("div");
        m.className = "rx-hud-banner-subtitle", m.textContent = o, s.append(m);
      }
      return n.append(s), {
        el: s,
        dismiss: () => s.remove()
      };
    },
    sealSetup() {
      i = !0;
    },
    resetRun() {
      for (let c of Array.from(n.querySelectorAll(`[${ne}]`))) c.remove();
      for (let [c, o] of a) o.hasAttribute(ne) && a.delete(c);
    },
    clear() {
      n.replaceChildren(), a.clear();
    },
    dispose() {
      l(), n.remove(), a.clear();
    }
  };
}
import { Raycaster as Ke, Vector2 as H, Vector3 as Ze } from "./002-three.js";
var X = {
  tapMaxMs: 250,
  tapMaxTravel: 12,
  dragMinTravel: 8,
  swipeMinTravel: 60,
  swipeMinSpeed: 200
};
function U() {
  return {
    pointers: [],
    pinchStart: null,
    pinchLast: null
  };
}
function qe(e, t) {
  return Math.hypot(e.x - t.x, e.y - t.y);
}
function We(e, t) {
  return Math.abs(e) >= Math.abs(t) ? e >= 0 ? "right" : "left" : t >= 0 ? "down" : "up";
}
function ae(e, t, n = X) {
  let a = e.pointers.map(o => ({
      ...o
    })),
    i = [],
    u = a.findIndex(o => o.id === t.id);
  if (t.phase === "down") u >= 0 && a.splice(u, 1), a.push({
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
  });else if (u >= 0) {
    let o = a[u],
      s = t.x - o.x,
      f = t.y - o.y;
    o.x = t.x, o.y = t.y, o.dx = s, o.dy = f, o.travel += Math.hypot(s, f), o.duration = t.time - o.startTime;
    let m = Math.hypot(o.x - o.startX, o.y - o.startY);
    if (t.phase === "move") !o.dragging && m > n.dragMinTravel && (o.dragging = !0), o.dragging && i.push({
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
      t.phase === "up" && m > n.dragMinTravel && (s !== 0 || f !== 0) && i.push({
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
      }), a.splice(u, 1);
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
        m >= n.swipeMinTravel && y >= n.swipeMinSpeed ? i.push({
          type: "swipe",
          data: {
            pointerId: o.id,
            x: o.x,
            y: o.y,
            dx: o.x - o.startX,
            dy: o.y - o.startY,
            direction: We(o.x - o.startX, o.y - o.startY),
            speed: y
          }
        }) : o.duration <= n.tapMaxMs && o.travel <= n.tapMaxTravel && i.push({
          type: "tap",
          data: p
        });
      }
    }
  }
  let r = e.pinchStart,
    l = e.pinchLast,
    [d, c] = a;
  if (d && c && a.length === 2) {
    let o = qe(d, c);
    r === null || l === null ? (r = o, l = o) : t.phase === "move" && (i.push({
      type: "pinch",
      data: {
        scale: r > 0 ? o / r : 1,
        delta: l > 0 ? o / l : 1,
        distance: o,
        centerX: (d.x + c.x) / 2,
        centerY: (d.y + c.y) / 2
      }
    }), l = o);
  } else r = null, l = null;
  return {
    state: {
      pointers: a,
      pinchStart: r,
      pinchLast: l
    },
    events: i
  };
}
var Je = 5e3;
function Pe(e, t, n, a, i = {}) {
  let u = i.thresholds ? {
      ...X,
      ...i.thresholds
    } : void 0,
    r = new Map(),
    l = new Ke(),
    d = new H(),
    c = new H(),
    o = new H(),
    s = new H(),
    f = U(),
    m = !0,
    p = !1,
    y = Number.NEGATIVE_INFINITY,
    E = !1,
    k = () => typeof performance < "u" ? performance.now() : Date.now(),
    x = i.document !== void 0 ? i.document : typeof document > "u" ? null : document;
  e.style.touchAction = "none", e.tabIndex = -1, e.style.outline = "none";
  function w(h, M) {
    let b = r.get(h);
    if (b) for (let C of [...b]) C(M);
  }
  function S(h) {
    let M = ae(f, h, u);
    f = M.state;
    for (let b of M.events) w(b.type, b.data);
  }
  let g = () => x !== null && x.pointerLockElement === e,
    P = () => g() || p,
    A = "",
    I = () => {
      let h = P();
      h !== E && (E = h, w("lock", {
        locked: h
      }));
    },
    _ = () => {
      p || g() || (p = !0, A = e.style.cursor ?? "", e.style.cursor = "none", I());
    },
    Y = () => {
      p && (p = !1, e.style.cursor = A, I());
    },
    G = () => {
      let h = e.requestPointerLock;
      return x === null || typeof h != "function" ? Promise.resolve(!1) : g() ? Promise.resolve(!0) : new Promise(M => {
        let b = be => {
            x.removeEventListener("pointerlockchange", C), x.removeEventListener("pointerlockerror", we), M(be);
          },
          C = () => b(g()),
          we = () => b(!1);
        x.addEventListener("pointerlockchange", C), x.addEventListener("pointerlockerror", we);
        try {
          h.call(e)?.catch?.(() => b(!1));
        } catch {
          b(!1);
        }
      });
    };
  function K(h) {
    let M = h.movementX || 0,
      b = h.movementY || 0;
    M === 0 && b === 0 || (t.toDesign(0, 0, o), t.toDesign(1, 1, s), w("look", {
      dx: M * (s.x - o.x),
      dy: b * (s.y - o.y)
    }));
  }
  function D(h, M) {
    return t.toDesign(h.clientX, h.clientY, c), {
      id: h.pointerId,
      x: c.x,
      y: c.y,
      time: h.timeStamp,
      phase: M
    };
  }
  function j(h) {
    try {
      e.setPointerCapture?.(h);
    } catch {}
  }
  function Z(h) {
    try {
      e.releasePointerCapture?.(h);
    } catch {}
  }
  let v = h => {
      m && (h.preventDefault(), e.focus?.({
        preventScroll: !0
      }), y = k(), p && !g() && G(), j(h.pointerId), S(D(h, "down")));
    },
    T = h => {
      if (m) {
        if (P()) {
          K(h);
          return;
        }
        S(D(h, "move"));
      }
    },
    L = () => {
      g() && p && (p = !1, e.style.cursor = A), I();
    },
    F = h => {
      h?.key === "Escape" && Y();
    },
    N = h => {
      m && (Z(h.pointerId), S(D(h, "up")));
    },
    ge = h => {
      m && S(D(h, "cancel"));
    };
  e.addEventListener("pointerdown", v), e.addEventListener("pointermove", T), e.addEventListener("pointerup", N), e.addEventListener("pointercancel", ge), x?.addEventListener("pointerlockchange", L), x?.addEventListener("keydown", F);
  function xe(h) {
    return h ?? f.pointers[0] ?? null;
  }
  function ye(h) {
    t.designToNdc(h.x, h.y, d), l.setFromCamera(d, n.camera);
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
      m = h, h || (f = U());
    },
    on(h, M) {
      let b = r.get(h);
      b || (b = new Set(), r.set(h, b));
      let C = M;
      return b.add(C), () => {
        b?.delete(C);
      };
    },
    pick(h, M) {
      let b = xe(M);
      return b ? (ye(b), h ? l.intersectObjects(h, !0) : l.intersectObjects(a.children, !0)) : [];
    },
    pickPlane(h, M, b) {
      let C = xe(b);
      return C ? (ye(C), l.ray.intersectPlane(h, M ?? new Ze())) : null;
    },
    lockPointer() {
      if (P()) return Promise.resolve(!0);
      if (x === null) return Promise.resolve(!1);
      let h = k() - y <= Je;
      return G().then(M => M ? !0 : h ? (_(), !0) : !1);
    },
    unlockPointer() {
      g() ? x?.exitPointerLock?.() : Y();
    },
    dispose() {
      e.removeEventListener("pointerdown", v), e.removeEventListener("pointermove", T), e.removeEventListener("pointerup", N), e.removeEventListener("pointercancel", ge), x?.removeEventListener("pointerlockchange", L), x?.removeEventListener("keydown", F), p && (p = !1, e.style.cursor = A), r.clear(), f = U();
    }
  };
}
var Qe = .25;
function ie(e, t, n, a) {
  if (!(n > 0)) throw new Error(`stepClock: step must be > 0, got ${n}`);
  let i = e + Math.min(Math.max(t, 0), .25),
    u = Math.min(Math.floor(i / n), Math.max(0, Math.floor(a))),
    r = i % n;
  return {
    steps: u,
    alpha: r / n,
    accumulator: r
  };
}
var er = 10080 * 60 * 1e3;
function Te(e = Date.now()) {
  let t = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${e}:${t}`;
}
var $ = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};
function R(e) {
  try {
    return e()?.catch(() => null) ?? Promise.resolve(null);
  } catch {
    return Promise.resolve(null);
  }
}
function se(e, t) {
  return e.add(t), () => {
    e.delete(t);
  };
}
function createLocalLifecycle() {
  let over = false;
  const safe = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    info = {
      contentSafeAreaInset: safe
    };
  return {
    get isOver() {
      return over;
    },
    ready: async () => info,
    gameOver() {
      over = true;
    },
    rearm() {
      over = false;
    },
    onPlayAgain() {
      return () => {};
    },
    onToggleMute() {
      return () => {};
    },
    onGameInfo(cb) {
      cb(info);
      return () => {};
    },
    reportError(error) {
      console.error(error);
    }
  };
}
var Oe = new Set();
function et(e) {
  return typeof e == "object" && e !== null && e.isTexture === !0;
}
function Ce(e, t, n) {
  if (!(t.has(e) || n.has(e))) {
    n.add(e);
    for (let a of Object.values(e)) !et(a) || t.has(a) || n.has(a) || (n.add(a), a.dispose());
    e.dispose();
  }
}
function tt(e, t, n) {
  t.has(e) || n.has(e) || (n.add(e), e.dispose());
}
function q(e, t = {}) {
  let n = t.skip ?? Oe,
    a = new Set();
  e.traverse(i => {
    let u = i;
    u.geometry && tt(u.geometry, n, a);
    let r = u.material;
    if (r) if (Array.isArray(r)) for (let l of r) Ce(l, n, a);else Ce(r, n, a);
  });
}
function _e(e, t = {}) {
  e.removeFromParent(), q(e, t);
}
var B = class {
  items = [];
  skip = Oe;
  constructor(t) {
    t && (this.skip = t);
  }
  add(t) {
    return this.items.push(t), t;
  }
  forget(t) {
    let n = this.items.indexOf(t);
    n >= 0 && this.items.splice(n, 1);
  }
  get size() {
    return this.items.length;
  }
  dispose() {
    for (let t = this.items.length - 1; t >= 0; t--) {
      let n = this.items[t];
      this.skip.has(n) || (rt(n) ? _e(n, {
        skip: this.skip
      }) : nt(n) && n.dispose());
    }
    this.items.length = 0;
  }
};
function rt(e) {
  return typeof e == "object" && e !== null && e.isObject3D === !0;
}
function nt(e) {
  return typeof e?.dispose == "function";
}
import { Vector2 as ue } from "./002-three.js";
var Fe = {
    width: 720,
    height: 1080
  },
  ot = {
    width: 1280,
    height: 720
  },
  at = 393 / 720;
function de(e, t, n) {
  let a = e.width / e.height,
    i = t > a,
    u = n === "crop" ? i ? 1 : t / a : i ? t / a : 1,
    r = n === "crop" ? i ? a / t : 1 : i ? 1 : a / t;
  return {
    scaleX: u,
    scaleY: r,
    overscanX: (e.width * u - e.width) / 2,
    overscanY: (e.height * r - e.height) / 2
  };
}
function fe(e, t, n, a, i) {
  let u = e.width * t.scaleX,
    r = e.height * t.scaleY,
    l = (e.width - u) / 2,
    d = (e.height - r) / 2,
    c = n > 0 ? u / n : 0,
    o = a > 0 ? r / a : 0,
    s = Math.max(l + i.left * c, 0),
    f = Math.min(l + u - i.right * c, e.width),
    m = Math.max(d + i.top * o, 0),
    p = Math.min(d + r - i.bottom * o, e.height);
  return {
    x: s,
    y: m,
    width: Math.max(f - s, 0),
    height: Math.max(p - m, 0)
  };
}
function me(e, t = {}) {
  let n = t.design ?? Fe,
    a = t.fit ?? "expand",
    i = t.maxPixelRatio ?? 2,
    u = t.host ?? e.parentElement,
    r = new Set(),
    l = $,
    d = 1,
    c = 1,
    o = de(n, 1, a),
    s = fe(n, o, 1, 1, l),
    f = 1,
    m = Math.min(De(), i);
  function p() {
    let w = u?.getBoundingClientRect();
    d = Math.max(Math.round(w?.width ?? window.innerWidth), 1), c = Math.max(Math.round(w?.height ?? window.innerHeight), 1), o = de(n, d / c, a), s = fe(n, o, d, c, l), f = d / (n.width * o.scaleX) / at;
  }
  function y() {
    for (let w of [...r]) w(k);
  }
  function E(w, S) {
    let g = e.getBoundingClientRect();
    return {
      fx: g.width > 0 ? (w - g.left) / g.width : 0,
      fy: g.height > 0 ? (S - g.top) / g.height : 0
    };
  }
  let k = {
      design: n,
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
        return l;
      },
      get safeRect() {
        return s;
      },
      get hudScale() {
        return f;
      },
      toDesign(w, S, g = new ue()) {
        let {
            fx: P,
            fy: A
          } = E(w, S),
          I = n.width * o.scaleX,
          _ = n.height * o.scaleY;
        return g.set((n.width - I) / 2 + P * I, (n.height - _) / 2 + A * _);
      },
      toNdc(w, S, g = new ue()) {
        let {
          fx: P,
          fy: A
        } = E(w, S);
        return g.set(P * 2 - 1, -(A * 2 - 1));
      },
      designToNdc(w, S, g = new ue()) {
        let P = n.width * o.scaleX,
          A = n.height * o.scaleY,
          I = (w - (n.width - P) / 2) / P,
          _ = (S - (n.height - A) / 2) / A;
        return g.set(I * 2 - 1, -(_ * 2 - 1));
      },
      on(w, S) {
        return r.add(S), () => {
          r.delete(S);
        };
      },
      setSafeArea(w) {
        l = w, p(), y();
      },
      setPixelRatio(w) {
        m = Math.max(Math.min(w, i), 1), y();
      },
      refresh() {
        p(), y();
      },
      dispose() {
        r.clear(), window.removeEventListener("resize", x), window.removeEventListener("orientationchange", x), window.visualViewport?.removeEventListener("resize", x);
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
var ut = 60;
async function dt(e) {
  let t = e.container ?? document.body,
    n = e.fixedStep ?? 1 / 60,
    a = e.maxStepsPerFrame ?? 5;
  ft(t);
  let i = document.createElement("canvas");
  i.style.display = "block", i.style.width = "100%", i.style.height = "100%", t.append(i);
  let u = me(i, {
      design: e.design,
      fit: e.fit,
      maxPixelRatio: e.maxPixelRatio ?? 2,
      host: t
    }),
    r = new lt({
      canvas: i,
      antialias: u.pixelRatio < 2,
      stencil: !1,
      powerPreference: "high-performance",
      alpha: !1
    });
  r.outputColorSpace = st, r.toneMapping = it, r.toneMappingExposure = 1;
  let l = new ct();
  e.background !== null && (l.background = e.background === void 0 ? new Ne(396047) : typeof e.background == "object" ? e.background : new Ne(e.background));
  let d = e.camera ?? te(),
    c = ee({
      sound: v => o.sound(v)
    }),
    o = Q({
      decodeAudio: v => c.decode(v)
    }),
    s = oe(t, u),
    f = Pe(i, u, d, l),
    p = createLocalLifecycle();
  function y() {
    r.setPixelRatio(u.pixelRatio), r.setSize(u.width, u.height, !1), d.resize(u);
  }
  let E = u.on("resize", y);
  y();
  let k = new B(o.owned),
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
      renderer: r,
      scene: l,
      rig: d,
      get camera() {
        return d.camera;
      },
      viewport: u,
      input: f,
      assets: o,
      audio: c,
      hud: s,
      platform: p,
      transient: k,
      time: x,
      get running() {
        return g;
      },
      gameOver(v, T) {
        p.gameOver(v, T), g = !1;
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
        P || (P = !0, r.setAnimationLoop(null), E(), I(), _(), Y(), document.removeEventListener("visibilitychange", G), k.dispose(), f.dispose(), s.dispose(), c.dispose(), u.dispose(), r.dispose(), i.remove());
      }
    };
  f.on("press", () => {
    c.unlock();
  });
  let I = p.onPlayAgain(v => A.restart(v)),
    _ = p.onToggleMute(v => c.setMuted(v)),
    Y = p.onGameInfo(v => u.setSafeArea(v.contentSafeAreaInset)),
    G = () => {
      document.visibilityState === "hidden" ? g = !1 : (S = performance.now(), g = !0);
    };
  document.addEventListener("visibilitychange", G), e.assets && (await o.load(e.assets, e.onProgress));
  let K = await p.ready();
  u.setSafeArea(K.contentSafeAreaInset), await e.setup(A), s.sealSetup(), S = performance.now(), g = !0;
  let D = !1,
    j = !1,
    Z = () => {
      let v = d.camera,
        T = v.position,
        L = v.quaternion;
      if (!(Number.isFinite(T.x + T.y + T.z) && Number.isFinite(L.x + L.y + L.z + L.w))) {
        D || (D = !0, console.error("[remix] the camera position or rotation is NaN \u2014 nothing renders. A camera helper was called with the wrong arguments, or a lerp/lookAt read undefined. Fix the call in game-main.ts or the camera system before anything else."));
        return;
      }
      if (D = !1, r.info.render.triangles + r.info.render.points + r.info.render.lines === 0) {
        j || (j = !0, console.error("[remix] the renderer drew nothing this frame \u2014 the scene is empty, everything is outside the camera frustum, or the camera sits inside geometry. Check that the world is added to game.scene and that the camera is placed where it can see it."));
        return;
      }
      j = !1;
    };
  return r.setAnimationLoop(v => {
    let T = Math.max((v - S) / 1e3, 0);
    S = v, x.delta = T;
    let L = 1;
    if (g) {
      let F = ie(w, T, n, a);
      w = F.accumulator, L = F.alpha;
      for (let N = 0; N < F.steps; N++) x.elapsed += n, e.update?.(A, n);
    }
    d.update(T), e.render?.(A, T, L), r.render(l, d.camera), x.frame++, x.frame % ut === 0 && Z();
  }), A;
}
function ft(e) {
  if (document.documentElement.style.setProperty("height", "100%"), document.body.style.margin = "0", document.body.style.height = "100%", document.body.style.overflow = "hidden", document.body.style.overscrollBehavior = "none", document.body.style.userSelect = "none", document.body.style.setProperty("-webkit-tap-highlight-color", "transparent"), e === document.body) {
    e.style.position = "relative";
    return;
  }
  e.style.position = "relative", e.style.width = "100%", e.style.height = "100%";
}
function mt(e, t = {}) {
  let n = t.rng ?? Math.random,
    a = [];
  for (let r of e) {
    if (!Number.isInteger(r.count) || r.count <= 0) throw new Error(`createShuffleBag: count must be a positive integer, got ${r.count}`);
    for (let l = 0; l < r.count; l++) a.push(r.value);
  }
  if (a.length === 0) throw new Error("createShuffleBag: entries must not be empty");
  let i = [],
    u = () => {
      i.length = 0, i.push(...a);
      for (let r = i.length - 1; r > 0; r--) {
        let l = Math.floor(n() * (r + 1)),
          d = i[r];
        i[r] = i[l], i[l] = d;
      }
    };
  return {
    draw() {
      return i.length === 0 && u(), i.pop();
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
function ht(e) {
  let {
      chance: t,
      guaranteedBy: n
    } = e,
    a = e.rng ?? Math.random;
  if (!(t >= 0 && t <= 1)) throw new Error(`createPityTimer: chance must be in 0..1, got ${t}`);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`createPityTimer: guaranteedBy must be a positive integer, got ${n}`);
  let i = 0;
  return {
    roll() {
      let u = i + 1 >= n || a() < t;
      return i = u ? 0 : i + 1, u;
    },
    get misses() {
      return i;
    },
    reset() {
      i = 0;
    }
  };
}
function pt(e) {
  let {
      start: t,
      step: n
    } = e,
    a = e.rng ?? Math.random;
  if (!(t >= 0 && t <= 1)) throw new Error(`createEscalatingChance: start must be in 0..1, got ${t}`);
  if (!(n > 0)) throw new Error(`createEscalatingChance: step must be > 0, got ${n}`);
  let i = t;
  return {
    roll() {
      let u = a() < i;
      return i = u ? t : Math.min(i + n, 1), u;
    },
    get chance() {
      return i;
    },
    reset() {
      i = t;
    }
  };
}
function gt(e) {
  let t = e >>> 0;
  return () => {
    t = t + 1831565813 >>> 0;
    let n = t;
    return n = Math.imul(n ^ n >>> 15, n | 1), n ^= n + Math.imul(n ^ n >>> 7, n | 61), ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}
var V = {
    linear: e => e,
    quadIn: e => e * e,
    quadOut: e => e * (2 - e),
    quadInOut: e => e < .5 ? 2 * e * e : 1 - 2 * (1 - e) * (1 - e),
    cubicOut: e => 1 + (e - 1) ** 3,
    backOut: e => 1 + 2.70158 * (e - 1) ** 3 + 1.70158 * (e - 1) ** 2,
    elasticOut: e => e === 0 || e === 1 ? e : 2 ** (-10 * e) * Math.sin((e * 10 - .75) * (2 * Math.PI / 3)) + 1
  },
  W = 1e-9,
  xt = e => {
    if (e === void 0) return V.quadOut;
    if (typeof e == "function") return e;
    let t = V[e];
    if (!t) throw new Error(`unknown easing '${String(e)}'`);
    return t;
  };
function yt() {
  let e = [];
  return {
    to(t, n, a) {
      if (!(a.duration >= 0)) throw new Error(`tween duration must be >= 0, got ${a.duration}`);
      let i = t,
        u = Object.keys(n),
        r = {
          target: i,
          keys: u,
          from: u.map(l => {
            let d = i[l];
            if (typeof d != "number") throw new Error(`tween target property '${l}' is not a number`);
            return d;
          }),
          to: u.map(l => n[l]),
          easing: xt(a.easing),
          duration: a.duration,
          yoyo: a.yoyo ?? !1,
          elapsed: 0,
          cancelled: !1,
          onUpdate: a.onUpdate,
          onComplete: a.onComplete
        };
      return e.push(r), {
        cancel() {
          r.cancelled = !0;
        },
        get done() {
          return r.cancelled || r.elapsed + W >= r.duration * (r.yoyo ? 2 : 1);
        }
      };
    },
    update(t) {
      if (e.length === 0) return;
      let n = [];
      for (let a of e) {
        if (a.cancelled) continue;
        a.elapsed += t;
        let i = a.duration * (a.yoyo ? 2 : 1),
          u = a.elapsed + W >= i;
        if (u) {
          let r = a.yoyo ? a.from : a.to;
          for (let l = 0; l < a.keys.length; l++) a.target[a.keys[l]] = r[l];
        } else {
          let r = a.elapsed / i,
            l = a.yoyo ? 1 - Math.abs(1 - 2 * r) : r,
            d = a.easing(l);
          for (let c = 0; c < a.keys.length; c++) {
            let o = a.from[c];
            a.target[a.keys[c]] = o + (a.to[c] - o) * d;
          }
        }
        a.onUpdate?.(), u && n.push(a);
      }
      if (n.length > 0 || e.some(a => a.cancelled)) {
        e = e.filter(a => !a.cancelled && !n.includes(a));
        for (let a of n) a.onComplete?.();
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
function wt(e, t = {}) {
  let n = t.maxOffset ?? .35,
    a = t.maxRoll ?? .04,
    i = t.decay ?? 1.5,
    u = t.rng ?? Math.random,
    r = 0,
    l = 0,
    d = 0,
    c = 0,
    o = () => {
      e.camera.rotateZ(-c), e.camera.translateY(-d), e.camera.translateX(-l), l = 0, d = 0, c = 0;
    };
  return {
    get camera() {
      return e.camera;
    },
    resize(s) {
      e.resize(s);
    },
    update(s) {
      o(), e.update(s), r = Math.max(r - i * s, 0);
      let f = r * r;
      f > 0 && (l = n * f * (u() * 2 - 1), d = n * f * (u() * 2 - 1), c = a * f * (u() * 2 - 1), e.camera.translateX(l), e.camera.translateY(d), e.camera.rotateZ(c));
    },
    shake(s) {
      r = Math.min(r + Math.max(s, 0), 1);
    },
    get trauma() {
      return r;
    }
  };
}
function bt() {
  let e = 0;
  return {
    trigger(t) {
      e = Math.max(e, t);
    },
    frozen(t) {
      return e <= W ? (e = 0, !1) : (e -= t, !0);
    },
    get active() {
      return e > W;
    }
  };
}
function vt(e) {
  if (!(e.over > 0)) throw new Error(`createRamp: over must be > 0, got ${e.over}`);
  let t = typeof e.curve == "function" ? e.curve : V[e.curve ?? "quadIn"];
  if (!t) throw new Error(`createRamp: unknown easing '${String(e.curve)}'`);
  return n => {
    let a = Math.min(Math.max(n / e.over, 0), 1);
    return e.from + (e.to - e.from) * t(a);
  };
}
function St(e) {
  if (!(e > 0)) throw new Error(`createGraceWindow: seconds must be > 0, got ${e}`);
  let t = 0;
  return {
    refresh() {
      t = e;
    },
    update(n) {
      t = Math.max(t - n, 0);
    },
    get active() {
      return t > 0;
    },
    consume() {
      let n = t > 0;
      return t = 0, n;
    }
  };
}
function Et(e) {
  if (!(e > 0)) throw new Error(`createInputBuffer: seconds must be > 0, got ${e}`);
  let t = 0;
  return {
    press() {
      t = e;
    },
    update(n) {
      t = Math.max(t - n, 0);
    },
    consume() {
      let n = t > 0;
      return t = 0, n;
    },
    get pending() {
      return t > 0;
    }
  };
}
var he = class {
  items = [];
  idle = [];
  live = [];
  capacity;
  parent;
  reset;
  constructor(t, n = {}) {
    this.capacity = Math.max(n.size ?? 32, 0), this.parent = n.parent, this.reset = n.reset;
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
    let n = this.live.indexOf(t);
    n < 0 || (this.live.splice(n, 1), t.visible = !1, this.reset?.(t), this.idle.push(t));
  }
  releaseAll() {
    for (let t of [...this.live]) this.release(t);
  }
  dispose() {
    this.releaseAll();
    for (let t of this.items) t.removeFromParent(), q(t);
    this.items.length = 0, this.idle.length = 0;
  }
};
import { CircleGeometry as Mt, Color as At, DirectionalLight as kt, Fog as Rt, HemisphereLight as Pt, Mesh as Tt, MeshBasicMaterial as It, PCFSoftShadowMap as Lt, Vector3 as pe } from "./002-three.js";
var Ct = {
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
function Ot(e, t, n = {}) {
  let a = Ct[t];
  e.background = new At(a.background), e.fog = a.fog ? new Rt(a.fog[0], a.fog[1], a.fog[2]) : null;
  let i = new Pt(a.hemiSky, a.hemiGround, a.hemiIntensity),
    u = new kt(a.keyColor, a.keyIntensity);
  if (u.position.set(...a.keyPosition), e.add(i, u), n.shadows) {
    u.castShadow = !0, u.shadow.mapSize.set(1024, 1024), n.renderer && (n.renderer.shadowMap.enabled = !0, n.renderer.shadowMap.type = Lt);
    let r = n.shadowBounds;
    if (r) {
      let l = r.getSize(new pe()),
        d = Math.max(l.x, l.z) / 2 + 1,
        c = u.shadow.camera;
      c.left = -d, c.right = d, c.top = d, c.bottom = -d, c.near = .5, c.far = Math.max(l.y * 2 + d * 4, 50), c.updateProjectionMatrix(), u.target.position.copy(r.getCenter(new pe())), e.add(u.target);
    }
  }
  return {
    key: u,
    fill: i,
    dispose() {
      u.removeFromParent(), u.target.removeFromParent(), i.removeFromParent(), u.dispose(), i.dispose(), e.fog = null;
    }
  };
}
function _t(e, t = {}) {
  let n = t.radius ?? .72,
    a = t.groundY ?? 0,
    i = new Mt(n, 24),
    u = new It({
      color: 0,
      transparent: !0,
      opacity: t.opacity ?? .15,
      depthWrite: !1
    }),
    r = new Tt(i, u);
  r.rotation.x = -Math.PI / 2, r.renderOrder = -1;
  let l = new pe();
  return {
    mesh: r,
    update() {
      e.getWorldPosition(l), r.position.set(l.x, a + .01, l.z);
      let d = Math.max(l.y - a, 0),
        c = Math.max(1 - d / 8, .15);
      r.scale.setScalar(c), u.opacity = (t.opacity ?? .15) * c;
    },
    dispose() {
      r.removeFromParent(), i.dispose(), u.dispose();
    }
  };
}
function Dt(e) {
  return Object.freeze({
    ...e
  });
}
export { Fe as DEFAULT_DESIGN, X as DEFAULT_THRESHOLDS, B as DisposalScope, re as HUD_CSS, ot as LANDSCAPE_DESIGN, Qe as MAX_FRAME_DELTA, he as Pool, Ot as applyLighting, _t as blobShadow, Q as createAssets, ee as createAudio, pt as createEscalatingChance, dt as createGame, U as createGestureState, St as createGraceWindow, bt as createHitStop, oe as createHud, Et as createInputBuffer, ht as createPityTimer, vt as createRamp, mt as createShuffleBag, yt as createTweens, me as createViewport, Dt as defineAsset, _e as destroy, q as disposeObject, V as easings, He as fitBounds, de as fitFrustum, Xe as followRig, Ve as landscapeRig, Ye as orthoRig, te as portraitRig, ae as reduceGestures, fe as safeRectOf, gt as seededRandom, wt as shakeRig, ie as stepClock };