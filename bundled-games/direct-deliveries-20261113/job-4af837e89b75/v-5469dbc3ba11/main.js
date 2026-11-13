import * as re from "./vendor/001-three-0.185.js";
import { EffectComposer as mo } from "./vendor/003-EffectComposer.js";
import { RenderPass as fo } from "./vendor/005-RenderPass.js";
import { UnrealBloomPass as bo } from "./vendor/007-UnrealBloomPass.js";
import { OutputPass as go } from "./vendor/009-OutputPass.js";
var Is = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  nt = i => typeof i == "number" && Number.isFinite(i),
  Qi = i => nt(i) && i >= 0,
  Ki = i => {
    if (!i || typeof i != "object") return !1;
    let e = i;
    return [e.top, e.right, e.bottom, e.left].every(Qi);
  };
function zs(i) {
  if (!i || typeof i != "object") return !1;
  let e = i;
  return !!e.viewport && nt(e.viewport.width) && e.viewport.width > 0 && nt(e.viewport.height) && e.viewport.height > 0 && Ki(e.safeAreaInset) && Array.isArray(e.exclusions) && e.exclusions.length <= 100 && e.exclusions.every(t => !!t && typeof t.id == "string" && (t.kind === "control" || t.kind === "cutout") && [t.x, t.y, t.width, t.height].every(Qi));
}
function Fs(i, e) {
  let t = nt(e.width) && e.width > 0 ? e.width : 1,
    s = nt(e.height) && e.height > 0 ? e.height : 1,
    o = i?.contentLayout;
  if (!zs(o)) return {
    viewport: {
      width: t,
      height: s
    },
    safeAreaInset: Ki(i?.contentSafeAreaInset) ? {
      ...i.contentSafeAreaInset
    } : {
      ...Is
    },
    exclusions: []
  };
  let n = t / o.viewport.width,
    r = s / o.viewport.height;
  return {
    viewport: {
      width: t,
      height: s
    },
    safeAreaInset: {
      top: o.safeAreaInset.top * r,
      right: o.safeAreaInset.right * n,
      bottom: o.safeAreaInset.bottom * r,
      left: o.safeAreaInset.left * n
    },
    exclusions: o.exclusions.map(a => ({
      ...a,
      x: a.x * n,
      y: a.y * r,
      width: a.width * n,
      height: a.height * r
    }))
  };
}
function Vs(i, e) {
  if (![i.x, i.y, i.width, i.height].every(nt) || i.width <= 0 || i.height <= 0) return !1;
  let t = e.safeAreaInset;
  return i.x < t.left || i.y < t.top || i.x + i.width > e.viewport.width - t.right || i.y + i.height > e.viewport.height - t.bottom ? !1 : !e.exclusions.some(s => i.x < s.x + s.width && i.x + i.width > s.x && i.y < s.y + s.height && i.y + i.height > s.y);
}
var bi = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  Wi = {
    id: "local",
    name: "Player",
    purchasedItems: []
  },
  _i = {
    player: Wi,
    players: [Wi],
    viewContext: "full_screen",
    contentSafeAreaInset: bi,
    initialGameState: null
  },
  Bs = 5e3,
  Gs = ["pointerdown", "keydown", "touchend"],
  Rt = null,
  ri = null,
  Mt = null,
  Vt = !1,
  li = !1,
  ot = null,
  ci = new Set(),
  hi = new Set(),
  Ji = () => {
    for (let i of [...hi]) i(ne.contentLayout);
  },
  pi = new Set();
function ui(i) {
  Mt = i, Ji();
  let e = i.contentSafeAreaInset ?? bi;
  for (let t of ["top", "right", "bottom", "left"]) document.documentElement.style.setProperty(`--remix-safe-${t}`, `${e[t]}px`);
}
function Ds(i) {
  li = i, ot && (ot.output.gain.value = i ? 0 : 1);
  for (let e of [...pi]) e(i);
}
var Zi = Number.NEGATIVE_INFINITY,
  $e = null,
  ai = null,
  di = !1,
  Qe = !1,
  Yi = !1,
  gi = "",
  $i = !1,
  mi = new Set(),
  fi = new Set(),
  Bt = () => document.pointerLockElement !== null,
  Gt = () => Bt() || Qe,
  Ns = () => navigator.userActivation?.isActive === !0;
function yi() {
  let i = Gt();
  if (i !== Yi) {
    Yi = i;
    for (let e of [...mi]) e(i);
  }
}
function es() {
  Qe && (Qe = !1, $e && ($e.style.cursor = gi), yi());
}
function ts(i) {
  return document.pointerLockElement === i ? Promise.resolve(!0) : new Promise(e => {
    let t = n => {
        document.removeEventListener("pointerlockchange", s), document.removeEventListener("pointerlockerror", o), e(n);
      },
      s = () => t(document.pointerLockElement === i),
      o = () => t(!1);
    document.addEventListener("pointerlockchange", s), document.addEventListener("pointerlockerror", o);
    try {
      i.requestPointerLock()?.catch?.(() => t(!1));
    } catch {
      t(!1);
    }
  });
}
async function Us(i) {
  return $e = i, (await ts(i)) ? !0 : di ? (Qe = !0, gi = i.style.cursor, i.style.cursor = "none", yi(), !0) : !1;
}
function Ft() {
  $i || ($i = !0, document.addEventListener("pointerdown", () => {
    Zi = performance.now(), Qe && $e && !Bt() && ts($e);
  }, !0), document.addEventListener("pointermove", i => {
    if (!(!Gt() || i.movementX === 0 && i.movementY === 0)) for (let e of [...fi]) e(i.movementX, i.movementY);
  }), document.addEventListener("pointerlockchange", () => {
    Bt() && Qe && $e && (Qe = !1, $e.style.cursor = gi), yi();
  }), document.addEventListener("keydown", i => {
    i.key === "Escape" && es();
  }));
}
var ne = {
  ready() {
    Ft();
    window.addEventListener("resize", Ji);
    ui(_i);
    return Promise.resolve(_i);
  },
  get info() {
    return Mt;
  },
  get safeArea() {
    return Mt?.contentSafeAreaInset ?? bi;
  },
  get contentLayout() {
    return Fs(Mt, {
      width: window.innerWidth,
      height: window.innerHeight
    });
  },
  isUiRectSafe(i) {
    return Vs(i, ne.contentLayout);
  },
  onContentLayout(i) {
    return hi.add(i), Mt && i(ne.contentLayout), () => hi.delete(i);
  },
  beginRun() {
    Vt = !1;
  },
  get muted() {
    return li;
  },
  onMute(i) {
    return pi.add(i), () => pi.delete(i);
  },
  audio() {
    if (ot) return ot;
    let i = new AudioContext(),
      e = i.createGain();
    e.gain.value = li ? 0 : 1, e.connect(i.destination), ot = {
      context: i,
      output: e
    };
    let t = () => {
      i.state === "suspended" && !document.hidden && i.resume();
    };
    for (let s of Gs) window.addEventListener(s, t, !0);
    return document.addEventListener("visibilitychange", () => {
      document.hidden ? i.suspend() : t();
    }), ot;
  },
  async lockPointer(i) {
    return Ft(), Gt() ? !0 : (di ||= performance.now() - Zi <= Bs || Ns(), ai ??= Us(i).finally(() => {
      ai = null, di = !1;
    }), ai);
  },
  unlockPointer() {
    Bt() ? document.exitPointerLock() : es();
  },
  get pointerLocked() {
    return Gt();
  },
  onPointerLock(i) {
    return Ft(), mi.add(i), () => mi.delete(i);
  },
  onLook(i) {
    return Ft(), fi.add(i), () => fi.delete(i);
  }
};
function Pe(i) {
  return Object.freeze({
    ...i
  });
}
import * as Ne from "./vendor/001-three-0.185.js";
import * as de from "./vendor/001-three-0.185.js";
var ss = ["SUMMIT LAUNCH", "THE WALL", "THE DROP", "THE GLASS RUN", "THE SPLIT", "THE SURGE", "THE GAP", "THE SPIRAL", "PARADISE FALLS", "THE PARADISE PLUNGE"],
  Ot = [[[55, 0.08, 0, 6.2, 0], [85, 0.27, 180, 5.2, 0.12], [60, 0.3, -140, 4.8, -0.16]], [[115, 0.22, 72, 5.8, 0.28], [85, 0.12, 0, 4.1, -0.12], [130, 0.3, -64, 6.4, -0.3], [90, 0.12, 125, 4.2, 0.2], [130, 0.25, 58, 6.8, 0.38], [80, 0.08, 0, 4.3, 0], [145, 0.28, -70, 5.8, -0.32], [105, 0.19, 110, 4.5, 0.08]], [[80, 0.36, 0, 4.5, 0], [160, 1.15, 0, 4.1, 0], [100, 0.55, -160, 6.2, -0.35], [90, 0.2, 95, 5.2, -0.18], [90, 0.18, -105, 4.4, -0.3]], [[115, 0.25, 105, 5.4, 0.38], [80, 0.32, -90, 3.9, -0.42], [115, 0.18, 115, 5.8, 0.24], [100, 0.34, -95, 4, -0.4], [110, 0.2, 140, 5.3, 0.2]], [[140, 0.23, 210, 5.6, 0.12], [180, 0.14, -230, 5.2, -0.1], [160, 0.24, 200, 5.6, 0.12], [160, 0.18, -240, 5.4, -0.1]], [[45, 0.32, 0, 5.2, 0.24], [40, 0.32, 0, 3.9, -0.28], [45, 0.32, 0, 4.7, 0.18], [80, 0.27, 115, 5.7, 0.28], [80, 0.27, -100, 4.5, -0.28], [65, 0.13, 110, 4.2, 0.2], [65, 0.13, -115, 4.6, -0.22], [85, 0.32, 110, 5.8, 0.3], [85, 0.32, -105, 4.4, -0.24], [100, 0.12, -140, 4.3, -0.2], [90, 0.25, 0, 4.8, 0]], [[380, 0.18, 0, 4.9, 0], [90, 0.22, -160, 5.4, -0.2], [90, 0.23, 155, 5.2, 0.2]], [[100, 0.21, 130, 5.8, 0.18], [150, 0.27, 95, 5.1, 0.32], [45, 0.12, 145, 6.6, 0.28], [50, 0.12, 145, 4.5, -0.3], [45, 0.12, 145, 6.1, 0.22], [160, 0.3, 78, 5, 0.38], [40, 0.16, 120, 6.4, -0.22], [40, 0.16, 120, 4.8, 0.32], [40, 0.16, 120, 6.4, -0.18], [140, 0.3, 68, 5.2, 0.42], [50, 0.12, -115, 4.4, -0.25], [50, 0.12, 125, 4.8, 0.24], [90, 0.24, 0, 5, 0]], [[100, 0.27, -90, 5.2, -0.3], [100, 0.14, 110, 4, 0.08], [110, 0.3, -78, 5.4, -0.32], [35, 0.16, 105, 4.8, -0.24], [35, 0.16, 105, 3.9, 0.3], [30, 0.16, 105, 4.6, -0.2], [110, 0.32, -85, 5.2, -0.28], [100, 0.21, 130, 4.5, 0.22]], [[140, 0.38, 0, 4.3, 0], [210, 0.95, 0, 4.2, 0], [130, 0.48, 150, 6.6, 0.38], [120, 0.16, -145, 4.8, -0.3], [150, 0.55, -135, 6.4, -0.4], [110, 0.23, 155, 4.4, 0.2], [140, 0.4, 130, 6, 0.32], [50, 0.14, -115, 4.6, -0.26], [50, 0.14, 125, 5, 0.24], [55, 0.18, -130, 4.3, -0.24], [55, 0.18, 150, 5.2, 0.15], [100, -0.12, 0, 6, 0]]],
  De = Ot.map(i => i.reduce((e, t) => e + t[0], 0)),
  M = De.map((i, e) => De.slice(0, e).reduce((t, s) => t + s, 0)),
  D = De.reduce((i, e) => i + e, 0);
var vi = 1.38,
  He = de.MathUtils.clamp;
function Je(i) {
  let e = 9;
  for (; e > 0 && i < M[e];) e--;
  return e;
}
function os(i) {
  let e = Je(i);
  return He((i - M[e]) / De[e], 0, 1);
}
var Y = {
    rampStart: 105,
    lip: 175,
    land: 290,
    lift: 9
  },
  Oe = 2,
  Ei = Math.ceil((D + 8) / Oe) + 1,
  ns = [],
  rs = [],
  as = [],
  ls = [];
for (let i = 0; i < Ei; i++) {
  let e = i * Oe,
    t = Je(Math.min(e, D - 0.01)),
    s = e - M[t],
    o = Ot[t][Ot[t].length - 1];
  for (let n of Ot[t]) {
    if (s < n[0]) {
      o = n;
      break;
    }
    s -= n[0];
  }
  ns.push(o[2] ? 1 / o[2] : 0), rs.push(o[1]), as.push(o[3]), ls.push(o[4]);
}
function Nt(i, e) {
  let t = i.slice();
  for (let s = 0; s < 2; s++) {
    let o = t.slice();
    for (let n = 0; n < i.length; n++) {
      let r = 0,
        a = 0;
      for (let l = -e; l <= e; l++) {
        let u = He(n + l, 0, i.length - 1);
        r += o[u], a++;
      }
      t[n] = r / a;
    }
  }
  return t;
}
var wi = Nt(ns, 10),
  qs = Nt(rs, 14),
  Ws = Nt(as, 14),
  _s = Nt(ls, 16);
function Dt(i, e) {
  let t = He(e / Oe, 0, Ei - 1.001),
    s = Math.floor(t);
  return de.MathUtils.lerp(i[s], i[s + 1], t - s);
}
var Ke = [];
{
  let i = new de.Vector3(0, 1500, 0),
    e = 0;
  for (let t = 0; t < Ei; t++) Ke.push(i.clone()), e += wi[t] * Oe, i = i.clone().add(new de.Vector3(Math.sin(e) * Oe, -qs[t] * Oe, -Math.cos(e) * Oe));
}
function xi(i) {
  let e = He(i / Oe, 0, Ke.length - 1.001),
    t = Math.floor(e),
    s = e - t,
    o = Ke[Math.max(0, t - 1)],
    n = Ke[t],
    r = Ke[t + 1],
    a = Ke[Math.min(Ke.length - 1, t + 2)],
    l = (u, b, m, d) => b + 0.5 * s * (m - u + s * (2 * u - 5 * b + 4 * m - d + s * (3 * (b - m) + d - u)));
  return new de.Vector3(l(o.x, n.x, r.x, a.x), l(o.y, n.y, r.y, a.y), l(o.z, n.z, r.z, a.z));
}
function js(i, e) {
  let t = Je(i),
    s = os(i);
  return t === 4 ? e === 1 ? -125 * Math.sin(Math.PI * s) ** 2 : e === 2 ? 24 * Math.sin(Math.PI * s) ** 2 : 0 : t === 6 && e === 1 ? -95 * Math.sin(Math.PI * s) ** 2 : 0;
}
function St(i, e) {
  let t = xi(i),
    s = xi(i + 2).sub(xi(i - 2)).normalize(),
    o = new de.Vector3(-s.z, 0, s.x).normalize();
  if (t.addScaledVector(o, js(i, e)), Je(i) === 6 && e !== 1) {
    let n = i - M[6];
    if (n > Y.rampStart && n <= Y.lip) t.y += Y.lift * ((n - Y.rampStart) / (Y.lip - Y.rampStart)) ** 2;else if (n > Y.lip && n < Y.land) {
      let r = (n - Y.lip) / (Y.land - Y.lip),
        a = 2 * Y.lift / (Y.lip - Y.rampStart);
      t.y += Y.lift * (1 - r) ** 2 * (1 + 2 * r) + a * (Y.land - Y.lip) * r * (1 - r) ** 2;
    }
  }
  return t;
}
function C(i, e = 0) {
  i = He(i, 0, D);
  let t = St(i, e),
    s = St(Math.max(0, i - 1), e),
    n = St(Math.min(D, i + 1), e).clone().sub(s),
    r = n.length() / (i < 1 || i > D - 1 ? 1 : 2),
    a = n.normalize(),
    l = Dt(_s, i),
    u = new de.Vector3(-a.z, 0, a.x).normalize().applyAxisAngle(a, l),
    b = new de.Vector3().crossVectors(u, a).normalize(),
    m = St(Math.min(D, i + 6), e).sub(t).normalize(),
    d = t.clone().sub(St(Math.max(0, i - 6), e)).normalize(),
    g = m.sub(d).multiplyScalar(1 / 6),
    x = Je(i),
    w = os(i),
    y = x === 4 && e === 2,
    v = Math.sin(Math.PI * w) ** 2,
    k = x === 6 && e !== 1 ? de.MathUtils.smoothstep(i - M[6], Y.land - 25, Y.land) * (1 - de.MathUtils.smoothstep(i - M[6], Y.land + 65, Y.land + 110)) * 0.35 : 0,
    f = Dt(Ws, i) + (x === 4 ? e === 1 ? 2.4 : e === 2 ? -1.2 : 0 : x === 6 && e === 1 ? 1.5 : 0) * v - k,
    L = x === 1 || x === 7 || x === 8 || x === 9,
    O = y ? vi - 0.32 * v : k > 0 ? vi - k * 0.2 : L ? 1.06 + 0.22 * Math.sin((i - M[x]) * 0.012) ** 2 : vi,
    z = x === 4 && e === 1,
    G = i - M[6],
    Q = x === 6 && e !== 1 && G > Y.lip && G < Y.land;
  return {
    p: t,
    tangent: a,
    right: u,
    up: b,
    metric: r,
    curvature: g,
    radius: f,
    lip: O,
    closed: z,
    gap: Q,
    section: x,
    t: w,
    bank: l
  };
}
function me(i, e, t = 0, s = 0) {
  let o = C(i, t);
  return o.p.addScaledVector(o.right, (o.radius - s) * Math.sin(e)).addScaledVector(o.up, o.radius - (o.radius - s) * Math.cos(e));
}
function rt(i, e = 0) {
  let t = Je(i),
    s = Dt(wi, i + 80);
  if (t === 0) return 0.1 * Math.sin(i * 0.02);
  if (t === 4 && e === 1) return 0.3 * Math.sin(i * 0.03);
  if (t === 6 && e !== 1) return 0.06 * Math.sin(i * 0.035);
  let n = -Math.sign(s) * Math.min(0.95, Math.abs(s) * 80) + 0.23 * Math.sin(i * 0.033),
    r = t === 5 ? {
      start: M[5] + 160,
      len: 250
    } : t === 7 ? {
      start: M[7] + 250,
      len: 260
    } : t === 8 ? {
      start: M[8] + 240,
      len: 240
    } : null;
  if (r) {
    let a = i - r.start,
      l = He(a / 35, 0, 1) * He((r.len - a) / 35, 0, 1);
    return He(de.MathUtils.lerp(n, 0.98 * Math.sin((a + 45) * Math.PI / 72), l), -1.1, 1.1);
  }
  return He(n, -1.1, 1.1);
}
var Ti = [{
  s: M[1] + 450,
  len: 85,
  side: -1,
  power: 25
}, {
  s: M[2] + 390,
  len: 70,
  side: -1,
  power: 28
}, {
  s: M[3] + 165,
  len: 65,
  side: 1,
  power: 20
}, {
  s: M[3] + 350,
  len: 65,
  side: -1,
  power: 20
}, {
  s: M[5] + 210,
  len: 45,
  side: 1,
  power: 25
}, {
  s: M[5] + 275,
  len: 45,
  side: -1,
  power: 28
}, {
  s: M[5] + 340,
  len: 45,
  side: 1,
  power: 25
}, {
  s: M[5] + 550,
  len: 42,
  side: 1,
  power: 30
}, {
  s: M[5] + 605,
  len: 40,
  side: -1,
  power: 26
}, {
  s: M[7] + 270,
  len: 48,
  side: -1,
  power: 26
}, {
  s: M[7] + 335,
  len: 48,
  side: 1,
  power: 24
}, {
  s: M[7] + 400,
  len: 48,
  side: -1,
  power: 28
}, {
  s: M[7] + 640,
  len: 80,
  side: -1,
  power: 28
}, ...[1, 3, 5].map(i => ({
  s: M[8] + 50 + i * 85 - 40,
  len: 95,
  side: -(i % 2 ? 1 : -1),
  power: 31
})), {
  s: M[8] + 335,
  len: 45,
  side: 1,
  power: 27
}, {
  s: M[9] + 480,
  len: 85,
  side: 1,
  power: 28
}, {
  s: M[9] + 820,
  len: 42,
  side: -1,
  power: 30
}, {
  s: M[9] + 875,
  len: 42,
  side: 1,
  power: 26
}];
function Ri(i, e = 0) {
  if (e === 1) return 0;
  for (let t of Ti) {
    let s = (i - t.s) / t.len;
    if (s >= 0 && s <= 1) return t.side * t.power * Math.sin(Math.PI * s) ** 0.6;
  }
  return 0;
}
function Xe(i, e, t = 0, s = -1e9) {
  let o = Je(i),
    n = rt(i, t),
    r = Math.abs(e - n),
    a = Math.exp(-r * r / 0.09),
    l = o < 9 ? 14 - 6 * He(Math.abs(Dt(wi, i)) * 85, 0, 1) : 0,
    u = o < 9 && !(o === 6 && t !== 1) ? 10 * (1 - a) : 0,
    b = 43 + l + a * 32 + u;
  o === 0 && (b -= 6), o === 4 && (b += t === 2 ? 14 : t === 1 ? -8 : 0), o === 6 && (b += t === 2 ? 18 : t === 1 ? -6 : 0), o === 9 && (b += 17);
  let m = 0,
    d = 0;
  if (o === 5 && s > 0) {
    let g = i - s;
    d = Math.exp(-g * g / 500), g < -22 && g > -170 && (m = 1 - Math.max(0, (-g - 90) / 80)), b += d * 48;
  }
  return {
    fast: a,
    current: b,
    turbulence: m,
    surge: d,
    line: n,
    jet: Ri(i, t)
  };
}
var Z = C(D).p.clone(),
  is = C(D).tangent.clone().setY(0).normalize(),
  T = {
    center: Z.clone().addScaledVector(is, 100).setY(Z.y - 5),
    radius: 100,
    y: Z.y - 5,
    dir: is
  };
import * as at from "./vendor/001-three-0.185.js";
var Ht = [{
    id: "safe",
    label: "SAFE LANDING",
    bonus: 2500,
    x: 0,
    z: -32,
    width: 10,
    length: 30,
    color: 7327666
  }, {
    id: "precision",
    label: "PRECISION!",
    bonus: 7500,
    x: 8,
    z: -46,
    width: 5,
    length: 14,
    color: 7715583
  }, {
    id: "jackpot",
    label: "JACKPOT!",
    bonus: 15e3,
    x: -11,
    z: -22,
    width: 3.4,
    length: 7,
    color: 16762728
  }],
  Ys = new at.Vector3(-T.dir.z, 0, T.dir.x);
function Ut(i) {
  let e = i.clone().sub(T.center),
    t = e.dot(Ys),
    s = e.dot(T.dir);
  return [...Ht].reverse().find(o => Math.abs(t - o.x) <= o.width / 2 && Math.abs(s - o.z) <= o.length / 2);
}
function cs() {
  let i = document.createElement("canvas");
  i.width = 512, i.height = 768;
  let e = i.getContext("2d");
  e.textAlign = "center", e.textBaseline = "middle", Ht.forEach((s, o) => {
    let n = o * 256;
    e.fillStyle = "#effffb", e.font = "800 48px Arial", e.fillText(s.id.toUpperCase(), 256, n + 83), e.font = "900 69px Arial", e.fillText("+" + s.bonus.toLocaleString("en-US"), 256, n + 162);
  });
  let t = new at.CanvasTexture(i);
  return t.colorSpace = at.SRGBColorSpace, t;
}
var Ze = 28,
  $s = 1.25;
function Mi(i, e = 0) {
  return 1.18 * (58 + Math.min(i, 90) * 0.55) * (1 - e * 0.18);
}
var lt = class i {
  s = 6;
  theta = 0;
  v = 22;
  u = 0;
  route = 0;
  grounded = !0;
  position = new Ne.Vector3();
  velocity = new Ne.Vector3();
  normal = new Ne.Vector3(0, 1, 0);
  time = 0;
  damage = 0;
  wipeouts = 0;
  checkpoint = 6;
  checkpointRoute = 0;
  recovery = 0;
  finished = !1;
  flow = 0;
  surge = 0;
  jet = 0;
  turbulence = 0;
  crest = 0;
  crests = 0;
  airtime = 0;
  flight = 0;
  topSpeed = 0;
  goodTime = 0;
  chain = 1;
  bestChain = 1;
  score = 0;
  cleanLandings = 0;
  events = [];
  label = "";
  labelTime = 0;
  surgeS = -1e9;
  steer = 0;
  pressure = 0;
  finale = !1;
  poolTime = 0;
  gapSpeed = 0;
  pendingCrest = 0;
  resetSerial = 0;
  crashReason = "";
  tumble = 0;
  landingBonus = 0;
  landingZone = "";
  awardClock = 0;
  crestTime = 0;
  crestAwarded = !1;
  lastHop = !1;
  lastSection = 0;
  surgeAwarded = !1;
  surgeRide = 0;
  constructor() {
    this.position.copy(me(this.s, 0, 0, 0.65));
  }
  reset() {
    Object.assign(this, new i());
  }
  award(e, t) {
    let s = this.label === e;
    this.label = e, this.labelTime = 1.9, this.chain = Math.min(8, this.chain + (s ? 0.18 : 0.5)), this.bestChain = Math.max(this.bestChain, this.chain), this.score += Math.round(t * Math.floor(this.chain));
  }
  crash(e = "WIPEOUT") {
    if (this.recovery > 0 || this.finale) return;
    this.events.push("wipeout"), C(this.s, this.route).section === 6 && (this.checkpoint = M[6] - 24, this.checkpointRoute = 0), this.wipeouts++, this.chain = 1, this.damage = Math.min(0.8, this.damage + 0.14), this.grounded && this.launch(2), this.recovery = $s, this.tumble = 0, this.crashReason = e, this.pendingCrest = 0, this.label = "WIPEOUT +3.0s", this.labelTime = 2, this.time += 3, this.surgeS = -1e9;
  }
  launch(e, t = this.s) {
    let s = C(t, this.route),
      o = s.right.clone().multiplyScalar(Math.cos(this.theta)).addScaledVector(s.up, Math.sin(this.theta));
    this.velocity.copy(s.tangent).multiplyScalar(this.v).addScaledVector(o, this.u).addScaledVector(this.normal, e), this.grounded = !1, this.flight = 0;
  }
  step(e, t, s, o = !1) {
    if (this.events = [], this.steer = t, this.finished) {
      this.drift(e);
      return;
    }
    if (this.time += e, this.labelTime = Math.max(0, this.labelTime - e), this.pendingCrest > 0 && this.recovery <= 0 && (this.pendingCrest = Math.max(0, this.pendingCrest - e), this.pendingCrest > 0 && this.pendingCrest < 2.7 && this.grounded && Math.abs(this.theta) < C(this.s, this.route).lip - 0.3 && (this.pendingCrest = 0, this.crests++, this.award("LIP CREST", 250))), this.recovery > 0) {
      this.recovery -= e, this.tumble += e, this.velocity.y -= Ze * e, this.velocity.multiplyScalar(Math.exp(-e * 0.6)), this.position.addScaledVector(this.velocity, e), this.recovery <= 1e-8 && (this.recovery = 0, this.s = this.checkpoint, this.route = this.checkpointRoute, this.theta = 0, this.u = 0, this.v = 44, this.grounded = !0, this.flight = 0, this.position.copy(me(this.s, 0, this.route, 0.65)), this.damage *= 0.55, this.resetSerial++, this.lastSection = C(this.s, this.route).section), this.lastHop = s;
      return;
    }
    let n = C(this.s, this.route),
      r = n.section;
    r !== this.lastSection && (this.lastSection = r, this.crestAwarded = !1, r !== 4 && r !== 6 && (this.route = 0), r === 5 && (this.surgeS = this.s - 95)), r === 5 && this.surgeS > 0 && (this.surgeS += 83 * e), r !== 5 && (this.surgeS = -1e9);
    let a = Xe(this.s, this.theta, this.route, this.surgeS);
    if (this.flow = a.fast, this.surge = a.surge, this.jet = a.jet, this.turbulence = a.turbulence, this.topSpeed = Math.max(this.topSpeed, this.v * 3.6), this.grounded && a.fast > 0.45 ? (this.goodTime += e, this.awardClock += e, this.awardClock > 1.2 && (this.awardClock = 0, this.award(Math.abs(this.theta) > 0.85 ? "HIGH CARVE" : "FAST FLOW", 22))) : (this.awardClock = Math.max(0, this.awardClock - e), this.chain = Math.max(1, this.chain - e * 0.06)), a.surge > 0.5 && this.grounded ? (this.surgeRide += e, this.surgeRide > 0.6 && !this.surgeAwarded && (this.award("SURGE RIDE", 220), this.events.push("surge"), this.surgeAwarded = !0)) : this.surgeRide = Math.max(0, this.surgeRide - e * 0.5), r !== 5 && (this.surgeAwarded = !1), (r === 4 || r === 6) && n.t < 0.045 && this.route === 0 && (this.route = this.theta > 0.12 ? 2 : 1, n = C(this.s, this.route)), this.grounded) {
      this.normal.copy(n.up).multiplyScalar(Math.cos(this.theta)).addScaledVector(n.right, -Math.sin(this.theta));
      let l = -n.curvature.dot(n.right) * this.v * this.v * Math.cos(this.theta),
        u = t * Mi(this.v, this.damage),
        b = (a.line - this.theta) * a.fast * 2.2,
        m = this.time,
        d = a.turbulence * (Math.sin(m * 5.3 + this.s * 0.05) * 20 + Math.sin(m * 11.7) * 12);
      this.u += (u - Ze * (n.right.y * Math.cos(this.theta) + n.up.y * Math.sin(this.theta)) + l + b + d + a.jet * Math.cos(this.theta * 0.7) - this.u * (3.4 + this.damage)) * e, this.theta += this.u / (n.radius - 0.65) * e, this.pressure = Math.abs(l) + Math.abs(a.jet);
      let g = -Ze * n.tangent.y,
        x = 0.00125 * this.v * this.v + 0.08 + this.damage * 1.6 + a.turbulence * 2.5,
        w = (a.current - this.v) * 0.48;
      this.v = Math.max(4, this.v + (g + w - x - Math.abs(t * this.u) * 0.04) * e);
      let y = this.s;
      this.s += this.v / n.metric * e, n = C(this.s, this.route), this.position.copy(me(this.s, this.theta, this.route, 0.65));
      let v = Math.abs(this.theta);
      if (this.crest = v > n.lip - 0.065 && v <= n.lip + 0.015 && !n.closed ? 1 : 0, this.crest && this.v > 32 && Math.abs(this.u) < 2.4 ? (this.crestTime += e, this.crestTime > 0.15 && !this.crestAwarded && (this.crestAwarded = !0, this.pendingCrest = 3, this.events.push("crest"))) : this.crestTime = 0, v < n.lip - 0.32 && this.pendingCrest <= 0 && (this.crestAwarded = !1), n.closed && v > 1.65) this.theta = Math.sign(this.theta) * 1.65, this.u *= -0.3, this.v *= 0.94, this.chain = Math.max(1, this.chain - 0.1);else if (!n.closed && v > n.lip) {
        let f = this.u * Math.sign(this.theta),
          L = Math.max(0.55, 1.75 - (this.v - 45) * 0.035);
        if (f > L || v > n.lip + 0.025) {
          this.crash("LIP EJECTION"), this.lastHop = s;
          return;
        }
      }
      let k = Ze * this.normal.y + this.v * this.v * n.curvature.dot(this.normal) + this.u * this.u / n.radius;
      this.grounded && (n.gap || k < -14 && this.v > 28) && (this.launch(0, n.gap ? M[6] + Y.lip - 1.5 : this.s), n.gap && (this.events.push("launch"), this.gapSpeed = this.v)), this.grounded && s && !this.lastHop && (this.launch(4.5), this.events.push("hop")), this.grounded && this.s - this.checkpoint > 240 && !n.gap && v < 0.75 && Math.abs(a.jet) < 1 && (this.checkpoint = this.s, this.checkpointRoute = this.route), this.grounded && this.s >= D - 1 && (o || y < D - 1) && (this.launch(1.5), this.finale = !0, this.events.push("launch"), this.label = "SPLASHDOWN!", this.labelTime = 2.5);
    } else {
      this.flight += e, this.pressure = 0;
      let l = this.finale ? this.position.clone() : null;
      if (this.velocity.y -= Ze * e, this.finale || this.velocity.addScaledVector(n.right, t * 1.8 * e), this.position.addScaledVector(this.velocity, e), this.finale) {
        if (this.s += this.velocity.dot(T.dir) * e, this.position.y <= T.y + 0.35) {
          if (l) {
            let L = Ne.MathUtils.clamp((l.y - T.y - 0.35) / (l.y - this.position.y), 0, 1);
            this.position.lerpVectors(l, this.position, L);
          }
          if (this.position.clone().sub(T.center).setY(0).length() > T.radius - 3) {
            this.finale = !1, this.crash("MISSED THE POOL");
            return;
          }
          this.position.y = T.y + 0.35, this.finished = !0, this.events.push("finish"), this.airtime += this.flight, this.award("SPLASHDOWN", 500);
          let f = Ut(this.position);
          f && (this.landingBonus = f.bonus, this.landingZone = f.label, this.label = f.label + " +" + f.bonus.toLocaleString("en-US"), this.labelTime = 4);
        }
        this.lastHop = s;
        return;
      }
      this.s += this.velocity.dot(n.tangent) / n.metric * e;
      for (let k = 0; k < 2; k++) n = C(this.s, this.route), this.s += Ne.MathUtils.clamp(this.position.clone().sub(n.p).dot(n.tangent) / n.metric, -2, 2);
      n = C(this.s, this.route);
      let u = this.position.clone().sub(n.p),
        b = u.dot(n.right),
        m = u.dot(n.up),
        d = Math.hypot(b, n.radius - m),
        g = Math.atan2(b, n.radius - m),
        x = n.radius - d;
      this.theta = Math.asin(Ne.MathUtils.clamp(b / (n.radius - 0.65), -1, 1)), this.normal.copy(n.up).multiplyScalar(Math.cos(g)).addScaledVector(n.right, -Math.sin(g));
      let w = this.velocity.dot(this.normal);
      this.v = Math.max(4, this.velocity.dot(n.tangent));
      let y = 0.65 - x,
        v = Math.max(0.35, -w * e * 1.5);
      if (!n.gap && x <= 0.65 && y <= v && w < 0 && Math.abs(g) < n.lip + 0.015) {
        let k = n.right.clone().multiplyScalar(Math.cos(g)).addScaledVector(n.up, Math.sin(g)),
          f = this.velocity.dot(k);
        w < -40 || Math.abs(f) > 23 ? this.crash("BAD LANDING") : (this.airtime += this.flight * (w < -16 ? 0.3 : 1), this.grounded = !0, this.position.copy(me(this.s, g, this.route, 0.65)), this.theta = g, this.u = f, w < -24 || Math.abs(f) > 16 ? (this.v *= 0.78, this.damage = Math.min(1, this.damage + 0.2), this.chain = Math.max(1, this.chain - 1.2), this.events.push("rough"), this.label = "ROUGH LANDING", this.labelTime = 1.5) : this.flight > 0.3 && (this.cleanLandings++, this.award("CLEAN LANDING", 70 + this.flight * 40), this.events.push("clean")));
      }
      if (this.grounded) {
        this.lastHop = s;
        return;
      }
      Math.abs(g) > n.lip + 0.1 && m < n.radius - 1.5 ? this.crash("OVER THE EDGE") : (m < -25 || this.flight > 5) && this.crash(n.section === 6 ? "SHORT OF THE GAP" : "WIPEOUT");
    }
    this.damage >= 1 && this.crash("TUBE BLOWOUT"), this.lastHop = s;
  }
  drift(e) {
    this.poolTime += e;
    let t = Math.exp(-e * 1.15);
    this.velocity.x *= t, this.velocity.z *= t, this.velocity.y = 0, this.position.addScaledVector(this.velocity, e);
    let s = this.position.clone().sub(T.center).setY(0);
    s.length() > T.radius - 8 && (s.setLength(T.radius - 8), this.position.x = T.center.x + s.x, this.position.z = T.center.z + s.z, this.velocity.multiplyScalar(0.3)), this.position.y = T.y + 0.35 + Math.sin(this.poolTime * 2.2) * 0.35 * Math.exp(-this.poolTime * 0.1) + 0.25, this.v = Math.hypot(this.velocity.x, this.velocity.z);
  }
  finalScore() {
    return Math.max(0, Math.round(this.score + this.landingBonus + Math.max(0, 420 - this.time) * 40 + this.goodTime * 15 + this.crests * 200 + this.airtime * 25 - this.wipeouts * 250));
  }
  stats() {
    return {
      landingBonus: this.landingBonus,
      landingZone: this.landingZone,
      time: this.time,
      flow: Math.round(100 * this.goodTime / Math.max(1, this.time)),
      crests: this.crests,
      airtime: this.airtime,
      clean: Math.round(Math.max(0, 100 - this.wipeouts * 7 - this.damage * 20)),
      speed: Math.round(this.topSpeed),
      chain: Math.floor(this.bestChain),
      score: this.finalScore()
    };
  }
};
import * as se from "./vendor/001-three-0.185.js";
function Si(i, e, t) {
  let s = C(i, t),
    o = s.up.clone().multiplyScalar(Math.cos(e)).addScaledVector(s.right, -Math.sin(e)),
    n = new se.Vector3().crossVectors(s.tangent, o).normalize();
  return new se.Quaternion().setFromRotationMatrix(new se.Matrix4().makeBasis(n, o, s.tangent.clone().negate()));
}
var kt = class {
    position = new se.Vector3();
    rotation = new se.Quaternion();
    tangent = new se.Vector3();
    up = new se.Vector3();
    s = 0;
    theta = 0;
    route = 0;
    v = 0;
    tumble = 0;
    recovery = 0;
    read(e) {
      if (this.position.copy(e.position), this.s = e.s, this.theta = e.theta, this.route = e.route, this.v = e.v, this.tumble = e.tumble, this.recovery = e.recovery, e.finished) {
        let s = Math.atan2(-T.dir.x, -T.dir.z);
        this.rotation.setFromEuler(new se.Euler(Math.sin(e.poolTime * 2) * 0.035, s + Math.sin(e.poolTime * 0.5) * 0.12, Math.cos(e.poolTime * 1.7) * 0.035)), this.tangent.copy(T.dir), this.up.set(0, 1, 0);
        return;
      }
      let t = C(e.s, e.route);
      this.tangent.copy(t.tangent), this.up.copy(t.up), this.rotation.copy(Si(e.s, e.theta, e.route)), e.recovery > 0 && this.rotation.multiply(new se.Quaternion().setFromEuler(new se.Euler(e.tumble * 2.7, 0, e.tumble * 3.8)));
    }
    copy(e) {
      this.position.copy(e.position), this.rotation.copy(e.rotation), this.tangent.copy(e.tangent), this.up.copy(e.up), this.s = e.s, this.theta = e.theta, this.route = e.route, this.v = e.v, this.tumble = e.tumble, this.recovery = e.recovery;
    }
  },
  ct = class {
    previous = new kt();
    current = new kt();
    view = new kt();
    serial = 0;
    reset(e) {
      this.current.read(e), this.previous.copy(this.current), this.view.copy(this.current), this.serial = e.resetSerial;
    }
    beforeStep() {
      this.previous.copy(this.current);
    }
    afterStep(e) {
      return e.resetSerial !== this.serial ? (this.reset(e), !0) : (this.current.read(e), !1);
    }
    sample(e) {
      let t = this.previous,
        s = this.current,
        o = this.view;
      return e = se.MathUtils.clamp(e, 0, 1), o.position.lerpVectors(t.position, s.position, e), o.rotation.slerpQuaternions(t.rotation, s.rotation, e), o.tangent.lerpVectors(t.tangent, s.tangent, e).normalize(), o.up.lerpVectors(t.up, s.up, e).normalize(), o.s = se.MathUtils.lerp(t.s, s.s, e), o.theta = se.MathUtils.lerp(t.theta, s.theta, e), o.route = s.route, o.v = se.MathUtils.lerp(t.v, s.v, e), o.tumble = se.MathUtils.lerp(t.tumble, s.tumble, e), o.recovery = s.recovery, o;
    }
  };
import * as h from "./vendor/001-three-0.185.js";
function Qs() {
  let i = {
    time: {
      value: 0
    },
    splash: {
      value: new h.Vector3(0, 0, -100)
    },
    center: {
      value: T.center.clone()
    },
    radius: {
      value: T.radius
    },
    dir: {
      value: new h.Vector2(T.dir.x, T.dir.z)
    },
    targets: {
      value: Ht.map(t => new h.Vector4(t.x, t.z, t.width / 2, t.length / 2))
    },
    targetColors: {
      value: Ht.map(t => new h.Color(t.color))
    },
    targetLabels: {
      value: cs()
    }
  };
  return {
    mat: new h.ShaderMaterial({
      uniforms: i,
      transparent: !1,
      vertexShader: `uniform float time;uniform vec3 splash;uniform vec3 center;uniform vec2 dir;varying vec3 vW;varying float vH;
  float swell(vec2 p){float x=dot(p-center.xz,-dir);return .38*sin(x*.085-time*1.9)+.14*sin(x*.21-time*3.1+p.y*.04);}
  void main(){vec4 w=modelMatrix*vec4(position,1.);float h=swell(w.xz);float d=length(w.xz-splash.xy);float age=time-splash.z;
  h+=age>0.&&age<6.?sin(d*.55-age*9.)*exp(-age*.6)*exp(-d*.03)*1.4:0.;w.y+=h;vW=w.xyz;vH=h;gl_Position=projectionMatrix*viewMatrix*w;}`,
      fragmentShader: `uniform float time;uniform vec3 center;uniform float radius;uniform vec2 dir;uniform vec4 targets[3];uniform vec3 targetColors[3];uniform sampler2D targetLabels;varying vec3 vW;varying float vH;
  float c(vec2 p){p*=.18;float v=0.;for(int i=0;i<3;i++){p=vec2(p.x*1.6+p.y*1.2,p.y*1.6-p.x*1.2)+time*.25;v+=abs(sin(p.x)+sin(p.y));}return v/3.;}
  void main(){float r=length(vW.xz-center.xz)/radius;if(r>1.)discard;
  vec3 deep=vec3(.004,.10,.21),shallow=vec3(.012,.34,.40);vec3 col=mix(deep,shallow,smoothstep(.2,1.,r)*.6+.25);
  float ca=pow(1.-clamp(c(vW.xz),0.,1.),5.);col+=ca*vec3(.12,.4,.45)*.4;
  float foam=smoothstep(.42,.9,vH);col=mix(col,vec3(.45,.72,.78),foam*.4);
  vec2 q=vW.xz-center.xz;
  for(int i=0;i<12;i++){float a=float(i)*6.283185/12.;vec2 spot=vec2(cos(a),sin(a))*radius*.91;float s=exp(-dot(q-spot,q-spot)/(radius*radius*.008));col+=s*vec3(.015,.35,.42);}
  vec3 n=normalize(vec3(sin(vW.x*.14+time)*.07,1.,cos(vW.z*.11-time)*.08));
  vec3 eye=normalize(cameraPosition-vW);float fresnel=pow(1.-max(0.,dot(n,eye)),4.);
  float glint=pow(max(0.,dot(reflect(-eye,n),normalize(vec3(.3,.8,-.4)))),90.);
  col=mix(col,vec3(.07,.16,.25),fresnel*.45)+glint*vec3(.35,.48,.55);
  col+=smoothstep(.965,1.,r)*vec3(.06,.13,.12);
  // Recessed pool-floor lighting seen through moving water, not floating rings.
  vec2 poolLocal=vec2(dot(q,vec2(-dir.y,dir.x)),dot(q,dir));
  for(int i=0;i<3;i++){
   vec4 t=targets[i];vec2 local=poolLocal-t.xy;vec2 edge=abs(local)-t.zw;
   float inside=1.-smoothstep(-.18,.18,max(edge.x,edge.y));
   float border=inside*smoothstep(-.50,-.18,max(edge.x,edge.y));
   vec2 uv=local/(t.zw*2.)+.5;
   float text=texture2D(targetLabels,vec2(uv.x,(uv.y+float(2-i))/3.)).a*inside;
   col=mix(col,col*.55+targetColors[i]*(.23+.025*sin(vW.x*.7+time)),inside*.8);
   col+=targetColors[i]*border*.6+vec3(.65,.78,.75)*text*.8;
  }
  gl_FragColor=vec4(col,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>}`
    }),
    uniforms: i
  };
}
function hs(i, e = 1024, t = 384) {
  let s = document.createElement("canvas");
  s.width = e, s.height = t;
  let o = s.getContext("2d"),
    n = o.createLinearGradient(0, 0, e, 0);
  n.addColorStop(0, "#2a0a4a"), n.addColorStop(0.5, "#06224a"), n.addColorStop(1, "#2a0a4a"), o.fillStyle = n, o.fillRect(0, 0, e, t), o.strokeStyle = "#ffd08a", o.lineWidth = 8, o.strokeRect(8, 8, e - 16, t - 16);
  let r = t / 2 - i.reduce((l, u) => l + u.s * 1.15, 0) / 2;
  o.textAlign = "center", o.textBaseline = "top";
  for (let l of i) {
    let u = l.s;
    for (o.font = `900 ${u}px Arial, sans-serif`; o.measureText(l.t).width > e - 60;) o.font = `900 ${u -= 4}px Arial, sans-serif`;
    o.fillStyle = l.c, o.shadowColor = l.c, o.shadowBlur = 18, o.fillText(l.t, e / 2, r), r += l.s * 1.15;
  }
  let a = new h.CanvasTexture(s);
  return a.colorSpace = h.SRGBColorSpace, new h.MeshBasicMaterial({
    map: a,
    toneMapped: !1,
    side: h.DoubleSide
  });
}
var Io = Pe({
  id: "paradise-wave-pool",
  name: "Splashdown wave pool (party finale)",
  role: "structure",
  create: () => {
    let i = new h.Group(),
      e = new h.Mesh(new h.CircleGeometry(20, 48), new h.MeshBasicMaterial({
        color: 1358064
      }));
    return e.rotation.x = -Math.PI / 2, i.add(e), i;
  }
});
function Ks(i) {
  let e = T.center,
    t = T.radius,
    s = T.y,
    o = T.dir,
    n = new h.Vector3(-o.z, 0, o.x),
    r = [new h.MeshStandardMaterial({
      color: 12367008,
      roughness: 0.8
    }), new h.MeshStandardMaterial({
      color: 1322295,
      roughness: 0.4,
      metalness: 0.25
    }), new h.MeshStandardMaterial({
      color: 5652787,
      roughness: 0.7
    }), new h.MeshStandardMaterial({
      color: 14931641,
      roughness: 0.95
    }), new h.MeshStandardMaterial({
      color: 16766108,
      emissive: 16758632,
      emissiveIntensity: 1.6
    }), new h.MeshStandardMaterial({
      color: 2388606,
      roughness: 0.22,
      metalness: 0.35
    })],
    a = r.map(() => []);
  function l(m, d, g, x, w, y, v, k = 0) {
    let f = e.clone().addScaledVector(n, d).addScaledVector(o, x).add(new h.Vector3(0, g, 0)),
      L = new h.Quaternion().setFromEuler(new h.Euler(0, Math.atan2(-o.x, -o.z) + k, 0));
    a[m].push(new h.Matrix4().compose(f, L, new h.Vector3(w, y, v)));
  }
  for (let m of [-1, 1]) l(0, m * (t + 39), -6, 25, 42, 12, 230);
  l(0, 0, -6, t + 57, 235, 12, 58);
  for (let m = -3; m <= 3; m++) {
    let d = t + 54 - Math.abs(m) * 4,
      g = m * 27,
      x = 17 - Math.abs(m) * 2;
    l(0, g, x / 2, d, 25, x, 18), l(1, g, x + 0.4, d, 28, 1.2, 21);
    for (let w = 0; w < 2; w++) {
      let y = 4 + w * 6;
      l(1, g, y - 1, d - 10, 26, 0.6, 3), l(4, g, y - 1.4, d - 11.6, 24, 0.12, 0.14);
      for (let v = -2; v <= 2; v++) l(5, g + v * 4.3, y + 1, d - 9.1, 3.1, 3, 0.15), l(4, g + v * 4.3, y + 1, d - 9.3, 0.12, 2.8, 0.1);
    }
  }
  for (let m of [-1, 1]) for (let d = 0; d < 5; d++) {
    let g = -0.65 + d * 0.34,
      x = m * Math.cos(g) * (t + 13),
      w = Math.sin(g) * (t + 13),
      y = m * Math.PI / 2 - g;
    l(2, x, 0.65, w, 12, 0.8, 10, y), l(3, x, 6.8, w, 13, 0.35, 11, y), l(1, x, 7.1, w, 13.5, 0.25, 11.5, y);
    let v = Math.cos(y),
      k = -Math.sin(y);
    for (let f of [-1, 1]) for (let L of [-1, 1]) l(2, x + f * 5 * v + L * 4 * Math.sin(y), 3.6, w + f * 5 * k + L * 4 * Math.cos(y), 0.28, 6, 0.28);
    for (let f of [-1, 1]) l(3, x + f * 2.4 * v, 1.35, w + f * 2.4 * k, 2.8, 0.6, 6, y), l(5, x + f * 2.4 * v, 1.7, w + f * 2.4 * k + 2, 2.7, 0.4, 1.5, y);
    l(4, x, 6.4, w, 8, 0.08, 0.3, y);
  }
  l(1, 0, 20, t + 16, 46, 1, 22), l(0, 0, 1, t + 16, 48, 2, 24), l(2, 0, 3.5, t + 21, 25, 3, 3), l(4, 0, 19.3, t + 4.8, 42, 0.12, 0.2), l(4, 0, 4.7, t + 19.4, 24, 0.12, 0.15);
  for (let m of [-21, 21]) l(0, m, 10, t + 19, 1, 20, 1);
  let u = new h.BoxGeometry();
  a.forEach((m, d) => {
    let g = new h.InstancedMesh(u, r[d], m.length);
    m.forEach((x, w) => g.setMatrixAt(w, x)), g.name = "Pool resort architecture", i.add(g);
  });
  let b = new h.MeshBasicMaterial({
    color: 7588056,
    transparent: !0,
    opacity: 0.42,
    depthWrite: !1
  });
  for (let m of [-1, 1]) for (let d = 0; d < 4; d++) {
    let g = [];
    for (let w = 0; w <= 24; w++) {
      let y = w / 24;
      g.push(e.clone().addScaledVector(n, m * (t - 3 - y * 16)).addScaledVector(o, -24 + d * 12).add(new h.Vector3(0, 0.5 + 14 * y * (1 - y), 0)));
    }
    let x = new h.CatmullRomCurve3(g);
    i.add(new h.Mesh(new h.TubeGeometry(x, 24, 0.09, 4, !1), b));
  }
}
function ps(i) {
  let e = new h.Group();
  e.name = "Tropical Waters splashdown party", i.add(e);
  let t = T.center,
    s = T.radius,
    o = T.y,
    n = Math.atan2(-T.dir.x, -T.dir.z),
    r = new h.MeshStandardMaterial({
      color: 3812392,
      roughness: 0.9
    }),
    a = new h.Mesh(new h.CylinderGeometry(s + 26, s + 40, 50, 64, 1, !0), r);
  a.position.set(t.x, o - 25.3, t.z), e.add(a);
  let l = new h.Mesh(new h.RingGeometry(s, s + 26, 96, 1), new h.MeshStandardMaterial({
    color: 11569768,
    roughness: 0.75
  }));
  l.rotation.x = -Math.PI / 2, l.position.set(t.x, o + 0.25, t.z), e.add(l);
  let u = new h.Mesh(new h.TorusGeometry(s, 0.18, 8, 160), new h.MeshBasicMaterial({
    color: 16765066,
    toneMapped: !1
  }));
  u.rotation.x = Math.PI / 2, u.position.set(t.x, o + 0.35, t.z), e.add(u);
  let b = Qs(),
    m = new h.Mesh(new h.PlaneGeometry(s * 2, s * 2, 110, 110), b.mat);
  m.rotation.x = -Math.PI / 2, m.position.set(t.x, o, t.z), m.frustumCulled = !1, e.add(m);
  let d = new h.PointLight(16761226, 1800, 240, 2),
    g = new h.PointLight(6871531, 1800, 240, 2),
    x = new h.PointLight(16761466, 2e3, 240, 2);
  d.position.set(t.x - 40, o + 30, t.z), g.position.set(t.x + 40, o + 30, t.z), x.position.set(t.x, o + 35, t.z + 40), i.add(d, g, x), Ks(e);
  let w = t.clone().addScaledVector(T.dir, s + 14),
    y = new h.Mesh(new h.BoxGeometry(46, 4, 16), new h.MeshStandardMaterial({
      color: 1382963,
      metalness: 0.5,
      roughness: 0.4
    }));
  y.position.set(w.x, o + 2, w.z), y.rotation.y = n, e.add(y);
  let v = new h.Mesh(new h.PlaneGeometry(34, 12.75), hs([{
    t: "SPLASHDOWN PARTY",
    s: 120,
    c: "#7ff6ff"
  }, {
    t: "TROPICAL WATERS",
    s: 64,
    c: "#ffd08a"
  }]));
  v.position.set(w.x, o + 13, w.z), v.rotation.y = n, e.add(v);
  let k = new h.MeshStandardMaterial({
    color: 2239044,
    metalness: 0.7,
    roughness: 0.35
  });
  for (let c of [-1, 1]) {
    let E = new h.Mesh(new h.BoxGeometry(0.7, 20, 0.7), k),
      A = new h.Vector3(-T.dir.z, 0, T.dir.x);
    E.position.copy(w).addScaledVector(A, c * 18).setY(o + 10), e.add(E);
  }
  let f = C(D - 40),
    L = f.p.clone(),
    O = new h.Group(),
    z = new h.Mesh(new h.PlaneGeometry(22, 8), hs([{
      t: "PARADISE PLUNGE",
      s: 96,
      c: "#7ff6ff"
    }, {
      t: "FINISH \xB7 SPLASHDOWN",
      s: 60,
      c: "#ffd08a"
    }]));
  z.position.y = 19, O.add(z);
  for (let c of [-11.5, 11.5]) {
    let E = new h.Mesh(new h.BoxGeometry(0.9, 23, 0.9), k);
    E.position.set(c, 11.5, 0), O.add(E);
  }
  O.position.copy(L), O.rotation.y = Math.atan2(-f.tangent.x, -f.tangent.z), e.add(O);
  let G = new h.CapsuleGeometry(0.55, 1.2, 4, 8);
  G.translate(0, 1.2, 0);
  let Q = new h.SphereGeometry(0.5, 10, 8);
  Q.translate(0, 2.55, 0);
  let ae = 150,
    B = new h.InstancedMesh(G, new h.MeshStandardMaterial({
      roughness: 0.6
    }), ae),
    U = new h.InstancedMesh(Q, new h.MeshStandardMaterial({
      color: 12948343,
      roughness: 0.7
    }), ae);
  B.instanceMatrix.setUsage(h.DynamicDrawUsage), U.instanceMatrix.setUsage(h.DynamicDrawUsage);
  let K = [15974024, 7451837, 15786172, 6590084, 15241336, 6851003, 16051938],
    V = 11,
    W = () => (V = V * 16807 % 2147483647, V / 2147483647),
    Ae = [];
  for (let c = 0; c < ae; c++) {
    let E = W() * Math.PI * 2;
    Math.cos(E) * T.dir.x + Math.sin(E) * T.dir.z < -0.85 && (E += 1.2);
    let S = s + 3 + W() * 16,
      I = t.x + Math.cos(E) * S,
      F = t.z + Math.sin(E) * S;
    Ae.push({
      x: I,
      z: F,
      phase: W() * 6.28,
      yaw: Math.atan2(t.x - I, t.z - F)
    }), B.setColorAt(c, new h.Color(K[c % K.length]));
  }
  B.frustumCulled = !1, U.frustumCulled = !1, e.add(B, U);
  let Le = [16732067, 16765514, 3334399, 8191851].map(c => new h.MeshStandardMaterial({
      color: c,
      roughness: 0.35,
      emissive: c,
      emissiveIntensity: 0.15
    })),
    q = [];
  for (let c = 0; c < 16; c++) {
    let E = new h.Mesh(new h.TorusGeometry(1.3, 0.5, 8, 20), Le[c % 4]);
    E.rotation.x = Math.PI / 2;
    let A = {
      m: E,
      a: W() * 6.28,
      r: 18 + W() * (s - 26)
    };
    q.push(A), e.add(E);
  }
  let X = new h.InstancedMesh(new h.SphereGeometry(0.2, 6, 4), new h.MeshBasicMaterial({
      toneMapped: !1
    }), 240),
    ve = new h.Matrix4();
  for (let c = 0; c < 240; c++) {
    let E = c / 240 * Math.PI * 2,
      A = s + 22,
      S = Math.abs(Math.sin(c / 240 * Math.PI * 24));
    ve.makeTranslation(t.x + Math.cos(E) * A, o + 9 - S * 2.5, t.z + Math.sin(E) * A), X.setMatrixAt(c, ve), X.setColorAt(c, new h.Color(c % 5 === 0 ? 16771792 : 15120253));
  }
  X.frustumCulled = !1, e.add(X);
  for (let c = 0; c < 24; c++) {
    let E = c / 24 * Math.PI * 2,
      A = new h.Mesh(new h.CylinderGeometry(0.25, 0.25, 10, 6), k);
    A.position.set(t.x + Math.cos(E) * (s + 22), o + 5, t.z + Math.sin(E) * (s + 22)), e.add(A);
  }
  let le = 360,
    ce = new Float32Array(le * 3),
    he = new Float32Array(le * 3),
    oe = new Float32Array(le),
    pe = new Float32Array(le * 3);
  for (let c = 0; c < le; c++) ce[c * 3 + 1] = -1e5;
  let ue = new h.BufferGeometry();
  ue.setAttribute("position", new h.BufferAttribute(ce, 3).setUsage(h.DynamicDrawUsage)), ue.setAttribute("color", new h.BufferAttribute(pe, 3).setUsage(h.DynamicDrawUsage));
  let Ye = new h.Points(ue, new h.PointsMaterial({
    size: 0.8,
    vertexColors: !0,
    transparent: !0,
    blending: h.AdditiveBlending,
    depthWrite: !1,
    toneMapped: !1
  }));
  Ye.frustumCulled = !1, e.add(Ye);
  let Ge = 0,
    Ce = 0,
    xe = -1,
    Ee = 0,
    vt = (c, E, A) => {
      let S = new h.Color(K[Math.floor(W() * 6)]);
      for (let I = 0; I < 90; I++) {
        let F = Ge++ % le,
          P = W() * 6.28,
          H = Math.acos(2 * W() - 1),
          j = 10 + W() * 9;
        ce[F * 3] = c, ce[F * 3 + 1] = E, ce[F * 3 + 2] = A, he[F * 3] = Math.sin(H) * Math.cos(P) * j, he[F * 3 + 1] = Math.cos(H) * j, he[F * 3 + 2] = Math.sin(H) * Math.sin(P) * j, oe[F] = 1.6 + W(), pe[F * 3] = S.r, pe[F * 3 + 1] = S.g, pe[F * 3 + 2] = S.b;
      }
      ue.attributes.color.needsUpdate = !0;
    },
    xt = new h.Matrix4(),
    Et = new h.Quaternion(),
    wt = new h.Vector3(1, 1, 1),
    st = new h.Vector3(),
    ni = new h.Vector3(0, 1, 0);
  return {
    capture() {
      return {
        seed: V,
        fwCursor: Ge,
        nextBurst: Ce,
        finishedAt: xe,
        crowdJump: Ee,
        fx: ce.slice(),
        fv: he.slice(),
        fl: oe.slice(),
        fc: pe.slice(),
        splash: b.uniforms.splash.value.clone()
      };
    },
    restore(c) {
      ({
        seed: V,
        fwCursor: Ge,
        nextBurst: Ce,
        finishedAt: xe,
        crowdJump: Ee
      } = c), ce.set(c.fx), he.set(c.fv), oe.set(c.fl), pe.set(c.fc), b.uniforms.splash.value.copy(c.splash), ue.attributes.position.needsUpdate = !0, ue.attributes.color.needsUpdate = !0;
    },
    reset(c = 11) {
      V = c, Ge = 0, Ce = 0, xe = -1, Ee = 0, oe.fill(0);
      for (let E = 0; E < le; E++) ce[E * 3 + 1] = -1e5;
      Ye.visible = !1, b.uniforms.splash.value.set(0, 0, -100), ue.attributes.position.needsUpdate = !0;
    },
    update(c, E, A, S) {
      let I = h.MathUtils.clamp(1 - (A.distanceTo(t) - s) / 700, 0, 1);
      if (e.visible = I > 0 || A.distanceTo(Z) < 1400, !e.visible) return I;
      if (b.uniforms.time.value = c, S && xe < 0) {
        xe = c, b.uniforms.splash.value.set(A.x, A.z, c), Ee = 1;
        for (let H = 0; H < 3; H++) vt(t.x + (W() - 0.5) * s, o + 60 + W() * 30, t.z + (W() - 0.5) * s);
      }
      S || (xe = -1), Ee = Math.max(S ? 0.35 : 0, Ee - E * 0.08), S && c - xe < 5 && c > Ce && (Ce = c + 2, vt(t.x + (W() - 0.5) * s, o + 65 + W() * 25, t.z + (W() - 0.5) * s));
      let F = !1,
        P = 0;
      for (let H = 0; H < le; H++) if (!(oe[H] <= 0)) {
        F = !0, oe[H] -= E, he[H * 3 + 1] -= 6 * E;
        for (let j = 0; j < 3; j++) ce[H * 3 + j] += he[H * 3 + j] * E, he[H * 3 + j] *= 1 - E * 0.8;
        oe[H] <= 0 ? ce[H * 3 + 1] = -1e5 : P++;
      }
      return Ye.visible = P > 0, F && (ue.attributes.position.needsUpdate = !0), Ae.forEach((H, j) => {
        let te = Math.max(0, Math.sin(c * (6 + Ee * 4) + H.phase)) * (0.25 + Ee * 1.1);
        st.set(H.x, o + 0.3 + te, H.z), Et.setFromAxisAngle(ni, H.yaw), xt.compose(st, Et, wt), B.setMatrixAt(j, xt), U.setMatrixAt(j, xt);
      }), B.instanceMatrix.needsUpdate = !0, U.instanceMatrix.needsUpdate = !0, q.forEach((H, j) => {
        let te = H.a + c * 0.05 * (j % 2 ? 1 : -1);
        H.m.position.set(t.x + Math.cos(te) * H.r, o + 0.5 + Math.sin(c * 1.9 + j) * 0.5, t.z + Math.sin(te) * H.r);
      }), d.intensity = 1800 + Math.sin(c * 0.7) * 100, g.intensity = 1800 + Math.cos(c * 0.5) * 100, I;
    }
  };
}
import * as _ from "./vendor/001-three-0.185.js";
var Js = "./assets/013-billboardshigh-score-ad.webp",
  qt = [{
    id: "paradise-brand-billboard",
    name: "Paradise Plunge attraction billboard",
    asset: "./assets/014-billboardsparadise-plunge-brand.webp",
    aspect: 640 / 304,
    s: M[1] + 30,
    side: -1,
    width: 42
  }, {
    id: "paradise-rider-billboard",
    name: "Tropical Waters tube rider billboard",
    asset: "./assets/015-billboardstropical-tube-rider.webp",
    aspect: 640 / 285,
    s: M[5] + 100,
    side: 1,
    width: 48
  }, {
    id: "paradise-reward-billboard",
    name: "Approved high-score ad billboard",
    asset: Js,
    aspect: 640 / 287,
    s: M[8] - 110,
    side: -1,
    width: 46
  }],
  Xs = new _.TextureLoader(),
  us = new Map();
function Zs(i) {
  let e = us.get(i);
  return e || (e = Xs.load(i), e.colorSpace = _.SRGBColorSpace, e.anisotropy = 4, us.set(i, e)), e;
}
function eo(i) {
  let e = new _.Group(),
    t = i.width,
    s = t / i.aspect,
    o = new _.MeshStandardMaterial({
      color: 1518390,
      roughness: 0.36,
      metalness: 0.65
    }),
    n = new _.MeshStandardMaterial({
      color: 12100989,
      roughness: 0.38,
      metalness: 0.65,
      emissive: 16761978,
      emissiveIntensity: 0.16
    }),
    r = new _.BoxGeometry(),
    a = [[[0, 0, -0.55], [t + 1.3, s + 1.3, 1]], [[-t * 0.32, -s * 0.5 - 23, -1], [0.85, 46, 1.1]], [[t * 0.32, -s * 0.5 - 23, -1], [0.85, 46, 1.1]], [[0, -s * 0.5 - 10, -1], [t * 0.68, 0.6, 0.7]], [[0, -s * 0.5 - 26, -1], [t * 0.68, 0.6, 0.7]]],
    l = new _.InstancedMesh(r, o, a.length),
    u = new _.Matrix4(),
    b = new _.Quaternion();
  a.forEach(([w, y], v) => l.setMatrixAt(v, u.compose(new _.Vector3(...w), b, new _.Vector3(...y)))), e.add(l);
  let m = new _.InstancedMesh(r, n, 4);
  [[-t / 2 - 0.25, 0, 0.35, 0.28, s + 1, 0.35], [t / 2 + 0.25, 0, 0.35, 0.28, s + 1, 0.35], [0, -s / 2 - 0.25, 0.35, t + 1, 0.28, 0.35], [0, s / 2 + 0.25, 0.35, t + 1, 0.28, 0.35]].forEach(([w, y, v, k, f, L], O) => m.setMatrixAt(O, u.compose(new _.Vector3(w, y, v), b, new _.Vector3(k, f, L)))), e.add(m);
  let g = Zs(i.asset),
    x = new _.Mesh(new _.PlaneGeometry(t, s), new _.MeshBasicMaterial({
      map: g,
      toneMapped: !1,
      color: 12175056
    }));
  return x.position.z = 0.02, e.add(x), e.name = i.name, e;
}
var to = qt.map(i => Pe({
  id: i.id,
  name: i.name,
  role: "signage",
  create: () => eo(i)
}));
function ds(i) {
  let e = qt.map((t, s) => {
    let o = to[s].create(),
      n = C(t.s);
    o.position.copy(n.p).addScaledVector(n.right, t.side * 40).add(new _.Vector3(0, 28, 0));
    let r = C(t.s - 110).p.clone().setY(o.position.y);
    return o.lookAt(r), i.add(o), o;
  });
  return {
    update(t) {
      e.forEach((s, o) => {
        s.visible = t > qt[o].s - 420 && t < qt[o].s + 80;
      });
    }
  };
}
import * as R from "./vendor/001-three-0.185.js";
import { GLTFLoader as io } from "./vendor/011-GLTFLoader.js";
import * as J from "./vendor/001-three-0.185.js";
function ms() {
  let i = new J.MeshPhysicalMaterial({
      color: 1201272,
      metalness: 0.12,
      roughness: 0.32,
      clearcoat: 0.26,
      clearcoatRoughness: 0.28,
      transparent: !0,
      opacity: 0.8,
      depthWrite: !1,
      side: J.DoubleSide
    }),
    e = {
      time: {
        value: 0
      },
      surgeS: {
        value: M[5] + 170
      },
      speed: {
        value: 0
      },
      drift: {
        value: 0
      }
    };
  return i.onBeforeCompile = t => {
    t.uniforms.uWaterTime = e.time, t.uniforms.uSurgeS = e.surgeS, t.uniforms.uRideSpeed = e.speed, t.uniforms.uFoamDrift = e.drift, t.vertexShader = t.vertexShader.replace("#include <common>", `#include <common>
attribute float flow;
attribute float jet;
attribute float current;
attribute float boost;
varying float vBoost;
varying float vCurrent;
varying vec2 vStreamUv;
varying float vFastLine;
varying float vJet;`), t.vertexShader = t.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
vStreamUv = uv;
vFastLine = flow;
vJet = jet;
vCurrent = current;
vBoost = boost;`), t.fragmentShader = t.fragmentShader.replace("#include <common>", `#include <common>
uniform float uWaterTime;
uniform float uSurgeS;
uniform float uRideSpeed;
uniform float uFoamDrift;
varying vec2 vStreamUv;
varying float vFastLine;
varying float vJet;
varying float vCurrent;
varying float vBoost;
float satW(float a){return clamp(a,0.0,1.0);}
`), t.fragmentShader = t.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>
float ws=vStreamUv.y, wa=vStreamUv.x;
float flowSpeed=vCurrent+vBoost*exp(-pow((wa-vFastLine)/.3,2.0));
float speedAccent=smoothstep(45.0,100.0,uRideSpeed);
float along=ws-uWaterTime*flowSpeed-uFoamDrift;
float meander=vFastLine+0.037*sin(ws*.097+uWaterTime*.8)+.023*sin(ws*.27-wa*8.0);
float lane=exp(-pow((wa-meander)/.34,2.0));
float wave=sin(along*.65+sin(wa*25.0+ws*.11)*1.35)*sin(wa*37.0-ws*.19+uWaterTime*2.5);
float chop=sin(along*1.21+wa*15.0+sin(ws*.27+wa*27.0))*sin(along*.37-wa*49.0);
float trail=pow(satW(.5+.5*wave),3.0)*satW(.35+.65*chop);
float fleck=pow(satW(.5+.5*sin(along*1.7+wa*28.0+sin(wa*63.0+ws*.47))),7.0);
float current=satW((trail*.75+fleck*.37)*lane*1.85);
float ripple=.5+.5*sin(ws*.42-uWaterTime*9.0+sin(wa*18.0+ws*.13)*1.4);
float shimmer=(ripple*.16+satW(chop)*.13)*(.45+.55*lane);
float inSurge=step(${M[5].toFixed(1)},ws)*step(ws,${M[6].toFixed(1)});
float d=(ws-uSurgeS-4.5*sin(wa*4.0+ws*.08))/18.0;
float surge=exp(-d*d)*inSurge;
float broken=satW(.77+.23*sin(wa*31.0+ws*.63-uWaterTime*8.0));
// Cross-current jets: diagonal whitewater bands sweeping from the inlet side toward the lip they push you to.
float jetSide=sign(vJet),jetK=satW(abs(vJet)/24.0);
float diag=pow(satW(.5+.5*sin(ws*.9+wa*jetSide*7.0-uWaterTime*16.0)),5.0)+pow(satW(.5+.5*sin(ws*2.3+wa*jetSide*11.0-uWaterTime*23.0)),9.0);
float inlet=satW(1.0-(wa*jetSide+1.3)/2.2);
float jetFoam=jetK*satW(diag*(.55+.6*inlet));
float foam=satW(current*.71+surge*(.40+.49*broken)*(.67+.33*lane)+jetFoam);
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.15,.48,.65),.15+shimmer*.34);
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.24,.65,.79),foam*.65);
// Restrained moon-white highlights on foam and warm reflections from the recessed rail lights.
float glints=pow(satW(chop),12.0)*foam*(.045+.055*speedAccent);
float warmWet=pow(satW(.5+.5*sin(ws*.19+wa*2.0)),18.0)*smoothstep(.55,1.2,abs(wa))*.023;
diffuseColor.rgb+=glints*vec3(.62,.76,.87)+warmWet*vec3(1.0,.63,.29);
diffuseColor.a=clamp(.73+foam*.19+shimmer*.07,.73,.96);
`), t.fragmentShader = t.fragmentShader.replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
// Tiny view-space normal undulations carry moving highlights without altering collision.
normal=normalize(normal + vec3(sin(vStreamUv.y*.67-uWaterTime*10.0+vStreamUv.x*23.0)*.053,sin(vStreamUv.x*31.0+vStreamUv.y*.29-uWaterTime*4.5)*.047,0.0));
`);
  }, i.onBeforeCompile = (t => (s, o) => {
    t(s, o), s.fragmentShader = s.fragmentShader.replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
float fixtureDistance=abs(mod(ws-2.5+2.5,5.0)-2.5);
float lamp=exp(-fixtureDistance*fixtureDistance/1.8)*exp(-pow((abs(wa)-.95)/.34,2.0));
float railBounce=exp(-pow((abs(wa)-1.12)/.22,2.0));
totalEmissiveRadiance+=vec3(.008,.15,.24)*lamp*(.65+foam*.5)+vec3(.012,.065,.095)*foam*(.4+lane*.6)+vec3(.04,.016,.004)*railBounce;
`);
  })(i.onBeforeCompile.bind(i)), i.customProgramCacheKey = () => "moonlit-current-v3", {
    material: i,
    update(t, s = -1e9, o = 0, n = 0.016) {
      t < e.time.value && (e.drift.value = 0), e.time.value = t, e.surgeS.value = s, e.speed.value += (o - e.speed.value) * (1 - Math.exp(-3 * n)), e.drift.value += n * 3 * J.MathUtils.smoothstep(e.speed.value, 45, 100);
    }
  };
}
function Hi() {
  let e = new Float32Array(1560),
    t = new Float32Array(520),
    s = new Float32Array(520),
    o = new Float32Array(520),
    n = new Float32Array(520),
    r = new Float32Array(520),
    a = new Float32Array(520),
    l = new Float32Array(520),
    u = 0,
    b = 73211,
    m = NaN,
    d = !1,
    g = 0,
    x = 0,
    w = () => (b = 1664525 * b + 1013904223 >>> 0, b / 4294967296),
    y = new J.BufferGeometry(),
    v = new J.BufferAttribute(e, 3),
    k = new J.BufferAttribute(t, 1),
    f = new J.BufferAttribute(s, 1);
  v.setUsage(J.DynamicDrawUsage), k.setUsage(J.DynamicDrawUsage), f.setUsage(J.DynamicDrawUsage), y.setAttribute("position", v), y.setAttribute("aFade", k), y.setAttribute("aSize", f);
  let L = new J.ShaderMaterial({
      transparent: !0,
      depthWrite: !1,
      blending: J.AdditiveBlending,
      vertexShader: "attribute float aFade;attribute float aSize;varying float vFade;void main(){vFade=aFade;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*90.0/max(1.0,-mv.z),1.0,21.0);}",
      fragmentShader: "varying float vFade;void main(){float r=length(gl_PointCoord-.5)*2.;float edge=1.-smoothstep(.36,1.,r);gl_FragColor=vec4(mix(vec3(.08,.63,.96),vec3(.76,.95,1.),edge),vFade*edge*.72);}"
    }),
    O = new J.Points(y, L);
  O.frustumCulled = !1, O.name = "Spray / wake / finish splash";
  let z = new J.Vector3(),
    G = new J.Vector3(),
    Q = !1,
    ae = (U, K, V, W, Ae, Le) => {
      let q = u++ % 520,
        X = q * 3;
      a[q] <= 0 && x++, e[X] = U.x, e[X + 1] = U.y, e[X + 2] = U.z, o[q] = K, n[q] = V, r[q] = W, a[q] = l[q] = Le, s[q] = Ae, t[q] = 0.85, Q = !0;
    };
  function B(U, K, V, W = 0.016, Ae) {
    W = Math.min(Math.max(0, W), 0.05);
    let Le = x > 0;
    for (let q = 0; q < 520 && x > 0; q++) {
      if (a[q] <= 0) continue;
      a[q] = Math.max(0, a[q] - W), a[q] === 0 && x--;
      let X = q * 3;
      e[X] += o[q] * W, e[X + 1] += n[q] * W, e[X + 2] += r[q] * W, n[q] -= 11 * W, t[q] = (a[q] / l[q]) ** 1.3 * 0.86;
    }
    if (V) {
      if (Number.isFinite(m) && U < m - 30 && (a.fill(0), t.fill(0), x = 0, g = 0, d = !1, Le = !0), Number.isFinite(m) && Math.abs(U - m) > 0.015 && V.grounded && !V.finished) {
        let X = C(V.s, V.route),
          ve = V.normal,
          le = J.MathUtils.smoothstep(V.v, 45, 100),
          ce = (100 + V.v * 4 + V.flow * 80 + (V.crest ? 120 : 0) + Math.abs(V.jet) * 4) * (0.94 + 0.18 * le);
        g += ce * W;
        let he = Math.min(36, Math.floor(g));
        g -= he;
        for (let oe = 0; oe < he; oe++) {
          let pe = (w() - 0.5) * 2.6,
            ue = 0.45 + w() * Math.min(12, V.v * (0.12 + 0.018 * le));
          z.copy(Ae ?? V.position).addScaledVector(X.tangent, -ue).addScaledVector(X.right, pe).addScaledVector(ve, -0.18 + w() * 0.44), G.copy(X.tangent).multiplyScalar(V.v * 0.12).addScaledVector(X.right, pe * 2 + (w() - 0.5) * 3).addScaledVector(ve, 2 + w() * 5 + V.v * 0.035), ae(z, G.x, G.y, G.z, 3 + w() * 6, 0.4 + w() * 0.4);
        }
      }
      if ((V.events.includes("finish") || V.finished) && !d) {
        d = !0;
        let X = V.position.lengthSq() > 0 ? V.position : Z;
        for (let ve = 0; ve < 440; ve++) {
          let le = w() * Math.PI * 2,
            ce = 1 + w() * 9,
            he = 3 + w() * 16;
          ae(X, Math.cos(le) * he + V.velocity.x * 0.25, 8 + w() * 24, Math.sin(le) * he, 8 + w() * 18, 0.65 + w() * 1.05);
          let oe = (u - 1) % 520;
          e[oe * 3] += Math.cos(le) * ce, e[oe * 3 + 2] += Math.sin(le) * ce;
        }
      }
      V.finished || (d = !1);
    }
    m = U, O.visible = x > 0, (Le || x > 0) && (v.needsUpdate = !0, k.needsUpdate = !0), Q && (f.needsUpdate = !0, Q = !1);
  }
  return {
    points: O,
    update: B,
    reset(U = 73211) {
      b = U, u = 0, g = 0, m = NaN, d = !1, x = 0, a.fill(0), t.fill(0), O.visible = !1, k.needsUpdate = !0;
    }
  };
}
import * as ki from "./vendor/001-three-0.185.js";
var et = [{
    name: "Tropical Yellow",
    hex: "#FFC83D",
    trim: "#20272D"
  }, {
    name: "Coral Red",
    hex: "#FF5C57",
    trim: "#FFF4E4"
  }, {
    name: "Hot Magenta",
    hex: "#FF4FA3",
    trim: "#20272D"
  }, {
    name: "Lime",
    hex: "#A7F432",
    trim: "#20272D"
  }, {
    name: "Tangerine",
    hex: "#FF8A2A",
    trim: "#20272D"
  }, {
    name: "Violet",
    hex: "#9B6CFF",
    trim: "#EAF0FF"
  }, {
    name: "Ice White",
    hex: "#EAF7FF",
    trim: "#15263B"
  }, {
    name: "Turquoise Green",
    hex: "#24D6A5",
    trim: "#20272D"
  }],
  fs = new WeakMap();
function tt(i, e = 0) {
  e = Math.max(0, Math.min(7, Math.floor(e))), i.userData.racerColor = e, i.traverse(t => {
    let s = t;
    s.isMesh && (s.material = [s.material].flat().map(o => {
      if (!o.isMeshStandardMaterial) return o;
      let n = o.userData.racerSource ?? o;
      if (!n.map && s.name !== "Tube" && s.name !== "Tube trim") return n;
      let r = fs.get(n);
      if (r || (r = [], fs.set(n, r)), !r[e]) {
        let a = n.clone(),
          l = et[e];
        if (a.userData = {
          ...n.userData,
          racerSource: n,
          shared: !0
        }, !n.map) a.color.set(s.name === "Tube trim" ? l.trim : l.hex), a.emissive.set(l.hex), a.emissiveIntensity = 0.035;else {
          let u = new ki.Color(l.hex),
            b = new ki.Color(l.trim);
          a.onBeforeCompile = m => {
            m.uniforms.uTubeColor = {
              value: u
            }, m.uniforms.uTubeTrim = {
              value: b
            }, m.vertexShader = m.vertexShader.replace("#include <common>", `#include <common>
varying vec3 vRacerLocal;`).replace("#include <begin_vertex>", `#include <begin_vertex>
vRacerLocal=position;`), m.fragmentShader = m.fragmentShader.replace("#include <common>", `#include <common>
varying vec3 vRacerLocal;
uniform vec3 uTubeColor;
uniform vec3 uTubeTrim;`).replace("#include <map_fragment>", `#include <map_fragment>
float lower=1.0-smoothstep(-.075,-.035,vRacerLocal.y);
float annulus=smoothstep(.21,.28,length(vRacerLocal.xz));
float blue=smoothstep(.01,.07,diffuseColor.b-diffuseColor.r)*smoothstep(-.02,.05,diffuseColor.b-diffuseColor.g);
float rubber=lower*annulus*blue;
float stripe=1.0-smoothstep(.011,.021,abs(vRacerLocal.y+.235));
float detail=clamp(dot(diffuseColor.rgb,vec3(.22,.60,.18))*1.5+.62,.65,1.13);
diffuseColor.rgb=mix(diffuseColor.rgb,mix(uTubeColor,uTubeTrim,stripe)*detail,rubber);`).replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
totalEmissiveRadiance+=mix(uTubeColor,uTubeTrim,stripe)*rubber*.14;`);
          }, a.customProgramCacheKey = () => "paradise-racer-rubber-v1";
        }
        r[e] = a;
      }
      return r[e];
    }), s.material.length === 1 && (s.material = s.material[0]));
  });
}
function ht(i, e, t = 0, s = 0, o = !1, n, r, a = 32) {
  let l = Math.max(1, Math.ceil((e - i) / 3)),
    u = [],
    b = [],
    m = [],
    d = [],
    g = [],
    x = [],
    w = [];
  for (let v = 0; v <= l; v++) {
    let k = i + (e - i) * v / l,
      f = C(k, t),
      L = rt(k, t),
      O = Ri(k, t),
      z = Xe(k, L + 10, t).current;
    for (let G = 0; G <= a; G++) {
      let Q = n ?? (o ? -Math.PI : -f.lip),
        ae = r ?? (o ? Math.PI : f.lip),
        B = Q + (ae - Q) * G / a,
        U = a === 1 && n !== void 0 ? B * f.lip : B,
        K = me(k, U, t, s);
      u.push(K.x, K.y, K.z), b.push(B, k), m.push(L), d.push(O), g.push(z), x.push(Xe(k, L, t).current - z);
    }
  }
  for (let v = 0; v < l; v++) for (let k = 0; k < a; k++) {
    let f = v * (a + 1) + k,
      L = f + a + 1;
    w.push(f, L, f + 1, L, L + 1, f + 1);
  }
  let y = new R.BufferGeometry();
  return y.setAttribute("position", new R.Float32BufferAttribute(u, 3)), y.setAttribute("uv", new R.Float32BufferAttribute(b, 2)), y.setAttribute("flow", new R.Float32BufferAttribute(m, 1)), y.setAttribute("jet", new R.Float32BufferAttribute(d, 1)), y.setAttribute("current", new R.Float32BufferAttribute(g, 1)), y.setAttribute("boost", new R.Float32BufferAttribute(x, 1)), y.setIndex(w), y.computeVertexNormals(), y;
}
function so() {
  let i = [];
  for (let e = 0; e < 10; e++) {
    let t = e === 4 || e === 6 ? [1, 2] : [0];
    for (let s of t) for (let o = M[e]; o < M[e] + De[e]; o += 60) {
      let n = Math.min(o + 60, M[e] + De[e]),
        r = C((o + n) / 2, s).closed,
        a = e === 6 && s === 2 ? [[o, Math.min(n, M[6] + Y.lip)], [Math.max(o, M[6] + Y.land), n]] : [[o, n]];
      for (let [l, u] of a) u > l && i.push({
        lo: l,
        hi: u,
        route: s,
        closed: r
      });
    }
  }
  return i;
}
var Yo = Pe({
  id: "paradise-halfpipe",
  name: "Open half-pipe slide segment",
  role: "structure",
  create: () => {
    let i = new R.Group(),
      e = new R.Mesh(ht(M[1] + 40, M[1] + 100, 0, 0), new R.MeshStandardMaterial({
        color: 10467020,
        roughness: 0.26,
        metalness: 0.35,
        side: R.DoubleSide
      })),
      t = new R.Box3().setFromObject(e).getCenter(new R.Vector3());
    return e.position.sub(t), i.add(e), i;
  }
});
function gs(i) {
  let e = new R.Group();
  e.name = "Paradise Plunge \u2014 continuous authored ride", i.add(e);
  let t = new R.MeshStandardMaterial({
    color: 9415106,
    roughness: 0.42,
    metalness: 0.25,
    side: R.DoubleSide,
    emissive: 663091,
    emissiveIntensity: 0.6
  });
  t.onBeforeCompile = f => {
    f.vertexShader = f.vertexShader.replace("#include <common>", `#include <common>
varying vec2 vPanel;`).replace("#include <begin_vertex>", `#include <begin_vertex>
vPanel=uv;`), f.fragmentShader = f.fragmentShader.replace("#include <common>", `#include <common>
varying vec2 vPanel;`).replace("#include <color_fragment>", `#include <color_fragment>
float seam=1.0-smoothstep(0.0,0.05,abs(fract(vPanel.y/4.0)-0.5)*2.0-0.93);
float band=smoothstep(0.02,0.0,abs(fract(vPanel.x*1.6)-0.5)-0.47);
diffuseColor.rgb*=1.0-0.42*seam-0.12*band;`);
  }, t.customProgramCacheKey = () => "pp-shell-seams";
  let s = new R.MeshStandardMaterial({
      color: 2968940,
      roughness: 0.45,
      metalness: 0.5,
      side: R.DoubleSide
    }),
    o = ms(),
    n = o.material,
    r = new R.MeshPhysicalMaterial({
      color: 9427189,
      transparent: !0,
      opacity: 0.14,
      metalness: 0.1,
      roughness: 0.04,
      clearcoat: 1,
      side: R.DoubleSide,
      depthWrite: !1,
      emissive: 734544,
      emissiveIntensity: 0.5
    }),
    a = new R.MeshBasicMaterial({
      color: 16761466
    }),
    l = new R.MeshBasicMaterial({
      color: 8187903
    }),
    u = new R.BoxGeometry(1.1, 0.08, 0.55),
    b = so(),
    m = 0;
  for (let f of b) m += Math.ceil((f.hi - f.lo) / 5) * 2;
  let d = new R.InstancedMesh(u, l, m);
  d.frustumCulled = !1, d.name = "Recessed slide lights";
  let g = new R.Matrix4(),
    x = new R.Quaternion(),
    w = new R.Vector3(1, 1, 1),
    y = 0;
  for (let f of b) {
    let L = (O, z) => {
      let G = new R.Mesh(O, z);
      return G.userData.s = (f.lo + f.hi) / 2, e.add(G), G;
    };
    if (L(ht(f.lo, f.hi, f.route, 0), t), L(ht(f.lo, f.hi, f.route, -0.35, !1, void 0, void 0, 20), s), L(ht(f.lo, f.hi, f.route, 0.13), n), f.closed) L(ht(f.lo, f.hi, f.route, -0.1, !0), r);else {
      let O = C(f.lo, f.route);
      for (let z of [-1, 1]) L(ht(f.lo, f.hi, f.route, 0.05, !1, z * 0.97, z, 1), a);
    }
    for (let O = f.lo + 2.5; O < f.hi; O += 5) for (let z of [-1, 1]) {
      let G = C(O, f.route),
        Q = z * 0.95,
        ae = me(O, Q, f.route, 0.02),
        B = G.up.clone().multiplyScalar(Math.cos(Q)).addScaledVector(G.right, -Math.sin(Q)),
        U = new R.Vector3().crossVectors(G.tangent, B).normalize();
      g.makeBasis(U, B, G.tangent), x.setFromRotationMatrix(g), g.compose(ae, x, w), d.setMatrixAt(y++, g);
    }
  }
  d.count = y, i.add(d);
  let v = [];
  for (let f of Ti) for (let L = f.s; L < f.s + f.len; L += 4) {
    let O = C(L).section === 4 ? 2 : 0,
      z = C(L, O),
      G = -f.side * (z.lip - 0.12),
      Q = me(L, G, O, 0),
      ae = z.up.clone().multiplyScalar(Math.cos(G)).addScaledVector(z.right, -Math.sin(G)),
      B = new R.Vector3().crossVectors(z.tangent, ae).normalize();
    v.push(new R.Matrix4().makeBasis(B, ae, z.tangent).setPosition(Q));
  }
  let k = new R.InstancedMesh(new R.BoxGeometry(1.6, 0.25, 2.6), new R.MeshBasicMaterial({
    color: 15268863
  }), v.length);
  return v.forEach((f, L) => k.setMatrixAt(L, f)), k.frustumCulled = !1, k.name = "Cross-current inlets", i.add(k), {
    group: e,
    water: n,
    shell: t,
    glass: r,
    update(f, L, O = -1e9, z = 0, G = 0.016) {
      o.update(L, O, z, G);
      for (let Q of e.children) Q.visible = Q.userData.s > f - 100 && Q.userData.s < f + 520;
    }
  };
}
function oo() {
  let i = new R.Group(),
    e = new R.MeshStandardMaterial({
      color: 2317792,
      roughness: 0.23,
      metalness: 0.15
    }),
    t = new R.MeshStandardMaterial({
      color: 1055546,
      roughness: 0.7
    }),
    s = new R.MeshStandardMaterial({
      color: 12948343,
      roughness: 0.72
    }),
    o = new R.MeshStandardMaterial({
      color: 1053492,
      roughness: 0.45
    }),
    n = new R.Mesh(new R.TorusGeometry(1.35, 0.46, 14, 48), e);
  n.rotation.x = Math.PI / 2, i.add(n), n.name = "Tube";
  function r(a, l, u, b, m, d, g) {
    let x = new R.Mesh(new R.SphereGeometry(1, 16, 12), a);
    return x.position.set(l, u, b), x.scale.set(m, d, g), i.add(x), x;
  }
  r(t, 0, 0.68, 0.12, 0.63, 0.73, 0.4), r(s, 0, 1.64, 0.04, 0.47, 0.52, 0.44), r(o, 0, 1.9, 0.12, 0.53, 0.39, 0.51);
  for (let a of [-1, 1]) r(s, a * 0.75, 0.59, -0.1, 0.4, 0.19, 0.24);
  return i;
}
var At = null;
async function ys() {
  try {
    let e = (await new io().loadAsync("./assets/020-modelsrider-avatar-074e2f68-503a-40bc-8e71-473383fd635c.gltf-bina")).scene,
      t = new R.Box3().setFromObject(e),
      s = t.getSize(new R.Vector3()),
      o = t.getCenter(new R.Vector3()),
      n = 3.7 / Math.max(s.x, s.z);
    e.scale.setScalar(n), e.position.set(-o.x * n, -t.min.y * n - 0.55, -o.z * n), e.traverse(a => {
      if (a.isMesh) {
        let l = a,
          u = [l.material].flat();
        u.some(b => b.normalMap) && !l.geometry.hasAttribute("tangent") && l.geometry.computeTangents(), l.geometry.userData.shared = !0;
        for (let b of u) b.userData.shared = !0, b.envMapIntensity = 0.6, b.precision = "highp";
      }
    });
    let r = new R.Group();
    r.add(e), r.rotation.y = -Math.PI / 2, At = r;
  } catch (i) {
    console.warn("Rider model unavailable, using procedural rider", i);
  }
}
var Wt = Pe({
    id: "paradise-rider",
    name: "Remix-style tube rider",
    role: "player",
    create: () => {
      At || (At = oo(), At.traverse(e => {
        let t = e;
        if (t.isMesh) {
          t.geometry.userData.shared = !0;
          for (let s of [t.material].flat()) s.userData.shared = !0;
        }
      }));
      let i = new R.Group();
      return i.add(At.clone()), tt(i, 0), i;
    }
  }),
  bs = new WeakMap();
function vs(i, e, t, s, o, n = 0, r = 1 / 60) {
  i.position.copy(o);
  let a = Si(Math.min(D, e), t, s),
    l = bs.get(i);
  l ? (l.slerp(a, 1 - Math.exp(-14 * r)), i.quaternion.copy(l)) : (bs.set(i, a.clone()), i.quaternion.copy(a));
  let u = 1 - n * 0.1;
  i.scale.set(1 + n * 0.05, u, 1 + n * 0.05);
}
import * as p from "./vendor/001-three-0.185.js";
import { GLTFLoader as no } from "./vendor/011-GLTFLoader.js";
var ro = new no();
async function ao(i) {
  return i;
}
function pt(i) {
  return ro.loadAsync(i).then(e => (e.scene.traverse(t => {
    let s = t;
    if (s.isMesh) {
      s.geometry.userData.shared = !0;
      for (let o of [s.material].flat()) o.userData.shared = !0;
    }
  }), e.scene)).catch(e => (console.warn("Model failed", i, e), null));
}
function ut(i, e) {
  let t = new p.Box3().setFromObject(i),
    s = t.getSize(new p.Vector3()),
    o = t.getCenter(new p.Vector3()),
    n = e / Math.max(s.x, s.z),
    r = new p.Group();
  return i.scale.multiplyScalar(n), i.position.set(-o.x * n, -t.min.y * n, -o.z * n), r.add(i), r;
}
function lo(i, e = 1024, t = 512) {
  let s = document.createElement("canvas");
  s.width = e, s.height = t;
  let o = s.getContext("2d");
  o.fillStyle = "#07182c", o.fillRect(0, 0, e, t), o.strokeStyle = "#ffc27a", o.lineWidth = 6, o.strokeRect(10, 10, e - 20, t - 20);
  let n = i.reduce((l, u) => l + u.size * 1.25, 0),
    r = (t - n) / 2;
  o.textAlign = "center", o.textBaseline = "top";
  for (let l of i) {
    let u = l.size;
    for (o.font = `${l.weight ?? 700} ${u}px Arial, sans-serif`; o.measureText(l.text).width > e - 70 && u > 10;) u -= 4, o.font = `${l.weight ?? 700} ${u}px Arial, sans-serif`;
    o.fillStyle = l.color, o.shadowColor = l.color, o.shadowBlur = l.size * 0.25, o.fillText(l.text, e / 2, r), r += l.size * 1.25;
  }
  let a = new p.CanvasTexture(s);
  return a.colorSpace = p.SRGBColorSpace, a.anisotropy = 4, a;
}
function Ai(i, e, t) {
  let s = new p.MeshBasicMaterial({
    map: lo(i),
    side: p.DoubleSide,
    toneMapped: !1
  });
  return new p.Mesh(new p.PlaneGeometry(e, t), s);
}
var co = Pe({
  id: "paradise-launch-sign",
  name: "Tropical Waters presents Paradise Plunge",
  role: "signage",
  create: () => Ai([{
    text: "TROPICAL WATERS",
    size: 54,
    color: "#ffd79c"
  }, {
    text: "presents",
    size: 34,
    color: "#bfe9f2",
    weight: 400
  }, {
    text: "PARADISE PLUNGE",
    size: 128,
    color: "#8ff4ff",
    weight: 900
  }], 20, 10)
});
function dt(i, e, t, s, o = 0) {
  let n = C(e);
  return i.position.copy(n.p).addScaledVector(n.tangent.clone().setY(0).normalize(), Math.min(0, e)).addScaledVector(n.right, t).add(new p.Vector3(0, s, 0)), i.rotation.y = Math.atan2(-n.tangent.x, -n.tangent.z) + o, i;
}
async function Es(i) {
  i.background = new p.Color(330013), i.fog = new p.FogExp2(528168, 22e-5);
  let e = new p.HemisphereLight(5464462, 463643, 0.46),
    t = new p.DirectionalLight(10139884, 0.72);
  i.add(e, t, t.target);
  let s = new p.PointLight(8382207, 16, 40, 1.6);
  i.add(s);
  let o = new p.PointLight(16757611, 9e3, 2600, 1.8);
  o.position.copy(Z).add(new p.Vector3(0, 120, 0)), i.add(o);
  let n = new p.Mesh(new p.SphereGeometry(8e3, 32, 16), new p.ShaderMaterial({
    side: p.BackSide,
    depthWrite: !1,
    fog: !1,
    uniforms: {
      time: {
        value: 0
      }
    },
    vertexShader: "varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform float time;varying vec3 v;float h(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453);}void main(){float y=v.y;vec3 c=mix(vec3(.012,.019,.052),vec3(.002,.004,.016),smoothstep(-.05,.6,y));c=mix(c,vec3(.035,.032,.077),exp(-abs(y)*14.)*.6);vec3 q=floor(v*900.);float s=step(.9975,h(q))*smoothstep(.02,.3,y);float phase=h(q+13.7)*6.283;float twinkle=.87+.13*sin(time*(.22+.34*h(q+7.1))+phase);gl_FragColor=vec4(c+s*twinkle*vec3(.9,.95,1.),1.);}"
  }));
  n.renderOrder = -1, i.add(n);
  let r = Z.clone().sub(C(0).p).setY(0).normalize(),
    a = Z.clone().addScaledVector(r, 5200).add(new p.Vector3(1200, 1500, 0)),
    l = new p.Mesh(new p.SphereGeometry(150, 32, 16), new p.MeshBasicMaterial({
      color: 16774872,
      fog: !1,
      toneMapped: !1
    }));
  l.position.copy(a), i.add(l);
  let u = new p.Sprite(new p.SpriteMaterial({
    color: 10470911,
    transparent: !0,
    opacity: 0.2,
    fog: !1,
    depthWrite: !1,
    blending: p.AdditiveBlending,
    map: xs()
  }));
  u.scale.setScalar(1300), u.position.copy(a), i.add(u), t.position.copy(a), t.target.position.copy(Z);
  let b = new p.Mesh(new p.PlaneGeometry(26e3, 26e3), new p.ShaderMaterial({
    fog: !1,
    uniforms: {
      time: {
        value: 0
      },
      moon: {
        value: a
      }
    },
    vertexShader: "varying vec3 w;void main(){vec4 p=modelMatrix*vec4(position,1.);w=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}",
    fragmentShader: "uniform float time;uniform vec3 moon;varying vec3 w;void main(){vec3 view=normalize(w-cameraPosition);vec3 toM=normalize(moon-w);vec3 n=normalize(vec3(sin(w.x*.02+time*.7)*.05+sin(w.z*.013-time)*.04,1.,sin(w.z*.021+time*.6)*.05));vec3 r=reflect(view,n);float glint=pow(max(dot(r,toM),0.),260.);float ripple=.5+.5*sin(w.x*.05+w.z*.03+time*1.3);float dist=length(w.xz-cameraPosition.xz);vec3 c=mix(vec3(.003,.012,.032),vec3(.009,.026,.061),pow(1.-max(-view.y,0.),6.));c+=glint*vec3(.48,.62,.82)*1.2*ripple;c=mix(c,vec3(.013,.022,.053),smoothstep(3000.,12000.,dist));gl_FragColor=vec4(c,1.);}"
  }));
  b.rotation.x = -Math.PI / 2, b.position.set(Z.x, Z.y - 22, Z.z), i.add(b);
  let m = [];
  for (let c = 0; c <= D; c += 15) m.push(C(c).p);
  let d = new p.Box3().setFromPoints(m).expandByScalar(900),
    g = 150,
    x = new p.PlaneGeometry(d.max.x - d.min.x, d.max.z - d.min.z, g, g);
  x.rotateX(-Math.PI / 2);
  let w = (d.min.x + d.max.x) / 2,
    y = (d.min.z + d.max.z) / 2,
    v = x.attributes.position,
    k = [],
    f = (d.max.x - d.min.x) / g,
    L = (d.max.z - d.min.z) / g,
    O = T.radius + 80 + Math.hypot(f, L),
    z = (c, E) => {
      let A = -1e9,
        S = 1e9;
      for (let H of m) {
        let j = Math.hypot(H.x - c, H.z - E);
        A = Math.max(A, H.y - 34 - 0.42 * Math.max(0, j - 25)), S = Math.min(S, H.y - 24 + 0.9 * Math.max(0, j - 14));
      }
      let I = Math.sin(c * 0.011) * Math.cos(E * 0.009) * 28 + Math.sin(c * 0.031 + E * 0.02) * 9,
        F = Math.max(0, Math.hypot(c - T.center.x, E - T.center.z) - O),
        P = T.y - 10 + 0.38 * F * F / (F + 220);
      return Math.min(P, Math.max(Z.y - 40, Math.min(S, A + I)));
    },
    G = c => {
      let E = Math.hypot(c.x - T.center.x, c.z - T.center.z);
      if (E > T.radius + 220) return;
      let A = p.MathUtils.clamp(Math.floor((c.x - d.min.x) / f), 0, g - 1),
        I = p.MathUtils.clamp(Math.floor((c.z - d.min.z) / L), 0, g - 1) * (g + 1) + A,
        F = Math.max(v.getY(I), v.getY(I + 1), v.getY(I + g + 1), v.getY(I + g + 2)),
        P = E <= T.radius + 44 ? T.y + 0.25 : -1 / 0;
      c.y = Math.max(c.y, F + 4, P + 4);
    };
  for (let c = 0; c < v.count; c++) {
    let E = v.getX(c) + w,
      A = v.getZ(c) + y,
      S = z(E, A);
    v.setXYZ(c, E, S, A);
    let I = 0.5 + 0.5 * Math.sin(E * 0.05 + A * 0.03),
      F = p.MathUtils.clamp((S - Z.y) / 1300, 0, 1),
      P = new p.Color().setRGB(0.02 + 0.03 * I * F, 0.07 + 0.05 * (1 - F), 0.06 + 0.04 * F);
    k.push(P.r, P.g, P.b);
  }
  x.setAttribute("color", new p.Float32BufferAttribute(k, 3)), x.computeVertexNormals();
  let Q = new p.Mesh(x, new p.MeshStandardMaterial({
    vertexColors: !0,
    roughness: 0.95,
    metalness: 0
  }));
  Q.name = "Tropical mountain", i.add(Q);
  let ae = new p.MeshStandardMaterial({
    color: 727594,
    roughness: 1,
    flatShading: !0
  });
  for (let c = 0; c < 14; c++) {
    let E = c / 14 * Math.PI * 2,
      A = 3800 + c % 3 * 900,
      S = new p.Mesh(new p.ConeGeometry(900 + c * 137 % 700, 700 + c * 211 % 900, 7, 1), ae);
    S.position.set(Z.x + Math.cos(E) * A, Z.y - 30 + (700 + c * 211 % 900) / 2, Z.z + Math.sin(E) * A), S.rotation.y = c, i.add(S);
  }
  for (let c = 0; c < 5; c++) {
    let E = new p.Mesh(new p.ConeGeometry(180 + c * 40, 120 + c * 30, 8), ae);
    E.position.copy(Z).addScaledVector(r, 1600 + c * 700).add(new p.Vector3((c - 2) * 650, -10, 0)), i.add(E);
  }
  let B = [[], []];
  for (let c = 0; c <= D; c += 6) for (let E of [0, 1]) B[E].push(me(c, (E ? 1 : -1) * C(c).lip, 0, -0.1));
  for (let c of B) {
    let E = new p.Line(new p.BufferGeometry().setFromPoints(c), new p.LineBasicMaterial({
      color: 16761982,
      transparent: !0,
      opacity: 0.75
    }));
    i.add(E);
  }
  let [U, K, V, W, Ae, Le] = await Promise.all([pt("./assets/019-modelsparadise-support-tower-cf1869d9paradise-support-tower.gltf-"), pt("./assets/018-modelsparadise-royal-palm-03217fffparadise-royal-palm.gltf-binary"), pt("./assets/021-modelssummit-launch-platform-50024893-12f7-4020-8444-1132b5944a52-6Dre"), pt("./assets/022-modelstropical-waters-resort-0d44e555-5261-496e-8ea3-a7c3dfdee267-Yr9S"), pt("./assets/016-modelscliff-rock-formation-64d95cf1-8cec-4103-bace-3f00dd4db8e3.g"), pt("./assets/017-modelsinflatable-tube-cca9bcbc-cb67-4c69-abd1-0cace08e7c05.gltf-b")]),
    q = [],
    X = (c, E, A, S) => {
      c.updateMatrixWorld(!0);
      let I = new Map();
      E.forEach((F, P) => {
        let H = S ? S[P] : -1;
        I.has(H) || I.set(H, []), I.get(H).push(F);
      }), c.traverse(F => {
        let P = F;
        if (!P.isMesh) return;
        let H = P.matrixWorld.clone();
        for (let [j, te] of I) {
          let ie = new p.InstancedMesh(P.geometry, P.material, te.length);
          te.forEach((zt, Tt) => ie.setMatrixAt(Tt, zt.clone().multiply(H))), ie.name = A, ie.frustumCulled = !1, i.add(ie), j >= 0 && q.push({
            mesh: ie,
            section: j
          });
        }
      });
    };
  if (U) {
    let c = ut(U, 6),
      E = [];
    for (let A = 40; A < D - 40; A += 48) {
      let S = C(A);
      if (S.gap) continue;
      let I = S.p.y,
        F = z(S.p.x, S.p.z),
        P = I - F;
      if (P < 8) continue;
      let H = new p.Box3().setFromObject(c),
        j = H.max.y,
        te = Math.atan2(-S.tangent.x, -S.tangent.z);
      E.push(new p.Matrix4().compose(new p.Vector3(S.p.x, F, S.p.z), new p.Quaternion().setFromEuler(new p.Euler(0, te, 0)), new p.Vector3(1.4, P / j, 1)));
    }
    X(c, E, "Slide support towers");
  }
  if (K) {
    let c = ut(K, 12),
      E = [],
      A = [],
      S = 7,
      I = () => (S = S * 16807 % 2147483647, S / 2147483647);
    for (let P = 60; P < D; P += 17) {
      let H = C(P);
      if (H.section !== 3) for (let j of [-1, 1]) {
        if (I() < 0.4) continue;
        let te = j * (16 + I() * 55),
          ie = H.p.clone().addScaledVector(H.right, te),
          zt = z(ie.x, ie.z);
        if (H.p.y - zt > 60) continue;
        let Tt = 0.8 + I() * 0.8;
        A.push(H.section), E.push(new p.Matrix4().compose(new p.Vector3(ie.x, zt, ie.z), new p.Quaternion().setFromEuler(new p.Euler(0, I() * 6.3, 0)), new p.Vector3(Tt, Tt, Tt)));
      }
    }
    X(c, E, "Jungle palms", A);
    let F = [];
    for (let P = 0; P < 18; P++) {
      let H = P / 18 * Math.PI * 2;
      if (Math.cos(H) * T.dir.x + Math.sin(H) * T.dir.z < -0.88) continue;
      let te = T.radius + 22,
        ie = 1.35 + P % 3 * 0.16;
      F.push(new p.Matrix4().compose(new p.Vector3(T.center.x + Math.cos(H) * te, T.y + 0.5, T.center.z + Math.sin(H) * te), new p.Quaternion().setFromEuler(new p.Euler(0, P * 2.3, 0)), new p.Vector3(ie, ie, ie)));
    }
    X(c, F, "Splashdown palms");
  }
  if (V) {
    let c = ut(V, 30);
    dt(c, -34, 0, -7), i.add(c);
  }
  let ve = co.create();
  dt(ve, 40, 0, 15), i.add(ve);
  let le = new p.MeshStandardMaterial({
    color: 1254975,
    metalness: 0.6,
    roughness: 0.4
  });
  for (let c of [-10.5, 10.5]) {
    let E = new p.Mesh(new p.BoxGeometry(0.8, 19, 0.8), le);
    dt(E, 40, c, 9.5), i.add(E);
  }
  let ce = Ai([{
    text: "THE SPLIT",
    size: 64,
    color: "#ffd79c"
  }, {
    text: "\u25C4 SHELTERED  \xB7  EXPERT \u25BA",
    size: 70,
    color: "#8ff4ff",
    weight: 800
  }], 14, 7);
  dt(ce, M[4] - 45, 0, 15), i.add(ce);
  let he = Ai([{
    text: "THE GAP",
    size: 64,
    color: "#ffd79c"
  }, {
    text: "\u25C4 CONTINUOUS CHUTE \xB7 OPEN GAP \u25BA",
    size: 56,
    color: "#8ff4ff",
    weight: 800
  }, {
    text: "CARRY SPEED",
    size: 44,
    color: "#ffe1b0"
  }], 14, 7);
  dt(he, M[6] - 45, 0, 15), i.add(he);
  let oe = C(D),
    pe = T.center.clone();
  if (W) {
    let c = ut(W, 360);
    c.position.copy(pe).addScaledVector(oe.tangent.clone().setY(0).normalize(), 310).setY(T.y - 1), c.rotation.y = Math.atan2(-oe.tangent.x, -oe.tangent.z), c.traverse(E => {
      let A = E;
      if (A.isMesh) {
        let S = A.material;
        S.map && (S.emissiveMap = S.map, S.emissive = new p.Color(16762512), S.emissiveIntensity = 0.55);
      }
    }), i.add(c);
  }
  let ue = {
      value: 0
    },
    Ye = new p.MeshBasicMaterial({
      color: 16761466,
      toneMapped: !1
    });
  Ye.onBeforeCompile = c => {
    c.uniforms.uResortTime = ue, c.vertexShader = c.vertexShader.replace("#include <common>", `#include <common>
varying float vLightPhase;`).replace("#include <begin_vertex>", `#include <begin_vertex>
vLightPhase=dot(instanceMatrix[3].xyz,vec3(.017,.071,.029));`), c.fragmentShader = c.fragmentShader.replace("#include <common>", `#include <common>
uniform float uResortTime;
varying float vLightPhase;`).replace("#include <color_fragment>", `#include <color_fragment>
diffuseColor.rgb*=.94+.06*sin(uResortTime*.28+vLightPhase);`);
  };
  let Ge = new p.InstancedMesh(new p.SphereGeometry(1.4, 6, 4), Ye, 900),
    Ce = 3,
    xe = () => (Ce = Ce * 16807 % 2147483647, Ce / 2147483647),
    Ee = new p.Matrix4();
  for (let c = 0; c < 900; c++) {
    let E = xe() * Math.PI * 2,
      A = 60 + xe() * 620,
      S = pe.x + Math.cos(E) * A + oe.tangent.x * 380,
      I = pe.z + Math.sin(E) * A + oe.tangent.z * 380;
    Ee.makeTranslation(S, Z.y - 28 + xe() * (c % 5 === 0 ? 60 : 6), I), Ge.setMatrixAt(c, Ee);
  }
  if (Ge.frustumCulled = !1, i.add(Ge), Le) {
    let c = ut(Le.clone(), 3.4);
    dt(c, -8, 6, -5.5), i.add(c);
  }
  let vt = new p.ShaderMaterial({
      transparent: !0,
      depthWrite: !1,
      side: p.DoubleSide,
      uniforms: {
        time: {
          value: 0
        }
      },
      vertexShader: "varying vec2 u;void main(){u=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader: "uniform float time;varying vec2 u;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}void main(){float s=n(vec2(u.x*26.,u.y*6.+time*3.2))*.6+n(vec2(u.x*60.,u.y*14.+time*5.))*.4;float edge=smoothstep(0.,.12,u.x)*smoothstep(1.,.88,u.x);vec3 c=mix(vec3(.12,.45,.7),vec3(.85,.97,1.),smoothstep(.45,.85,s));gl_FragColor=vec4(c,edge*(.45+.5*s)*smoothstep(0.,.08,u.y));}"
    }),
    xt = new p.SpriteMaterial({
      map: xs(),
      color: 11068671,
      transparent: !0,
      opacity: 0.22,
      depthWrite: !1
    }),
    Et = [],
    wt = [],
    st = [];
  for (let c = 0; c < 7; c++) {
    let E = M[8] + 50 + c * 85,
      A = C(E),
      S = c % 2 ? 1 : -1,
      I = A.p.clone().addScaledVector(A.right, S * (34 + c % 3 * 10)),
      F = z(I.x, I.z),
      P = Math.max(40, A.p.y - F + 45);
    st.push(A.section), wt.push(new p.Matrix4().compose(new p.Vector3(I.x, F - 4, I.z), new p.Quaternion().setFromEuler(new p.Euler(0, c * 1.7, 0)), new p.Vector3(1, P / 60, 1)));
    let H = new p.Mesh(new p.PlaneGeometry(9 + c % 3 * 4, P, 1, 1), vt);
    H.position.set(I.x, F + P / 2, I.z).addScaledVector(A.right, -S * 14), H.rotation.y = Math.atan2(A.right.x, A.right.z) + Math.PI / 2, i.add(H);
    for (let te = 0; te < 3; te++) {
      let ie = new p.Sprite(xt);
      ie.scale.setScalar(26 + te * 8), ie.position.set(H.position.x, F + 6 + te * 6, H.position.z), Et.push({
        sprite: ie,
        y: ie.position.y,
        size: 26 + te * 8,
        phase: c * 2.4 + te
      }), i.add(ie);
    }
    let j = new p.PointLight(8050943, 5e3, 120, 1.5);
    j.position.set(H.position.x, F + 10, H.position.z), c % 3 === 0 && i.add(j);
  }
  for (let c of [M[1] + 300, M[2] + 260, M[5] + 400, M[9] + 200]) {
    let E = C(c);
    for (let A of [-1, 1]) {
      let S = E.p.clone().addScaledVector(E.right, A * 48),
        I = z(S.x, S.z);
      st.push(E.section), wt.push(new p.Matrix4().compose(new p.Vector3(S.x, I - 4, S.z), new p.Quaternion().setFromEuler(new p.Euler(0, c, 0)), new p.Vector3(0.8, Math.max(0.8, (E.p.y - I + 10) / 60), 0.8)));
    }
  }
  if (Ae) {
    let c = ut(Ae, 48),
      E = new p.Box3().setFromObject(c).getSize(new p.Vector3());
    c.scale.y = 60 / E.y, X(c, wt, "Paradise Falls cliffs", st);
  }
  let ni = matchMedia("(prefers-reduced-motion: reduce)");
  return {
    keepCameraClear: G,
    update(c, E, A, S) {
      let I = ni.matches ? 0 : S ?? performance.now() / 1e3;
      n.material.uniforms.time.value = I, ue.value = I;
      for (let P of Et) P.sprite.position.y = P.y + Math.sin(I * 0.45 + P.phase) * 0.9, P.sprite.scale.setScalar(P.size * (1 + 0.025 * Math.sin(I * 0.37 + P.phase)));
      b.material.uniforms.time.value = c, vt.uniforms.time.value = c, s.position.copy(A).add(new p.Vector3(0, 5, 0));
      let F = C(E).section;
      for (let P of q) P.mesh.visible = P.section >= F - 1 && P.section <= F + 1;
    }
  };
}
var _t = null;
function xs() {
  if (_t) return _t;
  let i = document.createElement("canvas");
  i.width = i.height = 128;
  let e = i.getContext("2d"),
    t = e.createRadialGradient(64, 64, 0, 64, 64, 64);
  return t.addColorStop(0, "rgba(255,255,255,1)"), t.addColorStop(0.4, "rgba(255,255,255,.35)"), t.addColorStop(1, "rgba(255,255,255,0)"), e.fillStyle = t, e.fillRect(0, 0, 128, 128), _t = new p.CanvasTexture(i), _t;
}
var jt = class {
  root;
  menuPanel;
  resultsPanel;
  lobbyPanel;
  hud;
  timeValue;
  speedValue;
  flowValue;
  chainValue;
  section;
  sectionName;
  sectionPosition;
  skill;
  resultTime;
  resultScore;
  resultRanking;
  replayButton;
  leaveTeamButton;
  resultLanding;
  landingGuide;
  resultFlow;
  resultCrests;
  resultAir;
  resultClean;
  resultSpeed;
  resultChain;
  lobbyTitle;
  lobbyNames;
  lobbyStart;
  lobbyInvite;
  lobbyLeave;
  desktopControls;
  mobileControls;
  mobileSteer;
  mobileLeft;
  mobileRight;
  mobile = !1;
  layoutPending = !1;
  mode = "menu";
  lobbyVisible = !1;
  lastSection = "";
  sectionUntil = 0;
  noticeText = "";
  noticeUntil = 0;
  constructor(e) {
    if (!document.getElementById("paradise-plunge-ui-styles")) {
      let B = document.createElement("style");
      B.id = "paradise-plunge-ui-styles", B.textContent = `
        .pp-ui { position:fixed; inset:0; width:100%; height:100%; box-sizing:border-box; z-index:15; pointer-events:none; overflow:hidden; color:#f5f7f4; font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; -webkit-font-smoothing:antialiased; font-variant-numeric:tabular-nums; }
        .pp-ui *, .pp-ui *::before, .pp-ui *::after { box-sizing:border-box; }
        .pp-ui [hidden] { display:none !important; }
        .pp-panel-slot { position:absolute; inset:0; display:flex; align-items:center; justify-content:flex-start; padding:clamp(16px,4.6vw,76px); pointer-events:none; }
        .pp-panel { pointer-events:auto; width:min(425px,100%); max-height:100%; overflow-y:auto; scrollbar-width:thin; border:1px solid rgba(191,232,235,.19); border-radius:4px; padding:clamp(25px,3.6vw,44px); background:linear-gradient(125deg,rgba(8,27,45,.93),rgba(7,24,40,.82)); box-shadow:0 22px 80px rgba(1,9,24,.29), inset 0 1px rgba(241,246,230,.10); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); }
        .pp-eyebrow { display:block; color:#d8bf8d; font-size:10px; font-weight:750; letter-spacing:.29em; text-transform:uppercase; line-height:1.5; }
        .pp-present { color:#a8bfca; font-size:11px; letter-spacing:.2em; margin:8px 0 13px; }
        .pp-title { margin:0; font-size:clamp(35px,4vw,54px); font-weight:760; letter-spacing:-.058em; line-height:.97; text-transform:uppercase; text-wrap:balance; }
        .pp-title span { display:block; color:#8fedef; }
        .pp-title span:first-child { color:#f5f7f4; font-size:.58em; font-weight:660; letter-spacing:.05em; margin-bottom:7px; }
        .pp-rule { height:1px; background:linear-gradient(90deg,rgba(158,232,234,.55),rgba(158,232,234,0)); margin:25px 0 20px; }
        .pp-tagline { color:#d7e5e7; margin:0 0 21px; font-size:13px; line-height:1.6; max-width:33ch; }
        .pp-controls { display:flex; flex-wrap:wrap; align-items:center; gap:10px 14px; margin-bottom:26px; color:#bad0d8; font-size:11px; font-weight:650; letter-spacing:.10em; text-transform:uppercase; }
        .pp-control { white-space:nowrap; display:inline-flex; align-items:center; gap:7px; }
        .pp-key { display:inline-block; padding:4px 6px; min-width:25px; text-align:center; color:#f3f8f5; border:1px solid rgba(188,235,236,.42); border-radius:3px; background:rgba(169,234,236,.07); font-size:10px; line-height:1; letter-spacing:0; }
        .pp-actions { display:flex; align-items:stretch; flex-direction:column; gap:9px; }
        .pp-button { display:inline-flex; justify-content:center; align-items:center; min-height:44px; width:100%; padding:11px 16px; border:1px solid transparent; border-radius:3px; font-family:inherit; font-size:11px; font-weight:750; line-height:1.2; letter-spacing:.16em; text-transform:uppercase; cursor:pointer; transition:background .16s,border-color .16s,transform .16s; }
        .pp-button:hover:not(:disabled) { transform:translateY(-2px); }
        .pp-button:focus-visible { outline:2px solid #d8bf8d; outline-offset:3px; }
        .pp-button:disabled { opacity:.42; cursor:not-allowed; }
        .pp-button-primary { background:#9de8e9; color:#092739; }
        .pp-button-primary:hover:not(:disabled) { background:#c6f5ed; }
        .pp-button-secondary { background:rgba(6,28,42,.15); color:#edf7f6; border-color:rgba(191,231,231,.36); }
        .pp-button-secondary:hover:not(:disabled) { background:rgba(179,237,236,.12); border-color:#9de8e9; }
        .pp-footnote { margin:16px 0 0; color:#93aab5; font-size:10px; letter-spacing:.03em; line-height:1.5; }
        .pp-hud { position:absolute; top:clamp(16px,3.3vw,40px); left:clamp(17px,3.9vw,58px); right:clamp(17px,3.9vw,58px); display:flex; width:max-content; max-width:calc(100% - 34px); align-items:stretch; flex-wrap:wrap; gap:12px clamp(12px,2.4vw,30px); padding:10px 17px 12px; border-left:2px solid #8be4e6; background:linear-gradient(90deg,rgba(5,25,43,.72),rgba(5,25,43,.38) 70%,transparent); text-shadow:0 1px 7px rgba(0,11,27,.9); }
        .pp-hud-cell { min-width:65px; }
        .pp-hud-label { display:block; color:#abc5c9; font-size:9px; font-weight:750; text-transform:uppercase; letter-spacing:.20em; margin-bottom:3px; }
        .pp-hud-value { display:block; font-size:clamp(15px,1.6vw,21px); font-weight:680; letter-spacing:-.035em; line-height:1.1; white-space:nowrap; }
        .pp-hud-value small { font-size:10px; font-weight:650; color:#c0d5d8; letter-spacing:.05em; }
        .pp-section { position:absolute; bottom:clamp(25px,5vh,55px); left:50%; width:max-content; max-width:calc(100% - 36px); transform:translateX(-50%); text-align:center; text-shadow:0 2px 12px #05182b; transition:opacity .32s ease; }
        .pp-section::before { content:''; display:block; width:40px; height:1px; margin:0 auto 10px; background:#d2bd94; }
        .pp-section-label { display:block; color:#d6c59e; font-size:9px; font-weight:750; letter-spacing:.27em; text-transform:uppercase; }
        .pp-section-name { display:block; margin-top:5px; font-size:clamp(16px,2vw,24px); font-weight:730; letter-spacing:.11em; text-transform:uppercase; }
        .pp-section-position { display:block; margin-top:4px; color:#b9d8d9; font-size:10px; letter-spacing:.16em; text-transform:uppercase; }
        .pp-skill { position:absolute; top:24%; right:clamp(17px,4vw,60px); max-width:min(320px,43vw); color:#bef4ef; text-align:right; font-size:clamp(13px,1.4vw,19px); font-weight:760; letter-spacing:.15em; text-transform:uppercase; text-shadow:0 2px 14px #061626; transition:opacity .22s ease; }
        .pp-skill.pp-wipeout { top:30%; left:50%; right:auto; transform:translateX(-50%); max-width:94%; color:#ffd5ac; background:linear-gradient(90deg,transparent,rgba(5,18,30,.85),transparent); padding:12px 22px; text-align:center; white-space:nowrap; font-size:clamp(18px,2.4vw,30px); letter-spacing:.1em; }
        @media(prefers-reduced-motion:reduce) { .pp-section,.pp-skill,.pp-button { transition:none; } }
        .pp-results-head { margin:0 0 5px; color:#adf1eb; font-size:clamp(29px,3vw,40px); font-weight:760; letter-spacing:-.045em; line-height:1.05; text-transform:uppercase; }
        .pp-result-hero { display:flex; justify-content:space-between; align-items:end; gap:12px; padding:17px 0; border-top:1px solid rgba(197,229,228,.24); border-bottom:1px solid rgba(197,229,228,.24); margin:20px 0; }
        .pp-result-big { display:block; margin-top:4px; color:#f6f8f1; font-size:clamp(22px,3vw,34px); font-weight:740; letter-spacing:-.035em; white-space:nowrap; }
        .pp-result-score { color:#d7c292; text-align:right; }
        .pp-result-score .pp-result-big { color:#e7d4a9; }
        .pp-result-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:17px 10px; margin:0 0 25px; }
        .pp-result-grid .pp-hud-value { font-size:18px; margin-top:5px; }
        .pp-ranking { color:#d8bf8d; font-size:11px; letter-spacing:.10em; text-transform:uppercase; margin:0 0 17px; }
        .pp-lobby-title { color:#eaf7f4; font-size:clamp(23px,2.6vw,34px); letter-spacing:-.03em; line-height:1.1; margin:10px 0 6px; overflow-wrap:anywhere; }
        .pp-lobby-list { list-style:none; padding:0; margin:20px 0 24px; border-top:1px solid rgba(190,231,230,.23); }
        .pp-lobby-list li { display:flex; align-items:center; gap:10px; padding:11px 0; border-bottom:1px solid rgba(190,231,230,.17); color:#e8f2f2; font-size:13px; overflow-wrap:anywhere; }
        .pp-lobby-list li::before { content:''; display:block; flex:none; width:5px; height:5px; border-radius:50%; background:var(--racer-color,#9ce7e6); box-shadow:0 0 6px var(--racer-color,#9ce7e6); }
        @media(max-width:600px) { .pp-panel-slot { padding:16px; align-items:center; } .pp-panel { width:min(390px,100%); padding:25px; } .pp-hud { gap:10px 17px; padding:8px 10px; } .pp-hud-cell { min-width:56px; } .pp-skill { top:auto; bottom:22%; right:17px; max-width:calc(100% - 34px); } }
        @media(max-width:360px) { .pp-panel { padding:20px; } .pp-title { font-size:clamp(23px,8.5vw,34px); } .pp-result-hero { gap:7px; } .pp-result-big { font-size:22px; } }
        @media(max-height:560px) { .pp-panel-slot { align-items:flex-start; padding-top:12px; padding-bottom:12px; } .pp-panel { padding-top:19px; padding-bottom:19px; } .pp-rule { margin:12px 0; } .pp-tagline { margin-bottom:12px; } .pp-controls { margin-bottom:14px; } .pp-section { bottom:12px; } }
      `, B.textContent += `
        .pp-ui.pp-mobile .pp-panel-slot { padding:16px; }
        .pp-ui.pp-mobile .pp-panel { touch-action:pan-y; overscroll-behavior:contain; }
        .pp-ui.pp-mobile .pp-button:hover { transform:none; }
        .pp-ui.pp-mobile .pp-section { bottom:calc(var(--pp-bottom,0px) + 24px); }
        .pp-ui.pp-mobile .pp-section-name { letter-spacing:.055em; }
        .pp-ui.pp-mobile .pp-section-position { line-height:1.5; overflow-wrap:anywhere; }
        .pp-ui.pp-mobile .pp-landing-guide { bottom:calc(var(--pp-bottom,0px) + 160px)!important; gap:7px!important; font-size:10px!important; }
        .pp-ui.pp-mobile .pp-section { bottom:calc(var(--pp-bottom,0px) + 105px); }
        .pp-mobile-steer { position:absolute; bottom:calc(var(--pp-bottom,0px) + 16px); left:calc(var(--pp-left,0px) + 16px); right:calc(var(--pp-right,0px) + 16px); display:flex; justify-content:space-between; pointer-events:none; }
        .pp-mobile-steer[hidden] { display:none!important; }
        .pp-mobile-steer button { pointer-events:auto; touch-action:none; user-select:none; -webkit-user-select:none; width:76px; height:76px; border-radius:18px; border:2px solid #9de8e9; background:rgba(5,28,44,.82); color:#e9ffff; font:700 30px system-ui; box-shadow:0 4px 22px #03131dc0; }
        .pp-mobile-steer button:active { background:#247b91; }
        html.pp-mobile [role="status"] { top:var(--pp-notice-top,110px)!important; right:16px!important; max-width:calc(100vw - 32px)!important; }
        html.pp-mobile [role="status"] button { min-width:44px; min-height:44px; }
      `, document.head.append(B);
    }
    let t = (B, U, K) => {
        let V = document.createElement(B);
        return V.className = U, K !== void 0 && (V.textContent = K), V;
      },
      s = (B, U, K) => {
        let V = t("button", `pp-button pp-button-${U}`, B);
        return V.type = "button", V.addEventListener("click", K), V;
      },
      o = (B, U = "\u2014") => {
        let K = t("div", "pp-hud-cell");
        K.append(t("span", "pp-hud-label", B));
        let V = t("span", "pp-hud-value", U);
        return K.append(V), {
          wrapper: K,
          value: V
        };
      },
      n = () => {
        let B = t("div", "pp-panel-slot"),
          U = t("section", "pp-panel");
        return B.append(U), this.root.append(B), {
          outer: B,
          panel: U
        };
      };
    this.root = t("div", "pp-ui"), this.root.setAttribute("aria-label", "Paradise Plunge interface"), document.body.append(this.root);
    let r = n();
    this.menuPanel = r.outer, r.panel.append(t("span", "pp-eyebrow", "Tropical Waters"), t("div", "pp-present", "presents"));
    let a = t("h1", "pp-title");
    a.append(t("span", "", "Paradise"), t("span", "", "Plunge")), r.panel.append(a, t("div", "pp-rule"), t("p", "pp-tagline", "Stay in the ride. Find the Flow. Conquer Paradise Plunge."));
    let l = t("div", "pp-controls");
    this.desktopControls = l, this.mobileControls = t("div", "pp-controls", "HOLD LEFT OR RIGHT TO STEER"), this.mobileControls.hidden = !0;
    let u = t("div", "pp-control");
    u.append(t("kbd", "pp-key", "A"), t("kbd", "pp-key", "D"), document.createTextNode("steer"));
    let b = t("div", "pp-control");
    b.append(t("kbd", "pp-key", "\u2190"), t("kbd", "pp-key", "\u2192"), document.createTextNode("also steer"));
    let m = t("div", "pp-control");
    m.append(t("kbd", "pp-key", "SPACE"), document.createTextNode("hop")), l.append(u, b, m);
    let d = t("div", "pp-actions");
    d.append(s("Plunge in", "primary", e.start)), r.panel.append(l, this.mobileControls, d, t("p", "pp-footnote", "Ride solo and chase your best score.")), this.hud = t("div", "pp-hud");
    let g = o("Time", "0:00.00");
    this.timeValue = g.value;
    let x = o("Speed", "0 km/h");
    this.speedValue = x.value;
    let w = o("Flow", "0%");
    this.flowValue = w.value;
    let y = o("Chain", "\xD71");
    this.chainValue = y.value, this.hud.append(g.wrapper, x.wrapper, y.wrapper), this.root.append(this.hud), this.section = t("div", "pp-section"), this.section.append(t("span", "pp-section-label", "Now riding")), this.sectionName = t("span", "pp-section-name"), this.sectionPosition = t("span", "pp-section-position"), this.section.append(this.sectionName, this.sectionPosition), this.skill = t("div", "pp-skill"), this.skill.setAttribute("aria-live", "polite"), this.root.append(this.section, this.skill), this.landingGuide = t("div", "pp-landing-guide"), this.landingGuide.style.cssText = "position:absolute;bottom:110px;left:50%;transform:translateX(-50%);max-width:94%;width:max-content;display:flex;gap:18px;flex-wrap:wrap;justify-content:center;background:#061b2cdd;padding:9px 14px;border-radius:3px;font-size:12px;font-weight:750;text-align:center;letter-spacing:.025em";
    for (let [B, U] of [["\u2190 JACKPOT +15,000", "#ffce7d"], ["CENTER \xB7 SAFE +2,500", "#91e2c8"], ["PRECISION +7,500 \u2192", "#9bceff"]]) {
      let K = t("span", "", B);
      K.style.color = U, this.landingGuide.append(K);
    }
    this.landingGuide.hidden = !0, this.root.append(this.landingGuide), this.mobileSteer = t("div", "pp-mobile-steer"), this.mobileSteer.hidden = !0, this.mobileLeft = t("button", "", "\u25C0"), this.mobileLeft.setAttribute("aria-label", "Steer left"), this.mobileLeft.type = "button", this.mobileRight = t("button", "", "\u25B6"), this.mobileRight.setAttribute("aria-label", "Steer right"), this.mobileRight.type = "button", this.mobileSteer.append(this.mobileLeft, this.mobileRight), this.root.append(this.mobileSteer);
    let v = n();
    this.resultsPanel = v.outer, v.panel.append(t("span", "pp-eyebrow", "Tropical Waters / Finish line"), t("h2", "pp-results-head", "Paradise reached")), this.resultRanking = t("p", "pp-ranking"), v.panel.append(this.resultRanking);
    let k = t("div", "pp-result-hero"),
      f = t("div", "");
    f.append(t("span", "pp-hud-label", "Finish time")), this.resultTime = t("strong", "pp-result-big"), f.append(this.resultTime);
    let L = t("div", "pp-result-score");
    L.append(t("span", "pp-hud-label", "Score")), this.resultScore = t("strong", "pp-result-big"), L.append(this.resultScore), k.append(f, L), v.panel.append(k), this.resultLanding = t("p", "pp-ranking"), v.panel.append(this.resultLanding);
    let O = t("div", "pp-result-grid"),
      z = [o("Flow"), o("Successful crests"), o("Controlled airtime"), o("Clean riding"), o("Top speed"), o("Best chain")];
    this.resultFlow = z[0].value, this.resultCrests = z[1].value, this.resultAir = z[2].value, this.resultClean = z[3].value, this.resultSpeed = z[4].value, this.resultChain = z[5].value, z.forEach(B => O.append(B.wrapper)), this.replayButton = s("Run again", "primary", e.replay), this.leaveTeamButton = s("Back to solo", "secondary", e.leaveTeam), this.leaveTeamButton.hidden = !0, v.panel.append(O, this.replayButton, this.leaveTeamButton);
    let G = n();
    this.lobbyPanel = G.outer, G.panel.append(t("span", "pp-eyebrow", "Tropical Waters / Friends ride")), this.lobbyTitle = t("h2", "pp-lobby-title"), this.lobbyNames = t("ul", "pp-lobby-list"), G.panel.append(this.lobbyTitle, this.lobbyNames);
    let Q = t("div", "pp-actions");
    this.lobbyStart = s("Start ride", "primary", () => {}), this.lobbyInvite = s("Invite friends", "secondary", () => {}), this.lobbyLeave = s("Leave lobby", "secondary", () => {}), Q.append(this.lobbyStart, this.lobbyInvite, this.lobbyLeave), G.panel.append(Q), this.render(), ne.onContentLayout(() => this.reflowMobile());
    let ae = new ResizeObserver(() => this.reflowMobile());
    for (let B of [this.hud, this.section, this.skill, this.landingGuide, ...this.root.querySelectorAll(".pp-panel")]) ae.observe(B);
  }
  render() {
    this.menuPanel.hidden = this.mode !== "menu" || this.lobbyVisible, this.resultsPanel.hidden = this.mode !== "results" || this.lobbyVisible, this.lobbyPanel.hidden = !this.lobbyVisible;
    let e = this.mode === "playing" && !this.lobbyVisible;
    this.hud.hidden = !e, this.landingGuide.hidden = !0, this.section.hidden = !e, this.skill.hidden = !e && !this.noticeText, this.reflowMobile();
  }
  steeringButtons() {
    return {
      container: this.mobileSteer,
      left: this.mobileLeft,
      right: this.mobileRight
    };
  }
  setMobile(e) {
    if (this.mobile = e, this.root.classList.toggle("pp-mobile", e), document.documentElement.classList.toggle("pp-mobile", e), this.desktopControls.hidden = e, this.mobileControls.hidden = !e, !e) {
      for (let t of [this.hud, this.menuPanel, this.resultsPanel, this.lobbyPanel]) t.removeAttribute("style");
      this.section.style.marginBottom = "", this.landingGuide.style.marginBottom = "";
    }
    this.reflowMobile();
  }
  reflowMobile() {
    !this.mobile || this.layoutPending || (this.layoutPending = !0, requestAnimationFrame(() => {
      if (this.layoutPending = !1, !this.mobile) return;
      let e = ne.contentLayout,
        t = e.safeAreaInset,
        s = innerWidth,
        o = innerHeight;
      this.root.style.setProperty("--pp-bottom", t.bottom + "px"), this.root.style.setProperty("--pp-left", t.left + "px"), this.root.style.setProperty("--pp-right", t.right + "px");
      for (let a of [this.menuPanel, this.resultsPanel, this.lobbyPanel]) {
        let l = t.top + 16,
          u = t.bottom + 16,
          b = Math.min(390, s - t.left - t.right - 32),
          m = t.left + 16;
        for (let d of e.exclusions) d.x + d.width <= m || d.x >= m + b || (d.y < o * 0.25 && (l = Math.max(l, d.y + d.height + 8)), d.y > o * 0.75 && (u = Math.max(u, o - d.y + 8)));
        a.style.padding = l + "px " + (t.right + 16) + "px " + u + "px " + (t.left + 16) + "px";
      }
      this.hud.style.left = t.left + 16 + "px", this.hud.style.right = "auto", this.hud.style.maxWidth = s - t.left - t.right - 32 + "px";
      let n = this.hud.getBoundingClientRect();
      for (let a = t.top + 16; a < o * 0.5; a += 4) if (ne.isUiRectSafe({
        x: t.left + 16,
        y: a,
        width: n.width || 260,
        height: n.height || 48
      })) {
        this.hud.style.top = a + "px";
        break;
      }
      let r = parseFloat(this.hud.style.top || "16") + (n.height || 48);
      document.documentElement.style.setProperty("--pp-notice-top", r + 12 + "px");
      for (let a of [this.section, this.landingGuide]) {
        if (a.hidden) continue;
        let l = a.getBoundingClientRect();
        if (ne.isUiRectSafe(l)) a.style.marginBottom = "";else {
          let u = e.exclusions.filter(b => l.x < b.x + b.width && l.right > b.x && l.y < b.y + b.height && l.bottom > b.y).reduce((b, m) => Math.max(b, l.bottom - m.y + 8), 0);
          u > 0 && (a.style.marginBottom = u + "px");
        }
      }
    }));
  }
  menu() {
    this.mode = "menu", this.lobbyVisible = !1, this.render();
  }
  playing() {
    this.mode = "playing", this.lobbyVisible = !1, this.lastSection = "", this.sectionUntil = 0, this.noticeText = "", this.noticeUntil = 0, this.section.style.opacity = "0", this.skill.style.opacity = "0", this.render();
  }
  update(e, t, s) {
    if (this.mode !== "playing" || this.lobbyVisible) return;
    let o = performance.now();
    this.landingGuide.hidden = e.s < D - 230 || e.finished, this.setText(this.timeValue, this.formatTime(e.time)), this.setText(this.speedValue, `${Math.round(e.v * 3.6)} km/h`), this.setText(this.flowValue, `${Math.round(e.flow * 100)}%`), this.setText(this.chainValue, `\xD7${Math.floor(e.chain)}`), t !== this.lastSection && (this.lastSection = t, this.setText(this.sectionName, t), this.sectionUntil = o + 2600), this.setText(this.sectionPosition, s ?? ""), this.section.style.opacity = o < this.sectionUntil || s ? "1" : "0";
    let n = o < this.noticeUntil ? this.noticeText : e.labelTime > 0 ? e.label : "";
    this.setText(this.skill, n), this.skill.classList.toggle("pp-wipeout", n.startsWith("WIPEOUT")), this.skill.style.opacity = n ? "1" : "0";
  }
  results(e, t, s = !1, o = !1) {
    this.replayButton.disabled = o, this.replayButton.textContent = o ? "Waiting for the team" : "Run again", this.leaveTeamButton.hidden = !s, this.mode = "results", this.lobbyVisible = !1, this.resultTime.textContent = this.formatTime(e.time), this.resultScore.textContent = e.score.toLocaleString(), this.resultLanding.textContent = e.landingBonus ? e.landingZone + " +" + e.landingBonus.toLocaleString() : "OPEN WATER \xB7 FINISHED", this.resultRanking.textContent = t ?? "", this.resultRanking.hidden = !t, this.resultFlow.textContent = `${e.flow}%`, this.resultCrests.textContent = String(e.crests), this.resultAir.textContent = `${e.airtime.toFixed(1)} s`, this.resultClean.textContent = `${e.clean}%`, this.resultSpeed.textContent = `${e.speed} km/h`, this.resultChain.textContent = `\xD7${e.chain}`, this.render();
  }
  racerColor(e) {
    this.sectionPosition.style.color = e, this.resultRanking.style.color = e;
  }
  notice(e) {
    this.noticeText = e, this.noticeUntil = performance.now() + 2e3, this.skill.hidden = !1, this.skill.textContent = e, this.skill.style.opacity = e ? "1" : "0";
  }
  lobby(e, t, s, o) {
    this.lobbyVisible = !0, this.lobbyTitle.textContent = e, this.lobbyNames.replaceChildren(...t.map(({
      name: n,
      color: r
    }) => {
      let a = document.createElement("li");
      return a.textContent = n, a.style.setProperty("--racer-color", r), a;
    })), this.lobbyStart.disabled = !s, this.lobbyStart.textContent = s ? "Start Team Flow" : "Waiting for team leader", this.lobbyStart.onclick = s ? o.start : null, this.lobbyInvite.onclick = o.invite, this.lobbyLeave.onclick = o.leave, this.render();
  }
  hideLobby() {
    this.lobbyVisible = !1, this.render();
  }
  setText(e, t) {
    e.textContent !== t && (e.textContent = t);
  }
  formatTime(e) {
    let t = Math.floor(Math.max(0, e) * 100),
      s = Math.floor(t / 6e3),
      o = Math.floor(t / 100) % 60;
    return `${s}:${String(o).padStart(2, "0")}.${String(t % 100).padStart(2, "0")}`;
  }
};
import * as we from "./vendor/001-three-0.185.js";
var fe = i => typeof i == "number" && Number.isFinite(i),
  ge = i => Number.isSafeInteger(i),
  Ie = we.MathUtils.clamp,
  mt = 4,
  ws = 1e4,
  ho = 50,
  Lt = i => i !== null && typeof i == "object" && !Array.isArray(i);
function Li(i, e) {
  return !Lt(i) || i.epoch !== e || !ge(i.seq) || i.seq < 0 || i.seq > Number.MAX_SAFE_INTEGER - 1 || !fe(i.t) || i.t < 0 || i.t > 7200 || !fe(i.s) || i.s < 0 || i.s > D + 12 || !fe(i.theta) || Math.abs(i.theta) > Math.PI + 0.1 || ![0, 1, 2].includes(i.route) || !ge(i.points) || i.points < 0 || i.points > 5e6 || !fe(i.v) || i.v < 0 || i.v > 125 || !fe(i.damage) || i.damage < 0 || i.damage > 1 || typeof i.done != "boolean" || ![i.x, i.y, i.z].every(s => fe(s) && Math.abs(s) < 1e4) ? !1 : C(i.s, i.route).p.distanceToSquared(new we.Vector3(i.x, i.y, i.z)) < 57600;
}
function po(i) {
  if (!Lt(i)) return !1;
  let e = i;
  return fe(i.time) && i.time >= 40 && i.time <= 7200 && ["flow", "crests", "clean", "speed", "chain", "score"].every(t => ge(i[t])) && e.flow >= 0 && e.flow <= 100 && e.crests >= 0 && e.crests <= 500 && fe(i.airtime) && i.airtime >= 0 && i.airtime <= i.time + 1 && e.clean >= 0 && e.clean <= 100 && e.speed >= 0 && e.speed <= 450 && e.chain >= 1 && e.chain <= 8 && e.score >= 0 && e.score <= 5e6 && ge(i.landingBonus) && [0, 2500, 7500, 15e3].includes(i.landingBonus) && typeof i.landingZone == "string" && i.landingZone.length < 32;
}
function Yt(i, e) {
  if (!Lt(i) || !Li(i.state, e) || !po(i.stats) || !ge(i.wipeouts) || i.wipeouts < 0 || i.wipeouts > 2e3 || !fe(i.goodTime) || i.goodTime < 0 || i.goodTime > i.stats.time) return !1;
  let {
    state: t,
    stats: s,
    wipeouts: o,
    goodTime: n
  } = i;
  if (!t.done || t.s < D - 1 || Math.abs(t.y - T.y - 0.35) > 0.12 || Math.hypot(t.x - T.center.x, t.z - T.center.z) > T.radius - 3 || Math.abs(s.time - t.t - 3 * o) > 0.05) return !1;
  let r = Ut(new we.Vector3(t.x, t.y, t.z)),
    a = Math.max(0, Math.round(t.points + s.landingBonus + Math.max(0, 420 - s.time) * 40 + n * 15 + s.crests * 200 + s.airtime * 25 - o * 250));
  return s.landingBonus === (r?.bonus ?? 0) && s.landingZone === (r?.label ?? "") && s.score === a && s.flow === Math.round(100 * n / Math.max(1, s.time)) && s.clean === Math.round(Math.max(0, 100 - o * 7 - t.damage * 20));
}
var Ci = class {
  samples = [];
  lastSeq = -1;
  playback = null;
  lastFrame = null;
  lastArrival = -1 / 0;
  target = 0.125;
  stable = 0;
  underrunAt = -1 / 0;
  underruns = 0;
  recovering = !1;
  get depth() {
    return this.playback === null || !this.samples.length ? 0 : this.samples[this.samples.length - 1].t - this.playback;
  }
  get delay() {
    return this.target;
  }
  get latest() {
    return this.samples[this.samples.length - 1];
  }
  clear() {
    this.samples = [], this.lastSeq = -1, this.playback = null, this.lastFrame = null, this.lastArrival = -1 / 0, this.target = 0.125, this.stable = 0, this.underruns = 0, this.recovering = !1;
  }
  push(e, t) {
    if (!fe(t) || e.seq <= this.lastSeq || this.latest && e.t <= this.latest.t || this.playback !== null && e.t < this.playback - 0.01) return !1;
    if (this.latest) {
      let s = this.latest,
        o = e.t - s.t,
        n = Math.hypot(e.x - s.x, e.y - s.y, e.z - s.z);
      (o > 0.85 || n > Math.max(24, 110 * o + 15) || e.s < s.s - 38) && (this.samples = [], this.playback = null, this.recovering = !0);
    }
    return this.lastSeq = e.seq, this.lastArrival = t, this.samples.push(e), this.samples.length > 16 && this.samples.shift(), !0;
  }
  sample(e) {
    if (!this.samples.length || !fe(e)) return;
    let t = this.latest;
    if (t.done && this.playback !== null && this.playback >= t.t) return this.playback = t.t, this.lastFrame = e, this.recovering = !1, t;
    this.lastFrame !== null && e - this.lastFrame > 500 && (this.playback = null, this.recovering = !0);
    let s = this.lastFrame === null ? 0 : Ie((e - this.lastFrame) / 1e3, 0, 0.1);
    if (this.lastFrame = e, !t.done && e - this.lastArrival > 500 && (this.recovering = !0), this.playback === null) {
      let y = this.latest;
      if (this.recovering && this.samples.length < 2) return y;
      this.playback = y.t - this.target, this.recovering = !1;
    }
    let o = this.latest,
      n = o.t - this.playback;
    !o.done && n < 0.018 && e - this.underrunAt > 65 ? (this.underruns++, this.underrunAt = e, this.stable = 0, this.target = Math.min(0.15, this.target + 0.0075)) : n > 0.06 && n < 0.21 && (this.stable += s, this.stable > 8 && (this.target = Math.max(0.1, this.target - 0.005), this.stable = 0));
    let r = Ie(1 + (n - this.target) * 1.1, 0.88, 1.12);
    this.playback += s * r;
    let a = this.playback;
    for (; this.samples.length > 2 && this.samples[1].t < a - 0.02;) this.samples.shift();
    let l = this.samples[0],
      u = this.samples.find(y => y.t >= a);
    if (u && u !== l) {
      let y = this.samples[this.samples.indexOf(u) - 1],
        v = Ie((this.playback - y.t) / (u.t - y.t), 0, 1),
        k = y.theta + Math.atan2(Math.sin(u.theta - y.theta), Math.cos(u.theta - y.theta)) * v;
      return {
        s: we.MathUtils.lerp(y.s, u.s, v),
        theta: k,
        route: v < 0.5 ? y.route : u.route,
        x: we.MathUtils.lerp(y.x, u.x, v),
        y: we.MathUtils.lerp(y.y, u.y, v),
        z: we.MathUtils.lerp(y.z, u.z, v),
        damage: we.MathUtils.lerp(y.damage, u.damage, v),
        done: u.done && v > 0.5
      };
    }
    if (this.playback <= l.t) return l;
    let b = this.samples.length > 1 ? this.samples[this.samples.length - 2] : null,
      m = Math.min(0.1, Math.max(0, this.playback - o.t));
    if (!b || o.done || e - this.lastArrival > 500 || o.t - b.t < 0.008 || o.t - b.t > 0.25) return o;
    let d = Ie(m / (o.t - b.t), 0, 2),
      g = o.x - b.x,
      x = o.y - b.y,
      w = o.z - b.z;
    return Math.hypot(g, x, w) / (o.t - b.t) > 115 ? o : {
      s: Ie(o.s + (o.s - b.s) * d, 0, D),
      theta: o.theta,
      route: o.route,
      x: o.x + g * d,
      y: o.y + x * d,
      z: o.z + w * d,
      damage: o.damage,
      done: o.done
    };
  }
};
var Ct = class {
  constructor(e = Math.random) {
    this.random = e;
  }
  resetCue() {
    this.nextBeat = this.ctx?.currentTime ?? 0, this.beat = 0, this.lastSteer = 0, this.sprayClock = 0, this.party = 0, this.lastRecovery = 0;
  }
  enabled = !0;
  setEnabled(e) {
    this.enabled = e, this.ctx && this.out.gain.setTargetAtTime(e ? 0.85 : 0, this.ctx.currentTime, 0.025);
  }
  ctx = null;
  out;
  noise;
  rush;
  rushF;
  hiss;
  wind;
  windF;
  roar;
  ambience;
  music;
  crowd;
  crowdF;
  squeak;
  squeakOsc;
  squeakF;
  squeakLfo;
  nextBeat = 0;
  beat = 0;
  lastSteer = 0;
  sprayClock = 0;
  party = 0;
  lastRecovery = 0;
  scrape;
  init() {
    if (this.ctx) return;
    let {
      context: e,
      output: t
    } = ne.audio();
    this.ctx = e, this.out = e.createGain(), this.out.gain.value = this.enabled ? 0.85 : 0;
    let s = e.createDynamicsCompressor();
    s.threshold.value = -14, s.ratio.value = 4, this.out.connect(s).connect(t);
    let o = e.sampleRate * 2,
      n = e.createBuffer(1, o, e.sampleRate),
      r = n.getChannelData(0),
      a = 0;
    for (let m = 0; m < o; m++) {
      let d = this.random() * 2 - 1;
      a = (a + 0.02 * d) / 1.02, r[m] = d * 0.6 + a * 3;
    }
    this.noise = n;
    let l = (m, d, g = 0.7) => {
        let x = e.createBufferSource();
        x.buffer = n, x.loop = !0, x.playbackRate.value = 0.9 + this.random() * 0.2;
        let w = e.createBiquadFilter();
        w.type = m, w.frequency.value = d, w.Q.value = g;
        let y = e.createGain();
        return y.gain.value = 0, x.connect(w).connect(y).connect(this.out), x.start(0, this.random()), {
          f: w,
          g: y
        };
      },
      u = l("lowpass", 700);
    this.rush = u.g, this.rushF = u.f, u = l("highpass", 3200), this.hiss = u.g, u = l("bandpass", 500, 0.6), this.wind = u.g, this.windF = u.f, u = l("lowpass", 180, 1.1), this.roar = u.g, u = l("bandpass", 1800, 0.4), this.ambience = u.g, this.ambience.gain.value = 0.02, u = l("bandpass", 1400, 0.9), this.crowd = u.g, this.crowdF = u.f, u = l("bandpass", 2100, 1.5), this.scrape = u.g, this.squeakOsc = e.createOscillator(), this.squeakOsc.type = "sawtooth", this.squeakOsc.frequency.value = 420, this.squeakF = e.createBiquadFilter(), this.squeakF.type = "bandpass", this.squeakF.Q.value = 9, this.squeakF.frequency.value = 900, this.squeakLfo = e.createOscillator(), this.squeakLfo.frequency.value = 13;
    let b = e.createGain();
    b.gain.value = 60, this.squeakLfo.connect(b).connect(this.squeakOsc.frequency), this.squeak = e.createGain(), this.squeak.gain.value = 0, this.squeakOsc.connect(this.squeakF).connect(this.squeak).connect(this.out), this.squeakOsc.start(), this.squeakLfo.start(), this.music = e.createGain(), this.music.gain.value = 0, this.music.connect(this.out);
  }
  start() {
    this.init(), this.ctx?.state === "suspended" && this.ctx.resume();
  }
  splash(e, t = 0) {
    if (!this.ctx) return;
    let s = this.ctx,
      o = s.currentTime,
      n = s.createBufferSource();
    n.buffer = this.noise;
    let r = s.createBiquadFilter();
    r.type = "lowpass", r.frequency.setValueAtTime(1200 + e * 2400, o), r.frequency.exponentialRampToValueAtTime(300, o + 0.6 + e * 0.6);
    let a = s.createGain();
    if (a.gain.setValueAtTime(1e-4, o), a.gain.exponentialRampToValueAtTime(0.3 * e + 0.05, o + 0.015), a.gain.exponentialRampToValueAtTime(1e-4, o + 0.45 + e * 0.8), n.connect(r).connect(a).connect(this.out), n.start(o, this.random()), n.stop(o + 2), t > 0) {
      let l = s.createOscillator(),
        u = s.createGain();
      l.frequency.setValueAtTime(110, o), l.frequency.exponentialRampToValueAtTime(38, o + 0.3), u.gain.setValueAtTime(0.5 * t, o), u.gain.exponentialRampToValueAtTime(1e-4, o + 0.4), l.connect(u).connect(this.out), l.start(o), l.stop(o + 0.45);
    }
  }
  chirp(e) {
    if (!this.ctx) return;
    let t = this.ctx,
      s = t.currentTime,
      o = t.createOscillator(),
      n = t.createBiquadFilter(),
      r = t.createGain();
    o.type = "sawtooth";
    let a = 380 + this.random() * 160;
    o.frequency.setValueAtTime(a, s), o.frequency.exponentialRampToValueAtTime(a * 1.9, s + 0.09), o.frequency.exponentialRampToValueAtTime(a * 1.3, s + 0.16), n.type = "bandpass", n.frequency.value = 1100, n.Q.value = 7, r.gain.setValueAtTime(1e-4, s), r.gain.exponentialRampToValueAtTime(0.07 * e, s + 0.02), r.gain.exponentialRampToValueAtTime(1e-4, s + 0.18), o.connect(n).connect(r).connect(this.out), o.start(s), o.stop(s + 0.2);
  }
  chime() {
    if (!this.ctx) return;
    let e = this.ctx,
      t = e.currentTime;
    for (let [s, o] of [659, 880, 1318].entries()) {
      let n = e.createOscillator(),
        r = e.createGain();
      n.type = "sine", n.frequency.value = o, r.gain.setValueAtTime(1e-4, t + s * 0.06), r.gain.exponentialRampToValueAtTime(0.08, t + s * 0.06 + 0.02), r.gain.exponentialRampToValueAtTime(1e-4, t + s * 0.06 + 0.5), n.connect(r).connect(this.out), n.start(t + s * 0.06), n.stop(t + s * 0.06 + 0.6);
    }
  }
  failure() {
    if (!this.ctx) return;
    let e = this.ctx,
      t = e.currentTime,
      s = e.createOscillator(),
      o = e.createGain();
    s.type = "triangle", s.frequency.setValueAtTime(185, t), s.frequency.exponentialRampToValueAtTime(48, t + 0.45), o.gain.setValueAtTime(0.13, t), o.gain.exponentialRampToValueAtTime(0.001, t + 0.55), s.connect(o).connect(this.out), s.start(t), s.stop(t + 0.6);
  }
  cheer() {
    if (this.ctx) {
      this.party = 1;
      for (let e = 0; e < 4; e++) setTimeout(() => this.chime(), e * 220);
    }
  }
  update(e, t, s, o, n, r) {
    if (!this.ctx) return;
    let a = this.ctx,
      l = a.currentTime,
      u = t ? 1 : 0,
      b = Math.min(1, e.v / 100),
      m = Math.max(0, Math.min(1, (e.v - 45) / 55)),
      d = (v, k, f = 0.08) => v.setTargetAtTime(k, l, f),
      g = e.finished;
    d(this.rush.gain, u * (g ? 0.05 : e.grounded ? 0.05 + (0.52 + 0.045 * m) * b * b : 0.025)), d(this.rushF.frequency, 350 + b * b * 4800), d(this.hiss.gain, u * (e.grounded && !g ? (e.flow * 0.14 + 0.06) * b + (e.crest ? 0.12 : 0) : 0)), d(this.wind.gain, u * (g ? 0 : 0.012 + b * b * (0.45 + 0.04 * m) + (e.grounded ? 0 : 0.2) + (e.recovery > 0.65 ? 0.15 : 0))), d(this.windF.frequency, 380 + b * 1600), d(this.roar.gain, u * Math.min(0.8, e.surge * 0.6 + Math.abs(e.jet) / 24 * 0.55 + e.turbulence * 0.25));
    let x = e.grounded && !g ? Math.min(1, Math.max(0, (Math.abs(e.u) - 2.5) / 9 + Math.max(0, e.pressure - 14) / 30)) : 0;
    d(this.scrape.gain, u * (e.grounded ? x * 0.065 + (e.crest ? 0.16 : 0) : 0), 0.035), d(this.squeak.gain, u * x * 0.065, 0.04), d(this.squeakOsc.frequency, 300 + Math.abs(e.u) * 28 + e.v * 2), d(this.squeakF.frequency, 800 + x * 900), t && e.grounded && e.v > 20 && e.steer !== 0 && e.steer !== this.lastSteer && this.chirp(0.6 + b * 0.6), this.lastSteer = e.steer, this.sprayClock -= o, t && e.grounded && !g && this.sprayClock <= 0 && (e.v > 40 || e.crest) && (this.sprayClock = 0.25 + this.random() * 0.35 / (0.5 + b), this.splash(0.12 + b * 0.25 + (e.crest ? 0.25 : 0)));
    for (let v of n) v === "clean" && this.splash(0.7, 0.6), v === "rough" && this.splash(1.1, 1), v === "wipeout" && this.failure(), v === "finish" && (this.splash(2, 1.6), this.cheer()), (v === "crest" || v === "surge") && this.chime(), v === "hop" && this.splash(0.25, 0.2), v === "launch" && this.splash(0.4);
    this.lastRecovery > 0.65 && e.recovery <= 0.65 && e.recovery > 0 && this.splash(1.2, 1.1), this.lastRecovery = e.recovery, this.party = Math.max(g ? 0.8 : 0, this.party - o * 0.1);
    let w = Math.max(r * 0.05, this.party * 0.16);
    d(this.crowd.gain, w, 0.3), d(this.crowdF.frequency, 1200 + Math.sin(l * 3) * 300, 0.2), d(this.ambience.gain, t ? 0.012 : 0.04);
    let y = Math.max(r > 0.5 ? r : 0, g ? 1 : 0);
    if (d(this.music.gain, (u || g ? 1 : 0) * (0.05 + 0.1 * s + 0.08 * y)), l > this.nextBeat) {
      this.nextBeat < l - 0.5 && (this.nextBeat = l);
      let v = this.beat++ % 8,
        k = [220, 277.2, 329.6, 440, 329.6, 277.2, 246.9, 329.6],
        f = a.createOscillator(),
        L = a.createGain();
      f.type = "triangle", f.frequency.value = k[v] * (s > 0.85 && !y ? 2 : 1);
      let O = a.createBiquadFilter();
      if (O.type = "lowpass", O.frequency.value = 900 + Math.max(s, y) * 2500, L.gain.setValueAtTime(1e-4, this.nextBeat), L.gain.exponentialRampToValueAtTime(0.18, this.nextBeat + 0.01), L.gain.exponentialRampToValueAtTime(1e-4, this.nextBeat + 0.22), f.connect(O).connect(L).connect(this.music), f.start(this.nextBeat), f.stop(this.nextBeat + 0.3), v % 2 === 0 && (y || v % 4 === 0)) {
        let z = a.createOscillator(),
          G = a.createGain();
        z.frequency.setValueAtTime(95, this.nextBeat), z.frequency.exponentialRampToValueAtTime(40, this.nextBeat + 0.2), G.gain.setValueAtTime(0.35 * Math.max(s, y) + 0.1, this.nextBeat), G.gain.exponentialRampToValueAtTime(1e-4, this.nextBeat + 0.25), z.connect(G).connect(this.music), z.start(this.nextBeat), z.stop(this.nextBeat + 0.3);
      }
      this.nextBeat += 60 / (110 + Math.max(s, y) * 14) / 2;
    }
  }
};
import * as Pi from "./vendor/001-three-0.185.js";
var ft = [{
    title: "Welcome to Paradise",
    moment: "The attraction billboard gives way to a fast bank in The Wall.",
    durationMs: 3200,
    s: 145,
    speed: 66,
    theta: 0,
    route: 0,
    seed: 101,
    drive: "flow",
    camera: {
      back: 9,
      height: 4.2,
      side: 0,
      look: 24,
      fov: 70
    }
  }, {
    title: "Catch the Surge",
    moment: "Ride the moving front of the surge through alternating banks.",
    durationMs: 3200,
    s: M[5] + 70,
    speed: 78,
    theta: 0,
    route: 0,
    seed: 202,
    drive: "flow",
    surgeLead: 12,
    camera: {
      back: 9,
      height: 4.6,
      side: 0,
      look: 23,
      fov: 78
    }
  }, {
    title: "Clear the Gap",
    moment: "Launch across the open expert gap and reconnect with the receiving slide.",
    durationMs: 3600,
    s: M[6] + 120,
    speed: 85,
    theta: 0,
    route: 2,
    seed: 303,
    drive: "gap",
    camera: {
      back: 11,
      height: 5.4,
      side: 2,
      look: 19,
      fov: 73
    }
  }, {
    title: "Paradise Falls",
    moment: "Carve through the illuminated waterfalls and cross-current mist.",
    durationMs: 3200,
    s: M[8] + 170,
    speed: 72,
    theta: 0,
    route: 0,
    seed: 404,
    drive: "flow",
    camera: {
      back: 9,
      height: 4.8,
      side: 0,
      look: 24,
      fov: 74
    }
  }, {
    title: "Jackpot Splashdown",
    moment: "Commit to the left landing line, splash into the jackpot zone and coast into the pool party.",
    durationMs: 5e3,
    s: D - 140,
    speed: 75,
    theta: 0,
    route: 0,
    seed: 505,
    drive: "jackpot",
    camera: {
      back: 9,
      height: 4.4,
      side: 0,
      look: 22,
      fov: 70
    }
  }],
  Ts = ft.reduce((i, e) => i + e.durationMs, 0);
function Rs(i, e) {
  i.reset(), i.s = e.s, i.v = e.speed, i.theta = e.theta, i.route = e.route, i.position.copy(me(i.s, i.theta, i.route, 0.65)), i.step(0, 0, !1), e.surgeLead !== void 0 && (i.surgeS = i.s - e.surgeLead);
}
function Ms(i, e) {
  let t = C(i.s, i.route),
    s = Xe(i.s, i.theta, i.route, i.surgeS),
    o = e.drive === "gap" ? 0 : e.drive === "jackpot" ? -0.8 : Pi.MathUtils.clamp(rt(i.s + 12, i.route), -t.lip + 0.24, t.lip - 0.24);
  if (e.drive === "jackpot" && i.s > D - 8) return -1;
  let n = -t.curvature.dot(t.right) * i.v * i.v * Math.cos(i.theta),
    r = Ze * (t.right.y * Math.cos(i.theta) + t.up.y * Math.sin(i.theta)) - n - s.jet * Math.cos(i.theta * 0.7);
  return Pi.MathUtils.clamp(((o - i.theta) * (t.radius - 0.65) * 18 - i.u * 7 + r) / Mi(i.v, i.damage), -1, 1);
}
var Qt = class {
  constructor(e) {
    this.hooks = e;
  }
  physics = new lt();
  motion = new ct();
  active = !1;
  startedAt = 0;
  shotIndex = -1;
  shotSeconds = 0;
  ticks = 0;
  start() {
    this.active && this.finish(!1), this.hooks.begin(), this.active = !0, this.startedAt = performance.now(), this.shotIndex = -1, this.update(this.startedAt);
  }
  update(e) {
    if (!this.active) return;
    let t = Math.max(0, e - this.startedAt);
    if (t >= Ts) {
      this.finish();
      return;
    }
    let s = t,
      o = 0;
    for (; o < ft.length - 1 && s >= ft[o].durationMs;) s -= ft[o++].durationMs;
    let n = ft[o];
    o !== this.shotIndex && (this.shotIndex = o, this.ticks = 0, this.shotSeconds = 0, Rs(this.physics, n), this.motion.reset(this.physics), this.hooks.cut(n));
    let r = Math.floor(s * 0.12),
      a = this.shotSeconds;
    for (; this.ticks < r;) this.motion.beforeStep(), this.physics.step(1 / 120, Ms(this.physics, n), !1), this.motion.afterStep(this.physics), this.ticks++, this.hooks.step(this.physics, 1 / 120, this.ticks / 120);
    this.shotSeconds = s / 1e3, this.motion.sample(s * 0.12 - r), this.hooks.render(this.physics, this.motion, n, Math.max(0, Math.min(0.1, this.shotSeconds - a)));
  }
  finish(e = !0) {
    this.active = !1, this.shotIndex = -1, this.hooks.end(), e && window.dispatchEvent(new Event("remix:trailer-end"));
  }
};
function uo(i, e, t, s) {
  return i < 900 && e > i && (t > 0 || s);
}
var Kt = class {
  constructor(e, t, s) {
    this.buttons = e;
    this.riding = t;
    this.changed = s;
    let o = () => {
      let r = uo(innerWidth, innerHeight, navigator.maxTouchPoints, this.coarse.matches);
      r !== this.enabled && (this.reset(), this.enabled = r, this.changed(r)), this.sync();
    };
    addEventListener("resize", o), this.coarse.addEventListener("change", o);
    let n = (r, a) => {
      r.addEventListener("pointerdown", u => {
        if (!(!this.enabled || !this.riding())) {
          u.preventDefault(), this.held.set(u.pointerId, a);
          try {
            r.setPointerCapture(u.pointerId);
          } catch {}
        }
      });
      let l = u => {
        this.held.get(u.pointerId) === a && (this.held.delete(u.pointerId), r.hasPointerCapture(u.pointerId) && r.releasePointerCapture(u.pointerId));
      };
      r.addEventListener("pointerup", l), r.addEventListener("pointercancel", l), r.addEventListener("lostpointercapture", l);
    };
    n(e.left, -1), n(e.right, 1), addEventListener("blur", () => this.reset()), document.addEventListener("visibilitychange", () => {
      document.hidden && this.reset();
    }), o();
  }
  enabled = !1;
  coarse = matchMedia("(pointer: coarse)");
  held = new Map();
  value = 0;
  reset() {
    for (let [e, t] of this.held) {
      let s = t < 0 ? this.buttons.left : this.buttons.right;
      s.hasPointerCapture(e) && s.releasePointerCapture(e);
    }
    this.held.clear(), this.value = 0;
  }
  sync() {
    let e = this.enabled && this.riding();
    this.buttons.container.hidden = !e, !e && (this.held.size || this.value !== 0) && this.reset();
  }
  step(e) {
    let t = 0;
    for (let s of this.held.values()) t += s;
    return t = Math.max(-1, Math.min(1, t)), this.value += (t - this.value) * (1 - Math.exp(-(t === 0 ? 12 : 32) * e)), Math.abs(this.value) < 1e-4 && (this.value = 0), this.value;
  }
};
var yo = ne.ready(),
  be = new re.WebGLRenderer({
    antialias: !0,
    powerPreference: "high-performance"
  });
be.outputColorSpace = re.SRGBColorSpace;
be.toneMapping = re.ACESFilmicToneMapping;
be.toneMappingExposure = 1.15;
be.domElement.style.cssText = "position:fixed;inset:0;display:block;width:100%;height:100%";
document.body.style.cssText = "margin:0;overflow:hidden;background:#071629";
document.body.append(be.domElement);
var Se = new re.Scene(),
  $ = new re.PerspectiveCamera(58, 1, 0.3, 2e4),
  je = new mo(be);
je.addPass(new fo(Se, $));
var Hs = new bo(new re.Vector2(640, 360), 0.16, 0.3, 0.97);
je.addPass(Hs);
je.addPass(new go());
var N = new lt(),
  yt = new Ct(),
  qe = new ct();
qe.reset(N);
var si = document.createElement("div");
si.style.cssText = "position:fixed;inset:0;background:#061321;pointer-events:none;z-index:12;opacity:0";
document.body.append(si);
var vo = matchMedia("(prefers-reduced-motion: reduce)"),
  Zt = null,
  Te = !1,
  Be = !1,
  ze = 0,
  ke = 0,
  Fe = null,
  ei = "",
  it = !1,
  Gi = !1,
  ye = new Set(),
  Ni = !1,
  Me = null,
  Oi = !1;
addEventListener("remix:trailer-start", i => {
  i.preventDefault(), Me ? Me.start() : Oi = !0;
});
var Re = new jt({
    start: () => Di(),
    friends: () => {},
    replay: () => Di(),
    leaveTeam: () => {}
  }),
  Ve = new Kt(Re.steeringButtons(), () => Te && !Me?.active && !false, i => {
    ye.clear(), Re.setMobile(i);
  });
addEventListener("keydown", i => {
  if (Me?.active || Ve.enabled) {
    i.preventDefault();
    return;
  }
  ["Space", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(i.code) && i.preventDefault(), yt.start(), ye.add(i.code), !Te && !Be && !false && ["Space", "Enter"].includes(i.code) && !i.repeat && Di();
});
addEventListener("keyup", i => ye.delete(i.code));
addEventListener("blur", () => ye.clear());
addEventListener("pointerdown", () => {
  Me?.active || yt.start();
});
function Ui() {
  Me?.active || (it = false, Gi = !1, ye.clear(), Ve.reset(), oi.reset(), bt.reset(), N.reset(), qe.reset(N), Zt = null, ze = 0, _e = performance.now(), ne.beginRun(), Te = !0, Be = !1, ke = 0, Fe = null, ei = "", Re.playing(), Ve.sync(), yt.start(), qi());
}
function Di() {
  !Ni || false || false || (tt(We, 0), Re.racerColor(et[0].hex), Ui());
}
function ks() {
  let i = qe.view,
    e = C(i.s + Math.min(65, i.v * 0.6), i.route);
  if (N.recovery > 0) {
    let n = C(i.s).p.clone().addScaledVector(i.tangent, -9).add(new re.Vector3(0, 7, 0));
    return {
      pos: (Zt ?? n).clone(),
      look: i.position.clone()
    };
  }
  let t = N.finished ? Math.min(1, N.poolTime / 2.5) : 0,
    s = i.position.clone().addScaledVector(i.tangent, -8 - t * 5).addScaledVector(i.up, 3.2 + t * 5).add(new re.Vector3(0, 0.7, 0)),
    o = i.position.clone().addScaledVector(e.tangent, 22).add(new re.Vector3(0, 1.4, 0));
  return {
    pos: s,
    look: o
  };
}
var ti = new re.Vector3();
function qi() {
  let i = ks();
  $.position.copy(i.pos), ti.copy(i.look), $.lookAt(ti);
}
function As() {
  let i = innerWidth,
    e = innerHeight,
    t = Math.min(devicePixelRatio, 1.5);
  be.setPixelRatio(t), be.setSize(i, e), je.setPixelRatio(t), je.setSize(i, e), matchMedia("(pointer: coarse)").matches && Hs.setSize(Math.max(1, Math.round(i * t / 2)), Math.max(1, Math.round(e * t / 2))), $.aspect = i / e, Ls = i / e < 1 ? 72 : i / e < 1.4 ? 64 : 58, $.updateProjectionMatrix();
}
var Ls = 58;
addEventListener("resize", As);
As();
var On = await yo,
  [, ii] = await Promise.all([ys(), Es(Se)]),
  Cs = gs(Se),
  We = Wt.create();
Se.add(We);
var oi = Hi();
Se.add(oi.points);
var bt = ps(Se),
  Ps = ds(Se);
qi();
var _e = performance.now(),
  Ii = 0,
  Ue = Wt.create(),
  gt = Hi();
Ue.visible = !1;
gt.points.visible = !1;
Se.add(Ue, gt.points);
var Xt = 101,
  zi = !0,
  Jt = [],
  Ss = 0,
  Pt = new Ct(() => (Xt = 1664525 * Xt + 1013904223 >>> 0, Xt / 4294967296)),
  Fi = [],
  Vi = [],
  It = null,
  Bi = null;
Me = new Qt({
  begin() {
    ye.clear(), It = {
      position: $.position.clone(),
      rotation: $.quaternion.clone(),
      fov: $.fov
    }, Bi = bt.capture();
    for (let i of [...document.querySelectorAll('.pp-ui,[role="status"]'), si]) Fi.push({
      el: i,
      display: i.style.display
    }), i.style.display = "none";
    for (let i of [...Se.children.filter(e => e !== Ue && e.userData.racerColor !== void 0), oi.points]) Vi.push({
      actor: i,
      visible: i.visible
    }), i.visible = !1;
    yt.setEnabled(!1), Pt.start(), Pt.setEnabled(!0), Ue.visible = !0, gt.points.visible = !0;
  },
  cut(i) {
    Xt = i.seed, gt.reset(i.seed), bt.reset(i.seed), Pt.resetCue(), zi = !0, Jt = [];
  },
  step(i, e, t) {
    gt.update(i.s, t, i, e, i.position), Ss = bt.update(t, e, i.position, i.finished), Jt.push(...i.events);
  },
  render(i, e, t, s) {
    let o = e.view,
      n = Me.shotSeconds;
    Ps.update(o.s), Cs.update(o.s, n, i.surgeS, o.v, s), ii.update(n, o.s, o.position, n), Ue.position.copy(o.position), Ue.quaternion.copy(o.rotation), Ue.scale.setScalar(1);
    let r = i.finished ? Math.min(1, i.poolTime / 2) : 0,
      a = $.aspect < 1,
      l = t.camera,
      u = C(o.s + Math.min(45, o.v * 0.45), o.route).tangent,
      b = new re.Vector3(-o.tangent.z, 0, o.tangent.x).normalize(),
      m = o.position.clone().addScaledVector(o.tangent, -l.back - r * 6).addScaledVector(o.up, l.height + r * 7).addScaledVector(b, a ? 0 : l.side),
      d = o.position.clone().addScaledVector(u, l.look * (1 - r * 0.5)).add(new re.Vector3(0, 1.3, 0));
    ii.keepCameraClear(m), zi ? ($.position.copy(m), zi = !1) : $.position.lerp(m, 1 - Math.exp(-18 * s)), $.up.set(0, 1, 0), $.lookAt(d), $.fov = a ? Math.max(78, l.fov) : l.fov, $.updateProjectionMatrix(), Pt.update(i, !i.finished, 0.8, s, Jt, Ss), Jt = [], je.render();
  },
  end() {
    Pt.setEnabled(!1), yt.setEnabled(!0), Ue.visible = !1, gt.points.visible = !1;
    for (let {
      el: i,
      display: e
    } of Fi) i.style.display = e;
    Fi.length = 0;
    for (let {
      actor: i,
      visible: e
    } of Vi) i.visible = e;
    Vi.length = 0, Bi && bt.restore(Bi), It && ($.position.copy(It.position), $.quaternion.copy(It.rotation), $.fov = It.fov, $.updateProjectionMatrix()), _e = performance.now(), ye.clear();
  }
});
var xo = be.getRenderTarget();
try {
  be.setRenderTarget(je.readBuffer), await be.compileAsync(Se, $);
} finally {
  be.setRenderTarget(xo);
}
Ni = !0;
void 0;
void 0;
_e = performance.now();
Oi && (Oi = !1, Me.start());
addEventListener("visibilitychange", () => {
  _e = performance.now(), ze = 0, qe.reset(N);
});
be.setAnimationLoop(i => {
  if (document.hidden) {
    _e = i;
    return;
  }
  if (Ve.sync(), Me?.active) {
    Me.update(i), _e = i;
    return;
  }
  let e = Math.min(0.25, Math.max(0, (i - _e) / 1e3));
  _e = i;
  let t = Te || Be && N.finished && ke > 0;
  ze = t ? ze + e : 0;
  let s = !1,
    o = (ye.has("KeyD") || ye.has("ArrowRight") ? 1 : 0) - (ye.has("KeyA") || ye.has("ArrowLeft") ? 1 : 0),
    n = [];
  for (; ze + 1e-9 >= 1 / 120;) qe.beforeStep(), N.step(1 / 120, Te ? Ve.enabled ? Ve.step(1 / 120) : o : 0, Te && !Ve.enabled && ye.has("Space"), Ve.enabled), s = qe.afterStep(N) || s, n.push(...N.events), Te && N.finished && (Te = !1, Be = !0, ke = 5, Fe = N.stats(), Ve.reset(), false && void 0), ze = Math.max(0, ze - 1 / 120);
  N.events = n;
  let r = qe.sample(t ? ze / (1 / 120) : 1);
  n.includes("wipeout") && (Zt = $.position.clone()), s && (Zt = null, qi());
  let a = N.recovery > 0 && N.recovery < 0.22 ? 1 - N.recovery / 0.22 : 0;
  if (si.style.opacity = String(a), ke > 0 && (ke = Math.max(0, ke - e), ke === 0 && Fe && (ze = 0, qe.reset(N), Re.results(Fe, ei || (it ? "TEAM FLOW \xB7 Confirming your landing\u2026" : void 0), it, it && !false))), void 0, Be && ke === 0 && Fe && !Gi) {
    let y = it ? 0 : Fe.score;
    y !== null && (Gi = !0, void 0);
  }
  let l = false ? 0 : N.time;
  Ps.update(r.s), Cs.update(r.s, l, N.surgeS, r.v, e), ii.update(l, r.s, r.position), oi.update(r.s, l, N, e, r.position);
  let u = bt.update(i / 1e3, e, r.position, Be && N.finished);
  We.position.copy(r.position), We.quaternion.copy(r.rotation), We.scale.set(1 + N.damage * 0.05, 1 - N.damage * 0.1, 1 + N.damage * 0.05), We.visible = !0;
  let b = C(N.s, N.route),
    m = b.section,
    d = Math.min(1, N.chain / 8 + (m === 2 || m === 9 ? 0.35 : 0) + N.surge * 0.4 + (m === 9 ? 0.2 : 0));
  Ii += (d - Ii) * (1 - Math.exp(-e * 1.5)), yt.update(N, Te, Ii, e, n, u);
  let g = ks();
  $.position.lerp(g.pos, 1 - Math.exp(-18 * e)), ii.keepCameraClear($.position), ti.lerp(g.look, 1 - Math.exp(-10 * e)), $.up.set(0, 1, 0), $.lookAt(ti);
  let x = Ls + (vo.matches ? 6 : Math.min(25, Math.max(0, r.v - 25) * 0.48));
  $.fov += (x - $.fov) * (1 - Math.exp(-e * 3)), $.updateProjectionMatrix();
  let w = ss[m] + (m === 4 || m === 6 ? N.route === 2 ? m === 4 ? " \xB7 EXPERT" : " \xB7 OPEN GAP" : N.route === 1 ? m === 4 ? " \xB7 SHELTERED" : " \xB7 CHUTE" : "" : "");
  Re.update(N, w, false ? "" : void 0), je.render();
});