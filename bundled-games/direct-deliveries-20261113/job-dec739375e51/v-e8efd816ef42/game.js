import * as n from "./_remote/8a1b82acd9dbb73f/three@0.186.0.js";
import { RoomEnvironment as io } from "./_remote/ba20a7fb9a5bf09b/RoomEnvironment.js";
window.__engine = !0;
var Jn = {
    engine: 20,
    fonts: 8,
    textures: 12,
    sounds: 35,
    shaders: 20,
    frame: 5
  },
  Lt = {};
function _e(e, t = 1, a) {
  Lt[e] = Math.max(Lt[e] || 0, t);
  let o = Object.entries(Jn).reduce((i, [l, s]) => i + s * (Lt[l] || 0), 0);
  window.__ld.set(Math.min(99, o), a), Object.keys(Jn).every(i => Lt[i] >= 1) && lo();
}
var Zn = !1;
function lo() {
  Zn || (Zn = !0, window.__ld.set(100, "Ready"), setTimeout(() => {
    document.getElementById("loading").classList.add("done"), document.getElementById("overlay").classList.remove("hide"), setTimeout(() => document.getElementById("loading").remove(), 700);
  }, 250));
}
_e("engine", 1, "Building the table");
document.fonts.ready.then(() => _e("fonts", 1));
var j = 2.54,
  H = 1.27,
  w = 0.028575,
  st = 0.05,
  Jt = 0.13,
  ke = 0.048,
  ea = 0.038,
  ce = -0.79,
  at = 0.072,
  ro = 0.072,
  so = 0.062,
  vn = 0.034,
  ot = {
    x: j / 4,
    z: 0
  },
  Ne = {
    x: -j / 4,
    z: 0
  },
  ho = {
    1: "#f2b705",
    2: "#0b3d91",
    3: "#c8102e",
    4: "#4b2a7b",
    5: "#f0661a",
    6: "#0b6b3a",
    7: "#7a1b1f",
    8: "#111111"
  },
  wa = e => ho[e > 8 ? e - 8 : e],
  Ge = e => e === 0 ? "cue" : e === 8 ? "eight" : e < 8 ? "solid" : "stripe",
  Yt = Math.min(devicePixelRatio || 1, 1.5),
  ya = matchMedia("(pointer: coarse)").matches || /Android|iPhone|iPad|Mobi/i.test(navigator.userAgent),
  ta = navigator.hardwareConcurrency || 4,
  co = navigator.deviceMemory || 4,
  Ye = ya ? ta <= 4 || co <= 3 ? 3 : 1 : ta <= 2 ? 2 : 0;
try {
  let e = document.createElement("canvas").getContext("webgl2") || document.createElement("canvas").getContext("webgl"),
    t = e && e.getExtension("WEBGL_debug_renderer_info"),
    a = t ? e.getParameter(t.UNMASKED_RENDERER_WEBGL) : "";
  /Mali-4|Mali-T|Adreno \(TM\) [345]\d\d|PowerVR|SwiftShader|llvmpipe|Intel.*HD Graphics [2-5]/i.test(a) && (Ye = Math.max(Ye, 4)), /Apple M\d|RTX|Radeon RX|Adreno \(TM\) 7[3-9]\d/i.test(a) && (Ye = Math.min(Ye, ya ? 1 : 0));
} catch {}
var _ = new n.WebGLRenderer({
  antialias: !(Ye >= 3 && Yt >= 2),
  powerPreference: "high-performance"
});
_.setPixelRatio(Yt);
_.setSize(innerWidth, innerHeight);
_.shadowMap.enabled = !0;
_.shadowMap.type = n.PCFSoftShadowMap;
_.toneMapping = n.ACESFilmicToneMapping;
_.toneMappingExposure = 1.05;
document.body.prepend(_.domElement);
var uo = _.capabilities.getMaxAnisotropy(),
  B = new n.Scene();
B.background = new n.Color("#0b0907");
B.fog = new n.Fog("#0b0907", 6, 13);
var po = new n.PMREMGenerator(_);
B.environment = po.fromScene(new io(), 0.04).texture;
B.environmentIntensity = 0.28;
var X = new n.PerspectiveCamera(45, innerWidth / innerHeight, 0.01, 40);
X.position.set(-2.2, 0.8, 0);
function Zt(e, t, a, o) {
  let i = document.createElement("canvas");
  i.width = e, i.height = t, a(i.getContext("2d"), e, t);
  let l = new n.CanvasTexture(i);
  return l.colorSpace = n.SRGBColorSpace, l.anisotropy = uo, o && (l.wrapS = l.wrapT = n.RepeatWrapping, l.repeat.set(o[0], o[1])), l;
}
var U = (e, t) => e + Math.random() * (t - e);
function va(e, t, a, o = 220) {
  return Zt(1024, 1024, (i, l, s) => {
    i.fillStyle = e, i.fillRect(0, 0, l, s);
    for (let u = 0; u < o; u++) {
      let p = Math.random() * s,
        x = U(2, 10),
        d = U(0.002, 0.01),
        f = U(0, 6);
      i.strokeStyle = Math.random() < 0.6 ? t : a, i.globalAlpha = U(0.05, 0.3), i.lineWidth = U(0.6, 3.5), i.beginPath();
      for (let M = 0; M <= l; M += 16) i.lineTo(M, p + Math.sin(M * d + f) * x);
      i.stroke();
    }
    i.globalAlpha = 1;
  }, [1, 1]);
}
var fo = va("#4a1a0c", "#210803", "#7a3519"),
  en = va("#3a140a", "#170502", "#5e2712"),
  ba = Zt(512, 512, (e, t, a) => {
    e.fillStyle = "#1a7247", e.fillRect(0, 0, t, a);
    let o = e.getImageData(0, 0, t, a),
      i = o.data;
    for (let l = 0; l < i.length; l += 4) {
      let s = (Math.random() - 0.5) * 16;
      i[l] += s * 0.5, i[l + 1] += s, i[l + 2] += s * 0.6;
    }
    e.putImageData(o, 0, 0);
  }, [6, 3]),
  mo = Zt(1024, 1024, (e, t, a) => {
    let o = a / 8;
    for (let i = 0; i < 8; i++) {
      let l = -Math.random() * 400;
      for (; l < t;) {
        let s = U(260, 520),
          u = U(0.75, 1.1);
        e.fillStyle = `rgb(${86 * u | 0},${55 * u | 0},${34 * u | 0})`, e.fillRect(l, i * o, s, o);
        for (let p = 0; p < 14; p++) {
          e.strokeStyle = `rgba(30,15,6,${U(0.05, 0.25)})`, e.lineWidth = U(0.5, 2);
          let x = i * o + U(3, o - 3);
          e.beginPath(), e.moveTo(l, x), e.bezierCurveTo(l + s * 0.3, x + U(-4, 4), l + s * 0.6, x + U(-4, 4), l + s, x), e.stroke();
        }
        e.fillStyle = "rgba(0,0,0,.55)", e.fillRect(l, i * o, 2, o), l += s;
      }
      e.fillStyle = "rgba(0,0,0,.6)", e.fillRect(0, i * o, t, 2);
    }
  }, [5, 5]);
function xo(e) {
  return Zt(1024, 512, (t, a, o) => {
    let i = "#f5f1e6";
    if (e === 0) {
      t.fillStyle = i, t.fillRect(0, 0, a, o);
      return;
    }
    let l = wa(e);
    e > 8 ? (t.fillStyle = i, t.fillRect(0, 0, a, o), t.fillStyle = l, t.fillRect(0, o * 0.26, a, o * 0.48)) : (t.fillStyle = l, t.fillRect(0, 0, a, o));
    for (let s of [a * 0.25, a * 0.75]) t.fillStyle = i, t.beginPath(), t.ellipse(s, o / 2, 66, 66, 0, 0, Math.PI * 2), t.fill(), t.fillStyle = "#000000", t.font = "900 84px Arial Black, Arial, sans-serif", t.textAlign = "center", t.textBaseline = "middle", t.lineWidth = 2, t.strokeStyle = "#000000", t.strokeText(String(e), s, o / 2 + 3), t.fillText(String(e), s, o / 2 + 3), (e === 6 || e === 9) && t.fillRect(s - 20, o / 2 + 38, 40, 6);
  });
}
B.add(new n.HemisphereLight("#ffe9cf", "#1a120c", 0.22));
var St = 1.62,
  xt = new n.Group();
B.add(xt);
xt.visible = !1;
var ga = new n.MeshStandardMaterial({
    color: "#10291c",
    metalness: 0.55,
    roughness: 0.38
  }),
  za = new n.Mesh(new n.BoxGeometry(1.9, 0.11, 0.34), ga);
za.position.y = St + 0.07;
xt.add(za);
var Et = new n.MeshStandardMaterial({
  color: "#b8923f",
  metalness: 1,
  roughness: 0.3
});
for (let e of [-0.95, 0.95]) {
  let t = new n.Mesh(new n.BoxGeometry(0.02, 0.115, 0.345), Et);
  t.position.set(e, St + 0.07, 0), xt.add(t);
}
for (let e of [-0.6, 0.6]) {
  let t = new n.Mesh(new n.CylinderGeometry(0.004, 0.004, 1.3), Et);
  t.position.set(e, St + 0.78, 0), xt.add(t);
}
var Sa = new n.MeshStandardMaterial({
    color: "#fff4dc",
    emissive: "#fff1d0",
    emissiveIntensity: 3
  }),
  Ea = [];
for (let e of [-0.62, 0, 0.62]) {
  let t = new n.Mesh(new n.CircleGeometry(0.1, 32), Sa);
  t.rotation.x = Math.PI / 2, t.position.set(e, St + 0.012, 0), xt.add(t);
  let a = new n.SpotLight("#fff1dc", 9, 0, 0.82, 0.75, 2);
  a.position.set(e, St, 0), a.target.position.set(e, 0, 0), a.castShadow = !0, a.shadow.mapSize.set(1024, 1024), Ea.push(a), a.shadow.camera.near = 0.3, a.shadow.camera.far = 3, a.shadow.bias = -4e-4, a.shadow.radius = 4, B.add(a, a.target);
}
for (let [e, t] of [[-4.5, -3.8], [4.5, -3.8], [-4.5, 3.8], [4.5, 3.8]]) {
  let a = new n.PointLight("#ffb36b", 3, 7, 2);
  a.position.set(e, 1.3, t), B.add(a);
  let o = new n.Mesh(new n.SphereGeometry(0.07, 16, 12), new n.MeshStandardMaterial({
    color: "#ffcf9a",
    emissive: "#ffb36b",
    emissiveIntensity: 2.5
  }));
  o.position.set(e, 1.3, t + (t > 0 ? 0.12 : -0.12)), B.add(o);
}
var Mo = [],
  na = 2.18;
function Gn(e, t, a = 0) {
  let o = new n.Group();
  o.position.set(e, na, t), o.rotation.y = a, B.add(o);
  let i = new n.Mesh(new n.BoxGeometry(1.7, 0.11, 0.34), ga);
  i.position.y = 0.07, o.add(i);
  for (let s of [-0.85, 0.85]) {
    let u = new n.Mesh(new n.BoxGeometry(0.02, 0.115, 0.345), Et);
    u.position.set(s, 0.07, 0), o.add(u);
  }
  for (let s of [-0.54, 0.54]) {
    let u = new n.Mesh(new n.CylinderGeometry(0.004, 0.004, 1.35, 10), Et);
    u.position.set(s, 0.78, 0), o.add(u);
  }
  for (let s of [-0.52, 0, 0.52]) {
    let u = new n.Mesh(new n.CircleGeometry(0.09, 24), Sa);
    u.rotation.x = Math.PI / 2, u.position.set(s, 0.012, 0), o.add(u);
  }
  let l = new n.SpotLight("#fff1dc", 27, 3.5, 0.58, 0.76, 2);
  l.position.set(e, na, t), l.target.position.set(e, ce + 0.58, t), l.castShadow = !1, B.add(l, l.target), Mo.push(l);
}
for (let e of [-2.78, 2.78]) for (let t of [-1.55, 1.55]) Gn(t, e);
Gn(-3.62, 0, Math.PI / 2);
Gn(3.62, 0, Math.PI / 2);
var tn = new n.Mesh(new n.PlaneGeometry(14, 12), new n.MeshStandardMaterial({
  map: mo,
  roughness: 0.55,
  metalness: 0
}));
tn.rotation.x = -Math.PI / 2;
tn.position.y = ce;
tn.receiveShadow = !0;
B.add(tn);
var wo = new n.MeshStandardMaterial({
    color: "#2b211b",
    roughness: 0.92
  }),
  yo = new n.MeshStandardMaterial({
    map: en,
    roughness: 0.5
  }),
  vo = [[0, -4.2, 0], [0, 4.2, Math.PI], [-5.5, 0, Math.PI / 2], [5.5, 0, -Math.PI / 2]];
for (let [e, t, a] of vo) {
  let o = new n.Mesh(new n.PlaneGeometry(14, 4), wo);
  o.position.set(e, ce + 2, t), o.rotation.y = a, B.add(o);
  let i = new n.Mesh(new n.BoxGeometry(14, 0.95, 0.04), yo);
  i.position.set(e, ce + 0.475, t), i.rotation.y = a, i.translateZ(0.02), B.add(i);
}
for (let e = 0; e < 6; e++) {
  let t = new n.Mesh(new n.CylinderGeometry(0.006, 0.014, 1.47, 10), new n.MeshStandardMaterial({
    color: e % 2 ? "#d9b779" : "#c9a066",
    roughness: 0.4
  }));
  t.position.set(-0.5 + e * 0.2, ce + 1.55, -4.15), t.rotation.z = 0.04, B.add(t);
}
var le = new n.Group();
B.add(le);
var Pt = j / 2 + st + 0.004,
  Oe = H / 2 + st + 0.004,
  Re = [{
    x: -(j / 2 + 0.018),
    z: -(H / 2 + 0.018),
    r: 0.064,
    sx: -1,
    sz: -1
  }, {
    x: 0,
    z: -(H / 2 + 0.036),
    r: 0.062,
    sx: 0,
    sz: -1
  }, {
    x: j / 2 + 0.018,
    z: -(H / 2 + 0.018),
    r: 0.064,
    sx: 1,
    sz: -1
  }, {
    x: j / 2 + 0.018,
    z: H / 2 + 0.018,
    r: 0.064,
    sx: 1,
    sz: 1
  }, {
    x: 0,
    z: H / 2 + 0.036,
    r: 0.062,
    sx: 0,
    sz: 1
  }, {
    x: -(j / 2 + 0.018),
    z: H / 2 + 0.018,
    r: 0.064,
    sx: -1,
    sz: 1
  }],
  cn = Math.PI * 2,
  aa = (e, t) => (e % t + t) % t;
for (let e of Re) {
  let t, a;
  if (e.sx) {
    let s = Math.sqrt(e.r ** 2 - (e.sz * Oe - e.z) ** 2),
      u = Math.sqrt(e.r ** 2 - (e.sx * Pt - e.x) ** 2),
      p = {
        x: e.x - e.sx * s,
        z: e.sz * Oe
      },
      x = {
        x: e.sx * Pt,
        z: e.z - e.sz * u
      };
    [t, a] = e.sx * e.sz > 0 ? [x, p] : [p, x], e.out = Math.atan2(e.sz, e.sx);
  } else {
    let s = Math.sqrt(e.r ** 2 - (e.sz * Oe - e.z) ** 2);
    t = {
      x: e.sz < 0 ? -s : s,
      z: e.sz * Oe
    }, a = {
      x: -t.x,
      z: t.z
    }, e.out = Math.atan2(e.sz, 0);
  }
  let o = Math.atan2(t.z - e.z, t.x - e.x),
    i = Math.atan2(a.z - e.z, a.x - e.x),
    l = aa(i - o, cn);
  e.a1 = o, e.d = aa(e.out - o, cn) < l ? l : l - cn, e.entry = t, e.exit = a;
}
var qe = new n.Shape(),
  Fe = Pt + Jt,
  He = Oe + Jt;
qe.moveTo(-Fe, -He);
qe.lineTo(Fe, -He);
qe.lineTo(Fe, He);
qe.lineTo(-Fe, He);
qe.lineTo(-Fe, -He);
var Vt = [];
for (let e of Re) {
  Vt.push(new n.Vector2(e.entry.x, e.entry.z));
  for (let t = 1; t < 20; t++) {
    let a = e.a1 + e.d * t / 20;
    Vt.push(new n.Vector2(e.x + Math.cos(a) * e.r, e.z + Math.sin(a) * e.r));
  }
  Vt.push(new n.Vector2(e.exit.x, e.exit.z));
}
qe.holes.push(new n.Path(Vt));
var An = new n.ExtrudeGeometry(qe, {
  depth: 0.13,
  bevelEnabled: !0,
  bevelThickness: 0.009,
  bevelSize: 0.008,
  bevelSegments: 4,
  curveSegments: 24
});
An.computeBoundingBox();
var bo = new n.MeshPhysicalMaterial({
    map: fo,
    roughness: 0.32,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12
  }),
  kt = new n.Mesh(An, bo);
kt.rotation.x = Math.PI / 2;
kt.position.y = ke + An.boundingBox.min.z;
kt.castShadow = kt.receiveShadow = !0;
le.add(kt);
var go = new n.MeshStandardMaterial({
    map: ba,
    roughness: 0.93,
    metalness: 0
  }),
  Tn = new n.Mesh(new n.BoxGeometry(2 * Pt + 0.02, 0.04, 2 * Oe + 0.02), go);
Tn.position.y = -0.02;
Tn.receiveShadow = !0;
le.add(Tn);
var Ln = new n.Mesh(new n.BoxGeometry(2 * Fe - 0.06, 0.2, 2 * He - 0.06), new n.MeshPhysicalMaterial({
  map: en,
  roughness: 0.4,
  clearcoat: 0.6
}));
Ln.position.y = -0.17;
Ln.castShadow = !0;
le.add(Ln);
var zo = new n.MeshPhysicalMaterial({
  map: en,
  roughness: 0.4,
  clearcoat: 0.6
});
for (let e of [-(Fe - 0.16), 0, Fe - 0.16]) for (let t of [-(He - 0.14), He - 0.14]) {
  let a = new n.Mesh(new n.CylinderGeometry(0.075, 0.06, -0.27 - ce, 20), zo);
  a.position.set(e, (ce - 0.27) / 2, t), a.castShadow = !0, le.add(a);
  let o = new n.Mesh(new n.CylinderGeometry(0.075, 0.085, 0.04, 20), Et);
  o.position.set(e, ce + 0.02, t), le.add(o);
}
var So = new n.MeshBasicMaterial({
    color: "#030303"
  }),
  Eo = new n.MeshStandardMaterial({
    color: "#0c0908",
    roughness: 0.8,
    side: n.DoubleSide
  }),
  Po = new n.MeshPhysicalMaterial({
    color: "#1c120d",
    roughness: 0.45,
    clearcoat: 0.5
  });
for (let e of Re) {
  let t = new n.Mesh(new n.CircleGeometry(e.r, 40), So);
  t.rotation.x = -Math.PI / 2, t.position.set(e.x, 7e-4, e.z), le.add(t);
  let a = Math.min(e.a1, e.a1 + e.d),
    o = Math.max(e.a1, e.a1 + e.d),
    i = new n.Mesh(new n.CylinderGeometry(e.r, e.r, ke + 0.002, 32, 1, !0, Math.PI / 2 - o, o - a), Eo);
  i.position.set(e.x, ke / 2, e.z), le.add(i);
  let l = new n.Mesh(new n.RingGeometry(e.r - 0.002, e.r + 0.018, 32, 1, -o, o - a), Po);
  l.rotation.x = -Math.PI / 2, l.position.set(e.x, ke + 0.0015, e.z), le.add(l);
}
var Fn = [];
for (let e of [-1, 1]) for (let t of [-1, 1]) Fn.push([[t * ro, e * H / 2], [t * (j / 2 - at), e * H / 2], [t * (j / 2 - at + vn), e * (H / 2 + st)], [t * so, e * (H / 2 + st)]]);
for (let e of [-1, 1]) Fn.push([[e * j / 2, -(H / 2 - at)], [e * j / 2, H / 2 - at], [e * (j / 2 + st), H / 2 - at + vn], [e * (j / 2 + st), -(H / 2 - at + vn)]]);
var ko = new n.MeshStandardMaterial({
    map: ba,
    color: "#d5e8da",
    roughness: 0.9
  }),
  Pa = [];
for (let e of Fn) {
  let t = new n.Shape(e.map(i => new n.Vector2(i[0], i[1]))),
    a = new n.ExtrudeGeometry(t, {
      depth: ea,
      bevelEnabled: !1
    }),
    o = new n.Mesh(a, ko);
  o.rotation.x = Math.PI / 2, o.position.y = ea, o.castShadow = o.receiveShadow = !0, le.add(o);
  for (let i = 0; i < 4; i++) {
    let l = e[i],
      s = e[(i + 1) % 4];
    Pa.push({
      ax: l[0],
      az: l[1],
      bx: s[0],
      bz: s[1]
    });
  }
}
var Co = new n.MeshPhysicalMaterial({
    color: "#f3efe6",
    roughness: 0.2,
    iridescence: 1,
    iridescenceIOR: 1.6,
    clearcoat: 1
  }),
  Io = new n.CircleGeometry(0.009, 4),
  ka = (e, t, a) => {
    let o = new n.Mesh(Io, Co);
    o.rotation.set(-Math.PI / 2, 0, a), o.scale.set(1, 1.7, 1), o.position.set(e, ke + 0.0012, t), le.add(o);
  };
for (let e of [1, 2, 3]) for (let t of [-1, 1]) for (let a of [-1, 1]) ka(t * e * j / 8, a * (Oe + Jt / 2), Math.PI / 2);
for (let e of [-1, 0, 1]) for (let t of [-1, 1]) ka(t * (Pt + Jt / 2), e * H / 4, 0);
for (let e of [ot, Ne]) {
  let t = new n.Mesh(new n.CircleGeometry(0.006, 16), new n.MeshStandardMaterial({
    color: "#e9e4d6",
    roughness: 0.8
  }));
  t.rotation.x = -Math.PI / 2, t.position.set(e.x, 6e-4, e.z), le.add(t);
}
var Ca = Ye >= 4 ? new n.SphereGeometry(w, 28, 18) : new n.SphereGeometry(w, 48, 32),
  W = [];
for (let e = 0; e <= 15; e++) {
  let t = new n.MeshPhysicalMaterial({
      map: xo(e),
      roughness: 0.07,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      specularIntensity: 0.6
    }),
    a = new n.Mesh(Ca, t);
  a.castShadow = !0, a.receiveShadow = !0, B.add(a), W.push({
    n: e,
    mesh: a,
    x: 0,
    z: 0,
    vx: 0,
    vz: 0,
    wx: 0,
    wy: 0,
    wz: 0,
    on: !0,
    falling: null
  });
}
var m = W[0],
  Pe = new n.Group();
B.add(Pe);
function be(e, t, a, o, i) {
  let l = new n.Mesh(new n.CylinderGeometry(t, e, o - a, 28), i);
  l.position.y = (a + o) / 2, l.castShadow = !0, Pe.add(l);
}
var Bo = new n.MeshStandardMaterial({
    color: "#2f5d9a",
    roughness: 0.95
  }),
  Hn = new n.MeshPhysicalMaterial({
    color: "#f2eee4",
    roughness: 0.3,
    clearcoat: 0.6
  }),
  Ro = new n.MeshPhysicalMaterial({
    color: "#e6c48b",
    roughness: 0.35,
    clearcoat: 1,
    clearcoatRoughness: 0.15
  }),
  Ia = new n.MeshPhysicalMaterial({
    color: "#1b0f09",
    roughness: 0.25,
    clearcoat: 1,
    clearcoatRoughness: 0.08
  }),
  $o = new n.MeshStandardMaterial({
    color: "#d0d0d0",
    metalness: 1,
    roughness: 0.2
  }),
  Ba = new n.MeshStandardMaterial({
    color: "#141414",
    roughness: 0.95
  });
be(0.0064, 0.0064, 0, 0.011, Bo);
be(0.0066, 0.0066, 0.011, 0.033, Hn);
be(0.0066, 0.0106, 0.033, 0.74, Ro);
be(0.0112, 0.0112, 0.74, 0.765, $o);
be(0.0112, 0.0122, 0.765, 0.95, Ia);
be(0.0123, 0.0123, 0.95, 0.958, Hn);
be(0.0126, 0.0136, 0.958, 1.26, Ba);
be(0.0137, 0.0137, 1.26, 1.268, Hn);
be(0.0137, 0.0146, 1.268, 1.46, Ia);
be(0.0146, 0.0146, 1.46, 1.47, Ba);
var Wn = new n.Mesh(new n.CylinderGeometry(0.022, 0.022, 0.7, 8), new n.MeshBasicMaterial({
  colorWrite: !1,
  depthWrite: !1
}));
Wn.position.y = 0.35;
Wn.castShadow = !1;
Pe.add(Wn);
var We = (() => {
  let e = [],
    t = [];
  for (let h of [-1, 1]) t.push({
    axis: "x",
    fixed: h * 2.35,
    from: -2.8,
    to: 2.8,
    lift: 0,
    face: h
  });
  for (let h of [-1, 1]) t.push({
    axis: "z",
    fixed: h * 3.3,
    from: -1.4,
    to: 1.4,
    lift: 0,
    face: h
  });
  for (let h of t) {
    for (let g = h.from; g <= h.to + 1e-6; g += 0.93) {
      let C = h.axis === "x" ? g : h.fixed,
        y = h.axis === "x" ? h.fixed : g;
      e.push({
        x: C,
        z: y,
        y: ce + h.lift,
        yaw: Math.atan2(-C, -y),
        taken: Math.random() > 0.3
      });
    }
    if (h.lift) {
      let g = h.to - h.from + 0.9,
        C = new n.Mesh(new n.BoxGeometry(h.axis === "x" ? g : 0.9, h.lift, h.axis === "x" ? 0.9 : g), new n.MeshStandardMaterial({
          map: en,
          roughness: 0.6
        }));
      C.position.set(h.axis === "x" ? 0 : h.fixed, ce + h.lift / 2, h.axis === "x" ? h.fixed : 0), C.receiveShadow = !0, B.add(C);
    }
  }
  let a = e.filter(h => h.taken),
    o = a.length,
    i = e.length,
    l = ["#f1c9a5", "#e0ac85", "#c68863", "#9c6644", "#6f4630", "#f5d5bd", "#d9a07a"],
    s = ["#1f2a44", "#2b2b2b", "#e8e6df", "#6b1f24", "#3d4a2c", "#35506e", "#8a7a62", "#4a3b5c", "#b8b2a4", "#20303a", "#7a2e1f", "#5d6d7e"],
    u = ["#1c1f26", "#2a2f3a", "#3b3228", "#243447", "#161616", "#4a4a48"],
    p = ["#1a1410", "#2e1f14", "#4a3222", "#6b4a2b", "#a47c48", "#8f8f8f", "#d9d4c7", "#120d0a"],
    x = new n.MeshStandardMaterial({
      roughness: 0.78,
      metalness: 0
    });
  x.envMapIntensity = 3.2;
  let d = (h, g) => new n.CapsuleGeometry(h, g, 3, 7),
    f = {},
    M = (h, g, C) => {
      let y = new n.InstancedMesh(g, x, C);
      return y.instanceMatrix.setUsage(n.DynamicDrawUsage), y.frustumCulled = !1, B.add(y), f[h] = y, y;
    };
  M("torso", d(0.15, 0.26), o), M("pelvis", new n.BoxGeometry(0.34, 0.14, 0.3), o), M("head", new n.SphereGeometry(0.1, 12, 9), o), M("neck", new n.CylinderGeometry(0.045, 0.05, 0.1, 8), o), M("hair", new n.SphereGeometry(0.108, 12, 7, 0, Math.PI * 2, 0, Math.PI * 0.55), o), M("hairLong", new n.BoxGeometry(0.2, 0.22, 0.07), o), M("thigh", d(0.068, 0.3), o * 2), M("shin", d(0.055, 0.34), o * 2), M("shoe", new n.BoxGeometry(0.1, 0.07, 0.24), o * 2), M("upper", d(0.047, 0.2), o * 2), M("fore", d(0.041, 0.2), o * 2), M("hand", new n.SphereGeometry(0.043, 6, 5), o * 2);
  let v = new n.MeshStandardMaterial({
      color: "#2a1a12",
      roughness: 0.55
    }),
    S = new n.InstancedMesh(new n.BoxGeometry(0.46, 0.08, 0.44), v, i),
    P = new n.InstancedMesh(new n.BoxGeometry(0.46, 0.5, 0.06), v, i),
    A = new n.InstancedMesh(new n.BoxGeometry(0.4, 0.4, 0.38), new n.MeshStandardMaterial({
      color: "#141010",
      roughness: 0.8
    }), i);
  [S, P, A].forEach(h => {
    h.frustumCulled = !1, B.add(h);
  });
  let E = new n.Matrix4(),
    T = new n.Matrix4(),
    L = new n.Quaternion(),
    r = new n.Vector3(),
    c = new n.Vector3(1, 1, 1),
    k = new n.Vector3(0, 1, 0),
    z = new n.Color();
  e.forEach((h, g) => {
    T.compose(r.set(h.x, h.y, h.z), L.setFromAxisAngle(k, h.yaw), c.set(1, 1, 1)), S.setMatrixAt(g, E.copy(T).multiply(new n.Matrix4().makeTranslation(0, 0.44, -0.02))), P.setMatrixAt(g, E.copy(T).multiply(new n.Matrix4().makeTranslation(0, 0.72, -0.23))), A.setMatrixAt(g, E.copy(T).multiply(new n.Matrix4().makeTranslation(0, 0.2, -0.02)));
  });
  let J = h => h[Math.random() * h.length | 0];
  a.forEach((h, g) => {
    h.scale = U(0.92, 1.08), h.skin = J(l), h.shirt = J(s), h.pants = J(u), h.hairC = J(p), h.bald = Math.random() < 0.12, h.long = !h.bald && Math.random() < 0.35, h.phase = U(0, 6.28), h.speed = U(7, 10), h.clap = 0, h.clapT = 0, h.groan = 0, h.delay = 0, h.lean = U(-0.05, 0.12), h.base = new n.Matrix4().compose(new n.Vector3(h.x, h.y, h.z), new n.Quaternion().setFromAxisAngle(k, h.yaw), new n.Vector3(h.scale, h.scale, h.scale)), h.inv = h.base.clone().invert();
    let C = (y, ne, pe) => f[y].setColorAt(ne, z.set(pe));
    C("torso", g, h.shirt), C("pelvis", g, h.pants), C("head", g, h.skin), C("neck", g, h.skin), C("hair", g, h.hairC), C("hairLong", g, h.hairC);
    for (let y of [0, 1]) C("thigh", g * 2 + y, h.pants), C("shin", g * 2 + y, h.pants), C("shoe", g * 2 + y, "#15110e"), C("upper", g * 2 + y, h.shirt), C("fore", g * 2 + y, Math.random() < 0.5 ? h.shirt : h.skin), C("hand", g * 2 + y, h.skin);
  });
  let te = new n.Vector3(),
    Xe = new n.Vector3(),
    re = new n.Vector3();
  function ge(h, g, C, y, ne) {
    re.subVectors(ne, y);
    let pe = re.length();
    L.setFromUnitVectors(k, re.divideScalar(pe)), E.compose(r.addVectors(y, ne).multiplyScalar(0.5), L, c.set(1, 1, 1)), h.setMatrixAt(g, E.premultiply(C));
  }
  function ue(h, g, C, y, ne, pe, Ze = 0, Ue = 0, je = 1, Mt = 1, wt = 1) {
    E.compose(r.set(y, ne, pe), L.setFromEuler(new n.Euler(Ze, Ue, 0)), c.set(je, Mt, wt)), h.setMatrixAt(g, E.premultiply(C));
  }
  let rn = new n.Vector3(),
    sn = new n.Vector3(),
    Qe = new n.Vector3(),
    Je = new n.Vector3();
  function Ja(h, g, C) {
    let y = h.base,
      ne = Math.sin(C * 1.6 + h.phase) * 0.006,
      pe = h.clap * 0.03,
      Ze = h.lean + h.clap * 0.08 - h.groan * 0.1;
    ue(f.pelvis, g, y, 0, 0.53, -0.02), ue(f.torso, g, y, 0, 0.83 + ne + pe, -0.02 + Ze * 0.3, Ze, 0, 1.12, 1, 0.78);
    let Ue = 1.08 + ne + pe,
      je = Ze * 0.6;
    ue(f.neck, g, y, 0, Ue, je * 0.8), rn.set(m.x, w, m.z).applyMatrix4(h.inv);
    let Mt = n.MathUtils.clamp(Math.atan2(rn.x, rn.z), -0.7, 0.7),
      wt = -0.25 - h.groan * 0.35;
    ue(f.head, g, y, 0, Ue + 0.12, je + 0.01, wt, Mt, 0.95, 1.08, 1), h.bald ? ue(f.hair, g, y, 0, -10, 0, 0, 0, 0.001, 0.001, 0.001) : ue(f.hair, g, y, 0, Ue + 0.135, je - 0.008, wt - 0.25, Mt, 1, 1.02, 1.04), h.long ? ue(f.hairLong, g, y, 0, Ue + 0.06, je - 0.085, wt * 0.3, Mt, 1, 1, 1) : ue(f.hairLong, g, y, 0, -10, 0, 0, 0, 0.001, 0.001, 0.001);
    for (let Qn of [0, 1]) {
      let fe = Qn ? 1 : -1,
        et = g * 2 + Qn;
      ge(f.thigh, et, y, te.set(fe * 0.1, 0.52, -0.02), Xe.set(fe * 0.11, 0.5, 0.36)), ge(f.shin, et, y, te.set(fe * 0.11, 0.5, 0.38), Xe.set(fe * 0.12, 0.08, 0.42)), ue(f.shoe, et, y, fe * 0.12, 0.035, 0.47), sn.set(fe * 0.2, 0.99 + ne + pe, Ze * 0.3);
      let to = 0.5 + 0.5 * Math.sin(C * h.speed + h.phase),
        no = te.set(fe * 0.13, 0.6, 0.3),
        ao = Xe.set(fe * (0.012 + 0.08 * to), 1.02 + pe + h.clap * 0.08, 0.3),
        oo = re.set(fe * 0.1, Ue + 0.16, je + 0.05);
      Je.copy(no).lerp(ao, h.clap).lerp(oo, h.groan), Qe.lerpVectors(sn, Je, 0.5), Qe.x += fe * (0.07 + h.groan * 0.12), Qe.y -= 0.13 * (1 - h.groan * 0.6), Qe.z -= 0.02, ge(f.upper, et, y, sn, Qe), ge(f.fore, et, y, Qe, Je), ue(f.hand, et, y, Je.x, Je.y, Je.z);
    }
  }
  let pi = 0,
    hn = !0;
  function Xn(h, g) {
    let C = !1;
    return a.forEach((y, ne) => {
      y.delay > 0 ? (y.delay -= h, C = !0) : y.clapT > 0 ? (y.clapT -= h, y.clap = Math.min(1, y.clap + h * 5), C = !0) : y.clap > 0 && (y.clap = Math.max(0, y.clap - h * 2.5), C = !0), y.groanT > 0 ? (y.groanT -= h, y.groan = Math.min(1, y.groan + h * 4), C = !0) : y.groan > 0 && (y.groan = Math.max(0, y.groan - h * 1.5), C = !0);
    }), (C || hn) && (a.forEach((y, ne) => Ja(y, ne, g)), Object.values(f).forEach(y => y.instanceMatrix.needsUpdate = !0), hn = !1), C;
  }
  function Za(h = 1) {
    a.forEach(g => {
      Math.random() < 0.45 + 0.5 * h && (g.delay = U(0, 0.45), g.clapT = U(1.6, 2.6) * (0.6 + h * 0.6), g.speed = U(7, 10), g.groanT = 0);
    });
  }
  function eo() {
    a.forEach(h => {
      Math.random() < 0.55 && (h.groanT = U(0.9, 1.5), h.clapT = 0);
    });
  }
  return Object.values(f).forEach(h => {
    h.instanceColor && (h.instanceColor.needsUpdate = !0);
  }), Xn(0, 0), {
    update: Xn,
    clap: Za,
    groan: eo,
    poke: () => hn = !0
  };
})();
function Vn(e, t) {
  let a = new n.BufferGeometry().setFromPoints([new n.Vector3(), new n.Vector3()]),
    o = new n.Line(a, new n.LineDashedMaterial({
      color: e,
      transparent: !0,
      opacity: t,
      dashSize: 0.02,
      gapSize: 0.012,
      depthWrite: !1
    }));
  return o.frustumCulled = !1, o.renderOrder = 2, B.add(o), o;
}
var dn = Vn("#ffffff", 0.75),
  un = Vn("#ffe7a8", 0.8),
  pn = Vn("#9fd3ff", 0.55);
function fn(e, t, a, o, i) {
  let l = e.geometry.attributes.position;
  l.setXYZ(0, t, 0.003, a), l.setXYZ(1, o, 0.003, i), l.needsUpdate = !0, e.computeLineDistances();
}
var Ut = new n.Mesh(Ca, new n.MeshBasicMaterial({
  color: "#ffffff",
  transparent: !0,
  opacity: 0.18,
  depthWrite: !1
}));
B.add(Ut);
var gt = new n.Mesh(new n.RingGeometry(w * 0.88, w, 40), new n.MeshBasicMaterial({
  color: "#ffffff",
  transparent: !0,
  opacity: 0.7,
  depthWrite: !1
}));
gt.rotation.x = -Math.PI / 2;
B.add(gt);
var it = new n.Mesh(new n.RingGeometry(w * 1.3, w * 1.55, 40), new n.MeshBasicMaterial({
  color: "#d4b06a",
  transparent: !0,
  opacity: 0.8,
  depthWrite: !1
}));
it.rotation.x = -Math.PI / 2;
B.add(it);
var Ct = new n.Mesh(new n.RingGeometry(w * 1.25, w * 1.5, 40), new n.MeshBasicMaterial({
  color: "#ffe7a8",
  transparent: !0,
  opacity: 0,
  depthWrite: !1
}));
Ct.rotation.x = -Math.PI / 2;
B.add(Ct);
var tt = 0,
  Q = null,
  $t = [],
  Ot = [];
for (let e of Re) {
  let t = new n.Mesh(new n.RingGeometry(e.r + 0.008, e.r + 0.024, 40), new n.MeshBasicMaterial({
    color: "#ffffff",
    transparent: !0,
    opacity: 0.35,
    depthWrite: !1
  }));
  t.rotation.x = -Math.PI / 2, t.position.set(e.x, ke + 0.004, e.z), t.visible = !1, t.renderOrder = 3, B.add(t), $t.push(t);
  let a = new n.Mesh(new n.CircleGeometry(0.13, 16), new n.MeshBasicMaterial({
    colorWrite: !1,
    depthWrite: !1
  }));
  a.rotation.x = -Math.PI / 2, a.position.set(e.x, ke + 0.005, e.z), a.visible = !1, B.add(a), Ot.push(a);
}
function Gt() {
  let e = $[D];
  return b === "aim" && !!e.group && Yn(e.group).every(t => !t.on);
}
function bn() {
  if (Q = null, !Gt()) return It();
  let e = W[8],
    t = 1e9;
  Re.forEach((a, o) => {
    let i = Math.hypot(a.x - e.x, a.z - e.z);
    i < t && (t = i, Q = o);
  }), It();
}
function It() {
  let e = Gt();
  $t.forEach((t, a) => {
    t.visible = e, Ot[a].visible = e, t.material.color.set(a === Q ? "#e7c878" : "#ffffff"), t.material.opacity = a === Q ? 0.95 : 0.3;
  }), e && q(`${$[D].name} on the 8`, `Called pocket shown in gold \xB7 ${ln ? "tap" : "click"} another to change`);
}
var Go = 0.5,
  Ra = 0.3,
  $a = 0.15,
  oa = 0.28,
  Ao = "./_runtime_resources/a86bfaeb027f7c938fed5a8f.mp3",
  To = "./_runtime_resources/ffe43922c43145eab219d60b.mp3",
  Lo = "./_runtime_resources/d73744cf192fc26087a775cd.mp3",
  Fo = "./_runtime_resources/996c6c06b7db87c0024b3d3c.mp3",
  Ho = "./_runtime_resources/031657bcb15005ca3d47c74b.mp3";
function yt(e, t = null) {
  return t;
}
var K = new (window.AudioContext || window.webkitAudioContext)(),
  Ga = null,
  Aa = null,
  Ta = null,
  gn = null,
  zn = null,
  ze = null,
  xe = null,
  Ce = !1,
  Un = !1,
  Sn = !1,
  mn = 0,
  ia = 5;
function la() {
  mn++, _e("sounds", mn / ia, `Loading sounds ${mn}/${ia}`);
}
async function vt(e) {
  try {
    let t = new AbortController(),
      a = setTimeout(() => t.abort(), 15e3),
      o = await fetch(e, {
        signal: t.signal
      });
    clearTimeout(a);
    let i = await K.decodeAudioData(await o.arrayBuffer());
    return la(), i;
  } catch (t) {
    return console.error("Error loading sound:", e, t), la(), null;
  }
}
function Wo() {
  vt(yt("cue_strike_sound", Ao)).then(e => Ga = e), vt(yt("pocket_sound", To)).then(e => Aa = e), vt(yt("white_ball_pocketed_sound", Lo)).then(e => Ta = e), vt(yt("background_music", Fo)).then(e => {
    gn = e, Un && !Ce && En();
  }), vt(yt("cue_pull_sound", Ho)).then(e => zn = e);
}
function nn(e, t) {
  if (!(!e || Ce)) try {
    K.state === "suspended" && K.resume();
    let a = K.createBufferSource();
    a.buffer = e;
    let o = K.createGain();
    o.gain.value = t, a.connect(o), o.connect(K.destination), a.start(0);
  } catch {}
}
var Vo = () => nn(Ta, Ra),
  Uo = () => nn(Aa, Ra),
  jo = e => nn(Ga, Math.max(0, Math.min(1, e)) * Go);
function En() {
  if (!(!gn || Ce || !Un || ze)) try {
    K.state === "suspended" && K.resume(), ze = K.createBufferSource(), ze.buffer = gn, ze.loop = !0, xe = K.createGain(), xe.gain.value = $a, ze.connect(xe), xe.connect(K.destination), ze.onended = () => {
      ze = null, xe = null;
    }, ze.start(0);
  } catch {
    ze = null, xe = null;
  }
}
function jn() {
  Un = !0, K.state === "suspended" ? K.resume().then(() => {
    Ce || En();
  }).catch(() => {}) : Ce || En();
}
var Bt = jn;
function Dn() {
  if (!Ce) {
    if (jn(), zn) return nn(zn, oa);
    try {
      let e = K.sampleRate,
        t = K.createBuffer(1, Math.floor(e * 0.18), e),
        a = t.getChannelData(0);
      for (let s = 0; s < a.length; s++) {
        let u = s / a.length;
        a[s] = (Math.random() * 2 - 1) * Math.sin(Math.PI * u) * (1 - u * 0.35) * 0.5;
      }
      let o = K.createBufferSource();
      o.buffer = t;
      let i = K.createBiquadFilter();
      i.type = "bandpass", i.frequency.value = 1150, i.Q.value = 0.75;
      let l = K.createGain();
      l.gain.value = oa, o.connect(i), i.connect(l), l.connect(K.destination), o.start(0);
    } catch {}
  }
}
function Do(e) {
  Ce = !!e, Ce ? xe && (xe.gain.value = 0) : (jn(), xe && (xe.gain.value = $a));
  let t = document.getElementById("bMute");
  t && (t.textContent = Ce ? "Sound: off" : "Sound: on");
}
Wo();
var $ = [0, 1].map(e => ({
    name: `Player ${e + 1}`,
    group: null,
    frames: 0,
    stats: null
  })),
  Pn = () => ({
    shots: 0,
    pots: 0,
    fouls: 0,
    run: 0,
    bestRun: 0,
    points: 0
  }),
  he = !1,
  La = 0,
  Fa = () => Math.max(0, Math.round((300 - (performance.now() - La) / 1e3) / 3)),
  ae = {
    ball: 10,
    extra: 5,
    eight: 30,
    win: 20,
    foul: -5,
    wrongFirst: -10,
    opponentBall: -5
  };
function $e(e, t) {
  return t = Number(t) || 0, e.stats.points += t, e.total = (e.total || 0) + t, t;
}
var _t = 0,
  zt = 0,
  D = 0,
  b = "aim",
  Ve = !0,
  ht = !0,
  Ee = !0,
  G = 0,
  Y = 0,
  de = 0.8,
  Ie = 0.36,
  Be = "player",
  Z = 0,
  ee = 0,
  nt = null,
  we = null,
  N = null;
function No() {
  let e = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15].sort(() => Math.random() - 0.5),
    t = e.findIndex(p => p < 8),
    a = e.findIndex(p => p > 8),
    o = e[t],
    i = e[a];
  Math.random() < 0.5 && ([o, i] = [i, o]);
  let l = e.filter(p => p !== o && p !== i),
    s = Math.sqrt(3) * (w + 2e-4),
    u = 0;
  for (let p = 0; p < 5; p++) for (let x = 0; x <= p; x++) {
    let d;
    p === 2 && x === 1 ? d = 8 : p === 4 && x === 0 ? d = o : p === 4 && x === 4 ? d = i : d = l[u++];
    let f = W[d];
    f.x = ot.x + p * s + U(-2e-4, 2e-4), f.z = (x - p / 2) * 2 * (w + 2e-4);
  }
}
function Rt() {
  $.forEach(e => {
    e.frames = 0, e.total = 0;
  }), _t = 0, zt = 0, Ha();
}
function Ha() {
  zt++, $.forEach(e => e.stats = Pn());
  for (let e of W) e.on = !0, e.falling = null, e.vx = e.vz = e.wx = e.wy = e.wz = 0, e.mesh.visible = !0, e.mesh.quaternion.setFromEuler(new n.Euler(U(0, 6), U(0, 6), U(0, 6)));
  No(), m.x = Ne.x, m.z = 0, $.forEach(e => e.group = null), D = he ? 0 : _t, La = performance.now(), b = "aim", Ve = !0, ht = !0, Ee = !0, G = 0, Y = 0, N = null, Q = null, $t.forEach(e => e.visible = !1), q(`${$[D].name} to break`, "Drag the cue ball to place it"), ja(), oe();
}
var xn = 9.81,
  Yo = 0.2,
  Oo = 0.011,
  _o = 0.012,
  Ko = 0.06,
  qo = 0.16,
  Xo = 0.94,
  ra = 0.009,
  sa = new n.Quaternion(),
  ha = new n.Vector3(),
  Wa = e => e.on && !e.falling && (e.vx !== 0 || e.vz !== 0 || Math.hypot(e.vx + w * e.wz, e.vz - w * e.wx) > 0.001);
function Va(e, t) {
  let a = Math.hypot(e.vx, e.vz);
  e.falling = {
    t: 0,
    x0: e.x,
    z0: e.z,
    P: t
  }, e.vx = e.vz = 0, e.wx = e.wy = e.wz = 0, we && we.potted.push(e.n), e.n === 8 && we && (we.eightPocket = Re.indexOf(t)), Sn || (e.n === 0 ? Vo() : Uo(), Sn = !0), void 0, e.n === 0 ? We.groan() : e.n !== 8 && We.clap(Math.min(1, 0.5 + a));
}
function Qo(e, t, a, o, i) {
  let l = o - t,
    s = i - a,
    u = l * l + s * s,
    p = null,
    x = 1 / 0;
  for (let d of Re) {
    let f = t - d.x,
      M = a - d.z,
      v = f * f + M * M - d.r * d.r,
      S = o - d.x,
      P = i - d.z,
      A = S * S + P * P - d.r * d.r;
    if (v <= 0) {
      p = d, x = 0;
      break;
    }
    if (A <= 0) {
      if (u > 1e-14) {
        let E = 2 * (f * l + M * s),
          T = E * E - 4 * u * v,
          L = T > 0 ? (-E - Math.sqrt(T)) / (2 * u) : 1;
        L >= 0 && L <= 1 && L < x && (x = L, p = d);
      } else 1 < x && (x = 1, p = d);
      continue;
    }
    if (u > 1e-14) {
      let E = 2 * (f * l + M * s),
        T = E * E - 4 * u * v;
      if (T > 1e-12) {
        let L = Math.sqrt(T),
          r = (-E - L) / (2 * u),
          c = (-E + L) / (2 * u);
        r >= 0 && r <= 1 && c > r && r < x && (x = r, p = d);
      }
    }
  }
  return p ? (e.x = t + l * x, e.z = a + s * x, Va(e, p), !0) : !1;
}
function ca(e) {
  for (let t of Re) if (Math.hypot(e.x - t.x, e.z - t.z) <= t.r) return Va(e, t), !0;
  return !1;
}
function Jo(e, t) {
  let a = null,
    o = 1 / 0,
    i = 0;
  for (let v of Re) {
    let S = Math.hypot(e.x - v.x, e.z - v.z),
      P = S - v.r;
    P > 0 && P < ra && P < o && (o = P, a = v, i = S);
  }
  if (!a) return;
  let l = (a.x - e.x) / i,
    s = (a.z - e.z) / i,
    u = Math.hypot(e.vx, e.vz),
    p = 1 - o / ra,
    x = 1 - n.MathUtils.smoothstep(u, 0.12, 0.85),
    d = 0.018 + 0.055 * p,
    f = 0.16 + 0.62 * p * p,
    M = n.MathUtils.lerp(d, f, x);
  e.vx += l * M * t, e.vz += s * M * t;
}
function Zo(e) {
  for (let t of W) {
    if (!t.on || t.falling) continue;
    let a = t.vx + w * t.wz,
      o = t.vz - w * t.wx,
      i = Math.hypot(a, o),
      l = Yo * xn * e;
    if (i > 1e-4) {
      if (i <= 3.5 * l) t.vx -= a * 2 / 7, t.vz -= o * 2 / 7, t.wz = -t.vx / w, t.wx = t.vz / w;else {
        let d = a / i,
          f = o / i,
          M = 2.5 * l / w;
        t.vx -= l * d, t.vz -= l * f, t.wx += M * f, t.wz -= M * d;
      }
    } else {
      let d = Math.hypot(t.vx, t.vz);
      if (d > 0) {
        let f = d - (Oo * xn + 0.015 * d) * e;
        f < 0.003 ? t.vx = t.vz = 0 : (t.vx *= f / d, t.vz *= f / d);
      }
      t.wz = -t.vx / w, t.wx = t.vz / w;
    }
    let s = 2.5 * _o * xn / w * e;
    t.wy = Math.abs(t.wy) <= s ? 0 : t.wy - Math.sign(t.wy) * s, t.vx === 0 && t.vz === 0 && Math.abs(t.wx) + Math.abs(t.wz) < 0.05 && (t.wx = t.wz = 0), Jo(t, e);
    let u = t.x,
      p = t.z;
    if (t.x += t.vx * e, t.z += t.vz * e, Qo(t, u, p, t.x, t.z)) continue;
    let x = Math.hypot(t.wx, t.wy, t.wz);
    x > 0 && (ha.set(t.wx / x, t.wy / x, t.wz / x), sa.setFromAxisAngle(ha, x * e), t.mesh.quaternion.premultiply(sa));
  }
  for (let t = 0; t < 16; t++) {
    let a = W[t];
    if (!(!a.on || a.falling)) for (let o = t + 1; o < 16; o++) {
      let i = W[o];
      if (!i.on || i.falling) continue;
      let l = i.x - a.x,
        s = i.z - a.z,
        u = l * l + s * s;
      if (u >= 4 * w * w || u === 0) continue;
      let p = Math.sqrt(u),
        x = l / p,
        d = s / p,
        f = (a.vx - i.vx) * x + (a.vz - i.vz) * d;
      if (f > 0) {
        let v = (1 + Xo) / 2 * f;
        a.vx -= v * x, a.vz -= v * d, i.vx += v * x, i.vz += v * d;
        let S = -d,
          P = x,
          A = (a.vx - i.vx) * S + (a.vz - i.vz) * P - w * (a.wy + i.wy),
          E = Math.sign(A) * Math.min(Ko * v, Math.abs(A) / 7);
        a.vx -= E * S, a.vz -= E * P, i.vx += E * S, i.vz += E * P, a.wy += 2.5 * E / w, i.wy += 2.5 * E / w, f > 0.08 && jo(Math.min(0.8, Math.max(0.2, f / 5))), we && we.firstHit == null && (a.n === 0 || i.n === 0) && (we.firstHit = a.n === 0 ? i.n : a.n);
      }
      let M = (2 * w - p) / 2;
      a.x -= x * M, a.z -= d * M, i.x += x * M, i.z += d * M;
    }
  }
  for (let t of W) !t.on || t.falling || ca(t);
  for (let t of W) if (!(!t.on || t.falling)) {
    for (let a of Pa) {
      let o = a.bx - a.ax,
        i = a.bz - a.az,
        l = ((t.x - a.ax) * o + (t.z - a.az) * i) / (o * o + i * i);
      l = Math.max(0, Math.min(1, l));
      let s = a.ax + o * l,
        u = a.az + i * l,
        p = t.x - s,
        x = t.z - u,
        d = p * p + x * x;
      if (d >= w * w || d === 0) continue;
      let f = Math.sqrt(d),
        M = p / f,
        v = x / f,
        S = t.vx * M + t.vz * v;
      if (S < 0) {
        let P = -(1 + Math.max(0.62, 0.88 - 0.03 * -S)) * S;
        t.vx += P * M, t.vz += P * v;
        let A = -v,
          E = M,
          T = t.vx * A + t.vz * E + w * t.wy,
          L = -Math.sign(T) * Math.min(qo * P, Math.abs(T) / 3.5);
        t.vx += L * A, t.vz += L * E, t.wy += 2.5 * L / w, t.wx *= 0.8, t.wz *= 0.8;
      }
      t.x += M * (w - f), t.z += v * (w - f);
    }
    t.falling || ca(t);
  }
}
var Yn = e => W.filter(t => Ge(t.n) === e),
  an = e => e.group && Yn(e.group).every(t => !t.on),
  Ua = (e, t, a) => W.every(o => o === a || !o.on || Math.hypot(o.x - e, o.z - t) > 2 * w + 0.001);
function Ft(e, t, a) {
  for (e.on = !0, e.falling = null, e.mesh.visible = !0, e.vx = e.vz = e.wx = e.wy = e.wz = 0; !Ua(t, a, e);) t += 2 * w + 0.002;
  e.x = t, e.z = a;
}
function ei() {
  let e = D,
    t = $[e],
    a = $[1 - e],
    {
      firstHit: o,
      potted: i,
      groupAtStart: l = t.group,
      onEightAtStart: s = !1
    } = we,
    u = i.filter(z => z !== 0 && z !== 8),
    p = i.includes(0),
    x = i.includes(8),
    d = t.stats;
  if (d.shots++, he) {
    let z = 0,
      J = [];
    p && (z += $e(t, ae.foul), J.push(`${ae.foul} scratch`), d.fouls++, d.run = 0);
    let te = u.reduce((re, ge) => re + ge, 0);
    te ? ($e(t, te), z += te, J.unshift(`+${te} (${u.join(" + ")})`), d.pots += u.length, p || (d.run += u.length, d.bestRun = Math.max(d.bestRun, d.run))) : p || (d.run = 0);
    let Xe = Ee;
    if (jt(e, z, J.join(" \xB7 ") || "No points"), Ee = !1, x && Xe && Ft(W[8], ot.x, ot.z), x && !Xe) {
      if (b === "over") return;
      let re = Fa();
      re && $e(t, re), b = "over", oe(), We.clap(1.3), void 0;
      let ge = t.stats.points;
      return q(`Final score: ${ge} pts`, `${d.pots} balls in ${d.shots} shots${re ? ` \xB7 +${re} speed bonus` : ""}`), showLocalResults();
    }
    return p && Ft(m, Ne.x, Ne.z), p ? (Ve = !0, ht = !1, q("Foul: Scratch", "Ball in hand")) : te ? q("Nice pot", `+${te} points`) : q("No pot", "Keep going \xB7 the 8 ends the game"), b = "aim", Y = 0, Kt(), bn(), oe();
  }
  let f = o == null ? null : Ge(o),
    M = null,
    v = 0,
    S = "";
  p ? (M = "Scratch", v = ae.foul) : o == null ? (M = "No ball hit", v = ae.foul) : l ? s ? o !== 8 && (M = "Wrong ball first", v = ae.wrongFirst, S = "You must hit the 8 first") : f !== l && (M = "Wrong ball first", v = ae.wrongFirst, S = `Hit ${f === "stripe" ? "a stripe" : f === "solid" ? "a solid" : "the 8"} first \xB7 You're on ${l === "solid" ? "solids" : "stripes"}`) : o === 8 && !Ee && (M = "Hit the 8 first", v = ae.foul);
  let P = l ? u.filter(z => Ge(z) === l) : u,
    A = l ? u.filter(z => Ge(z) !== l) : [],
    E = P.length,
    T = A.length,
    L = 0,
    r = [];
  if (v && (L += $e(t, v), r.push(`${v} ${M === "Wrong ball first" ? "wrong first" : M.toLowerCase()}`)), T) {
    let z = T * ae.opponentBall;
    L += $e(t, z), r.push(`${z} ${T} opponent ball${T > 1 ? "s" : ""}`);
  }
  if (x) if (Ee) Ft(W[8], ot.x, ot.z);else {
    let z = Q == null || we.eightPocket === Q,
      J = !M && s && z;
    if (J) {
      let te = ae.eight + ae.win;
      L += $e(t, te), r.push(`+${te} 8-ball win`), d.pots++, d.run++, d.bestRun = Math.max(d.bestRun, d.run);
    } else M && d.fouls++;
    return jt(e, L, r.join(" \xB7 ") || "No points"), oe(), !J && !M && s && !z ? da(1 - e, `${t.name} sank the 8 in the wrong pocket.`) : da(J ? e : 1 - e, J ? `${t.name} sank the 8.` : M ? `${t.name} fouled on the 8 (${S || M.toLowerCase()}).` : `${t.name} sank the 8 too early.`);
  }
  !t.group && !Ee && !M && u.length && (t.group = Ge(u[0]), a.group = t.group === "solid" ? "stripe" : "solid");
  let c = t.group ? u.some(z => Ge(z) === t.group) : u.length > 0,
    k = t.group ? u.filter(z => Ge(z) === t.group).length : u.length;
  if (M) d.fouls++, d.run = 0;else if (c) {
    let z = k * ae.ball + Math.max(0, k - 1) * ae.extra;
    z && (L += $e(t, z), r.unshift(`+${z} ${k} own ball${k > 1 ? "s" : ""}`)), d.pots += k, d.run += k, d.bestRun = Math.max(d.bestRun, d.run);
  } else d.run = 0;
  if (jt(e, L, r.join(" \xB7 ") || "No points"), Ee = !1, p && Ft(m, Ne.x, Ne.z), M) {
    if (D = 1 - e, Ve = !0, ht = !1, M === "Wrong ball first" && l && !s) {
      let z = f === "stripe" ? "a stripe" : f === "solid" ? "a solid" : "the 8",
        J = l === "solid" ? "solids" : "stripes";
      q(`Foul: Hit ${z} first`, `You're on ${J} \xB7 ${$[D].name} has ball in hand`);
    } else M === "Wrong ball first" && s ? q("Foul: You must hit the 8 first", `${$[D].name} has ball in hand`) : q(`Foul: ${M}`, `${$[D].name} has ball in hand`);
  } else c ? q(`${t.name} again`, t.group && an(t) ? "Now the 8" : "") : (D = 1 - e, q(`${$[D].name}'s turn`, ""));
  b = "aim", Y = 0, Kt(), bn(), oe();
}
function da(e, t) {
  if (b === "over") return;
  let a = Fa();
  a && $e($[e], a), a && (t += ` \xB7 +${a} speed bonus`), b = "over", $[e].frames++, oe(), We.clap(1.3), void 0, q(`${$[e].name} wins`, t);
  let o = e,
    i = $[o].total || $[o].stats.points || 0;
  showLocalResults();
}
function Kt() {
  let e = $[D],
    t = e.group ? an(e) ? "eight" : e.group : null,
    a = null,
    o = 1e9;
  for (let i of W) {
    if (!i.on || i.n === 0 || (t ? Ge(i.n) !== t : i.n === 8)) continue;
    let l = Math.hypot(i.x - m.x, i.z - m.z);
    l < o && (o = l, a = i);
  }
  N = a, a && (G = Math.atan2(a.z - m.z, a.x - m.x), ye = 0);
}
function ti(e) {
  if (!e || !e.on || e.n === 0 || e.falling) {
    N = null;
    return;
  }
  N = e, G = Math.atan2(e.z - m.z, e.x - m.x), ye = 0;
}
function ni() {
  if (!N || !N.on || N.falling) return 1 / 0;
  let e = Math.atan2(N.z - m.z, N.x - m.x);
  return Math.abs(Math.atan2(Math.sin(G - e), Math.cos(G - e)));
}
function ai() {
  let e = j / 2 - Math.abs(m.x),
    t = H / 2 - Math.abs(m.z),
    a = Math.min(e, t);
  return n.MathUtils.clamp((0.16 - a) / 0.16, 0, 1);
}
function on(e, t = !1) {
  if (!t && !ve()) {
    Y = 0;
    return;
  }
  if (b !== "aim" || e < 0.02) {
    Y = 0;
    return;
  }
  if (!t && Gt() && Q == null) {
    Y = 0, q("Call a pocket for the 8", ln ? "Tap a pocket" : "Click a pocket");
    return;
  }
  Bt(), void 0, b = "shot", nt = {
    t: 0,
    pull: e * 0.28,
    pw: e
  }, R.yaw = G + ye, R.pitch = Ie, R.dist = de, R.user = !1, De.set(m.x, w, m.z), Ve = !1, we = {
    firstHit: null,
    potted: [],
    eightPocket: null,
    groupAtStart: $[D].group,
    onEightAtStart: !!$[D].group && an($[D])
  }, $t.forEach(a => a.visible = !1), Sn = !1, qn = D, t || void 0;
}
var I = e => document.getElementById(e);
function q(e, t) {
  I("msg").innerHTML = `${e}${t ? `<small>${t}</small>` : ""}`;
}
function ua(e, t) {
  let a = wa(e),
    o = e > 8 ? `linear-gradient(#f5f1e6 28%, ${a} 28% 72%, #f5f1e6 72%)` : a;
  return `<span class="chip${t ? " gone" : ""}" style="background:${o}"></span>`;
}
var kn = [0, 0];
function jt(e, t, a = "") {
  let o = I("scorePop" + e);
  if (!o) return;
  clearTimeout(kn[e]), Rn = [e, t, a];
  let i = t > 0 ? "+" : t < 0 ? "\u2212" : "";
  o.textContent = `${i}${Math.abs(t)}${a ? "  " + a : ""}`, o.className = `scorePop ${t > 0 ? "gain" : t < 0 ? "loss" : "zero"}`, requestAnimationFrame(() => o.classList.add("show")), kn[e] = setTimeout(() => o.classList.remove("show"), 2100);
}
function ja() {
  [0, 1].forEach(e => {
    let t = I("scorePop" + e);
    t && (clearTimeout(kn[e]), t.className = "scorePop", t.textContent = "");
  });
}
function oe() {
  $.forEach((e, t) => {
    let a = I("p" + t);
    a.style.display = he && t === 1 ? "none" : "", a.classList.toggle("on", t === D && b !== "over"), a.querySelector(".pname").innerHTML = `${e.name}${""} <span class="fr">${e.frames}</span> <span class="pts">${e.stats ? e.stats.points : 0} pts</span>`, a.querySelector(".grp").textContent = he ? `Ball numbers \xB7 ${e.stats ? e.stats.shots : 0} shots` : e.group ? (e.group === "solid" ? "Solids" : "Stripes") + (an(e) ? " \xB7 on the 8" : "") : "Open table", a.querySelector(".chips").innerHTML = e.group ? Yn(e.group).map(o => ua(o.n, !o.on)).join("") + ua(8, !W[8].on) : "";
  });
}
function Dt(e) {
  I("card").innerHTML = e, I("overlay").classList.remove("hide");
}
function lt() {
  I("overlay").classList.add("hide");
}
var Te = new n.Raycaster(),
  ct = new n.Vector2(),
  oi = new n.Plane(new n.Vector3(0, 1, 0), -w),
  pa = new n.Vector3();
function Da(e) {
  return ct.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), Te.setFromCamera(ct, X), Te.ray.intersectPlane(oi, pa) ? pa : null;
}
function On(e) {
  let t = Da(e);
  t && Math.hypot(t.x - m.x, t.z - m.z) > w && (N = null, G = Math.atan2(t.z - m.z, t.x - m.x));
}
function rt(e, t) {
  Be === "top" && (Be = "player", Kn()), b === "aim" && N && (N = null), b === "aim" ? ye += e * 0.006 : (R.yaw += e * 0.006, R.user = !0), Ie = n.MathUtils.clamp(Ie + t * 0.005, 0.03, 1.5), b !== "aim" && (R.pitch = n.MathUtils.clamp(R.pitch + t * 0.005, 0.03, 1.5), R.user = !0);
}
var ie = new Map(),
  V = null,
  me = null,
  bt = !1,
  Ke = _.domElement;
Ke.addEventListener("contextmenu", e => e.preventDefault());
Ke.addEventListener("pointerdown", e => {
  if (Bt(), Ke.setPointerCapture(e.pointerId), ie.set(e.pointerId, {
    x: e.clientX,
    y: e.clientY
  }), ie.size === 2) {
    let [o, i] = [...ie.values()];
    me = {
      d: Math.hypot(o.x - i.x, o.y - i.y),
      mx: (o.x + i.x) / 2,
      my: (o.y + i.y) / 2,
      dist: de
    }, V = null;
    return;
  }
  let t = performance.now(),
    a = e.button === 2 || e.ctrlKey || bt || b !== "aim" || !ve() ? "orbit" : "aim";
  if (a === "aim") {
    ct.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), Te.setFromCamera(ct, X);
    let o = Pe.visible && Te.intersectObject(Pe, !0).length > 0,
      i = Te.intersectObject(m.mesh, !1).length > 0;
    Ve && i ? a = "ball" : o && (a = "maybePull");
  }
  a === "maybePull" && li(e), V = {
    mode: a,
    x: e.clientX,
    y: e.clientY,
    x0: e.clientX,
    y0: e.clientY,
    t0: performance.now()
  }, a === "aim" && Be === "top" && On(e);
});
Ke.addEventListener("pointermove", e => {
  if (!ie.has(e.pointerId)) return;
  if (ie.set(e.pointerId, {
    x: e.clientX,
    y: e.clientY
  }), ie.size === 2 && me) {
    let [i, l] = [...ie.values()],
      s = (i.x + l.x) / 2,
      u = (i.y + l.y) / 2;
    de = n.MathUtils.clamp(me.dist * me.d / Math.hypot(i.x - l.x, i.y - l.y), 0.3, 3.5), R.dist = Math.max(R.dist, de), rt(s - me.mx, u - me.my), me.mx = s, me.my = u;
    return;
  }
  if (!V) return;
  let t = e.clientX - V.x,
    a = e.clientY - V.y;
  if (V.x = e.clientX, V.y = e.clientY, V.mode === "ball") {
    let i = Da(e);
    if (!i) return;
    let l = n.MathUtils.clamp(i.x, -j / 2 + w, ht ? Ne.x : j / 2 - w),
      s = n.MathUtils.clamp(i.z, -H / 2 + w, H / 2 - w);
    Ua(l, s, m) && (m.x = l, m.z = s);
    return;
  }
  if (V.mode === "orbit") return rt(t, a);
  if (V.mode === "maybePull") {
    let i = e.clientX - V.x0,
      l = e.clientY - V.y0,
      s = Math.hypot(i, l);
    if (s < 8) return;
    V.mode = (i * Me.ux + l * Me.uy) / s > 0.8 ? "pull" : "aim", V.mode === "pull" && Dn();
  }
  if (V.mode === "pull") {
    ri(e);
    return;
  }
  if (Be === "top") return On(e);
  let o = (e.shiftKey ? 6e-4 : 0.003) * Math.min(de / 0.8, 2);
  G -= t * o * (Math.cos(ye) < 0 ? -1 : 1), N && ni() > 0.3 && (N = null), Ie = n.MathUtils.clamp(Ie + a * 0.004, 0.03, 1.5);
});
function ii(e) {
  if (ct.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), Te.setFromCamera(ct, X), Gt()) {
    let o = Te.intersectObjects(Ot, !1)[0];
    if (o) {
      Q = Ot.indexOf(o.object), It(), Le = 3;
      return;
    }
  }
  let t = W.filter(o => o.on && o.n !== 0 && !o.falling).map(o => o.mesh),
    a = Te.intersectObjects(t, !1)[0];
  if (a) {
    let o = W.find(i => i.mesh === a.object);
    ti(o), Ct.position.set(o.x, 0.0025, o.z), tt = 1;
    return;
  }
  On(e);
}
var Na = e => {
  V && V.mode === "aim" && b === "aim" && ie.size === 1 && Math.hypot(e.clientX - V.x0, e.clientY - V.y0) < 8 && performance.now() - V.t0 < 400 && ii(e), V && V.mode === "pull" && ie.size === 1 && (V = null, on(Y)), ie.delete(e.pointerId), ie.size < 2 && (me = null), ie.size || (V = null);
};
Ke.addEventListener("pointerup", Na);
Ke.addEventListener("pointercancel", Na);
Ke.addEventListener("wheel", e => {
  de = n.MathUtils.clamp(de * (1 + e.deltaY * 0.001), 0.3, 3.5), R.dist = Math.max(R.dist * (1 + e.deltaY * 0.001), 0.5);
}, {
  passive: !0
});
var dt = I("track"),
  ut = null;
dt.addEventListener("pointerdown", e => {
  b !== "aim" || !ve() || (Bt(), dt.setPointerCapture(e.pointerId), ut = e.clientY, Dn());
});
dt.addEventListener("pointermove", e => {
  ut != null && (Y = n.MathUtils.clamp((e.clientY - ut) / (dt.clientHeight * 0.85), 0, 1));
});
var Ya = () => {
  ut != null && (ut = null, on(Y));
};
dt.addEventListener("pointerup", Ya);
dt.addEventListener("pointercancel", Ya);
var pt = I("spin"),
  fa = I("dot");
function Oa(e) {
  if (!ve()) return;
  let t = pt.getBoundingClientRect(),
    a = ((e.clientX - t.left) / t.width - 0.5) * 2,
    o = -((e.clientY - t.top) / t.height - 0.5) * 2,
    i = Math.hypot(a, o);
  i > 0.8 && (a *= 0.8 / i, o *= 0.8 / i), Z = a * 0.6, ee = o * 0.6, qt();
}
function qt() {
  fa.style.left = 50 + Z / 0.6 * 50 + "%", fa.style.top = 50 - ee / 0.6 * 50 + "%";
}
var _n = !1;
pt.addEventListener("pointerdown", e => {
  pt.setPointerCapture(e.pointerId), _n = !0, Oa(e);
});
pt.addEventListener("pointermove", e => _n && Oa(e));
pt.addEventListener("pointerup", () => _n = !1);
pt.addEventListener("dblclick", () => {
  Z = ee = 0, qt();
});
var ma = null,
  Xt = e => {
    b === "aim" && ve() && (G += e);
  };
for (let [e, t] of [["bL", -0.0025], ["bR", 0.0025]]) {
  let a = I(e);
  a.addEventListener("pointerdown", () => {
    Xt(t);
    let o = 0;
    ma = setInterval(() => Xt(t * (++o > 12 ? 3 : 1)), 45);
  }), ["pointerup", "pointerleave", "pointercancel"].forEach(o => a.addEventListener(o, () => clearInterval(ma)));
}
var ft = !1;
addEventListener("keydown", e => {
  e.code === "ArrowLeft" && Xt(e.shiftKey ? -0.02 : -0.0025), e.code === "ArrowRight" && Xt(e.shiftKey ? 0.02 : 0.0025), e.code === "KeyA" && rt(-12, 0), e.code === "KeyD" && rt(12, 0), e.code === "KeyW" && rt(0, -10), e.code === "KeyS" && rt(0, 10), e.code === "KeyV" && _a(), e.code === "KeyC" && Ka(), e.code === "Space" && (e.preventDefault(), b === "aim" && !ft && ve() && (ft = !0, Dn()));
});
addEventListener("keyup", e => {
  e.code === "Space" && ft && (ft = !1, on(Y));
});
function Kn() {
  I("bView").textContent = Be === "player" ? "Top view" : "Player view";
}
function _a() {
  Be = Be === "player" ? "top" : "player", Kn();
}
function Ka() {
  ye = 0, Ie = 0.36, de = 0.8, Be = "player", Kn();
}
I("bView").onclick = _a;
I("bCam").onclick = Ka;
I("bOrbit").onclick = () => {
  bt = !bt, I("bOrbit").classList.toggle("act", bt), I("bOrbit").textContent = bt ? "Orbit: on" : "Orbit: off";
};
var ln = matchMedia("(pointer: coarse)").matches;
I("helpList").innerHTML = (ln ? [["Aim", "drag, or tap a ball"], ["Shoot", "pull the cue back, or the power bar"], ["Camera", "two fingers to orbit, pinch to zoom"], ["Spin", "tap the small ball"]] : [["Aim", "drag, or click a ball"], ["Shoot", "drag the cue back, or hold Space"], ["Camera", "right-drag to orbit, scroll to zoom"], ["Spin", "click the small ball"]]).concat([["Goal", "pot your group, then the 8"], ["Numbers", "each ball scores its number \xB7 the 8 ends the game"]]).map(([e, t]) => `<li><b>${e}</b> ${t}</li>`).join("");
ln || (I("bOrbit").style.display = "none", I("fine").style.display = "none");
var Cn = I("card").innerHTML;
function Qt() {
  let e = I("bMode"),
    t = a => {
      let o = a !== he || b === "over";
      he = a, Bt(), lt(), false, o && Rt();
    };
  e && (e.onclick = () => t(!0)), I("bStart").onclick = () => t(I("bStart").textContent === "Back to game" ? he : !1);
}
I("bHelp").onclick = () => {
  ;
  Dt(Cn), Qt(), b !== "over" && (I("bStart").textContent = "Back to game");
};
Qt();
var Me = null;
function li(e) {
  let t = new n.Vector3(m.x, w, m.z).project(X),
    a = new n.Vector3(m.x - Math.cos(G) * 0.3, w, m.z - Math.sin(G) * 0.3).project(X),
    o = (a.x - t.x) * innerWidth / 2,
    i = -(a.y - t.y) * innerHeight / 2,
    l = Math.hypot(o, i);
  l < 50 ? (o = 0, i = 1, l = 1, Me = {
    x: e.clientX,
    y: e.clientY,
    ux: 0,
    uy: 1,
    full: 220
  }) : Me = {
    x: e.clientX,
    y: e.clientY,
    ux: o / l,
    uy: i / l,
    full: Math.max(140, Math.min(l, 320))
  };
}
function ri(e) {
  if (!Me) return;
  let t = (e.clientX - Me.x) * Me.ux + (e.clientY - Me.y) * Me.uy;
  Y = n.MathUtils.clamp(t / Me.full, 0, 1);
}
var ye = 0,
  R = {
    yaw: 0,
    pitch: 0.36,
    dist: 0.8,
    user: !1
  },
  Nt = new n.Vector3(),
  Se = new n.Vector3(),
  se = new n.Vector3(),
  De = new n.Vector3();
function si(e) {
  let t = innerWidth / innerHeight,
    a;
  if (Be === "top") {
    let i = Math.tan(n.MathUtils.degToRad(X.fov / 2)),
      l = t < 1,
      s = l ? j + 0.7 : H + 0.7,
      u = l ? H + 0.7 : j + 0.7,
      p = Math.max(s / 2 / i, u / 2 / (i * t));
    X.up.set(l ? 1 : 0, l ? 0 : 1, 0), se.set(0, 0, 0), Se.set(l ? -0.001 : 0, p, l ? 0 : 0.001), a = 1 - Math.exp(-e * 5);
  } else {
    X.up.set(0, 1, 0);
    let i,
      l,
      s,
      u = !1;
    if (b === "aim") {
      i = G + ye;
      let p = ai(),
        x = n.MathUtils.lerp(0.36, 0.58, p),
        d = n.MathUtils.lerp(0.8, 0.98, p);
      l = Math.max(Ie, x), s = Math.max(de, d);
      let f = Math.cos(G),
        M = Math.sin(G);
      if (N && N.on && !N.falling) {
        let v = N.x,
          S = N.z,
          P = v - m.x,
          A = S - m.z,
          E = Math.atan2(A, P);
        i = E, se.set(v, w, S);
        let T = s * Math.cos(l);
        Se.set(m.x - Math.cos(E) * T, w + s * Math.sin(l), m.z - Math.sin(E) * T), u = !0;
      } else {
        N = null;
        let v = Math.cos(ye) > 0.7 ? 0.12 : 0;
        se.set(m.x + f * v, w, m.z + M * v);
      }
      De.copy(se), Object.assign(R, {
        yaw: i,
        pitch: l,
        dist: s,
        user: !1
      }), a = 1 - Math.exp(-e * 14);
    } else if (b === "shot") {
      let p = n.MathUtils.clamp((0.88 - t) / 0.43, 0, 1),
        x = n.MathUtils.lerp(0.68, 0.82, p),
        d = n.MathUtils.lerp(1.5, 0.88, p),
        f = Math.min(Math.max(Ie, x), d),
        M = Math.max(de, n.MathUtils.lerp(1.82, 2.95, p)),
        v = n.MathUtils.lerp(0.48, 0.26, p),
        S = 1 - Math.exp(-e * 11);
      R.user || (R.pitch += (f - R.pitch) * S, R.dist += (M - R.dist) * S, R.yaw = G + ye), De.lerp(new n.Vector3(m.x * v, w, m.z * v), S), i = R.yaw, l = R.pitch, s = R.dist, se.copy(De), a = 1 - Math.exp(-e * 10);
    } else {
      let p = n.MathUtils.clamp((0.88 - t) / 0.43, 0, 1),
        x = n.MathUtils.lerp(0.68, 0.82, p),
        d = n.MathUtils.lerp(1.5, 0.88, p),
        f = n.MathUtils.lerp(1.82, 2.95, p),
        M = 0,
        v = 0,
        S = 0;
      for (let P of W) if (Wa(P)) {
        let A = Math.hypot(P.vx, P.vz) + 0.05;
        M += P.x * A, v += P.z * A, S += A;
      }
      if (S > 0) {
        let P = M / S,
          A = v / S,
          E = n.MathUtils.lerp(1, 0.58, p);
        De.lerp(new n.Vector3(P * E, w, A * E), 1 - Math.exp(-e * 1.5));
      }
      R.user || (R.pitch += (Math.min(Math.max(Ie, x), d) - R.pitch) * (1 - Math.exp(-e * 1.8)), R.dist += (Math.max(de, f) - R.dist) * (1 - Math.exp(-e * 1.8))), i = R.yaw, l = R.pitch, s = R.dist, se.copy(De), a = 1 - Math.exp(-e * 4);
    }
    u || Se.set(se.x - Math.cos(i) * s * Math.cos(l), se.y + s * Math.sin(l), se.z - Math.sin(i) * s * Math.cos(l)), Se.y = Math.max(Se.y, Math.abs(Se.x) < j / 2 + 0.25 && Math.abs(Se.z) < H / 2 + 0.25 ? ke + 0.05 : ce + 0.3);
  }
  let o = X.position.distanceToSquared(Se) > 1e-8 || Nt.distanceToSquared(se) > 1e-8;
  return X.position.lerp(Se, a), Nt.lerp(se, a), X.lookAt(Nt), o;
}
function hi(e) {
  if ([dn, un, pn, Ut, gt].forEach(f => f.visible = !1), !e) return;
  let t = Math.cos(G),
    a = Math.sin(G),
    o = 1 / 0,
    i = null;
  for (let f of W) {
    if (!f.on || f.n === 0 || f.falling) continue;
    let M = f.x - m.x,
      v = f.z - m.z,
      S = M * t + v * a;
    if (S < 0) continue;
    let P = M * M + v * v - S * S;
    if (P > 4 * w * w) continue;
    let A = S - Math.sqrt(4 * w * w - P);
    A < o && (o = A, i = f);
  }
  let l = t > 0 ? (j / 2 - w - m.x) / t : t < 0 ? (-(j / 2 - w) - m.x) / t : 1 / 0,
    s = a > 0 ? (H / 2 - w - m.z) / a : a < 0 ? (-(H / 2 - w) - m.z) / a : 1 / 0,
    u = Math.min(l, s),
    p = Math.min(o, u),
    x = m.x + t * p,
    d = m.z + a * p;
  if (fn(dn, m.x, m.z, x, d), dn.visible = !0, gt.position.set(x, 0.0025, d), gt.visible = !0, i && o <= u) {
    Ut.position.set(x, w, d), Ut.visible = !0;
    let f = i.x - x,
      M = i.z - d,
      v = Math.hypot(f, M);
    f /= v, M /= v;
    let S = t * f + a * M,
      P = 0.12 + 0.35 * S;
    fn(un, i.x, i.z, i.x + f * P, i.z + M * P), un.visible = !0;
    let A = t - f * S,
      E = a - M * S,
      T = Math.hypot(A, E);
    if (T > 0.02) {
      A /= T, E /= T;
      let L = 0.3 * T;
      fn(pn, x, d, x + A * L, d + E * L), pn.visible = !0;
    }
  }
}
var Ht = 0.09,
  Mn = 0.09;
function ci() {
  let e = -Math.cos(G),
    t = -Math.sin(G),
    a = w + ee * w,
    o = 0.09,
    i = e > 0 ? (j / 2 - m.x) / e : e < 0 ? (-j / 2 - m.x) / e : 1 / 0,
    l = t > 0 ? (H / 2 - m.z) / t : t < 0 ? (-H / 2 - m.z) / t : 1 / 0,
    s = Math.max(0.005, Math.min(i, l) - 0.01);
  o = Math.max(o, Math.atan2(ke + 0.022 - a, s));
  for (let u of W) {
    if (!u.on || u.n === 0 || u.falling) continue;
    let p = u.x - m.x,
      x = u.z - m.z,
      d = p * e + x * t;
    d <= 0 || d > 1.6 || Math.abs(p * t - x * e) > w + 0.016 || (o = Math.max(o, Math.atan2(2 * w + 0.016 - a, Math.max(0.01, d - w - 0.012))));
  }
  return Math.min(o, 1.25);
}
var In = [{
    dpr: 1,
    soft: !0,
    casters: 3,
    map: 1024,
    coat: !0,
    shadows: !0
  }, {
    dpr: 1,
    soft: !1,
    casters: 3,
    map: 1024,
    coat: !0,
    shadows: !0
  }, {
    dpr: 1,
    soft: !1,
    casters: 1,
    map: 1024,
    coat: !0,
    shadows: !0
  }, {
    dpr: 0.8,
    soft: !1,
    casters: 1,
    map: 512,
    coat: !0,
    shadows: !0
  }, {
    dpr: 0.7,
    soft: !1,
    casters: 1,
    map: 512,
    coat: !1,
    shadows: !0
  }, {
    dpr: 0.6,
    soft: !1,
    casters: 0,
    map: 512,
    coat: !1,
    shadows: !1
  }, {
    dpr: 0.5,
    soft: !1,
    casters: 0,
    map: 512,
    coat: !1,
    shadows: !1
  }],
  qa = [];
B.traverse(e => {
  e.material && e.material.isMeshPhysicalMaterial && qa.push([e.material, e.material.clearcoat, e.material.iridescence]);
});
var Ae = -1;
function Bn(e) {
  if (e = n.MathUtils.clamp(e, 0, In.length - 1), e === Ae) return;
  Ae = e;
  let t = In[e];
  _.setPixelRatio(Math.max(1, Yt * t.dpr) * (t.dpr < 0.6 && Yt <= 1 ? 0.85 : 1)), _.setSize(innerWidth, innerHeight), _.shadowMap.enabled = t.shadows, _.shadowMap.type = t.soft ? n.PCFSoftShadowMap : n.PCFShadowMap, Ea.forEach((o, i) => {
    o.castShadow = t.shadows && (t.casters === 3 || i === 1), o.shadow.mapSize.x !== t.map && (o.shadow.mapSize.set(t.map, t.map), o.shadow.map && o.shadow.map.dispose(), o.shadow.map = null);
  });
  for (let [o, i, l] of qa) o.clearcoat = t.coat ? i : 0, o.iridescence = t.coat ? l : 0;
  B.traverse(o => {
    o.material && (o.material.needsUpdate = !0);
  }), Le = 3, F.settleUntil = performance.now() + 1500, F.t0 = 0;
  let a = document.getElementById("perf");
  a && (a.dataset.level = e);
}
var xa = !1,
  Ma = !1,
  Le = 3,
  Xa = 0,
  F = {
    t0: 0,
    n: 0,
    slow: 0,
    fast: 0,
    prevFps: 0,
    justDropped: !1,
    failed: -1,
    locked: !1,
    settleUntil: 0
  };
function di(e, t) {
  if (!t || e < F.settleUntil || !F.t0) {
    F.t0 = e, F.n = 0;
    return;
  }
  if (F.n++, e - F.t0 < 1e3) return;
  let a = F.n * 1e3 / (e - F.t0);
  if (F.t0 = e, F.n = 0, mt.textContent = `${a.toFixed(0)} fps \xB7 Q${Ae}`, F.justDropped && (F.justDropped = !1, a >= 50)) {
    F.slow = 0;
    return;
  }
  F.locked || (a < 50 ? ++F.slow >= 2 && Ae < In.length - 1 && (F.prevFps = a, F.failed = Ae, Bn(Ae + (a < 30 ? 2 : 1)), F.justDropped = !0, F.slow = 0) : F.slow = 0, a > 58.5 ? ++F.fast >= 6 && Ae - 1 > F.failed && (Bn(Ae - 1), F.fast = 0) : F.fast = 0);
}
var mt = document.createElement("div");
mt.id = "perf";
mt.style.cssText = "position:fixed;left:10px;bottom:62px;font:12px monospace;color:#a99c86;display:none;pointer-events:none";
document.body.appendChild(mt);
addEventListener("keydown", e => {
  e.code === "KeyF" && (mt.style.display = mt.style.display === "none" ? "block" : "none");
});
["pointerdown", "pointermove", "wheel", "keydown"].forEach(e => addEventListener(e, () => Xa = performance.now(), {
  passive: !0,
  capture: !0
}));
Bn(Math.max(Ye, 1));
_e("textures", 1, "Preparing materials");
var qn = 0,
  Rn = null;
function ve() {
  return true;
}
var $n = new n.Timer();
$n.connect(document);
var Wt = 0,
  wn = 1 / 1e3,
  ui = new n.Vector3(0, 1, 0),
  yn = new n.Vector3();
function Qa(e) {
  $n.update(e);
  let t = Math.min($n.getDelta(), 0.05);
  if (ft && b === "aim" && (Y = Math.min(1, Y + t / 1.4)), b === "shot" && (nt.t += t, nt.t >= 0.09)) {
    let s = 0.3 + Math.pow(nt.pw, 1.5) * 8.7,
      u = G - Z * 0.035,
      p = Math.cos(u),
      x = Math.sin(u),
      d = 5 * s / (2 * w);
    m.vx = p * s, m.vz = x * s, m.wx = d * ee * x, m.wz = -d * ee * p, m.wy = d * Z, b = "moving", Wt = 0, q("", ""), R.yaw = G + ye, De.set(m.x, w, m.z);
  }
  if (b === "moving") for (Wt += t; Wt >= wn;) Zo(wn), Wt -= wn;
  for (let s of W) if (s.falling) {
    let u = s.falling;
    u.t += t;
    let p = Math.min(u.t / 0.32, 1);
    s.x = u.x0 + (u.P.x - u.x0) * Math.min(1, p * 1.6), s.z = u.z0 + (u.P.z - u.z0) * Math.min(1, p * 1.6), s.mesh.position.set(s.x, w - p * p * 3 * w, s.z), p >= 1 && (s.falling = null, s.on = !1, s.mesh.visible = !1, s.x = 99, oe());
  } else s.on && s.mesh.position.set(s.x, w, s.z);
  b === "moving" && W.every(s => !s.falling && !Wa(s)) && (W.forEach(s => {
    s.wy = 0;
  }), ei(), void 0), void 0;
  let a = b === "aim" || b === "shot";
  if (Pe.visible = a && m.on, Pe.visible) {
    Mn = ci(), Ht += (Mn - Ht) * (1 - Math.exp(-t * 12));
    let s = Ht;
    yn.set(-Math.cos(G) * Math.cos(s), Math.sin(s), -Math.sin(G) * Math.cos(s));
    let u = Y * 0.28 + 0.012;
    if (b === "shot") {
      let f = Math.min(nt.t / 0.09, 1);
      u = nt.pull * (1 - f * f) + 0.012 * (1 - f);
    }
    Pe.quaternion.setFromUnitVectors(ui, yn);
    let p = -Math.sin(G),
      x = Math.cos(G),
      d = Math.sqrt(Math.max(0, 1 - Z * Z - ee * ee)) * w;
    Pe.position.set(m.x + p * Z * w, w + ee * w, m.z + x * Z * w).addScaledVector(yn, d + u);
  }
  hi(b === "aim" && m.on), it.visible = b === "aim" && Ve, it.visible && (it.position.set(m.x, 0.002, m.z), it.material.opacity = 0.75), tt = Math.max(0, tt - t * 1.2), Ct.material.opacity = tt * 0.9, Ct.visible = tt > 0 && b === "aim", I("fill").style.height = Y * 100 + "%", I("stick").style.transform = `translateY(${Y * 22}%)`, (b === "moving" || xa) && We.poke();
  let o = We.update(t, e / 1e3),
    i = si(t);
  xa = i;
  let l = b === "moving" || b === "shot" || false || ft || ut != null || V || me || i || o || tt > 0 || Math.abs(Ht - Mn) > 1e-4 || performance.now() - Xa < 250 || Le > 0;
  l && (Le = Math.max(0, Le - 1), _.render(B, X), di(e, Ma)), Ma = l, requestAnimationFrame(Qa);
}
addEventListener("resize", () => {
  X.aspect = innerWidth / innerHeight, X.updateProjectionMatrix(), _.setSize(innerWidth, innerHeight), Le = 3;
});
document.addEventListener("visibilitychange", () => {
  Le = 3, F.t0 = performance.now(), F.n = 0;
});
Ha();
Nt.set(0, 0, 0);
(async () => {
  try {
    let e = [];
    B.traverse(t => {
      t.visible || (e.push(t), t.visible = !0);
    }), _e("shaders", 0.1, "Compiling shaders"), _.compileAsync ? await _.compileAsync(B, X) : _.compile(B, X), e.forEach(t => t.visible = !1);
  } catch (e) {
    console.warn(e);
  }
  _e("shaders", 1, "Warming up"), _.render(B, X), requestAnimationFrame(() => _e("frame", 1)), requestAnimationFrame(Qa);
})();
// Standalone replacement for the removed host game-over surface. Uses only
// the game's completed result and original reset routine; no score changes.
function showLocalResults() {
  const summary = I("msg").textContent;
  Dt('<h1>Round complete</h1><p id="localResult"></p><button id="localAgain">Play again</button><button id="localMenu">Main menu</button>');
  I("localResult").textContent = summary;
  I("localAgain").onclick = () => { Bt(); lt(); Rt(); };
  I("localMenu").onclick = () => { Dt(Cn); Qt(); };
}
