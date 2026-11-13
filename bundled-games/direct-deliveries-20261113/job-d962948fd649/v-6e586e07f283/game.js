// Standalone native audio/layout. No platform SDK, login, room or score service.
let audioGraph = null;
const localRuntime = {
  ready: () => Promise.resolve(null),
  audio() {
    if (audioGraph) return audioGraph;
    const C = window.AudioContext || window.webkitAudioContext;
    const context = new C(),
      output = context.createGain();
    output.connect(context.destination);
    const unlock = () => {
      if (context.state === 'suspended') context.resume().catch(() => {});
    };
    for (const event of ['pointerdown', 'keydown', 'touchend']) window.addEventListener(event, unlock, {
      capture: true
    });
    unlock();
    return audioGraph = {
      context,
      output
    };
  },
  get contentLayout() {
    return {
      viewport: {
        width: innerWidth,
        height: innerHeight
      },
      safeAreaInset: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      exclusions: []
    };
  },
  onContentLayout(callback) {
    window.addEventListener('resize', callback);
    return () => window.removeEventListener('resize', callback);
  }
};
import * as E from "./vendor/001-three-0.185.js";
var _a = Math.PI * 2,
  Q = (t, e, s) => Math.max(e, Math.min(s, t)),
  qe = (t, e) => (t % e + e) % e,
  Be = (t, e) => qe(t - e + Math.PI, _a) - Math.PI,
  Ye = Object.freeze([{
    id: "bedroom",
    scale: 1.4,
    name: "Pillow Grand Prix",
    subtitle: "Wooden toy track: zig-zag switchbacks and the pillow hairpin",
    label: "01 / BEDROOM",
    width: 10.8,
    color: "#ffb34e",
    surface: "wood",
    roadStyle: "planks",
    sky: 11062232,
    roadColor: 3229266,
    railColor: 15900731,
    sectorNames: ["TOYBOX STRAIGHT", "BOOK SWITCHBACK", "PILLOW HAIRPIN"],
    points: [[-170, -95, 0], [-80, -112, 0], [10, -110, 0], [80, -92, 0], [122, -52, 0], [118, -6, 0], [78, 12, 0], [32, -12, 0], [-12, -30, 0], [-58, -14, 0], [-74, 30, 0], [-34, 62, 0], [40, 58, 0], [108, 70, 0], [156, 98, 0], [132, 132, 0], [40, 128, 0], [-60, 122, 0], [-140, 112, 0], [-186, 62, 0], [-192, -20, 0]],
    boosts: "auto"
  }, {
    id: "kitchen",
    scale: 1.6,
    name: "Countertop Clash",
    subtitle: "Twin skybridges, a mug slalom and a long straight",
    label: "02 / KITCHEN",
    width: 11.6,
    color: "#f36946",
    surface: "marble",
    roadStyle: "granite",
    sky: 12769758,
    roadColor: 3428948,
    railColor: 6731195,
    sectorNames: ["COUNTER RUN", "CERAMIC CHICANE", "SKYBRIDGE"],
    points: [[-165, -100, 0], [-90, -110, 0], [-10, -105, 0], [60, -80, 0], [100, -30, 3], [100, 30, 8], [60, 70, 9], [0, 70, 9], [-60, 40, 6], [-90, 0, 2], [-60, -40, 0], [0, -20, 0], [30, 30, 0], [30, 110, 0], [-30, 130, 0], [-110, 120, 0], [-165, 80, 0], [-185, 10, 0], [-180, -60, 0]],
    boosts: [0.05, 0.24, 0.36, 0.62, 0.85]
  }, {
    id: "backyard",
    scale: 1.5,
    name: "Garden Afterburn",
    subtitle: "Dirt trail: flat-out S-bends, the pond bridge and a mud-splashed loop",
    label: "03 / BACKYARD",
    width: 11.2,
    color: "#8fce63",
    surface: "grass",
    roadStyle: "dirt",
    sky: 9553631,
    roadColor: 9859148,
    railColor: 11967856,
    sectorNames: ["HEDGE SPRINT", "FLOWERBED ESSES", "POND BRIDGE"],
    pond: [100, 108],
    points: [[-175, 40, 0], [-172, -45, 0], [-130, -100, 0], [-60, -100, 0], [-5, -62, 0], [40, -88, 0], [100, -110, 0], [158, -85, 0], [182, -25, 0], [172, 45, 1], [130, 100, 5], [70, 112, 6], [22, 88, 2], [-8, 35, 0], [-52, 22, 0], [-84, 60, 0], [-112, 108, 0], [-160, 105, 0]],
    boosts: "auto"
  }, {
    id: "bathroom",
    scale: 1.45,
    name: "Bubble Bath Bash",
    subtitle: "White tile roads: square corners, soap puddles and the bathtub hairpin",
    label: "04 / BATHROOM",
    width: 11.2,
    color: "#5ec8d8",
    surface: "marble",
    roadStyle: "tile",
    sky: 13034218,
    roadColor: 3955814,
    railColor: 9425887,
    sectorNames: ["TILE STRAIGHT", "BATHTUB HAIRPIN", "SOAP SLALOM"],
    points: [[-170, -100, 0], [-60, -106, 0], [40, -106, 0], [110, -100, 0], [140, -76, 0], [146, -22, 0], [122, 6, 0], [64, 10, 0], [36, 34, 0], [36, 74, 0], [62, 100, 0], [134, 100, 0], [176, 114, 0], [160, 148, 0], [60, 148, 0], [10, 122, 0], [-40, 146, 0], [-95, 122, 0], [-150, 140, 0], [-188, 92, 0], [-190, 10, 0], [-182, -62, 0]],
    boosts: "auto"
  }, {
    id: "garage",
    scale: 1.5,
    name: "Garage Gauntlet",
    subtitle: "Concrete figure-eight: the workbench bridge, oil stains and two tyre-wall loops",
    label: "05 / GARAGE",
    width: 11.4,
    color: "#e0a63a",
    surface: "marble",
    roadStyle: "concrete",
    sky: 12174536,
    roadColor: 3095360,
    railColor: 14722618,
    sectorNames: ["DRIVEWAY DASH", "WORKBENCH BRIDGE", "TYRE-WALL LOOP"],
    points: [[-120, -100, 0], [-50, -102, 0], [0, -72, 2], [30, -32, 6], [52, 2, 9], [78, 36, 6], [112, 60, 2], [160, 70, 0], [186, 20, 0], [172, -42, 0], [122, -62, 0], [76, -40, 0], [44, 4, 0], [2, 46, 0], [-40, 82, 0], [-100, 102, 0], [-165, 82, 0], [-188, 20, 0], [-176, -52, 0]],
    boosts: "auto"
  }]);
function sn(t, e, s, o, n) {
  let i = n * n,
    a = i * n;
  return 0.5 * (2 * e + (-t + s) * n + (2 * t - 5 * e + 4 * s - o) * i + (-t + 3 * e - 3 * s + o) * a);
}
var Ze = t => String(t || "bedroom").replace(/~u$/, "").replace(/-rev$/, ""),
  Ot = t => /-rev(~u)?$/.test(String(t || "")),
  ui = t => /~u$/.test(String(t || "")),
  Ys = t => Ye.find(e => e.id === Ze(t)) || Ye[0],
  nn = (t, e = !1) => `${Ze(t)}${e ? "-rev" : ""}`;
function qa(t, e) {
  let s = t.points.length,
    o = qe(e, 1) * s,
    n = Math.floor(o),
    i = o - n,
    a = t.points[qe(n - 1, s)],
    r = t.points[n],
    l = t.points[(n + 1) % s],
    c = t.points[(n + 2) % s];
  return {
    x: sn(a[0], r[0], l[0], c[0], i),
    z: sn(a[1], r[1], l[1], c[1], i),
    y: Math.max(0, sn(a[2], r[2], l[2], c[2], i))
  };
}
var on = new Map();
function ee(t = "bedroom") {
  if (on.has(t)) return on.get(t);
  let e = Ys(t),
    s = Ot(t),
    o = [],
    n = ui(t) ? 1 : e.scale || 1,
    i = e.points.map(([h, d, u]) => [h * n, d * n, u]),
    a = s ? {
      ...e,
      points: [i[0], ...i.slice(1).reverse()],
      boosts: e.boosts === "auto" ? "auto" : e.boosts.map(h => 1 - h).sort((h, d) => h - d),
      sectorNames: [e.sectorNames[0], e.sectorNames[2], e.sectorNames[1]]
    } : {
      ...e,
      points: i
    },
    r = a.points.length * 80,
    l = 0;
  for (let h = 0; h <= r; h++) {
    let d = qa(a, h / r);
    h && (l += Math.hypot(d.x - o[h - 1].x, d.z - o[h - 1].z, d.y - o[h - 1].y)), d.s = l, o.push(d);
  }
  let c = {
    ...a,
    id: nn(e.id, s) + (ui(t) ? "~u" : ""),
    base: e.id,
    reverse: s,
    scale: n,
    pond: e.pond && [e.pond[0] * n, e.pond[1] * n],
    length: l,
    samples: o,
    count: r
  };
  if (c.bounds = {
    minX: Math.min(...o.map(h => h.x)),
    maxX: Math.max(...o.map(h => h.x)),
    minZ: Math.min(...o.map(h => h.z)),
    maxZ: Math.max(...o.map(h => h.z))
  }, a.boosts === "auto") {
    let h = l,
      d = [];
    for (let f = 70; f < h - 50; f += 6) {
      let y = 0;
      for (let m = -12; m <= 22; m += 4) y = Math.max(y, _s(c, f + m));
      d.push({
        s: f,
        k: y
      });
    }
    d.sort((f, y) => f.k - y.k);
    let u = [];
    for (let f of d) {
      if (u.length >= 5) break;
      u.every(y => Math.abs(Ne(f.s, y, h)) > h / 7) && u.push(f.s);
    }
    c.boosts = u.sort((f, y) => f - y).map(f => f / h);
  }
  return on.set(t, c), c;
}
function G(t, e, s = 0) {
  e = qe(e, t.length);
  let o = t.samples,
    n = 0,
    i = t.count;
  for (; n + 1 < i;) {
    let y = n + i >> 1;
    o[y].s < e ? n = y : i = y;
  }
  let a = o[n],
    r = o[n + 1],
    l = (e - a.s) / (r.s - a.s || 1),
    c = r.x - a.x,
    h = r.z - a.z,
    d = Math.hypot(c, h) || 1,
    u = c / d,
    f = h / d;
  return {
    x: a.x + (r.x - a.x) * l + f * s,
    z: a.z + (r.z - a.z) * l - u * s,
    y: a.y + (r.y - a.y) * l,
    tx: u,
    tz: f,
    nx: f,
    nz: -u,
    yaw: Math.atan2(u, f),
    s: e
  };
}
function We(t, e, s, o = null, n = 0, i = 48) {
  let a = null,
    r = 1 / 0,
    l = t.samples,
    c = t.length,
    h = u => {
      let f = 0,
        y = t.count;
      for (; f + 1 < y;) {
        let m = f + y >> 1;
        l[m].s <= u ? f = m : y = m;
      }
      return f;
    },
    d = [[0, t.count - 1]];
  if (o !== null && i < c / 2) {
    let u = qe(o, c),
      f = u - i,
      y = u + i;
    d = f < 0 ? [[0, h(y)], [h(f + c), t.count - 1]] : y > c ? [[h(f), t.count - 1], [0, h(y - c)]] : [[h(f), h(y)]];
  }
  for (let [u, f] of d) for (let y = u; y <= f; y++) {
    let m = l[y],
      p = l[y + 1];
    if (o !== null && Math.abs(qe(m.s - o + c / 2, c) - c / 2) > i) continue;
    let b = p.x - m.x,
      w = p.z - m.z,
      M = b * b + w * w,
      x = Q(((e - m.x) * b + (s - m.z) * w) / (M || 1), 0, 1),
      T = m.x + b * x,
      g = m.z + w * x,
      H = m.y + (p.y - m.y) * x,
      v = (e - T) ** 2 + (s - g) ** 2 + (n - H) ** 2 * 2;
    if (v < r) {
      let R = Math.sqrt(M) || 1;
      r = v, a = {
        x: T,
        z: g,
        y: H,
        s: m.s + (p.s - m.s) * x,
        tx: b / R,
        tz: w / R,
        lane: (e - T) * w / R - (s - g) * b / R,
        distance: Math.sqrt((e - T) ** 2 + (s - g) ** 2)
      };
    }
  }
  return a || We(t, e, s, null, n);
}
function _s(t, e) {
  let s = G(t, e - 3),
    o = G(t, e + 3);
  return Math.abs(Be(o.yaw, s.yaw)) / 6;
}
function Ne(t, e, s) {
  return qe(t - e + s / 2, s) - s / 2;
}
import * as A from "./vendor/001-three-0.185.js";
var ys = [{
    name: "Comet GT",
    roof: 1.015,
    roofRear: -0.72,
    roofFront: -0.07,
    glassRear: -1.04,
    glassFront: 0.63,
    roofWidth: 0.442,
    bodyTop: 0.665,
    wheel: 0.33,
    rearWheel: 0.33,
    rearAxle: -0.91,
    frontAxle: 0.93,
    spoiler: 1,
    grille: 0
  }, {
    name: "Trail Sport",
    roof: 1.205,
    roofRear: -0.89,
    roofFront: 0.22,
    glassRear: -1.18,
    glassFront: 0.71,
    roofWidth: 0.485,
    bodyTop: 0.76,
    wheel: 0.35,
    rearWheel: 0.35,
    rearAxle: -0.89,
    frontAxle: 0.92,
    spoiler: 0,
    grille: 1
  }, {
    name: "Pocket Rally",
    roof: 1.1,
    roofRear: -0.8,
    roofFront: 0.08,
    glassRear: -0.98,
    glassFront: 0.63,
    roofWidth: 0.465,
    bodyTop: 0.72,
    wheel: 0.34,
    rearWheel: 0.34,
    rearAxle: -0.9,
    frontAxle: 0.9,
    spoiler: 2,
    grille: 2
  }, {
    name: "Rocket Rod",
    roof: 1.02,
    roofRear: -0.75,
    roofFront: -0.23,
    glassRear: -1.04,
    glassFront: 0.31,
    roofWidth: 0.415,
    bodyTop: 0.65,
    wheel: 0.31,
    rearWheel: 0.36,
    rearAxle: -0.91,
    frontAxle: 0.95,
    spoiler: 0,
    grille: 3
  }],
  an = new Map(),
  rn = new Map(),
  Zt = {
    paint: new A.MeshPhysicalMaterial({
      color: 16777215,
      metalness: 0.3,
      roughness: 0.32,
      clearcoat: 0.62,
      clearcoatRoughness: 0.21,
      envMapIntensity: 0.32
    }),
    accent: new A.MeshPhysicalMaterial({
      color: 16777215,
      vertexColors: !0,
      metalness: 0.15,
      roughness: 0.42,
      clearcoat: 0.28,
      envMapIntensity: 0.22
    }),
    glass: new A.MeshPhysicalMaterial({
      color: 465703,
      metalness: 0.16,
      roughness: 0.16,
      clearcoat: 0.75,
      clearcoatRoughness: 0.09,
      envMapIntensity: 0.45
    }),
    trim: new A.MeshStandardMaterial({
      color: 1383459,
      metalness: 0.22,
      roughness: 0.54
    }),
    chrome: new A.MeshStandardMaterial({
      color: 10529717,
      metalness: 0.82,
      roughness: 0.28,
      envMapIntensity: 0.7
    }),
    alloy: new A.MeshStandardMaterial({
      color: 8885663,
      metalness: 0.8,
      roughness: 0.25,
      envMapIntensity: 0.62
    }),
    lamps: new A.MeshStandardMaterial({
      color: 15989759,
      emissive: 13429503,
      emissiveIntensity: 0.5,
      metalness: 0.25,
      roughness: 0.16
    }),
    rubber: new A.MeshStandardMaterial({
      color: 1514273,
      metalness: 0,
      roughness: 0.89
    })
  };
function se(t = [0, 0, 0], e = [0, 0, 0], s = [1, 1, 1]) {
  let o = new A.Matrix4();
  return o.compose(new A.Vector3(...t), new A.Quaternion().setFromEuler(new A.Euler(...e)), new A.Vector3(...s)), o;
}
function cn(t) {
  let e = [],
    s = [],
    o = [];
  for (let {
    geometry: i,
    matrix: a,
    slot: r = 0
  } of t) {
    let l = i.index ? i.toNonIndexed() : i.clone();
    a && l.applyMatrix4(a), l.attributes.normal || l.computeVertexNormals(), e.push(...l.attributes.position.array), s.push(...l.attributes.normal.array);
    for (let c = 0; c < l.attributes.position.count; c++) o.push(r);
    l.dispose(), i.dispose();
  }
  let n = new A.BufferGeometry();
  return n.setAttribute("position", new A.Float32BufferAttribute(e, 3)), n.setAttribute("normal", new A.Float32BufferAttribute(s, 3)), n.setAttribute("paintSlot", new A.Float32BufferAttribute(o, 1)), n.computeBoundingSphere(), n.computeBoundingBox(), n;
}
function Jt(t, e = 24) {
  let s = [],
    o = [];
  for (let r of t) for (let l = 0; l < e; l++) {
    let c = l / e * Math.PI * 2,
      h = Math.sin(c),
      d = Math.cos(c),
      u = Math.sign(h) * Math.pow(Math.abs(h), 0.63) * r.w,
      f = r.mid + Math.sign(d) * Math.pow(Math.abs(d), 0.7) * r.h;
    s.push(u, f, r.z);
  }
  for (let r = 0; r < t.length - 1; r++) for (let l = 0; l < e; l++) {
    let c = (l + 1) % e,
      h = r * e + l,
      d = r * e + c,
      u = (r + 1) * e + l,
      f = (r + 1) * e + c;
    o.push(h, u, d, d, u, f);
  }
  let n = s.length / 3;
  s.push(0, t[0].mid, t[0].z);
  let i = s.length / 3;
  s.push(0, t.at(-1).mid, t.at(-1).z);
  for (let r = 0; r < e; r++) {
    let l = (r + 1) % e;
    o.push(n, r, l);
    let c = (t.length - 1) * e + r,
      h = (t.length - 1) * e + l;
    o.push(i, h, c);
  }
  let a = new A.BufferGeometry();
  return a.setAttribute("position", new A.Float32BufferAttribute(s, 3)), a.setIndex(o), a.computeVertexNormals(), a;
}
function Ka(t, e = 3) {
  let s = [],
    o = (n, i, a, r, l) => 0.5 * (2 * i + (-n + a) * l + (2 * n - 5 * i + 4 * a - r) * l * l + (-n + 3 * i - 3 * a + r) * l * l * l);
  for (let n = 0; n < t.length - 1; n++) {
    let i = t[Math.max(0, n - 1)],
      a = t[n],
      r = t[n + 1],
      l = t[Math.min(t.length - 1, n + 2)];
    for (let c = 0; c < e; c++) {
      let h = c / e;
      s.push({
        z: A.MathUtils.lerp(a.z, r.z, h),
        w: o(i.w, a.w, r.w, l.w, h),
        mid: o(i.mid, a.mid, r.mid, l.mid, h),
        h: o(i.h, a.h, r.h, l.h, h)
      });
    }
  }
  return s.push(t.at(-1)), s;
}
function Xa(t) {
  let e = [],
    s = [];
  for (let {
    z: i,
    base: a,
    top: r,
    bottomWidth: l,
    topWidth: c
  } of t) {
    let h = a + (r - a) * 0.28,
      d = [[0, r + 0.015], [c * 0.74, r + 0.008], [c, r - 0.01], [l * 0.97, h], [l, a + 0.019], [l * 0.88, a], [0, a], [-l * 0.88, a], [-l, a + 0.019], [-l * 0.97, h], [-c, r - 0.01], [-c * 0.74, r + 0.008]];
    for (let [u, f] of d) e.push(u, f, i);
  }
  for (let i = 0; i < t.length - 1; i++) for (let a = 0; a < 12; a++) {
    let r = (a + 1) % 12,
      l = i * 12 + a,
      c = i * 12 + r,
      h = (i + 1) * 12 + a,
      d = (i + 1) * 12 + r;
    s.push(l, h, c, c, h, d);
  }
  for (let [i, a] of [[0, !1], [t.length - 1, !0]]) {
    let r = e.length / 3,
      l = t[i];
    e.push(0, (l.base + l.top) / 2, l.z);
    for (let c = 0; c < 12; c++) {
      let h = i * 12 + c,
        d = i * 12 + (c + 1) % 12;
      s.push(r, a ? d : h, a ? h : d);
    }
  }
  let n = new A.BufferGeometry();
  return n.setAttribute("position", new A.Float32BufferAttribute(e, 3)), n.setIndex(s), n.computeVertexNormals(), n;
}
function Pe(t, e, s, o = 0.05) {
  let n = -t / 2,
    i = -e / 2,
    a = Math.min(o, t / 2 - 0.001, e / 2 - 0.001),
    r = new A.Shape();
  r.moveTo(n + a, i), r.lineTo(n + t - a, i), r.quadraticCurveTo(n + t, i, n + t, i + a), r.lineTo(n + t, i + e - a), r.quadraticCurveTo(n + t, i + e, n + t - a, i + e), r.lineTo(n + a, i + e), r.quadraticCurveTo(n, i + e, n, i + e - a), r.lineTo(n, i + a), r.quadraticCurveTo(n, i, n + a, i);
  let l = new A.ExtrudeGeometry(r, {
    depth: s,
    steps: 1,
    bevelEnabled: !1,
    curveSegments: 2
  });
  return l.translate(0, 0, -s / 2), l;
}
function ln(t) {
  let e = t.flat(),
    s = [];
  for (let n = 1; n < t.length - 1; n++) s.push(0, n, n + 1);
  let o = new A.BufferGeometry();
  return o.setAttribute("position", new A.Float32BufferAttribute(e, 3)), o.setIndex(s), o.computeVertexNormals(), o;
}
function ot(t, e, s = 0.012, o = 5) {
  let n = new A.Vector3(...t),
    i = new A.Vector3(...e),
    a = i.clone().sub(n),
    r = new A.CylinderGeometry(s, s, a.length(), o, 1);
  return r.applyQuaternion(new A.Quaternion().setFromUnitVectors(new A.Vector3(0, 1, 0), a.clone().normalize())), r.translate(...n.add(i).multiplyScalar(0.5).toArray()), r;
}
function pi(t, e, s, o) {
  let n = [],
    i = [];
  for (let l = 0; l <= 12; l++) {
    let c = -0.12 + l / 12 * (Math.PI + 0.24);
    for (let h of [-0.044, 0.044]) for (let d of [o + 0.025, o + 0.077]) n.push(t + h, e + Math.sin(c) * d, s + Math.cos(c) * d);
  }
  for (let l = 0; l < 12; l++) {
    let c = l * 4,
      h = c + 4;
    i.push(c, h, c + 1, c + 1, h, h + 1, c + 2, c + 3, h + 2, c + 3, h + 3, h + 2, c + 1, h + 1, c + 3, c + 3, h + 1, h + 3);
  }
  for (let l = 0; l < i.length; l += 3) [i[l + 1], i[l + 2]] = [i[l + 2], i[l + 1]];
  let r = new A.BufferGeometry();
  return r.setAttribute("position", new A.Float32BufferAttribute(n, 3)), r.setIndex(i), r.computeVertexNormals(), r;
}
function Za(t) {
  let e = ys[t],
    s = {
      paint: [],
      accent: [],
      glass: [],
      trim: [],
      chrome: [],
      lamps: [],
      brake: []
    },
    o = (v, R, z, D = 0) => s[v === "paint" && D ? "accent" : v].push({
      geometry: R,
      matrix: z,
      slot: D
    }),
    n = e.bodyTop,
    i = (0.31 + n) / 2,
    a = (n - 0.31) / 2,
    r = [{
      z: -1.5,
      w: t === 1 ? 0.65 : 0.57,
      mid: i - 0.005,
      h: a * 0.75
    }, {
      z: -1.4,
      w: 0.73,
      mid: i + 0.005,
      h: a * 0.96
    }, {
      z: -1.15,
      w: t === 2 ? 0.815 : 0.79,
      mid: i + 0.02,
      h: a
    }, {
      z: -0.65,
      w: t === 0 ? 0.765 : 0.79,
      mid: i + 0.025,
      h: a
    }, {
      z: -0.1,
      w: t === 0 ? 0.745 : 0.77,
      mid: i + 0.03,
      h: a
    }, {
      z: 0.5,
      w: t === 2 ? 0.815 : 0.79,
      mid: i + 0.015,
      h: a
    }, {
      z: 1.05,
      w: t === 0 ? 0.805 : 0.79,
      mid: i,
      h: a * 0.94
    }, {
      z: 1.36,
      w: 0.71,
      mid: i - 0.025,
      h: a * 0.9
    }, {
      z: 1.5,
      w: 0.5,
      mid: i - 0.035,
      h: a * 0.72
    }];
  t === 3 && (r[2].w = 0.82, r[3].w = 0.78, r[4].w = 0.665, r[5].w = 0.675, r[6].w = 0.72, r[7].w = 0.62, r[8].w = 0.445);
  let l = Ka(r);
  o("paint", Jt(l));
  let c = (v, R, z, D = 0.006) => {
      let F = l.at(-1);
      for (let X = 0; X < l.length - 1; X++) if (z <= l[X + 1].z) {
        let _ = l[X],
          Y = l[X + 1],
          te = A.MathUtils.clamp((z - _.z) / (Y.z - _.z), 0, 1);
        F = {
          w: A.MathUtils.lerp(_.w, Y.w, te),
          mid: A.MathUtils.lerp(_.mid, Y.mid, te),
          h: A.MathUtils.lerp(_.h, Y.h, te)
        };
        break;
      }
      let j = Math.pow(Math.min(0.999, Math.abs((R - F.mid) / F.h)), 1 / 0.7);
      return [v * (F.w * Math.pow(Math.sqrt(1 - j * j), 0.63) + D), R, z];
    },
    h = (v, R, z = 0.006, D = "trim") => {
      let F = R.map(([j, X]) => new A.Vector3(...c(v, j, X)));
      o(D, new A.TubeGeometry(new A.CatmullRomCurve3(F), Math.max(4, F.length * 2), z, 3, !1));
    },
    d = (v, R, z, D, F, j, X = 1) => {
      let _ = [],
        Y = [];
      for (let He = 0; He <= 8; He++) {
        let L = He / 8,
          U = A.MathUtils.lerp(R, z, L),
          q = A.MathUtils.lerp(D, F, L);
        if (_.push(...c(v, q, U, 0.008), ...c(v, q + j, U, 0.009)), He < 8) {
          let I = He * 2;
          Y.push(I, I + 1, I + 2, I + 1, I + 3, I + 2);
        }
      }
      if (v < 0) for (let He = 0; He < Y.length; He += 3) [Y[He + 1], Y[He + 2]] = [Y[He + 2], Y[He + 1]];
      let Te = new A.BufferGeometry();
      Te.setAttribute("position", new A.Float32BufferAttribute(_, 3)), Te.setIndex(Y), Te.computeVertexNormals(), o("paint", Te, void 0, X);
    },
    u = n + 0.005,
    f = e.roof,
    y = [{
      z: e.glassRear,
      base: u,
      top: u + 0.035,
      bottomWidth: 0.535,
      topWidth: 0.52
    }, {
      z: e.roofRear - 0.05,
      base: u,
      top: f - 0.035,
      bottomWidth: 0.565,
      topWidth: e.roofWidth + 0.012
    }, {
      z: e.roofRear,
      base: u,
      top: f,
      bottomWidth: 0.568,
      topWidth: e.roofWidth
    }, {
      z: (e.roofRear + e.roofFront) / 2,
      base: u,
      top: f + 0.008,
      bottomWidth: 0.57,
      topWidth: e.roofWidth + 0.005
    }, {
      z: e.roofFront,
      base: u,
      top: f,
      bottomWidth: 0.568,
      topWidth: e.roofWidth
    }, {
      z: e.roofFront + 0.055,
      base: u,
      top: f - 0.033,
      bottomWidth: 0.565,
      topWidth: e.roofWidth + 0.017
    }, {
      z: e.glassFront,
      base: u,
      top: u + 0.035,
      bottomWidth: 0.55,
      topWidth: 0.53
    }];
  o("glass", Xa(y));
  let m = (e.roofRear + e.roofFront) / 2;
  o("paint", Jt([{
    z: e.roofRear - 0.018,
    w: e.roofWidth * 0.94,
    mid: f + 0.012,
    h: 0.019
  }, {
    z: m,
    w: e.roofWidth * 0.97,
    mid: f + 0.023,
    h: 0.024
  }, {
    z: e.roofFront + 0.018,
    w: e.roofWidth * 0.94,
    mid: f + 0.012,
    h: 0.019
  }], 16));
  for (let v of [-1, 1]) {
    let R = v * e.roofWidth;
    o("paint", ot([v * 0.55, u + 0.024, e.glassFront - 0.015], [R, f - 0.004, e.roofFront], 0.026, 6)), o("paint", ot([v * 0.535, u + 0.024, e.glassRear], [R, f - 0.004, e.roofRear], t === 2 ? 0.05 : 0.038, 6));
    let z = t === 1 ? m - 0.04 : m - 0.13;
    o("trim", ot([v * 0.57, u + 0.02, z], [R, f - 0.009, z], 0.022, 5)), o("trim", ot([R, f - 0.011, e.roofRear], [R, f - 0.011, e.roofFront], 0.009, 5)), o("chrome", ot([v * 0.56, u + 0.023, e.glassRear + 0.025], [v * 0.59, u + 0.023, e.glassFront - 0.028], 0.009, 4)), h(v, [[0.41, -0.46], [i, -0.46], [n - 0.025, -0.46]], 0.003), h(v, [[0.4, 0.44], [i, 0.44], [n - 0.025, 0.44]], 0.003), h(v, [[0.4, -0.46], [0.4, -0.02], [0.4, 0.44]], 0.003), o("chrome", Pe(0.09, 0.019, 0.009, 0.008), se(c(v, n - 0.064, -0.27, 0.008), [0, v * Math.PI / 2, 0])), o("trim", ot([v * 0.6, n + 0.12, 0.39], [v * 0.78, n + 0.15, 0.35], 0.018, 5)), o("paint", Pe(0.15, 0.07, 0.08, 0.025), se([v * 0.81, n + 0.15, 0.33])), o("glass", Pe(0.115, 0.04, 0.006, 0.016), se([v * 0.81, n + 0.151, 0.282], [0, Math.PI, 0])), o("trim", Jt([{
      z: -0.64,
      w: 0.024,
      mid: 0,
      h: 0.038
    }, {
      z: 0,
      w: 0.029,
      mid: 0,
      h: 0.038
    }, {
      z: 0.64,
      w: 0.024,
      mid: 0,
      h: 0.035
    }], 8), se([v * 0.779, 0.31, 0])), o("paint", pi(v * 0.778, e.wheel, e.frontAxle, e.wheel)), o("paint", pi(v * 0.778, e.rearWheel, e.rearAxle, e.rearWheel));
  }
  o("trim", ot([-0.45, u + 0.031, e.glassFront - 0.017], [0.45, u + 0.031, e.glassFront - 0.017], 0.012, 5)), o("trim", ot([-0.28, u + 0.04, e.glassFront - 0.031], [0.13, u + 0.06, e.glassFront - 0.073], 0.005, 4));
  let p = 1.495,
    b = -1.498;
  o("trim", Pe(1.06, 0.13, 0.062, 0.04), se([0, 0.355, p])), o("chrome", Pe(0.88, 0.028, 0.02, 0.012), se([0, 0.37, p + 0.035])), o("trim", Pe(1.07, 0.12, 0.065, 0.036), se([0, 0.356, b])), o("chrome", Pe(0.98, 0.025, 0.02, 0.01), se([0, 0.367, b - 0.037])), o("trim", Pe(1.05, 0.14, 0.015, 0.031), se([0, n - 0.12, -1.507], [0, Math.PI, 0])), o("brake", Pe(t === 1 ? 0.54 : 0.38, 0.019, 0.005, 0.007), se([0, n - 0.1, -1.52], [0, Math.PI, 0])), o("trim", Pe(0.92, 0.09, 0.085, 0.02), se([0, 0.3, -1.48]));
  for (let v of [-0.28, -0.09, 0.09, 0.28]) o("trim", Pe(0.021, 0.083, 0.12, 0.006), se([v, 0.302, -1.5]));
  o("trim", Pe(t === 3 ? 0.38 : 0.67, t === 3 ? 0.22 : 0.125, 0.027, 0.035), se([0, i + 0.005, p + 0.008]));
  for (let v = -3; v <= 3; v++) {
    let R = v * (t === 3 ? 0.043 : 0.071);
    o("chrome", ot([R, i - 0.041, p + 0.025], [R, i + 0.055, p + 0.025], 0.008, 4));
  }
  for (let v of [-1, 1]) {
    let R = t === 3 ? 0.43 : 0.54,
      z = t === 1 ? n - 0.06 : n - 0.073;
    t === 3 ? (o("chrome", new A.CylinderGeometry(0.093, 0.093, 0.036, 12), se([v * R, z, 1.416], [Math.PI / 2, 0, 0])), o("lamps", new A.CircleGeometry(0.072, 12), se([v * R, z, 1.438]))) : (o("trim", Pe(0.285, 0.113, 0.039, 0.041), se([v * R, z, 1.385], [0, v * 0.14, v * 0.04])), o("lamps", Pe(0.228, 0.063, 0.006, 0.027), se([v * R, z + 0.009, 1.41], [0, v * 0.14, v * 0.04])), o("chrome", Pe(0.19, 0.018, 0.012, 0.006), se([v * R, z - 0.037, 1.41], [0, v * 0.14, 0])));
    let D = t === 1 ? 0.465 : 0.396;
    o("brake", Pe(t === 1 ? 0.102 : 0.245, t === 1 ? 0.084 : 0.036, 0.006, 0.014), se([v * D, n - 0.1, -1.522], [0, Math.PI, 0])), o("chrome", new A.CylinderGeometry(0.048, 0.048, 0.142, 12, 1, !0), se([v * 0.415, 0.291, -1.517], [Math.PI / 2, 0, 0])), o("trim", new A.CircleGeometry(0.039, 12), se([v * 0.415, 0.291, -1.59], [0, Math.PI, 0]));
    for (let F of [e.rearAxle, e.frontAxle]) o("brake", Pe(0.047, 0.103, 0.044, 0.015), se([v * 0.772, 0.38, F - 0.09], [0, Math.PI / 2, 0]));
  }
  if (o("chrome", Pe(0.22, 0.075, 0.008, 0.012), se([0, 0.442, -1.511], [0, Math.PI, 0])), o("trim", Pe(0.164, 0.012, 0.006, 0.004), se([0, 0.444, -1.517], [0, Math.PI, 0])), e.spoiler) {
    let v = e.spoiler === 2 ? f + 0.1 : n + 0.215,
      R = e.spoiler === 2 ? -1.095 : -1.2;
    for (let z of [-1, 1]) o("trim", ot([z * 0.46, n + 0.01, R], [z * 0.46, v, R], 0.023, 5));
    o(e.spoiler === 1 ? "trim" : "paint", Jt([{
      z: R - 0.095,
      w: 0.575,
      mid: v + 0.019,
      h: 0.016
    }, {
      z: R + 0.018,
      w: 0.63,
      mid: v + 0.036,
      h: 0.02
    }, {
      z: R + 0.09,
      w: 0.61,
      mid: v + 0.032,
      h: 0.012
    }], 12));
    for (let z of [-1, 1]) o("trim", Pe(0.02, 0.098, 0.2, 0.009), se([z * 0.6, v + 0.04, R]));
  }
  if (t === 1) {
    for (let v of [-1, 1]) o("chrome", ot([v * 0.38, f + 0.077, e.roofRear + 0.08], [v * 0.38, f + 0.077, e.roofFront - 0.07], 0.016, 6));
    o("glass", Pe(0.43, 0.008, 0.51, 0.003), se([0, f + 0.049, m - 0.04])), o("paint", Jt([{
      z: e.roofRear - 0.1,
      w: 0.46,
      mid: f + 0.008,
      h: 0.012
    }, {
      z: e.roofRear + 0.1,
      w: 0.48,
      mid: f + 0.012,
      h: 0.018
    }], 12));
  }
  if (t === 2) for (let v of [-1, 1]) o("chrome", new A.CylinderGeometry(0.067, 0.067, 0.041, 10), se([v * 0.22, n + 0.011, 1.19], [Math.PI / 2, 0, 0])), o("lamps", new A.CircleGeometry(0.054, 10), se([v * 0.22, n + 0.011, 1.215]));
  if (t === 3) {
    o("chrome", Jt([{
      z: 0.48,
      w: 0.16,
      mid: 0.035,
      h: 0.035
    }, {
      z: 0.74,
      w: 0.23,
      mid: 0.055,
      h: 0.055
    }, {
      z: 0.89,
      w: 0.24,
      mid: 0.065,
      h: 0.065
    }], 8), se([0, n + 0.012, 0]));
    for (let v of [-0.145, 0, 0.145]) o("trim", new A.CircleGeometry(0.047, 8), se([v, n + 0.083, 0.892]));
    for (let v of [-1, 1]) for (let R = 0; R < 3; R++) o("chrome", ot([v * 0.66, 0.49, 0.47 - R * 0.18], [v * 0.82, 0.31, 0.37 - R * 0.18], 0.022, 6));
  }
  let w = t === 1 ? m + 0.3 : m,
    M = f + 0.056;
  o("trim", new A.CircleGeometry(0.152, 20), se([0, M - 0.002, w], [-Math.PI / 2, 0, 0])), o("paint", new A.CircleGeometry(0.137, 20), se([0, M, w], [-Math.PI / 2, 0, 0]), 1), o("paint", ln([[-0.062, M + 0.002, w - 0.023], [0, M + 0.002, w + 0.065], [0, M + 0.002, w + 0.012], [-0.02, M + 0.002, w - 0.023]]), void 0, 2), o("paint", ln([[0, M + 0.002, w + 0.065], [0.062, M + 0.002, w - 0.023], [0.02, M + 0.002, w - 0.023], [0, M + 0.002, w + 0.012]]), void 0, 2);
  let x = n + 0.012,
    T = e.glassFront + 0.05,
    g = t === 3 ? 1.37 : 1.31;
  if (T < g && t !== 3) for (let v of [-0.095, 0.095]) o("paint", ln([[v - 0.035, x - 0.038, g], [v + 0.035, x - 0.038, g], [v + 0.035, x + 0.005, T], [v - 0.035, x + 0.005, T]]), void 0, 1);
  for (let v of [-1, 1]) {
    if (t === 0) d(v, -0.67, 0.65, 0.455, 0.435, 0.032, 2), d(v, -0.6, 0.65, 0.416, 0.4, 0.024, 1);else if (t === 1) {
      d(v, -0.62, 0.58, 0.43, 0.43, 0.034, 1);
      for (let R = 0; R < 3; R++) d(v, -0.38 + R * 0.11, -0.24 + R * 0.11, 0.52, 0.62, 0.018, 2);
    } else t === 2 ? (d(v, -0.62, -0.22, 0.41, 0.54, 0.07, 2), d(v, -0.19, 0.54, 0.54, 0.44, 0.055, 1), d(v, -0.51, 0.54, 0.384, 0.382, 0.015, 2)) : (d(v, -0.66, 0.67, 0.51, 0.5, 0.02, 2), d(v, -0.63, 0.65, 0.475, 0.465, 0.014, 1));
    for (let R = 0; R <= t; R++) d(v, -0.2 + R * 0.055, -0.18 + R * 0.055, i + 0.065, i + 0.065, 0.055, 2);
  }
  let H = {};
  for (let [v, R] of Object.entries(s)) R.length && (H[v] = cn(R), v !== "accent" && H[v].deleteAttribute("paintSlot"));
  return {
    config: e,
    geometries: H
  };
}
function Ja(t) {
  let e = t.toFixed(3);
  if (rn.has(e)) return rn.get(e);
  let s = [],
    o = [],
    n = (c, h, d) => c.push({
      geometry: h,
      matrix: d
    }),
    i = t * 0.635,
    a = [[i - 0.012, -0.073], [t - 0.045, -0.08], [t - 0.017, -0.066], [t, -0.038], [t, 0.038], [t - 0.017, 0.066], [t - 0.045, 0.08], [i - 0.012, 0.073], [i - 0.012, 0.048], [i - 0.012, -0.048], [i - 0.012, -0.073]];
  n(s, new A.LatheGeometry(a.map(([c, h]) => new A.Vector2(c, h)), 24), se([0, 0, 0], [0, 0, Math.PI / 2])), n(s, new A.CircleGeometry(i - 0.01, 20), se([0.013, 0, 0], [0, Math.PI / 2, 0])), n(o, new A.CylinderGeometry(i - 0.009, i - 0.009, 0.115, 20, 1, !0), se([0.016, 0, 0], [0, 0, Math.PI / 2])), n(o, new A.TorusGeometry(i, 0.013, 6, 20), se([0.076, 0, 0], [0, Math.PI / 2, 0])), n(o, new A.CylinderGeometry(0.056, 0.068, 0.035, 12, 1), se([0.075, 0, 0], [0, 0, Math.PI / 2]));
  let r = (c, h) => {
    let u = i - 0.01,
      f = [];
    for (let [b, w, M] of [[0.047, c, 0.012], [u, c + h, 0.009]]) for (let x of [-1, 1]) f.push([Math.sin(w) * b + Math.cos(w) * M * x, Math.cos(w) * b - Math.sin(w) * M * x]);
    let y = [];
    for (let b of [0.052, 0.085]) for (let [w, M] of f) y.push(b, w, M);
    let m = [0, 2, 1, 1, 2, 3, 4, 5, 6, 5, 7, 6, 0, 1, 4, 1, 5, 4, 2, 6, 3, 3, 6, 7, 0, 4, 2, 2, 4, 6, 1, 3, 5, 3, 7, 5],
      p = new A.BufferGeometry();
    return p.setAttribute("position", new A.Float32BufferAttribute(y, 3)), p.setIndex(m), p.computeVertexNormals(), p;
  };
  for (let c = 0; c < 5; c++) {
    let h = c / 5 * Math.PI * 2;
    n(o, r(h - 0.075, -0.12)), n(o, r(h + 0.075, 0.12)), n(o, new A.CylinderGeometry(0.008, 0.008, 0.009, 5), se([0.098, Math.sin(h) * 0.04, Math.cos(h) * 0.04], [0, 0, Math.PI / 2]));
  }
  let l = {
    rubber: cn(s),
    alloy: cn(o)
  };
  return rn.set(e, l), l;
}
function Qa(t, e, s) {
  let o = t.clone(),
    n = [new A.Color(e), new A.Color(s), new A.Color(16250344)],
    i = t.attributes.paintSlot.array,
    a = new Float32Array(i.length * 3);
  for (let r = 0; r < i.length; r++) {
    let l = n[i[r]] || n[0];
    a[r * 3] = l.r, a[r * 3 + 1] = l.g, a[r * 3 + 2] = l.b;
  }
  return o.setAttribute("color", new A.BufferAttribute(a, 3)), o.deleteAttribute("paintSlot"), o;
}
function qs({
  style: t = 0,
  bodyColor: e = 4381157,
  teamColor: s = 4381157,
  finish: o = "gloss",
  rimColor: n = null
} = {}) {
  let i = Number(t),
    a = (Math.trunc(Number.isFinite(i) ? i : 0) % ys.length + ys.length) % ys.length;
  an.has(a) || an.set(a, Za(a));
  let {
      config: r,
      geometries: l
    } = an.get(a),
    c = new A.Group();
  c.name = r.name;
  let h = Zt.paint.clone();
  h.color.set(e), o === "metallic" ? Object.assign(h, {
    metalness: 0.82,
    roughness: 0.24,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 0.95
  }) : o === "matte" ? Object.assign(h, {
    metalness: 0,
    roughness: 0.82,
    clearcoat: 0,
    envMapIntensity: 0.15
  }) : o === "pearl" && Object.assign(h, {
    metalness: 0.35,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    iridescence: 0.85,
    iridescenceIOR: 1.45,
    envMapIntensity: 0.7
  });
  let d = n == null ? Zt.alloy : Zt.alloy.clone();
  n != null && d.color.set(n);
  let u = Qa(l.accent, e, s),
    f = new A.MeshStandardMaterial({
      color: 16725321,
      emissive: 16716078,
      emissiveIntensity: 0.65,
      roughness: 0.28,
      metalness: 0.12
    });
  for (let [M, x] of Object.entries(l)) {
    let T = new A.Mesh(M === "accent" ? u : x, M === "paint" ? h : M === "brake" ? f : Zt[M]);
    T.name = `car-${M}`, T.castShadow = M !== "glass" && M !== "lamps" && M !== "brake", T.receiveShadow = M !== "lamps" && M !== "brake", c.add(T);
  }
  let y = [],
    m = [];
  for (let M of [!1, !0]) {
    let x = M ? r.wheel : r.rearWheel,
      T = Ja(x);
    for (let g of [-1, 1]) {
      let H = new A.Group();
      H.position.set(g * 0.781, x, M ? r.frontAxle : r.rearAxle), H.name = `${M ? "front" : "rear"}-${g < 0 ? "left" : "right"}-steering`;
      let v = new A.Group(),
        R = new A.Mesh(T.rubber, Zt.rubber),
        z = new A.Mesh(T.alloy, d);
      g < 0 && (z.rotation.y = Math.PI, R.rotation.y = Math.PI), R.castShadow = !0, R.receiveShadow = !0, z.castShadow = !0, z.receiveShadow = !0, v.add(R, z), H.add(v), c.add(H), y.push(v), M && m.push(H);
    }
  }
  let p = [new A.Vector3(-0.415, 0.291, -1.597), new A.Vector3(0.415, 0.291, -1.597)],
    b = !1,
    w = () => {
      b || (h.dispose(), d !== Zt.alloy && d.dispose(), u.dispose(), f.dispose(), b = !0);
    };
  return c.userData.style = a, c.userData.carName = r.name, {
    group: c,
    wheels: y,
    frontWheels: m,
    brakeLights: f,
    boostAnchors: p,
    dispose: w
  };
}
var U0 = ys.map(({
  name: t
}, e) => ({
  index: e,
  name: t
}));
import * as $ from "./vendor/001-three-0.185.js";
var mi = t => (t = Q(t, 0, 1), t * t * (3 - 2 * t)),
  er = {
    bedroom: [{
      id: "book-hop",
      name: "BOOK HOP",
      kind: "book",
      from: 6,
      to: 10,
      width: 6.2,
      jump: [0.42, 0.58, 2.9, 23]
    }, {
      id: "bed-tunnel",
      name: "UNDER THE BED",
      kind: "tunnel",
      from: 13,
      to: 16,
      width: 5.8
    }],
    kitchen: [{
      id: "tray-chute",
      name: "SERVING TRAY",
      kind: "chute",
      from: 8,
      to: 11,
      width: 6.2,
      jump: [0.44, 0.6, 2.4, 22.5]
    }],
    backyard: [{
      id: "pond-hop",
      name: "ROCKERY HOP",
      kind: "pond",
      from: 12,
      to: 15,
      width: 6.2,
      jump: [0.42, 0.58, 2.7, 23]
    }],
    bathroom: [{
      id: "soap-slide",
      name: "SOAP SLIDE",
      kind: "chute",
      from: 5,
      to: 11,
      width: 6.2,
      jump: [0.42, 0.58, 2.6, 23]
    }],
    garage: [{
      id: "tool-tunnel",
      name: "TOOLBOX TUNNEL",
      kind: "tunnel",
      from: 14,
      to: 17,
      width: 6
    }]
  },
  tr = {
    bedroom: [{
      type: "paw",
      at: 1.5,
      period: 13,
      offset: 4,
      side: 1
    }, {
      type: "paw",
      at: 17.5,
      period: 14,
      offset: 8,
      side: 1
    }],
    kitchen: [{
      type: "fruit",
      at: 1.5,
      period: 11,
      offset: 3,
      side: -1
    }, {
      type: "fruit",
      at: 14.5,
      period: 12,
      offset: 7,
      side: 1
    }],
    backyard: [{
      type: "sprinkler",
      at: 3.5,
      period: 14,
      offset: 4,
      side: 1
    }, {
      type: "sprinkler",
      at: 16.5,
      period: 15,
      offset: 8,
      side: -1
    }],
    bathroom: [{
      type: "sprinkler",
      at: 1.5,
      period: 13,
      offset: 4,
      side: 1
    }, {
      type: "sprinkler",
      at: 19.5,
      period: 14,
      offset: 8,
      side: 1
    }],
    garage: [{
      type: "paw",
      at: 1.4,
      period: 13,
      offset: 4,
      side: 1
    }, {
      type: "fruit",
      at: 8.5,
      period: 12,
      offset: 7,
      side: 1
    }]
  },
  sr = {
    bedroom: [],
    kitchen: [{
      kind: "milk",
      at: 2.6,
      lane: 2.4
    }, {
      kind: "jam",
      at: 10.3,
      lane: -2.4
    }, {
      kind: "milk",
      at: 12.6,
      lane: -2.3
    }, {
      kind: "jam",
      at: 16.6,
      lane: 2.4
    }],
    backyard: [{
      kind: "mud",
      at: 4.6,
      lane: 2.4
    }, {
      kind: "mud",
      at: 8.4,
      lane: -2.5
    }, {
      kind: "mud",
      at: 13.6,
      lane: 2.2
    }, {
      kind: "mud",
      at: 17.4,
      lane: -2.4
    }],
    bathroom: [{
      kind: "soap",
      at: 2.5,
      lane: -2.6
    }, {
      kind: "soap",
      at: 7.5,
      lane: 2.3
    }, {
      kind: "soap",
      at: 15.4,
      lane: -2.4
    }, {
      kind: "soap",
      at: 16.6,
      lane: 2.4
    }, {
      kind: "soap",
      at: 20.5,
      lane: 2.6
    }],
    garage: [{
      kind: "oil",
      at: 6.6,
      lane: -2.4
    }, {
      kind: "oil",
      at: 9.6,
      lane: 2.4
    }, {
      kind: "oil",
      at: 15.5,
      lane: -2.2
    }, {
      kind: "oil",
      at: 17.6,
      lane: 2.5
    }]
  },
  or = 2.9;
function Ks(t, e) {
  let s = ee(t);
  return s.samples[Math.min(s.count, Math.round(e * 80))].s / s.length;
}
function nr(t) {
  return {
    shortcuts: er[t].map(e => ({
      ...e,
      start: Ks(t, e.from),
      end: Ks(t, e.to)
    })),
    hazards: tr[t].map(e => ({
      ...e,
      fraction: Ks(t, e.at)
    })),
    patches: (sr[t] || []).map(e => ({
      ...e,
      fraction: Ks(t, e.at)
    }))
  };
}
var Xs = new Map();
function ir(t, e) {
  let s = e.start * t.length,
    o = e.end * t.length,
    n = G(t, s),
    i = G(t, o),
    a = Math.sign((i.x - n.x) * n.nx + (i.z - n.z) * n.nz) || 1,
    r = G(t, s, a * 3.35),
    l = G(t, o, a * 2.8),
    c = Q((o - s) * 0.2, 20, 34),
    h = (G(t, s + 2).y - G(t, s - 2).y) / 4,
    d = (G(t, o + 2).y - G(t, o - 2).y) / 4,
    u = [r, {
      x: r.x + r.tx * c,
      y: Math.max(0, r.y + h * c),
      z: r.z + r.tz * c
    }, {
      x: l.x - l.tx * c,
      y: Math.max(0, l.y - d * c),
      z: l.z - l.tz * c
    }, l],
    f = [],
    y = 0,
    m = 200;
  for (let p = 0; p <= m; p++) {
    let b = p / m,
      w = 1 - b,
      M = [w * w * w, 3 * w * w * b, 3 * w * b * b, b * b * b],
      x = {};
    for (let R of ["x", "y", "z"]) x[R] = u.reduce((z, D, F) => z + D[R] * M[F], 0);
    let T = e.kind === "book" ? 1.7 : e.kind === "chute" ? 1.2 : e.kind === "pond" ? 0.7 : 0,
      g = We(t, x.x, x.z, b < 0.5 ? s : o, x.y, 70),
      H = mi((g.distance - (t.width / 2 + e.width / 2 - 0.4)) / 3.5);
    x.y = Math.max(0, x.y + Math.sin(p / m * Math.PI) * T * H);
    let v = mi((g.distance - (t.width / 2 + e.width / 2 - 0.4)) / 6);
    x.y = g.y + (x.y - g.y) * v, p && (y += Math.hypot(x.x - f[p - 1].x, x.z - f[p - 1].z, x.y - f[p - 1].y)), x.s = y, f.push(x);
  }
  return {
    ...e,
    mapId: t.id,
    startS: s,
    endS: o,
    side: a,
    length: y,
    samples: f,
    count: m,
    jump: e.jump ? {
      start: e.jump[0] * y,
      end: e.jump[1] * y,
      height: e.jump[2],
      minSpeed: e.jump[3]
    } : null
  };
}
function ar(t, e, s, o = []) {
  let n = t.length,
    i = [],
    a = (d, u, f) => u.every(y => Math.abs(Ne(d, y, n)) > f),
    r = e.flatMap(d => [d.startS, d.endS]),
    l = [...s.map(d => d.s), ...o.map(d => d.s)],
    c = t.boosts.map(d => d * n);
  for (let d = 90; d < n - 70; d += 8) {
    if (!a(d, r, 55) || !a(d, l, 45) || !a(d, c, 35)) continue;
    let u = 0;
    for (let y = -30; y <= 40; y += 5) {
      let m = G(t, d + y - 2),
        p = G(t, d + y + 2);
      u = Math.max(u, Math.abs(Be(p.yaw, m.yaw)) / 4);
    }
    Math.abs(G(t, d + 25).y - G(t, d - 8).y) > 0.4 || i.push({
      s: d,
      k: u
    });
  }
  i.sort((d, u) => d.k - u.k);
  let h = [];
  for (let d of i) {
    if (h.length >= 2) break;
    h.every(u => Math.abs(Ne(d.s, u, n)) > n / 3) && h.push(d.s);
  }
  return h.sort((d, u) => d - u);
}
var rr = t => ({
  ...t,
  start: 1 - t.end,
  end: 1 - t.start,
  jump: t.jump ? [1 - t.jump[1], 1 - t.jump[0], t.jump[2], t.jump[3]] : void 0
});
function le(t) {
  if (!Xs.has(t)) {
    let e = ee(t),
      s = Ze(t),
      o = Ot(t),
      n = nr(s);
    Xs.set(t, {
      shortcuts: n.shortcuts.map(a => ir(e, o ? rr(a) : a)),
      hazards: n.hazards.map((a, r) => ({
        ...a,
        fraction: o ? 1 - a.fraction : a.fraction,
        side: o ? -a.side : a.side,
        id: `${t}-${r}`,
        s: (o ? 1 - a.fraction : a.fraction) * e.length,
        warningTime: 2.4,
        activeTime: a.type === "sprinkler" ? 4 : 3
      })),
      patches: n.patches.map((a, r) => {
        let l = o ? 1 - a.fraction : a.fraction,
          c = o ? -a.lane : a.lane,
          h = l * e.length,
          d = G(e, h, c);
        return {
          id: `${t}-patch-${r}`,
          kind: a.kind,
          s: h,
          lane: c,
          x: d.x,
          y: d.y,
          z: d.z,
          yaw: d.yaw,
          r: or
        };
      })
    });
    let i = Xs.get(t);
    i.ramps = ar(e, i.shortcuts, i.hazards, i.patches);
  }
  return Xs.get(t);
}
function bi(t, e) {
  let s = ee(t).length;
  return le(t).patches.find(o => Math.abs(Ne(e.s, o.s, s)) < o.r + 1 && Math.hypot(e.x - o.x, e.z - o.z) < o.r && Math.abs(e.y - o.y) < 1.5) || null;
}
function Se(t, e, s = 0, {
  flight: o = !0
} = {}) {
  e = Q(e, 0, t.length);
  let n = t.samples,
    i = 0,
    a = t.count;
  for (; i + 1 < a;) {
    let p = i + a >> 1;
    n[p].s < e ? i = p : a = p;
  }
  let r = n[i],
    l = n[i + 1],
    c = Q((e - r.s) / (l.s - r.s || 1), 0, 1),
    h = Math.hypot(l.x - r.x, l.z - r.z) || 1,
    d = (l.x - r.x) / h,
    u = (l.z - r.z) / h,
    f = r.y + (l.y - r.y) * c,
    y = t.jump,
    m = o && y && e > y.start && e < y.end;
  return m && (f += Math.sin((e - y.start) / (y.end - y.start) * Math.PI) * y.height), {
    x: r.x + (l.x - r.x) * c + u * s,
    z: r.z + (l.z - r.z) * c - d * s,
    y: f,
    s: e,
    tx: d,
    tz: u,
    nx: u,
    nz: -d,
    yaw: Math.atan2(d, u),
    airborne: !!m
  };
}
function bs(t, e, s, o = 0, n = 24) {
  let i = 1 / 0,
    a = null,
    r = t.samples;
  for (let l = 0; l < t.count; l++) {
    let c = r[l],
      h = r[l + 1];
    if (c.s < o - n || c.s > o + n) continue;
    let d = h.x - c.x,
      u = h.z - c.z,
      f = d * d + u * u,
      y = Q(((e - c.x) * d + (s - c.z) * u) / (f || 1), 0, 1),
      m = c.x + d * y,
      p = c.z + u * y,
      b = (e - m) ** 2 + (s - p) ** 2;
    if (b < i) {
      let w = Math.sqrt(f) || 1;
      i = b, a = {
        s: c.s + (h.s - c.s) * y,
        lane: ((e - m) * u - (s - p) * d) / w,
        distance: Math.sqrt(b)
      };
    }
  }
  return a;
}
function gs(t, e, s, o, n = 0.6) {
  let i = ee(t.mapId),
    a = We(i, e, s, null, o);
  return a.distance < i.width / 2 + n && Math.abs(a.y - o) < 2.5;
}
function gt(t, e) {
  return le(t).shortcuts.find(s => s.id === e);
}
function xs(t, e, s = 0) {
  let o = e.shortcut && gt(t, e.shortcut.id);
  return o ? Se(o, e.shortcut.s + s) : G(ee(t), e.s + s);
}
var yi = new Map();
function hn(t, e, s) {
  let o = t.length,
    n = `${t.id}:${s}`,
    i = yi.get(n);
  if (!i) {
    i = new Uint8Array(Math.ceil(o) + 1);
    let a = t.width / 2 + 0.5,
      r = le(t.id).shortcuts;
    for (let c = 0; c < i.length; c++) {
      if (r.some(d => d.side === s && (Math.abs(Ne(c, d.startS, o)) < 13 || Math.abs(Ne(c, d.endS, o)) < 12))) {
        i[c] = 1;
        continue;
      }
      let h = G(t, c, s * a);
      for (let d of r) {
        let u = !1;
        for (let f of d.samples) if (!(d.jump && f.s > d.jump.start && f.s < d.jump.end) && Math.abs(f.x - h.x) < d.width && Math.abs(f.z - h.z) < d.width && Math.hypot(f.x - h.x, f.z - h.z) < d.width / 2 + 0.9 && Math.abs(f.y - h.y) < 2.5) {
          u = !0;
          break;
        }
        if (u) {
          i[c] = 1;
          break;
        }
      }
    }
    let l = i.slice();
    for (let c = 0; c < i.length; c++) if (i[c]) for (let h = -2; h <= 2; h++) l[qe(c + h, i.length)] = 1;
    i = l, yi.set(n, i);
  }
  return i[Math.floor(qe(e, o))] === 1;
}
function Yt(t, e, s) {
  let o = ee(t),
    n = G(o, e.s),
    i = s - e.offset,
    a = Math.max(0, Math.floor(i / e.period)),
    r = i < 0 ? -1 : qe(i, e.period),
    l = r < 0 ? "idle" : r < e.warningTime ? "warning" : r < e.warningTime + e.activeTime ? "active" : "idle",
    c = l === "warning" ? r / e.warningTime : l === "active" ? (r - e.warningTime) / e.activeTime : 0,
    h = {
      id: e.id,
      type: e.type,
      phase: l,
      progress: c,
      cycle: a,
      center: n,
      side: e.side,
      x: n.x,
      y: n.y,
      z: n.z,
      yaw: n.yaw,
      radius: e.type === "paw" ? 2.65 : e.type === "fruit" ? 2.05 : 0.8
    };
  if (e.type === "paw" || e.type === "fruit") {
    let d = l === "active" ? c : 0,
      u = e.type === "paw" ? e.side * (o.width / 2 + 4 - (o.width + 3) * d) : e.side * (o.width / 2 + 4) * (1 - 2 * d),
      f = e.type === "fruit" ? (c - 0.5) * 6 : 0,
      y = G(o, e.s + f, u);
    h.x = y.x, h.z = y.z, h.y = y.y;
  } else {
    let d = G(o, e.s, e.side * (o.width / 2 + 2.5)),
      u = n.yaw + e.side * (Math.PI / 2 + 0.75 - Math.PI * 1.45 * c),
      f = o.width + 5;
    h.pivot = d, h.jetEnd = {
      x: d.x + Math.sin(u) * f,
      y: n.y + 0.3,
      z: d.z + Math.cos(u) * f
    };
  }
  return h;
}
function Zs(t, e, s) {
  for (let o of le(t).hazards) {
    let n = Ne(o.s, e.s, ee(t).length),
      i = Yt(t, o, s);
    if (!e.shortcut && n > -8 && n < 55 && Math.abs(e.y - i.center.y) < 2 && i.phase !== "idle") return i;
  }
  return null;
}
function Js(t, e, s = 45) {
  let o = ee(t).length;
  return le(t).shortcuts.find(n => {
    let i = Ne(n.startS, e.s, o);
    return i >= -3 && i < s;
  }) || null;
}
var xe = Math.PI * 2,
  dn = new Map(),
  fn = new Map(),
  un = new Map(),
  ws = new $.Object3D();
function Ts(t = 17) {
  return () => (t = Math.imul(t, 1664525) + 1013904223 >>> 0, t / 4294967296);
}
function lr(t) {
  if (dn.has(t)) return dn.get(t);
  if (typeof document > "u") return null;
  let e = document.createElement("canvas");
  e.width = e.height = 512;
  let s = e.getContext("2d"),
    o = Ts(91 + t.length * 101);
  if (t === "wood") {
    s.fillStyle = "#946540", s.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 8; i++) {
      let a = i * 64;
      s.fillStyle = ["#ae7e50", "#96643f", "#a37047"][i % 3], s.fillRect(0, a, 512, 63), s.fillStyle = "#9d704c", s.fillRect(0, a + 63, 512, 1);
      for (let r = 0; r < 9; r++) {
        s.beginPath(), s.strokeStyle = `rgba(102,64,38,${0.1 + o() * 0.12})`, s.lineWidth = 0.5 + o();
        let l = a + o() * 61;
        for (let c = 0; c <= 512; c += 16) {
          let h = l + Math.sin(c * 0.018 + r) * (0.5 + o());
          c === 0 ? s.moveTo(c, h) : s.lineTo(c, h);
        }
        s.stroke();
      }
      s.fillStyle = "rgba(102,64,38,.14)", s.fillRect(i * 151 % 512, a, 1, 64);
    }
  } else if (t === "marble") {
    s.fillStyle = "#c9d2c8", s.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1200; i++) s.fillStyle = `rgba(124,119,109,${o() * 0.024})`, s.fillRect(o() * 512, o() * 512, 2 + o() * 9, 2 + o() * 8);
    for (let i = 0; i < 11; i++) {
      let a = o() * 650 - 70;
      s.beginPath(), s.strokeStyle = `rgba(114,128,122,${0.16 + o() * 0.12})`, s.lineWidth = 0.8 + o() * 2;
      for (let r = -10; r < 525; r += 8) {
        let l = a + r * 0.22 + Math.sin(r * 0.014 + i * 2) * 30 + Math.sin(r * 0.043) * 6;
        r === -10 ? s.moveTo(l, r) : s.lineTo(l, r);
      }
      s.stroke();
    }
  } else if (t === "grass") {
    s.fillStyle = "#416b49", s.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 18e3; i++) {
      let a = o() * 512,
        r = o() * 512;
      s.strokeStyle = ["#799d58", "#325941", "#7c9859", "#527b48"][i % 4], s.globalAlpha = 0.2 + o() * 0.36, s.lineWidth = 0.5 + o() * 0.65, s.beginPath(), s.moveTo(a, r), s.lineTo(a + (o() - 0.5) * 4, r - 2 - o() * 6), s.stroke();
    }
    s.globalAlpha = 1;
  } else if (t === "rug") {
    s.fillStyle = "#dacda9", s.fillRect(0, 0, 512, 512);
    let i = ["#2d6370", "#d7805d", "#ece1bd", "#7aa59e", "#e4b95e", "#ece1bd"];
    for (let a = 0; a < 12; a++) s.fillStyle = i[a % 6], s.fillRect(0, a * 44, 512, 40);
    for (let a = 0; a < 512; a += 2) s.fillStyle = a % 4 === 0 ? "rgba(255,255,255,.08)" : "rgba(30,35,25,.08)", s.fillRect(a, 0, 1, 512), s.fillRect(0, a, 512, 1);
  } else if (t === "pages") {
    s.fillStyle = "#e4d5b8", s.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 512; i += 4) s.fillStyle = i % 12 ? "rgba(109,84,55,.12)" : "rgba(255,255,255,.35)", s.fillRect(0, i, 512, 1);
  } else if (t === "quilt") {
    s.fillStyle = "#294e60", s.fillRect(0, 0, 512, 512);
    let i = ["#305364", "#3b6771", "#bf8d50", "#294f5d"];
    for (let a = 0; a < 8; a++) for (let r = 0; r < 8; r++) s.fillStyle = i[(a + r * 3) % 4], s.fillRect(r * 64 + 2, a * 64 + 2, 60, 60), s.strokeStyle = "rgba(230,220,178,.24)", s.lineWidth = 1, s.setLineDash([3, 3]), s.strokeRect(r * 64 + 5, a * 64 + 5, 54, 54);
    s.setLineDash([]);
  } else if (t === "soil" || t === "pebble" || t === "citrus") {
    s.fillStyle = t === "soil" ? "#4a4332" : t === "pebble" ? "#a0a38b" : "#e2b06f", s.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 11e3; i++) {
      s.fillStyle = i % 2 ? "rgba(24,28,16,.09)" : "rgba(241,234,190,.13)";
      let a = t === "citrus" ? 1.5 : 1 + o() * 5;
      s.fillRect(o() * 512, o() * 512, a, a);
    }
  } else if (t === "water") {
    s.fillStyle = "#4d9a8a", s.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 22; i++) {
      s.strokeStyle = "rgba(158,213,169,.13)", s.lineWidth = 1.5 + o() * 3, s.beginPath();
      let a = i * 25;
      for (let r = -10; r <= 525; r += 8) {
        let l = a + Math.sin(r * 0.045 + i) * 8;
        r === -10 ? s.moveTo(r, l) : s.lineTo(r, l);
      }
      s.stroke();
    }
  } else if (t === "cloth") {
    s.fillStyle = "#e25b50", s.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 512; i += 4) s.fillStyle = "rgba(110,29,20,.11)", s.fillRect(i, 0, 1, 512), s.fillStyle = "rgba(255,238,210,.11)", s.fillRect(0, i, 512, 1);
  } else if (t === "robot") {
    s.fillStyle = "#224d57", s.fillRect(0, 0, 512, 512), s.strokeStyle = "#74c8c0", s.lineWidth = 7, s.strokeRect(35, 35, 442, 442), s.fillStyle = "#fff0ca", s.font = "bold 226px sans-serif", s.textAlign = "center", s.fillText("07", 256, 291);
    for (let [i, a] of [["#df7960", 75], ["#e8c868", 160], ["#7fc6aa", 245]]) s.fillStyle = i, s.fillRect(a, 352, 70, 34);
    s.strokeStyle = "#a5d5cb", s.lineWidth = 4, s.beginPath(), s.moveTo(78, 424), s.lineTo(431, 424), s.stroke();
  }
  let n = new $.CanvasTexture(e);
  return n.colorSpace = $.SRGBColorSpace, n.wrapS = n.wrapT = $.RepeatWrapping, n.anisotropy = 4, t === "wood" && n.repeat.set(9, 9), t === "marble" && n.repeat.set(3, 3), t === "grass" && n.repeat.set(26, 26), t === "cloth" && n.repeat.set(2, 2), dn.set(t, n), n;
}
function k(t, e, s = 0.7, o = 0, n = null, i = {}) {
  if (!fn.has(t)) {
    let a = new $.MeshStandardMaterial({
      color: e,
      roughness: s,
      metalness: o,
      map: n ? lr(n) : null,
      ...i
    });
    a.name = t, fn.set(t, a);
  }
  return fn.get(t);
}
function Je(t, e) {
  return un.has(t) || un.set(t, e()), un.get(t);
}
function cr(t, e, s, o = 0.25) {
  let n = Math.min(o, t * 0.48, e * 0.48, s * 0.48);
  return Je(`box:${t}:${e}:${s}:${n}`, () => {
    let i = new $.BoxGeometry(1, 1, 1, 4, 4, 4),
      a = i.attributes.position,
      r = i.attributes.normal,
      l = new $.Vector3(),
      c = new $.Vector3(),
      h = new $.Vector3(),
      d = (u, f) => u <= -0.49 ? -f / 2 : u < -0.01 ? -f / 2 + n : u >= 0.49 ? f / 2 : u > 0.01 ? f / 2 - n : 0;
    for (let u = 0; u < a.count; u++) l.set(d(a.getX(u), t), d(a.getY(u), e), d(a.getZ(u), s)), c.set($.MathUtils.clamp(l.x, -t / 2 + n, t / 2 - n), $.MathUtils.clamp(l.y, -e / 2 + n, e / 2 - n), $.MathUtils.clamp(l.z, -s / 2 + n, s / 2 - n)), h.copy(l).sub(c).normalize(), l.copy(c).addScaledVector(h, n), a.setXYZ(u, l.x, l.y, l.z), r.setXYZ(u, h.x, h.y, h.z);
    return i.computeBoundingBox(), i.computeBoundingSphere(), i;
  });
}
var hr = () => Je("sphere", () => new $.SphereGeometry(1, 16, 10)),
  dr = () => Je("petal", () => new $.SphereGeometry(1, 10, 6));
function oe(t, e, s, o = 16) {
  return Je(`cyl:${t}:${e}:${s}:${o}`, () => new $.CylinderGeometry(t, e, s, o));
}
function Ke(t, e, s = xe, o = 32) {
  return Je(`torus:${t}:${e}:${s}:${o}`, () => new $.TorusGeometry(t, e, 8, o, s));
}
function oo(t, e = 32) {
  return new $.LatheGeometry(t.map(s => new $.Vector2(s[0], s[1])), e);
}
function eo(t, e, s = 24) {
  return new $.TubeGeometry(new $.CatmullRomCurve3(t.map(o => new $.Vector3(...o))), s, e, 6, !1);
}
var to = class {
  constructor(e) {
    this.name = e, this.items = new Map(), this.pose = new $.Matrix4(), this.landmarks = [];
  }
  add(e, s, o = [0, 0, 0], n = [0, 0, 0], i = [1, 1, 1]) {
    ws.position.set(...o), ws.rotation.set(...n), ws.scale.set(...i), ws.updateMatrix();
    let a = e.index ? e.toNonIndexed() : e.clone();
    return a.applyMatrix4(new $.Matrix4().multiplyMatrices(this.pose, ws.matrix)), a.attributes.uv || a.setAttribute("uv", new $.BufferAttribute(new Float32Array(a.attributes.position.count * 2), 2)), a.attributes.normal || a.computeVertexNormals(), this.items.has(s) || this.items.set(s, []), this.items.get(s).push(a), this;
  }
  box(e, s, o, n, i, a = [0, 0, 0], r = 0.25) {
    return this.add(cr(e, s, o, r), n, i, a);
  }
  ball(e, s, o = [1, 1, 1], n = [0, 0, 0], i = !1) {
    return this.add(i ? dr() : hr(), e, s, n, o);
  }
  finish() {
    let e = new $.Group();
    e.name = this.name;
    let s = 0;
    for (let [o, n] of this.items) {
      let i = n.reduce((l, c) => l + c.attributes.position.count, 0),
        a = new $.BufferGeometry();
      for (let l of ["position", "normal", "uv"]) {
        let c = new Float32Array(i * (l === "uv" ? 2 : 3)),
          h = 0;
        for (let d of n) c.set(d.attributes[l].array, h), h += d.attributes[l].array.length;
        a.setAttribute(l, new $.BufferAttribute(c, l === "uv" ? 2 : 3));
      }
      a.computeBoundingBox(), a.computeBoundingSphere();
      let r = new $.Mesh(a, o);
      r.name = `${this.name}-${o.name}`, r.castShadow = !o.userData.noShadow, r.receiveShadow = !0, e.add(r), s += i / 3, n.forEach(l => l.dispose());
    }
    return e.userData.environmentStats = {
      drawCalls: e.children.length,
      triangles: s
    }, e.userData.landmarks = this.landmarks, e;
  }
};
function vs(t, e) {
  t.add(new $.PlaneGeometry(470, 400), e, [0, -0.2, 0], [-Math.PI / 2, 0, 0]), e.userData.noShadow = !0;
}
function mn(t, e, s) {
  let o = k("page-edges", "#fff4dc", 0.89, 0, "pages"),
    n = [k("book-coral", "#d96854", 0.62), k("book-navy", "#31546c", 0.56), k("book-green", "#679384", 0.61)],
    i = k("book-foil", "#e4bb72", 0.36, 0.35);
  for (let a = 0; a < 4; a++) {
    let r = [0.11, -0.08, 0.14, -0.02][a],
      l = a * 1.6 + 0.3,
      c = 15.7 - a * 0.7,
      h = 10.1 - a * 0.4;
    t.box(c, 0.28, h, n[a % 3], [e, l, s], [0, r, 0], 0.12), t.box(c - 0.5, 1.13, h - 0.55, o, [e, l + 0.69, s], [0, r, 0], 0.12), t.box(c, 0.28, h, n[a % 3], [e, l + 1.36, s], [0, r, 0], 0.12);
    let d = e - Math.sin(r) * (h / 2 - 0.16),
      u = s - Math.cos(r) * (h / 2 - 0.16);
    t.box(c - 0.4, 1.25, 0.38, n[a % 3], [d, l + 0.66, u], [0, r, 0], 0.13);
    for (let f = 0; f < 2; f++) t.box(c * 0.45, 0.045, 0.055, i, [d, l + 0.5 + f * 0.34, u - 0.22], [0, r, 0], 0.02);
  }
}
function gi(t, e, s) {
  let o = k("robot-enamel", "#6ba8a5", 0.34, 0.2),
    n = k("robot-chrome", "#c7d5ca", 0.35, 0.55),
    i = k("robot-dark", "#274f58", 0.46, 0.12),
    a = k("robot-eye", "#b5f1d9", 0.26, 0.15, null, {
      emissive: "#469688",
      emissiveIntensity: 0.24
    }),
    r = k("robot-panel", "#ffffff", 0.58, 0, "robot");
  t.box(7.2, 6, 4.2, o, [e, 6.1, s], [0, 0.05, 0], 0.75), t.box(6.8, 4.6, 4.7, o, [e, 11.4, s], [0, -0.08, 0], 0.95), t.box(5.35, 2.65, 0.3, i, [e, 11.7, s + 2.34], [0, -0.08, 0], 0.54);
  for (let l of [-1, 1]) t.add(oe(0.66, 0.66, 0.25, 20), a, [e + l * 1.37, 11.95, s + 2.53], [Math.PI / 2, 0, 0]), t.add(oe(1.1, 1.1, 1.1), n, [e + l * 4.2, 7.9, s], [0, 0, Math.PI / 2]), t.add(oe(0.9, 1, 3.8), o, [e + l * 4.35, 5.4, s + 0.3], [0.11, 0, l * 0.1]), t.ball(n, [e + l * 4.5, 3.3, s + 0.5], [1.1, 1.1, 1.1]), t.box(2.3, 2.35, 2.5, i, [e + l * 1.7, 2.45, s], [0, 0, 0], 0.4), t.box(2.75, 1.25, 4.1, o, [e + l * 1.7, 0.7, s + 0.7], [0, l * 0.06, 0], 0.5), t.add(oe(0.27, 0.27, 1.65, 8), n, [e + l * 1.75, 14.1, s]), t.ball(a, [e + l * 1.75, 15.05, s], [0.53, 0.53, 0.53]);
  t.box(3.9, 3.45, 0.12, r, [e, 6.7, s + 2.19], [0, 0.05, 0], 0.12), t.box(2, 0.22, 0.18, n, [e, 10.73, s + 2.53], [0, -0.08, 0], 0.06);
}
function fr() {
  let t = [[-7.4, 2.3, 4.4], [-5.3, 2.8, 5.4], [-2.5, 3.15, 5.65], [0.8, 3.25, 4.3], [4.3, 3.1, 3.1], [6.7, 2.4, 2.5], [7.6, 0.25, 1.9]],
    e = [],
    s = [],
    o = [],
    n = 10;
  for (let a = 0; a < t.length; a++) {
    let [r, l, c] = t[a];
    for (let h = 0; h <= n; h++) {
      let d = h / n * Math.PI;
      e.push(r, 1.32 + Math.sin(d) * (c - 1.32), Math.cos(d) * l), s.push(a / (t.length - 1), h / n);
    }
  }
  for (let a = 0; a < t.length - 1; a++) for (let r = 0; r < n; r++) {
    let l = a * (n + 1) + r,
      c = l + n + 1;
    o.push(l, c, l + 1, l + 1, c, c + 1);
  }
  let i = new $.BufferGeometry();
  return i.setAttribute("position", new $.Float32BufferAttribute(e, 3)), i.setAttribute("uv", new $.Float32BufferAttribute(s, 2)), i.setIndex(o), i.computeVertexNormals(), i;
}
function ur(t, e, s) {
  let o = k("shoe-canvas", "#ffe2d7", 0.96, 0, "cloth"),
    n = k("shoe-rubber", "#f9ead2", 0.77),
    i = k("shoe-stripe", "#41596b", 0.75),
    a = k("shoe-lining", "#553b38", 0.93),
    r = new to("shoe");
  r.box(15.8, 1.3, 6.7, n, [0, 0.65, 0], [0, 0, 0], 1.08), r.box(15.6, 0.19, 6.69, i, [0, 0.54, 0], [0, 0, 0], 0.08), r.add(fr(), o), r.add(Ke(1.65, 0.42, xe, 28), n, [-4.8, 5.15, 0], [Math.PI / 2, 0, 0], [1.05, 1.1, 0.56]), r.add(oe(1.53, 1.53, 0.16, 20), a, [-4.8, 5.03, 0], [0, 0, 0], [1.04, 1, 1.1]), r.add(eo([[-6.5, 2.8, 2.1], [-4, 3.9, 2.7], [0, 3.3, 2.8], [4.5, 2.25, 2.8], [6.5, 1.7, 1.7]], 0.06), n);
  for (let h = 0; h < 5; h++) {
    let d = -2.8 + h * 1.25,
      u = 5.42 - h * 0.5;
    r.add(eo([[d - 0.27, u - 0.65, -1.55], [d, u + 0.15, 0], [d + 0.27, u - 0.65, 1.55]], 0.13, 10), n);
    for (let f of [-1, 1]) r.add(Ke(0.2, 0.055, xe, 12), i, [d, u - 0.6, f * 1.52], [f * 0.75, Math.PI / 2, 0]);
  }
  let l = r.finish(),
    c = new $.Object3D();
  c.position.set(e, 0, s), c.rotation.y = -0.35, c.updateMatrix();
  for (let h of l.children) {
    let d = h.geometry.clone().applyMatrix4(c.matrix);
    t.add(d, h.material), d.dispose(), h.geometry.dispose();
  }
}
function yn() {
  return Je("leaf", () => {
    let t = [],
      e = [],
      s = [];
    for (let i = 0; i <= 6; i++) {
      let a = i / 6,
        r = Math.sin(a * Math.PI) * 0.46;
      for (let l = 0; l < 3; l++) {
        let c = l - 1;
        t.push(c * r, a * 2, Math.sin(a * Math.PI) * (c === 0 ? 0.16 : -0.06)), e.push(l / 2, a);
      }
    }
    for (let i = 0; i < 6; i++) for (let a = 0; a < 2; a++) {
      let r = i * 3 + a;
      s.push(r, r + 3, r + 1, r + 1, r + 3, r + 4);
    }
    let n = new $.BufferGeometry();
    return n.setAttribute("position", new $.Float32BufferAttribute(t, 3)), n.setAttribute("uv", new $.Float32BufferAttribute(e, 2)), n.setIndex(s), n.computeVertexNormals(), n;
  });
}
function pr(t, e, s, o, n, i, a) {
  t.add(oe(n * 0.095, n * 0.12, s, 8), a, [e, s / 2, o], [0, 0, 0.035]);
  let r = k("garden-leaf", "#4d7f57", 0.85, 0, null, {
    side: $.DoubleSide
  });
  for (let l of [-1, 1]) t.add(yn(), r, [e, s * (l === -1 ? 0.38 : 0.55), o], [0.4, l * 1.2, l * 0.88], [n * 1.3, n * 1.6, n * 1.3]);
  for (let l = 0; l < 7; l++) {
    let c = l * xe / 7;
    t.ball(i, [e + Math.cos(c) * n * 1.08, s + Math.sin(c) * n * 0.23, o + Math.sin(c) * n * 1.08], [n * 0.6, n * 0.34, n * 1.05], [0, -c, 0.12], !0);
  }
  t.ball(k("pollen", "#dfb15f", 0.86), [e, s + n * 0.3, o], [n * 0.61, n * 0.4, n * 0.61], [0, 0, 0], !0);
}
function so(t, e, s) {
  let o = 1 / 0;
  for (let n = 0; n < t.count; n += 3) {
    let i = t.samples[n];
    o = Math.min(o, Math.hypot(i.x - e, i.z - s));
  }
  return Math.min(o, We(t, e, s, null, 0).distance);
}
function mr(t, e, s, o, n) {
  let i = ee(t.base).scale || 1,
    a = [...le(t.id).shortcuts.map(r => [r, 1]), ...le(t.base).shortcuts.map(r => [r, i]), ...le(`${t.base}-rev`).shortcuts.map(r => [r, i])];
  for (let [r, l] of a) {
    if (l !== 1) {
      let h = o * l + r.width / 2 + 2,
        d = e * l,
        u = s * l;
      for (let f of r.samples) if (!(n * l + 0.25 < f.y) && Math.hypot(d - f.x, u - f.z) < h) return !1;
      continue;
    }
    let c = o + r.width / 2 + 1.5;
    for (let h = 0; h < r.samples.length - 1; h++) {
      let d = r.samples[h],
        u = r.samples[h + 1],
        f = u.x - d.x,
        y = u.z - d.z,
        m = $.MathUtils.clamp(((e - d.x) * f + (s - d.z) * y) / (f * f + y * y || 1), 0, 1),
        p = d.y + (u.y - d.y) * m;
      if (!(n + 0.25 < p) && Math.hypot(e - d.x - f * m, s - d.z - y * m) < c) return !1;
    }
  }
  return !0;
}
function Ee(t, e, s, o, n, i, {
  yaw: a = 0,
  scale: r = 1,
  margin: l = 7,
  height: c = 30,
  search: h = !0
} = {}) {
  let d = e.width / 2 + n + l,
    u = (M, x) => Math.abs(M) < 225 - n && Math.abs(x) < 190 - n && M > e.bounds.minX - 34 + n && x > e.bounds.minZ - (e.base === "bedroom" ? 39 : 34) + n && so(e, M, x) >= d && mr(e, M, x, n, c) && t.landmarks.every(T => T.flat || Math.hypot(M - T.x, x - T.z) > n + T.radius + 2),
    f = o[0],
    y = o[1],
    m = u(f, y);
  for (let M = 5; M <= 135 && !m && h; M += 5) for (let x = 0; x < 20 && !m; x++) {
    let T = x * xe / 20,
      g = o[0] + Math.cos(T) * M,
      H = o[1] + Math.sin(T) * M;
    u(g, H) && (f = g, y = H, m = !0);
  }
  if (!m) return null;
  let p = t.pose.clone(),
    b = new $.Object3D();
  b.position.set(f, 0, y), b.rotation.y = a, b.scale.setScalar(r), b.updateMatrix(), t.pose.copy(b.matrix), i(t), t.pose.copy(p);
  let w = {
    name: s,
    x: f,
    z: y,
    radius: n,
    height: c,
    clearance: so(e, f, y) - n - e.width / 2
  };
  return t.landmarks.push(w), w;
}
function Gt(t, e, s = 1, o = 25) {
  let n = G(t, t.length * e, s * o);
  return [n.x, n.z];
}
function ze(t, e, s, o, n, i, a = [0, 0, 0]) {
  t.add(Je("plain-box", () => new $.BoxGeometry(1, 1, 1)), n, i, a, [e, s, o]);
}
function yr(t, e, s, o, n, i, a, r) {
  ze(t, o, n, 0.65, r, [e, i + n / 2, s]);
  for (let [l, c, h, d] of [[-o / 2, n / 2, 1.5, n + 2], [o / 2, n / 2, 1.5, n + 2], [0, 0, o + 2, 1.5], [0, n, o + 2, 1.5], [0, n / 2, 1.3, n], [0, n / 2, o, 1.2]]) t.box(h, d, 1.3, a, [e + l, i + c, s + 0.7], [0, 0, 0], 0.2);
}
function br(t) {
  let e = k("bed-upholstery", "#244755", 0.92),
    s = k("bed-quilt", "#ffffff", 0.98, 0, "quilt"),
    o = k("bed-linen", "#e1d5af", 0.99),
    n = k("bed-pillow-orange", "#bf6b3c", 0.96),
    i = k("bed-legs", "#684c34", 0.72);
  t.box(51, 9.5, 66, e, [0, 7, 0], [0, 0, 0], 3.3), t.box(53, 28, 4.8, e, [0, 16, -33], [0, 0, 0], 2.25);
  for (let r of [-19, 19]) for (let l of [-25, 25]) t.add(oe(1.3, 1.1, 3.3, 12), i, [r, 1.6, l]);
  t.box(48, 5.6, 61, o, [0, 14, 0], [0, 0, 0], 2.6), t.box(48.6, 1.25, 42, s, [0, 17.4, 8], [0, 0, 0], 0.55), t.box(47.8, 5.1, 0.6, s, [0, 14.7, 28.9], [0, 0, 0], 0.28);
  for (let r of [-13, 13]) t.box(21.2, 5, 14.4, o, [r, 19.2, -21], [0.18, r < 0 ? -0.08 : 0.08, 0], 2.4), t.box(11.5, 4.6, 11.1, n, [r, 21, -12], [0.28, r < 0 ? 0.15 : -0.12, 0], 2.1);
  let a = k("bed-buttons", "#507681", 0.94);
  for (let r = 0; r < 3; r++) for (let l = 0; l < 6; l++) t.ball(a, [-20 + l * 8, 12 + r * 6, -30.42], [0.42, 0.42, 0.13], [0, 0, 0], !0);
}
function gr(t) {
  let e = k("train-table-oak", "#855e3d", 0.8),
    s = k("train-table-felt", "#547363", 0.97),
    o = k("train-rail", "#bdbaa4", 0.47, 0.45),
    n = k("train-sleepers", "#5f4b37", 0.88),
    i = k("train-red", "#b54b38", 0.43, 0.18),
    a = k("train-tire", "#343d3d", 0.86);
  t.box(44, 2.7, 28, e, [0, 8, 0], [0, 0, 0], 1), t.box(41, 0.25, 25, s, [0, 9.42, 0], [0, 0, 0], 0.1);
  for (let r of [-17, 17]) for (let l of [-9, 9]) t.box(2.6, 6.9, 2.6, e, [r, 3.4, l], [0, 0, 0], 0.4);
  for (let r of [1, 1.1]) {
    let l = [];
    for (let c = 0; c <= 64; c++) {
      let h = c * xe / 64;
      l.push([Math.cos(h) * 16 * r, 9.8, Math.sin(h) * 8 * r]);
    }
    t.add(eo(l, 0.17, 64), o);
  }
  for (let r = 0; r < 36; r++) {
    let l = r * xe / 36;
    ze(t, 0.7, 0.24, 3, n, [Math.cos(l) * 16.8, 9.63, Math.sin(l) * 8.4], [0, -l + Math.PI / 2, 0]);
  }
  for (let r = 0; r < 3; r++) {
    let l = -6.6 + r * 6.9;
    if (r === 0) {
      t.add(oe(1.48, 1.48, 4.5, 20), i, [l - 0.4, 12, 8.65], [0, 0, Math.PI / 2]), t.box(2.5, 3.5, 3.7, i, [l + 1.6, 13, 8.65], [0, 0, 0], 0.3), t.box(3, 0.43, 4, o, [l + 1.6, 14.94, 8.65], [0, 0, 0], 0.18), t.add(oe(0.5, 0.35, 2.3, 12), a, [l - 1.35, 14.6, 8.65]), t.add(oe(0.95, 0.65, 0.6, 12), o, [l - 1.35, 16, 8.65]);
      for (let c of [-1, 1]) t.box(1.2, 1.7, 0.1, a, [l + 1.6, 13.7, 8.65 + c * 1.88], [0, 0, 0], 0.04);
    } else {
      t.box(5.4, 2.5, 3.7, i, [l, 12, 8.65], [0, 0, 0], 0.55), t.box(5.6, 0.43, 3.9, o, [l, 13.5, 8.65], [0, 0, 0], 0.15);
      for (let c of [-1, 1]) for (let h of [-1.5, 0, 1.5]) t.box(0.9, 1.15, 0.1, a, [l + h, 12.05, 8.65 + c * 1.88], [0, 0, 0], 0.04);
    }
    for (let c of [-1.7, 1.7]) for (let h of [-1, 1]) t.add(oe(0.72, 0.72, 0.45, 12), a, [l + c, 10.42, 8.65 + h * 1.9], [Math.PI / 2, 0, 0]);
  }
}
function zi(t, e = 0) {
  let s = [k("block-coral", "#b94e3f", 0.64), k("block-blue", "#286b7b", 0.57), k("block-yellow", "#c89531", 0.67)],
    o = k("block-engraving", "#e9d9ab", 0.81);
  for (let n = 0; n < 3; n++) {
    let i = n === 0 ? -2.5 : 2.2,
      a = n === 2 ? 0.2 : (n - 0.5) * 3.8,
      r = n === 2 ? 4.8 : 1.7;
    t.box(3.1, 3.1, 3.1, s[(e + n) % 3], [i, r, a], [0, (e + n) * 0.23, 0], 0.3), t.box(1.6, 0.19, 0.12, o, [i, r, a + 1.59], [0, 0, 0], 0.07);
  }
}
function xr(t, e) {
  vs(t, k("bedroom-floor", "#ffffff", 0.78, 0, "wood"));
  let s = k("bedroom-v2-wall", "#91aeb5", 0.95),
    o = k("bedroom-cream", "#dfcfaa", 0.76),
    n = k("bedroom-walnut", "#785133", 0.66),
    i = k("room-brass", "#b28c46", 0.4, 0.5),
    a = e.bounds.minX - 38,
    r = e.bounds.minZ - 42,
    l = e.bounds.maxZ + 39;
  ze(t, 455, 67, 2, s, [0, 33, r]), ze(t, 2, 67, 355, s, [a, 33, 0]), t.box(455, 3.5, 1.1, o, [0, 1.6, r + 1.3], [0, 0, 0], 0.22), t.box(1.1, 3.5, 355, o, [a + 1.3, 1.6, 0], [0, 0, 0], 0.22), ze(t, 455, 1.6, 1.3, i, [0, 24, r + 1.1]);
  let c = k("window-daylight-v2", "#a9d5df", 0.31, 0.15, null, {
    emissive: "#4688ac",
    emissiveIntensity: 0.16
  });
  yr(t, -25, r + 1.3, 112, 42, 20, o, c);
  let h = k("room-curtain-v2", "#b57845", 0.98, 0, null, {
    side: $.DoubleSide
  });
  for (let f of [-92, 42]) {
    let y = new $.PlaneGeometry(23, 54, 24, 2),
      m = y.attributes.position;
    for (let p = 0; p < m.count; p++) m.setZ(p, Math.sin(m.getX(p) * 1.2) * 1.4);
    y.computeVertexNormals(), t.add(y, h, [f, 35, r + 3.1]);
  }
  let d = a + 12;
  t.box(16, 3, 90, n, [d, 1.4, 34], [0, 0, 0], 0.5);
  for (let f of [-11, 34, 79]) t.box(16, 51, 2.8, n, [d, 26, f], [0, 0, 0], 0.3);
  for (let f of [17, 34, 51]) t.box(16, 1.6, 92, o, [d, f, 34], [0, 0, 0], 0.3);
  for (let f = 0; f < 12; f++) {
    let y = [k("shelf-book-red", "#a85640", 0.76), k("shelf-book-blue", "#30565d", 0.77), k("shelf-book-gold", "#ba913f", 0.8)][f % 3];
    t.box(3.8, 10.5 + f % 3, 6.2, y, [d, 23 + f % 2 * 17, -1 + f * 6.4], [0, 0, (f % 3 - 1) * 0.08], 0.18);
  }
  t.box(65, 3, 33, n, [148, 33, r + 20], [0, 0, 0], 0.8);
  for (let f of [122, 174]) for (let y of [r + 7, r + 33]) t.box(3.1, 31, 3.1, o, [f, 15.5, y], [0, 0, 0], 0.4);
  let u = k("rug-v2", "#b8a985", 0.99, 0, "rug");
  t.box(64, 0.05, 50, u, [-100, -0.1, 41], [0, 0.09, 0], 0.024), Ee(t, e, "UPHOLSTERED BED", [85, -105], 43, br, {
    yaw: 0.06,
    height: 32
  }), Ee(t, e, "BOOK CANYON WEST", Gt(e, 0.185, -1, 36), 17, f => mn(f, 0, 0), {
    scale: 1.55,
    yaw: 0.12,
    height: 10
  }), Ee(t, e, "BOOK CANYON EAST", Gt(e, 0.205, 1, 34), 17, f => mn(f, 0, 0), {
    scale: 1.55,
    yaw: -0.2,
    height: 10
  }), Ee(t, e, "ROBOT SENTINEL", [-117, 39], 8, f => gi(f, 0, 0), {
    scale: 1.4,
    yaw: -0.25,
    height: 22
  }), Ee(t, e, "ROBOT PIT CREW", [137, 59], 7, f => gi(f, 0, 0), {
    yaw: 0.7,
    height: 16
  }), Ee(t, e, "CANVAS SNEAKER", [-78, -67], 9, f => ur(f, 0, 0), {
    scale: 1.08,
    yaw: 0.2,
    height: 6
  }), Ee(t, e, "RAILROAD PLAY TABLE", [80, 56], 27, gr, {
    yaw: -0.14,
    height: 16
  });
  for (let f = 0; f < 16; f++) Ee(t, e, `WOODEN TOYS ${f + 1}`, Gt(e, (f + 0.35) / 16, f % 2 ? 1 : -1, 22), 6.5, y => zi(y, f), {
    yaw: f * 0.31,
    margin: 6,
    height: 7
  });
  t.box(455, 3.2, 1, n, [0, 1.3, l], [0, 0, 0], 0.2);
}
function Qs(t, e = "#27666b") {
  let s = k(`mug-${e}`, e, 0.19),
    o = k("kitchen-ceramic-v2", "#e5d7b9", 0.24);
  t.add(oo([[0, 0.3], [5.8, 0.3], [6.4, 0.8], [6.9, 2], [7, 12.8], [6.9, 14.1], [6.7, 14.4], [6.2, 14.4], [6.1, 13.9], [6.25, 2], [5.4, 1.3], [0, 1.3]], 40), s), t.add(Ke(6.45, 0.24, xe, 40), o, [0, 14.24, 0], [Math.PI / 2, 0, 0]), t.add(Ke(4, 1.12, xe, 36), s, [0, 7.8, 7.1], [0, Math.PI / 2, 0], [1, 1.28, 1]), t.add(oe(6.03, 6.03, 0.12, 40), k("coffee-v2", "#312922", 0.24), [0, 13.65, 0]), t.add(Ke(3.9, 0.16, xe * 0.72, 30), k("coffee-foam-v2", "#bc955f", 0.64), [0, 13.73, 0], [Math.PI / 2, 0, -0.5]);
}
function wr(t) {
  let e = k("bowl-glaze-v2", "#b56b5e", 0.25),
    s = k("kitchen-ceramic-v2", "#e5d7b9", 0.24);
  t.add(oo([[0, 0.4], [4.3, 0.4], [5.6, 0.9], [7.3, 3.8], [8.2, 6.1], [8.3, 6.5], [7.8, 6.65], [7.55, 6.15], [6.9, 3.7], [5.15, 1.2], [0, 1.2]], 40), e), t.add(Ke(8, 0.23, xe, 40), s, [0, 6.55, 0], [Math.PI / 2, 0, 0]), t.add(oe(6.3, 6.3, 0.1, 32), s, [0, 3.85, 0]);
  let o = [k("cereal-gold-v2", "#bd8740", 0.9), k("cereal-red-v2", "#b85f48", 0.89), k("cereal-green-v2", "#799043", 0.89)],
    n = Ts(300);
  for (let i = 0; i < 16; i++) {
    let a = n() * xe,
      r = Math.sqrt(n()) * 5.2;
    t.add(Ke(0.73, 0.3, xe, 16), o[i % 3], [Math.cos(a) * r, 4.03 + n() * 0.2, Math.sin(a) * r], [Math.PI / 2 + n() * 0.2, 0, n() * xe]);
  }
}
function Ms(t, e, s, o = "orange", n = 3.1) {
  let i = {
      orange: "#cc7625",
      lemon: "#d3b037",
      apple: "#ae4034"
    },
    a = k(`fruit-${o}`, i[o], 0.57, 0, "citrus"),
    r = k("fruit-stem", "#68502d", 0.93),
    l = k("fruit-leaf", "#397349", 0.83, 0, null, {
      side: $.DoubleSide
    });
  t.ball(a, [e, n * 0.92, s], [n * (o === "lemon" ? 1.3 : 1), n, n * 0.96]), t.add(oe(0.13, 0.18, 0.9, 8), r, [e, n * 1.94, s], [0, 0, 0.18]), t.add(yn(), l, [e, n * 2.04, s], [1, 0.6, -0.7], [0.9, 1.5, 0.9]);
}
function Er(t) {
  let e = k("kitchen-board-v2", "#9e713d", 0.73, 0, "wood"),
    s = k("kitchen-steel-v2", "#a7b7b4", 0.26, 0.72),
    o = k("knife-handle-v2", "#355655", 0.54);
  t.box(40, 1.1, 27, e, [0, 0.5, 0], [0, 0, 0], 0.52), t.box(8, 1.1, 10, e, [23, 0.5, 0], [0, 0, 0], 0.45);
  for (let [i, a, r, l] of [[-10, -4, "orange", 4], [-1, -5, "lemon", 3.8], [-7, 6, "apple", 3.6], [9, -5, "orange", 3.1]]) {
    let c = t.pose.clone(),
      h = new $.Matrix4().makeTranslation(0, 1, 0);
    t.pose.multiply(h), Ms(t, i, a, r, l), t.pose.copy(c);
  }
  t.box(9, 0.75, 1.7, o, [8, 1.7, 6.4], [0, -0.1, 0], 0.32);
  let n = Je("knife-blade-v2", () => {
    let i = new $.Shape();
    return i.moveTo(0, 0), i.lineTo(13, 0), i.quadraticCurveTo(12, 2.8, 5, 3), i.lineTo(0, 3), i.closePath(), new $.ExtrudeGeometry(i, {
      depth: 0.25,
      bevelEnabled: !0,
      bevelSize: 0.06,
      bevelThickness: 0.06,
      bevelSegments: 1,
      steps: 1
    });
  });
  t.add(n, s, [-0.5, 1.35, 5], [Math.PI / 2, 0, 0]);
}
function Mr(t) {
  let e = k("toaster-enamel", "#b24839", 0.28, 0.35),
    s = k("kitchen-steel-v2", "#a7b7b4", 0.26, 0.72),
    o = k("kitchen-dark-v2", "#273f40", 0.46, 0.22);
  t.box(29, 18, 17, e, [0, 10, 0], [0, 0, 0], 4), t.box(29.7, 1.4, 17.4, s, [0, 1.1, 0], [0, 0, 0], 0.6);
  for (let n of [-3.9, 3.9]) t.box(21, 0.4, 3, o, [0, 19, n], [0, 0, 0], 0.18), t.box(21.8, 0.27, 0.3, s, [0, 19.16, n + 1.64], [0, 0, 0], 0.13);
  t.box(0.5, 11.5, 1.2, o, [14.52, 9.5, 0], [0, 0, 0], 0.18), t.box(3.6, 1.3, 4.1, s, [15.8, 8.8, 0], [0, 0, 0], 0.5), t.add(oe(1.7, 1.7, 0.8, 20), o, [15, 4.4, 4.8], [0, 0, Math.PI / 2]), t.add(Ke(1.7, 0.2, xe, 20), s, [15.45, 4.4, 4.8], [0, Math.PI / 2, 0]);
}
function xi(t) {
  let e = k("kitchen-steel-v2", "#a7b7b4", 0.26, 0.72),
    s = k("kitchen-board-v2", "#9e713d", 0.73, 0, "wood");
  t.add(oe(0.45, 0.62, 22, 12), s, [-2, 0.62, -2], [0.02, 0, Math.PI / 2 - 0.03]), t.ball(s, [-14, 0.96, -2], [4.9, 0.6, 3]), t.box(17, 0.6, 1.2, e, [2, 0.35, 6.3], [0, -0.1, 0], 0.29), t.box(3.4, 0.4, 3.8, e, [-8, 0.4, 7.3], [0, -0.1, 0], 0.19);
  for (let o = 0; o < 4; o++) t.box(5, 0.35, 0.42, e, [-12, 0.38, 5.85 + o * 1.08], [0, -0.1, 0], 0.17);
}
function Tr(t, e) {
  vs(t, k("kitchen-marble-v2", "#ffffff", 0.29, 0.04, "marble"));
  let s = k("kitchen-ceramic-v2", "#e5d7b9", 0.24),
    o = k("kitchen-cabinet-v2", "#366c67", 0.45),
    n = k("kitchen-oak-v2", "#a0774d", 0.74),
    i = k("kitchen-steel-v2", "#a7b7b4", 0.26, 0.72),
    a = k("kitchen-tile-v2", "#75988c", 0.41),
    r = k("kitchen-dark-v2", "#273f40", 0.46, 0.22),
    l = e.bounds.minZ - 40,
    c = e.bounds.minX - 40;
  ze(t, 466, 77, 2, a, [0, 38, l]);
  for (let d = 0; d < 7; d++) ze(t, 464, 0.22, 0.12, s, [0, d * 11 + 3, l + 1.1]);
  for (let d = 0; d < 19; d++) ze(t, 0.22, 75, 0.12, s, [-223 + d * 25, 38, l + 1.1]);
  for (let d = 0; d < 8; d++) {
    let u = -199 + d * 57;
    t.box(54, 25, 18, o, [u, 46, l + 11], [0, 0, 0], 0.7), t.box(51.5, 22.7, 0.8, s, [u, 46, l + 20.4], [0, 0, 0], 0.45), t.box(33, 14, 0.5, o, [u, 46, l + 21], [0, 0, 0], 0.25), t.add(oe(0.35, 0.35, 5.8, 8), i, [u + 18, 46, l + 21.5]);
  }
  ze(t, 2, 67, 350, a, [c, 33, 0]), t.box(34, 24, 30, r, [c + 19, 12, 98], [0, 0, 0], 0.8), t.box(30, 16, 0.8, i, [c + 19, 12, 113.4], [0, 0, 0], 0.6), t.box(25, 11, 0.6, r, [c + 19, 12, 114], [0, 0, 0], 0.5), t.box(470, 2.5, 400, n, [0, -1.8, 0], [0, 0, 0], 0.8), Ee(t, e, "BREAKFAST CHOPPING BOARD", [100, 42], 29, Er, {
    yaw: 0.19,
    height: 10
  }), Ee(t, e, "RED TOASTER", [-114, 47], 19, Mr, {
    yaw: -0.3,
    height: 20
  }), Ee(t, e, "CEREAL BOWL", [-144, 2], 12, wr, {
    scale: 1.3,
    height: 9
  }), Ee(t, e, "COFFEE CUP TEAL", [88, -23], 14, d => Qs(d, "#286a70"), {
    yaw: -0.2,
    scale: 1.3,
    height: 19
  }), Ee(t, e, "COFFEE CUP CORAL", [-2, -118], 12, d => Qs(d, "#b04b38"), {
    yaw: 1.7,
    height: 15
  }), Ee(t, e, "COFFEE CUP CREAM", [-11, 115], 12, d => Qs(d, "#c09d5d"), {
    yaw: 0.6,
    height: 15
  }), Ee(t, e, "CUTLERY FAN", [65, 73], 18, xi, {
    yaw: -0.55,
    height: 3
  }), Ee(t, e, "CUTLERY RETURN", [-171, -74], 18, xi, {
    yaw: 0.25,
    height: 3
  });
  let h = ["orange", "lemon", "apple"];
  for (let d = 0; d < 18; d++) Ee(t, e, `FRESH FRUIT ${d + 1}`, Gt(e, (d + 0.25) / 18, d % 2 ? -1 : 1, 24), 5.3, u => {
    Ms(u, -1.2, 0, h[d % 3], 3), d % 2 && Ms(u, 3, 2.3, h[(d + 1) % 3], 1.8);
  }, {
    yaw: d * 0.6,
    margin: 6,
    height: 7
  });
  t.box(470, 1, 1.1, s, [0, -0.1, 198], [0, 0, 0], 0.35);
}
function Ii(t, e = 7, s = 8, o = 3, n = 0) {
  let i = k("garden-terracotta-v2", "#ae6546", 0.87),
    a = k("garden-pot-rim-v2", "#c3855a", 0.84),
    r = k("garden-soil-v2", "#3d3929", 0.99, 0, "soil"),
    l = k("garden-stem-v2", "#426442", 0.87),
    c = [k("flower-cream-v2", "#e9c581", 0.88), k("flower-peach-v2", "#bd653c", 0.88), k("flower-pink-v2", "#bb647a", 0.9)];
  t.add(oo([[0, 0.4], [e * 0.66, 0.4], [e * 0.72, 1], [e * 0.94, s - 1], [e, s - 0.75], [e, s], [e * 0.9, s], [e * 0.84, s - 1], [e * 0.63, 1.2], [0, 1.2]], 32), i), t.add(Ke(e * 0.945, 0.49, xe, 36), a, [0, s - 0.3, 0], [Math.PI / 2, 0, 0]), t.add(oe(e * 0.84, e * 0.84, 0.18, 28), r, [0, s - 1.3, 0]);
  for (let h = 0; h < o; h++) {
    let d = h * xe / o;
    pr(t, Math.cos(d) * e * 0.32, s + 8.2 + h % 2 * 2, Math.sin(d) * e * 0.32, 1.9, c[(h + n) % 3], l);
  }
}
function vr(t) {
  let e = k("garden-can-v2", "#3d7c75", 0.34, 0.4),
    s = k("garden-brass-v2", "#a7834f", 0.36, 0.6);
  t.add(oo([[0, 0.2], [4.5, 0.2], [5.3, 1], [5.6, 7.8], [5, 9.4], [4, 9.8], [0, 9.8]], 28), e), t.add(Ke(4.9, 0.58, Math.PI * 1.2, 26), e, [0, 8.2, 0], [0, 0, -0.31]), t.add(oe(1.03, 1.9, 13.5, 16), e, [8.3, 6.5, 0], [0, 0, -1]), t.add(oe(2.35, 1.02, 1.1, 20), s, [14.5, 10.45, 0], [0, 0, -1]);
}
function Rr(t) {
  let e = k("garden-hose-v2", "#254f49", 0.63),
    s = k("garden-brass-v2", "#a7834f", 0.36, 0.6);
  for (let o = 0; o < 4; o++) t.add(Ke(5 + o * 0.85, 0.42, xe, 40), e, [0, 0.4 + o * 0.03, 0], [Math.PI / 2, 0, 0]);
  t.add(eo([[6, 0.4, 0], [11, 0.45, -1], [14, 0.4, -5], [17, 0.5, -8]], 0.43, 22), e), t.add(oe(0.65, 0.55, 2.2, 12), s, [17.4, 0.56, -8.6], [Math.PI / 2, 0, -0.65]);
}
function Sr(t, e) {
  let s = e.pond || [103, 92],
    o = k("garden-pond-water", "#2b6d68", 0.14, 0.28, "water"),
    n = k("pond-bank", "#81734e", 0.98),
    i = k("garden-pebble-v2", "#8f957d", 0.96, 0, "pebble"),
    a = k("lotus-leaf", "#46774e", 0.76);
  t.add(Je("pond-disc", () => new $.CircleGeometry(1, 64)), n, [s[0], -0.14, s[1]], [-Math.PI / 2, 0, 0], [49, 26, 1]), t.add(Je("pond-disc", () => new $.CircleGeometry(1, 64)), o, [s[0], -0.075, s[1]], [-Math.PI / 2, 0, 0], [44, 22, 1]);
  let r = Ts(410);
  for (let h = 0; h < 32; h++) {
    let d = h * xe / 32,
      u = s[0] + Math.cos(d) * 47.5,
      f = s[1] + Math.sin(d) * 24.4,
      y = We(e, u, f, null, 0);
    y.distance < e.width / 2 + 2 && y.y < 2.7 || t.ball(i, [u, 0.2, f], [2 + r(), 0.65 + r() * 0.35, 1.3 + r()], [0, r() * xe, 0], !0);
  }
  for (let h = 0; h < 8; h++) {
    let d = s[0] - 25 + r() * 52,
      u = s[1] - 10 + r() * 18;
    t.add(Je("lotus-disc", () => new $.CircleGeometry(1, 14)), a, [d, -0.01, u], [-Math.PI / 2, 0, r() * xe], [1.6, 1.45, 1]);
  }
  let l = k("koi-orange", "#c2793a", 0.74),
    c = k("koi-cream", "#c6c4a0", 0.74);
  for (let h = 0; h < 5; h++) {
    let d = s[0] - 20 + h * 8,
      u = s[1] + (h % 2 ? 4 : -3),
      f = 0.3 + h * 0.48;
    t.ball(h % 2 ? l : c, [d, -0.018, u], [0.95, 0.025, 2.4], [0, f, 0], !0);
  }
  t.landmarks.push({
    name: "KOI POND UNDER RAISED BRIDGE",
    x: s[0],
    z: s[1],
    radius: 49,
    height: 1.2,
    flat: !0
  });
}
function kr(t, e, s) {
  let o = k("greenhouse-trim", "#afc2b0", 0.5, 0.3),
    n = k("greenhouse-glass", "#417a78", 0.16, 0.4, null, {
      emissive: "#254f4c",
      emissiveIntensity: 0.1
    }),
    i = k("greenhouse-base", "#636b51", 0.92);
  t.box(74, 2.5, 42, i, [e, 1, s], [0, 0, 0], 0.5);
  for (let a of [5, 32, 53]) ze(t, 72, 1, 1, o, [e, a, s + 21]);
  for (let a = 0; a < 7; a++) {
    let r = e - 36 + a * 12;
    ze(t, 1.1, 48, 1.1, o, [r, 29, s + 21]), a < 6 && ze(t, 10.8, 46, 0.5, n, [r + 6, 29, s + 20.7]);
  }
  for (let a of [-1, 1]) ze(t, 1, 48, 42, o, [e + a * 36, 29, s]), ze(t, 0.5, 46, 39.8, n, [e + a * 35.7, 29, s]);
  for (let a of [-1, 1]) t.add(Je("greenhouse-roof", () => new $.PlaneGeometry(73, 30)), n, [e, 59, s + a * 10.4], [-Math.PI / 2 + a * 0.65, 0, 0]), ze(t, 75, 1.4, 1.4, o, [e, 69, s]);
}
function Hr(t, e) {
  vs(t, k("garden-grass-v2", "#ffffff", 0.99, 0, "grass"));
  let s = k("garden-fence-v2", "#9f754c", 0.9),
    o = k("garden-fence-rail-v2", "#705737", 0.91),
    n = k("garden-stone-v2", "#888d79", 0.97, 0, "pebble"),
    i = k("garden-leaf", "#365f3c", 0.85, 0, null, {
      side: $.DoubleSide
    }),
    a = e.bounds.minX - 34,
    r = e.bounds.maxX + 34,
    l = e.bounds.minZ - 37,
    c = Je("picket-v2", () => {
      let u = new $.Shape();
      return u.moveTo(-3.1, 0), u.lineTo(3.1, 0), u.lineTo(3.1, 22), u.lineTo(0, 25), u.lineTo(-3.1, 22), u.closePath(), new $.ExtrudeGeometry(u, {
        depth: 1.5,
        bevelEnabled: !0,
        bevelSize: 0.18,
        bevelThickness: 0.18,
        bevelSegments: 1,
        steps: 1
      }).translate(0, 0, -0.75);
    });
  for (let u = 0; u < 50; u++) t.add(c, s, [-220 + u * 9, 0, l]);
  for (let u = 0; u < 34; u++) t.add(c, s, [a, 0, -150 + u * 9], [0, Math.PI / 2, 0]), t.add(c, s, [r, 0, -150 + u * 9], [0, Math.PI / 2, 0]);
  for (let u of [5, 17]) ze(t, 453, 2, 1.6, o, [0, u, l - 1.3]), ze(t, 1.6, 2, 306, o, [a - 1.3, u, 0]), ze(t, 1.6, 2, 306, o, [r + 1.3, u, 0]);
  kr(t, 89, l + 5), Sr(t, e);
  let h = [[-25, -12], [105, -49], [-137, 77], [32, 37], [-54, 114], [171, -114]];
  for (let u = 0; u < h.length; u++) Ee(t, e, `TERRACOTTA BLOOMS ${u + 1}`, h[u], 11, f => Ii(f, u % 2 ? 7 : 8.3, u % 2 ? 8 : 10, 3, u), {
    yaw: u * 0.5,
    height: 24
  });
  Ee(t, e, "GARDENER WATERING CAN", [-76, -61], 18, vr, {
    scale: 1.15,
    yaw: -0.2,
    height: 13
  }), Ee(t, e, "COILED GARDEN HOSE", [93, 27], 20, Rr, {
    yaw: 0.6,
    height: 2
  });
  let d = Ts(771);
  for (let u = 0; u < 24; u++) Ee(t, e, `ROCK GARDEN ${u + 1}`, Gt(e, (u + 0.6) / 24, u % 2 ? -1 : 1, 24), 5.2, f => {
    for (let y = 0; y < 3; y++) f.ball(n, [(y - 1) * 2.6, 1 + (y === 1 ? 0.5 : 0), y % 2 * 1.6], [1.9 + d() * 0.7, 0.9 + d() * 0.65, 1.5 + d() * 0.5], [0, d() * xe, 0], !0);
  }, {
    yaw: d() * xe,
    margin: 6,
    height: 3
  });
  for (let u = 0; u < 130; u++) {
    let f = G(e, e.length * u / 130, (u % 2 ? 1 : -1) * (e.width / 2 + 7 + d() * 5));
    if (!(so(e, f.x, f.z) < e.width / 2 + 4 || t.landmarks.some(y => Math.hypot(y.x - f.x, y.z - f.z) < y.radius + 1))) for (let y = 0; y < 3; y++) t.add(yn(), i, [f.x, 0.02, f.z], [0.2, y * 2 + d(), (d() - 0.5) * 0.22], [0.22, 0.7 + d() * 0.4, 0.22]);
  }
  for (let u = 0; u < 14; u++) {
    let f = a + 16,
      y = -134 + u * 21;
    so(e, f, y) > e.width / 2 + 8 && t.box(10.5, 0.6, 14.5, n, [f, 0.1, y], [0, (u % 3 - 1) * 0.05, 0], 0.3);
  }
}
function Es(t, e, s, o, {
  step: n = 30,
  radius: i = 6,
  margin: a = 8,
  height: r = 12,
  seed: l = 5
} = {}) {
  let c = Ts(l),
    h = e.bounds;
  for (let d = h.minX - 26; d <= h.maxX + 26; d += n) for (let u = h.minZ - 26; u <= h.maxZ + 26; u += n) {
    let f = d + (c() - 0.5) * n * 0.7,
      y = u + (c() - 0.5) * n * 0.7,
      m = Math.floor(c() * o.length),
      p = 0.8 + c() * 0.55;
    Ee(t, e, `${s} ${m}`, [f, y], i * p, o[m], {
      yaw: c() * xe,
      margin: a,
      height: r * p,
      search: !1,
      scale: p
    });
  }
}
var nt = (t, e, s = 0.5) => e.map((o, n) => k(`${t}-${n}`, o, s));
function pn(t, e = 0) {
  let s = nt("toy-ball", ["#c4553f", "#3f7f8c", "#d8a640", "#6f5aa8"], 0.42)[e % 4];
  t.ball(s, [0, 3.2, 0], [3.2, 3.2, 3.2]), t.add(Ke(3.22, 0.38, xe, 36), k("toy-ball-band", "#f1e6cc", 0.5), [0, 3.2, 0], [Math.PI / 2, 0, 0.4]);
}
function wi(t, e = 0) {
  let s = nt("toy-block", ["#c4553f", "#2f6f7a", "#d8a640", "#5b9a56"], 0.6);
  for (let o = 0; o < 3 + e % 3; o++) t.box(5.2 - o * 0.4, 5.2 - o * 0.4, 5.2 - o * 0.4, s[(e + o) % 4], [Math.sin(o * 2.1) * 0.6, 2.6 + o * 5.1 - o * o * 0.2, Math.cos(o * 1.7) * 0.6], [0, o * 0.45 + e, 0], 0.45);
}
function zr(t, e = 0) {
  let s = nt("crayon", ["#c4553f", "#2f6f7a", "#d8a640", "#5b9a56", "#7b58a6"], 0.55),
    o = k("crayon-paper", "#efe5cf", 0.8);
  for (let n = 0; n < 5; n++) {
    let i = n * 0.32 + e,
      a = (n - 2) * 1.4;
    t.add(oe(0.55, 0.55, 8, 12), s[(n + e) % 5], [a, 0.55, 0], [0, i, Math.PI / 2]), t.add(oe(0.58, 0.58, 4.4, 12), o, [a, 0.55, 0], [0, i, Math.PI / 2]);
  }
}
function Ei(t, e = 0) {
  let s = k("kitchen-jar-glass", "#a9cbc4", 0.12, 0.08),
    o = nt("jar-fill", ["#c9883c", "#a7383a", "#d9b25a"], 0.7)[e % 3],
    n = k("kitchen-jar-lid", "#b7473a", 0.4, 0.3);
  t.add(oe(3.6, 3.6, 7, 24), o, [0, 3.6, 0]), t.add(oe(4, 4, 9.6, 28), s, [0, 4.8, 0]), t.add(oe(4.3, 4.3, 1.4, 28), n, [0, 10.2, 0]);
}
function Ir(t, e = 0) {
  let s = k("kitchen-plate", "#eae0c8", 0.28),
    o = k("kitchen-plate-rim", "#2f6f7a", 0.3);
  for (let n = 0; n < 4 + e % 3; n++) t.add(oe(6.2, 5.2, 0.7, 36), s, [Math.sin(n) * 0.3, 0.4 + n * 0.75, Math.cos(n) * 0.3]), t.add(Ke(5.9, 0.12, xe, 36), o, [Math.sin(n) * 0.3, 0.78 + n * 0.75, Math.cos(n) * 0.3], [Math.PI / 2, 0, 0]);
}
function Ar(t, e = 0) {
  let s = k("kitchen-cookie", "#c99052", 0.85),
    o = k("kitchen-choc-chip", "#4a2c1c", 0.7);
  for (let n = 0; n < 3; n++) {
    let i = (n - 1) * 4.6,
      a = 0.6 + (n === 1 ? 1.2 : 0);
    t.add(oe(2.2, 2.2, 1.1, 22), s, [i, a, n % 2 * 1.5], [n === 1 ? 0.2 : 0, 0, 0]);
    for (let r = 0; r < 5; r++) t.ball(o, [i + Math.cos(r * 1.3 + e) * 1.3, a + 0.55, n % 2 * 1.5 + Math.sin(r * 1.3 + e) * 1.3], [0.32, 0.18, 0.32], [0, 0, 0], !0);
  }
}
function Mi(t, e = 0) {
  let s = nt("gnome-coat", ["#2f6f7a", "#5b9a56", "#7b58a6"], 0.6)[e % 3],
    o = k("gnome-hat", "#c4453a", 0.55),
    n = k("gnome-skin", "#e6b48c", 0.6),
    i = k("gnome-beard", "#f1ece0", 0.9),
    a = k("gnome-boot", "#4a3524", 0.7);
  t.add(oe(1.4, 3, 5.6, 18), s, [0, 3.4, 0]);
  for (let r of [-1, 1]) t.ball(a, [r * 1.2, 0.6, 0.6], [1.1, 0.7, 1.5]);
  t.ball(n, [0, 7.4, 0], [1.9, 1.9, 1.9]), t.ball(i, [0, 6.6, 0.9], [1.7, 1.9, 1.2]), t.ball(n, [0, 7.4, 1.8], [0.55, 0.5, 0.5]), t.add(oe(0, 2.1, 5.2, 18), o, [0, 10.6, -0.2], [-0.15, 0, 0]);
}
function Ti(t, e = 0) {
  let s = k("mushroom-stem", "#efe5cf", 0.8),
    o = nt("mushroom-cap", ["#c4453a", "#d08a3c"], 0.55)[e % 2],
    n = k("mushroom-dot", "#f7f1e3", 0.7);
  t.add(oe(1.3, 1.7, 5, 16), s, [0, 2.5, 0]), t.ball(o, [0, 5.4, 0], [4.2, 2.4, 4.2]);
  for (let i = 0; i < 7; i++) {
    let a = i * xe / 7 + e;
    t.ball(n, [Math.cos(a) * 2.7, 6.6, Math.sin(a) * 2.7], [0.55, 0.3, 0.55], [0, 0, 0], !0);
  }
  t.ball(n, [0, 7.8, 0], [0.7, 0.3, 0.7], [0, 0, 0], !0);
}
function vi(t, e = 0) {
  let s = nt("garden-bush", ["#3e6b3f", "#4f7d45", "#365f3c"], 0.9);
  for (let o = 0; o < 5; o++) {
    let n = o * 1.3 + e;
    t.ball(s[(o + e) % 3], [Math.cos(n) * 2.4, 2.6 + o % 2 * 1.6, Math.sin(n) * 2.4], [3 + o % 3 * 0.6, 2.6 + o % 2 * 0.6, 3 + o % 3 * 0.6]);
  }
}
function Ai(t, e = 0) {
  let s = k("duck-yellow", "#f2c53d", 0.35),
    o = k("duck-beak", "#e8772e", 0.4),
    n = k("duck-eye", "#141414", 0.3);
  t.ball(s, [0, 3, 0], [4.2, 3.2, 5]), t.ball(s, [0, 7, 2.2], [2.6, 2.6, 2.6]), t.ball(o, [0, 6.6, 4.8], [1.2, 0.55, 1.4]);
  for (let i of [-1, 1]) t.ball(n, [i * 1.2, 7.7, 4.1], [0.35, 0.4, 0.3], [0, 0, 0], !0);
  t.ball(s, [0, 4.4, -4.6], [1.6, 1.2, 1.4], [-0.6, 0, 0]);
}
function Ri(t, e = 0) {
  let s = nt("soap", ["#f0a4b6", "#9fd6c8", "#f4e7b8"], 0.25);
  for (let o = 0; o < 3; o++) t.box(6, 2.2, 3.6, s[(o + e) % 3], [Math.sin(o) * 1.2, 1.1 + o * 2.2, Math.cos(o) * 0.8], [0, o * 0.5, 0], 1);
}
function Si(t, e = 0) {
  let s = nt("tooth-cup", ["#7fc6d3", "#e9a0ae"], 0.3)[e % 2],
    o = nt("brush", ["#f2f2f2", "#5aa0d6", "#f2c53d"], 0.4);
  t.add(oe(2.6, 2.2, 6, 20), s, [0, 3, 0]);
  for (let n = 0; n < 3; n++) t.add(oe(0.35, 0.35, 10, 8), o[n], [Math.cos(n * 2.1) * 1, 7, Math.sin(n * 2.1) * 1], [Math.cos(n * 2.1) * 0.25, 0, Math.sin(n * 2.1) * 0.25]);
}
function Cr(t) {
  let e = k("bathtub-enamel", "#f3f1ea", 0.18),
    s = k("bath-water", "#7cc7d8", 0.08, 0.1),
    o = k("bath-foam", "#ffffff", 0.9),
    n = k("bath-foot", "#c9a24a", 0.35, 0.6);
  t.box(70, 18, 34, e, [0, 11, 0], [0, 0, 0], 8), t.box(64, 1, 28, s, [0, 18.4, 0], [0, 0, 0], 0.5);
  for (let i = 0; i < 12; i++) t.ball(o, [-26 + i * 4.8, 19.4, Math.sin(i * 1.7) * 9], [3.2, 1.6, 3.2]);
  for (let i of [-30, 30]) for (let a of [-13, 13]) t.ball(n, [i, 1.5, a], [2.2, 2.4, 2.2]);
}
function ki(t, e = 0) {
  let s = k("garage-tire", "#262a2c", 0.85),
    o = k("garage-rim", "#a9b3b6", 0.3, 0.7);
  for (let n = 0; n < 2 + e % 3; n++) t.add(Ke(4, 1.8, xe, 28), s, [Math.sin(n) * 0.4, 1.8 + n * 3.6, 0], [Math.PI / 2, 0, 0]), t.add(oe(2.4, 2.4, 1.2, 18), o, [Math.sin(n) * 0.4, 1.8 + n * 3.6, 0]);
}
function Hi(t, e = 0) {
  let s = nt("toolbox", ["#c4453a", "#2f6f7a"], 0.4)[e % 2],
    o = k("garage-steel", "#a7b3b4", 0.3, 0.7);
  t.box(14, 9, 7, s, [0, 4.5, 0], [0, 0, 0], 0.6);
  for (let n = 0; n < 3; n++) t.box(13.6, 0.3, 0.3, o, [0, 2.2 + n * 2.6, 3.6], [0, 0, 0], 0.1);
  t.box(6, 1, 1, o, [0, 10, 0], [0, 0, 0], 0.3);
}
function Ci(t) {
  let e = k("cone-orange", "#e8772e", 0.5),
    s = k("cone-white", "#f4f1ea", 0.5);
  t.box(6, 0.8, 6, e, [0, 0.4, 0], [0, 0, 0], 0.3), t.add(oe(0.6, 2.4, 9, 20), e, [0, 5, 0]), t.add(oe(1.25, 1.6, 1.4, 20), s, [0, 5.6, 0]);
}
function Pr(t, e = 0) {
  let s = nt("oil-can", ["#2f6f7a", "#c4453a", "#d8a640"], 0.4);
  for (let o = 0; o < 3; o++) t.add(oe(2, 2, 6, 18), s[(o + e) % 3], [(o - 1) * 4.4, 3, Math.sin(o) * 1.2]);
}
function $r(t, e) {
  vs(t, k("bath-tile", "#d7e9ec", 0.3, 0.02, "marble"));
  let s = k("bath-wall-tile", "#9fcfd6", 0.35),
    o = k("bath-grout", "#eef6f6", 0.6),
    n = e.bounds.minZ - 40;
  ze(t, 466, 70, 2, s, [0, 35, n]);
  for (let i = 0; i < 7; i++) ze(t, 464, 0.25, 0.15, o, [0, i * 10 + 4, n + 1.1]);
  Ee(t, e, "CLAWFOOT BATHTUB", [20, 30], 40, Cr, {
    yaw: 0.1,
    height: 22
  });
  for (let i = 0; i < 14; i++) Ee(t, e, `RUBBER DUCK ${i + 1}`, Gt(e, (i + 0.4) / 14, i % 2 ? 1 : -1, 22), 6, a => Ai(a, i), {
    yaw: i * 0.7,
    margin: 6,
    height: 9
  });
}
function Or(t, e) {
  vs(t, k("garage-concrete", "#9aa0a1", 0.85, 0, "marble"));
  let s = k("garage-wall", "#c9c3b5", 0.9),
    o = k("garage-shelf", "#6e5235", 0.7),
    n = e.bounds.minZ - 40,
    i = k("oil-stain", "#3c4245", 0.2);
  ze(t, 466, 70, 2, s, [0, 35, n]);
  for (let a of [16, 32, 48]) ze(t, 300, 1.6, 10, o, [0, a, n + 6]);
  for (let a = 0; a < 8; a++) {
    let r = Gt(e, (a + 0.5) / 8, a % 2 ? 1 : -1, 30);
    t.add(oe(9, 9, 0.05, 28), i, [r[0], -0.12, r[1]]);
  }
  for (let a = 0; a < 14; a++) Ee(t, e, `TRAFFIC CONE ${a + 1}`, Gt(e, (a + 0.4) / 14, a % 2 ? 1 : -1, 20), 4, Ci, {
    margin: 5,
    height: 10
  });
}
function Gr(t, e) {
  for (let s of le(e.id).hazards) {
    if (s.type !== "paw") continue;
    let o = ee(e.base).scale || 1,
      n = G(e, s.s),
      i = Lr / o;
    t.landmarks.push({
      name: "GIANT CAT",
      x: n.x + n.nx * s.side * i,
      z: n.z + n.nz * s.side * i,
      radius: 17 / o,
      height: 40
    });
  }
}
var Lr = 24;
function Pi(t) {
  let e = ee(`${t}~u`),
    s = new to(`environment-${t}`);
  Gr(s, e), t === "kitchen" ? Tr(s, e) : t === "backyard" ? Hr(s, e) : t === "bathroom" ? $r(s, e) : t === "garage" ? Or(s, e) : xr(s, e), t === "kitchen" ? Es(s, e, "KITCHEN CLUTTER", [n => Ei(n, 0), n => Ei(n, 1), n => Ir(n, 1), n => Ar(n, 2), n => Ms(n, 0, 0, "orange", 3), n => Ms(n, 0, 0, "apple", 2.6), n => Qs(n, "#3d6f86")], {
    seed: 41,
    radius: 7,
    height: 11
  }) : t === "backyard" ? Es(s, e, "GARDEN LIFE", [n => Mi(n, 0), n => Mi(n, 1), n => Ti(n, 0), n => Ti(n, 1), n => vi(n, 0), n => vi(n, 1), n => Ii(n, 6, 7, 3, 1)], {
    seed: 63,
    radius: 6,
    height: 12
  }) : t === "bathroom" ? Es(s, e, "BATHROOM BITS", [n => Ai(n, 0), n => Ri(n, 0), n => Ri(n, 1), n => Si(n, 0), n => Si(n, 1), n => pn(n, 1)], {
    seed: 81,
    radius: 6,
    height: 12
  }) : t === "garage" ? Es(s, e, "GARAGE GEAR", [n => ki(n, 0), n => ki(n, 2), n => Hi(n, 0), n => Hi(n, 1), n => Pr(n, 0), n => Ci(n)], {
    seed: 97,
    radius: 7,
    height: 12
  }) : Es(s, e, "BEDROOM TOYS", [n => pn(n, 0), n => pn(n, 1), n => wi(n, 0), n => wi(n, 2), n => zr(n, 0), n => zi(n, 3), n => mn(n, 0, 0)], {
    seed: 27,
    radius: 6.5,
    height: 16
  });
  let o = s.finish();
  return o.userData.mapId = t, o.userData.environmentVersion = 3, o.userData.landmarks = s.landmarks, o.scale.setScalar(ee(t).scale || 1), o;
}
import * as N from "./vendor/001-three-0.185.js";
import * as J from "./vendor/001-three-0.185.js";
var ct = Object.freeze({
  nitro: {
    color: "#14c8f5",
    shape: "bottle",
    path: "M27 5h10v9h-3v5c9 3 12 10 12 21v15H18V40c0-11 3-18 12-21v-5h-3z",
    mark: "M35 24 24 39h8l-3 12 12-17h-8z"
  },
  pulse: {
    color: "#ff672e",
    shape: "beam",
    path: "M10 19 22 32 10 45M26 19l12 13-12 13M42 19l12 13-12 13",
    mark: "M5 11h19M5 53h19"
  },
  tracker: {
    color: "#ff3989",
    shape: "rocket",
    path: "M32 5c-11 9-16 22-14 36l14 8 14-8C48 27 43 14 32 5zM18 30 9 42v12l14-10M46 30l9 12v12-0l-14-10",
    mark: "M32 19a6 6 0 1 0 0 12 6 6 0 0 0 0-12M26 53l6 7 6-7"
  },
  shock: {
    color: "#a366ff",
    shape: "rings",
    path: "M28 21a13 13 0 1 0 0 22M21 13a23 23 0 1 0 0 38M36 21a13 13 0 0 1 0 22M43 13a23 23 0 0 1 0 38",
    mark: "M30 24 25 34h7l-2 7 9-13h-7l3-4z"
  },
  mine: {
    color: "#ffc02d",
    shape: "disc",
    path: "M25 11h14l3 9 9 3 4 12-7 7v12H16V42l-7-7 4-12 9-3z",
    mark: "M32 25a7 7 0 1 0 0 14 7 7 0 0 0 0-14M19 48h26M32 5v7M7 30l8 2M57 30l-8 2"
  },
  shield: {
    color: "#36d8c8",
    shape: "shield",
    path: "M32 5 10 14v18c0 13 22 27 22 27s22-14 22-27V14z",
    mark: "M32 16 19 21v10c0 8 13 17 13 17s13-9 13-17V21zM32 20v24"
  },
  oil: {
    color: "#c08a4a",
    shape: "can",
    path: "M12 30h28v26H12zM16 30v-5h20v5M40 36l13-9 3 4-13 9",
    mark: "M47 6c-4 6-6 9-6 12a6 6 0 0 0 12 0c0-3-2-6-6-12zM12 42h28"
  },
  repair: {
    color: "#81e743",
    shape: "cross",
    path: "M8 18h48v37H8zM23 18V9h18v9",
    mark: "M27 25h10v8h8v10h-8v8H27v-8h-8V33h8z"
  }
});
function Br(t, e = "") {
  let s = ct[t] || ct.nitro,
    o = `pw-${t}`;
  return `<svg class="icon power-icon ${e}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="${o}" cx="34%" cy="26%" r="85%"><stop offset="0" stop-color="${s.color}"/><stop offset=".5" stop-color="${s.color}" stop-opacity=".55"/><stop offset="1" stop-color="#06121a"/></radialGradient></defs><rect x="3" y="3" width="58" height="58" rx="16" fill="url(#${o})" stroke="${s.color}" stroke-width="2.5"/><path d="M12 11c11-5 29-5 40 0" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none" stroke-linecap="round"/><g transform="translate(9.6 10.5) scale(.7)" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${s.path}" stroke="#06121a" stroke-opacity=".6" stroke-width="10"/><path d="${s.path}" stroke="#fffaf0" stroke-width="4.6"/><path d="${s.mark}" stroke="#fff" stroke-width="3.4"/></g></svg>`;
}
function wn(t, e = "") {
  return Br(t, e);
}
var bn = new Map();
function Nr(t) {
  if (bn.has(t)) return bn.get(t);
  if (typeof document > "u") return null;
  let e = ct[t],
    s = document.createElement("canvas");
  s.width = s.height = 256;
  let o = s.getContext("2d");
  o.translate(128, 128), o.save(), o.shadowColor = e.color, o.shadowBlur = 26, o.beginPath(), o.roundRect(-104, -104, 208, 208, 52);
  let n = o.createRadialGradient(-38, -50, 8, 0, 0, 160);
  if (n.addColorStop(0, e.color), n.addColorStop(0.5, e.color + "99"), n.addColorStop(1, "#06121a"), o.fillStyle = n, o.fill(), o.restore(), o.beginPath(), o.roundRect(-104, -104, 208, 208, 52), o.strokeStyle = e.color, o.lineWidth = 8, o.stroke(), o.strokeStyle = "rgba(255,255,255,.85)", o.lineWidth = 3, o.stroke(), o.beginPath(), o.moveTo(-70, -82), o.quadraticCurveTo(0, -104, 70, -82), o.strokeStyle = "rgba(255,255,255,.45)", o.lineWidth = 10, o.lineCap = "round", o.stroke(), typeof Path2D < "u") {
    o.scale(2.45, 2.45), o.translate(-32, -31), o.lineJoin = o.lineCap = "round";
    let a = new Path2D(e.path),
      r = new Path2D(e.mark);
    o.strokeStyle = "rgba(6,18,26,.65)", o.lineWidth = 10, o.stroke(a), o.strokeStyle = "#fffaf0", o.lineWidth = 4.6, o.stroke(a), o.strokeStyle = "#ffffff", o.lineWidth = 3.4, o.stroke(r);
  }
  let i = new J.CanvasTexture(s);
  return i.colorSpace = J.SRGBColorSpace, bn.set(t, i), i;
}
var gn = new Map(),
  xn = new Map();
function $i(t, e = !1) {
  let s = t + (e ? "dark" : "");
  return gn.has(s) || gn.set(s, new J.MeshStandardMaterial({
    color: e ? 1058356 : ct[t].color,
    roughness: e ? 0.32 : 0.23,
    metalness: e ? 0.45 : 0.35,
    emissive: e ? 0 : ct[t].color,
    emissiveIntensity: e ? 0 : 0.24
  })), gn.get(s);
}
function no(t, e = 0.18) {
  let s = new J.Shape();
  return t.forEach(([o, n], i) => i ? s.lineTo(o, n) : s.moveTo(o, n)), s.closePath(), new J.ExtrudeGeometry(s, {
    depth: e,
    bevelEnabled: !0,
    bevelThickness: 0.05,
    bevelSize: 0.045,
    bevelSegments: 2,
    steps: 1
  }).translate(0, 0, -e / 2);
}
function Me(t, e, s, o = 0, n = 0, i = 0, a = null) {
  let r = new J.Mesh(e, s);
  return r.position.set(o, n, i), a && r.rotation.set(...a), t.add(r), r;
}
function io(t) {
  if (!xn.has(t)) {
    let e = new J.Group(),
      s = $i(t),
      o = $i(t, !0),
      n = new J.MeshStandardMaterial({
        color: 16774618,
        metalness: 0.2,
        roughness: 0.35
      });
    if (t === "nitro" && (Me(e, new J.CylinderGeometry(0.33, 0.38, 1.03, 16), s, 0, 0, 0), Me(e, new J.CylinderGeometry(0.18, 0.21, 0.25, 12), o, 0, 0.63), Me(e, new J.TorusGeometry(0.36, 0.055, 4, 16), n, 0, -0.27, 0, [Math.PI / 2, 0, 0])), t === "pulse") {
      Me(e, no([[-0.56, 0.6], [0.45, 0.04], [0.06, 0.04], [0.4, -0.6], [-0.46, -0.05], [-0.08, -0.05]]), s);
      for (let i of [-1, 1]) Me(e, new J.BoxGeometry(0.64, 0.09, 0.11), n, i * 0.21, i * 0.62);
    }
    if (t === "tracker") {
      Me(e, new J.CylinderGeometry(0.23, 0.23, 0.86, 12), n), Me(e, new J.ConeGeometry(0.24, 0.5, 12), s, 0, 0.67);
      let i = no([[0, 0.07], [0.4, -0.36], [0.07, -0.3]], 0.12);
      for (let a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
        let r = Me(e, i, s, 0, -0.34);
        r.rotation.y = a;
      }
      Me(e, new J.CylinderGeometry(0.18, 0.22, 0.2, 12), o, 0, -0.51);
    }
    if (t === "shock") {
      for (let i of [0.32, 0.56, 0.81]) Me(e, new J.TorusGeometry(i, 0.075, 5, 28), s);
      Me(e, new J.IcosahedronGeometry(0.2, 1), n);
    }
    if (t === "mine") {
      Me(e, new J.CylinderGeometry(0.63, 0.75, 0.29, 8), o, 0, -0.24), Me(e, new J.CylinderGeometry(0.5, 0.55, 0.2, 8), s, 0, -0.01);
      for (let i = 0; i < 6; i++) {
        let a = i * Math.PI / 3;
        Me(e, new J.ConeGeometry(0.12, 0.38, 6), s, Math.sin(a) * 0.48, 0.24, Math.cos(a) * 0.48);
      }
      Me(e, new J.SphereGeometry(0.16, 8, 6), n, 0, 0.2);
    }
    t === "shield" && (Me(e, no([[0, 0.73], [-0.57, 0.45], [-0.49, -0.2], [0, -0.75], [0.49, -0.2], [0.57, 0.45]], 0.18), s), Me(e, new J.BoxGeometry(0.09, 0.71, 0.14), n, 0, 0.05, 0.2)), t === "repair" && (Me(e, new J.BoxGeometry(1.15, 0.79, 0.35), o), Me(e, no([[-0.13, 0.39], [0.13, 0.39], [0.13, 0.14], [0.38, 0.14], [0.38, -0.12], [0.13, -0.12], [0.13, -0.37], [-0.13, -0.37], [-0.13, -0.12], [-0.38, -0.12], [-0.38, 0.14], [-0.13, 0.14]], 0.11), s, 0, 0, 0.24), Me(e, new J.TorusGeometry(0.2, 0.052, 4, 12, Math.PI), n, 0, 0.49)), t === "oil" && (Me(e, new J.CylinderGeometry(0.42, 0.42, 0.82, 18), o, 0, -0.05), Me(e, new J.CylinderGeometry(0.435, 0.435, 0.2, 18), s, 0, 0.05), Me(e, new J.CylinderGeometry(0.06, 0.13, 0.6, 8), n, 0.34, 0.42, 0, [0, 0, -0.9]), Me(e, new J.SphereGeometry(0.16, 12, 10), s, 0.7, 0.62).scale.set(1, 1.3, 1), Me(e, new J.ConeGeometry(0.115, 0.22, 10), s, 0.7, 0.82)), e.name = "power-" + t, xn.set(t, e);
  }
  return xn.get(t).clone();
}
function Oi(t) {
  let e = new J.Group(),
    s = io(t);
  s.position.y = 1.65, s.scale.setScalar(0.92), e.add(s);
  let o = Nr(t),
    n = null;
  return o && (n = new J.Sprite(new J.SpriteMaterial({
    map: o,
    transparent: !0,
    depthWrite: !1
  })), n.position.y = 3.2, n.scale.set(1.75, 1.75, 1), e.add(n)), {
    group: e,
    model: s,
    billboard: n,
    type: t
  };
}
var _t = [4184319, 16734791];
function Gi(t) {
  _t[0] = t ? 3902719 : 4184319, _t[1] = t ? 16756736 : 16734791;
}
var xt = new N.Object3D(),
  J0 = new N.Color(16775133),
  Q0 = new N.Vector3(0, 1, 0),
  ec = Object.freeze({
    nitro: "twin-exhaust-and-blue-streaks",
    pulse: "triple-orange-beam-and-star-impact",
    tracker: "guided-rocket-and-smoke-trail",
    shock: "expanding-violet-rings",
    mine: "armed-spiked-disc-and-amber-blast",
    shield: "fresnel-hexagonal-dome",
    repair: "floating-green-crosses-and-orbit"
  }),
  Dr = "attribute float glowAlpha;attribute vec3 glowColor;varying vec2 vu;varying float fade;varying vec3 tint;void main(){vu=uv;fade=glowAlpha;tint=glowColor;vec4 center=modelViewMatrix*instanceMatrix*vec4(0.0,0.0,0.0,1.0);center.xy+=position.xy*length(instanceMatrix[0].xyz);gl_Position=projectionMatrix*center;}",
  Fr = `varying vec2 vu;varying float fade;varying vec3 tint;void main(){float r=length(vu-.5)*2.0;float halo=exp(-r*r*3.6)*(1.0-smoothstep(.75,1.0,r));float core=exp(-r*r*28.0);gl_FragColor=vec4(tint*(.75+core*1.4)+vec3(core*.55),(halo*.85+core)*fade);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
  En = class {
    constructor(e, s) {
      let o = new N.PlaneGeometry(1, 1);
      this.alpha = new Float32Array(s), this.colors = new Float32Array(s * 3), o.setAttribute("glowAlpha", new N.InstancedBufferAttribute(this.alpha, 1).setUsage(N.DynamicDrawUsage)), o.setAttribute("glowColor", new N.InstancedBufferAttribute(this.colors, 3).setUsage(N.DynamicDrawUsage)), this.mesh = new N.InstancedMesh(o, new N.ShaderMaterial({
        vertexShader: Dr,
        fragmentShader: Fr,
        transparent: !0,
        depthWrite: !1,
        blending: N.AdditiveBlending
      }), s), this.mesh.instanceMatrix.setUsage(N.DynamicDrawUsage), this.mesh.frustumCulled = !1, this.mesh.renderOrder = 4, this.mesh.count = 0, e.add(this.mesh), this.capacity = s, this.n = 0, this.c = new N.Color();
    }
    begin() {
      this.n = 0;
    }
    add(e, s, o, n = 1) {
      this.n >= this.capacity || n <= 0.01 || (xt.position.set(e.x, e.y, e.z), xt.rotation.set(0, 0, 0), xt.scale.setScalar(s), xt.updateMatrix(), this.mesh.setMatrixAt(this.n, xt.matrix), this.c.set(o), this.colors[this.n * 3] = this.c.r, this.colors[this.n * 3 + 1] = this.c.g, this.colors[this.n * 3 + 2] = this.c.b, this.alpha[this.n] = Math.min(1, n), this.n++);
    }
    end(e = !0) {
      this.mesh.count = e ? this.n : 0, this.mesh.instanceMatrix.needsUpdate = !0, this.mesh.geometry.attributes.glowAlpha.needsUpdate = !0, this.mesh.geometry.attributes.glowColor.needsUpdate = !0;
    }
  };
function Lt(t, e, s, o) {
  let n = new N.InstancedMesh(e, s, o);
  return n.instanceMatrix.setUsage(N.DynamicDrawUsage), n.frustumCulled = !1, n.count = 0, t.add(n), n;
}
function De(t, e, s, o, n = [0, 0, 0], i = null) {
  e >= t.instanceMatrix.count || (xt.position.set(s.x, s.y, s.z), xt.rotation.set(n[0], n[1], n[2], "YXZ"), xt.scale.set(...(Array.isArray(o) ? o : [o, o, o])), xt.updateMatrix(), t.setMatrixAt(e, xt.matrix), i && t.setColorAt(e, new N.Color(i)));
}
function ao(t, e) {
  t.count = Math.min(e, t.instanceMatrix.count), t.instanceMatrix.needsUpdate = !0, t.instanceColor && (t.instanceColor.needsUpdate = !0);
}
function jr() {
  let t = new N.Shape();
  return [[-0.15, 0.45], [0.15, 0.45], [0.15, 0.15], [0.45, 0.15], [0.45, -0.15], [0.15, -0.15], [0.15, -0.45], [-0.15, -0.45], [-0.15, -0.15], [-0.45, -0.15], [-0.45, 0.15], [-0.15, 0.15]].forEach(([e, s], o) => o ? t.lineTo(e, s) : t.moveTo(e, s)), t.closePath(), new N.ExtrudeGeometry(t, {
    depth: 0.07,
    bevelEnabled: !1
  }).translate(0, 0, -0.035);
}
function Ur() {
  return new N.ShaderMaterial({
    transparent: !0,
    depthWrite: !1,
    side: N.DoubleSide,
    blending: N.AdditiveBlending,
    uniforms: {
      t: {
        value: 0
      },
      strength: {
        value: 1
      },
      tint: {
        value: new N.Color(ct.shield.color)
      }
    },
    vertexShader: "varying vec3 wp; varying vec3 wn; varying vec2 vu; void main(){vu=uv;vec4 p=modelMatrix*vec4(position,1.0);wp=p.xyz;wn=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*p;}",
    fragmentShader: "uniform float t;uniform float strength;uniform vec3 tint;varying vec3 wp;varying vec3 wn;varying vec2 vu;void main(){float rim=pow(1.0-abs(dot(normalize(cameraPosition-wp),normalize(wn))),2.5);vec2 cell=vu*vec2(28.0,15.0);cell.x+=mod(floor(cell.y),2.0)*.5;vec2 h=abs(fract(cell)-.5);float grid=smoothstep(.43,.49,max(h.x,h.y));float sweep=pow(max(0.0,sin(vu.y*15.0-t*2.8)),12.0);float a=(rim*.55+grid*.045+sweep*.06)*strength;gl_FragColor=vec4(tint*(1.0+rim),a);}"
  });
}
var ro = class {
  constructor(e) {
    this.scene = e, this.pickups = new Map(), this.rockets = [], this.mineModels = [], this.particles = [], this.seen = new Set(), this.lastProjectile = new Map(), this.time = 0;
    let s = new N.MeshBasicMaterial({
      color: 16777215,
      transparent: !0,
      opacity: 0.85,
      depthWrite: !1,
      blending: N.AdditiveBlending
    });
    this.rings = Lt(e, new N.TorusGeometry(1, 0.038, 4, 48), s, 100), this.bases = Lt(e, new N.TorusGeometry(0.83, 0.07, 5, 24), new N.MeshStandardMaterial({
      color: 16777215,
      roughness: 0.3,
      metalness: 0.4
    }), 40), this.beams = Lt(e, new N.BoxGeometry(0.12, 0.12, 2.4), s, 160), this.jets = Lt(e, new N.ConeGeometry(0.24, 1.7, 8), s, 16), this.glows = new En(e, 640), this.smoke = Lt(e, new N.SphereGeometry(0.19, 8, 6), new N.MeshBasicMaterial({
      color: 8225936,
      transparent: !0,
      opacity: 0.21,
      depthWrite: !1
    }), 160), this.repairCrosses = Lt(e, jr(), new N.MeshBasicMaterial({
      color: 8513347,
      transparent: !0,
      opacity: 0.9,
      depthWrite: !1,
      side: N.DoubleSide
    }), 48), this.shields = Array.from({
      length: 8
    }, () => {
      let n = new N.Mesh(new N.SphereGeometry(1, 24, 16), Ur());
      return n.scale.set(1.75, 1.17, 2.05), n.visible = !1, e.add(n), n;
    });
    for (let n = 0; n < 16; n++) {
      let i = new N.Group(),
        a = io("tracker");
      a.rotation.x = Math.PI / 2, a.scale.setScalar(0.55), i.add(a), i.visible = !1, e.add(i), this.rockets.push(i);
    }
    this.confetti = Lt(e, new N.PlaneGeometry(0.3, 0.16), new N.MeshBasicMaterial({
      color: 16777215,
      side: N.DoubleSide
    }), 420), this.confettiBits = [];
    let o = new N.CircleGeometry(1, 40);
    {
      let n = o.attributes.position;
      for (let i = 1; i < n.count; i++) {
        let a = n.getX(i),
          r = n.getY(i),
          l = Math.atan2(r, a),
          c = 1 + 0.16 * Math.sin(l * 3 + 1) + 0.1 * Math.sin(l * 5 + 2) + 0.06 * Math.sin(l * 9);
        n.setXY(i, a * c, r * c);
      }
      o.rotateX(-Math.PI / 2);
    }
    this.oilPool = Lt(e, o, new N.MeshPhysicalMaterial({
      color: 1314828,
      roughness: 0.08,
      metalness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      iridescence: 1,
      iridescenceIOR: 1.6,
      iridescenceThicknessRange: [200, 700],
      polygonOffset: !0,
      polygonOffsetFactor: -2
    }), 24);
    for (let n = 0; n < 24; n++) {
      let i = io("mine");
      i.scale.setScalar(0.85), i.visible = !1, e.add(i), this.mineModels.push(i);
    }
  }
  spawn(e) {
    if (this.seen.has(e.id)) return;
    this.seen.add(e.id), this.seen.size > 500 && this.seen.delete(this.seen.values().next().value);
    let s = e.kind || e.type,
      o = {
        pulse: 16742701,
        tracker: 16726409,
        mine: 16761134,
        shock: 10643199,
        shield: 3528904,
        drift: 2283263,
        repair: 8646724
      },
      n = (a, {
        speed: r = 4,
        up: l = 2,
        life: c = 0.6,
        color: h,
        fire: d = !1,
        y: u = 0,
        flat: f = !1
      }) => {
        for (let y = 0; y < a; y++) {
          let m = y * 2.39996 + e.id,
            p = r * (0.55 + y * 37 % 10 / 20);
          this.particles.push({
            x: e.x,
            y: e.y + u,
            z: e.z,
            vx: Math.cos(m) * p,
            vy: f ? 0.3 : l * (0.4 + y * 53 % 10 / 12),
            vz: Math.sin(m) * p,
            life: c * (0.7 + y % 4 * 0.12),
            max: c,
            color: typeof h == "function" ? h(y) : h,
            fire: d
          });
        }
      };
    if (e.type === "explosion") {
      n(30, {
        speed: 6,
        up: 6,
        life: 1,
        color: a => a % 3 ? 16747050 : 16765802,
        fire: !0
      }), n(18, {
        speed: 9,
        up: 7,
        life: 0.8,
        color: 16770992
      });
      for (let a = 0; a < 12; a++) this.particles.push({
        x: e.x + Math.sin(a) * 0.8,
        y: e.y,
        z: e.z + Math.cos(a) * 0.8,
        vx: Math.sin(a * 2.1) * 1.2,
        vy: 1.6 + a * 0.18,
        vz: Math.cos(a * 2.1) * 1.2,
        life: 1.8,
        max: 1.8,
        smoke: !0,
        big: !0
      });
      this.particles.push({
        x: e.x,
        y: e.y + 0.4,
        z: e.z,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0.4,
        max: 0.4,
        flash: 9,
        color: 16761178
      });
      return;
    }
    if (e.type === "finish") {
      let a = [16765514, 16734830, 4184319, 8382554, 11893759, 16777215, 16751162],
        r = (e.width || 11) / 2 + 0.9,
        l = Math.cos(e.yaw || 0),
        c = -Math.sin(e.yaw || 0),
        h = Math.sin(e.yaw || 0),
        d = Math.cos(e.yaw || 0),
        u = e.place === 1 ? 110 : 55;
      for (let f of [-1, 1]) for (let y = 0; y < u; y++) {
        let m = y * 7.31 + e.id,
          p = 10 + m * 13 % 5,
          b = 2 + m * 3 % 4,
          w = (m * 17 % 7 - 3) * 0.9;
        this.confettiBits.push({
          x: e.x + l * f * r,
          y: e.y + 6.4,
          z: e.z + c * f * r,
          vx: -l * f * b + h * w,
          vy: p * (0.55 + y % 5 * 0.12),
          vz: -c * f * b + d * w,
          rx: m,
          ry: m * 0.7,
          sx: 4 + m % 6,
          sy: 3 + m % 5,
          ph: m,
          life: 3.2 + y % 7 * 0.25,
          color: e.place === 1 && y % 3 === 0 ? 16765514 : a[y % a.length]
        });
      }
      for (let f of [-1, 1]) this.particles.push({
        x: e.x + l * f * r,
        y: e.y + 6.4,
        z: e.z + c * f * r,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0.45,
        max: 0.45,
        flash: 5,
        color: 16769162
      });
      this.confettiBits.length > 420 && this.confettiBits.splice(0, this.confettiBits.length - 420);
      return;
    }
    if (e.type === "splash") {
      if (e.kind === "milk") {
        n(16, {
          speed: 2.8,
          up: 2.4,
          life: 0.6,
          color: a => a % 2 ? 16777215 : 16052194
        });
        return;
      }
      if (e.kind === "jam") {
        n(14, {
          speed: 2.6,
          up: 2.2,
          life: 0.6,
          color: a => a % 2 ? 11735599 : 14696538
        });
        return;
      }
      e.kind === "soap" ? (n(14, {
        speed: 2.2,
        up: 2.6,
        life: 1.1,
        color: a => a % 2 ? 16777215 : 12578815
      }), this.particles.push({
        x: e.x,
        y: e.y,
        z: e.z,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0.25,
        max: 0.25,
        flash: 2.2,
        color: 15268863
      })) : e.kind === "oil" ? n(12, {
        speed: 3,
        up: 1.6,
        life: 0.5,
        color: a => a % 3 ? 2762274 : 6969914
      }) : n(18, {
        speed: 3.6,
        up: 3.2,
        life: 0.7,
        color: a => a % 2 ? 7031338 : 9398848
      });
      return;
    }
    if (e.type === "oil") {
      n(e.impact ? 18 : 12, {
        speed: e.impact ? 4 : 2.5,
        up: e.impact ? 2.5 : 1.6,
        life: 0.6,
        color: a => a % 3 ? 3811864 : 12618314
      }), e.impact && this.particles.push({
        x: e.x,
        y: e.y,
        z: e.z,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0.3,
        max: 0.3,
        flash: 3,
        color: 16760944
      });
      return;
    }
    if (e.type === "respawn") {
      n(18, {
        speed: 2.2,
        up: 3.2,
        life: 0.9,
        color: 9431295
      }), this.particles.push({
        x: e.x,
        y: e.y,
        z: e.z,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0.4,
        max: 0.4,
        flash: 4,
        color: 10481407
      });
      return;
    }
    if (e.type === "pickup") {
      let a = ct[e.kind]?.color || "#ffffff";
      n(16, {
        speed: 4.5,
        up: 2.5,
        life: 0.55,
        color: a
      }), this.particles.push({
        x: e.x,
        y: e.y,
        z: e.z,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0.3,
        max: 0.3,
        flash: 3.2,
        color: a
      });
      return;
    }
    if (e.type === "nitro") {
      n(16, {
        speed: 6,
        flat: !0,
        life: 0.45,
        color: 6281471
      }), this.particles.push({
        x: e.x,
        y: e.y,
        z: e.z,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0.3,
        max: 0.3,
        flash: 3.4,
        color: 8381695
      });
      return;
    }
    if (e.type === "repair") {
      n(14, {
        speed: 1.4,
        up: 3,
        life: 1.1,
        color: 10289002
      });
      return;
    }
    if (e.type === "mine" && e.impact && n(22, {
      speed: 5,
      up: 5,
      life: 0.8,
      color: a => a % 2 ? 16761134 : 16747050,
      fire: !0
    }), e.type === "shield" && !e.impact && n(14, {
      speed: 2.6,
      up: 1.5,
      life: 0.7,
      color: 8385507
    }), !["hit", "pulse", "tracker", "mine", "shock", "shield", "drift", "hazard", "landing"].includes(e.type)) return;
    let i = e.type === "hit" || e.impact ? 14 : e.type === "shock" ? 18 : 6;
    for (let a = 0; a < i; a++) {
      let r = a / i * Math.PI * 2 + e.id * 0.7,
        l = e.impact ? 4.5 + a % 3 : 2.3;
      this.particles.push({
        x: e.x,
        y: e.y,
        z: e.z,
        vx: Math.sin(r) * l,
        vy: 0.7 + a % 5 * 0.65,
        vz: Math.cos(r) * l,
        life: 0.45 + a % 4 * 0.15,
        max: 0.9,
        color: o[s] || e.color
      });
    }
    if ((e.type === "hit" || e.impact || e.type === "shield" || e.type === "landing" || e.type === "hazard") && this.particles.push({
      x: e.x,
      y: e.y + 0.2,
      z: e.z,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0.28,
      max: 0.28,
      flash: e.type === "landing" ? 2.2 : e.type === "shield" ? 3.2 : 4.2,
      color: o[s] || e.color || 16765066
    }), e.impact && ["tracker", "mine"].includes(s) || e.type === "landing") for (let a = 0; a < 7; a++) this.particles.push({
      x: e.x,
      y: e.y,
      z: e.z,
      vx: Math.sin(a) * 1.3,
      vy: 1 + a * 0.12,
      vz: Math.cos(a) * 1.3,
      life: 1,
      max: 1,
      smoke: !0
    });
  }
  reset() {
    this.seen.clear(), this.particles = [], this.confettiBits = [], ao(this.oilPool, 0), this.lastProjectile.clear();
  }
  sync(e, s, o, {
    menu: n = !1
  } = {}) {
    this.time += o;
    let i = this.time;
    n && ao(this.oilPool, 0);
    let a = 0,
      r = 0,
      l = 0,
      c = 0,
      h = 0,
      d = 0,
      u = 0;
    this.glows.begin();
    for (let m of e.pickups) {
      let p = this.pickups.get(m.id);
      if ((!p || p.type !== m.type) && (p && (this.scene.remove(p.group), p.billboard?.material.dispose()), p = Oi(m.type), this.pickups.set(m.id, p), this.scene.add(p.group)), p.group.position.set(m.x, m.y, m.z), p.group.visible = !n && m.timer <= 0, p.model.position.y = 1.65 + Math.sin(i * 2.5 + m.id) * 0.15, p.model.rotation.y = i * 0.65 + m.id, p.billboard && (p.billboard.position.y = 3.25 + Math.sin(i * 2.5 + m.id) * 0.12), !n && m.timer <= 0) {
        De(this.bases, r++, {
          x: m.x,
          y: m.y + 0.13,
          z: m.z
        }, 1, [Math.PI / 2, 0, 0], ct[m.type].color);
        let b = 0.5 + 0.5 * Math.sin(i * 3 + m.id);
        this.glows.add({
          x: m.x,
          y: m.y + 1.65,
          z: m.z
        }, 2.6 + b * 0.6, ct[m.type].color, 0.28 + b * 0.14), this.glows.add({
          x: m.x,
          y: m.y + 0.25,
          z: m.z
        }, 2.2, ct[m.type].color, 0.22);
      }
    }
    for (let m of e.cars) {
      let p = s[m.id],
        b = this.shields[m.id],
        w = p?.group?.position;
      if (b) {
        if (b.visible = !n && m.shield > 0, b.position.set(w?.x ?? m.x, (w?.y ?? m.y) + 0.71, w?.z ?? m.z), b.rotation.y = p?.group?.rotation.y ?? m.yaw, b.material.uniforms.t.value = i, b.material.uniforms.strength.value = m.shieldHits === 1 ? 0.7 : 1, !n && m.boost > 0 && !m.finished && p?.group) {
          for (let M of p.boostAnchors) {
            let x = M.clone();
            p.group.localToWorld(x), x.x -= Math.sin(m.yaw) * 0.75, x.z -= Math.cos(m.yaw) * 0.75, De(this.jets, c++, x, [0.75 + Math.sin(i * 55 + m.id) * 0.1, 1.2, 0.8], [-Math.PI / 2, m.yaw, 0], 2738938);
            let T = {
              x: x.x - Math.sin(m.yaw) * 0.6,
              y: x.y,
              z: x.z - Math.cos(m.yaw) * 0.6
            };
            this.glows.add(T, 1.05 + Math.sin(i * 60 + m.id * 3) * 0.2, 4180223, 0.55), this.glows.add(T, 0.38, 13629183, 0.5);
          }
          for (let M = 0; M < 2; M++) {
            let x = (M ? 1 : -1) * 0.85;
            this.particles.push({
              x: m.x + Math.cos(m.yaw) * x - Math.sin(m.yaw) * 1.8,
              y: m.y + 0.18,
              z: m.z - Math.sin(m.yaw) * x - Math.cos(m.yaw) * 1.8,
              vx: -Math.sin(m.yaw) * 3,
              vy: 0.08,
              vz: -Math.cos(m.yaw) * 3,
              life: 0.2,
              max: 0.2,
              color: 3790079
            });
          }
        }
        !n && m.wasDrifting && m.speed > 10 && Math.floor(i * 45) % 2 === 0 && this.particles.push({
          x: m.x,
          y: m.y + 0.12,
          z: m.z,
          vx: -Math.sin(m.yaw) * 2,
          vy: 0.6,
          vz: -Math.cos(m.yaw) * 2,
          life: 0.35,
          max: 0.35,
          color: 16759363
        });
      }
    }
    if (!n) {
      for (let p of e.projectiles) {
        let b = e.ffa ? 16747069 : (e.ffa ? [] : _t)[p.team] ?? 16747069;
        if (this.glows.add(p, p.type === "pulse" ? 1.7 : 1.2, b, 0.85), p.type === "tracker") {
          let w = p.x - Math.sin(p.yaw) * 0.8,
            M = p.z - Math.cos(p.yaw) * 0.8;
          this.glows.add({
            x: w,
            y: p.y,
            z: M
          }, 0.9 + Math.sin(i * 70) * 0.2, 16765562, 1), this.glows.add({
            x: w - Math.sin(p.yaw) * 0.6,
            y: p.y,
            z: M - Math.cos(p.yaw) * 0.6
          }, 1.4, 16738858, 0.6);
        }
        if (p.type === "pulse") for (let w of [-1, 0, 1]) {
          let M = p.x + Math.cos(p.yaw) * w * 0.19,
            x = p.z - Math.sin(p.yaw) * w * 0.19;
          De(this.beams, l++, {
            x: M,
            y: p.y,
            z: x
          }, [1, 1, 1.15], [0, p.yaw, 0], w === 0 ? 16770744 : (e.ffa ? [] : _t)[p.team] ?? 16738094);
        } else if (d < this.rockets.length) {
          let w = this.rockets[d++];
          w.visible = !0, w.position.set(p.x, p.y, p.z), w.rotation.y = p.yaw;
          let M = this.lastProjectile.get(p.id);
          (!M || Math.hypot(M.x - p.x, M.z - p.z) > 0.45) && (this.particles.push({
            x: p.x - Math.sin(p.yaw) * 0.7,
            y: p.y,
            z: p.z - Math.cos(p.yaw) * 0.7,
            vx: 0,
            vy: 0.3,
            vz: 0,
            life: 0.55,
            max: 0.55,
            smoke: !0
          }), this.particles.push({
            x: p.x - Math.sin(p.yaw) * 0.45,
            y: p.y,
            z: p.z - Math.cos(p.yaw) * 0.45,
            vx: 0,
            vy: 0,
            vz: 0,
            life: 0.16,
            max: 0.16,
            color: (e.ffa ? [] : _t)[p.team] ?? 16735117
          }), this.lastProjectile.set(p.id, {
            x: p.x,
            z: p.z
          }));
        }
      }
      let m = 0;
      for (let p of e.oils || []) {
        let b = Math.min(1, (0.35 - p.armed) / 0.35 + 0.25),
          w = Math.min(1, p.life / 1.2),
          M = 1 + Math.sin(i * 2 + p.id) * 0.025;
        De(this.oilPool, m++, {
          x: p.x,
          y: p.y + 0.07,
          z: p.z
        }, [2.4 * b * w * M, 1, 1.9 * b * w / M], [0, p.yaw || 0, 0]);
      }
      ao(this.oilPool, m);
      for (let p of e.mines) {
        if (p.armed <= 0 && this.glows.add({
          x: p.x,
          y: p.y + 0.75,
          z: p.z
        }, Math.floor(i * 4 + p.id) % 2 ? 1.1 : 0.6, (e.ffa ? [] : _t)[p.team] ?? 16761134, 0.9), u >= this.mineModels.length) break;
        let b = this.mineModels[u++];
        b.visible = !0, b.position.set(p.x, p.y + 0.4, p.z), De(this.rings, a++, {
          x: p.x,
          y: p.y + 0.08,
          z: p.z
        }, p.armed > 0 ? 0.7 : 0.95 + Math.sin(i * 6) * 0.15, [Math.PI / 2, 0, 0], (e.ffa ? [] : _t)[p.team] ?? 16756773);
      }
      for (let p of e.effects) {
        this.spawn(p);
        let b = 1 - p.life / p.maxLife,
          w = p.car !== void 0 ? e.cars[p.car] : null,
          M = {
            x: w && ["shield", "repair", "nitro"].includes(p.type) ? w.x : p.x,
            y: p.y,
            z: w && ["shield", "repair", "nitro"].includes(p.type) ? w.z : p.z
          };
        if (p.type === "shock") {
          for (let x = 0; x < 2; x++) De(this.rings, a++, {
            ...M,
            y: p.y + 0.08 + x * 0.28
          }, Math.max(0.03, b * 11 - x * 0.65), [Math.PI / 2, 0, 0], x ? 14659839 : 10643199);
          for (let x = 0; x < 20; x++) {
            let T = x / 20 * Math.PI * 2 + b * 2,
              g = b * 11;
            this.glows.add({
              x: M.x + Math.cos(T) * g,
              y: p.y + 0.3 + Math.sin(x * 7 + i * 30) * 0.25,
              z: M.z + Math.sin(T) * g
            }, 0.9, x % 2 ? 13214463 : 9395455, (1 - b) * 0.9);
          }
        } else if (p.type === "explosion") De(this.rings, a++, {
          ...M,
          y: p.y - 0.5
        }, 0.4 + b * 9, [Math.PI / 2, 0, 0], 16752714), this.glows.add({
          x: M.x,
          y: p.y + b * 2,
          z: M.z
        }, 7 * (1 - b) + 1, 16751162, (1 - b) * 0.8);else if (p.type === "respawn") De(this.rings, a++, {
          ...M,
          y: p.y - 0.3
        }, 0.5 + b * 3.2, [Math.PI / 2, 0, 0], 9431295);else if (p.type === "repair") {
          for (let x = 0; x < 4; x++) {
            let T = (b * 1.6 + x / 4) % 1;
            this.glows.add({
              x: M.x + Math.sin(x * 1.7 + i) * 1.2,
              y: (w?.y ?? p.y) + 0.4 + T * 2.6,
              z: M.z + Math.cos(x * 1.7 + i) * 1.2
            }, 0.7, 10289002, (1 - T) * 0.8);
          }
          for (let x = 0; x < 6; x++) {
            let T = (b + x / 6) % 1,
              g = x * Math.PI / 3 + i * 1.5;
            De(this.repairCrosses, h++, {
              x: M.x + Math.sin(g) * 1.4,
              y: (w?.y ?? p.y) + 0.6 + T * 2.2,
              z: M.z + Math.cos(g) * 1.4
            }, 0.2 + Math.sin(T * Math.PI) * 0.45, [0, w?.yaw || 0, 0]);
          }
          De(this.rings, a++, {
            x: M.x,
            y: (w?.y ?? p.y) + 0.1,
            z: M.z
          }, 1.3 + b * 0.6, [Math.PI / 2, 0, 0], 8645702);
        } else if (p.type === "shield") {
          De(this.rings, a++, {
            ...M,
            y: (w?.y ?? p.y) + 0.14
          }, 1 + b * 2, [Math.PI / 2, 0, 0], 3594440);
          for (let x = 0; x < 6; x++) {
            let T = x / 6 * Math.PI * 2 + i * 3;
            this.glows.add({
              x: M.x + Math.cos(T) * 1.9,
              y: (w?.y ?? p.y) + 0.9 + Math.sin(i * 5 + x) * 0.4,
              z: M.z + Math.sin(T) * 1.9
            }, 0.5, 10483690, (1 - b) * 0.9);
          }
        } else if (p.type === "nitro" && w) for (let x = 0; x < 3; x++) {
          let T = 1.8 + x * 1.1;
          this.glows.add({
            x: w.x - Math.sin(w.yaw) * T,
            y: w.y + 0.4,
            z: w.z - Math.cos(w.yaw) * T
          }, 1.4 - x * 0.3, 5230591, (1 - b) * 0.5);
        } else if (p.type === "mine" && p.impact) De(this.rings, a++, {
          ...M,
          y: p.y - 0.45
        }, 0.2 + b * 4, [Math.PI / 2, 0, 0], 16757803);else if (p.type === "tracker" && p.impact) De(this.rings, a++, M, 0.3 + b * 3.8, [0, i, 0], 16729231), De(this.rings, a++, M, 0.3 + b * 2.5, [Math.PI / 2, 0, 0], 16761212);else if (p.type === "pulse") for (let x = 0; x < 3; x++) De(this.beams, l++, {
          x: M.x,
          y: M.y,
          z: M.z
        }, [1 - b, 1 - b, 0.4 + b * 0.8], [0, (p.yaw || 0) + x * 2.09, 0], 16745787);else p.type === "share" && De(this.rings, a++, {
          ...M,
          y: p.y + 0.3
        }, 0.5 + b * 1.6, [0, i, 0], 4973774);
      }
    }
    for (let m = d; m < this.rockets.length; m++) this.rockets[m].visible = !1;
    for (let m = u; m < this.mineModels.length; m++) this.mineModels[m].visible = !1;
    this.particles = this.particles.filter(m => m.life > 0).slice(-420);
    let f = 0;
    for (let m of this.particles) {
      m.life -= o, m.x += m.vx * o, m.y += m.vy * o, m.z += m.vz * o, !m.smoke && !m.flash && (m.vy -= o * 4);
      let p = Math.max(0, m.life / m.max);
      n || (m.smoke && f < 160 ? De(this.smoke, f++, m, (m.big ? 1.2 + (1 - p) * 5 : 0.5 + (1 - p) * 3.2) * Math.min(1, p * 4)) : m.fire ? (m.vx *= 0.95, m.vz *= 0.95, m.vy += o * 2.5, this.glows.add(m, 0.7 + (1 - p) * 2.6, m.color, Math.min(1, p * 1.4))) : m.flash ? this.glows.add(m, m.flash * (1.25 - p * 0.5), m.color || 16765066, p * 1.1) : this.glows.add(m, 0.22 + p * 0.42, m.color || 16756799, 0.35 + p * 0.75));
    }
    this.glows.end();
    let y = 0;
    this.confettiBits = this.confettiBits.filter(m => m.life > 0);
    for (let m of this.confettiBits) {
      m.life -= o;
      let p = Math.exp(-1.7 * o);
      m.vx *= p, m.vz *= p, m.vy = m.vy * p - 7 * o, m.vy < -2.2 && (m.vy = -2.2), m.x += (m.vx + Math.sin(i * 7 + m.ph) * 0.9) * o, m.y += m.vy * o, m.z += (m.vz + Math.cos(i * 6 + m.ph) * 0.9) * o, m.rx += m.sx * o, m.ry += m.sy * o, n || De(this.confetti, y++, m, Math.min(1, m.life * 2), [m.rx, m.ry, m.ph], m.color);
    }
    for (let [m, p] of [[this.confetti, y], [this.rings, a], [this.bases, r], [this.beams, l], [this.jets, c], [this.repairCrosses, h], [this.smoke, f]]) ao(m, p);
    if (this.lastProjectile.size > 80) {
      let m = new Set(e.projectiles.map(p => p.id));
      for (let p of this.lastProjectile.keys()) m.has(p) || this.lastProjectile.delete(p);
    }
  }
};
import * as S from "./vendor/001-three-0.185.js";
var ss = Math.PI * 2,
  Li = 24,
  oc = new S.Vector3(0, 1, 0),
  Mn = 13.5,
  Tn = 15,
  Wr = new S.Vector3(3.6, 17.8, 4.4),
  Vr = new S.Vector3(2.4, 20.5, 1.6),
  Yr = new S.Vector3(0, 1.75, -0.45),
  _r = new S.Vector3(0, 1, 0.1),
  qr = [3.6, 3.4, 2.95, 2.45, 2.25, 1.65, 1.45],
  co = 44,
  Nt = 18;
function Di() {
  let t = new S.BufferGeometry(),
    e = (co + 1) * (Nt + 1),
    s = [];
  for (let o = 0; o < co; o++) for (let n = 0; n < Nt; n++) {
    let i = o * (Nt + 1) + n,
      a = i + Nt + 1;
    s.push(i, i + 1, a, i + 1, a + 1, a);
  }
  return t.setAttribute("position", new S.BufferAttribute(new Float32Array(e * 3), 3).setUsage(S.DynamicDrawUsage)), t.setAttribute("normal", new S.BufferAttribute(new Float32Array(e * 3), 3).setUsage(S.DynamicDrawUsage)), t.setAttribute("uv", new S.BufferAttribute(new Float32Array(e * 2), 2)), t.setIndex(s), t;
}
var lo = new S.CatmullRomCurve3([new S.Vector3(), new S.Vector3(0, 1, 0)], !1, "centripetal"),
  Rs = new S.Vector3(),
  vn = new S.Vector3(),
  Ss = new S.Vector3(),
  ks = new S.Vector3(),
  wt = new S.Vector3(),
  Hs = new S.Vector3(),
  Bi = new S.Quaternion();
function Fi(t, e, s, o) {
  lo.points = e;
  let n = t.attributes.position.array,
    i = t.attributes.normal.array,
    a = t.attributes.uv.array,
    r = e.length - 1,
    l = 0;
  lo.getTangent(0, ks), wt.copy(o).addScaledVector(ks, -o.dot(ks)), wt.lengthSq() < 1e-6 && wt.set(0, 0, 1), wt.normalize();
  for (let c = 0; c <= co; c++) {
    let h = c / co;
    lo.getPoint(h, vn), c && (l += vn.distanceTo(Rs)), Rs.copy(vn), lo.getTangent(h, Ss), c && (Bi.setFromUnitVectors(ks, Ss), wt.applyQuaternion(Bi)), ks.copy(Ss), Hs.crossVectors(Ss, wt).normalize(), wt.crossVectors(Hs, Ss).normalize();
    let d = h * r,
      u = Math.min(r - 1, Math.floor(d)),
      f = s[u] + (s[u + 1] - s[u]) * Bt(d - u);
    for (let y = 0; y <= Nt; y++) {
      let m = y / Nt * ss,
        p = Math.cos(m),
        b = Math.sin(m),
        w = c * (Nt + 1) + y,
        M = wt.x * p + Hs.x * b,
        x = wt.y * p + Hs.y * b,
        T = wt.z * p + Hs.z * b;
      n[w * 3] = Rs.x + M * f, n[w * 3 + 1] = Rs.y + x * f, n[w * 3 + 2] = Rs.z + T * f, i[w * 3] = M, i[w * 3 + 1] = x, i[w * 3 + 2] = T, a[w * 2] = y / Nt, a[w * 2 + 1] = l / 38;
    }
  }
  return t.attributes.position.needsUpdate = t.attributes.normal.needsUpdate = t.attributes.uv.needsUpdate = !0, t.computeBoundingSphere(), t;
}
var Rn = new Map(),
  es = new Map(),
  St = new Map(),
  Sn = new Map(),
  Qe = (t, e, s) => Math.max(e, Math.min(s, t)),
  Bt = t => (t = Qe(t, 0, 1), t * t * (3 - 2 * t)),
  ne = (t, e = 0) => Number.isFinite(t) ? t : e;
function ji(t = 9) {
  return () => (t = Math.imul(t, 1664525) + 1013904223 >>> 0, t / 4294967296);
}
function $e(t, e) {
  return Rn.has(t) || Rn.set(t, e()), Rn.get(t);
}
function Hn(t) {
  if (Sn.has(t)) return Sn.get(t);
  if (typeof document > "u") return null;
  let e = document.createElement("canvas");
  e.width = e.height = 512;
  let s = e.getContext("2d");
  if (!s) return null;
  let o = ji(118 + t.length);
  if (t === "fur") {
    s.fillStyle = "#c39967", s.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 6500; i++) {
      let a = o() * 512,
        r = o() * 512;
      s.strokeStyle = i % 3 ? "rgba(91,59,34,.16)" : "rgba(250,220,170,.27)", s.lineWidth = 0.6 + o() * 0.55, s.beginPath(), s.moveTo(a, r), s.lineTo(a + (o() - 0.5) * 3, r - 2 - o() * 6), s.stroke();
    }
  } else if (t === "tabby" || t === "cream") {
    let i = t === "tabby";
    if (s.fillStyle = i ? "#d9904a" : "#f3e4c9", s.fillRect(0, 0, 512, 512), i) for (let a = 0; a < 9; a++) {
      let r = a * 57 + o() * 12,
        l = 14 + o() * 10;
      s.fillStyle = "rgba(122,62,22,.5)", s.beginPath(), s.moveTo(0, r);
      for (let c = 0; c <= 512; c += 16) s.lineTo(c, r + Math.sin(c * 0.03 + a) * 9);
      for (let c = 512; c >= 0; c -= 16) s.lineTo(c, r + l + Math.sin(c * 0.024 + a * 1.7) * 7);
      s.closePath(), s.fill();
    }
    for (let a = 0; a < 9e3; a++) {
      let r = o() * 512,
        l = o() * 512;
      s.strokeStyle = a % 3 ? i ? "rgba(110,56,20,.14)" : "rgba(170,140,100,.12)" : "rgba(255,236,200,.22)", s.lineWidth = 0.6 + o() * 0.5, s.beginPath(), s.moveTo(r, l), s.lineTo(r + (o() - 0.5) * 3, l - 2 - o() * 6), s.stroke();
    }
  } else if (t === "peel") {
    s.fillStyle = "#e79732", s.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 19e3; i++) {
      let a = o() * 512,
        r = o() * 512,
        l = 0.45 + o() * 1;
      s.fillStyle = i % 4 ? "rgba(141,74,15,.085)" : "rgba(255,233,149,.20)", s.beginPath(), s.arc(a, r, l, 0, ss), s.fill();
    }
  } else if (t === "fabric") {
    s.fillStyle = "#6b8a8a", s.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 8; i++) s.fillStyle = i % 2 ? "#809c91" : "#426c73", s.fillRect(0, i * 64, 512, 61), s.strokeStyle = "rgba(236,219,170,.4)", s.lineWidth = 1, s.setLineDash([3, 3]), s.beginPath(), s.moveTo(0, i * 64 + 4), s.lineTo(512, i * 64 + 4), s.stroke();
    s.setLineDash([]);
    for (let i = 0; i < 512; i += 3) s.fillStyle = "rgba(19,41,38,.08)", s.fillRect(i, 0, 1, 512), s.fillStyle = "rgba(232,220,181,.06)", s.fillRect(0, i, 512, 1);
  } else if (t === "brushed") {
    s.fillStyle = "#adb8b3", s.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 512; i++) s.fillStyle = `rgba(${i % 2 ? "36,51,55" : "233,243,234"},${0.025 + o() * 0.095})`, s.fillRect(0, i, 512, 0.6);
  } else if (t === "wood") {
    s.fillStyle = "#966e43", s.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 170; i++) {
      let a = o() * 512;
      s.strokeStyle = i % 3 ? "rgba(65,38,17,.18)" : "rgba(235,194,119,.16)", s.lineWidth = 0.4 + o(), s.beginPath();
      for (let r = 0; r <= 512; r += 12) {
        let l = a + Math.sin(r * 0.016 + i) * 2;
        r ? s.lineTo(r, l) : s.moveTo(r, l);
      }
      s.stroke();
    }
  }
  let n = new S.CanvasTexture(e);
  return n.colorSpace = S.SRGBColorSpace, n.wrapS = n.wrapT = S.RepeatWrapping, n.anisotropy = 4, Sn.set(t, n), n;
}
function me(t, e, s = 0.65, o = 0, n = null, i = {}) {
  if (!es.has(t)) {
    let a = new S.MeshStandardMaterial({
      color: e,
      roughness: s,
      metalness: o,
      map: n ? Hn(n) : null,
      ...i
    });
    a.name = t, es.set(t, a);
  }
  return es.get(t);
}
function Kr(t = !1) {
  return $e(`ball-${t}`, () => new S.SphereGeometry(1, t ? 10 : 18, t ? 6 : 12));
}
function Et(t, e, s, o = 14) {
  return $e(`cyl-${t}-${e}-${s}-${o}`, () => new S.CylinderGeometry(t, e, s, o));
}
function kn(t, e, s = 28, o = ss) {
  return $e(`ring-${t}-${e}-${s}-${o}`, () => new S.TorusGeometry(t, e, 6, s, o));
}
function Ui(t, e, s, o = 0.15, n = 4) {
  return o = Math.min(o, t * 0.47, e * 0.47, s * 0.47), $e(`bevel-${t}-${e}-${s}-${o}-${n}`, () => {
    let i = new S.BoxGeometry(1, 1, 1, n, n, n),
      a = i.attributes.position,
      r = i.attributes.normal,
      l = new S.Vector3(),
      c = new S.Vector3(),
      h = new S.Vector3(),
      d = (u, f) => u < -0.49 ? -f / 2 : u < -0.01 ? -f / 2 + o : u > 0.49 ? f / 2 : u > 0.01 ? f / 2 - o : 0;
    for (let u = 0; u < a.count; u++) l.set(d(a.getX(u), t), d(a.getY(u), e), d(a.getZ(u), s)), c.set(Qe(l.x, -t / 2 + o, t / 2 - o), Qe(l.y, -e / 2 + o, e / 2 - o), Qe(l.z, -s / 2 + o, s / 2 - o)), h.copy(l).sub(c).normalize(), l.copy(c).addScaledVector(h, o), a.setXYZ(u, l.x, l.y, l.z), r.setXYZ(u, h.x, h.y, h.z);
    return i;
  });
}
function Xr() {
  return $e("folded-leaf", () => {
    let t = [],
      e = [],
      s = [];
    for (let n = 0; n <= 8; n++) {
      let i = n / 8,
        a = Math.sin(Math.PI * i) * 0.42;
      for (let r = 0; r < 3; r++) t.push((r - 1) * a, 2 * i, Math.sin(Math.PI * i) * (r === 1 ? 0.15 : -0.04)), e.push(r / 2, i);
    }
    for (let n = 0; n < 8; n++) for (let i = 0; i < 2; i++) {
      let a = n * 3 + i;
      s.push(a, a + 3, a + 1, a + 1, a + 3, a + 4);
    }
    let o = new S.BufferGeometry();
    return o.setAttribute("position", new S.Float32BufferAttribute(t, 3)), o.setAttribute("uv", new S.Float32BufferAttribute(e, 2)), o.setIndex(s), o.computeVertexNormals(), o;
  });
}
var et = class {
  constructor() {
    this.parts = new Map();
  }
  add(e, s, o = [0, 0, 0], n = [0, 0, 0], i = [1, 1, 1]) {
    let a = new S.Matrix4().compose(new S.Vector3(...o), new S.Quaternion().setFromEuler(new S.Euler(...n)), new S.Vector3(...i)),
      r = e.index ? e.toNonIndexed() : e.clone();
    r.applyMatrix4(a), r.attributes.normal || r.computeVertexNormals(), r.attributes.uv || r.setAttribute("uv", new S.Float32BufferAttribute(new Float32Array(r.attributes.position.count * 2), 2)), this.parts.has(s) || this.parts.set(s, []), this.parts.get(s).push(r);
  }
  sphere(e, s, o, n = [0, 0, 0], i = !1) {
    this.add(Kr(i), e, s, n, o);
  }
  box(e, s, o, n, i, a = [0, 0, 0], r = 0.15) {
    this.add(Ui(e, s, o, r), n, i, a);
  }
  finish(e = "") {
    let s = new S.Group();
    s.name = e;
    for (let [o, n] of this.parts) {
      let i = n.reduce((l, c) => l + c.attributes.position.count, 0),
        a = new S.BufferGeometry();
      for (let l of ["position", "normal", "uv"]) {
        let c = l === "uv" ? 2 : 3,
          h = new Float32Array(i * c),
          d = 0;
        for (let u of n) h.set(u.attributes[l].array, d), d += u.attributes[l].array.length;
        a.setAttribute(l, new S.BufferAttribute(h, c));
      }
      a.computeBoundingSphere(), a.computeBoundingBox();
      let r = new S.Mesh(a, o);
      r.name = `${e}-${o.name}`, r.castShadow = !0, r.receiveShadow = !0, s.add(r), n.forEach(l => l.dispose());
    }
    return s.userData.artStats = Wi(s), s;
  }
};
function Wi(t) {
  let e = 0,
    s = 0;
  return t.traverse(o => {
    o.isMesh && (e++, s += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3 * (o.isInstancedMesh ? o.count : 1));
  }), {
    drawCalls: e,
    triangles: s
  };
}
function Zr() {
  if (St.has("paw")) return St.get("paw").clone(!0);
  let t = new et(),
    e = ts(),
    s = me("cat-pads", "#bd7973", 0.87),
    o = ts("cat-stripe-real", "#8a4f22", "cream"),
    n = me("cat-claw", "#e2d2b4", 0.6);
  t.sphere(e, [0, 0.82, -0.18], [1.95, 0.85, 1.48]), t.sphere(e, [0, 1.75, -0.45], [1.55, 1.35, 1.35]);
  for (let l = 0; l < 4; l++) {
    let c = [-1.5, -0.5, 0.5, 1.5][l],
      h = l === 0 || l === 3 ? 1 : 1.32;
    t.sphere(e, [c, 0.57, h], [0.7, 0.6, 1.02]), t.sphere(s, [c, -0.02, h + 0.08], [0.44, 0.12, 0.59], [0, 0, 0], !0), t.add($e("cat-claw-cone", () => new S.ConeGeometry(0.15, 0.54, 10)), n, [c, 0.39, h + 1.01], [Math.PI / 2 + 0.18, 0, 0]);
  }
  t.sphere(s, [0, -0.02, -0.26], [1.04, 0.12, 0.82]);
  let i = $e("tuft", () => new S.ConeGeometry(0.025, 0.19, 4)),
    a = ji(700);
  for (let l = 0; l < 32; l++) {
    let c = a() * ss,
      h = 0.65 + a() * 1.25;
    t.add(i, e, [Math.sin(c) * h, 1.28 + a() * 0.12, -0.15 + Math.cos(c) * h * 0.62], [(a() - 0.5) * 0.35, c, (a() - 0.5) * 0.35]);
  }
  let r = t.finish("sculpted-cat-paw");
  return St.set("paw", r), r.clone(!0);
}
function ts(t = "cat-fur-real", e = "#ffffff", s = "tabby") {
  if (!es.has(t)) {
    let o = new S.MeshPhysicalMaterial({
      color: e,
      roughness: 0.92,
      metalness: 0,
      map: Hn(s),
      sheen: 1,
      sheenColor: new S.Color("#ffe2b8"),
      sheenRoughness: 0.55
    });
    o.name = t, es.set(t, o);
  }
  return es.get(t);
}
function Jr() {
  let t = ts(),
    e = ts("cat-belly-real", "#ffffff", "cream"),
    s = ts("cat-stripe-real", "#8a4f22", "cream"),
    o = me("cat-pink", "#d88f88", 0.7),
    n = me("cat-nose", "#c4706d", 0.45),
    i = new et();
  i.sphere(t, [0, 8.4, -4.2], [10.4, 8.8, 11.4]);
  for (let T of [-1, 1]) i.sphere(t, [T * 6.1, 5.8, -1.6], [4.6, 5.8, 7.4], [0, T * 0.15, 0]);
  i.sphere(t, [0, 14.5, -0.2], [7.6, 10.2, 7.4], [-0.22, 0, 0]), i.sphere(e, [0, 15.2, 4.6], [5.3, 8.2, 3.3], [-0.18, 0, 0]), i.sphere(t, [0, 21.4, 2.2], [5.2, 4.6, 4.8]);
  {
    let T = Fi(Di(), [[-3.4, 17, 3.2], [-3.3, 12.5, 4.4], [-3.2, 8.5, 5.4], [-3.1, 4.8, 6.2], [-3.1, 2.3, 6.8], [-3.1, 1.2, 7.4]].map(g => new S.Vector3(...g)), [3, 2.6, 2.2, 2, 1.55, 1.6], new S.Vector3(1, 0, 0));
    i.add(T, t), T.dispose();
  }
  i.sphere(e, [-3.1, 1.1, 7.3], [2.5, 1.3, 3.2]);
  for (let T of [-1, 0, 1]) i.sphere(e, [-3.1 + T * 1.1, 0.8, 9.6], [0.75, 0.65, 0.8], [0, 0, 0], !0);
  for (let T of [-1, 1]) {
    i.sphere(e, [T * 6.6, 1.2, 4], [2.7, 1.3, 4.4]);
    for (let g of [-1, 0, 1]) i.sphere(e, [T * 6.6 + g * 1.1, 0.9, 7.7], [0.8, 0.7, 0.85], [0, 0, 0], !0);
  }
  i.sphere(t, [3.4, 18.2, 4.2], [3, 3.8, 3]), i.sphere(t, [0, 11.5, -2.6], [8.6, 7.5, 8.8]);
  let a = $e("cat-fluff-cone", () => new S.ConeGeometry(0.9, 3.2, 7));
  for (let T = 0; T < 9; T++) i.add(a, e, [(T - 4) * 0.95, 19.2 - Math.abs(T - 4) * 0.5, 6.3], [Math.PI - 0.5, 0, (T - 4) * 0.12]);
  let r = i.finish("giant-tabby-body"),
    l = new et(),
    c = new et();
  l.sphere(t, [0, 3, 1.4], [6.4, 5.6, 5.9]);
  for (let T of [-1, 1]) l.sphere(e, [T * 3.2, 1.3, 4], [3, 2.5, 2.6]);
  for (let T of [-1, 1]) l.sphere(e, [T * 1.15, 0.8, 6.6], [1.55, 1.15, 1.15]);
  l.sphere(e, [0, -0.2, 5.9], [1.6, 0.9, 1.3]), l.add($e("cat-nose-tri", () => new S.ConeGeometry(0.9, 0.9, 3)), n, [0, 1.95, 7.35], [Math.PI, 0, 0], [1, 0.7, 0.55]);
  for (let T of [-1, 1]) l.sphere(s, [T * 0.9, 7.4, 3.6], [0.45, 1.6, 0.5], [-0.6, 0, T * 0.15]);
  l.sphere(s, [0, 7.7, 3.4], [0.45, 1.7, 0.5], [-0.6, 0, 0]);
  for (let T of [-1, 1]) l.add(kn(0.6, 0.08, 16, Math.PI), s, [T * 0.6, 1.15, 7.05], [0, 0, Math.PI]);
  l.sphere(t, [0, 3, 6.4], [1.1, 1.6, 1.2], [-0.4, 0, 0]);
  let h = $e("cat-tuft-cone", () => new S.ConeGeometry(0.55, 2.4, 7));
  for (let T of [-1, 1]) for (let g = 0; g < 5; g++) l.add(h, e, [T * (5.4 - g * 0.15), 1.6 - g * 0.7, 2.6 + g * 0.25], [0, 0, T * (1.75 + g * 0.18)]);
  let d = me("cat-whisker", "#f6efe0", 0.4);
  for (let T of [-1, 1]) for (let g = 0; g < 4; g++) l.add(Et(0.045, 0.07, 7.5, 4), d, [T * 4.6, 0.7 + g * 0.45, 6.9], [0, T * -0.25, Math.PI / 2 + T * (g - 1.5) * 0.12]);
  let u = l.finish("giant-tabby-head"),
    f = new S.MeshPhysicalMaterial({
      color: "#b9c83f",
      roughness: 0.15,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      emissive: "#4d5a10",
      emissiveIntensity: 0.25
    }),
    y = me("cat-pupil", "#0c0b09", 0.2),
    m = me("cat-glint", "#ffffff", 0.2, 0, null, {
      emissive: "#ffffff",
      emissiveIntensity: 0.8
    }),
    p = me("cat-eye-rim", "#3a2414", 0.6);
  for (let T of [-1, 1]) c.add(kn(1.45, 0.16, 24), p, [T * 2.45, 0, 0.22], [0, 0, 0], [1, 1.08, 1]);
  for (let T of [-1, 1]) c.sphere(f, [T * 2.45, 0, 0], [1.4, 1.55, 0.75]), c.sphere(y, [T * 2.45, 0, 0.55], [0.3, 1.2, 0.3]), c.sphere(m, [T * 2.05, 0.5, 0.72], [0.24, 0.24, 0.12], [0, 0, 0], !0);
  let b = c.finish("giant-tabby-eyes");
  b.position.set(0, 3.7, 5.65), u.add(b);
  let w = [];
  for (let T of [-1, 1]) {
    let g = new et();
    g.add($e("cat-ear-cone", () => new S.ConeGeometry(2.4, 4.8, 14)), t, [0, 2.2, 0], [0, 0, 0], [1, 1, 0.55]), g.add($e("cat-ear-in-cone", () => new S.ConeGeometry(1.5, 3.4, 14)), o, [0, 1.9, 0.45], [0, 0, 0], [1, 1, 0.4]);
    for (let v = 0; v < 3; v++) g.add(Et(0.02, 0.1, 1.6, 4), e, [(v - 1) * 0.35, 1.6, 0.7], [0.3, 0, (v - 1) * 0.25]);
    let H = g.finish("giant-tabby-ear");
    H.position.set(T * 3.6, 6.6, 1.6), H.rotation.set(-0.12, 0, T * -0.3), u.add(H), w.push(H);
  }
  u.position.set(0, 22.4, 2.6), r.add(u);
  let M = new et();
  for (let T = 0; T < 18; T++) {
    let g = T / 17,
      H = g * Math.PI * 0.95;
    M.sphere(T > 14 || T % 4 === 1 ? s : t, [Math.sin(H) * 10 * (1 - g * 0.2), 0.4 + g * 1.2, -Math.cos(H) * 3.5 + Math.sin(H) * -3 - g * 2], [1.9 - g * 0.6, 1.9 - g * 0.6, 1.9 - g * 0.6]);
  }
  let x = M.finish("giant-tabby-tail");
  return x.position.set(0, 1.4, -13.5), r.add(x), r.userData.parts = {
    head: u,
    eyes: b,
    ears: w,
    tail: x
  }, r;
}
function Qr() {
  if (St.has("fruit")) return St.get("fruit").clone(!0);
  let t = new et(),
    e = me("orange-peel", Hn("peel") ? "#ffffff" : "#e79732", 0.58, 0.02, "peel"),
    s = me("orange-stalk", "#5f4a2f", 0.87),
    o = me("orange-leaf", "#376942", 0.8, 0, null, {
      side: S.DoubleSide
    }),
    n = $e("sculpted-orange", () => {
      let a = new S.SphereGeometry(2.1, 32, 20),
        r = a.attributes.position;
      for (let l = 0; l < r.count; l++) {
        let c = r.getX(l),
          h = r.getY(l),
          d = r.getZ(l),
          u = 1 + 0.0027 * Math.sin(c * 37 + d * 13) * Math.cos(h * 41);
        r.setXYZ(l, c * u, h * 0.975 * u, d * u);
      }
      return a.computeVertexNormals(), a;
    });
  t.add(n, e), t.add(Et(0.14, 0.22, 0.58, 10), s, [0, 2.13, 0], [0, 0, -0.12]), t.sphere(s, [0, -2.035, 0], [0.15, 0.035, 0.15], [0, 0, 0], !0), t.add(Xr(), o, [0, 2.34, 0], [0.65, 0.5, -1.07], [0.62, 0.72, 0.62]);
  let i = t.finish("rolling-orange");
  return St.set("fruit", i), i.clone(!0);
}
function el() {
  if (St.has("sprinkler")) return St.get("sprinkler").clone(!0);
  let t = new et(),
    e = me("sprinkler-enamel", "#326961", 0.34, 0.23),
    s = me("sprinkler-brass", "#af8a50", 0.3, 0.72),
    o = me("sprinkler-rubber", "#263d34", 0.85);
  t.add(Et(0.83, 1, 0.23, 24), e, [0, 0.11, 0]), t.add(Et(0.51, 0.62, 0.64, 20), e, [0, 0.53, 0]), t.add(kn(0.52, 0.07, 24), s, [0, 0.88, 0], [Math.PI / 2, 0, 0]), t.add(Et(0.24, 0.24, 0.33, 14), s, [0, 1, 0]), t.add(Et(0.23, 0.28, 0.85, 14), o, [0, 0.33, -0.83], [Math.PI / 2, 0, 0]);
  let n = t.finish("garden-sprinkler-base");
  return St.set("sprinkler", n), n.clone(!0);
}
function tl() {
  let t = new S.MeshBasicMaterial({
      color: "#ffa93e",
      transparent: !0,
      opacity: 0.1,
      depthWrite: !1,
      side: S.DoubleSide
    }),
    e = new S.MeshBasicMaterial({
      color: "#ffc255",
      transparent: !0,
      opacity: 0.78,
      depthWrite: !1,
      side: S.DoubleSide
    }),
    s = new S.Group(),
    o = new S.Mesh($e("warning-disc", () => new S.CircleGeometry(1, 48)), t);
  o.rotation.x = -Math.PI / 2, o.position.y = 0.13, s.add(o);
  let n = new et();
  n.add($e("warning-ring", () => new S.RingGeometry(0.91, 1, 48)), e, [0, 0.155, 0], [-Math.PI / 2, 0, 0]);
  let i = $e("warning-arrow", () => {
    let r = new S.BufferGeometry();
    return r.setAttribute("position", new S.Float32BufferAttribute([-0.28, 0, -0.18, 0, 0, 0.2, 0.28, 0, -0.18, -0.28, 0, -0.18, 0.28, 0, -0.18, 0.19, 0, -0.28, -0.28, 0, -0.18, 0.19, 0, -0.28, -0.19, 0, -0.28], 3)), r.computeVertexNormals(), r;
  });
  for (let r = 0; r < 3; r++) n.add(i, e, [0, 0.16, -0.38 + r * 0.34], [0, 0, 0], [0.8, 1, 0.8]);
  let a = n.finish("course-warning-glyph");
  return a.traverse(r => {
    r.isMesh && (r.castShadow = !1, r.receiveShadow = !1, r.renderOrder = 4);
  }), s.add(a), o.renderOrder = 3, s.visible = !1, {
    group: s,
    disk: o,
    glyph: a,
    materials: [t, e],
    ownedGeometries: a.children.map(r => r.geometry)
  };
}
function sl(t, e, s, o) {
  let n = e.center || e,
    i = Math.max(1.2, ne(e.radius, o === "fruit" ? 2.1 : 2.65));
  t.group.position.set(ne(n.x), ne(n.y) + 0.02, ne(n.z)), t.group.visible = e.phase !== "idle", t.disk.scale.set(i * 1.12, i * 1.12, 1), t.glyph.scale.set(i * 1.12, 1, i * 1.12), t.glyph.rotation.y = ne(n.yaw, ne(e.yaw));
  let a = 0.5 + 0.5 * Math.sin(s * 8.3);
  t.materials[0].opacity = e.phase === "warning" ? 0.06 + 0.06 * a : 0.09, t.materials[1].opacity = e.phase === "warning" ? 0.52 + 0.33 * a : 0.68, t.materials[0].color.set(e.phase === "active" ? "#ff7751" : "#ffa93e"), t.materials[1].color.set(e.phase === "active" ? "#ffad71" : "#ffd077");
}
function ol() {
  let o = new S.BufferGeometry(),
    n = new Float32Array(405),
    i = new Float32Array(405),
    a = new Float32Array(270),
    r = [];
  for (let l = 0; l <= 26; l++) for (let c = 0; c < 5; c++) {
    let h = l * 5 + c;
    if (a[h * 2] = c / 5, a[h * 2 + 1] = l / 26, l < 26) {
      let d = l * 5 + (c + 1) % 5,
        u = h + 5,
        f = d + 5;
      r.push(h, d, u, d, f, u);
    }
  }
  return o.setAttribute("position", new S.BufferAttribute(n, 3).setUsage(S.DynamicDrawUsage)), o.setAttribute("normal", new S.BufferAttribute(i, 3).setUsage(S.DynamicDrawUsage)), o.setAttribute("uv", new S.BufferAttribute(a, 2)), o.setIndex(r), {
    g: o,
    positions: n,
    normals: i,
    segments: 26,
    sides: 5
  };
}
function Ni(t, e, s, o = 0) {
  let n = Math.sin(Math.PI * e) * (1.65 + 0.15 * Math.sin(o * 3));
  return t.set(s.x * e, 1.06 + (s.y - 1.06) * e + n, s.z * e), t;
}
function Vi(t) {
  if (!["paw", "fruit", "sprinkler"].includes(t)) throw new Error(`Unknown course hazard: ${t}`);
  let e = new S.Group(),
    s = new S.Group(),
    o = tl(),
    n = [...o.ownedGeometries],
    i = [...o.materials];
  e.name = `hazard-${t}`, s.name = `moving-${t}`, e.add(s, o.group);
  let a = null,
    r = null,
    l = null,
    c = null,
    h = null,
    d = null,
    u = null,
    f = null,
    y = null,
    m = null,
    p = 0,
    b = 0,
    w = 0,
    M = 0,
    x = 0,
    T = 0.35,
    g = 0,
    H = !1,
    v = Array.from({
      length: 7
    }, () => new S.Vector3());
  if (t === "paw") s.add(Zr()), f = Jr(), f.visible = !1, e.add(f), m = Di(), n.push(m), y = new S.Mesh(m, ts()), y.name = "giant-tabby-foreleg", y.castShadow = y.receiveShadow = !0, y.frustumCulled = !1, y.visible = !1, e.add(y);else if (t === "fruit") a = Qr(), s.add(a);else {
    s.add(el());
    let U = new et(),
      q = me("sprinkler-brass", "#af8a50", 0.3, 0.72),
      I = me("sprinkler-enamel", "#326961", 0.34, 0.23);
    U.add(Et(0.23, 0.3, 0.9, 16), q, [0, 1.07, 0.37], [Math.PI / 2 - 0.2, 0, 0]), U.box(0.85, 0.26, 0.34, I, [0, 1.29, 0], [0, 0, 0], 0.1), h = U.finish("rotating-sprinkler-nozzle"), s.add(h), n.push(...h.children.map(re => re.geometry)), r = ol(), n.push(r.g);
    let V = new S.MeshStandardMaterial({
      color: "#bfecf1",
      roughness: 0.12,
      metalness: 0.08,
      emissive: "#75a6b0",
      emissiveIntensity: 0.12,
      transparent: !0,
      opacity: 0.73,
      depthWrite: !1,
      side: S.DoubleSide
    });
    i.push(V), l = new S.Mesh(r.g, V), l.frustumCulled = !1, s.add(l);
    let W = new S.MeshStandardMaterial({
      color: "#c8edf0",
      roughness: 0.13,
      metalness: 0.13,
      transparent: !0,
      opacity: 0.84,
      depthWrite: !1
    });
    i.push(W), c = new S.InstancedMesh($e("water-drop", () => new S.SphereGeometry(1, 8, 5)), W, 24), c.instanceMatrix.setUsage(S.DynamicDrawUsage), c.frustumCulled = !1, s.add(c);
    let Z = new S.BufferGeometry();
    Z.setAttribute("position", new S.Float32BufferAttribute(new Float32Array(12), 3).setUsage(S.DynamicDrawUsage)), Z.setIndex([0, 1, 2, 1, 3, 2]), Z.computeVertexNormals(), n.push(Z), u = new S.MeshBasicMaterial({
      color: "#b7e6f0",
      transparent: !0,
      opacity: 0.12,
      depthWrite: !1,
      side: S.DoubleSide
    }), i.push(u), d = new S.Mesh(Z, u), d.frustumCulled = !1, d.renderOrder = 3, e.add(d);
  }
  let R = new S.Vector3(),
    z = new S.Vector3(),
    D = new S.Vector3(),
    F = new S.Vector3(),
    j = new S.Vector3(),
    X = new S.Vector3(),
    _ = new S.Matrix4(),
    Y = new S.Quaternion(),
    te = new S.Vector3(),
    Te = !1;
  function He(U, q = 0) {
    if (Te || !U) return;
    q = ne(q);
    let I = Qe(ne(U.progress), 0, 1),
      V = U.phase === "active",
      W = U.side < 0 ? -1 : 1;
    if (sl(o, U, q, t), t === "paw") {
      let Z = Qe(q - w, 0, 0.1),
        re = 1 - Math.exp(-Z * 9),
        Ae = U.phase === "warning" ? I : 0;
      if (w = q, V) {
        let Ge = Math.abs(Math.sin(I * Math.PI * 6)) * Bt((I - 0.1) / 0.06) * (1 - Bt((I - 0.74) / 0.08)),
          ue = Bt((I - 0.82) / 0.18);
        M = ne(U.x), x = ne(U.z), H = !0, T = 8.6 * (1 - Bt(I / 0.08)) + Ge * 0.9 + 5 * ue, g = 0.75 * (1 - Bt(I / 0.06)) + Ge * 0.18 + 0.45 * ue;
      } else {
        let Ge = ne(U.x),
          ue = ne(U.z);
        H || (M = Ge, x = ue, H = !0), M += (Ge - M) * re * 0.5, x += (ue - x) * re * 0.5;
        let Le = Math.hypot(Ge - M, ue - x),
          rt = Bt(Ae / 0.35),
          Ce = Math.pow(Math.max(0, Math.sin(q * 0.9)), 12) * 1.2;
        T += (0.35 + Ce + rt * 8.25 + Math.sin(q * 31) * 0.12 * Ae + Math.min(5, Le * 0.3) - T) * re, g += (Ce * 0.2 + rt * 0.75 + Math.min(0.45, Le * 0.03) - g) * re;
      }
      s.position.set(M, ne(U.y) + T + 0.18, x), s.visible = !0;
      let ve = U.center,
        at = ne(U.yaw);
      if (ve && f) {
        let Ge = ne(ve.nx, Math.cos(ne(ve.yaw))),
          ue = ne(ve.nz, -Math.sin(ne(ve.yaw))),
          Le = -Ge * W,
          rt = -ue * W,
          Ce = Math.atan2(Le, rt),
          Fe = 0.3 * Qe(b / 7, 0, 1),
          Ue = Qe(b - 6, 0, 6),
          yt = Ae > 0.3 ? Math.sin(q * 16) * 0.035 * Bt((Ae - 0.3) / 0.3) : 0;
        f.position.set(ne(ve.x) + Ge * W * Li + Le * Ue, ne(ve.y), ne(ve.z) + ue * W * Li + rt * Ue), f.rotation.set(Fe, Ce + Math.sin(q * 0.7) * 0.03 + yt * 0.5, yt, "YXZ");
        let Pt = Math.sin(q * 2.1);
        f.scale.set(1 + Pt * 0.006, 1 + Pt * 0.012, 1 + Pt * 0.009), f.visible = !0, f.updateMatrix();
        let bt = R.copy(Wr).applyMatrix4(f.matrix);
        at = Math.atan2(s.position.x - bt.x, s.position.z - bt.z), s.rotation.set(g, at, V ? 0 : Math.sin(q * 1.3) * 0.03, "YXZ"), s.updateMatrix();
        let lt = z.copy(Yr).applyMatrix4(s.matrix),
          Xt = Math.max(0.01, bt.distanceTo(lt));
        b += (Qe(b + Xt - (Mn + Tn - 0.4), 0, 14) - b) * re;
        let li = Math.max(1, Xt / (Mn + Tn - 0.05)),
          Us = Mn * li,
          ci = Tn * li;
        D.subVectors(lt, bt).divideScalar(Xt);
        let Vo = (Us * Us - ci * ci + Xt * Xt) / (2 * Xt),
          Na = Math.sqrt(Math.max(0, Us * Us - Vo * Vo)),
          Da = Math.sin(Ce),
          Fa = Math.cos(Ce),
          Yo = Math.cos(Ce),
          _o = -Math.sin(Ce);
        F.set(Yo - Da * 0.4, -0.4, _o - Fa * 0.4), F.addScaledVector(D, -F.dot(D)), F.lengthSq() < 1e-4 && F.set(Yo, 0, _o), F.normalize();
        let qo = j.copy(bt).addScaledVector(D, Vo).addScaledVector(F, Na);
        v[0].copy(Vr).applyMatrix4(f.matrix), v[1].copy(bt), v[2].lerpVectors(bt, qo, 0.5), v[3].copy(qo), v[4].lerpVectors(qo, lt, 0.5), v[5].copy(lt), v[6].copy(_r).applyMatrix4(s.matrix), Fi(m, v, qr, X.set(Yo, 0, _o)), y.visible = !0;
        let Ws = f.userData.parts,
          hi = Math.atan2(s.position.x - f.position.x, s.position.z - f.position.z) - Ce,
          ja = Qe(Math.atan2(Math.sin(hi), Math.cos(hi)), -0.7, 0.7);
        p += (ja - p) * 0.12, Ws.head.rotation.set((V ? 0.28 : 0.08 + Ae * 0.18 + Math.sin(q * 0.9) * 0.04) - Fe * 0.6, p, Math.sin(q * 0.6) * 0.05);
        let Ua = q % 4.3 < 0.14 && !V && !Ae ? 0.12 : 1;
        Ws.eyes.scale.set(V || Ae ? 1.08 : 1, Ua, 1), Ws.ears.forEach((Wa, Va) => {
          Wa.rotation.x = -0.12 + (Ae ? 0.18 : (q + Va * 1.7) % 5.5 < 0.25 ? -0.35 : 0);
        }), Ws.tail.rotation.set(0, Math.sin(q * (Ae ? 5 : 1.4)) * (Ae ? 0.45 : 0.32), Math.sin(q * 0.9) * 0.06);
      } else s.rotation.set(g, at, 0, "YXZ");
    } else if (t === "fruit") s.position.set(ne(U.x), ne(U.y) + 2.1, ne(U.z)), s.rotation.y = ne(U.yaw), a.rotation.z = V ? -W * I * ss * 1.42 : 0, s.visible = !0;else {
      let Z = U.pivot || U.center || U,
        re = U.jetEnd || {
          x: ne(Z.x) + 14,
          y: ne(Z.y),
          z: ne(Z.z)
        };
      if (s.position.set(ne(Z.x), ne(Z.y), ne(Z.z)), z.set(ne(re.x) - s.position.x, ne(re.y) - s.position.y, ne(re.z) - s.position.z), h.rotation.y = Math.atan2(z.x, z.z), l.visible = c.visible = V, d.visible = U.phase !== "idle", V) {
        F.set(-z.z, 0, z.x).normalize();
        for (let Fe = 0; Fe <= r.segments; Fe++) {
          let Ue = Fe / r.segments;
          Ni(R, Ue, z, q), D.set(z.x, z.y - 1.06 + Math.cos(Math.PI * Ue) * Math.PI * (1.65 + 0.15 * Math.sin(q * 3)), z.z).normalize(), j.crossVectors(D, F).normalize();
          let yt = 0.048 + 0.03 * Ue + 0.013 * Math.sin(q * 15 - Ue * 30);
          for (let Pt = 0; Pt < r.sides; Pt++) {
            let bt = Pt * ss / r.sides;
            X.copy(F).multiplyScalar(Math.cos(bt)).addScaledVector(j, Math.sin(bt));
            let lt = (Fe * r.sides + Pt) * 3;
            r.positions[lt] = R.x + X.x * yt, r.positions[lt + 1] = R.y + X.y * yt, r.positions[lt + 2] = R.z + X.z * yt, r.normals[lt] = X.x, r.normals[lt + 1] = X.y, r.normals[lt + 2] = X.z;
          }
        }
        r.g.attributes.position.needsUpdate = r.g.attributes.normal.needsUpdate = !0;
        for (let Fe = 0; Fe < c.count; Fe++) {
          let Ue = ((Fe / c.count + q * 0.58) % 1 + 1) % 1;
          Ni(R, Ue, z, q), R.x += Math.sin(Fe * 12.7 + q * 5) * 0.07, R.z += Math.cos(Fe * 7.3 + q * 4) * 0.07, te.set(0.047 + Ue * 0.07, 0.07 + Ue * 0.09, 0.047 + Ue * 0.07), _.compose(R, Y, te), c.setMatrixAt(Fe, _);
        }
        c.instanceMatrix.needsUpdate = !0;
      }
      let Ae = U.center || U,
        ve = re.x - Z.x,
        at = re.z - Z.z,
        Ge = Math.hypot(ve, at) || 1,
        ue = -at / Ge,
        Le = ve / Ge,
        rt = d.geometry.attributes.position.array,
        Ce = ne(Ae.y) + 0.145;
      rt.set([Z.x + ue * 0.36, Ce, Z.z + Le * 0.36, Z.x - ue * 0.36, Ce, Z.z - Le * 0.36, re.x + ue * 0.85, Ce, re.z + Le * 0.85, re.x - ue * 0.85, Ce, re.z - Le * 0.85]), d.geometry.attributes.position.needsUpdate = !0, u.color.set(V ? "#a6dbe8" : "#ffbf61"), u.opacity = V ? 0.18 : 0.08 + 0.06 * (0.5 + 0.5 * Math.sin(q * 8));
    }
  }
  function L() {
    Te || (Te = !0, e.removeFromParent(), n.forEach(U => U.dispose()), i.forEach(U => U.dispose()));
  }
  return e.userData.artStats = Wi(e), e.userData.hazardType = t, {
    group: e,
    moving: s,
    warning: o.group,
    update: He,
    dispose: L
  };
}
function kt(t, e) {
  let s = t.samples || [];
  if (s.length < 2) return {
    x: 0,
    y: 0,
    z: 0,
    nx: 1,
    nz: 0,
    yaw: 0,
    s: 0
  };
  let o = ne(t.length, s.at(-1).s),
    n = Qe(e, 0, o),
    i = 0,
    a = s.length - 1;
  for (; i + 1 < a;) {
    let f = i + a >> 1;
    s[f].s <= n ? i = f : a = f;
  }
  let r = s[i],
    l = s[i + 1],
    c = Qe((n - r.s) / (l.s - r.s || 1), 0, 1),
    h = l.x - r.x,
    d = l.z - r.z,
    u = Math.hypot(h, d) || 1;
  return {
    x: r.x + h * c,
    y: r.y + (l.y - r.y) * c,
    z: r.z + d * c,
    nx: d / u,
    nz: -h / u,
    yaw: Math.atan2(h, d),
    s: n
  };
}
function zs(t, e) {
  return t.jump && e > t.jump.start && e < t.jump.end;
}
function Yi(t, e, s) {
  let o = 1 / 0;
  for (let n = 0; n < t.samples.length - 1; n++) {
    let i = t.samples[n],
      a = t.samples[n + 1],
      r = a.x - i.x,
      l = a.z - i.z,
      c = Qe(((e - i.x) * r + (s - i.z) * l) / (r * r + l * l || 1), 0, 1);
    o = Math.min(o, Math.hypot(e - i.x - r * c, s - i.z - l * c));
  }
  return o;
}
function _i(t, e, s, o, n, i, a = null) {
  let r = Math.cos(o),
    l = Math.sin(o);
  if (a !== null && t.mapId && gs(t, e, s, a, n / 2 + 0.3)) return !1;
  for (let c of [-0.5, 0, 0.5]) for (let h of [-0.5, 0, 0.5]) if (Yi(t, e + r * n * c + l * i * h, s - l * n * c + r * i * h) < t.width / 2 + 0.95) return !1;
  return !0;
}
function Qt(t, e, s, o, n, i, a, r, l, c = 0) {
  let h = Math.max(1, Math.ceil((o - s) / n));
  for (let d = 0; d < h; d++) {
    let u = s + (o - s) * d / h,
      f = s + (o - s) * (d + 1) / h,
      y = (u + f) / 2;
    if (zs(e, y) || zs(e, u + 0.001) || zs(e, f - 0.001)) continue;
    let m = kt(e, y),
      p = kt(e, u),
      b = kt(e, f),
      w = Math.hypot(b.x - p.x, b.z - p.z);
    for (let M of [-1, 1]) {
      let x = m.x + m.nx * M * i,
        T = m.z + m.nz * M * i;
      _i(e, x, T, m.yaw, a, w + 0.025, m.y) && t.add($e("strip-cube", () => new S.BoxGeometry(1, 1, 1)), l, [x, m.y + c, T], [0, m.yaw, 0], [a, r, w + 0.025]);
    }
  }
}
function nl(t, e) {
  let s = me("shortcut-bed-fabric", "#ffffff", 0.97, 0, "fabric", {
      side: S.DoubleSide
    }),
    o = me("shortcut-fabric-seam", "#decaa3", 0.89),
    n = me("shortcut-bed-leg", "#805c3c", 0.75),
    i = e.length,
    a = e.width / 2 + 1.5,
    r = p => {
      let b = kt(e, p);
      return !e.mapId || [-1, 1].every(w => !gs(e, b.x + b.nx * w * a, b.z + b.nz * w * a, b.y, 0.8));
    },
    l = i * 0.16,
    c = i * 0.83;
  for (; l < c - 20 && !r(l);) l += 1;
  for (; c > l + 20 && !r(c);) c -= 1;
  let h = 28,
    d = 14,
    u = [],
    f = [],
    y = [];
  for (let p = 0; p <= h; p++) {
    let b = kt(e, l + (c - l) * p / h);
    for (let w = 0; w <= d; w++) {
      let M = -Math.PI / 2 + w / d * Math.PI,
        x = Math.sin(M) * a,
        T = 3.05 + Math.cos(M) * 1.6 + 0.05 * Math.cos(p * 0.9);
      u.push(b.x + b.nx * x, b.y + T, b.z + b.nz * x), f.push(w / d * 1.8, p / h * 4);
    }
  }
  for (let p = 0; p < h; p++) for (let b = 0; b < d; b++) {
    let w = p * (d + 1) + b,
      M = w + d + 1;
    y.push(w, w + 1, M, w + 1, M + 1, M);
  }
  let m = new S.BufferGeometry();
  m.setAttribute("position", new S.Float32BufferAttribute(u, 3)), m.setAttribute("uv", new S.Float32BufferAttribute(f, 2)), m.setIndex(y), m.computeVertexNormals(), t.add(m, s), m.dispose();
  for (let p = 0; p < 4; p++) {
    let b = kt(e, l + (c - l) * p / 3);
    for (let w of [-1, 1]) t.add(Et(0.14, 0.18, 3.1, 12), n, [b.x + b.nx * w * a, b.y + 1.53, b.z + b.nz * w * a]), t.add(Et(0.12, 0.12, 0.85, 10), o, [b.x + b.nx * w * a, b.y + 3.05, b.z + b.nz * w * a], [Math.PI / 2, 0, 0]);
  }
}
function qi(t) {
  let e = new et(),
    s = ne(t.width, 4.8),
    o = ne(t.length, t.samples?.at(-1)?.s || 0),
    n = s / 2 + 1.6;
  if (!(o > 0) || !t.samples?.length) return e.finish(`shortcut-${t.id || "empty"}`);
  if (t.kind === "book") {
    let a = me("shortcut-book-cover", "#a9493b", 0.62),
      r = me("shortcut-book-paper", "#d8caa7", 0.94),
      l = me("shortcut-book-lines", "#af9d78", 0.98),
      c = me("shortcut-book-foil", "#c59546", 0.38, 0.32);
    Qt(e, t, 1.5, o - 1.5, 3, n, 0.72, 0.17, a, 0.06);
    for (let h = 0; h < 3; h++) Qt(e, t, 1.5, o - 1.5, 3, n, 0.66, 0.07, h === 1 ? l : r, -0.15 - h * 0.09);
    for (let h of [4, t.jump ? t.jump.start - 2 : o * 0.4, t.jump ? t.jump.end + 2 : o * 0.6, o - 4]) {
      if (h < 0 || h > o || zs(t, h)) continue;
      let d = kt(t, h);
      for (let u of [-1, 1]) {
        let f = d.x + d.nx * u * n,
          y = d.z + d.nz * u * n;
        _i(t, f, y, d.yaw, 0.45, 1.9, d.y) && e.box(0.45, 0.07, 1.9, c, [f, d.y + 0.17, y], [0, d.yaw, 0], 0.03);
      }
    }
  } else if (t.kind === "tunnel") {
    nl(e, {
      ...t,
      width: s,
      length: o
    });
    let a = me("shortcut-fabric-seam", "#decaa3", 0.89);
    Qt(e, t, 2, o - 2, 4.5, n, 0.3, 0.13, a, 0.08);
  } else if (t.kind === "chute") {
    let a = me("shortcut-brushed-steel", "#ffffff", 0.28, 0.69, "brushed"),
      r = me("shortcut-metal-edge", "#42666b", 0.34, 0.35),
      l = me("shortcut-rivet", "#aabebc", 0.29, 0.76);
    Qt(e, t, 1.3, o - 1.3, 2.8, n, 0.7, 0.26, a, -0.05), Qt(e, t, 1.3, o - 1.3, 2.8, n + 0.18, 0.26, 0.45, r, 0.2);
    for (let c = 3; c < o - 3; c += 5) {
      if (zs(t, c)) continue;
      let h = kt(t, c);
      for (let d of [-1, 1]) {
        let u = h.x + h.nx * d * n,
          f = h.z + h.nz * d * n;
        Yi(t, u, f) - 0.075 >= t.width / 2 + 0.95 && !(t.mapId && gs(t, u, f, h.y, 0.4)) && e.add($e("shortcut-rivet-ball", () => new S.SphereGeometry(1, 8, 5)), l, [u, h.y + 0.16, f], [0, 0, 0], [0.075, 0.05, 0.075]);
      }
    }
  } else if (t.kind === "pond") {
    let a = me("shortcut-pond-timber", "#ffffff", 0.83, 0, "wood"),
      r = me("shortcut-pond-bolt", "#5c6c64", 0.44, 0.56),
      l = t.jump?.start || o * 0.4,
      c = t.jump?.end || o * 0.6;
    for (let [h, d] of [[Math.max(1, l - 12), l - 0.8], [c + 0.8, Math.min(o - 1, c + 12)]]) for (let u = h; u <= d; u += 0.85) {
      let f = kt(t, u);
      for (let y of [-1, 1]) t.mapId && gs(t, f.x + f.nx * y * (n + 0.12), f.z + f.nz * y * (n + 0.12), f.y, 0.8) || (e.add(Ui(0.85, 0.24, 0.68, 0.08, 2), a, [f.x + f.nx * y * (n + 0.12), f.y - 0.02, f.z + f.nz * y * (n + 0.12)], [0, f.yaw, 0]), e.add($e("shortcut-rivet-ball", () => new S.SphereGeometry(1, 8, 5)), r, [f.x + f.nx * y * (n + 0.12), f.y + 0.115, f.z + f.nz * y * (n + 0.12)], [0, 0, 0], [0.065, 0.028, 0.065]));
    }
    Qt(e, t, 1, o - 1, 3, n + 0.18, 0.33, 0.17, a, -0.16);
  }
  let i = e.finish(`shortcut-art-${t.id || t.kind}`);
  return i.userData.routeId = t.id, i.userData.minimumSideClearance = 0.9, i.userData.jumpGap = t.jump ? {
    start: t.jump.start,
    end: t.jump.end
  } : null, i;
}
import * as C from "./vendor/001-three-0.185.js";
var Ki = [{
    rank: 1,
    x: 0,
    z: 0,
    height: 1.55,
    color: 15907112,
    dark: 12157967
  }, {
    rank: 2,
    x: -3.95,
    z: 0.35,
    height: 1.05,
    color: 3966688,
    dark: 2317992
  }, {
    rank: 3,
    x: 3.95,
    z: 0.35,
    height: 0.72,
    color: 15028799,
    dark: 11022879
  }],
  Xi = 3.35,
  zn = 4.15,
  ht = 0.12;
function il(t, e, s) {
  let o = new C.Shape(),
    n = -t / 2,
    i = -e / 2,
    a = Math.min(s, t / 2, e / 2);
  return o.moveTo(n + a, i), o.lineTo(n + t - a, i), o.quadraticCurveTo(n + t, i, n + t, i + a), o.lineTo(n + t, i + e - a), o.quadraticCurveTo(n + t, i + e, n + t - a, i + e), o.lineTo(n + a, i + e), o.quadraticCurveTo(n, i + e, n, i + e - a), o.lineTo(n, i + a), o.quadraticCurveTo(n, i, n + a, i), o;
}
function Zi(t, e, s, o = 0.22) {
  let n = Math.min(0.07, s * 0.2),
    i = new C.ExtrudeGeometry(il(t - n * 2, e - n * 2, o), {
      depth: s - n * 2,
      bevelEnabled: !0,
      bevelThickness: n,
      bevelSize: n,
      bevelSegments: 3,
      curveSegments: 6
    });
  return i.translate(0, 0, -(s - n * 2) / 2), i.rotateX(-Math.PI / 2), i;
}
function al(t) {
  let e = new C.Shape();
  if (t === 1) {
    let o = [[-0.23, -0.42], [0.25, -0.42], [0.25, -0.28], [0.09, -0.28], [0.09, 0.43], [-0.07, 0.43], [-0.26, 0.25], [-0.17, 0.13], [-0.07, 0.22], [-0.07, -0.28], [-0.23, -0.28]];
    e.moveTo(...o[0]);
    for (let n of o.slice(1)) e.lineTo(...n);
  } else t === 2 ? (e.moveTo(-0.29, 0.21), e.quadraticCurveTo(-0.28, 0.44, 0.01, 0.44), e.quadraticCurveTo(0.31, 0.44, 0.31, 0.2), e.quadraticCurveTo(0.32, 0.04, 0.12, -0.08), e.lineTo(-0.11, -0.25), e.lineTo(0.31, -0.25), e.lineTo(0.31, -0.42), e.lineTo(-0.31, -0.42), e.lineTo(-0.31, -0.26), e.lineTo(0.015, 0.02), e.quadraticCurveTo(0.14, 0.13, 0.13, 0.21), e.quadraticCurveTo(0.13, 0.29, 0.01, 0.29), e.quadraticCurveTo(-0.1, 0.29, -0.11, 0.18), e.lineTo(-0.29, 0.21)) : (e.moveTo(-0.28, 0.22), e.quadraticCurveTo(-0.26, 0.44, 0.02, 0.44), e.quadraticCurveTo(0.31, 0.44, 0.31, 0.2), e.quadraticCurveTo(0.31, 0.065, 0.17, 0.015), e.quadraticCurveTo(0.33, -0.025, 0.33, -0.205), e.quadraticCurveTo(0.33, -0.44, 0.01, -0.44), e.quadraticCurveTo(-0.28, -0.44, -0.3, -0.22), e.lineTo(-0.11, -0.19), e.quadraticCurveTo(-0.095, -0.29, 0.01, -0.29), e.quadraticCurveTo(0.14, -0.29, 0.14, -0.19), e.quadraticCurveTo(0.14, -0.08, -0.025, -0.08), e.lineTo(-0.07, -0.08), e.lineTo(-0.07, 0.09), e.lineTo(-0.025, 0.09), e.quadraticCurveTo(0.12, 0.09, 0.12, 0.2), e.quadraticCurveTo(0.12, 0.29, 0.01, 0.29), e.quadraticCurveTo(-0.08, 0.29, -0.095, 0.2), e.lineTo(-0.28, 0.22));
  e.closePath();
  let s = new C.ExtrudeGeometry(e, {
    depth: 0.09,
    bevelEnabled: !0,
    bevelSize: 0.02,
    bevelThickness: 0.02,
    bevelSegments: 2,
    curveSegments: 6
  });
  return s.translate(0, 0, -0.045), s;
}
function rl(t, e = 0.06) {
  let s = new C.Shape();
  for (let n = 0; n < 10; n++) {
    let i = Math.PI / 2 - n / 10 * Math.PI * 2,
      a = n % 2 ? t * 0.46 : t;
    n ? s.lineTo(Math.cos(i) * a, Math.sin(i) * a) : s.moveTo(Math.cos(i) * a, Math.sin(i) * a);
  }
  s.closePath();
  let o = new C.ExtrudeGeometry(s, {
    depth: e,
    bevelEnabled: !0,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 1
  });
  return o.translate(0, 0, -e / 2), o;
}
function ll() {
  let t = document.createElement("canvas");
  t.width = 1024, t.height = 256;
  let e = t.getContext("2d"),
    s = e.createLinearGradient(0, 0, 0, 256);
  s.addColorStop(0, "#1b2a6b"), s.addColorStop(1, "#0d1540"), e.fillStyle = s, e.fillRect(0, 0, 1024, 256), e.font = '900 150px "Avenir Next","Trebuchet MS",Arial,sans-serif', e.textAlign = "center", e.textBaseline = "middle", e.lineWidth = 16, e.strokeStyle = "#6b3d00", e.strokeText("CHAMPIONS", 512, 140);
  let o = e.createLinearGradient(0, 60, 0, 210);
  o.addColorStop(0, "#fff3b0"), o.addColorStop(0.5, "#ffc93c"), o.addColorStop(1, "#f08a24"), e.fillStyle = o, e.fillText("CHAMPIONS", 512, 140), e.font = '800 30px "Avenir Next","Trebuchet MS",Arial,sans-serif', e.fillStyle = "#9fe8ff", e.fillText("\u2605  TOYBOX GRAND PRIX  \u2605", 512, 36);
  let n = new C.CanvasTexture(t);
  return n.colorSpace = C.SRGBColorSpace, n;
}
function Ji() {
  let t = new C.Group();
  t.name = "Toybox Rally awards stage";
  let e = new C.Object3D(),
    s = new C.Color(),
    o = (I, V = 0.4, W = 0, Z = {}) => new C.MeshStandardMaterial({
      color: I,
      roughness: V,
      metalness: W,
      ...Z
    }),
    n = (I, V, W = [0, 0, 0], Z = [0, 0, 0], re = [1, 1, 1], Ae = !0) => {
      let ve = new C.Mesh(I, V);
      return ve.position.set(...W), ve.rotation.set(...Z), ve.scale.set(...re), ve.castShadow = Ae, ve.receiveShadow = !0, t.add(ve), ve;
    };
  n(new C.CylinderGeometry(9.5, 9.8, ht * 2, 72), new C.MeshPhysicalMaterial({
    color: 1711941,
    roughness: 0.22,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2
  }), [0, 0, 0], [0, 0, 0], [1, 1, 1], !1);
  let i = o(6284287, 0.4, 0, {
      emissive: 4184319,
      emissiveIntensity: 1.4
    }),
    a = o(16763196, 0.4, 0, {
      emissive: 16228924,
      emissiveIntensity: 1.1
    });
  n(new C.TorusGeometry(9.55, 0.06, 6, 96), i, [0, ht + 0.01, 0], [Math.PI / 2, 0, 0], [1, 1, 1], !1), n(new C.TorusGeometry(6.9, 0.035, 6, 96), a, [0, ht + 0.01, 0], [Math.PI / 2, 0, 0], [1, 1, 1], !1), n(new C.CircleGeometry(60, 48), o(922160, 0.9), [0, -0.02, 0], [-Math.PI / 2, 0, 0], [1, 1, 1], !1);
  let r = [],
    l = [],
    c = o(16777215, 0.35),
    h = new C.CylinderGeometry(0.26, 0.26, 0.16, 20),
    d = new C.SphereGeometry(0.06, 10, 8),
    u = o(16774084, 0.3, 0, {
      emissive: 16767114,
      emissiveIntensity: 2
    }),
    f = o(16774084, 0.3, 0, {
      emissive: 16767114,
      emissiveIntensity: 0.25
    });
  for (let I of Ki) {
    let V = o(I.color, 0.32, 0, {
      envMapIntensity: 0.6
    });
    n(Zi(Xi, zn, I.height), V, [I.x, ht + I.height / 2, I.z]);
    let W = ht + I.height;
    for (let ue of [-1.33, 1.33]) for (let Le = 0; Le < 4; Le++) n(h, V, [I.x + ue, W + 0.08, I.z - 1.5 + Le * 1]);
    n(al(I.rank), c, [I.x, ht + I.height * 0.5, I.z + zn / 2 + 0.05], [0, 0, 0], [I.height * 0.7, I.height * 0.7, 1]);
    let Z = I.z + zn / 2 + 0.03,
      re = Xi / 2 - 0.2,
      Ae = ht + 0.18,
      ve = W - 0.16,
      at = 0,
      Ge = (ue, Le) => {
        let rt = n(d, at++ % 2 ? f : u, [ue, Le, Z], [0, 0, 0], [1, 1, 1], !1);
        (at % 2 ? r : l).push(rt);
      };
    for (let ue = -re; ue <= re + 0.01; ue += 0.32) Ge(I.x + ue, Ae), Ge(I.x + ue, ve);
    for (let ue = Ae + 0.3; ue < ve - 0.1; ue += 0.3) Ge(I.x - re, ue), Ge(I.x + re, ue);
  }
  let y = ll(),
    m = o(2831206, 0.5, 0.3);
  n(new C.BoxGeometry(9.2, 2.3, 0.25), new C.MeshStandardMaterial({
    map: y,
    emissive: 16777215,
    emissiveMap: y,
    emissiveIntensity: 0.55,
    roughness: 0.5
  }), [0, 6.1, -4.6]), n(new C.BoxGeometry(9.6, 2.7, 0.18), m, [0, 6.1, -4.75]);
  for (let I of [-4.4, 4.4]) n(new C.CylinderGeometry(0.14, 0.18, 6, 12), m, [I, 3, -4.75]);
  for (let I = 0; I <= 30; I++) {
    let V = -4.6 + I * 9.2 / 30;
    for (let W of [7.4, 4.8]) {
      let Z = n(d, I % 2 ? u : f, [V, W, -4.45], [0, 0, 0], [1.3, 1.3, 1.3], !1);
      (I % 2 ? r : l).push(Z);
    }
  }
  let p = new C.MeshPhysicalMaterial({
    color: 16761404,
    roughness: 0.18,
    metalness: 1,
    clearcoat: 0.6,
    envMapIntensity: 1.2
  });
  n(new C.CylinderGeometry(0.55, 0.65, 2.6, 24), o(2831206, 0.4, 0.3), [0, 1.3 + ht, -2.75]);
  let b = [[0.42, 0], [0.44, 0.06], [0.36, 0.12], [0.16, 0.2], [0.12, 0.36], [0.12, 0.7], [0.22, 0.78], [0.36, 0.86], [0.5, 1.04], [0.6, 1.34], [0.63, 1.52], [0.6, 1.56], [0.55, 1.36], [0.46, 1.1], [0.32, 0.94], [0.2, 0.9]],
    w = new C.Group();
  w.position.set(0, 2.6 + ht, -2.75), t.add(w);
  let M = new C.Mesh(new C.LatheGeometry(b.map(([I, V]) => new C.Vector2(I, V)), 40), p);
  M.castShadow = !0, w.add(M);
  for (let I of [-1, 1]) {
    let V = new C.Mesh(new C.TubeGeometry(new C.CatmullRomCurve3([new C.Vector3(I * 0.55, 1.3, 0), new C.Vector3(I * 0.95, 1.4, 0), new C.Vector3(I * 0.95, 1, 0), new C.Vector3(I * 0.42, 0.8, 0)]), 20, 0.05, 8, !1), p);
    w.add(V);
  }
  let x = new C.Mesh(rl(0.32), p);
  x.position.set(0, 1.95, 0), w.add(x);
  let T = [15028799, 3966688, 15907112, 5226346, 11893759];
  for (let I of [-1, 1]) for (let V = 0; V < 6; V++) {
    let W = 1.5 - V * 0.12;
    n(Zi(W, W, W, 0.12), o(T[(V + (I > 0 ? 2 : 0)) % 5], 0.35), [I * (8.2 + Math.sin(V * 1.7) * 0.25), ht + 0.2 + V * 1.3 + W / 2 - 0.2, -2.2 + Math.cos(V * 2.1) * 0.25], [0, V * 0.4 * I, 0]);
  }
  let g = [],
    H = new C.SphereGeometry(0.55, 24, 18),
    v = new C.LineBasicMaterial({
      color: 14540253
    }),
    R = [16734830, 4184319, 16765514, 8382554, 11893759, 16751162];
  for (let I of [-1, 1]) for (let V = 0; V < 6; V++) {
    let W = new C.Mesh(H, new C.MeshPhysicalMaterial({
      color: R[(V + (I > 0 ? 3 : 0)) % 6],
      roughness: 0.25,
      clearcoat: 1,
      clearcoatRoughness: 0.1
    }));
    W.scale.set(1, 1.2, 1);
    let Z = new C.Vector3(I * (6.3 + V % 3 * 0.7), 5.6 + V % 2 * 0.9 + Math.floor(V / 3) * 0.5, -3.2 + V % 3 * 0.5);
    W.position.copy(Z), t.add(W);
    let re = new C.Line(new C.BufferGeometry().setFromPoints([new C.Vector3(0, -0.65, 0), new C.Vector3(0, -3.2, 0)]), v);
    W.add(re), g.push({
      mesh: W,
      base: Z,
      ph: V * 1.3 + I
    });
  }
  let z = [],
    D = new C.ConeGeometry(1.9, 14, 24, 1, !0);
  D.translate(0, -7, 0), [[-6, 16773570], [6, 10479871], [-2.5, 16757713], [2.5, 16773570]].forEach(([I, V], W) => {
    let Z = new C.Mesh(D, new C.MeshBasicMaterial({
      color: V,
      transparent: !0,
      opacity: 0.1,
      depthWrite: !1,
      blending: C.AdditiveBlending,
      side: C.DoubleSide
    }));
    Z.position.set(I, 13, 3), t.add(Z), z.push({
      mesh: Z,
      ph: W * 1.7,
      x: I
    });
  });
  let F = 260,
    j = new C.InstancedMesh(new C.PlaneGeometry(0.16, 0.09), new C.MeshBasicMaterial({
      color: 16777215,
      side: C.DoubleSide
    }), F);
  j.instanceMatrix.setUsage(C.DynamicDrawUsage), j.frustumCulled = !1, t.add(j);
  let X = [16765514, 16734830, 4184319, 8382554, 11893759, 16777215, 16751162],
    _ = Array.from({
      length: F
    }, (I, V) => ({
      x: (Math.sin(V * 12.9898) * 0.5 + 0.5) * 18 - 9,
      y: V * 7.31 % 12,
      z: (Math.cos(V * 4.1414) * 0.5 + 0.5) * 10 - 5,
      s: 0.5 + V % 7 * 0.12,
      ph: V * 1.618,
      sp: 0.9 + V % 5 * 0.25
    }));
  _.forEach((I, V) => j.setColorAt(V, s.set(X[V % X.length])));
  let Y = 3,
    te = 48,
    Te = new C.InstancedMesh(new C.SphereGeometry(0.07, 6, 4), new C.MeshBasicMaterial({
      color: 16777215,
      transparent: !0,
      depthWrite: !1,
      blending: C.AdditiveBlending
    }), Y * te);
  Te.instanceMatrix.setUsage(C.DynamicDrawUsage), Te.frustumCulled = !1, t.add(Te);
  let He = [16765514, 16734830, 4184319, 8382554, 11893759];
  function L(I = 0) {
    let V = Math.floor(I * 4) % 2 === 0;
    u.emissiveIntensity = V ? 2 : 0.25, f.emissiveIntensity = V ? 0.25 : 2, i.emissiveIntensity = 1.1 + Math.sin(I * 3) * 0.4;
    for (let W of z) W.mesh.rotation.z = Math.sin(I * 0.6 + W.ph) * 0.38, W.mesh.rotation.x = 0.2 + Math.sin(I * 0.45 + W.ph * 2) * 0.14, W.mesh.material.opacity = 0.08 + 0.04 * Math.sin(I * 1.3 + W.ph);
    for (let W of g) W.mesh.position.set(W.base.x + Math.sin(I * 0.7 + W.ph) * 0.12, W.base.y + Math.sin(I * 1.1 + W.ph) * 0.18, W.base.z), W.mesh.rotation.z = Math.sin(I * 0.8 + W.ph) * 0.08;
    w.rotation.y = I * 0.6, x.rotation.y = -I * 1.2;
    for (let W = 0; W < F; W++) {
      let Z = _[W],
        re = 11 - (Z.y + I * Z.sp) % 12;
      e.position.set(Z.x + Math.sin(I * 1.3 + Z.ph) * 0.5, re, Z.z + Math.cos(I * 1.1 + Z.ph) * 0.5), e.rotation.set(I * 3 * Z.s + Z.ph, I * 2.2 + Z.ph, Z.ph), e.scale.setScalar(Z.s), e.updateMatrix(), j.setMatrixAt(W, e.matrix);
    }
    j.instanceMatrix.needsUpdate = !0;
    for (let W = 0; W < Y; W++) {
      let re = (I + W * 0.8) % 2.4,
        Ae = Math.floor((I + W * 0.8) / 2.4),
        ve = Math.sin(Ae * 7.7 + W) * 7,
        at = 9.5 + Math.cos(Ae * 3.3 + W) * 1.5,
        Ge = -9,
        ue = Math.min(1, re / 1.1),
        Le = re < 1.4 ? 1 - re / 1.4 : 0,
        rt = He[(Ae + W) % He.length];
      for (let Ce = 0; Ce < te; Ce++) {
        let Fe = Ce * 2.399,
          Ue = Math.acos(1 - 2 * (Ce + 0.5) / te),
          yt = (1 - (1 - ue) * (1 - ue)) * 2.8;
        e.position.set(ve + Math.sin(Ue) * Math.cos(Fe) * yt, at + Math.cos(Ue) * yt - re * re * 0.6, Ge + Math.sin(Ue) * Math.sin(Fe) * yt * 0.5), e.rotation.set(0, 0, 0), e.scale.setScalar(Le > 0 ? Le * 1.4 : 1e-4), e.updateMatrix(), Te.setMatrixAt(W * te + Ce, e.matrix), Te.setColorAt(W * te + Ce, s.set(rt));
      }
    }
    Te.instanceMatrix.needsUpdate = !0, Te.instanceColor && (Te.instanceColor.needsUpdate = !0);
  }
  L(0);
  let U = Ki.map(I => ({
      position: [I.x, ht + I.height + 0.005, I.z],
      yaw: I.rank === 1 ? 0 : I.rank === 2 ? 0.14 : -0.14
    })),
    q = !1;
  return {
    group: t,
    spots: U,
    update: L,
    dispose() {
      q || (q = !0, t.removeFromParent(), t.traverse(I => {
        I.geometry?.dispose?.();
      }));
    }
  };
}
import * as we from "./vendor/001-three-0.185.js";
var cl = "attribute vec3 trailTint;attribute float trailFade;varying vec3 tint;varying float fade;void main(){tint=trailTint;fade=trailFade;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
  hl = `varying vec3 tint;varying float fade;void main(){gl_FragColor=vec4(tint,fade*.58);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
  dl = "attribute float instanceFade;attribute vec3 smokeTint;varying vec2 vu;varying float fade;varying vec3 tint;void main(){vu=uv;fade=instanceFade;tint=smokeTint;vec4 center=modelViewMatrix*instanceMatrix*vec4(0.0,0.0,0.0,1.0);center.xy+=position.xy*vec2(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz));gl_Position=projectionMatrix*center;}",
  fl = `varying vec2 vu;varying float fade;varying vec3 tint;void main(){float r=length(vu-.5)*2.0;float a=exp(-r*r*2.8)*(1.0-smoothstep(.5,1.0,r))*fade*.25;gl_FragColor=vec4(tint,a);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
  Is = new we.Object3D(),
  ho = class {
    constructor(e) {
      this.capacity = 1536, this.cursor = 0, this.life = new Float32Array(this.capacity), this.last = Array.from({
        length: 8
      }, () => [null, null]), this.smoke = [], this.emission = Array(8).fill(0), this.time = 0;
      let s = new we.BufferGeometry();
      s.setAttribute("position", new we.BufferAttribute(new Float32Array(this.capacity * 18), 3).setUsage(we.DynamicDrawUsage)), s.setAttribute("trailTint", new we.BufferAttribute(new Float32Array(this.capacity * 18), 3)), s.setAttribute("trailFade", new we.BufferAttribute(new Float32Array(this.capacity * 6), 1).setUsage(we.DynamicDrawUsage)), this.trails = new we.Mesh(s, new we.ShaderMaterial({
        vertexShader: cl,
        fragmentShader: hl,
        transparent: !0,
        depthWrite: !1,
        polygonOffset: !0,
        polygonOffsetFactor: -1,
        side: we.DoubleSide
      })), this.trails.frustumCulled = !1, this.trails.renderOrder = 1, e.add(this.trails);
      let o = new we.PlaneGeometry(1, 1);
      o.setAttribute("instanceFade", new we.InstancedBufferAttribute(new Float32Array(192), 1).setUsage(we.DynamicDrawUsage)), o.setAttribute("smokeTint", new we.InstancedBufferAttribute(new Float32Array(576), 3).setUsage(we.DynamicDrawUsage)), this.clouds = new we.InstancedMesh(o, new we.ShaderMaterial({
        vertexShader: dl,
        fragmentShader: fl,
        transparent: !0,
        depthWrite: !1
      }), 192), this.clouds.instanceMatrix.setUsage(we.DynamicDrawUsage), this.clouds.frustumCulled = !1, this.clouds.count = 0, e.add(this.clouds);
    }
    reset() {
      this.life.fill(0), this.trails.geometry.attributes.trailFade.array.fill(0), this.trails.geometry.attributes.trailFade.needsUpdate = !0, this.last = Array.from({
        length: 8
      }, () => [null, null]), this.emission.fill(0), this.smoke = [], this.clouds.count = 0;
    }
    stamp(e, s, o) {
      let n = this.cursor++ % this.capacity,
        i = s.x - e.x,
        a = s.z - e.z,
        r = Math.hypot(i, a) || 1,
        l = a / r * 0.105,
        c = -i / r * 0.105,
        h = [[e.x + l, e.y, e.z + c], [e.x - l, e.y, e.z - c], [s.x + l, s.y, s.z + c], [e.x - l, e.y, e.z - c], [s.x - l, s.y, s.z - c], [s.x + l, s.y, s.z + c]],
        d = this.trails.geometry.attributes.position.array,
        u = this.trails.geometry.attributes.trailTint.array;
      for (let f = 0; f < 6; f++) d.set(h[f], n * 18 + f * 3), u.set(o ? [0.16, 0.105, 0.065] : [0.035, 0.047, 0.051], n * 18 + f * 3);
      this.life[n] = 9;
    }
    sync(e, s, o, {
      menu: n = !1
    } = {}) {
      this.time += o;
      let i = !n && e.phase !== "results";
      this.trails.visible = this.clouds.visible = i;
      let a = this.trails.geometry.attributes.trailFade.array;
      for (let d = 0; d < this.capacity; d++) {
        this.life[d] = Math.max(0, this.life[d] - o);
        let u = Math.min(1, this.life[d] / 2);
        for (let f = 0; f < 6; f++) a[d * 6 + f] = u;
      }
      let r = e.mapId === "backyard";
      for (let d of e.cars) {
        if (!(i && !d.finished && !d.airborne && d.protect <= 0 && Math.abs(d.speed) > 10 && (d.wasDrifting || d.braking || Math.abs(d.sideSpeed) > 3.5)) || !s[d.id]) {
          this.last[d.id] = [null, null], this.emission[d.id] = 0;
          continue;
        }
        let f = s[d.id].group.position,
          y = s[d.id].group.rotation.y,
          m = Math.sin(y),
          p = Math.cos(y);
        this.emission[d.id] += o;
        for (let b = 0; b < 2; b++) {
          let w = b ? 0.67 : -0.67,
            M = {
              x: f.x + p * w - m * 0.9,
              y: d.y + 0.079,
              z: f.z - m * w - p * 0.9
            },
            x = this.last[d.id][b],
            T = x ? Math.hypot(M.x - x.x, M.z - x.z) : 0;
          if (x && T > 0.12 && T < 2.8 ? (this.stamp(x, M, r), this.last[d.id][b] = M) : (!x || T >= 2.8) && (this.last[d.id][b] = M), this.emission[d.id] >= 0.045) {
            let g = Math.sin(e.tick * 1.27 + d.id * 4 + b);
            this.smoke.push({
              ...M,
              y: M.y + 0.18,
              vx: -m * 0.7 + g * 0.3,
              vy: 0.5 + Math.abs(g) * 0.2,
              vz: -p * 0.7,
              life: r ? 0.8 : 0.7,
              max: r ? 0.8 : 0.7,
              tint: r ? [0.55, 0.44, 0.3] : [0.66, 0.69, 0.69]
            });
          }
        }
        this.emission[d.id] >= 0.045 && (this.emission[d.id] = 0);
      }
      this.smoke = this.smoke.filter(d => d.life > 0).slice(-192);
      let l = this.clouds.geometry.attributes.instanceFade.array,
        c = this.clouds.geometry.attributes.smokeTint.array,
        h = 0;
      for (let d of this.smoke) {
        d.life -= o, d.x += d.vx * o, d.y += d.vy * o, d.z += d.vz * o;
        let u = Math.max(0, d.life / d.max),
          f = 0.35 + (1 - u) * 1.4;
        Is.position.set(d.x, d.y, d.z), Is.rotation.set(0, 0, 0), Is.scale.set(f, f, 1), Is.updateMatrix(), this.clouds.setMatrixAt(h, Is.matrix), l[h] = Math.sin(u * Math.PI) * 0.9, c.set(d.tint, h * 3), h++;
      }
      this.clouds.count = i ? h : 0, this.clouds.instanceMatrix.needsUpdate = !0, this.clouds.geometry.attributes.instanceFade.needsUpdate = !0, this.clouds.geometry.attributes.smokeTint.needsUpdate = !0;
      for (let d of ["position", "trailTint", "trailFade"]) this.trails.geometry.attributes[d].needsUpdate = !0;
    }
  };
import * as K from "./vendor/001-three-0.185.js";
var ae = new K.Object3D(),
  uo = new K.Color();
function ea(t) {
  return () => (t = Math.imul(t, 1664525) + 1013904223 >>> 0, t / 4294967296);
}
function ul(t, e, s, o, n) {
  if (We(t, s, o, null, 0).distance < t.width / 2 + n) return !1;
  for (let i of e.shortcuts) for (let a of i.samples) if (Math.hypot(a.x - s, a.z - o) < i.width / 2 + n) return !1;
  return !0;
}
function fo(t, e, s, o, n = 10) {
  let i = ea(o),
    a = t.bounds,
    r = [];
  for (let l = 0; l < 400 && r.length < s; l++) {
    let c = a.minX + i() * (a.maxX - a.minX),
      h = a.minZ + i() * (a.maxZ - a.minZ);
    ul(t, e, c, h, n) && r.push({
      x: c,
      z: h,
      r: i()
    });
  }
  return r;
}
function os(t, e, s, o, {
  castShadow: n = !1,
  colors: i = !1
} = {}) {
  let a = new K.InstancedMesh(e, s, o);
  if (a.instanceMatrix.setUsage(K.DynamicDrawUsage), a.frustumCulled = !1, a.castShadow = n, i) for (let r = 0; r < o; r++) a.setColorAt(r, uo.set(16777215));
  return t.add(a), a;
}
function Qi() {
  let t = new K.BufferGeometry();
  return t.setAttribute("position", new K.Float32BufferAttribute([0, 0, -0.4, 1.1, 0, 0.2, 0.1, 0, 0.7, 0, 0, -0.4, -0.1, 0, 0.7, -1.1, 0, 0.2], 3)), t.computeVertexNormals(), t;
}
function pl() {
  let t = new K.BufferGeometry();
  return t.setAttribute("position", new K.Float32BufferAttribute([0, 0, 1.6, -1.2, 0.05, -1, 0, -0.25, -0.7, 0, 0, 1.6, 0, -0.25, -0.7, 1.2, 0.05, -1], 3)), t.computeVertexNormals(), t;
}
var po = class {
  constructor(e, s) {
    this.group = new K.Group(), e.add(this.group), this.mapId = s, this.kind = Ze(s), this.time = 0;
    let o = ee(s),
      n = le(s),
      i = this.group,
      a = ea(57 + this.kind.length);
    if (this.track = o, this.buildBunting(o), this.kind === "bedroom" && (this.planes = os(i, pl(), new K.MeshStandardMaterial({
      color: 16183780,
      roughness: 0.7,
      side: K.DoubleSide
    }), 7, {
      colors: !0
    }), this.planeData = Array.from({
      length: 7
    }, (r, l) => ({
      cx: o.bounds.minX + a() * (o.bounds.maxX - o.bounds.minX),
      cz: o.bounds.minZ + a() * (o.bounds.maxZ - o.bounds.minZ),
      r: 30 + a() * 60,
      h: 16 + a() * 18,
      sp: (0.12 + a() * 0.12) * (l % 2 ? 1 : -1),
      ph: a() * 6.3
    })), ["#f6f1e4", "#f2c0b0", "#b9dbe6", "#f4dfa0", "#f6f1e4", "#cfe8c4", "#f6f1e4"].forEach((r, l) => this.planes.setColorAt(l, uo.set(r)))), this.kind === "kitchen" && (this.steamSpots = fo(o, n, 7, 91, 12), this.steam = os(i, new K.SphereGeometry(1, 10, 8), new K.MeshBasicMaterial({
      color: 16777215,
      transparent: !0,
      opacity: 0.18,
      depthWrite: !1
    }), this.steamSpots.length * 6)), this.kind === "backyard") {
      this.flies = os(i, Qi(), new K.MeshStandardMaterial({
        color: 16777215,
        roughness: 0.6,
        side: K.DoubleSide,
        emissive: 2232576
      }), 18, {
        colors: !0
      }), this.flyData = fo(o, n, 18, 33, 6).map((l, c) => ({
        ...l,
        h: 2 + l.r * 5,
        ph: c * 1.7
      }));
      let r = ["#f2b33d", "#e8772e", "#f6f1e4", "#7fb7e6", "#e9a0ae"];
      for (let l = 0; l < 18; l++) this.flies.setColorAt(l, uo.set(r[l % r.length]));
      this.birds = os(i, Qi(), new K.MeshStandardMaterial({
        color: 2962488,
        roughness: 0.8,
        side: K.DoubleSide
      }), 5), this.birdData = Array.from({
        length: 5
      }, (l, c) => ({
        r: 60 + c * 25,
        h: 45 + c * 6,
        sp: 0.08 + c * 0.015,
        ph: c * 1.2
      }));
    }
    if (this.kind === "bathroom" && (this.bubbles = os(i, new K.SphereGeometry(1, 20, 14), new K.MeshPhysicalMaterial({
      color: 16777215,
      roughness: 0.05,
      metalness: 0,
      transmission: 0.9,
      thickness: 0.2,
      iridescence: 1,
      iridescenceIOR: 1.3,
      transparent: !0,
      opacity: 0.55,
      depthWrite: !1
    }), 40), this.bubbleSpots = fo(o, n, 10, 71, 8), this.bubbleData = Array.from({
      length: 40
    }, (r, l) => ({
      spot: l % this.bubbleSpots.length,
      ph: a() * 10,
      size: 0.6 + a() * 1.6,
      drift: a() * 6.3,
      speed: 1.5 + a() * 2
    }))), this.kind === "garage") {
      let r = fo(o, n, 6, 45, 8);
      this.beaconSpots = r;
      let l = new K.Mesh(new K.CylinderGeometry(0.35, 0.45, 7, 10), new K.MeshStandardMaterial({
        color: 3818054,
        roughness: 0.5,
        metalness: 0.4
      }));
      for (let c of r) {
        let h = l.clone();
        h.position.set(c.x, 3.5, c.z), h.castShadow = !0, i.add(h);
        let d = new K.Mesh(new K.CylinderGeometry(0.9, 0.9, 1.2, 16), new K.MeshStandardMaterial({
          color: 16753210,
          emissive: 16742938,
          emissiveIntensity: 1.2,
          transparent: !0,
          opacity: 0.85
        }));
        d.position.set(c.x, 7.6, c.z), i.add(d);
      }
      this.beams = os(i, new K.ConeGeometry(2.4, 9, 16, 1, !0).translate(0, -4.5, 0).rotateZ(Math.PI / 2), new K.MeshBasicMaterial({
        color: 16757322,
        transparent: !0,
        opacity: 0.22,
        depthWrite: !1,
        blending: K.AdditiveBlending,
        side: K.DoubleSide
      }), r.length * 2);
    }
  }
  buildBunting(e) {
    let s = e.width / 2,
      o = ["#c4553f", "#3f7f8c", "#d8a640", "#6f5aa8", "#5b9a56", "#e9a0ae", "#f6f1e4"],
      n = new K.BufferGeometry();
    n.setAttribute("position", new K.Float32BufferAttribute([-0.45, 0, 0, 0.45, 0, 0, 0, -0.8, 0], 3)), n.computeVertexNormals();
    let i = [];
    for (let r of [-1, 1]) for (let l = -30; l < 70; l += 1.2) i.push({
      p: G(e, l, r * (s + 0.5)),
      i: i.length
    });
    let a = new K.InstancedMesh(n, new K.MeshStandardMaterial({
      color: 16777215,
      side: K.DoubleSide,
      roughness: 0.8
    }), i.length);
    i.forEach(({
      p: r,
      i: l
    }) => {
      ae.position.set(r.x, r.y + 2.25 + Math.sin(l * 0.5) * 0.12, r.z), ae.rotation.set(0, r.yaw + Math.PI / 2, 0), ae.scale.setScalar(1), ae.updateMatrix(), a.setMatrixAt(l, ae.matrix), a.setColorAt(l, uo.set(o[l % o.length]));
    }), this.group.add(a);
  }
  update(e, s) {
    this.time += e;
    let o = this.time;
    if (this.planes && (this.planeData.forEach((n, i) => {
      let a = n.ph + o * n.sp;
      ae.position.set(n.cx + Math.cos(a) * n.r, n.h + Math.sin(o * 0.7 + i) * 2.5, n.cz + Math.sin(a) * n.r), ae.rotation.set(Math.sin(o + i) * 0.15, -a + (n.sp > 0 ? Math.PI : 0), Math.sign(n.sp) * 0.35), ae.scale.setScalar(2.2), ae.updateMatrix(), this.planes.setMatrixAt(i, ae.matrix);
    }), this.planes.instanceMatrix.needsUpdate = !0), this.steam) {
      let n = 0;
      for (let i of this.steamSpots) for (let a = 0; a < 6; a++) {
        let r = (o * 0.35 + a / 6 + i.r) % 1;
        ae.position.set(i.x + Math.sin(o + a * 2) * r * 1.5, 2 + r * 14, i.z + Math.cos(o * 0.8 + a) * r * 1.5), ae.rotation.set(0, 0, 0), ae.scale.setScalar((0.8 + r * 3.2) * (1 - r * 0.6)), ae.updateMatrix(), this.steam.setMatrixAt(n++, ae.matrix);
      }
      this.steam.instanceMatrix.needsUpdate = !0;
    }
    if (this.flies) {
      this.flyData.forEach((r, l) => {
        let c = Math.sin(o * 18 + r.ph) * 0.9;
        ae.position.set(r.x + Math.sin(o * 0.4 + r.ph) * 6, r.h + Math.sin(o * 1.3 + r.ph) * 1.2, r.z + Math.cos(o * 0.33 + r.ph) * 6), ae.rotation.set(0, o * 0.4 + r.ph, 0), ae.scale.set(1.2 * Math.max(0.15, Math.abs(Math.cos(c))), 1, 1.2), ae.updateMatrix(), this.flies.setMatrixAt(l, ae.matrix);
      }), this.flies.instanceMatrix.needsUpdate = !0;
      let n = this.track.bounds,
        i = (n.minX + n.maxX) / 2,
        a = (n.minZ + n.maxZ) / 2;
      this.birdData.forEach((r, l) => {
        let c = r.ph + o * r.sp;
        ae.position.set(i + Math.cos(c) * r.r, r.h, a + Math.sin(c) * r.r), ae.rotation.set(0, -c, 0), ae.scale.set(3 * Math.max(0.2, Math.abs(Math.cos(o * 6 + l))), 3, 3), ae.updateMatrix(), this.birds.setMatrixAt(l, ae.matrix);
      }), this.birds.instanceMatrix.needsUpdate = !0;
    }
    this.bubbles && (this.bubbleData.forEach((n, i) => {
      let a = this.bubbleSpots[n.spot],
        r = (o * n.speed * 0.12 + n.ph) % 1;
      ae.position.set(a.x + Math.sin(o * 0.9 + n.drift) * 3 * r, 1 + r * 22, a.z + Math.cos(o * 0.7 + n.drift) * 3 * r), ae.rotation.set(0, 0, 0), ae.scale.setScalar(n.size * (r < 0.9 ? 1 : (1 - r) * 10)), ae.updateMatrix(), this.bubbles.setMatrixAt(i, ae.matrix);
    }), this.bubbles.instanceMatrix.needsUpdate = !0), this.beams && (this.beaconSpots.forEach((n, i) => {
      for (let a = 0; a < 2; a++) ae.position.set(n.x, 7.6, n.z), ae.rotation.set(0, o * 4 + i + a * Math.PI, 0), ae.scale.setScalar(1), ae.updateMatrix(), this.beams.setMatrixAt(i * 2 + a, ae.matrix);
    }), this.beams.instanceMatrix.needsUpdate = !0);
  }
  setVisible(e) {
    this.group.visible = e;
  }
};
var xo = Object.freeze({
    nitro: {
      name: "Nitro",
      color: "#14c8f5",
      icon: "bolt",
      help: "2-second burst of speed"
    },
    pulse: {
      name: "Pulse",
      color: "#ff672e",
      icon: "crosshair",
      help: "Straight energy shot at the rival ahead"
    },
    tracker: {
      name: "Tracker",
      color: "#ff3989",
      icon: "target",
      help: "Homing rocket: blows the car it hits into the air"
    },
    shock: {
      name: "Shockwave",
      color: "#a366ff",
      icon: "wave",
      help: "Knocks nearby rivals aside"
    },
    mine: {
      name: "Mine",
      color: "#ffc02d",
      icon: "mine",
      help: "Electric trap dropped behind you"
    },
    shield: {
      name: "Shield",
      color: "#36d8c8",
      icon: "shield",
      help: "Blocks two hits for 6 seconds. In 2v2 your teammate is shielded too"
    },
    oil: {
      name: "Oil Slick",
      color: "#c08a4a",
      icon: "mine",
      help: "Slippery puddle dropped behind you: rivals spin out"
    },
    repair: {
      name: "Repair",
      color: "#81e743",
      icon: "plus",
      help: "Repairs your car body"
    }
  }),
  ia = 4,
  ml = 2,
  dt = t => t < ml ? 0 : 1,
  Dt = Object.freeze(["BLUE", "RED"]),
  aa = Object.freeze({
    4: [10, 6, 3, 1],
    6: [12, 9, 7, 5, 3, 1]
  }),
  $n = aa[4],
  yl = [["NOVA", "MILO", "JUNE"], ["BOLT", "VEX", "PIXEL"]],
  fc = Object.freeze(["NOVA", "MILO", "BOLT", "VEX"]),
  wo = 3,
  bl = 10,
  In = Object.freeze({
    all: ["nitro", "pulse", "tracker", "shock", "mine", "shield", "repair", "oil"],
    nitro: ["nitro"],
    rockets: ["pulse", "tracker"]
  }),
  An = Object.freeze({
    easy: {
      speed: 1.065,
      corner: 25.5,
      fire: 0.8,
      shortcut: 3,
      catchup: 1.1,
      top: 0.8
    },
    normal: {
      speed: 1.1,
      corner: 27.5,
      fire: 0.95,
      shortcut: 2,
      catchup: 1.12,
      top: 1.8
    },
    hard: {
      speed: 1.14,
      corner: 29.5,
      fire: 1,
      shortcut: 2,
      catchup: 1.14,
      top: 2.9
    }
  }),
  Ft = 33,
  On = 45,
  Gn = 23,
  gl = 31.2,
  Ln = 6,
  xl = 0.95,
  wl = 1.55,
  Bn = 8,
  Cn = 1.5,
  bo = 0.85,
  Nn = 3.4,
  El = ["YOU", "NOVA", "BOLT", "MILO", "VEX", "JUNE"],
  Dn = Object.freeze({
    nitro: "NEED NITRO!",
    help: "NEED A SHIELD!",
    wait: "WAIT FOR ME!",
    draft: "DRAFT BEHIND ME!"
  }),
  Mt = Object.freeze({
    throttle: 0,
    steer: 0,
    brake: !1,
    drift: !1,
    fire: !1,
    cycle: !1,
    share: !1,
    reset: !1,
    signal: !1,
    slot: 0
  }),
  Ml = Object.keys(xo),
  go = t => t.inventory.filter(Boolean).length;
function ra(t, e) {
  let s = t.inventory.indexOf(null);
  if (s < 0) {
    if (t.inventory.length >= 3) return;
    s = t.inventory.length;
  }
  t.inventory[s] = e, t.inventory[t.selected] || (t.selected = s);
}
function Fn(t, e = !1) {
  if (!(!e && t.inventory[t.selected])) for (let s = 1; s <= 3; s++) {
    let o = (t.selected + s) % 3;
    if (t.inventory[o]) {
      t.selected = o;
      return;
    }
  }
}
function Tl(t) {
  if (!t || typeof t != "object") return {
    ...Mt
  };
  let e = s => typeof s == "number" && Number.isFinite(s);
  return {
    throttle: e(t.throttle) ? Q(t.throttle, -1, 1) : 0,
    steer: e(t.steer) ? Q(t.steer, -1, 1) : 0,
    brake: t.brake === !0,
    drift: t.drift === !0,
    fire: t.fire === !0,
    cycle: t.cycle === !0,
    share: t.share === !0,
    reset: t.reset === !0,
    signal: t.signal === !0,
    slot: [1, 2, 3].includes(t.slot) ? t.slot : 0
  };
}
var jn = Object.freeze(["gloss", "metallic", "matte", "pearl"]);
function Eo(t) {
  if (!t || typeof t != "object") return null;
  let e = i => typeof i == "string" && /^#[0-9a-f]{6}$/i.test(i) ? parseInt(i.slice(1), 16) : Number.isInteger(i) && i >= 0 && i <= 16777215 ? i : null,
    s = e(t.body),
    o = e(t.accent),
    n = e(t.rims);
  return s === null ? null : {
    body: s,
    accent: o ?? 16183523,
    rims: n,
    finish: jn.includes(t.finish) ? t.finish : "gloss"
  };
}
function ns({
  mapId: t = "bedroom",
  humans: e = [0],
  styles: s = [],
  names: o = [],
  paints: n = [],
  seed: i = 1729,
  laps: a = 2,
  matchId: r = "local",
  botSkill: l = "normal",
  powers: c = "all",
  carCount: h = 4,
  ffa: d = !1
} = {}) {
  let u = {
      botSkill: An[l] ? l : "normal",
      powers: In[c] ? c : "all"
    },
    f = In[u.powers],
    y = ee(t),
    m = [],
    p = h === 6 ? 6 : 4,
    b = p / 2;
  for (let g = 0; g < p; g++) {
    let H = d ? g : g < b ? 0 : 1,
      v = d ? g : g - H * b,
      R = d ? g : v * 2 + H,
      z = -7 - Math.floor(R / 2) * 3.9,
      D = (R % 2 ? 1 : -1) * 2.2,
      F = G(y, z, D),
      j = e.includes(g);
    m.push({
      id: g,
      team: H,
      member: v,
      name: j && o[g] || (d ? El[g] : yl[H][v]),
      human: j,
      paint: j ? Eo(n[g]) : null,
      wreck: 0,
      wreckMax: Cn,
      pace: 0,
      hop: 0,
      style: s[g] ?? g % 4,
      x: F.x,
      z: F.z,
      y: F.y,
      yaw: F.yaw,
      s: qe(z, y.length),
      raceS: z,
      lane: D,
      speed: 0,
      sideSpeed: 0,
      health: 100,
      shield: 0,
      shieldHits: 0,
      boost: 0,
      stun: 0,
      protect: 0,
      cooldown: 0,
      resetCooldown: 0,
      driftCharge: 0,
      wasDrifting: !1,
      slipstream: 0,
      inventory: ["nitro", null, null],
      selected: 0,
      nextGate: 1,
      lastCheckpoint: 0,
      lap: 0,
      finished: !1,
      finishTime: null,
      stuck: 0,
      padCooldown: 0,
      hits: 0,
      shares: 0,
      lastAction: 0,
      shortcut: null,
      shortcutLock: 0,
      shortcuts: 0,
      shortcutAttempts: 0,
      shortcutFailures: 0,
      airborne: !1,
      driftTime: 0,
      currentDrift: 0,
      longestDrift: 0,
      blocks: 0,
      impact: 0,
      acceleration: 0,
      steering: 0,
      braking: !1,
      hazardCooldown: 0,
      hazardWarnings: {},
      hazardContacts: {},
      scrape: 0,
      link: 0,
      signal: null,
      signalCooldown: 0
    });
  }
  let w = {
      seed: i >>> 0
    },
    M = [],
    x = Math.max(16, Math.round(y.length / 75)),
    T = (le(t).patches || []).map(g => g.s);
  for (let g = 0; g < x; g++) {
    let H = y.length * (0.035 + g * (0.96 / x));
    for (let v = 0; v < 6 && T.some(R => Math.abs(Ne(H, R, y.length)) < 14); v++) H += 10;
    for (let v = 0; v < 2; v++) {
      let R = G(y, H, (v ? 1 : -1) * 2.8);
      M.push({
        id: M.length,
        x: R.x,
        z: R.z,
        y: R.y,
        s: R.s,
        type: f[Math.floor(la(w) * f.length)],
        timer: 0,
        version: 0
      });
    }
  }
  return {
    version: 5,
    ffa: !!d,
    rules: u,
    matchId: r,
    mapId: t,
    laps: Q(Math.floor(a), 1, 4),
    seed: w.seed,
    phase: "countdown",
    countdown: 3,
    time: 0,
    tick: 0,
    cars: m,
    pickups: M,
    projectiles: [],
    mines: [],
    oils: [],
    effects: [],
    nextEntity: 1,
    eventSeq: 0,
    events: [],
    results: null,
    humanFinishAt: null,
    timeout: Math.max(200, y.length * a / 17 + 35)
  };
}
function la(t) {
  let e = t.seed;
  return e ^= e << 13, e ^= e >>> 17, e ^= e << 5, t.seed = e >>> 0, t.seed / 4294967296;
}
function fe(t, e, s = {}) {
  t.events.push({
    id: ++t.eventSeq,
    type: e,
    time: t.time,
    ...s
  }), t.events.length > 32 && t.events.shift();
}
function ye(t, e, s, o, n, i = 16777215, a = {}) {
  let r = {
    nitro: 1.4,
    pulse: 0.42,
    tracker: 0.75,
    shock: 1,
    mine: 1.1,
    shield: 1.2,
    repair: 1.8,
    share: 1.2,
    hit: 0.65,
    drift: 0.65,
    explosion: 1.3,
    respawn: 0.9,
    pickup: 0.6
  }[e] || 0.65;
  t.effects.push({
    id: t.nextEntity++,
    type: e,
    x: s,
    z: o,
    y: n,
    color: i,
    life: r,
    maxLife: r,
    ...a
  }), t.effects.length > 96 && t.effects.shift();
}
function As(t, e) {
  let s = ee(t.mapId),
    o = 10 + Math.max(0, e.speed) * 0.48,
    n = (e.id % 2 ? 1 : -1) * (e.team ? 1.7 : 2.1),
    i,
    a,
    r,
    l = e.shortcut && gt(t.mapId, e.shortcut.id),
    c = Js(t.mapId, e, 42);
  if (!l) for (let L of le(t.mapId).patches) {
    let U = Ne(L.s, e.s, s.length);
    if (U > 4 && U < 34 && Math.abs(L.lane - n) < L.r + 1.6) {
      let q = s.width / 2 - 1.7;
      n = Q(L.lane + (L.lane > 0 ? -(L.r + 2.2) : L.r + 2.2), -q, q);
      break;
    }
  }
  if (!l) for (let L of t.cars) {
    if (L === e || L.wreck > 0 || L.shortcut || Math.abs(L.y - e.y) > 2) continue;
    let U = Ne(L.s, e.s, s.length),
      q = L.lane || 0;
    if (U > 0 && U < 12 && Math.abs(q - n) < 2.4 && L.speed < e.speed + 3) {
      let I = s.width / 2 - 1.7;
      n = Q(q + (q > 0 ? -3 : 3), -I, I);
      break;
    }
  }
  let h = An[t.rules?.botSkill] || An.normal,
    d = t.cars.filter(L => L.human),
    u = d.length ? Math.max(...d.map(L => L.raceS)) : -1 / 0,
    f = u - e.raceS > 25 ? h.catchup : 1;
  e.pace = h.top * (f > 1 ? 1.5 : 1);
  let y = c && (e.id + e.lap) % h.shortcut === 1 && e.shortcutLock <= 0 && e.health > 45;
  if (l) {
    i = Se(l, e.shortcut.s + Q(3 + e.speed * 0.12, 4, 7));
    let L = Se(l, e.shortcut.s + 3),
      U = Se(l, e.shortcut.s + 8);
    a = Math.abs(Be(U.yaw, L.yaw)) / 5, r = Math.min(27, Math.sqrt(10.5 / (a + 0.006))), l.jump && e.shortcut.s < l.jump.end && e.shortcut.s > l.jump.start - 28 && (r = 28);
  } else {
    if (y) {
      n = c.side * 3.6;
      let L = Ne(c.startS, e.s, s.length);
      i = L < 11 ? Se(c, Math.max(0, 11 - L)) : G(s, e.s + o, n);
    } else i = G(s, e.s + o, n);
    a = Math.max(_s(s, e.s + 7), _s(s, e.s + o)), r = Math.min(gl * h.speed * f, Math.sqrt(h.corner / (a + 0.006)));
  }
  let m = Zs(t.mapId, e, t.time);
  if (m && !l) {
    let L = Ne(m.center.s, e.s, s.length);
    L < 25 && L > 0 && m.phase === "active" && (r = Math.min(r, 15));
  }
  let p = Math.atan2(i.x - e.x, i.z - e.z),
    b = Be(p, e.yaw),
    w = Math.sin(e.yaw),
    M = Math.cos(e.yaw),
    x = t.cars.filter(L => L.team !== e.team && !L.finished && !(L.wreck > 0) && Math.abs(L.y - e.y) < 3),
    T = L => {
      let U = L.x - e.x,
        q = L.z - e.z,
        I = Math.hypot(U, q) || 1;
      return {
        d: I,
        f: (U * w + q * M) / I
      };
    },
    g = x.some(L => T(L).d < 12),
    H = x.some(L => {
      let U = T(L);
      return U.d > 3 && U.d < 85 && U.f > 0.8;
    }),
    v = x.some(L => {
      let U = T(L);
      return U.d < 24 && U.f < -0.6;
    }),
    R = x.some(L => T(L).d < 9.5),
    z = t.projectiles.some(L => L.target === e.id && Math.hypot(L.x - e.x, L.z - e.z) < 32),
    D = e.inventory[e.selected],
    F = (t.tick + e.id * 13) % 45 / 45 < h.fire,
    j = L => L === "nitro" && a < 0.04 && Math.abs(b) < 0.25 || L === "shield" && (z || g && e.health < 75) || L === "repair" && e.health < 65 || L === "shock" && R || (L === "tracker" || L === "pulse") && H || (L === "mine" || L === "oil") && v,
    X = e.cooldown <= 0 && !!D && F && j(D),
    _ = !X && go(e) > 1 && e.inventory.some((L, U) => U !== e.selected && j(L)),
    Y = Mo(t, e),
    te = Y?.signal && t.time - Y.signal.at < 3 ? Y.signal.kind : null,
    He = !!(Y && !Y.finished && go(Y) < 3 && Math.hypot(Y.x - e.x, Y.z - e.z) < 25) && (D === "shield" && (te === "help" || e.health > 70 && Y.health < 55 && Y.shield <= 0) || D === "nitro" && te === "nitro");
  return e.finished ? (r = Math.min(r, 20), {
    ...Mt,
    throttle: e.speed > r + 1 ? 0.1 : 0.8,
    steer: Q(-b * (l ? 3.6 : 1.75), -1, 1),
    brake: e.speed > r + 3
  }) : {
    throttle: e.speed > r + 1 ? 0.1 : 1,
    steer: Q(-b * (l ? 3.6 : 1.75), -1, 1),
    brake: e.speed > r + 3,
    drift: !1,
    fire: X,
    cycle: e.cooldown <= 0 && (_ && t.tick % 12 === e.id % 12 || !!D && !X && t.tick % 105 === e.id),
    share: He && e.cooldown <= 0,
    reset: e.stuck > 3.5
  };
}
function mo(t, e, s = !1) {
  if (!s && e.resetCooldown > 0) return !1;
  let o = ee(t.mapId),
    n = e.lastCheckpoint > 0 ? e.lastCheckpoint * o.length / 8 + 0.9 : 0,
    i = G(o, n, (e.id % 2 ? 1 : -1) * 2.2);
  return e.scrape = 0, e.hop = 0, e.x = i.x, e.z = i.z, e.y = i.y, e.yaw = i.yaw, e.s = i.s, e.raceS = n, e.speed = 0, e.sideSpeed = 0, e.stun = 0, e.protect = 2, e.resetCooldown = 3, e.stuck = 0, e.driftCharge = 0, e.health = Math.max(50, e.health), e.shortcut = null, e.airborne = !1, e.shortcutLock = 3, e.currentDrift = 0, fe(t, "reset", {
    car: e.id
  }), !0;
}
function ca(t, e, s = null) {
  e.wreck > 0 || (e.wreck = Cn, e.wreckMax = Cn, e.speed = 0, e.sideSpeed = 0, e.boost = 0, e.driftCharge = 0, e.shield = 0, e.shieldHits = 0, ye(t, "explosion", e.x, e.z, e.y + 0.8, 16742958, {
    car: e.id,
    impact: !0
  }), fe(t, "explode", {
    car: e.id,
    source: s?.id
  }));
}
function vl(t, e) {
  let s = ee(t.mapId),
    o = e.shortcut && gt(t.mapId, e.shortcut.id),
    n = o ? Se(o, e.shortcut.s, 0, {
      flight: !1
    }) : G(s, e.s, Q(e.lane || 0, -3, 3));
  Object.assign(e, {
    x: n.x,
    z: n.z,
    y: n.y,
    yaw: n.yaw,
    speed: 4,
    sideSpeed: 0,
    airborne: !1,
    hop: 0,
    protect: 1.6,
    stun: 0,
    stuck: 0,
    scrape: 0,
    health: Math.max(e.health, 60)
  }), ye(t, "respawn", n.x, n.z, n.y + 0.4, 9431295, {
    car: e.id
  }), fe(t, "respawn", {
    car: e.id
  });
}
function Pn(t, e, s, o, n, i = 0) {
  return e.finished || e.protect > 0 || e.wreck > 0 || e.team === o.team ? !1 : e.shield > 0 && e.shieldHits > 0 ? (e.shieldHits--, e.blocks++, e.shieldHits || (e.shield = 0), ye(t, "shield", e.x, e.z, e.y + 1, 8580290, {
    car: e.id
  }), fe(t, "blocked", {
    car: e.id
  }), !0) : (e.health = Math.max(0, e.health - s), e.speed *= n === "shock" ? 0.66 : 0.82, e.sideSpeed += i, e.stun = Math.max(e.stun, 0.25), e.impact = 1, o.hits++, ye(t, "hit", e.x, e.z, e.y + 0.7, 16756851, {
    kind: n,
    car: e.id
  }), ye(t, n === "pulse" ? "pulse" : n === "tracker" ? "tracker" : n === "mine" ? "mine" : "shock", e.x, e.z, e.y + 0.7, n === "pulse" ? 16737838 : n === "tracker" ? 16724864 : n === "mine" ? 16761124 : 10114559, {
    impact: !0,
    car: e.id
  }), fe(t, "hit", {
    car: e.id,
    source: o.id,
    kind: n
  }), (n === "tracker" || e.health <= 0) && (e.health <= 0 && fe(t, "wreck", {
    car: e.id
  }), ca(t, e, o)), !0);
}
function ta(t, e) {
  if (e.cooldown > 0 || e.finished || e.stun > 0) return;
  let s = e.inventory[e.selected];
  if (!s) return;
  e.inventory[e.selected] = null, Fn(e), e.cooldown = 0.4;
  let o = Math.sin(e.yaw),
    n = Math.cos(e.yaw);
  if (s === "nitro" && (e.boost = Math.max(e.boost, 2), ye(t, "nitro", e.x, e.z, e.y + 0.8, 1167354, {
    car: e.id,
    yaw: e.yaw
  }), fe(t, "nitro", {
    car: e.id
  })), s === "shield" && (e.shield = 6, e.shieldHits = 2, ye(t, "shield", e.x, e.z, e.y + 1, 3921097, {
    car: e.id
  }), !t.ffa)) for (let i of t.cars) i.id !== e.id && i.team === e.team && !i.finished && !(i.wreck > 0) && (i.shield = Math.max(i.shield, 6), i.shieldHits = Math.max(i.shieldHits, 2), ye(t, "shield", i.x, i.z, i.y + 1, 3921097, {
    car: i.id
  }), fe(t, "team-shield", {
    car: i.id,
    source: e.id
  }));
  if (s === "oil" && ((t.oils || (t.oils = [])).push({
    id: t.nextEntity++,
    owner: e.id,
    team: e.team,
    x: e.x - o * 3.4,
    z: e.z - n * 3.4,
    y: e.y,
    yaw: e.yaw,
    life: 14,
    armed: 0.35,
    hits: []
  }), ye(t, "oil", e.x - o * 3.4, e.z - n * 3.4, e.y + 0.2, 12618314, {
    deploy: !0
  })), s === "repair" && (e.health = Math.min(100, e.health + 45), ye(t, "repair", e.x, e.z, e.y + 1, 8384322, {
    car: e.id
  })), s === "shock") {
    for (let i of t.cars) i.team !== e.team && Math.hypot(i.x - e.x, i.z - e.z) < 11 && Math.abs(i.y - e.y) < 2.3 && Pn(t, i, 24, e, "shock", Math.sign((i.x - e.x) * n - (i.z - e.z) * o) * 6);
    ye(t, "shock", e.x, e.z, e.y + 0.5, 12621823);
  }
  if (s === "mine" && (t.mines.push({
    id: t.nextEntity++,
    owner: e.id,
    team: e.team,
    x: e.x - o * 3,
    z: e.z - n * 3,
    y: e.y,
    life: 12,
    armed: 0.5
  }), ye(t, "mine", e.x - o * 3, e.z - n * 3, e.y + 0.2, 16761124, {
    deploy: !0
  })), s === "pulse" || s === "tracker") {
    let i = null,
      a = 1 / 0;
    if (s === "tracker") for (let r of t.cars) {
      let l = Math.hypot(r.x - e.x, r.z - e.z),
        c = ((r.x - e.x) * o + (r.z - e.z) * n) / (l || 1);
      r.team !== e.team && !r.finished && !(r.wreck > 0) && l < 100 && c > 0.25 && Math.abs(r.y - e.y) < 3 && l < a && (i = r.id, a = l);
    }
    t.projectiles.push({
      id: t.nextEntity++,
      type: s,
      owner: e.id,
      team: e.team,
      x: e.x + o * 2.3,
      z: e.z + n * 2.3,
      y: e.y + 0.8,
      yaw: e.yaw,
      speed: s === "tracker" ? 42 : 56,
      life: s === "tracker" ? 3.6 : 2.35,
      target: i
    }), ye(t, s, e.x + o * 1.6, e.z + n * 1.6, e.y + 0.75, s === "pulse" ? 16737838 : 16724864, {
      car: e.id,
      yaw: e.yaw
    });
  }
  fe(t, "fire", {
    car: e.id,
    kind: s
  });
}
function Rl(t, e) {
  if (e.cooldown > 0) return;
  if (!["nitro", "shield"].includes(e.inventory[e.selected])) {
    let i = e.inventory.findIndex(a => a === "nitro" || a === "shield");
    if (i < 0) return;
    e.selected = i;
  }
  let s = e.inventory[e.selected],
    o = t.cars.filter(i => i.id !== e.id && i.team === e.team && !i.finished && go(i) < 3 && Math.hypot(i.x - e.x, i.z - e.z) < 25 && Math.abs(i.y - e.y) < 3);
  o.sort((i, a) => a.raceS - i.raceS);
  let n = o[0];
  n && (e.inventory[e.selected] = null, Fn(e), ra(n, s), e.cooldown = 0.45, e.shares++, fe(t, "share", {
    car: e.id,
    target: n.id,
    kind: s
  }), ye(t, "share", n.x, n.z, n.y + 1, 6086385));
}
function Mo(t, e) {
  let s = null,
    o = 1 / 0;
  for (let n of t.cars) {
    if (n.id === e.id || n.team !== e.team) continue;
    let i = Math.hypot(n.x - e.x, n.z - e.z) - (n.human ? 20 : 0);
    i < o && (o = i, s = n);
  }
  return s;
}
function Sl(t, e) {
  if (e.signalCooldown > 0 || e.finished || t.ffa) return;
  let s = Mo(t, e),
    o = e.health < 50 && e.shield <= 0 ? "help" : e.inventory.includes("nitro") ? s && s.raceS > e.raceS ? "wait" : "draft" : "nitro";
  e.signal = {
    kind: o,
    at: t.time
  }, e.signalCooldown = 1.5, fe(t, "signal", {
    car: e.id,
    kind: o,
    team: e.team
  });
}
function kl(t, e, s) {
  if (e.shortcut || e.shortcutLock > 0 || e.speed < 7 || e.finished) return;
  let o = ee(t.mapId),
    n = Math.floor(e.raceS / o.length) * o.length;
  if (!(Math.abs(e.raceS - (n + s.s)) > 4)) for (let i of le(t.mapId).shortcuts) {
    if (s.s < i.startS - 3 || s.s > i.startS + 11 || s.lane * i.side < 1.6 || Math.abs(Be(e.yaw, Se(i, 0).yaw)) > 1.05) continue;
    let a = bs(i, e.x, e.z, 0, 18);
    if (!(!a || a.distance > i.width / 2)) {
      e.shortcut = {
        id: i.id,
        s: a.s,
        base: n,
        jumped: !1
      }, e.raceS = n + i.startS + a.s / i.length * (i.endS - i.startS), e.shortcutAttempts++, e.airborne = !1, fe(t, "shortcut-enter", {
        car: e.id,
        name: i.name
      });
      break;
    }
  }
}
function sa(t, e, s) {
  let o = ee(t.mapId),
    n = gt(t.mapId, e.shortcut.id),
    i = e.shortcut.base,
    a = Math.max(i + n.startS - 5, e.lastCheckpoint * o.length / 8 + 0.9),
    r = G(o, a, (e.id % 2 ? 1 : -1) * 2.1);
  Object.assign(e, {
    x: r.x,
    z: r.z,
    y: r.y,
    yaw: r.yaw,
    s: r.s,
    raceS: a,
    lane: (e.id % 2 ? 1 : -1) * 2.1,
    speed: 7,
    sideSpeed: 0,
    shortcut: null,
    airborne: !1,
    shortcutLock: 3,
    protect: 1.2,
    stuck: 0,
    impact: 0.65
  }), e.shortcutFailures++, fe(t, "shortcut-miss", {
    car: e.id,
    reason: s
  }), ye(t, "landing", r.x, r.z, r.y + 0.1, 16761719, {
    car: e.id
  });
}
function Hl(t, e, s) {
  let o = gt(t.mapId, e.shortcut.id),
    n = e.shortcut.s,
    i = bs(o, e.x, e.z, n, 22);
  if (!i || i.distance > o.width / 2 + 4) return sa(t, e, "Left the narrow route"), {
    ds: 0,
    recovered: !0
  };
  let a = o.width / 2 - 0.7;
  if (Math.abs(i.lane) > a && !e.airborne) {
    let m = Math.abs(i.lane) - a,
      p = Se(o, i.s);
    e.x -= p.tz * Math.sign(i.lane) * m, e.z += p.tx * Math.sign(i.lane) * m, e.sideSpeed *= -0.15, e.speed *= Math.exp(-2.2 * s), i.lane = Math.sign(i.lane) * a;
  }
  let r = i.s - n;
  if (Math.abs(r) > Math.abs(e.speed) * s + 1.1) return sa(t, e, "Rejoined the main road"), {
    ds: 0,
    recovered: !0
  };
  let l = o.jump;
  l && !e.shortcut.jumped && i.s >= l.start && i.s < l.end && (e.shortcut.jumped = e.speed >= l.minSpeed ? "air" : "ride", e.shortcut.jumped === "air" && fe(t, "jump", {
    car: e.id
  }));
  let c = e.airborne,
    h = Se(o, i.s),
    d = !!l && i.s > l.start && i.s < l.end,
    u = d && e.shortcut.jumped === "air";
  e.shortcut.s = i.s, e.lane = i.lane, e.y = h.y + (u ? Math.sin((i.s - l.start) / (l.end - l.start) * Math.PI) * 1.7 : 0), e.airborne = u;
  let f = e.shortcut.base + o.startS + i.s / o.length * (o.endS - o.startS),
    y = r * (o.endS - o.startS) / o.length;
  return e.raceS += y, e.s = qe(f, ee(t.mapId).length), c && !e.airborne && (e.impact = 0.3, ye(t, "landing", e.x, e.z, e.y + 0.1, 13812909, {
    car: e.id
  }), fe(t, "landing", {
    car: e.id
  })), i.s >= o.length - 1.4 && r > 0 && (e.shortcuts++, e.shortcutLock = 2, e.shortcut = null, e.airborne = !1, fe(t, "shortcut", {
    car: e.id,
    name: o.name
  })), {
    ds: y,
    recovered: !1
  };
}
function zl(t, e) {
  for (let s of le(t.mapId).hazards) {
    let o = Yt(t.mapId, s, t.time);
    for (let n of t.cars) {
      if (n.finished || n.shortcut || n.airborne || n.wreck > 0) continue;
      let i = Math.hypot(n.x - o.center.x, n.z - o.center.z),
        a = s.id;
      if (o.phase !== "idle" && i < 65 && Math.abs(n.y - o.center.y) < 2 && n.hazardWarnings[a] !== o.cycle && (n.hazardWarnings[a] = o.cycle, fe(t, "hazard-warning", {
        car: n.id,
        kind: s.type
      })), o.phase !== "active") {
        n.hazardContacts[a] = !1;
        continue;
      }
      let r = Math.abs(n.y - o.y) < 1.5 && (s.type === "sprinkler" ? ha(n.x, n.z, o.pivot.x, o.pivot.z, o.jetEnd.x, o.jetEnd.z) < 1.15 : Math.hypot(n.x - o.x, n.z - o.z) < o.radius + 0.8),
        l = n.hazardContacts[a];
      if (n.hazardContacts[a] = r, !r || l || n.hazardCooldown > 0 || n.protect > 0) continue;
      if (n.hazardCooldown = 1.1, n.shield > 0 && n.shieldHits > 0) {
        n.shieldHits--, n.blocks++, n.shieldHits === 0 && (n.shield = 0), ye(t, "shield", n.x, n.z, n.y + 0.8, 3594440, {
          car: n.id
        }), fe(t, "blocked", {
          car: n.id
        });
        continue;
      }
      let c = s.type === "sprinkler";
      n.health = Math.max(0, n.health - (c ? 6 : 14)), n.speed *= c ? 0.8 : 0.63, n.stun = Math.max(n.stun, c ? 0.18 : 0.32), n.sideSpeed += s.side * (c ? 2.5 : 4), n.impact = c ? 0.35 : 1, ye(t, "hazard", n.x, n.z, n.y + 0.5, c ? 6671587 : 15387022, {
        kind: s.type,
        car: n.id
      }), fe(t, "hazard-hit", {
        car: n.id,
        kind: s.type
      }), n.health <= 0 && (fe(t, "wreck", {
        car: n.id
      }), ca(t, n));
    }
  }
}
function Il(t, e, s, o) {
  let n = e.speed;
  for (let g of ["shield", "boost", "stun", "protect", "cooldown", "resetCooldown", "padCooldown", "shortcutLock", "hazardCooldown", "signalCooldown", "slick"]) e[g] = Math.max(0, (e[g] || 0) - o);
  if (e.impact = Math.max(0, e.impact - o * 3), e.steering = s.steer, e.braking = s.brake, e.wreck > 0) {
    e.wreck = Math.max(0, e.wreck - o), e.speed = 0, e.sideSpeed = 0, e.stuck = 0, e.scrape = 0, e.wreck === 0 && vl(t, e);
    return;
  }
  s.reset && mo(t, e), s.cycle && Fn(e, !0), s.share && Rl(t, e), s.slot && e.inventory[s.slot - 1] && e.cooldown <= 0 ? (e.selected = s.slot - 1, ta(t, e)) : s.fire && ta(t, e), s.signal && Sl(t, e);
  let i = ee(t.mapId),
    a = s.drift && e.speed > 9 && Math.abs(s.steer) > 0.18 && e.stun <= 0 && !e.airborne;
  a ? (e.driftCharge = Math.min(1.8, e.driftCharge + o * 0.9), e.driftTime += o, e.currentDrift += o, e.longestDrift = Math.max(e.longestDrift, e.currentDrift)) : e.currentDrift = 0, e.wasDrifting && !a && e.driftCharge > 0.28 ? (e.boost = Math.max(e.boost, Math.min(1.25, e.driftCharge)), ye(t, "drift", e.x, e.z, e.y + 0.2, 6149610), e.driftCharge = 0) : a || (e.driftCharge = Math.max(0, e.driftCharge - o * 2)), e.wasDrifting = a;
  let r = !e.shortcut && !e.airborne ? bi(t.mapId, e) : null;
  if (r) {
    let g = r.kind === "mud" || r.kind === "jam";
    g ? e.speed *= Math.exp(-1.9 * o) : e.slick = Math.max(e.slick || 0, 0.6), e.lastPatch !== r.id && (e.lastPatch = r.id, e.patchHits = (e.patchHits || 0) + 1, ye(t, "splash", e.x, e.z, e.y + 0.2, g ? 8017460 : r.kind === "oil" ? 2762274 : 16777215, {
      kind: r.kind,
      car: e.id
    }), fe(t, "splash", {
      car: e.id,
      kind: r.kind
    }));
  } else e.lastPatch = null;
  e.slip > 0 && (e.slip = Math.max(0, e.slip - o), s = {
    ...s,
    steer: s.steer * 0.2,
    drift: !1
  }, e.sideSpeed += e.slipDir * Math.sin(e.slip * 9) * 9 * o, e.speed *= Math.exp(-0.7 * o));
  let l = e.stun > 0 ? Math.min(0.3, s.throttle) : s.throttle,
    c = (e.boost > 0 ? On : Ft + (e.slipstream > 0 ? 2 : 0)) + (e.human ? 0 : e.pace || 0),
    h = l >= 0 ? l * Gn : l * 24;
  s.brake && (h -= e.speed > 0 ? 32 : -15), e.boost > 0 && (h += 23), s.throttle || (h -= Math.sign(e.speed) * 3.2), h -= e.speed * 0.12, e.speed = Q(e.speed + h * o, -6, c);
  let d = e.slick > 0,
    u = -s.steer * (0.35 + Math.min(Math.abs(e.speed) / 19, 1) * 1.22) * Math.min(Math.abs(e.speed) / 4, 1) * (a ? 1.12 : 1) * (e.airborne ? 0.42 : 1) * (d ? 0.55 : 1) * o * Math.sign(e.speed || 1);
  e.yaw += u, e.sideSpeed = (e.sideSpeed - u * e.speed * (a ? 0.65 : d ? 0.55 : 0.1)) * Math.exp(-(a ? 2 : d ? 1.4 : 10) * o);
  let f = Math.sin(e.yaw),
    y = Math.cos(e.yaw),
    m = y,
    p = -f;
  e.x += (f * e.speed + m * e.sideSpeed) * o, e.z += (y * e.speed + p * e.sideSpeed) * o;
  let b = null,
    w = 0,
    M = !1,
    x = !1;
  if (e.shortcut || (b = We(i, e.x, e.z, e.s, e.y, 42), kl(t, e, b)), e.shortcut) {
    let g = Hl(t, e, o);
    w = g.ds, M = g.recovered;
  } else if (!M) {
    let g = i.width / 2 - 0.95;
    if (Math.abs(b.lane) > g) {
      x = !0;
      let H = Math.abs(b.lane) - g;
      e.x -= b.tz * Math.sign(b.lane) * H, e.z += b.tx * Math.sign(b.lane) * H, e.sideSpeed *= -0.12, e.speed *= Math.exp(-2.9 * o), e.speed > 13 && e.impact < 0.1 && H > 0.04 && (e.impact = 0.5, ye(t, "hit", e.x, e.z, e.y + 0.3, 16760970, {
        kind: "wall",
        car: e.id
      }), fe(t, "bump", {
        car: e.id
      })), b = We(i, e.x, e.z, e.s, e.y, 42);
    }
    if (w = Ne(b.s, e.s, i.length), Math.abs(w) < Math.abs(e.speed) * o + 1.1 && (e.raceS += w), e.s = b.s, e.lane = b.lane, e.y = b.y, e.airborne = !1, e.hop > 0) {
      e.hop = Math.max(0, e.hop - o);
      let H = 1 - e.hop / bo;
      e.y = b.y + Math.sin(H * Math.PI) * Nn, e.airborne = e.hop > 0, e.hop === 0 && (e.boost = Math.max(e.boost, 0.6), e.impact = 0.35, ye(t, "landing", e.x, e.z, e.y + 0.1, 13812909, {
        car: e.id
      }), fe(t, "landing", {
        car: e.id
      }));
    } else if (e.speed > 12) {
      for (let H of le(t.mapId).ramps) if (Math.abs(Ne(e.s, H, i.length)) < 1.8) {
        e.hop = bo, fe(t, "jump", {
          car: e.id
        }), ye(t, "drift", e.x, e.z, e.y + 0.2, 16765562);
        break;
      }
    }
  }
  e.acceleration = Q((e.speed - n) / (o || 1), -40, 30), e.stuck = s.throttle > 0.2 && Math.abs(w) / (o || 1) < 0.8 ? e.stuck + o : 0, e.stuck > 5 && mo(t, e, !0), e.scrape = x && Math.abs(e.speed) < 9 ? e.scrape + o : Math.max(0, e.scrape - o * 2), e.scrape > 3 && mo(t, e, !0), b && b.distance > i.width + 5 && !e.shortcut && mo(t, e, !0);
  let T = e.nextGate * i.length / 8;
  if (!M && e.raceS >= T && e.raceS < T + 5 && w > 0) {
    e.lastCheckpoint = e.nextGate, e.nextGate++;
    let g = Math.floor(e.lastCheckpoint / 8);
    if (g > e.lap) {
      let H = t.time - (e.lapStart || 0);
      H > 1 && (e.bestLap = Math.min(e.bestLap || 1 / 0, H)), e.lapStart = t.time;
    }
    e.lap = g;
  }
  if (!e.finished && e.lastCheckpoint >= t.laps * 8) {
    e.finished = !0, e.finishTime = t.time, e.place = t.cars.filter(H => H.finished).length;
    let g = G(i, 0);
    ye(t, "finish", g.x, g.z, g.y, 16765514, {
      car: e.id,
      place: e.place,
      yaw: g.yaw,
      width: i.width
    }), fe(t, "finish", {
      car: e.id,
      time: t.time,
      place: e.place
    });
  }
  if (!e.shortcut) for (let g of i.boosts) Math.abs(Ne(e.s, g * i.length, i.length)) < 2.2 && e.padCooldown <= 0 && (e.boost = Math.max(e.boost, 0.8), e.padCooldown = 1, ye(t, "drift", e.x, e.z, e.y + 0.2, 7071985));
}
function oa(t, e, s) {
  let o = Math.sin(t.yaw),
    n = Math.cos(t.yaw);
  return wl * Math.abs(e * o + s * n) + xl * Math.abs(e * n - s * o);
}
function Al(t, e) {
  let s = t.cars.length;
  for (let o = 0; o < 2; o++) for (let n = 0; n < s; n++) for (let i = n + 1; i < s; i++) {
    let a = t.cars[n],
      r = t.cars[i];
    if (a.protect > 0 || r.protect > 0 || a.wreck > 0 || r.wreck > 0 || Math.abs(a.y - r.y) > 1.8) continue;
    let l = r.x - a.x,
      c = r.z - a.z;
    if (l * l + c * c > 16) continue;
    Math.abs(l) + Math.abs(c) < 1e-4 && (l = 0.01, c = 0.01);
    let h = 1 / 0,
      d = 0,
      u = 0;
    e: for (let w of [a, r]) for (let [M, x] of [[Math.sin(w.yaw), Math.cos(w.yaw)], [Math.cos(w.yaw), -Math.sin(w.yaw)]]) {
      let T = l * M + c * x,
        g = oa(a, M, x) + oa(r, M, x) - Math.abs(T);
      if (g <= 0) {
        h = 0;
        break e;
      }
      if (g < h) {
        h = g;
        let H = T < 0 ? -1 : 1;
        d = M * H, u = x * H;
      }
    }
    if (!(h > 0) || h === 1 / 0) continue;
    let f = h * 0.5 + 0.005;
    if (a.x -= d * f, a.z -= u * f, r.x += d * f, r.z += u * f, o) continue;
    let y = w => {
        let M = Math.sin(w.yaw),
          x = Math.cos(w.yaw);
        return [M * w.speed + x * w.sideSpeed, x * w.speed - M * w.sideSpeed];
      },
      m = y(a),
      p = y(r),
      b = (p[0] - m[0]) * d + (p[1] - m[1]) * u;
    if (b < 0) {
      let w = -(1.35 * b) / 2;
      m[0] -= w * d, m[1] -= w * u, p[0] += w * d, p[1] += w * u;
      for (let [M, x] of [[a, m], [r, p]]) {
        let T = Math.sin(M.yaw),
          g = Math.cos(M.yaw);
        M.speed = x[0] * T + x[1] * g, M.sideSpeed = Q(x[0] * g - x[1] * T, -9, 9);
      }
      -b > 4 && a.impact < 0.1 && r.impact < 0.1 && (a.impact = r.impact = Math.min(1, 0.3 - b * 0.05), ye(t, "hit", (a.x + r.x) / 2, (a.z + r.z) / 2, (a.y + r.y) / 2 + 0.5, 16765600, {
        kind: "bump"
      }), fe(t, "bump", {
        car: a.id
      }), fe(t, "bump", {
        car: r.id
      }));
    }
    a.team !== r.team && (a.speed *= Math.exp(-0.7 * e), r.speed *= Math.exp(-0.7 * e));
  }
}
function ha(t, e, s, o, n, i) {
  let a = n - s,
    r = i - o,
    l = Q(((t - s) * a + (e - o) * r) / (a * a + r * r || 1), 0, 1);
  return Math.hypot(t - s - a * l, e - o - r * l);
}
function Cl(t, e) {
  for (let s of t.projectiles) {
    if (s.life -= e, s.target !== null) {
      let i = t.cars[s.target];
      i && !i.finished && (s.yaw += Q(Be(Math.atan2(i.x - s.x, i.z - s.z), s.yaw), -3.7 * e, 3.7 * e), s.y += (i.y + 0.8 - s.y) * Math.min(1, e * 5));
    }
    let o = s.x,
      n = s.z;
    s.x += Math.sin(s.yaw) * s.speed * e, s.z += Math.cos(s.yaw) * s.speed * e;
    for (let i of t.cars) if (i.team !== s.team && !i.finished && !(i.wreck > 0) && Math.abs(i.y + 0.7 - s.y) < 1.8 && ha(i.x, i.z, o, n, s.x, s.z) < 1.4) {
      Pn(t, i, s.type === "tracker" ? 28 : 22, t.cars[s.owner], s.type), s.life = 0;
      break;
    }
  }
  t.projectiles = t.projectiles.filter(s => s.life > 0);
  for (let s of t.mines) if (s.life -= e, s.armed -= e, !(s.armed > 0)) {
    for (let o of t.cars) if (o.team !== s.team && !o.finished && !(o.wreck > 0) && Math.abs(o.y - s.y) < 1.8 && Math.hypot(o.x - s.x, o.z - s.z) < 2) {
      Pn(t, o, 27, t.cars[s.owner], "mine"), s.life = 0;
      break;
    }
  }
  t.mines = t.mines.filter(s => s.life > 0);
  for (let s of t.oils || []) if (s.life -= e, s.armed -= e, !(s.armed > 0)) for (let o of t.cars) {
    if (o.team === s.team || o.finished || o.wreck > 0 || o.airborne || s.hits.includes(o.id) || Math.abs(o.y - s.y) > 1.5 || Math.hypot(o.x - s.x, o.z - s.z) > 2.7) continue;
    if (s.hits.push(o.id), o.shield > 0) {
      ye(t, "shield", o.x, o.z, o.y + 1, 8580290, {
        car: o.id
      }), fe(t, "blocked", {
        car: o.id
      });
      continue;
    }
    o.slip = 1.3, o.slipDir = (o.id + t.tick) % 2 ? 1 : -1, o.speed *= 0.8, o.impact = 0.6;
    let n = t.cars[s.owner];
    n && n.hits++, ye(t, "oil", o.x, o.z, o.y + 0.3, 12618314, {
      impact: !0,
      car: o.id
    }), fe(t, "hit", {
      car: o.id,
      source: s.owner,
      kind: "oil"
    });
  }
  t.oils && (t.oils = t.oils.filter(s => s.life > 0 && s.hits.length < 4));
  for (let s of t.pickups) {
    if (s.timer > 0) {
      s.timer = Math.max(0, s.timer - e);
      continue;
    }
    for (let o of t.cars) if (!o.finished && !(o.wreck > 0) && go(o) < 3 && Math.abs(o.y - s.y) < 1.8 && Math.hypot(o.x - s.x, o.z - s.z) < 2.15) {
      ra(o, s.type), s.timer = 6, s.version++;
      let n = In[t.rules?.powers] || Ml;
      s.type = n[Math.floor(la(t) * n.length)], fe(t, "pickup", {
        car: o.id,
        kind: o.inventory[o.inventory.length - 1]
      }), ye(t, "pickup", s.x, s.z, s.y + 1.6, 16777215, {
        kind: o.inventory[o.inventory.length - 1],
        car: o.id
      });
      break;
    }
  }
}
function Un(t) {
  return [...t.cars].sort((e, s) => e.finished && s.finished ? e.finishTime - s.finishTime || e.id - s.id : e.finished ? -1 : s.finished ? 1 : s.raceS - e.raceS || e.id - s.id);
}
function is(t) {
  let e = aa[t.cars.length] || $n,
    s = Un(t),
    o = [0, 0],
    n = s.map((r, l) => {
      let c = e[l] || 0;
      return t.ffa || (o[r.team] += c), {
        id: r.id,
        name: r.name,
        team: r.team,
        position: l + 1,
        points: c,
        finishTime: r.finishTime,
        finished: r.finished,
        human: r.human,
        hits: r.hits,
        shares: r.shares,
        blocks: r.blocks,
        driftTime: r.driftTime,
        longestDrift: r.longestDrift,
        shortcuts: r.shortcuts
      };
    });
  if (t.ffa) return {
    ffa: !0,
    rows: n,
    teamScores: o,
    bonusTeam: null,
    winner: s[0].id,
    time: t.time,
    mapId: t.mapId,
    podium: s.slice(0, 3).map(r => r.id),
    awards: na(t)
  };
  let i = s.length > 1 && s[0].team === s[1].team ? s[0].team : null;
  i !== null && (o[i] += wo);
  let a = o[0] === o[1] ? s[0].team : o[0] > o[1] ? 0 : 1;
  return {
    rows: n,
    teamScores: o,
    bonusTeam: i,
    winner: a,
    time: t.time,
    mapId: t.mapId,
    podium: s.slice(0, 3).map(r => r.id),
    awards: na(t)
  };
}
var yo = (t, e) => `${t} ${e}${t === 1 ? "" : "s"}`;
function na(t) {
  return [{
    id: "support",
    title: "Team saviour",
    icon: "shield",
    metric: s => s.shares * 3 + s.blocks * 2,
    detail: s => `${yo(s.shares, "share")} \xB7 ${yo(s.blocks, "hit")} blocked`
  }, {
    id: "drift",
    title: "Drift master",
    icon: "wave",
    metric: s => s.driftTime,
    detail: s => `${s.driftTime.toFixed(1)} s drifting \xB7 ${s.longestDrift.toFixed(1)} s longest`
  }, {
    id: "hit",
    title: "Sharpshooter",
    icon: "target",
    metric: s => s.hits,
    detail: s => `${yo(s.hits, "rival hit")}`
  }, {
    id: "shortcut",
    title: "Shortcut acrobat",
    icon: "flag",
    metric: s => s.shortcuts,
    detail: s => `${yo(s.shortcuts, "shortcut")} cleared`
  }].flatMap(s => {
    let o = [...t.cars].sort((n, i) => s.metric(i) - s.metric(n) || Number(i.human) - Number(n.human) || n.id - i.id)[0];
    return s.metric(o) > 0.05 ? [{
      id: s.id,
      title: s.title,
      icon: s.icon,
      car: o.id,
      team: o.team,
      name: o.name,
      human: o.human,
      value: s.metric(o),
      detail: s.detail(o)
    }] : [];
  });
}
function Cs(t, e = {}, s = 1 / 60) {
  if (t.phase === "results") return t;
  if (s = Q(Number.isFinite(s) ? s : 0, 0, 1 / 20), s > 1 / 60 + 1e-6) {
    let n = Math.ceil(s / 0.016666666666666666),
      i = {};
    for (let [a, r] of Object.entries(e)) i[a] = {
      ...r,
      fire: !1,
      cycle: !1,
      share: !1,
      reset: !1,
      signal: !1,
      slot: 0
    };
    for (let a = 0; a < n; a++) Cs(t, a === 0 ? e : i, s / n);
    return t;
  }
  if (t.tick++, t.phase === "countdown") return t.countdown -= s, t.countdown <= 0 && (t.phase = "racing", t.countdown = 0, fe(t, "go")), t;
  t.time += s;
  for (let n of t.cars) if (n.slipstream = 0, !n.finished) {
    for (let i of t.cars) if ((t.ffa || i.team === n.team) && i.id !== n.id && !i.finished && !(i.wreck > 0)) {
      let a = Math.hypot(n.x - i.x, n.z - i.z),
        r = (i.x - n.x) * Math.sin(n.yaw) + (i.z - n.z) * Math.cos(n.yaw),
        l = Math.abs((i.x - n.x) * Math.cos(n.yaw) - (i.z - n.z) * Math.sin(n.yaw));
      r > 4 && r < 19 && l < 2.4 && Math.abs(n.y - i.y) < 1.6 && a < 20 && Math.abs(Be(n.yaw, i.yaw)) < 0.5 && (n.slipstream = 1);
    }
  }
  for (let n of t.cars) {
    let i = n.human && !n.finished ? Tl(e[n.id]) : As(t, n);
    Il(t, n, i, s);
  }
  for (let n of t.cars) n.link = !n.finished && t.cars.some(i => i.id !== n.id && i.team === n.team && !i.finished && Math.hypot(i.x - n.x, i.z - n.z) < bl && Math.abs(i.y - n.y) < 2) ? 1 : 0, n.link && (n.health = Math.min(100, n.health + 4 * s));
  Al(t, s), zl(t, s), Cl(t, s);
  for (let n of t.effects) n.life -= s;
  t.effects = t.effects.filter(n => n.life > 0);
  let o = t.cars.filter(n => n.human);
  return o.length && o.every(n => n.finished) && t.humanFinishAt === null && (t.humanFinishAt = t.time), (t.cars.every(n => n.finished) || t.time >= t.timeout || t.humanFinishAt !== null && t.time - t.humanFinishAt > Bn) && (t.phase = "results", t.results = is(t), fe(t, "results")), t;
}
function Pl(t) {
  let e = t / 2,
    s = 0.75,
    o = 2.2,
    n = [-e, 0, -o, e, 0, -o, e, s, o, -e, 0, -o, e, s, o, -e, s, o, -e, s, o, e, s, o, e, 0, o, -e, s, o, e, 0, o, -e, 0, o, -e, 0, -o, -e, s, o, -e, 0, o, e, 0, -o, e, 0, o, e, s, o],
    i = [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0.9, 0, 1, 1, 0.9, 0, 0.9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    a = new E.BufferGeometry();
  a.setAttribute("position", new E.Float32BufferAttribute(n, 3)), a.setAttribute("uv", new E.Float32BufferAttribute(i, 2)), a.computeVertexNormals();
  let r = ft(256, 128, (l, c, h) => {
    l.fillStyle = "#1f2a2e", l.fillRect(0, 0, c, h), l.fillStyle = "#f2b63a";
    for (let d = -h; d < c + h; d += 48) l.beginPath(), l.moveTo(d, h), l.lineTo(d + 24, h), l.lineTo(d + 24 + h, 0), l.lineTo(d + h, 0), l.closePath(), l.fill();
    l.fillStyle = "#fff3d6", l.fillRect(0, 0, c, 10);
  });
  return new E.Mesh(a, new E.MeshStandardMaterial({
    map: r,
    roughness: 0.55,
    emissive: 5913608,
    emissiveIntensity: 0.35
  }));
}
var Vn = {
    normal: {
      blue: [44731, 4161504, 2603402],
      red: [15025714, 12728956, 15763756],
      trim: [5299434, 16742507]
    },
    cvd: {
      blue: [3108832, 2052024, 5214192],
      red: [16098048, 14254592, 16761395],
      trim: [3902719, 16756736]
    }
  },
  Ps = Vn.normal,
  Wn = !1;
function $l() {
  let t = document.createElement("canvas");
  t.width = 256, t.height = 64;
  let e = new E.CanvasTexture(t);
  e.colorSpace = E.SRGBColorSpace;
  let s = new E.Sprite(new E.SpriteMaterial({
    map: e,
    transparent: !0,
    depthWrite: !1
  }));
  return s.scale.set(2.9, 0.725, 1), s.renderOrder = 6, s.visible = !1, {
    sprite: s,
    canvas: t,
    tex: e,
    key: ""
  };
}
function Ol(t, e, s, o, n = "") {
  let i = t.canvas.getContext("2d");
  if (!i) return;
  i.clearRect(0, 0, 256, 64), i.font = '800 28px "Avenir Next","Trebuchet MS",Arial,sans-serif';
  let a = (n ? n + " " : "") + String(e || "").toUpperCase().slice(0, 14),
    r = o ? 56 : 36,
    l = Math.min(248, i.measureText(a).width + r),
    c = (256 - l) / 2,
    h = "#" + s.toString(16).padStart(6, "0");
  i.fillStyle = "rgba(8,24,32,.84)", i.beginPath(), i.roundRect(c, 9, l, 46, 23), i.fill(), i.lineWidth = 4, i.strokeStyle = h, i.stroke(), o && (i.fillStyle = h, i.beginPath(), i.arc(c + 23, 32, 7, 0, Math.PI * 2), i.fill()), i.fillStyle = o ? "#ffffff" : "#d6e2e5", i.textAlign = "center", i.textBaseline = "middle", i.fillText(a, c + l / 2 + (o ? 10 : 0), 33, l - r + 6), t.tex.needsUpdate = !0;
}
var Gl = [44731, 15025714, 15905597, 8083670, 3129199, 15763756],
  da = (t, e = !1) => {
    let s = e ? {
        bodyColor: Gl[t.id % 6],
        teamColor: 16183523
      } : {
        bodyColor: (t.team ? Ps.red : Ps.blue)[(t.member ?? t.id % 2) % 3],
        teamColor: Ps.trim[t.team]
      },
      o = t.paint;
    return o ? {
      bodyColor: o.body,
      teamColor: e ? o.accent : s.teamColor,
      finish: o.finish,
      rimColor: o.rims
    } : s;
  },
  fa = t => t.paint ? `${t.paint.body}-${t.paint.accent}-${t.paint.rims}-${t.paint.finish}` : "",
  ua = new Set(),
  pa = new Set(),
  Oe = new E.Vector3(),
  it = new E.Matrix4(),
  Tt = new E.Quaternion(),
  vt = new E.Vector3(1, 1, 1);
function ft(t, e, s) {
  let o = document.createElement("canvas");
  o.width = t, o.height = e, s(o.getContext("2d"), t, e);
  let n = new E.CanvasTexture(o);
  return n.colorSpace = E.SRGBColorSpace, n;
}
function Ll(t) {
  let e = ft(256, 256, (s, o, n) => {
    s.fillStyle = t === "grass" ? "#b2a48d" : "#b0b7ba", s.fillRect(0, 0, o, n);
    let i = 19;
    for (let a = 0; a < 17e3; a++) {
      i = Math.imul(i, 1664525) + 1013904223 >>> 0;
      let r = i % 256;
      i = Math.imul(i, 1664525) + 1013904223 >>> 0;
      let l = i % 256,
        c = i % 80;
      s.fillStyle = `rgba(${c + 20},${c + 20},${c + 20},${0.025 + i % 20 / 160})`, s.fillRect(r, l, t === "grass" ? 2 : 1, t === "grass" ? 2 : 1);
    }
    s.fillStyle = "rgba(24,28,26,.13)";
    for (let a of [65, 188]) s.fillRect(a, 0, 3, n);
  });
  return e.wrapS = e.wrapT = E.RepeatWrapping, e.anisotropy = 8, e;
}
function Bl(t) {
  let e = (() => {
      let o = 331;
      return () => (o = Math.imul(o, 1664525) + 1013904223 >>> 0, o / 4294967296);
    })(),
    s = ft(512, 512, (o, n, i) => {
      let a = (r, l, c = 2) => {
        for (let h = 0; h < r; h++) o.fillStyle = l[Math.floor(e() * l.length)], o.fillRect(e() * n, e() * i, c * (0.5 + e()), c * (0.5 + e()));
      };
      if (t === "planks") {
        for (let r = 0; r < i; r += 64) {
          let l = 150 + Math.floor(e() * 40);
          o.fillStyle = `rgb(${l + 40},${l - 5},${l - 60})`, o.fillRect(0, r, n, 64);
          for (let c = 0; c < 18; c++) {
            o.strokeStyle = `rgba(90,55,25,${0.08 + e() * 0.12})`, o.lineWidth = 1 + e() * 1.5, o.beginPath();
            let h = r + 4 + e() * 56;
            o.moveTo(0, h);
            for (let d = 0; d <= n; d += 32) o.lineTo(d, h + Math.sin(d * 0.02 + c) * 2.5);
            o.stroke();
          }
          o.fillStyle = "rgba(60,34,16,.55)", o.fillRect(0, r, n, 3), o.fillStyle = "rgba(255,230,190,.18)", o.fillRect(0, r + 3, n, 2);
          for (let c of [28, n - 28]) for (let h of [r + 18, r + 46]) o.fillStyle = "#5b5650", o.beginPath(), o.arc(c, h, 4, 0, Math.PI * 2), o.fill();
        }
        o.fillStyle = "rgba(40,26,14,.18)", o.fillRect(n * 0.3 - 6, 0, 12, i), o.fillRect(n * 0.7 - 6, 0, 12, i);
      } else if (t === "tile") {
        o.fillStyle = "#e9f1f2", o.fillRect(0, 0, n, i);
        let r = 4,
          l = n / r;
        for (let c = 0; c < r; c++) for (let h = 0; h < r; h++) {
          let d = 238 + Math.floor(e() * 14);
          o.fillStyle = `rgb(${d - 6},${d},${d + 2})`, o.fillRect(c * l + 4, h * l + 4, l - 8, l - 8);
          let u = o.createLinearGradient(c * l, h * l, c * l + l, h * l + l);
          u.addColorStop(0, "rgba(255,255,255,.55)"), u.addColorStop(0.5, "rgba(255,255,255,0)"), o.fillStyle = u, o.fillRect(c * l + 4, h * l + 4, l - 8, l - 8);
        }
        o.fillStyle = "#7fa9b3";
        for (let c = 0; c <= r; c++) o.fillRect(c * l - 5, 0, 10, i), o.fillRect(0, c * l - 5, n, 10);
        a(500, ["rgba(120,160,170,.12)", "rgba(255,255,255,.4)"], 2);
      } else if (t === "dirt") {
        o.fillStyle = "#9c7650", o.fillRect(0, 0, n, i), a(26e3, ["rgba(70,48,28,.14)", "rgba(190,155,110,.16)", "rgba(120,90,60,.2)"], 3);
        for (let r of [n * 0.3, n * 0.7]) {
          let l = o.createLinearGradient(r - 34, 0, r + 34, 0);
          l.addColorStop(0, "rgba(60,40,22,0)"), l.addColorStop(0.5, "rgba(60,40,22,.32)"), l.addColorStop(1, "rgba(60,40,22,0)"), o.fillStyle = l, o.fillRect(r - 34, 0, 68, i);
        }
        for (let r = 0; r < 70; r++) {
          let l = e() * n,
            c = e() * i,
            h = 2 + e() * 5;
          o.fillStyle = ["#8d8b80", "#b1aa98", "#6f6a5f"][r % 3], o.beginPath(), o.ellipse(l, c, h, h * 0.75, e() * 3, 0, Math.PI * 2), o.fill(), o.fillStyle = "rgba(255,255,255,.25)", o.fillRect(l - h * 0.4, c - h * 0.4, h * 0.5, h * 0.3);
        }
        o.fillStyle = "rgba(70,110,50,.35)";
        for (let r = 0; r < 300; r++) {
          let l = e() < 0.5 ? e() * 30 : n - e() * 30;
          o.fillRect(l, e() * i, 2, 6 + e() * 6);
        }
      } else if (t === "granite") {
        o.fillStyle = "#2f3437", o.fillRect(0, 0, n, i), a(42e3, ["rgba(220,220,214,.20)", "rgba(12,14,16,.45)", "rgba(160,120,90,.22)", "rgba(255,255,255,.35)"], 2.2);
        for (let r = 0; r < 18; r++) o.fillStyle = `rgba(${e() < 0.5 ? "230,226,214" : "140,104,80"},${0.08 + e() * 0.1})`, o.beginPath(), o.ellipse(e() * n, e() * i, 6 + e() * 18, 3 + e() * 8, e() * 3, 0, Math.PI * 2), o.fill();
        o.fillStyle = "rgba(238,234,224,.75)", o.fillRect(10, 0, 6, i), o.fillRect(n - 16, 0, 6, i);
      } else {
        o.fillStyle = "#a4a9aa", o.fillRect(0, 0, n, i), a(3e4, ["rgba(60,64,66,.10)", "rgba(220,224,224,.12)", "rgba(90,94,96,.14)"], 2), o.fillStyle = "rgba(50,54,56,.55)", o.fillRect(0, i / 2 - 2, n, 4), o.fillRect(n / 2 - 2, 0, 4, i), o.fillStyle = "#e0b13a", o.fillRect(18, 0, 12, i), o.fillRect(n - 30, 0, 12, i);
        for (let r = 0; r < 6; r++) o.fillStyle = "rgba(30,30,30,.12)", o.beginPath(), o.ellipse(80 + e() * 350, e() * i, 20 + e() * 40, 8 + e() * 16, e() * 3, 0, Math.PI * 2), o.fill();
        o.fillStyle = "rgba(30,32,34,.16)", o.fillRect(n * 0.3 - 8, 0, 16, i), o.fillRect(n * 0.7 - 8, 0, 16, i);
      }
    });
  return s.wrapS = s.wrapT = E.RepeatWrapping, s.anisotropy = 8, s.repeat.set(t === "tile" ? 1.8 : 1, t === "planks" ? 1.5 : 1), s;
}
var Nl = {
  granite: {
    roughness: 0.32,
    metalness: 0.05
  },
  planks: {
    roughness: 0.62
  },
  tile: {
    roughness: 0.18,
    metalness: 0.02
  },
  dirt: {
    roughness: 0.97
  },
  concrete: {
    roughness: 0.82
  }
};
function Dl(t) {
  let e = new E.CircleGeometry(1, 40),
    s = e.attributes.position;
  for (let o = 1; o < s.count; o++) {
    let n = s.getX(o),
      i = s.getY(o),
      a = Math.atan2(i, n),
      r = 1 + 0.14 * Math.sin(a * 3 + t) + 0.08 * Math.sin(a * 5 + t * 2) + 0.05 * Math.sin(a * 9 + t);
    s.setXY(o, n * r, i * r);
  }
  return e.rotateX(-Math.PI / 2), e;
}
function Fl(t) {
  let e = new E.Group(),
    s = le(t.id).patches || [];
  if (!s.length) return e;
  let o = {
      polygonOffset: !0,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    },
    n = {
      soap: new E.MeshStandardMaterial({
        color: 5940960,
        roughness: 0.45,
        envMapIntensity: 0.25,
        emissive: 2976409,
        emissiveIntensity: 0.35,
        ...o
      }),
      oil: new E.MeshStandardMaterial({
        color: 394501,
        roughness: 0.6,
        envMapIntensity: 0.1,
        ...o
      }),
      mud: new E.MeshStandardMaterial({
        color: 4861202,
        roughness: 0.95,
        envMapIntensity: 0.05,
        ...o
      }),
      milk: new E.MeshStandardMaterial({
        color: 16513263,
        roughness: 0.4,
        envMapIntensity: 0.3,
        emissive: 5920336,
        emissiveIntensity: 0.25,
        ...o
      }),
      jam: new E.MeshStandardMaterial({
        color: 10227498,
        roughness: 0.35,
        envMapIntensity: 0.25,
        emissive: 3802128,
        emissiveIntensity: 0.3,
        ...o
      })
    },
    i = new E.MeshStandardMaterial({
      color: 16777215,
      roughness: 0.7
    }),
    a = new E.MeshStandardMaterial({
      color: 8017460,
      roughness: 0.96,
      polygonOffset: !0,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    }),
    r = new E.MeshPhysicalMaterial({
      color: 16777215,
      roughness: 0.04,
      transmission: 0.85,
      thickness: 0.1,
      iridescence: 1,
      iridescenceIOR: 1.3,
      transparent: !0,
      opacity: 0.65
    }),
    l = new E.SphereGeometry(1, 14, 10);
  return s.forEach((c, h) => {
    let d = Dl(h * 1.7 + 1);
    if (c.kind === "mud") {
      let f = new E.Mesh(d, a);
      f.position.set(c.x, c.y + 0.066, c.z), f.rotation.y = c.yaw, f.scale.set(c.r * 1.14, 1, c.r * 1.32), f.receiveShadow = !0, e.add(f);
    }
    let u = new E.Mesh(d, n[c.kind] || n.oil);
    if (u.position.set(c.x, c.y + 0.075, c.z), u.rotation.y = c.yaw + h * 0.7, u.scale.set(c.r, 1, c.r * 1.15), u.receiveShadow = !0, e.add(u), c.kind === "soap") {
      for (let f = 0; f < 10; f++) {
        let y = f * 2.4 + h,
          m = Math.sqrt((f + 1) / 10) * c.r * 0.85,
          p = 0.16 + f * 37 % 10 / 24,
          b = new E.Mesh(l, r);
        b.position.set(c.x + Math.cos(y) * m, c.y + 0.08 + p * 0.55, c.z + Math.sin(y) * m), b.scale.setScalar(p), e.add(b);
      }
      for (let f = 0; f < 16; f++) {
        let y = f / 16 * Math.PI * 2 + h,
          m = c.r * (1.02 + 0.08 * Math.sin(f * 3.1)),
          p = 0.22 + f * 29 % 7 / 22,
          b = new E.Mesh(l, i);
        b.position.set(c.x + Math.cos(y) * m, c.y + 0.06, c.z + Math.sin(y) * m * 1.12), b.scale.set(p * 1.4, p * 0.55, p * 1.4), e.add(b);
      }
    }
  }), e;
}
function as(t, e, s, o = 0, n = 0, i = 16777215, a = null) {
  let r = Math.ceil(t.length / 1.4),
    l = [],
    c = [],
    h = [];
  for (let u = 0; u <= r; u++) {
    let f = u / r * t.length,
      y = G(t, f);
    for (let [m, p] of [[e, o], [s, o + n]]) l.push(y.x + y.nx * m, y.y + p, y.z + y.nz * m), c.push(m / t.width + 0.5, f / 6);
    if (u < r && !a?.(f + t.length / r / 2)) {
      let m = u * 2;
      h.push(m, m + 1, m + 2, m + 1, m + 3, m + 2);
    }
  }
  let d = new E.BufferGeometry();
  return d.setAttribute("position", new E.Float32BufferAttribute(l, 3)), d.setAttribute("uv", new E.Float32BufferAttribute(c, 2)), d.setIndex(h), d.computeVertexNormals(), new E.Mesh(d, new E.MeshStandardMaterial({
    color: i,
    roughness: 0.86,
    side: E.DoubleSide
  }));
}
function jl(t) {
  let e = new E.Group(),
    s = t.width / 2;
  vt.setScalar(1);
  let o = !!t.roadStyle,
    n = as(t, -s, s, 0.02, 0, o ? 16777215 : t.roadColor);
  n.material.map = o ? Bl(t.roadStyle) : Ll(t.surface), n.material.roughness = t.surface === "grass" ? 0.94 : 0.76, o && Object.assign(n.material, Nl[t.roadStyle] || {}), n.material.bumpMap = n.material.map, n.material.bumpScale = o ? 0.02 : 0.035, n.receiveShadow = !0, e.add(n);
  let i = as(t, -s, s, -0.45, 0, 2505282);
  i.receiveShadow = !0, e.add(i);
  for (let g of [-1, 1]) {
    let H = as(t, g * s, g * (s + 0.45), 0.06, 0, 16770477);
    H.receiveShadow = !0, e.add(H);
    let v = F => hn(t, F, g),
      R = as(t, g * (s + 0.5), g * (s + 0.5), 0.02, 0.84, t.railColor, v);
    R.material.roughness = 0.38, R.material.metalness = 0.1, R.castShadow = R.receiveShadow = !0, e.add(R);
    let z = as(t, g * (s + 0.22), g * (s + 0.76), 0.87, 0, t.railColor, v);
    z.material.roughness = 0.38, z.castShadow = z.receiveShadow = !0, e.add(z);
    let D = as(t, g * s, g * s, -0.45, 0.47, 2702917);
    D.castShadow = !0, e.add(D);
  }
  let a = [];
  for (let g = 5; g < t.length; g += 18) if (!(G(t, g).y < 2.8)) for (let v of [-1, 1]) {
    let R = G(t, g, v * (s + 0.9)),
      z = We(t, R.x, R.z, null, 0);
    z.y < 2.5 && z.distance < s + 1.4 || a.push(R);
  }
  if (a.length) {
    let g = new E.InstancedMesh(new E.BoxGeometry(0.7, 1, 0.7), new E.MeshStandardMaterial({
      color: t.surface === "grass" ? 7885878 : 10269105,
      roughness: 0.65
    }), a.length);
    for (let H = 0; H < a.length; H++) {
      let v = a[H];
      Oe.set(v.x, v.y / 2 - 0.18, v.z), Tt.setFromAxisAngle(new E.Vector3(0, 1, 0), v.yaw), vt.set(0.9, v.y - 0.35, 0.9), it.compose(Oe, Tt, vt), g.setMatrixAt(H, it);
    }
    g.castShadow = g.receiveShadow = !0, e.add(g);
  }
  vt.setScalar(1);
  let r = o ? 0 : Math.floor(t.length / 5),
    l = new E.InstancedMesh(new E.BoxGeometry(0.1, 0.015, 1.5), new E.MeshStandardMaterial({
      color: 14279644,
      transparent: !0,
      opacity: 0.27,
      roughness: 1
    }), r);
  for (let g = 0; g < r; g++) {
    let H = G(t, g * 5);
    Tt.setFromAxisAngle(new E.Vector3(0, 1, 0), H.yaw), Oe.set(H.x, H.y + 0.06, H.z), it.compose(Oe, Tt, vt), l.setMatrixAt(g, it);
  }
  e.add(l);
  let c = new E.InstancedMesh(new E.BoxGeometry(0.85, 0.023, 1.1), new E.MeshStandardMaterial({
      color: 16052453,
      roughness: 0.8
    }), 12),
    h = G(t, 0);
  for (let g = 0; g < 12; g++) {
    let H = G(t, g % 2 * 0.9, (Math.floor(g / 2) - 2.5) * 1.7);
    Oe.set(H.x, H.y + 0.061, H.z), Tt.setFromAxisAngle(new E.Vector3(0, 1, 0), H.yaw), it.compose(Oe, Tt, vt), c.setMatrixAt(g, it);
  }
  e.add(c);
  let d = new E.Group();
  d.position.set(h.x, h.y, h.z), d.rotation.y = h.yaw;
  let u = new E.InstancedMesh(new E.CylinderGeometry(0.25, 0.36, 6.8, 10), new E.MeshStandardMaterial({
    color: 4413797,
    metalness: 0.4,
    roughness: 0.35
  }), 2);
  for (let g = 0; g < 2; g++) it.makeTranslation((g ? 1 : -1) * (s + 0.65), 3.4, 0), u.setMatrixAt(g, it);
  d.add(u);
  let f = ft(1024, 160, g => {
      g.fillStyle = "#15313d", g.fillRect(0, 0, 1024, 160), g.fillStyle = "#58dae8", g.fillRect(0, 140, 1024, 20), g.font = "900 66px Arial", g.textAlign = "center", g.fillStyle = "#fff6e8", g.fillText("TOYBOX  RALLY", 512, 102);
    }),
    y = new E.Mesh(new E.BoxGeometry(t.width + 1.8, 1.65, 0.4), new E.MeshStandardMaterial({
      map: f,
      color: 16777215,
      roughness: 0.45
    }));
  y.position.y = 6.7, y.castShadow = !0, d.add(y), e.add(d);
  for (let g = 1; g < 3; g++) {
    let H = G(t, t.length * g / 3),
      v = ft(768, 144, z => {
        z.fillStyle = "#162e35", z.fillRect(0, 0, 768, 144), z.fillStyle = "#e9ba72", z.fillRect(0, 0, 768, 8), z.font = "900 39px Arial", z.textAlign = "center", z.fillStyle = "#fff2da", z.fillText(t.sectorNames[g], 384, 88);
      }),
      R = new E.Mesh(new E.BoxGeometry(t.width + 2, 1.45, 0.28), new E.MeshStandardMaterial({
        map: v,
        roughness: 0.6
      }));
    R.position.set(H.x, H.y + 5.8, H.z), R.rotation.y = H.yaw, R.castShadow = !0, e.add(R);
    for (let z of [-1, 1]) {
      let D = G(t, t.length * g / 3, z * (s + 0.9)),
        F = new E.Mesh(new E.CylinderGeometry(0.16, 0.22, 5.75, 8), new E.MeshStandardMaterial({
          color: t.railColor,
          roughness: 0.5
        }));
      F.position.set(D.x, D.y + 2.875, D.z), F.castShadow = !0, e.add(F);
    }
  }
  let m = ft(256, 128, (g, H, v) => {
    g.fillStyle = "#1b6676", g.fillRect(0, 0, H, v), g.strokeStyle = "#9ff8ff", g.lineWidth = 16, g.lineCap = "round", g.lineJoin = "round";
    for (let R = 0; R < 4; R++) {
      let z = 32 + R * 64;
      g.beginPath(), g.moveTo(z - 20, 108), g.lineTo(z, 42), g.lineTo(z + 20, 108), g.stroke();
    }
  });
  m.wrapS = E.ClampToEdgeWrapping, m.wrapT = E.RepeatWrapping, m.anisotropy = 8, ua.add(m);
  let p = new E.MeshStandardMaterial({
    map: m,
    emissive: 6285038,
    emissiveMap: m,
    emissiveIntensity: 0.95,
    color: 16777215,
    roughness: 0.45,
    side: E.DoubleSide,
    polygonOffset: !0,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3
  });
  pa.add(p);
  let b = new E.MeshBasicMaterial({
      color: 3138802
    }),
    w = new E.CylinderGeometry(0.13, 0.18, 1.1, 8);
  w.translate(0, 0.55, 0);
  let M = g => {
    let H = t.width / 2 - 1,
      v = t.length * g,
      R = [],
      z = [],
      D = [],
      F = 8;
    for (let X = 0; X <= F; X++) {
      let _ = v - 2 + X * 4 / F,
        Y = G(t, _);
      for (let te of [-H, H]) R.push(Y.x + Y.nx * te, Y.y + 0.07, Y.z + Y.nz * te), z.push(te < 0 ? 1 : 0, X / F);
      if (X < F) {
        let te = X * 2;
        D.push(te, te + 1, te + 2, te + 1, te + 3, te + 2);
      }
    }
    let j = new E.BufferGeometry();
    return j.setAttribute("position", new E.Float32BufferAttribute(R, 3)), j.setAttribute("uv", new E.Float32BufferAttribute(z, 2)), j.setIndex(D), j.computeVertexNormals(), new E.Mesh(j, p);
  };
  for (let g of t.boosts) {
    e.add(M(g));
    let H = G(t, t.length * g);
    for (let v of [-1, 1]) {
      let R = new E.Mesh(w, b),
        z = v * (t.width / 2 + 0.2);
      R.position.set(H.x + H.nx * z, H.y + 0.06, H.z + H.nz * z), e.add(R);
    }
  }
  for (let g of le(t.id).ramps) {
    let H = G(t, g),
      v = G(t, g - 2),
      R = G(t, g + 2),
      z = new E.Vector3(R.x - v.x, R.y - v.y, R.z - v.z).normalize(),
      D = new E.Vector3(H.nx, 0, H.nz),
      F = new E.Vector3().crossVectors(z, D).normalize();
    D.crossVectors(F, z).normalize();
    let j = Pl(t.width - 1.4);
    j.quaternion.setFromRotationMatrix(new E.Matrix4().makeBasis(D, F, z)), j.position.set(H.x, H.y + 0.03, H.z), j.castShadow = j.receiveShadow = !0, e.add(j);
  }
  let x = [];
  for (let g = 0; g < t.length; g += 1.6) {
    let H = G(t, g - 4),
      v = G(t, g + 4),
      R = Be(v.yaw, H.yaw);
    if (Math.abs(R) > 0.2 && !hn(t, g, R > 0 ? 1 : -1)) {
      let z = R > 0 ? 1 : -1;
      x.push({
        p: G(t, g, z * (s - 0.35)),
        i: Math.floor(g / 1.6)
      });
    }
  }
  if (x.length) {
    let g = new E.InstancedMesh(new E.BoxGeometry(0.7, 0.06, 1.5), new E.MeshStandardMaterial({
        color: 16777215,
        roughness: 0.6
      }), x.length),
      H = new E.Color(14173754),
      v = new E.Color(16052196);
    x.forEach(({
      p: R,
      i: z
    }, D) => {
      Tt.setFromAxisAngle(new E.Vector3(0, 1, 0), R.yaw), Oe.set(R.x, R.y + 0.05 + z % 2 * 0.006, R.z), vt.setScalar(1), it.compose(Oe, Tt, vt), g.setMatrixAt(D, it), g.setColorAt(D, z % 2 ? H : v);
    }), g.receiveShadow = !0, e.add(g);
  }
  let T = [[], []];
  for (let g = 14; g < t.length - 10; g += 18) {
    let H = G(t, g),
      v = G(t, g + 11),
      R = Be(v.yaw, H.yaw);
    Math.abs(R) > 0.24 && T[R > 0 ? 0 : 1].push(G(t, g, (R > 0 ? -1 : 1) * (s + 1)));
  }
  for (let g = 0; g < 2; g++) {
    if (!T[g].length) continue;
    let H = ft(128, 128, R => {
        R.fillStyle = "#143541", R.fillRect(0, 0, 128, 128), R.strokeStyle = "#62e0e7", R.lineWidth = 11, R.strokeRect(4, 4, 120, 120), R.beginPath(), R.moveTo(g ? 45 : 83, 30), R.lineTo(g ? 80 : 48, 64), R.lineTo(g ? 45 : 83, 98), R.stroke();
      }),
      v = new E.InstancedMesh(new E.PlaneGeometry(1.8, 1.8), new E.MeshStandardMaterial({
        map: H,
        roughness: 0.5,
        side: E.DoubleSide
      }), T[g].length);
    for (let R = 0; R < T[g].length; R++) {
      let z = T[g][R];
      Oe.set(z.x, z.y + 2.2, z.z), Tt.setFromAxisAngle(new E.Vector3(0, 1, 0), z.yaw + Math.PI), vt.setScalar(1), it.compose(Oe, Tt, vt), v.setMatrixAt(R, it);
    }
    e.add(v);
  }
  return e;
}
function Ul(t) {
  let e = new E.Group(),
    s = Math.ceil(t.length / 1.1),
    o = () => !1;
  function n(x, T, g, H) {
    let v = [],
      R = [],
      z = [];
    for (let j = 0; j <= s; j++) {
      let X = j / s * t.length;
      for (let _ of [x, T]) {
        let Y = Se(t, X, _);
        v.push(Y.x, Y.y + g, Y.z), R.push(_ / t.width + 0.5, X / 5);
      }
      if (j < s && !o((j + 0.5) / s * t.length)) {
        let _ = j * 2;
        z.push(_, _ + 1, _ + 2, _ + 1, _ + 3, _ + 2);
      }
    }
    let D = new E.BufferGeometry();
    D.setAttribute("position", new E.Float32BufferAttribute(v, 3)), D.setAttribute("uv", new E.Float32BufferAttribute(R, 2)), D.setIndex(z), D.computeVertexNormals();
    let F = new E.Mesh(D, new E.MeshStandardMaterial({
      color: H,
      roughness: t.kind === "chute" ? 0.38 : 0.8,
      metalness: t.kind === "chute" ? 0.42 : 0,
      side: E.DoubleSide
    }));
    F.receiveShadow = !0, e.add(F);
  }
  n(-t.width / 2, t.width / 2, 0.055, t.kind === "book" ? 10843217 : t.kind === "pond" ? 8479817 : t.kind === "chute" ? 9279130 : 3492173);
  for (let x of [-1, 1]) n(x * (t.width / 2 - 0.16), x * t.width / 2, 0.074, 16104545);
  if (t.jump) {
    let x = new E.MeshStandardMaterial({
        color: t.kind === "book" ? 9198140 : t.kind === "pond" ? 8018749 : t.kind === "chute" ? 7306368 : 2900296,
        roughness: 0.7,
        side: E.DoubleSide
      }),
      T = t.jump,
      g = Math.max(0, T.start - 3),
      H = Math.min(t.length, T.end + 3),
      v = Math.ceil((H - g) / 0.8);
    for (let j of [-1, 1]) {
      let X = [],
        _ = [];
      for (let Te = 0; Te <= v; Te++) {
        let He = g + (H - g) * Te / v,
          L = Se(t, He, j * t.width / 2),
          U = Se(t, He, j * t.width / 2, {
            flight: !1
          });
        if (X.push(L.x, L.y + 0.05, L.z, U.x, U.y - 0.5, U.z), Te < v) {
          let q = Te * 2;
          _.push(q, q + 1, q + 2, q + 1, q + 3, q + 2);
        }
      }
      let Y = new E.BufferGeometry();
      Y.setAttribute("position", new E.Float32BufferAttribute(X, 3)), Y.setIndex(_), Y.computeVertexNormals();
      let te = new E.Mesh(Y, x);
      te.castShadow = te.receiveShadow = !0, e.add(te);
    }
    let R = new E.MeshStandardMaterial({
        color: 2765110,
        roughness: 0.9,
        side: E.DoubleSide
      }),
      z = [],
      D = [];
    for (let j = 0; j <= v; j++) {
      let X = g + (H - g) * j / v;
      for (let _ of [-t.width / 2, t.width / 2]) {
        let Y = Se(t, X, _);
        z.push(Y.x, Y.y - 0.08, Y.z);
      }
      if (j < v) {
        let _ = j * 2;
        D.push(_, _ + 2, _ + 1, _ + 1, _ + 2, _ + 3);
      }
    }
    let F = new E.BufferGeometry();
    F.setAttribute("position", new E.Float32BufferAttribute(z, 3)), F.setIndex(D), F.computeVertexNormals(), e.add(new E.Mesh(F, R));
  }
  let i = [];
  for (let x = 9; x < t.length - 8; x += 12) i.push(Se(t, x, 0));
  let a = new E.InstancedMesh(new E.ConeGeometry(0.25, 0.8, 3), new E.MeshBasicMaterial({
      color: 16241800
    }), i.length),
    r = new E.Object3D();
  for (let x = 0; x < i.length; x++) {
    let T = i[x];
    r.rotation.set(Math.PI / 2, T.yaw, 0, "YXZ"), r.position.set(T.x, T.y + 0.12, T.z), r.scale.set(1, 0.8, 0.16), r.updateMatrix(), a.setMatrixAt(x, r.matrix);
  }
  e.add(a);
  let l = Se(t, 3, t.side * (t.width / 2 + 1.1), {
      flight: !1
    }),
    c = ft(768, 180, x => {
      x.fillStyle = "#202e34", x.fillRect(0, 0, 768, 180), x.fillStyle = "#f6be6b", x.fillRect(0, 0, 768, 12), x.textAlign = "center", x.font = "900 38px Arial", x.fillText(t.name, 384, 76), x.font = "700 28px Arial", x.fillStyle = "#efe2c3", x.fillText(t.jump ? `${Math.round(t.jump.minSpeed * 5)} KM/H = BIG AIR  \xB7  SHORTCUT` : "NARROW PASS  \xB7  RISKY SHORTCUT", 384, 134);
    }),
    h = new E.Mesh(new E.BoxGeometry(6.1, 1.45, 0.16), new E.MeshStandardMaterial({
      map: c,
      roughness: 0.62
    }));
  h.position.set(l.x, l.y + 3.2, l.z), h.rotation.y = l.yaw + Math.PI, e.add(h);
  let d = new E.Mesh(new E.CylinderGeometry(0.1, 0.14, 3, 8), new E.MeshStandardMaterial({
    color: 9009253,
    roughness: 0.6
  }));
  d.position.set(l.x, l.y + 1.5, l.z), e.add(d);
  let u = new E.MeshStandardMaterial({
      color: 16765562,
      emissive: 16757575,
      emissiveIntensity: 0.9,
      roughness: 0.4
    }),
    f = new E.MeshStandardMaterial({
      color: 2307904,
      roughness: 0.5
    }),
    y = Se(t, 5, 0, {
      flight: !1
    }),
    m = new E.Group();
  m.position.set(y.x, y.y, y.z), m.rotation.y = y.yaw;
  for (let x of [-1, 1]) {
    let T = new E.Mesh(new E.BoxGeometry(0.32, 3.4, 0.32), f);
    T.position.set(x * (t.width / 2 + 0.45), 1.7, 0), T.castShadow = !0, m.add(T);
    let g = new E.Mesh(new E.BoxGeometry(0.38, 0.38, 0.38), u);
    g.position.set(x * (t.width / 2 + 0.45), 3.5, 0), m.add(g);
  }
  let p = new E.Mesh(new E.BoxGeometry(t.width + 1.2, 0.32, 0.24), u);
  p.position.y = 3.35, m.add(p), e.add(m);
  let b = ee(t.mapId),
    w = new E.MeshBasicMaterial({
      color: 16238698,
      transparent: !0,
      opacity: 0.8,
      depthWrite: !1
    }),
    M = new E.ConeGeometry(0.55, 1.3, 3);
  for (let x = 1; x <= 5; x++) {
    let T = G(b, t.startS - x * 5, t.side * 3.2),
      g = new E.Mesh(M, w);
    g.rotation.set(Math.PI / 2, 0, 0, "YXZ"), g.rotation.set(Math.PI / 2, T.yaw, 0, "YXZ"), g.scale.set(1, 1, 0.12), g.position.set(T.x, T.y + 0.08, T.z), e.add(g);
  }
  return e.add(qi(t)), e;
}
function Wl() {
  return ft(64, 64, t => {
    let e = t.createRadialGradient(32, 32, 4, 32, 32, 32);
    e.addColorStop(0, "rgba(0,0,0,.55)"), e.addColorStop(0.6, "rgba(0,0,0,.25)"), e.addColorStop(1, "rgba(0,0,0,0)"), t.fillStyle = e, t.fillRect(0, 0, 64, 64);
  });
}
function Yn(t, e, s) {
  return t === 1 ? [{
    x: 0,
    y: 0,
    w: e,
    h: s
  }] : t === 2 ? e / s > 1.6 ? [{
    x: 0,
    y: 0,
    w: e / 2,
    h: s
  }, {
    x: e / 2,
    y: 0,
    w: e / 2,
    h: s
  }] : [{
    x: 0,
    y: 0,
    w: e,
    h: s / 2
  }, {
    x: 0,
    y: s / 2,
    w: e,
    h: s / 2
  }] : Array.from({
    length: t
  }, (o, n) => ({
    x: n % 2 * e / 2,
    y: Math.floor(n / 2) * s / 2,
    w: e / 2,
    h: s / 2
  }));
}
var To = class {
  constructor(e, {
    quality: s = "high"
  } = {}) {
    this.renderer = new E.WebGLRenderer({
      canvas: e,
      antialias: !0,
      alpha: !1,
      powerPreference: "high-performance"
    }), this.quality = s, this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, s === "high" ? 1.5 : 1)), this.renderer.outputColorSpace = E.SRGBColorSpace, this.renderer.toneMapping = E.ACESFilmicToneMapping, this.renderer.toneMappingExposure = 0.92, this.renderer.autoClear = !1, this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = E.PCFShadowMap, this.renderer.shadowMap.autoUpdate = !1, this.scene = new E.Scene(), this.world = new E.Group(), this.scene.add(this.world), this.scene.add(new E.HemisphereLight(11981024, 6510662, 0.8)), this.sun = new E.DirectionalLight(16773072, 3.1), this.sun.position.set(-40, 65, 35), this.sun.castShadow = !0, this.sun.shadow.mapSize.set(1536, 1536), this.sun.shadow.camera.left = this.sun.shadow.camera.bottom = -38, this.sun.shadow.camera.right = this.sun.shadow.camera.top = 38, this.sun.shadow.camera.near = 0.5, this.sun.shadow.camera.far = 180, this.sun.shadow.bias = -3e-4, this.sun.shadow.normalBias = 0.035, this.scene.add(this.sun, this.sun.target);
    let o = new E.DirectionalLight(10733535, 0.38);
    o.position.set(40, 15, -40), this.scene.add(o);
    let n = new E.Scene();
    n.background = new E.Color(9149346);
    let i = new E.BoxGeometry(20, 20, 20),
      a = new E.Mesh(i, new E.MeshBasicMaterial({
        color: 13686740,
        side: E.BackSide
      }));
    n.add(a);
    for (let [h, d, u, f, y] of [[0, 9, 0, 9, 5], [-9, 3, 0, 5, 8], [9, 4, 1, 3, 8]]) {
      let m = new E.Mesh(new E.PlaneGeometry(f, y), new E.MeshBasicMaterial({
        color: 16777215
      }));
      m.position.set(h, d, u), m.lookAt(0, 0, 0), n.add(m);
    }
    let r = new E.PMREMGenerator(this.renderer);
    this.environmentTarget = r.fromScene(n, 0.04), this.scene.environment = this.environmentTarget.texture, r.dispose(), n.traverse(h => {
      h.geometry?.dispose(), h.material && h.material.dispose();
    }), this.carModels = [], this.carStyles = [], this.carFfa = [], this.carPaints = [], this.tags = [], this.ambientCache = new Map(), this.cameras = Array.from({
      length: 4
    }, () => new E.PerspectiveCamera(58, 16 / 9, 0.12, 330)), this.lookTargets = Array.from({
      length: 4
    }, () => new E.Vector3()), this.cameraReady = [!1, !1, !1, !1], this.carSmooth = [];
    let l = new E.PlaneGeometry(3.1, 4.3),
      c = new E.MeshBasicMaterial({
        map: Wl(),
        transparent: !0,
        opacity: 0.3,
        depthWrite: !1
      });
    this.shadows = Array.from({
      length: 6
    }, () => {
      let h = new E.Mesh(l, c);
      return h.rotation.x = -Math.PI / 2, this.scene.add(h), h;
    }), this.effects = new ro(this.scene), this.driveEffects = new ho(this.scene), this.lastMap = null, this.mapCache = new Map(), this.hazardCache = new Map(), this.carMotion = [], this.reducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || !1, this.width = 1, this.height = 1, this.resize();
  }
  resize() {
    let e = Math.max(1, this.renderer.domElement.clientWidth),
      s = Math.max(1, this.renderer.domElement.clientHeight);
    (e !== this.width || s !== this.height) && (this.width = e, this.height = s, this.renderer.setSize(e, s, !1), this.cameraReady.fill(!1));
  }
  setQuality(e) {
    this.quality = e, this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, e === "high" ? 1.5 : 1));
    let s = e === "high",
      o = s ? 1536 : 1024,
      n = this.renderer.shadowMap.enabled !== s;
    if (this.sun.shadow.map && this.sun.shadow.mapSize.x !== o && (this.sun.shadow.map.dispose(), this.sun.shadow.map = null), this.sun.shadow.mapSize.set(o, o), this.renderer.shadowMap.enabled = s, this.renderer.shadowMap.needsUpdate = !0, this.shadows?.[0] && (this.shadows[0].material.opacity = s ? 0.3 : 0.52), n) {
      let i = a => {
        let r = a.material;
        if (r) for (let l of Array.isArray(r) ? r : [r]) l.needsUpdate = !0;
      };
      this.scene.traverse(i);
      for (let a of this.mapCache.values()) (a.group || a).traverse?.(i);
      this.podiumScene?.traverse(i);
    }
  }
  setMap(e) {
    if (this.lastMap === e) return;
    for (this.lastMap = e; this.world.children.length;) this.world.remove(this.world.children[0]);
    if (this.track = ee(e), !this.mapCache.has(e)) {
      let n = new E.Group();
      n.add(Pi(Ze(e)), jl(this.track));
      for (let a of le(e).shortcuts) n.add(Ul(a));
      n.add(Fl(this.track));
      let i = le(e).hazards.map(a => {
        let r = Vi(a.type);
        return n.add(r.group), {
          def: a,
          model: r
        };
      });
      this.hazardCache.set(e, i), this.mapCache.set(e, n);
    }
    this.world.add(this.mapCache.get(e));
    for (let n of this.ambientCache.values()) n.setVisible(!1);
    this.ambientCache.has(e) || this.ambientCache.set(e, new po(this.scene, e)), this.ambient = this.ambientCache.get(e), this.ambient.setVisible(!0), this.scene.background?.isTexture && this.scene.background.dispose();
    let s = new E.Color(this.track.sky),
      o = s.clone().lerp(new E.Color(6266838), 0.45).offsetHSL(0, 0.05, 0.06);
    this.scene.background = ft(4, 256, (n, i, a) => {
      let r = n.createLinearGradient(0, 0, 0, a);
      r.addColorStop(0, "#" + o.getHexString()), r.addColorStop(0.62, "#" + s.getHexString()), r.addColorStop(1, "#" + s.clone().offsetHSL(0, 0, 0.05).getHexString()), n.fillStyle = r, n.fillRect(0, 0, i, a);
    }), this.scene.fog = new E.Fog(this.track.sky, 150, 330), this.cameraReady.fill(!1), this.effects.reset(), this.driveEffects.reset();
  }
  setColorblind(e) {
    Gi(!!e), Ps = e ? Vn.cvd : Vn.normal, Wn = !!e, this.carStyles = [], this.podiumMatch = null;
  }
  setCamera({
    distance: e = "normal",
    fov: s = "normal"
  } = {}) {
    this.camDistance = {
      near: 0.8,
      normal: 1,
      far: 1.25
    }[e] || 1, this.camFov = {
      narrow: -6,
      normal: 0,
      wide: 8
    }[s] || 0, this.cameraReady.fill(!1);
  }
  setGhost(e) {
    if (!e) {
      this.ghost && (this.ghost.group.visible = !1);
      return;
    }
    (!this.ghost || this.ghostStyle !== e.style) && (this.ghost && this.scene.remove(this.ghost.group), this.ghost = qs({
      style: e.style,
      bodyColor: 13169919,
      teamColor: 16777215
    }), this.ghostStyle = e.style, this.ghost.group.traverse(o => {
      if (!o.isMesh) return;
      let n = i => (i = i.clone(), i.transparent = !0, i.opacity = 0.3, i.depthWrite = !1, i.emissive && (i.emissive.set(6281471), i.emissiveIntensity = 0.35), i);
      o.material = Array.isArray(o.material) ? o.material.map(n) : n(o.material), o.castShadow = !1, o.renderOrder = 2;
    }), this.scene.add(this.ghost.group));
    let s = this.ghost.group;
    s.visible = !0, s.position.set(e.x, e.y + 0.035, e.z), s.rotation.set(0, e.yaw, 0);
  }
  syncCars(e, s, o = !1) {
    for (let n of e.cars) {
      let i = n.id;
      if (!this.carModels[i] || this.carStyles[i] !== n.style || this.carFfa[i] !== !!e.ffa || (this.carPaints[i] || "") !== fa(n)) {
        (this.carPaints || (this.carPaints = []))[i] = fa(n), this.carModels[i] && (this.scene.remove(this.carModels[i].group), this.carModels[i].dispose?.());
        let p = qs({
          style: n.style,
          ...da(n, e.ffa)
        });
        this.carModels[i] = p, this.carStyles[i] = n.style, this.carFfa[i] = !!e.ffa, this.scene.add(p.group), this.carSmooth[i] = {
          x: n.x,
          z: n.z,
          y: n.y,
          yaw: n.yaw
        };
      }
      let a = this.carModels[i],
        r = this.carSmooth[i];
      if (!a?.group || !r) continue;
      let l = o ? 1 - Math.exp(-s * 18) : 1;
      Math.hypot(r.x - n.x, r.z - n.z) > 8 ? (r.x = n.x, r.z = n.z, r.y = n.y, r.yaw = n.yaw) : (r.x += (n.x - r.x) * l, r.z += (n.z - r.z) * l, r.y += (n.y - r.y) * l, r.yaw += Be(n.yaw, r.yaw) * l);
      let c = xs(e.mapId, n, 1.5),
        h = xs(e.mapId, n, -1.5),
        d = Math.atan2(c.y - h.y, 3),
        u = this.carMotion[i] || {
          pitch: 0,
          roll: 0
        };
      this.carMotion[i] = u;
      let f = 1 - Math.exp(-s * 10);
      u.pitch += (-Q((n.acceleration || 0) * 0.0032, -0.11, 0.075) - u.pitch) * f, u.roll += (Q(-n.sideSpeed * 0.025 + (n.steering || 0) * n.speed * 0.0012, -0.15, 0.15) - u.roll) * f;
      let y = this.reducedMotion ? 0 : Math.sin(e.time * 17 + i) * 0.012 * Math.min(1, Math.abs(n.acceleration || 0) / 18) + (n.impact || 0) * Math.sin(e.time * 45) * 0.035;
      if (a.group.position.set(r.x, r.y + 0.035 + y, r.z), a.group.rotation.set(-d + u.pitch, r.yaw, u.roll, "YXZ"), a.group.visible = !(n.protect > 0 && Math.floor(e.time * 10) % 2 === 0), n.wreck > 0) {
        let p = 1 - n.wreck / (n.wreckMax || 1.5),
          b = Math.sin(Math.min(1, p * 1.15) * Math.PI) * 7;
        a.group.position.y += Math.max(0, b), a.group.rotation.set(-d + p * Math.PI * 2.4, r.yaw + p * 2.6, p * Math.PI * 1.6, "YXZ"), a.group.visible = !0;
      }
      if (n.hop > 0) {
        let p = 1 - n.hop / 0.85;
        a.group.rotation.x += (p - 0.5) * 0.6;
      }
      if (n.slip > 0) {
        let p = 1 - n.slip / 1.3,
          b = p * p * (3 - 2 * p);
        a.group.rotation.y += (n.slipDir || 1) * b * Math.PI * 2;
      }
      for (let p of a.wheels) p.rotation.x += n.speed * s / 0.34;
      for (let p of a.frontWheels) p.rotation.y += (-Q(n.steering || 0, -1, 1) * 0.37 - p.rotation.y) * f;
      a.brakeLights && (a.brakeLights.emissiveIntensity = n.stun > 0 || n.braking ? 1.25 : 0.24);
      let m = this.shadows[i];
      m && (m.position.set(r.x, r.y + 0.055, r.z), m.rotation.z = -r.yaw, m.visible = !0);
    }
  }
  render(e, s = [0], o = 0.016, {
    menu: n = !1,
    online: i = !1,
    cinematic: a = null
  } = {}) {
    if (this.resize(), e.phase === "results" && !n) return this.renderPodium(e, o);
    let r = performance.now() / 1e3;
    for (let f of ua) f.offset.y = -(r * 1.4) % 1;
    for (let f of pa) f.emissiveIntensity = 0.75 + 0.35 * (0.5 + 0.5 * Math.sin(r * 6));
    this.setMap(e.mapId), this.syncCars(e, o, i), this.matchId !== e.matchId && (this.matchId = e.matchId, this.effects.reset(), this.driveEffects.reset(), this.carMotion = []), this.effects.sync(e, this.carModels, o, {
      menu: n
    }), this.ambient?.update(o, e), this.driveEffects.sync(e, this.carModels, o, {
      menu: n
    });
    for (let {
      def: f,
      model: y
    } of this.hazardCache.get(e.mapId) || []) y.update(Yt(e.mapId, f, e.time), e.time);
    for (let f = e.cars.length; f < this.carModels.length; f++) this.carModels[f] && (this.carModels[f].group.visible = !1), this.shadows[f] && (this.shadows[f].visible = !1);
    if (n) for (let f = 1; f < this.carModels.length; f++) this.carModels[f] && (this.carModels[f].group.visible = !1), this.shadows[f] && (this.shadows[f].visible = !1);
    let l = !n && !e.ffa,
      c = [];
    for (let f of e.cars) {
      let y = f.id,
        m = this.carModels[y],
        p = this.tags[y];
      p || (p = this.tags[y] = $l(), this.scene.add(p.sprite));
      let b = `${f.name}|${f.team}|${f.human}|${Wn}`;
      if (p.key !== b && (p.key = b, Ol(p, f.name, Ps.trim[f.team] ?? 16183523, f.human, Wn ? f.team ? "\u25A0" : "\u25B2" : "")), c[y] = l && !!m?.group?.visible, c[y]) {
        let w = m.group.position;
        p.sprite.position.set(w.x, w.y + 1.85, w.z);
      }
      p.sprite.visible = c[y];
    }
    for (let f = e.cars.length; f < this.tags.length; f++) this.tags[f] && (this.tags[f].sprite.visible = !1);
    let h = this.carSmooth[s[0]];
    this.sun.target.position.set(h.x, h.y, h.z), this.sun.position.set(h.x - 40, h.y + 75, h.z + 32), this.renderer.shadowMap.needsUpdate = !0, this.layoutCount !== s.length && (this.layoutCount = s.length, this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, s.length > 2 ? 1 : this.quality === "high" ? 1.5 : 1)));
    let u = Yn(s.length, this.width, this.height);
    if (this.renderer.setScissorTest(!0), this.renderer.setViewport(0, 0, this.width, this.height), this.renderer.setScissor(0, 0, this.width, this.height), this.renderer.clear(), s.length === 3) {
      let f = this.cameras[3];
      f.aspect = this.width / this.height, f.clearViewOffset(), f.position.set(40, 235, 165), f.lookAt(0, 0, 0), f.updateProjectionMatrix();
      let y = this.width / 2,
        m = 0;
      this.renderer.setViewport(y, m, this.width / 2, this.height / 2), this.renderer.setScissor(y, m, this.width / 2, this.height / 2), this.renderer.render(this.scene, f);
    }
    return u.forEach((f, y) => {
      let m = e.cars[s[y]] || e.cars[0],
        p = this.carSmooth[m.id],
        b = this.cameras[y];
      if (b.aspect = f.w / f.h, n) {
        let M = performance.now() * 16e-5,
          x = m.yaw + 0.9 + (this.reducedMotion ? 0 : M),
          T = 6.4 + Math.sin(M * 0.7) * 0.25;
        Oe.set(m.x + Math.sin(x) * T, m.y + 2.05 + Math.sin(M * 0.5) * 0.15, m.z + Math.cos(x) * T), this.lookTargets[y].set(m.x, m.y + 0.55, m.z), b.position.copy(Oe), b.lookAt(this.lookTargets[y]), b.fov = 36, f.w / f.h > 1.1 ? b.setViewOffset(f.w, f.h, 0, -f.h * 0.06, f.w, f.h) : b.clearViewOffset();
      } else {
        b.clearViewOffset();
        let M = e.phase === "countdown" ? 1 : 0,
          x = f.w / f.h < 0.85,
          T = Q(Math.abs(m.speed) / Ft, 0, 1.4),
          g = this.camDistance || 1,
          H = ((x ? 8.6 : 7.3) + T * 1.5) * g + M * 3.5,
          v = ((x ? 4.9 : 3.55) - T * 0.3) * (0.85 + g * 0.15) + M * 3.2;
        if (Oe.set(p.x - Math.sin(p.yaw) * H, p.y + v, p.z - Math.cos(p.yaw) * H), !this.reducedMotion) {
          let j = performance.now();
          if (m.impact > 0 && (Oe.x += Math.sin(j * 0.031 + m.id) * m.impact * 0.13, Oe.y += Math.sin(j * 0.047) * m.impact * 0.08), T > 0.75 && !m.airborne) {
            let X = (T - 0.75) * (m.boost > 0 ? 0.09 : 0.05);
            Oe.y += Math.sin(j * 0.09) * X, Oe.x += Math.sin(j * 0.073 + 1.3) * X;
          }
        }
        let R = m.finished && m.finishTime != null ? e.time - m.finishTime : -1;
        if (R >= 0) {
          let j = p.yaw + Math.PI + Math.min(R * 0.5, Math.PI * 1.15),
            X = 7.8 - Math.min(R, 2) * 0.5;
          Oe.set(p.x + Math.sin(j) * X, p.y + 2.4 + Math.min(R, 2) * 0.3, p.z + Math.cos(j) * X);
        }
        let z = R >= 0 ? 0.5 : 10,
          D = new E.Vector3(p.x + Math.sin(p.yaw) * z, p.y + 0.8, p.z + Math.cos(p.yaw) * z),
          F = 1 - Math.exp(-o * (R >= 0 ? 3 : 7.5));
        this.cameraReady[y] ? (b.position.lerp(Oe, F), this.lookTargets[y].lerp(D, F)) : (b.position.copy(Oe), this.lookTargets[y].copy(D), this.cameraReady[y] = !0), b.lookAt(this.lookTargets[y]), b.fov += ((R >= 0 ? 50 : 56 + (this.camFov || 0) + Math.min(T, 1.2) * 10 + (m.boost > 0 ? 8 : 0)) - b.fov) * (1 - Math.exp(-o * 3));
      }
      a && (b.clearViewOffset(), b.position.set(...a.pos), b.lookAt(...a.look), b.fov = a.fov || 50);
      for (let M = 0; M < e.cars.length; M++) {
        let x = this.tags[M];
        if (!x) continue;
        let T = x.sprite.position.distanceTo(b.position),
          g = Q(T / 13, 0.28, 1);
        x.sprite.scale.set(2.9 * g, 0.725 * g, 1), x.sprite.visible = !!c[M] && M !== m.id && T > 3.5;
      }
      b.updateProjectionMatrix();
      let w = this.height - f.y - f.h;
      this.renderer.setViewport(f.x, w, f.w, f.h), this.renderer.setScissor(f.x, w, f.w, f.h), this.renderer.render(this.scene, b);
    }), this.renderer.setScissorTest(!1), u;
  }
  renderPodium(e, s) {
    if (!this.podiumScene) {
      let d = this.podiumScene = new E.Scene();
      d.background = ft(4, 256, (m, p, b) => {
        let w = m.createLinearGradient(0, 0, 0, b);
        w.addColorStop(0, "#05081c"), w.addColorStop(0.55, "#1a1a52"), w.addColorStop(1, "#2a1f4f"), m.fillStyle = w, m.fillRect(0, 0, p, b);
      }), d.environment = this.scene.environment, d.fog = new E.Fog(1183540, 28, 60), d.add(new E.HemisphereLight(13227775, 3811925, 1));
      let u = new E.DirectionalLight(16773334, 3.2);
      u.position.set(-6, 12, 10), u.castShadow = !0, u.shadow.mapSize.set(1024, 1024), Object.assign(u.shadow.camera, {
        left: -12,
        right: 12,
        top: 12,
        bottom: -12,
        near: 1,
        far: 40
      }), u.shadow.bias = -4e-4, d.add(u);
      let f = new E.PointLight(4184319, 40, 26, 1.6);
      f.position.set(-8, 5, -3);
      let y = new E.PointLight(16734880, 40, 26, 1.6);
      y.position.set(8, 5, -3), d.add(f, y), this.podiumSpot = new E.SpotLight(16770736, 120, 30, 0.32, 0.5, 1.4), this.podiumSpot.position.set(0, 13, 5), this.podiumSpot.target.position.set(0, 1.6, 0), d.add(this.podiumSpot, this.podiumSpot.target), this.stage = Ji(), d.add(this.stage.group), this.podiumCamera = new E.PerspectiveCamera(42, 1, 0.1, 90), this.podiumCars = [], this.podiumTime = 0;
    }
    if (this.podiumMatch !== e.matchId) {
      this.podiumMatch = e.matchId, this.podiumTime = 0;
      for (let u of this.podiumCars) u && (this.podiumScene.remove(u.group), u.dispose?.());
      let d = (e.results?.podium || e.results?.rows?.slice(0, 3).map(u => u.id) || []).filter(u => e.cars[u]).slice(0, this.stage.spots.length);
      this.podiumCars = d.map((u, f) => {
        let y = e.cars[u],
          m = qs({
            style: y.style,
            ...da(y, e.ffa)
          });
        return m.group.traverse(p => {
          p.isMesh && (p.castShadow = !0);
        }), this.podiumScene.add(m.group), m.group.visible = !1, m;
      });
    }
    this.podiumTime += s;
    let o = this.podiumTime,
      n = d => (d = Q(d, 0, 1), 1 - Math.pow(1 - d, 3));
    this.stage.update(o);
    let i = [1.55, 0.9, 0.35];
    this.podiumCars.forEach((d, u) => {
      let f = this.stage.spots[u],
        y = (o - i[u]) / 0.55;
      if (!d || (d.group.visible = y > 0, y <= 0)) return;
      let m = y < 1 ? (1 - y) * (1 - y) * 7 : 0,
        p = y >= 1 && y < 1.6 ? Math.sin((y - 1) / 0.6 * Math.PI) * 0.35 * (1.6 - y) : 0;
      d.group.position.set(f.position[0], f.position[1] + m + p, f.position[2]), d.group.rotation.set(0, f.yaw + (u === 0 && y > 1.4 ? Math.sin((o - i[0] - 0.8) * 0.7) * 0.55 : 0), 0);
      for (let b of d.wheels) b.rotation.x += s * (y < 1 ? 14 : 0);
    });
    let a = this.podiumCamera,
      r = this.width,
      l = this.height,
      c = n(o / 2.8),
      h = this.reducedMotion ? 0 : Math.sin(o * 0.25) * 0.8;
    return a.aspect = r / l, a.position.set(1.2 + c * 3.2 + h, 1.8 + c * 2.9, 9.5 + c * 7.8), r / l > 1.95 && (a.position.z *= 1.18, a.position.y *= 1.1), a.lookAt(0, 2.3 - c * 0.25, 0), a.fov = 46 - c * 1, this.podiumCentered ? a.clearViewOffset() : r / l > 1.2 ? a.setViewOffset(r, l, r * (r / l > 1.95 ? 0.17 : 0.235), l * 0.08, r, l) : a.setViewOffset(r, l, 0, -l * 0.2, r, l), a.updateProjectionMatrix(), this.renderer.shadowMap.needsUpdate = !0, this.renderer.setScissorTest(!1), this.renderer.setViewport(0, 0, r, l), this.renderer.clear(), this.renderer.render(this.podiumScene, a), [{
      x: 0,
      y: 0,
      w: r,
      h: l
    }];
  }
};
var ut = Object.freeze([{
    label: "WASD",
    up: "KeyW",
    down: "KeyS",
    left: "KeyA",
    right: "KeyD",
    drift: "ShiftLeft",
    fire: "",
    cycle: "",
    share: "KeyE",
    reset: "KeyR",
    signal: "KeyC",
    slots: ["Digit1", "Digit2", "Digit3"],
    hint: "WASD \xB7 Shift drift \xB7 1-2-3 use power \xB7 E share \xB7 C signal \xB7 R recover"
  }, {
    label: "Arrow keys",
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
    drift: "ShiftRight",
    fire: "Enter",
    cycle: "Period",
    share: "Slash",
    reset: "Backspace",
    signal: "Comma",
    hint: "Arrows \xB7 Right Shift drift \xB7 Enter power \xB7 . switch \xB7 / share \xB7 , signal \xB7 Backspace recover"
  }, {
    label: "IJKL",
    up: "KeyI",
    down: "KeyK",
    left: "KeyJ",
    right: "KeyL",
    drift: "AltLeft",
    fire: "KeyU",
    cycle: "KeyO",
    share: "KeyP",
    reset: "Semicolon",
    signal: "BracketLeft",
    hint: "IJKL \xB7 Left Alt drift \xB7 U power \xB7 O switch \xB7 P share \xB7 [ signal \xB7 ; recover"
  }, {
    label: "TFGH",
    up: "KeyT",
    down: "KeyG",
    left: "KeyF",
    right: "KeyH",
    drift: "ControlLeft",
    fire: "KeyY",
    cycle: "KeyB",
    share: "KeyN",
    reset: "KeyM",
    signal: "KeyV",
    hint: "TFGH \xB7 Left Ctrl drift \xB7 Y power \xB7 B switch \xB7 N share \xB7 V signal \xB7 M recover"
  }]),
  Vl = new Set(ut.flatMap(t => [t.up, t.down, t.left, t.right, t.drift, t.fire, t.cycle, t.share, t.reset, t.signal, ...(t.slots || [])])),
  Yl = ["fire", "cycle", "share", "reset", "signal"],
  vo = class {
    constructor({
      onPause: e = () => {},
      onGesture: s = () => {}
    } = {}) {
      this.keys = new Set(), this.edges = new Set(), this.padEdges = new Map(), this.previousPads = new Map(), this.padPause = new Map(), this.bindings = ["keys0"], this.autoThrottle = !0, this.enabled = !1, this.touchHeld = new Set(), this.touchEdges = new Set(), this.touchActive = !1, window.addEventListener("keydown", o => {
        ["INPUT", "SELECT", "TEXTAREA"].includes(o.target?.tagName) || (this.enabled && Vl.has(o.code) && o.preventDefault(), o.code === "Escape" && !o.repeat && (e(), o.preventDefault()), this.keys.has(o.code) || this.edges.add(o.code), this.keys.add(o.code), s());
      }), window.addEventListener("keyup", o => {
        this.keys.delete(o.code);
      }), window.addEventListener("blur", () => this.clear()), window.addEventListener("pointerdown", s), this.onPause = e;
    }
    pads() {
      return [...(navigator.getGamepads?.() || [])].filter(Boolean);
    }
    configure(e, s = !0) {
      this.bindings = [...e], this.autoThrottle = s, this.arrowAlias = !this.bindings.includes("keys1"), this.clear();
    }
    clear() {
      this.keys.clear(), this.edges.clear(), this.padEdges.clear(), this.touchHeld.clear(), this.touchEdges.clear();
    }
    touchPress(e) {
      if (/^(slot|share|reset)/.test(e)) {
        this.touchEdges.add(e);
        return;
      }
      this.touchHeld.has(e) || this.touchEdges.add(e), this.touchHeld.add(e);
    }
    touchRelease(e) {
      this.touchHeld.delete(e);
    }
    poll() {
      for (let e of this.pads()) {
        let s = e.buttons.map(i => i.pressed),
          o = this.previousPads.get(e.index) || [],
          n = this.padEdges.get(e.index) || new Set();
        for (let i = 0; i < s.length; i++) s[i] && !o[i] && n.add(i);
        this.padEdges.set(e.index, n), this.previousPads.set(e.index, s), this.enabled && s[9] && !o[9] && this.onPause();
      }
    }
    sample(e = 0, s = !0) {
      let o = this.bindings[e] || "keys0",
        n = {
          ...Mt
        };
      if (o.startsWith("pad")) {
        let i = Number(o.slice(3)),
          a = (navigator.getGamepads?.() || [])[i];
        if (!a) return n;
        let r = d => Math.abs(d) < 0.13 ? 0 : Math.sign(d) * (Math.abs(d) - 0.13) / 0.87,
          l = this.padEdges.get(i) || new Set();
        n.steer = Q(r(a.axes[0] || 0), -1, 1);
        let c = a.buttons[7]?.value || 0,
          h = a.buttons[6]?.value || 0;
        n.throttle = c > 0.05 ? c : this.autoThrottle && h < 0.2 ? 1 : 0, n.brake = h > 0.2, n.drift = a.buttons[0]?.pressed === !0, n.fire = l.has(2), n.cycle = l.has(4), n.share = l.has(3), n.reset = l.has(8), n.signal = l.has(1), s && this.padEdges.set(i, new Set());
      } else {
        let i = ut[Number(o.slice(4))] || ut[0],
          a = o === "keys0" && this.arrowAlias ? ut[1] : null,
          r = l => this.keys.has(i[l]) || !!a && this.keys.has(a[l]);
        n.steer = (r("right") ? 1 : 0) - (r("left") ? 1 : 0), n.brake = r("down"), n.throttle = r("up") ? 1 : n.brake ? 0 : this.autoThrottle ? 1 : 0, n.drift = this.keys.has(i.drift);
        for (let l of Yl) n[l] = this.edges.has(i[l]), s && this.edges.delete(i[l]);
        if ((i.slots || []).forEach((l, c) => {
          this.edges.has(l) && (n.slot = c + 1, s && this.edges.delete(l));
        }), e === 0 && this.touchActive) {
          let l = this.touchHeld,
            c = this.touchEdges;
          n.steer = Q(n.steer + (l.has("right") ? 1 : 0) - (l.has("left") ? 1 : 0), -1, 1), n.drift = n.drift || l.has("drift"), l.has("brake") && (n.brake = !0), n.throttle = r("up") ? 1 : n.brake ? 0 : 1, [1, 2, 3].forEach(h => {
            c.has("slot" + h) && (n.slot = h);
          }), c.has("share") && (n.share = !0), c.has("reset") && (n.reset = !0), s && c.clear();
        }
      }
      return n;
    }
    description(e) {
      return e?.startsWith("pad") ? "Left stick \xB7 RT throttle \xB7 LT brake \xB7 A drift \xB7 X power \xB7 LB switch \xB7 Y share \xB7 B signal \xB7 View recover" : ut[Number(e?.slice(4)) || 0].hint;
    }
  };
var _l = t => t + (["th", "st", "nd", "rd"][(t % 100 - 20) % 10] || ["th", "st", "nd", "rd"][t % 100] || "th"),
  Ht = t => String(t).replace(/[&<>"']/g, e => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[e]),
  ma = {
    left: "M15 4 7 12l8 8",
    right: "M9 4l8 8-8 8",
    recover: "M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4",
    share: "M12 3v12M7 8l5-5 5 5M5 14v6h14v-6",
    trophy: "M8 4h8v5a4 4 0 0 1-8 0V4M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v4M8.5 20h7M10 17h4",
    globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M3 12h18M12 3c3.2 3.2 3.2 14.8 0 18M12 3c-3.2 3.2-3.2 14.8 0 18",
    bolt: "M13 2 4 13h7l-1 9 10-13h-7l0-7",
    shield: "M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6z",
    crosshair: "M12 2v4m0 12v4M2 12h4m12 0h4M5 5l3 3m8 8 3 3M5 19l3-3m8-8 3-3M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
    target: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10M12 10v4m-2-2h4",
    wave: "M2 13c2-8 4-8 6 0s4 8 6 0 4-8 8 0",
    mine: "M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
    plus: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6z",
    volume: "M3 9h4l5-5v16l-5-5H3zM16 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14",
    muted: "M3 9h4l5-5v16l-5-5H3zM16 9l6 6m0-6-6 6",
    fullscreen: "M3 9V3h6m6 0h6v6m0 6v6h-6M9 21H3v-6",
    pause: "M7 4v16M17 4v16",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    car: "M5 10l2-5h10l2 5M3 10h18v7H3zM5 17v3m14-3v3M6 13h2m8 0h2",
    flag: "M4 22V3m0 0h15l-3 4 3 4H4",
    people: "M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M1 22v-3c0-5 14-5 14 0v3M17 4a4 4 0 0 1 0 8m0 3c5 0 6 2 6 7",
    close: "M5 5l14 14M19 5 5 19",
    check: "M4 12l5 5L20 6",
    back: "M20 12H4m6-6-6 6 6 6",
    swap: "M4 8h14l-4-4M20 16H6l4 4"
  };
function Re(t, e = "") {
  return `<svg class="icon ${e}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ma[t] || ma.bolt}"/></svg>`;
}
function ya(t) {
  let e = ee(t),
    s = e.samples.filter((h, d) => d % 8 === 0),
    o = s.map(h => h.x),
    n = s.map(h => h.z),
    i = Math.min(...o) - 9,
    a = Math.min(...n) - 9,
    r = Math.max(...o) - i + 9,
    l = Math.max(...n) - a + 9,
    c = s.map((h, d) => `${d ? "L" : "M"}${h.x.toFixed(1)},${h.z.toFixed(1)}`).join(" ") + " Z";
  return `<svg class="track-outline" viewBox="${i} ${a} ${r} ${l}"><path d="${c}" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="${c}" fill="none" stroke="#102d38" stroke-width="2" stroke-dasharray="1 4"/></svg>`;
}
var rs = t => t ? "team-red" : "team-blue",
  ql = t => `${Dt[t]} TEAM`,
  Kl = ["BEDROOM", "KITCHEN", "BACKYARD", "BATHROOM", "GARAGE"],
  Xl = ["#00aebb", "#3a6fe0", "#7b58d6", "#ff6fa8", "#e54632", "#8a1f2d", "#f0892c", "#f2b33d", "#2fbf6f", "#f6f0e3", "#c0c8cc", "#1e2a33"],
  Zl = ["#f6f0e3", "#111a20", "#ffd24a", "#ff4d6d", "#3fd8ff", "#7fe85a", "#b57bff", "#ff9a3a"],
  Jl = ["#c9d2d6", "#2a2f33", "#d8b04a", "#f4f6f7", "#ff4d6d", "#3fd8ff"],
  ba = ["Comet GT", "Trail Sport", "Pocket Rally", "Rocket Rod"];
function So(t, e = "coop") {
  return t <= 1 ? [0] : t === 2 ? e === "versus" ? [0, 2] : [0, 1] : t === 3 ? [0, 1, 2] : [0, 1, 2, 3];
}
var Ro = class {
  constructor(e, s = {}) {
    this.root = e, this.handlers = s, this.menu = document.createElement("section"), this.menu.className = "menu", e.append(this.menu), this.hud = document.createElement("div"), this.hud.className = "hud-layer", e.append(this.hud), this.modal = document.createElement("div"), this.modal.className = "modal-root", e.append(this.modal), this.toastEl = document.createElement("div"), this.toastEl.className = "toast", e.append(this.toastEl), this.toastTimer = 0, this.lastHud = 0, this.hudCards = [], this.lastCountdown = null, this.settings = {
      mapId: "bedroom",
      mode: "solo",
      players: 2,
      teamMode: "coop",
      style: 0,
      cup: !1,
      autoThrottle: !0,
      bindings: ["keys0", "keys1", "keys2", "keys3"],
      quality: "high",
      volume: 0.38,
      laps: 2,
      botSkill: "normal",
      powers: "all",
      reverse: !1,
      camera: "normal",
      fov: "normal",
      colorblind: !1,
      rumble: !0,
      paint: {
        body: "#00aebb",
        accent: "#f6f0e3",
        rims: "#c9d2d6",
        finish: "gloss"
      }
    }, this.muted = !1, this.lobbyData = null, this.busy = !1;
    let o = new Map(),
      n = i => {
        let a = o.get(i.pointerId);
        a && (o.delete(i.pointerId), a.el.classList.remove("held"), s.touch?.(a.action, !1));
      };
    this.hud.addEventListener("pointerdown", i => {
      let a = i.target.closest("[data-touch]");
      if (!a) return;
      i.preventDefault();
      let r = a.dataset.touch;
      o.set(i.pointerId, {
        el: a,
        action: r
      }), a.classList.add("held");
      try {
        a.setPointerCapture(i.pointerId);
      } catch {}
      s.touch?.(r, !0);
    });
    for (let i of ["pointerup", "pointercancel", "lostpointercapture"]) this.hud.addEventListener(i, n);
    this.releaseTouches = () => {
      for (let i of [...o.keys()]) n({
        pointerId: i
      });
    }, e.addEventListener("click", i => {
      if (!this.phone) return;
      let a = i.target.closest("label")?.querySelector("select");
      a && (i.preventDefault(), i.stopImmediatePropagation(), a.selectedIndex = (a.selectedIndex + 1) % a.options.length, a.dispatchEvent(new Event("change", {
        bubbles: !0
      })));
    }, !0), e.addEventListener("click", i => {
      let a = i.target.closest("[data-action]");
      if (!a || a.disabled) return;
      let r = a.dataset.action;
      r === "map" && (this.settings.mapId = a.dataset.value, this.renderMenu(), s.map?.(this.settings.mapId)), r === "mode" && (this.settings.mode = a.dataset.value, this.renderMenu()), r === "players" && (this.settings.players = Number(a.dataset.value), this.renderMenu()), r === "teams" && (this.settings.teamMode = a.dataset.value, this.renderMenu()), r === "style" && (this.settings.style = Number(a.dataset.value), this.renderMenu(), s.style?.(this.settings.style)), r === "cup" && (this.settings.cup = !this.settings.cup, this.renderMenu()), r === "paint-open" && this.showPaint(), r === "paint" && (this.settings.paint = {
        ...this.settings.paint,
        [a.dataset.key]: a.dataset.value
      }, s.paint?.(), this.showPaint(), this.renderMenu()), r === "paint-close" && this.closeModal(), r === "auto" && (this.settings.autoThrottle = !this.settings.autoThrottle, this.renderMenu()), r === "start" && s.start?.({
        ...this.settings,
        bindings: [...this.settings.bindings]
      }), r === "sound" && (this.muted = !this.muted, s.mute?.(this.muted), this.updateSound()), r === "help" && this.showHelp(), (r === "leaderboard" || r === "lb-tab") && s.leaderboard?.(a.dataset.map || this.settings.mapId), r === "settings" && this.showSettings(), r === "close" && this.closeModal(), r === "pause" && s.pause?.(), r === "resume" && (this.closeModal(), s.resume?.()), r === "quit" && (this.closeModal(), s.quit?.()), r === "restart" && (this.closeModal(), s.restart?.()), r === "next" && s.next?.(), r === "invite" && s.invite?.(), r === "switch-team" && s.switchTeam?.(), r === "online-start" && s.onlineStart?.(), r === "leave" && s.leave?.();
    }), e.addEventListener("change", i => {
      let a = i.target.dataset.rule;
      if (a) {
        let l = i.target.value;
        this.settings[a] = a === "laps" ? Number(l) : a === "reverse" ? l === "true" : l, this.renderMenu(), s.rules?.(this.settings);
      }
      i.target.dataset.binding && (this.settings.bindings[Number(i.target.dataset.binding)] = i.target.value), i.target.id === "quality" && (this.settings.quality = i.target.value, s.quality?.(i.target.value));
      let r = i.target.dataset.setting;
      if (r) {
        let l = i.target.value,
          c = l === "true" ? !0 : l === "false" ? !1 : l;
        this.settings[r] = c, s.setting?.(r, c);
      }
    }), e.addEventListener("input", i => {
      i.target.id === "volume" && (this.settings.volume = Number(i.target.value), s.volume?.(this.settings.volume));
    }), this.renderMenu();
  }
  toolbar() {
    return `<div class="toolbar"><button class="icon-button" data-action="help" title="How to play" aria-label="How to play">?</button>${null ? "" : `<button class="icon-button sound-button" data-action="sound" title="Sound on/off" aria-label="Sound on/off">${Re(this.muted ? "muted" : "volume")}</button>`}<button class="icon-button" data-action="settings" title="Settings" aria-label="Settings">\u2699</button></div>`;
  }
  modeExplanation() {
    let e = this.settings;
    return e.mode === "solo" ? "Every car for itself: you against five bots. No teams, just the finishing order." : e.players === 2 ? e.teamMode === "versus" ? "Split screen versus: P1 + bot (Blue) against P2 + bot (Red)." : "Split screen co-op: P1 and P2 team up as Blue against two Red bots." : e.players === 3 ? "P1 and P2 race for Blue. P3 and a bot partner race for Red." : "Full 2v2 split screen: P1 + P2 (Blue) against P3 + P4 (Red).";
  }
  renderMenu(e = []) {
    this.pads = e.length ? e : this.pads || [];
    let s = this.settings;
    this.phone && s.mode === "local" && (s.mode = "solo");
    let o = s.mode === "local" ? So(s.players, s.teamMode) : [0];
    this.menu.classList.add("pm");
    let n = [["solo", "car", "SOLO", "You against five bots"], ["local", "people", "LOCAL CO-OP", "2\u20134 players \xB7 one screen"]].filter(h => !(this.phone && h[0] === "local")),
      i = Ye.find(h => h.id === s.mapId),
      a = (s.style + 3) % 4,
      r = (s.style + 1) % 4,
      l = s.mode === "local" ? `<div class="player-line"><span>PLAYERS</span><div class="count-buttons">${[2, 3, 4].map(h => `<button data-action="players" data-value="${h}" class="${s.players === h ? "selected" : ""}">${h}</button>`).join("")}</div></div>${s.players === 2 ? `<div class="player-line"><span>TEAMS</span><div class="count-buttons team-buttons"><button data-action="teams" data-value="coop" class="${s.teamMode !== "versus" ? "selected" : ""}">Co-op</button><button data-action="teams" data-value="versus" class="${s.teamMode === "versus" ? "selected" : ""}">Versus</button></div></div>` : ""}<div class="binding-grid">${o.map((h, d) => this.bindingSelect(d, h)).join("")}</div>` : s.mode === "solo" && !this.phone ? `<div class="solo-binding">${this.bindingSelect(0, 0)}</div>` : "",
      c = s.cup ? "START THE CUP" : "START RACE";
    this.menu.innerHTML = `<div class="pm-shade"></div>
    <header class="pm-top"><div class="pm-brand"><span class="pm-badge">${Re("car")}</span><span>TOYBOX <b>RALLY</b></span></div><div class="pm-top-right">${this.playerName && this.playerName !== "PLAYER" ? `<span class="pm-player"><i></i>${Ht(this.playerName)}</span>` : ""}${this.toolbar()}</div></header>
    <main class="pm-grid">
      <section class="pm-left">
        <div class="pm-logo"><span class="pm-kicker">TOYBOX GRAND PRIX \xB7 SEASON 01</span><h1><span class="pm-logo-toy">TOYBOX</span><span class="pm-logo-rally">RALLY</span></h1><p>Small cars. Big trouble.</p></div>
        <div class="pm-modes">${n.map(([h, d, u, f]) => `<button class="pm-mode ${s.mode === h ? "on" : ""}" data-action="mode" data-value="${h}"><span class="pm-mode-icon">${Re(d)}</span><span class="pm-mode-text"><b>${u}</b><small>${f}</small></span></button>`).join("")}</div>
        <div class="pm-detail"><p>${this.modeExplanation()}</p>${l}</div>
        <button class="pm-start start-button" data-action="start" ${this.busy ? "disabled" : ""}><span><small>${s.mapId === "random" ? "RANDOM TRACK" : (i?.name || "").toUpperCase()}</small>${c}</span>${Re("arrow")}</button>
      </section>
      <section class="pm-center">
        <div class="pm-car"><button class="pm-arrow" data-action="style" data-value="${a}" aria-label="Previous car">\u2039</button><div class="pm-car-name"><small>CAR ${s.style + 1} / 4</small><b>${ba[s.style]}</b><span class="pm-dots">${[0, 1, 2, 3].map(h => `<i class="${h === s.style ? "on" : ""}"></i>`).join("")}</span></div><button class="pm-arrow" data-action="style" data-value="${r}" aria-label="Next car">\u203A</button></div>
        <button class="paint-button" data-action="paint-open"><span class="paint-dots"><i style="--c:${s.paint.body}"></i><i style="--c:${s.paint.accent}"></i><i style="--c:${s.paint.rims}"></i></span>PAINT SHOP <small>${s.paint.finish.toUpperCase()}</small></button>
      </section>
      <aside class="pm-right">
        <div class="pm-head"><span>SELECT TRACK</span><b>${s.laps} LAP${s.laps > 1 ? "S" : ""} \xB7 ${s.reverse ? "REVERSE" : "FORWARD"}</b></div>
        <div class="pm-tracks">${Ye.map((h, d) => `<button class="pm-track ${s.mapId === h.id ? "on" : ""}" data-action="map" data-value="${h.id}" style="--map-color:${h.color}"><span class="pm-track-art">${ya(h.id)}</span><span class="pm-track-text"><b>${h.name}</b><small>${Kl[d]} \xB7 ${(ee(h.id).length / 1e3).toFixed(2)} KM</small></span><span class="pm-track-num">0${d + 1}</span></button>`).join("")}<button class="pm-track pm-random ${s.mapId === "random" ? "on" : ""}" data-action="map" data-value="random" style="--map-color:#f7c35c"><span class="pm-track-art"><span class="random-mark">?</span></span><span class="pm-track-text"><b>Random Track</b><small>SURPRISE \xB7 ANY OF 5</small></span><span class="pm-track-num">06</span></button></div>
        <div class="pm-rules">${this.rule("laps", "LAPS", [[1, "1 lap"], [2, "2 laps"], [3, "3 laps"], [4, "4 laps"]])}${this.rule("botSkill", "BOTS", [["easy", "Easy"], ["normal", "Normal"], ["hard", "Hard"]])}${this.rule("powers", "POWERS", [["all", "All 8"], ["nitro", "Nitro only"], ["rockets", "Rockets only"]])}${this.rule("reverse", "DIRECTION", [[!1, "Forward"], [!0, "Reverse"]])}</div>
        <div class="pm-toggles"><button data-action="cup" class="switch-row ${s.cup ? "on" : ""}"><span class="switch"></span><span>3-track cup</span></button><button data-action="auto" class="switch-row ${s.autoThrottle ? "on" : ""}"><span class="switch"></span><span>Auto throttle</span></button></div>
      </aside>
    </main>
    <footer class="pm-foot"><span>8 POWERS</span><i></i><span>4 SHORTCUTS</span><i></i><span>5 TRACKS + RANDOM</span><i></i><span>GHOST RACES</span><button data-action="help">CONTROLS ${Re("arrow")}</button></footer>`;
  }
  playIntro(e, s = () => {}) {
    let o = document.createElement("div");
    o.className = "intro-reel", o.innerHTML = `<div class="ir-black"></div><div class="ir-vignette"></div><div class="ir-bars"><i></i><i></i></div><div class="ir-credit"><span class="ir-at">${Ht(e)}</span><span class="ir-line"></span><span class="ir-presents">PRESENTS</span></div><div class="ir-features"><b>5 TRACKS</b><i></i><b>8 POWERS</b><i></i><b>SOLO &amp; LOCAL PLAY</b></div><div class="ir-title"><span class="ir-kicker">A TOYBOX GRAND PRIX</span><h1><span class="ir-toy">TOYBOX</span><span class="ir-rally">RALLY</span></h1><span class="ir-tag">SMALL CARS. BIG TROUBLE.</span></div><div class="ir-flash"></div><span class="ir-skip">CLICK OR PRESS ANY KEY TO SKIP</span>`, this.root.append(o);
    let n = !1,
      i = () => {
        n || (n = !0, clearTimeout(r), window.removeEventListener("keydown", a, !0));
      },
      a = () => {
        n || (i(), this.introClear = null, o.classList.add("out"), this.menu.classList.add("pm-reveal"), setTimeout(() => o.remove(), 800), setTimeout(() => this.menu.classList.remove("pm-reveal"), 1800), s());
      };
    this.introClear = () => {
      i(), o.remove(), this.menu.classList.remove("pm-reveal");
    };
    let r = setTimeout(a, 7200);
    window.addEventListener("keydown", a, !0), o.addEventListener("pointerdown", a);
  }
  dropIntro() {
    let e = this.introClear;
    this.introClear = null, e?.();
  }
  bindingSelect(e, s) {
    let o = dt(s);
    return `<label class="binding ${rs(o)}"><span>P${e + 1} \xB7 ${Dt[o]}</span><select aria-label="Player ${e + 1} controls" data-binding="${e}">${ut.map((n, i) => `<option value="keys${i}" ${this.settings.bindings[e] === `keys${i}` ? "selected" : ""}>${n.label}</option>`).join("")}${(this.pads || []).map(n => `<option value="pad${n.index}" ${this.settings.bindings[e] === `pad${n.index}` ? "selected" : ""}>Gamepad ${n.index + 1}</option>`).join("")}</select></label>`;
  }
  settingSelect(e, s, o) {
    return `<label class="setting-line">${s}<select data-setting="${e}" aria-label="${s}">${o.map(([n, i]) => `<option value="${n}" ${String(this.settings[e]) === String(n) ? "selected" : ""}>${i}</option>`).join("")}</select></label>`;
  }
  rule(e, s, o) {
    return `<label class="rule"><span>${s}</span><select data-rule="${e}" aria-label="${s}">${o.map(([n, i]) => `<option value="${n}" ${String(this.settings[e]) === String(n) ? "selected" : ""}>${i}</option>`).join("")}</select></label>`;
  }
  setBusy(e) {
    this.busy = e, this.menu.hidden || this.renderMenu();
  }
  showMenu() {
    this.menu.hidden = !1, this.hud.hidden = !0, this.modal.innerHTML = "", this.modal.classList.remove("results-stage"), this.renderMenu();
  }
  hideMenu() {
    this.menu.hidden = !0, this.hud.hidden = !1;
  }
  updateSound() {
    for (let e of this.root.querySelectorAll(".sound-button")) e.innerHTML = Re(this.muted ? "muted" : "volume");
  }
  toast(e) {
    this.toastEl.textContent = e, this.toastEl.classList.add("visible"), clearTimeout(this.toastTimer), this.toastTimer = setTimeout(() => this.toastEl.classList.remove("visible"), 3600);
  }
  showHelp() {
    this.modal.innerHTML = `<section class="modal help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title"><button class="modal-close icon-button" data-action="close" aria-label="Close">${Re("close")}</button><span class="eyebrow">SMALL CARS, BIG PLANS</span><h2 id="help-title">Win together.</h2><p>Two Blue cars race two Red cars. Finishing positions score ${$n.join(", ")} points; the team with the higher total wins. Empty seats are filled by bots.</p><div class="help-controls">${this.phone ? "<div><b>TOUCH</b><span>Auto throttle \xB7 \u25C0 \u25B6 steer<br>Hold DRIFT while turning \xB7 BRAKE to slow down<br>Tap a power slot to use it \xB7 RECOVER if you are stuck</span></div>" : ""}<div class="kb-help"><b>KEYBOARD / P1</b><span>WASD or arrows to drive \xB7 Shift drift<br>1 / 2 / 3 use the power in that slot<br>E share Nitro/Shield \xB7 C signal \xB7 R recover<br>Hold X restart \xB7 Esc pause</span></div><div><b>GAMEPAD</b><span>Left stick \xB7 RT throttle \xB7 LT brake<br>A drift \xB7 X power \xB7 LB switch<br>Y share \xB7 B signal \xB7 View recover</span></div></div><div class="power-guide">${Object.entries(xo).map(([e, s]) => `<div style="--power:${s.color}">${wn(e)}<span><b>${s.name}</b><small>${s.help}</small></span></div>`).join("")}</div><p class="help-tip">Hold a drift through a corner, then release it for a short turbo. Press E to hand Nitro or a Shield to your teammate within 25 m. Tucking in behind your teammate gives you a slipstream boost, and driving side by side (TEAM LINK) slowly repairs both cars. Press C (gamepad B) to signal your teammate: it asks for Nitro or a Shield, or tells them to wait or draft. A 1\u20132 finish earns your team +${wo} bonus points.</p><p class="help-tip">Enter a shortcut by steering towards the side of the yellow arrows. Stay on the narrow path and hit the minimum speed on the sign before a jump; miss it and you rejoin the main road with a small time loss. The cat paw, rolling fruit and sprinklers move after a yellow warning. Soap, oil and spilled milk make your tyres slip; mud and jam slow you down. Drifts, hits, shares, blocks and shortcuts earn awards at the finish.</p><button class="primary-button" data-action="close">GOT IT ${Re("check")}</button></section>`;
  }
  showSettings() {
    this.modal.innerHTML = `<section class="modal compact-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><button class="modal-close icon-button" data-action="close" aria-label="Close">${Re("close")}</button><span class="eyebrow">SETTINGS</span><h2 id="settings-title">Fine tuning.</h2><label class="setting-line">Volume<input id="volume" type="range" min="0" max="1" step=".01" value="${this.settings.volume}"/></label><label class="setting-line">Graphics<select id="quality"><option value="high" ${this.settings.quality === "high" ? "selected" : ""}>High</option><option value="medium" ${this.settings.quality === "medium" ? "selected" : ""}>Smooth / lower resolution</option></select></label>${this.settingSelect("camera", "Camera", [["near", "Close"], ["normal", "Normal"], ["far", "Far"]])}${this.settingSelect("fov", "Field of view", [["narrow", "Narrow"], ["normal", "Normal"], ["wide", "Wide"]])}${this.settingSelect("colorblind", "Colorblind mode", [[!1, "Off"], [!0, "On: blue vs amber + team shapes"]])}${this.settingSelect("rumble", "Gamepad rumble", [[!0, "On"], [!1, "Off"]])}<p>Use Smooth for 3\u20134 player split screen. Connect a gamepad and press any button so it shows up in the control list.</p><button class="primary-button" data-action="close">DONE ${Re("check")}</button></section>`;
  }
  showPause(e = !1) {
    this.modal.innerHTML = `<section class="modal compact-modal" role="dialog" aria-modal="true"><span class="eyebrow">${e ? "ONLINE RACE STILL RUNNING" : "PIT STOP"}</span><h2>${e ? "Controls on hold." : "Take a breath."}</h2><p>${e ? "Everyone else keeps racing. Your car brakes; a bot takes over if you stay away too long." : "Pick up right where you left off when you are ready."}</p><button class="primary-button" data-action="resume">RESUME ${Re("arrow")}</button>${e ? "" : '<button class="secondary-button" data-action="restart">RESTART</button>'}<button class="text-button" data-action="quit">${e ? "LEAVE LOBBY" : "MAIN MENU"}</button></section>`;
  }
  closeModal() {
    this.modal.innerHTML = "", this.modal.classList.remove("results-stage", "paint-stage"), this.menu.classList.remove("painting");
  }
  showPaint() {
    let e = this.settings.paint,
      s = (o, n, i) => `<div class="paint-row"><span>${n}</span><div class="swatches">${i.map(a => `<button class="swatch ${e[o] === a ? "on" : ""}" data-action="paint" data-key="${o}" data-value="${a}" style="--c:${a}" aria-label="${n} ${a}"></button>`).join("")}</div></div>`;
    this.modal.classList.add("paint-stage"), this.menu.classList.add("painting"), this.modal.innerHTML = `<section class="modal paint-modal" role="dialog" aria-modal="true" aria-label="Paint shop"><button class="modal-close icon-button" data-action="paint-close" aria-label="Close">\xD7</button><span class="eyebrow">PAINT SHOP</span><h2>${ba[this.settings.style]}</h2>${s("body", "BODY", Xl)}${s("accent", "STRIPES", Zl)}${s("rims", "RIMS", Jl)}<div class="paint-row"><span>FINISH</span><div class="finish-choices">${["gloss", "metallic", "matte", "pearl"].map(o => `<button class="finish ${e.finish === o ? "on" : ""}" data-action="paint" data-key="finish" data-value="${o}">${o.toUpperCase()}</button>`).join("")}</div></div><p class="paint-note">Your paint job races with you in every mode. In 2v2 the stripes switch to your team colour.</p><button class="primary-button" data-action="paint-close">DONE</button></section>`;
  }
  showResults(e, {
    cup: s = null,
    online: o = !1,
    host: n = !0,
    teams: i = [0]
  } = {}) {
    let a = e.results || is(e),
      r = s && s.round === 2,
      l = r && !e.ffa ? s.scores[0] === s.scores[1] ? a.winner : s.scores[0] > s.scores[1] ? 0 : 1 : a.winner,
      c = [...new Set(i)],
      h = p => p + (["th", "st", "nd", "rd"][(p % 100 - 20) % 10] || ["th", "st", "nd", "rd"][p % 100] || "th"),
      d = a.rows.find(p => p.human) || a.rows[0],
      u = e.ffa && s?.points ? 1 + s.points.filter((p, b) => b !== d.id && p > s.points[d.id]).length : 0,
      f = e.ffa ? r ? u === 1 ? "Cup champion!" : `Cup finished ${h(u)} overall.` : d.position === 1 ? "You win!" : `You finished ${h(d.position)}.` : c.length === 1 ? l === c[0] ? "Your team wins!" : "Rematch time." : `${Dt[l][0] + Dt[l].slice(1).toLowerCase()} team wins!`;
    this.hud.hidden = !0, this.modal.classList.add("results-stage");
    let y = a.awards || [],
      m = a.rows.slice(0, 3);
    this.modal.innerHTML = `<div class="podium-caption"><span class="eyebrow">SMALL CARS \xB7 BIG SHOWDOWN</span><h2>Chequered flag<span>.</span></h2><div class="podium-names">${[m[1], m[0], m[2]].map(p => `<div class="${(e.ffa ? p.human : p.team === 0) ? "friendly" : ""}"><span>${String(p.position).padStart(2, "0")}</span><b>${Ht(p.name)}</b><small>${p.finished ? $s(p.finishTime) : "RACE POSITION"}</small></div>`).join("")}</div><div class="award-ribbon"><span class="eyebrow">RACE HIGHLIGHTS</span>${y.length ? `<div class="award-cards">${y.map(p => `<article class="award-card ${rs(p.team ?? 0)}">${Re(p.icon)}<div><span>${Ht(p.title)}</span><b>${Ht(p.name)}${p.human ? " <small>PLAYER</small>" : ""}</b><p>${Ht(p.detail)}</p></div></article>`).join("")}</div>` : '<p class="award-empty">Next race, make your mark with drifts, hits, shares and shortcuts.</p>'}</div></div><section class="modal results-modal" role="dialog" aria-modal="true" aria-labelledby="results-title"><span class="eyebrow">${r ? "TOYBOX CUP" : Ys(e.mapId).name.toUpperCase() + (Ot(e.mapId) ? " (REVERSE)" : "")} \xB7 RESULTS</span><h2 id="results-title">${f}</h2>${e.ffa ? `<div class="team-result solo-result"><div><span>YOUR FINISH</span><b>${h(d.position)} / ${a.rows.length}</b></div><span class="score-divider">\xB7</span><div><span>POINTS</span><b>+${d.points}</b></div></div>` : `<div class="team-result"><div><span>BLUE TEAM</span><b>${a.teamScores[0]}</b></div><span class="score-divider">:</span><div><span>RED TEAM</span><b>${a.teamScores[1]}</b></div></div>`}${a.bonusTeam != null ? `<p class="cup-summary bonus-line ${rs(a.bonusTeam)}-text">1\u20132 FINISH \xB7 ${Dt[a.bonusTeam]} TEAM BONUS +${wo}</p>` : ""}${s ? e.ffa && s.points ? `<p class="cup-summary">Cup race ${s.round + 1} / 3 \xB7 Your points <b>${s.points[d.id]}</b> \xB7 Leader <b>${Math.max(...s.points)}</b></p>` : `<p class="cup-summary">Cup race ${s.round + 1} / 3 \xB7 Total <b>${s.scores[0]} : ${s.scores[1]}</b></p>` : ""}<div class="results-table"><div class="results-head"><span>POS</span><span>DRIVER</span><span>TIME</span><span>PTS</span></div>${a.rows.map(p => `<div class="result-row ${(e.ffa ? p.human : p.team === 0) ? "friendly" : ""} ${p.human ? "human" : ""}"><span>${String(p.position).padStart(2, "0")}</span><span class="driver-cell"><span><i></i>${Ht(p.name)}${p.human ? "<small>PLAYER</small>" : ""}</span>${p.human ? `<small class="contribution-line">${p.hits || 0} hits \xB7 ${p.shares || 0} shares \xB7 ${(p.driftTime || 0).toFixed(1)} s drift${p.shortcuts ? " \xB7 " + p.shortcuts + " shortcuts" : ""}</small>` : ""}</span><span>${p.finished ? $s(p.finishTime) : "DNF"}</span><b>+${p.points}</b></div>`).join("")}</div>${!o || n ? `<button class="primary-button" data-action="next">${s && !r ? "NEXT TRACK" : "REMATCH"} ${Re("arrow")}</button>${o ? "" : '<p class="rematch-hint">ENTER / SPACE \xB7 HOLD X IN A RACE TO RESTART</p>'}` : '<p class="waiting-text">Waiting for the host\u2026</p>'}<button class="text-button" data-action="quit">${o ? "LEAVE LOBBY" : "MAIN MENU"}</button></section>`;
  }
  setupHUD(e, s, o, n, i = !1, a = !1) {
    this.hud.classList.toggle("ffa", a), this.hud.innerHTML = `<div class="race-topbar"><span class="race-brand">TOYBOX <b>RALLY</b></span><div class="team-live"><span class="blue-total">BLUE <b>0</b></span><i>:</i><span class="red-total">RED <b>0</b></span></div><button class="icon-button" data-action="pause" title="Pause / Esc" aria-label="Pause">${Re("pause")}</button></div><div class="countdown"></div><div class="race-toast"></div>${e.map((r, l) => `<section class="player-hud ${rs(dt(r))}" data-slot="${r}" style="left:${s[l].x / o * 100}%;top:${s[l].y / n * 100}%;width:${s[l].w / o * 100}%;height:${s[l].h / n * 100}%"><div class="speed-lines"></div><div class="finish-banner"></div><div class="final-lap">FINAL LAP</div><div class="position-box"><b class="position">1</b><span class="car-total">/ ${ia}</span><small>P${i ? r + 1 : l + 1} <i>\xB7</i> ${a ? "SOLO" : Dt[dt(r)]} <i>\xB7</i> <span class="lap">LAP 1 / 2</span></small></div><div class="player-status"></div><div class="course-hint"></div><div class="mate-box"><i class="mate-arrow">\u25B2</i><div><span class="mate-name"></span><b class="mate-dist"></b><div class="mate-health"><i></i></div></div></div><div class="signal-box"></div><div class="power-slots"></div><div class="car-condition"><span class="health-label">BODY</span><div class="health-meter"><i></i></div><div class="drift-meter"><i></i></div></div><div class="speed-box"><b>0</b><span>KM/H</span><small class="speed-state"></small></div></section>`).join("")}<canvas class="minimap" width="240" height="160" aria-label="Track map"></canvas><div class="race-control-hint"></div><div class="network-status"></div>${e.length === 1 ? `<div class="touch-pad" aria-hidden="true"><div class="tp-steer"><button data-touch="left">${Re("left")}</button><button data-touch="right">${Re("right")}</button></div><div class="tp-act"><button class="tp-brake" data-touch="brake">BRAKE</button><button class="tp-drift" data-touch="drift">DRIFT</button></div><div class="tp-mini">${i ? `<button data-touch="share">${Re("share")}<small>SHARE</small></button>` : ""}<button data-touch="reset">${Re("recover")}<small>RECOVER</small></button></div></div>` : ""}`, this.hudCards = [...this.hud.querySelectorAll(".player-hud")], this.mini = this.hud.querySelector(".minimap"), this.lastCountdown = null;
  }
  updateHUD(e, s = [0], o = [], n = 0, i = null) {
    if (n - this.lastHud < 70) return;
    this.lastHud = n;
    let a = Un(e),
      r = is(e).teamScores;
    this.hud.querySelector(".blue-total b").textContent = r[0], this.hud.querySelector(".red-total b").textContent = r[1];
    for (let d = 0; d < s.length; d++) {
      let u = e.cars[s[d]],
        f = this.hudCards[d];
      if (!f || !u) continue;
      f.querySelector(".position").textContent = a.findIndex(_ => _.id === u.id) + 1, f.querySelector(".lap").textContent = `LAP ${Math.min(u.lap + 1, e.laps)} / ${e.laps}`, f.querySelector(".speed-box b").textContent = Math.round(Math.abs(u.speed) * Ln), f.querySelector(".speed-lines").style.opacity = (e.phase !== "racing" || u.finished ? 0 : Math.min(1, Math.max(0, (Math.abs(u.speed) - Ft * 0.62) / (Ft * 0.45)) * 0.7 + (u.boost > 0 ? 0.4 : 0))).toFixed(2);
      let y = e.phase === "racing" && !u.finished && u.lap === e.laps - 1 && e.laps > 1;
      f.dataset.finalLap !== String(y) && (f.dataset.finalLap = String(y), f.querySelector(".final-lap").classList.toggle("show", y));
      let m = f.querySelector(".finish-banner"),
        p = u.finished ? `${u.place}` : "";
      m.dataset.key !== p && (m.dataset.key = p, m.className = "finish-banner" + (u.finished ? " show" + (u.place === 1 ? " gold" : "") : ""), m.innerHTML = u.finished ? `<span class="flag"></span><b>${u.place === 1 ? "WINNER!" : _l(u.place || 1)}</b><small>${u.place === 1 ? "1ST PLACE \xB7 " : "FINISHED \xB7 "}${$s(u.finishTime || 0)}</small>` : ""), f.querySelector(".speed-state").textContent = u.boost > 0 ? "NITRO" : u.slipstream ? "SLIPSTREAM" : u.shield > 0 ? "SHIELD" : u.link ? "TEAM LINK +" : "", f.querySelector(".car-total").textContent = `/ ${e.cars.length}`;
      let b = Mo(e, u);
      if (b) {
        let _ = b.x - u.x,
          Y = b.z - u.z,
          te = Be(Math.atan2(_, Y), u.yaw);
        f.querySelector(".mate-arrow").style.transform = `rotate(${(-te).toFixed(2)}rad)`, f.querySelector(".mate-name").textContent = b.name + (b.human ? "" : " (BOT)"), f.querySelector(".mate-dist").textContent = b.finished ? "FINISHED" : `${Math.round(Math.hypot(_, Y))} m`, f.querySelector(".mate-health i").style.width = `${b.health}%`, f.querySelector(".mate-box").classList.toggle("linked", !!u.link);
      }
      let w = b?.signal && e.time - b.signal.at < 3 ? `${b.name}: ${Dn[b.signal.kind]}` : u.signal && e.time - u.signal.at < 1.6 ? `SENT: ${Dn[u.signal.kind]}` : "",
        M = f.querySelector(".signal-box");
      M.textContent !== w && (M.textContent = w, M.classList.toggle("incoming", !!b?.signal && w.startsWith(b.name))), f.querySelector(".health-meter i").style.width = `${u.health}%`, f.querySelector(".health-meter i").style.background = u.health < 35 ? "#ff8b73" : "#71dfc8", f.querySelector(".drift-meter i").style.width = `${u.driftCharge / 1.8 * 100}%`;
      let x = ut[Number(o[d]?.slice(4)) || 0],
        T = o[d]?.startsWith("pad") ? "X" : x.slots ? "" : x.fire === "Enter" ? "ENTER" : x.fire.slice(3),
        g = u.inventory.join(",") + u.selected;
      f.dataset.inventory !== g && (f.dataset.inventory = g, f.querySelector(".power-slots").innerHTML = Array.from({
        length: 3
      }, (_, Y) => {
        let te = xo[u.inventory[Y]];
        return `<div class="power-slot ${Y === u.selected && te ? "selected" : ""} ${te ? "" : "empty"}" data-touch="slot${Y + 1}" style="--power:${te?.color || "#5c7580"}">${te ? wn(u.inventory[Y]) : "<span>+</span>"}<small>${te?.name || "EMPTY"}</small>${Y === u.selected && te && T ? '<span class="slot-key">' + T + "</span>" : ""}${x.slots && !o[d]?.startsWith("pad") ? '<span class="slot-num">' + (Y + 1) + "</span>" : ""}</div>`;
      }).join(""));
      let H = Zs(e.mapId, u, e.time),
        v = u.shortcut && gt(e.mapId, u.shortcut.id),
        R = !v && Js(e.mapId, u),
        z = f.querySelector(".course-hint");
      z.textContent = v ? `${v.name} \xB7 ${v.jump && u.shortcut.s < v.jump.start ? Math.round(v.jump.minSpeed * Ln) + " KM/H FOR BIG AIR" : u.airborne ? "AIRBORNE!" : "STAY ON THE NARROW PATH"}` : R ? `SHORTCUT ON THE ${R.side < 0 ? "RIGHT" : "LEFT"} \xB7 ${R.name}` : "", z.classList.toggle("active", !!v);
      let D = {
          paw: "WATCH THE CAT PAW!",
          fruit: "FRUIT ROLLING IN!",
          sprinkler: "SPRINKLER AHEAD!"
        },
        F = e.projectiles.some(_ => _.target === u.id && Math.hypot(_.x - u.x, _.z - u.z) < 27),
        j = u.speed > 4 && Math.cos(u.yaw - xs(e.mapId, u).yaw) < -0.35,
        X = o[d]?.startsWith("pad") ? "VIEW" : x.reset.replace(/^Key/, "").toUpperCase();
      f.querySelector(".player-status").innerHTML = u.wreck > 0 ? '<span class="warning-tag">WRECKED! RESPAWNING\u2026</span>' : u.finished ? `<span class="finished-tag">${e.humanFinishAt != null ? `RESULTS IN ${Math.max(1, Math.ceil(Bn - (e.time - e.humanFinishAt)))}` : "VICTORY LAP \xB7 WAITING FOR THE OTHERS"}</span>` : F ? '<span class="warning-tag">ROCKET INCOMING \xB7 SHIELD UP!</span>' : H ? `<span class="warning-tag">${D[H.type]}${H.phase === "warning" ? " \xB7 GET READY" : ""}</span>` : j ? `<span class="warning-tag">WRONG WAY \xB7 TURN AROUND OR PRESS ${X}</span>` : u.stuck > 2 || u.scrape > 1.2 ? `<span class="protect-tag">PRESS ${X} TO GET BACK ON TRACK</span>` : u.protect > 0 ? '<span class="protect-tag">SHORT PROTECTION</span>' : "";
    }
    let l = this.hud.querySelector(".countdown"),
      c = e.phase === "countdown" ? String(Math.ceil(e.countdown)) : e.time < 0.7 ? "GO!" : "";
    this.lastCountdown !== c && (l.textContent = c, l.className = "countdown " + (c ? "pop" : ""), this.lastCountdown = c);
    let h = this.hud.querySelector(".race-control-hint");
    h.textContent = e.time < 8 ? s.length > 1 ? "SHARE NITRO OR SHIELD WITH YOUR TEAMMATE \xB7 " + o.slice(0, s.length).map((d, u) => `P${u + 1} ${d?.startsWith("pad") ? "Y" : {
      KeyE: "E",
      Slash: "/",
      KeyP: "P",
      KeyN: "N"
    }[ut[Number(d?.slice(4)) || 0].share]}`).join(" \xB7 ") : o[0]?.startsWith("pad") ? "LEFT STICK \xB7 A DRIFT \xB7 X POWER \xB7 Y SHARE" : "WASD / ARROWS DRIVE \xB7 SHIFT DRIFT \xB7 1-2-3 POWER \xB7 E SHARE" : "", this.hud.querySelector(".network-status").textContent = i && e.phase !== "results" && n - i.lastPacketAt > 1200 ? "RECONNECTING \xB7 A BOT DRIVES DURING SHORT DROPS" : "", this.drawMini(e, s);
  }
  drawMini(e, s) {
    if (!this.mini) return;
    let o = this.mini.getContext("2d"),
      n = ee(e.mapId),
      i = n.bounds,
      a = i.minX - 7,
      r = i.maxX + 7,
      l = i.minZ - 7,
      c = i.maxZ + 7,
      h = n.samples,
      d = Math.min(216 / (r - a), 136 / (c - l)),
      u = 120 - (a + r) / 2 * d,
      f = 80 - (l + c) / 2 * d;
    o.clearRect(0, 0, 240, 160), o.lineWidth = 6, o.strokeStyle = "rgba(246,242,222,.25)", o.lineJoin = "round", o.beginPath(), h.forEach((m, p) => {
      if (p % 5 !== 0 && p !== h.length - 1) return;
      let b = m.x * d + u,
        w = m.z * d + f;
      p ? o.lineTo(b, w) : o.moveTo(b, w);
    }), o.closePath(), o.stroke(), o.lineWidth = 2, o.strokeStyle = "#edbf70", o.setLineDash([3, 3]);
    for (let m of le(e.mapId).shortcuts) o.beginPath(), m.samples.forEach((p, b) => {
      let w = p.x * d + u,
        M = p.z * d + f;
      b ? o.lineTo(w, M) : o.moveTo(w, M);
    }), o.stroke();
    o.setLineDash([]);
    for (let m of le(e.mapId).hazards) {
      let p = Yt(e.mapId, m, e.time);
      p.phase !== "idle" && (o.fillStyle = p.phase === "warning" ? "#f9c66f" : "#ff8460", o.beginPath(), o.arc(p.center.x * d + u, p.center.z * d + f, 4, 0, Math.PI * 2), o.fill());
    }
    let y = !!this.settings.colorblind;
    for (let m of e.cars) {
      let p = s.includes(m.id),
        b = p ? 4.2 : 2.5,
        w = m.x * d + u,
        M = m.z * d + f;
      o.fillStyle = e.ffa ? m.human ? "#5bdce9" : "#ffb38a" : m.team ? y ? "#ffb000" : "#ff8f78" : y ? "#3b8cff" : "#5bdce9", o.beginPath(), y && !e.ffa ? m.team ? o.rect(w - b, M - b, b * 2, b * 2) : (o.moveTo(w, M - b * 1.2), o.lineTo(w + b * 1.1, M + b * 0.9), o.lineTo(w - b * 1.1, M + b * 0.9), o.closePath()) : o.arc(w, M, b, 0, Math.PI * 2), o.fill(), s.includes(m.id) && (o.strokeStyle = "#fff", o.lineWidth = 1.5, o.stroke());
    }
  }
};
function $s(t) {
  return `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, "0")}`;
}
var wa = (t, e) => (t % e + e) % e,
  ko = t => (t = Math.min(1, Math.max(0, t)), t * t * (3 - 2 * t)),
  Ql = 0;
function jt(t, e) {
  let s = ns({
    mapId: t,
    humans: [],
    carCount: 6,
    ffa: !0,
    laps: 2,
    botSkill: "hard",
    seed: e,
    matchId: `trailer-${t}-${e}-${++Ql}`
  });
  return s.phase = "racing", s.countdown = 0, s;
}
function je(t, e, s, o, n) {
  let i = ee(t.mapId),
    a = i.length,
    r = wa(s, a),
    l = G(i, r, o),
    c = t.cars[e];
  Object.assign(c, {
    x: l.x,
    y: l.y,
    z: l.z,
    yaw: l.yaw,
    s: r,
    raceS: r,
    lane: o,
    speed: n,
    sideSpeed: 0,
    lap: 0
  }), c.nextGate = Math.floor(r / (a / 8)) + 1, c.lastCheckpoint = c.nextGate - 1;
}
var e0 = t => [...t.cars].sort((e, s) => s.raceS - e.raceS)[0],
  Os = (t, e) => {
    let s = ee(t);
    return s.samples[Math.min(s.count, Math.round(e * 80))].s;
  };
function ga(t, e, s, o, n = 54) {
  let i = Math.sin(t.yaw),
    a = Math.cos(t.yaw);
  return {
    pos: [t.x - i * e, t.y + s, t.z - a * e],
    look: [t.x + i * o, t.y + 0.8, t.z + a * o],
    fov: n
  };
}
var _n = null;
function xa() {
  if (_n) return _n;
  let t = ee("garage"),
    e = 1 / 0,
    s = 0,
    o = 0;
  for (let n = Os("garage", 2.5); n < Os("garage", 5.5); n += 2) for (let i = Os("garage", 10.5); i < Os("garage", 13.5); i += 2) {
    let a = G(t, n),
      r = G(t, i),
      l = Math.hypot(a.x - r.x, a.z - r.z);
    l < e && (e = l, s = n, o = i);
  }
  return _n = {
    over: s,
    under: o
  };
}
var Gs = [{
    title: "Lights out",
    moment: "Six toy cars launch off the bedroom grid and blast past a rail-level camera",
    durationMs: 3e3,
    setup: () => jt("bedroom", 9041),
    camera: (t, e) => {
      let s = ee(t.mapId),
        o = e / 3,
        n = G(s, 16 - o * 5, 5.2),
        i = G(s, -14 + o * 16, -1.2);
      return {
        pos: [n.x, n.y + 0.85, n.z],
        look: [i.x, i.y + 0.6, i.z],
        fov: 44
      };
    }
  }, {
    title: "The cat strikes",
    moment: "The giant tabby swipes its paw across the road as the pack arrives",
    durationMs: 3200,
    setup: () => {
      let t = jt("bedroom", 3317),
        e = le("bedroom").hazards[0];
      return t.time = e.offset + e.warningTime - 0.55, [0, 1, 2, 3, 4, 5].forEach(s => je(t, s, e.s - 30 - s * 5.5, s % 2 ? 2.2 : -2.2, 27)), t;
    },
    camera: (t, e) => {
      let s = ee(t.mapId),
        o = le("bedroom").hazards[0],
        n = ko(e / 3.2),
        i = G(s, o.s - 12 + n * 4, -o.side * 15),
        a = G(s, o.s + 2, o.side * 9);
      return {
        pos: [i.x, i.y + 6.5 - n * 1.5, i.z],
        look: [a.x, a.y + 4.5, a.z],
        fov: 56
      };
    }
  }, {
    title: "Homing rocket",
    moment: "A tracker rocket locks on and launches the rival ahead into a fiery somersault",
    durationMs: 3200,
    setup: () => {
      let t = jt("kitchen", 5120);
      je(t, 0, 168, 0, 30), je(t, 1, 184, 0.6, 27), je(t, 2, 208, -2, 28), je(t, 3, 158, -2.2, 29), je(t, 4, 154, 2.2, 29), je(t, 5, 224, 1.5, 28);
      let e = t.cars[0];
      return e.human = !0, e.inventory = ["tracker"], e.selected = 0, e.cooldown = 0, t.trailerFired = !1, t.cars[1].human = !0, t.cars[1].inventory = [], t;
    },
    input: (t, e) => {
      let s = t.cars[0],
        o = e >= 0.4 && !t.trailerFired;
      return o && (t.trailerFired = !0), {
        0: {
          ...As(t, s),
          fire: o,
          cycle: !1,
          share: !1
        },
        1: {
          ...As(t, t.cars[1]),
          throttle: 0,
          brake: !1,
          fire: !1
        }
      };
    },
    camera: t => ga(t.cars[0], 7.8, 3.1, 14, 52)
  }, {
    title: "Book hop",
    moment: "A car takes the shortcut through the books and flies off the jump",
    durationMs: 3e3,
    setup: () => {
      let t = jt("bedroom", 7712),
        e = le("bedroom").shortcuts[0],
        s = ee("bedroom").length,
        o = e.jump.start - 34,
        n = Se(e, o, 0, {
          flight: !1
        }),
        i = t.cars[0],
        a = e.startS + o / e.length * (e.endS - e.startS);
      return Object.assign(i, {
        x: n.x,
        y: n.y,
        z: n.z,
        yaw: n.yaw,
        s: wa(a, s),
        raceS: a,
        speed: 31,
        sideSpeed: 0,
        shortcut: {
          id: e.id,
          s: o,
          base: 0,
          jumped: !1
        },
        human: !0
      }), i.nextGate = Math.floor(a / (s / 8)) + 1, i.lastCheckpoint = i.nextGate - 1, [1, 2, 3, 4, 5].forEach(r => je(t, r, a - 6 - r * 6, r % 2 ? 2.2 : -2.2, 28)), t;
    },
    input: t => ({
      0: {
        ...As(t, t.cars[0]),
        fire: !1
      }
    }),
    camera: (t, e) => {
      let s = le("bedroom").shortcuts[0],
        o = Se(s, (s.jump.start + s.jump.end) / 2, 0, {
          flight: !1
        }),
        n = t.cars[0],
        i = ko(e / 3);
      return {
        pos: [o.x + o.nx * 13 - o.tx * (6 - i * 5), o.y + 3.2, o.z + o.nz * 13 - o.tz * (6 - i * 5)],
        look: [n.x * 0.6 + o.x * 0.4, n.y + 1.2, n.z * 0.6 + o.z * 0.4],
        fov: 52
      };
    }
  }, {
    title: "Soap slide",
    moment: "Hitting a soap puddle on the white tiles throws the car into a slide",
    durationMs: 3e3,
    setup: () => {
      let t = jt("bathroom", 6060),
        e = le("bathroom").patches[0];
      return je(t, 0, e.s - 26, e.lane, 30), t.cars[0].human = !0, je(t, 1, e.s - 12, -e.lane, 28), je(t, 2, e.s - 40, -e.lane * 0.4, 29), je(t, 3, e.s + 10, -e.lane, 27), je(t, 4, e.s - 52, e.lane * 0.3, 29), je(t, 5, e.s + 26, 0, 27), t;
    },
    input: (t, e) => ({
      0: {
        ...Mt,
        throttle: 1,
        steer: e > 0.8 && e < 1.7 ? 0.5 : 0
      }
    }),
    camera: t => ga(t.cars[0], 6.4, 2.3, 9, 56)
  }, {
    title: "Figure-eight",
    moment: "Cars thunder over the workbench bridge while the rest of the pack dives underneath",
    durationMs: 3e3,
    setup: () => {
      let t = jt("garage", 4404),
        e = xa();
      return [[0, 26, -2], [1, 33, 2], [2, 41, -1.5]].forEach(([s, o, n]) => je(t, s, e.over - o, n, 30)), [[3, 24, 2], [4, 31, -2], [5, 39, 1]].forEach(([s, o, n]) => je(t, s, e.under - o, n, 30)), t;
    },
    camera: (t, e) => {
      let s = ee("garage"),
        o = xa(),
        n = G(s, o.under),
        i = G(s, o.over),
        r = 7 - ko(e / 3) * 14;
      return {
        pos: [n.x + n.nx * 24 + n.tx * r, i.y + 4.5, n.z + n.nz * 24 + n.tz * r],
        look: [n.x * 0.5 + i.x * 0.5, (n.y + i.y) / 2 + 0.5, n.z * 0.5 + i.z * 0.5],
        fov: 50
      };
    }
  }, {
    title: "Pond bridge",
    moment: "The pack sweeps across the raised bridge over the koi pond",
    durationMs: 3e3,
    setup: () => {
      let t = jt("backyard", 8818),
        e = Os("backyard", 9.3);
      return [0, 1, 2, 3, 4, 5].forEach(s => je(t, s, e - s * 6, [-2.2, 2.2, 0, -2.2, 2.2, 0][s], 30 - s * 0.3)), t;
    },
    camera: (t, e) => {
      let s = e0(t),
        o = t.cars.length,
        n = Math.sin(s.yaw),
        i = Math.cos(s.yaw),
        a = ko(e / 3),
        r = t.cars.reduce((l, c) => [l[0] + c.x / o, l[1] + c.y / o, l[2] + c.z / o], [0, 0, 0]);
      return {
        pos: [r[0] + i * 24 - n * (8 - a * 6), r[1] + 10 - a * 2.5, r[2] - n * 24 - i * (8 - a * 6)],
        look: [r[0] + n * 4, r[1] + 0.6, r[2] + i * 4],
        fov: 52
      };
    }
  }, {
    title: "Champions",
    moment: "The winners drop onto the toy-block podium under confetti and fireworks",
    durationMs: 3600,
    setup: () => {
      let t = jt("bedroom", 1201);
      return t.cars.forEach((e, s) => {
        e.finished = !0, e.finishTime = 92 + s * 1.4, e.place = s + 1;
      }), t.phase = "results", t.results = is(t), t;
    },
    camera: () => null
  }],
  Lc = Gs.reduce((t, e) => t + e.durationMs, 0);
function Ea(t, {
  bpm: e,
  root: s,
  busy: o
}) {
  let n = t.sampleRate,
    i = 60 / e,
    a = Math.round(i * 32 * n),
    r = t.createBuffer(1, a, n),
    l = r.getChannelData(0),
    c = 99,
    h = y => 440 * Math.pow(2, (y - 69) / 12),
    d = [[0, 4, 7], [-5, -1, 2], [-3, 0, 4], [-7, -3, 0], [0, 4, 7], [-5, -1, 2], [-8, -4, -1], [-5, -1, 2]],
    u = [7, 9, 12, 9, 7, 4, 7, 2, 4, 7, 9, 7, 4, 2, 0, 2, 7, 9, 12, 14, 12, 9, 7, 4, 5, 4, 2, 4, 7, -1, 2, null],
    f = (y, m, p) => {
      let b = Math.floor(y * n),
        w = Math.min(a, b + Math.floor(m * n));
      for (let M = b; M < w; M++) {
        let x = (M - b) / n;
        l[M] += p(x);
      }
    };
  for (let y = 0; y < 32; y++) {
    let m = u[y];
    if (m == null || !o && y % 2) continue;
    let p = h(s + 12 + m),
      b = y * i;
    f(b, i * 0.8, w => (Math.sin(2 * Math.PI * p * w) + 0.35 * Math.sin(4 * Math.PI * p * w) + 0.2 * Math.sign(Math.sin(2 * Math.PI * p * w))) * 0.075 * Math.min(1, w * 60) * Math.exp(-w * 3.2));
  }
  for (let y = 0; y < 8; y++) {
    let m = d[y],
      p = y * 4 * i;
    for (let b = 0; b < 4; b++) {
      let w = p + b * i;
      f(w, 0.22, x => Math.sin(2 * Math.PI * (55 + 90 * Math.exp(-x * 30)) * x) * Math.exp(-x * 14) * 0.55), b % 2 === 1 && (f(w, 0.18, () => (c = Math.imul(c, 1664525) + 1013904223 >>> 0, (c / 4294967296 * 2 - 1) * 0.22)), f(w, 0.18, x => Math.exp(-x * 22) * 0));
      for (let x = 0; x < 2; x++) f(w + x * i / 2, 0.04, T => (c = Math.imul(c, 1664525) + 1013904223 >>> 0, (c / 4294967296 * 2 - 1) * 0.06 * Math.exp(-T * 90)));
      for (let x = 0; x < 2; x++) {
        let T = h(s - 12 + m[0] + (x ? 12 : 0));
        f(w + x * i / 2, i / 2 * 0.9, g => (Math.sin(2 * Math.PI * T * g) + 0.3 * Math.sign(Math.sin(2 * Math.PI * T * g))) * 0.16 * Math.exp(-g * 5));
      }
      let M = o ? 4 : 2;
      for (let x = 0; x < M; x++) {
        let T = s + 12 + m[(b * M + x) % 3] + (x === M - 1 && o ? 12 : 0),
          g = h(T);
        f(w + x * i / M, i / M * 0.85, H => Math.abs(g * H % 1 * 4 - 2) - 1 > 9 ? 0 : (Math.abs(g * H % 1 * 4 - 2) - 1) * 0.09 * Math.exp(-H * (o ? 9 : 5)));
      }
    }
  }
  for (let y = 0; y < a; y++) l[y] = Math.tanh(l[y] * 1.2) * 0.8;
  for (let y = 0; y < 256; y++) {
    let m = y / 256;
    l[y] *= m, l[a - 1 - y] *= m;
  }
  return r;
}
var Ho = class {
  constructor(e = null) {
    this.bus = e, this.ctx = null, this.volume = 0.38, this.muted = !1, this.started = !1, this.eventId = 0, this.music = null;
  }
  async unlock() {
    if (!this.ctx) {
      let e = this.bus?.();
      if (!e) return;
      this.ctx = e.context, this.master = this.ctx.createGain(), this.master.gain.value = 0, this.master.connect(e.output);
      let s = this.ctx.sampleRate,
        o = s * 2,
        n = this.ctx.createBuffer(1, o, s),
        i = n.getChannelData(0),
        a = 773,
        r = 0;
      for (let c = 0; c < o; c++) {
        let h = c / s,
          d = h * 36 % 1;
        a = Math.imul(a, 1664525) + 1013904223 >>> 0;
        let u = a / 4294967296 * 2 - 1;
        r = r * 0.8 + u * 0.2;
        let f = Math.exp(-d * 13) * (Math.sin(d * 16) + 0.28 * Math.sin(d * 32));
        i[c] = 0.24 * f + 0.055 * r + 0.027 * Math.sin(h * 2 * Math.PI * 72);
      }
      this.engine = this.ctx.createBufferSource(), this.engine.buffer = n, this.engine.loop = !0, this.filter = this.ctx.createBiquadFilter(), this.filter.type = "lowpass", this.filter.frequency.value = 650, this.engineGain = this.ctx.createGain(), this.engineGain.gain.value = 0, this.engine.connect(this.filter), this.filter.connect(this.engineGain), this.engineGain.connect(this.master), this.engine.start(), this.noiseBuffer = this.ctx.createBuffer(1, s, s);
      let l = this.noiseBuffer.getChannelData(0);
      for (let c = 0; c < s; c++) a = Math.imul(a, 1664525) + 1013904223 >>> 0, l[c] = a / 4294967296 * 2 - 1;
      this.tyres = this.ctx.createBufferSource(), this.tyres.buffer = this.noiseBuffer, this.tyres.loop = !0, this.tyreFilter = this.ctx.createBiquadFilter(), this.tyreFilter.type = "bandpass", this.tyreFilter.frequency.value = 1450, this.tyreFilter.Q.value = 0.65, this.tyreGain = this.ctx.createGain(), this.tyreGain.gain.value = 0, this.tyres.connect(this.tyreFilter), this.tyreFilter.connect(this.tyreGain), this.tyreGain.connect(this.master), this.tyres.start();
    }
    if (this.ctx.state === "suspended" && (await this.ctx.resume()), this.started = !0, this.setMute(), !this.tracks) {
      let e = this.musicUrls || {};
      this.tracks = {}, e.race || (this.tracks.race = Ea(this.ctx, {
        bpm: 152,
        root: 50,
        busy: !0
      })), e.menu || (this.tracks.menu = Ea(this.ctx, {
        bpm: 108,
        root: 53,
        busy: !1
      })), this.wantMusic && this.playMusic(this.wantMusic, !0);
    }
    if (!this.loading) {
      this.loading = !0;
      for (let [e, s] of Object.entries(this.musicUrls || {})) this.loadTrack(e, s);
    }
  }
  setMusicSources(e) {
    this.musicUrls = e;
  }
  async loadTrack(e, s) {
    try {
      this.decoded = this.decoded || new Map(), this.decoded.has(s) || this.decoded.set(s, fetch(s).then(n => n.ok ? n.arrayBuffer() : Promise.reject(new Error(`HTTP ${n.status}`))).then(n => this.ctx.decodeAudioData(n)));
      let o = await this.decoded.get(s);
      (this.tracks || (this.tracks = {}))[e] = o, (this.fileTracks || (this.fileTracks = new Set())).add(e), this.wantMusic === e && this.playMusic(e, !0);
    } catch (o) {
      console.warn("music load failed", e, o);
    }
  }
  playMusic(e, s = !1) {
    if (this.wantMusic = e, !this.ctx || !s && this.currentMusic === e) return;
    let o = this.ctx.currentTime,
      n = e && this.tracks?.[e];
    if (n && this.musicNode && this.musicNode.src.buffer === n) {
      this.currentMusic = e, this.musicNode.gain.gain.setTargetAtTime(this.fileTracks?.has(e) ? e === "race" ? 0.07 : 0.09 : e === "race" ? 0.2 : 0.26, o, 0.6);
      return;
    }
    if (this.musicNode) {
      let c = this.musicNode;
      c.gain.gain.setTargetAtTime(0, o, 0.4), setTimeout(() => {
        try {
          c.src.stop();
        } catch {}
        c.src.disconnect(), c.gain.disconnect();
      }, 2e3), this.musicNode = null;
    }
    this.currentMusic = null;
    let i = e && this.tracks?.[e];
    if (!i) return;
    let a = this.fileTracks?.has(e) ? e === "race" ? 0.07 : 0.09 : e === "race" ? 0.2 : 0.26,
      r = this.ctx.createBufferSource(),
      l = this.ctx.createGain();
    r.buffer = i, r.loop = !0, l.gain.value = 0, l.gain.setTargetAtTime(a, o, 0.5), r.connect(l), l.connect(this.master), r.start(), this.musicNode = {
      src: r,
      gain: l
    }, this.currentMusic = e;
  }
  setMute(e = this.muted) {
    this.muted = e, this.ctx && this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.08);
  }
  setVolume(e) {
    this.volume = Math.max(0, Math.min(1, e)), this.setMute();
  }
  fanfare() {
    let e = this.ctx.currentTime;
    [523, 659, 784, 1047].forEach((s, o) => {
      let n = this.ctx.createOscillator(),
        i = this.ctx.createGain();
      n.type = "square", n.frequency.value = s;
      let a = e + o * 0.12,
        r = o === 3 ? 0.6 : 0.14;
      i.gain.setValueAtTime(0.001, a), i.gain.linearRampToValueAtTime(0.09, a + 0.01), i.gain.exponentialRampToValueAtTime(0.001, a + r), n.connect(i), i.connect(this.master), n.start(a), n.stop(a + r + 0.02);
    });
  }
  cue(e) {
    if (!this.ctx || !this.started || this.muted || this.ctx.state !== "running") return;
    if (e === "finish") {
      this.fanfare();
      return;
    }
    let s = this.ctx.currentTime,
      o = ["hit", "wreck", "fire", "nitro", "tracker", "blocked", "hazard-hit", "landing", "bump", "explode", "splash"].includes(e),
      n = o ? this.ctx.createBufferSource() : this.ctx.createOscillator(),
      i = this.ctx.createGain(),
      a = this.ctx.createBiquadFilter();
    a.type = "lowpass", a.frequency.value = o ? e === "nitro" ? 1900 : e === "tracker" ? 1300 : e === "landing" ? 600 : e === "bump" ? 450 : 1e3 : 2200;
    let l = {
        respawn: [440, 880, 0.3],
        signal: [880, 1320, 0.18],
        lap: [660, 990, 0.3],
        pulse: [1100, 210, 0.15],
        shock: [85, 39, 0.4],
        mine: [180, 125, 0.09],
        shield: [830, 1330, 0.22],
        "team-shield": [700, 1400, 0.3],
        oil: [260, 90, 0.3],
        repair: [550, 990, 0.34],
        paw: [170, 340, 0.42],
        fruit: [480, 260, 0.28],
        sprinkler: [720, 460, 0.32],
        jump: [330, 580, 0.16],
        shortcut: [650, 1120, 0.24],
        "shortcut-miss": [260, 130, 0.19]
      }[e],
      c = l ? l[2] : e === "explode" ? 0.7 : e === "go" ? 0.35 : e === "signal" ? 0.18 : e === "lap" ? 0.3 : e === "results" ? 0.55 : e === "nitro" ? 0.34 : e === "tracker" ? 0.27 : 0.12;
    o ? n.buffer = this.noiseBuffer : (n.type = e === "shock" ? "sine" : "triangle", n.frequency.setValueAtTime(l ? l[0] : e === "pickup" ? 750 : e === "finish" ? 630 : e === "go" ? 460 : 520, s), n.frequency.exponentialRampToValueAtTime(l ? l[1] : e === "pickup" ? 1200 : e === "go" ? 820 : 700, s + c)), i.gain.setValueAtTime(0.001, s), i.gain.linearRampToValueAtTime(o ? 0.18 : 0.13, s + 0.012), i.gain.exponentialRampToValueAtTime(0.001, s + c), n.connect(a), a.connect(i), i.connect(this.master), n.start(s), n.stop(s + c + 0.01), n.onended = () => {
      n.disconnect(), a.disconnect(), i.disconnect();
    };
  }
  update(e, s = [0], o = !0) {
    if (!this.ctx) return;
    let n = s[0] ?? 0,
      i = e?.cars[n],
      a = i ? Math.abs(i.speed) : 0;
    this.engine.playbackRate.setTargetAtTime(0.85 + a / 14 + (i?.boost > 0 ? 0.22 : 0), this.ctx.currentTime, 0.13), this.filter.frequency.setTargetAtTime(360 + a * 28, this.ctx.currentTime, 0.15), this.engineGain.gain.setTargetAtTime(o && e?.phase !== "results" ? 0.1 + Math.min(a / 28, 1) * 0.14 : 0, this.ctx.currentTime, 0.12), this.tyreGain?.gain.setTargetAtTime(o && i && !i.airborne && e.phase === "racing" && (i.wasDrifting || i.braking) && a > 10 ? 0.055 : 0, this.ctx.currentTime, 0.09), this.tyreFilter?.frequency.setTargetAtTime(e?.mapId === "backyard" ? 620 : 1300 + a * 10, this.ctx.currentTime, 0.12);
    for (let r of e?.events || []) r.id > this.eventId && (r.type !== "nitro" && (["go", "results"].includes(r.type) || s.includes(r.car) || s.includes(r.source) || r.type === "signal" && s.some(l => (l < 2 ? 0 : 1) === r.team)) && this.cue(r.type === "fire" || r.type === "hazard-warning" ? r.kind : r.type), this.eventId = r.id);
  }
  reset() {
    this.eventId = 0;
  }
};
var js = {},
  Zc = localRuntime.ready(),
  ni = "toybox-rally-settings-v2",
  Ma = "toybox-rally-best-v2",
  t0 = "toybox-rally-ghost-v2-",
  ii = !1,
  tt = null,
  ei = "",
  ai = [],
  Ls = 0,
  zt = 0,
  Io = () => ie === "local" && de.length === 1 && !!B;
function s0(t) {
  try {
    let e = JSON.parse(localStorage.getItem(t) || "null");
    return e && Array.isArray(e.frames) && e.frames.length >= 12 ? e : null;
  } catch {
    return null;
  }
}
function o0() {
  let t = B.cars[de[0]];
  !t || B.phase !== "racing" || t.finished && Ls < 0 || (B.time >= Ls || t.finished) && (ai.push(+B.time.toFixed(2), +t.x.toFixed(2), +t.y.toFixed(2), +t.z.toFixed(2), +t.yaw.toFixed(3), +t.raceS.toFixed(1)), Ls = t.finished ? -1 : Ls + 0.1);
}
function n0() {
  let t = B.cars[de[0]];
  if (!(!t?.finished || tt && tt.time <= t.finishTime)) {
    ii = !!tt, tt = {
      time: t.finishTime,
      style: t.style,
      frames: ai
    };
    try {
      localStorage.setItem(ei, JSON.stringify(tt)), P.toast("New best time! Your ghost will race you next time.");
    } catch {}
  }
}
function i0(t) {
  let e = tt?.frames;
  if (!e) return null;
  let s = e.length / 6;
  if (t > e[(s - 1) * 6]) return null;
  let o = 0,
    n = s - 1;
  for (; o + 1 < n;) {
    let l = o + n >> 1;
    e[l * 6] <= t ? o = l : n = l;
  }
  let i = o * 6,
    a = n * 6,
    r = Q((t - e[i]) / (e[a] - e[i] || 1), 0, 1);
  return {
    x: e[i + 1] + (e[a + 1] - e[i + 1]) * r,
    y: e[i + 2] + (e[a + 2] - e[i + 2]) * r,
    z: e[i + 3] + (e[a + 3] - e[i + 3]) * r,
    yaw: e[i + 4] + Be(e[a + 4], e[i + 4]) * r,
    style: tt.style
  };
}
function a0(t) {
  let e = tt?.frames;
  if (!e) return null;
  let s = e.length / 6;
  for ((zt >= s || e[zt * 6 + 5] > t) && (zt = 0); zt < s - 1 && e[(zt + 1) * 6 + 5] <= t;) zt++;
  if (zt >= s - 1) return null;
  let o = zt * 6,
    n = o + 6,
    i = Q((t - e[o + 5]) / (e[n + 5] - e[o + 5] || 1), 0, 1);
  return B.time - (e[o] + (e[n] - e[o]) * i);
}
function r0() {
  let t = P.hud.querySelector(".player-hud");
  if (!t) return;
  let e = t.querySelector(".ghost-box");
  e || (e = document.createElement("div"), e.className = "ghost-box", t.appendChild(e));
  let s = B.cars[de[0]],
    o = tt && B.phase === "racing" && !s.finished ? a0(s.raceS) : null,
    n = tt ? o === null ? `GHOST \xB7 BEST ${$s(tt.time)}` : `GHOST ${o <= 0 ? "\u2212" : "+"}${Math.abs(o).toFixed(1)}s` : "";
  e.textContent !== n && (e.textContent = n, e.classList.toggle("ahead", o !== null && o <= 0), e.classList.toggle("behind", o !== null && o > 0)), e.hidden = !n;
}
var za = "toybox-rally-tips-v1",
  Bs = !1,
  fs = 0,
  Ia = 0,
  ls = t => ({
    Space: "SPACE",
    ShiftLeft: "SHIFT",
    ShiftRight: "RIGHT SHIFT",
    AltLeft: "ALT",
    ControlLeft: "CTRL",
    Enter: "ENTER",
    Backspace: "BACKSPACE",
    ArrowUp: "\u2191",
    ArrowDown: "\u2193",
    ArrowLeft: "\u2190",
    ArrowRight: "\u2192",
    Period: ".",
    Slash: "/",
    Comma: ",",
    Semicolon: ";",
    BracketLeft: "["
  })[t] || t.replace(/^Key|^Digit/, "");
function l0(t) {
  let e = Rt[0] || "keys0",
    s = e.startsWith("pad"),
    o = ut[Number(e.slice(4)) || 0],
    n = ge.touchActive && !s,
    i = n ? "\u25C0 \u25B6" : s ? "the left stick" : `${ls(o.left)} / ${ls(o.right)}`,
    a = s ? "X" : o.slots ? "1 / 2 / 3" : ls(o.fire),
    r = n ? "DRIFT" : s ? "A" : ls(o.drift),
    l = s ? "RT" : ls(o.up),
    c = n ? "RECOVER" : s ? "View" : ls(o.reset);
  return n && B.phase === "countdown" ? `Auto throttle: just steer with ${i}` : B.phase === "countdown" ? Ct?.autoThrottle ? `Auto throttle is on: just steer with ${i}` : `Hold ${l} to accelerate \xB7 steer with ${i}` : t < 3 ? "" : t < 9 ? `Drive through the glowing boxes for powers \xB7 ${n ? "tap a slot to use one" : `${a} uses them`}` : t < 15 ? `Hold ${r} while turning to drift \xB7 let go for a boost` : t < 21 ? "Yellow arrows mark shortcuts \xB7 steer into them at speed" : t < 27 ? n ? "Lost or stuck? RECOVER puts you back on the road" : `Lost or stuck? ${c} recovers \xB7 hold X to restart \xB7 ESC pauses` : "";
}
function c0(t) {
  let e = P.hud.querySelector(".race-tip");
  e || (e = document.createElement("div"), e.className = "race-tip", P.hud.appendChild(e));
  let s = fs && ie === "local" && B.phase !== "results" ? Math.min(1, (t - fs) / 700) : 0,
    o = s ? "RESTARTING\u2026" : Bs && !Ie && B.phase !== "results" ? l0(B.time) : "";
  e.textContent !== o && (e.textContent = o, e.classList.toggle("show", !!o), e.classList.toggle("restart", !!s)), e.style.setProperty("--hold", String(s)), s >= 1 && (fs = 0, us(Ct));
}
window.addEventListener("keydown", t => {
  t.code === "KeyX" && !t.repeat && ie === "local" && B && B.phase !== "results" && !Ie && (fs = performance.now()), (t.code === "Enter" || t.code === "Space") && !t.repeat && ie === "local" && B?.phase === "results" && performance.now() - Ia > 1200 && (t.preventDefault(), Ga());
});
window.addEventListener("keyup", t => {
  t.code === "KeyX" && (fs = 0);
});
var h0 = document.getElementById("game"),
  pt = document.getElementById("ui"),
  be;
try {
  be = new To(h0);
} catch (t) {
  throw pt.innerHTML = '<div class="fatal"><p><b>Toybox Rally needs WebGL.</b><br>Turn on hardware acceleration in your browser and reload the page.</p></div>', console.error(t), t;
}
pt.innerHTML = "";
var st = new Ho(() => localRuntime.audio());
st.setMusicSources({
  menu: "./assets/003-music.mp3",
  race: "./assets/003-music.mp3"
});
var qn = "",
  Wt = "PLAYER",
  ie = "menu",
  Ie = !1,
  B = null,
  _e = null,
  de = [0],
  Rt = ["keys0"],
  Ct = null,
  ke = null,
  qt = 0,
  Po = 0,
  Ns = "",
  At = null,
  ti = !1,
  Kn = {
    ...Mt
  },
  Xn = "",
  $o = null,
  Zn = !1,
  ge = new vo({
    onPause: () => jo(),
    onGesture: () => {
      st.unlock().catch(() => {});
    }
  }),
  P = new Ro(pt, {
    map: t => Do(t, P.settings.style),
    style: t => {
      _e && (_e.cars[0].style = t, be.carStyles[0] = -1);
    },
    paint: () => {
      _e && (_e.cars[0].paint = Eo(P.settings.paint)), hs();
    },
    start: t => w0(t),
    mute: t => st.setMute(t),
    volume: t => {
      st.setVolume(t), hs();
    },
    quality: t => {
      be.setQuality(t), hs();
    },
    setting: () => {
      Ca(), hs();
    },
    rules: () => hs(),
    pause: () => jo(),
    resume: () => {
      Ie = !1, P.closeModal(), ge.clear(), ge.enabled = !0;
    },
    quit: () => Ds(),
    restart: () => {
      Fo(), us(Ct);
    },
    next: () => Ga(),
    touch: (t, e) => {
      e ? ge.touchPress(t) : ge.touchRelease(t);
    },
    leave: () => Ds()
  });
var No = null;
function Aa(t) {
  No = {
    index: t,
    race: Gs[t].setup(),
    t: 0,
    acc: 0
  }, js = {}, be.cameraReady.fill(!1);
}
function d0() {
  document.querySelector(".intro-reel")?.dispatchEvent(new Event("pointerdown")), mt = null, Ie = !1, ge.enabled = !1, ge.clear(), ie = "menu", B = null, At = null, P.closeModal(), P.hideMenu(), P.hud.hidden = !0, be.setGhost(null), be.podiumCentered = !0, Aa(0);
}
function f0() {
  No = null, be.podiumCentered = !1, Ds(!1), window.dispatchEvent(new Event("remix:trailer-end"));
}
window.addEventListener("remix:trailer-start", t => {
  t.preventDefault(), d0();
});
function u0(t) {
  let e = No,
    s = Gs[e.index];
  e.acc += t;
  let o = 0;
  for (; e.acc >= 1 / 60 && o < 6;) {
    for (let i of e.race.cars) js[i.id] = {
      x: i.x,
      y: i.y,
      z: i.z,
      yaw: i.yaw
    };
    Cs(e.race, s.input ? s.input(e.race, e.t) : {}, 1 / 60), e.t += 1 / 60, e.acc -= 1 / 60, o++;
  }
  let n = s.camera(e.race, e.t);
  be.render(e.race, [0], t, n ? {
    cinematic: n
  } : {}), e.t * 1e3 >= s.durationMs && (e.index + 1 < Gs.length ? Aa(e.index + 1) : f0());
}
var mt = null;
function p0(t, e) {
  let s = ee(t.mapId),
    o = [...t.cars].sort((l, c) => c.raceS - l.raceS)[0],
    n = Math.sin(o.yaw),
    i = Math.cos(o.yaw);
  if (e < 2.6) {
    let l = e / 2.6,
      c = G(s, 15 - l * 6, 5.2),
      h = G(s, -14 + l * 12, -1.2);
    return {
      pos: [c.x, c.y + 0.85, c.z],
      look: [h.x, h.y + 0.6, h.z],
      fov: 44
    };
  }
  if (e < 4.7) {
    let l = (e - 2.6) / 2.1,
      c = 7.5 - l * 2.5,
      h = 3.4 - l * 1.2;
    return {
      pos: [o.x + n * c + i * h, o.y + 1.05 + l * 0.5, o.z + i * c - n * h],
      look: [o.x, o.y + 0.6, o.z],
      fov: 50
    };
  }
  let a = Math.min(1, (e - 4.7) / 2.3),
    r = a * a * (3 - 2 * a);
  return {
    pos: [o.x - n * (9 + r * 7), o.y + 2.2 + r * 10, o.z - i * (9 + r * 7)],
    look: [o.x + n * 18, o.y + 1, o.z + i * 18],
    fov: 58
  };
}
var m0 = t => t === "random" ? Ye[Math.floor(Math.random() * Ye.length)].id : t;
function Do(t = P.settings.mapId, e = P.settings.style) {
  if (t === "random") {
    if (_e) return;
    t = Ye[0].id;
  }
  _e = ns({
    mapId: t,
    humans: [],
    styles: [e],
    laps: 2,
    seed: 5482
  }), _e.phase = "racing", _e.countdown = 0, _e.cars[0].paint = Eo(P.settings.paint), _e.ffa = !0;
  let s = G(ee(t), 95, 0);
  Object.assign(_e.cars[0], {
    x: s.x,
    y: s.y,
    z: s.z,
    yaw: s.yaw,
    s: s.s,
    raceS: 95
  }), be.cameraReady.fill(!1);
}
var Oo = 0,
  y0 = {
    bump: [120, 0.2, 0.45],
    hit: [260, 0.7, 0.5],
    explode: [520, 1, 0.8],
    "hazard-hit": [300, 0.6, 0.5],
    splash: [200, 0.25, 0.55],
    landing: [140, 0.35, 0.3]
  };
function b0(t) {
  for (let e of t.events || []) {
    if (e.id <= Oo) continue;
    Oo = e.id;
    let s = y0[e.type],
      o = de.indexOf(e.car);
    if (!s || o < 0 || !P.settings.rumble || !Rt[o]?.startsWith("pad")) continue;
    let n = (navigator.getGamepads?.() || [])[Number(Rt[o].slice(3))];
    try {
      n?.vibrationActuator?.playEffect?.("dual-rumble", {
        duration: s[0],
        strongMagnitude: s[1],
        weakMagnitude: s[2]
      })?.catch?.(() => {});
    } catch {}
  }
}
function Ca() {
  let t = P.settings;
  be.setCamera({
    distance: t.camera,
    fov: t.fov
  }), be.setColorblind(!!t.colorblind), document.body.classList.toggle("cvd", !!t.colorblind);
}
function hs() {
  try {
    localStorage.setItem(ni, JSON.stringify(P.settings));
  } catch {}
}
function Pa(t) {
  if (t.results) try {
    let e = JSON.parse(localStorage.getItem(Ma) || "{}");
    for (let s of t.cars) s.human && s.finished && (e[t.mapId] = Math.min(e[t.mapId] || 1 / 0, s.finishTime));
    localStorage.setItem(Ma, JSON.stringify(e));
  } catch {}
}
function Fo() {
  ke = Ct?.cup ? {
    round: 0,
    scores: [0, 0],
    points: [0, 0, 0, 0, 0, 0]
  } : null;
}
function w0(t) {
  let e = t.mode === "local" ? So(t.players, t.teamMode).length : 1,
    s = t.bindings.slice(0, e);
  if (new Set(s).size !== s.length) {
    P.toast("Pick a different keyboard layout or gamepad for each player.");
    return;
  }
  for (let o of s) if (o.startsWith("pad") && !(navigator.getGamepads?.() || [])[Number(o.slice(3))]) {
    P.toast("That gamepad is not connected. Press one of its buttons or pick other controls.");
    return;
  }
  {
    Ct = {
      ...t,
      bindings: s
    };
    Rt = s;
    ge.configure(Rt, t.autoThrottle);
    hs();
    st.unlock().catch(() => {});
  }
  Fo(), us(Ct);
}
function us(t) {
  if (!t) return;
  ie = "local", Ie = !1, de = t.mode === "local" ? So(t.players, t.teamMode) : [0], Rt = t.bindings.slice(0, de.length), ge.configure(Rt, t.autoThrottle), ge.enabled = !0;
  let e = [],
    s = [],
    o = [];
  o[de[0]] = t.paint;
  let n = t.mode === "local" ? 4 : 6;
  for (let a = 0; a < n; a++) e[a] = (t.style + a) % 4;
  de.forEach((a, r) => {
    s[a] = de.length === 1 ? Wt !== "PLAYER" ? Wt.slice(0, 14) : "YOU" : `P${r + 1}`;
  });
  let i = nn(ke ? Ye[ke.round].id : m0(t.mapId), t.reverse);
  B = ns({
    mapId: i,
    humans: de,
    styles: e,
    names: s,
    paints: o,
    laps: t.laps || 2,
    botSkill: t.botSkill,
    powers: t.powers,
    carCount: n,
    ffa: t.mode !== "local",
    seed: 2701 + (ke?.round || 0) * 977,
    matchId: "local-" + Date.now()
  }), ei = t0 + i + "-" + (t.laps || 2), tt = de.length === 1 ? s0(ei) : null, ai = [], Ls = 0, zt = 0;
  try {
    Bs = !localStorage.getItem(za);
  } catch {
    Bs = !1;
  }
  fs = 0, Oo = 0, ii = !1, P.hideMenu(), P.closeModal(), Ns = "", At = null, qt = 0, js = {}, st.reset(), be.cameraReady.fill(!1);
}
function Ga() {
  {}
  ke && ke.round < 2 ? (ke.round++, us(Ct)) : (Fo(), us(Ct));
}
function Ds(t = !0) {
  ie = "menu", B = null, Ie = !1, ke = null, ge.enabled = !1, ge.clear(), At = null, P.showMenu(), Do(), st.update(null, [0], !1);
}
function jo() {
  if (ie === "menu" || false) {
    P.closeModal();
    return;
  }
  B?.phase !== "results" && (Ie = !Ie, ge.clear(), ge.enabled = !Ie, Ie ? P.showPause(false) : P.closeModal());
}
function M0() {
  let t = [...de, be.width, be.height].join("-");
  if (Ns === t) return;
  Ns = t;
  let e = Yn(de.length, be.width, be.height);
  P.hud.classList.toggle("split", de.length > 1), P.setupHUD(de, e, be.width, be.height, false, !!B?.ffa), Wo();
}
var Lo = 0.07,
  T0 = 0.18,
  va = 3,
  v0 = 0.3,
  R0 = 6,
  S0 = 0.1,
  k0 = 0.8,
  he = [],
  oi = -1,
  Uo = 0,
  It = 0,
  Bo = !1,
  Ut = Lo,
  Fs = 1,
  O = null;
function H0() {
  he = [], oi = -1, Uo = 0, O = null, It = 0, Bo = !1, Ut = Lo, Fs = 1, pe.snaps = 0, pe.frames = 0, pe.late = 0, pe.jumps = 0, pe.gap = 0, pe.gapMax = 0, pe.lastArrival = 0;
}
function z0(t) {
  let e = Number.isFinite(t?.tick) ? t.tick : 0;
  if (e < oi) return;
  let s = Number.isFinite(t?.time) ? t.time : 0,
    o = performance.now();
  if (pe.lastArrival && (pe.gap = o - pe.lastArrival, pe.gap > pe.gapMax && (pe.gapMax = pe.gap)), pe.lastArrival = o, pe.snaps++, oi = e, Uo = s, t.phase !== "racing") {
    he = [], Bo = !1;
    return;
  }
  he.length && s - he[he.length - 1].time > 0.4 && (he = []);
  let n = he[he.length - 1];
  for (n && n.time >= s ? he[he.length - 1] = {
    tick: e,
    time: s,
    cars: t.cars,
    ms: o
  } : he.push({
    tick: e,
    time: s,
    cars: t.cars,
    ms: o
  }); he.length > 3 && he[0].time < s - k0;) he.shift();
  for (; he.length > 24;) he.shift();
  let i = he[0],
    a = (o - i.ms) / 1e3;
  if (he.length > 1 && a > 0.3 && a < 1.5) {
    let r = (s - i.time) / a;
    r > 0.5 && r < 2 && (Fs += (r - Fs) * 0.05);
  }
  A0(t);
}
function Qn(t, e, s) {
  let o = typeof t == "number" ? t : 0;
  return o + ((typeof e == "number" ? e : 0) - o) * s;
}
function Ra(t, e, s, o, n) {
  return 0.5 * (2 * e + (-t + s) * n + (2 * t - 5 * e + 4 * s - o) * n * n + (-t + 3 * e - 3 * s + o) * n * n * n);
}
var pe = {
    snaps: 0,
    frames: 0,
    late: 0,
    jumps: 0,
    gap: 0,
    gapMax: 0,
    lastArrival: 0
  },
  Co = !1,
  Kt = null,
  Sa = 0,
  ka = 0;
window.addEventListener("keydown", t => {
  t.repeat || (t.code === "F3" || t.shiftKey && t.code === "KeyN") && (t.preventDefault(), O0());
}, {
  capture: !0
});
function L0(t) {
  if (!B || B.phase !== "racing") return B;
  let e = B.cars.map(s => {
    let o = js[s.id];
    return !o || Math.hypot(s.x - o.x, s.z - o.z) > 8 ? s : {
      ...s,
      x: o.x + (s.x - o.x) * t,
      y: o.y + (s.y - o.y) * t,
      z: o.z + (s.z - o.z) * t,
      yaw: o.yaw + Be(s.yaw, o.yaw) * t
    };
  });
  return {
    ...B,
    cars: e
  };
}
function B0(t) {
  let e = Math.min((t - Po) / 1e3 || 0.016666666666666666, 0.05);
  Po = t, ge.poll();
  let s = ge.pads(),
    o = s.map(n => n.index + ":" + n.id).join("|");
  if (o !== Xn) {
    let n = s.length > Xn.split("|").filter(Boolean).length;
    Xn = o, ie === "menu" ? P.renderMenu(s) : P.pads = s, n && P.toast("Gamepad ready. Pick it in the player controls.");
  }
  if (No) u0(e);else if (mt && ie === "menu") Cs(mt.race, {}, e), be.setGhost(null), be.render(mt.race, [0], e, {
    cinematic: p0(mt.race, (t - mt.start) / 1e3)
  });else if (ie === "menu" || false) _e || Do(), _e.time += e, _e.tick++, be.setGhost(null), be.render(_e, [0], e, {
    menu: !0
  }), st.update(null, [0], !1);else if (B) {
    if (ie === "local" && !Ie) {
      qt += e;
      let a = 0;
      for (; qt >= 1 / 60 && a < 4;) {
        for (let l of B.cars) js[l.id] = {
          x: l.x,
          y: l.y,
          z: l.z,
          yaw: l.yaw
        };
        let r = {};
        for (let l = 0; l < de.length; l++) r[de[l]] = ge.sample(l, !0);
        Cs(B, r, 1 / 60), qt -= 1 / 60, a++, Io() && o0();
      }
      if (a === 4 && (qt = 0), B.phase === "results" && At !== B.matchId) {
        if (At = B.matchId, ge.enabled = !1, ke && (ke.scores[0] += B.results.teamScores[0], ke.scores[1] += B.results.teamScores[1], ke.points)) for (let r of B.results.rows) ke.points[r.id] = (ke.points[r.id] || 0) + r.points;
        if (P.showResults(B, {
          cup: ke,
          teams: de.map(dt)
        }), Pa(B), void 0, Io() && n0(), Ia = performance.now(), Bs) {
          Bs = !1;
          try {
            localStorage.setItem(za, "1");
          } catch {}
        }
        void 0;
      }
    }
    false;
    let n = L0(Ie ? 1 : Q(qt * 60, 0, 1));
    be.setGhost(Io() && tt && B.phase !== "results" ? i0(B.time) : null), be.render(n, de, Ie && ie === "local" ? 0 : e, {
      online: !1
    }), false, M0(), P.updateHUD(B, de, Rt, t, null), Io() && r0(), ie === "local" && c0(t), st.update(B, de, !Ie), b0(B);
    let i = de.map(a => B.cars[a]?.lap ?? 0).join(",");
    i !== qn && (qn && B.phase === "racing" && st.cue("lap"), qn = i);
  }
  st.playMusic(B && B.phase !== "results" && (ie === "local" || false) ? "race" : "menu");
}
var Ba = navigator.maxTouchPoints > 0 || "ontouchstart" in window,
  Ve = !1,
  cs = 1,
  N0 = () => ({
    w: innerWidth,
    h: innerHeight
  });
function ri(t) {
  ge.touchActive !== t && (ge.touchActive = t, document.body.classList.toggle("touch", t), t || P.releaseTouches());
}
function Wo() {
  let t = localRuntime.contentLayout,
    e = t.safeAreaInset,
    {
      w: s,
      h: o
    } = N0(),
    n = Ve;
  Ve = Ba && Math.min(s, o) <= 560, document.body.classList.toggle("phone", Ve), document.body.classList.toggle("portrait", Ve && o > s);
  let i = Math.max(1, s - e.left - e.right),
    a = Math.max(1, o - e.top - e.bottom);
  if (cs = Ve ? Math.min(1, a / 540, i / 960) : 1, Ve) Object.assign(pt.style, {
    left: `${e.left}px`,
    top: `${e.top}px`,
    right: "auto",
    bottom: "auto",
    width: `${i / cs}px`,
    height: `${a / cs}px`,
    transform: `scale(${cs})`,
    transformOrigin: "0 0"
  });else {
    Object.assign(pt.style, {
      width: "",
      height: "",
      transform: "",
      transformOrigin: ""
    });
    for (let y of ["top", "right", "bottom", "left"]) pt.style[y] = `${e[y]}px`;
  }
  let r = 96,
    l = (y, m) => t.exclusions.filter(p => p.y < r && p.x < y + m && p.x + p.width > y).reduce((p, b) => Math.max(p, b.y + b.height - e.top), 0),
    c = l(0, Math.min(360, s / 2)),
    h = l(Math.max(s / 2, s - 360), Math.min(360, s / 2)),
    d = t.exclusions.filter(y => y.y < r),
    u = d.filter(y => y.x + y.width / 2 < s / 2).reduce((y, m) => Math.max(y, m.x + m.width - e.left), 0),
    f = d.filter(y => y.x + y.width / 2 >= s / 2).reduce((y, m) => Math.max(y, s - e.right - m.x), 0);
  pt.style.setProperty("--host-push-left", `${Ve ? 0 : c}px`), pt.style.setProperty("--host-push-right", `${Ve ? 0 : h}px`), pt.style.setProperty("--host-pad-left", `${Ve ? u / cs : 0}px`), pt.style.setProperty("--host-pad-right", `${Ve ? f / cs : 0}px`), pt.style.setProperty("--host-top", Ve ? "0px" : ""), Ve !== n && (P.phone = Ve, Ve && ri(!0), ie === "menu" && P.renderMenu(ge.pads()));
}
document.addEventListener("visibilitychange", () => {
  document.hidden ? (ge.clear(), ie === "local" && B?.phase !== "results" && !Ie && jo()) : (Po = performance.now());
});
window.addEventListener("resize", () => {
  Wo(), Ve && innerHeight > innerWidth && ie === "local" && B?.phase !== "results" && !Ie && jo();
});
window.addEventListener("pointerdown", t => {
  t.pointerType === "touch" && ri(!0);
}, {
  capture: !0
});
window.addEventListener("keydown", t => {
  !Ve && !t.repeat && !["Escape", "Tab"].includes(t.code) && ri(!1);
}, {
  capture: !0
});
try {
  let t = JSON.parse(localStorage.getItem(ni) || localStorage.getItem("toybox-rally-settings-v1") || "null");
  if (t && typeof t == "object") {
    let e = {
      mapId: [...Ye.map(o => o.id), "random"],
      mode: ["solo", "local"],
      quality: ["high", "medium"],
      teamMode: ["coop", "versus"],
      botSkill: ["easy", "normal", "hard"],
      powers: ["all", "nitro", "rockets"]
    };
    Number.isInteger(t.laps) && (P.settings.laps = Q(t.laps, 1, 4)), typeof t.reverse == "boolean" && (P.settings.reverse = t.reverse);
    for (let o of Object.keys(e)) e[o].includes(t[o]) && (P.settings[o] = t[o]);
    Number.isInteger(t.style) && (P.settings.style = Q(t.style, 0, 3)), Number.isInteger(t.players) && (P.settings.players = Q(t.players, 2, 4));
    for (let o of ["cup", "autoThrottle"]) typeof t[o] == "boolean" && (P.settings[o] = t[o]);
    Array.isArray(t.bindings) && (P.settings.bindings = Array.from({
      length: 4
    }, (o, n) => /^keys[0-3]$|^pad[0-9]{1,2}$/.test(t.bindings[n] || "") ? t.bindings[n] : `keys${n}`)), typeof t.volume == "number" && Number.isFinite(t.volume) && (P.settings.volume = Q(t.volume, 0, 1)), ["near", "normal", "far"].includes(t.camera) && (P.settings.camera = t.camera), ["narrow", "normal", "wide"].includes(t.fov) && (P.settings.fov = t.fov);
    for (let o of ["colorblind", "rumble"]) typeof t[o] == "boolean" && (P.settings[o] = t[o]);
    let s = o => typeof o == "string" && /^#[0-9a-f]{6}$/i.test(o);
    t.paint && s(t.paint.body) && (P.settings.paint = {
      body: t.paint.body,
      accent: s(t.paint.accent) ? t.paint.accent : "#f6f0e3",
      rims: s(t.paint.rims) ? t.paint.rims : "#c9d2d6",
      finish: jn.includes(t.paint.finish) ? t.paint.finish : "gloss"
    });
  }
} catch {}
try {
  Ba && Math.min(innerWidth, innerHeight) <= 560 && !/"quality"/.test(localStorage.getItem(ni) || "") && (P.settings.quality = "medium");
} catch {}
st.setVolume(P.settings.volume);
be.setQuality(P.settings.quality);
Ca();
P.renderMenu(ge.pads());
Do();
var D0 = "timurlenk";
mt = {
  race: ns({
    mapId: "bedroom",
    humans: [],
    carCount: 6,
    ffa: !0,
    laps: 1,
    botSkill: "hard",
    seed: 9041,
    matchId: "intro"
  }),
  start: performance.now()
}, mt.race.phase = "racing", mt.race.countdown = 0, P.hideMenu(), P.hud.hidden = !0, be.cameraReady.fill(!1), P.playIntro(D0, () => {
  mt = null, ie === "menu" && P.showMenu(), be.cameraReady.fill(!1);
});
Wo();
localRuntime.onContentLayout(Wo);
var Ha = "";
be.renderer.setAnimationLoop(t => {
  try {
    B0(t);
  } catch (e) {
    let s = String(e?.stack || e);
    s !== Ha && (Ha = s, console.error("[Toybox Rally] frame error:", e)), Po = t;
  }
});