import * as ko from "./_remote/2fdbed0dad19dbdd/three.js";
import * as Ee from "./_remote/2fdbed0dad19dbdd/three.js";
import * as ke from "./_remote/2fdbed0dad19dbdd/three.js";
import * as rt from "./_remote/2fdbed0dad19dbdd/three.js";
import { createGame as zi, createTweens as Vi, shakeRig as Ci } from "./_remote/2b8869323520e5d7/index.js";
import * as oa from "./_remote/2fdbed0dad19dbdd/three.js";
import "./_remote/2fdbed0dad19dbdd/three.js";
import * as Ge from "./_remote/2fdbed0dad19dbdd/three.js";
import * as ge from "./_remote/2fdbed0dad19dbdd/three.js";
import "./_remote/2fdbed0dad19dbdd/three.js";
import * as hr from "./_remote/2fdbed0dad19dbdd/three.js";
import * as mr from "./_remote/2fdbed0dad19dbdd/three.js";
import * as se from "./_remote/2fdbed0dad19dbdd/three.js";
import * as Xt from "./_remote/2fdbed0dad19dbdd/three.js";
import { applyLighting as Xi, destroy as Sr } from "./_remote/2b8869323520e5d7/index.js";
import * as Ze from "./_remote/2fdbed0dad19dbdd/three.js";
import * as je from "./_remote/2fdbed0dad19dbdd/three.js";
import * as ie from "./_remote/2fdbed0dad19dbdd/three.js";
import * as Pe from "./_remote/2fdbed0dad19dbdd/three.js";
import * as Do from "./_remote/2fdbed0dad19dbdd/three.js";
import * as X from "./_remote/2fdbed0dad19dbdd/three.js";
import * as ce from "./_remote/2fdbed0dad19dbdd/three.js";
import * as Ho from "./_remote/2fdbed0dad19dbdd/three.js";
import * as Ye from "./_remote/2fdbed0dad19dbdd/three.js";
import * as Le from "./_remote/2fdbed0dad19dbdd/three.js";
import * as vr from "./_remote/2fdbed0dad19dbdd/three.js";
import * as Dt from "./_remote/2fdbed0dad19dbdd/three.js";
import * as ue from "./_remote/2fdbed0dad19dbdd/three.js";
import * as sa from "./_remote/2fdbed0dad19dbdd/three.js";
import * as Pt from "./_remote/2fdbed0dad19dbdd/three.js";
import * as ve from "./_remote/2fdbed0dad19dbdd/three.js";
import * as Me from "./_remote/2fdbed0dad19dbdd/three.js";
import * as Je from "./_remote/2fdbed0dad19dbdd/three.js";
import * as la from "./_remote/2fdbed0dad19dbdd/three.js";
import * as we from "./_remote/2fdbed0dad19dbdd/three.js";
import * as da from "./_remote/2fdbed0dad19dbdd/three.js";
import * as ee from "./_remote/2fdbed0dad19dbdd/three.js";
import * as $ from "./_remote/2fdbed0dad19dbdd/three.js";
import * as ht from "./_remote/2fdbed0dad19dbdd/three.js";
import * as Ke from "./_remote/2fdbed0dad19dbdd/three.js";
import * as Ko from "./_remote/2fdbed0dad19dbdd/three.js";
import * as _o from "./_remote/2fdbed0dad19dbdd/three.js";
import * as kt from "./_remote/2fdbed0dad19dbdd/three.js";
import * as Zo from "./_remote/2fdbed0dad19dbdd/three.js";
import * as br from "./_remote/2fdbed0dad19dbdd/three.js";
import "./_remote/2fdbed0dad19dbdd/three.js";
import * as ca from "./_remote/2fdbed0dad19dbdd/three.js";
import "./_remote/2fdbed0dad19dbdd/three.js";
import * as Zt from "./_remote/2fdbed0dad19dbdd/three.js";
import "./_remote/2fdbed0dad19dbdd/three.js";
var G = {
    step: 1.5,
    halfWidth: 5,
    apron: 3.4,
    kerb: 0.75,
    thickness: 0.9,
    overhang: 1
  },
  O = {
    gravity: 30,
    rideHeight: 0.62,
    topSpeed: 62,
    boostSpeed: 88,
    reverseSpeed: 16,
    accel: 46,
    accelFalloff: 1.35,
    brakeForce: 62,
    coastDrag: 3.2,
    airDrag: 0.0055,
    grip: 13.5,
    apronGrip: 7.2,
    handbrakeGrip: 2.6,
    steerRate: 2.55,
    steerSpeedFalloff: 0.56,
    steerEase: 9.5,
    steerReturn: 13,
    driftYawAssist: 0.85,
    driftFullSlip: 9,
    stick: 42,
    loopMinSpeed: 26,
    alignGround: 14,
    alignAir: 2.4,
    airPitch: 2.1,
    airRoll: 2.6,
    jumpKick: 2.5,
    hardLanding: 26,
    landingScrub: 0.35,
    boostDuration: 1.35,
    boostForce: 58,
    fallTimeout: 1.6,
    fallDepth: 42,
    wallBounce: 0.45,
    dirtSpeed: 24,
    dirtAccel: 20,
    dirtGrip: 9,
    dirtDrag: 5,
    dirtRelease: 0.6
  },
  Ne = {
    countdown: 2.1,
    startFrame: 2,
    resultsDelay: 0.35,
    ghostRate: 30,
    ghostMaxSeconds: 300
  },
  Da = {
    speedToKmh: 5.4,
    maxRpm: 8600,
    gears: 6
  };
function Yr(e = {}) {
  return {
    championship: null,
    peerClocks: {},
    clockPings: {},
    poseWallTime: null,
    startAt: null,
    lastSnapshotTime: -1,
    clock: 0,
    renderTime: 0,
    clockOffset: null,
    played: !1,
    score: 0,
    scoredRound: -1,
    cancelPending: !1,
    open: !1,
    phase: "off",
    code: "",
    selfId: "",
    hostId: "",
    track: 0,
    round: 0,
    inviteOnConnect: !1,
    seats: [],
    ready: {},
    racers: [],
    elapsed: 0,
    sendTimer: 0,
    sequence: 0,
    receivedSequence: -1,
    silence: 0,
    finishGrace: null,
    error: "",
    busy: !1,
    ...e
  };
}
function ni(e = {}) {
  return {
    active: !1,
    shot: 0,
    time: 0,
    shotTime: 0,
    player: {
      botError: 0,
      lane: 0
    },
    ghosts: [],
    returnTrack: 0,
    ...e
  };
}
var ln = (e = 0, t = 0, r = 0) => ({
    x: e,
    y: t,
    z: r
  }),
  oi = () => ({
    x: 0,
    y: 0,
    z: 0,
    w: 1
  });
function cr() {
  return {
    teleport: 0,
    pos: ln(),
    vel: ln(),
    quat: oi(),
    grounded: !0,
    airTime: 0,
    groundTime: 0,
    frameIndex: 0,
    progress: 0,
    lateral: 0,
    steer: 0,
    throttle: 0,
    brake: 0,
    handbrake: !1,
    speed: 0,
    slip: 0,
    drift: 0,
    rpm: 0,
    gear: 1,
    boost: 0,
    falling: 0,
    dirt: !1,
    wheelAngle: 0,
    suspension: [0, 0, 0, 0],
    landed: 0,
    bumped: 0
  };
}
function Mo() {
  return {
    phase: "countdown",
    time: 0,
    countdown: Ne.countdown,
    checkpoints: 0,
    splits: [],
    respawnFrame: Ne.startFrame,
    respawnTime: 0,
    finishTime: null,
    previousBest: null,
    isRecord: !1,
    medal: null,
    attempt: 1,
    respawnFlash: 0,
    watchTime: 0,
    splitFlash: 0,
    splitTime: 0,
    splitDelta: null,
    respawns: 0,
    driftHold: 0,
    airHold: 0
  };
}
function _a(e = {}) {
  return {
    trailer: ni(e.trailer),
    multiplayer: Yr(e.multiplayer),
    run: {
      ...Mo(),
      ...e.run
    },
    car: {
      ...cr(),
      ...e.car
    },
    ghost: {
      active: !1,
      time: 0,
      delta: 0,
      visible: !0,
      ...e.ghost
    },
    ui: {
      screen: "menu",
      trackIndex: 0,
      menuIndex: 0,
      hintsVisible: !0,
      camera: "chase",
      ghostEnabled: !0,
      watching: !1,
      ...e.ui
    },
    session: {
      score: 0,
      completed: [],
      ...e.session
    },
    records: {
      ...e.records
    },
    stats: {
      meters: 0,
      ...e.stats
    }
  };
}
var ii = new ke.Vector3(0, 0, -1),
  si = new ke.Vector3(0, 1, 0),
  li = new ke.Vector3(1, 0, 0);
function di(e, t, r, n, o) {
  let a = e.radius ?? 16,
    i = e.axial ?? 108,
    l = e.turns ?? 1,
    s = i / (Math.PI * 2),
    c = Math.PI * 2 * Math.hypot(a, s),
    u = Math.max(48, Math.round(c * l / n)),
    p = c * l / u,
    d = Math.atan2(a, s),
    h = si.clone().applyQuaternion(r),
    g = new ke.Quaternion().setFromAxisAngle(h, -d * e.dir),
    b = ii.clone().applyQuaternion(r).applyQuaternion(g),
    f = li.clone().applyQuaternion(r).applyQuaternion(g),
    y = t.clone().addScaledVector(h, a),
    v = new ke.Vector3(),
    w = new ke.Vector3(),
    k = new ke.Vector3(),
    x = new ke.Vector3(),
    m = new ke.Vector3(),
    M = new ke.Vector3(),
    S = new ke.Quaternion(),
    I = new ke.Matrix4();
  for (let A = 1; A <= u; A++) {
    let q = Math.PI * 2 * l * A / u,
      E = Math.cos(q),
      z = Math.sin(q);
    v.copy(h).multiplyScalar(-E).addScaledVector(f, -z * e.dir), k.copy(y).addScaledVector(v, a).addScaledVector(b, i * l * A / u), w.copy(h).multiplyScalar(a * z).addScaledVector(f, -a * E * e.dir).addScaledVector(b, s).normalize(), x.copy(v).multiplyScalar(-1), m.crossVectors(w, x).normalize(), M.copy(w).multiplyScalar(-1), I.makeBasis(m, x, M), S.setFromRotationMatrix(I), o(k, S, p);
  }
  t.addScaledVector(b, i * l);
}
function ci(e, t, r, n, o) {
  let a = t.clone(),
    i = r.clone(),
    l = Math.PI * 2 * e.turns,
    s = l * e.radius,
    c = Math.ceil(Math.hypot(s, e.rise) / n),
    u = t.clone(),
    p = new rt.Vector3(),
    d = new rt.Quaternion(),
    h = new rt.Quaternion(),
    g = new rt.Quaternion(),
    b = new rt.Vector3(0, 1, 0),
    f = new rt.Vector3(1, 0, 0),
    y = new rt.Vector3(0, 0, -1);
  for (let v = 1; v <= c; v++) {
    let w = v / c,
      k = l * w,
      x = e.rise * (w - Math.sin(2 * Math.PI * w) / (2 * Math.PI)),
      m = e.rise * (1 - Math.cos(2 * Math.PI * w)) / s;
    p.set(e.dir * e.radius * (1 - Math.cos(k)), x, -e.radius * Math.sin(k)).applyQuaternion(i).add(a);
    let M = e.dir * 0.1 * Math.sin(Math.PI * Math.min(1, w / 0.12) / 2) ** 2 * Math.sin(Math.PI * Math.min(1, (1 - w) / 0.12) / 2) ** 2;
    d.setFromAxisAngle(b, -e.dir * k), h.setFromAxisAngle(f, Math.atan(m)), g.setFromAxisAngle(y, M), r.copy(i).multiply(d).multiply(h), o(p, r.clone().multiply(g), p.distanceTo(u), M), u.copy(p);
  }
  t.copy(p);
}
var ir = new Ee.Vector3(0, 0, -1),
  pa = new Ee.Vector3(0, 1, 0),
  Ot = new Ee.Vector3(1, 0, 0),
  ua = Math.PI / 180,
  dn = 0.2,
  cn = 0.3,
  pi = 22,
  ui = 30;
function hi() {
  let e = G.step,
    t = [],
    r = new Ee.Vector3(0, 0, 0),
    n = new Ee.Quaternion(),
    o = 0,
    a = G.halfWidth,
    i = G.apron,
    l = 0,
    s = new Ee.Quaternion(),
    c = new Ee.Vector3(),
    u = new Ee.Vector3(),
    p = (f, y) => {
      y !== 0 && (u.copy(f), s.setFromAxisAngle(u, y), n.multiply(s).normalize());
    },
    d = (f, y) => {
      let v = n.clone();
      s.setFromAxisAngle(ir, o), v.multiply(s).normalize();
      let w = ir.clone().applyQuaternion(v),
        k = pa.clone().applyQuaternion(v),
        x = Ot.clone().applyQuaternion(v);
      t.push({
        index: t.length,
        p: r.clone(),
        q: v,
        fwd: w,
        up: k,
        right: x,
        dist: l,
        halfWidth: a,
        apron: i,
        road: f,
        boost: y,
        bank: o,
        steep: Math.abs(w.y) > 0.5,
        curvature: 0
      });
    },
    h = (f, y, v) => {
      let w = ir.clone().applyQuaternion(y),
        k = pa.clone().applyQuaternion(y),
        x = Ot.clone().applyQuaternion(y);
      t.push({
        index: t.length,
        p: f.clone(),
        q: y.clone(),
        fwd: w,
        up: k,
        right: x,
        dist: l,
        halfWidth: a,
        apron: i,
        road: !0,
        boost: !1,
        bank: v,
        steep: Math.abs(w.y) > 0.5,
        curvature: 0
      });
    },
    g = f => {
      c.copy(ir).applyQuaternion(n).multiplyScalar(f), r.add(c), l += f;
    },
    b = f => {
      c.copy(Ot).applyQuaternion(n).multiplyScalar(f), r.add(c);
    };
  return {
    frames: t,
    emit: d,
    applyPiece: f => {
      switch (f.t) {
        case "straight":
        case "boost":
          {
            let y = Math.max(1, Math.round(f.len / e));
            for (let v = 0; v < y; v++) g(e), d(!0, f.t === "boost");
            break;
          }
        case "gap":
          {
            let y = Math.max(1, Math.round(f.len / e)),
              v = f.launch ?? 0;
            if (v <= 0) {
              for (let m = 0; m < y; m++) g(e), d(!1, !1);
              break;
            }
            let w = xr(n),
              k = v * Math.cos(w),
              x = v * Math.sin(w);
            for (let m = 0; m < y; m++) {
              let M = e / Math.max(4, Math.hypot(k, x));
              x -= ui * M;
              let S = Math.atan2(x, k);
              p(Ot, S - xr(n)), g(e), d(!1, !1);
            }
            break;
          }
        case "turn":
        case "wall":
          {
            let y = f.angle * ua,
              v = y * f.radius,
              w = Math.max(2, Math.round(v / e)),
              k = (f.bank ?? (f.t === "wall" ? 82 : 0)) * ua * f.dir,
              x = o,
              m = f.t === "wall" ? 0.42 : 0.26;
            for (let M = 0; M < w; M++) {
              let S = (M + 1) / w,
                I = S < m ? S / m : S > 1 - m ? (1 - S) / m : 1;
              o = x + (k - x) * wr(I), p(pa, -f.dir * y / w), g(v / w), d(!0, !1);
            }
            o = x;
            break;
          }
        case "pitch":
        case "bank":
        case "width":
          {
            let y = Math.max(1, Math.round(f.len / e)),
              v = f.t === "pitch" ? xr(n) : f.t === "bank" ? o : a,
              w = f.t === "width" ? f.to : f.to * ua;
            for (let k = 0; k < y; k++) {
              let x = wr((k + 1) / y),
                m = v + (w - v) * x;
              if (f.t === "pitch") {
                let M = xr(n);
                p(Ot, m - M);
              } else f.t === "bank" ? o = m : a = m;
              g(e), d(!0, !1);
            }
            break;
          }
        case "loop":
          {
            let y = Math.PI * 2 * f.radius,
              v = Math.max(24, Math.round(y / e)),
              w = (f.offset ?? pi) * (f.dir ?? 1),
              k = Math.hypot(y / v, w / v),
              x = [],
              m = 0;
            for (let M = 0; M < v; M++) {
              let S = (M + 0.5) / v,
                I = cn + (1 - cn) * wr(Math.min(1, S / dn)) * wr(Math.min(1, (1 - S) / dn));
              x.push(I), m += I;
            }
            for (let M = 0; M < v; M++) p(Ot, Math.PI * 2 * x[M] / m), g(y / v), b(w / v), l += k - y / v, d(!0, !1);
            break;
          }
        case "spiral":
          {
            ci(f, r, n, e, (y, v, w, k) => {
              l += w, h(y, v, k);
            });
            break;
          }
        case "corkscrew":
          {
            di(f, r, n, e, (y, v, w) => {
              l += w, h(y, v, 0);
            });
            break;
          }
      }
    }
  };
}
var wr = e => e * e * e * (e * (e * 6 - 15) + 10);
function xr(e) {
  let t = ir.clone().applyQuaternion(e);
  return Math.asin(Ee.MathUtils.clamp(t.y, -1, 1));
}
var So = (e, t, r) => `${e},${t},${r}`;
function na(e) {
  let t = [],
    r = -1,
    n = [],
    o = hi(),
    a = o.frames;
  o.emit(!0, !1);
  for (let c of e) switch (c.t) {
    case "checkpoint":
      t.push(a.length - 1);
      break;
    case "finish":
      r = a.length - 1;
      break;
    default:
      let u = a.length - 1;
      if (o.applyPiece(c), n.push({
        t: c.t,
        start: u,
        end: a.length - 1
      }), c.t === "spiral") {
        let p = Math.round(c.turns * 4);
        for (let d = 1; d <= p; d++) t.push(u + Math.round((a.length - 1 - u) * d / p));
      }
  }
  for (let c = 0; c < a.length; c++) {
    let u = a[Math.max(0, c - 1)],
      p = a[Math.min(a.length - 1, c + 1)],
      d = Math.max(1e-6, p.dist - u.dist);
    a[c].curvature = u.fwd.angleTo(p.fwd) / d;
  }
  r < 0 && (r = a.length - 1);
  let i = new ko.Box3();
  for (let c of a) i.expandByPoint(c.p);
  i.expandByScalar(G.halfWidth + G.apron + 4);
  let l = 14,
    s = new Map();
  for (let c of a) {
    let u = Math.floor(c.p.x / l),
      p = Math.floor(c.p.y / l),
      d = Math.floor(c.p.z / l),
      h = So(u, p, d),
      g = s.get(h);
    g ? g.push(c.index) : s.set(h, [c.index]);
  }
  return {
    frames: a,
    length: a[a.length - 1].dist,
    checkpoints: t,
    finishFrame: r,
    bounds: i,
    grid: s,
    cellSize: l,
    features: n
  };
}
function zo(e, t, r) {
  r.length = 0;
  let n = e.cellSize,
    o = Math.floor(t.x / n),
    a = Math.floor(t.y / n),
    i = Math.floor(t.z / n);
  for (let l = o - 1; l <= o + 1; l++) for (let s = a - 1; s <= a + 1; s++) for (let c = i - 1; c <= i + 1; c++) {
    let u = e.grid.get(So(l, s, c));
    if (u) for (let p of u) r.push(p);
  }
  return r;
}
var te = () => ({
    t: "checkpoint"
  }),
  tr = (e, t, r, n = 24) => [{
    t: "pitch",
    to: e,
    len: t
  }, {
    t: "gap",
    len: r,
    launch: 30
  }, {
    t: "pitch",
    to: -e * 0.45,
    len: n
  }, {
    t: "pitch",
    to: 0,
    len: 20
  }, {
    t: "straight",
    len: 18
  }],
  yr = (e, t = 34, r = 42) => [{
    t: "turn",
    dir: e,
    angle: t,
    radius: r,
    bank: 8
  }, {
    t: "turn",
    dir: -e,
    angle: t,
    radius: r,
    bank: 8
  }],
  Ht = (e, t) => [{
    t: "pitch",
    to: e,
    len: t
  }, {
    t: "pitch",
    to: -e,
    len: t * 1.1
  }, {
    t: "pitch",
    to: 0,
    len: t * 0.9
  }],
  fe = [{
    id: "summer-1",
    name: "Summer 1",
    theme: "summer",
    author: 16.9,
    gold: 19,
    silver: 21.7,
    bronze: 25.6,
    pieces: [{
      t: "straight",
      len: 60
    }, {
      t: "turn",
      dir: 1,
      angle: 70,
      radius: 62,
      bank: 10
    }, {
      t: "straight",
      len: 30
    }, te(), ...yr(-1, 38, 40), {
      t: "straight",
      len: 26
    }, ...Ht(11, 22), {
      t: "turn",
      dir: -1,
      angle: 118,
      radius: 32
    }, te(), {
      t: "straight",
      len: 70
    }, {
      t: "turn",
      dir: 1,
      angle: 88,
      radius: 55,
      bank: 14
    }, {
      t: "straight",
      len: 40
    }, te(), {
      t: "turn",
      dir: 1,
      angle: 46,
      radius: 90,
      bank: 10
    }, {
      t: "boost",
      len: 12
    }, {
      t: "straight",
      len: 90
    }, {
      t: "finish"
    }, {
      t: "straight",
      len: 72
    }]
  }, {
    id: "summer-2",
    name: "Meadow Sprint",
    theme: "summer",
    author: 21.6,
    gold: 24.4,
    silver: 27.9,
    bronze: 32.8,
    pieces: [{
      t: "straight",
      len: 70
    }, {
      t: "turn",
      dir: -1,
      angle: 52,
      radius: 80,
      bank: 12
    }, ...Ht(9, 26), te(), {
      t: "turn",
      dir: 1,
      angle: 96,
      radius: 44,
      bank: 16
    }, {
      t: "straight",
      len: 62
    }, ...tr(15, 30, 22), te(), {
      t: "straight",
      len: 20
    }, ...yr(1, 42, 34), {
      t: "turn",
      dir: -1,
      angle: 132,
      radius: 30
    }, te(), {
      t: "straight",
      len: 46
    }, {
      t: "pitch",
      to: 10,
      len: 30
    }, {
      t: "turn",
      dir: 1,
      angle: 74,
      radius: 66,
      bank: 18
    }, {
      t: "pitch",
      to: 0,
      len: 26
    }, te(), {
      t: "boost",
      len: 14
    }, {
      t: "turn",
      dir: -1,
      angle: 40,
      radius: 110,
      bank: 8
    }, {
      t: "straight",
      len: 80
    }, {
      t: "finish"
    }, {
      t: "straight",
      len: 72
    }]
  }, {
    id: "desert-1",
    name: "Dune Sprint",
    theme: "desert",
    author: 23.3,
    gold: 26.3,
    silver: 30,
    bronze: 35.4,
    pieces: [{
      t: "straight",
      len: 80
    }, ...Ht(13, 30), {
      t: "turn",
      dir: 1,
      angle: 58,
      radius: 100,
      bank: 12
    }, te(), {
      t: "straight",
      len: 44
    }, ...tr(17, 34, 30, 26), {
      t: "turn",
      dir: -1,
      angle: 84,
      radius: 50,
      bank: 20
    }, te(), {
      t: "pitch",
      to: -12,
      len: 34
    }, {
      t: "pitch",
      to: 0,
      len: 24
    }, {
      t: "turn",
      dir: -1,
      angle: 60,
      radius: 70,
      bank: 16
    }, {
      t: "straight",
      len: 40
    }, te(), {
      t: "turn",
      dir: 1,
      angle: 150,
      radius: 30
    }, {
      t: "boost",
      len: 14
    }, {
      t: "straight",
      len: 60
    }, {
      t: "turn",
      dir: 1,
      angle: 44,
      radius: 120,
      bank: 10
    }, te(), ...Ht(10, 26), {
      t: "straight",
      len: 70
    }, {
      t: "finish"
    }, {
      t: "straight",
      len: 72
    }]
  }, {
    id: "loop-1",
    name: "Loop Station",
    theme: "sunset",
    author: 23.6,
    gold: 26.6,
    silver: 30.4,
    bronze: 35.8,
    pieces: [{
      t: "straight",
      len: 60
    }, {
      t: "boost",
      len: 14
    }, {
      t: "straight",
      len: 26
    }, {
      t: "loop",
      radius: 17
    }, te(), {
      t: "straight",
      len: 40
    }, {
      t: "turn",
      dir: 1,
      angle: 92,
      radius: 52,
      bank: 18
    }, {
      t: "straight",
      len: 48
    }, ...tr(15, 30, 24), te(), {
      t: "turn",
      dir: -1,
      angle: 120,
      radius: 34
    }, {
      t: "straight",
      len: 40
    }, {
      t: "pitch",
      to: 14,
      len: 34
    }, {
      t: "turn",
      dir: -1,
      angle: 70,
      radius: 60,
      bank: 20
    }, {
      t: "pitch",
      to: 0,
      len: 28
    }, te(), {
      t: "boost",
      len: 14
    }, {
      t: "straight",
      len: 30
    }, {
      t: "loop",
      radius: 20
    }, {
      t: "straight",
      len: 36
    }, {
      t: "turn",
      dir: 1,
      angle: 50,
      radius: 90,
      bank: 12
    }, te(), {
      t: "straight",
      len: 84
    }, {
      t: "finish"
    }, {
      t: "straight",
      len: 72
    }]
  }, {
    id: "wall-1",
    name: "Wall Runner",
    theme: "alpine",
    author: 21.4,
    gold: 24.2,
    silver: 27.6,
    bronze: 32.5,
    pieces: [{
      t: "straight",
      len: 70
    }, {
      t: "straight",
      len: 12
    }, {
      t: "wall",
      dir: 1,
      angle: 100,
      radius: 46
    }, te(), {
      t: "straight",
      len: 36
    }, {
      t: "width",
      to: 4,
      len: 24
    }, ...yr(-1, 36, 38), {
      t: "width",
      to: 5,
      len: 24
    }, te(), {
      t: "straight",
      len: 26
    }, {
      t: "corkscrew",
      dir: 1,
      radius: 15,
      axial: 104
    }, {
      t: "straight",
      len: 30
    }, {
      t: "turn",
      dir: -1,
      angle: 128,
      radius: 36
    }, te(), {
      t: "straight",
      len: 34
    }, {
      t: "wall",
      dir: -1,
      angle: 110,
      radius: 44
    }, {
      t: "straight",
      len: 30
    }, ...Ht(12, 24), te(), {
      t: "boost",
      len: 14
    }, {
      t: "turn",
      dir: 1,
      angle: 42,
      radius: 110,
      bank: 10
    }, {
      t: "straight",
      len: 76
    }, {
      t: "finish"
    }, {
      t: "straight",
      len: 72
    }]
  }, {
    id: "drift-spiral",
    name: "Drift Valley",
    theme: "sunset",
    author: 25,
    gold: 29,
    silver: 35,
    bronze: 43,
    pieces: [{
      t: "straight",
      len: 52
    }, {
      t: "width",
      to: 6,
      len: 20
    }, {
      t: "spiral",
      dir: 1,
      radius: 23,
      turns: 1.5,
      rise: 48
    }, {
      t: "straight",
      len: 80
    }, te(), {
      t: "spiral",
      dir: -1,
      radius: 23,
      turns: 1.5,
      rise: -48
    }, {
      t: "width",
      to: 5,
      len: 20
    }, {
      t: "straight",
      len: 52
    }, {
      t: "finish"
    }, {
      t: "straight",
      len: 72
    }]
  }, {
    id: "velocity",
    name: "Velocity",
    theme: "desert",
    author: 36.6,
    gold: 41.3,
    silver: 47.2,
    bronze: 55.6,
    pieces: [{
      t: "straight",
      len: 66
    }, {
      t: "boost",
      len: 14
    }, {
      t: "turn",
      dir: -1,
      angle: 46,
      radius: 100,
      bank: 12
    }, ...Ht(12, 26), te(), {
      t: "loop",
      radius: 18
    }, {
      t: "straight",
      len: 34
    }, {
      t: "wall",
      dir: 1,
      angle: 96,
      radius: 46
    }, te(), {
      t: "straight",
      len: 48
    }, ...tr(18, 34, 30, 28), {
      t: "turn",
      dir: -1,
      angle: 140,
      radius: 31
    }, te(), {
      t: "width",
      to: 3.8,
      len: 26
    }, {
      t: "straight",
      len: 40
    }, ...yr(1, 40, 34), {
      t: "width",
      to: 5,
      len: 26
    }, te(), {
      t: "corkscrew",
      dir: -1,
      radius: 16,
      axial: 112
    }, {
      t: "straight",
      len: 26
    }, {
      t: "pitch",
      to: 16,
      len: 32
    }, {
      t: "turn",
      dir: 1,
      angle: 84,
      radius: 58,
      bank: 22
    }, {
      t: "pitch",
      to: 0,
      len: 30
    }, te(), {
      t: "boost",
      len: 14
    }, {
      t: "wall",
      dir: -1,
      angle: 104,
      radius: 45
    }, {
      t: "straight",
      len: 44
    }, ...tr(14, 26, 20), te(), {
      t: "turn",
      dir: 1,
      angle: 52,
      radius: 110,
      bank: 10
    }, {
      t: "straight",
      len: 90
    }, {
      t: "finish"
    }, {
      t: "straight",
      len: 76
    }]
  }],
  pn = new Map();
function un(e) {
  let t = pn.get(e.id);
  if (t) return t;
  let r = na(e.pieces);
  return pn.set(e.id, r), r;
}
var Oa = e => fe[(e % fe.length + fe.length) % fe.length];
function Vo(e, t) {
  return t <= e.author ? "author" : t <= e.gold ? "gold" : t <= e.silver ? "silver" : t <= e.bronze ? "bronze" : null;
}
var Co = "polyrace-velocity/records/v1";
function Ao() {
  return {
    best: null,
    medal: null,
    ghost: null,
    finishes: 0
  };
}
function mi() {
  try {
    let e = window.localStorage.getItem(Co);
    if (!e) return {};
    let t = JSON.parse(e);
    if (!t || typeof t != "object") return {};
    let r = {};
    for (let [n, o] of Object.entries(t)) !o || typeof o != "object" || (r[n] = {
      best: typeof o.best == "number" && isFinite(o.best) ? o.best : null,
      medal: o.medal ?? null,
      ghost: typeof o.ghost == "string" ? o.ghost : null,
      ghostTime: typeof o.ghostTime == "number" && Number.isFinite(o.ghostTime) && o.ghostTime > 0 ? o.ghostTime : typeof o.ghost == "string" ? o.best : null,
      finishes: typeof o.finishes == "number" ? o.finishes : 0
    });
    return r;
  } catch {
    return {};
  }
}
function Io(e) {
  try {
    window.localStorage.setItem(Co, JSON.stringify(e));
  } catch {}
}
function pr(e, t) {
  return e[t] ?? Ao();
}
function tt(e) {
  if (e == null || !isFinite(e)) return "--:--.---";
  let t = Math.max(0, e),
    r = Math.floor(t / 60),
    n = t - r * 60,
    o = Math.floor(n),
    a = Math.round((n - o) * 1e3),
    i = a === 1e3 ? 999 : a;
  return `${ha(r, 2)}:${ha(o, 2)}.${ha(i, 3)}`;
}
function Ha(e) {
  let t = e < 0 ? "-" : "+",
    r = Math.abs(e);
  return `${t}${r.toFixed(3)}`;
}
function fi(e, t) {
  return e === null || !isFinite(e) || e <= 0 ? 0 : Math.round(12e4 / Math.max(4, e)) + (t === "author" ? 6e3 : t === "gold" ? 3500 : t === "silver" ? 2e3 : t === "bronze" ? 1e3 : 0);
}
var ha = (e, t) => String(Math.floor(e)).padStart(t, "0");
var To = "total-racing-time",
  Za = "total-distance";
function bi(e, t) {
  if (e === Za) return t >= 1e3 ? (t / 1e3).toLocaleString(void 0, {
    maximumFractionDigits: 2
  }) + " km" : t.toLocaleString() + " m";
  let r = Math.max(0, Math.round(t)),
    n = Math.floor(r / 1e3),
    o = Math.floor(n / 3600);
  return (o ? o + ":" : "") + String(Math.floor(n / 60) % 60).padStart(2, "0") + ":" + String(n % 60).padStart(2, "0") + "." + String(r % 1e3).padStart(3, "0");
}
var Te = {
    firstFinish: "lights-out",
    goldRush: "gold-rush",
    author: "beat-the-author",
    worldTour: "world-tour",
    clean: "clean-sweep",
    drift: "sideways",
    air: "frequent-flyer",
    marathon: "marathon"
  },
  xi = 3,
  yi = 1.5,
  hn = 42195,
  Eo = "polyrace-velocity/stats/v1";
function ki() {
  try {
    let e = JSON.parse(window.localStorage.getItem(Eo) || "{}");
    return {
      meters: typeof e.meters == "number" && Number.isFinite(e.meters) && e.meters >= 0 ? e.meters : 0
    };
  } catch {
    return {
      meters: 0
    };
  }
}
function Mi(e) {
  try {
    window.localStorage.setItem(Eo, JSON.stringify({
      meters: Math.floor(e.meters)
    }));
  } catch {}
}
function Si(e, t) {
  let r = new Set((() => {
      try {
        let a = JSON.parse(localStorage.getItem("polyrace-velocity/local-achievements/v1") || "[]");
        return Array.isArray(a) ? a.filter(x => typeof x === "string") : [];
      } catch {
        return [];
      }
    })()),
    n = !1;
  function o(i) {
    if (r.has(i)) return;
    r.add(i);
    try {
      localStorage.setItem("polyrace-velocity/local-achievements/v1", JSON.stringify([...r]));
    } catch {}
  }
  function a() {
    let i = t(),
      l = fe.map(s => i.records[s.id]);
    l.some(s => s && (s.finishes > 0 || s.best !== null)) && o(Te.firstFinish), l.some(s => s?.medal === "gold" || s?.medal === "author") && o(Te.goldRush), l.some(s => s?.medal === "author") && o(Te.author), l.every(s => s && s.best !== null) && o(Te.worldTour), i.stats.meters >= hn && o(Te.marathon);
  }
  return {
    checkSaved: a,
    addDistance(i) {
      if (!(i > 0) || !Number.isFinite(i)) return;
      let l = t().stats;
      l.meters += i, n = !0, l.meters >= hn && o(Te.marathon);
    },
    checkpoint() {
      n && (n = !1, Mi(t().stats));
    },
    observe(i) {
      let l = t(),
        s = l.car,
        c = l.run;
      if (c.phase !== "racing") {
        c.driftHold = 0, c.airHold = 0;
        return;
      }
      s.grounded && s.drift > 0.5 && Math.abs(s.speed) > 8 ? (c.driftHold += i, c.driftHold >= xi && o(Te.drift)) : c.driftHold = 0, s.grounded ? (c.airHold >= yi && o(Te.air), c.airHold = 0) : c.airHold += i;
    },
    finish(i) {
      let l = t().run;
      o(Te.firstFinish), (i === "gold" || i === "author") && o(Te.goldRush), i === "author" && o(Te.author), l.respawns === 0 && o(Te.clean), a();
    }
  };
}
var Ai = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "Enter", "Backspace", "Tab"]);
function Ii() {
  let e = new Set(),
    t = new Set(),
    r = !1,
    n = i => {
      i.target instanceof HTMLElement && i.target.closest("input, select, textarea") || (Ai.has(i.code) && i.preventDefault(), !i.repeat && (e.add(i.code), t.add(i.code), r = !0));
    },
    o = i => {
      e.delete(i.code);
    },
    a = () => e.clear();
  return window.addEventListener("keydown", n), window.addEventListener("keyup", o), window.addEventListener("blur", a), {
    get touched() {
      return r;
    },
    held(...i) {
      for (let l of i) if (e.has(l)) return !0;
      return !1;
    },
    pressed(...i) {
      for (let l of i) if (t.has(l)) return !0;
      return !1;
    },
    axis(i, l) {
      let s = 0;
      for (let c of i) e.has(c) && (s -= 1);
      for (let c of l) e.has(c) && (s += 1);
      return s < 0 ? -1 : s > 0 ? 1 : 0;
    },
    endStep() {
      t.clear();
    },
    reset() {
      e.clear(), t.clear();
    },
    dispose() {
      window.removeEventListener("keydown", n), window.removeEventListener("keyup", o), window.removeEventListener("blur", a), e.clear(), t.clear();
    }
  };
}
var ae = {
  accelerate: ["KeyW", "ArrowUp"],
  brake: ["KeyS", "ArrowDown"],
  left: ["KeyA", "ArrowLeft"],
  right: ["KeyD", "ArrowRight"],
  drift: ["Space"],
  respawn: ["KeyR", "Enter"],
  restart: ["KeyT", "Backspace"],
  back: ["Escape"],
  next: ["KeyN"],
  ghost: ["KeyG"],
  camera: ["KeyC"],
  watch: ["KeyV"],
  confirm: ["Enter", "Space"],
  menuUp: ["ArrowUp", "KeyW"],
  menuDown: ["ArrowDown", "KeyS"]
};
function ur() {
  return {
    found: !1,
    grounded: !1,
    frameIndex: 0,
    point: new Ge.Vector3(),
    normal: new Ge.Vector3(0, 1, 0),
    forward: new Ge.Vector3(0, 0, -1),
    right: new Ge.Vector3(1, 0, 0),
    height: 0,
    lateral: 0,
    halfWidth: G.halfWidth,
    driveHalfWidth: G.halfWidth + G.apron,
    onAsphalt: !0,
    boost: !1,
    distance: 0
  };
}
var mn = 48,
  fn = 10;
function gn(e) {
  let t = e.frames,
    r = t.length - 1,
    n = [],
    o = new Ge.Vector3(),
    a = new Ge.Vector3(),
    i = new Ge.Vector3(),
    l = new Ge.Vector3(),
    s = new Ge.Vector3(),
    c = (u, p, d) => {
      let h = -1,
        g = 1 / 0;
      for (let b = p; b <= d; b++) {
        let f = t[b].p.distanceToSquared(u);
        f < g && (g = f, h = b);
      }
      return {
        bestIndex: h,
        bestDist: g
      };
    };
  return {
    path: e,
    sample(u, p, d) {
      let h = -1,
        g = 1 / 0;
      if (p >= 0) {
        let q = Math.max(0, p - mn),
          E = Math.min(r, p + mn),
          z = c(u, q, E);
        h = z.bestIndex, g = z.bestDist;
      }
      if (h < 0 || g > fn * fn) {
        zo(e, u, n);
        let q = h,
          E = g;
        for (let z of n) {
          let T = t[z].p.distanceToSquared(u);
          T < E && (E = T, q = z);
        }
        h = q, g = E;
      }
      if (h < 0) return d.found = !1, d.grounded = !1, d;
      let b = t[h];
      o.subVectors(u, b.p);
      let f = o.dot(b.fwd) / G.step,
        y = f >= 0 ? h : h - 1,
        v = f >= 0 ? f : 1 + f;
      y < 0 ? (y = 0, v = 0) : y > r - 1 && (y = Math.max(0, r - 1), v = 1), v = v < 0 ? 0 : v > 1 ? 1 : v;
      let w = t[y > 0 ? y - 1 : y],
        k = t[y],
        x = t[y + 1],
        m = t[y + 2 <= r ? y + 2 : y + 1];
      ma(a, w.p, k.p, x.p, m.p, v), ma(i, w.up, k.up, x.up, m.up, v).normalize(), ma(l, w.right, k.right, x.right, m.right, v).normalize(), s.crossVectors(i, l).normalize(), o.subVectors(u, a);
      let M = o.dot(i),
        S = o.dot(l),
        I = k.halfWidth + (x.halfWidth - k.halfWidth) * v,
        A = I + b.apron;
      return d.found = b.road, d.frameIndex = h, d.point.copy(a), d.normal.copy(i), d.right.copy(l), d.forward.copy(s), d.height = M, d.lateral = S, d.halfWidth = I, d.driveHalfWidth = A, d.onAsphalt = Math.abs(S) <= I, d.boost = b.boost, d.distance = b.dist + f * G.step, d.grounded = b.road && Math.abs(S) <= A + G.overhang && M > -0.55 && M < 1.35, d;
    }
  };
}
function ma(e, t, r, n, o, a) {
  let i = a * a,
    l = i * a,
    s = (c, u, p, d) => 0.5 * (2 * u + (p - c) * a + (2 * c - 5 * u + 4 * p - d) * i + (3 * u - c - 3 * p + d) * l);
  return e.set(s(t.x, r.x, n.x, o.x), s(t.y, r.y, n.y, o.y), s(t.z, r.z, n.z, o.z)), e;
}
var Yt = {
    throttle: 0,
    brake: 0,
    steer: 0,
    handbrake: !1,
    airPitch: 0,
    airRoll: 0
  },
  Ti = 34,
  Ei = 20,
  qi = 11,
  Fi = 0.52;
function Ri(e, t, r, n) {
  if (e && t < 0) {
    let o = O.gravity * -t;
    if (n * n * r < o * 0.82) return !1;
  }
  return e;
}
function Ni(e, t, r) {
  let n = t === 0 ? O.steerReturn : O.steerEase;
  return e + (t - e) * Math.min(1, n * r);
}
function Li(e, t) {
  return e ? qi : t ? Ti : Ei;
}
function Pi(e, t, r, n, o, a) {
  let i = Math.min(1, Math.abs(r) / O.topSpeed),
    l = O.steerRate * (1 - O.steerSpeedFalloff * i),
    s = Math.abs(r) > 4 ? o / Math.abs(r) : 1 / 0,
    c = Math.min(l, s * (a ? 2.3 : 1.28)),
    u = Math.min(1, Math.abs(r) / 6),
    p = r < -0.5 ? -1 : 1,
    d = e * c * u * p;
  return t > 0.05 && (d += -Math.sign(n) * O.driftYawAssist * t), d;
}
function Di(e, t, r, n, o, a, i, l, s, c, u, p) {
  let d = n.boost > 0,
    h = d ? O.boostSpeed : O.topSpeed;
  if (o.throttle > 0) {
    let b = Math.max(0, 1 - Math.max(0, t) / h);
    t += O.accel * Math.pow(b, O.accelFalloff) * o.throttle * p;
  }
  o.brake > 0 && (t > 0.5 ? t = Math.max(0, t - O.brakeForce * o.brake * p) : t = Math.max(-O.reverseSpeed, t - O.accel * 0.45 * o.brake * p)), o.throttle === 0 && o.brake === 0 && Math.abs(t) > 0.01 && (t -= Math.sign(t) * Math.min(Math.abs(t), O.coastDrag * p)), d && (t += O.boostForce * p, n.boost = Math.max(0, n.boost - p));
  let g = Math.min(Math.abs(r), a * p);
  if (r -= Math.sign(r) * g, c.set(0, -O.gravity, 0), u.copy(c).addScaledVector(s, -c.dot(s)), t += u.dot(i) * p, r += u.dot(l) * p, n.landed > O.hardLanding) {
    let b = Math.min(1, n.landed / O.hardLanding - 1);
    t *= 1 - O.landingScrub * b;
  }
  e.vf = t, e.vl = r;
}
function Oi(e, t, r, n) {
  r.boost > 0 && (e.addScaledVector(t, O.boostForce * 0.5 * n), r.boost = Math.max(0, r.boost - n));
}
function Hi(e, t) {
  let r = e.length();
  r > 0.001 && e.multiplyScalar(Math.max(0, 1 - O.airDrag * r * t));
}
function Wi(e, t, r, n, o) {
  e.throttle = t.throttle, e.brake = t.brake, e.handbrake = t.handbrake, e.wheelAngle += e.speed / Fi * o;
  let a = Math.min(1, Math.abs(e.speed) / O.topSpeed),
    i = a * Da.gears;
  e.gear = Math.max(1, Math.min(Da.gears, Math.floor(i) + 1));
  let l = 1 - (1 - a) * (1 - a),
    s = Math.min(1, 0.18 + 0.76 * l + 0.06 * t.throttle);
  e.rpm += (s - e.rpm) * Math.min(1, 12 * o);
  let c = e.grounded ? Math.min(1, Math.abs(r - O.rideHeight) * 2) : 0,
    u = e.grounded ? Math.min(0.5, t.brake * 0.4 + e.landed * 0.012) : 0,
    p = Math.max(-0.4, Math.min(0.4, e.slip * 0.03 * n));
  e.suspension[0] = kr(0.5 + c + u - p), e.suspension[1] = kr(0.5 + c + u + p), e.suspension[2] = kr(0.5 + c - u * 0.5 - p), e.suspension[3] = kr(0.5 + c - u * 0.5 + p);
}
var kr = e => e < 0 ? 0 : e > 1 ? 1 : e;
function Wa(e, t, r = () => null) {
  let n = e.path.frames,
    o = new ge.Vector3(),
    a = new ge.Vector3(),
    i = new ge.Quaternion(),
    l = new ge.Vector3(),
    s = new ge.Vector3(),
    c = new ge.Vector3(),
    u = new ge.Vector3(),
    p = new ge.Vector3(),
    d = new ge.Quaternion(),
    h = new ge.Quaternion(),
    g = {
      vf: 0,
      vl: 0
    },
    b = new ge.Vector3(0, 1, 0),
    f = new ge.Vector3(0, 1, 0),
    y = new ge.Vector3(0, 0, -1),
    v = new ge.Vector3(0, 1, 0),
    w = new ge.Vector3(1, 0, 0),
    k = () => {
      l.copy(y).applyQuaternion(i), s.copy(v).applyQuaternion(i), c.copy(w).applyQuaternion(i);
    },
    x = (m, M) => {
      M !== 0 && (d.setFromAxisAngle(m, M), i.premultiply(d).normalize());
    };
  return {
    contact: t,
    placeAt(m, M, S = 0) {
      m.teleport++;
      let I = n[Math.max(0, Math.min(n.length - 1, M))];
      o.copy(I.p).addScaledVector(I.right, S).addScaledVector(I.up, O.rideHeight), m.pos = {
        x: o.x,
        y: o.y,
        z: o.z
      }, m.vel = {
        x: 0,
        y: 0,
        z: 0
      }, m.quat = {
        x: I.q.x,
        y: I.q.y,
        z: I.q.z,
        w: I.q.w
      }, m.speed = 0, m.slip = 0, m.drift = 0, m.steer = 0, m.boost = 0, m.falling = 0, m.dirt = !1, m.airTime = 0, m.groundTime = 0, m.grounded = !0, m.frameIndex = I.index, m.progress = I.dist, m.lateral = S, m.rpm = 0, m.gear = 1, m.landed = 0, m.bumped = 0, m.suspension = [0, 0, 0, 0];
    },
    step(m, M, S) {
      o.set(m.pos.x, m.pos.y, m.pos.z), a.set(m.vel.x, m.vel.y, m.vel.z), i.set(m.quat.x, m.quat.y, m.quat.z, m.quat.w), k(), e.sample(o, m.frameIndex, t);
      let I = n[t.frameIndex].curvature,
        A = Ri(t.grounded, t.normal.y, I, m.speed),
        q = m.grounded;
      m.landed = 0, m.bumped = 0, m.steer = Ni(m.steer, M.steer, S);
      let E = a.dot(l),
        z = a.dot(c),
        T = a.dot(s);
      if (A) {
        h.setFromUnitVectors(s, t.normal);
        let L = 1 - Math.exp(-O.alignGround * S);
        d.identity().slerp(h, L), i.premultiply(d).normalize(), k();
        let V = Li(M.handbrake, t.onAsphalt),
          C = Pi(m.steer, m.drift, E, z, V, M.handbrake);
        x(t.normal, -C * S), k(), E = a.dot(l), z = a.dot(c), T = a.dot(s), q || (m.landed = Math.abs(m.vel.x * t.normal.x + m.vel.y * t.normal.y + m.vel.z * t.normal.z)), Di(g, E, z, m, M, V, l, c, t.normal, u, p, S), E = g.vf, z = g.vl, T = 0, t.boost && (m.boost = O.boostDuration), m.airTime = 0, m.groundTime += S, m.falling = 0;
      } else if (m.dirt && r()) {
        let L = r(),
          V = 1;
        f.set(-(L(o.x + V, o.z) - L(o.x - V, o.z)) / (2 * V), 1, -(L(o.x, o.z + V) - L(o.x, o.z - V)) / (2 * V)).normalize(), h.setFromUnitVectors(s, f), d.identity().slerp(h, 1 - Math.exp(-O.alignGround * S)), i.premultiply(d).normalize(), k(), E = a.dot(l), z = a.dot(c);
        let C = O.steerRate * (1 - 0.3 * Math.min(1, Math.abs(E) / O.dirtSpeed)),
          D = Math.min(1, Math.abs(E) / 6);
        if (x(f, -m.steer * C * D * (E < -0.5 ? -1 : 1) * S), k(), E = a.dot(l), z = a.dot(c), M.throttle > 0) {
          let R = Math.max(0, 1 - Math.max(0, E) / O.dirtSpeed);
          E += O.dirtAccel * R * M.throttle * S;
        }
        M.brake > 0 && (E = E > 0.5 ? Math.max(0, E - O.brakeForce * 0.5 * M.brake * S) : Math.max(-O.reverseSpeed * 0.5, E - O.dirtAccel * 0.5 * M.brake * S)), E -= Math.sign(E) * Math.min(Math.abs(E), O.dirtDrag * S), z -= Math.sign(z) * Math.min(Math.abs(z), O.dirtGrip * S), u.set(0, -O.gravity, 0), p.copy(u).addScaledVector(f, -u.dot(f)), E += p.dot(l) * S, z += p.dot(c) * S, a.copy(l).multiplyScalar(E).addScaledVector(c, z), m.airTime = 0, m.groundTime += S, m.falling += S, T = 0;
      } else {
        a.y -= O.gravity * S, x(c, M.airPitch * O.airPitch * S), x(l, -M.airRoll * O.airRoll * S), x(s, -m.steer * 1.1 * S), k(), m.airTime > 0.45 && Math.abs(M.airPitch) < 0.01 && Math.abs(M.airRoll) < 0.01 && (h.setFromUnitVectors(s, b), d.identity().slerp(h, 1 - Math.exp(-O.alignAir * S * 0.5)), i.premultiply(d).normalize(), k()), m.airTime += S, m.groundTime = 0, Oi(a, l, m, S);
        let L = !t.found || Math.abs(t.lateral) > t.driveHalfWidth + 3 || t.height < -2.5;
        m.falling = L ? m.falling + S : 0, E = a.dot(l), z = a.dot(c), T = a.dot(s);
      }
      A && a.copy(l).multiplyScalar(E).addScaledVector(c, z).addScaledVector(s, T), Hi(a, S), o.addScaledVector(a, S), e.sample(o, t.frameIndex, t);
      let F = r();
      if (F && !(A && t.grounded)) {
        let L = F(o.x, o.z) + O.rideHeight;
        o.y <= L ? (!m.dirt && a.y < 0 && (m.landed = -a.y), o.y = L, a.y < 0 && (a.y = 0), m.dirt = !0) : o.y > L + O.dirtRelease && (m.dirt = !1);
      } else m.dirt = !1;
      if (A && t.grounded) {
        let L = O.rideHeight - t.height;
        o.addScaledVector(t.normal, L * Math.min(1, O.stick * S));
        let V = t.driveHalfWidth + G.overhang;
        if (Math.abs(t.lateral) > V) {
          let C = (Math.abs(t.lateral) - V) * Math.sign(t.lateral);
          o.addScaledVector(t.right, -C), m.bumped = Math.abs(a.dot(t.right)), a.addScaledVector(t.right, -a.dot(t.right) * O.wallBounce);
        }
      }
      m.pos.x = o.x, m.pos.y = o.y, m.pos.z = o.z, m.vel.x = a.x, m.vel.y = a.y, m.vel.z = a.z, m.quat.x = i.x, m.quat.y = i.y, m.quat.z = i.z, m.quat.w = i.w, m.grounded = A && t.grounded, m.frameIndex = t.frameIndex, m.progress = t.distance, m.lateral = t.lateral, m.speed = a.dot(l), m.slip = Math.abs(a.dot(c)), m.drift = Math.min(1, m.slip / O.driftFullSlip), Wi(m, M, t.height, Math.sign(a.dot(c)), S);
    }
  };
}
var Qe = 8,
  Kt = 16,
  gt = 32e3,
  qo = 4;
function Bi() {
  let e = 1 / Ne.ghostRate,
    t = Math.ceil(Ne.ghostMaxSeconds * Ne.ghostRate),
    r = new Int16Array(t * Qe),
    n = 0,
    o = 0;
  return {
    get samples() {
      return n;
    },
    reset() {
      n = 0, o = 0;
    },
    record(a, i) {
      if (n >= t || i < o) return;
      o = n === 0 ? e : o + e;
      let l = n * Qe;
      r[l] = ot(a.pos.x * Kt), r[l + 1] = ot(a.pos.y * Kt), r[l + 2] = ot(a.pos.z * Kt), r[l + 3] = ot(a.quat.x * gt), r[l + 4] = ot(a.quat.y * gt), r[l + 5] = ot(a.quat.z * gt), r[l + 6] = ot(a.quat.w * gt), r[l + 7] = ot(a.progress * qo), n++;
    },
    encode() {
      return n < 4 ? null : Ui(r.subarray(0, n * Qe));
    }
  };
}
function Qi() {
  let e = null,
    t = 0,
    r = 0,
    n = 1 / Ne.ghostRate,
    o = new hr.Quaternion(),
    a = new hr.Quaternion(),
    i = new hr.Vector3();
  return {
    get loaded() {
      return e !== null;
    },
    get duration() {
      return t > 0 ? (t - 1) * n : 0;
    },
    reset: () => {
      r = 0;
    },
    load(l) {
      if (!l) return e = null, t = 0, !1;
      let s = Gi(l);
      return !s || s.length < Qe * 4 ? (e = null, t = 0, !1) : (e = s, t = Math.floor(s.length / Qe), r = 0, !0);
    },
    sample(l, s, c) {
      if (!e || t < 2) return !1;
      let u = l / n;
      if (u >= t - 1) return fa(e, t - 1, s, c), !1;
      let p = Math.max(0, Math.floor(u)),
        d = u - p;
      return fa(e, p, s, o), fa(e, p + 1, i, a), s.lerp(i, d), c.copy(o).slerp(a, d), !0;
    },
    timeAt(l) {
      if (!e || t < 2) return null;
      let s = l * qo;
      for (r >= t - 1 && (r = 0), e[r * Qe + 7] > s && (r = 0); r < t - 1 && e[(r + 1) * Qe + 7] <= s;) r++;
      if (r >= t - 1) return null;
      let c = e[r * Qe + 7],
        u = e[(r + 1) * Qe + 7] - c,
        p = u > 0 ? (s - c) / u : 0;
      return (r + p) * n;
    }
  };
}
function fa(e, t, r, n) {
  let o = t * Qe;
  r.set(e[o] / Kt, e[o + 1] / Kt, e[o + 2] / Kt), n.set(e[o + 3] / gt, e[o + 4] / gt, e[o + 5] / gt, e[o + 6] / gt), n.normalize();
}
var ot = e => Math.max(-32768, Math.min(32767, Math.round(e)));
function Ui(e) {
  let t = new Uint8Array(e.buffer, e.byteOffset, e.byteLength),
    r = "",
    n = 32768;
  for (let o = 0; o < t.length; o += n) r += String.fromCharCode(...t.subarray(o, o + n));
  return btoa(r);
}
function Gi(e) {
  try {
    let t = atob(e),
      r = new Uint8Array(t.length);
    for (let n = 0; n < t.length; n++) r[n] = t.charCodeAt(n);
    return r.length % 2 !== 0 ? null : new Int16Array(r.buffer, 0, r.length / 2);
  } catch {
    return null;
  }
}
var $i = 0.52;
function ji(e) {
  let t = new mr.Vector3(),
    r = new mr.Quaternion(),
    n = new mr.Vector3(),
    o = 0,
    a = (i, l) => {
      n.copy(t);
      let s = e.sample(i, t, r);
      return o = Math.min(O.boostSpeed, n.distanceTo(t) / l), s;
    };
  return {
    pos: t,
    quat: r,
    get speed() {
      return o;
    },
    follow(i, l) {
      a(i, l);
    },
    rewind() {
      e.reset(), o = 0, e.loaded && e.sample(0, t, r), n.copy(t);
    },
    drive(i, l, s, c, u) {
      if (!e.loaded) return !1;
      let p = a(i, l);
      return s.pos.x = t.x, s.pos.y = t.y, s.pos.z = t.z, s.quat.x = r.x, s.quat.y = r.y, s.quat.z = r.z, s.quat.w = r.w, s.speed = o, s.wheelAngle += o / $i * l, u.sample(t, s.frameIndex, c), s.frameIndex = c.frameIndex, s.progress = c.distance, s.grounded = c.grounded, s.rpm = Math.min(1, 0.18 + 0.82 * (o / O.topSpeed)), p;
    },
    reset() {
      o = 0;
    }
  };
}
function Yi(e, t, r, n, o) {
  let a = e.run;
  if (a.phase = "finished", a.finishTime = r, a.medal = Vo(t, r), e.multiplayer.phase !== "off") return !1;
  let i = e.records,
    l = pr(i, t.id),
    s = l.best === null || r < l.best;
  a.previousBest = l.best, a.isRecord = s;
  let c = l.ghostTime ?? l.best,
    u = !l.ghost || c === null || r < c ? n.encode() : null,
    p = {
      best: s ? r : l.best,
      medal: s ? a.medal : l.medal,
      ghost: u ?? l.ghost,
      ghostTime: u ? r : c,
      finishes: l.finishes + 1
    };
  return i[t.id] = p, Io(i), u && o.load(u), e.session.completed.includes(t.id) || e.session.completed.push(t.id), e.session.score = Object.entries(i).reduce((d, [, h]) => d + fi(h.best, h.medal), 0), s;
}
function Ki(e, t, r, n, o, a, i, l) {
  let s = e.run,
    c = e.car,
    u = r.checkpoints[s.checkpoints];
  if (u !== void 0) {
    let b = r.frames[u].dist;
    if (l < b && c.progress >= b && Math.abs(c.lateral) < n.driveHalfWidth + 2) {
      s.checkpoints += 1, s.splits.push(s.time), s.respawnFrame = u, s.respawnTime = s.time;
      let f = a.loaded ? a.timeAt(b) : null;
      s.splitTime = s.time, s.splitDelta = f === null ? null : s.time - f, s.splitFlash = 1.9, i.checkpoint(s.checkpoints, s.time);
    }
  }
  let p = r.frames[r.finishFrame].dist,
    d = !1;
  if (s.checkpoints >= r.checkpoints.length && l < p && c.progress >= p) {
    let b = Yi(e, t, s.time, o, a);
    i.finish(s.time, b, s.medal), d = !0;
  }
  let h = r.bounds.min.y - O.fallDepth,
    g = s.phase === "racing" && (c.falling > 8 || c.pos.y < h);
  return {
    finished: d,
    fell: g
  };
}
var _i = {
  ...Yt,
  brake: 0.6
};
function Fo(e, t) {
  let r = Oa(0),
    n = un(r),
    o = ur(),
    a = gn(n),
    i = null,
    l = Wa(a, o, () => i),
    s = Bi(),
    c = Qi(),
    u = ji(c),
    p = d => {
      let h = e(),
        g = h.run;
      d ? (g.time = 0, g.checkpoints = 0, g.splits.length = 0, g.respawnFrame = Ne.startFrame, g.respawnTime = 0, g.finishTime = null, g.previousBest = null, g.splitFlash = 0, g.splitDelta = null, g.watchTime = 0, g.isRecord = !1, g.medal = null, g.respawns = 0, g.phase = "countdown", g.countdown = Ne.countdown, s.reset(), c.reset(), h.ghost.time = 0, h.ghost.delta = 0, h.ghost.active = c.loaded && h.ui.ghostEnabled, u.reset(), l.placeAt(h.car, Ne.startFrame)) : (l.placeAt(h.car, g.respawnFrame), g.phase = "racing", g.respawns += 1), g.driftHold = 0, g.airHold = 0, g.respawnFlash = 0.5, h.car.falling = 0;
    };
  return {
    get def() {
      return r;
    },
    get path() {
      return n;
    },
    contact: o,
    get physics() {
      return l;
    },
    get surface() {
      return a;
    },
    ghostPlayback: c,
    ghostPos: u.pos,
    ghostQuat: u.quat,
    get ghostSpeed() {
      return u.speed;
    },
    recorder: s,
    load(d, h = !1) {
      let g = e();
      r = Oa(d), n = un(r), a = gn(n), l = Wa(a, o, () => i);
      let b = fe.length;
      if (g.ui.trackIndex = (d % b + b) % b, c.load(pr(g.records, r.id).ghost), g.ghost.active = c.loaded && g.ui.ghostEnabled, h) {
        l.placeAt(g.car, g.run.respawnFrame);
        return;
      }
      g.run.attempt = 1, p(!0);
    },
    restart() {
      let d = e();
      d.run.attempt += 1, p(!0);
    },
    respawn() {
      e().run.phase !== "finished" && (p(!1), t.respawn());
    },
    setGround(d) {
      i = d;
    },
    rewindWatch() {
      e().run.watchTime = 0, u.rewind();
    },
    watch(d, h, g) {
      let b = e();
      return b.run.watchTime += d, u.drive(b.run.watchTime, d, h, g, a);
    },
    update(d, h) {
      let g = e(),
        b = g.run,
        f = g.car;
      if (b.respawnFlash > 0 && (b.respawnFlash = Math.max(0, b.respawnFlash - d)), b.splitFlash > 0 && (b.splitFlash = Math.max(0, b.splitFlash - d)), b.phase === "countdown") {
        let M = Math.ceil(b.countdown / 0.7);
        b.countdown = Math.max(0, b.countdown - d);
        let S = Math.ceil(b.countdown / 0.7);
        S !== M && t.countdown(S), f.rpm = 0.18 + 0.6 * h.throttle, f.throttle = h.throttle, l.step(f, Yt, d), f.vel.x = 0, f.vel.y = 0, f.vel.z = 0, b.countdown <= 0 && (b.phase = "racing");
        return;
      }
      if (b.phase !== "racing") {
        if (b.phase === "finished") {
          let M = f.speed > 0.5;
          l.step(f, M ? _i : Yt, d), M || (f.vel.x = 0, f.vel.y = 0, f.vel.z = 0, f.speed = 0);
        } else l.step(f, Yt, d);
        return;
      }
      let y = f.progress,
        v = f.boost;
      b.time += d;
      let w = f.pos.x,
        k = f.pos.y,
        x = f.pos.z;
      l.step(f, h, d), t.activity?.(d, Math.hypot(f.pos.x - w, f.pos.y - k, f.pos.z - x)), s.record(f, b.time), f.boost > v && v <= 0 && t.boost(), f.landed > O.hardLanding * 0.55 && t.land(f.landed);
      let {
        fell: m
      } = Ki(g, r, n, o, s, c, t, y);
      if (m && (p(!1), t.fall()), g.ghost.active) {
        g.ghost.time = b.time, u.follow(b.time, d);
        let M = c.timeAt(f.progress);
        g.ghost.delta = M === null ? 0 : b.time - M;
      }
    }
  };
}
var Mr = {
    chase: {
      distance: 7.8,
      height: 2.95,
      lookAhead: 8,
      lookHeight: 1.35,
      fov: 62,
      smoothing: 0.1
    },
    far: {
      distance: 14.5,
      height: 5.4,
      lookAhead: 12,
      lookHeight: 1.8,
      fov: 58,
      smoothing: 0.17
    },
    hood: {
      distance: 0.55,
      height: 1.5,
      lookAhead: 14,
      lookHeight: 1.1,
      fov: 74,
      smoothing: 0.04
    }
  },
  Zi = 1280 / 720;
function Ji(e, t = "chase") {
  let r = new se.PerspectiveCamera(Mr[t].fov, Zi, 0.5, 6e3),
    n = t,
    o = 1,
    a = new se.Vector3(0, 1, 0),
    i = new se.Vector3(0, 0, -1),
    l = new se.Vector3(),
    s = new se.Vector3(),
    c = new se.Vector3(),
    u = new se.Vector3(),
    p = new se.Vector3(),
    d = new se.Vector3(),
    h = new se.Vector3(),
    g = new se.Vector3(0, 1, 0),
    b = new se.Vector3(),
    f = new se.Vector3(),
    y = new se.Vector3(0, 1, 0),
    v = new se.Vector3(0, 0, -1),
    w = new se.Vector3(0, 1, 0),
    k = new se.Quaternion(),
    x = Mr[t].fov,
    m = 0,
    M = !1,
    S = !1,
    I = 0.7,
    A = () => {
      let {
        car: z,
        contact: T,
        pose: F
      } = e();
      if (F ? (p.copy(F.position), k.copy(F.quaternion)) : (p.set(z.pos.x, z.pos.y, z.pos.z), k.set(z.quat.x, z.quat.y, z.quat.z, z.quat.w)), d.copy(v).applyQuaternion(k), b.set(z.vel.x, z.vel.y, z.vel.z), z.grounded && T.found) g.copy(T.normal), h.copy(g);else {
        let L = Math.min(1, z.airTime / 0.75);
        h.copy(g).lerp(y, L * L).normalize(), h.lengthSq() < 0.5 && h.copy(y);
      }
      return {
        car: z,
        contact: T
      };
    },
    q = () => {
      let z = se.MathUtils.degToRad(x) / 2;
      r.fov = se.MathUtils.radToDeg(2 * Math.atan(Math.tan(z) * o)), r.updateProjectionMatrix();
    },
    E = (z, T) => {
      let {
          car: F
        } = A(),
        L = Mr[n];
      if (S) {
        I += T * 0.16, a.copy(y), c.set(Math.cos(I), 0, Math.sin(I)).multiplyScalar(19).add(p), c.y = p.y + 7.5, l.lerp(c, z ? 1 : Math.min(1, T * 2.2)), u.copy(p).addScaledVector(y, 0.9), r.position.copy(l), r.up.copy(y), r.lookAt(u), x += (52 - x) * Math.min(1, T * 3), q(), M = !0;
        return;
      }
      let V = Math.min(1, Math.abs(F.speed) / O.topSpeed),
        C = Math.min(1, F.boost / O.boostDuration),
        D = z ? 1 : 1 - Math.exp(-T / Math.max(0.001, L.smoothing));
      a.lerp(h, z ? 1 : Math.min(1, T * 8)).normalize(), b.lengthSq() > 90 ? f.copy(b).normalize().lerp(d, 0.55) : f.copy(d), i.lerp(f, z ? 1 : Math.min(1, T * 9)), i.addScaledVector(a, -i.dot(a)).normalize(), m += (0 - m) * Math.min(1, T * 6), F.landed > O.hardLanding * 0.6 && (m = Math.min(1.4, F.landed * 0.03));
      let R = L.distance * (1 + V * 0.22 + C * 0.1),
        H = L.height + V * 0.55 - m;
      s.copy(p).addScaledVector(a, H), c.copy(s).addScaledVector(i, -R), z || !M ? l.copy(c) : l.lerp(c, D), u.copy(p).addScaledVector(i, L.lookAhead).addScaledVector(a, L.lookHeight), r.position.copy(l), r.up.copy(a), r.lookAt(u);
      let Q = L.fov + V * 9 + C * 7;
      x += (Q - x) * (z ? 1 : Math.min(1, T * 4)), q(), M = !0;
    };
  return {
    camera: r,
    resize(z) {
      r.aspect = z.aspect, o = z.scale.y, q();
    },
    update(z) {
      E(!1, Math.min(z, 0.1));
    },
    setMode(z) {
      n = z, x = Mr[z].fov;
    },
    setOrbit(z) {
      S = z, z && (I = 0.7);
    },
    snap() {
      M = !1, m = 0, E(!0, 1 / 60);
    }
  };
}
var Ve = {
    summer: {
      id: "summer",
      skyTop: 3112912,
      skyMid: 5940712,
      skyHorizon: 12903159,
      cloud: 16777215,
      cloudOpacity: 0.55,
      sun: 16774368,
      sunIntensity: 2.05,
      sunAngle: [-0.55, 1, 0.42],
      fillSky: 10473727,
      fillGround: 6258506,
      fillIntensity: 1.15,
      fog: 12378101,
      fogNear: 260,
      fogFar: 900,
      groundLow: 5218117,
      groundMid: 4428092,
      groundHigh: 3702579,
      rock: 7305827,
      mountain: 4164154,
      mountainFar: 7645305,
      asphalt: 7633279,
      asphaltDark: 6580334,
      kerbA: 14039860,
      kerbB: 15987699,
      apron: 1645344,
      slabSide: 1184792,
      slabUnder: 790033,
      centerLine: 9278105,
      accent: 16761390,
      accentDim: 13078288,
      boost: 3072255,
      scatter: "trees"
    },
    desert: {
      id: "desert",
      skyTop: 4165334,
      skyMid: 7189736,
      skyHorizon: 14216440,
      cloud: 16777215,
      cloudOpacity: 0.3,
      sun: 16773583,
      sunIntensity: 2.25,
      sunAngle: [0.62, 1, 0.34],
      fillSky: 12115455,
      fillGround: 13213802,
      fillIntensity: 1.2,
      fog: 14930861,
      fogNear: 300,
      fogFar: 1e3,
      groundLow: 14465150,
      groundMid: 13674862,
      groundHigh: 12950111,
      rock: 12160855,
      mountain: 13937517,
      mountainFar: 14666144,
      asphalt: 11773581,
      asphaltDark: 10654844,
      kerbA: 9187114,
      kerbB: 15787730,
      apron: 2760985,
      slabSide: 1906448,
      slabUnder: 1314827,
      centerLine: 13024166,
      accent: 16761390,
      accentDim: 13078288,
      boost: 3072255,
      scatter: "cacti"
    },
    sunset: {
      id: "sunset",
      skyTop: 2371696,
      skyMid: 11032460,
      skyHorizon: 16751181,
      cloud: 16767408,
      cloudOpacity: 0.55,
      sun: 16760969,
      sunIntensity: 2.5,
      sunAngle: [-0.72, 0.6, -0.34],
      fillSky: 16757370,
      fillGround: 7032692,
      fillIntensity: 1.75,
      fog: 14715480,
      fogNear: 280,
      fogFar: 960,
      groundLow: 9398868,
      groundMid: 8346700,
      groundHigh: 7427146,
      rock: 10518378,
      mountain: 7031912,
      mountainFar: 10318217,
      asphalt: 7565180,
      asphaltDark: 6578285,
      kerbA: 14698300,
      kerbB: 16248804,
      apron: 2366763,
      slabSide: 1775138,
      slabUnder: 1183255,
      centerLine: 9801634,
      accent: 16766282,
      accentDim: 13672481,
      boost: 6222079,
      scatter: "palms"
    },
    alpine: {
      id: "alpine",
      skyTop: 3110072,
      skyMid: 6990300,
      skyHorizon: 14084600,
      cloud: 16777215,
      cloudOpacity: 0.65,
      sun: 16054527,
      sunIntensity: 2,
      sunAngle: [0.4, 0.95, -0.6],
      fillSky: 13625087,
      fillGround: 8229028,
      fillIntensity: 1.25,
      fog: 13624306,
      fogNear: 240,
      fogFar: 880,
      groundLow: 14674678,
      groundMid: 13491950,
      groundHigh: 16186367,
      rock: 5068645,
      mountain: 11848415,
      mountainFar: 14280949,
      asphalt: 7172732,
      asphaltDark: 6251630,
      kerbA: 14039860,
      kerbB: 16185078,
      apron: 1711394,
      slabSide: 1250842,
      slabUnder: 855826,
      centerLine: 9278365,
      accent: 16761390,
      accentDim: 13078288,
      boost: 3072255,
      scatter: "pines"
    }
  },
  ga = null,
  va = null,
  ba = null,
  wa = null;
function at() {
  return ga || (ga = new Ze.MeshLambertMaterial({
    vertexColors: !0
  })), ga;
}
function Ja() {
  return va || (va = new Ze.MeshBasicMaterial({
    vertexColors: !0,
    side: Ze.BackSide
  })), va;
}
function ia() {
  return ba || (ba = new Ze.MeshBasicMaterial({
    vertexColors: !0,
    transparent: !0,
    opacity: 0.52,
    depthWrite: !0
  })), ba;
}
function Jt() {
  return wa || (wa = new Ze.MeshBasicMaterial({
    vertexColors: !0,
    transparent: !0,
    opacity: 0.9,
    depthWrite: !1,
    blending: Ze.AdditiveBlending
  })), wa;
}
var vn = new ie.Vector3(),
  bn = new ie.Vector3(),
  Oe = new ie.Vector3(),
  zr = new ie.Vector3(),
  rr = new ie.Color(),
  wn = new ie.Matrix3(),
  he = class {
    pos = [];
    nrm = [];
    col = [];
    get count() {
      return this.pos.length / 9;
    }
    tri(e, t, r, n) {
      vn.subVectors(t, e), bn.subVectors(r, e), Oe.crossVectors(vn, bn);
      let o = Oe.length();
      if (o < 1e-9) return this;
      Oe.multiplyScalar(1 / o);
      let a = xn(n);
      return this.vertex(e, a), this.vertex(t, a), this.vertex(r, a), this;
    }
    vertex(e, t) {
      this.pos.push(e.x, e.y, e.z), this.nrm.push(Oe.x, Oe.y, Oe.z), this.col.push(t[0], t[1], t[2]);
    }
    quad(e, t, r, n, o) {
      return this.tri(e, t, r, o), this.tri(e, r, n, o), this;
    }
    box(e, t, r, n) {
      let o = t.x / 2,
        a = t.y / 2,
        i = t.z / 2,
        l = (y, v, w) => {
          let k = new ie.Vector3(y * o, v * a, w * i);
          return n && k.applyQuaternion(n), k.add(e);
        },
        s = l(1, 1, 1),
        c = l(1, 1, -1),
        u = l(1, -1, 1),
        p = l(1, -1, -1),
        d = l(-1, 1, 1),
        h = l(-1, 1, -1),
        g = l(-1, -1, 1),
        b = l(-1, -1, -1),
        f = y => Array.isArray(r) ? r[y] ?? r[0] : r;
      return this.quad(c, s, u, p, f(0)), this.quad(d, h, b, g, f(1)), this.quad(h, d, s, c, f(2)), this.quad(g, b, p, u, f(3)), this.quad(d, g, u, s, f(4)), this.quad(h, c, p, b, f(5)), this;
    }
    addGeometry(e, t, r) {
      let n = e.index ? e.toNonIndexed() : e,
        o = n.getAttribute("position"),
        a = n.getAttribute("normal"),
        i = xn(r);
      wn.getNormalMatrix(t);
      for (let l = 0; l < o.count; l++) zr.fromBufferAttribute(o, l).applyMatrix4(t), this.pos.push(zr.x, zr.y, zr.z), a ? (Oe.fromBufferAttribute(a, l).applyMatrix3(wn).normalize(), this.nrm.push(Oe.x, Oe.y, Oe.z)) : this.nrm.push(0, 1, 0), this.col.push(i[0], i[1], i[2]);
      return n !== e && n.dispose(), this;
    }
    place(e, t, r, n = new ie.Quaternion(), o = new ie.Vector3(1, 1, 1)) {
      let a = new ie.Matrix4().compose(r, n, o);
      return this.addGeometry(e, a, t);
    }
    build() {
      let e = new ie.BufferGeometry();
      return e.setAttribute("position", new ie.Float32BufferAttribute(this.pos, 3)), e.setAttribute("normal", new ie.Float32BufferAttribute(this.nrm, 3)), e.setAttribute("color", new ie.Float32BufferAttribute(this.col, 3)), e.computeBoundingSphere(), e.computeBoundingBox(), e;
    }
  };
function xn(e) {
  return typeof e == "number" ? rr.setHex(e) : rr.copy(e), [rr.r, rr.g, rr.b];
}
function re(e, t) {
  let r = new ie.Color(e);
  return t >= 0 ? r.lerp(new ie.Color(16777215), t) : r.lerp(new ie.Color(0), -t), r.getHex();
}
var Ro = 0.52,
  yn = Ro - O.rideHeight,
  kn = [[-0.83, -1.28], [0.83, -1.28], [-0.8, 1.32], [0.8, 1.32]],
  xe = 16777215,
  B = (e, t, r) => new Pe.Vector3(e, t, r),
  es = B(0, 0, 0),
  No = B(1, 0, 0),
  ts = B(0, 0, 1),
  xa = B(0, 0, 0),
  Mn = B(0, 0, 0),
  rs = B(0, 0, 0),
  as = B(0, 1, 0),
  Sn = new Pe.Quaternion(),
  ns = B(0, 0.52, 1.95),
  Xa = new Pe.Quaternion().setFromAxisAngle(No, -0.17),
  Lo = e => B(0, 0, e).applyQuaternion(Xa).add(ns),
  os = [0, -0.09, -0.17, -0.34];
function Ft(e, t, r) {
  let [n, o, a, i] = os.map(l => re(r, l));
  for (let l of [1, -1]) {
    let s = (k, x, m) => B(l * k, x, m),
      c = (k, x, m, M, S) => l > 0 ? e.quad(k, x, m, M, S) : e.quad(M, m, x, k, S);
    for (let k = 0; k + 1 < t.length; k++) {
      let [x, m, M, S, I = 0] = t[k],
        [A, q, E, z, T = 0] = t[k + 1];
      c(s(I, M, x), s(T, E, A), s(z, E, A), s(S, M, x), n), c(s(I, m, x), s(S, m, x), s(z, q, A), s(T, q, A), i), c(s(S, m, x), s(S, M, x), s(z, E, A), s(z, q, A), o), (I > 0 || T > 0) && c(s(I, m, x), s(T, q, A), s(T, E, A), s(I, M, x), a);
    }
    let [u, p, d, h, g = 0] = t[0],
      [b, f, y, v, w = 0] = t[t.length - 1];
    c(s(g, p, u), s(g, d, u), s(h, d, u), s(h, p, u), o), c(s(v, f, b), s(v, y, b), s(w, y, b), s(w, f, b), a);
  }
}
function Vr(e, t, r, n) {
  xa.set(r[0] - t[0], r[1] - t[1], r[2] - t[2]);
  let o = xa.length();
  o < 1e-6 || (Mn.set((t[0] + r[0]) / 2, (t[1] + r[1]) / 2, (t[2] + r[2]) / 2), Sn.setFromUnitVectors(as, xa.divideScalar(o)), e.box(Mn, rs.set(0.07, o, 0.07), n, Sn));
}
function is(e, t = !1) {
  ss(e);
  let r = e.count * 3;
  ls(e);
  let n = e.count * 3;
  return ds(e, t), {
    bodyEnd: r,
    accentEnd: n
  };
}
function ss(e) {
  Ft(e, [[-2.15, -0.08, 0.01, 0.07], [-1.8, -0.14, 0.05, 0.15], [-1.2, -0.17, 0.09, 0.24], [-0.78, -0.19, 0.13, 0.33]], xe), Ft(e, [[-0.8, -0.22, 0.14, 0.34], [-0.3, -0.26, 0.22, 0.44], [0.4, -0.27, 0.26, 0.46]], xe), Ft(e, [[0.35, -0.26, 0.28, 0.46], [1, -0.26, 0.32, 0.5], [1.55, -0.24, 0.24, 0.38], [1.82, -0.2, 0.14, 0.24]], xe), Ft(e, [[-0.25, -0.24, 0.02, 0.44, 0.36], [0.15, -0.26, 0.1, 0.76, 0.4], [0.7, -0.26, 0.08, 0.68, 0.42], [1.05, -0.24, 0.02, 0.5, 0.4]], xe), Ft(e, [[0.28, 0.2, 0.34, 0.13], [0.7, 0.24, 0.44, 0.11], [1.25, 0.26, 0.38, 0.07]], xe), e.box(B(0, -0.36, -2.01), B(1.52, 0.07, 0.28), re(xe, -0.04)), e.box(Lo(-0.04), B(1.5, 0.07, 0.32), re(xe, -0.04), Xa);
  for (let t of [-1, 1]) e.box(B(t * 0.76, -0.28, -1.97), B(0.05, 0.26, 0.36), re(xe, -0.12)), e.box(B(t * 0.74, 0.46, 1.95), B(0.05, 0.3, 0.4), re(xe, -0.12));
}
function ls(e) {
  Ft(e, [[-2.1, -0.02, 0.02, 0.035], [-1.8, 0.02, 0.062, 0.06], [-1.2, 0.06, 0.102, 0.09], [-0.8, 0.1, 0.145, 0.12]], xe), Ft(e, [[0.29, 0.3, 0.352, 0.06], [0.7, 0.4, 0.452, 0.05], [1.25, 0.34, 0.392, 0.03]], xe), e.box(B(0, -0.36, -1.83), B(1.52, 0.07, 0.08), re(xe, -0.04)), e.box(Lo(0.16), B(1.5, 0.07, 0.08), re(xe, -0.04), Xa);
  for (let t of [-1, 1]) e.box(B(t * 0.55, 0.09, 0.42), B(0.2, 0.06, 0.62), re(xe, -0.08));
}
function ds(e, t) {
  let r = a => t ? re(a, 0.62) : a,
    n = r(2895928),
    o = r(2237996);
  e.box(B(0, -0.3, 0.25), B(1.14, 0.07, 3.2), [o, o, n, r(1316378), n, n]), e.box(B(0, -0.26, 1.93), B(1, 0.17, 0.44), r(1842980)), e.box(B(0, 0.15, -0.12), B(0.5, 0.2, 0.8), r(921620));
  for (let a of [-1, 1]) e.box(B(a * 0.26, -0.26, 1.93), B(0.05, 0.19, 0.46), r(3817544)), e.box(B(a * 0.46, 0.23, -0.32), B(0.18, 0.07, 0.1), n), e.box(B(a * 0.07, -0.22, -1.95), B(0.05, 0.3, 0.26), n), Vr(e, [a * 0.3, -0.16, -1.08], [a * 0.79, -0.1, -1.28], n), Vr(e, [a * 0.3, -0.16, -1.48], [a * 0.79, -0.1, -1.28], n), Vr(e, [a * 0.34, -0.18, 1.12], [a * 0.76, -0.12, 1.32], n), Vr(e, [a * 0.34, -0.1, 1.55], [a * 0.76, -0.05, 1.32], n), e.box(B(a * 0.2, 0.3, 1.88), B(0.07, 0.48, 0.16), n), e.box(B(a * 0.15, 0.02, 1.86), B(0.15, 0.15, 0.22), r(1645343)), e.box(B(a * 0.15, 0.02, 1.9), B(0.09, 0.09, 0.2), r(4870232));
  e.box(B(0, 0.578, 2.06), B(0.46, 0.09, 0.16), r(3805712));
}
var zn = [null, null, null, null],
  Cr = null;
function cs(e = !0, t = !1) {
  let r = (e ? 0 : 1) + (t ? 2 : 0),
    n = zn[r];
  if (n) return n;
  let o = e ? 0.32 : 0.44,
    a = u => t ? re(u, 0.62) : u,
    i = new he(),
    l = new Pe.Quaternion().setFromAxisAngle(ts, Math.PI / 2),
    s = (u, p, d, h) => {
      let g = new Pe.CylinderGeometry(u, u, p, d, 1);
      i.place(g, h, es, l), g.dispose();
    };
  s(Ro, o, 12, a(1447964)), s(0.44, o + 0.02, 12, a(2171945)), s(0.17, o + 0.04, 16, a(7436416)), s(0.075, o + 0.06, 12, a(5001818));
  let c = i.build();
  return zn[r] = c, c;
}
function ps() {
  if (Cr) return Cr;
  let e = new he(),
    t = new Pe.ConeGeometry(1, 1, 5, 1),
    r = new Pe.Quaternion().setFromAxisAngle(No, Math.PI / 2);
  return e.place(t, 3072255, B(0, 0, 0.28), r, B(0.14, 0.56, 0.14)), e.place(t, 16777215, B(0, 0, 0.17), r, B(0.07, 0.34, 0.07)), t.dispose(), Cr = e.build(), Cr;
}
function us() {
  return new he().box(B(0, 0.585, 2.065), B(0.4, 0.08, 0.17), xe).build();
}
var ya = 0.5,
  hs = Math.PI * 2,
  Ar = new je.Color();
function en(e = {}) {
  let t = e.ghost === !0,
    r = new he(),
    {
      bodyEnd: n,
      accentEnd: o
    } = is(r, t),
    a = r.build(),
    i = a.getAttribute("color"),
    l = i.array,
    s = new Float32Array(l.subarray(0, o * 3)),
    c = (S, I, A) => {
      Ar.setHex(A);
      for (let q = S * 3; q < I * 3; q += 3) l[q] = s[q] * Ar.r, l[q + 1] = s[q + 1] * Ar.g, l[q + 2] = s[q + 2] * Ar.b;
    },
    u = (S, I) => {
      c(0, n, S), c(n, o, I), i.needsUpdate = !0;
    },
    p = new je.Group(),
    d = new je.Group();
  p.add(d);
  let h = t ? ia() : at(),
    g = t ? 3 : 0,
    b = new je.Mesh(a, h);
  b.castShadow = !t, b.renderOrder = g, d.add(b);
  let f = [];
  for (let S = 0; S < 4; S++) {
    let I = new je.Mesh(cs(S < 2, t), h);
    I.rotation.order = "YXZ", I.position.set(kn[S][0], yn, kn[S][1]), I.castShadow = !t, I.renderOrder = g, p.add(I), f.push(I);
  }
  let y = new je.Mesh(us(), Jt()),
    v = y.geometry.getAttribute("color");
  y.renderOrder = g + 4, y.visible = !1, d.add(y);
  let w = [];
  for (let S of [-0.15, 0.15]) {
    let I = new je.Mesh(ps(), Jt());
    I.position.set(S, 0.02, 1.92), I.scale.set(0.65, 0.65, 0.35), I.renderOrder = g + 4, I.visible = !1, d.add(I), w.push(I);
  }
  u(e.body ?? 15856372, e.accent ?? 14169132), p.userData.bbox = {
    w: 2.1,
    h: 1.25,
    d: 4.3
  }, p.userData.collider = {
    type: "sphere",
    radius: 1.5,
    offset: [0, 0, 0]
  };
  let k = [0, 0, 0, 0],
    x = 0,
    m = -1,
    M = 0;
  return {
    group: p,
    update: S => {
      let I = S.steer ?? 0,
        A = S.drift ?? 0,
        q = S.wheelAngle ?? 0,
        E = q - x;
      x = q;
      let z = Math.min(1, Math.max(0, (Math.abs(S.speed ?? 0) - 26) / 40));
      M = (M + E * (1 - 0.62 * z)) % hs;
      let T = S.suspension;
      for (let N = 0; N < 4; N++) {
        k[N] = (T ? T[N] ?? ya : ya) - ya;
        let P = f[N];
        P.rotation.x = M, P.rotation.y = N < 2 ? -I * 0.46 : 0, P.position.y = yn + 0.09 * k[N];
      }
      let F = (k[0] + k[1]) * 0.5,
        L = (k[2] + k[3]) * 0.5,
        V = (k[0] + k[2]) * 0.5,
        C = (k[1] + k[3]) * 0.5;
      d.rotation.x = (L - F) * 0.09, d.rotation.z = (V - C) * 0.07 + I * (0.045 + A * 0.05), d.rotation.y = -I * A * 0.07, d.position.y = -(F + L) * 0.05;
      let D = S.brake ?? 0;
      if (y.visible = D > 0.02, y.visible && D !== m) {
        let N = v.array;
        for (let P = 0; P < N.length; P += 3) N[P] = D, N[P + 1] = D * 0.09, N[P + 2] = D * 0.05;
        v.needsUpdate = !0;
      }
      m = D;
      let R = S.boost ?? 0,
        H = R > 0.02,
        Q = 0.65 + R * 0.55;
      for (let N = 0; N < w.length; N++) w[N].visible = H, H && w[N].scale.set(Q, Q, 0.35 + R * 1.35);
    },
    setPaint: u
  };
}
function Po(e = {}) {
  let t = e.tint ?? 14087935,
    r = en({
      ghost: !0,
      body: t,
      accent: re(t, -0.28)
    });
  return r.group.traverse(n => {
    n.renderOrder = Math.max(n.renderOrder, 3);
  }), r.group.userData.ghost = !0, r;
}
var _e = e => e < 0 ? 0 : e > 1 ? 1 : e,
  Nt = e => {
    let t = _e(e);
    return t * t * (3 - 2 * t);
  },
  Kr = (e, t, r) => e + (t - e) * r;
function oe(e, t, r = 0) {
  let n = Math.imul(e | 0, 668265261) ^ Math.imul(t | 0, 374761393) ^ Math.imul(r | 0, 2654435761);
  return n = Math.imul(n ^ n >>> 15, 2246822507), n = Math.imul(n ^ n >>> 13, 3266489909), ((n ^ n >>> 16) >>> 0) / 4294967296;
}
function ms(e, t, r = 0) {
  let n = Math.floor(e),
    o = Math.floor(t),
    a = Nt(e - n),
    i = Nt(t - o),
    l = Kr(oe(n, o, r), oe(n + 1, o, r), a),
    s = Kr(oe(n, o + 1, r), oe(n + 1, o + 1, r), a);
  return Kr(l, s, i);
}
function fs(e, t, r = 0, n = 4, o = 1 / 260) {
  let a = 0,
    i = 1,
    l = 0,
    s = o;
  for (let c = 0; c < n; c++) a += i * (ms(e * s, t * s, r + c * 1013) * 2 - 1), l += i, i *= 0.5, s *= 2.1;
  return a / l;
}
var Oo = 2600,
  gs = 0.9,
  Vn = 0.3,
  vs = 0.45;
function bs(e = {}) {
  let t = e.theme ?? Ve.summer,
    r = e.radius ?? Oo,
    n = new X.Group();
  return n.name = "sky", n.add(ws(t, r)), n.add(xs(t, r)), n.userData.bbox = {
    w: r * 2,
    h: r * 2,
    d: r * 2
  }, n;
}
function ws(e, t) {
  let r = new X.IcosahedronGeometry(t, 4),
    n = r.getAttribute("position"),
    o = new Float32Array(n.count * 3),
    a = new X.Color(e.skyTop),
    i = new X.Color(e.skyMid),
    l = new X.Color(e.skyHorizon),
    s = new X.Color(e.skyHorizon).multiplyScalar(0.62),
    c = new X.Color();
  for (let d = 0; d < n.count; d++) {
    let h = n.getY(d) / t,
      g = h > 0 ? h : 0;
    c.copy(l).lerp(i, Nt(_e(g / 0.26))), c.lerp(a, Nt(_e((g - 0.2) / 0.68))), h < 0 && c.lerp(s, Nt(_e(-h / 0.55))), o[d * 3] = c.r, o[d * 3 + 1] = c.g, o[d * 3 + 2] = c.b;
  }
  r.setAttribute("color", new X.Float32BufferAttribute(o, 3));
  let u = Ja().clone();
  u.side = X.BackSide, u.depthWrite = !1, u.fog = !1;
  let p = new X.Mesh(r, u);
  return p.name = "sky-dome", p.renderOrder = -2, p.frustumCulled = !1, p.castShadow = !1, p.receiveShadow = !1, p;
}
function xs(e, t) {
  let r = e.skyTop ^ e.cloud,
    n = 15 + Math.floor(oe(r, 3) * 6),
    o = new X.IcosahedronGeometry(1, 0),
    a = new he(),
    i = new X.Color(e.cloud),
    l = new X.Color(),
    s = new X.Vector3(),
    c = new X.Vector3(),
    u = new X.Quaternion(),
    p = new X.Vector3(0, 1, 0),
    d = t * gs,
    h = t / Oo;
  for (let f = 0; f < n; f++) {
    let y = f / n * Math.PI * 2 + (oe(f, 1, r) - 0.5) * 0.42,
      v = t * (Vn + oe(f, 2, r) * (vs - Vn)),
      w = Math.sqrt(Math.max(1, d * d - v * v)),
      k = Math.cos(y) * w,
      x = Math.sin(y) * w;
    u.setFromAxisAngle(p, -(y + Math.PI / 2));
    let m = -Math.sin(y),
      M = Math.cos(y),
      S = 3 + Math.floor(oe(f, 4, r) * 3),
      I = (130 + oe(f, 5, r) * 190) * h;
    for (let A = 0; A < S; A++) {
      let q = f * 17 + A,
        E = (A - (S - 1) / 2) * I * 0.62 + (oe(q, 6, r) - 0.5) * I * 0.3,
        z = (oe(q, 7, r) - 0.5) * 34 * h,
        T = 0.62 + oe(q, 8, r) * 0.62;
      s.set(k + m * E, v + z, x + M * E), c.set(I * 0.62 * T, (24 + oe(q, 9, r) * 34) * h * T, I * 0.44 * T);
      let F = 0.9 + oe(q, 10, r) * 0.1;
      l.setRGB(i.r * F, i.g * F, i.b * F), a.place(o, l, s, u, c);
    }
  }
  o.dispose();
  let g = Ja().clone();
  g.side = X.FrontSide, g.transparent = !0, g.opacity = e.cloudOpacity, g.depthWrite = !1, g.fog = !1;
  let b = new X.Mesh(a.build(), g);
  return b.name = "sky-clouds", b.renderOrder = -1, b.frustumCulled = !1, b.castShadow = !1, b.receiveShadow = !1, b;
}
var tn = 4.4,
  ys = 3.4,
  Ba = 21,
  ks = 0.9,
  Cn = 90,
  An = 34,
  _r = 110,
  Ms = 18,
  Ss = 70,
  Ir = _r,
  In = (e, t) => (e + 4096) * 8192 + (t + 4096);
function ka(e) {
  let t = e.halfWidth + e.apron,
    r = e.p.y - Math.abs(e.right.y) * t - Math.abs(e.fwd.y) * (G.step / 2) - Math.max(0, e.up.y) * G.thickness;
  return Math.min(e.p.y - tn, r - ys);
}
function Wo(e, t = 1337, r = Ba) {
  let n = e.frames,
    o = n.length,
    a = Math.max(Ba, r),
    i = [];
  for (let v = 0; v < o; v += 2) i.push(v);
  i[i.length - 1] !== o - 1 && i.push(o - 1);
  let l = i.length,
    s = new Float64Array(l),
    c = new Float64Array(l),
    u = new Float64Array(l),
    p = new Map();
  for (let v = 0; v < l; v++) {
    let w = i[v],
      k = n[w];
    s[v] = k.p.x, c[v] = k.p.z;
    let x = ka(k);
    w > 0 && (x = Math.min(x, ka(n[w - 1]))), w + 1 < o && (x = Math.min(x, ka(n[w + 1]))), u[v] = x;
    let m = In(Math.floor(s[v] / Ir), Math.floor(c[v] / Ir)),
      M = p.get(m);
    M ? M.push(v) : p.set(m, [v]);
  }
  let d = e.bounds.min.x,
    h = e.bounds.max.x,
    g = e.bounds.min.z,
    b = e.bounds.max.z,
    f = _r * _r,
    y = Cn * Cn;
  return {
    height: (v, w) => {
      let k = Math.floor(v / Ir),
        x = Math.floor(w / Ir),
        m = 1 / 0,
        M = 1 / 0,
        S = 0,
        I = 0;
      for (let L = k - 1; L <= k + 1; L++) for (let V = x - 1; V <= x + 1; V++) {
        let C = p.get(In(L, V));
        if (C) for (let D = 0; D < C.length; D++) {
          let R = C[D],
            H = s[R] - v,
            Q = c[R] - w,
            N = H * H + Q * Q;
          if (N >= f) continue;
          N < m && (m = N);
          let P = 1 - N / f;
          if (S += P * P, I += P * P * u[R], N < y) {
            let W = u[R] + ks * Math.max(0, Math.sqrt(N) - a);
            W < M && (M = W);
          }
        }
      }
      let A = Math.max(d - v, 0, v - h),
        q = Math.max(g - w, 0, w - b),
        E = Nt(_e((Math.hypot(A, q) - 40) / 420)),
        z = S > 0 ? I / S * _e(S / 3) : 0,
        T = m === 1 / 0 ? 1 : Nt(_e((Math.sqrt(m) - An) / (_r - An))),
        F = z + fs(v, w, t) * Kr(Ms, Ss, E) * T;
      return F < M ? F : M;
    }
  };
}
var Tn = 260,
  En = 1600,
  zs = 14,
  Ma = 130;
function Vs(e, t) {
  let r = e.bounds,
    n = r.getCenter(new Ho.Vector3()),
    o = Math.max(r.max.x - r.min.x + Tn * 2, En),
    a = Math.max(r.max.z - r.min.z + Tn * 2, En),
    i = Math.max(zs, Math.max(o, a) / Ma),
    l = Math.max(8, Math.min(Ma, Math.ceil(o / i))),
    s = Math.max(8, Math.min(Ma, Math.ceil(a / i))),
    c = n.x - l * i / 2,
    u = n.z - s * i / 2,
    p = Wo(e, t, Math.max(Ba, i * 1.5)),
    d = l + 1,
    h = s + 1,
    g = new Float32Array(d * h),
    b = 1 / 0,
    f = -1 / 0,
    y = 0;
  for (let v = 0; v < h; v++) {
    let w = u + v * i;
    for (let k = 0; k < d; k++) {
      let x = p.height(c + k * i, w);
      g[v * d + k] = x, y += x, x < b && (b = x), x > f && (f = x);
    }
  }
  return {
    center: n,
    cell: i,
    cols: l,
    rows: s,
    minX: c,
    minZ: u,
    nx: d,
    nz: h,
    height: g,
    hMin: b,
    hMax: f,
    hSum: y,
    heightAt: (v, w) => {
      let k = (v - c) / i,
        x = (w - u) / i;
      if (!(k >= 0 && x >= 0 && k <= l && x <= s)) return p.height(v, w);
      let m = Math.min(l - 1, Math.floor(k)),
        M = Math.min(s - 1, Math.floor(x)),
        S = k - m,
        I = x - M,
        A = g[M * d + m],
        q = g[M * d + m + 1],
        E = g[(M + 1) * d + m],
        z = g[(M + 1) * d + m + 1];
      return m + M & 1 ? I > S ? A + S * (z - E) + I * (E - A) : A + S * (q - A) + I * (z - q) : S + I <= 1 ? A + S * (q - A) + I * (E - A) : z + (1 - S) * (E - z) + (1 - I) * (q - z);
    }
  };
}
var qn = new Ye.Vector3(),
  Fn = new Ye.Vector3(),
  Rn = new Ye.Vector3();
function Cs(e, t = {}) {
  let r = t.theme ?? Ve.summer,
    n = t.center ?? new Ye.Vector3(),
    o = t.baseY ?? 0,
    a = t.seed ?? 1337,
    i = 44 + Math.floor(oe(7, 11, a) * 16),
    l = new Ye.Color(r.mountain),
    s = new Ye.Color(r.mountainFar),
    c = new Ye.Color(),
    u = new Ye.Color(),
    p = o - 70;
  for (let d = 0; d < i; d++) {
    let h = oe(d, 1, a),
      g = oe(d, 2, a),
      b = oe(d, 3, a),
      f = oe(d, 4, a),
      y = oe(d, 5, a),
      v = d / i * Math.PI * 2 + (h - 0.5) * 0.1,
      w = 700 + g * 400,
      k = 90 + b * 130,
      x = k * (0.62 + f * 0.5),
      m = n.x + Math.cos(v) * w,
      M = n.z + Math.sin(v) * w,
      S = 5 + Math.floor(y * 3),
      I = h * Math.PI * 2;
    qn.set(m + (f - 0.5) * x * 0.3, p + k, M + (y - 0.5) * x * 0.3), c.copy(l).lerp(s, _e((k - 90) / 130));
    for (let A = 0; A < S; A++) {
      let q = I + A / S * Math.PI * 2,
        E = I + (A + 1) / S * Math.PI * 2,
        z = 0.72 + oe(d * 31 + A, 9, a) * 0.56,
        T = 0.72 + oe(d * 31 + (A + 1) % S, 9, a) * 0.56;
      Fn.set(m + Math.cos(q) * x * z, p, M + Math.sin(q) * x * z), Rn.set(m + Math.cos(E) * x * T, p, M + Math.sin(E) * x * T);
      let F = 1 + (oe(d, A * 7 + 3, a) - 0.5) * 0.1;
      u.setRGB(Math.min(1, c.r * F), Math.min(1, c.g * F), Math.min(1, c.b * F)), e.tri(Rn, Fn, qn, u);
    }
  }
}
var As = () => na([{
    t: "straight",
    len: 90
  }, {
    t: "turn",
    dir: 1,
    angle: 95,
    radius: 55,
    bank: 12
  }, {
    t: "straight",
    len: 70
  }, {
    t: "turn",
    dir: -1,
    angle: 70,
    radius: 60
  }, {
    t: "straight",
    len: 60
  }]),
  Nn = new ce.Vector3(),
  Ln = new ce.Vector3(),
  Sa = new ce.Vector3();
function Is(e, t, r) {
  Nn.subVectors(t, e), Ln.subVectors(r, e), Sa.crossVectors(Nn, Ln);
  let n = Sa.length();
  return n > 1e-9 ? Sa.y / n : 1;
}
function Ts(e = {}) {
  let t = e.path ?? As(),
    r = e.theme ?? Ve.summer,
    n = e.seed ?? 1337,
    {
      center: o,
      cell: a,
      cols: i,
      rows: l,
      minX: s,
      minZ: c,
      nx: u,
      nz: p,
      height: d,
      hMin: h,
      hMax: g,
      hSum: b,
      heightAt: f
    } = Vs(t, n),
    y = new he(),
    v = new ce.Color(r.groundLow),
    w = new ce.Color(r.groundMid),
    k = new ce.Color(r.groundHigh),
    x = new ce.Color(r.rock),
    m = new ce.Color(),
    M = Math.max(1, g - h),
    S = new ce.Vector3(),
    I = new ce.Vector3(),
    A = new ce.Vector3(),
    q = new ce.Vector3(),
    E = (L, V, C, D) => {
      let R = _e(((L.y + V.y + C.y) / 3 - h) / M);
      R < 0.5 ? m.copy(v).lerp(w, R * 2) : m.copy(w).lerp(k, (R - 0.5) * 2);
      let H = Is(L, V, C);
      H < 0.707 && m.lerp(x, _e((0.707 - H) / 0.2));
      let Q = 1 + (oe(D, D * 7 + 1, n) - 0.5) * 0.08;
      m.setRGB(Math.min(1, m.r * Q), Math.min(1, m.g * Q), Math.min(1, m.b * Q)), y.tri(L, V, C, m);
    };
  for (let L = 0; L < l; L++) {
    let V = c + L * a,
      C = V + a;
    for (let D = 0; D < i; D++) {
      let R = s + D * a,
        H = R + a;
      S.set(R, d[L * u + D], V), I.set(R, d[(L + 1) * u + D], C), A.set(H, d[(L + 1) * u + D + 1], C), q.set(H, d[L * u + D + 1], V);
      let Q = L * u + D;
      D + L & 1 ? (E(S, I, A, Q * 2), E(S, A, q, Q * 2 + 1)) : (E(S, I, q, Q * 2), E(I, A, q, Q * 2 + 1));
    }
  }
  Cs(y, {
    theme: r,
    center: o,
    baseY: b / (u * p),
    seed: n
  });
  let z = new ce.Mesh(y.build(), at());
  z.name = "terrain", z.receiveShadow = !0, z.castShadow = !1;
  let T = new ce.Group();
  T.name = "terrain", T.add(z);
  let F = (z.geometry.boundingBox ?? new ce.Box3()).getSize(new ce.Vector3());
  return T.userData.bbox = {
    w: F.x,
    h: F.y,
    d: F.z
  }, {
    group: T,
    heightAt: f
  };
}
var Be = 0.06,
  Pn = 0.18,
  Es = 0.05,
  bt = new vr.Vector3(),
  wt = new vr.Vector3(),
  xt = new vr.Vector3(),
  yt = new vr.Vector3();
function Y(e, t, r, n, o) {
  return o.copy(e.p).addScaledVector(e.right, t).addScaledVector(e.up, r).addScaledVector(e.fwd, n);
}
var ta = e => Math.min(e, Math.max(0.2, e - G.kerb));
function it(e, t, r, n, o, a, i, l, s, c) {
  e.quad(Y(t, n, l, 0, bt), Y(t, o, s, 0, wt), Y(r, i, s, 0, xt), Y(r, a, l, 0, yt), c);
}
function Tr(e, t, r, n, o, a, i, l, s) {
  s > 0 ? e.quad(Y(t, n, a, 0, bt), Y(t, n, i, 0, wt), Y(r, o, i, 0, xt), Y(r, o, a, 0, yt), l) : e.quad(Y(t, n, i, 0, bt), Y(t, n, a, 0, wt), Y(r, o, a, 0, xt), Y(r, o, i, 0, yt), l);
}
function qs(e, t, r, n, o, a, i) {
  e.quad(Y(t, n, a, 0, bt), Y(t, -n, a, 0, wt), Y(r, -o, a, 0, xt), Y(r, o, a, 0, yt), i);
}
function za(e, t, r, n, o, a, i, l) {
  i ? e.quad(Y(t, r, a, 0, bt), Y(t, r, o, 0, wt), Y(t, n, o, 0, xt), Y(t, n, a, 0, yt), l) : e.quad(Y(t, r, o, 0, bt), Y(t, r, a, 0, wt), Y(t, n, a, 0, xt), Y(t, n, o, 0, yt), l);
}
function Dn(e, t, r, n) {
  let o = t.halfWidth,
    a = ta(o),
    i = o + t.apron;
  za(e, t, -i, i, 0, -G.thickness, r, n), za(e, t, -o, -a, Be, 0, r, n), za(e, t, a, o, Be, 0, r, n);
}
function Fs(e, t, r) {
  let n = Math.min(2.3, Math.max(1.1, ta(t.halfWidth) * 0.55)),
    o = 1.4,
    a = 0.58,
    i = Es,
    l = 1;
  e.quad(Y(t, 0, i, l, bt), Y(t, 0, i, l - a, wt), Y(t, n, i, l - o - a, xt), Y(t, n, i, l - o, yt), r), e.quad(Y(t, 0, i, l, bt), Y(t, -n, i, l - o, wt), Y(t, -n, i, l - o - a, xt), Y(t, 0, i, l - a, yt), r);
}
var Rs = 6,
  Ns = 6.5,
  On = 0.8,
  ra = 1.2,
  Qa = 0.06,
  Hn = 0.5,
  Ls = 0.88,
  Ps = 2,
  Wn = 20,
  Ds = 0.2,
  Os = [[-1, -1], [1, -1], [1, 1], [-1, 1]],
  Va = [0, 1, 2, 3].map(() => new Dt.Vector3()),
  st = [0, 1, 2, 3].map(() => new Dt.Vector3()),
  Wt = new Dt.Vector3(),
  Bn = new Dt.Vector3(),
  zt = new Dt.Vector3(),
  Er = new Dt.Vector3();
function Hs(e, t, r, n) {
  let o = r.y - Ds;
  if (n >= o) return !1;
  for (let a = 0; a < e.length; a++) {
    if (Math.abs(a - t) <= Ps) continue;
    let i = e[a];
    if (!i.road || i.p.y > o + G.thickness || i.p.y < n - G.thickness) continue;
    let l = r.x - i.p.x,
      s = r.z - i.p.z,
      c = i.halfWidth + i.apron + ra;
    if (!(l * l + s * s > c * c)) for (let u = 0; u <= Wn; u++) {
      let p = o + (n - o) * (u / Wn);
      Er.set(l, p - i.p.y, s);
      let d = Er.dot(i.up);
      if (!(d > Qa || d < -G.thickness - Qa) && Math.abs(Er.dot(i.right)) < c && Math.abs(Er.dot(i.fwd)) < G.step / 2 + ra) return !0;
    }
  }
  return !1;
}
function Ws(e, t, r, n) {
  let o = r.slabSide,
    a = re(r.slabSide, -0.35),
    i = 0;
  for (let l = 0; l < t.length; l += Rs) {
    let s = t[l];
    if (!s.road || s.up.y < Ls) continue;
    Wt.copy(s.p).addScaledVector(s.up, Qa - G.thickness);
    let c = n(Wt.x, Wt.z);
    if (!Number.isFinite(c) || s.p.y - c < Ns || Hs(t, l, Wt, c - Hn)) continue;
    zt.set(s.fwd.x, 0, s.fwd.z), zt.lengthSq() < 1e-6 && zt.set(0, 0, 1), zt.normalize(), Bn.set(-zt.z, 0, zt.x);
    let u = c - Hn;
    for (let p = 0; p < 4; p++) {
      let [d, h] = Os[p];
      Va[p].copy(Wt).addScaledVector(s.right, d * On).addScaledVector(s.fwd, h * On), st[p].copy(Wt).addScaledVector(Bn, d * ra).addScaledVector(zt, h * ra), st[p].y = u;
    }
    for (let p = 0; p < 4; p++) {
      let d = (p + 1) % 4;
      e.quad(Va[p], st[p], st[d], Va[d], o);
    }
    e.quad(st[0], st[3], st[2], st[1], a), i++;
  }
  return i;
}
var Bs = 2,
  qr = 0.11,
  Qn = 0.015,
  Qs = 2,
  Us = 5,
  Gs = 3,
  $s = 12,
  js = 0.75,
  Ca = null;
function Ys() {
  return Ca || (Ca = na([{
    t: "straight",
    len: 26
  }, {
    t: "turn",
    dir: 1,
    angle: 72,
    radius: 34,
    bank: 14
  }, {
    t: "pitch",
    to: 13,
    len: 16
  }, {
    t: "pitch",
    to: -13,
    len: 18
  }, {
    t: "pitch",
    to: 0,
    len: 14
  }, {
    t: "boost",
    len: 12
  }, {
    t: "gap",
    len: 7
  }, {
    t: "straight",
    len: 14
  }, {
    t: "loop",
    radius: 11
  }, {
    t: "straight",
    len: 16
  }])), Ca;
}
var Ks = () => -1 / 0;
function _s(e = {}) {
  let t = e.path ?? Ys(),
    r = e.theme ?? Ve.summer,
    n = t.frames,
    o = new he(),
    a = [],
    i = [r.kerbA, r.kerbB],
    l = [re(r.kerbA, 0.16), re(r.kerbB, 0.1)],
    s = re(r.boost, 0.5),
    c = new Le.Color(r.asphaltDark).lerp(new Le.Color(r.asphalt), js).getHex(),
    u = -G.thickness;
  for (let b = 0; b < n.length - 1; b++) {
    let f = n[b],
      y = n[b + 1];
    if (!f.road || !y.road) continue;
    let v = f.halfWidth,
      w = y.halfWidth,
      k = ta(v),
      x = ta(w),
      m = Math.min(v, k + Pn),
      M = Math.min(w, x + Pn),
      S = v + f.apron,
      I = w + y.apron,
      A = f.boost || y.boost,
      q = A ? r.boost : Math.floor(b / $s) % 2 ? c : r.asphalt,
      E = Math.floor(b / Bs) % 2,
      z = i[E];
    it(o, f, y, -k, k, -x, x, 0, 0, q), !A && b % Us < Qs && it(o, f, y, -qr, qr, -qr, qr, Qn, Qn, r.centerLine), it(o, f, y, -m, -k, -M, -x, Be, 0, l[E]), it(o, f, y, -v, -m, -w, -M, Be, Be, z), Tr(o, f, y, -v, -w, Be, 0, z, -1), it(o, f, y, k, m, x, M, 0, Be, l[E]), it(o, f, y, m, v, M, w, Be, Be, z), Tr(o, f, y, v, w, Be, 0, z, 1), it(o, f, y, -S, -v, -I, -w, 0, 0, r.apron), it(o, f, y, v, S, w, I, 0, 0, r.apron), Tr(o, f, y, -S, -I, 0, u, r.slabSide, -1), Tr(o, f, y, S, I, 0, u, r.slabSide, 1), qs(o, f, y, S, I, u, r.slabUnder);
  }
  for (let b = 0; b < n.length; b++) {
    let f = n[b];
    if (!f.road) continue;
    let y = b > 0 ? n[b - 1] : null,
      v = b + 1 < n.length ? n[b + 1] : null;
    f.boost && (a.push(b), b % Gs === 0 && y?.road && v?.road && Fs(o, f, s)), (!y || !y.road) && Dn(o, f, !1, r.slabSide), (!v || !v.road) && Dn(o, f, !0, r.slabSide);
  }
  e.supports !== !1 && Ws(o, n, r, e.groundHeight ?? Ks);
  let p = o.build(),
    d = new Le.Mesh(p, at());
  d.castShadow = !0, d.receiveShadow = !0, d.name = "track-road";
  let h = new Le.Group();
  h.name = "track-mesh", h.add(d);
  let g = (p.boundingBox ?? new Le.Box3()).getSize(new Le.Vector3());
  return h.userData.bbox = {
    w: g.x,
    h: g.y,
    d: g.z
  }, {
    group: h,
    boostFrames: a,
    dispose: () => {
      p.dispose(), h.remove(d);
    }
  };
}
var de = (e, t, r) => new sa.Vector3(e, t, r),
  Rt = e => [0.05, -0.1, 0.16, -0.32, 0, -0.18].map(t => re(e, t)),
  rn = (e, t) => Math.max(e + t * 0.6, e + G.apron - t / 2 - 0.15),
  an = (e, t, r, n) => {
    e.userData.bbox = {
      w: t,
      h: r,
      d: n
    };
  },
  sr = 0.9,
  Lt = sr * 1.5,
  Un = 0.44,
  Ua = 7.5,
  nn = 1.1,
  Gn = 1,
  fr = Ua + nn / 2,
  Bo = nn * 1.1,
  Qo = fr + Bo / 2;
function Uo(e, t, r) {
  for (let n of [-1, 1]) e.box(de(n * t, Ua / 2, 0), de(sr, Ua, sr), Rt(r)), e.box(de(n * t, Un / 2, 0), de(Lt, Un, Lt), Rt(1909031)), e.box(de(n * t, fr, 0), de(sr * 1.3, Bo, Gn * 1.15), Rt(1909031));
  e.box(de(0, fr, 0), de(t * 2 + sr, nn, Gn), Rt(r));
}
function Go(e) {
  let t = new sa.Mesh(e.build(), at());
  return t.castShadow = !1, t.receiveShadow = !1, t;
}
var lt = (e, t, r) => new Pt.Vector3(e, t, r);
function Zs(e = {}) {
  let t = e.theme ?? Ve.summer,
    r = e.halfWidth ?? G.halfWidth,
    n = Math.max(2, e.length ?? 12),
    o = r * 0.75,
    a = 2.2,
    i = 0.8,
    l = o * 0.45,
    s = new Pt.Group(),
    c = new he(),
    u = n / 2,
    p = re(t.boost, -0.66);
  c.quad(lt(-o, 0.03, u), lt(o, 0.03, u), lt(o, 0.03, -u), lt(-o, 0.03, -u), p);
  let d = new Pt.Mesh(c.build(), Jt());
  d.renderOrder = 2, s.add(d);
  let h = new he(),
    g = Math.floor(n / a) + 2;
  for (let f = 0; f < g; f++) {
    let y = u + a - f * a,
      v = re(t.boost, f % 2 ? 0.02 : 0.2);
    for (let w of [-1, 1]) {
      let k = lt(0, 0.07, y - l),
        x = lt(0, 0.07, y - l + i),
        m = lt(w * o, 0.07, y + i),
        M = lt(w * o, 0.07, y);
      w > 0 ? h.quad(k, x, m, M, v) : h.quad(k, M, m, x, v);
    }
  }
  let b = new Pt.Mesh(h.build(), Jt());
  return b.renderOrder = 3, s.add(b), s.userData.bbox = {
    w: o * 2,
    h: 0.1,
    d: n
  }, {
    group: s,
    update(f) {
      let y = b.position.z - 11 * f;
      b.position.z = y - Math.ceil(y / a) * a;
    }
  };
}
function Js(e = {}) {
  let t = e.theme ?? Ve.summer,
    r = e.halfWidth ?? G.halfWidth,
    n = 0.3,
    o = 0.62,
    a = rn(r, o),
    i = new ue.Group(),
    l = new ue.MeshLambertMaterial({
      vertexColors: !0
    });
  l.color.setHex(t.accent);
  let s = new he(),
    c = 8,
    u = r * 2 / c;
  for (let w = 0; w < c; w++) {
    let k = -r + u * (w + 0.5);
    s.box(de(k, 0.1, 0), de(u * 0.96, 0.18, 1.7), w % 2 ? 16777215 : 14869218);
  }
  let p = new ue.Mesh(s.build(), l);
  p.receiveShadow = !0, i.add(p);
  let d = w => {
      let k = new he(),
        x = new ue.Quaternion().setFromEuler(new ue.Euler(0, 0, -w * 0.3));
      k.box(de(-w * 0.85, 0.08, 0), de(1.5, 0.72, 0.1), 16777215, x), k.box(de(-w * 0.14, 0, 0), de(0.3, 0.16, 0.16), 14606046);
      let m = new ue.Mesh(k.build(), l);
      return m.position.set(w * a, 2.28, 0), i.add(m), m;
    },
    h = d(-1),
    g = d(1),
    b = new he();
  for (let w of [-1, 1]) b.box(de(w * a, 1.3, 0), de(n, 2.6, n), Rt(2830392)), b.box(de(w * a, 0.15, 0), de(o, 0.3, o), Rt(1777445));
  let f = new ue.Mesh(b.build(), at());
  f.castShadow = !0, i.add(f), an(i, a * 2 + o, 2.93, 1.7);
  let y = 0,
    v = !1;
  return {
    group: i,
    update(w) {
      if (v) return;
      y += w, p.scale.y = 1 + Math.sin(y * 3.6) * 0.35;
      let k = Math.sin(y * 1.9) * 0.3;
      h.rotation.y = k, g.rotation.y = -k;
    },
    setTaken(w) {
      w !== v && (v = w, l.color.setHex(w ? 6056794 : t.accent), w && (p.scale.y = 1, h.rotation.y = 0, g.rotation.y = 0));
    }
  };
}
function Xs(e = {}) {
  let t = e.theme ?? Ve.summer,
    r = e.halfWidth ?? G.halfWidth,
    n = rn(r, Lt),
    o = new ue.Group(),
    a = new he();
  Uo(a, n, t.accent), o.add(Go(a));
  let i = new he(),
    l = Math.max(6, Math.round(r * 2 / 1.3)),
    s = r * 2 / l;
  for (let u = 0; u < l * 2; u++) {
    let p = u < l ? 0 : 1,
      d = u % l,
      h = de(s * 0.99, 0.16, 1.3),
      g = (p + d) % 2 ? 15921906 : 1053464;
    i.box(de(-r + s * (d + 0.5), 0.09, -0.65 + p * 1.3), h, g);
  }
  let c = new ue.Mesh(i.build(), at());
  return c.castShadow = !1, c.receiveShadow = !0, o.add(c), an(o, n * 2 + Lt, Qo, 2.6), {
    group: o,
    update() {}
  };
}
function el(e = {}) {
  let t = e.theme ?? Ve.summer,
    r = e.halfWidth ?? G.halfWidth,
    n = rn(r, Lt),
    o = 0.35,
    a = 1.5,
    i = 0.8,
    l = 0.6,
    s = new he();
  Uo(s, n, t.accentDim);
  for (let h = 0; h < 3; h++) s.box(de((h - 1) * a, fr, 0.62), de(0.94, 0.94, 0.34), Rt(1382429));
  let c = new ue.Group();
  c.add(Go(s));
  let u = new ue.SphereGeometry(o, 10, 6),
    p = [];
  for (let h = 0; h < 3; h++) {
    let g = new ue.MeshBasicMaterial({
        color: 2760984
      }),
      b = new ue.Mesh(u, g);
    b.position.set((h - 1) * a, fr, i), b.scale.z = l, c.add(b), p.push(g);
  }
  an(c, n * 2 + Lt, Qo, i + o * l + Lt / 2);
  let d = h => {
    for (let g = 0; g < 3; g++) p[g].color.setHex(h >= 4 ? 2883434 : g < h ? 16723232 : 2760984);
  };
  return d(0), {
    group: c,
    update() {},
    setStage: d
  };
}
var Xe = (e, t, r) => new Je.Vector3(e, t, r),
  Fr = (e, t, r) => new Je.Quaternion().setFromEuler(new Je.Euler(e, t, r)),
  tl = e => [0.06, -0.1, 0.18, -0.34, 0, -0.2].map(t => re(e, t));
function $n(e) {
  let t = e.index ? e.toNonIndexed() : e;
  return t !== e && e.dispose(), t.computeVertexNormals(), t;
}
function $o(e = 5060386, t = 4168250) {
  let r = new he(),
    n = $n(new Je.CylinderGeometry(0.32, 0.66, 3, 5));
  r.place(n, e, Xe(0, 1.2, 0)), r.box(Xe(0.34, 2.5, 0.1), Xe(0.24, 1.5, 0.24), tl(re(e, 0.08)), Fr(0, 0.6, -0.5));
  let o = $n(new Je.OctahedronGeometry(1, 0));
  return r.place(o, t, Xe(0, 3.5, 0), Fr(0.16, 0.5, 0.13), Xe(2.55, 1.65, 2.35)), r.place(o, re(t, 0.12), Xe(0.78, 4.5, -0.42), Fr(-0.22, 1.7, 0.28), Xe(1.85, 1.3, 1.75)), r.place(o, re(t, -0.12), Xe(-0.6, 5.05, 0.55), Fr(0.3, 2.7, -0.2), Xe(1.4, 1.1, 1.35)), n.dispose(), o.dispose(), r.build();
}
var rl = Math.PI * 2,
  j = (e, t, r) => new Me.Vector3(e, t, r),
  _t = (e, t, r, n) => new Me.Quaternion().setFromEuler(new Me.Euler(e, t, r, n)),
  Rr = e => [0.06, -0.1, 0.18, -0.34, 0, -0.2].map(t => re(e, t));
function lr(e) {
  if (e.index) {
    let t = e.toNonIndexed();
    e.dispose(), e = t;
  }
  return e.computeVertexNormals(), e;
}
function al(e = "trees") {
  let t = new he();
  if (e === "trees") return $o();
  if (e === "pines") {
    t.box(j(0, 0.4, 0), j(0.5, 2.4, 0.5), Rr(3877916));
    let r = lr(new Me.ConeGeometry(2, 3.4, 7));
    t.place(r, 2057792, j(0, 2.9, 0)), t.place(r, 2586187, j(0, 4.7, 0), void 0, j(0.74, 0.85, 0.74)), t.place(r, 3114069, j(0, 6.15, 0), void 0, j(0.46, 0.72, 0.46)), r.dispose();
  } else if (e === "cacti") {
    let r = lr(new Me.CylinderGeometry(0.55, 0.72, 6.4, 7)),
      n = lr(new Me.SphereGeometry(0.56, 7, 4)),
      o = lr(new Me.CylinderGeometry(0.34, 0.4, 1.9, 6)),
      a = _t(0, 0, Math.PI / 2);
    t.place(r, 4160069, j(0, 2.2, 0)).place(n, 4621904, j(0, 5.4, 0)), t.place(o, 3829824, j(0.72, 3.1, 0), a, j(1, 0.8, 1)), t.place(o, 4160069, j(1.32, 3.85, 0)), t.place(n, 4621904, j(1.32, 4.8, 0), void 0, j(0.66, 0.66, 0.66)), t.place(o, 3829824, j(-0.6, 2.2, 0), a, j(1, 0.62, 1)), t.place(o, 4160069, j(-1.05, 2.95, 0), void 0, j(0.86, 0.9, 0.86)), t.place(n, 4621904, j(-1.05, 3.75, 0), void 0, j(0.56, 0.56, 0.56)), r.dispose(), n.dispose(), o.dispose();
  } else {
    for (let n = 0; n < 6; n++) {
      let o = n / 5;
      t.box(j(o * o * 1.1, n === 0 ? 0.15 : 0.55 + n * 1.02, 0), j(0.46 - n * 0.03, n === 0 ? 1.86 : 1.06, 0.46 - n * 0.03), Rr(9072712), _t(0, 0, -o * 0.22));
    }
    let r = j(1.1, 6.35, 0);
    t.box(r, j(0.8, 0.7, 0.8), Rr(7297078));
    for (let n = 0; n < 6; n++) {
      let o = _t(0.34 + n % 2 * 0.22, n / 6 * rl, 0, "YXZ");
      t.box(j(0, 0, 1.9).applyQuaternion(o).add(r), j(1.05, 0.12, 3.7), Rr(4164178), o);
    }
  }
  return t.build();
}
function nl(e = Ve.summer.rock) {
  let t = new he(),
    r = lr(new Me.IcosahedronGeometry(1, 0));
  return t.place(r, e, j(0, 0.5, 0), _t(0.3, 0.6, 0.2), j(1.7, 0.9, 1.4)), t.place(r, re(e, -0.14), j(0.95, 0.3, 0.45), _t(0.8, 1.4, 0.5), j(0.85, 0.55, 0.8)), t.place(r, re(e, 0.1), j(-0.7, 0.24, -0.5), _t(1.2, 0.2, 0.9), j(0.72, 0.46, 0.62)), r.dispose(), t.build();
}
var vt = (e, t, r) => new la.Vector3(e, t, r),
  Ga = e => [0.06, -0.1, 0.18, -0.34, 0, -0.2].map(t => re(e, t)),
  ol = 40,
  il = 2.4,
  sl = tn + 2.2,
  ll = tn + 2,
  Bt = 26,
  Qt = 9,
  jn = 7,
  dl = 2,
  cl = 16;
function pl(e, t, r, n) {
  let o = t.frames,
    a = new la.Vector3(),
    i = [],
    l = 26,
    s = 0;
  for (let c of o) {
    if (!c.road || c.steep || c.up.y < 0.6 || Math.abs(c.bank) > 0.5 || c.dist < l) continue;
    l = c.dist + ol;
    let u = s++ % 2 ? 15921906 : r.accent,
      p = c.halfWidth + c.apron + 1.2;
    for (let d of [-1, 1]) {
      let h = c.p.x + c.right.x * d * p,
        g = c.p.z + c.right.z * d * p,
        b = n(h, g);
      if (c.p.y - b > sl) continue;
      let f = c.p.y + il;
      if (f - b < 0.6) continue;
      a.set(h, (f + b) / 2, g);
      let y = !1;
      for (let v of zo(t, a, i)) {
        let w = o[v];
        if (w === c || w.p.y <= b || w.p.y > f + 0.6) continue;
        let k = w.halfWidth + w.apron;
        (w.p.x - h) ** 2 + (w.p.z - g) ** 2 < k * k && (y = !0);
      }
      y || (e.box(vt(h, (f + b) / 2, g), vt(0.3, f - b, 0.3), Ga(u)), e.box(vt(h, b + 0.22, g), vt(0.62, 0.44, 0.62), Ga(2237996)));
    }
  }
}
function ul(e, t, r, n, o) {
  let a = t.halfWidth + t.apron + 3.5,
    i = a + Qt / 2,
    l = (f, y, v, w, k) => {
      let x = t.p.clone().addScaledVector(t.right, r * f).addScaledVector(t.up, y).addScaledVector(t.fwd, v);
      e.box(x, w, Ga(k), t.q);
    },
    s = 1 / 0,
    c = new la.Vector3();
  for (let f of [a, a + Qt]) for (let y of [-Bt / 2, 0, Bt / 2]) c.copy(t.p).addScaledVector(t.right, r * f).addScaledVector(t.fwd, y), s = Math.min(s, o(c.x, c.z));
  let u = Math.min(cl, Math.max(1.2, t.p.y - s));
  l(i, -u / 2, 0, vt(Qt, u, Bt * 0.94), 2237996);
  let p = 4,
    d = Qt / p,
    h = 0.35,
    g = jn - h / 2,
    b = (jn - h - dl - 1.1) / (p - 1);
  for (let f = 0; f < p; f++) {
    let y = 1.1 + f * b,
      v = f % 2 ? 14672872 : n.accent;
    l(a + d * (f + 0.5), y / 2, 0, vt(d, y, Bt), v);
  }
  l(i, g, 0, vt(Qt, h, Bt), 10134187);
  for (let f of [-1, 1]) l(a + Qt - 0.4, g / 2, f * (Bt / 2 - 1.2), vt(0.45, g, 0.45), 2830392);
}
function hl(e, t, r) {
  let n = e.p.clone().addScaledVector(e.right, t * (e.halfWidth + e.apron + 8));
  return e.p.y - r(n.x, n.z) <= ll;
}
function ml(e) {
  let t = [],
    r = 0;
  for (let n = 1; n <= e.length; n++) {
    let o = e[n - 1],
      a = n < e.length ? e[n] : null;
    a !== null && a.road && !a.steep && a.up.y > 0.9 && Math.abs(a.bank) < 0.12 && o.fwd.dot(a.fwd) > 0.9997 || (n - r >= 30 && t.push([r, n - 1]), r = n);
  }
  return t.sort((n, o) => o[1] - o[0] - (n[1] - n[0])), t.slice(0, 3);
}
var fl = Math.PI * 2,
  Nr = (e, t, r) => new ve.Vector3(e, t, r),
  Aa = 28,
  gl = 110;
function vl(e) {
  let t = e >>> 0;
  return () => {
    t = t + 1831565813 >>> 0;
    let r = Math.imul(t ^ t >>> 15, 1 | t);
    return r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r, ((r ^ r >>> 14) >>> 0) / 4294967296;
  };
}
function bl(e) {
  let t = new Map();
  for (let r of e) {
    let n = `${Math.floor(r.p.x / 32)},${Math.floor(r.p.z / 32)}`,
      o = t.get(n);
    o ? o.push(r.index) : t.set(n, [r.index]);
  }
  return (r, n, o) => {
    let a = o * o,
      i = 1 / 0;
    for (let l = Math.floor((r - o) / 32); l <= Math.floor((r + o) / 32); l++) for (let s = Math.floor((n - o) / 32); s <= Math.floor((n + o) / 32); s++) {
      let c = t.get(`${l},${s}`);
      if (c) for (let u of c) {
        let p = e[u].p.x - r,
          d = e[u].p.z - n,
          h = p * p + d * d;
        h <= a && h < i && (i = h);
      }
    }
    return i;
  };
}
function wl(e = {}) {
  let t = e.path ?? xl(),
    r = e.theme ?? Ve.summer,
    n = e.seed ?? 40503,
    o = vl(n),
    a = t.frames,
    i = new ve.Group(),
    l = bl(a),
    s = e.groundHeight ? null : Wo(t, n),
    c = e.groundHeight ?? ((k, x) => s.height(k, x)),
    u = [],
    p = [],
    d = new ve.Box3().union(t.bounds),
    h = new ve.Quaternion(),
    g = Nr(0, 1, 0),
    b = 260;
  for (let k = 0; k < b * 14 && u.length + p.length < b; k++) {
    let x = a[Math.floor(o() * a.length)],
      m = -x.fwd.z,
      M = x.fwd.x,
      S = Math.hypot(m, M);
    if (S < 0.25) continue;
    let I = o() < 0.5 ? -1 : 1,
      A = Aa + 4 + Math.pow(o(), 0.55) * (gl - Aa),
      q = x.p.x + m / S * I * A + (o() - 0.5) * 14,
      E = x.p.z + M / S * I * A + (o() - 0.5) * 14;
    if (l(q, E, Aa) < 1 / 0) continue;
    let z = o() < 0.3,
      T = z ? 0.5 + o() * 1.5 : 0.72 + o() * 0.7;
    h.setFromAxisAngle(g, o() * fl);
    let F = new ve.Matrix4().compose(Nr(q, c(q, E) - (z ? 0.3 * T : 0.55), E), h, Nr(T, T * (0.85 + o() * 0.4), T));
    (z ? p : u).push(F), d.expandByPoint(Nr(q, 0, E));
  }
  let f = (k, x) => {
    if (!x.length) {
      k.dispose();
      return;
    }
    let m = new ve.InstancedMesh(k, at(), x.length),
      M = new ve.Color();
    for (let S = 0; S < x.length; S++) {
      m.setMatrixAt(S, x[S]);
      let I = 0.86 + o() * 0.26;
      m.setColorAt(S, M.setRGB(I, I, I));
    }
    m.instanceMatrix.needsUpdate = !0, m.instanceColor && (m.instanceColor.needsUpdate = !0), m.castShadow = !0, m.frustumCulled = !1, i.add(m);
  };
  f(r.scatter === "trees" ? $o() : al(r.scatter), u), f(nl(r.rock), p);
  let y = k => {
      let x = o() < 0.5 ? -1 : 1;
      for (let m of [x, -x]) {
        if (!hl(k, m, c)) continue;
        let M = !0;
        for (let S of [-12, 0, 12]) {
          let I = k.p.clone().addScaledVector(k.right, m * (k.halfWidth + k.apron + 9)).addScaledVector(k.fwd, S);
          l(I.x, I.z, 15) < 1 / 0 && (M = !1);
        }
        if (M) return m;
      }
      return 0;
    },
    v = new he();
  pl(v, t, r, c);
  for (let [k, x] of ml(a)) {
    let m = a[Math.floor((k + x) / 2)],
      M = y(m);
    M !== 0 && ul(v, m, M, r, c);
  }
  v.count > 0 && i.add(new ve.Mesh(v.build(), at()));
  let w = d.getSize(new ve.Vector3());
  return i.userData.bbox = {
    w: w.x,
    h: Math.max(w.y, 12),
    d: w.z
  }, i;
}
function xl() {
  return na([{
    t: "straight",
    len: 120
  }, {
    t: "turn",
    dir: 1,
    angle: 70,
    radius: 55
  }, {
    t: "straight",
    len: 90
  }]);
}
function yl(e = {}) {
  let t = new we.Group(),
    r = (e.halfWidth ?? G.halfWidth) + 2,
    n = new we.Mesh(new we.TorusGeometry(r, 0.28, 6, 64), new we.MeshLambertMaterial({
      color: 2433842
    })),
    o = new we.MeshBasicMaterial({
      color: 16762967
    }),
    a = new we.Mesh(new we.TorusGeometry(r, 0.12, 6, 64), o);
  n.position.y = a.position.y = 3, a.position.z = 0.25, t.add(n, a);
  let i = new we.BoxGeometry(0.65, 0.22, 0.2),
    l = new we.MeshBasicMaterial({
      color: 16774359
    });
  for (let c = 0; c < 8; c++) {
    let u = c * Math.PI / 4,
      p = new we.Mesh(i, l);
    p.position.set(Math.cos(u) * r, 3 + Math.sin(u) * r, 0.36), p.rotation.z = u + Math.PI / 2, t.add(p);
  }
  let s = !1;
  return {
    group: t,
    update() {},
    setTaken(c) {
      s !== c && (s = c, o.color.setHex(c ? 7661244 : 16762967));
    }
  };
}
function kl(e, t) {
  let r = Ve[e.theme],
    n = [],
    o = [],
    a = bs({
      theme: r
    }),
    i = new Do.Group(),
    l = Ts({
      path: t,
      theme: r,
      seed: Yn(e.id)
    }),
    s = l.heightAt;
  i.add(l.group), i.add(_s({
    path: t,
    theme: r,
    groundHeight: s,
    supports: e.id !== "drift-spiral"
  }).group), i.add(wl({
    path: t,
    theme: r,
    seed: Yn(e.id) + 17,
    groundHeight: s
  }));
  let c = Math.min(8, t.frames.length - 1),
    u = el({
      theme: r,
      halfWidth: t.frames[c].halfWidth
    });
  Lr(u.group, t, c), i.add(u.group), n.push(u);
  let p = u;
  for (let h of t.checkpoints) {
    let g = e.pieces.some(b => b.t === "spiral") ? yl({
      halfWidth: t.frames[h].halfWidth
    }) : Js({
      theme: r,
      halfWidth: t.frames[h].halfWidth
    });
    Lr(g.group, t, h), i.add(g.group), n.push(g), o.push(g);
  }
  let d = Xs({
    theme: r,
    halfWidth: t.frames[t.finishFrame].halfWidth
  });
  Lr(d.group, t, t.finishFrame), i.add(d.group), n.push(d);
  for (let h of Ml(t)) {
    let g = Math.floor((h.from + h.to) / 2),
      b = Zs({
        theme: r,
        halfWidth: t.frames[g].halfWidth,
        length: Math.max(6, (h.to - h.from) * G.step)
      });
    Lr(b.group, t, g), i.add(b.group), n.push(b);
  }
  return {
    world: i,
    sky: a,
    gates: n,
    checkpointGates: o,
    startGantry: p,
    groundHeight: s
  };
}
function Lr(e, t, r) {
  let n = t.frames[Math.max(0, Math.min(t.frames.length - 1, r))];
  e.position.copy(n.p), e.quaternion.copy(n.q);
}
function Ml(e) {
  let t = [],
    r = -1;
  for (let n = 0; n < e.frames.length; n++) {
    let o = e.frames[n].boost;
    o && r < 0 && (r = n), !o && r >= 0 && (t.push({
      from: r,
      to: n - 1
    }), r = -1);
  }
  return r >= 0 && t.push({
    from: r,
    to: e.frames.length - 1
  }), t;
}
function Yn(e) {
  let t = 2166136261;
  for (let r = 0; r < e.length; r++) t ^= e.charCodeAt(r), t = Math.imul(t, 16777619);
  return t >>> 0;
}
var Kn = 220;
function Sl(e) {
  let t = en(),
    r = Po();
  e.scene.add(t.group), e.scene.add(r.group);
  let n = Xi(e.scene, "studio", {
      shadows: !0,
      renderer: e.renderer
    }),
    o = n.key;
  o.shadow.mapSize.set(2048, 2048);
  let a = o.shadow.camera;
  a.left = -46, a.right = 46, a.top = 46, a.bottom = -46, a.near = 1, a.far = Kn * 2, a.updateProjectionMatrix(), o.shadow.bias = -0.0016, o.shadow.normalBias = 0.05, e.scene.add(o.target);
  let i = new Set([...e.assets.owned, at(), Ja(), ia(), Jt()]),
    l = null,
    s = null,
    c = null,
    u = [],
    p = [],
    d = null,
    h = new Xt.Vector3(0, 1, 0),
    g = f => {
      f.traverse(y => {
        let v = y;
        v.isInstancedMesh && v.dispose();
      });
    },
    b = () => {
      u.length = 0, p.length = 0, d = null, l && (g(l), Sr(l, {
        skip: i
      }), l = null), s && (Sr(s, {
        skip: i
      }), s = null);
    };
  return {
    car: t,
    ghostCar: r,
    build(f, y) {
      b();
      let v = kl(f, y);
      c = v.groundHeight, s = v.sky, e.scene.add(s), l = v.world, u.push(...v.gates), p.push(...v.checkpointGates), d = v.startGantry, e.scene.add(l);
      let w = Ve[f.theme];
      h.set(w.sunAngle[0], w.sunAngle[1], w.sunAngle[2]).normalize(), o.color.setHex(w.sun), o.intensity = w.sunIntensity, n.fill.color.setHex(w.fillSky), n.fill.groundColor.setHex(w.fillGround), n.fill.intensity = w.fillIntensity, e.scene.fog = new Xt.Fog(w.fog, w.fogNear, w.fogFar), e.scene.background = new Xt.Color(w.fog);
    },
    update(f, y, v) {
      s && s.position.copy(y), o.position.copy(v).addScaledVector(h, Kn), o.target.position.copy(v), o.target.updateMatrixWorld();
      for (let w of u) w.update(f);
    },
    setCheckpointsTaken(f) {
      for (let y = 0; y < p.length; y++) p[y].setTaken(y < f);
    },
    setStartStage(f) {
      d?.setStage(f);
    },
    setGhostVisible(f) {
      r.group.visible = f;
    },
    groundHeightAt(f, y) {
      return c ? c(f, y) : -1 / 0;
    },
    dispose() {
      b(), Sr(t.group, {
        skip: i
      }), Sr(r.group, {
        skip: i
      }), n.dispose();
    }
  };
}
var jo = 0,
  $a = 1,
  Zr = 2,
  zl = 3,
  Vl = [2.7, 1.05, 5.6, 1.5],
  Cl = [-1.15, 26, -2.2, 9.5],
  Al = new ee.Color(15922943),
  Il = new ee.Vector3(0, 0, 1),
  Tl = new ee.Vector3(),
  El = new ee.Vector3(),
  Pr = new ee.Vector3(),
  Ia = new ee.Quaternion(),
  ql = new ee.Euler(),
  _n = new ee.Matrix4(),
  dt = new ee.Color(),
  Vt = (e, t) => e + Math.random() * (t - e);
function Fl() {
  let e = new ee.TetrahedronGeometry(0.5),
    t = new Float32Array(e.getAttribute("position").count * 3).fill(1);
  return e.setAttribute("color", new ee.Float32BufferAttribute(t, 3)), e;
}
function Rl(e = {}) {
  let t = Math.max(16, Math.floor(e.capacity ?? 480)),
    r = () => new Float32Array(t),
    n = r(),
    o = r(),
    a = r(),
    i = r(),
    l = r(),
    s = r(),
    c = r(),
    u = r(),
    p = r(),
    d = r(),
    h = r(),
    g = r(),
    b = r(),
    f = r(),
    y = r(),
    v = r(),
    w = r(),
    k = r(),
    x = r(),
    m = new Uint8Array(t),
    M = 0,
    S = Fl(),
    I = ia().clone();
  I.opacity = 0.92, I.depthWrite = !1;
  let A = new ee.InstancedMesh(S, Jt(), t),
    q = new ee.InstancedMesh(S, I, t);
  for (let R of [A, q]) {
    let H = new ee.InstancedBufferAttribute(new Float32Array(t * 3).fill(1), 3);
    H.setUsage(ee.DynamicDrawUsage), R.instanceColor = H, R.instanceMatrix.setUsage(ee.DynamicDrawUsage), R.frustumCulled = !1, R.count = 0;
  }
  A.renderOrder = 4, q.renderOrder = 3;
  let E = [A.instanceMatrix.array, q.instanceMatrix.array],
    z = [A.instanceColor.array, q.instanceColor.array],
    T = new ee.Group();
  T.name = "particles", T.add(A, q);
  function F(R, H, Q, N, P, W, U) {
    let K = M;
    M = M + 1 >= t ? 0 : M + 1, n[K] = H.x, o[K] = H.y, a[K] = H.z, i[K] = Q.x, l[K] = Q.y, s[K] = Q.z, c[K] = Vt(0, 6.283), u[K] = Vt(0, 6.283), p[K] = Vt(0, 6.283), d[K] = Vt(-U, U), h[K] = Vt(-U, U), g[K] = Vt(-U, U), v[K] = N, w[K] = N, k[K] = P, dt.setHex(W).multiplyScalar(Vt(0.86, 1.14)), b[K] = dt.r, f[K] = dt.g, y[K] = dt.b, x[K] = Cl[R], m[K] = R;
  }
  function L(R) {
    R.instanceMatrix.needsUpdate = !0, R.instanceColor && (R.instanceColor.needsUpdate = !0);
  }
  function V(R) {
    let H = 0,
      Q = 0;
    for (let N = 0; N < t; N++) {
      if (v[N] <= 0) continue;
      if (v[N] -= R, v[N] <= 0) {
        v[N] = 0;
        continue;
      }
      let P = m[N],
        W = Math.max(0, 1 - Vl[P] * R);
      l[N] -= x[N] * R, i[N] *= W, l[N] *= W, s[N] *= W, n[N] += i[N] * R, o[N] += l[N] * R, a[N] += s[N] * R, c[N] += d[N] * R, u[N] += h[N] * R, p[N] += g[N] * R;
      let U = 1 - v[N] / w[N],
        K = b[N],
        Ae = f[N],
        De = y[N],
        Ie = k[N],
        er = 1;
      if (P === jo) Ie *= (0.45 + 1.05 * U) * (U > 0.62 ? (1 - U) / 0.38 : 1), dt.setRGB(K, Ae, De).lerp(Al, U * 0.5), K = dt.r, Ae = dt.g, De = dt.b;else if (P === $a) {
        Ie *= Math.pow(Math.max(0, 1 - U), 0.6);
        let St = 1 - U * U;
        K *= St, Ae *= St, De *= St;
      } else if (P === Zr) {
        Ie *= 0.55 + 0.85 * U, er = 2.4 - 1.4 * U;
        let St = (1 - U) * (1 - U);
        K *= St, Ae *= St, De *= St;
      } else U > 0.88 && (Ie *= (1 - U) / 0.12);
      P === Zr ? (Pr.set(i[N], l[N], s[N]), Pr.lengthSq() > 1e-8 || Pr.set(0, 0, 1), Ia.setFromUnitVectors(Il, Pr.normalize())) : Ia.setFromEuler(ql.set(c[N], u[N], p[N])), _n.compose(Tl.set(n[N], o[N], a[N]), Ia, El.set(Ie, Ie, Ie * er));
      let nt = P === $a || P === Zr ? 0 : 1,
        Mt = nt === 0 ? H++ : Q++;
      _n.toArray(E[nt], Mt * 16), z[nt][Mt * 3] = K, z[nt][Mt * 3 + 1] = Ae, z[nt][Mt * 3 + 2] = De;
    }
    A.count = H, q.count = Q, H > 0 && L(A), Q > 0 && L(q);
  }
  function C() {
    v.fill(0), M = 0, A.count = 0, q.count = 0;
  }
  function D() {
    C(), T.remove(A, q), A.dispose(), q.dispose(), S.dispose(), I.dispose();
  }
  return {
    group: T,
    spawn: F,
    update: V,
    reset: C,
    dispose: D,
    capacity: t
  };
}
var Zn = [16731453, 16761390, 3072255, 6547548, 16743121, 16185078],
  Nl = 9080726,
  Ut = new da.Vector3(),
  Gt = new da.Vector3(),
  Ct = new da.Vector3(),
  pe = (e, t) => e + Math.random() * (t - e);
function Ll(e = {}) {
  let t = Rl(e);
  function r(u) {
    if (!(u > 0)) return 0;
    let p = u < t.capacity ? u : t.capacity,
      d = Math.floor(p);
    return Math.random() < p - d ? d + 1 : d;
  }
  function n(u, p, d) {
    Ut.set(u.x + pe(-p, p), u.y + pe(-d, d), u.z + pe(-p, p));
  }
  function o(u, p, d, h) {
    Ct.copy(u), Ct.lengthSq() > 1e-8 || Ct.set(p, d, h), Ct.normalize();
  }
  function a(u, p, d) {
    let h = Ct.y * u + pe(-p * 0.3, d);
    Gt.set(Ct.x * u + pe(-p, p), h, Ct.z * u + pe(-p, p));
  }
  function i(u, p, d, h) {
    let g = r(d);
    if (g === 0) return;
    o(p, 0, 1, 0);
    let b = Number.isFinite(h) ? h : Nl;
    for (let f = 0; f < g; f++) n(u, 0.35, 0.25), a(pe(0.9, 2.8), 1.7, 1.4), t.spawn(jo, Ut, Gt, pe(0.45, 0.95), pe(0.55, 1.15), b, 1.6);
  }
  function l(u, p, d) {
    let h = r(d);
    if (h !== 0) {
      o(p, 0, 1, 0);
      for (let g = 0; g < h; g++) n(u, 0.2, 0.2), a(pe(7, 19), 4.5, 5), t.spawn($a, Ut, Gt, pe(0.22, 0.52), pe(0.16, 0.32), Math.random() < 0.4 ? 16773304 : 16747036, 9);
    }
  }
  function s(u, p, d) {
    let h = r(d);
    if (h !== 0) {
      o(p, 0, 0, 1);
      for (let g = 0; g < h; g++) n(u, 0.25, 0.15), a(pe(5, 13), 1.2, 1.4), t.spawn(Zr, Ut, Gt, pe(0.16, 0.34), pe(0.42, 0.8), Math.random() < 0.5 ? 3072255 : 16766826, 1);
    }
  }
  function c(u, p) {
    let d = r(p);
    for (let h = 0; h < d; h++) {
      let g = pe(0, 6.283),
        b = pe(1.5, 9);
      n(u, 1.2, 0.8), Ut.y += 0.8, Gt.set(Math.cos(g) * b, pe(6, 15), Math.sin(g) * b);
      let f = Zn[Math.random() * Zn.length | 0];
      t.spawn(zl, Ut, Gt, pe(1.6, 3.1), pe(0.22, 0.44), f, 7);
    }
  }
  return {
    group: t.group,
    emitDust: i,
    emitSparks: l,
    emitBoost: s,
    emitConfetti: c,
    update: t.update,
    reset: t.reset,
    dispose: t.dispose
  };
}
var Dr = 0.02,
  Or = 0.34,
  Pl = 0.35,
  Dl = 9,
  Ol = new $.Color(1052948),
  Hl = new $.Color(7040886),
  He = new $.Vector3(),
  ct = new $.Vector3(),
  Hr = new $.Color();
function Wl(e = {}) {
  let t = Math.max(8, Math.floor(e.segments ?? 900)),
    r = t * 6,
    n = new Float32Array(r * 3),
    o = new Float32Array(r * 3),
    a = new $.BufferAttribute(n, 3).setUsage($.DynamicDrawUsage),
    i = new $.BufferAttribute(o, 3).setUsage($.DynamicDrawUsage),
    l = new $.BufferGeometry();
  l.setAttribute("position", a), l.setAttribute("color", i), l.setDrawRange(0, 0), l.boundingSphere = new $.Sphere(new $.Vector3(), 1e6);
  let s = ia().clone();
  s.opacity = 0.62, s.depthWrite = !1, s.side = $.DoubleSide;
  let c = new $.Mesh(l, s);
  c.frustumCulled = !1, c.renderOrder = 2;
  let u = new $.Group();
  u.name = "skidmarks", u.add(c);
  let p = [new $.Vector3(), new $.Vector3(), new $.Vector3(), new $.Vector3()],
    d = [new $.Vector3(), new $.Vector3(), new $.Vector3(), new $.Vector3()],
    h = new $.Vector3(1, 0, 0),
    g = !1,
    b = 0,
    f = 0,
    y = !1,
    v = 0;
  function w(A) {
    n[v] = A.x, n[v + 1] = A.y, n[v + 2] = A.z, o[v] = Hr.r, o[v + 1] = Hr.g, o[v + 2] = Hr.b, v += 3;
  }
  function k(A, q, E, z) {
    v = b * 18, w(A), w(q), w(E), w(A), w(E), w(z), b = b + 1 >= t ? 0 : b + 1, f < t && f++, y = !0;
  }
  function x(A, q, E, z) {
    if (ct.copy(E), ct.lengthSq() > 1e-8 || ct.set(0, 1, 0), ct.normalize(), He.subVectors(q, A), He.lengthSq() > 1e-8 || He.copy(h), He.normalize(), g && h.dot(He) < 0 && (g = !1), d[0].copy(A).addScaledVector(He, -Or).addScaledVector(ct, Dr), d[1].copy(A).addScaledVector(He, Or).addScaledVector(ct, Dr), d[2].copy(q).addScaledVector(He, -Or).addScaledVector(ct, Dr), d[3].copy(q).addScaledVector(He, Or).addScaledVector(ct, Dr), g) {
      let T = p[0].distanceTo(d[0]);
      if (T < Pl) return;
      if (T <= Dl) {
        let F = z > 0 ? z < 1 ? z : 1 : 0;
        Hr.copy(Hl).lerp(Ol, F), k(p[0], p[1], d[1], d[0]), k(p[2], p[3], d[3], d[2]);
      }
    }
    for (let T = 0; T < 4; T++) p[T].copy(d[T]);
    h.copy(He), g = !0;
  }
  function m() {
    g = !1;
  }
  function M(A) {
    y && (l.setDrawRange(0, f * 6), a.needsUpdate = !0, i.needsUpdate = !0, y = !1);
  }
  function S() {
    b = 0, f = 0, g = !1, y = !1, h.set(1, 0, 0), l.setDrawRange(0, 0);
  }
  function I() {
    S(), u.remove(c), l.dispose(), s.dispose();
  }
  return {
    group: u,
    push: x,
    lift: m,
    update: M,
    reset: S,
    dispose: I
  };
}
var Jn = 4;
function aa() {
  let e = new Ke.Vector3(),
    t = new Ke.Quaternion(),
    r = new Ke.Vector3(),
    n = new Ke.Quaternion(),
    o = new Ke.Vector3(),
    a = new Ke.Quaternion(),
    i = new Ke.Vector3(),
    l = new Ke.Quaternion(),
    s = !1,
    c;
  return {
    position: o,
    quaternion: a,
    push(u, p, d) {
      e.copy(r), t.copy(n), r.set(u.x, u.y, u.z), n.set(p.x, p.y, p.z, p.w), (!s || d !== c || e.distanceToSquared(r) > Jn * Jn) && (e.copy(r), t.copy(n)), c = d, s = !0, o.copy(r), a.copy(n);
    },
    sample(u) {
      if (!s) return;
      let p = u < 0 ? 0 : u > 1 ? 1 : u;
      o.lerpVectors(e, r, p), a.copy(t).slerp(n, p);
    },
    rebase(u, p) {
      i.set(u.x, u.y, u.z), l.set(p.x, p.y, p.z, p.w), e.add(i), r.add(i), o.add(i), t.premultiply(l), n.premultiply(l), a.premultiply(l);
    },
    reset() {
      s = !1;
    }
  };
}
var Bl = 0.52,
  Xn = 0.82,
  eo = 1.32;
function Ql(e) {
  let {
      getState: t,
      race: r,
      scene: n,
      particles: o,
      skid: a,
      watchCar: i
    } = e,
    l = aa(),
    s = aa(),
    c = l.position,
    u = l.quaternion,
    p = new ht.Vector3(),
    d = new ht.Vector3(),
    h = new ht.Vector3(),
    g = new ht.Vector3(),
    b = new ht.Vector3(),
    f = new ht.Vector3(0, 0, -1),
    y = new ht.Vector3(1, 0, 0),
    v = 0,
    w = -1,
    k = () => {
      let x = t(),
        m = x.multiplayer.racers.find(M => M.id === x.multiplayer.selfId)?.net;
      m && (m.snap ? (l.reset(), l.push(x.car.pos, x.car.quat, x.car.teleport), m.snap = !1) : l.rebase(m.rebase, m.rebaseRotation), m.rebase = {
        x: 0,
        y: 0,
        z: 0
      }, m.rebaseRotation = {
        x: 0,
        y: 0,
        z: 0,
        w: 1
      });
    };
  return {
    carPosition: c,
    carQuaternion: u,
    applyCarPose() {
      let x = t(),
        m = x.car,
        M = x.run.phase === "countdown" ? 3 - Math.max(0, Math.ceil(x.run.countdown / 0.7) - 1) : 4;
      M !== w && (w = M, n.setStartStage(M)), k(), l.push(m.pos, m.quat, m.teleport), n.car.update({
        steer: m.steer,
        wheelAngle: m.wheelAngle,
        suspension: m.suspension,
        brake: m.brake,
        boost: Math.min(1, m.boost / O.boostDuration),
        drift: m.drift,
        speed: m.speed
      });
      let S = x.ui.screen === "race" && x.ghost.active && x.ui.ghostEnabled;
      n.setGhostVisible(S), S ? (s.push(r.ghostPos, r.ghostQuat), v += r.ghostSpeed / Bl * (1 / 60), n.ghostCar.update({
        speed: r.ghostSpeed,
        wheelAngle: v,
        steer: 0
      })) : s.reset();
    },
    applyWatchPose() {
      l.push(i.pos, i.quat), s.reset(), n.ghostCar.update({
        speed: i.speed,
        wheelAngle: i.wheelAngle,
        steer: 0
      }), n.setGhostVisible(!0), n.car.group.visible = !1;
    },
    interpolate(x) {
      k();
      let m = t().ui.watching;
      l.sample(x);
      let M = m ? n.ghostCar.group : n.car.group;
      M.position.copy(l.position), M.quaternion.copy(l.quaternion), !m && n.ghostCar.group.visible && (s.sample(x), n.ghostCar.group.position.copy(s.position), n.ghostCar.group.quaternion.copy(s.quaternion));
    },
    driveEffects(x) {
      let m = t().car,
        M = r.contact;
      m.grounded && m.drift > 0.22 && Math.abs(m.speed) > 6 ? (p.copy(f).applyQuaternion(u), d.copy(y).applyQuaternion(u), h.copy(c).addScaledVector(d, -Xn).addScaledVector(p, -eo).addScaledVector(M.normal, -O.rideHeight + 0.04), g.copy(c).addScaledVector(d, Xn).addScaledVector(p, -eo).addScaledVector(M.normal, -O.rideHeight + 0.04), a.push(h, g, M.normal, m.drift), m.drift > 0.4 && o.emitDust(h, M.normal, 1, 14341062)) : a.lift(), m.boost > 0 && (p.copy(f).applyQuaternion(u), b.copy(c).addScaledVector(p, -2.1), o.emitBoost(b, p.multiplyScalar(-1), 1));
    },
    resetTrail() {
      a.reset(), o.reset();
    },
    hudValues() {
      let x = t(),
        m = x.ui.watching,
        M = pr(x.records, r.def.id),
        S = m ? x.run.watchTime : x.run.finishTime ?? x.run.time,
        I = !m && x.ghost.active && x.run.phase === "racing" && x.run.time > 0.4,
        A = x.run.phase === "countdown" ? Math.max(1, Math.ceil(x.run.countdown / 0.7)) : x.run.phase === "racing" && x.run.time < 0.45 ? 0 : null,
        q = Math.abs(m ? i.speed : x.car.speed);
      return {
        trackName: r.def.name,
        recordLabel: M.best === null ? "No record" : tt(M.best),
        currentLabel: tt(S),
        diffLabel: I ? Ha(x.ghost.delta) : "---",
        diffSign: I ? x.ghost.delta < 0 ? -1 : x.ghost.delta > 0 ? 1 : 0 : 0,
        checkpoints: `${x.run.checkpoints}/${r.path.checkpoints.length}`,
        speed: q * Da.speedToKmh,
        gear: m ? 1 : x.car.gear,
        boost: m ? 0 : Math.min(1, x.car.boost / O.boostDuration),
        hints: x.ui.hintsVisible && !m,
        respawnHint: !m && x.car.falling > 1.2 && (x.car.dirt || r.contact.height < 0),
        countdown: m ? null : A,
        ghostOn: x.ui.ghostEnabled,
        watching: m,
        canWatch: r.ghostPlayback.loaded,
        finished: x.run.phase === "finished",
        splitLabel: x.run.splitFlash > 0 ? tt(x.run.splitTime) : "",
        splitDelta: x.run.splitFlash > 0 && x.run.splitDelta !== null ? Ha(x.run.splitDelta) : "",
        splitSign: x.run.splitDelta === null ? 0 : x.run.splitDelta < 0 ? -1 : 1
      };
    }
  };
}
function Ul(e) {
  let {
      game: t,
      getState: r,
      race: n,
      chase: o,
      audio: a,
      scene: i,
      hud: l,
      menu: s,
      results: c
    } = e,
    u = {
      loadTrack(p, d = !0, h = !1) {
        e.beforeTransition?.(), n.load(p, h), i.build(n.def, n.path), n.setGround((g, b) => i.groundHeightAt(g, b)), i.setCheckpointsTaken(0), e.resetTrail(), e.applyCarPose(), o.snap(), d && u.enterRace();
      },
      startTrack(p) {
        a.click(), p !== r().ui.trackIndex ? u.loadTrack(p) : u.restartRun();
      },
      restartRun() {
        e.beforeTransition?.(), n.restart(), i.setCheckpointsTaken(0), e.resetTrail(), e.applyCarPose(), o.snap(), u.enterRace();
      },
      enterRace() {
        let p = r();
        p.ui.screen = "race", p.ui.watching = !1, i.car.group.visible = !0, o.setOrbit(!1), s.setVisible(!1), c.hide(), l.setVisible(!0);
      },
      openMenu() {
        e.beforeTransition?.();
        let p = r();
        p.ui.screen = "menu", p.ui.watching = !1, p.ui.menuIndex = p.ui.trackIndex, i.car.group.visible = !0, o.setOrbit(!0), l.setVisible(!1), c.hide(), s.setVisible(!0), u.refreshMenu();
      },
      refreshMenu() {
        let p = r();
        s.update(fe.map(d => {
          let h = pr(p.records, d.id);
          return {
            id: d.id,
            name: d.name,
            theme: d.theme,
            best: h.best === null ? "---" : tt(h.best),
            medal: h.medal,
            author: tt(d.author)
          };
        }), p.ui.menuIndex);
      },
      showResults(p, d) {
        let h = r(),
          g = pr(h.records, n.def.id),
          b = h.run.previousBest;
        c.show({
          trackKey: n.def.id,
          trackName: n.def.name,
          time: tt(p),
          best: tt(g.best),
          delta: b === null ? "" : Ha(p - b),
          isRecord: d,
          medal: h.run.medal,
          splits: h.run.splits.map(f => tt(f)),
          nextName: h.ui.trackIndex >= fe.length - 1 ? null : Oa(h.ui.trackIndex + 1).name
        }), u.refreshMenu();
      },
      toggleGhost() {
        let p = r();
        p.ui.ghostEnabled = !p.ui.ghostEnabled, p.ghost.active = p.ui.ghostEnabled && n.ghostPlayback.loaded, a.click(!0);
      },
      cycleCamera() {
        let p = r();
        p.ui.camera = p.ui.camera === "chase" ? "far" : p.ui.camera === "far" ? "hood" : "chase", o.setMode(p.ui.camera), a.click(!0);
      },
      toggleWatch() {
        e.beforeTransition?.();
        let p = r();
        if (p.ui.watching) return u.stopWatching();
        n.ghostPlayback.loaded && (p.ui.watching = !0, n.rewindWatch(), n.watch(1 / 60, e.watchCar, e.watchContact), e.applyWatchPose(), o.snap(), a.click(!0));
      },
      stopWatching() {
        let p = r();
        p.ui.watching && (p.ui.watching = !1, i.car.group.visible = !0, u.restartRun());
      }
    };
  return u;
}
function Gl(e, t, r, n, o, a) {
  let i = {
      throttle: 0,
      brake: 0,
      steer: 0,
      handbrake: !1,
      airPitch: 0,
      airRoll: 0
    },
    l = () => {
      i.throttle = 0, i.brake = 0, i.steer = 0, i.handbrake = !1, i.airPitch = 0, i.airRoll = 0;
    },
    s = c => {
      let u = e(),
        p = fe.length;
      u.ui.menuIndex = (u.ui.menuIndex + c + p) % p, o.click(!0), n.refreshMenu();
    };
  return {
    input: i,
    update() {
      let c = e();
      if (c.ui.screen === "menu") {
        t.pressed(...ae.menuUp) && s(-1), t.pressed(...ae.menuDown) && s(1), t.pressed(...ae.confirm) && n.startTrack(c.ui.menuIndex), l();
        return;
      }
      if (a()) {
        t.pressed(...ae.restart) ? n.restartRun() : t.pressed(...ae.next) ? n.loadTrack(c.ui.trackIndex + 1) : t.pressed(...ae.back) && n.openMenu(), l();
        return;
      }
      if (c.ui.watching) {
        t.pressed(...ae.back) ? (n.stopWatching(), n.openMenu()) : t.pressed(...ae.watch) || t.pressed(...ae.restart) || t.pressed(...ae.confirm) ? n.stopWatching() : t.pressed(...ae.camera) && n.cycleCamera(), l();
        return;
      }
      if (t.pressed(...ae.back)) {
        n.openMenu(), l();
        return;
      }
      if (t.pressed(...ae.restart) && n.restartRun(), t.pressed(...ae.respawn) && r.respawn(), t.pressed(...ae.next) && n.loadTrack(c.ui.trackIndex + 1), t.pressed(...ae.ghost) && n.toggleGhost(), t.pressed(...ae.camera) && n.cycleCamera(), t.pressed(...ae.watch) && n.toggleWatch(), c.ui.watching) {
        l();
        return;
      }
      let u = t.axis([...ae.left], [...ae.right]);
      i.throttle = t.held(...ae.accelerate) ? 1 : 0, i.brake = t.held(...ae.brake) ? 1 : 0, i.steer = u, i.handbrake = t.held(...ae.drift), i.airPitch = t.axis([...ae.accelerate], [...ae.brake]), i.airRoll = u, (i.throttle || i.brake || i.steer || i.handbrake) && (c.ui.hintsVisible = !1);
    }
  };
}
var $l = {
    audio: {
      engine: "./_remote/3d14a6fb92598a63/engine-cPdP.wav",
      tyres: "./_remote/905f03a7cd3bbe50/tyres-LPF6.wav",
      wind: "./_remote/50ade3f45f575b51/wind-TNJo.wav",
      boost: "./_remote/9b469ec680818702/boost-wXmm.wav",
      checkpoint: "./_remote/b4bb5fa074102438/checkpoint-Y4Np.wav",
      countdown: "./_remote/bd2cc1e5b4a2cc5c/countdown-tFoV.wav",
      go: "./_remote/ea6ca0e46a81bbde/go-Swaf.wav",
      crash: "./_remote/f30562fd545b8c62/crash-IcGi.wav",
      land: "./_remote/f0645ad87f6311f2/land-7eg1.wav",
      respawn: "./_remote/22db12d149d29238/respawn-athG.wav",
      finish: "./_remote/c3b1cc616915c6ab/finish-2l3c.wav",
      record: "./_remote/2a5e1783f9e19e53/record-ks3b.wav",
      click: "./_remote/ccbcc79a143eba34/click-WY9H.wav",
      select: "./_remote/67c52ed877870c27/select-RhIA.wav"
    }
  },
  jl = 0.2,
  Yl = 0.25,
  Kl = 0.4,
  Wr = 0.25,
  Br = 4,
  to = 0.55,
  _l = 2.6,
  Ta = 0.15,
  ro = 20,
  Zl = 45;
function ar(e, t, r) {
  return e > t ? e < r ? e : r : t;
}
function At(e) {
  return e > 0 ? e < 1 ? e : 1 : 0;
}
function Jl() {
  let e = null,
    t = !1,
    r = 0,
    n = 0,
    o = 0,
    a = 2654435761;
  function i() {
    return a = a * 1664525 + 1013904223 >>> 0, a / 2147483648 - 1;
  }
  function l(u, p, d) {
    let h = e;
    if (!(h === null || p <= 5e-4)) try {
      h.audio.playSfx(u, {
        volume: p,
        rate: ar(d, Wr, Br)
      });
    } catch {}
  }
  function s(u, p, d, h) {
    let g = p / d - h;
    if (!(g > 0)) return h;
    let b = u + g;
    return b > 0 ? b : g;
  }
  function c(u, p, d) {
    e = u;
    let h = ar(p, 1 / 240, 1 / 30);
    if (!u.running || !d.racing) {
      r = 0, n = 0, o = 0;
      return;
    }
    let g = At(d.rpm),
      b = At(d.throttle),
      f = At(d.drift),
      y = d.speed > 0 ? d.speed : 0;
    if (r -= h, r <= 0) {
      let v = to + (_l - to) * g,
        w = ar(v * (1 + i() * 0.015), Wr, Br),
        k = (0.15 + 0.3 * g) * (0.42 + 0.58 * b);
      d.grounded || (k *= 0.7), d.boost > 0 && (k *= 1.22), l("engine", k, w), r = s(r, jl, w, h);
    }
    if (f > Ta && d.grounded && y > 6) {
      if (n -= h, n <= 0) {
        let v = (f - Ta) / (1 - Ta),
          w = ar(0.92 + 0.4 * v + i() * 0.02, Wr, Br),
          k = (0.06 + 0.3 * v * v) * At(y / 34);
        l("tyres", k, w), n = s(n, Yl, w, h);
      }
    } else n = 0;
    if (y > ro) {
      if (o -= h, o <= 0) {
        let v = At((y - ro) / Zl),
          w = ar(0.8 + 0.55 * v, Wr, Br);
        l("wind", 0.04 + 0.2 * v * v, w), o = s(o, Kl, w, h);
      }
    } else o = 0;
  }
  return {
    unlock(u) {
      t || (t = !0, Promise.resolve(u.audio.unlock()).catch(() => {
        t = !1;
      }));
    },
    update: c,
    countdownBeep(u) {
      u ? l("go", 0.62, 1) : l("countdown", 0.45, 1 + i() * 0.02);
    },
    checkpoint() {
      l("checkpoint", 0.5, 1 + i() * 0.03);
    },
    boostPad() {
      l("boost", 0.55, 1 + i() * 0.04);
    },
    land(u) {
      let p = At(u);
      l("land", 0.12 + 0.45 * p, 1.14 - 0.3 * p + i() * 0.03);
    },
    crash(u) {
      let p = At(u);
      l("crash", 0.28 + 0.5 * p, 1.06 - 0.2 * p + i() * 0.04);
    },
    respawn() {
      l("respawn", 0.26, 1 + i() * 0.02);
    },
    finish(u) {
      r = 0, n = 0, o = 0, l(u ? "record" : "finish", u ? 0.62 : 0.55, 1);
    },
    click(u) {
      u === !0 ? l("select", 0.34, 1 + i() * 0.02) : l("click", 0.3, 1 + i() * 0.03);
    },
    reset() {
      r = 0, n = 0, o = 0;
    }
  };
}
var Xl = `
/* --- track tab (top-left) ----------------------------------------------- */
.prv-tab { display: flex; flex-direction: column; gap: 0.12em; padding: 0.4em 0.75em 0.44em; }
.prv-tab-name { font-size: 0.92em; letter-spacing: 0.05em; }
.prv-tab-record { font-size: 0.62em; color: var(--prv-muted); letter-spacing: 0.08em; }

/* --- timer (bottom) ----------------------------------------------------- */
.prv-timer {
  /* display, not just direction: this panel is not a .prv element, so it does
     not inherit the namespace's flex box and would stack its three columns. */
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 1.15em;
  padding: 0.45em 1.05em 0.55em;
}
.prv-tcol { display: flex; flex-direction: column; align-items: center; gap: 0.2em; min-width: 5.4em; }
.prv-tcol .prv-num { font-size: 1em; }
.prv-tcol-main .prv-num { font-size: 1.75em; line-height: 1.05; }
.prv-diff[data-sign='-1'] { color: var(--prv-good); }
.prv-diff[data-sign='1'] { color: var(--prv-bad); }
.prv-diff[data-sign='0'] { color: var(--prv-muted); }

/* --- checkpoints (bottom-left) ------------------------------------------ */
.prv-cp { flex-direction: row; align-items: center; gap: 0.45em; padding: 0.42em 0.72em; }
.prv-cp .prv-glyph { font-size: 1.1em; }
.prv-cp .prv-num { font-size: 1.05em; }

/* --- speedometer (bottom-right) ----------------------------------------- */
/* The km/h number is the readout; gear and boost are trim around it, so the
   numeral is roughly four times the height of everything sharing the panel. */
.prv-speedo { align-items: flex-end; gap: 0.18em; padding: 0.36em 0.8em 0.46em; min-width: 7.2em; }
.prv-speed-row { display: flex; flex-direction: row; align-items: baseline; gap: 0.28em; }
.prv-speed-num { font-size: 3.2em; line-height: 0.88; letter-spacing: -0.01em; }
.prv-speed-unit { font-size: 0.6em; color: var(--prv-muted); text-transform: uppercase; letter-spacing: 0.14em; }
.prv-gear-row { display: flex; flex-direction: row; align-items: center; gap: 0.34em; }
.prv-gear-row .prv-label { font-size: 0.56em; }
.prv-gear { font-size: 0.72em; color: var(--prv-accent); }
.prv-boost {
  width: 100%;
  height: calc(6px * var(--prv-scale));
  background: var(--prv-panel-deep);
  border: calc(1px * var(--prv-scale)) solid var(--prv-border);
  border-radius: calc(3px * var(--prv-scale));
  overflow: hidden;
}
.prv-boost-fill {
  width: 0%;
  height: 100%;
  background: linear-gradient(90deg, var(--prv-accent), #fff0b8);
  transition: width 90ms linear;
}

/* --- key-cap ------------------------------------------------------------ */
/* Amber glyph, deep navy fill, one hairline of the lighter border colour. */
.prv-cap {
  font-style: normal;
  font-size: 0.86em;
  color: var(--prv-accent);
  background: var(--prv-panel-deep);
  border: calc(1px * var(--prv-scale)) solid var(--prv-border);
  border-radius: calc(3px * var(--prv-scale));
  padding: 0.1em 0.4em 0.14em;
  white-space: nowrap;
}

/* --- bottom stack: split flash, hint strip, then the timer --------------- */
/* All three live in one column inside the 'bottom' anchor, so the hints read as
   the top edge of the HUD rather than a banner laid across the road. */
/* Out of the SDK's grid, for the same reason the countdown is: the middle
   column sits between a wide left stack (Exit / Restart / Next Track) and a
   narrow right one (the chips), so anything centred in it lands ~87 design
   units right of the frame's centre. Anchored on the safe-area variables the
   SDK publishes on .rx-hud, which is this element's containing block, so it
   still respects an inset if a host ever reports one. */
.prv-race-bottom {
  position: absolute;
  left: var(--rx-safe-left, 0px);
  right: var(--rx-safe-right, 0px);
  bottom: calc(var(--rx-safe-bottom, 0px) + 12px * var(--prv-scale));
  align-items: center;
  gap: 0.4em;
}
.prv-split {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 0.6em;
  padding: 0.3em 0.9em 0.34em;
  border-color: var(--prv-border-hi);
}
.prv-split-time { font-size: 1.15em; color: var(--prv-accent); }
.prv-split-delta[data-sign='-1'] { color: var(--prv-good); }
.prv-split-delta[data-sign='1'] { color: var(--prv-bad); }
.prv-split-delta[data-sign='0'] { color: var(--prv-muted); }
.prv-hints {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.3em 0.5em;
  font-size: 0.66em;
  padding: 0.42em 0.9em 0.46em;
  max-width: calc(880px * var(--prv-scale));
}
.prv-hint-word { color: var(--prv-muted); margin-right: 0.5em; }
.prv-hints .prv-hint-word:last-child { margin-right: 0; }

/* --- countdown ---------------------------------------------------------- */
/* Centred in the 'center' grid row, which is its own band between the top and
   bottom anchors, so the numeral never covers the split timer. */
.prv-center { align-items: center; gap: 0; }
/* Amber measures 1.20:1 against the pale horizon band and 1.45:1 against a
   white kerb, so the numeral cannot rely on its own colour: it carries a hard
   dark rim on all eight sides (the old shadow fell downwards only, leaving the
   top of every glyph bare against the sky), and the rim reads 14.8:1 on that
   same horizon. The offset blur underneath is the drop that lifts it off the
   road. Both are static declarations \u2014 nothing here costs a frame. */
.prv-count {
  /* Out of flow and centred on the whole frame, not on the SDK's middle grid
     column: that column sits between a wide left stack and a narrow right one,
     so a numeral centred in it lands visibly right of the road. Same containing
     block as the respawn prompt below. */
  position: absolute;
  top: 24%;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 8.5em;
  line-height: 0.95;
  color: var(--prv-accent);
  --prv-rim: calc(2px * var(--prv-scale));
  --prv-rim-neg: calc(-2px * var(--prv-scale));
  --prv-ink: rgba(4, 8, 24, 0.95);
  text-shadow:
    var(--prv-rim) 0 0 var(--prv-ink), var(--prv-rim-neg) 0 0 var(--prv-ink),
    0 var(--prv-rim) 0 var(--prv-ink), 0 var(--prv-rim-neg) 0 var(--prv-ink),
    var(--prv-rim) var(--prv-rim) 0 var(--prv-ink),
    var(--prv-rim-neg) var(--prv-rim) 0 var(--prv-ink),
    var(--prv-rim) var(--prv-rim-neg) 0 var(--prv-ink),
    var(--prv-rim-neg) var(--prv-rim-neg) 0 var(--prv-ink),
    0 calc(8px * var(--prv-scale)) calc(22px * var(--prv-scale)) rgba(0, 0, 0, 0.55);
}

/* --- respawn prompt ----------------------------------------------------- */
/* Out of flow, so it neither shifts the countdown nor reserves centre-screen
   space while hidden. The containing block is the SDK's .rx-hud padding box \u2014
   that box IS the safe rect, so top:22% is 22% down the safe area and it
   re-resolves on every resize with nothing cached anywhere. */
.prv-respawn {
  position: absolute;
  top: 22%;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4em;
  text-align: center;
  /* Same problem, smaller type: near-white measures 1.16:1 on the horizon and
     1.05:1 on a white kerb, so one hairline of rim goes round every glyph
     before the soft drop. Inherited by both lines and by their key-caps. */
  --prv-rim: calc(1px * var(--prv-scale));
  --prv-rim-neg: calc(-1px * var(--prv-scale));
  --prv-ink: rgba(4, 8, 24, 0.92);
  text-shadow:
    var(--prv-rim) 0 0 var(--prv-ink), var(--prv-rim-neg) 0 0 var(--prv-ink),
    0 var(--prv-rim) 0 var(--prv-ink), 0 var(--prv-rim-neg) 0 var(--prv-ink),
    0 calc(2px * var(--prv-scale)) calc(8px * var(--prv-scale)) rgba(4, 8, 24, 0.85);
}
.prv-respawn-main { font-size: 0.95em; }
.prv-respawn-sub { font-size: 0.76em; color: var(--prv-muted); }
.prv-respawn-sub .prv-cap { opacity: 0.85; }`,
  ed = {
    "--prv-panel": "rgba(23, 34, 84, 0.92)",
    "--prv-panel-hi": "rgba(46, 66, 152, 0.95)",
    "--prv-panel-deep": "#10173a",
    "--prv-border": "#3f5bb5",
    "--prv-border-hi": "#7f97e4",
    "--prv-text": "#e8eeff",
    "--prv-muted": "#8fa3d9",
    "--prv-accent": "#ffc22e",
    "--prv-good": "#6ee08a",
    "--prv-bad": "#ff6b6b",
    "--prv-shadow": "rgba(4, 8, 24, 0.45)",
    "--prv-font": "'Outfit', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    "--prv-mono": "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"
  },
  ao = "prv-style",
  td = Object.entries(ed).map(([e, t]) => `  ${e}: ${t};`).join(`
`),
  Ea = "calc(var(--rx-hud-scale, 1.8321) * 393 / 720)",
  rd = `
/* The palette is published at the document root, so any surface can read it
   with var() without needing a .prv ancestor. --rx-hud-scale itself only
   exists on .rx-hud, so --prv-scale is declared there too \u2014 a prv- class put
   straight onto an SDK layer (which is not a .prv) still measures correctly. */
:root {
${td}
  --prv-scale: ${Ea};
}
.rx-hud { --prv-scale: ${Ea}; }

.prv {
  --prv-scale: ${Ea};
  font-family: var(--prv-font);
  font-style: italic;
  font-weight: 700;
  font-size: calc(17px * var(--prv-scale));
  letter-spacing: 0.04em;
  line-height: 1.12;
  color: var(--prv-text);
  display: flex;
  flex-direction: column;
  gap: 0.42em;
  pointer-events: none;
}
.prv-hidden { display: none !important; }

/* --- panels ------------------------------------------------------------- */
.prv-panel {
  background: var(--prv-panel);
  border: calc(2px * var(--prv-scale)) solid var(--prv-border);
  border-radius: calc(4px * var(--prv-scale));
  padding: 0.42em 0.72em;
  box-shadow: 0 calc(2px * var(--prv-scale)) calc(10px * var(--prv-scale)) var(--prv-shadow);
}
.prv-inset {
  background: var(--prv-panel-deep);
  border: calc(2px * var(--prv-scale)) solid var(--prv-border);
  border-radius: calc(4px * var(--prv-scale));
  padding: 0.1em 0.5em 0.14em;
}
.prv-row { display: flex; flex-direction: row; align-items: stretch; gap: 0.34em; }

/* --- type --------------------------------------------------------------- */
.prv-label {
  font-size: 0.62em;
  color: var(--prv-muted);
  text-transform: uppercase;
  letter-spacing: 0.14em;
}
.prv-num {
  font-family: var(--prv-mono);
  font-variant-numeric: tabular-nums;
  font-style: italic;
  font-weight: 700;
  letter-spacing: 0.01em;
}
.prv-glyph { font-style: normal; color: var(--prv-accent); line-height: 1; }

/* --- buttons ------------------------------------------------------------ */
.prv-btn {
  font: inherit;
  font-size: 0.8em;
  font-style: italic;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--prv-text);
  background: var(--prv-panel);
  border: calc(2px * var(--prv-scale)) solid var(--prv-border);
  border-radius: calc(4px * var(--prv-scale));
  padding: 0.46em 0.8em;
  display: inline-flex;
  align-items: center;
  gap: 0.42em;
  cursor: pointer;
  pointer-events: auto;
  touch-action: manipulation;
  transition: background 120ms ease-out, border-color 120ms ease-out;
}
.prv-btn:hover { background: var(--prv-panel-hi); border-color: var(--prv-border-hi); }
.prv-btn:active { background: var(--prv-panel-hi); border-color: var(--prv-accent); }
.prv-btn:focus { outline: none; }
.prv-btn-label { line-height: 1; white-space: nowrap; }
.prv-btn[data-disabled='true'] { opacity: 0.45; cursor: default; pointer-events: none; }
.prv-chip { font-size: 0.72em; padding: 0.4em 0.7em; }
.prv-chip[data-on='false'] .prv-glyph { color: var(--prv-muted); }

${Xl}
`;
function on() {
  if (typeof document > "u" || document.getElementById(ao)) return;
  let e = document.createElement("style");
  e.id = ao, e.textContent = rd, document.head.append(e);
}
function me(e, t) {
  let r = document.createElement("div");
  return r.className = e, t?.append(r), r;
}
function be(e, t, r = "") {
  let n = document.createElement("span");
  return n.className = e, n.textContent = r, t?.append(n), n;
}
var nr = e => be("prv-cap", null, e);
function qa(e, t, r = !1) {
  let n = me(r ? "prv-tcol prv-tcol-main" : "prv-tcol", e);
  return be("prv-label", n, t), n;
}
function Jr(e, t, r) {
  let n = document.createElement("button");
  n.type = "button", n.className = "prv-btn", be("prv-glyph", n, e);
  let o = be("prv-btn-label", n, t);
  return n.addEventListener("pointerdown", a => a.preventDefault()), n.addEventListener("pointerup", a => {
    a.preventDefault(), a.stopPropagation(), r();
  }), {
    el: n,
    text: o
  };
}
function no(e, t, r, n) {
  let o = Jr(t, r, n);
  return o.el.classList.add("prv-chip"), o.el.dataset.on = "false", e.append(o.el), o;
}
var ad = [["W / Up", "accelerate"], ["S / Down", "brake"], ["A D / Left Right", "steer"], ["Space", "drift"], ["R", "respawn"], ["T", "restart"]];
function nd(e, t) {
  on();
  function r(P, W) {
    return me(W, e.hud.layer(P));
  }
  let n = r("top-left", "prv"),
    o = me("prv-row", n);
  o.append(Jr("\u23CF", "Exit", t.onExit).el), o.append(Jr("\u27F3", "Restart", t.onRestart).el), o.append(Jr("\xBB", "Next Track", t.onNextTrack).el);
  let a = me("prv-panel prv-tab", n),
    i = me("prv-tab-name", a),
    l = me("prv-tab-record", a),
    s = r("top-right", "prv"),
    c = !0,
    u = no(s, "\u25CC", "Ghost: On", () => {
      c = !c, p(), t.onToggleGhost();
    });
  function p() {
    u.el.dataset.on = c ? "true" : "false", u.text.textContent = c ? "Ghost: On" : "Ghost: Off";
  }
  p();
  let d = no(s, "\u25B6", "Watch Ghost", t.onWatch);
  d.el.dataset.disabled = "true";
  let h = r("bottom", "prv prv-race-bottom"),
    g = me("prv-panel prv-split prv-hidden", h),
    b = be("prv-num prv-split-time", g),
    f = be("prv-num prv-split-delta", g);
  f.dataset.sign = "0";
  let y = me("prv-panel prv-hints prv-hidden", h);
  for (let [P, W] of ad) y.append(nr(P), be("prv-hint-word", null, W));
  let v = me("prv-panel prv-timer", h),
    w = be("prv-num", qa(v, "Record"), "--:--.---"),
    k = be("prv-num", me("prv-inset", qa(v, "Current", !0)), "00:00.000"),
    x = be("prv-num prv-diff", qa(v, "Difference"), "---");
  x.dataset.sign = "0";
  let m = r("bottom-left", "prv prv-panel prv-cp");
  be("prv-glyph", m, "\u2691");
  let M = be("prv-num", m, "0/0"),
    S = r("bottom-right", "prv prv-panel prv-speedo"),
    I = me("prv-speed-row", S),
    A = be("prv-num prv-speed-num", I, "0");
  be("prv-speed-unit", I, "km/h");
  let q = me("prv-gear-row", S);
  be("prv-label", q, "Gear");
  let E = be("prv-num prv-gear", q, "1"),
    z = me("prv-boost-fill", me("prv-boost", S)),
    T = r("center", "prv prv-center"),
    F = me("prv-num prv-count prv-hidden", T),
    L = me("prv-respawn prv-hidden", T);
  me("prv-respawn-main", L).append("Press ", nr("R"), " / ", nr("Enter"), " to return to the last checkpoint"), me("prv-respawn-sub", L).append("Press ", nr("T"), " / ", nr("Backspace"), " to start over");
  let V = [n, s, h, m, S, T],
    C = new Map(),
    D = new Map(),
    R = {
      sign: 0,
      speed: 0,
      gear: 1,
      boost: 0,
      visible: !0,
      count: null,
      splitSign: 0,
      watching: !1,
      canWatch: !1,
      finished: !1
    };
  function H(P, W) {
    C.get(P) !== W && (C.set(P, W), P.textContent = W);
  }
  function Q(P, W) {
    D.get(P) !== W && (D.set(P, W), P.classList.toggle("prv-hidden", !W));
  }
  function N(P) {
    H(i, P.trackName), H(l, P.recordLabel), H(w, P.recordLabel), H(k, P.currentLabel), H(x, P.diffLabel), H(M, P.checkpoints), P.diffSign !== R.sign && (x.dataset.sign = String(R.sign = P.diffSign));
    let W = P.speed > 0 ? Math.round(P.speed) : 0,
      U = P.boost > 0 ? Math.round(Math.min(P.boost, 1) * 200) / 2 : 0;
    W !== R.speed && (A.textContent = String(R.speed = W)), P.gear !== R.gear && (E.textContent = String(R.gear = P.gear)), U !== R.boost && (z.style.width = `${R.boost = U}%`), Q(y, P.hints), Q(L, P.respawnHint);
    let K = P.countdown,
      Ae = K !== null && Number.isFinite(K) ? Math.max(0, Math.ceil(K)) : null;
    Ae !== R.count && (R.count = Ae, F.textContent = Ae === null ? "" : Ae <= 0 ? "GO" : String(Ae), Q(F, Ae !== null)), P.ghostOn !== void 0 && P.ghostOn !== c && (c = P.ghostOn, p());
    let De = P.watching === !0,
      Ie = P.finished === !0;
    Ie !== R.finished && (R.finished = Ie, u.el.dataset.disabled = Ie ? "true" : "false");
    let er = P.canWatch !== !1 && !Ie;
    er !== R.canWatch && (d.el.dataset.disabled = (R.canWatch = er) ? "false" : "true"), De !== R.watching && (R.watching = De, d.text.textContent = De ? "Stop Watching" : "Watch Ghost", d.el.dataset.on = De ? "true" : "false");
    let nt = P.splitLabel ?? "";
    H(b, nt), H(f, P.splitDelta ?? ""), Q(g, nt !== "");
    let Mt = P.splitSign ?? 0;
    Mt !== R.splitSign && (f.dataset.sign = String(R.splitSign = Mt));
  }
  return {
    update: N,
    setVisible(P) {
      if (P !== R.visible) {
        R.visible = P;
        for (let W of V) Q(W, P);
      }
    },
    destroy() {
      for (let P of V) P.remove();
      C.clear(), D.clear();
    }
  };
}
var od = `
/* The title sits over the live track, not over a flat panel, so every line
   carries its own rim: white on a pale sky and amber on a yellow gantry both
   measure under 1.5:1 without one. */
.prv-menu-title {
  align-items: center;
  /* Wider than it was: the amber second line used to space the tagline off the
     title, and without it 0.06em reads as cramped. */
  gap: 0.34em;
  text-align: center;
  --prv-rim: calc(1px * var(--prv-scale));
  --prv-rim-neg: calc(-1px * var(--prv-scale));
  --prv-ink: rgba(6, 10, 28, 0.94);
  text-shadow:
    var(--prv-rim) 0 0 var(--prv-ink), var(--prv-rim-neg) 0 0 var(--prv-ink),
    0 var(--prv-rim) 0 var(--prv-ink), 0 var(--prv-rim-neg) 0 var(--prv-ink),
    0 calc(3px * var(--prv-scale)) calc(12px * var(--prv-scale)) rgba(4, 8, 24, 0.8);
}
.prv-menu-word { font-size: 3.4em; font-weight: 800; line-height: 0.94; letter-spacing: -0.01em; }
.prv-menu-tag { font-size: 0.76em; color: var(--prv-muted); letter-spacing: 0.05em; }

/* --- the list, on a backdrop of its own ---------------------------------- */
/* Both halves of min(92%, 44em) are written in design units, because a % inside
   an SDK layer is circular: the layer is shrink-to-fit, so this element is what
   decides the width the % would resolve against. 1178 is 92% of the 1280-wide
   design box; 44em is 44 of this element's own type. The layer centres it, and
   max-width keeps it inside a narrower safe area. */
.prv-menu-center { box-sizing: border-box; width: min(calc(1178px * var(--prv-scale)), 44em); max-width: 100%; min-height: 0; align-items: stretch; }
/* The backdrop the rows sit on, so the hillside behind stops reading through
   the text: navy at 88%, a 2px --prv-border edge, one radius around the lot. */
.prv-menu-panel { box-sizing: border-box; display: flex; flex-direction: column; gap: 0.32em; width: 100%; min-height: 0; padding: 0.5em 0.55em 0.6em; background: rgba(17, 25, 66, 0.88); border: calc(2px * var(--prv-scale)) solid var(--prv-border); border-radius: calc(8px * var(--prv-scale)); box-shadow: 0 calc(5px * var(--prv-scale)) calc(22px * var(--prv-scale)) var(--prv-shadow); pointer-events: auto; }
/* The right padding is the row's own right padding plus the medal pip and its
   gap, so 'Personal best' sits over the best column instead of over the pips. */
.prv-menu-head { display: flex; flex-direction: row; align-items: baseline; justify-content: space-between; gap: 1em; padding: 0 2em 0.3em 0.6em; border-bottom: calc(1px * var(--prv-scale)) solid rgba(63, 91, 181, 0.55); }
.prv-menu-list { display: flex; flex-direction: column; gap: calc(4px * var(--prv-scale)); width: 100%; min-height: 0; flex: 0 1 auto; max-height: calc(392px * var(--prv-scale)); overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; pointer-events: auto; }

/* --- one row ------------------------------------------------------------- */
.prv-menu-row { font: inherit; color: var(--prv-text); display: flex; align-items: center; gap: 0.66em; width: 100%; box-sizing: border-box; min-height: 3.2em; text-align: left; padding: 0.3em 0.6em; cursor: pointer; pointer-events: auto; background: rgba(10, 16, 45, 0.55); border: calc(2px * var(--prv-scale)) solid transparent; border-radius: calc(5px * var(--prv-scale)); transition: background 120ms ease-out, border-color 120ms ease-out, box-shadow 120ms ease-out; }
.prv-menu-row:hover { background: var(--prv-panel-hi); }
.prv-menu-row:focus { outline: none; } .prv-menu-row:focus-visible { border-color: var(--prv-border-hi); }
.prv-menu-row[data-selected='true'] { background: var(--prv-panel-hi); border-color: var(--prv-border-hi); box-shadow: inset calc(5px * var(--prv-scale)) 0 0 var(--prv-accent); }
/* One flat square of the theme's ground, ringed in its sky. Both colours are
   written from THEMES by the menu, so a new theme needs no rule here. */
.prv-menu-swatch { flex: none; width: 1.5em; height: 1.5em; border-radius: calc(4px * var(--prv-scale)); border: calc(2px * var(--prv-scale)) solid var(--prv-panel-deep); }
.prv-menu-main { display: flex; flex-direction: column; gap: 0.04em; min-width: 0; flex: 1 1 auto; }
.prv-menu-name { font-size: 1.02em; font-weight: 800; font-style: italic; line-height: 1.14; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.prv-menu-author { font-size: 0.62em; color: var(--prv-muted); letter-spacing: 0.11em; text-transform: uppercase; white-space: nowrap; }
.prv-menu-best { flex: none; font-size: 0.92em; font-variant-numeric: tabular-nums; min-width: 6.4em; padding-right: 0.14em; text-align: right; white-space: nowrap; }
.prv-menu-row[data-best='none'] .prv-menu-best { color: var(--prv-muted); }
/* The medal pip: white diamond for the author time, a coloured disc for a
   medal, a hollow ring for none. The results panel declares its own copy, so
   neither surface depends on the other having been built. */
.prv-pip { flex: none; width: 0.78em; height: 0.78em; border-radius: 50%; box-shadow: inset 0 0 0 calc(1px * var(--prv-scale)) rgba(6, 10, 26, 0.5); }
.prv-pip[data-medal='none'] { background: none; box-shadow: inset 0 0 0 calc(2px * var(--prv-scale)) var(--prv-muted); }
.prv-pip[data-medal='bronze'] { background: #cd7f45; } .prv-pip[data-medal='silver'] { background: #d4dcea; } .prv-pip[data-medal='gold'] { background: #ffcf3a; }
.prv-pip[data-medal='author'] { background: #ffffff; border-radius: 0; transform: rotate(45deg) scale(0.84); }

/* --- the session bar ----------------------------------------------------- */
.prv-menu-bottom { margin-block-end: 1.8em; box-sizing: border-box; width: min(calc(1178px * var(--prv-scale)), 44em); max-width: 100%; }
.prv-menu-bar { display: flex; flex-direction: row; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5em 1em; width: 100%; }
/* The hint strip sits on the live track with no panel behind it, where muted
   periwinkle measures 1.6-1.9:1 against grass, asphalt and the pale horizon
   alike. The rim is what makes it legible on all three. */
.prv-menu-hint {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.34em;
  flex-wrap: wrap;
  flex: 1 1 auto;
  min-width: 0;
  font-size: 0.7em;
  color: var(--prv-muted);
  letter-spacing: 0.06em;
  --prv-rim: calc(1px * var(--prv-scale));
  --prv-rim-neg: calc(-1px * var(--prv-scale));
  --prv-ink: rgba(6, 10, 28, 0.95);
  text-shadow:
    var(--prv-rim) 0 0 var(--prv-ink), var(--prv-rim-neg) 0 0 var(--prv-ink),
    0 var(--prv-rim) 0 var(--prv-ink), 0 var(--prv-rim-neg) 0 var(--prv-ink),
    0 calc(2px * var(--prv-scale)) calc(7px * var(--prv-scale)) rgba(4, 8, 24, 0.85);
}
/* The menu's own key-cap, matching the race HUD's without depending on it. */
.prv-key { font-style: normal; font-size: 0.9em; color: var(--prv-accent); background: var(--prv-panel-deep); border: calc(1px * var(--prv-scale)) solid var(--prv-border); border-radius: calc(3px * var(--prv-scale)); padding: 0.12em 0.42em 0.16em; margin-left: 0.55em; white-space: nowrap; }
.prv-menu-hint .prv-key:first-child { margin-left: 0; }
/* Keep the corner control from widening the SDK grid's right column. */
.prv-menu-volume-anchor { width:0; min-width:0; }
.prv-menu-volume { display:flex; width:max-content; align-items:center; align-self:flex-end; gap:0.65em; padding:0.35em 0.65em; margin-bottom:0.5em; background:var(--prv-panel-deep); border:1px solid var(--prv-border); border-radius:4px; font-size:0.8em; pointer-events:auto; }
.prv-menu-volume input { width:9em; max-width:35vw; accent-color:var(--prv-accent); cursor:pointer; }
.prv-menu-volume input:focus-visible { outline:2px solid var(--prv-accent); outline-offset:3px; }
.prv-menu-volume output { min-width:4ch; text-align:right; font-variant-numeric:tabular-nums; }
.prv-menu-actions { display: flex; flex-direction: row; align-items: center; gap: 0.6em; flex: 0 0 auto; }
/* The session readout used to clip its amber numeral against the bar's edge. It
   now sits in an inset of its own with room on both sides, never wraps, never
   shrinks, and reserves four tabular digits \u2014 so the italic tail of the last
   glyph has somewhere to go and the number's width never changes mid-session. */
.prv-menu-score { display: flex; flex-direction: row; align-items: baseline; gap: 0.5em; flex: 0 0 auto; white-space: nowrap; overflow: visible; padding: 0.26em 0.8em 0.34em; }
.prv-menu-scorenum { font-size: 1.05em; line-height: 1.15; color: var(--prv-accent); font-variant-numeric: tabular-nums; min-width: 3.4ch; padding-right: 0.16em; text-align: right; }
`;
function id(e, t) {
  document.getElementById(e) || document.head.append(Object.assign(document.createElement("style"), {
    id: e,
    textContent: t
  }));
}
function Z(e, t, r, n) {
  let o = document.createElement(e);
  return o.className = t, n !== void 0 && (o.textContent = n), r.append(o), o;
}
var oo = e => "#" + (e >>> 0).toString(16).padStart(6, "0");
function sd(e, t) {
  let r = Ve[t] ?? Ve.summer;
  e.style.background = oo(r.groundMid), e.style.borderColor = oo(r.skyMid);
}
var ld = [["Up / Down", "select"], ["Enter", "race"], ["Esc", "back"]];
function dd(e, t) {
  on(), id("prv-menu-style", od);
  let r = Z("div", "prv prv-menu-title", e.hud.layer("top"));
  Z("div", "prv-menu-word", r, "POLYRACE"), Z("div", "prv-menu-tag", r, "Time trial: beat the clock and your ghost");
  let n = Z("div", "prv prv-menu-center", e.hud.layer("center")),
    o = Z("div", "prv-menu-panel", n),
    a = Z("div", "prv-menu-head", o);
  Z("span", "prv-label", a, "Select track"), Z("span", "prv-label", a, "Personal best");
  let i = Z("div", "prv-menu-list", o),
    l = Z("div", "prv prv-menu-bottom", e.hud.layer("bottom")),
    s = Z("div", "prv prv-menu-volume-anchor", e.hud.layer("top-right")),
    c = Z("label", "prv-menu-volume", s);
  Z("span", "", c, "Volume");
  let u = Z("input", "", c);
  u.type = "range", u.min = "0", u.max = "100", u.step = "1", u.setAttribute("aria-label", "Game volume");
  for (let T of ["pointerdown", "pointermove", "pointerup"]) u.addEventListener(T, F => F.stopPropagation());
  let p = Z("output", "", c),
    d = "polyrace/audio-volume/v1",
    h = e.audio.musicVolume,
    g = e.audio.sfxVolume,
    b = 100;
  try {
    let T = localStorage.getItem(d);
    T !== null && Number.isFinite(Number(T)) && (b = Math.max(0, Math.min(100, Math.round(Number(T)))));
  } catch {}
  let f = () => {
    let T = Number(u.value),
      F = T / 100;
    e.audio.musicVolume = h * F, e.audio.sfxVolume = g * F, p.textContent = T + "%", u.setAttribute("aria-valuetext", T === 0 ? "Muted" : T + " percent");
  };
  u.value = String(b), f(), u.oninput = () => {
    f();
    try {
      localStorage.setItem(d, u.value);
    } catch {}
  }, u.onchange = () => {
    e.audio.unlock().then(() => e.audio.playSfx("select", {
      volume: 0.34
    })).catch(() => {});
  };
  let y = Z("div", "prv-menu-bar", l),
    v = Z("div", "prv-menu-hint", y);
  for (let [T, F] of ld) Z("span", "prv-key", v, T), Z("span", "", v, F);
  let m = [r, n, l, s],
    M = [],
    S = -1,
    I = -1,
    A = null,
    q = T => {
      let F = T.target?.closest(".prv-menu-row");
      if (!F) return;
      let L = Number(F.dataset.index);
      !Number.isInteger(L) || L < 0 || L >= I || (t.onSelect(L), t.onPlay(L));
    },
    E = T => {
      T.target?.closest("button") && T.preventDefault();
    };
  i.addEventListener("click", q), i.addEventListener("pointerdown", E), l.addEventListener("pointerdown", E);
  function z(T) {
    let F = Z("button", "prv-menu-row", i);
    F.type = "button", F.dataset.index = String(T);
    let L = Z("span", "prv-menu-swatch", F),
      V = Z("div", "prv-menu-main", F),
      C = Z("span", "prv-menu-name", V),
      D = Z("span", "prv-menu-author", V),
      R = Z("span", "prv-num prv-menu-best", F),
      H = Z("span", "prv-pip", F);
    M.push({
      el: F,
      swatch: L,
      name: C,
      author: D,
      best: R,
      pip: H,
      theme: "",
      nameText: "",
      authorText: "",
      bestText: "",
      medal: ""
    });
  }
  return {
    update(T, F) {
      for (; M.length < T.length;) z(M.length);
      if (T.length !== I) {
        I = T.length;
        for (let V = 0; V < M.length; V++) M[V].el.classList.toggle("prv-hidden", V >= T.length);
      }
      for (let V = 0; V < T.length; V++) {
        let C = T[V],
          D = M[V],
          R = C.medal ?? "none";
        D.theme !== C.theme && (D.theme = C.theme, sd(D.swatch, C.theme)), D.nameText !== C.name && (D.nameText = C.name, D.name.textContent = C.name), D.authorText !== C.author && (D.authorText = C.author, D.author.textContent = `Author ${C.author}`), D.medal !== R && (D.medal = R, D.pip.dataset.medal = R), D.bestText !== C.best && (D.bestText = C.best, D.best.textContent = C.best, D.el.dataset.best = C.best === "---" ? "none" : "set");
      }
      let L = T.length ? Math.max(0, Math.min(T.length - 1, F)) : -1;
      L !== S && (S >= 0 && S < M.length && (M[S].el.dataset.selected = "false"), S = L, S >= 0 && (M[S].el.dataset.selected = "true", M[S].el.scrollIntoView({
        block: "nearest"
      })));
    },
    setVisible(T) {
      if (T !== A) {
        A = T;
        for (let F of m) F.classList.toggle("prv-hidden", !T);
      }
    },
    destroy() {
      i.removeEventListener("click", q), i.removeEventListener("pointerdown", E), l.removeEventListener("pointerdown", E);
      for (let T of m) T.remove();
      M.length = 0;
    }
  };
}
var pd = `
/* The container this file owns, and the only node show()/hide() toggles. It
   adds no looks of its own: the panel inside it is unchanged. */
/* Centred on the frame rather than on the SDK's middle grid column \u2014 see the
   note on .prv-race-bottom. Absolute against .rx-hud, inset by the safe-area
   variables it publishes. */
.prv-res-root {
  position: absolute;
  left: var(--rx-safe-left, 0px);
  right: var(--rx-safe-right, 0px);
  top: var(--rx-safe-top, 0px);
  bottom: var(--rx-safe-bottom, 0px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0;
  min-width: 0;
  padding: 0 calc(12px * var(--prv-scale));
  box-sizing: border-box;
  pointer-events: none;
}
/* Design units, never percentages: an SDK layer is shrink-to-fit, so a % width
   inside one is circular. 714 * --prv-scale is 42em of the panel's own type at
   every window size, and max-width keeps it inside the layer's safe padding.
   The body caps at 520 of the design box's 720 \u2014 panel and all, under 80%. */
/* A width, not a max-width, is what pushed the SDK's centre grid column wider
   than the frame and shoved the speedometer off the right edge: a grid item's
   automatic minimum is its min-content, and a fixed width IS its min-content.
   Sized from the column instead, the panel simply narrows when the side
   columns need the room. */
.prv-res { pointer-events: auto; align-items: center; gap: 0.5em; box-sizing: border-box; width: 100%; min-width: 0; max-width: calc(714px * var(--prv-scale)); min-height: 0; padding: 1.1em 1.4em; border-radius: calc(6px * var(--prv-scale)); opacity: 0; transform: translateY(calc(16px * var(--prv-scale))) scale(0.97); transition: opacity 200ms ease-out, transform 240ms cubic-bezier(0.16, 1, 0.3, 1); will-change: transform, opacity; }
.prv-res { flex-direction:row; align-items:stretch; max-width:calc(1080px * var(--prv-scale)); gap:1.5em; }
.prv-res-body { flex:1 1 55%; }
.prv-finish-board { flex:1 1 45%; min-width:0; max-height:calc(520px * var(--prv-scale)); overflow:auto; border-left:1px solid var(--prv-border); padding-left:1.2em; font-size:0.8em; }
.prv-finish-board-header { display:flex; align-items:center; justify-content:space-between; gap:0.7em; }
.prv-finish-board h3 { margin:0; letter-spacing:0.08em; }
.prv-finish-board-refresh { flex:none; font-size:1.4em; font-style:normal; line-height:1; padding:0.15em 0.35em; }
.prv-finish-board p:empty { display:none; }
.prv-finish-board h4 { margin:1em 0 0.4em; color:var(--prv-muted); }
.prv-finish-board p { color:var(--prv-muted); font-size:0.9em; }
.prv-finish-board-row { display:grid; grid-template-columns:2ch minmax(0,1fr) auto; gap:0.6em; padding:0.5em 0; border-bottom:1px solid var(--prv-border); font-variant-numeric:tabular-nums; }
.prv-finish-board-row span:nth-child(2) { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.prv-finish-board-row[data-self='true'] { color:var(--prv-accent); }
@media(max-width:760px) { .prv-res { flex-direction:column; max-height:85vh; overflow:auto; } .prv-res-body,.prv-finish-board { flex:none; } .prv-finish-board { border-left:0; border-top:1px solid var(--prv-border); padding:1em 0 0; width:100%; } }
.prv-res[data-shown='true'] { opacity: 1; transform: none; }
.prv-res-body { display: flex; flex-direction: column; align-items: center; gap: 0.42em; width: 100%; min-height: 0; flex: 1 1 auto; max-height: calc(520px * var(--prv-scale)); overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; }
.prv-res-head { font-size: 1.8em; font-weight: 800; line-height: 1; letter-spacing: 0.12em; text-indent: 0.12em; }
.prv-res-time { font-size: 3em; line-height: 1.02; letter-spacing: -0.01em; }
.prv-res-record { font-size: 0.88em; font-weight: 800; letter-spacing: 0.3em; text-indent: 0.3em; color: var(--prv-accent); animation: prv-res-flash 780ms ease-in-out infinite alternate; }
@keyframes prv-res-flash { from { opacity: 0.4; } to { opacity: 1; } }
.prv-res-medal { display: flex; flex-direction: row; align-items: center; gap: 0.5em; }
.prv-res-medal .prv-pip { width: 1.3em; height: 1.3em; } .prv-res-medalname { font-size: 0.8em; letter-spacing: 0.2em; }
.prv-res-splits { display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 0.34em; }
.prv-res-chip { display: flex; flex-direction: row; align-items: baseline; gap: 0.4em; font-size: 0.7em; padding: 0.24em 0.7em 0.3em; } .prv-res-chip .prv-label { font-size: 0.86em; }
.prv-res-line { font-size: 0.72em; color: var(--prv-muted); letter-spacing: 0.08em; text-align: center; }
.prv-res-delta { display: flex; flex-direction: row; align-items: baseline; gap: 0.5em; font-size: 0.78em; color: var(--prv-muted); letter-spacing: 0.08em; }
.prv-res-buttons { display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 0.42em; padding-top: 0.2em; }
.prv-res-buttons .prv-btn[data-variant='cta'] { background: var(--prv-accent); border-color: var(--prv-accent); color: var(--prv-panel-deep); }
.prv-res-buttons .prv-btn[data-variant='cta']:hover { background: #ffd76a; border-color: #ffd76a; }
/* The pip, declared identically here and in ui/hud-menu.ts so neither surface
   depends on the other having been built: white diamond for the author time, a
   coloured disc for a medal, a hollow ring for none. */
.prv-pip { flex: none; width: 0.78em; height: 0.78em; border-radius: 50%; box-shadow: inset 0 0 0 calc(1px * var(--prv-scale)) rgba(6, 10, 26, 0.5); }
.prv-pip[data-medal='none'] { background: none; box-shadow: inset 0 0 0 calc(2px * var(--prv-scale)) var(--prv-muted); }
.prv-pip[data-medal='bronze'] { background: #cd7f45; } .prv-pip[data-medal='silver'] { background: #d4dcea; } .prv-pip[data-medal='gold'] { background: #ffcf3a; }
.prv-pip[data-medal='author'] { background: #ffffff; border-radius: 0; transform: rotate(45deg) scale(0.84); }
`;
function ud(e, t) {
  document.getElementById(e) || document.head.append(Object.assign(document.createElement("style"), {
    id: e,
    textContent: t
  }));
}
function le(e, t, r, n) {
  let o = document.createElement(e);
  return o.className = t, n !== void 0 && (o.textContent = n), r.append(o), o;
}
function Fa(e, t, r, n) {
  let o = le("button", "prv-btn", r);
  o.type = "button", o.dataset.variant = t;
  let a = le("span", "prv-btn-label", o, e);
  return o.addEventListener("pointerdown", i => i.preventDefault()), o.addEventListener("click", n), {
    el: o,
    text: a
  };
}
var hd = {
    author: "AUTHOR",
    gold: "GOLD",
    silver: "SILVER",
    bronze: "BRONZE",
    none: "NO MEDAL"
  },
  md = [];
function fd(e, t) {
  on(), ud("prv-results-style", pd);
  let r = le("div", "prv-res-root prv-hidden", e.hud.layer("center")),
    n = le("div", "prv prv-panel prv-res", r),
    o = le("div", "prv-res-body", n);
  le("div", "prv-res-head", o, "FINISH");
  let i = le("div", "prv-label", o),
    l = le("div", "prv-num prv-res-time", o),
    s = le("div", "prv-res-record", o, "NEW RECORD"),
    c = le("div", "prv-res-medal", o),
    u = le("span", "prv-pip", c),
    p = le("span", "prv-res-medalname", c),
    d = le("div", "prv-res-splits prv-hidden", o),
    h = le("div", "prv-res-delta", o),
    g = le("span", "prv-num prv-diff", h);
  le("span", "", h, "vs previous best");
  let b = le("div", "prv-res-line", o),
    f = le("div", "prv-res-line", o),
    y = le("div", "prv-res-buttons", o);
  Fa("Retry (T)", "cta", y, () => t.onRetry());
  let v = Fa("Next Track", "plain", y, () => t.onNext()).el;
  Fa("Menu (Esc)", "plain", y, () => t.onMenu());
  let w = [],
    k = [],
    x = !1,
    m = 0,
    M = "\0",
    S = {
      track: M,
      time: M,
      record: null,
      medal: M,
      delta: M,
      best: M,
      next: M,
      splits: M
    };
  function I(A) {
    let q = A ?? md,
      E = q.join("|");
    if (E !== S.splits) {
      for (S.splits = E, d.classList.toggle("prv-hidden", q.length === 0); w.length < q.length;) {
        let z = le("div", "prv-inset prv-res-chip", d);
        le("span", "prv-label", z, `CP${w.length + 1}`), k.push(le("span", "prv-num", z)), w.push(z);
      }
      for (let z = 0; z < w.length; z++) w[z].classList.toggle("prv-hidden", z >= q.length), z < q.length && (k[z].textContent = q[z]);
    }
  }
  return {
    show(A) {
      S.track !== A.trackName && (S.track = A.trackName, i.textContent = A.trackName), S.time !== A.time && (S.time = A.time, l.textContent = A.time), S.record !== A.isRecord && (S.record = A.isRecord, s.classList.toggle("prv-hidden", !A.isRecord));
      let q = A.medal ?? "none";
      S.medal !== q && (S.medal = q, u.dataset.medal = q, p.textContent = hd[q] ?? "NO MEDAL"), S.delta !== A.delta && (S.delta = A.delta, h.classList.toggle("prv-hidden", A.delta === ""), g.textContent = A.delta, g.dataset.sign = A.delta.startsWith("-") ? "-1" : "1"), S.best !== A.best && (S.best = A.best, b.textContent = `BEST ${A.best}`);
      let E = A.nextName ?? "";
      S.next !== E && (S.next = E, f.textContent = E ? `UP NEXT \u2014 ${E}` : "FINAL TRACK", v.disabled = E === "", v.dataset.disabled = E === "" ? "true" : "false"), I(A.splits), !x && (A.trackKey && void 0, x = !0, r.classList.remove("prv-hidden"), cancelAnimationFrame(m), m = requestAnimationFrame(() => {
        m = requestAnimationFrame(() => {
          x && (n.dataset.shown = "true");
        });
      }));
    },
    hide() {
      void 0, x && (x = !1, cancelAnimationFrame(m), m = 0, n.dataset.shown = "false", r.classList.add("prv-hidden"));
    },
    get visible() {
      return x;
    },
    destroy() {
      void 0, cancelAnimationFrame(m), m = 0, x = !1, w.length = 0, k.length = 0, r.remove();
    }
  };
}
var Re = [{
    name: "Sprint Cup",
    tracks: [0, 1, 2]
  }, {
    name: "Stunt Cup",
    tracks: [3, 4, 6]
  }, {
    name: "Velocity Cup",
    tracks: [2, 5, 6]
  }],
  Qr = (e = 0) => ({
    pack: e,
    race: 0,
    awardedRound: -1,
    points: {}
  });
function Yo(e) {
  let t = e.championship;
  if (!(!t || e.phase !== "results" || t.awardedRound === e.round)) {
    t.awardedRound = e.round;
    for (let r of Object.values(t.points)) r.earned = 0;
    [...e.racers].sort((r, n) => (r.run.finishTime ?? 1 / 0) - (n.run.finishTime ?? 1 / 0) || r.id.localeCompare(n.id)).forEach((r, n) => {
      let o = r.run.finishTime === null ? 0 : [15, 12, 10, 8][n] ?? 0,
        a = Object.hasOwn(t.points, r.id) ? t.points[r.id] : void 0;
      t.points = Object.fromEntries([...Object.entries(t.points), [r.id, {
        name: r.name,
        total: (a?.total ?? 0) + o,
        earned: o
      }]]);
    });
  }
}
function gd(e) {
  if (!e || typeof e != "object") return null;
  let t = e;
  if (!Number.isInteger(t.pack) || !Re[t.pack] || !Number.isInteger(t.race) || t.race < 0 || t.race >= 3 || !Number.isSafeInteger(t.awardedRound) || !t.points || typeof t.points != "object") return null;
  let r = Object.entries(t.points);
  return r.length > 16 || r.some(([n, o]) => n.length > 200 || !o || typeof o.name != "string" || o.name.length > 80 || !Number.isInteger(o.total) || o.total < 0 || o.total > 45 || !Number.isInteger(o.earned) || o.earned < 0 || o.earned > 15) ? null : {
    ...t,
    points: Object.fromEntries(r.map(([n, o]) => [n, {
      ...o
    }]))
  };
}
var Jo = 0.15,
  vd = 0.1,
  bd = new Zo.Quaternion();
function wd(e, t, r, n, o, a) {
  e.length && t <= e[e.length - 1].time || (e.push({
    time: t,
    pos: {
      ...r
    },
    quat: {
      ...n
    },
    vel: {
      ...o
    },
    teleport: a
  }), e.length > 64 && e.splice(0, e.length - 64));
}
function xd(e, t, r, n) {
  if (!e.length) return !1;
  let o = e[0],
    a = o;
  for (let i = 1; i < e.length && (a = e[i], !(a.time >= t)); i++) o = a;
  if (r.set(o.pos.x, o.pos.y, o.pos.z), n.set(o.quat.x, o.quat.y, o.quat.z, o.quat.w).normalize(), t < o.time) return !0;
  if (o !== a && o.teleport === a.teleport) {
    let i = Math.max(0, Math.min(1, (t - o.time) / (a.time - o.time)));
    r.x += (a.pos.x - o.pos.x) * i, r.y += (a.pos.y - o.pos.y) * i, r.z += (a.pos.z - o.pos.z) * i, n.slerp(bd.set(a.quat.x, a.quat.y, a.quat.z, a.quat.w).normalize(), i);
  } else if (o === a) {
    let i = Math.min(vd, Math.max(0, t - o.time));
    r.x += o.vel.x * i, r.y += o.vel.y * i, r.z += o.vel.z * i;
  } else t >= a.time && (r.set(a.pos.x, a.pos.y, a.pos.z), n.set(a.quat.x, a.quat.y, a.quat.z, a.quat.w).normalize());
  return !0;
}
var yd = 0.1,
  io = new kt.Quaternion(),
  Se = new kt.Quaternion(),
  Fe = new kt.Quaternion(),
  kd = new kt.Quaternion(),
  We = new kt.Vector3(),
  Ur = new kt.Vector3();
function Xo(e, t) {
  let r = e,
    n = 0,
    o = 0;
  for (; r > 1e-8;) {
    let a = Math.min(0.008333333333333333, r);
    n += O.accel * Math.pow(Math.max(0, 1 - n / O.topSpeed), O.accelFalloff) * t * a, o += n * a, r -= a;
  }
  return o;
}
function so(e, t, r, n, o, a) {
  let i = e[e.length - 1];
  if (!i || !xd(e, Math.min(t, i.time), n, o)) return !1;
  let l = Math.min(r, Math.max(0, t - i.time));
  if (!l) return !0;
  if (a) {
    let c = Xo(Math.max(0, l - a.countdown), a.throttle);
    return We.set(0, 0, -1).applyQuaternion(o), n.addScaledVector(We, c), !0;
  }
  Ur.set(i.vel.x, i.vel.y, i.vel.z).clampLength(0, 100), n.addScaledVector(Ur, l);
  let s = e[e.length - 2];
  if (s && s.teleport === i.teleport && i.time - s.time > 0.001 && i.time - s.time < 0.3 && (We.set(i.vel.x - s.vel.x, i.vel.y - s.vel.y, i.vel.z - s.vel.z).divideScalar(i.time - s.time), We.length() < O.accel * 1.5 && We.dot(Ur) > 0 && n.addScaledVector(We, 0.5 * l * l)), s && s.teleport === i.teleport && i.time - s.time > 0.001 && i.time - s.time < 0.3 && Ur.lengthSq() > 0.01) {
    io.set(s.quat.x, s.quat.y, s.quat.z, s.quat.w).normalize(), Se.copy(io).invert().multiply(o).normalize(), Se.w < 0 && Se.set(-Se.x, -Se.y, -Se.z, -Se.w);
    let c = 2 * Math.acos(Math.max(-1, Math.min(1, Se.w)));
    We.set(Se.x, Se.y, Se.z), We.lengthSq() > 1e-10 && (We.normalize(), Se.setFromAxisAngle(We, Math.min(6, c / (i.time - s.time)) * l), o.multiply(Se).normalize());
  }
  return !0;
}
function Md(e, t, r) {
  e.error = {
    x: e.position.x - t.x,
    y: e.position.y - t.y,
    z: e.position.z - t.z
  }, Fe.set(e.quaternion.x, e.quaternion.y, e.quaternion.z, e.quaternion.w).multiply(Se.copy(r).invert()).normalize(), e.rotation = {
    x: Fe.x,
    y: Fe.y,
    z: Fe.z,
    w: Fe.w
  }, e.pending = !1;
}
function ei(e, t, r, n) {
  if (e) {
    let o = Math.exp(-Math.max(0, n) / 0.1);
    e.error.x *= o, e.error.y *= o, e.error.z *= o, t.x += e.error.x, t.y += e.error.y, t.z += e.error.z, Fe.set(e.rotation.x, e.rotation.y, e.rotation.z, e.rotation.w).slerp(kd, 1 - o), r.premultiply(Fe).normalize(), e.rotation = {
      x: Fe.x,
      y: Fe.y,
      z: Fe.z,
      w: Fe.w
    };
  } else e = {
    position: {
      x: 0,
      y: 0,
      z: 0
    },
    quaternion: {
      x: 0,
      y: 0,
      z: 0,
      w: 1
    },
    error: {
      x: 0,
      y: 0,
      z: 0
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 1
    },
    pending: !1
  };
  return e.position = {
    x: t.x,
    y: t.y,
    z: t.z
  }, e.quaternion = {
    x: r.x,
    y: r.y,
    z: r.z,
    w: r.w
  }, e;
}
var lo = new _o.Vector3(),
  co = 0.5;
function Sd(e) {
  e.gridLaunch = {
    position: {
      ...e.car.pos
    },
    quaternion: {
      ...e.car.quat
    },
    teleport: e.car.teleport,
    done: !1
  };
}
function zd(e, t) {
  let r = e.peerClocks[e.hostId],
    n = e.selfId === e.hostId ? 0 : r && t - r.received < 10 ? r.offset : null;
  if (e.startAt !== null && n !== null) return t + n - e.startAt;
  let o = e.racers.find(a => a.id === e.selfId);
  return o ? o.run.phase === "countdown" ? -o.run.countdown : o.run.time : -1 / 0;
}
function Vd(e, t, r, n, o) {
  let a = e.gridLaunch;
  return !a || a.done ? !1 : a.teleport !== e.car.teleport || e.run.phase === "finished" ? (a.done = !0, !1) : e.stream && e.run.phase === "racing" && (t >= co || e.car.brake > 0 || Math.abs(e.car.steer) > 0.15) ? (a.done = !0, a.visual && (e.stream.visual = a.visual, e.stream.visual.pending = !0), !1) : (o.set(a.quaternion.x, a.quaternion.y, a.quaternion.z, a.quaternion.w), n.set(a.position.x, a.position.y, a.position.z), lo.set(0, 0, -1).applyQuaternion(o), n.addScaledVector(lo, Xo(Math.max(0, Math.min(co, t)), 1)), a.visual = ei(void 0, n, o, r), !0);
}
var ja = "polyrace/friends/1";
function po(e, t, r) {
  for (let n of t.peers) e.clockPings[n.userId] = r, t.sendTo(n.userId, {
    game: ja,
    type: "ping",
    sent: r
  });
}
function Cd(e, t, r, n, o) {
  if (n.game !== ja || !t.peers.some(s => s.userId === r) || n.type !== "ping" && n.type !== "pong") return !1;
  if (typeof n.sent != "number" || !Number.isFinite(n.sent)) return !0;
  if (n.type === "ping") return t.sendTo(r, {
    game: ja,
    type: "pong",
    sent: n.sent,
    remote: o
  }), !0;
  if (e.clockPings[r] !== n.sent || typeof n.remote != "number" || !Number.isFinite(n.remote)) return !0;
  delete e.clockPings[r];
  let a = o - n.sent;
  if (a < 0 || a > 1) return !0;
  let i = e.peerClocks[r],
    l = n.remote - (o + n.sent) / 2;
  return (!i || a <= i.rtt * 1.25 || o - i.received > 5) && (e.peerClocks[r] = {
    offset: l,
    rtt: a,
    received: o
  }), !0;
}
function Ad(e, t) {
  return [...new Set([e, ...t])].slice(0, 4);
}
function ti(e, t) {
  return e.length > 0 && e.length <= 4 && (!t || e.every(r => t[r] === !0));
}
function sn(e) {
  return [...e].sort((t, r) => t.finish !== null || r.finish !== null ? (t.finish ?? 1 / 0) - (r.finish ?? 1 / 0) : +!!t.disconnected - +!!r.disconnected || r.progress - t.progress);
}
function dr(e) {
  if (e.phase !== "results" || e.scoredRound === e.round) return;
  e.scoredRound = e.round;
  let t = sn(e.racers.map(r => ({
    ...r,
    finish: r.run.finishTime,
    progress: r.car.progress
  }))).findIndex(r => r.id === e.selfId && r.finish !== null);
  t >= 0 && (e.score = Math.max(e.score, (4 - t) * 100));
}
function Ra(e) {
  return e.net ??= {
    credit: 0,
    next: 0,
    pending: [],
    queue: [],
    epoch: e.car.teleport,
    step: 1 / 60,
    rebase: {
      x: 0,
      y: 0,
      z: 0
    },
    rebaseRotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 1
    },
    correction: {
      x: 0,
      y: 0,
      z: 0
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 1
    },
    snap: !1
  };
}
var Gr = new br.Vector3(),
  uo = new br.Vector3(),
  ho = new br.Quaternion();
function Ya(e, t, r, n = 0) {
  let o = e.car,
    a = t.frames,
    i = Math.max(2, Math.abs(o.speed)),
    l = Math.min(a.length - 1, o.frameIndex + Math.round(i * 0.42 / G.step) + 4);
  ho.set(o.quat.x, o.quat.y, o.quat.z, o.quat.w).invert();
  let s = a[l];
  Gr.set(s.p.x + s.right.x * n - o.pos.x, s.p.y + s.right.y * n - o.pos.y, s.p.z + s.right.z * n - o.pos.z).applyQuaternion(ho);
  let c = 0;
  for (let d = o.frameIndex; d < Math.min(a.length - 1, o.frameIndex + Math.round(i * 2.4 / G.step)); d++) {
    let h = a[Math.max(0, d - 1)],
      g = a[d + 1];
    uo.crossVectors(h.fwd, g.fwd), c = Math.max(c, Math.abs(uo.dot(h.up)) / Math.max(1e-6, g.dist - h.dist));
  }
  let u = c > 1e-4 ? Math.sqrt(30 / c) : O.topSpeed,
    p = (Gr.x - e.botError) / Math.max(r, 1e-4);
  return e.botError = Gr.x, {
    throttle: i < u * 1.02 ? 1 : 0,
    brake: i > u * 1.16 ? 1 : 0,
    steer: Math.max(-1, Math.min(1, Gr.x * 0.3 + p * 0.04)),
    handbrake: !1,
    airPitch: 0,
    airRoll: 0
  };
}
var It = () => {};
function Id(e, t, r, n = !1) {
  let o = [];
  return {
    prepare(a, i) {
      o = [], a.clock = 0, a.renderTime = -0.15, a.clockOffset = null, a.lastSnapshotTime = -1;
      let l = [...a.seats];
      for (; l.length < 4;) l.push({
        id: `bot:${l.length}`,
        name: `CPU ${l.length + 1}`,
        bot: !0
      });
      a.racers = l.map((s, c) => {
        let u = s.id === a.selfId,
          p = u ? e() : _a({
            multiplayer: {
              phase: "race"
            }
          });
        p.car = cr(), p.run = Mo(), p.ghost.active = !1;
        let d = u ? t : Fo(() => p, {
          countdown: It,
          checkpoint: It,
          boost: It,
          land: It,
          fall: It,
          respawn: It,
          finish: It
        });
        return d.load(a.track), d.setGround(r), d.physics.placeAt(p.car, Ne.startFrame, (c - 1.5) * 2.3), p.ghost.active = !1, i && o.push(d), {
          ...s,
          car: p.car,
          run: p.run,
          input: {
            ...Yt
          },
          inputAge: 0,
          inputSeq: -1,
          botError: 0,
          loaded: s.bot || u,
          disconnected: !1
        };
      }), a.racers.some(s => s.id === a.selfId) && (a.played = !0), a.racers.some(s => s.id === a.selfId) || (e().car = a.racers[0].car, e().run = a.racers[0].run);
    },
    respawn(a, i) {
      let l = a.racers.findIndex(s => s.id === i && !s.disconnected);
      a.phase === "race" && l >= 0 && a.racers[l].run.phase === "racing" && (o[l]?.respawn(), n || (Ra(a.racers[l]).queue = [], Ra(a.racers[l]).credit = 0));
    },
    update(a, i, l) {
      if (a.phase === "loading") {
        if (a.elapsed += i, !a.racers.every(s => s.loaded || s.disconnected) && a.elapsed < 8) return !1;
        for (let s of a.racers) s.loaded || (s.disconnected = !0);
        a.phase = "race", a.elapsed = 0;
      }
      return a.phase !== "race" ? !1 : (a.elapsed += i, a.racers.forEach((s, c) => {
        if (n && s.id !== a.selfId && !(s.bot && a.selfId === a.hostId) || s.disconnected || s.run.phase === "finished") return;
        if (s.inputAge += i, !s.bot && s.id !== a.selfId && s.run.phase === "racing") {
          let p = Ra(s);
          p.credit = Math.min(120, p.credit + 1);
          let d = [],
            h = Math.max(1, s.inputSeq + 1);
          for (; d.length < 4 && d.length < p.credit && p.queue[0]?.seq === h++;) d.push(p.queue.shift());
          let g = s.run.time + i;
          s.run.time = g - d.length * i;
          for (let b of d) {
            let f = s.car.teleport;
            if (o[c].update(i, b.input), p.credit--, s.inputSeq = b.seq, s.input = b.input, s.inputAge = 0, f !== s.car.teleport) {
              p.queue = [], p.credit = 0;
              break;
            }
            if (s.run.finishTime !== null) break;
          }
          s.run.time = g;
          return;
        }
        let u = s.bot ? Ya(s, o[c].path, i) : s.id === a.selfId ? l : Yt;
        n && (s.input = {
          ...u
        }), o[c].update(i, u);
      }), a.finishGrace === null && a.racers.some(s => s.run.finishTime !== null) && (a.finishGrace = 30), a.finishGrace !== null && (a.finishGrace -= i), a.racers.every(s => s.disconnected || s.run.phase === "finished") || a.elapsed >= 180 || a.finishGrace !== null && a.finishGrace <= 0);
    }
  };
}
function Td(e) {
  let t = e.car,
    r = e.run;
  return [t.pos.x, t.pos.y, t.pos.z, t.quat.x, t.quat.y, t.quat.z, t.quat.w, t.speed, t.steer, t.wheelAngle, t.brake, t.boost, t.drift, t.rpm, t.progress, t.frameIndex, r.time, r.countdown, r.checkpoints, r.finishTime ?? -1, r.phase === "countdown" ? 0 : r.phase === "racing" ? 1 : 2, t.grounded ? 1 : 0, t.dirt ? 1 : 0, t.falling, e.disconnected ? 1 : 0, t.throttle, t.gear, t.vel.x, t.vel.y, t.vel.z, t.airTime, t.groundTime, t.lateral, t.slip, t.handbrake ? 1 : 0, ...t.suspension, t.landed, t.bumped, t.teleport, e.inputSeq];
}
function Ed(e) {
  return Array.isArray(e) && e.length === 43 && e.every(t => typeof t == "number" && Number.isFinite(t) && Math.abs(t) < 1e8) && [0, 1, 2].includes(e[20]) && Number.isInteger(e[15]) && Number.isInteger(e[18]) && Number.isSafeInteger(e[41]) && e[41] >= 0 && Number.isSafeInteger(e[42]) && e[42] >= -1;
}
function qd(e, t) {
  let r = e.car,
    n = e.run;
  r.pos = {
    x: t[0],
    y: t[1],
    z: t[2]
  }, r.quat = {
    x: t[3],
    y: t[4],
    z: t[5],
    w: t[6]
  }, r.speed = t[7], r.steer = t[8], r.wheelAngle = t[9], r.brake = t[10], r.boost = t[11], r.drift = t[12], r.rpm = t[13], r.progress = t[14], r.frameIndex = t[15], n.time = t[16], n.countdown = t[17], n.checkpoints = t[18], n.finishTime = t[19] < 0 ? null : t[19], n.phase = t[20] === 0 ? "countdown" : t[20] === 1 ? "racing" : "finished", r.grounded = t[21] === 1, r.dirt = t[22] === 1, r.falling = t[23], e.disconnected = t[24] === 1, r.throttle = t[25], r.gear = t[26], r.vel = {
    x: t[27],
    y: t[28],
    z: t[29]
  }, r.airTime = t[30], r.groundTime = t[31], r.lateral = t[32], r.slip = t[33], r.handbrake = t[34] === 1, r.suspension = t.slice(35, 39), r.landed = t[39], r.bumped = t[40], r.teleport = t[41], e.inputSeq = t[42];
}
var gr = "polyrace/friends/1";
function mo(e) {
  return e.racers.filter(t => !t.disconnected && (t.id === e.selfId || t.bot && e.selfId === e.hostId));
}
function Fd(e, t, r) {
  return {
    game: gr,
    type: "pose",
    round: e.round,
    id: t.id,
    seq: r,
    time: e.clock,
    wall: e.poseWallTime,
    launch: t.run.phase === "countdown" ? {
      countdown: t.run.countdown,
      throttle: t.input.throttle
    } : void 0,
    car: Td(t).map(n => Math.round(n * 1e3) / 1e3)
  };
}
function Rd(e, t, r, n, o) {
  if (n.game !== gr || n.type !== "pose" || n.round !== e.round || !["loading", "race"].includes(e.phase)) return !1;
  let a = e.racers.find(v => v.id === n.id);
  if (!a || a.id === e.selfId || (a.bot ? r !== t.hostUserId : r !== a.id) || !t.peers.some(v => v.userId === r) || !Number.isSafeInteger(n.seq) || n.seq < 0 || typeof n.time != "number" || !Number.isFinite(n.time) || n.time < 0 || n.time > 86400 || !Ed(n.car) || a.stream && (n.seq <= a.stream.seq || n.time <= a.stream.time)) return !1;
  let i = n.car.slice(3, 7).reduce((v, w) => v + w * w, 0);
  if (i < 0.5 || i > 1.5 || n.car[41] < a.car.teleport) return !1;
  let l = a.stream,
    s = e.peerClocks[r],
    c = s && o - s.received < 10 && typeof n.wall == "number" && Number.isFinite(n.wall) ? Math.max(0, Math.min(0.5, o + s.offset - n.wall)) : void 0,
    u = n.launch,
    p = u && Number.isFinite(u.countdown) && u.countdown >= 0 && u.countdown <= 4 && Number.isFinite(u.throttle) && u.throttle >= 0 && u.throttle <= 1,
    d = !l || o - l.received > 0.5,
    h = d ? 1 : l.rate,
    g = d ? n.time : l.anchorTime,
    b = d ? o : l.anchorArrival;
  if (o - b >= 1) {
    let v = Math.max(0.05, Math.min(1.2, (n.time - g) / (o - b)));
    h = h * 0.5 + v * 0.5, g = n.time, b = o;
  }
  a.stream = {
    seq: n.seq,
    time: n.time,
    received: o,
    rate: h,
    anchorTime: g,
    anchorArrival: b,
    age: c,
    launch: p ? {
      ...u
    } : void 0,
    underruns: l?.underruns ?? 0,
    playhead: d ? n.time + (c === void 0 ? -Jo : Math.min(0.25, c) * h) : l.playhead
  };
  let f = a.car.teleport !== n.car[41];
  !f && l?.visual && (a.stream.visual = l.visual, a.stream.visual.pending = !0), (d || f) && (a.timeline = []);
  let y = a.disconnected;
  return qd(a, n.car), a.disconnected = y, wd(a.timeline ??= [], n.time, a.car.pos, a.car.quat, a.run.phase === "finished" ? {
    x: 0,
    y: 0,
    z: 0
  } : a.car.vel, a.car.teleport), !0;
}
function fo(e, t, r, n, o) {
  let a = e.stream;
  if (!a) return !1;
  let i = e.run.phase === "finished" ? 0 : (a.age === void 0 ? yd : 0.25) * a.rate;
  a.visual?.pending && (so(e.timeline ?? [], a.playhead, i, n, o, a.launch), Md(a.visual, n, o));
  let l = a.time + Math.min(0.5, Math.max(0, t - a.received) + (a.age ?? 0)) * a.rate - (a.age === void 0 ? Jo * a.rate : 0),
    s = l - a.playhead - (a.age === void 0 ? 0 : Math.max(0, r) * a.rate),
    c = a.rate * Math.max(0.8, Math.min(1.2, 1 + s * 2)),
    u = a.age !== void 0 && !a.visual ? l : a.playhead + Math.max(0, r) * c;
  return u > a.time + i && a.underruns++, a.playhead = Math.min(a.time + i, u), so(e.timeline ?? [], a.playhead, i, n, o, a.launch) ? (a.visual = ei(a.visual, n, o, r), !0) : !1;
}
function Nd(e, t, r, n, o, a) {
  if (!n || typeof n != "object") return;
  let i = n;
  if (!(i.game !== gr || !t.peers.some(l => l.userId === r)) && !Cd(e, t, r, i, o)) {
    if (i.type === "pose") {
      Rd(e, t, r, i, o);
      return;
    }
    if (t.isHost) {
      if (i.type === "hello") {
        a.sync();
        return;
      }
      if (i.round !== e.round) return;
      if (i.type === "loaded") {
        let l = e.racers.find(s => s.id === r);
        l && (l.loaded = !0);
      }
      return;
    }
    if (r === t.hostUserId) {
      if (i.type === "lobby" || i.type === "prepare") {
        if (!Number.isSafeInteger(i.round) || i.round < e.round || !Number.isInteger(i.track) || i.track < 0 || i.track >= a.trackCount || !Array.isArray(i.seats) || i.seats.length < 1 || i.seats.length > 4) return;
        let l = i.seats;
        if (!l.every(c => c && typeof c.id == "string" && typeof c.name == "string" && c.name.length <= 80 && c.bot === !1) || l[0].id !== t.hostUserId || new Set(l.map(c => c.id)).size !== l.length || i.round === e.round && e.racers.length) return;
        let s = gd(i.championship);
        if (i.championship != null && (!s || Re[s.pack].tracks[s.race] !== i.track)) return;
        e.championship = s, e.round = i.round, e.track = i.track, e.seats = l.map(c => ({
          ...c
        })), e.error = "", i.type === "lobby" ? (e.phase = "lobby", e.racers = [], a.lobby()) : (e.phase = "loading", e.elapsed = 0, e.finishGrace = null, a.prepare(), t.sendTo(t.hostUserId, {
          game: gr,
          type: "loaded",
          round: e.round
        }));
        return;
      }
      if (i.round === e.round) {
        if (i.type === "go" && e.phase === "loading" && (e.phase = "race", e.elapsed = 0, e.startAt = typeof i.startAt == "number" && Number.isFinite(i.startAt) ? i.startAt : null, Array.isArray(i.absent))) for (let l of e.racers) i.absent.includes(l.id) && (l.disconnected = !0);
        if (i.type === "status" && e.phase === "race" && (e.finishGrace = typeof i.grace == "number" && Number.isFinite(i.grace) ? Math.max(0, Math.min(30, i.grace)) : null), i.type === "results" && ["loading", "race"].includes(e.phase) && Array.isArray(i.finishes) && i.finishes.length === e.racers.length) {
          let l = i.finishes;
          if (!l.every((s, c) => Array.isArray(s) && s.length === 3 && s[0] === e.racers[c].id && (s[1] === null || typeof s[1] == "number" && Number.isFinite(s[1]) && s[1] >= 0 && s[1] < 86400) && typeof s[2] == "boolean")) return;
          l.forEach((s, c) => {
            e.racers[c].run.finishTime = s[1], e.racers[c].disconnected = s[2];
          }), e.phase = "results", dr(e), Yo(e);
        }
      }
    }
  }
}
var ri = [15973208, 6346478, 11769328, 8509337];
function Ld(e) {
  let t = ur(),
    r = ur(),
    n = new Zt.Vector3(),
    o = new Zt.Vector3(),
    a = new Zt.Vector3(),
    i = new Zt.Quaternion();
  return (l, s, c) => {
    let u = e();
    if (!u || !l.car.grounded || (n.set(l.car.pos.x, l.car.pos.y, l.car.pos.z), u.sample(n, l.car.frameIndex, t), !t.grounded || Math.abs(t.frameIndex - l.car.frameIndex) > 48)) return !1;
    o.copy(s);
    for (let p = 0; p < 4; p++) {
      if (u.sample(o, t.frameIndex, r), !r.found || Math.abs(r.frameIndex - t.frameIndex) > 48 || Math.abs(r.lateral) > r.driveHalfWidth + G.overhang || Math.abs(r.height - O.rideHeight) > 6) return !1;
      o.addScaledVector(r.normal, O.rideHeight - r.height);
    }
    return s.copy(o), a.set(0, 1, 0).applyQuaternion(c).normalize(), i.setFromUnitVectors(a, r.normal), c.premultiply(i).normalize(), !0;
  };
}
function Pd(e, t = () => {}) {
  let r = ri.map(s => {
      let c = en({
        body: s,
        accent: 1516342
      });
      return c.group.visible = !1, e.add(c.group), c;
    }),
    n = Ld(t),
    o = r.map(() => aa()),
    a = new ca.Vector3(),
    i = new ca.Quaternion(),
    l = (s, c, u, p, d, h) => {
      let g = c.phase === "race" && Vd(s, zd(c, u), p, d, h),
        b = g;
      if (g ? fo(s, u, p, a, i) : b = fo(s, u, p, d, h), b && n(s, d, h)) {
        let f = g ? s.gridLaunch?.visual : s.stream?.visual;
        f && (f.position = {
          x: d.x,
          y: d.y,
          z: d.z
        }, f.quaternion = {
          x: h.x,
          y: h.y,
          z: h.z,
          w: h.w
        });
      }
      return b;
    };
  return {
    push(s) {
      s.racers.forEach((c, u) => {
        c.bot && s.selfId === s.hostId && o[u].push(c.car.pos, c.car.quat, c.car.teleport);
      });
    },
    update(s, c, u, p, d, h) {
      let g = s.racers.find(f => f.id === s.selfId),
        b = g ?? s.racers[0];
      for (let f = 0; f < r.length; f++) {
        let y = r[f],
          v = s.racers[f];
        y.group.visible = !!v && s.open && !["off", "lobby"].includes(s.phase) && v !== b && !v.disconnected, !(!v || !y.group.visible) && (v.bot && s.selfId === s.hostId ? (o[f].sample(h), y.group.position.copy(o[f].position), y.group.quaternion.copy(o[f].quaternion)) : l(v, s, c, u, y.group.position, y.group.quaternion) || (y.group.position.set(v.car.pos.x, v.car.pos.y, v.car.pos.z), y.group.quaternion.set(v.car.quat.x, v.car.quat.y, v.car.quat.z, v.car.quat.w)), y.update(v.car));
      }
      !g && b && l(b, s, c, u, p, d);
    },
    reset() {
      for (let s of r) s.group.visible = !1;
      for (let s of o) s.reset();
    }
  };
}
var Dd = `
.prv-online-board[hidden],.prv-online-finish[hidden],.prv-online-board [hidden],.prv-online-finish [hidden]{display:none!important}
.prv-online-board,.prv-online-finish{display:block;font-style:normal;letter-spacing:normal;box-sizing:border-box;color:#f1f4ff;background:#101b36ef;border:1px solid #586f9a;border-top:3px solid #ffe06b;border-radius:8px;box-shadow:0 12px 32px #03091466;font-family:var(--prv-font,Arial,sans-serif);pointer-events:auto}
.prv-online-board{width:calc(270px * var(--prv-scale));max-width:42vw;padding:calc(12px * var(--prv-scale))}
.prv-online-eyebrow{font-size:calc(11px * var(--prv-scale));font-weight:800;letter-spacing:.15em;color:#aebfdc;margin-bottom:calc(8px * var(--prv-scale))}
.prv-online-row{display:grid;grid-template-columns:2em minmax(0,1fr) auto;align-items:center;gap:calc(8px * var(--prv-scale));padding:calc(8px * var(--prv-scale)) 0;border-top:1px solid #afc5ff22;font-size:calc(13px * var(--prv-scale))}
.prv-online-row[data-self=true]{color:#ffe06b}
.prv-online-place{font-weight:900;font-style:italic;color:#94a9cf}
.prv-online-name{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-weight:700}
.prv-online-time{font-family:var(--prv-mono,monospace);font-variant-numeric:tabular-nums;white-space:nowrap}
.prv-online-notice{color:#b5c5df;font-size:calc(11px * var(--prv-scale));line-height:1.4}
.prv-online-board button,.prv-online-finish button{font:inherit;font-size:calc(12px * var(--prv-scale));color:#d5e1f7;background:#253856;border:1px solid #5e7599;border-radius:4px;padding:calc(7px * var(--prv-scale)) calc(10px * var(--prv-scale));cursor:pointer}
.prv-online-board button{margin-top:calc(7px * var(--prv-scale))}
.prv-online-finish{width:calc(500px * var(--prv-scale));max-width:88vw;max-height:82vh;overflow:auto;padding:calc(25px * var(--prv-scale))}
.prv-online-finish h2{margin:0;font-size:calc(36px * var(--prv-scale));font-style:italic;line-height:1.1;letter-spacing:-.03em}
.prv-online-personal{font:700 calc(40px * var(--prv-scale))/1.3 var(--prv-mono,monospace);color:#ffe06b;margin-top:calc(9px * var(--prv-scale));font-variant-numeric:tabular-nums}
.prv-online-status,.prv-online-footer{color:#afbfda;font-size:calc(13px * var(--prv-scale));line-height:1.5;margin:calc(10px * var(--prv-scale)) 0}
.prv-online-finish .prv-online-row{font-size:calc(16px * var(--prv-scale));padding:calc(12px * var(--prv-scale)) 0}
.prv-online-actions{display:flex;gap:10px;margin-top:calc(18px * var(--prv-scale))}
.prv-online-finish button{font-size:calc(14px * var(--prv-scale))}
.prv-online-finish button:first-child:not([hidden]){background:#ffe06b;border-color:#ffe06b;color:#14213a;font-weight:800}
.prv-online-board button:focus-visible,.prv-online-finish button:focus-visible{outline:2px solid #fff;outline-offset:3px}
`;
var Hd = `
.prv-lobby[hidden],.prv-lobby [hidden],.prv-mp-status[hidden],.prv-mp-count[hidden] { display:none !important; }
.prv-lobby { pointer-events:auto; width:calc(570px * var(--prv-scale)); max-width:88vw; box-sizing:border-box; padding:calc(20px * var(--prv-scale)); background:linear-gradient(135deg,#18212deb,#080e18f5); border:1px solid #647284; border-top:4px solid #f2bc60; box-shadow:0 18px 80px #0009; color:#f5f5f0; font-family:Arial,sans-serif; max-height:82vh; overflow:auto; }
.prv-lobby h2 { margin:0 0 8px; font-size:calc(30px * var(--prv-scale)); font-style:italic; letter-spacing:.04em; }
.prv-lobby[data-selecting="false"] { display:grid; grid-template-columns:minmax(0,1fr) auto; }
.prv-lobby[data-selecting="false"]>* { grid-column:1 / -1; }
.prv-lobby[data-selecting="false"]>h2 { grid-column:1; grid-row:1; align-self:center; }
.prv-lobby[data-selecting="false"]>button.prv-lobby-close { grid-column:2; grid-row:1; align-self:start; background:transparent; border-color:transparent; font-style:normal; font-size:calc(30px * var(--prv-scale)); line-height:1; padding:calc(5px * var(--prv-scale)); }
.prv-lobby p { font-size:calc(15px * var(--prv-scale)); line-height:1.5; color:#c6d1de; margin:6px 0 12px; }
.prv-lobby-code { color:#f2bc60; font-size:calc(20px * var(--prv-scale)); font-weight:bold; letter-spacing:.12em; user-select:text; }
.prv-lobby-row { display:flex; justify-content:space-between; gap:12px; padding:calc(9px * var(--prv-scale)); background:#ffffff08; border-bottom:1px solid #ffffff17; font-size:calc(16px * var(--prv-scale)); }
.prv-lobby-actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; }
.prv-lobby button,.prv-lobby input,.prv-lobby select { font:inherit; font-size:calc(16px * var(--prv-scale)); padding:calc(9px * var(--prv-scale)); min-width:0; border:1px solid #768493; background:#172332; color:#fff; border-radius:3px; }
.prv-lobby button { cursor:pointer; font-weight:bold; }
.prv-lobby button[data-primary] { background:#f2bc60; color:#101722; border-color:#f2bc60; }
.prv-lobby button.prv-lobby-start { width:100%; padding:calc(17px * var(--prv-scale)); font-size:calc(24px * var(--prv-scale)); text-transform:uppercase; }
.prv-lobby button.prv-lobby-invite { width:100%; }
.prv-lobby button:disabled { opacity:.4; cursor:default; }
.prv-lobby input { width:9em; text-transform:uppercase; user-select:text; }
.prv-lobby select { width:100%; margin:14px 0; }
.prv-lobby-error { color:#ffbcac !important; }
.prv-mp-status { background:#101925ed; border-left:3px solid #f2bc60; padding:calc(9px * var(--prv-scale)); color:white; font:calc(15px * var(--prv-scale))/1.5 Arial,sans-serif; max-width:80vw; pointer-events:auto; }
.prv-mp-status button { background:#26354a; border:1px solid #758396; color:white; padding:8px; cursor:pointer; margin-top:8px; }
.prv-mp-count { color:#fff; font:italic bold calc(90px * var(--prv-scale)) Arial,sans-serif; text-shadow:0 4px 25px #000; }
`,
  Wd = `
.prv-lobby[data-selecting="true"] { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:0; width:calc(1020px * var(--prv-scale)); max-width:92vw; }
.prv-lobby[data-selecting="true"]>* { grid-column:1 / -1; }
.prv-lobby[data-selecting="true"]>h2 { grid-column:1; grid-row:1; align-self:center; margin-right:16px; }
.prv-lobby[data-selecting="true"]>.prv-lobby-error:empty { display:none; }
.prv-lobby[data-selecting="true"]>button { grid-column:2; grid-row:1; align-self:start; }
.prv-cups { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:calc(16px * var(--prv-scale)); margin:calc(14px * var(--prv-scale)) 0; }
.prv-cups .prv-cup { display:block; padding:0; overflow:hidden; text-align:left; background:#152234; border:1px solid #516078; border-radius:8px; transition:transform .18s,border-color .18s,box-shadow .18s; }
.prv-cup:not(:disabled):hover { transform:translateY(-5px); border-color:var(--cup-accent); box-shadow:0 10px 25px #0006; }
.prv-cup:focus-visible { outline:3px solid var(--cup-accent); outline-offset:4px; }
.prv-cup-art { display:block; position:relative; }
.prv-cup-art svg { display:block; width:100%; height:calc(125px * var(--prv-scale)); }
.prv-cup-tag { position:absolute; top:12px; left:12px; padding:5px 7px; background:#111e30db; color:var(--cup-accent); font:700 calc(10px * var(--prv-scale))/1.2 Arial,sans-serif; letter-spacing:.12em; }
.prv-cup-body { display:block; padding:calc(14px * var(--prv-scale)); }
.prv-cup-name { display:block; color:var(--cup-accent); font:italic 900 calc(29px * var(--prv-scale))/1.1 Arial,sans-serif; text-transform:uppercase; letter-spacing:-.04em; }
.prv-cup-description { display:block; margin:8px 0 12px; color:#bac9db; font:400 calc(13px * var(--prv-scale))/1.45 Arial,sans-serif; }
.prv-cup-tracks { display:grid; gap:6px; font:600 calc(14px * var(--prv-scale))/1.3 Arial,sans-serif; }
.prv-cup-tracks>span { display:flex; align-items:center; gap:10px; }
.prv-cup-tracks b { color:var(--cup-accent); font:calc(11px * var(--prv-scale)) monospace; border:1px solid #526078; padding:3px 5px; }
.prv-cup-cta { display:flex; justify-content:space-between; margin-top:12px; padding-top:10px; border-top:1px solid #ffffff25; color:var(--cup-accent); font-size:calc(14px * var(--prv-scale)); }
@media(max-width:650px) { .prv-cups { grid-template-columns:1fr; } .prv-cup-art svg { max-height:150px; object-fit:cover; } }
@media(prefers-reduced-motion:reduce) { .prv-cups .prv-cup { transition:none; } }
`,
  Bd = [{
    color: "#91e9b0",
    sky: "#244e49",
    land: "#396b50",
    tag: "OPEN ROADS",
    description: "Find your line. Carry your speed.",
    path: "M -20 153 C 80 158 45 80 130 100 S 220 155 220 98 S 175 35 335 36"
  }, {
    color: "#cfb3ff",
    sky: "#383463",
    land: "#545079",
    tag: "DEFY GRAVITY",
    description: "Take on loops, walls and big air.",
    path: "M -20 147 L 97 147 C 208 147 213 26 150 26 C 81 26 86 147 195 147 L 340 116"
  }, {
    color: "#ffbf78",
    sky: "#63413d",
    land: "#956048",
    tag: "FULL COMMITMENT",
    description: "Link the drifts. Chase the limit.",
    path: "M -20 153 L 181 153 Q 275 153 244 108 Q 233 94 187 94 L 99 94 Q 29 94 61 56 Q 75 40 134 40 L 340 40"
  }];
function Qd(e, t) {
  let r = document.createElement("style");
  r.textContent = Wd, document.head.append(r);
  let n = document.createElement("div");
  n.className = "prv-cups", e.append(n);
  let o = Re.map((a, i) => {
    let l = Bd[i],
      s = document.createElement("button");
    return s.type = "button", s.className = "prv-cup", s.style.setProperty("--cup-accent", l.color), s.setAttribute("aria-label", `Choose ${a.name}: ${a.tracks.map(c => fe[c].name).join(", ")}`), s.innerHTML = `<span class="prv-cup-art"><svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="320" height="180" fill="${l.sky}"/>
      <path d="M0 95 60 30 125 105 209 8 320 89V180H0Z" fill="${l.land}"/>
      <path d="m209 8-32 38 32-12 30 13Z" fill="${l.color}" opacity=".4"/>
      <path d="${l.path}" fill="none" stroke="#111e30" stroke-width="30" transform="translate(0 9)"/>
      <path d="${l.path}" fill="none" stroke="${l.color}" stroke-width="28"/>
      <path d="${l.path}" fill="none" stroke="#283449" stroke-width="21"/>
      <path d="${l.path}" fill="none" stroke="#f4f6ff" stroke-width="2" stroke-dasharray="10 9"/>
    </svg><span class="prv-cup-tag">${l.tag}</span></span>
    <span class="prv-cup-body"><strong class="prv-cup-name">${a.name}</strong>
    <span class="prv-cup-description">${l.description}</span>
    <span class="prv-cup-tracks">${a.tracks.map((c, u) => `<span><b>${u + 1}</b>${fe[c].name}</span>`).join("")}</span>
    <span class="prv-cup-cta">Choose cup <span aria-hidden="true">\u2197</span></span></span>`, s.onclick = () => t(i), n.append(s), s;
  });
  return {
    update(a, i) {
      n.hidden = !a, o.forEach(l => {
        l.disabled = i;
      });
    }
  };
}
var mt = [{
    track: "loop-1",
    feature: "loop",
    leadIn: 70,
    duration: 3,
    speed: 50,
    lane: 1.6,
    boost: 1.35,
    camera: "far",
    title: "Loop Station",
    tag: "Loop the loop",
    ghosts: [{
      offset: 12,
      lane: -1.8,
      speed: 46
    }, {
      offset: 22,
      lane: 0.2,
      speed: 44
    }]
  }, {
    track: "wall-1",
    feature: "wall",
    leadIn: 30,
    duration: 3,
    speed: 52,
    lane: -1.2,
    camera: "chase",
    title: "Wall Runner",
    tag: "Ride the wall",
    ghosts: [{
      offset: 8,
      lane: 2,
      speed: 48
    }, {
      offset: -8,
      lane: 1.6,
      speed: 60,
      boost: 1.35
    }]
  }, {
    track: "desert-1",
    feature: "gap",
    leadIn: 58,
    duration: 3,
    speed: 54,
    lane: 1.4,
    boost: 1.35,
    camera: "far",
    title: "Dune Sprint",
    tag: "Send it",
    ghosts: [{
      offset: 10,
      lane: -1.8,
      speed: 50
    }, {
      offset: 3,
      lane: -0.2,
      speed: 52
    }]
  }, {
    track: "drift-spiral",
    feature: "spiral",
    leadIn: 12,
    duration: 3,
    speed: 40,
    lane: -1.8,
    boost: 1.35,
    camera: "chase",
    title: "Drift Valley",
    tag: "Climb the tower",
    ghosts: [{
      offset: 9,
      lane: 1.8,
      speed: 36
    }, {
      offset: 3,
      lane: 2.8,
      speed: 38
    }]
  }, {
    track: "velocity",
    feature: "corkscrew",
    leadIn: 34,
    duration: 3,
    speed: 54,
    lane: 1.2,
    boost: 0.4,
    camera: "chase",
    title: "Velocity",
    tag: "Corkscrew",
    ghosts: [{
      offset: 11,
      lane: -1.6,
      speed: 52
    }, {
      offset: -6,
      lane: -0.4,
      speed: 56
    }]
  }],
  go = mt.reduce((e, t) => e + t.duration, 0),
  jd = [14087935, 16769704, 15976703],
  vo = 0.12,
  bo = 0.32,
  wo = 1.7;
function Yd(e) {
  let {
      getState: t,
      race: r
    } = e,
    n = jd.map(p => {
      let d = Po({
        tint: p
      });
      return d.group.visible = !1, e.scene.add(d.group), {
        car: d,
        pose: aa()
      };
    }),
    o = [],
    a = {
      car: cr(),
      botError: 0
    },
    i = {
      flash: 0,
      title: "",
      tag: "",
      titleAlpha: 0,
      endAlpha: 0
    },
    l = (p, d) => {
      let h = p.features.filter(b => b.t === d.feature),
        g = h[Math.min(h.length - 1, d.nth ?? 0)];
      return g ? g.start : Math.round(p.frames.length / 3);
    },
    s = (p, d, h, g, b, f, y = 0) => {
      p.placeAt(h, g, b);
      let v = d.frames[Math.max(0, Math.min(d.frames.length - 1, g))];
      h.vel = {
        x: v.fwd.x * f,
        y: v.fwd.y * f,
        z: v.fwd.z * f
      }, h.speed = f, h.boost = y, h.throttle = 1, h.rpm = 0.8;
    },
    c = p => {
      let d = t(),
        h = d.trailer,
        g = mt[p];
      h.shot = p, h.shotTime = 0, e.loadTrack(Math.max(0, fe.findIndex(y => y.id === g.track)));
      let b = r.path,
        f = l(b, g) - Math.round(g.leadIn / G.step);
      d.ui.screen = "race", d.ui.watching = !1, d.ghost.active = !1, d.run.phase = "racing", h.player = {
        botError: 0,
        lane: g.lane
      }, s(r.physics, b, d.car, f, g.lane, g.speed, g.boost), o = g.ghosts.map(() => Wa(r.surface, ur(), () => e.ground)), h.ghosts = g.ghosts.map((y, v) => {
        let w = cr();
        return s(o[v], b, w, f + Math.round(y.offset / G.step), y.lane, y.speed, y.boost), {
          car: w,
          botError: 0,
          lane: y.lane
        };
      });
      for (let y of n) y.pose.reset();
      e.framed(g.camera);
    },
    u = {
      get active() {
        return t().trailer.active;
      },
      start(p = 0) {
        let d = t(),
          h = Math.max(0, Math.min(mt.length - 1, p));
        d.trailer.time = mt.slice(0, h).reduce((g, b) => g + b.duration, 0), d.trailer.active || (d.trailer.returnTrack = d.ui.trackIndex), d.trailer.active = !0, c(h);
      },
      stop() {
        let p = t().trailer;
        if (p.active) {
          p.active = !1, p.ghosts = [];
          for (let d of n) d.car.group.visible = !1;
          e.ended(p.returnTrack);
        }
      },
      update(p) {
        let d = t(),
          h = d.trailer;
        if (!h.active) return;
        let g = mt[h.shot];
        if (!g) return u.stop();
        if (h.time += p, h.shotTime += p, h.shotTime >= g.duration) return h.shot + 1 >= mt.length ? u.stop() : c(h.shot + 1);
        let b = r.path,
          f = d.car,
          y = f.boost;
        a.car = f, a.botError = h.player.botError;
        let v = Ya(a, b, p, h.player.lane);
        h.player.botError = a.botError, r.physics.step(f, v, p), f.boost > y && y <= 0 && e.boost(), f.landed > O.hardLanding * 0.55 && e.land(f.landed), h.ghosts.forEach((w, k) => {
          let x = o[k];
          x && x.step(w.car, Ya(w, b, p, w.lane), p);
        });
      },
      render(p) {
        let d = t().trailer,
          h = mt[d.shot];
        if (n.forEach((y, v) => {
          let w = d.active ? d.ghosts[v] : void 0;
          y.car.group.visible = !!w, w && (y.pose.push(w.car.pos, w.car.quat, w.car.teleport), y.pose.sample(p), y.car.group.position.copy(y.pose.position), y.car.group.quaternion.copy(y.pose.quaternion), y.car.update({
            ...w.car,
            boost: Math.min(1, w.car.boost / O.boostDuration)
          }));
        }), !d.active || !h) return i.flash = i.titleAlpha = i.endAlpha = 0, i;
        let g = d.shot === mt.length - 1,
          b = d.shotTime < bo ? 1 - d.shotTime / bo : 0,
          f = g ? 0 : Math.max(0, (d.shotTime - (h.duration - vo)) / vo);
        return i.flash = Math.max(b * b, f), i.title = h.title, i.tag = h.tag, i.titleAlpha = Na(d.shotTime, 0.2, 0.45) * (1 - Na(d.shotTime, h.duration - 0.35, h.duration - 0.1)), i.endAlpha = Na(d.time, go - wo, go - wo + 0.4), g && (i.titleAlpha *= 1 - i.endAlpha), i;
      }
    };
  return u;
}
var Na = (e, t, r) => Math.max(0, Math.min(1, (e - t) / (r - t))),
  Kd = `
.prv-trailer-flash{position:fixed;inset:0;background:#fff;pointer-events:none;opacity:0;z-index:50}
.prv-trailer-title{pointer-events:none;font-family:var(--prv-font,system-ui,sans-serif);color:#fff;
  margin:0 0 calc(40px * var(--rx-hud-scale,1)) calc(44px * var(--rx-hud-scale,1));
  text-shadow:0 calc(3px * var(--rx-hud-scale,1)) calc(14px * var(--rx-hud-scale,1)) rgba(4,8,24,.55)}
.prv-trailer-tag{white-space:nowrap;font-size:calc(20px * var(--rx-hud-scale,1));font-weight:700;letter-spacing:.24em;
  text-transform:uppercase;color:#ffc22e}
.prv-trailer-name{font-size:calc(54px * var(--rx-hud-scale,1));font-weight:900;font-style:italic;
  letter-spacing:.02em;text-transform:uppercase;line-height:1;white-space:nowrap}
.prv-trailer-end{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  pointer-events:none;opacity:0;z-index:45;text-align:center;font-family:var(--prv-font,system-ui,sans-serif);color:#fff;
  text-shadow:0 .5vmin 3vmin rgba(4,8,24,.6)}
.prv-trailer-logo{font-size:min(11vw,19vh);font-weight:900;font-style:italic;
  letter-spacing:.02em;line-height:1;white-space:nowrap}
.prv-trailer-logo span{color:#ffc22e}
.prv-trailer-line{margin-top:1.6vmin;font-size:min(2.3vw,4vh);white-space:nowrap;
  font-weight:700;letter-spacing:.3em;text-transform:uppercase}
.prv-trailer-scrim{position:fixed;inset:0;pointer-events:none;opacity:0;z-index:40;
  background:radial-gradient(ellipse at center,rgba(10,16,48,.35),rgba(10,16,48,.8))}
`;
function _d(e) {
  let t = document.createElement("style");
  t.textContent = Kd, document.head.appendChild(t);
  let r = pt("div", "prv-trailer-scrim", document.body),
    n = pt("div", "prv-trailer-flash", document.body),
    o = pt("div", "prv-trailer-title", e.hud.layer("bottom-left")),
    a = pt("div", "prv-trailer-tag", o),
    i = pt("div", "prv-trailer-name", o),
    l = pt("div", "prv-trailer-end", document.body),
    s = pt("div", "prv-trailer-logo", l);
  s.innerHTML = "POLY<span>RACE</span>", pt("div", "prv-trailer-line", l).textContent = "Chase the perfect drift";
  let c = new Map(),
    u = (d, h, g) => {
      let b = h + g;
      c.get(d) !== b && (c.set(d, b), h === "text" ? d.textContent = g : d.style.opacity = g);
    },
    p = {
      update(d) {
        u(n, "opacity", d.flash.toFixed(3)), u(r, "opacity", d.endAlpha.toFixed(3)), u(o, "opacity", d.titleAlpha.toFixed(3)), u(l, "opacity", d.endAlpha.toFixed(3)), u(a, "text", d.tag), u(i, "text", d.title);
      },
      setVisible(d) {
        for (let h of [r, n, o, l]) h.style.display = d ? "" : "none";
      }
    };
  return p.setVisible(!1), p;
}
function pt(e, t, r) {
  let n = document.createElement(e);
  return n.className = t, r.appendChild(n), n;
}
var ai = {
    current: _a({
      records: mi(),
      stats: ki()
    })
  },
  J = () => ai.current,
  ut = Ii(),
  ye = Jl(),
  $t = Ll(),
  $r = Wl(),
  xo = Vi(),
  Et = cr(),
  Xr = ur(),
  et = null,
  _ = null,
  ne = null,
  jr = null,
  Ce = null,
  or = null,
  jt = null;
window.addEventListener("remix:trailer-start", e => {
  e.preventDefault(), jt = "start";
});
window.addEventListener("keydown", e => {
  e.code === "Escape" && Ce?.active && (jt = "stop");
});
var ft = null,
  Ue = null,
  Tt = null,
  La = null,
  ea = () => {
    void 0, La === null && (La = setTimeout(() => {
      La = null, void 0;
    }, 0));
  },
  qe = Fo(J, {
    activity: (e, t) => {
      document.hidden || (void 0, ft?.addDistance(t));
    },
    countdown: e => ye.countdownBeep(e <= 0),
    checkpoint: e => {
      ye.checkpoint(), $e.shake(0.1), ze?.setCheckpointsTaken(e);
    },
    boost: () => {
      ye.boostPad(), $e.shake(0.16);
    },
    land: e => {
      let t = Math.min(1, e / (O.hardLanding * 2));
      ye.land(t), $e.shake(0.12 + t * 0.28), _ && $t.emitSparks(_.carPosition, qe.contact.normal, 4 + Math.round(t * 10));
    },
    fall: () => {
      ye.crash(0.7), $e.shake(0.4), _?.resetTrail();
    },
    respawn: () => {
      ye.respawn(), _?.resetTrail();
    },
    finish: (e, t, r) => {
      document.hidden || void 0, ft?.finish(r), ea(), J().multiplayer.phase === "off" && (ye.finish(t), _ && $t.emitConfetti(_.carPosition, 110), $e.shake(0.22), ne?.showResults(e, t));
    }
  }),
  yo = {
    get position() {
      return _ ? _.carPosition : Ka;
    },
    get quaternion() {
      return _ ? _.carQuaternion : Jd;
    }
  },
  qt = Ji(() => J().ui.watching ? {
    car: Et,
    contact: Xr,
    pose: _ ? yo : void 0
  } : {
    car: J().car,
    contact: qe.contact,
    pose: _ ? yo : void 0
  }, "chase"),
  $e = Ci(qt, {
    maxOffset: 0.42,
    maxRoll: 0.035,
    decay: 2.1
  }),
  Zd = {
    camera: $e.camera,
    resize: e => $e.resize(e),
    update: () => {}
  },
  ze = null,
  Pa = null,
  Ka = new oa.Vector3(),
  Jd = new oa.Quaternion(),
  Xd = {
    throttle: 0,
    brake: 0,
    steer: 0,
    handbrake: !1,
    airPitch: 0,
    airRoll: 0
  };
await zi({
  design: {
    width: 1280,
    height: 720
  },
  camera: Zd,
  background: 10473727,
  assets: $l,
  maxPixelRatio: 2,
  setup(e) {
    let t = {
      getItem: s => window.localStorage.getItem(s),
      setItem: (s, c) => window.localStorage.setItem(s, c)
    };
    Ue = void 0, ft = Si(e.platform.achievements, J), ft.checkSaved(), window.addEventListener("pagehide", () => ft?.checkpoint());
    let r = 0;
    setInterval(() => {
      void 0, ft?.checkpoint(), Date.now() - r >= 3e4 && (r = Date.now(), void 0);
    }, 1e3), window.addEventListener("pagehide", () => void 0), document.addEventListener("visibilitychange", () => {
      document.hidden && ea();
    }), ze = Sl(e), e.scene.add($t.group), e.scene.add($r.group);
    let n = nd(e, {
        onExit: () => ne?.openMenu(),
        onRestart: () => ne?.restartRun(),
        onNextTrack: () => ne?.loadTrack(J().ui.trackIndex + 1),
        onToggleGhost: () => ne?.toggleGhost(),
        onWatch: () => ne?.toggleWatch()
      }),
      o = dd(e, {
        onSelect: s => {
          J().ui.menuIndex = s, ye.click(!0);
        },
        onPlay: s => ne?.startTrack(s)
      });
    Tt = void 0;
    let a = fd(e, {
        onRetry: () => ne?.restartRun(),
        onNext: () => ne?.loadTrack(J().ui.trackIndex + 1),
        onMenu: () => ne?.openMenu()
      }),
      i = Ql({
        getState: J,
        race: qe,
        scene: ze,
        particles: $t,
        skid: $r,
        watchCar: Et,
        watchContact: Xr
      });
    _ = i, ne = Ul({
      game: e,
      getState: J,
      race: qe,
      chase: qt,
      audio: ye,
      scene: ze,
      hud: n,
      menu: o,
      results: a,
      watchCar: Et,
      watchContact: Xr,
      beforeTransition: ea,
      resetTrail: () => i.resetTrail(),
      applyCarPose: () => i.applyCarPose(),
      applyWatchPose: () => i.applyWatchPose()
    }), jr = Gl(J, ut, qe, ne, ye, () => a.visible), or = _d(e), Ce = Yd({
      getState: J,
      race: qe,
      scene: e.scene,
      ground: (s, c) => ze?.groundHeightAt(s, c) ?? -1 / 0,
      loadTrack: s => ne?.loadTrack(s, !1),
      framed: s => {
        o.setVisible(!1), n.setVisible(!1), a.hide(), ze && (ze.car.group.visible = !0), qt.setOrbit(!1), qt.setMode(s), i.resetTrail(), i.applyCarPose(), qt.snap(), or?.setVisible(!0), document.body.style.cursor = "none";
      },
      ended: s => {
        or?.setVisible(!1), document.body.style.cursor = "", ut.reset(), qt.setMode(J().ui.camera), ne?.loadTrack(s, !1), ne?.openMenu(), window.dispatchEvent(new Event("remix:trailer-end"));
      },
      boost: () => {
        ye.boostPad(), $e.shake(0.16);
      },
      land: s => {
        let c = Math.min(1, s / (O.hardLanding * 2));
        ye.land(c), $e.shake(0.12 + c * 0.28), $t.emitSparks(i.carPosition, qe.contact.normal, 4 + Math.round(c * 10));
      }
    }), Pa = n, qt.setMode(J().ui.camera), J().trailer.active && Ce.start(J().trailer.shot);
    let l = J().ui.screen === "race";
    J().trailer.active || (ne.loadTrack(J().ui.trackIndex, l, l), l || ne.openMenu()), e.platform.player?.id && void 0, et = void 0;
  },
  restart(e) {
    Ce?.stop(), ea(), false && void 0, void 0, ai.current = _a({
      records: J().records,
      stats: J().stats
    }), xo.cancelAll(), ye.reset(), ut.reset(), ne?.loadTrack(0, !1), ne?.openMenu();
  },
  update(e, t) {
    if (!e.running) return;
    let r = J();
    xo.update(t), jt && Ce && (Ce.active && jt === "stop" && Ce.stop(), jt === "start" && !false && (false && void 0, Ce.start()), jt = null);
    let n = Ce?.active === !0;
    !false && !false && !n && jr?.update(), void 0, e.running && (ut.touched && ye.unlock(e), n ? (Ce?.update(t), Ce?.active && (_?.applyCarPose(), _?.driveEffects(t))) : false ? (_?.applyCarPose(), r.multiplayer.phase === "race" && r.multiplayer.racers.some(o => o.id === r.multiplayer.selfId) && _?.driveEffects(t)) : r.ui.screen === "race" && r.ui.watching ? qe.watch(t, Et, Xr) ? _?.applyWatchPose() : ne?.stopWatching() : r.ui.screen === "race" ? (qe.update(t, jr ? jr.input : Xd), ft?.observe(t), _?.applyCarPose(), _?.driveEffects(t)) : (_?.applyCarPose(), $r.lift()), Pa && _ && Pa.update(_.hudValues()), $t.update(t), $r.update(t), ye.update(e, t, {
      rpm: r.ui.watching ? Et.rpm : r.car.rpm,
      speed: Math.abs(r.ui.watching ? Et.speed : r.car.speed),
      throttle: r.ui.watching ? 1 : r.car.throttle,
      drift: r.ui.watching ? 0 : r.car.drift,
      grounded: r.ui.watching ? Et.grounded : r.car.grounded,
      boost: r.ui.watching ? 0 : r.car.boost,
      racing: r.ui.screen === "race" && (r.ui.watching || r.run.phase === "racing")
    }), ut.endStep());
  },
  render(e, t, r) {
    !ze || !_ || (_.interpolate(r), void 0, false && (ze.car.group.position.copy(_.carPosition), ze.car.group.quaternion.copy(_.carQuaternion), ze.car.update(J().car)), $e.update(t), Ce && or && or.update(Ce.render(r)), Ka.copy(e.camera.position), ze.update(t, Ka, _.carPosition));
  }
});