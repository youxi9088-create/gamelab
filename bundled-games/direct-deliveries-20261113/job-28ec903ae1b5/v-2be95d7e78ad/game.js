import * as Oe from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import * as Ke from "./vendor/004-15e95a6cf14fc9ae2003f48bcdf1568e475cd15dd14a1a41fc1d3eb29a6ce294.js";
var Uo = Ke.createPortalWorld;
import * as ae from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var Un = ["##############", "#.............", "#.####.###.###", "#o####.###.###", "#.............", "#.####.#.#####", "#.####.#.#####", "#......#....##", "######.####.##", "######.####.##", "######.####.##", "######.##.....", "######.##.###-", "######.##.#GGG", "TTTTTT.   #GGG", "######.##.#GGG", "######.##.####", "######.##.....", "######.##.####", "######.##.####", "#.............", "#.###.####.###", "#.###.####.###", "#o........... ", "###.#.##.#####", "###.#.##.#####", "#.....##......", "#.###.#####.##", "#.###.#####.##", "#.............", "##############"],
  Xn = Un.map(e => e + [...e].reverse().join("")),
  jn = {
    "#": "wall",
    ".": "dot",
    o: "power",
    " ": "open",
    T: "tunnel",
    "-": "door",
    G: "house"
  },
  Ie = 14,
  ho = e => (e % 28 + 28) % 28;
function Et(e, t) {
  if (t < 0 || t >= 31) return "wall";
  let o = t === Ie ? ho(e) : e;
  return o < 0 || o >= 28 ? "wall" : jn[Xn[t]?.[o] ?? "#"] ?? "wall";
}
var Xo = (e, t) => Et(e, t) === "wall";
function jo(e, t) {
  let o = Et(e, t);
  return o === "dot" || o === "power" || o === "open" || o === "tunnel";
}
function Zo(e, t, o) {
  let r = Et(e, t);
  return r === "wall" ? !1 : r === "door" || r === "house" ? o : !0;
}
var $o = (e, t) => Et(e, t) === "tunnel",
  rt = 0,
  Ce = 1,
  nt = 2,
  at = 3,
  oe = [0, -1, 0, 1],
  re = [-1, 0, 1, 0],
  De = e => (e + 2) % 4,
  _e = {
    x: 13.5,
    y: 23,
    dir: Ce
  },
  Be = {
    x: 13.5,
    y: 11
  },
  bo = {
    x: 13.5,
    y: 14
  },
  Ko = [{
    x: 11.5,
    y: 14
  }, {
    x: 13.5,
    y: 14
  }, {
    x: 15.5,
    y: 14
  }],
  Ve = {
    x: 13.5,
    y: 17
  },
  he = (() => {
    let e = [];
    for (let t = 0; t < 31; t++) for (let o = 0; o < 28; o++) {
      let r = Et(o, t);
      (r === "dot" || r === "power") && e.push({
        col: o,
        row: t,
        power: r === "power"
      });
    }
    return e;
  })(),
  qo = (() => {
    let e = new Int16Array(868).fill(-1);
    return he.forEach((t, o) => {
      e[t.row * 28 + t.col] = o;
    }), e;
  })(),
  be = e => (e - 27 / 2) * 2,
  ne = e => (e - 30 / 2) * 2;
var ke = 56 / 2,
  ce = 62 / 2;
import * as Qo from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var H = {
    night: "#03040a",
    floor: "#04070b",
    wallTop: "#03171a",
    wallBase: "#020b0e",
    wallGlow: "#10c4b1",
    line: "#17e2cb",
    lineHot: "#a8fff2",
    pellet: "#efffd2",
    power: "#fbfff0",
    door: "#9b7bff",
    pod: "#d4ff3a",
    podDeep: "#6fb81a",
    wing: "#c8fff4",
    podEye: "#10140a",
    frightened: "#ddd6ff",
    frightGlow: "#ece8ff",
    lobbyLine: "#d4ff3a",
    violet: "#9a5cff",
    teal: "#5ff7e4"
  },
  qe = {
    grumble: "#a45cff",
    slink: "#4d74ff",
    wobble: "#45ff8a",
    mope: "#ffc933"
  },
  Jo = 0.0105,
  er = {
    strength: 0.72,
    radius: 0.42,
    threshold: 1.05
  },
  st = 0.9,
  L = (e, t = 1) => new Qo.Color(e).multiplyScalar(t),
  ye = {
    uTime: {
      value: 0
    }
  };
function ht(e) {
  let t = e >>> 0;
  return () => {
    t = t + 1831565813 >>> 0;
    let o = t;
    return o = Math.imul(o ^ o >>> 15, o | 1), o ^= o + Math.imul(o ^ o >>> 7, o | 61), ((o ^ o >>> 14) >>> 0) / 4294967296;
  };
}
var Le = {
    x: ke + 14,
    north: -ce - 14,
    south: ce + 27
  },
  It = 2.2,
  rr = ce + 14,
  Zn = 11,
  nr = {
    position: [0, 0.05, rr],
    yaw: Math.PI
  },
  yo = ne(Ie),
  tr = ke + 8,
  it = {
    x: ke + 8,
    z: -ce - 8
  },
  ar = [],
  Lt = {
    x: 6.5,
    z: ce + 9.5
  },
  Ot = ke + 5,
  At = yo + 6.5,
  or = e => {
    let t = e < 0 ? Math.PI / 4 : -Math.PI / 4,
      o = Math.sin(t),
      r = Math.cos(t),
      l = {
        x: -e * Math.SQRT1_2,
        z: -Math.SQRT1_2
      },
      i = e * it.x + o * (1.2 + 3) + l.x * 6,
      c = it.z + r * (1.2 + 3) + l.z * 6;
    return {
      id: e < 0 ? "north-west" : "north-east",
      x: i,
      z: c,
      radius: 1.35,
      readerYaw: t,
      exit: [i - o * 1.9, 0.05, c - r * 1.9]
    };
  },
  Ye = [{
    id: "lobby",
    x: Lt.x,
    z: Lt.z,
    radius: 1.7,
    readerYaw: Math.PI,
    exit: [Lt.x - 1.2, 0.05, Lt.z + 2.2]
  }, {
    id: "west",
    x: -Ot,
    z: At,
    radius: 1.35,
    readerYaw: Math.PI / 2,
    exit: [-Ot - 1.8, 0.05, At - 0.9]
  }, {
    id: "east",
    x: Ot,
    z: At,
    radius: 1.35,
    readerYaw: -Math.PI / 2,
    exit: [Ot + 1.8, 0.05, At - 0.9]
  }, {
    id: "north",
    x: -6,
    z: -ce - 4,
    radius: 1.35,
    readerYaw: 0,
    exit: [-5.1, 0.05, -ce - 5.8]
  }, or(-1), or(1)],
  ts = Ye[0],
  zt = {
    width: 1.7,
    depth: 1.2,
    height: 2.7,
    behind: 2.6
  },
  sr = e => ({
    x: e.x + Math.sin(e.readerYaw) * zt.behind,
    z: e.z + Math.cos(e.readerYaw) * zt.behind,
    yaw: e.readerYaw + Math.PI
  }),
  ir = [{
    x: -15,
    z: ce + 9,
    yaw: Math.PI / 2,
    hue: qe.grumble
  }, {
    x: -15,
    z: ce + 13,
    yaw: Math.PI / 2,
    hue: "#5ff7e4"
  }, {
    x: -15,
    z: ce + 17,
    yaw: Math.PI / 2,
    hue: qe.mope
  }, {
    x: 15,
    z: ce + 15,
    yaw: -Math.PI / 2,
    hue: qe.slink
  }, {
    x: 15,
    z: ce + 19,
    yaw: -Math.PI / 2,
    hue: qe.wobble
  }],
  q = {
    z: ce + 24,
    y: 3.2,
    width: 16,
    height: 4
  },
  lr = -25;
var cr = ["grumble", "slink", "wobble", "mope"],
  To = {
    grumble: {
      x: 25,
      y: -3
    },
    slink: {
      x: 2,
      y: -3
    },
    wobble: {
      x: 27,
      y: 31
    },
    mope: {
      x: 0,
      y: 31
    }
  },
  $n = 8;
function ur(e, t, o) {
  let {
      runner: r
    } = t,
    l = Math.round(r.x),
    i = Math.round(r.y),
    c = oe[r.dir],
    m = re[r.dir];
  switch (e) {
    case "grumble":
      return o.x = l, o.y = i, o;
    case "slink":
      return o.x = l + c * 4, o.y = i + m * 4, o;
    case "wobble":
      {
        let u = l + c * 2,
          a = i + m * 2;
        return o.x = u + (u - t.grumble.x), o.y = a + (a - t.grumble.y), o;
      }
    case "mope":
      {
        let u = Math.hypot(t.self.x - l, t.self.y - i) > $n,
          a = To.mope;
        return o.x = u ? l : a.x, o.y = u ? i : a.y, o;
      }
  }
}
function bt(e, t, o, r, l, i) {
  let c = De(o),
    m = 0,
    u = c,
    a = Number.POSITIVE_INFINITY;
  for (let f = 0; f < 4; f = f + 1) {
    if (f === c || !l(e + oe[f], t + re[f])) continue;
    m++;
    let b = (e + oe[f] - r.x) ** 2 + (t + re[f] - r.y) ** 2;
    b < a && (a = b, u = f);
  }
  if (m === 0 || !i) return u;
  let E = Math.min(m - 1, Math.floor(i() * m));
  for (let f = 0; f < 4; f = f + 1) if (!(f === c || !l(e + oe[f], t + re[f])) && E-- === 0) return f;
  return u;
}
var Kn = 0.22,
  yt = 1e-6,
  Dt = e => e === 1 || e === 3;
function go(e) {
  let t = Dt(e.dir) ? e.x : e.y,
    o = Dt(e.dir) ? oe[e.dir] : re[e.dir],
    r = t - Math.floor(t);
  return r < yt || 1 - r < yt ? 0 : o > 0 ? 1 - r : r;
}
function Bt(e) {
  e.x = Math.round(e.x), e.y = Math.round(e.y);
}
function mr(e, t) {
  e.x += oe[e.dir] * t, e.y += re[e.dir] * t;
}
function fr(e) {
  return Math.round(e.y) !== Ie ? !1 : e.x < -0.5 ? (e.x += 28, !0) : e.x > 28 - 0.5 ? (e.x -= 28, !0) : !1;
}
function dr(e, t, o) {
  if (e.wanted !== null && e.wanted === De(e.dir) && (e.dir = e.wanted, e.wanted = null, e.moving = !0), e.wanted !== null && e.moving && Dt(e.wanted) !== Dt(e.dir)) {
    let i = go(e),
      c = i === 0 ? 0 : 1 - i;
    if (c > yt && c <= Kn) {
      let m = Math.round(e.x - oe[e.dir] * c),
        u = Math.round(e.y - re[e.dir] * c);
      o(m + oe[e.wanted], u + re[e.wanted]) && (e.x = m, e.y = u, e.dir = e.wanted, e.wanted = null);
    }
  }
  let r = t,
    l = !1;
  for (let i = 0; r > yt && i < 16; i++) {
    let c = go(e);
    if (c === 0) {
      Bt(e);
      let u = e.x,
        a = e.y,
        E = e.wanted;
      if (E !== null && o(u + oe[E], a + re[E]) && (e.dir = E, e.wanted = null), !o(u + oe[e.dir], a + re[e.dir])) {
        e.moving = !1;
        break;
      }
      e.moving = !0, c = 1;
    }
    let m = Math.min(r, c);
    mr(e, m), r -= m, m === c && Bt(e), fr(e) && (l = !0);
  }
  return l;
}
function wo(e, t, o) {
  let r = t,
    l = !1;
  for (let i = 0; r > yt && i < 16; i++) {
    let c = go(e);
    c === 0 && (Bt(e), e.dir = o(e.x, e.y, e.dir), c = 1);
    let m = Math.min(r, c);
    mr(e, m), r -= m, m === c && Bt(e), fr(e) && (l = !0);
  }
  return l;
}
var qn = 0.5,
  Qn = 0.3,
  Jn = 0.5,
  ea = 0.375,
  kt = {
    left: "Digit1",
    up: "Digit2",
    right: "Digit3",
    down: "Digit4"
  };
function ta(e) {
  let t = Math.round(e / (Math.PI / 2)) * (Math.PI / 2),
    o = Math.round(Math.sin(t)) || 0,
    r = Math.round(Math.cos(t)) || 0;
  return {
    rightX: -r || 0,
    rightY: o,
    upX: o,
    upY: r
  };
}
function pr(e) {
  let t = (e(kt.right) ? 1 : 0) - (e(kt.left) ? 1 : 0),
    o = (e(kt.up) ? 1 : 0) - (e(kt.down) ? 1 : 0);
  return t === 0 && o === 0 ? null : {
    x: t,
    y: o
  };
}
var oa = (e, t) => Math.abs(e) > Math.abs(t) ? e > 0 ? at : Ce : t > 0 ? nt : rt;
function ra(e, t, o, r) {
  let l = Math.hypot(e, t);
  if (l < (r === null ? qn : Qn)) return null;
  let i = oe[o],
    c = re[o],
    m = (e * -c + t * i) / l,
    u = r !== null && r % 2 !== o % 2;
  if (Math.abs(m) >= (u ? ea : Jn)) {
    let a = Math.sign(m);
    return oa(-c * a, i * a);
  }
  return e * i + t * c < 0 ? De(o) : o;
}
function Er(e) {
  let t = null,
    o = null,
    r = 0;
  return {
    read(l, i, c, m) {
      let u = null;
      if (l) {
        let a = ta(c),
          E = l.x * a.rightX + l.y * a.upX,
          f = l.x * a.rightY + l.y * a.upY;
        u = ra(E, f, i, t);
      }
      return t = u, u !== null ? (o = u, r = e) : o !== null && (r -= m, r <= 0 && (o = null)), o;
    },
    taken(l) {
      t === null && o === l && (o = null);
    },
    reset() {
      t = null, o = null, r = 0;
    }
  };
}
function xo(e) {
  let t = e <= 1 ? 0 : e <= 4 ? 1 : 2,
    o = [0.8, 0.88, 0.95][t],
    r = [0.9, 0.95, 1][t],
    l = [0.75, 0.84, 0.92][t],
    i = [0.5, 0.55, 0.6][t],
    c = [0.4, 0.45, 0.5][t];
  return {
    runner: o * 5.6,
    runnerFright: r * 5.6,
    gloomy: l * 5.6,
    gloomyFright: i * 5.6,
    gloomyTunnel: c * 5.6,
    wisp: 1.9 * 5.6,
    pen: 0.4 * 5.6
  };
}
var br = 24,
  yr = 1.08;
function Ro(e) {
  return e <= 1 ? [7, 20, 7, 20, 5, 20, 5, Number.POSITIVE_INFINITY] : e <= 4 ? [7, 20, 7, 20, 5, 30, 3, Number.POSITIVE_INFINITY] : [5, 20, 5, 20, 5, 40, 2, Number.POSITIVE_INFINITY];
}
function Tr(e) {
  return Math.max(0, [6, 5, 4, 3, 2.5, 2, 2, 1.5, 1.5, 1][e - 1] ?? 1);
}
var gr = 1.8,
  Mo = [250, 500, 1e3, 2e3],
  wr = 10,
  xr = 50,
  vo = 1e4,
  Ho = 3;
function Go(e, t) {
  return t ? [{
    dots: 0,
    seconds: 1
  }, {
    dots: 7,
    seconds: 3.5
  }, {
    dots: 17,
    seconds: 6
  }] : e <= 1 ? [{
    dots: 0,
    seconds: 0.5
  }, {
    dots: 30,
    seconds: 6
  }, {
    dots: 60,
    seconds: 11
  }] : e === 2 ? [{
    dots: 0,
    seconds: 0.5
  }, {
    dots: 0,
    seconds: 3
  }, {
    dots: 50,
    seconds: 8
  }] : [{
    dots: 0,
    seconds: 0.3
  }, {
    dots: 0,
    seconds: 2
  }, {
    dots: 0,
    seconds: 4
  }];
}
var hr = [{
  name: "Dewdrop",
  points: 100,
  color: "#8ff8ff",
  halo: "#e8fffb"
}, {
  name: "Moonstone",
  points: 250,
  color: "#c9c4ff",
  halo: "#ffffff"
}, {
  name: "Sunstone",
  points: 400,
  color: "#ffb84a",
  halo: "#fff1c4"
}, {
  name: "Leafglass",
  points: 600,
  color: "#7dff6a",
  halo: "#e8ffd0"
}, {
  name: "Starshard",
  points: 900,
  color: "#fff27a",
  halo: "#ffffff"
}, {
  name: "Comet Gem",
  points: 1500,
  color: "#6aa8ff",
  halo: "#d8ecff"
}, {
  name: "Aurora Gem",
  points: 2500,
  color: "#ff7ae0",
  halo: "#c8fff4"
}, {
  name: "Nova Gem",
  points: 4e3,
  color: "#ffffff",
  halo: "#d4ff3a"
}];
function Rr(e) {
  let t = e <= 1 ? 0 : e <= 2 ? 1 : Math.min(hr.length - 1, Math.floor(e / 2) + 1);
  return hr[t];
}
var Mr = [70, 170],
  vr = 9.5;
var So = "highScore",
  Qe = 0.34,
  na = 1.7,
  aa = 0.6,
  Tt = 0.7,
  sa = 1.6,
  ia = 2.6,
  la = 2.3,
  ca = 0.72,
  Nt = 0.8,
  ua = 0.6,
  Hr = {
    distance: 19,
    height: 1.8,
    pitch: 1.12,
    fov: 55,
    followSpeed: 7
  },
  Ft = Math.PI,
  ma = 1,
  fa = [2, 3, 5, 3],
  Gr = 13,
  da = -18,
  pa = 23,
  Ea = 12,
  Sr = 16,
  ha = 1.4,
  Pr = 9,
  ba = 24,
  Wt = [["KeyW", "ArrowUp"], ["KeyD", "ArrowRight"], ["KeyS", "ArrowDown"], ["KeyA", "ArrowLeft"]],
  ya = [13.5, 11, 12.25, 16],
  Vt = e => Math.atan2(oe[e], re[e]),
  lt = e => Math.atan2(Math.sin(e), Math.cos(e)),
  Te = (e, t) => 1 - Math.exp(-e * t),
  Ne = e => Math.floor(e).toLocaleString("en-US"),
  Cr = e => e < 0.5 ? 2 * e * e : 1 - (-2 * e + 2) ** 2 / 2,
  gt = (e, t, o) => e < t ? t : e > o ? o : e,
  Ta = e => gt(0.8 + e / 42, 1.05, 1.9);
function _r(e) {
  let {
      world: t,
      pod: o,
      pellets: r,
      maze: l,
      bonus: i,
      lobby: c,
      beacon: m,
      sound: u
    } = e,
    a = "idle",
    E = 0,
    f = 0,
    b = null,
    R = 0,
    g = !1,
    p = 0,
    n = !1,
    T = 0,
    w = () => Ye[T],
    v = 0,
    y = Ho,
    S = 1,
    G = t.records.get(So) ?? 0,
    N = () => {
      G >= vo && t.achievements.unlock("score-10000");
    };
  N(), t.records.onChange(() => {
    G = t.records.get(So) ?? G, c.setHighScore(G), N();
  });
  let V = !1,
    ue = new Uint8Array(he.length),
    A = he.length,
    me = 0,
    Y = 0,
    ee = 0,
    fe = 0,
    J = !0,
    te = 0,
    O = 0,
    z = 0,
    U = null,
    F = Go(1, !1),
    $ = xo(1),
    Ae = Ro(1),
    Ee = null,
    ge = 0,
    et = 0,
    we = -1,
    je = 0,
    Rt = Er(Nt),
    Mt = "keyboard",
    oo = new ae.Vector3(),
    vt = 0,
    ro = 0,
    tt = 0,
    I = {
      x: _e.x,
      y: _e.y,
      dir: _e.dir,
      moving: !0,
      wanted: null
    },
    K = new ae.Vector3(w().x, Qe, w().z),
    B = new ae.Vector3().copy(K),
    de = 0,
    ot = new ae.Vector3(),
    Ze = 0,
    mt = new ae.Vector3(),
    Io = new ae.Vector3(),
    $e = -1,
    no = new ae.Vector3(),
    D = {
      active: !1,
      from: new ae.Vector3(),
      to: new ae.Vector3(),
      t: 0,
      duration: 1,
      height: 6,
      yaw: 0,
      landYaw: Number.NaN
    },
    Ht = (s, d) => Zo(s, d, !1),
    ft = {
      runner: I,
      grumble: {
        x: 0,
        y: 0
      },
      self: {
        x: 0,
        y: 0
      }
    },
    fn = {
      x: 13.5,
      y: Be.y
    },
    Me = e.gloomies.map((s, d) => {
      let h = d === 0 ? {
          x: Be.x,
          y: Be.y
        } : Ko[d - 1],
        x = {
          actor: s,
          name: s.name,
          x: h.x,
          y: h.y,
          dir: Ce,
          mode: d === 0 ? "active" : "house",
          frightened: !1,
          release: d - 1,
          slot: {
            ...h
          },
          sleep: {
            x: ya[d],
            y: d === 0 ? 13.2 : 14.6
          },
          target: {
            x: 0,
            y: 0
          },
          choose: () => Ce,
          face: 0,
          lookX: 0,
          lookZ: 1,
          phase: d * 1.7
        };
      return x.choose = (k, Z, le) => x.mode === "wisp" ? bt(k, Z, le, fn, Ht, null) : x.frightened ? bt(k, Z, le, x.target, Ht, Math.random) : J ? bt(k, Z, le, To[x.name], Ht, null) : (ft.self.x = k, ft.self.y = Z, ur(x.name, ft, x.target), bt(k, Z, le, x.target, Ht, null)), x;
    }),
    ao = Me[0],
    dt = s => {
      I.x = _e.x, I.y = _e.y, I.dir = _e.dir, I.moving = !0, I.wanted = null, we = -1, je = 0, Rt.reset(), Me.forEach((d, h) => {
        d.x = d.slot.x, d.y = d.slot.y, d.dir = h === 0 ? Ce : h === 2 ? rt : nt, d.mode = h === 0 ? "active" : "house", d.frightened = !1;
      }), te = 0, fe = 0, J = !0, ee = 0, Y = 0, F = Go(S, s), $ = xo(S), Ae = Ro(S), U = null, Ee = null, ge = 0, i.showGem(null), Do(), Ct(), Io.copy(mt), $e = 0, B.copy(K), de = Vt(I.dir);
    },
    Gt = () => {
      ue.fill(0), r.reset(), A = he.length, me = 0, et = 0;
    },
    dn = () => {
      v = 0, y = Ho, S = 1, V = !1, Gt(), dt(!1);
    },
    Do = () => {
      o.shell.scale.setScalar(1), o.seat.scale.setScalar(1), o.glow.scale.setScalar(1);
    },
    Bo = () => {
      a = "idle", E = 0, D.active = !1, p++, Gt(), dt(!1), T = 0, K.set(w().x, Qe, w().z), B.copy(K), de = so(), Ze = 0, l.setFlash(0), u.siren("off", 0, f);
    },
    so = () => lt(w().readerYaw + Math.PI),
    St = s => {
      v += s, !V && v >= vo && (V = !0, y++, t.sfx("win", 0.8), t.rumble(0.4, 160), t.toast("Extra life!"), t.achievements.unlock("score-10000"));
    },
    io = () => {
      if (v <= 0) return !1;
      let s = t.records.best(So, v);
      return s && (G = v, c.setHighScore(G)), s;
    },
    ko = () => ({
      title: n ? "Paused" : `Level ${S}`,
      primary: Ne(v),
      secondary: `${"\u2665".repeat(Math.max(0, Math.min(6, y)))}   High ${Ne(Math.max(G, v))}`,
      progress: 1 - A / he.length
    }),
    xe = {
      score: -1,
      lives: -1,
      level: -1,
      dots: -1,
      paused: !1,
      high: -1
    },
    pn = () => {
      xe.score === v && xe.lives === y && xe.level === S && xe.dots === A && xe.paused === n && xe.high === G || (xe.score = v, xe.lives = y, xe.level = S, xe.dots = A, xe.paused = n, xe.high = G, t.hud.update(ko()));
    },
    En = () => {
      xe.score = -1;
    },
    hn = (s, d, h, x) => {
      D.active = !0, D.from.copy(K), D.to.copy(s), D.t = 0, D.duration = d, D.height = h, D.yaw = Math.atan2(s.x - K.x, s.z - K.z), D.landYaw = x;
    },
    lo = s => {
      if (!D.active) return !0;
      D.t = Math.min(1, D.t + s / D.duration);
      let d = Cr(D.t);
      K.lerpVectors(D.from, D.to, d), K.y += D.height * 4 * D.t * (1 - D.t);
      let h = D.t > 0.55 && !Number.isNaN(D.landYaw) ? D.landYaw : D.yaw;
      return de += lt(h - de) * Te(10, s), D.t >= 1 && (D.active = !1, Number.isNaN(D.landYaw) || (de = D.landYaw)), !D.active;
    },
    co = (s, d, h = Number.NaN) => {
      let x = Math.hypot(s.x - K.x, s.z - K.z);
      hn(s, Ta(x), d + x * 0.06, h);
    },
    bn = () => {
      if (a !== "idle" || !t.active) return;
      let s = t.possess({
        seat: o.seat,
        cameraTarget: o.cameraTarget,
        camera: Hr,
        update: (x, k) => An(x, k),
        onExit: () => Tn(),
        exitKeys: ["F"]
      });
      if (!s.active) return;
      b = s, R = 0, dn(), $e = -1;
      let d = w();
      K.set(d.x, Qe, d.z), B.copy(K), co(no.set(be(_e.x), 0, ne(_e.y)), 5, Vt(_e.dir)), a = "launch", E = 0, Ze = 0, En(), t.hud.show({
        ...ko(),
        icon: "pellet"
      }), t.sfx("coin", 1.2), t.rumble(0.25, 80);
      let h = ++p;
      t.hud.countdown(3).then(x => {
        h !== p || a !== "launch" || x && (D.active = !1, Ct(), a = "play", E = 0, t.rumble(0.45, 140));
      });
    },
    uo = () => {
      Do();
      let s = w();
      co(no.set(s.x, Qe, s.z), 4, Ft), a = "return", E = 0;
    },
    yn = () => {
      switch (a) {
        case "launch":
        case "ready":
        case "play":
        case "bop":
        case "dying":
        case "clear":
          {
            p++;
            let s = io();
            t.hud.hide(), s && t.hud.banner("New high score!", Ne(v), 2600), u.siren("off", 0, f), l.setFlash(0), uo();
            break;
          }
        case "over":
          uo();
          break;
        default:
          break;
      }
    },
    Tn = () => {
      if (b) {
        if (b = null, p++, u.siren("off", 0, f), t.hud.hide(), g) {
          g = !1, gn();
          return;
        }
        a !== "over" && a !== "return" && io(), Bo();
      }
    },
    gn = () => {
      a = "idle", E = 0, D.active = !1;
      let s = de;
      Gt(), dt(!1), de = s, l.setFlash(0);
      let d = w();
      K.set(d.x, Qe, d.z), B.copy(K);
    },
    wn = s => {
      if (a !== "idle" || s === T) return;
      T = s;
      let d = w();
      co(no.set(d.x, Qe, d.z), 6, so()), a = "fetch", E = 0, t.sfx("whoosh", 0.9);
    },
    xn = () => G > 0 ? `Insert coin \xB7 High score ${Ne(G)}` : "Insert coin";
  Ye.forEach((s, d) => {
    t.addInteractable({
      position: new ae.Vector3(s.x, 0.5, s.z),
      radius: s.radius + 0.9,
      label: () => d === T ? xn() : "Call the Glow-Pod",
      enabled: () => a === "idle",
      onInteract: () => d === T ? bn() : wn(d)
    });
  });
  let No = s => {
      let d = Ft - s * Math.PI / 2,
        h = Math.sin(d),
        x = Math.cos(d);
      return Math.abs(h) > Math.abs(x) ? h > 0 ? at : Ce : x > 0 ? nt : rt;
    },
    Pt = (s, d) => {
      for (let h of s) if (d(h)) return !0;
      return !1;
    },
    Rn = (s, d) => {
      for (let h = 0; h < 4; h++) Pt(Wt[h], s.pressed) && (we = h, je = Nt);
      for (let h = 0; h < 4 && we < 0; h++) Pt(Wt[h], s.held) && (we = h, je = Nt);
      we < 0 || (Pt(Wt[we], s.held) ? je = Nt : je -= d, je <= 0 ? (we = -1, I.wanted = null) : I.wanted = No(we));
    },
    Mn = s => {
      we < 0 || I.dir !== No(we) || Pt(Wt[we], s.held) || (we = -1, I.wanted = null);
    },
    vn = (s, d) => {
      if (s.device !== Mt && (Mt = s.device, we = -1, je = 0, Rt.reset(), I.wanted = null), Mt !== "gamepad") {
        Rn(s, d);
        return;
      }
      let h = s.analog(),
        x = pr(s.held) ?? {
          x: h.moveX,
          y: h.moveY
        };
      t.camera.getWorldDirection(oo), I.wanted = Rt.read(x, I.dir, Math.atan2(oo.x, oo.z), d);
    },
    Hn = s => {
      Mt === "gamepad" ? Rt.taken(I.dir) : Mn(s);
    },
    Gn = () => {
      O = Tr(S), te = O, z = 0;
      for (let s of Me) s.mode === "wisp" || s.mode === "entering" || (s.mode === "active" && (s.dir = De(s.dir)), s.frightened = O > 0);
    },
    Sn = () => {
      let s = ho(Math.round(I.x)),
        d = Math.round(I.y),
        h = qo[d * 28 + s] ?? -1;
      if (h < 0 || ue[h]) return;
      ue[h] = 1, r.eat(h), A--, me++, Y++, he[h]?.power ? (St(xr), t.sfx("pickup", 1.1), t.rumble(0.45, 130), tt = 1.6, Gn()) : (St(wr), tt = Math.max(tt, 0.45)), u.chime();
      let x = Mr[et];
      x !== void 0 && me >= x && (et++, Ee = Rr(S), ge = vr, i.showGem(Ee));
    },
    Fo = (s, d, h, x) => {
      let k = x,
        Z = d - s.x;
      if (Math.abs(Z) > 1e-6) {
        let ze = Math.min(Math.abs(Z), k);
        s.x += Math.sign(Z) * ze, s.dir = Z > 0 ? at : Ce, k -= ze;
      }
      let le = h - s.y;
      if (k > 0 && Math.abs(le) > 1e-6) {
        let ze = Math.min(Math.abs(le), k);
        s.y += Math.sign(le) * ze, s.dir = le > 0 ? nt : rt;
      }
      return Math.abs(d - s.x) < 1e-6 && Math.abs(h - s.y) < 1e-6;
    },
    Pn = s => {
      let d = s;
      for (let h = 0; h < Ae.length; h++) {
        let x = Ae[h];
        if (d < x) return h % 2 === 0;
        d -= x;
      }
      return !1;
    },
    Cn = s => {
      ft.grumble.x = Math.round(ao.x), ft.grumble.y = Math.round(ao.y);
      for (let d of Me) switch (d.mode) {
        case "house":
          break;
        case "leaving":
          Fo(d, Be.x, Be.y, $.pen * s) && (d.mode = "active", d.dir = d.frightened ? at : Ce);
          break;
        case "active":
          {
            let h = $o(Math.round(d.x), Math.round(d.y)),
              x = d === ao && A <= br ? yr : 1,
              k = d.frightened ? $.gloomyFright : h ? $.gloomyTunnel : $.gloomy * x;
            wo(d, k * s, d.choose);
            break;
          }
        case "wisp":
          wo(d, $.wisp * s, d.choose), Math.round(d.y) === Be.y && Math.abs(d.x - Be.x) <= 0.6 && (d.y = Be.y, d.mode = "entering");
          break;
        case "entering":
          Fo(d, bo.x, bo.y, $.wisp * 0.5 * s) && (d.mode = "leaving", d.frightened = !1);
          break;
      }
    },
    _n = () => {
      for (let s of Me) {
        if (s.mode !== "house" || s.release < 0) continue;
        let d = F[s.release];
        if (d) {
          (Y >= d.dots || ee >= d.seconds) && (s.mode = "leaving");
          break;
        }
      }
    },
    Ln = s => {
      let d = Math.abs(s.x - I.x);
      return d > 28 / 2 && (d = 28 - d), Math.hypot(d, s.y - I.y) < ca;
    },
    On = (s, d) => {
      if (ee += s, te > 0) {
        if (te -= s, te <= 0) {
          te = 0;
          for (let x of Me) x.frightened = !1;
        }
      } else fe += s;
      let h = Pn(fe);
      if (h !== J) {
        J = h;
        for (let x of Me) x.mode === "active" && !x.frightened && (x.dir = De(x.dir));
      }
      if (vn(d, s), dr(I, (te > 0 ? $.runnerFright : $.runner) * s, jo) && (t.sfx("whoosh", 0.35), B.set(be(I.x), 0, ne(I.y))), Hn(d), Sn(), A <= 0) {
        a = "clear", E = 0, t.sfx("win", 1.2), t.rumble(0.6, 320), t.hud.banner("Level clear!", Ne(v), 2200), t.achievements.unlock("level-clear");
        return;
      }
      if (Ee) {
        ge -= s;
        let x = Math.hypot(I.x - Ve.x, I.y - Ve.y) < 0.8;
        x && (St(Ee.points), i.popup(Ee.points, be(Ve.x), ne(Ve.y), Ee.color), u.gem(), t.rumble(0.35, 120)), (x || ge <= 0) && (Ee = null, i.showGem(null));
      }
      _n(), Cn(s);
      for (let x of Me) if (!(x.mode !== "active" || !Ln(x))) {
        if (x.frightened) {
          let k = Mo[Math.min(Mo.length - 1, z)];
          z++, z >= Me.length && t.achievements.unlock("bop-all-four"), St(k), i.popup(k, be(x.x), ne(x.y)), u.bop(), t.rumble(0.45 + 0.15 * z, 150 + 50 * z), x.frightened = !1, x.mode = "wisp", U = x, a = "bop", E = 0;
          return;
        }
        a = "dying", E = 0, t.sfx("hurt", 1.1);
        return;
      }
    },
    Ct = () => {
      K.set(be(I.x), 0, ne(I.y));
    },
    An = (s, d) => {
      f += s, R += s, n = Dn();
      let h = !n;
      switch (R >= ua && d.pressed("KeyF") && yn(), a) {
        case "launch":
          lo(s) && (Ct(), de += lt(Vt(I.dir) - de) * Te(8, s));
          break;
        case "ready":
          h && (E += s), E >= na && (a = "play", E = 0);
          break;
        case "play":
          h && On(s, d);
          break;
        case "bop":
          h && (E += s), E >= aa && (a = "play", U = null);
          break;
        case "dying":
          h && (E += s), zn();
          break;
        case "clear":
          h && (E += s), In();
          break;
        case "over":
          E += s, E >= la && uo();
          break;
        case "return":
          if (lo(s) && b) {
            po(s), g = !0, t.rumble(0.3, 110), b.release(w().exit);
            return;
          }
          break;
        default:
          break;
      }
      (a === "play" || a === "ready" || a === "bop" || a === "dying" || a === "clear") && Ct(), po(s), b && a !== "over" && a !== "return" && pn();
      let x = !1;
      for (let Z of Me) (Z.mode === "wisp" || Z.mode === "entering") && (x = !0);
      let k = a !== "play" || n ? "off" : x ? "wisp" : te > 0 ? "fright" : "chase";
      u.siren(k, 1 - A / he.length, f);
    },
    mo = !1,
    zn = () => {
      if (E < Tt) {
        mo = !1;
        return;
      }
      mo || (mo = !0, u.death(), t.rumble(0.8, 380));
      let s = Math.min(1, (E - Tt) / sa),
        d = (1 - s) * (0.55 + 0.45 * Math.sin(E * 47) * Math.sin(E * 13));
      o.pose(vt, Math.max(0, 1 - s * 2), Math.max(0, d));
      let h = s < 0.75 ? 1 : Math.max(0.001, 1 - (s - 0.75) / 0.25);
      if (o.shell.scale.setScalar(h), o.seat.scale.setScalar(h), o.glow.scale.setScalar(h), s < 1) return;
      if (y--, y > 0) {
        dt(!0), a = "ready", E = 0, t.hud.banner("Ready!", `${y} ${y === 1 ? "life" : "lives"} left`, 1500);
        return;
      }
      a = "over", E = 0;
      let x = io();
      t.hud.update({
        title: "Game over",
        secondary: `High ${Ne(G)}`,
        progress: null
      }), t.sfx("lose", 1.1), t.rumble(0.3, 260), t.hud.banner("Game over", x ? `New high score ${Ne(v)}` : `Score ${Ne(v)} \xB7 High ${Ne(G)}`, 3200);
    },
    In = () => {
      let s = E;
      l.setFlash(s > 0.5 && s < 2.3 && Math.floor((s - 0.5) * 4.4) % 2 === 0 ? 1 : 0), !(s < ia) && (l.setFlash(0), S++, Gt(), dt(!1), a = "ready", E = 0, t.hud.banner(`Level ${S}`, "Ready!", 1500));
    },
    Dn = () => t.paused || typeof document < "u" && !document.hasFocus(),
    fo = new ae.Vector3(),
    Wo = Math.PI,
    po = s => {
      let d = a === "play" || a === "ready" || a === "bop" || a === "dying" || a === "clear";
      d ? (B.x += (K.x - B.x) * Te(30, s), B.z += (K.z - B.z) * Te(30, s), B.y = K.y, a !== "dying" && (de += lt(Vt(I.dir) - de) * Te(16, s))) : B.copy(K);
      let h = a === "play" && I.moving && !n,
        x = D.active || a === "fetch" || a === "launch" || a === "return";
      if (ro += ((a === "idle" ? 0 : h || x ? 1 : 0.55) - ro) * Te(6, s), vt += s * (h || x ? 38 : 9), tt = Math.max(0, tt - s * 4), a !== "dying") {
        let We = a === "idle" || a === "fetch" ? 0.12 * Math.sin(f * 2.4) : 0;
        o.pose(vt, ro, 1 + We + tt);
      }
      o.root.position.copy(B), o.root.rotation.y = de, a === "dying" && E > Tt && (o.root.rotation.y = de + (E - Tt) * 9), o.body.position.y = 0.76 + (h ? Math.abs(Math.sin(vt * 0.5)) * 0.035 : 0);
      let Z = d && a !== "dying" ? fa[I.dir] : 0;
      ot.x += (oe[I.dir] * Z - ot.x) * Te(2.5, s), ot.z += (re[I.dir] * Z - ot.z) * Te(2.5, s), Ze += ((d ? 1 : 0) - Ze) * Te(4, s);
      let le = gt(B.x + ot.x, -Gr, Gr),
        ze = gt(B.z + ot.z + ma, da, pa),
        pt = 0;
      if (d && Math.round(I.y) === Ie) {
        let We = gt((Math.abs(B.x) - Sr) / (ke - Sr), 0, 1),
          Yo = We * We * (3 - 2 * We);
        le *= 1 - Yo, pt = Ea * Yo, ze += pt / Math.tan(Hr.pitch);
      }
      let Wn = B.x + (le - B.x) * Ze,
        Vn = B.y + pt * Ze,
        Yn = B.z + (ze - B.z) * Ze;
      if (mt.set(Wn, Vn, Yn), $e >= 0 && b) {
        $e += s;
        let We = Math.min(1, $e / ha);
        mt.lerpVectors(Io, mt, Cr(We)), We >= 1 && ($e = -1);
      } else $e = -1;
      o.cameraTarget.position.copy(mt), o.cameraTarget.rotation.y = Ft, o.cameraTarget.updateMatrixWorld();
    },
    Pe = {
      x: 0,
      z: 0,
      y: 0,
      face: 0,
      lookX: 0,
      lookZ: 1,
      look: "normal",
      time: 0
    },
    Bn = s => a === "idle" || a === "fetch" || a === "return" ? "sleep" : a === "over" || a === "dying" && E >= Tt || a === "clear" && E >= 0.5 || a === "bop" && s === U ? "hidden" : s.mode === "wisp" || s.mode === "entering" ? "wisp" : s.frightened ? te < gr && Math.floor(te * 5) % 2 === 0 ? "flash" : "frightened" : "normal",
    kn = (s, d) => {
      t.camera.getWorldDirection(fo), Wo = Math.atan2(fo.x, fo.z);
      for (let h of Me) {
        let x = Bn(h),
          k = x === "sleep",
          Z = k ? h.sleep.x : h.x,
          le = k ? h.sleep.y : h.y;
        h.face += lt(Wo + Math.PI - h.face) * Te(8, s);
        let ze = oe[h.dir],
          pt = re[h.dir];
        h.lookX += (ze - h.lookX) * Te(12, s), h.lookZ += (pt - h.lookZ) * Te(12, s), Pe.x = be(Z), Pe.z = ne(le), Pe.y = k ? 0.04 + 0.05 * Math.sin(d * 1.3 + h.phase) : h.mode === "house" ? 0.1 + 0.18 * Math.abs(Math.sin(d * 3.2 + h.phase)) : 0.12 + 0.06 * Math.sin(d * 5 + h.phase), Pe.face = h.face, Pe.lookX = k ? 0 : h.lookX, Pe.lookZ = k ? 1 : h.lookZ, Pe.look = x, Pe.time = d + h.phase, h.actor.kit.setLook(x), h.actor.view.apply(Pe), h.actor.mirror.apply(Pe);
      }
    },
    Nn = {
      get phase() {
        return a;
      },
      get paused() {
        return n;
      },
      get score() {
        return v;
      },
      get lives() {
        return y;
      },
      get level() {
        return S;
      },
      get high() {
        return G;
      },
      get dotsLeft() {
        return A;
      },
      get fright() {
        return te;
      },
      get scatter() {
        return J;
      },
      get viewYaw() {
        return Ft;
      },
      get home() {
        return Ye[T]?.id ?? null;
      },
      get possessed() {
        return b?.active ?? !1;
      },
      get gem() {
        return Ee?.name ?? null;
      },
      runner: I,
      gloomies: Me.map(s => ({
        get name() {
          return s.name;
        },
        get x() {
          return s.x;
        },
        get y() {
          return s.y;
        },
        get dir() {
          return s.dir;
        },
        get mode() {
          return s.mode;
        },
        get frightened() {
          return s.frightened;
        }
      }))
    },
    Vo = new ae.Mesh(new ae.BoxGeometry(1.3, 1.75, 1.3), new ae.MeshBasicMaterial({
      visible: !1
    }));
  Vo.name = "runner-pod-collider";
  let _t = !1;
  t.addMover(Vo, (s, d) => {
    d.position.set(B.x, _t ? B.y + 0.55 : -60, B.z);
  });
  let Fn = () => {
      if (a !== "idle" || D.active) {
        _t = !1;
        return;
      }
      if (_t) return;
      let s = t.player.position,
        d = s.x - B.x,
        h = s.z - B.z;
      _t = d * d + h * h > 1.6 * 1.6 || s.y > B.y + 1.9;
    },
    Eo = 1;
  return {
    debug: Nn,
    update(s, d) {
      if (!t.active && (a !== "idle" || T !== 0) && Bo(), !b) {
        if (f += s, a === "fetch" && lo(s) && (a = "idle", E = 0, t.sfx("pickup", 0.7), t.rumble(0.2, 90)), a === "idle") {
          let le = w();
          K.set(le.x, Qe + Math.sin(d * 2) * 0.08, le.z), de += lt(so() - de) * Te(4, s);
        }
        po(s);
      }
      Fn(), kn(s, d), o.syncMirror(), r.update(d), i.update(s, d), c.update(d, b !== null, a === "idle" ? T : -1);
      let h = a === "idle" || a === "fetch";
      Eo += ((h ? 1 : 0) - Eo) * Te(h ? 2 : 6, s);
      let x = t.camera.position,
        k = Math.hypot(x.x - B.x, x.z - B.z),
        Z = gt((k - Pr) / (ba - Pr), 0, 1);
      m.place(B.x, B.z, Eo * Z * Z * (3 - 2 * Z), k), l.setPulse(te > 0 ? 0.5 + 0.5 * Math.sin(d * 10) : 0);
    }
  };
}
var Lr = [1047, 1175, 1319, 1568, 1760, 1568, 1319, 1175];
function Or(e) {
  let t = () => e.active && typeof document < "u" && document.visibilityState === "visible",
    o = () => t() ? e.audio : null,
    r = 0,
    l = 0,
    i = null,
    c = (u, a, E, f, b, R) => {
      let g = o();
      if (!g || g.context.state !== "running") return;
      let {
          context: p
        } = g,
        n = p.currentTime + f,
        T = p.createOscillator();
      T.type = u, T.frequency.setValueAtTime(a, n), T.frequency.exponentialRampToValueAtTime(E, n + b);
      let w = p.createGain();
      w.gain.setValueAtTime(1e-4, n), w.gain.exponentialRampToValueAtTime(R, n + Math.min(0.012, b / 4)), w.gain.exponentialRampToValueAtTime(1e-4, n + b), T.connect(w).connect(g.output), T.start(n), T.stop(n + b + 0.03);
    },
    m = () => {
      let u = i;
      if (u) {
        i = null;
        try {
          let a = u.gain.context.currentTime;
          u.gain.gain.setTargetAtTime(1e-4, a, 0.03), u.osc.stop(a + 0.2);
        } catch {}
      }
    };
  return {
    chime() {
      let u = performance.now();
      if (u - l < 70) return;
      l = u;
      let a = Lr[r % Lr.length];
      r++, c("sine", a, a * 1.01, 0, 0.09, 0.05), c("sine", a * 2, a * 2, 0.005, 0.05, 0.012);
    },
    bop() {
      c("sine", 320, 980, 0, 0.14, 0.08), c("triangle", 1500, 2400, 0.12, 0.12, 0.04);
    },
    gem() {
      c("triangle", 1319, 1330, 0, 0.09, 0.07), c("triangle", 1760, 1770, 0.08, 0.09, 0.07), c("triangle", 2637, 2650, 0.16, 0.18, 0.06);
    },
    death() {
      m(), c("sine", 640, 70, 0, 1.25, 0.07), c("sawtooth", 1280, 160, 0.02, 1.1, 0.012);
      for (let u = 0; u < 5; u++) c("sine", 1900 - u * 260, 1700 - u * 260, 0.1 + u * 0.19, 0.05, 0.02);
      c("sine", 150, 55, 1.3, 0.22, 0.08);
    },
    siren(u, a, E) {
      let f = u === "off" ? null : o();
      if (!f || f.context.state !== "running") {
        m();
        return;
      }
      let {
        context: b
      } = f;
      if (i && i.mode !== u && m(), !i) {
        let g = b.createOscillator();
        g.type = u === "chase" ? "triangle" : "sine";
        let p = b.createGain();
        p.gain.value = 1e-4, g.connect(p).connect(f.output), g.start(), i = {
          osc: g,
          gain: p,
          mode: u
        }, p.gain.setTargetAtTime(u === "chase" ? 0.05 : 0.018, b.currentTime, 0.05);
      }
      let R;
      if (u === "chase") {
        let g = 1.4 + a * 2.6,
          p = Math.sin(E * g * Math.PI * 2);
        R = (78 + a * 34) * (1 + 0.09 * p);
      } else u === "fright" ? R = 1180 + 140 * Math.sin(E * 31) + 60 * Math.sin(E * 7) : R = 560 + 260 * Math.sin(E * 4.5);
      i.osc.frequency.value = R;
    }
  };
}
import * as Ue from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import * as j from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var He = "#include <fog_pars_vertex>",
  Ge = "#include <fog_pars_fragment>",
  pe = `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
`;
function Se(e) {
  return new j.ShaderMaterial({
    ...e,
    fog: !0,
    uniforms: {
      ...j.UniformsUtils.clone(j.UniformsLib.fog),
      ...e.uniforms
    }
  });
}
function Yt(e, t = {}) {
  return Se({
    uniforms: {
      uColor: {
        value: new j.Color(e)
      },
      uCore: {
        value: t.core ?? 0.42
      },
      uRim: {
        value: t.rim ?? 2.4
      },
      uWhite: {
        value: 0
      },
      uFlash: {
        value: 0
      },
      uTime: ye.uTime
    },
    vertexShader: `
      varying vec3 vNormalW;
      varying vec3 vWorld;
      varying float vLocalY;
      ${He}
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vLocalY = position.y;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vec4 mvPosition = viewMatrix * world;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uCore;
      uniform float uRim;
      uniform float uWhite;
      uniform float uFlash;
      uniform float uTime;
      varying vec3 vNormalW;
      varying vec3 vWorld;
      varying float vLocalY;
      ${Ge}
      void main() {
        vec3 n = normalize(vNormalW);
        if (!gl_FrontFacing) n = -n;
        vec3 v = normalize(cameraPosition - vWorld);
        float facing = clamp(dot(n, v), 0.0, 1.0);
        float rim = pow(1.0 - facing, 2.2);
        float top = smoothstep(0.2, 1.0, n.y) * 0.35;
        float band = 0.5 + 0.5 * sin(vLocalY * 18.0 - uTime * 3.0);
        vec3 rimColor = mix(uColor, vec3(1.0, 1.0, 1.08), uWhite);
        vec3 col = uColor * (uCore + top + band * 0.06) + rimColor * uRim * rim;
        col = mix(col, vec3(2.2, 2.2, 2.4), uFlash);
        gl_FragColor = vec4(col, 1.0);
        ${pe}
      }
    `,
    side: j.DoubleSide
  });
}
function ga(e = 128) {
  let t = document.createElement("canvas");
  t.width = e, t.height = e;
  let o = t.getContext("2d"),
    r = o.createRadialGradient(e / 2, e / 2, 0, e / 2, e / 2, e / 2);
  r.addColorStop(0, "rgba(255,255,255,1)"), r.addColorStop(0.35, "rgba(255,255,255,0.45)"), r.addColorStop(1, "rgba(255,255,255,0)"), o.fillStyle = r, o.fillRect(0, 0, e, e);
  let l = new j.CanvasTexture(t);
  return l.colorSpace = j.SRGBColorSpace, l;
}
var Ar = null;
function ct(e, t, o) {
  Ar ??= ga();
  let r = new j.MeshBasicMaterial({
      map: Ar,
      color: new j.Color(e).multiplyScalar(t),
      transparent: !0,
      depthWrite: !1,
      blending: j.AdditiveBlending,
      fog: !0
    }),
    l = new j.Mesh(new j.PlaneGeometry(o * 2, o * 2), r);
  return l.rotation.x = -Math.PI / 2, l.position.y = 0.02, l.renderOrder = 2, l;
}
var zr = 26,
  wa = 1.7;
function Ir() {
  let e = {
      value: 1
    },
    t = new Ue.CylinderGeometry(0.16, 0.3, zr, 20, 1, !0);
  t.translate(0, wa + zr / 2, 0);
  let o = Se({
      uniforms: {
        uColor: {
          value: L(H.pod, 2.6)
        },
        uStrength: e,
        uTime: ye.uTime
      },
      vertexShader: `
      varying float vHeight;
      varying vec3 vNormalW;
      varying vec3 vWorld;
      ${He}
      void main() {
        vHeight = uv.y;
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vec4 mvPosition = viewMatrix * world;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
      fragmentShader: `
      uniform vec3 uColor;
      uniform float uStrength;
      uniform float uTime;
      varying float vHeight;
      varying vec3 vNormalW;
      varying vec3 vWorld;
      ${Ge}
      void main() {
        vec3 v = normalize(cameraPosition - vWorld);
        // Brightest where the shaft is seen edge-on, like a volume of light.
        float edge = 1.0 - abs(dot(normalize(vNormalW), v));
        // Fades into the night above, and in over the first metre above the pod.
        float fade = pow(1.0 - vHeight, 1.5) * smoothstep(0.0, 0.05, vHeight);
        float bands = pow(0.5 + 0.5 * sin(vHeight * 60.0 - uTime * 3.2), 8.0);
        float a = fade * (0.28 + 0.2 * edge + 0.5 * bands) * uStrength;
        gl_FragColor = vec4(uColor * a, 1.0);
        ${pe}
      }
    `,
      transparent: !0,
      depthWrite: !1,
      side: Ue.DoubleSide,
      blending: Ue.AdditiveBlending
    }),
    r = new Ue.Mesh(t, o);
  return r.name = "pod-beacon", r.renderOrder = 4, r.frustumCulled = !1, {
    mesh: r,
    place(l, i, c, m) {
      let u = Math.max(0, m - 20);
      e.value = c * (1 + u / 50), r.visible = c > 0.01, r.position.set(l, 0, i);
      let a = 1 + u / 22;
      r.scale.set(a, 1, a);
    }
  };
}
import * as se from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import * as Ut from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var Dr = {
    A: [14, 17, 17, 31, 17, 17, 17],
    B: [30, 17, 17, 30, 17, 17, 30],
    C: [14, 17, 16, 16, 16, 17, 14],
    D: [30, 17, 17, 17, 17, 17, 30],
    E: [31, 16, 16, 30, 16, 16, 31],
    F: [31, 16, 16, 30, 16, 16, 16],
    G: [14, 17, 16, 23, 17, 17, 15],
    H: [17, 17, 17, 31, 17, 17, 17],
    I: [14, 4, 4, 4, 4, 4, 14],
    J: [7, 2, 2, 2, 2, 18, 12],
    K: [17, 18, 20, 24, 20, 18, 17],
    L: [16, 16, 16, 16, 16, 16, 31],
    M: [17, 27, 21, 21, 17, 17, 17],
    N: [17, 17, 25, 21, 19, 17, 17],
    O: [14, 17, 17, 17, 17, 17, 14],
    P: [30, 17, 17, 30, 16, 16, 16],
    Q: [14, 17, 17, 17, 21, 18, 13],
    R: [30, 17, 17, 30, 20, 18, 17],
    S: [15, 16, 16, 14, 1, 1, 30],
    T: [31, 4, 4, 4, 4, 4, 4],
    U: [17, 17, 17, 17, 17, 17, 14],
    V: [17, 17, 17, 17, 17, 10, 4],
    W: [17, 17, 17, 21, 21, 21, 10],
    X: [17, 17, 10, 4, 10, 17, 17],
    Y: [17, 17, 17, 10, 4, 4, 4],
    Z: [31, 1, 2, 4, 8, 16, 31],
    0: [14, 17, 19, 21, 25, 17, 14],
    1: [4, 12, 4, 4, 4, 4, 14],
    2: [14, 17, 1, 2, 4, 8, 31],
    3: [31, 2, 4, 2, 1, 17, 14],
    4: [2, 6, 10, 18, 31, 2, 2],
    5: [31, 16, 30, 1, 1, 17, 14],
    6: [6, 8, 16, 30, 17, 17, 14],
    7: [31, 1, 2, 4, 8, 8, 8],
    8: [14, 17, 17, 14, 17, 17, 14],
    9: [14, 17, 17, 15, 1, 2, 12],
    "-": [0, 0, 0, 31, 0, 0, 0],
    "!": [4, 4, 4, 4, 4, 0, 4],
    ".": [0, 0, 0, 0, 0, 0, 4],
    ":": [0, 4, 0, 0, 0, 4, 0],
    " ": [0, 0, 0, 0, 0, 0, 0]
  },
  Xe = e => Math.max(0, e.length * 6 - 1),
  Fe = class {
    constructor(t, o, r) {
      this.cols = t;
      this.rows = o;
      this.scale = r;
      this.canvas = document.createElement("canvas"), this.canvas.width = t * r, this.canvas.height = o * r, this.ctx = this.canvas.getContext("2d");
    }
    canvas;
    ctx;
    clear(t) {
      let {
        ctx: o,
        canvas: r
      } = this;
      o.clearRect(0, 0, r.width, r.height), t && (o.fillStyle = t, o.fillRect(0, 0, r.width, r.height));
    }
    dot(t, o, r, l = 0.6) {
      let {
        ctx: i,
        scale: c
      } = this;
      i.shadowColor = r, i.shadowBlur = c * 1.4 * l, i.fillStyle = r;
      let m = c * 0.08;
      i.fillRect(t * c + m, o * c + m, c - m * 2, c - m * 2), i.shadowBlur = 0;
    }
    text(t, o, r, l, i = 0.6) {
      let c = o;
      for (let m of t.toUpperCase()) (Dr[m] ?? Dr[" "])?.forEach((a, E) => {
        for (let f = 0; f < 5; f++) a & 1 << 4 - f && this.dot(c + f, r + E, l, i);
      }), c += 6;
    }
    centered(t, o, r, l = 0.6) {
      this.text(t, Math.round((this.cols - Xe(t)) / 2), o, r, l);
    }
    sprite(t, o, r, l, i = 0.5) {
      t.forEach((c, m) => {
        for (let u = 0; u < c.length; u++) {
          let a = l[c[u]];
          a && this.dot(o + u, r + m, a, i);
        }
      });
    }
    texture() {
      let t = new Ut.CanvasTexture(this.canvas);
      return t.colorSpace = Ut.SRGBColorSpace, t.anisotropy = 4, t;
    }
  },
  Xt = [".h..........h.", ".hh........hh.", "..h.######.h..", "...########...", "..##########..", ".#ww######ww#.", ".#wwp####pww#.", ".##ww####ww##.", ".############.", ".############.", "..##########..", "..###....###..", ".####....####."],
  jt = ["...ww..ww....", "..wwww.www...", "..wwwwwwww..a", "....wwww...a.", "....######a..", "ggg########..", "gggg#####e##.", "ggg########..", "....#..#..#.."];
var Po = 1.1;
function Br() {
  let e = new se.Group();
  e.name = "bonus-gem", e.position.set(be(Ve.x), 0, ne(Ve.y));
  let t = new se.MeshStandardMaterial({
      color: "#8ff8ff",
      emissive: "#8ff8ff",
      emissiveIntensity: 0.85,
      roughness: 0.15,
      metalness: 0.1,
      flatShading: !0
    }),
    o = new se.MeshBasicMaterial({
      color: L("#e8fffb", 1.6),
      fog: !0
    }),
    r = new se.Group();
  r.position.y = 0.95, e.add(r);
  let l = new se.Mesh(new se.OctahedronGeometry(0.34, 0), t);
  l.scale.set(0.9, 1.35, 0.9), r.add(l);
  let i = new se.Mesh(new se.TorusGeometry(0.5, 0.025, 6, 32), o);
  i.rotation.x = Math.PI / 2 - 0.35, r.add(i);
  let c = ct("#8ff8ff", 0.7, 1.2);
  e.add(c), e.visible = !1;
  let m = new Map(),
    u = (f, b) => {
      let R = `${f}|${b}`,
        g = m.get(R);
      if (!g) {
        let p = String(f),
          n = new Fe(Xe(p) + 2, 9, 12);
        n.clear(null), n.text(p, 1, 1, b, 0.7), g = n.texture(), m.set(R, g);
      }
      return g;
    },
    a = Array.from({
      length: 4
    }, () => {
      let f = new se.Sprite(new se.SpriteMaterial({
        color: L("#ffffff", 1.6),
        transparent: !0,
        depthWrite: !1,
        fog: !0
      }));
      return f.visible = !1, f.renderOrder = 5, {
        sprite: f,
        age: Po,
        width: 1
      };
    }),
    E = 0;
  return {
    objects: [e, ...a.map(f => f.sprite)],
    showGem(f) {
      e.visible = f !== null, f && (t.color.set(f.color), t.emissive.set(f.color), o.color.set(f.halo).multiplyScalar(1.6), c.material.color.set(f.color).multiplyScalar(0.7));
    },
    popup(f, b, R, g = H.teal) {
      let p = a[E];
      E = (E + 1) % a.length;
      let n = p.sprite.material;
      n.map = u(f, g), n.needsUpdate = !0;
      let T = String(f).length;
      p.width = 0.55 * T + 0.3, p.sprite.scale.set(p.width, 0.62, 1), p.sprite.position.set(b, 1.5, R), p.sprite.visible = !0, p.age = 0;
    },
    update(f, b) {
      e.visible && (r.rotation.y = b * 2.2, r.position.y = 0.95 + Math.sin(b * 3) * 0.08, i.rotation.z = -b * 1.3);
      for (let R of a) {
        if (!R.sprite.visible) continue;
        R.age += f, R.sprite.position.y += f * 0.9;
        let g = R.sprite.material;
        g.opacity = Math.min(1, (Po - R.age) / 0.3), R.age >= Po && (R.sprite.visible = !1);
      }
    }
  };
}
import * as ie from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
function kr() {
  let e = Le.x * 2,
    t = Le.south - Le.north,
    o = (Le.south + Le.north) / 2,
    r = new ie.PlaneGeometry(e, t);
  r.rotateX(-Math.PI / 2);
  let l = Se({
      uniforms: {
        uBase: {
          value: new ie.Color(H.floor)
        },
        uGrid: {
          value: L(H.wallGlow, 0.09)
        },
        uWarm: {
          value: L(H.violet, 0.07)
        },
        uMaze: {
          value: new ie.Vector2(ke, ce)
        },
        uCell: {
          value: 2
        },
        uTime: ye.uTime
      },
      vertexShader: `
      varying vec3 vWorld;
      ${He}
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vec4 mvPosition = viewMatrix * world;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
      fragmentShader: `
      uniform vec3 uBase;
      uniform vec3 uGrid;
      uniform vec3 uWarm;
      uniform vec2 uMaze;
      uniform float uCell;
      uniform float uTime;
      varying vec3 vWorld;
      ${Ge}
      void main() {
        vec2 p = vWorld.xz;
        // Tile lines: tiles span even x and odd z in metres.
        vec2 g = abs(fract((p + vec2(0.0, 1.0)) / uCell) - 0.5) * uCell;
        float w = fwidth(p.x) * 1.2;
        float line = smoothstep(uCell * 0.5 - 0.03 - w, uCell * 0.5 - 0.01, max(g.x, g.y));
        vec2 inMaze = step(abs(p), uMaze);
        float maze = inMaze.x * inMaze.y;
        // Outside the maze a wider, dimmer grid.
        vec2 g2 = abs(fract(p / (uCell * 2.0)) - 0.5) * uCell * 2.0;
        float line2 = smoothstep(uCell - 0.03 - w, uCell - 0.01, max(g2.x, g2.y));
        float lobby = smoothstep(uMaze.y + 26.0, uMaze.y + 4.0, p.y) * smoothstep(uMaze.y - 2.0, uMaze.y + 8.0, p.y);
        float scan = 0.75 + 0.25 * sin(p.y * 0.35 - uTime * 1.2);
        vec3 col = uBase + uGrid * (line * maze * 0.9 + line2 * (1.0 - maze) * 0.55) * scan;
        col += uWarm * lobby * (0.6 + 0.4 * sin(uTime * 0.8));
        gl_FragColor = vec4(col, 0.86);
        ${pe}
      }
    `,
      transparent: !0,
      depthWrite: !0
    }),
    i = new ie.Mesh(r, l);
  i.position.z = o, i.renderOrder = -10, i.name = "floor";
  let c = new ie.Group();
  c.name = "rails";
  let m = new ie.MeshBasicMaterial({
      color: "#06141a",
      transparent: !0,
      opacity: 0.45,
      depthWrite: !1,
      fog: !0
    }),
    u = new ie.MeshBasicMaterial({
      color: L(H.violet, 1.8),
      fog: !0
    }),
    a = [],
    E = [[0, Le.north, e, 0.2], [0, Le.south, e, 0.2], [-Le.x, o, 0.2, t], [Le.x, o, 0.2, t]];
  for (let [f, b, R, g] of E) {
    let p = new ie.Mesh(new ie.BoxGeometry(R, It, g), m);
    p.position.set(f, It / 2, b), c.add(p);
    let n = new ie.Mesh(new ie.BoxGeometry(R + 0.1, 0.08, g + 0.1), u);
    n.position.set(f, It, b), a.push(n);
  }
  return {
    statics: [i, c],
    decor: a
  };
}
import * as P from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import { mergeGeometries as xa } from "./vendor/002-BufferGeometryUtils.js";
var Nr = 0.5,
  Ra = 0.6,
  Ma = 0.12,
  va = new P.MeshBasicMaterial({
    color: L("#fff8e6", 1.3),
    fog: !0
  }),
  Ha = new P.MeshBasicMaterial({
    color: "#150b20",
    fog: !0
  }),
  Ga = new P.MeshBasicMaterial({
    color: L("#fff7ff", 1.7),
    fog: !0
  }),
  Fr = null,
  Wr = null;
function Co(e, t) {
  let o = e.getAttribute("position");
  e.computeVertexNormals();
  let r = e.getAttribute("normal");
  for (let l = 0; l < o.count; l++) {
    let i = o.getX(l),
      c = o.getY(l),
      m = o.getZ(l),
      u = t(i, c, m);
    o.setXYZ(l, i + r.getX(l) * u, c + r.getY(l) * u, m + r.getZ(l) * u);
  }
  return e.computeVertexNormals(), e;
}
function Sa(e) {
  let t = e.index ? e.toNonIndexed() : e;
  for (let o of Object.keys(t.attributes)) o !== "position" && o !== "normal" && t.deleteAttribute(o);
  return t;
}
var wt = e => {
    let t = xa(e.map(Sa));
    return t.computeVertexNormals(), t;
  },
  Pa = {
    grumble: {
      body: () => {
        let e = ht(11),
          t = Array.from({
            length: 6
          }, () => [e() * 6.28, e() * 6.28]),
          o = new P.SphereGeometry(0.6, 28, 18);
        o.scale(1.1, 0.8, 0.95), Co(o, (i, c, m) => {
          let u = 0;
          for (let [a, E] of t) u += Math.sin(i * 7 + a) * Math.sin(m * 6 + E) * 0.012;
          return u + Math.max(0, c) * 0.02;
        }), o.translate(0, 0.52, 0);
        let r = [o];
        for (let i of [-1, 1]) {
          let c = new P.ConeGeometry(0.11, 0.34, 10);
          c.rotateZ(-i * 0.55), c.translate(i * 0.36, 1.02, -0.02), r.push(c);
          let m = new P.SphereGeometry(0.2, 12, 8);
          m.scale(1, 0.55, 1.35), m.translate(i * 0.3, 0.08, 0.12), r.push(m);
        }
        let l = new P.CapsuleGeometry(0.07, 0.5, 4, 8);
        return l.rotateZ(Math.PI / 2), l.translate(0, 0.8, 0.5), r.push(l), wt(r);
      },
      eyes: [{
        x: -0.19,
        y: 0.64,
        z: 0.5,
        size: [1.05, 0.8, 0.7],
        roll: -0.35
      }, {
        x: 0.19,
        y: 0.64,
        z: 0.5,
        size: [1.05, 0.8, 0.7],
        roll: 0.35
      }],
      mouth: {
        y: 0.42,
        z: 0.55
      },
      move(e, t) {
        e.position.y = Math.abs(Math.sin(t * 5)) * 0.05, e.rotation.z = Math.sin(t * 5) * 0.06;
      }
    },
    slink: {
      body: () => {
        let e = [];
        for (let l = 0; l <= 16; l++) {
          let i = l / 16,
            c = i * 1.2,
            m = Math.max(0.02, 0.4 * Math.sin(Math.PI * Math.min(1, i * 1.12)) ** 0.8 * (1 - i * 0.35));
          e.push(new P.Vector2(m, c));
        }
        let t = new P.LatheGeometry(e, 28);
        t.scale(1, 1, 0.85);
        let o = [t];
        for (let l of [-1, 1]) {
          let i = new P.ConeGeometry(0.1, 0.62, 10);
          i.scale(1, 1, 0.55), i.rotateZ(-l * 0.28), i.translate(l * 0.2, 1.36, -0.02), o.push(i);
        }
        let r = new P.TubeGeometry(new P.CatmullRomCurve3([new P.Vector3(0, 0.3, -0.3), new P.Vector3(0.1, 0.25, -0.62), new P.Vector3(0.28, 0.5, -0.78), new P.Vector3(0.24, 0.78, -0.66)]), 16, 0.05, 6, !1);
        return o.push(r), wt(o);
      },
      eyes: [{
        x: -0.15,
        y: 0.9,
        z: 0.28,
        size: [1.2, 0.5, 0.7],
        roll: 0.18
      }, {
        x: 0.15,
        y: 0.9,
        z: 0.28,
        size: [1.2, 0.5, 0.7],
        roll: -0.18
      }],
      mouth: {
        y: 0.72,
        z: 0.32
      },
      move(e, t) {
        e.rotation.z = Math.sin(t * 2.2) * 0.12, e.rotation.x = 0.08, e.position.y = 0;
      }
    },
    wobble: {
      body: () => {
        let e = new P.SphereGeometry(0.62, 28, 18);
        e.scale(1.12, 0.78, 1.05), Co(e, (r, l) => l < -0.3 ? (l + 0.3) * 0.35 : 0), e.translate(0, 0.5, 0);
        let t = new P.CylinderGeometry(0.025, 0.035, 0.42, 6);
        t.rotateZ(0.2), t.translate(-0.04, 1.14, 0);
        let o = new P.SphereGeometry(0.1, 12, 8);
        return o.translate(-0.09, 1.38, 0), wt([e, t, o]);
      },
      eyes: [{
        x: 0,
        y: 0.62,
        z: 0.52,
        size: [1.75, 1.75, 0.9],
        roll: 0
      }],
      mouth: {
        y: 0.3,
        z: 0.6
      },
      move(e, t) {
        let o = Math.sin(t * 7);
        e.scale.set(1 - o * 0.05, 1 + o * 0.08, 1 - o * 0.05), e.position.y = 0;
      }
    },
    mope: {
      body: () => {
        let e = ht(29),
          t = Array.from({
            length: 5
          }, () => [e() * 6.28, e() * 6.28]),
          o = new P.IcosahedronGeometry(0.54, 4);
        Co(o, (i, c, m) => {
          let u = 0;
          for (let [a, E] of t) u += Math.abs(Math.sin(i * 13 + a) * Math.sin(c * 11 + m * 9 + E));
          return u * 0.018;
        }), o.translate(0, 0.62, 0);
        let r = [o];
        for (let i of [-1, 1]) {
          let c = new P.SphereGeometry(0.14, 12, 8);
          c.scale(0.7, 2.3, 0.5), c.translate(0, -0.26, 0), c.rotateZ(i * 0.35), c.translate(i * 0.46, 0.96, 0), r.push(c);
        }
        let l = new P.ConeGeometry(0.07, 0.24, 8);
        return l.rotateZ(0.5), l.translate(-0.05, 1.2, 0), r.push(l), wt(r);
      },
      eyes: [{
        x: -0.17,
        y: 0.68,
        z: 0.48,
        size: [1, 0.62, 0.7],
        roll: -0.12
      }, {
        x: 0.17,
        y: 0.68,
        z: 0.48,
        size: [1, 0.62, 0.7],
        roll: 0.12
      }],
      mouth: {
        y: 0.46,
        z: 0.53
      },
      move(e, t) {
        e.rotation.z = Math.sin(t * 1.3) * 0.09, e.position.y = Math.sin(t * 1.9) * 0.04;
      }
    }
  };
function Ca(e) {
  let t = [];
  for (let r of e.eyes) {
    let l = new P.TorusGeometry(0.075 * Math.min(1.6, r.size[0]), 0.022, 6, 18);
    l.translate(r.x, r.y, r.z + 0.06), t.push(l);
    let i = new P.CircleGeometry(0.025, 8);
    i.translate(r.x, r.y, r.z + 0.07), t.push(i);
  }
  let o = new P.TorusGeometry(0.055, 0.02, 6, 16);
  return o.scale(1, 1.25, 1), o.translate(0, e.mouth.y, e.mouth.z), t.push(o), wt(t);
}
var Vr = new Map(),
  Yr = new Map();
function Ur(e) {
  let t = qe[e],
    o = Pa[e],
    r = Yt(t, {
      core: Nr,
      rim: 1.7
    }),
    l = r.uniforms,
    i = new P.Color(t),
    c = new P.Color(H.frightened);
  Fr ??= new P.SphereGeometry(0.12, 16, 12), Wr ??= new P.SphereGeometry(0.06, 12, 8);
  let m = Vr.get(e);
  m || (m = o.body(), Vr.set(e, m));
  let u = Yr.get(e);
  return u || (u = Ca(o), Yr.set(e, u)), {
    name: e,
    material: r,
    color: i,
    setLook(a) {
      let E = a === "frightened" || a === "flash";
      l.uCore.value = E ? Ra : a === "wisp" ? Ma : Nr, l.uRim.value = a === "wisp" ? 0.9 : E ? 1.2 : 1.7, l.uWhite.value = E ? 0.75 : 0, a === "frightened" ? l.uColor.value.copy(c) : l.uColor.value.copy(i);
    },
    create(a) {
      let E = new P.Group(),
        f = new P.Group();
      E.add(f), f.add(new P.Mesh(m, r));
      let b = new P.Group(),
        R = [],
        g = [];
      for (let y of o.eyes) {
        let S = new P.Mesh(Fr, va);
        S.scale.set(...y.size), S.position.set(y.x, y.y, y.z), S.rotation.z = y.roll, b.add(S), R.push(S);
        let G = new P.Mesh(Wr, Ha);
        G.scale.setScalar(Math.min(1.7, y.size[0])), b.add(G), g.push(G);
      }
      f.add(b);
      let p = new P.Mesh(u, Ga);
      f.add(p);
      let n = a ? ct(t, 0.55, 1.5) : null,
        T = n?.material,
        w = new P.Color(t).multiplyScalar(0.55),
        v = new P.Color(H.frightGlow).multiplyScalar(0.6);
      return n && E.add(n), {
        root: E,
        apply(y) {
          if (E.visible = y.look !== "hidden", !E.visible) return;
          E.position.set(y.x, y.y, y.z), E.rotation.y = y.face;
          let S = y.look === "wisp";
          E.scale.setScalar(S ? 0.5 : 1), o.move(f, y.time, y.look);
          let G = y.look === "frightened" || y.look === "flash";
          if (p.visible = G, b.visible = !G, n && T && (n.visible = !S, n.position.y = 0.02 - y.y, T.color.copy(G ? v : w)), !b.visible) return;
          let N = Math.cos(y.face),
            V = Math.sin(y.face),
            ue = y.lookX * N - y.lookZ * V,
            A = y.lookX * V + y.lookZ * N,
            me = y.look === "sleep";
          o.eyes.forEach((Y, ee) => {
            let fe = R[ee],
              J = g[ee];
            fe.scale.y = me ? Y.size[1] * 0.2 : Y.size[1], J.visible = !me;
            let te = 0.05 * Math.min(1.7, Y.size[0]);
            J.position.set(Y.x + ue * te, Y.y + (A < -0.5 ? 0.04 : A > 0.5 ? -0.03 : 0) * Y.size[1], Y.z + 0.1 * Y.size[2] + Math.max(0, A) * 0.015);
          });
        }
      };
    }
  };
}
import * as M from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import { mergeGeometries as _o } from "./vendor/002-BufferGeometryUtils.js";
var Zt = [[-0.6, 0], [0.45, 0], [0.45, 1], [0.62, 1.1], [0.62, 1.16], [0.34, 1.28], [0.3, 1.32], [0.1, 2.12], [0.28, 2.16], [0.28, 2.7], [-0.6, 2.7]],
  Xr = {
    from: [0.3, 1.32],
    to: [0.1, 2.12]
  },
  $t = null;
function _a(e) {
  if ($t) return $t;
  let t = new M.Shape(Zt.map(([f, b]) => new M.Vector2(f, b))),
    o = new M.ExtrudeGeometry(t, {
      depth: e,
      bevelEnabled: !0,
      bevelSize: 0.03,
      bevelThickness: 0.03,
      bevelSegments: 1
    });
  o.rotateY(-Math.PI / 2), o.translate(e / 2, 0, 0);
  let r = new M.CylinderGeometry(0.018, 0.018, 0.16, 6).toNonIndexed();
  r.translate(-0.3, 1.24, 0.48);
  let l = _o([o, r]);
  l.computeVertexNormals();
  let i = new M.CurvePath();
  Zt.forEach(([f, b], R) => {
    let [g, p] = Zt[(R + 1) % Zt.length];
    i.add(new M.LineCurve3(new M.Vector3(0, b, f), new M.Vector3(0, p, g)));
  });
  let c = [-1, 1].map(f => {
      let b = new M.TubeGeometry(i, 160, 0.028, 5, !0);
      return b.translate(f * (e / 2 + 0.035), 0, 0), b;
    }),
    m = _o(c),
    u = new M.SphereGeometry(0.05, 10, 8);
  u.translate(-0.3, 1.33, 0.48);
  let a = [u];
  for (let f of [0.15, 0.3]) {
    let b = new M.CylinderGeometry(0.04, 0.04, 0.03, 10);
    b.translate(f, 1.19, 0.5), a.push(b);
  }
  let E = _o(a);
  return $t = {
    body: l,
    trim: m,
    lights: E
  }, $t;
}
var $r = new M.MeshStandardMaterial({
  color: "#23225a",
  emissive: "#140f3a",
  roughness: 0.5,
  metalness: 0.25
});
function jr(e, t, o) {
  let r = zt.width,
    l = _a(r),
    i = new M.Group();
  i.add(new M.Mesh(l.body, $r)), i.add(new M.Mesh(l.trim, new M.MeshBasicMaterial({
    color: L(t, 2.2),
    fog: !0
  }))), i.add(new M.Mesh(l.lights, new M.MeshBasicMaterial({
    color: L(t, 1.6)
  })));
  let [c, m] = Xr.from,
    [u, a] = Xr.to,
    E = Math.hypot(u - c, a - m),
    f = Math.atan2(c - u, a - m),
    b = new M.Mesh(new M.PlaneGeometry(r * 0.8, E * 0.92), new M.MeshBasicMaterial({
      map: e,
      color: L("#ffffff", 1.25),
      fog: !0
    }));
  b.position.set(0, (m + a) / 2, (c + u) / 2 + 0.035), b.rotation.x = -f, i.add(b);
  let R = new M.Mesh(new M.PlaneGeometry(r * 0.9, 0.46), new M.MeshBasicMaterial({
    map: o,
    color: L("#ffffff", 1.5),
    fog: !0
  }));
  R.position.set(0, 2.43, 0.285), i.add(R);
  let g = new M.Mesh(new M.BoxGeometry(r + 0.1, 2.7, 1.25), new M.MeshBasicMaterial({
    visible: !1
  }));
  return g.position.set(0, 1.35, 0), {
    group: i,
    collider: g
  };
}
var Oo = {
    "#": "#5f8f22",
    w: H.wing,
    g: H.pod,
    a: H.pod
  },
  Ao = e => ({
    "#": e,
    h: e,
    w: "#fff8e6",
    p: "#150b20"
  });
function La() {
  let e = "GLOW MAZE",
    t = new Fe(Xe(e) + 32, 13, 12);
  return t.clear("#050a14"), t.sprite(jt, 1, 2, Oo, 0.45), t.text(e, 16, 3, H.pod, 0.7), t.sprite(Xt, Xe(e) + 17, 0, Ao(H.violet), 0.4), t.texture();
}
function Oa(e, t) {
  let o = new Fe(40, 32, 8);
  o.clear("#03060c");
  let r = t % 3;
  for (let l = 2; l < 38; l += 3) o.dot(l, 22, H.pellet, 0.3);
  return o.sprite(jt, 2 + r * 4, 14, Oo, 0.3), o.sprite(Xt, 23 - r * 2, 10, Ao(e), 0.3), o.centered(t % 2 === 0 ? "P1" : "HI", 3, "#ffffff", 0.3), o.texture();
}
var Lo = Xe("INSERT COIN") + 2,
  Aa = 9 / Lo;
function Zr(e) {
  let t = new Fe(Lo, 9, 16);
  return t.clear(null), t.text(e, Math.round((Lo - Xe(e)) / 2), 1, H.pod, 0.8), t.texture();
}
function za(e, t) {
  return Se({
    uniforms: {
      uColor: {
        value: L(H.pod, 1.6)
      },
      uHot: {
        value: L("#fff3c4", 2.6)
      },
      uTime: ye.uTime,
      uBusy: t,
      uHome: e
    },
    vertexShader: `
      varying vec2 vUv;
      ${He}
      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uHot;
      uniform float uTime;
      uniform float uBusy;
      uniform float uHome;
      varying vec2 vUv;
      ${Ge}
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        float edge = smoothstep(0.9, 0.96, r) * (1.0 - smoothstep(0.97, 1.0, r));
        float rings = pow(0.5 + 0.5 * sin(r * 20.0 - uTime * (2.0 + 2.0 * uHome)), 6.0) * (1.0 - r);
        rings *= 0.35 + 0.45 * uHome;
        float coin = 1.0 - smoothstep(0.24, 0.27, r);
        float coinRim = smoothstep(0.18, 0.2, r) * coin;
        float blink = mix(0.55, 0.55 + 0.45 * step(0.5, fract(uTime * 0.9)), uHome);
        vec3 col = uColor * (edge * (0.9 + 0.5 * uHome) + rings) * (1.0 - uBusy * 0.7);
        col += uHot * coinRim * blink + uColor * coin * 0.35;
        float a = clamp(edge + rings + coin, 0.0, 1.0);
        gl_FragColor = vec4(col * a, 1.0);
        ${pe}
      }
    `,
    transparent: !0,
    depthWrite: !1,
    blending: M.AdditiveBlending
  });
}
function Kr(e) {
  let t = [],
    o = [],
    r = new Fe(64, 38, 8),
    l = r.texture(),
    i = n => {
      r.clear("#03060c"), r.centered("GLOW MAZE", 2, H.pod, 0.6), r.centered("HIGH SCORE", 13, "#ffffff", 0.4), r.centered(String(Math.max(0, Math.floor(n))).padStart(6, "0"), 22, H.teal, 0.6), r.sprite(Xt.slice(5), 3, 30, Ao(H.violet), 0.3);
      for (let T = 21; T < 44; T += 4) r.dot(T, 34, H.pellet, 0.3);
      r.sprite(jt, 48, 29, Oo, 0.3), l.needsUpdate = !0;
    };
  i(e);
  let c = La(),
    m = (n, T, w, v) => {
      for (let y of [n.group, n.collider]) y.position.x = T, y.position.z = w, y.rotation.y = v;
      o.push(n.group), t.push(n.collider);
    };
  for (let n of Ye) {
    let T = sr(n);
    m(jr(l, H.pod, c), T.x, T.z, T.yaw);
  }
  let u = ir.map((n, T) => ({
    ...n,
    screen: Oa(n.hue, T)
  }));
  for (let n of u) m(jr(n.screen, n.hue, c), n.x, n.z, n.yaw);
  let a = {
      value: 0
    },
    E = [Zr("INSERT COIN"), Zr("CALL POD")],
    f = Ye.map((n, T) => {
      let w = {
          value: T === 0 ? 1 : 0
        },
        v = new M.Mesh(new M.CircleGeometry(n.radius, 48), za(w, a));
      v.rotation.x = -Math.PI / 2, v.position.set(n.x, 0.02, n.z), v.renderOrder = 2, v.name = `pod-pad-${n.id}`, o.push(v);
      let y = new M.MeshBasicMaterial({
          map: E[T === 0 ? 0 : 1],
          color: L("#ffffff", 1.4),
          transparent: !0,
          depthWrite: !1,
          blending: M.AdditiveBlending,
          fog: !0
        }),
        S = n.radius * 2.1,
        G = new M.Mesh(new M.PlaneGeometry(S, S * Aa), y),
        N = n.radius + 0.55;
      return G.position.set(n.x - Math.sin(n.readerYaw) * N, 0.025, n.z - Math.cos(n.readerYaw) * N), G.rotation.set(-Math.PI / 2, 0, n.readerYaw + Math.PI), G.renderOrder = 2, o.push(G), {
        home: w,
        material: y
      };
    }),
    b = new M.Mesh(new M.PlaneGeometry(q.width, q.height * 0.62), new M.MeshBasicMaterial({
      map: c,
      color: L("#ffffff", 1.6),
      fog: !0
    }));
  b.position.set(0, q.y + 1.6, q.z), b.rotation.y = Math.PI, o.push(b);
  let R = new M.MeshBasicMaterial({
      color: L(H.violet, 2),
      fog: !0
    }),
    g = new M.Mesh(new M.BoxGeometry(q.width + 0.4, q.height * 0.62 + 0.4, 0.1), new M.MeshStandardMaterial({
      color: "#0a0a20"
    }));
  g.position.set(0, q.y + 1.6, q.z + 0.08), o.push(g);
  let p = q.height * 0.62;
  for (let n of [-1, 1]) {
    let T = new M.Mesh(new M.BoxGeometry(q.width + 0.5, 0.08, 0.08), R);
    T.position.set(0, q.y + 1.6 + n * (p / 2 + 0.22), q.z - 0.04), o.push(T);
  }
  for (let n of [-1, 1]) {
    let T = new M.Mesh(new M.BoxGeometry(0.3, q.y + 0.4, 0.3), $r);
    T.position.set(n * (q.width / 2 - 1), (q.y + 0.4) / 2, q.z + 0.1), t.push(T);
    let w = new M.Mesh(new M.BoxGeometry(0.06, q.y + 0.4, 0.06), R);
    w.position.set(n * (q.width / 2 - 1), (q.y + 0.4) / 2, q.z - 0.08), o.push(w);
  }
  return {
    statics: t,
    decor: o,
    setHighScore: i,
    update(n, T, w) {
      a.value += ((T ? 1 : 0) - a.value) * 0.1;
      let v = Math.sin(n * 5) > -0.2 ? 1 : 0.15;
      f.forEach((y, S) => {
        let G = S === w;
        y.home.value += ((G ? 1 : 0) - y.home.value) * 0.08;
        let N = E[G ? 0 : 1];
        y.material.map !== N && (y.material.map = N), y.material.opacity = T ? 0.25 : G ? v : 0.7;
      });
    }
  };
}
import * as _ from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
function qr(e, t, o = 5) {
  let r = 84,
    l = 93,
    i = (p, n) => p < 0 || p >= 28 || n < 0 || n >= 31 ? !1 : Xo(p, n),
    c = new Uint8Array(r * l);
  for (let p = 0; p < 31; p++) for (let n = 0; n < 28; n++) {
    if (!i(n, p)) continue;
    let T = i(n, p - 1),
      w = i(n, p + 1),
      v = i(n - 1, p),
      y = i(n + 1, p),
      S = (G, N) => {
        c[(p * 3 + N) * r + n * 3 + G] = 1;
      };
    S(1, 1), T && S(1, 0), w && S(1, 2), v && S(0, 1), y && S(2, 1), T && v && i(n - 1, p - 1) && S(0, 0), T && y && i(n + 1, p - 1) && S(2, 0), w && v && i(n - 1, p + 1) && S(0, 2), w && y && i(n + 1, p + 1) && S(2, 2);
  }
  let m = (p, n) => p >= 0 && p < r && n >= 0 && n < l && c[n * r + p] === 1,
    u = [0, e, 2 - e],
    a = p => -56 / 2 + Math.floor(p / 3) * 2 + u[p % 3],
    E = p => -62 / 2 + Math.floor(p / 3) * 2 + u[p % 3],
    f = (p, n) => n * (r + 1) + p,
    b = new Map(),
    R = (p, n, T, w) => {
      let v = f(p, n),
        y = b.get(v);
      y ? y.push([p, n, T, w]) : b.set(v, [[p, n, T, w]]);
    };
  for (let p = 0; p < l; p++) for (let n = 0; n < r; n++) m(n, p) && (m(n, p - 1) || R(n, p, n + 1, p), m(n + 1, p) || R(n + 1, p, n + 1, p + 1), m(n, p + 1) || R(n + 1, p + 1, n, p + 1), m(n - 1, p) || R(n, p + 1, n, p));
  let g = [];
  for (let [, p] of b) for (; p.length > 0;) {
    let n = p.pop(),
      T = [[n[0], n[1]]],
      [,, w, v] = n,
      y = n[2] - n[0],
      S = n[3] - n[1];
    for (let N = 0; N < 1e5 && !(w === n[0] && v === n[1]); N++) {
      T.push([w, v]);
      let V = b.get(f(w, v));
      if (!V || V.length === 0) break;
      let ue = 0;
      if (V.length > 1) {
        let me = -2;
        V.forEach((Y, ee) => {
          let fe = Y[2] - Y[0],
            J = Y[3] - Y[1],
            te = y * J - S * fe,
            O = y * fe + S * J,
            z = te > 0 ? 1 : O > 0 ? 0 : -1;
          z > me && (me = z, ue = ee);
        });
      }
      let A = V.splice(ue, 1)[0];
      y = A[2] - A[0], S = A[3] - A[1], w = A[2], v = A[3];
    }
    let G = Ia(T.map(([N, V]) => [a(N), E(V)]));
    G.length < 3 || g.push({
      points: Da(G, t, o),
      area: Ba(G)
    });
  }
  return g;
}
function Ia(e) {
  let t = [],
    o = e.length;
  for (let r = 0; r < o; r++) {
    let l = e[(r + o - 1) % o],
      i = e[r],
      c = e[(r + 1) % o],
      m = (i[0] - l[0]) * (c[1] - i[1]) - (i[1] - l[1]) * (c[0] - i[0]);
    Math.abs(m) > 1e-9 && t.push(i);
  }
  return t;
}
function Da(e, t, o) {
  let r = [],
    l = e.length;
  for (let i = 0; i < l; i++) {
    let c = e[(i + l - 1) % l],
      m = e[i],
      u = e[(i + 1) % l],
      a = Math.hypot(m[0] - c[0], m[1] - c[1]),
      E = Math.hypot(u[0] - m[0], u[1] - m[1]),
      f = Math.min(t, a / 2, E / 2),
      b = (m[0] - c[0]) / a,
      R = (m[1] - c[1]) / a,
      g = (u[0] - m[0]) / E,
      p = (u[1] - m[1]) / E,
      n = [m[0] - b * f, m[1] - R * f],
      T = [m[0] + g * f, m[1] + p * f],
      w = n[0] + g * f,
      v = n[1] + p * f,
      y = Math.atan2(n[1] - v, n[0] - w),
      S = Math.atan2(T[1] - v, T[0] - w),
      G = S - y;
    for (; G > Math.PI;) G -= Math.PI * 2;
    for (; G < -Math.PI;) G += Math.PI * 2;
    S = y + G;
    for (let N = 0; N <= o; N++) {
      let V = y + G * N / o;
      r.push([w + Math.cos(V) * f, v + Math.sin(V) * f]);
    }
  }
  return r;
}
function Ba(e) {
  let t = 0;
  for (let o = 0; o < e.length; o++) {
    let r = e[o],
      l = e[(o + 1) % e.length];
    t += r[0] * l[1] - l[0] * r[1];
  }
  return t / 2;
}
var qt = 0.5,
  ka = 0.36,
  Na = 0.11,
  Qr = 0.07,
  Fa = 0.9;
function en() {
  let e = qr(qt, ka, 5),
    t = e.map(G => new _.Shape(G.points.map(([V, ue]) => new _.Vector2(V, -ue)))),
    o = new _.ExtrudeGeometry(t, {
      depth: st,
      bevelEnabled: !1,
      curveSegments: 1
    });
  o.rotateX(-Math.PI / 2), o.computeVertexNormals();
  let r = {
      value: 0
    },
    l = {
      value: 0
    },
    i = Se({
      uniforms: {
        uBase: {
          value: new _.Color(H.wallBase)
        },
        uTop: {
          value: new _.Color(H.wallTop)
        },
        uGlow: {
          value: L(H.wallGlow, 0.45)
        },
        uHeight: {
          value: st
        },
        uFlash: r,
        uPulse: l
      },
      vertexShader: `
      varying vec3 vNormalW;
      varying vec3 vWorld;
      varying float vH;
      ${He}
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vH = position.y;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vec4 mvPosition = viewMatrix * world;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
      fragmentShader: `
      uniform vec3 uBase;
      uniform vec3 uTop;
      uniform vec3 uGlow;
      uniform float uHeight;
      uniform float uFlash;
      uniform float uPulse;
      varying vec3 vNormalW;
      varying vec3 vWorld;
      varying float vH;
      ${Ge}
      void main() {
        vec3 n = normalize(vNormalW);
        float t = clamp(vH / uHeight, 0.0, 1.0);
        float up = smoothstep(0.6, 0.9, abs(n.y));
        vec3 side = mix(uBase, uGlow, pow(t, 2.2) * (0.75 + 0.25 * uPulse));
        vec3 v = normalize(cameraPosition - vWorld);
        float rim = pow(1.0 - clamp(abs(dot(n, v)), 0.0, 1.0), 3.0);
        vec3 col = mix(side + uGlow * rim * 0.22, uTop, up);
        col = mix(col, vec3(0.4, 0.8, 0.76), uFlash);
        gl_FragColor = vec4(col, 1.0);
        ${pe}
      }
    `
    }),
    c = new _.Mesh(o, i);
  c.name = "maze-walls";
  let m = Jr(e, st + 0.004, Qr, Qr + Na),
    u = {
      value: L(H.line, 1.5)
    },
    a = Se({
      uniforms: {
        uColor: u,
        uFlash: r,
        uPulse: l
      },
      vertexShader: `
      ${He}
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
      fragmentShader: `
      uniform vec3 uColor;
      uniform float uFlash;
      uniform float uPulse;
      ${Ge}
      void main() {
        vec3 col = uColor * (1.0 + 0.12 * uPulse);
        col = mix(col, vec3(1.5, 2.3, 2.1), uFlash);
        gl_FragColor = vec4(col, 1.0);
        ${pe}
      }
    `
    }),
    E = new _.Mesh(m, a);
  E.name = "maze-lines";
  let f = Jr(e, 0.012, -Fa, 0, !0),
    b = Se({
      uniforms: {
        uColor: {
          value: L(H.wallGlow, 0.3)
        },
        uFlash: r
      },
      vertexShader: `
      attribute float fade;
      varying float vFade;
      ${He}
      void main() {
        vFade = fade;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
      fragmentShader: `
      uniform vec3 uColor;
      uniform float uFlash;
      varying float vFade;
      ${Ge}
      void main() {
        float a = vFade * vFade;
        vec3 col = mix(uColor, vec3(0.35, 0.7, 0.65), uFlash) * a;
        gl_FragColor = vec4(col, 1.0);
        ${pe}
      }
    `,
      transparent: !0,
      depthWrite: !1,
      blending: _.AdditiveBlending
    }),
    R = new _.Mesh(f, b);
  R.renderOrder = 1, R.name = "maze-spill";
  let g = 4 + 2 * qt,
    p = new _.BoxGeometry(g, 0.55, 0.22);
  p.translate(0, 0.275, 0);
  let n = new _.Mesh(p, new _.MeshBasicMaterial({
    visible: !1
  }));
  n.position.set(0, 0, ne(12)), n.name = "den-gate-collider";
  let T = new _.Mesh(new _.BoxGeometry(g, 0.12, 0.12), new _.MeshBasicMaterial({
    color: L(H.door, 2.6)
  }));
  T.position.set(0, 0.42, ne(12)), T.name = "den-gate";
  let w = new _.Mesh(new _.PlaneGeometry(12 + 2 * qt, 6 + 2 * qt), Wa());
  w.rotation.x = -Math.PI / 2, w.position.set(0, 0.01, ne(14)), w.renderOrder = 1;
  let v = Va(),
    y = new _.Group();
  y.name = "maze-mirror", y.scale.y = -1, y.add(new _.Mesh(o, i), new _.Mesh(m, a));
  let S = T.clone();
  return y.add(S), {
    walls: c,
    door: n,
    decor: [E, R, T, w, v],
    mirror: y,
    setFlash(G) {
      r.value = G;
    },
    setPulse(G) {
      l.value = G;
    }
  };
}
function Jr(e, t, o, r, l = !1) {
  let i = [],
    c = [],
    m = [],
    u = o < 0 ? 0 : 1;
  for (let E of e) {
    let f = E.points,
      b = f.length,
      R = i.length / 3;
    for (let g = 0; g < b; g++) {
      let p = f[(g + b - 1) % b],
        n = f[g],
        T = f[(g + 1) % b],
        w = n[0] - p[0],
        v = n[1] - p[1],
        y = T[0] - n[0],
        S = T[1] - n[1],
        G = Math.hypot(w, v) || 1,
        N = Math.hypot(y, S) || 1,
        V = -v / G,
        ue = w / G,
        A = -S / N,
        me = y / N,
        Y = V + A,
        ee = ue + me,
        fe = Math.hypot(Y, ee) || 1;
      Y /= fe, ee /= fe;
      let J = 1 / Math.max(0.35, Y * V + ee * ue);
      i.push(n[0] + Y * o * J, t, n[1] + ee * o * J), i.push(n[0] + Y * r * J, t, n[1] + ee * r * J), c.push(u, 1 - u);
    }
    for (let g = 0; g < b; g++) {
      let p = R + g * 2,
        n = R + (g + 1) % b * 2;
      m.push(p, p + 1, n, p + 1, n + 1, n);
    }
  }
  let a = new _.BufferGeometry();
  return a.setAttribute("position", new _.Float32BufferAttribute(i, 3)), l && a.setAttribute("fade", new _.Float32BufferAttribute(c, 1)), a.setIndex(m), a;
}
function Wa() {
  return Se({
    uniforms: {
      uColor: {
        value: L(H.door, 0.35)
      },
      uTime: ye.uTime
    },
    vertexShader: `
      varying vec2 vUv;
      ${He}
      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      varying vec2 vUv;
      ${Ge}
      void main() {
        vec2 g = abs(fract(vUv * vec2(13.0, 7.0)) - 0.5);
        float line = smoothstep(0.46, 0.5, max(g.x, g.y));
        float edge = smoothstep(0.35, 0.5, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
        float breathe = 0.6 + 0.4 * sin(uTime * 1.4);
        vec3 col = uColor * (line * 0.8 + edge * 0.5) * breathe;
        gl_FragColor = vec4(col, 1.0);
        ${pe}
      }
    `,
    transparent: !0,
    depthWrite: !1,
    blending: _.AdditiveBlending
  });
}
function Va() {
  let e = new _.Group();
  e.name = "tunnel-arches";
  let t = 12,
    o = 1.95,
    r = new _.MeshBasicMaterial({
      color: "#062a2e",
      transparent: !0,
      opacity: 0.55,
      side: _.DoubleSide,
      depthWrite: !1,
      fog: !0
    }),
    l = new _.MeshBasicMaterial({
      color: L(H.teal, 1.2),
      fog: !0
    }),
    i = new _.CylinderGeometry(o, o, t, 24, 1, !0, 0, Math.PI);
  i.rotateZ(Math.PI / 2);
  let c = new _.TorusGeometry(o + 0.02, 0.045, 6, 24, Math.PI);
  c.rotateY(Math.PI / 2);
  let m = new _.InstancedMesh(c, l, 14),
    u = new _.Matrix4(),
    a = 0,
    E = ne(Ie);
  for (let f of [-1, 1]) {
    let b = f < 0 ? be(2.5) : be(24.5),
      R = new _.Mesh(i, r);
    R.position.set(b, st, E), R.renderOrder = 3, e.add(R);
    for (let g = 0; g < 7; g++) u.makeTranslation(b - t / 2 + g * 2, st, E), m.setMatrixAt(a++, u);
  }
  return m.count = a, e.add(m), e;
}
import * as Q from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var Ya = 0.12,
  Ua = 0.36,
  Xa = 0.55,
  ja = 0.6;
function tn() {
  let e = [],
    t = [],
    o = new Int32Array(he.length * 2);
  he.forEach((n, T) => {
    let w = n.power ? t : e;
    o[T * 2] = n.power ? 1 : 0, o[T * 2 + 1] = w.length, w.push(T);
  });
  let r = new Q.MeshBasicMaterial({
      color: L(H.pellet, 1.7),
      fog: !0
    }),
    l = new Q.MeshBasicMaterial({
      color: L(H.power, 2.6),
      fog: !0,
      side: Q.DoubleSide
    }),
    i = new Q.InstancedMesh(new Q.IcosahedronGeometry(Ya, 1), r, e.length),
    c = new Q.InstancedMesh(Za(Ua), l, t.length);
  i.name = "glow-motes", c.name = "flares";
  for (let n of [i, c]) n.frustumCulled = !1, n.instanceMatrix.setUsage(Q.DynamicDrawUsage);
  let m = new Q.Matrix4(),
    u = new Q.Matrix4().makeScale(0, 0, 0),
    a = new Uint8Array(he.length),
    E = new Q.Matrix4(),
    f = (n, T = 1, w = 0) => {
      let v = he[n];
      if (!v) return;
      let y = v.power ? c : i,
        S = v.power ? ja : Xa;
      m.makeScale(T, T, T), w !== 0 && m.premultiply(E.makeRotationY(w)), m.setPosition(be(v.col), S, ne(v.row)), y.setMatrixAt(o[n * 2 + 1], m);
    },
    b = () => {
      a.fill(0);
      for (let n = 0; n < he.length; n++) f(n);
      i.instanceMatrix.needsUpdate = !0, c.instanceMatrix.needsUpdate = !0;
    };
  b();
  let R = L(H.pellet, 1.7),
    g = L(H.power, 2.6),
    p = -1;
  return {
    objects: [i, c],
    eat(n) {
      if (n < 0 || a[n]) return;
      a[n] = 1;
      let w = o[n * 2] === 1 ? c : i;
      w.setMatrixAt(o[n * 2 + 1], u), w.instanceMatrix.needsUpdate = !0;
    },
    reset: b,
    update(n) {
      let T = 0.5 + 0.5 * Math.sin(n * 7),
        w = Math.round(T * 12);
      if (w !== p) {
        p = w;
        let v = 0.82 + w / 12 * 0.3,
          y = n * 1.4;
        for (let S = 0; S < t.length; S++) {
          let G = t[S];
          a[G] || f(G, v, y + S);
        }
        c.instanceMatrix.needsUpdate = !0, l.color.copy(g).multiplyScalar(0.7 + w / 12 * 0.55);
      }
      r.color.copy(R).multiplyScalar(0.92 + 0.08 * Math.sin(n * 2.1));
    }
  };
}
function Za(e) {
  let t = e * 1.35,
    o = e * 0.32,
    r = [];
  for (let m = 0; m < 8; m++) {
    let u = m / 8 * Math.PI * 2,
      a = m % 2 === 0 ? t : o;
    r.push([Math.sin(u) * a, Math.cos(u) * a]);
  }
  let l = [],
    i = e * 0.45;
  for (let [m, u] of [[0, i], [0, -i], [1, i], [1, -i]]) for (let a = 0; a < 8; a++) {
    let [E, f] = r[a],
      [b, R] = r[(a + 1) % 8],
      g = (w, v, y) => m === 0 ? [w, v, y] : [y, v, w],
      p = g(0, 0, u),
      n = g(E, f, 0),
      T = g(b, R, 0);
    u > 0 ? l.push(...p, ...n, ...T) : l.push(...p, ...T, ...n);
  }
  let c = new Q.BufferGeometry();
  return c.setAttribute("position", new Q.Float32BufferAttribute(l, 3)), c.computeVertexNormals(), c;
}
import * as C from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
import { mergeGeometries as Je } from "./vendor/002-BufferGeometryUtils.js";
var ut = 0.62,
  zo = {
    y: 0.28,
    z: 0.02
  };
function on() {
  let e = Yt(H.podDeep, {
      core: 0.14,
      rim: 1.25
    }),
    t = new C.MeshBasicMaterial({
      color: L(H.pod, 2.2),
      fog: !0
    }),
    o = L(H.pod, 2.2),
    r = new C.MeshBasicMaterial({
      color: H.podEye,
      fog: !0
    }),
    l = new C.MeshBasicMaterial({
      color: L("#ffffff", 1.5),
      fog: !0
    }),
    i = new C.MeshBasicMaterial({
      color: L(H.pod, 2.6),
      fog: !0
    }),
    c = new C.MeshBasicMaterial({
      color: L(H.pod, 1.5),
      fog: !0
    }),
    m = new C.MeshBasicMaterial({
      color: L(H.wing, 0.75),
      transparent: !0,
      opacity: 0.5,
      depthWrite: !1,
      side: C.DoubleSide,
      blending: C.AdditiveBlending,
      fog: !0
    }),
    u = new C.SphereGeometry(ut, 32, 16);
  u.scale(1, 0.62, 1.12);
  let a = new C.SphereGeometry(0.3, 20, 12);
  a.translate(0, 0.02, ut * 1.12 + 0.12);
  let E = Je([u, a]),
    f = new C.SphereGeometry(0.44, 28, 16);
  f.scale(0.92, 0.82, 1.08), f.translate(0, -0.06, -ut * 1.12 - 0.22);
  let b = [];
  for (let [O, z] of [[-0.78, 0.39], [-1.02, 0.37]]) {
    let U = new C.TorusGeometry(z, 0.025, 6, 28);
    U.scale(1, 0.9, 1), U.translate(0, -0.06, O), b.push(U);
  }
  let R = Je(b),
    g = [],
    p = [],
    n = ut * 1.12 + 0.12;
  for (let O of [-1, 1]) {
    let z = new C.SphereGeometry(0.15, 14, 10);
    z.scale(0.9, 1.1, 0.8), z.translate(O * 0.2, 0.08, n + 0.16), g.push(z);
    let U = new C.SphereGeometry(0.045, 8, 6);
    U.translate(O * 0.2 + 0.04, 0.15, n + 0.28), p.push(U);
    for (let F = 0; F < 3; F++) {
      let $ = new C.CylinderGeometry(0.03, 0.02, 0.38, 5);
      $.translate(0, -0.19, 0), $.rotateZ(O * 0.55), $.translate(O * 0.34, -0.24, 0.36 - F * 0.34), g.push($);
    }
  }
  let T = Je(g),
    w = Je(p),
    v = [],
    y = [];
  for (let O of [-1, 1]) {
    let z = new C.CatmullRomCurve3([new C.Vector3(O * 0.1, 0.24, n + 0.05), new C.Vector3(O * 0.2, 0.52, n + 0.2), new C.Vector3(O * 0.34, 0.7, n + 0.18), new C.Vector3(O * 0.42, 0.74, n + 0.02)]);
    v.push(new C.TubeGeometry(z, 12, 0.022, 5, !1));
    let U = new C.SphereGeometry(0.07, 10, 8);
    U.translate(O * 0.42, 0.74, n + 0.02), y.push(U);
  }
  let S = Je(v),
    G = Je(y),
    N = (() => {
      let O = new C.CircleGeometry(0.5, 20);
      O.scale(1.15, 0.36, 1), O.rotateX(-Math.PI / 2), O.translate(0.52, 0, 0.06), O.rotateY(0.12);
      let z = new C.CircleGeometry(0.42, 18);
      return z.scale(1.05, 0.34, 1), z.rotateX(-Math.PI / 2), z.translate(0.44, -0.01, -0.1), z.rotateY(0.55), Je([O, z]);
    })(),
    V = new C.TorusGeometry(0.36, 0.035, 6, 30);
  V.rotateX(Math.PI / 2), V.translate(0, ut * 0.62 - 0.06, zo.z);
  let ue = O => {
      let z = new C.Group(),
        U = new C.Group();
      U.position.y = 0.76, z.add(U);
      let F = new C.Group();
      U.add(F), F.add(new C.Mesh(E, e));
      let $ = new C.Mesh(f, t);
      F.add($);
      let Ae = [];
      for (let Ee of [-1, 1]) {
        let ge = new C.Group();
        ge.position.set(Ee * 0.3, ut * 0.5, 0.05), ge.scale.x = Ee;
        let et = new C.Mesh(N, m);
        et.renderOrder = 3, ge.add(et), F.add(ge), Ae.push(ge);
      }
      return O && (F.add(new C.Mesh(R, r)), F.add(new C.Mesh(T, r)), F.add(new C.Mesh(w, l)), F.add(new C.Mesh(S, r)), F.add(new C.Mesh(G, i)), F.add(new C.Mesh(V, c))), {
        root: z,
        body: U,
        shell: F,
        lantern: $,
        wings: Ae
      };
    },
    A = ue(!0);
  A.root.name = "glow-pod";
  let me = new C.Object3D();
  me.name = "glow-pod-seat", me.position.set(0, zo.y, zo.z), A.body.add(me);
  let Y = ct(H.pod, 0.7, 2.1);
  A.root.add(Y);
  let ee = new C.Group();
  ee.scale.y = -1;
  let fe = ue(!1);
  ee.add(fe.root);
  let J = new C.Object3D();
  J.name = "glow-pod-camera";
  let te = (O, z, U) => {
    let F = Math.max(0, Math.min(1, U)),
      $ = Math.sin(z);
    O.wings.forEach((Ae, Ee) => {
      let ge = Ee === 0 ? -1 : 1;
      Ae.rotation.y = ge * (1 - F) * 1.2, Ae.rotation.z = ge * ((1 - F) * -0.06 + F * (0.18 + 0.42 * $));
    });
  };
  return {
    ...A,
    seat: me,
    cameraTarget: J,
    glow: Y,
    mirror: {
      ...fe,
      group: ee
    },
    pose(O, z, U) {
      te(A, O, z);
      let F = Math.max(0, U);
      t.color.copy(o).multiplyScalar(0.15 + 0.85 * F);
      let $ = 1 + Math.max(0, F - 1) * 0.12;
      A.lantern.scale.setScalar($), i.color.copy(o).multiplyScalar(1.1 * Math.min(1.2, F));
    },
    syncMirror() {
      let O = fe;
      O.root.position.copy(A.root.position), O.root.quaternion.copy(A.root.quaternion), O.root.visible = A.root.visible, O.body.position.copy(A.body.position), O.body.quaternion.copy(A.body.quaternion), O.body.scale.copy(A.body.scale), O.shell.scale.copy(A.shell.scale), O.lantern.scale.copy(A.lantern.scale);
      for (let z = 0; z < 2; z++) {
        let U = A.wings[z];
        O.wings[z].rotation.copy(U.rotation);
      }
    }
  };
}
import * as X from "./vendor/001-three-a973dc20bf0957e55145ef9e6b9c97d50275b224b1d81a57603249dd6750ab96.js";
var Qt = 420;
function rn() {
  let e = new X.Group();
  e.name = "sky";
  let t = new X.Mesh(new X.SphereGeometry(Qt, 32, 16), new X.ShaderMaterial({
    uniforms: {
      uTop: {
        value: new X.Color("#050f2c")
      },
      uMid: {
        value: new X.Color("#0b1640")
      },
      uHorizon: {
        value: new X.Color(H.night)
      },
      uGlow: {
        value: L(H.violet, 0.12)
      }
    },
    vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
    fragmentShader: `
        uniform vec3 uTop;
        uniform vec3 uMid;
        uniform vec3 uHorizon;
        uniform vec3 uGlow;
        varying vec3 vDir;
        void main() {
          float h = vDir.y;
          vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.25, h));
          col = mix(col, uTop, smoothstep(0.25, 0.9, h));
          col += uGlow * exp(-abs(h - 0.04) * 22.0);
          gl_FragColor = vec4(col, 1.0);
          ${pe.replace("#include <fog_fragment>", "")}
        }
      `,
    side: X.BackSide,
    depthWrite: !1
  }));
  t.renderOrder = -100, e.add(t);
  let o = ht(7331),
    r = 900,
    l = new Float32Array(r * 3),
    i = new Float32Array(r * 3),
    c = new Float32Array(r),
    m = ["#ffffff", "#ffffff", "#ffffff", "#d4ff3a", "#5ff7e4", "#a45cff", "#ffc933"],
    u = new X.Color();
  for (let f = 0; f < r; f++) {
    let b = o() * Math.PI * 2,
      R = 0.06 + o() * 0.94,
      g = Math.sqrt(1 - R * R);
    l.set([Math.cos(b) * g * (Qt - 20), R * (Qt - 20), Math.sin(b) * g * (Qt - 20)], f * 3), u.set(m[Math.floor(o() * m.length)]).multiplyScalar(0.6 + o() * 1.4), i.set([u.r, u.g, u.b], f * 3), c[f] = o() * 10;
  }
  let a = new X.BufferGeometry();
  a.setAttribute("position", new X.BufferAttribute(l, 3)), a.setAttribute("color", new X.BufferAttribute(i, 3)), a.setAttribute("phase", new X.BufferAttribute(c, 1));
  let E = new X.Points(a, new X.ShaderMaterial({
    uniforms: {
      uTime: ye.uTime
    },
    vertexShader: `
        attribute vec3 color;
        attribute float phase;
        uniform float uTime;
        varying vec3 vColor;
        void main() {
          float twinkle = 0.55 + 0.45 * sin(uTime * (1.3 + fract(phase) * 2.0) + phase * 6.2831);
          vColor = color * twinkle;
          gl_PointSize = 2.0 + step(0.8, fract(phase * 3.7)) * 1.5;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
    fragmentShader: `
        varying vec3 vColor;
        void main() {
          gl_FragColor = vec4(vColor, 1.0);
          ${pe.replace("#include <fog_fragment>", "")}
        }
      `,
    depthWrite: !1
  }));
  return E.renderOrder = -99, E.frustumCulled = !1, e.add(E), {
    objects: [e],
    follow(f) {
      e.position.copy(f);
    }
  };
}
var W = Uo({
  name: "Glow Maze",
  accent: H.pod,
  avatar: {
    style: "neon",
    color: H.pod,
    accent: H.teal
  },
  physics: {
    gravity: 26,
    jumpSpeed: 9.5,
    runSpeed: 7,
    doubleJump: !1,
    airControl: 0.6
  },
  camera: {
    distance: 8.5,
    height: 1.2,
    pitch: 0.56,
    fov: 60,
    zoom: [3, 15]
  },
  render: {
    background: new Oe.Color(H.night),
    fog: new Oe.FogExp2(H.night, Jo),
    exposure: 1,
    maxPixelRatio: 1.5,
    bloom: er
  },
  spawn: nr,
  killY: lr,
  controls: [{
    keys: ["W", "A", "S", "D"],
    label: "Glow-Pod: steer (or the arrows)",
    pad: ["dpad", "ls"]
  }, {
    keys: ["Scroll"],
    label: "Glow-Pod: see more of the maze",
    pad: null
  }, {
    keys: ["F"],
    label: "Glow-Pod: call, play or leave"
  }]
});
W.addDecor(new Oe.HemisphereLight("#4a4cff", "#07030f", 0.9));
var nn = new Oe.DirectionalLight("#fff4e0", 0.9);
nn.position.set(-12, 30, 40);
W.addDecor(nn);
var an = rn();
for (let e of an.objects) W.addDecor(e);
var sn = kr();
for (let e of sn.statics) W.addStatic(e);
for (let e of sn.decor) W.addDecor(e);
var xt = en();
W.addStatic(xt.walls);
W.addStatic(xt.door);
for (let e of xt.decor) W.addDecor(e);
W.addDecor(xt.mirror);
var ln = tn();
for (let e of ln.objects) W.addDecor(e);
var Jt = Kr(0);
for (let e of Jt.statics) W.addStatic(e);
for (let e of Jt.decor) W.addDecor(e);
var cn = Br();
for (let e of cn.objects) W.addDecor(e);
var un = Ir();
W.addDecor(un.mesh);
var eo = on();
W.addDecor(eo.root);
W.addDecor(eo.mirror.group);
W.addDecor(eo.cameraTarget);
var to = new Oe.Group();
to.name = "gloomy-mirror";
to.scale.y = -1;
W.addDecor(to);
var $a = cr.map(e => {
  let t = Ur(e),
    o = t.create(!0),
    r = t.create(!1);
  return o.root.name = `gloomy-${e}`, W.addDecor(o.root), to.add(r.root), {
    name: e,
    kit: t,
    view: o,
    mirror: r
  };
});
for (let e of ar) W.placePortal({
  id: e.id,
  to: e.to,
  position: e.position,
  yaw: e.yaw
});
var mn = _r({
  world: W,
  pod: eo,
  gloomies: $a,
  pellets: ln,
  maze: xt,
  bonus: cn,
  lobby: Jt,
  beacon: un,
  sound: Or(W)
});
Jt.setHighScore(W.records.get("highScore") ?? 0);
W.scene.userData.glowMaze = mn.debug;
W.onUpdate((e, t) => {
  ye.uTime.value = t, an.follow(W.camera.position), mn.update(e, t);
});
W.start();