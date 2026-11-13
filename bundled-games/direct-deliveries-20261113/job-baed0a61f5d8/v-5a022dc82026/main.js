import * as pt from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import * as It from "./vendor/004-15e95a6cf14fc9ae2003f48bcdf1568e475cd15dd14a1a41fc1d3eb29a6ce294.js";
var Ao = It.createPortalWorld;
import * as Ne from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var ze = Math.PI / 180,
  me = -0.9,
  $e = 0,
  Oe = 13,
  Pt = 11.1,
  Io = 12.8,
  ba = 12.9,
  qe = {
    inner: Oe,
    outer: Oe + 0.55,
    height: 0.5
  },
  Tn = 29,
  Gt = [{
    r0: 29,
    r1: 31.2,
    top: 0.7
  }, {
    r0: 31.2,
    r1: 33.4,
    top: 1.4
  }, {
    r0: 33.4,
    r1: 35.6,
    top: 2.1
  }],
  rt = {
    radius: 36.2,
    piers: 22,
    base: 2.1,
    height: 6.6,
    pierWidth: 1.5
  },
  nt = {
    inner: 37.1,
    outer: 41.5,
    top: 2.1
  },
  tt = {
    width: 2.6,
    steps: 3,
    rise: 0.3,
    run: 0.5
  },
  St = [36 * ze, -36 * ze, 108 * ze, -108 * ze, 180 * ze],
  vn = {
    position: [0, $e + 0.05, 25.8],
    yaw: Math.PI
  },
  ga = 17.2,
  ya = 24.5;
var Ot = 1.45,
  Jt = (n, e, o) => ({
    id: n,
    to: e,
    bearing: o,
    ring: ga,
    facing: "out"
  }),
  en = (n, e, o) => ({
    id: n,
    to: e,
    bearing: o,
    ring: ya,
    facing: "in"
  }),
  Wt = [];
function wn(n) {
  let e = n.facing === "out" ? n.bearing : n.bearing + Math.PI;
  return {
    position: on(n.bearing, n.ring),
    yaw: Math.atan2(Math.sin(e), Math.cos(e))
  };
}
var xn = {
    bearing: 32 * ze,
    radius: 16,
    facing: -28 * ze
  },
  Tt = {
    width: 2.1,
    start: vn.position[2] + 1.6,
    fork: vn.position[2] - 3,
    stairs: [36 * ze, -36 * ze],
    head: Oe + 0.75
  },
  Ct = 7.6,
  tn = [0, 72 * ze, 144 * ze, -144 * ze, -72 * ze],
  Nn = 1.35,
  On = 2.6,
  Wn = 20.5,
  Po = [36 * ze, -36 * ze, 108 * ze, -108 * ze, 180 * ze],
  nn = {
    y: 7.2,
    size: 1.3
  },
  Yt = {
    bearing: -140 * ze,
    elevation: 15 * ze
  },
  Go = -24;
function Co(n, e) {
  let o = Math.hypot(n, e);
  if (o >= ba) return !1;
  let r = Oe - 0.1 - tt.run * (tt.steps - 1) - 0.05;
  if (o < r) return !0;
  let c = Math.atan2(n, e),
    s = (tt.width / 2 + 0.1) / o;
  return St.every(i => Math.abs(Math.atan2(Math.sin(c - i), Math.cos(c - i))) > s);
}
function Vo(n, e) {
  return Math.hypot(n, e) < Oe;
}
function on(n, e, o = $e) {
  return [Math.sin(n) * e, o, Math.cos(n) * e];
}
import * as Do from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var y = {
  accent: "#8f7bff",
  arcane: "#a99bff",
  arcaneHot: "#d8d0ff",
  zenith: "#140f2e",
  upper: "#34205a",
  mid: "#7a3a78",
  horizon: "#ff8a5a",
  sunGlow: "#ffc07a",
  haze: "#6a3f6e",
  cloudLit: "#ffb08a",
  cloudMid: "#b0608a",
  cloudShadow: "#3a2552",
  sand: "#b09a9a",
  sandLight: "#cdb8b0",
  sandDark: "#7d6a73",
  stone: "#8a7c8c",
  stoneDark: "#5a4e62",
  basalt: "#3a3040",
  basaltDark: "#241c2c",
  rock: "#4a3a4e",
  rockDark: "#2a2034",
  lava: "#ff6a1f",
  lavaHot: "#ffb347",
  ember: "#ff8a2a",
  fire: "#ffae4a",
  banner: "#6b1d3a",
  bannerDark: "#3e0f24",
  gold: "#e0b060",
  iron: "#2e2834",
  ink: "#1a1024",
  hurt: "#ff3b3b",
  telegraph: "#ff4a2a",
  warn: "#ffe14a",
  heal: "#b6ff00"
};
function Ee(n, e = 1) {
  return new Do.Color(n).multiplyScalar(e);
}
import * as ye from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import * as U from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import * as xe from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import { mergeGeometries as va } from "./vendor/002-BufferGeometryUtils.js";
function ut(n) {
  let e = n >>> 0;
  return () => {
    e = e + 1831565813 >>> 0;
    let o = e;
    return o = Math.imul(o ^ o >>> 15, o | 1), o ^= o + Math.imul(o ^ o >>> 7, o | 61), ((o ^ o >>> 14) >>> 0) / 4294967296;
  };
}
var _o = new xe.Vector3(),
  Bo = new xe.Vector3(),
  Fo = new xe.Vector3(),
  Lo = new xe.Vector3();
function Xt(n, e, o, r, c = {}) {
  let s = c.tile ?? 2,
    i = Math.abs(o - e) >= Math.PI * 2 - 1e-6,
    u = c.caps ?? !i,
    p = [],
    E = [],
    g = [],
    P = (x, H, M, O) => {
      p.push(x.x, x.y, x.z), E.push(H.x, H.y, H.z), g.push(M, O);
    },
    Q = (x, H, M) => {
      _o.subVectors(x[1], x[0]), Bo.subVectors(x[2], x[0]), Fo.crossVectors(_o, Bo), Lo.copy(H[0]).add(H[1]).add(H[2]), Fo.dot(Lo) >= 0 ? (P(x[0], H[0], M[0], M[1]), P(x[1], H[1], M[2], M[3]), P(x[2], H[2], M[4], M[5])) : (P(x[0], H[0], M[0], M[1]), P(x[2], H[2], M[4], M[5]), P(x[1], H[1], M[2], M[3]));
    },
    I = (x, H, M) => new xe.Vector3(Math.sin(M) * x, H, Math.cos(M) * x),
    G = (x, H, M) => {
      let O = Math.hypot(x, H) || 1,
        se = H / O,
        he = -x / O;
      return new xe.Vector3(Math.sin(M) * se, he, Math.cos(M) * se);
    },
    L = 0;
  for (let x = 0; x + 1 < n.length; x++) {
    let [H, M] = n[x],
      [O, se] = n[x + 1],
      he = Math.hypot(O - H, se - M);
    if (he < 1e-6) continue;
    let Y = L / s,
      ge = (L + he) / s;
    L += he;
    for (let fe = 0; fe < r; fe++) {
      let R = e + (o - e) * fe / r,
        ie = e + (o - e) * (fe + 1) / r,
        X = I(H, M, R),
        ce = I(O, se, R),
        l = I(H, M, ie),
        T = I(O, se, ie),
        C = G(O - H, se - M, R),
        V = G(O - H, se - M, ie),
        _ = R * Math.max(H, 0.5) / s,
        b = ie * Math.max(H, 0.5) / s,
        J = R * Math.max(O, 0.5) / s,
        K = ie * Math.max(O, 0.5) / s;
      (H > 1e-6 || O > 1e-6) && (Q([X, ce, T], [C, C, V], [_, Y, J, ge, K, ge]), Q([X, T, l], [C, V, V], [_, Y, K, ge, b, Y]));
    }
  }
  if (u) {
    let x = n.map(([M, O]) => new xe.Vector2(M, O)),
      H = xe.ShapeUtils.triangulateShape(x, []);
    for (let [M, O] of [[e, -1], [o, 1]]) {
      let se = new xe.Vector3(Math.cos(M) * O, 0, -Math.sin(M) * O);
      for (let he of H) {
        let Y = he.map(fe => {
            let [R, ie] = n[fe];
            return I(R, ie, M);
          }),
          ge = he.flatMap(fe => {
            let [R, ie] = n[fe];
            return [R / s, ie / s];
          });
        Q(Y, [se, se, se], ge);
      }
    }
  }
  let D = new xe.BufferGeometry();
  return D.setAttribute("position", new xe.Float32BufferAttribute(p, 3)), D.setAttribute("normal", new xe.Float32BufferAttribute(E, 3)), D.setAttribute("uv", new xe.Float32BufferAttribute(g, 2)), be(D, "#ffffff");
}
function be(n, e, o = 0) {
  let r = n.index ? n.toNonIndexed() : n,
    c = r.getAttribute("position").count;
  r.getAttribute("normal") || r.computeVertexNormals(), r.getAttribute("uv") || r.setAttribute("uv", new xe.Float32BufferAttribute(c * 2, 2));
  let s = new xe.Color(e),
    i = new Float32Array(c * 3),
    u = new Float32Array(c);
  for (let p = 0; p < c; p++) i[p * 3] = s.r, i[p * 3 + 1] = s.g, i[p * 3 + 2] = s.b, u[p] = o;
  return r.setAttribute("color", new xe.BufferAttribute(i, 3)), r.setAttribute("glow", new xe.BufferAttribute(u, 1)), r;
}
function Je(n, e, o = 1, r) {
  let c = n.getAttribute("position"),
    s = n.getAttribute("color");
  for (let i = 0; i < c.count; i++) {
    let u = c.getX(i),
      p = c.getY(i),
      E = c.getZ(i),
      g = Math.sin(u * 12.9898 + p * 78.233 + E * 37.719 + o * 4.1) * 43758.5453,
      P = 1 + ((g - Math.floor(g)) * 2 - 1) * e;
    if (r) {
      let Q = xe.MathUtils.clamp((p - r.below) / (r.above - r.below), 0, 1);
      P *= 1 - r.strength * (1 - Q);
    }
    s.setXYZ(i, s.getX(i) * P, s.getY(i) * P, s.getZ(i) * P);
  }
  return s.needsUpdate = !0, n;
}
function Ve(n, e, o = null, r = 1) {
  let c = new xe.Matrix4(),
    s = new xe.Quaternion();
  o && s.setFromEuler(o);
  let i = typeof r == "number" ? new xe.Vector3(r, r, r) : new xe.Vector3(r.x, r.y, r.z);
  return c.compose(new xe.Vector3(e.x, e.y, e.z), s, i), n.clone().applyMatrix4(c);
}
function Pe(n) {
  let e = va(n, !1);
  if (!e) throw new Error("ember-colosseum: geometries did not merge (attribute mismatch)");
  for (let o of n) o.dispose();
  return e;
}
function Vt(n) {
  let e = n.getAttribute("position"),
    o = n.getAttribute("normal"),
    r = new Map(),
    c = i => `${Math.round(e.getX(i) * 1e3)},${Math.round(e.getY(i) * 1e3)},${Math.round(e.getZ(i) * 1e3)}`;
  for (let i = 0; i < e.count; i++) {
    let u = c(i),
      p = r.get(u) ?? new xe.Vector3();
    p.x += o.getX(i), p.y += o.getY(i), p.z += o.getZ(i), r.set(u, p);
  }
  let s = new Float32Array(e.count * 3);
  for (let i = 0; i < e.count; i++) {
    let u = r.get(c(i)).clone().normalize();
    s[i * 3] = u.x, s[i * 3 + 1] = u.y, s[i * 3 + 2] = u.z;
  }
  return n.setAttribute("outline", new xe.BufferAttribute(s, 3)), n;
}
function wt(n, e, o, r = 1) {
  let c = ut(o),
    s = new xe.IcosahedronGeometry(n, e),
    i = s.getAttribute("position"),
    u = new Map();
  for (let E = 0; E < i.count; E++) {
    let g = `${i.getX(E).toFixed(3)},${i.getY(E).toFixed(3)},${i.getZ(E).toFixed(3)}`,
      P = u.get(g);
    P === void 0 && (P = 0.72 + c() * 0.5, u.set(g, P)), i.setXYZ(E, i.getX(E) * P, i.getY(E) * P * r, i.getZ(E) * P);
  }
  let p = s.index ? s.toNonIndexed() : s;
  return p.computeVertexNormals(), p !== s && s.dispose(), p;
}
var ft = 1.3,
  Le = (n = 0, e = 0, o = 0) => new U.Euler(n, e, o),
  ue = (n = 0, e = 0, o = 0) => new U.Vector3(n, e, o);
function de(n, e, o, r, c = null, s = 1) {
  return Ve(be(n, e, o), r, c, s);
}
function Yn(n, e) {
  let o = n.getAttribute("position"),
    r = n.getAttribute("color"),
    c = n.getAttribute("glow"),
    s = new U.Color();
  for (let i = 0; i < o.count; i++) {
    s.setRGB(r.getX(i), r.getY(i), r.getZ(i));
    let u = e(o.getX(i), o.getY(i), o.getZ(i), s);
    r.setXYZ(i, s.r, s.g, s.b), u !== void 0 && c.setX(i, u);
  }
  return n;
}
function No() {
  let n = new U.SphereGeometry(0.42, 20, 14),
    e = n.getAttribute("position");
  for (let s = 0; s < e.count; s++) {
    let i = e.getY(s),
      u = i < -0.28 ? -0.28 : i,
      p = i < -0.2 ? 1.08 : 1;
    e.setXYZ(s, e.getX(s) * p, u * 0.82, e.getZ(s) * p);
  }
  n.computeVertexNormals();
  let o = new U.Color(y.lavaHot),
    r = Yn(be(n, "#ffffff"), (s, i, u, p) => {
      let E = U.MathUtils.clamp((i + 0.23) / 0.58, 0, 1);
      return p.set("#8a2016").lerp(new U.Color("#ff5a26"), E), Math.sin(s * 23 + u * 7) * Math.sin(u * 19 - i * 11) * Math.sin(i * 17 + s * 5) > 0.36 && i > -0.12 ? (p.copy(o), 0.7) : 0;
    });
  r.translate(0, 0.24, 0);
  let c = [r];
  for (let s of [-1, 1]) c.push(de(new U.SphereGeometry(0.1, 10, 8), "#fff4e8", 0.15, ue(s * 0.15, 0.42, 0.29))), c.push(de(new U.SphereGeometry(0.052, 8, 6), y.ink, 0, ue(s * 0.15, 0.43, 0.375)));
  return c.push(de(new U.ConeGeometry(0.11, 0.3, 6), y.lavaHot, 1, ue(0, 0.64, -0.02), Le(-0.25, 0, 0))), c.push(de(new U.ConeGeometry(0.06, 0.18, 5), "#fff0b0", 1, ue(0.07, 0.6, 0.02), Le(0, 0, -0.4))), Vt(Pe(c));
}
function Oo() {
  let n = [de(new U.IcosahedronGeometry(0.3, 2), "#6fe8ff", 0.36, ue()), de(new U.ConeGeometry(0.27, 0.9, 10, 3), "#3fb6ff", 0.28, ue(0, 0.02, -0.5), Le(-Math.PI / 2, 0, 0)), de(new U.ConeGeometry(0.12, 0.5, 6), "#a8f8ff", 0.45, ue(0, 0.24, -0.3), Le(-2.2, 0, 0))];
  for (let o of [-1, 1]) n.push(de(new U.SphereGeometry(0.07, 8, 6), "#10223a", 0, ue(o * 0.11, 0.05, 0.26), null, {
    x: 1,
    y: 1.5,
    z: 0.6
  }));
  let e = Pe(n);
  return Yn(e, (o, r, c, s) => {
    c < -0.25 && s.multiplyScalar(U.MathUtils.clamp(1 + (c + 0.25) * 0.8, 0.45, 1));
  }), Vt(e);
}
function Wo() {
  let n = "#a3305e",
    e = "#5a1836",
    o = "#f2dcb4",
    r = [de(new U.SphereGeometry(0.25, 14, 10), n, 0, ue(0, 0, 0), null, {
      x: 1,
      y: 1.12,
      z: 0.9
    }), de(new U.SphereGeometry(0.17, 10, 8), "#d5588a", 0, ue(0, -0.04, 0.1), null, {
      x: 1,
      y: 1.1,
      z: 0.6
    }), de(new U.SphereGeometry(0.21, 14, 10), n, 0, ue(0, 0.36, 0.03))];
  for (let c of [-1, 1]) r.push(de(new U.ConeGeometry(0.055, 0.3, 6), o, 0, ue(c * 0.12, 0.6, -0.01), Le(-0.3, 0, -c * 0.45))), r.push(de(new U.ConeGeometry(0.06, 0.2, 4), n, 0, ue(c * 0.22, 0.4, 0), Le(0, 0, -c * 1.3))), r.push(de(new U.SphereGeometry(0.055, 8, 6), "#ffd84a", 1, ue(c * 0.085, 0.4, 0.19), null, {
    x: 1,
    y: 0.7,
    z: 0.6
  })), r.push(de(new U.CylinderGeometry(0.045, 0.04, 0.26, 6), e, 0, ue(c * 0.25, 0.02, 0.06), Le(0.5, 0, c * 0.5))), r.push(de(new U.ConeGeometry(0.07, 0.3, 6), e, 0, ue(c * 0.1, -0.33, 0), Le(Math.PI, 0, 0)));
  return r.push(de(new U.BoxGeometry(0.12, 0.022, 0.02), "#ffb347", 0.8, ue(0, 0.3, 0.205))), r.push(de(new U.CylinderGeometry(0.025, 0.035, 0.5, 5), e, 0, ue(0, -0.18, -0.28), Le(-0.9, 0, 0))), r.push(de(new U.TetrahedronGeometry(0.08, 0), e, 0, ue(0, -0.36, -0.46), Le(0.6, 0.8, 0))), Vt(Pe(r).scale(ft, ft, ft));
}
function Yo() {
  let n = new U.Shape();
  n.moveTo(0, 0), n.lineTo(0.18, 0.22), n.lineTo(0.62, 0.3), n.quadraticCurveTo(0.56, 0.12, 0.62, -0.04), n.quadraticCurveTo(0.46, 0, 0.42, -0.14), n.quadraticCurveTo(0.3, -0.04, 0.22, -0.18), n.quadraticCurveTo(0.12, -0.06, 0, 0);
  let e = new U.ShapeGeometry(n, 6),
    o = [be(e, "#7a2a64", 0.08)];
  return o.push(de(new U.CylinderGeometry(0.018, 0.022, 0.64, 4), "#3a0f2a", 0, ue(0.31, 0.15, 0.005), Le(0, 0, -1.4))), Pe(o);
}
function Xo(n, e, o, r, c) {
  let s = [];
  for (let i of [-1, 1]) s.push(de(new U.BoxGeometry(0.38, 0.62, 0.44), e, 0, ue(i * 0.3, 0.31, 0), Le(0, i * 0.08, 0))), s.push(de(wt(0.34, 0, 20 + i), n, 0, ue(i * 0.66, 1.52, 0.02), null, {
    x: 1.1,
    y: 0.9,
    z: 1
  }));
  s.push(de(new U.BoxGeometry(0.82, 0.34, 0.56), e, 0, ue(0, 0.72, 0))), s.push(de(new U.BoxGeometry(1.08, 0.92, 0.78), n, 0, ue(0, 1.24, 0), Le(0.08, 0, 0))), s.push(de(new U.BoxGeometry(0.3, 0.32, 0.1), o, r, ue(0, 1.26, 0.41), Le(0.08, 0, 0.78))), s.push(de(new U.BoxGeometry(1.1, 0.05, 0.8), o, r * 0.8, ue(0, 0.9, 0))), s.push(de(new U.BoxGeometry(0.05, 0.6, 0.8), o, r * 0.6, ue(0.3, 1.3, 0))), s.push(de(new U.BoxGeometry(0.46, 0.4, 0.44), n, 0, ue(0, 1.86, 0.14))), s.push(de(new U.BoxGeometry(0.52, 0.1, 0.12), e, 0, ue(0, 1.99, 0.35)));
  for (let i of [-1, 1]) s.push(de(new U.BoxGeometry(0.1, 0.05, 0.04), c, 1, ue(i * 0.11, 1.9, 0.365)));
  return s;
}
function Ko() {
  let n = Pe(Xo("#8a8494", "#5d5868", y.lava, 0.95, y.lavaHot)),
    e = ut(3);
  return Yn(n, (o, r, c, s) => {
    s.multiplyScalar(0.92 + e() * 0.12 - (r < 0.6 ? 0.1 : 0));
  }), Vt(n);
}
function jo() {
  let n = Xo("#4a4152", "#2e2736", y.arcane, 0.42, "#ff5a3a");
  for (let e = 0; e < 5; e++) {
    let o = (e - 2) / 2 * 0.7;
    n.push(de(new U.OctahedronGeometry(0.1, 0), y.arcane, 0.5, ue(Math.sin(o) * 0.2, 2.18 + (e === 2 ? 0.12 : 0), 0.14 + Math.cos(o) * 0.04), Le(0, 0, -o * 0.6), {
      x: 1,
      y: e === 2 ? 3.2 : 2.2,
      z: 1
    }));
  }
  for (let e of [-1, 1]) n.push(de(new U.ConeGeometry(0.1, 0.42, 5), "#1c1624", 0, ue(e * 0.72, 1.86, 0), Le(0, 0, -e * 0.5)));
  return Vt(Pe(n));
}
function Xn(n = "#8a8494", e = y.lava, o = 0.8) {
  let r = [de(new U.BoxGeometry(0.3, 0.5, 0.32), n, 0, ue(0, -0.28, 0), Le(0, 0, 0.05)), de(new U.BoxGeometry(0.34, 0.46, 0.36), n, 0, ue(0, -0.72, 0.04)), de(new U.BoxGeometry(0.36, 0.05, 0.38), e, o, ue(0, -0.52, 0.02)), de(wt(0.3, 0, 44), n, 0, ue(0, -1.08, 0.06), null, {
    x: 1.1,
    y: 0.95,
    z: 1.05
  })];
  return Vt(Pe(r));
}
function $o() {
  return be(new U.IcosahedronGeometry(0.16, 1), y.heal, 0.9);
}
function qo(n) {
  let e = new U.Shape();
  e.moveTo(-0.055, 0), e.lineTo(0.055, 0), e.lineTo(0.05, 0.6), e.lineTo(0, 0.72), e.lineTo(-0.05, 0.6), e.closePath();
  let o = new U.ExtrudeGeometry(e, {
    depth: 0.018,
    bevelEnabled: !0,
    bevelThickness: 0.01,
    bevelSize: 0.012,
    bevelSegments: 1
  });
  o.translate(0, 0.12, -0.009);
  let r = new U.Shape();
  r.moveTo(-0.014, 0), r.lineTo(0.014, 0), r.lineTo(0.012, 0.58), r.lineTo(0, 0.66), r.lineTo(-0.012, 0.58), r.closePath();
  let c = new U.ExtrudeGeometry(r, {
    depth: 0.042,
    bevelEnabled: !1
  });
  c.translate(0, 0.14, -0.021);
  let s = [be(o, "#cfc6ff", 0.55), be(c, "#f2eeff", 1), de(new U.BoxGeometry(0.26, 0.045, 0.07), y.gold, 0.1, ue(0, 0.1, 0)), de(new U.SphereGeometry(0.035, 8, 6), y.arcane, 0.9, ue(0, 0.1, 0.04)), de(new U.CylinderGeometry(0.024, 0.028, 0.16, 8), "#2a2034", 0, ue(0, 0.02, 0)), de(new U.OctahedronGeometry(0.04, 0), y.arcane, 1, ue(0, -0.08, 0), null, {
      x: 1,
      y: 1.4,
      z: 1
    })],
    i = new U.Mesh(Pe(s), n);
  return i.name = "ember-blade", i.castShadow = !0, i;
}
function Zo() {
  let n = [de(new U.CylinderGeometry(0.62, 0.78, 0.5, 8).translate(0, 0.004, 0), y.stone, 0, ue(0, 0.25, 0)), de(new U.CylinderGeometry(0.5, 0.56, 0.22, 8), y.sandLight, 0, ue(0, 0.61, 0)), de(new U.TorusGeometry(0.535, 0.03, 4, 24), y.arcane, 1, ue(0, 0.52, 0), Le(Math.PI / 2, 0, 0)), de(wt(0.34, 0, 71), y.stoneDark, 0, ue(0, 0.84, 0), null, {
    x: 1,
    y: 0.7,
    z: 0.8
  })];
  for (let e of [-1, 1]) n.push(de(new U.CylinderGeometry(0.025, 0.025, 1.9, 5), y.iron, 0, ue(e * 0.28, 1, -0.42), Le(0, 0, e * 0.32))), n.push(de(new U.ConeGeometry(0.05, 0.18, 4), "#c0b8d0", 0.1, ue(e * 0.58, 1.9, -0.42), Le(0, 0, e * 0.32)));
  return n.push(de(new U.CylinderGeometry(0.3, 0.3, 0.06, 12), "#6a3040", 0, ue(0, 1.1, -0.5), Le(Math.PI / 2, 0, 0))), n.push(de(new U.CylinderGeometry(0.1, 0.1, 0.07, 8), y.gold, 0.2, ue(0, 1.1, -0.47), Le(Math.PI / 2, 0, 0))), {
    geometry: Pe(n),
    bladeAt: ue(0, 0.98, 0),
    top: 1.9
  };
}
var Ta = `
attribute float glow;
attribute vec4 aFx;
attribute float aGhost;
varying float vGlow;
varying vec4 vFx;
varying vec3 vLocal;
varying float vGhost;
`,
  Uo = `
float dn = fract(sin(dot(floor(vLocal * 11.0), vec3(12.9898, 78.233, 37.719))) * 43758.5453);
if (vFx.z > 0.001 && dn < vFx.z) discard;
float edge = step(0.001, vFx.z) * step(dn, vFx.z + 0.14);
// Ghost: interleaved-gradient screen-door, so it stays opaque (no sorting).
if (vGhost > 0.01 && fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) < vGhost) discard;
`;
function Qo(n) {
  let e = (r, c) => {
      let s = new U.MeshToonMaterial({
        vertexColors: !0,
        gradientMap: n,
        side: r
      });
      return s.onBeforeCompile = i => {
        i.vertexShader = i.vertexShader.replace("#include <common>", `#include <common>
${Ta}`).replace("#include <begin_vertex>", `#include <begin_vertex>
vGlow = glow;
vFx = aFx;
vLocal = position;
vGhost = aGhost;`), i.fragmentShader = i.fragmentShader.replace("#include <common>", `#include <common>
varying float vGlow;
varying vec4 vFx;
varying vec3 vLocal;
varying float vGhost;`).replace("#include <color_fragment>", `#include <color_fragment>
${Uo}
diffuseColor.rgb *= mix(vec3(1.0), vec3(1.3, 1.02, 0.5), vFx.w);`).replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
          float rim = 1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0);
          totalEmissiveRadiance += vec3(1.0, 0.55, 0.3) * pow(rim, 3.0) * 0.45;
          totalEmissiveRadiance += vColor.rgb * vGlow * (2.2 + vFx.y * 2.5);
          totalEmissiveRadiance += vec3(1.0, 0.38, 0.06) * edge * 2.4;
          totalEmissiveRadiance += vec3(1.0, 0.78, 0.3) * vFx.w * 0.12;`).replace("#include <dithering_fragment>", `#include <dithering_fragment>
gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0, 0.97, 0.92), clamp(vFx.x, 0.0, 1.0));`);
      }, s.customProgramCacheKey = () => `ember-creature-${c}`, s;
    },
    o = new U.MeshBasicMaterial({
      color: y.ink,
      side: U.BackSide
    });
  return o.onBeforeCompile = r => {
    r.vertexShader = r.vertexShader.replace("#include <common>", `#include <common>
attribute vec3 outline;
attribute vec4 aFx;
attribute float aGhost;
varying vec4 vFx;
varying vec3 vLocal;
varying float vGhost;`).replace("#include <begin_vertex>", `#include <begin_vertex>
vFx = aFx;
vLocal = position;
vGhost = aGhost;
transformed += normalize(outline) * 0.022;`), r.fragmentShader = r.fragmentShader.replace("#include <common>", `#include <common>
varying vec4 vFx;
varying vec3 vLocal;
varying float vGhost;`).replace("#include <color_fragment>", `#include <color_fragment>
${Uo}`);
  }, o.customProgramCacheKey = () => "ember-creature-ink", {
    body: e(U.FrontSide, "front"),
    wing: e(U.DoubleSide, "double"),
    ink: o
  };
}
var Ue = {
    slime: {
      name: "Ember Slime",
      hp: 19,
      damage: 6,
      speed: 3.7,
      radius: 0.42,
      height: 0.38,
      mass: 1,
      xp: 6,
      score: 10,
      hitRadius: 0.62
    },
    wisp: {
      name: "Hollow Wisp",
      hp: 26,
      damage: 8,
      speed: 5.4,
      radius: 0.34,
      height: 1.05,
      mass: 0.8,
      xp: 9,
      score: 20,
      hitRadius: 0.62
    },
    imp: {
      name: "Cinder Imp",
      hp: 34,
      damage: 12,
      speed: 3.3,
      radius: 0.5,
      height: 1.55,
      mass: 0.9,
      xp: 12,
      score: 25,
      hitRadius: 0.85
    },
    golem: {
      name: "Stone Golem",
      hp: 150,
      damage: 22,
      speed: 1.55,
      radius: 0.85,
      height: 1.1,
      mass: 4,
      xp: 28,
      score: 60,
      hitRadius: 1.15
    },
    warlord: {
      name: "Ashen Warlord",
      hp: 560,
      damage: 30,
      speed: 1.9,
      radius: 1.45,
      height: 2.1,
      mass: 14,
      xp: 160,
      score: 600,
      hitRadius: 1.9
    }
  },
  Kt = {
    hp: 2.4,
    damage: 1.4,
    xp: 2.5,
    score: 3,
    scale: 1.25
  },
  kt = 5,
  wa = n => (1 + 0.15 * Math.max(0, n - 1)) * 1.025 ** Math.max(0, n - 9),
  xa = n => (1 + 0.09 * Math.max(0, n - 1)) * 1.08 ** Math.max(0, n - 10);
function Kn(n, e, o, r = 1) {
  return Math.round(Ue[n].hp * wa(e) * (o ? Kt.hp : 1) * r);
}
function jn(n, e, o) {
  return Math.round(Ue[n].damage * xa(e) * (o ? Kt.damage : 1));
}
function $n(n, e, o) {
  return e + (o ? 2 : 0) + (n === "warlord" ? 3 : 0) + (n === "golem" ? 1 : 0);
}
function er(n, e) {
  return e ? `Elite ${Ue[n].name}` : Ue[n].name;
}
function tr(n, e, o) {
  return Math.round(Ue[n].xp * (1 + 0.1 * (e - 1)) * (o ? Kt.xp : 1));
}
function qn(n, e, o) {
  return Math.round(Ue[n].score * (1 + 0.1 * (e - 1)) * (o ? Kt.score : 1));
}
var nr = n => 100 * n,
  or = n => 10 * n,
  Zn = {
    "twin-warlords": "Twin Warlords",
    "warlord-guard": "The Warlord\u2019s guard",
    "wisp-storm": "Wisp storm",
    "stone-march": "Stone march",
    "imp-barrage": "Imp barrage",
    "elite-surge": "Elite surge"
  },
  Jo = ["wisp-storm", "stone-march", "imp-barrage", "elite-surge"],
  rr = 0.7;
function ar(n) {
  let e = Math.max(1, Math.floor(n));
  return e % kt === 0 ? e < 15 ? null : e / kt % 2 === 1 ? "twin-warlords" : "warlord-guard" : e >= 7 && e % kt === 2 ? Jo[(e - 7) / kt % Jo.length] : null;
}
function Qn(n) {
  let e = ar(n);
  return e ? `Wave ${n} \xB7 ${Zn[e]}` : n % kt === 0 ? `Wave ${n} \xB7 Warlord` : `Wave ${n}`;
}
function sr(n, e = Math.random) {
  let o = Math.max(1, Math.floor(n)),
    r = o % kt === 0,
    c = ar(o),
    s = Math.min(18, Math.round(4 + o * 1.6)),
    i = o >= 2 ? Math.min(8, Math.round(1 + (o - 2) * 0.7)) : 0,
    u = o >= 3 ? Math.min(7, Math.round(1 + (o - 3) * 0.6)) : 0,
    p = o >= 4 ? Math.min(5, 1 + Math.floor((o - 4) / 2)) : 0,
    E = o >= 6 ? Math.min(0.25, 0.04 * (o - 5)) : 0;
  r && (s = Math.round(s * 0.5), i = Math.round(i * 0.5), u = Math.round(u * 0.5), p = Math.max(0, p - 2)), c === "twin-warlords" ? (s = Math.round(s * 0.6), p = 0) : c === "warlord-guard" ? E = 0.75 : c === "wisp-storm" ? (i = Math.max(6, Math.round(i * 1.6)), s = Math.round(s * 0.6)) : c === "stone-march" ? (p = Math.max(3, Math.round(p * 1.4)), s = Math.round(s * 0.6), u = Math.round(u * 0.5)) : c === "imp-barrage" ? (u = Math.max(5, Math.round(u * 1.7)), s = Math.round(s * 0.7), i = Math.round(i * 0.7)) : c === "elite-surge" && (E = 0.6);
  let g = r ? c === "twin-warlords" ? 2 : 1 : 0,
    P = [];
  for (let x = 0; x < i; x++) P.push("wisp");
  for (let x = 0; x < u; x++) P.push("imp");
  for (let x = 0; x < p; x++) P.push("golem");
  let Q = [];
  for (let x = 0; x < s; x++) Q.push("slime");
  let I = Q.splice(0, Math.min(3, Q.length)),
    G = [...Q, ...P];
  for (let x = G.length - 1; x > 0; x--) {
    let H = Math.floor(e() * (x + 1)),
      M = G[x];
    G[x] = G[H], G[H] = M;
  }
  let L = [...I, ...G],
    D = Math.ceil(L.length / 4);
  for (let x = 0; x < D; x++) {
    if (L[x] !== "golem") continue;
    let H = L.findIndex((M, O) => O >= D && M !== "golem");
    H >= 0 && (L[x] = L[H], L[H] = "golem");
  }
  for (let x = 0; x < g; x++) L.unshift("warlord");
  return {
    wave: o,
    boss: r,
    twist: c,
    warlords: g,
    queue: L,
    eliteChance: E,
    interval: Math.max(0.8, 2.3 - 0.12 * o),
    cap: Math.min(24, 6 + 2 * o),
    burst: o < 3 ? 2 : o < 7 ? 3 : 4
  };
}
var et = {
    hp: 100,
    hpPerLevel: 12,
    energy: 100,
    energyRegen: 8,
    energyPerHit: 4,
    weapon: 14,
    swing: 1,
    melee: 1.75,
    crit: 0.18,
    critMultiplier: 1.9
  },
  jt = n => et.hp + et.hpPerLevel * (n - 1),
  Ma = n => 1 + 0.1 * (n - 1),
  Jn = n => 45 + 35 * (n - 1) + 4 * Math.max(0, n - 8) ** 2,
  ir = 0.25,
  lr = 0.12;
function $t(n, e, o, r, c = 0) {
  let s = 0.85 + o() * 0.3,
    i = o() < et.crit + c;
  return r.amount = Math.max(1, Math.round(et.weapon * n * Ma(e) * s * (i ? et.critMultiplier : 1))), r.crit = i, r;
}
var ht = [{
    id: "cleave",
    key: "1",
    name: "Cleave",
    icon: "cleave",
    cooldown: 2.5,
    cost: 0,
    power: 1.6
  }, {
    id: "firebolt",
    key: "2",
    name: "Firebolt",
    icon: "fire",
    cooldown: 3,
    cost: 20,
    power: 2.6
  }, {
    id: "whirlwind",
    key: "3",
    name: "Whirlwind",
    icon: "whirl",
    cooldown: 7,
    cost: 30,
    power: 1.4
  }, {
    id: "blink",
    key: "4",
    name: "Blink",
    icon: "dash",
    cooldown: 5,
    cost: 15,
    power: 0.6
  }, {
    id: "mend",
    key: "5",
    name: "Mend",
    icon: "heal",
    cooldown: 12,
    cost: 25,
    power: 0.32
  }],
  Dt = {
    range: 2.7,
    halfArc: 75 * Math.PI / 180,
    knockback: 5
  },
  at = {
    speed: 22,
    life: 1.1,
    splash: 1.8,
    splashShare: 0.5,
    knockback: 4
  },
  rn = {
    radius: 3.8,
    knockback: 9
  },
  qt = {
    distance: 6.5,
    duration: 0.12,
    invulnerable: 0.35,
    pathRadius: 1.1
  },
  Ra = {
    perLevel: 4
  },
  cr = n => Math.round(jt(n) * ht[4].power + Ra.perLevel * (n - 1));
function xt(n) {
  let e = String(Math.max(0, Math.round(n))),
    o = "";
  for (let r = 0; r < e.length; r++) r > 0 && (e.length - r) % 3 === 0 && (o += ","), o += e[r];
  return o;
}
function Ha(n) {
  let e = Math.max(0, Math.floor(n));
  return `${Math.floor(e / 60)}:${String(e % 60).padStart(2, "0")}`;
}
function ur(n, e, o) {
  return `Wave ${n} \xB7 ${e} ${e === 1 ? "kill" : "kills"} \xB7 ${Ha(o)}`;
}
var Mt = 32,
  an = {
    wisp: 1.05,
    imp: 1.55
  },
  mr = {
    slime: 0.78,
    wisp: 1.5,
    imp: 2.3,
    golem: 2.3,
    warlord: 2.45
  },
  Zt = 1.75,
  dr = [-1, 1],
  fr = Math.PI * 2,
  Sa = {
    slime: Ee(y.lavaHot, 2.4),
    wisp: Ee("#7ff4ff", 2.4),
    imp: Ee("#ff5aa8", 2.2),
    golem: Ee("#ffb070", 2),
    warlord: Ee(y.arcane, 2.6)
  },
  Mn = n => Sa[n];
function zt(n, e, o, r, c = !1) {
  let s = new ye.InstancedBufferAttribute(new Float32Array(o * 4), 4);
  s.setUsage(ye.DynamicDrawUsage), n.setAttribute("aFx", s);
  let i = new ye.InstancedBufferAttribute(new Float32Array(o), 1);
  i.setUsage(ye.DynamicDrawUsage), n.setAttribute("aGhost", i);
  let u = new ye.InstancedMesh(n, c ? e.wing : e.body, o);
  u.name = r, u.castShadow = !0, u.frustumCulled = !1, u.instanceMatrix.setUsage(ye.DynamicDrawUsage), u.count = 0;
  let p = new ye.InstancedMesh(n, e.ink, o);
  return p.name = `${r}-ink`, p.frustumCulled = !1, p.instanceMatrix = u.instanceMatrix, p.count = 0, p.visible = !c, {
    body: u,
    ink: p,
    fx: s,
    ghost: i,
    count: 0
  };
}
function hr(n, e, o, r, c, s) {
  let i = {
      slime: zt(No(), e, Mt, "ember-slimes"),
      wisp: zt(Oo(), e, Mt, "ember-wisps"),
      imp: zt(Wo(), e, Mt, "ember-imps"),
      golem: zt(Ko(), e, 16, "ember-golems"),
      warlord: zt(jo(), e, 2, "ember-warlord")
    },
    u = zt(Yo(), e, Mt * 2, "ember-imp-wings", !0),
    p = zt(Xn(), e, 32, "ember-golem-arms"),
    E = zt(Xn("#4a4152", y.arcane, 0.4), e, 4, "ember-warlord-arms"),
    g = new ye.InstancedMesh(new ye.IcosahedronGeometry(1, 1), new ye.MeshBasicMaterial({
      visible: !1
    }), Mt);
  g.name = "ember-enemy-picks", g.count = 0, g.boundingSphere = new ye.Sphere(new ye.Vector3(0, me, 0), Pt + 6), g.frustumCulled = !1;
  let P = new Array(Mt).fill(null),
    Q = new ye.Matrix4().makeScale(0, 0, 0).setPosition(0, -1e3, 0);
  n.addHoverTarget(g, d => {
    let B = d.instanceId !== void 0 ? P[d.instanceId] : null;
    return B?.live && B.state !== "dying" ? "attack" : null;
  });
  let I = [...Object.values(i), u, p, E],
    G = Object.values(i),
    L = [g];
  for (let d of I) L.push(d.body, d.ink);
  let D = [];
  for (let d = 0; d < Mt; d++) D.push({
    index: d,
    live: !1,
    kind: "slime",
    elite: !1,
    name: "",
    state: "spawn",
    t: 0,
    x: 0,
    z: 0,
    y: 0,
    vx: 0,
    vz: 0,
    facing: 0,
    hp: 1,
    maxHp: 1,
    damage: 1,
    level: 1,
    size: 1,
    radius: 0.4,
    flash: 0,
    squash: 0,
    boost: 0,
    dissolve: 0,
    cooldown: 0,
    aimX: 0,
    aimZ: 0,
    heading: 0,
    length: 0,
    travelled: 0,
    startX: 0,
    startZ: 0,
    orbit: 0,
    orbitDir: 1,
    hopT: 0,
    anim: 0,
    decal: -1,
    dealt: !1,
    attacks: 0,
    summons: 0,
    nova: !1,
    novaR: 0,
    ghost: 0
  });
  let x = D.map(() => r.claim()),
    H = new ye.Vector3(0, 1e6, 0),
    M = new ye.Vector3(),
    O = Ee(y.warn, 1.7),
    se = Ee("#ff6a2a", 2.2),
    he = Ee("#5ef0ff", 1),
    Y = Ee(y.lavaHot, 1.4),
    ge = Ee(y.arcane, 1),
    fe = Ee("#ffd27a", 1),
    R = Ee(y.ember, 2.2),
    ie = Ee("#ffcf9a", 1.6),
    X = new ye.Matrix4(),
    ce = new ye.Matrix4(),
    l = new ye.Matrix4(),
    T = new ye.Quaternion(),
    C = new ye.Euler(0, 0, 0, "YXZ"),
    V = new ye.Vector3(),
    _ = new ye.Vector3(),
    b = new ye.Vector3(),
    J = new ye.Vector3(),
    K = (d, B) => {
      d.state === "dying" && B !== "dying" || (d.state = B, d.t = 0);
    },
    Z = d => {
      d.decal >= 0 && o.cancel(d.decal), d.decal = -1;
    },
    ee = (d, B, a) => {
      let S = B - d.facing;
      S = Math.atan2(Math.sin(S), Math.cos(S)), d.facing += ye.MathUtils.clamp(S, -a, a);
    },
    we = (d, B, a, S) => {
      let t = B - d.x,
        j = a - d.z,
        k = Math.hypot(t, j);
      if (k < 1e-4) return 0;
      let ae = Math.min(S, k);
      return d.x += t / k * ae, d.z += j / k * ae, Math.atan2(t, j);
    },
    Me = d => {
      let B = Pt - d.radius,
        a = Math.hypot(d.x, d.z);
      return a > B ? (d.x *= B / a, d.z *= B / a, !0) : !1;
    },
    je = d => an[d.kind] ?? 0,
    Ge = {
      objects: L,
      pool: D,
      targetable(d) {
        return d.live && d.state !== "dying" && d.state !== "sleep" && (d.state !== "spawn" || d.t > 0.25);
      },
      alive() {
        let d = 0;
        for (let B of D) B.live && B.state !== "dying" && B.state !== "sleep" && d++;
        return d;
      },
      sleep(d, B) {
        let a = Ge.spawn("slime", !1, d, B, 1);
        a && (a.state = "sleep", a.t = Math.random() * 10, a.facing = Math.atan2(-d, -B) + (Math.random() - 0.5) * 1.2, a.boost = 0);
      },
      sleepers() {
        let d = 0;
        for (let B of D) B.live && B.state === "sleep" && d++;
        return d;
      },
      wake(d) {
        let B = 0;
        for (let a of D) !a.live || a.state !== "sleep" || (a.maxHp = Kn("slime", d, !1), a.hp = a.maxHp, a.damage = jn("slime", d, !1), a.level = $n("slime", d, !1), a.state = "recover", a.t = 0, a.boost = 2.6, a.squash = 1, a.cooldown = 0.9 + B * 0.35, a.facing = Math.atan2(s.player.x - a.x, s.player.z - a.z), B++);
        return B > 0 && c.squelch(), B;
      },
      setView(d, B) {
        H.copy(d), M.copy(B);
      },
      spawn(d, B, a, S, t, j = 1) {
        let k = D.find($ => !$.live);
        if (!k) return null;
        let ae = Ue[d];
        return k.live = !0, k.kind = d, k.elite = B && d !== "warlord", k.name = er(d, k.elite), k.state = "spawn", k.t = 0, k.x = a, k.z = S, k.y = 0, k.vx = 0, k.vz = 0, k.facing = Math.atan2(s.player.x - a, s.player.z - S), k.maxHp = Kn(d, t, k.elite, j), k.hp = k.maxHp, k.damage = jn(d, t, k.elite), k.level = $n(d, t, k.elite), k.size = d === "warlord" ? Zt : k.elite ? Kt.scale : 1, k.radius = ae.radius * (d === "warlord" ? 1 : k.size), k.flash = 0, k.squash = 0, k.boost = 1.5, k.dissolve = 0, k.cooldown = 0.6 + Math.random() * 0.8, k.orbit = Math.atan2(a - s.player.x, S - s.player.z), k.orbitDir = Math.random() < 0.5 ? -1 : 1, k.hopT = Math.random() * 0.5, k.anim = Math.random() * fr, k.decal = -1, k.dealt = !1, k.attacks = 0, k.summons = 0, k.nova = !1, k.novaR = 0, k.ghost = 0, k;
      },
      damage(d, B, a, S, t) {
        if (!Ge.targetable(d)) return !1;
        d.hp -= B, d.flash = 1, d.squash = 1;
        let j = d.x - a,
          k = d.z - S,
          ae = Math.hypot(j, k) || 1,
          $ = t / Ue[d.kind].mass / (d.elite ? 1.6 : 1);
        return d.vx += j / ae * $, d.vz += k / ae * $, d.hp <= 0 ? (d.hp = 0, Z(d), K(d, "dying"), !0) : (t >= 3 && d.state === "windup" && (d.kind === "slime" || d.kind === "wisp" || d.kind === "imp") && (Z(d), K(d, "recover"), d.t = 0.2, d.cooldown = 0.8), !1);
      },
      pick(d, B) {
        let a = null,
          S = B;
        for (let t of D) {
          if (!Ge.targetable(t)) continue;
          Ge.centre(t, J);
          let j = Ue[t.kind].hitRadius * (t.kind === "warlord" ? 1 : t.size);
          J.sub(d.origin);
          let k = J.dot(d.direction),
            ae = J.lengthSq() - k * k;
          if (ae > j * j) continue;
          let $ = k - Math.sqrt(j * j - ae);
          $ > 0 && $ < S && (S = $, a = t);
        }
        return a;
      },
      reachable(d, B) {
        let a = d.kind === "warlord" ? Zt : d.size,
          S = an[d.kind],
          t = me + d.y + (S === void 0 ? 0 : S - 0.4 * a),
          j = me + d.y + mr[d.kind] * a;
        return t < B + 2.3 && j > B - 0.4;
      },
      top(d, B) {
        return B.set(d.x, me + d.y + mr[d.kind] * (d.kind === "warlord" ? Zt : d.size), d.z);
      },
      centre(d, B) {
        let a = an[d.kind] ?? Ue[d.kind].height * d.size;
        return B.set(d.x, me + d.y + a, d.z);
      },
      banish() {
        for (let d of D) !d.live || d.state === "dying" || (Z(d), K(d, "dying"), d.t = -Math.random() * 0.5, d.flash = 1);
      },
      clear() {
        for (let d of D) Z(d), d.live = !1;
        Ze(0);
      },
      update(d, B) {
        let a = s.player,
          S = s.engaged();
        for (let t of D) {
          if (!t.live) continue;
          t.t += d, t.flash = Math.max(0, t.flash - d * 10), t.squash = Math.max(0, t.squash - d * 5), t.boost = Math.max(0, t.boost - d * 2), t.cooldown -= d, t.x += t.vx * d, t.z += t.vz * d;
          let j = Math.exp(-7 * d);
          t.vx *= j, t.vz *= j;
          let k = a.x - t.x,
            ae = a.z - t.z,
            $ = Math.hypot(k, ae),
            re = Math.atan2(k, ae),
            f = a.y - me;
          if (t.state === "sleep") {
            t.vx = 0, t.vz = 0, t.y = 0;
            continue;
          }
          if (t.state === "dying") {
            t.dissolve = ye.MathUtils.clamp(t.t / 0.5, 0, 1), t.t >= 0.55 && (t.live = !1, Z(t));
            continue;
          }
          if (t.state === "spawn") {
            t.y = t.kind === "wisp" || t.kind === "imp" ? (1 - Math.min(1, t.t / 0.55)) * -0.9 : 0, t.t >= 0.55 && K(t, "move");
            continue;
          }
          switch (t.kind) {
            case "slime":
              {
                let W = t.elite ? 0.6 : 0.52;
                if (t.state === "move") {
                  t.hopT += d;
                  let z = t.hopT % W / W,
                    w = z < 0.62;
                  if (t.y = w ? Math.sin(Math.PI * z / 0.62) * 0.32 : 0, w) {
                    let ne = we(t, a.x, a.z, Ue.slime.speed * 1.5 * d);
                    ee(t, ne, 10 * d);
                  }
                  S && $ < 1.85 + t.radius && t.cooldown <= 0 && !w && (K(t, "windup"), t.aimX = a.x, t.aimZ = a.z, t.decal = o.decal("telegraph", a.x, a.z, 0.95, 1, O, {
                    held: !0
                  }));
                } else if (t.state === "windup") {
                  if (ee(t, re, 12 * d), t.boost = Math.max(t.boost, t.t / 0.38 * 2), o.setProgress(t.decal, t.t / 0.38), t.t >= 0.38) {
                    K(t, "attack"), t.startX = t.x, t.startZ = t.z;
                    let z = t.aimX - t.x,
                      w = t.aimZ - t.z,
                      ne = Math.hypot(z, w),
                      ve = Math.min(2.3, ne);
                    t.aimX = t.x + (ne > 0 ? z / ne * ve : 0), t.aimZ = t.z + (ne > 0 ? w / ne * ve : 0);
                  }
                } else if (t.state === "attack") {
                  let z = Math.min(1, t.t / 0.3);
                  if (t.x = ye.MathUtils.lerp(t.startX, t.aimX, z), t.z = ye.MathUtils.lerp(t.startZ, t.aimZ, z), t.y = Math.sin(Math.PI * z) * 0.75, z >= 1) {
                    t.y = 0, Z(t);
                    let w = a.x - t.x,
                      ne = a.z - t.z;
                    Math.hypot(w, ne) < 1 + t.radius * 0.5 && f < 0.95 && s.canHurt() && s.hurt(t.damage, t.x, t.z, !1, "slime"), c.squelch(), o.dust(t.x, me, t.z, 4, 0.4), K(t, "recover");
                  }
                } else t.state === "recover" && t.t >= 0.45 && (K(t, "move"), t.cooldown = 1.1 + Math.random() * 0.6);
                break;
              }
            case "wisp":
              {
                let W = Math.sin(B * 3 + t.index) * 0.12;
                if (t.state === "move") {
                  t.y = W, t.orbit += t.orbitDir * 1.5 * d;
                  let z = 4.8 + Math.sin(B * 0.7 + t.index) * 0.6,
                    w = a.x + Math.sin(t.orbit) * z,
                    ne = a.z + Math.cos(t.orbit) * z,
                    ve = we(t, w, ne, (t.elite ? 6.2 : Ue.wisp.speed) * d);
                  ee(t, ve, 8 * d), S && t.cooldown <= 0 && $ < 9 && $ > 1.5 && (K(t, "windup"), t.heading = re, t.length = ye.MathUtils.clamp($ + 2.5, 5, 10), t.decal = o.decal("line", t.x, t.z, 0.42, 1, O, {
                    heading: t.heading,
                    length: t.length,
                    held: !0
                  }), c.shriek());
                } else if (t.state === "windup") t.y = W, ee(t, t.heading, 14 * d), t.boost = Math.max(t.boost, t.t / 0.55 * 2.6), t.x += Math.sin(B * 70) * 0.012, o.setProgress(t.decal, t.t / 0.55), o.move(t.decal, t.x, t.z), t.t >= 0.55 && (K(t, "attack"), t.travelled = 0, t.dealt = !1);else if (t.state === "attack") {
                  let z = 15 * d;
                  t.x += Math.sin(t.heading) * z, t.z += Math.cos(t.heading) * z, t.travelled += z, t.y = ye.MathUtils.lerp(t.y, -0.35, Math.min(1, d * 10)), t.boost = 2;
                  let w = me + 1.05 + t.y,
                    ne = a.x - t.x,
                    ve = a.z - t.z,
                    Xe = a.y + 0.55 - w;
                  !t.dealt && Math.hypot(ne, ve, Xe) < 0.95 && s.canHurt() && (t.dealt = !0, s.hurt(t.damage, t.x, t.z, !1, "wisp")), (t.travelled >= t.length || Me(t)) && (Z(t), K(t, "recover"));
                } else t.state === "recover" && (t.y = ye.MathUtils.lerp(t.y, W, Math.min(1, d * 4)), t.t >= 0.5 && (K(t, "move"), t.cooldown = 2.2 + Math.random() * 1.4, Math.random() < 0.5 && (t.orbitDir = -t.orbitDir), t.orbit = Math.atan2(t.x - a.x, t.z - a.z)));
                break;
              }
            case "imp":
              {
                if (t.y = Math.sin(B * 2.4 + t.index * 1.3) * 0.14, ee(t, re, 6 * d), t.state === "move") {
                  t.orbit += t.orbitDir * 0.25 * d;
                  let W = 7.2,
                    z = a.x + Math.sin(t.orbit) * W,
                    w = a.z + Math.cos(t.orbit) * W;
                  if (we(t, z, w, Ue.imp.speed * d), S && t.cooldown <= 0 && $ < 13) {
                    K(t, "windup");
                    let ne = 0.55,
                      ve = a.x + s.playerVelocity.x * ne,
                      Xe = a.z + s.playerVelocity.z * ne,
                      Ae = Math.hypot(ve, Xe),
                      _t = Pt + 0.6;
                    Ae > _t && (ve *= _t / Ae, Xe *= _t / Ae), t.aimX = ve, t.aimZ = Xe, t.decal = o.decal("telegraph", ve, Xe, 1.45, 1, O, {
                      held: !0
                    }), c.cackle();
                  }
                } else t.state === "windup" ? (t.boost = Math.max(t.boost, t.t / 0.85 * 1.5), o.setProgress(t.decal, t.t / 0.85 * 0.45), t.t >= 0.85 && (K(t, "attack"), Ge.centre(t, b), s.fireball(b.x, b.y + 0.55, b.z, t.aimX, t.aimZ, t.damage, t.decal), t.decal = -1, c.fireball())) : t.state === "attack" ? t.t >= 0.25 && K(t, "recover") : t.state === "recover" && t.t >= 0.6 && (K(t, "move"), t.cooldown = 2.6 + Math.random() * 1.6, Math.random() < 0.4 && (t.orbitDir = -t.orbitDir));
                break;
              }
            case "golem":
            case "warlord":
              {
                let W = t.kind === "warlord",
                  z = W ? Zt : t.size;
                if (t.state === "move") {
                  let w = W ? Ue.warlord.speed : Ue.golem.speed * (t.elite ? 1.15 : 1),
                    ne = (W ? 2.6 : 1.9) + t.radius;
                  if ($ > ne * 0.85 && (we(t, a.x, a.z, w * d), t.anim += d * w * 2.6), ee(t, re, (W ? 1.6 : 2.4) * d), W) {
                    let ve = t.hp / t.maxHp;
                    (ve < 0.66 && t.summons === 0 || ve < 0.33 && t.summons === 1) && (t.summons++, s.summon("slime", 4, t.x, t.z), c.roar(), s.shake(0.35));
                  }
                  if (S && t.cooldown <= 0 && ($ < ne || W && t.attacks % 3 === 2 && $ < 9)) if (K(t, "windup"), t.nova = W && t.attacks % 3 === 2, t.heading = re, t.nova) t.decal = o.decal("telegraph", t.x, t.z, 2.2, 1, O, {
                    held: !0
                  }), c.roar(), s.novaWarning();else {
                    let ve = W ? 2.2 : 1.25 * z;
                    t.aimX = t.x + Math.sin(t.heading) * ve, t.aimZ = t.z + Math.cos(t.heading) * ve, t.length = W ? 3.3 : 2.2 * z, t.decal = o.decal("telegraph", t.aimX, t.aimZ, t.length, 1, O, {
                      held: !0
                    });
                  }
                } else if (t.state === "windup") {
                  let w = t.nova ? 1.1 : W ? 1.15 : t.elite ? 0.85 : 1;
                  if (ee(t, t.heading, 3 * d), t.boost = Math.max(t.boost, t.t / w * 2), o.setProgress(t.decal, t.t / w), t.nova && o.move(t.decal, t.x, t.z), t.t >= w) if (Z(t), K(t, "attack"), t.attacks++, t.nova) t.novaR = 1.8, t.dealt = !1, t.decal = o.decal("shock", t.x, t.z, t.novaR, 1, se, {
                    held: !0,
                    intensity: 1.3
                  }), o.setProgress(t.decal, 0.35), s.shake(0.4), c.explode(!0);else {
                    let ne = a.x - t.aimX,
                      ve = a.z - t.aimZ;
                    Math.hypot(ne, ve) < t.length + 0.25 && f < 0.75 && s.canHurt() && s.hurt(t.damage, t.aimX, t.aimZ, !0, t.kind);
                    let Ae = Math.hypot(ne, ve);
                    s.shake(W ? 0.55 : Ae < 7 ? 0.35 : 0.15), c.slam(W), o.decal("shock", t.aimX, t.aimZ, t.length * 0.5, 0.45, ie, {
                      grow: 2.4
                    }), o.dust(t.aimX, me, t.aimZ, W ? 18 : 12, t.length * 0.6), b.set(t.aimX, me + 0.2, t.aimZ), o.sparks(b, R, W ? 26 : 14, 6), o.flash(b, t.length * 1.6, Y, 0.3, 1.4, 0.8);
                  }
                } else if (t.state === "attack") {
                  if (t.nova) {
                    if (t.novaR += 7.5 * d, o.setRadius(t.decal, t.novaR), o.move(t.decal, t.x, t.z), Math.random() < 0.9) {
                      let w = Math.random() * fr;
                      b.set(t.x + Math.sin(w) * t.novaR, me + 0.15, t.z + Math.cos(w) * t.novaR), o.sparks(b, R, 2, 2.5);
                    }
                    !t.dealt && Math.abs($ - t.novaR) < 0.55 && f < 0.45 && s.canHurt() && (t.dealt = !0, s.hurt(Math.round(t.damage * 0.7), t.x, t.z, !0, t.kind)), t.novaR > Pt + 1.5 && (Z(t), K(t, "recover"));
                  } else t.t >= 0.16 && K(t, "recover");
                } else t.state === "recover" && t.t >= (W ? 1 : 0.85) && (K(t, "move"), t.cooldown = W ? 0.9 + Math.random() * 0.6 : 1.6 + Math.random() * 0.8);
                break;
              }
          }
          if (t.kind !== "wisp" || t.state !== "attack") {
            let W = Math.hypot(t.x - a.x, t.z - a.z),
              z = t.radius + 0.38;
            W < z && W > 0.001 && Math.abs(f - je(t)) < 1.6 && (t.x = a.x + (t.x - a.x) / W * z, t.z = a.z + (t.z - a.z) / W * z);
          }
        }
        for (let t = 0; t < Mt; t++) {
          let j = D[t];
          if (!(!j.live || j.state === "dying" || j.state === "sleep")) for (let k = t + 1; k < Mt; k++) {
            let ae = D[k];
            if (!ae.live || ae.state === "dying" || ae.state === "sleep" || (an[j.kind] ?? 0) !== (an[ae.kind] ?? 0)) continue;
            let $ = ae.x - j.x,
              re = ae.z - j.z,
              f = j.radius + ae.radius,
              W = $ * $ + re * re;
            if (W >= f * f || W < 1e-8) continue;
            let z = Math.sqrt(W),
              w = (f - z) * 0.5,
              ne = Ue[j.kind].mass,
              ve = Ue[ae.kind].mass,
              Xe = ve / (ne + ve),
              Ae = ne / (ne + ve);
            j.x -= $ / z * w * Xe * 2, j.z -= re / z * w * Xe * 2, ae.x += $ / z * w * Ae * 2, ae.z += re / z * w * Ae * 2;
          }
        }
        for (let t of D) t.live && t.state !== "dying" && Me(t);
        Qe(d), Ze(B);
      }
    },
    De = new ye.Vector3(),
    Ye = new ye.Vector3();
  function Qe(d) {
    De.subVectors(M, H);
    let B = De.length();
    B > 0.001 && De.divideScalar(B);
    let a = Math.min(1, d * 12);
    for (let S of D) {
      if (!S.live) continue;
      let t = 0;
      if (B > 0.001 && B < 60 && S.state !== "sleep") {
        Ge.centre(S, Ye).sub(H);
        let j = Ye.dot(De),
          k = Ue[S.kind].hitRadius * (S.kind === "warlord" ? Zt * 0.8 : S.size);
        j < 1.6 + k ? t = 0.8 : j < B - 0.6 && Math.sqrt(Math.max(0, Ye.lengthSq() - j * j)) < k + 0.3 && (t = 0.62);
      }
      S.ghost += (t - S.ghost) * a;
    }
  }
  let _e = (d, B, a) => {
      let S = d.fx.array;
      S[B * 4] = a.flash * (a.kind === "warlord" ? 0.55 : 0.85), S[B * 4 + 1] = a.boost, S[B * 4 + 2] = a.dissolve, S[B * 4 + 3] = a.elite ? 1 : 0, d.ghost.array[B] = a.ghost;
    },
    Ce = (d, B, a) => {
      let S = d.count++;
      d.body.setMatrixAt(S, a), _e(d, S, B);
    };
  function Ze(d) {
    for (let a of G) a.count = 0;
    u.count = 0, p.count = 0, E.count = 0;
    let B = 0;
    P.fill(null);
    for (let a of D) {
      if (!a.live) continue;
      let S = a.kind === "warlord",
        t = S ? Zt : a.size,
        j = 1;
      if (a.state === "spawn") {
        let W = Math.min(1, a.t / 0.55),
          z = 2.2;
        j = Math.max(0.001, 1 + (z + 1) * (W - 1) ** 3 + z * (W - 1) ** 2);
      } else a.state === "dying" && (j = 1 - a.dissolve * 0.25);
      let k = 1 - a.squash * 0.28,
        ae = 1 + a.squash * 0.18;
      if (a.state === "sleep") {
        let W = Math.sin(d * 1.6 + a.index * 1.7);
        k *= 0.74 + W * 0.05, ae *= 1.16 - W * 0.03;
      }
      if (a.kind === "slime") {
        if (a.state === "windup") {
          let W = Math.min(1, a.t / 0.38);
          k *= 1 - W * 0.32, ae *= 1 + W * 0.22;
        } else if (a.state === "move" || a.state === "attack") {
          let W = a.y / 0.32;
          k *= 1 + W * 0.14, ae *= 1 - W * 0.07;
        }
      }
      V.set(a.x, me + a.y + je(a), a.z);
      let $ = 0;
      if (a.kind === "wisp" && a.state === "attack" && ($ = 0.5), (a.kind === "golem" || S) && a.state === "windup" && ($ = -0.12), (a.kind === "golem" || S) && a.state === "attack" && !a.nova && ($ = 0.18), C.set($, a.facing, 0), T.setFromEuler(C), _.set(t * j * ae, t * j * k, t * j * ae), X.compose(V, T, _), Ce(i[a.kind], a, X), a.kind === "imp") {
        let W = Math.sin(d * 18 + a.index) * 0.6 + 0.2;
        for (let z of dr) C.set(0, z * (0.35 + W * 0.6), z * 0.25), T.setFromEuler(C), l.compose(V.set(z * 0.16 * ft, 0.12 * ft, -0.14 * ft), T, _.set(z * ft, ft, ft)), ce.multiplyMatrices(X, l), Ce(u, a, ce);
      } else if (a.kind === "golem" || S) {
        let W = S ? E : p,
          z = 0;
        if (a.state === "windup") {
          let ne = a.nova ? 1.1 : S ? 1.15 : a.elite ? 0.85 : 1;
          z = Math.min(1, a.t / (ne * 0.7));
        } else a.state === "attack" ? z = a.nova ? 0.9 : Math.max(0, 1 - a.t / 0.08) * 0.5 : a.state === "recover" && (z = a.nova ? Math.max(0, 0.9 - a.t * 2) : 0);
        let w = a.state === "attack" && !a.nova;
        for (let ne of dr) {
          let ve = Math.sin(a.anim + (ne > 0 ? 0 : Math.PI)) * 0.4 * (1 - z),
            Xe = w ? -0.9 : ve - z * 2.75;
          C.set(Xe, 0, ne * (0.12 + z * 0.18), "XYZ"), T.setFromEuler(C), l.compose(V.set(ne * 0.64, 1.46, 0.02), T, _.set(1, 1, 1)), ce.multiplyMatrices(X, l), Ce(W, a, ce);
        }
        C.order = "YXZ";
      }
      let re = x[a.index],
        f = a.state === "dying" ? 1 - a.dissolve : a.state === "spawn" ? Math.min(1, a.t / 0.4) : 1;
      if (Ge.centre(a, b), a.kind === "wisp") r.set(re, b.x, b.y, b.z, 1.6 + a.boost * 0.5, he, (0.5 + a.boost * 0.25) * f);else if (a.kind === "imp" && a.state === "windup") {
        let W = Math.min(1, a.t / 0.85);
        r.set(re, b.x, b.y + 0.62, b.z, 0.4 + W * 0.9, Y, (0.6 + W) * f);
      } else S ? r.set(re, b.x, b.y + 1.6, b.z, 5 + a.boost, ge, (0.28 + a.boost * 0.2) * f) : a.elite ? r.set(re, b.x, b.y, b.z, 2.4 * a.size, fe, 0.22 * f) : r.set(re, 0, 0, 0, 0, ge, 0);
      if (Ge.targetable(a)) {
        let W = Ue[a.kind].hitRadius * (S ? 1 : a.size);
        T.identity(), X.compose(b, T, _.set(W, W, W)), g.setMatrixAt(a.index, X), P[a.index] = a, B = Math.max(B, a.index + 1);
      }
    }
    for (let a = 0; a < B; a++) P[a] || g.setMatrixAt(a, Q);
    g.count = B, g.instanceMatrix.needsUpdate = !0;
    for (let a of I) a.body.count = a.count, a.ink.count = a.count, a.body.instanceMatrix.needsUpdate = !0, a.fx.needsUpdate = !0, a.ghost.needsUpdate = !0;
  }
  return Ge;
}
import * as Te from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var ka = {
    telegraph: 0,
    shock: 1,
    line: 2,
    pool: 3
  },
  za = `
attribute vec4 aDecal;
attribute vec3 aTint;
varying vec2 vUv;
varying vec4 vDecal;
varying vec3 vTint;
void main() {
  vUv = uv;
  vDecal = aDecal;
  vTint = aTint;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
`,
  Aa = `
uniform float uTime;
varying vec2 vUv;
varying vec4 vDecal;
varying vec3 vTint;
void main() {
  float kind = vDecal.x;
  float progress = vDecal.y;
  float alpha = vDecal.z;
  vec2 p = vUv - 0.5;
  float r = length(p) * 2.0;
  float a = 0.0;
  vec3 col = vTint;
  if (kind < 0.5) {
    // Telegraph: a white-hot double rim, faint hazard stripes over the whole
    // danger area from the first frame, and a fill that grows to the rim as
    // the wind-up runs. Warning yellow and white read against the red
    // creatures and the orange lava.
    float edge = smoothstep(0.88, 0.93, r) * (1.0 - smoothstep(0.965, 1.0, r));
    float inner = smoothstep(0.78, 0.8, r) * (1.0 - smoothstep(0.8, 0.82, r));
    float fill = (1.0 - smoothstep(progress - 0.02, progress, r)) * 0.3;
    float front = smoothstep(progress - 0.07, progress - 0.01, r) * (1.0 - smoothstep(progress - 0.01, progress + 0.005, r));
    float stripes = step(0.55, fract((p.x + p.y) * 7.0 - uTime * 1.2)) * 0.1 * (1.0 - smoothstep(0.86, 0.9, r));
    float urgent = progress > 0.75 ? 0.55 + 0.45 * sin(uTime * 42.0) : 1.0;
    a = (edge + inner * 0.3 + fill + front * 0.9 + stripes) * urgent * (1.0 - smoothstep(0.995, 1.0, r));
    a += (1.0 - r) * 0.05;
    col = mix(vTint, vec3(1.0, 0.97, 0.88) * 2.0, clamp(edge * 0.7 + front * 0.6, 0.0, 1.0));
  } else if (kind < 1.5) {
    // Shockwave: a ring near the rim, thinning as it fades.
    float width = mix(0.35, 0.08, progress);
    a = smoothstep(1.0 - width, 1.0 - width * 0.4, r) * (1.0 - smoothstep(0.96, 1.0, r));
  } else if (kind < 2.5) {
    // A dash line along +v: white-hot edges, a fill running along it.
    float across = abs(vUv.x - 0.5) * 2.0;
    float along = vUv.y;
    float edge = smoothstep(0.75, 0.9, across) * (1.0 - smoothstep(0.92, 1.0, across));
    float fill = step(along, progress) * (1.0 - across) * 0.35;
    float tip = smoothstep(0.0, 0.08, along) * (1.0 - smoothstep(0.92, 1.0, along));
    float chevron = step(0.5, fract(along * 6.0 - uTime * 3.0 + across * 0.6)) * 0.18 * (1.0 - across);
    a = (edge * 0.95 + fill + chevron) * tip;
    col = mix(vTint, vec3(1.0, 0.97, 0.88) * 2.4, edge * 0.7);
  } else {
    // A soft pool of light.
    a = (1.0 - smoothstep(0.0, 1.0, r)) * (1.0 - smoothstep(0.0, 1.0, r));
  }
  gl_FragColor = vec4(col * a * alpha, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,
  Ia = `
attribute vec4 aSlash;
varying vec2 vPos;
varying vec4 vSlash;
void main() {
  vPos = position.xz;
  vSlash = aSlash;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
`,
  Pa = `
uniform vec3 uColor;
uniform vec3 uHot;
varying vec2 vPos;
varying vec4 vSlash;
void main() {
  float progress = vSlash.x;
  float alpha = vSlash.y;
  float start = vSlash.z;
  float span = vSlash.w;
  float r = length(vPos);
  float th = atan(vPos.x, vPos.y);
  float s;
  float lead;
  if (span > 6.0) {
    // Whirlwind: a band chasing round the ring.
    s = fract((th - start) / 6.2831853 - progress * 1.35);
    lead = 1.0 - s;
    s = smoothstep(0.0, 0.65, lead) * (1.0 - smoothstep(0.97, 1.0, lead));
  } else {
    float u = (th - start) / span;
    u = u < -0.5 ? u + 6.2831853 / span : u;
    float head = progress * 1.25;
    lead = head - u;
    s = step(0.0, u) * step(u, 1.0) * step(0.0, lead) * (1.0 - smoothstep(0.0, 0.55, lead));
  }
  float band = smoothstep(0.38, 0.6, r) * (1.0 - smoothstep(0.9, 1.0, r));
  float bright = smoothstep(0.78, 0.9, r) * (1.0 - smoothstep(0.93, 1.0, r));
  vec3 col = mix(uColor, uHot, bright);
  float a = s * band * alpha;
  gl_FragColor = vec4(col * a, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
function pr(n, e, o) {
  let c = new Te.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
    s = new Float32Array(112),
    i = new Float32Array(84),
    u = new Te.InstancedBufferAttribute(s, 4).setUsage(Te.DynamicDrawUsage),
    p = new Te.InstancedBufferAttribute(i, 3).setUsage(Te.DynamicDrawUsage);
  c.setAttribute("aDecal", u), c.setAttribute("aTint", p);
  let E = {
      uTime: {
        value: 0
      }
    },
    g = new Te.InstancedMesh(c, new Te.ShaderMaterial({
      uniforms: E,
      vertexShader: za,
      fragmentShader: Aa,
      blending: Te.AdditiveBlending,
      depthWrite: !1,
      transparent: !0,
      fog: !1,
      side: Te.DoubleSide,
      polygonOffset: !0,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -4
    }), 28);
  g.name = "ember-decals", g.frustumCulled = !1, g.renderOrder = 3, g.count = 0;
  let P = [];
  for (let l = 0; l < 28; l++) P.push({
    live: !1,
    kind: "pool",
    x: 0,
    z: 0,
    y: me,
    radius: 1,
    length: 1,
    heading: 0,
    age: 0,
    duration: 1,
    grow: 1,
    color: new Te.Color(),
    intensity: 1,
    held: !1,
    serial: 0
  });
  let Q = 1,
    I = (l, T) => T.serial * 64 + l,
    G = l => {
      let T = P[l % 64];
      return T?.live && T.serial === Math.floor(l / 64) ? T : null;
    },
    L = 6,
    D = new Te.RingGeometry(0.34, 1, 56, 2).rotateX(-Math.PI / 2),
    x = new Float32Array(L * 4),
    H = new Te.InstancedBufferAttribute(x, 4).setUsage(Te.DynamicDrawUsage);
  D.setAttribute("aSlash", H);
  let M = new Te.InstancedMesh(D, new Te.ShaderMaterial({
    uniforms: {
      uColor: {
        value: Ee(y.accent, 2.2)
      },
      uHot: {
        value: Ee("#f4f0ff", 3.2)
      }
    },
    vertexShader: Ia,
    fragmentShader: Pa,
    blending: Te.AdditiveBlending,
    depthWrite: !1,
    transparent: !0,
    side: Te.DoubleSide,
    fog: !1
  }), L);
  M.name = "ember-slashes", M.frustumCulled = !1, M.renderOrder = 8, M.instanceMatrix.setUsage(Te.DynamicDrawUsage), M.instanceMatrix.array.fill(0);
  let O = [];
  for (let l = 0; l < L; l++) O.push({
    live: !1,
    age: 0,
    duration: 0.2,
    start: 0,
    span: 1
  });
  let se = 0,
    he = new Te.Matrix4(),
    Y = new Te.Quaternion(),
    ge = new Te.Euler(0, 0, 0, "YXZ"),
    fe = new Te.Vector3(),
    R = new Te.Vector3(),
    ie = Ee("#8a7a86", 1),
    X = () => {
      let l = 0;
      for (let T of P) {
        if (!T.live) continue;
        let C = T.duration > 0 ? Math.min(1, T.age / T.duration) : 0,
          V = T.radius,
          _ = T.intensity,
          b = C;
        T.kind === "shock" ? (V = T.radius * (1 + (T.grow - 1) * (1 - (1 - C) * (1 - C))), _ *= 1 - C) : T.kind === "pool" ? _ *= C < 0.2 ? C / 0.2 : 1 - (C - 0.2) / 0.8 : (T.kind === "telegraph" || T.kind === "line") && (T.held && (b = T.age), _ *= Math.min(1, (T.held ? 1 : T.age) * 8 + 0.2)), T.kind === "line" ? (Y.setFromAxisAngle(Te.Object3D.DEFAULT_UP, T.heading), fe.set(T.x + Math.sin(T.heading) * T.length * 0.5, T.y + 0.03, T.z + Math.cos(T.heading) * T.length * 0.5), R.set(T.radius * 2, 1, T.length), he.compose(fe, Y, R), he.multiply(Ga)) : (Y.identity(), fe.set(T.x, T.y + 0.03, T.z), R.set(V * 2, 1, V * 2), he.compose(fe, Y, R)), g.setMatrixAt(l, he), s[l * 4] = ka[T.kind], s[l * 4 + 1] = b, s[l * 4 + 2] = _, i[l * 3] = T.color.r, i[l * 3 + 1] = T.color.g, i[l * 3 + 2] = T.color.b, l++;
      }
      g.count = l, g.instanceMatrix.needsUpdate = !0, u.needsUpdate = !0, p.needsUpdate = !0;
    },
    ce = () => {
      for (let l = 0; l < L; l++) {
        let T = O[l];
        if (!T.live) continue;
        let C = Math.min(1, T.age / T.duration);
        x[l * 4] = C, x[l * 4 + 1] = C < 0.7 ? 1 : 1 - (C - 0.7) / 0.3, x[l * 4 + 2] = T.start, x[l * 4 + 3] = T.span, C >= 1 && (T.live = !1, x[l * 4 + 1] = 0, M.getMatrixAt(l, he), he.makeScale(0, 0, 0), M.setMatrixAt(l, he));
      }
      M.instanceMatrix.needsUpdate = !0, H.needsUpdate = !0;
    };
  return {
    objects: [g, M],
    decal(l, T, C, V, _, b, J = {}) {
      let K = P.findIndex(ee => !ee.live);
      if (K < 0) {
        let ee = -1,
          we = -1;
        P.forEach((Me, je) => {
          !Me.held && Me.age > we && (we = Me.age, ee = je);
        }), K = Math.max(0, ee);
      }
      let Z = P[K];
      return Z.live = !0, Z.kind = l, Z.x = T, Z.z = C, Z.y = J.y ?? me, Z.radius = V, Z.length = J.length ?? 1, Z.heading = J.heading ?? 0, Z.age = 0, Z.duration = _, Z.grow = J.grow ?? 1, Z.color.copy(b), Z.intensity = J.intensity ?? 1, Z.held = J.held ?? !1, Q += 1, Z.serial = Q, I(K, Z);
    },
    setProgress(l, T) {
      let C = G(l);
      C && (C.age = T);
    },
    setRadius(l, T) {
      let C = G(l);
      C && (C.radius = T);
    },
    move(l, T, C) {
      let V = G(l);
      V && (V.x = T, V.z = C);
    },
    cancel(l) {
      let T = G(l);
      T && (T.live = !1);
    },
    slash(l, T, C, V, _, b = 0, J = 0) {
      let K = se;
      se = (se + 1) % L;
      let Z = O[K];
      Z.live = !0, Z.age = _ * J, Z.duration = _, Z.span = V, Z.start = V > 6 ? 0 : -V / 2, ge.set(b, T, 0), Y.setFromEuler(ge), R.set(C, 1, C), he.compose(l, Y, R), M.setMatrixAt(K, he);
    },
    sparks(l, T, C, V, _ = 0, b = 0) {
      for (let J = 0; J < C; J++) {
        let K = Math.random() * Math.PI * 2,
          Z = Math.random() * 0.9 + 0.2,
          ee = V * (0.4 + Math.random() * 0.8);
        e.emit(l.x, l.y, l.z, Math.cos(K) * ee * 0.7 + _ * ee, Z * ee, Math.sin(K) * ee * 0.7 + b * ee, 0.28 + Math.random() * 0.35, 0.07 + Math.random() * 0.06, T, 14, 1.5, 0.4);
      }
    },
    dust(l, T, C, V, _, b = ie) {
      for (let J = 0; J < V; J++) {
        let K = Math.random() * Math.PI * 2,
          Z = Math.random() * _,
          ee = 1.2 + Math.random() * 2.2;
        o.emit(l + Math.cos(K) * Z, T + 0.1, C + Math.sin(K) * Z, Math.cos(K) * ee, 0.4 + Math.random() * 1.2, Math.sin(K) * ee, 0.7 + Math.random() * 0.6, 0.35 + Math.random() * 0.35, b, -0.3, 2.6, 2.4);
      }
    },
    ring(l, T, C, V, _, b) {
      for (let J = 0; J < V; J++) {
        let K = J / V * Math.PI * 2 + Math.random() * 0.2,
          Z = _ * (0.8 + Math.random() * 0.4);
        e.emit(l, T + 0.15, C, Math.cos(K) * Z, 0.6 + Math.random(), Math.sin(K) * Z, 0.45 + Math.random() * 0.25, 0.1, b, 3, 2.5, 0.5);
      }
    },
    rise(l, T, C, V, _, b) {
      for (let J = 0; J < V; J++) {
        let K = Math.random() * Math.PI * 2,
          Z = Math.random() * _;
        e.emit(l + Math.cos(K) * Z, T + Math.random() * 0.4, C + Math.sin(K) * Z, 0, 1.2 + Math.random() * 1.8, 0, 0.7 + Math.random() * 0.5, 0.09 + Math.random() * 0.05, b, -0.5, 0.8, 0.3);
      }
    },
    flash(l, T, C, V, _, b) {
      n.flash(l, T, C, V, _, b);
    },
    update(l, T) {
      E.uTime.value = T;
      for (let C of P) !C.live || C.held || (C.age += l, C.age >= C.duration && (C.live = !1));
      for (let C of O) C.live && (C.age += l);
      X(), ce();
    },
    clear() {
      for (let l of P) l.live = !1;
      for (let l of O) l.age = l.duration;
      X(), ce();
    }
  };
}
var Ga = new Te.Matrix4().makeScale(1, 1, -1);
function Er(n, e, o, r, c) {
  if (n === "gamepad") {
    let s = e === 0 && !o;
    return r ? {
      kind: "target",
      attack: s ? "keep" : !0
    } : s ? {
      kind: "none"
    } : c ? {
      kind: "keep"
    } : {
      kind: "nearest"
    };
  }
  return r ? {
    kind: "target",
    attack: e === 2 ? !0 : "keep"
  } : {
    kind: "clear"
  };
}
var Rn = {
    xbox: {
      attack: "RT",
      next: "LB",
      jump: "A"
    },
    playstation: {
      attack: "R2",
      next: "L1",
      jump: "Cross"
    },
    nintendo: {
      attack: "ZR",
      next: "L",
      jump: "B"
    },
    generic: {
      attack: "RT",
      next: "LB",
      jump: "A"
    }
  },
  Ca = "Right-click a creature to attack \xB7 1\u20135 abilities";
function br(n, e = "generic") {
  if (n !== "gamepad") return Ca;
  let o = Rn[e] ?? Rn.generic;
  return `${o.attack} to attack \xB7 ${o.next} next target \xB7 D-pad abilities`;
}
function gr(n, e = "generic") {
  return `Ring of fire: jump it with ${n === "gamepad" ? (Rn[e] ?? Rn.generic).jump : "Space"}`;
}
var dt = {
    hit: [0.22, 45],
    crit: [0.45, 90],
    bigKill: [0.6, 150],
    warlordRises: [0.5, 320],
    warlordFalls: [0.95, 380],
    levelUp: [0.55, 240],
    waveClear: [0.35, 160],
    heavyHurt: [0.7, 170],
    fallen: [1, 400],
    blade: [0.3, 110]
  },
  yr = 0.09,
  eo = {
    reach: 9,
    arc: 75 * Math.PI / 180
  };
import * as We from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var vr = 14,
  to = 3.4,
  Va = 0.8;
function Tr(n, e, o, r, c, s) {
  let i = [];
  for (let R = 0; R < 14; R++) i.push({
    live: !1,
    t: 0,
    duration: 1,
    sx: 0,
    sy: 0,
    sz: 0,
    ex: 0,
    ez: 0,
    apex: 2,
    damage: 0,
    decal: -1,
    core: o.claim(),
    halo: o.claim()
  });
  let u = [];
  for (let R = 0; R < 8; R++) u.push({
    live: !1,
    t: 0,
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    target: null,
    damage: 0,
    crit: !1,
    core: o.claim(),
    halo: o.claim()
  });
  let p = [];
  for (let R = 0; R < 16; R++) p.push({
    live: !1,
    t: 0,
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    landed: !1,
    glow: o.claim()
  });
  let E = new We.InstancedMesh($o(), c, p.length);
  E.name = "ember-orbs", E.frustumCulled = !1, E.instanceMatrix.setUsage(We.DynamicDrawUsage), E.count = 0;
  let g = Ee("#fff0c0", 2.2),
    P = Ee(y.lava, 1.4),
    Q = Ee(y.ember, 2.2),
    I = Ee("#f2eeff", 2.6),
    G = Ee(y.accent, 1.6),
    L = Ee(y.arcane, 2.4),
    D = Ee(y.heal, 1),
    x = Ee(y.heal, 2),
    H = new We.Color(),
    M = new We.Vector3(),
    O = new We.Matrix4(),
    se = new We.Quaternion(),
    he = new We.Vector3(),
    Y = new We.Vector3(),
    ge = R => {
      R.live = !1, o.set(R.core, 0, 0, 0, 0, H, 0), o.set(R.halo, 0, 0, 0, 0, H, 0), R.decal >= 0 && e.cancel(R.decal), R.decal = -1;
    },
    fe = R => {
      R.live = !1, R.target = null, o.set(R.core, 0, 0, 0, 0, H, 0), o.set(R.halo, 0, 0, 0, 0, H, 0);
    };
  return {
    objects: [E],
    fireball(R, ie, X, ce, l, T, C) {
      let V = i.find(b => !b.live);
      if (!V) {
        C >= 0 && e.cancel(C);
        return;
      }
      let _ = Math.hypot(ce - R, l - X);
      V.live = !0, V.t = 0, V.duration = We.MathUtils.clamp(_ / 7.5, 0.75, 1.35), V.sx = R, V.sy = ie, V.sz = X, V.ex = ce, V.ez = l, V.apex = 1.6 + _ * 0.12, V.damage = T, V.decal = C;
    },
    bolt(R, ie, X, ce, l, T, C, V, _) {
      let b = u.find(K => !K.live) ?? u[0];
      b.live = !0, b.t = 0, b.x = R, b.y = ie, b.z = X;
      let J = Math.hypot(ce, l, T) || 1;
      b.vx = ce / J * at.speed, b.vy = l / J * at.speed, b.vz = T / J * at.speed, b.target = C, b.damage = V, b.crit = _;
    },
    orb(R, ie, X) {
      let ce = p.find(T => !T.live);
      if (!ce) return;
      let l = Math.random() * Math.PI * 2;
      ce.live = !0, ce.t = 0, ce.x = R, ce.y = ie, ce.z = X, ce.vx = Math.cos(l) * (1 + Math.random() * 1.5), ce.vz = Math.sin(l) * (1 + Math.random() * 1.5), ce.vy = 4 + Math.random() * 1.5, ce.landed = !1;
    },
    update(R, ie) {
      let X = s.player;
      for (let l of i) {
        if (!l.live) continue;
        l.t += R;
        let T = Math.min(1, l.t / l.duration),
          C = We.MathUtils.lerp(l.sx, l.ex, T),
          V = We.MathUtils.lerp(l.sz, l.ez, T),
          _ = We.MathUtils.lerp(l.sy, me + 0.25, T) + l.apex * 4 * T * (1 - T),
          b = 0.9 + Math.sin(ie * 40 + l.sx) * 0.1;
        o.set(l.core, C, _, V, 0.55, g, b), o.set(l.halo, C, _, V, 1.7, P, 0.7 * b), l.decal >= 0 && e.setProgress(l.decal, 0.45 + 0.55 * T), Math.random() < 0.8 && r.emit(C, _, V, (Math.random() - 0.5) * 0.8, 0.4, (Math.random() - 0.5) * 0.8, 0.45, 0.16, Q, -0.5, 1.2, 0.2), T >= 1 && (s.fireballLands(l.ex, l.ez, l.damage), M.set(l.ex, me + 0.3, l.ez), e.flash(M, 2.8, P, 0.35, 1.5, 1.2), e.sparks(M, Q, 18, 5), e.decal("shock", l.ex, l.ez, 0.8, 0.4, P, {
          grow: 2.1
        }), e.dust(l.ex, me, l.ez, 5, 0.6), ge(l));
      }
      for (let l of u) {
        if (!l.live) continue;
        if (l.t += R, l.target && n.targetable(l.target)) {
          n.centre(l.target, M);
          let V = M.x - l.x,
            _ = M.y - l.y,
            b = M.z - l.z,
            J = Math.hypot(V, _, b) || 1,
            K = Math.min(1, R * 12);
          l.vx += (V / J * at.speed - l.vx) * K, l.vy += (_ / J * at.speed - l.vy) * K, l.vz += (b / J * at.speed - l.vz) * K;
        }
        let T = null,
          C = !1;
        for (let V = 0; V < 3 && !T && !C; V++) {
          l.x += l.vx * R / 3, l.y += l.vy * R / 3, l.z += l.vz * R / 3;
          for (let _ of n.pool) {
            if (!n.targetable(_)) continue;
            n.centre(_, M);
            let b = 0.25 + (_.kind === "warlord" ? 1.4 : _.radius * 1.15 + 0.1);
            if (Math.hypot(M.x - l.x, M.y - l.y, M.z - l.z) < b) {
              T = _;
              break;
            }
          }
          (l.y < me + 0.08 || Math.hypot(l.x, l.z) > Io || l.t > at.life) && (C = !0);
        }
        o.set(l.core, l.x, l.y, l.z, l.crit ? 0.8 : 0.6, I, 1), o.set(l.halo, l.x, l.y, l.z, l.crit ? 2.2 : 1.6, G, 0.8);
        for (let V = 0; V < 2; V++) r.emit(l.x, l.y, l.z, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.2, 0.3, 0.12, L, 0, 2, 0.1);
        (T || C) && (s.boltHits(l, T, l.x, l.y, l.z), fe(l));
      }
      let ce = 0;
      for (let l of p) {
        if (!l.live) continue;
        l.t += R;
        let T = me + 0.38,
          C = X.x - l.x,
          V = X.y + 0.55 - l.y,
          _ = X.z - l.z,
          b = Math.hypot(C, V, _);
        if (l.t > 0.45 && b < to) {
          let Z = 9 + (to - b) * 6;
          l.vx += C / b * Z * R * 3, l.vy += V / b * Z * R * 3, l.vz += _ / b * Z * R * 3;
          let ee = Math.exp(-4 * R);
          l.vx *= ee, l.vy *= ee, l.vz *= ee, l.landed = !1;
        } else l.landed || (l.vy -= 14 * R);
        if (l.x += l.vx * R, l.y += l.vy * R, l.z += l.vz * R, !l.landed && l.y < T && l.vy < 0 && b >= to && (l.y = T, l.vy = 0, l.vx = 0, l.vz = 0, l.landed = !0), l.t > 0.3 && b < Va) {
          s.orb(), M.set(l.x, l.y, l.z), e.flash(M, 1.4, D, 0.3, 1.8, 1.2), e.rise(l.x, l.y - 0.2, l.z, 6, 0.3, x), l.live = !1, o.set(l.glow, 0, 0, 0, 0, H, 0);
          continue;
        }
        if (l.t > vr) {
          l.live = !1, o.set(l.glow, 0, 0, 0, 0, H, 0);
          continue;
        }
        let J = l.t > vr - 3 ? Math.sin(l.t * 18) > 0 ? 1 : 0.25 : 1,
          K = l.landed ? Math.sin(ie * 3 + l.x) * 0.1 : 0;
        Y.set(l.x, l.y + K, l.z), se.setFromAxisAngle(We.Object3D.DEFAULT_UP, ie * 2 + l.z), he.setScalar(J > 0.5 ? 1 : 0.7), O.compose(Y, se, he), E.setMatrixAt(ce++, O), o.set(l.glow, Y.x, Y.y, Y.z, 1.1, D, 0.55 * J);
      }
      E.count = ce, E.instanceMatrix.needsUpdate = !0;
    },
    clear() {
      for (let R of i) R.live && ge(R);
      for (let R of u) R.live && fe(R);
      for (let R of p) R.live && (R.live = !1, o.set(R.glow, 0, 0, 0, 0, H, 0));
      E.count = 0;
    }
  };
}
function wr(n) {
  let e = null,
    o = u => {
      if (e && e.sampleRate === u.sampleRate) return e;
      let p = u.createBuffer(1, Math.floor(u.sampleRate * 1.2), u.sampleRate),
        E = p.getChannelData(0);
      for (let g = 0; g < E.length; g++) E[g] = Math.random() * 2 - 1;
      return e = p, p;
    },
    r = () => {
      let u = n.audio;
      return !u || u.context.state !== "running" || !n.active ? null : u;
    },
    c = (u, p, E, g, P) => {
      let Q = u.createGain();
      return Q.gain.setValueAtTime(1e-4, P), Q.gain.exponentialRampToValueAtTime(Math.max(2e-4, p), P + E), Q.gain.exponentialRampToValueAtTime(1e-4, P + E + g), Q;
    },
    s = (u, p, E, g, P, Q = "bandpass", I = 0) => {
      let G = r();
      if (!G) return;
      let {
          context: L,
          output: D
        } = G,
        x = L.currentTime + I,
        H = L.createBufferSource();
      H.buffer = o(L);
      let M = L.createBiquadFilter();
      M.type = Q, M.Q.value = P, M.frequency.setValueAtTime(E, x), M.frequency.exponentialRampToValueAtTime(Math.max(20, g), x + p), H.connect(M).connect(c(L, u, 0.008, p, x)).connect(D), H.start(x, Math.random() * 0.4), H.stop(x + p + 0.1);
    },
    i = (u, p, E, g, P, Q = 0, I = 0.005) => {
      let G = r();
      if (!G) return;
      let {
          context: L,
          output: D
        } = G,
        x = L.currentTime + Q,
        H = L.createOscillator();
      H.type = u, H.frequency.setValueAtTime(p, x), H.frequency.exponentialRampToValueAtTime(Math.max(20, E), x + g), H.connect(c(L, P, I, g, x)).connect(D), H.start(x), H.stop(x + I + g + 0.05);
    };
  return {
    swing(u = !1) {
      s(u ? 0.16 : 0.11, u ? 0.26 : 0.18, 600, u ? 3800 : 5200, 1.4);
    },
    impact(u) {
      i("sine", u ? 150 : 200, 55, u ? 0.22 : 0.14, u ? 0.3 : 0.2), s(u ? 0.2 : 0.14, 0.1, 2400, 500, 0.9, "lowpass");
    },
    crit() {
      i("triangle", 1760, 1500, 0.3, 0.06), i("sine", 2640, 2400, 0.22, 0.04, 0.01);
    },
    slam(u) {
      i("sine", u ? 90 : 120, 32, u ? 0.7 : 0.5, 0.45), s(u ? 0.34 : 0.26, u ? 0.6 : 0.45, 1200, 90, 0.7, "lowpass"), s(0.08, 0.3, 3e3, 800, 2, "bandpass", 0.03);
    },
    cast() {
      i("sawtooth", 220, 660, 0.25, 0.04), s(0.08, 0.3, 800, 4e3, 3);
    },
    fireball() {
      s(0.07, 0.5, 300, 1400, 2), i("triangle", 180, 90, 0.4, 0.05);
    },
    explode(u) {
      s(u ? 0.26 : 0.18, u ? 0.55 : 0.35, 2600, 120, 0.8, "lowpass"), i("sine", 110, 40, u ? 0.45 : 0.3, 0.3);
    },
    blink() {
      i("sine", 900, 2400, 0.12, 0.08), s(0.1, 0.2, 5e3, 900, 4), i("triangle", 1600, 700, 0.18, 0.04, 0.06);
    },
    mend() {
      for (let [u, p] of [523, 659, 784, 1047].entries()) i("sine", p, p * 1.01, 0.5, 0.06, u * 0.06, 0.02);
    },
    spawn() {
      i("sine", 300, 900, 0.35, 0.05, 0, 0.08), s(0.05, 0.4, 900, 3500, 6);
    },
    squelch() {
      i("sine", 380, 120, 0.12, 0.08), s(0.05, 0.08, 900, 300, 3, "lowpass");
    },
    shriek() {
      i("square", 900, 1900, 0.22, 0.025), i("sine", 1400, 2800, 0.25, 0.04);
    },
    cackle() {
      for (let u = 0; u < 3; u++) i("square", 700 - u * 60, 500 - u * 50, 0.06, 0.03, u * 0.08);
    },
    roar() {
      i("sawtooth", 110, 55, 1.1, 0.14, 0, 0.1), i("sawtooth", 83, 45, 1.2, 0.1, 0.02, 0.12), s(0.14, 1.1, 700, 180, 1.2, "lowpass");
    },
    orb() {
      i("sine", 880, 1320, 0.16, 0.06), i("sine", 1320, 1760, 0.14, 0.05, 0.06);
    },
    levelUp() {
      for (let [u, p] of [392, 523, 659, 784, 1047].entries()) i("triangle", p, p, 0.3, 0.07, u * 0.07, 0.01);
    },
    death() {
      i("sawtooth", 220, 55, 1.2, 0.08, 0, 0.02), s(0.12, 1, 1500, 100, 1, "lowpass");
    }
  };
}
import * as He from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var Da = 0.5,
  xr = 0.55,
  Mr = 5,
  Rr = 1.05,
  _a = [0.8, 0.62, 0.46, 0.34];
function Hr(n, e, o, r) {
  let c = new He.Vector3(),
    s = new He.Quaternion(),
    i = new He.Vector3(),
    u = new He.Quaternion(),
    p = !1,
    E = 0,
    g = 0,
    P = Number.POSITIVE_INFINITY,
    Q = o,
    I = new He.PerspectiveCamera(),
    G = new He.Vector3(),
    L = new He.Vector2(),
    D = new He.Vector3(),
    x = new He.Vector3(),
    H = new He.Vector3(),
    M = new He.Vector3(),
    O = new He.Vector3(),
    se = new He.Vector3(),
    he = new He.Vector3(),
    Y = new He.Vector3(),
    ge = new He.Vector3(),
    fe = new He.Vector3(),
    R = new He.Vector3(),
    ie = new He.Vector3(),
    X = new He.Vector3(),
    ce = e.map(_ => new He.Vector3(Math.sin(_.yaw), 0, Math.cos(_.yaw))),
    l = (_, b, J) => {
      let K = Number.POSITIVE_INFINITY;
      for (let Z = 0; Z < e.length; Z++) {
        let ee = e[Z];
        ge.copy(ce[Z]), Y.set(ee.x, ee.centre, ee.z);
        let we = b.dot(ge);
        if (Math.abs(we) < 1e-4) continue;
        let Me = fe.subVectors(Y, _).dot(ge) / we;
        Me <= 0 || Me >= J || (se.copy(_).addScaledVector(b, Me), se.distanceTo(Y) < ee.radius && Me < K && (K = Me));
      }
      return K;
    },
    T = (_, b, J, K) => K.set(-_ * Math.cos(J), Math.sin(J), -b * Math.cos(J)),
    C = (_, b, J, K) => n.raycast(_, b, J + 0.4) !== null || l(_, b, J + 0.4) !== Number.POSITIVE_INFINITY ? !1 : V(_, b, J, K),
    V = (_, b, J, K) => {
      R.copy(_).addScaledVector(b, J), ie.subVectors(R, K);
      let Z = ie.length();
      return Z < 0.001 || n.raycast(K, ie.divideScalar(Z), Z) === null;
    };
  return {
    eye: G,
    update(_, b, J, K, Z) {
      let ee = n.camera;
      p && ee.position.equals(i) && ee.quaternion.equals(u) && (ee.position.copy(c), ee.quaternion.copy(s)), p = !1, c.copy(ee.position), s.copy(ee.quaternion);
      let we = He.MathUtils.clamp(J, 0, 1);
      if (E = we > E ? E + (we - E) * Math.min(1, _ * 3.5) : Math.max(we, E - _ * 4), E < 0.002) E = 0, g = 0, P = Number.POSITIVE_INFINITY;else {
        D.set(0, 0, -1).applyQuaternion(ee.quaternion);
        let Me = O.subVectors(K, ee.position).dot(D);
        if (Me > 0.05) {
          H.copy(ee.position).addScaledVector(D, Me), x.copy(D).negate(), !n.raycast(H, x, Me + 0.8) && Me >= 3.4 && (Q = Math.max(Me, Q - _ * 4));
          let Ge = Me + (Math.max(Me, Q) - Me) * E,
            De = Math.asin(He.MathUtils.clamp(-D.y, -1, 1)),
            Ye = De + (Math.max(De, Da) - De) * E,
            Qe = Math.hypot(D.x, D.z) || 1,
            _e = D.x / Qe,
            Ce = D.z / Qe;
          X.copy(K).setY(K.y - r);
          let Ze = -1;
          for (let j = 0; j <= Mr; j++) {
            let k = j / Mr * xr;
            if (Ye + k > Rr) break;
            if (T(_e, Ce, Ye + k, M), C(H, M, Ge, X)) {
              Ze = k;
              break;
            }
          }
          let d = Ze < 0;
          d && (Ze = Math.max(0, Math.min(xr, Rr - Ye))), g += (Ze * E - g) * Math.min(1, _ * (Ze * E > g ? 7 : 2.5)), T(_e, Ce, Ye + g, M);
          let B = Ge,
            a = n.raycast(H, M, Ge + 0.4);
          a && (B = Math.min(B, a.distance - 0.35));
          let S = l(H, M, Ge + 0.4);
          if (S < Number.POSITIVE_INFINITY && (B = Math.min(B, S - 0.45)), d && !V(H, M, B, X)) {
            let j = Math.max(1.6, B * 0.3);
            for (let k of _a) {
              if (B * k < 1.6) break;
              if (V(H, M, B * k, X)) {
                j = B * k;
                break;
              }
            }
            B = j;
          }
          B = Math.max(Math.min(1.6, Ge), B), P = B < P ? B : P + (B - P) * Math.min(1, _ * 3);
          let t = Math.min(Ge, P);
          ee.position.copy(H).addScaledVector(M, t), ee.lookAt(H), p = !0;
        }
      }
      if (Z > 0.001) {
        let Me = Z * (0.12 + 0.32 * Z);
        he.set(Math.sin(b * 47.3) * Math.cos(b * 13.1), Math.sin(b * 41.7 + 1.3) * Math.cos(b * 17.9), Math.sin(b * 39.1 + 2.1) * Math.cos(b * 11.3)), ee.position.addScaledVector(he, Me), ee.rotateZ(Math.sin(b * 33.7) * Z * Z * 0.025), p = !0;
      }
      p && (i.copy(ee.position), u.copy(ee.quaternion)), I.position.copy(ee.position), I.quaternion.copy(ee.quaternion), (I.fov !== ee.fov || I.aspect !== ee.aspect) && (I.fov = ee.fov, I.aspect = ee.aspect, I.near = ee.near, I.far = ee.far, I.updateProjectionMatrix()), I.updateMatrixWorld(), G.copy(ee.position);
    },
    ray(_, b) {
      n.renderer.getSize(L);
      let J = new He.Ray();
      return J.origin.setFromMatrixPosition(I.matrixWorld), J.direction.set(_ / Math.max(1, L.x) * 2 - 1, -(b / Math.max(1, L.y)) * 2 + 1, 0.5).unproject(I).sub(J.origin).normalize(), J;
    }
  };
}
var Sr = "best-score",
  kr = "best-wave",
  zr = 10,
  Ba = 4,
  no = 5,
  Fa = 0.5,
  La = 3.2,
  oo = 110 * Math.PI / 180,
  Ua = 70 * Math.PI / 180,
  Ar = 1.8,
  ro = [[tn[1] ?? 0, Ct], [tn[4] ?? 0, Ct], [100 * Math.PI / 180, Ct + 1.7]],
  Na = [1, 4],
  Oa = {
    slime: 0.14,
    wisp: 0.2,
    imp: 0.25,
    golem: 0.6,
    warlord: 1
  },
  sn = new Map(ht.map(n => [n.key, n]));
function Ir(n) {
  let {
      world: e,
      materials: o,
      glows: r,
      sparks: c,
      dusts: s,
      runes: i
    } = n,
    u = e.hud,
    p = wr(e),
    E = pr(r, c, s);
  for (let m of E.objects) e.addDecor(m);
  let g = "idle",
    P = 0,
    Q = null,
    I = 0,
    G = null,
    L = 0,
    D = 0,
    x = 0,
    H = 1,
    M = 0,
    O = 0,
    se = 0,
    he = 0,
    Y = 1,
    ge = 0,
    fe = jt(1),
    R = jt(1),
    ie = et.energy,
    X = null,
    ce = !1,
    l = !1,
    T = 0,
    C = 0,
    V = 0,
    _ = 0,
    b = 0,
    J = 0,
    K = !1,
    Z = 0,
    ee = 0,
    we = 0,
    Me = "",
    je = -1,
    Ge = -1,
    De = !1,
    Ye = new Int8Array(ht.length).fill(-1),
    Qe = -1,
    _e = new Ne.Vector3(),
    Ce = new Ne.Vector3(),
    Ze = Ar,
    d = !1,
    B = !1,
    a = -10,
    S = 0,
    t = 0,
    j = 0,
    k = null,
    ae = Number.NEGATIVE_INFINITY,
    $ = new Float32Array(ht.length),
    re = !1,
    f = new Ne.Vector3(),
    W = new Ne.Vector3(),
    z = new Ne.Vector3(),
    w = new Ne.Vector3(),
    ne = new Ne.Vector3(),
    ve = new Ne.Vector3(),
    Xe = new Ne.Vector3(),
    Ae = {
      amount: 0,
      crit: !1
    },
    _t = new Ne.Plane(new Ne.Vector3(0, 1, 0), -(me + 0.6)),
    Nr = new Ne.Vector3(0, -1, 0),
    Rt = Hr(e, Wt.map(m => {
      let {
        position: h,
        yaw: v
      } = wn(m);
      return {
        x: h[0],
        z: h[2],
        yaw: v,
        centre: $e + 0.1 + Ot,
        radius: Ot + 0.8
      };
    }), n.cameraDistance, 0.95),
    Pn = () => Rt.ray(e.input.mouse.x, e.input.mouse.y),
    Et = m => {
      (!k || m[0] > k[0]) && (k = m);
    },
    Qt = [];
  for (let m = 0; m < 16; m++) Qt.push({
    live: !1,
    at: 0,
    kind: "auto",
    target: null,
    heading: 0
  });
  let Bt = [];
  for (let m = 0; m < 8; m++) Bt.push({
    live: !1,
    at: 0,
    site: 0,
    kinds: [],
    elites: []
  });
  let Or = Ee("#fff4e0", 2),
    bt = Ee(y.accent, 1.6),
    Gn = Ee(y.heal, 1.8),
    Cn = Ee(y.hurt, 1.6),
    gt = Ee(y.arcane, 2.4),
    un = Ee("#ffd27a", 2.2),
    fo = Ee(y.arcaneHot, 1.8),
    yt = qo(o.metal),
    At = new Ne.Group();
  At.name = "ember-rack";
  let ho = Zo(),
    Vn = new Ne.Mesh(ho.geometry, o.metal);
  Vn.castShadow = !0, Vn.receiveShadow = !0, At.add(Vn);
  let mn = on(xn.bearing, xn.radius);
  At.position.set(mn[0], $e, mn[2]), At.rotation.y = xn.facing, e.addStatic(At);
  let po = () => {
    At.add(yt), yt.position.copy(ho.bladeAt), yt.rotation.set(0.08, 0.4, 0.06), yt.scale.setScalar(1.35);
  };
  po();
  let st = new Ne.Vector3(mn[0], $e + 1.1, mn[2]),
    Wr = r.claim(),
    Yr = r.claim(),
    Xr = r.claim(),
    Dn = 0,
    Kr = m => {
      Q || (m && (E.flash(st, 2.2, bt, 0.3, 1.8, 1), w.copy(f).setY(f.y + 0.7), E.flash(w, 1.8, bt, 0.3, 1.8, 1), e.sfx("whoosh")), At.remove(yt), yt.position.set(0, 0, 0), yt.rotation.set(0, 0, 0), yt.scale.setScalar(1), Q = e.avatar.attach(yt, "hand-right"), e.sfx("pickup"), Et(dt.blade));
    },
    Eo = () => {
      Q && (Q.detach(), Q = null), po();
    },
    jr = () => Co(f.x, f.z),
    Ht = () => Vo(f.x, f.z),
    mt = () => g === "countdown" || g === "fight" || g === "breather",
    dn = () => g === "fight" || g === "breather",
    le = hr(e, Qo(o.gradient), E, r, p, {
      player: f,
      playerVelocity: W,
      canHurt: () => dn() && V <= 0 && Ht(),
      engaged: () => dn() && Ht(),
      hurt: (m, h, v, A) => To(m, h, v, A),
      fireball: (m, h, v, A, F, oe, te) => vt.fireball(m, h, v, A, F, oe, te),
      summon: (m, h, v, A) => {
        for (let F = 0; F < h; F++) {
          let oe = F / h * Math.PI * 2 + Math.random();
          Fn(la(v + Math.sin(oe) * 4, A + Math.cos(oe) * 4), [m], [!1], 0.6);
        }
      },
      shake: m => {
        b = Math.min(1, b + m);
      },
      novaWarning: () => {
        B || (B = !0, e.toast(gr(e.input.device, e.input.padFamily)));
      }
    });
  for (let m of le.objects) e.addDecor(m);
  let vt = Tr(le, E, r, c, o.metal, {
    player: f,
    fireballLands: (m, h, v) => {
      p.explode(!1), Math.hypot(f.x - m, f.z - h) < 1.55 && f.y - me < 1.2 && dn() && V <= 0 && Ht() && To(v, m, h, !1), Math.hypot(f.x - m, f.z - h) < 5 && (b = Math.min(1, b + 0.15));
    },
    boltHits: (m, h, v, A, F) => {
      w.set(v, A, F), E.flash(w, m.crit ? 3 : 2.2, bt, 0.3, 1.8, 1.2), E.sparks(w, gt, m.crit ? 20 : 12, 5.5), p.explode(!1), h && Lt(h, m.damage, m.crit, at.knockback, v - m.vx / at.speed * 2, F - m.vz / at.speed * 2);
      for (let oe of le.pool) oe === h || !le.targetable(oe) || (le.centre(oe, ne), ne.distanceTo(w) < at.splash + oe.radius && Lt(oe, Math.max(1, Math.round(m.damage * at.splashShare)), !1, at.knockback * 0.6, v, F));
    },
    orb: () => {
      vo(Math.round(R * lr)), p.orb();
    }
  });
  for (let m of vt.objects) e.addDecor(m);
  let $r = ht.map(m => ({
      key: m.key,
      name: m.name,
      icon: m.icon,
      cooldown: m.cooldown,
      cost: m.cost > 0 ? m.cost : void 0
    })),
    qr = () => e.records.get(Sr) ?? 0,
    bo = () => {
      let m = e.records.get(kr) ?? 0;
      m > 1 && e.achievements.unlock("arena-first-wave"), m > kt && e.achievements.unlock("arena-warlord"), m > zr && e.achievements.unlock("arena-wave-10");
    };
  bo(), e.records.onChange(bo);
  let fn = new Float64Array(10).fill(Number.NaN),
    ct = new Float64Array(10),
    Zr = {
      xbox: 1,
      playstation: 2,
      nintendo: 3,
      generic: 4
    },
    _n = () => {
      let m = mt() && De && (K || Z > 6);
      ct[0] = g === "countdown" ? 1 : g === "breather" ? 2 : g === "fallen" ? 3 : 4, ct[1] = I, ct[2] = Math.ceil(M), ct[3] = m ? Math.max(1, Math.ceil(no - J)) : 0, ct[4] = O, ct[5] = Y, ct[6] = se, ct[7] = H > 0 ? Math.round(x / H * 100) : 0, ct[8] = g === "countdown" && Ht() ? 1 : 0, ct[9] = g === "countdown" && e.input.device === "gamepad" ? Zr[e.input.padFamily] : 0;
      let h = Me !== "";
      for (let te = 0; te < ct.length; te++) fn[te] !== ct[te] && (h = !1), fn[te] = ct[te];
      if (h) return;
      let v,
        A,
        F = null,
        oe = xt(O);
      if (g === "countdown") v = Ht() ? "Get ready" : "Into the ring", oe = null, A = br(e.input.device, e.input.padFamily);else if (g === "breather") v = `${Qn(I + 1)} in ${Math.ceil(M)}`, A = `Lv ${Y} \xB7 ${se} ${se === 1 ? "kill" : "kills"}`, F = 1;else if (g === "fallen") {
        v = `Fallen \xB7 Wave ${I}`;
        let te = qr();
        A = te > O ? `Best ${xt(te)}` : O > 0 ? "Your best yet" : "Endless waves";
      } else v = Qn(I), A = `Lv ${Y} \xB7 ${se} ${se === 1 ? "kill" : "kills"}`, F = H > 0 ? Math.min(1, x / H) : 0;
      m && (v = `Back to the ring \xB7 ${Math.max(1, Math.ceil(no - J))}`), Me = v, u.update({
        title: v,
        primary: oe,
        secondary: A,
        progress: F
      });
    },
    Ft = () => {
      let m = Math.max(0, Math.ceil(fe));
      m !== je && (je = m, u.health(m, R));
      let h = Math.floor(ie);
      h !== Ge && (Ge = h, u.energy(h, et.energy));
    },
    go = () => {
      ce = !1, u.target(X && le.targetable(X) ? {
        name: X.name,
        hp: Math.max(0, Math.ceil(X.hp)),
        max: X.maxHp,
        level: X.level
      } : null);
    },
    hn = m => {
      if (X === m) {
        ce = !0;
        return;
      }
      X = m, ce = !0;
    },
    yo = () => dn() && Ht(),
    Qr = () => {
      let m = yo();
      for (let h = 0; h < ht.length; h++) {
        let v = ht[h],
          A = ie >= v.cost && (v.id !== "mend" || fe < R - 0.5),
          F = !m,
          oe = (A ? 1 : 0) + (F ? 2 : 0);
        Ye[h] !== oe && (Ye[h] = oe, u.abilityState(v.key, {
          ready: A,
          disabled: F
        }));
      }
    };
  function vo(m) {
    let h = fe;
    fe = Math.min(R, fe + m);
    let v = Math.round(fe - h);
    w.copy(f).setY(f.y + 1.45), u.floater(w, `+${v > 0 ? v : m}`, "heal"), Ft();
  }
  function To(m, h, v, A) {
    g !== "fight" && g !== "breather" || V > 0 || (fe -= m, w.copy(f).setY(f.y + 1.4), u.floater(w, `\u2212${m}`, "damage"), e.sfx("hurt", A ? 1.2 : 0.9), A && Et(dt.heavyHurt), b = Math.min(1, b + (A ? 0.5 : 0.28)), _ = Math.max(_, A ? 0.08 : 0.045), w.copy(f).setY(f.y + 0.6), E.flash(w, A ? 2.4 : 1.6, Cn, 0.25, 1.6, 0.9), E.sparks(w, Cn, A ? 12 : 6, 4, (f.x - h) * 0.2, (f.z - v) * 0.2), e.avatar.gesturing || e.avatar.gesture("hit"), Ft(), fe <= 0 && ha());
  }
  function wo(m, h, v, A, F, oe) {
    if (Ze <= 0.05) return;
    let te = Math.min(1, Ze / oe);
    Ze -= oe * te, E.flash(m, h * (0.6 + 0.4 * te), v, A, F, oe * te);
  }
  let xo = -1;
  function Lt(m, h, v, A, F, oe) {
    let te = le.damage(m, h, F, oe, A);
    le.top(m, w), u.floater(w, String(h), v ? "crit" : "damage"), le.centre(m, ne);
    let ke = m.x - F,
      pe = m.z - oe,
      Be = Math.hypot(ke, pe) || 1;
    return E.sparks(ne, Mn(m.kind), v ? 16 : 9, v ? 7 : 5, ke / Be * 0.6, pe / Be * 0.6), wo(ne, v ? 1.7 : 1.1, Or, 0.12, 1.4, v ? 1.1 : 0.75), _ = Math.max(_, v ? 0.085 : 0.05), v && (b = Math.min(1, b + 0.14), p.crit()), xo !== we && (xo = we, p.impact(v || A > 6)), (v || we - ae >= yr) && (ae = we, Et(v ? dt.crit : dt.hit)), m === X && (ce = !0), te && Jr(m), te;
  }
  function Jr(m) {
    se++, x++;
    let h = tr(m.kind, I, m.elite);
    O += qn(m.kind, I, m.elite), ge += h, le.top(m, w), w.y += 0.45, u.floater(w, `+${h} XP`, "xp"), le.centre(m, ne);
    let v = m.kind === "golem" || m.kind === "warlord";
    if (E.sparks(ne, Mn(m.kind), v ? 36 : 18, v ? 8 : 6), wo(ne, v ? 4 : 2, Mn(m.kind), 0.3, 1.8, v ? 0.8 : 0.5), E.dust(m.x, me, m.z, v ? 10 : 4, m.radius), m.kind === "warlord") {
      _ = Math.max(_, 0.32), b = Math.min(1, b + 0.8), p.roar(), E.decal("shock", m.x, m.z, 2, 0.8, bt, {
        grow: 4
      });
      for (let A = 0; A < 5; A++) vt.orb(m.x, me + 1.5, m.z);
      u.banner("The Warlord falls", `+${xt(qn("warlord", I, !1))}`, 2200), e.achievements.unlock("arena-warlord"), e.sfx("win", 0.8), Et(dt.warlordFalls);
    } else {
      v && (_ = Math.max(_, 0.1)), (v || m.elite) && Et(dt.bigKill);
      let A = m.elite ? 1 : Oa[m.kind];
      Math.random() < A && vt.orb(m.x, me + (Ue[m.kind].height + 0.3), m.z);
    }
    X === m && (X = null, l = !1, ce = !0), Mo();
  }
  function Mo() {
    let m = !1;
    for (; ge >= Jn(Y);) ge -= Jn(Y), Y++, m = !0;
    m && (R = jt(Y), fe = Math.min(R, fe + Math.round(R * ir)), Ft(), u.banner(`Level ${Y}`, "+Damage \xB7 +Health", 1800), p.levelUp(), Et(dt.levelUp), e.sfx("win", 0.5), e.avatar.gesturing || e.avatar.gesture("celebrate"), E.decal("pool", f.x, f.z, 2.6, 1.1, un, {
      y: f.y - 0.02,
      intensity: 0.45
    }), E.decal("shock", f.x, f.z, 0.8, 0.7, un, {
      grow: 4,
      y: f.y - 0.02
    }), E.rise(f.x, f.y, f.z, 22, 0.9, un), w.copy(f).setY(f.y + 0.8), E.flash(w, 2.4, un, 0.45, 1.6, 0.55));
  }
  let ea = () => Math.sin(e.player.yaw),
    ta = () => Math.cos(e.player.yaw),
    pn = (m, h, v, A) => {
      let F = Qt.find(oe => !oe.live) ?? Qt[0];
      F.live = !0, F.at = we + h, F.kind = m, F.target = v, F.heading = A;
    },
    En = m => {
      let h = m - e.player.yaw;
      return Math.abs(Math.atan2(Math.sin(h), Math.cos(h)));
    },
    na = m => {
      if (X && le.targetable(X)) {
        let h = Math.hypot(X.x - f.x, X.z - f.z),
          v = Math.atan2(X.x - f.x, X.z - f.z);
        if (h < m + X.radius + 1 && En(v) < Ua) return v;
      }
      return e.player.yaw;
    },
    oa = () => le.pick(Pn(), 80),
    ra = m => {
      switch (m) {
        case "cleave":
          {
            let h = na(Dt.range),
              v = e.avatar.gesture("swing", {
                speed: 1.15
              });
            return pn("cleave", v.impact, null, h), p.swing(!0), X && le.targetable(X) && (l = !0), C = Math.max(C, v.duration * 0.8), !0;
          }
        case "firebolt":
          {
            if (!X || !le.targetable(X)) {
              let v = oa();
              v && hn(v);
            }
            let h = e.avatar.gesture("cast", {
              speed: 1.2
            });
            return pn("firebolt", h.impact, X && le.targetable(X) ? X : null, e.player.yaw), p.cast(), C = Math.max(C, h.duration * 0.7), !0;
          }
        case "whirlwind":
          {
            let h = e.avatar.gesture("spin", {
              speed: 1.1
            });
            return pn("whirlwind", h.impact, null, e.player.yaw), p.swing(!0), w.copy(f).setY(f.y + 0.55), E.slash(w, e.player.yaw, rn.radius * 0.85, 7, h.duration * 0.9), C = Math.max(C, h.duration * 0.8), !0;
          }
        case "blink":
          return aa();
        case "mend":
          return e.avatar.gesture("cast", {
            speed: 0.9
          }), vo(cr(Y)), p.mend(), E.decal("pool", f.x, f.z, 2.2, 0.9, Gn, {
            y: f.y - 0.02,
            intensity: 0.45
          }), E.rise(f.x, f.y, f.z, 18, 0.7, Gn), w.copy(f).setY(f.y + 0.7), E.flash(w, 1.9, Gn, 0.35, 1.5, 0.45), !0;
      }
    };
  function aa() {
    let m = Pn(),
      h = ea(),
      v = ta(),
      A = qt.distance;
    if (e.input.device === "gamepad") {
      let te = e.input.analog();
      if (Math.hypot(te.moveX, te.moveY) > 0.3) {
        let ke = f.x - Rt.eye.x,
          pe = f.z - Rt.eye.z,
          Be = Math.hypot(ke, pe) || 1,
          Ut = ke / Be * te.moveY - pe / Be * te.moveX,
          Nt = pe / Be * te.moveY + ke / Be * te.moveX,
          yn = Math.hypot(Ut, Nt) || 1;
        h = Ut / yn, v = Nt / yn;
      }
    } else if (m.intersectPlane(_t, w)) {
      let te = w.x - f.x,
        ke = w.z - f.z,
        pe = Math.hypot(te, ke);
      pe > 0.6 && (h = te / pe, v = ke / pe, A = Math.min(qt.distance, Math.max(2.5, pe)));
    }
    let F = 0;
    for (let te = 0.25; te <= A + 1e-6; te += 0.25) {
      let ke = f.x + h * te,
        pe = f.z + v * te;
      if (Math.hypot(ke, pe) > Pt + 0.3) break;
      ne.set(ke, f.y + 0.55, pe);
      let Be = e.collideSphere(ne, 0.36);
      if (Be && Be.depth > 0.02) break;
      F = te;
    }
    if (F < 1) return !1;
    _e.copy(f), Ce.set(f.x + h * F, f.y, f.z + v * F), ne.set(Ce.x, Ce.y + 1.5, Ce.z);
    let oe = e.raycast(ne, Nr, 4);
    oe && (Ce.y = oe.point.y + 0.02), Qe = 0, V = qt.invulnerable, e.avatar.gesture("cast", {
      speed: 2
    }), p.blink(), w.copy(_e).setY(_e.y + 0.6), E.flash(w, 2.2, bt, 0.3, 1.7, 1.2);
    for (let te of le.pool) {
      if (!le.targetable(te)) continue;
      let ke = te.x - _e.x,
        pe = te.z - _e.z,
        Be = Ne.MathUtils.clamp(ke * h + pe * v, 0, F),
        Ut = _e.x + h * Be - te.x,
        Nt = _e.z + v * Be - te.z;
      Math.hypot(Ut, Nt) < qt.pathRadius + te.radius && ($t(sn.get("4")?.power ?? 0.6, Y, Math.random, Ae), Lt(te, Ae.amount, Ae.crit, 3.5, _e.x + h * Be, _e.z + v * Be));
    }
    for (let te = 0; te <= F; te += 0.35) E.rise(_e.x + h * te, _e.y + 0.1, _e.z + v * te, 2, 0.25, gt);
    return !0;
  }
  let sa = m => {
    switch (m.kind) {
      case "auto":
        {
          let h = m.target;
          if (!h || !le.targetable(h) || Math.hypot(h.x - f.x, h.z - f.z) > et.melee + h.radius + 0.7 || !le.reachable(h, f.y)) return;
          let A = Math.atan2(h.x - f.x, h.z - f.z);
          if (En(A) > oo + 0.3) return;
          $t(1, Y, Math.random, Ae), w.copy(f).setY(f.y + 0.6), E.slash(w, A, 1.9, 1.9, 0.3, -0.3, 0.3), Lt(h, Ae.amount, Ae.crit, 2.2, f.x, f.z), ie = Math.min(et.energy, ie + et.energyPerHit);
          return;
        }
      case "cleave":
        {
          w.copy(f).setY(f.y + 0.6), E.slash(w, m.heading, Dt.range, Dt.halfArc * 2.2, 0.36, -0.28, 0.3);
          for (let h of le.pool) {
            if (!le.targetable(h)) continue;
            let v = h.x - f.x,
              A = h.z - f.z,
              F = Math.hypot(v, A);
            F > Dt.range + h.radius || !le.reachable(h, f.y) || Math.abs(Math.atan2(Math.sin(Math.atan2(v, A) - m.heading), Math.cos(Math.atan2(v, A) - m.heading))) > Dt.halfArc && (F > 1.1 + h.radius || En(Math.atan2(v, A)) > oo) || ($t(sn.get("1")?.power ?? 1.6, Y, Math.random, Ae), Lt(h, Ae.amount, Ae.crit, Dt.knockback, f.x, f.z));
          }
          return;
        }
      case "firebolt":
        {
          let h = sn.get("2");
          $t(h?.power ?? 2.6, Y, Math.random, Ae, 0.07);
          let v = f.x + Math.sin(m.heading) * 0.35,
            A = f.z + Math.cos(m.heading) * 0.35,
            F = f.y + 0.85,
            oe = Math.sin(m.heading),
            te = 0,
            ke = Math.cos(m.heading),
            pe = m.target && le.targetable(m.target) ? m.target : null;
          pe ? (le.centre(pe, w), oe = w.x - v, te = w.y - F, ke = w.z - A) : Pn().intersectPlane(_t, w) && (oe = w.x - v, te = (w.y - F) * 0.3, ke = w.z - A), vt.bolt(v, F, A, oe, te, ke, pe, Ae.amount, Ae.crit), e.sfx("shoot", 0.8), w.set(v, F, A), E.flash(w, 1.6, bt, 0.18, 1.6, 1);
          return;
        }
      case "whirlwind":
        {
          w.copy(f).setY(f.y + 0.5), E.decal("shock", f.x, f.z, 1.2, 0.45, bt, {
            grow: rn.radius / 1.2,
            y: f.y - 0.02
          }), E.ring(f.x, f.y, f.z, 22, 7, gt), E.dust(f.x, f.y, f.z, 8, 1.4), b = Math.min(1, b + 0.16), p.swing(!0);
          let h = 0;
          for (let v of le.pool) !le.targetable(v) || Math.hypot(v.x - f.x, v.z - f.z) > rn.radius + v.radius || !le.reachable(v, f.y) || ($t(sn.get("3")?.power ?? 1.4, Y, Math.random, Ae), Lt(v, Ae.amount, Ae.crit, rn.knockback, f.x, f.z) && h++);
          h >= Ba && e.achievements.unlock("arena-whirlwind-sweep");
          return;
        }
    }
  };
  u.onAbility(m => {
    if (!yo()) return;
    let h = sn.get(m);
    if (h && !(ie < h.cost) && !(h.id === "mend" && fe >= R - 0.5)) {
      if (!ra(h.id)) {
        e.sfx("hit", 0.35);
        return;
      }
      ie -= h.cost, u.trigger(m), Ft();
    }
  });
  function ia() {
    let m = Math.atan2(f.x - Rt.eye.x, f.z - Rt.eye.z),
      h = null,
      v = Number.POSITIVE_INFINITY;
    for (let A of le.pool) {
      if (!le.targetable(A) || !le.reachable(A, f.y)) continue;
      let F = Math.hypot(A.x - f.x, A.z - f.z);
      if (F > eo.reach) continue;
      let oe = Math.atan2(A.x - f.x, A.z - f.z) - m,
        te = Math.abs(Math.atan2(Math.sin(oe), Math.cos(oe)));
      if (te > eo.arc && F > et.melee + A.radius) continue;
      let ke = F + te * 3;
      ke < v && (v = ke, h = A);
    }
    return h;
  }
  let Bn = () => {
    l = !0, T = Math.min(T, 0.1);
  };
  e.onClick(m => {
    if (!mt() && g !== "fallen") return;
    let h = Rt.ray(m.x, m.y),
      v = e.raycast(h.origin, h.direction, 200),
      A = v ? v.distance + 0.6 : 200,
      F = le.pick(h, A),
      oe = Er(e.input.device, m.button, e.input.held("MouseLeft"), F !== null, X !== null && le.targetable(X));
    switch (oe.kind) {
      case "target":
        hn(F), oe.attack === !0 && Bn();
        return;
      case "keep":
        Bn();
        return;
      case "nearest":
        {
          let te = ia();
          te && (hn(te), Bn());
          return;
        }
      case "clear":
        hn(null), l = !1;
        return;
      case "none":
        return;
    }
  });
  function la(m, h) {
    let v = 0,
      A = Number.POSITIVE_INFINITY;
    for (let F = 0; F < 5; F++) {
      let oe = i.sites[F],
        te = Math.hypot(oe.x - m, oe.z - h);
      te < A && (A = te, v = F);
    }
    return v;
  }
  function ca() {
    let m = 0,
      h = -1,
      v = [];
    for (let A = 0; A < 5; A++) {
      let F = i.sites[A],
        oe = Math.hypot(F.x - f.x, F.z - f.z);
      oe > 4.5 && v.push(A), oe > h && (h = oe, m = A);
    }
    return v.length > 0 ? v[Math.floor(Math.random() * v.length)] : m;
  }
  function Fn(m, h, v, A) {
    let F = Bt.find(oe => !oe.live);
    F && (F.live = !0, F.at = we + A, F.site = m, F.kinds = h, F.elites = v, i.charge(m, 1), m !== 5 && p.spawn());
  }
  function ua(m) {
    m.live = !1;
    let h = i.sites[m.site];
    i.charge(m.site, 2.4), ma(m.site), w.set(h.x, me + 0.5, h.z);
    let v = m.kinds.includes("warlord");
    E.flash(w, v ? 7 : 3.4, fo, v ? 0.6 : 0.35, 1.6, 1.2), E.ring(h.x, me, h.z, v ? 36 : 14, v ? 7 : 4, gt), E.decal("shock", h.x, h.z, 0.7, 0.5, bt, {
      grow: v ? 5 : 2.4
    });
    let A = m.kinds.length > 1 && v;
    m.kinds.forEach((F, oe) => {
      let te = oe / Math.max(1, m.kinds.length) * Math.PI * 2 + Math.random(),
        ke = m.kinds.length > 1 ? v ? 2.6 : 0.7 : 0;
      le.spawn(F, m.elites[oe] ?? !1, h.x + Math.sin(te) * ke, h.z + Math.cos(te) * ke, I, A ? rr : 1);
    }), v && (p.roar(), Et(dt.warlordRises), b = Math.min(1, b + 0.6), n.pulseFocus(1), A ? u.banner("The Twin Warlords", `Wave ${I}`, 2600) : u.banner("The Ashen Warlord", `Wave ${I}`, 2600));
  }
  let bn = new Float32Array(6);
  function ma(m) {
    bn[m] = we + 0.35;
  }
  function Ro(m) {
    if (I = m, G = sr(m), L = 0, D = 0.3, x = 0, H = G.queue.length, g = "fight", n.pulseFocus(0.6), m === 1) {
      let h = le.wake(m);
      L = Math.min(h, 3), h > 0 && (D = 1.4);
    }
    if (m > 1 && !G.boss) {
      let h = G.twist ? `${Zn[G.twist]} \xB7 ` : "";
      u.banner(`Wave ${m}`, `${h}${H} foes`, 1700);
    }
    Me = "";
  }
  function da(m) {
    if (!G) return;
    D -= m;
    let h = 0;
    for (let v of Bt) v.live && (h += v.kinds.length);
    if (D <= 0 && L < G.queue.length) {
      let v = le.alive() + h;
      if (v < G.cap) {
        if (G.queue[L] === "warlord") {
          let F = [],
            oe = [];
          for (; G.queue[L] === "warlord";) F.push("warlord"), oe.push(!1), L++;
          Fn(5, F, oe, 1.6), D = 3.2;
        } else {
          let F = Math.min(G.burst, G.queue.length - L, G.cap - v),
            oe = [],
            te = [];
          for (let ke = 0; ke < F; ke++) {
            let pe = G.queue[L];
            if (pe === "warlord") break;
            oe.push(pe), te.push(Math.random() < G.eliteChance), L++;
          }
          oe.length > 0 && Fn(ca(), oe, te, 0.7), D = G.interval * (0.8 + Math.random() * 0.4);
        }
      } else D = 0.4;
    }
    L >= G.queue.length && h === 0 && le.alive() === 0 && g === "fight" && fa();
  }
  function fa() {
    let m = nr(I);
    O += m, ge += or(I), g = "breather", M = La, u.banner(`Wave ${I} cleared`, `+${xt(m)}`, 1900), e.achievements.unlock("arena-first-wave"), I >= zr && e.achievements.unlock("arena-wave-10"), e.sfx("win", 0.55), Et(dt.waveClear), Mo(), Me = "";
  }
  function Ho() {
    I = 0, G = null, L = 0, O = 0, se = 0, he = 0, Y = 1, ge = 0, R = jt(1), fe = R, ie = et.energy, X = null, l = !1, T = 0, C = 0, V = 0, J = 0, K = !1, Z = 0, d = !1, B = !1, a = -10, S = 0, $.fill(0), re = !1, Me = "", je = -1, Ge = -1, Ye.fill(-1), fn.fill(Number.NaN);
    for (let m of Qt) m.live = !1;
    for (let m of Bt) m.live = !1;
    for (let m = 0; m < 6; m++) i.charge(m, 0);
  }
  function gn(m) {
    if (!(le.sleepers() > 0)) for (let [h, v] of ro) {
      let [A,, F] = on(h, v);
      le.sleep(A, F), m && (w.set(A, me + 0.4, F), E.flash(w, 2.2, fo, 0.4, 1.6, 0.7), E.ring(A, me, F, 8, 2.5, gt));
    }
  }
  function Ln(m) {
    let h = le.sleepers() > 0;
    le.clear(), vt.clear(), E.clear(), Ho(), h && gn(!1), Kr(m), g = "countdown", i.setAwake(1), u.show({
      title: "Get ready",
      primary: "0",
      secondary: "Endless waves",
      icon: "score"
    }), u.abilities($r), Ft(), go(), _n(), n.pulseFocus(0.8);
    let v = ++P;
    u.countdown(3).then(A => {
      !A || v !== P || g !== "countdown" || (Z = 0, Ro(1), Ht() || (u.banner("Into the ring!", "Down the stairs", 2400), d = !0));
    });
  }
  function Un(m) {
    P++;
    let h = O > 0 && e.records.best(Sr, O);
    e.records.best(kr, I), le.banish(), vt.clear();
    for (let F of Bt) F.live = !1;
    for (let F = 0; F < 6; F++) i.charge(F, 0);
    X = null, l = !1;
    let v = m === "fallen" ? h ? `New best \xB7 ${xt(O)}` : "Fallen" : h ? `New best \xB7 ${xt(O)}` : m === "left" ? "Left the ring" : "Blade laid down",
      A = `${ur(Math.max(1, I), se, he)} \xB7 ${xt(O)}`;
    m === "fallen" ? (g = "fallen", ee = 0, u.hide(), u.show({
      title: `Fallen \xB7 Wave ${I}`,
      primary: xt(O),
      icon: "score"
    }), Me = "", fn.fill(Number.NaN), _n(), u.banner(v, A, 4600)) : (g = "idle", u.hide(), u.banner(v, A, 3600), Eo(), i.setAwake(0));
  }
  function ha() {
    fe = 0, _ = Math.max(_, 0.3), b = Math.min(1, b + 0.6), e.sfx("lose"), p.death(), Et(dt.fallen), e.avatar.gesture("hit", {
      speed: 0.6
    }), w.copy(f).setY(f.y + 0.6), E.flash(w, 4, Cn, 0.6, 1.8, 1), Un("fallen");
  }
  function So() {
    P++, g = "idle", le.clear(), vt.clear(), E.clear(), r.clearFlashes(), c.clear(), s.clear(), Ho(), Eo(), i.setAwake(0), Qe = -1, t = 0, e.active || (gn(!1), le.update(0, 0));
  }
  e.addInteractable({
    position: st,
    radius: 2.8,
    label: () => g === "idle" ? "Take up the blade" : g === "fallen" ? "Fight again" : "Lay down the blade",
    enabled: () => g !== "countdown",
    onInteract: () => {
      g === "idle" || g === "fallen" ? Ln(!1) : Un("yield");
    }
  }), e.addInteractable({
    position: z,
    radius: 1.5,
    label: "Fight again",
    enabled: () => g === "fallen" && Math.hypot(f.x, f.z) < Oe - 0.05,
    onInteract: () => Ln(!1)
  });
  let ko = Ee(y.accent, 1),
    pa = Ee(y.arcaneHot, 1.2),
    Ea = m => {
      if (m !== re) {
        re = m;
        for (let h = 0; h < ht.length; h++) {
          let v = ht[h].key;
          m ? $[h] = u.cooldown(v) : $[h] > 0.05 && u.trigger(v, $[h]);
        }
      }
    };
  e.onPause(m => Ea(m && mt()));
  let zo = (m, h, v) => {
    let A = h ? 1 + Math.sin(m * 2.2) * 0.18 : 0;
    if (r.setStretched(Wr, st.x, st.y + 6.2, st.z, 1.9, 13, ko, 0.26 * A), r.setStretched(Yr, st.x, st.y + 6.2, st.z, 0.5, 13, pa, 0.5 * A), r.set(Xr, st.x, st.y, st.z, 2.4, ko, h ? 0.7 : 0.15), h && e.active) for (Dn += v; Dn > 0.09;) {
      Dn -= 0.09;
      let F = Math.random() * Math.PI * 2,
        oe = Math.random() * 0.4;
      c.emit(st.x + Math.cos(F) * oe, st.y + Math.random() * 0.6, st.z + Math.sin(F) * oe, 0, 2.2 + Math.random() * 2.2, 0, 1.6 + Math.random() * 1.2, 0.08 + Math.random() * 0.05, gt, -0.2, 0.3, 0.3);
    }
  };
  gn(!1), le.update(0, 0), e.onUpdate((m, h) => {
    let A = mt() && e.paused ? 0 : m;
    if (!e.active) {
      k = null, (g !== "idle" || Q) && So(), zo(h, !0, m), r.update(m);
      return;
    }
    we += A, Ze = Ar, f.copy(e.player.position), W.copy(e.player.velocity), z.set(f.x, f.y + 0.6, f.z);
    let F = Ht();
    if (zo(h, !Q, m), g === "idle" && jr() && Ln(!0), g === "idle") {
      if (t += A, t > 2.5 && le.alive() === 0 && le.sleepers() === 0 && gn(!0), le.sleepers() > 0) {
        let pe = 0.5 + Math.sin(h * 1.6) * 0.16;
        for (let Be of Na) i.charge(Be, pe);
        if (j += A, j > 0.35) {
          j = 0;
          let [Be, Ut] = ro[Math.floor(Math.random() * ro.length)] ?? [0, 0],
            [Nt,, yn] = on(Be, Ut);
          c.emit(Nt, me + 0.7, yn, 0.15, 0.7, 0, 1.8, 0.11, gt, -0.05, 0.25, 0.4);
        }
      }
    } else t = 0;
    let oe = _ > 0 ? A * 0.05 : A;
    _ = Math.max(0, _ - A), mt() && (g !== "countdown" && (he += A), Z += A, F && (K = !0), ie = Math.min(et.energy, ie + et.energyRegen * A), V = Math.max(0, V - A), C = Math.max(0, C - A), T -= A, d && F && (d = !1, u.banner("")), De = !F, !F && g !== "countdown" && (K || Z > 6) ? (J += A, J >= no && Un("left")) : F && (J = Math.max(0, J - A * Fa))), g === "fight" && da(oe), g === "breather" && (M -= A, M <= 0 && Ro(I + 1)), g === "fallen" && (ee = Math.hypot(f.x, f.z) < Oe - 0.05 ? 0 : ee + A, ee > 0.6 && (u.hide(), So()));
    for (let pe of Bt) pe.live && we >= pe.at && mt() && ua(pe);
    for (let pe = 0; pe < 6; pe++) bn[pe] && we >= bn[pe] && (bn[pe] = 0, i.charge(pe, 0));
    for (let pe of Qt) pe.live && we >= pe.at && (pe.live = !1, mt() && sa(pe));
    if (mt() && l && X && le.targetable(X) && F && C <= 0 && Qe < 0 && Math.hypot(X.x - f.x, X.z - f.z) <= et.melee + X.radius && le.reachable(X, f.y) && T <= 0) if (En(Math.atan2(X.x - f.x, X.z - f.z)) < oo) {
      T = et.swing, S = 0;
      let Be = e.avatar.gesture("swing", {
        speed: 1.3
      });
      pn("auto", Be.impact, X, 0), p.swing(!1);
    } else S += A, S > 0.8 && we - a > 9 && (a = we, e.toast("Turn to face your target"));
    if (X && !le.targetable(X) && (X = null, l = !1, ce = !0), Qe >= 0) {
      Qe += A;
      let pe = Math.min(1, Qe / qt.duration),
        Be = 1 - (1 - pe) * (1 - pe);
      w.lerpVectors(_e, Ce, Be), e.player.teleport([w.x, w.y, w.z], e.player.yaw), pe >= 1 ? (Qe = -1, w.copy(Ce).setY(Ce.y + 0.6), E.flash(w, 2.4, bt, 0.35, 1.8, 1.2), E.ring(Ce.x, Ce.y, Ce.z, 12, 3.5, gt)) : c.emit(w.x, w.y + 0.6, w.z, 0, 0.5, 0, 0.4, 0.3, gt, 0, 1, 0.2);
    }
    Xe.copy(f).setY(f.y + 1), le.setView(Rt.eye, Xe), le.update(oe, h), vt.update(oe, h), E.update(A, h), r.update(A), (mt() || g === "fallen") && (_n(), mt() && (Ft(), Qr()), ce && go());
    let te = Math.hypot(f.x, f.z),
      ke = (mt() || g === "fallen") && K ? Ne.MathUtils.clamp((Oe + 1.2 - te) / 1.6, 0, 1) : 0;
    ve.copy(f).setY(f.y + 1.35), b = Math.max(0, b - m * 1.9), Rt.update(m, h, ke, ve, b), k && (e.rumble(k[0], k[1]), k = null);
  });
}
import * as q from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var ot = Math.PI * 2,
  so = Math.asin(tt.width / 2 / Oe) + 0.018,
  ao = Oe - 0.1;
function it(n, e, o, r = !0, c = !0) {
  let s = new q.Mesh(n, e);
  return s.name = o, s.castShadow = r, s.receiveShadow = c, s;
}
function Wa() {
  let n = [...St].map(o => (o + ot) % ot).sort((o, r) => o - r),
    e = [];
  for (let o = 0; o < n.length; o++) {
    let r = n[o] + so,
      c = n[(o + 1) % n.length],
      s = (o + 1 < n.length ? c : c + ot) - so;
    e.push([r, s]);
  }
  return e;
}
function Ya(n) {
  let e = new q.Shape(),
    o = me + 0.02;
  e.moveTo(ao, o), e.lineTo(ao, $e - tt.rise);
  let r = ao;
  for (let s = 1; s < tt.steps; s++) {
    let i = $e - tt.rise * s;
    r -= tt.run, e.lineTo(r, i), s + 1 < tt.steps && e.lineTo(r, i - tt.rise);
  }
  e.lineTo(r, o), e.closePath();
  let c = new q.ExtrudeGeometry(e, {
    depth: tt.width,
    bevelEnabled: !1
  });
  return c.translate(0, 0, -tt.width / 2), c.rotateY(n - Math.PI / 2), Je(be(c, y.sandLight), 0.06, 3);
}
function Xa(n, e, o, r) {
  let c = n / 2,
    s = new q.Shape();
  if (s.moveTo(-c, 0), s.lineTo(c, 0), o <= 0) s.lineTo(c, e), s.lineTo(-c, e);else {
    let g = e * (1 - o);
    for (let P = 0; P <= 7; P++) {
      let Q = P / 7,
        I = c - Q * n,
        G = q.MathUtils.lerp(e * 0.95, g, Q) + (r() - 0.5) * 0.8;
      s.lineTo(I, Math.max(0.6, G));
    }
  }
  s.closePath();
  let i = c - rt.pierWidth,
    u = Math.min(e * 0.42, e - i - 0.35),
    p = new q.Path();
  return p.moveTo(-i, 0.001), p.lineTo(i, 0.001), p.lineTo(i, u), p.absarc(0, u, i, 0, Math.PI, !1), p.lineTo(-i, 0.001), o < 0.55 && s.holes.push(p), s;
}
function Ka() {
  let n = document.createElement("canvas");
  n.width = 128, n.height = 256;
  let e = n.getContext("2d");
  e.fillStyle = y.banner, e.fillRect(0, 0, 128, 256), e.fillStyle = y.bannerDark, e.fillRect(0, 0, 14, 256), e.fillRect(114, 0, 14, 256), e.fillStyle = y.gold, e.fillRect(14, 0, 6, 256), e.fillRect(108, 0, 6, 256);
  for (let r of [64, 192]) e.beginPath(), e.moveTo(64, r - 34), e.bezierCurveTo(88, r - 8, 84, r + 18, 64, r + 30), e.bezierCurveTo(44, r + 18, 40, r - 8, 64, r - 34), e.fill(), e.fillStyle = y.banner, e.beginPath(), e.moveTo(64, r - 10), e.bezierCurveTo(74, r + 2, 72, r + 14, 64, r + 20), e.bezierCurveTo(56, r + 14, 54, r + 2, 64, r - 10), e.fill(), e.fillStyle = y.gold;
  let o = new q.CanvasTexture(n);
  return o.colorSpace = q.SRGBColorSpace, o.wrapT = q.RepeatWrapping, o.anisotropy = 4, o;
}
function ja() {
  let n = document.createElement("canvas");
  n.width = 256, n.height = 256;
  let e = n.getContext("2d");
  e.fillStyle = y.bannerDark, e.beginPath(), e.arc(128, 128, 127, 0, Math.PI * 2), e.fill(), e.fillStyle = y.banner, e.beginPath(), e.arc(128, 128, 112, 0, Math.PI * 2), e.fill(), e.strokeStyle = y.gold, e.lineWidth = 7, e.beginPath(), e.arc(128, 128, 100, 0, Math.PI * 2), e.stroke(), e.lineWidth = 3, e.beginPath(), e.arc(128, 128, 88, 0, Math.PI * 2), e.stroke(), e.fillStyle = y.gold, e.beginPath(), e.moveTo(128, 60), e.bezierCurveTo(176, 110, 168, 160, 128, 190), e.bezierCurveTo(88, 160, 80, 110, 128, 60), e.fill(), e.fillStyle = y.banner, e.beginPath(), e.moveTo(128, 108), e.bezierCurveTo(150, 132, 146, 158, 128, 172), e.bezierCurveTo(110, 158, 106, 132, 128, 108), e.fill();
  let o = new q.CanvasTexture(n);
  return o.colorSpace = q.SRGBColorSpace, o.anisotropy = 4, o;
}
function $a(n) {
  let e = Tt.width,
    o = [],
    r = (u, p, E, g, P) => {
      let Q = Math.hypot(E - u, g - p),
        I = new q.PlaneGeometry(e, Q).rotateX(-Math.PI / 2),
        G = I.getAttribute("uv");
      for (let L = 0; L < G.count; L++) G.setY(L, G.getY(L) * (Q / 2.4));
      I.rotateY(Math.atan2(E - u, g - p)), I.translate((u + E) / 2, $e + P, (p + g) / 2), o.push(I);
    };
  r(0, Tt.start, 0, Tt.fork, 0.012);
  for (let [u, p] of Tt.stairs.entries()) r(0, Tt.fork, Math.sin(p) * Tt.head, Math.cos(p) * Tt.head, 0.014 + u * 0.002);
  let c = new q.Mesh(Pe(o), new q.MeshToonMaterial({
    map: Ka(),
    gradientMap: n.gradient
  }));
  c.name = "ember-runner", c.receiveShadow = !0;
  let s = new q.Mesh(new q.CircleGeometry(1.75, 40).rotateX(-Math.PI / 2), new q.MeshToonMaterial({
    map: ja(),
    gradientMap: n.gradient,
    transparent: !1
  }));
  s.position.set(0, $e + 0.02, Tt.fork), s.name = "ember-runner-medallion", s.receiveShadow = !0;
  let i = new q.Group();
  return i.name = "ember-runners", i.add(c, s), i;
}
function Pr(n) {
  let e = [],
    o = [],
    r = ut(4242),
    c = new q.CircleGeometry(Oe + 0.02, 128).rotateX(-Math.PI / 2),
    s = it(be(c, "#ffffff"), n.pit, "ember-pit-floor", !1);
  s.position.y = me, e.push(s);
  let i = it(Je(be(Xt([[Oe, $e], [Oe, me]], 0, ot, 160, {
    tile: 1.6
  }), y.stone), 0.05, 5, {
    below: me,
    above: $e,
    strength: 0.35
  }), n.blocks, "ember-pit-wall", !1);
  e.push(i);
  let u = Pe(St.map(a => Ya(a)));
  e.push(it(u, n.stone, "ember-stairs"));
  let p = Pe(St.map(a => Ve(be(new q.BoxGeometry(0.3, 0.9, tt.width + 0.2), y.stoneDark), new q.Vector3(Math.sin(a) * (Oe - 0.02), me + 0.46, Math.cos(a) * (Oe - 0.02)), new q.Euler(0, a - Math.PI / 2, 0))));
  o.push(it(p, n.stone, "ember-stair-sills", !1));
  let E = [[qe.outer, $e + 0.002], [qe.outer, qe.height - 0.14], [qe.outer + 0.07, qe.height - 0.14], [qe.outer + 0.07, qe.height], [qe.inner - 0.07, qe.height], [qe.inner - 0.07, qe.height - 0.14], [qe.inner, qe.height - 0.14], [qe.inner, $e + 0.002]],
    g = Pe(Wa().map(([a, S]) => Je(be(Xt(E, a, S, Math.max(4, Math.round((S - a) * 40)), {
      tile: 1.2
    }), y.sandLight), 0.05, 9)));
  e.push(it(g, n.blocks, "ember-parapet"));
  let P = [];
  for (let a of St) for (let S of [-1, 1]) {
    let t = a + S * (so + 0.022);
    P.push(Ve(Je(be(new q.BoxGeometry(0.72, 0.95, 0.72), y.sand), 0.06, 12), new q.Vector3(Math.sin(t) * (qe.inner + 0.28), 0.479, Math.cos(t) * (qe.inner + 0.28)), new q.Euler(0, t, 0)));
  }
  e.push(it(Pe(P), n.stone, "ember-newels"));
  let Q = new q.RingGeometry(Oe, Tn, 160, 1).rotateX(-Math.PI / 2),
    I = Q.getAttribute("uv"),
    G = Q.getAttribute("position");
  for (let a = 0; a < I.count; a++) I.setXY(a, G.getX(a) / 4.8, G.getZ(a) / 4.8);
  let L = it(be(Q, "#ffffff"), n.flags, "ember-gallery", !1);
  e.push(L);
  let D = [],
    x = [],
    H = $e;
  for (let a of Gt) {
    D.push(Je(be(Xt([[a.r0, a.top], [a.r0, H]], 0, ot, 160, {
      tile: 1.4
    }), y.sand), 0.05, 17));
    let S = a === Gt[Gt.length - 1] ? nt.outer : a.r1;
    x.push(be(Xt([[S, a.top], [a.r0, a.top]], 0, ot, 160, {
      tile: 3.2
    }), "#ffffff")), H = a.top;
  }
  D.push(Je(be(Xt([[nt.outer, me - 1.2], [nt.outer, nt.top]], 0, ot, 96, {
    tile: 1.4
  }), y.stoneDark), 0.08, 19, {
    below: me - 1.2,
    above: nt.top,
    strength: 0.4
  })), e.push(it(Pe(D), n.blocks, "ember-tier-risers", !1)), e.push(it(Pe(x), n.flags, "ember-tier-treads", !1));
  let M = rt.piers,
    O = 2 * rt.radius * Math.sin(Math.PI / M) + 0.25,
    se = [{
      broken: 0,
      bays: []
    }, {
      broken: 0.35,
      bays: []
    }, {
      broken: 0.7,
      bays: []
    }],
    he = new Set([4, 15, 19]),
    Y = [0, 0, 1, 0, -1, 0, 0, 2, 0, 0, 2, 2, 0, 0, 1, -1, 0, 0, 1, -1, 0, 0];
  for (let a = 0; a < M; a++) {
    if (he.has(a)) continue;
    let S = Y[a] ?? 0;
    S >= 0 && se[S]?.bays.push(a);
  }
  let ge = new q.Matrix4(),
    fe = new q.Quaternion(),
    R = new q.Vector3(1, 1, 1),
    ie = new q.Vector3(0, 1, 0);
  for (let [a, S] of se.entries()) {
    if (S.bays.length === 0) continue;
    let t = Xa(O, rt.height, S.broken, ut(700 + a)),
      j = new q.ExtrudeGeometry(t, {
        depth: 1.1,
        bevelEnabled: !1,
        curveSegments: 10
      });
    j.translate(0, 0, -0.55);
    let k = [Je(be(j, y.sand), 0.06, 31 + a, {
      below: 0,
      above: rt.height,
      strength: 0.25
    })];
    S.broken === 0 && k.push(Ve(be(new q.BoxGeometry(O + 0.05, 0.42, 1.45), y.sandLight), new q.Vector3(0, rt.height + 0.21, 0)));
    let ae = Pe(k),
      $ = new q.InstancedMesh(ae, n.blocks, S.bays.length);
    $.name = `ember-arcade-${a}`, $.castShadow = !0, $.receiveShadow = !0, S.bays.forEach((re, f) => {
      let W = (re + 0.5) / M * ot;
      fe.setFromAxisAngle(ie, W), ge.compose(new q.Vector3(Math.sin(W) * rt.radius, rt.base, Math.cos(W) * rt.radius), fe, R), $.setMatrixAt(f, ge);
    }), $.computeBoundingSphere(), e.push($);
  }
  let X = [];
  for (let a = 0; a < 16; a++) {
    let S = (a + 0.5) / 16 * ot,
      t = Math.abs(Math.atan2(Math.sin(S), Math.cos(S))) < 0.3,
      j = Wt.some(k => Math.abs(Math.atan2(Math.sin(S - k.bearing), Math.cos(S - k.bearing))) < (k.facing === "out" ? 0.2 : 0.1));
    t || j || X.push({
      bearing: S,
      height: r() < 0.45 ? 1.6 + r() * 2.4 : 5.2
    });
  }
  let ce = Je(be(new q.CylinderGeometry(0.42, 0.5, 1, 14, 1).translate(0, 0.5, 0), y.sandLight), 0.05, 41),
    l = new q.InstancedMesh(ce, n.stone, X.length);
  l.name = "ember-columns", l.castShadow = !0, l.receiveShadow = !0;
  let T = [],
    C = Tn - 1.4;
  X.forEach((a, S) => {
    let t = Math.sin(a.bearing) * C,
      j = Math.cos(a.bearing) * C;
    if (fe.setFromAxisAngle(ie, r() * ot), ge.compose(new q.Vector3(t, 0.3, j), fe, new q.Vector3(1, a.height, 1)), l.setMatrixAt(S, ge), T.push(Ve(be(new q.BoxGeometry(1.25, 0.3, 1.25), y.sand), new q.Vector3(t, 0.154, j), new q.Euler(0, a.bearing, 0))), a.height > 5) T.push(Ve(be(new q.BoxGeometry(1.2, 0.36, 1.2), y.sandLight), new q.Vector3(t, 0.3 + a.height + 0.18, j), new q.Euler(0, a.bearing, 0)));else {
      let k = r() * ot;
      T.push(Ve(be(new q.CylinderGeometry(0.44, 0.44, 0.8, 12), y.sandDark), new q.Vector3(t + Math.cos(k) * 1.1, 0.44, j + Math.sin(k) * 1.1), new q.Euler(Math.PI / 2, 0, k)));
    }
  }), l.computeBoundingSphere(), e.push(l), e.push(it(Pe(T), n.stone, "ember-column-bits"));
  let V = new q.Group();
  V.name = "ember-statue";
  let _ = [],
    b = (a, S, t, j, k, ae, $, re = 0, f = 0) => _.push(Ve(Je(be(new q.BoxGeometry(a, S, t), $), 0.07, _.length + 50), new q.Vector3(j, k, ae), new q.Euler(re, 0, f)));
  b(5.2, 1.6, 4.2, 0, 0.8, 0, y.stoneDark), b(4.4, 0.5, 3.6, 0, 1.85, 0, y.stone), b(1.25, 4.6, 1.4, -0.95, 4.4, 0, y.sand), b(1.25, 4.6, 1.4, 0.95, 4.4, 0, y.sand), b(3.4, 3.8, 1.9, 0, 8.4, 0, y.sandLight), b(1, 3.2, 1, 2.2, 8.9, 0.1, y.sand, 0, 0.25), b(2, 1.6, 1.6, 0, 10.9, 0, y.sand, 0, 0.12), b(0.55, 6.8, 0.16, 0, 5.2, 2.3, y.stone), b(2.4, 0.4, 0.5, 0, 8.8, 2.3, y.stoneDark), b(0.4, 1.4, 0.4, 0, 9.7, 2.3, y.stoneDark);
  let J = it(Pe(_), n.stone, "ember-statue-stone");
  V.add(J), V.position.set(0, nt.top + 0.004, -(nt.inner + 2.3)), V.updateMatrixWorld(!0), e.push(V);
  let K = [],
    Z = (a, S, t, j, k) => {
      K.push(Ve(Je(be(wt(j, 0, 900 + K.length, 0.7), k), 0.1, K.length), new q.Vector3(a, S + j * 0.35, t), new q.Euler(r() * 3, r() * 3, r() * 3)));
    };
  for (let a = 0; a < 26; a++) {
    let S = r() * ot;
    Math.abs(Math.atan2(Math.sin(S), Math.cos(S))) < 0.35 && (S += 0.9);
    let t = Gt[Math.floor(r() * Gt.length)] ?? Gt[0],
      j = q.MathUtils.lerp(t.r0 + 0.5, t.r1 - 0.3, r());
    Z(Math.sin(S) * j, t.top, Math.cos(S) * j, 0.35 + r() * 0.45, y.sand);
  }
  for (let a = 0; a < 18; a++) {
    let S = r() * ot,
      t = nt.inner + 0.6 + r() * (nt.outer - nt.inner - 1.2);
    Z(Math.sin(S) * t, nt.top, Math.cos(S) * t, 0.4 + r() * 0.8, y.stone);
  }
  for (let a = 0; a < 10; a++) {
    let S = r() * ot;
    Math.abs(Math.atan2(Math.sin(S), Math.cos(S))) < 0.35 && (S += 0.8);
    let t = Tn - 0.5 - r() * 0.6;
    Z(Math.sin(S) * t, $e, Math.cos(S) * t, 0.3 + r() * 0.3, y.sandDark);
  }
  e.push(it(Pe(K), n.stone, "ember-rubble"));
  let ee = new q.CylinderGeometry(nt.outer - 0.15, 2.5, 30, 28, 7, !0),
    we = ee.getAttribute("position"),
    Me = ut(77),
    je = new Map();
  for (let a = 0; a < we.count; a++) {
    let S = we.getX(a),
      t = we.getY(a),
      j = we.getZ(a),
      k = `${S.toFixed(2)},${t.toFixed(2)},${j.toFixed(2)}`,
      ae = je.get(k);
    ae === void 0 && (ae = t > 14.5 ? 1 : 0.78 + Me() * 0.42, je.set(k, ae)), we.setXYZ(a, S * ae, t + (t > 14.5 ? 0 : (Me() - 0.5) * 1.6), j * ae);
  }
  let Ge = ee.toNonIndexed();
  Ge.computeVertexNormals(), ee.dispose();
  let De = be(Ge, y.rock),
    Ye = De.getAttribute("color"),
    Qe = De.getAttribute("glow"),
    _e = new q.Color(y.lava),
    Ce = De.getAttribute("position");
  for (let a = 0; a < Ce.count; a += 3) {
    let S = Ce.getY(a),
      j = Math.sin(Math.atan2(Ce.getX(a), Ce.getZ(a)) * 5 + S * 0.4) > 0.93 && S < 12 ? 1 : 0,
      k = 0.55 + (S + 15) / 60;
    for (let ae = 0; ae < 3; ae++) j ? (Ye.setXYZ(a + ae, _e.r, _e.g, _e.b), Qe.setX(a + ae, 0.9)) : Ye.setXYZ(a + ae, Ye.getX(a + ae) * k, Ye.getY(a + ae) * k, Ye.getZ(a + ae) * k);
  }
  let Ze = it(De, n.rock, "ember-island", !1, !1);
  Ze.position.y = me - 0.9 - 15, o.push(Ze);
  let d = new q.Group();
  d.name = "ember-drifters";
  let B = [];
  for (let a = 0; a < 7; a++) {
    let S = 1.5 + r() * 3,
      t = it(be(wt(S, 0, 500 + a, 1.3), y.rockDark), n.rock, "ember-drifter", !1, !1),
      j = r() * ot,
      k = 30 + r() * 22,
      ae = new q.Vector3(Math.sin(j) * k, -12 - r() * 14, Math.cos(j) * k);
    t.position.copy(ae), d.add(t), B.push({
      mesh: t,
      base: ae,
      phase: r() * ot
    });
  }
  return o.push(d), o.push($a(n)), {
    statics: e,
    decor: o,
    update(a) {
      for (let S of B) S.mesh.position.y = S.base.y + Math.sin(a * 0.3 + S.phase) * 0.8, S.mesh.rotation.y = a * 0.05 + S.phase;
    }
  };
}
import * as N from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var qa = `
attribute float aPhase;
varying vec2 vUv;
varying float vPhase;
void main() {
  vUv = uv;
  vPhase = aPhase;
  vec4 mv = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float sx = length(instanceMatrix[0].xyz);
  float sy = length(instanceMatrix[1].xyz);
  mv.xy += vec2(position.x * sx, (position.y + 0.5) * sy);
  gl_Position = projectionMatrix * mv;
}
`,
  Za = `
uniform float uTime;
varying vec2 vUv;
varying float vPhase;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
void main() {
  float t = uTime * 2.6 + vPhase * 17.0;
  float n = noise(vec2(vUv.x * 4.0 + vPhase * 3.0, vUv.y * 3.5 - t));
  float n2 = noise(vec2(vUv.x * 9.0 - vPhase, vUv.y * 7.0 - t * 1.7));
  float y = vUv.y;
  float sway = (n - 0.5) * 0.35 * y + sin(t * 0.7 + y * 3.0) * 0.05 * y;
  float x = vUv.x - 0.5 + sway;
  float width = mix(0.36, 0.015, pow(y, 0.75));
  float body = smoothstep(width, width * 0.25, abs(x));
  body *= smoothstep(1.0, 0.55, y + n2 * 0.35) * smoothstep(0.0, 0.07, y);
  float heat = body * (1.25 - y);
  vec3 col = mix(vec3(0.9, 0.18, 0.02), vec3(1.0, 0.62, 0.16), smoothstep(0.15, 0.6, heat));
  col = mix(col, vec3(1.0, 0.93, 0.62), smoothstep(0.65, 1.05, heat));
  gl_FragColor = vec4(col * body * 2.4, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,
  Qa = `
attribute vec2 aRune;
varying vec2 vUv;
varying float vLevel;
varying float vSpin;
void main() {
  vUv = uv;
  vLevel = aRune.x;
  vSpin = aRune.y;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
`,
  Ja = `
uniform sampler2D uMap;
uniform vec3 uColor;
uniform vec3 uHot;
uniform float uTime;
varying vec2 vUv;
varying float vLevel;
varying float vSpin;
void main() {
  vec2 p = vUv - 0.5;
  float a = vSpin;
  vec2 q = vec2(cos(a) * p.x - sin(a) * p.y, sin(a) * p.x + cos(a) * p.y) + 0.5;
  vec4 tex = texture2D(uMap, q);
  float ring = tex.r;
  float glyph = tex.g;
  float pulse = 0.85 + 0.15 * sin(uTime * 2.0 + vSpin * 3.0);
  float level = vLevel;
  vec3 col = uColor * (ring * 0.9 + glyph * 0.7) * pulse;
  col = mix(col, uHot * (ring + glyph), clamp(level - 1.0, 0.0, 1.0));
  float r = length(p) * 2.0;
  float fill = smoothstep(1.0, 0.0, r) * 0.25 * max(0.0, level - 0.4);
  gl_FragColor = vec4((col + uColor * fill) * level, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
function es() {
  let e = document.createElement("canvas");
  e.width = 512, e.height = 512;
  let o = e.getContext("2d");
  o.fillStyle = "#000", o.fillRect(0, 0, 512, 512);
  let r = 512 / 2;
  o.lineCap = "round", o.strokeStyle = "#ff0000", o.lineWidth = 9, o.beginPath(), o.arc(r, r, 240, 0, Math.PI * 2), o.stroke(), o.lineWidth = 4, o.beginPath(), o.arc(r, r, 214, 0, Math.PI * 2), o.stroke(), o.beginPath(), o.arc(r, r, 120, 0, Math.PI * 2), o.stroke(), o.lineWidth = 5, o.beginPath();
  for (let u = 0; u <= 5; u++) {
    let p = -Math.PI / 2 + u * 2 * Math.PI * 2 / 5,
      E = r + Math.cos(p) * 205,
      g = r + Math.sin(p) * 205;
    u === 0 ? o.moveTo(E, g) : o.lineTo(E, g);
  }
  o.stroke(), o.strokeStyle = "#00ff00", o.lineWidth = 4.5;
  let c = ut(5),
    s = 18;
  for (let u = 0; u < s; u++) {
    let p = u / s * Math.PI * 2;
    o.save(), o.translate(r + Math.cos(p) * 227, r + Math.sin(p) * 227), o.rotate(p + Math.PI / 2), o.beginPath();
    let E = 2 + Math.floor(c() * 3);
    for (let g = 0; g < E; g++) {
      let P = (c() - 0.5) * 12,
        Q = (c() - 0.5) * 12;
      o.moveTo(P, Q), o.lineTo(P + (c() - 0.5) * 16, Q + (c() - 0.5) * 16);
    }
    o.stroke(), o.restore();
  }
  o.lineWidth = 5, o.beginPath(), o.ellipse(r, r, 46, 22, 0, 0, Math.PI * 2), o.stroke(), o.beginPath(), o.arc(r, r, 11, 0, Math.PI * 2), o.stroke();
  let i = new N.CanvasTexture(e);
  return i.anisotropy = 4, i;
}
function ts() {
  let o = document.createElement("canvas");
  o.width = 128, o.height = 384;
  let r = o.getContext("2d");
  r.clearRect(0, 0, 128, 384), r.beginPath(), r.moveTo(0, 0), r.lineTo(128, 0), r.lineTo(128, 384), r.lineTo(128 / 2, 338), r.lineTo(0, 384), r.closePath();
  let c = r.createLinearGradient(0, 0, 0, 384);
  c.addColorStop(0, y.bannerDark), c.addColorStop(0.3, y.banner), c.addColorStop(1, y.bannerDark), r.fillStyle = c, r.fill(), r.strokeStyle = y.gold, r.lineWidth = 6, r.beginPath(), r.moveTo(9, 0), r.lineTo(9, 362), r.moveTo(119, 0), r.lineTo(119, 362), r.moveTo(0, 30), r.lineTo(128, 30), r.stroke(), r.fillStyle = y.gold, r.beginPath(), r.moveTo(128 / 2, 90), r.bezierCurveTo(128 / 2 + 34, 130, 128 / 2 + 30, 170, 128 / 2, 190), r.bezierCurveTo(128 / 2 - 30, 170, 128 / 2 - 34, 130, 128 / 2, 90), r.fill(), r.fillStyle = y.arcane, r.beginPath(), r.moveTo(128 / 2, 122), r.bezierCurveTo(128 / 2 + 16, 142, 128 / 2 + 14, 166, 128 / 2, 176), r.bezierCurveTo(128 / 2 - 14, 166, 128 / 2 - 16, 142, 128 / 2, 122), r.fill(), r.fillStyle = y.gold, r.fillRect(128 / 2 - 5, 196, 10, 110), r.fillRect(128 / 2 - 26, 206, 52, 9);
  let s = new N.CanvasTexture(o);
  return s.colorSpace = N.SRGBColorSpace, s.anisotropy = 4, s;
}
function Gr(n, e, o) {
  let r = [],
    c = [],
    s = ut(606),
    i = [],
    u = [new N.Vector2(0, 0), new N.Vector2(0.28, 0), new N.Vector2(0.34, 0.1), new N.Vector2(0.62, 0.28), new N.Vector2(0.78, 0.5), new N.Vector2(0.72, 0.52), new N.Vector2(0.56, 0.36), new N.Vector2(0, 0.3)],
    p = new N.LatheGeometry(u, 14),
    E = [],
    g = [],
    P = [];
  for (let [$, re] of Po.entries()) {
    let f = Math.sin(re) * Wn,
      W = Math.cos(re) * Wn,
      z = Je(be(new N.CylinderGeometry(0.5, 0.72, 1.3, 8).translate(0, 0.654, 0), y.stone), 0.06, $);
    g.push(Ve(z, new N.Vector3(f, $e, W))), E.push(Ve(be(p, y.iron), new N.Vector3(f, 1.3, W), null, 1.15));
    for (let ne = 0; ne < 5; ne++) {
      let ve = ne / 5 * Math.PI * 2 + s();
      E.push(Ve(be(new N.IcosahedronGeometry(0.16, 0), ne % 2 ? y.lava : y.lavaHot, 0.9), new N.Vector3(f + Math.cos(ve) * 0.3, 1.72, W + Math.sin(ve) * 0.3), new N.Euler(s() * 3, s() * 3, 0)));
    }
    let w = new N.PointLight(y.fire, 70, 24, 2);
    w.position.set(f, 3.1, W), P.push(w), c.push(w), i.push({
      x: f,
      y: 1.72,
      z: W,
      size: 1.9,
      light: w,
      glow: e.claim(),
      phase: s()
    });
  }
  let Q = Math.asin(tt.width / 2 / Oe) + 0.04;
  for (let $ of St) for (let re of [-1, 1]) {
    let f = $ + re * Q,
      W = qe.inner + 0.28,
      z = Math.sin(f) * W,
      w = Math.cos(f) * W;
    E.push(Ve(be(p, y.iron), new N.Vector3(z, 0.955, w), null, 0.42)), E.push(Ve(be(new N.IcosahedronGeometry(0.1, 0), y.lavaHot, 0.9), new N.Vector3(z, 1.1, w))), i.push({
      x: z,
      y: 1.08,
      z: w,
      size: 0.75,
      light: null,
      glow: e.claim(),
      phase: s()
    });
  }
  let I = new N.Mesh(Pe(E), n.metal);
  I.name = "ember-braziers", I.castShadow = !0, c.push(I);
  let G = new N.Mesh(Pe(g), n.stone);
  G.name = "ember-brazier-pedestals", G.castShadow = !0, G.receiveShadow = !0, r.push(G);
  let L = i.reduce(($, re) => $ + (re.light ? 3 : 1), 0),
    D = new N.PlaneGeometry(1, 1),
    x = new Float32Array(L);
  D.setAttribute("aPhase", new N.InstancedBufferAttribute(x, 1));
  let H = {
      uTime: {
        value: 0
      }
    },
    M = new N.InstancedMesh(D, new N.ShaderMaterial({
      uniforms: H,
      vertexShader: qa,
      fragmentShader: Za,
      blending: N.AdditiveBlending,
      depthWrite: !1,
      transparent: !0,
      fog: !1
    }), L);
  M.name = "ember-flames", M.frustumCulled = !1, M.renderOrder = 7;
  {
    let $ = new N.Matrix4(),
      re = 0;
    for (let f of i) {
      let W = f.light ? 3 : 1;
      for (let z = 0; z < W; z++) {
        let w = f.size * (z === 0 ? 0.75 : 0.5),
          ne = f.size * (z === 0 ? 1.25 : 0.85),
          ve = W > 1 ? (z - 1) * f.size * 0.18 : 0;
        $.makeScale(w, ne, w).setPosition(f.x + ve, f.y - 0.05, f.z + (z === 1 ? 0.12 : -0.08)), M.setMatrixAt(re, $), x[re] = s(), re++;
      }
    }
  }
  c.push(M);
  let O = [0, 1, 6, 9, 13, 17, 21],
    se = new N.PlaneGeometry(1.15, 4.2, 1, 12).translate(0, -2.1, 0),
    he = new N.MeshToonMaterial({
      map: ts(),
      gradientMap: n.gradient,
      side: N.DoubleSide,
      alphaTest: 0.5
    }),
    Y = {
      uTime: {
        value: 0
      }
    };
  he.onBeforeCompile = $ => {
    $.uniforms.uTime = Y.uTime, $.vertexShader = $.vertexShader.replace("#include <common>", `#include <common>
uniform float uTime;`).replace("#include <begin_vertex>", `#include <begin_vertex>
        float hang = clamp(-position.y / 4.2, 0.0, 1.0);
        float ph = float(gl_InstanceID) * 1.7;
        transformed.z += (sin(uTime * 1.3 + ph + position.y * 1.1) * 0.22 + sin(uTime * 2.9 + ph * 2.0) * 0.06) * hang * hang;
        transformed.x += sin(uTime * 0.9 + ph) * 0.05 * hang;`);
  }, he.customProgramCacheKey = () => "ember-banner";
  let ge = new N.InstancedMesh(se, he, O.length);
  ge.name = "ember-banners", ge.castShadow = !0;
  {
    let $ = new N.Matrix4(),
      re = new N.Quaternion(),
      f = new N.Vector3(1, 1, 1),
      W = new N.Vector3(0, 1, 0);
    O.forEach((z, w) => {
      let ne = z / rt.piers * Math.PI * 2,
        ve = rt.radius - 0.6;
      re.setFromAxisAngle(W, ne + Math.PI), $.compose(new N.Vector3(Math.sin(ne) * ve, rt.base + rt.height - 0.35, Math.cos(ne) * ve), re, f), ge.setMatrixAt(w, $);
    });
  }
  ge.computeBoundingSphere(), c.push(ge);
  let fe = be(new N.OctahedronGeometry(1, 0).scale(0.55, 1.5, 0.55), y.arcane, 0.55),
    R = new N.MeshToonMaterial({
      vertexColors: !0,
      gradientMap: n.gradient,
      emissive: new N.Color(y.accent),
      emissiveIntensity: 0.35
    }),
    ie = [];
  for (let $ = 0; $ < 11; $++) {
    let re = $ / 11 * Math.PI * 2 + s() * 0.3,
      f = nt.inner + 1 + s() * 4;
    ie.push({
      base: new N.Vector3(Math.sin(re) * f, nt.top + 7 + s() * 6, Math.cos(re) * f),
      size: 0.8 + s() * 0.8,
      phase: s() * 6,
      glow: e.claim(),
      spin: 0.2 + s() * 0.4
    });
  }
  let X = new N.Vector3(0, nn.y, 0);
  ie.push({
    base: X.clone(),
    size: nn.size * 1.6,
    phase: 0,
    glow: e.claim(),
    spin: 0.35
  });
  let ce = new N.InstancedMesh(fe, R, ie.length);
  ce.name = "ember-crystals", ce.instanceMatrix.setUsage(N.DynamicDrawUsage), ce.frustumCulled = !1, c.push(ce);
  let l = new N.PointLight(y.accent, 55, 26, 1.6);
  l.position.set(0, nn.y - 1, 0), c.push(l);
  let T = 7,
    C = new N.InstancedMesh(fe, R, T);
  C.name = "ember-focus-shards", C.instanceMatrix.setUsage(N.DynamicDrawUsage), C.frustumCulled = !1, c.push(C);
  let V = tn.map($ => new N.Vector3(Math.sin($) * Ct, me, Math.cos($) * Ct));
  V.push(new N.Vector3(0, me, 0));
  let _ = new N.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
    b = new Float32Array(V.length * 2),
    J = new N.InstancedBufferAttribute(b, 2);
  J.setUsage(N.DynamicDrawUsage), _.setAttribute("aRune", J);
  let K = {
      uMap: {
        value: es()
      },
      uColor: {
        value: Ee(y.accent, 1.6)
      },
      uHot: {
        value: Ee(y.arcaneHot, 3)
      },
      uTime: {
        value: 0
      }
    },
    Z = new N.InstancedMesh(_, new N.ShaderMaterial({
      uniforms: K,
      vertexShader: Qa,
      fragmentShader: Ja,
      blending: N.AdditiveBlending,
      depthWrite: !1,
      transparent: !0,
      fog: !1
    }), V.length);
  Z.name = "ember-runes", Z.renderOrder = 2, Z.frustumCulled = !1;
  {
    let $ = new N.Matrix4();
    V.forEach((re, f) => {
      let W = (f === V.length - 1 ? On : Nn) * 2;
      $.makeScale(W, 1, W).setPosition(re.x, me + 0.02, re.z), Z.setMatrixAt(f, $);
    });
  }
  c.push(Z);
  let ee = new Float32Array(V.length),
    we = new Float32Array(V.length),
    Me = V.map(() => e.claim()),
    je = 0,
    Ge = 0,
    De = 0,
    Ye = new N.Color(),
    Qe = new N.Color(),
    _e = Ee(y.fire, 1),
    Ce = Ee(y.lavaHot, 2.2),
    Ze = Ee(y.ember, 2.2),
    d = Ee(y.lava, 2),
    B = Ee(y.accent, 1),
    a = new N.Matrix4(),
    S = new N.Quaternion(),
    t = new N.Euler(),
    j = new N.Vector3(),
    k = new N.Vector3(),
    ae = 0;
  return {
    statics: r,
    decor: c,
    focus: X,
    runes: {
      sites: V,
      charge($, re) {
        $ >= 0 && $ < V.length && (we[$] = re);
      },
      setAwake($) {
        Ge = $;
      }
    },
    pulseFocus($) {
      De = Math.max(De, $);
    },
    update($, re, f) {
      H.uTime.value = re, Y.uTime.value = re, K.uTime.value = re, n.pit.emissiveIntensity = 1.35 + Math.sin(re * 0.9) * 0.3 + Math.sin(re * 2.3) * 0.1, n.rockGlow.uGlowGain.value = 2.2 + Math.sin(re * 0.7) * 0.5, ae += $;
      let W = f && ae > 0.05;
      W && (ae = 0);
      for (let z of i) {
        let w = 0.82 + Math.sin(re * 11 + z.phase * 20) * 0.08 + Math.sin(re * 23 + z.phase * 7) * 0.06;
        z.light && (z.light.intensity = 70 * w), e.set(z.glow, z.x, z.y + z.size * 0.45, z.z, z.size * 2.6, _e, 0.55 * w), W && s() < (z.light ? 0.9 : 0.25) && o.emit(z.x + (s() - 0.5) * z.size * 0.4, z.y + z.size * 0.3, z.z + (s() - 0.5) * z.size * 0.4, (s() - 0.5) * 0.6, 1.2 + s() * 1.6, (s() - 0.5) * 0.6, 1.4 + s() * 1.4, 0.07 + s() * 0.05, s() < 0.5 ? Ce : Ze, -0.4, 0.4, 0.3);
      }
      if (W && s() < 0.5) {
        let z = s() * Math.PI * 2,
          w = Math.sqrt(s()) * (Oe - 1);
        o.emit(Math.sin(z) * w, me + 0.05, Math.cos(z) * w, 0, 0.6 + s() * 0.8, 0, 1.6, 0.06, d, -0.2, 0.2, 0.2);
      }
      De = Math.max(0, De - $ * 0.8);
      for (let z = 0; z < ie.length; z++) {
        let w = ie[z],
          ne = z === ie.length - 1,
          ve = Math.sin(re * 0.8 + w.phase) * (ne ? 0.35 : 0.6);
        k.set(w.base.x, w.base.y + ve, w.base.z), t.set(Math.sin(re * 0.3 + w.phase) * 0.15, re * w.spin + w.phase, 0), S.setFromEuler(t);
        let Xe = ne ? 1 + De * 0.25 + je * 0.05 * Math.sin(re * 6) : 1;
        j.setScalar(w.size * Xe), a.compose(k, S, j), ce.setMatrixAt(z, a);
        let Ae = ne ? 0.6 + je * 0.5 + De * 1.5 : 0.22;
        e.set(w.glow, k.x, k.y, k.z, w.size * (ne ? 6 : 3), B, Ae);
      }
      ce.instanceMatrix.needsUpdate = !0, l.intensity = 45 + je * 25 + De * 90;
      for (let z = 0; z < T; z++) {
        let w = re * 0.6 + z / T * Math.PI * 2,
          ne = 2.2 + Math.sin(re * 0.9 + z) * 0.3;
        k.set(Math.cos(w) * ne, nn.y + Math.sin(re * 1.3 + z * 2) * 0.6, Math.sin(w) * ne), t.set(w, w * 2, 0), S.setFromEuler(t), j.setScalar(0.28 + z % 3 * 0.06), a.compose(k, S, j), C.setMatrixAt(z, a);
      }
      C.instanceMatrix.needsUpdate = !0, je += (Ge - je) * Math.min(1, $ * 2);
      for (let z = 0; z < V.length; z++) {
        let w = Math.max(we[z], 0.28 + je * 0.35),
          ne = w > ee[z] ? 7 : 2.5;
        ee[z] = ee[z] + (w - ee[z]) * Math.min(1, $ * ne), b[z * 2] = ee[z], b[z * 2 + 1] = re * (z === V.length - 1 ? -0.08 : 0.15) + z;
        let ve = V[z],
          Xe = ee[z],
          Ae = z === V.length - 1 ? On : Nn;
        Qe.copy(B).lerp(Ye.setRGB(1, 1, 1), Math.max(0, Math.min(1, Xe - 1))), e.set(Me[z], ve.x, me + 0.4, ve.z, Ae * 3.2, Qe, Math.max(0, Xe - 0.3) * 0.45);
      }
      J.needsUpdate = !0;
    }
  };
}
import * as Fe from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
function ns() {
  let n = new Uint8Array([88, 88, 88, 255, 170, 170, 170, 255, 255, 255, 255, 255]),
    e = new Fe.DataTexture(n, 3, 1, Fe.RGBAFormat);
  return e.minFilter = Fe.NearestFilter, e.magFilter = Fe.NearestFilter, e.generateMipmaps = !1, e.needsUpdate = !0, e;
}
function Hn(n, e, o = 2.2) {
  let r = {
    uGlowGain: {
      value: o
    }
  };
  return n.onBeforeCompile = c => {
    c.uniforms.uGlowGain = r.uGlowGain, c.vertexShader = c.vertexShader.replace("#include <common>", `#include <common>
attribute float glow;
varying float vGlow;`).replace("#include <begin_vertex>", `#include <begin_vertex>
vGlow = glow;`), c.fragmentShader = c.fragmentShader.replace("#include <common>", `#include <common>
varying float vGlow;
uniform float uGlowGain;`).replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
totalEmissiveRadiance += vColor.rgb * vGlow * uGlowGain;`);
  }, n.customProgramCacheKey = () => `ember-glow-${e}`, r;
}
function Sn(n) {
  let e = document.createElement("canvas");
  e.width = n, e.height = n;
  let o = e.getContext("2d");
  return [e, o];
}
function kn(n, e, o = !0) {
  let r = new Fe.CanvasTexture(n);
  return o && (r.colorSpace = Fe.SRGBColorSpace), e && (r.wrapS = Fe.RepeatWrapping, r.wrapT = Fe.RepeatWrapping), r.anisotropy = 4, r;
}
function os() {
  let [n, e] = Sn(256),
    o = io(7);
  e.fillStyle = "#b8b0b8", e.fillRect(0, 0, 256, 256);
  let r = 4,
    c = 256 / r;
  for (let s = 0; s < r; s++) {
    let i = s % 2 === 0 ? [96, 80, 80] : [48, 96, 64, 48],
      u = 0;
    for (let p of i) {
      let E = 225 + Math.floor(o() * 30);
      e.fillStyle = `rgb(${E},${E - 4},${E})`, e.fillRect(u + 3, s * c + 3, p - 6, c - 6), e.fillStyle = `rgba(150,140,150,${0.25 + o() * 0.2})`, o() < 0.5 && e.fillRect(u + 3, s * c + 3, 6 + o() * 8, 4), o() < 0.4 && e.fillRect(u + p - 12, s * c + c - 8, 8, 5), u += p;
    }
  }
  return kn(n, !0);
}
function rs() {
  let [n, e] = Sn(512),
    o = io(11);
  e.fillStyle = "#c4b8bc", e.fillRect(0, 0, 512, 512);
  let r = 4,
    c = 512 / r;
  for (let s = 0; s < r; s++) {
    let i = -Math.floor(o() * 60);
    for (; i < 512;) {
      let u = 90 + Math.floor(o() * 120),
        p = 222 + Math.floor(o() * 26);
      e.fillStyle = `rgb(${p},${p - 6},${p - 8})`;
      let E = Math.max(0, i + 2);
      if (e.fillRect(E, s * c + 2, Math.min(512, i + u - 2) - E, c - 4), o() < 0.3) {
        e.strokeStyle = "rgba(120,100,110,0.45)", e.lineWidth = 1.5, e.beginPath();
        let g = i + u * o();
        e.moveTo(g, s * c + 4), e.lineTo(g + (o() - 0.5) * 30, s * c + c * 0.5), e.lineTo(g + (o() - 0.5) * 40, s * c + c - 4), e.stroke();
      }
      i += u;
    }
  }
  return kn(n, !0);
}
function as() {
  let [e, o] = Sn(1024),
    [r, c] = Sn(1024),
    s = io(23),
    i = 1024 / 2;
  o.fillStyle = "#6a5c70", o.fillRect(0, 0, 1024, 1024), c.fillStyle = "#000000", c.fillRect(0, 0, 1024, 1024);
  let u = [0, 70, 150, 235, 320, 405, 480, 520];
  for (let g = 0; g + 1 < u.length; g++) {
    let P = u[g],
      Q = u[g + 1],
      I = Math.max(1, Math.round(Math.PI * (P + Q) / 150)),
      G = s() * Math.PI * 2;
    for (let L = 0; L < I; L++) {
      let D = G + L / I * Math.PI * 2,
        x = G + (L + 1) / I * Math.PI * 2,
        H = 150 + Math.floor(s() * 40);
      o.fillStyle = `rgb(${H - 8},${H - 14},${H})`, o.beginPath(), o.arc(i, i, Math.max(0, Q - 4), D + 0.012, x - 0.012), P > 0 ? o.arc(i, i, P + 4, x - 0.012, D + 0.012, !0) : o.lineTo(i, i), o.closePath(), o.fill();
    }
  }
  let p = (g, P, Q, I, G) => {
    let L = g,
      D = P,
      x = Q;
    for (let H = 0; H < I; H++) {
      x += (s() - 0.5) * 0.9;
      let M = L + Math.cos(x) * 9,
        O = D + Math.sin(x) * 9,
        se = G * (1 - H / I) + 0.6;
      o.strokeStyle = "#1c1420", o.lineWidth = se + 2.5, o.lineCap = "round", o.beginPath(), o.moveTo(L, D), o.lineTo(M, O), o.stroke(), c.strokeStyle = H % 3 === 0 ? "#ffd27a" : "#ff7a2a", c.lineWidth = se, c.lineCap = "round", c.beginPath(), c.moveTo(L, D), c.lineTo(M, O), c.stroke(), s() < 0.07 && I - H > 6 && p(M, O, x + (s() - 0.5) * 2.2, (I - H) * 0.6, se * 0.7), L = M, D = O;
    }
  };
  for (let g = 0; g < 16; g++) {
    let P = s() * Math.PI * 2,
      Q = 60 + s() * 380;
    p(i + Math.cos(P) * Q, i + Math.sin(P) * Q, s() * Math.PI * 2, 14 + s() * 22, 3.2);
  }
  c.globalCompositeOperation = "lighter", c.filter = "blur(6px)", c.globalAlpha = 0.5, c.drawImage(r, 0, 0), c.filter = "none", c.globalAlpha = 1, c.globalCompositeOperation = "source-over";
  let E = o.createRadialGradient(i, i, 440, i, i, 512);
  return E.addColorStop(0, "rgba(20,14,26,0)"), E.addColorStop(1, "rgba(20,14,26,0.6)"), o.fillStyle = E, o.fillRect(0, 0, 1024, 1024), {
    map: kn(e, !1),
    emissive: kn(r, !1)
  };
}
function io(n) {
  let e = n >>> 0;
  return () => (e = e * 1664525 + 1013904223 >>> 0, e / 4294967296);
}
function Cr() {
  let n = ns(),
    e = new Fe.MeshToonMaterial({
      vertexColors: !0,
      gradientMap: n
    }),
    o = Hn(e, "stone"),
    r = new Fe.MeshToonMaterial({
      vertexColors: !0,
      gradientMap: n,
      map: os()
    }),
    c = Hn(r, "blocks"),
    s = new Fe.MeshToonMaterial({
      color: y.sand,
      gradientMap: n,
      map: rs()
    }),
    i = as(),
    u = new Fe.MeshToonMaterial({
      color: "#6e5c78",
      gradientMap: n,
      map: i.map,
      emissive: new Fe.Color(y.lava),
      emissiveMap: i.emissive,
      emissiveIntensity: 1.6
    }),
    p = new Fe.MeshToonMaterial({
      vertexColors: !0,
      gradientMap: n
    }),
    E = Hn(p, "metal", 3),
    g = new Fe.MeshToonMaterial({
      vertexColors: !0,
      gradientMap: n
    }),
    P = Hn(g, "rock", 2.6);
  return {
    gradient: n,
    stone: e,
    stoneGlow: o,
    blocks: r,
    blocksGlow: c,
    flags: s,
    pit: u,
    metal: p,
    metalGlow: E,
    rock: g,
    rockGlow: P
  };
}
import * as Re from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var Dr = {
    radius: 0.32,
    centre: 0.55
  },
  Vr = {
    lift: 0.16,
    tolerance: 0.05
  };
function ss(n) {
  let e = Vr.lift + n - Dr.centre;
  return Math.sqrt((n * (1 + Vr.tolerance)) ** 2 - e ** 2);
}
function is(n) {
  let e = n + 0.42 + 0.05 - 0.4;
  return Math.min(e, ss(n) + Dr.radius - 0.06);
}
function _r(n, e) {
  let o = 0.1 + n,
    r = n + 0.12,
    c = n + 0.62,
    s = n + 0.42,
    i = [];
  i.push(Ve(Je(be(new Re.BoxGeometry(c * 2 + 0.9, 0.16, 1.5), y.stone), 0.05, 1), new Re.Vector3(0, 0.084, 0)));
  for (let D of [-1, 1]) {
    let x = D * (s + 0.05);
    i.push(Ve(Je(be(new Re.BoxGeometry(0.62, o, 0.7), y.sandLight), 0.05, D + 3), new Re.Vector3(x, 0.16 + o / 2, 0))), i.push(Ve(be(new Re.BoxGeometry(0.82, 0.24, 0.9), y.sand), new Re.Vector3(x, 0.28, 0))), i.push(Ve(be(new Re.BoxGeometry(0.8, 0.2, 0.88), y.sand), new Re.Vector3(x, 0.16 + o - 0.02, 0)));
    for (let H = 0; H < 3; H++) i.push(Ve(be(new Re.BoxGeometry(0.16, 0.26, 0.04), y.arcane, 1), new Re.Vector3(x, 0.62 + H * 0.42, 0.36)));
  }
  let u = 9;
  for (let D = 0; D < u; D++) {
    let x = D / u * Math.PI,
      H = (D + 1) / u * Math.PI,
      M = new Re.Shape(),
      O = 0.018;
    M.moveTo(Math.cos(x + O) * r, Math.sin(x + O) * r), M.lineTo(Math.cos(x + O) * c, Math.sin(x + O) * c), M.absarc(0, 0, c, x + O, H - O, !1), M.lineTo(Math.cos(H - O) * r, Math.sin(H - O) * r), M.absarc(0, 0, r, H - O, x + O, !0);
    let se = D === Math.floor(u / 2),
      he = new Re.ExtrudeGeometry(M, {
        depth: se ? 0.86 : 0.7,
        bevelEnabled: !0,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 1,
        curveSegments: 3
      });
    he.translate(0, 0, se ? -0.43 : -0.35), i.push(Ve(Je(be(he, se ? y.sandLight : y.sand), 0.05, D + 10), new Re.Vector3(0, o, 0)));
  }
  let p = new Re.TorusGeometry((r + c) / 2, 0.035, 4, 40, Math.PI);
  i.push(Ve(be(p, y.arcane, 1), new Re.Vector3(0, o, 0.37)));
  let E = new Re.Group();
  E.name = "ember-gate";
  let g = new Re.Mesh(Pe(i), e.stone);
  g.castShadow = !0, g.receiveShadow = !0, E.add(g);
  let P = new Re.Mesh(be(new Re.OctahedronGeometry(0.26, 0).scale(1, 1.6, 1), y.arcane, 0.8), e.stone);
  P.position.set(0, o + c + 0.55, 0), E.add(P);
  let Q = new Re.Group(),
    I = new Re.MeshBasicMaterial(),
    G = is(n),
    L = s + 0.05 + 0.4;
  for (let D of [-1, 1]) {
    let x = new Re.Mesh(new Re.BoxGeometry(L - G, o + c - 0.2, 0.88), I);
    x.position.set(D * (G + L) / 2, (o + c - 0.2) / 2, 0), x.visible = !1, Q.add(x);
  }
  return {
    frame: E,
    solids: Q,
    labelHeight: o + c + 1.25
  };
}
import * as Se from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var zn = new Se.Vector3(Math.sin(Yt.bearing) * Math.cos(Yt.elevation), Math.sin(Yt.elevation), Math.cos(Yt.bearing) * Math.cos(Yt.elevation)).normalize(),
  ls = `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}
`,
  cs = `
uniform vec3 uZenith;
uniform vec3 uUpper;
uniform vec3 uMid;
uniform vec3 uHorizon;
uniform vec3 uHaze;
uniform vec3 uSun;
uniform vec3 uSunColor;
uniform float uTime;
varying vec3 vDir;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col;
  if (h < 0.0) {
    col = mix(uHorizon, uHaze, smoothstep(0.0, -0.18, h));
  } else {
    col = mix(uHorizon, uMid, smoothstep(0.0, 0.14, h));
    col = mix(col, uUpper, smoothstep(0.1, 0.42, h));
    col = mix(col, uZenith, smoothstep(0.38, 0.95, h));
  }
  // The horizon band is hotter towards the sun.
  float toward = max(dot(normalize(vec3(d.x, 0.0, d.z)), normalize(vec3(uSun.x, 0.0, uSun.z))), 0.0);
  col += uSunColor * pow(toward, 3.0) * exp(-abs(h) * 9.0) * 0.55;
  // The sun: a soft disc and its glow.
  float s = max(dot(d, uSun), 0.0);
  col += uSunColor * (pow(s, 900.0) * 6.0 + pow(s, 60.0) * 0.8 + pow(s, 8.0) * 0.25);
  // Thin strata near the horizon, lit on the sun side.
  float band = sin(h * 90.0 + sin(d.x * 7.0 + uTime * 0.02) * 1.6 + d.z * 5.0);
  float strata = smoothstep(0.55, 1.0, band) * smoothstep(0.02, 0.06, h) * smoothstep(0.2, 0.08, h);
  col = mix(col, mix(uMid * 0.7, uSunColor, pow(toward, 2.0)), strata * 0.35);
  // Stars overhead, twinkling.
  vec3 cell = floor(d * 180.0);
  float star = hash(cell);
  float lit = step(0.9965, star) * smoothstep(0.22, 0.6, h);
  float twinkle = 0.6 + 0.4 * sin(uTime * (1.5 + star * 4.0) + star * 50.0);
  col += vec3(0.85, 0.85, 1.0) * lit * twinkle * 0.9;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,
  us = `
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,
  ms = `
uniform vec3 uLit;
uniform vec3 uMid;
uniform vec3 uShadow;
uniform vec3 uHaze;
uniform vec3 uSun;
uniform float uTime;
varying vec3 vWorld;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = vWorld.xz * 0.012 + vec2(uTime * 0.004, uTime * 0.0015);
  float n = fbm(p);
  float detail = fbm(p * 3.1 + 4.0);
  float density = smoothstep(0.35, 0.75, n * 0.8 + detail * 0.3);
  // Tops facing the sun catch the light.
  vec2 sunXZ = normalize(uSun.xz);
  float lean = fbm(p + sunXZ * 0.08) - n;
  float lit = clamp(0.55 - lean * 6.0, 0.0, 1.0);
  vec3 col = mix(uShadow, uMid, density);
  col = mix(col, uLit, lit * density * 0.8);
  float dist = length(vWorld.xz);
  float toward = max(dot(normalize(vWorld.xz), sunXZ), 0.0);
  col += uLit * pow(toward, 4.0) * 0.25 * density;
  float fade = smoothstep(120.0, 720.0, dist);
  col = mix(col, uHaze, fade);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
function Br() {
  let n = {
      uZenith: {
        value: new Se.Color(y.zenith)
      },
      uUpper: {
        value: new Se.Color(y.upper)
      },
      uMid: {
        value: new Se.Color(y.mid)
      },
      uHorizon: {
        value: new Se.Color(y.horizon)
      },
      uHaze: {
        value: new Se.Color(y.haze)
      },
      uSun: {
        value: zn.clone()
      },
      uSunColor: {
        value: new Se.Color(y.sunGlow)
      },
      uTime: {
        value: 0
      }
    },
    e = new Se.Mesh(new Se.SphereGeometry(420, 48, 24), new Se.ShaderMaterial({
      uniforms: n,
      vertexShader: ls,
      fragmentShader: cs,
      side: Se.BackSide,
      depthWrite: !1,
      fog: !1
    }));
  e.name = "ember-sky", e.renderOrder = -10, e.frustumCulled = !1;
  let o = {
      uLit: {
        value: new Se.Color(y.cloudLit)
      },
      uMid: {
        value: new Se.Color(y.cloudMid)
      },
      uShadow: {
        value: new Se.Color(y.cloudShadow)
      },
      uHaze: {
        value: new Se.Color(y.haze)
      },
      uSun: {
        value: zn.clone()
      },
      uTime: {
        value: 0
      }
    },
    r = new Se.Mesh(new Se.PlaneGeometry(1500, 1500, 1, 1).rotateX(-Math.PI / 2), new Se.ShaderMaterial({
      uniforms: o,
      vertexShader: us,
      fragmentShader: ms,
      fog: !1
    }));
  r.position.y = -38, r.name = "ember-clouds";
  let c = ut(91),
    s = new Se.MeshLambertMaterial({
      color: y.rock
    }),
    i = new Se.Group();
  i.name = "ember-far-rocks";
  for (let u = 0; u < 9; u++) {
    let p = u / 9 * Math.PI * 2 + c() * 0.4,
      E = 230 + c() * 130,
      g = 8 + c() * 16,
      P = new Se.Mesh(wt(g, 1, 300 + u, 0.5), s);
    P.position.set(Math.sin(p) * E, -30 + c() * 26, Math.cos(p) * E), P.rotation.set(Math.PI, c() * 6, 0), i.add(P);
  }
  return {
    objects: [e, r, i],
    update(u) {
      n.uTime.value = u, o.uTime.value = u, i.position.y = Math.sin(u * 0.12) * 1.2;
    }
  };
}
import * as Ie from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var ds = `
attribute vec4 aColor;
varying vec4 vColor;
varying vec2 vUv;
void main() {
  vUv = uv - 0.5;
  vColor = aColor;
  vec4 mv = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float sx = length(instanceMatrix[0].xyz);
  float sy = length(instanceMatrix[1].xyz);
  mv.xy += position.xy * vec2(sx, sy);
  gl_Position = projectionMatrix * mv;
}
`,
  fs = `
varying vec4 vColor;
varying vec2 vUv;
void main() {
  float r = length(vUv) * 2.0;
  float a = exp(-r * r * 4.5) * (1.0 - smoothstep(0.8, 1.0, r));
  float core = exp(-r * r * 38.0);
  gl_FragColor = vec4(vColor.rgb * (a + core * 0.9) * vColor.a, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
function Fr(n, e) {
  let o = new Ie.PlaneGeometry(1, 1),
    r = new Float32Array(n * 4),
    c = new Ie.InstancedBufferAttribute(r, 4);
  c.setUsage(Ie.DynamicDrawUsage), o.setAttribute("aColor", c);
  let s = new Ie.ShaderMaterial({
      vertexShader: ds,
      fragmentShader: fs,
      blending: Ie.AdditiveBlending,
      depthWrite: !1,
      transparent: !0,
      fog: !1
    }),
    i = new Ie.InstancedMesh(o, s, n);
  i.name = "ember-glows", i.instanceMatrix.setUsage(Ie.DynamicDrawUsage), i.frustumCulled = !1, i.renderOrder = 5;
  let u = i.instanceMatrix.array;
  u.fill(0);
  let p = 0,
    E = [],
    g = n - e;
  for (let I = 0; I < e; I++) E.push({
    index: g + I,
    age: 1,
    life: 0,
    size: 0,
    grow: 1,
    x: 0,
    y: 0,
    z: 0,
    r: 0,
    g: 0,
    b: 0
  });
  let P = 0,
    Q = (I, G, L, D, x, H, M, O, se, he) => {
      let Y = I * 16;
      u[Y] = x, u[Y + 1] = 0, u[Y + 2] = 0, u[Y + 3] = 0, u[Y + 4] = 0, u[Y + 5] = H, u[Y + 6] = 0, u[Y + 7] = 0, u[Y + 8] = 0, u[Y + 9] = 0, u[Y + 10] = x, u[Y + 11] = 0, u[Y + 12] = G, u[Y + 13] = L, u[Y + 14] = D, u[Y + 15] = 1;
      let ge = I * 4;
      r[ge] = M, r[ge + 1] = O, r[ge + 2] = se, r[ge + 3] = he;
    };
  return {
    mesh: i,
    claim() {
      if (p >= g) throw new Error("ember-colosseum: out of glow sprites");
      return p++;
    },
    set(I, G, L, D, x, H, M) {
      let O = M > 0 ? x : 0;
      Q(I, G, L, D, O, O, H.r, H.g, H.b, M);
    },
    setStretched(I, G, L, D, x, H, M, O) {
      let se = O > 0 ? 1 : 0;
      Q(I, G, L, D, x * se, H * se, M.r, M.g, M.b, O);
    },
    flash(I, G, L, D, x = 1.6, H = 1) {
      let M = E[P];
      P = (P + 1) % E.length, M.age = 0, M.life = Math.max(0.02, D), M.size = G, M.grow = x, M.x = I.x, M.y = I.y, M.z = I.z, M.r = L.r * H, M.g = L.g * H, M.b = L.b * H;
    },
    update(I) {
      for (let G of E) {
        if (G.age >= G.life) {
          G.life > 0 && (Q(G.index, 0, -999, 0, 0, 0, 0, 0, 0, 0), G.life = 0);
          continue;
        }
        G.age += I;
        let L = Math.min(1, G.age / G.life),
          D = G.size * (1 + (G.grow - 1) * (1 - (1 - L) * (1 - L))),
          x = (1 - L) * (1 - L);
        Q(G.index, G.x, G.y, G.z, D, D, G.r, G.g, G.b, x);
      }
      i.instanceMatrix.needsUpdate = !0, c.needsUpdate = !0;
    },
    clearFlashes() {
      for (let I of E) I.age = I.life;
    }
  };
}
var hs = `
attribute vec4 aColor;
attribute float aSize;
uniform float uScale;
varying vec4 vColor;
void main() {
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uScale / max(0.1, -mv.z);
  gl_Position = projectionMatrix * mv;
}
`,
  ps = `
varying vec4 vColor;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float r = length(p) * 2.0;
  float a = smoothstep(1.0, 0.0, r);
  a *= a;
  gl_FragColor = vec4(vColor.rgb * a * vColor.a, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,
  Es = `
varying vec4 vColor;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float r = length(p) * 2.0;
  float a = smoothstep(1.0, 0.55, r) * vColor.a;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor.rgb, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
function lo(n, e, o) {
  let r = new Float32Array(n * 3),
    c = new Float32Array(n * 4),
    s = new Float32Array(n),
    i = new Float32Array(n * 3),
    u = new Float32Array(n),
    p = new Float32Array(n),
    E = new Float32Array(n),
    g = new Float32Array(n),
    P = new Float32Array(n),
    Q = new Float32Array(n),
    I = new Float32Array(n);
  for (let Y = 0; Y < n; Y++) r[Y * 3 + 1] = -999;
  let G = new Ie.BufferGeometry(),
    L = new Ie.BufferAttribute(r, 3).setUsage(Ie.DynamicDrawUsage),
    D = new Ie.BufferAttribute(c, 4).setUsage(Ie.DynamicDrawUsage),
    x = new Ie.BufferAttribute(s, 1).setUsage(Ie.DynamicDrawUsage);
  G.setAttribute("position", L), G.setAttribute("aColor", D), G.setAttribute("aSize", x);
  let H = {
      uScale: {
        value: 600
      }
    },
    M = new Ie.ShaderMaterial({
      uniforms: H,
      vertexShader: hs,
      fragmentShader: e ? ps : Es,
      blending: e ? Ie.AdditiveBlending : Ie.NormalBlending,
      depthWrite: !1,
      transparent: !0,
      fog: !1
    }),
    O = new Ie.Points(G, M);
  O.name = o, O.frustumCulled = !1, O.renderOrder = e ? 6 : 4;
  let se = 0,
    he = 0;
  return {
    points: O,
    emit(Y, ge, fe, R, ie, X, ce, l, T, C = 0, V = 0, _ = 1) {
      let b = se;
      se = (se + 1) % n, r[b * 3] = Y, r[b * 3 + 1] = ge, r[b * 3 + 2] = fe, i[b * 3] = R, i[b * 3 + 1] = ie, i[b * 3 + 2] = X, u[b] = Math.max(0.02, ce), p[b] = 0, E[b] = l, g[b] = _, P[b] = C, Q[b] = V, c[b * 4] = T.r, c[b * 4 + 1] = T.g, c[b * 4 + 2] = T.b, I[b] = 1, he = n;
    },
    update(Y, ge) {
      if (H.uScale.value = ge, he === 0) return;
      let fe = !1;
      for (let R = 0; R < n; R++) {
        if (p[R] >= u[R]) {
          s[R] !== 0 && (s[R] = 0, c[R * 4 + 3] = 0);
          continue;
        }
        fe = !0, p[R] += Y;
        let ie = Math.min(1, p[R] / u[R]),
          X = Math.max(0, 1 - Q[R] * Y);
        i[R * 3] *= X, i[R * 3 + 1] = i[R * 3 + 1] * X - P[R] * Y, i[R * 3 + 2] *= X, r[R * 3] += i[R * 3] * Y, r[R * 3 + 1] += i[R * 3 + 1] * Y, r[R * 3 + 2] += i[R * 3 + 2] * Y, s[R] = E[R] * (1 + (g[R] - 1) * ie), c[R * 4 + 3] = I[R] * (ie < 0.15 ? 1 : 1 - (ie - 0.15) / 0.85);
      }
      L.needsUpdate = !0, D.needsUpdate = !0, x.needsUpdate = !0, fe || (he = 0);
    },
    clear() {
      for (let Y = 0; Y < n; Y++) p[Y] = u[Y], s[Y] = 0, c[Y * 4 + 3] = 0;
      x.needsUpdate = !0, D.needsUpdate = !0, he = 0;
    }
  };
}
var Lr = 6.6,
  Ke = Ao({
    name: "Ember Colosseum",
    accent: y.accent,
    avatar: {
      style: "toon",
      color: "#b6ff00"
    },
    physics: {
      gravity: 30,
      jumpSpeed: 10,
      runSpeed: 7,
      doubleJump: !1,
      airControl: 0.6
    },
    camera: {
      distance: Lr,
      height: 1.35,
      pitch: 0.22,
      fov: 58,
      zoom: [3.5, 13]
    },
    render: {
      background: null,
      fog: new pt.Fog(y.haze, 70, 330),
      exposure: 1.05,
      shadows: !0,
      maxPixelRatio: 2
    },
    spawn: vn,
    killY: Go,
    controls: [{
      keys: ["Left click"],
      label: "Target",
      pad: null
    }, {
      keys: ["Right click"],
      label: "Target & attack",
      pad: ["rt"]
    }, {
      keys: ["1", "2", "3", "4", "5"],
      label: "Abilities",
      pad: null
    }]
  }),
  bs = new pt.HemisphereLight("#b49ce6", "#7a4a52", 1.35);
Ke.addDecor(bs);
var lt = new pt.DirectionalLight("#ffb27a", 2.4);
lt.position.copy(zn).multiplyScalar(60);
lt.target.position.set(0, 0, 0);
lt.castShadow = !0;
lt.shadow.mapSize.set(2048, 2048);
lt.shadow.camera.left = -40;
lt.shadow.camera.right = 40;
lt.shadow.camera.top = 40;
lt.shadow.camera.bottom = -40;
lt.shadow.camera.near = 10;
lt.shadow.camera.far = 130;
lt.shadow.bias = -6e-4;
lt.shadow.normalBias = 0.04;
Ke.addDecor(lt);
Ke.addDecor(lt.target);
var In = Cr(),
  Ur = Br();
for (let n of Ur.objects) Ke.addDecor(n);
var uo = Fr(220, 72),
  ln = lo(900, !0, "ember-sparks"),
  An = lo(260, !1, "ember-dust");
Ke.addDecor(uo.mesh);
Ke.addDecor(ln.points);
Ke.addDecor(An.points);
var mo = Pr(In);
for (let n of mo.statics) Ke.addStatic(n);
for (let n of mo.decor) Ke.addDecor(n);
var cn = Gr(In, uo, ln);
for (let n of cn.statics) Ke.addStatic(n);
for (let n of cn.decor) Ke.addDecor(n);
for (let n of Wt) {
  let e = _r(Ot, In),
    {
      position: o,
      yaw: r
    } = wn(n);
  Ke.placePortal({
    id: n.id,
    to: n.to,
    position: o,
    yaw: r,
    radius: Ot,
    frame: e.frame,
    labelHeight: e.labelHeight
  });
  let c = new pt.Group();
  c.position.set(...o), c.rotation.y = r, c.add(e.solids), Ke.addStatic(c);
}
Ir({
  world: Ke,
  materials: In,
  glows: uo,
  sparks: ln,
  dusts: An,
  runes: cn.runes,
  pulseFocus: n => cn.pulseFocus(n),
  cameraDistance: Lr
});
var co = 600;
Ke.onUpdate((n, e) => {
  Ur.update(e), mo.update(e), cn.update(n, e, Ke.active);
  let o = Ke.active;
  if (ln.points.visible = o, An.points.visible = o, o) {
    let r = Ke.camera;
    co = Ke.renderer.domElement.height / (2 * Math.tan(pt.MathUtils.degToRad(r.fov) / 2));
  }
  ln.update(n, co), An.update(n, co);
});
Ke.start();