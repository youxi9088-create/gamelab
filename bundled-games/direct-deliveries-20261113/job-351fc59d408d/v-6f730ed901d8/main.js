import * as V from "three";
import { EffectComposer as Qo } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass as Jo } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass as ys } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass as ti } from "three/addons/postprocessing/OutputPass.js";
import { HorizontalTiltShiftShader as ei } from "three/addons/shaders/HorizontalTiltShiftShader.js";
import { VerticalTiltShiftShader as si } from "three/addons/shaders/VerticalTiltShiftShader.js";
var wo = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  jt = a => typeof a == "number" && Number.isFinite(a),
  As = a => jt(a) && a >= 0,
  Ls = a => {
    if (!a || typeof a != "object") return !1;
    let t = a;
    return [t.top, t.right, t.bottom, t.left].every(As);
  };
function Mo(a) {
  if (!a || typeof a != "object") return !1;
  let t = a;
  return !!t.viewport && jt(t.viewport.width) && t.viewport.width > 0 && jt(t.viewport.height) && t.viewport.height > 0 && Ls(t.safeAreaInset) && Array.isArray(t.exclusions) && t.exclusions.length <= 100 && t.exclusions.every(e => !!e && typeof e.id == "string" && (e.kind === "control" || e.kind === "cutout") && [e.x, e.y, e.width, e.height].every(As));
}
function Eo(a, t) {
  let e = jt(t.width) && t.width > 0 ? t.width : 1,
    i = jt(t.height) && t.height > 0 ? t.height : 1,
    s = a?.contentLayout;
  if (!Mo(s)) return {
    viewport: {
      width: e,
      height: i
    },
    safeAreaInset: Ls(a?.contentSafeAreaInset) ? {
      ...a.contentSafeAreaInset
    } : {
      ...wo
    },
    exclusions: []
  };
  let o = e / s.viewport.width,
    n = i / s.viewport.height;
  return {
    viewport: {
      width: e,
      height: i
    },
    safeAreaInset: {
      top: s.safeAreaInset.top * n,
      right: s.safeAreaInset.right * o,
      bottom: s.safeAreaInset.bottom * n,
      left: s.safeAreaInset.left * o
    },
    exclusions: s.exclusions.map(r => ({
      ...r,
      x: r.x * o,
      y: r.y * n,
      width: r.width * o,
      height: r.height * n
    }))
  };
}
function ko(a, t) {
  if (![a.x, a.y, a.width, a.height].every(jt) || a.width <= 0 || a.height <= 0) return !1;
  let e = t.safeAreaInset;
  return a.x < e.left || a.y < e.top || a.x + a.width > t.viewport.width - e.right || a.y + a.height > t.viewport.height - e.bottom ? !1 : !t.exclusions.some(i => a.x < i.x + i.width && a.x + a.width > i.x && a.y < i.y + i.height && a.y + a.height > i.y);
}
var ts = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  To = 5e3,
  zo = ["pointerdown", "keydown", "touchend"],
  Ne = null,
  Wt = null,
  Ke = !1,
  Xe = !1,
  It = null,
  qe = new Set(),
  We = new Set(),
  Is = () => {
    for (let a of [...We]) a(N.contentLayout);
  },
  Ye = new Set();
function Ze(a) {
  Wt = a, Is();
  let t = a.contentSafeAreaInset ?? ts;
  for (let e of ["top", "right", "bottom", "left"]) document.documentElement.style.setProperty(`--remix-safe-${e}`, `${t[e]}px`);
}
function So(a) {
  Xe = a, It && (It.output.gain.value = a ? 0 : 1);
  for (let t of [...Ye]) t(a);
}
var Ds = Number.NEGATIVE_INFINITY,
  Pt = null,
  Ue = null,
  _e = !1,
  Ct = !1,
  Ps = !1,
  es = "",
  Cs = !1,
  Qe = new Set(),
  Je = new Set(),
  fe = () => document.pointerLockElement !== null,
  me = () => fe() || Ct,
  Ho = () => navigator.userActivation?.isActive === !0;
function ss() {
  let a = me();
  if (a !== Ps) {
    Ps = a;
    for (let t of [...Qe]) t(a);
  }
}
function Bs() {
  Ct && (Ct = !1, Pt && (Pt.style.cursor = es), ss());
}
function Os(a) {
  return document.pointerLockElement === a ? Promise.resolve(!0) : new Promise(t => {
    let e = o => {
        document.removeEventListener("pointerlockchange", i), document.removeEventListener("pointerlockerror", s), t(o);
      },
      i = () => e(document.pointerLockElement === a),
      s = () => e(!1);
    document.addEventListener("pointerlockchange", i), document.addEventListener("pointerlockerror", s);
    try {
      a.requestPointerLock()?.catch?.(() => e(!1));
    } catch {
      e(!1);
    }
  });
}
async function Po(a) {
  return Pt = a, (await Os(a)) ? !0 : _e ? (Ct = !0, es = a.style.cursor, a.style.cursor = "none", ss(), !0) : !1;
}
function ue() {
  Cs || (Cs = !0, document.addEventListener("pointerdown", () => {
    Ds = performance.now(), Ct && Pt && !fe() && Os(Pt);
  }, !0), document.addEventListener("pointermove", a => {
    if (!(!me() || a.movementX === 0 && a.movementY === 0)) for (let t of [...Je]) t(a.movementX, a.movementY);
  }), document.addEventListener("pointerlockchange", () => {
    fe() && Ct && Pt && (Ct = !1, Pt.style.cursor = es), ss();
  }), document.addEventListener("keydown", a => {
    a.key === "Escape" && Bs();
  }));
}
var N = {
  ready() {
    if (!Ne) {
      ue();
      window.addEventListener("resize", Is);
      Ze({
        contentSafeAreaInset: ts,
        initialGameState: null
      });
      Ne = Promise.resolve(Wt);
    }
    return Ne;
  },
  get info() {
    return Wt;
  },
  get safeArea() {
    return Wt?.contentSafeAreaInset ?? ts;
  },
  get contentLayout() {
    return Eo(Wt, {
      width: window.innerWidth,
      height: window.innerHeight
    });
  },
  isUiRectSafe(a) {
    return ko(a, N.contentLayout);
  },
  onContentLayout(a) {
    return We.add(a), Wt && a(N.contentLayout), () => We.delete(a);
  },
  gameOver(a, t) {
    Ke = true;
  },
  onPlayAgain(a) {
    return qe.add(a), () => qe.delete(a);
  },
  get muted() {
    return Xe;
  },
  onMute(a) {
    return Ye.add(a), () => Ye.delete(a);
  },
  audio() {
    if (It) return It;
    let a = new AudioContext(),
      t = a.createGain();
    t.gain.value = Xe ? 0 : 1, t.connect(a.destination), It = {
      context: a,
      output: t
    };
    let e = () => {
      a.state === "suspended" && !document.hidden && a.resume();
    };
    for (let i of zo) window.addEventListener(i, e, !0);
    return document.addEventListener("visibilitychange", () => {
      document.hidden ? a.suspend() : e();
    }), It;
  },
  saveState(a) {
    if (a && Number.isFinite(a.best)) {
      try {
        localStorage.setItem("chaos-courier-best", String(a.best));
      } catch {}
    }
  },
  haptic(a) {
    if (navigator.vibrate) navigator.vibrate(12);
  },
  async lockPointer(a) {
    return ue(), me() ? !0 : (_e ||= performance.now() - Ds <= To || Ho(), Ue ??= Po(a).finally(() => {
      Ue = null, _e = !1;
    }), Ue);
  },
  unlockPointer() {
    fe() ? document.exitPointerLock() : Bs();
  },
  get pointerLocked() {
    return me();
  },
  onPointerLock(a) {
    return ue(), Qe.add(a), () => Qe.delete(a);
  },
  onLook(a) {
    return ue(), Je.add(a), () => Je.delete(a);
  }
};
function at(a) {
  return Object.freeze({
    ...a
  });
}
import * as R from "three";
import { GLTFLoader as Ao } from "three/addons/loaders/GLTFLoader.js";
import * as Y from "three";
import { mergeGeometries as Co } from "three/addons/utils/BufferGeometryUtils.js";
var K = class {
    parts = [];
    m = new Y.Matrix4();
    q = new Y.Quaternion();
    e = new Y.Euler();
    add(t, e, i = 0, s = 0, o = 0, n = 0, r = 0, d = 0, h = 1, c = 1, l = 1) {
      let p = t.index ? t.toNonIndexed() : t.clone();
      t.dispose(), p.deleteAttribute("uv"), p.getAttribute("uv1") && p.deleteAttribute("uv1"), this.e.set(n, r, d), this.q.setFromEuler(this.e), this.m.compose(new Y.Vector3(i, s, o), this.q, new Y.Vector3(h, c, l)), p.applyMatrix4(this.m);
      let f = new Y.Color(e),
        m = p.getAttribute("position").count,
        u = new Float32Array(m * 3);
      for (let v = 0; v < m; v++) u[v * 3] = f.r, u[v * 3 + 1] = f.g, u[v * 3 + 2] = f.b;
      return p.setAttribute("color", new Y.BufferAttribute(u, 3)), this.parts.push(p), this;
    }
    box(t, e, i, s, o = 0, n = 0, r = 0, d = 0, h = 0, c = 0) {
      return this.add(new Y.BoxGeometry(t, e, i), s, o, n, r, d, h, c);
    }
    cyl(t, e, i, s, o, n = 0, r = 0, d = 0, h = 0, c = 0, l = 0) {
      return this.add(new Y.CylinderGeometry(t, e, i, s), o, n, r, d, h, c, l);
    }
    ball(t, e, i = 0, s = 0, o = 0, n = 0, r = 1, d = 1, h = 1) {
      return this.add(new Y.IcosahedronGeometry(t, n), e, i, s, o, 0, 0, 0, r, d, h);
    }
    geometry() {
      let t = Co(this.parts, !1);
      for (let e of this.parts) e.dispose();
      return this.parts = [], t.computeBoundingBox(), t.computeBoundingSphere(), t;
    }
    mesh(t = Gs) {
      let e = new Y.Mesh(this.geometry(), t);
      return e.castShadow = !0, e.receiveShadow = !0, e;
    }
  },
  Gs = new Y.MeshStandardMaterial({
    vertexColors: !0,
    roughness: 0.85,
    metalness: 0.02,
    flatShading: !0
  });
Gs.userData.shared = !0;
function be(a, t, e, i, s = 0.42, o = 0.32) {
  a.cyl(s, s, o, 10, "#1d1b1a", t, e, i, 0, 0, Math.PI / 2), a.cyl(s * 0.55, s * 0.55, o + 0.02, 8, "#9a9a96", t, e, i, 0, 0, Math.PI / 2);
}
function Fs(a) {
  a.traverse(t => {
    let e = t;
    if (e.isMesh) {
      e.geometry.userData.shared = !0;
      for (let i of [e.material].flat()) i.userData.shared = !0;
    }
  });
}
var I = {
  vanBlue: "#3a6fc4",
  vanWhite: "#eef0f2",
  cardboard: "#c08a55",
  tape: "#d9b07a",
  asphalt: "#4a4644",
  sidewalk: "#cdb9a4",
  grass: "#6f8f3e",
  grassDark: "#557533",
  brick: "#a7593c",
  cream: "#e8d3b5",
  terracotta: "#c87a4a",
  roofRed: "#b4382c",
  wood: "#c99a52",
  woodDark: "#8a5f32",
  orange: "#e8742a",
  dropBlue: "#39a7ff"
};
function Ns() {
  let a = new K();
  a.box(2.2, 0.95, 4.7, I.vanBlue, 0, 0.92, 0), a.box(2.2, 1.35, 3.3, I.vanWhite, 0, 2.05, -0.65), a.box(2.12, 1.05, 1.35, I.vanWhite, 0, 1.92, 1.6), a.box(1.9, 0.62, 0.06, "#28344a", 0, 2.05, 2.28, -0.25), a.box(0.06, 0.55, 0.9, "#28344a", 1.08, 2.05, 1.6), a.box(0.06, 0.55, 0.9, "#28344a", -1.08, 2.05, 1.6), a.box(0.06, 0.85, 0.85, I.vanBlue, 1.11, 2.05, -0.5), a.box(0.06, 0.85, 0.85, I.vanBlue, -1.11, 2.05, -0.5), a.box(0.08, 0.3, 0.3, "#ffffff", 1.15, 2.05, -0.5), a.box(0.08, 0.3, 0.3, "#ffffff", -1.15, 2.05, -0.5), a.box(1.6, 1, 0.06, I.vanBlue, 0, 1.75, -2.33), a.box(2.3, 0.3, 0.3, "#2c2c30", 0, 0.55, 2.42), a.box(2.3, 0.3, 0.3, "#2c2c30", 0, 0.55, -2.42), a.box(0.35, 0.22, 0.06, "#ffe9a8", 0.75, 1.2, 2.37), a.box(0.35, 0.22, 0.06, "#ffe9a8", -0.75, 1.2, 2.37), a.box(0.25, 0.4, 0.06, "#d8261c", 0.9, 1.25, -2.37), a.box(0.25, 0.4, 0.06, "#d8261c", -0.9, 1.25, -2.37), a.box(1, 0.45, 0.3, I.vanWhite, 0, 3, 0.3), a.box(0.4, 0.3, 0.32, I.vanBlue, 0, 3, 0.3);
  for (let t of [-1.02, 1.02]) for (let e of [-1.5, 1.45]) be(a, t, 0.45, e, 0.48, 0.36);
  return a.mesh();
}
function Bt() {
  let a = new K();
  return a.box(0.9, 0.7, 0.9, I.cardboard, 0, 0.35, 0), a.box(0.92, 0.04, 0.2, I.tape, 0, 0.71, 0), a.box(0.2, 0.72, 0.92, I.tape, 0, 0.35, 0), a.box(0.36, 0.2, 0.02, "#c0302a", 0.18, 0.4, 0.46), a.mesh();
}
function Us(a = "#3b62b0") {
  let t = new K();
  t.box(1.8, 0.7, 3.8, a, 0, 0.7, 0), t.box(1.6, 0.7, 2.1, a, 0, 1.38, -0.25), t.box(1.5, 0.5, 0.05, "#25303f", 0, 1.42, 0.82, -0.35), t.box(1.5, 0.5, 0.05, "#25303f", 0, 1.42, -1.31, 0.3), t.box(1.62, 0.42, 1.6, "#25303f", 0, 1.42, -0.25), t.box(1.9, 0.22, 0.25, "#2a2a2c", 0, 0.45, 1.92), t.box(1.9, 0.22, 0.25, "#2a2a2c", 0, 0.45, -1.92), t.box(0.3, 0.16, 0.05, "#fff2c0", 0.6, 0.85, 1.91), t.box(0.3, 0.16, 0.05, "#fff2c0", -0.6, 0.85, 1.91), t.box(0.3, 0.16, 0.05, "#d02a20", 0.65, 0.85, -1.91), t.box(0.3, 0.16, 0.05, "#d02a20", -0.65, 0.85, -1.91);
  for (let e of [-0.85, 0.85]) for (let i of [-1.25, 1.25]) be(t, e, 0.38, i, 0.38, 0.28);
  return t.mesh();
}
function Ks() {
  let a = new K();
  a.box(2.6, 2.6, 10.5, "#f2f2ee", 0, 1.75, 0), a.box(2.64, 0.35, 10.54, I.vanBlue, 0, 1, 0), a.box(2.64, 0.15, 10.54, "#f0b030", 0, 1.25, 0), a.box(2.66, 0.9, 9.4, "#2a3444", 0, 2.3, -0.3), a.box(2.3, 1.2, 0.06, "#2a3444", 0, 2.1, 5.26), a.box(2.4, 0.2, 10.2, "#d9dde0", 0, 3.1, 0), a.box(1, 0.25, 1.4, "#c9cdd0", 0, 3.25, 1.5), a.box(1, 0.25, 1.4, "#c9cdd0", 0, 3.25, -2.5);
  for (let t of [-1.2, 1.2]) for (let e of [-3.6, 3.4]) be(a, t, 0.5, e, 0.52, 0.34);
  return a.mesh();
}
var os = null,
  xe = null;
function Dt(a, t, e) {
  let i = document.createElement("canvas");
  i.width = 64, i.height = 64;
  let s = i.getContext("2d");
  s.fillStyle = a, s.fillRect(0, 0, 64, 64), s.fillStyle = t, s.fillRect(0, 58, 64, 6);
  let o = Math.random() < e;
  s.fillStyle = o ? "#ffd27a" : "#3b3f4a", s.fillRect(14, 14, 36, 34), s.fillStyle = o ? "#ffe7b0" : "#56607a", s.fillRect(16, 16, 15, 14), s.fillStyle = t, s.fillRect(12, 46, 40, 5);
  let n = new R.CanvasTexture(i);
  n.colorSpace = R.SRGBColorSpace, n.wrapS = n.wrapT = R.RepeatWrapping, n.magFilter = R.LinearFilter;
  let r = new R.MeshStandardMaterial({
    map: n,
    roughness: 0.9
  });
  return r.userData.shared = !0, r;
}
function Lo() {
  return os || (os = [Dt("#a95b3c", "#7c3f29", 0.6), Dt("#d8b48a", "#a98560", 0.5), Dt("#e6d2b2", "#b59c7c", 0.4), Dt("#c67b4d", "#8f5232", 0.6), Dt("#b7a493", "#857464", 0.4), Dt("#8e4a36", "#5e2f22", 0.7)], xe = new R.MeshStandardMaterial({
    color: "#7d6f63",
    roughness: 1
  }), xe.userData.shared = !0), os;
}
function Yt(a = 14, t = 14, e = 18, i = 0) {
  let s = Lo(),
    o = s[i % s.length],
    n = new R.BoxGeometry(a, e, t),
    r = n.getAttribute("uv"),
    d = 3.2;
  for (let f = 0; f < 6; f++) {
    let m = f < 2 ? t : a,
      u = f === 2 || f === 3 ? t : e;
    for (let v = 0; v < 4; v++) {
      let E = f * 4 + v;
      r.setXY(E, r.getX(E) * Math.max(1, Math.round(m / 3.4)), r.getY(E) * Math.max(1, Math.round(u / d)));
    }
  }
  let h = new R.Mesh(n, [o, o, xe, xe, o, o]);
  h.position.y = e / 2, h.castShadow = !0, h.receiveShadow = !0;
  let c = new R.Group();
  c.add(h);
  let l = new K();
  l.box(a + 0.5, 0.6, t + 0.5, "#6e5a4c", 0, e + 0.3, 0), l.box(a + 0.3, 0.5, t + 0.3, "#5a4a40", 0, 3.3, 0);
  let p = ["#c0392b", "#2e7d4f", "#d68b2a", "#2f5d9a"][i % 4];
  return l.box(Math.min(6, a * 0.5), 0.25, 1.6, p, 0, 3, t / 2 + 0.7, 0.35), l.box(1.8, 1.4, 1.8, "#8d8d8d", a * 0.25, e + 1.3, -t * 0.2), l.cyl(1, 1, 1.8, 8, "#7a5a3a", -a * 0.25, e + 1.5, t * 0.15), c.add(l.mesh()), c;
}
function Zt() {
  let a = new K();
  a.box(9, 4.2, 7.5, I.cream, 0, 2.1, 0);
  let t = new R.CylinderGeometry(4.6, 4.6, 10, 3, 1);
  a.add(t, I.roofRed, 0, 4.2 + 1.55, 0, 0, 0, Math.PI / 2, 1, 1, 1.15), a.box(1.3, 2.2, 0.15, "#6b3f22", 0, 1.1, 3.8), a.box(3.4, 0.25, 1.8, "#9b8c7c", 0, 0.12, 4.6);
  for (let e of [-2.9, 2.9]) a.box(1.5, 1.2, 0.1, "#ffd27a", e, 2.4, 3.78), a.box(1.7, 0.15, 0.2, "#ffffff", e, 1.75, 3.82);
  return a.box(1, 2.4, 1, "#8c4a32", 2.6, 6.8, -1.2), a.mesh();
}
function Xs() {
  let a = new K();
  a.box(26, 9, 18, "#b9bec4", 0, 4.5, 0), a.box(27, 1.2, 19, "#3d6db8", 0, 9.4, 0), a.box(10, 6.5, 0.3, "#2a2c30", -4, 3.25, 9.05), a.box(4, 4, 0.2, I.vanBlue, 7, 6, 9.1), a.box(1.6, 1.6, 0.25, "#ffffff", 7, 6, 9.15), a.box(12, 0.4, 4, "#8e8a84", -4, 0.2, 11);
  for (let t = 0; t < 6; t++) a.box(1, 0.8, 1, I.cardboard, 3 + t % 3 * 1.2, 0.4 + Math.floor(t / 3) * 0.8, 10.3);
  return a.mesh();
}
function ge(a = 9, t = 3.6, e = 2.4) {
  let i = new K(),
    s = Math.atan2(e, a),
    o = Math.hypot(a, e);
  i.box(t, 0.25, o, I.wood, 0, e / 2, 0, -s);
  for (let n = 0; n < 5; n++) i.box(t + 0.05, 0.27, 0.12, I.woodDark, 0, e * (n + 0.5) / 5, -a / 2 + a * (n + 0.5) / 5, -s);
  return i.box(1.6, 0.06, 0.5, "#f2e6c8", 0, e * 0.45 + 0.17, -0.2, -s), i.box(t, e * 0.95, 1.6, I.woodDark, 0, e * 0.47, a / 2 - 0.8), i.box(t * 0.9, e * 0.55, 1.4, I.wood, 0, e * 0.27, a / 2 - 2.8), i.box(1.4, 1.4, 1.4, I.wood, t / 2 + 0.8, 0.7, a / 2 - 1.2, 0, 0.3), i.mesh();
}
function qs() {
  let a = new K();
  a.add(new R.TorusGeometry(6.2, 3, 10, 22), "#d9a05a", 0, 0, 0, 0, Math.PI / 2, 0), a.add(new R.TorusGeometry(6.2, 3.1, 10, 22, Math.PI * 2), "#f07fae", 0.45, 0, 0, 0, Math.PI / 2, 0, 0.86, 1, 1);
  let t = ["#ffffff", "#6fc6ff", "#ffe066", "#8be08b", "#c38bff", "#ff6b6b"];
  for (let e = 0; e < 70; e++) {
    let i = e / 70 * Math.PI * 2 * 3.1,
      s = 6.2 + Math.cos(e * 1.7) * 2.2;
    a.box(0.25, 0.25, 0.9, t[e % t.length], 2.9 + Math.sin(e * 2.3) * 0.4, Math.sin(i) * s, Math.cos(i) * s, i, e, 0);
  }
  return a.mesh();
}
function Ws() {
  let a = new R.Group(),
    t = new R.IcosahedronGeometry(1.9, 1),
    e = t.getAttribute("position");
  for (let n = 0; n < e.count; n++) {
    let r = 0.8 + 0.35 * Math.abs(Math.sin(n * 12.9898) * 43758.5453 % 1);
    e.setXYZ(n, e.getX(n) * r, e.getY(n) * r, e.getZ(n) * r);
  }
  t.computeVertexNormals();
  let i = new R.MeshStandardMaterial({
      color: "#4a3a30",
      roughness: 1,
      flatShading: !0
    }),
    s = new R.Mesh(new R.IcosahedronGeometry(1.75, 1), new R.MeshBasicMaterial({
      color: "#ff8a2a"
    })),
    o = new R.Mesh(t, i);
  return o.castShadow = !0, a.add(s, o), a;
}
function _t() {
  let a = new K();
  return a.box(0.8, 0.1, 0.8, I.orange, 0, 0.05, 0), a.cyl(0.06, 0.32, 1, 8, I.orange, 0, 0.55, 0), a.cyl(0.2, 0.25, 0.18, 8, "#ffffff", 0, 0.55, 0), a.mesh();
}
function Qt() {
  let a = new K();
  return a.cyl(0.28, 0.32, 0.9, 8, "#c8302a", 0, 0.45, 0), a.ball(0.3, "#c8302a", 0, 0.95, 0, 0), a.cyl(0.12, 0.12, 0.8, 6, "#a82820", 0, 0.6, 0, 0, 0, Math.PI / 2), a.cyl(0.38, 0.38, 0.1, 8, "#a82820", 0, 0.05, 0), a.mesh();
}
function ns() {
  let a = new K();
  for (let t = 0; t < 5; t++) a.box(0.18, 1.1, 0.08, "#f1ece2", -1.2 + t * 0.6, 0.55, 0);
  return a.box(3, 0.12, 0.06, "#e5ddd0", 0, 0.75, -0.06), a.box(3, 0.12, 0.06, "#e5ddd0", 0, 0.35, -0.06), a.mesh();
}
function Ot() {
  let a = new K();
  a.box(2.4, 0.9, 1.3, I.woodDark, 0, 0.45, 0);
  for (let t = 0; t < 10; t++) a.ball(0.18, t % 3 === 0 ? "#d93a2a" : "#f08a24", -0.9 + t % 5 * 0.45, 1.05, -0.25 + Math.floor(t / 5) * 0.45, 0);
  return a.box(0.08, 1.9, 0.08, I.woodDark, -1.1, 1, -0.55), a.box(0.08, 1.9, 0.08, I.woodDark, 1.1, 1, -0.55), a.box(2.8, 0.1, 1.7, "#c0392b", 0, 2, 0, 0.25), a.box(1.4, 0.11, 1.72, "#f3eadc", 0, 2.01, 0, 0.25), a.mesh();
}
function ve() {
  let a = new K();
  return a.cyl(0.38, 0.32, 1, 8, "#4f6a4a", 0, 0.5, 0), a.cyl(0.42, 0.42, 0.1, 8, "#3d553a", 0, 1.02, 0), a.mesh();
}
function ye() {
  let a = new K();
  return a.box(2, 0.1, 0.6, I.wood, 0, 0.5, 0), a.box(2, 0.5, 0.08, I.wood, 0, 0.85, -0.28), a.box(0.1, 0.5, 0.5, "#333", -0.9, 0.25, 0), a.box(0.1, 0.5, 0.5, "#333", 0.9, 0.25, 0), a.mesh();
}
function Ys() {
  let a = new K();
  return a.cyl(0.08, 0.12, 4.2, 6, "#3a3a3c", 0, 2.1, 0), a.box(0.9, 0.12, 0.2, "#3a3a3c", 0.4, 4.2, 0), a.box(0.35, 0.18, 0.3, "#ffe2a0", 0.75, 4.1, 0), a.mesh();
}
function rs(a = 1, t = 0) {
  let e = new K(),
    i = ["#5f8a34", "#6d9a3a", "#7a8f30", "#4f7a34"][t % 4];
  e.cyl(0.18, 0.25, 2, 6, "#6a4a2c", 0, 1, 0), e.ball(1.4, i, 0, 2.8, 0, 0, 1, 1.1, 1), e.ball(0.9, i, 0.6, 3.6, 0.2, 0), e.ball(0.8, i, -0.6, 2.4, -0.4, 0);
  let s = e.mesh();
  return s.scale.setScalar(a), s;
}
function Zs() {
  let a = new K();
  return a.box(0.1, 1, 0.1, "#5a4030", 0, 0.5, 0), a.box(0.4, 0.4, 0.7, "#2f5d9a", 0, 1.15, 0), a.box(0.04, 0.3, 0.08, "#d93a2a", 0.22, 1.35, -0.2), a.mesh();
}
var as = {
    van: {
      url: "./_runtime_resources/68ef3a96773293146adbbcc0.glb",
      fit: "length",
      size: 4.8,
      yaw: 0
    },
    package: {
      url: "./_runtime_resources/7781bfbb579ac5c41c58e138.glb",
      fit: "length",
      size: 0.95,
      yaw: 0
    },
    car: {
      url: "./assets-original/modelstraffic-car-23cea038-92ac-4a32-b64f-6ea6993c184f-nOEF.gltf-binary",
      fit: "length",
      size: 3.9,
      yaw: 0
    },
    bus: {
      url: "./_runtime_resources/66d01f753d833de4314910e1.glb",
      fit: "length",
      size: 10.5,
      yaw: 0
    },
    building: {
      url: "./_runtime_resources/2f50ab59210f15360a5fbf9f.glb",
      fit: "unit",
      size: 1,
      yaw: 0
    },
    house: {
      url: "./_runtime_resources/f4261b8fc76cb745273fceee.glb",
      fit: "length",
      size: 13,
      yaw: 0
    },
    depot: {
      url: "./_runtime_resources/157a88b6b156af86d567d63d.glb",
      fit: "length",
      size: 28,
      yaw: 0
    },
    ramp: {
      url: "./assets-original/modelsstunt-ramp-72925e8b-10a4-4eb1-95a9-8fdd6037c90c-1Jf2.gltf-binary",
      fit: "length",
      size: 9.5,
      yaw: 0
    },
    props: {
      url: "./_runtime_resources/897628b65a5b5963801edbca.glb",
      fit: "length",
      size: 5,
      yaw: 0
    },
    donut: {
      url: "./_runtime_resources/ccb3bd04483dca8a380eef98.glb",
      fit: "diameter",
      size: 18,
      yaw: 0
    },
    meteor: {
      url: "./_runtime_resources/85d107a3a4c18e198e8c4b3f.glb",
      fit: "diameter",
      size: 4.2,
      yaw: 0
    }
  },
  Io = {
    van: Math.PI / 2,
    house: -Math.PI / 2
  },
  jo = new Set(["car", "ramp"]),
  hs = {},
  ut = {};
function gt(a) {
  return !!hs[a];
}
function Do(a, t) {
  let e = as[a],
    i = new R.Group();
  i.add(t), i.rotation.y = Io[a] ?? e.yaw, i.updateMatrixWorld(!0);
  let s = new R.Box3().setFromObject(i),
    o = s.getSize(new R.Vector3()),
    n = 1,
    r = 1,
    d = 1;
  e.fit === "length" ? n = e.size / Math.max(o.x, o.z) : e.fit === "diameter" ? n = e.size / Math.max(o.x, o.y, o.z) : e.fit === "height" ? n = e.size / o.y : (n = 1 / Math.max(o.x, o.z), r = Math.max(o.x, o.z) / o.x, d = Math.max(o.x, o.z) / o.z);
  let h = s.getCenter(new R.Vector3()),
    c = new R.Group(),
    l = new R.Group();
  l.add(i), i.position.set(-h.x, -s.min.y, -h.z), l.scale.set(n * r, n, n * d), c.add(l);
  let p = 0;
  return c.traverse(f => {
    let m = f;
    if (!m.isMesh) return;
    m.castShadow = !0, m.receiveShadow = !0;
    let u = m.geometry;
    p += (u.index ? u.index.count : u.getAttribute("position").count) / 3;
    for (let v of [m.material].flat()) {
      let E = v;
      E.isMeshStandardMaterial && (E.metalness = Math.min(E.metalness, 0.3), E.envMapIntensity = 1);
    }
  }), ut[a] = {
    tris: p,
    size: new R.Vector3(o.x * n * r, o.y * n, o.z * n * d)
  }, Fs(c), c;
}
async function _s(a) {
  let t = new Ao(),
    e = Object.keys(as).filter(s => !jo.has(s)),
    i = 0;
  await Promise.all(e.map(async s => {
    try {
      let o = await t.loadAsync(as[s].url);
      hs[s] = Do(s, o.scene);
    } catch {}
    i++, a?.(i, e.length);
  })), console.info("[models]", Object.fromEntries(Object.entries(ut).map(([s, o]) => [s, `${Math.round(o.tris)} tris ${o.size.x.toFixed(1)}x${o.size.y.toFixed(1)}x${o.size.z.toFixed(1)}`])));
}
var is = ["#ffffff", "#ffd2c8", "#d8ffd0", "#fff0b0", "#e0d8ff"],
  $s = new Map();
function Bo(a, t) {
  a.traverse(e => {
    let i = e;
    if (!i.isMesh || Array.isArray(i.material)) return;
    let s = i.material.uuid + t,
      o = $s.get(s);
    if (!o) {
      let n = i.material.clone();
      n.color.multiply(new R.Color(t)), n.userData.shared = !0, o = n, $s.set(s, o);
    }
    i.material = o;
  });
}
var Vs = ["#c8352b", "#3b62b0", "#4d8a3a", "#e0b030", "#e8e4dc", "#7a4aa0", "#d8702a"];
function nt(a, t = 0) {
  let e = hs[a];
  if (e) {
    let i = e.clone();
    return a === "car" && t % is.length && Bo(i, is[t % is.length]), i;
  }
  switch (a) {
    case "van":
      return Ns();
    case "package":
      return Bt();
    case "car":
      return Us(Vs[t % Vs.length]);
    case "bus":
      return Ks();
    case "building":
      return Yt(1, 1, 1.3, t);
    case "house":
      return Zt();
    case "depot":
      return Xs();
    case "ramp":
      return ge();
    case "props":
      return Ot();
    case "donut":
      return qs();
    case "meteor":
      return Ws();
  }
}
var mi = at({
    id: "delivery-van",
    name: "Delivery Van",
    role: "Player vehicle",
    create: Ns
  }),
  bi = at({
    id: "package",
    name: "Package",
    role: "Throwable delivery",
    create: Bt
  }),
  xi = at({
    id: "traffic-car",
    name: "Traffic Car",
    role: "AI traffic",
    create: () => Us()
  }),
  gi = at({
    id: "city-bus",
    name: "City Bus",
    role: "Heavy traffic",
    create: Ks
  }),
  vi = at({
    id: "city-building",
    name: "City Building",
    role: "Downtown block",
    create: () => Yt(14, 14, 18, 0)
  }),
  yi = at({
    id: "customer-house",
    name: "Customer House",
    role: "Delivery destination",
    create: Zt
  }),
  wi = at({
    id: "depot",
    name: "Depot",
    role: "Package pickup",
    create: Xs
  }),
  Mi = at({
    id: "stunt-ramp",
    name: "Stunt Ramp",
    role: "Shortcut launcher",
    create: () => ge()
  }),
  Ei = at({
    id: "fruit-stand",
    name: "Fruit Stand",
    role: "Breakable prop",
    create: Ot
  }),
  ki = at({
    id: "traffic-cone",
    name: "Traffic Cone",
    role: "Breakable prop",
    create: _t
  }),
  Ti = at({
    id: "hydrant",
    name: "Fire Hydrant",
    role: "Breakable prop",
    create: Qt
  }),
  zi = at({
    id: "fence",
    name: "Picket Fence",
    role: "Breakable prop",
    create: ns
  }),
  Ri = at({
    id: "tree",
    name: "Tree",
    role: "Breakable park tree",
    create: () => rs()
  }),
  Si = at({
    id: "giant-donut",
    name: "Giant Donut",
    role: "Rolling disaster",
    create: qs
  }),
  Hi = at({
    id: "meteor",
    name: "Meteor",
    role: "Falling disaster",
    create: Ws
  });
var ds = new Map();
async function we(a, t) {
  try {
    let e = await fetch(t);
    if (!e.ok) return;
    ds.set(a, await N.audio().context.decodeAudioData(await e.arrayBuffer()));
  } catch {}
}
function Js() {
  return Promise.all([we("crash", "./_runtime_resources/4d983b06bdfb391322648eda.mpeg"), we("delivered", "./_runtime_resources/26fc1ad38f09df9450ffb0df.mpeg"), we("explosion", "./_runtime_resources/e93c31642efe33832a4632a7.mpeg"), we("music", "./assets-original/audiomusic-476b6d1c-c729-486f-9e5c-351527377352-sBxD.mpeg")]);
}
function cs(a, t, e) {
  let i = ds.get(a);
  if (!i) return !1;
  let {
      context: s,
      output: o
    } = N.audio(),
    n = s.createBufferSource(),
    r = s.createGain();
  return n.buffer = i, n.playbackRate.value = e, r.gain.value = t, n.connect(r).connect(o), n.start(), !0;
}
var Me = null;
function Oo(a) {
  if (!Me) {
    Me = a.createBuffer(1, a.sampleRate, a.sampleRate);
    let t = Me.getChannelData(0);
    for (let e = 0; e < t.length; e++) t[e] = Math.random() * 2 - 1;
  }
  return Me;
}
function Jt(a, t, e, i = "lowpass") {
  let {
      context: s,
      output: o
    } = N.audio(),
    n = s.createBufferSource();
  n.buffer = Oo(s);
  let r = s.createBiquadFilter();
  r.type = i, r.frequency.value = t;
  let d = s.createGain(),
    h = s.currentTime;
  d.gain.setValueAtTime(e, h), d.gain.exponentialRampToValueAtTime(0.001, h + a), n.connect(r).connect(d).connect(o), n.start(h, Math.random() * 0.5, a + 0.05);
}
function lt(a, t, e, i = "square", s, o = 0) {
  let {
      context: n,
      output: r
    } = N.audio(),
    d = n.createOscillator(),
    h = n.createGain(),
    c = n.currentTime + o;
  d.type = i, d.frequency.setValueAtTime(a, c), s && d.frequency.exponentialRampToValueAtTime(s, c + t), h.gain.setValueAtTime(e, c), h.gain.exponentialRampToValueAtTime(0.001, c + t), d.connect(h).connect(r), d.start(c), d.stop(c + t + 0.05);
}
var Qs = new Map();
function kt(a, t) {
  let e = performance.now();
  return (Qs.get(a) ?? 0) + t > e ? !1 : (Qs.set(a, e), !0);
}
var Ee = (a, t) => a + Math.random() * (t - a),
  G = {
    crash(a = 1) {
      if (!kt("crash", 90)) return;
      let t = Math.min(1, 0.35 + a * 0.5);
      cs("crash", t, Ee(0.9, 1.1)) || Jt(0.35, 1400, t * 0.5);
    },
    smash() {
      kt("smash", 50) && (Jt(0.12, 2600, 0.22, "bandpass"), lt(Ee(300, 500), 0.08, 0.05, "triangle", 120));
    },
    delivered() {
      cs("delivered", 0.8, 1) || (lt(880, 0.12, 0.12, "square"), lt(1320, 0.25, 0.12, "square", void 0, 0.1));
    },
    pickup() {
      lt(520, 0.1, 0.1, "square", 900), lt(780, 0.14, 0.1, "square", 1200, 0.08);
    },
    explosion() {
      kt("boom", 120) && (cs("explosion", 0.75, Ee(0.85, 1.1)) || (Jt(0.9, 500, 0.6), lt(90, 0.6, 0.3, "sine", 30)));
    },
    honk() {
      if (!kt("honk", 700)) return;
      let a = Ee(330, 420);
      lt(a, 0.28, 0.06, "square"), lt(a * 1.26, 0.28, 0.05, "square");
    },
    splash() {
      kt("splash", 200) && Jt(0.6, 900, 0.4);
    },
    whoosh() {
      kt("whoosh", 200) && Jt(0.35, 1800, 0.18, "bandpass");
    },
    alarm() {
      for (let a = 0; a < 3; a++) lt(660, 0.18, 0.08, "sawtooth", 880, a * 0.36), lt(880, 0.18, 0.08, "sawtooth", 660, a * 0.36 + 0.18);
    },
    tick() {
      lt(1200, 0.04, 0.05, "square");
    },
    bad() {
      lt(300, 0.3, 0.1, "sawtooth", 120);
    },
    near() {
      kt("near", 250) && lt(700, 0.12, 0.05, "triangle", 1400);
    },
    boing() {
      kt("boing", 150) && lt(180, 0.3, 0.12, "sine", 520);
    }
  },
  ke = class {
    o1 = null;
    o2 = null;
    gain = null;
    filter = null;
    music = null;
    musicGain = null;
    start() {
      let {
        context: t,
        output: e
      } = N.audio();
      this.o1 || (this.o1 = t.createOscillator(), this.o2 = t.createOscillator(), this.o1.type = "sawtooth", this.o2.type = "square", this.filter = t.createBiquadFilter(), this.filter.type = "lowpass", this.filter.frequency.value = 500, this.gain = t.createGain(), this.gain.gain.value = 0, this.o1.connect(this.filter), this.o2.connect(this.filter), this.filter.connect(this.gain).connect(e), this.o1.start(), this.o2.start());
      let i = ds.get("music");
      i && !this.music && (this.music = t.createBufferSource(), this.music.buffer = i, this.music.loop = !0, this.musicGain = t.createGain(), this.musicGain.gain.value = 0.28, this.music.connect(this.musicGain).connect(e), this.music.start());
    }
    update(t, e, i, s) {
      if (!this.o1 || !this.o2 || !this.gain || !this.filter) return;
      let n = N.audio().context.currentTime,
        r = 42 + Math.min(1.4, t / 30) * 70 + (i ? 25 : 0);
      this.o1.frequency.setTargetAtTime(r, n, 0.08), this.o2.frequency.setTargetAtTime(r * 0.5, n, 0.08), this.filter.frequency.setTargetAtTime(e ? 900 : 450, n, 0.1), this.gain.gain.setTargetAtTime(s ? e ? 0.055 : 0.035 : 0, n, 0.1);
    }
    setMusic(t) {
      this.musicGain && this.musicGain.gain.setTargetAtTime(t, N.audio().context.currentTime, 0.4);
    }
  };
import * as b from "three";
import * as X from "three";
var ot = 6,
  Z = 60,
  ze = 14,
  Te = Z - ze,
  mt = 20,
  O = ot * Z / 2,
  S = O + 12,
  us = 3.5,
  ls = 0.75,
  F = 0.25,
  B = a => -O + a * Z,
  Re = {
    cone: {
      r: 0.45,
      breakSpeed: 0,
      chaos: 1,
      h: 0.5
    },
    hydrant: {
      r: 0.4,
      breakSpeed: 4,
      chaos: 3,
      h: 0.5
    },
    fence: {
      r: 1.4,
      breakSpeed: 0,
      chaos: 1,
      h: 0.55
    },
    fruit: {
      r: 1.3,
      breakSpeed: 3,
      chaos: 4,
      h: 0.6
    },
    trash: {
      r: 0.45,
      breakSpeed: 0,
      chaos: 1,
      h: 0.5
    },
    bench: {
      r: 1,
      breakSpeed: 2,
      chaos: 1,
      h: 0.4
    },
    lamp: {
      r: 0.3,
      breakSpeed: 6,
      chaos: 2,
      h: 1.5
    },
    tree: {
      r: 0.7,
      breakSpeed: 11,
      chaos: 3,
      h: 1.6
    },
    mailbox: {
      r: 0.35,
      breakSpeed: 0,
      chaos: 1,
      h: 0.6
    },
    crate: {
      r: 0.55,
      breakSpeed: 0,
      chaos: 1,
      h: 0.4
    },
    cluster: {
      r: 2.4,
      breakSpeed: 4,
      chaos: 6,
      h: 0.8
    }
  },
  ps = class {
    cells = new Map();
    stamp = 0;
    size = 16;
    key(t, e) {
      return (t + 500) * 1e3 + (e + 500);
    }
    insert(t) {
      let e = Math.floor(t.minX / this.size),
        i = Math.floor(t.maxX / this.size),
        s = Math.floor(t.minZ / this.size),
        o = Math.floor(t.maxZ / this.size);
      for (let n = e; n <= i; n++) for (let r = s; r <= o; r++) {
        let d = this.key(n, r),
          h = this.cells.get(d);
        h || this.cells.set(d, h = []), h.push(t);
      }
    }
    query(t, e, i, s) {
      s.length = 0, this.stamp++;
      let o = Math.floor((t - i) / this.size),
        n = Math.floor((t + i) / this.size),
        r = Math.floor((e - i) / this.size),
        d = Math.floor((e + i) / this.size);
      for (let h = o; h <= n; h++) for (let c = r; c <= d; c++) {
        let l = this.cells.get(this.key(h, c));
        if (l) for (let p of l) p.stamp !== this.stamp && (p.stamp = this.stamp, !(t + i < p.minX || t - i > p.maxX || e + i < p.minZ || e - i > p.maxZ) && s.push(p));
      }
      return s;
    }
  };
function eo(a, t, e) {
  if (a.ramp === void 0) return a.top;
  let i;
  switch (a.ramp) {
    case 0:
      i = (t - a.minX) / (a.maxX - a.minX);
      break;
    case 1:
      i = (a.maxX - t) / (a.maxX - a.minX);
      break;
    case 2:
      i = (e - a.minZ) / (a.maxZ - a.minZ);
      break;
    default:
      i = (a.maxZ - e) / (a.maxZ - a.minZ);
  }
  return a.top * Math.min(1, Math.max(0, i));
}
var so = [];
function Go(a, t, e) {
  return a.circle ? Math.hypot(t - a.circle.x, e - a.circle.z) <= a.circle.r : t >= a.minX && t <= a.maxX && e >= a.minZ && e <= a.maxZ;
}
function pt(a, t, e, i) {
  if (Math.abs(t) > S || Math.abs(e) > S) return -60;
  let s = 0;
  for (let o of a.grid.query(t, e, 0, so)) {
    if (!Go(o, t, e)) continue;
    let n = eo(o, t, e);
    n <= i + ls && n > s && (s = n);
  }
  return s;
}
function fs(a, t, e, i, s, o) {
  o.x = t, o.z = e, o.nx = 0, o.nz = 0, o.depth = 0, o.hit = !1;
  for (let n of a.grid.query(t, e, i, so)) {
    let r, d, h, c, l;
    if (n.circle) {
      let p = o.x - n.circle.x,
        f = o.z - n.circle.z,
        m = Math.hypot(p, f);
      if (m >= n.circle.r + i || n.top <= s + ls) continue;
      h = m > 1e-4 ? p / m : 1, c = m > 1e-4 ? f / m : 0, l = n.circle.r + i - m;
    } else {
      if (r = Math.max(n.minX, Math.min(o.x, n.maxX)), d = Math.max(n.minZ, Math.min(o.z, n.maxZ)), eo(n, r, d) <= s + ls) continue;
      let p = o.x - r,
        f = o.z - d,
        m = Math.hypot(p, f);
      if (m >= i) continue;
      if (m > 1e-4) h = p / m, c = f / m, l = i - m;else {
        let u = o.x - n.minX,
          v = n.maxX - o.x,
          E = o.z - n.minZ,
          j = n.maxZ - o.z,
          P = Math.min(u, v, E, j);
        P === u ? (h = -1, c = 0, l = u + i) : P === v ? (h = 1, c = 0, l = v + i) : P === E ? (h = 0, c = -1, l = E + i) : (h = 0, c = 1, l = j + i);
      }
    }
    o.x += h * l, o.z += c * l, o.nx += h, o.nz += c, o.depth = Math.max(o.depth, l), o.hit = !0, o.tag = n.tag;
  }
  if (o.hit) {
    let n = Math.hypot(o.nx, o.nz) || 1;
    o.nx /= n, o.nz /= n;
  }
  return o;
}
var to = ["Maple", "Pudding", "Wobble", "Biscuit", "Honk", "Noodle", "Pickle", "Gravy", "Waffle", "Kazoo", "Muffin", "Sprocket", "Crumpet", "Lumpy", "Fiddle"],
  Fo = ["St", "Ave", "Ln", "Blvd", "Way", "Ct"],
  $o = ["Big Al's Bagels", "Toaster Emporium", "Sock Outlet", "Pizza Pyramid", "Rubber Duck Depot", "Discount Bowling", "Mega Mattress", "Cheese Vault", "Goat Rentals", "Lamp Land"];
function oo(a) {
  let t = new X.Group(),
    e = [],
    i = new ps(),
    s = [],
    o = [],
    n = [],
    r = [],
    d = {
      x: 0,
      z: 0,
      y: 0,
      name: "Depot",
      kind: "depot"
    },
    h = new K(),
    c = y => {
      let M = {
        ...y,
        stamp: 0
      };
      e.push(M), i.insert(M);
    },
    l = (y, M, x, g, A, D) => c({
      minX: y - x / 2,
      maxX: y + x / 2,
      minZ: M - g / 2,
      maxZ: M + g / 2,
      top: A,
      tag: D
    }),
    p = (y, M, x, g = 0, A = F, D = 0) => {
      let L;
      switch (y) {
        case "cone":
          L = _t();
          break;
        case "hydrant":
          L = Qt();
          break;
        case "fence":
          L = ns();
          break;
        case "fruit":
          L = Ot();
          break;
        case "trash":
          L = ve();
          break;
        case "bench":
          L = ye();
          break;
        case "lamp":
          L = Ys();
          break;
        case "tree":
          L = rs(a.range(0.85, 1.3), D);
          break;
        case "mailbox":
          L = Zs();
          break;
        case "crate":
          {
            L = Bt(), L.scale.multiplyScalar(1.1);
            break;
          }
        case "cluster":
          L = nt("props");
          break;
      }
      L.position.set(M, A, x), L.rotation.y = g, t.add(L), s.push({
        kind: y,
        x: M,
        z: x,
        y: A,
        mesh: L,
        alive: !0
      });
    },
    f = () => `${a.int(2, 899)} ${a.pick(to)} ${a.pick(Fo)}`,
    m = new X.Mesh(new X.PlaneGeometry(S * 2, S * 2), new X.MeshStandardMaterial({
      color: I.asphalt,
      roughness: 0.95
    }));
  m.rotation.x = -Math.PI / 2, m.receiveShadow = !0, t.add(m), h.box(S * 2 + 2, 7, 2, "#9c8f80", 0, -3.5, S + 1), h.box(S * 2 + 2, 7, 2, "#9c8f80", 0, -3.5, -S - 1), h.box(2, 7, S * 2 + 2, "#9c8f80", S + 1, -3.5, 0), h.box(2, 7, S * 2 + 2, "#9c8f80", -S - 1, -3.5, 0);
  let u = O + ze / 2,
    v = S - u;
  for (let y of [-1, 1]) h.box(S * 2, F, v, I.sidewalk, 0, F / 2, y * (u + v / 2)), h.box(v, F, S * 2, I.sidewalk, y * (u + v / 2), F / 2, 0), l(0, y * (u + v / 2), S * 2, v, F, "slab"), l(y * (u + v / 2), 0, v, S * 2, F, "slab");
  let E = new K(),
    j = (y, M) => new X.PlaneGeometry(y, M).rotateX(-Math.PI / 2);
  for (let y = 0; y <= ot; y++) {
    let M = B(y);
    for (let x = 0; x < ot; x++) {
      let g = B(x) + ze / 2,
        A = B(x + 1) - ze / 2;
      r.push({
        ax: M,
        az: B(x),
        bx: M,
        bz: B(x + 1)
      }), r.push({
        ax: B(x),
        az: M,
        bx: B(x + 1),
        bz: M
      });
      for (let D = g + 4; D < A - 3; D += 6) E.add(j(0.3, 2.8), "#e9e1cf", M, 0.02, D + 1.4), E.add(j(2.8, 0.3), "#e9e1cf", D + 1.4, 0.02, M);
      for (let D of [g + 1.6, A - 1.6]) for (let L = -2; L <= 2; L++) E.add(j(1.2, 2.2), "#ddd5c2", M + L * 2.4, 0.02, D), E.add(j(2.2, 1.2), "#ddd5c2", D, 0.02, M + L * 2.4);
    }
  }
  let P = E.mesh();
  P.castShadow = !1, t.add(P);
  let C = [],
    et = a.int(2, 3),
    it = a.int(2, 3);
  for (let y = 0; y < ot; y++) {
    C.push([]);
    for (let M = 0; M < ot; M++) {
      if (y === et && M === it) {
        C[y].push("depot");
        continue;
      }
      let x = Math.hypot(y - 2.5, M - 2.5),
        g = a.next(),
        A = 0.62 - x * 0.13,
        D;
      g < A ? D = "downtown" : g < A + 0.13 ? D = "park" : g < A + 0.25 ? D = "plaza" : D = "residential", C[y].push(D);
    }
  }
  let _ = C.flat().filter(y => y === "residential").length;
  for (; _ < 9;) {
    let y = a.int(0, ot - 1),
      M = a.int(0, ot - 1);
    C[y][M] !== "depot" && C[y][M] !== "residential" && (C[y][M] = "residential", _++);
  }
  let $ = ut.building?.tris ?? 0,
    Q = gt("building") ? $ < 12e4 ? 0.45 : 0.2 : 0,
    ct = (y, M, x) => {
      let g = new X.LOD();
      return g.addLevel(y, 0), g.addLevel(M, x), g;
    },
    dt = (y, M, x) => {
      for (let g = 0; g < 4; g++) for (let A = -18; A <= 18; A += 12) {
        let D = mt + 1.9,
          [L, H] = g === 0 ? [y + A, M + D] : g === 1 ? [y + A, M - D] : g === 2 ? [y + D, M + A] : [y - D, M + A],
          k = a.next();
        Math.abs(A) > 16 && k < 0.5 ? p("lamp", L, H, g < 2 ? 0 : Math.PI / 2) : k < 0.15 ? p("hydrant", L, H) : k < 0.3 ? p("trash", L, H) : k < 0.38 && !x ? p("fruit", L, H, g === 0 ? 0 : g === 1 ? Math.PI : g === 2 ? Math.PI / 2 : -Math.PI / 2) : k < 0.45 && p("mailbox", L, H);
      }
    };
  for (let y = 0; y < ot; y++) for (let M = 0; M < ot; M++) {
    let x = B(y) + Z / 2,
      g = B(M) + Z / 2,
      A = C[y][M],
      D = Math.hypot(y - 2.5, M - 2.5);
    h.box(Te, F, Te, I.sidewalk, x, F / 2, g), l(x, g, Te, Te, F, "slab");
    let L = A === "downtown" || A === "plaza" || A === "depot" ? "#b8a48e" : I.grass;
    if (h.box(mt * 2, 0.04, mt * 2, L, x, F + 0.02, g), A === "downtown") {
      let H = a.chance(0.6),
        k = a.chance(0.6);
      for (let de of [-1, 1]) for (let $t of [-1, 1]) {
        let St = k ? a.range(12.5, 15) : 20,
          Ht = H ? a.range(12.5, 15) : 20,
          Vt = x + de * (mt - St / 2),
          Nt = g + $t * (mt - Ht / 2),
          le = a.range(9, 26) * Math.max(0.7, 1.35 - D * 0.16),
          Lt,
          pe = le;
        if (a.chance(Q)) {
          let Ut = nt("building"),
            Kt = ut.building?.size.y ?? 1.4,
            Xt = Kt * Math.min(St, Ht) * a.range(0.9, 1.25);
          Ut.scale.set(St, Xt / Kt, Ht), Ut.rotation.y = $t > 0 ? 0 : Math.PI, pe = Xt, Lt = ct(Ut, Yt(St, Ht, Xt, a.int(0, 5)), 100);
        } else Lt = Yt(St, Ht, le, a.int(0, 5));
        Lt.position.set(Vt, F, Nt), t.add(Lt), l(Vt, Nt, St * 0.96, Ht * 0.96, pe, "building");
      }
      H && k && a.chance(0.5) && p("crate", x + a.range(-1, 1), g + a.range(-1, 1)), dt(x, g, !1);
      let W = a.int(0, 3),
        st = mt + 1.5,
        tt = a.range(-10, 10),
        [Ve, Mt] = W === 0 ? [x + tt, g + st] : W === 1 ? [x + tt, g - st] : W === 2 ? [x + st, g + tt] : [x - st, g + tt],
        Et = {
          x: Ve,
          z: Mt,
          y: F,
          name: a.pick($o),
          kind: "shop"
        };
      a.chance(0.5) ? n.push(Et) : o.push({
        ...Et,
        name: `${Et.name}, ${f()}`
      });
    } else if (A === "residential") {
      let H = a.chance(0.5);
      for (let k of [-1, 1]) for (let W of [-10, 10]) {
        let st = H ? x + W : x + k * 9,
          tt = H ? g + k * 9 : g + W,
          Ve = H ? k > 0 ? 0 : Math.PI : k > 0 ? Math.PI / 2 : -Math.PI / 2,
          Mt;
        gt("house") ? Mt = ct(nt("house"), Zt(), 75) : (Mt = Zt(), Mt.scale.setScalar(a.range(0.85, 1))), Mt.position.set(st, F, tt), Mt.rotation.y = Ve, t.add(Mt);
        let Et = ut.house?.size,
          de = Et ? Math.min(9, Et.x * 0.62) : 8.6,
          $t = Et ? Math.min(8, Et.z * 0.55) : 7.2;
        l(st, tt, H ? de : $t, H ? $t : de, 6.5, "house");
        let Vt = H ? st : x + k * (mt - 0.4),
          Nt = H ? g + k * (mt - 0.4) : tt;
        for (let Kt of [-1, 1]) {
          let Xt = H ? Kt * 3.4 : 0,
            yo = H ? 0 : Kt * 3.4;
          p("fence", Vt + Xt, Nt + yo, H ? 0 : Math.PI / 2);
        }
        let le = H ? st : x + k * 16,
          Lt = H ? g + k * 16 : tt;
        o.push({
          x: le,
          z: Lt,
          y: F,
          name: f(),
          kind: "house"
        }), a.chance(0.5) && p("mailbox", Vt + (H ? 1.8 : 0), Nt + (H ? 0 : 1.8));
        let pe = H ? st : x + k * 2,
          Ut = H ? g + k * 2 : tt;
        a.chance(0.7) && p("tree", pe + a.range(-2, 2), Ut + a.range(-2, 2), a.range(0, 6), F, a.int(0, 3));
      }
      dt(x, g, !0);
    } else if (A === "park") {
      h.box(3, 0.05, mt * 2, "#cbb79c", x, F + 0.05, g), h.box(mt * 2, 0.05, 3, "#cbb79c", x, F + 0.05, g), h.cyl(3.4, 3.6, 1.2, 12, "#b8aa98", x, F + 0.6, g), h.cyl(2.9, 2.9, 0.1, 12, "#5aa6d6", x, F + 1.15, g), h.cyl(0.5, 0.7, 2.2, 8, "#b8aa98", x, F + 1.6, g), c({
        minX: x - 3.6,
        maxX: x + 3.6,
        minZ: g - 3.6,
        maxZ: g + 3.6,
        top: 1.4,
        circle: {
          x,
          z: g,
          r: 3.6
        },
        tag: "fountain"
      });
      let H = a.int(7, 11);
      for (let k = 0; k < H; k++) {
        let W = x + a.range(-17, 17),
          st = g + a.range(-17, 17);
        Math.abs(W - x) < 3 || Math.abs(st - g) < 3 || p("tree", W, st, a.range(0, 6), F, a.int(0, 3));
      }
      for (let k = 0; k < 3; k++) p("bench", x + a.pick([-6, 6]), g + a.range(-15, 15), Math.PI / 2);
      dt(x, g, !0), a.chance(0.4) && o.push({
        x: x + a.pick([-8, 8]),
        z: g + a.pick([-8, 8]),
        y: F,
        name: `Park Bench #${a.int(2, 99)}`,
        kind: "house"
      });
    } else if (A === "plaza") {
      let H = a.int(2, 3);
      for (let W = 0; W < H; W++) p("fruit", x + a.range(-14, 14), g + a.pick([-14, 14]), a.pick([0, Math.PI]));
      gt("props") && p("cluster", x + a.pick([-12, 12]), g + a.range(-6, 6), a.range(0, 6));
      for (let W = 0; W < 6; W++) p("cone", x + a.range(-16, 16), g + a.range(-16, 16));
      for (let W = 0; W < 4; W++) p("crate", x + a.range(-15, 15), g + a.range(-15, 15), a.range(0, 6));
      let k = a.int(0, 3);
      xt(x, g, k, F), h.box(2.2, 1.2, 2.2, "#9a8f84", x + (k < 2 ? 0 : 12), F + 0.6, g + (k < 2 ? 12 : 0)), h.cyl(0.6, 0.8, 3.2, 8, "#8c7a5a", x + (k < 2 ? 0 : 12), F + 2.8, g + (k < 2 ? 12 : 0)), l(x + (k < 2 ? 0 : 12), g + (k < 2 ? 12 : 0), 2.2, 2.2, 4.5, "statue"), n.push({
        x: x + a.range(-6, 6),
        z: g + (k < 2 ? -12 : 0) + a.range(-3, 3),
        y: F,
        name: `${a.pick(to)} Market`,
        kind: "shop"
      }), dt(x, g, !1);
    } else {
      let H = nt("depot");
      H.position.set(x, F, g - 4), t.add(H);
      let k = ut.depot?.size,
        W = k ? k.x * 0.85 : 26,
        st = k ? Math.min(20, k.z * 0.6) : 18;
      l(x, g - 4 - (k ? k.z * 0.08 : 0), W, st, 9, "depot"), d = {
        x,
        z: g + 15,
        y: F,
        name: "Rapid-ish Parcel Depot",
        kind: "depot"
      }, n.push(d);
      for (let tt = 0; tt < 8; tt++) p("crate", x + a.range(8, 17) * a.pick([-1, 1]), g + a.range(10, 18), a.range(0, 6));
      for (let tt = 0; tt < 4; tt++) p("cone", x + a.range(-12, 12), g + 19);
    }
  }
  function xt(y, M, x, g) {
    let H = x >= 2,
      k = nt("ramp");
    if (gt("ramp"), k.position.set(y, g, M), k.rotation.y = x === 2 ? 0 : x === 3 ? Math.PI : x === 0 ? Math.PI / 2 : -Math.PI / 2, gt("ramp")) {
      let tt = ut.ramp.size;
      k.scale.set(3.6 / tt.x, 2.4 / tt.y, 9 / tt.z);
    }
    t.add(k);
    let W = H ? 3.6 : 9,
      st = H ? 9 : 3.6;
    c({
      minX: y - W / 2,
      maxX: y + W / 2,
      minZ: M - st / 2,
      maxZ: M + st / 2,
      top: 2.4 + g,
      ramp: x,
      tag: "ramp"
    });
  }
  let Ge = a.shuffle([...r]),
    ks = 0;
  for (let y of Ge) {
    if (ks >= 9) break;
    let M = (y.ax + y.bx) / 2,
      x = (y.az + y.bz) / 2;
    if (Math.abs(M) > O - 1 || Math.abs(x) > O - 1) continue;
    let g = y.ax === y.bx,
      A = g ? a.pick([2, 3]) : a.pick([0, 1]);
    xt(M, x, A, 0);
    for (let D of [-1, 1]) {
      let L = A === 2 || A === 0 ? -1 : 1,
        H = g ? M + D * 1.6 : M + L * 6,
        k = g ? x + L * 6 : x + D * 1.6;
      p("cone", H, k, 0, 0);
    }
    ks++;
  }
  let go = h.mesh();
  t.add(go);
  let Fe = new X.InstancedMesh(new X.BoxGeometry(1, 1, 1), new X.MeshStandardMaterial({
      color: "#c99a78",
      roughness: 1
    }), 160),
    Ts = new X.Matrix4(),
    vo = new X.Color();
  for (let y = 0; y < 160; y++) {
    let M = a.range(0, Math.PI * 2),
      x = a.range(330, 520),
      g = a.range(20, 90),
      A = a.range(14, 30);
    Ts.compose(new X.Vector3(Math.cos(M) * x, g / 2 - 2, Math.sin(M) * x), new X.Quaternion().setFromAxisAngle(new X.Vector3(0, 1, 0), a.range(0, 3)), new X.Vector3(A, g, A)), Fe.setMatrixAt(y, Ts), Fe.setColorAt(y, vo.set(a.pick(["#c99a78", "#b88a6c", "#d8b090", "#a87a60"])));
  }
  t.add(Fe);
  let $e = new K();
  for (let y = 0; y < 70; y++) {
    let M = a.range(0, Math.PI * 2),
      x = a.range(290, 330);
    $e.ball(a.range(5, 9), a.pick(["#5d7a36", "#6f8a3a", "#4d6a30"]), Math.cos(M) * x, 2, Math.sin(M) * x, 0);
  }
  $e.box(1400, 4, 1400, "#7a8a50", 0, -3.5, 0);
  let zs = $e.mesh();
  zs.castShadow = !1, t.add(zs);
  let Ft = new K();
  for (let [y, M, x] of [[S + 60, B(2), 0], [-S - 60, B(4), 0], [B(3), -S - 60, 1]]) {
    let g = x ? 12 : 120,
      A = x ? 120 : 12;
    Ft.box(g, 1.2, A, "#8f7f70", y, 2.2, M);
    for (let D = -2; D <= 2; D++) {
      let L = x ? y : y + D * 24,
        H = x ? M + D * 24 : M;
      Ft.box(3, 9, 3, "#7d6e60", L, -2, H);
    }
    Ft.box(x ? 0.5 : 120, 1, x ? 120 : 0.5, "#6d5f52", y + (x ? 5.5 : 0), 3.3, M + (x ? 0 : 5.5)), Ft.box(x ? 0.5 : 120, 1, x ? 120 : 0.5, "#6d5f52", y - (x ? 5.5 : 0), 3.3, M - (x ? 0 : 5.5));
  }
  return t.add(Ft.mesh()), {
    group: t,
    grid: i,
    solids: e,
    props: s,
    drops: o,
    pickups: n,
    depot: d,
    segs: r
  };
}
function te(a) {
  let t = a >>> 0,
    e = () => {
      t = t + 1831565813 >>> 0;
      let s = t;
      return s = Math.imul(s ^ s >>> 15, s | 1), s ^= s + Math.imul(s ^ s >>> 7, s | 61), ((s ^ s >>> 14) >>> 0) / 4294967296;
    };
  return {
    next: e,
    range: (s, o) => s + (o - s) * e(),
    int: (s, o) => Math.floor(s + (o - s + 1) * e()),
    pick: s => s[Math.floor(e() * s.length)],
    chance: s => e() < s,
    shuffle: s => {
      for (let o = s.length - 1; o > 0; o--) {
        let n = Math.floor(e() * (o + 1)),
          r = s[o];
        s[o] = s[n], s[n] = r;
      }
      return s;
    }
  };
}
var z = (a = 0, t = 1) => a + (t - a) * Math.random();
import * as w from "three";
var ee = class {
    constructor(t, e, i) {
      this.count = i;
      this.mesh = new w.InstancedMesh(t, e, i), this.mesh.frustumCulled = !1, this.mesh.instanceMatrix.setUsage(w.DynamicDrawUsage);
      for (let s = 0; s < i; s++) this.ps.push({
        alive: !1,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        max: 1,
        size: 1,
        grow: 0,
        gravity: 0,
        drag: 0,
        spin: 0,
        rx: 0,
        ry: 0,
        color: new w.Color()
      }), this.mesh.setColorAt(s, new w.Color(1, 1, 1)), this.m.makeScale(0, 0, 0), this.mesh.setMatrixAt(s, this.m);
    }
    mesh;
    ps = [];
    cursor = 0;
    m = new w.Matrix4();
    q = new w.Quaternion();
    e = new w.Euler();
    v = new w.Vector3();
    s = new w.Vector3();
    spawn(t, e, i, s, o, n, r, d, h, c = 0, l = 0, p = 0, f = 0) {
      let m = this.cursor,
        u = this.ps[m];
      this.cursor = (this.cursor + 1) % this.count, u.alive = !0, u.x = t, u.y = e, u.z = i, u.vx = s, u.vy = o, u.vz = n, u.life = r, u.max = r, u.size = d, u.grow = c, u.gravity = l, u.drag = p, u.spin = f, u.rx = Math.random() * 6, u.ry = Math.random() * 6, u.color.set(h), this.mesh.setColorAt(m, u.color), this.mesh.instanceColor && (this.mesh.instanceColor.needsUpdate = !0);
    }
    update(t, e) {
      for (let i = 0; i < this.count; i++) {
        let s = this.ps[i];
        if (!s.alive) continue;
        if (s.life -= t, s.life <= 0) {
          s.alive = !1, this.m.makeScale(0, 0, 0), this.mesh.setMatrixAt(i, this.m);
          continue;
        }
        let o = Math.exp(-s.drag * t);
        s.vx *= o, s.vz *= o, s.vy = s.vy * o - s.gravity * t, s.x += s.vx * t, s.y += s.vy * t, s.z += s.vz * t, s.gravity > 0 && s.y < e && (s.y = e, s.vy *= -0.35, s.vx *= 0.6, s.vz *= 0.6, s.spin *= 0.5), s.rx += s.spin * t, s.ry += s.spin * 0.7 * t;
        let n = 1 - s.life / s.max,
          r = s.size * (1 + s.grow * n);
        n > 0.6 && (r *= 1 - (n - 0.6) / 0.4), this.e.set(s.rx, s.ry, 0), this.q.setFromEuler(this.e), this.v.set(s.x, s.y, s.z), this.s.setScalar(Math.max(1e-4, r)), this.m.compose(this.v, this.q, this.s), this.mesh.setMatrixAt(i, this.m);
      }
      this.mesh.instanceMatrix.needsUpdate = !0;
    }
    clear() {
      for (let t = 0; t < this.count; t++) this.ps[t].alive = !1, this.m.makeScale(0, 0, 0), this.mesh.setMatrixAt(t, this.m);
      this.mesh.instanceMatrix.needsUpdate = !0;
    }
  },
  T = (a, t) => a + (t - a) * Math.random(),
  Se = class {
    group = new w.Group();
    puffs;
    glow;
    bits;
    flashes = [];
    rings = [];
    floor = 0.05;
    constructor() {
      this.puffs = new ee(new w.IcosahedronGeometry(0.5, 0), new w.MeshStandardMaterial({
        roughness: 1,
        flatShading: !0
      }), 700), this.glow = new ee(new w.IcosahedronGeometry(0.5, 0), new w.MeshBasicMaterial({
        toneMapped: !1
      }), 500), this.bits = new ee(new w.BoxGeometry(0.5, 0.5, 0.5), new w.MeshStandardMaterial({
        roughness: 0.8
      }), 700), this.bits.mesh.castShadow = !0, this.group.add(this.puffs.mesh, this.glow.mesh, this.bits.mesh);
      for (let t = 0; t < 6; t++) {
        let e = new w.Mesh(new w.IcosahedronGeometry(1, 1), new w.MeshBasicMaterial({
          color: "#ffd080",
          transparent: !0,
          depthWrite: !1,
          toneMapped: !1
        }));
        e.visible = !1, this.group.add(e), this.flashes.push({
          mesh: e,
          life: 0,
          max: 1,
          size: 1
        });
        let i = new w.Mesh(new w.RingGeometry(0.8, 1, 32).rotateX(-Math.PI / 2), new w.MeshBasicMaterial({
          color: "#fff0d0",
          transparent: !0,
          depthWrite: !1,
          side: w.DoubleSide
        }));
        i.visible = !1, this.group.add(i), this.rings.push({
          mesh: i,
          life: 0,
          max: 1,
          size: 1
        });
      }
    }
    smoke(t, e, i, s = 1, o = "#c9c0b4", n = 0.8, r = 1.5) {
      for (let d = 0; d < s; d++) this.puffs.spawn(t + T(-0.4, 0.4), e + T(0, 0.3), i + T(-0.4, 0.4), T(-0.8, 0.8), r * T(0.6, 1.4), T(-0.8, 0.8), T(0.8, 1.5), n * T(0.7, 1.2), o, 1.6, 0, 1.2);
    }
    dust(t, e, i, s = 6, o = 4) {
      for (let n = 0; n < s; n++) {
        let r = Math.random() * Math.PI * 2;
        this.puffs.spawn(t, e + 0.3, i, Math.cos(r) * o * T(0.5, 1), T(0.5, 2), Math.sin(r) * o * T(0.5, 1), T(0.6, 1.1), T(0.6, 1.1), "#d8c4a8", 1.4, 0, 2.5);
      }
    }
    debris(t, e, i, s, o, n = 7, r = 0.35) {
      for (let d = 0; d < s; d++) {
        let h = Math.random() * Math.PI * 2,
          c = n * T(0.4, 1);
        this.bits.spawn(t, e + 0.5, i, Math.cos(h) * c, T(4, 10), Math.sin(h) * c, T(1.2, 2.4), r * T(0.6, 1.3), o[d % o.length], 0, 22, 0.3, T(4, 12));
      }
    }
    confetti(t, e, i, s = 50) {
      let o = ["#ff5a5a", "#ffd23a", "#4ad0ff", "#7cff6a", "#ff7ad9", "#ffffff"];
      for (let n = 0; n < s; n++) {
        let r = Math.random() * Math.PI * 2,
          d = T(2, 8);
        this.bits.spawn(t, e + 1, i, Math.cos(r) * d, T(8, 16), Math.sin(r) * d, T(1.5, 2.8), T(0.18, 0.3), o[n % o.length], 0, 9, 1.6, T(6, 16));
      }
    }
    fire(t, e, i, s = 1, o = 1) {
      for (let n = 0; n < s; n++) this.glow.spawn(t + T(-0.5, 0.5) * o, e, i + T(-0.5, 0.5) * o, T(-1, 1), T(2, 5), T(-1, 1), T(0.35, 0.7), o * T(0.6, 1.1), Math.random() < 0.5 ? "#ffb340" : "#ff6a20", -0.6, 0, 1);
    }
    sparks(t, e, i, s = 10) {
      for (let o = 0; o < s; o++) {
        let n = Math.random() * Math.PI * 2;
        this.glow.spawn(t, e, i, Math.cos(n) * T(4, 10), T(3, 9), Math.sin(n) * T(4, 10), T(0.25, 0.5), T(0.12, 0.22), "#ffe28a", 0, 20, 0.5);
      }
    }
    splash(t, e, i, s = 20, o = 5) {
      for (let n = 0; n < s; n++) {
        let r = Math.random() * Math.PI * 2;
        this.puffs.spawn(t, e, i, Math.cos(r) * o * T(0.3, 1), T(4, 11), Math.sin(r) * o * T(0.3, 1), T(0.7, 1.3), T(0.35, 0.7), Math.random() < 0.5 ? "#e6f4ff" : "#8cc8e8", 0.2, 18, 0.4);
      }
    }
    explosion(t, e, i, s = 1) {
      let o = this.flashes.find(r => r.life <= 0) ?? this.flashes[0];
      o.life = o.max = 0.45, o.size = 5 * s, o.mesh.position.set(t, e + 1, i), o.mesh.visible = !0;
      let n = this.rings.find(r => r.life <= 0) ?? this.rings[0];
      n.life = n.max = 0.6, n.size = 16 * s, n.mesh.position.set(t, e + 0.2, i), n.mesh.visible = !0;
      for (let r = 0; r < 26 * s; r++) {
        let d = Math.random() * Math.PI * 2,
          h = T(3, 12) * s;
        this.glow.spawn(t, e + 1, i, Math.cos(d) * h, T(2, 10), Math.sin(d) * h, T(0.4, 0.9), T(0.8, 1.8) * s, Math.random() < 0.5 ? "#ffb340" : "#ff5a1a", -0.5, 0, 3);
      }
      for (let r = 0; r < 18 * s; r++) {
        let d = Math.random() * Math.PI * 2,
          h = T(1, 6) * s;
        this.puffs.spawn(t, e + 1, i, Math.cos(d) * h, T(2, 7), Math.sin(d) * h, T(1.4, 2.6), T(1, 2) * s, Math.random() < 0.5 ? "#5a504a" : "#8a7f76", 1.5, 0, 1.5);
      }
    }
    update(t) {
      this.puffs.update(t, -100), this.glow.update(t, -100), this.bits.update(t, this.floor);
      for (let e of this.flashes) {
        if (e.life <= 0) continue;
        e.life -= t;
        let i = 1 - e.life / e.max;
        e.mesh.scale.setScalar(e.size * (0.4 + i)), e.mesh.material.opacity = 1 - i, e.life <= 0 && (e.mesh.visible = !1);
      }
      for (let e of this.rings) {
        if (e.life <= 0) continue;
        e.life -= t;
        let i = 1 - e.life / e.max;
        e.mesh.scale.setScalar(e.size * (0.2 + i)), e.mesh.material.opacity = 0.8 * (1 - i), e.life <= 0 && (e.mesh.visible = !1);
      }
    }
    clear() {
      this.puffs.clear(), this.glow.clear(), this.bits.clear();
      for (let t of this.flashes) t.life = 0, t.mesh.visible = !1;
      for (let t of this.rings) t.life = 0, t.mesh.visible = !1;
    }
  },
  se = class {
    group = new w.Group();
    ring;
    pulse;
    beam;
    arrow;
    t = 0;
    mats = [];
    constructor(t = 4.5) {
      let e = c => {
        let l = new w.MeshBasicMaterial({
          color: "#39a7ff",
          transparent: !0,
          opacity: c,
          depthWrite: !1,
          side: w.DoubleSide,
          toneMapped: !1,
          blending: w.AdditiveBlending
        });
        return this.mats.push(l), l;
      };
      this.ring = new w.Mesh(new w.RingGeometry(t * 0.86, t, 48).rotateX(-Math.PI / 2), e(0.95));
      let i = new w.Mesh(new w.RingGeometry(t * 0.45, t * 0.55, 40).rotateX(-Math.PI / 2), e(0.7)),
        s = new w.Mesh(new w.CircleGeometry(t, 40).rotateX(-Math.PI / 2), e(0.18));
      this.pulse = new w.Mesh(new w.RingGeometry(t * 0.9, t, 48).rotateX(-Math.PI / 2), e(0.6)), this.beam = new w.Mesh(new w.CylinderGeometry(t * 0.5, t * 0.9, 40, 24, 1, !0), e(0.07)), this.beam.position.y = 20, this.ring.position.y = 0.06, i.position.y = 0.06, s.position.y = 0.05, this.pulse.position.y = 0.07, this.group.add(this.ring, i, s, this.pulse, this.beam);
      let o = new w.Shape();
      o.moveTo(-0.7, 3), o.lineTo(0.7, 3), o.lineTo(0.7, 1.4), o.lineTo(1.7, 1.4), o.lineTo(0, -0.4), o.lineTo(-1.7, 1.4), o.lineTo(-0.7, 1.4), o.closePath();
      let n = new w.ExtrudeGeometry(o, {
        depth: 0.8,
        bevelEnabled: !0,
        bevelSize: 0.12,
        bevelThickness: 0.12,
        bevelSegments: 1
      });
      n.translate(0, 0, -0.4);
      let r = new w.MeshStandardMaterial({
        color: "#4bb4ff",
        emissive: "#1f7fe0",
        emissiveIntensity: 1.4,
        roughness: 0.4
      });
      this.mats.push(r), this.arrow = new w.Group();
      let d = new w.Mesh(n, r),
        h = new w.Mesh(n, r);
      h.rotation.y = Math.PI / 2, this.arrow.add(d, h), this.arrow.scale.setScalar(1.3), this.group.add(this.arrow);
    }
    setColor(t, e) {
      for (let i of this.mats) {
        i.color.set(t);
        let s = i;
        s.emissive && s.emissive.set(e);
      }
    }
    update(t) {
      this.t += t, this.arrow.position.y = 7 + Math.sin(this.t * 3) * 0.8, this.arrow.rotation.y += t * 1.2;
      let e = this.t * 0.8 % 1;
      this.pulse.scale.setScalar(1 + e * 0.8), this.pulse.material.opacity = 0.6 * (1 - e);
    }
  };
var Vo = `
#hud{position:fixed;inset:0;pointer-events:none;font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif;color:#fff;user-select:none;z-index:5}
#hud *{box-sizing:border-box}
.hud-stats{position:absolute;left:calc(14px + var(--remix-safe-left,0px));top:calc(14px + var(--remix-safe-top,0px));display:flex;flex-direction:column;gap:6px}
.hud-chip{display:flex;align-items:center;gap:8px;background:rgba(36,44,56,.82);border:2px solid rgba(255,255,255,.12);border-radius:10px;padding:4px 12px 4px 4px;font-weight:800;font-size:22px;min-width:118px;box-shadow:0 3px 8px rgba(0,0,0,.3);text-shadow:0 2px 0 rgba(0,0,0,.35)}
.hud-ico{width:32px;height:32px;border-radius:7px;display:grid;place-items:center;font-size:19px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.25)}
.hud-mut{position:absolute;right:calc(14px + var(--remix-safe-right,0px));top:calc(14px + var(--remix-safe-top,0px));background:rgba(36,44,56,.82);border:2px solid rgba(255,255,255,.12);border-radius:10px;padding:8px 12px;font-size:14px;min-width:190px;box-shadow:0 3px 8px rgba(0,0,0,.3)}
.hud-mut h4{margin:0 0 4px;font-size:14px;color:#cfd8e3;letter-spacing:.5px}
.hud-mut div{padding:2px 0;font-weight:700;white-space:nowrap}
.hud-mut .on{color:#ffcf4a;animation:pulse .6s infinite alternate}
.hud-mut .dim{color:#9aa6b4;font-weight:600}
@keyframes pulse{from{opacity:1}to{opacity:.55}}
.hud-job{position:absolute;left:50%;top:calc(14px + var(--remix-safe-top,0px));transform:translateX(-50%);text-align:center;background:rgba(36,44,56,.82);border:2px solid rgba(255,255,255,.12);border-radius:12px;padding:6px 18px 8px;min-width:300px;max-width:46vw;box-shadow:0 3px 8px rgba(0,0,0,.3)}
.hud-job .t{font-weight:900;font-size:18px;letter-spacing:.5px}
.hud-job .s{font-size:13px;color:#cfd8e3;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hud-job .bar{height:8px;border-radius:4px;background:rgba(255,255,255,.15);margin-top:6px;overflow:hidden}
.hud-job .bar i{display:block;height:100%;background:linear-gradient(90deg,#39d16a,#9be84a);border-radius:4px}
.hud-job .tm{font-weight:900;font-size:22px;margin-top:2px}
.hud-bottom{position:absolute;left:50%;bottom:calc(16px + var(--remix-safe-bottom,0px));transform:translateX(-50%);display:flex;gap:14px;align-items:flex-end}
.hud-meter{background:rgba(36,44,56,.82);border:2px solid rgba(255,255,255,.12);border-radius:10px;padding:5px 10px;width:180px;font-size:12px;font-weight:800;letter-spacing:.6px}
.hud-meter .bar{height:9px;border-radius:4px;background:rgba(255,255,255,.15);margin-top:3px;overflow:hidden}
.hud-meter .bar i{display:block;height:100%;border-radius:4px}
.hud-speed{font-weight:900;font-size:30px;text-shadow:0 3px 0 rgba(0,0,0,.4);min-width:90px;text-align:center;line-height:1}
.hud-speed small{display:block;font-size:11px;letter-spacing:1px;opacity:.8}
.hud-map{position:absolute;right:calc(14px + var(--remix-safe-right,0px));bottom:calc(14px + var(--remix-safe-bottom,0px));width:170px;height:170px;border-radius:12px;border:3px solid rgba(255,255,255,.25);box-shadow:0 3px 10px rgba(0,0,0,.35);background:#2a3a48}
.hud-arrow{position:absolute;width:56px;height:56px;margin:-28px 0 0 -28px;display:none}
.hud-arrow svg{width:100%;height:100%;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5))}
.hud-arrow span{position:absolute;left:50%;top:60px;transform:translateX(-50%);font-weight:900;font-size:14px;text-shadow:0 2px 0 #000;white-space:nowrap}
.hud-pop{position:absolute;font-weight:900;font-size:22px;white-space:nowrap;transform:translate(-50%,-50%);text-shadow:0 3px 0 rgba(0,0,0,.45),0 0 8px rgba(0,0,0,.3);animation:pop 1.3s ease-out forwards}
@keyframes pop{0%{transform:translate(-50%,-50%) scale(.4);opacity:0}12%{transform:translate(-50%,-50%) scale(1.25);opacity:1}25%{transform:translate(-50%,-60%) scale(1)}100%{transform:translate(-50%,-180%) scale(.95);opacity:0}}
.hud-banner{position:absolute;left:50%;top:24%;transform:translate(-50%,-50%);text-align:center;opacity:0;transition:opacity .25s}
.hud-banner.show{opacity:1;animation:bannerIn .5s ease-out}
.hud-banner .b1{font-size:52px;font-weight:900;letter-spacing:2px;text-shadow:0 4px 0 rgba(0,0,0,.5),0 0 20px rgba(0,0,0,.35)}
.hud-banner .b2{font-size:20px;font-weight:800;text-shadow:0 2px 0 rgba(0,0,0,.6);margin-top:4px}
@keyframes bannerIn{from{transform:translate(-50%,-50%) scale(1.6)}to{transform:translate(-50%,-50%) scale(1)}}
.hud-hint{position:absolute;left:50%;bottom:calc(92px + var(--remix-safe-bottom,0px));transform:translateX(-50%);font-weight:800;font-size:16px;background:rgba(0,0,0,.45);padding:5px 14px;border-radius:20px;display:none;white-space:nowrap}
.hud-cross{position:absolute;width:34px;height:34px;margin:-17px 0 0 -17px;display:none}
@media (max-width:1000px){.hud-job{min-width:220px;max-width:38vw;padding:5px 10px}.hud-job .t{font-size:14px}.hud-mut{min-width:140px;font-size:12px;padding:6px 8px}.hud-chip{font-size:18px;min-width:96px}.hud-ico{width:26px;height:26px;font-size:15px}.hud-map{width:120px;height:120px}.hud-meter{width:130px}}
@media (max-height:560px){.hud-map{width:110px;height:110px}.hud-banner .b1{font-size:36px}.card{padding:12px 18px}.keys{margin:6px 0}.logo{font-size:38px}}
.ov{position:fixed;inset:0;display:none;align-items:center;justify-content:center;pointer-events:auto;z-index:10;font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif;color:#fff}
.ov.show{display:flex}
.card{background:rgba(30,36,46,.9);border:3px solid rgba(255,255,255,.14);border-radius:18px;padding:22px 30px;box-shadow:0 10px 40px rgba(0,0,0,.5);max-width:min(720px,92vw);max-height:92vh;overflow:auto;text-align:center}
.logo{font-size:clamp(40px,7vw,78px);font-weight:900;line-height:.95;letter-spacing:2px;color:#ffb347;text-shadow:0 5px 0 #8a3d12,0 10px 20px rgba(0,0,0,.5);transform:rotate(-3deg)}
.logo b{color:#4fb0ff;text-shadow:0 5px 0 #173d7a,0 10px 20px rgba(0,0,0,.5)}
.tag{font-size:16px;color:#ffe2c0;margin:12px 0 4px;font-style:italic}
.seed{display:inline-block;margin:8px 0;padding:4px 12px;border-radius:20px;background:rgba(255,255,255,.1);font-weight:800;font-size:14px;letter-spacing:1px}
.muts{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0}
.muts span{background:rgba(255,180,70,.16);border:2px solid rgba(255,180,70,.5);border-radius:10px;padding:5px 10px;font-weight:800;font-size:14px}
.muts span.dz{background:rgba(255,80,60,.16);border-color:rgba(255,90,70,.55)}
.muts span.tr{background:rgba(80,170,255,.16);border-color:rgba(80,170,255,.55)}
.keys{display:grid;grid-template-columns:auto auto;gap:4px 14px;justify-content:center;text-align:left;font-size:14px;margin:12px 0;color:#dfe6ee}
.keys b{color:#fff;background:rgba(255,255,255,.12);border-radius:5px;padding:1px 7px;font-size:13px}
.btns{display:flex;gap:12px;justify-content:center;margin-top:14px;flex-wrap:wrap}
.btn{pointer-events:auto;cursor:pointer;border:none;border-radius:12px;padding:13px 26px;font:900 20px 'Trebuchet MS',system-ui,sans-serif;color:#fff;background:linear-gradient(#ff9a3c,#e8641c);box-shadow:0 5px 0 #9a3c0c,0 8px 18px rgba(0,0,0,.35);letter-spacing:1px}
.btn:hover{filter:brightness(1.1)}
.btn:active{transform:translateY(3px);box-shadow:0 2px 0 #9a3c0c}
.btn.alt{background:linear-gradient(#4fb0ff,#2a78d8);box-shadow:0 5px 0 #173d7a,0 8px 18px rgba(0,0,0,.35);font-size:16px}
.grade{font-size:110px;font-weight:900;line-height:1;margin:4px 0;text-shadow:0 6px 0 rgba(0,0,0,.45)}
.rtitle{font-size:22px;font-weight:900;color:#ffe2c0}
.stats{display:grid;grid-template-columns:1fr auto;gap:3px 26px;text-align:left;margin:14px auto;max-width:380px;font-size:15px}
.stats div:nth-child(even){text-align:right;font-weight:800}
.total{font-size:26px;font-weight:900;margin-top:6px}
.best{color:#9be84a;font-weight:900}
.stars{font-size:26px;color:#ffcf4a;letter-spacing:4px}
/* short landscape screens (phones): everything on one compact card, no scrolling */
@media (max-height:500px){
  .card{padding:10px 18px;max-height:calc(100vh - 12px);max-width:min(700px,calc(100vw - 150px));border-radius:14px}
  .logo{font-size:30px;line-height:1;transform:rotate(-2deg)}.logo br{display:none}.logo b{margin-left:10px}
  .tag{font-size:12px;margin:4px 0 2px}
  .seed{font-size:11px;margin:3px 0;padding:2px 10px}
  .muts{gap:5px;margin:3px 0}.muts span{font-size:11px;padding:2px 7px;border-radius:8px}
  .keys{grid-template-columns:auto auto auto auto;gap:2px 10px;font-size:11px;margin:4px 0}.keys b{font-size:10px;padding:1px 5px}
  .card > div[style]{font-size:11px !important}
  .btns{margin-top:6px;gap:8px}.btn{padding:8px 18px;font-size:16px}.btn.alt{font-size:13px}
  .grade{font-size:52px;margin:0}.rtitle{font-size:15px}.stars{font-size:17px}
  .stats{grid-template-columns:1fr auto 1fr auto;gap:1px 14px;font-size:11px;margin:5px auto;max-width:620px}
  .total{font-size:17px;margin-top:2px}
}
`,
  No = '<svg viewBox="0 0 56 56"><path d="M28 4 L50 40 L34 34 L34 52 L22 52 L22 34 L6 40 Z" fill="#39a7ff" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>',
  Uo = '<svg viewBox="0 0 34 34"><circle cx="17" cy="17" r="11" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M17 1v8M17 25v8M1 17h8M25 17h8" stroke="#fff" stroke-width="2.5"/><circle cx="17" cy="17" r="2" fill="#fff"/></svg>';
function U(a, t = "", e = "") {
  let i = document.createElement(a);
  return t && (i.className = t), e && (i.innerHTML = e), i;
}
var He = class {
  root = U("div");
  clock;
  boxes;
  money;
  chaos;
  mut = U("div", "hud-mut");
  job = U("div", "hud-job");
  jobT = U("div", "t");
  jobS = U("div", "s");
  jobBar = U("i");
  jobTm = U("div", "tm");
  health = U("i");
  boost = U("i");
  speed = U("div", "hud-speed");
  arrow = U("div", "hud-arrow", No + "<span></span>");
  cross = U("div", "hud-cross", Uo);
  banner = U("div", "hud-banner", '<div class="b1"></div><div class="b2"></div>');
  hint = U("div", "hud-hint");
  map = U("canvas", "hud-map");
  bannerTimer = 0;
  title = U("div", "ov");
  report = U("div", "ov");
  pause = U("div", "ov");
  loading = U("div", "ov show");
  playing = U("div");
  onStart = () => {};
  onReroll = () => {};
  onNext = () => {};
  onResume = () => {};
  constructor() {
    let t = U("style");
    t.textContent = Vo, document.head.append(t), this.root.id = "hud";
    let e = U("div", "hud-stats"),
      i = (r, d) => {
        let h = U("div", "hud-chip", `<div class="hud-ico" style="background:${r}">${d}</div><span></span>`);
        return e.append(h), h.querySelector("span");
      };
    this.clock = i("#d8463a", "\u23F0"), this.boxes = i("#d98a3a", "\u{1F4E6}"), this.money = i("#3e9a4a", "\u{1F4B5}"), this.chaos = i("#c8402a", "\u{1F4A5}");
    let s = U("div", "bar");
    s.append(this.jobBar), this.job.append(this.jobT, this.jobS, s, this.jobTm);
    let o = U("div", "hud-bottom"),
      n = (r, d, h) => {
        let c = U("div", "hud-meter", r),
          l = U("div", "bar");
        return d.style.background = h, l.append(d), c.append(l), c;
      };
    o.append(n("\u{1F4E6} FRAGILE-ISH", this.health, "linear-gradient(90deg,#e8b04a,#f3d27a)"), this.speed, n('\u{1F525} BOOST<span class="kd"> [SHIFT]</span>', this.boost, "linear-gradient(90deg,#ff6a2a,#ffb340)")), this.map.width = 340, this.map.height = 340, this.playing.append(e, this.mut, this.job, o, this.map, this.arrow, this.cross, this.banner, this.hint), this.root.append(this.playing), document.body.append(this.root, this.title, this.report, this.pause, this.loading), this.loading.innerHTML = '<div class="card"><div class="logo">CHAOS<br><b>COURIER</b></div><div class="tag" id="ld">Loading the city\u2026</div></div>', this.pause.innerHTML = '<div class="card"><div class="logo" style="font-size:48px">ON BREAK</div><div class="tag">Click to get back on the road</div></div>', this.pause.addEventListener("click", () => this.onResume()), this.showPlaying(!1);
  }
  setLoading(t) {
    let e = this.loading.querySelector("#ld");
    e && (e.textContent = t);
  }
  showPlaying(t) {
    this.playing.style.display = t ? "" : "none";
  }
  stats(t, e, i, s, o) {
    let n = Math.max(0, Math.floor(t / 60)),
      r = Math.max(0, Math.floor(t % 60));
    this.clock.textContent = `${String(n).padStart(2, "0")}:${String(r).padStart(2, "0")}`, this.clock.parentElement.style.color = t < 30 ? "#ff7a6a" : "", this.boxes.textContent = `${e}/${i}`, this.money.textContent = `$${s}`, this.chaos.textContent = `${o}`;
  }
  setJob(t, e, i, s, o) {
    this.jobT.textContent = t, this.jobS.textContent = e;
    let n = this.jobBar.parentElement;
    n.style.display = i === null ? "none" : "", i !== null && (this.jobBar.style.width = `${Math.max(0, Math.min(1, i)) * 100}%`, this.jobBar.style.background = i < 0.25 ? "linear-gradient(90deg,#e8463a,#ff8a5a)" : i < 0.5 ? "linear-gradient(90deg,#e8b03a,#ffd75a)" : ""), this.jobTm.textContent = s, this.jobTm.style.display = s ? "" : "none", this.jobTm.style.color = o ? "#ff7a6a" : "";
  }
  setMutators(t) {
    this.mut.innerHTML = "<h4>MUTATORS</h4>" + t.map(e => `<div class="${e.active ? "on" : e.kind === "forecast" ? "dim" : ""}">${e.icon} ${e.name}</div>`).join("");
  }
  meters(t, e, i) {
    this.health.style.width = `${Math.max(0, t) * 100}%`, this.health.style.background = t < 0.3 ? "linear-gradient(90deg,#e8463a,#ff8a5a)" : "linear-gradient(90deg,#e8b04a,#f3d27a)", this.boost.style.width = `${e * 100}%`, this.speed.innerHTML = `${Math.round(i)}<small>KM/H</small>`;
  }
  setArrow(t, e = 0, i = 0, s = 0, o = "", n = "#39a7ff") {
    if (this.arrow.style.display = t ? "block" : "none", !t) return;
    this.arrow.style.left = `${e}px`, this.arrow.style.top = `${i}px`;
    let r = this.arrow.querySelector("svg");
    r.style.transform = `rotate(${s}rad)`, r.querySelector("path").setAttribute("fill", n), this.arrow.querySelector("span").textContent = o;
  }
  setCross(t, e = 0, i = 0) {
    this.cross.style.display = t ? "block" : "none", t && (this.cross.style.left = `${e}px`, this.cross.style.top = `${i}px`);
  }
  setHint(t) {
    this.hint.style.display = t ? "block" : "none", this.hint.textContent = t;
  }
  popup(t, e, i, s = "#ffffff", o = 22) {
    let n = U("div", "hud-pop");
    n.textContent = t, n.style.left = `${e}px`, n.style.top = `${i}px`, n.style.color = s, n.style.fontSize = `${o}px`, this.root.append(n), setTimeout(() => n.remove(), 1300);
  }
  showBanner(t, e, i = "#ffcf4a", s = 2200) {
    this.banner.querySelector(".b1").textContent = t, this.banner.querySelector(".b1").style.color = i, this.banner.querySelector(".b2").textContent = e, this.banner.classList.remove("show"), this.banner.offsetWidth, this.banner.classList.add("show"), clearTimeout(this.bannerTimer), this.bannerTimer = window.setTimeout(() => this.banner.classList.remove("show"), s);
  }
  showTitle(t, e, i) {
    this.title.innerHTML = `<div class="card">
      <div class="logo">CHAOS<br><b>COURIER</b></div>
      <div class="tag">Every package arrives. Eventually. Mostly intact.</div>
      <div class="seed">TODAY'S CITY \xB7 SHIFT #${t}</div>
      <div class="muts">${e.map(s => `<span class="${s.kind === "disaster" || s.kind === "forecast" ? "dz" : s.kind === "traffic" ? "tr" : ""}" title="${s.desc}">${s.icon} ${s.name}</span>`).join("")}</div>
      <div class="keys k-touch">
        <span><b>\u25C0 \u25B6</b></span><span>Steer (left thumb)</span>
        <span><b>GAS</b> / <b>BRAKE</b></span><span>Drive and reverse (right thumb)</span>
        <span><b>BOOST</b> / <b>DRIFT</b></span><span>Go faster / slide the corners</span>
        <span><b>YEET</b></span><span>Throw the parcel at the reticle</span>
        <span><b>Drag</b></span><span>Swing the camera &amp; aim the throw</span>
      </div>
      <div class="keys k-desk">
        <span><b>W A S D</b> / <b>Arrows</b></span><span>Drive</span>
        <span><b>Space</b></span><span>Handbrake / drift</span>
        <span><b>Shift</b></span><span>Boost (smash stuff to refill)</span>
        <span><b>Click</b> / <b>E</b></span><span>Throw the package at the reticle</span>
        <span><b>Mouse</b></span><span>Orbit camera &amp; aim the throw</span>
        <span><b>R</b></span><span>Flip upright / un-stuck</span>
      </div>
      <div style="font-size:13px;color:#cfd8e3">Grab the package at the <b style="color:#ffb347">orange</b> marker, get it to the <b style="color:#4fb0ff">blue</b> one. 8 minute shift. Tips for speed, bonus for chaos.</div>
      ${i > 0 ? `<div style="margin-top:8px" class="best">Best day: ${i} pts</div>` : ""}
      <div class="btns"><button class="btn" id="go">CLOCK IN \u25B6</button><button class="btn alt" id="rr">\u{1F3B2} New City<span class="kd"> [N]</span></button></div>
    </div>`, this.title.querySelector("#go").addEventListener("click", s => {
      s.stopPropagation(), this.onStart();
    }), this.title.querySelector("#rr").addEventListener("click", s => {
      s.stopPropagation(), this.onReroll();
    }), this.title.classList.add("show");
  }
  hideOverlays() {
    this.title.classList.remove("show"), this.report.classList.remove("show"), this.pause.classList.remove("show"), this.loading.classList.remove("show");
  }
  showReport(t) {
    let e = {
      S: "#ffcf4a",
      A: "#9be84a",
      B: "#4fb0ff",
      C: "#e8e4dc",
      D: "#ff9a3c",
      F: "#ff5a4a"
    };
    this.report.innerHTML = `<div class="card">
      <div style="font-size:18px;font-weight:900;letter-spacing:3px;color:#cfd8e3">END OF SHIFT #${t.seed}</div>
      <div class="grade" style="color:${e[t.rating] ?? "#fff"}">${t.rating}</div>
      <div class="rtitle">${t.title}</div>
      <div class="stars">${"\u2605".repeat(t.stars)}${"\u2606".repeat(5 - t.stars)}</div>
      <div class="stats">
        <div>\u{1F4E6} Deliveries</div><div>${t.deliveries}${t.late ? ` (${t.late} late)` : ""}</div>
        <div>\u{1F4B5} Tips</div><div>$${t.tips}</div>
        <div>\u{1F4A5} Chaos points</div><div>${t.chaos}</div>
        <div>\u{1F6A7} Props flattened</div><div>${t.props}</div>
        <div>\u{1F697} Cars wrecked</div><div>${t.cars}</div>
        <div>\u{1FA82} Airtime</div><div>${t.air.toFixed(1)}s (best ${t.bestAir.toFixed(1)}s)</div>
        <div>\u{1F62C} Near misses</div><div>${t.nearMisses}</div>
        <div>\u{1F32A} Disasters survived</div><div>${t.disasters}</div>
        <div>\u{1F4C9} Packages destroyed</div><div>${t.destroyed}</div>
      </div>
      <div class="total">COURIER SCORE: ${t.score}</div>
      <div class="${t.newBest ? "best" : ""}" style="margin-top:4px">${t.newBest ? "\u{1F3C6} NEW PERSONAL BEST DAY!" : `Best day: ${t.best}`}</div>
      <div class="btns"><button class="btn" id="nx">NEXT SHIFT \u25B6</button></div>
    </div>`, this.report.querySelector("#nx").addEventListener("click", i => {
      i.stopPropagation(), this.onNext();
    }), this.report.classList.add("show");
  }
};
var Ko = [{
    id: "moon",
    icon: "\u{1F319}",
    name: "Moon Gravity",
    desc: "Everything floats a little too long"
  }, {
    id: "ice",
    icon: "\u{1F9CA}",
    name: "Ice Roads",
    desc: "Grip is a suggestion"
  }, {
    id: "bouncy",
    icon: "\u{1F3C0}",
    name: "Bouncy Cars",
    desc: "Traffic is made of rubber"
  }, {
    id: "heavy",
    icon: "\u{1F3CB}\uFE0F",
    name: "Heavy Van",
    desc: "You are the wrecking ball"
  }, {
    id: "turbo",
    icon: "\u{1F680}",
    name: "Turbo Van",
    desc: "Far too much engine"
  }],
  Xo = [{
    id: "double",
    icon: "\u{1F697}",
    name: "Double Traffic",
    desc: "Everyone is out today"
  }, {
    id: "buses",
    icon: "\u{1F68C}",
    name: "Bus Parade",
    desc: "So many buses"
  }, {
    id: "sunday",
    icon: "\u{1F422}",
    name: "Sunday Drivers",
    desc: "Traffic crawls"
  }],
  io = [{
    id: "meteor",
    icon: "\u2604\uFE0F",
    name: "Meteor Shower",
    desc: "Look up. Then floor it."
  }, {
    id: "donut",
    icon: "\u{1F369}",
    name: "Giant Donut",
    desc: "A runaway pastry is loose!"
  }, {
    id: "flood",
    icon: "\u{1F30A}",
    name: "Flash Flood",
    desc: "Roads are now rivers"
  }, {
    id: "tornado",
    icon: "\u{1F32A}\uFE0F",
    name: "Tornado",
    desc: "It wants your van"
  }],
  qo = ["400 rubber ducks", "one (1) live accordion", "artisanal gravel", "a suspiciously warm lasagna", "grandma's bowling ball", "9,000 googly eyes", "an anxious cactus", "a replacement replacement toaster", '"fragile" bricks', "a single sock", "a disco ball (assembled)", "emergency bagels", "a trombone, slightly bent", "six pounds of glitter", "a mystery humming box"],
  oe = !1,
  At = 480,
  ao = 10,
  ms = 5,
  no = "chaos-courier-best",
  rt = new b.Vector3(),
  vt = new b.Quaternion(),
  ro = new b.Vector3(0, 1, 0),
  ho = [new b.Vector3(1, 0, 0), new b.Vector3(-1, 0, 0), new b.Vector3(0, 1, 0), new b.Vector3(0, -1, 0), new b.Vector3(0, 0, 1), new b.Vector3(0, 0, -1)],
  q = {
    x: 0,
    z: 0,
    nx: 0,
    nz: 0,
    depth: 0,
    hit: !1,
    tag: ""
  },
  co = (a, t, e) => {
    let i = (t - a) % (Math.PI * 2);
    return i > Math.PI && (i -= Math.PI * 2), i < -Math.PI && (i += Math.PI * 2), a + i * e;
  };
function yt(a) {
  a.traverse(t => {
    let e = t;
    if (e.isMesh) {
      e.geometry.userData.shared || e.geometry.dispose();
      for (let i of [e.material].flat()) i.userData.shared || i.dispose();
    }
  }), a.clear();
}
var Pe = class {
    scene;
    camera;
    hud = new He();
    fx = new Se();
    engine = new ke();
    sun;
    run = new b.Group();
    city;
    rng;
    seed = 1;
    mode = "loading";
    keys = new Set();
    time = 0;
    P = {
      g: 32,
      grip: 10,
      accel: 26,
      max: 31,
      boostMax: 47,
      knock: 1,
      rest: 0.25,
      carTh: 4,
      busTh: 21,
      wallE: 0.25,
      boostRegen: 0.07
    };
    muts = [];
    traffic = null;
    deck = [];
    deckIdx = 0;
    van = {
      holder: new b.Group(),
      tilt: new b.Group(),
      roofPkg: new b.Group(),
      pos: new b.Vector3(),
      h: 0,
      vx: 0,
      vz: 0,
      vy: 0,
      air: !1,
      airT: 0,
      tumble: new b.Quaternion(),
      spin: new b.Vector3(),
      flipped: !1,
      flipT: 0,
      boost: 1,
      boosting: !1,
      lastGround: 0,
      sinkT: 0,
      hitCd: 0,
      height: 3,
      rCd: 0,
      launchCd: 0
    };
    cars = [];
    bodies = [];
    propGrid = new Map();
    disasters = [];
    geysers = [];
    craters = [];
    water;
    waterLevel = -1.2;
    waterBase = -1.2;
    job = {
      phase: "pickup",
      pickup: null,
      drop: null,
      limit: 60,
      left: 60,
      late: !1,
      content: ""
    };
    pkg = {
      state: "waiting",
      body: null,
      health: 1,
      waitObj: null
    };
    pickupMarker = new se(4);
    dropMarker = new se(ms);
    reticle;
    arc;
    stats = {
      deliveries: 0,
      late: 0,
      destroyed: 0,
      tips: 0,
      chaos: 0,
      props: 0,
      cars: 0,
      air: 0,
      bestAir: 0,
      nearMisses: 0,
      disasters: 0
    };
    combo = 0;
    comboT = 0;
    clock = At;
    elapsed = 0;
    nextDisaster = 35;
    best = 0;
    camYaw = 0;
    orbit = 0;
    pitch = 0.5;
    mouseIdle = 0;
    shake = 0;
    camPos = new b.Vector3(0, 80, -80);
    titleAngle = 0;
    carId = 0;
    mapBase = null;
    wasLocked = !1;
    mutT = 0;
    camDist = 18;
    scripted = !1;
    autopilot = null;
    camOverride = null;
    snapCamera = !1;
    showMarkers = !0;
    dbg = "";
    dbgDt = 0;
    constructor(t, e, i) {
      this.scene = t, this.camera = e, this.sun = i, t.add(this.run, this.fx.group);
      let s = new b.MeshStandardMaterial({
        color: "#4f8fa6",
        roughness: 0.38,
        metalness: 0.1,
        transparent: !0,
        opacity: 0.9
      });
      this.water = new b.Mesh(new b.PlaneGeometry(3e3, 3e3), s), this.water.rotation.x = -Math.PI / 2, this.water.position.y = this.waterBase, this.water.receiveShadow = !0, t.add(this.water), this.pickupMarker.setColor("#ffa53a", "#e86a10"), t.add(this.pickupMarker.group, this.dropMarker.group), this.reticle = new b.Mesh(new b.RingGeometry(1.1, 1.5, 32).rotateX(-Math.PI / 2), new b.MeshBasicMaterial({
        color: "#7cc8ff",
        transparent: !0,
        opacity: 0.9,
        depthWrite: !1,
        toneMapped: !1
      })), t.add(this.reticle);
      let o = new b.BufferGeometry().setFromPoints(Array.from({
        length: 24
      }, () => new b.Vector3()));
      this.arc = new b.Line(o, new b.LineDashedMaterial({
        color: "#8fd0ff",
        dashSize: 0.8,
        gapSize: 0.5,
        transparent: !0,
        opacity: 0.95,
        toneMapped: !1
      })), this.arc.frustumCulled = !1, t.add(this.arc), this.van.holder.add(this.van.tilt);
      let n = N.info?.initialGameState?.gameState?.best;
      this.best = typeof n == "number" ? n : Number(localStorage.getItem(no) ?? 0) || 0, this.hud.onStart = () => this.startShift(), this.hud.onReroll = () => this.newShift(Math.floor(Math.random() * 99999) + 1), this.hud.onNext = () => this.newShift(Math.floor(Math.random() * 99999) + 1), this.hud.onResume = () => this.resume(), window.addEventListener("keydown", r => {
        if (this.keys.add(r.code), (r.code === "Space" || r.code.startsWith("Arrow")) && r.preventDefault(), this.mode === "title" && r.code === "KeyN" && this.hud.onReroll(), this.mode === "title" && r.code === "Enter" && this.startShift(), this.mode === "play" && !this.scripted && r.code === "KeyE" && this.throwPackage(), this.mode === "play" && !this.scripted && r.code === "KeyR" && this.flipUpright(), oe && this.mode === "play" && (r.code === "F9" || r.code === "F7")) {
          let d = this.job.phase === "pickup" ? this.job.pickup : this.job.drop;
          this.resetVan(d.x + (r.code === "F9" ? 2 : 14), d.z, -Math.PI / 2), this.pitch = 0.82, this.orbit = 0;
        }
        oe && this.mode === "play" && r.code === "F10" && (this.nextDisaster = this.elapsed), oe && r.code === "F8" && this.mode === "title" && this.startShift(), oe && r.code === "F6" && this.mode === "play" && (this.elapsed = At - 0.5);
      }), window.addEventListener("keyup", r => this.keys.delete(r.code)), window.addEventListener("blur", () => this.keys.clear()), N.onLook((r, d) => {
        this.mode !== "play" || this.scripted || Math.abs(r) > 150 || Math.abs(d) > 150 || (this.orbit -= r * 0.004, this.pitch = b.MathUtils.clamp(this.pitch + d * 0.003, 0.22, 1), this.mouseIdle = 0);
      }), N.onPointerLock(r => {
        r && (this.wasLocked = !0), !r && this.wasLocked && this.mode === "play" && this.pauseGame();
      });
    }
    canvasClick() {
      this.mode !== "play" || this.scripted || (N.pointerLocked || N.lockPointer(document.body), this.throwPackage());
    }
    newShift(t) {
      this.seed = t, this.clearRun(), this.rng = te(t), this.city = oo(this.rng), this.run.add(this.city.group), this.buildPropGrid(), this.rollMutators(), this.van.holder.clear(), this.van.tilt.clear(), this.van.holder.add(this.van.tilt);
      let e = nt("van");
      this.van.tilt.add(e), this.van.height = ut.van?.size.y ?? 3.1, this.van.roofPkg = nt("package"), this.van.roofPkg.scale.multiplyScalar(1.5), this.van.roofPkg.position.set(0, this.van.height - 0.05, -0.8), this.van.roofPkg.visible = !1, this.van.tilt.add(this.van.roofPkg), this.run.add(this.van.holder), this.resetVan(this.city.depot.x + 3.5, this.city.depot.z + 15, Math.PI), this.spawnTraffic(), this.stats = {
        deliveries: 0,
        late: 0,
        destroyed: 0,
        tips: 0,
        chaos: 0,
        props: 0,
        cars: 0,
        air: 0,
        bestAir: 0,
        nearMisses: 0,
        disasters: 0
      }, this.clock = At, this.elapsed = 0, this.nextDisaster = 35, this.deckIdx = 0, this.combo = 0, this.waterBase = -1.2, this.waterLevel = -1.2, this.pkg = {
        state: "waiting",
        body: null,
        health: 1,
        waitObj: null
      }, this.job = {
        phase: "pickup",
        pickup: this.city.depot,
        drop: null,
        limit: 60,
        left: 60,
        late: !1,
        content: ""
      }, this.placeWaitingPackage(), this.pickupMarker.group.visible = !1, this.dropMarker.group.visible = !1, this.reticle.visible = !1, this.arc.visible = !1, this.mapBase = null, this.mode = "title", this.hud.hideOverlays(), this.hud.showPlaying(!1), this.hud.showTitle(t, this.mutatorViews(!0), this.best), this.engine.setMusic(0.12);
    }
    clearRun() {
      for (let t of this.disasters) t.dispose();
      this.disasters = [], this.cars = [], this.bodies = [], this.geysers = [], this.craters = [], this.fx.clear(), yt(this.run);
    }
    rollMutators() {
      let t = te(this.seed * 7919 + 13),
        e = t.shuffle([...Ko]);
      this.muts = e.slice(0, t.chance(0.45) ? 2 : 1), this.traffic = t.chance(0.65) ? t.pick(Xo) : null, this.deck = t.shuffle([...io]);
      let i = this.P = {
        g: 32,
        grip: 10,
        accel: 26,
        max: 31,
        boostMax: 47,
        knock: 1,
        rest: 0.25,
        carTh: 4,
        busTh: 21,
        wallE: 0.25,
        boostRegen: 0.07
      };
      for (let s of this.muts) s.id === "moon" && (i.g = 12), s.id === "ice" && (i.grip = 1.6), s.id === "bouncy" && (i.knock = 1.8, i.rest = 0.78, i.wallE = 0.65), s.id === "heavy" && (i.accel = 21, i.max = 29, i.carTh = 1.5, i.busTh = 9, i.knock = Math.max(i.knock, 1.4)), s.id === "turbo" && (i.accel = 36, i.max = 41, i.boostMax = 62, i.boostRegen = 0.2);
    }
    mutatorViews(t = !1) {
      let e = this.muts.map(s => ({
        ...s,
        kind: "physics"
      }));
      this.traffic && e.push({
        ...this.traffic,
        kind: "traffic"
      });
      for (let s of this.disasters) {
        let o = io.find(n => n.id === s.id);
        e.push({
          ...o,
          kind: "disaster",
          active: !0
        });
      }
      let i = this.deck[this.deckIdx % this.deck.length];
      return t ? e.push({
        icon: "\u26A0\uFE0F",
        name: `Forecast: ${this.deck.slice(0, 2).map(s => s.name).join(", ")}\u2026`,
        desc: "Disasters rotate through the shift",
        kind: "forecast"
      }) : e.push({
        icon: "\u23F3",
        name: `Next: ${i.name} ${Math.max(0, Math.ceil(this.nextDisaster - this.elapsed))}s`,
        desc: "",
        kind: "forecast"
      }), e;
    }
    startShift() {
      this.mode === "title" && (this.mode = "play", this.hud.hideOverlays(), this.hud.showPlaying(!0), this.engine.start(), this.engine.setMusic(0.28), document.body.classList.contains("touch") || N.lockPointer(document.body), this.camYaw = this.van.h, this.orbit = 0, this.pitch = 0.5, this.hud.showBanner("CLOCK IN!", "Grab your first package at the depot", "#ffb347"), G.pickup());
    }
    pauseGame() {
      this.scripted || (this.mode = "paused", this.hud.pause.classList.add("show"), this.keys.clear());
    }
    resume() {
      this.mode === "paused" && (this.mode = "play", this.hud.pause.classList.remove("show"), N.lockPointer(document.body));
    }
    endShift() {
      this.mode = "report", N.unlockPointer(), this.wasLocked = !1;
      let t = this.stats.tips + this.stats.chaos,
        e = t >= 520 ? "S" : t >= 400 ? "A" : t >= 290 ? "B" : t >= 190 ? "C" : t >= 100 ? "D" : "F",
        i = {
          S: "Agent of Pure Chaos",
          A: "Menace With a Clipboard",
          B: "Mostly-Licensed Courier",
          C: "Adequately Terrible",
          D: "Lost in the Mail",
          F: "Returned to Sender"
        },
        s = t > this.best;
      if (s) {
        this.best = t;
        try {
          localStorage.setItem(no, String(t));
        } catch {}
        N.saveState({
          best: t
        });
      }
      let o = Math.max(1, Math.min(5, 1 + Math.floor(this.stats.deliveries / 2) - this.stats.late - this.stats.destroyed));
      for (let n of this.disasters) n.dispose();
      this.disasters = [], this.waterLevel = -1.2, this.hud.showPlaying(!1), this.hud.showReport({
        ...this.stats,
        score: t,
        best: this.best,
        newBest: s,
        rating: e,
        title: i[e],
        stars: o,
        seed: this.seed
      }), G.alarm(), this.engine.setMusic(0.12);
    }
    buildPropGrid() {
      this.propGrid.clear();
      for (let t of this.city.props) {
        let e = this.gkey(t.x, t.z),
          i = this.propGrid.get(e);
        i || this.propGrid.set(e, i = []), i.push(t);
      }
    }
    gkey(t, e) {
      return (Math.floor(t / 12) + 100) * 1e3 + Math.floor(e / 12) + 100;
    }
    nearProps(t, e, i, s) {
      s.length = 0;
      let o = Math.floor((t - i) / 12),
        n = Math.floor((t + i) / 12),
        r = Math.floor((e - i) / 12),
        d = Math.floor((e + i) / 12);
      for (let h = o; h <= n; h++) for (let c = r; c <= d; c++) {
        let l = this.propGrid.get((h + 100) * 1e3 + c + 100);
        if (l) for (let p of l) p.alive && s.push(p);
      }
      return s;
    }
    resetVan(t, e, i) {
      let s = this.van;
      s.pos.set(t, pt(this.city, t, e, 5), e), s.h = i, s.vx = s.vz = s.vy = 0, s.air = !1, s.tumble.identity(), s.spin.set(0, 0, 0), s.flipped = !1, s.sinkT = 0, s.holder.visible = !0, this.camYaw = i;
    }
    desiredTraffic() {
      let t = this.elapsed / At,
        e = 26,
        i = 4;
      return this.traffic?.id === "double" && (e = 52, i = 7), this.traffic?.id === "buses" && (e = 16, i = 16), {
        cars: Math.round(e * (1 + t * 0.5)),
        buses: Math.round(i * (1 + t * 0.3))
      };
    }
    spawnTraffic() {
      let t = this.desiredTraffic();
      for (let e = 0; e < t.cars; e++) this.spawnCar("car", 25);
      for (let e = 0; e < t.buses; e++) this.spawnCar("bus", 25);
    }
    spawnCar(t, e) {
      for (let i = 0; i < 12; i++) {
        let s = this.rng.int(0, ot),
          o = this.rng.int(0, ot),
          n = this.neighbours(s, o, -1, -1),
          [r, d] = this.rng.pick(n),
          h = this.rng.range(8, Z - 8),
          c = {
            obj: nt(t, this.carId),
            kind: t,
            state: "drive",
            fi: s,
            fj: o,
            ti: r,
            tj: d,
            s: h,
            speed: 0,
            cruise: (t === "bus" ? this.rng.range(7, 9) : this.rng.range(9, 13.5)) * (this.traffic?.id === "sunday" ? 0.55 : 1),
            x: 0,
            z: 0,
            h: 0,
            y: 0,
            wait: 0,
            nearCd: 0,
            id: this.carId++
          },
          [l, p, f] = this.lanePos(c);
        if (!(Math.hypot(l - this.van.pos.x, p - this.van.pos.z) < e) && !this.cars.some(m => m.state === "drive" && Math.hypot(m.x - l, m.z - p) < 8)) {
          c.x = l, c.z = p, c.h = f, c.speed = c.cruise, c.obj.position.set(l, 0, p), c.obj.rotation.y = f, this.run.add(c.obj), this.cars.push(c);
          return;
        }
      }
    }
    neighbours(t, e, i, s) {
      let o = [];
      for (let [n, r] of [[t + 1, e], [t - 1, e], [t, e + 1], [t, e - 1]]) n < 0 || r < 0 || n > ot || r > ot || n === i && r === s || o.push([n, r]);
      return o.length ? o : [[i, s]];
    }
    lanePos(t) {
      let e = B(t.fi),
        i = B(t.fj),
        s = B(t.ti),
        o = B(t.tj),
        n = Math.sign(s - e),
        r = Math.sign(o - i);
      return [e + n * t.s - r * us, i + r * t.s + n * us, Math.atan2(n, r)];
    }
    updateTraffic(t) {
      let e = this.van,
        i = Math.hypot(e.vx, e.vz),
        s = this.waterLevel > 0.15;
      for (let r of this.cars) {
        if (r.state !== "drive") continue;
        if (r.parked) {
          r.speed = 0, r.obj.position.set(r.x, r.y, r.z), r.obj.rotation.set(0, r.h, 0);
          continue;
        }
        let d = Math.sin(r.h),
          h = Math.cos(r.h),
          c = !1,
          l = r.kind === "bus" ? 11 : 8.5,
          p = (P, C) => {
            let et = P - r.x,
              it = C - r.z,
              _ = et * d + it * h;
            return _ < 0.5 || _ > l ? !1 : Math.abs(et * h - it * d) < 2.1;
          };
        if (p(e.pos.x, e.pos.z) && (c = !0, r.wait > 0.6 && G.honk()), !c) {
          for (let P of this.cars) if (!(P === r || P.state !== "drive") && !(Math.abs(P.x - r.x) > l || Math.abs(P.z - r.z) > l) && p(P.x, P.z)) {
            c = !0;
            break;
          }
        }
        c ? r.wait += t : r.wait = 0, r.wait > 2.5 && (c = r.wait < 2.5 + 0.1), r.wait > 4 && (r.wait = 0);
        let f = c ? 0 : r.cruise * (s ? 0.45 : 1);
        if (r.speed += b.MathUtils.clamp(f - r.speed, -28 * t, 9 * t), r.s += r.speed * t, r.s >= Z) {
          r.s -= Z;
          let P = this.neighbours(r.ti, r.tj, r.fi, r.fj),
            C = P.find(([_, $]) => _ - r.ti === r.ti - r.fi && $ - r.tj === r.tj - r.fj),
            [et, it] = C && this.rng.chance(0.5) ? C : this.rng.pick(P);
          r.fi = r.ti, r.fj = r.tj, r.ti = et, r.tj = it;
        }
        let [m, u] = this.lanePos(r),
          v = Math.min(1, t * 7),
          E = (m - r.x) * v,
          j = (u - r.z) * v;
        if (r.x += E, r.z += j, E * E + j * j > 1e-6 && (r.h = co(r.h, Math.atan2(E, j), Math.min(1, t * 9))), r.y = s ? Math.max(0, this.waterLevel - 0.45) + Math.sin(this.time * 2 + r.id) * 0.12 : 0, r.obj.position.set(r.x, r.y, r.z), r.obj.rotation.set(s ? Math.sin(this.time * 1.7 + r.id) * 0.06 : 0, r.h, s ? Math.cos(this.time * 1.3 + r.id) * 0.06 : 0), r.nearCd -= t, i > 15 && r.nearCd <= 0 && !e.air) {
          let P = Math.hypot(r.x - e.pos.x, r.z - e.pos.z);
          P < (r.kind === "bus" ? 5.6 : 4.2) && P > 2.9 && (r.nearCd = 4, this.stats.nearMisses++, this.addChaos(1, "NEAR MISS!", r.x, 2, r.z, "#8fe0ff"), G.near());
        }
      }
      let o = this.desiredTraffic(),
        n = {
          car: 0,
          bus: 0
        };
      for (let r of this.cars) n[r.kind]++;
      n.car < o.cars && this.rng.chance(t * 2) && this.spawnCar("car", 70), n.bus < o.buses && this.rng.chance(t * 0.6) && this.spawnCar("bus", 70);
    }
    carCircles(t) {
      let e = Math.sin(t.h),
        i = Math.cos(t.h);
      return t.kind === "bus" ? [-3.4, 0, 3.4].map(s => [t.x + e * s, t.z + i * s, 1.5]) : [[t.x, t.z, 1.75]];
    }
    knockCar(t, e, i, s, o = 0, n = 0, r = 1) {
      if (t.state !== "drive") return;
      t.state = "body";
      let d = Math.sin(t.h) * t.speed,
        h = Math.cos(t.h) * t.speed,
        c = s * this.P.knock,
        l = this.makeBody(t.obj, t.kind, t.kind === "bus" ? 1.5 : 0.75, t.kind === "bus" ? 2.6 : 1.7, t.x, t.y + (t.kind === "bus" ? 1.5 : 0.75), t.z, t.h);
      l.vel.set(d * 0.4 + e * c * 0.85 + o, (4 + c * 0.32) * r * (t.kind === "bus" ? 0.6 : 1), h * 0.4 + i * c * 0.85 + n), l.ang.set(z(-1, 1), z(-1, 1), z(-1, 1)).multiplyScalar(Math.min(14, c * 0.35) * (t.kind === "bus" ? 0.4 : 1)), l.car = t, l.life = 16, l.smoke = 0, this.stats.cars++;
    }
    makeBody(t, e, i, s, o, n, r, d) {
      let h = new b.Group();
      t.removeFromParent(), t.position.set(0, -i, 0), t.rotation.set(0, 0, 0), h.add(t), h.position.set(o, n, r), this.run.add(h);
      let c = {
        obj: h,
        pos: new b.Vector3(o, n, r),
        vel: new b.Vector3(),
        ang: new b.Vector3(),
        quat: new b.Quaternion().setFromAxisAngle(ro, d),
        r: s,
        hh: i,
        kind: e,
        life: 7,
        settle: 0,
        grounded: !1,
        age: 0,
        car: null,
        wet: !1,
        smoke: 0
      };
      if (h.quaternion.copy(c.quat), this.bodies.push(c), this.bodies.length > 110) {
        let l = this.bodies.findIndex(p => p.kind === "prop");
        l >= 0 && this.removeBody(this.bodies[l]);
      }
      return c;
    }
    removeBody(t) {
      let e = this.bodies.indexOf(t);
      if (e >= 0 && this.bodies.splice(e, 1), t.obj.removeFromParent(), yt(t.obj), t.car) {
        let i = this.cars.indexOf(t.car);
        i >= 0 && this.cars.splice(i, 1);
      }
    }
    breakProp(t, e, i, s, o = !1, n = !0) {
      if (!t.alive) return;
      t.alive = !1;
      let r = Re[t.kind],
        d = t.kind === "cluster" || t.kind === "fruit",
        h = this.makeBody(t.mesh, "prop", r.h, r.r, t.x, t.y + r.h, t.z, t.mesh.rotation.y);
      h.vel.set(e * 1.05 + z(-2, 2), 3 + s * 0.25 + z(0, 3), i * 1.05 + z(-2, 2)), h.ang.set(z(-8, 8), z(-8, 8), z(-8, 8)), h.life = t.kind === "tree" ? 10 : 6, this.stats.props++, t.kind === "fruit" || t.kind === "cluster" ? this.fx.debris(t.x, t.y, t.z, 16, ["#f08a24", "#d93a2a", "#f0c030", "#8a5f32"], 7, 0.32) : t.kind === "tree" ? this.fx.debris(t.x, t.y + 2, t.z, 12, ["#5f8a34", "#6d9a3a", "#4f7a34"], 5, 0.45) : t.kind === "crate" ? this.fx.debris(t.x, t.y, t.z, 8, ["#c08a55", "#d9b07a"], 5, 0.3) : this.fx.debris(t.x, t.y, t.z, 6, ["#e8e2d6", "#9a9a96", "#e8742a"], 5, 0.22), t.kind === "hydrant" && this.geysers.push({
        x: t.x,
        z: t.z,
        t: 7
      }), o || G.smash(), n && (this.addChaos(r.chaos, d ? "SMASH!" : "", t.x, 1.5, t.z, "#ffd23a"), this.van.boost = Math.min(1, this.van.boost + (d ? 0.12 : 0.04)));
    }
    updateBodies(t) {
      let e = this.P,
        i = [];
      for (let s = this.bodies.length - 1; s >= 0; s--) {
        let o = this.bodies[s];
        o.age += t, o.vel.y -= e.g * t;
        let n = this.waterLevel - (o.pos.y - o.hh);
        n > 0 && this.waterLevel > -1 && (o.vel.y += e.g * 1.7 * Math.min(1, n / (o.hh * 2)) * t, o.vel.multiplyScalar(Math.exp(-1.6 * t)), !o.wet && o.vel.y < -4 && (this.fx.splash(o.pos.x, this.waterLevel, o.pos.z, 10, 4), G.splash()), o.wet = !0), o.pos.addScaledVector(o.vel, t);
        let r = o.ang.length();
        r > 0.001 && (vt.setFromAxisAngle(rt.copy(o.ang).divideScalar(r), r * t), o.quat.premultiply(vt));
        let d = pt(this.city, o.pos.x, o.pos.z, o.pos.y - o.hh);
        if (o.grounded = !1, o.pos.y - o.hh < d) if (o.pos.y = d + o.hh, o.vel.y < -3.5) o.vel.y < -10 && o.kind !== "prop" && (this.fx.dust(o.pos.x, d, o.pos.z, 5, 4), o.kind !== "package" && G.crash(0.3)), o.kind === "package" && this.damagePackage(Math.max(0, -o.vel.y - 16) * 0.012), o.vel.y *= -e.rest, o.ang.multiplyScalar(0.7), e.rest > 0.5 && o.kind !== "prop" && G.boing();else {
          o.vel.y = Math.max(0, o.vel.y), o.grounded = !0;
          let c = Math.exp(-(o.kind === "package" ? 3 : 4.5) * t);
          o.vel.x *= c, o.vel.z *= c, o.ang.multiplyScalar(Math.exp(-4 * t));
        }
        if (o.pos.y < -30 && (o.pos.y = -30), fs(this.city, o.pos.x, o.pos.z, Math.min(o.r, 1.6), o.pos.y - o.hh, q), q.hit) {
          o.pos.x = q.x, o.pos.z = q.z;
          let c = o.vel.x * q.nx + o.vel.z * q.nz;
          c < 0 && (o.vel.x -= (1 + e.rest) * c * q.nx, o.vel.z -= (1 + e.rest) * c * q.nz);
        }
        let h = o.vel.length();
        if (o.grounded && h < 1.2) {
          if (o.settle += t, o.settle > 0.3) {
            let c = ho[0],
              l = -2;
            for (let f of ho) {
              let m = rt.copy(f).applyQuaternion(o.quat).y;
              m > l && (l = m, c = f);
            }
            let p = rt.copy(c).applyQuaternion(o.quat);
            vt.setFromUnitVectors(p, ro).multiply(o.quat), o.quat.slerp(vt, Math.min(1, t * 4));
          }
        } else o.settle = 0;
        if (h > 8 && o.kind !== "package") {
          for (let c of this.cars) {
            if (c.state !== "drive") continue;
            let l = c.x - o.pos.x,
              p = c.z - o.pos.z,
              f = o.r + (c.kind === "bus" ? 3 : 1.8);
            if (l * l + p * p < f * f && Math.abs(o.pos.y - 1) < 3) {
              let m = Math.hypot(l, p) || 1;
              if (c.kind === "bus" && h < 18) continue;
              this.knockCar(c, l / m, p / m, h * 0.7), this.addChaos(2, "CHAIN REACTION!", c.x, 2, c.z, "#ff9a3c"), G.crash(0.6);
            }
          }
          if (o.kind !== "prop" || h > 12) for (let c of this.nearProps(o.pos.x, o.pos.z, o.r + 1, i)) {
            let l = Re[c.kind];
            Math.hypot(c.x - o.pos.x, c.z - o.pos.z) < o.r + l.r && o.pos.y - o.hh < c.y + 2 && h > l.breakSpeed && this.breakProp(c, o.vel.x * 0.6, o.vel.z * 0.6, h * 0.5, !0);
          }
        }
        if ((o.kind === "car" || o.kind === "bus") && (o.smoke -= t, o.smoke <= 0 && o.age < 9 && (o.smoke = 0.25, this.fx.smoke(o.pos.x, o.pos.y + 0.6, o.pos.z, 1, "#6e6660", 0.9, 2))), o.kind !== "package" && ((o.grounded || o.age > 12) && (o.life -= t), o.life < 1 && o.obj.scale.setScalar(Math.max(0.01, o.life)), o.life <= 0)) {
          this.removeBody(o);
          continue;
        }
        o.obj.position.copy(o.pos), o.obj.quaternion.copy(o.quat);
      }
    }
    updateVan(t) {
      let e = this.van,
        i = this.P,
        s = this.keys,
        o = this.autopilot,
        n = o ? o.throttle > 0 : s.has("KeyW") || s.has("ArrowUp"),
        r = o ? o.throttle < 0 : s.has("KeyS") || s.has("ArrowDown"),
        d = o ? o.steer : (s.has("KeyD") || s.has("ArrowRight") ? 1 : 0) - (s.has("KeyA") || s.has("ArrowLeft") ? 1 : 0),
        h = o ? o.hand : s.has("Space");
      e.boosting = (o ? o.boost : s.has("ShiftLeft") || s.has("ShiftRight")) && e.boost > 0.02 && n && !e.flipped, this.scripted && (e.boost = 1), e.hitCd -= t, e.rCd -= t, e.launchCd -= t;
      let c = Math.sin(e.h),
        l = Math.cos(e.h),
        p = -l,
        f = c,
        m = e.vx * c + e.vz * l,
        u = e.vx * p + e.vz * f,
        v = this.waterLevel > e.pos.y + 0.35;
      if (e.boosting ? e.boost = Math.max(0, e.boost - t * 0.33) : e.boost = Math.min(1, e.boost + t * i.boostRegen), e.flipped) e.flipT += t, m *= Math.exp(-3 * t), u *= Math.exp(-3 * t), e.flipT > 3.5 && this.flipUpright();else if (e.air) m *= Math.exp(-0.08 * t), e.h -= d * 1.4 * t, e.airT += t;else {
        let $ = e.boosting ? i.boostMax : i.max;
        v && ($ *= 0.5), n && (m < $ ? m += (e.boosting ? i.accel * 1.9 : i.accel) * t * (m < 0 ? 2 : 1) : m -= (m - $) * 2 * t), r && (m > 1 ? m -= 48 * t : m = Math.max(m - i.accel * 0.7 * t, -14)), !n && !r && (m *= Math.exp(-0.5 * t), m -= Math.sign(m) * Math.min(Math.abs(m), 3 * t));
        let Q = i.grip;
        h && (Q = Math.min(Q, 1.3)), v && (Q *= 0.35), u *= Math.exp(-Q * t), h && (m *= Math.exp(-0.7 * t));
        let ct = Math.abs(m),
          dt = 2.6 * Math.min(1, ct / 6) * (h ? 1.7 : 1) / (1 + ct / 55);
        e.h -= d * dt * t * (m < -0.5 ? -1 : 1), e.boosting && this.fx.fire(e.pos.x - c * 2.6, e.pos.y + 0.8, e.pos.z - l * 2.6, 1, 0.6), Math.abs(u) > 5 && ct > 8 && (this.fx.smoke(e.pos.x - c * 1.8 + p, e.pos.y + 0.2, e.pos.z - l * 1.8 + f, 1, "#e8e0d6", 0.7, 0.8), this.fx.smoke(e.pos.x - c * 1.8 - p, e.pos.y + 0.2, e.pos.z - l * 1.8 - f, 1, "#e8e0d6", 0.7, 0.8)), v && ct > 6 && Math.random() < 0.5 && this.fx.splash(e.pos.x - c * 2, this.waterLevel, e.pos.z - l * 2, 2, 2);
      }
      e.vx = c * m + p * u, e.vz = l * m + f * u, e.pos.x += e.vx * t, e.pos.z += e.vz * t;
      let E = Math.sin(e.h),
        j = Math.cos(e.h);
      for (let $ of [1.35, -1.35]) {
        let Q = e.pos.x + E * $,
          ct = e.pos.z + j * $;
        if (fs(this.city, Q, ct, 1.2, e.pos.y, q), !q.hit) continue;
        this.dbg = `wall:${q.tag} n:${q.nx.toFixed(2)},${q.nz.toFixed(2)} d:${q.depth.toFixed(2)}`, e.pos.x += q.x - Q, e.pos.z += q.z - ct;
        let dt = e.vx * q.nx + e.vz * q.nz;
        if (dt < 0) {
          e.vx -= (1 + i.wallE) * dt * q.nx, e.vz -= (1 + i.wallE) * dt * q.nz;
          let xt = -dt;
          xt > 9 && e.hitCd <= 0 && (e.hitCd = 0.3, G.crash(xt / 30), this.shake = Math.min(1.2, this.shake + xt * 0.03), this.fx.sparks(Q - q.nx * 1.2, e.pos.y + 1, ct - q.nz * 1.2, 14), this.fx.dust(Q - q.nx * 1.2, e.pos.y, ct - q.nz * 1.2, 4, 3), this.damagePackage((xt - 9) * 0.02), xt > 18 && this.popupAt("CRUNCH!", e.pos.x, e.pos.y + 3, e.pos.z, "#ff8a6a"));
          let Ge = E * q.nz - j * q.nx;
          e.h += Math.sign(Ge) * Math.min(0.25, xt * 0.004) * ($ > 0 ? 1 : -1);
        }
      }
      let P = Math.hypot(e.vx, e.vz);
      if (e.air) {
        e.vy -= i.g * t, e.pos.y += e.vy * t;
        let $ = e.spin.length();
        $ > 0.01 && (vt.setFromAxisAngle(rt.copy(e.spin).divideScalar($), $ * t), e.tumble.premultiply(vt));
        let Q = pt(this.city, e.pos.x, e.pos.z, e.pos.y);
        e.pos.y <= Q && this.land(Q);
      } else {
        let $ = pt(this.city, e.pos.x, e.pos.z, e.pos.y);
        $ < e.pos.y - 0.45 ? (e.air = !0, e.airT = 0, e.lastGround > 0.8 && e.launchCd <= 0 ? (e.vy = Math.max(e.vy, P * 0.42 * (i.g < 20 ? 0.8 : 1)), e.launchCd = 0.5, G.whoosh()) : e.vy = Math.min(e.vy, 3)) : (e.vy = b.MathUtils.clamp(($ - e.pos.y) / t, -20, P * 0.5), e.pos.y = $), e.lastGround = $;
      }
      if (e.pos.y < this.waterLevel - 1.2 && (Math.abs(e.pos.x) > S || Math.abs(e.pos.z) > S) && (e.sinkT === 0 && (this.fx.splash(e.pos.x, this.waterLevel, e.pos.z, 40, 8), G.splash(), this.popupAt("SPLASH! Tow fee -$5", e.pos.x, this.waterLevel + 3, e.pos.z, "#8fd0ff"), this.stats.tips = Math.max(0, this.stats.tips - 5)), e.sinkT += t, e.vx *= Math.exp(-3 * t), e.vz *= Math.exp(-3 * t), e.vy = Math.max(e.vy, -3), e.sinkT > 1.4)) {
        let $ = b.MathUtils.clamp(e.pos.x, -O, O),
          Q = b.MathUtils.clamp(e.pos.z, -O, O),
          ct = Math.abs($) > Math.abs(Q) ? Math.sign($) * O : B(Math.round(($ + O) / Z)),
          dt = Math.abs($) > Math.abs(Q) ? B(Math.round((Q + O) / Z)) : Math.sign(Q) * O;
        this.resetVan(ct, dt, Math.atan2(-ct, -dt));
      }
      for (let $ of this.geysers) Math.hypot($.x - e.pos.x, $.z - e.pos.z) < 2.2 && e.launchCd <= 0 && (e.air = !0, e.vy = Math.max(e.vy, 15), e.launchCd = 0.6, e.spin.set(z(-1, 1), 0, z(-1, 1)).multiplyScalar(3), this.addChaos(2, "GEYSER LAUNCH!", e.pos.x, 3, e.pos.z, "#8fd0ff"));
      this.vanVsTraffic(t), this.vanVsProps(), this.vanVsBodies();
      let C = Math.sin(e.h),
        et = Math.cos(e.h),
        it = 0,
        _ = 0;
      if (e.air) it = b.MathUtils.clamp(-e.vy * 0.015, -0.4, 0.4);else {
        let $ = pt(this.city, e.pos.x + C * 2, e.pos.z + et * 2, e.pos.y + 0.5),
          Q = pt(this.city, e.pos.x - C * 2, e.pos.z - et * 2, e.pos.y + 0.5);
        it = Math.atan2(Q - $, 4), _ = b.MathUtils.clamp(u * 0.012, -0.12, 0.12), e.flipped || e.tumble.slerp(vt.identity(), Math.min(1, t * 6));
      }
      e.holder.position.copy(e.pos), v && (e.holder.position.y += Math.sin(this.time * 3) * 0.08), e.holder.rotation.y = e.h, vt.setFromEuler(new b.Euler(it, 0, _)), e.tilt.quaternion.copy(e.tumble).multiply(vt), e.flipped ? e.tilt.position.y = 1 : e.tilt.position.y = 0, e.roofPkg.visible = this.pkg.state === "carried", e.roofPkg.rotation.set(Math.sin(this.time * 9) * 0.05 + u * 0.01, Math.sin(this.time * 3) * 0.1, Math.cos(this.time * 7) * 0.05);
    }
    land(t) {
      let e = this.van,
        i = -e.vy;
      e.pos.y = t, e.air = !1, e.vy = 0, e.spin.multiplyScalar(0);
      let s = rt.set(0, 1, 0).applyQuaternion(e.tumble).y;
      if (s < 0.35 && (e.flipped = !0, e.flipT = 0, this.popupAt("FLIPPED! [R]", e.pos.x, e.pos.y + 3, e.pos.z, "#ff8a6a"), G.crash(0.7)), i > 13 && (this.shake = Math.min(1.2, this.shake + i * 0.025), this.fx.dust(e.pos.x, t, e.pos.z, 10, 6), G.crash(Math.min(1, i / 30)), this.damagePackage((i - 13) * 0.012)), e.airT > 0.7) {
        this.stats.air += e.airT, this.stats.bestAir = Math.max(this.stats.bestAir, e.airT);
        let o = Math.floor(e.airT * 2);
        this.addChaos(o, `AIRTIME ${e.airT.toFixed(1)}s!`, e.pos.x, 3, e.pos.z, "#8fe0ff"), s > 0.6 && e.airT > 1.2 && this.addChaos(2, "STUCK THE LANDING", e.pos.x, 5, e.pos.z, "#9be84a");
      }
      e.airT = 0;
    }
    flipUpright() {
      let t = this.van;
      t.rCd > 0 || (t.rCd = 1, t.flipped = !1, t.tumble.identity(), t.spin.set(0, 0, 0), t.pos.y += 1.2, t.air = !0, t.vy = 3, this.fx.dust(t.pos.x, t.pos.y - 1, t.pos.z, 8, 3));
    }
    launchVan(t, e, i, s, o) {
      let n = this.van;
      n.launchCd > 0 || (n.launchCd = 0.4, n.vx += t * i, n.vz += e * i, n.vy = Math.max(n.vy, s), n.air = !0, n.airT = 0, n.spin.set(z(-1, 1), z(-0.3, 0.3), z(-1, 1)).normalize().multiplyScalar(o), this.shake = Math.min(1.5, this.shake + 0.6));
    }
    vanVsTraffic(t) {
      let e = this.van,
        i = Math.sin(e.h),
        s = Math.cos(e.h),
        o = [[e.pos.x + i * 1.35, e.pos.z + s * 1.35], [e.pos.x - i * 1.35, e.pos.z - s * 1.35]];
      for (let n of this.cars) {
        if (n.state !== "drive" || Math.abs(n.x - e.pos.x) > 9 || Math.abs(n.z - e.pos.z) > 9 || e.pos.y > n.y + (n.kind === "bus" ? 3.2 : 1.7)) continue;
        let r = !1;
        for (let [d, h, c] of this.carCircles(n)) {
          if (r) break;
          for (let [l, p] of o) {
            let f = d - l,
              m = h - p,
              u = Math.hypot(f, m);
            if (u >= c + 1.2 || u < 1e-4) continue;
            let v = f / u,
              E = m / u,
              j = Math.sin(n.h) * n.speed,
              P = Math.cos(n.h) * n.speed,
              C = (e.vx - j) * v + (e.vz - P) * E,
              et = n.kind === "bus" ? this.P.busTh : this.P.carTh,
              it = this.muts.some(_ => _.id === "heavy");
            if (C > et) {
              this.knockCar(n, v, E, C, e.vx * 0.45, e.vz * 0.45);
              let _ = (n.kind === "bus" ? 0.5 : 0.28) * (it ? 0.35 : 1);
              e.vx -= v * C * _, e.vz -= E * C * _, G.crash(Math.min(1, C / 25)), this.shake = Math.min(1.2, this.shake + C * 0.02), this.fx.sparks(l + v * 1.2, e.pos.y + 1, p + E * 1.2, 12), this.addChaos(n.kind === "bus" ? 8 : 3, n.kind === "bus" ? "BUS BOWLING!" : "WRECKED!", n.x, 2.5, n.z, "#ff9a3c"), this.van.boost = Math.min(1, this.van.boost + 0.15), this.damagePackage(Math.max(0, C - 14) * 0.015);
            } else {
              let _ = c + 1.2 - u;
              e.pos.x -= v * _, e.pos.z -= E * _, C > 0 && (e.vx -= v * C * (n.kind === "bus" ? 1.5 : 1.1), e.vz -= E * C * (n.kind === "bus" ? 1.5 : 1.1)), n.speed = 0, C > 2 && (G.crash(0.25), G.honk());
            }
            r = !0;
            break;
          }
        }
      }
    }
    vanVsProps() {
      let t = this.van,
        e = [],
        i = Math.hypot(t.vx, t.vz);
      for (let s of this.nearProps(t.pos.x, t.pos.z, 4, e)) {
        let o = Re[s.kind];
        if (t.pos.y > s.y + o.h * 2 + 0.5) continue;
        let n = Math.sin(t.h),
          r = Math.cos(t.h),
          d = 99,
          h = 0,
          c = 0;
        for (let l of [1.35, -1.35]) {
          let p = s.x - (t.pos.x + n * l),
            f = s.z - (t.pos.z + r * l),
            m = Math.hypot(p, f);
          m < d && (d = m, h = p, c = f);
        }
        if (!(d >= o.r + 1.2)) if (i >= o.breakSpeed) {
          this.breakProp(s, t.vx, t.vz, i);
          let l = s.kind === "tree" ? 0.75 : s.kind === "lamp" ? 0.88 : 0.97;
          t.vx *= l, t.vz *= l, (s.kind === "tree" || s.kind === "lamp") && (G.crash(0.4), this.shake = Math.min(1, this.shake + 0.2));
        } else {
          let l = d || 1,
            p = -h / l,
            f = -c / l,
            m = o.r + 1.2 - l;
          t.pos.x += p * m, t.pos.z += f * m;
          let u = t.vx * p + t.vz * f;
          u < 0 && (t.vx -= 1.3 * u * p, t.vz -= 1.3 * u * f);
        }
      }
    }
    vanVsBodies() {
      let t = this.van;
      for (let e of this.bodies) {
        if (e.kind === "package") continue;
        let i = e.pos.x - t.pos.x,
          s = e.pos.z - t.pos.z,
          o = e.r + 1.8;
        if (i * i + s * s > o * o || Math.abs(e.pos.y - t.pos.y - 1) > e.hh + 1.6) continue;
        let n = Math.hypot(i, s) || 1,
          r = i / n,
          d = s / n,
          h = (t.vx - e.vel.x) * r + (t.vz - e.vel.z) * d;
        if (h <= 0) continue;
        let c = e.kind === "bus" ? 0.3 : e.kind === "car" ? 0.7 : 1.6;
        e.vel.x += r * h * c, e.vel.z += d * h * c, e.vel.y += h * 0.15 * c, e.ang.x += z(-1, 1) * h * 0.2, e.ang.z += z(-1, 1) * h * 0.2, e.life = Math.max(e.life, 3);
        let l = e.kind === "prop" ? 0.05 : 0.35;
        t.vx -= r * h * l, t.vz -= d * h * l, e.kind !== "prop" && h > 6 && (G.crash(0.4), this.addChaos(1, "", e.pos.x, 2, e.pos.z));
      }
    }
    placeWaitingPackage() {
      let t = this.job.pickup,
        e = nt("package");
      e.scale.multiplyScalar(1.7), e.position.set(t.x, t.y, t.z), this.run.add(e), this.pkg.waitObj = e, this.pkg.state = "waiting", this.pkg.health = 1;
    }
    pickNextJob() {
      let t = this.van,
        e = this.city.pickups.filter(i => Math.hypot(i.x - t.pos.x, i.z - t.pos.z) > 40);
      this.job.pickup = this.rng.chance(0.3) ? this.city.depot : this.rng.pick(e.length ? e : this.city.pickups), this.job.phase = "pickup", this.job.drop = null, this.placeWaitingPackage();
    }
    startDelivery() {
      let t = this.job.pickup,
        e = this.city.drops.filter(r => {
          let d = Math.hypot(r.x - t.x, r.z - t.z);
          return d > 90 && d < 330;
        }),
        i = this.rng.pick(e.length ? e : this.city.drops),
        s = Math.abs(i.x - t.x) + Math.abs(i.z - t.z),
        o = this.elapsed / At,
        n = Math.max(25, (s / 10 + 18) * (1 - o * 0.25));
      this.job = {
        phase: "deliver",
        pickup: t,
        drop: i,
        limit: n,
        left: n,
        late: !1,
        content: this.rng.pick(qo)
      };
    }
    damagePackage(t) {
      t <= 0 || this.pkg.state === "waiting" || this.scripted || this.job.phase === "deliver" && (this.pkg.health -= t, this.pkg.health <= 0 && this.destroyPackage("PACKAGE DESTROYED!"));
    }
    destroyPackage(t) {
      let e = this.pkg.state === "loose" && this.pkg.body ? this.pkg.body.pos : this.van.pos;
      this.fx.debris(e.x, e.y + 2, e.z, 20, ["#c08a55", "#d9b07a", "#ffffff"], 8, 0.3), this.fx.confetti(e.x, e.y + 2, e.z, 20), this.pkg.body && (this.removeBody(this.pkg.body), this.pkg.body = null), this.stats.destroyed++, this.hud.showBanner(t, `Customer is NOT thrilled \xB7 head back to ${this.job.pickup.name}`, "#ff6a5a"), G.bad(), this.job.phase = "pickup", this.placeWaitingPackage();
    }
    throwPackage(t) {
      if (this.pkg.state !== "carried" || this.mode !== "play") return;
      let e = this.van,
        i = t ?? this.aimPoint(),
        s = e.pos.x,
        o = e.pos.y + e.height + 0.6,
        n = e.pos.z,
        r = i.x - s,
        d = i.z - n,
        h = i.y + 0.4 - o,
        c = Math.hypot(r, d),
        l = b.MathUtils.clamp(c / 24, 0.55, 1.3),
        p = nt("package");
      p.scale.multiplyScalar(1.5);
      let f = this.makeBody(p, "package", 0.55, 0.8, s, o, n, e.h);
      f.vel.set(r / l, (h + 0.5 * this.P.g * l * l) / l, d / l), f.ang.set(z(-6, 6), z(-3, 3), z(-6, 6)), this.pkg.body = f, this.pkg.state = "loose", G.whoosh(), this.popupAt("YEET!", s, o + 1, n, "#8fd0ff");
    }
    aimPoint() {
      let t = this.van,
        e = this.camYaw + this.orbit,
        i = (this.pitch - 0.22) / (1 - 0.22),
        s = b.MathUtils.lerp(34, 8, i),
        o = t.pos.x + Math.sin(e) * s,
        n = t.pos.z + Math.cos(e) * s;
      return new b.Vector3(o, pt(this.city, o, n, t.pos.y + 3), n);
    }
    updateJob(t) {
      let e = this.van,
        i = this.job,
        s = Math.hypot(e.vx, e.vz);
      if (i.phase === "pickup") {
        let o = i.pickup;
        this.pkg.waitObj && (this.pkg.waitObj.rotation.y += t * 1.5, this.pkg.waitObj.position.y = o.y + 0.3 + Math.abs(Math.sin(this.time * 3)) * 0.6), Math.hypot(o.x - e.pos.x, o.z - e.pos.z) < 5.5 && s < 28 && !e.flipped && (this.pkg.waitObj && (this.pkg.waitObj.removeFromParent(), yt(this.pkg.waitObj), this.pkg.waitObj = null), this.pkg.state = "carried", this.pkg.health = 1, this.startDelivery(), G.pickup(), this.hud.showBanner("GOT IT!", `Deliver ${i.content} \u2192 ${this.job.drop.name}`, "#ffb347", 2600), this.fx.confetti(e.pos.x, e.pos.y + 2, e.pos.z, 20));
      } else {
        i.left -= t, i.left <= 0 && !i.late && (i.late = !0, this.hud.showBanner("YOU'RE LATE!", "Tip gone. Deliver anyway \u2014 reputation is on the line", "#ff6a5a"), G.bad());
        let o = i.drop;
        if (this.pkg.state === "carried") Math.hypot(o.x - e.pos.x, o.z - e.pos.z) < ms && this.deliver(!1);else if (this.pkg.state === "loose" && this.pkg.body) {
          let n = this.pkg.body;
          Math.hypot(o.x - n.pos.x, o.z - n.pos.z) < ms && n.pos.y < o.y + 2.6 ? this.deliver(!0) : n.age > 0.6 && Math.hypot(n.pos.x - e.pos.x, n.pos.z - e.pos.z) < 3.6 && Math.abs(n.pos.y - e.pos.y) < 3.5 ? (this.removeBody(n), this.pkg.body = null, this.pkg.state = "carried", G.pickup()) : n.pos.y < this.waterLevel - 0.3 && (Math.abs(n.pos.x) > S || Math.abs(n.pos.z) > S) && this.destroyPackage("PACKAGE SANK!");
        }
      }
    }
    deliver(t) {
      let e = this.job,
        i = e.drop,
        s;
      e.late ? (s = 2, this.stats.late++) : s = 10 + Math.ceil(e.left * 0.55) + Math.floor(this.pkg.health * 6) + (t ? 8 : 0), this.stats.tips += s, this.stats.deliveries++, this.pkg.body && (this.removeBody(this.pkg.body), this.pkg.body = null), this.pkg.state = "waiting", this.fx.confetti(i.x, i.y, i.z, 70), G.delivered();
      let o = e.late ? ['"Finally."', '"Is this... mine?"', '"I moved here waiting."'] : t ? ['"Did you just throw that?!"', '"Nice arm!"', '"My window!"'] : ['"Wow, fast!"', '"Why is it smoking?"', '"Thanks... I think?"'];
      this.hud.showBanner(t ? `YEET DELIVERY! +$${s}` : `DELIVERED! +$${s}`, o[Math.floor(Math.random() * o.length)], e.late ? "#e8e4dc" : "#9be84a"), this.popupAt(`+$${s}`, i.x, i.y + 4, i.z, "#9be84a", 30), this.stats.deliveries === ao && this.popupAt("QUOTA MET!", i.x, i.y + 7, i.z, "#ffcf4a", 30), this.pickNextJob();
    }
    addChaos(t, e, i, s, o, n = "#ffd23a") {
      if (t <= 0) return;
      this.combo = this.comboT > 0 ? this.combo + 1 : 1, this.comboT = 2.5;
      let r = Math.min(5, 1 + Math.floor(this.combo / 5)),
        d = t * r;
      this.stats.chaos += d, e && this.popupAt(`${e} +${d}`, i, s, o, n), this.combo > 0 && this.combo % 5 === 0 && this.popupAt(`COMBO x${r}!`, i, s + 3, o, "#ff6ad5", 28);
    }
    project(t, e, i) {
      rt.set(t, e, i).project(this.camera);
      let s = rt.z > 1;
      return {
        x: (rt.x * 0.5 + 0.5) * window.innerWidth,
        y: (-rt.y * 0.5 + 0.5) * window.innerHeight,
        on: !s && Math.abs(rt.x) < 1 && Math.abs(rt.y) < 1,
        behind: s,
        nx: rt.x,
        ny: rt.y
      };
    }
    popupAt(t, e, i, s, o = "#fff", n = 22) {
      if (this.mode !== "play") return;
      let r = this.project(e, i, s);
      r.on && this.hud.popup(t, r.x, r.y, o, n);
    }
    startDisaster(t) {
      let e;
      t.id === "meteor" ? e = new ie(this) : t.id === "donut" ? e = new ae(this) : t.id === "flood" ? e = new ne(this) : e = new re(this), this.disasters.push(e), this.stats.disasters++, this.hud.showBanner(`${t.icon} ${t.name.toUpperCase()}!`, t.desc, "#ff6a4a", 3e3), G.alarm();
    }
    blast(t, e, i, s) {
      let o = this.van,
        n = Math.hypot(o.pos.x - t, o.pos.z - e);
      if (n < i && o.pos.y < 8) {
        let h = 1 - n / i,
          c = (o.pos.x - t) / (n || 1),
          l = (o.pos.z - e) / (n || 1);
        this.launchVan(c, l, 20 * h * s, 10 + 10 * h * s, 5 * h), this.damagePackage(0.3 * h), this.addChaos(3, "KABOOM!", o.pos.x, 4, o.pos.z, "#ff6a4a");
      }
      for (let h of this.cars) {
        if (h.state !== "drive") continue;
        let c = Math.hypot(h.x - t, h.z - e);
        if (c >= i) continue;
        let l = 1 - c / i;
        this.knockCar(h, (h.x - t) / (c || 1), (h.z - e) / (c || 1), (10 + 24 * l) * s, 0, 0, 1.6);
      }
      let r = [];
      for (let h of this.nearProps(t, e, i, r)) {
        let c = Math.hypot(h.x - t, h.z - e);
        if (c >= i * 0.85) continue;
        let l = 1 - c / i;
        this.breakProp(h, (h.x - t) / (c || 1) * 18 * l, (h.z - e) / (c || 1) * 18 * l, 30 * l, !0, !1);
      }
      for (let h of this.bodies) {
        let c = Math.hypot(h.pos.x - t, h.pos.z - e);
        if (c >= i) continue;
        let l = 1 - c / i;
        h.vel.x += (h.pos.x - t) / (c || 1) * 18 * l, h.vel.z += (h.pos.z - e) / (c || 1) * 18 * l, h.vel.y += 14 * l, h.ang.addScaledVector(rt.set(z(-1, 1), z(-1, 1), z(-1, 1)), 8 * l);
      }
      let d = Math.hypot(this.camera.position.x - t, this.camera.position.z - e);
      this.shake = Math.min(1.6, this.shake + Math.max(0, 1.2 - d / 80));
    }
    update(t) {
      if (this.dbgDt = t, this.time += t, this.fx.update(t), this.pickupMarker.update(t), this.dropMarker.update(t), this.mode === "play") {
        if (this.scripted || (this.elapsed += t), this.clock = At - this.elapsed, this.comboT -= t, this.mouseIdle += t, this.updateVan(t), this.updateTraffic(t), this.updateBodies(t), this.updateJob(t), this.elapsed >= this.nextDisaster && !this.scripted) {
          let s = this.deck[this.deckIdx % this.deck.length];
          this.disasters.some(n => n.id === s.id) && (this.deckIdx++, s = this.deck[this.deckIdx % this.deck.length]), this.disasters.some(n => n.id === s.id) || this.startDisaster(s), this.deckIdx++;
          let o = this.elapsed / At;
          this.nextDisaster = this.elapsed + b.MathUtils.lerp(62, 34, o);
        }
        for (let s of this.disasters) s.update(t);
        for (let s = this.disasters.length - 1; s >= 0; s--) {
          let o = this.disasters[s];
          o.done && (o.dispose(), this.disasters.splice(s, 1));
        }
        this.clock <= 0 && !this.scripted && (this.clock = 0, this.endShift());
      } else (this.mode === "title" || this.mode === "report") && (this.updateTraffic(t), this.updateBodies(t));
      for (let s = this.geysers.length - 1; s >= 0; s--) {
        let o = this.geysers[s];
        o.t -= t;
        for (let n = 0; n < 2; n++) this.fx.puffs.spawn(o.x + z(-0.3, 0.3), F + 0.5, o.z + z(-0.3, 0.3), z(-1, 1), z(10, 16), z(-1, 1), 1, z(0.3, 0.6), Math.random() < 0.5 ? "#e6f4ff" : "#9fd4f0", 0.4, 14, 0.2);
        o.t <= 0 && this.geysers.splice(s, 1);
      }
      for (let s = this.craters.length - 1; s >= 0; s--) {
        let o = this.craters[s];
        o.t -= t, Math.random() < t * 6 && this.fx.smoke(o.x, 0.6, o.z, 1, "#5a504a", 0.9, 1.6), o.t <= 0 && (o.obj.removeFromParent(), yt(o.obj), this.craters.splice(s, 1));
      }
      this.water.position.y = this.waterLevel + Math.sin(this.time * 0.8) * 0.04, this.updateMarkers(), this.updateCamera(t), this.updateHud();
      let e = this.van;
      this.engine.update(Math.hypot(e.vx, e.vz), this.keys.has("KeyW") || this.keys.has("ArrowUp"), e.boosting, this.mode === "play");
      let i = this.mode === "play" || this.mode === "paused" ? e.pos : rt.set(0, 0, 0);
      this.sun.position.set(i.x - 70, i.y + 75, i.z - 45), this.sun.target.position.copy(i), this.sun.target.updateMatrixWorld();
    }
    updateMarkers() {
      let t = (this.mode === "play" || this.mode === "paused") && this.showMarkers,
        e = this.job,
        i = t && e.phase === "pickup" && !!e.pickup;
      this.pickupMarker.group.visible = i, i && this.pickupMarker.group.position.set(e.pickup.x, e.pickup.y, e.pickup.z);
      let s = t && e.phase === "deliver" && !!e.drop;
      this.dropMarker.group.visible = s, s && this.dropMarker.group.position.set(e.drop.x, e.drop.y, e.drop.z);
      let o = this.mode === "play" && this.pkg.state === "carried" && !this.scripted;
      if (this.reticle.visible = o, this.arc.visible = o, o) {
        let n = this.van,
          r = this.aimPoint();
        this.reticle.position.set(r.x, r.y + 0.08, r.z), this.reticle.scale.setScalar(1 + Math.sin(this.time * 6) * 0.08);
        let d = n.pos.x,
          h = n.pos.y + n.height + 0.6,
          c = n.pos.z,
          l = r.x - d,
          p = r.z - c,
          f = r.y + 0.4 - h,
          m = b.MathUtils.clamp(Math.hypot(l, p) / 24, 0.55, 1.3),
          u = (f + 0.5 * this.P.g * m * m) / m,
          v = this.arc.geometry.getAttribute("position");
        for (let E = 0; E < v.count; E++) {
          let j = E / (v.count - 1) * m;
          v.setXYZ(E, d + l / m * j, h + u * j - 0.5 * this.P.g * j * j, c + p / m * j);
        }
        v.needsUpdate = !0, this.arc.computeLineDistances(), this.arc.geometry.computeBoundingSphere();
      }
    }
    updateCamera(t) {
      let e = this.camera,
        i = this.van;
      if (this.mode === "play" || this.mode === "paused") {
        let s = Math.hypot(i.vx, i.vz);
        this.camYaw = co(this.camYaw, i.h, 1 - Math.exp(-3.2 * t)), this.mouseIdle > 1.8 && s > 6 && !this.camOverride && (this.orbit *= Math.exp(-1.3 * t));
        let o = this.camOverride;
        o && (this.pitch = o.pitch);
        let n = o?.yaw ?? this.camYaw + (o?.orbit ?? this.orbit),
          r = o ? o.dist : 17 + s * 0.12,
          d = i.pos.x,
          h = Math.max(i.pos.y, this.waterLevel + 0.5) + 1.5,
          c = i.pos.z,
          l = Math.cos(this.pitch),
          p = r;
        for (let E = 0.2; E <= 1.0001; E += 0.1) {
          let j = d - Math.sin(n) * l * r * E,
            P = c - Math.cos(n) * l * r * E,
            C = h + (Math.sin(this.pitch) * r + 2) * E;
          if (pt(this.city, j, P, 999) > C - 1) {
            p = r * Math.max(0.25, E - 0.15);
            break;
          }
        }
        this.camDist += (p - this.camDist) * Math.min(1, t * (p < this.camDist ? 12 : 2));
        let f = this.camDist,
          m = rt.set(d - Math.sin(n) * l * f, h + Math.sin(this.pitch) * f + 2, c - Math.cos(n) * l * f);
        this.snapCamera ? (this.camPos.copy(m), this.camDist = p, this.snapCamera = !1) : this.camPos.lerp(m, 1 - Math.exp(-7 * t)), e.position.copy(this.camPos), this.shake *= Math.exp(-5 * t), this.shake > 0.01 && e.position.add(new b.Vector3(z(-1, 1), z(-1, 1), z(-1, 1)).multiplyScalar(this.shake)), e.lookAt(d + Math.sin(n) * 4, h, c + Math.cos(n) * 4);
        let v = (e.userData.baseFov ?? 50) + (i.boosting ? 8 : 0) + Math.min(6, s * 0.12);
        e.fov += (v - e.fov) * Math.min(1, t * 4), e.updateProjectionMatrix();
      } else {
        this.titleAngle += t * 0.05;
        let s = this.titleAngle;
        e.position.set(Math.cos(s) * 190, 135, Math.sin(s) * 190), e.lookAt(0, -10, 0), e.fov = e.userData.baseFov ?? 50, e.updateProjectionMatrix();
      }
    }
    updateHud() {
      if (this.mode !== "play" && this.mode !== "paused") return;
      let t = this.hud;
      t.stats(this.clock, this.stats.deliveries, ao, this.stats.tips, this.stats.chaos);
      let e = this.job;
      if (e.phase === "pickup") t.setJob("\u{1F4E6} PICK UP", `at ${e.pickup.name}`, null, "", !1);else {
        let h = Math.max(0, Math.ceil(e.left));
        t.setJob(e.late ? "\u231B LATE! DELIVER ANYWAY" : `\u{1F3E0} DELIVER: ${e.content}`, `to ${e.drop.name}`, e.late ? 0 : e.left / e.limit, e.late ? "" : `${Math.floor(h / 60)}:${String(h % 60).padStart(2, "0")}`, h < 10);
      }
      this.mutT -= 1 / 60, this.mutT <= 0 && (this.mutT = 0.5, t.setMutators(this.mutatorViews()));
      let i = this.van;
      t.meters(e.phase === "deliver" ? this.pkg.health : 1, i.boost, Math.hypot(i.vx, i.vz) * 3.2);
      let s = e.phase === "pickup" ? e.pickup : e.drop,
        o = e.phase === "deliver" && this.pkg.state === "loose" && this.pkg.body && Math.hypot(this.pkg.body.pos.x - s.x, this.pkg.body.pos.z - s.z) > 12 && Math.hypot(this.pkg.body.pos.x - i.pos.x, this.pkg.body.pos.z - i.pos.z) > 20 ? {
          x: this.pkg.body.pos.x,
          y: this.pkg.body.pos.y,
          z: this.pkg.body.pos.z,
          name: "your package"
        } : s,
        n = this.project(o.x, o.y + 3, o.z),
        r = Math.round(Math.hypot(o.x - i.pos.x, o.z - i.pos.z));
      if (n.on) t.setArrow(!1);else {
        let h = n.nx,
          c = n.ny;
        n.behind && (h = -h, c = -c);
        let l = Math.max(Math.abs(h), Math.abs(c)) || 1;
        h /= l, c /= l;
        let p = window.innerWidth,
          f = window.innerHeight,
          m = b.MathUtils.clamp((h * 0.5 + 0.5) * p, 190, p - 230),
          u = b.MathUtils.clamp((-c * 0.5 + 0.5) * f, 150, f - 120),
          v = Math.atan2(-c, h) + Math.PI / 2;
        t.setArrow(!0, m, u, v, `${r}m`, e.phase === "pickup" ? "#ffa53a" : "#39a7ff");
      }
      let d = "";
      i.flipped ? d = document.body.classList.contains("touch") ? "Tap FLIP to get back on your wheels" : "Press R to flip back over" : this.pkg.state === "carried" && e.phase === "deliver" && r < 45 ? d = document.body.classList.contains("touch") ? "Tap YEET to throw it onto the drop zone!" : "Click / E to YEET it onto the drop zone!" : this.pkg.state === "loose" && e.phase === "deliver" && (d = "Missed! Drive over the package to grab it again"), oe && (d = `${this.dbg} dt:${this.dbgDt.toFixed(3)} keys:${[...this.keys].join(",")} vf:${i.vx.toFixed(2)},${i.vz.toFixed(2)} y:${i.pos.y.toFixed(2)} air:${i.air} flip:${i.flipped} pos:${i.pos.x.toFixed(1)},${i.pos.z.toFixed(1)}`), t.setHint(d), this.drawMap();
    }
    drawMap() {
      let t = this.hud.map,
        e = t.getContext("2d"),
        i = t.width,
        s = i / (S * 2 + 20),
        o = c => (-c + S + 10) * s,
        n = c => (-c + S + 10) * s;
      if (!this.mapBase) {
        let c = document.createElement("canvas");
        c.width = c.height = i;
        let l = c.getContext("2d");
        l.fillStyle = "#3d7ea0", l.fillRect(0, 0, i, i), l.fillStyle = "#56524e", l.fillRect(o(S), n(S), S * 2 * s, S * 2 * s);
        for (let p of this.city.solids) {
          if (p.tag === "slab") l.fillStyle = "#b8a890";else if (p.tag === "building") l.fillStyle = "#a5694c";else if (p.tag === "house") l.fillStyle = "#c84a3a";else if (p.tag === "depot") l.fillStyle = "#3a6fc4";else if (p.tag === "ramp") l.fillStyle = "#e0b060";else continue;
          l.fillRect(o(p.maxX), n(p.maxZ), (p.maxX - p.minX) * s, (p.maxZ - p.minZ) * s);
        }
        this.mapBase = c;
      }
      e.drawImage(this.mapBase, 0, 0);
      let r = (c, l, p, f) => {
        e.beginPath(), e.arc(o(c), n(l), p, 0, Math.PI * 2), e.fillStyle = f, e.fill(), e.lineWidth = 3, e.strokeStyle = "#fff", e.stroke();
      };
      for (let c of this.disasters) {
        let l = c.where?.();
        l && r(l.x, l.z, 9, c.id === "donut" ? "#f07fae" : "#9a9088");
      }
      let d = this.job;
      d.phase === "pickup" ? r(d.pickup.x, d.pickup.z, 9 + Math.sin(this.time * 6) * 2, "#ffa53a") : r(d.drop.x, d.drop.z, 9 + Math.sin(this.time * 6) * 2, "#39a7ff"), this.pkg.state === "loose" && this.pkg.body && r(this.pkg.body.pos.x, this.pkg.body.pos.z, 5, "#c08a55");
      let h = this.van;
      e.save(), e.translate(o(h.pos.x), n(h.pos.z)), e.rotate(-h.h + Math.PI), e.beginPath(), e.moveTo(0, -14), e.lineTo(10, 11), e.lineTo(0, 6), e.lineTo(-10, 11), e.closePath(), e.fillStyle = "#ffffff", e.fill(), e.strokeStyle = "#1d3a6a", e.lineWidth = 3, e.stroke(), e.restore();
    }
  },
  ie = class {
    constructor(t) {
      this.g = t;
    }
    id = "meteor";
    done = !1;
    hold = !1;
    t = 0;
    dur = 24;
    spawnT = 1;
    meteors = [];
    update(t) {
      let e = this.g;
      if (this.t += t, this.spawnT -= t, this.t < this.dur && this.spawnT <= 0) {
        this.spawnT = z(0.45, 1);
        let i = e.van,
          s,
          o;
        Math.random() < 0.55 ? (s = i.pos.x + i.vx * 1.6 + z(-12, 12), o = i.pos.z + i.vz * 1.6 + z(-12, 12)) : (s = i.pos.x + z(-70, 70), o = i.pos.z + z(-70, 70)), this.drop(b.MathUtils.clamp(s, -S, S), b.MathUtils.clamp(o, -S, S), 2.1);
      }
      for (let i = this.meteors.length - 1; i >= 0; i--) {
        let s = this.meteors[i];
        s.t += t;
        let o = Math.min(1, s.t / s.T),
          n = s.sx + (s.tx - s.sx) * o,
          r = s.sy + (s.ty - s.sy) * o,
          d = s.sz + (s.tz - s.sz) * o;
        s.obj.position.set(n, r, d), s.obj.rotation.x += t * 3, s.obj.rotation.z += t * 2, e.fx.fire(n, r, d, 2, 1.6), Math.random() < 0.6 && e.fx.smoke(n, r, d, 1, "#4a4038", 1.4, 0.5);
        let h = s.warn.material;
        if (h.opacity = 0.35 + 0.35 * Math.sin(s.t * 18), s.warn.scale.setScalar(0.4 + o * 0.6), o >= 1) {
          e.fx.explosion(s.tx, s.ty, s.tz, 1.2), e.fx.debris(s.tx, s.ty, s.tz, 14, ["#4a3a30", "#2b2420", "#ff8a2a"], 10, 0.5), G.explosion(), e.blast(s.tx, s.tz, 12, 1), s.warn.removeFromParent(), yt(s.warn);
          let c = new b.Group(),
            l = new b.Mesh(new b.CircleGeometry(4.5, 20).rotateX(-Math.PI / 2), new b.MeshBasicMaterial({
              color: "#2a2018",
              transparent: !0,
              opacity: 0.75,
              depthWrite: !1
            }));
          l.position.y = 0.04, c.add(l), s.obj.scale.setScalar(0.55), s.obj.position.set(0, 0.4, 0), c.add(s.obj), c.position.set(s.tx, s.ty, s.tz), e.run.add(c), e.craters.push({
            obj: c,
            t: 14,
            x: s.tx,
            z: s.tz
          }), this.meteors.splice(i, 1);
        }
      }
      this.t >= this.dur && this.meteors.length === 0 && !this.hold && (this.done = !0);
    }
    drop(t, e, i) {
      let s = this.g,
        o = pt(s.city, t, e, 3),
        n = nt("meteor");
      if (gt("meteor")) {
        let r = new b.Group();
        n.position.y = -(ut.meteor?.size.y ?? 4) / 2, r.add(n), s.run.add(r), this.push(r, t, o, e, i);
      } else s.run.add(n), this.push(n, t, o, e, i);
    }
    push(t, e, i, s, o) {
      let n = new b.Mesh(new b.RingGeometry(7, 9, 32).rotateX(-Math.PI / 2), new b.MeshBasicMaterial({
        color: "#ff3a2a",
        transparent: !0,
        opacity: 0.5,
        depthWrite: !1,
        toneMapped: !1
      }));
      n.position.set(e, i + 0.1, s), this.g.run.add(n);
      let r = z(0, Math.PI * 2),
        d = o / 2.1;
      this.meteors.push({
        obj: t,
        warn: n,
        sx: e + Math.cos(r) * 50 * d,
        sy: 10 + 100 * d,
        sz: s + Math.sin(r) * 50 * d,
        tx: e,
        ty: i,
        tz: s,
        t: 0,
        T: o
      });
    }
    dispose() {
      for (let t of this.meteors) t.obj.removeFromParent(), yt(t.obj), t.warn.removeFromParent(), yt(t.warn);
      this.meteors = [];
    }
  },
  ae = class {
    constructor(t, e) {
      this.g = t;
      let i = Math.random() < 0.5,
        s = B(Math.floor(z(1, ot))),
        o = Math.random() < 0.5 ? 1 : -1;
      i ? (this.x = -o * (S + 30), this.z = s, this.dx = o, this.dz = 0) : (this.x = s, this.z = -o * (S + 30), this.dx = 0, this.dz = o), e && (this.x = e.x, this.z = e.z, this.dx = e.dx, this.dz = e.dz, this.speed = e.speed, this.turns = 3, this.inside = !0);
      let n = nt("donut"),
        r = new b.Group();
      if (gt("donut")) {
        let d = ut.donut.size;
        n.position.y = -d.y / 2, r.add(n), d.y < Math.max(d.x, d.z) * 0.7 ? r.rotation.z = Math.PI / 2 : d.x < d.z ? r.rotation.y = 0 : r.rotation.y = Math.PI / 2;
      } else r.add(n);
      this.roller.add(r), this.obj.add(this.roller), t.run.add(this.obj);
    }
    id = "donut";
    done = !1;
    obj = new b.Group();
    roller = new b.Group();
    x;
    z;
    dx;
    dz;
    speed = 17;
    turns = 0;
    inside = !1;
    roll = 0;
    R = 9;
    lastCross = 999;
    hitCd = 0;
    where() {
      return {
        x: this.x,
        z: this.z
      };
    }
    update(t) {
      let e = this.g;
      this.hitCd -= t, this.x += this.dx * this.speed * t, this.z += this.dz * this.speed * t, this.roll += this.speed * t / this.R;
      let i = Math.abs(this.x) < S && Math.abs(this.z) < S;
      i && (this.inside = !0);
      let s = this.dx !== 0 ? this.x : this.z,
        o = B(Math.round((s + O) / Z)),
        n = Math.abs(s - o);
      n < 0.6 && this.lastCross !== o && Math.abs(o) < O && this.turns < 3 && Math.random() < 0.3 ? (this.lastCross = o, this.dx !== 0 ? (this.x = o, this.dz = Math.random() < 0.5 ? 1 : -1, this.dx = 0) : (this.z = o, this.dx = Math.random() < 0.5 ? 1 : -1, this.dz = 0), this.turns++) : n < 0.6 && (this.lastCross = o);
      let r = Math.abs(Math.sin(this.roll * 2)) * 0.5,
        d = this.inside && !i ? Math.max(-12, this.obj.position.y - this.R - t * 12) : 0;
      this.obj.position.set(this.x, d + this.R + r, this.z), this.obj.rotation.y = Math.atan2(this.dx, this.dz), this.roller.rotation.x = this.roll, i && Math.random() < 0.5 && e.fx.dust(this.x - this.dx * 6, 0.2, this.z - this.dz * 6, 1, 3), this.inside && !i && this.obj.position.y < 0 && (e.fx.splash(this.x, e.waterLevel, this.z, 50, 12), G.splash(), this.done = !0), (Math.abs(this.x) > S + 80 || Math.abs(this.z) > S + 80) && (this.done = !0);
      let h = -this.dz,
        c = this.dx,
        l = (u, v, E) => {
          let j = u - this.x,
            P = v - this.z,
            C = j * this.dx + P * this.dz,
            et = j * h + P * c;
          return Math.abs(C) < this.R - 1 + E && Math.abs(et) < 4 + E ? Math.sign(et) || 1 : 0;
        },
        p = e.van,
        f = l(p.pos.x, p.pos.z, 1.2);
      f && this.hitCd <= 0 && p.pos.y < 14 && (this.hitCd = 1.2, e.launchVan(this.dx * 0.8 + h * f * 0.6, this.dz * 0.8 + c * f * 0.6, 28, 16, 6), e.damagePackage(0.2), e.addChaos(4, "DONUT'D!", p.pos.x, 4, p.pos.z, "#f07fae"), G.crash(1));
      for (let u of e.cars) {
        if (u.state !== "drive") continue;
        let v = l(u.x, u.z, 1.5);
        v && (e.knockCar(u, this.dx * 0.7 + h * v * 0.7, this.dz * 0.7 + c * v * 0.7, 30, 0, 0, 1.4), G.crash(0.6));
      }
      let m = [];
      for (let u of e.nearProps(this.x, this.z, this.R + 2, m)) {
        let v = l(u.x, u.z, 1);
        v && e.breakProp(u, this.dx * 14 + h * v * 8, this.dz * 14 + c * v * 8, 20, !0, !1);
      }
      for (let u of e.bodies) {
        let v = l(u.pos.x, u.pos.z, u.r);
        v && u.pos.y < this.R * 2 && (u.vel.x = this.dx * 22 + h * v * 10, u.vel.z = this.dz * 22 + c * v * 10, u.vel.y = Math.max(u.vel.y, 10));
      }
    }
    dispose() {
      this.obj.removeFromParent(), yt(this.obj);
    }
  },
  ne = class {
    constructor(t) {
      this.g = t;
    }
    id = "flood";
    done = !1;
    t = 0;
    top = 0.95;
    update(t) {
      let e = this.g;
      this.t += t;
      let i = 6,
        s = 20,
        o = 6,
        n;
      if (this.t < i ? n = b.MathUtils.lerp(-1.2, this.top, this.t / i) : this.t < i + s ? n = this.top : n = b.MathUtils.lerp(this.top, -1.2, Math.min(1, (this.t - i - s) / o)), e.waterLevel = n, this.t > i && this.t < i + s) for (let r of e.cars) r.state === "drive" && Math.random() < t * 0.04 && (e.knockCar(r, z(-1, 1), z(-1, 1), 3, 0, 0, 0.3), r.speed = 0);
      this.t > i + s + o && (e.waterLevel = -1.2, this.done = !0);
    }
    dispose() {
      this.g.waterLevel = -1.2;
    }
  },
  re = class {
    constructor(t, e) {
      this.g = t;
      let i = z(0, Math.PI * 2);
      this.x = t.van.pos.x + Math.cos(i) * 90, this.z = t.van.pos.z + Math.sin(i) * 90, this.x = b.MathUtils.clamp(this.x, -O, O), this.z = b.MathUtils.clamp(this.z, -O, O), e && (this.x = e.x, this.z = e.z, this.t = 2.2);
      let s = [[1.2, 0], [2.2, 4], [3.6, 10], [6, 18], [9, 26], [13, 34]].map(([o, n]) => new b.Vector2(o, n));
      for (let o = 0; o < 3; o++) {
        let n = new b.Mesh(new b.LatheGeometry(s, 20), new b.MeshStandardMaterial({
          color: o === 0 ? "#9a8c80" : "#c2b4a4",
          transparent: !0,
          opacity: 0.35 - o * 0.07,
          side: b.DoubleSide,
          depthWrite: !1,
          flatShading: !0,
          roughness: 1
        }));
        n.scale.setScalar(1 + o * 0.18), this.layers.push(n), this.obj.add(n);
      }
      this.junk = new b.InstancedMesh(new b.BoxGeometry(0.8, 0.8, 0.8), new b.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 1
      }), 50);
      for (let o = 0; o < 50; o++) this.junkState.push({
        a: z(0, 6.3),
        h: z(0, 32),
        r: 0,
        s: z(2, 4)
      }), this.junk.setColorAt(o, new b.Color(["#7a6a58", "#c08a55", "#5f8a34", "#9a9a96"][o % 4]));
      this.obj.add(this.junk), this.obj.scale.setScalar(0.1), t.run.add(this.obj);
    }
    id = "tornado";
    done = !1;
    t = 0;
    dur = 30;
    x;
    z;
    obj = new b.Group();
    layers = [];
    junk;
    junkState = [];
    rideCd = 0;
    where() {
      return {
        x: this.x,
        z: this.z
      };
    }
    update(t) {
      let e = this.g;
      this.t += t;
      let i = e.van,
        s = i.pos.x - this.x,
        o = i.pos.z - this.z,
        n = Math.hypot(s, o) || 1,
        r = 8.5;
      this.x += s / n * r * t + Math.sin(this.t * 0.7) * 4 * t, this.z += o / n * r * t + Math.cos(this.t * 0.9) * 4 * t;
      let d = Math.min(1, this.t / 2) * Math.min(1, Math.max(0, (this.dur - this.t) / 2));
      this.obj.scale.setScalar(Math.max(0.05, d)), this.obj.position.set(this.x, 0, this.z), this.layers.forEach((p, f) => {
        p.rotation.y += t * (3 + f * 1.5);
      });
      let h = new b.Matrix4();
      for (let p = 0; p < 50; p++) {
        let f = this.junkState[p];
        f.a += t * f.s, f.h = (f.h + t * 4) % 32;
        let m = 2 + f.h * 0.33;
        h.makeRotationY(f.a * 3), h.setPosition(Math.cos(f.a) * m, f.h, Math.sin(f.a) * m), this.junk.setMatrixAt(p, h);
      }
      if (this.junk.instanceMatrix.needsUpdate = !0, Math.random() < 0.8 && e.fx.dust(this.x, 0.3, this.z, 2, 7), d < 0.5) {
        this.t > this.dur && (this.done = !0);
        return;
      }
      let c = 22;
      if (n < c && !i.flipped) {
        let p = 1 - n / c,
          f = -o / n,
          m = s / n;
        i.vx += (-s / n * 16 + f * 12) * p * t, i.vz += (-o / n * 16 + m * 12) * p * t, this.rideCd -= t, n < 6.5 && this.rideCd <= 0 && (this.rideCd = 4, e.launchVan(f, m, 16, 20, 7), e.addChaos(5, "TORNADO RIDE!", i.pos.x, 5, i.pos.z, "#cfd8e3"), e.damagePackage(0.15));
      }
      for (let p of e.cars) {
        if (p.state !== "drive") continue;
        let f = Math.hypot(p.x - this.x, p.z - this.z);
        f < 12 && e.knockCar(p, (this.x - p.x) / f, (this.z - p.z) / f, 6, 0, 0, 2);
      }
      let l = [];
      for (let p of e.nearProps(this.x, this.z, 10, l)) Math.hypot(p.x - this.x, p.z - this.z) < 9 && e.breakProp(p, 0, 0, 10, !0, !1);
      for (let p of e.bodies) {
        let f = p.pos.x - this.x,
          m = p.pos.z - this.z,
          u = Math.hypot(f, m) || 1;
        if (u > c) continue;
        let v = 1 - u / c,
          E = -m / u,
          j = f / u;
        p.vel.x += (-f / u * 20 + E * 26) * v * t, p.vel.z += (-m / u * 20 + j * 26) * v * t, u < 9 && p.pos.y < 26 && (p.vel.y += e.P.g * 1.6 * t), p.pos.y > 24 && (p.vel.x += f / u * 30 * t, p.vel.z += m / u * 30 * t), p.ang.y += t * 4, p.life = Math.max(p.life, 2);
      }
      this.t > this.dur && (this.done = !0);
    }
    dispose() {
      this.obj.removeFromParent(), yt(this.obj);
    }
  };
import * as Le from "three";
var Ce = [{
    id: "clockin",
    title: "Clock in",
    durationMs: 2200,
    speed: 14,
    boost: !0,
    moment: "The van boosts out of the depot through a wall of parcels and T-bones a parked car",
    camera: {
      orbit: 0.35,
      pitch: 0.42,
      dist: 15
    }
  }, {
    id: "ramp",
    title: "Stunt ramp",
    durationMs: 3e3,
    speed: 36,
    boost: !1,
    moment: "Full speed off a plywood road ramp, big airtime, landing on a row of parked cars",
    phys: {
      g: 20,
      max: 38
    },
    camera: {
      orbit: 0.75,
      pitch: 0.4,
      dist: 22
    }
  }, {
    id: "rampage",
    title: "Sidewalk shortcut",
    durationMs: 2500,
    speed: 34,
    boost: !0,
    moment: "Taking the sidewalk: fruit stands, cones, bins and a hydrant geyser all go flying",
    camera: {
      orbit: -0.95,
      pitch: 0.38,
      dist: 15
    }
  }, {
    id: "bowling",
    title: "Bus bowling",
    durationMs: 2500,
    speed: 40,
    boost: !0,
    moment: "Boosting straight into a bus parked across the road with cars stacked behind it like pins",
    phys: {
      knock: 1.7,
      busTh: 14
    },
    camera: {
      orbit: 0.5,
      pitch: 0.36,
      dist: 17
    }
  }, {
    id: "yeet",
    title: "Yeet delivery",
    durationMs: 3e3,
    speed: 16,
    boost: !1,
    moment: "Driving past a customer and throwing the parcel over the fence onto the drop zone \u2014 confetti",
    phys: {
      max: 17
    },
    camera: {
      orbit: 0,
      pitch: 0.62,
      dist: 22,
      look: "house"
    },
    events: [{
      at: 0.45,
      kind: "throw"
    }]
  }, {
    id: "meteor",
    title: "Meteor shower",
    durationMs: 3e3,
    speed: 30,
    boost: !1,
    moment: "Meteors pound the street around the van, flinging parked cars, until one launches the van",
    camera: {
      orbit: 0.25,
      pitch: 0.62,
      dist: 24
    },
    events: [{
      at: 0,
      kind: "meteor",
      ahead: 26,
      side: 4,
      T: 0.9
    }, {
      at: 0.45,
      kind: "meteor",
      ahead: 44,
      side: -4,
      T: 0.9
    }, {
      at: 0.9,
      kind: "meteor",
      ahead: 62,
      side: 5,
      T: 0.9
    }, {
      at: 1.5,
      kind: "meteor",
      ahead: 74,
      side: -2.5,
      T: 0.8
    }, {
      at: 2,
      kind: "meteor",
      ahead: 30,
      side: 9,
      T: 0.7
    }]
  }, {
    id: "donut",
    title: "Giant donut",
    durationMs: 3e3,
    speed: 20,
    boost: !1,
    moment: "A giant frosted donut rolls down the avenue flattening traffic and catches the fleeing van",
    phys: {
      max: 21
    },
    camera: {
      orbit: 0.85,
      pitch: 0.3,
      dist: 30,
      look: "back"
    }
  }, {
    id: "tornado",
    title: "Tornado",
    durationMs: 2600,
    speed: 20,
    boost: !1,
    moment: "A tornado swallows parked cars and crates, then picks up the van and spins it",
    camera: {
      orbit: 0.3,
      pitch: 0.4,
      dist: 36
    }
  }, {
    id: "flood",
    title: "Flash flood",
    durationMs: 2400,
    speed: 30,
    boost: !0,
    moment: "Ploughing through a flooded street, spray everywhere, cars bobbing past",
    camera: {
      orbit: 0.55,
      pitch: 0.34,
      dist: 15
    }
  }, {
    id: "splash",
    title: "Tow fee",
    durationMs: 2800,
    speed: 31,
    boost: !1,
    moment: "One last ramp at the edge of the island \u2014 big air, straight into the harbour",
    phys: {
      g: 30,
      max: 32
    },
    camera: {
      orbit: 0.55,
      pitch: 0.38,
      dist: 30,
      look: "back"
    }
  }],
  qi = Ce.reduce((a, t) => a + t.durationMs, 0);
var Wo = {
    g: 32,
    grip: 10,
    accel: 26,
    max: 31,
    boostMax: 47,
    knock: 1,
    rest: 0.25,
    carTh: 4,
    busTh: 21,
    wallE: 0.25,
    boostRegen: 0.07
  },
  Ae = class {
    constructor(t) {
      this.g = t;
      this.flash.style.cssText = "position:fixed;inset:0;background:#fff8e8;opacity:0;pointer-events:none;z-index:50", document.body.append(this.flash);
    }
    active = !1;
    pending = !1;
    idx = -1;
    t = 0;
    shot = null;
    prevSeed = 1;
    origRandom = Math.random;
    heading = 0;
    fired = new Set();
    meteor = null;
    origin = {
      x: 0,
      z: 0
    };
    fwd = {
      x: 0,
      z: 1
    };
    side = {
      x: 1,
      z: 0
    };
    drop = null;
    flash = document.createElement("div");
    flashT = 0;
    steerOverride = null;
    start() {
      this.active && this.finish(!1), this.pending = !0;
    }
    toggle() {
      this.active || this.pending ? (this.pending = !1, this.finish(!0)) : this.start();
    }
    update(t) {
      if (this.pending && this.g.mode !== "loading" && (this.pending = !1, this.begin()), !(!this.active || !this.shot)) {
        this.t += t, this.flashT = Math.max(0, this.flashT - t), this.flash.style.opacity = String(this.flashT / 0.16 * 0.75), this.drive();
        for (let [e, i] of (this.shot.events ?? []).entries()) this.fired.has(e) || this.t < i.at || (this.fired.add(e), this.event(i));
        this.t >= this.shot.durationMs / 1e3 && this.nextShot();
      }
    }
    begin() {
      let t = this.g;
      this.prevSeed = t.seed, this.origRandom = Math.random, this.seed(4207), t.newShift(4207), t.hud.hideOverlays(), t.hud.showPlaying(!1), t.mode = "play", t.scripted = !0, t.engine.start(), t.engine.setMusic(0.3), this.active = !0, this.idx = -1, this.nextShot();
    }
    finish(t) {
      let e = this.g;
      this.active = !1, this.shot = null, this.flash.style.opacity = "0", Math.random = this.origRandom, e.scripted = !1, e.autopilot = null, e.camOverride = null, e.showMarkers = !0, e.mode !== "loading" && e.newShift(this.prevSeed), t && window.dispatchEvent(new Event("remix:trailer-end"));
    }
    loopShot = -1;
    startAt(t) {
      this.loopShot = t, this.start();
    }
    nextShot() {
      if (this.idx = this.loopShot >= 0 ? this.loopShot : this.idx + 1, this.idx >= Ce.length) {
        this.finish(!0);
        return;
      }
      this.stage(Ce[this.idx]);
    }
    seed(t) {
      let e = te(t);
      Math.random = () => e.next();
    }
    stage(t) {
      let e = this.g;
      this.shot = t, this.t = 0, this.fired.clear(), this.steerOverride = null, this.meteor = null, this.drop = null, this.seed(4207 + this.idx * 101), this.clearShot(), e.showMarkers = t.id === "yeet", e.P = {
        ...Wo,
        ...t.phys
      }, e.job = {
        phase: "deliver",
        pickup: e.city.depot,
        drop: e.city.drops[0],
        limit: 99,
        left: 99,
        late: !1,
        content: "a mystery humming box"
      }, e.pkg.state = "carried", e.pkg.health = 1, e.pkg.waitObj && (e.pkg.waitObj.removeFromParent(), e.pkg.waitObj = null);
      let i = e.city;
      switch (t.id) {
        case "clockin":
          {
            let n = i.depot,
              r = n.z - 15;
            this.setLine(n.x + 2, n.z - 4, {
              x: 0,
              z: 1
            }), this.place(n.x + 2, n.z - 4, 0), this.clearCars(n.x, r + 30, 60);
            for (let d = 0; d < 2; d++) for (let h = 0; h < 6; h++) this.prop("crate", n.x + 2 - 3 + h * 1.2, n.z + 3 + d * 1.2, h);
            for (let d of [-3.5, 3.5]) this.prop("cone", n.x + 2 + d, n.z + 7);
            this.park("car", n.x + 2.5, r + 31, Math.PI / 2, 0), this.park("car", n.x - 3, r + 33.5, -Math.PI / 2, 3);
            break;
          }
        case "ramp":
          {
            let n = this.findRamp();
            if (!n) break;
            let {
              cx: r,
              cz: d,
              f: h
            } = n;
            this.setLine(r - h.x * 30.5, d - h.z * 30.5, h), this.place(this.origin.x, this.origin.z, Math.atan2(h.x, h.z)), this.clearCars(r + h.x * 30, d + h.z * 30, 90);
            for (let c of [-3.6, 0, 3.6]) this.park("car", ...this.at(30.5 + 4.5 + 63, c), Math.atan2(h.x, h.z) + Math.PI / 2, c === 0 ? 1 : c > 0 ? 2 : 6);
            this.park("car", ...this.at(30.5 + 4.5 + 69, 1.5), Math.atan2(h.x, h.z), 4);
            break;
          }
        case "rampage":
          {
            let [n, r] = this.block(),
              d = n + 21.5;
            this.setLine(d, r - 27, {
              x: 0,
              z: 1
            }), this.place(d, r - 27, 0), this.clearCars(d, r + 10, 70), ["fruit", "cone", "trash", "fruit", "hydrant", "crate", "fruit", "cone", "bench", "fruit"].forEach((c, l) => this.prop(c, d + (l % 2 ? 0.4 : -0.3), r - 18 + l * 4.2, c === "fruit" ? Math.PI / 2 : l));
            for (let [c, l] of ["fruit", "cone", "trash", "fruit"].entries()) this.prop(l, d, r + 40 + c * 4.5, Math.PI / 2);
            break;
          }
        case "bowling":
          {
            let n = -O,
              r = B(2) + 6;
            this.setLine(n, r, {
              x: 0,
              z: 1
            }), this.place(n, r, 0), this.clearCars(n, r + 40, 90), this.park("bus", ...this.at(34, 0), Math.PI / 2, 0), [[41, -2.2], [41, 2.2], [45, -4.4], [45, 0], [45, 4.4], [49, -2.2], [49, 2.2]].forEach(([h, c], l) => this.park("car", ...this.at(h, c), l % 2 ? 0.2 : -0.3, l));
            break;
          }
        case "yeet":
          {
            let n = i.drops.find(f => f.kind === "house" && !f.name.startsWith("Park") && Math.abs(f.x) < O - 30 && Math.abs(f.z) < O - 30) ?? i.drops[0],
              r = B(Math.floor((n.x + O) / Z)) + Z / 2,
              d = B(Math.floor((n.z + O) / Z)) + Z / 2,
              h = n.x - r,
              c = n.z - d,
              l = Math.abs(h) > Math.abs(c) ? {
                x: Math.sign(h),
                z: 0
              } : {
                x: 0,
                z: Math.sign(c)
              },
              p = {
                x: -l.z,
                z: l.x
              };
            this.drop = n, e.job.drop = n, this.setLine(n.x + l.x * 12.5 - p.x * 14, n.z + l.z * 12.5 - p.z * 14, p), this.place(this.origin.x, this.origin.z, Math.atan2(p.x, p.z)), this.clearCars(n.x + l.x * 12, n.z + l.z * 12, 50), e.camOverride = {
              yaw: Math.atan2(p.x * 0.6 - l.x, p.z * 0.6 - l.z),
              pitch: t.camera.pitch,
              dist: t.camera.dist
            };
            break;
          }
        case "meteor":
          {
            this.straight(110), this.clearCars(...this.at(55, 0), 120);
            for (let [n, r] of [[30, 4.5], [45, -4], [60, 5.5], [76, -3.5], [95, -6]]) this.park("car", ...this.at(n, r), this.heading + (r > 0 ? 0 : Math.PI), Math.round(n));
            this.meteor = new ie(e), this.meteor.t = 999, this.meteor.hold = !0, e.disasters.push(this.meteor);
            break;
          }
        case "donut":
          {
            this.straight(100), this.clearCars(...this.at(30, 0), 110);
            for (let [d, h] of [[4, 3.6], [12, -3.6], [22, 3.6], [33, -3.6], [46, 3.6]]) this.park("car", ...this.at(d, h), this.heading + (h > 0 ? 0 : Math.PI), Math.round(d) + 2);
            let [n, r] = this.at(-22, 0);
            e.disasters.push(new ae(e, {
              x: n,
              z: r,
              dx: this.fwd.x,
              dz: this.fwd.z,
              speed: 26
            }));
            break;
          }
        case "tornado":
          {
            this.straight(70), this.clearCars(...this.at(35, 0), 90);
            let [n, r] = this.at(40, 0);
            for (let [d, h] of [[40, 8], [31, -6], [50, 5], [45, -9]]) this.park("car", ...this.at(d, h), this.heading + h, Math.round(d));
            for (let d = 0; d < 6; d++) this.prop(d % 2 ? "crate" : "cone", ...this.at(34 + d * 2.5, d % 2 ? 4 : -4));
            e.disasters.push(new re(e, {
              x: n,
              z: r
            }));
            break;
          }
        case "flood":
          {
            this.straight(90), this.clearCars(...this.at(40, 0), 100);
            let n = new ne(e);
            n.t = 7, e.waterLevel = n.top, e.disasters.push(n);
            for (let [r, d] of [[16, 4], [30, -4.5], [44, 3.5], [58, -3]]) {
              let h = this.park("car", ...this.at(r, d), this.heading + r, Math.round(r));
              h.parked = !1, e.knockCar(h, 0, 0, 1, 0, 0, 0.2);
            }
            break;
          }
        case "splash":
          {
            let n = B(4);
            this.ramp(O + 1, n, 0), this.setLine(O + 1 - 4.5 - 30, n, {
              x: 1,
              z: 0
            }), this.place(this.origin.x, this.origin.z, Math.PI / 2), this.clearCars(O - 20, n, 80);
            break;
          }
      }
      let s = e.van,
        o = t.speed;
      if (s.vx = Math.sin(this.heading) * o, s.vz = Math.cos(this.heading) * o, !e.camOverride) {
        let n = t.camera;
        e.camOverride = n.look === "back" ? {
          yaw: this.heading + Math.PI + n.orbit,
          pitch: n.pitch,
          dist: n.dist
        } : {
          orbit: n.orbit,
          pitch: n.pitch,
          dist: n.dist
        };
      }
      e.camYaw = this.heading, e.orbit = 0, e.snapCamera = !0, e.autopilot = {
        throttle: 1,
        steer: 0,
        boost: t.boost,
        hand: !1
      }, this.flashT = this.idx === 0 ? 0 : 0.16;
    }
    drive() {
      let t = this.g,
        e = t.autopilot;
      if (!e) return;
      let i = t.van,
        s = (this.heading - i.h) % (Math.PI * 2);
      s > Math.PI && (s -= Math.PI * 2), s < -Math.PI && (s += Math.PI * 2);
      let o = (i.pos.x - this.origin.x) * this.side.x + (i.pos.z - this.origin.z) * this.side.z;
      e.steer = Le.MathUtils.clamp(-s * 2.5 + o * 0.08, -1, 1), this.steerOverride && this.t < this.steerOverride.until && (e.steer = this.steerOverride.steer);
    }
    event(t) {
      let e = this.g;
      t.kind === "throw" && this.drop ? e.throwPackage(new Le.Vector3(this.drop.x, this.drop.y, this.drop.z)) : t.kind === "meteor" && this.meteor ? this.meteor.drop(...this.at(t.ahead, t.side), t.T) : t.kind === "steer" && (this.steerOverride = {
        steer: t.steer,
        until: t.until
      });
    }
    clearShot() {
      let t = this.g;
      for (let e of t.disasters) e.dispose();
      t.disasters = [];
      for (let e of [...t.bodies]) t.removeBody(e);
      t.pkg.body = null;
      for (let e of t.craters) e.obj.removeFromParent();
      t.craters = [], t.geysers = [], t.fx.clear(), t.waterLevel = -1.2, t.shake = 0, t.combo = 0, t.camOverride = null;
    }
    place(t, e, i) {
      let s = this.g;
      s.resetVan(t, e, i), s.van.airT = 0, s.van.launchCd = 0, s.van.boost = 1, this.heading = i;
    }
    setLine(t, e, i) {
      this.origin = {
        x: t,
        z: e
      }, this.fwd = i, this.side = {
        x: -i.z,
        z: i.x
      };
    }
    at(t, e) {
      return [this.origin.x + this.fwd.x * t + this.side.x * e, this.origin.z + this.fwd.z * t + this.side.z * e];
    }
    clearCars(t, e, i) {
      let s = this.g;
      for (let o of [...s.cars]) o.state !== "drive" || Math.hypot(o.x - t, o.z - e) > i || (o.obj.removeFromParent(), s.cars.splice(s.cars.indexOf(o), 1));
    }
    park(t, e, i, s, o) {
      let n = this.g,
        r = nt(t, o),
        d = pt(n.city, e, i, 1);
      r.position.set(e, d, i), r.rotation.y = s, n.run.add(r);
      let h = {
        obj: r,
        kind: t,
        state: "drive",
        fi: 0,
        fj: 0,
        ti: 1,
        tj: 0,
        s: 0,
        speed: 0,
        cruise: 0,
        x: e,
        z: i,
        h: s,
        y: d,
        wait: 0,
        nearCd: 0,
        id: n.carId++,
        parked: !0
      };
      return n.cars.push(h), h;
    }
    prop(t, e, i, s = 0) {
      let o = this.g,
        n = t === "fruit" ? Ot() : t === "cone" ? _t() : t === "trash" ? ve() : t === "hydrant" ? Qt() : t === "bench" ? ye() : Bt();
      t === "crate" && n.scale.multiplyScalar(1.1);
      let r = pt(o.city, e, i, 1);
      n.position.set(e, r, i), n.rotation.y = s, o.run.add(n);
      let d = {
        kind: t,
        x: e,
        z: i,
        y: r,
        mesh: n,
        alive: !0
      };
      o.city.props.push(d);
      let h = o.gkey(e, i),
        c = o.propGrid.get(h);
      c || o.propGrid.set(h, c = []), c.push(d);
    }
    ramp(t, e, i) {
      let s = this.g,
        o = 9,
        n = 3.6,
        r = 2.4,
        d = ge(o, n, r);
      d.position.set(t, 0, e), d.rotation.y = i === 2 ? 0 : i === 3 ? Math.PI : i === 0 ? Math.PI / 2 : -Math.PI / 2, s.run.add(d);
      let h = i >= 2,
        c = h ? n : o,
        l = h ? o : n,
        p = {
          minX: t - c / 2,
          maxX: t + c / 2,
          minZ: e - l / 2,
          maxZ: e + l / 2,
          top: r,
          ramp: i,
          tag: "ramp",
          stamp: 0
        };
      s.city.solids.push(p), s.city.grid.insert(p);
    }
    findRamp() {
      for (let t of this.g.city.solids) {
        if (t.tag !== "ramp" || Math.abs(t.top - 2.4) > 0.01 || t.ramp === void 0) continue;
        let e = (t.minX + t.maxX) / 2,
          i = (t.minZ + t.maxZ) / 2,
          s = t.ramp === 0 ? {
            x: 1,
            z: 0
          } : t.ramp === 1 ? {
            x: -1,
            z: 0
          } : t.ramp === 2 ? {
            x: 0,
            z: 1
          } : {
            x: 0,
            z: -1
          },
          o = e + s.x * 70,
          n = i + s.z * 70,
          r = e - s.x * 32,
          d = i - s.z * 32;
        if (Math.max(Math.abs(o), Math.abs(n), Math.abs(r), Math.abs(d)) < O - 2) return {
          cx: e,
          cz: i,
          f: s
        };
      }
      return null;
    }
    straight(t) {
      let e = this.g.city.solids.filter(o => o.tag === "ramp"),
        i = [];
      for (let o = 1; o < ot; o++) for (let n = 0; n * 10 + t < ot * Z - 20; n++) i.push({
        x: B(o),
        z: -O + 10 + n * 10,
        f: {
          x: 0,
          z: 1
        }
      }), i.push({
        x: -O + 10 + n * 10,
        z: B(o),
        f: {
          x: 1,
          z: 0
        }
      });
      let s = this.idx * 7 % i.length;
      for (let o = 0; o < i.length; o++) {
        let n = i[(s + o * 13) % i.length];
        if (e.every(d => {
          for (let h = -10; h <= t + 10; h += 3) {
            let c = n.x + n.f.x * h,
              l = n.z + n.f.z * h;
            if (c > d.minX - 3 && c < d.maxX + 3 && l > d.minZ - 3 && l < d.maxZ + 3) return !1;
          }
          return !0;
        })) {
          this.setLine(n.x, n.z, n.f), this.place(n.x, n.z, Math.atan2(n.f.x, n.f.z));
          return;
        }
      }
    }
    block() {
      let t = this.g.city.depot;
      for (let [e, i] of [[1, 1], [3, 1], [1, 3], [4, 2]]) {
        let s = B(e) + Z / 2,
          o = B(i) + Z / 2;
        if (Math.hypot(s - t.x, o - t.z) > 40 && Math.hypot(s - t.x, o + Z - t.z) > 40) return [s, o];
      }
      return [B(1) + Z / 2, B(1) + Z / 2];
    }
  };
var Yo = () => document.body.classList.contains("touch") || matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0,
  Zo = `
.tc{position:fixed;inset:0;pointer-events:none;z-index:6;display:none}
.tc.show{display:block}
.tb{position:absolute;pointer-events:auto;border-radius:50%;background:rgba(30,38,50,.5);border:3px solid rgba(255,255,255,.4);color:#fff;font:900 13px 'Trebuchet MS',system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;text-shadow:0 2px 0 rgba(0,0,0,.4);letter-spacing:.5px;box-shadow:0 4px 10px rgba(0,0,0,.25)}
.tb b{font-size:1.9em;line-height:1}
.tb.on{background:rgba(255,150,50,.75);transform:scale(.94)}
.tb.gas{background:rgba(60,160,80,.55)}
.tb.gas.on{background:rgba(90,210,110,.85)}
.tb.brk{background:rgba(190,60,50,.5)}
.tb.brk.on{background:rgba(240,90,70,.85)}
.tb.boost{background:rgba(230,110,30,.55)}
.tb.throw{background:rgba(50,140,230,.6)}
.rot{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;flex-direction:column;background:rgba(20,24,32,.92);color:#fff;font:900 22px 'Trebuchet MS',system-ui,sans-serif;text-align:center;padding:20px}
.rot.show{display:flex}
.rot span{font-size:60px;animation:spin 1.6s ease-in-out infinite}
@keyframes spin{0%,20%{transform:rotate(0)}60%,100%{transform:rotate(90deg)}}
/* phone HUD: compact chips, minimap top-right, no mutator panel */
body.touch .hud-mut{display:none}
body.touch .hud-map{top:calc(8px + var(--tc-top-right,0px));bottom:auto;right:calc(8px + var(--tc-right,0px));width:104px;height:104px}
body.touch .hud-stats{left:calc(8px + var(--tc-left,0px));top:calc(8px + var(--tc-top-left,0px));gap:4px;display:grid;grid-template-columns:auto auto}
body.touch .hud-chip{font-size:15px;min-width:74px;padding:2px 8px 2px 2px;border-radius:8px;gap:5px}
body.touch .hud-ico{width:22px;height:22px;font-size:13px;border-radius:5px}
body.touch .hud-job{top:calc(8px + var(--tc-top,0px));min-width:180px;max-width:42vw;padding:4px 10px 6px}
body.touch .hud-job .t{font-size:13px}
body.touch .hud-job .s{font-size:11px}
body.touch .hud-job .tm{font-size:16px}
body.touch .hud-bottom{bottom:calc(8px + var(--tc-bottom,0px));gap:8px}
body.touch .hud-meter{width:104px;font-size:9px;padding:3px 7px}
body.touch .hud-speed{font-size:20px;min-width:56px}
body.touch .hud-hint{bottom:calc(64px + var(--tc-bottom,0px));font-size:13px}
body.touch .hud-banner .b1{font-size:34px}
body.touch .hud-banner .b2{font-size:15px}
body.touch .hud-pop{font-size:17px !important}
.k-touch{display:none}
body.touch .k-touch{display:grid}
body.touch .k-desk{display:none}
body.touch .kd{display:none}
`,
  _o = !1,
  Ie = class {
    constructor(t, e) {
      this.game = t;
      let i = document.createElement("style");
      i.textContent = Zo, document.head.append(i), this.root.className = "tc", this.rotate.className = "rot", this.rotate.innerHTML = "<span>\u{1F4F1}</span><div>Turn your phone sideways<br>to start your shift</div>", document.body.append(this.root, this.rotate);
      let s = (n, r, d, h, c) => {
        let l = document.createElement("div");
        l.className = `tb ${d}`, l.innerHTML = r, this.root.append(l);
        let p = {
          el: l,
          key: h,
          tap: c,
          pointers: new Set()
        };
        this.btns[n] = p;
        let f = u => {
            u.preventDefault(), u.stopPropagation(), l.setPointerCapture?.(u.pointerId), p.pointers.add(u.pointerId), l.classList.add("on"), h && this.game.keys.add(h), c?.();
          },
          m = u => {
            p.pointers.delete(u.pointerId) && p.pointers.size === 0 && (l.classList.remove("on"), h && this.game.keys.delete(h));
          };
        l.addEventListener("pointerdown", f), l.addEventListener("pointerup", m), l.addEventListener("pointercancel", m), l.addEventListener("lostpointercapture", m), l.addEventListener("contextmenu", u => u.preventDefault());
      };
      s("left", "<b>\u25C0</b>", "steer", "KeyA"), s("right", "<b>\u25B6</b>", "steer", "KeyD"), s("gas", "<b>\u25B2</b>GAS", "gas", "KeyW"), s("brake", "<b>\u25BC</b>BRAKE", "brk", "KeyS"), s("boost", "\u{1F525}<br>BOOST", "boost", "ShiftLeft"), s("drift", "\u21AF<br>DRIFT", "", "Space"), s("throw", "\u{1F4E6}<br>YEET", "throw", void 0, () => this.game.throwPackage()), s("flip", "\u21BB<br>FLIP", "", void 0, () => this.game.flipUpright()), e.addEventListener("pointerdown", n => {
        n.pointerType === "touch" && (document.body.classList.add("touch"), this.drag || (this.drag = {
          id: n.pointerId,
          x: n.clientX,
          y: n.clientY
        }));
      }), window.addEventListener("pointermove", n => {
        let r = this.drag;
        if (!r || r.id !== n.pointerId || this.game.mode !== "play" || this.game.scripted) return;
        let d = n.clientX - r.x,
          h = n.clientY - r.y;
        r.x = n.clientX, r.y = n.clientY, this.game.orbit -= d * 0.008, this.game.pitch = Math.min(1, Math.max(0.22, this.game.pitch + h * 0.005)), this.game.mouseIdle = 0;
      });
      let o = n => {
        this.drag?.id === n.pointerId && (this.drag = null);
      };
      window.addEventListener("pointerup", o), window.addEventListener("pointercancel", o), window.addEventListener("touchstart", () => document.body.classList.add("touch"), {
        passive: !0,
        once: !0
      }), (Yo() || _o) && document.body.classList.add("touch"), this.layout = N.contentLayout, N.onContentLayout(n => {
        this.layout = n, this.place();
      }), window.addEventListener("resize", () => this.place()), this.place();
    }
    root = document.createElement("div");
    rotate = document.createElement("div");
    btns = {};
    drag = null;
    layout = null;
    place() {
      let t = window.innerWidth,
        e = window.innerHeight,
        i = this.layout?.safeAreaInset ?? {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        },
        s = this.layout?.exclusions ?? [],
        o = u => {
          let v = 0;
          for (let E of s) (u ? E.x + E.width > t * 0.6 : E.x < t * 0.4) && E.y < e * 0.25 && E.height < e * 0.3 && (v = Math.max(v, E.y + E.height - i.top + 4));
          return Math.max(0, v);
        },
        n = document.body.style;
      n.setProperty("--tc-top", `${i.top}px`), n.setProperty("--tc-left", `${i.left}px`), n.setProperty("--tc-right", `${i.right}px`), n.setProperty("--tc-bottom", `${i.bottom}px`), n.setProperty("--tc-top-left", `${i.top + o(!1)}px`), n.setProperty("--tc-top-right", `${i.top + o(!0)}px`);
      let r = Math.round(Math.max(52, Math.min(84, Math.min(t, e) * 0.2))),
        d = Math.round(r * 0.18),
        h = i.left + 14,
        c = i.right + 14,
        l = i.bottom + 12,
        p = (u, v, E, j, P) => {
          let C = this.btns[u].el,
            et = E ? t - v - P : v,
            it = e - j - P;
          for (let _ = 0; _ < 4 && !N.isUiRectSafe({
            x: et,
            y: it,
            width: P,
            height: P
          }); _++) it -= 40, et += E ? -10 : 10;
          C.style.left = `${et}px`, C.style.top = `${it}px`, C.style.width = C.style.height = `${P}px`, C.style.fontSize = `${Math.round(P * 0.16)}px`;
        },
        f = Math.round(r * 1.18);
      p("left", h, !1, l, f), p("right", h + f + d, !1, l, f), p("flip", h + 4, !1, l + f + d, Math.round(r * 0.78)), p("throw", h + f + d, !1, l + f + d, Math.round(r * 0.95));
      let m = Math.round(r * 1.3);
      p("gas", c, !0, l, m), p("brake", c + m + d, !0, l, Math.round(r * 1)), p("boost", c + 4, !0, l + m + d, Math.round(r * 0.9)), p("drift", c + m + d, !0, l + Math.round(r * 1) + d, Math.round(r * 0.82));
    }
    update() {
      let t = this.game,
        e = document.body.classList.contains("touch"),
        i = e && t.mode === "play" && !t.scripted;
      if (this.root.classList.toggle("show", i), this.rotate.classList.toggle("show", e && window.innerHeight > window.innerWidth && !t.scripted), !i) {
        for (let o of Object.values(this.btns)) o.pointers.size !== 0 && (o.pointers.clear(), o.el.classList.remove("on"), o.key && t.keys.delete(o.key));
        return;
      }
      let s = t.pkg.state === "carried";
      this.btns.throw.el.style.opacity = s ? "1" : "0.35", this.btns.flip.el.style.opacity = t.van.flipped ? "1" : "0.6";
    }
  };
var oi = N.ready(),
  ii = 16 / 9,
  ws = 50,
  gs = !1,
  lo = -1,
  J = new V.WebGLRenderer({
    antialias: !0,
    powerPreference: "high-performance"
  });
J.outputColorSpace = V.SRGBColorSpace;
J.toneMapping = V.ACESFilmicToneMapping;
J.toneMappingExposure = 1.05;
J.shadowMap.enabled = !0;
J.shadowMap.type = V.PCFSoftShadowMap;
J.domElement.style.cssText = "display:block;position:fixed;inset:0;width:100%;height:100%;touch-action:none";
document.body.style.cssText = "margin:0;overflow:hidden;background:#e9b98a";
document.body.append(J.domElement);
var Rt = new V.Scene();
{
  let a = document.createElement("canvas");
  a.width = 4, a.height = 256;
  let t = a.getContext("2d"),
    e = t.createLinearGradient(0, 0, 0, 256);
  e.addColorStop(0, "#d9a27a"), e.addColorStop(0.45, "#f2c08e"), e.addColorStop(1, "#f6d6a8"), t.fillStyle = e, t.fillRect(0, 0, 4, 256);
  let i = new V.CanvasTexture(a);
  i.colorSpace = V.SRGBColorSpace, Rt.background = i;
}
Rt.fog = new V.Fog("#efc497", 150, 560);
var bt = new V.PerspectiveCamera(ws, 1, 0.5, 1400);
bt.userData.baseFov = ws;
var ai = new V.HemisphereLight("#ffe2bf", "#6b5644", 1.25);
Rt.add(ai);
var ft = new V.DirectionalLight("#ffc38a", 2.9);
ft.castShadow = !0;
ft.shadow.mapSize.set(2048, 2048);
var Gt = ft.shadow.camera;
Gt.left = -80;
Gt.right = 80;
Gt.top = 80;
Gt.bottom = -80;
Gt.near = 10;
Gt.far = 260;
ft.shadow.bias = -4e-4;
ft.shadow.normalBias = 0.6;
Rt.add(ft, ft.target);
var fo = new V.DirectionalLight("#9fc4ff", 0.35);
fo.position.set(80, 60, 60);
Rt.add(fo);
var Tt = new Qo(J);
Tt.addPass(new Jo(Rt, bt));
var he = new ys(ei),
  ce = new ys(si);
Tt.addPass(he);
Tt.addPass(ce);
var mo = new ys({
  uniforms: {
    tDiffuse: {
      value: null
    },
    amount: {
      value: 0.55
    }
  },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
  fragmentShader: `uniform sampler2D tDiffuse; uniform float amount; varying vec2 vUv;
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 d = vUv - 0.5;
      float v = smoothstep(0.85, 0.2, length(d * vec2(1.0, 1.25)));
      c.rgb *= mix(1.0 - amount * 0.55, 1.0, v);
      c.rgb = mix(c.rgb, c.rgb * vec3(1.06, 0.98, 0.9), 0.5);
      gl_FragColor = c;
    }`
});
Tt.addPass(mo);
Tt.addPass(new ti());
var ht = null,
  zt = null,
  bo = !1,
  xo = null;
window.addEventListener("remix:trailer-start", a => {
  a.preventDefault(), zt ? zt.start() : bo = !0;
});
window.addEventListener("keydown", a => {
  (a.ctrlKey || a.metaKey) && a.code === "KeyY" && zt && (a.preventDefault(), zt.toggle());
});
var wt = 2,
  ni = [0.6, 1, 1.5];
function ri() {
  he.enabled = ce.enabled = wt > 0, mo.enabled = wt > 0, J.shadowMap.enabled = wt > 0, ft.castShadow = wt > 0, wt === 1 && (J.shadowMap.type = V.PCFShadowMap, ft.shadow.mapSize.set(1024, 1024), ft.shadow.map?.dispose(), ft.shadow.map = null), Rt.traverse(a => {
    let t = a;
    if (t.isMesh) for (let e of [t.material].flat()) e.needsUpdate = !0;
  }), Ms();
}
function Ms() {
  let a = window.innerWidth,
    t = window.innerHeight,
    e = Math.min(window.devicePixelRatio, ni[wt]);
  J.setPixelRatio(e), J.setSize(a, t), Tt.setPixelRatio(e), Tt.setSize(a, t), bt.aspect = a / t;
  let i = Math.max(1, ii / bt.aspect),
    s = V.MathUtils.degToRad(ws / 2),
    o = V.MathUtils.radToDeg(2 * Math.atan(Math.tan(s) * Math.min(i, 1.8)));
  bt.userData.baseFov = o, bt.fov = o, bt.updateProjectionMatrix(), he.uniforms.h.value = 1.6 / (a * e), ce.uniforms.v.value = 1.6 / (t * e);
}
window.addEventListener("resize", Ms);
Ms();
function hi(a) {
  he.uniforms.r.value = a ? 0.4 : 0.45, ce.uniforms.r.value = a ? 0.4 : 0.45;
  let t = a ? 1.6 : 2.6;
  he.uniforms.h.value = t / (J.domElement.width || 1), ce.uniforms.v.value = t / (J.domElement.height || 1);
}
var Es = document.createElement("div");
Es.style.cssText = "position:fixed;left:4px;bottom:4px;z-index:99;color:#fff;background:#000a;font:12px monospace;padding:2px 6px";
gs && document.body.append(Es);
var je = 0,
  po = performance.now(),
  xs = 0,
  De = 0,
  Be = 0,
  Oe = 0,
  vs = new V.Timer();
vs.connect(document);
J.setAnimationLoop(a => {
  vs.update(a);
  let t = Math.min(vs.getDelta(), gs ? 1.2 : 0.25),
    e = Math.max(1, Math.ceil(t / (1 / 30))),
    i = performance.now();
  if (ht) {
    for (let s = 0; s < e; s++) zt?.update(t / e), ht.update(t / e);
    hi(ht.mode === "play" || ht.mode === "paused"), xo?.update();
  } else bt.position.set(Math.cos(a * 5e-5) * 190, 135, Math.sin(a * 5e-5) * 190), bt.lookAt(0, -10, 0);
  J.info.autoReset = !1, J.info.reset(), Tt.render(), xs += performance.now() - i, je++, Be++, ht && ht.mode !== "loading" && wt > 0 && a - De > 2e3 ? (Be * 1e3 / (a - De) < 26 ? Oe++ : Oe = 0, Oe >= 2 && (Oe = 0, wt--, ri()), De = a, Be = 0) : (!ht || ht.mode === "loading") && (De = a, Be = 0), gs && performance.now() - po > 1e3 && (Es.textContent = `tier ${wt} fps ${je} cpu ${(xs / je).toFixed(1)}ms calls ${J.info.render.calls} tris ${(J.info.render.triangles / 1e3).toFixed(0)}k`, je = 0, xs = 0, po = performance.now());
});
await oi;
ht = new Pe(Rt, bt, ft);
zt = new Ae(ht);
xo = new Ie(ht, J.domElement);
bo && zt.start();
lo >= 0 && zt.startAt(lo);
ht.hud.setLoading("Loading the city\u2026");
var uo = 0;
await Promise.all([_s((a, t) => {
  uo = a, ht?.hud.setLoading(`Bribing city planners\u2026 ${Math.round(uo / t * 100)}%`);
}), Js()]);
ht.newShift(Math.floor(Math.random() * 99999) + 1);
J.domElement.addEventListener("pointerdown", a => {
  a.pointerType !== "touch" && ht?.canvasClick();
});
N.onPlayAgain(() => ht?.newShift(Math.floor(Math.random() * 99999) + 1));