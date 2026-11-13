import { createGame as hl, landscapeRig as fl, createTweens as bl, createHitStop as El, shakeRig as yl, applyLighting as gl } from "./vendor/006-three.js";
import * as xe from "./vendor/002-three.js";
var b = {
  field: {
    spawnMargin: 60,
    cullMargin: 160
  },
  player: {
    speed: 780,
    radius: 26,
    hull: 3,
    iframes: 1.6,
    startY: -250,
    fire: [0.22, 0.18, 0.16, 0.14, 0.12]
  },
  weapons: {
    maxLevel: 9,
    boltSpeed: 900,
    boltDmg: 1,
    missileDmg: 3,
    missileEvery: 0.55
  },
  blastCharge: {
    duration: 7,
    chargePerShard: 0.2,
    chargePerKill: 0.012,
    scoreMult: 2
  },
  bombs: {
    start: 2,
    max: 4,
    damage: 12,
    radius: 2e3
  },
  chain: {
    window: 2.6,
    milestones: [10, 25, 50, 100]
  },
  enemies: {
    interceptor: {
      hp: 2,
      speed: 240,
      radius: 24,
      score: 100,
      fire: 2.4
    },
    drone: {
      hp: 1,
      speed: 170,
      radius: 15,
      score: 50,
      fire: 0
    },
    bomber: {
      hp: 14,
      speed: 70,
      radius: 46,
      score: 400,
      fire: 3.2
    },
    elite: {
      hp: 26,
      speed: 110,
      radius: 50,
      score: 900,
      fire: 1.7
    }
  },
  enemyBoltSpeed: 260,
  difficulty: {
    rampSeconds: 80,
    maxMult: 2.6
  },
  spawn: {
    firstWaveAt: 2.5,
    baseInterval: 5.2,
    minInterval: 2.2
  },
  interlude: {
    at: 95,
    duration: 26
  },
  capital: {
    x: 120,
    turretHp: 8,
    turretRadius: 30,
    turretScore: 650,
    turretFire: 1.45,
    turretSpeed: 270,
    turrets: [[-120, 610], [130, 520], [-265, 430], [258, 240], [-225, 60], [230, -120], [-260, -260], [260, -480], [0, 810]]
  },
  boss: {
    arriveAt: 150,
    segments: 6,
    segmentHp: 26,
    headHp: 110,
    topY: 190
  },
  finale: {
    nodes: [[-234, 186], [234, 186], [-141, 18], [141, 18], [0, -102]],
    nodeHp: 10,
    nodeRadius: 30,
    nodeScore: 2e3,
    headHp: 30,
    bombDamage: 4,
    time: 40,
    shotRadius: 34,
    shipSpeed: 640,
    hazardEvery: 2.4,
    burstCount: 10,
    burstGap: 0.09,
    spiralRadius: 230,
    hazardTravel: 0.85,
    boltTravel: 0.6,
    hazardRadius: 52,
    introDuration: 1.6,
    outroDuration: 1.5,
    recoverFrac: 0.6
  },
  pickups: {
    dropChance: 0.16,
    guaranteedBy: 9,
    fallSpeed: 90,
    magnetRadius: 120,
    magnetSpeed: 420,
    lifetime: 11
  },
  warp: {
    duration: 2.8,
    peakMult: 7
  },
  tiers: 4
};
function Ee(e) {
  return e.nextId++;
}
function z(e, t) {
  e.events.push(t);
}
function ke(e) {
  return Math.min(1 + e.time / b.difficulty.rampSeconds, b.difficulty.maxMult) + e.tier * 0.35;
}
function Qe(e = {}) {
  let t = {
      status: "running",
      gameOverSent: !1,
      pointerDrag: null,
      time: 0,
      tier: 0,
      score: 0,
      chain: 0,
      chainTimer: 0,
      bestChain: 0,
      weaponLevel: 1,
      bombs: b.bombs.start,
      blastCharge: {
        charge: 0,
        active: !1,
        timer: 0
      },
      player: {
        x: 0,
        y: b.player.startY,
        hp: b.player.hull,
        invuln: 0,
        fireCd: 0,
        missileCd: 0,
        alive: !0,
        bank: 0,
        deadFor: 0
      },
      enemies: [],
      playerBolts: [],
      enemyBolts: [],
      pickups: [],
      capitalTurrets: [],
      boss: null,
      spawn: {
        nextWaveAt: b.spawn.firstWaveAt,
        waveIndex: 0,
        pityMisses: 0
      },
      env: {
        scroll: 0,
        capitalShipOn: !1,
        capitalShipT: 0,
        capitalShipAnnounced: !1,
        warpT: 0
      },
      events: [],
      nextId: 1
    },
    n = {
      ...t,
      ...e
    };
  return n.player = {
    ...t.player,
    ...(e.player ?? {})
  }, n.blastCharge = {
    ...t.blastCharge,
    ...(e.blastCharge ?? {})
  }, n.spawn = {
    ...t.spawn,
    ...(e.spawn ?? {})
  }, n.env = {
    ...t.env,
    ...(e.env ?? {})
  }, n;
}
function Bt(e = {}, t = 0) {
  let n = 1 + t * 0.25,
    o = Math.ceil(b.finale.headHp * n);
  return {
    nodes: b.finale.nodes.map(([r, a]) => ({
      x: r,
      y: a,
      hp: Math.ceil(b.finale.nodeHp * n),
      alive: !0
    })),
    shieldDown: !1,
    headHp: o,
    headMaxHp: o,
    shipX: 0,
    shipY: 0,
    fireCd: 0.4,
    hazardCd: 1.8,
    volley: 0,
    burstLeft: 0,
    burstCd: 0,
    burstX: 0,
    burstY: 0,
    hazards: [],
    timeLeft: b.finale.time,
    outroT: 0,
    ...e
  };
}
function lt(e = {}, t = 0) {
  let n = 1 + t * 0.3,
    o = Math.ceil(b.boss.segmentHp * n),
    r = Math.ceil(b.boss.headHp * n),
    a = [];
  for (let s = 0; s < b.boss.segments; s++) a.push({
    hp: o,
    x: 0,
    y: b.boss.topY + 40 + s * 26,
    alive: !0
  });
  return {
    phase: "entering",
    t: 0,
    headHp: r,
    headMaxHp: r,
    segmentMaxHp: o,
    segments: a,
    x: 0,
    y: 420,
    patternT: 0,
    hurtFlash: 0,
    finale: Bt({}, t),
    ...e
  };
}
import * as Eo from "./vendor/002-three.js";
var mn = new Eo.Vector3(),
  Dt = new Eo.Vector3();
function he(e) {
  let t = e.game.camera;
  mn.set(1, 1, 0.5).unproject(t), Dt.copy(mn).sub(t.position);
  let n = -t.position.z / Dt.z;
  return {
    halfW: Math.abs(t.position.x + Dt.x * n),
    halfH: Math.abs(t.position.y + Dt.y * n)
  };
}
import * as te from "./vendor/002-three.js";
var p = {
    void: 329229,
    charcoal: 1316383,
    navy: 857638,
    dusk: 2234931,
    metal: 2764088,
    metalLight: 4343383,
    bone: 9409445,
    ink: 131848,
    cyan: 3401471,
    acid: 10354483,
    magenta: 16723926,
    molten: 16742938,
    crimson: 14163772,
    gold: 16763196
  },
  zt = [{
    primary: 3401471,
    secondary: 16763196,
    haze: 857638
  }, {
    primary: 16723926,
    secondary: 3530952,
    haze: 2234931
  }, {
    primary: 14163772,
    secondary: 16742938,
    haze: 1444364
  }, {
    primary: 3137674,
    secondary: 16763196,
    haze: 1053720
  }];
function ht(e) {
  return zt[(e % zt.length + zt.length) % zt.length];
}
var dt = null;
function Ft() {
  if (!dt) {
    let e = new Uint8Array([40, 40, 48, 255, 150, 150, 158, 255, 255, 255, 255, 255]);
    dt = new te.DataTexture(e, 3, 1, te.RGBAFormat), dt.minFilter = te.NearestFilter, dt.magFilter = te.NearestFilter, dt.needsUpdate = !0;
  }
  return dt;
}
var dn = new Map();
function G(e) {
  let t = dn.get(e);
  return t || (t = new te.MeshToonMaterial({
    color: e,
    gradientMap: Ft()
  }), dn.set(e, t)), t;
}
var hn = new Map();
function C(e, t = 1) {
  let n = `${e}:${t}`,
    o = hn.get(n);
  return o || (o = new te.MeshBasicMaterial({
    color: e,
    transparent: t < 1,
    opacity: t
  }), hn.set(n, o)), o;
}
var yo = null;
function br() {
  return yo || (yo = new te.MeshBasicMaterial({
    color: p.ink,
    side: te.BackSide
  })), yo;
}
function Ze(e, t = 0.08) {
  let n = new te.Mesh(e.geometry, br());
  return n.scale.setScalar(1 + t), n.raycast = () => {}, n.userData.noOutline = !0, n.userData.outlined = !0, e.add(n), n;
}
function ne(e, t = 0.08) {
  e.traverse(n => {
    n instanceof te.Mesh && !n.userData.noOutline && !n.userData.outlined && (n.userData.outlined = !0, Ze(n, t));
  });
}
function v(e) {
  return e.userData.noOutline = !0, e;
}
function Te(e, t, n) {
  let o = document.createElement("canvas");
  o.width = e, o.height = t;
  let r = o.getContext("2d");
  n(r, e, t);
  let a = new te.CanvasTexture(o);
  return a.colorSpace = te.SRGBColorSpace, a.anisotropy = 2, a;
}
var go = null;
function Be() {
  return go || (go = Te(128, 128, (e, t, n) => {
    let o = e.createRadialGradient(t / 2, n / 2, 4, t / 2, n / 2, t / 2);
    o.addColorStop(0, "rgba(255,255,255,1)"), o.addColorStop(0.35, "rgba(255,255,255,0.55)"), o.addColorStop(1, "rgba(255,255,255,0)"), e.fillStyle = o, e.fillRect(0, 0, t, n);
  })), go;
}
function D(e, t = 1) {
  let n = le(),
    o = new te.MeshBasicMaterial({
      map: Be(),
      color: e,
      transparent: !0,
      blending: te.AdditiveBlending,
      depthWrite: !1
    }),
    r = new te.Mesh(n, o);
  return r.scale.setScalar(t), v(r);
}
var To = null;
function le() {
  return To || (To = new te.PlaneGeometry(1, 1)), To;
}
var Er = -0.52;
function we(e) {
  let t = new te.Group();
  return e.rotation.x = Er, t.add(e), t;
}
import * as ee from "./vendor/002-three.js";
var q = new ee.BoxGeometry(1, 1, 1),
  fn = new ee.ConeGeometry(0.5, 1, 8),
  Le = new ee.CylinderGeometry(0.5, 0.5, 1, 8),
  yr = new ee.TetrahedronGeometry(1),
  bn = new ee.OctahedronGeometry(1),
  Vt = new ee.ConeGeometry(0.5, 1, 8);
Vt.rotateZ(Math.PI);
Vt.translate(0, -0.5, 0);
function F(e, t, n, o, r, a, s, i, l, c = 0, u = 0) {
  let m = new ee.Mesh(t, n);
  return m.position.set(o, r, a), m.scale.set(s, i, l), m.rotation.set(u, 0, c), e.add(m), m;
}
function Nt() {
  let e = [G(p.metal).clone(), G(p.metalLight).clone(), G(p.charcoal).clone(), G(p.navy).clone(), G(p.dusk).clone()],
    [t, n, o, r, a] = e,
    s = e.map($ => $.color.getHex()),
    i = new ee.MeshBasicMaterial({
      color: p.cyan
    }),
    l = new ee.MeshBasicMaterial({
      color: p.cyan,
      transparent: !0,
      opacity: 0.85,
      blending: ee.AdditiveBlending,
      depthWrite: !1
    }),
    c = new ee.Group();
  F(c, q, t, 0, 0, 0, 15, 42, 10), F(c, q, n, 0, 7, -3, 18, 24, 6), F(c, fn, n, 0, 29, 0, 11, 18, 7), F(c, q, a, 0, 20, -3.5, 8, 12, 5), v(F(c, q, C(p.cyan), 0, 9, 6.2, 5, 11, 3.5)), F(c, q, a, -4.5, -5, 5.4, 5, 15, 1.4), F(c, q, o, 5, -10, 5.4, 4, 9, 1.4), F(c, q, o, 0, 21, 3.6, 4, 6, 1.2), F(c, q, o, 0, -3, 5.8, 7.5, 8, 2), v(F(c, bn, C(p.gold), 0, -3, 7, 3, 4, 2));
  let u = D(p.gold, 15);
  u.position.set(0, -3, 8.2), c.add(u), F(c, q, r, -19, -8, 0, 26, 13, 3, 0.42), F(c, q, r, 19, -8, 0, 26, 13, 3, -0.42), F(c, q, o, -16, -9, 1.9, 11, 5, 1.5, 0.42), F(c, q, o, 16, -9, 1.9, 11, 5, 1.5, -0.42), F(c, q, o, -29, -13, 2.5, 3, 8, 7, 0.3), F(c, q, o, 29, -13, 2.5, 3, 8, 7, -0.3), v(F(c, q, i, -17, -6.5, 2.2, 19, 1.8, 1, 0.42)), v(F(c, q, i, 17, -6.5, 2.2, 19, 1.8, 1, -0.42)), v(F(c, q, i, 0, -12, 5.6, 2, 10, 1));
  for (let $ of [-1, 1]) F(c, Le, n, $ * 26.5, -6, 4.5, 1.3, 15, 1.3), v(F(c, bn, C(p.magenta), $ * 26.5, 2.5, 4.5, 1.9, 1.9, 1.9));
  F(c, Le, n, -7.5, -24, 0, 7, 9, 7), F(c, Le, n, 7.5, -24, 0, 7, 9, 7), F(c, Le, o, -7.5, -28.5, 0, 8, 2.5, 8), F(c, Le, o, 7.5, -28.5, 0, 8, 2.5, 8);
  let m = v(F(c, Vt, l, -7.5, -29, 0, 5.5, 18, 5.5)),
    h = v(F(c, Vt, l, 7.5, -29, 0, 5.5, 18, 5.5)),
    E = D(p.cyan, 18),
    d = D(p.cyan, 18);
  E.position.set(-7.5, -30, 3), d.position.set(7.5, -30, 3), c.add(E, d);
  let w = [E.material, d.material],
    f = new ee.Group();
  F(f, Le, n, -3.5, 30, 2, 1.6, 12, 1.6), F(f, Le, n, 3.5, 30, 2, 1.6, 12, 1.6);
  let M = new ee.Group();
  F(M, Le, n, -4.5, 31, 2, 2.7, 16, 2.7), F(M, Le, n, 4.5, 31, 2, 2.7, 16, 2.7), v(F(M, q, C(p.acid), -4.5, 39, 2, 2, 2, 2)), v(F(M, q, C(p.acid), 4.5, 39, 2, 2, 2, 2)), M.visible = !1, c.add(f, M);
  let x = new ee.Group();
  F(x, q, o, -10.5, 6, 2, 4, 12, 4), F(x, q, o, 10.5, 6, 2, 4, 12, 4), F(x, Le, n, -10.5, 15, 2, 1.4, 10, 1.4), F(x, Le, n, 10.5, 15, 2, 1.4, 10, 1.4), x.visible = !1, c.add(x);
  let T = $ => {
      let J = new ee.Group();
      return J.position.set(28 * $, -14, 3), F(J, q, a, 0, 1, 0, 4.5, 9, 4.5), v(F(J, fn, C(p.cyan), 0, 7, 0, 2.2, 4, 2.2)), J.rotation.z = 1.35 * $, J.visible = !1, c.add(J), J;
    },
    y = T(-1),
    R = T(1),
    S = new ee.Group();
  F(S, q, r, -38, -14, 0.5, 15, 6, 2, 0.42), F(S, q, r, 38, -14, 0.5, 15, 6, 2, -0.42), v(F(S, q, i, -42, -16, 1.6, 9, 1.4, 1, 0.42)), v(F(S, q, i, 42, -16, 1.6, 9, 1.4, 1, -0.42)), c.add(S);
  let H = new ee.Group();
  F(H, q, o, -9, -19, 6, 1.6, 9, 8), F(H, q, o, 9, -19, 6, 1.6, 9, 8), v(F(H, q, i, -9, -21, 9.5, 1, 4, 1.2)), v(F(H, q, i, 9, -21, 9.5, 1, 4, 1.2)), c.add(H);
  let g = new ee.Group();
  F(g, Le, n, 0, 14, 6.5, 2.4, 20, 2.4), F(g, q, o, 0, 4, 6.5, 5, 7, 4), v(F(g, q, C(p.acid), 0, 25, 6.5, 2, 2.4, 2)), c.add(g), S.visible = H.visible = g.visible = !1;
  let k = new ee.Group();
  k.add(c), ne(c);
  let X = we(k),
    Z = $ => {
      let J = new ee.Group();
      J.position.set(46 * $, -2, 6);
      let De = v(new ee.Mesh(yr, C(p.cyan)));
      De.scale.setScalar(5);
      let mt = D(p.cyan, 13);
      return J.add(De, mt), J.visible = !1, X.add(J), J;
    },
    O = Z(-1),
    se = Z(1),
    ie = D(p.gold, 110);
  ie.position.set(0, -28, -6), ie.visible = !1, X.add(ie);
  let de = ie.material,
    A = 1,
    ge = !1,
    it = 0.65,
    Ce = 0,
    pt = 0,
    ut = 0,
    Gt = 0,
    Ct = 0,
    P = 0,
    I = 0,
    Y = Math.random() * 10,
    Re = () => {
      l.color.setHex(ge ? 16771488 : p.cyan);
      for (let $ of w) $.color.setHex(ge ? p.gold : p.cyan);
      i.color.setHex(ge ? 16774089 : A >= 9 ? p.gold : A >= 5 ? p.acid : p.cyan);
    },
    be = ($, J) => {
      $.visible = J > 0.03, $.scale.setScalar(Math.max(0.001, J));
    };
  return {
    group: X,
    update($) {
      Y += $;
      let J = Math.sin(Y * 13) * 0.5 + Math.sin(Y * 31) * 0.2,
        De = 9 + it * 17 + J * 3;
      m.scale.set(5.5 - J * 0.6, De, 5.5 - J * 0.6), h.scale.set(5.5 + J * 0.6, De * (1 + J * 0.06), 5.5 + J * 0.6), l.opacity = Math.min(1, 0.7 + it * 0.2 + J * 0.15);
      let mt = 14 + it * 9 + J * 3.5;
      E.scale.setScalar(mt), d.scale.setScalar(mt), u.scale.setScalar(14 + Math.sin(Y * 5) * 3), pt += (Ce - pt) * Math.min(1, $ * 10), c.rotation.y = pt * 0.55, ut += ((A >= 3 ? 1 : 0) - ut) * Math.min(1, $ * 6), y.rotation.z = -(1 - ut) * 1.35, R.rotation.z = (1 - ut) * 1.35, Gt += ((A >= 6 ? 1 : 0) - Gt) * Math.min(1, $ * 5), Ct += ((A >= 7 ? 1 : 0) - Ct) * Math.min(1, $ * 5), P += ((A >= 8 ? 1 : 0) - P) * Math.min(1, $ * 5), be(S, Gt), be(H, Ct), be(g, P), O.position.y = -2 + Math.sin(Y * 3.1) * 5, se.position.y = -2 + Math.sin(Y * 3.1 + 2.4) * 5, O.rotation.y += $ * 2.6, se.rotation.y -= $ * 2.6, ge && (ie.scale.setScalar(100 + Math.sin(Y * 9) * 16), de.opacity = 0.55 + Math.sin(Y * 9) * 0.2), I > 0 && (I -= $, I <= 0 && e.forEach((bo, fr) => bo.color.setHex(s[fr])));
    },
    setWeaponLevel($) {
      A = Math.max(1, Math.min(9, Math.round($))), x.visible = A >= 2, y.visible = R.visible = A >= 3, O.visible = se.visible = A >= 4, M.visible = A >= 5, f.visible = A < 5, Re();
    },
    setBlastCharge($) {
      ge = $, ie.visible = $, Re();
    },
    setBank($) {
      Ce = Math.max(-1, Math.min(1, $));
    },
    setThrust($) {
      it = Math.max(0, Math.min(1, $));
    },
    flashHit() {
      I = 0.1;
      for (let $ of e) $.color.setHex(16777215);
    }
  };
}
function En(e) {
  let t = o => {
      let r = o.key.toLowerCase();
      (r === " " || r.startsWith("arrow")) && o.preventDefault(), o.repeat || e.pressed.add(r), e.keys.add(r);
    },
    n = o => {
      e.keys.delete(o.key.toLowerCase());
    };
  return window.addEventListener("keydown", t), window.addEventListener("keyup", n), () => {
    window.removeEventListener("keydown", t), window.removeEventListener("keyup", n);
  };
}
function _t(e, t, n) {
  if (!t.held) return e.pointerDrag = null, null;
  let o = e.pointerDrag,
    r = o?.surface === n ? {
      x: t.x - o.x,
      y: t.y - o.y
    } : {
      x: 0,
      y: 0
    };
  return e.pointerDrag = {
    x: t.x,
    y: t.y,
    surface: n
  }, r;
}
function At(e, t, n) {
  let o = e.player;
  o.invuln > 0 && (o.invuln = Math.max(0, o.invuln - n)), o.alive || (o.deadFor += n);
  let r = 0,
    a = 0,
    s = t.keys;
  (s.has("a") || s.has("arrowleft")) && (r -= 1), (s.has("d") || s.has("arrowright")) && (r += 1), (s.has("w") || s.has("arrowup")) && (a += 1), (s.has("s") || s.has("arrowdown")) && (a -= 1);
  let i = !1,
    l = _t(e, t.pointer, "flight");
  if (l && o.alive) {
    o.x += l.x, o.y += l.y;
    let d = Math.hypot(l.x, l.y);
    r = d > 0 ? l.x / d : 0, a = d > 0 ? l.y / d : 0, i = d > 0.5;
  } else {
    let d = Math.hypot(r, a);
    d > 1e-4 && o.alive && (r /= d, a /= d, o.x += r * b.player.speed * n, o.y += a * b.player.speed * n, i = !0);
  }
  let c = he(t),
    u = b.player.radius + 10;
  o.x = Math.min(c.halfW - u, Math.max(-c.halfW + u, o.x)), o.y = Math.min(c.halfH - u, Math.max(-c.halfH + u, o.y));
  let m = i ? Math.max(-1, Math.min(1, r)) : 0;
  o.bank += (m - o.bank) * Math.min(1, n * 13);
  let h = t.playerShip;
  h.setBank(o.bank), h.setThrust(e.env.warpT > 0 || i ? 1 : 0.55), h.setWeaponLevel(e.weaponLevel), h.setBlastCharge(e.blastCharge.active), h.group.position.set(o.x, o.y, 0);
  let E = o.invuln > 0 && Math.floor(e.time * 12) % 2 === 1;
  h.group.visible = o.alive && !E, h.update?.(n);
}
var We = b.weapons.boltSpeed,
  gr = 900,
  Tr = 700,
  Mr = 6,
  gn = -1,
  Tn = -2,
  Mn = -3;
function Xt(e, t, n) {
  let o = e.player;
  if (e.status === "running" && o.alive) {
    if (o.fireCd -= n, o.fireCd <= 0) {
      let r = Math.min(Math.max(e.weaponLevel, 1), b.player.fire.length) - 1,
        a = b.player.fire[r] ?? 0.22;
      o.fireCd = e.blastCharge.active ? a * 0.6 : a, vr(e);
    }
    e.weaponLevel >= 4 && (o.missileCd -= n, o.missileCd <= 0 && (o.missileCd = b.weapons.missileEvery, xr(e)));
  }
  wr(e, t, n);
}
function ze(e, t, n, o, r, a, s, i, l = gn) {
  e.playerBolts.push({
    id: Ee(e),
    x: t,
    y: n,
    vx: Math.sin(o) * i,
    vy: Math.cos(o) * i,
    radius: s,
    dmg: a,
    kind: r,
    targetId: l,
    t: 0
  });
}
function vr(e) {
  let t = e.player,
    n = e.weaponLevel,
    o = e.blastCharge.active,
    r = o ? 1 : 0,
    a = b.weapons.boltDmg + r,
    s = t.y + 34;
  if (n <= 1 ? ze(e, t.x, s, 0, "plasma", a, 8, We) : (ze(e, t.x - 14, s, 0, "plasma", a, 8, We), ze(e, t.x + 14, s, 0, "plasma", a, 8, We)), n >= 5 && (ze(e, t.x - 30, s - 6, 0, "plasma", a, 8, We), ze(e, t.x + 30, s - 6, 0, "plasma", a, 8, We)), n >= 3 && (ze(e, t.x - 22, s - 8, -0.16, "heavy", 2 + r, 10, We), ze(e, t.x + 22, s - 8, 0.16, "heavy", 2 + r, 10, We)), o) {
    let i = Math.max(0, n - 5);
    ze(e, t.x, s + 40, 0, "beam", 5 + n + i * 2, 26 + i * 6, 1250), ze(e, t.x - 18, s - 10, -0.3, "plasma", a, 8, We), ze(e, t.x + 18, s - 10, 0.3, "plasma", a, 8, We);
  }
  z(e, {
    type: "shot",
    x: t.x,
    y: s
  });
}
function xr(e) {
  let t = e.player,
    n = b.weapons.missileDmg + (e.blastCharge.active ? 1 : 0);
  ze(e, t.x, t.y + 20, 0, "missile", n, 8, 520, vn(e, t.x, t.y));
}
function vn(e, t, n) {
  let o = gn,
    r = 1 / 0;
  for (let s of e.enemies) {
    if (s.hp <= 0) continue;
    let i = (s.x - t) * (s.x - t) + (s.y - n) * (s.y - n);
    i < r && (r = i, o = s.id);
  }
  for (let s of e.capitalTurrets) {
    if (!s.alive || s.hp <= 0) continue;
    let i = (s.x - t) * (s.x - t) + (s.y - n) * (s.y - n);
    i < r && (r = i, o = s.id);
  }
  let a = e.boss;
  if (a && (a.phase === "entering" || a.phase === "active")) {
    if (a.headHp > 0) {
      let s = (a.x - t) * (a.x - t) + (a.y - n) * (a.y - n);
      s < r && (r = s, o = Tn);
    }
    for (let s of a.segments) {
      if (!s.alive) continue;
      let i = (s.x - t) * (s.x - t) + (s.y - n) * (s.y - n);
      i < r && (r = i, o = Mn);
    }
  }
  return o;
}
var Xe = {
  x: 0,
  y: 0
};
function yn(e, t) {
  let n = e.boss,
    o = !!n && (n.phase === "entering" || n.phase === "active");
  if (t.targetId === Tn) return n && o && n.headHp > 0 ? (Xe.x = n.x, Xe.y = n.y, !0) : !1;
  if (t.targetId === Mn) {
    if (!n || !o) return !1;
    let r = 1 / 0,
      a = !1;
    for (let s of n.segments) {
      if (!s.alive) continue;
      let i = (s.x - t.x) * (s.x - t.x) + (s.y - t.y) * (s.y - t.y);
      i < r && (r = i, Xe.x = s.x, Xe.y = s.y, a = !0);
    }
    return a;
  }
  if (t.targetId >= 0) {
    for (let r of e.enemies) if (r.id === t.targetId && r.hp > 0) return Xe.x = r.x, Xe.y = r.y, !0;
    for (let r of e.capitalTurrets) if (r.id === t.targetId && r.alive && r.hp > 0) return Xe.x = r.x, Xe.y = r.y, !0;
  }
  return !1;
}
function Rr(e, t, n) {
  let o = yn(e, t);
  o || (t.targetId = vn(e, t.x, t.y), o = yn(e, t));
  let r = Math.min(gr, Math.hypot(t.vx, t.vy) + Tr * n),
    a = Math.atan2(t.vx, t.vy);
  if (o) {
    let s = Math.atan2(Xe.x - t.x, Xe.y - t.y) - a;
    for (; s > Math.PI;) s -= Math.PI * 2;
    for (; s < -Math.PI;) s += Math.PI * 2;
    let i = Mr * n;
    a += Math.min(i, Math.max(-i, s));
  }
  t.vx = Math.sin(a) * r, t.vy = Math.cos(a) * r;
}
function wr(e, t, n) {
  let o = he(t),
    r = o.halfW + b.field.cullMargin,
    a = o.halfH + b.field.cullMargin,
    s = e.playerBolts;
  for (let i = s.length - 1; i >= 0; i--) {
    let l = s[i];
    if (l && (l.t += n, l.kind === "missile" && Rr(e, l, n), l.x += l.vx * n, l.y += l.vy * n, Math.abs(l.x) > r || Math.abs(l.y) > a)) {
      let c = s[s.length - 1];
      c && (s[i] = c), s.pop();
    }
  }
}
function $t(e, t) {
  return e < -t ? -t : e > t ? t : e;
}
function Ye(e, t, n, o, r = Math.floor(Math.random() * 2)) {
  let a = b.enemies[t],
    s = Math.random(),
    i = Math.ceil(a.hp * (1 + 0.25 * (ke(e) - 1))),
    l = {
      id: Ee(e),
      kind: t,
      x: n,
      y: o,
      vx: 0,
      vy: -a.speed,
      hp: i,
      maxHp: i,
      radius: a.radius,
      t: 0,
      fireCd: 0.8 + s,
      pattern: r,
      seed: s,
      baseX: n
    };
  return e.enemies.push(l), l;
}
function Yt(e, t, n) {
  let o = 3 + Math.floor(Math.random() * 3),
    r = Math.random() < 0.5 ? -1 : 1,
    a = r * (t - 40);
  for (let s = 0; s < o; s++) {
    let i = $t(a - r * s * 60, t),
      l = s === 0 || Math.random() < 0.4 ? 1 : 0;
    Ye(e, "interceptor", i, n + s * 34, l);
  }
}
function Mo(e, t, n) {
  let o = 6 + Math.floor(Math.random() * 3),
    r = (Math.random() * 2 - 1) * (t - 80);
  for (let a = 0; a < o; a++) Ye(e, "drone", r, n + a * 40);
}
function Hr(e, t, n, o) {
  let r = (Math.random() * 2 - 1) * (t - 160);
  Ye(e, "bomber", r, n), o > 1.7 && Math.random() < 0.5 && Ye(e, "bomber", $t(r + (r < 0 ? 260 : -260), t), n + 50), Ye(e, "interceptor", $t(r - 150, t), n + 80), Ye(e, "interceptor", $t(r + 150, t), n + 80);
}
function xn(e, t, n) {
  Ye(e, "elite", (Math.random() * 2 - 1) * (t - 120), n);
}
function Rn(e, t, n) {
  let o = Math.random() < 0.5 ? -1 : 1,
    r = 5 + Math.floor(Math.random() * 3);
  for (let a = 0; a < r; a++) {
    let s = Ye(e, "drone", o * (t + b.field.spawnMargin + a * 42), n * (0.25 + 0.5 * Math.random()));
    s.baseX = -o * (t - 220) + o * a * 85;
  }
}
function Sr(e, t, n) {
  let o = Ye(e, "elite", -(t - 140), n),
    r = Ye(e, "elite", t - 140, n + 60);
  o.seed = 0.8, r.seed = 0.2;
}
function kr(e, t, n, o) {
  let r = ke(e),
    a = n + b.field.spawnMargin,
    s = t - 80,
    i = e.spawn.waveIndex;
  if (o) {
    Math.random() < 0.55 && xn(e, s, a), Yt(e, s, a);
    return;
  }
  let l = e.tier,
    c = i % 4;
  if (c === 3 && i >= 6 && Math.random() < 0.6) {
    l >= 2 && Math.random() < 0.5 ? Sr(e, s, a) : xn(e, s, a), r > 1.8 && Yt(e, s, a);
    return;
  }
  switch (c) {
    case 0:
      Yt(e, s, a), r > 1.9 && Math.random() < 0.5 && Mo(e, s, a);
      break;
    case 1:
      l >= 1 && Math.random() < 0.5 ? Rn(e, t, n) : Mo(e, s, a);
      break;
    case 2:
      Hr(e, s, a, r), l >= 1 && Math.random() < 0.35 && Rn(e, t, n);
      break;
    default:
      Yt(e, s, a), i >= 4 && Math.random() < 0.6 && Mo(e, s, a);
      break;
  }
}
function wn(e, t, n) {
  let {
      halfW: o,
      halfH: r
    } = he(t),
    a = b.boss.arriveAt + e.tier * 130;
  e.boss === null && e.time >= a && e.enemies.length < 4 && (e.boss = lt({}, e.tier), z(e, {
    type: "boss-phase",
    phase: "arrive"
  }));
  let s = b.interlude.at + e.tier * 130,
    i = e.time >= s && e.time < s + b.interlude.duration;
  e.env.capitalShipOn = i && e.boss === null, e.boss === null && e.time >= e.spawn.nextWaveAt && (kr(e, o, r, i), e.spawn.waveIndex++, e.spawn.nextWaveAt = e.time + Math.max(b.spawn.baseInterval / ke(e), b.spawn.minInterval));
}
function Gr(e, t) {
  e[t] = e[e.length - 1], e.pop();
}
function Cr(e, t) {
  let {
      halfH: n
    } = he(t),
    o = Math.min(e.env.capitalShipT / b.interlude.duration, 1);
  return n + 1100 - o * (2 * n + 2200);
}
function Br(e, t) {
  return {
    id: Ee(e),
    index: t,
    x: 0,
    y: 0,
    hp: b.capital.turretHp,
    maxHp: b.capital.turretHp,
    radius: b.capital.turretRadius,
    fireCd: 0.35 + t * 0.16,
    alive: !0
  };
}
function Ar(e) {
  if (!(e.capitalTurrets.length > 0)) {
    for (let t = 0; t < b.capital.turrets.length; t++) e.capitalTurrets.push(Br(e, t));
    e.env.capitalShipAnnounced || (e.env.capitalShipAnnounced = !0, z(e, {
      type: "capital-arrive"
    }));
  }
}
function Pr(e, t) {
  let n = Cr(e, t);
  for (let o of e.capitalTurrets) {
    let r = b.capital.turrets[o.index];
    r && (o.x = b.capital.x - r[0], o.y = n - r[1]);
  }
}
function Lr(e, t, n) {
  let o = Math.atan2(e.player.y - t.y, e.player.x - t.x),
    r = b.capital.turretSpeed * (1 + 0.08 * n);
  e.enemyBolts.push({
    id: Ee(e),
    x: t.x,
    y: t.y,
    vx: Math.cos(o) * r,
    vy: Math.sin(o) * r,
    radius: 7,
    kind: "bolt",
    t: 0
  });
}
function Wt(e, t, n) {
  if (!e.env.capitalShipOn) {
    e.capitalTurrets.length > 0 && (e.capitalTurrets.length = 0), e.env.capitalShipAnnounced = !1;
    return;
  }
  Ar(e), Pr(e, t);
  let {
      halfH: o
    } = he(t),
    r = ke(e);
  for (let a = e.capitalTurrets.length - 1; a >= 0; a--) {
    let s = e.capitalTurrets[a];
    s.y > o + b.field.cullMargin || s.y < -o - b.field.cullMargin || s.alive && (s.fireCd -= n, s.fireCd <= 0 && (Lr(e, s, r), s.fireCd = b.capital.turretFire / Math.min(r, 2.1) + s.index % 3 * 0.12));
  }
  if (e.env.capitalShipT >= b.interlude.duration) for (let a = e.capitalTurrets.length - 1; a >= 0; a--) e.capitalTurrets[a].alive || Gr(e.capitalTurrets, a);
}
var Ut = Math.PI * 2;
function vo(e, t, n) {
  let o = t - e;
  return Math.abs(o) <= n ? t : e + Math.sign(o) * n;
}
function xo(e, t, n) {
  return e < t ? t : e > n ? n : e;
}
function Hn(e, t) {
  e[t] = e[e.length - 1], e.pop();
}
function Ro(e, t, n, o, r, a) {
  e.enemyBolts.push({
    id: Ee(e),
    x: t,
    y: n,
    vx: o,
    vy: r,
    radius: a === "orb" ? 11 : 7,
    kind: a,
    t: 0
  });
}
function Kt(e, t, n, o, r = 0) {
  let a = Math.atan2(e.player.y - n, e.player.x - t) + r;
  Ro(e, t, n, Math.cos(a) * o, Math.sin(a) * o, "bolt");
}
function Or(e, t, n, o, r) {
  switch (t.kind) {
    case "interceptor":
      {
        if (t.vy = -b.enemies.interceptor.speed * (0.85 + 0.15 * o), t.pattern === 1) {
          if (t.t < 2) {
            let a = xo((e.player.x - t.x) * 1.6, -260, 260);
            t.vx = vo(t.vx, a, 340 * n);
          } else t.vx = vo(t.vx, 0, 220 * n);
        } else t.vx = Math.sin(t.t * 3.1 + t.seed * Ut) * 120;
        break;
      }
    case "drone":
      {
        let a = t.baseX + Math.sin(t.t * 2.2 + t.seed * Ut) * 90,
          s = xo((a - t.x) * 4, -170, 170);
        t.vx = vo(t.vx, s, 500 * n), t.vy = -b.enemies.drone.speed * (0.9 + 0.1 * o);
        break;
      }
    case "bomber":
      {
        t.vx = xo(-t.x * 0.12, -22, 22), t.pattern >= 10 ? t.vy = t.t < 6 ? 0 : -b.enemies.bomber.speed : (t.vy = -b.enemies.bomber.speed, t.y + t.vy * n <= 60 && (t.pattern += 10, t.t = 0, t.y = 60, t.vy = 0));
        break;
      }
    case "elite":
      {
        if (t.y > 180) t.vx = 0, t.vy = -b.enemies.elite.speed;else {
          t.y = 180, t.vy = 0;
          let a = r - 80;
          t.vx === 0 && (t.vx = (t.seed < 0.5 ? -1 : 1) * b.enemies.elite.speed), t.x >= a ? t.vx = -Math.abs(t.vx) : t.x <= -a && (t.vx = Math.abs(t.vx));
        }
        break;
      }
  }
  t.x += t.vx * n, t.y += t.vy * n;
}
function Ir(e, t, n) {
  let o = b.enemyBoltSpeed * (1 + 0.15 * n);
  switch (t.kind) {
    case "interceptor":
      Kt(e, t.x, t.y, o), t.fireCd = b.enemies.interceptor.fire / n;
      break;
    case "bomber":
      {
        for (let r = 0; r < 5; r++) {
          let a = -Math.PI / 2 + (r / 4 - 0.5) * 1.8;
          Ro(e, t.x, t.y, Math.cos(a) * 170, Math.sin(a) * 170, "orb");
        }
        t.fireCd = b.enemies.bomber.fire / n;
        break;
      }
    case "elite":
      {
        if (t.pattern = (t.pattern + 1) % 2, t.pattern === 1) Kt(e, t.x, t.y, o, -0.3), Kt(e, t.x, t.y, o, 0), Kt(e, t.x, t.y, o, 0.3);else for (let r = 0; r < 8; r++) {
          let a = r / 8 * Ut + t.seed * Ut;
          Ro(e, t.x, t.y, Math.cos(a) * 170, Math.sin(a) * 170, "orb");
        }
        t.fireCd = b.enemies.elite.fire / n;
        break;
      }
    case "drone":
      break;
  }
}
function qt(e, t, n) {
  let {
      halfW: o,
      halfH: r
    } = he(t),
    a = ke(e),
    s = b.field.cullMargin;
  for (let i = e.enemies.length - 1; i >= 0; i--) {
    let l = e.enemies[i];
    l.t += n, Or(e, l, n, a, o), l.kind !== "drone" && l.y < r && (l.fireCd -= n, l.fireCd <= 0 && Ir(e, l, a)), l.y < -r - s && Hn(e.enemies, i);
  }
  for (let i = e.enemyBolts.length - 1; i >= 0; i--) {
    let l = e.enemyBolts[i];
    l.t += n, l.x += l.vx * n, l.y += l.vy * n, (Math.abs(l.x) > o + s || Math.abs(l.y) > r + s) && Hn(e.enemyBolts, i);
  }
}
var Sn = 68,
  Dr = 3,
  zr = 0.35,
  Fr = 2.6;
function Ho(e, t, n, o, r, a, s) {
  e.enemyBolts.push({
    id: Ee(e),
    x: t,
    y: n,
    vx: o,
    vy: r,
    radius: a,
    kind: s,
    t: 0
  });
}
function wo(e, t) {
  let n = Math.min(1, 10 * t),
    o = e.x,
    r = e.y;
  for (let a of e.segments) {
    let s = a.x - o,
      i = a.y - r,
      l = Math.hypot(s, i);
    l < 1e-4 && (s = 0, i = 1, l = 1), a.x += (o + s / l * Sn - a.x) * n, a.y += (r + i / l * Sn - a.y) * n, o = a.x, r = a.y;
  }
}
function kn(e, t) {
  let n = 10 + Math.min(4, Math.floor(ke(e))),
    o = b.enemyBoltSpeed * (0.75 + 0.12 * ke(e)),
    r = t.patternT * 0.7;
  for (let a = 0; a < n; a++) {
    let s = r + a / n * Math.PI * 2;
    Ho(e, t.x, t.y, Math.cos(s) * o, Math.sin(s) * o, 9, "orb");
  }
}
function Vr(e, t) {
  if (!e.player.alive) return;
  let n = b.enemyBoltSpeed * 1.2;
  for (let o of t.segments) {
    if (!o.alive) continue;
    let r = e.player.x - o.x,
      a = e.player.y - o.y,
      s = Math.hypot(r, a) || 1;
    Ho(e, o.x, o.y, r / s * n, a / s * n, 7, "bolt");
  }
}
function Nr(e, t) {
  if (!e.player.alive) return;
  let n = b.enemyBoltSpeed * 1.35,
    o = Math.atan2(e.player.y - t.y, e.player.x - t.x);
  for (let r of [-0.28, 0, 0.28]) Ho(e, t.x, t.y, Math.cos(o + r) * n, Math.sin(o + r) * n, 7, "bolt");
}
function _r(e, t) {
  for (let n = 0; n < 3; n++) {
    let o = 0.6 + n / 3 * Math.PI * 2;
    e.pickups.push({
      id: Ee(e),
      kind: "shard",
      x: t.x + Math.cos(o) * 54,
      y: t.y + Math.sin(o) * 54,
      vx: Math.cos(o) * 50,
      vy: -b.pickups.fallSpeed,
      t: 0
    });
  }
  e.pickups.push({
    id: Ee(e),
    kind: "weapon",
    x: t.x,
    y: t.y,
    vx: 0,
    vy: -b.pickups.fallSpeed,
    t: 0
  });
}
function jt(e, t, n) {
  let o = e.boss;
  if (!o || o.phase === "weakpoints") return;
  let r = o.segments.reduce((l, c) => l + (c.alive ? 1 : 0), 0),
    a = r === 0;
  o.t += n, o.patternT += n * (a && o.phase === "active" ? 1.5 : 1), o.hurtFlash = Math.max(0, o.hurtFlash - n);
  let {
    halfW: s,
    halfH: i
  } = he(t);
  if (o.phase === "entering") {
    let l = Math.min(o.t / Dr, 1),
      c = 1 - (1 - l) ** 3,
      u = i + 220;
    o.y = u + (b.boss.topY - u) * c, o.x = Math.sin(o.t * 1.4) * 70, wo(o, n), l >= 1 && (o.phase = "active", o.t = 0);
    return;
  }
  if (o.phase === "active") {
    o.x = Math.sin(o.patternT * 0.5) * (s - 160), o.y = b.boss.topY + Math.sin(o.patternT * 0.83) * 55, wo(o, n);
    let l = b.boss.segments,
      c = 1 + (l - r) / l * 0.35,
      u = (0.8 + 0.1 * ke(e)) * c,
      m = (a ? 1.8 : 2.6) / u,
      h = Math.floor(o.t / m);
    if (h > 0 && h > Math.floor((o.t - n) / m) && (a ? (kn(e, o), Nr(e, o)) : h % 2 === 1 ? kn(e, o) : Vr(e, o)), r === 0) {
      o.phase = "weakpoints", o.t = 0, o.finale = Bt({}, e.tier);
      for (let E of e.enemies) z(e, {
        type: "kill",
        kind: E.kind,
        x: E.x,
        y: E.y,
        score: b.enemies[E.kind].score
      });
      e.enemies.length = 0, e.enemyBolts.length = 0, e.playerBolts.length = 0, z(e, {
        type: "boss-phase",
        phase: "weakpoints"
      });
    }
    return;
  }
  if (o.phase === "dying") {
    o.y -= 14 * n, wo(o, n);
    let l = o.t - n;
    for (let c = 0; c < o.segments.length; c++) {
      let u = (c + 1) * zr;
      if (l < u && o.t >= u) {
        let m = o.segments[c];
        m.alive = !1, m.hp = 0, z(e, {
          type: "kill",
          kind: "boss-segment",
          x: m.x,
          y: m.y,
          score: 0
        });
      }
    }
    o.t > Fr && (o.phase = "defeated", z(e, {
      type: "kill",
      kind: "boss",
      x: o.x,
      y: o.y,
      score: 1e4
    }), z(e, {
      type: "boss-phase",
      phase: "defeated"
    }), e.tier++, e.env.warpT = b.warp.duration, _r(e, o), e.spawn.nextWaveAt = e.time + 6, e.boss = null);
  }
}
import * as Me from "./vendor/002-three.js";
var Gn = 40,
  Cn = 70,
  Xr = 1500,
  Yr = 4;
function Je(e, t, n, o, r, a) {
  let s = o - e,
    i = r - t,
    l = n + a;
  return s * s + i * i < l * l;
}
function ft(e, t) {
  e[t] = e[e.length - 1], e.pop();
}
function bt(e) {
  let t = e.player;
  t.hp -= 1, e.weaponLevel > 1 && e.weaponLevel--, t.invuln = b.player.iframes, z(e, {
    type: "player-hit",
    x: t.x,
    y: t.y
  });
}
function So(e) {
  return e.player.alive && e.player.invuln <= 0;
}
function Qt(e, t, n) {
  $r(e, t), Wr(e, t), Kr(e, t), Ur(e), qr(e), jr(e);
}
function $r(e, t) {
  let n = e.playerBolts,
    o = e.enemies;
  for (let r = n.length - 1; r >= 0; r--) {
    let a = n[r];
    for (let s = o.length - 1; s >= 0; s--) {
      let i = o[s];
      if (Je(a.x, a.y, a.radius, i.x, i.y, i.radius)) {
        i.hp -= a.dmg, i.hp <= 0 ? (ft(o, s), z(e, {
          type: "kill",
          kind: i.kind,
          x: i.x,
          y: i.y,
          score: b.enemies[i.kind].score
        })) : t.fx.hitSpark(a.x, a.y), ft(n, r);
        break;
      }
    }
  }
}
function Wr(e, t) {
  if (e.capitalTurrets.length === 0) return;
  let n = e.playerBolts;
  for (let o = n.length - 1; o >= 0; o--) {
    let r = n[o];
    for (let a of e.capitalTurrets) if (a.alive && Je(r.x, r.y, r.radius, a.x, a.y, a.radius)) {
      a.hp -= r.dmg, a.hp <= 0 ? (a.hp = 0, a.alive = !1, z(e, {
        type: "kill",
        kind: "capital-turret",
        x: a.x,
        y: a.y,
        score: b.capital.turretScore
      })) : t.fx.hitSpark(r.x, r.y), ft(n, o);
      break;
    }
  }
}
function Kr(e, t) {
  let n = e.boss;
  if (!n || n.phase !== "active" && n.phase !== "entering") return;
  let o = e.playerBolts;
  for (let r = o.length - 1; r >= 0; r--) {
    let a = o[r],
      s = !1;
    for (let i of n.segments) if (!(!i.alive || !Je(a.x, a.y, a.radius, i.x, i.y, Gn))) {
      i.hp -= a.dmg, i.hp <= 0 ? (i.alive = !1, z(e, {
        type: "kill",
        kind: "boss-segment",
        x: i.x,
        y: i.y,
        score: Xr
      }), z(e, {
        type: "boss-phase",
        phase: "segment-down"
      })) : t.fx.hitSpark(a.x, a.y), s = !0;
      break;
    }
    !s && Je(a.x, a.y, a.radius, n.x, n.y, Cn) && (n.segments.every(i => !i.alive) && (n.headHp -= a.dmg, n.hurtFlash <= 0 && z(e, {
      type: "boss-phase",
      phase: "hurt"
    }), n.hurtFlash = 0.1), t.fx.hitSpark(a.x, a.y), s = !0), s && ft(o, r);
  }
}
function Ur(e) {
  let t = e.player,
    n = e.enemyBolts;
  for (let o = n.length - 1; o >= 0; o--) {
    if (!So(e)) return;
    let r = n[o];
    Je(r.x, r.y, r.radius, t.x, t.y, b.player.radius) && (ft(n, o), bt(e));
  }
}
function qr(e) {
  let t = e.player,
    n = e.enemies;
  for (let o = n.length - 1; o >= 0; o--) {
    if (!So(e)) return;
    let r = n[o];
    Je(r.x, r.y, r.radius, t.x, t.y, b.player.radius) && (r.hp -= Yr, r.hp <= 0 && (ft(n, o), z(e, {
      type: "kill",
      kind: r.kind,
      x: r.x,
      y: r.y,
      score: b.enemies[r.kind].score
    })), bt(e));
  }
}
function jr(e) {
  let t = e.boss;
  if (!t || t.phase !== "active" && t.phase !== "entering" || !So(e)) return;
  let n = e.player;
  if (Je(t.x, t.y, Cn, n.x, n.y, b.player.radius)) {
    bt(e);
    return;
  }
  for (let o of t.segments) if (o.alive && Je(o.x, o.y, Gn, n.x, n.y, b.player.radius)) {
    bt(e);
    return;
  }
}
import * as re from "./vendor/002-three.js";
var Ae = new re.BoxGeometry(1, 1, 1),
  Et = new re.ConeGeometry(0.5, 1, 4),
  Ke = new re.OctahedronGeometry(0.5, 0),
  Bn = new re.CylinderGeometry(0.5, 0.5, 1, 6),
  An = new re.TorusGeometry(0.5, 0.09, 6, 10, Math.PI * 0.95),
  ko = new re.Color(p.dusk).multiplyScalar(4.2).getHex(),
  Qr = new re.Color(855058),
  Zr = 1314079;
function Pn(e) {
  let t = G(e).clone();
  return t.userData.baseColor = new re.Color(e), t;
}
function Ue(e) {
  let t = C(e).clone();
  return t.transparent = !0, t;
}
function j(e, t, n, o, r, a, s, i, l = 0, c = 0, u = 0) {
  let m = new re.Mesh(e, t);
  return m.position.set(n, o, r), m.scale.set(a, s, i), m.rotation.set(l, c, u), m;
}
function Zt(e, t) {
  for (let n of e) n.color.copy(n.userData.baseColor).lerp(Qr, t);
}
function Jr(e) {
  let t = new re.Group(),
    n = [],
    o = w => {
      let f = Pn(w);
      return n.push(f), f;
    },
    r = new re.Group();
  for (let w = 0; w < 6; w++) {
    let f = w / 6 * Math.PI * 2;
    r.add(j(Ae, o(w % 2 ? p.metalLight : p.metal), Math.cos(f) * 23, 0, Math.sin(f) * 23, 21, 17, 11, 0, -f, 0)), w % 2 === 0 && r.add(j(Et, o(p.bone), Math.cos(f) * 33, 0, Math.sin(f) * 33, 9, 13, 9, 0, -f, -Math.PI / 2));
  }
  t.add(r), t.add(j(Bn, o(p.navy), 0, 26, 0, 26, 10, 26), j(Bn, o(p.navy), 0, -26, 0, 26, 10, 26));
  let a = Ue(ko);
  t.add(v(j(Ke, a, 0, 0, 0, 26, 30, 26)));
  let s = D(ko, 52),
    i = s.material;
  s.position.z = 10, t.add(s);
  let l = new re.Group();
  for (let w of [-1, 1]) {
    let f = D(p.cyan, 15);
    f.position.set(w * 40, 0, 2), l.add(f);
  }
  t.add(l);
  let c = new re.Group();
  c.add(v(j(Ke, Ue(p.molten), 12, 8, 12, 9, 14, 6))), c.add(v(j(Ke, Ue(p.molten), -13, -7, 11, 7, 11, 5)));
  let u = D(p.molten, 28);
  u.position.z = 12, c.add(u), c.visible = !1, t.add(c);
  let m = new re.Group(),
    h = D(p.molten, 44),
    E = h.material;
  h.position.z = 6;
  let d = D(p.gold, 18);
  return d.position.set(7, 5, 8), m.add(h, d), m.visible = !1, t.add(m), ne(t), {
    outer: we(t),
    ring: r,
    mats: n,
    coreMat: a,
    auraMat: i,
    cracks: c,
    fire: m,
    fireMat: E,
    thrusters: l,
    dir: e % 2 ? -1 : 1
  };
}
function es() {
  let e = new re.Group(),
    t = [],
    n = m => {
      let h = Pn(m);
      return t.push(h), h;
    };
  e.add(j(Ae, n(p.metal), 0, 38, 8, 84, 56, 30)), e.add(j(Ae, n(p.metalLight), 0, 48, 26, 56, 34, 12)), e.add(j(Ae, n(p.metalLight), 0, 8, 20, 96, 22, 14, -0.22, 0, 0)), e.add(j(Ae, n(p.navy), -47, 6, 2, 22, 46, 22, 0, 0, 0.28), j(Ae, n(p.navy), 47, 6, 2, 22, 46, 22, 0, 0, -0.28)), e.add(j(Ae, n(p.metal), 0, -30, 12, 62, 52, 16)), e.add(j(Et, n(p.metalLight), 0, -64, 12, 40, 26, 14, 0, 0, Math.PI)), e.add(j(Ae, n(p.dusk), 0, 20, 26, 30, 46, 10)), e.add(j(An, n(p.metalLight), -46, 34, 16, 72, 72, 40, 0.45, -0.95, 0), j(An, n(p.metalLight), 46, 34, 16, 72, 72, 40, 0.45, 0.95, 0));
  let o = Ue(p.magenta);
  e.add(v(j(Ke, o, -78, 62, 34, 9, 12, 9)), v(j(Ke, o, 78, 62, 34, 9, 12, 9)));
  for (let [m, h] of [[-24, -40], [-10, -46], [10, -46], [24, -40]]) e.add(j(Et, n(p.bone), m, h, -2, 7, 13, 7, -Math.PI / 2, 0, 0));
  let r = new re.Group();
  r.position.set(0, -6, -16), r.rotation.x = 0.55, r.add(j(Ae, n(p.metal), 0, -28, -2, 42, 48, 12)), r.add(j(Et, n(p.metalLight), 0, -56, -2, 24, 18, 10, 0, 0, Math.PI)), r.add(j(Et, n(p.bone), -12, -44, 5, 6, 11, 6, Math.PI / 2, 0, 0), j(Et, n(p.bone), 12, -44, 5, 6, 11, 6, Math.PI / 2, 0, 0)), e.add(r);
  let a = D(p.magenta, 58),
    s = a.material;
  a.position.set(0, -34, -2), e.add(a);
  let i = Ue(p.magenta);
  e.add(v(j(Ke, i, 0, -34, -2, 26, 32, 16)));
  let l = Ue(p.gold);
  e.add(v(j(Ae, l, -19, -6, 24, 15, 4.5, 3, 0, 0, -0.35)), v(j(Ae, l, 19, -6, 24, 15, 4.5, 3, 0, 0, 0.35))), e.add(v(j(Ae, l, -33, 2, 22, 11, 3.5, 3, 0, 0, -0.55)), v(j(Ae, l, 33, 2, 22, 11, 3.5, 3, 0, 0, 0.55)));
  let c = new re.Group();
  c.add(v(j(Ke, Ue(p.molten), -20, 34, 24, 9, 20, 6))), c.add(v(j(Ke, Ue(p.molten), 16, 10, 26, 7, 16, 5))), c.add(v(j(Ke, Ue(p.molten), 4, -24, 22, 6, 18, 5)));
  let u = D(p.molten, 44);
  return u.position.set(-8, 26, 28), c.add(u), c.visible = !1, e.add(c), ne(e), {
    outer: we(e),
    mats: t,
    mawMat: s,
    mawCoreMat: i,
    eyeMat: l,
    cracks: c
  };
}
function Jt() {
  let e = new re.Group(),
    t = es(),
    n = t.outer;
  e.add(n);
  let o = [],
    r = [];
  for (let u = 0; u < b.boss.segments; u++) {
    let m = Jr(u);
    m.outer.position.set(Math.sin(u * 0.9) * 26, 110 + u * 72, 0), e.add(m.outer), o.push(m), r.push(m.outer);
  }
  let a = 0,
    s = 0,
    i = 0,
    l = () => Zt(t.mats, s * 0.7),
    c = o.map(() => ({
      last: 0,
      t: 0,
      alive: !0
    }));
  return {
    group: e,
    head: n,
    segments: r,
    update(u) {
      a += u;
      let m = 0.72 + Math.sin(a * 5.2) * 0.22;
      s > 0.6 && Math.sin(a * 47) * Math.sin(a * 31) < -0.15 && (m *= 0.25), t.mawMat.opacity = m, t.mawCoreMat.opacity = Math.min(1, m + 0.15), t.eyeMat.opacity = 0.8 + Math.sin(a * 7.3) * 0.2, i > 0 && (i -= u, i <= 0 && l());
      for (let h = 0; h < o.length; h++) {
        let E = o[h];
        E.ring.rotation.y += u * E.dir * (0.35 + h * 0.06), E.fire.visible ? E.fireMat.opacity = 0.55 + Math.sin(a * 13 + h * 1.7) * 0.28 : E.coreMat.opacity = 0.85 + Math.sin(a * 3.1 + h) * 0.15;
        let d = c[h];
        d.t > 0 && (d.t -= u, d.t <= 0 && d.alive && Zt(E.mats, d.last * 0.75));
      }
    },
    setSegmentDamage(u, m, h) {
      let E = o[u],
        d = c[u];
      if (!E || !d) return;
      let w = Math.min(1, Math.max(0, m));
      if (h && w > d.last + 0.001) {
        d.t = 0.08;
        for (let f of E.mats) f.color.setRGB(1, 1, 1);
      }
      d.last = w, d.alive = h, h || (d.t = 0), h ? (d.t <= 0 && Zt(E.mats, w * 0.75), E.cracks.visible = m > 0.5, E.fire.visible = !1, E.thrusters.visible = !0, E.coreMat.color.setHex(ko), E.auraMat.opacity = 0.9) : (Zt(E.mats, 0.92), E.cracks.visible = !1, E.fire.visible = !0, E.thrusters.visible = !1, E.coreMat.color.setHex(Zr), E.coreMat.opacity = 0.9, E.auraMat.opacity = 0.12);
    },
    setHeadDamage(u) {
      s = Math.min(1, Math.max(0, u)), t.cracks.visible = s > 0.5, i <= 0 && l();
    },
    flashHurt() {
      i = 0.09;
      for (let u of t.mats) u.color.setRGB(1, 1, 1);
    }
  };
}
import * as He from "./vendor/002-three.js";
var Ln = new He.BoxGeometry(1, 1, 1),
  ts = new He.OctahedronGeometry(0.5, 0);
function os(e) {
  let t = C(e).clone();
  return t.transparent = !0, t;
}
function On() {
  let e = new He.Group(),
    t = G(p.metal).clone(),
    n = G(p.gold).clone(),
    o = new He.Group();
  for (let f = 0; f < 6; f++) {
    let M = f / 6 * Math.PI * 2,
      x = new He.Mesh(Ln, t);
    x.position.set(Math.cos(M) * 26, Math.sin(M) * 26, 0), x.scale.set(20, 12, 10), x.rotation.z = M, o.add(x);
    let T = new He.Mesh(Ln, n);
    T.position.set(Math.cos(M) * 15, Math.sin(M) * 15, 6), T.scale.set(11, 5, 6), T.rotation.z = M, o.add(T);
  }
  e.add(o);
  let r = os(16723926),
    a = v(new He.Mesh(ts, r));
  a.scale.set(24, 30, 20), a.position.z = 8, e.add(a);
  let s = D(p.magenta, 92),
    i = s.material;
  s.position.z = 12, e.add(s);
  let l = D(p.molten, 52),
    c = l.material;
  l.position.z = 6, l.visible = !1, e.add(l), ne(e);
  let u = new He.Color(p.metal),
    m = new He.Color(p.gold),
    h = new He.Color(855058),
    E = Math.random() * 10,
    d = !0,
    w = 0;
  return {
    group: e,
    update(f) {
      if (E += f, w > 0 && (w -= f), d) {
        a.rotation.z += f * 1.6;
        let M = 0.75 + Math.sin(E * 4.4) * 0.25;
        r.opacity = w > 0 ? 1 : M, i.opacity = 0.35 + M * 0.45, a.scale.set(24, 30, 20).multiplyScalar(w > 0 ? 1.25 : 1), t.color.copy(u), n.color.copy(m), w > 0 && (t.color.setRGB(1, 1, 1), n.color.setRGB(1, 1, 1));
      } else c.opacity = 0.45 + Math.sin(E * 12) * 0.25;
    },
    setAlive(f) {
      d !== f && (d = f, a.visible = f, s.visible = f, l.visible = !f, f || (t.color.copy(u).lerp(h, 0.85), n.color.copy(m).lerp(h, 0.85)));
    },
    flashHit() {
      w = 0.08;
    }
  };
}
import * as oe from "./vendor/002-three.js";
var Go = new oe.CapsuleGeometry(2.6, 13, 4, 8),
  ns = new oe.OctahedronGeometry(8),
  as = new oe.OctahedronGeometry(4),
  rs = new oe.ConeGeometry(3.4, 9, 6),
  ss = new oe.CylinderGeometry(2.9, 3.5, 13, 6),
  is = new oe.BoxGeometry(8, 5.5, 1.5),
  In = new Map();
function ls(e) {
  let t = In.get(e);
  return t || (t = new oe.MeshBasicMaterial({
    map: Be(),
    color: e,
    transparent: !0,
    blending: oe.AdditiveBlending,
    depthWrite: !1
  }), In.set(e, t)), t;
}
function Fe(e, t, n, o = 0, r = 0, a = -1) {
  let s = v(new oe.Mesh(le(), ls(e)));
  return s.scale.set(t, n, 1), s.position.set(o, r, a), s;
}
function eo(e = "plasma") {
  let t = new oe.Group(),
    n = Math.random() * Math.PI * 2,
    o = 0;
  if (e === "plasma") {
    let c = v(new oe.Mesh(Go, C(16777215))),
      u = v(new oe.Mesh(Go, C(p.cyan, 0.5)));
    u.scale.set(1.7, 1.22, 1.7);
    let m = Fe(p.cyan, 24, 30),
      h = Fe(p.cyan, 10, 34, 0, -17);
    return t.add(h, m, u, c), {
      group: t,
      kind: e,
      update(E) {
        o += E;
        let d = 1 + Math.sin(o * 42 + n) * 0.14;
        m.scale.set(24 * d, 30 * d, 1), h.scale.set(10 * d, 34, 1);
      }
    };
  }
  if (e === "beam") {
    let c = v(new oe.Mesh(Go, C(16777215, 1.25)));
    c.scale.set(3.2, 7.2, 3.2);
    let u = Fe(p.gold, 58, 170, 0, -52),
      m = Fe(p.cyan, 38, 190, 0, -60),
      h = Fe(p.gold, 92, 92, 0, -5),
      E = Fe(p.cyan, 9, 142, -24, -54),
      d = Fe(p.cyan, 9, 142, 24, -54);
    return t.add(m, u, E, d, h, c), {
      group: t,
      kind: e,
      update(w) {
        o += w;
        let f = 1 + Math.sin(o * 74 + n) * 0.18,
          M = 1 + Math.sin(o * 19 + n) * 0.1;
        c.scale.set(3.2 * f, 7.2, 3.2 * f), u.scale.set(58 * f, 170 * M, 1), m.scale.set(38 * M, 190, 1), h.scale.set(92 * f, 92 * f, 1), E.position.x = -24 - Math.sin(o * 38 + n) * 4, d.position.x = 24 + Math.sin(o * 41 + n) * 4;
      }
    };
  }
  if (e === "heavy") {
    let c = new oe.Group(),
      u = v(new oe.Mesh(ns, C(p.acid, 0.9)));
    u.scale.set(1.05, 1.65, 1.05);
    let m = v(new oe.Mesh(as, C(16777215)));
    m.scale.set(0.9, 1.5, 0.9), c.add(u, m);
    let h = Fe(p.acid, 34, 40),
      E = Fe(p.acid, 14, 32, 0, -18);
    return t.add(E, h, c), {
      group: t,
      kind: e,
      update(d) {
        o += d, c.rotation.y += d * 7;
        let w = 1 + Math.sin(o * 30 + n) * 0.1;
        h.scale.set(34 * w, 40 * w, 1);
      }
    };
  }
  let r = new oe.Group(),
    a = new oe.Mesh(rs, G(p.gold));
  a.position.y = 10;
  let s = new oe.Mesh(ss, G(p.bone));
  r.add(a, s);
  for (let c = 0; c < 3; c++) {
    let u = new oe.Mesh(is, G(p.metalLight));
    u.position.y = -4.5, u.rotation.y = c / 3 * Math.PI, r.add(u);
  }
  r.rotation.x = -0.35, ne(r, 0.16);
  let i = Fe(p.molten, 13, 13, 0, -9.5, 0.5),
    l = Fe(p.molten, 8, 28, 0, -21);
  return t.add(l, i, r), {
    group: t,
    kind: e,
    update(c) {
      o += c;
      let u = 1 + Math.sin(o * 50 + n) * 0.22;
      i.scale.set(13 * u, 13 * u, 1), l.scale.set(8, 28 * (1 + Math.sin(o * 36 + n) * 0.12), 1), r.rotation.z = Math.sin(o * 9 + n) * 0.06;
    }
  };
}
import * as ce from "./vendor/002-three.js";
var cs = new ce.OctahedronGeometry(6.5),
  ps = new ce.CapsuleGeometry(1.8, 8, 4, 6),
  us = new ce.SphereGeometry(7.5, 12, 10),
  ms = new ce.SphereGeometry(3.8, 10, 8),
  ds = new ce.TorusGeometry(9.5, 1.5, 6, 8),
  Dn = new Map();
function hs(e) {
  let t = Dn.get(e);
  return t || (t = new ce.MeshBasicMaterial({
    map: Be(),
    color: e,
    transparent: !0,
    blending: ce.AdditiveBlending,
    depthWrite: !1
  }), Dn.set(e, t)), t;
}
function Co(e, t, n, o = 0, r = 0, a = -1) {
  let s = v(new ce.Mesh(le(), hs(e)));
  return s.scale.set(t, n, 1), s.position.set(o, r, a), s;
}
function Pt(e = "bolt") {
  let t = new ce.Group(),
    n = Math.random() * Math.PI * 2,
    o = 0;
  if (e === "bolt") {
    let l = v(new ce.Mesh(cs, C(p.magenta, 0.9)));
    l.scale.set(0.72, 1.6, 0.72);
    let c = v(new ce.Mesh(ps, C(16777215))),
      u = Co(p.magenta, 24, 28),
      m = Co(p.magenta, 9, 24, 0, -13);
    return t.add(m, u, l, c), {
      group: t,
      update(h) {
        o += h, l.rotation.y += h * 8;
        let E = 1 + Math.sin(o * 38 + n) * 0.13;
        u.scale.set(24 * E, 28 * E, 1);
      }
    };
  }
  let r = v(new ce.Mesh(us, C(p.crimson, 0.95))),
    a = v(new ce.Mesh(ms, C(16777215))),
    s = v(new ce.Mesh(ds, C(2820626)));
  s.rotation.z = Math.PI / 8;
  let i = Co(p.crimson, 34, 34);
  return t.add(i, r, a, s), {
    group: t,
    update(l) {
      o += l;
      let c = 1 + Math.sin(o * 9 + n) * 0.16;
      r.scale.setScalar(c), a.scale.setScalar(1 + Math.sin(o * 9 + n + 1.4) * 0.28), i.scale.set(34 * c, 34 * c, 1), s.rotation.z += l * 2.2;
    }
  };
}
import * as Q from "./vendor/002-three.js";
import { seededRandom as Fn } from "./vendor/006-three.js";
var Vn = new Q.IcosahedronGeometry(1, 0),
  fs = new Q.ConeGeometry(0.34, 1, 6),
  bs = new Q.OctahedronGeometry(0.42, 0),
  Es = new Q.SphereGeometry(1, 10, 8),
  ys = new Q.BoxGeometry(1, 0.16, 0.72),
  gs = new Q.CylinderGeometry(0.09, 0.13, 1, 6),
  Ts = new Q.OctahedronGeometry(0.12, 0),
  Ms = G(p.metal),
  vs = G(6245434),
  xs = G(p.metalLight),
  Nn = G(p.charcoal),
  Rs = G(1712176),
  to = new Q.Vector3(0, 1, 0),
  zn = new Map();
function ws(e) {
  let t = zn.get(e);
  if (t) return t;
  let n = Fn(e * 7919 + 13);
  t = new Q.IcosahedronGeometry(1, 1);
  let o = t.getAttribute("position"),
    r = new Map(),
    a = new Q.Vector3();
  for (let s = 0; s < o.count; s++) {
    a.fromBufferAttribute(o, s);
    let i = `${a.x.toFixed(3)}|${a.y.toFixed(3)}|${a.z.toFixed(3)}`,
      l = r.get(i);
    l === void 0 && (l = 0.72 + n() * 0.55, r.set(i, l)), o.setXYZ(s, a.x * l, a.y * l * 0.86, a.z * l);
  }
  return t.computeVertexNormals(), zn.set(e, t), t;
}
function Bo(e) {
  return new Q.Vector3(e() - 0.5, e() - 0.5, 0.35 + e() * 0.6).normalize();
}
function Hs(e, t, n) {
  let o = Bo(t),
    r = 4 + Math.floor(t() * 3);
  for (let s = 0; s < r; s++) {
    let i = s % 3 === 2 ? bs : fs,
      l = v(new Q.Mesh(i, C(p.acid))),
      c = o.clone().add(new Q.Vector3((t() - 0.5) * 0.7, (t() - 0.5) * 0.7, (t() - 0.5) * 0.4)).normalize(),
      u = n * (0.22 + t() * 0.2);
    l.scale.set(u * 0.55, u, u * 0.55), l.position.copy(c).multiplyScalar(n * 0.78 + u * 0.35), l.quaternion.setFromUnitVectors(to, c), e.add(l);
  }
  let a = v(new Q.Mesh(Vn, C(p.acid, 0.28)));
  a.scale.setScalar(n * 0.34), a.position.copy(o).multiplyScalar(n * 0.86), e.add(a);
}
function Ss(e, t, n) {
  let o = Bo(t),
    r = new Q.Mesh(ys, Rs);
  r.scale.setScalar(n * 0.75), r.position.copy(o).multiplyScalar(n * 0.88), r.quaternion.setFromUnitVectors(to, o), r.rotateY(t() * Math.PI), e.add(r);
  let a = new Q.Mesh(gs, Nn);
  a.scale.set(n * 0.5, n * 0.7, n * 0.5), a.position.copy(o).multiplyScalar(n * 0.95), a.quaternion.setFromUnitVectors(to, o), a.rotateZ(0.5 + t() * 0.5), e.add(a);
  let s = v(new Q.Mesh(Ts, C(p.gold)));
  return s.scale.setScalar(n), s.position.copy(o).multiplyScalar(n * 1.02).add(new Q.Vector3(n * 0.1, n * 0.12, 0)), e.add(s), s;
}
function ks(e, t, n) {
  let o = 3 + Math.floor(t() * 2);
  for (let r = 0; r < o; r++) {
    let a = Bo(t),
      s = v(new Q.Mesh(Es, Nn)),
      i = n * (0.16 + t() * 0.14);
    s.scale.set(i, i * 0.4, i), s.position.copy(a).multiplyScalar(n * 0.8), s.quaternion.setFromUnitVectors(to, a), e.add(s);
  }
}
function oo(e = 1, t = 90) {
  let n = new Q.Group(),
    o = new Q.Group();
  n.add(o);
  let r = Fn(e * 131 + 7),
    a = t * 0.5,
    s = new Q.Mesh(ws(e), Ms);
  s.scale.setScalar(a), o.add(s);
  for (let d = 0; d < 3; d++) {
    let w = new Q.Mesh(Vn, d === 0 ? vs : xs),
      f = a * (0.16 + r() * 0.12);
    w.scale.set(f, f * 0.8, f), w.position.set(0.55 + r() * 0.4, 0.35 + r() * 0.45, 0.25 + r() * 0.5).normalize().multiplyScalar(a * 0.82), w.rotation.set(r() * Math.PI, r() * Math.PI, r() * Math.PI), o.add(w);
  }
  let i = (e % 3 + 3) % 3,
    l = null;
  i === 0 ? Hs(o, r, a) : i === 1 ? l = Ss(o, r, a) : ks(o, r, a), ne(o, 0.12);
  let c = (r() - 0.3) * 0.34,
    u = (r() - 0.5) * 0.44,
    m = (r() - 0.5) * 0.3;
  o.rotation.set(r() * Math.PI * 2, r() * Math.PI * 2, r() * Math.PI * 2);
  let h = l ? l.scale.x : 1,
    E = r() * 20;
  return {
    group: n,
    update(d) {
      if (E += d, o.rotation.x += c * d, o.rotation.y += u * d, o.rotation.z += m * d, l) {
        let w = Math.sin(E * 7.3) + Math.sin(E * 11.7) * 0.5;
        l.visible = w > -0.9, l.scale.setScalar(h * (0.75 + 0.3 * Math.max(0, w)));
      }
    }
  };
}
import * as Pe from "./vendor/002-three.js";
var _n = new Pe.RingGeometry(0.46, 0.5, 32),
  Gs = new Pe.PlaneGeometry(1, 1);
function Xn() {
  let e = new Pe.Group(),
    t = C(p.cyan).clone();
  t.transparent = !0, t.side = Pe.DoubleSide;
  let n = v(new Pe.Mesh(_n, t));
  n.scale.setScalar(70);
  let o = v(new Pe.Mesh(_n, t));
  o.scale.setScalar(34), e.add(n, o);
  let r = new Pe.Group();
  for (let c = 0; c < 4; c++) {
    let u = c / 4 * Math.PI * 2,
      m = v(new Pe.Mesh(Gs, t));
    m.position.set(Math.cos(u) * 44, Math.sin(u) * 44, 0), m.scale.set(14, 3.5, 1), m.rotation.z = u, r.add(m);
  }
  e.add(r);
  let a = D(p.cyan, 16),
    s = a.material;
  e.add(a);
  let i = 0,
    l = !1;
  return {
    group: e,
    update(c) {
      i += c, r.rotation.z += c * (l ? 2.4 : 0.6), t.opacity = 0.85 + Math.sin(i * 6) * 0.15, s.opacity = 0.7 + Math.sin(i * 9) * 0.3;
      let u = l ? 0.82 : 1;
      r.scale.setScalar(u);
    },
    setLocked(c) {
      if (l === c) return;
      l = c;
      let u = c ? p.gold : p.cyan;
      t.color.setHex(u), s.color.setHex(u);
    }
  };
}
var ta = 60,
  oa = -300,
  Do = 3.7,
  Cs = -102,
  Bs = 6,
  Se = 0.18,
  Yn = 1 + Se,
  $n = 120,
  Wn = 0.45,
  As = 200,
  Ps = 110,
  Kn = 0.5,
  Ls = 0.72,
  Un = 380,
  qn = 260,
  qe = 70,
  na = -40,
  yt = -40,
  gt = 0.3,
  Os = -250,
  Is = 2.2,
  Ds = 0.72,
  zo = 26,
  zs = 6,
  jn = -260,
  Fs = qe + 6,
  Vs = 1.35,
  Fo = 300,
  Ns = 120,
  Vo = -0.7,
  No = 1.15,
  Qn = 0,
  Zn = -120,
  aa = 0.9,
  _s = 0.5,
  _o = new WeakMap();
function Xs(e) {
  let t = new Me.Group();
  t.visible = !1, e.game.scene.add(t);
  let n = new Me.Group();
  t.add(n);
  for (let S = 0; S < 42; S++) {
    let H = D(S % 5 === 0 ? p.cyan : 12568285, 3 + Math.random() * 7);
    H.position.set((Math.random() - 0.5) * 2100, (Math.random() - 0.5) * 1200, -240 - Math.random() * 160), H.material.opacity = 0.35 + Math.random() * 0.5, n.add(H);
  }
  let o = new Me.Group();
  t.add(o);
  let r = Jt(),
    a = r.head;
  a.scale.setScalar(Do), a.position.set(0, ta, oa), o.add(a);
  let s = [];
  for (let S = 0; S < Math.min(Bs, r.segments.length); S++) {
    let H = r.segments[S];
    r.setSegmentDamage(S, 1, !1), H.scale.setScalar(Do * 0.82), o.add(H), s.push(H);
  }
  let i = [];
  for (let S = 0; S < zs; S++) {
    let H = oo(S, 40 + Math.random() * 70);
    H.group.position.set((Math.random() - 0.5) * 1700, (Math.random() - 0.5) * 900, -230 + Math.random() * 120), o.add(H.group), i.push({
      group: H.group,
      update: g => H.update(g),
      fall: 18 + Math.random() * 26
    });
  }
  let l = [];
  for (let S = 0; S < b.finale.nodes.length; S++) {
    let H = On();
    o.add(H.group), l.push(H);
  }
  let c = new Me.MeshBasicMaterial({
      color: p.magenta,
      transparent: !0,
      opacity: 0.1,
      blending: Me.AdditiveBlending,
      depthWrite: !1,
      side: Me.BackSide
    }),
    u = new Me.Mesh(new Me.SphereGeometry(1, 24, 16), c);
  u.scale.setScalar(Fo), o.add(u);
  let m = Xn();
  m.group.position.set(0, 0, na), o.add(m.group);
  let h = Nt();
  h.group.rotation.x = Vo, h.group.scale.setScalar(No), t.add(h.group);
  let E = [];
  for (let S = 0; S < zo; S++) {
    let H = Pt("orb");
    H.group.visible = !1;
    let g = Pt("bolt");
    g.group.visible = !1, t.add(H.group, g.group), E.push({
      orb: H,
      dart: g
    });
  }
  let d = (S, H) => {
      let g = [];
      for (let k = 0; k < H; k++) {
        let X = eo(S);
        X.group.visible = !1, t.add(X.group), g.push({
          vis: X,
          busy: !1,
          t: 0,
          ttl: gt,
          scale: 1,
          x0: 0,
          y0: 0,
          x1: 0,
          y1: 0
        });
      }
      return g;
    },
    w = d("plasma", 28),
    f = d("heavy", 12),
    M = d("beam", 6),
    x = [];
  for (let S = 0; S < 8; S++) {
    let H = D(p.molten, 40);
    H.visible = !1, t.add(H), x.push({
      mesh: H,
      mat: H.material,
      busy: !1,
      t: 0,
      ttl: 0.4,
      size: 40
    });
  }
  let T = new Me.MeshBasicMaterial({
      color: p.crimson,
      transparent: !0,
      opacity: 0,
      depthTest: !1,
      depthWrite: !1
    }),
    y = new Me.Mesh(le(), T);
  y.scale.setScalar(6e3), y.position.z = 310, y.renderOrder = 998, y.visible = !1, t.add(y);
  let R = {
    set: t,
    world: o,
    stars: n,
    head: a,
    tail: s,
    headUpdate: S => r.update?.(S),
    headFlash: () => r.flashHurt(),
    shield: u,
    shieldMat: c,
    shieldPopT: 0,
    nodes: l,
    orbs: E,
    asteroids: i,
    ship: h,
    crosshair: m,
    hitFlashMat: T,
    hitFlash: y,
    plasmaShots: w,
    heavyShots: f,
    beamShots: M,
    booms: x,
    shown: !1,
    shotSide: 1,
    bank: 0,
    returnT: 0,
    returnFromX: 0,
    returnFromY: 0
  };
  return _o.set(e, R), R;
}
function tt(e, t, n, o, r, a, s) {
  e.rotation.x = o, e.scale.setScalar(r), e.position.set(a - r * t, s - r * n * Math.cos(o), -r * n * Math.sin(o));
}
function Ao(e) {
  return e * e * (3 - 2 * e);
}
function ra(e, t) {
  let n = _o.get(e);
  if (tt(e.root, 0, 0, 0, 1, 0, 0), tt(e.bg, 0, 0, 0, 1, 0, 0), e.root.visible = !0, e.bg.visible = !0, !!n) {
    n.shown = t.boss?.phase === "weakpoints" && t.boss.t >= b.finale.introDuration, n.set.visible = n.shown, e.root.visible = !n.shown, n.returnT = 0, n.bank = 0, n.shotSide = 1, n.shieldPopT = 0, n.hitFlashMat.opacity = 0, n.hitFlash.visible = !1;
    for (let o of [n.plasmaShots, n.heavyShots, n.beamShots]) for (let r of o) r.busy = !1, r.vis.group.visible = !1;
    for (let o of n.booms) o.busy = !1, o.mesh.visible = !1;
    for (let o of n.orbs) o.orb.group.visible = !1, o.dart.group.visible = !1;
  }
}
function Po(e, t) {
  t.set.visible = !1, t.shown = !1, e.root.visible = !0, tt(e.root, 0, 0, 0, 1, 0, 0);
}
function Jn(e, t) {
  e.returnT = aa, e.returnFromX = t.shipX, e.returnFromY = t.shipY;
}
function et(e, t, n, o, r, a, s) {
  let i = e.find(l => !l.busy) ?? e[0];
  i.busy = !0, i.t = 0, i.ttl = a, i.scale = s, i.x0 = t, i.y0 = n, i.x1 = o, i.y1 = r, i.vis.group.rotation.set(-0.4, 0, Math.atan2(r - n, o - t) - Math.PI / 2), i.vis.group.visible = !0;
}
function Ve(e, t, n, o, r, a = 0.4, s = 55) {
  let i = e.booms.find(l => !l.busy) ?? e.booms[0];
  i.busy = !0, i.t = 0, i.ttl = a, i.size = o, i.mat.color.setHex(r), i.mat.opacity = 1, i.mesh.position.set(t, n, s), i.mesh.scale.setScalar(o * 0.4), i.mesh.visible = !0;
}
function Lo(e, t) {
  for (let n of [e.plasmaShots, e.heavyShots, e.beamShots]) for (let o of n) {
    if (!o.busy) continue;
    o.t += t;
    let r = Math.min(1, o.t / o.ttl),
      a = Math.min(1, r * Is);
    o.vis.group.position.set(o.x0 + (o.x1 - o.x0) * a, o.y0 + (o.y1 - o.y0) * a, qe + (Os - qe) * r), o.vis.group.scale.setScalar(o.scale * (1 - r * Ds)), o.vis.update(t), r >= 1 && (o.busy = !1, o.vis.group.visible = !1);
  }
  for (let n of e.booms) {
    if (!n.busy) continue;
    n.t += t;
    let o = n.t / n.ttl;
    if (o >= 1) {
      n.busy = !1, n.mesh.visible = !1;
      continue;
    }
    n.mesh.scale.setScalar(n.size * (0.4 + 1.8 * o)), n.mat.opacity = 1 - o;
  }
}
function Ys(e, t, n, o) {
  let r = n.keys,
    a = 0,
    s = 0;
  (r.has("a") || r.has("arrowleft")) && (a -= 1), (r.has("d") || r.has("arrowright")) && (a += 1), (r.has("w") || r.has("arrowup")) && (s += 1), (r.has("s") || r.has("arrowdown")) && (s -= 1);
  let i = Math.hypot(a, s);
  i > 1e-4 && (a /= i, s /= i, t.shipX += a * b.finale.shipSpeed * o, t.shipY += s * b.finale.shipSpeed * o);
  let l = _t(e, n.pointer, "breach");
  return l && (t.shipX += l.x, t.shipY += l.y, a = Math.max(-1, Math.min(1, l.x / 40))), t.shipX = Math.min(Un, Math.max(-Un, t.shipX)), t.shipY = Math.min(qn, Math.max(-qn, t.shipY)), a;
}
function ea(e) {
  return b.finale.burstCount + Math.min(8, e.tier * 2);
}
function $s(e) {
  return 1 + (e.tier >= 3 ? 2 : e.tier >= 1 ? 1 : 0);
}
function Ws(e) {
  let t = e.weaponLevel,
    n = e.blastCharge.active,
    o = Math.min(Math.max(t, 1), b.player.fire.length) - 1;
  return {
    interval: (b.player.fire[o] ?? 0.22) * (n ? 0.6 : 1),
    dmg: (t >= 7 ? 3 : t >= 3 ? 2 : 1) + (n ? 1 : 0),
    wings: t >= 2,
    heavy: t >= 3,
    outer: t >= 5
  };
}
function Lt(e, t, n) {
  let o = e.boss,
    r = !!o && o.phase === "weakpoints" && e.status === "running",
    a = _o.get(t);
  if (!r) {
    if (a) if (a.shown && Po(t, a), t.bossVisual && (t.bossVisual.group.visible = !0), t.root.visible = !0, t.bg.visible = !0, a.returnT > 0) {
      a.returnT = Math.max(0, a.returnT - n);
      let g = Ao(a.returnT / aa),
        k = e.player;
      tt(t.root, k.x, k.y, Vo * g, 1 + (No - 1) * g, k.x + (a.returnFromX - k.x) * g, k.y + (a.returnFromY - k.y) * g), t.bg.rotation.copy(t.root.rotation), t.bg.scale.copy(t.root.scale), t.bg.position.copy(t.root.position);
    } else tt(t.root, 0, 0, 0, 1, 0, 0), tt(t.bg, 0, 0, 0, 1, 0, 0);
    return;
  }
  let s = a ?? Xs(t),
    i = o.finale,
    l = b.finale,
    c = e.player;
  o.t += n, o.patternT += n;
  let u = Ao(Math.min(1, o.t / (l.introDuration + _s)));
  if (!s.shown) {
    s.set.visible = !0, s.ship.group.visible = !1, t.bossVisual && (t.bossVisual.group.visible = !1), t.playerShip.group.visible = !0, t.playerShip.setThrust(1), t.playerShip.update?.(n);
    let g = Ao(Math.min(1, o.t / l.introDuration));
    tt(t.root, c.x, c.y, Vo * g, 1 + (No - 1) * g, c.x + (Qn - c.x) * g, c.y + (Zn - c.y) * g), t.bg.rotation.copy(t.root.rotation), t.bg.scale.copy(t.root.scale), t.bg.position.copy(t.root.position), g >= 1 && (t.root.visible = !1, tt(t.root, 0, 0, 0, 1, 0, 0), s.shown = !0, s.ship.group.visible = !0, i.shipX = Qn, i.shipY = Zn);
  }
  s.hitFlashMat.opacity = Math.max(0, s.hitFlashMat.opacity - 2.2 * n), s.hitFlash.visible = s.hitFlashMat.opacity > 0.01, c.invuln > 0 && (c.invuln = Math.max(0, c.invuln - n));
  let m = Math.sin(o.patternT * Kn) * As,
    h = ta + Math.sin(o.patternT * Ls) * Ps,
    E = oa + Math.sin(o.patternT * 0.31) * 20 - (1 - u) * 520;
  s.head.scale.setScalar(Do * (0.45 + 0.55 * u)), s.world.position.set(-i.shipX * Se, -i.shipY * Se, 0), s.stars.position.set(-i.shipX * Se * Wn, -i.shipY * Se * Wn, 0), s.head.position.set(m, h, E), s.head.rotation.z = -Math.cos(o.patternT * Kn) * 0.09;
  for (let g = 0; g < s.tail.length; g++) s.tail[g].position.set(m + Math.sin(o.patternT * 1.1 - g * 0.65) * (28 + g * 22), h + 92 + g * 46 + Math.sin(o.patternT * 0.9 - g * 0.5) * 12, E - 90 - g * 66);
  for (let g of s.asteroids) g.group.position.y -= g.fall * n, g.update(n), g.group.position.y < -520 && (g.group.position.y += 1040, g.group.position.x = (Math.random() - 0.5) * 1700);
  s.headUpdate(n);
  let d = i.nodes.filter(g => g.alive).length;
  if (d === 0 && !i.shieldDown && (i.shieldDown = !0, s.shieldPopT = 0.45, z(e, {
    type: "boss-phase",
    phase: "shield-down"
  })), s.shield.position.set(m, h, E + 30), s.shieldPopT > 0) {
    s.shieldPopT = Math.max(0, s.shieldPopT - n);
    let g = 1 - s.shieldPopT / 0.45;
    s.shield.visible = !0, s.shield.scale.setScalar(Fo * (1 + g * 0.8)), s.shieldMat.opacity = 0.3 * (1 - g);
  } else !i.shieldDown && u > 0.9 ? (s.shield.visible = !0, s.shield.scale.setScalar(Fo + Math.sin(o.patternT * 2.3) * 8), s.shieldMat.opacity = 0.09 + Math.sin(o.patternT * 3.1) * 0.03 + (1 - d / (i.nodes.length || 1)) * 0.06) : s.shield.visible = !1;
  if (!s.shown) {
    s.crosshair.group.visible = !1, Oo(s, i, m, h, n, u), Io(s, i, n), Lo(s, n);
    return;
  }
  let w = c.alive ? Ys(e, i, t, n) : 0;
  s.bank += (w - s.bank) * Math.min(1, n * 10);
  let f = s.ship;
  f.group.position.set(i.shipX, i.shipY, qe), f.group.rotation.z = -s.bank * 0.12, f.setBank(s.bank), f.setThrust(1), f.setWeaponLevel(e.weaponLevel), f.setBlastCharge(e.blastCharge.active);
  let M = c.invuln > 0 && Math.floor(e.time * 12) % 2 === 1;
  f.group.visible = c.alive && !M, f.update?.(n);
  let x = i.shipX * Yn,
    T = i.shipY * Yn + $n;
  if (i.shieldDown && i.headHp <= 0) {
    i.hazards.length = 0, i.outroT += n, s.crosshair.group.visible = !1, s.head.position.x += Math.sin(i.outroT * 41) * 7, s.head.position.y += Math.sin(i.outroT * 33) * 5;
    let g = 0.28;
    if (Math.floor(i.outroT / g) > Math.floor((i.outroT - n) / g)) {
      let k = i.nodes[Math.floor(Math.random() * i.nodes.length)];
      Ve(s, m + k.x + (Math.random() - 0.5) * 90 - i.shipX * Se, h + k.y + (Math.random() - 0.5) * 90 - i.shipY * Se, 120, p.molten, 0.5, yt - 40), t.sfx("boomS", {
        volume: 0.7,
        rate: 0.85 + Math.random() * 0.3
      }), t.shake.shake(0.3);
    }
    i.outroT >= l.outroDuration && (Jn(s, i), Po(t, s), o.phase = "dying", o.t = 0), Oo(s, i, m, h, n, u), Io(s, i, n), Lo(s, n);
    return;
  }
  if (i.timeLeft -= n, i.timeLeft <= 0) {
    Jn(s, i), Po(t, s), o.phase = "active", o.t = 0;
    let g = Math.ceil(o.segments.length / 2);
    for (let k = o.segments.length - g; k < o.segments.length; k++) {
      let X = o.segments[k];
      X.alive = !0, X.hp = Math.ceil(o.segmentMaxHp * l.recoverFrac);
    }
    o.hurtFlash = 0.3, z(e, {
      type: "boss-phase",
      phase: "recovered"
    });
    return;
  }
  if (c.alive && u >= 1 && e.bombs > 0 && t.pressed.has(" ")) if (e.bombs--, i.hazards.length = 0, i.burstLeft = 0, z(e, {
    type: "bomb",
    x: c.x,
    y: c.y
  }), Ve(s, i.shipX, i.shipY, 240, p.gold, 0.5, qe), i.shieldDown) i.headHp > 0 && (i.headHp = Math.max(0, i.headHp - l.bombDamage), s.headFlash());else for (let g = 0; g < i.nodes.length; g++) {
    let k = i.nodes[g];
    if (!k.alive) continue;
    k.hp -= l.bombDamage, s.nodes[g]?.flashHit();
    let X = m + k.x - i.shipX * Se,
      Z = h + k.y - i.shipY * Se;
    Ve(s, X, Z, 90, p.molten, 0.4, yt + 10), k.hp <= 0 && (k.hp = 0, k.alive = !1, Ve(s, X, Z, 150, p.magenta, 0.55, yt + 10), z(e, {
      type: "kill",
      kind: "power-node",
      x: c.x,
      y: c.y,
      score: l.nodeScore
    }));
  }
  if (i.hazardCd -= n, i.hazardCd <= 0 && c.alive && u >= 1 && i.burstLeft <= 0 && (i.hazardCd = Math.max(1.05, l.hazardEvery - 0.1 * ke(e) - 0.25 * e.tier), i.volley++, i.burstLeft = ea(e), i.burstCd = 0, i.burstX = i.shipX, i.burstY = i.shipY), i.burstLeft > 0 && c.alive) {
    i.burstCd -= n;
    let g = $s(e),
      k = ea(e);
    for (; i.burstCd <= 0 && i.burstLeft > 0;) {
      let X = Math.max(0, k - i.burstLeft),
        Z = i.volley % 2 === 0 ? 1 : -1,
        O = Math.floor(X / g),
        se = Math.max(1, Math.ceil(k / g) - 1),
        ie = Z * O * 0.72 + i.volley * 1.31 + X % g * (Math.PI * 2 / g),
        de = l.spiralRadius * (1 - O / se),
        A = m - i.shipX * Se,
        ge = h + Cs - i.shipY * Se;
      i.hazards.push({
        kind: "bolt",
        sx: A,
        sy: ge,
        tx: i.burstX + Math.cos(ie) * de,
        ty: i.burstY + Math.sin(ie) * de,
        t: 0
      }), i.burstLeft--, i.burstCd += l.burstGap, t.sfx("shot", {
        volume: 0.18,
        rate: 1.25 + X * 0.04
      });
    }
    i.hazards.length > zo && i.hazards.splice(0, i.hazards.length - zo);
  }
  let y = l.boltTravel * Math.max(0.72, 1 - 0.05 * e.tier);
  for (let g = i.hazards.length - 1; g >= 0; g--) {
    let k = i.hazards[g],
      X = k.t;
    if (k.t += n / (k.kind === "bolt" ? y : l.hazardTravel), X < 1 && k.t >= 1) {
      let Z = k.kind === "bolt" ? l.hazardRadius * 0.8 : l.hazardRadius;
      if (c.alive && c.invuln <= 0 && Math.hypot(k.tx - i.shipX, k.ty - i.shipY) < Z) {
        bt(e), f.flashHit(), s.hitFlashMat.opacity = 0.55, s.hitFlash.visible = !0, Ve(s, i.shipX, i.shipY, 140, p.crimson, 0.45, qe + 8), i.hazards[g] = i.hazards[i.hazards.length - 1], i.hazards.pop();
        continue;
      }
    }
    k.t >= Vs && (i.hazards[g] = i.hazards[i.hazards.length - 1], i.hazards.pop());
  }
  let R = -1;
  for (let g = 0; g < i.nodes.length; g++) {
    let k = i.nodes[g];
    if (k.alive && Math.hypot(m + k.x - x, h + k.y - T) <= l.shotRadius + l.nodeRadius) {
      R = g;
      break;
    }
  }
  let S = i.shieldDown && i.headHp > 0 && Math.hypot(m - x, h - T) <= l.shotRadius + Ns,
    H = Ws(e);
  if (i.fireCd -= n, i.fireCd <= 0 && c.alive && u >= 1) {
    i.fireCd = H.interval;
    let g = i.shipY - 6,
      k = i.shipY + $n,
      X = e.blastCharge.active,
      Z = X ? p.gold : p.cyan;
    H.wings ? (et(s.plasmaShots, i.shipX - 30, g, i.shipX - 4, k, gt, 1), et(s.plasmaShots, i.shipX + 30, g, i.shipX + 4, k, gt, 1), Ve(s, i.shipX - 30, g, 18, Z, 0.1, qe + 6), Ve(s, i.shipX + 30, g, 18, Z, 0.1, qe + 6)) : (s.shotSide = -s.shotSide, et(s.plasmaShots, i.shipX + 30 * s.shotSide, g, i.shipX, k, gt, 1), Ve(s, i.shipX + 30 * s.shotSide, g, 18, Z, 0.1, qe + 6)), H.heavy && (et(s.heavyShots, i.shipX - 40, g - 4, i.shipX - 20, k - 6, 0.33, 0.95), et(s.heavyShots, i.shipX + 40, g - 4, i.shipX + 20, k - 6, 0.33, 0.95)), H.outer && (et(s.plasmaShots, i.shipX - 48, g - 8, i.shipX - 10, k + 4, gt, 0.85), et(s.plasmaShots, i.shipX + 48, g - 8, i.shipX + 10, k + 4, gt, 0.85)), X && et(s.beamShots, i.shipX, g + 16, i.shipX, k + 12, 0.36, 0.55), t.sfx("shot", {
      volume: 0.22,
      rate: (X ? 0.9 : 1.05) + Math.random() * 0.15
    });
    let O = i.nodes[R];
    if (O) {
      O.hp -= H.dmg, s.nodes[R]?.flashHit();
      let se = m + O.x - i.shipX * Se,
        ie = h + O.y - i.shipY * Se;
      Ve(s, se, ie, 34, p.gold, 0.2, yt + 10), O.hp <= 0 && (O.hp = 0, O.alive = !1, Ve(s, se, ie, 150, p.magenta, 0.55), z(e, {
        type: "kill",
        kind: "power-node",
        x: c.x,
        y: c.y,
        score: l.nodeScore
      }));
    } else S && (i.headHp = Math.max(0, i.headHp - H.dmg), s.headFlash(), Ve(s, m - i.shipX * Se + (Math.random() - 0.5) * 70, h - i.shipY * Se + (Math.random() - 0.5) * 70, 44, p.gold, 0.2, yt - 20));
  }
  s.crosshair.group.visible = u >= 1, s.crosshair.group.position.set(x, T, na), s.crosshair.setLocked(R >= 0 || S), s.crosshair.update(n), Oo(s, i, m, h, n, u), Io(s, i, n), Lo(s, n);
}
function Oo(e, t, n, o, r, a) {
  for (let s = 0; s < e.nodes.length; s++) {
    let i = e.nodes[s],
      l = t.nodes[s];
    if (!l || a < 0.9) {
      i.group.visible = !1;
      continue;
    }
    i.group.visible = !0, i.group.position.set(n + l.x, o + l.y, yt), i.setAlive(l.alive), i.update(r);
  }
}
function Io(e, t, n) {
  for (let o = 0; o < e.orbs.length; o++) {
    let r = e.orbs[o],
      a = t.hazards[o];
    if (!a) {
      r.orb.group.visible = !1, r.dart.group.visible = !1;
      continue;
    }
    let s = a.t,
      i = a.kind === "bolt" ? r.dart : r.orb,
      l = a.kind === "bolt" ? r.orb : r.dart;
    l.group.visible = !1, i.group.visible = !0, i.group.position.set(a.sx + (a.tx - a.sx) * s, a.sy + (a.ty - a.sy) * s, jn + (Fs - jn) * s), i.group.scale.setScalar(a.kind === "bolt" ? 0.75 + 0.35 * s * s : 0.7 + 0.5 * s * s), a.kind === "bolt" && (i.group.rotation.z = Math.atan2(a.ty - a.sy, a.tx - a.sx) - Math.PI / 2), i.update(n);
  }
}
function no(e, t) {
  e.chainTimer > 0 && (e.chainTimer -= t, e.chainTimer <= 0 && (e.chainTimer = 0, e.chain = 0));
  let n = e.events.length;
  for (let o = 0; o < n; o++) {
    let r = e.events[o];
    if (r.type !== "kill") continue;
    e.chain++, e.chain > e.bestChain && (e.bestChain = e.chain), e.chainTimer = b.chain.window;
    let a = 1 + Math.min(e.chain, 60) * 0.06;
    e.blastCharge.active && (a *= b.blastCharge.scoreMult), e.score += Math.round(r.score * a), e.blastCharge.active || (e.blastCharge.charge = Math.min(1, e.blastCharge.charge + b.blastCharge.chargePerKill)), b.chain.milestones.includes(e.chain) ? z(e, {
      type: "chain",
      value: e.chain,
      milestone: !0
    }) : e.chain % 5 === 0 && z(e, {
      type: "chain",
      value: e.chain,
      milestone: !1
    });
  }
}
var Ks = 30,
  Us = new Set(["bomber", "elite", "boss-segment"]),
  qs = 12;
function ao(e, t, n) {
  Qs(e), Zs(e, t, n), Js(e);
}
function Xo(e, t, n, o) {
  e.pickups.push({
    id: Ee(e),
    kind: t,
    x: n,
    y: o,
    vx: 0,
    vy: -b.pickups.fallSpeed,
    t: 0
  });
}
function js(e, t) {
  let o = e.weaponLevel < b.weapons.maxLevel && e.time >= e.weaponLevel * qs;
  return o && (t === "bomber" || t === "elite") && Math.random() < 0.45 || o && (e.spawn.waveIndex % 4 === 0 || Math.random() < 0.25) ? "weapon" : e.bombs < b.bombs.max && Math.random() < 0.3 ? "bomb" : "shard";
}
function Qs(e) {
  let t = e.events.length;
  for (let n = 0; n < t; n++) {
    let o = e.events[n];
    if (o.type !== "kill") continue;
    if (o.kind === "boss-segment") {
      Xo(e, "shard", o.x - 26, o.y), Xo(e, "weapon", o.x + 26, o.y), e.spawn.pityMisses = 0;
      continue;
    }
    let r = Us.has(o.kind);
    if (!r && (r = Math.random() < b.pickups.dropChance || e.spawn.pityMisses >= b.pickups.guaranteedBy, !r)) {
      e.spawn.pityMisses++;
      continue;
    }
    e.spawn.pityMisses = 0, Xo(e, js(e, o.kind), o.x, o.y);
  }
}
function Zs(e, t, n) {
  let {
      halfH: o
    } = he(t),
    r = -o - b.field.cullMargin,
    a = e.player,
    s = b.pickups.magnetRadius * b.pickups.magnetRadius;
  for (let i = e.pickups.length - 1; i >= 0; i--) {
    let l = e.pickups[i];
    l.t += n;
    let c = a.x - l.x,
      u = a.y - l.y,
      m = c * c + u * u;
    if (a.alive && m < s && m > 1e-4) {
      let h = Math.sqrt(m),
        E = b.pickups.magnetSpeed,
        d = Math.min(1, n * 8);
      l.vx += (c / h * E - l.vx) * d, l.vy += (u / h * E - l.vy) * d;
    } else l.vx = Math.sin(l.t * 1.8 + l.id * 1.3) * 30, l.vy += (-b.pickups.fallSpeed - l.vy) * Math.min(1, n * 3);
    l.x += l.vx * n, l.y += l.vy * n, (l.t > b.pickups.lifetime || l.y < r) && sa(e.pickups, i);
  }
}
function Js(e) {
  let t = e.player;
  if (!t.alive) return;
  let n = Ks + b.player.radius;
  for (let o = e.pickups.length - 1; o >= 0; o--) {
    let r = e.pickups[o],
      a = r.x - t.x,
      s = r.y - t.y;
    a * a + s * s >= n * n || (ei(e, r), z(e, {
      type: "pickup",
      kind: r.kind,
      x: r.x,
      y: r.y
    }), sa(e.pickups, o));
  }
}
function ei(e, t) {
  t.kind === "weapon" ? e.weaponLevel < b.weapons.maxLevel ? (e.weaponLevel++, z(e, {
    type: "weapon",
    level: e.weaponLevel
  })) : e.score += 2e3 : t.kind === "bomb" ? e.bombs = Math.min(b.bombs.max, e.bombs + 1) : e.blastCharge.charge = Math.min(1, e.blastCharge.charge + b.blastCharge.chargePerShard);
}
function sa(e, t) {
  e[t] = e[e.length - 1], e.pop();
}
function ro(e, t, n) {
  if (e.status !== "running" || !e.player.alive || e.bombs <= 0 || !t.pressed.has(" ")) return;
  e.bombs--, e.enemyBolts.length = 0;
  for (let r = e.enemies.length - 1; r >= 0; r--) {
    let a = e.enemies[r];
    a.hp -= b.bombs.damage, a.hp <= 0 && (z(e, {
      type: "kill",
      kind: a.kind,
      x: a.x,
      y: a.y,
      score: b.enemies[a.kind].score
    }), e.enemies.splice(r, 1));
  }
  for (let r of e.capitalTurrets) r.alive && (r.hp -= b.bombs.damage, r.hp <= 0 && (r.hp = 0, r.alive = !1, z(e, {
    type: "kill",
    kind: "capital-turret",
    x: r.x,
    y: r.y,
    score: b.capital.turretScore
  })));
  let o = e.boss;
  if (o && (o.phase === "entering" || o.phase === "active")) {
    for (let a of o.segments) a.alive && (a.hp -= 6, a.hp <= 0 && (a.hp = 0, a.alive = !1, z(e, {
      type: "kill",
      kind: "boss-segment",
      x: a.x,
      y: a.y,
      score: 500
    }), z(e, {
      type: "boss-phase",
      phase: "segment-down"
    })));
    o.phase === "active" && o.segments.every(a => !a.alive) && (o.headHp -= 4, z(e, {
      type: "boss-phase",
      phase: "hurt"
    })), o.hurtFlash = Math.max(o.hurtFlash, 0.3);
  }
  z(e, {
    type: "bomb",
    x: e.player.x,
    y: e.player.y
  });
}
function so(e, t, n) {
  let o = e.blastCharge;
  (t.pressed.has("shift") || t.pressed.has("e")) && o.charge >= 1 && !o.active && e.player.alive && (o.active = !0, o.timer = b.blastCharge.duration, e.player.invuln = Math.max(e.player.invuln, 1), z(e, {
    type: "blastCharge",
    on: !0
  })), o.active && (o.timer -= n, o.timer <= 0 ? (o.timer = 0, o.active = !1, o.charge = 0, z(e, {
    type: "blastCharge",
    on: !1
  })) : o.charge = o.timer / b.blastCharge.duration);
}
var ti = 1.4,
  oi = 4;
function ia(e, t, n) {
  let o = e.player;
  o.hp <= 0 && o.alive ? (o.alive = !1, o.deadFor = 0, t.fx.explosion(o.x, o.y, oi, p.crimson), t.shake.shake(0.9), t.sfx("boomB")) : !o.alive && e.status === "running" && (o.deadFor += n, o.deadFor >= ti && (e.status = "gameover", z(e, {
    type: "gameover"
  }))), e.status === "gameover" && !e.gameOverSent && (e.gameOverSent = !0, t.game.gameOver(Math.floor(e.score)));
}
import * as je from "./vendor/002-three.js";
import * as U from "./vendor/002-three.js";
import { seededRandom as Wo } from "./vendor/006-three.js";
var la = 1500,
  io = 2400;
function $e(e, t) {
  return `rgba(${e >> 16 & 255},${e >> 8 & 255},${e & 255},${t})`;
}
var ca = new Map();
function pa(e, t) {
  let n = `${e}:${t}`,
    o = ca.get(n);
  if (o) return o;
  let r = ht(e);
  return o = Te(1024, 1024, (a, s, i) => {
    let l = Wo(e * 17 + t * 5 + 3);
    a.fillStyle = $e(p.void, 1), a.fillRect(0, 0, s, i);
    let c = [r.haze, r.primary, r.secondary, r.primary];
    for (let u = 0; u < 30; u++) {
      let m = c[u % 4],
        h = l() * s,
        E = l() * i,
        d = 80 + l() * 280,
        w = (u % 4 === 0 ? 0.22 : 0.07) + l() * 0.09,
        f = a.createRadialGradient(h, E, d * 0.08, h, E, d);
      f.addColorStop(0, $e(m, w)), f.addColorStop(1, $e(m, 0)), a.fillStyle = f, a.beginPath(), a.arc(h, E, d, 0, Math.PI * 2), a.fill();
    }
    for (let u = 0; u < 9; u++) {
      a.save(), a.translate(l() * s, l() * i), a.rotate(-0.9 + l() * 0.5);
      let m = 300 + l() * 500,
        h = a.createLinearGradient(-m / 2, 0, m / 2, 0),
        E = u % 2 ? r.secondary : r.primary;
      h.addColorStop(0, $e(E, 0)), h.addColorStop(0.5, $e(E, 0.05 + l() * 0.08)), h.addColorStop(1, $e(E, 0)), a.fillStyle = h, a.fillRect(-m / 2, -14 - l() * 22, m, 28 + l() * 44), a.restore();
    }
  }), ca.set(n, o), o;
}
var Yo = null;
function ni() {
  return Yo || (Yo = Te(512, 512, (e, t, n) => {
    e.beginPath(), e.arc(t / 2, n / 2, t / 2 - 6, 0, Math.PI * 2), e.clip();
    let o = e.createRadialGradient(t * 0.36, n * 0.34, 24, t * 0.5, n * 0.5, t * 0.62);
    o.addColorStop(0, "#3d4c6d"), o.addColorStop(0.55, "#1a2338"), o.addColorStop(1, "#080c18"), e.fillStyle = o, e.fillRect(0, 0, t, n);
    for (let a = 0; a < 5; a++) e.fillStyle = $e(5596300, 0.05 + a % 2 * 0.04), e.beginPath(), e.ellipse(t / 2, n * (0.24 + a * 0.14), t * 0.52, n * (0.045 + a % 3 * 0.02), -0.18, 0, Math.PI * 2), e.fill();
    let r = e.createLinearGradient(t * 0.3, n * 0.22, t * 0.86, n * 0.8);
    r.addColorStop(0, $e(p.ink, 0)), r.addColorStop(0.55, $e(p.ink, 0.25)), r.addColorStop(1, $e(p.ink, 0.94)), e.fillStyle = r, e.fillRect(0, 0, t, n);
  })), Yo;
}
var ai = new U.MeshBasicMaterial({
  color: 461072
});
function $o(e, t) {
  let n = new U.Group();
  for (let [o, r, a, s] of e) {
    let i = new U.Mesh(le(), ai);
    i.position.set(o, r, 0), i.scale.set(a, s, 1), n.add(i);
  }
  for (let [o, r] of t) {
    let a = new U.Mesh(le(), C(p.gold));
    a.position.set(o, r, 1), a.scale.set(7, 4, 1), n.add(a);
  }
  return n;
}
function ua(e, t, n, o) {
  let r = Wo(o),
    a = new U.Group();
  for (let [s, i] of [[Math.ceil(e * 0.62), t], [Math.floor(e * 0.38), t + 1.6]]) {
    let l = new Float32Array(s * 3),
      c = new Float32Array(s * 3),
      u = new U.Color();
    for (let w = 0; w < s; w++) {
      l[w * 3] = (r() - 0.5) * n, l[w * 3 + 1] = (r() - 0.5) * io, l[w * 3 + 2] = 0;
      let f = r();
      u.setHex(f < 0.68 ? 16777215 : f < 0.88 ? p.cyan : p.gold), f >= 0.68 && u.lerp(new U.Color(16777215), 0.35), c[w * 3] = u.r, c[w * 3 + 1] = u.g, c[w * 3 + 2] = u.b;
    }
    let m = new U.BufferGeometry();
    m.setAttribute("position", new U.BufferAttribute(l, 3)), m.setAttribute("color", new U.BufferAttribute(c, 3));
    let h = new U.PointsMaterial({
        size: i,
        sizeAttenuation: !1,
        vertexColors: !0,
        transparent: !0,
        opacity: 0.9,
        depthWrite: !1
      }),
      E = new U.Points(m, h),
      d = new U.Points(m, h);
    d.position.y = io, a.add(E, d);
  }
  return {
    holder: a
  };
}
function ma(e = 0) {
  let t = new U.Group(),
    n = new U.MeshBasicMaterial({
      color: ht(e).haze
    }),
    o = new U.Mesh(le(), n);
  o.scale.set(5200, 4e3, 1), o.position.z = -585, t.add(o);
  let r = new U.Mesh(le(), new U.MeshBasicMaterial({
    map: ni(),
    transparent: !0,
    depthWrite: !1
  }));
  r.scale.set(1240, 1240, 1), r.position.set(520, -300, -560);
  let a = new U.MeshBasicMaterial({
      color: ht(e).primary,
      transparent: !0,
      opacity: 0.75,
      blending: U.AdditiveBlending,
      depthWrite: !1
    }),
    s = new U.Mesh(new U.RingGeometry(0.985, 1.03, 72), a);
  s.scale.setScalar(608), s.position.set(520, -300, -559);
  let i = D(ht(e).primary, 1500);
  i.position.set(520, -300, -561), i.material.opacity = 0.3, t.add(r, s, i);
  let l = $o([[0, 0, 90, 620], [0, 380, 46, 260], [-70, -160, 70, 180], [0, 620, 10, 240]], [[-14, 120], [16, -40], [-8, 300]]);
  l.position.set(-760, -60, -556);
  let c = $o([[0, 0, 720, 110], [-180, 80, 260, 90], [220, 66, 160, 60], [330, 0, 140, 46]], [[-60, 6], [40, 18], [150, -10], [-220, 70]]);
  c.position.set(-140, 330, -556);
  let u = $o([[0, 0, 64, 460], [0, 270, 120, 90], [30, -180, 90, 120]], [[8, 240], [-16, -60]]);
  u.position.set(880, 210, -556), t.add(l, c, u);
  let m = [],
    h = [];
  for (let x = 0; x < 2; x++) {
    let T = new U.MeshBasicMaterial({
        map: pa(e, x),
        transparent: !0,
        opacity: 0.8,
        depthWrite: !1
      }),
      y = new U.Mesh(le(), T);
    y.scale.set(4400, 2500, 1), y.position.z = -520, m.push(T), h.push(y), t.add(y);
  }
  let E = ua(300, 2, 4200, 41);
  E.holder.position.z = -480;
  let d = ua(180, 2.6, 4200, 97);
  d.holder.position.z = -430, t.add(E.holder, d.holder);
  let w = Wo(613),
    f = [0, 1].map(x => {
      let T = D(p.gold, 1);
      return T.position.set(0, 0, -470), T.visible = !1, t.add(T), {
        mesh: T,
        mat: T.material,
        life: 0,
        next: 2 + x * 3 + w() * 4
      };
    });
  function M(x) {
    for (let T = 0; T < 2; T++) {
      let y = (x * 0.06 / la + T * 0.5) % 1;
      h[T].position.y = (0.5 - y) * la * 2, m[T].opacity = 0.78 * Math.sin(y * Math.PI);
    }
    E.holder.position.y = -(x * 0.12 % io), d.holder.position.y = -(x * 0.2 % io);
  }
  return M(0), {
    group: t,
    setTier(x) {
      let T = ht(x);
      for (let y = 0; y < 2; y++) m[y].map = pa(x, y);
      a.color.setHex(T.primary), i.material.color.setHex(T.primary), n.color.setHex(T.haze);
    },
    update(x, T) {
      M(T);
      for (let y of f) if (y.life > 0) {
        y.life -= x;
        let R = Math.max(y.life, 0) / 0.5;
        y.mat.opacity = R, y.mesh.scale.setScalar(10 + (1 - R) * 26), y.life <= 0 && (y.mesh.visible = !1, y.next = 2.5 + w() * 6);
      } else (y.next -= x) <= 0 && (y.life = 0.5, y.mesh.visible = !0, y.mesh.position.set((w() - 0.5) * 1600, 60 + w() * 450, -470));
    }
  };
}
import * as ye from "./vendor/002-three.js";
import * as V from "./vendor/002-three.js";
var fe = new V.BoxGeometry(1, 1, 1),
  ot = new V.CylinderGeometry(1, 1, 1, 10),
  ri = new V.ConeGeometry(1, 1, 8),
  da = new V.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  si = new V.CircleGeometry(1, 12);
function Oe(e, t, n, o, r = "scale", a = !1) {
  let s = {
    speed: t,
    phase: Math.random() * Math.PI * 2,
    min: n,
    max: o,
    mode: r,
    boost: a
  };
  return e.userData.flick = s, e;
}
function ha(e, t, n) {
  let o = 7,
    r = () => (o = o * 16807 % 2147483647) / 2147483647;
  e.fillStyle = "#9aa0b4", e.fillRect(0, 0, t, n);
  for (let a = 0; a < 26; a++) {
    let s = 30 + r() * 70,
      i = 24 + r() * 60,
      l = r() * t,
      c = r() * n;
    e.fillStyle = r() < 0.5 ? "rgba(118,124,146,0.55)" : "rgba(172,178,196,0.45)", e.fillRect(l, c, s, i), e.strokeStyle = "rgba(14,16,26,0.85)", e.lineWidth = 2, e.strokeRect(l, c, s, i);
  }
  e.strokeStyle = "rgba(12,14,24,0.9)", e.lineWidth = 3;
  for (let a = 0; a < 5; a++) {
    let s = r() * t;
    e.beginPath(), e.moveTo(s, 0), e.lineTo(s, n), e.stroke();
  }
  for (let a = 0; a < 18; a++) e.fillStyle = "rgba(30,32,44,0.28)", e.fillRect(r() * t, r() * n, 3 + r() * 5, 30 + r() * 90);
  e.fillStyle = "rgba(18,20,30,0.7)";
  for (let a = 0; a < 60; a++) e.fillRect(r() * t, r() * n, 2, 2);
}
var Ko = null;
function fa() {
  if (!Ko) {
    let e = Te(256, 256, ha);
    e.wrapS = e.wrapT = V.RepeatWrapping, e.repeat.set(1 / 420, 1 / 420), Ko = new V.MeshToonMaterial({
      map: e,
      gradientMap: Ft()
    });
  }
  return Ko;
}
var Uo = null;
function jo() {
  if (!Uo) {
    let e = Te(256, 256, ha);
    e.wrapS = e.wrapT = V.RepeatWrapping, e.repeat.set(1.5, 1.5), Uo = new V.MeshToonMaterial({
      map: e,
      color: 5659762,
      gradientMap: Ft()
    });
  }
  return Uo;
}
var qo = null;
function ii() {
  return qo || (qo = new V.MeshBasicMaterial({
    color: 460814,
    transparent: !0,
    opacity: 0.88,
    depthWrite: !1
  })), qo;
}
function ba(e = 0) {
  let t = new V.Group(),
    n = new V.Mesh(ot, G(p.metal));
  n.rotation.x = Math.PI / 2, n.scale.set(17, 9, 17), n.position.z = 4.5;
  let o = new V.Mesh(fe, G(p.metalLight));
  o.scale.set(32, 26, 13), o.position.z = 13, t.add(n, o);
  for (let r of [-7, 7]) {
    let a = new V.Mesh(ot, G(p.charcoal));
    a.scale.set(3.2, 30, 3.2), a.position.set(r, 26, 14);
    let s = v(new V.Mesh(fe, C(p.cyan)));
    s.scale.set(3.6, 4, 3.6), s.position.set(r, 42, 14), t.add(a, s);
  }
  return t.rotation.z = e, ne(t, 0.09), t;
}
function Ea(e = 200, t = 280, n = 24) {
  let o = new V.Group(),
    r = new V.Mesh(fe, jo());
  r.scale.set(e, t, n), r.position.z = n / 2;
  let a = new V.Mesh(fe, G(p.charcoal));
  a.scale.set(e * 0.62, t * 0.66, n * 0.5), a.position.set(e * 0.06, -t * 0.05, n * 1.25);
  let s = v(new V.Mesh(fe, G(p.metal)));
  return s.scale.set(e * 0.3, t * 0.18, n * 0.3), s.position.set(-e * 0.22, t * 0.28, n * 1.15), o.add(r, a, s), ne(o, 0.05), o;
}
function ya(e = 42) {
  let t = new V.Group(),
    n = new V.Mesh(ot, G(p.metal));
  n.rotation.x = Math.PI / 2, n.scale.set(e * 1.15, 8, e * 1.15), n.position.z = 4;
  let o = new V.Mesh(da, G(p.bone));
  o.rotation.x = Math.PI / 2, o.scale.setScalar(e), o.position.z = 8;
  let r = D(p.gold, e * 3);
  r.position.z = 1.5, Oe(r, 1.7, 0.45, 0.8, "opacity", !0);
  let a = v(new V.Mesh(da, C(p.gold)));
  return a.rotation.x = Math.PI / 2, a.scale.setScalar(e * 0.3), a.position.z = e * 0.95, Oe(a, 2.3, 0.85, 1.2, "scale", !0), t.add(n, o, r, a), ne(t, 0.06), t;
}
function ga(e = 120, t = 74) {
  let n = new V.Group(),
    o = v(new V.Mesh(fe, C(263435)));
  o.scale.set(e, t, 3), o.position.z = 1.4, n.add(o);
  for (let r of [-1, 1]) {
    let a = v(new V.Mesh(fe, G(p.metal)));
    a.scale.set(e + 10, 7, 6), a.position.set(0, r * (t / 2 + 3), 3), n.add(a);
  }
  for (let r = 0; r < 5; r++) {
    let a = v(new V.Mesh(fe, C(r % 2 ? p.gold : p.cyan)));
    a.scale.setScalar(3.4), a.position.set(-e / 2 + 14 + r * ((e - 28) / 4), (r % 2 ? -1 : 1) * t * 0.22, 2.6), Oe(a, 2 + r * 1.1, 0.55, 1.3), n.add(a);
  }
  return n;
}
function Ta(e = 6) {
  let t = new V.Group();
  for (let n = 0; n < e; n++) {
    let o = 10 + n * 37 % 17,
      r = n * 53 % 40 - 20,
      a = n * 29 % 44 - 22,
      s = v(new V.Mesh(ot, G(p.charcoal)));
    s.rotation.x = Math.PI / 2, s.scale.set(1.1, o, 1.1), s.position.set(r, a, o / 2);
    let i = v(new V.Mesh(fe, C(p.crimson)));
    i.scale.setScalar(1.6), i.position.set(r, a, o + 1), n % 2 === 0 && Oe(i, 3 + n * 0.7, 0.6, 1.4), t.add(s, i);
  }
  return t;
}
function Ma() {
  let e = new V.Group(),
    t = new V.Mesh(fe, G(p.metal));
  t.scale.set(560, 46, 60), t.position.set(0, -8, 6), e.add(t);
  for (let n of [-195, -65, 65, 195]) {
    let o = new V.Mesh(ot, G(p.charcoal));
    o.scale.set(34, 60, 34), o.position.set(n, -46, 10);
    let r = v(new V.Mesh(ot, G(p.metalLight)));
    r.scale.set(38, 10, 38), r.position.set(n, -74, 10);
    let a = v(new V.Mesh(ri, C(p.molten)));
    a.rotation.z = Math.PI, a.scale.set(24, 130, 24), a.position.set(n, -140, 10), Oe(a, 9 + Math.abs(n) * 0.01, 0.82, 1.12);
    let s = D(p.molten, 190);
    s.position.set(n, -120, 12), Oe(s, 6, 0.4, 0.8, "opacity"), e.add(o, r, a, s);
  }
  return ne(e, 0.05), e;
}
function va(e = 44) {
  let t = new V.Group(),
    n = v(new V.Mesh(si, ii()));
  n.scale.setScalar(e * 1.5), n.position.z = 1.8;
  let o = D(p.molten, e * 1.7);
  o.position.z = 2.4, Oe(o, 11, 0.35, 0.85, "opacity");
  let r = D(p.crimson, e * 0.8);
  r.position.set(e * 0.2, e * 0.15, 2.8), Oe(r, 17, 0.3, 0.95, "opacity");
  let a = v(new V.Mesh(fe, C(p.gold)));
  return a.scale.setScalar(3), a.position.set(-e * 0.3, e * 0.2, 2.5), Oe(a, 13, 0.5, 1.6), t.add(n, o, r, a), t;
}
var li = 2e3,
  xa = [0.25, 0.5, 0.75],
  ci = [[-140, 560, 150, 220, 24], [150, 470, 170, 260, 22], [-220, 120, 230, 340, 30], [225, -60, 240, 300, 24], [-205, -430, 215, 310, 22], [215, -580, 225, 260, 26], [-160, -800, 190, 180, 18], [155, -790, 170, 190, 20]],
  pi = [[-120, 610, 24, 2.6], [130, 520, 22, -2.9], [-265, 430, 0, 2.2], [258, 240, 0, -2.4], [-225, 60, 30, 3.1], [230, -120, 24, -3], [-260, -260, 0, 2], [260, -480, 26, -2.2], [0, 810, 0, 3.14]],
  ui = [[-140, -160, 44], [148, 260, 38], [105, -690, 30]],
  mi = [[-278, 350, 0.08], [280, 160, -0.08], [-278, -180, 0.05]],
  di = [[-90, 700], [70, 640], [-70, -350], [100, -930]],
  hi = [[0, -160, 420, 0, 46], [0, 210, -140, 24, 40], [0, 40, -690, 0, 52], [1, -235, -330, 22, 56], [1, 120, 560, 22, 44], [1, -80, 150, 0, 38], [2, 0, -935, 0, 60], [2, 235, 330, 0, 50], [2, -215, -620, 0, 55]],
  Qo = null;
function fi() {
  if (!Qo) {
    let e = new ye.Shape();
    e.moveTo(0, 1e3), e.lineTo(-200, 700), e.lineTo(-350, 300), e.lineTo(-350, -700), e.lineTo(-260, -1e3), e.lineTo(260, -1e3), e.lineTo(350, -700), e.lineTo(350, 300), e.lineTo(200, 700), e.closePath(), Qo = new ye.ExtrudeGeometry(e, {
      depth: 46,
      bevelEnabled: !1
    });
  }
  return Qo;
}
function bi(e) {
  let t = v(new ye.Mesh(fe, C(263693)));
  t.scale.set(96, 1300, 2), t.position.set(0, -130, 0.6), e.add(t);
  for (let n of [-1, 1]) {
    let o = new ye.Mesh(fe, G(p.charcoal));
    o.scale.set(14, 1300, 12), o.position.set(n * 55, -130, 5), Ze(o, 0.012);
    let r = v(new ye.Mesh(fe, C(p.cyan)));
    r.scale.set(3.5, 1260, 1.6), r.position.set(n * 42, -130, 1.5), Oe(r, 1.3, 0.97, 1.03), e.add(o, r);
  }
  for (let n = 0; n < 8; n++) {
    let o = v(new ye.Mesh(ot, G(p.metalLight)));
    o.rotation.z = Math.PI / 2, o.scale.set(5, 134, 5), o.position.set(0, -710 + n * 168, 9), e.add(o);
  }
}
function Ei(e) {
  let t = new ye.Mesh(fe, jo());
  t.scale.set(96, 150, 40), t.position.set(0, 620, 20), Ze(t, 0.05);
  let n = new ye.Mesh(fe, G(p.bone));
  n.scale.set(60, 70, 26), n.position.set(0, 600, 53), Ze(n, 0.07);
  let o = v(new ye.Mesh(fe, C(p.cyan)));
  o.scale.set(50, 6, 5), o.position.set(0, 566, 58), Oe(o, 2.1, 0.9, 1.08), e.add(t, n, o);
}
function Ra() {
  let e = new ye.Group(),
    t = new ye.Group();
  t.rotation.x = -0.05, e.add(t);
  let n = new ye.Mesh(fi(), fa());
  n.position.z = -46, Ze(n, 0.014), t.add(n), bi(t), Ei(t);
  for (let [c, u, m, h, E] of ci) {
    let d = Ea(m, h, E);
    d.position.set(c, u, 0), t.add(d);
  }
  let o = [];
  for (let [c, u, m, h] of pi) {
    let E = ba(h);
    E.position.set(c, u, m), t.add(E), o.push(E);
  }
  for (let [c, u, m] of ui) {
    let h = ya(m);
    h.position.set(c, u, 0), t.add(h);
  }
  for (let [c, u, m] of mi) {
    let h = ga();
    h.position.set(c, u, 0), h.rotation.z = m, t.add(h);
  }
  for (let [c, u] of di) {
    let m = Ta();
    m.position.set(c, u, 0), t.add(m);
  }
  let r = Ma();
  r.position.y = -990, t.add(r);
  let a = xa.map(() => {
    let c = new ye.Group();
    return c.visible = !1, t.add(c), c;
  });
  for (let [c, u, m, h, E] of hi) {
    let d = va(E);
    d.position.set(u, m, h), a[c]?.add(d);
  }
  let s = [];
  t.traverse(c => {
    let u = c.userData.flick;
    u && s.push({
      o: c,
      base: c.scale.clone(),
      f: u
    });
  });
  let i = Math.random() * 100,
    l = 0;
  return {
    group: e,
    length: li,
    update(c) {
      i += c;
      for (let u of s) {
        let m = u.f,
          h = 0.5 + 0.5 * Math.sin(i * m.speed + m.phase) * Math.sin(i * m.speed * 0.37 + m.phase * 2.1);
        m.boost && (h = Math.min(1, h * (0.7 + l * 1.6)));
        let E = m.min + (m.max - m.min) * h;
        m.mode === "opacity" ? u.o.material.opacity = E : u.o.scale.set(u.base.x * E, u.base.y * E, u.base.z * E);
      }
    },
    setDamage(c) {
      l = Math.min(1, Math.max(0, c)), a.forEach((u, m) => {
        u.visible = l >= (xa[m] ?? 1);
      });
    },
    setTurretState(c, u, m) {
      let h = o[c];
      if (!h) return;
      h.visible = u;
      let E = 1 - Math.min(1, Math.max(0, m)) * 0.22;
      h.scale.setScalar(E);
    }
  };
}
var wa = 10,
  co = 1600,
  yi = 3,
  Zo = 420,
  gi = -180,
  lo = new je.BoxGeometry(1, 1, 1);
function Ha(e) {
  return (Math.random() < 0.5 ? -1 : 1) * (250 + Math.random() * (e + 100 - 250));
}
function Ti() {
  let e = new je.Group(),
    t = new je.Mesh(lo, G(p.charcoal));
  t.scale.set(38, 760, 34), e.add(t);
  let n = new je.Mesh(lo, G(p.metal));
  n.scale.set(26, 540, 24), n.position.set(64, 40, -10), n.rotation.z = 0.08, e.add(n);
  for (let r = 0; r < 4; r++) {
    let a = new je.Mesh(lo, G(p.charcoal));
    a.scale.set(120, 20, 18), a.position.set(30, -280 + r * 180, 0), a.rotation.z = r % 2 === 0 ? -0.5 : 0.5, e.add(a);
  }
  let o = new je.Mesh(lo, G(p.metal));
  return o.scale.set(90, 64, 40), o.position.set(-40, 210, 6), e.add(o), ne(e, 0.06), e;
}
function Sa(e) {
  let {
      halfW: t,
      halfH: n
    } = he(e),
    o = ma(0);
  e.bg.add(o.group);
  let r = Ra();
  r.group.position.set(b.capital.x, n + 1100, gi), r.group.rotation.z = Math.PI, r.group.visible = !1, e.bg.add(r.group);
  let a = [];
  for (let l = 0; l < wa; l++) {
    let c = oo(l, 50 + Math.random() * 80);
    c.group.position.set(Ha(t), -co / 2 + (l + Math.random()) / wa * co, -40), e.bg.add(c.group), a.push(c);
  }
  let s = [];
  for (let l = 0; l < yi; l++) {
    let c = Ti(),
      u = l % 2 === 0 ? -1 : 1;
    c.position.set(u * (t - 30 - Math.random() * 90), n + Zo + 600 + l * (1600 + Math.random() * 2200), 70), c.rotation.z = (Math.random() - 0.5) * 0.3, e.bg.add(c), s.push(c);
  }
  let i = {
    nebula: o,
    capital: r,
    asteroids: a,
    girders: s,
    lastTier: -1
  };
  e.bg.userData.env = i;
}
function Tt(e, t, n) {
  let o = t.bg.userData.env;
  if (!o) return;
  let {
      halfW: r,
      halfH: a
    } = he(t),
    s = 1;
  if (e.env.warpT > 0) {
    e.env.warpT = Math.max(0, e.env.warpT - n);
    let c = 1 - e.env.warpT / b.warp.duration;
    s = 1 + Math.sin(Math.PI * c) * (b.warp.peakMult - 1);
  }
  let i = 120 * (1 + 0.2 * e.tier) * s;
  e.env.scroll += i * n, o.nebula.update(n, e.env.scroll);
  let l = e.env.warpT <= b.warp.duration * 0.5;
  o.lastTier !== e.tier && l && (o.lastTier = e.tier, o.nebula.setTier(e.tier), z(e, {
    type: "sector",
    tier: e.tier
  }));
  for (let c of o.asteroids) c.group.position.y -= i * 0.55 * n, c.update(n), c.group.position.y < -co / 2 && (c.group.position.y += co, c.group.position.x = Ha(r));
  for (let c of o.girders) if (c.position.y -= i * 1.8 * n, c.position.y < -(a + Zo)) {
    let u = Math.random() < 0.5 ? -1 : 1;
    c.position.set(u * (r - 30 - Math.random() * 90), a + Zo + 600 + Math.random() * 3600, 70), c.rotation.z = (Math.random() - 0.5) * 0.3;
  }
  if (e.env.capitalShipOn) {
    e.env.capitalShipT += n;
    let c = Math.min(e.env.capitalShipT / b.interlude.duration, 1);
    o.capital.group.visible = !0, o.capital.group.position.y = a + 1100 - c * (2 * a + 2200), o.capital.setDamage(c * 0.8);
    for (let u = 0; u < b.capital.turrets.length; u++) {
      let m = e.capitalTurrets.find(h => h.index === u);
      o.capital.setTurretState(u, !m || m.alive, m ? 1 - m.hp / m.maxHp : 0);
    }
    o.capital.update(n);
  } else {
    e.env.capitalShipT !== 0 && (e.env.capitalShipT = 0), o.capital.group.visible = !1, o.capital.group.position.y = a + 1100;
    for (let c = 0; c < b.capital.turrets.length; c++) o.capital.setTurretState(c, !0, 0);
  }
}
import * as on from "./vendor/002-three.js";
import * as ue from "./vendor/002-three.js";
function uo(e, t, n, o, r, a, s) {
  for (let i = 0; i <= a * 2; i++) {
    let l = s + i / (a * 2) * Math.PI * 2,
      c = 1 + 0.09 * Math.sin(i * 2.3 + s * 5),
      u = (i % 2 === 0 ? o : r) * c,
      m = t + Math.cos(l) * u,
      h = n + Math.sin(l) * u;
    i === 0 ? e.moveTo(m, h) : e.lineTo(m, h);
  }
  e.closePath();
}
function Jo(e, t, n, o, r, a) {
  let s = r * 7;
  for (let i = 0; i <= s; i++) {
    let l = i / s * Math.PI * 2,
      c = o * (1 + 0.17 * Math.sin(l * r + a) + 0.06 * Math.sin(l * 3 + a * 2)),
      u = t + Math.cos(l) * c,
      m = n + Math.sin(l) * c;
    i === 0 ? e.moveTo(u, m) : e.lineTo(u, m);
  }
  e.closePath();
}
var ka = Te(256, 256, (e, t, n) => {
    e.fillStyle = "#ffffff", e.beginPath(), uo(e, t / 2, n / 2, t * 0.47, t * 0.16, 11, 0.4), e.fill(), e.fillStyle = "#fffbe0", e.beginPath(), uo(e, t / 2, n / 2, t * 0.24, t * 0.1, 8, 1.7), e.fill();
  }),
  Mi = Te(128, 128, (e, t, n) => {
    e.fillStyle = "#e8d8bd", e.beginPath(), Jo(e, t / 2, n / 2, t * 0.4, 9, 1.3), e.fill(), e.fillStyle = "#ffffff", e.beginPath(), Jo(e, t * 0.47, n * 0.53, t * 0.22, 7, 4.1), e.fill();
  }),
  vi = Te(256, 256, (e, t, n) => {
    e.fillStyle = "#ffffff", e.beginPath(), uo(e, t / 2, n / 2, t * 0.47, t * 0.38, 14, 0.2), uo(e, t / 2, n / 2, t * 0.3, t * 0.24, 12, 2.6), e.fill("evenodd");
  }),
  xi = Te(128, 128, (e, t, n) => {
    let o = e.createRadialGradient(t / 2, n / 2, 5, t / 2, n / 2, t * 0.48);
    o.addColorStop(0, "rgba(26,28,38,0.95)"), o.addColorStop(0.55, "rgba(15,16,24,0.8)"), o.addColorStop(1, "rgba(8,9,14,0)"), e.fillStyle = o, e.fillRect(0, 0, t, n), e.fillStyle = "rgba(6,7,12,0.55)", e.beginPath(), Jo(e, t * 0.42, n * 0.58, t * 0.2, 6, 2.2), e.fill();
  }),
  Ri = new ue.TetrahedronGeometry(1, 0),
  wi = new ue.CircleGeometry(1, 24),
  Hi = new ue.MeshBasicMaterial({
    color: 16777215,
    depthWrite: !1,
    depthTest: !1
  }),
  po = 0.06,
  Mt = 6,
  nt = 8,
  Ot = 4;
function Ga() {
  let e = new ue.Group();
  e.visible = !1;
  let t = (f, M, x, T) => {
      M.map = f;
      let y = new ue.Mesh(le(), M);
      return y.renderOrder = x, y.position.z = T, e.add(v(y)), y;
    },
    n = (f, M) => new ue.MeshBasicMaterial({
      color: M,
      transparent: !0,
      blending: f,
      depthWrite: !1,
      depthTest: !1
    }),
    o = n(ue.AdditiveBlending, 16777215),
    r = t(ka, o, 58, 0.9),
    a = t(ka, o, 58, 0.9),
    s = new ue.Mesh(wi, Hi);
  s.renderOrder = 57, s.position.z = 0.6, e.add(v(s));
  let i = n(ue.NormalBlending, p.molten),
    l = Array.from({
      length: Mt
    }, () => t(Mi, i, 55, 0.4)),
    c = n(ue.NormalBlending, p.crimson),
    u = t(vi, c, 54, 0.3),
    m = n(ue.NormalBlending, 16777215),
    h = Array.from({
      length: Ot
    }, () => t(xi, m, 56, 0.2)),
    E = Array.from({
      length: nt
    }, (f, M) => {
      let x = new ue.Mesh(Ri, G(M % 2 === 0 ? p.metal : p.charcoal));
      return Ze(x, 0.16), x.position.z = 0.5, e.add(x), x;
    }),
    d = {
      t: 0,
      dur: 0.7,
      R: 20,
      shardCount: nt,
      flameAng: new Float32Array(Mt),
      flameSpin: new Float32Array(Mt),
      sVX: new Float32Array(nt),
      sVY: new Float32Array(nt),
      sRX: new Float32Array(nt),
      sRZ: new Float32Array(nt),
      sS: new Float32Array(nt),
      smRise: new Float32Array(Ot),
      smS: new Float32Array(Ot)
    },
    w = {
      group: e,
      active: !1,
      spawn(f = 0, M = 0, x = 1, T) {
        let y = 20 * Math.max(0.5, x);
        d.R = y, d.t = 0, d.dur = 0.7 + x * 0.05, d.shardCount = 5 + Math.floor(Math.random() * 4), e.position.set(f, M, 8), e.visible = !0, w.active = !0, i.color.set(T ?? p.molten), r.rotation.z = Math.random() * Math.PI, a.rotation.z = r.rotation.z + 0.65 + Math.random() * 0.7;
        for (let R = 0; R < Mt; R++) d.flameAng[R] = R / Mt * Math.PI * 2 + (Math.random() - 0.5) * 0.6, d.flameSpin[R] = (Math.random() - 0.5) * 5, l[R].rotation.z = Math.random() * Math.PI * 2, l[R].position.set(0, 0, 0.4);
        for (let R = 0; R < nt; R++) {
          let S = Math.random() * Math.PI * 2,
            H = y * (2.1 + Math.random() * 1.5);
          d.sVX[R] = Math.cos(S) * H, d.sVY[R] = Math.sin(S) * H, d.sRX[R] = (Math.random() - 0.5) * 14, d.sRZ[R] = (Math.random() - 0.5) * 14, d.sS[R] = y * (0.1 + Math.random() * 0.09), E[R].position.set(0, 0, 0.5), E[R].rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3), E[R].visible = R < d.shardCount;
        }
        for (let R = 0; R < Ot; R++) h[R].position.set((Math.random() - 0.5) * y * 0.8, (Math.random() - 0.5) * y * 0.6, 0.2), h[R].rotation.z = Math.random() * Math.PI * 2, d.smRise[R] = y * (0.5 + Math.random() * 0.5), d.smS[R] = y * (0.55 + Math.random() * 0.35);
      },
      update(f) {
        if (!w.active) return !1;
        d.t += f;
        let M = d.t,
          x = d.dur / 0.7,
          T = d.R;
        if (M >= d.dur) return w.active = !1, e.visible = !1, !1;
        let y = M < po + 0.05;
        if (r.visible = a.visible = y, y) {
          let O = M < po ? 1 : 1 - (M - po) / 0.05 * 0.45;
          r.scale.setScalar(T * 2.4 * O), a.scale.setScalar(T * 1.8 * O), o.opacity = M < po ? 1 : 0.6;
        }
        let R = Math.min(M / (0.28 * x), 1);
        s.visible = R < 1, s.scale.setScalar(Math.max(T * 0.85 * Math.pow(1 - R, 1.4), 0.001));
        let S = Math.min(Math.max(M - 0.02, 0) / (0.5 * x), 1),
          H = 1 - Math.pow(1 - S, 3);
        i.opacity = S < 0.55 ? 1 : Math.max(1 - (S - 0.55) / 0.45, 0);
        for (let O = 0; O < Mt; O++) {
          let se = T * 0.95 * H;
          l[O].position.set(Math.cos(d.flameAng[O]) * se, Math.sin(d.flameAng[O]) * se, 0.4), l[O].scale.setScalar(Math.max(T * (0.7 + 0.35 * H) * (1 - 0.45 * S), 0.001)), l[O].rotation.z += d.flameSpin[O] * f;
        }
        let g = Math.min(M / (0.55 * x), 1);
        u.visible = g < 1, u.scale.setScalar(T * (0.7 + 1.7 * (1 - Math.pow(1 - g, 2.5)))), c.opacity = 0.9 * (1 - g);
        let k = Math.min(M / (0.85 * d.dur), 1);
        for (let O = 0; O < d.shardCount; O++) {
          let se = E[O];
          se.position.x += d.sVX[O] * f, se.position.y += d.sVY[O] * f, d.sVX[O] *= 1 - 1.6 * f, d.sVY[O] *= 1 - 1.6 * f, se.rotation.x += d.sRX[O] * f, se.rotation.z += d.sRZ[O] * f, se.scale.setScalar(Math.max(d.sS[O] * (1 - k), 0.001));
        }
        let X = Math.max(M - 0.12 * x, 0) / Math.max(d.dur - 0.12 * x, 0.01),
          Z = Math.min(X, 1);
        m.opacity = Z <= 0 ? 0 : Z < 0.25 ? Z / 0.25 * 0.85 : 0.85 * (1 - (Z - 0.25) / 0.75);
        for (let O = 0; O < Ot; O++) h[O].visible = Z > 0, h[O].position.y += d.smRise[O] * f, h[O].scale.setScalar(Math.max(d.smS[O] * (1 + Z * 0.9), 0.001));
        return !0;
      }
    };
  return w;
}
import * as Ge from "./vendor/002-three.js";
var Si = Te(256, 256, (e, t, n) => {
    let o = t / 2,
      r = n / 2;
    e.fillStyle = "#ffffff";
    let a = 26;
    for (let s = 0; s < a; s++) {
      let i = s / a * Math.PI * 2 + s % 3 * 0.06,
        l = (0.55 + 0.45 * (s * 37 % 7 / 7)) * t * 0.48,
        c = 2.2 + s * 13 % 5,
        u = -Math.sin(i) * c,
        m = Math.cos(i) * c,
        h = o + Math.cos(i) * 9,
        E = r + Math.sin(i) * 9;
      e.beginPath(), e.moveTo(h + u, E + m), e.lineTo(h - u, E - m), e.lineTo(o + Math.cos(i) * l, r + Math.sin(i) * l), e.closePath(), e.fill();
    }
  }),
  Ca = new Ge.RingGeometry(0.86, 1, 72),
  Ba = 1.1,
  at = 12;
function Aa() {
  let e = new Ge.Group();
  e.visible = !1;
  let t = (f, M = null) => new Ge.MeshBasicMaterial({
      color: f,
      map: M ?? void 0,
      transparent: !0,
      blending: Ge.AdditiveBlending,
      depthWrite: !1,
      depthTest: !1,
      side: Ge.DoubleSide
    }),
    n = (f, M, x) => {
      let T = new Ge.Mesh(le(), f);
      return T.renderOrder = M, T.position.z = x, e.add(v(T)), T;
    },
    o = t(16777215, Be()),
    r = n(o, 64, 0.9),
    a = t(16773314, Si),
    s = n(a, 63, 0.8),
    i = t(p.gold),
    l = new Ge.Mesh(Ca, i);
  l.renderOrder = 62, l.position.z = 0.7, e.add(v(l));
  let c = t(p.cyan),
    u = new Ge.Mesh(Ca, c);
  u.renderOrder = 61, u.position.z = 0.6, e.add(v(u));
  let m = t(p.gold, Be()),
    h = t(p.cyan, Be()),
    E = Array.from({
      length: at
    }, (f, M) => n(M % 2 === 0 ? m : h, 60, 0.5)),
    d = {
      t: 0,
      ang: new Float32Array(at),
      rad: new Float32Array(at),
      drift: new Float32Array(at),
      phase: new Float32Array(at),
      size: new Float32Array(at)
    },
    w = {
      group: e,
      active: !1,
      spawn(f = 0, M = 0) {
        d.t = 0, e.position.set(f, M, 10), e.visible = !0, w.active = !0, s.rotation.z = Math.random() * Math.PI * 2;
        for (let x = 0; x < at; x++) d.ang[x] = Math.random() * Math.PI * 2, d.rad[x] = 60 + Math.random() * 300, d.drift[x] = 60 + Math.random() * 120, d.phase[x] = Math.random() * Math.PI * 2, d.size[x] = 14 + Math.random() * 22;
      },
      update(f) {
        if (!w.active) return !1;
        d.t += f;
        let M = d.t;
        if (M >= Ba) return w.active = !1, e.visible = !1, !1;
        if (r.visible = M < 0.16, r.visible) {
          let H = M / 0.16;
          r.scale.setScalar(1300 + 600 * H), o.opacity = 1 - H * H;
        }
        let x = Math.min(M / 0.42, 1);
        s.visible = x < 1, s.scale.setScalar(260 + 700 * (1 - Math.pow(1 - x, 3))), s.rotation.z += f * 0.6, a.opacity = 1 - x;
        let T = Math.min(M / 0.9, 1);
        l.visible = T < 1, l.scale.setScalar(Math.max(30 + 790 * (1 - Math.pow(1 - T, 3)), 0.001)), i.opacity = 0.95 * (1 - T);
        let y = Math.min(Math.max(M - 0.08, 0) / 0.9, 1);
        u.visible = M > 0.08 && y < 1, u.scale.setScalar(Math.max(20 + 700 * (1 - Math.pow(1 - y, 3)), 0.001)), c.opacity = 0.8 * (1 - y);
        let R = Math.max(M - 0.15, 0) / (Ba - 0.15),
          S = Math.min(R / 0.18, 1) * (1 - R);
        m.opacity = S, h.opacity = S * 0.85;
        for (let H = 0; H < at; H++) d.rad[H] += d.drift[H] * f, E[H].visible = S > 0.01, E[H].position.set(Math.cos(d.ang[H]) * d.rad[H], Math.sin(d.ang[H]) * d.rad[H], 0.5), E[H].scale.setScalar(Math.max(d.size[H] * (0.7 + 0.3 * Math.sin(M * 20 + d.phase[H])), 0.001));
        return !0;
      }
    };
  return w;
}
import * as Ne from "./vendor/002-three.js";
var ki = 0.08,
  en = null;
function Gi() {
  return en || (en = Te(128, 128, (e, t, n) => {
    e.translate(t / 2, n / 2);
    let o = (a, s, i, l) => {
      e.fillStyle = l;
      for (let c = 0; c < a; c++) e.rotate(Math.PI * 2 / a), e.beginPath(), e.moveTo(0, -i), e.lineTo(s, 0), e.lineTo(0, i), e.closePath(), e.fill();
    };
    o(8, 60, 5, "rgba(80,220,255,0.85)"), e.rotate(Math.PI / 8), o(8, 38, 4, "rgba(255,255,255,0.95)");
    let r = e.createRadialGradient(0, 0, 2, 0, 0, 26);
    r.addColorStop(0, "rgba(255,255,255,1)"), r.addColorStop(1, "rgba(160,240,255,0)"), e.fillStyle = r, e.fillRect(-32, -32, 64, 64);
  })), en;
}
function Pa() {
  let e = new Ne.Group(),
    t = new Ne.MeshBasicMaterial({
      map: Gi(),
      color: 16777215,
      transparent: !0,
      opacity: 0.9,
      blending: Ne.AdditiveBlending,
      depthWrite: !1
    }),
    n = new Ne.MeshBasicMaterial({
      map: Be(),
      color: p.cyan,
      transparent: !0,
      opacity: 0.7,
      blending: Ne.AdditiveBlending,
      depthWrite: !1
    }),
    o = v(new Ne.Mesh(le(), t)),
    r = v(new Ne.Mesh(le(), n));
  r.position.z = -0.5, e.add(r, o), o.scale.set(30, 30, 1), r.scale.set(42, 42, 1);
  let a = 0,
    s = {
      group: e,
      active: !1,
      spawn(i, l) {
        a = 0, s.active = !0, e.visible = !0, e.position.set(i, l, 2), o.rotation.z = Math.random() * Math.PI, t.opacity = 1, n.opacity = 0.85, o.scale.set(14, 14, 1), r.scale.set(20, 20, 1);
      },
      update(i) {
        if (!s.active) return !1;
        a += i;
        let l = Math.min(a / ki, 1),
          u = 14 + 34 * (1 - (1 - l) * (1 - l));
        return o.scale.set(u, u, 1), r.scale.set(u * 1.4, u * 1.4, 1), t.opacity = 1 - l, n.opacity = (1 - l) * 0.85, o.rotation.z += i * 6, l >= 1 ? (s.active = !1, e.visible = !1, !1) : !0;
      }
    };
  return s;
}
var La = new on.Color(16777215);
function tn(e, t, n) {
  let o = [];
  for (let r = 0; r < t; r++) {
    let a = n();
    a.group.visible = !1, e.root.add(a.group), o.push({
      fx: a,
      busy: !1,
      age: 0,
      ttl: 1
    });
  }
  return o;
}
function Oa(e) {
  let t = e[0];
  for (let n of e) {
    if (!n.busy) return n;
    n.age > t.age && (t = n);
  }
  return t;
}
var Ia = {
  drone: {
    size: 0.8,
    big: !1,
    shake: 0.15
  },
  interceptor: {
    size: 1.2,
    big: !1,
    shake: 0.15
  },
  bomber: {
    size: 3,
    big: !0,
    shake: 0.35
  },
  elite: {
    size: 3.6,
    big: !0,
    shake: 0.35,
    stop: 0.09
  },
  "capital-turret": {
    size: 2.2,
    tint: p.crimson,
    big: !0,
    shake: 0.25,
    stop: 0.05
  },
  "boss-segment": {
    size: 4,
    tint: p.dusk,
    big: !0,
    shake: 0.35,
    stop: 0.09
  },
  boss: {
    size: 6,
    tint: p.gold,
    big: !0,
    shake: 0.35,
    stop: 0.16
  },
  "power-node": {
    size: 3.2,
    tint: p.magenta,
    big: !0,
    shake: 0.45,
    stop: 0.08
  }
};
function Da(e) {
  let t = tn(e, 14, () => Ga()),
    n = tn(e, 2, () => Aa()),
    o = tn(e, 10, () => Pa()),
    r = [];
  for (let i = 0; i < 24; i++) {
    let l = D(p.gold, 16);
    l.visible = !1, e.root.add(l), r.push({
      mesh: l,
      mat: l.material,
      busy: !1,
      age: 0,
      ttl: 0.32,
      baseScale: 16,
      tint: new on.Color(p.cyan)
    });
  }
  let a = 0;
  function s(i, l, c, u, m, h, E) {
    let d = Oa(i);
    d.busy = !0, d.age = 0, d.ttl = m, d.fx.group.visible = !0, d.fx.group.position.set(l, c, u), d.fx.spawn(l, c, h, E);
  }
  return {
    explosion(i, l, c, u) {
      s(t, i, l, 6, Math.min(0.7 + c * 0.12, 1.7), c, u);
    },
    nova(i, l) {
      s(n, i, l, 8, 1.5);
    },
    muzzle(i, l) {
      s(o, i, l, 5, 0.14);
    },
    hitSpark(i, l, c) {
      let u = Oa(r);
      u.busy = !0, u.age = 0, u.ttl = 0.3, u.baseScale = 17 + Math.random() * 12, u.tint.setHex(c ?? p.cyan), u.mat.color.copy(La), u.mat.opacity = 1, u.mesh.position.set(i, l, 6), u.mesh.scale.setScalar(u.baseScale), u.mesh.visible = !0;
      let m = performance.now();
      m - a > 75 && (a = m, e.sfx("hit", {
        volume: 0.6,
        rate: 0.85 + Math.random() * 0.25
      }));
    },
    update(i) {
      for (let l of [t, n, o]) for (let c of l) c.busy && (c.fx.update(i), c.age += i, (c.fx.active === !1 || c.age >= c.ttl) && (c.busy = !1, c.fx.group.visible = !1));
      for (let l of r) {
        if (!l.busy) continue;
        l.age += i;
        let c = l.age / l.ttl;
        if (c >= 1) {
          l.busy = !1, l.mesh.visible = !1;
          continue;
        }
        l.mesh.scale.setScalar(l.baseScale * (1 + 2.2 * c)), l.mat.color.copy(La).lerp(l.tint, Math.min(1, c * 1.8)), l.mat.opacity = 1 - c;
      }
    }
  };
}
function mo(e, t, n) {
  for (let o of e.events) switch (o.type) {
    case "shot":
      t.fx.muzzle(o.x, o.y), t.sfx("shot", {
        volume: 0.25,
        rate: 0.9 + Math.random() * 0.2
      });
      break;
    case "kill":
      {
        let r = Ia[o.kind] ?? Ia.interceptor;
        t.fx.explosion(o.x, o.y, r.size, r.tint), t.sfx(r.big ? "boomB" : "boomS"), t.shake.shake(r.shake), r.stop && t.hitStop.trigger(r.stop);
        break;
      }
    case "player-hit":
      t.fx.explosion(o.x, o.y, 1.6, p.crimson), t.sfx("playerHit"), t.shake.shake(0.55);
      break;
    case "bomb":
      t.fx.nova(o.x, o.y), t.sfx("nova"), t.shake.shake(0.6), t.hitStop.trigger(0.12);
      break;
    case "pickup":
      t.fx.hitSpark(o.x, o.y, p.gold), t.sfx("pickup");
      break;
    case "weapon":
      t.sfx("powerup");
      break;
    case "blastCharge":
      o.on && (t.sfx("blastCharge"), t.shake.shake(0.3));
      break;
    case "chain":
      o.milestone && t.sfx("chain");
      break;
    case "capital-arrive":
      t.sfx("alarm"), t.shake.shake(0.35);
      break;
    case "sector":
      t.sfx("powerup", {
        volume: 0.8,
        rate: 0.6
      }), t.shake.shake(0.25);
      break;
    case "boss-phase":
      o.phase === "arrive" ? (t.sfx("alarm"), t.shake.shake(0.4)) : o.phase === "weakpoints" ? (t.sfx("alarm"), t.shake.shake(0.5), t.hitStop.trigger(0.1)) : o.phase === "shield-down" ? (t.sfx("boomS", {
        volume: 0.9,
        rate: 0.7
      }), t.shake.shake(0.45), t.hitStop.trigger(0.08)) : o.phase === "recovered" && (t.sfx("alarm"), t.shake.shake(0.35));
      break;
    case "gameover":
      t.sfx("gameover");
      break;
  }
  t.fx.update(n);
}
import { destroy as sl } from "./vendor/006-three.js";
import * as W from "./vendor/002-three.js";
function _a(e) {
  let t = new W.Shape();
  return e > 0 ? (t.moveTo(0, -4), t.lineTo(26, 10), t.lineTo(23, 16), t.quadraticCurveTo(10, 6, 0, 10)) : (t.moveTo(0, -4), t.lineTo(0, 10), t.quadraticCurveTo(-10, 6, -23, 16), t.lineTo(-26, 10)), t.closePath(), t;
}
var Xa = {
    depth: 2.2,
    bevelEnabled: !1
  },
  Ya = new W.ExtrudeGeometry(_a(1), Xa);
Ya.translate(0, 0, -1.1);
var $a = new W.ExtrudeGeometry(_a(-1), Xa);
$a.translate(0, 0, -1.1);
var Ci = new W.BoxGeometry(5, 28, 5.5),
  Bi = new W.ConeGeometry(3.4, 11, 4),
  Ai = new W.BoxGeometry(7, 11, 6),
  Pi = new W.BoxGeometry(2.6, 20, 2),
  Li = new W.BoxGeometry(1.4, 8, 7),
  Oi = new W.BoxGeometry(1.4, 9, 1.2),
  za = new W.CylinderGeometry(1.6, 2.2, 4.5, 6),
  Fa = new W.BoxGeometry(11, 1.5, 2.6),
  Ii = new W.BoxGeometry(4.5, 6, 3.2),
  Va = new W.ConeGeometry(1.2, 4, 4),
  Di = new W.Color(p.metal),
  zi = new W.Color(p.dusk),
  Na = new W.Color(460812);
function Wa() {
  let e = new W.Group(),
    t = G(p.metal).clone(),
    n = G(p.dusk).clone(),
    o = new W.Mesh(Ci, t);
  o.position.set(0, -3, 0);
  let r = new W.Mesh(Bi, t);
  r.rotation.set(Math.PI, Math.PI / 4, 0), r.position.set(0, -21.5, 0);
  let a = new W.Mesh(Ai, t);
  a.position.set(0, 16.5, 0.2);
  let s = new W.Mesh(Pi, n);
  s.position.set(0, -3, 3.4);
  let i = new W.Mesh(Li, n);
  i.position.set(0, 18, 4.5), e.add(o, r, a, s, i);
  let l = new W.Mesh(Ya, n);
  l.position.set(2.2, 2, 0.4);
  let c = new W.Mesh($a, n);
  c.position.set(-2.2, 2, 0.4);
  let u = new W.Mesh(Fa, G(p.crimson));
  u.position.set(14.5, 6, 1.7), u.rotation.z = 0.49;
  let m = new W.Mesh(Fa, G(p.crimson));
  m.position.set(-14.5, 6, 1.7), m.rotation.z = -0.49, e.add(l, c, u, m);
  let h = v(new W.Mesh(Oi, C(p.magenta)));
  h.position.set(0, -9, 4.4);
  let E = D(p.magenta, 6.5);
  E.position.set(0, -9, 5.2), e.add(h, E);
  let d = new W.Mesh(za, t);
  d.position.set(3.6, 22.5, 0);
  let w = new W.Mesh(za, t);
  w.position.set(-3.6, 22.5, 0);
  let f = D(p.crimson, 6);
  f.position.set(3.6, 26, 1);
  let M = D(p.crimson, 6);
  M.position.set(-3.6, 26, 1), e.add(d, w, f, M);
  let x = new W.Group(),
    T = new W.Mesh(Ii, G(723985));
  T.rotation.z = 0.35;
  let y = new W.Mesh(Va, G(p.charcoal));
  y.position.set(1.4, -1.5, 1.6), y.rotation.set(0.5, 0, -0.7);
  let R = new W.Mesh(Va, G(p.charcoal));
  R.position.set(-1, 2, 1.4), R.rotation.set(-0.4, 0, 0.9);
  let S = D(p.molten, 5);
  S.position.set(0.8, 0.5, 2.4), x.add(T, y, R, S), x.position.set(3.2, 0, 2.8), x.visible = !1, e.add(x), ne(e, 0.07);
  let H = we(e),
    g = Math.random() * 10,
    k = 0,
    X = 0,
    Z = ie => {
      t.color.copy(Di).lerp(Na, ie * 0.85), n.color.copy(zi).lerp(Na, ie * 0.9);
    };
  return {
    group: H,
    update: ie => {
      g += ie;
      let de = Math.sin(g * 21);
      f.scale.setScalar(6 + de * 1.1), M.scale.setScalar(6 - de * 1.1), E.scale.setScalar(6.5 + Math.sin(g * 9) * 0.9), x.visible && S.scale.setScalar(3.5 + 3 * Math.abs(Math.sin(g * 31) * Math.sin(g * 8.7))), X > 0 && (X -= ie, X <= 0 && Z(k));
    },
    setDamage: ie => {
      let de = Math.max(0, Math.min(1, ie));
      de > k + 0.001 && (X = 0.07, t.color.setRGB(1, 1, 1), n.color.setRGB(1, 1, 1)), k = de, X <= 0 && Z(de), x.visible = de > 0.5;
    }
  };
}
import * as ae from "./vendor/002-three.js";
var Ka = new ae.ConeGeometry(9, 8, 4),
  Fi = new ae.SphereGeometry(6.2, 16, 12),
  Vi = new ae.TorusGeometry(13, 0.8, 4, 6),
  Ni = new ae.TorusGeometry(11.5, 0.7, 4, 6),
  _i = new ae.TorusGeometry(10.5, 0.65, 4, 6),
  Xi = new ae.SphereGeometry(1.1, 6, 5),
  Ua = new ae.ConeGeometry(1.1, 3.5, 4),
  Yi = new ae.Color(1119264),
  $i = new ae.Color(197640),
  Wi = new ae.Color(p.acid),
  Ki = new ae.Color(p.molten);
function qa() {
  let e = new ae.Group(),
    t = G(1119264).clone(),
    n = C(p.acid).clone(),
    o = new ae.Mesh(Ka, t);
  o.position.y = 5.6;
  let r = new ae.Mesh(Ka, t);
  r.rotation.x = Math.PI, r.position.y = -5.6, e.add(o, r);
  let a = v(new ae.Mesh(Fi, n)),
    s = D(p.acid, 15);
  e.add(a, s);
  let i = G(p.charcoal),
    l = C(p.acid),
    c = (g, k, X, Z) => {
      let O = new ae.Group();
      O.rotation.set(k, 0, X);
      let se = v(new ae.Mesh(g, i)),
        ie = g.parameters.radius;
      for (let de = 0; de < Z; de++) {
        let A = de / Z * Math.PI * 2,
          ge = v(new ae.Mesh(Xi, l));
        ge.position.set(Math.cos(A) * ie, Math.sin(A) * ie, 0), se.add(ge);
      }
      return O.add(se), e.add(O), se;
    },
    u = c(Vi, Math.PI / 2, 0, 3),
    m = c(Ni, Math.PI / 2 - 0.55, 0.42, 2),
    h = c(_i, 0.3, -0.2, 2),
    E = new ae.Group(),
    d = new ae.Mesh(Ua, G(p.charcoal));
  d.rotation.set(0.6, 0, -0.8);
  let w = new ae.Mesh(Ua, G(p.charcoal));
  w.position.set(-1.6, -0.8, 0.8), w.rotation.set(-0.3, 0, 1);
  let f = D(p.molten, 4.5);
  f.position.set(-0.4, 0.6, 1.6), E.add(d, w, f), E.position.set(4.6, 4.2, 3.4), E.visible = !1, e.add(E), ne(e, 0.09);
  let M = we(e),
    x = Math.random() * 10,
    T = 0,
    y = 0,
    R = g => {
      t.color.copy(Yi).lerp($i, g * 0.9), n.color.copy(Wi).lerp(Ki, g * 0.6);
    };
  return {
    group: M,
    update: g => {
      u.rotation.z += 1.31 * g, m.rotation.z -= 2.17 * g, h.rotation.z += 3.43 * g, x += g, a.scale.setScalar(1 + Math.sin(x * 5.3) * 0.07), s.scale.setScalar(15 + Math.sin(x * 3.1) * 1.6), E.visible && f.scale.setScalar(3 + 2.6 * Math.abs(Math.sin(x * 29) * Math.sin(x * 7.9))), y > 0 && (y -= g, y <= 0 && R(T));
    },
    setDamage: g => {
      let k = Math.max(0, Math.min(1, g));
      k > T + 0.001 && (y = 0.07, t.color.setRGB(1, 1, 1), n.color.setRGB(1, 1, 1)), T = k, y <= 0 && R(k), E.visible = k > 0.5;
    }
  };
}
import * as me from "./vendor/002-three.js";
var vt = new me.SphereGeometry(1, 14, 10),
  xt = new me.BoxGeometry(1, 1, 1),
  nn = new me.CylinderGeometry(1, 1, 1, 10),
  ja = new me.ConeGeometry(1, 1, 9),
  Ui = new me.TetrahedronGeometry(1);
function _e(e, t, n, o, r, a, s, i, l) {
  let c = new me.Mesh(e, G(t));
  return c.scale.set(n, o, r), c.position.set(a, s, i), l.add(c), c;
}
function Rt(e, t, n, o, r, a, s, i, l) {
  let c = v(new me.Mesh(e, C(t)));
  return c.scale.set(n, o, r), c.position.set(a, s, i), l.add(c), c;
}
function Qa() {
  let e = new me.Group(),
    t = new me.Group();
  e.add(t), _e(vt, p.metal, 30, 44, 15, 0, 2, -2, t);
  let n = [{
    w: 23,
    l: 14,
    h: 10,
    y: 33,
    c: p.dusk
  }, {
    w: 28,
    l: 17,
    h: 12,
    y: 15,
    c: p.metal
  }, {
    w: 30,
    l: 18,
    h: 13,
    y: -5,
    c: p.dusk
  }, {
    w: 26,
    l: 15,
    h: 11,
    y: -23,
    c: p.metal
  }];
  for (let f of n) _e(vt, f.c, f.w, f.l, f.h, 0, f.y, 8, t), _e(vt, p.bone, f.w + 2, 4, f.h - 3, 0, f.y + f.l * 0.8, 6, t);
  _e(vt, p.metalLight, 17, 14, 11, 0, -38, 1, t), Rt(vt, p.crimson, 2.4, 2.4, 2.4, -6.5, -46, 5, t), Rt(vt, p.crimson, 2.4, 2.4, 2.4, 6.5, -46, 5, t);
  for (let f of [-1, 1]) _e(ja, p.bone, 4.5, 14, 4.5, f * 9, -52, -2, t).rotation.set(Math.PI, 0, f * 0.16);
  let o = [];
  for (let f of [-1, 1]) for (let M = 0; M < 3; M++) {
    let x = -16 + M * 20;
    _e(nn, p.metal, 5.5, 13, 5.5, f * 35, x + 4, -2, t).rotation.z = -f * 0.45, _e(nn, p.bone, 6.2, 3, 6.2, f * 33, x - 1, -2, t).rotation.z = -f * 0.45, Rt(ja, p.molten, 3, 8, 3, f * 38, x + 12, -2, t).rotation.z = -f * 0.45;
    let T = D(p.molten, 11);
    T.position.set(f * 39, x + 11, 2), T.userData.size = 11, t.add(T), o.push(T);
  }
  _e(xt, p.charcoal, 18, 42, 7, 0, 4, -12, t), _e(xt, p.metal, 7, 36, 2, -5.5, 4, -16, t), _e(xt, p.metal, 7, 36, 2, 5.5, 4, -16, t), Rt(xt, p.gold, 3, 34, 2, 0, 4, -16.5, t), Rt(xt, p.gold, 1.5, 30, 1.5, -19.5, 4, -8, t), Rt(xt, p.gold, 1.5, 30, 1.5, 19.5, 4, -8, t);
  let r = D(p.gold, 24);
  r.position.set(0, 4, -18), r.rotation.x = Math.PI, t.add(r);
  for (let f of [-1, 1]) {
    _e(nn, p.charcoal, 5, 9, 5, f * 10, 43, -3, t);
    let M = D(p.molten, 13);
    M.position.set(f * 10, 49, 0), M.userData.size = 13, t.add(M), o.push(M);
  }
  let a = [],
    s = (f, M, x, T, y, R) => {
      let S = v(new me.Mesh(Ui, G(p.ink)));
      S.scale.set(y, y, y * 0.4), S.position.set(M, x, T), S.rotation.z = R, f.add(S);
    },
    i = (f, M, x, T, y) => {
      let R = D(p.molten, y);
      R.position.set(M, x, T), R.userData.size = y, f.add(R), a.push(R);
    },
    l = new me.Group();
  l.visible = !1, t.add(l), s(l, 10, 12, 19, 7, 0.7), s(l, -14, -8, 18, 9, 2.4), i(l, 12, 13, 21, 12);
  let c = new me.Group();
  c.visible = !1, t.add(c), s(c, -6, 28, 16, 8, 1.3), s(c, 4, -26, 16, 10, 4), i(c, -13, -7, 20, 15), i(c, -4, 30, 18, 11), ne(t);
  let u = we(e),
    m = D(16777215, 74);
  m.position.set(0, 0, 18), m.visible = !1, t.add(m);
  let h = m.material,
    E = 0,
    d = 0,
    w = Math.random() * Math.PI * 2;
  return {
    group: u,
    update(f) {
      w += f, d > 0 && (d -= f, m.visible = d > 0, h.opacity = Math.max(0, d / 0.09)), t.rotation.z = Math.sin(w * 0.7) * 0.025, t.position.y = Math.sin(w * 1.5) * 1.4;
      for (let M = 0; M < o.length; M++) {
        let x = o[M];
        x.scale.setScalar(x.userData.size * (1 + 0.13 * Math.sin(w * 9 + M * 1.7)));
      }
      r.scale.setScalar(24 * (1 + 0.1 * Math.sin(w * 2.1)));
      for (let M = 0; M < a.length; M++) a[M].material.opacity = 0.7 + 0.3 * Math.sin(w * 12 + M * 2.3);
    },
    setDamage(f) {
      f > E + 0.001 && (d = 0.09), E = f, l.visible = f >= 0.35, c.visible = f >= 0.7;
    }
  };
}
import * as pe from "./vendor/002-three.js";
var Ie = new pe.BoxGeometry(1, 1, 1),
  wt = new pe.CylinderGeometry(1, 1, 1, 10),
  qi = new pe.ConeGeometry(1, 1, 9),
  an = new pe.SphereGeometry(1, 12, 9),
  ji = new pe.TetrahedronGeometry(1);
function ve(e, t, n, o, r, a, s, i, l) {
  let c = new pe.Mesh(e, G(t));
  return c.scale.set(n, o, r), c.position.set(a, s, i), l.add(c), c;
}
function Ht(e, t, n, o, r, a, s, i, l) {
  let c = v(new pe.Mesh(e, t));
  return c.scale.set(n, o, r), c.position.set(a, s, i), l.add(c), c;
}
function Za() {
  let e = new pe.Group(),
    t = new pe.Group();
  e.add(t), ve(Ie, p.metal, 26, 64, 18, -4, 4, 0, t), ve(Ie, p.dusk, 30, 34, 10, -6, 12, 12, t), ve(Ie, p.bone, 34, 8, 12, -6, 32, 8, t), ve(Ie, p.charcoal, 22, 18, 14, -4, 42, -2, t), ve(qi, p.metalLight, 13, 26, 9, -4, -46, 0, t).rotation.x = Math.PI, ve(Ie, p.bone, 18, 10, 10, -4, -30, 4, t), Ht(Ie, C(p.crimson), 2, 12, 2, -4, -42, 5.5, t), ve(Ie, p.dusk, 22, 26, 22, 24, 12, 2, t), ve(Ie, p.bone, 26, 8, 24, 24, 27, 2, t), ve(Ie, p.metal, 14, 22, 14, 30, -7, 2, t), ve(wt, p.metalLight, 7, 48, 7, 32, -33, 2, t), ve(wt, p.charcoal, 9, 7, 9, 32, -14, 2, t), ve(wt, p.bone, 9, 5, 9, 32, -52, 2, t), Ht(wt, C(p.gold), 4.5, 3, 4.5, 32, -56, 2, t);
  let n = D(p.gold, 15);
  n.position.set(32, -57, 4), t.add(n);
  let o = [];
  for (let T = 0; T < 3; T++) {
    let y = -18 + T * 19;
    ve(Ie, p.charcoal, 12, 6, 6, -22, y, 4, t), ve(Ie, p.bone, 5, 15, 18, -31, y, 6, t);
    let R = Ht(an, C(p.magenta), 2.2, 2.2, 2.2, -31, y - 9, 9, t);
    R.userData.size = 2.2, o.push(R);
  }
  let r = new pe.MeshBasicMaterial({
      color: p.magenta
    }),
    a = (T, y, R, S, H, g) => Ht(Ie, r, T, y, R, S, H, g, t);
  a(2.5, 38, 2.5, 8, 6, 10), a(12, 2.5, 2.5, 16, -1, 9), a(2.5, 26, 2.5, -16, 2, 10), a(2.5, 2.5, 10, -16, 14, 6);
  let s = [];
  for (let [T, y, R] of [[4, 22, 10], [0, -10, 10.5]]) {
    Ht(an, C(p.gold), 4.5, 4.5, 4.5, T, y, R, t);
    let S = D(p.gold, 16);
    S.position.set(T, y, R + 3), t.add(S), s.push(S);
  }
  let i = [[-12, 34, 16], [-6, 38, 24], [-16, 40, 11]];
  for (let T = 0; T < i.length; T++) {
    let [y, R, S] = i[T];
    ve(wt, p.charcoal, 0.9, S, 0.9, y, R, 6 + S / 2, t).rotation.x = Math.PI / 2;
    let H = Ht(an, C(T === 1 ? p.gold : p.magenta), 1.6, 1.6, 1.6, y, R, 7 + S, t);
    H.userData.size = 1.6, o.push(H);
  }
  for (let [T, y] of [[4, 50], [-14, 48]]) {
    ve(wt, p.metal, 6, 8, 6, T, y, -2, t);
    let R = D(p.magenta, 13);
    R.position.set(T, y + 5, 0), t.add(R), s.push(R);
  }
  let l = [],
    c = (T, y, R, S, H, g) => {
      let k = v(new pe.Mesh(ji, G(p.ink)));
      k.scale.set(H, H, H * 0.4), k.position.set(y, R, S), k.rotation.z = g, T.add(k);
    },
    u = (T, y, R, S, H) => {
      let g = D(p.molten, H);
      g.position.set(y, R, S), T.add(g), l.push(g);
    },
    m = new pe.Group();
  m.visible = !1, t.add(m), c(m, 24, 14, 14, 8, 0.8), c(m, -8, 10, 18, 9, 2.1), u(m, 24, 12, 16, 12);
  let h = new pe.Group();
  h.visible = !1, t.add(h), c(h, -4, -18, 10, 10, 3.9), c(h, -6, 32, 13, 8, 5.2), u(h, -8, 8, 19, 15), u(h, 30, -20, 11, 12), ne(t);
  let E = we(e),
    d = D(16777215, 84);
  d.position.set(-2, 4, 20), d.visible = !1, t.add(d);
  let w = d.material,
    f = 0,
    M = 0,
    x = Math.random() * Math.PI * 2;
  return {
    group: E,
    update(T) {
      x += T, M > 0 && (M -= T, d.visible = M > 0, w.opacity = Math.max(0, M / 0.09)), t.rotation.z = Math.sin(x * 0.6) * 0.02, r.color.setHex(p.magenta).multiplyScalar(0.85 + 0.25 * Math.sin(x * 2.6));
      for (let y = 0; y < o.length; y++) {
        let R = o[y];
        R.scale.setScalar(R.userData.size * (1 + 0.12 * Math.sin(x * 3.4 + y * 1.9)));
      }
      for (let y = 0; y < s.length; y++) s[y].material.opacity = 0.65 + 0.3 * Math.sin(x * 2.2 + y * 1.3);
      n.material.opacity = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(x * 1.4));
      for (let y = 0; y < l.length; y++) l[y].material.opacity = 0.7 + 0.3 * Math.sin(x * 12 + y * 2.3);
    },
    setDamage(T) {
      T > f + 0.001 && (M = 0.09), f = T, m.visible = T >= 0.35, h.visible = T >= 0.7;
    }
  };
}
import * as K from "./vendor/002-three.js";
var Qi = new K.TorusGeometry(16, 2.4, 6, 8),
  Zi = new K.CylinderGeometry(13.5, 13.5, 2.4, 8),
  Ji = new K.BoxGeometry(3, 13, 3),
  el = new K.SphereGeometry(9, 12, 10),
  tl = new K.SphereGeometry(5, 10, 8),
  ol = new K.TorusGeometry(12.5, 1.7, 5, 8),
  Ja = new K.OctahedronGeometry(6),
  nl = new K.OctahedronGeometry(3),
  al = new K.BoxGeometry(13, 4, 9),
  er = new Map();
function rl(e) {
  let t = er.get(e);
  return t || (t = new K.MeshBasicMaterial({
    map: Be(),
    color: e,
    transparent: !0,
    blending: K.AdditiveBlending,
    depthWrite: !1
  }), er.set(e, t)), t;
}
var rn = 52;
function tr(e = "weapon") {
  let t = new K.Group(),
    n = Math.random() * Math.PI * 2,
    o = 0,
    r = new K.Group(),
    a = new K.Group();
  r.add(a);
  let s = p.gold;
  if (e === "weapon") {
    let c = new K.Mesh(Zi, G(p.charcoal));
    c.rotation.set(Math.PI / 2, Math.PI / 8, 0), c.position.z = -2.5;
    let u = v(new K.Mesh(Qi, C(p.gold, 0.9)));
    u.rotation.z = Math.PI / 8, r.add(c, u), [0.32, -0.32, 0.32, -0.32].forEach((h, E) => {
      let d = v(new K.Mesh(Ji, C(p.gold)));
      d.position.set(-7.5 + E * 5, E === 1 || E === 2 ? -1.2 : 0.6, 0), d.rotation.z = h, a.add(d);
    });
  } else if (e === "bomb") {
    s = p.molten;
    let c = v(new K.Mesh(el, C(p.molten, 0.95))),
      u = v(new K.Mesh(tl, C(16770736)));
    a.add(c, u);
    let m = [[0, 0], [Math.PI / 2, 0], [0, Math.PI / 2]];
    for (let [h, E] of m) {
      let d = new K.Mesh(ol, G(p.metal));
      d.rotation.set(h, E, Math.PI / 8), a.add(d);
    }
  } else {
    s = p.cyan;
    let c = v(new K.Mesh(Ja, C(p.cyan, 0.9)));
    c.scale.set(1, 1.9, 1), c.position.y = 2;
    let u = v(new K.Mesh(nl, C(16777215)));
    u.scale.set(0.9, 1.8, 0.9), u.position.y = 2, a.add(c, u);
    let m = [[-6.5, 0.5], [6.5, -0.5]];
    for (let [E, d] of m) {
      let w = v(new K.Mesh(Ja, C(p.cyan, 0.75)));
      w.scale.set(0.55, 1.1, 0.55), w.position.set(E, -2, 0), w.rotation.z = d, a.add(w);
    }
    let h = new K.Mesh(al, G(p.metal));
    h.position.y = -8, a.add(h);
  }
  ne(r, 0.1);
  let i = v(new K.Mesh(le(), rl(s)));
  i.scale.set(rn, rn, 1), i.position.z = -3;
  let l = new K.Group();
  return l.add(we(r)), t.add(i, l), {
    group: t,
    kind: e,
    update(c) {
      o += c, a.rotation.y += c * 1.8, l.position.y = Math.sin(o * 2.3 + n) * 3;
      let u = rn * (1 + Math.sin(o * 4.2 + n) * 0.1);
      i.scale.set(u, u, 1);
    }
  };
}
var il = {
    interceptor: () => Wa(),
    drone: () => qa(),
    bomber: () => Qa(),
    elite: () => Za()
  },
  or = new WeakMap();
function ll(e) {
  let t = or.get(e);
  return t || (t = {
    free: new Map(),
    seen: new Set()
  }, or.set(e, t)), t;
}
function ho(e, t, n, o) {
  let r = t.free.get(n),
    a = r && r.length > 0 ? r.pop() : void 0;
  if (a) return a.group.visible = !0, a;
  let s = o();
  return s.group.userData.poolKey = n, e.root.add(s.group), s;
}
function rt(e, t, n) {
  let o = ll(t),
    r = o.seen;
  r.clear();
  for (let a of e.enemies) {
    r.add(a.id);
    let s = t.visuals.get(a.id);
    s || (s = ho(t, o, `enemy:${a.kind}`, il[a.kind]), t.visuals.set(a.id, s)), s.group.position.set(a.x, a.y, 0), s.setDamage(1 - a.hp / a.maxHp), s.update?.(n);
  }
  for (let a of e.playerBolts) {
    r.add(a.id);
    let s = t.visuals.get(a.id);
    if (!s) {
      let i = a.kind;
      s = ho(t, o, `pbolt:${i}`, () => eo(i)), t.visuals.set(a.id, s);
    }
    s.group.position.set(a.x, a.y, 4), s.group.rotation.z = Math.atan2(a.vy, a.vx) - Math.PI / 2, s.group.scale.setScalar(a.kind === "beam" ? a.radius / 26 : 1), s.update?.(n);
  }
  for (let a of e.enemyBolts) {
    r.add(a.id);
    let s = t.visuals.get(a.id);
    if (!s) {
      let i = a.kind;
      s = ho(t, o, `ebolt:${i}`, () => Pt(i)), t.visuals.set(a.id, s);
    }
    s.group.position.set(a.x, a.y, 4), s.group.rotation.z = Math.atan2(a.vy, a.vx) - Math.PI / 2, s.update?.(n);
  }
  for (let a of e.pickups) {
    r.add(a.id);
    let s = t.visuals.get(a.id);
    if (!s) {
      let i = a.kind;
      s = ho(t, o, `pickup:${i}`, () => tr(i)), t.visuals.set(a.id, s);
    }
    s.group.position.set(a.x, a.y, 2), s.update?.(n);
  }
  for (let [a, s] of t.visuals) {
    if (r.has(a)) continue;
    s.group.visible = !1;
    let i = s.group.userData.poolKey,
      l = o.free.get(i);
    l || (l = [], o.free.set(i, l)), l.push(s), t.visuals.delete(a);
  }
  cl(e, t, n);
}
function cl(e, t, n) {
  let o = e.boss;
  if (!o) {
    t.bossVisual && (t.root.remove(t.bossVisual.group), sl(t.bossVisual.group), t.bossVisual = null);
    return;
  }
  t.bossVisual || (t.bossVisual = Jt(), t.root.add(t.bossVisual.group));
  let r = t.bossVisual;
  r.head.position.set(o.x, o.y, 0);
  let a = Math.min(o.segments.length, r.segments.length);
  for (let s = 0; s < a; s++) {
    let i = o.segments[s];
    r.segments[s].position.set(i.x, i.y, 0), r.setSegmentDamage(s, 1 - i.hp / o.segmentMaxHp, i.alive);
  }
  r.setHeadDamage(1 - o.headHp / o.headMaxHp), o.hurtFlash > 0 && r.flashHurt(), r.update?.(n);
}
function fo(e) {
  e.enemies.length = 0, e.enemyBolts.length = 0, e.playerBolts.length = 0, e.pickups.length = 0;
}
function pl(e, t) {
  switch (t) {
    case "boss":
      fo(e), e.capitalTurrets.length = 0, e.env.capitalShipOn = !1, e.boss = lt({}, e.tier), z(e, {
        type: "boss-phase",
        phase: "arrive"
      });
      break;
    case "breach":
      fo(e), e.capitalTurrets.length = 0, e.env.capitalShipOn = !1, e.boss = lt({
        phase: "weakpoints",
        headHp: 0,
        finale: Bt({}, e.tier)
      }, e.tier), z(e, {
        type: "boss-phase",
        phase: "weakpoints"
      });
      break;
    case "capital":
      fo(e), e.boss = null, e.capitalTurrets.length = 0, e.env.capitalShipT = 0, e.env.capitalShipAnnounced = !1, e.time = b.interlude.at + e.tier * 130, e.spawn.nextWaveAt = e.time + 1;
      break;
    case "wpn-up":
      e.weaponLevel < b.weapons.maxLevel && (e.weaponLevel++, z(e, {
        type: "weapon",
        level: e.weaponLevel
      }));
      break;
    case "wpn-down":
      e.weaponLevel > 1 && e.weaponLevel--;
      break;
    case "bomb":
      e.bombs = Math.min(b.bombs.max, e.bombs + 1);
      break;
    case "hp":
      e.player.hp = Math.min(b.player.hull, e.player.hp + 1);
      break;
    case "blastCharge":
      e.blastCharge.active || (e.blastCharge.charge = 1);
      break;
    case "clear":
      fo(e);
      break;
    case "tier":
      e.tier++;
      break;
  }
}
function nr(e, t) {
  if (t.devQueue.length !== 0) {
    for (let n of t.devQueue) pl(e, n);
    t.devQueue.length = 0;
  }
}
var ul = {
    void: "#05060d",
    charcoal: "#14161f",
    metal: "#2a2d38",
    metalLight: "#424657",
    bone: "#8f93a5",
    cyan: "#33e6ff",
    acid: "#9dff33",
    magenta: "#ff2fd6",
    molten: "#ff7a1a",
    crimson: "#d81f3c",
    gold: "#ffc93c"
  },
  ar = "'Arial Black','Avenir Next Condensed',sans-serif",
  L = ul,
  rr = `
.nr9{font-family:${ar};text-transform:uppercase;color:${L.bone};user-select:none;pointer-events:none;}
.nr9-plate{background:rgba(5,6,13,.78);border:2px solid ${L.metal};padding:7px 18px 8px 12px;clip-path:polygon(0 0,calc(100% - 13px) 0,100% 13px,100% 100%,13px 100%,0 calc(100% - 13px));}
.nr9-label{font-size:10px;letter-spacing:3px;color:${L.bone};}
.nr9-score{font-size:30px;line-height:1.05;letter-spacing:2px;color:${L.gold};transform-origin:left center;}
.nr9-hull-row{margin-top:0;}
.nr9-hull-cell{width:22px;height:13px;background:${L.charcoal};border:2px solid ${L.metal};clip-path:polygon(12% 0,100% 0,88% 100%,0 100%);}
.nr9-hull-cell.on{background:${L.crimson};border-color:${L.crimson};box-shadow:0 0 8px rgba(216,31,60,.65);}
@keyframes nr9-hull-hit{0%{filter:brightness(3)}100%{filter:brightness(1)}}
.nr9-hull-hit{animation:nr9-hull-hit .35s ease-out;}
.nr9-chain{margin-top:6px;font-size:17px;letter-spacing:2px;color:${L.cyan};transform-origin:left center;text-shadow:0 0 9px rgba(51,230,255,.6);}
.nr9-row{display:flex;align-items:center;gap:5px;}
.nr9-pip{width:17px;height:11px;transform:skewX(-18deg);background:${L.charcoal};border:2px solid ${L.metal};}
.nr9-pip.on{background:${L.acid};border-color:${L.acid};box-shadow:0 0 7px rgba(157,255,51,.55);}
.nr9-hex{width:15px;height:13px;clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%);background:${L.charcoal};}
.nr9-hex.on{background:${L.molten};filter:drop-shadow(0 0 5px rgba(255,122,26,.7));}
.nr9-meter{width:150px;height:12px;transform:skewX(-18deg);background:rgba(5,6,13,.78);border:2px solid ${L.metal};overflow:hidden;}
.nr9-meter-fill{height:100%;width:0%;background:${L.cyan};transition:width .12s linear;}
.nr9-meter-fill.full{background:${L.gold};}
.nr9-microlabel{font-size:9px;letter-spacing:2px;color:${L.gold};visibility:hidden;}
.nr9-top-center{position:fixed;top:calc(env(safe-area-inset-top,0px) + 10px);left:50%;transform:translateX(-50%);
  z-index:2147483645;display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:none;}
.nr9-boss{display:none;flex-direction:column;align-items:center;gap:4px;margin-top:4px;}
.nr9-boss-label{font-size:13px;letter-spacing:6px;color:${L.crimson};text-shadow:0 0 10px rgba(216,31,60,.7);}
.nr9-boss-bar{width:460px;max-width:60vw;height:14px;background:rgba(5,6,13,.78);border:2px solid ${L.crimson};clip-path:polygon(10px 0,100% 0,calc(100% - 10px) 100%,0 100%);}
.nr9-boss-fill{height:100%;width:100%;background:linear-gradient(90deg,${L.crimson},${L.molten});transition:width .15s linear;}
.nr9-top-notice{display:none;margin-top:6px;text-align:center;filter:drop-shadow(0 0 12px rgba(5,6,13,.95));}
.nr9-top-notice.open{display:block;}
.nr9-top-notice-title{font-size:22px;line-height:1;letter-spacing:4px;color:${L.gold};text-shadow:0 0 10px rgba(255,201,60,.8),0 2px 0 ${L.void};}
.nr9-top-notice-sub{margin-top:3px;font-size:10px;line-height:1;letter-spacing:3px;color:${L.cyan};text-shadow:0 0 8px rgba(51,230,255,.65),0 2px 0 ${L.void};}
@keyframes nr9-top-pop{0%{transform:translateY(-12px) scale(.92);opacity:0}25%{transform:translateY(0) scale(1.08);opacity:1}100%{transform:translateY(0) scale(1);opacity:1}}
.nr9-top-pop{animation:nr9-top-pop .28s ease-out;}
.nr9-pause-btn,.nr9-resume-btn{font:700 12px/1 ${ar};letter-spacing:2px;text-transform:uppercase;color:${L.void};background:${L.gold};border:0;padding:10px 14px;clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,9px 100%,0 calc(100% - 9px));pointer-events:auto;cursor:pointer;}
.nr9-pause-btn{opacity:.78;background:${L.metalLight};color:${L.bone};}
.nr9-pause-btn:hover{opacity:1;color:${L.gold};}
.nr9-title{position:fixed;inset:0;z-index:2147483644;display:none;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;
  background:radial-gradient(ellipse at 50% 42%,rgba(34,26,51,.4) 0%,rgba(5,6,13,.82) 70%);pointer-events:none;}
.nr9-title.open{display:flex;}
.nr9-title-kicker{font-size:13px;letter-spacing:6px;color:${L.crimson};text-shadow:0 0 10px rgba(216,31,60,.7);}
.nr9-title-big{font-size:72px;line-height:1;letter-spacing:6px;color:${L.gold};text-shadow:0 0 24px rgba(255,201,60,.55),0 4px 0 ${L.void};}
.nr9-title-sub{margin-top:8px;font-size:12px;letter-spacing:2px;color:${L.bone};opacity:.85;}
@keyframes nr9-cta{0%,100%{opacity:1}50%{opacity:.35}}
.nr9-title-cta{margin-top:26px;font-size:16px;letter-spacing:4px;color:${L.cyan};text-shadow:0 0 12px rgba(51,230,255,.7);animation:nr9-cta 1.4s ease-in-out infinite;}
.nr9-title-guide{margin-top:20px;}
@media (max-width:900px){.nr9-title-big{font-size:46px}}
.nr9-guide{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(5,6,13,.78);backdrop-filter:blur(4px);pointer-events:none;}
.nr9-guide.open{display:flex;pointer-events:auto;}
.nr9-guide-panel{width:min(820px,calc(100vw - 48px));max-height:calc(100vh - 48px);overflow:auto;background:rgba(11,13,24,.96);border:2px solid ${L.metalLight};padding:24px;box-shadow:0 0 0 3px rgba(5,6,13,.8),0 16px 60px rgba(0,0,0,.45);clip-path:polygon(18px 0,100% 0,100% calc(100% - 18px),calc(100% - 18px) 100%,0 100%,0 18px);}
.nr9-guide-kicker{font-size:12px;letter-spacing:4px;color:${L.crimson};}
.nr9-guide-title{font-size:34px;line-height:1;letter-spacing:3px;color:${L.gold};margin-top:5px;}
.nr9-guide-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;margin:18px 0 20px;}
.nr9-guide-section{border:1px solid ${L.metal};background:rgba(20,22,31,.72);padding:13px;}
.nr9-guide-heading{font-size:11px;letter-spacing:3px;color:${L.cyan};margin-bottom:7px;}
.nr9-guide-copy{font-family:Arial,sans-serif;font-weight:700;font-size:13px;line-height:1.45;letter-spacing:0;color:${L.bone};text-transform:none;}
.nr9-pickup-legend{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:8px 0 11px;}
.nr9-pickup-item{display:flex;align-items:center;gap:8px;min-width:0;background:rgba(5,6,13,.55);border:1px solid ${L.metal};padding:8px;}
.nr9-pickup-icon{position:relative;flex:0 0 34px;width:34px;height:34px;filter:drop-shadow(0 0 8px currentColor);}
.nr9-pickup-icon.weapon{color:${L.gold};border:3px solid ${L.gold};clip-path:polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%);}
.nr9-pickup-icon.bomb{color:${L.molten};border:3px solid ${L.metalLight};border-radius:50%;background:radial-gradient(circle at 42% 38%,#ffe6b0 0 14%,${L.molten} 15% 47%,${L.charcoal} 49% 62%,transparent 64%);}
.nr9-pickup-icon.shard{color:${L.cyan};}
.nr9-pickup-icon.shard:before{content:'';position:absolute;inset:5px 10px;background:${L.cyan};clip-path:polygon(50% 0,100% 36%,67% 100%,33% 100%,0 36%);}
.nr9-pickup-icon.shard:after{content:'';position:absolute;left:4px;right:4px;bottom:2px;height:7px;background:${L.metal};transform:skewX(-18deg);}
.nr9-pickup-mark{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:18px;line-height:1;color:${L.gold};}
.nr9-pickup-text{min-width:0;}
.nr9-pickup-name{font-size:10px;letter-spacing:1px;color:${L.bone};white-space:nowrap;}
.nr9-pickup-detail{font-family:Arial,sans-serif;font-size:11px;line-height:1.2;letter-spacing:0;color:${L.bone};text-transform:none;opacity:.82;}
.nr9-resume-btn{min-width:136px;}
@media (max-width:720px){.nr9-guide-grid{grid-template-columns:1fr}.nr9-guide-title{font-size:28px}.nr9-guide-panel{padding:18px}.nr9-pickup-legend{grid-template-columns:1fr}}
@keyframes nr9-pop{0%{transform:scale(1)}35%{transform:scale(1.22)}100%{transform:scale(1)}}
.nr9-pop{animation:nr9-pop .18s ease-out;}
@keyframes nr9-pulse{0%{transform:scale(1)}40%{transform:scale(1.25)}100%{transform:scale(1)}}
.nr9-pulse{animation:nr9-pulse .22s ease-out;}
@keyframes nr9-flash{0%{transform:scale(1);filter:brightness(3)}30%{transform:scale(1.6);filter:brightness(3)}100%{transform:scale(1);filter:brightness(1)}}
.nr9-flash{animation:nr9-flash .5s ease-out;}
@keyframes nr9-odpulse{0%,100%{box-shadow:0 0 5px rgba(255,201,60,.6)}50%{box-shadow:0 0 16px rgba(255,201,60,1)}}
.nr9-odready{animation:nr9-odpulse .8s ease-in-out infinite;border-color:${L.gold};}
@keyframes nr9-slide{0%{transform:translateY(-46px);opacity:0}100%{transform:translateY(0);opacity:1}}
.nr9-slide{animation:nr9-slide .45s cubic-bezier(.2,1.4,.4,1);}
@keyframes nr9-pipglow{0%{box-shadow:0 0 14px ${L.acid};filter:brightness(2.4)}100%{box-shadow:0 0 0 rgba(157,255,51,0);filter:brightness(1)}}
.nr9-pipglow{animation:nr9-pipglow .6s ease-out;}
`;
function N(e, t, n = "") {
  let o = document.createElement("div");
  return o.className = t, n && (o.style.cssText = n), e.appendChild(o), o;
}
function sn(e, t, n, o) {
  let r = document.createElement("button");
  return r.className = t, r.type = "button", r.textContent = n, r.addEventListener("click", o), e.appendChild(r), r;
}
function St(e, t) {
  e.classList.remove(t), e.offsetWidth, e.classList.add(t);
}
function ml(e) {
  let t = N(e, "nr9-pickup-legend"),
    n = [["weapon", "WEAPON", "Guns + beam up"], ["bomb", "BOMB", "Nova refill"], ["shard", "SHARD", "Blast Charge energy"]];
  for (let [o, r, a] of n) {
    let s = N(t, "nr9-pickup-item"),
      i = N(s, "nr9-pickup-icon " + o);
    N(i, "nr9-pickup-mark").textContent = o === "weapon" ? "W" : "";
    let l = N(s, "nr9-pickup-text");
    N(l, "nr9-pickup-name").textContent = r, N(l, "nr9-pickup-detail").textContent = a;
  }
}
function sr(e, t = () => {}) {
  if (!document.getElementById("nr9-hud-style")) {
    let P = document.createElement("style");
    P.id = "nr9-hud-style", P.textContent = rr, document.head.appendChild(P);
  }
  let n = N(e.hud.layer("top-left"), "nr9"),
    o = N(n, "nr9-plate");
  N(o, "nr9-label").textContent = "SCORE";
  let r = N(o, "nr9-score");
  r.textContent = "0";
  let a = N(n, "nr9-chain");
  a.style.display = "none";
  let s = N(e.hud.layer("top-right"), "nr9", "display:flex;flex-direction:column;align-items:flex-end;gap:7px;"),
    i = N(s, "nr9-row nr9-hull-row");
  N(i, "nr9-label").textContent = "HP";
  let l = [];
  for (let P = 0; P < b.player.hull; P++) l.push(N(i, "nr9-hull-cell"));
  let c = N(s, "nr9-row");
  N(c, "nr9-label").textContent = "WPN";
  let u = [];
  for (let P = 0; P < b.weapons.maxLevel; P++) u.push(N(c, "nr9-pip"));
  let m = N(s, "nr9-row");
  N(m, "nr9-label").textContent = "BOMBS";
  let h = [];
  for (let P = 0; P < b.bombs.max; P++) h.push(N(m, "nr9-hex"));
  let E = N(s, "nr9-meter"),
    d = N(E, "nr9-meter-fill"),
    w = N(s, "nr9-microlabel");
  w.textContent = "BLAST CHARGE READY \u2014 SHIFT";
  let f = N(document.body, "nr9 nr9-top-center"),
    M = N(f, "nr9 nr9-boss"),
    x = N(M, "nr9-boss-label");
  x.textContent = "VOID SERPENT";
  let T = N(M, "nr9-boss-bar"),
    y = N(T, "nr9-boss-fill"),
    R = N(f, "nr9 nr9-top-notice"),
    S = N(R, "nr9-top-notice-title"),
    H = N(R, "nr9-top-notice-sub"),
    g = e.hud.chip("HOLD MOUSE OR WASD/ARROWS TO FLY \xB7 SPACE BOMB \xB7 SHIFT BLAST CHARGE \xB7 P PAUSE", {
      anchor: "bottom-right"
    });
  g.el.style.opacity = "0.5", g.el.classList.add("nr9-trailer-hide"), g.el.style.fontSize = "11px", g.el.style.letterSpacing = "1px";
  let k = N(e.hud.layer("bottom-left"), "nr9");
  sn(k, "nr9-pause-btn", "PAUSE / GUIDE", t);
  let X = N(document.body, "nr9 nr9-title");
  N(X, "nr9-title-kicker").textContent = "THE SERPENT IS COMING", N(X, "nr9-title-big").textContent = "HYPER STRIKE", N(X, "nr9-title-sub").textContent = "HOLD THE MOUSE TO FLY \u2014 OR WASD / ARROWS \xB7 SPACE BOMB \xB7 SHIFT BLAST CHARGE", N(X, "nr9-title-cta").textContent = "CLICK OR PRESS ANY KEY TO LAUNCH", sn(X, "nr9-pause-btn nr9-title-guide", "GUIDE", t);
  let Z = N(document.body, "nr9 nr9-guide"),
    O = N(Z, "nr9-guide-panel"),
    se = N(O, "nr9-guide-kicker");
  se.textContent = "PAUSED", N(O, "nr9-guide-title").textContent = "HYPER STRIKE";
  let ie = N(O, "nr9-guide-grid"),
    de = [["OBJECTIVE", "Survive each wave, keep the kill chain alive, collect upgrades, and destroy the capital ship turrets during the flyover. When the Void Serpent arrives, break every segment of its tail \u2014 the moment the last one shatters you dive into the Core Breach: a chase-camera finish where you dodge the maw fire, shoot out its shield cores, then destroy the exposed head before the countdown ends. Bombs and Blast Charge work there too."], ["CONTROLS", "WASD or arrows fly. Click and drag to move the ship. Space spends a nova bomb. Shift triggers Blast Charge when charged. P or Escape resumes."], ["THREATS", "Interceptors chase, drones crowd the lane, bombers flood space with orbs, elites alternate aimed volleys and rings, capital turrets fire from the deck, and the serpent body rams."], ["PICKUPS", "Weapon cores raise firepower to level 5, then keep leveling the Blast Charge beam up to level 9. Getting hit drops weapon level by 1. Bomb cores refill nova bombs, and shards charge Blast Charge."]];
  for (let [P, I] of de) {
    let Y = N(ie, "nr9-guide-section");
    N(Y, "nr9-guide-heading").textContent = P, P === "PICKUPS" && ml(Y), N(Y, "nr9-guide-copy").textContent = I;
  }
  sn(O, "nr9-resume-btn", "RESUME", t);
  let A = {
      score: 0,
      hp: -1,
      chain: 0,
      weapon: 0,
      bombs: -1,
      odMode: "",
      odPct: -1,
      bossOn: !1,
      bossPct: -1,
      bossLabel: "",
      paused: !1,
      title: !1
    },
    ge = !1,
    it = 0;
  function Ce(P, I, Y) {
    S.textContent = P, H.textContent = I ?? "", H.style.display = I ? "" : "none", R.classList.remove("nr9-top-pop"), R.offsetWidth, R.classList.add("open", "nr9-top-pop"), it = Date.now() + Y;
  }
  function pt() {
    R.classList.remove("open", "nr9-top-pop");
  }
  function ut(P) {
    for (let I of P.events) if (I.type === "chain") I.milestone ? (St(a, "nr9-flash"), Ce("CHAIN x" + I.value, void 0, 1800)) : St(a, "nr9-pulse");else if (I.type === "weapon") {
      let Y = u[I.level - 1];
      Y && St(Y, "nr9-pipglow");
    } else I.type === "blastCharge" && I.on ? Ce("BLAST CHARGE", void 0, 1600) : I.type === "capital-arrive" ? Ce("CAPITAL SHIP", "DESTROY THE TURRETS", 2400) : I.type === "sector" ? Ce("SECTOR " + (I.tier + 1), "THE RIFT DEEPENS", 2200) : I.type === "boss-phase" && I.phase === "arrive" ? Ce("VOID SERPENT", "DESTROY THE SEGMENTS", 2500) : I.type === "boss-phase" && I.phase === "weakpoints" ? Ce("CORE BREACH", "BREAK THE SHIELD CORES \u2014 DODGE THE MAW FIRE", 3200) : I.type === "boss-phase" && I.phase === "shield-down" ? Ce("SHIELD DOWN", "DESTROY THE HEAD", 2600) : I.type === "boss-phase" && I.phase === "recovered" ? Ce("THE SERPENT RECOVERS", "ITS TAIL REGROWS \u2014 BREAK IT AGAIN", 2600) : I.type === "boss-phase" && I.phase === "defeated" ? Ce("SERPENT DESTROYED", "+10000", 2500) : I.type === "gameover" && Ce("SIGNAL LOST", "FINAL SCORE " + P.score, 3500);
  }
  function Gt(P) {
    let I = P.blastCharge,
      Y = I.active ? Math.max(0, Math.min(1, I.timer / b.blastCharge.duration)) : Math.max(0, Math.min(1, I.charge)),
      Re = Math.round(Y * 100),
      be = I.active ? "active" : Re >= 100 ? "ready" : "charge";
    Re !== A.odPct && (A.odPct = Re, d.style.width = Re + "%"), be !== A.odMode && (A.odMode = be, d.classList.toggle("full", be !== "charge"), E.classList.toggle("nr9-odready", be === "ready"), w.style.visibility = be === "ready" ? "visible" : "hidden");
  }
  function Ct(P) {
    let I = P.boss,
      Y = I !== null;
    if (Y !== A.bossOn && (A.bossOn = Y, A.bossPct = -1, M.style.display = Y ? "flex" : "none", Y && St(M, "nr9-slide")), !I) return;
    let Re, be;
    if (I.phase === "weakpoints") {
      let $ = I.finale.nodes.reduce((mt, bo) => mt + (bo.alive ? 1 : 0), 0),
        J = I.finale.nodes.length || 1,
        De = Math.max(0, Math.ceil(I.finale.timeLeft));
      $ > 0 ? (Re = Math.round($ / J * 100), be = `SHIELD CORES \xB7 ${De}s`) : I.finale.headHp > 0 ? (Re = Math.round(I.finale.headHp / (I.finale.headMaxHp || 1) * 100), be = `DESTROY THE HEAD \xB7 ${De}s`) : (Re = 0, be = "CORE BREACH");
    } else {
      let $ = 0;
      for (let De of I.segments) De.alive && ($ += Math.max(0, De.hp));
      let J = I.segments.length * I.segmentMaxHp;
      Re = J > 0 ? Math.round($ / J * 200) / 2 : 0, be = "VOID SERPENT";
    }
    be !== A.bossLabel && (A.bossLabel = be, x.textContent = be), Re !== A.bossPct && (A.bossPct = Re, y.style.width = Re + "%");
  }
  return {
    update(P) {
      R.classList.contains("open") && Date.now() >= it && pt(), ut(P);
      let I = P.status === "paused" || ge;
      if (I !== A.paused && (A.paused = I, Z.classList.toggle("open", I)), I && (se.textContent = P.status === "paused" ? "PAUSED" : "GUIDE"), P.status === "title" !== A.title && (A.title = P.status === "title", X.classList.toggle("open", A.title)), P.score !== A.score) {
        let Y = P.score > A.score;
        A.score = P.score, r.textContent = String(P.score), Y && St(r, "nr9-pop");
      }
      if (P.chain !== A.chain && (A.chain = P.chain, a.style.display = P.chain > 0 ? "" : "none", P.chain > 0 && (a.textContent = "CHAIN x" + P.chain)), P.player.hp !== A.hp) {
        A.hp >= 0 && P.player.hp < A.hp && St(i, "nr9-hull-hit"), A.hp = P.player.hp;
        for (let Y = 0; Y < l.length; Y++) l[Y]?.classList.toggle("on", Y < P.player.hp);
      }
      if (P.weaponLevel !== A.weapon) {
        A.weapon = P.weaponLevel;
        for (let Y = 0; Y < u.length; Y++) u[Y]?.classList.toggle("on", Y < P.weaponLevel);
      }
      if (P.bombs !== A.bombs) {
        A.bombs = P.bombs;
        for (let Y = 0; Y < h.length; Y++) h[Y]?.classList.toggle("on", Y < P.bombs);
      }
      Gt(P), Ct(P);
    },
    reset() {
      pt(), A.score = 0, A.hp = -1, A.chain = 0, A.weapon = 0, A.bombs = -1, A.odMode = "", A.odPct = -1, A.bossOn = !1, A.bossPct = -1, A.bossLabel = "", A.paused = !1, r.textContent = "0", r.classList.remove("nr9-pop"), i.classList.remove("nr9-hull-hit");
      for (let P of l) P.classList.remove("on");
      a.style.display = "none", a.classList.remove("nr9-pulse", "nr9-flash");
      for (let P of u) P.classList.remove("nr9-pipglow");
      E.classList.remove("nr9-odready"), d.classList.remove("full"), d.style.width = "0%", w.style.visibility = "hidden", M.style.display = "none", Z.classList.remove("open"), A.title = !1, X.classList.remove("open"), ge = !1;
    },
    toggleGuide() {
      ge = !ge;
    },
    isGuideOpen() {
      return ge;
    }
  };
}
var It = [{
  title: "Capital ship / Full Blast",
  durationMs: 3500,
  seed: 922,
  moment: "Open under the colossal warship as its turrets fire; unleash the level 9 beam through successive escort formations.",
  scene: "blast",
  camera: "overhead",
  level: 9,
  capitalAt: 9,
  cues: [{
    at: 0.25,
    action: "blast"
  }, {
    at: 0.7,
    action: "wave",
    formation: "escort"
  }, {
    at: 1.6,
    action: "wave",
    formation: "escort"
  }, {
    at: 2.5,
    action: "wave",
    formation: "swarm"
  }]
}, {
  title: "Nova double strike",
  durationMs: 2500,
  seed: 933,
  moment: "Two quick nova detonations tear apart packed enemy formations and clear the incoming fire.",
  scene: "nova",
  camera: "overhead",
  level: 9,
  cues: [{
    at: 0.45,
    action: "bomb"
  }, {
    at: 1.05,
    action: "wave",
    formation: "swarm"
  }, {
    at: 1.65,
    action: "bomb"
  }]
}, {
  title: "Serpent / unbroken final assault",
  durationMs: 11e3,
  seed: 944,
  moment: "Shoot the armored serpent overhead, dive seamlessly behind the ship, smash its shield cores and finish the skull in one continuous fight.",
  scene: "serpent",
  camera: "dive",
  level: 9,
  cues: [{
    at: 4,
    action: "blast"
  }, {
    at: 5.4,
    action: "bomb"
  }, {
    at: 6.2,
    action: "bomb"
  }]
}];
function ln(e, t) {
  let n = t === "swarm" ? 12 : 5;
  for (let o = 0; o < n; o++) {
    let r = t === "escort" && o === 2 ? "bomber" : o % 3 === 0 ? "drone" : "interceptor",
      a = b.enemies[r],
      s = (o % 5 - 2) * 88,
      i = t === "swarm" ? 60 + Math.floor(o / 5) * 100 : 160 + Math.abs(o - 2) * 46;
    e.enemies.push({
      id: Ee(e),
      kind: r,
      x: s,
      y: i,
      vx: 0,
      vy: -a.speed,
      hp: a.hp,
      maxHp: a.hp,
      radius: a.radius,
      t: 0,
      fireCd: 0.15 + o * 0.09,
      pattern: 0,
      seed: o / n,
      baseX: s
    });
  }
}
function ir(e) {
  let t = Qe({
    weaponLevel: e.level,
    bombs: 4,
    player: {
      y: -220
    },
    spawn: {
      nextWaveAt: 1e4
    },
    blastCharge: {
      charge: 1
    },
    env: {
      scroll: 800
    }
  });
  if (e.capitalAt !== void 0 && (t.env.capitalShipOn = !0, t.env.capitalShipT = e.capitalAt), e.scene === "serpent") {
    let n = lt({
      phase: "active",
      x: 0,
      y: 190,
      t: 2.1,
      patternT: 6
    });
    n.segments.forEach((o, r) => {
      o.x = Math.sin(r * 0.75) * 150, o.y = 135 - r * 52, o.hp = 12, o.alive = !0;
    }), t.boss = n;
  } else ln(t, e.scene === "nova" ? "swarm" : "escort");
  return t;
}
function lr(e, t, n) {
  n.action === "bomb" && t.pressed.add(" "), n.action === "blast" && t.pressed.add("shift"), n.action === "wave" && ln(e, n.formation ?? "escort");
}
function cn(e, t, n) {
  return e + Math.max(-n, Math.min(n, t - e));
}
function dl(e, t, n, o) {
  let r = e.boss;
  if (r?.phase === "weakpoints") {
    let a = r.finale,
      s = a.nodes.find(u => u.alive),
      i = r.patternT + o,
      l = (Math.sin(i * 0.5) * 200 + (s?.x ?? 0)) / 1.18,
      c = (60 + Math.sin(i * 0.72) * 110 + (s?.y ?? 0) - 120) / 1.18;
    a.shipX = cn(a.shipX, l, b.finale.shipSpeed * o), a.shipY = cn(a.shipY, c, b.finale.shipSpeed * o);
  } else {
    r?.phase === "active" && (r.patternT = 6 + Math.sin(n * 0.8) * 0.5);
    let s = r?.segments.find(i => i.alive)?.x ?? Math.sin(n * 2.1) * (t.scene === "nova" ? 95 : 135);
    e.player.x = cn(e.player.x, s, b.player.speed * o), e.player.y = -220 + Math.sin(n * 2.6) * 24;
  }
}
function cr(e, t, n, o, r) {
  t.keys.clear(), t.pointer.held = !1, t.pointer.clicked = !1, t.pauseRequested = !1, e.player.hp = b.player.hull;
  let a = e.weaponLevel;
  dl(e, n, o, r), e.time += r;
  let s = e.boss?.phase === "weakpoints";
  s || (At(e, t, r), Xt(e, t, r), Wt(e, t, r), qt(e, t, r), jt(e, t, r), Qt(e, t, r), ro(e, t, r)), Lt(e, t, r), e.weaponLevel = Math.max(a, e.weaponLevel), no(e, r), so(e, t, r), s || ao(e, t, r), Tt(e, t, r), mo(e, t, r), rt(e, t, r), t.pressed.clear(), t.hitStop.frozen(r), t.tweens.update(r);
}
function pn(e, t) {
  At(e, t, 0), Lt(e, t, 0), Tt(e, t, 0), rt(e, t, 0);
}
function pr(e, t) {
  let n = Math.random,
    o = e >>> 0;
  Math.random = () => (o = Math.imul(o, 1664525) + 1013904223 >>> 0, o / 4294967296);
  try {
    return t();
  } finally {
    Math.random = n;
  }
}
function ur(e, t, n) {
  let o = !1,
    r = 0,
    a = 0,
    s = 0,
    i = 0,
    l = "",
    c = Qe(),
    u = {
      maxLevel: 1,
      kills: 0,
      blastKills: 0,
      bombs: 0,
      breach: !1,
      bossKilled: !1,
      bombKills: 0,
      breachAt: -1,
      bossKillAt: -1
    },
    m = [],
    h = document.createElement("style");
  h.textContent = "html.nr9-trailer .nr9,html.nr9-trailer .nr9-trailer-hide{display:none!important}", document.head.appendChild(h);
  function E() {
    e.keys.clear(), e.pressed.clear(), e.pointer.held = !1, e.pointer.clicked = !1, e.pauseRequested = !1;
  }
  function d(T) {
    e.fx.update(10), e.hitStop.frozen(10), e.tweens.cancelAll(), rt(Qe(), e, 0), ra(e, T);
  }
  function w(T) {
    r = T, a = 0, s = 0, i = 0;
    let y = It[T];
    c = ir(y), u = {
      maxLevel: y.level,
      kills: 0,
      blastKills: 0,
      bombs: 0,
      breach: !1,
      bossKilled: !1,
      bombKills: 0,
      breachAt: -1,
      bossKillAt: -1
    }, E(), d(c), pr(y.seed, () => pn(c, e));
    let R = y.scene === "serpent" ? "musicBoss" : "music";
    R !== l && (l = R, e.game.audio.playMusic(R, {
      loop: !0,
      volume: 0.4,
      fadeIn: 0.15
    })), console.info(`[Trailer] Shot ${T + 1}: ${y.title}`);
  }
  function f() {
    console.info(`[Trailer] Shot ${r + 1} payoff ${JSON.stringify(u)}`);
  }
  function M(T = !0) {
    if (!o) return;
    o = !1, E();
    let y = structuredClone(t());
    d(y), m.forEach(R => R()), m = [], pn(y, e), document.documentElement.classList.remove("nr9-trailer"), n(), T && window.dispatchEvent(new Event("remix:trailer-end")), console.info("[Trailer] End; original run restored");
  }
  function x(T = 0) {
    o && M(!1), m = [], e.bg.traverse(y => {
      let R = y.position.clone(),
        S = y.quaternion.clone(),
        H = y.scale.clone(),
        g = y.visible;
      m.push(() => {
        y.position.copy(R), y.quaternion.copy(S), y.scale.copy(H), y.visible = g;
      });
    }), o = !0, l = "", document.documentElement.classList.add("nr9-trailer"), e.game.audio.unlock().catch(() => {}), w(Math.max(0, Math.min(It.length - 1, T)));
  }
  return window.addEventListener("remix:trailer-start", T => {
    T.preventDefault(), x();
  }), {
    get active() {
      return o;
    },
    start: x,
    stop: M,
    update(T) {
      if (!o) return;
      let y = It[r];
      pr(y.seed + i++ * 101, () => {
        for (; s < y.cues.length && y.cues[s].at <= a + 1e-6;) lr(c, e, y.cues[s++]);
        cr(c, e, y, a, T), u.maxLevel = Math.max(u.maxLevel, c.weaponLevel), c.boss?.phase === "weakpoints" && !u.breach && (u.breach = !0, u.breachAt = +a.toFixed(2));
        for (let R of c.events) R.type === "bomb" && u.bombs++, R.type === "kill" && (u.kills++, c.blastCharge.active && u.blastKills++, c.events.some(S => S.type === "bomb") && u.bombKills++, R.kind === "boss" && (u.bossKilled = !0, u.bossKillAt = +a.toFixed(2)));
        c.events.length = 0;
      }), a += T, a + 1e-6 >= y.durationMs / 1e3 && (f(), r + 1 < It.length ? w(r + 1) : M());
    }
  };
}
var _ = Qe({
    status: "title"
  }),
  B,
  st,
  kt = !1,
  ct = !1,
  un = 0,
  Tl = new xe.Plane(new xe.Vector3(0, 0, 1), 0),
  Ml = new xe.Vector3(),
  hr = 40,
  mr = 360 / Math.tan(xe.MathUtils.degToRad(hr / 2)),
  dr = yl(fl({
    fov: hr,
    position: new xe.Vector3(0, 0, mr),
    lookAt: new xe.Vector3(0, 0, 0),
    near: 40,
    far: mr + 1600
  }), {
    maxOffset: 13,
    maxRoll: 0.028,
    decay: 1.6
  });
await hl({
  design: {
    width: 1280,
    height: 720
  },
  camera: dr,
  background: p.void,
  assets: {
    audio: {
      shot: "./assets/shot-zsWB.wav",
      hit: "./assets/hit-WASe.wav",
      boomS: "./assets/boom-s-KUek.wav",
      boomB: "./assets/boom-b-0JqX.wav",
      nova: "./assets/nova-gO9n.wav",
      pickup: "./assets/pickup-Hfqb.wav",
      powerup: "./assets/powerup-YYaN.wav",
      chain: "./assets/chain-oaGq.wav",
      playerHit: "./assets/player-hit-OCBf.wav",
      blastCharge: "./assets/blast-charge-16Fq.wav",
      alarm: "./assets/alarm-3w6L.wav",
      gameover: "./assets/gameover-IYtT.wav",
      music: "./assets/music-nL6s.wav",
      musicBoss: "./assets/music-boss-IjB7.wav"
    }
  },
  setup(e) {
    let t = gl(e.scene, "night", {
      shadows: !1
    });
    e.scene.fog = null, e.scene.background = new xe.Color(p.void), t.key.position.set(-320, 260, 420), t.key.intensity = 2.4;
    let n = new xe.DirectionalLight(p.cyan, 0.5);
    n.position.set(300, -200, 260), e.scene.add(n);
    let o = new xe.Group(),
      r = new xe.Group();
    e.scene.add(r, o);
    let a = Nt();
    o.add(a.group), B = {
      game: e,
      root: o,
      bg: r,
      keys: new Set(),
      pressed: new Set(),
      pointer: {
        held: !1,
        x: 0,
        y: 0,
        clicked: !1
      },
      pauseRequested: !1,
      devQueue: [],
      tweens: bl(),
      hitStop: El(),
      shake: dr,
      visuals: new Map(),
      fx: null,
      hud: null,
      playerShip: a,
      bossVisual: null,
      sfx(i, l) {
        try {
          e.audio.playSfx(i, l);
        } catch {}
      }
    }, B.hud = sr(e, () => {
      _.status === "title" ? B.hud.toggleGuide() : B.pauseRequested = !0;
    }), B.fx = Da(B), En(B), Sa(B), st = ur(B, () => _, () => {
      kt ? e.audio.playMusic(ct ? "musicBoss" : "music", {
        loop: !0,
        volume: 0.4,
        fadeIn: 0.3
      }) : e.audio.stopMusic(0.2);
    });
    let s = () => {
      st.active || kt || (window.removeEventListener("keydown", s), kt = !0, e.audio.unlock().then(() => e.audio.playMusic("music", {
        loop: !0,
        volume: 0.4,
        fadeIn: 1.5
      })).catch(() => {}));
    };
    e.input.on("press", () => {
      st.active || (_.pointerDrag = null, B.pointer.held = !0, s());
    }), e.input.on("release", () => {
      st.active || (_.pointerDrag = null, B.pointer.held = !1);
    }), e.input.on("tap", () => {
      st.active || (B.pointer.clicked = !0);
    }), window.addEventListener("keydown", s);
  },
  update(e, t) {
    if (st.active) {
      st.update(t);
      return;
    }
    if (_.status === "title") {
      let n = B.hud.isGuideOpen();
      un = n ? 0.35 : Math.max(0, un - t);
      let o = !n && un <= 0 && (B.pressed.size > 0 || B.pointer.clicked || B.pointer.held);
      B.pauseRequested = !1, B.playerShip.group.position.set(_.player.x, _.player.y, 0), B.playerShip.update?.(t), Tt(_, B, t), B.hud.update(_), rt(_, B, t), B.pressed.clear(), B.pointer.clicked = !1, B.tweens.update(t), o && (_.status = "running");
      return;
    }
    if ((B.pauseRequested || B.pressed.has("p") || B.pressed.has("escape")) && (_.status === "running" ? (_.status = "paused", _.pointerDrag = null, B.pointer.held = !1) : _.status === "paused" && (_.status = "running"), B.pauseRequested = !1), _.status === "paused") {
      B.hud.update(_), B.pressed.clear(), B.pointer.clicked = !1;
      return;
    }
    if (B.hitStop.frozen(t)) {
      B.tweens.update(t);
      return;
    }
    if (B.pointer.held && e.input.primary) {
      let n = e.input.pickPlane(Tl, Ml, e.input.primary);
      n && (B.pointer.x = n.x, B.pointer.y = n.y);
    }
    if (_.status === "running") {
      _.time += t, nr(_, B);
      let n = _.boss?.phase === "weakpoints";
      n || (At(_, B, t), Xt(_, B, t), wn(_, B, t), Wt(_, B, t), qt(_, B, t), jt(_, B, t), Qt(_, B, t), ro(_, B, t)), Lt(_, B, t), no(_, t), so(_, B, t), n || ao(_, B, t);
    }
    ia(_, B, t), Tt(_, B, t), mo(_, B, t), B.hud.update(_), rt(_, B, t);
    for (let n of _.events) {
      let o = n.type === "boss-phase" && (n.phase === "arrive" || n.phase === "weakpoints"),
        r = n.type === "kill" && n.kind === "boss" || n.type === "gameover";
      if (o && !ct) {
        if (ct = !0, kt) try {
          e.audio.playMusic("musicBoss", {
            loop: !0,
            volume: 0.46,
            fadeIn: 0.9
          });
        } catch {}
      } else if (r && ct && (ct = !1, kt)) try {
        e.audio.playMusic("music", {
          loop: !0,
          volume: 0.4,
          fadeIn: 1.4
        });
      } catch {}
    }
    _.events.length = 0, B.pressed.clear(), B.pointer.clicked = !1, B.tweens.update(t);
  },
  restart() {
    if (st.stop(), ct && kt) {
      ct = !1;
      try {
        B.game.audio.playMusic("music", {
          loop: !0,
          volume: 0.4,
          fadeIn: 1
        });
      } catch {}
    }
    _ = Qe(), B.pointer.held = !1, B.tweens.cancelAll(), B.pauseRequested = !1, B.pressed.clear(), B.pointer.clicked = !1, B.hud.reset();
  }
});
